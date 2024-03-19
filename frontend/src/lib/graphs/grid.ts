import type { Graph } from "$lib/types";

export function grid(width: number, height: number) {

  const graph: Graph = {
    edges: [],
    nodes: [],
  };

  const amount = width * height;

  for (let i = 0; i < amount; i++) {
    const x = i % width;
    const y = Math.floor(i / height);

    graph.nodes.push({
      id: i,
      tmp: {
        visible: false,
      },
      position: {
        x: x * 30,
        y: y * 40,
      },
      props: i == 0 ? { value: 0 } : {},
      type: i == 0 ? "input/float" : "math",
    });

    graph.edges.push([i, 0, i + 1, i === amount - 1 ? "input" : "a",]);
  }

  graph.nodes.push({
    id: amount,
    tmp: {
      visible: false,
    },
    position: {
      x: width * 30,
      y: (height - 1) * 40,
    },
    type: "output",
    props: {},
  });

  return graph;

}
