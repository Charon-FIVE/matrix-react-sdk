"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

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
class ConfirmWipeDeviceDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onConfirm", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "onDecline", () => {
      this.props.onFinished(false);
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_ConfirmWipeDeviceDialog",
      hasCancel: true,
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Clear all data in this session?")
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ConfirmWipeDeviceDialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Clearing all data from this session is permanent. Encrypted messages will be lost " + "unless their keys have been backed up."))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Clear all data"),
      onPrimaryButtonClick: this.onConfirm,
      primaryButtonClass: "danger",
      cancelButton: (0, _languageHandler._t)("Cancel"),
      onCancel: this.onDecline
    }));
  }

}

exports.default = ConfirmWipeDeviceDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25maXJtV2lwZURldmljZURpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwicHJvcHMiLCJvbkZpbmlzaGVkIiwicmVuZGVyIiwiX3QiLCJvbkNvbmZpcm0iLCJvbkRlY2xpbmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0NvbmZpcm1XaXBlRGV2aWNlRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maXJtV2lwZURldmljZURpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIG9uQ29uZmlybSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRGVjbGluZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0NvbmZpcm1XaXBlRGV2aWNlRGlhbG9nJ1xuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiQ2xlYXIgYWxsIGRhdGEgaW4gdGhpcyBzZXNzaW9uP1wiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfQ29uZmlybVdpcGVEZXZpY2VEaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNsZWFyaW5nIGFsbCBkYXRhIGZyb20gdGhpcyBzZXNzaW9uIGlzIHBlcm1hbmVudC4gRW5jcnlwdGVkIG1lc3NhZ2VzIHdpbGwgYmUgbG9zdCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1bmxlc3MgdGhlaXIga2V5cyBoYXZlIGJlZW4gYmFja2VkIHVwLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIkNsZWFyIGFsbCBkYXRhXCIpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbkNvbmZpcm19XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b25DbGFzcz1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbj17X3QoXCJDYW5jZWxcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uRGVjbGluZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVllLE1BQU1BLHVCQUFOLFNBQXNDQyxjQUFBLENBQU1DLFNBQTVDLENBQThEO0VBQUE7SUFBQTtJQUFBLGlEQUNyRCxNQUFZO01BQzVCLEtBQUtDLEtBQUwsQ0FBV0MsVUFBWCxDQUFzQixJQUF0QjtJQUNILENBSHdFO0lBQUEsaURBS3JELE1BQVk7TUFDNUIsS0FBS0QsS0FBTCxDQUFXQyxVQUFYLENBQXNCLEtBQXRCO0lBQ0gsQ0FQd0U7RUFBQTs7RUFTekVDLE1BQU0sR0FBRztJQUNMLG9CQUNJLDZCQUFDLG1CQUFEO01BQ0ksU0FBUyxFQUFDLDRCQURkO01BRUksU0FBUyxFQUFFLElBRmY7TUFHSSxVQUFVLEVBQUUsS0FBS0YsS0FBTCxDQUFXQyxVQUgzQjtNQUlJLEtBQUssRUFBRSxJQUFBRSxtQkFBQSxFQUFHLGlDQUFIO0lBSlgsZ0JBTUk7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSSx3Q0FDTSxJQUFBQSxtQkFBQSxFQUNFLHVGQUNBLHdDQUZGLENBRE4sQ0FESixDQU5KLGVBY0ksNkJBQUMsc0JBQUQ7TUFDSSxhQUFhLEVBQUUsSUFBQUEsbUJBQUEsRUFBRyxnQkFBSCxDQURuQjtNQUVJLG9CQUFvQixFQUFFLEtBQUtDLFNBRi9CO01BR0ksa0JBQWtCLEVBQUMsUUFIdkI7TUFJSSxZQUFZLEVBQUUsSUFBQUQsbUJBQUEsRUFBRyxRQUFILENBSmxCO01BS0ksUUFBUSxFQUFFLEtBQUtFO0lBTG5CLEVBZEosQ0FESjtFQXdCSDs7QUFsQ3dFIn0=