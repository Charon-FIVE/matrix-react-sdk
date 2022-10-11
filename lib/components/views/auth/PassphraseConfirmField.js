"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _languageHandler = require("../../../languageHandler");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
class PassphraseConfirmField extends _react.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "validate", (0, _Validation.default)({
      rules: [{
        key: "required",
        test: _ref => {
          let {
            value,
            allowEmpty
          } = _ref;
          return allowEmpty || !!value;
        },
        invalid: () => (0, _languageHandler._t)(this.props.labelRequired)
      }, {
        key: "match",
        test: _ref2 => {
          let {
            value
          } = _ref2;
          return !value || value === this.props.password;
        },
        invalid: () => (0, _languageHandler._t)(this.props.labelInvalid)
      }]
    }));
    (0, _defineProperty2.default)(this, "onValidate", async fieldState => {
      const result = await this.validate(fieldState);

      if (this.props.onValidate) {
        this.props.onValidate(result);
      }

      return result;
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: this.props.id,
      ref: this.props.fieldRef,
      type: "password",
      label: (0, _languageHandler._t)(this.props.label),
      autoComplete: this.props.autoComplete,
      value: this.props.value,
      onChange: this.props.onChange,
      onValidate: this.onValidate
    });
  }

}

(0, _defineProperty2.default)(PassphraseConfirmField, "defaultProps", {
  label: (0, _languageHandler._td)("Confirm password"),
  labelRequired: (0, _languageHandler._td)("Confirm password"),
  labelInvalid: (0, _languageHandler._td)("Passwords don't match")
});
var _default = PassphraseConfirmField;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXNzcGhyYXNlQ29uZmlybUZpZWxkIiwiUHVyZUNvbXBvbmVudCIsIndpdGhWYWxpZGF0aW9uIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwidmFsdWUiLCJhbGxvd0VtcHR5IiwiaW52YWxpZCIsIl90IiwicHJvcHMiLCJsYWJlbFJlcXVpcmVkIiwicGFzc3dvcmQiLCJsYWJlbEludmFsaWQiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGUiLCJvblZhbGlkYXRlIiwicmVuZGVyIiwiaWQiLCJmaWVsZFJlZiIsImxhYmVsIiwiYXV0b0NvbXBsZXRlIiwib25DaGFuZ2UiLCJfdGQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9hdXRoL1Bhc3NwaHJhc2VDb25maXJtRmllbGQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBQdXJlQ29tcG9uZW50LCBSZWZDYWxsYmFjaywgUmVmT2JqZWN0IH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBGaWVsZCwgeyBJSW5wdXRQcm9wcyB9IGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uLCB7IElGaWVsZFN0YXRlLCBJVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gXCIuLi9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgT21pdDxJSW5wdXRQcm9wcywgXCJvblZhbGlkYXRlXCI+IHtcbiAgICBpZD86IHN0cmluZztcbiAgICBmaWVsZFJlZj86IFJlZkNhbGxiYWNrPEZpZWxkPiB8IFJlZk9iamVjdDxGaWVsZD47XG4gICAgYXV0b0NvbXBsZXRlPzogc3RyaW5nO1xuICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgcGFzc3dvcmQ6IHN0cmluZzsgLy8gVGhlIHBhc3N3b3JkIHdlJ3JlIGNvbmZpcm1pbmdcblxuICAgIGxhYmVsUmVxdWlyZWQ/OiBzdHJpbmc7XG4gICAgbGFiZWxJbnZhbGlkPzogc3RyaW5nO1xuXG4gICAgb25DaGFuZ2UoZXY6IFJlYWN0LkZvcm1FdmVudDxIVE1MRWxlbWVudD4pO1xuICAgIG9uVmFsaWRhdGU/KHJlc3VsdDogSVZhbGlkYXRpb25SZXN1bHQpO1xufVxuXG5jbGFzcyBQYXNzcGhyYXNlQ29uZmlybUZpZWxkIGV4dGVuZHMgUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBsYWJlbDogX3RkKFwiQ29uZmlybSBwYXNzd29yZFwiKSxcbiAgICAgICAgbGFiZWxSZXF1aXJlZDogX3RkKFwiQ29uZmlybSBwYXNzd29yZFwiKSxcbiAgICAgICAgbGFiZWxJbnZhbGlkOiBfdGQoXCJQYXNzd29yZHMgZG9uJ3QgbWF0Y2hcIiksXG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGUgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUsIGFsbG93RW1wdHkgfSkgPT4gYWxsb3dFbXB0eSB8fCAhIXZhbHVlLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KHRoaXMucHJvcHMubGFiZWxSZXF1aXJlZCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJtYXRjaFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlIH0pID0+ICF2YWx1ZSB8fCB2YWx1ZSA9PT0gdGhpcy5wcm9wcy5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdCh0aGlzLnByb3BzLmxhYmVsSW52YWxpZCksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSBvblZhbGlkYXRlID0gYXN5bmMgKGZpZWxkU3RhdGU6IElGaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGUoZmllbGRTdGF0ZSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uVmFsaWRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZGF0ZShyZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICBpZD17dGhpcy5wcm9wcy5pZH1cbiAgICAgICAgICAgIHJlZj17dGhpcy5wcm9wcy5maWVsZFJlZn1cbiAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICBsYWJlbD17X3QodGhpcy5wcm9wcy5sYWJlbCl9XG4gICAgICAgICAgICBhdXRvQ29tcGxldGU9e3RoaXMucHJvcHMuYXV0b0NvbXBsZXRlfVxuICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMudmFsdWV9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5wcm9wcy5vbkNoYW5nZX1cbiAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25WYWxpZGF0ZX1cbiAgICAgICAgLz47XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYXNzcGhyYXNlQ29uZmlybUZpZWxkO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNCQSxNQUFNQSxzQkFBTixTQUFxQ0Msb0JBQXJDLENBQTJEO0VBQUE7SUFBQTtJQUFBLGdEQU9wQyxJQUFBQyxtQkFBQSxFQUFlO01BQzlCQyxLQUFLLEVBQUUsQ0FDSDtRQUNJQyxHQUFHLEVBQUUsVUFEVDtRQUVJQyxJQUFJLEVBQUU7VUFBQSxJQUFDO1lBQUVDLEtBQUY7WUFBU0M7VUFBVCxDQUFEO1VBQUEsT0FBMkJBLFVBQVUsSUFBSSxDQUFDLENBQUNELEtBQTNDO1FBQUEsQ0FGVjtRQUdJRSxPQUFPLEVBQUUsTUFBTSxJQUFBQyxtQkFBQSxFQUFHLEtBQUtDLEtBQUwsQ0FBV0MsYUFBZDtNQUhuQixDQURHLEVBTUg7UUFDSVAsR0FBRyxFQUFFLE9BRFQ7UUFFSUMsSUFBSSxFQUFFO1VBQUEsSUFBQztZQUFFQztVQUFGLENBQUQ7VUFBQSxPQUFlLENBQUNBLEtBQUQsSUFBVUEsS0FBSyxLQUFLLEtBQUtJLEtBQUwsQ0FBV0UsUUFBOUM7UUFBQSxDQUZWO1FBR0lKLE9BQU8sRUFBRSxNQUFNLElBQUFDLG1CQUFBLEVBQUcsS0FBS0MsS0FBTCxDQUFXRyxZQUFkO01BSG5CLENBTkc7SUFEdUIsQ0FBZixDQVBvQztJQUFBLGtEQXNCbEMsTUFBT0MsVUFBUCxJQUFtQztNQUNwRCxNQUFNQyxNQUFNLEdBQUcsTUFBTSxLQUFLQyxRQUFMLENBQWNGLFVBQWQsQ0FBckI7O01BQ0EsSUFBSSxLQUFLSixLQUFMLENBQVdPLFVBQWYsRUFBMkI7UUFDdkIsS0FBS1AsS0FBTCxDQUFXTyxVQUFYLENBQXNCRixNQUF0QjtNQUNIOztNQUVELE9BQU9BLE1BQVA7SUFDSCxDQTdCc0Q7RUFBQTs7RUErQnZERyxNQUFNLEdBQUc7SUFDTCxvQkFBTyw2QkFBQyxjQUFEO01BQ0gsRUFBRSxFQUFFLEtBQUtSLEtBQUwsQ0FBV1MsRUFEWjtNQUVILEdBQUcsRUFBRSxLQUFLVCxLQUFMLENBQVdVLFFBRmI7TUFHSCxJQUFJLEVBQUMsVUFIRjtNQUlILEtBQUssRUFBRSxJQUFBWCxtQkFBQSxFQUFHLEtBQUtDLEtBQUwsQ0FBV1csS0FBZCxDQUpKO01BS0gsWUFBWSxFQUFFLEtBQUtYLEtBQUwsQ0FBV1ksWUFMdEI7TUFNSCxLQUFLLEVBQUUsS0FBS1osS0FBTCxDQUFXSixLQU5mO01BT0gsUUFBUSxFQUFFLEtBQUtJLEtBQUwsQ0FBV2EsUUFQbEI7TUFRSCxVQUFVLEVBQUUsS0FBS047SUFSZCxFQUFQO0VBVUg7O0FBMUNzRDs7OEJBQXJEakIsc0Isa0JBQ29CO0VBQ2xCcUIsS0FBSyxFQUFFLElBQUFHLG9CQUFBLEVBQUksa0JBQUosQ0FEVztFQUVsQmIsYUFBYSxFQUFFLElBQUFhLG9CQUFBLEVBQUksa0JBQUosQ0FGRztFQUdsQlgsWUFBWSxFQUFFLElBQUFXLG9CQUFBLEVBQUksdUJBQUo7QUFISSxDO2VBNENYeEIsc0IifQ==