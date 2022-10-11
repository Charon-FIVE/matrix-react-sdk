"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _DevicesPanelEntry = _interopRequireDefault(require("./DevicesPanelEntry"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _deleteDevices = require("./devices/deleteDevices");

/*
Copyright 2016 - 2021 The Matrix.org Foundation C.I.C.

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
class DevicesPanel extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "onDeviceSelectionToggled", device => {
      if (this.unmounted) {
        return;
      }

      const deviceId = device.device_id;
      this.setState((state, props) => {
        // Make a copy of the selected devices, then add or remove the device
        const selectedDevices = state.selectedDevices.slice();
        const i = selectedDevices.indexOf(deviceId);

        if (i === -1) {
          selectedDevices.push(deviceId);
        } else {
          selectedDevices.splice(i, 1);
        }

        return {
          selectedDevices
        };
      });
    });
    (0, _defineProperty2.default)(this, "selectAll", devices => {
      this.setState((state, props) => {
        const selectedDevices = state.selectedDevices.slice();

        for (const device of devices) {
          const deviceId = device.device_id;

          if (!selectedDevices.includes(deviceId)) {
            selectedDevices.push(deviceId);
          }
        }

        return {
          selectedDevices
        };
      });
    });
    (0, _defineProperty2.default)(this, "deselectAll", devices => {
      this.setState((state, props) => {
        const selectedDevices = state.selectedDevices.slice();

        for (const device of devices) {
          const deviceId = device.device_id;
          const i = selectedDevices.indexOf(deviceId);

          if (i !== -1) {
            selectedDevices.splice(i, 1);
          }
        }

        return {
          selectedDevices
        };
      });
    });
    (0, _defineProperty2.default)(this, "onDeleteClick", async () => {
      if (this.state.selectedDevices.length === 0) {
        return;
      }

      this.setState({
        deleting: true
      });

      try {
        await (0, _deleteDevices.deleteDevicesWithInteractiveAuth)(_MatrixClientPeg.MatrixClientPeg.get(), this.state.selectedDevices, success => {
          if (success) {
            // Reset selection to [], update device list
            this.setState({
              selectedDevices: []
            });
            this.loadDevices();
          }

          this.setState({
            deleting: false
          });
        });
      } catch (error) {
        _logger.logger.error("Error deleting sessions", error);

        this.setState({
          deleting: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "renderDevice", device => {
      const myDeviceId = _MatrixClientPeg.MatrixClientPeg.get().getDeviceId();

      const myDevice = this.state.devices.find(device => device.device_id === myDeviceId);
      const isOwnDevice = device.device_id === myDeviceId; // If our own device is unverified, it can't verify other
      // devices, it can only request verification for itself

      const canBeVerified = myDevice && this.isDeviceVerified(myDevice) || isOwnDevice;
      return /*#__PURE__*/_react.default.createElement(_DevicesPanelEntry.default, {
        key: device.device_id,
        device: device,
        selected: this.state.selectedDevices.includes(device.device_id),
        isOwnDevice: isOwnDevice,
        verified: this.isDeviceVerified(device),
        canBeVerified: canBeVerified,
        onDeviceChange: this.loadDevices,
        onDeviceToggled: this.onDeviceSelectionToggled
      });
    });
    this.state = {
      devices: [],
      selectedDevices: []
    };
    this.loadDevices = this.loadDevices.bind(this);
  }

  componentDidMount() {
    this.loadDevices();
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  loadDevices() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    cli.getDevices().then(resp => {
      if (this.unmounted) {
        return;
      }

      const crossSigningInfo = cli.getStoredCrossSigningForUser(cli.getUserId());
      this.setState((state, props) => {
        const deviceIds = resp.devices.map(device => device.device_id);
        const selectedDevices = state.selectedDevices.filter(deviceId => deviceIds.includes(deviceId));
        return {
          devices: resp.devices || [],
          selectedDevices,
          crossSigningInfo: crossSigningInfo
        };
      });
    }, error => {
      if (this.unmounted) {
        return;
      }

      let errtxt;

      if (error.httpStatus == 404) {
        // 404 probably means the HS doesn't yet support the API.
        errtxt = (0, _languageHandler._t)("Your homeserver does not support device management.");
      } else {
        _logger.logger.error("Error loading sessions:", error);

        errtxt = (0, _languageHandler._t)("Unable to load device list");
      }

      this.setState({
        deviceLoadError: errtxt
      });
    });
  }
  /*
   * compare two devices, sorting from most-recently-seen to least-recently-seen
   * (and then, for stability, by device id)
   */


  deviceCompare(a, b) {
    // return < 0 if a comes before b, > 0 if a comes after b.
    const lastSeenDelta = (b.last_seen_ts || 0) - (a.last_seen_ts || 0);

    if (lastSeenDelta !== 0) {
      return lastSeenDelta;
    }

    const idA = a.device_id;
    const idB = b.device_id;
    return idA < idB ? -1 : idA > idB ? 1 : 0;
  }

  isDeviceVerified(device) {
    try {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const deviceInfo = cli.getStoredDevice(cli.getUserId(), device.device_id);
      return this.state.crossSigningInfo.checkDeviceTrust(this.state.crossSigningInfo, deviceInfo, false, true).isCrossSigningVerified();
    } catch (e) {
      console.error("Error getting device cross-signing info", e);
      return null;
    }
  }

  render() {
    const loadError = /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)(this.props.className, "error")
    }, this.state.deviceLoadError);

    if (this.state.deviceLoadError !== undefined) {
      return loadError;
    }

    const devices = this.state.devices;

    if (devices === undefined) {
      // still loading
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    const myDeviceId = _MatrixClientPeg.MatrixClientPeg.get().getDeviceId();

    const myDevice = devices.find(device => device.device_id === myDeviceId);

    if (!myDevice) {
      return loadError;
    }

    const otherDevices = devices.filter(device => device.device_id !== myDeviceId);
    otherDevices.sort(this.deviceCompare);
    const verifiedDevices = [];
    const unverifiedDevices = [];
    const nonCryptoDevices = [];

    for (const device of otherDevices) {
      const verified = this.isDeviceVerified(device);

      if (verified === true) {
        verifiedDevices.push(device);
      } else if (verified === false) {
        unverifiedDevices.push(device);
      } else {
        nonCryptoDevices.push(device);
      }
    }

    const section = (trustIcon, title, deviceList) => {
      if (deviceList.length === 0) {
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
      }

      let selectButton;

      if (deviceList.length > 1) {
        const anySelected = deviceList.some(device => this.state.selectedDevices.includes(device.device_id));
        const buttonAction = anySelected ? () => {
          this.deselectAll(deviceList);
        } : () => {
          this.selectAll(deviceList);
        };
        const buttonText = anySelected ? (0, _languageHandler._t)("Deselect all") : (0, _languageHandler._t)("Select all");
        selectButton = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_DevicesPanel_header_button"
        }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_DevicesPanel_selectButton",
          kind: "secondary",
          onClick: buttonAction
        }, buttonText));
      }

      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("hr", null), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevicesPanel_header"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevicesPanel_header_trust"
      }, trustIcon), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevicesPanel_header_title"
      }, title), selectButton), deviceList.map(this.renderDevice));
    };

    const verifiedDevicesSection = section( /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_DevicesPanel_header_icon mx_E2EIcon mx_E2EIcon_verified"
    }), (0, _languageHandler._t)("Verified devices"), verifiedDevices);
    const unverifiedDevicesSection = section( /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_DevicesPanel_header_icon mx_E2EIcon mx_E2EIcon_warning"
    }), (0, _languageHandler._t)("Unverified devices"), unverifiedDevices);
    const nonCryptoDevicesSection = section( /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null), (0, _languageHandler._t)("Devices without encryption support"), nonCryptoDevices);
    const deleteButton = this.state.deleting ? /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      w: 22,
      h: 22
    }) : /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_DevicesPanel_deleteButton",
      onClick: this.onDeleteClick,
      kind: "danger_outline",
      disabled: this.state.selectedDevices.length === 0,
      "data-testid": "sign-out-devices-btn"
    }, (0, _languageHandler._t)("Sign out %(count)s selected devices", {
      count: this.state.selectedDevices.length
    }));
    const otherDevicesSection = otherDevices.length > 0 ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, verifiedDevicesSection, unverifiedDevicesSection, nonCryptoDevicesSection, deleteButton) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("hr", null), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DevicesPanel_noOtherDevices"
    }, (0, _languageHandler._t)("You aren't signed into any other devices.")));
    const classes = (0, _classnames.default)(this.props.className, "mx_DevicesPanel");
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DevicesPanel_header"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DevicesPanel_header_title"
    }, (0, _languageHandler._t)("This device"))), this.renderDevice(myDevice), otherDevicesSection);
  }

}

exports.default = DevicesPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXZpY2VzUGFuZWwiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJkZXZpY2UiLCJ1bm1vdW50ZWQiLCJkZXZpY2VJZCIsImRldmljZV9pZCIsInNldFN0YXRlIiwic3RhdGUiLCJzZWxlY3RlZERldmljZXMiLCJzbGljZSIsImkiLCJpbmRleE9mIiwicHVzaCIsInNwbGljZSIsImRldmljZXMiLCJpbmNsdWRlcyIsImxlbmd0aCIsImRlbGV0aW5nIiwiZGVsZXRlRGV2aWNlc1dpdGhJbnRlcmFjdGl2ZUF1dGgiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJzdWNjZXNzIiwibG9hZERldmljZXMiLCJlcnJvciIsImxvZ2dlciIsIm15RGV2aWNlSWQiLCJnZXREZXZpY2VJZCIsIm15RGV2aWNlIiwiZmluZCIsImlzT3duRGV2aWNlIiwiY2FuQmVWZXJpZmllZCIsImlzRGV2aWNlVmVyaWZpZWQiLCJvbkRldmljZVNlbGVjdGlvblRvZ2dsZWQiLCJiaW5kIiwiY29tcG9uZW50RGlkTW91bnQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImNsaSIsImdldERldmljZXMiLCJ0aGVuIiwicmVzcCIsImNyb3NzU2lnbmluZ0luZm8iLCJnZXRTdG9yZWRDcm9zc1NpZ25pbmdGb3JVc2VyIiwiZ2V0VXNlcklkIiwiZGV2aWNlSWRzIiwibWFwIiwiZmlsdGVyIiwiZXJydHh0IiwiaHR0cFN0YXR1cyIsIl90IiwiZGV2aWNlTG9hZEVycm9yIiwiZGV2aWNlQ29tcGFyZSIsImEiLCJiIiwibGFzdFNlZW5EZWx0YSIsImxhc3Rfc2Vlbl90cyIsImlkQSIsImlkQiIsImRldmljZUluZm8iLCJnZXRTdG9yZWREZXZpY2UiLCJjaGVja0RldmljZVRydXN0IiwiaXNDcm9zc1NpZ25pbmdWZXJpZmllZCIsImUiLCJjb25zb2xlIiwicmVuZGVyIiwibG9hZEVycm9yIiwiY2xhc3NOYW1lcyIsImNsYXNzTmFtZSIsInVuZGVmaW5lZCIsIm90aGVyRGV2aWNlcyIsInNvcnQiLCJ2ZXJpZmllZERldmljZXMiLCJ1bnZlcmlmaWVkRGV2aWNlcyIsIm5vbkNyeXB0b0RldmljZXMiLCJ2ZXJpZmllZCIsInNlY3Rpb24iLCJ0cnVzdEljb24iLCJ0aXRsZSIsImRldmljZUxpc3QiLCJzZWxlY3RCdXR0b24iLCJhbnlTZWxlY3RlZCIsInNvbWUiLCJidXR0b25BY3Rpb24iLCJkZXNlbGVjdEFsbCIsInNlbGVjdEFsbCIsImJ1dHRvblRleHQiLCJyZW5kZXJEZXZpY2UiLCJ2ZXJpZmllZERldmljZXNTZWN0aW9uIiwidW52ZXJpZmllZERldmljZXNTZWN0aW9uIiwibm9uQ3J5cHRvRGV2aWNlc1NlY3Rpb24iLCJkZWxldGVCdXR0b24iLCJvbkRlbGV0ZUNsaWNrIiwiY291bnQiLCJvdGhlckRldmljZXNTZWN0aW9uIiwiY2xhc3NlcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0RldmljZXNQYW5lbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IElNeURldmljZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IENyb3NzU2lnbmluZ0luZm8gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL0Nyb3NzU2lnbmluZ1wiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IERldmljZXNQYW5lbEVudHJ5IGZyb20gXCIuL0RldmljZXNQYW5lbEVudHJ5XCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IGRlbGV0ZURldmljZXNXaXRoSW50ZXJhY3RpdmVBdXRoIH0gZnJvbSAnLi9kZXZpY2VzL2RlbGV0ZURldmljZXMnO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGRldmljZXM6IElNeURldmljZVtdO1xuICAgIGNyb3NzU2lnbmluZ0luZm8/OiBDcm9zc1NpZ25pbmdJbmZvO1xuICAgIGRldmljZUxvYWRFcnJvcj86IHN0cmluZztcbiAgICBzZWxlY3RlZERldmljZXM6IHN0cmluZ1tdO1xuICAgIGRlbGV0aW5nPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGV2aWNlc1BhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSB1bm1vdW50ZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGV2aWNlczogW10sXG4gICAgICAgICAgICBzZWxlY3RlZERldmljZXM6IFtdLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxvYWREZXZpY2VzID0gdGhpcy5sb2FkRGV2aWNlcy5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5sb2FkRGV2aWNlcygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZERldmljZXMoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY2xpLmdldERldmljZXMoKS50aGVuKFxuICAgICAgICAgICAgKHJlc3ApID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjcm9zc1NpZ25pbmdJbmZvID0gY2xpLmdldFN0b3JlZENyb3NzU2lnbmluZ0ZvclVzZXIoY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKChzdGF0ZSwgcHJvcHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlSWRzID0gcmVzcC5kZXZpY2VzLm1hcCgoZGV2aWNlKSA9PiBkZXZpY2UuZGV2aWNlX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWREZXZpY2VzID0gc3RhdGUuc2VsZWN0ZWREZXZpY2VzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIChkZXZpY2VJZCkgPT4gZGV2aWNlSWRzLmluY2x1ZGVzKGRldmljZUlkKSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZXM6IHJlc3AuZGV2aWNlcyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRGV2aWNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyb3NzU2lnbmluZ0luZm86IGNyb3NzU2lnbmluZ0luZm8sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIGxldCBlcnJ0eHQ7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLmh0dHBTdGF0dXMgPT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIDQwNCBwcm9iYWJseSBtZWFucyB0aGUgSFMgZG9lc24ndCB5ZXQgc3VwcG9ydCB0aGUgQVBJLlxuICAgICAgICAgICAgICAgICAgICBlcnJ0eHQgPSBfdChcIllvdXIgaG9tZXNlcnZlciBkb2VzIG5vdCBzdXBwb3J0IGRldmljZSBtYW5hZ2VtZW50LlwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciBsb2FkaW5nIHNlc3Npb25zOlwiLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGVycnR4dCA9IF90KFwiVW5hYmxlIHRvIGxvYWQgZGV2aWNlIGxpc3RcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkZXZpY2VMb2FkRXJyb3I6IGVycnR4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBjb21wYXJlIHR3byBkZXZpY2VzLCBzb3J0aW5nIGZyb20gbW9zdC1yZWNlbnRseS1zZWVuIHRvIGxlYXN0LXJlY2VudGx5LXNlZW5cbiAgICAgKiAoYW5kIHRoZW4sIGZvciBzdGFiaWxpdHksIGJ5IGRldmljZSBpZClcbiAgICAgKi9cbiAgICBwcml2YXRlIGRldmljZUNvbXBhcmUoYTogSU15RGV2aWNlLCBiOiBJTXlEZXZpY2UpOiBudW1iZXIge1xuICAgICAgICAvLyByZXR1cm4gPCAwIGlmIGEgY29tZXMgYmVmb3JlIGIsID4gMCBpZiBhIGNvbWVzIGFmdGVyIGIuXG4gICAgICAgIGNvbnN0IGxhc3RTZWVuRGVsdGEgPVxuICAgICAgICAgICAgICAoYi5sYXN0X3NlZW5fdHMgfHwgMCkgLSAoYS5sYXN0X3NlZW5fdHMgfHwgMCk7XG5cbiAgICAgICAgaWYgKGxhc3RTZWVuRGVsdGEgIT09IDApIHsgcmV0dXJuIGxhc3RTZWVuRGVsdGE7IH1cblxuICAgICAgICBjb25zdCBpZEEgPSBhLmRldmljZV9pZDtcbiAgICAgICAgY29uc3QgaWRCID0gYi5kZXZpY2VfaWQ7XG4gICAgICAgIHJldHVybiAoaWRBIDwgaWRCKSA/IC0xIDogKGlkQSA+IGlkQikgPyAxIDogMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGV2aWNlVmVyaWZpZWQoZGV2aWNlOiBJTXlEZXZpY2UpOiBib29sZWFuIHwgbnVsbCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCBkZXZpY2VJbmZvID0gY2xpLmdldFN0b3JlZERldmljZShjbGkuZ2V0VXNlcklkKCksIGRldmljZS5kZXZpY2VfaWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuY3Jvc3NTaWduaW5nSW5mby5jaGVja0RldmljZVRydXN0KFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY3Jvc3NTaWduaW5nSW5mbyxcbiAgICAgICAgICAgICAgICBkZXZpY2VJbmZvLFxuICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICApLmlzQ3Jvc3NTaWduaW5nVmVyaWZpZWQoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGdldHRpbmcgZGV2aWNlIGNyb3NzLXNpZ25pbmcgaW5mb1wiLCBlKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRldmljZVNlbGVjdGlvblRvZ2dsZWQgPSAoZGV2aWNlOiBJTXlEZXZpY2UpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGNvbnN0IGRldmljZUlkID0gZGV2aWNlLmRldmljZV9pZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgoc3RhdGUsIHByb3BzKSA9PiB7XG4gICAgICAgICAgICAvLyBNYWtlIGEgY29weSBvZiB0aGUgc2VsZWN0ZWQgZGV2aWNlcywgdGhlbiBhZGQgb3IgcmVtb3ZlIHRoZSBkZXZpY2VcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkRGV2aWNlcyA9IHN0YXRlLnNlbGVjdGVkRGV2aWNlcy5zbGljZSgpO1xuXG4gICAgICAgICAgICBjb25zdCBpID0gc2VsZWN0ZWREZXZpY2VzLmluZGV4T2YoZGV2aWNlSWQpO1xuICAgICAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWREZXZpY2VzLnB1c2goZGV2aWNlSWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZERldmljZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4geyBzZWxlY3RlZERldmljZXMgfTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2VsZWN0QWxsID0gKGRldmljZXM6IElNeURldmljZVtdKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoKHN0YXRlLCBwcm9wcykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWREZXZpY2VzID0gc3RhdGUuc2VsZWN0ZWREZXZpY2VzLnNsaWNlKCk7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgZGV2aWNlIG9mIGRldmljZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VJZCA9IGRldmljZS5kZXZpY2VfaWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxlY3RlZERldmljZXMuaW5jbHVkZXMoZGV2aWNlSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRGV2aWNlcy5wdXNoKGRldmljZUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7IHNlbGVjdGVkRGV2aWNlcyB9O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBkZXNlbGVjdEFsbCA9IChkZXZpY2VzOiBJTXlEZXZpY2VbXSk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKChzdGF0ZSwgcHJvcHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkRGV2aWNlcyA9IHN0YXRlLnNlbGVjdGVkRGV2aWNlcy5zbGljZSgpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRldmljZSBvZiBkZXZpY2VzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlSWQgPSBkZXZpY2UuZGV2aWNlX2lkO1xuICAgICAgICAgICAgICAgIGNvbnN0IGkgPSBzZWxlY3RlZERldmljZXMuaW5kZXhPZihkZXZpY2VJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRGV2aWNlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4geyBzZWxlY3RlZERldmljZXMgfTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25EZWxldGVDbGljayA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWREZXZpY2VzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRlbGV0aW5nOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZGVsZXRlRGV2aWNlc1dpdGhJbnRlcmFjdGl2ZUF1dGgoXG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWREZXZpY2VzLFxuICAgICAgICAgICAgICAgIChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBzZWxlY3Rpb24gdG8gW10sIHVwZGF0ZSBkZXZpY2UgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWREZXZpY2VzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkRGV2aWNlcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIGRlbGV0aW5nIHNlc3Npb25zXCIsIGVycm9yKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGRlbGV0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyRGV2aWNlID0gKGRldmljZTogSU15RGV2aWNlKTogSlNYLkVsZW1lbnQgPT4ge1xuICAgICAgICBjb25zdCBteURldmljZUlkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUlkKCk7XG4gICAgICAgIGNvbnN0IG15RGV2aWNlID0gdGhpcy5zdGF0ZS5kZXZpY2VzLmZpbmQoKGRldmljZSkgPT4gKGRldmljZS5kZXZpY2VfaWQgPT09IG15RGV2aWNlSWQpKTtcblxuICAgICAgICBjb25zdCBpc093bkRldmljZSA9IGRldmljZS5kZXZpY2VfaWQgPT09IG15RGV2aWNlSWQ7XG5cbiAgICAgICAgLy8gSWYgb3VyIG93biBkZXZpY2UgaXMgdW52ZXJpZmllZCwgaXQgY2FuJ3QgdmVyaWZ5IG90aGVyXG4gICAgICAgIC8vIGRldmljZXMsIGl0IGNhbiBvbmx5IHJlcXVlc3QgdmVyaWZpY2F0aW9uIGZvciBpdHNlbGZcbiAgICAgICAgY29uc3QgY2FuQmVWZXJpZmllZCA9IChteURldmljZSAmJiB0aGlzLmlzRGV2aWNlVmVyaWZpZWQobXlEZXZpY2UpKSB8fCBpc093bkRldmljZTtcblxuICAgICAgICByZXR1cm4gPERldmljZXNQYW5lbEVudHJ5XG4gICAgICAgICAgICBrZXk9e2RldmljZS5kZXZpY2VfaWR9XG4gICAgICAgICAgICBkZXZpY2U9e2RldmljZX1cbiAgICAgICAgICAgIHNlbGVjdGVkPXt0aGlzLnN0YXRlLnNlbGVjdGVkRGV2aWNlcy5pbmNsdWRlcyhkZXZpY2UuZGV2aWNlX2lkKX1cbiAgICAgICAgICAgIGlzT3duRGV2aWNlPXtpc093bkRldmljZX1cbiAgICAgICAgICAgIHZlcmlmaWVkPXt0aGlzLmlzRGV2aWNlVmVyaWZpZWQoZGV2aWNlKX1cbiAgICAgICAgICAgIGNhbkJlVmVyaWZpZWQ9e2NhbkJlVmVyaWZpZWR9XG4gICAgICAgICAgICBvbkRldmljZUNoYW5nZT17dGhpcy5sb2FkRGV2aWNlc31cbiAgICAgICAgICAgIG9uRGV2aWNlVG9nZ2xlZD17dGhpcy5vbkRldmljZVNlbGVjdGlvblRvZ2dsZWR9XG4gICAgICAgIC8+O1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgbG9hZEVycm9yID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXModGhpcy5wcm9wcy5jbGFzc05hbWUsIFwiZXJyb3JcIil9PlxuICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5kZXZpY2VMb2FkRXJyb3IgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGV2aWNlTG9hZEVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2FkRXJyb3I7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZXZpY2VzID0gdGhpcy5zdGF0ZS5kZXZpY2VzO1xuICAgICAgICBpZiAoZGV2aWNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBzdGlsbCBsb2FkaW5nXG4gICAgICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBteURldmljZUlkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUlkKCk7XG4gICAgICAgIGNvbnN0IG15RGV2aWNlID0gZGV2aWNlcy5maW5kKChkZXZpY2UpID0+IChkZXZpY2UuZGV2aWNlX2lkID09PSBteURldmljZUlkKSk7XG5cbiAgICAgICAgaWYgKCFteURldmljZSkge1xuICAgICAgICAgICAgcmV0dXJuIGxvYWRFcnJvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG90aGVyRGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKChkZXZpY2UpID0+IChkZXZpY2UuZGV2aWNlX2lkICE9PSBteURldmljZUlkKSk7XG4gICAgICAgIG90aGVyRGV2aWNlcy5zb3J0KHRoaXMuZGV2aWNlQ29tcGFyZSk7XG5cbiAgICAgICAgY29uc3QgdmVyaWZpZWREZXZpY2VzID0gW107XG4gICAgICAgIGNvbnN0IHVudmVyaWZpZWREZXZpY2VzID0gW107XG4gICAgICAgIGNvbnN0IG5vbkNyeXB0b0RldmljZXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBkZXZpY2Ugb2Ygb3RoZXJEZXZpY2VzKSB7XG4gICAgICAgICAgICBjb25zdCB2ZXJpZmllZCA9IHRoaXMuaXNEZXZpY2VWZXJpZmllZChkZXZpY2UpO1xuICAgICAgICAgICAgaWYgKHZlcmlmaWVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmVyaWZpZWREZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmVyaWZpZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdW52ZXJpZmllZERldmljZXMucHVzaChkZXZpY2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub25DcnlwdG9EZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSAodHJ1c3RJY29uOiBKU1guRWxlbWVudCwgdGl0bGU6IHN0cmluZywgZGV2aWNlTGlzdDogSU15RGV2aWNlW10pOiBKU1guRWxlbWVudCA9PiB7XG4gICAgICAgICAgICBpZiAoZGV2aWNlTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50IC8+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc2VsZWN0QnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgICAgIGlmIChkZXZpY2VMaXN0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhbnlTZWxlY3RlZCA9IGRldmljZUxpc3Quc29tZSgoZGV2aWNlKSA9PiB0aGlzLnN0YXRlLnNlbGVjdGVkRGV2aWNlcy5pbmNsdWRlcyhkZXZpY2UuZGV2aWNlX2lkKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uQWN0aW9uID0gYW55U2VsZWN0ZWQgP1xuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IHRoaXMuZGVzZWxlY3RBbGwoZGV2aWNlTGlzdCk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IHRoaXMuc2VsZWN0QWxsKGRldmljZUxpc3QpOyB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRleHQgPSBhbnlTZWxlY3RlZCA/IF90KFwiRGVzZWxlY3QgYWxsXCIpIDogX3QoXCJTZWxlY3QgYWxsXCIpO1xuICAgICAgICAgICAgICAgIHNlbGVjdEJ1dHRvbiA9IDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2aWNlc1BhbmVsX2hlYWRlcl9idXR0b25cIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RldmljZXNQYW5lbF9zZWxlY3RCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInNlY29uZGFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtidXR0b25BY3Rpb259XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYnV0dG9uVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPGhyIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZpY2VzUGFuZWxfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2aWNlc1BhbmVsX2hlYWRlcl90cnVzdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0cnVzdEljb24gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZpY2VzUGFuZWxfaGVhZGVyX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRpdGxlIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgc2VsZWN0QnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IGRldmljZUxpc3QubWFwKHRoaXMucmVuZGVyRGV2aWNlKSB9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB2ZXJpZmllZERldmljZXNTZWN0aW9uID0gc2VjdGlvbihcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0RldmljZXNQYW5lbF9oZWFkZXJfaWNvbiBteF9FMkVJY29uIG14X0UyRUljb25fdmVyaWZpZWRcIiAvPixcbiAgICAgICAgICAgIF90KFwiVmVyaWZpZWQgZGV2aWNlc1wiKSxcbiAgICAgICAgICAgIHZlcmlmaWVkRGV2aWNlcyxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB1bnZlcmlmaWVkRGV2aWNlc1NlY3Rpb24gPSBzZWN0aW9uKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRGV2aWNlc1BhbmVsX2hlYWRlcl9pY29uIG14X0UyRUljb24gbXhfRTJFSWNvbl93YXJuaW5nXCIgLz4sXG4gICAgICAgICAgICBfdChcIlVudmVyaWZpZWQgZGV2aWNlc1wiKSxcbiAgICAgICAgICAgIHVudmVyaWZpZWREZXZpY2VzLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IG5vbkNyeXB0b0RldmljZXNTZWN0aW9uID0gc2VjdGlvbihcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudCAvPixcbiAgICAgICAgICAgIF90KFwiRGV2aWNlcyB3aXRob3V0IGVuY3J5cHRpb24gc3VwcG9ydFwiKSxcbiAgICAgICAgICAgIG5vbkNyeXB0b0RldmljZXMsXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gdGhpcy5zdGF0ZS5kZWxldGluZyA/XG4gICAgICAgICAgICA8U3Bpbm5lciB3PXsyMn0gaD17MjJ9IC8+IDpcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRGV2aWNlc1BhbmVsX2RlbGV0ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkRlbGV0ZUNsaWNrfVxuICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfb3V0bGluZVwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWREZXZpY2VzLmxlbmd0aCA9PT0gMH1cbiAgICAgICAgICAgICAgICBkYXRhLXRlc3RpZD0nc2lnbi1vdXQtZGV2aWNlcy1idG4nXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIlNpZ24gb3V0ICUoY291bnQpcyBzZWxlY3RlZCBkZXZpY2VzXCIsIHsgY291bnQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWREZXZpY2VzLmxlbmd0aCB9KSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuXG4gICAgICAgIGNvbnN0IG90aGVyRGV2aWNlc1NlY3Rpb24gPSAob3RoZXJEZXZpY2VzLmxlbmd0aCA+IDApID9cbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICB7IHZlcmlmaWVkRGV2aWNlc1NlY3Rpb24gfVxuICAgICAgICAgICAgICAgIHsgdW52ZXJpZmllZERldmljZXNTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICB7IG5vbkNyeXB0b0RldmljZXNTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICB7IGRlbGV0ZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PiA6XG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPGhyIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZpY2VzUGFuZWxfbm9PdGhlckRldmljZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdSBhcmVuJ3Qgc2lnbmVkIGludG8gYW55IG90aGVyIGRldmljZXMuXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHRoaXMucHJvcHMuY2xhc3NOYW1lLCBcIm14X0RldmljZXNQYW5lbFwiKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldmljZXNQYW5lbF9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZpY2VzUGFuZWxfaGVhZGVyX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiVGhpcyBkZXZpY2VcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyRGV2aWNlKG15RGV2aWNlKSB9XG4gICAgICAgICAgICAgICAgeyBvdGhlckRldmljZXNTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTJCZSxNQUFNQSxZQUFOLFNBQTJCQyxjQUFBLENBQU1DLFNBQWpDLENBQTJEO0VBR3RFQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1QixpREFGUCxLQUVPO0lBQUEsZ0VBbUZTQyxNQUFELElBQTZCO01BQzVELElBQUksS0FBS0MsU0FBVCxFQUFvQjtRQUFFO01BQVM7O01BRS9CLE1BQU1DLFFBQVEsR0FBR0YsTUFBTSxDQUFDRyxTQUF4QjtNQUNBLEtBQUtDLFFBQUwsQ0FBYyxDQUFDQyxLQUFELEVBQVFOLEtBQVIsS0FBa0I7UUFDNUI7UUFDQSxNQUFNTyxlQUFlLEdBQUdELEtBQUssQ0FBQ0MsZUFBTixDQUFzQkMsS0FBdEIsRUFBeEI7UUFFQSxNQUFNQyxDQUFDLEdBQUdGLGVBQWUs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