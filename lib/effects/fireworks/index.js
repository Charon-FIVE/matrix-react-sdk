"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DefaultOptions = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/*
 Copyright 2020 Nurjin Jafar
 Copyright 2020 Nordeck IT + Consulting GmbH.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const DefaultOptions = {
  maxCount: 500,
  gravity: 0.05
};
exports.DefaultOptions = DefaultOptions;

class Fireworks {
  constructor(options) {
    var _this = this;

    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "context", null);
    (0, _defineProperty2.default)(this, "supportsAnimationFrame", window.requestAnimationFrame);
    (0, _defineProperty2.default)(this, "particles", []);
    (0, _defineProperty2.default)(this, "isRunning", void 0);
    (0, _defineProperty2.default)(this, "start", async function (canvas) {
      let timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;

      if (!canvas) {
        return;
      }

      _this.isRunning = true;
      _this.context = canvas.getContext('2d');

      _this.supportsAnimationFrame.call(window, _this.updateWorld);

      if (timeout) {
        window.setTimeout(_this.stop, timeout);
      }
    });
    (0, _defineProperty2.default)(this, "updateWorld", () => {
      if (!this.isRunning && this.particles.length === 0) return;
      this.update();
      this.paint();
      this.supportsAnimationFrame.call(window, this.updateWorld);
    });
    (0, _defineProperty2.default)(this, "update", () => {
      if (this.particles.length < this.options.maxCount && this.isRunning) {
        this.createFirework();
      }

      const alive = [];

      for (let i = 0; i < this.particles.length; i++) {
        if (this.move(this.particles[i])) {
          alive.push(this.particles[i]);
        }
      }

      this.particles = alive;
    });
    (0, _defineProperty2.default)(this, "paint", () => {
      if (!this.context || !this.context.canvas) return;
      this.context.globalCompositeOperation = 'destination-out';
      this.context.fillStyle = "rgba(0,0,0,0.5)";
      this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      this.context.globalCompositeOperation = 'lighter';

      for (let i = 0; i < this.particles.length; i++) {
        this.drawParticle(this.particles[i]);
      }
    });
    (0, _defineProperty2.default)(this, "createFirework", () => {
      if (!this.context || !this.context.canvas) return;
      const width = this.context.canvas.width;
      const height = this.context.canvas.height;
      const xPoint = Math.random() * (width - 200) + 100;
      const yPoint = Math.random() * (height - 200) + 100;
      const nFire = Math.random() * 50 + 100;
      const color = "rgb(" + ~~(Math.random() * 200 + 55) + "," + ~~(Math.random() * 200 + 55) + "," + ~~(Math.random() * 200 + 55) + ")";

      for (let i = 0; i < nFire; i++) {
        const particle = {};
        particle.color = color;
        particle.w = particle.h = Math.random() * 4 + 1;
        particle.x = xPoint - particle.w / 2;
        particle.y = yPoint - particle.h / 2;
        particle.vx = (Math.random() - 0.5) * 10;
        particle.vy = (Math.random() - 0.5) * 10;
        particle.alpha = Math.random() * .5 + .5;
        const vy = Math.sqrt(25 - particle.vx * particle.vx);

        if (Math.abs(particle.vy) > vy) {
          particle.vy = particle.vy > 0 ? vy : -vy;
        }

        this.particles.push(particle);
      }
    });
    (0, _defineProperty2.default)(this, "stop", async () => {
      this.isRunning = false;
    });
    (0, _defineProperty2.default)(this, "drawParticle", particle => {
      if (!this.context || !this.context.canvas) {
        return;
      }

      this.context.save();
      this.context.beginPath();
      this.context.translate(particle.x + particle.w / 2, particle.y + particle.h / 2);
      this.context.arc(0, 0, particle.w, 0, Math.PI * 2);
      this.context.fillStyle = particle.color;
      this.context.globalAlpha = particle.alpha;
      this.context.closePath();
      this.context.fill();
      this.context.restore();
    });
    (0, _defineProperty2.default)(this, "move", particle => {
      particle.x += particle.vx;
      particle.vy += this.options.gravity;
      particle.y += particle.vy;
      particle.alpha -= 0.01;
      return !(particle.x <= -particle.w || particle.x >= screen.width || particle.y >= screen.height || particle.alpha <= 0);
    });
    this.options = _objectSpread(_objectSpread({}, DefaultOptions), options);
  }

}

exports.default = Fireworks;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWZhdWx0T3B0aW9ucyIsIm1heENvdW50IiwiZ3Jhdml0eSIsIkZpcmV3b3JrcyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIndpbmRvdyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImNhbnZhcyIsInRpbWVvdXQiLCJpc1J1bm5pbmciLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInN1cHBvcnRzQW5pbWF0aW9uRnJhbWUiLCJjYWxsIiwidXBkYXRlV29ybGQiLCJzZXRUaW1lb3V0Iiwic3RvcCIsInBhcnRpY2xlcyIsImxlbmd0aCIsInVwZGF0ZSIsInBhaW50IiwiY3JlYXRlRmlyZXdvcmsiLCJhbGl2ZSIsImkiLCJtb3ZlIiwicHVzaCIsImdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiIsImZpbGxTdHlsZSIsImZpbGxSZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJkcmF3UGFydGljbGUiLCJ4UG9pbnQiLCJNYXRoIiwicmFuZG9tIiwieVBvaW50IiwibkZpcmUiLCJjb2xvciIsInBhcnRpY2xlIiwidyIsImgiLCJ4IiwieSIsInZ4IiwidnkiLCJhbHBoYSIsInNxcnQiLCJhYnMiLCJzYXZlIiwiYmVnaW5QYXRoIiwidHJhbnNsYXRlIiwiYXJjIiwiUEkiLCJnbG9iYWxBbHBoYSIsImNsb3NlUGF0aCIsImZpbGwiLCJyZXN0b3JlIiwic2NyZWVuIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2VmZmVjdHMvZmlyZXdvcmtzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gQ29weXJpZ2h0IDIwMjAgTnVyamluIEphZmFyXG4gQ29weXJpZ2h0IDIwMjAgTm9yZGVjayBJVCArIENvbnN1bHRpbmcgR21iSC5cblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgSUNhbnZhc0VmZmVjdCBmcm9tICcuLi9JQ2FudmFzRWZmZWN0JztcblxuZXhwb3J0IHR5cGUgRmlyZXdvcmtzT3B0aW9ucyA9IHtcbiAgICAvKipcbiAgICAgKiBtYXggZmlyZXdvcmtzIGNvdW50XG4gICAgICovXG4gICAgbWF4Q291bnQ6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiBncmF2aXR5IHZhbHVlIHRoYXQgZmlyZXdvcmsgYWRkcyB0byBzaGlmdCBmcm9tIGl0J3Mgc3RhcnQgcG9zaXRpb25cbiAgICAgKi9cbiAgICBncmF2aXR5OiBudW1iZXI7XG59O1xuXG50eXBlIEZpcmV3b3Jrc1BhcnRpY2xlID0ge1xuICAgIC8qKlxuICAgICAqIGNvbG9yXG4gICAgICovXG4gICAgY29sb3I6IHN0cmluZztcbiAgICAvKipcbiAgICAgKiB4LHkgYXJlIHRoZSBwb2ludCB3aGVyZSB0aGUgcGFydGljbGUgc3RhcnRzIHRvIHBvc2l0aW9uIG9uIGNhbnZhc1xuICAgICAqL1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogdngsdnkgc2hpZnQgdmFsdWVzIGZyb20geCBhbmQgeVxuICAgICAqL1xuICAgIHZ4OiBudW1iZXI7XG4gICAgdnk6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiB0aGUgYWxwaGEgb3BhY2l0eSBvZiB0aGUgZmlyZXdvcmsgcGFydGljbGUgKGJldHdlZW4gMCBhbmQgMSwgd2hlcmUgMSBpcyBvcGFxdWUgYW5kIDAgaXMgaW52aXNpYmxlKVxuICAgICAqL1xuICAgIGFscGhhOiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogdyxoIHdpZHRoIGFuZCBoZWlnaHRcbiAgICAgKi9cbiAgICB3OiBudW1iZXI7XG4gICAgaDogbnVtYmVyO1xufTtcblxuZXhwb3J0IGNvbnN0IERlZmF1bHRPcHRpb25zOiBGaXJld29ya3NPcHRpb25zID0ge1xuICAgIG1heENvdW50OiA1MDAsXG4gICAgZ3Jhdml0eTogMC4wNSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpcmV3b3JrcyBpbXBsZW1lbnRzIElDYW52YXNFZmZlY3Qge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogRmlyZXdvcmtzT3B0aW9ucztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0geyAuLi5EZWZhdWx0T3B0aW9ucywgLi4ub3B0aW9ucyB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdXBwb3J0c0FuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICBwcml2YXRlIHBhcnRpY2xlczogQXJyYXk8RmlyZXdvcmtzUGFydGljbGU+ID0gW107XG4gICAgcHVibGljIGlzUnVubmluZzogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBzdGFydCA9IGFzeW5jIChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCB0aW1lb3V0ID0gMzAwMCkgPT4ge1xuICAgICAgICBpZiAoIWNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuc3VwcG9ydHNBbmltYXRpb25GcmFtZS5jYWxsKHdpbmRvdywgdGhpcy51cGRhdGVXb3JsZCk7XG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnN0b3AsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlV29ybGQgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5pc1J1bm5pbmcgJiYgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIHRoaXMucGFpbnQoKTtcbiAgICAgICAgdGhpcy5zdXBwb3J0c0FuaW1hdGlvbkZyYW1lLmNhbGwod2luZG93LCB0aGlzLnVwZGF0ZVdvcmxkKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPCB0aGlzLm9wdGlvbnMubWF4Q291bnQgJiYgdGhpcy5pc1J1bm5pbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRmlyZXdvcmsoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhbGl2ZSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmUodGhpcy5wYXJ0aWNsZXNbaV0pKSB7XG4gICAgICAgICAgICAgICAgYWxpdmUucHVzaCh0aGlzLnBhcnRpY2xlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBhbGl2ZTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBwYWludCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRleHQgfHwgIXRoaXMuY29udGV4dC5jYW52YXMpIHJldHVybjtcbiAgICAgICAgdGhpcy5jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1vdXQnO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuNSlcIjtcbiAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuY29udGV4dC5jYW52YXMud2lkdGgsIHRoaXMuY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdsaWdodGVyJztcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdQYXJ0aWNsZSh0aGlzLnBhcnRpY2xlc1tpXSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjcmVhdGVGaXJld29yayA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRleHQgfHwgIXRoaXMuY29udGV4dC5jYW52YXMpIHJldHVybjtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmNvbnRleHQuY2FudmFzLmhlaWdodDtcbiAgICAgICAgY29uc3QgeFBvaW50ID0gTWF0aC5yYW5kb20oKSAqICh3aWR0aCAtIDIwMCkgKyAxMDA7XG4gICAgICAgIGNvbnN0IHlQb2ludCA9IE1hdGgucmFuZG9tKCkgKiAoaGVpZ2h0IC0gMjAwKSArIDEwMDtcbiAgICAgICAgY29uc3QgbkZpcmUgPSBNYXRoLnJhbmRvbSgpICogNTAgKyAxMDA7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gXCJyZ2IoXCIrKH5+KE1hdGgucmFuZG9tKCkqMjAwKzU1KSkrXCIsXCJcbiAgICAgICAgICAgICsofn4oTWF0aC5yYW5kb20oKSoyMDArNTUpKStcIixcIisofn4oTWF0aC5yYW5kb20oKSoyMDArNTUpKStcIilcIjtcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPG5GaXJlOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnRpY2xlID0gPEZpcmV3b3Jrc1BhcnRpY2xlPnt9O1xuICAgICAgICAgICAgcGFydGljbGUuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgICAgIHBhcnRpY2xlLncgPSBwYXJ0aWNsZS5oID0gTWF0aC5yYW5kb20oKSAqIDQgKyAxO1xuICAgICAgICAgICAgcGFydGljbGUueCA9IHhQb2ludCAtIHBhcnRpY2xlLncgLyAyO1xuICAgICAgICAgICAgcGFydGljbGUueSA9IHlQb2ludCAtIHBhcnRpY2xlLmggLyAyO1xuICAgICAgICAgICAgcGFydGljbGUudnggPSAoTWF0aC5yYW5kb20oKS0wLjUpKjEwO1xuICAgICAgICAgICAgcGFydGljbGUudnkgPSAoTWF0aC5yYW5kb20oKS0wLjUpKjEwO1xuICAgICAgICAgICAgcGFydGljbGUuYWxwaGEgPSBNYXRoLnJhbmRvbSgpKi41Ky41O1xuICAgICAgICAgICAgY29uc3QgdnkgPSBNYXRoLnNxcnQoMjUgLSBwYXJ0aWNsZS52eCAqIHBhcnRpY2xlLnZ4KTtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhwYXJ0aWNsZS52eSkgPiB2eSkge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnZ5ID0gcGFydGljbGUudnkgPiAwID8gdnk6IC12eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2gocGFydGljbGUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyBzdG9wID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGRyYXdQYXJ0aWNsZSA9IChwYXJ0aWNsZTogRmlyZXdvcmtzUGFydGljbGUpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRleHQgfHwgIXRoaXMuY29udGV4dC5jYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHQuc2F2ZSgpO1xuICAgICAgICB0aGlzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LnRyYW5zbGF0ZShwYXJ0aWNsZS54ICsgcGFydGljbGUudyAvIDIsIHBhcnRpY2xlLnkgKyBwYXJ0aWNsZS5oIC8gMik7XG4gICAgICAgIHRoaXMuY29udGV4dC5hcmMoMCwgMCwgcGFydGljbGUudywgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gcGFydGljbGUuY29sb3I7XG4gICAgICAgIHRoaXMuY29udGV4dC5nbG9iYWxBbHBoYSA9IHBhcnRpY2xlLmFscGhhO1xuXG4gICAgICAgIHRoaXMuY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmZpbGwoKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBtb3ZlID0gKHBhcnRpY2xlOiBGaXJld29ya3NQYXJ0aWNsZSkgPT4ge1xuICAgICAgICBwYXJ0aWNsZS54ICs9IHBhcnRpY2xlLnZ4O1xuICAgICAgICBwYXJ0aWNsZS52eSArPSB0aGlzLm9wdGlvbnMuZ3Jhdml0eTtcbiAgICAgICAgcGFydGljbGUueSArPSBwYXJ0aWNsZS52eTtcbiAgICAgICAgcGFydGljbGUuYWxwaGEgLT0gMC4wMTtcbiAgICAgICAgcmV0dXJuICEocGFydGljbGUueCA8PSAtcGFydGljbGUudyB8fCBwYXJ0aWNsZS54ID49IHNjcmVlbi53aWR0aCB8fFxuICAgICAgICAgICAgcGFydGljbGUueSA+PSBzY3JlZW4uaGVpZ2h0IHx8XG4gICAgICAgICAgICBwYXJ0aWNsZS5hbHBoYSA8PSAwKTtcbiAgICB9O1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXlDTyxNQUFNQSxjQUFnQyxHQUFHO0VBQzVDQyxRQUFRLEVBQUUsR0FEa0M7RUFFNUNDLE9BQU8sRUFBRTtBQUZtQyxDQUF6Qzs7O0FBS1EsTUFBTUMsU0FBTixDQUF5QztFQUdwREMsV0FBVyxDQUFDQyxPQUFELEVBQWtDO0lBQUE7O0lBQUE7SUFBQSwrQ0FJTSxJQUpOO0lBQUEsOERBS1pDLE1BQU0sQ0FBQ0MscUJBTEs7SUFBQSxpREFNQyxFQU5EO0lBQUE7SUFBQSw2Q0FTOUIsZ0JBQU9DLE1BQVAsRUFBcUQ7TUFBQSxJQUFuQkMsT0FBbUIsdUVBQVQsSUFBUzs7TUFDaEUsSUFBSSxDQUFDRCxNQUFMLEVBQWE7UUFDVDtNQUNIOztNQUNELEtBQUksQ0FBQ0UsU0FBTCxHQUFpQixJQUFqQjtNQUNBLEtBQUksQ0FBQ0MsT0FBTCxHQUFlSCxNQUFNLENBQUNJLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBZjs7TUFDQSxLQUFJLENBQUNDLHNCQUFMLENBQTRCQyxJQUE1QixDQUFpQ1IsTUFBakMsRUFBeUMsS0FBSSxDQUFDUyxXQUE5Qzs7TUFDQSxJQUFJTixPQUFKLEVBQWE7UUFDVEgsTUFBTSxDQUFDVSxVQUFQLENBQWtCLEtBQUksQ0FBQ0MsSUFBdkIsRUFBNkJSLE9BQTdCO01BQ0g7SUFDSixDQW5CNEM7SUFBQSxtREFxQnZCLE1BQU07TUFDeEIsSUFBSSxDQUFDLEtBQUtDLFNBQU4sSUFBbUIsS0FBS1EsU0FBTCxDQUFlQyxNQUFmLEtBQTBCLENBQWpELEVBQW9EO01BQ3BELEtBQUtD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