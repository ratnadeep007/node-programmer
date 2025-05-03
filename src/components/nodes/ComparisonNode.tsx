import { Handle, Position } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from 'react';

type NodeData = {
  operator: string;
  value?: boolean;
  leftValue?: number;
  rightValue?: number;
  onChange?: (id: string, value: string) => void;
};

type ComparisonNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function ComparisonNode({ id, data }: ComparisonNodeProps) {
  const operator = data.operator || '==';
  const leftValue = data.leftValue ?? 0;
  const rightValue = data.rightValue ?? 0;

  const handleOperatorChange = (value: string) => {
    if (data.onChange) {
      data.onChange(id, value);
    }
  };

  // Emit value change event when comparison result changes
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
      case '==': result = leftValue === rightValue; break;
      case '!=': result = leftValue !== rightValue; break;
      case '<': result = leftValue < rightValue; break;
      case '>': result = leftValue > rightValue; break;
      case '<=': result = leftValue <= rightValue; break;
      case '>=': result = leftValue >= rightValue; break;
    }
    emitValueChange(result);
  }, [leftValue, rightValue, operator]);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold">Compare</div>
        
        {/* Left input */}
        <div className="flex items-center relative">
          <span className="text-xs">A: {leftValue}</span>
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
            <SelectItem value="==">Equal (==)</SelectItem>
            <SelectItem value="!=">Not Equal (!=)</SelectItem>
            <SelectItem value="<">Less Than (&lt;)</SelectItem>
            <SelectItem value=">">Greater Than (&gt;)</SelectItem>
            <SelectItem value="<=">Less or Equal (&lt;=)</SelectItem>
            <SelectItem value=">=">Greater or Equal (&gt;=)</SelectItem>
          </SelectContent>
        </Select>

        {/* Right input */}
        <div className="flex items-center relative">
          <span className="text-xs">B: {rightValue}</span>
          <Handle
            type="target"
            position={Position.Left}
            id="right"
            className="!bg-blue-400 -ml-[1.1rem]"
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
