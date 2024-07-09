import "@mantine/core/styles.css";

import { Flex, MantineProvider, Text } from "@mantine/core";

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
import {
  CityConnection,
  CustomerData,
  findOptimalNoOfRouters,
  formatRequirements,
} from "./services/calculation.service";

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

  const calculatedData = useMemo(() => {
    // Example usage
    const cityData: CityConnection[] = [
      ["A", "B", 400, 400],
      ["A", "C", 200, 200],
      ["A", "D", 200, 200],
      ["B", "C", 200, 200],
      ["B", "D", 200, 200],
    ];

    const customerData: CustomerData[] = [
      ["A", 8],
      ["C", 4],
      ["B", 8],
      ["D", 4],
    ];

    const { requirements, maxRequirement } = formatRequirements(cityData);
    const results = findOptimalNoOfRouters(
      customerData,
      requirements,
      maxRequirement
    );

    console.log(results, requirements, maxRequirement);

    return results;
  }, []);

  const [currentSimulationTime, setCurrentSimulationTime] = useState(
    new Date()
  );

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

      <Flex
        bg="white"
        px={20}
        py={16}
        bottom={50}
        left={"50%"}
        pos="fixed"
        direction="column"
        gap={20}
        miw={500}
        style={{
          transform: "translateX(-50%)",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          borderRadius: 12,
          border: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        <Flex w="100%" justify="space-between">
          <Text c="dimmed">Time</Text>
          <Text fw={600}>
            {currentSimulationTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Flex>
        <Flex w="100%" justify="space-between">
          <Text c="dimmed">Total Power Consumption</Text>
          <Text fw={600}>
            {simulationData.cities.reduce(
              (acc, city) =>
                acc + city.activeT1Nodes * 250 + city.activeT2Nodes * 350,
              0
            )}
          </Text>
        </Flex>
      </Flex>
    </MantineProvider>
  );
}
