
// @ts-ignore
import * as murmur from "murmurhash3js-revisited";

export const SYM_CACHE_KEY = Symbol("cacheKey");

export interface Cacheable {
  [SYM_CACHE_KEY]?: CacheKey;

  getContentBuffer(): Buffer;
}

export class CacheKey {
  constructor(public readonly hash: string) {}
}

export class Cache<T> {
  private cache: WeakMap<CacheKey, T>;

  constructor() {}

  store(item: Cacheable, value: T): void {
    const key = this.getKey(item);
    this.cache.set(key, value);
  }

  get(item: Cacheable): T {
    const key = this.getKey(item);
    return this.cache.get(key);
  }

  has(item: Cacheable): boolean {
    const key = this.getKey(item);
    return this.cache.has(key);
  }

  private getKey(item: Cacheable): CacheKey {
    if (!item[SYM_CACHE_KEY]) {
      item[SYM_CACHE_KEY] = new CacheKey(murmur.x64.hash128(item.getContentBuffer()));
    }
    return item[SYM_CACHE_KEY];
  }
}