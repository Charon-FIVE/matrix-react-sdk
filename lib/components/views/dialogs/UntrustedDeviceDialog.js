"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _E2EIcon = _interopRequireWildcard(require("../rooms/E2EIcon"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019, 2020, 2021 The Matrix.org Foundation C.I.C.

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
const UntrustedDeviceDialog = _ref => {
  let {
    device,
    user,
    onFinished
  } = _ref;
  let askToVerifyText;
  let newSessionText;

  if (_MatrixClientPeg.MatrixClientPeg.get().getUserId() === user.userId) {
    newSessionText = (0, _languageHandler._t)("You signed in to a new session without verifying it:");
    askToVerifyText = (0, _languageHandler._t)("Verify your other session using one of the options below.");
  } else {
    newSessionText = (0, _languageHandler._t)("%(name)s (%(userId)s) signed in to a new session without verifying it:", {
      name: user.displayName,
      userId: user.userId
    });
    askToVerifyText = (0, _languageHandler._t)("Ask this user to verify their session, or manually verify it below.");
  }

  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    onFinished: onFinished,
    className: "mx_UntrustedDeviceDialog",
    title: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
      status: _E2EIcon.E2EState.Warning,
      size: 24,
      hideTooltip: true
    }), (0, _languageHandler._t)("Not Trusted"))
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Dialog_content",
    id: "mx_Dialog_content"
  }, /*#__PURE__*/_react.default.createElement("p", null, newSessionText), /*#__PURE__*/_react.default.createElement("p", null, device.getDisplayName(), " (", device.deviceId, ")"), /*#__PURE__*/_react.default.createElement("p", null, askToVerifyText)), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Dialog_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary_outline",
    onClick: () => onFinished("legacy")
  }, (0, _languageHandler._t)("Manually verify by text")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary_outline",
    onClick: () => onFinished("sas")
  }, (0, _languageHandler._t)("Interactively verify by emoji")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    onClick: () => onFinished(false)
  }, (0, _languageHandler._t)("Done"))));
};

var _default = UntrustedDeviceDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVbnRydXN0ZWREZXZpY2VEaWFsb2ciLCJkZXZpY2UiLCJ1c2VyIiwib25GaW5pc2hlZCIsImFza1RvVmVyaWZ5VGV4dCIsIm5ld1Nlc3Npb25UZXh0IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VXNlcklkIiwidXNlcklkIiwiX3QiLCJuYW1lIiwiZGlzcGxheU5hbWUiLCJFMkVTdGF0ZSIsIldhcm5pbmciLCJnZXREaXNwbGF5TmFtZSIsImRldmljZUlkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9VbnRydXN0ZWREZXZpY2VEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3VzZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgRTJFSWNvbiwgeyBFMkVTdGF0ZSB9IGZyb20gXCIuLi9yb29tcy9FMkVJY29uXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgeyBJRGV2aWNlIH0gZnJvbSBcIi4uL3JpZ2h0X3BhbmVsL1VzZXJJbmZvXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIHVzZXI6IFVzZXI7XG4gICAgZGV2aWNlOiBJRGV2aWNlO1xufVxuXG5jb25zdCBVbnRydXN0ZWREZXZpY2VEaWFsb2c6IFJlYWN0LkZDPElQcm9wcz4gPSAoeyBkZXZpY2UsIHVzZXIsIG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGxldCBhc2tUb1ZlcmlmeVRleHQ7XG4gICAgbGV0IG5ld1Nlc3Npb25UZXh0O1xuXG4gICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSA9PT0gdXNlci51c2VySWQpIHtcbiAgICAgICAgbmV3U2Vzc2lvblRleHQgPSBfdChcIllvdSBzaWduZWQgaW4gdG8gYSBuZXcgc2Vzc2lvbiB3aXRob3V0IHZlcmlmeWluZyBpdDpcIik7XG4gICAgICAgIGFza1RvVmVyaWZ5VGV4dCA9IF90KFwiVmVyaWZ5IHlvdXIgb3RoZXIgc2Vzc2lvbiB1c2luZyBvbmUgb2YgdGhlIG9wdGlvbnMgYmVsb3cuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Nlc3Npb25UZXh0ID0gX3QoXCIlKG5hbWUpcyAoJSh1c2VySWQpcykgc2lnbmVkIGluIHRvIGEgbmV3IHNlc3Npb24gd2l0aG91dCB2ZXJpZnlpbmcgaXQ6XCIsXG4gICAgICAgICAgICB7IG5hbWU6IHVzZXIuZGlzcGxheU5hbWUsIHVzZXJJZDogdXNlci51c2VySWQgfSk7XG4gICAgICAgIGFza1RvVmVyaWZ5VGV4dCA9IF90KFwiQXNrIHRoaXMgdXNlciB0byB2ZXJpZnkgdGhlaXIgc2Vzc2lvbiwgb3IgbWFudWFsbHkgdmVyaWZ5IGl0IGJlbG93LlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gPEJhc2VEaWFsb2dcbiAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfVW50cnVzdGVkRGV2aWNlRGlhbG9nXCJcbiAgICAgICAgdGl0bGU9ezw+XG4gICAgICAgICAgICA8RTJFSWNvbiBzdGF0dXM9e0UyRVN0YXRlLldhcm5pbmd9IHNpemU9ezI0fSBoaWRlVG9vbHRpcD17dHJ1ZX0gLz5cbiAgICAgICAgICAgIHsgX3QoXCJOb3QgVHJ1c3RlZFwiKSB9XG4gICAgICAgIDwvPn1cbiAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIiBpZD0nbXhfRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgPHA+eyBuZXdTZXNzaW9uVGV4dCB9PC9wPlxuICAgICAgICAgICAgPHA+eyBkZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSB9ICh7IGRldmljZS5kZXZpY2VJZCB9KTwvcD5cbiAgICAgICAgICAgIDxwPnsgYXNrVG9WZXJpZnlUZXh0IH08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRGlhbG9nX2J1dHRvbnMnPlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlfb3V0bGluZVwiIG9uQ2xpY2s9eygpID0+IG9uRmluaXNoZWQoXCJsZWdhY3lcIil9PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJNYW51YWxseSB2ZXJpZnkgYnkgdGV4dFwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeV9vdXRsaW5lXCIgb25DbGljaz17KCkgPT4gb25GaW5pc2hlZChcInNhc1wiKX0+XG4gICAgICAgICAgICAgICAgeyBfdChcIkludGVyYWN0aXZlbHkgdmVyaWZ5IGJ5IGVtb2ppXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17KCkgPT4gb25GaW5pc2hlZChmYWxzZSl9PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJEb25lXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9CYXNlRGlhbG9nPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVudHJ1c3RlZERldmljZURpYWxvZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0JBLE1BQU1BLHFCQUF1QyxHQUFHLFFBQWtDO0VBQUEsSUFBakM7SUFBRUMsTUFBRjtJQUFVQyxJQUFWO0lBQWdCQztFQUFoQixDQUFpQztFQUM5RSxJQUFJQyxlQUFKO0VBQ0EsSUFBSUMsY0FBSjs7RUFFQSxJQUFJQyxnQ0FBQSxDQUFnQkMsR0FBaEIsR0FBc0JDLFNBQXRCLE9BQXNDTixJQUFJLENBQUNPLE1BQS9DLEVBQXVEO0lBQ25ESixjQUFjLEdBQUcsSUFBQUssbUJBQUEsRUFBRyxzREFBSCxDQUFqQjtJQUNBTixlQUFlLEdBQUcsSUFBQU0sbUJBQUEsRUFBRywyREFBSCxDQUFsQjtFQUNILENBSEQsTUFHTztJQUNITCxjQUFjLEdBQUcsSUFBQUssbUJBQUEsRUFBRyx3RUFBSCxFQUNiO01BQUVDLElBQUksRUFBRVQsSUFBSSxDQUFDVSxXQUFiO01BQTBCSCxNQUFNLEVBQUVQLElBQUksQ0FBQ087SUFBdkMsQ0FEYSxDQUFqQjtJQUVBTCxlQUFlLEdBQUcsSUFBQU0sbUJBQUEsRUFBRyxxRUFBSCxDQUFsQjtFQUNIOztFQUVELG9CQUFPLDZCQUFDLG1CQUFEO0lBQ0gsVUFBVSxFQUFFUCxVQURUO0lBRUgsU0FBUyxFQUFDLDBCQUZQO0lBR0gsS0FBSyxlQUFFLHlFQUNILDZCQUFDLGdCQUFEO01BQVMsTUFBTSxFQUFFVSxpQkFBQSxDQUFTQyxPQUExQjtNQUFtQyxJQUFJLEVBQUUsRUFBekM7TUFBNkMsV0FBVyxFQUFFO0lBQTFELEVBREcsRUFFRCxJQUFBSixtQkFBQSxFQUFHLGFBQUgsQ0FGQztFQUhKLGdCQVFIO0lBQUssU0FBUyxFQUFDLG1CQUFmO0lBQW1DLEVBQUUsRUFBQztFQUF0QyxnQkFDSSx3Q0FBS0wsY0FBTCxDQURKLGVBRUksd0NBQUtKLE1BQU0sQ0FBQ2MsY0FBUCxFQUFMLFFBQWtDZCxNQUFNLENBQUNlLFFBQXpDLE1BRkosZUFHSSx3Q0FBS1osZUFBTCxDQUhKLENBUkcsZUFhSDtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJLDZCQUFDLHlCQUFEO0lBQWtCLElBQUksRUFBQyxpQkFBdkI7SUFBeUMsT0FBTyxFQUFFLE1BQU1ELFVBQVUsQ0FBQyxRQUFEO0VBQWxFLEdBQ00sSUFBQU8sbUJBQUEsRUFBRyx5QkFBSCxDQUROLENBREosZUFJSSw2QkFBQyx5QkFBRDtJQUFrQixJQUFJLEVBQUMsaUJBQXZCO0lBQXlDLE9BQU8sRUFBRSxNQUFNUCxVQUFVLENBQUMsS0FBRDtFQUFsRSxHQUNNLElBQUFPLG1CQUFBLEVBQUcsK0JBQUgsQ0FETixDQUpKLGVBT0ksNkJBQUMseUJBQUQ7SUFBa0IsSUFBSSxFQUFDLFNBQXZCO0lBQWlDLE9BQU8sRUFBRSxNQUFNUCxVQUFVLENBQUMsS0FBRDtFQUExRCxHQUNNLElBQUFPLG1CQUFBLEVBQUcsTUFBSCxDQUROLENBUEosQ0FiRyxDQUFQO0FBeUJILENBdENEOztlQXdDZVYscUIifQ==