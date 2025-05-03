import { Node as FlowNode, Edge as FlowEdge } from '@xyflow/react';

export interface NodeData extends Record<string, unknown> {
  value: string | number | boolean;
  operator?: string;
  onChange?: (id: string, value: string | number | boolean) => void;
}

export type Node = FlowNode<NodeData>;

export interface EdgeData extends Record<string, unknown> {
  value?: string | number | boolean;
}

export type Edge = FlowEdge<EdgeData>;
