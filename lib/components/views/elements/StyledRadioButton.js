"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

const _excluded = ["children", "className", "disabled", "outlined", "childrenInLabel", "inputRef"];

class StyledRadioButton extends _react.default.PureComponent {
  render() {
    const _this$props = this.props,
          {
      children,
      className,
      disabled,
      outlined,
      childrenInLabel,
      inputRef
    } = _this$props,
          otherProps = (0, _objectWithoutProperties2.default)(_this$props, _excluded);

    const _className = (0, _classnames.default)('mx_StyledRadioButton', className, {
      "mx_StyledRadioButton_disabled": disabled,
      "mx_StyledRadioButton_enabled": !disabled,
      "mx_StyledRadioButton_checked": this.props.checked,
      "mx_StyledRadioButton_outlined": outlined
    });

    const radioButton = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
      // Pass through the ref - used for keyboard shortcut access to some buttons
      ref: inputRef,
      type: "radio",
      disabled: disabled
    }, otherProps)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null)));

    if (childrenInLabel) {
      return /*#__PURE__*/_react.default.createElement("label", {
        className: _className
      }, radioButton, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_StyledRadioButton_content"
      }, children), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_StyledRadioButton_spacer"
      }));
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: _className
      }, /*#__PURE__*/_react.default.createElement("label", {
        className: "mx_StyledRadioButton_innerLabel"
      }, radioButton), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_StyledRadioButton_content"
      }, children), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_StyledRadioButton_spacer"
      }));
    }
  }

}

exports.default = StyledRadioButton;
(0, _defineProperty2.default)(StyledRadioButton, "defaultProps", {
  className: '',
  childrenInLabel: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHlsZWRSYWRpb0J1dHRvbiIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsInJlbmRlciIsInByb3BzIiwiY2hpbGRyZW4iLCJjbGFzc05hbWUiLCJkaXNhYmxlZCIsIm91dGxpbmVkIiwiY2hpbGRyZW5JbkxhYmVsIiwiaW5wdXRSZWYiLCJvdGhlclByb3BzIiwiX2NsYXNzTmFtZSIsImNsYXNzbmFtZXMiLCJjaGVja2VkIiwicmFkaW9CdXR0b24iXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9TdHlsZWRSYWRpb0J1dHRvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgUmVhY3QuSW5wdXRIVE1MQXR0cmlidXRlczxIVE1MSW5wdXRFbGVtZW50PiB7XG4gICAgaW5wdXRSZWY/OiBSZWFjdC5SZWZPYmplY3Q8SFRNTElucHV0RWxlbWVudD47XG4gICAgb3V0bGluZWQ/OiBib29sZWFuO1xuICAgIC8vIElmIHRydWUgKGRlZmF1bHQpLCB0aGUgY2hpbGRyZW4gd2lsbCBiZSBjb250YWluZWQgd2l0aGluIGEgPGxhYmVsPiBlbGVtZW50XG4gICAgLy8gSWYgZmFsc2UsIHRoZXknbGwgYmUgaW4gYSBkaXYuIFB1dHRpbmcgaW50ZXJhY3RpdmUgY29tcG9uZW50cyB0aGF0IGhhdmUgbGFiZWxzXG4gICAgLy8gdGhlbXNlbHZlcyBpbiBsYWJlbHMgY2FuIGNhdXNlIHN0cmFuZ2UgYnVncyBsaWtlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE4MDMxXG4gICAgY2hpbGRyZW5JbkxhYmVsPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0eWxlZFJhZGlvQnV0dG9uIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBjbGFzc05hbWU6ICcnLFxuICAgICAgICBjaGlsZHJlbkluTGFiZWw6IHRydWUsXG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgY2hpbGRyZW4sIGNsYXNzTmFtZSwgZGlzYWJsZWQsIG91dGxpbmVkLCBjaGlsZHJlbkluTGFiZWwsIGlucHV0UmVmLCAuLi5vdGhlclByb3BzIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBfY2xhc3NOYW1lID0gY2xhc3NuYW1lcyhcbiAgICAgICAgICAgICdteF9TdHlsZWRSYWRpb0J1dHRvbicsXG4gICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJteF9TdHlsZWRSYWRpb0J1dHRvbl9kaXNhYmxlZFwiOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBcIm14X1N0eWxlZFJhZGlvQnV0dG9uX2VuYWJsZWRcIjogIWRpc2FibGVkLFxuICAgICAgICAgICAgICAgIFwibXhfU3R5bGVkUmFkaW9CdXR0b25fY2hlY2tlZFwiOiB0aGlzLnByb3BzLmNoZWNrZWQsXG4gICAgICAgICAgICAgICAgXCJteF9TdHlsZWRSYWRpb0J1dHRvbl9vdXRsaW5lZFwiOiBvdXRsaW5lZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJhZGlvQnV0dG9uID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIHRoZSByZWYgLSB1c2VkIGZvciBrZXlib2FyZCBzaG9ydGN1dCBhY2Nlc3MgdG8gc29tZSBidXR0b25zXG4gICAgICAgICAgICAgICAgcmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgICAgICB0eXBlPSdyYWRpbydcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgey4uLm90aGVyUHJvcHN9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgeyAvKiBVc2VkIHRvIHJlbmRlciB0aGUgcmFkaW8gYnV0dG9uIGNpcmNsZSAqLyB9XG4gICAgICAgICAgICA8ZGl2PjxkaXYgLz48L2Rpdj5cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG5cbiAgICAgICAgaWYgKGNoaWxkcmVuSW5MYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIDxsYWJlbCBjbGFzc05hbWU9e19jbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgIHsgcmFkaW9CdXR0b24gfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3R5bGVkUmFkaW9CdXR0b25fY29udGVudFwiPnsgY2hpbGRyZW4gfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3R5bGVkUmFkaW9CdXR0b25fc3BhY2VyXCIgLz5cbiAgICAgICAgICAgIDwvbGFiZWw+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtfY2xhc3NOYW1lfT5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibXhfU3R5bGVkUmFkaW9CdXR0b25faW5uZXJMYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHJhZGlvQnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3R5bGVkUmFkaW9CdXR0b25fY29udGVudFwiPnsgY2hpbGRyZW4gfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3R5bGVkUmFkaW9CdXR0b25fc3BhY2VyXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOzs7O0FBY2UsTUFBTUEsaUJBQU4sU0FBZ0NDLGNBQUEsQ0FBTUMsYUFBdEMsQ0FBb0U7RUFNeEVDLE1BQU0sR0FBRztJQUNaLG9CQUE4RixLQUFLQyxLQUFuRztJQUFBLE1BQU07TUFBRUMsUUFBRjtNQUFZQyxTQUFaO01BQXVCQyxRQUF2QjtNQUFpQ0MsUUFBakM7TUFBMkNDLGVBQTNDO01BQTREQztJQUE1RCxDQUFOO0lBQUEsTUFBK0VDLFVBQS9FOztJQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFBQyxtQkFBQSxFQUNmLHNCQURlLEVBRWZQLFNBRmUsRUFHZjtNQUNJLGlDQUFpQ0MsUUFEckM7TUFFSSxnQ0FBZ0MsQ0FBQ0EsUUFGckM7TUFHSSxnQ0FBZ0MsS0FBS0gsS0FBTCxDQUFXVSxPQUgvQztNQUlJLGlDQUFpQ047SUFKckMsQ0FIZSxDQUFuQjs7SUFVQSxNQUFNTyxXQUFXLGdCQUFHLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLHFCQUNoQjtNQUNJO01BQ0EsR0FBRyxFQUFFTCxRQUZUO01BR0ksSUFBSSxFQUFDLE9BSFQ7TUFJSSxRQUFRLEVBQUVIO0lBSmQsR0FLUUksVUFMUixFQURnQixlQVNoQix1REFBSyx5Q0FBTCxDQVRnQixDQUFwQjs7SUFZQSxJQUFJRixlQUFKLEVBQXFCO01BQ2pCLG9CQUFPO1FBQU8sU0FBUyxFQUFFRztNQUFsQixHQUNERyxXQURDLGVBRUg7UUFBSyxTQUFTLEVBQUM7TUFBZixHQUFnRFYsUUFBaEQsQ0FGRyxlQUdIO1FBQUssU0FBUyxFQUFDO01BQWYsRUFIRyxDQUFQO0lBS0gsQ0FORCxNQU1PO01BQ0gsb0JBQU87UUFBSyxTQUFTLEVBQUVPO01BQWhCLGdCQUNIO1FBQU8sU0FBUyxFQUFDO01BQWpCLEdBQ01HLFdBRE4sQ0FERyxlQUlIO1FBQUssU0FBUyxFQUFDO01BQWYsR0FBZ0RWLFFBQWhELENBSkcsZUFLSDtRQUFLLFNBQVMsRUFBQztNQUFmLEVBTEcsQ0FBUDtJQU9IO0VBQ0o7O0FBN0M4RTs7OzhCQUE5REwsaUIsa0JBQ3FCO0VBQ2xDTSxTQUFTLEVBQUUsRUFEdUI7RUFFbENHLGVBQWUsRUFBRTtBQUZpQixDIn0=