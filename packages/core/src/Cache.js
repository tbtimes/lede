// @ts-ignore
import * as murmur from "murmurhash3js-revisited";
export var SYM_CACHE_KEY = Symbol("cacheKey");
var CacheKey = /** @class */ (function () {
    function CacheKey(hash) {
        this.hash = hash;
    }
    return CacheKey;
}());
export { CacheKey };
var Cache = /** @class */ (function () {
    function Cache() {
    }
    Cache.prototype.store = function (item, value) {
        var key = this.getKey(item);
        this.cache.set(key, value);
    };
    Cache.prototype.get = function (item) {
        var key = this.getKey(item);
        return this.cache.get(key);
    };
    Cache.prototype.has = function (item) {
        var key = this.getKey(item);
        return this.cache.has(key);
    };
    Cache.prototype.getKey = function (item) {
        if (!item[SYM_CACHE_KEY]) {
            item[SYM_CACHE_KEY] = new CacheKey(murmur.x64.hash128(item.getContentBuffer()));
        }
        return item[SYM_CACHE_KEY];
    };
    return Cache;
}());
export { Cache };
