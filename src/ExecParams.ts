export interface ExecParams {
  targetName: string;
  delay: number;
  port?: number;
}

// interface ExecParamsBase {
//   targetName: string;
//   delay?: number;
// }

// export interface WeakenParams extends ExecParamsBase {
//   kind: "weaken";
// }

// export interface GrowParams extends ExecParamsBase {
//   kind: "grow";
// }

// export interface HackParams extends ExecParamsBase {
//   kind: "hack";
//   port: number;
// }

// export type ExecParams = WeakenParams | GrowParams | HackParams;
