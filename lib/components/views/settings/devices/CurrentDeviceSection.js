"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../../languageHandler");

var _Spinner = _interopRequireDefault(require("../../elements/Spinner"));

var _SettingsSubsection = _interopRequireDefault(require("../shared/SettingsSubsection"));

var _DeviceDetails = _interopRequireDefault(require("./DeviceDetails"));

var _DeviceExpandDetailsButton = _interopRequireDefault(require("./DeviceExpandDetailsButton"));

var _DeviceTile = _interopRequireDefault(require("./DeviceTile"));

var _DeviceVerificationStatusCard = require("./DeviceVerificationStatusCard");

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
const CurrentDeviceSection = _ref => {
  let {
    device,
    isLoading
  } = _ref;
  const [isExpanded, setIsExpanded] = (0, _react.useState)(false);
  return /*#__PURE__*/_react.default.createElement(_SettingsSubsection.default, {
    heading: (0, _languageHandler._t)('Current session'),
    "data-testid": "current-session-section"
  }, isLoading && /*#__PURE__*/_react.default.createElement(_Spinner.default, null), !!device && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_DeviceTile.default, {
    device: device
  }, /*#__PURE__*/_react.default.createElement(_DeviceExpandDetailsButton.default, {
    "data-testid": "current-session-toggle-details",
    isExpanded: isExpanded,
    onClick: () => setIsExpanded(!isExpanded)
  })), isExpanded && /*#__PURE__*/_react.default.createElement(_DeviceDetails.default, {
    device: device
  }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_DeviceVerificationStatusCard.DeviceVerificationStatusCard, {
    device: device
  })));
};

var _default = CurrentDeviceSection;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXJyZW50RGV2aWNlU2VjdGlvbiIsImRldmljZSIsImlzTG9hZGluZyIsImlzRXhwYW5kZWQiLCJzZXRJc0V4cGFuZGVkIiwidXNlU3RhdGUiLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2RldmljZXMvQ3VycmVudERldmljZVNlY3Rpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSAnLi4vLi4vZWxlbWVudHMvU3Bpbm5lcic7XG5pbXBvcnQgU2V0dGluZ3NTdWJzZWN0aW9uIGZyb20gJy4uL3NoYXJlZC9TZXR0aW5nc1N1YnNlY3Rpb24nO1xuaW1wb3J0IERldmljZURldGFpbHMgZnJvbSAnLi9EZXZpY2VEZXRhaWxzJztcbmltcG9ydCBEZXZpY2VFeHBhbmREZXRhaWxzQnV0dG9uIGZyb20gJy4vRGV2aWNlRXhwYW5kRGV0YWlsc0J1dHRvbic7XG5pbXBvcnQgRGV2aWNlVGlsZSBmcm9tICcuL0RldmljZVRpbGUnO1xuaW1wb3J0IHsgRGV2aWNlVmVyaWZpY2F0aW9uU3RhdHVzQ2FyZCB9IGZyb20gJy4vRGV2aWNlVmVyaWZpY2F0aW9uU3RhdHVzQ2FyZCc7XG5pbXBvcnQgeyBEZXZpY2VXaXRoVmVyaWZpY2F0aW9uIH0gZnJvbSAnLi90eXBlcyc7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgZGV2aWNlPzogRGV2aWNlV2l0aFZlcmlmaWNhdGlvbjtcbiAgICBpc0xvYWRpbmc6IGJvb2xlYW47XG59XG5cbmNvbnN0IEN1cnJlbnREZXZpY2VTZWN0aW9uOiBSZWFjdC5GQzxQcm9wcz4gPSAoe1xuICAgIGRldmljZSwgaXNMb2FkaW5nLFxufSkgPT4ge1xuICAgIGNvbnN0IFtpc0V4cGFuZGVkLCBzZXRJc0V4cGFuZGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIHJldHVybiA8U2V0dGluZ3NTdWJzZWN0aW9uXG4gICAgICAgIGhlYWRpbmc9e190KCdDdXJyZW50IHNlc3Npb24nKX1cbiAgICAgICAgZGF0YS10ZXN0aWQ9J2N1cnJlbnQtc2Vzc2lvbi1zZWN0aW9uJ1xuICAgID5cbiAgICAgICAgeyBpc0xvYWRpbmcgJiYgPFNwaW5uZXIgLz4gfVxuICAgICAgICB7ICEhZGV2aWNlICYmIDw+XG4gICAgICAgICAgICA8RGV2aWNlVGlsZVxuICAgICAgICAgICAgICAgIGRldmljZT17ZGV2aWNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxEZXZpY2VFeHBhbmREZXRhaWxzQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtdGVzdGlkPSdjdXJyZW50LXNlc3Npb24tdG9nZ2xlLWRldGFpbHMnXG4gICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9e2lzRXhwYW5kZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldElzRXhwYW5kZWQoIWlzRXhwYW5kZWQpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0RldmljZVRpbGU+XG4gICAgICAgICAgICB7IGlzRXhwYW5kZWQgJiYgPERldmljZURldGFpbHMgZGV2aWNlPXtkZXZpY2V9IC8+IH1cbiAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgPERldmljZVZlcmlmaWNhdGlvblN0YXR1c0NhcmQgZGV2aWNlPXtkZXZpY2V9IC8+XG4gICAgICAgIDwvPlxuICAgICAgICB9XG4gICAgPC9TZXR0aW5nc1N1YnNlY3Rpb24+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ3VycmVudERldmljZVNlY3Rpb247XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWtCQSxNQUFNQSxvQkFBcUMsR0FBRyxRQUV4QztFQUFBLElBRnlDO0lBQzNDQyxNQUQyQztJQUNuQ0M7RUFEbUMsQ0FFekM7RUFDRixNQUFNLENBQUNDLFVBQUQsRUFBYUMsYUFBYixJQUE4QixJQUFBQyxlQUFBLEVBQVMsS0FBVCxDQUFwQztFQUVBLG9CQUFPLDZCQUFDLDJCQUFEO0lBQ0gsT0FBTyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsaUJBQUgsQ0FETjtJQUVILGVBQVk7RUFGVCxHQUlESixTQUFTLGlCQUFJLDZCQUFDLGdCQUFELE9BSlosRUFLRCxDQUFDLENBQUNELE1BQUYsaUJBQVkseUVBQ1YsNkJBQUMsbUJBQUQ7SUFDSSxNQUFNLEVBQUVBO0VBRFosZ0JBR0ksNkJBQUMsa0NBQUQ7SUFDSSxlQUFZLGdDQURoQjtJQUVJLFVBQVUsRUFBRUUsVUFGaEI7SUFHSSxPQUFPLEVBQUUsTUFBTUMsYUFBYSxDQUFDLENBQUNELFVBQUY7RUFIaEMsRUFISixDQURVLEVBVVJBLFVBQVUsaUJBQUksNkJBQUMsc0JBQUQ7SUFBZSxNQUFNLEVBQUVGO0VBQXZCLEVBVk4sZUFXVix3Q0FYVSxlQVlWLDZCQUFDLDBEQUFEO0lBQThCLE1BQU0sRUFBRUE7RUFBdEMsRUFaVSxDQUxYLENBQVA7QUFxQkgsQ0ExQkQ7O2VBNEJlRCxvQiJ9