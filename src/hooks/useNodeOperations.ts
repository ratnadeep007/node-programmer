import { useCallback, useEffect } from 'react';
import { Node, Edge, Connection, addEdge } from '@xyflow/react';
import { NodeData } from '../types';

export function useNodeOperations(
  nodes: Node<NodeData>[],
  edges: Edge[],
  setNodes: (nodes: Node<NodeData>[] | ((nds: Node<NodeData>[]) => Node<NodeData>[])) => void,
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void
) {
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
      
      // Update target node's value based on the connection
      setNodes((nds: Node<NodeData>[]) => {
        const targetNode = nds.find(n => n.id === params.target);
        const sourceNode = nds.find(n => n.id === params.source);
        
        if (!targetNode || !sourceNode) return nds;

        // Handle different node types
        if (targetNode.type === 'display') {
          return nds.map(node =>
            node.id === targetNode.id
              ? { ...node, data: { ...node.data, value: sourceNode.data.value } }
              : node
          );
        }

        // Handle IfElse node inputs
        if (targetNode.type === 'ifElse') {
          return nds.map(node => {
            if (node.id === targetNode.id) {
              const updatedData = { ...node.data };
              
              switch (params.targetHandle) {
                case 'condition':
                  updatedData.condition = sourceNode.data.value;
                  break;
                case 'true':
                  updatedData.trueValue = sourceNode.data.value;
                  break;
                case 'false':
                  updatedData.falseValue = sourceNode.data.value;
                  break;
              }
              
              return { ...node, data: updatedData };
            }
            return node;
          });
        }

        // Handle Comparison node inputs
        if (targetNode.type === 'comparison') {
          return nds.map(node => {
            if (node.id === targetNode.id) {
              const updatedData = { ...node.data };
              
              switch (params.targetHandle) {
                case 'left':
                  updatedData.leftValue = sourceNode.data.value;
                  break;
                case 'right':
                  updatedData.rightValue = sourceNode.data.value;
                  break;
              }
              
              return { ...node, data: updatedData };
            }
            return node;
          });
        }

        // Handle Boolean operation node inputs
        if (targetNode.type === 'booleanOperation') {
          return nds.map(node => {
            if (node.id === targetNode.id) {
              const updatedData = { ...node.data };
              
              switch (params.targetHandle) {
                case 'left':
                  updatedData.leftValue = Boolean(sourceNode.data.value);
                  break;
                case 'right':
                  updatedData.rightValue = Boolean(sourceNode.data.value);
                  break;
              }
              
              return { ...node, data: updatedData };
            }
            return node;
          });
        }

        return nds;
      });
      
      return newEdges;
    });
  }, [setNodes]);

  // Listen for node value changes
  useEffect(() => {
    const handleNodeValueChanged = (event: CustomEvent<{ id: string; value: any }>) => {
      const { id, value } = event.detail;
      
      setNodes((nds: Node<NodeData>[]) => 
        nds.map((node: Node<NodeData>) => {
          // Update the node that changed
          if (node.id === id) {
            return { ...node, data: { ...node.data, value } };
          }
          
          // Update nodes connected to the changed node
          const connectedEdges = edges.filter(e => e.source === id);
          for (const edge of connectedEdges) {
            if (node.id === edge.target) {
              if (node.type === 'ifElse') {
                const updatedData = { ...node.data };
                switch (edge.targetHandle) {
                  case 'condition':
                    updatedData.condition = value;
                    break;
                  case 'true':
                    updatedData.trueValue = value;
                    break;
                  case 'false':
                    updatedData.falseValue = value;
                    break;
                }
                return { ...node, data: updatedData };
              }
              
              if (node.type === 'comparison') {
                const updatedData = { ...node.data };
                switch (edge.targetHandle) {
                  case 'left':
                    updatedData.leftValue = value;
                    break;
                  case 'right':
                    updatedData.rightValue = value;
                    break;
                }
                return { ...node, data: updatedData };
              }
              
              if (node.type === 'booleanOperation') {
                const updatedData = { ...node.data };
                switch (edge.targetHandle) {
                  case 'left':
                    updatedData.leftValue = Boolean(value);
                    break;
                  case 'right':
                    updatedData.rightValue = Boolean(value);
                    break;
                }
                return { ...node, data: updatedData };
              }
              
              if (node.type === 'display') {
                return { ...node, data: { ...node.data, value } };
              }
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
  }, [edges, setNodes]);

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
      setNodes((nds: Node<NodeData>[]) => 
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
  }, [nodes, edges, setNodes]);

  return { onConnect };
}
