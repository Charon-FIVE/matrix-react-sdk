"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

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
const AppWarning = props => {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppPermissionWarning"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppPermissionWarningImage"
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: require("../../../../res/img/warning.svg").default,
    alt: ""
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AppPermissionWarningText"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_AppPermissionWarningTextLabel"
  }, props.errorMsg || "Error")));
};

var _default = AppWarning;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcHBXYXJuaW5nIiwicHJvcHMiLCJyZXF1aXJlIiwiZGVmYXVsdCIsImVycm9yTXNnIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvQXBwV2FybmluZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgZXJyb3JNc2c/OiBzdHJpbmc7XG59XG5cbmNvbnN0IEFwcFdhcm5pbmc6IFJlYWN0LkZDPElQcm9wcz4gPSAocHJvcHMpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfQXBwUGVybWlzc2lvbldhcm5pbmcnPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nSW1hZ2UnPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy93YXJuaW5nLnN2Z1wiKS5kZWZhdWx0fSBhbHQ9JycgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nVGV4dCc+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9BcHBQZXJtaXNzaW9uV2FybmluZ1RleHRMYWJlbCc+eyBwcm9wcy5lcnJvck1zZyB8fCBcIkVycm9yXCIgfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQXBwV2FybmluZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRQSxNQUFNQSxVQUE0QixHQUFJQyxLQUFELElBQVc7RUFDNUMsb0JBQ0k7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSTtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJO0lBQUssR0FBRyxFQUFFQyxPQUFPLENBQUMsaUNBQUQsQ0FBUCxDQUEyQ0MsT0FBckQ7SUFBOEQsR0FBRyxFQUFDO0VBQWxFLEVBREosQ0FESixlQUlJO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0k7SUFBTSxTQUFTLEVBQUM7RUFBaEIsR0FBcURGLEtBQUssQ0FBQ0csUUFBTixJQUFrQixPQUF2RSxDQURKLENBSkosQ0FESjtBQVVILENBWEQ7O2VBYWVKLFUifQ==