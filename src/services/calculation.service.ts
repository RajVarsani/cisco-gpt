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
