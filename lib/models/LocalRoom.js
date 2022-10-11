"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalRoomState = exports.LocalRoom = exports.LOCAL_ROOM_ID_PREFIX = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrix = require("matrix-js-sdk/src/matrix");

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
const LOCAL_ROOM_ID_PREFIX = 'local+';
exports.LOCAL_ROOM_ID_PREFIX = LOCAL_ROOM_ID_PREFIX;
let LocalRoomState;
/**
 * A local room that only exists client side.
 * Its main purpose is to be used for temporary rooms when creating a DM.
 */

exports.LocalRoomState = LocalRoomState;

(function (LocalRoomState) {
  LocalRoomState[LocalRoomState["NEW"] = 0] = "NEW";
  LocalRoomState[LocalRoomState["CREATING"] = 1] = "CREATING";
  LocalRoomState[LocalRoomState["CREATED"] = 2] = "CREATED";
  LocalRoomState[LocalRoomState["ERROR"] = 3] = "ERROR";
})(LocalRoomState || (exports.LocalRoomState = LocalRoomState = {}));

class LocalRoom extends _matrix.Room {
  /** Whether the actual room should be encrypted. */

  /** If the actual room has been created, this holds its ID. */

  /** DM chat partner */

  /** Callbacks that should be invoked after the actual room has been created. */
  constructor(roomId, client, myUserId) {
    super(roomId, client, myUserId, {
      pendingEventOrdering: _matrix.PendingEventOrdering.Detached
    });
    (0, _defineProperty2.default)(this, "encrypted", false);
    (0, _defineProperty2.default)(this, "actualRoomId", void 0);
    (0, _defineProperty2.default)(this, "targets", []);
    (0, _defineProperty2.default)(this, "afterCreateCallbacks", []);
    (0, _defineProperty2.default)(this, "state", LocalRoomState.NEW);
    this.name = this.getDefaultRoomName(myUserId);
  }

  get isNew() {
    return this.state === LocalRoomState.NEW;
  }

  get isCreated() {
    return this.state === LocalRoomState.CREATED;
  }

  get isError() {
    return this.state === LocalRoomState.ERROR;
  }

}

exports.LocalRoom = LocalRoom;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMT0NBTF9ST09NX0lEX1BSRUZJWCIsIkxvY2FsUm9vbVN0YXRlIiwiTG9jYWxSb29tIiwiUm9vbSIsImNvbnN0cnVjdG9yIiwicm9vbUlkIiwiY2xpZW50IiwibXlVc2VySWQiLCJwZW5kaW5nRXZlbnRPcmRlcmluZyIsIlBlbmRpbmdFdmVudE9yZGVyaW5nIiwiRGV0YWNoZWQiLCJORVciLCJuYW1lIiwiZ2V0RGVmYXVsdFJvb21OYW1lIiwiaXNOZXciLCJzdGF0ZSIsImlzQ3JlYXRlZCIsIkNSRUFURUQiLCJpc0Vycm9yIiwiRVJST1IiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWxzL0xvY2FsUm9vbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnQsIFJvb20sIFBlbmRpbmdFdmVudE9yZGVyaW5nIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21hdHJpeFwiO1xuXG5pbXBvcnQgeyBNZW1iZXIgfSBmcm9tIFwiLi4vdXRpbHMvZGlyZWN0LW1lc3NhZ2VzXCI7XG5cbmV4cG9ydCBjb25zdCBMT0NBTF9ST09NX0lEX1BSRUZJWCA9ICdsb2NhbCsnO1xuXG5leHBvcnQgZW51bSBMb2NhbFJvb21TdGF0ZSB7XG4gICAgTkVXLCAvLyBuZXcgbG9jYWwgcm9vbTsgb25seSBrbm93biB0byB0aGUgY2xpZW50XG4gICAgQ1JFQVRJTkcsIC8vIHJlYWwgcm9vbSBpcyBiZWluZyBjcmVhdGVkXG4gICAgQ1JFQVRFRCwgLy8gcmVhbCByb29tIGhhcyBiZWVuIGNyZWF0ZWQgdmlhIEFQSTsgZXZlbnRzIGFwcGxpZWRcbiAgICBFUlJPUiwgLy8gZXJyb3IgZHVyaW5nIHJvb20gY3JlYXRpb25cbn1cblxuLyoqXG4gKiBBIGxvY2FsIHJvb20gdGhhdCBvbmx5IGV4aXN0cyBjbGllbnQgc2lkZS5cbiAqIEl0cyBtYWluIHB1cnBvc2UgaXMgdG8gYmUgdXNlZCBmb3IgdGVtcG9yYXJ5IHJvb21zIHdoZW4gY3JlYXRpbmcgYSBETS5cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsUm9vbSBleHRlbmRzIFJvb20ge1xuICAgIC8qKiBXaGV0aGVyIHRoZSBhY3R1YWwgcm9vbSBzaG91bGQgYmUgZW5jcnlwdGVkLiAqL1xuICAgIGVuY3J5cHRlZCA9IGZhbHNlO1xuICAgIC8qKiBJZiB0aGUgYWN0dWFsIHJvb20gaGFzIGJlZW4gY3JlYXRlZCwgdGhpcyBob2xkcyBpdHMgSUQuICovXG4gICAgYWN0dWFsUm9vbUlkOiBzdHJpbmc7XG4gICAgLyoqIERNIGNoYXQgcGFydG5lciAqL1xuICAgIHRhcmdldHM6IE1lbWJlcltdID0gW107XG4gICAgLyoqIENhbGxiYWNrcyB0aGF0IHNob3VsZCBiZSBpbnZva2VkIGFmdGVyIHRoZSBhY3R1YWwgcm9vbSBoYXMgYmVlbiBjcmVhdGVkLiAqL1xuICAgIGFmdGVyQ3JlYXRlQ2FsbGJhY2tzOiBGdW5jdGlvbltdID0gW107XG4gICAgc3RhdGU6IExvY2FsUm9vbVN0YXRlID0gTG9jYWxSb29tU3RhdGUuTkVXO1xuXG4gICAgY29uc3RydWN0b3Iocm9vbUlkOiBzdHJpbmcsIGNsaWVudDogTWF0cml4Q2xpZW50LCBteVVzZXJJZDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHJvb21JZCwgY2xpZW50LCBteVVzZXJJZCwgeyBwZW5kaW5nRXZlbnRPcmRlcmluZzogUGVuZGluZ0V2ZW50T3JkZXJpbmcuRGV0YWNoZWQgfSk7XG4gICAgICAgIHRoaXMubmFtZSA9IHRoaXMuZ2V0RGVmYXVsdFJvb21OYW1lKG15VXNlcklkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzTmV3KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gTG9jYWxSb29tU3RhdGUuTkVXO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNDcmVhdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gTG9jYWxSb29tU3RhdGUuQ1JFQVRFRDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzRXJyb3IoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBMb2NhbFJvb21TdGF0ZS5FUlJPUjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFNTyxNQUFNQSxvQkFBb0IsR0FBRyxRQUE3Qjs7SUFFS0MsYztBQU9aO0FBQ0E7QUFDQTtBQUNBOzs7O1dBVllBLGM7RUFBQUEsYyxDQUFBQSxjO0VBQUFBLGMsQ0FBQUEsYztFQUFBQSxjLENBQUFBLGM7RUFBQUEsYyxDQUFBQSxjO0dBQUFBLGMsOEJBQUFBLGM7O0FBV0wsTUFBTUMsU0FBTixTQUF3QkMsWUFBeEIsQ0FBNkI7RUFDaEM7O0VBRUE7O0VBRUE7O0VBRUE7RUFJQUMsV0FBVyxDQUFDQyxNQUFELEVBQWlCQyxNQUFqQixFQUF1Q0MsUUFBdkMsRUFBeUQ7SUFDaEUsTUFBTUYsTUFBTixFQUFjQyxNQUFkLEVBQXNCQyxRQUF0QixFQUFnQztNQUFFQyxvQkFBb0IsRUFBRUMsNEJBQUEsQ0FBcUJDO0lBQTdDLENBQWhDO0lBRGdFLGlEQVR4RCxLQVN3RDtJQUFBO0lBQUEsK0NBTGhELEVBS2dEO0lBQUEsNERBSGpDLEVBR2lDO0lBQUEsNkNBRjVDVCxjQUFjLENBQUNVLEdBRTZCO0lBRWhFLEtBQUtDLElBQUwsR0FBWSxLQUFLQyxrQkFBTCxDQUF3Qk4sUUFBeEIsQ0FBWjtFQUNIOztFQUVlLElBQUxPLEtBQUssR0FBWTtJQUN4QixPQUFPLEtBQUtDLEtBQUwsS0FBZWQsY0FBYyxDQUFDVSxHQUFyQztFQUNIOztFQUVtQixJQUFUSyxTQUFTLEdBQVk7SUFDNUIsT0FBTyxLQUFLRCxLQUFMLEtBQWVkLGNBQWMsQ0FBQ2dCLE9BQXJDO0VBQ0g7O0VBRWlCLElBQVBDLE9BQU8sR0FBWTtJQUMxQixPQUFPLEtBQUtILEtBQUwsS0FBZWQsY0FBYyxDQUFDa0IsS0FBckM7RUFDSDs7QUExQitCIn0=