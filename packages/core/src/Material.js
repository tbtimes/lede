var RenderedMaterial = /** @class */ (function () {
    function RenderedMaterial(id, content) {
        this.id = id;
        this.content = content;
    }
    return RenderedMaterial;
}());
export { RenderedMaterial };
var CacheMaterial = /** @class */ (function () {
    function CacheMaterial(id, content) {
        this.id = id;
        this.content = content;
    }
    CacheMaterial.prototype.getContentBuffer = function () {
        return this.content;
    };
    return CacheMaterial;
}());
export { CacheMaterial };
