import { Node } from '@xyflow/react';

export interface NodeData extends Record<string, unknown> {
  value: string | number | boolean | string[];
  name?: string;
  operator?: string;
  onChange?: (id: string, value: string | number | boolean | string[]) => void;
  listOperation?: 'PUSH' | 'POP' | 'MAP' | 'FILTER' | 'LENGTH' | 'JOIN' | 'SLICE' | 'REVERSE' | 'SORT';
  mapFunction?: string;
  filterCondition?: string;
  joinDelimiter?: string;
  sliceRange?: string;
}

export type CustomNode<T extends NodeData = NodeData> = Node<T>;