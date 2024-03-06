import { nodes } from "$lib/components/nodes"

export type Node = {
  id: string;
  type: keyof typeof nodes;
  props?: Record<string, any>,
  tmp?: {
    downX?: number;
    downY?: number;
    visible?: boolean;
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
