"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _partials = require("matrix-js-sdk/src/@types/partials");

var _languageHandler = require("../../../languageHandler");

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _BaseDialog = _interopRequireDefault(require("../dialogs/BaseDialog"));

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _SpaceChildrenPicker = _interopRequireDefault(require("../spaces/SpaceChildrenPicker"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const isOnlyAdmin = room => {
  const userId = room.client.getUserId();

  if (room.getMember(userId).powerLevelNorm !== 100) {
    return false; // user is not an admin
  }

  return room.getJoinedMembers().every(member => {
    // return true if every other member has a lower power level (we are highest)
    return member.userId === userId || member.powerLevelNorm < 100;
  });
};

const LeaveSpaceDialog = _ref => {
  let {
    space,
    onFinished
  } = _ref;
  const spaceChildren = (0, _react.useMemo)(() => {
    const roomSet = new Set(_SpaceStore.default.instance.getSpaceFilteredRoomIds(space.roomId));

    _SpaceStore.default.instance.traverseSpace(space.roomId, spaceId => {
      if (space.roomId === spaceId) return; // skip the root node

      roomSet.add(spaceId);
    }, false);

    return Array.from(roomSet).map(roomId => space.client.getRoom(roomId)).filter(Boolean);
  }, [space]);
  const [roomsToLeave, setRoomsToLeave] = (0, _react.useState)([]);
  const selectedRooms = (0, _react.useMemo)(() => new Set(roomsToLeave), [roomsToLeave]);
  let rejoinWarning;

  if (space.getJoinRule() !== _partials.JoinRule.Public) {
    rejoinWarning = (0, _languageHandler._t)("You won't be able to rejoin unless you are re-invited.");
  }

  let onlyAdminWarning;

  if (isOnlyAdmin(space)) {
    onlyAdminWarning = (0, _languageHandler._t)("You're the only admin of this space. " + "Leaving it will mean no one has control over it.");
  } else {
    const numChildrenOnlyAdminIn = roomsToLeave.filter(isOnlyAdmin).length;

    if (numChildrenOnlyAdminIn > 0) {
      onlyAdminWarning = (0, _languageHandler._t)("You're the only admin of some of the rooms or spaces you wish to leave. " + "Leaving them will leave them without any admins.");
    }
  }

  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    title: (0, _languageHandler._t)("Leave %(spaceName)s", {
      spaceName: space.name
    }),
    className: "mx_LeaveSpaceDialog",
    contentId: "mx_LeaveSpaceDialog",
    onFinished: () => onFinished(false),
    fixedWidth: false
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Dialog_content",
    id: "mx_LeaveSpaceDialog"
  }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are about to leave <spaceName/>.", {}, {
    spaceName: () => /*#__PURE__*/_react.default.createElement("b", null, space.name)
  }), "\xA0", rejoinWarning, rejoinWarning && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, "\xA0"), spaceChildren.length > 0 && (0, _languageHandler._t)("Would you like to leave the rooms in this space?")), spaceChildren.length > 0 && /*#__PURE__*/_react.default.createElement(_SpaceChildrenPicker.default, {
    space: space,
    spaceChildren: spaceChildren,
    selected: selectedRooms,
    onChange: setRoomsToLeave,
    noneLabel: (0, _languageHandler._t)("Don't leave any rooms"),
    allLabel: (0, _languageHandler._t)("Leave all rooms"),
    specificLabel: (0, _languageHandler._t)("Leave some rooms")
  }), onlyAdminWarning && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_LeaveSpaceDialog_section_warning"
  }, onlyAdminWarning)), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
    primaryButton: (0, _languageHandler._t)("Leave space"),
    primaryButtonClass: "danger",
    onPrimaryButtonClick: () => onFinished(true, roomsToLeave),
    hasCancel: true,
    onCancel: () => onFinished(false)
  }));
};

var _default = LeaveSpaceDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc09ubHlBZG1pbiIsInJvb20iLCJ1c2VySWQiLCJjbGllbnQiLCJnZXRVc2VySWQiLCJnZXRNZW1iZXIiLCJwb3dlckxldmVsTm9ybSIsImdldEpvaW5lZE1lbWJlcnMiLCJldmVyeSIsIm1lbWJlciIsIkxlYXZlU3BhY2VEaWFsb2ciLCJzcGFjZSIsIm9uRmluaXNoZWQiLCJzcGFjZUNoaWxkcmVuIiwidXNlTWVtbyIsInJvb21TZXQiLCJTZXQiLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJnZXRTcGFjZUZpbHRlcmVkUm9vbUlkcyIsInJvb21JZCIsInRyYXZlcnNlU3BhY2UiLCJzcGFjZUlkIiwiYWRkIiwiQXJyYXkiLCJmcm9tIiwibWFwIiwiZ2V0Um9vbSIsImZpbHRlciIsIkJvb2xlYW4iLCJyb29tc1RvTGVhdmUiLCJzZXRSb29tc1RvTGVhdmUiLCJ1c2VTdGF0ZSIsInNlbGVjdGVkUm9vbXMiLCJyZWpvaW5XYXJuaW5nIiwiZ2V0Sm9pblJ1bGUiLCJKb2luUnVsZSIsIlB1YmxpYyIsIl90Iiwib25seUFkbWluV2FybmluZyIsIm51bUNoaWxkcmVuT25seUFkbWluSW4iLCJsZW5ndGgiLCJzcGFjZU5hbWUiLCJuYW1lIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9MZWF2ZVNwYWNlRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IEpvaW5SdWxlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFsc1wiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvQmFzZURpYWxvZ1wiO1xuaW1wb3J0IFNwYWNlU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9zcGFjZXMvU3BhY2VTdG9yZVwiO1xuaW1wb3J0IFNwYWNlQ2hpbGRyZW5QaWNrZXIgZnJvbSBcIi4uL3NwYWNlcy9TcGFjZUNoaWxkcmVuUGlja2VyXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNwYWNlOiBSb29tO1xuICAgIG9uRmluaXNoZWQobGVhdmU6IGJvb2xlYW4sIHJvb21zPzogUm9vbVtdKTogdm9pZDtcbn1cblxuY29uc3QgaXNPbmx5QWRtaW4gPSAocm9vbTogUm9vbSk6IGJvb2xlYW4gPT4ge1xuICAgIGNvbnN0IHVzZXJJZCA9IHJvb20uY2xpZW50LmdldFVzZXJJZCgpO1xuICAgIGlmIChyb29tLmdldE1lbWJlcih1c2VySWQpLnBvd2VyTGV2ZWxOb3JtICE9PSAxMDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyB1c2VyIGlzIG5vdCBhbiBhZG1pblxuICAgIH1cbiAgICByZXR1cm4gcm9vbS5nZXRKb2luZWRNZW1iZXJzKCkuZXZlcnkobWVtYmVyID0+IHtcbiAgICAgICAgLy8gcmV0dXJuIHRydWUgaWYgZXZlcnkgb3RoZXIgbWVtYmVyIGhhcyBhIGxvd2VyIHBvd2VyIGxldmVsICh3ZSBhcmUgaGlnaGVzdClcbiAgICAgICAgcmV0dXJuIG1lbWJlci51c2VySWQgPT09IHVzZXJJZCB8fCBtZW1iZXIucG93ZXJMZXZlbE5vcm0gPCAxMDA7XG4gICAgfSk7XG59O1xuXG5jb25zdCBMZWF2ZVNwYWNlRGlhbG9nOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgc3BhY2UsIG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGNvbnN0IHNwYWNlQ2hpbGRyZW4gPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbVNldCA9IG5ldyBTZXQoU3BhY2VTdG9yZS5pbnN0YW5jZS5nZXRTcGFjZUZpbHRlcmVkUm9vbUlkcyhzcGFjZS5yb29tSWQpKTtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS50cmF2ZXJzZVNwYWNlKHNwYWNlLnJvb21JZCwgc3BhY2VJZCA9PiB7XG4gICAgICAgICAgICBpZiAoc3BhY2Uucm9vbUlkID09PSBzcGFjZUlkKSByZXR1cm47IC8vIHNraXAgdGhlIHJvb3Qgbm9kZVxuICAgICAgICAgICAgcm9vbVNldC5hZGQoc3BhY2VJZCk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20ocm9vbVNldCkubWFwKHJvb21JZCA9PiBzcGFjZS5jbGllbnQuZ2V0Um9vbShyb29tSWQpKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgfSwgW3NwYWNlXSk7XG4gICAgY29uc3QgW3Jvb21zVG9MZWF2ZSwgc2V0Um9vbXNUb0xlYXZlXSA9IHVzZVN0YXRlPFJvb21bXT4oW10pO1xuICAgIGNvbnN0IHNlbGVjdGVkUm9vbXMgPSB1c2VNZW1vKCgpID0+IG5ldyBTZXQocm9vbXNUb0xlYXZlKSwgW3Jvb21zVG9MZWF2ZV0pO1xuXG4gICAgbGV0IHJlam9pbldhcm5pbmc7XG4gICAgaWYgKHNwYWNlLmdldEpvaW5SdWxlKCkgIT09IEpvaW5SdWxlLlB1YmxpYykge1xuICAgICAgICByZWpvaW5XYXJuaW5nID0gX3QoXCJZb3Ugd29uJ3QgYmUgYWJsZSB0byByZWpvaW4gdW5sZXNzIHlvdSBhcmUgcmUtaW52aXRlZC5cIik7XG4gICAgfVxuXG4gICAgbGV0IG9ubHlBZG1pbldhcm5pbmc7XG4gICAgaWYgKGlzT25seUFkbWluKHNwYWNlKSkge1xuICAgICAgICBvbmx5QWRtaW5XYXJuaW5nID0gX3QoXCJZb3UncmUgdGhlIG9ubHkgYWRtaW4gb2YgdGhpcyBzcGFjZS4gXCIgK1xuICAgICAgICAgICAgXCJMZWF2aW5nIGl0IHdpbGwgbWVhbiBubyBvbmUgaGFzIGNvbnRyb2wgb3ZlciBpdC5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbnVtQ2hpbGRyZW5Pbmx5QWRtaW5JbiA9IHJvb21zVG9MZWF2ZS5maWx0ZXIoaXNPbmx5QWRtaW4pLmxlbmd0aDtcbiAgICAgICAgaWYgKG51bUNoaWxkcmVuT25seUFkbWluSW4gPiAwKSB7XG4gICAgICAgICAgICBvbmx5QWRtaW5XYXJuaW5nID0gX3QoXCJZb3UncmUgdGhlIG9ubHkgYWRtaW4gb2Ygc29tZSBvZiB0aGUgcm9vbXMgb3Igc3BhY2VzIHlvdSB3aXNoIHRvIGxlYXZlLiBcIiArXG4gICAgICAgICAgICAgICAgXCJMZWF2aW5nIHRoZW0gd2lsbCBsZWF2ZSB0aGVtIHdpdGhvdXQgYW55IGFkbWlucy5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gPEJhc2VEaWFsb2dcbiAgICAgICAgdGl0bGU9e190KFwiTGVhdmUgJShzcGFjZU5hbWUpc1wiLCB7IHNwYWNlTmFtZTogc3BhY2UubmFtZSB9KX1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfTGVhdmVTcGFjZURpYWxvZ1wiXG4gICAgICAgIGNvbnRlbnRJZD1cIm14X0xlYXZlU3BhY2VEaWFsb2dcIlxuICAgICAgICBvbkZpbmlzaGVkPXsoKSA9PiBvbkZpbmlzaGVkKGZhbHNlKX1cbiAgICAgICAgZml4ZWRXaWR0aD17ZmFsc2V9XG4gICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCIgaWQ9XCJteF9MZWF2ZVNwYWNlRGlhbG9nXCI+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICB7IF90KFwiWW91IGFyZSBhYm91dCB0byBsZWF2ZSA8c3BhY2VOYW1lLz4uXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgIHNwYWNlTmFtZTogKCkgPT4gPGI+eyBzcGFjZS5uYW1lIH08L2I+LFxuICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICB7IHJlam9pbldhcm5pbmcgfVxuICAgICAgICAgICAgICAgIHsgcmVqb2luV2FybmluZyAmJiAoPD4mbmJzcDs8Lz4pIH1cbiAgICAgICAgICAgICAgICB7IHNwYWNlQ2hpbGRyZW4ubGVuZ3RoID4gMCAmJiBfdChcIldvdWxkIHlvdSBsaWtlIHRvIGxlYXZlIHRoZSByb29tcyBpbiB0aGlzIHNwYWNlP1wiKSB9XG4gICAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICAgIHsgc3BhY2VDaGlsZHJlbi5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgICA8U3BhY2VDaGlsZHJlblBpY2tlclxuICAgICAgICAgICAgICAgICAgICBzcGFjZT17c3BhY2V9XG4gICAgICAgICAgICAgICAgICAgIHNwYWNlQ2hpbGRyZW49e3NwYWNlQ2hpbGRyZW59XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZFJvb21zfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0Um9vbXNUb0xlYXZlfVxuICAgICAgICAgICAgICAgICAgICBub25lTGFiZWw9e190KFwiRG9uJ3QgbGVhdmUgYW55IHJvb21zXCIpfVxuICAgICAgICAgICAgICAgICAgICBhbGxMYWJlbD17X3QoXCJMZWF2ZSBhbGwgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgIHNwZWNpZmljTGFiZWw9e190KFwiTGVhdmUgc29tZSByb29tc1wiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSB9XG5cbiAgICAgICAgICAgIHsgb25seUFkbWluV2FybmluZyAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlYXZlU3BhY2VEaWFsb2dfc2VjdGlvbl93YXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgeyBvbmx5QWRtaW5XYXJuaW5nIH1cbiAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXCJMZWF2ZSBzcGFjZVwiKX1cbiAgICAgICAgICAgIHByaW1hcnlCdXR0b25DbGFzcz1cImRhbmdlclwiXG4gICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17KCkgPT4gb25GaW5pc2hlZCh0cnVlLCByb29tc1RvTGVhdmUpfVxuICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgb25DYW5jZWw9eygpID0+IG9uRmluaXNoZWQoZmFsc2UpfVxuICAgICAgICAvPlxuICAgIDwvQmFzZURpYWxvZz47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMZWF2ZVNwYWNlRGlhbG9nO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FB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