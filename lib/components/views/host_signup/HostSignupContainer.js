"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _HostSignupDialog = _interopRequireDefault(require("../dialogs/HostSignupDialog"));

var _HostSignupStore = require("../../../stores/HostSignupStore");

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _AsyncStore = require("../../../stores/AsyncStore");

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
const HostSignupContainer = () => {
  const [isActive, setIsActive] = (0, _react.useState)(_HostSignupStore.HostSignupStore.instance.isHostSignupActive);
  (0, _useEventEmitter.useEventEmitter)(_HostSignupStore.HostSignupStore.instance, _AsyncStore.UPDATE_EVENT, () => {
    setIsActive(_HostSignupStore.HostSignupStore.instance.isHostSignupActive);
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_HostSignupContainer"
  }, isActive && /*#__PURE__*/_react.default.createElement(_HostSignupDialog.default, null));
};

var _default = HostSignupContainer;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIb3N0U2lnbnVwQ29udGFpbmVyIiwiaXNBY3RpdmUiLCJzZXRJc0FjdGl2ZSIsInVzZVN0YXRlIiwiSG9zdFNpZ251cFN0b3JlIiwiaW5zdGFuY2UiLCJpc0hvc3RTaWdudXBBY3RpdmUiLCJ1c2VFdmVudEVtaXR0ZXIiLCJVUERBVEVfRVZFTlQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9ob3N0X3NpZ251cC9Ib3N0U2lnbnVwQ29udGFpbmVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBIb3N0U2lnbnVwRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL0hvc3RTaWdudXBEaWFsb2dcIjtcbmltcG9ydCB7IEhvc3RTaWdudXBTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvSG9zdFNpZ251cFN0b3JlXCI7XG5pbXBvcnQgeyB1c2VFdmVudEVtaXR0ZXIgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcblxuY29uc3QgSG9zdFNpZ251cENvbnRhaW5lciA9ICgpID0+IHtcbiAgICBjb25zdCBbaXNBY3RpdmUsIHNldElzQWN0aXZlXSA9IHVzZVN0YXRlKEhvc3RTaWdudXBTdG9yZS5pbnN0YW5jZS5pc0hvc3RTaWdudXBBY3RpdmUpO1xuICAgIHVzZUV2ZW50RW1pdHRlcihIb3N0U2lnbnVwU3RvcmUuaW5zdGFuY2UsIFVQREFURV9FVkVOVCwgKCkgPT4ge1xuICAgICAgICBzZXRJc0FjdGl2ZShIb3N0U2lnbnVwU3RvcmUuaW5zdGFuY2UuaXNIb3N0U2lnbnVwQWN0aXZlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0hvc3RTaWdudXBDb250YWluZXJcIj5cbiAgICAgICAgeyBpc0FjdGl2ZSAmJlxuICAgICAgICAgICAgPEhvc3RTaWdudXBEaWFsb2cgLz5cbiAgICAgICAgfVxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEhvc3RTaWdudXBDb250YWluZXI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNBLE1BQU1BLG1CQUFtQixHQUFHLE1BQU07RUFDOUIsTUFBTSxDQUFDQyxRQUFELEVBQVdDLFdBQVgsSUFBMEIsSUFBQUMsZUFBQSxFQUFTQyxnQ0FBQSxDQUFnQkMsUUFBaEIsQ0FBeUJDLGtCQUFsQyxDQUFoQztFQUNBLElBQUFDLGdDQUFBLEVBQWdCSCxnQ0FBQSxDQUFnQkMsUUFBaEMsRUFBMENHLHdCQUExQyxFQUF3RCxNQUFNO0lBQzFETixXQUFXLENBQUNFLGdDQUFBLENBQWdCQyxRQUFoQixDQUF5QkMsa0JBQTFCLENBQVg7RUFDSCxDQUZEO0VBSUEsb0JBQU87SUFBSyxTQUFTLEVBQUM7RUFBZixHQUNETCxRQUFRLGlCQUNOLDZCQUFDLHlCQUFELE9BRkQsQ0FBUDtBQUtILENBWEQ7O2VBYWVELG1CIn0=