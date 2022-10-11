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

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _Heading = _interopRequireDefault(require("../typography/Heading"));

/*
Copyright 2015 - 2021 The Matrix.org Foundation C.I.C.

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
class IntegrationManager extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "state", {
      errored: false
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Escape:
          ev.stopPropagation();
          ev.preventDefault();
          this.props.onFinished();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === 'close_scalar') {
        this.props.onFinished();
      }
    });
    (0, _defineProperty2.default)(this, "onError", () => {
      this.setState({
        errored: true
      });
    });
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    document.removeEventListener("keydown", this.onKeyDown);
  }

  render() {
    if (this.props.loading) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_IntegrationManager_loading"
      }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
        size: "h3"
      }, (0, _languageHandler._t)("Connecting to integration manager...")), /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    if (!this.props.connected || this.state.errored) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_IntegrationManager_error"
      }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
        size: "h3"
      }, (0, _languageHandler._t)("Cannot connect to integration manager")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("The integration manager is offline or it cannot reach your homeserver.")));
    }

    return /*#__PURE__*/_react.default.createElement("iframe", {
      title: (0, _languageHandler._t)("Integration manager"),
      src: this.props.url,
      onError: this.onError
    });
  }

}

exports.default = IntegrationManager;
(0, _defineProperty2.default)(IntegrationManager, "defaultProps", {
  connected: true,
  loading: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlZ3JhdGlvbk1hbmFnZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImVycm9yZWQiLCJldiIsImFjdGlvbiIsImdldEtleUJpbmRpbmdzTWFuYWdlciIsImdldEFjY2Vzc2liaWxpdHlBY3Rpb24iLCJLZXlCaW5kaW5nQWN0aW9uIiwiRXNjYXBlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJwYXlsb2FkIiwic2V0U3RhdGUiLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJkaXMiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwib25LZXlEb3duIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbmRlciIsImxvYWRpbmciLCJfdCIsImNvbm5lY3RlZCIsInN0YXRlIiwidXJsIiwib25FcnJvciJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0ludGVncmF0aW9uTWFuYWdlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzJztcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCBIZWFkaW5nIGZyb20gJy4uL3R5cG9ncmFwaHkvSGVhZGluZyc7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIGZhbHNlIHRvIGRpc3BsYXkgYW4gZXJyb3Igc2F5aW5nIHRoYXQgd2UgY291bGRuJ3QgY29ubmVjdCB0byB0aGUgaW50ZWdyYXRpb24gbWFuYWdlclxuICAgIGNvbm5lY3RlZDogYm9vbGVhbjtcblxuICAgIC8vIHRydWUgdG8gZGlzcGxheSBhIGxvYWRpbmcgc3Bpbm5lclxuICAgIGxvYWRpbmc6IGJvb2xlYW47XG5cbiAgICAvLyBUaGUgc291cmNlIFVSTCB0byBsb2FkXG4gICAgdXJsPzogc3RyaW5nO1xuXG4gICAgLy8gY2FsbGJhY2sgd2hlbiB0aGUgbWFuYWdlciBpcyBkaXNtaXNzZWRcbiAgICBvbkZpbmlzaGVkOiAoKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBlcnJvcmVkOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlZ3JhdGlvbk1hbmFnZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcblxuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBjb25uZWN0ZWQ6IHRydWUsXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgIH07XG5cbiAgICBwdWJsaWMgc3RhdGUgPSB7XG4gICAgICAgIGVycm9yZWQ6IGZhbHNlLFxuICAgIH07XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbktleURvd24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbktleURvd24pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2OiBLZXlib2FyZEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVzY2FwZTpcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdjbG9zZV9zY2FsYXInKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRXJyb3IgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcmVkOiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubG9hZGluZykge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW50ZWdyYXRpb25NYW5hZ2VyX2xvYWRpbmcnPlxuICAgICAgICAgICAgICAgICAgICA8SGVhZGluZyBzaXplPVwiaDNcIj57IF90KFwiQ29ubmVjdGluZyB0byBpbnRlZ3JhdGlvbiBtYW5hZ2VyLi4uXCIpIH08L0hlYWRpbmc+XG4gICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmNvbm5lY3RlZCB8fCB0aGlzLnN0YXRlLmVycm9yZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludGVncmF0aW9uTWFuYWdlcl9lcnJvcic+XG4gICAgICAgICAgICAgICAgICAgIDxIZWFkaW5nIHNpemU9XCJoM1wiPnsgX3QoXCJDYW5ub3QgY29ubmVjdCB0byBpbnRlZ3JhdGlvbiBtYW5hZ2VyXCIpIH08L0hlYWRpbmc+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJUaGUgaW50ZWdyYXRpb24gbWFuYWdlciBpcyBvZmZsaW5lIG9yIGl0IGNhbm5vdCByZWFjaCB5b3VyIGhvbWVzZXJ2ZXIuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxpZnJhbWUgdGl0bGU9e190KFwiSW50ZWdyYXRpb24gbWFuYWdlclwiKX0gc3JjPXt0aGlzLnByb3BzLnVybH0gb25FcnJvcj17dGhpcy5vbkVycm9yfSAvPjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE4QmUsTUFBTUEsa0JBQU4sU0FBaUNDLGNBQUEsQ0FBTUMsU0FBdkMsQ0FBaUU7RUFBQTtJQUFBO0lBQUE7SUFBQSw2Q0FRN0Q7TUFDWEMsT0FBTyxFQUFFO0lBREUsQ0FSNkQ7SUFBQSxpREFzQnZEQyxFQUFELElBQTZCO01BQzdDLE1BQU1DLE1BQU0sR0FBRyxJQUFBQyx5Q0FBQSxJQUF3QkMsc0JBQXhCLENBQStDSCxFQUEvQyxDQUFmOztNQUNBLFFBQVFDLE1BQVI7UUFDSSxLQUFLRyxtQ0FBQSxDQUFpQkMsTUFBdEI7VUFDSUwsRUFBRSxDQUFDTSxlQUFIO1VBQ0FOLEVBQUUsQ0FBQ08sY0FBSDtVQUNBLEtBQUtDLEtBQUwsQ0FBV0MsVUFBWDtVQUNBO01BTFI7SUFPSCxDQS9CMkU7SUFBQSxnREFpQ3hEQyxPQUFELElBQWtDO01BQ2pELElBQUlBLE9BQU8sQ0FBQ1QsTUFBUixLQUFtQixjQUF2QixFQUF1QztRQUNuQyxLQUFLTyxLQUFMLENBQVdDLFVBQVg7TUFDSDtJQUNKLENBckMyRTtJQUFBLCtDQXVDMUQsTUFBWTtNQUMxQixLQUFLRSxRQUFMLENBQWM7UUFBRVosT0FBTyxFQUFFO01BQVgsQ0FBZDtJQUNILENBekMyRTtFQUFBOztFQVlyRWEsaUJBQWlCLEdBQVM7SUFDN0IsS0FBS0MsYUFBTCxHQUFxQkMsbUJBQUEsQ0FBSUMsUUFBSixDQUFhLEtBQUtDLFFBQWxCLENBQXJCO0lBQ0FDLFFBQVEsQ0FBQ0MsZ0JBQVQsQ0FBMEIsU0FBMUIsRUFBcUMsS0FBS0MsU0FBMUM7RUFDSDs7RUFFTUMsb0JBQW9CLEdBQVM7SUFDaENOLG1CQUFBLENBQUlPLFVBQUosQ0FBZSxLQUFLUixhQUFwQjs7SUFDQUksUUFBUSxDQUFDSyxtQkFBVCxDQUE2QixTQUE3QixFQUF3QyxLQUFLSCxTQUE3QztFQUNIOztFQXVCTUksTUFBTSxHQUFnQjtJQUN6QixJQUFJLEtBQUtmLEtBQUwsQ0FBV2dCLE9BQWYsRUFBd0I7TUFDcEIsb0JBQ0k7UUFBSyxTQUFTLEVBQUM7TUFBZixnQkFDSSw2QkFBQyxnQkFBRDtRQUFTLElBQUksRUFBQztNQUFkLEdBQXFCLElBQUFDLG1CQUFBLEVBQUcsc0NBQUgsQ0FBckIsQ0FESixlQUVJLDZCQUFDLGdCQUFELE9BRkosQ0FESjtJQU1IOztJQUVELElBQUksQ0FBQyxLQUFLakIsS0FBTCxDQUFXa0IsU0FBWixJQUF5QixLQUFLQyxLQUFMLENBQVc1QixPQUF4QyxFQUFpRDtNQUM3QyxvQkFDSTtRQUFLLFNBQVMsRUFBQztNQUFmLGdCQUNJLDZCQUFDLGdCQUFEO1FBQVMsSUFBSSxFQUFDO01BQWQsR0FBcUIsSUFBQTBCLG1CQUFBLEVBQUcsdUNBQUgsQ0FBckIsQ0FESixlQUVJLHdDQUFLLElBQUFBLG1CQUFBLEVBQUcsd0VBQUgsQ0FBTCxDQUZKLENBREo7SUFNSDs7SUFFRCxvQkFBTztNQUFRLEtBQUssRUFBRSxJQUFBQSxtQkFBQSxFQUFHLHFCQUFILENBQWY7TUFBMEMsR0FBRyxFQUFFLEtBQUtqQixLQUFMLENBQVdvQixHQUExRDtNQUErRCxPQUFPLEVBQUUsS0FBS0M7SUFBN0UsRUFBUDtFQUNIOztBQS9EMkU7Ozs4QkFBM0RqQyxrQixrQkFHWTtFQUN6QjhCLFNBQVMsRUFBRSxJQURjO0VBRXpCRixPQUFPLEVBQUU7QUFGZ0IsQyJ9