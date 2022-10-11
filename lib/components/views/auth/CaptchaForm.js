"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd

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
const DIV_ID = 'mx_recaptcha';

/**
 * A pure UI component which displays a captcha form.
 */
class CaptchaForm extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "captchaWidgetId", void 0);
    (0, _defineProperty2.default)(this, "recaptchaContainer", /*#__PURE__*/(0, _react.createRef)());
    this.state = {
      errorText: undefined
    };
  }

  componentDidMount() {
    // Just putting a script tag into the returned jsx doesn't work, annoyingly,
    // so we do this instead.
    if (this.isRecaptchaReady()) {
      // already loaded
      this.onCaptchaLoaded();
    } else {
      _logger.logger.log("Loading recaptcha script...");

      window.mxOnRecaptchaLoaded = () => {
        this.onCaptchaLoaded();
      };

      const scriptTag = document.createElement('script');
      scriptTag.setAttribute('src', `https://www.recaptcha.net/recaptcha/api.js?onload=mxOnRecaptchaLoaded&render=explicit`);
      this.recaptchaContainer.current.appendChild(scriptTag);
    }
  }

  componentWillUnmount() {
    this.resetRecaptcha();
  } // Borrowed directly from: https://github.com/codeep/react-recaptcha-google/commit/e118fa5670fa268426969323b2e7fe77698376ba


  isRecaptchaReady() {
    return typeof window !== "undefined" && typeof global.grecaptcha !== "undefined" && typeof global.grecaptcha.render === 'function';
  }

  renderRecaptcha(divId) {
    if (!this.isRecaptchaReady()) {
      _logger.logger.error("grecaptcha not loaded!");

      throw new Error("Recaptcha did not load successfully");
    }

    const publicKey = this.props.sitePublicKey;

    if (!publicKey) {
      _logger.logger.error("No public key for recaptcha!");

      throw new Error("This server has not supplied enough information for Recaptcha " + "authentication");
    }

    _logger.logger.info("Rendering to %s", divId);

    this.captchaWidgetId = global.grecaptcha.render(divId, {
      sitekey: publicKey,
      callback: this.props.onCaptchaResponse
    });
  }

  resetRecaptcha() {
    if (this.captchaWidgetId) {
      global?.grecaptcha?.reset(this.captchaWidgetId);
    }
  }

  onCaptchaLoaded() {
    _logger.logger.log("Loaded recaptcha script.");

    try {
      this.renderRecaptcha(DIV_ID); // clear error if re-rendered

      this.setState({
        errorText: null
      });
    } catch (e) {
      this.setState({
        errorText: e.toString()
      });
    }
  }

  render() {
    let error = null;

    if (this.state.errorText) {
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, this.state.errorText);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      ref: this.recaptchaContainer
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This homeserver would like to make sure you are not a robot.")), /*#__PURE__*/_react.default.createElement("div", {
      id: DIV_ID
    }), error);
  }

}

exports.default = CaptchaForm;
(0, _defineProperty2.default)(CaptchaForm, "defaultProps", {
  onCaptchaResponse: () => {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJESVZfSUQiLCJDYXB0Y2hhRm9ybSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsInN0YXRlIiwiZXJyb3JUZXh0IiwidW5kZWZpbmVkIiwiY29tcG9uZW50RGlkTW91bnQiLCJpc1JlY2FwdGNoYVJlYWR5Iiwib25DYXB0Y2hhTG9hZGVkIiwibG9nZ2VyIiwibG9nIiwid2luZG93IiwibXhPblJlY2FwdGNoYUxvYWRlZCIsInNjcmlwdFRhZyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsInJlY2FwdGNoYUNvbnRhaW5lciIsImN1cnJlbnQiLCJhcHBlbmRDaGlsZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVzZXRSZWNhcHRjaGEiLCJnbG9iYWwiLCJncmVjYXB0Y2hhIiwicmVuZGVyIiwicmVuZGVyUmVjYXB0Y2hhIiwiZGl2SWQiLCJlcnJvciIsIkVycm9yIiwicHVibGljS2V5Iiwic2l0ZVB1YmxpY0tleSIsImluZm8iLCJjYXB0Y2hhV2lkZ2V0SWQiLCJzaXRla2V5IiwiY2FsbGJhY2siLCJvbkNhcHRjaGFSZXNwb25zZSIsInJlc2V0Iiwic2V0U3RhdGUiLCJlIiwidG9TdHJpbmciLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvQ2FwdGNoYUZvcm0udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuY29uc3QgRElWX0lEID0gJ214X3JlY2FwdGNoYSc7XG5cbmludGVyZmFjZSBJQ2FwdGNoYUZvcm1Qcm9wcyB7XG4gICAgc2l0ZVB1YmxpY0tleTogc3RyaW5nO1xuICAgIG9uQ2FwdGNoYVJlc3BvbnNlOiAocmVzcG9uc2U6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIElDYXB0Y2hhRm9ybVN0YXRlIHtcbiAgICBlcnJvclRleHQ/OiBzdHJpbmc7XG5cbn1cblxuLyoqXG4gKiBBIHB1cmUgVUkgY29tcG9uZW50IHdoaWNoIGRpc3BsYXlzIGEgY2FwdGNoYSBmb3JtLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYXB0Y2hhRm9ybSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJQ2FwdGNoYUZvcm1Qcm9wcywgSUNhcHRjaGFGb3JtU3RhdGU+IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBvbkNhcHRjaGFSZXNwb25zZTogKCkgPT4ge30sXG4gICAgfTtcblxuICAgIHByaXZhdGUgY2FwdGNoYVdpZGdldElkPzogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVjYXB0Y2hhQ29udGFpbmVyID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElDYXB0Y2hhRm9ybVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXJyb3JUZXh0OiB1bmRlZmluZWQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIC8vIEp1c3QgcHV0dGluZyBhIHNjcmlwdCB0YWcgaW50byB0aGUgcmV0dXJuZWQganN4IGRvZXNuJ3Qgd29yaywgYW5ub3lpbmdseSxcbiAgICAgICAgLy8gc28gd2UgZG8gdGhpcyBpbnN0ZWFkLlxuICAgICAgICBpZiAodGhpcy5pc1JlY2FwdGNoYVJlYWR5KCkpIHtcbiAgICAgICAgICAgIC8vIGFscmVhZHkgbG9hZGVkXG4gICAgICAgICAgICB0aGlzLm9uQ2FwdGNoYUxvYWRlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkxvYWRpbmcgcmVjYXB0Y2hhIHNjcmlwdC4uLlwiKTtcbiAgICAgICAgICAgIHdpbmRvdy5teE9uUmVjYXB0Y2hhTG9hZGVkID0gKCkgPT4geyB0aGlzLm9uQ2FwdGNoYUxvYWRlZCgpOyB9O1xuICAgICAgICAgICAgY29uc3Qgc2NyaXB0VGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICBzY3JpcHRUYWcuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICdzcmMnLCBgaHR0cHM6Ly93d3cucmVjYXB0Y2hhLm5ldC9yZWNhcHRjaGEvYXBpLmpzP29ubG9hZD1teE9uUmVjYXB0Y2hhTG9hZGVkJnJlbmRlcj1leHBsaWNpdGAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5yZWNhcHRjaGFDb250YWluZXIuY3VycmVudC5hcHBlbmRDaGlsZChzY3JpcHRUYWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMucmVzZXRSZWNhcHRjaGEoKTtcbiAgICB9XG5cbiAgICAvLyBCb3Jyb3dlZCBkaXJlY3RseSBmcm9tOiBodHRwczovL2dpdGh1Yi5jb20vY29kZWVwL3JlYWN0LXJlY2FwdGNoYS1nb29nbGUvY29tbWl0L2UxMThmYTU2NzBmYTI2ODQyNjk2OTMyM2IyZTdmZTc3Njk4Mzc2YmFcbiAgICBwcml2YXRlIGlzUmVjYXB0Y2hhUmVhZHkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgICB0eXBlb2YgZ2xvYmFsLmdyZWNhcHRjaGEgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiBnbG9iYWwuZ3JlY2FwdGNoYS5yZW5kZXIgPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJSZWNhcHRjaGEoZGl2SWQ6IHN0cmluZykge1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWNhcHRjaGFSZWFkeSgpKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJncmVjYXB0Y2hhIG5vdCBsb2FkZWQhXCIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVjYXB0Y2hhIGRpZCBub3QgbG9hZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwdWJsaWNLZXkgPSB0aGlzLnByb3BzLnNpdGVQdWJsaWNLZXk7XG4gICAgICAgIGlmICghcHVibGljS2V5KSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJObyBwdWJsaWMga2V5IGZvciByZWNhcHRjaGEhXCIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiVGhpcyBzZXJ2ZXIgaGFzIG5vdCBzdXBwbGllZCBlbm91Z2ggaW5mb3JtYXRpb24gZm9yIFJlY2FwdGNoYSBcIlxuICAgICAgICAgICAgICAgICsgXCJhdXRoZW50aWNhdGlvblwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ2dlci5pbmZvKFwiUmVuZGVyaW5nIHRvICVzXCIsIGRpdklkKTtcbiAgICAgICAgdGhpcy5jYXB0Y2hhV2lkZ2V0SWQgPSBnbG9iYWwuZ3JlY2FwdGNoYS5yZW5kZXIoZGl2SWQsIHtcbiAgICAgICAgICAgIHNpdGVrZXk6IHB1YmxpY0tleSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLnByb3BzLm9uQ2FwdGNoYVJlc3BvbnNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0UmVjYXB0Y2hhKCkge1xuICAgICAgICBpZiAodGhpcy5jYXB0Y2hhV2lkZ2V0SWQpIHtcbiAgICAgICAgICAgIGdsb2JhbD8uZ3JlY2FwdGNoYT8ucmVzZXQodGhpcy5jYXB0Y2hhV2lkZ2V0SWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhcHRjaGFMb2FkZWQoKSB7XG4gICAgICAgIGxvZ2dlci5sb2coXCJMb2FkZWQgcmVjYXB0Y2hhIHNjcmlwdC5cIik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclJlY2FwdGNoYShESVZfSUQpO1xuICAgICAgICAgICAgLy8gY2xlYXIgZXJyb3IgaWYgcmUtcmVuZGVyZWRcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IGUudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvclRleHQpIHtcbiAgICAgICAgICAgIGVycm9yID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgcmVmPXt0aGlzLnJlY2FwdGNoYUNvbnRhaW5lcn0+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGlzIGhvbWVzZXJ2ZXIgd291bGQgbGlrZSB0byBtYWtlIHN1cmUgeW91IGFyZSBub3QgYSByb2JvdC5cIixcbiAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD17RElWX0lEfSAvPlxuICAgICAgICAgICAgICAgIHsgZXJyb3IgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7Ozs7O0FBbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU9BLE1BQU1BLE1BQU0sR0FBRyxjQUFmOztBQVlBO0FBQ0E7QUFDQTtBQUNlLE1BQU1DLFdBQU4sU0FBMEJDLGNBQUEsQ0FBTUMsU0FBaEMsQ0FBZ0Y7RUFRM0ZDLFdBQVcsQ0FBQ0MsS0FBRCxFQUEyQjtJQUNsQyxNQUFNQSxLQUFOO0lBRGtDO0lBQUEsdUVBRlQs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