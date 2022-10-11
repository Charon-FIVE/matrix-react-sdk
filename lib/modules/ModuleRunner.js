"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModuleRunner = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _AppModule = require("./AppModule");

require("./ModuleComponents");

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
 * Handles and coordinates the operation of modules.
 */
class ModuleRunner {
  constructor() {// we only want one instance

    (0, _defineProperty2.default)(this, "modules", []);
  }
  /**
   * Resets the runner, clearing all known modules.
   *
   * Intended for test usage only.
   */


  reset() {
    this.modules = [];
  }
  /**
   * All custom translations from all registered modules.
   */


  get allTranslations() {
    const merged = {};

    for (const module of this.modules) {
      const i18n = module.api.translations;
      if (!i18n) continue;

      for (const [lang, strings] of Object.entries(i18n)) {
        if (!merged[lang]) merged[lang] = {};

        for (const [str, val] of Object.entries(strings)) {
          merged[lang][str] = val;
        }
      }
    }

    return merged;
  }
  /**
   * Registers a factory which creates a module for later loading. The factory
   * will be called immediately.
   * @param factory The module factory.
   */


  registerModule(factory) {
    this.modules.push(new _AppModule.AppModule(factory));
  }
  /**
   * Invokes a lifecycle event, notifying registered modules.
   * @param lifecycleEvent The lifecycle event.
   * @param args The arguments for the lifecycle event.
   */


  invoke(lifecycleEvent) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    for (const module of this.modules) {
      module.module.emit(lifecycleEvent, ...args);
    }
  }

}

exports.ModuleRunner = ModuleRunner;
(0, _defineProperty2.default)(ModuleRunner, "instance", new ModuleRunner());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb2R1bGVSdW5uZXIiLCJjb25zdHJ1Y3RvciIsInJlc2V0IiwibW9kdWxlcyIsImFsbFRyYW5zbGF0aW9ucyIsIm1lcmdlZCIsIm1vZHVsZSIsImkxOG4iLCJhcGkiLCJ0cmFuc2xhdGlvbnMiLCJsYW5nIiwic3RyaW5ncyIsIk9iamVjdCIsImVudHJpZXMiLCJzdHIiLCJ2YWwiLCJyZWdpc3Rlck1vZHVsZSIsImZhY3RvcnkiLCJwdXNoIiwiQXBwTW9kdWxlIiwiaW52b2tlIiwibGlmZWN5Y2xlRXZlbnQiLCJhcmdzIiwiZW1pdCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL01vZHVsZVJ1bm5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBUcmFuc2xhdGlvblN0cmluZ3NPYmplY3QgfSBmcm9tIFwiQG1hdHJpeC1vcmcvcmVhY3Qtc2RrLW1vZHVsZS1hcGkvbGliL3R5cGVzL3RyYW5zbGF0aW9uc1wiO1xuaW1wb3J0IHsgQW55TGlmZWN5Y2xlIH0gZnJvbSBcIkBtYXRyaXgtb3JnL3JlYWN0LXNkay1tb2R1bGUtYXBpL2xpYi9saWZlY3ljbGVzL3R5cGVzXCI7XG5cbmltcG9ydCB7IEFwcE1vZHVsZSB9IGZyb20gXCIuL0FwcE1vZHVsZVwiO1xuaW1wb3J0IHsgTW9kdWxlRmFjdG9yeSB9IGZyb20gXCIuL01vZHVsZUZhY3RvcnlcIjtcbmltcG9ydCBcIi4vTW9kdWxlQ29tcG9uZW50c1wiO1xuXG4vKipcbiAqIEhhbmRsZXMgYW5kIGNvb3JkaW5hdGVzIHRoZSBvcGVyYXRpb24gb2YgbW9kdWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vZHVsZVJ1bm5lciB7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBpbnN0YW5jZSA9IG5ldyBNb2R1bGVSdW5uZXIoKTtcblxuICAgIHByaXZhdGUgbW9kdWxlczogQXBwTW9kdWxlW10gPSBbXTtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIHdlIG9ubHkgd2FudCBvbmUgaW5zdGFuY2VcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHJ1bm5lciwgY2xlYXJpbmcgYWxsIGtub3duIG1vZHVsZXMuXG4gICAgICpcbiAgICAgKiBJbnRlbmRlZCBmb3IgdGVzdCB1c2FnZSBvbmx5LlxuICAgICAqL1xuICAgIHB1YmxpYyByZXNldCgpIHtcbiAgICAgICAgdGhpcy5tb2R1bGVzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWxsIGN1c3RvbSB0cmFuc2xhdGlvbnMgZnJvbSBhbGwgcmVnaXN0ZXJlZCBtb2R1bGVzLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgYWxsVHJhbnNsYXRpb25zKCk6IFRyYW5zbGF0aW9uU3RyaW5nc09iamVjdCB7XG4gICAgICAgIGNvbnN0IG1lcmdlZDogVHJhbnNsYXRpb25TdHJpbmdzT2JqZWN0ID0ge307XG5cbiAgICAgICAgZm9yIChjb25zdCBtb2R1bGUgb2YgdGhpcy5tb2R1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBpMThuID0gbW9kdWxlLmFwaS50cmFuc2xhdGlvbnM7XG4gICAgICAgICAgICBpZiAoIWkxOG4pIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtsYW5nLCBzdHJpbmdzXSBvZiBPYmplY3QuZW50cmllcyhpMThuKSkge1xuICAgICAgICAgICAgICAgIGlmICghbWVyZ2VkW2xhbmddKSBtZXJnZWRbbGFuZ10gPSB7fTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtzdHIsIHZhbF0gb2YgT2JqZWN0LmVudHJpZXMoc3RyaW5ncykpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2xhbmddW3N0cl0gPSB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYSBmYWN0b3J5IHdoaWNoIGNyZWF0ZXMgYSBtb2R1bGUgZm9yIGxhdGVyIGxvYWRpbmcuIFRoZSBmYWN0b3J5XG4gICAgICogd2lsbCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkuXG4gICAgICogQHBhcmFtIGZhY3RvcnkgVGhlIG1vZHVsZSBmYWN0b3J5LlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3Rlck1vZHVsZShmYWN0b3J5OiBNb2R1bGVGYWN0b3J5KSB7XG4gICAgICAgIHRoaXMubW9kdWxlcy5wdXNoKG5ldyBBcHBNb2R1bGUoZmFjdG9yeSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZXMgYSBsaWZlY3ljbGUgZXZlbnQsIG5vdGlmeWluZyByZWdpc3RlcmVkIG1vZHVsZXMuXG4gICAgICogQHBhcmFtIGxpZmVjeWNsZUV2ZW50IFRoZSBsaWZlY3ljbGUgZXZlbnQuXG4gICAgICogQHBhcmFtIGFyZ3MgVGhlIGFyZ3VtZW50cyBmb3IgdGhlIGxpZmVjeWNsZSBldmVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW52b2tlKGxpZmVjeWNsZUV2ZW50OiBBbnlMaWZlY3ljbGUsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3QgbW9kdWxlIG9mIHRoaXMubW9kdWxlcykge1xuICAgICAgICAgICAgbW9kdWxlLm1vZHVsZS5lbWl0KGxpZmVjeWNsZUV2ZW50LCAuLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFtQkE7O0FBRUE7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFTQTtBQUNBO0FBQ0E7QUFDTyxNQUFNQSxZQUFOLENBQW1CO0VBS2RDLFdBQVcsR0FBRyxDQUNsQjs7SUFEa0IsK0NBRlMsRUFFVDtFQUVyQjtFQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztFQUNXQyxLQUFLLEdBQUc7SUFDWCxLQUFLQyxPQUFMLEdBQWUsRUFBZjtFQUNIO0VBRUQ7QUFDSjtBQUNBOzs7RUFDOEIsSUFBZkMsZUFBZSxHQUE2QjtJQUNuRCxNQUFNQyxNQUFnQyxHQUFHLEVBQXpDOztJQUVBLEtBQUssTUFBTUMsTUFBWCxJQUFxQixLQUFLSCxPQUExQixFQUFtQztNQUMvQixNQUFNSSxJQUFJLEdBQUdELE1BQU0sQ0FBQ0UsR0FBUCxDQUFXQyxZQUF4QjtNQUNBLElBQUksQ0FBQ0YsSUFBTCxFQUFXOztNQUVYLEtBQUssTUFBTSxDQUFDRyxJQUFELEVBQU9DLE9BQVAsQ0FBWCxJQUE4QkMsTUFBTSxDQUFDQyxPQUFQLENBQWVOLElBQWYsQ0FBOUIsRUFBb0Q7UUFDaEQsSUFBSSxDQUFDRixNQUFNLENBQUNLLElBQUQsQ0FBWCxFQUFtQkwsTUFBTSxDQUFDSyxJQUFELENBQU4sR0FBZSxFQUFmOztRQUNuQixLQUFLLE1BQU0sQ0FBQ0ksR0FBRCxFQUFNQyxHQUFOLENBQVgsSUFBeUJILE1BQU0sQ0FBQ0MsT0FBUCxDQUFlRixPQUFmLENBQXpCLEVBQWtEO1VBQzlDTixNQUFNLENBQUNLLElBQUQsQ0FBTixDQUFhSSxHQUFiLElBQW9CQyxHQUFwQjtRQUNIO01BQ0o7SUFDSjs7SUFFRCxPQUFPVixNQUFQO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7RUFDV1csY0FBYyxDQUFDQyxPQUFELEVBQXlCO0lBQzFDLEtBQUtkLE9BQUwsQ0FBYWUsSUFBYixDQUFrQixJQUFJQyxvQkFBSixDQUFjRixPQUFkLENBQWxCO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7RUFDV0csTUFBTSxDQUFDQyxjQUFELEVBQXFEO0lBQUEsa0NBQW5CQyxJQUFtQjtNQUFuQkEsSUFBbUI7SUFBQTs7SUFDOUQsS0FBSyxNQUFNaEIsTUFBWCxJQUFxQixLQUFLSCxPQUExQixFQUFtQztNQUMvQkcsTUFBTSxDQUFDQSxNQUFQLENBQWNpQixJQUFkLENBQW1CRixjQUFuQixFQUFtQyxHQUFHQyxJQUF0QztJQUNIO0VBQ0o7O0FBekRxQjs7OzhCQUFidEIsWSxjQUN5QixJQUFJQSxZQUFKLEUifQ==