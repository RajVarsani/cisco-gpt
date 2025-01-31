import type { Edge, EdgeTypes } from "reactflow";
import CustomEdge from "./CustomEdge";

export const initialEdges = [
  // { id: "a->c", source: "a", target: "c", animated: true },
  // { id: "b->d", source: "b", target: "d" },
  // { id: "c->d", source: "c", target: "d", animated: true },
  {
    id: "delhi->mumbai",
    source: "delhi",
    target: "mumbai",
    animated: true,
  },
] satisfies Edge[];

export const edgeTypes = {
  // Add your custom edge types here!
  "custom-edge": CustomEdge,
} satisfies EdgeTypes;
