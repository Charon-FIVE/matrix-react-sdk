"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppModule = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _ProxiedModuleApi = require("./ProxiedModuleApi");

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

/**
 * Wraps a module factory into a usable module. Acts as a simple container
 * for the constructs needed to operate a module.
 */
class AppModule {
  /**
   * The module instance.
   */

  /**
   * The API instance used by the module.
   */

  /**
   * Converts a factory into an AppModule. The factory will be called
   * immediately.
   * @param factory The module factory.
   */
  constructor(factory) {
    (0, _defineProperty2.default)(this, "module", void 0);
    (0, _defineProperty2.default)(this, "api", new _ProxiedModuleApi.ProxiedModuleApi());
    this.module = factory(this.api);
  }

}

exports.AppModule = AppModule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcHBNb2R1bGUiLCJjb25zdHJ1Y3RvciIsImZhY3RvcnkiLCJQcm94aWVkTW9kdWxlQXBpIiwibW9kdWxlIiwiYXBpIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZHVsZXMvQXBwTW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IFJ1bnRpbWVNb2R1bGUgfSBmcm9tIFwiQG1hdHJpeC1vcmcvcmVhY3Qtc2RrLW1vZHVsZS1hcGkvbGliL1J1bnRpbWVNb2R1bGVcIjtcblxuaW1wb3J0IHsgTW9kdWxlRmFjdG9yeSB9IGZyb20gXCIuL01vZHVsZUZhY3RvcnlcIjtcbmltcG9ydCB7IFByb3hpZWRNb2R1bGVBcGkgfSBmcm9tIFwiLi9Qcm94aWVkTW9kdWxlQXBpXCI7XG5cbi8qKlxuICogV3JhcHMgYSBtb2R1bGUgZmFjdG9yeSBpbnRvIGEgdXNhYmxlIG1vZHVsZS4gQWN0cyBhcyBhIHNpbXBsZSBjb250YWluZXJcbiAqIGZvciB0aGUgY29uc3RydWN0cyBuZWVkZWQgdG8gb3BlcmF0ZSBhIG1vZHVsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7XG4gICAgLyoqXG4gICAgICogVGhlIG1vZHVsZSBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kdWxlOiBSdW50aW1lTW9kdWxlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIEFQSSBpbnN0YW5jZSB1c2VkIGJ5IHRoZSBtb2R1bGUuXG4gICAgICovXG4gICAgcHVibGljIHJlYWRvbmx5IGFwaSA9IG5ldyBQcm94aWVkTW9kdWxlQXBpKCk7XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhIGZhY3RvcnkgaW50byBhbiBBcHBNb2R1bGUuIFRoZSBmYWN0b3J5IHdpbGwgYmUgY2FsbGVkXG4gICAgICogaW1tZWRpYXRlbHkuXG4gICAgICogQHBhcmFtIGZhY3RvcnkgVGhlIG1vZHVsZSBmYWN0b3J5LlxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihmYWN0b3J5OiBNb2R1bGVGYWN0b3J5KSB7XG4gICAgICAgIHRoaXMubW9kdWxlID0gZmFjdG9yeSh0aGlzLmFwaSk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW1CQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsU0FBTixDQUFnQjtFQUNuQjtBQUNKO0FBQ0E7O0VBR0k7QUFDSjtBQUNBOztFQUdJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7RUFDV0MsV0FBVyxDQUFDQyxPQUFELEVBQXlCO0lBQUE7SUFBQSwyQ0FQckIsSUFBSUMsa0NBQUosRUFPcUI7SUFDdkMsS0FBS0MsTUFBTCxHQUFjRixPQUFPLENBQUMsS0FBS0csR0FBTixDQUFyQjtFQUNIOztBQWxCa0IifQ==