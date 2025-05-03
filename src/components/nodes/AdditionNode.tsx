import { Handle, Position, useNodeId, useReactFlow, Node, Edge } from '@xyflow/react';
import { useEffect, useState } from 'react';

type NodeData = {
  value: number;
};

type AdditionNodeProps = {
  data: NodeData;
};

function AdditionNode({ data }: AdditionNodeProps) {
  const nodeId = useNodeId();
  const { getNodes, getEdges } = useReactFlow();
  const [sum, setSum] = useState(0);

  const calculateSum = () => {
    if (!nodeId) return 0;
    const nodes = getNodes();
    const currentNode = nodes.find((n: Node) => n.id === nodeId);
    if (!currentNode?.data) return 0;
    
    // Get connected edges
    const inputEdges = getEdges().filter((e: Edge) => e.target === nodeId);
    
    // Get input values from connected nodes
    const inputValues = inputEdges.map((edge: Edge) => {
      const sourceNode = nodes.find((n: Node) => n.id === edge.source);
      return (sourceNode?.data as NodeData)?.value || 0;
    });

    // Calculate sum
    return inputValues.reduce((acc: number, val: number) => acc + val, 0);
  };

  // Initial calculation
  useEffect(() => {
    const newSum = calculateSum();
    setSum(newSum);
    data.value = newSum;
  }, []);

  // Listen for value changes
  useEffect(() => {
    const handleNodeValueChange = () => {
      const newSum = calculateSum();
      setSum(newSum);
      data.value = newSum;
    };

    window.addEventListener('nodeValueChanged', handleNodeValueChange);
    return () => {
      window.removeEventListener('nodeValueChanged', handleNodeValueChange);
    };
  }, [nodeId, getNodes, getEdges]);

  return (
    <div className="bg-background border-2 rounded-lg p-3 min-w-[150px]">
      <div className="font-semibold mb-2">Add</div>
      <div className="flex flex-col items-center justify-between">
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-foreground"
          id="a"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-foreground mt-6"
          id="b"
        />
        <div className="mx-2 text-sm">{sum}</div>
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-foreground"
          id="sum"
        />
      </div>
    </div>
  );
}

export default AdditionNode;
