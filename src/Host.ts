export class Host {
  _ns: NS;
  name: string;

  constructor(ns: NS, name: string) {
    this._ns = ns;
    this.name = name;
  }

  get ramMax() {
    return this._ns.getServerMaxRam(this.name);
  }

  get ramAvailable() {
    return this.ramMax - this._ns.getServerUsedRam(this.name);
  }

  get threadsAvailable() {
    return this.ramAvailable / 1.75;
  }

  getThreadsAvailableFromRamCost(ramCost: number) {
    return this.ramAvailable / ramCost;
  }

  get cores() {
    return this._ns.getServer(this.name).cpuCores;
  }
}
