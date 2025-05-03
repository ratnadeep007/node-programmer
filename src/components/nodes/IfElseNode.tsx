import { Handle, Position } from '@xyflow/react';
import { useEffect, useState } from 'react';

type NodeData = {
  value?: any;
  condition?: boolean;
  trueValue?: any;
  falseValue?: any;
  onChange?: (id: string, value: any) => void;
};

type IfElseNodeProps = {
  id: string;
  data: NodeData;
};

export default function IfElseNode({ id, data }: IfElseNodeProps) {
  const [output, setOutput] = useState<any>(undefined);

  useEffect(() => {
    // Calculate output based on condition
    const outputValue = data.condition !== undefined 
      ? (data.condition ? data.trueValue : data.falseValue)
      : undefined;
    
    setOutput(outputValue);

    // Update node data and trigger event
    if (outputValue !== data.value) {
      data.value = outputValue;
      const event = new CustomEvent('nodeValueChanged', {
        detail: { id, value: outputValue }
      });
      window.dispatchEvent(event);
    }
  }, [id, data.condition, data.trueValue, data.falseValue, data.value]);

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
        <div className="flex items-center justify-between">
          <span className="text-xs">Output: {output?.toString() ?? 'undefined'}</span>
          <Handle
            type="source"
            position={Position.Right}
            className="!bg-yellow-400"
          />
        </div>
      </div>
    </div>
  );
}
