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
  buildTopology,
  CityConnection,
  CustomerData,
  findOptimalNoOfRouters,
  formatRequirements,
} from "./services/calculation.service";
import { CustomEdgeData } from "./edges/CustomEdge";

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
    const resultsv2 = buildTopology(results);

    console.log(results, resultsv2);

    return resultsv2;
  }, []);

  const [currentSimulationTime, setCurrentSimulationTime] = useState(
    new Date()
  );

  const nodesAndEdgesv2 = useMemo(() => {
    // Width of each node will be 300, we need to create a circle and arrnage all of them in a ciclular fashion
    const nodeWidth = 300;
    const radius = (calculatedData.nodes.length * nodeWidth) / 2;

    const nodes = calculatedData.nodes.map((city, index) => {
      const angle = (index * 2 * Math.PI) / calculatedData.nodes.length;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      return {
        id: city.city,
        type: "city-node",
        position: { x, y },
        data: {
          ...city,
          T1Nodes: city.t1Routes,
          T2Nodes: city.t2Routes,
          activeT1Nodes: city.t1Routes,
          activeT2Nodes: city.t2Routes,
          customers: city.numCustomers,
        },
      };
    }) satisfies Node<CityNodeData>[];

    const edges = calculatedData.connections
      .filter((item) => !(item.g100PortsUsed === 0 && item.g400PortsUsed === 0))
      .map((connection) => {
        // based on angle, decide the edge source handle and target handle ids
        const angle = -Math.atan2(
          nodes.find((node) => node.id === connection.to)!.position.y -
            nodes.find((node) => node.id === connection.from)!.position.y,
          nodes.find((node) => node.id === connection.to)!.position.x -
            nodes.find((node) => node.id === connection.from)!.position.x
        );
        let sourceHandleId = "";
        let targetHandleId = "";

        if (angle == 0) {
          sourceHandleId = "source-right";
          targetHandleId = "target-left";
        } else if (angle == Math.PI || angle == -Math.PI) {
          sourceHandleId = "source-left";
          targetHandleId = "target-right";
        }
        // angle value is -PI to PI
        else if (angle > Math.PI / 2 && angle < (3 * Math.PI) / 2) {
          sourceHandleId = "source-top";
          targetHandleId = "target-bottom";
        } else if (angle > (3 * Math.PI) / 2 || angle < -(3 * Math.PI) / 2) {
          sourceHandleId = "source-left";
          targetHandleId = "target-right";
        } else if (angle > -(3 * Math.PI) / 2 && angle < -Math.PI / 2) {
          sourceHandleId = "source-bottom";
          targetHandleId = "target-top";
        } else if (angle > -Math.PI / 2 && angle < Math.PI / 2) {
          sourceHandleId = "source-right";
          targetHandleId = "target-left";
        }

        return {
          id: `${connection.from}->${connection.to}`,
          source: connection.from,
          sourceHandle: sourceHandleId,
          target: connection.to,
          targetHandle: targetHandleId,
          animated: true,
          type: "custom-edge",
          data: {
            // label: `100G: ${connection.g100PortsUsed}, 400G: ${connection.g400PortsUsed}`,
            G100: connection.g100PortsUsed,
            G400: connection.g400PortsUsed,
          },
        };
      }) satisfies Edge<CustomEdgeData>[];

    return { nodes, edges };
  }, [calculatedData]);

  return (
    <MantineProvider>
      <ReactFlow
        nodes={nodesAndEdgesv2.nodes}
        nodeTypes={nodeTypes}
        edges={nodesAndEdgesv2.edges}
        edgeTypes={edgeTypes}
        fitView
        nodesConnectable={false}
        key={JSON.stringify(calculatedData)}
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
        {/* <Flex w="100%" justify="space-between">
          <Text c="dimmed">Time</Text>
          <Text fw={600}>
            {currentSimulationTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Flex> */}
        <Flex w="100%" justify="space-between">
          <Text c="dimmed">Total Power Consumption</Text>
          <Text fw={600}>
            {calculatedData.nodes.reduce(
              (acc, city) => acc + city.t1Routes * 250 + city.t2Routes * 350,
              0
            )}
          </Text>
        </Flex>
      </Flex>
    </MantineProvider>
  );
}
