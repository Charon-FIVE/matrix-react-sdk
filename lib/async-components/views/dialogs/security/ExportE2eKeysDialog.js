"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fileSaver = _interopRequireDefault(require("file-saver"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../languageHandler");

var MegolmExportEncryption = _interopRequireWildcard(require("../../../../utils/MegolmExportEncryption"));

var _BaseDialog = _interopRequireDefault(require("../../../../components/views/dialogs/BaseDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 Vector Creations Ltd

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
var Phase;

(function (Phase) {
  Phase["Edit"] = "edit";
  Phase["Exporting"] = "exporting";
})(Phase || (Phase = {}));

class ExportE2eKeysDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "passphrase1", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "passphrase2", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onPassphraseFormSubmit", ev => {
      ev.preventDefault();
      const passphrase = this.passphrase1.current.value;

      if (passphrase !== this.passphrase2.current.value) {
        this.setState({
          errStr: (0, _languageHandler._t)('Passphrases must match')
        });
        return false;
      }

      if (!passphrase) {
        this.setState({
          errStr: (0, _languageHandler._t)('Passphrase must not be empty')
        });
        return false;
      }

      this.startExport(passphrase);
      return false;
    });
    (0, _defineProperty2.default)(this, "onCancelClick", ev => {
      ev.preventDefault();
      this.props.onFinished(false);
      return false;
    });
    this.state = {
      phase: Phase.Edit,
      errStr: null
    };
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  startExport(passphrase) {
    // extra Promise.resolve() to turn synchronous exceptions into
    // asynchronous ones.
    Promise.resolve().then(() => {
      return this.props.matrixClient.exportRoomKeys();
    }).then(k => {
      return MegolmExportEncryption.encryptMegolmKeyFile(JSON.stringify(k), passphrase);
    }).then(f => {
      const blob = new Blob([f], {
        type: 'text/plain;charset=us-ascii'
      });

      _fileSaver.default.saveAs(blob, 'element-keys.txt');

      this.props.onFinished(true);
    }).catch(e => {
      _logger.logger.error("Error exporting e2e keys:", e);

      if (this.unmounted) {
        return;
      }

      const msg = e.friendlyText || (0, _languageHandler._t)('Unknown error');
      this.setState({
        errStr: msg,
        phase: Phase.Edit
      });
    });
    this.setState({
      errStr: null,
      phase: Phase.Exporting
    });
  }

  render() {
    const disableForm = this.state.phase === Phase.Exporting;
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_exportE2eKeysDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Export room keys")
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onPassphraseFormSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('This process allows you to export the keys for messages ' + 'you have received in encrypted rooms to a local file. You ' + 'will then be able to import the file into another Matrix ' + 'client in the future, so that client will also be able to ' + 'decrypt these messages.')), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('The exported file will allow anyone who can read it to decrypt ' + 'any encrypted messages that you can see, so you should be ' + 'careful to keep it secure. To help with this, you should enter ' + 'a passphrase below, which will be used to encrypt the exported ' + 'data. It will only be possible to import the data by using the ' + 'same passphrase.')), /*#__PURE__*/_react.default.createElement("div", {
      className: "error"
    }, this.state.errStr), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputTable"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputRow"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputLabel"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "passphrase1"
    }, (0, _languageHandler._t)("Enter passphrase"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputCell"
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this.passphrase1,
      id: "passphrase1",
      autoFocus: true,
      size: 64,
      type: "password",
      disabled: disableForm
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputRow"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputLabel"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "passphrase2"
    }, (0, _languageHandler._t)("Confirm passphrase"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputCell"
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this.passphrase2,
      id: "passphrase2",
      size: 64,
      type: "password",
      disabled: disableForm
    }))))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Dialog_primary",
      type: "submit",
      value: (0, _languageHandler._t)('Export'),
      disabled: disableForm
    }), /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onCancelClick,
      disabled: disableForm
    }, (0, _languageHandler._t)("Cancel")))));
  }

}

exports.default = ExportE2eKeysDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGFzZSIsIkV4cG9ydEUyZUtleXNEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJldiIsInByZXZlbnREZWZhdWx0IiwicGFzc3BocmFzZSIsInBhc3NwaHJhc2UxIiwiY3VycmVudCIsInZhbHVlIiwicGFzc3BocmFzZTIiLCJzZXRTdGF0ZSIsImVyclN0ciIsIl90Iiwic3RhcnRFeHBvcnQiLCJvbkZpbmlzaGVkIiwic3RhdGUiLCJwaGFzZSIsIkVkaXQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVubW91bnRlZCIsIlByb21pc2UiLCJyZXNvbHZlIiwidGhlbiIsIm1hdHJpeENsaWVudCIsImV4cG9ydFJvb21LZXlzIiwiayIsIk1lZ29sbUV4cG9ydEVuY3J5cHRpb24iLCJlbmNyeXB0TWVnb2xtS2V5RmlsZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJmIiwiYmxvYiIsIkJsb2IiLCJ0eXBlIiwiRmlsZVNhdmVyIiwic2F2ZUFzIiwiY2F0Y2giLCJlIiwibG9nZ2VyIiwiZXJyb3IiLCJtc2ciLCJmcmllbmRseVRleHQiLCJFeHBvcnRpbmciLCJyZW5kZXIiLCJkaXNhYmxlRm9ybSIsIm9uUGFzc3BocmFzZUZvcm1TdWJtaXQiLCJvbkNhbmNlbENsaWNrIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9FeHBvcnRFMmVLZXlzRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgRmlsZVNhdmVyIGZyb20gJ2ZpbGUtc2F2ZXInO1xuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NsaWVudCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIE1lZ29sbUV4cG9ydEVuY3J5cHRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvTWVnb2xtRXhwb3J0RW5jcnlwdGlvbic7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0lEaWFsb2dQcm9wc1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9CYXNlRGlhbG9nXCI7XG5cbmVudW0gUGhhc2Uge1xuICAgIEVkaXQgPSBcImVkaXRcIixcbiAgICBFeHBvcnRpbmcgPSBcImV4cG9ydGluZ1wiLFxufVxuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgcGhhc2U6IFBoYXNlO1xuICAgIGVyclN0cjogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHBvcnRFMmVLZXlzRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSB1bm1vdW50ZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIHBhc3NwaHJhc2UxID0gY3JlYXRlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBwYXNzcGhyYXNlMiA9IGNyZWF0ZVJlZjxIVE1MSW5wdXRFbGVtZW50PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5FZGl0LFxuICAgICAgICAgICAgZXJyU3RyOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25QYXNzcGhyYXNlRm9ybVN1Ym1pdCA9IChldjogUmVhY3QuRm9ybUV2ZW50KTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgcGFzc3BocmFzZSA9IHRoaXMucGFzc3BocmFzZTEuY3VycmVudC52YWx1ZTtcbiAgICAgICAgaWYgKHBhc3NwaHJhc2UgIT09IHRoaXMucGFzc3BocmFzZTIuY3VycmVudC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVyclN0cjogX3QoJ1Bhc3NwaHJhc2VzIG11c3QgbWF0Y2gnKSB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhc3NwaHJhc2UpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJTdHI6IF90KCdQYXNzcGhyYXNlIG11c3Qgbm90IGJlIGVtcHR5JykgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXJ0RXhwb3J0KHBhc3NwaHJhc2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc3RhcnRFeHBvcnQocGFzc3BocmFzZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIC8vIGV4dHJhIFByb21pc2UucmVzb2x2ZSgpIHRvIHR1cm4gc3luY2hyb25vdXMgZXhjZXB0aW9ucyBpbnRvXG4gICAgICAgIC8vIGFzeW5jaHJvbm91cyBvbmVzLlxuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLm1hdHJpeENsaWVudC5leHBvcnRSb29tS2V5cygpO1xuICAgICAgICB9KS50aGVuKChrKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gTWVnb2xtRXhwb3J0RW5jcnlwdGlvbi5lbmNyeXB0TWVnb2xtS2V5RmlsZShcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShrKSwgcGFzc3BocmFzZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pLnRoZW4oKGYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbZl0sIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC9wbGFpbjtjaGFyc2V0PXVzLWFzY2lpJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgRmlsZVNhdmVyLnNhdmVBcyhibG9iLCAnZWxlbWVudC1rZXlzLnR4dCcpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgZXhwb3J0aW5nIGUyZSBrZXlzOlwiLCBlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGUuZnJpZW5kbHlUZXh0IHx8IF90KCdVbmtub3duIGVycm9yJyk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlcnJTdHI6IG1zZyxcbiAgICAgICAgICAgICAgICBwaGFzZTogUGhhc2UuRWRpdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVyclN0cjogbnVsbCxcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5FeHBvcnRpbmcsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DYW5jZWxDbGljayA9IChldjogUmVhY3QuTW91c2VFdmVudCk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCBkaXNhYmxlRm9ybSA9ICh0aGlzLnN0YXRlLnBoYXNlID09PSBQaGFzZS5FeHBvcnRpbmcpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9J214X2V4cG9ydEUyZUtleXNEaWFsb2cnXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkV4cG9ydCByb29tIGtleXNcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25QYXNzcGhyYXNlRm9ybVN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdUaGlzIHByb2Nlc3MgYWxsb3dzIHlvdSB0byBleHBvcnQgdGhlIGtleXMgZm9yIG1lc3NhZ2VzICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAneW91IGhhdmUgcmVjZWl2ZWQgaW4gZW5jcnlwdGVkIHJvb21zIHRvIGEgbG9jYWwgZmlsZS4gWW91ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2lsbCB0aGVuIGJlIGFibGUgdG8gaW1wb3J0IHRoZSBmaWxlIGludG8gYW5vdGhlciBNYXRyaXggJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGllbnQgaW4gdGhlIGZ1dHVyZSwgc28gdGhhdCBjbGllbnQgd2lsbCBhbHNvIGJlIGFibGUgdG8gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkZWNyeXB0IHRoZXNlIG1lc3NhZ2VzLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVGhlIGV4cG9ydGVkIGZpbGUgd2lsbCBhbGxvdyBhbnlvbmUgd2hvIGNhbiByZWFkIGl0IHRvIGRlY3J5cHQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbnkgZW5jcnlwdGVkIG1lc3NhZ2VzIHRoYXQgeW91IGNhbiBzZWUsIHNvIHlvdSBzaG91bGQgYmUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjYXJlZnVsIHRvIGtlZXAgaXQgc2VjdXJlLiBUbyBoZWxwIHdpdGggdGhpcywgeW91IHNob3VsZCBlbnRlciAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgcGFzc3BocmFzZSBiZWxvdywgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGVuY3J5cHQgdGhlIGV4cG9ydGVkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS4gSXQgd2lsbCBvbmx5IGJlIHBvc3NpYmxlIHRvIGltcG9ydCB0aGUgZGF0YSBieSB1c2luZyB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzYW1lIHBhc3NwaHJhc2UuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdlcnJvcic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVyclN0ciB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9FMmVLZXlzRGlhbG9nX2lucHV0VGFibGUnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9FMmVLZXlzRGlhbG9nX2lucHV0Um93Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRMYWJlbCc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj0ncGFzc3BocmFzZTEnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJFbnRlciBwYXNzcGhyYXNlXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRTJlS2V5c0RpYWxvZ19pbnB1dENlbGwnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnBhc3NwaHJhc2UxfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPSdwYXNzcGhyYXNlMSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT17NjR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT0ncGFzc3dvcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVGb3JtfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRSb3cnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRTJlS2V5c0RpYWxvZ19pbnB1dExhYmVsJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPSdwYXNzcGhyYXNlMic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNvbmZpcm0gcGFzc3BocmFzZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRDZWxsJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCByZWY9e3RoaXMucGFzc3BocmFzZTJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9J3Bhc3NwaHJhc2UyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9ezY0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9J3Bhc3N3b3JkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtkaXNhYmxlRm9ybX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRGlhbG9nX2J1dHRvbnMnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9EaWFsb2dfcHJpbWFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSdzdWJtaXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KCdFeHBvcnQnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZUZvcm19XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9IGRpc2FibGVkPXtkaXNhYmxlRm9ybX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNhbmNlbFwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBRUE7Ozs7OztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFZS0EsSzs7V0FBQUEsSztFQUFBQSxLO0VBQUFBLEs7R0FBQUEsSyxLQUFBQSxLOztBQWNVLE1BQU1DLG1CQUFOLFNBQWtDQyxjQUFBLENBQU1DLFNBQXhDLENBQWtFO0VBSzdFQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1QixpREFKUCxLQUlPO0lBQUEs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