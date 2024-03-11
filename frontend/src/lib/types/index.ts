import type { NodeInput } from "./inputs";
export type { NodeInput } from "./inputs";

export type Node = {
  id: number;
  type: string;
  props?: Record<string, any>,
  tmp?: {
    type?: NodeType;
    downX?: number;
    downY?: number;
    visible?: boolean;
    isMoving?: boolean;
  },
  meta?: {
    title?: string;
    lastModified?: string;
  },
  position: {
    x: number;
    y: number;
  }
}

export type NodeType = {
  id: string;
  inputs?: Record<string, NodeInput>;
  outputs?: string[];
  meta?: {
    title?: string;
  }
}

export interface NodeRegistry {
  getNode: (id: string) => NodeType | undefined;
}


export type Edge = [Node, number, Node, string];

export type Graph = {
  meta?: {
    title?: string;
    lastModified?: string;
  },
  nodes: Node[];
  edges: [number, number, number, string][];
}
