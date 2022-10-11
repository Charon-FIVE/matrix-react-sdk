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

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _BugReportDialog = _interopRequireDefault(require("./BugReportDialog"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

/*
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd
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
class SessionRestoreErrorDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "sendBugReport", () => {
      _Modal.default.createDialog(_BugReportDialog.default, {
        error: this.props.error
      });
    });
    (0, _defineProperty2.default)(this, "onClearStorageClick", () => {
      _Modal.default.createDialog(_QuestionDialog.default, {
        title: (0, _languageHandler._t)("Sign out"),
        description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Sign out and remove encryption keys?")),
        button: (0, _languageHandler._t)("Sign out"),
        danger: true,
        onFinished: this.props.onFinished
      });
    });
    (0, _defineProperty2.default)(this, "onRefreshClick", () => {
      // Is this likely to help? Probably not, but giving only one button
      // that clears your storage seems awful.
      window.location.reload();
    });
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    const clearStorageButton = /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onClearStorageClick,
      className: "danger"
    }, (0, _languageHandler._t)("Clear Storage and Sign Out"));

    let dialogButtons;

    if (_SdkConfig.default.get().bug_report_endpoint_url) {
      dialogButtons = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("Send Logs"),
        onPrimaryButtonClick: this.sendBugReport,
        focus: true,
        hasCancel: false
      }, clearStorageButton);
    } else {
      dialogButtons = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("Refresh"),
        onPrimaryButtonClick: this.onRefreshClick,
        focus: true,
        hasCancel: false
      }, clearStorageButton);
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_ErrorDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)('Unable to restore session'),
      contentId: "mx_Dialog_content",
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content",
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We encountered an error trying to restore your previous session.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you have previously used a more recent version of %(brand)s, your session " + "may be incompatible with this version. Close this window and return " + "to the more recent version.", {
      brand
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Clearing your browser's storage may fix the problem, but will sign you " + "out and cause any encrypted chat history to become unreadable."))), dialogButtons);
  }

}

exports.default = SessionRestoreErrorDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXNzaW9uUmVzdG9yZUVycm9yRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkJ1Z1JlcG9ydERpYWxvZyIsImVycm9yIiwicHJvcHMiLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiX3QiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsImRhbmdlciIsIm9uRmluaXNoZWQiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInJlbG9hZCIsInJlbmRlciIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0IiwiY2xlYXJTdG9yYWdlQnV0dG9uIiwib25DbGVhclN0b3JhZ2VDbGljayIsImRpYWxvZ0J1dHRvbnMiLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsInNlbmRCdWdSZXBvcnQiLCJvblJlZnJlc2hDbGljayJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2Vzc2lvblJlc3RvcmVFcnJvckRpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uLy4uLy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgQnVnUmVwb3J0RGlhbG9nIGZyb20gXCIuL0J1Z1JlcG9ydERpYWxvZ1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuL0lEaWFsb2dQcm9wc1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBlcnJvcjogRXJyb3I7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHJpdmF0ZSBzZW5kQnVnUmVwb3J0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coQnVnUmVwb3J0RGlhbG9nLCB7XG4gICAgICAgICAgICBlcnJvcjogdGhpcy5wcm9wcy5lcnJvcixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbGVhclN0b3JhZ2VDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJTaWduIG91dFwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgIDxkaXY+eyBfdChcIlNpZ24gb3V0IGFuZCByZW1vdmUgZW5jcnlwdGlvbiBrZXlzP1wiKSB9PC9kaXY+LFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIlNpZ24gb3V0XCIpLFxuICAgICAgICAgICAgZGFuZ2VyOiB0cnVlLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogdGhpcy5wcm9wcy5vbkZpbmlzaGVkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlZnJlc2hDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgLy8gSXMgdGhpcyBsaWtlbHkgdG8gaGVscD8gUHJvYmFibHkgbm90LCBidXQgZ2l2aW5nIG9ubHkgb25lIGJ1dHRvblxuICAgICAgICAvLyB0aGF0IGNsZWFycyB5b3VyIHN0b3JhZ2Ugc2VlbXMgYXdmdWwuXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuXG4gICAgICAgIGNvbnN0IGNsZWFyU3RvcmFnZUJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkNsZWFyU3RvcmFnZUNsaWNrfSBjbGFzc05hbWU9XCJkYW5nZXJcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiQ2xlYXIgU3RvcmFnZSBhbmQgU2lnbiBPdXRcIikgfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGRpYWxvZ0J1dHRvbnM7XG4gICAgICAgIGlmIChTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmwpIHtcbiAgICAgICAgICAgIGRpYWxvZ0J1dHRvbnMgPSA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdChcIlNlbmQgTG9nc1wiKX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5zZW5kQnVnUmVwb3J0fVxuICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBjbGVhclN0b3JhZ2VCdXR0b24gfVxuICAgICAgICAgICAgPC9EaWFsb2dCdXR0b25zPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpYWxvZ0J1dHRvbnMgPSA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdChcIlJlZnJlc2hcIil9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25SZWZyZXNoQ2xpY2t9XG4gICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNsZWFyU3RvcmFnZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L0RpYWxvZ0J1dHRvbnM+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXJyb3JEaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoJ1VuYWJsZSB0byByZXN0b3JlIHNlc3Npb24nKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiIGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJXZSBlbmNvdW50ZXJlZCBhbiBlcnJvciB0cnlpbmcgdG8gcmVzdG9yZSB5b3VyIHByZXZpb3VzIHNlc3Npb24uXCIpIH08L3A+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSWYgeW91IGhhdmUgcHJldmlvdXNseSB1c2VkIGEgbW9yZSByZWNlbnQgdmVyc2lvbiBvZiAlKGJyYW5kKXMsIHlvdXIgc2Vzc2lvbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1heSBiZSBpbmNvbXBhdGlibGUgd2l0aCB0aGlzIHZlcnNpb24uIENsb3NlIHRoaXMgd2luZG93IGFuZCByZXR1cm4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0byB0aGUgbW9yZSByZWNlbnQgdmVyc2lvbi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuXG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkNsZWFyaW5nIHlvdXIgYnJvd3NlcidzIHN0b3JhZ2UgbWF5IGZpeCB0aGUgcHJvYmxlbSwgYnV0IHdpbGwgc2lnbiB5b3UgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJvdXQgYW5kIGNhdXNlIGFueSBlbmNyeXB0ZWQgY2hhdCBoaXN0b3J5IHRvIGJlY29tZSB1bnJlYWRhYmxlLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBkaWFsb2dCdXR0b25zIH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUJlLE1BQU1BLHlCQUFOLFNBQXdDQyxjQUFBLENBQU1DLFNBQTlDLENBQWdFO0VBQUE7SUFBQTtJQUFBLHFEQUNuRCxNQUFZO01BQ2hDQyxjQUFBLENBQU1DLFlBQU4sQ0FBbUJDLHdCQUFuQixFQUFvQztRQUNoQ0MsS0FBSyxFQUFFLEtBQUtDLEtBQUwsQ0FBV0Q7TUFEYyxDQUFwQztJQUdILENBTDBFO0lBQUEsMkRBTzdDLE1BQVk7TUFDdENILGNBQUEsQ0FBTUMsWUFBTixDQUFtQkksdUJBQW5CLEVBQW1DO1FBQy9CQyxLQUFLLEVBQUUsSUFBQUMsbUJBQUEsRUFBRyxVQUFILENBRHdCO1FBRS9CQyxXQUFXLGVBQ1AsMENBQU8sSUFBQUQsbUJBQUEsRUFBRyxzQ0FBSCxDQUFQLENBSDJCO1FBSS9CRSxNQUFNLEVBQUUsSUFBQUYsbUJBQUEsRUFBRyxVQUFILENBSnVCO1FBSy9CRyxNQUFNLEVBQUUsSUFMdUI7UUFNL0JDLFVBQVUsRUFBRSxLQUFLUCxLQUFMLENBQVdPO01BTlEsQ0FBbkM7SUFRSCxDQWhCMEU7SUFBQSxzREFrQmxELE1BQVk7TUFDakM7TUFDQTtNQUNBQyxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLE1BQWhCO0lBQ0gsQ0F0QjBFO0VBQUE7O0VBd0JwRUMsTUFBTSxHQUFnQjtJQUN6QixNQUFNQyxLQUFLLEdBQUdDLGtCQUFBLENBQVVDLEdBQVYsR0FBZ0JGLEtBQTlCOztJQUVBLE1BQU1HLGtCQUFrQixnQkFDcEI7TUFBUSxPQUFPLEVBQUUsS0FBS0MsbUJBQXRCO01BQTJDLFNBQVMsRUFBQztJQUFyRCxHQUNNLElBQUFiLG1CQUFBLEVBQUcsNEJBQUgsQ0FETixDQURKOztJQU1BLElBQUljLGFBQUo7O0lBQ0EsSUFBSUosa0JBQUEsQ0FBVUMsR0FBVixHQUFnQkksdUJBQXBCLEVBQTZDO01BQ3pDRCxhQUFhLGdCQUFHLDZCQUFDLHNCQUFEO1FBQWUsYUFBYSxFQUFFLElBQUFkLG1CQUFBLEVBQUcsV0FBSCxDQUE5QjtRQUNaLG9CQUFvQixFQUFFLEtBQUtnQixhQURmO1FBRVosS0FBSyxFQUFFLElBRks7UUFHWixTQUFTLEVBQUU7TUFIQyxHQUtWSixrQkFMVSxDQUFoQjtJQU9ILENBUkQsTUFRTztNQUNIRSxhQUFhLGdCQUFHLDZCQUFDLHNCQUFEO1FBQWUsYUFBYSxFQUFFLElBQUFkLG1CQUFBLEVBQUcsU0FBSCxDQUE5QjtRQUNaLG9CQUFvQixFQUFFLEtBQUtpQixjQURmO1FBRVosS0FBSyxFQUFFLElBRks7UUFHWixTQUFTLEVBQUU7TUFIQyxHQUtWTCxrQkFMVSxDQUFoQjtJQU9IOztJQUVELG9CQUNJLDZCQUFDLG1CQUFEO01BQ0ksU0FBUyxFQUFDLGdCQURkO01BRUksVUFBVSxFQUFFLEtBQUtmLEtBQUwsQ0FBV08sVUFGM0I7TUFHSSxLQUFLLEVBQUUsSUFBQUosbUJBQUEsRUFBRywyQkFBSCxDQUhYO01BSUksU0FBUyxFQUFDLG1CQUpkO01BS0ksU0FBUyxFQUFFO0lBTGYsZ0JBT0k7TUFBSyxTQUFTLEVBQUMsbUJBQWY7TUFBbUMsRUFBRSxFQUFDO0lBQXRDLGdCQUNJLHdDQUFLLElBQUFBLG1CQUFBLEVBQUcsa0VBQUgsQ0FBTCxDQURKLGVBR0ksd0NBQUssSUFBQUEsbUJBQUEsRUFDRCxrRkFDQSxzRUFEQSxHQUVBLDZCQUhDLEVBSUQ7TUFBRVM7SUFBRixDQUpDLENBQUwsQ0FISixlQVVJLHdDQUFLLElBQUFULG1CQUFBLEVBQ0QsNEVBQ0EsZ0VBRkMsQ0FBTCxDQVZKLENBUEosRUFzQk1jLGFBdEJOLENBREo7RUEwQkg7O0FBOUUwRSJ9