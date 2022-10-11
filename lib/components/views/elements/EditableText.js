"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd

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
var Phases;

(function (Phases) {
  Phases["Display"] = "display";
  Phases["Edit"] = "edit";
})(Phases || (Phases = {}));

class EditableText extends _react.default.Component {
  // we track value as an JS object field rather than in React state
  // as React doesn't play nice with contentEditable.
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "value", '');
    (0, _defineProperty2.default)(this, "placeholder", false);
    (0, _defineProperty2.default)(this, "editableDiv", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "showPlaceholder", show => {
      if (show) {
        this.editableDiv.current.textContent = this.props.placeholder;
        this.editableDiv.current.setAttribute("class", this.props.className + " " + this.props.placeholderClassName);
        this.placeholder = true;
        this.value = '';
      } else {
        this.editableDiv.current.textContent = this.value;
        this.editableDiv.current.setAttribute("class", this.props.className);
        this.placeholder = false;
      }
    });
    (0, _defineProperty2.default)(this, "cancelEdit", () => {
      this.setState({
        phase: Phases.Display
      });
      this.value = this.props.initialValue;
      this.showPlaceholder(!this.value);
      this.onValueChanged(false);
      this.editableDiv.current.blur();
    });
    (0, _defineProperty2.default)(this, "onValueChanged", shouldSubmit => {
      this.props.onValueChanged(this.value, shouldSubmit);
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      // console.log("keyDown: textContent=" + ev.target.textContent + ", value=" + this.value + ", placeholder=" + this.placeholder);
      if (this.placeholder) {
        this.showPlaceholder(false);
      }

      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Enter:
          ev.stopPropagation();
          ev.preventDefault();
          break;
      } // console.log("keyDown: textContent=" + ev.target.textContent + ", value=" + this.value + ", placeholder=" + this.placeholder);

    });
    (0, _defineProperty2.default)(this, "onKeyUp", ev => {
      // console.log("keyUp: textContent=" + ev.target.textContent + ", value=" + this.value + ", placeholder=" + this.placeholder);
      if (!ev.target.textContent) {
        this.showPlaceholder(true);
      } else if (!this.placeholder) {
        this.value = ev.target.textContent;
      }

      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Escape:
          this.cancelEdit();
          break;

        case _KeyboardShortcuts.KeyBindingAction.Enter:
          this.onFinish(ev);
          break;
      } // console.log("keyUp: textContent=" + ev.target.textContent + ", value=" + this.value + ", placeholder=" + this.placeholder);

    });
    (0, _defineProperty2.default)(this, "onClickDiv", () => {
      if (!this.props.editable) return;
      this.setState({
        phase: Phases.Edit
      });
    });
    (0, _defineProperty2.default)(this, "onFocus", ev => {
      //ev.target.setSelectionRange(0, ev.target.textContent.length);
      const node = ev.target.childNodes[0];

      if (node) {
        const range = document.createRange();
        range.setStart(node, 0);
        range.setEnd(node, ev.target.childNodes.length);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
    (0, _defineProperty2.default)(this, "onFinish", (ev, shouldSubmit) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);
      const submit = action === _KeyboardShortcuts.KeyBindingAction.Enter || shouldSubmit;
      this.setState({
        phase: Phases.Display
      }, () => {
        if (this.value !== this.props.initialValue) {
          self.onValueChanged(submit);
        }
      });
    });
    (0, _defineProperty2.default)(this, "onBlur", ev => {
      const sel = window.getSelection();
      sel.removeAllRanges();

      if (this.props.blurToCancel) {
        this.cancelEdit();
      } else {
        this.onFinish(ev, this.props.blurToSubmit);
      }

      this.showPlaceholder(!this.value);
    });
    this.state = {
      phase: Phases.Display
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase


  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.initialValue !== this.props.initialValue) {
      this.value = nextProps.initialValue;

      if (this.editableDiv.current) {
        this.showPlaceholder(!this.value);
      }
    }
  }

  componentDidMount() {
    this.value = this.props.initialValue;

    if (this.editableDiv.current) {
      this.showPlaceholder(!this.value);
    }
  }

  render() {
    const {
      className,
      editable,
      initialValue,
      label,
      labelClassName
    } = this.props;
    let editableEl;

    if (!editable || this.state.phase === Phases.Display && (label || labelClassName) && !this.value) {
      // show the label
      editableEl = /*#__PURE__*/_react.default.createElement("div", {
        className: className + " " + labelClassName,
        onClick: this.onClickDiv
      }, label || initialValue);
    } else {
      // show the content editable div, but manually manage its contents as react and contentEditable don't play nice together
      editableEl = /*#__PURE__*/_react.default.createElement("div", {
        ref: this.editableDiv,
        contentEditable: true,
        className: className,
        onKeyDown: this.onKeyDown,
        onKeyUp: this.onKeyUp,
        onFocus: this.onFocus,
        onBlur: this.onBlur
      });
    }

    return editableEl;
  }

}

exports.default = EditableText;
(0, _defineProperty2.default)(EditableText, "defaultProps", {
  onValueChanged() {},

  initialValue: '',
  label: '',
  placeholder: '',
  editable: true,
  className: "mx_EditableText",
  placeholderClassName: "mx_EditableText_placeholder",
  blurToSubmit: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGFzZXMiLCJFZGl0YWJsZVRleHQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJzaG93IiwiZWRpdGFibGVEaXYiLCJjdXJyZW50IiwidGV4dENvbnRlbnQiLCJwbGFjZWhvbGRlciIsInNldEF0dHJpYnV0ZSIsImNsYXNzTmFtZSIsInBsYWNlaG9sZGVyQ2xhc3NOYW1lIiwidmFsdWUiLCJzZXRTdGF0ZSIsInBoYXNlIiwiRGlzcGxheSIsImluaXRpYWxWYWx1ZSIsInNob3dQbGFjZWhvbGRlciIsIm9uVmFsdWVDaGFuZ2VkIiwiYmx1ciIsInNob3VsZFN1Ym1pdCIsImV2IiwiYWN0aW9uIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJFbnRlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwidGFyZ2V0IiwiRXNjYXBlIiwiY2FuY2VsRWRpdCIsIm9uRmluaXNoIiwiZWRpdGFibGUiLCJFZGl0Iiwibm9kZSIsImNoaWxkTm9kZXMiLCJyYW5nZSIsImRvY3VtZW50IiwiY3JlYXRlUmFuZ2UiLCJzZXRTdGFydCIsInNldEVuZCIsImxlbmd0aCIsInNlbCIsIndpbmRvdyIsImdldFNlbGVjdGlvbiIsInJlbW92ZUFsbFJhbmdlcyIsImFkZFJhbmdlIiwic2VsZiIsInN1Ym1pdCIsImJsdXJUb0NhbmNlbCIsImJsdXJUb1N1Ym1pdCIsInN0YXRlIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJjb21wb25lbnREaWRNb3VudCIsInJlbmRlciIsImxhYmVsIiwibGFiZWxDbGFzc05hbWUiLCJlZGl0YWJsZUVsIiwib25DbGlja0RpdiIsIm9uS2V5RG93biIsIm9uS2V5VXAiLCJvbkZvY3VzIiwib25CbHVyIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRWRpdGFibGVUZXh0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgS2V5QmluZGluZ0FjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5cbmVudW0gUGhhc2VzIHtcbiAgICBEaXNwbGF5ID0gXCJkaXNwbGF5XCIsXG4gICAgRWRpdCA9IFwiZWRpdFwiLFxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvblZhbHVlQ2hhbmdlZD86ICh2YWx1ZTogc3RyaW5nLCBzaG91bGRTdWJtaXQ6IGJvb2xlYW4pID0+IHZvaWQ7XG4gICAgaW5pdGlhbFZhbHVlPzogc3RyaW5nO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBsYWJlbENsYXNzTmFtZT86IHN0cmluZztcbiAgICBwbGFjZWhvbGRlckNsYXNzTmFtZT86IHN0cmluZztcbiAgICAvLyBPdmVycmlkZXMgYmx1clRvU3VibWl0IGlmIHRydWVcbiAgICBibHVyVG9DYW5jZWw/OiBib29sZWFuO1xuICAgIC8vIFdpbGwgY2F1c2Ugb25WYWx1ZUNoYW5nZWQodmFsdWUsIHRydWUpIHRvIGZpcmUgb24gYmx1clxuICAgIGJsdXJUb1N1Ym1pdD86IGJvb2xlYW47XG4gICAgZWRpdGFibGU/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBwaGFzZTogUGhhc2VzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0YWJsZVRleHQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICAvLyB3ZSB0cmFjayB2YWx1ZSBhcyBhbiBKUyBvYmplY3QgZmllbGQgcmF0aGVyIHRoYW4gaW4gUmVhY3Qgc3RhdGVcbiAgICAvLyBhcyBSZWFjdCBkb2Vzbid0IHBsYXkgbmljZSB3aXRoIGNvbnRlbnRFZGl0YWJsZS5cbiAgICBwdWJsaWMgdmFsdWUgPSAnJztcbiAgICBwcml2YXRlIHBsYWNlaG9sZGVyID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBlZGl0YWJsZURpdiA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcblxuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFByb3BzOiBQYXJ0aWFsPElQcm9wcz4gPSB7XG4gICAgICAgIG9uVmFsdWVDaGFuZ2VkKCkge30sXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgICAgIGxhYmVsOiAnJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICcnLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgY2xhc3NOYW1lOiBcIm14X0VkaXRhYmxlVGV4dFwiLFxuICAgICAgICBwbGFjZWhvbGRlckNsYXNzTmFtZTogXCJteF9FZGl0YWJsZVRleHRfcGxhY2Vob2xkZXJcIixcbiAgICAgICAgYmx1clRvU3VibWl0OiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZXMuRGlzcGxheSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24sIGNhbWVsY2FzZVxuICAgIHB1YmxpYyBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IElQcm9wcyk6IHZvaWQge1xuICAgICAgICBpZiAobmV4dFByb3BzLmluaXRpYWxWYWx1ZSAhPT0gdGhpcy5wcm9wcy5pbml0aWFsVmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBuZXh0UHJvcHMuaW5pdGlhbFZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuZWRpdGFibGVEaXYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsYWNlaG9sZGVyKCF0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMucHJvcHMuaW5pdGlhbFZhbHVlO1xuICAgICAgICBpZiAodGhpcy5lZGl0YWJsZURpdi5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNob3dQbGFjZWhvbGRlcighdGhpcy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3dQbGFjZWhvbGRlciA9IChzaG93OiBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChzaG93KSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRhYmxlRGl2LmN1cnJlbnQudGV4dENvbnRlbnQgPSB0aGlzLnByb3BzLnBsYWNlaG9sZGVyO1xuICAgICAgICAgICAgdGhpcy5lZGl0YWJsZURpdi5jdXJyZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgKyBcIiBcIiArIHRoaXMucHJvcHMucGxhY2Vob2xkZXJDbGFzc05hbWUpO1xuICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlciA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRhYmxlRGl2LmN1cnJlbnQudGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5lZGl0YWJsZURpdi5jdXJyZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMucHJvcHMuY2xhc3NOYW1lKTtcbiAgICAgICAgICAgIHRoaXMucGxhY2Vob2xkZXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGNhbmNlbEVkaXQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhhc2U6IFBoYXNlcy5EaXNwbGF5LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMucHJvcHMuaW5pdGlhbFZhbHVlO1xuICAgICAgICB0aGlzLnNob3dQbGFjZWhvbGRlcighdGhpcy52YWx1ZSk7XG4gICAgICAgIHRoaXMub25WYWx1ZUNoYW5nZWQoZmFsc2UpO1xuICAgICAgICB0aGlzLmVkaXRhYmxlRGl2LmN1cnJlbnQuYmx1cigpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVmFsdWVDaGFuZ2VkID0gKHNob3VsZFN1Ym1pdDogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uVmFsdWVDaGFuZ2VkKHRoaXMudmFsdWUsIHNob3VsZFN1Ym1pdCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50PEhUTUxEaXZFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImtleURvd246IHRleHRDb250ZW50PVwiICsgZXYudGFyZ2V0LnRleHRDb250ZW50ICsgXCIsIHZhbHVlPVwiICsgdGhpcy52YWx1ZSArIFwiLCBwbGFjZWhvbGRlcj1cIiArIHRoaXMucGxhY2Vob2xkZXIpO1xuXG4gICAgICAgIGlmICh0aGlzLnBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dQbGFjZWhvbGRlcihmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBY2Nlc3NpYmlsaXR5QWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5FbnRlcjpcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJrZXlEb3duOiB0ZXh0Q29udGVudD1cIiArIGV2LnRhcmdldC50ZXh0Q29udGVudCArIFwiLCB2YWx1ZT1cIiArIHRoaXMudmFsdWUgKyBcIiwgcGxhY2Vob2xkZXI9XCIgKyB0aGlzLnBsYWNlaG9sZGVyKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleVVwID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50PEhUTUxEaXZFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImtleVVwOiB0ZXh0Q29udGVudD1cIiArIGV2LnRhcmdldC50ZXh0Q29udGVudCArIFwiLCB2YWx1ZT1cIiArIHRoaXMudmFsdWUgKyBcIiwgcGxhY2Vob2xkZXI9XCIgKyB0aGlzLnBsYWNlaG9sZGVyKTtcblxuICAgICAgICBpZiAoIShldi50YXJnZXQgYXMgSFRNTERpdkVsZW1lbnQpLnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNob3dQbGFjZWhvbGRlcih0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IChldi50YXJnZXQgYXMgSFRNTERpdkVsZW1lbnQpLnRleHRDb250ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihldik7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRXNjYXBlOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVudGVyOlxuICAgICAgICAgICAgICAgIHRoaXMub25GaW5pc2goZXYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJrZXlVcDogdGV4dENvbnRlbnQ9XCIgKyBldi50YXJnZXQudGV4dENvbnRlbnQgKyBcIiwgdmFsdWU9XCIgKyB0aGlzLnZhbHVlICsgXCIsIHBsYWNlaG9sZGVyPVwiICsgdGhpcy5wbGFjZWhvbGRlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbGlja0RpdiA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmVkaXRhYmxlKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogUGhhc2VzLkVkaXQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9jdXMgPSAoZXY6IFJlYWN0LkZvY3VzRXZlbnQ8SFRNTERpdkVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIC8vZXYudGFyZ2V0LnNldFNlbGVjdGlvblJhbmdlKDAsIGV2LnRhcmdldC50ZXh0Q29udGVudC5sZW5ndGgpO1xuXG4gICAgICAgIGNvbnN0IG5vZGUgPSBldi50YXJnZXQuY2hpbGROb2Rlc1swXTtcbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgIHJhbmdlLnNldFN0YXJ0KG5vZGUsIDApO1xuICAgICAgICAgICAgcmFuZ2Uuc2V0RW5kKG5vZGUsIGV2LnRhcmdldC5jaGlsZE5vZGVzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgICAgIHNlbC5hZGRSYW5nZShyYW5nZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZpbmlzaCA9IChcbiAgICAgICAgZXY6IFJlYWN0LktleWJvYXJkRXZlbnQ8SFRNTERpdkVsZW1lbnQ+IHwgUmVhY3QuRm9jdXNFdmVudDxIVE1MRGl2RWxlbWVudD4sXG4gICAgICAgIHNob3VsZFN1Ym1pdD86IGJvb2xlYW4sXG4gICAgKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihldiBhcyBSZWFjdC5LZXlib2FyZEV2ZW50KTtcbiAgICAgICAgY29uc3Qgc3VibWl0ID0gYWN0aW9uID09PSBLZXlCaW5kaW5nQWN0aW9uLkVudGVyIHx8IHNob3VsZFN1Ym1pdDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogUGhhc2VzLkRpc3BsYXksXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSB0aGlzLnByb3BzLmluaXRpYWxWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHNlbGYub25WYWx1ZUNoYW5nZWQoc3VibWl0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25CbHVyID0gKGV2OiBSZWFjdC5Gb2N1c0V2ZW50PEhUTUxEaXZFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5ibHVyVG9DYW5jZWwpIHtcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsRWRpdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbkZpbmlzaChldiwgdGhpcy5wcm9wcy5ibHVyVG9TdWJtaXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaG93UGxhY2Vob2xkZXIoIXRoaXMudmFsdWUpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgeyBjbGFzc05hbWUsIGVkaXRhYmxlLCBpbml0aWFsVmFsdWUsIGxhYmVsLCBsYWJlbENsYXNzTmFtZSB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgbGV0IGVkaXRhYmxlRWw7XG5cbiAgICAgICAgaWYgKCFlZGl0YWJsZSB8fCAodGhpcy5zdGF0ZS5waGFzZSA9PT0gUGhhc2VzLkRpc3BsYXkgJiZcbiAgICAgICAgICAgIChsYWJlbCB8fCBsYWJlbENsYXNzTmFtZSkgJiYgIXRoaXMudmFsdWUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgLy8gc2hvdyB0aGUgbGFiZWxcbiAgICAgICAgICAgIGVkaXRhYmxlRWwgPSA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lICsgXCIgXCIgKyBsYWJlbENsYXNzTmFtZX0gb25DbGljaz17dGhpcy5vbkNsaWNrRGl2fT5cbiAgICAgICAgICAgICAgICB7IGxhYmVsIHx8IGluaXRpYWxWYWx1ZSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzaG93IHRoZSBjb250ZW50IGVkaXRhYmxlIGRpdiwgYnV0IG1hbnVhbGx5IG1hbmFnZSBpdHMgY29udGVudHMgYXMgcmVhY3QgYW5kIGNvbnRlbnRFZGl0YWJsZSBkb24ndCBwbGF5IG5pY2UgdG9nZXRoZXJcbiAgICAgICAgICAgIGVkaXRhYmxlRWwgPSA8ZGl2XG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLmVkaXRhYmxlRGl2fVxuICAgICAgICAgICAgICAgIGNvbnRlbnRFZGl0YWJsZT17dHJ1ZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgIG9uS2V5VXA9e3RoaXMub25LZXlVcH1cbiAgICAgICAgICAgICAgICBvbkZvY3VzPXt0aGlzLm9uRm9jdXN9XG4gICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uQmx1cn1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVkaXRhYmxlRWw7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7Ozs7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBT0tBLE07O1dBQUFBLE07RUFBQUEsTTtFQUFBQSxNO0dBQUFBLE0sS0FBQUEsTTs7QUF3QlUsTUFBTUMsWUFBTixTQUEyQkMsY0FBQSxDQUFNQyxTQUFqQyxDQUEyRDtFQUN0RTtFQUNBO0VBZ0JBQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1Qiw2Q0FmWixFQWVZO0lBQUEsbURBZEwsS0FjSztJQUFBLGdFQWJMLElBQUFDLGdCQUFBLEdBYUs7SUFBQSx1REEwQkFDLElBQUQsSUFBeUI7TUFDL0MsSUFBSUEsSUFBSixFQUFVO1FBQ04sS0FBS0MsV0FBTCxDQUFpQkMsT0FBakIsQ0FBeUJDLFdBQXpCLEdBQXVDLEtBQUtMLEtBQUwsQ0FBV00sV0FBbEQ7UUFDQSxLQUFLSCxXQUFMLENBQWlCQyxPQUFqQixDQUF5QkcsWUFBekIsQ0FBc0MsT0FBdEMsRUFBK0MsS0FBS1AsS0FBTCxDQUFXUSxTQUFYLEdBQ3pDLEdBRHlDLEdBQ25DLEtBQUtSLEtBQUwsQ0FBV1Msb0JBRHZCO1FBRUEsS0FBS0gsV0FBTCxHQUFtQixJQUFuQjtRQUNBLEtBQUtJLEtBQUwsR0FBYSxFQUFiO01BQ0gsQ0FORCxNQU1PO1FBQ0gsS0FBS1AsV0FBTCxDQUFpQkMsT0FBakIsQ0FBeUJDLFdBQXpCLEdBQXVDLEtBQUtLLEtBQTVDO1FBQ0EsS0FB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