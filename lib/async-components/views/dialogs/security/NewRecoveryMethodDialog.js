"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _RestoreKeyBackupDialog = _interopRequireDefault(require("../../../../components/views/dialogs/security/RestoreKeyBackupDialog"));

var _actions = require("../../../../dispatcher/actions");

var _DialogButtons = _interopRequireDefault(require("../../../../components/views/elements/DialogButtons"));

var _BaseDialog = _interopRequireDefault(require("../../../../components/views/dialogs/BaseDialog"));

/*
Copyright 2018, 2019 New Vector Ltd
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
class NewRecoveryMethodDialog extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onOkClick", () => {
      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onGoToSettingsClick", () => {
      this.props.onFinished();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
    (0, _defineProperty2.default)(this, "onSetupClick", async () => {
      _Modal.default.createDialog(_RestoreKeyBackupDialog.default, {
        onFinished: this.props.onFinished
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
  }

  render() {
    const title = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_KeyBackupFailedDialog_title"
    }, (0, _languageHandler._t)("New Recovery Method"));

    const newMethodDetected = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("A new Security Phrase and key for Secure Messages have been detected."));

    const hackWarning = /*#__PURE__*/_react.default.createElement("p", {
      className: "warning"
    }, (0, _languageHandler._t)("If you didn't set the new recovery method, an " + "attacker may be trying to access your account. " + "Change your account password and set a new recovery " + "method immediately in Settings."));

    let content;

    if (_MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled()) {
      content = /*#__PURE__*/_react.default.createElement("div", null, newMethodDetected, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This session is encrypting history using the new recovery method.")), hackWarning, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("OK"),
        onPrimaryButtonClick: this.onOkClick,
        cancelButton: (0, _languageHandler._t)("Go to Settings"),
        onCancel: this.onGoToSettingsClick
      }));
    } else {
      content = /*#__PURE__*/_react.default.createElement("div", null, newMethodDetected, hackWarning, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("Set up Secure Messages"),
        onPrimaryButtonClick: this.onSetupClick,
        cancelButton: (0, _languageHandler._t)("Go to Settings"),
        onCancel: this.onGoToSettingsClick
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_KeyBackupFailedDialog",
      onFinished: this.props.onFinished,
      title: title
    }, content);
  }

}

exports.default = NewRecoveryMethodDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOZXdSZWNvdmVyeU1ldGhvZERpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsInByb3BzIiwib25GaW5pc2hlZCIsImRpcyIsImZpcmUiLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJSZXN0b3JlS2V5QmFja3VwRGlhbG9nIiwicmVuZGVyIiwidGl0bGUiLCJfdCIsIm5ld01ldGhvZERldGVjdGVkIiwiaGFja1dhcm5pbmciLCJjb250ZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0S2V5QmFja3VwRW5hYmxlZCIsIm9uT2tDbGljayIsIm9uR29Ub1NldHRpbmdzQ2xpY2siLCJvblNldHVwQ2xpY2siXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L05ld1JlY292ZXJ5TWV0aG9kRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgSUtleUJhY2t1cEluZm8gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2tleWJhY2t1cFwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBSZXN0b3JlS2V5QmFja3VwRGlhbG9nIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvUmVzdG9yZUtleUJhY2t1cERpYWxvZ1wiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQmFzZURpYWxvZ1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBuZXdWZXJzaW9uSW5mbzogSUtleUJhY2t1cEluZm87XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ld1JlY292ZXJ5TWV0aG9kRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIG9uT2tDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Hb1RvU2V0dGluZ3NDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3VXNlclNldHRpbmdzKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNldHVwQ2xpY2sgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhSZXN0b3JlS2V5QmFja3VwRGlhbG9nLCB7XG4gICAgICAgICAgICBvbkZpbmlzaGVkOiB0aGlzLnByb3BzLm9uRmluaXNoZWQsXG4gICAgICAgIH0sIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgdGl0bGUgPSA8c3BhbiBjbGFzc05hbWU9XCJteF9LZXlCYWNrdXBGYWlsZWREaWFsb2dfdGl0bGVcIj5cbiAgICAgICAgICAgIHsgX3QoXCJOZXcgUmVjb3ZlcnkgTWV0aG9kXCIpIH1cbiAgICAgICAgPC9zcGFuPjtcblxuICAgICAgICBjb25zdCBuZXdNZXRob2REZXRlY3RlZCA9IDxwPnsgX3QoXG4gICAgICAgICAgICBcIkEgbmV3IFNlY3VyaXR5IFBocmFzZSBhbmQga2V5IGZvciBTZWN1cmUgTWVzc2FnZXMgaGF2ZSBiZWVuIGRldGVjdGVkLlwiLFxuICAgICAgICApIH08L3A+O1xuXG4gICAgICAgIGNvbnN0IGhhY2tXYXJuaW5nID0gPHAgY2xhc3NOYW1lPVwid2FybmluZ1wiPnsgX3QoXG4gICAgICAgICAgICBcIklmIHlvdSBkaWRuJ3Qgc2V0IHRoZSBuZXcgcmVjb3ZlcnkgbWV0aG9kLCBhbiBcIiArXG4gICAgICAgICAgICBcImF0dGFja2VyIG1heSBiZSB0cnlpbmcgdG8gYWNjZXNzIHlvdXIgYWNjb3VudC4gXCIgK1xuICAgICAgICAgICAgXCJDaGFuZ2UgeW91ciBhY2NvdW50IHBhc3N3b3JkIGFuZCBzZXQgYSBuZXcgcmVjb3ZlcnkgXCIgK1xuICAgICAgICAgICAgXCJtZXRob2QgaW1tZWRpYXRlbHkgaW4gU2V0dGluZ3MuXCIsXG4gICAgICAgICkgfTwvcD47XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICB7IG5ld01ldGhvZERldGVjdGVkIH1cbiAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgc2Vzc2lvbiBpcyBlbmNyeXB0aW5nIGhpc3RvcnkgdXNpbmcgdGhlIG5ldyByZWNvdmVyeSBtZXRob2QuXCIsXG4gICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgICAgIHsgaGFja1dhcm5pbmcgfVxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiT0tcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uT2tDbGlja31cbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uPXtfdChcIkdvIHRvIFNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkdvVG9TZXR0aW5nc0NsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICB7IG5ld01ldGhvZERldGVjdGVkIH1cbiAgICAgICAgICAgICAgICB7IGhhY2tXYXJuaW5nIH1cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIlNldCB1cCBTZWN1cmUgTWVzc2FnZXNcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uU2V0dXBDbGlja31cbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uPXtfdChcIkdvIHRvIFNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkdvVG9TZXR0aW5nc0NsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfS2V5QmFja3VwRmFpbGVkRGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQmUsTUFBTUEsdUJBQU4sU0FBc0NDLGNBQUEsQ0FBTUMsYUFBNUMsQ0FBa0U7RUFBQTtJQUFBO0lBQUEsaURBQ3pELE1BQVk7TUFDNUIsS0FBS0MsS0FBTCxDQUFXQyxVQUFYO0lBQ0gsQ0FINEU7SUFBQSwyREFLL0MsTUFBWTtNQUN0QyxLQUFLRCxLQUFMLENBQVdDLFVBQVg7O01BQ0FDLG1CQUFBLENBQUlDLElBQUosQ0FBU0MsZUFBQSxDQUFPQyxnQkFBaEI7SUFDSCxDQVI0RTtJQUFBLG9EQVV0RCxZQUEyQjtNQUM5Q0MsY0FBQSxDQUFNQyxZQUFOLENBQW1CQywrQkFBbkIsRUFBMkM7UUFDdkNQLFVBQVUsRUFBRSxLQUFLRCxLQUFMLENBQVdDO01BRGdCLENBQTNDLEVBRUcsSUFGSDtNQUVTO01BQWlCLEtBRjFCO01BRWlDO01BQWUsSUFGaEQ7SUFHSCxDQWQ0RTtFQUFBOztFQWdCdEVRLE1BQU0sR0FBZ0I7SUFDekIsTUFBTUMsS0FBSyxnQkFBRztNQUFNLFNBQVMsRUFBQztJQUFoQixHQUNSLElBQUFDLG1CQUFBLEVBQUcscUJBQUgsQ0FEUSxDQUFkOztJQUlBLE1BQU1DLGlCQUFpQixnQkFBRyx3Q0FBSyxJQUFBRCxtQkFBQSxFQUMzQix1RUFEMkIsQ0FBTCxDQUExQjs7SUFJQSxNQUFNRSxXQUFXLGdCQUFHO01BQUcsU0FBUyxFQUFDO0lBQWIsR0FBeUIsSUFBQUYsbUJBQUEsRUFDekMsbURBQ0EsaURBREEsR0FFQSxzREFGQSxHQUdBLGlDQUp5QyxDQUF6QixDQUFwQjs7SUFPQSxJQUFJRyxPQUFKOztJQUNBLElBQUlDLGdDQUFBLENBQWdCQyxHQUFoQixHQUFzQkMsbUJBQXRCLEVBQUosRUFBaUQ7TUFDN0NILE9BQU8sZ0JBQUcsMENBQ0pGLGlCQURJLGVBRU4sd0NBQUssSUFBQUQsbUJBQUEsRUFDRCxtRUFEQyxDQUFMLENBRk0sRUFLSkUsV0FMSSxlQU1OLDZCQUFDLHNCQUFEO1FBQ0ksYUFBYSxFQUFFLElBQUFGLG1CQUFBLEVBQUcsSUFBSCxDQURuQjtRQUVJLG9CQUFvQixFQUFFLEtBQUtPLFNBRi9CO1FBR0ksWUFBWSxFQUFFLElBQUFQLG1CQUFBLEVBQUcsZ0JBQUgsQ0FIbEI7UUFJSSxRQUFRLEVBQUUsS0FBS1E7TUFKbkIsRUFOTSxDQUFWO0lBYUgsQ0FkRCxNQWNPO01BQ0hMLE9BQU8sZ0JBQUcsMENBQ0pGLGlCQURJLEVBRUpDLFdBRkksZUFHTiw2QkFBQyxzQkFBRDtRQUNJLGFBQWEsRUFBRSxJQUFBRixtQkFBQSxFQUFHLHdCQUFILENBRG5CO1FBRUksb0JBQW9CLEVBQUUsS0FBS1MsWUFGL0I7UUFHSSxZQUFZLEVBQUUsSUFBQVQsbUJBQUEsRUFBRyxnQkFBSCxDQUhsQjtRQUlJLFFBQVEsRUFBRSxLQUFLUTtNQUpuQixFQUhNLENBQVY7SUFVSDs7SUFFRCxvQkFDSSw2QkFBQyxtQkFBRDtNQUFZLFNBQVMsRUFBQywwQkFBdEI7TUFDSSxVQUFVLEVBQUUsS0FBS25CLEtBQUwsQ0FBV0MsVUFEM0I7TUFFSSxLQUFLLEVBQUVTO0lBRlgsR0FJTUksT0FKTixDQURKO0VBUUg7O0FBcEU0RSJ9