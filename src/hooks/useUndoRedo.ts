import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../types';

type FlowState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
};

export function useUndoRedo(
  setNodes: (nodes: Node<NodeData>[]) => void,
  setEdges: (edges: Edge[]) => void,
  maxHistorySize: number = 50
) {
  const [history, setHistory] = useState<FlowState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveState = useCallback((nodes: Node<NodeData>[], edges: Edge[]) => {
    const newState: FlowState = { nodes: [...nodes], edges: [...edges] };
    
    setHistory(prevHistory => {
      // Remove any future states if we're not at the end
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      // Add new state
      const updatedHistory = [...newHistory, newState];
      
      // Keep only the last maxHistorySize states
      if (updatedHistory.length > maxHistorySize) {
        updatedHistory.shift();
      }
      
      return updatedHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const previousState = history[currentIndex - 1];
      setNodes([...previousState.nodes]);
      setEdges([...previousState.edges]);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, history, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      setNodes([...nextState.nodes]);
      setEdges([...nextState.edges]);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history, setNodes, setEdges]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { saveState, undo, redo, canUndo, canRedo };
}
