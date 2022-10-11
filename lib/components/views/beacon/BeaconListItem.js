"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _location = require("matrix-js-sdk/src/@types/location");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _humanize = require("../../../utils/humanize");

var _NativeEventUtils = require("../../../utils/NativeEventUtils");

var _languageHandler = require("../../../languageHandler");

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _BeaconStatus = _interopRequireDefault(require("./BeaconStatus"));

var _displayStatus = require("./displayStatus");

var _StyledLiveBeaconIcon = _interopRequireDefault(require("./StyledLiveBeaconIcon"));

var _ShareLatestLocation = _interopRequireDefault(require("./ShareLatestLocation"));

const _excluded = ["beacon"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const BeaconListItem = _ref => {
  let {
    beacon
  } = _ref,
      rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const latestLocationState = (0, _useEventEmitter.useEventEmitterState)(beacon, _matrix.BeaconEvent.LocationUpdate, () => beacon.latestLocationState);
  const matrixClient = (0, _react.useContext)(_MatrixClientContext.default);
  const room = matrixClient.getRoom(beacon.roomId);

  if (!latestLocationState || !beacon.isLive) {
    return null;
  }

  const isSelfLocation = beacon.beaconInfo.assetType === _location.LocationAssetType.Self;
  const beaconMember = isSelfLocation ? room.getMember(beacon.beaconInfoOwner) : undefined;
  const humanizedUpdateTime = (0, _humanize.humanizeTime)(latestLocationState.timestamp);
  return /*#__PURE__*/_react.default.createElement("li", (0, _extends2.default)({
    className: "mx_BeaconListItem"
  }, rest), isSelfLocation ? /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
    className: "mx_BeaconListItem_avatar",
    member: beaconMember,
    height: 32,
    width: 32
  }) : /*#__PURE__*/_react.default.createElement(_StyledLiveBeaconIcon.default, {
    className: "mx_BeaconListItem_avatarIcon"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BeaconListItem_info"
  }, /*#__PURE__*/_react.default.createElement(_BeaconStatus.default, {
    className: "mx_BeaconListItem_status",
    beacon: beacon,
    label: beaconMember?.name || beacon.beaconInfo.description || beacon.beaconInfoOwner,
    displayStatus: _displayStatus.BeaconDisplayStatus.Active
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BeaconListItem_interactions",
    onClick: (0, _NativeEventUtils.preventDefaultWrapper)(() => {})
  }, /*#__PURE__*/_react.default.createElement(_ShareLatestLocation.default, {
    latestLocationState: latestLocationState
  }))), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_BeaconListItem_lastUpdated"
  }, (0, _languageHandler._t)("Updated %(humanizedUpdateTime)s", {
    humanizedUpdateTime
  }))));
};

var _default = BeaconListItem;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCZWFjb25MaXN0SXRlbSIsImJlYWNvbiIsInJlc3QiLCJsYXRlc3RMb2NhdGlvblN0YXRlIiwidXNlRXZlbnRFbWl0dGVyU3RhdGUiLCJCZWFjb25FdmVudCIsIkxvY2F0aW9uVXBkYXRlIiwibWF0cml4Q2xpZW50IiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJyb29tIiwiZ2V0Um9vbSIsInJvb21JZCIsImlzTGl2ZSIsImlzU2VsZkxvY2F0aW9uIiwiYmVhY29uSW5mbyIsImFzc2V0VHlwZSIsIkxvY2F0aW9uQXNzZXRUeXBlIiwiU2VsZiIsImJlYWNvbk1lbWJlciIsImdldE1lbWJlciIsImJlYWNvbkluZm9Pd25lciIsInVuZGVmaW5lZCIsImh1bWFuaXplZFVwZGF0ZVRpbWUiLCJodW1hbml6ZVRpbWUiLCJ0aW1lc3RhbXAiLCJuYW1lIiwiZGVzY3JpcHRpb24iLCJCZWFjb25EaXNwbGF5U3RhdHVzIiwiQWN0aXZlIiwicHJldmVudERlZmF1bHRXcmFwcGVyIiwiX3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9iZWFjb24vQmVhY29uTGlzdEl0ZW0udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBIVE1MUHJvcHMsIHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCZWFjb24sIEJlYWNvbkV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcbmltcG9ydCB7IExvY2F0aW9uQXNzZXRUeXBlIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2xvY2F0aW9uJztcblxuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSAnLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dCc7XG5pbXBvcnQgeyB1c2VFdmVudEVtaXR0ZXJTdGF0ZSB9IGZyb20gJy4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlcic7XG5pbXBvcnQgeyBodW1hbml6ZVRpbWUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9odW1hbml6ZSc7XG5pbXBvcnQgeyBwcmV2ZW50RGVmYXVsdFdyYXBwZXIgfSBmcm9tICcuLi8uLi8uLi91dGlscy9OYXRpdmVFdmVudFV0aWxzJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNZW1iZXJBdmF0YXIgZnJvbSAnLi4vYXZhdGFycy9NZW1iZXJBdmF0YXInO1xuaW1wb3J0IEJlYWNvblN0YXR1cyBmcm9tICcuL0JlYWNvblN0YXR1cyc7XG5pbXBvcnQgeyBCZWFjb25EaXNwbGF5U3RhdHVzIH0gZnJvbSAnLi9kaXNwbGF5U3RhdHVzJztcbmltcG9ydCBTdHlsZWRMaXZlQmVhY29uSWNvbiBmcm9tICcuL1N0eWxlZExpdmVCZWFjb25JY29uJztcbmltcG9ydCBTaGFyZUxhdGVzdExvY2F0aW9uIGZyb20gJy4vU2hhcmVMYXRlc3RMb2NhdGlvbic7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgYmVhY29uOiBCZWFjb247XG59XG5cbmNvbnN0IEJlYWNvbkxpc3RJdGVtOiBSZWFjdC5GQzxQcm9wcyAmIEhUTUxQcm9wczxIVE1MTElFbGVtZW50Pj4gPSAoeyBiZWFjb24sIC4uLnJlc3QgfSkgPT4ge1xuICAgIGNvbnN0IGxhdGVzdExvY2F0aW9uU3RhdGUgPSB1c2VFdmVudEVtaXR0ZXJTdGF0ZShcbiAgICAgICAgYmVhY29uLFxuICAgICAgICBCZWFjb25FdmVudC5Mb2NhdGlvblVwZGF0ZSxcbiAgICAgICAgKCkgPT4gYmVhY29uLmxhdGVzdExvY2F0aW9uU3RhdGUsXG4gICAgKTtcbiAgICBjb25zdCBtYXRyaXhDbGllbnQgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IHJvb20gPSBtYXRyaXhDbGllbnQuZ2V0Um9vbShiZWFjb24ucm9vbUlkKTtcblxuICAgIGlmICghbGF0ZXN0TG9jYXRpb25TdGF0ZSB8fCAhYmVhY29uLmlzTGl2ZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBpc1NlbGZMb2NhdGlvbiA9IGJlYWNvbi5iZWFjb25JbmZvLmFzc2V0VHlwZSA9PT0gTG9jYXRpb25Bc3NldFR5cGUuU2VsZjtcbiAgICBjb25zdCBiZWFjb25NZW1iZXIgPSBpc1NlbGZMb2NhdGlvbiA/XG4gICAgICAgIHJvb20uZ2V0TWVtYmVyKGJlYWNvbi5iZWFjb25JbmZvT3duZXIpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgaHVtYW5pemVkVXBkYXRlVGltZSA9IGh1bWFuaXplVGltZShsYXRlc3RMb2NhdGlvblN0YXRlLnRpbWVzdGFtcCk7XG5cbiAgICByZXR1cm4gPGxpIGNsYXNzTmFtZT0nbXhfQmVhY29uTGlzdEl0ZW0nIHsuLi5yZXN0fT5cbiAgICAgICAgeyBpc1NlbGZMb2NhdGlvbiA/XG4gICAgICAgICAgICA8TWVtYmVyQXZhdGFyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9CZWFjb25MaXN0SXRlbV9hdmF0YXInXG4gICAgICAgICAgICAgICAgbWVtYmVyPXtiZWFjb25NZW1iZXJ9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXszMn1cbiAgICAgICAgICAgICAgICB3aWR0aD17MzJ9XG4gICAgICAgICAgICAvPiA6XG4gICAgICAgICAgICA8U3R5bGVkTGl2ZUJlYWNvbkljb24gY2xhc3NOYW1lPSdteF9CZWFjb25MaXN0SXRlbV9hdmF0YXJJY29uJyAvPlxuICAgICAgICB9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9CZWFjb25MaXN0SXRlbV9pbmZvJz5cbiAgICAgICAgICAgIDxCZWFjb25TdGF0dXNcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0JlYWNvbkxpc3RJdGVtX3N0YXR1cydcbiAgICAgICAgICAgICAgICBiZWFjb249e2JlYWNvbn1cbiAgICAgICAgICAgICAgICBsYWJlbD17YmVhY29uTWVtYmVyPy5uYW1lIHx8IGJlYWNvbi5iZWFjb25JbmZvLmRlc2NyaXB0aW9uIHx8IGJlYWNvbi5iZWFjb25JbmZvT3duZXJ9XG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1cz17QmVhY29uRGlzcGxheVN0YXR1cy5BY3RpdmV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyAvKiBlYXQgZXZlbnRzIGZyb20gaW50ZXJhY3RpdmUgc2hhcmUgYnV0dG9uc1xuICAgICAgICAgICAgICAgIHNvIHBhcmVudCBjbGljayBoYW5kbGVycyBhcmUgbm90IHRyaWdnZXJlZCAqLyB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0JlYWNvbkxpc3RJdGVtX2ludGVyYWN0aW9ucycgb25DbGljaz17cHJldmVudERlZmF1bHRXcmFwcGVyKCgpID0+IHt9KX0+XG4gICAgICAgICAgICAgICAgICAgIDxTaGFyZUxhdGVzdExvY2F0aW9uIGxhdGVzdExvY2F0aW9uU3RhdGU9e2xhdGVzdExvY2F0aW9uU3RhdGV9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0JlYWNvblN0YXR1cz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfQmVhY29uTGlzdEl0ZW1fbGFzdFVwZGF0ZWQnPnsgX3QoXCJVcGRhdGVkICUoaHVtYW5pemVkVXBkYXRlVGltZSlzXCIsIHsgaHVtYW5pemVkVXBkYXRlVGltZSB9KSB9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2xpPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJlYWNvbkxpc3RJdGVtO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQU1BLE1BQU1BLGNBQTBELEdBQUcsUUFBeUI7RUFBQSxJQUF4QjtJQUFFQztFQUFGLENBQXdCO0VBQUEsSUFBWEMsSUFBVztFQUN4RixNQUFNQyxtQkFBbUIsR0FBRyxJQUFBQyxxQ0FBQSxFQUN4QkgsTUFEd0IsRUFFeEJJLG1CQUFBLENBQVlDLGNBRlksRUFHeEIsTUFBTUwsTUFBTSxDQUFDRSxtQkFIVyxDQUE1QjtFQUtBLE1BQU1JLFlBQVksR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFyQjtFQUNBLE1BQU1DLElBQUksR0FBR0gsWUFBWSxDQUFDSSxPQUFiLENBQXFCVixNQUFNLENBQUNXLE1BQTVCLENBQWI7O0VBRUEsSUFBSSxDQUFDVCxtQkFBRCxJQUF3QixDQUFDRixNQUFNLENBQUNZLE1BQXBDLEVBQTRDO0lBQ3hDLE9BQU8sSUFBUDtFQUNIOztFQUVELE1BQU1DLGNBQWMsR0FBR2IsTUFBTSxDQUFDYyxVQUFQLENBQWtCQyxTQUFsQixLQUFnQ0MsMkJBQUEsQ0FBa0JDLElBQXpFO0VBQ0EsTUFBTUMsWUFBWSxHQUFHTCxjQUFjLEdBQy9CSixJQUFJLENBQUNVLFNBQUwsQ0FBZW5CLE1BQU0sQ0FBQ29CLGVBQXRCLENBRCtCLEdBRS9CQyxTQUZKO0VBSUEsTUFBTUMsbUJBQW1CLEdBQUcsSUFBQUMsc0JBQUEsRUFBYXJCLG1CQUFtQixDQUFDc0IsU0FBakMsQ0FBNUI7RUFFQSxvQkFBTztJQUFJLFNBQVMsRUFBQztFQUFkLEdBQXNDdkIsSUFBdEMsR0FDRFksY0FBYyxnQkFDWiw2QkFBQyxxQkFBRDtJQUNJLFNBQVMsRUFBQywwQkFEZDtJQUVJLE1BQU0sRUFBRUssWUFGWjtJQUdJLE1BQU0sRUFBRSxFQUhaO0lBSUksS0FBSyxFQUFFO0VBSlgsRUFEWSxnQkFPWiw2QkFBQyw2QkFBRDtJQUFzQixTQUFTLEVBQUM7RUFBaEMsRUFSRCxlQVVIO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0ksNkJBQUMscUJBQUQ7SUFDSSxTQUFTLEVBQUMsMEJBRGQ7SUFFSSxNQUFNLEVBQUVsQixNQUZaO0lBR0ksS0FBSyxFQUFFa0IsWUFBWSxFQUFFTyxJQUFkLElBQXNCekIsTUFBTSxDQUFDYyxVQUFQLENBQWtCWSxXQUF4QyxJQUF1RDFCLE1BQU0sQ0FBQ29CLGVBSHpFO0lBSUksYUFBYSxFQUFFTyxrQ0FBQSxDQUFvQkM7RUFKdkMsZ0JBUUk7SUFBSyxTQUFTLEVBQUMsZ0NBQWY7SUFBZ0QsT0FBTyxFQUFFLElBQUFDLHVDQUFBLEVBQXNCLE1BQU0sQ0FBRSxDQUE5QjtFQUF6RCxnQkFDSSw2QkFBQyw0QkFBRDtJQUFxQixtQkFBbUIsRUFBRTNCO0VBQTFDLEVBREosQ0FSSixDQURKLGVBYUk7SUFBTSxTQUFTLEVBQUM7RUFBaEIsR0FBa0QsSUFBQTRCLG1CQUFBLEVBQUcsaUNBQUgsRUFBc0M7SUFBRVI7RUFBRixDQUF0QyxDQUFsRCxDQWJKLENBVkcsQ0FBUDtBQTBCSCxDQTlDRDs7ZUFnRGV2QixjIn0=