"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var MegolmExportEncryption = _interopRequireWildcard(require("../../../../utils/MegolmExportEncryption"));

var _languageHandler = require("../../../../languageHandler");

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
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      resolve(e.target.result);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

var Phase;

(function (Phase) {
  Phase["Edit"] = "edit";
  Phase["Importing"] = "importing";
})(Phase || (Phase = {}));

class ImportE2eKeysDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "file", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "passphrase", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onFormChange", ev => {
      const files = this.file.current.files || [];
      this.setState({
        enableSubmit: this.passphrase.current.value !== "" && files.length > 0
      });
    });
    (0, _defineProperty2.default)(this, "onFormSubmit", ev => {
      ev.preventDefault();
      this.startImport(this.file.current.files[0], this.passphrase.current.value);
      return false;
    });
    (0, _defineProperty2.default)(this, "onCancelClick", ev => {
      ev.preventDefault();
      this.props.onFinished(false);
      return false;
    });
    this.state = {
      enableSubmit: false,
      phase: Phase.Edit,
      errStr: null
    };
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  startImport(file, passphrase) {
    this.setState({
      errStr: null,
      phase: Phase.Importing
    });
    return readFileAsArrayBuffer(file).then(arrayBuffer => {
      return MegolmExportEncryption.decryptMegolmKeyFile(arrayBuffer, passphrase);
    }).then(keys => {
      return this.props.matrixClient.importRoomKeys(JSON.parse(keys));
    }).then(() => {
      // TODO: it would probably be nice to give some feedback about what we've imported here.
      this.props.onFinished(true);
    }).catch(e => {
      _logger.logger.error("Error importing e2e keys:", e);

      if (this.unmounted) {
        return;
      }

      const msg = e.friendlyText || (0, _languageHandler._t)('Unknown error');
      this.setState({
        errStr: msg,
        phase: Phase.Edit
      });
    });
  }

  render() {
    const disableForm = this.state.phase !== Phase.Edit;
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_importE2eKeysDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Import room keys")
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onFormSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('This process allows you to import encryption keys ' + 'that you had previously exported from another Matrix ' + 'client. You will then be able to decrypt any ' + 'messages that the other client could decrypt.')), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('The export file will be protected with a passphrase. ' + 'You should enter the passphrase here, to decrypt the file.')), /*#__PURE__*/_react.default.createElement("div", {
      className: "error"
    }, this.state.errStr), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputTable"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputRow"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputLabel"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "importFile"
    }, (0, _languageHandler._t)("File to import"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputCell"
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this.file,
      id: "importFile",
      type: "file",
      autoFocus: true,
      onChange: this.onFormChange,
      disabled: disableForm
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputRow"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputLabel"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "passphrase"
    }, (0, _languageHandler._t)("Enter passphrase"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputCell"
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this.passphrase,
      id: "passphrase",
      size: 64,
      type: "password",
      onChange: this.onFormChange,
      disabled: disableForm
    }))))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Dialog_primary",
      type: "submit",
      value: (0, _languageHandler._t)('Import'),
      disabled: !this.state.enableSubmit || disableForm
    }), /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onCancelClick,
      disabled: disableForm
    }, (0, _languageHandler._t)("Cancel")))));
  }

}

exports.default = ImportE2eKeysDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZWFkRmlsZUFzQXJyYXlCdWZmZXIiLCJmaWxlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiZSIsInRhcmdldCIsInJlc3VsdCIsIm9uZXJyb3IiLCJyZWFkQXNBcnJheUJ1ZmZlciIsIlBoYXNlIiwiSW1wb3J0RTJlS2V5c0RpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsImV2IiwiZmlsZXMiLCJjdXJyZW50Iiwic2V0U3RhdGUiLCJlbmFibGVTdWJtaXQiLCJwYXNzcGhyYXNlIiwidmFsdWUiLCJsZW5ndGgiLCJwcmV2ZW50RGVmYXVsdCIsInN0YXJ0SW1wb3J0Iiwib25GaW5pc2hlZCIsInN0YXRlIiwicGhhc2UiLCJFZGl0IiwiZXJyU3RyIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bm1vdW50ZWQiLCJJbXBvcnRpbmciLCJ0aGVuIiwiYXJyYXlCdWZmZXIiLCJNZWdvbG1FeHBvcnRFbmNyeXB0aW9uIiwiZGVjcnlwdE1lZ29sbUtleUZpbGUiLCJrZXlzIiwibWF0cml4Q2xpZW50IiwiaW1wb3J0Um9vbUtleXMiLCJKU09OIiwicGFyc2UiLCJjYXRjaCIsImxvZ2dlciIsImVycm9yIiwibXNnIiwiZnJpZW5kbHlUZXh0IiwiX3QiLCJyZW5kZXIiLCJkaXNhYmxlRm9ybSIsIm9uRm9ybVN1Ym1pdCIsIm9uRm9ybUNoYW5nZSIsIm9uQ2FuY2VsQ2xpY2siXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0ltcG9ydEUyZUtleXNEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgKiBhcyBNZWdvbG1FeHBvcnRFbmNyeXB0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL01lZ29sbUV4cG9ydEVuY3J5cHRpb24nO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQmFzZURpYWxvZ1wiO1xuXG5mdW5jdGlvbiByZWFkRmlsZUFzQXJyYXlCdWZmZXIoZmlsZTogRmlsZSk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICByZWFkZXIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoZS50YXJnZXQucmVzdWx0IGFzIEFycmF5QnVmZmVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSByZWplY3Q7XG5cbiAgICAgICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpO1xuICAgIH0pO1xufVxuXG5lbnVtIFBoYXNlIHtcbiAgICBFZGl0ID0gXCJlZGl0XCIsXG4gICAgSW1wb3J0aW5nID0gXCJpbXBvcnRpbmdcIixcbn1cblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGVuYWJsZVN1Ym1pdDogYm9vbGVhbjtcbiAgICBwaGFzZTogUGhhc2U7XG4gICAgZXJyU3RyOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltcG9ydEUyZUtleXNEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHVubW91bnRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgZmlsZSA9IGNyZWF0ZVJlZjxIVE1MSW5wdXRFbGVtZW50PigpO1xuICAgIHByaXZhdGUgcGFzc3BocmFzZSA9IGNyZWF0ZVJlZjxIVE1MSW5wdXRFbGVtZW50PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGVuYWJsZVN1Ym1pdDogZmFsc2UsXG4gICAgICAgICAgICBwaGFzZTogUGhhc2UuRWRpdCxcbiAgICAgICAgICAgIGVyclN0cjogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRm9ybUNoYW5nZSA9IChldjogUmVhY3QuRm9ybUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gdGhpcy5maWxlLmN1cnJlbnQuZmlsZXMgfHwgW107XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZW5hYmxlU3VibWl0OiAodGhpcy5wYXNzcGhyYXNlLmN1cnJlbnQudmFsdWUgIT09IFwiXCIgJiYgZmlsZXMubGVuZ3RoID4gMCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9ybVN1Ym1pdCA9IChldjogUmVhY3QuRm9ybUV2ZW50KTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc3RhcnRJbXBvcnQodGhpcy5maWxlLmN1cnJlbnQuZmlsZXNbMF0sIHRoaXMucGFzc3BocmFzZS5jdXJyZW50LnZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXJ0SW1wb3J0KGZpbGU6IEZpbGUsIHBhc3NwaHJhc2U6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVyclN0cjogbnVsbCxcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5JbXBvcnRpbmcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZWFkRmlsZUFzQXJyYXlCdWZmZXIoZmlsZSkudGhlbigoYXJyYXlCdWZmZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBNZWdvbG1FeHBvcnRFbmNyeXB0aW9uLmRlY3J5cHRNZWdvbG1LZXlGaWxlKFxuICAgICAgICAgICAgICAgIGFycmF5QnVmZmVyLCBwYXNzcGhyYXNlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSkudGhlbigoa2V5cykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmltcG9ydFJvb21LZXlzKEpTT04ucGFyc2Uoa2V5cykpO1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFRPRE86IGl0IHdvdWxkIHByb2JhYmx5IGJlIG5pY2UgdG8gZ2l2ZSBzb21lIGZlZWRiYWNrIGFib3V0IHdoYXQgd2UndmUgaW1wb3J0ZWQgaGVyZS5cbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIGltcG9ydGluZyBlMmUga2V5czpcIiwgZSk7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBlLmZyaWVuZGx5VGV4dCB8fCBfdCgnVW5rbm93biBlcnJvcicpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXJyU3RyOiBtc2csXG4gICAgICAgICAgICAgICAgcGhhc2U6IFBoYXNlLkVkaXQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbENsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGRpc2FibGVGb3JtID0gKHRoaXMuc3RhdGUucGhhc2UgIT09IFBoYXNlLkVkaXQpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9J214X2ltcG9ydEUyZUtleXNEaWFsb2cnXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkltcG9ydCByb29tIGtleXNcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25Gb3JtU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1RoaXMgcHJvY2VzcyBhbGxvd3MgeW91IHRvIGltcG9ydCBlbmNyeXB0aW9uIGtleXMgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aGF0IHlvdSBoYWQgcHJldmlvdXNseSBleHBvcnRlZCBmcm9tIGFub3RoZXIgTWF0cml4ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpZW50LiBZb3Ugd2lsbCB0aGVuIGJlIGFibGUgdG8gZGVjcnlwdCBhbnkgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtZXNzYWdlcyB0aGF0IHRoZSBvdGhlciBjbGllbnQgY291bGQgZGVjcnlwdC4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1RoZSBleHBvcnQgZmlsZSB3aWxsIGJlIHByb3RlY3RlZCB3aXRoIGEgcGFzc3BocmFzZS4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdZb3Ugc2hvdWxkIGVudGVyIHRoZSBwYXNzcGhyYXNlIGhlcmUsIHRvIGRlY3J5cHQgdGhlIGZpbGUuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdlcnJvcic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVyclN0ciB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9FMmVLZXlzRGlhbG9nX2lucHV0VGFibGUnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9FMmVLZXlzRGlhbG9nX2lucHV0Um93Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRMYWJlbCc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj0naW1wb3J0RmlsZSc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkZpbGUgdG8gaW1wb3J0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRTJlS2V5c0RpYWxvZ19pbnB1dENlbGwnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmZpbGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9J2ltcG9ydEZpbGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT0nZmlsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Gb3JtQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtkaXNhYmxlRm9ybX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRSb3cnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRTJlS2V5c0RpYWxvZ19pbnB1dExhYmVsJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPSdwYXNzcGhyYXNlJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiRW50ZXIgcGFzc3BocmFzZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRDZWxsJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5wYXNzcGhyYXNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPSdwYXNzcGhyYXNlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9ezY0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9J3Bhc3N3b3JkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRm9ybUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZUZvcm19IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRGlhbG9nX2J1dHRvbnMnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9EaWFsb2dfcHJpbWFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSdzdWJtaXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KCdJbXBvcnQnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUuZW5hYmxlU3VibWl0IHx8IGRpc2FibGVGb3JtfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkNhbmNlbENsaWNrfSBkaXNhYmxlZD17ZGlzYWJsZUZvcm19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDYW5jZWxcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUVBOztBQUNBOztBQUVBOzs7Ozs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBV0EsU0FBU0EscUJBQVQsQ0FBK0JDLElBQS9CLEVBQWlFO0VBQzdELE9BQU8sSUFBSUMsT0FBSixDQUFZLENBQUNDLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtJQUNwQyxNQUFNQyxNQUFNLEdBQUcsSUFBSUMsVUFBSixFQUFmOztJQUNBRCxNQUFNLENBQUNFLE1BQVAsR0FBaUJDLENBQUQsSUFBTztNQUNuQkwsT0FBTyxDQUFDSyxDQUFDLENBQUNDLE1BQUYsQ0FBU0MsTUFBVixDQUFQO0lBQ0gsQ0FGRDs7SUFHQUwsTUFBTSxDQUFDTSxPQUFQLEdBQWlCUCxNQUFqQjtJQUVBQyxNQUFNLENBQUNPLGlCQUFQLENBQXlCWCxJQUF6QjtFQUNILENBUk0sQ0FBUDtBQVNIOztJQUVJWSxLOztXQUFBQSxL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