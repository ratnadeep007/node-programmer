import { Node, Edge } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { generatePythonCode } from '../utils/codeGenerator';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { NodeData } from '../types';

interface CodePreviewProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export function CodePreview({ nodes, edges }: CodePreviewProps) {
  const [code, setCode] = useState('# No nodes in the workspace');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (nodes.length > 0) {
      const generatedCode = generatePythonCode(nodes, edges);
      setCode(generatedCode);
    } else {
      setCode('# No nodes in the workspace');
    }
  }, [nodes, edges]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="border-l border-gray-200 w-80 bg-background p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Python Code</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={copyToClipboard}
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="flex-1 overflow-auto bg-muted p-4 rounded-lg text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
