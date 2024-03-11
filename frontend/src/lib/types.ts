
export type Node = {
  id: string;
  type: string;
  props?: Record<string, any>,
  tmp?: {
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

type NodeInputFloat = {
  type: "float";
  value?: number;
  min?: number;
  max?: number;
}

type NodeInputInteger = {
  type: "integer";
  value?: number;
  min?: number;
  max?: number;
}

type NodeInputSelect = {
  type: "select";
  value?: string;
  options: string[];
}

export type NodeInput = NodeInputFloat | NodeInputInteger | NodeInputSelect;

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


export type Edge = {
  from: string;
  to: string;
}

export type Graph = {
  meta?: {
    title?: string;
    lastModified?: string;
  },
  nodes: Node[];
  edges: Edge[];
}
