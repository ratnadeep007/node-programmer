# Visual Node Programming Environment (VNPE) - Product Requirements Document

## 1. Overview
The Visual Node Programming Environment (VNPE) is a web-based application that allows users to create Python scripts through a visual node-based interface. Users can connect different nodes representing various operations and generate executable Python code.

## 2. Technology Stack
- React 18+ with TypeScript
- React Flow for node-based interface
- Tailwind CSS for styling
- shadcn/ui for UI components

## 3. Features and Requirements

### 3.1 Node System
- **Input Nodes**
  - [x] Number input node with configurable value
  - [ ] String input node for text values
  - [ ] Boolean input node for true/false values
  - [ ] Variable input node for reusable values

- **Arithmetic Operation Nodes**
  - [x] Addition node (2+ inputs, 1 output)
  - [x] Subtraction node (2 inputs, 1 output)
  - [x] Multiplication node (2+ inputs, 1 output)
  - [x] Division node (2 inputs, 1 output)

- **Output Node**
  - [x] Result display node
  - [x] Python code generation

### 3.2 Node Interface
- [x] Drag-and-drop node creation
- [x] Visual connections between nodes using handles
- [x] Real-time calculation preview
- [x] Node deletion and connection removal
- [x] Node configuration through a side panel

### 3.3 Python Code Generation
- [x] Generate valid Python code from node graph
- [x] Support for basic arithmetic operations
- [x] Proper variable naming and scoping
- [x] Error handling (e.g., division by zero)
- [x] Real-time code preview
- [x] Copy code to clipboard functionality
- [x] Display/Print node for output

### 3.4 User Interface
- [x] Clean, minimal interface
- [x] Collapsible sections for organizing nodes
- [ ] Search functionality for nodes
- [ ] Node copy/paste functionality
- [ ] Undo/redo operations
- [ ] Save/load node configurations

### 3.5 Advanced Features (Future)
- [ ] String manipulation nodes
- [ ] Boolean operation nodes
- [x] Conditional nodes (if/else)
- [ ] Loop nodes (for/while)
- [ ] Function definition nodes
- [ ] Export to standalone Python file
- [ ] Import external Python modules

## 4. Non-functional Requirements
- [x] Responsive user interface
- [x] Real-time updates
- [ ] Keyboard shortcuts for common operations
- [ ] Performance optimization for large node graphs
- [ ] Comprehensive error handling
- [ ] Input validation

## 5. Constraints and Limitations
- Browser-based execution only
- Limited to Python code generation
- No server-side execution of generated code

## 6. Success Metrics
- [ ] Successfully generate valid Python code for all supported operations
- [ ] User can create and connect nodes without errors
- [ ] Generated code follows Python best practices
- [ ] Interface is intuitive and user-friendly
