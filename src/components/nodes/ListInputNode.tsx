import { Handle, Position } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Node } from '@xyflow/react';
import { NodeData } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ListInputNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function ListInputNode({ id, data }: ListInputNodeProps) {
  const [currentArray, setCurrentArray] = useState<any[]>(
    data.value ? JSON.parse(data.value as string) : []
  );
  const [inputValue, setInputValue] = useState('');
  const [name, setName] = useState(data.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
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
        <div className="text-xs font-medium">Current: {JSON.stringify(currentArray)}</div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter a value"
            value={inputValue}
            onChange={handleInputChange}
            className="nodrag text-sm"
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
