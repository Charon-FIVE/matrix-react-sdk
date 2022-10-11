"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnableLiveShare = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _StyledLiveBeaconIcon = _interopRequireDefault(require("../beacon/StyledLiveBeaconIcon"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _LabelledToggleSwitch = _interopRequireDefault(require("../elements/LabelledToggleSwitch"));

var _Heading = _interopRequireDefault(require("../typography/Heading"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an 'AS IS' BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const EnableLiveShare = _ref => {
  let {
    onSubmit
  } = _ref;
  const [isEnabled, setEnabled] = (0, _react.useState)(false);
  return /*#__PURE__*/_react.default.createElement("div", {
    "data-test-id": "location-picker-enable-live-share",
    className: "mx_EnableLiveShare"
  }, /*#__PURE__*/_react.default.createElement(_StyledLiveBeaconIcon.default, {
    className: "mx_EnableLiveShare_icon"
  }), /*#__PURE__*/_react.default.createElement(_Heading.default, {
    className: "mx_EnableLiveShare_heading",
    size: "h3"
  }, (0, _languageHandler._t)('Live location sharing')), /*#__PURE__*/_react.default.createElement("p", {
    className: "mx_EnableLiveShare_description"
  }, (0, _languageHandler._t)('Please note: this is a labs feature using a temporary implementation. ' + 'This means you will not be able to delete your location history, ' + 'and advanced users will be able to see your location history ' + 'even after you stop sharing your live location with this room.')), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
    "data-test-id": "enable-live-share-toggle",
    value: isEnabled,
    onChange: setEnabled,
    label: (0, _languageHandler._t)('Enable live location sharing')
  }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    "data-test-id": "enable-live-share-submit",
    className: "mx_EnableLiveShare_button",
    element: "button",
    kind: "primary",
    onClick: onSubmit,
    disabled: !isEnabled
  }, (0, _languageHandler._t)('OK')));
};

exports.EnableLiveShare = EnableLiveShare;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbmFibGVMaXZlU2hhcmUiLCJvblN1Ym1pdCIsImlzRW5hYmxlZCIsInNldEVuYWJsZWQiLCJ1c2VTdGF0ZSIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbG9jYXRpb24vRW5hYmxlTGl2ZVNoYXJlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlICdMaWNlbnNlJyk7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiAnQVMgSVMnIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFN0eWxlZExpdmVCZWFjb25JY29uIGZyb20gJy4uL2JlYWNvbi9TdHlsZWRMaXZlQmVhY29uSWNvbic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBMYWJlbGxlZFRvZ2dsZVN3aXRjaCBmcm9tICcuLi9lbGVtZW50cy9MYWJlbGxlZFRvZ2dsZVN3aXRjaCc7XG5pbXBvcnQgSGVhZGluZyBmcm9tICcuLi90eXBvZ3JhcGh5L0hlYWRpbmcnO1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIG9uU3VibWl0OiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgRW5hYmxlTGl2ZVNoYXJlOiBSZWFjdC5GQzxQcm9wcz4gPSAoe1xuICAgIG9uU3VibWl0LFxufSkgPT4ge1xuICAgIGNvbnN0IFtpc0VuYWJsZWQsIHNldEVuYWJsZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgZGF0YS10ZXN0LWlkPSdsb2NhdGlvbi1waWNrZXItZW5hYmxlLWxpdmUtc2hhcmUnIGNsYXNzTmFtZT0nbXhfRW5hYmxlTGl2ZVNoYXJlJz5cbiAgICAgICAgICAgIDxTdHlsZWRMaXZlQmVhY29uSWNvbiBjbGFzc05hbWU9J214X0VuYWJsZUxpdmVTaGFyZV9pY29uJyAvPlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPSdteF9FbmFibGVMaXZlU2hhcmVfaGVhZGluZycgc2l6ZT0naDMnPnsgX3QoJ0xpdmUgbG9jYXRpb24gc2hhcmluZycpIH08L0hlYWRpbmc+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9J214X0VuYWJsZUxpdmVTaGFyZV9kZXNjcmlwdGlvbic+XG4gICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgJ1BsZWFzZSBub3RlOiB0aGlzIGlzIGEgbGFicyBmZWF0dXJlIHVzaW5nIGEgdGVtcG9yYXJ5IGltcGxlbWVudGF0aW9uLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1RoaXMgbWVhbnMgeW91IHdpbGwgbm90IGJlIGFibGUgdG8gZGVsZXRlIHlvdXIgbG9jYXRpb24gaGlzdG9yeSwgJyArXG4gICAgICAgICAgICAgICAgICAgICdhbmQgYWR2YW5jZWQgdXNlcnMgd2lsbCBiZSBhYmxlIHRvIHNlZSB5b3VyIGxvY2F0aW9uIGhpc3RvcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdldmVuIGFmdGVyIHlvdSBzdG9wIHNoYXJpbmcgeW91ciBsaXZlIGxvY2F0aW9uIHdpdGggdGhpcyByb29tLicsXG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8TGFiZWxsZWRUb2dnbGVTd2l0Y2hcbiAgICAgICAgICAgICAgICBkYXRhLXRlc3QtaWQ9J2VuYWJsZS1saXZlLXNoYXJlLXRvZ2dsZSdcbiAgICAgICAgICAgICAgICB2YWx1ZT17aXNFbmFibGVkfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRFbmFibGVkfVxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnRW5hYmxlIGxpdmUgbG9jYXRpb24gc2hhcmluZycpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgZGF0YS10ZXN0LWlkPSdlbmFibGUtbGl2ZS1zaGFyZS1zdWJtaXQnXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9FbmFibGVMaXZlU2hhcmVfYnV0dG9uJ1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ9J2J1dHRvbidcbiAgICAgICAgICAgICAgICBraW5kPSdwcmltYXJ5J1xuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uU3VibWl0fVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshaXNFbmFibGVkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoJ09LJykgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY08sTUFBTUEsZUFBZ0MsR0FBRyxRQUUxQztFQUFBLElBRjJDO0lBQzdDQztFQUQ2QyxDQUUzQztFQUNGLE1BQU0sQ0FBQ0MsU0FBRCxFQUFZQyxVQUFaLElBQTBCLElBQUFDLGVBQUEsRUFBUyxLQUFULENBQWhDO0VBQ0Esb0JBQ0k7SUFBSyxnQkFBYSxtQ0FBbEI7SUFBc0QsU0FBUyxFQUFDO0VBQWhFLGdCQUNJLDZCQUFDLDZCQUFEO0lBQXNCLFNBQVMsRUFBQztFQUFoQyxFQURKLGVBRUksNkJBQUMsZ0JBQUQ7SUFBUyxTQUFTLEVBQUMsNEJBQW5CO0lBQWdELElBQUksRUFBQztFQUFyRCxHQUE0RCxJQUFBQyxtQkFBQSxFQUFHLHVCQUFILENBQTVELENBRkosZUFHSTtJQUFHLFNBQVMsRUFBQztFQUFiLEdBQ00sSUFBQUEsbUJBQUEsRUFDRSwyRUFDQSxtRUFEQSxHQUVBLCtEQUZBLEdBR0EsZ0VBSkYsQ0FETixDQUhKLGVBV0ksNkJBQUMsNkJBQUQ7SUFDSSxnQkFBYSwwQkFEakI7SUFFSSxLQUFLLEVBQUVILFNBRlg7SUFHSSxRQUFRLEVBQUVDLFVBSGQ7SUFJSSxLQUFLLEVBQUUsSUFBQUUsbUJBQUEsRUFBRyw4QkFBSDtFQUpYLEVBWEosZUFpQkksNkJBQUMseUJBQUQ7SUFDSSxnQkFBYSwwQkFEakI7SUFFSSxTQUFTLEVBQUMsMkJBRmQ7SUFHSSxPQUFPLEVBQUMsUUFIWjtJQUlJLElBQUksRUFBQyxTQUpUO0lBS0ksT0FBTyxFQUFFSixRQUxiO0lBTUksUUFBUSxFQUFFLENBQUNDO0VBTmYsR0FRTSxJQUFBRyxtQkFBQSxFQUFHLElBQUgsQ0FSTixDQWpCSixDQURKO0FBOEJILENBbENNIn0=