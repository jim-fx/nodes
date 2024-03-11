import type { GraphManager } from "$lib/graph-manager";
import type { Node } from "$lib/types";
import { derived, get, writable, type Writable } from "svelte/store";
import * as debug from "../debug";


type Socket = {
  node: Node;
  index: number;
  isInput: boolean;
  type: string;
  position: [number, number];
}

export class GraphState {

  activeNodeId: Writable<number> = writable(-1);
  dimensions: Writable<[number, number]> = writable([100, 100]);
  mouse: Writable<[number, number]> = writable([0, 0]);
  mouseDown: Writable<false | ({ x: number, y: number } & Omit<Socket, "position">)> = writable(false);
  cameraPosition: Writable<[number, number, number]> = writable([0, 1, 0]);
  cameraBounds = derived([this.cameraPosition, this.dimensions], ([_cameraPosition, [width, height]]) => {
    return [
      _cameraPosition[0] - width / _cameraPosition[2],
      _cameraPosition[0] + width / _cameraPosition[2],
      _cameraPosition[1] - height / _cameraPosition[2],
      _cameraPosition[1] + height / _cameraPosition[2],
    ] as const
  });

  possibleSockets: Socket[] = [];
  hoveredSocket: Writable<Socket | null> = writable(null);

  constructor(private graph: GraphManager) {
    if (globalThis?.innerWidth && globalThis?.innerHeight) {
      this.dimensions.set([window.innerWidth, window.innerHeight]);
      globalThis.addEventListener("resize", () => {
        this.dimensions.set([window.innerWidth, window.innerHeight]);
      })
    }
  }

  setMouse(x: number, y: number) {
    this.mouse.set([x, y]);
  }

  setMouseFromEvent(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;

    const cameraPosition = get(this.cameraPosition);
    const dimensions = get(this.dimensions);

    this.mouse.set([
      cameraPosition[0] + (x - dimensions[0] / 2) / cameraPosition[2],
      cameraPosition[1] + (y - dimensions[1] / 2) / cameraPosition[2],
    ]);
  }

  getSocketPosition(node: Node, index: number | string) {
    const isOutput = typeof index === "number";
    if (isOutput) {
      return [node.position.x + 5, node.position.y + 0.625 + 2.5 * index] as const;
    } else {
      const _index = Object.keys(node.tmp?.type?.inputs || {}).indexOf(index);
      return [node.position.x, node.position.y + 2.5 + 2.5 * _index] as const;
    }
  }

  setMouseDown(opts: ({ x: number, y: number } & Omit<Socket, "position">) | false) {

    if (!opts) {
      this.mouseDown.set(false);
      return;
    }

    let { x, y, node, index, isInput, type } = opts;

    if (node && index !== undefined && isInput !== undefined) {

      debug.clear();

      // remove existing edge
      if (isInput) {
        const edges = this.graph.getEdgesToNode(node);
        const key = Object.keys(node.tmp?.type?.inputs || {})[index];
        for (const edge of edges) {
          if (edge[3] === key) {
            node = edge[2];
            index = 0;
            const pos = this.getSocketPosition(edge[0], index);
            x = pos[0];
            y = pos[1];
            isInput = false;
            this.graph.removeEdge(edge);
            break;
          }
        }
      }

      this.mouseDown.set({ x, y, node, index, isInput, type });

      this.possibleSockets = this.graph.getPossibleSockets(node, index, isInput).map(([node, index]) => {
        if (isInput) {
          const key = Object.keys(node.tmp?.type?.inputs || {})[index];
          return {
            node,
            index,
            isInput,
            type: node.tmp?.type?.inputs?.[key].type || "",
            position: [node.position.x + 5, node.position.y + 0.625 + 2.5 * index]
          }
        } else {
          return {
            node,
            index,
            isInput,
            type: node.tmp?.type?.outputs?.[index] || "",
            position: [node.position.x, node.position.y + 2.5 + 2.5 * index]
          }
        }
      });
    }

    console.log("possibleSockets", this.possibleSockets);

  }

}
