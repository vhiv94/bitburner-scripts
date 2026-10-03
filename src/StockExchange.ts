export class StockExchange {
  _ns: NS;
  symbols: string[];

  constructor(ns: NS) {
    this._ns = ns;
    this.symbols = ns.stock.getSymbols();
  }

  get orders(): Record<string, StockOrder[]> {
    return this._ns.stock.getOrders();
  }
}
