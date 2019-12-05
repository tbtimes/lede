import { __awaiter, __generator, __values } from "tslib";
var RenderedPage = /** @class */ (function () {
    function RenderedPage(template, script, styles) {
        this.template = template;
        this.script = script;
        this.styles = styles;
    }
    return RenderedPage;
}());
export { RenderedPage };
var Page = /** @class */ (function () {
    function Page(blocks) {
        this.blocks = blocks;
    }
    Page.prototype.render = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r, _a, _b, block, _c, _d, e_1_1;
            var e_1, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        r = [];
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, 7, 8]);
                        _a = __values(this.blocks), _b = _a.next();
                        _f.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        block = _b.value;
                        _d = (_c = r).push;
                        return [4 /*yield*/, block.render()];
                    case 3:
                        _d.apply(_c, [_f.sent()]);
                        _f.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_e = _a["return"])) _e.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, new RenderedPage(r.map(function (x) { return x.template; }).join(), r.map(function (x) { return x.scripts; }).join(), r.map(function (x) { return x.styles; }).join())];
                }
            });
        });
    };
    return Page;
}());
export { Page };
