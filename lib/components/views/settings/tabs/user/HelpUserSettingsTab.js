"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _createRoom = _interopRequireDefault(require("../../../../../createRoom"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _PlatformPeg = _interopRequireDefault(require("../../../../../PlatformPeg"));

var _UpdateCheckButton = _interopRequireDefault(require("../../UpdateCheckButton"));

var _BugReportDialog = _interopRequireDefault(require("../../../dialogs/BugReportDialog"));

var _actions = require("../../../../../dispatcher/actions");

var _UserTab = require("../../../dialogs/UserTab");

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _CopyableText = _interopRequireDefault(require("../../../elements/CopyableText"));

/*
Copyright 2019 - 2022 The Matrix.org Foundation C.I.C.

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
class HelpUserSettingsTab extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onClearCacheAndReload", e => {
      if (!_PlatformPeg.default.get()) return; // Dev note: please keep this log line, it's useful when troubleshooting a MatrixClient suddenly
      // stopping in the middle of the logs.

      _logger.logger.log("Clear cache & reload clicked");

      _MatrixClientPeg.MatrixClientPeg.get().stopClient();

      _MatrixClientPeg.MatrixClientPeg.get().store.deleteAllData().then(() => {
        _PlatformPeg.default.get().reload();
      });
    });
    (0, _defineProperty2.default)(this, "onBugReport", e => {
      _Modal.default.createDialog(_BugReportDialog.default, {});
    });
    (0, _defineProperty2.default)(this, "onStartBotChat", e => {
      this.props.closeSettingsFn();
      (0, _createRoom.default)({
        dmUserId: _SdkConfig.default.get("welcome_user_id"),
        andView: true
      });
    });
    (0, _defineProperty2.default)(this, "getVersionTextToCopy", () => {
      const {
        appVersion,
        olmVersion
      } = this.getVersionInfo();
      return `${appVersion}\n${olmVersion}`;
    });
    (0, _defineProperty2.default)(this, "onKeyboardShortcutsClicked", () => {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewUserSettings,
        initialTabId: _UserTab.UserTab.Keyboard
      });
    });
    this.state = {
      appVersion: null,
      canUpdate: false
    };
  }

  componentDidMount() {
    _PlatformPeg.default.get().getAppVersion().then(ver => this.setState({
      appVersion: ver
    })).catch(e => {
      _logger.logger.error("Error getting vector version: ", e);
    });

    _PlatformPeg.default.get().canSelfUpdate().then(v => this.setState({
      canUpdate: v
    })).catch(e => {
      _logger.logger.error("Error getting self updatability: ", e);
    });
  }

  getVersionInfo() {
    const brand = _SdkConfig.default.get().brand;

    const appVersion = this.state.appVersion || 'unknown';

    const olmVersionTuple = _MatrixClientPeg.MatrixClientPeg.get().olmVersion;

    const olmVersion = olmVersionTuple ? `${olmVersionTuple[0]}.${olmVersionTuple[1]}.${olmVersionTuple[2]}` : '<not-enabled>';
    return {
      appVersion: `${(0, _languageHandler._t)("%(brand)s version:", {
        brand
      })} ${appVersion}`,
      olmVersion: `${(0, _languageHandler._t)("Olm version:")} ${olmVersion}`
    };
  }

  renderLegal() {
    const tocLinks = _SdkConfig.default.get().terms_and_conditions_links;

    if (!tocLinks) return null;
    const legalLinks = [];

    for (const tocEntry of tocLinks) {
      legalLinks.push( /*#__PURE__*/_react.default.createElement("div", {
        key: tocEntry.url
      }, /*#__PURE__*/_react.default.createElement("a", {
        href: tocEntry.url,
        rel: "noreferrer noopener",
        target: "_blank"
      }, tocEntry.text)));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Legal")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, legalLinks));
  }

  renderCredits() {
    // Note: This is not translated because it is legal text.
    // Also, &nbsp; is ugly but necessary.
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Credits")), /*#__PURE__*/_react.default.createElement("ul", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("li", null, "The ", /*#__PURE__*/_react.default.createElement("a", {
      href: "themes/element/img/backgrounds/lake.jpg",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "default cover photo"), " is \xA9\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://www.flickr.com/golan",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Jes\xFAs Roncero"), " used under the terms of\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://creativecommons.org/licenses/by-sa/4.0/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "CC-BY-SA 4.0"), "."), /*#__PURE__*/_react.default.createElement("li", null, "The ", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://github.com/matrix-org/twemoji-colr",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "twemoji-colr"), " font is \xA9\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://mozilla.org",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Mozilla Foundation"), " used under the terms of\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://www.apache.org/licenses/LICENSE-2.0",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Apache 2.0"), "."), /*#__PURE__*/_react.default.createElement("li", null, "The ", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://twemoji.twitter.com/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Twemoji"), " emoji art is \xA9\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://twemoji.twitter.com/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Twitter, Inc and other contributors"), " used under the terms of\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://creativecommons.org/licenses/by/4.0/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "CC-BY 4.0"), ".")));
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    let faqText = (0, _languageHandler._t)('For help with using %(brand)s, click <a>here</a>.', {
      brand
    }, {
      'a': sub => /*#__PURE__*/_react.default.createElement("a", {
        href: "https://element.io/help",
        rel: "noreferrer noopener",
        target: "_blank"
      }, sub)
    });

    if (_SdkConfig.default.get("welcome_user_id") && (0, _languageHandler.getCurrentLanguage)().startsWith('en')) {
      faqText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('For help with using %(brand)s, click <a>here</a> or start a chat with our ' + 'bot using the button below.', {
        brand
      }, {
        'a': sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "https://element.io/help",
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub)
      }), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onStartBotChat,
        kind: "primary"
      }, (0, _languageHandler._t)("Chat with %(brand)s Bot", {
        brand
      }))));
    }

    let updateButton = null;

    if (this.state.canUpdate) {
      updateButton = /*#__PURE__*/_react.default.createElement(_UpdateCheckButton.default, null);
    }

    let bugReportingSection;

    if (_SdkConfig.default.get().bug_report_endpoint_url) {
      bugReportingSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, _languageHandler._t)('Bug reporting')), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("If you've submitted a bug via GitHub, debug logs can help " + "us track down the problem. "), (0, _languageHandler._t)("Debug logs contain application " + "usage data including your username, the IDs or aliases of " + "the rooms you have visited, which UI elements you " + "last interacted with, and the usernames of other users. " + "They do not contain messages.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onBugReport,
        kind: "primary"
      }, (0, _languageHandler._t)("Submit debug logs")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("To report a Matrix-related security issue, please read the Matrix.org " + "<a>Security Disclosure Policy</a>.", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "https://matrix.org/security-disclosure-policy/",
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub)
      })));
    }

    const {
      appVersion,
      olmVersion
    } = this.getVersionInfo();
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_HelpUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Help & About")), bugReportingSection, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("FAQ")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, faqText), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: this.onKeyboardShortcutsClicked
    }, (0, _languageHandler._t)("Keyboard Shortcuts"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Versions")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement(_CopyableText.default, {
      getTextToCopy: this.getVersionTextToCopy
    }, appVersion, /*#__PURE__*/_react.default.createElement("br", null), olmVersion, /*#__PURE__*/_react.default.createElement("br", null)), updateButton)), this.renderLegal(), this.renderCredits(), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Homeserver is"), " ", /*#__PURE__*/_react.default.createElement("code", null, _MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl())), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Identity server is"), " ", /*#__PURE__*/_react.default.createElement("code", null, _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl())), /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Access Token")), /*#__PURE__*/_react.default.createElement("b", null, (0, _languageHandler._t)("Your access token gives full access to your account." + " Do not share it with anyone.")), /*#__PURE__*/_react.default.createElement(_CopyableText.default, {
      getTextToCopy: () => _MatrixClientPeg.MatrixClientPeg.get().getAccessToken()
    }, _MatrixClientPeg.MatrixClientPeg.get().getAccessToken())), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onClearCacheAndReload,
      kind: "danger"
    }, (0, _languageHandler._t)("Clear cache and reload")))));
  }

}

exports.default = HelpUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIZWxwVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZSIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwibG9nZ2VyIiwibG9nIiwiTWF0cml4Q2xpZW50UGVnIiwic3RvcENsaWVudCIsInN0b3JlIiwiZGVsZXRlQWxsRGF0YSIsInRoZW4iLCJyZWxvYWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkJ1Z1JlcG9ydERpYWxvZyIsImNsb3NlU2V0dGluZ3NGbiIsImNyZWF0ZVJvb20iLCJkbVVzZXJJZCIsIlNka0NvbmZpZyIsImFuZFZpZXciLCJhcHBWZXJzaW9uIiwib2xtVmVyc2lvbiIsImdldFZlcnNpb25JbmZvIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwiaW5pdGlhbFRhYklkIiwiVXNlclRhYiIsIktleWJvYXJkIiwic3RhdGUiLCJjYW5VcGRhdGUiLCJjb21wb25lbnREaWRNb3VudCIsImdldEFwcFZlcnNpb24iLCJ2ZXIiLCJzZXRTdGF0ZSIsImNhdGNoIiwiZXJyb3IiLCJjYW5TZWxmVXBkYXRlIiwidiIsImJyYW5kIiwib2xtVmVyc2lvblR1cGxlIiwiX3QiLCJyZW5kZXJMZWdhbCIsInRvY0xpbmtzIiwidGVybXNfYW5kX2NvbmRpdGlvbnNfbGlua3MiLCJsZWdhbExpbmtzIiwidG9jRW50cnkiLCJwdXNoIiwidXJsIiwidGV4dCIsInJlbmRlckNyZWRpdHMiLCJyZW5kZXIiLCJmYXFUZXh0Iiwic3ViIiwiZ2V0Q3VycmVudExhbmd1YWdlIiwic3RhcnRzV2l0aCIsIm9uU3RhcnRCb3RDaGF0IiwidXBkYXRlQnV0dG9uIiwiYnVnUmVwb3J0aW5nU2VjdGlvbiIsImJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsIiwib25CdWdSZXBvcnQiLCJhIiwib25LZXlib2FyZFNob3J0Y3V0c0NsaWNrZWQiLCJnZXRWZXJzaW9uVGV4dFRvQ29weSIsImdldEhvbWVzZXJ2ZXJVcmwiLCJnZXRJZGVudGl0eVNlcnZlclVybCIsImdldEFjY2Vzc1Rva2VuIiwib25DbGVhckNhY2hlQW5kUmVsb2FkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvdGFicy91c2VyL0hlbHBVc2VyU2V0dGluZ3NUYWIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgX3QsIGdldEN1cnJlbnRMYW5ndWFnZSB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IGNyZWF0ZVJvb20gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2NyZWF0ZVJvb21cIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vUGxhdGZvcm1QZWdcIjtcbmltcG9ydCBVcGRhdGVDaGVja0J1dHRvbiBmcm9tIFwiLi4vLi4vVXBkYXRlQ2hlY2tCdXR0b25cIjtcbmltcG9ydCBCdWdSZXBvcnREaWFsb2cgZnJvbSAnLi4vLi4vLi4vZGlhbG9ncy9CdWdSZXBvcnREaWFsb2cnO1xuaW1wb3J0IHsgT3BlblRvVGFiUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL09wZW5Ub1RhYlBheWxvYWRcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IFVzZXJUYWIgfSBmcm9tIFwiLi4vLi4vLi4vZGlhbG9ncy9Vc2VyVGFiXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBDb3B5YWJsZVRleHQgZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0NvcHlhYmxlVGV4dFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBjbG9zZVNldHRpbmdzRm46ICgpID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGFwcFZlcnNpb246IHN0cmluZztcbiAgICBjYW5VcGRhdGU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlbHBVc2VyU2V0dGluZ3NUYWIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGFwcFZlcnNpb246IG51bGwsXG4gICAgICAgICAgICBjYW5VcGRhdGU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRBcHBWZXJzaW9uKCkudGhlbigodmVyKSA9PiB0aGlzLnNldFN0YXRlKHsgYXBwVmVyc2lvbjogdmVyIH0pKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgZ2V0dGluZyB2ZWN0b3IgdmVyc2lvbjogXCIsIGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkuY2FuU2VsZlVwZGF0ZSgpLnRoZW4oKHYpID0+IHRoaXMuc2V0U3RhdGUoeyBjYW5VcGRhdGU6IHYgfSkpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciBnZXR0aW5nIHNlbGYgdXBkYXRhYmlsaXR5OiBcIiwgZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VmVyc2lvbkluZm8oKTogeyBhcHBWZXJzaW9uOiBzdHJpbmcsIG9sbVZlcnNpb246IHN0cmluZyB9IHtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgIGNvbnN0IGFwcFZlcnNpb24gPSB0aGlzLnN0YXRlLmFwcFZlcnNpb24gfHwgJ3Vua25vd24nO1xuICAgICAgICBjb25zdCBvbG1WZXJzaW9uVHVwbGUgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub2xtVmVyc2lvbjtcbiAgICAgICAgY29uc3Qgb2xtVmVyc2lvbiA9IG9sbVZlcnNpb25UdXBsZVxuICAgICAgICAgICAgPyBgJHtvbG1WZXJzaW9uVHVwbGVbMF19LiR7b2xtVmVyc2lvblR1cGxlWzFdfS4ke29sbVZlcnNpb25UdXBsZVsyXX1gXG4gICAgICAgICAgICA6ICc8bm90LWVuYWJsZWQ+JztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYXBwVmVyc2lvbjogYCR7X3QoXCIlKGJyYW5kKXMgdmVyc2lvbjpcIiwgeyBicmFuZCB9KX0gJHthcHBWZXJzaW9ufWAsXG4gICAgICAgICAgICBvbG1WZXJzaW9uOiBgJHtfdChcIk9sbSB2ZXJzaW9uOlwiKX0gJHtvbG1WZXJzaW9ufWAsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNsZWFyQ2FjaGVBbmRSZWxvYWQgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIVBsYXRmb3JtUGVnLmdldCgpKSByZXR1cm47XG5cbiAgICAgICAgLy8gRGV2IG5vdGU6IHBsZWFzZSBrZWVwIHRoaXMgbG9nIGxpbmUsIGl0J3MgdXNlZnVsIHdoZW4gdHJvdWJsZXNob290aW5nIGEgTWF0cml4Q2xpZW50IHN1ZGRlbmx5XG4gICAgICAgIC8vIHN0b3BwaW5nIGluIHRoZSBtaWRkbGUgb2YgdGhlIGxvZ3MuXG4gICAgICAgIGxvZ2dlci5sb2coXCJDbGVhciBjYWNoZSAmIHJlbG9hZCBjbGlja2VkXCIpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcENsaWVudCgpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcmUuZGVsZXRlQWxsRGF0YSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkucmVsb2FkKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQnVnUmVwb3J0ID0gKGUpID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEJ1Z1JlcG9ydERpYWxvZywge30pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3RhcnRCb3RDaGF0ID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5jbG9zZVNldHRpbmdzRm4oKTtcbiAgICAgICAgY3JlYXRlUm9vbSh7XG4gICAgICAgICAgICBkbVVzZXJJZDogU2RrQ29uZmlnLmdldChcIndlbGNvbWVfdXNlcl9pZFwiKSxcbiAgICAgICAgICAgIGFuZFZpZXc6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckxlZ2FsKCkge1xuICAgICAgICBjb25zdCB0b2NMaW5rcyA9IFNka0NvbmZpZy5nZXQoKS50ZXJtc19hbmRfY29uZGl0aW9uc19saW5rcztcbiAgICAgICAgaWYgKCF0b2NMaW5rcykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgbGVnYWxMaW5rcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHRvY0VudHJ5IG9mIHRvY0xpbmtzKSB7XG4gICAgICAgICAgICBsZWdhbExpbmtzLnB1c2goPGRpdiBrZXk9e3RvY0VudHJ5LnVybH0+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj17dG9jRW50cnkudXJsfSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+eyB0b2NFbnRyeS50ZXh0IH08L2E+XG4gICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPnsgX3QoXCJMZWdhbFwiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIHsgbGVnYWxMaW5rcyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckNyZWRpdHMoKSB7XG4gICAgICAgIC8vIE5vdGU6IFRoaXMgaXMgbm90IHRyYW5zbGF0ZWQgYmVjYXVzZSBpdCBpcyBsZWdhbCB0ZXh0LlxuICAgICAgICAvLyBBbHNvLCAmbmJzcDsgaXMgdWdseSBidXQgbmVjZXNzYXJ5LlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24nPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+eyBfdChcIkNyZWRpdHNcIikgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgICAgIFRoZSA8YSBocmVmPVwidGhlbWVzL2VsZW1lbnQvaW1nL2JhY2tncm91bmRzL2xha2UuanBnXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQgY292ZXIgcGhvdG9cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT4gaXMgwqkmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3d3dy5mbGlja3IuY29tL2dvbGFuXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEplc8O6cyBSb25jZXJvXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+IHVzZWQgdW5kZXIgdGhlIHRlcm1zIG9mJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzQuMC9cIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ0MtQlktU0EgNC4wXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+LlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICBUaGUgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvdHdlbW9qaS1jb2xyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR3ZW1vamktY29sclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPiBmb250IGlzIMKpJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9tb3ppbGxhLm9yZ1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiB0YXJnZXQ9XCJfYmxhbmtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb3ppbGxhIEZvdW5kYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT4gdXNlZCB1bmRlciB0aGUgdGVybXMgb2YmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPkFwYWNoZSAyLjA8L2E+LlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICBUaGUgPGEgaHJlZj1cImh0dHBzOi8vdHdlbW9qaS50d2l0dGVyLmNvbS9cIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVHdlbW9qaVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPiBlbW9qaSBhcnQgaXMgwqkmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3R3ZW1vamkudHdpdHRlci5jb20vXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFR3aXR0ZXIsIEluYyBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+IHVzZWQgdW5kZXIgdGhlIHRlcm1zIG9mJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzQuMC9cIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ0MtQlkgNC4wXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+LlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFZlcnNpb25UZXh0VG9Db3B5ID0gKCk6IHN0cmluZyA9PiB7XG4gICAgICAgIGNvbnN0IHsgYXBwVmVyc2lvbiwgb2xtVmVyc2lvbiB9ID0gdGhpcy5nZXRWZXJzaW9uSW5mbygpO1xuICAgICAgICByZXR1cm4gYCR7YXBwVmVyc2lvbn1cXG4ke29sbVZlcnNpb259YDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleWJvYXJkU2hvcnRjdXRzQ2xpY2tlZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoPE9wZW5Ub1RhYlBheWxvYWQ+KHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MsXG4gICAgICAgICAgICBpbml0aWFsVGFiSWQ6IFVzZXJUYWIuS2V5Ym9hcmQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuXG4gICAgICAgIGxldCBmYXFUZXh0ID0gX3QoXG4gICAgICAgICAgICAnRm9yIGhlbHAgd2l0aCB1c2luZyAlKGJyYW5kKXMsIGNsaWNrIDxhPmhlcmU8L2E+LicsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYnJhbmQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT4gPGFcbiAgICAgICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZWxlbWVudC5pby9oZWxwXCJcbiAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgPC9hPixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgICAgIGlmIChTZGtDb25maWcuZ2V0KFwid2VsY29tZV91c2VyX2lkXCIpICYmIGdldEN1cnJlbnRMYW5ndWFnZSgpLnN0YXJ0c1dpdGgoJ2VuJykpIHtcbiAgICAgICAgICAgIGZhcVRleHQgPSAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICdGb3IgaGVscCB3aXRoIHVzaW5nICUoYnJhbmQpcywgY2xpY2sgPGE+aGVyZTwvYT4gb3Igc3RhcnQgYSBjaGF0IHdpdGggb3VyICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2JvdCB1c2luZyB0aGUgYnV0dG9uIGJlbG93LicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT4gPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZWxlbWVudC5pby9oZWxwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPSdub3JlZmVycmVyIG5vb3BlbmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9J19ibGFuaydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uU3RhcnRCb3RDaGF0fSBraW5kPSdwcmltYXJ5Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2hhdCB3aXRoICUoYnJhbmQpcyBCb3RcIiwgeyBicmFuZCB9KSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGRhdGVCdXR0b24gPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jYW5VcGRhdGUpIHtcbiAgICAgICAgICAgIHVwZGF0ZUJ1dHRvbiA9IDxVcGRhdGVDaGVja0J1dHRvbiAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBidWdSZXBvcnRpbmdTZWN0aW9uO1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgICAgICBidWdSZXBvcnRpbmdTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPnsgX3QoJ0J1ZyByZXBvcnRpbmcnKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSd2ZSBzdWJtaXR0ZWQgYSBidWcgdmlhIEdpdEh1YiwgZGVidWcgbG9ncyBjYW4gaGVscCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1cyB0cmFjayBkb3duIHRoZSBwcm9ibGVtLiBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRlYnVnIGxvZ3MgY29udGFpbiBhcHBsaWNhdGlvbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1c2FnZSBkYXRhIGluY2x1ZGluZyB5b3VyIHVzZXJuYW1lLCB0aGUgSURzIG9yIGFsaWFzZXMgb2YgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIHJvb21zIHlvdSBoYXZlIHZpc2l0ZWQsIHdoaWNoIFVJIGVsZW1lbnRzIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYXN0IGludGVyYWN0ZWQgd2l0aCwgYW5kIHRoZSB1c2VybmFtZXMgb2Ygb3RoZXIgdXNlcnMuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRoZXkgZG8gbm90IGNvbnRhaW4gbWVzc2FnZXMuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CdWdSZXBvcnR9IGtpbmQ9J3ByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlN1Ym1pdCBkZWJ1ZyBsb2dzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRvIHJlcG9ydCBhIE1hdHJpeC1yZWxhdGVkIHNlY3VyaXR5IGlzc3VlLCBwbGVhc2UgcmVhZCB0aGUgTWF0cml4Lm9yZyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8YT5TZWN1cml0eSBEaXNjbG9zdXJlIFBvbGljeTwvYT4uXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IDxhIGhyZWY9XCJodHRwczovL21hdHJpeC5vcmcvc2VjdXJpdHktZGlzY2xvc3VyZS1wb2xpY3kvXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPnsgc3ViIH08L2E+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyBhcHBWZXJzaW9uLCBvbG1WZXJzaW9uIH0gPSB0aGlzLmdldFZlcnNpb25JbmZvKCk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWIgbXhfSGVscFVzZXJTZXR0aW5nc1RhYlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPnsgX3QoXCJIZWxwICYgQWJvdXRcIikgfTwvZGl2PlxuICAgICAgICAgICAgICAgIHsgYnVnUmVwb3J0aW5nU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24nPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPnsgX3QoXCJGQVFcIikgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZmFxVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMub25LZXlib2FyZFNob3J0Y3V0c0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIktleWJvYXJkIFNob3J0Y3V0c1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbic+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+eyBfdChcIlZlcnNpb25zXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Q29weWFibGVUZXh0IGdldFRleHRUb0NvcHk9e3RoaXMuZ2V0VmVyc2lvblRleHRUb0NvcHl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYXBwVmVyc2lvbiB9PGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBvbG1WZXJzaW9uIH08YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQ29weWFibGVUZXh0PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB1cGRhdGVCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyTGVnYWwoKSB9XG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckNyZWRpdHMoKSB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24nPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPnsgX3QoXCJBZHZhbmNlZFwiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj57IF90KFwiSG9tZXNlcnZlciBpc1wiKSB9IDxjb2RlPnsgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEhvbWVzZXJ2ZXJVcmwoKSB9PC9jb2RlPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj57IF90KFwiSWRlbnRpdHkgc2VydmVyIGlzXCIpIH0gPGNvZGU+eyBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSB9PC9jb2RlPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRldGFpbHM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN1bW1hcnk+eyBfdChcIkFjY2VzcyBUb2tlblwiKSB9PC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxiPnsgX3QoXCJZb3VyIGFjY2VzcyB0b2tlbiBnaXZlcyBmdWxsIGFjY2VzcyB0byB5b3VyIGFjY291bnQuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiIERvIG5vdCBzaGFyZSBpdCB3aXRoIGFueW9uZS5cIikgfTwvYj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29weWFibGVUZXh0IGdldFRleHRUb0NvcHk9eygpID0+IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRBY2Nlc3NUb2tlbigpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0QWNjZXNzVG9rZW4oKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Db3B5YWJsZVRleHQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2RldGFpbHM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQ2xlYXJDYWNoZUFuZFJlbG9hZH0ga2luZD0nZGFuZ2VyJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2xlYXIgY2FjaGUgYW5kIHJlbG9hZFwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNkJlLE1BQU1BLG1CQUFOLFNBQWtDQyxjQUFBLENBQU1DLFNBQXhDLENBQWtFO0VBQzdFQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZSw2REFnQ2NDLENBQUQsSUFBTztNQUNuQyxJQUFJLENBQUNDLG9CQUFBLENBQVlDLEdBQVosRUFBTCxFQUF3QixPQURXLENBR25DO01BQ0E7O01BQ0FDLGNBQUEsQ0FBT0MsR0FBUCxDQUFXLDhCQUFYOztNQUNBQyxnQ0FBQSxDQUFnQkgsR0FBaEIsR0FBc0JJLFVBQXRCOztNQUNBRCxnQ0FBQSxDQUFnQkgsR0FBaEIsR0FBc0JLLEtBQXRCLENBQTRCQyxhQUE1QixHQUE0Q0MsSUFBNUMsQ0FBaUQsTUFBTTtRQUNuRFIsb0JBQUEsQ0FBWUMsR0FBWixHQUFrQlEsTUFBbEI7TUFDSCxDQUZEO0lBR0gsQ0ExQ2tCO0lBQUEsbURBNENJVixDQUFELElBQU87TUFDekJXLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsd0JBQW5CLEVBQW9DLEVBQXBDO0lBQ0gsQ0E5Q2tCO0lBQUEsc0RBZ0RPYixDQUFELElBQU87TUFDNUIsS0FBS0QsS0FBTCxDQUFXZSxlQUFYO01BQ0EsSUFBQUMsbUJBQUEsRUFBVztRQUNQQyxRQUFRLEVBQUVDLGtCQUFBLENBQVVmLEdBQVYsQ0FBYyxpQkFBZCxDQURIO1FBRVBnQixPQUFPLEVBQUU7TUFGRixDQUFYO0lBSUgsQ0F0RGtCO0lBQUEsNERBNEhZLE1BQWM7TUFDekMsTUFBTTtRQUFFQyxVQUFGO1FBQWNDO01BQWQsSUFBNkIsS0FBS0MsY0FBTCxFQUFuQztNQUNBLE9BQVEsR0FBRUYsVUFBVyxLQUFJQyxVQUFXLEVBQXBDO0lBQ0gsQ0EvSGtCO0lBQUEsa0VBaUlrQixNQUFZO01BQzdDRSxtQkFBQSxDQUFJQyxRQUFKLENBQStCO1FBQzNCQyxNQUFNLEVBQUVDLGVBQUEsQ0FBT0MsZ0JBRFk7UUFFM0JDLFlBQVksRUFBRUMsZ0JBQUEsQ0FBUUM7TUFGSyxDQUEvQjtJQUlILENBdElrQjtJQUdmLEtBQUtDLEtBQUwsR0FBYTtNQUNUWCxVQUFVLEVBQUUsSUFESDtNQUVUWSxTQUFTLEVBQUU7SUFGRixDQUFiO0VBSUg7O0VBRURDLGlCQUFpQixHQUFTO0lBQ3RCL0Isb0JBQUEsQ0FBWUMsR0FBWixHQUFrQitCLGFBQWxCLEdBQWtDeEIsSUFBbEMsQ0FBd0N5QixHQUFELElBQVMsS0FBS0MsUUFBTCxDQUFjO01BQUVoQixVQUFVLEVBQUVlO0lBQWQsQ0FBZCxDQUFoRCxFQUFvRkUsS0FBcEYsQ0FBMkZwQyxDQUFELElBQU87TUFDN0ZHLGNBQUEsQ0FBT2tDLEtBQVAsQ0FBYSxnQ0FBYixFQUErQ3JDLENBQS9DO0lBQ0gsQ0FGRDs7SUFHQUMsb0JBQUEsQ0FBWUMsR0FBWixHQUFrQm9DLGFBQWxCLEdBQWtDN0IsSUFBbEMsQ0FBd0M4QixDQUFELElBQU8sS0FBS0osUUFBTCxDQUFjO01BQUVKLFNBQVMsRUFBRVE7SUFBYixDQUFkLENBQTlDLEVBQStFSCxLQUEvRSxDQUFzRnBDLENBQUQsSUFBTztNQUN4RkcsY0FBQSxDQUFPa0MsS0FBUCxDQUFhLG1DQUFiLEVBQWtEckMsQ0FBbEQ7SUFDSCxDQUZEO0VBR0g7O0VBRU9xQixjQUFjLEdBQStDO0lBQ2pFLE1BQU1tQixLQUFLLEdBQUd2QixrQkFBQSxDQUFVZixHQUFWLEdBQWdCc0MsS0FBOUI7O0lBQ0EsTUFBTXJCLFVBQVUsR0FBRyxLQUFLVyxLQUFMLENBQVdYLFVBQVgsSUFBeUIsU0FBNUM7O0lBQ0EsTUFBTXNCLGVBQWUsR0FBR3BDLGdDQUFBLENBQWdCSCxHQUFoQixHQUFzQmtCLFVBQTlDOztJQUNBLE1BQU1BLFVBQVUsR0FBR3FCLGVBQWUsR0FDM0IsR0FBRUEsZUFBZSxDQUFDLENBQUQsQ0FBSSxJQUFHQSxlQUFlLENBQUMsQ0FBRCxDQUFJLElBQUdBLGVBQWUsQ0FBQyxDQUFELENBQUksRUFEdEMsR0FFNUIsZUFGTjtJQUlBLE9BQU87TUFDSHRCLFVBQVUsRUFBRyxHQUFFLElBQUF1QixtQkFBQSxFQUFHLG9CQUFILEVBQXlCO1FBQUVGO01BQUYsQ0FBekIsQ0FBb0MsSUFBR3JCLFVBQVcsRUFEOUQ7TUFFSEMsVUFBVSxFQUFHLEdBQUUsSUFBQXNCLG1CQUFBLEVBQUcsY0FBSCxDQUFtQixJQUFHdEIsVUFBVztJQUY3QyxDQUFQO0VBSUg7O0VBMEJPdUIsV0FBVyxHQUFHO0lBQ2xCLE1BQU1DLFFBQVEsR0FBRzNCLGtCQUFBLENBQVVmLEdBQVYsR0FBZ0IyQywwQkFBakM7O0lBQ0EsSUFBSSxDQUFDRCxRQUFMLEVBQWUsT0FBTyxJQUFQO0lBRWYsTUFBTUUsVUFBVSxHQUFHLEVBQW5COztJQUNBLEtBQUssTUFBTUMsUUFBWCxJQUF1QkgsUUFBdkIsRUFBaUM7TUFDN0JFLFVBQVUsQ0FBQ0UsSUFBWCxlQUFnQjtRQUFLLEdBQUcsRUFBRUQsUUFBUSxDQUFDRTtNQUFuQixnQkFDWjtRQUFHLElBQUksRUFBRUYsUUFBUSxDQUFDRSxHQUFsQjtRQUF1QixHQUFHLEVBQUMscUJBQTNCO1FBQWlELE1BQU0sRUFBQztNQUF4RCxHQUFtRUYsUUFBUSxDQUFDRyxJQUE1RSxDQURZLENBQWhCO0lBR0g7O0lBRUQsb0JBQ0k7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSTtNQUFNLFNBQVMsRUFBQztJQUFoQixHQUE4QyxJQUFBUixtQkFBQSxFQUFHLE9BQUgsQ0FBOUMsQ0FESixlQUVJO01BQUssU0FBUyxFQUFDO0lBQWYsR0FDTUksVUFETixDQUZKLENBREo7RUFRSDs7RUFFT0ssYUFBYSxHQUFHO0lBQ3BCO0lBQ0E7SUFDQSxvQkFDSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJO01BQU0sU0FBUyxFQUFDO0lBQWhCLEdBQThDLElBQUFULG1CQUFBLEVBQUcsU0FBSCxDQUE5QyxDQURKLGVBRUk7TUFBSSxTQUFTLEVBQUM7SUFBZCxnQkFDSSw4REFDUTtNQUFHLElBQUksRUFBQyx5Q0FBUjtNQUFrRCxHQUFHLEVBQUMscUJBQXREO01BQTRFLE1BQU0sRUFBQztJQUFuRix5QkFEUiwrQkFJSTtNQUFHLElBQUksRUFBQyw4QkFBUjtNQUF1QyxHQUFHLEVBQUMscUJBQTNDO01BQWlFLE1BQU0sRUFBQztJQUF4RSxzQkFKSiwrQ0FPSTtNQUFHLElBQUksRUFBQyxpREFBUjtNQUEwRCxHQUFHLEVBQUMscUJBQTlEO01BQW9GLE1BQU0sRUFBQztJQUEzRixrQkFQSixNQURKLGVBWUksOERBQ1E7TUFDQSxJQUFJLEVBQUMsNENBREw7TUFFQSxHQUFHLEVBQUMscUJBRko7TUFHQSxNQUFNLEVBQUM7SUFIUCxrQkFEUixvQ0FRSTtNQUFHLElBQUksRUFBQyxxQkFBUjtNQUE4QixHQUFHLEVBQUMscUJBQWxDO01BQXdELE1BQU0sRUFBQztJQUEvRCx3QkFSSiwrQ0FXSTtNQUFHLElBQUksRUFBQyw2Q0FBUjtNQUFzRCxHQUFHLEVBQUMscUJBQTFEO01BQWdGLE1BQU0sRUFBQztJQUF2RixnQkFYSixNQVpKLGVBeUJJLDhEQUNRO01BQUcsSUFBSSxFQUFDLDhCQUFSO01BQXVDLEdBQUcsRUFBQyxxQkFBM0M7TUFBaUUsTUFBTSxFQUFDO0lBQXhFLGFBRFIseUNBSUk7TUFBRyxJQUFJLEVBQUMsOEJBQVI7TUFBdUMsR0FBRyxFQUFDLHFCQUEzQztNQUFpRSxNQUFNLEVBQUM7SUFBeEUseUNBSkosK0NBT0k7TUFBRyxJQUFJLEVBQUMsOENBQVI7TUFBdUQsR0FBRyxFQUFDLHFCQUEzRDtNQUFpRixNQUFNLEVBQUM7SUFBeEYsZUFQSixNQXpCSixDQUZKLENBREo7RUEwQ0g7O0VBY0RVLE1BQU0sR0FBRztJQUNMLE1BQU1aLEtBQUssR0FBR3ZCLGtCQUFBLENBQVVmLEdBQVYsR0FBZ0JzQyxLQUE5Qjs7SUFFQSxJQUFJYSxPQUFPLEdBQUcsSUFBQVgsbUJBQUEsRUFDVixtREFEVSxFQUVWO01BQ0lGO0lBREosQ0FGVSxFQUtWO01BQ0ksS0FBTWMsR0FBRCxpQkFBUztRQUNWLElBQUksRUFBQyx5QkFESztRQUVWLEdBQUcsRUFBQyxxQkFGTTtRQUdWLE1BQU0sRUFBQztNQUhHLEdBS1JBLEdBTFE7SUFEbEIsQ0FMVSxDQUFkOztJQWVBLElBQUlyQyxrQkFBQSxDQUFVZixHQUFWLENBQWMsaUJBQWQsS0FBb0MsSUFBQXFELG1DQUFBLElBQXFCQyxVQUFyQixDQUFnQyxJQUFoQyxDQUF4QyxFQUErRTtNQUMzRUgsT0FBTyxnQkFDSCwwQ0FDTSxJQUFBWCxtQkFBQSxFQUNFLCtFQUNBLDZCQUZGLEVBR0U7UUFDSUY7TUFESixDQUhGLEVBTUU7UUFDSSxLQUFNYyxHQUFELGlCQUFTO1VBQ1YsSUFBSSxFQUFDLHlCQURLO1VBRVYsR0FBRyxFQUFDLHFCQUZNO1VBR1YsTUFBTSxFQUFDO1FBSEcsR0FLUkEsR0FMUTtNQURsQixDQU5GLENBRE4sZUFpQkksdURBQ0ksNkJBQUMseUJBQUQ7UUFBa0IsT0FBTyxFQUFFLEtBQUtHLGNBQWhDO1FBQWdELElBQUksRUFBQztNQUFyRCxHQUNNLElBQUFmLG1CQUFBLEVBQUcseUJBQUgsRUFBOEI7UUFBRUY7TUFBRixDQUE5QixDQUROLENBREosQ0FqQkosQ0FESjtJQXlCSDs7SUFFRCxJQUFJa0IsWUFBWSxHQUFHLElBQW5COztJQUNBLElBQUksS0FBSzVCLEtBQUwsQ0FBV0MsU0FBZixFQUEwQjtNQUN0QjJCLFlBQVksZ0JBQUcsNkJBQUMsMEJBQUQsT0FBZjtJQUNIOztJQUVELElBQUlDLG1CQUFKOztJQUNBLElBQUkxQyxrQkFBQSxDQUFVZixHQUFWLEdBQWdCMEQsdUJBQXBCLEVBQTZDO01BQ3pDRCxtQkFBbUIsZ0JBQ2Y7UUFBSyxTQUFTLEVBQUM7TUFBZixnQkFDSTtRQUFNLFNBQVMsRUFBQztNQUFoQixHQUE4QyxJQUFBakIsbUJBQUEsRUFBRyxlQUFILENBQTlDLENBREosZUFFSTtRQUFLLFNBQVMsRUFBQztNQUFmLEdBQ00sSUFBQUEsbUJBQUEsRUFDRSwrREFDQSw2QkFGRixDQUROLEVBS00sSUFBQUEsbUJBQUEsRUFBRyxvQ0FDRCw0REFEQyxHQUVELG9EQUZDLEdBR0QsMERBSEMsR0FJRCwrQkFKRixDQUxOLENBRkosZUFjSSw2QkFBQyx5QkFBRDtRQUFrQixPQUFPLEVBQUUsS0FBS21CLFdBQWhDO1FBQTZDLElBQUksRUFBQztNQUFsRCxHQUNNLElBQUFuQixtQkFBQSxFQUFHLG1CQUFILENBRE4sQ0FkSixlQWlCSTtRQUFLLFNBQVMsRUFBQztNQUFmLEdBQ00sSUFBQUEsbUJBQUEsRUFDRSwyRUFDQSxvQ0FGRixFQUV3QyxFQUZ4QyxFQUdFO1FBQ0lvQixDQUFDLEVBQUVSLEdBQUcsaUJBQUk7VUFBRyxJQUFJLEVBQUMsZ0RBQVI7VUFDTixHQUFHLEVBQUMscUJBREU7VUFFTixNQUFNLEVBQUM7UUFGRCxHQUdQQSxHQUhPO01BRGQsQ0FIRixDQUROLENBakJKLENBREo7SUFnQ0g7O0lBRUQsTUFBTTtNQUFFbkMsVUFBRjtNQUFjQztJQUFkLElBQTZCLEtBQUtDLGNBQUwsRUFBbkM7SUFFQSxvQkFDSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJO01BQUssU0FBUyxFQUFDO0lBQWYsR0FBMEMsSUFBQXFCLG1CQUFBLEVBQUcsY0FBSCxDQUExQyxDQURKLEVBRU1pQixtQkFGTixlQUdJO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQ0k7TUFBTSxTQUFTLEVBQUM7SUFBaEIsR0FBOEMsSUFBQWpCLG1CQUFBLEVBQUcsS0FBSCxDQUE5QyxDQURKLGVBRUk7TUFBSyxTQUFTLEVBQUM7SUFBZixHQUNNVyxPQUROLENBRkosZUFLSSw2QkFBQyx5QkFBRDtNQUFrQixJQUFJLEVBQUMsU0FBdkI7TUFBaUMsT0FBTyxFQUFFLEtBQUtVO0lBQS9DLEdBQ00sSUFBQXJCLG1CQUFBLEVBQUcsb0JBQUgsQ0FETixDQUxKLENBSEosZUFZSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJO01BQU0sU0FBUyxFQUFDO0lBQWhCLEdBQThDLElBQUFBLG1CQUFBLEVBQUcsVUFBSCxDQUE5QyxDQURKLGVBRUk7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSSw2QkFBQyxxQkFBRDtNQUFjLGFBQWEsRUFBRSxLQUFLc0I7SUFBbEMsR0FDTTdDLFVBRE4sZUFDa0Isd0NBRGxCLEVBRU1DLFVBRk4sZUFFa0Isd0NBRmxCLENBREosRUFLTXNDLFlBTE4sQ0FGSixDQVpKLEVBc0JNLEtBQUtmLFdBQUwsRUF0Qk4sRUF1Qk0sS0FBS1EsYUFBTCxFQXZCTixlQXdCSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJO01BQU0sU0FBUyxFQUFDO0lBQWhCLEdBQThDLElBQUFULG1CQUFBLEVBQUcsVUFBSCxDQUE5QyxDQURKLGVBRUk7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSSwwQ0FBTyxJQUFBQSxtQkFBQSxFQUFHLGVBQUgsQ0FBUCxvQkFBNkIsMkNBQVFyQyxnQ0FBQSxDQUFnQkgsR0FBaEIsR0FBc0IrRCxnQkFBdEIsRUFBUixDQUE3QixDQURKLGVBRUksMENBQU8sSUFBQXZCLG1CQUFBLEVBQUcsb0JBQUgsQ0FBUCxvQkFBa0MsMkNBQVFyQyxnQ0FBQSxDQUFnQkgsR0FBaEIsR0FBc0JnRSxvQkFBdEIsRUFBUixDQUFsQyxDQUZKLGVBR0ksMkRBQ0ksOENBQVcsSUFBQXhCLG1CQUFBLEVBQUcsY0FBSCxDQUFYLENBREosZUFFSSx3Q0FBSyxJQUFBQSxtQkFBQSxFQUFHLHlEQUNILCtCQURBLENBQUwsQ0FGSixlQUlJLDZCQUFDLHFCQUFEO01BQWMsYUFBYSxFQUFFLE1BQU1yQyxnQ0FBQSxDQUFnQkgsR0FBaEIsR0FBc0JpRSxjQUF0QjtJQUFuQyxHQUNNOUQsZ0NBQUEsQ0FBZ0JILEdBQWhCLEdBQXNCaUUsY0FBdEIsRUFETixDQUpKLENBSEosZUFXSSw2QkFBQyx5QkFBRDtNQUFrQixPQUFPLEVBQUUsS0FBS0MscUJBQWhDO01BQXVELElBQUksRUFBQztJQUE1RCxHQUNNLElBQUExQixtQkFBQSxFQUFHLHdCQUFILENBRE4sQ0FYSixDQUZKLENBeEJKLENBREo7RUE2Q0g7O0FBL1E0RSJ9