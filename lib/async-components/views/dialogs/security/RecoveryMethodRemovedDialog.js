"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _dispatcher = _interopRequireDefault(require("../../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _actions = require("../../../../dispatcher/actions");

var _BaseDialog = _interopRequireDefault(require("../../../../components/views/dialogs/BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../../../../components/views/elements/DialogButtons"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class RecoveryMethodRemovedDialog extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onGoToSettingsClick", () => {
      this.props.onFinished();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
    (0, _defineProperty2.default)(this, "onSetupClick", () => {
      this.props.onFinished();

      _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require("./CreateKeyBackupDialog"))), null, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
  }

  render() {
    const title = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_KeyBackupFailedDialog_title"
    }, (0, _languageHandler._t)("Recovery Method Removed"));

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_KeyBackupFailedDialog",
      onFinished: this.props.onFinished,
      title: title
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This session has detected that your Security Phrase and key " + "for Secure Messages have been removed.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you did this accidentally, you can setup Secure Messages on " + "this session which will re-encrypt this session's message " + "history with a new recovery method.")), /*#__PURE__*/_react.default.createElement("p", {
      className: "warning"
    }, (0, _languageHandler._t)("If you didn't remove the recovery method, an " + "attacker may be trying to access your account. " + "Change your account password and set a new recovery " + "method immediately in Settings.")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Set up Secure Messages"),
      onPrimaryButtonClick: this.onSetupClick,
      cancelButton: (0, _languageHandler._t)("Go to Settings"),
      onCancel: this.onGoToSettingsClick
    })));
  }

}

exports.default = RecoveryMethodRemovedDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWNvdmVyeU1ldGhvZFJlbW92ZWREaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJkaXMiLCJmaXJlIiwiQWN0aW9uIiwiVmlld1VzZXJTZXR0aW5ncyIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nQXN5bmMiLCJyZW5kZXIiLCJ0aXRsZSIsIl90Iiwib25TZXR1cENsaWNrIiwib25Hb1RvU2V0dGluZ3NDbGljayJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvUmVjb3ZlcnlNZXRob2RSZW1vdmVkRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudFR5cGUgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7fVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWNvdmVyeU1ldGhvZFJlbW92ZWREaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHByaXZhdGUgb25Hb1RvU2V0dGluZ3NDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3VXNlclNldHRpbmdzKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNldHVwQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2dBc3luYyhcbiAgICAgICAgICAgIGltcG9ydChcIi4vQ3JlYXRlS2V5QmFja3VwRGlhbG9nXCIpIGFzIHVua25vd24gYXMgUHJvbWlzZTxDb21wb25lbnRUeXBlPHt9Pj4sXG4gICAgICAgICAgICBudWxsLCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlLFxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgdGl0bGUgPSA8c3BhbiBjbGFzc05hbWU9XCJteF9LZXlCYWNrdXBGYWlsZWREaWFsb2dfdGl0bGVcIj5cbiAgICAgICAgICAgIHsgX3QoXCJSZWNvdmVyeSBNZXRob2QgUmVtb3ZlZFwiKSB9XG4gICAgICAgIDwvc3Bhbj47XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X0tleUJhY2t1cEZhaWxlZERpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHNlc3Npb24gaGFzIGRldGVjdGVkIHRoYXQgeW91ciBTZWN1cml0eSBQaHJhc2UgYW5kIGtleSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZvciBTZWN1cmUgTWVzc2FnZXMgaGF2ZSBiZWVuIHJlbW92ZWQuXCIsXG4gICAgICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSWYgeW91IGRpZCB0aGlzIGFjY2lkZW50YWxseSwgeW91IGNhbiBzZXR1cCBTZWN1cmUgTWVzc2FnZXMgb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGlzIHNlc3Npb24gd2hpY2ggd2lsbCByZS1lbmNyeXB0IHRoaXMgc2Vzc2lvbidzIG1lc3NhZ2UgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJoaXN0b3J5IHdpdGggYSBuZXcgcmVjb3ZlcnkgbWV0aG9kLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndhcm5pbmdcIj57IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UgZGlkbid0IHJlbW92ZSB0aGUgcmVjb3ZlcnkgbWV0aG9kLCBhbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImF0dGFja2VyIG1heSBiZSB0cnlpbmcgdG8gYWNjZXNzIHlvdXIgYWNjb3VudC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJDaGFuZ2UgeW91ciBhY2NvdW50IHBhc3N3b3JkIGFuZCBzZXQgYSBuZXcgcmVjb3ZlcnkgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRob2QgaW1tZWRpYXRlbHkgaW4gU2V0dGluZ3MuXCIsXG4gICAgICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiU2V0IHVwIFNlY3VyZSBNZXNzYWdlc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uU2V0dXBDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbj17X3QoXCJHbyB0byBTZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uR29Ub1NldHRpbmdzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7O0FBSWUsTUFBTUEsMkJBQU4sU0FBMENDLGNBQUEsQ0FBTUMsYUFBaEQsQ0FBc0U7RUFBQTtJQUFBO0lBQUEsMkRBQ25ELE1BQVk7TUFDdEMsS0FBS0MsS0FBTCxDQUFXQyxVQUFYOztNQUNBQyxtQkFBQSxDQUFJQyxJQUFKLENBQVNDLGVBQUEsQ0FBT0MsZ0JBQWhCO0lBQ0gsQ0FKZ0Y7SUFBQSxvREFNMUQsTUFBWTtNQUMvQixLQUFLTCxLQUFMLENBQVdDLFVBQVg7O01BQ0FLLGNBQUEsQ0FBTUMsaUJBQU4sOERBQ1cseUJBRFgsS0FFSSxJQUZKLEVBRVUsSUFGVjtNQUVnQjtNQUFpQixLQUZqQztNQUV3QztNQUFlLElBRnZEO0lBSUgsQ0FaZ0Y7RUFBQTs7RUFjMUVDLE1BQU0sR0FBZ0I7SUFDekIsTUFBTUMsS0FBSyxnQkFBRztNQUFNLFNBQVMsRUFBQztJQUFoQixHQUNSLElBQUFDLG1CQUFBLEVBQUcseUJBQUgsQ0FEUSxDQUFkOztJQUlBLG9CQUNJLDZCQUFDLG1CQUFEO01BQVksU0FBUyxFQUFDLDBCQUF0QjtNQUNJLFVBQVUsRUFBRSxLQUFLVixLQUFMLENBQVdDLFVBRDNCO01BRUksS0FBSyxFQUFFUTtJQUZYLGdCQUlJLHVEQUNJLHdDQUFLLElBQUFDLG1CQUFBLEVBQ0QsaUVBQ0Esd0NBRkMsQ0FBTCxDQURKLGVBS0ksd0NBQUssSUFBQUEsbUJBQUEsRUFDRCxvRUFDQSw0REFEQSxHQUVBLHFDQUhDLENBQUwsQ0FMSixlQVVJO01BQUcsU0FBUyxFQUFDO0lBQWIsR0FBeUIsSUFBQUEsbUJBQUEsRUFDckIsa0RBQ0EsaURBREEsR0FFQSxzREFGQSxHQUdBLGlDQUpxQixDQUF6QixDQVZKLGVBZ0JJLDZCQUFDLHNCQUFEO01BQ0ksYUFBYSxFQUFFLElBQUFBLG1CQUFBLEVBQUcsd0JBQUgsQ0FEbkI7TUFFSSxvQkFBb0IsRUFBRSxLQUFLQyxZQUYvQjtNQUdJLFlBQVksRUFBRSxJQUFBRCxtQkFBQSxFQUFHLGdCQUFILENBSGxCO01BSUksUUFBUSxFQUFFLEtBQUtFO0lBSm5CLEVBaEJKLENBSkosQ0FESjtFQThCSDs7QUFqRGdGIn0=