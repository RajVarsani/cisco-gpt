import type { Node, NodeTypes } from "reactflow";
import { CityNode, CityNodeData } from "./CItyNode";

export const initialNodes = [
  {
    id: "delhi",
    type: "city-node",
    position: { x: -200, y: 100 },
    data: {
      city: "Delhi",
      customers: 100,
      T1Nodes: 10,
      T2Nodes: 20,
      activeT1Nodes: 5,
      activeT2Nodes: 10,
    },
  },
  {
    id: "mumbai",
    type: "city-node",
    position: { x: 200, y: 100 },
    data: {
      city: "Mumbai",
      customers: 200,
      T1Nodes: 20,
      T2Nodes: 40,
      activeT1Nodes: 10,
      activeT2Nodes: 20,
    },
  },
] satisfies Node<CityNodeData>[];

export const nodeTypes = {
  "city-node": CityNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
