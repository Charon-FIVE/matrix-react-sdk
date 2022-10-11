"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MarkedExecution = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
 * A utility to ensure that a function is only called once triggered with
 * a mark applied. Multiple marks can be applied to the function, however
 * the function will only be called once upon trigger().
 *
 * The function starts unmarked.
 */
class MarkedExecution {
  /**
   * Creates a MarkedExecution for the provided function.
   * @param {Function} fn The function to be called upon trigger if marked.
   * @param {Function} onMarkCallback A function that is called when a new mark is made. Not
   * called if a mark is already flagged.
   */
  constructor(fn, onMarkCallback) {
    this.fn = fn;
    this.onMarkCallback = onMarkCallback;
    (0, _defineProperty2.default)(this, "marked", false);
  }
  /**
   * Resets the mark without calling the function.
   */


  reset() {
    this.marked = false;
  }
  /**
   * Marks the function to be called upon trigger().
   */


  mark() {
    if (!this.marked) this.onMarkCallback?.();
    this.marked = true;
  }
  /**
   * If marked, the function will be called, otherwise this does nothing.
   */


  trigger() {
    if (!this.marked) return;
    this.reset(); // reset first just in case the fn() causes a trigger()

    this.fn();
  }

}

exports.MarkedExecution = MarkedExecution;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXJrZWRFeGVjdXRpb24iLCJjb25zdHJ1Y3RvciIsImZuIiwib25NYXJrQ2FsbGJhY2siLCJyZXNldCIsIm1hcmtlZCIsIm1hcmsiLCJ0cmlnZ2VyIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL01hcmtlZEV4ZWN1dGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbiAqIEEgdXRpbGl0eSB0byBlbnN1cmUgdGhhdCBhIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIG9uY2UgdHJpZ2dlcmVkIHdpdGhcbiAqIGEgbWFyayBhcHBsaWVkLiBNdWx0aXBsZSBtYXJrcyBjYW4gYmUgYXBwbGllZCB0byB0aGUgZnVuY3Rpb24sIGhvd2V2ZXJcbiAqIHRoZSBmdW5jdGlvbiB3aWxsIG9ubHkgYmUgY2FsbGVkIG9uY2UgdXBvbiB0cmlnZ2VyKCkuXG4gKlxuICogVGhlIGZ1bmN0aW9uIHN0YXJ0cyB1bm1hcmtlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hcmtlZEV4ZWN1dGlvbiB7XG4gICAgcHJpdmF0ZSBtYXJrZWQgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBNYXJrZWRFeGVjdXRpb24gZm9yIHRoZSBwcm92aWRlZCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHVwb24gdHJpZ2dlciBpZiBtYXJrZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gb25NYXJrQ2FsbGJhY2sgQSBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIGEgbmV3IG1hcmsgaXMgbWFkZS4gTm90XG4gICAgICogY2FsbGVkIGlmIGEgbWFyayBpcyBhbHJlYWR5IGZsYWdnZWQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBmbjogKCkgPT4gdm9pZCwgcHJpdmF0ZSBvbk1hcmtDYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIG1hcmsgd2l0aG91dCBjYWxsaW5nIHRoZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMubWFya2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFya3MgdGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB1cG9uIHRyaWdnZXIoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgbWFyaygpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1hcmtlZCkgdGhpcy5vbk1hcmtDYWxsYmFjaz8uKCk7XG4gICAgICAgIHRoaXMubWFya2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBtYXJrZWQsIHRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCwgb3RoZXJ3aXNlIHRoaXMgZG9lcyBub3RoaW5nLlxuICAgICAqL1xuICAgIHB1YmxpYyB0cmlnZ2VyKCkge1xuICAgICAgICBpZiAoIXRoaXMubWFya2VkKSByZXR1cm47XG4gICAgICAgIHRoaXMucmVzZXQoKTsgLy8gcmVzZXQgZmlyc3QganVzdCBpbiBjYXNlIHRoZSBmbigpIGNhdXNlcyBhIHRyaWdnZXIoKVxuICAgICAgICB0aGlzLmZuKCk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLGVBQU4sQ0FBc0I7RUFHekI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0lDLFdBQVcsQ0FBU0MsRUFBVCxFQUFpQ0MsY0FBakMsRUFBOEQ7SUFBQSxLQUFyREQsRUFBcUQsR0FBckRBLEVBQXFEO0lBQUEsS0FBN0JDLGNBQTZCLEdBQTdCQSxjQUE2QjtJQUFBLDhDQVJ4RCxLQVF3RDtFQUN4RTtFQUVEO0FBQ0o7QUFDQTs7O0VBQ1dDLEtBQUssR0FBRztJQUNYLEtBQUtDLE1BQUwsR0FBYyxLQUFkO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7OztFQUNXQyxJQUFJLEdBQUc7SUFDVixJQUFJLENBQUMsS0FBS0QsTUFBVixFQUFrQixLQUFLRixjQUFMO0lBQ2xCLEtBQUtFLE1BQUwsR0FBYyxJQUFkO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7OztFQUNXRSxPQUFPLEdBQUc7SUFDYixJQUFJLENBQUMsS0FBS0YsTUFBVixFQUFrQjtJQUNsQixLQUFLRCxLQUFMLEdBRmEsQ0FFQzs7SUFDZCxLQUFLRixFQUFMO0VBQ0g7O0FBbEN3QiJ9