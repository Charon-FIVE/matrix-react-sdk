"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _location = require("matrix-js-sdk/src/@types/location");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _BeaconStatus = _interopRequireDefault(require("./BeaconStatus"));

var _displayStatus = require("./displayStatus");

var _ShareLatestLocation = _interopRequireDefault(require("./ShareLatestLocation"));

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
const useBeaconName = beacon => {
  const matrixClient = (0, _react.useContext)(_MatrixClientContext.default);

  if (beacon.beaconInfo.assetType !== _location.LocationAssetType.Self) {
    return beacon.beaconInfo.description;
  }

  const room = matrixClient.getRoom(beacon.roomId);
  const member = room?.getMember(beacon.beaconInfoOwner);
  return member?.rawDisplayName || beacon.beaconInfoOwner;
};

const BeaconStatusTooltip = _ref => {
  let {
    beacon
  } = _ref;
  const label = useBeaconName(beacon);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BeaconStatusTooltip"
  }, /*#__PURE__*/_react.default.createElement(_BeaconStatus.default, {
    beacon: beacon,
    label: label,
    displayStatus: _displayStatus.BeaconDisplayStatus.Active,
    displayLiveTimeRemaining: true,
    className: "mx_BeaconStatusTooltip_inner"
  }, /*#__PURE__*/_react.default.createElement(_ShareLatestLocation.default, {
    latestLocationState: beacon.latestLocationState
  })));
};

var _default = BeaconStatusTooltip;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VCZWFjb25OYW1lIiwiYmVhY29uIiwibWF0cml4Q2xpZW50IiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJiZWFjb25JbmZvIiwiYXNzZXRUeXBlIiwiTG9jYXRpb25Bc3NldFR5cGUiLCJTZWxmIiwiZGVzY3JpcHRpb24iLCJyb29tIiwiZ2V0Um9vbSIsInJvb21JZCIsIm1lbWJlciIsImdldE1lbWJlciIsImJlYWNvbkluZm9Pd25lciIsInJhd0Rpc3BsYXlOYW1lIiwiQmVhY29uU3RhdHVzVG9vbHRpcCIsImxhYmVsIiwiQmVhY29uRGlzcGxheVN0YXR1cyIsIkFjdGl2ZSIsImxhdGVzdExvY2F0aW9uU3RhdGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9iZWFjb24vQmVhY29uU3RhdHVzVG9vbHRpcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCZWFjb24gfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXgnO1xuaW1wb3J0IHsgTG9jYXRpb25Bc3NldFR5cGUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvbG9jYXRpb24nO1xuXG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tICcuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0JztcbmltcG9ydCBCZWFjb25TdGF0dXMgZnJvbSAnLi9CZWFjb25TdGF0dXMnO1xuaW1wb3J0IHsgQmVhY29uRGlzcGxheVN0YXR1cyB9IGZyb20gJy4vZGlzcGxheVN0YXR1cyc7XG5pbXBvcnQgU2hhcmVMYXRlc3RMb2NhdGlvbiBmcm9tICcuL1NoYXJlTGF0ZXN0TG9jYXRpb24nO1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIGJlYWNvbjogQmVhY29uO1xufVxuXG5jb25zdCB1c2VCZWFjb25OYW1lID0gKGJlYWNvbjogQmVhY29uKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBtYXRyaXhDbGllbnQgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgaWYgKGJlYWNvbi5iZWFjb25JbmZvLmFzc2V0VHlwZSAhPT0gTG9jYXRpb25Bc3NldFR5cGUuU2VsZikge1xuICAgICAgICByZXR1cm4gYmVhY29uLmJlYWNvbkluZm8uZGVzY3JpcHRpb247XG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSBtYXRyaXhDbGllbnQuZ2V0Um9vbShiZWFjb24ucm9vbUlkKTtcbiAgICBjb25zdCBtZW1iZXIgPSByb29tPy5nZXRNZW1iZXIoYmVhY29uLmJlYWNvbkluZm9Pd25lcik7XG5cbiAgICByZXR1cm4gbWVtYmVyPy5yYXdEaXNwbGF5TmFtZSB8fCBiZWFjb24uYmVhY29uSW5mb093bmVyO1xufTtcblxuY29uc3QgQmVhY29uU3RhdHVzVG9vbHRpcDogUmVhY3QuRkM8UHJvcHM+ID0gKHsgYmVhY29uIH0pID0+IHtcbiAgICBjb25zdCBsYWJlbCA9IHVzZUJlYWNvbk5hbWUoYmVhY29uKTtcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT0nbXhfQmVhY29uU3RhdHVzVG9vbHRpcCc+XG4gICAgICAgIDxCZWFjb25TdGF0dXNcbiAgICAgICAgICAgIGJlYWNvbj17YmVhY29ufVxuICAgICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgZGlzcGxheVN0YXR1cz17QmVhY29uRGlzcGxheVN0YXR1cy5BY3RpdmV9XG4gICAgICAgICAgICBkaXNwbGF5TGl2ZVRpbWVSZW1haW5pbmdcbiAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfQmVhY29uU3RhdHVzVG9vbHRpcF9pbm5lcidcbiAgICAgICAgPlxuICAgICAgICAgICAgPFNoYXJlTGF0ZXN0TG9jYXRpb24gbGF0ZXN0TG9jYXRpb25TdGF0ZT17YmVhY29uLmxhdGVzdExvY2F0aW9uU3RhdGV9IC8+XG4gICAgICAgIDwvQmVhY29uU3RhdHVzPlxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJlYWNvblN0YXR1c1Rvb2x0aXA7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWVBLE1BQU1BLGFBQWEsR0FBSUMsTUFBRCxJQUE0QjtFQUM5QyxNQUFNQyxZQUFZLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0MsNEJBQVgsQ0FBckI7O0VBRUEsSUFBSUgsTUFBTSxDQUFDSSxVQUFQLENBQWtCQyxTQUFsQixLQUFnQ0MsMkJBQUEsQ0FBa0JDLElBQXRELEVBQTREO0lBQ3hELE9BQU9QLE1BQU0sQ0FBQ0ksVUFBUCxDQUFrQkksV0FBekI7RUFDSDs7RUFDRCxNQUFNQyxJQUFJLEdBQUdSLFlBQVksQ0FBQ1MsT0FBYixDQUFxQlYsTUFBTSxDQUFDVyxNQUE1QixDQUFiO0VBQ0EsTUFBTUMsTUFBTSxHQUFHSCxJQUFJLEVBQUVJLFNBQU4sQ0FBZ0JiLE1BQU0sQ0FBQ2MsZUFBdkIsQ0FBZjtFQUVBLE9BQU9GLE1BQU0sRUFBRUcsY0FBUixJQUEwQmYsTUFBTSxDQUFDYyxlQUF4QztBQUNILENBVkQ7O0FBWUEsTUFBTUUsbUJBQW9DLEdBQUcsUUFBZ0I7RUFBQSxJQUFmO0lBQUVoQjtFQUFGLENBQWU7RUFDekQsTUFBTWlCLEtBQUssR0FBR2xCLGFBQWEsQ0FBQ0MsTUFBRCxDQUEzQjtFQUVBLG9CQUFPO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0gsNkJBQUMscUJBQUQ7SUFDSSxNQUFNLEVBQUVBLE1BRFo7SUFFSSxLQUFLLEVBQUVpQixLQUZYO0lBR0ksYUFBYSxFQUFFQyxrQ0FBQSxDQUFvQkMsTUFIdkM7SUFJSSx3QkFBd0IsTUFKNUI7SUFLSSxTQUFTLEVBQUM7RUFMZCxnQkFPSSw2QkFBQyw0QkFBRDtJQUFxQixtQkFBbUIsRUFBRW5CLE1BQU0sQ0FBQ29CO0VBQWpELEVBUEosQ0FERyxDQUFQO0FBV0gsQ0FkRDs7ZUFnQmVKLG1CIn0=