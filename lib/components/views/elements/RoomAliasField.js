"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _Validation = _interopRequireDefault(require("./Validation"));

var _Field = _interopRequireDefault(require("./Field"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

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
// Controlled form component wrapping Field for inputting a room alias scoped to a given domain
class RoomAliasField extends _react.default.PureComponent {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "fieldRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onChange", ev => {
      if (this.props.onChange) {
        this.props.onChange(this.asFullAlias(ev.target.value));
      }
    });
    (0, _defineProperty2.default)(this, "onValidate", async fieldState => {
      const result = await this.validationRules(fieldState);
      this.setState({
        isValid: result.valid
      });
      return result;
    });
    (0, _defineProperty2.default)(this, "validationRules", (0, _Validation.default)({
      rules: [{
        key: "hasDomain",
        test: async _ref => {
          let {
            value
          } = _ref;

          // Ignore if we have passed domain
          if (!value || this.props.domain) {
            return true;
          }

          if (value.split(':').length < 2) {
            return false;
          }

          return true;
        },
        invalid: () => (0, _languageHandler._t)("Missing domain separator e.g. (:domain.org)")
      }, {
        key: "hasLocalpart",
        test: async _ref2 => {
          let {
            value
          } = _ref2;

          if (!value || this.props.domain) {
            return true;
          }

          const split = value.split(':');

          if (split.length < 2) {
            return true; // hasDomain check will fail here instead
          } // Define the value invalid if there's no first part (roomname)


          if (split[0].length < 1) {
            return false;
          }

          return true;
        },
        invalid: () => (0, _languageHandler._t)("Missing room name or separator e.g. (my-room:domain.org)")
      }, {
        key: "safeLocalpart",
        test: async _ref3 => {
          let {
            value
          } = _ref3;

          if (!value) {
            return true;
          }

          if (!this.props.domain) {
            return true;
          } else {
            const fullAlias = this.asFullAlias(value);
            const hasColon = this.props.domain ? !value.includes(":") : true; // XXX: FIXME https://github.com/matrix-org/matrix-doc/issues/668
            // NOTE: We could probably use linkifyjs to parse those aliases here?

            return !value.includes("#") && hasColon && !value.includes(",") && encodeURI(fullAlias) === fullAlias;
          }
        },
        invalid: () => (0, _languageHandler._t)("Some characters not allowed")
      }, {
        key: "required",
        test: async _ref4 => {
          let {
            value,
            allowEmpty
          } = _ref4;
          return allowEmpty || !!value;
        },
        invalid: () => (0, _languageHandler._t)("Please provide an address")
      }, this.props.roomId ? {
        key: "matches",
        final: true,
        test: async _ref5 => {
          let {
            value
          } = _ref5;

          if (!value) {
            return true;
          }

          const client = this.context;

          try {
            const result = await client.getRoomIdForAlias(this.asFullAlias(value));
            return result.room_id === this.props.roomId;
          } catch (err) {
            console.log(err);
            return false;
          }
        },
        invalid: () => (0, _languageHandler._t)("This address does not point at this room")
      } : {
        key: "taken",
        final: true,
        test: async _ref6 => {
          let {
            value
          } = _ref6;

          if (!value) {
            return true;
          }

          const client = this.context;

          try {
            await client.getRoomIdForAlias(this.asFullAlias(value)); // we got a room id, so the alias is taken

            return false;
          } catch (err) {
            console.log(err); // any server error code will do,
            // either it M_NOT_FOUND or the alias is invalid somehow,
            // in which case we don't want to show the invalid message

            return !!err.errcode;
          }
        },
        valid: () => (0, _languageHandler._t)("This address is available to use"),
        invalid: () => this.props.domain ? (0, _languageHandler._t)("This address is already in use") : (0, _languageHandler._t)("This address had invalid server or is already in use")
      }]
    }));
    this.state = {
      isValid: true
    };
  }

  asFullAlias(localpart) {
    const hashAlias = `#${localpart}`;

    if (this.props.domain) {
      return `${hashAlias}:${this.props.domain}`;
    }

    return hashAlias;
  }

  get domainProps() {
    const {
      domain
    } = this.props;

    const prefix = /*#__PURE__*/_react.default.createElement("span", null, "#");

    const postfix = domain ? /*#__PURE__*/_react.default.createElement("span", {
      title: `:${domain}`
    }, `:${domain}`) : /*#__PURE__*/_react.default.createElement("span", null);
    const maxlength = domain ? 255 - domain.length - 2 : 255 - 1; // 2 for # and :

    const value = domain ? this.props.value.substring(1, this.props.value.length - this.props.domain.length - 1) : this.props.value.substring(1);
    return {
      prefix,
      postfix,
      value,
      maxlength
    };
  }

  render() {
    const {
      prefix,
      postfix,
      value,
      maxlength
    } = this.domainProps;
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: this.props.label || (0, _languageHandler._t)("Room address"),
      className: "mx_RoomAliasField",
      prefixComponent: prefix,
      postfixComponent: postfix,
      ref: this.fieldRef,
      onValidate: this.onValidate,
      placeholder: this.props.placeholder || (0, _languageHandler._t)("e.g. my-room"),
      onChange: this.onChange,
      value: value,
      maxLength: maxlength,
      disabled: this.props.disabled,
      autoComplete: "off",
      onKeyDown: this.props.onKeyDown
    });
  }

  get isValid() {
    return this.state.isValid;
  }

  validate(options) {
    return this.fieldRef.current?.validate(options);
  }

  focus() {
    this.fieldRef.current?.focus();
  }

}

exports.default = RoomAliasField;
(0, _defineProperty2.default)(RoomAliasField, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tQWxpYXNGaWVsZCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwiY3JlYXRlUmVmIiwiZXYiLCJvbkNoYW5nZSIsImFzRnVsbEFsaWFzIiwidGFyZ2V0IiwidmFsdWUiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGlvblJ1bGVzIiwic2V0U3RhdGUiLCJpc1ZhbGlkIiwidmFsaWQiLCJ3aXRoVmFsaWRhdGlvbiIsInJ1bGVzIiwia2V5IiwidGVzdCIsImRvbWFpbiIsInNwbGl0IiwibGVuZ3RoIiwiaW52YWxpZCIsIl90IiwiZnVsbEFsaWFzIiwiaGFzQ29sb24iLCJpbmNsdWRlcyIsImVuY29kZVVSSSIsImFsbG93RW1wdHkiLCJyb29tSWQiLCJmaW5hbCIsImNsaWVudCIsImdldFJvb21JZEZvckFsaWFzIiwicm9vbV9pZCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJlcnJjb2RlIiwic3RhdGUiLCJsb2NhbHBhcnQiLCJoYXNoQWxpYXMiLCJkb21haW5Qcm9wcyIsInByZWZpeCIsInBvc3RmaXgiLCJtYXhsZW5ndGgiLCJzdWJzdHJpbmciLCJyZW5kZXIiLCJsYWJlbCIsImZpZWxkUmVmIiwib25WYWxpZGF0ZSIsInBsYWNlaG9sZGVyIiwiZGlzYWJsZWQiLCJvbktleURvd24iLCJ2YWxpZGF0ZSIsIm9wdGlvbnMiLCJjdXJyZW50IiwiZm9jdXMiLCJNYXRyaXhDbGllbnRDb250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvUm9vbUFsaWFzRmllbGQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSAtIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmLCBLZXlib2FyZEV2ZW50SGFuZGxlciB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgd2l0aFZhbGlkYXRpb24gZnJvbSAnLi9WYWxpZGF0aW9uJztcbmltcG9ydCBGaWVsZCwgeyBJVmFsaWRhdGVPcHRzIH0gZnJvbSBcIi4vRmllbGRcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGRvbWFpbj86IHN0cmluZztcbiAgICB2YWx1ZTogc3RyaW5nO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xuICAgIGRpc2FibGVkPzogYm9vbGVhbjtcbiAgICAvLyBpZiByb29tSWQgaXMgcGFzc2VkIHRoZW4gdGhlIGVudGVyZWQgYWxpYXMgaXMgY2hlY2tlZCB0byBwb2ludCB0byB0aGlzIHJvb21JZCwgZWxzZSBtdXN0IGJlIHVuYXNzaWduZWRcbiAgICByb29tSWQ/OiBzdHJpbmc7XG4gICAgb25LZXlEb3duPzogS2V5Ym9hcmRFdmVudEhhbmRsZXI7XG4gICAgb25DaGFuZ2U/KHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBpc1ZhbGlkOiBib29sZWFuO1xufVxuXG4vLyBDb250cm9sbGVkIGZvcm0gY29tcG9uZW50IHdyYXBwaW5nIEZpZWxkIGZvciBpbnB1dHRpbmcgYSByb29tIGFsaWFzIHNjb3BlZCB0byBhIGdpdmVuIGRvbWFpblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbUFsaWFzRmllbGQgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBNYXRyaXhDbGllbnRDb250ZXh0PjtcblxuICAgIHByaXZhdGUgZmllbGRSZWYgPSBjcmVhdGVSZWY8RmllbGQ+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGlzVmFsaWQ6IHRydWUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc0Z1bGxBbGlhcyhsb2NhbHBhcnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGhhc2hBbGlhcyA9IGAjJHsgbG9jYWxwYXJ0IH1gO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5kb21haW4pIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtoYXNoQWxpYXN9OiR7dGhpcy5wcm9wcy5kb21haW59YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaEFsaWFzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGRvbWFpblByb3BzKCkge1xuICAgICAgICBjb25zdCB7IGRvbWFpbiB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgcHJlZml4ID0gPHNwYW4+Izwvc3Bhbj47XG4gICAgICAgIGNvbnN0IHBvc3RmaXggPSBkb21haW4gPyAoPHNwYW4gdGl0bGU9e2A6JHtkb21haW59YH0+eyBgOiR7ZG9tYWlufWAgfTwvc3Bhbj4pIDogPHNwYW4gLz47XG4gICAgICAgIGNvbnN0IG1heGxlbmd0aCA9IGRvbWFpbiA/IDI1NSAtIGRvbWFpbi5sZW5ndGggLSAyIDogMjU1IC0gMTsgICAvLyAyIGZvciAjIGFuZCA6XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZG9tYWluID9cbiAgICAgICAgICAgIHRoaXMucHJvcHMudmFsdWUuc3Vic3RyaW5nKDEsIHRoaXMucHJvcHMudmFsdWUubGVuZ3RoIC0gdGhpcy5wcm9wcy5kb21haW4ubGVuZ3RoIC0gMSkgOlxuICAgICAgICAgICAgdGhpcy5wcm9wcy52YWx1ZS5zdWJzdHJpbmcoMSk7XG5cbiAgICAgICAgcmV0dXJuIHsgcHJlZml4LCBwb3N0Zml4LCB2YWx1ZSwgbWF4bGVuZ3RoIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IHByZWZpeCwgcG9zdGZpeCwgdmFsdWUsIG1heGxlbmd0aCB9ID0gdGhpcy5kb21haW5Qcm9wcztcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgIGxhYmVsPXt0aGlzLnByb3BzLmxhYmVsIHx8IF90KFwiUm9vbSBhZGRyZXNzXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21BbGlhc0ZpZWxkXCJcbiAgICAgICAgICAgICAgICBwcmVmaXhDb21wb25lbnQ9e3ByZWZpeH1cbiAgICAgICAgICAgICAgICBwb3N0Zml4Q29tcG9uZW50PXtwb3N0Zml4fVxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5maWVsZFJlZn1cbiAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXIgfHwgX3QoXCJlLmcuIG15LXJvb21cIil9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgICAgICAgICAgIG1heExlbmd0aD17bWF4bGVuZ3RofVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLnByb3BzLm9uS2V5RG93bn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZSA9IChldikgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLmFzRnVsbEFsaWFzKGV2LnRhcmdldC52YWx1ZSkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25WYWxpZGF0ZSA9IGFzeW5jIChmaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGlvblJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaXNWYWxpZDogcmVzdWx0LnZhbGlkIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZhbGlkYXRpb25SdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHsga2V5OiBcImhhc0RvbWFpblwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlIGlmIHdlIGhhdmUgcGFzc2VkIGRvbWFpblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlIHx8IHRoaXMucHJvcHMuZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5zcGxpdCgnOicpLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiTWlzc2luZyBkb21haW4gc2VwYXJhdG9yIGUuZy4gKDpkb21haW4ub3JnKVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcImhhc0xvY2FscGFydFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSB8fCB0aGlzLnByb3BzLmRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGxpdCA9IHZhbHVlLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gaGFzRG9tYWluIGNoZWNrIHdpbGwgZmFpbCBoZXJlIGluc3RlYWRcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmluZSB0aGUgdmFsdWUgaW52YWxpZCBpZiB0aGVyZSdzIG5vIGZpcnN0IHBhcnQgKHJvb21uYW1lKVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJNaXNzaW5nIHJvb20gbmFtZSBvciBzZXBhcmF0b3IgZS5nLiAobXktcm9vbTpkb21haW4ub3JnKVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInNhZmVMb2NhbHBhcnRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiBhc3luYyAoeyB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5kb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnVsbEFsaWFzID0gdGhpcy5hc0Z1bGxBbGlhcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNDb2xvbiA9IHRoaXMucHJvcHMuZG9tYWluID8gIXZhbHVlLmluY2x1ZGVzKFwiOlwiKSA6IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBYWFg6IEZJWE1FIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvaXNzdWVzLzY2OFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogV2UgY291bGQgcHJvYmFibHkgdXNlIGxpbmtpZnlqcyB0byBwYXJzZSB0aG9zZSBhbGlhc2VzIGhlcmU/XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXZhbHVlLmluY2x1ZGVzKFwiI1wiKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbG9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIXZhbHVlLmluY2x1ZGVzKFwiLFwiKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSShmdWxsQWxpYXMpID09PSBmdWxsQWxpYXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiU29tZSBjaGFyYWN0ZXJzIG5vdCBhbGxvd2VkXCIpLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlBsZWFzZSBwcm92aWRlIGFuIGFkZHJlc3NcIiksXG4gICAgICAgICAgICB9LCB0aGlzLnByb3BzLnJvb21JZCA/IHtcbiAgICAgICAgICAgICAgICBrZXk6IFwibWF0Y2hlc1wiLFxuICAgICAgICAgICAgICAgIGZpbmFsOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LmdldFJvb21JZEZvckFsaWFzKHRoaXMuYXNGdWxsQWxpYXModmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQucm9vbV9pZCA9PT0gdGhpcy5wcm9wcy5yb29tSWQ7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJUaGlzIGFkZHJlc3MgZG9lcyBub3QgcG9pbnQgYXQgdGhpcyByb29tXCIpLFxuICAgICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgICAgICBrZXk6IFwidGFrZW5cIixcbiAgICAgICAgICAgICAgICBmaW5hbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZXN0OiBhc3luYyAoeyB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5nZXRSb29tSWRGb3JBbGlhcyh0aGlzLmFzRnVsbEFsaWFzKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBnb3QgYSByb29tIGlkLCBzbyB0aGUgYWxpYXMgaXMgdGFrZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW55IHNlcnZlciBlcnJvciBjb2RlIHdpbGwgZG8sXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlaXRoZXIgaXQgTV9OT1RfRk9VTkQgb3IgdGhlIGFsaWFzIGlzIGludmFsaWQgc29tZWhvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluIHdoaWNoIGNhc2Ugd2UgZG9uJ3Qgd2FudCB0byBzaG93IHRoZSBpbnZhbGlkIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhIWVyci5lcnJjb2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB2YWxpZDogKCkgPT4gX3QoXCJUaGlzIGFkZHJlc3MgaXMgYXZhaWxhYmxlIHRvIHVzZVwiKSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiB0aGlzLnByb3BzLmRvbWFpbiA/XG4gICAgICAgICAgICAgICAgICAgIF90KFwiVGhpcyBhZGRyZXNzIGlzIGFscmVhZHkgaW4gdXNlXCIpIDpcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJUaGlzIGFkZHJlc3MgaGFkIGludmFsaWQgc2VydmVyIG9yIGlzIGFscmVhZHkgaW4gdXNlXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHB1YmxpYyBnZXQgaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaXNWYWxpZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdmFsaWRhdGUob3B0aW9uczogSVZhbGlkYXRlT3B0cykge1xuICAgICAgICByZXR1cm4gdGhpcy5maWVsZFJlZi5jdXJyZW50Py52YWxpZGF0ZShvcHRpb25zKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZm9jdXMoKSB7XG4gICAgICAgIHRoaXMuZmllbGRSZWYuY3VycmVudD8uZm9jdXMoKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBeUJBO0FBQ2UsTUFBTUEsY0FBTixTQUE2QkMsY0FBQSxDQUFNQyxhQUFuQyxDQUFpRTtFQU01RUMsV0FBVyxDQUFDQyxLQUFELEVBQVFDLE9BQVIsRUFBaUI7SUFDeEIsTUFBTUQsS0FBTixFQUFhQyxPQUFiO0lBRHdCO0lBQUEsNkRBRlQsSUFBQUMsZ0JBQUEsR0FFUztJQUFBLGdEQWlEUkMsRUFBRCxJQUFRO01BQ3ZCLElBQUksS0FBS0gsS0FBTCxDQUFXSSxRQUFmLEVBQXlCO1FBQ3JCLEtBQUtKLEtBQUwsQ0FBV0ksUUFBWCxDQUFvQixLQUFLQyxXQUFMLENBQWlCRixFQUFFLENBQUNHLE1BQUgsQ0FBVUMsS0FBM0IsQ0FBcEI7TUFDSDtJQUNKLENBckQyQjtJQUFBLGtEQXVEUCxNQUFPQyxVQUFQLElBQXNCO01BQ3ZDLE1BQU1DLE1BQU0sR0FBRyxNQUFNLEtBQUtDLGVBQUwsQ0FBcUJGLFVBQXJCLENBQXJCO01BQ0EsS0FBS0csUUFBTCxDQUFjO1FBQUVDLE9BQU8sRUFBRUgsTUFBTSxDQUFDSTtNQUFsQixDQUFkO01BQ0EsT0FBT0osTUFBUDtJQUNILENBM0QyQjtJQUFBLHVEQTZERixJQUFBSyxtQkFBQSxFQUFlO01BQ3JDQyxLQUFLLEVB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