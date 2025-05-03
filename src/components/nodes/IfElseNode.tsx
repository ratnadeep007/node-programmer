import { Handle, Position } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { NodeData } from '../../types';

type IfElseNodeProps = Pick<Node<NodeData>, 'id'>;

export default function IfElseNode({ id }: IfElseNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold">If-Else</div>
        
        {/* Condition Input */}
        <div className="flex items-center gap-2">
          <span className="text-xs">Condition</span>
          <Handle
            type="target"
            position={Position.Left}
            id="condition"
            className="!bg-yellow-400"
          />
        </div>

        {/* True Branch */}
        <div className="flex items-center gap-2">
          <span className="text-xs">True</span>
          <Handle
            type="target"
            position={Position.Left}
            id="true"
            className="!bg-green-400 mt-3"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="trueOutput"
            className="!bg-green-400 mt-3"
          />
        </div>

        {/* False Branch */}
        <div className="flex items-center gap-2">
          <span className="text-xs">False</span>
          <Handle
            type="target"
            position={Position.Left}
            id="false"
            className="!bg-red-400 mt-9"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="falseOutput"
            className="!bg-red-400 mt-9"
          />
        </div>
      </div>
    </div>
  );
}
