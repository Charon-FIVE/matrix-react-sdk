"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModuleUiDialog = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _ScrollableBaseModal = _interopRequireDefault(require("./ScrollableBaseModal"));

var _languageHandler = require("../../../languageHandler");

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
class ModuleUiDialog extends _ScrollableBaseModal.default {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "contentRef", /*#__PURE__*/(0, _react.createRef)());
    this.state = {
      title: this.props.title,
      canSubmit: true,
      actionLabel: (0, _languageHandler._t)("OK")
    };
  }

  async submit() {
    try {
      const model = await this.contentRef.current.trySubmit();
      this.props.onFinished(true, model);
    } catch (e) {
      _logger.logger.error("Error during submission of module dialog:", e);
    }
  }

  cancel() {
    this.props.onFinished(false);
  }

  renderContent() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ModuleUiDialog"
    }, this.props.contentFactory(this.props.contentProps, this.contentRef));
  }

}

exports.ModuleUiDialog = ModuleUiDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb2R1bGVVaURpYWxvZyIsIlNjcm9sbGFibGVCYXNlTW9kYWwiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwic3RhdGUiLCJ0aXRsZSIsImNhblN1Ym1pdCIsImFjdGlvbkxhYmVsIiwiX3QiLCJzdWJtaXQiLCJtb2RlbCIsImNvbnRlbnRSZWYiLCJjdXJyZW50IiwidHJ5U3VibWl0Iiwib25GaW5pc2hlZCIsImUiLCJsb2dnZXIiLCJlcnJvciIsImNhbmNlbCIsInJlbmRlckNvbnRlbnQiLCJjb250ZW50RmFjdG9yeSIsImNvbnRlbnRQcm9wcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTW9kdWxlVWlEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IERpYWxvZ0NvbnRlbnQsIERpYWxvZ1Byb3BzIH0gZnJvbSBcIkBtYXRyaXgtb3JnL3JlYWN0LXNkay1tb2R1bGUtYXBpL2xpYi9jb21wb25lbnRzL0RpYWxvZ0NvbnRlbnRcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IFNjcm9sbGFibGVCYXNlTW9kYWwsIHsgSVNjcm9sbGFibGVCYXNlU3RhdGUgfSBmcm9tIFwiLi9TY3JvbGxhYmxlQmFzZU1vZGFsXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBjb250ZW50RmFjdG9yeTogKHByb3BzOiBEaWFsb2dQcm9wcywgcmVmOiBSZWFjdC5SZWY8RGlhbG9nQ29udGVudD4pID0+IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICBjb250ZW50UHJvcHM6IERpYWxvZ1Byb3BzO1xuICAgIHRpdGxlOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJU3RhdGUgZXh0ZW5kcyBJU2Nyb2xsYWJsZUJhc2VTdGF0ZSB7XG4gICAgLy8gbm90aGluZyBzcGVjaWFsXG59XG5cbmV4cG9ydCBjbGFzcyBNb2R1bGVVaURpYWxvZyBleHRlbmRzIFNjcm9sbGFibGVCYXNlTW9kYWw8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGNvbnRlbnRSZWYgPSBjcmVhdGVSZWY8RGlhbG9nQ29udGVudD4oKTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdGl0bGU6IHRoaXMucHJvcHMudGl0bGUsXG4gICAgICAgICAgICBjYW5TdWJtaXQ6IHRydWUsXG4gICAgICAgICAgICBhY3Rpb25MYWJlbDogX3QoXCJPS1wiKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgc3VibWl0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbW9kZWwgPSBhd2FpdCB0aGlzLmNvbnRlbnRSZWYuY3VycmVudC50cnlTdWJtaXQoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlLCBtb2RlbCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIGR1cmluZyBzdWJtaXNzaW9uIG9mIG1vZHVsZSBkaWFsb2c6XCIsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNhbmNlbCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVuZGVyQ29udGVudCgpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Nb2R1bGVVaURpYWxvZ1wiPlxuICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNvbnRlbnRGYWN0b3J5KHRoaXMucHJvcHMuY29udGVudFByb3BzLCB0aGlzLmNvbnRlbnRSZWYpIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBRUE7O0FBRUE7Ozs7OztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvQk8sTUFBTUEsY0FBTixTQUE2QkMsNEJBQTdCLENBQWlFO0VBRzdEQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDOUIsTUFBTUEsS0FBTjtJQUQ4QiwrREFGYixJQUFBQyxnQkFBQSxHQUVhO0lBRzlCLEtBQUtDLEtBQUwsR0FBYTtNQUNUQyxLQUFLLEVBQUUsS0FBS0gsS0FBTCxDQUFXRyxLQURUO01BRVRDLFNBQVMsRUFBRSxJQUZGO01BR1RDLFdBQVcsRUFBRSxJQUFBQyxtQkFBQSxFQUFHLElBQUg7SUFISixDQUFiO0VBS0g7O0VBRXFCLE1BQU5DLE1BQU0sR0FBRztJQUNyQixJQUFJO01BQ0EsTUFBTUMsS0FBSyxHQUFHLE1BQU0sS0FBS0MsVUFBTCxDQUFnQkMsT0FBaEIsQ0FBd0JDLFNBQXhCLEVBQXBCO01BQ0EsS0FBS1gsS0FBTCxDQUFXWSxVQUFYLENBQXNCLElBQXRCLEVBQTRCSixLQUE1QjtJQUNILENBSEQsQ0FHRSxPQUFPSyxDQUFQLEVBQVU7TUFDUkMsY0FBQSxDQUFPQyxLQUFQLENBQWEsMkNBQWIsRUFBMERGLENBQTFEO0lBQ0g7RUFDSjs7RUFFU0csTUFBTSxHQUFTO0lBQ3JCLEtBQUtoQixLQUFMLENBQVdZLFVBQVgsQ0FBc0IsS0FBdEI7RUFDSDs7RUFFU0ssYUFBYSxHQUFvQjtJQUN2QyxvQkFBTztNQUFLLFNBQVMsRUFBQztJQUFmLEdBQ0QsS0FBS2pCLEtBQUwsQ0FBV2tCLGNBQVgsQ0FBMEIsS0FBS2xCLEtBQUwsQ0FBV21CLFlBQXJDLEVBQW1ELEtBQUtWLFVBQXhELENBREMsQ0FBUDtFQUdIOztBQTlCbUUifQ==