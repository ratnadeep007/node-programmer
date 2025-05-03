import { Handle, Position, useNodeId, useReactFlow, Node, Edge } from '@xyflow/react';
import { useEffect, useState } from 'react';

type NodeData = {
  value: number;
};

type SubtractionNodeProps = {
  data: NodeData;
};

function SubtractionNode({ data }: SubtractionNodeProps) {
  const nodeId = useNodeId();
  const { getNodes, getEdges } = useReactFlow();
  const [result, setResult] = useState(0);

  const calculateDifference = () => {
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

    // Calculate difference (first number minus second number)
    if (inputValues.length === 0) return 0;
    if (inputValues.length === 1) return inputValues[0];
    return inputValues[0] - inputValues[1];
  };

  // Initial calculation
  useEffect(() => {
    const newResult = calculateDifference();
    setResult(newResult);
    data.value = newResult;
  }, []);

  // Listen for value changes
  useEffect(() => {
    const handleNodeValueChange = () => {
      const newResult = calculateDifference();
      setResult(newResult);
      data.value = newResult;
    };

    window.addEventListener('nodeValueChanged', handleNodeValueChange);
    return () => {
      window.removeEventListener('nodeValueChanged', handleNodeValueChange);
    };
  }, [nodeId, getNodes, getEdges]);

  return (
    <div className="bg-background border-2 rounded-lg p-3 min-w-[150px]">
      <div className="font-semibold mb-2">Subtract</div>
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
        <div className="mx-2 text-sm">{result}</div>
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-foreground"
          id="difference"
        />
      </div>
    </div>
  );
}

export default SubtractionNode;
