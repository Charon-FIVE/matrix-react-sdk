"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _AuthPage = _interopRequireDefault(require("./AuthPage"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _LanguageSelector = _interopRequireDefault(require("./LanguageSelector"));

var _EmbeddedPage = _interopRequireDefault(require("../../structures/EmbeddedPage"));

var _staticPageVars = require("../../structures/static-page-vars");

/*
Copyright 2019 New Vector Ltd

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
// translatable strings for Welcome pages
(0, _languageHandler._td)("Sign in with SSO");

class Welcome extends _react.default.PureComponent {
  render() {
    const pagesConfig = _SdkConfig.default.getObject("embedded_pages");

    let pageUrl = null;

    if (pagesConfig) {
      pageUrl = pagesConfig.get("welcome_url");
    }

    if (!pageUrl) {
      pageUrl = 'welcome.html';
    }

    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_Welcome", {
        mx_WelcomePage_registrationDisabled: !_SettingsStore.default.getValue(_UIFeature.UIFeature.Registration)
      })
    }, /*#__PURE__*/_react.default.createElement(_EmbeddedPage.default, {
      className: "mx_WelcomePage",
      url: pageUrl,
      replaceMap: {
        "$riot:ssoUrl": "#/start_sso",
        "$riot:casUrl": "#/start_cas",
        "$matrixLogo": _staticPageVars.MATRIX_LOGO_HTML,
        "[matrix]": _staticPageVars.MATRIX_LOGO_HTML
      }
    }), /*#__PURE__*/_react.default.createElement(_LanguageSelector.default, null)));
  }

}

exports.default = Welcome;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfdGQiLCJXZWxjb21lIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwicmVuZGVyIiwicGFnZXNDb25maWciLCJTZGtDb25maWciLCJnZXRPYmplY3QiLCJwYWdlVXJsIiwiZ2V0IiwiY2xhc3NOYW1lcyIsIm14X1dlbGNvbWVQYWdlX3JlZ2lzdHJhdGlvbkRpc2FibGVkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiUmVnaXN0cmF0aW9uIiwiTUFUUklYX0xPR09fSFRNTCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvV2VsY29tZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCBBdXRoUGFnZSBmcm9tIFwiLi9BdXRoUGFnZVwiO1xuaW1wb3J0IHsgX3RkIH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFVJRmVhdHVyZSB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCBMYW5ndWFnZVNlbGVjdG9yIGZyb20gXCIuL0xhbmd1YWdlU2VsZWN0b3JcIjtcbmltcG9ydCBFbWJlZGRlZFBhZ2UgZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvRW1iZWRkZWRQYWdlXCI7XG5pbXBvcnQgeyBNQVRSSVhfTE9HT19IVE1MIH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvc3RhdGljLXBhZ2UtdmFyc1wiO1xuXG4vLyB0cmFuc2xhdGFibGUgc3RyaW5ncyBmb3IgV2VsY29tZSBwYWdlc1xuX3RkKFwiU2lnbiBpbiB3aXRoIFNTT1wiKTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2VsY29tZSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICBjb25zdCBwYWdlc0NvbmZpZyA9IFNka0NvbmZpZy5nZXRPYmplY3QoXCJlbWJlZGRlZF9wYWdlc1wiKTtcbiAgICAgICAgbGV0IHBhZ2VVcmwgPSBudWxsO1xuICAgICAgICBpZiAocGFnZXNDb25maWcpIHtcbiAgICAgICAgICAgIHBhZ2VVcmwgPSBwYWdlc0NvbmZpZy5nZXQoXCJ3ZWxjb21lX3VybFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhZ2VVcmwpIHtcbiAgICAgICAgICAgIHBhZ2VVcmwgPSAnd2VsY29tZS5odG1sJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QXV0aFBhZ2U+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9XZWxjb21lXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgbXhfV2VsY29tZVBhZ2VfcmVnaXN0cmF0aW9uRGlzYWJsZWQ6ICFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5SZWdpc3RyYXRpb24pLFxuICAgICAgICAgICAgICAgIH0pfT5cbiAgICAgICAgICAgICAgICAgICAgPEVtYmVkZGVkUGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfV2VsY29tZVBhZ2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsPXtwYWdlVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZU1hcD17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHJpb3Q6c3NvVXJsXCI6IFwiIy9zdGFydF9zc29cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRyaW90OmNhc1VybFwiOiBcIiMvc3RhcnRfY2FzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkbWF0cml4TG9nb1wiOiBNQVRSSVhfTE9HT19IVE1MLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiW21hdHJpeF1cIjogTUFUUklYX0xPR09fSFRNTCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxMYW5ndWFnZVNlbGVjdG9yIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0F1dGhQYWdlPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFjQTtBQUNBLElBQUFBLG9CQUFBLEVBQUksa0JBQUo7O0FBTWUsTUFBTUMsT0FBTixTQUFzQkMsY0FBQSxDQUFNQyxhQUE1QixDQUFrRDtFQUN0REMsTUFBTSxHQUFvQjtJQUM3QixNQUFNQyxXQUFXLEdBQUdDLGtCQUFBLENBQVVDLFNBQVYsQ0FBb0IsZ0JBQXBCLENBQXBCOztJQUNBLElBQUlDLE9BQU8sR0FBRyxJQUFkOztJQUNBLElBQUlILFdBQUosRUFBaUI7TUFDYkcsT0FBTyxHQUFHSCxXQUFXLENBQUNJLEdBQVosQ0FBZ0IsYUFBaEIsQ0FBVjtJQUNIOztJQUNELElBQUksQ0FBQ0QsT0FBTCxFQUFjO01BQ1ZBLE9BQU8sR0FBRyxjQUFWO0lBQ0g7O0lBRUQsb0JBQ0ksNkJBQUMsaUJBQUQscUJBQ0k7TUFBSyxTQUFTLEVBQUUsSUFBQUUsbUJBQUEsRUFBVyxZQUFYLEVBQXlCO1FBQ3JDQyxtQ0FBbUMsRUFBRSxDQUFDQyxzQkFBQSxDQUFjQyxRQUFkLENBQXVCQyxvQkFBQSxDQUFVQyxZQUFqQztNQURELENBQXpCO0lBQWhCLGdCQUdJLDZCQUFDLHFCQUFEO01BQ0ksU0FBUyxFQUFDLGdCQURkO01BRUksR0FBRyxFQUFFUCxPQUZUO01BR0ksVUFBVSxFQUFFO1FBQ1IsZ0JBQWdCLGFBRFI7UUFFUixnQkFBZ0IsYUFGUjtRQUdSLGVBQWVRLGdDQUhQO1FBSVIsWUFBWUE7TUFKSjtJQUhoQixFQUhKLGVBYUksNkJBQUMseUJBQUQsT0FiSixDQURKLENBREo7RUFtQkg7O0FBOUI0RCJ9