"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CheckboxStyle = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _randomstring = require("matrix-js-sdk/src/randomstring");

var _classnames = _interopRequireDefault(require("classnames"));

const _excluded = ["children", "className", "kind", "inputRef"];
let CheckboxStyle;
exports.CheckboxStyle = CheckboxStyle;

(function (CheckboxStyle) {
  CheckboxStyle["Solid"] = "solid";
  CheckboxStyle["Outline"] = "outline";
})(CheckboxStyle || (exports.CheckboxStyle = CheckboxStyle = {}));

class StyledCheckbox extends _react.default.PureComponent {
  constructor(props) {
    super(props); // 56^10 so unlikely chance of collision.

    (0, _defineProperty2.default)(this, "id", void 0);
    this.id = this.props.id || "checkbox_" + (0, _randomstring.randomString)(10);
  }

  render() {
    /* eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
    const _this$props = this.props,
          {
      children,
      className,
      kind = CheckboxStyle.Solid,
      inputRef
    } = _this$props,
          otherProps = (0, _objectWithoutProperties2.default)(_this$props, _excluded);
    const newClassName = (0, _classnames.default)("mx_Checkbox", className, {
      "mx_Checkbox_hasKind": kind,
      [`mx_Checkbox_kind_${kind}`]: kind
    });
    return /*#__PURE__*/_react.default.createElement("span", {
      className: newClassName
    }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
      // Pass through the ref - used for keyboard shortcut access to some buttons
      ref: inputRef,
      id: this.id
    }, otherProps, {
      type: "checkbox"
    })), /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: this.id
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Checkbox_background"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Checkbox_checkmark"
    })), !!this.props.children && /*#__PURE__*/_react.default.createElement("div", null, this.props.children)));
  }

}

exports.default = StyledCheckbox;
(0, _defineProperty2.default)(StyledCheckbox, "defaultProps", {
  className: ""
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGVja2JveFN0eWxlIiwiU3R5bGVkQ2hlY2tib3giLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiaWQiLCJyYW5kb21TdHJpbmciLCJyZW5kZXIiLCJjaGlsZHJlbiIsImNsYXNzTmFtZSIsImtpbmQiLCJTb2xpZCIsImlucHV0UmVmIiwib3RoZXJQcm9wcyIsIm5ld0NsYXNzTmFtZSIsImNsYXNzbmFtZXMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9TdHlsZWRDaGVja2JveC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgcmFuZG9tU3RyaW5nIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3JhbmRvbXN0cmluZ1wiO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmV4cG9ydCBlbnVtIENoZWNrYm94U3R5bGUge1xuICAgIFNvbGlkID0gXCJzb2xpZFwiLFxuICAgIE91dGxpbmUgPSBcIm91dGxpbmVcIixcbn1cblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIFJlYWN0LklucHV0SFRNTEF0dHJpYnV0ZXM8SFRNTElucHV0RWxlbWVudD4ge1xuICAgIGlucHV0UmVmPzogUmVhY3QuUmVmT2JqZWN0PEhUTUxJbnB1dEVsZW1lbnQ+O1xuICAgIGtpbmQ/OiBDaGVja2JveFN0eWxlO1xuICAgIGlkPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3R5bGVkQ2hlY2tib3ggZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBpZDogc3RyaW5nO1xuXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGNsYXNzTmFtZTogXCJcIixcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIC8vIDU2XjEwIHNvIHVubGlrZWx5IGNoYW5jZSBvZiBjb2xsaXNpb24uXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnByb3BzLmlkIHx8IFwiY2hlY2tib3hfXCIgKyByYW5kb21TdHJpbmcoMTApO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIC8qIGVzbGludCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnM6IFtcImVycm9yXCIsIHsgXCJpZ25vcmVSZXN0U2libGluZ3NcIjogdHJ1ZSB9XSAqL1xuICAgICAgICBjb25zdCB7IGNoaWxkcmVuLCBjbGFzc05hbWUsIGtpbmQgPSBDaGVja2JveFN0eWxlLlNvbGlkLCBpbnB1dFJlZiwgLi4ub3RoZXJQcm9wcyB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBjb25zdCBuZXdDbGFzc05hbWUgPSBjbGFzc25hbWVzKFxuICAgICAgICAgICAgXCJteF9DaGVja2JveFwiLFxuICAgICAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwibXhfQ2hlY2tib3hfaGFzS2luZFwiOiBraW5kLFxuICAgICAgICAgICAgICAgIFtgbXhfQ2hlY2tib3hfa2luZF8ke2tpbmR9YF06IGtpbmQsXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtuZXdDbGFzc05hbWV9PlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIHRoZSByZWYgLSB1c2VkIGZvciBrZXlib2FyZCBzaG9ydGN1dCBhY2Nlc3MgdG8gc29tZSBidXR0b25zXG4gICAgICAgICAgICAgICAgcmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgICAgICBpZD17dGhpcy5pZH1cbiAgICAgICAgICAgICAgICB7Li4ub3RoZXJQcm9wc31cbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPXt0aGlzLmlkfT5cbiAgICAgICAgICAgICAgICB7IC8qIFVzaW5nIHRoZSBkaXYgdG8gY2VudGVyIHRoZSBpbWFnZSAqLyB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DaGVja2JveF9iYWNrZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2hlY2tib3hfY2hlY2ttYXJrXCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7ICEhdGhpcy5wcm9wcy5jaGlsZHJlbiAmJlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zcGFuPjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7O0lBRVlBLGE7OztXQUFBQSxhO0VBQUFBLGE7RUFBQUEsYTtHQUFBQSxhLDZCQUFBQSxhOztBQWNHLE1BQU1DLGNBQU4sU0FBNkJDLGNBQUEsQ0FBTUMsYUFBbkMsQ0FBaUU7RUFPNUVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOLEVBRHVCLENBRXZCOztJQUZ1QjtJQUd2QixLQUFLQyxFQUFMLEdBQVUsS0FBS0QsS0FBTCxDQUFXQyxFQUFYLElBQWlCLGNBQWMsSUFBQUMsMEJBQUEsRUFBYSxFQUFiLENBQXpDO0VBQ0g7O0VBRU1DLE1BQU0sR0FBRztJQUNaO0lBQ0Esb0JBQXFGLEtBQUtILEtBQTFGO0lBQUEsTUFBTTtNQUFFSSxRQUFGO01BQVlDLFNBQVo7TUFBdUJDLElBQUksR0FBR1gsYUFBYSxDQUFDWSxLQUE1QztNQUFtREM7SUFBbkQsQ0FBTjtJQUFBLE1BQXNFQyxVQUF0RTtJQUVBLE1BQU1DLFlBQVksR0FBRyxJQUFBQyxtQkFBQSxFQUNqQixhQURpQixFQUVqQk4sU0FGaUIsRUFHakI7TUFDSSx1QkFBdUJDLElBRDNCO01BRUksQ0FBRSxvQkFBbUJBLElBQUssRUFBMUIsR0FBOEJBO0lBRmxDLENBSGlCLENBQXJCO0lBUUEsb0JBQU87TUFBTSxTQUFTLEVBQUVJO0lBQWpCLGdCQUNIO01BQ0k7TUFDQSxHQUFHLEVBQUVGLFFBRlQ7TUFHSSxFQUFFLEVBQUUsS0FBS1A7SUFIYixHQUlRUSxVQUpSO01BS0ksSUFBSSxFQUFDO0lBTFQsR0FERyxlQVFIO01BQU8sT0FBTyxFQUFFLEtBQUtSO0lBQXJCLGdCQUVJO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQ0k7TUFBSyxTQUFTLEVBQUM7SUFBZixFQURKLENBRkosRUFLTSxDQUFDLENBQUMsS0FBS0QsS0FBTCxDQUFXSSxRQUFiLGlCQUNFLDBDQUNNLEtBQUtKLEtBQUwsQ0FBV0ksUUFEakIsQ0FOUixDQVJHLENBQVA7RUFvQkg7O0FBN0MyRTs7OzhCQUEzRFIsYyxrQkFHcUI7RUFDbENTLFNBQVMsRUFBRTtBQUR1QixDIn0=