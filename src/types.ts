import { Node } from '@xyflow/react';

export interface NodeData extends Record<string, unknown> {
  value: string | number | boolean;
  name?: string;
  operator?: string;
  onChange?: (id: string, value: string | number | boolean) => void;
}

export type CustomNode<T extends NodeData = NodeData> = Node<T>;