import { ExecParams } from "./ExecParams";
import { NS } from "../NetscriptDefinitions";

export class Target {
  _ns: NS;
  name: string;
  moneyMax: number;
  securityMin: number;

  constructor(ns: NS, name: string) {
    this._ns = ns;
    this.name = name;
    this.moneyMax = this._ns.getServerMaxMoney(name);
    this.securityMin = this._ns.getServerMinSecurityLevel(name);
  }

  get moneyAvailable(): number {
    return this._ns.getServerMoneyAvailable(this.name);
  }

  get securityLevel(): number {
    return this._ns.getServerSecurityLevel(this.name);
  }

  get moneyPercentage(): number {
    return this.moneyAvailable / this.moneyMax;
  }

  get securityOffset(): number {
    return this.securityLevel - this.securityMin;
  }

  get hasRootAccess(): boolean {
    return this._ns.hasRootAccess(this.name);
  }

  get weakenTime(): number {
    return this._ns.getWeakenTime(this.name);
  }

  get growTime(): number {
    return this._ns.getGrowTime(this.name);
  }

  get hackTime(): number {
    return this._ns.getHackTime(this.name);
  }

  get growDelays(): GrowDelays {
    const runT = this.weakenTime;
    const growDelay = runT - this.growTime;
    return [growDelay, 5, runT + 10];
  }

  get hackDelays(): HackDelays {
    const runT = this.weakenTime;
    const hackDelay = runT - this.hackTime;
    const growDelay = runT - this.growTime + 10;
    return [hackDelay, 5, growDelay, 15, runT + 20];
  }

  _getWeakenThreadsMax(): number;
  _getWeakenThreadsMax(prev: func, prevThreads: number): number;

  _getWeakenThreadsMax(prev?: func, prevThreads?: number): number {
    if (prev !== undefined && prevThreads !== undefined) {
      switch (prev) {
        case "hack":
          return Math.ceil(prevThreads * 0.04);
        case "grow":
          return Math.ceil(prevThreads * 0.08);
      }
    } else return Math.ceil(this.securityOffset / 0.05);
  }

  getWeakenThreadCount(threadsAvailable: number): number {
    const tCount = this._getWeakenThreadsMax();
    return threadsAvailable > tCount ? tCount : threadsAvailable;
  }

  _getGrowThreadsMax(cores: number, money: number): number;
  _getGrowThreadsMax(cores: number, money: number, hackThreads: number): number;

  _getGrowThreadsMax(
    cores: number = 1,
    money: number,
    hackThreads?: number,
  ): number {
    const multiplier =
      this.moneyMax /
      (hackThreads === undefined
        ? money
        : money -
          hackThreads * this._ns.hackAnalyze(this.name) * this.moneyMax);
    return Math.ceil(this._ns.growthAnalyze(this.name, multiplier, cores));
  }

  getGrowThreadCounts(
    threadsAvailable: number,
    cores: number,
  ): GrowThreadCounts {
    const tCounts: GrowThreadCounts = [1, 1];
    tCounts[0] = this._getGrowThreadsMax(cores, this.moneyAvailable) + 1;
    do {
      tCounts[0]--;
      tCounts[1] = this._getWeakenThreadsMax("grow", tCounts[0]);
    } while (tCounts[0] + tCounts[1] > threadsAvailable);
    return tCounts;
  }

  _getHackThreadsMax(money: number): number {
    return Math.floor(this._ns.hackAnalyzeThreads(this.name, money * 0.99));
  }

  getHackThreadCounts(
    money: number = this.moneyAvailable,
    threadsAvailable: number,
    cores: number,
  ): HackThreadCounts {
    const tCounts: HackThreadCounts = [1, 1, 1, 1, 0];
    let total: number;
    tCounts[0] = this._getHackThreadsMax(money) + 1;
    do {
      tCounts[0]--;
      tCounts[1] = this._getWeakenThreadsMax("hack", tCounts[0]);
      tCounts[2] = this._getGrowThreadsMax(cores, money, tCounts[0]);
      tCounts[3] = this._getWeakenThreadsMax("grow", tCounts[2]);
      total = tCounts.reduce((acc, cur) => acc + cur, 0);
    } while (total > threadsAvailable);
    tCounts[4] = Math.floor(threadsAvailable / total);
    return tCounts;
  }

  weaken(host: string, threads: number, delay: number): void {
    const params: ExecParams = {
      targetName: this.name,
      delay: delay,
    };
    this._ns.exec("workers/weaken.js", host, threads, JSON.stringify(params));
  }
    
  grow(host: string, threads: number, delay: number): void {
    const params: ExecParams = {
      targetName: this.name,
      delay: delay,
    };
    this._ns.exec("workers/grow.js", host, threads, JSON.stringify(params));
  }

  hack(host: string, threads: number, delay: number, port: number): void {
    const params: ExecParams = {
      targetName: this.name,
      delay: delay,
      port: port,
    };
    this._ns.exec("workers/hack.js", host, threads, JSON.stringify(params));
  }
}


type func = "hack" | "grow";

type GrowThreadCounts = [growT: number, weakenT: number];
type HackThreadCounts = [
  hackT: number,
  weakenHT: number,
  growT: number,
  weakenGT: number,
  batchCount: number,
];

type GrowDelays = [growD: number, weakenD: number, sleep: number];
type HackDelays = [
  hackD: number,
  weakenHD: number,
  growD: number,
  weakenGD: number,
  sleep: number,
];
