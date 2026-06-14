export class TtlCache {
  #store = new Map();
  #defaultTtl;

  constructor(defaultTtlMs = 30 * 60 * 1000) {
    this.#defaultTtl = defaultTtlMs;
  }

  get(key) {
    const entry = this.#store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.#store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttl) {
    this.#store.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.#defaultTtl),
    });
  }

  clear() { this.#store.clear(); }
}
