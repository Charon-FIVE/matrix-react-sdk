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

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var Email = _interopRequireWildcard(require("../../../email"));

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
class EmailField extends _react.PureComponent {
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
        key: "email",
        test: _ref2 => {
          let {
            value
          } = _ref2;
          return !value || Email.looksValid(value);
        },
        invalid: () => (0, _languageHandler._t)(this.props.labelInvalid)
      }]
    }));
    (0, _defineProperty2.default)(this, "onValidate", async fieldState => {
      let validate = this.validate;

      if (this.props.validationRules) {
        validate = this.props.validationRules;
      }

      const result = await validate(fieldState);

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
      type: "text",
      label: (0, _languageHandler._t)(this.props.label),
      value: this.props.value,
      autoFocus: this.props.autoFocus,
      onChange: this.props.onChange,
      onValidate: this.onValidate
    });
  }

}

(0, _defineProperty2.default)(EmailField, "defaultProps", {
  label: (0, _languageHandler._td)("Email"),
  labelRequired: (0, _languageHandler._td)("Enter email address"),
  labelInvalid: (0, _languageHandler._td)("Doesn't look like a valid email address")
});
var _default = EmailField;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWFpbEZpZWxkIiwiUHVyZUNvbXBvbmVudCIsIndpdGhWYWxpZGF0aW9uIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwidmFsdWUiLCJhbGxvd0VtcHR5IiwiaW52YWxpZCIsIl90IiwicHJvcHMiLCJsYWJlbFJlcXVpcmVkIiwiRW1haWwiLCJsb29rc1ZhbGlkIiwibGFiZWxJbnZhbGlkIiwiZmllbGRTdGF0ZSIsInZhbGlkYXRlIiwidmFsaWRhdGlvblJ1bGVzIiwicmVzdWx0Iiwib25WYWxpZGF0ZSIsInJlbmRlciIsImlkIiwiZmllbGRSZWYiLCJsYWJlbCIsImF1dG9Gb2N1cyIsIm9uQ2hhbmdlIiwiX3RkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvYXV0aC9FbWFpbEZpZWxkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgUHVyZUNvbXBvbmVudCwgUmVmQ2FsbGJhY2ssIFJlZk9iamVjdCB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgRmllbGQsIHsgSUlucHV0UHJvcHMgfSBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgd2l0aFZhbGlkYXRpb24sIHsgSUZpZWxkU3RhdGUsIElWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSBcIi4uL2VsZW1lbnRzL1ZhbGlkYXRpb25cIjtcbmltcG9ydCAqIGFzIEVtYWlsIGZyb20gXCIuLi8uLi8uLi9lbWFpbFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgT21pdDxJSW5wdXRQcm9wcywgXCJvblZhbGlkYXRlXCI+IHtcbiAgICBpZD86IHN0cmluZztcbiAgICBmaWVsZFJlZj86IFJlZkNhbGxiYWNrPEZpZWxkPiB8IFJlZk9iamVjdDxGaWVsZD47XG4gICAgdmFsdWU6IHN0cmluZztcbiAgICBhdXRvRm9jdXM/OiBib29sZWFuO1xuXG4gICAgbGFiZWw/OiBzdHJpbmc7XG4gICAgbGFiZWxSZXF1aXJlZD86IHN0cmluZztcbiAgICBsYWJlbEludmFsaWQ/OiBzdHJpbmc7XG5cbiAgICAvLyBXaGVuIHByZXNlbnQsIGNvbXBsZXRlbHkgb3ZlcnJpZGVzIHRoZSBkZWZhdWx0IHZhbGlkYXRpb24gcnVsZXMuXG4gICAgdmFsaWRhdGlvblJ1bGVzPzogKGZpZWxkU3RhdGU6IElGaWVsZFN0YXRlKSA9PiBQcm9taXNlPElWYWxpZGF0aW9uUmVzdWx0PjtcblxuICAgIG9uQ2hhbmdlKGV2OiBSZWFjdC5Gb3JtRXZlbnQ8SFRNTEVsZW1lbnQ+KTogdm9pZDtcbiAgICBvblZhbGlkYXRlPyhyZXN1bHQ6IElWYWxpZGF0aW9uUmVzdWx0KTogdm9pZDtcbn1cblxuY2xhc3MgRW1haWxGaWVsZCBleHRlbmRzIFB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgbGFiZWw6IF90ZChcIkVtYWlsXCIpLFxuICAgICAgICBsYWJlbFJlcXVpcmVkOiBfdGQoXCJFbnRlciBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICBsYWJlbEludmFsaWQ6IF90ZChcIkRvZXNuJ3QgbG9vayBsaWtlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiKSxcbiAgICB9O1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHZhbGlkYXRlID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdCh0aGlzLnByb3BzLmxhYmVsUmVxdWlyZWQpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwiZW1haWxcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSB9KSA9PiAhdmFsdWUgfHwgRW1haWwubG9va3NWYWxpZCh2YWx1ZSksXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QodGhpcy5wcm9wcy5sYWJlbEludmFsaWQpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIG9uVmFsaWRhdGUgPSBhc3luYyAoZmllbGRTdGF0ZTogSUZpZWxkU3RhdGUpID0+IHtcbiAgICAgICAgbGV0IHZhbGlkYXRlID0gdGhpcy52YWxpZGF0ZTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMudmFsaWRhdGlvblJ1bGVzKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZSA9IHRoaXMucHJvcHMudmFsaWRhdGlvblJ1bGVzO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdmFsaWRhdGUoZmllbGRTdGF0ZSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uVmFsaWRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZGF0ZShyZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICBpZD17dGhpcy5wcm9wcy5pZH1cbiAgICAgICAgICAgIHJlZj17dGhpcy5wcm9wcy5maWVsZFJlZn1cbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIGxhYmVsPXtfdCh0aGlzLnByb3BzLmxhYmVsKX1cbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnZhbHVlfVxuICAgICAgICAgICAgYXV0b0ZvY3VzPXt0aGlzLnByb3BzLmF1dG9Gb2N1c31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblZhbGlkYXRlfVxuICAgICAgICAvPjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEVtYWlsRmllbGQ7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBMEJBLE1BQU1BLFVBQU4sU0FBeUJDLG9CQUF6QixDQUErQztFQUFBO0lBQUE7SUFBQSxnREFPaEIsSUFBQUMsbUJBQUEsRUFBZTtNQUN0Q0MsS0FBSyxFQUFFLENBQ0g7UUFDSUMsR0FBRyxFQUFFLFVBRFQ7UUFFSUMsSUFBSSxFQUFFO1VBQUEsSUFBQztZQUFFQyxLQUFGO1lBQVNDO1VBQVQsQ0FBRDtVQUFBLE9BQTJCQSxVQUFVLElBQUksQ0FBQyxDQUFDRCxLQUEzQztRQUFBLENBRlY7UUFHSUUsT0FBTyxFQUFFLE1BQU0sSUFBQUMsbUJBQUEsRUFBRyxLQUFLQyxLQUFMLENBQVdDLGFBQWQ7TUFIbkIsQ0FERyxFQU1IO1FBQ0lQLEdBQUcsRUFBRSxPQURUO1FBRUlDLElBQUksRUFBRTtVQUFBLElBQUM7WUFBRUM7VUFBRixDQUFEO1VBQUEsT0FBZSxDQUFDQSxLQUFELElBQVVNLEtBQUssQ0FBQ0MsVUFBTixDQUFpQlAsS0FBakIsQ0FBekI7UUFBQSxDQUZWO1FBR0lFLE9BQU8sRUFBRSxNQUFNLElBQUFDLG1CQUFBLEVBQUcsS0FBS0MsS0FBTCxDQUFXSSxZQUFkO01BSG5CLENBTkc7SUFEK0IsQ0FBZixDQVBnQjtJQUFBLGtEQXNCOUIsTUFBT0MsVUFBUCxJQUFtQztNQUM1QyxJQUFJQyxRQUFRLEdBQUcsS0FBS0EsUUFBcEI7O01BQ0EsSUFBSSxLQUFLTixLQUFMLENBQVdPLGVBQWYsRUFBZ0M7UUFDNUJELFFBQVEsR0FBRyxLQUFLTixLQUFMLENBQVdPLGVBQXRCO01BQ0g7O01BRUQsTUFBTUMsTUFBTSxHQUFHLE1BQU1GLFFBQVEsQ0FBQ0QsVUFBRCxDQUE3Qjs7TUFDQSxJQUFJLEtBQUtMLEtBQUwsQ0FBV1MsVUFBZixFQUEyQjtRQUN2QixLQUFLVCxLQUFMLENBQVdTLFVBQVgsQ0FBc0JELE1BQXRCO01BQ0g7O01BRUQsT0FBT0EsTUFBUDtJQUNILENBbEMwQztFQUFBOztFQW9DM0NFLE1BQU0sR0FBRztJQUNMLG9CQUFPLDZCQUFDLGNBQUQ7TUFDSCxFQUFFLEVBQUUsS0FBS1YsS0FBTCxDQUFXVyxFQURaO01BRUgsR0FBRyxFQUFFLEtBQUtYLEtBQUwsQ0FBV1ksUUFGYjtNQUdILElBQUksRUFBQyxNQUhGO01BSUgsS0FBSyxFQUFFLElBQUFiLG1CQUFBLEVBQUcsS0FBS0MsS0FBTCxDQUFXYSxLQUFkLENBSko7TUFLSCxLQUFLLEVBQUUsS0FBS2IsS0FBTCxDQUFXSixLQUxmO01BTUgsU0FBUyxFQUFFLEtBQUtJLEtBQUwsQ0FBV2MsU0FObkI7TUFPSCxRQUFRLEVBQUUsS0FBS2QsS0FBTCxDQUFXZSxRQVBsQjtNQVFILFVBQVUsRUFBRSxLQUFLTjtJQVJkLEVBQVA7RUFVSDs7QUEvQzBDOzs4QkFBekNuQixVLGtCQUNvQjtFQUNsQnVCLEtBQUssRUFBRSxJQUFBRyxvQkFBQSxFQUFJLE9BQUosQ0FEVztFQUVsQmYsYUFBYSxFQUFFLElBQUFlLG9CQUFBLEVBQUkscUJBQUosQ0FGRztFQUdsQlosWUFBWSxFQUFFLElBQUFZLG9CQUFBLEVBQUkseUNBQUo7QUFISSxDO2VBaURYMUIsVSJ9