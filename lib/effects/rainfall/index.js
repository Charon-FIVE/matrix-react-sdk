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
  maxCount: 600,
  speed: 12
};
exports.DefaultOptions = DefaultOptions;
const KEY_FRAME_INTERVAL = 15;

class Rainfall {
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
      particle.width = Math.random() * 1.5;
      particle.height = particle.width * 15 + 4;
      particle.speed = Math.random() * this.options.speed * 4 / 5 + this.options.speed;
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
          this.animateAndRenderRaindrops();
        }

        requestAnimationFrame(this.renderLoop);
      }
    });
    (0, _defineProperty2.default)(this, "animateAndRenderRaindrops", () => {
      if (!this.context || !this.context.canvas) {
        return;
      }

      const height = this.context.canvas.height;

      for (const particle of (0, _arrays.arrayFastClone)(this.particles)) {
        particle.y += particle.speed;
        this.context.save();
        this.context.beginPath();
        this.context.rect(particle.x, particle.y, particle.width, particle.height);
        this.context.fillStyle = '#5dadec'; // light blue

        this.context.fill();
        this.context.closePath();
        this.context.restore(); // Remove dead raindrops

        const maxBounds = height * 2;

        if (particle.y > height + maxBounds) {
          const idx = this.particles.indexOf(particle);
          this.particles.splice(idx, 1);
        }
      }
    });
    this.options = _objectSpread(_objectSpread({}, DefaultOptions), options);
  }

}

exports.default = Rainfall;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWZhdWx0T3B0aW9ucyIsIm1heENvdW50Iiwic3BlZWQiLCJLRVlfRlJBTUVfSU5URVJWQUwiLCJSYWluZmFsbCIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImNhbnZhcyIsInRpbWVvdXQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInBhcnRpY2xlcyIsImNvdW50IiwibGVuZ3RoIiwicHVzaCIsInJlc2V0UGFydGljbGUiLCJ3aWR0aCIsImhlaWdodCIsImlzUnVubmluZyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInJlbmRlckxvb3AiLCJ3aW5kb3ciLCJzZXRUaW1lb3V0Iiwic3RvcCIsInBhcnRpY2xlIiwieCIsIk1hdGgiLCJyYW5kb20iLCJ5IiwiY2xlYXJSZWN0IiwidGltZURlbHRhIiwiRGF0ZSIsIm5vdyIsImxhc3RBbmltYXRpb25UaW1lIiwiYW5pbWF0ZUFuZFJlbmRlclJhaW5kcm9wcyIsImFycmF5RmFzdENsb25lIiwic2F2ZSIsImJlZ2luUGF0aCIsInJlY3QiLCJmaWxsU3R5bGUiLCJmaWxsIiwiY2xvc2VQYXRoIiwicmVzdG9yZSIsIm1heEJvdW5kcyIsImlkeCIsImluZGV4T2YiLCJzcGxpY2UiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZWZmZWN0cy9yYWluZmFsbC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gQ29weXJpZ2h0IDIwMjEgSm9zaWFzIEFsbGVzdGFkXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCBJQ2FudmFzRWZmZWN0IGZyb20gJy4uL0lDYW52YXNFZmZlY3QnO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5cbmV4cG9ydCB0eXBlIFJhaW5mYWxsT3B0aW9ucyA9IHtcbiAgICAvKipcbiAgICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgcmFpbmRyb3BzIHRvIHJlbmRlciBhdCBhIGdpdmVuIHRpbWVcbiAgICAgKi9cbiAgICBtYXhDb3VudDogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIFRoZSBzcGVlZCBvZiB0aGUgcmFpbmRyb3BzXG4gICAgICovXG4gICAgc3BlZWQ6IG51bWJlcjtcbn07XG5cbnR5cGUgUmFpbmRyb3AgPSB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIHNwZWVkOiBudW1iZXI7XG59O1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdE9wdGlvbnM6IFJhaW5mYWxsT3B0aW9ucyA9IHtcbiAgICBtYXhDb3VudDogNjAwLFxuICAgIHNwZWVkOiAxMixcbn07XG5cbmNvbnN0IEtFWV9GUkFNRV9JTlRFUlZBTCA9IDE1O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSYWluZmFsbCBpbXBsZW1lbnRzIElDYW52YXNFZmZlY3Qge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogUmFpbmZhbGxPcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7IC4uLkRlZmF1bHRPcHRpb25zLCAuLi5vcHRpb25zIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHBhcnRpY2xlczogQXJyYXk8UmFpbmRyb3A+ID0gW107XG4gICAgcHJpdmF0ZSBsYXN0QW5pbWF0aW9uVGltZTogbnVtYmVyO1xuXG4gICAgcHVibGljIGlzUnVubmluZzogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBzdGFydCA9IGFzeW5jIChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCB0aW1lb3V0ID0gMzAwMCkgPT4ge1xuICAgICAgICBpZiAoIWNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMub3B0aW9ucy5tYXhDb3VudDtcbiAgICAgICAgd2hpbGUgKHRoaXMucGFydGljbGVzLmxlbmd0aCA8IGNvdW50KSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHRoaXMucmVzZXRQYXJ0aWNsZSh7fSBhcyBSYWluZHJvcCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yZW5kZXJMb29wKTtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuc3RvcCwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHVibGljIHN0b3AgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVzZXRQYXJ0aWNsZSA9IChwYXJ0aWNsZTogUmFpbmRyb3AsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogUmFpbmRyb3AgPT4ge1xuICAgICAgICBwYXJ0aWNsZS54ID0gTWF0aC5yYW5kb20oKSAqIHdpZHRoO1xuICAgICAgICBwYXJ0aWNsZS55ID0gTWF0aC5yYW5kb20oKSAqIC1oZWlnaHQ7XG4gICAgICAgIHBhcnRpY2xlLndpZHRoID0gTWF0aC5yYW5kb20oKSAqIDEuNTtcbiAgICAgICAgcGFydGljbGUuaGVpZ2h0ID0gKHBhcnRpY2xlLndpZHRoICogMTUpICsgNDtcbiAgICAgICAgcGFydGljbGUuc3BlZWQgPSAoTWF0aC5yYW5kb20oKSAqIHRoaXMub3B0aW9ucy5zcGVlZCAqIDQvNSkgKyB0aGlzLm9wdGlvbnMuc3BlZWQ7XG4gICAgICAgIHJldHVybiBwYXJ0aWNsZTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJMb29wID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dCB8fCAhdGhpcy5jb250ZXh0LmNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCwgdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdGltZURlbHRhID0gRGF0ZS5ub3coKSAtIHRoaXMubGFzdEFuaW1hdGlvblRpbWU7XG4gICAgICAgICAgICBpZiAodGltZURlbHRhID49IEtFWV9GUkFNRV9JTlRFUlZBTCB8fCAhdGhpcy5sYXN0QW5pbWF0aW9uVGltZSkge1xuICAgICAgICAgICAgICAgIC8vIENsZWFyIHRoZSBzY3JlZW4gZmlyc3RcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29udGV4dC5jYW52YXMud2lkdGgsIHRoaXMuY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RBbmltYXRpb25UaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVBbmRSZW5kZXJSYWluZHJvcHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJlbmRlckxvb3ApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYW5pbWF0ZUFuZFJlbmRlclJhaW5kcm9wcyA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRleHQgfHwgIXRoaXMuY29udGV4dC5jYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmNvbnRleHQuY2FudmFzLmhlaWdodDtcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0aWNsZSBvZiBhcnJheUZhc3RDbG9uZSh0aGlzLnBhcnRpY2xlcykpIHtcbiAgICAgICAgICAgIHBhcnRpY2xlLnkgKz0gcGFydGljbGUuc3BlZWQ7XG5cbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5zYXZlKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVjdChwYXJ0aWNsZS54LCBwYXJ0aWNsZS55LCBwYXJ0aWNsZS53aWR0aCwgcGFydGljbGUuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnIzVkYWRlYyc7IC8vIGxpZ2h0IGJsdWVcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVzdG9yZSgpO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgZGVhZCByYWluZHJvcHNcbiAgICAgICAgICAgIGNvbnN0IG1heEJvdW5kcyA9IGhlaWdodCAqIDI7XG4gICAgICAgICAgICBpZiAocGFydGljbGUueSA+IChoZWlnaHQgKyBtYXhCb3VuZHMpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5wYXJ0aWNsZXMuaW5kZXhPZihwYXJ0aWNsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7Ozs7O0FBcUJPLE1BQU1BLGNBQStCLEdBQUc7RUFDM0NDLFFBQVEsRUFBRSxHQURpQztFQUUzQ0MsS0FBSyxFQUFFO0FBRm9DLENBQXhDOztBQUtQLE1BQU1DLGtCQUFrQixHQUFHLEVBQTNCOztBQUVlLE1BQU1DLFFBQU4sQ0FBd0M7RUFHbkRDLFdBQVcsQ0FBQ0MsT0FBRCxFQUFrQztJQUFBOztJQUFBO0lBQUEsK0NBSU0sSUFKTjtJQUFBLGlEQUtSLEVBTFE7SUFBQTtJQUFBO0lBQUEsNkNBVTlCLGdCQUFPQyxNQUFQLEVBQXFEO01BQUEsSUFBbkJDLE9BQW1CLHVFQUFULElBQVM7O01BQ2hFLElBQUksQ0FBQ0QsTUFBTCxFQUFhO1FBQ1Q7TUFDSDs7TUFDRCxLQUFJLENBQUNFLE9BQUwsR0FBZUYsTUFBTSxDQUFDRyxV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