import type { Graph, NodeRegistry, NodeType, RuntimeExecutor } from "@nodes/types";
import { encodeFloat } from "./helpers/encode";
import { concat_encoded, encode } from "./helpers/flat_tree";
import fastHash from "./helpers/fastHash";


async function hashIntArray(arr: Int32Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arr.buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
}


export class MemoryRuntimeExecutor implements RuntimeExecutor {

  private typeMap: Map<string, NodeType> = new Map();

  private cache: Record<string, { eol: number, value: any }> = {};

  constructor(private registry: NodeRegistry) { }

  private getNodeTypes(graph: Graph) {

    if (this.registry.status !== "ready") {
      throw new Error("Node registry is not ready");
    }

    const typeMap = new Map<string, NodeType>();
    for (const node of graph.nodes) {
      if (!typeMap.has(node.type)) {
        const type = this.registry.getNode(node.type);
        if (type) {
          typeMap.set(node.type, type);
        }
      }
    }
    return typeMap;
  }

  private addMetaData(graph: Graph) {

    // First, lets check if all nodes have a type
    this.typeMap = this.getNodeTypes(graph);

    const outputNode = graph.nodes.find(node => node.type.endsWith("/output"));
    if (!outputNode) {
      throw new Error("No output node found");
    }
    outputNode.tmp = outputNode.tmp || {};
    outputNode.tmp.depth = 0;

    const nodeMap = new Map(graph.nodes.map(node => [node.id, node]));

    // loop through all edges and assign the parent and child nodes to each node
    for (const edge of graph.edges) {
      const [parentId, _parentOutput, childId, childInput] = edge;
      const parent = nodeMap.get(parentId);
      const child = nodeMap.get(childId);
      if (parent && child) {
        parent.tmp = parent.tmp || {};
        parent.tmp.children = parent.tmp.children || [];
        parent.tmp.children.push(child);
        child.tmp = child.tmp || {};
        child.tmp.parents = child.tmp.parents || [];
        child.tmp.parents.push(parent);
        child.tmp.inputNodes = child.tmp.inputNodes || {};
        child.tmp.inputNodes[childInput] = parent;
      }
    }

    const nodes = []

    // loop through all the nodes and assign each nodes its depth
    const stack = [outputNode];
    while (stack.length) {
      const node = stack.pop();
      if (node) {
        node.tmp = node.tmp || {};

        if (node?.tmp?.depth === undefined) {
          node.tmp.depth = 0;
        }
        if (node?.tmp?.parents !== undefined) {
          for (const parent of node.tmp.parents) {
            parent.tmp = parent.tmp || {};
            if (parent.tmp?.depth === undefined) {
              parent.tmp.depth = node.tmp.depth + 1;
              stack.push(parent);
            } else {
              parent.tmp.depth = Math.max(parent.tmp.depth, node.tmp.depth + 1);
            }
          }
        }

        nodes.push(node);
      }
    }

    return [outputNode, nodes] as const;
  }

  execute(graph: Graph) {

    // Then we add some metadata to the graph
    const [outputNode, nodes] = this.addMetaData(graph);

    /*
    * Here we sort the nodes into buckets, which we then execute one by one
    * +-b2-+-b1-+---b0---+
    * |    |    |        |
    * | n3 | n2 | Output |
    * | n6 | n4 | Level  |
    * |    | n5 |        |
    * |    |    |        |
    * +----+----+--------+
    */

    // we execute the nodes from the bottom up
    const sortedNodes = nodes.sort((a, b) => (b.tmp?.depth || 0) - (a.tmp?.depth || 0));

    // here we store the intermediate results of the nodes
    const results: Record<string, string | boolean | number> = {};

    console.log(this.cache);

    for (const node of sortedNodes) {

      const node_type = this.typeMap.get(node.type)!;

      if (node?.tmp && node_type?.execute) {
        const inputs: Record<string, string | number | boolean> = {};
        for (const [key, input] of Object.entries(node_type.inputs || {})) {

          if (input.type === "seed") {
            inputs[key] = Math.floor(Math.random() * 100000000);
            continue;
          }

          // check if the input is connected to another node
          const inputNode = node.tmp.inputNodes?.[key];
          if (inputNode) {
            if (results[inputNode.id] === undefined) {
              throw new Error("Input node has no result");
            }
            inputs[key] = results[inputNode.id];
            continue;
          }

          // if the input is not connected to another node, we use the value from the node itself
          inputs[key] = node.props?.[key] ?? input?.value;

        }


        console.log(" ");
        console.log("--> EXECUTING NODE " + node_type.id, node.id);


        // execute the node and store the result
        try {
          const a0 = performance.now();

          const node_inputs = Object.entries(inputs);
          const cacheKey = `${node.id}/${fastHash(node_inputs.map(([_, value]: [string, any]) => {
            if (value instanceof Int32Array) {
              return hashIntArray(value);
            }
            console.log(value);
            return `${value}`
          }).join("/"))}`;

          const a1 = performance.now();
          console.log(`${a1 - a0}ms hashed inputs: ${node.id} -> ${cacheKey}`);

          if (this.cache[cacheKey] && this.cache[cacheKey].eol > Date.now()) {
            results[node.id] = this.cache[cacheKey].value;
            console.log(`Using cached value`);
            continue;
          }

          const transformed_inputs = node_inputs.map(([key, value]: [string, any]) => {
            const input_type = node_type.inputs?.[key]!;
            if (value instanceof Int32Array) {
              let _v = new Array(value.length);
              for (let i = 0; i < value.length; i++) {
                _v[i] = value[i];
              }
              return _v;
            }

            if (input_type.type === "float") {
              return encode(encodeFloat(value as number));
            }

            return value;
          });

          const a2 = performance.now();

          console.log(`${a2 - a1}ms TRANSFORMED_INPUTS`);

          const _inputs = concat_encoded(transformed_inputs);
          const a3 = performance.now();
          results[node.id] = node_type.execute(_inputs) as number;
          const duration = performance.now() - a3;
          if (duration > 5) {
            this.cache[cacheKey] = { eol: Date.now() + 10_000, value: results[node.id] };
            console.log(`Caching for 10 seconds`);
          }
          console.log(`${duration}ms Executed`);
          const a4 = performance.now();
          console.log(`${a4 - a0}ms e2e duration`);
        } catch (e) {
          console.error(`Error executing node ${node_type.id || node.id}`, e);
        }

      }
    }

    // return the result of the parent of the output node
    const res = results[outputNode.id] as string

    return res;

  }

}
