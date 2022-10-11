"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("./languageHandler");

var _BaseDialog = _interopRequireDefault(require("./components/views/dialogs/BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("./components/views/elements/DialogButtons"));

var _Spinner = _interopRequireDefault(require("./components/views/elements/Spinner"));

/*
Copyright 2015-2021 The Matrix.org Foundation C.I.C.

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
 * Wrap an asynchronous loader function with a react component which shows a
 * spinner until the real component loads.
 */
class AsyncWrapper extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "state", {
      component: null,
      error: null
    });
    (0, _defineProperty2.default)(this, "onWrapperCancelClick", () => {
      this.props.onFinished(false);
    });
  }

  componentDidMount() {
    // XXX: temporary logging to try to diagnose
    // https://github.com/vector-im/element-web/issues/3148
    _logger.logger.log('Starting load of AsyncWrapper for modal');

    this.props.prom.then(result => {
      if (this.unmounted) return; // Take the 'default' member if it's there, then we support
      // passing in just an import()ed module, since ES6 async import
      // always returns a module *namespace*.

      const component = result.default ? result.default : result;
      this.setState({
        component
      });
    }).catch(e => {
      _logger.logger.warn('AsyncWrapper promise failed', e);

      this.setState({
        error: e
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    if (this.state.component) {
      const Component = this.state.component;
      return /*#__PURE__*/_react.default.createElement(Component, this.props);
    } else if (this.state.error) {
      return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
        onFinished: this.props.onFinished,
        title: (0, _languageHandler._t)("Error")
      }, (0, _languageHandler._t)("Unable to load! Check your network connectivity and try again."), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("Dismiss"),
        onPrimaryButtonClick: this.onWrapperCancelClick,
        hasCancel: false
      }));
    } else {
      // show a spinner until the component is loaded.
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }
  }

}

exports.default = AsyncWrapper;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBc3luY1dyYXBwZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbXBvbmVudCIsImVycm9yIiwicHJvcHMiLCJvbkZpbmlzaGVkIiwiY29tcG9uZW50RGlkTW91bnQiLCJsb2dnZXIiLCJsb2ciLCJwcm9tIiwidGhlbiIsInJlc3VsdCIsInVubW91bnRlZCIsImRlZmF1bHQiLCJzZXRTdGF0ZSIsImNhdGNoIiwiZSIsIndhcm4iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbmRlciIsInN0YXRlIiwiX3QiLCJvbldyYXBwZXJDYW5jZWxDbGljayJdLCJzb3VyY2VzIjpbIi4uL3NyYy9Bc3luY1dyYXBwZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNS0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudFR5cGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQmFzZURpYWxvZ1wiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcblxudHlwZSBBc3luY0ltcG9ydDxUPiA9IHsgZGVmYXVsdDogVCB9O1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICAvLyBBIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCB0aGUgcmVhbCBjb21wb25lbnRcbiAgICBwcm9tOiBQcm9taXNlPENvbXBvbmVudFR5cGUgfCBBc3luY0ltcG9ydDxDb21wb25lbnRUeXBlPj47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvbXBvbmVudD86IENvbXBvbmVudFR5cGU7XG4gICAgZXJyb3I/OiBFcnJvcjtcbn1cblxuLyoqXG4gKiBXcmFwIGFuIGFzeW5jaHJvbm91cyBsb2FkZXIgZnVuY3Rpb24gd2l0aCBhIHJlYWN0IGNvbXBvbmVudCB3aGljaCBzaG93cyBhXG4gKiBzcGlubmVyIHVudGlsIHRoZSByZWFsIGNvbXBvbmVudCBsb2Fkcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXN5bmNXcmFwcGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSB1bm1vdW50ZWQgPSBmYWxzZTtcblxuICAgIHB1YmxpYyBzdGF0ZSA9IHtcbiAgICAgICAgY29tcG9uZW50OiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIC8vIFhYWDogdGVtcG9yYXJ5IGxvZ2dpbmcgdG8gdHJ5IHRvIGRpYWdub3NlXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzMxNDhcbiAgICAgICAgbG9nZ2VyLmxvZygnU3RhcnRpbmcgbG9hZCBvZiBBc3luY1dyYXBwZXIgZm9yIG1vZGFsJyk7XG4gICAgICAgIHRoaXMucHJvcHMucHJvbS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBUYWtlIHRoZSAnZGVmYXVsdCcgbWVtYmVyIGlmIGl0J3MgdGhlcmUsIHRoZW4gd2Ugc3VwcG9ydFxuICAgICAgICAgICAgLy8gcGFzc2luZyBpbiBqdXN0IGFuIGltcG9ydCgpZWQgbW9kdWxlLCBzaW5jZSBFUzYgYXN5bmMgaW1wb3J0XG4gICAgICAgICAgICAvLyBhbHdheXMgcmV0dXJucyBhIG1vZHVsZSAqbmFtZXNwYWNlKi5cbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IChyZXN1bHQgYXMgQXN5bmNJbXBvcnQ8Q29tcG9uZW50VHlwZT4pLmRlZmF1bHRcbiAgICAgICAgICAgICAgICA/IChyZXN1bHQgYXMgQXN5bmNJbXBvcnQ8Q29tcG9uZW50VHlwZT4pLmRlZmF1bHRcbiAgICAgICAgICAgICAgICA6IHJlc3VsdCBhcyBDb21wb25lbnRUeXBlO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbXBvbmVudCB9KTtcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKCdBc3luY1dyYXBwZXIgcHJvbWlzZSBmYWlsZWQnLCBlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV3JhcHBlckNhbmNlbENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29uc3QgQ29tcG9uZW50ID0gdGhpcy5zdGF0ZS5jb21wb25lbnQ7XG4gICAgICAgICAgICByZXR1cm4gPENvbXBvbmVudCB7Li4udGhpcy5wcm9wc30gLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIDxCYXNlRGlhbG9nIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH0gdGl0bGU9e190KFwiRXJyb3JcIil9PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJVbmFibGUgdG8gbG9hZCEgQ2hlY2sgeW91ciBuZXR3b3JrIGNvbm5lY3Rpdml0eSBhbmQgdHJ5IGFnYWluLlwiKSB9XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoXCJEaXNtaXNzXCIpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbldyYXBwZXJDYW5jZWxDbGlja31cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNob3cgYSBzcGlubmVyIHVudGlsIHRoZSBjb21wb25lbnQgaXMgbG9hZGVkLlxuICAgICAgICAgICAgcmV0dXJuIDxTcGlubmVyIC8+O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsWUFBTixTQUEyQkMsY0FBQSxDQUFNQyxTQUFqQyxDQUEyRDtFQUFBO0lBQUE7SUFBQSxpREFDbEQsS0FEa0Q7SUFBQSw2Q0FHdkQ7TUFDWEMsU0FBUyxFQUFFLElBREE7TUFFWEMsS0FBSyxFQUFFO0lBRkksQ0FIdUQ7SUFBQSw0REFnQ3ZDLE1BQU07TUFDakMsS0FBS0MsS0FBTCxDQUFXQyxVQUFYLENBQXNCLEtBQXRCO0lBQ0gsQ0FsQ3FFO0VBQUE7O0VBUXRFQyxpQkFBaUIsR0FBRztJQUNoQjtJQUNBO0lBQ0FDLGNBQUEsQ0FBT0MsR0FBUCxDQUFXLHlDQUFYOztJQUNBLEtBQUtKLEtBQUwsQ0FBV0ssSUFBWCxDQUFnQkMsSUFBaEIsQ0FBc0JDLE1BQUQsSUFBWTtNQUM3QixJQUFJLEtBQUtDLFNBQVQsRUFBb0IsT0FEUyxDQUc3QjtNQUNBO01BQ0E7O01BQ0EsTUFBTVYsU0FBUyxHQUFJUyxNQUFELENBQXVDRSxPQUF2QyxHQUNYRixNQUFELENBQXVDRSxPQUQzQixHQUVaRixNQUZOO01BR0EsS0FBS0csUUFBTCxDQUFjO1FBQUVaO01BQUYsQ0FBZDtJQUNILENBVkQsRUFVR2EsS0FWSCxDQVVVQyxDQUFELElBQU87TUFDWlQsY0FBQSxDQUFPVSxJQUFQLENBQVksNkJBQVosRUFBMkNELENBQTNDOztNQUNBLEtBQUtGLFFBQUwsQ0FBYztRQUFFWCxLQUFLLEVBQUVhO01BQVQsQ0FBZDtJQUNILENBYkQ7RUFjSDs7RUFFREUsb0JBQW9CLEdBQUc7SUFDbkIsS0FBS04sU0FBTCxHQUFpQixJQUFqQjtFQUNIOztFQU1ETyxNQUFNLEdBQUc7SUFDTCxJQUFJLEtBQUtDLEtBQUwsQ0FBV2xCLFNBQWYsRUFBMEI7TUFDdEIsTUFBTUQsU0FBUyxHQUFHLEtBQUttQixLQUFMLENBQVdsQixTQUE3QjtNQUNBLG9CQUFPLDZCQUFDLFNBQUQsRUFBZSxLQUFLRSxLQUFwQixDQUFQO0lBQ0gsQ0FIRCxNQUdPLElBQUksS0FBS2dCLEtBQUwsQ0FBV2pCLEtBQWYsRUFBc0I7TUFDekIsb0JBQU8sNkJBQUMsbUJBQUQ7UUFBWSxVQUFVLEVBQUUsS0FBS0MsS0FBTCxDQUFXQyxVQUFuQztRQUErQyxLQUFLLEVBQUUsSUFBQWdCLG1CQUFBLEVBQUcsT0FBSDtNQUF0RCxHQUNELElBQUFBLG1CQUFBLEVBQUcsZ0VBQUgsQ0FEQyxlQUVILDZCQUFDLHNCQUFEO1FBQWUsYUFBYSxFQUFFLElBQUFBLG1CQUFBLEVBQUcsU0FBSCxDQUE5QjtRQUNJLG9CQUFvQixFQUFFLEtBQUtDLG9CQUQvQjtRQUVJLFNBQVMsRUFBRTtNQUZmLEVBRkcsQ0FBUDtJQU9ILENBUk0sTUFRQTtNQUNIO01BQ0Esb0JBQU8sNkJBQUMsZ0JBQUQsT0FBUDtJQUNIO0VBQ0o7O0FBcERxRSJ9