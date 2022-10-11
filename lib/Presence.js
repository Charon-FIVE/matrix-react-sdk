"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _Timer = _interopRequireDefault(require("./utils/Timer"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
// Time in ms after that a user is considered as unavailable/away
const UNAVAILABLE_TIME_MS = 3 * 60 * 1000; // 3 mins

var State;

(function (State) {
  State["Online"] = "online";
  State["Offline"] = "offline";
  State["Unavailable"] = "unavailable";
})(State || (State = {}));

class Presence {
  constructor() {
    (0, _defineProperty2.default)(this, "unavailableTimer", null);
    (0, _defineProperty2.default)(this, "dispatcherRef", null);
    (0, _defineProperty2.default)(this, "state", null);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === 'user_activity') {
        this.setState(State.Online);
        this.unavailableTimer.restart();
      }
    });
  }

  /**
   * Start listening the user activity to evaluate his presence state.
   * Any state change will be sent to the homeserver.
   */
  async start() {
    this.unavailableTimer = new _Timer.default(UNAVAILABLE_TIME_MS); // the user_activity_start action starts the timer

    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    while (this.unavailableTimer) {
      try {
        await this.unavailableTimer.finished();
        this.setState(State.Unavailable);
      } catch (e) {
        /* aborted, stop got called */
      }
    }
  }
  /**
   * Stop tracking user activity
   */


  stop() {
    if (this.dispatcherRef) {
      _dispatcher.default.unregister(this.dispatcherRef);

      this.dispatcherRef = null;
    }

    if (this.unavailableTimer) {
      this.unavailableTimer.abort();
      this.unavailableTimer = null;
    }
  }
  /**
   * Get the current presence state.
   * @returns {string} the presence state (see PRESENCE enum)
   */


  getState() {
    return this.state;
  }

  /**
   * Set the presence state.
   * If the state has changed, the homeserver will be notified.
   * @param {string} newState the new presence state (see PRESENCE enum)
   */
  async setState(newState) {
    if (newState === this.state) {
      return;
    }

    const oldState = this.state;
    this.state = newState;

    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
      return; // don't try to set presence when a guest; it won't work.
    }

    try {
      await _MatrixClientPeg.MatrixClientPeg.get().setPresence({
        presence: this.state
      });

      _logger.logger.info("Presence:", newState);
    } catch (err) {
      _logger.logger.error("Failed to set presence:", err);

      this.state = oldState;
    }
  }

}

var _default = new Presence();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVTkFWQUlMQUJMRV9USU1FX01TIiwiU3RhdGUiLCJQcmVzZW5jZSIsInBheWxvYWQiLCJhY3Rpb24iLCJzZXRTdGF0ZSIsIk9ubGluZSIsInVuYXZhaWxhYmxlVGltZXIiLCJyZXN0YXJ0Iiwic3RhcnQiLCJUaW1lciIsImRpc3BhdGNoZXJSZWYiLCJkaXMiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiZmluaXNoZWQiLCJVbmF2YWlsYWJsZSIsImUiLCJzdG9wIiwidW5yZWdpc3RlciIsImFib3J0IiwiZ2V0U3RhdGUiLCJzdGF0ZSIsIm5ld1N0YXRlIiwib2xkU3RhdGUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc0d1ZXN0Iiwic2V0UHJlc2VuY2UiLCJwcmVzZW5jZSIsImxvZ2dlciIsImluZm8iLCJlcnIiLCJlcnJvciJdLCJzb3VyY2VzIjpbIi4uL3NyYy9QcmVzZW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IFRpbWVyIGZyb20gJy4vdXRpbHMvVGltZXInO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcblxuLy8gVGltZSBpbiBtcyBhZnRlciB0aGF0IGEgdXNlciBpcyBjb25zaWRlcmVkIGFzIHVuYXZhaWxhYmxlL2F3YXlcbmNvbnN0IFVOQVZBSUxBQkxFX1RJTUVfTVMgPSAzICogNjAgKiAxMDAwOyAvLyAzIG1pbnNcblxuZW51bSBTdGF0ZSB7XG4gICAgT25saW5lID0gXCJvbmxpbmVcIixcbiAgICBPZmZsaW5lID0gXCJvZmZsaW5lXCIsXG4gICAgVW5hdmFpbGFibGUgPSBcInVuYXZhaWxhYmxlXCIsXG59XG5cbmNsYXNzIFByZXNlbmNlIHtcbiAgICBwcml2YXRlIHVuYXZhaWxhYmxlVGltZXI6IFRpbWVyID0gbnVsbDtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZyA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdGF0ZTogU3RhdGUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogU3RhcnQgbGlzdGVuaW5nIHRoZSB1c2VyIGFjdGl2aXR5IHRvIGV2YWx1YXRlIGhpcyBwcmVzZW5jZSBzdGF0ZS5cbiAgICAgKiBBbnkgc3RhdGUgY2hhbmdlIHdpbGwgYmUgc2VudCB0byB0aGUgaG9tZXNlcnZlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMudW5hdmFpbGFibGVUaW1lciA9IG5ldyBUaW1lcihVTkFWQUlMQUJMRV9USU1FX01TKTtcbiAgICAgICAgLy8gdGhlIHVzZXJfYWN0aXZpdHlfc3RhcnQgYWN0aW9uIHN0YXJ0cyB0aGUgdGltZXJcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICB3aGlsZSAodGhpcy51bmF2YWlsYWJsZVRpbWVyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudW5hdmFpbGFibGVUaW1lci5maW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoU3RhdGUuVW5hdmFpbGFibGUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyAvKiBhYm9ydGVkLCBzdG9wIGdvdCBjYWxsZWQgKi8gfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcCB0cmFja2luZyB1c2VyIGFjdGl2aXR5XG4gICAgICovXG4gICAgcHVibGljIHN0b3AoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXJSZWYpIHtcbiAgICAgICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnVuYXZhaWxhYmxlVGltZXIpIHtcbiAgICAgICAgICAgIHRoaXMudW5hdmFpbGFibGVUaW1lci5hYm9ydCgpO1xuICAgICAgICAgICAgdGhpcy51bmF2YWlsYWJsZVRpbWVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VycmVudCBwcmVzZW5jZSBzdGF0ZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgcHJlc2VuY2Ugc3RhdGUgKHNlZSBQUkVTRU5DRSBlbnVtKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ3VzZXJfYWN0aXZpdHknKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKFN0YXRlLk9ubGluZSk7XG4gICAgICAgICAgICB0aGlzLnVuYXZhaWxhYmxlVGltZXIucmVzdGFydCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgcHJlc2VuY2Ugc3RhdGUuXG4gICAgICogSWYgdGhlIHN0YXRlIGhhcyBjaGFuZ2VkLCB0aGUgaG9tZXNlcnZlciB3aWxsIGJlIG5vdGlmaWVkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdTdGF0ZSB0aGUgbmV3IHByZXNlbmNlIHN0YXRlIChzZWUgUFJFU0VOQ0UgZW51bSlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHNldFN0YXRlKG5ld1N0YXRlOiBTdGF0ZSkge1xuICAgICAgICBpZiAobmV3U3RhdGUgPT09IHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9sZFN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IG5ld1N0YXRlO1xuXG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIGRvbid0IHRyeSB0byBzZXQgcHJlc2VuY2Ugd2hlbiBhIGd1ZXN0OyBpdCB3b24ndCB3b3JrLlxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRQcmVzZW5jZSh7IHByZXNlbmNlOiB0aGlzLnN0YXRlIH0pO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJQcmVzZW5jZTpcIiwgbmV3U3RhdGUpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBzZXQgcHJlc2VuY2U6XCIsIGVycik7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gb2xkU3RhdGU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBQcmVzZW5jZSgpO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWtCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUF0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNBO0FBQ0EsTUFBTUEsbUJBQW1CLEdBQUcsSUFBSSxFQUFKLEdBQVMsSUFBckMsQyxDQUEyQzs7SUFFdENDLEs7O1dBQUFBLEs7RUFBQUEsSztFQUFBQSxLO0VBQUFBLEs7R0FBQUEsSyxLQUFBQSxLOztBQU1MLE1BQU1DLFFBQU4sQ0FBZTtFQUFBO0lBQUEsd0RBQ3VCLElBRHZCO0lBQUEscURBRXFCLElBRnJCO0lBQUEsNkNBR1ksSUFIWjtJQUFBLGdEQTJDU0MsT0FBRCxJQUE0QjtNQUMzQyxJQUFJQSxPQUFPLENBQUNDLE1BQVIsS0FBbUIsZUFBdkIsRUFBd0M7UUFDcEMsS0FBS0MsUUFBTCxDQUFjSixLQUFLLENBQUNLLE1BQXBCO1FBQ0EsS0FBS0MsZ0JBQUwsQ0FBc0JDLE9BQXRCO01BQ0g7SUFDSixDQWhEVTtFQUFBOztFQUtYO0FBQ0o7QUFDQTtBQUNBO0VBQ3NCLE1BQUxDLEtBQUssR0FBRztJQUNqQixLQUFLRixnQkFBTCxHQUF3QixJQUFJRyxjQUFKLENBQVVWLG1CQUFWLENBQXhCLENBRGlCLENBRWpCOztJQUNBLEtBQUtXLGFBQUwsR0FBcUJDLG1CQUFBLENBQUlDLFFBQUosQ0FBYSxLQUFLQyxRQUFsQixDQUFyQjs7SUFDQSxPQUFPLEtBQUtQLGdCQUFaLEVBQThCO01BQzFCLElBQUk7UUFDQSxNQUFNLEtBQUtBLGdCQUFMLENBQXNCUSxRQUF0QixFQUFOO1FBQ0EsS0FBS1YsUUFBTCxDQUFjSixLQUFLLENBQUNlLFdBQXBCO01BQ0gsQ0FIRCxDQUdFLE9BQU9DLENBQVAsRUFBVTtRQUFFO01BQWdDO0lBQ2pEO0VBQ0o7RUFFRDtBQUNKO0FBQ0E7OztFQUNXQyxJQUFJLEdBQUc7SUFDVixJQUFJLEtBQUtQLGFBQVQsRUFBd0I7TUFDcEJDLG1CQUFBLENBQUlPLFVBQUosQ0FBZSxLQUFLUixhQUFwQjs7TUFDQSxLQUFLQSxhQUFMLEdBQXFCLElBQXJCO0lBQ0g7O0lBQ0QsSUFBSSxLQUFLSixnQkFBVCxFQUEyQjtNQUN2QixLQUFLQSxnQkFBTCxDQUFzQmEsS0FBdEI7TUFDQSxLQUFLYixnQkFBTCxHQUF3QixJQUF4QjtJQUNIO0VBQ0o7RUFFRDtBQUNKO0FBQ0E7QUFDQTs7O0VBQ1djLFFBQVEsR0FBRztJQUNkLE9BQU8sS0FBS0MsS0FBWjtFQUNIOztFQVNEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7RUFDMEIsTUFBUmpCLFFBQVEsQ0FBQ2tCLFFBQUQsRUFBa0I7SUFDcEMsSUFBSUEsUUFBUSxLQUFLLEtBQUtELEtBQXRCLEVBQTZCO01BQ3pCO0lBQ0g7O0lBRUQsTUFBTUUsUUFBUSxHQUFHLEtBQUtGLEtBQXRCO0lBQ0EsS0FBS0EsS0FBTCxHQUFhQyxRQUFiOztJQUVBLElBQUlFLGdDQUFBLENBQWdCQyxHQUFoQixHQUFzQkMsT0FBdEIsRUFBSixFQUFxQztNQUNqQyxPQURpQyxDQUN6QjtJQUNYOztJQUVELElBQUk7TUFDQSxNQUFNRixnQ0FBQSxDQUFnQkMsR0FBaEIsR0FBc0JFLFdBQXRCLENBQWtDO1FBQUVDLFFBQVEsRUFBRSxLQUFLUDtNQUFqQixDQUFsQyxDQUFOOztNQUNBUSxjQUFBLENBQU9DLElBQVAsQ0FBWSxXQUFaLEVBQXlCUixRQUF6QjtJQUNILENBSEQsQ0FHRSxPQUFPUyxHQUFQLEVBQVk7TUFDVkYsY0FBQSxDQUFPRyxLQUFQLENBQWEseUJBQWIsRUFBd0NELEdBQXhDOztNQUNBLEtBQUtWLEtBQUwsR0FBYUUsUUFBYjtJQUNIO0VBQ0o7O0FBMUVVOztlQTZFQSxJQUFJdEIsUUFBSixFIn0=