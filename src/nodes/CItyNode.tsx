import { Flex, Text, Title } from "@mantine/core";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export type CityNodeData = {
  city: string;
  customers: number;
  T1Nodes: number;
  T2Nodes: number;
  activeT1Nodes: number;
  activeT2Nodes: number;
};

export function CityNode({ data }: NodeProps<CityNodeData>) {
  return (
    <Flex
      direction="column"
      align="flex-start"
      style={{
        borderRadius: 12,
        borderColor: "rgba(0, 0, 0, 0.1)",
        filter: "drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))",
        backgroundColor: "white",
        padding: 0,
        backdropFilter: "blur(4px)",
      }}
      miw={300}
      className="react-flow__node-default"
    >
      <Handle
        type="target"
        id="target-top"
        style={{ background: "#9ca3af" }}
        position={Position.Top}
      />
      <Handle
        type="target"
        id="target-right"
        style={{ background: "#9ca3af" }}
        position={Position.Right}
      />
      <Handle
        type="target"
        id="target-bottom"
        style={{ background: "#9ca3af" }}
        position={Position.Bottom}
      />
      <Handle
        type="target"
        id="target-left"
        style={{ background: "#9ca3af" }}
        position={Position.Left}
      />

      <Title
        order={4}
        p={16}
        py={14}
        w="100%"
        ta="start"
        bg="blue.0"
        style={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "12px 12px 0 0",
        }}
      >
        {data.city}
      </Title>

      <Flex direction="column" w="100%" gap={12} p={16}>
        <Flex w="100%" justify="space-between">
          <Text fw={400} c="dimmed" fz={16}>
            Customers:
          </Text>
          <Text fw={600}>{data.customers}</Text>
        </Flex>
        <Flex w="100%" justify="space-between">
          <Text fw={400} c="dimmed" fz={16}>
            Active T1 Nodes:
          </Text>
          <Text fw={600}>{`${data.activeT1Nodes}/${data.T1Nodes}`}</Text>
        </Flex>
        <Flex w="100%" justify="space-between">
          <Text fw={400} c="dimmed" fz={16}>
            Active T2 Nodes:
          </Text>
          <Text fw={600}>{`${data.activeT2Nodes}/${data.T2Nodes}`}</Text>
        </Flex>
        <Flex w="100%" justify="space-between">
          <Text fw={400} c="dimmed" fz={16}>
            Power Consumption:
          </Text>
          <Text fw={600}>{`${
            data.activeT1Nodes * 250 + data.activeT2Nodes * 350
          }W`}</Text>
        </Flex>
      </Flex>

      <Handle
        type="source"
        id="source-top"
        style={{ background: "#9ca3af" }}
        position={Position.Top}
      />
      <Handle
        type="source"
        id="source-right"
        style={{ background: "#9ca3af" }}
        position={Position.Right}
      />
      <Handle
        type="source"
        id="source-bottom"
        style={{ background: "#9ca3af" }}
        position={Position.Bottom}
      />
      <Handle
        type="source"
        id="source-left"
        style={{ background: "#9ca3af" }}
        position={Position.Left}
      />
    </Flex>
  );
}
