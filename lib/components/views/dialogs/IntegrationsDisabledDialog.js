"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

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
class IntegrationsDisabledDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onAcknowledgeClick", () => {
      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onOpenSettingsClick", () => {
      this.props.onFinished();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_IntegrationsDisabledDialog",
      hasCancel: true,
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Integrations are disabled")
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_IntegrationsDisabledDialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enable 'Manage Integrations' in Settings to do this."))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Settings"),
      onPrimaryButtonClick: this.onOpenSettingsClick,
      cancelButton: (0, _languageHandler._t)("OK"),
      onCancel: this.onAcknowledgeClick
    }));
  }

}

exports.default = IntegrationsDisabledDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlZ3JhdGlvbnNEaXNhYmxlZERpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwicHJvcHMiLCJvbkZpbmlzaGVkIiwiZGlzIiwiZmlyZSIsIkFjdGlvbiIsIlZpZXdVc2VyU2V0dGluZ3MiLCJyZW5kZXIiLCJfdCIsIm9uT3BlblNldHRpbmdzQ2xpY2siLCJvbkFja25vd2xlZGdlQ2xpY2siXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0ludGVncmF0aW9uc0Rpc2FibGVkRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7fVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlZ3JhdGlvbnNEaXNhYmxlZERpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIG9uQWNrbm93bGVkZ2VDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25PcGVuU2V0dGluZ3NDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3VXNlclNldHRpbmdzKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfSW50ZWdyYXRpb25zRGlzYWJsZWREaWFsb2cnXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJJbnRlZ3JhdGlvbnMgYXJlIGRpc2FibGVkXCIpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnRlZ3JhdGlvbnNEaXNhYmxlZERpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIkVuYWJsZSAnTWFuYWdlIEludGVncmF0aW9ucycgaW4gU2V0dGluZ3MgdG8gZG8gdGhpcy5cIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIlNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbk9wZW5TZXR0aW5nc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b249e190KFwiT0tcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uQWNrbm93bGVkZ2VDbGlja31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFlLE1BQU1BLDBCQUFOLFNBQXlDQyxjQUFBLENBQU1DLFNBQS9DLENBQWlFO0VBQUE7SUFBQTtJQUFBLDBEQUMvQyxNQUFZO01BQ3JDLEtBQUtDLEtBQUwsQ0FBV0MsVUFBWDtJQUNILENBSDJFO0lBQUEsMkRBSzlDLE1BQVk7TUFDdEMsS0FBS0QsS0FBTCxDQUFXQyxVQUFYOztNQUNBQyxtQkFBQSxDQUFJQyxJQUFKLENBQVNDLGVBQUEsQ0FBT0MsZ0JBQWhCO0lBQ0gsQ0FSMkU7RUFBQTs7RUFVckVDLE1BQU0sR0FBZ0I7SUFDekIsb0JBQ0ksNkJBQUMsbUJBQUQ7TUFDSSxTQUFTLEVBQUMsK0JBRGQ7TUFFSSxTQUFTLEVBQUUsSUFGZjtNQUdJLFVBQVUsRUFBRSxLQUFLTixLQUFMLENBQVdDLFVBSDNCO01BSUksS0FBSyxFQUFFLElBQUFNLG1CQUFBLEVBQUcsMkJBQUg7SUFKWCxnQkFNSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJLHdDQUFLLElBQUFBLG1CQUFBLEVBQUcsc0RBQUgsQ0FBTCxDQURKLENBTkosZUFTSSw2QkFBQyxzQkFBRDtNQUNJLGFBQWEsRUFBRSxJQUFBQSxtQkFBQSxFQUFHLFVBQUgsQ0FEbkI7TUFFSSxvQkFBb0IsRUFBRSxLQUFLQyxtQkFGL0I7TUFHSSxZQUFZLEVBQUUsSUFBQUQsbUJBQUEsRUFBRyxJQUFILENBSGxCO01BSUksUUFBUSxFQUFFLEtBQUtFO0lBSm5CLEVBVEosQ0FESjtFQWtCSDs7QUE3QjJFIn0=