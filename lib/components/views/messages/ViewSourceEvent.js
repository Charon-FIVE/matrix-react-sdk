"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _classnames = _interopRequireDefault(require("classnames"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class ViewSourceEvent extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onToggle", ev => {
      ev.preventDefault();
      const {
        expanded
      } = this.state;
      this.setState({
        expanded: !expanded
      });
    });
    this.state = {
      expanded: false
    };
  }

  componentDidMount() {
    const {
      mxEvent
    } = this.props;

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    client.decryptEventIfNeeded(mxEvent);

    if (mxEvent.isBeingDecrypted()) {
      mxEvent.once(_matrix.MatrixEventEvent.Decrypted, () => this.forceUpdate());
    }
  }

  render() {
    const {
      mxEvent
    } = this.props;
    const {
      expanded
    } = this.state;
    let content;

    if (expanded) {
      content = /*#__PURE__*/_react.default.createElement("pre", null, JSON.stringify(mxEvent, null, 4));
    } else {
      content = /*#__PURE__*/_react.default.createElement("code", null, `{ "type": ${mxEvent.getType()} }`);
    }

    const classes = (0, _classnames.default)("mx_ViewSourceEvent mx_EventTile_content", {
      mx_ViewSourceEvent_expanded: expanded
    });
    return /*#__PURE__*/_react.default.createElement("span", {
      className: classes
    }, content, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      title: (0, _languageHandler._t)('toggle event'),
      className: "mx_ViewSourceEvent_toggle",
      onClick: this.onToggle
    }));
  }

}

exports.default = ViewSourceEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaWV3U291cmNlRXZlbnQiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsImV4cGFuZGVkIiwic3RhdGUiLCJzZXRTdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwibXhFdmVudCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImRlY3J5cHRFdmVudElmTmVlZGVkIiwiaXNCZWluZ0RlY3J5cHRlZCIsIm9uY2UiLCJNYXRyaXhFdmVudEV2ZW50IiwiRGVjcnlwdGVkIiwiZm9yY2VVcGRhdGUiLCJyZW5kZXIiLCJjb250ZW50IiwiSlNPTiIsInN0cmluZ2lmeSIsImdldFR5cGUiLCJjbGFzc2VzIiwiY2xhc3NOYW1lcyIsIm14X1ZpZXdTb3VyY2VFdmVudF9leHBhbmRlZCIsIl90Iiwib25Ub2dnbGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9WaWV3U291cmNlRXZlbnQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCwgTWF0cml4RXZlbnRFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBleHBhbmRlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlld1NvdXJjZUV2ZW50IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXhwYW5kZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBteEV2ZW50IH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY2xpZW50LmRlY3J5cHRFdmVudElmTmVlZGVkKG14RXZlbnQpO1xuXG4gICAgICAgIGlmIChteEV2ZW50LmlzQmVpbmdEZWNyeXB0ZWQoKSkge1xuICAgICAgICAgICAgbXhFdmVudC5vbmNlKE1hdHJpeEV2ZW50RXZlbnQuRGVjcnlwdGVkLCAoKSA9PiB0aGlzLmZvcmNlVXBkYXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblRvZ2dsZSA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB7IGV4cGFuZGVkIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGV4cGFuZGVkOiAhZXhwYW5kZWQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IHsgbXhFdmVudCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgeyBleHBhbmRlZCB9ID0gdGhpcy5zdGF0ZTtcblxuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgaWYgKGV4cGFuZGVkKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPHByZT57IEpTT04uc3RyaW5naWZ5KG14RXZlbnQsIG51bGwsIDQpIH08L3ByZT47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPGNvZGU+eyBgeyBcInR5cGVcIjogJHtteEV2ZW50LmdldFR5cGUoKX0gfWAgfTwvY29kZT47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1ZpZXdTb3VyY2VFdmVudCBteF9FdmVudFRpbGVfY29udGVudFwiLCB7XG4gICAgICAgICAgICBteF9WaWV3U291cmNlRXZlbnRfZXhwYW5kZWQ6IGV4cGFuZGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9J2xpbmsnXG4gICAgICAgICAgICAgICAgdGl0bGU9e190KCd0b2dnbGUgZXZlbnQnKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9WaWV3U291cmNlRXZlbnRfdG9nZ2xlXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uVG9nZ2xlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9zcGFuPjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFrQmUsTUFBTUEsZUFBTixTQUE4QkMsY0FBQSxDQUFNQyxhQUFwQyxDQUFrRTtFQUM3RUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsZ0RBbUJDQyxFQUFELElBQTBCO01BQ3pDQSxFQUFFLENBQUNDLGNBQUg7TUFDQSxNQUFNO1FBQUVDO01BQUYsSUFBZSxLQUFLQyxLQUExQjtNQUNBLEtBQUtDLFFBQUwsQ0FBYztRQUNWRixRQUFRLEVBQUUsQ0FBQ0E7TUFERCxDQUFkO0lBR0gsQ0F6QmtCO0lBR2YsS0FBS0MsS0FBTCxHQUFhO01BQ1RELFFBQVEsRUFBRTtJQURELENBQWI7RUFHSDs7RUFFTUcsaUJBQWlCLEdBQVM7SUFDN0IsTUFBTTtNQUFFQztJQUFGLElBQWMsS0FBS1AsS0FBekI7O0lBRUEsTUFBTVEsTUFBTSxHQUFHQyxnQ0FBQSxDQUFnQkMsR0FBaEIsRUFBZjs7SUFDQUYsTUFBTSxDQUFDRyxvQkFBUCxDQUE0QkosT0FBNUI7O0lBRUEsSUFBSUEsT0FBTyxDQUFDSyxnQkFBUixFQUFKLEVBQWdDO01BQzVCTCxPQUFPLENBQUNNLElBQVIsQ0FBYUMsd0JBQUEsQ0FBaUJDLFNBQTlCLEVBQXlDLE1BQU0sS0FBS0MsV0FBTCxFQUEvQztJQUNIO0VBQ0o7O0VBVU1DLE1BQU0sR0FBb0I7SUFDN0IsTUFBTTtNQUFFVjtJQUFGLElBQWMsS0FBS1AsS0FBekI7SUFDQSxNQUFNO01BQUVHO0lBQUYsSUFBZSxLQUFLQyxLQUExQjtJQUVBLElBQUljLE9BQUo7O0lBQ0EsSUFBSWYsUUFBSixFQUFjO01BQ1ZlLE9BQU8sZ0JBQUcsMENBQU9DLElBQUksQ0FBQ0MsU0FBTCxDQUFlYixPQUFmLEVBQXdCLElBQXhCLEVBQThCLENBQTlCLENBQVAsQ0FBVjtJQUNILENBRkQsTUFFTztNQUNIVyxPQUFPLGdCQUFHLDJDQUFTLGFBQVlYLE9BQU8sQ0FBQ2MsT0FBUixFQUFrQixJQUF2QyxDQUFWO0lBQ0g7O0lBRUQsTUFBTUMsT0FBTyxHQUFHLElBQUFDLG1CQUFBLEVBQVcseUNBQVgsRUFBc0Q7TUFDbEVDLDJCQUEyQixFQUFFckI7SUFEcUMsQ0FBdEQsQ0FBaEI7SUFJQSxvQkFBTztNQUFNLFNBQVMsRUFBRW1CO0lBQWpCLEdBQ0RKLE9BREMsZUFFSCw2QkFBQyx5QkFBRDtNQUNJLElBQUksRUFBQyxNQURUO01BRUksS0FBSyxFQUFFLElBQUFPLG1CQUFBLEVBQUcsY0FBSCxDQUZYO01BR0ksU0FBUyxFQUFDLDJCQUhkO01BSUksT0FBTyxFQUFFLEtBQUtDO0lBSmxCLEVBRkcsQ0FBUDtFQVNIOztBQXBENEUifQ==