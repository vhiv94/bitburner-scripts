import { Target } from "./Target";

interface LogInfoBase {
  target: Target;
}

export interface WeakenInfo extends LogInfoBase {
  kind: "weaken";
  decrement: number;
}

export interface GrowInfo extends LogInfoBase {
  kind: "grow";
  increase: number;
  percentage: number;
}

export interface HackInfo extends LogInfoBase {
  kind: "hack";
  stolen: number;
  rate: number;
}

export type LogInfo = WeakenInfo | GrowInfo | HackInfo;
