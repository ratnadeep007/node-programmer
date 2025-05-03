import { Handle, Position } from '@xyflow/react';
import { Input } from '../ui/input';
import type { Node } from '@xyflow/react';
import { NodeData } from '../../types';

type StringInputNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function StringInputNode({ data, id }: StringInputNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle type="source" position={Position.Right} />
      <div className="flex flex-row items-center gap-2">
        <label htmlFor={id} className="text-xs font-bold">Text:</label>
        <Input
          id={id}
          value={data.value as string}
          onChange={(e) => data.onChange?.(id, e.target.value)}
          className="nodrag w-24 text-xs"
        />
      </div>
    </div>
  );
}
