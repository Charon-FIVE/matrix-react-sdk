"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _DateUtils = require("../../../DateUtils");

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _useTimeout = require("../../../hooks/useTimeout");

var _languageHandler = require("../../../languageHandler");

var _beacon = require("../../../utils/beacon");

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
const MINUTE_MS = 60000;
const HOUR_MS = MINUTE_MS * 60;

const getUpdateInterval = ms => {
  // every 10 mins when more than an hour
  if (ms > HOUR_MS) {
    return MINUTE_MS * 10;
  } // every minute when more than a minute


  if (ms > MINUTE_MS) {
    return MINUTE_MS;
  } // otherwise every second


  return 1000;
};

const useMsRemaining = beacon => {
  const beaconInfo = (0, _useEventEmitter.useEventEmitterState)(beacon, _matrix.BeaconEvent.Update, () => beacon.beaconInfo);
  const [msRemaining, setMsRemaining] = (0, _react.useState)(() => (0, _beacon.getBeaconMsUntilExpiry)(beaconInfo));
  (0, _react.useEffect)(() => {
    setMsRemaining((0, _beacon.getBeaconMsUntilExpiry)(beaconInfo));
  }, [beaconInfo]);
  const updateMsRemaining = (0, _react.useCallback)(() => {
    const ms = (0, _beacon.getBeaconMsUntilExpiry)(beaconInfo);
    setMsRemaining(ms);
  }, [beaconInfo]);
  (0, _useTimeout.useInterval)(updateMsRemaining, getUpdateInterval(msRemaining));
  return msRemaining;
};

const LiveTimeRemaining = _ref => {
  let {
    beacon
  } = _ref;
  const msRemaining = useMsRemaining(beacon);
  const timeRemaining = (0, _DateUtils.formatDuration)(msRemaining);
  const liveTimeRemaining = (0, _languageHandler._t)(`%(timeRemaining)s left`, {
    timeRemaining
  });
  return /*#__PURE__*/_react.default.createElement("span", {
    "data-test-id": "room-live-share-expiry",
    className: "mx_LiveTimeRemaining"
  }, liveTimeRemaining);
};

var _default = LiveTimeRemaining;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNSU5VVEVfTVMiLCJIT1VSX01TIiwiZ2V0VXBkYXRlSW50ZXJ2YWwiLCJtcyIsInVzZU1zUmVtYWluaW5nIiwiYmVhY29uIiwiYmVhY29uSW5mbyIsInVzZUV2ZW50RW1pdHRlclN0YXRlIiwiQmVhY29uRXZlbnQiLCJVcGRhdGUiLCJtc1JlbWFpbmluZyIsInNldE1zUmVtYWluaW5nIiwidXNlU3RhdGUiLCJnZXRCZWFjb25Nc1VudGlsRXhwaXJ5IiwidXNlRWZmZWN0IiwidXBkYXRlTXNSZW1haW5pbmciLCJ1c2VDYWxsYmFjayIsInVzZUludGVydmFsIiwiTGl2ZVRpbWVSZW1haW5pbmciLCJ0aW1lUmVtYWluaW5nIiwiZm9ybWF0RHVyYXRpb24iLCJsaXZlVGltZVJlbWFpbmluZyIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvYmVhY29uL0xpdmVUaW1lUmVtYWluaW5nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCZWFjb25FdmVudCwgQmVhY29uIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcblxuaW1wb3J0IHsgZm9ybWF0RHVyYXRpb24gfSBmcm9tICcuLi8uLi8uLi9EYXRlVXRpbHMnO1xuaW1wb3J0IHsgdXNlRXZlbnRFbWl0dGVyU3RhdGUgfSBmcm9tICcuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXInO1xuaW1wb3J0IHsgdXNlSW50ZXJ2YWwgfSBmcm9tICcuLi8uLi8uLi9ob29rcy91c2VUaW1lb3V0JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IGdldEJlYWNvbk1zVW50aWxFeHBpcnkgfSBmcm9tICcuLi8uLi8uLi91dGlscy9iZWFjb24nO1xuXG5jb25zdCBNSU5VVEVfTVMgPSA2MDAwMDtcbmNvbnN0IEhPVVJfTVMgPSBNSU5VVEVfTVMgKiA2MDtcbmNvbnN0IGdldFVwZGF0ZUludGVydmFsID0gKG1zOiBudW1iZXIpID0+IHtcbiAgICAvLyBldmVyeSAxMCBtaW5zIHdoZW4gbW9yZSB0aGFuIGFuIGhvdXJcbiAgICBpZiAobXMgPiBIT1VSX01TKSB7XG4gICAgICAgIHJldHVybiBNSU5VVEVfTVMgKiAxMDtcbiAgICB9XG4gICAgLy8gZXZlcnkgbWludXRlIHdoZW4gbW9yZSB0aGFuIGEgbWludXRlXG4gICAgaWYgKG1zID4gTUlOVVRFX01TKSB7XG4gICAgICAgIHJldHVybiBNSU5VVEVfTVM7XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSBldmVyeSBzZWNvbmRcbiAgICByZXR1cm4gMTAwMDtcbn07XG5jb25zdCB1c2VNc1JlbWFpbmluZyA9IChiZWFjb246IEJlYWNvbik6IG51bWJlciA9PiB7XG4gICAgY29uc3QgYmVhY29uSW5mbyA9IHVzZUV2ZW50RW1pdHRlclN0YXRlKFxuICAgICAgICBiZWFjb24sXG4gICAgICAgIEJlYWNvbkV2ZW50LlVwZGF0ZSxcbiAgICAgICAgKCkgPT4gYmVhY29uLmJlYWNvbkluZm8sXG4gICAgKTtcblxuICAgIGNvbnN0IFttc1JlbWFpbmluZywgc2V0TXNSZW1haW5pbmddID0gdXNlU3RhdGUoKCkgPT4gZ2V0QmVhY29uTXNVbnRpbEV4cGlyeShiZWFjb25JbmZvKSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRNc1JlbWFpbmluZyhnZXRCZWFjb25Nc1VudGlsRXhwaXJ5KGJlYWNvbkluZm8pKTtcbiAgICB9LCBbYmVhY29uSW5mb10pO1xuXG4gICAgY29uc3QgdXBkYXRlTXNSZW1haW5pbmcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1zID0gZ2V0QmVhY29uTXNVbnRpbEV4cGlyeShiZWFjb25JbmZvKTtcbiAgICAgICAgc2V0TXNSZW1haW5pbmcobXMpO1xuICAgIH0sIFtiZWFjb25JbmZvXSk7XG5cbiAgICB1c2VJbnRlcnZhbCh1cGRhdGVNc1JlbWFpbmluZywgZ2V0VXBkYXRlSW50ZXJ2YWwobXNSZW1haW5pbmcpKTtcblxuICAgIHJldHVybiBtc1JlbWFpbmluZztcbn07XG5cbmNvbnN0IExpdmVUaW1lUmVtYWluaW5nOiBSZWFjdC5GQzx7IGJlYWNvbjogQmVhY29uIH0+ID0gKHsgYmVhY29uIH0pID0+IHtcbiAgICBjb25zdCBtc1JlbWFpbmluZyA9IHVzZU1zUmVtYWluaW5nKGJlYWNvbik7XG5cbiAgICBjb25zdCB0aW1lUmVtYWluaW5nID0gZm9ybWF0RHVyYXRpb24obXNSZW1haW5pbmcpO1xuICAgIGNvbnN0IGxpdmVUaW1lUmVtYWluaW5nID0gX3QoYCUodGltZVJlbWFpbmluZylzIGxlZnRgLCB7IHRpbWVSZW1haW5pbmcgfSk7XG5cbiAgICByZXR1cm4gPHNwYW5cbiAgICAgICAgZGF0YS10ZXN0LWlkPSdyb29tLWxpdmUtc2hhcmUtZXhwaXJ5J1xuICAgICAgICBjbGFzc05hbWU9XCJteF9MaXZlVGltZVJlbWFpbmluZ1wiXG4gICAgPnsgbGl2ZVRpbWVSZW1haW5pbmcgfTwvc3Bhbj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMaXZlVGltZVJlbWFpbmluZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVdBLE1BQU1BLFNBQVMsR0FBRyxLQUFsQjtBQUNBLE1BQU1DLE9BQU8sR0FBR0QsU0FBUyxHQUFHLEVBQTVCOztBQUNBLE1BQU1FLGlCQUFpQixHQUFJQyxFQUFELElBQWdCO0VBQ3RDO0VBQ0EsSUFBSUEsRUFBRSxHQUFHRixPQUFULEVBQWtCO0lBQ2QsT0FBT0QsU0FBUyxHQUFHLEVBQW5CO0VBQ0gsQ0FKcUMsQ0FLdEM7OztFQUNBLElBQUlHLEVBQUUsR0FBR0gsU0FBVCxFQUFvQjtJQUNoQixPQUFPQSxTQUFQO0VBQ0gsQ0FScUMsQ0FTdEM7OztFQUNBLE9BQU8sSUFBUDtBQUNILENBWEQ7O0FBWUEsTUFBTUksY0FBYyxHQUFJQyxNQUFELElBQTRCO0VBQy9DLE1BQU1DLFVBQVUsR0FBRyxJQUFBQyxxQ0FBQSxFQUNmRixNQURlLEVBRWZHLG1CQUFBLENBQVlDLE1BRkcsRUFHZixNQUFNSixNQUFNLENBQUNDLFVBSEUsQ0FBbkI7RUFNQSxNQUFNLENBQUNJLFdBQUQsRUFBY0MsY0FBZCxJQUFnQyxJQUFBQyxlQUFBLEVBQVMsTUFBTSxJQUFBQyw4QkFBQSxFQUF1QlAsVUFBdkIsQ0FBZixDQUF0QztFQUVBLElBQUFRLGdCQUFBLEVBQVUsTUFBTTtJQUNaSCxjQUFjLENBQUMsSUFBQUUsOEJBQUEsRUFBdUJQLFVBQXZCLENBQUQsQ0FBZDtFQUNILENBRkQsRUFFRyxDQUFDQSxVQUFELENBRkg7RUFJQSxNQUFNUyxpQkFBaUIsR0FBRyxJQUFBQyxrQkFBQSxFQUFZLE1BQU07SUFDeEMsTUFBTWIsRUFBRSxHQUFHLElBQUFVLDhCQUFBLEVBQXVCUCxVQUF2QixDQUFYO0lBQ0FLLGNBQWMsQ0FBQ1IsRUFBRCxDQUFkO0VBQ0gsQ0FIeUIsRUFHdkIsQ0FBQ0csVUFBRCxDQUh1QixDQUExQjtFQUtBLElBQUFXLHVCQUFBLEVBQVlGLGlCQUFaLEVBQStCYixpQkFBaUIsQ0FBQ1EsV0FBRCxDQUFoRDtFQUVBLE9BQU9BLFdBQVA7QUFDSCxDQXJCRDs7QUF1QkEsTUFBTVEsaUJBQStDLEdBQUcsUUFBZ0I7RUFBQSxJQUFmO0lBQUViO0VBQUYsQ0FBZTtFQUNwRSxNQUFNSyxXQUFXLEdBQUdOLGNBQWMsQ0FBQ0MsTUFBRCxDQUFsQztFQUVBLE1BQU1jLGFBQWEsR0FBRyxJQUFBQyx5QkFBQSxFQUFlVixXQUFmLENBQXRCO0VBQ0EsTUFBTVcsaUJBQWlCLEdBQUcsSUFBQUMsbUJBQUEsRUFBSSx3QkFBSixFQUE2QjtJQUFFSDtFQUFGLENBQTdCLENBQTFCO0VBRUEsb0JBQU87SUFDSCxnQkFBYSx3QkFEVjtJQUVILFNBQVMsRUFBQztFQUZQLEdBR0pFLGlCQUhJLENBQVA7QUFJSCxDQVZEOztlQVllSCxpQiJ9