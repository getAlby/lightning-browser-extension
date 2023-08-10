export class LRUCache<T, U> {
  map = new Map<T, U>();
  keys: T[] = [];

  constructor(readonly maxSize: number) {}

  has(k: T) {
    return this.map.has(k);
  }

  get(k: T) {
    const v = this.map.get(k);

    if (v !== undefined) {
      this.keys.push(k as T);

      if (this.keys.length > this.maxSize * 2) {
        this.keys.splice(-this.maxSize);
      }
    }

    return v;
  }

  set(k: T, v: U) {
    this.map.set(k, v);
    this.keys.push(k);

    if (this.map.size > this.maxSize) {
      this.map.delete(this.keys.shift() as T);
    }
  }
}
