"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SetupEncryptionStore = require("../../../stores/SetupEncryptionStore");

var _SetupEncryptionBody = _interopRequireDefault(require("./SetupEncryptionBody"));

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _CompleteSecurityBody = _interopRequireDefault(require("../../views/auth/CompleteSecurityBody"));

var _AuthPage = _interopRequireDefault(require("../../views/auth/AuthPage"));

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
class CompleteSecurity extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onStoreUpdate", () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      this.setState({
        phase: store.phase,
        lostKeys: store.lostKeys()
      });
    });
    (0, _defineProperty2.default)(this, "onSkipClick", () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      store.skip();
    });

    const _store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

    _store.on("update", this.onStoreUpdate);

    _store.start();

    this.state = {
      phase: _store.phase,
      lostKeys: _store.lostKeys()
    };
  }

  componentWillUnmount() {
    const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

    store.off("update", this.onStoreUpdate);
    store.stop();
  }

  render() {
    const {
      phase,
      lostKeys
    } = this.state;
    let icon;
    let title;

    if (phase === _SetupEncryptionStore.Phase.Loading) {
      return null;
    } else if (phase === _SetupEncryptionStore.Phase.Intro) {
      if (lostKeys) {
        icon = /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_warning"
        });
        title = (0, _languageHandler._t)("Unable to verify this device");
      } else {
        icon = /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_warning"
        });
        title = (0, _languageHandler._t)("Verify this device");
      }
    } else if (phase === _SetupEncryptionStore.Phase.Done) {
      icon = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_verified"
      });
      title = (0, _languageHandler._t)("Device verified");
    } else if (phase === _SetupEncryptionStore.Phase.ConfirmSkip) {
      icon = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_warning"
      });
      title = (0, _languageHandler._t)("Are you sure?");
    } else if (phase === _SetupEncryptionStore.Phase.Busy) {
      icon = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_warning"
      });
      title = (0, _languageHandler._t)("Verify this device");
    } else if (phase === _SetupEncryptionStore.Phase.ConfirmReset) {
      icon = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_warning"
      });
      title = (0, _languageHandler._t)("Really reset verification keys?");
    } else if (phase === _SetupEncryptionStore.Phase.Finished) {// SetupEncryptionBody will take care of calling onFinished, we don't need to do anything
    } else {
      throw new Error(`Unknown phase ${phase}`);
    }

    let skipButton;

    if (phase === _SetupEncryptionStore.Phase.Intro || phase === _SetupEncryptionStore.Phase.ConfirmReset) {
      skipButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onSkipClick,
        className: "mx_CompleteSecurity_skip",
        "aria-label": (0, _languageHandler._t)("Skip verification for now")
      });
    }

    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement(_CompleteSecurityBody.default, null, /*#__PURE__*/_react.default.createElement("h1", {
      className: "mx_CompleteSecurity_header"
    }, icon, title, skipButton), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CompleteSecurity_body"
    }, /*#__PURE__*/_react.default.createElement(_SetupEncryptionBody.default, {
      onFinished: this.props.onFinished
    }))));
  }

}

exports.default = CompleteSecurity;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21wbGV0ZVNlY3VyaXR5IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RvcmUiLCJTZXR1cEVuY3J5cHRpb25TdG9yZSIsInNoYXJlZEluc3RhbmNlIiwic2V0U3RhdGUiLCJwaGFzZSIsImxvc3RLZXlzIiwic2tpcCIsIm9uIiwib25TdG9yZVVwZGF0ZSIsInN0YXJ0Iiwic3RhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInN0b3AiLCJyZW5kZXIiLCJpY29uIiwidGl0bGUiLCJQaGFzZSIsIkxvYWRpbmciLCJJbnRybyIsIl90IiwiRG9uZSIsIkNvbmZpcm1Ta2lwIiwiQnVzeSIsIkNvbmZpcm1SZXNldCIsIkZpbmlzaGVkIiwiRXJyb3IiLCJza2lwQnV0dG9uIiwib25Ta2lwQ2xpY2siLCJvbkZpbmlzaGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9hdXRoL0NvbXBsZXRlU2VjdXJpdHkudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IFNldHVwRW5jcnlwdGlvblN0b3JlLCBQaGFzZSB9IGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9TZXR1cEVuY3J5cHRpb25TdG9yZSc7XG5pbXBvcnQgU2V0dXBFbmNyeXB0aW9uQm9keSBmcm9tIFwiLi9TZXR1cEVuY3J5cHRpb25Cb2R5XCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi8uLi92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBDb21wbGV0ZVNlY3VyaXR5Qm9keSBmcm9tIFwiLi4vLi4vdmlld3MvYXV0aC9Db21wbGV0ZVNlY3VyaXR5Qm9keVwiO1xuaW1wb3J0IEF1dGhQYWdlIGZyb20gXCIuLi8uLi92aWV3cy9hdXRoL0F1dGhQYWdlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG9uRmluaXNoZWQ6ICgpID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHBoYXNlOiBQaGFzZTtcbiAgICBsb3N0S2V5czogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGxldGVTZWN1cml0eSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICBjb25zdCBzdG9yZSA9IFNldHVwRW5jcnlwdGlvblN0b3JlLnNoYXJlZEluc3RhbmNlKCk7XG4gICAgICAgIHN0b3JlLm9uKFwidXBkYXRlXCIsIHRoaXMub25TdG9yZVVwZGF0ZSk7XG4gICAgICAgIHN0b3JlLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IHBoYXNlOiBzdG9yZS5waGFzZSwgbG9zdEtleXM6IHN0b3JlLmxvc3RLZXlzKCkgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RvcmVVcGRhdGUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gU2V0dXBFbmNyeXB0aW9uU3RvcmUuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBzdG9yZS5waGFzZSwgbG9zdEtleXM6IHN0b3JlLmxvc3RLZXlzKCkgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ta2lwQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gU2V0dXBFbmNyeXB0aW9uU3RvcmUuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgc3RvcmUuc2tpcCgpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gU2V0dXBFbmNyeXB0aW9uU3RvcmUuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgc3RvcmUub2ZmKFwidXBkYXRlXCIsIHRoaXMub25TdG9yZVVwZGF0ZSk7XG4gICAgICAgIHN0b3JlLnN0b3AoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IHBoYXNlLCBsb3N0S2V5cyB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgbGV0IGljb247XG4gICAgICAgIGxldCB0aXRsZTtcblxuICAgICAgICBpZiAocGhhc2UgPT09IFBoYXNlLkxvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHBoYXNlID09PSBQaGFzZS5JbnRybykge1xuICAgICAgICAgICAgaWYgKGxvc3RLZXlzKSB7XG4gICAgICAgICAgICAgICAgaWNvbiA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0NvbXBsZXRlU2VjdXJpdHlfaGVhZGVySWNvbiBteF9FMkVJY29uX3dhcm5pbmdcIiAvPjtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiVW5hYmxlIHRvIHZlcmlmeSB0aGlzIGRldmljZVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWNvbiA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0NvbXBsZXRlU2VjdXJpdHlfaGVhZGVySWNvbiBteF9FMkVJY29uX3dhcm5pbmdcIiAvPjtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiVmVyaWZ5IHRoaXMgZGV2aWNlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBoYXNlID09PSBQaGFzZS5Eb25lKSB7XG4gICAgICAgICAgICBpY29uID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9oZWFkZXJJY29uIG14X0UyRUljb25fdmVyaWZpZWRcIiAvPjtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJEZXZpY2UgdmVyaWZpZWRcIik7XG4gICAgICAgIH0gZWxzZSBpZiAocGhhc2UgPT09IFBoYXNlLkNvbmZpcm1Ta2lwKSB7XG4gICAgICAgICAgICBpY29uID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9oZWFkZXJJY29uIG14X0UyRUljb25fd2FybmluZ1wiIC8+O1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIkFyZSB5b3Ugc3VyZT9cIik7XG4gICAgICAgIH0gZWxzZSBpZiAocGhhc2UgPT09IFBoYXNlLkJ1c3kpIHtcbiAgICAgICAgICAgIGljb24gPSA8c3BhbiBjbGFzc05hbWU9XCJteF9Db21wbGV0ZVNlY3VyaXR5X2hlYWRlckljb24gbXhfRTJFSWNvbl93YXJuaW5nXCIgLz47XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiVmVyaWZ5IHRoaXMgZGV2aWNlXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHBoYXNlID09PSBQaGFzZS5Db25maXJtUmVzZXQpIHtcbiAgICAgICAgICAgIGljb24gPSA8c3BhbiBjbGFzc05hbWU9XCJteF9Db21wbGV0ZVNlY3VyaXR5X2hlYWRlckljb24gbXhfRTJFSWNvbl93YXJuaW5nXCIgLz47XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiUmVhbGx5IHJlc2V0IHZlcmlmaWNhdGlvbiBrZXlzP1wiKTtcbiAgICAgICAgfSBlbHNlIGlmIChwaGFzZSA9PT0gUGhhc2UuRmluaXNoZWQpIHtcbiAgICAgICAgICAgIC8vIFNldHVwRW5jcnlwdGlvbkJvZHkgd2lsbCB0YWtlIGNhcmUgb2YgY2FsbGluZyBvbkZpbmlzaGVkLCB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGhhc2UgJHtwaGFzZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBza2lwQnV0dG9uO1xuICAgICAgICBpZiAocGhhc2UgPT09IFBoYXNlLkludHJvIHx8IHBoYXNlID09PSBQaGFzZS5Db25maXJtUmVzZXQpIHtcbiAgICAgICAgICAgIHNraXBCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vblNraXBDbGlja30gY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9za2lwXCIgYXJpYS1sYWJlbD17X3QoXCJTa2lwIHZlcmlmaWNhdGlvbiBmb3Igbm93XCIpfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QXV0aFBhZ2U+XG4gICAgICAgICAgICAgICAgPENvbXBsZXRlU2VjdXJpdHlCb2R5PlxuICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaWNvbiB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRpdGxlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc2tpcEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2V0dXBFbmNyeXB0aW9uQm9keSBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvQ29tcGxldGVTZWN1cml0eUJvZHk+XG4gICAgICAgICAgICA8L0F1dGhQYWdlPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW9CZSxNQUFNQSxnQkFBTixTQUErQkMsY0FBQSxDQUFNQyxTQUFyQyxDQUErRDtFQUMxRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIscURBUUgsTUFBWTtNQUNoQyxNQUFNQyxLQUFLLEdBQUdDLDBDQUFBLENBQXFCQyxjQUFyQixFQUFkOztNQUNBLEtBQUtDLFFBQUwsQ0FBYztRQUFFQyxLQUFLLEVBQUVKLEtBQUssQ0FBQ0ksS0FBZjtRQUFzQkMsUUFBUSxFQUFFTCxLQUFLLENBQUNLLFFBQU47TUFBaEMsQ0FBZDtJQUNILENBWDBCO0lBQUEsbURBYUwsTUFBWTtNQUM5QixNQUFNTCxLQUFLLEdBQUdDLDBDQUFBLENBQXFCQyxjQUFyQixFQUFkOztNQUNBRixLQUFLLENBQUNNLElBQU47SUFDSCxDQWhCMEI7O0lBRXZCLE1BQU1OLE1BQUssR0FBR0MsMENBQUEsQ0FBcUJDLGNBQXJCLEVBQWQ7O0lBQ0FGLE1BQUssQ0FBQ08sRUFBTixDQUFTLFFBQVQsRUFBbUIsS0FBS0MsYUFBeEI7O0lBQ0FSLE1BQUssQ0FBQ1MsS0FBTjs7SUFDQSxLQUFLQyxLQUFMLEdBQWE7TUFBRU4sS0FBSyxFQUFFSixNQUFLLENBQUNJLEtBQWY7TUFBc0JDLFFBQVEsRUFBRUwsTUFBSyxDQUFDSyxRQUFOO0lBQWhDLENBQWI7RUFDSDs7RUFZTU0sb0JBQW9CLEdBQVM7SUFDaEMsTUFBTVgsS0FBSyxHQUFHQywwQ0FBQSxDQUFxQkMsY0FBckIsRUFBZDs7SUFDQUYsS0FBSyxDQUFDWSxHQUFOLENBQVUsUUFBVixFQUFvQixLQUFLSixhQUF6QjtJQUNBUixLQUFLLENBQUNhLElBQU47RUFDSDs7RUFFTUMsTUFBTSxHQUFHO0lBQ1osTUFBTTtNQUFFVixLQUFGO01BQVNDO0lBQVQsSUFBc0IsS0FBS0ssS0FBakM7SUFDQSxJQUFJSyxJQUFKO0lBQ0EsSUFBSUMsS0FBSjs7SUFFQSxJQUFJWixLQUFLLEtBQUthLDJCQUFBLENBQU1DLE9BQXBCLEVBQTZCO01BQ3pCLE9BQU8sSUFBUDtJQUNILENBRkQsTUFFTyxJQUFJZCxLQUFLLEtBQUthLDJCQUFBLENBQU1FLEtBQXBCLEVBQTJCO01BQzlCLElBQUlkLFFBQUosRUFBYztRQUNWVSxJQUFJLGdCQUFHO1VBQU0sU0FBUyxFQUFDO1FBQWhCLEVBQVA7UUFDQUMsS0FBSyxHQUFHLElBQUFJLG1CQUFBLEVBQUcsOEJBQUgsQ0FBUjtNQUNILENBSEQsTUFHTztRQUNITCxJQUFJLGdCQUFHO1VBQU0sU0FBUyxFQUFDO1FBQWhCLEVBQVA7UUFDQUMsS0FBSyxHQUFHLElBQUFJLG1CQUFBLEVBQUcsb0JBQUgsQ0FBUjtNQUNIO0lBQ0osQ0FSTSxNQVFBLElBQUloQixLQUFLLEtBQUthLDJCQUFBLENBQU1JLElBQXBCLEVBQTBCO01BQzdCTixJQUFJLGdCQUFHO1FBQU0sU0FBUyxFQUFDO01BQWhCLEVBQVA7TUFDQUMsS0FBSyxHQUFHLElBQUFJLG1CQUFBLEVBQUcsaUJBQUgsQ0FBUjtJQUNILENBSE0sTUFHQSxJQUFJaEIsS0FBSyxLQUFLYSwyQkFBQSxDQUFNSyxXQUFwQixFQUFpQztNQUNwQ1AsSUFBSSxnQkFBRztRQUFNLFNBQVMsRUFBQztNQUFoQixFQUFQO01BQ0FDLEtBQUssR0FBRyxJQUFBSSxtQkFBQSxFQUFHLGVBQUgsQ0FBUjtJQUNILENBSE0sTUFHQSxJQUFJaEIsS0FBSyxLQUFLYSwyQkFBQSxDQUFNTSxJQUFwQixFQUEwQjtNQUM3QlIsSUFBSSxnQkFBRztRQUFNLFNBQVMsRUFBQztNQUFoQixFQUFQO01BQ0FDLEtBQUssR0FBRyxJQUFBSSxtQkFBQSxFQUFHLG9CQUFILENBQVI7SUFDSCxDQUhNLE1BR0EsSUFBSWhCLEtBQUssS0FBS2EsMkJBQUEsQ0FBTU8sWUFBcEIsRUFBa0M7TUFDckNULElBQUksZ0JBQUc7UUFBTSxTQUFTLEVBQUM7TUFBaEIsRUFBUDtNQUNBQyxLQUFLLEdBQUcsSUFBQUksbUJBQUEsRUFBRyxpQ0FBSCxDQUFSO0lBQ0gsQ0FITSxNQUdBLElBQUloQixLQUFLLEtBQUthLDJCQUFBLENBQU1RLFFBQXBCLEVBQThCLENBQ2pDO0lBQ0gsQ0FGTSxNQUVBO01BQ0gsTUFBTSxJQUFJQyxLQUFKLENBQVcsaUJBQWdCdEIsS0FBTSxFQUFqQyxDQUFOO0lBQ0g7O0lBRUQsSUFBSXVCLFVBQUo7O0lBQ0EsSUFBSXZCLEtBQUssS0FBS2EsMkJBQUEsQ0FBTUUsS0FBaEIsSUFBeUJmLEtBQUssS0FBS2EsMkJBQUEsQ0FBTU8sWUFBN0MsRUFBMkQ7TUFDdkRHLFVBQVUsZ0JBQ04sNkJBQUMseUJBQUQ7UUFBa0IsT0FBTyxFQUFFLEtBQUtDLFdBQWhDO1FBQTZDLFNBQVMsRUFBQywwQkFBdkQ7UUFBa0YsY0FBWSxJQUFBUixtQkFBQSxFQUFHLDJCQUFIO01BQTlGLEVBREo7SUFHSDs7SUFFRCxvQkFDSSw2QkFBQyxpQkFBRCxxQkFDSSw2QkFBQyw2QkFBRCxxQkFDSTtNQUFJLFNBQVMsRUFBQztJQUFkLEdBQ01MLElBRE4sRUFFTUMsS0FGTixFQUdNVyxVQUhOLENBREosZUFNSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJLDZCQUFDLDRCQUFEO01BQXFCLFVBQVUsRUFBRSxLQUFLNUIsS0FBTCxDQUFXOEI7SUFBNUMsRUFESixDQU5KLENBREosQ0FESjtFQWNIOztBQS9FeUUifQ==