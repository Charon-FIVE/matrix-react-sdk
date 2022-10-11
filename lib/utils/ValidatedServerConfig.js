"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValidatedServerConfig = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
class ValidatedServerConfig {
  constructor() {
    (0, _defineProperty2.default)(this, "hsUrl", void 0);
    (0, _defineProperty2.default)(this, "hsName", void 0);
    (0, _defineProperty2.default)(this, "hsNameIsDifferent", void 0);
    (0, _defineProperty2.default)(this, "isUrl", void 0);
    (0, _defineProperty2.default)(this, "isDefault", void 0);
    (0, _defineProperty2.default)(this, "isNameResolvable", void 0);
    (0, _defineProperty2.default)(this, "warning", void 0);
  }

}

exports.ValidatedServerConfig = ValidatedServerConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWxpZGF0ZWRTZXJ2ZXJDb25maWciXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvVmFsaWRhdGVkU2VydmVyQ29uZmlnLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmV4cG9ydCBjbGFzcyBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcge1xuICAgIGhzVXJsOiBzdHJpbmc7XG4gICAgaHNOYW1lOiBzdHJpbmc7XG4gICAgaHNOYW1lSXNEaWZmZXJlbnQ6IHN0cmluZztcblxuICAgIGlzVXJsOiBzdHJpbmc7XG5cbiAgICBpc0RlZmF1bHQ6IGJvb2xlYW47XG4gICAgLy8gd2hlbiB0aGUgc2VydmVyIGNvbmZpZyBpcyBiYXNlZCBvbiBzdGF0aWMgVVJMcyB0aGUgaHNOYW1lIGlzIG5vdCByZXNvbHZhYmxlIGFuZCB0aGluZ3MgbWF5IHdpc2ggdG8gdXNlIGhzVXJsXG4gICAgaXNOYW1lUmVzb2x2YWJsZTogYm9vbGVhbjtcblxuICAgIHdhcm5pbmc6IHN0cmluZztcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFTyxNQUFNQSxxQkFBTixDQUE0QjtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTs7QUFBQSJ9