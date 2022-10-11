"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _EditableTextContainer = _interopRequireDefault(require("../elements/EditableTextContainer"));

/*
Copyright 2015 - 2021 The Matrix.org Foundation C.I.C.

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
class ChangeDisplayName extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "getDisplayName", async () => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        const res = await cli.getProfileInfo(cli.getUserId());
        return res.displayname;
      } catch (e) {
        throw new Error("Failed to fetch display name");
      }
    });
    (0, _defineProperty2.default)(this, "changeDisplayName", newDisplayname => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      return cli.setDisplayName(newDisplayname).catch(function () {
        throw new Error("Failed to set display name");
      });
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_EditableTextContainer.default, {
      getInitialValue: this.getDisplayName,
      placeholder: (0, _languageHandler._t)("No display name"),
      blurToSubmit: true,
      onSubmit: this.changeDisplayName
    });
  }

}

exports.default = ChangeDisplayName;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFuZ2VEaXNwbGF5TmFtZSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwicmVzIiwiZ2V0UHJvZmlsZUluZm8iLCJnZXRVc2VySWQiLCJkaXNwbGF5bmFtZSIsImUiLCJFcnJvciIsIm5ld0Rpc3BsYXluYW1lIiwic2V0RGlzcGxheU5hbWUiLCJjYXRjaCIsInJlbmRlciIsImdldERpc3BsYXlOYW1lIiwiX3QiLCJjaGFuZ2VEaXNwbGF5TmFtZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0NoYW5nZURpc3BsYXlOYW1lLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBFZGl0YWJsZVRleHRDb250YWluZXIgZnJvbSBcIi4uL2VsZW1lbnRzL0VkaXRhYmxlVGV4dENvbnRhaW5lclwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFuZ2VEaXNwbGF5TmFtZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSBnZXREaXNwbGF5TmFtZSA9IGFzeW5jICgpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBjbGkuZ2V0UHJvZmlsZUluZm8oY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGlzcGxheW5hbWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmZXRjaCBkaXNwbGF5IG5hbWVcIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjaGFuZ2VEaXNwbGF5TmFtZSA9IChuZXdEaXNwbGF5bmFtZTogc3RyaW5nKTogUHJvbWlzZTx7fT4gPT4ge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHJldHVybiBjbGkuc2V0RGlzcGxheU5hbWUobmV3RGlzcGxheW5hbWUpLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHNldCBkaXNwbGF5IG5hbWVcIik7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxFZGl0YWJsZVRleHRDb250YWluZXJcbiAgICAgICAgICAgICAgICBnZXRJbml0aWFsVmFsdWU9e3RoaXMuZ2V0RGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiTm8gZGlzcGxheSBuYW1lXCIpfVxuICAgICAgICAgICAgICAgIGJsdXJUb1N1Ym1pdD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvblN1Ym1pdD17dGhpcy5jaGFuZ2VEaXNwbGF5TmFtZX0gLz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRZSxNQUFNQSxpQkFBTixTQUFnQ0MsY0FBQSxDQUFNQyxTQUF0QyxDQUFnRDtFQUFBO0lBQUE7SUFBQSxzREFDbEMsWUFBNkI7TUFDbEQsTUFBTUMsR0FBRyxHQUFHQyxnQ0FBQSxDQUFnQkMsR0FBaEIsRUFBWjs7TUFDQSxJQUFJO1FBQ0EsTUFBTUMsR0FBRyxHQUFHLE1BQU1ILEdBQUcsQ0FBQ0ksY0FBSixDQUFtQkosR0FBRyxDQUFDSyxTQUFKLEVBQW5CLENBQWxCO1FBQ0EsT0FBT0YsR0FBRyxDQUFDRyxXQUFYO01BQ0gsQ0FIRCxDQUdFLE9BQU9DLENBQVAsRUFBVTtRQUNSLE1BQU0sSUFBSUMsS0FBSixDQUFVLDhCQUFWLENBQU47TUFDSDtJQUNKLENBVDBEO0lBQUEseURBVzlCQyxjQUFELElBQXlDO01BQ2pFLE1BQU1ULEdBQUcsR0FBR0MsZ0NBQUEsQ0FBZ0JDLEdBQWhCLEVBQVo7O01BQ0EsT0FBT0YsR0FBRyxDQUFDVSxjQUFKLENBQW1CRCxjQUFuQixFQUFtQ0UsS0FBbkMsQ0FBeUMsWUFBVztRQUN2RCxNQUFNLElBQUlILEtBQUosQ0FBVSw0QkFBVixDQUFOO01BQ0gsQ0FGTSxDQUFQO0lBR0gsQ0FoQjBEO0VBQUE7O0VBa0JwREksTUFBTSxHQUFnQjtJQUN6QixvQkFDSSw2QkFBQyw4QkFBRDtNQUNJLGVBQWUsRUFBRSxLQUFLQyxjQUQxQjtNQUVJLFdBQVcsRUFBRSxJQUFBQyxtQkFBQSxFQUFHLGlCQUFILENBRmpCO01BR0ksWUFBWSxFQUFFLElBSGxCO01BSUksUUFBUSxFQUFFLEtBQUtDO0lBSm5CLEVBREo7RUFPSDs7QUExQjBEIn0=