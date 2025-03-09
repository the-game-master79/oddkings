export interface MultiplierConfig {
  multiplier: number;
  odds: number;
  diamonds: number;
}

interface GameConfig {
  [diamonds: number]: {
    multiplier: number;
    odds: number;
  }
}

// Configurations for different mine counts
const MINE_CONFIGS: Record<number, GameConfig> = {
  1: {
    1: { multiplier: 1.03, odds: 0.96 },
    2: { multiplier: 1.08, odds: 0.92 },
    3: { multiplier: 1.12, odds: 0.88 },
    4: { multiplier: 1.18, odds: 0.84 },
    5: { multiplier: 1.24, odds: 0.80 },
    6: { multiplier: 1.30, odds: 0.76 },
    7: { multiplier: 1.37, odds: 0.72 },
    8: { multiplier: 1.46, odds: 0.68 },
    9: { multiplier: 1.55, odds: 0.64 },
    10: { multiplier: 1.65, odds: 0.60 },
    11: { multiplier: 1.77, odds: 0.56 },
    12: { multiplier: 1.90, odds: 0.52 },
    13: { multiplier: 2.06, odds: 0.48 },
    14: { multiplier: 2.25, odds: 0.44 },
    15: { multiplier: 2.47, odds: 0.40 },
    16: { multiplier: 2.75, odds: 0.36 },
    17: { multiplier: 3.09, odds: 0.32 },
    18: { multiplier: 3.54, odds: 0.28 },
    19: { multiplier: 4.12, odds: 0.24 },
    20: { multiplier: 4.95, odds: 0.20 },
    21: { multiplier: 6.19, odds: 0.16 },
    22: { multiplier: 8.25, odds: 0.12 },
    23: { multiplier: 12.37, odds: 0.08 },
    24: { multiplier: 24.75, odds: 0.04 }
  },
  2: {
    1: { multiplier: 1.08, odds: 0.92 },
    2: { multiplier: 1.17, odds: 0.85 },
    3: { multiplier: 1.29, odds: 0.77 },
    4: { multiplier: 1.41, odds: 0.70 },
    5: { multiplier: 1.56, odds: 0.63 },
    6: { multiplier: 1.74, odds: 0.57 },
    7: { multiplier: 1.94, odds: 0.51 },
    8: { multiplier: 2.18, odds: 0.45 },
    9: { multiplier: 2.47, odds: 0.40 },
    10: { multiplier: 2.83, odds: 0.35 },
    11: { multiplier: 3.26, odds: 0.30 },
    12: { multiplier: 3.81, odds: 0.26 },
    13: { multiplier: 4.50, odds: 0.22 },
    14: { multiplier: 5.40, odds: 0.18 },
    15: { multiplier: 6.60, odds: 0.15 },
    16: { multiplier: 8.25, odds: 0.12 },
    17: { multiplier: 10.61, odds: 0.09 },
    18: { multiplier: 14.14, odds: 0.07 },
    19: { multiplier: 19.80, odds: 0.05 },
    20: { multiplier: 29.70, odds: 0.03 },
    21: { multiplier: 49.50, odds: 0.02 },
    22: { multiplier: 99.00, odds: 0.01 },
    23: { multiplier: 297.00, odds: 0.00 }
  },
  3: {
    1: { multiplier: 1.12, odds: 0.88 },
    2: { multiplier: 1.29, odds: 0.77 },
    3: { multiplier: 1.48, odds: 0.67 },
    4: { multiplier: 1.71, odds: 0.58 },
    5: { multiplier: 2.00, odds: 0.50 },
    6: { multiplier: 2.35, odds: 0.42 },
    7: { multiplier: 2.79, odds: 0.35 },
    8: { multiplier: 3.35, odds: 0.30 },
    9: { multiplier: 4.07, odds: 0.24 },
    10: { multiplier: 5.00, odds: 0.20 },
    11: { multiplier: 6.26, odds: 0.16 },
    12: { multiplier: 7.96, odds: 0.12 },
    13: { multiplier: 10.35, odds: 0.10 },
    14: { multiplier: 13.80, odds: 0.07 },
    15: { multiplier: 18.97, odds: 0.05 },
    16: { multiplier: 27.11, odds: 0.04 },
    17: { multiplier: 40.66, odds: 0.02 },
    18: { multiplier: 65.06, odds: 0.02 },
    19: { multiplier: 113.85, odds: 0.01 },
    20: { multiplier: 227.70, odds: 0.00 },
    21: { multiplier: 596.25, odds: 0.00 },
    22: { multiplier: 2277.00, odds: 0.00 }
  },
  4: {
    1: { multiplier: 1.18, odds: 0.84 },
    2: { multiplier: 1.41, odds: 0.70 },
    3: { multiplier: 1.71, odds: 0.58 },
    4: { multiplier: 2.09, odds: 0.47 },
    5: { multiplier: 2.58, odds: 0.38 },
    6: { multiplier: 3.23, odds: 0.31 },
    7: { multiplier: 4.09, odds: 0.24 },
    8: { multiplier: 5.26, odds: 0.19 },
    9: { multiplier: 6.88, odds: 0.14 },
    10: { multiplier: 9.17, odds: 0.11 },
    11: { multiplier: 12.51, odds: 0.08 },
    12: { multiplier: 17.52, odds: 0.06 },
    13: { multiplier: 25.30, odds: 0.04 },
    14: { multiplier: 37.95, odds: 0.03 },
    15: { multiplier: 59.64, odds: 0.02 },
    16: { multiplier: 99.39, odds: 0.01 },
    17: { multiplier: 178.91, odds: 0.01 },
    18: { multiplier: 357.81, odds: 0.00 },
    19: { multiplier: 834.90, odds: 0.00 },
    20: { multiplier: 2504.70, odds: 0.00 },
    21: { multiplier: 12523.50, odds: 0.00 }
  },
  5: {
    1: { multiplier: 1.24, odds: 0.80 },
    2: { multiplier: 1.56, odds: 0.63 },
    3: { multiplier: 2.00, odds: 0.50 },
    4: { multiplier: 2.58, odds: 0.38 },
    5: { multiplier: 3.39, odds: 0.29 },
    6: { multiplier: 4.52, odds: 0.22 },
    7: { multiplier: 6.14, odds: 0.16 },
    8: { multiplier: 8.50, odds: 0.12 },
    9: { multiplier: 12.04, odds: 0.08 },
    10: { multiplier: 17.52, odds: 0.06 },
    11: { multiplier: 26.27, odds: 0.04 },
    12: { multiplier: 40.87, odds: 0.02 },
    13: { multiplier: 66.41, odds: 0.01 },
    14: { multiplier: 113.85, odds: 0.01 },
    15: { multiplier: 208.72, odds: 0.00 },
    16: { multiplier: 417.45, odds: 0.00 },
    17: { multiplier: 939.26, odds: 0.00 },
    18: { multiplier: 2504.70, odds: 0.00 },
    19: { multiplier: 8766.45, odds: 0.00 },
    20: { multiplier: 52598.70, odds: 0.00 }
  },
  6: {
    1: { multiplier: 1.30, odds: 0.76 },
    2: { multiplier: 1.74, odds: 0.57 },
    3: { multiplier: 2.35, odds: 0.42 },
    4: { multiplier: 3.32, odds: 0.31 },
    5: { multiplier: 4.52, odds: 0.22 },
    6: { multiplier: 6.46, odds: 0.15 },
    7: { multiplier: 9.44, odds: 0.10 },
    8: { multiplier: 14.17, odds: 0.07 },
    9: { multiplier: 21.89, odds: 0.05 },
    10: { multiplier: 35.03, odds: 0.03 },
    11: { multiplier: 58.38, odds: 0.02 },
    12: { multiplier: 102.17, odds: 0.01 },
    13: { multiplier: 189.75, odds: 0.01 },
    14: { multiplier: 379.50, odds: 0.00261 },
    15: { multiplier: 834.90, odds: 0.00119 },
    16: { multiplier: 2087.25, odds: 0.00047 },
    17: { multiplier: 6261.75, odds: 0.00016 },
    18: { multiplier: 25047.00, odds: 0.00004 },
    19: { multiplier: 175329.00, odds: 0.00001 }
  },
  7: {
    1: { multiplier: 1.37, odds: 0.72 },
    2: { multiplier: 1.94, odds: 0.51 },
    3: { multiplier: 2.79, odds: 0.35 },
    4: { multiplier: 4.09, odds: 0.24 },
    5: { multiplier: 6.14, odds: 0.16 },
    6: { multiplier: 9.44, odds: 0.10 },
    7: { multiplier: 14.95, odds: 0.07 },
    8: { multiplier: 24.47, odds: 0.04 },
    9: { multiplier: 41.60, odds: 0.02 },
    10: { multiplier: 73.95, odds: 0.01 },
    11: { multiplier: 138.66, odds: 0.007 },
    12: { multiplier: 277.33, odds: 0.0036 },
    13: { multiplier: 600.87, odds: 0.0016 },
    14: { multiplier: 1442.10, odds: 0.0007 },
    15: { multiplier: 3965.77, odds: 0.00025 },
    16: { multiplier: 13219.25, odds: 0.000075 },
    17: { multiplier: 59486.62, odds: 0.000017 },
    18: { multiplier: 475893.00, odds: 0.000002 }
  },
  8: {
    1: { multiplier: 1.46, odds: 0.68 },
    2: { multiplier: 2.18, odds: 0.54 },
    3: { multiplier: 3.35, odds: 0.30 },
    4: { multiplier: 5.26, odds: 0.19 },
    5: { multiplier: 8.50, odds: 0.12 },
    6: { multiplier: 14.17, odds: 0.07 },
    7: { multiplier: 24.47, odds: 0.04 },
    8: { multiplier: 44.05, odds: 0.02 },
    9: { multiplier: 83.20, odds: 0.01 },
    10: { multiplier: 166.40, odds: 0.006 },
    11: { multiplier: 356.56, odds: 0.003 },
    12: { multiplier: 831.98, odds: 0.0012 },
    13: { multiplier: 2163.15, odds: 0.0005 },
    14: { multiplier: 6489.45, odds: 0.0002 },
    15: { multiplier: 23794.65, odds: 0.00004 },
    16: { multiplier: 118973.25, odds: 0.000008 },
    17: { multiplier: 1070759.25, odds: 0.000001 }
  },
  9: {
    1: { multiplier: 1.55, odds: 0.64 },
    2: { multiplier: 2.47, odds: 0.40 },
    3: { multiplier: 4.07, odds: 0.24 },
    4: { multiplier: 6.88, odds: 0.14 },
    5: { multiplier: 12.04, odds: 0.08 },
    6: { multiplier: 21.89, odds: 0.05 },
    7: { multiplier: 41.60, odds: 0.02 },
    8: { multiplier: 83.20, odds: 0.01 },
    9: { multiplier: 176.80, odds: 0.006 },
    10: { multiplier: 404.10, odds: 0.002 },
    11: { multiplier: 1010.26, odds: 0.001 },
    12: { multiplier: 2828.73, odds: 0.0004 },
    13: { multiplier: 9193.39, odds: 0.0001 },
    14: { multiplier: 36773.55, odds: 0.00001 },
    15: { multiplier: 202254.52, odds: 0.000001 },
    16: { multiplier: 2022545.25, odds: 0.0000001 }
  },
  10: {
    1: { multiplier: 1.65, odds: 0.60 },
    2: { multiplier: 2.83, odds: 0.35 },
    3: { multiplier: 5.00, odds: 0.20 },
    4: { multiplier: 9.17, odds: 0.11 },
    5: { multiplier: 17.52, odds: 0.06 },
    6: { multiplier: 35.03, odds: 0.03 },
    7: { multiplier: 73.95, odds: 0.01 },
    8: { multiplier: 166.50, odds: 0.01 },
    9: { multiplier: 404.10, odds: 0.002 },
    10: { multiplier: 1077.61, odds: 0.001 },
    11: { multiplier: 3232.84, odds: 0.0003 },
    12: { multiplier: 11314.94, odds: 0.0001 },
    13: { multiplier: 49301.40, odds: 0.00002 },
    14: { multiplier: 294188.40, odds: 0.000003 },
    15: { multiplier: 3236072.40, odds: 0.0000003 }
  },
  11: {
    1: { multiplier: 1.77, odds: 0.56 },
    2: { multiplier: 3.26, odds: 0.30 },
    3: { multiplier: 6.26, odds: 0.16 },
    4: { multiplier: 15.21, odds: 0.08 },
    5: { multiplier: 26.27, odds: 0.04 },
    6: { multiplier: 58.38, odds: 0.02 },
    7: { multiplier: 138.66, odds: 0.01 },
    8: { multiplier: 356.56, odds: 0.003 },
    9: { multiplier: 1010.26, odds: 0.001 },
    10: { multiplier: 3232.84, odds: 0.0003 },
    11: { multiplier: 12123.15, odds: 0.0001 },
    12: { multiplier: 56574.69, odds: 0.00002 },
    13: { multiplier: 367735.50, odds: 0.000003 },
    14: { multiplier: 4412826.00, odds: 0.0000002 }
  },
  12: {
    1: { multiplier: 1.90, odds: 0.52 },
    2: { multiplier: 3.81, odds: 0.26 },
    3: { multiplier: 7.96, odds: 0.12 },
    4: { multiplier: 17.52, odds: 0.06 },
    5: { multiplier: 40.87, odds: 0.02 },
    6: { multiplier: 102.17, odds: 0.01 },
    7: { multiplier: 277.33, odds: 0.004 },
    8: { multiplier: 831.98, odds: 0.001 },
    9: { multiplier: 2828.73, odds: 0.0004 },
    10: { multiplier: 11314.94, odds: 0.0001 },
    11: { multiplier: 56574.69, odds: 0.00002 },
    12: { multiplier: 396022.85, odds: 0.0000003 },
    13: { multiplier: 5148297.00, odds: 0.00000002 }
  },
  13: {
    1: { multiplier: 2.06, odds: 0.48 },
    2: { multiplier: 4.50, odds: 0.22 },
    3: { multiplier: 10.35, odds: 0.10 },
    4: { multiplier: 25.30, odds: 0.039 },
    5: { multiplier: 66.41, odds: 0.015 },
    6: { multiplier: 189.75, odds: 0.005 },
    7: { multiplier: 600.87, odds: 0.002 },
    8: { multiplier: 2163.15, odds: 0.0005 },
    9: { multiplier: 9139.39, odds: 0.0001 },
    10: { multiplier: 49031.40, odds: 0.00002 },
    11: { multiplier: 367735.50, odds: 0.0000003 },
    12: { multiplier: 5148297.00, odds: 0.00000002 }
  },
  14: {
    1: { multiplier: 2.25, odds: 0.44 },
    2: { multiplier: 5.40, odds: 0.183 },
    3: { multiplier: 13.80, odds: 0.072 },
    4: { multiplier: 37.95, odds: 0.026 },
    5: { multiplier: 113.85, odds: 0.009 },
    6: { multiplier: 379.50, odds: 0.003 },
    7: { multiplier: 1442.10, odds: 0.001 },
    8: { multiplier: 6489.45, odds: 0.0002 },
    9: { multiplier: 36773.55, odds: 0.00003 },
    10: { multiplier: 294188.40, odds: 0.000003 },
    11: { multiplier: 4412826.00, odds: 0.00000002 }
  },
  15: {
    1: { multiplier: 2.47, odds: 0.40 },
    2: { multiplier: 6.60, odds: 0.15 },
    3: { multiplier: 18.97, odds: 0.05 },
    4: { multiplier: 59.64, odds: 0.017 },
    5: { multiplier: 208.72, odds: 0.005 },
    6: { multiplier: 834.90, odds: 0.001 },
    7: { multiplier: 3965.77, odds: 0.0002 },
    8: { multiplier: 23794.65, odds: 0.00004 },
    9: { multiplier: 202254.52, odds: 0.000005 },
    10: { multiplier: 3236072.40, odds: 0.0000003 }
  },
  16: {
    1: { multiplier: 2.75, odds: 0.36 },
    2: { multiplier: 8.25, odds: 0.12 },
    3: { multiplier: 27.11, odds: 0.04 },
    4: { multiplier: 99.39, odds: 0.01 },
    5: { multiplier: 417.45, odds: 0.002 },
    6: { multiplier: 2087.25, odds: 0.0005 },
    7: { multiplier: 13219.25, odds: 0.00007 },
    8: { multiplier: 118973.25, odds: 0.000008 },
    9: { multiplier: 2022545.25, odds: 0.0000005 }
  },
  17: {
    1: { multiplier: 3.09, odds: 0.32 },
    2: { multiplier: 10.61, odds: 0.09 },
    3: { multiplier: 40.66, odds: 0.024 },
    4: { multiplier: 178.91, odds: 0.006 },
    5: { multiplier: 939.26, odds: 0.0011 },
    6: { multiplier: 6261.75, odds: 0.00016 },
    7: { multiplier: 59486.62, odds: 0.000017 },
    8: { multiplier: 1070759.25, odds: 0.0000009 }
  },
  18: {
    1: { multiplier: 3.54, odds: 0.28 },
    2: { multiplier: 14.14, odds: 0.07 },
    3: { multiplier: 65.06, odds: 0.015 },
    4: { multiplier: 357.81, odds: 0.003 },
    5: { multiplier: 2504.70, odds: 0.0004 },
    6: { multiplier: 25047.00, odds: 0.00004 },
    7: { multiplier: 475893.00, odds: 0.000002 }
  },
  19: {
    1: { multiplier: 4.12, odds: 0.24 },
    2: { multiplier: 19.80, odds: 0.05 },
    3: { multiplier: 113.85, odds: 0.009 },
    4: { multiplier: 834.90, odds: 0.0012 },
    5: { multiplier: 8766.45, odds: 0.00011 },
    6: { multiplier: 175329.00, odds: 0.000006 }
  },
  20: {
    1: { multiplier: 4.95, odds: 0.20 },
    2: { multiplier: 29.70, odds: 0.03 },
    3: { multiplier: 227.70, odds: 0.004 },
    4: { multiplier: 2504.70, odds: 0.0004 },
    5: { multiplier: 52598.70, odds: 0.00002 }
  },
  21: {
    1: { multiplier: 6.19, odds: 0.16 },
    2: { multiplier: 49.50, odds: 0.02 },
    3: { multiplier: 569.25, odds: 0.002 },
    4: { multiplier: 12523.50, odds: 0.0001 }
  },
  22: {
    1: { multiplier: 8.25, odds: 0.12 },
    2: { multiplier: 99.00, odds: 0.01 },
    3: { multiplier: 2277.00, odds: 0.0004 }
  },
  23: {
    1: { multiplier: 12.38, odds: 0.08 },
    2: { multiplier: 297.00, odds: 0.003 }
  },
  24: {
    1: { multiplier: 24.75, odds: 0.04 }
  }
};

export const getMineConfig = (mines: number, revealedGems: number = 0): MultiplierConfig => {
  // Use revealed gems directly to get multiplier
  const config = MINE_CONFIGS[mines]?.[revealedGems] ?? {
    multiplier: 1,
    odds: 0
  };

  return {
    ...config,
    diamonds: revealedGems
  };
};

// Export for direct access if needed
export const MINE_MULTIPLIERS = MINE_CONFIGS;
