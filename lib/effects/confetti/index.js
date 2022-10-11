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
  maxCount: 150,
  speed: 3,
  frameInterval: 15,
  alpha: 1.0,
  gradient: false
};
exports.DefaultOptions = DefaultOptions;

class Confetti {
  constructor(options) {
    var _this = this;

    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "context", null);
    (0, _defineProperty2.default)(this, "supportsAnimationFrame", window.requestAnimationFrame);
    (0, _defineProperty2.default)(this, "colors", ['rgba(30,144,255,', 'rgba(107,142,35,', 'rgba(255,215,0,', 'rgba(255,192,203,', 'rgba(106,90,205,', 'rgba(173,216,230,', 'rgba(238,130,238,', 'rgba(152,251,152,', 'rgba(70,130,180,', 'rgba(244,164,96,', 'rgba(210,105,30,', 'rgba(220,20,60,']);
    (0, _defineProperty2.default)(this, "lastFrameTime", Date.now());
    (0, _defineProperty2.default)(this, "particles", []);
    (0, _defineProperty2.default)(this, "waveAngle", 0);
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

      _this.runAnimation();

      if (timeout) {
        window.setTimeout(_this.stop, timeout);
      }
    });
    (0, _defineProperty2.default)(this, "stop", async () => {
      this.isRunning = false;
    });
    (0, _defineProperty2.default)(this, "resetParticle", (particle, width, height) => {
      particle.color = this.colors[Math.random() * this.colors.length | 0] + (this.options.alpha + ')');

      if (this.options.gradient) {
        particle.color2 = this.colors[Math.random() * this.colors.length | 0] + (this.options.alpha + ')');
      } else {
        particle.color2 = particle.color;
      }

      particle.x = Math.random() * width;
      particle.y = Math.random() * -height;
      particle.diameter = Math.random() * 10 + 5;
      particle.tilt = Math.random() * -10;
      particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
      particle.tiltAngle = Math.random() * Math.PI;
      return particle;
    });
    (0, _defineProperty2.default)(this, "runAnimation", () => {
      if (!this.context || !this.context.canvas) {
        return;
      }

      if (this.particles.length === 0) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      } else {
        const now = Date.now();
        const delta = now - this.lastFrameTime;

        if (!this.supportsAnimationFrame || delta > this.options.frameInterval) {
          this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
          this.updateParticles();
          this.drawParticles(this.context);
          this.lastFrameTime = now - delta % this.options.frameInterval;
        }

        requestAnimationFrame(this.runAnimation);
      }
    });
    (0, _defineProperty2.default)(this, "drawParticles", context => {
      if (!this.context || !this.context.canvas) {
        return;
      }

      let x;
      let x2;
      let y2;

      for (const particle of this.particles) {
        this.context.beginPath();
        context.lineWidth = particle.diameter;
        x2 = particle.x + particle.tilt;
        x = x2 + particle.diameter / 2;
        y2 = particle.y + particle.tilt + particle.diameter / 2;

        if (this.options.gradient) {
          const gradient = context.createLinearGradient(x, particle.y, x2, y2);
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1.0, particle.color2);
          context.strokeStyle = gradient;
        } else {
          context.strokeStyle = particle.color;
        }

        context.moveTo(x, particle.y);
        context.lineTo(x2, y2);
        context.stroke();
      }
    });
    (0, _defineProperty2.default)(this, "updateParticles", () => {
      if (!this.context || !this.context.canvas) {
        return;
      }

      const width = this.context.canvas.width;
      const height = this.context.canvas.height;
      let particle;
      this.waveAngle += 0.01;

      for (let i = 0; i < this.particles.length; i++) {
        particle = this.particles[i];

        if (!this.isRunning && particle.y < -15) {
          particle.y = height + 100;
        } else {
          particle.tiltAngle += particle.tiltAngleIncrement;
          particle.x += Math.sin(this.waveAngle) - 0.5;
          particle.y += (Math.cos(this.waveAngle) + particle.diameter + this.options.speed) * 0.5;
          particle.tilt = Math.sin(particle.tiltAngle) * 15;
        }

        if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
          if (this.isRunning && this.particles.length <= this.options.maxCount) {
            this.resetParticle(particle, width, height);
          } else {
            this.particles.splice(i, 1);
            i--;
          }
        }
      }
    });
    this.options = _objectSpread(_objectSpread({}, DefaultOptions), options);
  }

}

exports.default = Confetti;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWZhdWx0T3B0aW9ucyIsIm1heENvdW50Iiwic3BlZWQiLCJmcmFtZUludGVydmFsIiwiYWxwaGEiLCJncmFkaWVudCIsIkNvbmZldHRpIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwid2luZG93IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiRGF0ZSIsIm5vdyIsImNhbnZhcyIsInRpbWVvdXQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInBhcnRpY2xlcyIsImNvdW50IiwibGVuZ3RoIiwicHVzaCIsInJlc2V0UGFydGljbGUiLCJ3aWR0aCIsImhlaWdodCIsImlzUnVubmluZyIsInJ1bkFuaW1hdGlvbiIsInNldFRpbWVvdXQiLCJzdG9wIiwicGFydGljbGUiLCJjb2xvciIsImNvbG9ycyIsIk1hdGgiLCJyYW5kb20iLCJjb2xvcjIiLCJ4IiwieSIsImRpYW1ldGVyIiwidGlsdCIsInRpbHRBbmdsZUluY3JlbWVudCIsInRpbHRBbmdsZSIsIlBJIiwiY2xlYXJSZWN0IiwiZGVsdGEiLCJsYXN0RnJhbWVUaW1lIiwic3VwcG9ydHNBbmltYXRpb25GcmFtZSIsInVwZGF0ZVBhcnRpY2xlcyIsImRyYXdQYXJ0aWNsZXMiLCJ4MiIsInkyIiwiYmVnaW5QYXRoIiwibGluZVdpZHRoIiwiY3JlYXRlTGluZWFyR3JhZGllbnQiLCJhZGRDb2xvclN0b3AiLCJzdHJva2VTdHlsZSIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsIndhdmVBbmdsZSIsImkiLCJzaW4iLCJjb3MiLCJzcGxpY2UiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZWZmZWN0cy9jb25mZXR0aS9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDIwIE51cmppbiBKYWZhclxuIENvcHlyaWdodCAyMDIwIE5vcmRlY2sgSVQgKyBDb25zdWx0aW5nIEdtYkguXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCBJQ2FudmFzRWZmZWN0IGZyb20gJy4uL0lDYW52YXNFZmZlY3QnO1xuXG5leHBvcnQgdHlwZSBDb25mZXR0aU9wdGlvbnMgPSB7XG4gICAgLyoqXG4gICAgICogbWF4IGNvbmZldHRpIGNvdW50XG4gICAgICovXG4gICAgbWF4Q291bnQ6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiBwYXJ0aWNsZSBhbmltYXRpb24gc3BlZWRcbiAgICAgKi9cbiAgICBzcGVlZDogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIHRoZSBjb25mZXR0aSBhbmltYXRpb24gZnJhbWUgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzXG4gICAgICovXG4gICAgZnJhbWVJbnRlcnZhbDogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIHRoZSBhbHBoYSBvcGFjaXR5IG9mIHRoZSBjb25mZXR0aSAoYmV0d2VlbiAwIGFuZCAxLCB3aGVyZSAxIGlzIG9wYXF1ZSBhbmQgMCBpcyBpbnZpc2libGUpXG4gICAgICovXG4gICAgYWxwaGE6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiB1c2UgZ3JhZGllbnQgaW5zdGVhZCBvZiBzb2xpZCBwYXJ0aWNsZSBjb2xvclxuICAgICAqL1xuICAgIGdyYWRpZW50OiBib29sZWFuO1xufTtcblxudHlwZSBDb25mZXR0aVBhcnRpY2xlID0ge1xuICAgIGNvbG9yOiBzdHJpbmc7XG4gICAgY29sb3IyOiBzdHJpbmc7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICBkaWFtZXRlcjogbnVtYmVyO1xuICAgIHRpbHQ6IG51bWJlcjtcbiAgICB0aWx0QW5nbGVJbmNyZW1lbnQ6IG51bWJlcjtcbiAgICB0aWx0QW5nbGU6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0T3B0aW9uczogQ29uZmV0dGlPcHRpb25zID0ge1xuICAgIG1heENvdW50OiAxNTAsXG4gICAgc3BlZWQ6IDMsXG4gICAgZnJhbWVJbnRlcnZhbDogMTUsXG4gICAgYWxwaGE6IDEuMCxcbiAgICBncmFkaWVudDogZmFsc2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25mZXR0aSBpbXBsZW1lbnRzIElDYW52YXNFZmZlY3Qge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogQ29uZmV0dGlPcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7IC4uLkRlZmF1bHRPcHRpb25zLCAuLi5vcHRpb25zIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN1cHBvcnRzQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIHByaXZhdGUgY29sb3JzID0gWydyZ2JhKDMwLDE0NCwyNTUsJywgJ3JnYmEoMTA3LDE0MiwzNSwnLCAncmdiYSgyNTUsMjE1LDAsJyxcbiAgICAgICAgJ3JnYmEoMjU1LDE5MiwyMDMsJywgJ3JnYmEoMTA2LDkwLDIwNSwnLCAncmdiYSgxNzMsMjE2LDIzMCwnLFxuICAgICAgICAncmdiYSgyMzgsMTMwLDIzOCwnLCAncmdiYSgxNTIsMjUxLDE1MiwnLCAncmdiYSg3MCwxMzAsMTgwLCcsXG4gICAgICAgICdyZ2JhKDI0NCwxNjQsOTYsJywgJ3JnYmEoMjEwLDEwNSwzMCwnLCAncmdiYSgyMjAsMjAsNjAsJ107XG5cbiAgICBwcml2YXRlIGxhc3RGcmFtZVRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHByaXZhdGUgcGFydGljbGVzOiBBcnJheTxDb25mZXR0aVBhcnRpY2xlPiA9IFtdO1xuICAgIHByaXZhdGUgd2F2ZUFuZ2xlID0gMDtcblxuICAgIHB1YmxpYyBpc1J1bm5pbmc6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgc3RhcnQgPSBhc3luYyAoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgdGltZW91dCA9IDMwMDApID0+IHtcbiAgICAgICAgaWYgKCFjYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLm9wdGlvbnMubWF4Q291bnQ7XG4gICAgICAgIHdoaWxlICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPCBjb3VudCkge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh0aGlzLnJlc2V0UGFydGljbGUoe30gYXMgQ29uZmV0dGlQYXJ0aWNsZSwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnJ1bkFuaW1hdGlvbigpO1xuICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQodGhpcy5zdG9wLCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgc3RvcCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZXNldFBhcnRpY2xlID0gKHBhcnRpY2xlOiBDb25mZXR0aVBhcnRpY2xlLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IENvbmZldHRpUGFydGljbGUgPT4ge1xuICAgICAgICBwYXJ0aWNsZS5jb2xvciA9IHRoaXMuY29sb3JzWyhNYXRoLnJhbmRvbSgpICogdGhpcy5jb2xvcnMubGVuZ3RoKSB8IDBdICsgKHRoaXMub3B0aW9ucy5hbHBoYSArICcpJyk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICAgICAgICAgIHBhcnRpY2xlLmNvbG9yMiA9IHRoaXMuY29sb3JzWyhNYXRoLnJhbmRvbSgpICogdGhpcy5jb2xvcnMubGVuZ3RoKSB8IDBdICsgKHRoaXMub3B0aW9ucy5hbHBoYSArICcpJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJ0aWNsZS5jb2xvcjIgPSBwYXJ0aWNsZS5jb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0aWNsZS54ID0gTWF0aC5yYW5kb20oKSAqIHdpZHRoO1xuICAgICAgICBwYXJ0aWNsZS55ID0gTWF0aC5yYW5kb20oKSAqIC1oZWlnaHQ7XG4gICAgICAgIHBhcnRpY2xlLmRpYW1ldGVyID0gTWF0aC5yYW5kb20oKSAqIDEwICsgNTtcbiAgICAgICAgcGFydGljbGUudGlsdCA9IE1hdGgucmFuZG9tKCkgKiAtMTA7XG4gICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZUluY3JlbWVudCA9IE1hdGgucmFuZG9tKCkgKiAwLjA3ICsgMC4wNTtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEk7XG4gICAgICAgIHJldHVybiBwYXJ0aWNsZTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBydW5BbmltYXRpb24gPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICghdGhpcy5jb250ZXh0IHx8ICF0aGlzLmNvbnRleHQuY2FudmFzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoLCB0aGlzLmNvbnRleHQuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgY29uc3QgZGVsdGEgPSBub3cgLSB0aGlzLmxhc3RGcmFtZVRpbWU7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3VwcG9ydHNBbmltYXRpb25GcmFtZSB8fCBkZWx0YSA+IHRoaXMub3B0aW9ucy5mcmFtZUludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoLCB0aGlzLmNvbnRleHQuY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNsZXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdQYXJ0aWNsZXModGhpcy5jb250ZXh0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RGcmFtZVRpbWUgPSBub3cgLSAoZGVsdGEgJSB0aGlzLm9wdGlvbnMuZnJhbWVJbnRlcnZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ydW5BbmltYXRpb24pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgZHJhd1BhcnRpY2xlcyA9IChjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRleHQgfHwgIXRoaXMuY29udGV4dC5jYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgeDsgbGV0IHgyOyBsZXQgeTI7XG4gICAgICAgIGZvciAoY29uc3QgcGFydGljbGUgb2YgdGhpcy5wYXJ0aWNsZXMpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVdpZHRoID0gcGFydGljbGUuZGlhbWV0ZXI7XG4gICAgICAgICAgICB4MiA9IHBhcnRpY2xlLnggKyBwYXJ0aWNsZS50aWx0O1xuICAgICAgICAgICAgeCA9IHgyICsgcGFydGljbGUuZGlhbWV0ZXIgLyAyO1xuICAgICAgICAgICAgeTIgPSBwYXJ0aWNsZS55ICsgcGFydGljbGUudGlsdCArIHBhcnRpY2xlLmRpYW1ldGVyIC8gMjtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBncmFkaWVudCA9IGNvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoeCwgcGFydGljbGUueSwgeDIsIHkyKTtcbiAgICAgICAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgcGFydGljbGUuY29sb3IpO1xuICAgICAgICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLjAsIHBhcnRpY2xlLmNvbG9yMik7XG4gICAgICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gcGFydGljbGUuY29sb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4LCBwYXJ0aWNsZS55KTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHgyLCB5Mik7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlUGFydGljbGVzID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dCB8fCAhdGhpcy5jb250ZXh0LmNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGxldCBwYXJ0aWNsZTogQ29uZmV0dGlQYXJ0aWNsZTtcbiAgICAgICAgdGhpcy53YXZlQW5nbGUgKz0gMC4wMTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1J1bm5pbmcgJiYgcGFydGljbGUueSA8IC0xNSkge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnkgPSBoZWlnaHQgKyAxMDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZSArPSBwYXJ0aWNsZS50aWx0QW5nbGVJbmNyZW1lbnQ7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueCArPSBNYXRoLnNpbih0aGlzLndhdmVBbmdsZSkgLSAwLjU7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueSArPSAoTWF0aC5jb3ModGhpcy53YXZlQW5nbGUpICsgcGFydGljbGUuZGlhbWV0ZXIgKyB0aGlzLm9wdGlvbnMuc3BlZWQpICogMC41O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHQgPSBNYXRoLnNpbihwYXJ0aWNsZS50aWx0QW5nbGUpICogMTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFydGljbGUueCA+IHdpZHRoICsgMjAgfHwgcGFydGljbGUueCA8IC0yMCB8fCBwYXJ0aWNsZS55ID4gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNSdW5uaW5nICYmIHRoaXMucGFydGljbGVzLmxlbmd0aCA8PSB0aGlzLm9wdGlvbnMubWF4Q291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFBhcnRpY2xlKHBhcnRpY2xlLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXFDTyxNQUFNQSxjQUErQixHQUFHO0VBQzNDQyxRQUFRLEVBQUUsR0FEaUM7RUFFM0NDLEtBQUssRUFBRSxDQUZvQztFQUczQ0MsYUFBYSxFQUFFLEVBSDRCO0VBSTNDQyxLQUFLLEVBQUUsR0FKb0M7RUFLM0NDLFFBQVEsRUFBRTtBQUxpQyxDQUF4Qzs7O0FBUVEsTUFBTUMsUUFBTixDQUF3QztFQUduREMsV0FBVyxDQUFDQyxPQUFELEVBQWtDO0lBQUE7O0lBQUE7SUFBQSwrQ0FJTSxJQUpOO0lBQUEsOERBS1pDLE1BQU0sQ0FBQ0MscUJBTEs7SUFBQSw4Q0FNNUIsQ0FBQyxrQkFBRCxFQUFxQixrQkFBckIsRUFBeUMsaUJB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