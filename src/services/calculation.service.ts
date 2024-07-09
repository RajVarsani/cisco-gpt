export type CityConnection = [string, string, number, number];
export type CustomerData = [string, number];
export type Result = {
  city: string;
  numCustomers: number;
  t1Routes: number;
  t2Routes: number;
  ports: {
    external: {
      g100: number;
      g400: number;
    };
    internal: {
      g100: number;
      g400: number;
    };
  };
  externalRequirements: Record<string, number>;
};

export function isValid(n: number, m: number, x: number, val: number): boolean {
  // Check if the given n, m, and x satisfy the constraint.
  return 16 * n + 32 * m + 3 * n * x >= val;
}

export function findMinCostForX(
  x: number,
  val: number,
  mRange: [number, number],
  nRange: [number, number]
): { optimalN: number; optimalM: number; minCost: number } {
  // Find minimum cost for fixed x, iterating over m and applying binary search on n.
  let minCost = Infinity;
  let optimalN = 0;
  let optimalM = 0;

  for (let m = mRange[0]; m <= mRange[1]; m++) {
    let low = nRange[0],
      high = nRange[1];

    while (low <= high) {
      const n = Math.floor((low + high) / 2);
      if (isValid(n, m, x, val)) {
        const currentCost = 250 * n + 350 * m;

        if (currentCost < minCost) {
          minCost = currentCost;
          optimalN = n;
          optimalM = m;
        }
        high = n - 1; // Try to find a smaller n
      } else {
        low = n + 1; // Need to increase n to satisfy the constraint
      }
    }
  }

  return { optimalN, optimalM, minCost };
}

export function formatRequirements(cityData: CityConnection[]) {
  const requirements: Record<string, Record<string, number>> = {};

  for (const connection of cityData) {
    const [city1, city2, upload, download] = connection;
    const maxBW = Math.max(upload, download);

    if (!requirements[city1]) {
      requirements[city1] = {};
    }
    if (!requirements[city2]) {
      requirements[city2] = {};
    }

    requirements[city1][city2] = maxBW;
    requirements[city2][city1] = maxBW;
  }

  const maxRequirement: Record<string, number> = {};

  for (const city in requirements) {
    maxRequirement[city] = Object.values(requirements[city]).reduce(
      (acc, bw) => acc + bw,
      0
    );
  }

  return {
    requirements,
    maxRequirement,
  };
}

export function findOptimalNoOfRouters(
  customerData: CustomerData[],
  requirements: Record<string, Record<string, number>>,
  maxRequirement: Record<string, number>
): Result[] {
  const results: Result[] = [];

  for (const [city, numCustomers] of customerData) {
    const rhs = maxRequirement[city] / 100 + 4 * numCustomers;

    const mRange: [number, number] = [0, rhs];
    const nRange: [number, number] = [0, rhs];

    let optimalNAbsolute = 0;
    let optimalMAbsolute = 0;
    let optimalXAbsolute = 0;
    let minCostAbsolute = Infinity;
    for (let x = 0; x <= Math.min(8, numCustomers); x++) {
      const { optimalN, optimalM, minCost } = findMinCostForX(
        x,
        rhs,
        mRange,
        nRange
      );

      if (minCost <= minCostAbsolute) {
        optimalNAbsolute = optimalN;
        optimalMAbsolute = optimalM;
        optimalXAbsolute = x;
        minCostAbsolute = minCost;
      }
    }

    const ports100GInternal = optimalNAbsolute * optimalXAbsolute;
    const ports400GInternal = numCustomers - ports100GInternal;

    const ports100GExternal = optimalNAbsolute * (8 - optimalXAbsolute);
    const ports400GExternal =
      optimalMAbsolute * 8 + optimalNAbsolute * 2 - ports400GInternal;

    results.push({
      city,
      numCustomers,
      t1Routes: optimalNAbsolute,
      t2Routes: optimalMAbsolute,
      ports: {
        external: {
          g100: ports100GExternal,
          g400: ports400GExternal,
        },
        internal: {
          g100: ports100GInternal,
          g400: ports400GInternal,
        },
      },
      externalRequirements: requirements[city],
    });
  }

  return results;
}

export type Connection = {
  from: string;
  to: string;
  g100PortsUsed: number;
  g400PortsUsed: number;
};

export type Topology = {
  nodes: Result[];
  connections: Connection[];
};

export function buildTopology(results: Result[]): Topology {
  const connections: Connection[] = [];
  const cityData: Record<string, Result> = {};
  const unmetRequirements: Record<string, Record<string, number>> = {};

  // Create a cityData map for easy access
  for (const result of results) {
    cityData[result.city] = result;
    unmetRequirements[result.city] = { ...result.externalRequirements };
  }

  function updatePorts(
    city: string,
    g100PortsUsed: number,
    g400PortsUsed: number
  ) {
    cityData[city].ports.external.g100 -= g100PortsUsed;
    cityData[city].ports.external.g400 -= g400PortsUsed;
  }

  function addConnection(
    from: string,
    to: string,
    g100PortsUsed: number,
    g400PortsUsed: number
  ) {
    connections.push({ from, to, g100PortsUsed, g400PortsUsed });
    updatePorts(from, g100PortsUsed, g400PortsUsed);
    updatePorts(to, g100PortsUsed, g400PortsUsed);
  }

  function canDirectlyConnect(
    from: string,
    to: string,
    requiredBW: number
  ): { g100: number; g400: number } | null {
    if (requiredBW <= 0) return { g100: 0, g400: 0 };

    const from100Available = cityData[from].ports.external.g100;
    const from400Available = cityData[from].ports.external.g400;
    const to100Available = cityData[to].ports.external.g100;
    const to400Available = cityData[to].ports.external.g400;

    if (from100Available > 0 && to100Available > 0 && requiredBW <= 100) {
      return { g100: 1, g400: 0 };
    }
    if (from400Available > 0 && to400Available > 0 && requiredBW <= 400) {
      return { g100: 0, g400: 1 };
    }
    const totalCapacityFrom = from100Available * 100 + from400Available * 400;
    const totalCapacityTo = to100Available * 100 + to400Available * 400;

    if (totalCapacityFrom >= requiredBW && totalCapacityTo >= requiredBW) {
      const needed400 = Math.min(
        Math.floor(requiredBW / 400),
        from400Available,
        to400Available
      );
      let remainingBW = requiredBW - needed400 * 400;

      const needed100 = Math.min(
        Math.ceil(remainingBW / 100),
        from100Available,
        to100Available
      );
      remainingBW -= needed100 * 100;

      if (remainingBW <= 0) {
        return { g100: needed100, g400: needed400 };
      }
    }
    return null;
  }

  function findExcessPaths(
    from: string,
    to: string,
    requiredBW: number
  ): Connection[] | null {
    const visited: Record<string, boolean> = {};
    const queue: { city: string; path: Connection[]; bandwidthLeft: number }[] =
      [{ city: from, path: [], bandwidthLeft: requiredBW }];

    while (queue.length > 0) {
      const { city, path, bandwidthLeft } = queue.shift()!;
      const current = path.length ? path[path.length - 1].to : city;

      if (current === to) {
        return path;
      }

      if (visited[current]) continue;
      visited[current] = true;

      for (const conn of connections) {
        if (
          (conn.from === current || conn.to === current) &&
          !visited[conn.from === current ? conn.to : conn.from]
        ) {
          const nextCity = conn.from === current ? conn.to : conn.from;
          const excessBW =
            conn.g400PortsUsed * 400 +
            conn.g100PortsUsed * 100 -
            Math.max(
              unmetRequirements[conn.from][conn.to] || 0,
              unmetRequirements[conn.to][conn.from] || 0
            );

          if (excessBW >= bandwidthLeft) {
            queue.push({
              city: nextCity,
              path: [...path, conn],
              bandwidthLeft: bandwidthLeft - excessBW,
            });
          }
        }
      }
    }
    return null;
  }

  function satisfyWithIndirectConnections() {
    for (const src in unmetRequirements) {
      for (const [dest, remainingBW] of Object.entries(
        unmetRequirements[src]
      )) {
        if (remainingBW > 0) {
          const path = findExcessPaths(src, dest, remainingBW);
          console.log({ path });
          if (path) {
            path.forEach((conn) => {
              // Use the excess bandwidth
              const excessBW =
                conn.g400PortsUsed * 400 + conn.g100PortsUsed * 100;
              if (excessBW >= remainingBW) {
                unmetRequirements[conn.from][conn.to] -= remainingBW;
                unmetRequirements[conn.to][conn.from] -= remainingBW;
              }
            });
            unmetRequirements[src][dest] = 0;
            unmetRequirements[dest][src] = 0;
          }
        }
      }
    }
  }

  // Step 1: Create a basic graph with N choose 2 connections with 0 ports
  const cities = Object.keys(cityData);
  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const city1 = cities[i];
      const city2 = cities[j];
      connections.push({
        from: city1,
        to: city2,
        g100PortsUsed: 0,
        g400PortsUsed: 0,
      });
    }
  }

  // Step 2: Create direct connections based on requirements
  for (const city in cityData) {
    const requirements = cityData[city].externalRequirements;

    for (const [targetCity, requiredBW] of Object.entries(requirements)) {
      if (
        unmetRequirements[city][targetCity] === 0 ||
        unmetRequirements[targetCity][city] === 0
      )
        continue;

      const conn = canDirectlyConnect(city, targetCity, requiredBW);
      if (conn) {
        addConnection(city, targetCity, conn.g100, conn.g400);
        unmetRequirements[city][targetCity] = 0;
        unmetRequirements[targetCity][city] = 0;
      }
    }
  }

  // Step 3: Satisfy remaining requirements with indirect connections
  satisfyWithIndirectConnections();

  // TODO: Step 4: If any requirement cannot be met with current ports, plan for additional routers.

  return { nodes: results, connections };
}
