import { Handle, Position } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

type NodeData = {
  operator: string;
  value?: boolean;
  leftValue?: boolean;
  rightValue?: boolean;
  onChange?: (id: string, value: string) => void;
};

type BooleanOperationNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function BooleanOperationNode({ id, data }: BooleanOperationNodeProps) {
  const [operator, setOperator] = useState(data.operator || 'AND');
  const leftValue = data.leftValue ?? false;
  const rightValue = data.rightValue ?? false;

  const handleOperatorChange = (value: string) => {
    setOperator(value);
    data.operator = value;
    if (data.onChange) {
      data.onChange(id, value);
    }
  };

  // Emit value change event when boolean operation result changes
  const emitValueChange = (result: boolean) => {
    const event = new CustomEvent('nodeValueChanged', {
      detail: { id, value: result }
    });
    window.dispatchEvent(event);
  };

  // Update result when inputs or operator changes
  useEffect(() => {
    let result = false;
    switch (operator) {
      case 'AND': result = leftValue && rightValue; break;
      case 'OR': result = leftValue || rightValue; break;
      case 'NOT': result = !leftValue; break;
      case 'XOR': result = leftValue !== rightValue; break;
      case 'NAND': result = !(leftValue && rightValue); break;
      case 'NOR': result = !(leftValue || rightValue); break;
    }
    emitValueChange(result);
  }, [leftValue, rightValue, operator]);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold">Boolean Operation</div>
        
        {/* Left input */}
        <div className="flex items-center relative">
          <span className="text-xs">A: {leftValue?.toString()}</span>
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            className="!bg-blue-400 -ml-[1.1rem]"
          />
        </div>

        {/* Operator selector */}
        <Select value={operator} onValueChange={handleOperatorChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
            <SelectItem value="NOT">NOT</SelectItem>
            <SelectItem value="XOR">XOR</SelectItem>
            <SelectItem value="NAND">NAND</SelectItem>
            <SelectItem value="NOR">NOR</SelectItem>
          </SelectContent>
        </Select>

        {/* Right input (hidden for NOT operation) */}
        {operator !== 'NOT' && (
          <div className="flex items-center relative">
            <span className="text-xs">B: {rightValue?.toString()}</span>
            <Handle
              type="target"
              position={Position.Left}
              id="right"
              className="!bg-blue-400 -ml-[1.1rem]"
            />
          </div>
        )}

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
