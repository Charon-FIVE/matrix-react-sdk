"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _BaseDialog = _interopRequireDefault(require("../../../../components/views/dialogs/BaseDialog"));

var _Spinner = _interopRequireDefault(require("../../../../components/views/elements/Spinner"));

var _DialogButtons = _interopRequireDefault(require("../../../../components/views/elements/DialogButtons"));

var _dispatcher = _interopRequireDefault(require("../../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../../settings/SettingsStore"));

var _EventIndexPeg = _interopRequireDefault(require("../../../../indexing/EventIndexPeg"));

var _actions = require("../../../../dispatcher/actions");

var _SettingLevel = require("../../../../settings/SettingLevel");

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

/*
 * Allows the user to disable the Event Index.
 */
class DisableEventIndexDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onDisable", async () => {
      this.setState({
        disabling: true
      });
      await _SettingsStore.default.setValue('enableEventIndexing', null, _SettingLevel.SettingLevel.DEVICE, false);
      await _EventIndexPeg.default.deleteEventIndex();
      this.props.onFinished(true);

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
    this.state = {
      disabling: false
    };
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Are you sure?")
    }, (0, _languageHandler._t)("If disabled, messages from encrypted rooms won't appear in search results."), this.state.disabling ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement("div", null), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Disable'),
      onPrimaryButtonClick: this.onDisable,
      primaryButtonClass: "danger",
      cancelButtonClass: "warning",
      onCancel: this.props.onFinished,
      disabled: this.state.disabling
    }));
  }

}

exports.default = DisableEventIndexDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaXNhYmxlRXZlbnRJbmRleERpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwiZGlzYWJsaW5nIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwiRXZlbnRJbmRleFBlZyIsImRlbGV0ZUV2ZW50SW5kZXgiLCJvbkZpbmlzaGVkIiwiZGlzIiwiZmlyZSIsIkFjdGlvbiIsIlZpZXdVc2VyU2V0dGluZ3MiLCJzdGF0ZSIsInJlbmRlciIsIl90Iiwib25EaXNhYmxlIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9ldmVudGluZGV4L0Rpc2FibGVFdmVudEluZGV4RGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBFdmVudEluZGV4UGVnIGZyb20gXCIuLi8uLi8uLi8uLi9pbmRleGluZy9FdmVudEluZGV4UGVnXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBkaXNhYmxpbmc6IGJvb2xlYW47XG59XG5cbi8qXG4gKiBBbGxvd3MgdGhlIHVzZXIgdG8gZGlzYWJsZSB0aGUgRXZlbnQgSW5kZXguXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc2FibGVFdmVudEluZGV4RGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBkaXNhYmxpbmc6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25EaXNhYmxlID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc2FibGluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZSgnZW5hYmxlRXZlbnRJbmRleGluZycsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIGZhbHNlKTtcbiAgICAgICAgYXdhaXQgRXZlbnRJbmRleFBlZy5kZWxldGVFdmVudEluZGV4KCk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9IHRpdGxlPXtfdChcIkFyZSB5b3Ugc3VyZT9cIil9PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJJZiBkaXNhYmxlZCwgbWVzc2FnZXMgZnJvbSBlbmNyeXB0ZWQgcm9vbXMgd29uJ3QgYXBwZWFyIGluIHNlYXJjaCByZXN1bHRzLlwiKSB9XG4gICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmRpc2FibGluZyA/IDxTcGlubmVyIC8+IDogPGRpdiAvPiB9XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ0Rpc2FibGUnKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25EaXNhYmxlfVxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uQ2xhc3M9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25DbGFzcz1cIndhcm5pbmdcIlxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5kaXNhYmxpbmd9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBc0JBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLHVCQUFOLFNBQXNDQyxjQUFBLENBQU1DLFNBQTVDLENBQXNFO0VBQ2pGQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1QixpREFPUCxZQUEyQjtNQUMzQyxLQUFLQyxRQUFMLENBQWM7UUFDVkMsU0FBUyxFQUFFO01BREQsQ0FBZDtNQUlBLE1BQU1DLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIscUJBQXZCLEVBQThDLElBQTlDLEVBQW9EQywwQkFBQSxDQUFhQyxNQUFqRSxFQUF5RSxLQUF6RSxDQUFOO01BQ0EsTUFBTUMsc0JBQUEsQ0FBY0MsZ0JBQWQsRUFBTjtNQUNBLEtBQUtSLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQixJQUF0Qjs7TUFDQUMsbUJBQUEsQ0FBSUMsSUFBSixDQUFTQyxlQUFBLENBQU9DLGdCQUFoQjtJQUNILENBaEIwQjtJQUV2QixLQUFLQyxLQUFMLEdBQWE7TUFDVFosU0FBUyxFQUFFO0lBREYsQ0FBYjtFQUdIOztFQWFNYSxNQUFNLEdBQW9CO0lBQzdCLG9CQUNJLDZCQUFDLG1CQUFEO01BQVksVUFBVSxFQUFFLEtBQUtmLEtBQUwsQ0FBV1MsVUFBbkM7TUFBK0MsS0FBSyxFQUFFLElBQUFPLG1CQUFBLEVBQUcsZUFBSDtJQUF0RCxHQUNNLElBQUFBLG1CQUFBLEVBQUcsNEVBQUgsQ0FETixFQUVNLEtBQUtGLEtBQUwsQ0FBV1osU0FBWCxnQkFBdUIsNkJBQUMsZ0JBQUQsT0FBdkIsZ0JBQXFDLHlDQUYzQyxlQUdJLDZCQUFDLHNCQUFEO01BQ0ksYUFBYSxFQUFFLElBQUFjLG1CQUFBLEVBQUcsU0FBSCxDQURuQjtNQUVJLG9CQUFvQixFQUFFLEtBQUtDLFNBRi9CO01BR0ksa0JBQWtCLEVBQUMsUUFIdkI7TUFJSSxpQkFBaUIsRUFBQyxTQUp0QjtNQUtJLFFBQVEsRUFBRSxLQUFLakIsS0FBTCxDQUFXUyxVQUx6QjtNQU1JLFFBQVEsRUFBRSxLQUFLSyxLQUFMLENBQVdaO0lBTnpCLEVBSEosQ0FESjtFQWNIOztBQWxDZ0YifQ==