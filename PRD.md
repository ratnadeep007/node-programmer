# Visual Node Programming Environment (VNPE) PRD

## 1. Product Overview
A web-based visual programming environment that allows users to create Python scripts through a node-based interface, initially focusing on arithmetic operations.

## 2. Technical Stack
- [x] React 18+ with TypeScript
- [x] React Flow for node system
- [x] Tailwind CSS for styling
- [x] shadcn/ui for UI components
- [x] Vite for build system

## 3. Core Features

### 3.1 Node System
- **Input Nodes**
  - [x] Number input node with configurable value
  - [x] Variable input node for reusable values

- **Arithmetic Operation Nodes**
  - [x] Addition node (2 inputs, 1 output)
  - [x] Subtraction node (2 inputs, 1 output)
  - [x] Multiplication node (2 inputs, 1 output)
  - [x] Division node (2 inputs, 1 output)

- **Output Node**
  - [x] Result display node
  - [ ] Python code generation

### 3.2 Node Interface
- [x] Drag-and-drop node creation
- [x] Visual connections between nodes using handles
- [x] Real-time calculation preview
- [ ] Node deletion and connection removal
- [x] Node configuration through a side panel

### 3.3 Python Code Generation
- [ ] Automatic generation of equivalent Python code
- [ ] Support for basic arithmetic operations
- [ ] Clean, readable code output
- [ ] Copy to clipboard functionality

### 3.4 UI/UX Requirements
- [x] Clean, minimal interface with dark/light mode
- [x] Node toolbar with categorized operations
- [x] Resizable workspace canvas
- [ ] Zoom and pan controls
- [x] Clear visual feedback for connections
- [ ] Error handling with visual indicators

## 4. User Flow
1. User opens the application
2. Drags nodes from the toolbar
3. Connects nodes using handles
4. Configures node values
5. Views real-time calculation results
6. Generates and copies Python code

## 5. MVP Features Priority
1. [x] Basic node system implementation
2. [x] Arithmetic operation nodes
3. [x] Node connections and calculations
4. [ ] Python code generation
5. [x] Basic UI components and styling
6. [ ] Error handling

## 6. Future Enhancements (Post-MVP)
- [ ] Additional mathematical operations
- [ ] Custom function nodes
- [ ] Save/load functionality
- [ ] Node grouping
- [ ] Export functionality
- [ ] More Python constructs (loops, conditionals)
