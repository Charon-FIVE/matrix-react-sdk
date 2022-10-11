"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Formatting = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
let Formatting;
exports.Formatting = Formatting;

(function (Formatting) {
  Formatting["Bold"] = "bold";
  Formatting["Italics"] = "italics";
  Formatting["Strikethrough"] = "strikethrough";
  Formatting["Code"] = "code";
  Formatting["Quote"] = "quote";
  Formatting["InsertLink"] = "insert_link";
})(Formatting || (exports.Formatting = Formatting = {}));

class MessageComposerFormatBar extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "formatBarRef", /*#__PURE__*/(0, _react.createRef)());
    this.state = {
      visible: false
    };
  }

  render() {
    const classes = (0, _classnames.default)("mx_MessageComposerFormatBar", {
      "mx_MessageComposerFormatBar_shown": this.state.visible
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      ref: this.formatBarRef
    }, /*#__PURE__*/_react.default.createElement(FormatButton, {
      label: (0, _languageHandler._t)("Bold"),
      onClick: () => this.props.onAction(Formatting.Bold),
      icon: "Bold",
      shortcut: this.props.shortcuts.bold,
      visible: this.state.visible
    }), /*#__PURE__*/_react.default.createElement(FormatButton, {
      label: (0, _languageHandler._t)("Italics"),
      onClick: () => this.props.onAction(Formatting.Italics),
      icon: "Italic",
      shortcut: this.props.shortcuts.italics,
      visible: this.state.visible
    }), /*#__PURE__*/_react.default.createElement(FormatButton, {
      label: (0, _languageHandler._t)("Strikethrough"),
      onClick: () => this.props.onAction(Formatting.Strikethrough),
      icon: "Strikethrough",
      visible: this.state.visible
    }), /*#__PURE__*/_react.default.createElement(FormatButton, {
      label: (0, _languageHandler._t)("Code block"),
      onClick: () => this.props.onAction(Formatting.Code),
      icon: "Code",
      shortcut: this.props.shortcuts.code,
      visible: this.state.visible
    }), /*#__PURE__*/_react.default.createElement(FormatButton, {
      label: (0, _languageHandler._t)("Quote"),
      onClick: () => this.props.onAction(Formatting.Quote),
      icon: "Quote",
      shortcut: this.props.shortcuts.quote,
      visible: this.state.visible
    }), /*#__PURE__*/_react.default.createElement(FormatButton, {
      label: (0, _languageHandler._t)("Insert link"),
      onClick: () => this.props.onAction(Formatting.InsertLink),
      icon: "InsertLink",
      shortcut: this.props.shortcuts.insert_link,
      visible: this.state.visible
    }));
  }

  showAt(selectionRect) {
    if (!this.formatBarRef.current) return;
    this.setState({
      visible: true
    });
    const parentRect = this.formatBarRef.current.parentElement.getBoundingClientRect();
    this.formatBarRef.current.style.left = `${selectionRect.left - parentRect.left}px`; // 16 is half the height of the bar (e.g. to center it) and 18 is an offset that felt ok.

    this.formatBarRef.current.style.top = `${selectionRect.top - parentRect.top - 16 - 18}px`;
  }

  hide() {
    this.setState({
      visible: false
    });
  }

}

exports.default = MessageComposerFormatBar;

class FormatButton extends _react.default.PureComponent {
  render() {
    const className = `mx_MessageComposerFormatBar_button mx_MessageComposerFormatBar_buttonIcon${this.props.icon}`;
    let shortcut;

    if (this.props.shortcut) {
      shortcut = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MessageComposerFormatBar_tooltipShortcut"
      }, this.props.shortcut);
    }

    const tooltip = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Tooltip_title"
    }, this.props.label), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Tooltip_sub"
    }, shortcut)); // element="button" and type="button" are necessary for the buttons to work on WebKit,
    // otherwise the text is deselected before onClick can ever be called


    return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      element: "button",
      type: "button",
      onClick: this.props.onClick,
      title: this.props.label,
      tooltip: tooltip,
      className: className
    });
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtYXR0aW5nIiwiTWVzc2FnZUNvbXBvc2VyRm9ybWF0QmFyIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsInN0YXRlIiwidmlzaWJsZSIsInJlbmRlciIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwiZm9ybWF0QmFyUmVmIiwiX3QiLCJvbkFjdGlvbiIsIkJvbGQiLCJzaG9ydGN1dHMiLCJib2xkIiwiSXRhbGljcyIsIml0YWxpY3MiLCJTdHJpa2V0aHJvdWdoIiwiQ29kZSIsImNvZGUiLCJRdW90ZSIsInF1b3RlIiwiSW5zZXJ0TGluayIsImluc2VydF9saW5rIiwic2hvd0F0Iiwic2VsZWN0aW9uUmVjdCIsImN1cnJlbnQiLCJzZXRTdGF0ZSIsInBhcmVudFJlY3QiLCJwYXJlbnRFbGVtZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0Iiwic3R5bGUiLCJsZWZ0IiwidG9wIiwiaGlkZSIsIkZvcm1hdEJ1dHRvbiIsImNsYXNzTmFtZSIsImljb24iLCJzaG9ydGN1dCIsInRvb2x0aXAiLCJsYWJlbCIsIm9uQ2xpY2siXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9NZXNzYWdlQ29tcG9zZXJGb3JtYXRCYXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSAtIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcblxuZXhwb3J0IGVudW0gRm9ybWF0dGluZyB7XG4gICAgQm9sZCA9IFwiYm9sZFwiLFxuICAgIEl0YWxpY3MgPSBcIml0YWxpY3NcIixcbiAgICBTdHJpa2V0aHJvdWdoID0gXCJzdHJpa2V0aHJvdWdoXCIsXG4gICAgQ29kZSA9IFwiY29kZVwiLFxuICAgIFF1b3RlID0gXCJxdW90ZVwiLFxuICAgIEluc2VydExpbmsgPSBcImluc2VydF9saW5rXCIsXG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNob3J0Y3V0czogUGFydGlhbDxSZWNvcmQ8Rm9ybWF0dGluZywgc3RyaW5nPj47XG4gICAgb25BY3Rpb24oYWN0aW9uOiBGb3JtYXR0aW5nKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdmlzaWJsZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZUNvbXBvc2VyRm9ybWF0QmFyIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZm9ybWF0QmFyUmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IHZpc2libGU6IGZhbHNlIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X01lc3NhZ2VDb21wb3NlckZvcm1hdEJhclwiLCB7XG4gICAgICAgICAgICBcIm14X01lc3NhZ2VDb21wb3NlckZvcm1hdEJhcl9zaG93blwiOiB0aGlzLnN0YXRlLnZpc2libGUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSByZWY9e3RoaXMuZm9ybWF0QmFyUmVmfT5cbiAgICAgICAgICAgIDxGb3JtYXRCdXR0b24gbGFiZWw9e190KFwiQm9sZFwiKX0gb25DbGljaz17KCkgPT4gdGhpcy5wcm9wcy5vbkFjdGlvbihGb3JtYXR0aW5nLkJvbGQpfSBpY29uPVwiQm9sZFwiIHNob3J0Y3V0PXt0aGlzLnByb3BzLnNob3J0Y3V0cy5ib2xkfSB2aXNpYmxlPXt0aGlzLnN0YXRlLnZpc2libGV9IC8+XG4gICAgICAgICAgICA8Rm9ybWF0QnV0dG9uIGxhYmVsPXtfdChcIkl0YWxpY3NcIil9IG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25BY3Rpb24oRm9ybWF0dGluZy5JdGFsaWNzKX0gaWNvbj1cIkl0YWxpY1wiIHNob3J0Y3V0PXt0aGlzLnByb3BzLnNob3J0Y3V0cy5pdGFsaWNzfSB2aXNpYmxlPXt0aGlzLnN0YXRlLnZpc2libGV9IC8+XG4gICAgICAgICAgICA8Rm9ybWF0QnV0dG9uIGxhYmVsPXtfdChcIlN0cmlrZXRocm91Z2hcIil9IG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25BY3Rpb24oRm9ybWF0dGluZy5TdHJpa2V0aHJvdWdoKX0gaWNvbj1cIlN0cmlrZXRocm91Z2hcIiB2aXNpYmxlPXt0aGlzLnN0YXRlLnZpc2libGV9IC8+XG4gICAgICAgICAgICA8Rm9ybWF0QnV0dG9uIGxhYmVsPXtfdChcIkNvZGUgYmxvY2tcIil9IG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25BY3Rpb24oRm9ybWF0dGluZy5Db2RlKX0gaWNvbj1cIkNvZGVcIiBzaG9ydGN1dD17dGhpcy5wcm9wcy5zaG9ydGN1dHMuY29kZX0gdmlzaWJsZT17dGhpcy5zdGF0ZS52aXNpYmxlfSAvPlxuICAgICAgICAgICAgPEZvcm1hdEJ1dHRvbiBsYWJlbD17X3QoXCJRdW90ZVwiKX0gb25DbGljaz17KCkgPT4gdGhpcy5wcm9wcy5vbkFjdGlvbihGb3JtYXR0aW5nLlF1b3RlKX0gaWNvbj1cIlF1b3RlXCIgc2hvcnRjdXQ9e3RoaXMucHJvcHMuc2hvcnRjdXRzLnF1b3RlfSB2aXNpYmxlPXt0aGlzLnN0YXRlLnZpc2libGV9IC8+XG4gICAgICAgICAgICA8Rm9ybWF0QnV0dG9uIGxhYmVsPXtfdChcIkluc2VydCBsaW5rXCIpfSBvbkNsaWNrPXsoKSA9PiB0aGlzLnByb3BzLm9uQWN0aW9uKEZvcm1hdHRpbmcuSW5zZXJ0TGluayl9IGljb249XCJJbnNlcnRMaW5rXCIgc2hvcnRjdXQ9e3RoaXMucHJvcHMuc2hvcnRjdXRzLmluc2VydF9saW5rfSB2aXNpYmxlPXt0aGlzLnN0YXRlLnZpc2libGV9IC8+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfVxuXG4gICAgcHVibGljIHNob3dBdChzZWxlY3Rpb25SZWN0OiBET01SZWN0KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2aXNpYmxlOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCBwYXJlbnRSZWN0ID0gdGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudC5wYXJlbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLmZvcm1hdEJhclJlZi5jdXJyZW50LnN0eWxlLmxlZnQgPSBgJHtzZWxlY3Rpb25SZWN0LmxlZnQgLSBwYXJlbnRSZWN0LmxlZnR9cHhgO1xuICAgICAgICAvLyAxNiBpcyBoYWxmIHRoZSBoZWlnaHQgb2YgdGhlIGJhciAoZS5nLiB0byBjZW50ZXIgaXQpIGFuZCAxOCBpcyBhbiBvZmZzZXQgdGhhdCBmZWx0IG9rLlxuICAgICAgICB0aGlzLmZvcm1hdEJhclJlZi5jdXJyZW50LnN0eWxlLnRvcCA9IGAke3NlbGVjdGlvblJlY3QudG9wIC0gcGFyZW50UmVjdC50b3AgLSAxNiAtIDE4fXB4YDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaGlkZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZpc2libGU6IGZhbHNlIH0pO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElGb3JtYXRCdXR0b25Qcm9wcyB7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBpY29uOiBzdHJpbmc7XG4gICAgc2hvcnRjdXQ/OiBzdHJpbmc7XG4gICAgdmlzaWJsZT86IGJvb2xlYW47XG4gICAgb25DbGljaygpOiB2b2lkO1xufVxuXG5jbGFzcyBGb3JtYXRCdXR0b24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElGb3JtYXRCdXR0b25Qcm9wcz4ge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gYG14X01lc3NhZ2VDb21wb3NlckZvcm1hdEJhcl9idXR0b24gbXhfTWVzc2FnZUNvbXBvc2VyRm9ybWF0QmFyX2J1dHRvbkljb24ke3RoaXMucHJvcHMuaWNvbn1gO1xuICAgICAgICBsZXQgc2hvcnRjdXQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3J0Y3V0KSB7XG4gICAgICAgICAgICBzaG9ydGN1dCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyRm9ybWF0QmFyX3Rvb2x0aXBTaG9ydGN1dFwiPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5zaG9ydGN1dCB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG9vbHRpcCA9IDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMubGFiZWwgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfc3ViXCI+XG4gICAgICAgICAgICAgICAgeyBzaG9ydGN1dCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIC8vIGVsZW1lbnQ9XCJidXR0b25cIiBhbmQgdHlwZT1cImJ1dHRvblwiIGFyZSBuZWNlc3NhcnkgZm9yIHRoZSBidXR0b25zIHRvIHdvcmsgb24gV2ViS2l0LFxuICAgICAgICAvLyBvdGhlcndpc2UgdGhlIHRleHQgaXMgZGVzZWxlY3RlZCBiZWZvcmUgb25DbGljayBjYW4gZXZlciBiZSBjYWxsZWRcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja31cbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgICAgICB0b29sdGlwPXt0b29sdGlwfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1l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