import { Handle, Position } from '@xyflow/react';
import { Switch } from '../ui/switch';
import type { Node } from '@xyflow/react';
import { NodeData } from '../../types';

type BooleanInputNodeProps = Pick<Node<NodeData>, 'id' | 'data'>;

export default function BooleanInputNode({ data, id }: BooleanInputNodeProps) {
  const handleValueChange = (checked: boolean) => {
    // Update the node's data
    data.value = checked;
    
    // Emit value change event
    const event = new CustomEvent('nodeValueChanged', {
      detail: { id, value: checked }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle type="source" position={Position.Right} />
      <div className="flex flex-row items-center gap-2">
        <label htmlFor={id} className="text-xs font-bold">Toggle:</label>
        <Switch
          id={id}
          checked={data.value as boolean}
          onCheckedChange={handleValueChange}
          className="nodrag"
        />
      </div>
    </div>
  );
}
