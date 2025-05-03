import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../types';

export function useFlowExportImport(
  nodes: Node<NodeData>[],
  edges: Edge[],
  setNodes: (nodes: Node<NodeData>[]) => void,
  setEdges: (edges: Edge[]) => void
) {
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
  }, [setNodes, setEdges]);

  return { handleExport, handleImport };
}
