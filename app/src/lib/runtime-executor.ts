import type { Graph, NodeRegistry, NodeType, RuntimeExecutor } from "@nodes/types";


function numberToBinaryArray(number: number): number[] {
  const binaryArray: number[] = [];
  for (let i = 31; i >= 0; i--) {
    const bit = (number >> i) & 1;
    binaryArray.push(bit);
  }
  return binaryArray;
}

function evaluate_node([node_type, ...args]: number[]) {

  // Float node
  if (node_type === 0) {
    return args[0];
  }

  console.log(args);

  // Math node
  if (node_type === 1) {
    if (args[0] === 0) {
      return args[1] + args[2];
    } else if (args[0] === 1) {
      return args[1] - args[2];
    } else if (args[0] === 2) {
      return args[1] * args[1];
    } else {
      return args[1] / args[2];
    }
  }
}


function read_node(index: number, params: number[], depth = 0) {
  if (depth > 20) {
    throw new Error("Max depth reached");
  }

  const node_type = params[index];
  const amount_of_args = params[index + 1];
  const bitmask = params[index + 2];
  console.log("READ_NODE", index, { node_type, bitmask, amount_of_args });

  const mask = numberToBinaryArray(bitmask);

  // there are not nodes connected to this node, lets evaluate
  if (bitmask === 0) {
    console.log("EVALUATE", index, params);
  }

  const args = [];

  for (let i = 0; i < amount_of_args; i++) {
    const isNode = mask[i] === 1;
    if (isNode) {
      console.log("NODE", index + 3 + i, params.slice(index + 3 + i, index + 3 + i + 5));
      args[i] = read_node(params[index + 3 + i], params, depth + 1);
    } else {
      args[i] = params[index + 3 + i];
    }
  }

  console.log({ node_type, amount_of_args, args, bitmask });
  return evaluate_node([node_type, ...args]);

}

function split_params(params: number[]) {
  const result = [];
  let index = 0;
  while (index < params.length) {
    const amount_of_args = params[index + 1];
    const node_size = 3 + amount_of_args;
    result.push(params.slice(index, index + node_size));
    index += node_size;
  }
  return result;
}

function evaluate(params: number[]) {
  console.log("PARAMS", split_params(params));
  const node = read_node(0, params);

  console.log("RESULT: ", node);

}

export class MemoryRuntimeExecutor implements RuntimeExecutor {

  constructor(private registry: NodeRegistry) { }

  private getNodeTypes(graph: Graph) {
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
    const typeMap = this.getNodeTypes(graph);

    const outputNode = graph.nodes.find(node => node.type === "output");
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

        node.tmp.type = typeMap.get(node.type);

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

    for (const node of sortedNodes) {
      if (node?.tmp && node?.tmp?.type?.execute) {
        const inputs: Record<string, string | number | boolean> = {};
        for (const [key, input] of Object.entries(node.tmp.type.inputs || {})) {

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

        // execute the node and store the result
        results[node.id] = node.tmp.type.execute(inputs) as number;;

      }
    }

    // return the result of the parent of the output node
    const res = results[outputNode.tmp?.parents?.[0].id as number] as string

    evaluate(res);


    return res;

  }

}
