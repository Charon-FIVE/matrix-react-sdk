"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

/*
Copyright 2018 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const CryptoStoreTooNewDialog = props => {
  const brand = _SdkConfig.default.get().brand;

  const _onLogoutClicked = () => {
    _Modal.default.createDialog(_QuestionDialog.default, {
      title: (0, _languageHandler._t)("Sign out"),
      description: (0, _languageHandler._t)("To avoid losing your chat history, you must export your room keys " + "before logging out. You will need to go back to the newer version of " + "%(brand)s to do this", {
        brand
      }),
      button: (0, _languageHandler._t)("Sign out"),
      focus: false,
      onFinished: doLogout => {
        if (doLogout) {
          _dispatcher.default.dispatch({
            action: 'logout'
          });

          props.onFinished(true);
        }
      }
    });
  };

  const description = (0, _languageHandler._t)("You've previously used a newer version of %(brand)s with this session. " + "To use this version again with end to end encryption, you will " + "need to sign out and back in again.", {
    brand
  });
  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    className: "mx_CryptoStoreTooNewDialog",
    contentId: "mx_Dialog_content",
    title: (0, _languageHandler._t)("Incompatible Database"),
    hasCancel: false,
    onFinished: props.onFinished
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Dialog_content",
    id: "mx_Dialog_content"
  }, description), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
    primaryButton: (0, _languageHandler._t)('Continue With Encryption Disabled'),
    hasCancel: false,
    onPrimaryButtonClick: props.onFinished
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: _onLogoutClicked
  }, (0, _languageHandler._t)('Sign out'))));
};

var _default = CryptoStoreTooNewDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcnlwdG9TdG9yZVRvb05ld0RpYWxvZyIsInByb3BzIiwiYnJhbmQiLCJTZGtDb25maWciLCJnZXQiLCJfb25Mb2dvdXRDbGlja2VkIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiX3QiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsImZvY3VzIiwib25GaW5pc2hlZCIsImRvTG9nb3V0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0NyeXB0b1N0b3JlVG9vTmV3RGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4vUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuL0lEaWFsb2dQcm9wc1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHt9XG5cbmNvbnN0IENyeXB0b1N0b3JlVG9vTmV3RGlhbG9nOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHByb3BzOiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcblxuICAgIGNvbnN0IF9vbkxvZ291dENsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiU2lnbiBvdXRcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXG4gICAgICAgICAgICAgICAgXCJUbyBhdm9pZCBsb3NpbmcgeW91ciBjaGF0IGhpc3RvcnksIHlvdSBtdXN0IGV4cG9ydCB5b3VyIHJvb20ga2V5cyBcIiArXG4gICAgICAgICAgICAgICAgXCJiZWZvcmUgbG9nZ2luZyBvdXQuIFlvdSB3aWxsIG5lZWQgdG8gZ28gYmFjayB0byB0aGUgbmV3ZXIgdmVyc2lvbiBvZiBcIiArXG4gICAgICAgICAgICAgICAgXCIlKGJyYW5kKXMgdG8gZG8gdGhpc1wiLFxuICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBidXR0b246IF90KFwiU2lnbiBvdXRcIiksXG4gICAgICAgICAgICBmb2N1czogZmFsc2UsXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAoZG9Mb2dvdXQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZG9Mb2dvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnbG9nb3V0JyB9KTtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgZGVzY3JpcHRpb24gPVxuICAgICAgICBfdChcbiAgICAgICAgICAgIFwiWW91J3ZlIHByZXZpb3VzbHkgdXNlZCBhIG5ld2VyIHZlcnNpb24gb2YgJShicmFuZClzIHdpdGggdGhpcyBzZXNzaW9uLiBcIiArXG4gICAgICAgICAgICBcIlRvIHVzZSB0aGlzIHZlcnNpb24gYWdhaW4gd2l0aCBlbmQgdG8gZW5kIGVuY3J5cHRpb24sIHlvdSB3aWxsIFwiICtcbiAgICAgICAgICAgIFwibmVlZCB0byBzaWduIG91dCBhbmQgYmFjayBpbiBhZ2Fpbi5cIixcbiAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgKTtcblxuICAgIHJldHVybiAoPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfQ3J5cHRvU3RvcmVUb29OZXdEaWFsb2dcIlxuICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICB0aXRsZT17X3QoXCJJbmNvbXBhdGlibGUgRGF0YWJhc2VcIil9XG4gICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgIG9uRmluaXNoZWQ9e3Byb3BzLm9uRmluaXNoZWR9XG4gICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCIgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgIHsgZGVzY3JpcHRpb24gfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ0NvbnRpbnVlIFdpdGggRW5jcnlwdGlvbiBEaXNhYmxlZCcpfVxuICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXtwcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICA+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e19vbkxvZ291dENsaWNrZWR9PlxuICAgICAgICAgICAgICAgIHsgX3QoJ1NpZ24gb3V0JykgfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvRGlhbG9nQnV0dG9ucz5cbiAgICA8L0Jhc2VEaWFsb2c+KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENyeXB0b1N0b3JlVG9vTmV3RGlhbG9nO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZUEsTUFBTUEsdUJBQXlDLEdBQUlDLEtBQUQsSUFBbUI7RUFDakUsTUFBTUMsS0FBSyxHQUFHQyxrQkFBQSxDQUFVQyxHQUFWLEdBQWdCRixLQUE5Qjs7RUFFQSxNQUFNRyxnQkFBZ0IsR0FBRyxNQUFNO0lBQzNCQyxjQUFBLENBQU1DLFlBQU4sQ0FBbUJDLHVCQUFuQixFQUFtQztNQUMvQkMsS0FBSyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsVUFBSCxDQUR3QjtNQUUvQkMsV0FBVyxFQUFFLElBQUFELG1CQUFBLEVBQ1QsdUVBQ0EsdUVBREEsR0FFQSxzQkFIUyxFQUlUO1FBQUVSO01BQUYsQ0FKUyxDQUZrQjtNQVEvQlUsTUFBTSxFQUFFLElBQUFGLG1CQUFBLEVBQUcsVUFBSCxDQVJ1QjtNQVMvQkcsS0FBSyxFQUFFLEtBVHdCO01BVS9CQyxVQUFVLEVBQUdDLFFBQUQsSUFBYztRQUN0QixJQUFJQSxRQUFKLEVBQWM7VUFDVkMsbUJBQUEsQ0FBSUMsUUFBSixDQUFhO1lBQUVDLE1BQU0sRUFBRTtVQUFWLENBQWI7O1VBQ0FqQixLQUFLLENBQUNhLFVBQU4sQ0FBaUIsSUFBakI7UUFDSDtNQUNKO0lBZjhCLENBQW5DO0VBaUJILENBbEJEOztFQW9CQSxNQUFNSCxXQUFXLEdBQ2IsSUFBQUQsbUJBQUEsRUFDSSw0RUFDQSxpRUFEQSxHQUVBLHFDQUhKLEVBSUk7SUFBRVI7RUFBRixDQUpKLENBREo7RUFRQSxvQkFBUSw2QkFBQyxtQkFBRDtJQUFZLFNBQVMsRUFBQyw0QkFBdEI7SUFDSixTQUFTLEVBQUMsbUJBRE47SUFFSixLQUFLLEVBQUUsSUFBQVEsbUJBQUEsRUFBRyx1QkFBSCxDQUZIO0lBR0osU0FBUyxFQUFFLEtBSFA7SUFJSixVQUFVLEVBQUVULEtBQUssQ0FBQ2E7RUFKZCxnQkFNSjtJQUFLLFNBQVMsRUFBQyxtQkFBZjtJQUFtQyxFQUFFLEVBQUM7RUFBdEMsR0FDTUgsV0FETixDQU5JLGVBU0osNkJBQUMsc0JBQUQ7SUFBZSxhQUFhLEVBQUUsSUFBQUQsbUJBQUEsRUFBRyxtQ0FBSCxDQUE5QjtJQUNJLFNBQVMsRUFBRSxLQURmO0lBRUksb0JBQW9CLEVBQUVULEtBQUssQ0FBQ2E7RUFGaEMsZ0JBSUk7SUFBUSxPQUFPLEVBQUVUO0VBQWpCLEdBQ00sSUFBQUssbUJBQUEsRUFBRyxVQUFILENBRE4sQ0FKSixDQVRJLENBQVI7QUFrQkgsQ0FqREQ7O2VBbURlVix1QiJ9