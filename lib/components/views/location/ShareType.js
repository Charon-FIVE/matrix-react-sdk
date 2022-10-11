"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _languageHandler = require("../../../languageHandler");

var _OwnProfileStore = require("../../../stores/OwnProfileStore");

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Heading = _interopRequireDefault(require("../typography/Heading"));

var _location = require("../../../../res/img/element-icons/location.svg");

var _shareLocation = require("./shareLocation");

var _StyledLiveBeaconIcon = _interopRequireDefault(require("../beacon/StyledLiveBeaconIcon"));

const _excluded = ["onClick", "label", "shareType"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const UserAvatar = () => {
  const matrixClient = (0, _react.useContext)(_MatrixClientContext.default);
  const userId = matrixClient.getUserId();
  const displayName = _OwnProfileStore.OwnProfileStore.instance.displayName; // 40 - 2px border

  const avatarSize = 36;

  const avatarUrl = _OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl(avatarSize);

  return /*#__PURE__*/_react.default.createElement("div", {
    className: `mx_ShareType_option-icon ${_shareLocation.LocationShareType.Own}`
  }, /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
    idName: userId,
    name: displayName,
    url: avatarUrl,
    width: avatarSize,
    height: avatarSize,
    resizeMethod: "crop",
    className: "mx_UserMenu_userAvatar_BaseAvatar"
  }));
};

const ShareTypeOption = _ref => {
  let {
    onClick,
    label,
    shareType
  } = _ref,
      rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({
    element: "button",
    className: "mx_ShareType_option",
    onClick: onClick
  }, rest), shareType === _shareLocation.LocationShareType.Own && /*#__PURE__*/_react.default.createElement(UserAvatar, null), shareType === _shareLocation.LocationShareType.Pin && /*#__PURE__*/_react.default.createElement(_location.Icon, {
    className: `mx_ShareType_option-icon ${_shareLocation.LocationShareType.Pin}`
  }), shareType === _shareLocation.LocationShareType.Live && /*#__PURE__*/_react.default.createElement(_StyledLiveBeaconIcon.default, {
    className: `mx_ShareType_option-icon ${_shareLocation.LocationShareType.Live}`
  }), label);
};

const ShareType = _ref2 => {
  let {
    setShareType,
    enabledShareTypes
  } = _ref2;
  const labels = {
    [_shareLocation.LocationShareType.Own]: (0, _languageHandler._t)('My current location'),
    [_shareLocation.LocationShareType.Live]: (0, _languageHandler._t)('My live location'),
    [_shareLocation.LocationShareType.Pin]: (0, _languageHandler._t)('Drop a Pin')
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ShareType"
  }, /*#__PURE__*/_react.default.createElement(_location.Icon, {
    className: "mx_ShareType_badge"
  }), /*#__PURE__*/_react.default.createElement(_Heading.default, {
    className: "mx_ShareType_heading",
    size: "h3"
  }, (0, _languageHandler._t)("What location type do you want to share?")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ShareType_wrapper_options"
  }, enabledShareTypes.map(type => /*#__PURE__*/_react.default.createElement(ShareTypeOption, {
    key: type,
    onClick: () => setShareType(type),
    label: labels[type],
    shareType: type,
    "data-test-id": `share-location-option-${type}`
  }))));
};

var _default = ShareType;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVc2VyQXZhdGFyIiwibWF0cml4Q2xpZW50IiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJ1c2VySWQiLCJnZXRVc2VySWQiLCJkaXNwbGF5TmFtZSIsIk93blByb2ZpbGVTdG9yZSIsImluc3RhbmNlIiwiYXZhdGFyU2l6ZSIsImF2YXRhclVybCIsImdldEh0dHBBdmF0YXJVcmwiLCJMb2NhdGlvblNoYXJlVHlwZSIsIk93biIsIlNoYXJlVHlwZU9wdGlvbiIsIm9uQ2xpY2siLCJsYWJlbCIsInNoYXJlVHlwZSIsInJlc3QiLCJQaW4iLCJMaXZlIiwiU2hhcmVUeXBlIiwic2V0U2hhcmVUeXBlIiwiZW5hYmxlZFNoYXJlVHlwZXMiLCJsYWJlbHMiLCJfdCIsIm1hcCIsInR5cGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9sb2NhdGlvbi9TaGFyZVR5cGUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBIVE1MQXR0cmlidXRlcywgdXNlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSAnLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBPd25Qcm9maWxlU3RvcmUgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvT3duUHJvZmlsZVN0b3JlJztcbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gJy4uL2F2YXRhcnMvQmFzZUF2YXRhcic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBIZWFkaW5nIGZyb20gJy4uL3R5cG9ncmFwaHkvSGVhZGluZyc7XG5pbXBvcnQgeyBJY29uIGFzIExvY2F0aW9uSWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9sb2NhdGlvbi5zdmcnO1xuaW1wb3J0IHsgTG9jYXRpb25TaGFyZVR5cGUgfSBmcm9tICcuL3NoYXJlTG9jYXRpb24nO1xuaW1wb3J0IFN0eWxlZExpdmVCZWFjb25JY29uIGZyb20gJy4uL2JlYWNvbi9TdHlsZWRMaXZlQmVhY29uSWNvbic7XG5cbmNvbnN0IFVzZXJBdmF0YXIgPSAoKSA9PiB7XG4gICAgY29uc3QgbWF0cml4Q2xpZW50ID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCB1c2VySWQgPSBtYXRyaXhDbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZGlzcGxheU5hbWU7XG4gICAgLy8gNDAgLSAycHggYm9yZGVyXG4gICAgY29uc3QgYXZhdGFyU2l6ZSA9IDM2O1xuICAgIGNvbnN0IGF2YXRhclVybCA9IE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5nZXRIdHRwQXZhdGFyVXJsKGF2YXRhclNpemUpO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtgbXhfU2hhcmVUeXBlX29wdGlvbi1pY29uICR7TG9jYXRpb25TaGFyZVR5cGUuT3dufWB9PlxuICAgICAgICA8QmFzZUF2YXRhclxuICAgICAgICAgICAgaWROYW1lPXt1c2VySWR9XG4gICAgICAgICAgICBuYW1lPXtkaXNwbGF5TmFtZX1cbiAgICAgICAgICAgIHVybD17YXZhdGFyVXJsfVxuICAgICAgICAgICAgd2lkdGg9e2F2YXRhclNpemV9XG4gICAgICAgICAgICBoZWlnaHQ9e2F2YXRhclNpemV9XG4gICAgICAgICAgICByZXNpemVNZXRob2Q9XCJjcm9wXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X3VzZXJBdmF0YXJfQmFzZUF2YXRhclwiXG4gICAgICAgIC8+XG4gICAgPC9kaXY+O1xufTtcblxudHlwZSBTaGFyZVR5cGVPcHRpb25Qcm9wcyA9IEhUTUxBdHRyaWJ1dGVzPEVsZW1lbnQ+ICYgeyBsYWJlbDogc3RyaW5nLCBzaGFyZVR5cGU6IExvY2F0aW9uU2hhcmVUeXBlIH07XG5jb25zdCBTaGFyZVR5cGVPcHRpb246IFJlYWN0LkZDPFNoYXJlVHlwZU9wdGlvblByb3BzPiA9ICh7XG4gICAgb25DbGljaywgbGFiZWwsIHNoYXJlVHlwZSwgLi4ucmVzdFxufSkgPT4gPEFjY2Vzc2libGVCdXR0b25cbiAgICBlbGVtZW50PSdidXR0b24nXG4gICAgY2xhc3NOYW1lPSdteF9TaGFyZVR5cGVfb3B0aW9uJ1xuICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgey4uLnJlc3R9PlxuICAgIHsgc2hhcmVUeXBlID09PSBMb2NhdGlvblNoYXJlVHlwZS5Pd24gJiYgPFVzZXJBdmF0YXIgLz4gfVxuICAgIHsgc2hhcmVUeXBlID09PSBMb2NhdGlvblNoYXJlVHlwZS5QaW4gJiZcbiAgICAgICAgICAgIDxMb2NhdGlvbkljb24gY2xhc3NOYW1lPXtgbXhfU2hhcmVUeXBlX29wdGlvbi1pY29uICR7TG9jYXRpb25TaGFyZVR5cGUuUGlufWB9IC8+IH1cbiAgICB7IHNoYXJlVHlwZSA9PT0gTG9jYXRpb25TaGFyZVR5cGUuTGl2ZSAmJlxuICAgICAgICAgICAgPFN0eWxlZExpdmVCZWFjb25JY29uIGNsYXNzTmFtZT17YG14X1NoYXJlVHlwZV9vcHRpb24taWNvbiAke0xvY2F0aW9uU2hhcmVUeXBlLkxpdmV9YH0gLz4gfVxuXG4gICAgeyBsYWJlbCB9XG48L0FjY2Vzc2libGVCdXR0b24+O1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIHNldFNoYXJlVHlwZTogKHNoYXJlVHlwZTogTG9jYXRpb25TaGFyZVR5cGUpID0+IHZvaWQ7XG4gICAgZW5hYmxlZFNoYXJlVHlwZXM6IExvY2F0aW9uU2hhcmVUeXBlW107XG59XG5jb25zdCBTaGFyZVR5cGU6IFJlYWN0LkZDPFByb3BzPiA9ICh7XG4gICAgc2V0U2hhcmVUeXBlLCBlbmFibGVkU2hhcmVUeXBlcyxcbn0pID0+IHtcbiAgICBjb25zdCBsYWJlbHMgPSB7XG4gICAgICAgIFtMb2NhdGlvblNoYXJlVHlwZS5Pd25dOiBfdCgnTXkgY3VycmVudCBsb2NhdGlvbicpLFxuICAgICAgICBbTG9jYXRpb25TaGFyZVR5cGUuTGl2ZV06IF90KCdNeSBsaXZlIGxvY2F0aW9uJyksXG4gICAgICAgIFtMb2NhdGlvblNoYXJlVHlwZS5QaW5dOiBfdCgnRHJvcCBhIFBpbicpLFxuICAgIH07XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdteF9TaGFyZVR5cGUnPlxuICAgICAgICA8TG9jYXRpb25JY29uIGNsYXNzTmFtZT0nbXhfU2hhcmVUeXBlX2JhZGdlJyAvPlxuICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9J214X1NoYXJlVHlwZV9oZWFkaW5nJyBzaXplPSdoMyc+eyBfdChcIldoYXQgbG9jYXRpb24gdHlwZSBkbyB5b3Ugd2FudCB0byBzaGFyZT9cIikgfTwvSGVhZGluZz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NoYXJlVHlwZV93cmFwcGVyX29wdGlvbnMnPlxuICAgICAgICAgICAgeyBlbmFibGVkU2hhcmVUeXBlcy5tYXAoKHR5cGUpID0+XG4gICAgICAgICAgICAgICAgPFNoYXJlVHlwZU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBrZXk9e3R5cGV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNoYXJlVHlwZSh0eXBlKX1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e2xhYmVsc1t0eXBlXX1cbiAgICAgICAgICAgICAgICAgICAgc2hhcmVUeXBlPXt0eXBlfVxuICAgICAgICAgICAgICAgICAgICBkYXRhLXRlc3QtaWQ9e2BzaGFyZS1sb2NhdGlvbi1vcHRpb24tJHt0eXBlfWB9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICApIH1cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2hhcmVUeXBlO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLE1BQU1BLFVBQVUsR0FBRyxNQUFNO0VBQ3JCLE1BQU1DLFlBQVksR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFyQjtFQUNBLE1BQU1DLE1BQU0sR0FBR0gsWUFBWSxDQUFDSSxTQUFiLEVBQWY7RUFDQSxNQUFNQyxXQUFXLEdBQUdDLGdDQUFBLENBQWdCQyxRQUFoQixDQUF5QkYsV0FBN0MsQ0FIcUIsQ0FJ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