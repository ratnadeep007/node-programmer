import { useState, useEffect, useCallback } from 'react';
import { loadPyodide, type PyodideInterface } from 'pyodide';

interface PyodideOutput {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

export function usePyodide() {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);

  // Initialize Pyodide
  useEffect(() => {
    async function initPyodide() {
      try {
        const pyodideInstance = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/',
          stdout: (text: string) => {
            setOutput(prev => [...prev, text]);
          },
          stderr: (text: string) => {
            setOutput(prev => [...prev, `Error: ${text}`]);
          }
        } as PyodideOutput);
        setPyodide(pyodideInstance);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Pyodide');
        setLoading(false);
      }
    }

    initPyodide();
  }, []);

  // Run Python code
  const runCode = useCallback(async (code: string) => {
    if (!pyodide) return;
    
    setOutput([]); // Clear previous output
    
    try {
      const result = await pyodide.runPythonAsync(code);
      if (result !== undefined && result !== null) {
        setOutput(prev => [...prev, result.toString()]);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while running the code';
      setOutput(prev => [...prev, `Error: ${errorMessage}`]);
      throw err;
    }
  }, [pyodide]);

  return {
    pyodide,
    loading,
    error,
    output,
    runCode,
    clearOutput: () => setOutput([])
  };
}
