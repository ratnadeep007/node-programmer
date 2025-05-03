import { Handle, Position } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { NodeData } from '../../types';

type DisplayNodeProps = Pick<Node<NodeData>, 'data'>;

export default function DisplayNode({ data }: DisplayNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold">Print</div>
          <Handle
            type="target"
            position={Position.Left}
            className="!bg-purple-400"
          />
        </div>
        <div className="text-sm border-t pt-2 break-all">
          {data.value !== undefined ? String(data.value) : 'No input'}
        </div>
      </div>
    </div>
  );
}
