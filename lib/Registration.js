"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SAFE_LOCALPART_REGEX = void 0;
exports.startAnyRegistrationFlow = startAnyRegistrationFlow;

var _react = _interopRequireDefault(require("react"));

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("./Modal"));

var _languageHandler = require("./languageHandler");

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _actions = require("./dispatcher/actions");

/*
Copyright 2018 New Vector Ltd

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

/**
 * Utility code for registering with a homeserver
 * Note that this is currently *not* used by the actual
 * registration code.
 */
// Regex for what a "safe" or "Matrix-looking" localpart would be.
// TODO: Update as needed for https://github.com/matrix-org/matrix-doc/issues/1514
const SAFE_LOCALPART_REGEX = /^[a-z0-9=_\-./]+$/;
/**
 * Starts either the ILAG or full registration flow, depending
 * on what the HS supports
 *
 * @param {object} options
 * @param {bool} options.go_home_on_cancel
 *     If true, goes to the home page if the user cancels the action
 * @param {bool} options.go_welcome_on_cancel
 *     If true, goes to the welcome page if the user cancels the action
 * @param {bool} options.screen_after
 *     If present the screen to redirect to after a successful login or register.
 */

exports.SAFE_LOCALPART_REGEX = SAFE_LOCALPART_REGEX;

async function startAnyRegistrationFlow( // eslint-disable-next-line camelcase
options) {
  if (options === undefined) options = {};

  const modal = _Modal.default.createDialog(_QuestionDialog.default, {
    hasCancelButton: true,
    quitOnly: true,
    title: (0, _languageHandler._t)("Sign In or Create Account"),
    description: (0, _languageHandler._t)("Use your account or create a new one to continue."),
    button: (0, _languageHandler._t)("Create Account"),
    extraButtons: [/*#__PURE__*/_react.default.createElement("button", {
      key: "start_login",
      onClick: () => {
        modal.close();

        _dispatcher.default.dispatch({
          action: 'start_login',
          screenAfterLogin: options.screen_after
        });
      }
    }, (0, _languageHandler._t)('Sign In'))],
    onFinished: proceed => {
      if (proceed) {
        _dispatcher.default.dispatch({
          action: 'start_registration',
          screenAfterLogin: options.screen_after
        });
      } else if (options.go_home_on_cancel) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewHomePage
        });
      } else if (options.go_welcome_on_cancel) {
        _dispatcher.default.dispatch({
          action: 'view_welcome_page'
        });
      }
    }
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTQUZFX0xPQ0FMUEFSVF9SRUdFWCIsInN0YXJ0QW55UmVnaXN0cmF0aW9uRmxvdyIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJtb2RhbCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiUXVlc3Rpb25EaWFsb2ciLCJoYXNDYW5jZWxCdXR0b24iLCJxdWl0T25seSIsInRpdGxlIiwiX3QiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsImV4dHJhQnV0dG9ucyIsImNsb3NlIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJzY3JlZW5BZnRlckxvZ2luIiwic2NyZWVuX2FmdGVyIiwib25GaW5pc2hlZCIsInByb2NlZWQiLCJnb19ob21lX29uX2NhbmNlbCIsIkFjdGlvbiIsIlZpZXdIb21lUGFnZSIsImdvX3dlbGNvbWVfb25fY2FuY2VsIl0sInNvdXJjZXMiOlsiLi4vc3JjL1JlZ2lzdHJhdGlvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLyoqXG4gKiBVdGlsaXR5IGNvZGUgZm9yIHJlZ2lzdGVyaW5nIHdpdGggYSBob21lc2VydmVyXG4gKiBOb3RlIHRoYXQgdGhpcyBpcyBjdXJyZW50bHkgKm5vdCogdXNlZCBieSB0aGUgYWN0dWFsXG4gKiByZWdpc3RyYXRpb24gY29kZS5cbiAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcblxuLy8gUmVnZXggZm9yIHdoYXQgYSBcInNhZmVcIiBvciBcIk1hdHJpeC1sb29raW5nXCIgbG9jYWxwYXJ0IHdvdWxkIGJlLlxuLy8gVE9ETzogVXBkYXRlIGFzIG5lZWRlZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvbWF0cml4LWRvYy9pc3N1ZXMvMTUxNFxuZXhwb3J0IGNvbnN0IFNBRkVfTE9DQUxQQVJUX1JFR0VYID0gL15bYS16MC05PV9cXC0uL10rJC87XG5cbi8qKlxuICogU3RhcnRzIGVpdGhlciB0aGUgSUxBRyBvciBmdWxsIHJlZ2lzdHJhdGlvbiBmbG93LCBkZXBlbmRpbmdcbiAqIG9uIHdoYXQgdGhlIEhTIHN1cHBvcnRzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7Ym9vbH0gb3B0aW9ucy5nb19ob21lX29uX2NhbmNlbFxuICogICAgIElmIHRydWUsIGdvZXMgdG8gdGhlIGhvbWUgcGFnZSBpZiB0aGUgdXNlciBjYW5jZWxzIHRoZSBhY3Rpb25cbiAqIEBwYXJhbSB7Ym9vbH0gb3B0aW9ucy5nb193ZWxjb21lX29uX2NhbmNlbFxuICogICAgIElmIHRydWUsIGdvZXMgdG8gdGhlIHdlbGNvbWUgcGFnZSBpZiB0aGUgdXNlciBjYW5jZWxzIHRoZSBhY3Rpb25cbiAqIEBwYXJhbSB7Ym9vbH0gb3B0aW9ucy5zY3JlZW5fYWZ0ZXJcbiAqICAgICBJZiBwcmVzZW50IHRoZSBzY3JlZW4gdG8gcmVkaXJlY3QgdG8gYWZ0ZXIgYSBzdWNjZXNzZnVsIGxvZ2luIG9yIHJlZ2lzdGVyLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRBbnlSZWdpc3RyYXRpb25GbG93KFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBvcHRpb25zOiB7IGdvX2hvbWVfb25fY2FuY2VsPzogYm9vbGVhbiwgZ29fd2VsY29tZV9vbl9jYW5jZWw/OiBib29sZWFuLCBzY3JlZW5fYWZ0ZXI/OiBib29sZWFufSxcbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIG9wdGlvbnMgPSB7fTtcbiAgICBjb25zdCBtb2RhbCA9IE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICBoYXNDYW5jZWxCdXR0b246IHRydWUsXG4gICAgICAgIHF1aXRPbmx5OiB0cnVlLFxuICAgICAgICB0aXRsZTogX3QoXCJTaWduIEluIG9yIENyZWF0ZSBBY2NvdW50XCIpLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJVc2UgeW91ciBhY2NvdW50IG9yIGNyZWF0ZSBhIG5ldyBvbmUgdG8gY29udGludWUuXCIpLFxuICAgICAgICBidXR0b246IF90KFwiQ3JlYXRlIEFjY291bnRcIiksXG4gICAgICAgIGV4dHJhQnV0dG9uczogW1xuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGtleT1cInN0YXJ0X2xvZ2luXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3N0YXJ0X2xvZ2luJywgc2NyZWVuQWZ0ZXJMb2dpbjogb3B0aW9ucy5zY3JlZW5fYWZ0ZXIgfSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KCdTaWduIEluJykgfVxuICAgICAgICAgICAgPC9idXR0b24+LFxuICAgICAgICBdLFxuICAgICAgICBvbkZpbmlzaGVkOiAocHJvY2VlZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb2NlZWQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nLCBzY3JlZW5BZnRlckxvZ2luOiBvcHRpb25zLnNjcmVlbl9hZnRlciB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5nb19ob21lX29uX2NhbmNlbCkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogQWN0aW9uLlZpZXdIb21lUGFnZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5nb193ZWxjb21lX29uX2NhbmNlbCkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3ZpZXdfd2VsY29tZV9wYWdlJyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQXNCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQTtBQUNBO0FBQ08sTUFBTUEsb0JBQW9CLEdBQUcsbUJBQTdCO0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBQ08sZUFBZUMsd0JBQWYsRUFDSDtBQUNBQyxPQUZHLEVBR1U7RUFDYixJQUFJQSxPQUFPLEtBQUtDLFNBQWhCLEVBQTJCRCxPQUFPLEdBQUcsRUFBVjs7RUFDM0IsTUFBTUUsS0FBSyxHQUFHQyxjQUFBLENBQU1DLFlBQU4sQ0FBbUJDLHVCQUFuQixFQUFtQztJQUM3Q0MsZUFBZSxFQUFFLElBRDRCO0lBRTdDQyxRQUFRLEVBQUUsSUFGbUM7SUFHN0NDLEtBQUssRUFBRSxJQUFBQyxtQkFBQSxFQUFHLDJCQUFILENBSHNDO0lBSTdDQyxXQUFXLEVBQUUsSUFBQUQsbUJBQUEsRUFBRyxtREFBSCxDQUpnQztJQUs3Q0UsTUFBTSxFQUFFLElBQUFGLG1CQUFBLEVBQUcsZ0JBQUgsQ0FMcUM7SUFNN0NHLFlBQVksRUFBRSxjQUNWO01BQ0ksR0FBRyxFQUFDLGFBRFI7TUFFSSxPQUFPLEVBQUUsTUFBTTtRQUNYVixLQUFLLENBQUNXLEtBQU47O1FBQ0FDLG1CQUFBLENBQUlDLFFBQUosQ0FBYTtVQUFFQyxNQUFNLEVBQUUsYUFBVjtVQUF5QkMsZ0JBQWdCLEVBQUVqQixPQUFPLENBQUNrQjtRQUFuRCxDQUFiO01BQ0g7SUFMTCxHQU9NLElBQUFULG1CQUFBLEVBQUcsU0FBSCxDQVBOLENBRFUsQ0FOK0I7SUFpQjdDVSxVQUFVLEVBQUdDLE9BQUQsSUFBYTtNQUNyQixJQUFJQSxPQUFKLEVBQWE7UUFDVE4sbUJBQUEsQ0FBSUMsUUFBSixDQUFhO1VBQUVDLE1BQU0sRUFBRSxvQkFBVjtVQUFnQ0MsZ0JBQWdCLEVBQUVqQixPQUFPLENBQUNrQjtRQUExRCxDQUFiO01BQ0gsQ0FGRCxNQUVPLElBQUlsQixPQUFPLENBQUNxQixpQkFBWixFQUErQjtRQUNsQ1AsbUJBQUEsQ0FBSUMsUUFBSixDQUFhO1VBQUVDLE1BQU0sRUFBRU0sZUFBQSxDQUFPQztRQUFqQixDQUFiO01BQ0gsQ0FGTSxNQUVBLElBQUl2QixPQUFPLENBQUN3QixvQkFBWixFQUFrQztRQUNyQ1YsbUJBQUEsQ0FBSUMsUUFBSixDQUFhO1VBQUVDLE1BQU0sRUFBRTtRQUFWLENBQWI7TUFDSDtJQUNKO0VBekI0QyxDQUFuQyxDQUFkO0FBMkJIIn0=