import { __awaiter, __generator, __read, __spread, __values } from "tslib";
import { RenderedMaterial } from "./Material";
var RenderedBit = /** @class */ (function () {
    function RenderedBit(template, script, styles) {
        this.template = template;
        this.script = script;
        this.styles = styles;
    }
    return RenderedBit;
}());
export { RenderedBit };
var BitContext = /** @class */ (function () {
    function BitContext() {
    }
    return BitContext;
}());
export { BitContext };
var Bit = /** @class */ (function () {
    function Bit(mats, ctx, styleCompiler, scriptCompiler, templateCompiler) {
        this.mats = mats;
        this.ctx = ctx;
        this.styleCompiler = styleCompiler;
        this.scriptCompiler = scriptCompiler;
        this.templateCompiler = templateCompiler;
    }
    Bit.prototype.render = function (matCache) {
        return __awaiter(this, void 0, void 0, function () {
            var r, _a, _b, mat, rm, c, c, c;
            var e_1, _c;
            return __generator(this, function (_d) {
                r = [];
                try {
                    for (_a = __values(this.mats), _b = _a.next(); !_b.done; _b = _a.next()) {
                        mat = _b.value;
                        rm = void 0;
                        if (matCache.has(mat)) {
                            rm = matCache.get(mat);
                        }
                        else {
                            switch (true) {
                                case /.*\.scss$/.test(mat.id): {
                                    c = this.styleCompiler.compile(mat.content, this.ctx);
                                    rm = new RenderedMaterial(mat.id, c.toString());
                                    break;
                                }
                                case /.*\.(ts|js)$/.test(mat.id): {
                                    c = this.scriptCompiler.compile(mat.content, this.ctx);
                                    rm = new RenderedMaterial(mat.id, c.toString());
                                    break;
                                }
                                case /.*\.html$/.test(mat.id): {
                                    c = this.templateCompiler.compile(mat.content, this.ctx);
                                    rm = new RenderedMaterial(mat.id, c.toString());
                                    break;
                                }
                                default: {
                                    rm = new RenderedMaterial(mat.id, mat.getContentBuffer().toString());
                                }
                            }
                            matCache.store(mat, rm);
                        }
                        r.push(rm);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    Bit.prototype.getContentBuffer = function () {
        return Buffer.concat(__spread([
            Buffer.from(JSON.stringify(this.ctx))
        ], this.mats.map(function (x) { return x.getContentBuffer(); })));
    };
    return Bit;
}());
export { Bit };
