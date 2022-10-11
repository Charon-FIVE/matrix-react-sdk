"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class PassphraseField extends _react.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "validate", (0, _Validation.default)({
      description: function (complexity) {
        const score = complexity ? complexity.score : 0;
        return /*#__PURE__*/_react.default.createElement("progress", {
          className: "mx_PassphraseField_progress",
          max: 4,
          value: score
        });
      },
      deriveData: async _ref => {
        let {
          value
        } = _ref;
        if (!value) return null;
        const {
          scorePassword
        } = await Promise.resolve().then(() => _interopRequireWildcard(require('../../../utils/PasswordScorer')));
        return scorePassword(value);
      },
      rules: [{
        key: "required",
        test: _ref2 => {
          let {
            value,
            allowEmpty
          } = _ref2;
          return allowEmpty || !!value;
        },
        invalid: () => (0, _languageHandler._t)(this.props.labelEnterPassword)
      }, {
        key: "complexity",
        test: async function (_ref3, complexity) {
          let {
            value
          } = _ref3;

          if (!value) {
            return false;
          }

          const safe = complexity.score >= this.props.minScore;

          const allowUnsafe = _SdkConfig.default.get("dangerously_allow_unsafe_and_insecure_passwords");

          return allowUnsafe || safe;
        },
        valid: function (complexity) {
          // Unsafe passwords that are valid are only possible through a
          // configuration flag. We'll print some helper text to signal
          // to the user that their password is allowed, but unsafe.
          if (complexity.score >= this.props.minScore) {
            return (0, _languageHandler._t)(this.props.labelStrongPassword);
          }

          return (0, _languageHandler._t)(this.props.labelAllowedButUnsafe);
        },
        invalid: function (complexity) {
          if (!complexity) {
            return null;
          }

          const {
            feedback
          } = complexity;
          return feedback.warning || feedback.suggestions[0] || (0, _languageHandler._t)("Keep going...");
        }
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
      autoFocus: this.props.autoFocus,
      className: (0, _classnames.default)("mx_PassphraseField", this.props.className),
      ref: this.props.fieldRef,
      type: "password",
      autoComplete: "new-password",
      label: (0, _languageHandler._t)(this.props.label),
      value: this.props.value,
      onChange: this.props.onChange,
      onValidate: this.onValidate
    });
  }

}

(0, _defineProperty2.default)(PassphraseField, "defaultProps", {
  label: (0, _languageHandler._td)("Password"),
  labelEnterPassword: (0, _languageHandler._td)("Enter password"),
  labelStrongPassword: (0, _languageHandler._td)("Nice, strong password!"),
  labelAllowedButUnsafe: (0, _languageHandler._td)("Password is allowed, but unsafe")
});
var _default = PassphraseField;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXNzcGhyYXNlRmllbGQiLCJQdXJlQ29tcG9uZW50Iiwid2l0aFZhbGlkYXRpb24iLCJkZXNjcmlwdGlvbiIsImNvbXBsZXhpdHkiLCJzY29yZSIsImRlcml2ZURhdGEiLCJ2YWx1ZSIsInNjb3JlUGFzc3dvcmQiLCJydWxlcyIsImtleSIsInRlc3QiLCJhbGxvd0VtcHR5IiwiaW52YWxpZCIsIl90IiwicHJvcHMiLCJsYWJlbEVudGVyUGFzc3dvcmQiLCJzYWZlIiwibWluU2NvcmUiLCJhbGxvd1Vuc2FmZSIsIlNka0NvbmZpZyIsImdldCIsInZhbGlkIiwibGFiZWxTdHJvbmdQYXNzd29yZCIsImxhYmVsQWxsb3dlZEJ1dFVuc2FmZSIsImZlZWRiYWNrIiwid2FybmluZyIsInN1Z2dlc3Rpb25zIiwiZmllbGRTdGF0ZSIsInJlc3VsdCIsInZhbGlkYXRlIiwib25WYWxpZGF0ZSIsInJlbmRlciIsImlkIiwiYXV0b0ZvY3VzIiwiY2xhc3NOYW1lcyIsImNsYXNzTmFtZSIsImZpZWxkUmVmIiwibGFiZWwiLCJvbkNoYW5nZSIsIl90ZCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvUGFzc3BocmFzZUZpZWxkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgUHVyZUNvbXBvbmVudCwgUmVmQ2FsbGJhY2ssIFJlZk9iamVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB6eGN2Ym4gZnJvbSBcInp4Y3ZiblwiO1xuXG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiwgeyBJRmllbGRTdGF0ZSwgSVZhbGlkYXRpb25SZXN1bHQgfSBmcm9tIFwiLi4vZWxlbWVudHMvVmFsaWRhdGlvblwiO1xuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBGaWVsZCwgeyBJSW5wdXRQcm9wcyB9IGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgT21pdDxJSW5wdXRQcm9wcywgXCJvblZhbGlkYXRlXCI+IHtcbiAgICBhdXRvRm9jdXM/OiBib29sZWFuO1xuICAgIGlkPzogc3RyaW5nO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBtaW5TY29yZTogMCB8IDEgfCAyIHwgMyB8IDQ7XG4gICAgdmFsdWU6IHN0cmluZztcbiAgICBmaWVsZFJlZj86IFJlZkNhbGxiYWNrPEZpZWxkPiB8IFJlZk9iamVjdDxGaWVsZD47XG5cbiAgICBsYWJlbD86IHN0cmluZztcbiAgICBsYWJlbEVudGVyUGFzc3dvcmQ/OiBzdHJpbmc7XG4gICAgbGFiZWxTdHJvbmdQYXNzd29yZD86IHN0cmluZztcbiAgICBsYWJlbEFsbG93ZWRCdXRVbnNhZmU/OiBzdHJpbmc7XG5cbiAgICBvbkNoYW5nZShldjogUmVhY3QuRm9ybUV2ZW50PEhUTUxFbGVtZW50Pik7XG4gICAgb25WYWxpZGF0ZT8ocmVzdWx0OiBJVmFsaWRhdGlvblJlc3VsdCk7XG59XG5cbmNsYXNzIFBhc3NwaHJhc2VGaWVsZCBleHRlbmRzIFB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgbGFiZWw6IF90ZChcIlBhc3N3b3JkXCIpLFxuICAgICAgICBsYWJlbEVudGVyUGFzc3dvcmQ6IF90ZChcIkVudGVyIHBhc3N3b3JkXCIpLFxuICAgICAgICBsYWJlbFN0cm9uZ1Bhc3N3b3JkOiBfdGQoXCJOaWNlLCBzdHJvbmcgcGFzc3dvcmQhXCIpLFxuICAgICAgICBsYWJlbEFsbG93ZWRCdXRVbnNhZmU6IF90ZChcIlBhc3N3b3JkIGlzIGFsbG93ZWQsIGJ1dCB1bnNhZmVcIiksXG4gICAgfTtcblxuICAgIHB1YmxpYyByZWFkb25seSB2YWxpZGF0ZSA9IHdpdGhWYWxpZGF0aW9uPHRoaXMsIHp4Y3Zibi5aWENWQk5SZXN1bHQ+KHtcbiAgICAgICAgZGVzY3JpcHRpb246IGZ1bmN0aW9uKGNvbXBsZXhpdHkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjb3JlID0gY29tcGxleGl0eSA/IGNvbXBsZXhpdHkuc2NvcmUgOiAwO1xuICAgICAgICAgICAgcmV0dXJuIDxwcm9ncmVzcyBjbGFzc05hbWU9XCJteF9QYXNzcGhyYXNlRmllbGRfcHJvZ3Jlc3NcIiBtYXg9ezR9IHZhbHVlPXtzY29yZX0gLz47XG4gICAgICAgIH0sXG4gICAgICAgIGRlcml2ZURhdGE6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29uc3QgeyBzY29yZVBhc3N3b3JkIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uLy4uL3V0aWxzL1Bhc3N3b3JkU2NvcmVyJyk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcmVQYXNzd29yZCh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUsIGFsbG93RW1wdHkgfSkgPT4gYWxsb3dFbXB0eSB8fCAhIXZhbHVlLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KHRoaXMucHJvcHMubGFiZWxFbnRlclBhc3N3b3JkKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcImNvbXBsZXhpdHlcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiBhc3luYyBmdW5jdGlvbih7IHZhbHVlIH0sIGNvbXBsZXhpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhZmUgPSBjb21wbGV4aXR5LnNjb3JlID49IHRoaXMucHJvcHMubWluU2NvcmU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFsbG93VW5zYWZlID0gU2RrQ29uZmlnLmdldChcImRhbmdlcm91c2x5X2FsbG93X3Vuc2FmZV9hbmRfaW5zZWN1cmVfcGFzc3dvcmRzXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxsb3dVbnNhZmUgfHwgc2FmZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHZhbGlkOiBmdW5jdGlvbihjb21wbGV4aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVuc2FmZSBwYXNzd29yZHMgdGhhdCBhcmUgdmFsaWQgYXJlIG9ubHkgcG9zc2libGUgdGhyb3VnaCBhXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbmZpZ3VyYXRpb24gZmxhZy4gV2UnbGwgcHJpbnQgc29tZSBoZWxwZXIgdGV4dCB0byBzaWduYWxcbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlIHVzZXIgdGhhdCB0aGVpciBwYXNzd29yZCBpcyBhbGxvd2VkLCBidXQgdW5zYWZlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGxleGl0eS5zY29yZSA+PSB0aGlzLnByb3BzLm1pblNjb3JlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3QodGhpcy5wcm9wcy5sYWJlbFN0cm9uZ1Bhc3N3b3JkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3QodGhpcy5wcm9wcy5sYWJlbEFsbG93ZWRCdXRVbnNhZmUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogZnVuY3Rpb24oY29tcGxleGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbXBsZXhpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZmVlZGJhY2sgfSA9IGNvbXBsZXhpdHk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmZWVkYmFjay53YXJuaW5nIHx8IGZlZWRiYWNrLnN1Z2dlc3Rpb25zWzBdIHx8IF90KFwiS2VlcCBnb2luZy4uLlwiKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIG9uVmFsaWRhdGUgPSBhc3luYyAoZmllbGRTdGF0ZTogSUZpZWxkU3RhdGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZShmaWVsZFN0YXRlKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25WYWxpZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkYXRlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICBpZD17dGhpcy5wcm9wcy5pZH1cbiAgICAgICAgICAgIGF1dG9Gb2N1cz17dGhpcy5wcm9wcy5hdXRvRm9jdXN9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9QYXNzcGhyYXNlRmllbGRcIiwgdGhpcy5wcm9wcy5jbGFzc05hbWUpfVxuICAgICAgICAgICAgcmVmPXt0aGlzLnByb3BzLmZpZWxkUmVmfVxuICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICBsYWJlbD17X3QodGhpcy5wcm9wcy5sYWJlbCl9XG4gICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy52YWx1ZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblZhbGlkYXRlfVxuICAgICAgICAvPjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhc3NwaHJhc2VGaWVsZDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQW1CQSxNQUFNQSxlQUFOLFNBQThCQyxvQkFBOUIsQ0FBb0Q7RUFBQTtJQUFBO0lBQUEsZ0RBUXJCLElBQUFDLG1CQUFBLEVB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