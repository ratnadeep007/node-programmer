import { Node, Edge } from '@xyflow/react';

type NodeData = {
  value: number;
};

type NodeWithData = Node<NodeData>;

class CodeGenerator {
  private nodes: NodeWithData[];
  private edges: Edge[];
  private variables: Map<string, string>;
  private indent: string;

  constructor(nodes: NodeWithData[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.variables = new Map();
    this.indent = '    '; // 4 spaces for Python indentation
  }

  private getNodeById(id: string): NodeWithData | undefined {
    return this.nodes.find(node => node.id === id);
  }

  private getInputNodes(nodeId: string): NodeWithData[] {
    const inputEdges = this.edges.filter(edge => edge.target === nodeId);
    return inputEdges
      .map(edge => this.getNodeById(edge.source))
      .filter((node): node is NodeWithData => node !== undefined);
  }

  private getVariableName(nodeId: string): string {
    if (this.variables.has(nodeId)) {
      return this.variables.get(nodeId)!;
    }

    const node = this.getNodeById(nodeId);
    if (!node) return 'undefined';

    let baseName = '';
    switch (node.type) {
      case 'numberInput':
        baseName = 'num';
        break;
      case 'addition':
        baseName = 'sum';
        break;
      case 'subtraction':
        baseName = 'diff';
        break;
      case 'multiplication':
        baseName = 'product';
        break;
      case 'division':
        baseName = 'quotient';
        break;
      default:
        baseName = 'result';
    }

    const varName = `${baseName}_${this.variables.size + 1}`;
    this.variables.set(nodeId, varName);
    return varName;
  }

  private generateNodeCode(node: NodeWithData): string {
    const varName = this.getVariableName(node.id);
    const inputNodes = this.getInputNodes(node.id);
    
    switch (node.type) {
      case 'numberInput':
        return `${varName} = ${node.data.value}`;
      
      case 'addition': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        return `${varName} = ${inputs.join(' + ')}`;
      }
      
      case 'subtraction': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        if (inputs.length < 2) return `${varName} = ${inputs[0] || 0}`;
        return `${varName} = ${inputs[0]} - ${inputs[1]}`;
      }
      
      case 'multiplication': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        return `${varName} = ${inputs.join(' * ')}`;
      }
      
      case 'division': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        if (inputs.length < 2) return `${varName} = ${inputs[0] || 0}`;
        return `${varName} = ${inputs[0]} / ${inputs[1]} if ${inputs[1]} != 0 else 0  # Prevent division by zero`;
      }
      
      default:
        return `# Unknown node type: ${node.type}`;
    }
  }

  private getNodeDependencies(nodeId: string, visited = new Set<string>()): string[] {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);

    const inputNodes = this.getInputNodes(nodeId);
    const dependencies: string[] = [];

    for (const node of inputNodes) {
      dependencies.push(...this.getNodeDependencies(node.id, visited));
      dependencies.push(node.id);
    }

    return [...new Set(dependencies)];
  }

  generateCode(): string {
    const lines: string[] = [
      '# Generated Python code',
      'def calculate():'
    ];

    // Find nodes without outgoing edges (end nodes)
    const endNodes = this.nodes.filter(node => 
      !this.edges.some(edge => edge.source === node.id)
    );

    // Process nodes in dependency order
    const processedNodes = new Set<string>();
    for (const endNode of endNodes) {
      const dependencies = this.getNodeDependencies(endNode.id);
      
      for (const depId of dependencies) {
        if (!processedNodes.has(depId)) {
          const node = this.getNodeById(depId);
          if (node) {
            lines.push(this.indent + this.generateNodeCode(node));
            processedNodes.add(depId);
          }
        }
      }

      if (!processedNodes.has(endNode.id)) {
        lines.push(this.indent + this.generateNodeCode(endNode));
        processedNodes.add(endNode.id);
      }
    }

    // Add return statement for end nodes
    const returnValues = endNodes.map(node => this.getVariableName(node.id));
    if (returnValues.length === 0) {
      lines.push(this.indent + 'return None');
    } else if (returnValues.length === 1) {
      lines.push(this.indent + `return ${returnValues[0]}`);
    } else {
      lines.push(this.indent + `return (${returnValues.join(', ')})`);
    }

    // Add main block to execute the function
    lines.push('');
    lines.push('if __name__ == "__main__":');
    lines.push(this.indent + 'result = calculate()');
    lines.push(this.indent + 'print(f"Result: {result}")');

    return lines.join('\n');
  }
}

export function generatePythonCode(nodes: NodeWithData[], edges: Edge[]): string {
  const generator = new CodeGenerator(nodes, edges);
  return generator.generateCode();
}
