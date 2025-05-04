import { Handle, Position } from '@xyflow/react';
import { Switch } from '../ui/switch';
import type { Node } from '@xyflow/react';
import { NodeData } from '../../types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

type BooleanInputNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function BooleanInputNode({ id, data }: BooleanInputNodeProps) {
  const [value, setValue] = useState(Boolean(data.value));
  const [name, setName] = useState(data.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (checked: boolean) => {
    setValue(checked);
    data.value = checked;
    // Trigger an update event
    const event = new CustomEvent('nodeValueChanged', {
      detail: { id, value: checked }
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
            {name || "Boolean Input"}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch
            checked={value}
            onCheckedChange={handleChange}
            className="nodrag"
          />
          <span className="text-sm">{value ? 'True' : 'False'}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-foreground"
        id="boolean"
      />
    </div>
  );
}
