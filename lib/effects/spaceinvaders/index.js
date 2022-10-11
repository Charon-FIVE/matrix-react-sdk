"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DefaultOptions = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _arrays = require("../../utils/arrays");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const DefaultOptions = {
  maxCount: 50,
  gravity: 0.005
};
exports.DefaultOptions = DefaultOptions;
const KEY_FRAME_INTERVAL = 15; // 15ms, roughly

const GLYPH = "👾";

class SpaceInvaders {
  constructor(options) {
    var _this = this;

    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "context", null);
    (0, _defineProperty2.default)(this, "particles", []);
    (0, _defineProperty2.default)(this, "lastAnimationTime", void 0);
    (0, _defineProperty2.default)(this, "isRunning", void 0);
    (0, _defineProperty2.default)(this, "start", async function (canvas) {
      let timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;

      if (!canvas) {
        return;
      }

      _this.context = canvas.getContext('2d');
      _this.particles = [];
      const count = _this.options.maxCount;

      while (_this.particles.length < count) {
        _this.particles.push(_this.resetParticle({}, canvas.width, canvas.height));
      }

      _this.isRunning = true;
      requestAnimationFrame(_this.renderLoop);

      if (timeout) {
        window.setTimeout(_this.stop, timeout);
      }
    });
    (0, _defineProperty2.default)(this, "stop", async () => {
      this.isRunning = false;
    });
    (0, _defineProperty2.default)(this, "resetParticle", (particle, width, height) => {
      particle.x = Math.random() * width;
      particle.y = Math.random() * -height;
      particle.xCol = particle.x;
      particle.gravity = this.options.gravity + Math.random() * 6 + 4;
      return particle;
    });
    (0, _defineProperty2.default)(this, "renderLoop", () => {
      if (!this.context || !this.context.canvas) {
        return;
      }

      if (this.particles.length === 0) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      } else {
        const timeDelta = Date.now() - this.lastAnimationTime;

        if (timeDelta >= KEY_FRAME_INTERVAL || !this.lastAnimationTime) {
          // Clear the screen first
          this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
          this.lastAnimationTime = Date.now();
          this.animateAndRenderInvaders();
        }

        requestAnimationFrame(this.renderLoop);
      }
    });
    this.options = _objectSpread(_objectSpread({}, DefaultOptions), options);
  }

  animateAndRenderInvaders() {
    if (!this.context || !this.context.canvas) {
      return;
    }

    this.context.font = "50px Twemoji";

    for (const particle of (0, _arrays.arrayFastClone)(this.particles)) {
      particle.y += particle.gravity;
      this.context.save();
      this.context.fillText(GLYPH, particle.x, particle.y);
      this.context.restore();
    }
  }

}

exports.default = SpaceInvaders;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWZhdWx0T3B0aW9ucyIsIm1heENvdW50IiwiZ3Jhdml0eSIsIktFWV9GUkFNRV9JTlRFUlZBTCIsIkdMWVBIIiwiU3BhY2VJbnZhZGVycyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImNhbnZhcyIsInRpbWVvdXQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInBhcnRpY2xlcyIsImNvdW50IiwibGVuZ3RoIiwicHVzaCIsInJlc2V0UGFydGljbGUiLCJ3aWR0aCIsImhlaWdodCIsImlzUnVubmluZyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInJlbmRlckxvb3AiLCJ3aW5kb3ciLCJzZXRUaW1lb3V0Iiwic3RvcCIsInBhcnRpY2xlIiwieCIsIk1hdGgiLCJyYW5kb20iLCJ5IiwieENvbCIsImNsZWFyUmVjdCIsInRpbWVEZWx0YSIsIkRhdGUiLCJub3ciLCJsYXN0QW5pbWF0aW9uVGltZSIsImFuaW1hdGVBbmRSZW5kZXJJbnZhZGVycyIsImZvbnQiLCJhcnJheUZhc3RDbG9uZSIsInNhdmUiLCJmaWxsVGV4dCIsInJlc3RvcmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZWZmZWN0cy9zcGFjZWludmFkZXJzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IElDYW52YXNFZmZlY3QgZnJvbSAnLi4vSUNhbnZhc0VmZmVjdCc7XG5pbXBvcnQgeyBhcnJheUZhc3RDbG9uZSB9IGZyb20gXCIuLi8uLi91dGlscy9hcnJheXNcIjtcblxuZXhwb3J0IHR5cGUgU3BhY2VJbnZhZGVyc09wdGlvbnMgPSB7XG4gICAgLyoqXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGludmFkZXJzIHRvIHJlbmRlciBhdCBhIGdpdmVuIHRpbWVcbiAgICAgKi9cbiAgICBtYXhDb3VudDogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIFRoZSBhbW91bnQgb2YgZ3Jhdml0eSB0byBhcHBseSB0byB0aGUgaW52YWRlcnNcbiAgICAgKi9cbiAgICBncmF2aXR5OiBudW1iZXI7XG59O1xuXG50eXBlIEludmFkZXIgPSB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB4Q29sOiBudW1iZXI7XG4gICAgZ3Jhdml0eTogbnVtYmVyO1xufTtcblxuZXhwb3J0IGNvbnN0IERlZmF1bHRPcHRpb25zOiBTcGFjZUludmFkZXJzT3B0aW9ucyA9IHtcbiAgICBtYXhDb3VudDogNTAsXG4gICAgZ3Jhdml0eTogMC4wMDUsXG59O1xuXG5jb25zdCBLRVlfRlJBTUVfSU5URVJWQUwgPSAxNTsgLy8gMTVtcywgcm91Z2hseVxuY29uc3QgR0xZUEggPSBcIvCfkb5cIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BhY2VJbnZhZGVycyBpbXBsZW1lbnRzIElDYW52YXNFZmZlY3Qge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogU3BhY2VJbnZhZGVyc09wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHsgLi4uRGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnMgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcGFydGljbGVzOiBBcnJheTxJbnZhZGVyPiA9IFtdO1xuICAgIHByaXZhdGUgbGFzdEFuaW1hdGlvblRpbWU6IG51bWJlcjtcblxuICAgIHB1YmxpYyBpc1J1bm5pbmc6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgc3RhcnQgPSBhc3luYyAoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgdGltZW91dCA9IDMwMDApID0+IHtcbiAgICAgICAgaWYgKCFjYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLm9wdGlvbnMubWF4Q291bnQ7XG4gICAgICAgIHdoaWxlICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPCBjb3VudCkge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh0aGlzLnJlc2V0UGFydGljbGUoe30gYXMgSW52YWRlciwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yZW5kZXJMb29wKTtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuc3RvcCwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHVibGljIHN0b3AgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVzZXRQYXJ0aWNsZSA9IChwYXJ0aWNsZTogSW52YWRlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBJbnZhZGVyID0+IHtcbiAgICAgICAgcGFydGljbGUueCA9IE1hdGgucmFuZG9tKCkgKiB3aWR0aDtcbiAgICAgICAgcGFydGljbGUueSA9IE1hdGgucmFuZG9tKCkgKiAtaGVpZ2h0O1xuICAgICAgICBwYXJ0aWNsZS54Q29sID0gcGFydGljbGUueDtcbiAgICAgICAgcGFydGljbGUuZ3Jhdml0eSA9IHRoaXMub3B0aW9ucy5ncmF2aXR5ICsgKE1hdGgucmFuZG9tKCkgKiA2KSArIDQ7XG4gICAgICAgIHJldHVybiBwYXJ0aWNsZTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJMb29wID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dCB8fCAhdGhpcy5jb250ZXh0LmNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCwgdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdGltZURlbHRhID0gRGF0ZS5ub3coKSAtIHRoaXMubGFzdEFuaW1hdGlvblRpbWU7XG4gICAgICAgICAgICBpZiAodGltZURlbHRhID49IEtFWV9GUkFNRV9JTlRFUlZBTCB8fCAhdGhpcy5sYXN0QW5pbWF0aW9uVGltZSkge1xuICAgICAgICAgICAgICAgIC8vIENsZWFyIHRoZSBzY3JlZW4gZmlyc3RcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29udGV4dC5jYW52YXMud2lkdGgsIHRoaXMuY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEFuaW1hdGlvblRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUFuZFJlbmRlckludmFkZXJzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yZW5kZXJMb29wKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFuaW1hdGVBbmRSZW5kZXJJbnZhZGVycygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRleHQgfHwgIXRoaXMuY29udGV4dC5jYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHQuZm9udCA9IFwiNTBweCBUd2Vtb2ppXCI7XG4gICAgICAgIGZvciAoY29uc3QgcGFydGljbGUgb2YgYXJyYXlGYXN0Q2xvbmUodGhpcy5wYXJ0aWNsZXMpKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZS55ICs9IHBhcnRpY2xlLmdyYXZpdHk7XG5cbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5zYXZlKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFRleHQoR0xZUEgsIHBhcnRpY2xlLngsIHBhcnRpY2xlLnkpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7Ozs7OztBQW9CTyxNQUFNQSxjQUFv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