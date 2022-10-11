"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LazyValue = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
 * Utility class for lazily getting a variable.
 */
class LazyValue {
  constructor(getFn) {
    this.getFn = getFn;
    (0, _defineProperty2.default)(this, "val", void 0);
    (0, _defineProperty2.default)(this, "prom", void 0);
    (0, _defineProperty2.default)(this, "done", false);
  }
  /**
   * Whether or not a cached value is present.
   */


  get present() {
    // we use a tracking variable just in case the final value is falsy
    return this.done;
  }
  /**
   * Gets the value without invoking a get. May be undefined until the
   * value is fetched properly.
   */


  get cachedValue() {
    return this.val;
  }
  /**
   * Gets a promise which resolves to the value, eventually.
   */


  get value() {
    if (this.prom) return this.prom;
    this.prom = this.getFn(); // Fork the promise chain to avoid accidentally making it return undefined always.

    this.prom.then(v => {
      this.val = v;
      this.done = true;
    });
    return this.prom;
  }

}

exports.LazyValue = LazyValue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMYXp5VmFsdWUiLCJjb25zdHJ1Y3RvciIsImdldEZuIiwicHJlc2VudCIsImRvbmUiLCJjYWNoZWRWYWx1ZSIsInZhbCIsInZhbHVlIiwicHJvbSIsInRoZW4iLCJ2Il0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL0xhenlWYWx1ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbiAqIFV0aWxpdHkgY2xhc3MgZm9yIGxhemlseSBnZXR0aW5nIGEgdmFyaWFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBMYXp5VmFsdWU8VD4ge1xuICAgIHByaXZhdGUgdmFsOiBUO1xuICAgIHByaXZhdGUgcHJvbTogUHJvbWlzZTxUPjtcbiAgICBwcml2YXRlIGRvbmUgPSBmYWxzZTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcml2YXRlIGdldEZuOiAoKSA9PiBQcm9taXNlPFQ+KSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBvciBub3QgYSBjYWNoZWQgdmFsdWUgaXMgcHJlc2VudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHByZXNlbnQoKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIHdlIHVzZSBhIHRyYWNraW5nIHZhcmlhYmxlIGp1c3QgaW4gY2FzZSB0aGUgZmluYWwgdmFsdWUgaXMgZmFsc3lcbiAgICAgICAgcmV0dXJuIHRoaXMuZG9uZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB2YWx1ZSB3aXRob3V0IGludm9raW5nIGEgZ2V0LiBNYXkgYmUgdW5kZWZpbmVkIHVudGlsIHRoZVxuICAgICAqIHZhbHVlIGlzIGZldGNoZWQgcHJvcGVybHkuXG4gICAgICovXG4gICAgcHVibGljIGdldCBjYWNoZWRWYWx1ZSgpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIHRoZSB2YWx1ZSwgZXZlbnR1YWxseS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHZhbHVlKCk6IFByb21pc2U8VD4ge1xuICAgICAgICBpZiAodGhpcy5wcm9tKSByZXR1cm4gdGhpcy5wcm9tO1xuICAgICAgICB0aGlzLnByb20gPSB0aGlzLmdldEZuKCk7XG5cbiAgICAgICAgLy8gRm9yayB0aGUgcHJvbWlzZSBjaGFpbiB0byBhdm9pZCBhY2NpZGVudGFsbHkgbWFraW5nIGl0IHJldHVybiB1bmRlZmluZWQgYWx3YXlzLlxuICAgICAgICB0aGlzLnByb20udGhlbih2ID0+IHtcbiAgICAgICAgICAgIHRoaXMudmFsID0gdjtcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnByb207XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDTyxNQUFNQSxTQUFOLENBQW1CO0VBS2ZDLFdBQVcsQ0FBU0MsS0FBVCxFQUFrQztJQUFBLEtBQXpCQSxLQUF5QixHQUF6QkEsS0FBeUI7SUFBQTtJQUFBO0lBQUEsNENBRnJDLEtBRXFDO0VBQ25EO0VBRUQ7QUFDSjtBQUNBOzs7RUFDc0IsSUFBUEMsT0FBTyxHQUFZO0lBQzFCO0lBQ0EsT0FBTyxLQUFLQyxJQUFaO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7QUFDQTs7O0VBQzBCLElBQVhDLFdBQVcsR0FBTTtJQUN4QixPQUFPLEtBQUtDLEdBQVo7RUFDSDtFQUVEO0FBQ0o7QUFDQTs7O0VBQ29CLElBQUxDLEtBQUssR0FBZTtJQUMzQixJQUFJLEtBQUtDLElBQVQsRUFBZSxPQUFPLEtBQUtBLElBQVo7SUFDZixLQUFLQSxJQUFMLEdBQVksS0FBS04sS0FBTCxFQUFaLENBRjJCLENBSTNCOztJQUNBLEtBQUtNLElBQUwsQ0FBVUMsSUFBVixDQUFlQyxDQUFDLElBQUk7TUFDaEIsS0FBS0osR0FBTCxHQUFXSSxDQUFYO01BQ0EsS0FBS04sSUFBTCxHQUFZLElBQVo7SUFDSCxDQUhEO0lBS0EsT0FBTyxLQUFLSSxJQUFaO0VBQ0g7O0FBdENxQiJ9