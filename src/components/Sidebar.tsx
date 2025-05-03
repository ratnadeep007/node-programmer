import { Button } from '@/components/ui/button';
import { CollapsibleSection } from './CollapsibleSection';
import { DragEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type SidebarProps = {
  onDragStart: (event: DragEvent<HTMLButtonElement>, nodeType: string) => void;
  onExport: () => void;
  onImport: () => void;
};

type NodeItem = {
  type: string;
  label: string;
  category: string;
};

const NODE_ITEMS: NodeItem[] = [
  { type: 'numberInput', label: 'Number Input', category: 'Input' },
  { type: 'stringInput', label: 'String Input', category: 'Input' },
  { type: 'booleanInput', label: 'Boolean Input', category: 'Input' },
  { type: 'addition', label: 'Add', category: 'Basic Operations' },
  { type: 'subtraction', label: 'Subtract', category: 'Basic Operations' },
  { type: 'multiplication', label: 'Multiply', category: 'Basic Operations' },
  { type: 'division', label: 'Divide', category: 'Basic Operations' },
  { type: 'comparison', label: 'Compare', category: 'Control Flow' },
  { type: 'booleanOperation', label: 'Boolean Operation', category: 'Control Flow' },
  { type: 'ifElse', label: 'If-Else', category: 'Control Flow' },
  { type: 'stringOperation', label: 'String Operation', category: 'String Operations' },
  { type: 'display', label: 'Print', category: 'Output' },
];

export function Sidebar({ onDragStart, onExport, onImport }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = NODE_ITEMS.filter(node => 
    node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodeItem[]>);

  return (
    <div className="w-64 bg-slate-100 p-4 border-r border-slate-200">
      {/* Export/Import buttons at top */}
      <div className="flex flex-col gap-2 mb-6">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export Flow
        </button>
        <button
          onClick={onImport}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180 10 10)" />
          </svg>
          Import Flow
        </button>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full"
        />
      </div>

      {/* Node sections in single column */}
      <div className="text-sm font-semibold mb-4">Nodes</div>
      <div className="flex flex-col gap-4">
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <CollapsibleSection key={category} title={category}>
            <div className="flex flex-col gap-2">
              {nodes.map((node) => (
                <Button
                  key={node.type}
                  variant="outline"
                  className="w-full justify-start"
                  draggable
                  onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, node.type)}
                >
                  {node.label}
                </Button>
              ))}
            </div>
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
}
