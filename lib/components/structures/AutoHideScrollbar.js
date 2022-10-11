"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireDefault(require("react"));

const _excluded = ["element", "className", "onScroll", "tabIndex", "wrappedRef", "children"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class AutoHideScrollbar extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "containerRef", /*#__PURE__*/_react.default.createRef());
  }

  componentDidMount() {
    if (this.containerRef.current && this.props.onScroll) {
      // Using the passive option to not block the main thread
      // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
      this.containerRef.current.addEventListener("scroll", this.props.onScroll, {
        passive: true
      });
    }

    this.props.wrappedRef?.(this.containerRef.current);
  }

  componentWillUnmount() {
    if (this.containerRef.current && this.props.onScroll) {
      this.containerRef.current.removeEventListener("scroll", this.props.onScroll);
    }
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _this$props = this.props,
          {
      element,
      className,
      onScroll,
      tabIndex,
      wrappedRef,
      children
    } = _this$props,
          otherProps = (0, _objectWithoutProperties2.default)(_this$props, _excluded);
    return /*#__PURE__*/_react.default.createElement(element, _objectSpread(_objectSpread({}, otherProps), {}, {
      ref: this.containerRef,
      className: (0, _classnames.default)("mx_AutoHideScrollbar", className),
      // Firefox sometimes makes this element focusable due to
      // overflow:scroll;, so force it out of tab order by default.
      tabIndex: tabIndex ?? -1
    }), children);
  }

}

exports.default = AutoHideScrollbar;
(0, _defineProperty2.default)(AutoHideScrollbar, "defaultProps", {
  element: 'div'
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdXRvSGlkZVNjcm9sbGJhciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY3JlYXRlUmVmIiwiY29tcG9uZW50RGlkTW91bnQiLCJjb250YWluZXJSZWYiLCJjdXJyZW50IiwicHJvcHMiLCJvblNjcm9sbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJwYXNzaXZlIiwid3JhcHBlZFJlZiIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbmRlciIsImVsZW1lbnQiLCJjbGFzc05hbWUiLCJ0YWJJbmRleCIsImNoaWxkcmVuIiwib3RoZXJQcm9wcyIsImNyZWF0ZUVsZW1lbnQiLCJyZWYiLCJjbGFzc05hbWVzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9BdXRvSGlkZVNjcm9sbGJhci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgUmVhY3QsIHsgSFRNTEF0dHJpYnV0ZXMsIFJlYWN0SFRNTCwgV2hlZWxFdmVudCB9IGZyb20gXCJyZWFjdFwiO1xuXG50eXBlIER5bmFtaWNIdG1sRWxlbWVudFByb3BzPFQgZXh0ZW5kcyBrZXlvZiBKU1guSW50cmluc2ljRWxlbWVudHM+ID1cbiAgICBKU1guSW50cmluc2ljRWxlbWVudHNbVF0gZXh0ZW5kcyBIVE1MQXR0cmlidXRlczx7fT4gPyBEeW5hbWljRWxlbWVudFByb3BzPFQ+IDogRHluYW1pY0VsZW1lbnRQcm9wczxcImRpdlwiPjtcbnR5cGUgRHluYW1pY0VsZW1lbnRQcm9wczxUIGV4dGVuZHMga2V5b2YgSlNYLkludHJpbnNpY0VsZW1lbnRzPiA9IFBhcnRpYWw8T21pdDxKU1guSW50cmluc2ljRWxlbWVudHNbVF0sICdyZWYnPj47XG5cbmV4cG9ydCB0eXBlIElQcm9wczxUIGV4dGVuZHMga2V5b2YgSlNYLkludHJpbnNpY0VsZW1lbnRzPiA9IER5bmFtaWNIdG1sRWxlbWVudFByb3BzPFQ+ICYge1xuICAgIGVsZW1lbnQ/OiBUO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBvblNjcm9sbD86IChldmVudDogRXZlbnQpID0+IHZvaWQ7XG4gICAgb25XaGVlbD86IChldmVudDogV2hlZWxFdmVudCkgPT4gdm9pZDtcbiAgICBzdHlsZT86IFJlYWN0LkNTU1Byb3BlcnRpZXM7XG4gICAgdGFiSW5kZXg/OiBudW1iZXI7XG4gICAgd3JhcHBlZFJlZj86IChyZWY6IEhUTUxEaXZFbGVtZW50KSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXV0b0hpZGVTY3JvbGxiYXI8VCBleHRlbmRzIGtleW9mIEpTWC5JbnRyaW5zaWNFbGVtZW50cz4gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPFQ+PiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgZWxlbWVudDogJ2RpdicgYXMga2V5b2YgUmVhY3RIVE1MLFxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgY29udGFpbmVyUmVmOiBSZWFjdC5SZWZPYmplY3Q8SFRNTERpdkVsZW1lbnQ+ID0gUmVhY3QuY3JlYXRlUmVmKCk7XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lclJlZi5jdXJyZW50ICYmIHRoaXMucHJvcHMub25TY3JvbGwpIHtcbiAgICAgICAgICAgIC8vIFVzaW5nIHRoZSBwYXNzaXZlIG9wdGlvbiB0byBub3QgYmxvY2sgdGhlIG1haW4gdGhyZWFkXG4gICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXQvYWRkRXZlbnRMaXN0ZW5lciNpbXByb3Zpbmdfc2Nyb2xsaW5nX3BlcmZvcm1hbmNlX3dpdGhfcGFzc2l2ZV9saXN0ZW5lcnNcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyUmVmLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLnByb3BzLm9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb3BzLndyYXBwZWRSZWY/Lih0aGlzLmNvbnRhaW5lclJlZi5jdXJyZW50KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lclJlZi5jdXJyZW50ICYmIHRoaXMucHJvcHMub25TY3JvbGwpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyUmVmLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLnByb3BzLm9uU2Nyb2xsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgY29uc3QgeyBlbGVtZW50LCBjbGFzc05hbWUsIG9uU2Nyb2xsLCB0YWJJbmRleCwgd3JhcHBlZFJlZiwgY2hpbGRyZW4sIC4uLm90aGVyUHJvcHMgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoZWxlbWVudCwge1xuICAgICAgICAgICAgLi4ub3RoZXJQcm9wcyxcbiAgICAgICAgICAgIHJlZjogdGhpcy5jb250YWluZXJSZWYsXG4gICAgICAgICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZXMoXCJteF9BdXRvSGlkZVNjcm9sbGJhclwiLCBjbGFzc05hbWUpLFxuICAgICAgICAgICAgLy8gRmlyZWZveCBzb21ldGltZXMgbWFrZXMgdGhpcyBlbGVtZW50IGZvY3VzYWJsZSBkdWUgdG9cbiAgICAgICAgICAgIC8vIG92ZXJmbG93OnNjcm9sbDssIHNvIGZvcmNlIGl0IG91dCBvZiB0YWIgb3JkZXIgYnkgZGVmYXVsdC5cbiAgICAgICAgICAgIHRhYkluZGV4OiB0YWJJbmRleCA/PyAtMSxcbiAgICAgICAgfSwgY2hpbGRyZW4pO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7Ozs7Ozs7QUFnQmUsTUFBTUEsaUJBQU4sU0FBdUVDLGNBQUEsQ0FBTUMsU0FBN0UsQ0FBa0c7RUFBQTtJQUFBO0lBQUEsaUVBSzdDRCxjQUFBLENBQU1FLFNBQU4sRUFMNkM7RUFBQTs7RUFPdEdDLGlCQUFpQixHQUFHO0lBQ3ZCLElBQUksS0FBS0MsWUFBTCxDQUFrQkMsT0FBbEIsSUFBNkIsS0FBS0MsS0FBTCxDQUFXQyxRQUE1QyxFQUFzRDtNQUNsRDtNQUNBO01BQ0EsS0FBS0gsWUFBTCxDQUFrQkMsT0FBbEIsQ0FBMEJHLGdCQUExQixDQUEyQyxRQUEzQyxFQUFxRCxLQUFLRixLQUFMLENBQVdDLFFBQWhFLEVBQTBFO1FBQUVFLE9BQU8sRUFBRTtNQUFYLENBQTFFO0lBQ0g7O0lBRUQsS0FBS0gsS0FBTCxDQUFXSSxVQUFYLEdBQXdCLEtBQUtOLFlBQUwsQ0FBa0JDLE9BQTFDO0VBQ0g7O0VBRU1NLG9CQUFvQixHQUFHO0lBQzFCLElBQUksS0FBS1AsWUFBTCxDQUFrQkMsT0FBbEIsSUFBNkIsS0FBS0MsS0FBTCxDQUFXQyxRQUE1QyxFQUFzRDtNQUNsRCxLQUFLSCxZQUFMLENBQWtCQyxPQUFsQixDQUEwQk8sbUJBQTFCLENBQThDLFFBQTlDLEVBQXdELEtBQUtOLEtBQUwsQ0FBV0MsUUFBbkU7SUFDSDtFQUNKOztFQUVNTSxNQUFNLEdBQUc7SUFDWjtJQUNBLG9CQUF3RixLQUFLUCxLQUE3RjtJQUFBLE1BQU07TUFBRVEsT0FBRjtNQUFXQyxTQUFYO01BQXNCUixRQUF0QjtNQUFnQ1MsUUFBaEM7TUFBMENOLFVBQTFDO01BQXNETztJQUF0RCxDQUFOO0lBQUEsTUFBeUVDLFVBQXpFO0lBRUEsb0JBQU9sQixjQUFBLENBQU1tQixhQUFOLENBQW9CTCxPQUFwQixrQ0FDQUksVUFEQTtNQUVIRSxHQUFHLEVBQUUsS0FBS2hCLFlBRlA7TUFHSFcsU0FBUyxFQUFFLElBQUFNLG1CQUFBLEVBQVcsc0JBQVgsRUFBbUNOLFNBQW5DLENBSFI7TUFJSDtNQUNBO01BQ0FDLFFBQVEsRUFBRUEsUUFBUSxJQUFJLENBQUM7SUFOcEIsSUFPSkMsUUFQSSxDQUFQO0VBUUg7O0FBbkM0Rzs7OzhCQUE1RmxCLGlCLGtCQUNLO0VBQ2xCZSxPQUFPLEVBQUU7QUFEUyxDIn0=