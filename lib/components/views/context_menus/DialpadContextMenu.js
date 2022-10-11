"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _ContextMenu = _interopRequireDefault(require("../../structures/ContextMenu"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _DialPad = _interopRequireDefault(require("../voip/DialPad"));

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
class DialpadContextMenu extends React.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "numberEntryFieldRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "onDigitPress", (digit, ev) => {
      this.props.call.sendDtmfDigit(digit);
      this.setState({
        value: this.state.value + digit
      }); // Keep the number field focused so that keyboard entry is still available
      // However, don't focus if this wasn't the result of directly clicking on the button,
      // i.e someone using keyboard navigation.

      if (ev.type === "click") {
        this.numberEntryFieldRef.current?.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      // Prevent Backspace and Delete keys from functioning in the entry field
      if (ev.code === "Backspace" || ev.code === "Delete") {
        ev.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onChange", ev => {
      this.setState({
        value: ev.target.value
      });
    });
    this.state = {
      value: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement(_ContextMenu.default, this.props, /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadContextMenuWrapper"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(_AccessibleButton.default, {
      className: "mx_DialPadContextMenu_cancel",
      onClick: this.onCancelClick
    })), /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadContextMenu_header"
    }, /*#__PURE__*/React.createElement(_Field.default, {
      ref: this.numberEntryFieldRef,
      className: "mx_DialPadContextMenu_dialled",
      value: this.state.value,
      autoFocus: true,
      onKeyDown: this.onKeyDown,
      onChange: this.onChange
    })), /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadContextMenu_dialPad"
    }, /*#__PURE__*/React.createElement(_DialPad.default, {
      onDigitPress: this.onDigitPress,
      hasDial: false
    }))));
  }

}

exports.default = DialpadContextMenu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaWFscGFkQ29udGV4dE1lbnUiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJkaWdpdCIsImV2IiwiY2FsbCIsInNlbmREdG1mRGlnaXQiLCJzZXRTdGF0ZSIsInZhbHVlIiwic3RhdGUiLCJ0eXBlIiwibnVtYmVyRW50cnlGaWVsZFJlZiIsImN1cnJlbnQiLCJmb2N1cyIsIm9uRmluaXNoZWQiLCJjb2RlIiwicHJldmVudERlZmF1bHQiLCJ0YXJnZXQiLCJyZW5kZXIiLCJvbkNhbmNlbENsaWNrIiwib25LZXlEb3duIiwib25DaGFuZ2UiLCJvbkRpZ2l0UHJlc3MiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9jb250ZXh0X21lbnVzL0RpYWxwYWRDb250ZXh0TWVudS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBjcmVhdGVSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IE1hdHJpeENhbGwgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5cbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uLCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBDb250ZXh0TWVudSwgeyBJUHJvcHMgYXMgSUNvbnRleHRNZW51UHJvcHMgfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51JztcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBEaWFsUGFkIGZyb20gJy4uL3ZvaXAvRGlhbFBhZCc7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJQ29udGV4dE1lbnVQcm9wcyB7XG4gICAgY2FsbDogTWF0cml4Q2FsbDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdmFsdWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhbHBhZENvbnRleHRNZW51IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBudW1iZXJFbnRyeUZpZWxkUmVmOiBSZWFjdC5SZWZPYmplY3Q8RmllbGQ+ID0gY3JlYXRlUmVmKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbkRpZ2l0UHJlc3MgPSAoZGlnaXQ6IHN0cmluZywgZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMuY2FsbC5zZW5kRHRtZkRpZ2l0KGRpZ2l0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlICsgZGlnaXQgfSk7XG5cbiAgICAgICAgLy8gS2VlcCB0aGUgbnVtYmVyIGZpZWxkIGZvY3VzZWQgc28gdGhhdCBrZXlib2FyZCBlbnRyeSBpcyBzdGlsbCBhdmFpbGFibGVcbiAgICAgICAgLy8gSG93ZXZlciwgZG9uJ3QgZm9jdXMgaWYgdGhpcyB3YXNuJ3QgdGhlIHJlc3VsdCBvZiBkaXJlY3RseSBjbGlja2luZyBvbiB0aGUgYnV0dG9uLFxuICAgICAgICAvLyBpLmUgc29tZW9uZSB1c2luZyBrZXlib2FyZCBuYXZpZ2F0aW9uLlxuICAgICAgICBpZiAoZXYudHlwZSA9PT0gXCJjbGlja1wiKSB7XG4gICAgICAgICAgICB0aGlzLm51bWJlckVudHJ5RmllbGRSZWYuY3VycmVudD8uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbkNhbmNlbENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9O1xuXG4gICAgb25LZXlEb3duID0gKGV2KSA9PiB7XG4gICAgICAgIC8vIFByZXZlbnQgQmFja3NwYWNlIGFuZCBEZWxldGUga2V5cyBmcm9tIGZ1bmN0aW9uaW5nIGluIHRoZSBlbnRyeSBmaWVsZFxuICAgICAgICBpZiAoZXYuY29kZSA9PT0gXCJCYWNrc3BhY2VcIiB8fCBldi5jb2RlID09PSBcIkRlbGV0ZVwiKSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uQ2hhbmdlID0gKGV2KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogZXYudGFyZ2V0LnZhbHVlIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8Q29udGV4dE1lbnUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkQ29udGV4dE1lbnVXcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfRGlhbFBhZENvbnRleHRNZW51X2NhbmNlbFwiIG9uQ2xpY2s9e3RoaXMub25DYW5jZWxDbGlja30gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxQYWRDb250ZXh0TWVudV9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMubnVtYmVyRW50cnlGaWVsZFJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RpYWxQYWRDb250ZXh0TWVudV9kaWFsbGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbFBhZENvbnRleHRNZW51X2RpYWxQYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgPERpYWxQYWQgb25EaWdpdFByZXNzPXt0aGlzLm9uRGlnaXRQcmVzc30gaGFzRGlhbD17ZmFsc2V9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9Db250ZXh0TWVudT47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW1CZSxNQUFNQSxrQkFBTixTQUFpQ0MsS0FBSyxDQUFDQyxTQUF2QyxDQUFpRTtFQUc1RUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsd0VBRm1DLElBQUFDLGVBQUEsR0FFbkM7SUFBQSxvREFRSixDQUFDQyxLQUFELEVBQWdCQyxFQUFoQixLQUFvQztNQUMvQyxLQUFLSCxLQUFMLENBQVdJLElBQVgsQ0FBZ0JDLGFBQWhCLENBQThCSCxLQUE5QjtNQUNBLEtBQUtJLFFBQUwsQ0FBYztRQUFFQyxLQUFLLEVBQUUsS0FBS0MsS0FBTCxDQUFXRCxLQUFYLEdBQW1CTDtNQUE1QixDQUFkLEVBRitDLENBSS9DO01BQ0E7TUFDQTs7TUFDQSxJQUFJQyxFQUFFLENBQUNNLElBQUgsS0FBWSxPQUFoQixFQUF5QjtRQUNyQixLQUFLQyxtQkFBTCxDQUF5QkMsT0FBekIsRUFBa0NDLEtBQWxDO01BQ0g7SUFDSixDQWxCa0I7SUFBQSxxREFvQkgsTUFBTTtNQUNsQixLQUFLWixLQUFMLENBQVdhLFVBQVg7SUFDSCxDQXRCa0I7SUFBQSxpREF3Qk5WLEVBQUQsSUFBUTtNQUNoQjtNQUNBLElBQUlBLEVBQUUsQ0FBQ1csSUFBSCxLQUFZLFdBQVosSUFBMkJYLEVBQUUsQ0FBQ1csSUFBSCxLQUFZLFFBQTNDLEVBQXFEO1FBQ2pEWCxFQUFFLENBQUNZLGNBQUg7TUFDSDtJQUNKLENBN0JrQjtJQUFBLGdEQStCUFosRUFBRCxJQUFRO01BQ2YsS0FBS0csUUFBTCxDQUFjO1FBQUVDLEtBQUssRUFBRUosRUFBRSxDQUFDYSxNQUFILENBQVVUO01BQW5CLENBQWQ7SUFDSCxDQWpDa0I7SUFHZixLQUFLQyxLQUFMLEdBQWE7TUFDVEQsS0FBSyxFQUFFO0lBREUsQ0FBYjtFQUdIOztFQTZCRFUsTUFBTSxHQUFHO0lBQ0wsb0JBQU8sb0JBQUMsb0JBQUQsRUFBaUIsS0FBS2pCLEtBQXRCLGVBQ0g7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSSw4Q0FDSSxvQkFBQyx5QkFBRDtNQUFrQixTQUFTLEVBQUMsOEJBQTVCO01BQTJELE9BQU8sRUFBRSxLQUFLa0I7SUFBekUsRUFESixDQURKLGVBSUk7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSSxvQkFBQyxjQUFEO01BQ0ksR0FBRyxFQUFFLEtBQUtSLG1CQURkO01BRUksU0FBUyxFQUFDLCtCQUZkO01BR0ksS0FBSyxFQUFFLEtBQUtGLEtBQUwsQ0FBV0QsS0FIdEI7TUFJSSxTQUFTLEVBQUUsSUFKZjtNQUtJLFNBQVMsRUFBRSxLQUFLWSxTQUxwQjtNQU1JLFFBQVEsRUFBRSxLQUFLQztJQU5uQixFQURKLENBSkosZUFjSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJLG9CQUFDLGdCQUFEO01BQVMsWUFBWSxFQUFFLEtBQUtDLFlBQTVCO01BQTBDLE9BQU8sRUFBRTtJQUFuRCxFQURKLENBZEosQ0FERyxDQUFQO0VBb0JIOztBQTNEMkUifQ==