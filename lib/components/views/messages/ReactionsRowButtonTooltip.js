"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _HtmlUtils = require("../../../HtmlUtils");

var _languageHandler = require("../../../languageHandler");

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _Tooltip = _interopRequireDefault(require("../elements/Tooltip"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
class ReactionsRowButtonTooltip extends _react.default.PureComponent {
  render() {
    const {
      content,
      reactionEvents,
      mxEvent,
      visible
    } = this.props;
    const room = this.context.getRoom(mxEvent.getRoomId());
    let tooltipLabel;

    if (room) {
      const senders = [];

      for (const reactionEvent of reactionEvents) {
        const member = room.getMember(reactionEvent.getSender());
        const name = member ? member.name : reactionEvent.getSender();
        senders.push(name);
      }

      const shortName = (0, _HtmlUtils.unicodeToShortcode)(content);
      tooltipLabel = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("<reactors/><reactedWith>reacted with %(shortName)s</reactedWith>", {
        shortName
      }, {
        reactors: () => {
          return /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_Tooltip_title"
          }, (0, _FormattingUtils.formatCommaSeparatedList)(senders, 6));
        },
        reactedWith: sub => {
          if (!shortName) {
            return null;
          }

          return /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_Tooltip_sub"
          }, sub);
        }
      }));
    }

    let tooltip;

    if (tooltipLabel) {
      tooltip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
        visible: visible,
        label: tooltipLabel
      });
    }

    return tooltip;
  }

}

exports.default = ReactionsRowButtonTooltip;
(0, _defineProperty2.default)(ReactionsRowButtonTooltip, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdGlvbnNSb3dCdXR0b25Ub29sdGlwIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwicmVuZGVyIiwiY29udGVudCIsInJlYWN0aW9uRXZlbnRzIiwibXhFdmVudCIsInZpc2libGUiLCJwcm9wcyIsInJvb20iLCJjb250ZXh0IiwiZ2V0Um9vbSIsImdldFJvb21JZCIsInRvb2x0aXBMYWJlbCIsInNlbmRlcnMiLCJyZWFjdGlvbkV2ZW50IiwibWVtYmVyIiwiZ2V0TWVtYmVyIiwiZ2V0U2VuZGVyIiwibmFtZSIsInB1c2giLCJzaG9ydE5hbWUiLCJ1bmljb2RlVG9TaG9ydGNvZGUiLCJfdCIsInJlYWN0b3JzIiwiZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0IiwicmVhY3RlZFdpdGgiLCJzdWIiLCJ0b29sdGlwIiwiTWF0cml4Q2xpZW50Q29udGV4dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1JlYWN0aW9uc1Jvd0J1dHRvblRvb2x0aXAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuXG5pbXBvcnQgeyB1bmljb2RlVG9TaG9ydGNvZGUgfSBmcm9tICcuLi8uLi8uLi9IdG1sVXRpbHMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0IH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvRm9ybWF0dGluZ1V0aWxzJztcbmltcG9ydCBUb29sdGlwIGZyb20gXCIuLi9lbGVtZW50cy9Ub29sdGlwXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyBUaGUgZXZlbnQgd2UncmUgZGlzcGxheWluZyByZWFjdGlvbnMgZm9yXG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgLy8gVGhlIHJlYWN0aW9uIGNvbnRlbnQgLyBrZXkgLyBlbW9qaVxuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICAvLyBBIFNldCBvZiBNYXRyaXggcmVhY3Rpb24gZXZlbnRzIGZvciB0aGlzIGtleVxuICAgIHJlYWN0aW9uRXZlbnRzOiBTZXQ8TWF0cml4RXZlbnQ+O1xuICAgIHZpc2libGU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWN0aW9uc1Jvd0J1dHRvblRvb2x0aXAgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgY29udGVudCwgcmVhY3Rpb25FdmVudHMsIG14RXZlbnQsIHZpc2libGUgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKG14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICBsZXQgdG9vbHRpcExhYmVsO1xuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgY29uc3Qgc2VuZGVycyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCByZWFjdGlvbkV2ZW50IG9mIHJlYWN0aW9uRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gcm9vbS5nZXRNZW1iZXIocmVhY3Rpb25FdmVudC5nZXRTZW5kZXIoKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IG1lbWJlciA/IG1lbWJlci5uYW1lIDogcmVhY3Rpb25FdmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgICAgICAgICBzZW5kZXJzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzaG9ydE5hbWUgPSB1bmljb2RlVG9TaG9ydGNvZGUoY29udGVudCk7XG4gICAgICAgICAgICB0b29sdGlwTGFiZWwgPSA8ZGl2PnsgX3QoXG4gICAgICAgICAgICAgICAgXCI8cmVhY3RvcnMvPjxyZWFjdGVkV2l0aD5yZWFjdGVkIHdpdGggJShzaG9ydE5hbWUpczwvcmVhY3RlZFdpdGg+XCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzaG9ydE5hbWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWN0b3JzOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Ub29sdGlwX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBmb3JtYXRDb21tYVNlcGFyYXRlZExpc3Qoc2VuZGVycywgNikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWFjdGVkV2l0aDogKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzaG9ydE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfc3ViXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApIH08L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdG9vbHRpcDtcbiAgICAgICAgaWYgKHRvb2x0aXBMYWJlbCkge1xuICAgICAgICAgICAgdG9vbHRpcCA9IDxUb29sdGlwIHZpc2libGU9e3Zpc2libGV9IGxhYmVsPXt0b29sdGlwTGFiZWx9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvb2x0aXA7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBcUJlLE1BQU1BLHlCQUFOLFNBQXdDQyxjQUFBLENBQU1DLGFBQTlDLENBQW9FO0VBRy9FQyxNQUFNLEdBQUc7SUFDTCxNQUFNO01BQUVDLE9BQUY7TUFBV0MsY0FBWDtNQUEyQkMsT0FBM0I7TUFBb0NDO0lBQXBDLElBQWdELEtBQUtDLEtBQTNEO0lBRUEsTUFBTUMsSUFBSSxHQUFHLEtBQUtDLE9BQUwsQ0FBYUMsT0FBYixDQUFxQkwsT0FBTyxDQUFDTSxTQUFSLEVBQXJCLENBQWI7SUFDQSxJQUFJQyxZQUFKOztJQUNBLElBQUlKLElBQUosRUFBVTtNQUNOLE1BQU1LLE9BQU8sR0FBRyxFQUFoQjs7TUFDQSxLQUFLLE1BQU1DLGFBQVgsSUFBNEJWLGNBQTVCLEVBQTRDO1FBQ3hDLE1BQU1XLE1BQU0sR0FBR1AsSUFBSSxDQUFDUSxTQUFMLENBQWVGLGFBQWEsQ0FBQ0csU0FBZCxFQUFmLENBQWY7UUFDQSxNQUFNQyxJQUFJLEdBQUdILE1BQU0sR0FBR0EsTUFBTSxDQUFDRyxJQUFWLEdBQWlCSixhQUFhLENBQUNHLFNBQWQsRUFBcEM7UUFDQUosT0FBTyxDQUFDTSxJQUFSLENBQWFELElBQWI7TUFDSDs7TUFDRCxNQUFNRSxTQUFTLEdBQUcsSUFBQUMsNkJBQUEsRUFBbUJsQixPQUFuQixDQUFsQjtNQUNBUyxZQUFZLGdCQUFHLDBDQUFPLElBQUFVLG1CQUFBLEVBQ2xCLGtFQURrQixFQUVsQjtRQUNJRjtNQURKLENBRmtCLEVBS2xCO1FBQ0lHLFFBQVEsRUFBRSxNQUFNO1VBQ1osb0JBQU87WUFBSyxTQUFTLEVBQUM7VUFBZixHQUNELElBQUFDLHlDQUFBLEVBQXlCWCxPQUF6QixFQUFrQyxDQUFsQyxDQURDLENBQVA7UUFHSCxDQUxMO1FBTUlZLFdBQVcsRUFBR0MsR0FBRCxJQUFTO1VBQ2xCLElBQUksQ0FBQ04sU0FBTCxFQUFnQjtZQUNaLE9BQU8sSUFBUDtVQUNIOztVQUNELG9CQUFPO1lBQUssU0FBUyxFQUFDO1VBQWYsR0FDRE0sR0FEQyxDQUFQO1FBR0g7TUFiTCxDQUxrQixDQUFQLENBQWY7SUFxQkg7O0lBRUQsSUFBSUMsT0FBSjs7SUFDQSxJQUFJZixZQUFKLEVBQWtCO01BQ2RlLE9BQU8sZ0JBQUcsNkJBQUMsZ0JBQUQ7UUFBUyxPQUFPLEVBQUVyQixPQUFsQjtRQUEyQixLQUFLLEVBQUVNO01BQWxDLEVBQVY7SUFDSDs7SUFFRCxPQUFPZSxPQUFQO0VBQ0g7O0FBN0M4RTs7OzhCQUE5RDVCLHlCLGlCQUNJNkIsNEIifQ==