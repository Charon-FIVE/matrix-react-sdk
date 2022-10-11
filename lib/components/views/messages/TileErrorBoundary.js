"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _BugReportDialog = _interopRequireDefault(require("../dialogs/BugReportDialog"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _ViewSource = _interopRequireDefault(require("../../structures/ViewSource"));

/*
Copyright 2020 - 2022 The Matrix.org Foundation C.I.C.

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
class TileErrorBoundary extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onBugReport", () => {
      _Modal.default.createDialog(_BugReportDialog.default, {
        label: 'react-soft-crash-tile',
        error: this.state.error
      });
    });
    (0, _defineProperty2.default)(this, "onViewSource", () => {
      _Modal.default.createDialog(_ViewSource.default, {
        mxEvent: this.props.mxEvent
      }, 'mx_Dialog_viewsource');
    });
    this.state = {
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    // Side effects are not permitted here, so we only update the state so
    // that the next render shows an error message.
    return {
      error
    };
  }

  render() {
    if (this.state.error) {
      const {
        mxEvent
      } = this.props;
      const classes = {
        mx_EventTile: true,
        mx_EventTile_info: true,
        mx_EventTile_content: true,
        mx_EventTile_tileError: true
      };
      let submitLogsButton;

      if (_SdkConfig.default.get().bug_report_endpoint_url) {
        submitLogsButton = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, "\xA0", /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link",
          onClick: this.onBugReport
        }, (0, _languageHandler._t)("Submit logs")));
      }

      let viewSourceButton;

      if (mxEvent && _SettingsStore.default.getValue("developerMode")) {
        viewSourceButton = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, "\xA0", /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: this.onViewSource,
          kind: "link"
        }, (0, _languageHandler._t)("View Source")));
      }

      return /*#__PURE__*/_react.default.createElement("li", {
        className: (0, _classnames.default)(classes),
        "data-layout": this.props.layout
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile_line"
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Can't load this message"), mxEvent && ` (${mxEvent.getType()})`, submitLogsButton, viewSourceButton)));
    }

    return this.props.children;
  }

}

exports.default = TileErrorBoundary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaWxlRXJyb3JCb3VuZGFyeSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiQnVnUmVwb3J0RGlhbG9nIiwibGFiZWwiLCJlcnJvciIsInN0YXRlIiwiVmlld1NvdXJjZSIsIm14RXZlbnQiLCJnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IiLCJyZW5kZXIiLCJjbGFzc2VzIiwibXhfRXZlbnRUaWxlIiwibXhfRXZlbnRUaWxlX2luZm8iLCJteF9FdmVudFRpbGVfY29udGVudCIsIm14X0V2ZW50VGlsZV90aWxlRXJyb3IiLCJzdWJtaXRMb2dzQnV0dG9uIiwiU2RrQ29uZmlnIiwiZ2V0IiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJvbkJ1Z1JlcG9ydCIsIl90Iiwidmlld1NvdXJjZUJ1dHRvbiIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIm9uVmlld1NvdXJjZSIsImNsYXNzTmFtZXMiLCJsYXlvdXQiLCJnZXRUeXBlIiwiY2hpbGRyZW4iXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9UaWxlRXJyb3JCb3VuZGFyeS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgQnVnUmVwb3J0RGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvQnVnUmVwb3J0RGlhbG9nJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBWaWV3U291cmNlIGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1ZpZXdTb3VyY2VcIjtcbmltcG9ydCB7IExheW91dCB9IGZyb20gJy4uLy4uLy4uL3NldHRpbmdzL2VudW1zL0xheW91dCc7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xuICAgIGxheW91dDogTGF5b3V0O1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBlcnJvcjogRXJyb3I7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbGVFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yOiBFcnJvcik6IFBhcnRpYWw8SVN0YXRlPiB7XG4gICAgICAgIC8vIFNpZGUgZWZmZWN0cyBhcmUgbm90IHBlcm1pdHRlZCBoZXJlLCBzbyB3ZSBvbmx5IHVwZGF0ZSB0aGUgc3RhdGUgc29cbiAgICAgICAgLy8gdGhhdCB0aGUgbmV4dCByZW5kZXIgc2hvd3MgYW4gZXJyb3IgbWVzc2FnZS5cbiAgICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQnVnUmVwb3J0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coQnVnUmVwb3J0RGlhbG9nLCB7XG4gICAgICAgICAgICBsYWJlbDogJ3JlYWN0LXNvZnQtY3Jhc2gtdGlsZScsXG4gICAgICAgICAgICBlcnJvcjogdGhpcy5zdGF0ZS5lcnJvcixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25WaWV3U291cmNlID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coVmlld1NvdXJjZSwge1xuICAgICAgICAgICAgbXhFdmVudDogdGhpcy5wcm9wcy5teEV2ZW50LFxuICAgICAgICB9LCAnbXhfRGlhbG9nX3ZpZXdzb3VyY2UnKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgY29uc3QgeyBteEV2ZW50IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgICAgICAgICAgICBteF9FdmVudFRpbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2luZm86IHRydWUsXG4gICAgICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2NvbnRlbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbXhfRXZlbnRUaWxlX3RpbGVFcnJvcjogdHJ1ZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxldCBzdWJtaXRMb2dzQnV0dG9uO1xuICAgICAgICAgICAgaWYgKFNka0NvbmZpZy5nZXQoKS5idWdfcmVwb3J0X2VuZHBvaW50X3VybCkge1xuICAgICAgICAgICAgICAgIHN1Ym1pdExvZ3NCdXR0b24gPSA8PlxuICAgICAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLm9uQnVnUmVwb3J0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTdWJtaXQgbG9nc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8Lz47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB2aWV3U291cmNlQnV0dG9uO1xuICAgICAgICAgICAgaWYgKG14RXZlbnQgJiYgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImRldmVsb3Blck1vZGVcIikpIHtcbiAgICAgICAgICAgICAgICB2aWV3U291cmNlQnV0dG9uID0gPD5cbiAgICAgICAgICAgICAgICAgICAgJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25WaWV3U291cmNlfSBraW5kPVwibGlua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlZpZXcgU291cmNlXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvPjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICg8bGkgY2xhc3NOYW1lPXtjbGFzc05hbWVzKGNsYXNzZXMpfSBkYXRhLWxheW91dD17dGhpcy5wcm9wcy5sYXlvdXR9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2xpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2FuJ3QgbG9hZCB0aGlzIG1lc3NhZ2VcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBteEV2ZW50ICYmIGAgKCR7bXhFdmVudC5nZXRUeXBlKCl9KWAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWJtaXRMb2dzQnV0dG9uIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdmlld1NvdXJjZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvbGk+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXdCZSxNQUFNQSxpQkFBTixTQUFnQ0MsY0FBQSxDQUFNQyxTQUF0QyxDQUFnRTtFQUMzRUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsbURBY0csTUFBWTtNQUM5QkMsY0FBQSxDQUFNQyxZQUFOLENBQW1CQyx3QkFBbkIsRUFBb0M7UUFDaENDLEtBQUssRUFBRSx1QkFEeUI7UUFFaENDLEtBQUssRUFBRSxLQUFLQyxLQUFMLENBQVdEO01BRmMsQ0FBcEM7SUFJSCxDQW5Ca0I7SUFBQSxvREFxQkksTUFBWTtNQUMvQkosY0FBQSxDQUFNQyxZQUFOLENBQW1CSyxtQkFBbkIsRUFBK0I7UUFDM0JDLE9BQU8sRUFBRSxLQUFLUixLQUFMLENBQVdRO01BRE8sQ0FBL0IsRUFFRyxzQkFGSDtJQUdILENBekJrQjtJQUdmLEtBQUtGLEtBQUwsR0FBYTtNQUNURCxLQUFLLEVBQUU7SUFERSxDQUFiO0VBR0g7O0VBRThCLE9BQXhCSSx3QkFBd0IsQ0FBQ0osS0FBRCxFQUFnQztJQUMzRDtJQUNBO0lBQ0EsT0FBTztNQUFFQTtJQUFGLENBQVA7RUFDSDs7RUFlREssTUFBTSxHQUFHO0lBQ0wsSUFBSSxLQUFLSixLQUFMLENBQVdELEtBQWYsRUFBc0I7TUFDbEIsTUFBTTtRQUFFRztNQUFGLElBQWMsS0FBS1IsS0FBekI7TUFDQSxNQUFNVyxPQUFPLEdBQUc7UUFDWkMsWUFBWSxFQUFFLElBREY7UUFFWkMsaUJBQWlCLEVBQUUsSUFGUDtRQUdaQyxvQkFBb0IsRUFBRSxJQUhWO1FBSVpDLHNCQUFzQixFQUFFO01BSlosQ0FBaEI7TUFPQSxJQUFJQyxnQkFBSjs7TUFDQSxJQUFJQyxrQkFBQSxDQUFVQyxHQUFWLEdBQWdCQyx1QkFBcEIsRUFBNkM7UUFDekNILGdCQUFnQixnQkFBRyxpRkFFZiw2QkFBQyx5QkFBRDtVQUFrQixJQUFJLEVBQUMsTUFBdkI7VUFBOEIsT0FBTyxFQUFFLEtBQUtJO1FBQTVDLEdBQ00sSUFBQUMsbUJBQUEsRUFBRyxhQUFILENBRE4sQ0FGZSxDQUFuQjtNQU1IOztNQUVELElBQUlDLGdCQUFKOztNQUNBLElBQUlkLE9BQU8sSUFBSWUsc0JBQUEsQ0FBY0MsUUFBZCxDQUF1QixlQUF2QixDQUFmLEVBQXdEO1FBQ3BERixnQkFBZ0IsZ0JBQUcsaUZBRWYsNkJBQUMseUJBQUQ7VUFBa0IsT0FBTyxFQUFFLEtBQUtHLFlBQWhDO1VBQThDLElBQUksRUFBQztRQUFuRCxHQUNNLElBQUFKLG1CQUFBLEVBQUcsYUFBSCxDQUROLENBRmUsQ0FBbkI7TUFNSDs7TUFFRCxvQkFBUTtRQUFJLFNBQVMsRUFBRSxJQUFBSyxtQkFBQSxFQUFXZixPQUFYLENBQWY7UUFBb0MsZUFBYSxLQUFLWCxLQUFMLENBQVcyQjtNQUE1RCxnQkFDSjtRQUFLLFNBQVMsRUFBQztNQUFmLGdCQUNJLDJDQUNNLElBQUFOLG1CQUFBLEVBQUcseUJBQUgsQ0FETixFQUVNYixPQUFPLElBQUssS0FBSUEsT0FBTyxDQUFDb0IsT0FBUixFQUFrQixHQUZ4QyxFQUdNWixnQkFITixFQUlNTSxnQkFKTixDQURKLENBREksQ0FBUjtJQVVIOztJQUVELE9BQU8sS0FBS3RCLEtBQUwsQ0FBVzZCLFFBQWxCO0VBQ0g7O0FBdkUwRSJ9