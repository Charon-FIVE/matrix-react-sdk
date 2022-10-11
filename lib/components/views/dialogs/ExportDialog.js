"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _StyledRadioGroup = _interopRequireDefault(require("../elements/StyledRadioGroup"));

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _exportUtils = require("../../../utils/exportUtils/exportUtils");

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _HtmlExport = _interopRequireDefault(require("../../../utils/exportUtils/HtmlExport"));

var _JSONExport = _interopRequireDefault(require("../../../utils/exportUtils/JSONExport"));

var _PlainTextExport = _interopRequireDefault(require("../../../utils/exportUtils/PlainTextExport"));

var _useStateCallback = require("../../../hooks/useStateCallback");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _InfoDialog = _interopRequireDefault(require("./InfoDialog"));

var _ChatExport = _interopRequireDefault(require("../../../customisations/ChatExport"));

var _validate = require("../../../utils/validate");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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

/**
 * Set up form state using "forceRoomExportParameters" or defaults
 * Form fields configured in ForceRoomExportParameters are not allowed to be edited
 * Only return change handlers for editable values
 */
const useExportFormState = () => {
  const config = _ChatExport.default.getForceChatExportParameters();

  const [exportFormat, setExportFormat] = (0, _react.useState)(config.format ?? _exportUtils.ExportFormat.Html);
  const [exportType, setExportType] = (0, _react.useState)(config.range ?? _exportUtils.ExportType.Timeline);
  const [includeAttachments, setAttachments] = (0, _react.useState)(config.includeAttachments ?? false);
  const [numberOfMessages, setNumberOfMessages] = (0, _react.useState)(config.numberOfMessages ?? 100);
  const [sizeLimit, setSizeLimit] = (0, _react.useState)(config.sizeMb ?? 8);
  return {
    exportFormat,
    exportType,
    includeAttachments,
    numberOfMessages,
    sizeLimit,
    setExportFormat: !config.format ? setExportFormat : undefined,
    setExportType: !config.range ? setExportType : undefined,
    setNumberOfMessages: !config.numberOfMessages ? setNumberOfMessages : undefined,
    setSizeLimit: !config.sizeMb ? setSizeLimit : undefined,
    setAttachments: config.includeAttachments === undefined ? setAttachments : undefined
  };
};

const ExportDialog = _ref => {
  let {
    room,
    onFinished
  } = _ref;
  const {
    exportFormat,
    exportType,
    includeAttachments,
    numberOfMessages,
    sizeLimit,
    setExportFormat,
    setExportType,
    setNumberOfMessages,
    setSizeLimit,
    setAttachments
  } = useExportFormState();
  const [isExporting, setExporting] = (0, _react.useState)(false);
  const sizeLimitRef = (0, _react.useRef)();
  const messageCountRef = (0, _react.useRef)();
  const [exportProgressText, setExportProgressText] = (0, _react.useState)((0, _languageHandler._t)("Processing..."));
  const [displayCancel, setCancelWarning] = (0, _react.useState)(false);
  const [exportCancelled, setExportCancelled] = (0, _react.useState)(false);
  const [exportSuccessful, setExportSuccessful] = (0, _react.useState)(false);
  const [exporter, setExporter] = (0, _useStateCallback.useStateCallback)(null, async exporter => {
    await exporter?.export().then(() => {
      if (!exportCancelled) setExportSuccessful(true);
    });
  });

  const startExport = async () => {
    const exportOptions = {
      numberOfMessages,
      attachmentsIncluded: includeAttachments,
      maxSize: sizeLimit * 1024 * 1024
    };

    switch (exportFormat) {
      case _exportUtils.ExportFormat.Html:
        setExporter(new _HtmlExport.default(room, _exportUtils.ExportType[exportType], exportOptions, setExportProgressText));
        break;

      case _exportUtils.ExportFormat.Json:
        setExporter(new _JSONExport.default(room, _exportUtils.ExportType[exportType], exportOptions, setExportProgressText));
        break;

      case _exportUtils.ExportFormat.PlainText:
        setExporter(new _PlainTextExport.default(room, _exportUtils.ExportType[exportType], exportOptions, setExportProgressText));
        break;

      default:
        _logger.logger.error("Unknown export format");

        return;
    }
  };

  const onExportClick = async () => {
    const isValidSize = !setSizeLimit || (await sizeLimitRef.current.validate({
      focused: false
    }));

    if (!isValidSize) {
      sizeLimitRef.current.validate({
        focused: true
      });
      return;
    }

    if (exportType === _exportUtils.ExportType.LastNMessages) {
      const isValidNumberOfMessages = await messageCountRef.current.validate({
        focused: false
      });

      if (!isValidNumberOfMessages) {
        messageCountRef.current.validate({
          focused: true
        });
        return;
      }
    }

    setExporting(true);
    await startExport();
  };

  const validateSize = (0, _Validation.default)({
    rules: [{
      key: "required",

      test(_ref2) {
        let {
          value,
          allowEmpty
        } = _ref2;
        return allowEmpty || !!value;
      },

      invalid: () => {
        const min = 1;
        const max = 2000;
        return (0, _languageHandler._t)("Enter a number between %(min)s and %(max)s", {
          min,
          max
        });
      }
    }, {
      key: "number",
      test: _ref3 => {
        let {
          value
        } = _ref3;
        const parsedSize = parseInt(value, 10);
        return (0, _validate.validateNumberInRange)(1, 2000)(parsedSize);
      },
      invalid: () => {
        const min = 1;
        const max = 2000;
        return (0, _languageHandler._t)("Size can only be a number between %(min)s MB and %(max)s MB", {
          min,
          max
        });
      }
    }]
  });

  const onValidateSize = async fieldState => {
    const result = await validateSize(fieldState);
    return result;
  };

  const validateNumberOfMessages = (0, _Validation.default)({
    rules: [{
      key: "required",

      test(_ref4) {
        let {
          value,
          allowEmpty
        } = _ref4;
        return allowEmpty || !!value;
      },

      invalid: () => {
        const min = 1;
        const max = 10 ** 8;
        return (0, _languageHandler._t)("Enter a number between %(min)s and %(max)s", {
          min,
          max
        });
      }
    }, {
      key: "number",
      test: _ref5 => {
        let {
          value
        } = _ref5;
        const parsedSize = parseInt(value, 10);
        return (0, _validate.validateNumberInRange)(1, 10 ** 8)(parsedSize);
      },
      invalid: () => {
        const min = 1;
        const max = 10 ** 8;
        return (0, _languageHandler._t)("Number of messages can only be a number between %(min)s and %(max)s", {
          min,
          max
        });
      }
    }]
  });

  const onValidateNumberOfMessages = async fieldState => {
    const result = await validateNumberOfMessages(fieldState);
    return result;
  };

  const onCancel = async () => {
    if (isExporting) setCancelWarning(true);else onFinished(false);
  };

  const confirmCancel = async () => {
    await exporter?.cancelExport();
    setExportCancelled(true);
    setExporting(false);
    setExporter(null);
  };

  const exportFormatOptions = Object.keys(_exportUtils.ExportFormat).map(format => ({
    value: _exportUtils.ExportFormat[format],
    label: (0, _exportUtils.textForFormat)(_exportUtils.ExportFormat[format])
  }));
  const exportTypeOptions = Object.keys(_exportUtils.ExportType).map(type => {
    return /*#__PURE__*/_react.default.createElement("option", {
      key: type,
      value: _exportUtils.ExportType[type]
    }, (0, _exportUtils.textForType)(_exportUtils.ExportType[type]));
  });
  let messageCount = null;

  if (exportType === _exportUtils.ExportType.LastNMessages && setNumberOfMessages) {
    messageCount = /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "message-count",
      element: "input",
      type: "number",
      value: numberOfMessages.toString(),
      ref: messageCountRef,
      onValidate: onValidateNumberOfMessages,
      label: (0, _languageHandler._t)("Number of messages"),
      onChange: e => {
        setNumberOfMessages(parseInt(e.target.value));
      }
    });
  }

  const sizePostFix = /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("MB"));

  if (exportCancelled) {
    // Display successful cancellation message
    return /*#__PURE__*/_react.default.createElement(_InfoDialog.default, {
      title: (0, _languageHandler._t)("Export Cancelled"),
      description: (0, _languageHandler._t)("The export was cancelled successfully"),
      hasCloseButton: true,
      onFinished: onFinished
    });
  } else if (exportSuccessful) {
    // Display successful export message
    return /*#__PURE__*/_react.default.createElement(_InfoDialog.default, {
      title: (0, _languageHandler._t)("Export Successful"),
      description: (0, _languageHandler._t)("Your export was successful. Find it in your Downloads folder."),
      hasCloseButton: true,
      onFinished: onFinished
    });
  } else if (displayCancel) {
    // Display cancel warning
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      title: (0, _languageHandler._t)("Warning"),
      className: "mx_ExportDialog",
      contentId: "mx_Dialog_content",
      onFinished: onFinished,
      fixedWidth: true
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Are you sure you want to stop exporting your data? If you do, you'll need to start over.")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Stop"),
      primaryButtonClass: "danger",
      hasCancel: true,
      cancelButton: (0, _languageHandler._t)("Continue"),
      onCancel: () => setCancelWarning(false),
      onPrimaryButtonClick: confirmCancel
    }));
  } else {
    // Display export settings
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      title: isExporting ? (0, _languageHandler._t)("Exporting your data") : (0, _languageHandler._t)("Export Chat"),
      className: `mx_ExportDialog ${isExporting && "mx_ExportDialog_Exporting"}`,
      contentId: "mx_Dialog_content",
      hasCancel: true,
      onFinished: onFinished,
      fixedWidth: true
    }, !isExporting ? /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Select from the options below to export chats from your timeline")) : null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExportDialog_options"
    }, !!setExportFormat && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExportDialog_subheading"
    }, (0, _languageHandler._t)("Format")), /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "exportFormat",
      value: exportFormat,
      onChange: key => setExportFormat(_exportUtils.ExportFormat[key]),
      definitions: exportFormatOptions
    })), !!setExportType && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExportDialog_subheading"
    }, (0, _languageHandler._t)("Messages")), /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "export-type",
      element: "select",
      value: exportType,
      onChange: e => {
        setExportType(_exportUtils.ExportType[e.target.value]);
      }
    }, exportTypeOptions), messageCount), setSizeLimit && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExportDialog_subheading"
    }, (0, _languageHandler._t)("Size Limit")), /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "size-limit",
      type: "number",
      autoComplete: "off",
      onValidate: onValidateSize,
      element: "input",
      ref: sizeLimitRef,
      value: sizeLimit.toString(),
      postfixComponent: sizePostFix,
      onChange: e => setSizeLimit(parseInt(e.target.value))
    })), setAttachments && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      className: "mx_ExportDialog_attachments-checkbox",
      id: "include-attachments",
      checked: includeAttachments,
      onChange: e => setAttachments(e.target.checked)
    }, (0, _languageHandler._t)("Include Attachments")))), isExporting ? /*#__PURE__*/_react.default.createElement("div", {
      "data-test-id": "export-progress",
      className: "mx_ExportDialog_progress"
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      w: 24,
      h: 24
    }), /*#__PURE__*/_react.default.createElement("p", null, exportProgressText), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Cancel"),
      primaryButtonClass: "danger",
      hasCancel: false,
      onPrimaryButtonClick: onCancel
    })) : /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Export"),
      onPrimaryButtonClick: onExportClick,
      onCancel: () => onFinished(false)
    }));
  }
};

var _default = ExportDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VFeHBvcnRGb3JtU3RhdGUiLCJjb25maWciLCJDaGF0RXhwb3J0IiwiZ2V0Rm9yY2VDaGF0RXhwb3J0UGFyYW1ldGVycyIsImV4cG9ydEZvcm1hdCIsInNldEV4cG9ydEZvcm1hdCIsInVzZVN0YXRlIiwiZm9ybWF0IiwiRXhwb3J0Rm9ybWF0IiwiSHRtbCIsImV4cG9ydFR5cGUiLCJzZXRFeHBvcnRUeXBlIiwicmFuZ2UiLCJFeHBvcnRUeXBlIiwiVGltZWxpbmUiLCJpbmNsdWRlQXR0YWNobWVudHMiLCJzZXRBdHRhY2htZW50cyIsIm51bWJlck9mTWVzc2FnZXMiLCJzZXROdW1iZXJPZk1lc3NhZ2VzIiwic2l6ZUxpbWl0Iiwic2V0U2l6ZUxpbWl0Iiwic2l6ZU1iIiwidW5kZWZpbmVkIiwiRXhwb3J0RGlhbG9nIiwicm9vbSIsIm9uRmluaXNoZWQiLCJpc0V4cG9ydGluZyIsInNldEV4cG9ydGluZyIsInNpemVMaW1pdFJlZiIsInVzZVJlZiIsIm1lc3NhZ2VDb3VudFJlZiIsImV4cG9ydFByb2dyZXNzVGV4dCIsInNldEV4cG9ydFByb2dyZXNzVGV4dCIsIl90IiwiZGlzcGxheUNhbmNlbCIsInNldENhbmNlbFdhcm5pbmciLCJleHBvcnRDYW5jZWxsZWQiLCJzZXRFeHBvcnRDYW5jZWxsZWQiLCJleHBvcnRTdWNjZXNzZnVsIiwic2V0RXhwb3J0U3VjY2Vzc2Z1bCIsImV4cG9ydGVyIiwic2V0RXhwb3J0ZXIiLCJ1c2VTdGF0ZUNhbGxiYWNrIiwiZXhwb3J0IiwidGhlbiIsInN0YXJ0RXhwb3J0IiwiZXhwb3J0T3B0aW9ucyIsImF0dGFjaG1lbnRzSW5jbHVkZWQiLCJtYXhTaXplIiwiSFRNTEV4cG9ydGVyIiwiSnNvbiIsIkpTT05FeHBvcnRlciIsIlBsYWluVGV4dCIsIlBsYWluVGV4dEV4cG9ydGVyIiwibG9nZ2VyIiwiZXJyb3IiLCJvbkV4cG9ydENsaWNrIiwiaXNWYWxpZFNpemUiLCJjdXJyZW50IiwidmFsaWRhdGUiLCJmb2N1c2VkIiwiTGFzdE5NZXNzYWdlcyIsImlzVmFsaWROdW1iZXJPZk1lc3NhZ2VzIiwidmFsaWRhdGVTaXplIiwid2l0aFZhbGlkYXRpb24iLCJydWxlcyIsImtleSIsInRlc3QiLCJ2YWx1ZSIsImFsbG93RW1wdHkiLCJpbnZhbGlkIiwibWluIiwibWF4IiwicGFyc2VkU2l6ZSIsInBhcnNlSW50IiwidmFsaWRhdGVOdW1iZXJJblJhbmdlIiwib25WYWxpZGF0ZVNpemUiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGVOdW1iZXJPZk1lc3NhZ2VzIiwib25WYWxpZGF0ZU51bWJlck9mTWVzc2FnZXMiLCJvbkNhbmNlbCIsImNvbmZpcm1DYW5jZWwiLCJjYW5jZWxFeHBvcnQiLCJleHBvcnRGb3JtYXRPcHRpb25zIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsImxhYmVsIiwidGV4dEZvckZvcm1hdCIsImV4cG9ydFR5cGVPcHRpb25zIiwidHlwZSIsInRleHRGb3JUeXBlIiwibWVzc2FnZUNvdW50IiwidG9TdHJpbmciLCJlIiwidGFyZ2V0Iiwic2l6ZVBvc3RGaXgiLCJjaGVja2VkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9FeHBvcnREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VSZWYsIHVzZVN0YXRlLCBEaXNwYXRjaCwgU2V0U3RhdGVBY3Rpb24gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbWF0cml4XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IFN0eWxlZFJhZGlvR3JvdXAgZnJvbSBcIi4uL2VsZW1lbnRzL1N0eWxlZFJhZGlvR3JvdXBcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3hcIjtcbmltcG9ydCB7XG4gICAgRXhwb3J0Rm9ybWF0LFxuICAgIEV4cG9ydFR5cGUsXG4gICAgdGV4dEZvckZvcm1hdCxcbiAgICB0ZXh0Rm9yVHlwZSxcbn0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2V4cG9ydFV0aWxzL2V4cG9ydFV0aWxzXCI7XG5pbXBvcnQgd2l0aFZhbGlkYXRpb24sIHsgSUZpZWxkU3RhdGUsIElWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSBcIi4uL2VsZW1lbnRzL1ZhbGlkYXRpb25cIjtcbmltcG9ydCBIVE1MRXhwb3J0ZXIgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2V4cG9ydFV0aWxzL0h0bWxFeHBvcnRcIjtcbmltcG9ydCBKU09ORXhwb3J0ZXIgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2V4cG9ydFV0aWxzL0pTT05FeHBvcnRcIjtcbmltcG9ydCBQbGFpblRleHRFeHBvcnRlciBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvZXhwb3J0VXRpbHMvUGxhaW5UZXh0RXhwb3J0XCI7XG5pbXBvcnQgeyB1c2VTdGF0ZUNhbGxiYWNrIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVN0YXRlQ2FsbGJhY2tcIjtcbmltcG9ydCBFeHBvcnRlciBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvZXhwb3J0VXRpbHMvRXhwb3J0ZXJcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgSW5mb0RpYWxvZyBmcm9tIFwiLi9JbmZvRGlhbG9nXCI7XG5pbXBvcnQgQ2hhdEV4cG9ydCBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvQ2hhdEV4cG9ydFwiO1xuaW1wb3J0IHsgdmFsaWRhdGVOdW1iZXJJblJhbmdlIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3ZhbGlkYXRlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIHJvb206IFJvb207XG59XG5cbmludGVyZmFjZSBFeHBvcnRDb25maWcge1xuICAgIGV4cG9ydEZvcm1hdDogRXhwb3J0Rm9ybWF0O1xuICAgIGV4cG9ydFR5cGU6IEV4cG9ydFR5cGU7XG4gICAgbnVtYmVyT2ZNZXNzYWdlczogbnVtYmVyO1xuICAgIHNpemVMaW1pdDogbnVtYmVyO1xuICAgIGluY2x1ZGVBdHRhY2htZW50czogYm9vbGVhbjtcbiAgICBzZXRFeHBvcnRGb3JtYXQ/OiBEaXNwYXRjaDxTZXRTdGF0ZUFjdGlvbjxFeHBvcnRGb3JtYXQ+PjtcbiAgICBzZXRFeHBvcnRUeXBlPzogRGlzcGF0Y2g8U2V0U3RhdGVBY3Rpb248RXhwb3J0VHlwZT4+O1xuICAgIHNldEF0dGFjaG1lbnRzPzogRGlzcGF0Y2g8U2V0U3RhdGVBY3Rpb248Ym9vbGVhbj4+O1xuICAgIHNldE51bWJlck9mTWVzc2FnZXM/OiBEaXNwYXRjaDxTZXRTdGF0ZUFjdGlvbjxudW1iZXI+PjtcbiAgICBzZXRTaXplTGltaXQ/OiBEaXNwYXRjaDxTZXRTdGF0ZUFjdGlvbjxudW1iZXI+Pjtcbn1cblxuLyoqXG4gKiBTZXQgdXAgZm9ybSBzdGF0ZSB1c2luZyBcImZvcmNlUm9vbUV4cG9ydFBhcmFtZXRlcnNcIiBvciBkZWZhdWx0c1xuICogRm9ybSBmaWVsZHMgY29uZmlndXJlZCBpbiBGb3JjZVJvb21FeHBvcnRQYXJhbWV0ZXJzIGFyZSBub3QgYWxsb3dlZCB0byBiZSBlZGl0ZWRcbiAqIE9ubHkgcmV0dXJuIGNoYW5nZSBoYW5kbGVycyBmb3IgZWRpdGFibGUgdmFsdWVzXG4gKi9cbmNvbnN0IHVzZUV4cG9ydEZvcm1TdGF0ZSA9ICgpOiBFeHBvcnRDb25maWcgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IENoYXRFeHBvcnQuZ2V0Rm9yY2VDaGF0RXhwb3J0UGFyYW1ldGVycygpO1xuXG4gICAgY29uc3QgW2V4cG9ydEZvcm1hdCwgc2V0RXhwb3J0Rm9ybWF0XSA9IHVzZVN0YXRlKGNvbmZpZy5mb3JtYXQgPz8gRXhwb3J0Rm9ybWF0Lkh0bWwpO1xuICAgIGNvbnN0IFtleHBvcnRUeXBlLCBzZXRFeHBvcnRUeXBlXSA9IHVzZVN0YXRlKGNvbmZpZy5yYW5nZSA/PyBFeHBvcnRUeXBlLlRpbWVsaW5lKTtcbiAgICBjb25zdCBbaW5jbHVkZUF0dGFjaG1lbnRzLCBzZXRBdHRhY2htZW50c10gPVxuICAgICAgICB1c2VTdGF0ZShjb25maWcuaW5jbHVkZUF0dGFjaG1lbnRzID8/IGZhbHNlKTtcbiAgICBjb25zdCBbbnVtYmVyT2ZNZXNzYWdlcywgc2V0TnVtYmVyT2ZNZXNzYWdlc10gPSB1c2VTdGF0ZTxudW1iZXI+KGNvbmZpZy5udW1iZXJPZk1lc3NhZ2VzID8/IDEwMCk7XG4gICAgY29uc3QgW3NpemVMaW1pdCwgc2V0U2l6ZUxpbWl0XSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KGNvbmZpZy5zaXplTWIgPz8gOCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBleHBvcnRGb3JtYXQsXG4gICAgICAgIGV4cG9ydFR5cGUsXG4gICAgICAgIGluY2x1ZGVBdHRhY2htZW50cyxcbiAgICAgICAgbnVtYmVyT2ZNZXNzYWdlcyxcbiAgICAgICAgc2l6ZUxpbWl0LFxuICAgICAgICBzZXRFeHBvcnRGb3JtYXQ6ICFjb25maWcuZm9ybWF0ID8gc2V0RXhwb3J0Rm9ybWF0IDogdW5kZWZpbmVkLFxuICAgICAgICBzZXRFeHBvcnRUeXBlOiAhY29uZmlnLnJhbmdlID8gc2V0RXhwb3J0VHlwZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgc2V0TnVtYmVyT2ZNZXNzYWdlczogIWNvbmZpZy5udW1iZXJPZk1lc3NhZ2VzID8gc2V0TnVtYmVyT2ZNZXNzYWdlcyA6IHVuZGVmaW5lZCxcbiAgICAgICAgc2V0U2l6ZUxpbWl0OiAhY29uZmlnLnNpemVNYiA/IHNldFNpemVMaW1pdCA6IHVuZGVmaW5lZCxcbiAgICAgICAgc2V0QXR0YWNobWVudHM6IGNvbmZpZy5pbmNsdWRlQXR0YWNobWVudHMgPT09IHVuZGVmaW5lZCA/IHNldEF0dGFjaG1lbnRzIDogdW5kZWZpbmVkLFxuICAgIH07XG59O1xuXG5jb25zdCBFeHBvcnREaWFsb2c6IFJlYWN0LkZDPElQcm9wcz4gPSAoeyByb29tLCBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICBjb25zdCB7XG4gICAgICAgIGV4cG9ydEZvcm1hdCxcbiAgICAgICAgZXhwb3J0VHlwZSxcbiAgICAgICAgaW5jbHVkZUF0dGFjaG1lbnRzLFxuICAgICAgICBudW1iZXJPZk1lc3NhZ2VzLFxuICAgICAgICBzaXplTGltaXQsXG4gICAgICAgIHNldEV4cG9ydEZvcm1hdCxcbiAgICAgICAgc2V0RXhwb3J0VHlwZSxcbiAgICAgICAgc2V0TnVtYmVyT2ZNZXNzYWdlcyxcbiAgICAgICAgc2V0U2l6ZUxpbWl0LFxuICAgICAgICBzZXRBdHRhY2htZW50cyxcbiAgICB9ID0gdXNlRXhwb3J0Rm9ybVN0YXRlKCk7XG5cbiAgICBjb25zdCBbaXNFeHBvcnRpbmcsIHNldEV4cG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgc2l6ZUxpbWl0UmVmID0gdXNlUmVmPEZpZWxkPigpO1xuICAgIGNvbnN0IG1lc3NhZ2VDb3VudFJlZiA9IHVzZVJlZjxGaWVsZD4oKTtcbiAgICBjb25zdCBbZXhwb3J0UHJvZ3Jlc3NUZXh0LCBzZXRFeHBvcnRQcm9ncmVzc1RleHRdID0gdXNlU3RhdGUoX3QoXCJQcm9jZXNzaW5nLi4uXCIpKTtcbiAgICBjb25zdCBbZGlzcGxheUNhbmNlbCwgc2V0Q2FuY2VsV2FybmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2V4cG9ydENhbmNlbGxlZCwgc2V0RXhwb3J0Q2FuY2VsbGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZXhwb3J0U3VjY2Vzc2Z1bCwgc2V0RXhwb3J0U3VjY2Vzc2Z1bF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2V4cG9ydGVyLCBzZXRFeHBvcnRlcl0gPSB1c2VTdGF0ZUNhbGxiYWNrPEV4cG9ydGVyPihcbiAgICAgICAgbnVsbCxcbiAgICAgICAgYXN5bmMgKGV4cG9ydGVyOiBFeHBvcnRlcikgPT4ge1xuICAgICAgICAgICAgYXdhaXQgZXhwb3J0ZXI/LmV4cG9ydCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghZXhwb3J0Q2FuY2VsbGVkKSBzZXRFeHBvcnRTdWNjZXNzZnVsKHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgKTtcblxuICAgIGNvbnN0IHN0YXJ0RXhwb3J0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBleHBvcnRPcHRpb25zID0ge1xuICAgICAgICAgICAgbnVtYmVyT2ZNZXNzYWdlcyxcbiAgICAgICAgICAgIGF0dGFjaG1lbnRzSW5jbHVkZWQ6IGluY2x1ZGVBdHRhY2htZW50cyxcbiAgICAgICAgICAgIG1heFNpemU6IHNpemVMaW1pdCAqIDEwMjQgKiAxMDI0LFxuICAgICAgICB9O1xuICAgICAgICBzd2l0Y2ggKGV4cG9ydEZvcm1hdCkge1xuICAgICAgICAgICAgY2FzZSBFeHBvcnRGb3JtYXQuSHRtbDpcbiAgICAgICAgICAgICAgICBzZXRFeHBvcnRlcihcbiAgICAgICAgICAgICAgICAgICAgbmV3IEhUTUxFeHBvcnRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHBvcnRUeXBlW2V4cG9ydFR5cGVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0T3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEV4cG9ydFByb2dyZXNzVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBFeHBvcnRGb3JtYXQuSnNvbjpcbiAgICAgICAgICAgICAgICBzZXRFeHBvcnRlcihcbiAgICAgICAgICAgICAgICAgICAgbmV3IEpTT05FeHBvcnRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHBvcnRUeXBlW2V4cG9ydFR5cGVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0T3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEV4cG9ydFByb2dyZXNzVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBFeHBvcnRGb3JtYXQuUGxhaW5UZXh0OlxuICAgICAgICAgICAgICAgIHNldEV4cG9ydGVyKFxuICAgICAgICAgICAgICAgICAgICBuZXcgUGxhaW5UZXh0RXhwb3J0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgRXhwb3J0VHlwZVtleHBvcnRUeXBlXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydE9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRFeHBvcnRQcm9ncmVzc1RleHQsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiVW5rbm93biBleHBvcnQgZm9ybWF0XCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbkV4cG9ydENsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBpc1ZhbGlkU2l6ZSA9ICFzZXRTaXplTGltaXQgfHwgKGF3YWl0IHNpemVMaW1pdFJlZi5jdXJyZW50LnZhbGlkYXRlKHtcbiAgICAgICAgICAgIGZvY3VzZWQ6IGZhbHNlLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgaWYgKCFpc1ZhbGlkU2l6ZSkge1xuICAgICAgICAgICAgc2l6ZUxpbWl0UmVmLmN1cnJlbnQudmFsaWRhdGUoeyBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHBvcnRUeXBlID09PSBFeHBvcnRUeXBlLkxhc3ROTWVzc2FnZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzVmFsaWROdW1iZXJPZk1lc3NhZ2VzID1cbiAgICAgICAgICAgICAgICBhd2FpdCBtZXNzYWdlQ291bnRSZWYuY3VycmVudC52YWxpZGF0ZSh7IGZvY3VzZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkTnVtYmVyT2ZNZXNzYWdlcykge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VDb3VudFJlZi5jdXJyZW50LnZhbGlkYXRlKHsgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2V0RXhwb3J0aW5nKHRydWUpO1xuICAgICAgICBhd2FpdCBzdGFydEV4cG9ydCgpO1xuICAgIH07XG5cbiAgICBjb25zdCB2YWxpZGF0ZVNpemUgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdCh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93RW1wdHkgfHwgISF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWluID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF4ID0gMjAwMDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiRW50ZXIgYSBudW1iZXIgYmV0d2VlbiAlKG1pbilzIGFuZCAlKG1heClzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRTaXplID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRlTnVtYmVySW5SYW5nZSgxLCAyMDAwKShwYXJzZWRTaXplKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWluID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF4ID0gMjAwMDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJTaXplIGNhbiBvbmx5IGJlIGEgbnVtYmVyIGJldHdlZW4gJShtaW4pcyBNQiBhbmQgJShtYXgpcyBNQlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtaW4sIG1heCB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25WYWxpZGF0ZVNpemUgPSBhc3luYyAoZmllbGRTdGF0ZTogSUZpZWxkU3RhdGUpOiBQcm9taXNlPElWYWxpZGF0aW9uUmVzdWx0PiA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHZhbGlkYXRlU2l6ZShmaWVsZFN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgY29uc3QgdmFsaWRhdGVOdW1iZXJPZk1lc3NhZ2VzID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3QoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbGxvd0VtcHR5IHx8ICEhdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbiA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1heCA9IDEwICoqIDg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdChcIkVudGVyIGEgbnVtYmVyIGJldHdlZW4gJShtaW4pcyBhbmQgJShtYXgpc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXgsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiBcIm51bWJlclwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkU2l6ZSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWxpZGF0ZU51bWJlckluUmFuZ2UoMSwgMTAgKiogOCkocGFyc2VkU2l6ZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbiA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1heCA9IDEwICoqIDg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiTnVtYmVyIG9mIG1lc3NhZ2VzIGNhbiBvbmx5IGJlIGEgbnVtYmVyIGJldHdlZW4gJShtaW4pcyBhbmQgJShtYXgpc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtaW4sIG1heCB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25WYWxpZGF0ZU51bWJlck9mTWVzc2FnZXMgPSBhc3luYyAoZmllbGRTdGF0ZTogSUZpZWxkU3RhdGUpOiBQcm9taXNlPElWYWxpZGF0aW9uUmVzdWx0PiA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHZhbGlkYXRlTnVtYmVyT2ZNZXNzYWdlcyhmaWVsZFN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25DYW5jZWwgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmIChpc0V4cG9ydGluZykgc2V0Q2FuY2VsV2FybmluZyh0cnVlKTtcbiAgICAgICAgZWxzZSBvbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY29uZmlybUNhbmNlbCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgZXhwb3J0ZXI/LmNhbmNlbEV4cG9ydCgpO1xuICAgICAgICBzZXRFeHBvcnRDYW5jZWxsZWQodHJ1ZSk7XG4gICAgICAgIHNldEV4cG9ydGluZyhmYWxzZSk7XG4gICAgICAgIHNldEV4cG9ydGVyKG51bGwpO1xuICAgIH07XG5cbiAgICBjb25zdCBleHBvcnRGb3JtYXRPcHRpb25zID0gT2JqZWN0LmtleXMoRXhwb3J0Rm9ybWF0KS5tYXAoKGZvcm1hdCkgPT4gKHtcbiAgICAgICAgdmFsdWU6IEV4cG9ydEZvcm1hdFtmb3JtYXRdLFxuICAgICAgICBsYWJlbDogdGV4dEZvckZvcm1hdChFeHBvcnRGb3JtYXRbZm9ybWF0XSksXG4gICAgfSkpO1xuXG4gICAgY29uc3QgZXhwb3J0VHlwZU9wdGlvbnMgPSBPYmplY3Qua2V5cyhFeHBvcnRUeXBlKS5tYXAoKHR5cGUpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxvcHRpb24ga2V5PXt0eXBlfSB2YWx1ZT17RXhwb3J0VHlwZVt0eXBlXX0+XG4gICAgICAgICAgICAgICAgeyB0ZXh0Rm9yVHlwZShFeHBvcnRUeXBlW3R5cGVdKSB9XG4gICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgKTtcbiAgICB9KTtcblxuICAgIGxldCBtZXNzYWdlQ291bnQgPSBudWxsO1xuICAgIGlmIChleHBvcnRUeXBlID09PSBFeHBvcnRUeXBlLkxhc3ROTWVzc2FnZXMgJiYgc2V0TnVtYmVyT2ZNZXNzYWdlcykge1xuICAgICAgICBtZXNzYWdlQ291bnQgPSAoXG4gICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICBpZD1cIm1lc3NhZ2UtY291bnRcIlxuICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJpbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e251bWJlck9mTWVzc2FnZXMudG9TdHJpbmcoKX1cbiAgICAgICAgICAgICAgICByZWY9e21lc3NhZ2VDb3VudFJlZn1cbiAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXtvblZhbGlkYXRlTnVtYmVyT2ZNZXNzYWdlc31cbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOdW1iZXIgb2YgbWVzc2FnZXNcIil9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldE51bWJlck9mTWVzc2FnZXMocGFyc2VJbnQoZS50YXJnZXQudmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBzaXplUG9zdEZpeCA9IDxzcGFuPnsgX3QoXCJNQlwiKSB9PC9zcGFuPjtcblxuICAgIGlmIChleHBvcnRDYW5jZWxsZWQpIHtcbiAgICAgICAgLy8gRGlzcGxheSBzdWNjZXNzZnVsIGNhbmNlbGxhdGlvbiBtZXNzYWdlXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8SW5mb0RpYWxvZ1xuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkV4cG9ydCBDYW5jZWxsZWRcIil9XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e190KFwiVGhlIGV4cG9ydCB3YXMgY2FuY2VsbGVkIHN1Y2Nlc3NmdWxseVwiKX1cbiAgICAgICAgICAgICAgICBoYXNDbG9zZUJ1dHRvbj17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGV4cG9ydFN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgLy8gRGlzcGxheSBzdWNjZXNzZnVsIGV4cG9ydCBtZXNzYWdlXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8SW5mb0RpYWxvZ1xuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkV4cG9ydCBTdWNjZXNzZnVsXCIpfVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtfdChcbiAgICAgICAgICAgICAgICAgICAgXCJZb3VyIGV4cG9ydCB3YXMgc3VjY2Vzc2Z1bC4gRmluZCBpdCBpbiB5b3VyIERvd25sb2FkcyBmb2xkZXIuXCIsXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICBoYXNDbG9zZUJ1dHRvbj17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGRpc3BsYXlDYW5jZWwpIHtcbiAgICAgICAgLy8gRGlzcGxheSBjYW5jZWwgd2FybmluZ1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJXYXJuaW5nXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4cG9ydERpYWxvZ1wiXG4gICAgICAgICAgICAgICAgY29udGVudElkPVwibXhfRGlhbG9nX2NvbnRlbnRcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgZml4ZWRXaWR0aD17dHJ1ZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHN0b3AgZXhwb3J0aW5nIHlvdXIgZGF0YT8gSWYgeW91IGRvLCB5b3UnbGwgbmVlZCB0byBzdGFydCBvdmVyLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXCJTdG9wXCIpfVxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uQ2xhc3M9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbj17X3QoXCJDb250aW51ZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9eygpID0+IHNldENhbmNlbFdhcm5pbmcoZmFsc2UpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17Y29uZmlybUNhbmNlbH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIERpc3BsYXkgZXhwb3J0IHNldHRpbmdzXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIHRpdGxlPXtpc0V4cG9ydGluZyA/IF90KFwiRXhwb3J0aW5nIHlvdXIgZGF0YVwiKSA6IF90KFwiRXhwb3J0IENoYXRcIil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgbXhfRXhwb3J0RGlhbG9nICR7aXNFeHBvcnRpbmcgJiYgXCJteF9FeHBvcnREaWFsb2dfRXhwb3J0aW5nXCJ9YH1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9XCJteF9EaWFsb2dfY29udGVudFwiXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgZml4ZWRXaWR0aD17dHJ1ZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7ICFpc0V4cG9ydGluZyA/IDxwPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJTZWxlY3QgZnJvbSB0aGUgb3B0aW9ucyBiZWxvdyB0byBleHBvcnQgY2hhdHMgZnJvbSB5b3VyIHRpbWVsaW5lXCIsXG4gICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgIDwvcD4gOiBudWxsIH1cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXhwb3J0RGlhbG9nX29wdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgeyAhIXNldEV4cG9ydEZvcm1hdCAmJiA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhwb3J0RGlhbG9nX3N1YmhlYWRpbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiRm9ybWF0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvR3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwiZXhwb3J0Rm9ybWF0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17ZXhwb3J0Rm9ybWF0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoa2V5KSA9PiBzZXRFeHBvcnRGb3JtYXQoRXhwb3J0Rm9ybWF0W2tleV0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb25zPXtleHBvcnRGb3JtYXRPcHRpb25zfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+IH1cblxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAhIXNldEV4cG9ydFR5cGUgJiYgPD5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V4cG9ydERpYWxvZ19zdWJoZWFkaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJNZXNzYWdlc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwiZXhwb3J0LXR5cGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50PVwic2VsZWN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2V4cG9ydFR5cGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RXhwb3J0VHlwZShFeHBvcnRUeXBlW2UudGFyZ2V0LnZhbHVlXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGV4cG9ydFR5cGVPcHRpb25zIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZpZWxkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbWVzc2FnZUNvdW50IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgeyBzZXRTaXplTGltaXQgJiYgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V4cG9ydERpYWxvZ19zdWJoZWFkaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlNpemUgTGltaXRcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cInNpemUtbGltaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17b25WYWxpZGF0ZVNpemV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cImlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3NpemVMaW1pdFJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17c2l6ZUxpbWl0LnRvU3RyaW5nKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGZpeENvbXBvbmVudD17c2l6ZVBvc3RGaXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRTaXplTGltaXQocGFyc2VJbnQoZS50YXJnZXQudmFsdWUpKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPiB9XG5cbiAgICAgICAgICAgICAgICAgICAgeyBzZXRBdHRhY2htZW50cyAmJiA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZENoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhwb3J0RGlhbG9nX2F0dGFjaG1lbnRzLWNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cImluY2x1ZGUtYXR0YWNobWVudHNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2luY2x1ZGVBdHRhY2htZW50c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEF0dGFjaG1lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLmNoZWNrZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkluY2x1ZGUgQXR0YWNobWVudHNcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWRDaGVja2JveD5cbiAgICAgICAgICAgICAgICAgICAgPC8+IH1cblxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgaXNFeHBvcnRpbmcgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgZGF0YS10ZXN0LWlkPSdleHBvcnQtcHJvZ3Jlc3MnIGNsYXNzTmFtZT1cIm14X0V4cG9ydERpYWxvZ19wcm9ncmVzc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgdz17MjR9IGg9ezI0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBleHBvcnRQcm9ncmVzc1RleHQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIkNhbmNlbFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uQ2xhc3M9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiRXhwb3J0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e29uRXhwb3J0Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17KCkgPT4gb25GaW5pc2hlZChmYWxzZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQg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