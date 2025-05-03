import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../types';

export function useCopyPaste(
  edges: Edge[],
  setNodes: (nodes: Node<NodeData>[] | ((nds: Node<NodeData>[]) => Node<NodeData>[])) => void,
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void
) {
  const copySelectedNodes = useCallback((selectedNodes: Node<NodeData>[]) => {
    if (selectedNodes.length === 0) return;

    // Get selected nodes and their connected edges
    const selectedNodeIds = new Set(selectedNodes.map(node => node.id));
    const relevantEdges = edges.filter(
      edge => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );

    const dataToCopy = {
      nodes: selectedNodes,
      edges: relevantEdges
    };

    localStorage.setItem('clipboard', JSON.stringify(dataToCopy));
  }, [edges]);

  const paste = useCallback((mousePosition: { x: number, y: number }) => {
    const clipboardData = localStorage.getItem('clipboard');
    if (!clipboardData) return;

    try {
      const { nodes: copiedNodes, edges: copiedEdges } = JSON.parse(clipboardData);

      // Create new IDs for the pasted nodes
      const idMap = new Map<string, string>();
      const newNodes = copiedNodes.map((node: Node<NodeData>) => {
        const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        idMap.set(node.id, newId);

        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + mousePosition.x - copiedNodes[0].position.x + 50,
            y: node.position.y + mousePosition.y - copiedNodes[0].position.y + 50
          }
        };
      });

      // Update edge references to use new node IDs
      const newEdges = copiedEdges.map((edge: Edge) => ({
        ...edge,
        id: `e${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target
      }));

      setNodes((prevNodes: Node<NodeData>[]) => [...prevNodes, ...newNodes]);
      setEdges((prevEdges: Edge[]) => [...prevEdges, ...newEdges]);
    } catch (error) {
      console.error('Error pasting nodes:', error);
    }
  }, [setNodes, setEdges]);

  return { copySelectedNodes, paste };
}
