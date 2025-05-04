import { Handle, Position } from '@xyflow/react';
import { Input } from '../ui/input';
import type { Node } from '@xyflow/react';
import { NodeData } from '../../types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type StringInputNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function StringInputNode({ data, id }: StringInputNodeProps) {
  const [value, setValue] = useState(data.value as string || '');
  const [name, setName] = useState(data.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    data.value = newValue;
    // Trigger an update event
    const event = new CustomEvent('nodeValueChanged', {
      detail: { id, value: newValue }
    });
    window.dispatchEvent(event);
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
    <div className="bg-background border-2 rounded-lg p-3 min-w-[150px]">
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
              "text-sm font-medium cursor-text py-1 rounded",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-colors"
            )}
          >
            {name || "String Input"}
          </div>
        )}
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full"
          placeholder="Text value"
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-foreground"
        id="text"
      />
    </div>
  );
}
