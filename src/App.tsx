import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";

import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";

import { useMemo, useState } from "react";
import { edgeTypes } from "./edges";
import { nodeTypes } from "./nodes";
import { CityNodeData } from "./nodes/CItyNode";

type SimulationCities = {
  city: string;
  customers: number;
  T1Nodes: number;
  T2Nodes: number;
  activeT1Nodes: number;
  activeT2Nodes: number;
};

type SimulationConnections = {
  source: string;
  target: string;
  t1: number;
  t2: number;
};

type SimulationData = {
  cities: SimulationCities[];
  connections: SimulationConnections[];
};

const TEMP_CITIES = [
  {
    city: "Delhi",
    customers: 100,
    T1Nodes: 10,
    T2Nodes: 20,
    activeT1Nodes: 5,
    activeT2Nodes: 10,
  },
  {
    city: "Mumbai",
    customers: 200,
    T1Nodes: 20,
    T2Nodes: 40,
    activeT1Nodes: 10,
    activeT2Nodes: 20,
  },
  {
    city: "Bangalore",
    customers: 300,
    T1Nodes: 30,
    T2Nodes: 60,
    activeT1Nodes: 15,
    activeT2Nodes: 30,
  },
  {
    city: "Kolkata",
    customers: 300,
    T1Nodes: 30,
    T2Nodes: 60,
    activeT1Nodes: 15,
    activeT2Nodes: 30,
  },
  {
    city: "Surat",
    customers: 300,
    T1Nodes: 30,
    T2Nodes: 60,
    activeT1Nodes: 15,
    activeT2Nodes: 30,
  },
];

const TEMP_CONNECTIONS = [
  {
    source: "Delhi",
    target: "Mumbai",
    t1: 10,
    t2: 20,
  },
  {
    source: "Kolkata",
    target: "Bangalore",
    t1: 10,
    t2: 20,
  },
];

export default function App() {
  const [simulationData, setSimulationData] = useState<SimulationData>({
    cities: TEMP_CITIES,
    connections: TEMP_CONNECTIONS,
  });

  const nodesAndEdges = useMemo(() => {
    // Width of each node will be 300, we need to create a circle and arrnage all of them in a ciclular fashion
    const nodeWidth = 300;
    const radius = (simulationData.cities.length * nodeWidth) / 2;

    const nodes = simulationData.cities.map((city, index) => {
      const angle = (index * 2 * Math.PI) / simulationData.cities.length;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      return {
        id: city.city,
        type: "city-node",
        position: { x, y },
        data: city,
      };
    }) satisfies Node<CityNodeData>[];

    const edges = simulationData.connections.map((connection) => {
      // based on angle, decide the edge source handle and target handle ids
      const angle = Math.atan2(
        nodes.find((node) => node.id === connection.target)!.position.y -
          nodes.find((node) => node.id === connection.source)!.position.y,
        nodes.find((node) => node.id === connection.target)!.position.x -
          nodes.find((node) => node.id === connection.source)!.position.x
      );
      let sourceHandleId = "";
      let targetHandleId = "";

      if (angle > Math.PI / 2 && angle < (3 * Math.PI) / 2) {
        sourceHandleId = "source-left";
        targetHandleId = "target-right";
      } else if (angle > Math.PI && angle < 2 * Math.PI) {
        sourceHandleId = "source-bottom";
        targetHandleId = "target-top";
      } else if (angle > (3 * Math.PI) / 2 && angle < Math.PI) {
        sourceHandleId = "source-right";
        targetHandleId = "target-left";
      } else if (angle > 0 && angle < Math.PI / 2) {
        sourceHandleId = "source-top";
        targetHandleId = "target-bottom";
      }

      return {
        id: `${connection.source}->${connection.target}`,
        source: connection.source,
        sourceHandle: sourceHandleId,
        target: connection.target,
        targetHandle: targetHandleId,
        animated: true,
      };
    }) satisfies Edge[];

    return { nodes, edges };
  }, [simulationData]);

  return (
    <MantineProvider>
      <ReactFlow
        nodes={nodesAndEdges.nodes}
        nodeTypes={nodeTypes}
        edges={nodesAndEdges.edges}
        edgeTypes={edgeTypes}
        fitView
        nodesConnectable={false}
        key={JSON.stringify(simulationData)}
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </MantineProvider>
  );
}
