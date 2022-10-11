"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

/*
Copyright 2019 Tulir Asokan <tulir@maunium.net>
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
class Search extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "inputRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Enter:
          this.props.onEnter();
          ev.stopPropagation();
          ev.preventDefault();
          break;
      }
    });
  }

  componentDidMount() {
    // For some reason, neither the autoFocus nor just calling focus() here worked, so here's a setTimeout
    setTimeout(() => this.inputRef.current.focus(), 0);
  }

  render() {
    let rightButton;

    if (this.props.query) {
      rightButton = /*#__PURE__*/_react.default.createElement("button", {
        onClick: () => this.props.onChange(""),
        className: "mx_EmojiPicker_search_icon mx_EmojiPicker_search_clear",
        title: (0, _languageHandler._t)("Cancel search")
      });
    } else {
      rightButton = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_EmojiPicker_search_icon"
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmojiPicker_search"
    }, /*#__PURE__*/_react.default.createElement("input", {
      autoFocus: true,
      type: "text",
      placeholder: (0, _languageHandler._t)("Search"),
      value: this.props.query,
      onChange: ev => this.props.onChange(ev.target.value),
      onKeyDown: this.onKeyDown,
      ref: this.inputRef
    }), rightButton);
  }

}

var _default = Search;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZWFyY2giLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjcmVhdGVSZWYiLCJldiIsImFjdGlvbiIsImdldEtleUJpbmRpbmdzTWFuYWdlciIsImdldEFjY2Vzc2liaWxpdHlBY3Rpb24iLCJLZXlCaW5kaW5nQWN0aW9uIiwiRW50ZXIiLCJwcm9wcyIsIm9uRW50ZXIiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsImNvbXBvbmVudERpZE1vdW50Iiwic2V0VGltZW91dCIsImlucHV0UmVmIiwiY3VycmVudCIsImZvY3VzIiwicmVuZGVyIiwicmlnaHRCdXR0b24iLCJxdWVyeSIsIm9uQ2hhbmdlIiwiX3QiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uS2V5RG93biJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2Vtb2ppcGlja2VyL1NlYXJjaC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFR1bGlyIEFzb2thbiA8dHVsaXJAbWF1bml1bS5uZXQ+XG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBxdWVyeTogc3RyaW5nO1xuICAgIG9uQ2hhbmdlKHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xuICAgIG9uRW50ZXIoKTogdm9pZDtcbn1cblxuY2xhc3MgU2VhcmNoIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIGlucHV0UmVmID0gUmVhY3QuY3JlYXRlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gRm9yIHNvbWUgcmVhc29uLCBuZWl0aGVyIHRoZSBhdXRvRm9jdXMgbm9yIGp1c3QgY2FsbGluZyBmb2N1cygpIGhlcmUgd29ya2VkLCBzbyBoZXJlJ3MgYSBzZXRUaW1lb3V0XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5pbnB1dFJlZi5jdXJyZW50LmZvY3VzKCksIDApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVudGVyOlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25FbnRlcigpO1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgcmlnaHRCdXR0b247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnF1ZXJ5KSB7XG4gICAgICAgICAgICByaWdodEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25DaGFuZ2UoXCJcIil9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0Vtb2ppUGlja2VyX3NlYXJjaF9pY29uIG14X0Vtb2ppUGlja2VyX3NlYXJjaF9jbGVhclwiXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkNhbmNlbCBzZWFyY2hcIil9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByaWdodEJ1dHRvbiA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0Vtb2ppUGlja2VyX3NlYXJjaF9pY29uXCIgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FbW9qaVBpY2tlcl9zZWFyY2hcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiU2VhcmNoXCIpfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy5xdWVyeX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHRoaXMucHJvcHMub25DaGFuZ2UoZXYudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmlucHV0UmVmfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyByaWdodEJ1dHRvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY0EsTUFBTUEsTUFBTixTQUFxQkMsY0FBQSxDQUFNQyxhQUEzQixDQUFpRDtFQUFBO0lBQUE7SUFBQSw2REFDMUJELGNBQUEsQ0FBTUUsU0FBTixFQUQwQjtJQUFBLGlEQVF4QkMsRUFBRCxJQUE2QjtNQUM3QyxNQUFNQyxNQUFNLEdBQUcsSUFBQUMseUNBQUEsSUFBd0JDLHNCQUF4QixDQUErQ0gsRUFBL0MsQ0FBZjs7TUFDQSxRQUFRQyxNQUFSO1FBQ0ksS0FBS0csbUNBQUEsQ0FBaUJDLEtBQXRCO1VBQ0ksS0FBS0MsS0FBTCxDQUFXQyxPQUFYO1VBQ0FQLEVBQUUsQ0FBQ1EsZUFBSDtVQUNBUixFQUFFLENBQUNTLGNBQUg7VUFDQTtNQUxSO0lBT0gsQ0FqQjRDO0VBQUE7O0VBRzdDQyxpQkFBaUIsR0FBRztJQUNoQjtJQUNBQyxVQUFVLENBQUMsTUFBTSxLQUFLQyxRQUFMLENBQWNDLE9BQWQsQ0FBc0JDLEtBQXRCLEVBQVAsRUFBc0MsQ0FBdEMsQ0FBVjtFQUNIOztFQWFEQyxNQUFNLEdBQUc7SUFDTCxJQUFJQyxXQUFKOztJQUNBLElBQUksS0FBS1YsS0FBTCxDQUFXVyxLQUFmLEVBQXNCO01BQ2xCRCxXQUFXLGdCQUNQO1FBQ0ksT0FBTyxFQUFFLE1BQU0sS0FBS1YsS0FBTCxDQUFXWSxRQUFYLENBQW9CLEVBQXBCLENBRG5CO1FBRUksU0FBUyxFQUFDLHdEQUZkO1FBR0ksS0FBSyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsZUFBSDtNQUhYLEVBREo7SUFPSCxDQVJELE1BUU87TUFDSEgsV0FBVyxnQkFBRztRQUFNLFNBQVMsRUFBQztNQUFoQixFQUFkO0lBQ0g7O0lBRUQsb0JBQ0k7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSTtNQUNJLFNBQVMsTUFEYjtNQUVJLElBQUksRUFBQyxNQUZUO01BR0ksV0FBVyxFQUFFLElBQUFHLG1CQUFBLEVBQUcsUUFBSCxDQUhqQjtNQUlJLEtBQUssRUFBRSxLQUFLYixLQUFMLENBQVdXLEtBSnRCO01BS0ksUUFBUSxFQUFFakIsRUFBRSxJQUFJLEtBQUtNLEtBQUwsQ0FBV1ksUUFBWCxDQUFvQmxCLEVBQUUsQ0FBQ29CLE1BQUgsQ0FBVUMsS0FBOUIsQ0FMcEI7TUFNSSxTQUFTLEVBQUUsS0FBS0MsU0FOcEI7TUFPSSxHQUFHLEVBQUUsS0FBS1Y7SUFQZCxFQURKLEVBVU1JLFdBVk4sQ0FESjtFQWNIOztBQS9DNEM7O2VBa0RsQ3BCLE0ifQ==