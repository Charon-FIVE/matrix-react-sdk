"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRedactEventDialog = createRedactEventDialog;
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("./ErrorDialog"));

var _TextInputDialog = _interopRequireDefault(require("./TextInputDialog"));

/*
Copyright 2017 Vector Creations Ltd

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
 */
class ConfirmRedactDialog extends _react.default.Component {
  render() {
    return /*#__PURE__*/_react.default.createElement(_TextInputDialog.default, {
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Confirm Removal"),
      description: (0, _languageHandler._t)("Are you sure you wish to remove (delete) this event? " + "Note that if you delete a room name or topic change, it could undo the change."),
      placeholder: (0, _languageHandler._t)("Reason (optional)"),
      focus: true,
      button: (0, _languageHandler._t)("Remove")
    });
  }

}

exports.default = ConfirmRedactDialog;

function createRedactEventDialog(_ref) {
  let {
    mxEvent,
    onCloseDialog = () => {}
  } = _ref;

  _Modal.default.createDialog(ConfirmRedactDialog, {
    onFinished: async (proceed, reason) => {
      if (!proceed) return;

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        onCloseDialog?.();
        await cli.redactEvent(mxEvent.getRoomId(), mxEvent.getId(), undefined, reason ? {
          reason
        } : {});
      } catch (e) {
        const code = e.errcode || e.statusCode; // only show the dialog if failing for something other than a network error
        // (e.g. no errcode or statusCode) as in that case the redactions end up in the
        // detached queue and we show the room status bar to allow retry

        if (typeof code !== "undefined") {
          // display error message stating you couldn't delete this.
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)('Error'),
            description: (0, _languageHandler._t)('You cannot delete this message. (%(code)s)', {
              code
            })
          });
        }
      }
    }
  }, 'mx_Dialog_confirmredact');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25maXJtUmVkYWN0RGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJyZW5kZXIiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJfdCIsImNyZWF0ZVJlZGFjdEV2ZW50RGlhbG9nIiwibXhFdmVudCIsIm9uQ2xvc2VEaWFsb2ciLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsInByb2NlZWQiLCJyZWFzb24iLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyZWRhY3RFdmVudCIsImdldFJvb21JZCIsImdldElkIiwidW5kZWZpbmVkIiwiZSIsImNvZGUiLCJlcnJjb2RlIiwic3RhdHVzQ29kZSIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ29uZmlybVJlZGFjdERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSAnLi9FcnJvckRpYWxvZyc7XG5pbXBvcnQgVGV4dElucHV0RGlhbG9nIGZyb20gXCIuL1RleHRJbnB1dERpYWxvZ1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvbkZpbmlzaGVkOiAoc3VjY2VzczogYm9vbGVhbikgPT4gdm9pZDtcbn1cblxuLypcbiAqIEEgZGlhbG9nIGZvciBjb25maXJtaW5nIGEgcmVkYWN0aW9uLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maXJtUmVkYWN0RGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxUZXh0SW5wdXREaWFsb2cgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkNvbmZpcm0gUmVtb3ZhbFwiKX1cbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbj17XG4gICAgICAgICAgICAgICAgICAgIF90KFwiQXJlIHlvdSBzdXJlIHlvdSB3aXNoIHRvIHJlbW92ZSAoZGVsZXRlKSB0aGlzIGV2ZW50PyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgIFwiTm90ZSB0aGF0IGlmIHlvdSBkZWxldGUgYSByb29tIG5hbWUgb3IgdG9waWMgY2hhbmdlLCBpdCBjb3VsZCB1bmRvIHRoZSBjaGFuZ2UuXCIpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIlJlYXNvbiAob3B0aW9uYWwpXCIpfVxuICAgICAgICAgICAgICAgIGZvY3VzXG4gICAgICAgICAgICAgICAgYnV0dG9uPXtfdChcIlJlbW92ZVwiKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVkYWN0RXZlbnREaWFsb2coe1xuICAgIG14RXZlbnQsXG4gICAgb25DbG9zZURpYWxvZyA9ICgpID0+IHt9LFxufToge1xuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xuICAgIG9uQ2xvc2VEaWFsb2c/OiAoKSA9PiB2b2lkO1xufSkge1xuICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhDb25maXJtUmVkYWN0RGlhbG9nLCB7XG4gICAgICAgIG9uRmluaXNoZWQ6IGFzeW5jIChwcm9jZWVkOiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG9uQ2xvc2VEaWFsb2c/LigpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5yZWRhY3RFdmVudChcbiAgICAgICAgICAgICAgICAgICAgbXhFdmVudC5nZXRSb29tSWQoKSxcbiAgICAgICAgICAgICAgICAgICAgbXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbiA/IHsgcmVhc29uIH0gOiB7fSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBlLmVycmNvZGUgfHwgZS5zdGF0dXNDb2RlO1xuICAgICAgICAgICAgICAgIC8vIG9ubHkgc2hvdyB0aGUgZGlhbG9nIGlmIGZhaWxpbmcgZm9yIHNvbWV0aGluZyBvdGhlciB0aGFuIGEgbmV0d29yayBlcnJvclxuICAgICAgICAgICAgICAgIC8vIChlLmcuIG5vIGVycmNvZGUgb3Igc3RhdHVzQ29kZSkgYXMgaW4gdGhhdCBjYXNlIHRoZSByZWRhY3Rpb25zIGVuZCB1cCBpbiB0aGVcbiAgICAgICAgICAgICAgICAvLyBkZXRhY2hlZCBxdWV1ZSBhbmQgd2Ugc2hvdyB0aGUgcm9vbSBzdGF0dXMgYmFyIHRvIGFsbG93IHJldHJ5XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb2RlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRpc3BsYXkgZXJyb3IgbWVzc2FnZSBzdGF0aW5nIHlvdSBjb3VsZG4ndCBkZWxldGUgdGhpcy5cbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ1lvdSBjYW5ub3QgZGVsZXRlIHRoaXMgbWVzc2FnZS4gKCUoY29kZSlzKScsIHsgY29kZSB9KSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0sICdteF9EaWFsb2dfY29uZmlybXJlZGFjdCcpO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBZUE7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsbUJBQU4sU0FBa0NDLGNBQUEsQ0FBTUMsU0FBeEMsQ0FBMEQ7RUFDckVDLE1BQU0sR0FBRztJQUNMLG9CQUNJLDZCQUFDLHdCQUFEO01BQWlCLFVBQVUsRUFBRSxLQUFLQyxLQUFMLENBQVdDLFVBQXhDO01BQ0ksS0FBSyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsaUJBQUgsQ0FEWDtNQUVJLFdBQVcsRUFDUCxJQUFBQSxtQkFBQSxFQUFHLDBEQUNBLGdGQURILENBSFI7TUFLSSxXQUFXLEVBQUUsSUFBQUEsbUJBQUEsRUFBRyxtQkFBSCxDQUxqQjtNQU1JLEtBQUssTUFOVDtNQU9JLE1BQU0sRUFBRSxJQUFBQSxtQkFBQSxFQUFHLFFBQUg7SUFQWixFQURKO0VBV0g7O0FBYm9FOzs7O0FBZ0JsRSxTQUFTQyx1QkFBVCxPQU1KO0VBQUEsSUFOcUM7SUFDcENDLE9BRG9DO0lBRXBDQyxhQUFhLEdBQUcsTUFBTSxDQUFFO0VBRlksQ0FNckM7O0VBQ0NDLGNBQUEsQ0FBTUMsWUFBTixDQUFtQlgsbUJBQW5CLEVBQXdDO0lBQ3BDSyxVQUFVLEVBQUUsT0FBT08sT0FBUCxFQUF5QkMsTUFBekIsS0FBNkM7TUFDckQsSUFBSSxDQUFDRCxPQUFMLEVBQWM7O01BRWQsTUFBTUUsR0FBRyxHQUFHQyxnQ0FBQSxDQUFnQkMsR0FBaEIsRUFBWjs7TUFDQSxJQUFJO1FBQ0FQLGFBQWE7UUFDYixNQUFNSyxHQUFHLENBQUNHLFdBQUosQ0FDRlQsT0FBTyxDQUFDVSxTQUFSLEVBREUsRUFFRlYsT0FBTyxDQUFDVyxLQUFSLEVBRkUsRUFHRkMsU0FIRSxFQUlGUCxNQUFNLEdBQUc7VUFBRUE7UUFBRixDQUFILEdBQWdCLEVBSnBCLENBQU47TUFNSCxDQVJELENBUUUsT0FBT1EsQ0FBUCxFQUFVO1FBQ1IsTUFBTUMsSUFBSSxHQUFHRCxDQUFDLENBQUNFLE9BQUYsSUFBYUYsQ0FBQyxDQUFDRyxVQUE1QixDQURRLENBRVI7UUFDQTtRQUNBOztRQUNBLElBQUksT0FBT0YsSUFBUCxLQUFnQixXQUFwQixFQUFpQztVQUM3QjtVQUNBWixjQUFBLENBQU1DLFlBQU4sQ0FBbUJjLG9CQUFuQixFQUFnQztZQUM1QkMsS0FBSyxFQUFFLElBQUFwQixtQkFBQSxFQUFHLE9BQUgsQ0FEcUI7WUFFNUJxQixXQUFXLEVBQUUsSUFBQXJCLG1CQUFBLEVBQUcsNENBQUgsRUFBaUQ7Y0FBRWdCO1lBQUYsQ0FBakQ7VUFGZSxDQUFoQztRQUlIO01BQ0o7SUFDSjtFQTFCbUMsQ0FBeEMsRUEyQkcseUJBM0JIO0FBNEJIIn0=