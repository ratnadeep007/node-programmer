import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../types';

type NodeWithData = Node<NodeData>;

class CodeGenerator {
  private nodes: NodeWithData[];
  private edges: Edge[];
  private variables: Map<string, string>;
  private indent: string;
  private displayNodes: Set<string>;

  constructor(nodes: NodeWithData[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.variables = new Map();
    this.displayNodes = new Set();
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

    // Use custom name if provided for input nodes
    if (node?.type?.endsWith('Input') && node.data.name) {
      const customName = node.data.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      if (customName) {
        this.variables.set(nodeId, customName);
        return customName;
      }
    }

    let baseName = '';
    switch (node.type) {
      case 'numberInput':
        baseName = 'num';
        break;
      case 'stringInput':
        baseName = 'str';
        break;
      case 'booleanInput':
        baseName = 'bool';
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
      case 'comparison':
        baseName = 'result';
        break;
      case 'booleanOperation':
        baseName = 'bool_result';
        break;
      case 'stringOperation':
        baseName = 'str_result';
        break;
      case 'listInput':
        baseName = 'list';
        break;
      case 'listOperation':
        baseName = 'list_result';
        break;
      case 'display':
        this.displayNodes.add(nodeId);
        return ''; // Display nodes don't need variables
      default:
        baseName = 'result';
    }

    const varName = `${baseName}_${this.variables.size + 1}`;
    this.variables.set(nodeId, varName);
    return varName;
  }

  private generateNodeCode(node: NodeWithData): string {
    if (node.type === 'display') {
      const inputNodes = this.getInputNodes(node.id);
      const input = inputNodes[0];
      if (!input) return `print(None)  # No input connected`;
      const inputVar = this.getVariableName(input.id);
      return `print(${inputVar})`;
    }

    const varName = this.getVariableName(node.id);
    const inputNodes = this.getInputNodes(node.id);
    
    switch (node.type) {
      case 'numberInput':
        return `${varName} = ${node.data.value || 0}`;
      
      case 'stringInput':
        return `${varName} = "${node.data.value || ''}"`;
      
      case 'booleanInput':
        return `${varName} = ${node.data.value ? 'True' : 'False'}`;
      
      case 'listInput': {
        let listValue;
        try {
          listValue = JSON.parse(node.data.value as string || '[]');
        } catch {
          listValue = [];
        }
        const formattedList = listValue.map((item: any) => 
          typeof item === 'string' ? `"${item}"` : item
        ).join(', ');
        return `${varName} = [${formattedList}]`;
      }

      case 'comparison': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        if (inputs.length < 2) return `${varName} = False  # Missing inputs`;
        return `${varName} = ${inputs[0]} ${node.data.operator} ${inputs[1]}`;
      }
      
      case 'booleanOperation': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        if (inputs.length === 0) return `${varName} = False  # Missing inputs`;
        
        switch (node.data.operator) {
          case 'NOT':
            return `${varName} = not ${inputs[0]}`;
          case 'AND':
            return `${varName} = ${inputs[0]} and ${inputs[1]}`;
          case 'OR':
            return `${varName} = ${inputs[0]} or ${inputs[1]}`;
          case 'XOR':
            return `${varName} = bool(${inputs[0]}) != bool(${inputs[1]})`;
          case 'NAND':
            return `${varName} = not (${inputs[0]} and ${inputs[1]})`;
          case 'NOR':
            return `${varName} = not (${inputs[0]} or ${inputs[1]})`;
          default:
            return `${varName} = False  # Unknown operator`;
        }
      }
      
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

      case 'ifElse': {
        const condition = inputNodes.find(n => 
          this.edges.find(e => e.target === node.id && e.targetHandle === 'condition')?.source === n.id
        );
        const trueBranch = inputNodes.find(n => 
          this.edges.find(e => e.target === node.id && e.targetHandle === 'true')?.source === n.id
        );
        const falseBranch = inputNodes.find(n => 
          this.edges.find(e => e.target === node.id && e.targetHandle === 'false')?.source === n.id
        );

        const conditionVar = condition ? this.getVariableName(condition.id) : 'False';
        const trueVar = trueBranch ? this.getVariableName(trueBranch.id) : 'None';
        const falseVar = falseBranch ? this.getVariableName(falseBranch.id) : 'None';

        // Add warning comments for missing connections
        const warnings: string[] = [];
        if (!condition) warnings.push('# Warning: Missing condition, defaulting to False');
        if (!trueBranch) warnings.push('# Warning: Missing true branch, defaulting to None');
        if (!falseBranch) warnings.push('# Warning: Missing false branch, defaulting to None');

        return [
          ...warnings,
          `${varName} = ${trueVar} if ${conditionVar} else ${falseVar}`
        ].join('\n');
      }
      
      case 'division': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        if (inputs.length < 2) return `${varName} = ${inputs[0] || 0}`;
        return `${varName} = ${inputs[0]} / ${inputs[1]} if ${inputs[1]} != 0 else 0  # Prevent division by zero`;
      }

      case 'listOperation': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        if (inputs.length === 0) return `${varName} = []  # Missing inputs`;

        switch (node.data.listOperation) {
          case 'PUSH': {
            if (inputs.length < 2) return `${varName} = ${inputs[0]}  # Missing push value`;
            return `${varName} = ${inputs[0]} + [${inputs[1]}]`;
          }
          case 'POP': {
            return `${varName} = ${inputs[0]}[:-1]  # Remove last element`;
          }
          case 'MAP': {
            const mapFunc = node.data.mapFunction || 'x * 2';
            return `${varName} = [${mapFunc} for x in ${inputs[0]}]`;
          }
          case 'FILTER': {
            const filterFunc = node.data.filterCondition || 'x > 0';
            return `${varName} = [x for x in ${inputs[0]} if ${filterFunc}]`;
          }
          case 'LENGTH': {
            return `${varName} = len(${inputs[0]})`;
          }
          case 'JOIN': {
            const delimiter = JSON.stringify(node.data.joinDelimiter || ',');
            return `${varName} = ${delimiter}.join(map(str, ${inputs[0]}))`;
          }
          case 'SLICE': {
            let [start, end] = (node.data.sliceRange || '').split(',').map(s => s.trim());
            if (!start) start = '0';
            if (!end) end = 'None';
            return `${varName} = ${inputs[0]}[${start}:${end}]`;
          }
          case 'REVERSE': {
            return `${varName} = list(reversed(${inputs[0]}))`;
          }
          case 'SORT': {
            return `${varName} = sorted(${inputs[0]})`;
          }
          default:
            return `${varName} = []  # Unknown list operation`;
        }
      }

      case 'stringOperation': {
        const inputs = inputNodes.map(n => this.getVariableName(n.id));
        if (inputs.length === 0) return `${varName} = ""  # Missing inputs`;

        switch (node.data.operator) {
          case 'CONCAT':
            if (inputs.length < 2) return `${varName} = ${inputs[0] || '""'}`;
            return `${varName} = str(${inputs[0]}) + str(${inputs[1]})`;
          case 'LENGTH':
            if (!inputs[0]) return `${varName} = 0  # Missing input`;
            return `${varName} = len(str(${inputs[0]}))`;
          case 'SUBSTRING':
            if (!inputs[0]) return `${varName} = ""  # Missing input`;
            const start = node.data.startIndex ?? 0;
            const end = node.data.endIndex !== undefined ? node.data.endIndex : 'None';
            return `${varName} = str(${inputs[0]})[${start}:${end}]`;
          case 'UPPERCASE':
            return `${varName} = str(${inputs[0]}).upper()`;
          case 'LOWERCASE':
            return `${varName} = str(${inputs[0]}).lower()`;
          case 'REPLACE':
            return `${varName} = str(${inputs[0]}).replace(${JSON.stringify(node.data.searchText || '')}, ${JSON.stringify(node.data.replaceText || '')})`;
          case 'SPLIT':
            return `${varName} = str(${inputs[0]}).split(${JSON.stringify(node.data.delimiter || '')})`;
          case 'JOIN':
            return `${varName} = ${JSON.stringify(node.data.delimiter || '')}.join(${inputs[0]} if isinstance(${inputs[0]}, list) else [${inputs[0]}])`;
          case 'TRIM':
            return `${varName} = str(${inputs[0]}).strip()`;
          case 'CONTAINS':
            return `${varName} = ${JSON.stringify(node.data.searchText || '')} in str(${inputs[0]})`;
          default:
            return `${varName} = ""  # Unknown string operator`;
        }
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
      'import functools',
      'def calculate():'
    ];

    // Find all nodes that need processing (end nodes and display nodes)
    const endNodes = this.nodes.filter(node => 
      !this.edges.some(edge => edge.source === node.id) || node.type === 'display'
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

    // Add return statement for non-display end nodes
    const returnValues = endNodes
      .filter(node => !this.displayNodes.has(node.id))
      .map(node => this.getVariableName(node.id))
      .filter(name => name); // Filter out empty names (from display nodes)

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
    lines.push(this.indent + 'calculate()');

    return lines.join('\n');
  }
}

export function generatePythonCode(nodes: NodeWithData[], edges: Edge[]): string {
  const generator = new CodeGenerator(nodes, edges);
  return generator.generateCode();
}
