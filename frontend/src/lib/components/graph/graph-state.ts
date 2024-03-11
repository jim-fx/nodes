import type { GraphManager } from "$lib/graph-manager";
import type { Node } from "$lib/types";
import { derived, get, writable, type Writable } from "svelte/store";
import * as debug from "../debug";


type Socket = {
  node: Node;
  index: number;
  isInput: boolean;
  position: [number, number];
}

export class GraphState {

  activeNodeId: Writable<number> = writable(-1);
  dimensions: Writable<[number, number]> = writable([100, 100]);
  mouse: Writable<[number, number]> = writable([0, 0]);
  mouseDown: Writable<false | { x: number, y: number, node?: Node, socketIndex?: number, isInput?: boolean }> = writable(false);
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

  setMouseDown(opts: { x: number, y: number, node?: Node, socketIndex?: number, isInput?: boolean } | false) {
    if (!opts) {
      this.mouseDown.set(false);
      return;
    }
    const { x, y, node, socketIndex, isInput } = opts;
    this.mouseDown.set({ x, y, node, socketIndex, isInput });

    if (node && socketIndex !== undefined) {

      debug.clear();

      this.possibleSockets = this.graph.getPossibleSockets(node, socketIndex, isInput).map(([node, index]) => {
        if (isInput) {
          // debug.debugPosition(new Vector3(node.position.x + 5, 0, node.position.y + 0.625 + 2.5 * index));
          return {
            node,
            index,
            position: [node.position.x + 5, node.position.y + 0.625 + 2.5 * index]
          }
        } else {
          // debug.debugPosition(new Vector3(node.position.x, 0, node.position.y + 2.5 + 2.5 * index));
          return {
            node,
            index,
            position: [node.position.x, node.position.y + 2.5 + 2.5 * index]
          }

        }
      });


    }
  }

}
