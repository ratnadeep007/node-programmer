import { 
  ReactFlow, 
  Background, 
  Controls,
  useNodesState, 
  useEdgesState,
  addEdge,
  useKeyPress,
  OnEdgesDelete,
  OnNodesDelete,
  OnSelectionChangeParams,
  Node,
  Edge,
  Connection,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from './components/ui/button';
import { CollapsibleSection } from './components/ui/CollapsibleSection';
import { CodePreview } from './components/CodePreview';
import NumberInputNode from './components/nodes/NumberInputNode';
import StringInputNode from './components/nodes/StringInputNode';
import BooleanInputNode from './components/nodes/BooleanInputNode';
import AdditionNode from './components/nodes/AdditionNode';
import SubtractionNode from './components/nodes/SubtractionNode';
import MultiplicationNode from './components/nodes/MultiplicationNode';
import IfElseNode from './components/nodes/IfElseNode';
import DisplayNode from './components/nodes/DisplayNode';
import ComparisonNode from './components/nodes/ComparisonNode';
import { useCallback, useState, useEffect } from 'react';

interface NodeData extends Record<string, unknown> {
  value: string | number | boolean;
  operator?: string;
  onChange?: (id: string, value: string | number | boolean) => void;
  leftValue?: string | number | boolean;
  rightValue?: string | number | boolean;
}

const nodeTypes: NodeTypes = {
  numberInput: NumberInputNode,
  stringInput: StringInputNode,
  booleanInput: BooleanInputNode,
  addition: AdditionNode,
  subtraction: SubtractionNode,
  multiplication: MultiplicationNode,
  ifElse: IfElseNode,
  display: DisplayNode,
  comparison: ComparisonNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const deletePressed = useKeyPress(['Backspace', 'Delete']);
  
  // Track selected elements
  const [selectedNodes, setSelectedNodes] = useState<Node<NodeData>[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

  const onSelectionChange = useCallback(({ nodes, edges }: OnSelectionChangeParams) => {
    setSelectedNodes(nodes as Node<NodeData>[] || []);
    setSelectedEdges(edges || []);
  }, []);

  // Handle node deletion
  useEffect(() => {
    if (deletePressed && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
      setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node)));
      setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge)));
    }
  }, [deletePressed, selectedNodes, selectedEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => {
      const newEdges = addEdge({
        ...params,
        data: {
          target: params.target,
          targetHandle: params.targetHandle,
          value: undefined
        }
      }, eds);
      
      // Update target node's value if it's a display node
      setNodes((nds) => {
        const targetNode = nds.find(n => n.id === params.target);
        const sourceNode = nds.find(n => n.id === params.source);
        
        if (targetNode?.type === 'display' && sourceNode) {
          return nds.map((node) =>
            node.id === targetNode.id
              ? { ...node, data: { ...node.data, value: sourceNode.data.value } }
              : node
          );
        }
        return nds;
      });
      
      return newEdges;
    });
  }, []);

  // Listen for node value changes
  useEffect(() => {
    const handleNodeValueChanged = (event: CustomEvent<{ id: string; value: any }>) => {
      const { id, value } = event.detail;
      
      setNodes(nds => 
        nds.map(node => {
          // Update the node that changed
          if (node.id === id) {
            return { ...node, data: { ...node.data, value } };
          }
          
          // If this is a comparison node, update its input values
          if (node.type === 'comparison') {
            const leftEdge = edges.find(e => e.target === node.id && e.targetHandle === 'left');
            const rightEdge = edges.find(e => e.target === node.id && e.targetHandle === 'right');
            
            if (leftEdge && leftEdge.source === id) {
              return { 
                ...node, 
                data: { 
                  ...node.data, 
                  leftValue: value 
                } 
              };
            }
            if (rightEdge && rightEdge.source === id) {
              return { 
                ...node, 
                data: { 
                  ...node.data, 
                  rightValue: value 
                } 
              };
            }
          }
          
          return node;
        })
      );
    };

    window.addEventListener('nodeValueChanged', handleNodeValueChanged as EventListener);
    return () => {
      window.removeEventListener('nodeValueChanged', handleNodeValueChanged as EventListener);
    };
  }, [edges]);

  // Update display nodes when their source nodes change
  useEffect(() => {
    const displayNodes = nodes.filter(node => node.type === 'display');
    const updates = displayNodes.map(displayNode => {
      const sourceEdge = edges.find(edge => edge.target === displayNode.id);
      if (sourceEdge) {
        const sourceNode = nodes.find(node => node.id === sourceEdge.source);
        if (sourceNode && JSON.stringify(sourceNode.data.value) !== JSON.stringify(displayNode.data.value)) {
          return {
            id: displayNode.id,
            value: sourceNode.data.value
          };
        }
      }
      return null;
    }).filter(Boolean);

    if (updates.length > 0) {
      setNodes(nds => 
        nds.map(node => {
          const update = updates.find(u => u?.id === node.id);
          if (update) {
            return { 
              ...node, 
              data: { 
                ...node.data, 
                value: update.value 
              } 
            };
          }
          return node;
        })
      );
    }
  }, [nodes, edges]);

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

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
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
      data: { 
        value: type === 'booleanInput' ? false : type === 'stringInput' ? '' : 0,
        operator: type === 'comparison' ? '==' : undefined,
        onChange: (id: string, value: string | number | boolean) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  value,
                  operator: node.type === 'comparison' ? String(value) : node.data.operator 
                } 
              } : node
            )
          );
        },
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes]);

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Export flow as JSON
  const handleExport = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 }
    };
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportName = 'flow-export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  }, [nodes, edges]);

  // Import flow from JSON
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const flowData = JSON.parse(event.target?.result as string);
            setNodes(flowData.nodes || []);
            setEdges(flowData.edges || []);
          } catch (error) {
            console.error('Failed to parse flow data:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }, []);

  return (
    <div className="w-screen h-screen flex">
      {/* Toolbar */}
      <div className="w-64 bg-slate-100 p-4 border-r border-slate-200">
        {/* Export/Import buttons at top */}
        <div className="flex flex-col gap-2 mb-6">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Flow
          </button>
          <button
            onClick={handleImport}
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
                onDragStart={(e) => onDragStart(e, 'numberInput')}
              >
                Number Input
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                draggable
                onDragStart={(e) => onDragStart(e, 'stringInput')}
              >
                String Input
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                draggable
                onDragStart={(e) => onDragStart(e, 'booleanInput')}
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
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Control Flow">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                draggable
                onDragStart={(e) => onDragStart(e, 'comparison')}
              >
                Compare
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                draggable
                onDragStart={(e) => onDragStart(e, 'ifElse')}
              >
                If-Else
              </Button>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Output">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                draggable
                onDragStart={(e) => onDragStart(e, 'display')}
              >
                Print
              </Button>
            </div>
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
