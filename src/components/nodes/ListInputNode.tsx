import { Handle, Position } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import type { Node } from '@xyflow/react';
import { NodeData } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ListInputNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function ListInputNode({ id, data }: ListInputNodeProps) {
  const [inputValue, setInputValue] = useState('');
  const [name, setName] = useState(data.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    try {
      // Split by comma and parse each value
      const values = newValue.split(',').map(val => {
        const trimmed = val.trim();
        // Try to convert to number if possible
        return !isNaN(Number(trimmed)) ? Number(trimmed) : trimmed;
      });
      
      // Update node value
      const arrayString = JSON.stringify(values);
      data.value = arrayString;
      console.log(`ListInputNode ${id} emitting value:`, arrayString);
      const event = new CustomEvent('nodeValueChanged', {
        detail: { id, value: arrayString }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error parsing list input:', error);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    data.name = newName;
  };

  const handleNameBlur = () => {
    setIsEditing(false);
  };

  const handleNameClick = () => {
    setIsEditing(true);
  };

  return (
    <div className="bg-background border-2 rounded-lg p-3 min-w-[200px]">
      <div className="flex flex-col gap-2">
        {isEditing ? (
          <Input
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            placeholder="Variable name"
            className="w-full text-xs"
            maxLength={50}
            autoFocus
          />
        ) : (
          <div 
            onClick={handleNameClick}
            className={cn(
              "text-sm font-medium cursor-text rounded",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-colors"
            )}
          >
            {name || "List Input"}
          </div>
        )}
        <div className="text-xs font-medium">Current: {data.value || '[]'}</div>
        <Input
          type="text"
          placeholder="Enter comma-separated values (e.g. 1, 2, 3)"
          value={inputValue}
          onChange={handleInputChange}
          className="nodrag text-sm"
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-foreground"
        id="list"
      />
    </div>
  );
}
