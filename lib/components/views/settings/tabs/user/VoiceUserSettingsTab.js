"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _MediaDeviceHandler = _interopRequireWildcard(require("../../../../../MediaDeviceHandler"));

var _Field = _interopRequireDefault(require("../../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _SettingsFlag = _interopRequireDefault(require("../../../elements/SettingsFlag"));

var _ErrorDialog = _interopRequireDefault(require("../../../dialogs/ErrorDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 New Vector Ltd
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
const getDefaultDevice = devices => {
  // Note we're looking for a device with deviceId 'default' but adding a device
  // with deviceId == the empty string: this is because Chrome gives us a device
  // with deviceId 'default', so we're looking for this, not the one we are adding.
  if (!devices.some(i => i.deviceId === 'default')) {
    devices.unshift({
      deviceId: '',
      label: (0, _languageHandler._t)('Default Device')
    });
    return '';
  } else {
    return 'default';
  }
};

class VoiceUserSettingsTab extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "refreshMediaDevices", async stream => {
      this.setState({
        mediaDevices: await _MediaDeviceHandler.default.getDevices(),
        [_MediaDeviceHandler.MediaDeviceKindEnum.AudioOutput]: _MediaDeviceHandler.default.getAudioOutput(),
        [_MediaDeviceHandler.MediaDeviceKindEnum.AudioInput]: _MediaDeviceHandler.default.getAudioInput(),
        [_MediaDeviceHandler.MediaDeviceKindEnum.VideoInput]: _MediaDeviceHandler.default.getVideoInput()
      });

      if (stream) {
        // kill stream (after we've enumerated the devices, otherwise we'd get empty labels again)
        // so that we don't leave it lingering around with webcam enabled etc
        // as here we called gUM to ask user for permission to their device names only
        stream.getTracks().forEach(track => track.stop());
      }
    });
    (0, _defineProperty2.default)(this, "requestMediaPermissions", async () => {
      let constraints;
      let stream;
      let error;

      try {
        constraints = {
          video: true,
          audio: true
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // user likely doesn't have a webcam,
        // we should still allow to select a microphone
        if (err.name === "NotFoundError") {
          constraints = {
            audio: true
          };

          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
          } catch (err) {
            error = err;
          }
        } else {
          error = err;
        }
      }

      if (error) {
        _logger.logger.log("Failed to list userMedia devices", error);

        const brand = _SdkConfig.default.get().brand;

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('No media permissions'),
          description: (0, _languageHandler._t)('You may need to manually permit %(brand)s to access your microphone/webcam', {
            brand
          })
        });
      } else {
        this.refreshMediaDevices(stream);
      }
    });
    (0, _defineProperty2.default)(this, "setDevice", (deviceId, kind) => {
      _MediaDeviceHandler.default.instance.setDevice(deviceId, kind);

      this.setState({
        [kind]: deviceId
      });
    });
    (0, _defineProperty2.default)(this, "changeWebRtcMethod", p2p => {
      _MatrixClientPeg.MatrixClientPeg.get().setForceTURN(!p2p);
    });
    (0, _defineProperty2.default)(this, "changeFallbackICEServerAllowed", allow => {
      _MatrixClientPeg.MatrixClientPeg.get().setFallbackICEServerAllowed(allow);
    });
    this.state = {
      mediaDevices: null,
      [_MediaDeviceHandler.MediaDeviceKindEnum.AudioOutput]: null,
      [_MediaDeviceHandler.MediaDeviceKindEnum.AudioInput]: null,
      [_MediaDeviceHandler.MediaDeviceKindEnum.VideoInput]: null
    };
  }

  async componentDidMount() {
    const canSeeDeviceLabels = await _MediaDeviceHandler.default.hasAnyLabeledDevices();

    if (canSeeDeviceLabels) {
      this.refreshMediaDevices();
    }
  }

  renderDeviceOptions(devices, category) {
    return devices.map(d => {
      return /*#__PURE__*/_react.default.createElement("option", {
        key: `${category}-${d.deviceId}`,
        value: d.deviceId
      }, d.label);
    });
  }

  renderDropdown(kind, label) {
    const devices = this.state.mediaDevices[kind].slice(0);
    if (devices.length === 0) return null;
    const defaultDevice = getDefaultDevice(devices);
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      element: "select",
      label: label,
      value: this.state[kind] || defaultDevice,
      onChange: e => this.setDevice(e.target.value, kind)
    }, this.renderDeviceOptions(devices, kind));
  }

  render() {
    let requestButton = null;
    let speakerDropdown = null;
    let microphoneDropdown = null;
    let webcamDropdown = null;

    if (!this.state.mediaDevices) {
      requestButton = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VoiceUserSettingsTab_missingMediaPermissions"
      }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Missing media permissions, click the button below to request.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.requestMediaPermissions,
        kind: "primary"
      }, (0, _languageHandler._t)("Request media permissions")));
    } else if (this.state.mediaDevices) {
      speakerDropdown = this.renderDropdown(_MediaDeviceHandler.MediaDeviceKindEnum.AudioOutput, (0, _languageHandler._t)("Audio Output")) || /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('No Audio Outputs detected'));
      microphoneDropdown = this.renderDropdown(_MediaDeviceHandler.MediaDeviceKindEnum.AudioInput, (0, _languageHandler._t)("Microphone")) || /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('No Microphones detected'));
      webcamDropdown = this.renderDropdown(_MediaDeviceHandler.MediaDeviceKindEnum.VideoInput, (0, _languageHandler._t)("Camera")) || /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('No Webcams detected'));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_VoiceUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Voice & Video")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, requestButton, speakerDropdown, microphoneDropdown, webcamDropdown, /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
      name: "VideoView.flipVideoHorizontally",
      level: _SettingLevel.SettingLevel.ACCOUNT
    }), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
      name: "webRtcAllowPeerToPeer",
      level: _SettingLevel.SettingLevel.DEVICE,
      onChange: this.changeWebRtcMethod
    }), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
      name: "fallbackICEServerAllowed",
      level: _SettingLevel.SettingLevel.DEVICE,
      onChange: this.changeFallbackICEServerAllowed
    })));
  }

}

exports.default = VoiceUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXREZWZhdWx0RGV2aWNlIiwiZGV2aWNlcyIsInNvbWUiLCJpIiwiZGV2aWNlSWQiLCJ1bnNoaWZ0IiwibGFiZWwiLCJfdCIsIlZvaWNlVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RyZWFtIiwic2V0U3RhdGUiLCJtZWRpYURldmljZXMiLCJNZWRpYURldmljZUhhbmRsZXIiLCJnZXREZXZpY2VzIiwiTWVkaWFEZXZpY2VLaW5kRW51bSIsIkF1ZGlvT3V0cHV0IiwiZ2V0QXVkaW9PdXRwdXQiLCJBdWRpb0lucHV0IiwiZ2V0QXVkaW9JbnB1dCIsIlZpZGVvSW5wdXQiLCJnZXRWaWRlb0lucHV0IiwiZ2V0VHJhY2tzIiwiZm9yRWFjaCIsInRyYWNrIiwic3RvcCIsImNvbnN0cmFpbnRzIiwiZXJyb3IiLCJ2aWRlbyIsImF1ZGlvIiwibmF2aWdhdG9yIiwiZ2V0VXNlck1lZGlhIiwiZXJyIiwibmFtZSIsImxvZ2dlciIsImxvZyIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0IiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJyZWZyZXNoTWVkaWFEZXZpY2VzIiwia2luZCIsImluc3RhbmNlIiwic2V0RGV2aWNlIiwicDJwIiwiTWF0cml4Q2xpZW50UGVnIiwic2V0Rm9yY2VUVVJOIiwiYWxsb3ciLCJzZXRGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiY2FuU2VlRGV2aWNlTGFiZWxzIiwiaGFzQW55TGFiZWxlZERldmljZXMiLCJyZW5kZXJEZXZpY2VPcHRpb25zIiwiY2F0ZWdvcnkiLCJtYXAiLCJkIiwicmVuZGVyRHJvcGRvd24iLCJzbGljZSIsImxlbmd0aCIsImRlZmF1bHREZXZpY2UiLCJlIiwidGFyZ2V0IiwidmFsdWUiLCJyZW5kZXIiLCJyZXF1ZXN0QnV0dG9uIiwic3BlYWtlckRyb3Bkb3duIiwibWljcm9waG9uZURyb3Bkb3duIiwid2ViY2FtRHJvcGRvd24iLCJyZXF1ZXN0TWVkaWFQZXJtaXNzaW9ucyIsIlNldHRpbmdMZXZlbCIsIkFDQ09VTlQiLCJERVZJQ0UiLCJjaGFuZ2VXZWJSdGNNZXRob2QiLCJjaGFuZ2VGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy90YWJzL3VzZXIvVm9pY2VVc2VyU2V0dGluZ3NUYWIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IE1lZGlhRGV2aWNlSGFuZGxlciwgeyBJTWVkaWFEZXZpY2VzLCBNZWRpYURldmljZUtpbmRFbnVtIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01lZGlhRGV2aWNlSGFuZGxlclwiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBTZXR0aW5nc0ZsYWcgZnJvbSAnLi4vLi4vLi4vZWxlbWVudHMvU2V0dGluZ3NGbGFnJztcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tICcuLi8uLi8uLi9kaWFsb2dzL0Vycm9yRGlhbG9nJztcblxuY29uc3QgZ2V0RGVmYXVsdERldmljZSA9IChkZXZpY2VzOiBBcnJheTxQYXJ0aWFsPE1lZGlhRGV2aWNlSW5mbz4+KSA9PiB7XG4gICAgLy8gTm90ZSB3ZSdyZSBsb29raW5nIGZvciBhIGRldmljZSB3aXRoIGRldmljZUlkICdkZWZhdWx0JyBidXQgYWRkaW5nIGEgZGV2aWNlXG4gICAgLy8gd2l0aCBkZXZpY2VJZCA9PSB0aGUgZW1wdHkgc3RyaW5nOiB0aGlzIGlzIGJlY2F1c2UgQ2hyb21lIGdpdmVzIHVzIGEgZGV2aWNlXG4gICAgLy8gd2l0aCBkZXZpY2VJZCAnZGVmYXVsdCcsIHNvIHdlJ3JlIGxvb2tpbmcgZm9yIHRoaXMsIG5vdCB0aGUgb25lIHdlIGFyZSBhZGRpbmcuXG4gICAgaWYgKCFkZXZpY2VzLnNvbWUoKGkpID0+IGkuZGV2aWNlSWQgPT09ICdkZWZhdWx0JykpIHtcbiAgICAgICAgZGV2aWNlcy51bnNoaWZ0KHsgZGV2aWNlSWQ6ICcnLCBsYWJlbDogX3QoJ0RlZmF1bHQgRGV2aWNlJykgfSk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQnO1xuICAgIH1cbn07XG5cbmludGVyZmFjZSBJU3RhdGUgZXh0ZW5kcyBSZWNvcmQ8TWVkaWFEZXZpY2VLaW5kRW51bSwgc3RyaW5nPiB7XG4gICAgbWVkaWFEZXZpY2VzOiBJTWVkaWFEZXZpY2VzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWb2ljZVVzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx7fSwgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IHt9KSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbWVkaWFEZXZpY2VzOiBudWxsLFxuICAgICAgICAgICAgW01lZGlhRGV2aWNlS2luZEVudW0uQXVkaW9PdXRwdXRdOiBudWxsLFxuICAgICAgICAgICAgW01lZGlhRGV2aWNlS2luZEVudW0uQXVkaW9JbnB1dF06IG51bGwsXG4gICAgICAgICAgICBbTWVkaWFEZXZpY2VLaW5kRW51bS5WaWRlb0lucHV0XTogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2FuU2VlRGV2aWNlTGFiZWxzID0gYXdhaXQgTWVkaWFEZXZpY2VIYW5kbGVyLmhhc0FueUxhYmVsZWREZXZpY2VzKCk7XG4gICAgICAgIGlmIChjYW5TZWVEZXZpY2VMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaE1lZGlhRGV2aWNlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWZyZXNoTWVkaWFEZXZpY2VzID0gYXN5bmMgKHN0cmVhbT86IE1lZGlhU3RyZWFtKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbWVkaWFEZXZpY2VzOiBhd2FpdCBNZWRpYURldmljZUhhbmRsZXIuZ2V0RGV2aWNlcygpLFxuICAgICAgICAgICAgW01lZGlhRGV2aWNlS2luZEVudW0uQXVkaW9PdXRwdXRdOiBNZWRpYURldmljZUhhbmRsZXIuZ2V0QXVkaW9PdXRwdXQoKSxcbiAgICAgICAgICAgIFtNZWRpYURldmljZUtpbmRFbnVtLkF1ZGlvSW5wdXRdOiBNZWRpYURldmljZUhhbmRsZXIuZ2V0QXVkaW9JbnB1dCgpLFxuICAgICAgICAgICAgW01lZGlhRGV2aWNlS2luZEVudW0uVmlkZW9JbnB1dF06IE1lZGlhRGV2aWNlSGFuZGxlci5nZXRWaWRlb0lucHV0KCksXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoc3RyZWFtKSB7XG4gICAgICAgICAgICAvLyBraWxsIHN0cmVhbSAoYWZ0ZXIgd2UndmUgZW51bWVyYXRlZCB0aGUgZGV2aWNlcywgb3RoZXJ3aXNlIHdlJ2QgZ2V0IGVtcHR5IGxhYmVscyBhZ2FpbilcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgd2UgZG9uJ3QgbGVhdmUgaXQgbGluZ2VyaW5nIGFyb3VuZCB3aXRoIHdlYmNhbSBlbmFibGVkIGV0Y1xuICAgICAgICAgICAgLy8gYXMgaGVyZSB3ZSBjYWxsZWQgZ1VNIHRvIGFzayB1c2VyIGZvciBwZXJtaXNzaW9uIHRvIHRoZWlyIGRldmljZSBuYW1lcyBvbmx5XG4gICAgICAgICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaCgodHJhY2spID0+IHRyYWNrLnN0b3AoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZXF1ZXN0TWVkaWFQZXJtaXNzaW9ucyA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgbGV0IGNvbnN0cmFpbnRzO1xuICAgICAgICBsZXQgc3RyZWFtO1xuICAgICAgICBsZXQgZXJyb3I7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdHJhaW50cyA9IHsgdmlkZW86IHRydWUsIGF1ZGlvOiB0cnVlIH07XG4gICAgICAgICAgICBzdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gdXNlciBsaWtlbHkgZG9lc24ndCBoYXZlIGEgd2ViY2FtLFxuICAgICAgICAgICAgLy8gd2Ugc2hvdWxkIHN0aWxsIGFsbG93IHRvIHNlbGVjdCBhIG1pY3JvcGhvbmVcbiAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gXCJOb3RGb3VuZEVycm9yXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdHJhaW50cyA9IHsgYXVkaW86IHRydWUgfTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiRmFpbGVkIHRvIGxpc3QgdXNlck1lZGlhIGRldmljZXNcIiwgZXJyb3IpO1xuICAgICAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ05vIG1lZGlhIHBlcm1pc3Npb25zJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICAnWW91IG1heSBuZWVkIHRvIG1hbnVhbGx5IHBlcm1pdCAlKGJyYW5kKXMgdG8gYWNjZXNzIHlvdXIgbWljcm9waG9uZS93ZWJjYW0nLFxuICAgICAgICAgICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoTWVkaWFEZXZpY2VzKHN0cmVhbSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzZXREZXZpY2UgPSAoZGV2aWNlSWQ6IHN0cmluZywga2luZDogTWVkaWFEZXZpY2VLaW5kRW51bSk6IHZvaWQgPT4ge1xuICAgICAgICBNZWRpYURldmljZUhhbmRsZXIuaW5zdGFuY2Uuc2V0RGV2aWNlKGRldmljZUlkLCBraW5kKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZTxudWxsPih7IFtraW5kXTogZGV2aWNlSWQgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2hhbmdlV2ViUnRjTWV0aG9kID0gKHAycDogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0Rm9yY2VUVVJOKCFwMnApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNoYW5nZUZhbGxiYWNrSUNFU2VydmVyQWxsb3dlZCA9IChhbGxvdzogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0RmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkKGFsbG93KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJEZXZpY2VPcHRpb25zKGRldmljZXM6IEFycmF5PE1lZGlhRGV2aWNlSW5mbz4sIGNhdGVnb3J5OiBNZWRpYURldmljZUtpbmRFbnVtKTogQXJyYXk8SlNYLkVsZW1lbnQ+IHtcbiAgICAgICAgcmV0dXJuIGRldmljZXMubWFwKChkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKDxvcHRpb24ga2V5PXtgJHtjYXRlZ29yeX0tJHtkLmRldmljZUlkfWB9IHZhbHVlPXtkLmRldmljZUlkfT57IGQubGFiZWwgfTwvb3B0aW9uPik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyRHJvcGRvd24oa2luZDogTWVkaWFEZXZpY2VLaW5kRW51bSwgbGFiZWw6IHN0cmluZyk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgZGV2aWNlcyA9IHRoaXMuc3RhdGUubWVkaWFEZXZpY2VzW2tpbmRdLnNsaWNlKDApO1xuICAgICAgICBpZiAoZGV2aWNlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGRlZmF1bHREZXZpY2UgPSBnZXREZWZhdWx0RGV2aWNlKGRldmljZXMpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgZWxlbWVudD1cInNlbGVjdFwiXG4gICAgICAgICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlW2tpbmRdIHx8IGRlZmF1bHREZXZpY2V9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB0aGlzLnNldERldmljZShlLnRhcmdldC52YWx1ZSwga2luZCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckRldmljZU9wdGlvbnMoZGV2aWNlcywga2luZCkgfVxuICAgICAgICAgICAgPC9GaWVsZD5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCByZXF1ZXN0QnV0dG9uID0gbnVsbDtcbiAgICAgICAgbGV0IHNwZWFrZXJEcm9wZG93biA9IG51bGw7XG4gICAgICAgIGxldCBtaWNyb3Bob25lRHJvcGRvd24gPSBudWxsO1xuICAgICAgICBsZXQgd2ViY2FtRHJvcGRvd24gPSBudWxsO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUubWVkaWFEZXZpY2VzKSB7XG4gICAgICAgICAgICByZXF1ZXN0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9Wb2ljZVVzZXJTZXR0aW5nc1RhYl9taXNzaW5nTWVkaWFQZXJtaXNzaW9ucyc+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJNaXNzaW5nIG1lZGlhIHBlcm1pc3Npb25zLCBjbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIHJlcXVlc3QuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMucmVxdWVzdE1lZGlhUGVybWlzc2lvbnN9IGtpbmQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiUmVxdWVzdCBtZWRpYSBwZXJtaXNzaW9uc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5tZWRpYURldmljZXMpIHtcbiAgICAgICAgICAgIHNwZWFrZXJEcm9wZG93biA9IChcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckRyb3Bkb3duKE1lZGlhRGV2aWNlS2luZEVudW0uQXVkaW9PdXRwdXQsIF90KFwiQXVkaW8gT3V0cHV0XCIpKSB8fFxuICAgICAgICAgICAgICAgIDxwPnsgX3QoJ05vIEF1ZGlvIE91dHB1dHMgZGV0ZWN0ZWQnKSB9PC9wPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG1pY3JvcGhvbmVEcm9wZG93biA9IChcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckRyb3Bkb3duKE1lZGlhRGV2aWNlS2luZEVudW0uQXVkaW9JbnB1dCwgX3QoXCJNaWNyb3Bob25lXCIpKSB8fFxuICAgICAgICAgICAgICAgIDxwPnsgX3QoJ05vIE1pY3JvcGhvbmVzIGRldGVjdGVkJykgfTwvcD5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB3ZWJjYW1Ecm9wZG93biA9IChcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckRyb3Bkb3duKE1lZGlhRGV2aWNlS2luZEVudW0uVmlkZW9JbnB1dCwgX3QoXCJDYW1lcmFcIikpIHx8XG4gICAgICAgICAgICAgICAgPHA+eyBfdCgnTm8gV2ViY2FtcyBkZXRlY3RlZCcpIH08L3A+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWIgbXhfVm9pY2VVc2VyU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiVm9pY2UgJiBWaWRlb1wiKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgcmVxdWVzdEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIHsgc3BlYWtlckRyb3Bkb3duIH1cbiAgICAgICAgICAgICAgICAgICAgeyBtaWNyb3Bob25lRHJvcGRvd24gfVxuICAgICAgICAgICAgICAgICAgICB7IHdlYmNhbURyb3Bkb3duIH1cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPSdWaWRlb1ZpZXcuZmxpcFZpZGVvSG9yaXpvbnRhbGx5JyBsZXZlbD17U2V0dGluZ0xldmVsLkFDQ09VTlR9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZsYWdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9J3dlYlJ0Y0FsbG93UGVlclRvUGVlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuY2hhbmdlV2ViUnRjTWV0aG9kfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPSdmYWxsYmFja0lDRVNlcnZlckFsbG93ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbD17U2V0dGluZ0xldmVsLkRFVklDRX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLmNoYW5nZUZhbGxiYWNrSUNFU2VydmVyQWxsb3dlZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWdCQSxNQUFNQSxnQkFBZ0IsR0FBSUMsT0FBRCxJQUE4QztFQUNuRTtFQUNBO0VBQ0E7RUFDQSxJQUFJ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