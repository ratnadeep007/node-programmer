import { Button } from '@/components/ui/button';
import { CollapsibleSection } from './CollapsibleSection';
import { DragEvent } from 'react';

type SidebarProps = {
  onDragStart: (event: DragEvent<HTMLButtonElement>, nodeType: string) => void;
  onExport: () => void;
  onImport: () => void;
};

export function Sidebar({ onDragStart, onExport, onImport }: SidebarProps) {
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

      {/* Node sections in single column */}
      <div className="text-sm font-semibold mb-4">Nodes</div>
      <div className="flex flex-col gap-4">
        <CollapsibleSection title="Input">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'numberInput')}
            >
              Number Input
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'stringInput')}
            >
              String Input
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'booleanInput')}
            >
              Boolean Input
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Basic Operations">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'addition')}
            >
              Add
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'subtraction')}
            >
              Subtract
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'multiplication')}
            >
              Multiply
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'division')}
            >
              Divide
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Control Flow">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'comparison')}
            >
              Compare
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'booleanOperation')}
            >
              Boolean Operation
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'ifElse')}
            >
              If-Else
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="String Operations">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'stringOperation')}
            >
              String Operation
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Output">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e: DragEvent<HTMLButtonElement>) => onDragStart(e, 'display')}
            >
              Print
            </Button>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
