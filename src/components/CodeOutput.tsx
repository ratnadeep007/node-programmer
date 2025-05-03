import { useEffect } from 'react';
import { usePyodide } from '../hooks/usePyodide';

type CodeOutputProps = {
  code: string;
};

export function CodeOutput({ code }: CodeOutputProps) {
  const { loading, error, output, runCode } = usePyodide();

  useEffect(() => {
    if (!loading && code) {
      runCode(code).catch(console.error);
    }
  }, [code, loading, runCode]);

  if (loading) {
    return <div className="p-4 text-sm">Loading Python environment...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="border rounded-lg bg-black/90 text-white p-4">
      <div className="text-xs font-bold mb-2">Python Output:</div>
      <pre className="text-xs font-mono whitespace-pre-wrap">
        {output.length > 0 ? output.join('\n') : 'No output'}
      </pre>
    </div>
  );
}
