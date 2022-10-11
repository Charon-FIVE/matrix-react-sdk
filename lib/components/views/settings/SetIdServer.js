"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _boundThreepids = require("../../../boundThreepids");

var _IdentityAuthClient = _interopRequireDefault(require("../../../IdentityAuthClient"));

var _UrlUtils = require("../../../utils/UrlUtils");

var _IdentityServerUtils = require("../../../utils/IdentityServerUtils");

var _promise = require("../../../utils/promise");

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _QuestionDialog = _interopRequireDefault(require("../dialogs/QuestionDialog"));

/*
Copyright 2019-2021 The Matrix.org Foundation C.I.C.

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
// We'll wait up to this long when checking for 3PID bindings on the IS.
const REACHABILITY_TIMEOUT = 10000; // ms

/**
 * Check an IS URL is valid, including liveness check
 *
 * @param {string} u The url to check
 * @returns {string} null if url passes all checks, otherwise i18ned error string
 */

async function checkIdentityServerUrl(u) {
  const parsedUrl = _url.default.parse(u);

  if (parsedUrl.protocol !== 'https:') return (0, _languageHandler._t)("Identity server URL must be HTTPS"); // XXX: duplicated logic from js-sdk but it's quite tied up in the validation logic in the
  // js-sdk so probably as easy to duplicate it than to separate it out so we can reuse it

  try {
    const response = await fetch(u + '/_matrix/identity/api/v1');

    if (response.ok) {
      return null;
    } else if (response.status < 200 || response.status >= 300) {
      return (0, _languageHandler._t)("Not a valid identity server (status code %(code)s)", {
        code: response.status
      });
    } else {
      return (0, _languageHandler._t)("Could not connect to identity server");
    }
  } catch (e) {
    return (0, _languageHandler._t)("Could not connect to identity server");
  }
}

class SetIdServer extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      // We react to changes in the identity server in the event the user is staring at this form
      // when changing their identity server on another device.
      if (payload.action !== "id_server_changed") return;
      this.setState({
        currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()
      });
    });
    (0, _defineProperty2.default)(this, "onIdentityServerChanged", ev => {
      const u = ev.target.value;
      this.setState({
        idServer: u
      });
    });
    (0, _defineProperty2.default)(this, "getTooltip", () => {
      if (this.state.checking) {
        return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null), (0, _languageHandler._t)("Checking server"));
      } else if (this.state.error) {
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "warning"
        }, this.state.error);
      } else {
        return null;
      }
    });
    (0, _defineProperty2.default)(this, "idServerChangeEnabled", () => {
      return !!this.state.idServer && !this.state.busy;
    });
    (0, _defineProperty2.default)(this, "saveIdServer", fullUrl => {
      // Account data change will update localstorage, client, etc through dispatcher
      _MatrixClientPeg.MatrixClientPeg.get().setAccountData("m.identity_server", {
        base_url: fullUrl
      });

      this.setState({
        busy: false,
        error: null,
        currentClientIdServer: fullUrl,
        idServer: ''
      });
    });
    (0, _defineProperty2.default)(this, "checkIdServer", async e => {
      e.preventDefault();
      const {
        idServer,
        currentClientIdServer
      } = this.state;
      this.setState({
        busy: true,
        checking: true,
        error: null
      });
      const fullUrl = (0, _UrlUtils.unabbreviateUrl)(idServer);
      let errStr = await checkIdentityServerUrl(fullUrl);

      if (!errStr) {
        try {
          this.setState({
            checking: false
          }); // clear tooltip
          // Test the identity server by trying to register with it. This
          // may result in a terms of service prompt.

          const authClient = new _IdentityAuthClient.default(fullUrl);
          await authClient.getAccessToken();
          let save = true; // Double check that the identity server even has terms of service.

          const hasTerms = await (0, _IdentityServerUtils.doesIdentityServerHaveTerms)(fullUrl);

          if (!hasTerms) {
            const [confirmed] = await this.showNoTermsWarning(fullUrl);
            save = confirmed;
          } // Show a general warning, possibly with details about any bound
          // 3PIDs that would be left behind.


          if (save && currentClientIdServer && fullUrl !== currentClientIdServer) {
            const [confirmed] = await this.showServerChangeWarning({
              title: (0, _languageHandler._t)("Change identity server"),
              unboundMessage: (0, _languageHandler._t)("Disconnect from the identity server <current /> and " + "connect to <new /> instead?", {}, {
                current: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(currentClientIdServer)),
                new: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(idServer))
              }),
              button: (0, _languageHandler._t)("Continue")
            });
            save = confirmed;
          }

          if (save) {
            this.saveIdServer(fullUrl);
          }
        } catch (e) {
          _logger.logger.error(e);

          errStr = (0, _languageHandler._t)("Terms of service not accepted or the identity server is invalid.");
        }
      }

      this.setState({
        busy: false,
        checking: false,
        error: errStr,
        currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()
      });
    });
    (0, _defineProperty2.default)(this, "onDisconnectClicked", async () => {
      this.setState({
        disconnectBusy: true
      });

      try {
        const [confirmed] = await this.showServerChangeWarning({
          title: (0, _languageHandler._t)("Disconnect identity server"),
          unboundMessage: (0, _languageHandler._t)("Disconnect from the identity server <idserver />?", {}, {
            idserver: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(this.state.currentClientIdServer))
          }),
          button: (0, _languageHandler._t)("Disconnect")
        });

        if (confirmed) {
          this.disconnectIdServer();
        }
      } finally {
        this.setState({
          disconnectBusy: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "disconnectIdServer", () => {
      // Account data change will update localstorage, client, etc through dispatcher
      _MatrixClientPeg.MatrixClientPeg.get().setAccountData("m.identity_server", {
        base_url: null // clear

      });

      let newFieldVal = '';

      if ((0, _IdentityServerUtils.getDefaultIdentityServerUrl)()) {
        // Prepopulate the client's default so the user at least has some idea of
        // a valid value they might enter
        newFieldVal = (0, _UrlUtils.abbreviateUrl)((0, _IdentityServerUtils.getDefaultIdentityServerUrl)());
      }

      this.setState({
        busy: false,
        error: null,
        currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl(),
        idServer: newFieldVal
      });
    });
    let defaultIdServer = '';

    if (!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl() && (0, _IdentityServerUtils.getDefaultIdentityServerUrl)()) {
      // If no identity server is configured but there's one in the config, prepopulate
      // the field to help the user.
      defaultIdServer = (0, _UrlUtils.abbreviateUrl)((0, _IdentityServerUtils.getDefaultIdentityServerUrl)());
    }

    this.state = {
      defaultIdServer,
      currentClientIdServer: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl(),
      idServer: "",
      error: null,
      busy: false,
      disconnectBusy: false,
      checking: false
    };
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  showNoTermsWarning(fullUrl) {
    const {
      finished
    } = _Modal.default.createDialog(_QuestionDialog.default, {
      title: (0, _languageHandler._t)("Identity server has no terms of service"),
      description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
        className: "warning"
      }, (0, _languageHandler._t)("The identity server you have chosen does not have any terms of service.")), /*#__PURE__*/_react.default.createElement("span", null, "\xA0", (0, _languageHandler._t)("Only continue if you trust the owner of the server."))),
      button: (0, _languageHandler._t)("Continue")
    });

    return finished;
  }

  async showServerChangeWarning(_ref) {
    let {
      title,
      unboundMessage,
      button
    } = _ref;
    const {
      currentClientIdServer
    } = this.state;
    let threepids = [];
    let currentServerReachable = true;

    try {
      threepids = await (0, _promise.timeout)((0, _boundThreepids.getThreepidsWithBindStatus)(_MatrixClientPeg.MatrixClientPeg.get()), Promise.reject(new Error("Timeout attempting to reach identity server")), REACHABILITY_TIMEOUT);
    } catch (e) {
      currentServerReachable = false;

      _logger.logger.warn(`Unable to reach identity server at ${currentClientIdServer} to check ` + `for 3PIDs during IS change flow`);

      _logger.logger.warn(e);
    }

    const boundThreepids = threepids.filter(tp => tp.bound);
    let message;
    let danger = false;
    const messageElements = {
      idserver: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(currentClientIdServer)),
      b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
    };

    if (!currentServerReachable) {
      message = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You should <b>remove your personal data</b> from identity server " + "<idserver /> before disconnecting. Unfortunately, identity server " + "<idserver /> is currently offline or cannot be reached.", {}, messageElements)), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You should:")), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("check your browser plugins for anything that might block " + "the identity server (such as Privacy Badger)")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("contact the administrators of identity server <idserver />", {}, {
        idserver: messageElements.idserver
      })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("wait and try again later"))));
      danger = true;
      button = (0, _languageHandler._t)("Disconnect anyway");
    } else if (boundThreepids.length) {
      message = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are still <b>sharing your personal data</b> on the identity " + "server <idserver />.", {}, messageElements)), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We recommend that you remove your email addresses and phone numbers " + "from the identity server before disconnecting.")));
      danger = true;
      button = (0, _languageHandler._t)("Disconnect anyway");
    } else {
      message = unboundMessage;
    }

    const {
      finished
    } = _Modal.default.createDialog(_QuestionDialog.default, {
      title,
      description: message,
      button,
      cancelButton: (0, _languageHandler._t)("Go back"),
      danger
    });

    return finished;
  }

  render() {
    const idServerUrl = this.state.currentClientIdServer;
    let sectionTitle;
    let bodyText;

    if (idServerUrl) {
      sectionTitle = (0, _languageHandler._t)("Identity server (%(server)s)", {
        server: (0, _UrlUtils.abbreviateUrl)(idServerUrl)
      });
      bodyText = (0, _languageHandler._t)("You are currently using <server></server> to discover and be discoverable by " + "existing contacts you know. You can change your identity server below.", {}, {
        server: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(idServerUrl))
      });

      if (this.props.missingTerms) {
        bodyText = (0, _languageHandler._t)("If you don't want to use <server /> to discover and be discoverable by existing " + "contacts you know, enter another identity server below.", {}, {
          server: sub => /*#__PURE__*/_react.default.createElement("b", null, (0, _UrlUtils.abbreviateUrl)(idServerUrl))
        });
      }
    } else {
      sectionTitle = (0, _languageHandler._t)("Identity server");
      bodyText = (0, _languageHandler._t)("You are not currently using an identity server. " + "To discover and be discoverable by existing contacts you know, " + "add one below.");
    }

    let discoSection;

    if (idServerUrl) {
      let discoButtonContent = (0, _languageHandler._t)("Disconnect");
      let discoBodyText = (0, _languageHandler._t)("Disconnecting from your identity server will mean you " + "won't be discoverable by other users and you won't be " + "able to invite others by email or phone.");

      if (this.props.missingTerms) {
        discoBodyText = (0, _languageHandler._t)("Using an identity server is optional. If you choose not to " + "use an identity server, you won't be discoverable by other users " + "and you won't be able to invite others by email or phone.");
        discoButtonContent = (0, _languageHandler._t)("Do not use an identity server");
      }

      if (this.state.disconnectBusy) {
        discoButtonContent = /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null);
      }

      discoSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subsectionText"
      }, discoBodyText), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onDisconnectClicked,
        kind: "danger_sm"
      }, discoButtonContent));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      className: "mx_SetIdServer",
      onSubmit: this.checkIdServer
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, sectionTitle), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subsectionText"
    }, bodyText), /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: (0, _languageHandler._t)("Enter a new identity server"),
      type: "text",
      autoComplete: "off",
      placeholder: this.state.defaultIdServer,
      value: this.state.idServer,
      onChange: this.onIdentityServerChanged,
      tooltipContent: this.getTooltip(),
      tooltipClassName: "mx_SetIdServer_tooltip",
      disabled: this.state.busy,
      forceValidity: this.state.error ? false : null
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      type: "submit",
      kind: "primary_sm",
      onClick: this.checkIdServer,
      disabled: !this.idServerChangeEnabled()
    }, (0, _languageHandler._t)("Change")), discoSection);
  }

}

exports.default = SetIdServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSRUFDSEFCSUxJVFlfVElNRU9VVCIsImNoZWNrSWRlbnRpdHlTZXJ2ZXJVcmwiLCJ1IiwicGFyc2VkVXJsIiwidXJsIiwicGFyc2UiLCJwcm90b2NvbCIsIl90IiwicmVzcG9uc2UiLCJmZXRjaCIsIm9rIiwic3RhdHVzIiwiY29kZSIsImUiLCJTZXRJZFNlcnZlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInBheWxvYWQiLCJhY3Rpb24iLCJzZXRTdGF0ZSIsImN1cnJlbnRDbGllbnRJZFNlcnZlciIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldElkZW50aXR5U2VydmVyVXJsIiwiZXYiLCJ0YXJnZXQiLCJ2YWx1ZSIsImlkU2VydmVyIiwic3RhdGUiLCJjaGVja2luZyIsImVycm9yIiwiYnVzeSIsImZ1bGxVcmwiLCJzZXRBY2NvdW50RGF0YSIsImJhc2VfdXJsIiwicHJldmVudERlZmF1bHQiLCJ1bmFiYnJldmlhdGVVcmwiLCJlcnJTdHIiLCJhdXRoQ2xpZW50IiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwiZ2V0QWNjZXNzVG9rZW4iLCJzYXZlIiwiaGFzVGVybXMiLCJkb2VzSWRlbnRpdHlTZXJ2ZXJIYXZlVGVybXMiLCJjb25maXJtZWQiLCJzaG93Tm9UZXJtc1dhcm5pbmciLCJzaG93U2VydmVyQ2hhbmdlV2FybmluZyIsInRpdGxlIiwidW5ib3VuZE1lc3NhZ2UiLCJjdXJyZW50Iiwic3ViIiwiYWJicmV2aWF0ZVVybCIsIm5ldyIsImJ1dHRvbiIsInNhdmVJZFNlcnZlciIsImxvZ2dlciIsImRpc2Nvbm5lY3RCdXN5IiwiaWRzZXJ2ZXIiLCJkaXNjb25uZWN0SWRTZXJ2ZXIiLCJuZXdGaWVsZFZhbCIsImdldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCIsImRlZmF1bHRJZFNlcnZlciIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJmaW5pc2hlZCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiUXVlc3Rpb25EaWFsb2ciLCJkZXNjcmlwdGlvbiIsInRocmVlcGlkcyIsImN1cnJlbnRTZXJ2ZXJSZWFjaGFibGUiLCJ0aW1lb3V0IiwiZ2V0VGhyZWVwaWRzV2l0aEJpbmRTdGF0dXMiLCJQcm9taXNlIiwicmVqZWN0IiwiRXJyb3IiLCJ3YXJuIiwiYm91bmRUaHJlZXBpZHMiLCJmaWx0ZXIiLCJ0cCIsImJvdW5kIiwibWVzc2FnZSIsImRhbmdlciIsIm1lc3NhZ2VFbGVtZW50cyIsImIiLCJsZW5ndGgiLCJjYW5jZWxCdXR0b24iLCJyZW5kZXIiLCJpZFNlcnZlclVybCIsInNlY3Rpb25UaXRsZSIsImJvZHlUZXh0Iiwic2VydmVyIiwibWlzc2luZ1Rlcm1zIiwiZGlzY29TZWN0aW9uIiwiZGlzY29CdXR0b25Db250ZW50IiwiZGlzY29Cb2R5VGV4dCIsIm9uRGlzY29ubmVjdENsaWNrZWQiLCJjaGVja0lkU2VydmVyIiwib25JZGVudGl0eVNlcnZlckNoYW5nZWQiLCJnZXRUb29sdGlwIiwiaWRTZXJ2ZXJDaGFuZ2VFbmFibGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvU2V0SWRTZXJ2ZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOS0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBnZXRUaHJlZXBpZHNXaXRoQmluZFN0YXR1cyB9IGZyb20gJy4uLy4uLy4uL2JvdW5kVGhyZWVwaWRzJztcbmltcG9ydCBJZGVudGl0eUF1dGhDbGllbnQgZnJvbSBcIi4uLy4uLy4uL0lkZW50aXR5QXV0aENsaWVudFwiO1xuaW1wb3J0IHsgYWJicmV2aWF0ZVVybCwgdW5hYmJyZXZpYXRlVXJsIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1VybFV0aWxzXCI7XG5pbXBvcnQgeyBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwsIGRvZXNJZGVudGl0eVNlcnZlckhhdmVUZXJtcyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0lkZW50aXR5U2VydmVyVXRpbHMnO1xuaW1wb3J0IHsgdGltZW91dCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9wcm9taXNlXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcyc7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9JbmxpbmVTcGlubmVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uL2VsZW1lbnRzL0ZpZWxkJztcbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9RdWVzdGlvbkRpYWxvZ1wiO1xuXG4vLyBXZSdsbCB3YWl0IHVwIHRvIHRoaXMgbG9uZyB3aGVuIGNoZWNraW5nIGZvciAzUElEIGJpbmRpbmdzIG9uIHRoZSBJUy5cbmNvbnN0IFJFQUNIQUJJTElUWV9USU1FT1VUID0gMTAwMDA7IC8vIG1zXG5cbi8qKlxuICogQ2hlY2sgYW4gSVMgVVJMIGlzIHZhbGlkLCBpbmNsdWRpbmcgbGl2ZW5lc3MgY2hlY2tcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdSBUaGUgdXJsIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBudWxsIGlmIHVybCBwYXNzZXMgYWxsIGNoZWNrcywgb3RoZXJ3aXNlIGkxOG5lZCBlcnJvciBzdHJpbmdcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY2hlY2tJZGVudGl0eVNlcnZlclVybCh1KSB7XG4gICAgY29uc3QgcGFyc2VkVXJsID0gdXJsLnBhcnNlKHUpO1xuXG4gICAgaWYgKHBhcnNlZFVybC5wcm90b2NvbCAhPT0gJ2h0dHBzOicpIHJldHVybiBfdChcIklkZW50aXR5IHNlcnZlciBVUkwgbXVzdCBiZSBIVFRQU1wiKTtcblxuICAgIC8vIFhYWDogZHVwbGljYXRlZCBsb2dpYyBmcm9tIGpzLXNkayBidXQgaXQncyBxdWl0ZSB0aWVkIHVwIGluIHRoZSB2YWxpZGF0aW9uIGxvZ2ljIGluIHRoZVxuICAgIC8vIGpzLXNkayBzbyBwcm9iYWJseSBhcyBlYXN5IHRvIGR1cGxpY2F0ZSBpdCB0aGFuIHRvIHNlcGFyYXRlIGl0IG91dCBzbyB3ZSBjYW4gcmV1c2UgaXRcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHUgKyAnL19tYXRyaXgvaWRlbnRpdHkvYXBpL3YxJyk7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIk5vdCBhIHZhbGlkIGlkZW50aXR5IHNlcnZlciAoc3RhdHVzIGNvZGUgJShjb2RlKXMpXCIsIHsgY29kZTogcmVzcG9uc2Uuc3RhdHVzIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiQ291bGQgbm90IGNvbm5lY3QgdG8gaWRlbnRpdHkgc2VydmVyXCIpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gX3QoXCJDb3VsZCBub3QgY29ubmVjdCB0byBpZGVudGl0eSBzZXJ2ZXJcIik7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyBXaGV0aGVyIG9yIG5vdCB0aGUgaWRlbnRpdHkgc2VydmVyIGlzIG1pc3NpbmcgdGVybXMuIFRoaXMgYWZmZWN0cyB0aGUgdGV4dFxuICAgIC8vIHNob3duIHRvIHRoZSB1c2VyLlxuICAgIG1pc3NpbmdUZXJtczogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZGVmYXVsdElkU2VydmVyPzogc3RyaW5nO1xuICAgIGN1cnJlbnRDbGllbnRJZFNlcnZlcjogc3RyaW5nO1xuICAgIGlkU2VydmVyPzogc3RyaW5nO1xuICAgIGVycm9yPzogc3RyaW5nO1xuICAgIGJ1c3k6IGJvb2xlYW47XG4gICAgZGlzY29ubmVjdEJ1c3k6IGJvb2xlYW47XG4gICAgY2hlY2tpbmc6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNldElkU2VydmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgbGV0IGRlZmF1bHRJZFNlcnZlciA9ICcnO1xuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpICYmIGdldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCgpKSB7XG4gICAgICAgICAgICAvLyBJZiBubyBpZGVudGl0eSBzZXJ2ZXIgaXMgY29uZmlndXJlZCBidXQgdGhlcmUncyBvbmUgaW4gdGhlIGNvbmZpZywgcHJlcG9wdWxhdGVcbiAgICAgICAgICAgIC8vIHRoZSBmaWVsZCB0byBoZWxwIHRoZSB1c2VyLlxuICAgICAgICAgICAgZGVmYXVsdElkU2VydmVyID0gYWJicmV2aWF0ZVVybChnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGVmYXVsdElkU2VydmVyLFxuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgICAgIGlkU2VydmVyOiBcIlwiLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RCdXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGNoZWNraW5nOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICAvLyBXZSByZWFjdCB0byBjaGFuZ2VzIGluIHRoZSBpZGVudGl0eSBzZXJ2ZXIgaW4gdGhlIGV2ZW50IHRoZSB1c2VyIGlzIHN0YXJpbmcgYXQgdGhpcyBmb3JtXG4gICAgICAgIC8vIHdoZW4gY2hhbmdpbmcgdGhlaXIgaWRlbnRpdHkgc2VydmVyIG9uIGFub3RoZXIgZGV2aWNlLlxuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gIT09IFwiaWRfc2VydmVyX2NoYW5nZWRcIikgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25JZGVudGl0eVNlcnZlckNoYW5nZWQgPSAoZXYpID0+IHtcbiAgICAgICAgY29uc3QgdSA9IGV2LnRhcmdldC52YWx1ZTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaWRTZXJ2ZXI6IHUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0VG9vbHRpcCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2hlY2tpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgeyBfdChcIkNoZWNraW5nIHNlcnZlclwiKSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT0nd2FybmluZyc+eyB0aGlzLnN0YXRlLmVycm9yIH08L3NwYW4+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpZFNlcnZlckNoYW5nZUVuYWJsZWQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuc3RhdGUuaWRTZXJ2ZXIgJiYgIXRoaXMuc3RhdGUuYnVzeTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzYXZlSWRTZXJ2ZXIgPSAoZnVsbFVybCkgPT4ge1xuICAgICAgICAvLyBBY2NvdW50IGRhdGEgY2hhbmdlIHdpbGwgdXBkYXRlIGxvY2Fsc3RvcmFnZSwgY2xpZW50LCBldGMgdGhyb3VnaCBkaXNwYXRjaGVyXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRBY2NvdW50RGF0YShcIm0uaWRlbnRpdHlfc2VydmVyXCIsIHtcbiAgICAgICAgICAgIGJhc2VfdXJsOiBmdWxsVXJsLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBmdWxsVXJsLFxuICAgICAgICAgICAgaWRTZXJ2ZXI6ICcnLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjaGVja0lkU2VydmVyID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB7IGlkU2VydmVyLCBjdXJyZW50Q2xpZW50SWRTZXJ2ZXIgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJ1c3k6IHRydWUsIGNoZWNraW5nOiB0cnVlLCBlcnJvcjogbnVsbCB9KTtcblxuICAgICAgICBjb25zdCBmdWxsVXJsID0gdW5hYmJyZXZpYXRlVXJsKGlkU2VydmVyKTtcblxuICAgICAgICBsZXQgZXJyU3RyID0gYXdhaXQgY2hlY2tJZGVudGl0eVNlcnZlclVybChmdWxsVXJsKTtcbiAgICAgICAgaWYgKCFlcnJTdHIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNoZWNraW5nOiBmYWxzZSB9KTsgLy8gY2xlYXIgdG9vbHRpcFxuXG4gICAgICAgICAgICAgICAgLy8gVGVzdCB0aGUgaWRlbnRpdHkgc2VydmVyIGJ5IHRyeWluZyB0byByZWdpc3RlciB3aXRoIGl0LiBUaGlzXG4gICAgICAgICAgICAgICAgLy8gbWF5IHJlc3VsdCBpbiBhIHRlcm1zIG9mIHNlcnZpY2UgcHJvbXB0LlxuICAgICAgICAgICAgICAgIGNvbnN0IGF1dGhDbGllbnQgPSBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KGZ1bGxVcmwpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGF1dGhDbGllbnQuZ2V0QWNjZXNzVG9rZW4oKTtcblxuICAgICAgICAgICAgICAgIGxldCBzYXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8vIERvdWJsZSBjaGVjayB0aGF0IHRoZSBpZGVudGl0eSBzZXJ2ZXIgZXZlbiBoYXMgdGVybXMgb2Ygc2VydmljZS5cbiAgICAgICAgICAgICAgICBjb25zdCBoYXNUZXJtcyA9IGF3YWl0IGRvZXNJZGVudGl0eVNlcnZlckhhdmVUZXJtcyhmdWxsVXJsKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1Rlcm1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgdGhpcy5zaG93Tm9UZXJtc1dhcm5pbmcoZnVsbFVybCk7XG4gICAgICAgICAgICAgICAgICAgIHNhdmUgPSBjb25maXJtZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU2hvdyBhIGdlbmVyYWwgd2FybmluZywgcG9zc2libHkgd2l0aCBkZXRhaWxzIGFib3V0IGFueSBib3VuZFxuICAgICAgICAgICAgICAgIC8vIDNQSURzIHRoYXQgd291bGQgYmUgbGVmdCBiZWhpbmQuXG4gICAgICAgICAgICAgICAgaWYgKHNhdmUgJiYgY3VycmVudENsaWVudElkU2VydmVyICYmIGZ1bGxVcmwgIT09IGN1cnJlbnRDbGllbnRJZFNlcnZlcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IHRoaXMuc2hvd1NlcnZlckNoYW5nZVdhcm5pbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQ2hhbmdlIGlkZW50aXR5IHNlcnZlclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuYm91bmRNZXNzYWdlOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkRpc2Nvbm5lY3QgZnJvbSB0aGUgaWRlbnRpdHkgc2VydmVyIDxjdXJyZW50IC8+IGFuZCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb25uZWN0IHRvIDxuZXcgLz4gaW5zdGVhZD9cIiwge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBzdWIgPT4gPGI+eyBhYmJyZXZpYXRlVXJsKGN1cnJlbnRDbGllbnRJZFNlcnZlcikgfTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldzogc3ViID0+IDxiPnsgYWJicmV2aWF0ZVVybChpZFNlcnZlcikgfTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b246IF90KFwiQ29udGludWVcIiksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYXZlID0gY29uZmlybWVkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzYXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUlkU2VydmVyKGZ1bGxVcmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgZXJyU3RyID0gX3QoXCJUZXJtcyBvZiBzZXJ2aWNlIG5vdCBhY2NlcHRlZCBvciB0aGUgaWRlbnRpdHkgc2VydmVyIGlzIGludmFsaWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBjaGVja2luZzogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogZXJyU3RyLFxuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2hvd05vVGVybXNXYXJuaW5nKGZ1bGxVcmwpIHtcbiAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJJZGVudGl0eSBzZXJ2ZXIgaGFzIG5vIHRlcm1zIG9mIHNlcnZpY2VcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJUaGUgaWRlbnRpdHkgc2VydmVyIHlvdSBoYXZlIGNob3NlbiBkb2VzIG5vdCBoYXZlIGFueSB0ZXJtcyBvZiBzZXJ2aWNlLlwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAmbmJzcDt7IF90KFwiT25seSBjb250aW51ZSBpZiB5b3UgdHJ1c3QgdGhlIG93bmVyIG9mIHRoZSBzZXJ2ZXIuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDb250aW51ZVwiKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmaW5pc2hlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGlzY29ubmVjdENsaWNrZWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkaXNjb25uZWN0QnVzeTogdHJ1ZSB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgdGhpcy5zaG93U2VydmVyQ2hhbmdlV2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRGlzY29ubmVjdCBpZGVudGl0eSBzZXJ2ZXJcIiksXG4gICAgICAgICAgICAgICAgdW5ib3VuZE1lc3NhZ2U6IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkRpc2Nvbm5lY3QgZnJvbSB0aGUgaWRlbnRpdHkgc2VydmVyIDxpZHNlcnZlciAvPj9cIiwge30sXG4gICAgICAgICAgICAgICAgICAgIHsgaWRzZXJ2ZXI6IHN1YiA9PiA8Yj57IGFiYnJldmlhdGVVcmwodGhpcy5zdGF0ZS5jdXJyZW50Q2xpZW50SWRTZXJ2ZXIpIH08L2I+IH0sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBidXR0b246IF90KFwiRGlzY29ubmVjdFwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzY29ubmVjdElkU2VydmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGlzY29ubmVjdEJ1c3k6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgc2hvd1NlcnZlckNoYW5nZVdhcm5pbmcoeyB0aXRsZSwgdW5ib3VuZE1lc3NhZ2UsIGJ1dHRvbiB9KSB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudENsaWVudElkU2VydmVyIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGxldCB0aHJlZXBpZHMgPSBbXTtcbiAgICAgICAgbGV0IGN1cnJlbnRTZXJ2ZXJSZWFjaGFibGUgPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyZWVwaWRzID0gYXdhaXQgdGltZW91dChcbiAgICAgICAgICAgICAgICBnZXRUaHJlZXBpZHNXaXRoQmluZFN0YXR1cyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkpLFxuICAgICAgICAgICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIlRpbWVvdXQgYXR0ZW1wdGluZyB0byByZWFjaCBpZGVudGl0eSBzZXJ2ZXJcIikpLFxuICAgICAgICAgICAgICAgIFJFQUNIQUJJTElUWV9USU1FT1VULFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY3VycmVudFNlcnZlclJlYWNoYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgICAgYFVuYWJsZSB0byByZWFjaCBpZGVudGl0eSBzZXJ2ZXIgYXQgJHtjdXJyZW50Q2xpZW50SWRTZXJ2ZXJ9IHRvIGNoZWNrIGAgK1xuICAgICAgICAgICAgICAgIGBmb3IgM1BJRHMgZHVyaW5nIElTIGNoYW5nZSBmbG93YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsb2dnZXIud2FybihlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib3VuZFRocmVlcGlkcyA9IHRocmVlcGlkcy5maWx0ZXIodHAgPT4gdHAuYm91bmQpO1xuICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgbGV0IGRhbmdlciA9IGZhbHNlO1xuICAgICAgICBjb25zdCBtZXNzYWdlRWxlbWVudHMgPSB7XG4gICAgICAgICAgICBpZHNlcnZlcjogc3ViID0+IDxiPnsgYWJicmV2aWF0ZVVybChjdXJyZW50Q2xpZW50SWRTZXJ2ZXIpIH08L2I+LFxuICAgICAgICAgICAgYjogc3ViID0+IDxiPnsgc3ViIH08L2I+LFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIWN1cnJlbnRTZXJ2ZXJSZWFjaGFibGUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiWW91IHNob3VsZCA8Yj5yZW1vdmUgeW91ciBwZXJzb25hbCBkYXRhPC9iPiBmcm9tIGlkZW50aXR5IHNlcnZlciBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGlkc2VydmVyIC8+IGJlZm9yZSBkaXNjb25uZWN0aW5nLiBVbmZvcnR1bmF0ZWx5LCBpZGVudGl0eSBzZXJ2ZXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxpZHNlcnZlciAvPiBpcyBjdXJyZW50bHkgb2ZmbGluZSBvciBjYW5ub3QgYmUgcmVhY2hlZC5cIixcbiAgICAgICAgICAgICAgICAgICAge30sIG1lc3NhZ2VFbGVtZW50cyxcbiAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIllvdSBzaG91bGQ6XCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2hlY2sgeW91ciBicm93c2VyIHBsdWdpbnMgZm9yIGFueXRoaW5nIHRoYXQgbWlnaHQgYmxvY2sgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGUgaWRlbnRpdHkgc2VydmVyIChzdWNoIGFzIFByaXZhY3kgQmFkZ2VyKVwiLFxuICAgICAgICAgICAgICAgICAgICApIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcImNvbnRhY3QgdGhlIGFkbWluaXN0cmF0b3JzIG9mIGlkZW50aXR5IHNlcnZlciA8aWRzZXJ2ZXIgLz5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkc2VydmVyOiBtZXNzYWdlRWxlbWVudHMuaWRzZXJ2ZXIsXG4gICAgICAgICAgICAgICAgICAgIH0pIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIndhaXQgYW5kIHRyeSBhZ2FpbiBsYXRlclwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgZGFuZ2VyID0gdHJ1ZTtcbiAgICAgICAgICAgIGJ1dHRvbiA9IF90KFwiRGlzY29ubmVjdCBhbnl3YXlcIik7XG4gICAgICAgIH0gZWxzZSBpZiAoYm91bmRUaHJlZXBpZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIllvdSBhcmUgc3RpbGwgPGI+c2hhcmluZyB5b3VyIHBlcnNvbmFsIGRhdGE8L2I+IG9uIHRoZSBpZGVudGl0eSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwic2VydmVyIDxpZHNlcnZlciAvPi5cIiwge30sIG1lc3NhZ2VFbGVtZW50cyxcbiAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJXZSByZWNvbW1lbmQgdGhhdCB5b3UgcmVtb3ZlIHlvdXIgZW1haWwgYWRkcmVzc2VzIGFuZCBwaG9uZSBudW1iZXJzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJmcm9tIHRoZSBpZGVudGl0eSBzZXJ2ZXIgYmVmb3JlIGRpc2Nvbm5lY3RpbmcuXCIsXG4gICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgZGFuZ2VyID0gdHJ1ZTtcbiAgICAgICAgICAgIGJ1dHRvbiA9IF90KFwiRGlzY29ubmVjdCBhbnl3YXlcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gdW5ib3VuZE1lc3NhZ2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2coUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1lc3NhZ2UsXG4gICAgICAgICAgICBidXR0b24sXG4gICAgICAgICAgICBjYW5jZWxCdXR0b246IF90KFwiR28gYmFja1wiKSxcbiAgICAgICAgICAgIGRhbmdlcixcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmaW5pc2hlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRpc2Nvbm5lY3RJZFNlcnZlciA9ICgpID0+IHtcbiAgICAgICAgLy8gQWNjb3VudCBkYXRhIGNoYW5nZSB3aWxsIHVwZGF0ZSBsb2NhbHN0b3JhZ2UsIGNsaWVudCwgZXRjIHRocm91Z2ggZGlzcGF0Y2hlclxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0QWNjb3VudERhdGEoXCJtLmlkZW50aXR5X3NlcnZlclwiLCB7XG4gICAgICAgICAgICBiYXNlX3VybDogbnVsbCwgLy8gY2xlYXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IG5ld0ZpZWxkVmFsID0gJyc7XG4gICAgICAgIGlmIChnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgLy8gUHJlcG9wdWxhdGUgdGhlIGNsaWVudCdzIGRlZmF1bHQgc28gdGhlIHVzZXIgYXQgbGVhc3QgaGFzIHNvbWUgaWRlYSBvZlxuICAgICAgICAgICAgLy8gYSB2YWxpZCB2YWx1ZSB0aGV5IG1pZ2h0IGVudGVyXG4gICAgICAgICAgICBuZXdGaWVsZFZhbCA9IGFiYnJldmlhdGVVcmwoZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgY3VycmVudENsaWVudElkU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSxcbiAgICAgICAgICAgIGlkU2VydmVyOiBuZXdGaWVsZFZhbCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgaWRTZXJ2ZXJVcmwgPSB0aGlzLnN0YXRlLmN1cnJlbnRDbGllbnRJZFNlcnZlcjtcbiAgICAgICAgbGV0IHNlY3Rpb25UaXRsZTtcbiAgICAgICAgbGV0IGJvZHlUZXh0O1xuICAgICAgICBpZiAoaWRTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgIHNlY3Rpb25UaXRsZSA9IF90KFwiSWRlbnRpdHkgc2VydmVyICglKHNlcnZlcilzKVwiLCB7IHNlcnZlcjogYWJicmV2aWF0ZVVybChpZFNlcnZlclVybCkgfSk7XG4gICAgICAgICAgICBib2R5VGV4dCA9IF90KFxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBjdXJyZW50bHkgdXNpbmcgPHNlcnZlcj48L3NlcnZlcj4gdG8gZGlzY292ZXIgYW5kIGJlIGRpc2NvdmVyYWJsZSBieSBcIiArXG4gICAgICAgICAgICAgICAgXCJleGlzdGluZyBjb250YWN0cyB5b3Uga25vdy4gWW91IGNhbiBjaGFuZ2UgeW91ciBpZGVudGl0eSBzZXJ2ZXIgYmVsb3cuXCIsXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgeyBzZXJ2ZXI6IHN1YiA9PiA8Yj57IGFiYnJldmlhdGVVcmwoaWRTZXJ2ZXJVcmwpIH08L2I+IH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubWlzc2luZ1Rlcm1zKSB7XG4gICAgICAgICAgICAgICAgYm9keVRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgPHNlcnZlciAvPiB0byBkaXNjb3ZlciBhbmQgYmUgZGlzY292ZXJhYmxlIGJ5IGV4aXN0aW5nIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJjb250YWN0cyB5b3Uga25vdywgZW50ZXIgYW5vdGhlciBpZGVudGl0eSBzZXJ2ZXIgYmVsb3cuXCIsXG4gICAgICAgICAgICAgICAgICAgIHt9LCB7IHNlcnZlcjogc3ViID0+IDxiPnsgYWJicmV2aWF0ZVVybChpZFNlcnZlclVybCkgfTwvYj4gfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VjdGlvblRpdGxlID0gX3QoXCJJZGVudGl0eSBzZXJ2ZXJcIik7XG4gICAgICAgICAgICBib2R5VGV4dCA9IF90KFxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBub3QgY3VycmVudGx5IHVzaW5nIGFuIGlkZW50aXR5IHNlcnZlci4gXCIgK1xuICAgICAgICAgICAgICAgIFwiVG8gZGlzY292ZXIgYW5kIGJlIGRpc2NvdmVyYWJsZSBieSBleGlzdGluZyBjb250YWN0cyB5b3Uga25vdywgXCIgK1xuICAgICAgICAgICAgICAgIFwiYWRkIG9uZSBiZWxvdy5cIixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGlzY29TZWN0aW9uO1xuICAgICAgICBpZiAoaWRTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgIGxldCBkaXNjb0J1dHRvbkNvbnRlbnQ6IFJlYWN0LlJlYWN0Tm9kZSA9IF90KFwiRGlzY29ubmVjdFwiKTtcbiAgICAgICAgICAgIGxldCBkaXNjb0JvZHlUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJEaXNjb25uZWN0aW5nIGZyb20geW91ciBpZGVudGl0eSBzZXJ2ZXIgd2lsbCBtZWFuIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgXCJ3b24ndCBiZSBkaXNjb3ZlcmFibGUgYnkgb3RoZXIgdXNlcnMgYW5kIHlvdSB3b24ndCBiZSBcIiArXG4gICAgICAgICAgICAgICAgXCJhYmxlIHRvIGludml0ZSBvdGhlcnMgYnkgZW1haWwgb3IgcGhvbmUuXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubWlzc2luZ1Rlcm1zKSB7XG4gICAgICAgICAgICAgICAgZGlzY29Cb2R5VGV4dCA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlVzaW5nIGFuIGlkZW50aXR5IHNlcnZlciBpcyBvcHRpb25hbC4gSWYgeW91IGNob29zZSBub3QgdG8gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIsIHlvdSB3b24ndCBiZSBkaXNjb3ZlcmFibGUgYnkgb3RoZXIgdXNlcnMgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImFuZCB5b3Ugd29uJ3QgYmUgYWJsZSB0byBpbnZpdGUgb3RoZXJzIGJ5IGVtYWlsIG9yIHBob25lLlwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgZGlzY29CdXR0b25Db250ZW50ID0gX3QoXCJEbyBub3QgdXNlIGFuIGlkZW50aXR5IHNlcnZlclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmRpc2Nvbm5lY3RCdXN5KSB7XG4gICAgICAgICAgICAgICAgZGlzY29CdXR0b25Db250ZW50ID0gPElubGluZVNwaW5uZXIgLz47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNjb1NlY3Rpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0XCI+eyBkaXNjb0JvZHlUZXh0IH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vbkRpc2Nvbm5lY3RDbGlja2VkfSBraW5kPVwiZGFuZ2VyX3NtXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgZGlzY29CdXR0b25Db250ZW50IH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibXhfU2V0SWRTZXJ2ZXJcIiBvblN1Ym1pdD17dGhpcy5jaGVja0lkU2VydmVyfT5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgc2VjdGlvblRpdGxlIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBib2R5VGV4dCB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJFbnRlciBhIG5ldyBpZGVudGl0eSBzZXJ2ZXJcIil9XG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMuc3RhdGUuZGVmYXVsdElkU2VydmVyfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5pZFNlcnZlcn1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25JZGVudGl0eVNlcnZlckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBDb250ZW50PXt0aGlzLmdldFRvb2x0aXAoKX1cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1NldElkU2VydmVyX3Rvb2x0aXBcIlxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbGlkaXR5PXt0aGlzLnN0YXRlLmVycm9yID8gZmFsc2UgOiBudWxsfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5jaGVja0lkU2VydmVyfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuaWRTZXJ2ZXJDaGFuZ2VFbmFibGVkKCl9XG4gICAgICAgICAgICAgICAgPnsgX3QoXCJDaGFuZ2VcIikgfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICB7IGRpc2NvU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICk7XG4gICAgfVxufVxu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