import { Handle, Position } from '@xyflow/react';

type NodeData = {
  value?: boolean;
  condition?: boolean;
  trueValue?: any;
  falseValue?: any;
};

type IfElseNodeProps = {
  id: string;
  data: NodeData;
};

export default function IfElseNode({ id, data }: IfElseNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold">If-Else</div>
        
        {/* Condition input */}
        <div className="flex items-center relative">
          <span className="text-xs">Condition: {data.condition?.toString() ?? 'undefined'}</span>
          <Handle
            type="target"
            position={Position.Left}
            id="condition"
            className="!bg-blue-400 -ml-[1.1rem]"
          />
        </div>

        {/* True value input */}
        <div className="flex items-center relative">
          <span className="text-xs">True: {data.trueValue?.toString() ?? 'undefined'}</span>
          <Handle
            type="target"
            position={Position.Left}
            id="true"
            className="!bg-green-400 -ml-[1.1rem]"
          />
        </div>

        {/* False value input */}
        <div className="flex items-center relative">
          <span className="text-xs">False: {data.falseValue?.toString() ?? 'undefined'}</span>
          <Handle
            type="target"
            position={Position.Left}
            id="false"
            className="!bg-red-400 -ml-[1.1rem]"
          />
        </div>

        {/* Output */}
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-yellow-400"
        />
      </div>
    </div>
  );
}
