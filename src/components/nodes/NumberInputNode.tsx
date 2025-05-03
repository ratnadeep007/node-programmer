import { Handle, Position } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { useState, ChangeEvent } from 'react';

type NodeData = {
  value: number;
  onChange?: (value: number) => void;
};

type NumberInputNodeProps = {
  data: NodeData;
  id: string;
};

function NumberInputNode({ data, id }: NumberInputNodeProps) {
  const [value, setValue] = useState(data.value || 0);

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

  return (
    <div className="bg-background border-2 rounded-lg p-3 min-w-[150px]">
      <div className="font-semibold mb-2">Number Input</div>
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        className="w-full"
      />
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
