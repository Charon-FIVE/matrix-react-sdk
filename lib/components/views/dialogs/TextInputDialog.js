"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
class TextInputDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "field", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onOk", async ev => {
      ev.preventDefault();

      if (this.props.validator) {
        this.setState({
          busy: true
        });
        await this.field.current.validate({
          allowEmpty: false
        });

        if (!this.field.current.state.valid) {
          this.field.current.focus();
          this.field.current.validate({
            allowEmpty: false,
            focused: true
          });
          this.setState({
            busy: false
          });
          return;
        }
      }

      this.props.onFinished(true, this.state.value);
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onChange", ev => {
      this.setState({
        value: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onValidate", async fieldState => {
      const result = await this.props.validator(fieldState);
      this.setState({
        valid: result.valid
      });
      return result;
    });
    this.state = {
      value: this.props.value,
      busy: false,
      valid: false
    };
  }

  componentDidMount() {
    if (this.props.focus) {
      // Set the cursor at the end of the text input
      // this._field.current.value = this.props.value;
      this.field.current.focus();
    }
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_TextInputDialog",
      onFinished: this.props.onFinished,
      title: this.props.title,
      fixedWidth: this.props.fixedWidth
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onOk
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_TextInputDialog_label"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "textinput"
    }, " ", this.props.description, " ")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Field.default, {
      className: "mx_TextInputDialog_input",
      ref: this.field,
      type: "text",
      label: this.props.placeholder,
      value: this.state.value,
      onChange: this.onChange,
      onValidate: this.props.validator ? this.onValidate : undefined
    })))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: this.state.busy ? (0, _languageHandler._t)(this.props.busyMessage) : this.props.button,
      disabled: this.state.busy,
      onPrimaryButtonClick: this.onOk,
      onCancel: this.onCancel,
      hasCancel: this.props.hasCancel
    }));
  }

}

exports.default = TextInputDialog;
(0, _defineProperty2.default)(TextInputDialog, "defaultProps", {
  title: "",
  value: "",
  description: "",
  busyMessage: (0, _languageHandler._td)("Loading..."),
  focus: true,
  hasCancel: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0SW5wdXREaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJldiIsInByZXZlbnREZWZhdWx0IiwidmFsaWRhdG9yIiwic2V0U3RhdGUiLCJidXN5IiwiZmllbGQiLCJjdXJyZW50IiwidmFsaWRhdGUiLCJhbGxvd0VtcHR5Iiwic3RhdGUiLCJ2YWxpZCIsImZvY3VzIiwiZm9jdXNlZCIsIm9uRmluaXNoZWQiLCJ2YWx1ZSIsInRhcmdldCIsImZpZWxkU3RhdGUiLCJyZXN1bHQiLCJjb21wb25lbnREaWRNb3VudCIsInJlbmRlciIsInRpdGxlIiwiZml4ZWRXaWR0aCIsIm9uT2siLCJkZXNjcmlwdGlvbiIsInBsYWNlaG9sZGVyIiwib25DaGFuZ2UiLCJvblZhbGlkYXRlIiwidW5kZWZpbmVkIiwiX3QiLCJidXN5TWVzc2FnZSIsImJ1dHRvbiIsIm9uQ2FuY2VsIiwiaGFzQ2FuY2VsIiwiX3RkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9UZXh0SW5wdXREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDaGFuZ2VFdmVudCwgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IElGaWVsZFN0YXRlLCBJVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gXCIuLi9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIHRpdGxlPzogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uPzogUmVhY3QuUmVhY3ROb2RlO1xuICAgIHZhbHVlPzogc3RyaW5nO1xuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xuICAgIGJ1dHRvbj86IHN0cmluZztcbiAgICBidXN5TWVzc2FnZT86IHN0cmluZzsgLy8gcGFzcyBfdGQgc3RyaW5nXG4gICAgZm9jdXM/OiBib29sZWFuO1xuICAgIGhhc0NhbmNlbD86IGJvb2xlYW47XG4gICAgdmFsaWRhdG9yPzogKGZpZWxkU3RhdGU6IElGaWVsZFN0YXRlKSA9PiBJVmFsaWRhdGlvblJlc3VsdDsgLy8gcmVzdWx0IG9mIHdpdGhWYWxpZGF0aW9uXG4gICAgZml4ZWRXaWR0aD86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICB2YWxpZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dElucHV0RGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBmaWVsZCA9IGNyZWF0ZVJlZjxGaWVsZD4oKTtcblxuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgdmFsdWU6IFwiXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxuICAgICAgICBidXN5TWVzc2FnZTogX3RkKFwiTG9hZGluZy4uLlwiKSxcbiAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgIGhhc0NhbmNlbDogdHJ1ZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLFxuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5mb2N1cykge1xuICAgICAgICAgICAgLy8gU2V0IHRoZSBjdXJzb3IgYXQgdGhlIGVuZCBvZiB0aGUgdGV4dCBpbnB1dFxuICAgICAgICAgICAgLy8gdGhpcy5fZmllbGQuY3VycmVudC52YWx1ZSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgICAgICB0aGlzLmZpZWxkLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25PayA9IGFzeW5jIChldjogUmVhY3QuRm9ybUV2ZW50KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnZhbGlkYXRvcikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJ1c3k6IHRydWUgfSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmZpZWxkLmN1cnJlbnQuc3RhdGUudmFsaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgYnVzeTogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlLCB0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZSA9IChldjogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2YWx1ZTogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblZhbGlkYXRlID0gYXN5bmMgKGZpZWxkU3RhdGU6IElGaWVsZFN0YXRlKTogUHJvbWlzZTxJVmFsaWRhdGlvblJlc3VsdD4gPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnByb3BzLnZhbGlkYXRvcihmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2YWxpZDogcmVzdWx0LnZhbGlkLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1RleHRJbnB1dERpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLnRpdGxlfVxuICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg9e3RoaXMucHJvcHMuZml4ZWRXaWR0aH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbk9rfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9UZXh0SW5wdXREaWFsb2dfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cInRleHRpbnB1dFwiPiB7IHRoaXMucHJvcHMuZGVzY3JpcHRpb24gfSA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9UZXh0SW5wdXREaWFsb2dfaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5wcm9wcy52YWxpZGF0b3IgPyB0aGlzLm9uVmFsaWRhdGUgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17dGhpcy5zdGF0ZS5idXN5ID8gX3QodGhpcy5wcm9wcy5idXN5TWVzc2FnZSkgOiB0aGlzLnByb3BzLmJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25Pa31cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dGhpcy5wcm9wcy5oYXNDYW5jZWx9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7QUF0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBOEJlLE1BQU1BLGVBQU4sU0FBOEJDLGNBQUEsQ0FBTUMsU0FBcEMsQ0FBOEQ7RUFZekVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOO0lBRHVCLDBEQVhYLElBQUFDLGdCQUFBLEdBV1c7SUFBQSw0Q0FrQlosTUFBT0MsRUFBUCxJQUE4QztNQUN6REEsRUFBRSxDQUFDQyxjQUFIOztNQUNBLElBQUksS0FBS0gsS0FBTCxDQUFXSSxTQUFmLEVBQTBCO1FBQ3RCLEtBQUtDLFFBQUwsQ0FBYztVQUFFQyxJQUFJLEVBQUU7UUFBUixDQUFkO1FBQ0EsTUFBTSxLQUFLQyxLQUFMLENBQVdDLE9BQVgsQ0FBbUJDLFFBQW5CLENBQTRCO1VBQUVDLFVBQVUsRUFBRTtRQUFkLENBQTVCLENBQU47O1FBRUEsSUFBSSxDQUFDLEtBQUtILEtBQUwsQ0FBV0MsT0FBWCxDQUFtQkcsS0FBbkIsQ0FBeUJDLEtBQTlCLEVBQXFDO1VBQ2pDLEtBQUtMLEtBQUwsQ0FBV0MsT0FBWCxDQUFtQkssS0FBbkI7VUFDQSxLQUFLTixLQUFMLENBQVdDLE9BQVgsQ0FBbUJDLFFBQW5CLENBQTRCO1lBQUVDLFVBQVUsRUFBRSxLQUFkO1lBQXFCSSxPQUFPLEVBQUU7VUFBOUIsQ0FBNUI7VUFDQSxLQUFLVCxRQUFMLENBQWM7WUFBRUMsSUFBSSxFQUFFO1VBQVIsQ0FBZDtVQUNBO1FBQ0g7TUFDSjs7TUFDRCxLQUFLTixLQUFMLENBQVdlLFVBQVgsQ0FBc0IsSUFBdEIsRUFBNEIsS0FB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