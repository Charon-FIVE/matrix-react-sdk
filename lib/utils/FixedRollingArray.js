"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FixedRollingArray = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _arrays = require("./arrays");

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
 * An array which is of fixed length and accepts rolling values. Values will
 * be inserted on the left, falling off the right.
 */
class FixedRollingArray {
  /**
   * Creates a new fixed rolling array.
   * @param width The width of the array.
   * @param padValue The value to seed the array with.
   */
  constructor(width, padValue) {
    this.width = width;
    (0, _defineProperty2.default)(this, "samples", []);
    this.samples = (0, _arrays.arraySeed)(padValue, this.width);
  }
  /**
   * The array, as a fixed length.
   */


  get value() {
    return this.samples;
  }
  /**
   * Pushes a value to the array.
   * @param value The value to push.
   */


  pushValue(value) {
    let swap = (0, _arrays.arrayFastClone)(this.samples);
    swap.splice(0, 0, value);

    if (swap.length > this.width) {
      swap = swap.slice(0, this.width);
    }

    this.samples = swap;
  }

}

exports.FixedRollingArray = FixedRollingArray;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaXhlZFJvbGxpbmdBcnJheSIsImNvbnN0cnVjdG9yIiwid2lkdGgiLCJwYWRWYWx1ZSIsInNhbXBsZXMiLCJhcnJheVNlZWQiLCJ2YWx1ZSIsInB1c2hWYWx1ZSIsInN3YXAiLCJhcnJheUZhc3RDbG9uZSIsInNwbGljZSIsImxlbmd0aCIsInNsaWNlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL0ZpeGVkUm9sbGluZ0FycmF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGFycmF5RmFzdENsb25lLCBhcnJheVNlZWQgfSBmcm9tIFwiLi9hcnJheXNcIjtcblxuLyoqXG4gKiBBbiBhcnJheSB3aGljaCBpcyBvZiBmaXhlZCBsZW5ndGggYW5kIGFjY2VwdHMgcm9sbGluZyB2YWx1ZXMuIFZhbHVlcyB3aWxsXG4gKiBiZSBpbnNlcnRlZCBvbiB0aGUgbGVmdCwgZmFsbGluZyBvZmYgdGhlIHJpZ2h0LlxuICovXG5leHBvcnQgY2xhc3MgRml4ZWRSb2xsaW5nQXJyYXk8VD4ge1xuICAgIHByaXZhdGUgc2FtcGxlczogVFtdID0gW107XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGZpeGVkIHJvbGxpbmcgYXJyYXkuXG4gICAgICogQHBhcmFtIHdpZHRoIFRoZSB3aWR0aCBvZiB0aGUgYXJyYXkuXG4gICAgICogQHBhcmFtIHBhZFZhbHVlIFRoZSB2YWx1ZSB0byBzZWVkIHRoZSBhcnJheSB3aXRoLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgd2lkdGg6IG51bWJlciwgcGFkVmFsdWU6IFQpIHtcbiAgICAgICAgdGhpcy5zYW1wbGVzID0gYXJyYXlTZWVkKHBhZFZhbHVlLCB0aGlzLndpZHRoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYXJyYXksIGFzIGEgZml4ZWQgbGVuZ3RoLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgdmFsdWUoKTogVFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FtcGxlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSB2YWx1ZSB0byB0aGUgYXJyYXkuXG4gICAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBwdXNoLlxuICAgICAqL1xuICAgIHB1YmxpYyBwdXNoVmFsdWUodmFsdWU6IFQpIHtcbiAgICAgICAgbGV0IHN3YXAgPSBhcnJheUZhc3RDbG9uZSh0aGlzLnNhbXBsZXMpO1xuICAgICAgICBzd2FwLnNwbGljZSgwLCAwLCB2YWx1ZSk7XG4gICAgICAgIGlmIChzd2FwLmxlbmd0aCA+IHRoaXMud2lkdGgpIHtcbiAgICAgICAgICAgIHN3YXAgPSBzd2FwLnNsaWNlKDAsIHRoaXMud2lkdGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2FtcGxlcyA9IHN3YXA7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsaUJBQU4sQ0FBMkI7RUFHOUI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtFQUNJQyxXQUFXLENBQVNDLEtBQVQsRUFBd0JDLFFBQXhCLEVBQXFDO0lBQUEsS0FBNUJELEtBQTRCLEdBQTVCQSxLQUE0QjtJQUFBLCtDQVB6QixFQU95QjtJQUM1QyxLQUFLRSxPQUFMLEdBQWUsSUFBQUMsaUJBQUEsRUFBVUYsUUFBVixFQUFvQixLQUFLRCxLQUF6QixDQUFmO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7OztFQUNvQixJQUFMSSxLQUFLLEdBQVE7SUFDcEIsT0FBTyxLQUFLRixPQUFaO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7QUFDQTs7O0VBQ1dHLFNBQVMsQ0FBQ0QsS0FBRCxFQUFXO0lBQ3ZCLElBQUlFLElBQUksR0FBRyxJQUFBQyxzQkFBQSxFQUFlLEtBQUtMLE9BQXBCLENBQVg7SUFDQUksSUFBSSxDQUFDRSxNQUFMLENBQVksQ0FBWixFQUFlLENBQWYsRUFBa0JKLEtBQWxCOztJQUNBLElBQUlFLElBQUksQ0FBQ0csTUFBTCxHQUFjLEtBQUtULEtBQXZCLEVBQThCO01BQzFCTSxJQUFJLEdBQUdBLElBQUksQ0FBQ0ksS0FBTCxDQUFXLENBQVgsRUFBYyxLQUFLVixLQUFuQixDQUFQO0lBQ0g7O0lBQ0QsS0FBS0UsT0FBTCxHQUFlSSxJQUFmO0VBQ0g7O0FBOUI2QiJ9