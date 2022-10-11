"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _lodash = require("lodash");

var _classnames = _interopRequireDefault(require("classnames"));

var _AccessibleButton = _interopRequireDefault(require("../../components/views/elements/AccessibleButton"));

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

const _excluded = ["onSearch", "onCleared", "onKeyDown", "onFocus", "onBlur", "className", "placeholder", "blurredPlaceholder", "autoFocus", "initialValue", "collapsed"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class SearchBox extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "search", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onChange", () => {
      if (!this.search.current) return;
      this.setState({
        searchTerm: this.search.current.value
      });
      this.onSearch();
    });
    (0, _defineProperty2.default)(this, "onSearch", (0, _lodash.throttle)(() => {
      this.props.onSearch(this.search.current.value);
    }, 200, {
      trailing: true,
      leading: true
    }));
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Escape:
          this.clearSearch("keyboard");
          break;
      }

      if (this.props.onKeyDown) this.props.onKeyDown(ev);
    });
    (0, _defineProperty2.default)(this, "onFocus", ev => {
      this.setState({
        blurred: false
      });
      ev.target.select();

      if (this.props.onFocus) {
        this.props.onFocus(ev);
      }
    });
    (0, _defineProperty2.default)(this, "onBlur", ev => {
      this.setState({
        blurred: true
      });

      if (this.props.onBlur) {
        this.props.onBlur(ev);
      }
    });
    this.state = {
      searchTerm: props.initialValue || "",
      blurred: true
    };
  }

  clearSearch(source) {
    this.search.current.value = "";
    this.onChange();

    if (this.props.onCleared) {
      this.props.onCleared(source);
    }
  }

  render() {
    /* eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
    const _this$props = this.props,
          {
      onSearch,
      onCleared,
      onKeyDown,
      onFocus,
      onBlur,
      className = "",
      placeholder,
      blurredPlaceholder,
      autoFocus,
      initialValue,
      collapsed
    } = _this$props,
          props = (0, _objectWithoutProperties2.default)(_this$props, _excluded); // check for collapsed here and
    // not at parent so we keep
    // searchTerm in our state
    // when collapsing and expanding

    if (collapsed) {
      return null;
    }

    const clearButton = !this.state.blurred || this.state.searchTerm ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      key: "button",
      tabIndex: -1,
      className: "mx_SearchBox_closeButton",
      onClick: () => {
        this.clearSearch("button");
      }
    }) : undefined; // show a shorter placeholder when blurred, if requested
    // this is used for the room filter field that has
    // the explore button next to it when blurred

    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_SearchBox", "mx_textinput", {
        "mx_SearchBox_blurred": this.state.blurred
      })
    }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, props, {
      key: "searchfield",
      type: "text",
      ref: this.search,
      className: "mx_textinput_icon mx_textinput_search " + className,
      value: this.state.searchTerm,
      onFocus: this.onFocus,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      onBlur: this.onBlur,
      placeholder: this.state.blurred ? blurredPlaceholder || placeholder : placeholder,
      autoComplete: "off",
      autoFocus: this.props.autoFocus
    })), clearButton);
  }

}

exports.default = SearchBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZWFyY2hCb3giLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJzZWFyY2giLCJjdXJyZW50Iiwic2V0U3RhdGUiLCJzZWFyY2hUZXJtIiwidmFsdWUiLCJvblNlYXJjaCIsInRocm90dGxlIiwidHJhaWxpbmciLCJsZWFkaW5nIiwiZXYiLCJhY3Rpb24iLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRBY2Nlc3NpYmlsaXR5QWN0aW9uIiwiS2V5QmluZGluZ0FjdGlvbiIsIkVzY2FwZSIsImNsZWFyU2VhcmNoIiwib25LZXlEb3duIiwiYmx1cnJlZCIsInRhcmdldCIsInNlbGVjdCIsIm9uRm9jdXMiLCJvbkJsdXIiLCJzdGF0ZSIsImluaXRpYWxWYWx1ZSIsInNvdXJjZSIsIm9uQ2hhbmdlIiwib25DbGVhcmVkIiwicmVuZGVyIiwiY2xhc3NOYW1lIiwicGxhY2Vob2xkZXIiLCJibHVycmVkUGxhY2Vob2xkZXIiLCJhdXRvRm9jdXMiLCJjb2xsYXBzZWQiLCJjbGVhckJ1dHRvbiIsInVuZGVmaW5lZCIsImNsYXNzTmFtZXMiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL1NlYXJjaEJveC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmLCBIVE1MUHJvcHMgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB0aHJvdHRsZSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCB7IGdldEtleUJpbmRpbmdzTWFuYWdlciB9IGZyb20gXCIuLi8uLi9LZXlCaW5kaW5nc01hbmFnZXJcIjtcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSFRNTFByb3BzPEhUTUxJbnB1dEVsZW1lbnQ+IHtcbiAgICBvblNlYXJjaD86IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xuICAgIG9uQ2xlYXJlZD86IChzb3VyY2U/OiBzdHJpbmcpID0+IHZvaWQ7XG4gICAgb25LZXlEb3duPzogKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB2b2lkO1xuICAgIG9uRm9jdXM/OiAoZXY6IFJlYWN0LkZvY3VzRXZlbnQpID0+IHZvaWQ7XG4gICAgb25CbHVyPzogKGV2OiBSZWFjdC5Gb2N1c0V2ZW50KSA9PiB2b2lkO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBwbGFjZWhvbGRlcjogc3RyaW5nO1xuICAgIGJsdXJyZWRQbGFjZWhvbGRlcj86IHN0cmluZztcbiAgICBhdXRvRm9jdXM/OiBib29sZWFuO1xuICAgIGluaXRpYWxWYWx1ZT86IHN0cmluZztcbiAgICBjb2xsYXBzZWQ/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzZWFyY2hUZXJtOiBzdHJpbmc7XG4gICAgYmx1cnJlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoQm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBzZWFyY2ggPSBjcmVhdGVSZWY8SFRNTElucHV0RWxlbWVudD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzZWFyY2hUZXJtOiBwcm9wcy5pbml0aWFsVmFsdWUgfHwgXCJcIixcbiAgICAgICAgICAgIGJsdXJyZWQ6IHRydWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnNlYXJjaC5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hUZXJtOiB0aGlzLnNlYXJjaC5jdXJyZW50LnZhbHVlIH0pO1xuICAgICAgICB0aGlzLm9uU2VhcmNoKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TZWFyY2ggPSB0aHJvdHRsZSgoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25TZWFyY2godGhpcy5zZWFyY2guY3VycmVudC52YWx1ZSk7XG4gICAgfSwgMjAwLCB7IHRyYWlsaW5nOiB0cnVlLCBsZWFkaW5nOiB0cnVlIH0pO1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihldik7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRXNjYXBlOlxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJTZWFyY2goXCJrZXlib2FyZFwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbktleURvd24pIHRoaXMucHJvcHMub25LZXlEb3duKGV2KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZvY3VzID0gKGV2OiBSZWFjdC5Gb2N1c0V2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBibHVycmVkOiBmYWxzZSB9KTtcbiAgICAgICAgKGV2LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5zZWxlY3QoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25Gb2N1cykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZvY3VzKGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQmx1ciA9IChldjogUmVhY3QuRm9jdXNFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgYmx1cnJlZDogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25CbHVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQmx1cihldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjbGVhclNlYXJjaChzb3VyY2U/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZWFyY2guY3VycmVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DbGVhcmVkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2xlYXJlZChzb3VyY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIC8qIGVzbGludCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnM6IFtcImVycm9yXCIsIHsgXCJpZ25vcmVSZXN0U2libGluZ3NcIjogdHJ1ZSB9XSAqL1xuICAgICAgICBjb25zdCB7IG9uU2VhcmNoLCBvbkNsZWFyZWQsIG9uS2V5RG93biwgb25Gb2N1cywgb25CbHVyLCBjbGFzc05hbWUgPSBcIlwiLCBwbGFjZWhvbGRlciwgYmx1cnJlZFBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgYXV0b0ZvY3VzLCBpbml0aWFsVmFsdWUsIGNvbGxhcHNlZCwgLi4ucHJvcHMgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIGNvbGxhcHNlZCBoZXJlIGFuZFxuICAgICAgICAvLyBub3QgYXQgcGFyZW50IHNvIHdlIGtlZXBcbiAgICAgICAgLy8gc2VhcmNoVGVybSBpbiBvdXIgc3RhdGVcbiAgICAgICAgLy8gd2hlbiBjb2xsYXBzaW5nIGFuZCBleHBhbmRpbmdcbiAgICAgICAgaWYgKGNvbGxhcHNlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2xlYXJCdXR0b24gPSAoIXRoaXMuc3RhdGUuYmx1cnJlZCB8fCB0aGlzLnN0YXRlLnNlYXJjaFRlcm0pID9cbiAgICAgICAgICAgICg8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtleT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NlYXJjaEJveF9jbG9zZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge3RoaXMuY2xlYXJTZWFyY2goXCJidXR0b25cIik7IH19XG4gICAgICAgICAgICAvPikgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gc2hvdyBhIHNob3J0ZXIgcGxhY2Vob2xkZXIgd2hlbiBibHVycmVkLCBpZiByZXF1ZXN0ZWRcbiAgICAgICAgLy8gdGhpcyBpcyB1c2VkIGZvciB0aGUgcm9vbSBmaWx0ZXIgZmllbGQgdGhhdCBoYXNcbiAgICAgICAgLy8gdGhlIGV4cGxvcmUgYnV0dG9uIG5leHQgdG8gaXQgd2hlbiBibHVycmVkXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1NlYXJjaEJveFwiLCBcIm14X3RleHRpbnB1dFwiLCB7IFwibXhfU2VhcmNoQm94X2JsdXJyZWRcIjogdGhpcy5zdGF0ZS5ibHVycmVkIH0pfT5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgICAgICAgICBrZXk9XCJzZWFyY2hmaWVsZFwiXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnNlYXJjaH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtcIm14X3RleHRpbnB1dF9pY29uIG14X3RleHRpbnB1dF9zZWFyY2ggXCIgKyBjbGFzc05hbWV9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnNlYXJjaFRlcm19XG4gICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vbkJsdXJ9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnN0YXRlLmJsdXJyZWQgPyAoYmx1cnJlZFBsYWNlaG9sZGVyIHx8IHBsYWNlaG9sZGVyKSA6IHBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RoaXMucHJvcHMuYXV0b0ZvY3VzfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyBjbGVhckJ1dHRvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFxQmUsTUFBTUEsU0FBTixTQUF3QkMsY0FBQSxDQUFNQyxTQUE5QixDQUF3RDtFQUduRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIsMkRBRlYsSUFBQUMsZ0JBQUEsR0FFVTtJQUFBLGdEQVNSLE1BQVk7TUFDM0IsSUFBSSxDQUFDLEtBQUtDLE1BQUwsQ0FBWUMsT0FBakIsRUFBMEI7TUFDMUIsS0FBS0MsUUFBTCxDQUFjO1FBQUVDLFVBQVUsRUFBRSxLQUFLSCxNQUFMLENBQVlDLE9BQVosQ0FBb0JHO01BQWxDLENBQWQ7TUFDQSxLQUFLQyxRQUFMO0lBQ0gsQ0FiMEI7SUFBQSxnREFlUixJQUFBQyxnQkFBQSxFQUFTLE1BQVk7TUFDcEMsS0FBS1IsS0FBTCxDQUFXTyxRQUFYLENBQW9CLEtBQUtMLE1BQUwsQ0FBWUMsT0FBWixDQUFvQkcsS0FBeEM7SUFDSCxDQUZrQixFQUVoQixHQUZnQixFQUVYO01BQUVHLFFBQVEs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