import { Handle, Position } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { useState, ChangeEvent } from 'react';
import { NodeData } from '@/types';
import { cn } from '@/lib/utils';

type NumberInputNodeProps = {
  data: NodeData;
  id: string;
};

function NumberInputNode({ data, id }: NumberInputNodeProps) {
  const [value, setValue] = useState<number>(data.value as number || 0);
  const [name, setName] = useState(data.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    setValue(newValue);
    data.value = newValue;
    // Trigger an update event
    const event = new CustomEvent('nodeValueChanged', {
      detail: { id, value: newValue }
    });
    window.dispatchEvent(event);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
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
            {name || "Number Input"}
          </div>
        )}
        <Input
          type="number"
          value={value}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-foreground"
        id="number"
      />
    </div>
  );
}

export default NumberInputNode;
