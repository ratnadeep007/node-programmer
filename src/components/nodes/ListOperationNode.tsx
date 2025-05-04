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
import { useEffect, useState, useCallback } from 'react';
import { NodeData } from '@/types';

interface ListNodeData extends Omit<NodeData, 'value'> {
  value?: string;
  operator?: string;
  listOperation?: string;
  filterCondition?: string;
  mapFunction?: string;
  joinDelimiter?: string;
  sliceRange?: string;
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
  const [operator, setOperator] = useState(data.listOperation as string || 'PUSH');
  const [condition, setCondition] = useState(data.filterCondition as string || 'x > 0');
  const [mapFunction, setMapFunction] = useState(data.mapFunction as string || 'x * 2');
  const [inputArray, setInputArray] = useState<any[]>([]);
  const [outputArray, setOutputArray] = useState<any[]>([]);
  const [pushValue, setPushValue] = useState<any>(null);
  const [joinDelimiter, setJoinDelimiter] = useState(data.joinDelimiter as string || ',');
  const [sliceRange, setSliceRange] = useState(data.sliceRange as string || '');

  const processArray = useCallback(() => {
    console.log(`ListOperationNode ${id} processArray called:`, {
      operator,
      inputArray,
      pushValue,
      condition,
      mapFunction,
      joinDelimiter,
      sliceRange
    });
    
    try {
      let result: any[] = [];
      
      // Debug inputArray
      console.log(`ListOperationNode ${id} processArray inputArray:`, 
        { type: typeof inputArray, isArray: Array.isArray(inputArray), value: inputArray });
      
      // Ensure inputArray is actually an array
      let workingArray = inputArray;
      if (!Array.isArray(workingArray)) {
        console.log(`ListOperationNode ${id} converting non-array to array:`, workingArray);
        workingArray = workingArray ? [workingArray] : [];
      }
      
      switch (operator) {
        case 'PUSH':
          // Use pushValue from the input node if available
          const valueToAdd = pushValue !== null ? pushValue : null;
          console.log(`ListOperationNode ${id} PUSH operation:`, { valueToAdd, workingArray });
          if (valueToAdd !== null) {
            result = [...workingArray, valueToAdd];
          } else {
            result = [...workingArray];
          }
          break;
        case 'POP':
          console.log(`ListOperationNode ${id} POP operation:`, { workingArray });
          result = workingArray.slice(0, -1);
          break;
        case 'MAP':
          console.log(`ListOperationNode ${id} MAP operation:`, { workingArray, mapFunction });
          result = workingArray.map(x => {
            try {
              const fn = new Function('x', `return ${mapFunction}`);
              return fn(x);
            } catch (err) {
              console.error(`ListOperationNode ${id} MAP error:`, err);
              return x;
            }
          });
          break;
        case 'FILTER':
          console.log(`ListOperationNode ${id} FILTER operation:`, { workingArray, condition });
          result = workingArray.filter(x => {
            try {
              const fn = new Function('x', `return ${condition}`);
              return Boolean(fn(x));
            } catch (err) {
              console.error(`ListOperationNode ${id} FILTER error:`, err);
              return true;
            }
          });
          break;
        case 'LENGTH':
          console.log(`ListOperationNode ${id} LENGTH operation:`, { workingArray });
          result = [workingArray.length];
          break;
        case 'JOIN':
          console.log(`ListOperationNode ${id} JOIN operation:`, { workingArray, joinDelimiter });
          // Convert all items to strings before joining
          result = [workingArray.map(x => String(x)).join(joinDelimiter)];
          break;
        case 'SLICE':
          console.log(`ListOperationNode ${id} SLICE operation:`, { workingArray, sliceRange });
          const [start = 0, end = workingArray.length] = sliceRange
            .split(',')
            .map(x => parseInt(x.trim()))
            .filter(x => !isNaN(x));
          result = workingArray.slice(start, end);
          break;
        case 'REVERSE':
          console.log(`ListOperationNode ${id} REVERSE operation:`, { workingArray });
          result = [...workingArray].reverse();
          break;
        case 'SORT':
          console.log(`ListOperationNode ${id} SORT operation:`, { workingArray });
          result = [...workingArray].sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') {
              return a - b;
            }
            return String(a).localeCompare(String(b));
          });
          break;
      }

      console.log(`ListOperationNode ${id} operation result:`, result);
      setOutputArray(result);
      const resultStr = JSON.stringify(result);
      data.value = resultStr;
      console.log(`ListOperationNode ${id} emitting result:`, resultStr);
      const event = new CustomEvent('nodeValueChanged', {
        detail: { id, value: resultStr }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error(`ListOperationNode ${id} processing error:`, error);
      setOutputArray([]);
      // Emit empty array on error
      const event = new CustomEvent('nodeValueChanged', {
        detail: { id, value: '[]' }
      });
      window.dispatchEvent(event);
    }
  }, [id, operator, condition, mapFunction, inputArray, pushValue, joinDelimiter, sliceRange]);

  // Listen for value changes from input nodes
  useEffect(() => {
    const handleValueChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log(`ListOperationNode ${id} received event:`, detail);
      
      // Skip events from this node
      if (detail && detail.id !== id) {
        try {
          // Check if this node is the target
          if (detail.target === id) {
            // Handle different target handles
            if (detail.targetHandle === 'push-value') {
              console.log(`ListOperationNode ${id} received push value:`, detail.value);
              setPushValue(detail.value);
              if (operator === 'PUSH') {
                processArray();
              }
            } else if (detail.targetHandle === 'target') {
              console.log(`ListOperationNode ${id} received input array:`, detail.value);
              try {
                const newInputArray = JSON.parse(detail.value);
                console.log(`ListOperationNode ${id} parsed array:`, newInputArray);
                setInputArray(newInputArray);
              } catch (error) {
                console.error(`ListOperationNode ${id} parsing error:`, error);
                // If parsing fails, try as a single value
                setInputArray([detail.value]);
              }
              // Process array when input changes
              processArray();
            }
          }
        } catch (error) {
          console.error('Error parsing input:', error);
          if (detail.targetHandle === 'push-value') {
            setPushValue(null);
          } else {
            setInputArray([]);
          }
          // Process array even on error to ensure output is updated
          processArray();
        }
      }
    };

    console.log(`ListOperationNode ${id} adding nodeValueChanged listener`);
    window.addEventListener('nodeValueChanged', handleValueChange);
    return () => {
      console.log(`ListOperationNode ${id} removing nodeValueChanged listener`);
      window.removeEventListener('nodeValueChanged', handleValueChange);
    };
  }, [id, operator, processArray]);

  // Process array whenever operator or inputs change
  useEffect(() => {
    processArray();
  }, [operator, processArray]);

  const handleOperatorChange = (newOperator: string) => {
    setOperator(newOperator);
    data.listOperation = newOperator;
    processArray();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void, dataKey: string) => {
    const newValue = e.target.value;
    setter(newValue);
    (data as any)[dataKey] = newValue;
    processArray();
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 relative">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold">List Operation</div>

        {/* Input array */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium">Input:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {JSON.stringify(inputArray)}
          </div>
        </div>

        {/* Input handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className="!bg-blue-400"
        />
        {operator === 'PUSH' && (
          <Handle
            type="target"
            position={Position.Left}
            id="push-value"
            className="!bg-green-400"
            style={{ top: '60%' }}
          />
        )}

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
        {operator === 'MAP' && (
          <Input
            placeholder="Map function (e.g. x * 2)"
            value={mapFunction}
            onChange={(e) => handleInputChange(e, setMapFunction, 'mapFunction')}
          />
        )}

        {operator === 'FILTER' && (
          <Input
            placeholder="Filter condition (e.g. x > 0)"
            value={condition}
            onChange={(e) => handleInputChange(e, setCondition, 'filterCondition')}
          />
        )}

        {operator === 'JOIN' && (
          <Input
            placeholder="Join delimiter"
            value={joinDelimiter}
            onChange={(e) => handleInputChange(e, setJoinDelimiter, 'joinDelimiter')}
          />
        )}

        {operator === 'SLICE' && (
          <Input
            placeholder="start, end (e.g. 0, 2)"
            value={sliceRange}
            onChange={(e) => handleInputChange(e, setSliceRange, 'sliceRange')}
          />
        )}

        {/* Output array */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium">Output:</div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {JSON.stringify(outputArray)}
          </div>
        </div>

        {/* Output handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-yellow-400"
        />
      </div>
    </div>
  );
}
