import type { Graph, Node } from "$lib/types";

export function tree(depth: number): Graph {

  const nodes: Node[] = [
    {
      id: 0,
      type: "output",
      position: { x: 0, y: 0 }
    },
    {
      id: 1,
      type: "math",
      position: { x: -40, y: -10 }
    }
  ]

  const edges: [number, number, number, string][] = [
    [1, 0, 0, "input"]
  ];

  for (let d = 0; d < depth; d++) {
    const amount = Math.pow(2, d);
    for (let i = 0; i < amount; i++) {

      const id0 = amount * 2 + i * 2;
      const id1 = amount * 2 + i * 2 + 1;

      const parent = Math.floor(id0 / 2);

      const x = -(d + 1) * 50 - 40;
      const y = i * 80 - amount * 35;

      nodes.push({
        id: id0,
        type: "math",
        position: { x, y: y },
      });
      edges.push([id0, 0, parent, "a"]);
      nodes.push({
        id: id1,
        type: "math",
        position: { x, y: y + 35 },
      });
      edges.push([id1, 0, parent, "b"]);
    }
  }


  return { nodes, edges };

}
