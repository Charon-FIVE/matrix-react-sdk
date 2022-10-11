"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var FormattingUtils = _interopRequireWildcard(require("../../../utils/FormattingUtils"));

var _languageHandler = require("../../../languageHandler");

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2019 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
class ManualDeviceKeyVerificationDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onLegacyFinished", confirm => {
      if (confirm) {
        _MatrixClientPeg.MatrixClientPeg.get().setDeviceVerified(this.props.userId, this.props.device.deviceId, true);
      }

      this.props.onFinished(confirm);
    });
  }

  render() {
    let text;

    if (_MatrixClientPeg.MatrixClientPeg.get().getUserId() === this.props.userId) {
      text = (0, _languageHandler._t)("Confirm by comparing the following with the User Settings in your other session:");
    } else {
      text = (0, _languageHandler._t)("Confirm this user's session by comparing the following with their User Settings:");
    }

    const key = FormattingUtils.formatCryptoKey(this.props.device.getFingerprint());

    const body = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, text), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DeviceVerifyDialog_cryptoSection"
    }, /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)("Session name"), ":"), " ", /*#__PURE__*/_react.default.createElement("span", null, this.props.device.getDisplayName())), /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)("Session ID"), ":"), " ", /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("code", null, this.props.device.deviceId))), /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)("Session key"), ":"), " ", /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("code", null, /*#__PURE__*/_react.default.createElement("b", null, key)))))), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If they don't match, the security of your communication may be compromised.")));

    return /*#__PURE__*/_react.default.createElement(_QuestionDialog.default, {
      title: (0, _languageHandler._t)("Verify session"),
      description: body,
      button: (0, _languageHandler._t)("Verify session"),
      onFinished: this.onLegacyFinished
    });
  }

}

exports.default = ManualDeviceKeyVerificationDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYW51YWxEZXZpY2VLZXlWZXJpZmljYXRpb25EaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbmZpcm0iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJzZXREZXZpY2VWZXJpZmllZCIsInByb3BzIiwidXNlcklkIiwiZGV2aWNlIiwiZGV2aWNlSWQiLCJvbkZpbmlzaGVkIiwicmVuZGVyIiwidGV4dCIsImdldFVzZXJJZCIsIl90Iiwia2V5IiwiRm9ybWF0dGluZ1V0aWxzIiwiZm9ybWF0Q3J5cHRvS2V5IiwiZ2V0RmluZ2VycHJpbnQiLCJib2R5IiwiZ2V0RGlzcGxheU5hbWUiLCJvbkxlZ2FjeUZpbmlzaGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9NYW51YWxEZXZpY2VLZXlWZXJpZmljYXRpb25EaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERldmljZUluZm8gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2RldmljZWluZm9cIjtcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCAqIGFzIEZvcm1hdHRpbmdVdGlscyBmcm9tICcuLi8uLi8uLi91dGlscy9Gb3JtYXR0aW5nVXRpbHMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgdXNlcklkOiBzdHJpbmc7XG4gICAgZGV2aWNlOiBEZXZpY2VJbmZvO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYW51YWxEZXZpY2VLZXlWZXJpZmljYXRpb25EaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHJpdmF0ZSBvbkxlZ2FjeUZpbmlzaGVkID0gKGNvbmZpcm06IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKGNvbmZpcm0pIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXREZXZpY2VWZXJpZmllZChcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnVzZXJJZCwgdGhpcy5wcm9wcy5kZXZpY2UuZGV2aWNlSWQsIHRydWUsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChjb25maXJtKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpID09PSB0aGlzLnByb3BzLnVzZXJJZCkge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiQ29uZmlybSBieSBjb21wYXJpbmcgdGhlIGZvbGxvd2luZyB3aXRoIHRoZSBVc2VyIFNldHRpbmdzIGluIHlvdXIgb3RoZXIgc2Vzc2lvbjpcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0ZXh0ID0gX3QoXCJDb25maXJtIHRoaXMgdXNlcidzIHNlc3Npb24gYnkgY29tcGFyaW5nIHRoZSBmb2xsb3dpbmcgd2l0aCB0aGVpciBVc2VyIFNldHRpbmdzOlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGtleSA9IEZvcm1hdHRpbmdVdGlscy5mb3JtYXRDcnlwdG9LZXkodGhpcy5wcm9wcy5kZXZpY2UuZ2V0RmluZ2VycHJpbnQoKSk7XG4gICAgICAgIGNvbnN0IGJvZHkgPSAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICB7IHRleHQgfVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldmljZVZlcmlmeURpYWxvZ19jcnlwdG9TZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT48bGFiZWw+eyBfdChcIlNlc3Npb24gbmFtZVwiKSB9OjwvbGFiZWw+IDxzcGFuPnsgdGhpcy5wcm9wcy5kZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSB9PC9zcGFuPjwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+PGxhYmVsPnsgX3QoXCJTZXNzaW9uIElEXCIpIH06PC9sYWJlbD4gPHNwYW4+PGNvZGU+eyB0aGlzLnByb3BzLmRldmljZS5kZXZpY2VJZCB9PC9jb2RlPjwvc3Bhbj48L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPjxsYWJlbD57IF90KFwiU2Vzc2lvbiBrZXlcIikgfTo8L2xhYmVsPiA8c3Bhbj48Y29kZT48Yj57IGtleSB9PC9iPjwvY29kZT48L3NwYW4+PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIklmIHRoZXkgZG9uJ3QgbWF0Y2gsIHRoZSBzZWN1cml0eSBvZiB5b3VyIGNvbW11bmljYXRpb24gbWF5IGJlIGNvbXByb21pc2VkLlwiKSB9XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxRdWVzdGlvbkRpYWxvZ1xuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlZlcmlmeSBzZXNzaW9uXCIpfVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtib2R5fVxuICAgICAgICAgICAgICAgIGJ1dHRvbj17X3QoXCJWZXJpZnkgc2Vzc2lvblwiKX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uTGVnYWN5RmluaXNoZWR9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFvQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWdCZSxNQUFNQSxpQ0FBTixTQUFnREMsY0FBQSxDQUFNQyxTQUF0RCxDQUF3RTtFQUFBO0lBQUE7SUFBQSx3REFDdkRDLE9BQUQsSUFBNEI7TUFDbkQsSUFBSUEsT0FBSixFQUFhO1FBQ1RDLGdDQUFBLENBQWdCQyxHQUFoQixHQUFzQkMsaUJBQXRCLENBQ0ksS0FBS0MsS0FBTCxDQUFXQyxNQURmLEVBQ3VCLEtBQUtELEtBQUwsQ0FBV0UsTUFBWCxDQUFrQkMsUUFEekMsRUFDbUQsSUFEbkQ7TUFHSDs7TUFDRCxLQUFLSCxLQUFMLENBQVdJLFVBQVgsQ0FBc0JSLE9BQXRCO0lBQ0gsQ0FSa0Y7RUFBQTs7RUFVNUVTLE1BQU0sR0FBZ0I7SUFDekIsSUFBSUMsSUFBSjs7SUFDQSxJQUFJVCxnQ0FBQSxDQUFnQkMsR0FBaEIsR0FBc0JTLFNBQXRCLE9BQXNDLEtBQUtQLEtBQUwsQ0FBV0MsTUFBckQsRUFBNkQ7TUFDekRLLElBQUksR0FBRyxJQUFBRSxtQkFBQSxFQUFHLGtGQUFILENBQVA7SUFDSCxDQUZELE1BRU87TUFDSEYsSUFBSSxHQUFHLElBQUFFLG1CQUFBLEVBQUcsa0ZBQUgsQ0FBUDtJQUNIOztJQUVELE1BQU1DLEdBQUcsR0FBR0MsZUFBZSxDQUFDQyxlQUFoQixDQUFnQyxLQUFLWCxLQUFMLENBQVdFLE1BQVgsQ0FBa0JVLGNBQWxCLEVBQWhDLENBQVo7O0lBQ0EsTUFBTUMsSUFBSSxnQkFDTix1REFDSSx3Q0FDTVAsSUFETixDQURKLGVBSUk7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSSxzREFDSSxzREFBSSw0Q0FBUyxJQUFBRSxtQkFBQSxFQUFHLGNBQUgsQ0FBVCxNQUFKLG9CQUEyQywyQ0FBUSxLQUFLUixLQUFMLENBQVdFLE1BQVgsQ0FBa0JZLGNBQWxCLEVBQVIsQ0FBM0MsQ0FESixlQUVJLHNEQUFJLDRDQUFTLElBQUFOLG1CQUFBLEVBQUcsWUFBSCxDQUFULE1BQUosb0JBQXlDLHdEQUFNLDJDQUFRLEtBQUtSLEtBQUwsQ0FBV0UsTUFBWCxDQUFrQkMsUUFBMUIsQ0FBTixDQUF6QyxDQUZKLGVBR0ksc0RBQUksNENBQVMsSUFBQUssbUJBQUEsRUFBRyxhQUFILENBQVQsTUFBSixvQkFBMEMsd0RBQU0sd0RBQU0sd0NBQUtDLEdBQUwsQ0FBTixDQUFOLENBQTFDLENBSEosQ0FESixDQUpKLGVBV0ksd0NBQ00sSUFBQUQsbUJBQUEsRUFBRyw2RUFBSCxDQUROLENBWEosQ0FESjs7SUFrQkEsb0JBQ0ksNkJBQUMsdUJBQUQ7TUFDSSxLQUFLLEVBQUUsSUFBQUEsbUJBQUEsRUFBRyxnQkFBSCxDQURYO01BRUksV0FBVyxFQUFFSyxJQUZqQjtNQUdJLE1BQU0sRUFBRSxJQUFBTCxtQkFBQSxFQUFHLGdCQUFILENBSFo7TUFJSSxVQUFVLEVBQUUsS0FBS087SUFKckIsRUFESjtFQVFIOztBQTdDa0YifQ==