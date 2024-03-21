import type { NodeInput } from "./inputs";
export type { NodeInput } from "./inputs";

export type Node = {
  id: number;
  type: string;
  props?: Record<string, any>,
  tmp?: {
    depth?: number;
    mesh?: any;
    parents?: Node[],
    children?: Node[],
    inputNodes?: Record<string, Node>
    type?: NodeType;
    downX?: number;
    downY?: number;
    x?: number;
    y?: number;
    ref?: HTMLElement;
    visible?: boolean;
    isMoving?: boolean;
  },
  meta?: {
    title?: string;
    lastModified?: string;
  },
  position: [x: number, y: number]
}

export type NodeType = {
  id: string;
  inputs?: Record<string, NodeInput>
  outputs?: string[];
  meta?: {
    title?: string;
  },
  execute?: (inputs: Record<string, string | number | boolean>) => unknown;
}

export type Socket = {
  node: Node;
  index: number | string;
  position: [number, number];
};


export interface NodeRegistry {
  getNode: (id: string) => NodeType | undefined;
  getAllNodes: () => NodeType[];
}

export interface RuntimeExecutor {
  execute: (graph: Graph) => void;
}


export type Edge = [Node, number, Node, string];

export type Graph = {
  id: number;
  meta?: {
    title?: string;
    lastModified?: string;
  },
  nodes: Node[];
  edges: [number, number, number, string][];
}
