import { Target } from "./Target";

// escape codes
const ESC = "\u001b";

export const reset = ESC + "[0m";

export const bold = ESC + "[1m";
export const unbold = ESC + "[22m";
export const italic = ESC + "[3m";
export const unitalic = ESC + "[23m";

export const black = ESC + "[30m";
export const red = ESC + "[31m";
export const green = ESC + "[32m";
export const yellow = ESC + "[33m";
export const blue = ESC + "[34m";
export const magenta = ESC + "[35m";
export const cyan = ESC + "[36m";
export const white = ESC + "[37m";

export const line =
  black + "--------------------------------------------------" + reset;

export const ramOpts = new Map<string, number>([
  ["2GB", 2],
  ["4GB", 4],
  ["8GB", 8],
  ["16GB", 16],
  ["32GB", 32],
  ["64GB", 64],
  ["128GB", 128],
  ["256GB", 256],
  ["512GB", 512],
  ["1TB", 1024],
  ["2TB", 2048],
  ["4TB", 4096],
  ["8TB", 8192],
  ["16TB", 16384],
  ["32TB", 32768],
  ["64TB", 65536],
  ["128TB", 131072],
  ["256TB", 262144],
  ["512TB", 524288],
  ["1PB", 1048576],
]);
