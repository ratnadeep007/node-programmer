import { 
  ReactFlow, 
  Background, 
  Controls, 
  Node, 
  Edge,
  useNodesState, 
  useEdgesState,
  Connection,
  addEdge,
  NodeTypes,
  useKeyPress,
  OnEdgesDelete,
  OnNodesDelete,
  OnSelectionChangeParams
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from './components/ui/button';
import { CollapsibleSection } from './components/ui/CollapsibleSection';
import { CodePreview } from './components/CodePreview';
import NumberInputNode from './components/nodes/NumberInputNode';
import AdditionNode from './components/nodes/AdditionNode';
import SubtractionNode from './components/nodes/SubtractionNode';
import MultiplicationNode from './components/nodes/MultiplicationNode';
import DivisionNode from './components/nodes/DivisionNode';
import { useCallback, useState, useEffect } from 'react';

type NodeData = {
  value: number;
};

const nodeTypes: NodeTypes = {
  numberInput: NumberInputNode,
  addition: AdditionNode,
  subtraction: SubtractionNode,
  multiplication: MultiplicationNode,
  division: DivisionNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const deletePressed = useKeyPress(['Backspace', 'Delete']);
  
  // Track selected elements
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

  const onSelectionChange = useCallback(({ nodes, edges }: OnSelectionChangeParams) => {
    setSelectedNodes(nodes || []);
    setSelectedEdges(edges || []);
  }, []);

  // Handle node deletion
  useEffect(() => {
    if (deletePressed && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
      setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node)));
      setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge)));
    }
  }, [deletePressed, selectedNodes, selectedEdges]);

  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };

  const onEdgesDelete: OnEdgesDelete = useCallback((edgesToDelete) => {
    setEdges((eds) => eds.filter((edge) => !edgesToDelete.includes(edge)));
  }, []);

  const onNodesDelete: OnNodesDelete = useCallback((nodesToDelete) => {
    setNodes((nds) => nds.filter((node) => !nodesToDelete.includes(node)));
    // Also remove any connected edges
    setEdges((eds) => 
      eds.filter(
        (edge) => 
          !nodesToDelete.find(
            (node) => node.id === edge.source || node.id === edge.target
          )
      )
    );
  }, []);

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    
    if (typeof type === 'undefined' || !type) {
      return;
    }

    const position = {
      x: event.clientX - 250,
      y: event.clientY - 40,
    };

    const newNode: Node<NodeData> = {
      id: `${type}-${nodes.length + 1}`,
      type,
      position,
      data: { value: 0 },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="w-screen h-screen flex">
      {/* Toolbar */}
      <div className="w-64 border-r border-gray-200 p-4 bg-background">
        <h2 className="text-lg font-semibold mb-4">Nodes</h2>
        <div className="space-y-4">
          <CollapsibleSection title="Input">
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e) => onDragStart(e, 'numberInput')}
            >
              Number Input
            </Button>
          </CollapsibleSection>

          <CollapsibleSection title="Basic Operations">
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e) => onDragStart(e, 'addition')}
            >
              Add
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e) => onDragStart(e, 'subtraction')}
            >
              Subtract
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e) => onDragStart(e, 'multiplication')}
            >
              Multiply
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              draggable
              onDragStart={(e) => onDragStart(e, 'division')}
            >
              Divide
            </Button>
          </CollapsibleSection>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodesDelete={onNodesDelete}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Code Preview */}
      <CodePreview nodes={nodes} edges={edges} />
    </div>
  );
}

export default App;
