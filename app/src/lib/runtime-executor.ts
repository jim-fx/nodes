import type { Graph, NodeRegistry, NodeDefinition, RuntimeExecutor } from "@nodes/types";
import { fastHash, concatEncodedArrays, encodeFloat, decodeNestedArray } from "@nodes/utils"
import { createLogger } from "./helpers";

const log = createLogger("runtime-executor");

export class MemoryRuntimeExecutor implements RuntimeExecutor {

  private definitionMap: Map<string, NodeDefinition> = new Map();

  private cache: Record<string, { eol: number, value: any }> = {};

  constructor(private registry: NodeRegistry) { }

  private getNodeDefinitions(graph: Graph) {

    if (this.registry.status !== "ready") {
      throw new Error("Node registry is not ready");
    }

    const typeMap = new Map<string, NodeDefinition>();
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

    // First, lets check if all nodes have a definition
    this.definitionMap = this.getNodeDefinitions(graph);

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

  execute(graph: Graph, settings: Record<string, unknown>) {

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
    const results: Record<string, Int32Array> = {};

    const runSeed = settings["randomSeed"] === true ? Math.floor(Math.random() * 100000000) : 5120983;

    for (const node of sortedNodes) {

      const node_type = this.definitionMap.get(node.type)!;

      if (node?.tmp && node_type?.execute) {

        const inputs = Object.entries(node_type.inputs || {}).map(([key, input]) => {

          if (input.type === "seed") {
            return runSeed;
          }

          if (input.setting) {
            if (settings[input.setting] === undefined) {
              if ("value" in input && input.value !== undefined) {
                if (input.type === "float") {
                  return encodeFloat(input.value);
                }
                return input.value;
              } else {
                log.warn(`Setting ${input.setting} is not defined`);
              }
            } else {
              if (input.type === "float") {
                return encodeFloat(settings[input.setting] as number);
              }
              return settings[input.setting];
            }
          }

          // check if the input is connected to another node
          const inputNode = node.tmp?.inputNodes?.[key];
          if (inputNode) {
            if (results[inputNode.id] === undefined) {
              throw new Error("Input node has no result");
            }
            return results[inputNode.id];
          }

          // If the value is stored in the node itself, we use that value
          if (node.props?.[key] !== undefined) {
            let value = node.props[key];
            if (input.type === "vec3") {
              return [0, 4, ...value.map(v => encodeFloat(v)), 1, 1]
            } else if (Array.isArray(value)) {
              return [0, value.length + 1, ...value, 1, 1];
            } else if (input.type === "float") {
              return encodeFloat(value);
            } else {
              return value;
            }
          }

          let defaultValue = input.value;
          if (defaultValue !== undefined) {
            if (Array.isArray(defaultValue)) {
              return [0, defaultValue.length + 1, ...defaultValue.map(v => encodeFloat(v)), 1, 1];
            } else if (input.type === "float") {
              return encodeFloat(defaultValue);
            } else {
              return defaultValue;
            }
          }

          throw new Error(`Input ${key} is not connected and has no default value`);

        });

        try {

          const encoded_inputs = concatEncodedArrays(inputs);
          log.group(`executing ${node_type.id || node.id}`);
          log.log(`Inputs:`, inputs);
          log.log(`Encoded Inputs:`, encoded_inputs);
          results[node.id] = node_type.execute(encoded_inputs);
          log.log("Result:", results[node.id]);
          log.log("Result (decoded):", decodeNestedArray(results[node.id]));
          log.groupEnd();

        } catch (e) {
          log.groupEnd();
          log.error(`Error executing node ${node_type.id || node.id}`, e);
        }

      }
    }

    // return the result of the parent of the output node
    const res = results[outputNode.id];

    return res as unknown as Int32Array;

  }

}
