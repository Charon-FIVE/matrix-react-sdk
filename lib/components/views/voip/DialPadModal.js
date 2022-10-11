"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _DialPad = _interopRequireDefault(require("./DialPad"));

var _DialPadBackspaceButton = _interopRequireDefault(require("../elements/DialPadBackspaceButton"));

var _LegacyCallHandler = _interopRequireDefault(require("../../../LegacyCallHandler"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
class DialpadModal extends React.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "numberEntryFieldRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onChange", ev => {
      this.setState({
        value: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onFormSubmit", ev => {
      ev.preventDefault();
      this.onDialPress();
    });
    (0, _defineProperty2.default)(this, "onDigitPress", (digit, ev) => {
      this.setState({
        value: this.state.value + digit
      }); // Keep the number field focused so that keyboard entry is still available.
      // However, don't focus if this wasn't the result of directly clicking on the button,
      // i.e someone using keyboard navigation.

      if (ev.type === "click") {
        this.numberEntryFieldRef.current?.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onDeletePress", ev => {
      if (this.state.value.length === 0) return;
      this.setState({
        value: this.state.value.slice(0, -1)
      }); // Keep the number field focused so that keyboard entry is still available
      // However, don't focus if this wasn't the result of directly clicking on the button,
      // i.e someone using keyboard navigation.

      if (ev.type === "click") {
        this.numberEntryFieldRef.current?.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onDialPress", async () => {
      _LegacyCallHandler.default.instance.dialNumber(this.state.value);

      this.props.onFinished(true);
    });
    this.state = {
      value: ''
    };
  }

  render() {
    const backspaceButton = /*#__PURE__*/React.createElement(_DialPadBackspaceButton.default, {
      onBackspacePress: this.onDeletePress
    }); // Only show the backspace button if the field has content

    let dialPadField;

    if (this.state.value.length !== 0) {
      dialPadField = /*#__PURE__*/React.createElement(_Field.default, {
        ref: this.numberEntryFieldRef,
        className: "mx_DialPadModal_field",
        id: "dialpad_number",
        value: this.state.value,
        autoFocus: true,
        onChange: this.onChange,
        postfixComponent: backspaceButton
      });
    } else {
      dialPadField = /*#__PURE__*/React.createElement(_Field.default, {
        ref: this.numberEntryFieldRef,
        className: "mx_DialPadModal_field",
        id: "dialpad_number",
        value: this.state.value,
        autoFocus: true,
        onChange: this.onChange
      });
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadModal"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(_AccessibleButton.default, {
      className: "mx_DialPadModal_cancel",
      onClick: this.onCancelClick
    })), /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadModal_header"
    }, /*#__PURE__*/React.createElement("form", {
      onSubmit: this.onFormSubmit
    }, dialPadField)), /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadModal_dialPad"
    }, /*#__PURE__*/React.createElement(_DialPad.default, {
      hasDial: true,
      onDigitPress: this.onDigitPress,
      onDeletePress: this.onDeletePress,
      onDialPress: this.onDialPress
    })));
  }

}

exports.default = DialpadModal;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaWFscGFkTW9kYWwiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwib25GaW5pc2hlZCIsImV2Iiwic2V0U3RhdGUiLCJ2YWx1ZSIsInRhcmdldCIsInByZXZlbnREZWZhdWx0Iiwib25EaWFsUHJlc3MiLCJkaWdpdCIsInN0YXRlIiwidHlwZSIsIm51bWJlckVudHJ5RmllbGRSZWYiLCJjdXJyZW50IiwiZm9jdXMiLCJsZW5ndGgiLCJzbGljZSIsIkxlZ2FjeUNhbGxIYW5kbGVyIiwiaW5zdGFuY2UiLCJkaWFsTnVtYmVyIiwicmVuZGVyIiwiYmFja3NwYWNlQnV0dG9uIiwib25EZWxldGVQcmVzcyIsImRpYWxQYWRGaWVsZCIsIm9uQ2hhbmdlIiwib25DYW5jZWxDbGljayIsIm9uRm9ybVN1Ym1pdCIsIm9uRGlnaXRQcmVzcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvRGlhbFBhZE1vZGFsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGNyZWF0ZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiwgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgRGlhbFBhZCBmcm9tICcuL0RpYWxQYWQnO1xuaW1wb3J0IERpYWxQYWRCYWNrc3BhY2VCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0RpYWxQYWRCYWNrc3BhY2VCdXR0b25cIjtcbmltcG9ydCBMZWdhY3lDYWxsSGFuZGxlciBmcm9tIFwiLi4vLi4vLi4vTGVnYWN5Q2FsbEhhbmRsZXJcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgb25GaW5pc2hlZDogKGJvb2xlYW4pID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHZhbHVlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpYWxwYWRNb2RhbCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIG51bWJlckVudHJ5RmllbGRSZWY6IFJlYWN0LlJlZk9iamVjdDxGaWVsZD4gPSBjcmVhdGVSZWYoKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbkNhbmNlbENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBvbkNoYW5nZSA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IGV2LnRhcmdldC52YWx1ZSB9KTtcbiAgICB9O1xuXG4gICAgb25Gb3JtU3VibWl0ID0gKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMub25EaWFsUHJlc3MoKTtcbiAgICB9O1xuXG4gICAgb25EaWdpdFByZXNzID0gKGRpZ2l0OiBzdHJpbmcsIGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUgKyBkaWdpdCB9KTtcblxuICAgICAgICAvLyBLZWVwIHRoZSBudW1iZXIgZmllbGQgZm9jdXNlZCBzbyB0aGF0IGtleWJvYXJkIGVudHJ5IGlzIHN0aWxsIGF2YWlsYWJsZS5cbiAgICAgICAgLy8gSG93ZXZlciwgZG9uJ3QgZm9jdXMgaWYgdGhpcyB3YXNuJ3QgdGhlIHJlc3VsdCBvZiBkaXJlY3RseSBjbGlja2luZyBvbiB0aGUgYnV0dG9uLFxuICAgICAgICAvLyBpLmUgc29tZW9uZSB1c2luZyBrZXlib2FyZCBuYXZpZ2F0aW9uLlxuICAgICAgICBpZiAoZXYudHlwZSA9PT0gXCJjbGlja1wiKSB7XG4gICAgICAgICAgICB0aGlzLm51bWJlckVudHJ5RmllbGRSZWYuY3VycmVudD8uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbkRlbGV0ZVByZXNzID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZS5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLnNsaWNlKDAsIC0xKSB9KTtcblxuICAgICAgICAvLyBLZWVwIHRoZSBudW1iZXIgZmllbGQgZm9jdXNlZCBzbyB0aGF0IGtleWJvYXJkIGVudHJ5IGlzIHN0aWxsIGF2YWlsYWJsZVxuICAgICAgICAvLyBIb3dldmVyLCBkb24ndCBmb2N1cyBpZiB0aGlzIHdhc24ndCB0aGUgcmVzdWx0IG9mIGRpcmVjdGx5IGNsaWNraW5nIG9uIHRoZSBidXR0b24sXG4gICAgICAgIC8vIGkuZSBzb21lb25lIHVzaW5nIGtleWJvYXJkIG5hdmlnYXRpb24uXG4gICAgICAgIGlmIChldi50eXBlID09PSBcImNsaWNrXCIpIHtcbiAgICAgICAgICAgIHRoaXMubnVtYmVyRW50cnlGaWVsZFJlZi5jdXJyZW50Py5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uRGlhbFByZXNzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5kaWFsTnVtYmVyKHRoaXMuc3RhdGUudmFsdWUpO1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYmFja3NwYWNlQnV0dG9uID0gKFxuICAgICAgICAgICAgPERpYWxQYWRCYWNrc3BhY2VCdXR0b24gb25CYWNrc3BhY2VQcmVzcz17dGhpcy5vbkRlbGV0ZVByZXNzfSAvPlxuICAgICAgICApO1xuXG4gICAgICAgIC8vIE9ubHkgc2hvdyB0aGUgYmFja3NwYWNlIGJ1dHRvbiBpZiB0aGUgZmllbGQgaGFzIGNvbnRlbnRcbiAgICAgICAgbGV0IGRpYWxQYWRGaWVsZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmFsdWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICBkaWFsUGFkRmllbGQgPSA8RmllbGRcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMubnVtYmVyRW50cnlGaWVsZFJlZn1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfZmllbGRcIlxuICAgICAgICAgICAgICAgIGlkPVwiZGlhbHBhZF9udW1iZXJcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfVxuICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICBwb3N0Zml4Q29tcG9uZW50PXtiYWNrc3BhY2VCdXR0b259XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpYWxQYWRGaWVsZCA9IDxGaWVsZFxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5udW1iZXJFbnRyeUZpZWxkUmVmfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RpYWxQYWRNb2RhbF9maWVsZFwiXG4gICAgICAgICAgICAgICAgaWQ9XCJkaWFscGFkX251bWJlclwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9XG4gICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfRGlhbFBhZE1vZGFsX2NhbmNlbFwiIG9uQ2xpY2s9e3RoaXMub25DYW5jZWxDbGlja30gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25Gb3JtU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgeyBkaWFsUGFkRmllbGQgfVxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfZGlhbFBhZFwiPlxuICAgICAgICAgICAgICAgIDxEaWFsUGFkIGhhc0RpYWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIG9uRGlnaXRQcmVzcz17dGhpcy5vbkRpZ2l0UHJlc3N9XG4gICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlUHJlc3M9e3RoaXMub25EZWxldGVQcmVzc31cbiAgICAgICAgICAgICAgICAgICAgb25EaWFsUHJlc3M9e3RoaXMub25EaWFsUHJlc3N9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW1CZSxNQUFNQSxZQUFOLFNBQTJCQyxLQUFLLENBQUNDLGFBQWpDLENBQStEO0VBRzFFQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZSx3RUFGbUMsSUFBQUMsZUFBQSxHQUVuQztJQUFBLHFEQU9ILE1BQU07TUFDbEIsS0FBS0QsS0FBTCxDQUFXRSxVQUFYLENBQXNCLEtBQXRCO0lBQ0gsQ0FUa0I7SUFBQSxnREFXUEMsRUFBRCxJQUFRO01BQ2YsS0FBS0MsUUFBTCxDQUFjO1FBQUVDLEtBQUssRUFBRUYsRUFBRSxDQUFDRyxNQUFILENBQVVEO01BQW5CLENBQWQ7SUFDSCxDQWJrQjtJQUFBLG9EQWVIRixFQUFELElBQVE7TUFD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