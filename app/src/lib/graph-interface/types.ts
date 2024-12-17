import type { Node, NodeDefinition } from "@nodes/types";

export type GraphNode = Node & {
  tmp?: {
    depth?: number;
    mesh?: any;
    random?: number;
    parents?: Node[];
    children?: Node[];
    inputNodes?: Record<string, Node>;
    type?: NodeDefinition;
    downX?: number;
    downY?: number;
    x?: number;
    y?: number;
    ref?: HTMLElement;
    visible?: boolean;
    isMoving?: boolean;
  };
};
