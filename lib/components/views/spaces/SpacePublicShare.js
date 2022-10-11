"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _utils = require("matrix-js-sdk/src/utils");

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _strings = require("../../../utils/strings");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _RoomInvite = require("../../../RoomInvite");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _UIComponents = require("../../../customisations/helpers/UIComponents");

var _UIFeature = require("../../../settings/UIFeature");

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
const SpacePublicShare = _ref => {
  let {
    space,
    onFinished
  } = _ref;
  const [copiedText, setCopiedText] = (0, _react.useState)((0, _languageHandler._t)("Click to copy"));
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpacePublicShare"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpacePublicShare_shareButton",
    onClick: async () => {
      const permalinkCreator = new _Permalinks.RoomPermalinkCreator(space);
      permalinkCreator.load();
      const success = await (0, _strings.copyPlaintext)(permalinkCreator.forShareableRoom());
      const text = success ? (0, _languageHandler._t)("Copied!") : (0, _languageHandler._t)("Failed to copy");
      setCopiedText(text);
      await (0, _utils.sleep)(5000);

      if (copiedText === text) {
        // if the text hasn't changed by another click then clear it after some time
        setCopiedText((0, _languageHandler._t)("Click to copy"));
      }
    }
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Share invite link")), /*#__PURE__*/_react.default.createElement("span", null, copiedText)), space.canInvite(_MatrixClientPeg.MatrixClientPeg.get()?.getUserId()) && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.InviteUsers) ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpacePublicShare_inviteButton",
    onClick: () => {
      if (onFinished) onFinished();
      (0, _RoomInvite.showRoomInviteDialog)(space.roomId);
    }
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Invite people")), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Invite with email or username"))) : null);
};

var _default = SpacePublicShare;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcGFjZVB1YmxpY1NoYXJlIiwic3BhY2UiLCJvbkZpbmlzaGVkIiwiY29waWVkVGV4dCIsInNldENvcGllZFRleHQiLCJ1c2VTdGF0ZSIsIl90IiwicGVybWFsaW5rQ3JlYXRvciIsIlJvb21QZXJtYWxpbmtDcmVhdG9yIiwibG9hZCIsInN1Y2Nlc3MiLCJjb3B5UGxhaW50ZXh0IiwiZm9yU2hhcmVhYmxlUm9vbSIsInRleHQiLCJzbGVlcCIsImNhbkludml0ZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFVzZXJJZCIsInNob3VsZFNob3dDb21wb25lbnQiLCJVSUNvbXBvbmVudCIsIkludml0ZVVzZXJzIiwic2hvd1Jvb21JbnZpdGVEaWFsb2ciLCJyb29tSWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zcGFjZXMvU3BhY2VQdWJsaWNTaGFyZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy91dGlsc1wiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgeyBjb3B5UGxhaW50ZXh0IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3N0cmluZ3NcIjtcbmltcG9ydCB7IFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHsgc2hvd1Jvb21JbnZpdGVEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgc2hvdWxkU2hvd0NvbXBvbmVudCB9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9oZWxwZXJzL1VJQ29tcG9uZW50c1wiO1xuaW1wb3J0IHsgVUlDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNwYWNlOiBSb29tO1xuICAgIG9uRmluaXNoZWQ/KCk6IHZvaWQ7XG59XG5cbmNvbnN0IFNwYWNlUHVibGljU2hhcmUgPSAoeyBzcGFjZSwgb25GaW5pc2hlZCB9OiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBbY29waWVkVGV4dCwgc2V0Q29waWVkVGV4dF0gPSB1c2VTdGF0ZShfdChcIkNsaWNrIHRvIGNvcHlcIikpO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VQdWJsaWNTaGFyZVwiPlxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VQdWJsaWNTaGFyZV9zaGFyZUJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGVybWFsaW5rQ3JlYXRvciA9IG5ldyBSb29tUGVybWFsaW5rQ3JlYXRvcihzcGFjZSk7XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvci5sb2FkKCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IGNvcHlQbGFpbnRleHQocGVybWFsaW5rQ3JlYXRvci5mb3JTaGFyZWFibGVSb29tKCkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBzdWNjZXNzID8gX3QoXCJDb3BpZWQhXCIpIDogX3QoXCJGYWlsZWQgdG8gY29weVwiKTtcbiAgICAgICAgICAgICAgICBzZXRDb3BpZWRUZXh0KHRleHQpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKDUwMDApO1xuICAgICAgICAgICAgICAgIGlmIChjb3BpZWRUZXh0ID09PSB0ZXh0KSB7IC8vIGlmIHRoZSB0ZXh0IGhhc24ndCBjaGFuZ2VkIGJ5IGFub3RoZXIgY2xpY2sgdGhlbiBjbGVhciBpdCBhZnRlciBzb21lIHRpbWVcbiAgICAgICAgICAgICAgICAgICAgc2V0Q29waWVkVGV4dChfdChcIkNsaWNrIHRvIGNvcHlcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICAgIDxoMz57IF90KFwiU2hhcmUgaW52aXRlIGxpbmtcIikgfTwvaDM+XG4gICAgICAgICAgICA8c3Bhbj57IGNvcGllZFRleHQgfTwvc3Bhbj5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICB7IHNwYWNlLmNhbkludml0ZShNYXRyaXhDbGllbnRQZWcuZ2V0KCk/LmdldFVzZXJJZCgpKSAmJiBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50Lkludml0ZVVzZXJzKVxuICAgICAgICAgICAgPyA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlUHVibGljU2hhcmVfaW52aXRlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbkZpbmlzaGVkKSBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIHNob3dSb29tSW52aXRlRGlhbG9nKHNwYWNlLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8aDM+eyBfdChcIkludml0ZSBwZW9wbGVcIikgfTwvaDM+XG4gICAgICAgICAgICAgICAgPHNwYW4+eyBfdChcIkludml0ZSB3aXRoIGVtYWlsIG9yIHVzZXJuYW1lXCIpIH08L3NwYW4+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA6IG51bGwgfVxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNwYWNlUHVibGljU2hhcmU7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW9CQSxNQUFNQSxnQkFBZ0IsR0FBRyxRQUFtQztFQUFBLElBQWxDO0lBQUVDLEtBQUY7SUFBU0M7RUFBVCxDQUFrQztFQUN4RCxNQUFNLENBQUNDLFVBQUQsRUFBYUMsYUFBYixJQUE4QixJQUFBQyxlQUFBLEVBQVMsSUFBQUMsbUJBQUEsRUFBRyxlQUFILENBQVQsQ0FBcEM7RUFFQSxvQkFBTztJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNILDZCQUFDLHlCQUFEO0lBQ0ksU0FBUyxFQUFDLGlDQURkO0lBRUksT0FBTyxFQUFFLFlBQVk7TUFDakIsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSUMsZ0NBQUosQ0FBeUJQLEtBQXpCLENBQXpCO01BQ0FNLGdCQUFnQixDQUFDRSxJQUFqQjtNQUNBLE1BQU1DLE9BQU8sR0FBRyxNQUFNLElBQUFDLHNCQUFBLEVBQWNKLGdCQUFnQixDQUFDSyxnQkFBakIsRUFBZCxDQUF0QjtNQUNBLE1BQU1DLElBQUksR0FBR0gsT0FBTyxHQUFHLElBQUFKLG1CQUFBLEVBQUcsU0FBSCxDQUFILEdBQW1CLElBQUFBLG1CQUFBLEVBQUcsZ0JBQUgsQ0FBdkM7TUFDQUYsYUFBYSxDQUFDUyxJQUFELENBQWI7TUFDQSxNQUFNLElBQUFDLFlBQUEsRUFBTSxJQUFOLENBQU47O01BQ0EsSUFBSVgsVUFBVSxLQUFLVSxJQUFuQixFQUF5QjtRQUFFO1FBQ3ZCVCxhQUFhLENBQUMsSUFBQUUsbUJBQUEsRUFBRyxlQUFILENBQUQsQ0FBYjtNQUNIO0lBQ0o7RUFaTCxnQkFjSSx5Q0FBTSxJQUFBQSxtQkFBQSxFQUFHLG1CQUFILENBQU4sQ0FkSixlQWVJLDJDQUFRSCxVQUFSLENBZkosQ0FERyxFQWtCREYsS0FBSyxDQUFDYyxTQUFOLENBQWdCQyxnQ0FBQSxDQUFnQkMsR0FBaEIsSUFBdUJDLFNBQXZCLEVBQWhCLEtBQXVELElBQUFDLGlDQUFBLEVBQW9CQyxzQkFBQSxDQUFZQyxXQUFoQyxDQUF2RCxnQkFDSSw2QkFBQyx5QkFBRDtJQUNFLFNBQVMsRUFBQyxrQ0FEWjtJQUVFLE9BQU8sRUFBRSxNQUFNO01BQ1gsSUFBSW5CLFVBQUosRUFBZ0JBLFVBQVU7TUFDMUIsSUFBQW9CLGdDQUFBLEVBQXFCckIsS0FBSyxDQUFDc0IsTUFBM0I7SUFDSDtFQUxILGdCQU9FLHlDQUFNLElBQUFqQixtQkFBQSxFQUFHLGVBQUgsQ0FBTixDQVBGLGVBUUUsMkNBQVEsSUFBQUEsbUJBQUEsRUFBRywrQkFBSCxDQUFSLENBUkYsQ0FESixHQVdJLElBN0JILENBQVA7QUErQkgsQ0FsQ0Q7O2VBb0NlTixnQiJ9