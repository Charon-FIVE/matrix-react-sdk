"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _languageHandler = require("../../../languageHandler");

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
const BUTTONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const BUTTON_LETTERS = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ', '', '+', ''];
var DialPadButtonKind;

(function (DialPadButtonKind) {
  DialPadButtonKind[DialPadButtonKind["Digit"] = 0] = "Digit";
  DialPadButtonKind[DialPadButtonKind["Dial"] = 1] = "Dial";
})(DialPadButtonKind || (DialPadButtonKind = {}));

class DialPadButton extends React.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onClick", ev => {
      this.props.onButtonPress(this.props.digit, ev);
    });
  }

  render() {
    switch (this.props.kind) {
      case DialPadButtonKind.Digit:
        return /*#__PURE__*/React.createElement(_AccessibleButton.default, {
          className: "mx_DialPad_button",
          onClick: this.onClick
        }, this.props.digit, /*#__PURE__*/React.createElement("div", {
          className: "mx_DialPad_buttonSubText"
        }, this.props.digitSubtext));

      case DialPadButtonKind.Dial:
        return /*#__PURE__*/React.createElement(_AccessibleButton.default, {
          className: "mx_DialPad_button mx_DialPad_dialButton",
          onClick: this.onClick,
          "aria-label": (0, _languageHandler._t)("Dial")
        });
    }
  }

}

class Dialpad extends React.PureComponent {
  render() {
    const buttonNodes = [];

    for (let i = 0; i < BUTTONS.length; i++) {
      const button = BUTTONS[i];
      const digitSubtext = BUTTON_LETTERS[i];
      buttonNodes.push( /*#__PURE__*/React.createElement(DialPadButton, {
        key: button,
        kind: DialPadButtonKind.Digit,
        digit: button,
        digitSubtext: digitSubtext,
        onButtonPress: this.props.onDigitPress
      }));
    }

    if (this.props.hasDial) {
      buttonNodes.push( /*#__PURE__*/React.createElement(DialPadButton, {
        key: "dial",
        kind: DialPadButtonKind.Dial,
        onButtonPress: this.props.onDialPress
      }));
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPad"
    }, buttonNodes);
  }

}

exports.default = Dialpad;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCVVRUT05TIiwiQlVUVE9OX0xFVFRFUlMiLCJEaWFsUGFkQnV0dG9uS2luZCIsIkRpYWxQYWRCdXR0b24iLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJldiIsInByb3BzIiwib25CdXR0b25QcmVzcyIsImRpZ2l0IiwicmVuZGVyIiwia2luZCIsIkRpZ2l0Iiwib25DbGljayIsImRpZ2l0U3VidGV4dCIsIkRpYWwiLCJfdCIsIkRpYWxwYWQiLCJidXR0b25Ob2RlcyIsImkiLCJsZW5ndGgiLCJidXR0b24iLCJwdXNoIiwib25EaWdpdFByZXNzIiwiaGFzRGlhbCIsIm9uRGlhbFByZXNzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvdm9pcC9EaWFsUGFkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5cbmNvbnN0IEJVVFRPTlMgPSBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJyonLCAnMCcsICcjJ107XG5jb25zdCBCVVRUT05fTEVUVEVSUyA9IFsnJywgJ0FCQycsICdERUYnLCAnR0hJJywgJ0pLTCcsICdNTk8nLCAnUFFSUycsICdUVVYnLCAnV1hZWicsICcnLCAnKycsICcnXTtcblxuZW51bSBEaWFsUGFkQnV0dG9uS2luZCB7XG4gICAgRGlnaXQsXG4gICAgRGlhbCxcbn1cblxuaW50ZXJmYWNlIElCdXR0b25Qcm9wcyB7XG4gICAga2luZDogRGlhbFBhZEJ1dHRvbktpbmQ7XG4gICAgZGlnaXQ/OiBzdHJpbmc7XG4gICAgZGlnaXRTdWJ0ZXh0Pzogc3RyaW5nO1xuICAgIG9uQnV0dG9uUHJlc3M6IChkaWdpdDogc3RyaW5nLCBldjogQnV0dG9uRXZlbnQpID0+IHZvaWQ7XG59XG5cbmNsYXNzIERpYWxQYWRCdXR0b24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElCdXR0b25Qcm9wcz4ge1xuICAgIG9uQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25CdXR0b25QcmVzcyh0aGlzLnByb3BzLmRpZ2l0LCBldik7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnByb3BzLmtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgRGlhbFBhZEJ1dHRvbktpbmQuRGlnaXQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0RpYWxQYWRfYnV0dG9uXCIgb25DbGljaz17dGhpcy5vbkNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmRpZ2l0IH1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkX2J1dHRvblN1YlRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5kaWdpdFN1YnRleHQgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICAgICAgY2FzZSBEaWFsUGFkQnV0dG9uS2luZC5EaWFsOlxuICAgICAgICAgICAgICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9EaWFsUGFkX2J1dHRvbiBteF9EaWFsUGFkX2RpYWxCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiRGlhbFwiKX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgb25EaWdpdFByZXNzOiAoZGlnaXQ6IHN0cmluZywgZXY6IEJ1dHRvbkV2ZW50KSA9PiB2b2lkO1xuICAgIGhhc0RpYWw6IGJvb2xlYW47XG4gICAgb25EZWxldGVQcmVzcz86IChldjogQnV0dG9uRXZlbnQpID0+IHZvaWQ7XG4gICAgb25EaWFsUHJlc3M/OiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWFscGFkIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbk5vZGVzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBCVVRUT05TLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBCVVRUT05TW2ldO1xuICAgICAgICAgICAgY29uc3QgZGlnaXRTdWJ0ZXh0ID0gQlVUVE9OX0xFVFRFUlNbaV07XG4gICAgICAgICAgICBidXR0b25Ob2Rlcy5wdXNoKDxEaWFsUGFkQnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXtidXR0b259XG4gICAgICAgICAgICAgICAga2luZD17RGlhbFBhZEJ1dHRvbktpbmQuRGlnaXR9XG4gICAgICAgICAgICAgICAgZGlnaXQ9e2J1dHRvbn1cbiAgICAgICAgICAgICAgICBkaWdpdFN1YnRleHQ9e2RpZ2l0U3VidGV4dH1cbiAgICAgICAgICAgICAgICBvbkJ1dHRvblByZXNzPXt0aGlzLnByb3BzLm9uRGlnaXRQcmVzc31cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmhhc0RpYWwpIHtcbiAgICAgICAgICAgIGJ1dHRvbk5vZGVzLnB1c2goPERpYWxQYWRCdXR0b25cbiAgICAgICAgICAgICAgICBrZXk9XCJkaWFsXCJcbiAgICAgICAgICAgICAgICBraW5kPXtEaWFsUGFkQnV0dG9uS2luZC5EaWFsfVxuICAgICAgICAgICAgICAgIG9uQnV0dG9uUHJlc3M9e3RoaXMucHJvcHMub25EaWFsUHJlc3N9XG4gICAgICAgICAgICAvPik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkXCI+XG4gICAgICAgICAgICB7IGJ1dHRvbk5vZGVzIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7Ozs7OztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQSxNQUFNQSxPQUFPLEdBQUcsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsRUFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0QsR0FBeEQsQ0FBaEI7QUFDQSxNQUFNQyxjQUFjLEdBQUcsQ0FBQyxFQUFELEVBQUssS0FBTCxFQUFZLEtBQVosRUFBbUIsS0FBbkIsRUFBMEIsS0FBMUIsRUFBaUMsS0FBakMsRUFBd0MsTUFBeEMsRUFBZ0QsS0FBaEQsRUFBdUQsTUFBdkQsRUFBK0QsRUFBL0QsRUFBbUUsR0FBbkUsRUFBd0UsRUFBeEUsQ0FBdkI7SUFFS0MsaUI7O1dBQUFBLGlCO0VBQUFBLGlCLENBQUFBLGlCO0VBQUFBLGlCLENBQUFBLGlCO0dBQUFBLGlCLEtBQUFBLGlCOztBQVlMLE1BQU1DLGFBQU4sU0FBNEJDLEtBQUssQ0FBQ0MsYUFBbEMsQ0FBOEQ7RUFBQTtJQUFBO0lBQUEsK0NBQy9DQyxFQUFELElBQXFCO01BQzNCLEtBQUtDLEtBQUwsQ0FBV0MsYUFBWCxDQUF5QixLQUFLRCxLQUFMLENBQVdFLEtBQXBDLEVBQTJDSCxFQUEzQztJQUNILENBSHlEO0VBQUE7O0VBSzFESSxNQUFNLEdBQUc7SUFDTCxRQUFRLEtBQUtILEtBQUwsQ0FBV0ksSUFBbkI7TUFDSSxLQUFLVCxpQkFBaUIsQ0FBQ1UsS0FBdkI7UUFDSSxvQkFBTyxvQkFBQyx5QkFBRDtVQUFrQixTQUFTLEVBQUMsbUJBQTVCO1VBQWdELE9BQU8sRUFBRSxLQUFLQztRQUE5RCxHQUNELEtBQUtOLEtBQUwsQ0FBV0UsS0FEVixlQUVIO1VBQUssU0FBUyxFQUFDO1FBQWYsR0FDTSxLQUFLRixLQUFMLENBQVdPLFlBRGpCLENBRkcsQ0FBUDs7TUFNSixLQUFLWixpQkFBaUIsQ0FBQ2EsSUFBdkI7UUFDSSxvQkFBTyxvQkFBQyx5QkFBRDtVQUNILFNBQVMsRUFBQyx5Q0FEUDtVQUVILE9BQU8sRUFBRSxLQUFLRixPQUZYO1VBR0gsY0FBWSxJQUFBRyxtQkFBQSxFQUFHLE1BQUg7UUFIVCxFQUFQO0lBVFI7RUFlSDs7QUFyQnlEOztBQStCL0MsTUFBTUMsT0FBTixTQUFzQmIsS0FBSyxDQUFDQyxhQUE1QixDQUFrRDtFQUM3REssTUFBTSxHQUFHO0lBQ0wsTUFBTVEsV0FBVyxHQUFHLEVBQXBCOztJQUVBLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR25CLE9BQU8sQ0FBQ29CLE1BQTVCLEVBQW9DRCxDQUFDLEVBQXJDLEVBQXlDO01BQ3JDLE1BQU1FLE1BQU0sR0FBR3JCLE9BQU8sQ0FBQ21CLENBQUQsQ0FBdEI7TUFDQSxNQUFNTCxZQUFZLEdBQUdiLGNBQWMsQ0FBQ2tCLENBQUQsQ0FBbkM7TUFDQUQsV0FBVyxDQUFDSSxJQUFaLGVBQWlCLG9CQUFDLGFBQUQ7UUFDYixHQUFHLEVBQUVELE1BRFE7UUFFYixJQUFJLEVBQUVuQixpQkFBaUIsQ0FBQ1UsS0FGWDtRQUdiLEtBQUssRUFBRVMsTUFITTtRQUliLFlBQVksRUFBRVAsWUFKRDtRQUtiLGFBQWEsRUFBRSxLQUFLUCxLQUFMLENBQVdnQjtNQUxiLEVBQWpCO0lBT0g7O0lBRUQsSUFBSSxLQUFLaEIsS0FBTCxDQUFXaUIsT0FBZixFQUF3QjtNQUNwQk4sV0FBVyxDQUFDSSxJQUFaLGVBQWlCLG9CQUFDLGFBQUQ7UUFDYixHQUFHLEVBQUMsTUFEUztRQUViLElBQUksRUFBRXBCLGlCQUFpQixDQUFDYSxJQUZYO1FBR2IsYUFBYSxFQUFFLEtBQUtSLEtBQUwsQ0FBV2tCO01BSGIsRUFBakI7SUFLSDs7SUFFRCxvQkFBTztNQUFLLFNBQVMsRUFBQztJQUFmLEdBQ0RQLFdBREMsQ0FBUDtFQUdIOztBQTNCNEQifQ==