"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _AddExistingToSpaceDialog = require("./AddExistingToSpaceDialog");

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
const AddExistingSubspaceDialog = _ref => {
  let {
    space,
    onCreateSubspaceClick,
    onFinished
  } = _ref;
  const [selectedSpace, setSelectedSpace] = (0, _react.useState)(space);
  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    title: /*#__PURE__*/_react.default.createElement(_AddExistingToSpaceDialog.SubspaceSelector, {
      title: (0, _languageHandler._t)("Add existing space"),
      space: space,
      value: selectedSpace,
      onChange: setSelectedSpace
    }),
    className: "mx_AddExistingToSpaceDialog",
    contentId: "mx_AddExistingToSpace",
    onFinished: onFinished,
    fixedWidth: false
  }, /*#__PURE__*/_react.default.createElement(_MatrixClientContext.default.Provider, {
    value: space.client
  }, /*#__PURE__*/_react.default.createElement(_AddExistingToSpaceDialog.AddExistingToSpace, {
    space: space,
    onFinished: onFinished,
    footerPrompt: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Want to add a new space instead?")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onCreateSubspaceClick,
      kind: "link"
    }, (0, _languageHandler._t)("Create a new space"))),
    filterPlaceholder: (0, _languageHandler._t)("Search for spaces"),
    spacesRenderer: _AddExistingToSpaceDialog.defaultSpacesRenderer
  })));
};

var _default = AddExistingSubspaceDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBZGRFeGlzdGluZ1N1YnNwYWNlRGlhbG9nIiwic3BhY2UiLCJvbkNyZWF0ZVN1YnNwYWNlQ2xpY2siLCJvbkZpbmlzaGVkIiwic2VsZWN0ZWRTcGFjZSIsInNldFNlbGVjdGVkU3BhY2UiLCJ1c2VTdGF0ZSIsIl90IiwiY2xpZW50IiwiZGVmYXVsdFNwYWNlc1JlbmRlcmVyIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9BZGRFeGlzdGluZ1N1YnNwYWNlRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgeyBBZGRFeGlzdGluZ1RvU3BhY2UsIGRlZmF1bHRTcGFjZXNSZW5kZXJlciwgU3Vic3BhY2VTZWxlY3RvciB9IGZyb20gXCIuL0FkZEV4aXN0aW5nVG9TcGFjZURpYWxvZ1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBzcGFjZTogUm9vbTtcbiAgICBvbkNyZWF0ZVN1YnNwYWNlQ2xpY2soKTogdm9pZDtcbiAgICBvbkZpbmlzaGVkKGFkZGVkPzogYm9vbGVhbik6IHZvaWQ7XG59XG5cbmNvbnN0IEFkZEV4aXN0aW5nU3Vic3BhY2VEaWFsb2c6IFJlYWN0LkZDPElQcm9wcz4gPSAoeyBzcGFjZSwgb25DcmVhdGVTdWJzcGFjZUNsaWNrLCBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICBjb25zdCBbc2VsZWN0ZWRTcGFjZSwgc2V0U2VsZWN0ZWRTcGFjZV0gPSB1c2VTdGF0ZShzcGFjZSk7XG5cbiAgICByZXR1cm4gPEJhc2VEaWFsb2dcbiAgICAgICAgdGl0bGU9eyhcbiAgICAgICAgICAgIDxTdWJzcGFjZVNlbGVjdG9yXG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiQWRkIGV4aXN0aW5nIHNwYWNlXCIpfVxuICAgICAgICAgICAgICAgIHNwYWNlPXtzcGFjZX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRTcGFjZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0U2VsZWN0ZWRTcGFjZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICl9XG4gICAgICAgIGNsYXNzTmFtZT1cIm14X0FkZEV4aXN0aW5nVG9TcGFjZURpYWxvZ1wiXG4gICAgICAgIGNvbnRlbnRJZD1cIm14X0FkZEV4aXN0aW5nVG9TcGFjZVwiXG4gICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9XG4gICAgICAgIGZpeGVkV2lkdGg9e2ZhbHNlfVxuICAgID5cbiAgICAgICAgPE1hdHJpeENsaWVudENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3NwYWNlLmNsaWVudH0+XG4gICAgICAgICAgICA8QWRkRXhpc3RpbmdUb1NwYWNlXG4gICAgICAgICAgICAgICAgc3BhY2U9e3NwYWNlfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgZm9vdGVyUHJvbXB0PXs8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PnsgX3QoXCJXYW50IHRvIGFkZCBhIG5ldyBzcGFjZSBpbnN0ZWFkP1wiKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e29uQ3JlYXRlU3Vic3BhY2VDbGlja30ga2luZD1cImxpbmtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDcmVhdGUgYSBuZXcgc3BhY2VcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC8+fVxuICAgICAgICAgICAgICAgIGZpbHRlclBsYWNlaG9sZGVyPXtfdChcIlNlYXJjaCBmb3Igc3BhY2VzXCIpfVxuICAgICAgICAgICAgICAgIHNwYWNlc1JlbmRlcmVyPXtkZWZhdWx0U3BhY2VzUmVuZGVyZXJ9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L01hdHJpeENsaWVudENvbnRleHQuUHJvdmlkZXI+XG4gICAgPC9CYXNlRGlhbG9nPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEFkZEV4aXN0aW5nU3Vic3BhY2VEaWFsb2c7XG5cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUJBLE1BQU1BLHlCQUEyQyxHQUFHLFFBQWtEO0VBQUEsSUFBakQ7SUFBRUMsS0FBRjtJQUFTQyxxQkFBVDtJQUFnQ0M7RUFBaEMsQ0FBaUQ7RUFDbEcsTUFBTSxDQUFDQyxhQUFELEVBQWdCQyxnQkFBaEIsSUFBb0MsSUFBQUMsZUFBQSxFQUFTTCxLQUFULENBQTFDO0VBRUEsb0JBQU8sNkJBQUMsbUJBQUQ7SUFDSCxLQUFLLGVBQ0QsNkJBQUMsMENBQUQ7TUFDSSxLQUFLLEVBQUUsSUFBQU0sbUJBQUEsRUFBRyxvQkFBSCxDQURYO01BRUksS0FBSyxFQUFFTixLQUZYO01BR0ksS0FBSyxFQUFFRyxhQUhYO01BSUksUUFBUSxFQUFFQztJQUpkLEVBRkQ7SUFTSCxTQUFTLEVBQUMsNkJBVFA7SUFVSCxTQUFTLEVBQUMsdUJBVlA7SUFXSCxVQUFVLEVBQUVGLFVBWFQ7SUFZSCxVQUFVLEVBQUU7RUFaVCxnQkFjSCw2QkFBQyw0QkFBRCxDQUFxQixRQUFyQjtJQUE4QixLQUFLLEVBQUVGLEtBQUssQ0FBQ087RUFBM0MsZ0JBQ0ksNkJBQUMsNENBQUQ7SUFDSSxLQUFLLEVBQUVQLEtBRFg7SUFFSSxVQUFVLEVBQUVFLFVBRmhCO0lBR0ksWUFBWSxlQUFFLHlFQUNWLDBDQUFPLElBQUFJLG1CQUFBLEVBQUcsa0NBQUgsQ0FBUCxDQURVLGVBRVYsNkJBQUMseUJBQUQ7TUFBa0IsT0FBTyxFQUFFTCxxQkFBM0I7TUFBa0QsSUFBSSxFQUFDO0lBQXZELEdBQ00sSUFBQUssbUJBQUEsRUFBRyxvQkFBSCxDQUROLENBRlUsQ0FIbEI7SUFTSSxpQkFBaUIsRUFBRSxJQUFBQSxtQkFBQSxFQUFHLG1CQUFILENBVHZCO0lBVUksY0FBYyxFQUFFRTtFQVZwQixFQURKLENBZEcsQ0FBUDtBQTZCSCxDQWhDRDs7ZUFrQ2VULHlCIn0=