"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

/*
Copyright 2015, 2016 OpenMarket Ltd

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

/*
 * Usage:
 * Modal.createDialog(ErrorDialog, {
 *   title: "some text", (default: "Error")
 *   description: "some more text",
 *   button: "Button Text",
 *   onFinished: someFunction,
 *   focus: true|false (default: true)
 * });
 */
class ErrorDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onClick", () => {
      this.props.onFinished(true);
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_ErrorDialog",
      onFinished: this.props.onFinished,
      title: this.props.title || (0, _languageHandler._t)('Error'),
      headerImage: this.props.headerImage,
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content",
      id: "mx_Dialog_content"
    }, this.props.description || (0, _languageHandler._t)('An error has occurred.')), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "mx_Dialog_primary",
      onClick: this.onClick,
      autoFocus: this.props.focus
    }, this.props.button || (0, _languageHandler._t)('OK'))));
  }

}

exports.default = ErrorDialog;
(0, _defineProperty2.default)(ErrorDialog, "defaultProps", {
  focus: true,
  title: null,
  description: null,
  button: null
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFcnJvckRpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwicHJvcHMiLCJvbkZpbmlzaGVkIiwicmVuZGVyIiwidGl0bGUiLCJfdCIsImhlYWRlckltYWdlIiwiZGVzY3JpcHRpb24iLCJvbkNsaWNrIiwiZm9jdXMiLCJidXR0b24iXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKlxuICogVXNhZ2U6XG4gKiBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAqICAgdGl0bGU6IFwic29tZSB0ZXh0XCIsIChkZWZhdWx0OiBcIkVycm9yXCIpXG4gKiAgIGRlc2NyaXB0aW9uOiBcInNvbWUgbW9yZSB0ZXh0XCIsXG4gKiAgIGJ1dHRvbjogXCJCdXR0b24gVGV4dFwiLFxuICogICBvbkZpbmlzaGVkOiBzb21lRnVuY3Rpb24sXG4gKiAgIGZvY3VzOiB0cnVlfGZhbHNlIChkZWZhdWx0OiB0cnVlKVxuICogfSk7XG4gKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvbkZpbmlzaGVkOiAoc3VjY2VzczogYm9vbGVhbikgPT4gdm9pZDtcbiAgICB0aXRsZT86IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbj86IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICBidXR0b24/OiBzdHJpbmc7XG4gICAgZm9jdXM/OiBib29sZWFuO1xuICAgIGhlYWRlckltYWdlPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBvbkZpbmlzaGVkOiAoc3VjY2VzczogYm9vbGVhbikgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwdWJsaWMgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIHRpdGxlOiBudWxsLFxuICAgICAgICBkZXNjcmlwdGlvbjogbnVsbCxcbiAgICAgICAgYnV0dG9uOiBudWxsLFxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXJyb3JEaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZSB8fCBfdCgnRXJyb3InKX1cbiAgICAgICAgICAgICAgICBoZWFkZXJJbWFnZT17dGhpcy5wcm9wcy5oZWFkZXJJbWFnZX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIiBpZD0nbXhfRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZGVzY3JpcHRpb24gfHwgX3QoJ0FuIGVycm9yIGhhcyBvY2N1cnJlZC4nKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCIgb25DbGljaz17dGhpcy5vbkNsaWNrfSBhdXRvRm9jdXM9e3RoaXMucHJvcHMuZm9jdXN9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmJ1dHRvbiB8fCBfdCgnT0snKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUEyQkE7O0FBRUE7O0FBQ0E7O0FBOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW9CZSxNQUFNQSxXQUFOLFNBQTBCQyxjQUFBLENBQU1DLFNBQWhDLENBQTBEO0VBQUE7SUFBQTtJQUFBLCtDQVFuRCxNQUFNO01BQ3BCLEtBQUtDLEtBQUwsQ0FBV0MsVUFBWCxDQUFzQixJQUF0QjtJQUNILENBVm9FO0VBQUE7O0VBWTlEQyxNQUFNLEdBQUc7SUFDWixvQkFDSSw2QkFBQyxtQkFBRDtNQUNJLFNBQVMsRUFBQyxnQkFEZDtNQUVJLFVBQVUsRUFBRSxLQUFLRixLQUFMLENBQVdDLFVBRjNCO01BR0ksS0FBSyxFQUFFLEtBQUtELEtBQUwsQ0FBV0csS0FBWCxJQUFvQixJQUFBQyxtQkFBQSxFQUFHLE9BQUgsQ0FIL0I7TUFJSSxXQUFXLEVBQUUsS0FBS0osS0FBTCxDQUFXSyxXQUo1QjtNQUtJLFNBQVMsRUFBQztJQUxkLGdCQU9JO01BQUssU0FBUyxFQUFDLG1CQUFmO01BQW1DLEVBQUUsRUFBQztJQUF0QyxHQUNNLEtBQUtMLEtBQUwsQ0FBV00sV0FBWCxJQUEwQixJQUFBRixtQkFBQSxFQUFHLHdCQUFILENBRGhDLENBUEosZUFVSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJO01BQVEsU0FBUyxFQUFDLG1CQUFsQjtNQUFzQyxPQUFPLEVBQUUsS0FBS0csT0FBcEQ7TUFBNkQsU0FBUyxFQUFFLEtBQUtQLEtBQUwsQ0FBV1E7SUFBbkYsR0FDTSxLQUFLUixLQUFMLENBQVdTLE1BQVgsSUFBcUIsSUFBQUwsbUJBQUEsRUFBRyxJQUFILENBRDNCLENBREosQ0FWSixDQURKO0VBa0JIOztBQS9Cb0U7Ozs4QkFBcERQLFcsa0JBQ1k7RUFDekJXLEtBQUssRUFBRSxJQURrQjtFQUV6QkwsS0FBSyxFQUFFLElBRmtCO0VBR3pCRyxXQUFXLEVBQUUsSUFIWTtFQUl6QkcsTUFBTSxFQUFFO0FBSmlCLEMifQ==