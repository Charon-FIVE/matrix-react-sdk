"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _BugReportDialog = _interopRequireDefault(require("../dialogs/BugReportDialog"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

/*
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.

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
 * This error boundary component can be used to wrap large content areas and
 * catch exceptions during rendering in the component tree below them.
 */
class ErrorBoundary extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onClearCacheAndReload", () => {
      if (!_PlatformPeg.default.get()) return;

      _MatrixClientPeg.MatrixClientPeg.get().stopClient();

      _MatrixClientPeg.MatrixClientPeg.get().store.deleteAllData().then(() => {
        _PlatformPeg.default.get().reload();
      });
    });
    (0, _defineProperty2.default)(this, "onBugReport", () => {
      _Modal.default.createDialog(_BugReportDialog.default, {
        label: 'react-soft-crash',
        error: this.state.error
      });
    });
    this.state = {
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    // Side effects are not permitted here, so we only update the state so
    // that the next render shows an error message.
    return {
      error
    };
  }

  componentDidCatch(error, _ref) {
    let {
      componentStack
    } = _ref;

    // Browser consoles are better at formatting output when native errors are passed
    // in their own `console.error` invocation.
    _logger.logger.error(error);

    _logger.logger.error("The above error occurred while React was rendering the following components:", componentStack);
  }

  render() {
    if (this.state.error) {
      const newIssueUrl = "https://github.com/vector-im/element-web/issues/new/choose";
      let bugReportSection;

      if (_SdkConfig.default.get().bug_report_endpoint_url) {
        bugReportSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please <newIssueLink>create a new issue</newIssueLink> " + "on GitHub so that we can investigate this bug.", {}, {
          newIssueLink: sub => {
            return /*#__PURE__*/_react.default.createElement("a", {
              target: "_blank",
              rel: "noreferrer noopener",
              href: newIssueUrl
            }, sub);
          }
        })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you've submitted a bug via GitHub, debug logs can help " + "us track down the problem. "), (0, _languageHandler._t)("Debug logs contain application " + "usage data including your username, the IDs or aliases of " + "the rooms you have visited, which UI elements you " + "last interacted with, and the usernames of other users. " + "They do not contain messages.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: this.onBugReport,
          kind: "primary"
        }, (0, _languageHandler._t)("Submit debug logs")));
      }

      let clearCacheButton; // we only show this button if there is an initialised MatrixClient otherwise we can't clear the cache

      if (_MatrixClientPeg.MatrixClientPeg.get()) {
        clearCacheButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: this.onClearCacheAndReload,
          kind: "danger"
        }, (0, _languageHandler._t)("Clear cache and reload"));
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ErrorBoundary"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ErrorBoundary_body"
      }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Something went wrong!")), bugReportSection, clearCacheButton));
    }

    return this.props.children;
  }

}

exports.default = ErrorBoundary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFcnJvckJvdW5kYXJ5IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwiTWF0cml4Q2xpZW50UGVnIiwic3RvcENsaWVudCIsInN0b3JlIiwiZGVsZXRlQWxsRGF0YSIsInRoZW4iLCJyZWxvYWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkJ1Z1JlcG9ydERpYWxvZyIsImxhYmVsIiwiZXJyb3IiLCJzdGF0ZSIsImdldERlcml2ZWRTdGF0ZUZyb21FcnJvciIsImNvbXBvbmVudERpZENhdGNoIiwiY29tcG9uZW50U3RhY2siLCJsb2dnZXIiLCJyZW5kZXIiLCJuZXdJc3N1ZVVybCIsImJ1Z1JlcG9ydFNlY3Rpb24iLCJTZGtDb25maWciLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsIl90IiwibmV3SXNzdWVMaW5rIiwic3ViIiwib25CdWdSZXBvcnQiLCJjbGVhckNhY2hlQnV0dG9uIiwib25DbGVhckNhY2hlQW5kUmVsb2FkIiwiY2hpbGRyZW4iXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9FcnJvckJvdW5kYXJ5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IEVycm9ySW5mbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tICcuLi8uLi8uLi9QbGF0Zm9ybVBlZyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgQnVnUmVwb3J0RGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvQnVnUmVwb3J0RGlhbG9nJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vQWNjZXNzaWJsZUJ1dHRvbic7XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGVycm9yOiBFcnJvcjtcbn1cblxuLyoqXG4gKiBUaGlzIGVycm9yIGJvdW5kYXJ5IGNvbXBvbmVudCBjYW4gYmUgdXNlZCB0byB3cmFwIGxhcmdlIGNvbnRlbnQgYXJlYXMgYW5kXG4gKiBjYXRjaCBleGNlcHRpb25zIGR1cmluZyByZW5kZXJpbmcgaW4gdGhlIGNvbXBvbmVudCB0cmVlIGJlbG93IHRoZW0uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PHt9LCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3I6IEVycm9yKTogUGFydGlhbDxJU3RhdGU+IHtcbiAgICAgICAgLy8gU2lkZSBlZmZlY3RzIGFyZSBub3QgcGVybWl0dGVkIGhlcmUsIHNvIHdlIG9ubHkgdXBkYXRlIHRoZSBzdGF0ZSBzb1xuICAgICAgICAvLyB0aGF0IHRoZSBuZXh0IHJlbmRlciBzaG93cyBhbiBlcnJvciBtZXNzYWdlLlxuICAgICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZENhdGNoKGVycm9yOiBFcnJvciwgeyBjb21wb25lbnRTdGFjayB9OiBFcnJvckluZm8pOiB2b2lkIHtcbiAgICAgICAgLy8gQnJvd3NlciBjb25zb2xlcyBhcmUgYmV0dGVyIGF0IGZvcm1hdHRpbmcgb3V0cHV0IHdoZW4gbmF0aXZlIGVycm9ycyBhcmUgcGFzc2VkXG4gICAgICAgIC8vIGluIHRoZWlyIG93biBgY29uc29sZS5lcnJvcmAgaW52b2NhdGlvbi5cbiAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgXCJUaGUgYWJvdmUgZXJyb3Igb2NjdXJyZWQgd2hpbGUgUmVhY3Qgd2FzIHJlbmRlcmluZyB0aGUgZm9sbG93aW5nIGNvbXBvbmVudHM6XCIsXG4gICAgICAgICAgICBjb21wb25lbnRTdGFjayxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2xlYXJDYWNoZUFuZFJlbG9hZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCFQbGF0Zm9ybVBlZy5nZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdG9wQ2xpZW50KCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdG9yZS5kZWxldGVBbGxEYXRhKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5yZWxvYWQoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25CdWdSZXBvcnQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhCdWdSZXBvcnREaWFsb2csIHtcbiAgICAgICAgICAgIGxhYmVsOiAncmVhY3Qtc29mdC1jcmFzaCcsXG4gICAgICAgICAgICBlcnJvcjogdGhpcy5zdGF0ZS5lcnJvcixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0lzc3VlVXJsID0gXCJodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy9uZXcvY2hvb3NlXCI7XG5cbiAgICAgICAgICAgIGxldCBidWdSZXBvcnRTZWN0aW9uO1xuICAgICAgICAgICAgaWYgKFNka0NvbmZpZy5nZXQoKS5idWdfcmVwb3J0X2VuZHBvaW50X3VybCkge1xuICAgICAgICAgICAgICAgIGJ1Z1JlcG9ydFNlY3Rpb24gPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlBsZWFzZSA8bmV3SXNzdWVMaW5rPmNyZWF0ZSBhIG5ldyBpc3N1ZTwvbmV3SXNzdWVMaW5rPiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm9uIEdpdEh1YiBzbyB0aGF0IHdlIGNhbiBpbnZlc3RpZ2F0ZSB0aGlzIGJ1Zy5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJc3N1ZUxpbms6IChzdWIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiBocmVmPXtuZXdJc3N1ZVVybH0+eyBzdWIgfTwvYT47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSWYgeW91J3ZlIHN1Ym1pdHRlZCBhIGJ1ZyB2aWEgR2l0SHViLCBkZWJ1ZyBsb2dzIGNhbiBoZWxwIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidXMgdHJhY2sgZG93biB0aGUgcHJvYmxlbS4gXCIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiRGVidWcgbG9ncyBjb250YWluIGFwcGxpY2F0aW9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidXNhZ2UgZGF0YSBpbmNsdWRpbmcgeW91ciB1c2VybmFtZSwgdGhlIElEcyBvciBhbGlhc2VzIG9mIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIHJvb21zIHlvdSBoYXZlIHZpc2l0ZWQsIHdoaWNoIFVJIGVsZW1lbnRzIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxhc3QgaW50ZXJhY3RlZCB3aXRoLCBhbmQgdGhlIHVzZXJuYW1lcyBvZiBvdGhlciB1c2Vycy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGV5IGRvIG5vdCBjb250YWluIG1lc3NhZ2VzLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CdWdSZXBvcnR9IGtpbmQ9J3ByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlN1Ym1pdCBkZWJ1ZyBsb2dzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgY2xlYXJDYWNoZUJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgICAgICAvLyB3ZSBvbmx5IHNob3cgdGhpcyBidXR0b24gaWYgdGhlcmUgaXMgYW4gaW5pdGlhbGlzZWQgTWF0cml4Q2xpZW50IG90aGVyd2lzZSB3ZSBjYW4ndCBjbGVhciB0aGUgY2FjaGVcbiAgICAgICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkpIHtcbiAgICAgICAgICAgICAgICBjbGVhckNhY2hlQnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vbkNsZWFyQ2FjaGVBbmRSZWxvYWR9IGtpbmQ9J2Rhbmdlcic+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDbGVhciBjYWNoZSBhbmQgcmVsb2FkXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9FcnJvckJvdW5kYXJ5XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FcnJvckJvdW5kYXJ5X2JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgxPnsgX3QoXCJTb21ldGhpbmcgd2VudCB3cm9uZyFcIikgfTwvaDE+XG4gICAgICAgICAgICAgICAgICAgIHsgYnVnUmVwb3J0U2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIHsgY2xlYXJDYWNoZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsYUFBTixTQUE0QkMsY0FBQSxDQUFNQyxhQUFsQyxDQUE0RDtFQUN2RUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsNkRBd0JhLE1BQVk7TUFDeEMsSUFBSSxDQUFDQyxvQkFBQSxDQUFZQyxHQUFaLEVBQUwsRUFBd0I7O01BRXhCQyxnQ0FBQSxDQUFnQkQsR0FBaEIsR0FBc0JFLFVBQXRCOztNQUNBRCxnQ0FBQSxDQUFnQkQsR0FBaEIsR0FBc0JHLEtBQXRCLENBQTRCQyxhQUE1QixHQUE0Q0MsSUFBNUMsQ0FBaUQsTUFBTTtRQUNuRE4sb0JBQUEsQ0FBWUMsR0FBWixHQUFrQk0sTUFBbEI7TUFDSCxDQUZEO0lBR0gsQ0EvQmtCO0lBQUEsbURBaUNHLE1BQVk7TUFDOUJDLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsd0JBQW5CLEVBQW9DO1FBQ2hDQyxLQUFLLEVBQUUsa0JBRHlCO1FBRWhDQyxLQUFLLEVBQUUsS0FBS0MsS0FBTCxDQUFXRDtNQUZjLENBQXBDO0lBSUgsQ0F0Q2tCO0lBR2YsS0FBS0MsS0FBTCxHQUFhO01BQ1RELEtBQUssRUFBRTtJQURFLENBQWI7RUFHSDs7RUFFOEIsT0FBeEJFLHdCQUF3QixDQUFDRixLQUFELEVBQWdDO0lBQzNEO0lBQ0E7SUFDQSxPQUFPO01BQUVBO0lBQUYsQ0FBUDtFQUNIOztFQUVERyxpQkFBaUIsQ0FBQ0gsS0FBRCxRQUFvRDtJQUFBLElBQXJDO01BQUVJO0lBQUYsQ0FBcUM7O0lBQ2pFO0lBQ0E7SUFDQUMsY0FBQSxDQUFPTCxLQUFQLENBQWFBLEtBQWI7O0lBQ0FLLGNBQUEsQ0FBT0wsS0FBUCxDQUNJLDhFQURKLEVBRUlJLGNBRko7RUFJSDs7RUFrQkRFLE1BQU0sR0FBRztJQUNMLElBQUksS0FBS0wsS0FBTCxDQUFXRCxLQUFmLEVBQXNCO01BQ2xCLE1BQU1PLFdBQVcsR0FBRyw0REFBcEI7TUFFQSxJQUFJQyxnQkFBSjs7TUFDQSxJQUFJQyxrQkFBQSxDQUFVcEIsR0FBVixHQUFnQnFCLHVCQUFwQixFQUE2QztRQUN6Q0YsZ0JBQWdCLGdCQUFHLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLHFCQUNmLHdDQUFLLElBQUFHLG1CQUFBLEVBQ0QsNERBQ0EsZ0RBRkMsRUFFaUQsRUFGakQsRUFFcUQ7VUFDbERDLFlBQVksRUFBR0MsR0FBRCxJQUFTO1lBQ25CLG9CQUFPO2NBQUcsTUFBTSxFQUFDLFFBQVY7Y0FBbUIsR0FBRyxFQUFDLHFCQUF2QjtjQUE2QyxJQUFJLEVBQUVOO1lBQW5ELEdBQWtFTSxHQUFsRSxDQUFQO1VBQ0g7UUFIaUQsQ0FGckQsQ0FBTCxDQURlLGVBU2Ysd0NBQUssSUFBQUYsbUJBQUEsRUFDRCwrREFDQSw2QkFGQyxDQUFMLEVBSUUsSUFBQUEsbUJBQUEsRUFDRSxvQ0FDQSw0REFEQSxHQUVBLG9EQUZBLEdBR0EsMERBSEEsR0FJQSwrQkFMRixDQUpGLENBVGUsZUFvQmYsNkJBQUMseUJBQUQ7VUFBa0IsT0FBTyxFQUFFLEtBQUtHLFdBQWhDO1VBQTZDLElBQUksRUFBQztRQUFsRCxHQUNNLElBQUFILG1CQUFBLEVBQUcsbUJBQUgsQ0FETixDQXBCZSxDQUFuQjtNQXdCSDs7TUFFRCxJQUFJSSxnQkFBSixDQS9Ca0IsQ0FnQ2xCOztNQUNBLElBQUl6QixnQ0FBQSxDQUFnQkQsR0FBaEIsRUFBSixFQUEyQjtRQUN2QjBCLGdCQUFnQixnQkFBRyw2QkFBQyx5QkFBRDtVQUFrQixPQUFPLEVBQUUsS0FBS0MscUJBQWhDO1VBQXVELElBQUksRUFBQztRQUE1RCxHQUNiLElBQUFMLG1CQUFBLEVBQUcsd0JBQUgsQ0FEYSxDQUFuQjtNQUdIOztNQUVELG9CQUFPO1FBQUssU0FBUyxFQUFDO01BQWYsZ0JBQ0g7UUFBSyxTQUFTLEVBQUM7TUFBZixnQkFDSSx5Q0FBTSxJQUFBQSxtQkFBQSxFQUFHLHVCQUFILENBQU4sQ0FESixFQUVNSCxnQkFGTixFQUdNTyxnQkFITixDQURHLENBQVA7SUFPSDs7SUFFRCxPQUFPLEtBQUs1QixLQUFMLENBQVc4QixRQUFsQjtFQUNIOztBQTNGc0UifQ==