"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _autodiscovery = require("matrix-js-sdk/src/autodiscovery");

var _logger = require("matrix-js-sdk/src/logger");

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../../utils/AutoDiscoveryUtils"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _StyledRadioButton = _interopRequireDefault(require("../elements/StyledRadioButton"));

var _TextWithTooltip = _interopRequireDefault(require("../elements/TextWithTooltip"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020-2021 The Matrix.org Foundation C.I.C.

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
class ServerPickerDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "defaultServer", void 0);
    (0, _defineProperty2.default)(this, "fieldRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "validatedConf", void 0);
    (0, _defineProperty2.default)(this, "onDefaultChosen", () => {
      this.setState({
        defaultChosen: true
      });
    });
    (0, _defineProperty2.default)(this, "onOtherChosen", () => {
      this.setState({
        defaultChosen: false
      });
    });
    (0, _defineProperty2.default)(this, "onHomeserverChange", ev => {
      this.setState({
        otherHomeserver: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "validate", (0, _Validation.default)({
      deriveData: async _ref => {
        let {
          value
        } = _ref;
        let hsUrl = value.trim(); // trim to account for random whitespace
        // if the URL has no protocol, try validate it as a serverName via well-known

        if (!hsUrl.includes("://")) {
          try {
            const discoveryResult = await _autodiscovery.AutoDiscovery.findClientConfig(hsUrl);
            this.validatedConf = _AutoDiscoveryUtils.default.buildValidatedConfigFromDiscovery(hsUrl, discoveryResult);
            return {}; // we have a validated config, we don't need to try the other paths
          } catch (e) {
            _logger.logger.error(`Attempted ${hsUrl} as a server_name but it failed`, e);
          }
        } // if we got to this stage then either the well-known failed or the URL had a protocol specified,
        // so validate statically only. If the URL has no protocol, default to https.


        if (!hsUrl.includes("://")) {
          hsUrl = "https://" + hsUrl;
        }

        try {
          this.validatedConf = await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(hsUrl);
          return {};
        } catch (e) {
          _logger.logger.error(e);

          const stateForError = _AutoDiscoveryUtils.default.authComponentStateForError(e);

          if (stateForError.serverErrorIsFatal) {
            let error = (0, _languageHandler._t)("Unable to validate homeserver");

            if (e.translatedMessage) {
              error = e.translatedMessage;
            }

            return {
              error
            };
          } // try to carry on anyway


          try {
            this.validatedConf = await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(hsUrl, null, true);
            return {};
          } catch (e) {
            _logger.logger.error(e);

            return {
              error: (0, _languageHandler._t)("Invalid URL")
            };
          }
        }
      },
      rules: [{
        key: "required",
        test: _ref2 => {
          let {
            value,
            allowEmpty
          } = _ref2;
          return allowEmpty || !!value;
        },
        invalid: () => (0, _languageHandler._t)("Specify a homeserver")
      }, {
        key: "valid",
        test: async function (_ref3, _ref4) {
          let {
            value
          } = _ref3;
          let {
            error
          } = _ref4;
          if (!value) return true;
          return !error;
        },
        invalid: function (_ref5) {
          let {
            error
          } = _ref5;
          return error;
        }
      }]
    }));
    (0, _defineProperty2.default)(this, "onHomeserverValidate", fieldState => this.validate(fieldState));
    (0, _defineProperty2.default)(this, "onSubmit", async ev => {
      ev.preventDefault();
      const valid = await this.fieldRef.current.validate({
        allowEmpty: false
      });

      if (!valid && !this.state.defaultChosen) {
        this.fieldRef.current.focus();
        this.fieldRef.current.validate({
          allowEmpty: false,
          focused: true
        });
        return;
      }

      this.props.onFinished(this.state.defaultChosen ? this.defaultServer : this.validatedConf);
    });

    const config = _SdkConfig.default.get();

    this.defaultServer = config["validated_server_config"];
    const {
      serverConfig
    } = this.props;
    let otherHomeserver = "";

    if (!serverConfig.isDefault) {
      if (serverConfig.isNameResolvable && serverConfig.hsName) {
        otherHomeserver = serverConfig.hsName;
      } else {
        otherHomeserver = serverConfig.hsUrl;
      }
    }

    this.state = {
      defaultChosen: serverConfig.isDefault,
      otherHomeserver
    };
  }

  render() {
    let text;

    if (this.defaultServer.hsName === "matrix.org") {
      text = (0, _languageHandler._t)("Matrix.org is the biggest public homeserver in the world, so it's a good place for many.");
    }

    let defaultServerName = this.defaultServer.hsName;

    if (this.defaultServer.hsNameIsDifferent) {
      defaultServerName = /*#__PURE__*/_react.default.createElement(_TextWithTooltip.default, {
        class: "mx_Login_underlinedServerName",
        tooltip: this.defaultServer.hsUrl
      }, this.defaultServer.hsName);
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      title: this.props.title || (0, _languageHandler._t)("Sign into your homeserver"),
      className: "mx_ServerPickerDialog",
      contentId: "mx_ServerPickerDialog",
      onFinished: this.props.onFinished,
      fixedWidth: false,
      hasCancel: true
    }, /*#__PURE__*/_react.default.createElement("form", {
      className: "mx_Dialog_content",
      id: "mx_ServerPickerDialog",
      onSubmit: this.onSubmit
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We call the places where you can host your account 'homeservers'."), " ", text), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      name: "defaultChosen",
      value: "true",
      checked: this.state.defaultChosen,
      onChange: this.onDefaultChosen
    }, defaultServerName), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      name: "defaultChosen",
      value: "false",
      className: "mx_ServerPickerDialog_otherHomeserverRadio",
      checked: !this.state.defaultChosen,
      onChange: this.onOtherChosen,
      childrenInLabel: false,
      "aria-label": (0, _languageHandler._t)("Other homeserver")
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      className: "mx_ServerPickerDialog_otherHomeserver",
      label: (0, _languageHandler._t)("Other homeserver"),
      onChange: this.onHomeserverChange,
      onFocus: this.onOtherChosen,
      ref: this.fieldRef,
      onValidate: this.onHomeserverValidate,
      value: this.state.otherHomeserver,
      validateOnChange: false,
      validateOnFocus: false,
      autoFocus: true,
      id: "mx_homeserverInput"
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Use your preferred Matrix homeserver if you have one, or host your own.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_ServerPickerDialog_continue",
      kind: "primary",
      onClick: this.onSubmit
    }, (0, _languageHandler._t)("Continue")), /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Learn more")), /*#__PURE__*/_react.default.createElement("a", {
      href: "https://matrix.org/faq/#what-is-a-homeserver%3F",
      target: "_blank",
      rel: "noreferrer noopener"
    }, (0, _languageHandler._t)("About homeservers"))));
  }

}

exports.default = ServerPickerDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXJ2ZXJQaWNrZXJEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwic2V0U3RhdGUiLCJkZWZhdWx0Q2hvc2VuIiwiZXYiLCJvdGhlckhvbWVzZXJ2ZXIiLCJ0YXJnZXQiLCJ2YWx1ZSIsIndpdGhWYWxpZGF0aW9uIiwiZGVyaXZlRGF0YSIsImhzVXJsIiwidHJpbSIsImluY2x1ZGVzIiwiZGlzY292ZXJ5UmVzdWx0IiwiQXV0b0Rpc2NvdmVyeSIsImZpbmRDbGllbnRDb25maWciLCJ2YWxpZGF0ZWRDb25mIiwiQXV0b0Rpc2NvdmVyeVV0aWxzIiwiYnVpbGRWYWxpZGF0ZWRDb25maWdGcm9tRGlzY292ZXJ5IiwiZSIsImxvZ2dlciIsImVycm9yIiwidmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyIsInN0YXRlRm9yRXJyb3IiLCJhdXRoQ29tcG9uZW50U3RhdGVGb3JFcnJvciIsInNlcnZlckVycm9ySXNGYXRhbCIsIl90IiwidHJhbnNsYXRlZE1lc3NhZ2UiLCJydWxlcyIsImtleSIsInRlc3QiLCJhbGxvd0VtcHR5IiwiaW52YWxpZCIsImZpZWxkU3RhdGUiLCJ2YWxpZGF0ZSIsInByZXZlbnREZWZhdWx0IiwidmFsaWQiLCJmaWVsZFJlZiIsImN1cnJlbnQiLCJzdGF0ZSIsImZvY3VzIiwiZm9jdXNlZCIsIm9uRmluaXNoZWQiLCJkZWZhdWx0U2VydmVyIiwiY29uZmlnIiwiU2RrQ29uZmlnIiwiZ2V0Iiwic2VydmVyQ29uZmlnIiwiaXNEZWZhdWx0IiwiaXNOYW1lUmVzb2x2YWJsZSIsImhzTmFtZSIsInJlbmRlciIsInRleHQiLCJkZWZhdWx0U2VydmVyTmFtZSIsImhzTmFtZUlzRGlmZmVyZW50IiwidGl0bGUiLCJvblN1Ym1pdCIsIm9uRGVmYXVsdENob3NlbiIsIm9uT3RoZXJDaG9zZW4iLCJvbkhvbWVzZXJ2ZXJDaGFuZ2UiLCJvbkhvbWVzZXJ2ZXJWYWxpZGF0ZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2VydmVyUGlja2VyRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAtMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEF1dG9EaXNjb3ZlcnkgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvYXV0b2Rpc2NvdmVyeVwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgQXV0b0Rpc2NvdmVyeVV0aWxzIGZyb20gXCIuLi8uLi8uLi91dGlscy9BdXRvRGlzY292ZXJ5VXRpbHNcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gJy4vQmFzZURpYWxvZyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgU3R5bGVkUmFkaW9CdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL1N0eWxlZFJhZGlvQnV0dG9uXCI7XG5pbXBvcnQgVGV4dFdpdGhUb29sdGlwIGZyb20gXCIuLi9lbGVtZW50cy9UZXh0V2l0aFRvb2x0aXBcIjtcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiwgeyBJRmllbGRTdGF0ZSB9IGZyb20gXCIuLi9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5pbXBvcnQgeyBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvVmFsaWRhdGVkU2VydmVyQ29uZmlnXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHRpdGxlPzogc3RyaW5nO1xuICAgIHNlcnZlckNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIG9uRmluaXNoZWQoY29uZmlnPzogVmFsaWRhdGVkU2VydmVyQ29uZmlnKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZGVmYXVsdENob3NlbjogYm9vbGVhbjtcbiAgICBvdGhlckhvbWVzZXJ2ZXI6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmVyUGlja2VyRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVmYXVsdFNlcnZlcjogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZmllbGRSZWYgPSBjcmVhdGVSZWY8RmllbGQ+KCk7XG4gICAgcHJpdmF0ZSB2YWxpZGF0ZWRDb25mOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgY29uZmlnID0gU2RrQ29uZmlnLmdldCgpO1xuICAgICAgICB0aGlzLmRlZmF1bHRTZXJ2ZXIgPSBjb25maWdbXCJ2YWxpZGF0ZWRfc2VydmVyX2NvbmZpZ1wiXTtcbiAgICAgICAgY29uc3QgeyBzZXJ2ZXJDb25maWcgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgbGV0IG90aGVySG9tZXNlcnZlciA9IFwiXCI7XG4gICAgICAgIGlmICghc2VydmVyQ29uZmlnLmlzRGVmYXVsdCkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckNvbmZpZy5pc05hbWVSZXNvbHZhYmxlICYmIHNlcnZlckNvbmZpZy5oc05hbWUpIHtcbiAgICAgICAgICAgICAgICBvdGhlckhvbWVzZXJ2ZXIgPSBzZXJ2ZXJDb25maWcuaHNOYW1lO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdGhlckhvbWVzZXJ2ZXIgPSBzZXJ2ZXJDb25maWcuaHNVcmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGVmYXVsdENob3Nlbjogc2VydmVyQ29uZmlnLmlzRGVmYXVsdCxcbiAgICAgICAgICAgIG90aGVySG9tZXNlcnZlcixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGVmYXVsdENob3NlbiA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlZmF1bHRDaG9zZW46IHRydWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25PdGhlckNob3NlbiA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlZmF1bHRDaG9zZW46IGZhbHNlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSG9tZXNlcnZlckNoYW5nZSA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgb3RoZXJIb21lc2VydmVyOiBldi50YXJnZXQudmFsdWUgfSk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IERvIHdlIHdhbnQgdG8gc3VwcG9ydCAud2VsbC1rbm93biBsb29rdXBzIGhlcmU/XG4gICAgLy8gSWYgZm9yIHNvbWUgcmVhc29uIHNvbWVvbmUgZW50ZXJzIFwibWF0cml4Lm9yZ1wiIGZvciBhIFVSTCwgd2UgY291bGQgZG8gYSBsb29rdXAgdG9cbiAgICAvLyBmaW5kIHRoZWlyIGhvbWVzZXJ2ZXIgd2l0aG91dCBkZW1hbmRpbmcgdGhleSB1c2UgXCJodHRwczovL21hdHJpeC5vcmdcIlxuICAgIHByaXZhdGUgdmFsaWRhdGUgPSB3aXRoVmFsaWRhdGlvbjx0aGlzLCB7IGVycm9yPzogc3RyaW5nIH0+KHtcbiAgICAgICAgZGVyaXZlRGF0YTogYXN5bmMgKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgICAgICAgbGV0IGhzVXJsID0gdmFsdWUudHJpbSgpOyAvLyB0cmltIHRvIGFjY291bnQgZm9yIHJhbmRvbSB3aGl0ZXNwYWNlXG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSBVUkwgaGFzIG5vIHByb3RvY29sLCB0cnkgdmFsaWRhdGUgaXQgYXMgYSBzZXJ2ZXJOYW1lIHZpYSB3ZWxsLWtub3duXG4gICAgICAgICAgICBpZiAoIWhzVXJsLmluY2x1ZGVzKFwiOi8vXCIpKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlzY292ZXJ5UmVzdWx0ID0gYXdhaXQgQXV0b0Rpc2NvdmVyeS5maW5kQ2xpZW50Q29uZmlnKGhzVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZWRDb25mID0gQXV0b0Rpc2NvdmVyeVV0aWxzLmJ1aWxkVmFsaWRhdGVkQ29uZmlnRnJvbURpc2NvdmVyeShoc1VybCwgZGlzY292ZXJ5UmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt9OyAvLyB3ZSBoYXZlIGEgdmFsaWRhdGVkIGNvbmZpZywgd2UgZG9uJ3QgbmVlZCB0byB0cnkgdGhlIG90aGVyIHBhdGhzXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYEF0dGVtcHRlZCAke2hzVXJsfSBhcyBhIHNlcnZlcl9uYW1lIGJ1dCBpdCBmYWlsZWRgLCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIGdvdCB0byB0aGlzIHN0YWdlIHRoZW4gZWl0aGVyIHRoZSB3ZWxsLWtub3duIGZhaWxlZCBvciB0aGUgVVJMIGhhZCBhIHByb3RvY29sIHNwZWNpZmllZCxcbiAgICAgICAgICAgIC8vIHNvIHZhbGlkYXRlIHN0YXRpY2FsbHkgb25seS4gSWYgdGhlIFVSTCBoYXMgbm8gcHJvdG9jb2wsIGRlZmF1bHQgdG8gaHR0cHMuXG4gICAgICAgICAgICBpZiAoIWhzVXJsLmluY2x1ZGVzKFwiOi8vXCIpKSB7XG4gICAgICAgICAgICAgICAgaHNVcmwgPSBcImh0dHBzOi8vXCIgKyBoc1VybDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlZENvbmYgPSBhd2FpdCBBdXRvRGlzY292ZXJ5VXRpbHMudmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyhoc1VybCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlRm9yRXJyb3IgPSBBdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlRm9yRXJyb3Iuc2VydmVyRXJyb3JJc0ZhdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlcnJvciA9IF90KFwiVW5hYmxlIHRvIHZhbGlkYXRlIGhvbWVzZXJ2ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRyYW5zbGF0ZWRNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9IGUudHJhbnNsYXRlZE1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB0cnkgdG8gY2Fycnkgb24gYW55d2F5XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZWRDb25mID0gYXdhaXQgQXV0b0Rpc2NvdmVyeVV0aWxzLnZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMoaHNVcmwsIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBfdChcIkludmFsaWQgVVJMXCIpIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlNwZWNpZnkgYSBob21lc2VydmVyXCIpLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jIGZ1bmN0aW9uKHsgdmFsdWUgfSwgeyBlcnJvciB9KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWVycm9yO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogZnVuY3Rpb24oeyBlcnJvciB9KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHByaXZhdGUgb25Ib21lc2VydmVyVmFsaWRhdGUgPSAoZmllbGRTdGF0ZTogSUZpZWxkU3RhdGUpID0+IHRoaXMudmFsaWRhdGUoZmllbGRTdGF0ZSk7XG5cbiAgICBwcml2YXRlIG9uU3VibWl0ID0gYXN5bmMgKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgdmFsaWQgPSBhd2FpdCB0aGlzLmZpZWxkUmVmLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcblxuICAgICAgICBpZiAoIXZhbGlkICYmICF0aGlzLnN0YXRlLmRlZmF1bHRDaG9zZW4pIHtcbiAgICAgICAgICAgIHRoaXMuZmllbGRSZWYuY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5maWVsZFJlZi5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodGhpcy5zdGF0ZS5kZWZhdWx0Q2hvc2VuID8gdGhpcy5kZWZhdWx0U2VydmVyIDogdGhpcy52YWxpZGF0ZWRDb25mKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHRleHQ7XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRTZXJ2ZXIuaHNOYW1lID09PSBcIm1hdHJpeC5vcmdcIikge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiTWF0cml4Lm9yZyBpcyB0aGUgYmlnZ2VzdCBwdWJsaWMgaG9tZXNlcnZlciBpbiB0aGUgd29ybGQsIHNvIGl0J3MgYSBnb29kIHBsYWNlIGZvciBtYW55LlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZWZhdWx0U2VydmVyTmFtZTogUmVhY3QuUmVhY3ROb2RlID0gdGhpcy5kZWZhdWx0U2VydmVyLmhzTmFtZTtcbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdFNlcnZlci5oc05hbWVJc0RpZmZlcmVudCkge1xuICAgICAgICAgICAgZGVmYXVsdFNlcnZlck5hbWUgPSAoXG4gICAgICAgICAgICAgICAgPFRleHRXaXRoVG9vbHRpcCBjbGFzcz1cIm14X0xvZ2luX3VuZGVybGluZWRTZXJ2ZXJOYW1lXCIgdG9vbHRpcD17dGhpcy5kZWZhdWx0U2VydmVyLmhzVXJsfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmRlZmF1bHRTZXJ2ZXIuaHNOYW1lIH1cbiAgICAgICAgICAgICAgICA8L1RleHRXaXRoVG9vbHRpcD5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPEJhc2VEaWFsb2dcbiAgICAgICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLnRpdGxlIHx8IF90KFwiU2lnbiBpbnRvIHlvdXIgaG9tZXNlcnZlclwiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NlcnZlclBpY2tlckRpYWxvZ1wiXG4gICAgICAgICAgICBjb250ZW50SWQ9XCJteF9TZXJ2ZXJQaWNrZXJEaWFsb2dcIlxuICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgZml4ZWRXaWR0aD17ZmFsc2V9XG4gICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCIgaWQ9XCJteF9TZXJ2ZXJQaWNrZXJEaWFsb2dcIiBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJXZSBjYWxsIHRoZSBwbGFjZXMgd2hlcmUgeW91IGNhbiBob3N0IHlvdXIgYWNjb3VudCAnaG9tZXNlcnZlcnMnLlwiKSB9IHsgdGV4dCB9XG4gICAgICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJkZWZhdWx0Q2hvc2VuXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5kZWZhdWx0Q2hvc2VufVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkRlZmF1bHRDaG9zZW59XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IGRlZmF1bHRTZXJ2ZXJOYW1lIH1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZFJhZGlvQnV0dG9uPlxuXG4gICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJkZWZhdWx0Q2hvc2VuXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCJmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NlcnZlclBpY2tlckRpYWxvZ19vdGhlckhvbWVzZXJ2ZXJSYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9eyF0aGlzLnN0YXRlLmRlZmF1bHRDaG9zZW59XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uT3RoZXJDaG9zZW59XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuSW5MYWJlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiT3RoZXIgaG9tZXNlcnZlclwiKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU2VydmVyUGlja2VyRGlhbG9nX290aGVySG9tZXNlcnZlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJPdGhlciBob21lc2VydmVyXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Ib21lc2VydmVyQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2N1cz17dGhpcy5vbk90aGVyQ2hvc2VufVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmZpZWxkUmVmfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbkhvbWVzZXJ2ZXJWYWxpZGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm90aGVySG9tZXNlcnZlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlT25DaGFuZ2U9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGVPbkZvY3VzPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwibXhfaG9tZXNlcnZlcklucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1N0eWxlZFJhZGlvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVXNlIHlvdXIgcHJlZmVycmVkIE1hdHJpeCBob21lc2VydmVyIGlmIHlvdSBoYXZlIG9uZSwgb3IgaG9zdCB5b3VyIG93bi5cIikgfVxuICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1NlcnZlclBpY2tlckRpYWxvZ19jb250aW51ZVwiIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDb250aW51ZVwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuXG4gICAgICAgICAgICAgICAgPGgyPnsgX3QoXCJMZWFybiBtb3JlXCIpIH08L2gyPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL21hdHJpeC5vcmcvZmFxLyN3aGF0LWlzLWEtaG9tZXNlcnZlciUzRlwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkFib3V0IGhvbWVzZXJ2ZXJzXCIpIH1cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvQmFzZURpYWxvZz47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FB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