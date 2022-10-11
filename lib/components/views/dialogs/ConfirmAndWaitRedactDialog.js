"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _ConfirmRedactDialog = _interopRequireDefault(require("./ConfirmRedactDialog"));

var _ErrorDialog = _interopRequireDefault(require("./ErrorDialog"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

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

/*
 * A dialog for confirming a redaction.
 * Also shows a spinner (and possible error) while the redaction is ongoing,
 * and only closes the dialog when the redaction is done or failed.
 *
 * This is done to prevent the edit history dialog racing with the redaction:
 * if this dialog closes and the MessageEditHistoryDialog is shown again,
 * it will fetch the relations again, which will race with the ongoing /redact request.
 * which will cause the edit to appear unredacted.
 *
 * To avoid this, we keep the dialog open as long as /redact is in progress.
 */
class ConfirmAndWaitRedactDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onParentFinished", async proceed => {
      if (proceed) {
        this.setState({
          isRedacting: true
        });

        try {
          await this.props.redact();
          this.props.onFinished(true);
        } catch (error) {
          const code = error.errcode || error.statusCode;

          if (typeof code !== "undefined") {
            this.setState({
              redactionErrorCode: code
            });
          } else {
            this.props.onFinished(true);
          }
        }
      } else {
        this.props.onFinished(false);
      }
    });
    this.state = {
      isRedacting: false,
      redactionErrorCode: null
    };
  }

  render() {
    if (this.state.isRedacting) {
      if (this.state.redactionErrorCode) {
        const code = this.state.redactionErrorCode;
        return /*#__PURE__*/_react.default.createElement(_ErrorDialog.default, {
          onFinished: this.props.onFinished,
          title: (0, _languageHandler._t)('Error'),
          description: (0, _languageHandler._t)('You cannot delete this message. (%(code)s)', {
            code
          })
        });
      } else {
        return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
          onFinished: this.props.onFinished,
          hasCancel: false,
          title: (0, _languageHandler._t)("Removing…")
        }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
      }
    } else {
      return /*#__PURE__*/_react.default.createElement(_ConfirmRedactDialog.default, {
        onFinished: this.onParentFinished
      });
    }
  }

}

exports.default = ConfirmAndWaitRedactDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25maXJtQW5kV2FpdFJlZGFjdERpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwcm9jZWVkIiwic2V0U3RhdGUiLCJpc1JlZGFjdGluZyIsInJlZGFjdCIsIm9uRmluaXNoZWQiLCJlcnJvciIsImNvZGUiLCJlcnJjb2RlIiwic3RhdHVzQ29kZSIsInJlZGFjdGlvbkVycm9yQ29kZSIsInN0YXRlIiwicmVuZGVyIiwiX3QiLCJvblBhcmVudEZpbmlzaGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9Db25maXJtQW5kV2FpdFJlZGFjdERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IENvbmZpcm1SZWRhY3REaWFsb2cgZnJvbSAnLi9Db25maXJtUmVkYWN0RGlhbG9nJztcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tICcuL0Vycm9yRGlhbG9nJztcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJlZGFjdDogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgICBvbkZpbmlzaGVkOiAoc3VjY2VzczogYm9vbGVhbikgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgaXNSZWRhY3Rpbmc6IGJvb2xlYW47XG4gICAgcmVkYWN0aW9uRXJyb3JDb2RlOiBzdHJpbmcgfCBudW1iZXI7XG59XG5cbi8qXG4gKiBBIGRpYWxvZyBmb3IgY29uZmlybWluZyBhIHJlZGFjdGlvbi5cbiAqIEFsc28gc2hvd3MgYSBzcGlubmVyIChhbmQgcG9zc2libGUgZXJyb3IpIHdoaWxlIHRoZSByZWRhY3Rpb24gaXMgb25nb2luZyxcbiAqIGFuZCBvbmx5IGNsb3NlcyB0aGUgZGlhbG9nIHdoZW4gdGhlIHJlZGFjdGlvbiBpcyBkb25lIG9yIGZhaWxlZC5cbiAqXG4gKiBUaGlzIGlzIGRvbmUgdG8gcHJldmVudCB0aGUgZWRpdCBoaXN0b3J5IGRpYWxvZyByYWNpbmcgd2l0aCB0aGUgcmVkYWN0aW9uOlxuICogaWYgdGhpcyBkaWFsb2cgY2xvc2VzIGFuZCB0aGUgTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nIGlzIHNob3duIGFnYWluLFxuICogaXQgd2lsbCBmZXRjaCB0aGUgcmVsYXRpb25zIGFnYWluLCB3aGljaCB3aWxsIHJhY2Ugd2l0aCB0aGUgb25nb2luZyAvcmVkYWN0IHJlcXVlc3QuXG4gKiB3aGljaCB3aWxsIGNhdXNlIHRoZSBlZGl0IHRvIGFwcGVhciB1bnJlZGFjdGVkLlxuICpcbiAqIFRvIGF2b2lkIHRoaXMsIHdlIGtlZXAgdGhlIGRpYWxvZyBvcGVuIGFzIGxvbmcgYXMgL3JlZGFjdCBpcyBpbiBwcm9ncmVzcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZmlybUFuZFdhaXRSZWRhY3REaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNSZWRhY3Rpbmc6IGZhbHNlLFxuICAgICAgICAgICAgcmVkYWN0aW9uRXJyb3JDb2RlOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBvblBhcmVudEZpbmlzaGVkID0gYXN5bmMgKHByb2NlZWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgaWYgKHByb2NlZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc1JlZGFjdGluZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wcm9wcy5yZWRhY3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBlcnJvci5lcnJjb2RlIHx8IGVycm9yLnN0YXR1c0NvZGU7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb2RlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZWRhY3Rpb25FcnJvckNvZGU6IGNvZGUgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNSZWRhY3RpbmcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnJlZGFjdGlvbkVycm9yQ29kZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSB0aGlzLnN0YXRlLnJlZGFjdGlvbkVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8RXJyb3JEaWFsb2dcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnRXJyb3InKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtfdCgnWW91IGNhbm5vdCBkZWxldGUgdGhpcyBtZXNzYWdlLiAoJShjb2RlKXMpJywgeyBjb2RlIH0pfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiUmVtb3ZpbmfigKZcIil9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gPENvbmZpcm1SZWRhY3REaWFsb2cgb25GaW5pc2hlZD17dGhpcy5vblBhcmVudEZpbmlzaGVkfSAvPjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsMEJBQU4sU0FBeUNDLGNBQUEsQ0FBTUMsYUFBL0MsQ0FBNkU7RUFDeEZDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0lBQ2YsTUFBTUEsS0FBTjtJQURlLHdEQVFPLE1BQU9DLE9BQVAsSUFBMkM7TUFDakUsSUFBSUEsT0FBSixFQUFhO1FBQ1QsS0FBS0MsUUFBTCxDQUFjO1VBQUVDLFdBQVcsRUFBRTtRQUFmLENBQWQ7O1FBQ0EsSUFBSTtVQUNBLE1BQU0sS0FBS0gsS0FBTCxDQUFXSSxNQUFYLEVBQU47VUFDQSxLQUFLSixLQUFMLENBQVdLLFVBQVgsQ0FBc0IsSUFBdEI7UUFDSCxDQUhELENBR0UsT0FBT0MsS0FBUCxFQUFjO1VBQ1osTUFBTUMsSUFBSSxHQUFHRCxLQUFLLENBQUNFLE9BQU4sSUFBaUJGLEtBQUssQ0FBQ0csVUFBcEM7O1VBQ0EsSUFBSSxPQUFPRixJQUFQLEtBQWdCLFdBQXBCLEVBQWlDO1lBQzdCLEtBQUtMLFFBQUwsQ0FBYztjQUFFUSxrQkFBa0IsRUFBRUg7WUFBdEIsQ0FBZDtVQUNILENBRkQsTUFFTztZQUNILEtBQUtQLEtBQUwsQ0FBV0ssVUFBWCxDQUFzQixJQUF0QjtVQUNIO1FBQ0o7TUFDSixDQWJELE1BYU87UUFDSCxLQUFLTCxLQUFMLENBQVdLLFVBQVgsQ0FBc0IsS0FBdEI7TUFDSDtJQUNKLENBekJrQjtJQUVmLEtBQUtNLEtBQUwsR0FBYTtNQUNUUixXQUFXLEVBQUUsS0FESjtNQUVUTyxrQkFBa0IsRUFBRTtJQUZYLENBQWI7RUFJSDs7RUFxQk1FLE1BQU0sR0FBRztJQUNaLElBQUksS0FBS0QsS0FBTCxDQUFXUixXQUFmLEVBQTRCO01BQ3hCLElBQUksS0FBS1EsS0FBTCxDQUFXRCxrQkFBZixFQUFtQztRQUMvQixNQUFNSCxJQUFJLEdBQUcsS0FBS0ksS0FBTCxDQUFXRCxrQkFBeEI7UUFDQSxvQkFDSSw2QkFBQyxvQkFBRDtVQUNJLFVBQVUsRUFBRSxLQUFLVixLQUFMLENBQVdLLFVBRDNCO1VBRUksS0FBSyxFQUFFLElBQUFRLG1CQUFBLEVBQUcsT0FBSCxDQUZYO1VBR0ksV0FBVyxFQUFFLElBQUFBLG1CQUFBLEVBQUcsNENBQUgsRUFBaUQ7WUFBRU47VUFBRixDQUFqRDtRQUhqQixFQURKO01BT0gsQ0FURCxNQVNPO1FBQ0gsb0JBQ0ksNkJBQUMsbUJBQUQ7VUFDSSxVQUFVLEVBQUUsS0FBS1AsS0FBTCxDQUFXSyxVQUQzQjtVQUVJLFNBQVMsRUFBRSxLQUZmO1VBR0ksS0FBSyxFQUFFLElBQUFRLG1CQUFBLEVBQUcsV0FBSDtRQUhYLGdCQUlJLDZCQUFDLGdCQUFELE9BSkosQ0FESjtNQVFIO0lBQ0osQ0FwQkQsTUFvQk87TUFDSCxvQkFBTyw2QkFBQyw0QkFBRDtRQUFxQixVQUFVLEVBQUUsS0FBS0M7TUFBdEMsRUFBUDtJQUNIO0VBQ0o7O0FBcER1RiJ9