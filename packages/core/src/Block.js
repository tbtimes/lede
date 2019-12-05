import { __awaiter, __generator, __values } from "tslib";
import { Cache } from "./Cache";
var RenderedBlock = /** @class */ (function () {
    function RenderedBlock(bits) {
        this.bits = bits;
    }
    Object.defineProperty(RenderedBlock.prototype, "template", {
        get: function () {
            return this.bits.map(function (x) { return x.template; }).join();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderedBlock.prototype, "styles", {
        get: function () {
            return this.bits.map(function (x) { return x.styles; }).join();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderedBlock.prototype, "scripts", {
        get: function () {
            return this.bits.map(function (x) { return x.script; }).join();
        },
        enumerable: true,
        configurable: true
    });
    return RenderedBlock;
}());
export { RenderedBlock };
var Block = /** @class */ (function () {
    function Block(resolver) {
        this.resolver = resolver;
        this.matCache = new Cache();
        this.bitCache = new Cache();
    }
    Block.prototype.render = function () {
        return __awaiter(this, void 0, void 0, function () {
            var uBits, r, uBits_1, uBits_1_1, bit, rb, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.resolver.fetch()];
                    case 1:
                        uBits = _b.sent();
                        r = [];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, 10, 11]);
                        uBits_1 = __values(uBits), uBits_1_1 = uBits_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!uBits_1_1.done) return [3 /*break*/, 8];
                        bit = uBits_1_1.value;
                        rb = void 0;
                        if (!this.bitCache.has(bit)) return [3 /*break*/, 4];
                        rb = this.bitCache.get(bit);
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, bit.render(this.matCache)];
                    case 5:
                        rb = _b.sent();
                        this.bitCache.store(bit, rb);
                        _b.label = 6;
                    case 6:
                        r.push(rb);
                        _b.label = 7;
                    case 7:
                        uBits_1_1 = uBits_1.next();
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (uBits_1_1 && !uBits_1_1.done && (_a = uBits_1["return"])) _a.call(uBits_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/, new RenderedBlock(r)];
                }
            });
        });
    };
    return Block;
}());
export { Block };
