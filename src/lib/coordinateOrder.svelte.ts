// Coordinate order preference store
// Persisted in localStorage

export type CoordinateOrder = "xy" | "yx";

const STORAGE_KEY = "coordinate-order";
const DEFAULT_ORDER: CoordinateOrder = "xy";

class CoordinateOrderStore {
  private _order = $state<CoordinateOrder>(this.loadFromStorage());

  private loadFromStorage(): CoordinateOrder {
    if (typeof window === "undefined") return DEFAULT_ORDER;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "xy" || stored === "yx") {
      return stored;
    }
    return DEFAULT_ORDER;
  }

  private saveToStorage(order: CoordinateOrder) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, order);
    }
  }

  get order(): CoordinateOrder {
    return this._order;
  }

  toggle() {
    this._order = this._order === "xy" ? "yx" : "xy";
    this.saveToStorage(this._order);
  }

  getLabel(): string {
    return this._order === "xy" ? "x,y" : "y,x";
  }
}

export const coordinateOrder = new CoordinateOrderStore();
