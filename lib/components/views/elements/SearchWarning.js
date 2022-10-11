"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WarningKind = void 0;
exports.default = SearchWarning;

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _EventIndexPeg = _interopRequireDefault(require("../../../indexing/EventIndexPeg"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _UserTab = require("../dialogs/UserTab");

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

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
let WarningKind;
exports.WarningKind = WarningKind;

(function (WarningKind) {
  WarningKind[WarningKind["Files"] = 0] = "Files";
  WarningKind[WarningKind["Search"] = 1] = "Search";
})(WarningKind || (exports.WarningKind = WarningKind = {}));

function SearchWarning(_ref) {
  let {
    isRoomEncrypted,
    kind
  } = _ref;
  if (!isRoomEncrypted) return null;
  if (_EventIndexPeg.default.get()) return null;

  if (_EventIndexPeg.default.error) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SearchWarning"
    }, (0, _languageHandler._t)("Message search initialisation failed, check <a>your settings</a> for more information", {}, {
      a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: evt => {
          evt.preventDefault();

          _dispatcher.default.dispatch({
            action: _actions.Action.ViewUserSettings,
            initialTabId: _UserTab.UserTab.Security
          });
        }
      }, sub)
    }));
  }

  const brand = _SdkConfig.default.get("brand");

  const desktopBuilds = _SdkConfig.default.getObject("desktop_builds");

  let text = null;
  let logo = null;

  if (desktopBuilds.get("available")) {
    logo = /*#__PURE__*/_react.default.createElement("img", {
      src: desktopBuilds.get("logo")
    });
    const buildUrl = desktopBuilds.get("url");

    switch (kind) {
      case WarningKind.Files:
        text = (0, _languageHandler._t)("Use the <a>Desktop app</a> to see all encrypted files", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: buildUrl,
            target: "_blank",
            rel: "noreferrer noopener"
          }, sub)
        });
        break;

      case WarningKind.Search:
        text = (0, _languageHandler._t)("Use the <a>Desktop app</a> to search encrypted messages", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: buildUrl,
            target: "_blank",
            rel: "noreferrer noopener"
          }, sub)
        });
        break;
    }
  } else {
    switch (kind) {
      case WarningKind.Files:
        text = (0, _languageHandler._t)("This version of %(brand)s does not support viewing some encrypted files", {
          brand
        });
        break;

      case WarningKind.Search:
        text = (0, _languageHandler._t)("This version of %(brand)s does not support searching encrypted messages", {
          brand
        });
        break;
    }
  } // for safety


  if (!text) {
    _logger.logger.warn("Unknown desktop builds warning kind: ", kind);

    return null;
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SearchWarning"
  }, logo, /*#__PURE__*/_react.default.createElement("span", null, text));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJXYXJuaW5nS2luZCIsIlNlYXJjaFdhcm5pbmciLCJpc1Jvb21FbmNyeXB0ZWQiLCJraW5kIiwiRXZlbnRJbmRleFBlZyIsImdldCIsImVycm9yIiwiX3QiLCJhIiwic3ViIiwiZXZ0IiwicHJldmVudERlZmF1bHQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdVc2VyU2V0dGluZ3MiLCJpbml0aWFsVGFiSWQiLCJVc2VyVGFiIiwiU2VjdXJpdHkiLCJicmFuZCIsIlNka0NvbmZpZyIsImRlc2t0b3BCdWlsZHMiLCJnZXRPYmplY3QiLCJ0ZXh0IiwibG9nbyIsImJ1aWxkVXJsIiwiRmlsZXMiLCJTZWFyY2giLCJsb2dnZXIiLCJ3YXJuIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvU2VhcmNoV2FybmluZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgRXZlbnRJbmRleFBlZyBmcm9tIFwiLi4vLi4vLi4vaW5kZXhpbmcvRXZlbnRJbmRleFBlZ1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgVXNlclRhYiB9IGZyb20gXCIuLi9kaWFsb2dzL1VzZXJUYWJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuL0FjY2Vzc2libGVCdXR0b25cIjtcblxuZXhwb3J0IGVudW0gV2FybmluZ0tpbmQge1xuICAgIEZpbGVzLFxuICAgIFNlYXJjaCxcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgaXNSb29tRW5jcnlwdGVkOiBib29sZWFuO1xuICAgIGtpbmQ6IFdhcm5pbmdLaW5kO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBTZWFyY2hXYXJuaW5nKHsgaXNSb29tRW5jcnlwdGVkLCBraW5kIH06IElQcm9wcykge1xuICAgIGlmICghaXNSb29tRW5jcnlwdGVkKSByZXR1cm4gbnVsbDtcbiAgICBpZiAoRXZlbnRJbmRleFBlZy5nZXQoKSkgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoRXZlbnRJbmRleFBlZy5lcnJvcikge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZWFyY2hXYXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIk1lc3NhZ2Ugc2VhcmNoIGluaXRpYWxpc2F0aW9uIGZhaWxlZCwgY2hlY2sgPGE+eW91ciBzZXR0aW5nczwvYT4gZm9yIG1vcmUgaW5mb3JtYXRpb25cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtfaW5saW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZ0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxUYWJJZDogVXNlclRhYi5TZWN1cml0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+KSxcbiAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoXCJicmFuZFwiKTtcbiAgICBjb25zdCBkZXNrdG9wQnVpbGRzID0gU2RrQ29uZmlnLmdldE9iamVjdChcImRlc2t0b3BfYnVpbGRzXCIpO1xuXG4gICAgbGV0IHRleHQgPSBudWxsO1xuICAgIGxldCBsb2dvID0gbnVsbDtcbiAgICBpZiAoZGVza3RvcEJ1aWxkcy5nZXQoXCJhdmFpbGFibGVcIikpIHtcbiAgICAgICAgbG9nbyA9IDxpbWcgc3JjPXtkZXNrdG9wQnVpbGRzLmdldChcImxvZ29cIil9IC8+O1xuICAgICAgICBjb25zdCBidWlsZFVybCA9IGRlc2t0b3BCdWlsZHMuZ2V0KFwidXJsXCIpO1xuICAgICAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgV2FybmluZ0tpbmQuRmlsZXM6XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiVXNlIHRoZSA8YT5EZXNrdG9wIGFwcDwvYT4gdG8gc2VlIGFsbCBlbmNyeXB0ZWQgZmlsZXNcIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+ICg8YSBocmVmPXtidWlsZFVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgc3ViIH08L2E+KSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgV2FybmluZ0tpbmQuU2VhcmNoOlxuICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIlVzZSB0aGUgPGE+RGVza3RvcCBhcHA8L2E+IHRvIHNlYXJjaCBlbmNyeXB0ZWQgbWVzc2FnZXNcIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+ICg8YSBocmVmPXtidWlsZFVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgc3ViIH08L2E+KSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgICAgICAgY2FzZSBXYXJuaW5nS2luZC5GaWxlczpcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJUaGlzIHZlcnNpb24gb2YgJShicmFuZClzIGRvZXMgbm90IHN1cHBvcnQgdmlld2luZyBzb21lIGVuY3J5cHRlZCBmaWxlc1wiLCB7IGJyYW5kIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBXYXJuaW5nS2luZC5TZWFyY2g6XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiVGhpcyB2ZXJzaW9uIG9mICUoYnJhbmQpcyBkb2VzIG5vdCBzdXBwb3J0IHNlYXJjaGluZyBlbmNyeXB0ZWQgbWVzc2FnZXNcIiwgeyBicmFuZCB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGZvciBzYWZldHlcbiAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oXCJVbmtub3duIGRlc2t0b3AgYnVpbGRzIHdhcm5pbmcga2luZDogXCIsIGtpbmQpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlYXJjaFdhcm5pbmdcIj5cbiAgICAgICAgICAgIHsgbG9nbyB9XG4gICAgICAgICAgICA8c3Bhbj57IHRleHQgfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBYVlBLFc7OztXQUFBQSxXO0VBQUFBLFcsQ0FBQUEsVztFQUFBQSxXLENBQUFB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