import { 
  ReactFlow, 
  Background, 
  Controls,
  useNodesState, 
  useEdgesState,
  useKeyPress,
  OnEdgesDelete,
  OnNodesDelete,
  OnSelectionChangeParams,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles/search.css';
import { CodePreview } from './components/CodePreview';
import NumberInputNode from './components/nodes/NumberInputNode';
import StringInputNode from './components/nodes/StringInputNode';
import BooleanInputNode from './components/nodes/BooleanInputNode';
import AdditionNode from './components/nodes/AdditionNode';
import SubtractionNode from './components/nodes/SubtractionNode';
import MultiplicationNode from './components/nodes/MultiplicationNode';
import DivisionNode from './components/nodes/DivisionNode';
import IfElseNode from './components/nodes/IfElseNode';
import DisplayNode from './components/nodes/DisplayNode';
import ComparisonNode from './components/nodes/ComparisonNode';
import BooleanOperationNode from './components/nodes/BooleanOperationNode';
import StringOperationNode from './components/nodes/StringOperationNode';
import { useCallback, useState, useEffect } from 'react';
import { useFlowExportImport } from './hooks/useFlowExportImport';
import { useNodeOperations } from './hooks/useNodeOperations';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useCopyPaste } from './hooks/useCopyPaste';
import { useNodeSearch } from './hooks/useNodeSearch';
import { SearchBar } from './components/SearchBar';
import { Sidebar } from './components/Sidebar';
import { NodeData } from './types';
import { Node, Edge } from '@xyflow/react';

const nodeTypes: NodeTypes = {
  numberInput: NumberInputNode,
  stringInput: StringInputNode,
  booleanInput: BooleanInputNode,
  addition: AdditionNode,
  subtraction: SubtractionNode,
  multiplication: MultiplicationNode,
  division: DivisionNode,
  ifElse: IfElseNode,
  display: DisplayNode,
  comparison: ComparisonNode,
  booleanOperation: BooleanOperationNode,
  stringOperation: StringOperationNode,
};

function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const deletePressed = useKeyPress(['Backspace', 'Delete']);
  const { getViewport, setViewport } = useReactFlow();
  
  // Track selected elements
  const [selectedNodes, setSelectedNodes] = useState<Node<NodeData>[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

  // Initialize hooks
  const { saveState, undo, redo, canUndo, canRedo } = useUndoRedo(setNodes, setEdges);
  const { copySelectedNodes, paste } = useCopyPaste(edges, setNodes, setEdges);
  const { 
    searchTerm, 
    setSearchTerm, 
    searchResults, 
    selectedResultIndex,
    nextResult,
    previousResult,
    currentResult 
  } = useNodeSearch(nodes);

  const onSelectionChange = useCallback(({ nodes, edges }: OnSelectionChangeParams) => {
    setSelectedNodes((nodes as Node<NodeData>[]) || []);
    setSelectedEdges(edges || []);
  }, []);

  // Handle node deletion
  useEffect(() => {
    if (deletePressed && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
      setNodes((nds) => nds.filter((node) => !selectedNodes.some(selected => selected.id === node.id)));
      setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge)));
    }
  }, [deletePressed, selectedNodes, selectedEdges]);

  const { handleExport, handleImport } = useFlowExportImport(nodes, edges, setNodes, setEdges);
  const { onConnect } = useNodeOperations(nodes, edges, setNodes, setEdges);

  const onDragStart = useCallback((event: React.DragEvent<HTMLButtonElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
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
        value: type === 'booleanInput' ? false : type === 'stringInput' ? '' : type === 'stringOperation' ? '' : 0,
        operator: type === 'comparison' ? '==' : type === 'stringOperation' ? 'CONCAT' : undefined,
        leftValue: type === 'stringOperation' ? '' : undefined,
        rightValue: type === 'stringOperation' ? '' : undefined,
        onChange: (type === 'comparison' || type === 'stringOperation') ? 
          (id: string, value: string | number | boolean) => {
            setNodes(nds => nds.map(node => 
              node.id === id 
                ? { ...node, data: { ...node.data, operator: value as string } }
                : node
            ));
          } : undefined,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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
          
          // If this is a comparison or string operation node, update its input values
          if (node.type === 'comparison' || node.type === 'stringOperation') {
            const currentEdges = edges;
            const leftEdge = currentEdges.find(e => e.target === node.id && e.targetHandle === 'left');
            const rightEdge = currentEdges.find(e => e.target === node.id && e.targetHandle === 'right');
            
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

  // Update node highlighting when search result changes
  useEffect(() => {
    setNodes(nds => 
      nds.map(node => ({
        ...node,
        className: node.id === currentResult?.id ? 'highlight-search' : ''
      }))
    );
  }, [currentResult?.id, setNodes]);

  // Center viewport on search result
  useEffect(() => {
    if (currentResult) {
      const node = nodes.find(n => n.id === currentResult.id);
      if (node) {
        const nodeWidth = 150; // Approximate node width
        const nodeHeight = 40; // Approximate node height
        const padding = 50;

        // Calculate zoom level that fits the node with padding
        const zoom = Math.min(
          (window.innerWidth - padding * 2) / nodeWidth,
          (window.innerHeight - padding * 2) / nodeHeight,
          2 // Max zoom level
        );

        // Calculate center position
        const centerX = -(node.position.x + nodeWidth / 2) * zoom + window.innerWidth / 2;
        const centerY = -(node.position.y + nodeHeight / 2) * zoom + window.innerHeight / 2;

        // Use React Flow's setViewport to smoothly center on the node
        setViewport({ x: centerX, y: centerY, zoom }, { duration: 800 });
      }
    }
  }, [currentResult?.id, nodes, setViewport]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              if (canRedo) redo();
            } else {
              event.preventDefault();
              if (canUndo) undo();
            }
            break;
          case 'c':
            event.preventDefault();
            copySelectedNodes(selectedNodes);
            break;
          case 'v':
            event.preventDefault();
            // Get viewport for paste position
            const viewport = getViewport();
            paste({ x: viewport.x + 100, y: viewport.y + 100 });
            break;
          case 'f':
            event.preventDefault();
            // Focus search input
            const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (searchInput) searchInput.focus();
            break;
        }
      } else if (searchResults.length > 0) {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (event.shiftKey) {
            previousResult();
          } else {
            nextResult();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, copySelectedNodes, paste, selectedNodes, getViewport, searchResults.length, nextResult, previousResult]);

  // Save state for undo/redo after changes
  useEffect(() => {
    saveState(nodes, edges);
  }, [nodes, edges, saveState]);

  // Handle keyboard shortcuts for search navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'f') {
          event.preventDefault();
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select(); // Select all text if any
          }
        }
      } else if (searchResults.length > 0) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            if (event.shiftKey) {
              previousResult();
            } else {
              nextResult();
            }
            break;
          case 'ArrowUp':
            event.preventDefault();
            previousResult();
            break;
          case 'ArrowDown':
            event.preventDefault();
            nextResult();
            break;
          case 'Escape':
            event.preventDefault();
            setSearchTerm('');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults.length, nextResult, previousResult, setSearchTerm]);

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="overflow-y-auto">
        <Sidebar
          onDragStart={onDragStart}
          onExport={handleExport}
          onImport={handleImport}
        />
      </div>

      <div className="flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchResults={searchResults}
          selectedResultIndex={selectedResultIndex}
          nextResult={nextResult}
          previousResult={previousResult}
        />
        
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

function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
