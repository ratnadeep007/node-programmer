import { Handle, Position } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { NodeData } from '@/types';

interface ListNodeData extends Omit<NodeData, 'value'> {
  value?: string;
  operator?: string;
}

type ListOperationNodeProps = Pick<Node<ListNodeData>, 'id' | 'data'>;

const LIST_OPERATIONS = {
  PUSH: 'Push',
  POP: 'Pop',
  MAP: 'Map',
  FILTER: 'Filter',
  LENGTH: 'Length',
  JOIN: 'Join',
  SLICE: 'Slice',
  REVERSE: 'Reverse',
  SORT: 'Sort'
} as const;

export default function ListOperationNode({ id, data }: ListOperationNodeProps) {
  const [operator, setOperator] = useState('PUSH');
  const [inputValue, setInputValue] = useState('');
  const [condition, setCondition] = useState('x > 0');
  const [mapFunction, setMapFunction] = useState('x * 2');
  
  const value = data.value ?? '[]';

  const processArray = () => {
    try {
      const inputArray = JSON.parse(value);
      if (!Array.isArray(inputArray)) {
        throw new Error('Input is not an array');
      }

      let result: any[] = [];
      switch (operator) {
        case 'PUSH':
          // Convert input to number if possible
          const pushValue = !isNaN(Number(inputValue)) ? Number(inputValue) : inputValue;
          result = [...inputArray, pushValue];
          break;
        case 'POP':
          result = inputArray.slice(0, -1);
          break;
        case 'MAP':
          result = inputArray.map(x => {
            try {
              const fn = new Function('x', `return ${mapFunction}`);
              return fn(x);
            } catch {
              return x;
            }
          });
          break;
        case 'FILTER':
          result = inputArray.filter(x => {
            try {
              const fn = new Function('x', `return ${condition}`);
              return Boolean(fn(x));
            } catch {
              return true;
            }
          });
          break;
        case 'LENGTH':
          result = [inputArray.length];
          break;
        case 'JOIN':
          // Convert all items to strings before joining
          result = [inputArray.map(x => String(x)).join(inputValue || ',')];
          break;
        case 'SLICE':
          const [start = 0, end = inputArray.length] = (inputValue || '').split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
          result = inputArray.slice(start, end);
          break;
        case 'REVERSE':
          result = [...inputArray].reverse();
          break;
        case 'SORT':
          result = [...inputArray].sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') {
              return a - b;
            }
            return String(a).localeCompare(String(b));
          });
          break;
      }

      const resultStr = JSON.stringify(result);
      const event = new CustomEvent('nodeValueChanged', {
        detail: { id, value: resultStr }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error processing array operation:', error);
      // Emit empty array on error
      const event = new CustomEvent('nodeValueChanged', {
        detail: { id, value: '[]' }
      });
      window.dispatchEvent(event);
    }
  };

  // Listen for value changes from input nodes
  useEffect(() => {
    const handleValueChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.id !== id) {
        processArray();
      }
    };

    window.addEventListener('nodeValueChanged', handleValueChange);
    return () => {
      window.removeEventListener('nodeValueChanged', handleValueChange);
    };
  }, [id]);

  const handleOperatorChange = (newOperator: string) => {
    setOperator(newOperator);
    processArray();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value);
    processArray();
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold">List Operation</div>
        
        {/* Input array */}
        <div className="flex items-center relative">
          <span className="text-xs">Input: {value}</span>
          <Handle
            type="target"
            position={Position.Left}
            id="target"
            className="!bg-blue-400 -ml-[1.1rem]"
          />
        </div>

        {/* Operator selector */}
        <Select value={operator} onValueChange={handleOperatorChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LIST_OPERATIONS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Additional inputs based on operator */}
        {operator === 'PUSH' && (
          <Input
            placeholder="Value to push"
            value={inputValue}
            onChange={(e) => handleInputChange(e, setInputValue)}
          />
        )}

        {operator === 'MAP' && (
          <Input
            placeholder="Map function (e.g. x * 2)"
            value={mapFunction}
            onChange={(e) => handleInputChange(e, setMapFunction)}
          />
        )}

        {operator === 'FILTER' && (
          <Input
            placeholder="Filter condition (e.g. x > 0)"
            value={condition}
            onChange={(e) => handleInputChange(e, setCondition)}
          />
        )}

        {operator === 'JOIN' && (
          <Input
            placeholder="Join delimiter"
            value={inputValue}
            onChange={(e) => handleInputChange(e, setInputValue)}
          />
        )}

        {operator === 'SLICE' && (
          <Input
            placeholder="start, end (e.g. 0, 2)"
            value={inputValue}
            onChange={(e) => handleInputChange(e, setInputValue)}
          />
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
