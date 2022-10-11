"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _thread = require("matrix-js-sdk/src/models/thread");

var _SettingController = _interopRequireDefault(require("./SettingController"));

var _PlatformPeg = _interopRequireDefault(require("../../PlatformPeg"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _QuestionDialog = _interopRequireDefault(require("../../components/views/dialogs/QuestionDialog"));

var _languageHandler = require("../../languageHandler");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
class ThreadBetaController extends _SettingController.default {
  async beforeChange(level, roomId, newValue) {
    if (_thread.Thread.hasServerSideSupport || !newValue) return true; // Full support or user is disabling

    const {
      finished
    } = _Modal.default.createDialog(_QuestionDialog.default, {
      title: (0, _languageHandler._t)("Partial Support for Threads"),
      description: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("Your homeserver does not currently support threads, so this feature may be unreliable. " + "Some threaded messages may not be reliably available. <a>Learn more</a>.", {}, {
        a: sub => /*#__PURE__*/React.createElement("a", {
          href: "https://element.io/help#threads",
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      })), /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("Do you want to enable threads anyway?"))),
      button: (0, _languageHandler._t)("Yes, enable")
    });

    const [enable] = await finished;
    return enable;
  }

  onChange(level, roomId, newValue) {
    // Requires a reload as we change an option flag on the `js-sdk`
    // And the entire sync history needs to be parsed again
    _PlatformPeg.default.get().reload();
  }

}

exports.default = ThreadBetaController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaHJlYWRCZXRhQ29udHJvbGxlciIsIlNldHRpbmdDb250cm9sbGVyIiwiYmVmb3JlQ2hhbmdlIiwibGV2ZWwiLCJyb29tSWQiLCJuZXdWYWx1ZSIsIlRocmVhZCIsImhhc1NlcnZlclNpZGVTdXBwb3J0IiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlF1ZXN0aW9uRGlhbG9nIiwidGl0bGUiLCJfdCIsImRlc2NyaXB0aW9uIiwiYSIsInN1YiIsImJ1dHRvbiIsImVuYWJsZSIsIm9uQ2hhbmdlIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJyZWxvYWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2V0dGluZ3MvY29udHJvbGxlcnMvVGhyZWFkQmV0YUNvbnRyb2xsZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgVGhyZWFkIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy90aHJlYWRcIjtcblxuaW1wb3J0IFNldHRpbmdDb250cm9sbGVyIGZyb20gXCIuL1NldHRpbmdDb250cm9sbGVyXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uL01vZGFsXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9RdWVzdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRocmVhZEJldGFDb250cm9sbGVyIGV4dGVuZHMgU2V0dGluZ0NvbnRyb2xsZXIge1xuICAgIHB1YmxpYyBhc3luYyBiZWZvcmVDaGFuZ2UobGV2ZWw6IFNldHRpbmdMZXZlbCwgcm9vbUlkOiBzdHJpbmcsIG5ld1ZhbHVlOiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKFRocmVhZC5oYXNTZXJ2ZXJTaWRlU3VwcG9ydCB8fCAhbmV3VmFsdWUpIHJldHVybiB0cnVlOyAvLyBGdWxsIHN1cHBvcnQgb3IgdXNlciBpcyBkaXNhYmxpbmdcblxuICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2c8W2Jvb2xlYW5dPihRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiUGFydGlhbCBTdXBwb3J0IGZvciBUaHJlYWRzXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IDw+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIllvdXIgaG9tZXNlcnZlciBkb2VzIG5vdCBjdXJyZW50bHkgc3VwcG9ydCB0aHJlYWRzLCBzbyB0aGlzIGZlYXR1cmUgbWF5IGJlIHVucmVsaWFibGUuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJTb21lIHRocmVhZGVkIG1lc3NhZ2VzIG1heSBub3QgYmUgcmVsaWFibHkgYXZhaWxhYmxlLiA8YT5MZWFybiBtb3JlPC9hPi5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL2VsZW1lbnQuaW8vaGVscCN0aHJlYWRzXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgc3ViIH08L2E+XG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSkgfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57IF90KFwiRG8geW91IHdhbnQgdG8gZW5hYmxlIHRocmVhZHMgYW55d2F5P1wiKSB9PC9wPlxuICAgICAgICAgICAgPC8+LFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIlllcywgZW5hYmxlXCIpLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgW2VuYWJsZV0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgcmV0dXJuIGVuYWJsZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25DaGFuZ2UobGV2ZWw6IFNldHRpbmdMZXZlbCwgcm9vbUlkOiBzdHJpbmcsIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgLy8gUmVxdWlyZXMgYSByZWxvYWQgYXMgd2UgY2hhbmdlIGFuIG9wdGlvbiBmbGFnIG9uIHRoZSBganMtc2RrYFxuICAgICAgICAvLyBBbmQgdGhlIGVudGlyZSBzeW5jIGhpc3RvcnkgbmVlZHMgdG8gYmUgcGFyc2VkIGFnYWluXG4gICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLnJlbG9hZCgpO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWWUsTUFBTUEsb0JBQU4sU0FBbUNDLDBCQUFuQyxDQUFxRDtFQUN2QyxNQUFaQyxZQUFZLENBQUNDLEtBQUQsRUFBc0JDLE1BQXRCLEVBQXNDQyxRQUF0QyxFQUF1RTtJQUM1RixJQUFJQyxjQUFBLENBQU9DLG9CQUFQLElBQStCLENBQUNGLFFBQXBDLEVBQThDLE9BQU8sSUFBUCxDQUQ4QyxDQUNqQzs7SUFFM0QsTUFBTTtNQUFFRztJQUFGLElBQWVDLGNBQUEsQ0FBTUMsWUFBTixDQUE4QkMsdUJBQTlCLEVBQThDO01BQy9EQyxLQUFLLEVBQUUsSUFBQUMsbUJBQUEsRUFBRyw2QkFBSCxDQUR3RDtNQUUvREMsV0FBVyxlQUFFLHVEQUNULCtCQUFLLElBQUFELG1CQUFBLEVBQUcsNEZBQ0osMEVBREMsRUFDMkUsRUFEM0UsRUFDK0U7UUFDaEZFLENBQUMsRUFBRUMsR0FBRyxpQkFDRjtVQUFHLElBQUksRUFBQyxpQ0FBUjtVQUEwQyxNQUFNLEVBQUMsUUFBakQ7VUFBMEQsR0FBRyxFQUFDO1FBQTlELEdBQXNGQSxHQUF0RjtNQUY0RSxDQUQvRSxDQUFMLENBRFMsZUFPVCwrQkFBSyxJQUFBSCxtQkFBQSxFQUFHLHVDQUFILENBQUwsQ0FQUyxDQUZrRDtNQVcvREksTUFBTSxFQUFFLElBQUFKLG1CQUFBLEVBQUcsYUFBSDtJQVh1RCxDQUE5QyxDQUFyQjs7SUFhQSxNQUFNLENBQUNLLE1BQUQsSUFBVyxNQUFNVixRQUF2QjtJQUNBLE9BQU9VLE1BQVA7RUFDSDs7RUFFTUMsUUFBUSxDQUFDaEIsS0FBRCxFQUFzQkMsTUFBdEIsRUFBc0NDLFFBQXRDLEVBQXFEO0lBQ2hFO0lBQ0E7SUFDQWUsb0JBQUEsQ0FBWUMsR0FBWixHQUFrQkMsTUFBbEI7RUFDSDs7QUF6QitEIn0=