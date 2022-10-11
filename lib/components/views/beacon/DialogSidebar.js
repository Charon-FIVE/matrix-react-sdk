"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _close = require("../../../../res/img/image-view/close.svg");

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Heading = _interopRequireDefault(require("../typography/Heading"));

var _BeaconListItem = _interopRequireDefault(require("./BeaconListItem"));

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
const DialogSidebar = _ref => {
  let {
    beacons,
    onBeaconClick,
    requestClose
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DialogSidebar"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DialogSidebar_header"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h4"
  }, (0, _languageHandler._t)('View List')), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_DialogSidebar_closeButton",
    onClick: requestClose,
    title: (0, _languageHandler._t)('Close sidebar'),
    "data-testid": "dialog-sidebar-close"
  }, /*#__PURE__*/_react.default.createElement(_close.Icon, {
    className: "mx_DialogSidebar_closeButtonIcon"
  }))), beacons?.length ? /*#__PURE__*/_react.default.createElement("ol", {
    className: "mx_DialogSidebar_list"
  }, beacons.map(beacon => /*#__PURE__*/_react.default.createElement(_BeaconListItem.default, {
    key: beacon.identifier,
    beacon: beacon,
    onClick: () => onBeaconClick(beacon)
  }))) : /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DialogSidebar_noResults"
  }, (0, _languageHandler._t)('No live locations')));
};

var _default = DialogSidebar;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaWFsb2dTaWRlYmFyIiwiYmVhY29ucyIsIm9uQmVhY29uQ2xpY2siLCJyZXF1ZXN0Q2xvc2UiLCJfdCIsImxlbmd0aCIsIm1hcCIsImJlYWNvbiIsImlkZW50aWZpZXIiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9iZWFjb24vRGlhbG9nU2lkZWJhci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJlYWNvbiB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5cbmltcG9ydCB7IEljb24gYXMgQ2xvc2VJY29uIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzL2ltZy9pbWFnZS12aWV3L2Nsb3NlLnN2Zyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBIZWFkaW5nIGZyb20gJy4uL3R5cG9ncmFwaHkvSGVhZGluZyc7XG5pbXBvcnQgQmVhY29uTGlzdEl0ZW0gZnJvbSAnLi9CZWFjb25MaXN0SXRlbSc7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgYmVhY29uczogQmVhY29uW107XG4gICAgcmVxdWVzdENsb3NlOiAoKSA9PiB2b2lkO1xuICAgIG9uQmVhY29uQ2xpY2s6IChiZWFjb246IEJlYWNvbikgPT4gdm9pZDtcbn1cblxuY29uc3QgRGlhbG9nU2lkZWJhcjogUmVhY3QuRkM8UHJvcHM+ID0gKHtcbiAgICBiZWFjb25zLFxuICAgIG9uQmVhY29uQ2xpY2ssXG4gICAgcmVxdWVzdENsb3NlLFxufSkgPT4ge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT0nbXhfRGlhbG9nU2lkZWJhcic+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9EaWFsb2dTaWRlYmFyX2hlYWRlcic+XG4gICAgICAgICAgICA8SGVhZGluZyBzaXplPSdoNCc+eyBfdCgnVmlldyBMaXN0JykgfTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9EaWFsb2dTaWRlYmFyX2Nsb3NlQnV0dG9uJ1xuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3JlcXVlc3RDbG9zZX1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoJ0Nsb3NlIHNpZGViYXInKX1cbiAgICAgICAgICAgICAgICBkYXRhLXRlc3RpZD0nZGlhbG9nLXNpZGViYXItY2xvc2UnXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPENsb3NlSWNvbiBjbGFzc05hbWU9J214X0RpYWxvZ1NpZGViYXJfY2xvc2VCdXR0b25JY29uJyAvPlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyBiZWFjb25zPy5sZW5ndGhcbiAgICAgICAgICAgID8gPG9sIGNsYXNzTmFtZT0nbXhfRGlhbG9nU2lkZWJhcl9saXN0Jz5cbiAgICAgICAgICAgICAgICB7IGJlYWNvbnMubWFwKChiZWFjb24pID0+IDxCZWFjb25MaXN0SXRlbVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2JlYWNvbi5pZGVudGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICBiZWFjb249e2JlYWNvbn1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25CZWFjb25DbGljayhiZWFjb24pfVxuICAgICAgICAgICAgICAgIC8+KSB9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICAgOiA8ZGl2IGNsYXNzTmFtZT0nbXhfRGlhbG9nU2lkZWJhcl9ub1Jlc3VsdHMnPlxuICAgICAgICAgICAgICAgIHsgX3QoJ05vIGxpdmUgbG9jYXRpb25zJykgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIH1cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEaWFsb2dTaWRlYmFyO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWlCQSxNQUFNQSxhQUE4QixHQUFHLFFBSWpDO0VBQUEsSUFKa0M7SUFDcENDLE9BRG9DO0lBRXBDQyxhQUZvQztJQUdwQ0M7RUFIb0MsQ0FJbEM7RUFDRixvQkFBTztJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNIO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0ksNkJBQUMsZ0JBQUQ7SUFBUyxJQUFJLEVBQUM7RUFBZCxHQUFxQixJQUFBQyxtQkFBQSxFQUFHLFdBQUgsQ0FBckIsQ0FESixlQUVJLDZCQUFDLHlCQUFEO0lBQ0ksU0FBUyxFQUFDLDhCQURkO0lBRUksT0FBTyxFQUFFRCxZQUZiO0lBR0ksS0FBSyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsZUFBSCxDQUhYO0lBSUksZUFBWTtFQUpoQixnQkFNSSw2QkFBQyxXQUFEO0lBQVcsU0FBUyxFQUFDO0VBQXJCLEVBTkosQ0FGSixDQURHLEVBWURILE9BQU8sRUFBRUksTUFBVCxnQkFDSTtJQUFJLFNBQVMsRUFBQztFQUFkLEdBQ0lKLE9BQU8sQ0FBQ0ssR0FBUixDQUFhQyxNQUFELGlCQUFZLDZCQUFDLHVCQUFEO0lBQ3RCLEdBQUcsRUFBRUEsTUFBTSxDQUFDQyxVQURVO0lBRXRCLE1BQU0sRUFBRUQsTUFGYztJQUd0QixPQUFPLEVBQUUsTUFBTUwsYUFBYSxDQUFDSyxNQUFEO0VBSE4sRUFBeEIsQ0FESixDQURKLGdCQVFJO0lBQUssU0FBUyxFQUFDO0VBQWYsR0FDSSxJQUFBSCxtQkFBQSxFQUFHLG1CQUFILENBREosQ0FwQkgsQ0FBUDtBQXlCSCxDQTlCRDs7ZUFnQ2VKLGEifQ==