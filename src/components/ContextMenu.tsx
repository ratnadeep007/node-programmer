import { useState, useEffect, useRef } from 'react';

interface NodeType {
  type: string;
  label: string;
}

const NODE_TYPES: NodeType[] = [
  { type: 'numberInput', label: 'Number Input' },
  { type: 'stringInput', label: 'String Input' },
  { type: 'booleanInput', label: 'Boolean Input' },
  { type: 'listInput', label: 'List Input' },
  { type: 'addition', label: 'Addition' },
  { type: 'subtraction', label: 'Subtraction' },
  { type: 'multiplication', label: 'Multiplication' },
  { type: 'division', label: 'Division' },
  { type: 'ifElse', label: 'If-Else' },
  { type: 'display', label: 'Display' },
  { type: 'comparison', label: 'Comparison' },
  { type: 'booleanOperation', label: 'Boolean Operation' },
  { type: 'stringOperation', label: 'String Operation' },
  { type: 'listOperation', label: 'List Operation' },
];

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNode: (type: string, position: { flowPosition: { x: number, y: number } }) => void;
}

export function ContextMenu({ x, y, onClose, onAddNode }: ContextMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const filteredNodes = NODE_TYPES.filter(node => 
    node.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredNodes.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredNodes[selectedIndex]) {
          onAddNode(filteredNodes[selectedIndex].type, { flowPosition: { x, y } });
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <div 
      className="absolute bg-white shadow-lg rounded-md py-2 border border-gray-200 min-w-[200px] z-50 context-menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="px-2 mb-2">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {filteredNodes.map((node, index) => (
          <button
            key={node.type}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
              index === selectedIndex ? 'bg-gray-100' : ''
            }`}
            onClick={() => {
              onAddNode(node.type, { flowPosition: { x, y } });
              onClose();
            }}
          >
            {node.label}
          </button>
        ))}
      </div>
    </div>
  );
}
