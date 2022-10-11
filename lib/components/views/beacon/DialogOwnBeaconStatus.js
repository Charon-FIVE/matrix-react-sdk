"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _location = require("matrix-js-sdk/src/@types/location");

var _OwnBeaconStore = require("../../../stores/OwnBeaconStore");

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _OwnBeaconStatus = _interopRequireDefault(require("./OwnBeaconStatus"));

var _displayStatus = require("./displayStatus");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _StyledLiveBeaconIcon = _interopRequireDefault(require("./StyledLiveBeaconIcon"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
const useOwnBeacon = roomId => {
  const ownBeacon = (0, _useEventEmitter.useEventEmitterState)(_OwnBeaconStore.OwnBeaconStore.instance, _OwnBeaconStore.OwnBeaconStoreEvent.LivenessChange, () => {
    const [ownBeaconId] = _OwnBeaconStore.OwnBeaconStore.instance.getLiveBeaconIds(roomId);

    return _OwnBeaconStore.OwnBeaconStore.instance.getBeaconById(ownBeaconId);
  });
  return ownBeacon;
};

const DialogOwnBeaconStatus = _ref => {
  let {
    roomId
  } = _ref;
  const beacon = useOwnBeacon(roomId);
  const matrixClient = (0, _react.useContext)(_MatrixClientContext.default);
  const room = matrixClient.getRoom(roomId);

  if (!beacon?.isLive) {
    return null;
  }

  const isSelfLocation = beacon.beaconInfo.assetType === _location.LocationAssetType.Self;
  const beaconMember = isSelfLocation ? room.getMember(beacon.beaconInfoOwner) : undefined;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DialogOwnBeaconStatus"
  }, isSelfLocation ? /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
    className: "mx_DialogOwnBeaconStatus_avatar",
    member: beaconMember,
    height: 32,
    width: 32
  }) : /*#__PURE__*/_react.default.createElement(_StyledLiveBeaconIcon.default, {
    className: "mx_DialogOwnBeaconStatus_avatarIcon"
  }), /*#__PURE__*/_react.default.createElement(_OwnBeaconStatus.default, {
    className: "mx_DialogOwnBeaconStatus_status",
    beacon: beacon,
    displayStatus: _displayStatus.BeaconDisplayStatus.Active
  }));
};

var _default = DialogOwnBeaconStatus;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VPd25CZWFjb24iLCJyb29tSWQiLCJvd25CZWFjb24iLCJ1c2VFdmVudEVtaXR0ZXJTdGF0ZSIsIk93bkJlYWNvblN0b3JlIiwiaW5zdGFuY2UiLCJPd25CZWFjb25TdG9yZUV2ZW50IiwiTGl2ZW5lc3NDaGFuZ2UiLCJvd25CZWFjb25JZCIsImdldExpdmVCZWFjb25JZHMiLCJnZXRCZWFjb25CeUlkIiwiRGlhbG9nT3duQmVhY29uU3RhdHVzIiwiYmVhY29uIiwibWF0cml4Q2xpZW50IiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJyb29tIiwiZ2V0Um9vbSIsImlzTGl2ZSIsImlzU2VsZkxvY2F0aW9uIiwiYmVhY29uSW5mbyIsImFzc2V0VHlwZSIsIkxvY2F0aW9uQXNzZXRUeXBlIiwiU2VsZiIsImJlYWNvbk1lbWJlciIsImdldE1lbWJlciIsImJlYWNvbkluZm9Pd25lciIsInVuZGVmaW5lZCIsIkJlYWNvbkRpc3BsYXlTdGF0dXMiLCJBY3RpdmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9iZWFjb24vRGlhbG9nT3duQmVhY29uU3RhdHVzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFJvb20sIEJlYWNvbiB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5pbXBvcnQgeyBMb2NhdGlvbkFzc2V0VHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9sb2NhdGlvbic7XG5cbmltcG9ydCB7IE93bkJlYWNvblN0b3JlLCBPd25CZWFjb25TdG9yZUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL093bkJlYWNvblN0b3JlJztcbmltcG9ydCB7IHVzZUV2ZW50RW1pdHRlclN0YXRlIH0gZnJvbSAnLi4vLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyJztcbmltcG9ydCBPd25CZWFjb25TdGF0dXMgZnJvbSAnLi9Pd25CZWFjb25TdGF0dXMnO1xuaW1wb3J0IHsgQmVhY29uRGlzcGxheVN0YXR1cyB9IGZyb20gJy4vZGlzcGxheVN0YXR1cyc7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tICcuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0JztcbmltcG9ydCBNZW1iZXJBdmF0YXIgZnJvbSAnLi4vYXZhdGFycy9NZW1iZXJBdmF0YXInO1xuaW1wb3J0IFN0eWxlZExpdmVCZWFjb25JY29uIGZyb20gJy4vU3R5bGVkTGl2ZUJlYWNvbkljb24nO1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIHJvb21JZDogUm9vbVsncm9vbUlkJ107XG59XG5cbmNvbnN0IHVzZU93bkJlYWNvbiA9IChyb29tSWQ6IFJvb21bJ3Jvb21JZCddKTogQmVhY29uIHwgdW5kZWZpbmVkID0+IHtcbiAgICBjb25zdCBvd25CZWFjb24gPSB1c2VFdmVudEVtaXR0ZXJTdGF0ZShcbiAgICAgICAgT3duQmVhY29uU3RvcmUuaW5zdGFuY2UsXG4gICAgICAgIE93bkJlYWNvblN0b3JlRXZlbnQuTGl2ZW5lc3NDaGFuZ2UsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFtvd25CZWFjb25JZF0gPSBPd25CZWFjb25TdG9yZS5pbnN0YW5jZS5nZXRMaXZlQmVhY29uSWRzKHJvb21JZCk7XG4gICAgICAgICAgICByZXR1cm4gT3duQmVhY29uU3RvcmUuaW5zdGFuY2UuZ2V0QmVhY29uQnlJZChvd25CZWFjb25JZCk7XG4gICAgICAgIH0sXG4gICAgKTtcblxuICAgIHJldHVybiBvd25CZWFjb247XG59O1xuXG5jb25zdCBEaWFsb2dPd25CZWFjb25TdGF0dXM6IFJlYWN0LkZDPFByb3BzPiA9ICh7IHJvb21JZCB9KSA9PiB7XG4gICAgY29uc3QgYmVhY29uID0gdXNlT3duQmVhY29uKHJvb21JZCk7XG5cbiAgICBjb25zdCBtYXRyaXhDbGllbnQgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IHJvb20gPSBtYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuXG4gICAgaWYgKCFiZWFjb24/LmlzTGl2ZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBpc1NlbGZMb2NhdGlvbiA9IGJlYWNvbi5iZWFjb25JbmZvLmFzc2V0VHlwZSA9PT0gTG9jYXRpb25Bc3NldFR5cGUuU2VsZjtcbiAgICBjb25zdCBiZWFjb25NZW1iZXIgPSBpc1NlbGZMb2NhdGlvbiA/XG4gICAgICAgIHJvb20uZ2V0TWVtYmVyKGJlYWNvbi5iZWFjb25JbmZvT3duZXIpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdteF9EaWFsb2dPd25CZWFjb25TdGF0dXMnPlxuICAgICAgICB7IGlzU2VsZkxvY2F0aW9uID9cbiAgICAgICAgICAgIDxNZW1iZXJBdmF0YXJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0RpYWxvZ093bkJlYWNvblN0YXR1c19hdmF0YXInXG4gICAgICAgICAgICAgICAgbWVtYmVyPXtiZWFjb25NZW1iZXJ9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXszMn1cbiAgICAgICAgICAgICAgICB3aWR0aD17MzJ9XG4gICAgICAgICAgICAvPiA6XG4gICAgICAgICAgICA8U3R5bGVkTGl2ZUJlYWNvbkljb24gY2xhc3NOYW1lPSdteF9EaWFsb2dPd25CZWFjb25TdGF0dXNfYXZhdGFySWNvbicgLz5cbiAgICAgICAgfVxuICAgICAgICA8T3duQmVhY29uU3RhdHVzXG4gICAgICAgICAgICBjbGFzc05hbWU9J214X0RpYWxvZ093bkJlYWNvblN0YXR1c19zdGF0dXMnXG4gICAgICAgICAgICBiZWFjb249e2JlYWNvbn1cbiAgICAgICAgICAgIGRpc3BsYXlTdGF0dXM9e0JlYWNvbkRpc3BsYXlTdGF0dXMuQWN0aXZlfVxuICAgICAgICAvPlxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IERpYWxvZ093bkJlYWNvblN0YXR1cztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0JBLE1BQU1BLFlBQVksR0FBSUMsTUFBRCxJQUFnRDtFQUNqRSxNQUFNQyxTQUFTLEdBQUcsSUFBQUMscUNBQUEsRUFDZEMsOEJBQUEsQ0FBZUMsUUFERCxFQUVkQyxtQ0FBQSxDQUFvQkMsY0FGTixFQUdkLE1BQU07SUFDRixNQUFNLENBQUNDLFdBQUQsSUFBZ0JKLDhCQUFBLENBQWVDLFFBQWYsQ0FBd0JJLGdCQUF4QixDQUF5Q1IsTUFBekMsQ0FBdEI7O0lBQ0EsT0FBT0csOEJBQUEsQ0FBZUMsUUFBZixDQUF3QkssYUFBeEIsQ0FBc0NGLFdBQXRDLENBQVA7RUFDSCxDQU5hLENBQWxCO0VBU0EsT0FBT04sU0FBUDtBQUNILENBWEQ7O0FBYUEsTUFBTVMscUJBQXNDLEdBQUcsUUFBZ0I7RUFBQSxJQUFmO0lBQUVWO0VBQUYsQ0FBZTtFQUMzRCxNQUFNVyxNQUFNLEdBQUdaLFlBQVksQ0FBQ0MsTUFBRCxDQUEzQjtFQUVBLE1BQU1ZLFlBQVksR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFyQjtFQUNBLE1BQU1DLElBQUksR0FBR0gsWUFBWSxDQUFDSSxPQUFiLENBQXFCaEIsTUFBckIsQ0FBYjs7RUFFQSxJQUFJLENBQUNXLE1BQU0sRUFBRU0sTUFBYixFQUFxQjtJQUNqQixPQUFPLElBQVA7RUFDSDs7RUFFRCxNQUFNQyxjQUFjLEdBQUdQLE1BQU0sQ0FBQ1EsVUFBUCxDQUFrQkMsU0FBbEIsS0FBZ0NDLDJCQUFBLENBQWtCQyxJQUF6RTtFQUNBLE1BQU1DLFlBQVksR0FBR0wsY0FBYyxHQUMvQkgsSUFBSSxDQUFDUyxTQUFMLENBQWViLE1BQU0sQ0FBQ2MsZUFBdEIsQ0FEK0IsR0FFL0JDLFNBRko7RUFJQSxvQkFBTztJQUFLLFNBQVMsRUFBQztFQUFmLEdBQ0RSLGNBQWMsZ0JBQ1osNkJBQUMscUJBQUQ7SUFDSSxTQUFTLEVBQUMsaUNBRGQ7SUFFSSxNQUFNLEVBQUVLLFlBRlo7SUFHSSxNQUFNLEVBQUUsRUFIWjtJQUlJLEtBQUssRUFBRTtFQUpYLEVBRFksZ0JBT1osNkJBQUMsNkJBQUQ7SUFBc0IsU0FBUyxFQUFDO0VBQWhDLEVBUkQsZUFVSCw2QkFBQyx3QkFBRDtJQUNJLFNBQVMsRUFBQyxpQ0FEZDtJQUVJLE1BQU0sRUFBRVosTUFGWjtJQUdJLGFBQWEsRUFBRWdCLGtDQUFBLENBQW9CQztFQUh2QyxFQVZHLENBQVA7QUFnQkgsQ0EvQkQ7O2VBaUNlbEIscUIifQ==