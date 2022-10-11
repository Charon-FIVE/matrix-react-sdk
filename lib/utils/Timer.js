"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
Copyright 2018, 2021 The Matrix.org Foundation C.I.C.

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

/**
A countdown timer, exposing a promise api.
A timer starts in a non-started state,
and needs to be started by calling `start()`` on it first.

Timers can be `abort()`-ed which makes the promise reject prematurely.

Once a timer is finished or aborted, it can't be started again
(because the promise should not be replaced). Instead, create
a new one through `clone()` or `cloneIfRun()`.
*/
class Timer {
  constructor(timeout) {
    this.timeout = timeout;
    (0, _defineProperty2.default)(this, "timerHandle", void 0);
    (0, _defineProperty2.default)(this, "startTs", void 0);
    (0, _defineProperty2.default)(this, "promise", void 0);
    (0, _defineProperty2.default)(this, "resolve", void 0);
    (0, _defineProperty2.default)(this, "reject", void 0);
    (0, _defineProperty2.default)(this, "onTimeout", () => {
      const now = Date.now();
      const elapsed = now - this.startTs;

      if (elapsed >= this.timeout) {
        this.resolve();
        this.setNotStarted();
      } else {
        const delta = this.timeout - elapsed;
        this.timerHandle = setTimeout(this.onTimeout, delta);
      }
    });
    this.setNotStarted();
  }

  setNotStarted() {
    this.timerHandle = null;
    this.startTs = null;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    }).finally(() => {
      this.timerHandle = null;
    });
  }

  changeTimeout(timeout) {
    if (timeout === this.timeout) {
      return;
    }

    const isSmallerTimeout = timeout < this.timeout;
    this.timeout = timeout;

    if (this.isRunning() && isSmallerTimeout) {
      clearTimeout(this.timerHandle);
      this.onTimeout();
    }
  }
  /**
   * if not started before, starts the timer.
   * @returns {Timer} the same timer
   */


  start() {
    if (!this.isRunning()) {
      this.startTs = Date.now();
      this.timerHandle = setTimeout(this.onTimeout, this.timeout);
    }

    return this;
  }
  /**
   * (re)start the timer. If it's running, reset the timeout. If not, start it.
   * @returns {Timer} the same timer
   */


  restart() {
    if (this.isRunning()) {
      // don't clearTimeout here as this method
      // can be called in fast succession,
      // instead just take note and compare
      // when the already running timeout expires
      this.startTs = Date.now();
      return this;
    } else {
      return this.start();
    }
  }
  /**
   * if the timer is running, abort it,
   * and reject the promise for this timer.
   * @returns {Timer} the same timer
   */


  abort() {
    if (this.isRunning()) {
      clearTimeout(this.timerHandle);
      this.reject(new Error("Timer was aborted."));
      this.setNotStarted();
    }

    return this;
  }
  /**
   *promise that will resolve when the timer elapses,
   *or is rejected when abort is called
   *@return {Promise}
   */


  finished() {
    return this.promise;
  }

  isRunning() {
    return this.timerHandle !== null;
  }

}

exports.default = Timer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW1lciIsImNvbnN0cnVjdG9yIiwidGltZW91dCIsIm5vdyIsIkRhdGUiLCJlbGFwc2VkIiwic3RhcnRUcyIsInJlc29sdmUiLCJzZXROb3RTdGFydGVkIiwiZGVsdGEiLCJ0aW1lckhhbmRsZSIsInNldFRpbWVvdXQiLCJvblRpbWVvdXQiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlamVjdCIsImZpbmFsbHkiLCJjaGFuZ2VUaW1lb3V0IiwiaXNTbWFsbGVyVGltZW91dCIsImlzUnVubmluZyIsImNsZWFyVGltZW91dCIsInN0YXJ0IiwicmVzdGFydCIsImFib3J0IiwiRXJyb3IiLCJmaW5pc2hlZCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9UaW1lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTgsIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbkEgY291bnRkb3duIHRpbWVyLCBleHBvc2luZyBhIHByb21pc2UgYXBpLlxuQSB0aW1lciBzdGFydHMgaW4gYSBub24tc3RhcnRlZCBzdGF0ZSxcbmFuZCBuZWVkcyB0byBiZSBzdGFydGVkIGJ5IGNhbGxpbmcgYHN0YXJ0KClgYCBvbiBpdCBmaXJzdC5cblxuVGltZXJzIGNhbiBiZSBgYWJvcnQoKWAtZWQgd2hpY2ggbWFrZXMgdGhlIHByb21pc2UgcmVqZWN0IHByZW1hdHVyZWx5LlxuXG5PbmNlIGEgdGltZXIgaXMgZmluaXNoZWQgb3IgYWJvcnRlZCwgaXQgY2FuJ3QgYmUgc3RhcnRlZCBhZ2FpblxuKGJlY2F1c2UgdGhlIHByb21pc2Ugc2hvdWxkIG5vdCBiZSByZXBsYWNlZCkuIEluc3RlYWQsIGNyZWF0ZVxuYSBuZXcgb25lIHRocm91Z2ggYGNsb25lKClgIG9yIGBjbG9uZUlmUnVuKClgLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVyIHtcbiAgICBwcml2YXRlIHRpbWVySGFuZGxlOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBzdGFydFRzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBwcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuICAgIHByaXZhdGUgcmVzb2x2ZTogKCkgPT4gdm9pZDtcbiAgICBwcml2YXRlIHJlamVjdDogKEVycm9yKSA9PiB2b2lkO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0aW1lb3V0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zZXROb3RTdGFydGVkKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXROb3RTdGFydGVkKCkge1xuICAgICAgICB0aGlzLnRpbWVySGFuZGxlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGFydFRzID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudGltZXJIYW5kbGUgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVGltZW91dCA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgY29uc3QgZWxhcHNlZCA9IG5vdyAtIHRoaXMuc3RhcnRUcztcbiAgICAgICAgaWYgKGVsYXBzZWQgPj0gdGhpcy50aW1lb3V0KSB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmUoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Tm90U3RhcnRlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLnRpbWVvdXQgLSBlbGFwc2VkO1xuICAgICAgICAgICAgdGhpcy50aW1lckhhbmRsZSA9IHNldFRpbWVvdXQodGhpcy5vblRpbWVvdXQsIGRlbHRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjaGFuZ2VUaW1lb3V0KHRpbWVvdXQ6IG51bWJlcikge1xuICAgICAgICBpZiAodGltZW91dCA9PT0gdGhpcy50aW1lb3V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNTbWFsbGVyVGltZW91dCA9IHRpbWVvdXQgPCB0aGlzLnRpbWVvdXQ7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgICAgIGlmICh0aGlzLmlzUnVubmluZygpICYmIGlzU21hbGxlclRpbWVvdXQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVySGFuZGxlKTtcbiAgICAgICAgICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpZiBub3Qgc3RhcnRlZCBiZWZvcmUsIHN0YXJ0cyB0aGUgdGltZXIuXG4gICAgICogQHJldHVybnMge1RpbWVyfSB0aGUgc2FtZSB0aW1lclxuICAgICAqL1xuICAgIHN0YXJ0KCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUcyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVySGFuZGxlID0gc2V0VGltZW91dCh0aGlzLm9uVGltZW91dCwgdGhpcy50aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAocmUpc3RhcnQgdGhlIHRpbWVyLiBJZiBpdCdzIHJ1bm5pbmcsIHJlc2V0IHRoZSB0aW1lb3V0LiBJZiBub3QsIHN0YXJ0IGl0LlxuICAgICAqIEByZXR1cm5zIHtUaW1lcn0gdGhlIHNhbWUgdGltZXJcbiAgICAgKi9cbiAgICByZXN0YXJ0KCkge1xuICAgICAgICBpZiAodGhpcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgLy8gZG9uJ3QgY2xlYXJUaW1lb3V0IGhlcmUgYXMgdGhpcyBtZXRob2RcbiAgICAgICAgICAgIC8vIGNhbiBiZSBjYWxsZWQgaW4gZmFzdCBzdWNjZXNzaW9uLFxuICAgICAgICAgICAgLy8gaW5zdGVhZCBqdXN0IHRha2Ugbm90ZSBhbmQgY29tcGFyZVxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgYWxyZWFkeSBydW5uaW5nIHRpbWVvdXQgZXhwaXJlc1xuICAgICAgICAgICAgdGhpcy5zdGFydFRzID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGlmIHRoZSB0aW1lciBpcyBydW5uaW5nLCBhYm9ydCBpdCxcbiAgICAgKiBhbmQgcmVqZWN0IHRoZSBwcm9taXNlIGZvciB0aGlzIHRpbWVyLlxuICAgICAqIEByZXR1cm5zIHtUaW1lcn0gdGhlIHNhbWUgdGltZXJcbiAgICAgKi9cbiAgICBhYm9ydCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVySGFuZGxlKTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0KG5ldyBFcnJvcihcIlRpbWVyIHdhcyBhYm9ydGVkLlwiKSk7XG4gICAgICAgICAgICB0aGlzLnNldE5vdFN0YXJ0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKnByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlbiB0aGUgdGltZXIgZWxhcHNlcyxcbiAgICAgKm9yIGlzIHJlamVjdGVkIHdoZW4gYWJvcnQgaXMgY2FsbGVkXG4gICAgICpAcmV0dXJuIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGZpbmlzaGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICAgIH1cblxuICAgIGlzUnVubmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZXJIYW5kbGUgIT09IG51bGw7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsS0FBTixDQUFZO0VBT3ZCQyxXQUFXLENBQVNDLE9BQVQsRUFBMEI7SUFBQSxLQUFqQkEsT0FBaUIsR0FBakJBLE9BQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBLGlEQWVqQixNQUFNO01BQ3RCLE1B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