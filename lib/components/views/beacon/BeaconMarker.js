"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _location = require("matrix-js-sdk/src/@types/location");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _SmartMarker = _interopRequireDefault(require("../location/SmartMarker"));

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

/**
 * Updates a map SmartMarker with latest location from given beacon
 */
const BeaconMarker = _ref => {
  let {
    map,
    beacon,
    tooltip
  } = _ref;
  const latestLocationState = (0, _useEventEmitter.useEventEmitterState)(beacon, _matrix.BeaconEvent.LocationUpdate, () => beacon.latestLocationState);
  const matrixClient = (0, _react.useContext)(_MatrixClientContext.default);
  const room = matrixClient.getRoom(beacon.roomId);

  if (!latestLocationState || !beacon.isLive) {
    return null;
  }

  const geoUri = latestLocationState?.uri;
  const markerRoomMember = beacon.beaconInfo.assetType === _location.LocationAssetType.Self ? room.getMember(beacon.beaconInfoOwner) : undefined;
  return /*#__PURE__*/_react.default.createElement(_SmartMarker.default, {
    map: map,
    id: beacon.identifier,
    geoUri: geoUri,
    roomMember: markerRoomMember,
    tooltip: tooltip,
    useMemberColor: true
  });
};

var _default = BeaconMarker;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCZWFjb25NYXJrZXIiLCJtYXAiLCJiZWFjb24iLCJ0b29sdGlwIiwibGF0ZXN0TG9jYXRpb25TdGF0ZSIsInVzZUV2ZW50RW1pdHRlclN0YXRlIiwiQmVhY29uRXZlbnQiLCJMb2NhdGlvblVwZGF0ZSIsIm1hdHJpeENsaWVudCIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0Iiwicm9vbSIsImdldFJvb20iLCJyb29tSWQiLCJpc0xpdmUiLCJnZW9VcmkiLCJ1cmkiLCJtYXJrZXJSb29tTWVtYmVyIiwiYmVhY29uSW5mbyIsImFzc2V0VHlwZSIsIkxvY2F0aW9uQXNzZXRUeXBlIiwiU2VsZiIsImdldE1lbWJlciIsImJlYWNvbkluZm9Pd25lciIsInVuZGVmaW5lZCIsImlkZW50aWZpZXIiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9iZWFjb24vQmVhY29uTWFya2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlLCB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IG1hcGxpYnJlZ2wgZnJvbSAnbWFwbGlicmUtZ2wnO1xuaW1wb3J0IHtcbiAgICBCZWFjb24sXG4gICAgQmVhY29uRXZlbnQsXG59IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5pbXBvcnQgeyBMb2NhdGlvbkFzc2V0VHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9sb2NhdGlvbic7XG5cbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gJy4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHQnO1xuaW1wb3J0IHsgdXNlRXZlbnRFbWl0dGVyU3RhdGUgfSBmcm9tICcuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXInO1xuaW1wb3J0IFNtYXJ0TWFya2VyIGZyb20gJy4uL2xvY2F0aW9uL1NtYXJ0TWFya2VyJztcblxuaW50ZXJmYWNlIFByb3BzIHtcbiAgICBtYXA6IG1hcGxpYnJlZ2wuTWFwO1xuICAgIGJlYWNvbjogQmVhY29uO1xuICAgIHRvb2x0aXA/OiBSZWFjdE5vZGU7XG59XG5cbi8qKlxuICogVXBkYXRlcyBhIG1hcCBTbWFydE1hcmtlciB3aXRoIGxhdGVzdCBsb2NhdGlvbiBmcm9tIGdpdmVuIGJlYWNvblxuICovXG5jb25zdCBCZWFjb25NYXJrZXI6IFJlYWN0LkZDPFByb3BzPiA9ICh7IG1hcCwgYmVhY29uLCB0b29sdGlwIH0pID0+IHtcbiAgICBjb25zdCBsYXRlc3RMb2NhdGlvblN0YXRlID0gdXNlRXZlbnRFbWl0dGVyU3RhdGUoXG4gICAgICAgIGJlYWNvbixcbiAgICAgICAgQmVhY29uRXZlbnQuTG9jYXRpb25VcGRhdGUsXG4gICAgICAgICgpID0+IGJlYWNvbi5sYXRlc3RMb2NhdGlvblN0YXRlLFxuICAgICk7XG4gICAgY29uc3QgbWF0cml4Q2xpZW50ID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCByb29tID0gbWF0cml4Q2xpZW50LmdldFJvb20oYmVhY29uLnJvb21JZCk7XG5cbiAgICBpZiAoIWxhdGVzdExvY2F0aW9uU3RhdGUgfHwgIWJlYWNvbi5pc0xpdmUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZ2VvVXJpID0gbGF0ZXN0TG9jYXRpb25TdGF0ZT8udXJpO1xuXG4gICAgY29uc3QgbWFya2VyUm9vbU1lbWJlciA9IGJlYWNvbi5iZWFjb25JbmZvLmFzc2V0VHlwZSA9PT0gTG9jYXRpb25Bc3NldFR5cGUuU2VsZiA/XG4gICAgICAgIHJvb20uZ2V0TWVtYmVyKGJlYWNvbi5iZWFjb25JbmZvT3duZXIpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgcmV0dXJuIDxTbWFydE1hcmtlclxuICAgICAgICBtYXA9e21hcH1cbiAgICAgICAgaWQ9e2JlYWNvbi5pZGVudGlmaWVyfVxuICAgICAgICBnZW9Vcmk9e2dlb1VyaX1cbiAgICAgICAgcm9vbU1lbWJlcj17bWFya2VyUm9vbU1lbWJlcn1cbiAgICAgICAgdG9vbHRpcD17dG9vbHRpcH1cbiAgICAgICAgdXNlTWVtYmVyQ29sb3JcbiAgICAvPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJlYWNvbk1hcmtlcjtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUlBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW9CQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxZQUE2QixHQUFHLFFBQThCO0VBQUEsSUFBN0I7SUFBRUMsR0FBRjtJQUFPQyxNQUFQO0lBQWVDO0VBQWYsQ0FBNkI7RUFDaEUsTUFBTUMsbUJBQW1CLEdBQUcsSUFBQUMscUNBQUEsRUFDeEJILE1BRHdCLEVBRXhCSSxtQkFBQSxDQUFZQyxjQUZZLEVBR3hCLE1BQU1MLE1BQU0sQ0FBQ0UsbUJBSFcsQ0FBNUI7RUFLQSxNQUFNSSxZQUFZLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0MsNEJBQVgsQ0FBckI7RUFDQSxNQUFNQyxJQUFJLEdBQUdILFlBQVksQ0FBQ0ksT0FBYixDQUFxQlYsTUFBTSxDQUFDVyxNQUE1QixDQUFiOztFQUVBLElBQUksQ0FBQ1QsbUJBQUQsSUFBd0IsQ0FBQ0YsTUFBTSxDQUFDWSxNQUFwQyxFQUE0QztJQUN4QyxPQUFPLElBQVA7RUFDSDs7RUFFRCxNQUFNQyxNQUFNLEdBQUdYLG1CQUFtQixFQUFFWSxHQUFwQztFQUVBLE1BQU1DLGdCQUFnQixHQUFHZixNQUFNLENBQUNnQixVQUFQLENBQWtCQyxTQUFsQixLQUFnQ0MsMkJBQUEsQ0FBa0JDLElBQWxELEdBQ3JCVixJQUFJLENBQUNXLFNBQUwsQ0FBZXBCLE1BQU0sQ0FBQ3FCLGVBQXRCLENBRHFCLEdBRXJCQyxTQUZKO0VBSUEsb0JBQU8sNkJBQUMsb0JBQUQ7SUFDSCxHQUFHLEVBQUV2QixHQURGO0lBRUgsRUFBRSxFQUFFQyxNQUFNLENBQUN1QixVQUZSO0lBR0gsTUFBTSxFQUFFVixNQUhMO0lBSUgsVUFBVSxFQUFFRSxnQkFKVDtJQUtILE9BQU8sRUFBRWQsT0FMTjtJQU1ILGNBQWM7RUFOWCxFQUFQO0FBUUgsQ0EzQkQ7O2VBNkJlSCxZIn0=