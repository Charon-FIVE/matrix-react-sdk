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

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var FormattingUtils = _interopRequireWildcard(require("../../../utils/FormattingUtils"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _SettingsFlag = _interopRequireDefault(require("../elements/SettingsFlag"));

var _SettingLevel = require("../../../settings/SettingLevel");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class CryptographyPanel extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onExportE2eKeysClicked", () => {
      _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require('../../../async-components/views/dialogs/security/ExportE2eKeysDialog'))), {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get()
      });
    });
    (0, _defineProperty2.default)(this, "onImportE2eKeysClicked", () => {
      _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require('../../../async-components/views/dialogs/security/ImportE2eKeysDialog'))), {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get()
      });
    });
    (0, _defineProperty2.default)(this, "updateBlacklistDevicesFlag", checked => {
      _MatrixClientPeg.MatrixClientPeg.get().setGlobalBlacklistUnverifiedDevices(checked);
    });
  }

  render() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const deviceId = client.deviceId;
    let identityKey = client.getDeviceEd25519Key();

    if (!identityKey) {
      identityKey = (0, _languageHandler._t)("<not supported>");
    } else {
      identityKey = FormattingUtils.formatCryptoKey(identityKey);
    }

    let importExportButtons = null;

    if (client.isCryptoEnabled()) {
      importExportButtons = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CryptographyPanel_importExportButtons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.onExportE2eKeysClicked
      }, (0, _languageHandler._t)("Export E2E room keys")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.onImportE2eKeysClicked
      }, (0, _languageHandler._t)("Import E2E room keys")));
    }

    let noSendUnverifiedSetting;

    if (_SettingsStore.default.isEnabled("blacklistUnverifiedDevices")) {
      noSendUnverifiedSetting = /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        name: "blacklistUnverifiedDevices",
        level: _SettingLevel.SettingLevel.DEVICE,
        onChange: this.updateBlacklistDevicesFlag
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_CryptographyPanel"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Cryptography")), /*#__PURE__*/_react.default.createElement("table", {
      className: "mx_SettingsTab_subsectionText mx_CryptographyPanel_sessionInfo"
    }, /*#__PURE__*/_react.default.createElement("tbody", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Session ID:")), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, deviceId))), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Session key:")), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, /*#__PURE__*/_react.default.createElement("b", null, identityKey)))))), importExportButtons, noSendUnverifiedSetting);
  }

}

exports.default = CryptographyPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcnlwdG9ncmFwaHlQYW5lbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nQXN5bmMiLCJtYXRyaXhDbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjaGVja2VkIiwic2V0R2xvYmFsQmxhY2tsaXN0VW52ZXJpZmllZERldmljZXMiLCJyZW5kZXIiLCJjbGllbnQiLCJkZXZpY2VJZCIsImlkZW50aXR5S2V5IiwiZ2V0RGV2aWNlRWQyNTUxOUtleSIsIl90IiwiRm9ybWF0dGluZ1V0aWxzIiwiZm9ybWF0Q3J5cHRvS2V5IiwiaW1wb3J0RXhwb3J0QnV0dG9ucyIsImlzQ3J5cHRvRW5hYmxlZCIsIm9uRXhwb3J0RTJlS2V5c0NsaWNrZWQiLCJvbkltcG9ydEUyZUtleXNDbGlja2VkIiwibm9TZW5kVW52ZXJpZmllZFNldHRpbmciLCJTZXR0aW5nc1N0b3JlIiwiaXNFbmFibGVkIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwidXBkYXRlQmxhY2tsaXN0RGV2aWNlc0ZsYWciXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy9DcnlwdG9ncmFwaHlQYW5lbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudFR5cGUgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCAqIGFzIEZvcm1hdHRpbmdVdGlscyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRm9ybWF0dGluZ1V0aWxzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFNldHRpbmdzRmxhZyBmcm9tIFwiLi4vZWxlbWVudHMvU2V0dGluZ3NGbGFnXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3J5cHRvZ3JhcGh5UGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBkZXZpY2VJZCA9IGNsaWVudC5kZXZpY2VJZDtcbiAgICAgICAgbGV0IGlkZW50aXR5S2V5ID0gY2xpZW50LmdldERldmljZUVkMjU1MTlLZXkoKTtcbiAgICAgICAgaWYgKCFpZGVudGl0eUtleSkge1xuICAgICAgICAgICAgaWRlbnRpdHlLZXkgPSBfdChcIjxub3Qgc3VwcG9ydGVkPlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlkZW50aXR5S2V5ID0gRm9ybWF0dGluZ1V0aWxzLmZvcm1hdENyeXB0b0tleShpZGVudGl0eUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW1wb3J0RXhwb3J0QnV0dG9ucyA9IG51bGw7XG4gICAgICAgIGlmIChjbGllbnQuaXNDcnlwdG9FbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGltcG9ydEV4cG9ydEJ1dHRvbnMgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0NyeXB0b2dyYXBoeVBhbmVsX2ltcG9ydEV4cG9ydEJ1dHRvbnMnPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdwcmltYXJ5JyBvbkNsaWNrPXt0aGlzLm9uRXhwb3J0RTJlS2V5c0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkV4cG9ydCBFMkUgcm9vbSBrZXlzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdwcmltYXJ5JyBvbkNsaWNrPXt0aGlzLm9uSW1wb3J0RTJlS2V5c0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkltcG9ydCBFMkUgcm9vbSBrZXlzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub1NlbmRVbnZlcmlmaWVkU2V0dGluZztcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuaXNFbmFibGVkKFwiYmxhY2tsaXN0VW52ZXJpZmllZERldmljZXNcIikpIHtcbiAgICAgICAgICAgIG5vU2VuZFVudmVyaWZpZWRTZXR0aW5nID0gPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgIG5hbWU9J2JsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzJ1xuICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnVwZGF0ZUJsYWNrbGlzdERldmljZXNGbGFnfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfQ3J5cHRvZ3JhcGh5UGFuZWwnPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+eyBfdChcIkNyeXB0b2dyYXBoeVwiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0IG14X0NyeXB0b2dyYXBoeVBhbmVsX3Nlc3Npb25JbmZvJz5cbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57IF90KFwiU2Vzc2lvbiBJRDpcIikgfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPjxjb2RlPnsgZGV2aWNlSWQgfTwvY29kZT48L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+eyBfdChcIlNlc3Npb24ga2V5OlwiKSB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+PGNvZGU+PGI+eyBpZGVudGl0eUtleSB9PC9iPjwvY29kZT48L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgIHsgaW1wb3J0RXhwb3J0QnV0dG9ucyB9XG4gICAgICAgICAgICAgICAgeyBub1NlbmRVbnZlcmlmaWVkU2V0dGluZyB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRXhwb3J0RTJlS2V5c0NsaWNrZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZ0FzeW5jKFxuICAgICAgICAgICAgaW1wb3J0KFxuICAgICAgICAgICAgICAgICcuLi8uLi8uLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvRXhwb3J0RTJlS2V5c0RpYWxvZydcbiAgICAgICAgICAgICkgYXMgdW5rbm93biBhcyBQcm9taXNlPENvbXBvbmVudFR5cGU8e30+PixcbiAgICAgICAgICAgIHsgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkgfSxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkltcG9ydEUyZUtleXNDbGlja2VkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2dBc3luYyhcbiAgICAgICAgICAgIGltcG9ydChcbiAgICAgICAgICAgICAgICAnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0ltcG9ydEUyZUtleXNEaWFsb2cnXG4gICAgICAgICAgICApIGFzIHVua25vd24gYXMgUHJvbWlzZTxDb21wb25lbnRUeXBlPHt9Pj4sXG4gICAgICAgICAgICB7IG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50UGVnLmdldCgpIH0sXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlQmxhY2tsaXN0RGV2aWNlc0ZsYWcgPSAoY2hlY2tlZCk6IHZvaWQgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0R2xvYmFsQmxhY2tsaXN0VW52ZXJpZmllZERldmljZXMoY2hlY2tlZCk7XG4gICAgfTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQVFlLE1BQU1BLGlCQUFOLFNBQWdDQyxjQUFBLENBQU1DLFNBQXRDLENBQWdFO0VBQzNFQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1Qiw4REEwRE0sTUFBWTtNQUN6Q0MsY0FBQSxDQUFNQyxpQkFBTiw4REFFUSxzRUFGUixLQUlJO1FBQUVDLFlBQVksRUFBRUMsZ0NBQUEsQ0FBZ0JDLEdBQWhCO01BQWhCLENBSko7SUFNSCxDQWpFMEI7SUFBQSw4REFtRU0sTUFBWTtNQUN6Q0osY0FBQSxDQUFNQyxpQkFBTiw4REFFUSxzRUFGUixLQUlJO1FBQUVDLFlBQVksRUFBRUMsZ0NBQUEsQ0FBZ0JDLEdBQWhCO01BQWhCLENBSko7SUFNSCxDQTFFMEI7SUFBQSxrRUE0RVdDLE9BQUQsSUFBbUI7TUFDcERGLGdDQUFBLENBQWdCQyxHQUFoQixHQUFzQkUsbUNBQXRCLENBQTBERCxPQUExRDtJQUNILENBOUUwQjtFQUUxQjs7RUFFTUUsTUFBTSxHQUFnQjtJQUN6QixNQUFNQyxNQUFNLEdBQUdMLGdDQUFBLENBQWdCQyxHQUFoQixFQUFmOztJQUNBLE1BQU1LLFFBQVEsR0FBR0QsTUFBTSxDQUFDQyxRQUF4QjtJQUNBLElBQUlDLFdBQVcsR0FBR0YsTUFBTSxDQUFDRyxtQkFBUCxFQUFsQjs7SUFDQSxJQUFJLENBQUNELFdBQUwsRUFBa0I7TUFDZEEsV0FBVyxHQUFHLElBQUFFLG1CQUFBLEVBQUcsaUJBQUgsQ0FBZDtJQUNILENBRkQsTUFFTztNQUNIRixXQUFXLEdBQUdHLGVBQWUsQ0FBQ0MsZUFBaEIsQ0FBZ0NKLFdBQWhDLENBQWQ7SUFDSDs7SUFFRCxJQUFJSyxtQkFBbUIsR0FBRyxJQUExQjs7SUFDQSxJQUFJUCxNQUFNLENBQUNRLGVBQVAsRUFBSixFQUE4QjtNQUMxQkQsbUJBQW1CLGdCQUNmO1FBQUssU0FBUyxFQUFDO01BQWYsZ0JBQ0ksNkJBQUMseUJBQUQ7UUFBa0IsSUFBSSxFQUFDLFNBQXZCO1FBQWlDLE9BQU8sRUFBRSxLQUFLRTtNQUEvQyxHQUNNLElBQUFMLG1CQUFBLEVBQUcsc0JBQUgsQ0FETixDQURKLGVBSUksNkJBQUMseUJBQUQ7UUFBa0IsSUFBSSxFQUFDLFNBQXZCO1FBQWlDLE9BQU8sRUFBRSxLQUFLTTtNQUEvQyxHQUNNLElBQUFOLG1CQUFBLEVBQUcsc0JBQUgsQ0FETixDQUpKLENBREo7SUFVSDs7SUFFRCxJQUFJTyx1QkFBSjs7SUFDQSxJQUFJQyxzQkFBQSxDQUFjQyxTQUFkLENBQXdCLDRCQUF4QixDQUFKLEVBQTJEO01BQ3ZERix1QkFBdUIsZ0JBQUcsNkJBQUMscUJBQUQ7UUFDdEIsSUFBSSxFQUFDLDRCQURpQjtRQUV0QixLQUFLLEVBQUVHLDBCQUFBLENBQWFDLE1BRkU7UUFHdEIsUUFBUSxFQUFFLEtBQUtDO01BSE8sRUFBMUI7SUFLSDs7SUFFRCxvQkFDSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJO01BQU0sU0FBUyxFQUFDO0lBQWhCLEdBQThDLElBQUFaLG1CQUFBLEVBQUcsY0FBSCxDQUE5QyxDQURKLGVBRUk7TUFBTyxTQUFTLEVBQUM7SUFBakIsZ0JBQ0kseURBQ0ksc0RBQ0kseUNBQU0sSUFBQUEsbUJBQUEsRUFBRyxhQUFILENBQU4sQ0FESixlQUVJLHNEQUFJLDJDQUFRSCxRQUFSLENBQUosQ0FGSixDQURKLGVBS0ksc0RBQ0kseUNBQU0sSUFBQUcsbUJBQUEsRUFBRyxjQUFILENBQU4sQ0FESixlQUVJLHNEQUFJLHdEQUFNLHdDQUFLRixXQUFMLENBQU4sQ0FBSixDQUZKLENBTEosQ0FESixDQUZKLEVBY01LLG1CQWROLEVBZU1JLHVCQWZOLENBREo7RUFtQkg7O0FBekQwRSJ9