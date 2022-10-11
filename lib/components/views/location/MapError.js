"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MapError = void 0;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _warningBadge = require("../../../../res/img/element-icons/warning-badge.svg");

var _languageHandler = require("../../../languageHandler");

var _location = require("../../../utils/location");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Heading = _interopRequireDefault(require("../typography/Heading"));

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
const MapError = _ref => {
  let {
    error,
    isMinimised,
    className,
    onFinished,
    onClick
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    "data-test-id": "map-rendering-error",
    className: (0, _classnames.default)('mx_MapError', className, {
      'mx_MapError_isMinimised': isMinimised
    }),
    onClick: onClick
  }, /*#__PURE__*/_react.default.createElement(_warningBadge.Icon, {
    className: "mx_MapError_icon"
  }), /*#__PURE__*/_react.default.createElement(_Heading.default, {
    className: "mx_MapError_heading",
    size: "h3"
  }, (0, _languageHandler._t)('Unable to load map')), /*#__PURE__*/_react.default.createElement("p", {
    className: "mx_MapError_message"
  }, (0, _location.getLocationShareErrorMessage)(error)), onFinished && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    element: "button",
    kind: "primary",
    onClick: onFinished
  }, (0, _languageHandler._t)('OK')));
};

exports.MapError = MapError;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXBFcnJvciIsImVycm9yIiwiaXNNaW5pbWlzZWQiLCJjbGFzc05hbWUiLCJvbkZpbmlzaGVkIiwib25DbGljayIsImNsYXNzTmFtZXMiLCJfdCIsImdldExvY2F0aW9uU2hhcmVFcnJvck1lc3NhZ2UiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9sb2NhdGlvbi9NYXBFcnJvci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQgeyBJY29uIGFzIFdhcm5pbmdCYWRnZSB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy93YXJuaW5nLWJhZGdlLnN2Zyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBnZXRMb2NhdGlvblNoYXJlRXJyb3JNZXNzYWdlLCBMb2NhdGlvblNoYXJlRXJyb3IgfSBmcm9tICcuLi8uLi8uLi91dGlscy9sb2NhdGlvbic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBIZWFkaW5nIGZyb20gJy4uL3R5cG9ncmFwaHkvSGVhZGluZyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWFwRXJyb3JQcm9wcyB7XG4gICAgZXJyb3I6IExvY2F0aW9uU2hhcmVFcnJvcjtcbiAgICBvbkZpbmlzaGVkPzogKCkgPT4gdm9pZDtcbiAgICBpc01pbmltaXNlZD86IGJvb2xlYW47XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICAgIG9uQ2xpY2s/OiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgTWFwRXJyb3I6IFJlYWN0LkZDPE1hcEVycm9yUHJvcHM+ID0gKHtcbiAgICBlcnJvcixcbiAgICBpc01pbmltaXNlZCxcbiAgICBjbGFzc05hbWUsXG4gICAgb25GaW5pc2hlZCxcbiAgICBvbkNsaWNrLFxufSkgPT4gKFxuICAgIDxkaXYgZGF0YS10ZXN0LWlkPSdtYXAtcmVuZGVyaW5nLWVycm9yJ1xuICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoJ214X01hcEVycm9yJywgY2xhc3NOYW1lLCB7ICdteF9NYXBFcnJvcl9pc01pbmltaXNlZCc6IGlzTWluaW1pc2VkIH0pfVxuICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgID5cbiAgICAgICAgPFdhcm5pbmdCYWRnZSBjbGFzc05hbWU9J214X01hcEVycm9yX2ljb24nIC8+XG4gICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT0nbXhfTWFwRXJyb3JfaGVhZGluZycgc2l6ZT0naDMnPnsgX3QoJ1VuYWJsZSB0byBsb2FkIG1hcCcpIH08L0hlYWRpbmc+XG4gICAgICAgIDxwIGNsYXNzTmFtZT0nbXhfTWFwRXJyb3JfbWVzc2FnZSc+XG4gICAgICAgICAgICB7IGdldExvY2F0aW9uU2hhcmVFcnJvck1lc3NhZ2UoZXJyb3IpIH1cbiAgICAgICAgPC9wPlxuICAgICAgICB7IG9uRmluaXNoZWQgJiZcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgZWxlbWVudD0nYnV0dG9uJ1xuICAgICAgICAgICAgICAgIGtpbmQ9J3ByaW1hcnknXG4gICAgICAgICAgICAgICAgb25DbGljaz17b25GaW5pc2hlZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KCdPSycpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgfVxuICAgIDwvZGl2PlxuKTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQk8sTUFBTUEsUUFBaUMsR0FBRztFQUFBLElBQUM7SUFDOUNDLEtBRDhDO0lBRTlDQyxXQUY4QztJQUc5Q0MsU0FIOEM7SUFJOUNDLFVBSjhDO0lBSzlDQztFQUw4QyxDQUFEO0VBQUEsb0JBTzdDO0lBQUssZ0JBQWEscUJBQWxCO0lBQ0ksU0FBUyxFQUFFLElBQUFDLG1CQUFBLEVBQVcsYUFBWCxFQUEwQkgsU0FBMUIsRUFBcUM7TUFBRSwyQkFBMkJEO0lBQTdCLENBQXJDLENBRGY7SUFFSSxPQUFPLEVBQUVHO0VBRmIsZ0JBSUksNkJBQUMsa0JBQUQ7SUFBYyxTQUFTLEVBQUM7RUFBeEIsRUFKSixlQUtJLDZCQUFDLGdCQUFEO0lBQVMsU0FBUyxFQUFDLHFCQUFuQjtJQUF5QyxJQUFJLEVBQUM7RUFBOUMsR0FBcUQsSUFBQUUsbUJBQUEsRUFBRyxvQkFBSCxDQUFyRCxDQUxKLGVBTUk7SUFBRyxTQUFTLEVBQUM7RUFBYixHQUNNLElBQUFDLHNDQUFBLEVBQTZCUCxLQUE3QixDQUROLENBTkosRUFTTUcsVUFBVSxpQkFDUiw2QkFBQyx5QkFBRDtJQUNJLE9BQU8sRUFBQyxRQURaO0lBRUksSUFBSSxFQUFDLFNBRlQ7SUFHSSxPQUFPLEVBQUVBO0VBSGIsR0FLTSxJQUFBRyxtQkFBQSxFQUFHLElBQUgsQ0FMTixDQVZSLENBUDZDO0FBQUEsQ0FBMUMifQ==