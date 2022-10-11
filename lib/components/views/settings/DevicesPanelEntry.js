"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SetupEncryptionDialog = _interopRequireDefault(require("../dialogs/security/SetupEncryptionDialog"));

var _VerificationRequestDialog = _interopRequireDefault(require("../../views/dialogs/VerificationRequestDialog"));

var _LogoutDialog = _interopRequireDefault(require("../dialogs/LogoutDialog"));

var _DeviceTile = _interopRequireDefault(require("./devices/DeviceTile"));

var _SelectableDeviceTile = _interopRequireDefault(require("./devices/SelectableDeviceTile"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class DevicesPanelEntry extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onDeviceToggled", () => {
      this.props.onDeviceToggled(this.props.device);
    });
    (0, _defineProperty2.default)(this, "onRename", () => {
      this.setState({
        renaming: true
      });
    });
    (0, _defineProperty2.default)(this, "onChangeDisplayName", ev => {
      this.setState({
        displayName: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onRenameSubmit", async () => {
      this.setState({
        renaming: false
      });
      await _MatrixClientPeg.MatrixClientPeg.get().setDeviceDetails(this.props.device.device_id, {
        display_name: this.state.displayName
      }).catch(e => {
        _logger.logger.error("Error setting session display name", e);

        throw new Error((0, _languageHandler._t)("Failed to set display name"));
      });
      this.props.onDeviceChange();
    });
    (0, _defineProperty2.default)(this, "onRenameCancel", () => {
      this.setState({
        renaming: false
      });
    });
    (0, _defineProperty2.default)(this, "onOwnDeviceSignOut", () => {
      _Modal.default.createDialog(_LogoutDialog.default,
      /* props= */
      {},
      /* className= */
      null,
      /* isPriority= */
      false,
      /* isStatic= */
      true);
    });
    (0, _defineProperty2.default)(this, "verify", async () => {
      if (this.props.isOwnDevice) {
        _Modal.default.createDialog(_SetupEncryptionDialog.default, {
          onFinished: this.props.onDeviceChange
        });
      } else {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const userId = cli.getUserId();
        const verificationRequestPromise = cli.requestVerification(userId, [this.props.device.device_id]);

        _Modal.default.createDialog(_VerificationRequestDialog.default, {
          verificationRequestPromise,
          member: cli.getUser(userId),
          onFinished: async () => {
            const request = await verificationRequestPromise;
            request.cancel();
            this.props.onDeviceChange();
          }
        });
      }
    });
    this.state = {
      renaming: false,
      displayName: props.device.display_name
    };
  }

  render() {
    let iconClass = '';
    let verifyButton;

    if (this.props.verified !== null) {
      iconClass = this.props.verified ? "mx_E2EIcon_verified" : "mx_E2EIcon_warning";

      if (!this.props.verified && this.props.canBeVerified) {
        verifyButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "primary",
          onClick: this.verify
        }, (0, _languageHandler._t)("Verify"));
      }
    }

    let signOutButton;

    if (this.props.isOwnDevice) {
      signOutButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "danger_outline",
        onClick: this.onOwnDeviceSignOut
      }, (0, _languageHandler._t)("Sign Out"));
    }

    const buttons = this.state.renaming ? /*#__PURE__*/_react.default.createElement("form", {
      className: "mx_DevicesPanel_renameForm",
      onSubmit: this.onRenameSubmit
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: (0, _languageHandler._t)("Display Name"),
      type: "text",
      value: this.state.displayName,
      autoComplete: "off",
      onChange: this.onChangeDisplayName,
      autoFocus: true
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onRenameSubmit,
      kind: "confirm_sm"
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onRenameCancel,
      kind: "cancel_sm"
    })) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, signOutButton, verifyButton, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary_outline",
      onClick: this.onRename
    }, (0, _languageHandler._t)("Rename")));

    const deviceWithVerification = _objectSpread(_objectSpread({}, this.props.device), {}, {
      isVerified: this.props.verified
    });

    if (this.props.isOwnDevice) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: (0, _classnames.default)("mx_DevicesPanel_device", "mx_DevicesPanel_myDevice")
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevicesPanel_deviceTrust"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_DevicesPanel_icon mx_E2EIcon " + iconClass
      })), /*#__PURE__*/_react.default.createElement(_DeviceTile.default, {
        device: deviceWithVerification
      }, buttons));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DevicesPanel_device"
    }, /*#__PURE__*/_react.default.createElement(_SelectableDeviceTile.default, {
      device: deviceWithVerification,
      onClick: this.onDeviceToggled,
      isSelected: this.props.selected
    }, buttons));
  }

}

exports.default = DevicesPanelEntry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXZpY2VzUGFuZWxFbnRyeSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIm9uRGV2aWNlVG9nZ2xlZCIsImRldmljZSIsInNldFN0YXRlIiwicmVuYW1pbmciLCJldiIsImRpc3BsYXlOYW1lIiwidGFyZ2V0IiwidmFsdWUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJzZXREZXZpY2VEZXRhaWxzIiwiZGV2aWNlX2lkIiwiZGlzcGxheV9uYW1lIiwic3RhdGUiLCJjYXRjaCIsImUiLCJsb2dnZXIiLCJlcnJvciIsIkVycm9yIiwiX3QiLCJvbkRldmljZUNoYW5nZSIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiTG9nb3V0RGlhbG9nIiwiaXNPd25EZXZpY2UiLCJTZXR1cEVuY3J5cHRpb25EaWFsb2ciLCJvbkZpbmlzaGVkIiwiY2xpIiwidXNlcklkIiwiZ2V0VXNlcklkIiwidmVyaWZpY2F0aW9uUmVxdWVzdFByb21pc2UiLCJyZXF1ZXN0VmVyaWZpY2F0aW9uIiwiVmVyaWZpY2F0aW9uUmVxdWVzdERpYWxvZyIsIm1lbWJlciIsImdldFVzZXIiLCJyZXF1ZXN0IiwiY2FuY2VsIiwicmVuZGVyIiwiaWNvbkNsYXNzIiwidmVyaWZ5QnV0dG9uIiwidmVyaWZpZWQiLCJjYW5CZVZlcmlmaWVkIiwidmVyaWZ5Iiwic2lnbk91dEJ1dHRvbiIsIm9uT3duRGV2aWNlU2lnbk91dCIsImJ1dHRvbnMiLCJvblJlbmFtZVN1Ym1pdCIsIm9uQ2hhbmdlRGlzcGxheU5hbWUiLCJvblJlbmFtZUNhbmNlbCIsIm9uUmVuYW1lIiwiZGV2aWNlV2l0aFZlcmlmaWNhdGlvbiIsImlzVmVyaWZpZWQiLCJjbGFzc05hbWVzIiwic2VsZWN0ZWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy9EZXZpY2VzUGFuZWxFbnRyeS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBJTXlEZXZpY2UgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFNldHVwRW5jcnlwdGlvbkRpYWxvZyBmcm9tICcuLi9kaWFsb2dzL3NlY3VyaXR5L1NldHVwRW5jcnlwdGlvbkRpYWxvZyc7XG5pbXBvcnQgVmVyaWZpY2F0aW9uUmVxdWVzdERpYWxvZyBmcm9tICcuLi8uLi92aWV3cy9kaWFsb2dzL1ZlcmlmaWNhdGlvblJlcXVlc3REaWFsb2cnO1xuaW1wb3J0IExvZ291dERpYWxvZyBmcm9tICcuLi9kaWFsb2dzL0xvZ291dERpYWxvZyc7XG5pbXBvcnQgRGV2aWNlVGlsZSBmcm9tICcuL2RldmljZXMvRGV2aWNlVGlsZSc7XG5pbXBvcnQgU2VsZWN0YWJsZURldmljZVRpbGUgZnJvbSAnLi9kZXZpY2VzL1NlbGVjdGFibGVEZXZpY2VUaWxlJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgZGV2aWNlOiBJTXlEZXZpY2U7XG4gICAgaXNPd25EZXZpY2U6IGJvb2xlYW47XG4gICAgdmVyaWZpZWQ6IGJvb2xlYW4gfCBudWxsO1xuICAgIGNhbkJlVmVyaWZpZWQ6IGJvb2xlYW47XG4gICAgb25EZXZpY2VDaGFuZ2U6ICgpID0+IHZvaWQ7XG4gICAgb25EZXZpY2VUb2dnbGVkOiAoZGV2aWNlOiBJTXlEZXZpY2UpID0+IHZvaWQ7XG4gICAgc2VsZWN0ZWQ6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHJlbmFtaW5nOiBib29sZWFuO1xuICAgIGRpc3BsYXlOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERldmljZXNQYW5lbEVudHJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICByZW5hbWluZzogZmFsc2UsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogcHJvcHMuZGV2aWNlLmRpc3BsYXlfbmFtZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGV2aWNlVG9nZ2xlZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkRldmljZVRvZ2dsZWQodGhpcy5wcm9wcy5kZXZpY2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVuYW1lID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVuYW1pbmc6IHRydWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DaGFuZ2VEaXNwbGF5TmFtZSA9IChldjogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlbmFtZVN1Ym1pdCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlbmFtaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldERldmljZURldGFpbHModGhpcy5wcm9wcy5kZXZpY2UuZGV2aWNlX2lkLCB7XG4gICAgICAgICAgICBkaXNwbGF5X25hbWU6IHRoaXMuc3RhdGUuZGlzcGxheU5hbWUsXG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciBzZXR0aW5nIHNlc3Npb24gZGlzcGxheSBuYW1lXCIsIGUpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKF90KFwiRmFpbGVkIHRvIHNldCBkaXNwbGF5IG5hbWVcIikpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkRldmljZUNoYW5nZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVuYW1lQ2FuY2VsID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVuYW1pbmc6IGZhbHNlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uT3duRGV2aWNlU2lnbk91dCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKExvZ291dERpYWxvZyxcbiAgICAgICAgICAgIC8qIHByb3BzPSAqL3t9LCAvKiBjbGFzc05hbWU9ICovbnVsbCxcbiAgICAgICAgICAgIC8qIGlzUHJpb3JpdHk9ICovZmFsc2UsIC8qIGlzU3RhdGljPSAqL3RydWUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZlcmlmeSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNPd25EZXZpY2UpIHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhTZXR1cEVuY3J5cHRpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiB0aGlzLnByb3BzLm9uRGV2aWNlQ2hhbmdlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCB1c2VySWQgPSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICBjb25zdCB2ZXJpZmljYXRpb25SZXF1ZXN0UHJvbWlzZSA9IGNsaS5yZXF1ZXN0VmVyaWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgIHVzZXJJZCxcbiAgICAgICAgICAgICAgICBbdGhpcy5wcm9wcy5kZXZpY2UuZGV2aWNlX2lkXSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coVmVyaWZpY2F0aW9uUmVxdWVzdERpYWxvZywge1xuICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvblJlcXVlc3RQcm9taXNlLFxuICAgICAgICAgICAgICAgIG1lbWJlcjogY2xpLmdldFVzZXIodXNlcklkKSxcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSBhd2FpdCB2ZXJpZmljYXRpb25SZXF1ZXN0UHJvbWlzZTtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRldmljZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgbGV0IGljb25DbGFzcyA9ICcnO1xuICAgICAgICBsZXQgdmVyaWZ5QnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMudmVyaWZpZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGljb25DbGFzcyA9IHRoaXMucHJvcHMudmVyaWZpZWQgPyBcIm14X0UyRUljb25fdmVyaWZpZWRcIiA6IFwibXhfRTJFSWNvbl93YXJuaW5nXCI7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMudmVyaWZpZWQgJiYgdGhpcy5wcm9wcy5jYW5CZVZlcmlmaWVkKSB7XG4gICAgICAgICAgICAgICAgdmVyaWZ5QnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLnZlcmlmeX0+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJWZXJpZnlcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2lnbk91dEJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzT3duRGV2aWNlKSB7XG4gICAgICAgICAgICBzaWduT3V0QnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImRhbmdlcl9vdXRsaW5lXCIgb25DbGljaz17dGhpcy5vbk93bkRldmljZVNpZ25PdXR9PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJTaWduIE91dFwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IHRoaXMuc3RhdGUucmVuYW1pbmcgP1xuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibXhfRGV2aWNlc1BhbmVsX3JlbmFtZUZvcm1cIiBvblN1Ym1pdD17dGhpcy5vblJlbmFtZVN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkRpc3BsYXkgTmFtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5kaXNwbGF5TmFtZX1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2VEaXNwbGF5TmFtZX1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uUmVuYW1lU3VibWl0fSBraW5kPVwiY29uZmlybV9zbVwiIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vblJlbmFtZUNhbmNlbH0ga2luZD1cImNhbmNlbF9zbVwiIC8+XG4gICAgICAgICAgICA8L2Zvcm0+IDpcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICB7IHNpZ25PdXRCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgdmVyaWZ5QnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeV9vdXRsaW5lXCIgb25DbGljaz17dGhpcy5vblJlbmFtZX0+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJSZW5hbWVcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuXG4gICAgICAgIGNvbnN0IGRldmljZVdpdGhWZXJpZmljYXRpb24gPSB7XG4gICAgICAgICAgICAuLi50aGlzLnByb3BzLmRldmljZSxcbiAgICAgICAgICAgIGlzVmVyaWZpZWQ6IHRoaXMucHJvcHMudmVyaWZpZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNPd25EZXZpY2UpIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0RldmljZXNQYW5lbF9kZXZpY2VcIiwgXCJteF9EZXZpY2VzUGFuZWxfbXlEZXZpY2VcIil9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2aWNlc1BhbmVsX2RldmljZVRydXN0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17XCJteF9EZXZpY2VzUGFuZWxfaWNvbiBteF9FMkVJY29uIFwiICsgaWNvbkNsYXNzfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxEZXZpY2VUaWxlIGRldmljZT17ZGV2aWNlV2l0aFZlcmlmaWNhdGlvbn0+XG4gICAgICAgICAgICAgICAgICAgIHsgYnV0dG9ucyB9XG4gICAgICAgICAgICAgICAgPC9EZXZpY2VUaWxlPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2aWNlc1BhbmVsX2RldmljZVwiPlxuICAgICAgICAgICAgICAgIDxTZWxlY3RhYmxlRGV2aWNlVGlsZSBkZXZpY2U9e2RldmljZVdpdGhWZXJpZmljYXRpb259IG9uQ2xpY2s9e3RoaXMub25EZXZpY2VUb2dnbGVkfSBpc1NlbGVjdGVkPXt0aGlzLnByb3BzLnNlbGVjdGVkfT5cbiAgICAgICAgICAgICAgICAgICAgeyBidXR0b25zIH1cbiAgICAgICAgICAgICAgICA8L1NlbGVjdGFibGVEZXZpY2VUaWxlPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBaUJlLE1BQU1BLGlCQUFOLFNBQWdDQyxjQUFBLENBQU1DLFNBQXRDLENBQWdFO0VBQzNFQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1Qix1REFRRCxNQUFZO01BQ2xDLEtBQUtBLEtBQUwsQ0FBV0MsZUFBWCxDQUEyQixLQUFLRCxLQUFMLENBQVdFLE1BQXRDO0lBQ0gsQ0FWMEI7SUFBQSxnREFZUixNQUFZO01BQzNCLEtBQUtDLFFBQUwsQ0FBYztRQUFFQyxRQUFRLEVBQUU7TUFBWixDQUFkO0lBQ0gsQ0FkMEI7SUFBQSwyREFnQklDLEVBQUQsSUFBbUQ7TUFDN0UsS0FBS0YsUUFBTCxDQUFjO1FBQ1ZHLFdBQVcsRUFBRUQsRUFBRSxDQUFDRSxNQUFILENBQVVDO01BRGIsQ0FBZDtJQUdILENBcEIwQjtJQUFBLHNEQXNCRixZQUFZO01BQ2pDLEtBQUtMLFFBQUwsQ0FBYztRQUFFQyxRQUFRLEVBQUU7TUFBWixDQUFkO01BQ0EsTUFBTUss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