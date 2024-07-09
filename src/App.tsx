import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import type { OnConnect } from "reactflow";

import { useCallback } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  return (
    <MantineProvider>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        // onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        // onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        fitView
        nodesConnectable={false}
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </MantineProvider>
  );
}
