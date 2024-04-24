import { z } from "zod";
import { NodeInputSchema } from "./inputs";

export type NodeId = `${string}/${string}/${string}`;

export type Node = {
  id: number;
  type: NodeId;
  props?: Record<string, number | number[]>,
  tmp?: {
    depth?: number;
    mesh?: any;
    random?: number;
    parents?: Node[],
    children?: Node[],
    inputNodes?: Record<string, Node>
    type?: NodeDefinition;
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

export const NodeDefinitionSchema = z.object({
  id: z.string(),
  inputs: z.record(NodeInputSchema).optional(),
  outputs: z.array(z.string()).optional(),
  meta: z.object({
    description: z.string().optional(),
    title: z.string().optional(),
  }).optional(),
});

export type NodeDefinition = z.infer<typeof NodeDefinitionSchema> & {
  execute(input: Int32Array): Int32Array;
};

export type Socket = {
  node: Node;
  index: number | string;
  position: [number, number];
};

export type Edge = [Node, number, Node, string];

export type Graph = {
  id: number;
  meta?: {
    title?: string;
    lastModified?: string;
  },
  settings?: Record<string, any>,
  nodes: Node[];
  edges: [number, number, number, string][];
}
