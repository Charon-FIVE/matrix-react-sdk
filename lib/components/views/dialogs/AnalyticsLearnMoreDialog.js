"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showDialog = exports.ButtonClicked = exports.AnalyticsLearnMoreDialog = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _languageHandler = require("../../../languageHandler");

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _AnalyticsToast = require("../../../toasts/AnalyticsToast");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

let ButtonClicked;
exports.ButtonClicked = ButtonClicked;

(function (ButtonClicked) {
  ButtonClicked[ButtonClicked["Primary"] = 0] = "Primary";
  ButtonClicked[ButtonClicked["Cancel"] = 1] = "Cancel";
})(ButtonClicked || (exports.ButtonClicked = ButtonClicked = {}));

const AnalyticsLearnMoreDialog = _ref => {
  let {
    onFinished,
    analyticsOwner,
    privacyPolicyUrl,
    primaryButton,
    cancelButton,
    hasCancel
  } = _ref;

  const onPrimaryButtonClick = () => onFinished && onFinished(ButtonClicked.Primary);

  const onCancelButtonClick = () => onFinished && onFinished(ButtonClicked.Cancel);

  const privacyPolicyLink = privacyPolicyUrl ? /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("You can read all our terms <PrivacyPolicyUrl>here</PrivacyPolicyUrl>", {}, {
    "PrivacyPolicyUrl": sub => {
      return /*#__PURE__*/_react.default.createElement("a", {
        href: privacyPolicyUrl,
        rel: "norefferer noopener",
        target: "_blank"
      }, sub, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_AnalyticsPolicyLink"
      }));
    }
  })) : "";
  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    className: "mx_AnalyticsLearnMoreDialog",
    contentId: "mx_AnalyticsLearnMore",
    title: (0, _languageHandler._t)("Help improve %(analyticsOwner)s", {
      analyticsOwner
    }),
    onFinished: onFinished
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Dialog_content"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AnalyticsLearnMore_image_holder"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AnalyticsLearnMore_copy"
  }, (0, _languageHandler._t)("Help us identify issues and improve %(analyticsOwner)s by sharing anonymous usage data. " + "To understand how people use multiple devices, we'll generate a random identifier, " + "shared by your devices.", {
    analyticsOwner
  })), /*#__PURE__*/_react.default.createElement("ul", {
    className: "mx_AnalyticsLearnMore_bullets"
  }, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("We <Bold>don't</Bold> record or profile any account data", {}, {
    "Bold": sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
  })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("We <Bold>don't</Bold> share information with third parties", {}, {
    "Bold": sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
  })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("You can turn this off anytime in settings"))), privacyPolicyLink), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
    primaryButton: primaryButton,
    cancelButton: cancelButton,
    onPrimaryButtonClick: onPrimaryButtonClick,
    onCancel: onCancelButtonClick,
    hasCancel: hasCancel
  }));
};

exports.AnalyticsLearnMoreDialog = AnalyticsLearnMoreDialog;

const showDialog = props => {
  const privacyPolicyUrl = (0, _AnalyticsToast.getPolicyUrl)();

  const analyticsOwner = _SdkConfig.default.get("analytics_owner") ?? _SdkConfig.default.get("brand");

  _Modal.default.createDialog(AnalyticsLearnMoreDialog, _objectSpread({
    privacyPolicyUrl,
    analyticsOwner
  }, props), "mx_AnalyticsLearnMoreDialog_wrapper");
};

exports.showDialog = showDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25DbGlja2VkIiwiQW5hbHl0aWNzTGVhcm5Nb3JlRGlhbG9nIiwib25GaW5pc2hlZCIsImFuYWx5dGljc093bmVyIiwicHJpdmFjeVBvbGljeVVybCIsInByaW1hcnlCdXR0b24iLCJjYW5jZWxCdXR0b24iLCJoYXNDYW5jZWwiLCJvblByaW1hcnlCdXR0b25DbGljayIsIlByaW1hcnkiLCJvbkNhbmNlbEJ1dHRvbkNsaWNrIiwiQ2FuY2VsIiwicHJpdmFjeVBvbGljeUxpbmsiLCJfdCIsInN1YiIsInNob3dEaWFsb2ciLCJwcm9wcyIsImdldFBvbGljeVVybCIsIlNka0NvbmZpZyIsImdldCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9BbmFseXRpY3NMZWFybk1vcmVEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBnZXRQb2xpY3lVcmwgfSBmcm9tIFwiLi4vLi4vLi4vdG9hc3RzL0FuYWx5dGljc1RvYXN0XCI7XG5cbmV4cG9ydCBlbnVtIEJ1dHRvbkNsaWNrZWQge1xuICAgIFByaW1hcnksXG4gICAgQ2FuY2VsLFxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvbkZpbmlzaGVkPyhidXR0b25DbGlja2VkPzogQnV0dG9uQ2xpY2tlZCk6IHZvaWQ7XG4gICAgYW5hbHl0aWNzT3duZXI6IHN0cmluZztcbiAgICBwcml2YWN5UG9saWN5VXJsPzogc3RyaW5nO1xuICAgIHByaW1hcnlCdXR0b24/OiBzdHJpbmc7XG4gICAgY2FuY2VsQnV0dG9uPzogc3RyaW5nO1xuICAgIGhhc0NhbmNlbD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBBbmFseXRpY3NMZWFybk1vcmVEaWFsb2c6IFJlYWN0LkZDPElQcm9wcz4gPSAoe1xuICAgIG9uRmluaXNoZWQsXG4gICAgYW5hbHl0aWNzT3duZXIsXG4gICAgcHJpdmFjeVBvbGljeVVybCxcbiAgICBwcmltYXJ5QnV0dG9uLFxuICAgIGNhbmNlbEJ1dHRvbixcbiAgICBoYXNDYW5jZWwsXG59KSA9PiB7XG4gICAgY29uc3Qgb25QcmltYXJ5QnV0dG9uQ2xpY2sgPSAoKSA9PiBvbkZpbmlzaGVkICYmIG9uRmluaXNoZWQoQnV0dG9uQ2xpY2tlZC5QcmltYXJ5KTtcbiAgICBjb25zdCBvbkNhbmNlbEJ1dHRvbkNsaWNrID0gKCkgPT4gb25GaW5pc2hlZCAmJiBvbkZpbmlzaGVkKEJ1dHRvbkNsaWNrZWQuQ2FuY2VsKTtcbiAgICBjb25zdCBwcml2YWN5UG9saWN5TGluayA9IHByaXZhY3lQb2xpY3lVcmwgP1xuICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfdChcIllvdSBjYW4gcmVhZCBhbGwgb3VyIHRlcm1zIDxQcml2YWN5UG9saWN5VXJsPmhlcmU8L1ByaXZhY3lQb2xpY3lVcmw+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgIFwiUHJpdmFjeVBvbGljeVVybFwiOiAoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGEgaHJlZj17cHJpdmFjeVBvbGljeVVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9XCJub3JlZmZlcmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BbmFseXRpY3NQb2xpY3lMaW5rXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT47XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zcGFuPiA6IFwiXCI7XG4gICAgcmV0dXJuIDxCYXNlRGlhbG9nXG4gICAgICAgIGNsYXNzTmFtZT1cIm14X0FuYWx5dGljc0xlYXJuTW9yZURpYWxvZ1wiXG4gICAgICAgIGNvbnRlbnRJZD1cIm14X0FuYWx5dGljc0xlYXJuTW9yZVwiXG4gICAgICAgIHRpdGxlPXtfdChcIkhlbHAgaW1wcm92ZSAlKGFuYWx5dGljc093bmVyKXNcIiwgeyBhbmFseXRpY3NPd25lciB9KX1cbiAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQW5hbHl0aWNzTGVhcm5Nb3JlX2ltYWdlX2hvbGRlclwiIC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FuYWx5dGljc0xlYXJuTW9yZV9jb3B5XCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIkhlbHAgdXMgaWRlbnRpZnkgaXNzdWVzIGFuZCBpbXByb3ZlICUoYW5hbHl0aWNzT3duZXIpcyBieSBzaGFyaW5nIGFub255bW91cyB1c2FnZSBkYXRhLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiVG8gdW5kZXJzdGFuZCBob3cgcGVvcGxlIHVzZSBtdWx0aXBsZSBkZXZpY2VzLCB3ZSdsbCBnZW5lcmF0ZSBhIHJhbmRvbSBpZGVudGlmaWVyLCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwic2hhcmVkIGJ5IHlvdXIgZGV2aWNlcy5cIiwgeyBhbmFseXRpY3NPd25lciB9LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwibXhfQW5hbHl0aWNzTGVhcm5Nb3JlX2J1bGxldHNcIj5cbiAgICAgICAgICAgICAgICA8bGk+eyBfdChcIldlIDxCb2xkPmRvbid0PC9Cb2xkPiByZWNvcmQgb3IgcHJvZmlsZSBhbnkgYWNjb3VudCBkYXRhXCIsXG4gICAgICAgICAgICAgICAgICAgIHt9LCB7IFwiQm9sZFwiOiAoc3ViKSA9PiA8Yj57IHN1YiB9PC9iPiB9KSB9PC9saT5cbiAgICAgICAgICAgICAgICA8bGk+eyBfdChcIldlIDxCb2xkPmRvbid0PC9Cb2xkPiBzaGFyZSBpbmZvcm1hdGlvbiB3aXRoIHRoaXJkIHBhcnRpZXNcIixcbiAgICAgICAgICAgICAgICAgICAge30sIHsgXCJCb2xkXCI6IChzdWIpID0+IDxiPnsgc3ViIH08L2I+IH0pIH08L2xpPlxuICAgICAgICAgICAgICAgIDxsaT57IF90KFwiWW91IGNhbiB0dXJuIHRoaXMgb2ZmIGFueXRpbWUgaW4gc2V0dGluZ3NcIikgfTwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgeyBwcml2YWN5UG9saWN5TGluayB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17cHJpbWFyeUJ1dHRvbn1cbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbj17Y2FuY2VsQnV0dG9ufVxuICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e29uUHJpbWFyeUJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgb25DYW5jZWw9e29uQ2FuY2VsQnV0dG9uQ2xpY2t9XG4gICAgICAgICAgICBoYXNDYW5jZWw9e2hhc0NhbmNlbH1cbiAgICAgICAgLz5cbiAgICA8L0Jhc2VEaWFsb2c+O1xufTtcblxuZXhwb3J0IGNvbnN0IHNob3dEaWFsb2cgPSAocHJvcHM6IE9taXQ8SVByb3BzLCBcImNvb2tpZVBvbGljeVVybFwiIHwgXCJhbmFseXRpY3NPd25lclwiPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHByaXZhY3lQb2xpY3lVcmwgPSBnZXRQb2xpY3lVcmwoKTtcbiAgICBjb25zdCBhbmFseXRpY3NPd25lciA9IFNka0NvbmZpZy5nZXQoXCJhbmFseXRpY3Nfb3duZXJcIikgPz8gU2RrQ29uZmlnLmdldChcImJyYW5kXCIpO1xuICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhBbmFseXRpY3NMZWFybk1vcmVEaWFsb2csIHtcbiAgICAgICAgcHJpdmFjeVBvbGljeVVybCxcbiAgICAgICAgYW5hbHl0aWNzT3duZXIsXG4gICAgICAgIC4uLnByb3BzLFxuICAgIH0sIFwibXhfQW5hbHl0aWNzTGVhcm5Nb3JlRGlhbG9nX3dyYXBwZXJcIik7XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0lBRVlBLGE7OztXQUFBQSxhO0VBQUFBLGEsQ0FBQUEsYTtFQUFBQSxhLENBQUFBLGE7R0FBQUEsYSw2QkFBQUEsYTs7QUFjTCxNQUFNQyx3QkFBMEMsR0FBRyxRQU9wRDtFQUFBLElBUHFEO0lBQ3ZEQyxVQUR1RDtJQUV2REMsY0FGdUQ7SUFHdkRDLGdCQUh1RDtJQUl2REMsYUFKdUQ7SUFLdkRDLFlBTHVEO0lBTXZEQztFQU51RCxDQU9yRDs7RUFDRixNQUFNQyxvQkFBb0IsR0FBRyxNQUFNTixVQUFVLElBQUlBLFVBQVUsQ0FBQ0YsYUFBYSxDQUFDUyxPQUFmLENBQTNEOztFQUNBLE1BQU1DLG1CQUFtQixHQUFHLE1BQU1SLFVBQVUsSUFBSUEsVUFBVSxDQUFDRixhQUFhLENBQUNXLE1BQWYsQ0FBMUQ7O0VBQ0EsTUFBTUMsaUJBQWlCLEdBQUdSLGdCQUFnQixnQkFDdEMsMkNBRVEsSUFBQVMsbUJBQUEsRUFBRyxzRUFBSCxFQUEyRSxFQUEzRSxFQUErRTtJQUMzRSxvQkFBcUJDLEdBQUQsSUFBUztNQUN6QixvQkFBTztRQUFHLElBQUksRUFBRVYsZ0JBQVQ7UUFDSCxHQUFHLEVBQUMscUJBREQ7UUFFSCxNQUFNLEVBQUM7TUFGSixHQUlEVSxHQUpDLGVBS0g7UUFBTSxTQUFTLEVBQUM7TUFBaEIsRUFMRyxDQUFQO0lBT0g7RUFUMEUsQ0FBL0UsQ0FGUixDQURzQyxHQWU1QixFQWZkO0VBZ0JBLG9CQUFPLDZCQUFDLG1CQUFEO0lBQ0gsU0FBUyxFQUFDLDZCQURQO0lBRUgsU0FBUyxFQUFDLHVCQUZQO0lBR0gsS0FBSyxFQUFFLElBQUFELG1CQUFBLEVBQUcsaUNBQUgsRUFBc0M7TUFBRVY7SUFBRixDQUF0QyxDQUhKO0lBSUgsVUFBVSxFQUFFRDtFQUpULGdCQU1IO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0k7SUFBSyxTQUFTLEVBQUM7RUFBZixFQURKLGVBRUk7SUFBSyxTQUFTLEVBQUM7RUFBZixHQUNNLElBQUFXLG1CQUFBLEVBQUcsNkZBQ0QscUZBREMsR0FFRCx5QkFGRixFQUU2QjtJQUFFVjtFQUFGLENBRjdCLENBRE4sQ0FGSixlQVFJO0lBQUksU0FBUyxFQUFDO0VBQWQsZ0JBQ0kseUNBQU0sSUFBQVUsbUJBQUEsRUFBRywwREFBSCxFQUNGLEVBREUsRUFDRTtJQUFFLFFBQVNDLEdBQUQsaUJBQVMsd0NBQUtBLEdBQUw7RUFBbkIsQ0FERixDQUFOLENBREosZUFHSSx5Q0FBTSxJQUFBRCxtQkFBQSxFQUFHLDREQUFILEVBQ0YsRUFERSxFQUNFO0lBQUUsUUFBU0MsR0FBRCxpQkFBUyx3Q0FBS0EsR0FBTDtFQUFuQixDQURGLENBQU4sQ0FISixlQUtJLHlDQUFNLElBQUFELG1CQUFBLEVBQUcsMkNBQUgsQ0FBTixDQUxKLENBUkosRUFlTUQsaUJBZk4sQ0FORyxlQXVCSCw2QkFBQyxzQkFBRDtJQUNJLGFBQWEsRUFBRVAsYUFEbkI7SUFFSSxZQUFZLEVBQUVDLFlBRmxCO0lBR0ksb0JBQW9CLEVBQUVFLG9CQUgxQjtJQUlJLFFBQVEsRUFBRUUsbUJBSmQ7SUFLSSxTQUFTLEVBQUVIO0VBTGYsRUF2QkcsQ0FBUDtBQStCSCxDQXpETTs7OztBQTJEQSxNQUFNUSxVQUFVLEdBQUlDLEtBQUQsSUFBcUU7RUFDM0YsTUFBTVosZ0JBQWdCLEdBQUcsSUFBQWEsNEJBQUEsR0FBekI7O0VBQ0EsTUFBTWQsY0FBYyxHQUFHZSxrQkFBQSxDQUFVQyxHQUFWLENBQWMsaUJBQWQsS0FBb0NELGtCQUFBLENBQVVDLEdBQVYsQ0FBYyxPQUFkLENBQTNEOztFQUNBQyxjQUFBLENBQU1DLFlBQU4sQ0FBbUJwQix3QkFBbkI7SUFDSUcsZ0JBREo7SUFFSUQ7RUFGSixHQUdPYSxLQUhQLEdBSUcscUNBSkg7QUFLSCxDQVJNIn0=