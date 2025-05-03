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

type NodeData = {
  operator: string;
  value?: string;
  leftValue?: string;
  rightValue?: string;
  startIndex?: number;
  endIndex?: number;
  searchText?: string;
  replaceText?: string;
  delimiter?: string;
  onChange?: (id: string, value: string) => void;
};

type StringOperationNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

const STRING_OPERATIONS = {
  CONCAT: 'Concatenate',
  LENGTH: 'Length',
  SUBSTRING: 'Substring',
  UPPERCASE: 'To Uppercase',
  LOWERCASE: 'To Lowercase',
  REPLACE: 'Replace',
  SPLIT: 'Split',
  JOIN: 'Join',
  TRIM: 'Trim',
  CONTAINS: 'Contains'
} as const;

export default function StringOperationNode({ id, data }: StringOperationNodeProps) {
  const [operator, setOperator] = useState(data.operator || 'CONCAT');
  const [startIndex, setStartIndex] = useState(data.startIndex?.toString() || '0');
  const [endIndex, setEndIndex] = useState(data.endIndex?.toString() || '0');
  const [searchText, setSearchText] = useState(data.searchText || '');
  const [replaceText, setReplaceText] = useState(data.replaceText || '');
  const [delimiter, setDelimiter] = useState(data.delimiter || '');
  
  const leftValue = data.leftValue ?? '';
  const rightValue = data.rightValue ?? '';

  const handleOperatorChange = (value: string) => {
    setOperator(value);
    data.operator = value;
    if (data.onChange) {
      data.onChange(id, value);
    }
  };

  const handleStartIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartIndex(value);
    data.startIndex = parseInt(value) || 0;
  };

  const handleEndIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndIndex(value);
    data.endIndex = parseInt(value) || 0;
  };

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    data.searchText = value;
  };

  const handleReplaceTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReplaceText(value);
    data.replaceText = value;
  };

  const handleDelimiterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDelimiter(value);
    data.delimiter = value;
  };

  // Emit value change event when string operation result changes
  const emitValueChange = (result: string | boolean | string[]) => {
    const event = new CustomEvent('nodeValueChanged', {
      detail: { id, value: result }
    });
    window.dispatchEvent(event);
  };

  // Update result when inputs or operator changes
  useEffect(() => {
    let result: string | boolean | string[] = '';
    switch (operator) {
      case 'CONCAT':
        result = `${leftValue || ''}${rightValue || ''}`;
        break;
      case 'LENGTH':
        result = leftValue.length.toString();
        break;
      case 'SUBSTRING':
        result = leftValue.substring(parseInt(startIndex) || 0, parseInt(endIndex) || undefined);
        break;
      case 'UPPERCASE':
        result = leftValue.toUpperCase();
        break;
      case 'LOWERCASE':
        result = leftValue.toLowerCase();
        break;
      case 'REPLACE':
        result = leftValue.replace(searchText, replaceText);
        break;
      case 'SPLIT':
        result = leftValue.split(delimiter);
        break;
      case 'JOIN':
        // Assuming leftValue is an array of strings
        try {
          const arr = JSON.parse(leftValue);
          result = Array.isArray(arr) ? arr.join(delimiter) : leftValue;
        } catch {
          result = leftValue;
        }
        break;
      case 'TRIM':
        result = leftValue.trim();
        break;
      case 'CONTAINS':
        result = leftValue.includes(searchText);
        break;
    }
    emitValueChange(result);
  }, [leftValue, rightValue, operator, startIndex, endIndex, searchText, replaceText, delimiter]);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold">String Operation</div>
        
        {/* Left input */}
        <div className="flex items-center relative">
          <span className="text-xs">Input: {leftValue}</span>
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
            {Object.entries(STRING_OPERATIONS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Additional inputs based on operator */}
        {operator === 'SUBSTRING' && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Start"
              value={startIndex}
              onChange={handleStartIndexChange}
              className="w-20"
            />
            <Input
              type="number"
              placeholder="End"
              value={endIndex}
              onChange={handleEndIndexChange}
              className="w-20"
            />
          </div>
        )}

        {(operator === 'REPLACE' || operator === 'CONTAINS') && (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Search text"
              value={searchText}
              onChange={handleSearchTextChange}
            />
            {operator === 'REPLACE' && (
              <Input
                placeholder="Replace with"
                value={replaceText}
                onChange={handleReplaceTextChange}
              />
            )}
          </div>
        )}

        {(operator === 'SPLIT' || operator === 'JOIN') && (
          <Input
            placeholder="Delimiter"
            value={delimiter}
            onChange={handleDelimiterChange}
          />
        )}

        {/* Right input (only for concatenation) */}
        {operator === 'CONCAT' && (
          <div className="flex items-center relative">
            <span className="text-xs">Concat: {rightValue}</span>
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
