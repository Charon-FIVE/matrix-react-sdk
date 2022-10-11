"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _BugReportDialog = _interopRequireDefault(require("./BugReportDialog"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

/*
Copyright 2019 New Vector Ltd

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
class StorageEvictedDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "sendBugReport", ev => {
      ev.preventDefault();

      _Modal.default.createDialog(_BugReportDialog.default, {});
    });
    (0, _defineProperty2.default)(this, "onSignOutClick", () => {
      this.props.onFinished(true);
    });
  }

  render() {
    let logRequest;

    if (_SdkConfig.default.get().bug_report_endpoint_url) {
      logRequest = (0, _languageHandler._t)("To help us prevent this in future, please <a>send us logs</a>.", {}, {
        a: text => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.sendBugReport
        }, text)
      });
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_ErrorDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)('Missing session data'),
      contentId: "mx_Dialog_content",
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content",
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Some session data, including encrypted message keys, is " + "missing. Sign out and sign in to fix this, restoring keys " + "from backup.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your browser likely removed this data when running low on " + "disk space."), " ", logRequest)), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Sign out"),
      onPrimaryButtonClick: this.onSignOutClick,
      focus: true,
      hasCancel: false
    }));
  }

}

exports.default = StorageEvictedDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdG9yYWdlRXZpY3RlZERpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiQnVnUmVwb3J0RGlhbG9nIiwicHJvcHMiLCJvbkZpbmlzaGVkIiwicmVuZGVyIiwibG9nUmVxdWVzdCIsIlNka0NvbmZpZyIsImdldCIsImJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsIiwiX3QiLCJhIiwidGV4dCIsInNlbmRCdWdSZXBvcnQiLCJvblNpZ25PdXRDbGljayJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU3RvcmFnZUV2aWN0ZWREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IEJ1Z1JlcG9ydERpYWxvZyBmcm9tIFwiLi9CdWdSZXBvcnREaWFsb2dcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuL0lEaWFsb2dQcm9wc1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMgeyB9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3JhZ2VFdmljdGVkRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHByaXZhdGUgc2VuZEJ1Z1JlcG9ydCA9IChldjogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coQnVnUmVwb3J0RGlhbG9nLCB7fSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TaWduT3V0Q2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBsb2dSZXF1ZXN0O1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgICAgICBsb2dSZXF1ZXN0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJUbyBoZWxwIHVzIHByZXZlbnQgdGhpcyBpbiBmdXR1cmUsIHBsZWFzZSA8YT5zZW5kIHVzIGxvZ3M8L2E+LlwiLFxuICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYTogdGV4dCA9PiA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdsaW5rX2lubGluZScgb25DbGljaz17dGhpcy5zZW5kQnVnUmVwb3J0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FcnJvckRpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnTWlzc2luZyBzZXNzaW9uIGRhdGEnKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiIGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlNvbWUgc2Vzc2lvbiBkYXRhLCBpbmNsdWRpbmcgZW5jcnlwdGVkIG1lc3NhZ2Uga2V5cywgaXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJtaXNzaW5nLiBTaWduIG91dCBhbmQgc2lnbiBpbiB0byBmaXggdGhpcywgcmVzdG9yaW5nIGtleXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJmcm9tIGJhY2t1cC5cIixcbiAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJZb3VyIGJyb3dzZXIgbGlrZWx5IHJlbW92ZWQgdGhpcyBkYXRhIHdoZW4gcnVubmluZyBsb3cgb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNrIHNwYWNlLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH0geyBsb2dSZXF1ZXN0IH08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoXCJTaWduIG91dFwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25TaWduT3V0Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZWUsTUFBTUEsb0JBQU4sU0FBbUNDLGNBQUEsQ0FBTUMsU0FBekMsQ0FBMkQ7RUFBQTtJQUFBO0lBQUEscURBQzdDQyxFQUFELElBQWdDO01BQ3BEQSxFQUFFLENBQUNDLGNBQUg7O01BQ0FDLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsd0JBQW5CLEVBQW9DLEVBQXBDO0lBQ0gsQ0FKcUU7SUFBQSxzREFNN0MsTUFBWTtNQUNqQyxLQUFLQyxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsSUFBdEI7SUFDSCxDQVJxRTtFQUFBOztFQVUvREMsTUFBTSxHQUFnQjtJQUN6QixJQUFJQyxVQUFKOztJQUNBLElBQUlDLGtCQUFBLENBQVVDLEdBQVYsR0FBZ0JDLHVCQUFwQixFQUE2QztNQUN6Q0gsVUFBVSxHQUFHLElBQUFJLG1CQUFBLEVBQ1QsZ0VBRFMsRUFFVCxFQUZTLEVBR1Q7UUFDSUMsQ0FBQyxFQUFFQyxJQUFJLGlCQUFJLDZCQUFDLHlCQUFEO1VBQWtCLElBQUksRUFBQyxhQUF2QjtVQUFxQyxPQUFPLEVBQUUsS0FBS0M7UUFBbkQsR0FDTEQsSUFESztNQURmLENBSFMsQ0FBYjtJQVNIOztJQUVELG9CQUNJLDZCQUFDLG1CQUFEO01BQ0ksU0FBUyxFQUFDLGdCQURkO01BRUksVUFBVSxFQUFFLEtBQUtULEtBQUwsQ0FBV0MsVUFGM0I7TUFHSSxLQUFLLEVBQUUsSUFBQU0sbUJBQUEsRUFBRyxzQkFBSCxDQUhYO01BSUksU0FBUyxFQUFDLG1CQUpkO01BS0ksU0FBUyxFQUFFO0lBTGYsZ0JBT0k7TUFBSyxTQUFTLEVBQUMsbUJBQWY7TUFBbUMsRUFBRSxFQUFDO0lBQXRDLGdCQUNJLHdDQUFLLElBQUFBLG1CQUFBLEVBQ0QsNkRBQ0EsNERBREEsR0FFQSxjQUhDLENBQUwsQ0FESixlQU1JLHdDQUFLLElBQUFBLG1CQUFBLEVBQ0QsK0RBQ0EsYUFGQyxDQUFMLE9BR01KLFVBSE4sQ0FOSixDQVBKLGVBa0JJLDZCQUFDLHNCQUFEO01BQWUsYUFBYSxFQUFFLElBQUFJLG1CQUFBLEVBQUcsVUFBSCxDQUE5QjtNQUNJLG9CQUFvQixFQUFFLEtBQUtJLGNBRC9CO01BRUksS0FBSyxFQUFFLElBRlg7TUFHSSxTQUFTLEVBQUU7SUFIZixFQWxCSixDQURKO0VBMEJIOztBQWxEcUUifQ==