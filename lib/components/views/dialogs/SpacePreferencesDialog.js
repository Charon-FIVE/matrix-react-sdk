"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("../dialogs/BaseDialog"));

var _TabbedView = _interopRequireWildcard(require("../../structures/TabbedView"));

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _useSettings = require("../../../hooks/useSettings");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _RoomName = _interopRequireDefault(require("../elements/RoomName"));

var _OpenSpacePreferencesPayload = require("../../../dispatcher/payloads/OpenSpacePreferencesPayload");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const SpacePreferencesAppearanceTab = _ref => {
  let {
    space
  } = _ref;
  const showPeople = (0, _useSettings.useSettingValue)("Spaces.showPeopleInSpace", space.roomId);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab_heading"
  }, (0, _languageHandler._t)("Sections to show")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab_section"
  }, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
    checked: !!showPeople,
    onChange: e => {
      _SettingsStore.default.setValue("Spaces.showPeopleInSpace", space.roomId, _SettingLevel.SettingLevel.ROOM_ACCOUNT, !showPeople);
    }
  }, (0, _languageHandler._t)("People")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This groups your chats with members of this space. " + "Turning this off will hide those chats from your view of %(spaceName)s.", {
    spaceName: space.name
  }))));
};

const SpacePreferencesDialog = _ref2 => {
  let {
    space,
    initialTabId,
    onFinished
  } = _ref2;
  const tabs = [new _TabbedView.Tab(_OpenSpacePreferencesPayload.SpacePreferenceTab.Appearance, (0, _languageHandler._td)("Appearance"), "mx_SpacePreferencesDialog_appearanceIcon", /*#__PURE__*/_react.default.createElement(SpacePreferencesAppearanceTab, {
    space: space
  }))];
  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    className: "mx_SpacePreferencesDialog",
    hasCancel: true,
    onFinished: onFinished,
    title: (0, _languageHandler._t)("Preferences"),
    fixedWidth: false
  }, /*#__PURE__*/_react.default.createElement("h4", null, /*#__PURE__*/_react.default.createElement(_RoomName.default, {
    room: space
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsDialog_content"
  }, /*#__PURE__*/_react.default.createElement(_TabbedView.default, {
    tabs: tabs,
    initialTabId: initialTabId
  })));
};

var _default = SpacePreferencesDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcGFjZVByZWZlcmVuY2VzQXBwZWFyYW5jZVRhYiIsInNwYWNlIiwic2hvd1Blb3BsZSIsInVzZVNldHRpbmdWYWx1ZSIsInJvb21JZCIsIl90IiwiZSIsIlNldHRpbmdzU3RvcmUiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIlJPT01fQUNDT1VOVCIsInNwYWNlTmFtZSIsIm5hbWUiLCJTcGFjZVByZWZlcmVuY2VzRGlhbG9nIiwiaW5pdGlhbFRhYklkIiwib25GaW5pc2hlZCIsInRhYnMiLCJUYWIiLCJTcGFjZVByZWZlcmVuY2VUYWIiLCJBcHBlYXJhbmNlIiwiX3RkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9TcGFjZVByZWZlcmVuY2VzRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ2hhbmdlRXZlbnQgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCBUYWJiZWRWaWV3LCB7IFRhYiB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1RhYmJlZFZpZXdcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3hcIjtcbmltcG9ydCB7IHVzZVNldHRpbmdWYWx1ZSB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VTZXR0aW5nc1wiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBSb29tTmFtZSBmcm9tIFwiLi4vZWxlbWVudHMvUm9vbU5hbWVcIjtcbmltcG9ydCB7IFNwYWNlUHJlZmVyZW5jZVRhYiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL09wZW5TcGFjZVByZWZlcmVuY2VzUGF5bG9hZFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBzcGFjZTogUm9vbTtcbiAgICBpbml0aWFsVGFiSWQ/OiBTcGFjZVByZWZlcmVuY2VUYWI7XG59XG5cbmNvbnN0IFNwYWNlUHJlZmVyZW5jZXNBcHBlYXJhbmNlVGFiID0gKHsgc3BhY2UgfTogUGljazxJUHJvcHMsIFwic3BhY2VcIj4pID0+IHtcbiAgICBjb25zdCBzaG93UGVvcGxlID0gdXNlU2V0dGluZ1ZhbHVlKFwiU3BhY2VzLnNob3dQZW9wbGVJblNwYWNlXCIsIHNwYWNlLnJvb21JZCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiU2VjdGlvbnMgdG8gc2hvd1wiKSB9PC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXshIXNob3dQZW9wbGV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZTogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTcGFjZXMuc2hvd1Blb3BsZUluU3BhY2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGFjZS5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhc2hvd1Blb3BsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiUGVvcGxlXCIpIH1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVGhpcyBncm91cHMgeW91ciBjaGF0cyB3aXRoIG1lbWJlcnMgb2YgdGhpcyBzcGFjZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJUdXJuaW5nIHRoaXMgb2ZmIHdpbGwgaGlkZSB0aG9zZSBjaGF0cyBmcm9tIHlvdXIgdmlldyBvZiAlKHNwYWNlTmFtZSlzLlwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZU5hbWU6IHNwYWNlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn07XG5cbmNvbnN0IFNwYWNlUHJlZmVyZW5jZXNEaWFsb2c6IFJlYWN0LkZDPElQcm9wcz4gPSAoeyBzcGFjZSwgaW5pdGlhbFRhYklkLCBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICBjb25zdCB0YWJzID0gW1xuICAgICAgICBuZXcgVGFiKFxuICAgICAgICAgICAgU3BhY2VQcmVmZXJlbmNlVGFiLkFwcGVhcmFuY2UsXG4gICAgICAgICAgICBfdGQoXCJBcHBlYXJhbmNlXCIpLFxuICAgICAgICAgICAgXCJteF9TcGFjZVByZWZlcmVuY2VzRGlhbG9nX2FwcGVhcmFuY2VJY29uXCIsXG4gICAgICAgICAgICA8U3BhY2VQcmVmZXJlbmNlc0FwcGVhcmFuY2VUYWIgc3BhY2U9e3NwYWNlfSAvPixcbiAgICAgICAgKSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlUHJlZmVyZW5jZXNEaWFsb2dcIlxuICAgICAgICAgICAgaGFzQ2FuY2VsXG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgICAgICAgICAgdGl0bGU9e190KFwiUHJlZmVyZW5jZXNcIil9XG4gICAgICAgICAgICBmaXhlZFdpZHRoPXtmYWxzZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGg0PlxuICAgICAgICAgICAgICAgIDxSb29tTmFtZSByb29tPXtzcGFjZX0gLz5cbiAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8VGFiYmVkVmlldyB0YWJzPXt0YWJzfSBpbml0aWFsVGFiSWQ9e2luaXRpYWxUYWJJZH0gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNwYWNlUHJlZmVyZW5jZXNEaWFsb2c7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXFCQSxNQUFNQSw2QkFBNkIsR0FBRyxRQUFzQztFQUFBLElBQXJDO0lBQUVDO0VBQUYsQ0FBcUM7RUFDeEUsTUFBTUMsVUFBVSxHQUFHLElBQUFDLDRCQUFBLEVBQWdCLDBCQUFoQixFQUE0Q0YsS0FBSyxDQUFDRyxNQUFsRCxDQUFuQjtFQUVBLG9CQUNJO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0k7SUFBSyxTQUFTLEVBQUM7RUFBZixHQUEwQyxJQUFBQyxtQkFBQSxFQUFHLGtCQUFILENBQTFDLENBREosZUFHSTtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJLDZCQUFDLHVCQUFEO0lBQ0ksT0FBTyxFQUFFLENBQUMsQ0FBQ0gsVUFEZjtJQUVJLFFBQVEsRUFBR0ksQ0FBRCxJQUFzQztNQUM1Q0Msc0JBQUEsQ0FBY0MsUUFBZCxDQUNJLDBCQURKLEVBRUlQLEtBQUssQ0FBQ0csTUFGVixFQUdJSywwQkFBQSxDQUFhQyxZQUhqQixFQUlJLENBQUNSLFVBSkw7SUFNSDtFQVRMLEdBV00sSUFBQUcsbUJBQUEsRUFBRyxRQUFILENBWE4sQ0FESixlQWNJLHdDQUNNLElBQUFBLG1CQUFBLEVBQUcsd0RBQ0QseUVBREYsRUFDNkU7SUFDM0VNLFNBQVMsRUFBRVYsS0FBSyxDQUFDVztFQUQwRCxDQUQ3RSxDQUROLENBZEosQ0FISixDQURKO0FBMkJILENBOUJEOztBQWdDQSxNQUFNQyxzQkFBd0MsR0FBRyxTQUF5QztFQUFBLElBQXhDO0lBQUVaLEtBQUY7SUFBU2EsWUFBVDtJQUF1QkM7RUFBdkIsQ0FBd0M7RUFDdEYsTUFBTUMsSUFBSSxHQUFHLENBQ1QsSUFBSUMsZUFBSixDQUNJQywrQ0FBQSxDQUFtQkMsVUFEdkIsRUFFSSxJQUFBQyxvQkFBQSxFQUFJLFlBQUosQ0FGSixFQUdJLDBDQUhKLGVBSUksNkJBQUMsNkJBQUQ7SUFBK0IsS0FBSyxFQUFFbkI7RUFBdEMsRUFKSixDQURTLENBQWI7RUFTQSxvQkFDSSw2QkFBQyxtQkFBRDtJQUNJLFNBQVMsRUFBQywyQkFEZDtJQUVJLFNBQVMsTUFGYjtJQUdJLFVBQVUsRUFBRWMsVUFIaEI7SUFJSSxLQUFLLEVBQUUsSUFBQVYsbUJBQUEsRUFBRyxhQUFILENBSlg7SUFLSSxVQUFVLEVBQUU7RUFMaEIsZ0JBT0ksc0RBQ0ksNkJBQUMsaUJBQUQ7SUFBVSxJQUFJLEVBQUVKO0VBQWhCLEVBREosQ0FQSixlQVVJO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0ksNkJBQUMsbUJBQUQ7SUFBWSxJQUFJLEVBQUVlLElBQWxCO0lBQXdCLFlBQVksRUFBRUY7RUFBdEMsRUFESixDQVZKLENBREo7QUFnQkgsQ0ExQkQ7O2VBNEJlRCxzQiJ9