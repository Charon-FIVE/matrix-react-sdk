"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _url = _interopRequireDefault(require("url"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _TextWithTooltip = _interopRequireDefault(require("./TextWithTooltip"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class AppPermission extends _react.default.Component {
  constructor(props) {
    super(props); // The first step is to pick apart the widget so we can render information about it

    const urlInfo = this.parseWidgetUrl(); // The second step is to find the user's profile so we can show it on the prompt

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

    let roomMember;
    if (room) roomMember = room.getMember(this.props.creatorUserId); // Set all this into the initial state

    this.state = _objectSpread({
      widgetDomain: null,
      isWrapped: null,
      roomMember
    }, urlInfo);
  }

  parseWidgetUrl() {
    const widgetUrl = _url.default.parse(this.props.url);

    const params = new URLSearchParams(widgetUrl.search); // HACK: We're relying on the query params when we should be relying on the widget's `data`.
    // This is a workaround for Scalar.

    if (_WidgetUtils.default.isScalarUrl(this.props.url) && params && params.get('url')) {
      const unwrappedUrl = _url.default.parse(params.get('url'));

      return {
        widgetDomain: unwrappedUrl.host || unwrappedUrl.hostname,
        isWrapped: true
      };
    } else {
      return {
        widgetDomain: widgetUrl.host || widgetUrl.hostname,
        isWrapped: false
      };
    }
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    const displayName = this.state.roomMember ? this.state.roomMember.name : this.props.creatorUserId;
    const userId = displayName === this.props.creatorUserId ? null : this.props.creatorUserId;
    const avatar = this.state.roomMember ? /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
      member: this.state.roomMember,
      width: 38,
      height: 38
    }) : /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
      name: this.props.creatorUserId,
      width: 38,
      height: 38
    });

    const warningTooltipText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Any of the following data may be shared:"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your display name")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your avatar URL")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your user ID")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your theme")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("%(brand)s URL", {
      brand
    })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Room ID")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Widget ID"))));

    const warningTooltip = /*#__PURE__*/_react.default.createElement(_TextWithTooltip.default, {
      tooltip: warningTooltipText,
      tooltipClass: "mx_AppPermissionWarning_tooltip mx_Tooltip_dark"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AppPermissionWarning_helpIcon"
    })); // Due to i18n limitations, we can't dedupe the code for variables in these two messages.


    const warning = this.state.isWrapped ? (0, _languageHandler._t)("Using this widget may share data <helpIcon /> with %(widgetDomain)s & your integration manager.", {
      widgetDomain: this.state.widgetDomain
    }, {
      helpIcon: () => warningTooltip
    }) : (0, _languageHandler._t)("Using this widget may share data <helpIcon /> with %(widgetDomain)s.", {
      widgetDomain: this.state.widgetDomain
    }, {
      helpIcon: () => warningTooltip
    });
    const encryptionWarning = this.props.isRoomEncrypted ? (0, _languageHandler._t)("Widgets do not use message encryption.") : null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row mx_AppPermissionWarning_bolder mx_AppPermissionWarning_smallText"
    }, (0, _languageHandler._t)("Widget added by")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row"
    }, avatar, /*#__PURE__*/_react.default.createElement("h4", {
      className: "mx_AppPermissionWarning_bolder"
    }, displayName), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_smallText"
    }, userId)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row mx_AppPermissionWarning_smallText"
    }, warning), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row mx_AppPermissionWarning_smallText"
    }, (0, _languageHandler._t)("This widget may use cookies."), "\xA0", encryptionWarning), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary_sm",
      onClick: this.props.onPermissionGranted
    }, (0, _languageHandler._t)("Continue"))));
  }

}

exports.default = AppPermission;
(0, _defineProperty2.default)(AppPermission, "defaultProps", {
  onPermissionGranted: () => {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcHBQZXJtaXNzaW9uIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwidXJsSW5mbyIsInBhcnNlV2lkZ2V0VXJsIiwicm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFJvb20iLCJyb29tSWQiLCJyb29tTWVtYmVyIiwiZ2V0TWVtYmVyIiwiY3JlYXRvclVzZXJJZCIsInN0YXRlIiwid2lkZ2V0RG9tYWluIiwiaXNXcmFwcGVkIiwid2lkZ2V0VXJsIiwidXJsIiwicGFyc2UiLCJwYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJzZWFyY2giLCJXaWRnZXRVdGlscyIsImlzU2NhbGFyVXJsIiwidW53cmFwcGVkVXJsIiwiaG9zdCIsImhvc3RuYW1lIiwicmVuZGVyIiwiYnJhbmQiLCJTZGtDb25maWciLCJkaXNwbGF5TmFtZSIsIm5hbWUiLCJ1c2VySWQiLCJhdmF0YXIiLCJ3YXJuaW5nVG9vbHRpcFRleHQiLCJfdCIsIndhcm5pbmdUb29sdGlwIiwid2FybmluZyIsImhlbHBJY29uIiwiZW5jcnlwdGlvbldhcm5pbmciLCJpc1Jvb21FbmNyeXB0ZWQiLCJvblBlcm1pc3Npb25HcmFudGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvQXBwUGVybWlzc2lvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlcic7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCBXaWRnZXRVdGlscyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvV2lkZ2V0VXRpbHNcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBNZW1iZXJBdmF0YXIgZnJvbSAnLi4vYXZhdGFycy9NZW1iZXJBdmF0YXInO1xuaW1wb3J0IEJhc2VBdmF0YXIgZnJvbSAnLi4vYXZhdGFycy9CYXNlQXZhdGFyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgVGV4dFdpdGhUb29sdGlwIGZyb20gXCIuL1RleHRXaXRoVG9vbHRpcFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICB1cmw6IHN0cmluZztcbiAgICBjcmVhdG9yVXNlcklkOiBzdHJpbmc7XG4gICAgcm9vbUlkOiBzdHJpbmc7XG4gICAgb25QZXJtaXNzaW9uR3JhbnRlZDogKCkgPT4gdm9pZDtcbiAgICBpc1Jvb21FbmNyeXB0ZWQ/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICByb29tTWVtYmVyOiBSb29tTWVtYmVyO1xuICAgIGlzV3JhcHBlZDogYm9vbGVhbjtcbiAgICB3aWRnZXREb21haW46IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwUGVybWlzc2lvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHM6IFBhcnRpYWw8SVByb3BzPiA9IHtcbiAgICAgICAgb25QZXJtaXNzaW9uR3JhbnRlZDogKCkgPT4ge30sXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIC8vIFRoZSBmaXJzdCBzdGVwIGlzIHRvIHBpY2sgYXBhcnQgdGhlIHdpZGdldCBzbyB3ZSBjYW4gcmVuZGVyIGluZm9ybWF0aW9uIGFib3V0IGl0XG4gICAgICAgIGNvbnN0IHVybEluZm8gPSB0aGlzLnBhcnNlV2lkZ2V0VXJsKCk7XG5cbiAgICAgICAgLy8gVGhlIHNlY29uZCBzdGVwIGlzIHRvIGZpbmQgdGhlIHVzZXIncyBwcm9maWxlIHNvIHdlIGNhbiBzaG93IGl0IG9uIHRoZSBwcm9tcHRcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgbGV0IHJvb21NZW1iZXI7XG4gICAgICAgIGlmIChyb29tKSByb29tTWVtYmVyID0gcm9vbS5nZXRNZW1iZXIodGhpcy5wcm9wcy5jcmVhdG9yVXNlcklkKTtcblxuICAgICAgICAvLyBTZXQgYWxsIHRoaXMgaW50byB0aGUgaW5pdGlhbCBzdGF0ZVxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgd2lkZ2V0RG9tYWluOiBudWxsLFxuICAgICAgICAgICAgaXNXcmFwcGVkOiBudWxsLFxuICAgICAgICAgICAgcm9vbU1lbWJlcixcbiAgICAgICAgICAgIC4uLnVybEluZm8sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZVdpZGdldFVybCgpOiB7IGlzV3JhcHBlZDogYm9vbGVhbiwgd2lkZ2V0RG9tYWluOiBzdHJpbmcgfSB7XG4gICAgICAgIGNvbnN0IHdpZGdldFVybCA9IHVybC5wYXJzZSh0aGlzLnByb3BzLnVybCk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2lkZ2V0VXJsLnNlYXJjaCk7XG5cbiAgICAgICAgLy8gSEFDSzogV2UncmUgcmVseWluZyBvbiB0aGUgcXVlcnkgcGFyYW1zIHdoZW4gd2Ugc2hvdWxkIGJlIHJlbHlpbmcgb24gdGhlIHdpZGdldCdzIGBkYXRhYC5cbiAgICAgICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIFNjYWxhci5cbiAgICAgICAgaWYgKFdpZGdldFV0aWxzLmlzU2NhbGFyVXJsKHRoaXMucHJvcHMudXJsKSAmJiBwYXJhbXMgJiYgcGFyYW1zLmdldCgndXJsJykpIHtcbiAgICAgICAgICAgIGNvbnN0IHVud3JhcHBlZFVybCA9IHVybC5wYXJzZShwYXJhbXMuZ2V0KCd1cmwnKSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHdpZGdldERvbWFpbjogdW53cmFwcGVkVXJsLmhvc3QgfHwgdW53cmFwcGVkVXJsLmhvc3RuYW1lLFxuICAgICAgICAgICAgICAgIGlzV3JhcHBlZDogdHJ1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHdpZGdldERvbWFpbjogd2lkZ2V0VXJsLmhvc3QgfHwgd2lkZ2V0VXJsLmhvc3RuYW1lLFxuICAgICAgICAgICAgICAgIGlzV3JhcHBlZDogZmFsc2UsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcblxuICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHRoaXMuc3RhdGUucm9vbU1lbWJlciA/IHRoaXMuc3RhdGUucm9vbU1lbWJlci5uYW1lIDogdGhpcy5wcm9wcy5jcmVhdG9yVXNlcklkO1xuICAgICAgICBjb25zdCB1c2VySWQgPSBkaXNwbGF5TmFtZSA9PT0gdGhpcy5wcm9wcy5jcmVhdG9yVXNlcklkID8gbnVsbCA6IHRoaXMucHJvcHMuY3JlYXRvclVzZXJJZDtcblxuICAgICAgICBjb25zdCBhdmF0YXIgPSB0aGlzLnN0YXRlLnJvb21NZW1iZXJcbiAgICAgICAgICAgID8gPE1lbWJlckF2YXRhciBtZW1iZXI9e3RoaXMuc3RhdGUucm9vbU1lbWJlcn0gd2lkdGg9ezM4fSBoZWlnaHQ9ezM4fSAvPlxuICAgICAgICAgICAgOiA8QmFzZUF2YXRhciBuYW1lPXt0aGlzLnByb3BzLmNyZWF0b3JVc2VySWR9IHdpZHRoPXszOH0gaGVpZ2h0PXszOH0gLz47XG5cbiAgICAgICAgY29uc3Qgd2FybmluZ1Rvb2x0aXBUZXh0ID0gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7IF90KFwiQW55IG9mIHRoZSBmb2xsb3dpbmcgZGF0YSBtYXkgYmUgc2hhcmVkOlwiKSB9XG4gICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIllvdXIgZGlzcGxheSBuYW1lXCIpIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIllvdXIgYXZhdGFyIFVSTFwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJZb3VyIHVzZXIgSURcIikgfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57IF90KFwiWW91ciB0aGVtZVwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCIlKGJyYW5kKXMgVVJMXCIsIHsgYnJhbmQgfSkgfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57IF90KFwiUm9vbSBJRFwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJXaWRnZXQgSURcIikgfTwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgICBjb25zdCB3YXJuaW5nVG9vbHRpcCA9IChcbiAgICAgICAgICAgIDxUZXh0V2l0aFRvb2x0aXAgdG9vbHRpcD17d2FybmluZ1Rvb2x0aXBUZXh0fSB0b29sdGlwQ2xhc3M9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nX3Rvb2x0aXAgbXhfVG9vbHRpcF9kYXJrJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nX2hlbHBJY29uJyAvPlxuICAgICAgICAgICAgPC9UZXh0V2l0aFRvb2x0aXA+XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gRHVlIHRvIGkxOG4gbGltaXRhdGlvbnMsIHdlIGNhbid0IGRlZHVwZSB0aGUgY29kZSBmb3IgdmFyaWFibGVzIGluIHRoZXNlIHR3byBtZXNzYWdlcy5cbiAgICAgICAgY29uc3Qgd2FybmluZyA9IHRoaXMuc3RhdGUuaXNXcmFwcGVkXG4gICAgICAgICAgICA/IF90KFwiVXNpbmcgdGhpcyB3aWRnZXQgbWF5IHNoYXJlIGRhdGEgPGhlbHBJY29uIC8+IHdpdGggJSh3aWRnZXREb21haW4pcyAmIHlvdXIgaW50ZWdyYXRpb24gbWFuYWdlci5cIixcbiAgICAgICAgICAgICAgICB7IHdpZGdldERvbWFpbjogdGhpcy5zdGF0ZS53aWRnZXREb21haW4gfSwgeyBoZWxwSWNvbjogKCkgPT4gd2FybmluZ1Rvb2x0aXAgfSlcbiAgICAgICAgICAgIDogX3QoXCJVc2luZyB0aGlzIHdpZGdldCBtYXkgc2hhcmUgZGF0YSA8aGVscEljb24gLz4gd2l0aCAlKHdpZGdldERvbWFpbilzLlwiLFxuICAgICAgICAgICAgICAgIHsgd2lkZ2V0RG9tYWluOiB0aGlzLnN0YXRlLndpZGdldERvbWFpbiB9LCB7IGhlbHBJY29uOiAoKSA9PiB3YXJuaW5nVG9vbHRpcCB9KTtcblxuICAgICAgICBjb25zdCBlbmNyeXB0aW9uV2FybmluZyA9IHRoaXMucHJvcHMuaXNSb29tRW5jcnlwdGVkID8gX3QoXCJXaWRnZXRzIGRvIG5vdCB1c2UgbWVzc2FnZSBlbmNyeXB0aW9uLlwiKSA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9BcHBQZXJtaXNzaW9uV2FybmluZyc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nX3JvdyBteF9BcHBQZXJtaXNzaW9uV2FybmluZ19ib2xkZXIgbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfc21hbGxUZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIldpZGdldCBhZGRlZCBieVwiKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nX3Jvdyc+XG4gICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyIH1cbiAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT0nbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfYm9sZGVyJz57IGRpc3BsYXlOYW1lIH08L2g0PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfc21hbGxUZXh0Jz57IHVzZXJJZCB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nX3JvdyBteF9BcHBQZXJtaXNzaW9uV2FybmluZ19zbWFsbFRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7IHdhcm5pbmcgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9BcHBQZXJtaXNzaW9uV2FybmluZ19yb3cgbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfc21hbGxUZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlRoaXMgd2lkZ2V0IG1heSB1c2UgY29va2llcy5cIikgfSZuYnNwO3sgZW5jcnlwdGlvbldhcm5pbmcgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9BcHBQZXJtaXNzaW9uV2FybmluZ19yb3cnPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdwcmltYXJ5X3NtJyBvbkNsaWNrPXt0aGlzLnByb3BzLm9uUGVybWlzc2lvbkdyYW50ZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNvbnRpbnVlXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBZ0JlLE1BQU1BLGFBQU4sU0FB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