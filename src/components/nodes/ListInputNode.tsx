import { Handle, Position } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { NodeData } from '@/types';
import type { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';

type ListInputNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function ListInputNode({ id, data }: ListInputNodeProps) {
  const [currentArray, setCurrentArray] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addToArray = () => {
    try {
      // Try to parse as number first
      const value = !isNaN(Number(inputValue)) ? Number(inputValue) : inputValue;
      const newArray = [...currentArray, value];
      setCurrentArray(newArray);
      setInputValue('');
      
      // Update node value
      const arrayString = JSON.stringify(newArray);
      data.value = arrayString;
      const event = new CustomEvent('nodeValueChanged', {
        detail: { id, value: arrayString }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error adding value to array');
    }
  };

  const clearArray = () => {
    setCurrentArray([]);
    data.value = '[]';
    const event = new CustomEvent('nodeValueChanged', {
      detail: { id, value: '[]' }
    });
    window.dispatchEvent(event);
  };

  const removeLastItem = () => {
    if (currentArray.length > 0) {
      const newArray = currentArray.slice(0, -1);
      setCurrentArray(newArray);
      const arrayString = JSON.stringify(newArray);
      data.value = arrayString;
      const event = new CustomEvent('nodeValueChanged', {
        detail: { id, value: arrayString }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-xs font-bold">List Input:</label>
        <div className="text-xs">Current: {JSON.stringify(currentArray)}</div>
        <div className="flex gap-2">
          <Input
            id={id}
            type="text"
            placeholder="Enter a value"
            value={inputValue}
            onChange={handleInputChange}
            className="nodrag"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue) {
                addToArray();
              }
            }}
          />
          <Button 
            variant="outline" 
            size="sm"
            className="nodrag"
            onClick={addToArray}
            disabled={!inputValue}
          >
            Add
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="nodrag"
            onClick={removeLastItem}
            disabled={currentArray.length === 0}
          >
            Remove Last
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="nodrag"
            onClick={clearArray}
            disabled={currentArray.length === 0}
          >
            Clear
          </Button>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-yellow-400"
        />
      </div>
    </div>
  );
}
