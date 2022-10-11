"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
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
const KeySignatureUploadFailedDialog = _ref => {
  let {
    failures,
    source,
    continuation,
    onFinished
  } = _ref;
  const RETRIES = 2;
  const [retry, setRetry] = (0, _react.useState)(RETRIES);
  const [cancelled, setCancelled] = (0, _react.useState)(false);
  const [retrying, setRetrying] = (0, _react.useState)(false);
  const [success, setSuccess] = (0, _react.useState)(false);
  const onCancel = (0, _react.useRef)(onFinished);
  const causes = new Map([["_afterCrossSigningLocalKeyChange", (0, _languageHandler._t)("a new master key signature")], ["checkOwnCrossSigningTrust", (0, _languageHandler._t)("a new cross-signing key signature")], ["setDeviceVerification", (0, _languageHandler._t)("a device cross-signing signature")]]);
  const defaultCause = (0, _languageHandler._t)("a key signature");
  const onRetry = (0, _react.useCallback)(async () => {
    try {
      setRetrying(true);
      const cancel = new Promise((resolve, reject) => {
        onCancel.current = reject;
      }).finally(() => {
        setCancelled(true);
      });
      await Promise.race([continuation(), cancel]);
      setSuccess(true);
    } catch (e) {
      setRetry(r => r - 1);
    } finally {
      onCancel.current = onFinished;
      setRetrying(false);
    }
  }, [continuation, onFinished]);
  let body;

  if (!success && !cancelled && continuation && retry > 0) {
    const reason = causes.get(source) || defaultCause;

    const brand = _SdkConfig.default.get().brand;

    body = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("%(brand)s encountered an error during upload of:", {
      brand
    })), /*#__PURE__*/_react.default.createElement("p", null, reason), retrying && /*#__PURE__*/_react.default.createElement(_Spinner.default, null), /*#__PURE__*/_react.default.createElement("pre", null, JSON.stringify(failures, null, 2)), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: "Retry",
      hasCancel: true,
      onPrimaryButtonClick: onRetry,
      onCancel: onCancel.current,
      primaryDisabled: retrying
    }));
  } else {
    body = /*#__PURE__*/_react.default.createElement("div", null, success ? /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Upload completed")) : cancelled ? /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Cancelled signature upload")) : /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Unable to upload")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("OK"),
      hasCancel: false,
      onPrimaryButtonClick: onFinished
    }));
  }

  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    title: success ? (0, _languageHandler._t)("Signature upload success") : (0, _languageHandler._t)("Signature upload failed"),
    fixedWidth: false,
    onFinished: () => {}
  }, body);
};

var _default = KeySignatureUploadFailedDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlTaWduYXR1cmVVcGxvYWRGYWlsZWREaWFsb2ciLCJmYWlsdXJlcyIsInNvdXJjZSIsImNvbnRpbnVhdGlvbiIsIm9uRmluaXNoZWQiLCJSRVRSSUVTIiwicmV0cnkiLCJzZXRSZXRyeSIsInVzZVN0YXRlIiwiY2FuY2VsbGVkIiwic2V0Q2FuY2VsbGVkIiwicmV0cnlpbmciLCJzZXRSZXRyeWluZyIsInN1Y2Nlc3MiLCJzZXRTdWNjZXNzIiwib25DYW5jZWwiLCJ1c2VSZWYiLCJjYXVzZXMiLCJNYXAiLCJfdCIsImRlZmF1bHRDYXVzZSIsIm9uUmV0cnkiLCJ1c2VDYWxsYmFjayIsImNhbmNlbCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiY3VycmVudCIsImZpbmFsbHkiLCJyYWNlIiwiZSIsInIiLCJib2R5IiwicmVhc29uIiwiZ2V0IiwiYnJhbmQiLCJTZGtDb25maWciLCJKU09OIiwic3RyaW5naWZ5Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9LZXlTaWduYXR1cmVVcGxvYWRGYWlsZWREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgZmFpbHVyZXM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHtcbiAgICAgICAgZXJyY29kZTogc3RyaW5nO1xuICAgICAgICBlcnJvcjogc3RyaW5nO1xuICAgIH0+PjtcbiAgICBzb3VyY2U6IHN0cmluZztcbiAgICBjb250aW51YXRpb246ICgpID0+IFByb21pc2U8dm9pZD47XG59XG5cbmNvbnN0IEtleVNpZ25hdHVyZVVwbG9hZEZhaWxlZERpYWxvZzogUmVhY3QuRkM8SVByb3BzPiA9ICh7XG4gICAgZmFpbHVyZXMsXG4gICAgc291cmNlLFxuICAgIGNvbnRpbnVhdGlvbixcbiAgICBvbkZpbmlzaGVkLFxufSkgPT4ge1xuICAgIGNvbnN0IFJFVFJJRVMgPSAyO1xuICAgIGNvbnN0IFtyZXRyeSwgc2V0UmV0cnldID0gdXNlU3RhdGUoUkVUUklFUyk7XG4gICAgY29uc3QgW2NhbmNlbGxlZCwgc2V0Q2FuY2VsbGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbcmV0cnlpbmcsIHNldFJldHJ5aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbc3VjY2Vzcywgc2V0U3VjY2Vzc10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgb25DYW5jZWwgPSB1c2VSZWYob25GaW5pc2hlZCk7XG5cbiAgICBjb25zdCBjYXVzZXMgPSBuZXcgTWFwKFtcbiAgICAgICAgW1wiX2FmdGVyQ3Jvc3NTaWduaW5nTG9jYWxLZXlDaGFuZ2VcIiwgX3QoXCJhIG5ldyBtYXN0ZXIga2V5IHNpZ25hdHVyZVwiKV0sXG4gICAgICAgIFtcImNoZWNrT3duQ3Jvc3NTaWduaW5nVHJ1c3RcIiwgX3QoXCJhIG5ldyBjcm9zcy1zaWduaW5nIGtleSBzaWduYXR1cmVcIildLFxuICAgICAgICBbXCJzZXREZXZpY2VWZXJpZmljYXRpb25cIiwgX3QoXCJhIGRldmljZSBjcm9zcy1zaWduaW5nIHNpZ25hdHVyZVwiKV0sXG4gICAgXSk7XG4gICAgY29uc3QgZGVmYXVsdENhdXNlID0gX3QoXCJhIGtleSBzaWduYXR1cmVcIik7XG5cbiAgICBjb25zdCBvblJldHJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0UmV0cnlpbmcodHJ1ZSk7XG4gICAgICAgICAgICBjb25zdCBjYW5jZWwgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgb25DYW5jZWwuY3VycmVudCA9IHJlamVjdDtcbiAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldENhbmNlbGxlZCh0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgICAgICAgICBjb250aW51YXRpb24oKSxcbiAgICAgICAgICAgICAgICBjYW5jZWwsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHNldFN1Y2Nlc3ModHJ1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHNldFJldHJ5KHIgPT4gci0xKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIG9uQ2FuY2VsLmN1cnJlbnQgPSBvbkZpbmlzaGVkO1xuICAgICAgICAgICAgc2V0UmV0cnlpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2NvbnRpbnVhdGlvbiwgb25GaW5pc2hlZF0pO1xuXG4gICAgbGV0IGJvZHk7XG4gICAgaWYgKCFzdWNjZXNzICYmICFjYW5jZWxsZWQgJiYgY29udGludWF0aW9uICYmIHJldHJ5ID4gMCkge1xuICAgICAgICBjb25zdCByZWFzb24gPSBjYXVzZXMuZ2V0KHNvdXJjZSkgfHwgZGVmYXVsdENhdXNlO1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcblxuICAgICAgICBib2R5ID0gKDxkaXY+XG4gICAgICAgICAgICA8cD57IF90KFwiJShicmFuZClzIGVuY291bnRlcmVkIGFuIGVycm9yIGR1cmluZyB1cGxvYWQgb2Y6XCIsIHsgYnJhbmQgfSkgfTwvcD5cbiAgICAgICAgICAgIDxwPnsgcmVhc29uIH08L3A+XG4gICAgICAgICAgICB7IHJldHJ5aW5nICYmIDxTcGlubmVyIC8+IH1cbiAgICAgICAgICAgIDxwcmU+eyBKU09OLnN0cmluZ2lmeShmYWlsdXJlcywgbnVsbCwgMikgfTwvcHJlPlxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPSdSZXRyeSdcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e29uUmV0cnl9XG4gICAgICAgICAgICAgICAgb25DYW5jZWw9e29uQ2FuY2VsLmN1cnJlbnR9XG4gICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXtyZXRyeWluZ31cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYm9keSA9ICg8ZGl2PlxuICAgICAgICAgICAgeyBzdWNjZXNzID9cbiAgICAgICAgICAgICAgICA8c3Bhbj57IF90KFwiVXBsb2FkIGNvbXBsZXRlZFwiKSB9PC9zcGFuPiA6XG4gICAgICAgICAgICAgICAgY2FuY2VsbGVkID9cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+eyBfdChcIkNhbmNlbGxlZCBzaWduYXR1cmUgdXBsb2FkXCIpIH08L3NwYW4+IDpcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+eyBfdChcIlVuYWJsZSB0byB1cGxvYWRcIikgfTwvc3Bhbj4gfVxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIk9LXCIpfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e29uRmluaXNoZWR9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj4pO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICB0aXRsZT17c3VjY2VzcyA/XG4gICAgICAgICAgICAgICAgX3QoXCJTaWduYXR1cmUgdXBsb2FkIHN1Y2Nlc3NcIikgOlxuICAgICAgICAgICAgICAgIF90KFwiU2lnbmF0dXJlIHVwbG9hZCBmYWlsZWRcIil9XG4gICAgICAgICAgICBmaXhlZFdpZHRoPXtmYWxzZX1cbiAgICAgICAgICAgIG9uRmluaXNoZWQ9eygpID0+IHt9fVxuICAgICAgICA+XG4gICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEtleVNpZ25hdHVyZVVwbG9hZEZhaWxlZERpYWxvZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBb0JBLE1BQU1BLDhCQUFnRCxHQUFHLFFBS25EO0VBQUEsSUFMb0Q7SUFDdERDLFFBRHNEO0lBRXREQyxNQUZzRDtJQUd0REMsWUFIc0Q7SUFJdERDO0VBSnNELENBS3BEO0VBQ0YsTUFBTUMsT0FBTyxHQUFHLENBQWhCO0VBQ0EsTUFBTSxDQUFDQyxLQUFELEVBQVFDLFFBQVIsSUFBb0IsSUFBQUMsZUFBQSxFQUFTSCxPQUFULENBQTFCO0VBQ0EsTUFBTSxDQUFDSSxTQUFELEVBQVlDLFlBQVosSUFBNEIsSUFBQUYsZUFBQSxFQUFTLEtBQVQsQ0FBbEM7RUFDQSxNQUFNLENBQUNHLFFBQUQsRUFBV0MsV0FBWCxJQUEwQixJQUFBSixlQUFBLEVBQVMsS0FBVCxDQUFoQztFQUNBLE1BQU0sQ0FBQ0ssT0FBRCxFQUFVQyxVQUFWLElBQXdCLElBQUFOLGVBQUEsRUFBUyxLQUFULENBQTlCO0VBQ0EsTUFBTU8sUUFBUSxHQUFHLElBQUFDLGFBQUEsRUFBT1osVUFBUCxDQUFqQjtFQUVBLE1BQU1hLE1BQU0sR0FBRyxJQUFJQyxHQUFKLENBQVEsQ0FDbkIsQ0FBQyxrQ0FBRCxFQUFxQyxJQUFBQyxtQkFBQSxFQUFHLDRCQUFILENBQXJDLENBRG1CLEVBRW5CLENBQUMsMkJBQUQsRUFBOEIsSUFBQUEsbUJBQUEsRUFBRyxtQ0FBSCxDQUE5QixDQUZtQixFQUduQixDQUFDLHVCQUFELEVB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