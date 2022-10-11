"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SearchScope = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _languageHandler = require("../../../languageHandler");

var _PosthogTrackers = require("../../../PosthogTrackers");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _SearchWarning = _interopRequireWildcard(require("../elements/SearchWarning"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd
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
let SearchScope;
exports.SearchScope = SearchScope;

(function (SearchScope) {
  SearchScope["Room"] = "Room";
  SearchScope["All"] = "All";
})(SearchScope || (exports.SearchScope = SearchScope = {}));

class SearchBar extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "searchTerm", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onThisRoomClick", () => {
      this.setState({
        scope: SearchScope.Room
      }, () => this.searchIfQuery());
    });
    (0, _defineProperty2.default)(this, "onAllRoomsClick", () => {
      this.setState({
        scope: SearchScope.All
      }, () => this.searchIfQuery());
    });
    (0, _defineProperty2.default)(this, "onSearchChange", e => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(e);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Enter:
          this.onSearch();
          break;

        case _KeyboardShortcuts.KeyBindingAction.Escape:
          this.props.onCancelClick();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onSearch", () => {
      if (!this.searchTerm.current.value.trim()) return;
      this.props.onSearch(this.searchTerm.current.value, this.state.scope);
    });
    this.state = {
      scope: SearchScope.Room
    };
  }

  searchIfQuery() {
    if (this.searchTerm.current.value) {
      this.onSearch();
    }
  }

  render() {
    const searchButtonClasses = (0, _classnames.default)("mx_SearchBar_searchButton", {
      mx_SearchBar_searching: this.props.searchInProgress
    });
    const thisRoomClasses = (0, _classnames.default)("mx_SearchBar_button", {
      mx_SearchBar_unselected: this.state.scope !== SearchScope.Room
    });
    const allRoomsClasses = (0, _classnames.default)("mx_SearchBar_button", {
      mx_SearchBar_unselected: this.state.scope !== SearchScope.All
    });
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_PosthogTrackers.PosthogScreenTracker, {
      screenName: "RoomSearch"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SearchBar"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SearchBar_buttons",
      role: "radiogroup"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: thisRoomClasses,
      onClick: this.onThisRoomClick,
      "aria-checked": this.state.scope === SearchScope.Room,
      role: "radio"
    }, (0, _languageHandler._t)("This Room")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: allRoomsClasses,
      onClick: this.onAllRoomsClick,
      "aria-checked": this.state.scope === SearchScope.All,
      role: "radio"
    }, (0, _languageHandler._t)("All Rooms"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SearchBar_input mx_textinput"
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this.searchTerm,
      type: "text",
      autoFocus: true,
      placeholder: (0, _languageHandler._t)("Search…"),
      onKeyDown: this.onSearchChange
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: searchButtonClasses,
      onClick: this.onSearch
    })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_SearchBar_cancel",
      onClick: this.props.onCancelClick
    })), /*#__PURE__*/_react.default.createElement(_SearchWarning.default, {
      isRoomEncrypted: this.props.isRoomEncrypted,
      kind: _SearchWarning.WarningKind.Search
    }));
  }

}

exports.default = SearchBar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZWFyY2hTY29wZSIsIlNlYXJjaEJhciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsInNldFN0YXRlIiwic2NvcGUiLCJSb29tIiwic2VhcmNoSWZRdWVyeSIsIkFsbCIsImUiLCJhY3Rpb24iLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRBY2Nlc3NpYmlsaXR5QWN0aW9uIiwiS2V5QmluZGluZ0FjdGlvbiIsIkVudGVyIiwib25TZWFyY2giLCJFc2NhcGUiLCJvbkNhbmNlbENsaWNrIiwic2VhcmNoVGVybSIsImN1cnJlbnQiLCJ2YWx1ZSIsInRyaW0iLCJzdGF0ZSIsInJlbmRlciIsInNlYXJjaEJ1dHRvbkNsYXNzZXMiLCJjbGFzc05hbWVzIiwibXhfU2VhcmNoQmFyX3NlYXJjaGluZyIsInNlYXJjaEluUHJvZ3Jlc3MiLCJ0aGlzUm9vbUNsYXNzZXMiLCJteF9TZWFyY2hCYXJfdW5zZWxlY3RlZCIsImFsbFJvb21zQ2xhc3NlcyIsIm9uVGhpc1Jvb21DbGljayIsIl90Iiwib25BbGxSb29tc0NsaWNrIiwib25TZWFyY2hDaGFuZ2UiLCJpc1Jvb21FbmNyeXB0ZWQiLCJXYXJuaW5nS2luZCIsIlNlYXJjaCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1NlYXJjaEJhci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYsIFJlZk9iamVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBQb3N0aG9nU2NyZWVuVHJhY2tlciB9IGZyb20gJy4uLy4uLy4uL1Bvc3Rob2dUcmFja2Vycyc7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCBTZWFyY2hXYXJuaW5nLCB7IFdhcm5pbmdLaW5kIH0gZnJvbSBcIi4uL2VsZW1lbnRzL1NlYXJjaFdhcm5pbmdcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgb25DYW5jZWxDbGljazogKCkgPT4gdm9pZDtcbiAgICBvblNlYXJjaDogKHF1ZXJ5OiBzdHJpbmcsIHNjb3BlOiBzdHJpbmcpID0+IHZvaWQ7XG4gICAgc2VhcmNoSW5Qcm9ncmVzcz86IGJvb2xlYW47XG4gICAgaXNSb29tRW5jcnlwdGVkPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgc2NvcGU6IFNlYXJjaFNjb3BlO1xufVxuXG5leHBvcnQgZW51bSBTZWFyY2hTY29wZSB7XG4gICAgUm9vbSA9IFwiUm9vbVwiLFxuICAgIEFsbCA9IFwiQWxsXCIsXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaEJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgc2VhcmNoVGVybTogUmVmT2JqZWN0PEhUTUxJbnB1dEVsZW1lbnQ+ID0gY3JlYXRlUmVmKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNjb3BlOiBTZWFyY2hTY29wZS5Sb29tLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25UaGlzUm9vbUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2NvcGU6IFNlYXJjaFNjb3BlLlJvb20gfSwgKCkgPT4gdGhpcy5zZWFyY2hJZlF1ZXJ5KCkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWxsUm9vbXNDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNjb3BlOiBTZWFyY2hTY29wZS5BbGwgfSwgKCkgPT4gdGhpcy5zZWFyY2hJZlF1ZXJ5KCkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2VhcmNoQ2hhbmdlID0gKGU6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihlKTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5FbnRlcjpcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2VhcmNoKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRXNjYXBlOlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DYW5jZWxDbGljaygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2VhcmNoSWZRdWVyeSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoVGVybS5jdXJyZW50LnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLm9uU2VhcmNoKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2VhcmNoID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoVGVybS5jdXJyZW50LnZhbHVlLnRyaW0oKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnByb3BzLm9uU2VhcmNoKHRoaXMuc2VhcmNoVGVybS5jdXJyZW50LnZhbHVlLCB0aGlzLnN0YXRlLnNjb3BlKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoQnV0dG9uQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9TZWFyY2hCYXJfc2VhcmNoQnV0dG9uXCIsIHtcbiAgICAgICAgICAgIG14X1NlYXJjaEJhcl9zZWFyY2hpbmc6IHRoaXMucHJvcHMuc2VhcmNoSW5Qcm9ncmVzcyxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHRoaXNSb29tQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9TZWFyY2hCYXJfYnV0dG9uXCIsIHtcbiAgICAgICAgICAgIG14X1NlYXJjaEJhcl91bnNlbGVjdGVkOiB0aGlzLnN0YXRlLnNjb3BlICE9PSBTZWFyY2hTY29wZS5Sb29tLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYWxsUm9vbXNDbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1NlYXJjaEJhcl9idXR0b25cIiwge1xuICAgICAgICAgICAgbXhfU2VhcmNoQmFyX3Vuc2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2NvcGUgIT09IFNlYXJjaFNjb3BlLkFsbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPFBvc3Rob2dTY3JlZW5UcmFja2VyIHNjcmVlbk5hbWU9XCJSb29tU2VhcmNoXCIgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlYXJjaEJhclwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlYXJjaEJhcl9idXR0b25zXCIgcm9sZT1cInJhZGlvZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt0aGlzUm9vbUNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblRoaXNSb29tQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1jaGVja2VkPXt0aGlzLnN0YXRlLnNjb3BlID09PSBTZWFyY2hTY29wZS5Sb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJyYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlRoaXMgUm9vbVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YWxsUm9vbXNDbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25BbGxSb29tc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtY2hlY2tlZD17dGhpcy5zdGF0ZS5zY29wZSA9PT0gU2VhcmNoU2NvcGUuQWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJyYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkFsbCBSb29tc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlYXJjaEJhcl9pbnB1dCBteF90ZXh0aW5wdXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5zZWFyY2hUZXJtfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiU2VhcmNo4oCmXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vblNlYXJjaENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9e3NlYXJjaEJ1dHRvbkNsYXNzZXN9IG9uQ2xpY2s9e3RoaXMub25TZWFyY2h9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9TZWFyY2hCYXJfY2FuY2VsXCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkNhbmNlbENsaWNrfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxTZWFyY2hXYXJuaW5nIGlzUm9vbUVuY3J5cHRlZD17dGhpcy5wcm9wcy5pc1Jvb21FbmNyeXB0ZWR9IGtpbmQ9e1dhcm5pbmdLaW5kLlNlYXJjaH0gLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQXVCWUEsVzs7O1dBQUFBLFc7RUFBQUEsVztFQUFBQSxXO0dBQUFBLFcsMkJBQUFBLFc7O0FBS0csTUFBTUMsU0FBTixTQUF3QkMsY0FBQSxDQUFNQyxTQUE5QixDQUF3RDtFQUduRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIsK0RBRnVCLElBQUFDLGdCQUFBLEdBRXZCO0lBQUEsdURBT0QsTUFBTTtNQUM1QixLQUFLQyxRQUFMLENBQWM7UUFBRUMsS0FBSyxFQUFFUixXQUFXLENBQUNTO01BQXJCLENBQWQsRUFBMkMsTUFBTSxLQUFLQyxhQUFMLEVBQWpEO0lBQ0gsQ0FUMEI7SUFBQSx1REFXRCxNQUFNO01BQzVCLEtBQUtILFFBQUwsQ0FBYztRQUFFQyxLQUFLLEVBQUVSLFdBQVcsQ0FBQ1c7TUFBckIsQ0FBZCxFQUEwQyxNQUFNLEtBQUtELGFBQUwsRUFB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