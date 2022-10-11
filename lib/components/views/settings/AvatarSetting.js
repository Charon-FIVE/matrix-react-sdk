"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

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
const AvatarSetting = _ref => {
  let {
    avatarUrl,
    avatarAltText,
    avatarName,
    uploadAvatar,
    removeAvatar
  } = _ref;
  const [isHovering, setIsHovering] = (0, _react.useState)(false);
  const hoveringProps = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false)
  };

  let avatarElement = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({
    element: "div",
    onClick: uploadAvatar,
    className: "mx_AvatarSetting_avatarPlaceholder"
  }, hoveringProps));

  if (avatarUrl) {
    avatarElement = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({
      element: "img",
      src: avatarUrl,
      alt: avatarAltText,
      "aria-label": avatarAltText,
      onClick: uploadAvatar
    }, hoveringProps));
  }

  let uploadAvatarBtn;

  if (uploadAvatar) {
    // insert an empty div to be the host for a css mask containing the upload.svg
    uploadAvatarBtn = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({
      onClick: uploadAvatar,
      className: "mx_AvatarSetting_uploadButton"
    }, hoveringProps));
  }

  let removeAvatarBtn;

  if (avatarUrl && removeAvatar) {
    removeAvatarBtn = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: removeAvatar,
      kind: "link_sm"
    }, (0, _languageHandler._t)("Remove"));
  }

  const avatarClasses = (0, _classnames.default)({
    "mx_AvatarSetting_avatar": true,
    "mx_AvatarSetting_avatar_hovering": isHovering && uploadAvatar
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: avatarClasses
  }, avatarElement, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AvatarSetting_hover"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AvatarSetting_hoverBg"
  }), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Upload"))), uploadAvatarBtn, removeAvatarBtn);
};

var _default = AvatarSetting;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdmF0YXJTZXR0aW5nIiwiYXZhdGFyVXJsIiwiYXZhdGFyQWx0VGV4dCIsImF2YXRhck5hbWUiLCJ1cGxvYWRBdmF0YXIiLCJyZW1vdmVBdmF0YXIiLCJpc0hvdmVyaW5nIiwic2V0SXNIb3ZlcmluZyIsInVzZVN0YXRlIiwiaG92ZXJpbmdQcm9wcyIsIm9uTW91c2VFbnRlciIsIm9uTW91c2VMZWF2ZSIsImF2YXRhckVsZW1lbnQiLCJ1cGxvYWRBdmF0YXJCdG4iLCJyZW1vdmVBdmF0YXJCdG4iLCJfdCIsImF2YXRhckNsYXNzZXMiLCJjbGFzc05hbWVzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvQXZhdGFyU2V0dGluZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGF2YXRhclVybD86IHN0cmluZztcbiAgICBhdmF0YXJOYW1lOiBzdHJpbmc7IC8vIG5hbWUgb2YgdXNlci9yb29tIHRoZSBhdmF0YXIgYmVsb25ncyB0b1xuICAgIHVwbG9hZEF2YXRhcj86IChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB2b2lkO1xuICAgIHJlbW92ZUF2YXRhcj86IChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB2b2lkO1xuICAgIGF2YXRhckFsdFRleHQ6IHN0cmluZztcbn1cblxuY29uc3QgQXZhdGFyU2V0dGluZzogUmVhY3QuRkM8SVByb3BzPiA9ICh7IGF2YXRhclVybCwgYXZhdGFyQWx0VGV4dCwgYXZhdGFyTmFtZSwgdXBsb2FkQXZhdGFyLCByZW1vdmVBdmF0YXIgfSkgPT4ge1xuICAgIGNvbnN0IFtpc0hvdmVyaW5nLCBzZXRJc0hvdmVyaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBob3ZlcmluZ1Byb3BzID0ge1xuICAgICAgICBvbk1vdXNlRW50ZXI6ICgpID0+IHNldElzSG92ZXJpbmcodHJ1ZSksXG4gICAgICAgIG9uTW91c2VMZWF2ZTogKCkgPT4gc2V0SXNIb3ZlcmluZyhmYWxzZSksXG4gICAgfTtcblxuICAgIGxldCBhdmF0YXJFbGVtZW50ID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgZWxlbWVudD1cImRpdlwiXG4gICAgICAgIG9uQ2xpY2s9e3VwbG9hZEF2YXRhcn1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfQXZhdGFyU2V0dGluZ19hdmF0YXJQbGFjZWhvbGRlclwiXG4gICAgICAgIHsuLi5ob3ZlcmluZ1Byb3BzfVxuICAgIC8+O1xuICAgIGlmIChhdmF0YXJVcmwpIHtcbiAgICAgICAgYXZhdGFyRWxlbWVudCA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgZWxlbWVudD1cImltZ1wiXG4gICAgICAgICAgICAgICAgc3JjPXthdmF0YXJVcmx9XG4gICAgICAgICAgICAgICAgYWx0PXthdmF0YXJBbHRUZXh0fVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2F2YXRhckFsdFRleHR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17dXBsb2FkQXZhdGFyfVxuICAgICAgICAgICAgICAgIHsuLi5ob3ZlcmluZ1Byb3BzfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgdXBsb2FkQXZhdGFyQnRuO1xuICAgIGlmICh1cGxvYWRBdmF0YXIpIHtcbiAgICAgICAgLy8gaW5zZXJ0IGFuIGVtcHR5IGRpdiB0byBiZSB0aGUgaG9zdCBmb3IgYSBjc3MgbWFzayBjb250YWluaW5nIHRoZSB1cGxvYWQuc3ZnXG4gICAgICAgIHVwbG9hZEF2YXRhckJ0biA9IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICBvbkNsaWNrPXt1cGxvYWRBdmF0YXJ9XG4gICAgICAgICAgICBjbGFzc05hbWU9J214X0F2YXRhclNldHRpbmdfdXBsb2FkQnV0dG9uJ1xuICAgICAgICAgICAgey4uLmhvdmVyaW5nUHJvcHN9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIGxldCByZW1vdmVBdmF0YXJCdG47XG4gICAgaWYgKGF2YXRhclVybCAmJiByZW1vdmVBdmF0YXIpIHtcbiAgICAgICAgcmVtb3ZlQXZhdGFyQnRuID0gPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17cmVtb3ZlQXZhdGFyfSBraW5kPVwibGlua19zbVwiPlxuICAgICAgICAgICAgeyBfdChcIlJlbW92ZVwiKSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgfVxuXG4gICAgY29uc3QgYXZhdGFyQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICBcIm14X0F2YXRhclNldHRpbmdfYXZhdGFyXCI6IHRydWUsXG4gICAgICAgIFwibXhfQXZhdGFyU2V0dGluZ19hdmF0YXJfaG92ZXJpbmdcIjogaXNIb3ZlcmluZyAmJiB1cGxvYWRBdmF0YXIsXG4gICAgfSk7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXthdmF0YXJDbGFzc2VzfT5cbiAgICAgICAgeyBhdmF0YXJFbGVtZW50IH1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BdmF0YXJTZXR0aW5nX2hvdmVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0F2YXRhclNldHRpbmdfaG92ZXJCZ1wiIC8+XG4gICAgICAgICAgICA8c3Bhbj57IF90KFwiVXBsb2FkXCIpIH08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7IHVwbG9hZEF2YXRhckJ0biB9XG4gICAgICAgIHsgcmVtb3ZlQXZhdGFyQnRuIH1cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBdmF0YXJTZXR0aW5nO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWdCQSxNQUFNQSxhQUErQixHQUFHLFFBQTBFO0VBQUEsSUFBekU7SUFBRUMsU0FBRjtJQUFhQyxhQUFiO0lBQTRCQyxVQUE1QjtJQUF3Q0MsWUFBeEM7SUFBc0RDO0VBQXRELENBQXlFO0VBQzlHLE1BQU0sQ0FBQ0MsVUFBRCxFQUFhQyxhQUFiLElBQThCLElBQUFDLGVBQUEsRUFBUyxLQUFULENBQXBDO0VBQ0EsTUFBTUMsYUFBYSxHQUFHO0lBQ2xCQyxZQUFZLEVBQUUsTUFBTUgsYUFBYSxDQUFDLElBQUQsQ0FEZjtJQUVsQkksWUFBWSxFQUFFLE1BQU1KLGFBQWEsQ0FBQyxLQUFEO0VBRmYsQ0FBdEI7O0VBS0EsSUFBSUssYUFBYSxnQkFBRyw2QkFBQyx5QkFBRDtJQUNoQixPQUFPLEVBQUMsS0FEUTtJQUVoQixPQUFPLEVBQUVSLFlBRk87SUFHaEIsU0FBUyxFQUFDO0VBSE0sR0FJWkssYUFKWSxFQUFwQjs7RUFNQSxJQUFJUixTQUFKLEVBQWU7SUFDWFcsYUFBYSxnQkFDVCw2QkFBQyx5QkFBRDtNQUNJLE9BQU8sRUFBQyxLQURaO01BRUksR0FBRyxFQUFFWCxTQUZUO01BR0ksR0FBRyxFQUFFQyxhQUhUO01BSUksY0FBWUEsYUFKaEI7TUFLSSxPQUFPLEVBQUVFO0lBTGIsR0FNUUssYUFOUixFQURKO0VBVUg7O0VBRUQsSUFBSUksZUFBSjs7RUFDQSxJQUFJVCxZQUFKLEVBQWtCO0lBQ2Q7SUFDQVMsZUFBZSxnQkFBRyw2QkFBQyx5QkFBRDtNQUNkLE9BQU8sRUFBRVQsWUFESztNQUVkLFNBQVMsRUFBQztJQUZJLEdBR1ZLLGFBSFUsRUFBbEI7RUFLSDs7RUFFRCxJQUFJSyxlQUFKOztFQUNBLElBQUliLFNBQVMsSUFBSUksWUFBakIsRUFBK0I7SUFDM0JTLGVBQWUsZ0JBQUcsNkJBQUMseUJBQUQ7TUFBa0IsT0FBTyxFQUFFVCxZQUEzQjtNQUF5QyxJQUFJLEVBQUM7SUFBOUMsR0FDWixJQUFBVSxtQkFBQSxFQUFHLFFBQUgsQ0FEWSxDQUFsQjtFQUdIOztFQUVELE1BQU1DLGFBQWEsR0FBRyxJQUFBQyxtQkFBQSxFQUFXO0lBQzdCLDJCQUEyQixJQURFO0lBRTdCLG9DQUFvQ1gsVUFBVSxJQUFJRjtFQUZyQixDQUFYLENBQXRCO0VBSUEsb0JBQU87SUFBSyxTQUFTLEVBQUVZO0VBQWhCLEdBQ0RKLGFBREMsZUFFSDtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJO0lBQUssU0FBUyxFQUFDO0VBQWYsRUFESixlQUVJLDJDQUFRLElBQUFHLG1CQUFBLEVBQUcsUUFBSCxDQUFSLENBRkosQ0FGRyxFQU1ERixlQU5DLEVBT0RDLGVBUEMsQ0FBUDtBQVNILENBeEREOztlQTBEZWQsYSJ9