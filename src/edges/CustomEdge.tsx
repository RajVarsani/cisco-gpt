import { Flex, Text } from "@mantine/core";
import React from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge, Edge } from "reactflow";

export type CustomEdgeData = {
  G100: number;
  G400: number;
};

const CustomEdge = ({ id, data, ...props }: Edge<CustomEdgeData>) => {
  if (!data) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempProps: any = props;
  const [edgePath, labelX, labelY] = getBezierPath(tempProps);

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <Flex
          p={12}
          px={16}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            borderColor: "rgba(0, 0, 0, 0.1)",
            filter: "drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))",
            backgroundColor: "white",
            backdropFilter: "blur(4px)",
            borderRadius: 12,
          }}
          direction="column"
          gap={8}
          className="nodrag nopan"
          w={200}
        >
          {data.G100 ? (
            <Flex w="100%" justify="space-between">
              <Text fw={400} c="dimmed" fz={16} size="xs">
                100 X {data.G100}
              </Text>
              <Text fw={600}>{100 * data.G100}GB</Text>
            </Flex>
          ) : null}
          {data.G400 ? (
            <Flex w="100%" justify="space-between">
              <Text fw={400} c="dimmed" fz={16} size="xs">
                400 X {data.G400}
              </Text>
              <Text fw={600}>{400 * data.G400}GB</Text>
            </Flex>
          ) : null}
        </Flex>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
