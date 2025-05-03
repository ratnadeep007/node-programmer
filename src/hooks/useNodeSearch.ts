import { useState, useCallback, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { NodeData } from '../types';

export function useNodeSearch(nodes: Node<NodeData>[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Node<NodeData>[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

  const searchNodes = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setSelectedResultIndex(-1);
      return;
    }

    const results = nodes.filter(node => {
      const nodeValue = String(node.data.value);
      const nodeType = node.type || '';
      const nodeId = node.id;
      
      return (
        nodeValue.toLowerCase().includes(term.toLowerCase()) ||
        nodeType.toLowerCase().includes(term.toLowerCase()) ||
        nodeId.toLowerCase().includes(term.toLowerCase())
      );
    });

    setSearchResults(results);
    setSelectedResultIndex(results.length > 0 ? 0 : -1);
  }, [nodes]);

  const nextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setSelectedResultIndex(prev => 
      prev + 1 >= searchResults.length ? 0 : prev + 1
    );
  }, [searchResults.length]);

  const previousResult = useCallback(() => {
    if (searchResults.length === 0) return;
    setSelectedResultIndex(prev => 
      prev - 1 < 0 ? searchResults.length - 1 : prev - 1
    );
  }, [searchResults.length]);

  // Update search when term changes
  useEffect(() => {
    searchNodes(searchTerm);
  }, [searchTerm, searchNodes]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    selectedResultIndex,
    nextResult,
    previousResult,
    currentResult: selectedResultIndex >= 0 ? searchResults[selectedResultIndex] : null
  };
}
