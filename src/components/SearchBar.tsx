import type { FC } from 'react';
import { Node } from '@xyflow/react';
import { NodeData } from '../types';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Node<NodeData>[];
  selectedResultIndex: number;
  nextResult: () => void;
  previousResult: () => void;
}

export const SearchBar: FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  selectedResultIndex,
  nextResult,
  previousResult
}) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search nodes..."
        className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {searchResults.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={previousResult}
            className="p-1 hover:bg-gray-100 rounded"
            title="Previous result"
          >
            ←
          </button>
          <span className="text-sm text-gray-600">
            {selectedResultIndex + 1} of {searchResults.length}
          </span>
          <button
            onClick={nextResult}
            className="p-1 hover:bg-gray-100 rounded"
            title="Next result"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};
