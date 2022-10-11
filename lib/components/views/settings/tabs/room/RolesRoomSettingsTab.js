"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BannedUser = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _logger = require("matrix-js-sdk/src/logger");

var _lodash = require("lodash");

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _strings = require("../../../../../utils/strings");

var _ErrorDialog = _interopRequireDefault(require("../../../dialogs/ErrorDialog"));

var _PowerSelector = _interopRequireDefault(require("../../../elements/PowerSelector"));

var _SettingsFieldset = _interopRequireDefault(require("../../SettingsFieldset"));

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

/*
Copyright 2019-2021 The Matrix.org Foundation C.I.C.

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
const plEventsToShow = {
  // If an event is listed here, it will be shown in the PL settings. Defaults will be calculated.
  [_event.EventType.RoomAvatar]: {
    isState: true
  },
  [_event.EventType.RoomName]: {
    isState: true
  },
  [_event.EventType.RoomCanonicalAlias]: {
    isState: true
  },
  [_event.EventType.SpaceChild]: {
    isState: true,
    hideForRoom: true
  },
  [_event.EventType.RoomHistoryVisibility]: {
    isState: true,
    hideForSpace: true
  },
  [_event.EventType.RoomPowerLevels]: {
    isState: true
  },
  [_event.EventType.RoomTopic]: {
    isState: true
  },
  [_event.EventType.RoomTombstone]: {
    isState: true,
    hideForSpace: true
  },
  [_event.EventType.RoomEncryption]: {
    isState: true,
    hideForSpace: true
  },
  [_event.EventType.RoomServerAcl]: {
    isState: true,
    hideForSpace: true
  },
  [_event.EventType.RoomPinnedEvents]: {
    isState: true,
    hideForSpace: true
  },
  [_event.EventType.Reaction]: {
    isState: false,
    hideForSpace: true
  },
  [_event.EventType.RoomRedaction]: {
    isState: false,
    hideForSpace: true
  },
  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  "im.vector.modular.widgets": {
    isState: true,
    hideForSpace: true
  }
}; // parse a string as an integer; if the input is undefined, or cannot be parsed
// as an integer, return a default.

function parseIntWithDefault(val, def) {
  const res = parseInt(val);
  return isNaN(res) ? def : res;
}

class BannedUser extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onUnbanClick", e => {
      _MatrixClientPeg.MatrixClientPeg.get().unban(this.props.member.roomId, this.props.member.userId).catch(err => {
        _logger.logger.error("Failed to unban: " + err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('Error'),
          description: (0, _languageHandler._t)('Failed to unban')
        });
      });
    });
  }

  render() {
    let unbanButton;

    if (this.props.canUnban) {
      unbanButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_RolesRoomSettingsTab_unbanBtn",
        kind: "danger_sm",
        onClick: this.onUnbanClick
      }, (0, _languageHandler._t)('Unban'));
    }

    const userId = this.props.member.name === this.props.member.userId ? null : this.props.member.userId;
    return /*#__PURE__*/_react.default.createElement("li", null, unbanButton, /*#__PURE__*/_react.default.createElement("span", {
      title: (0, _languageHandler._t)("Banned by %(displayName)s", {
        displayName: this.props.by
      })
    }, /*#__PURE__*/_react.default.createElement("strong", null, this.props.member.name), " ", userId, this.props.reason ? " " + (0, _languageHandler._t)('Reason') + ": " + this.props.reason : ""));
  }

}

exports.BannedUser = BannedUser;

class RolesRoomSettingsTab extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onRoomStateUpdate", state => {
      if (state.roomId !== this.props.roomId) return;
      this.onThisRoomMembership();
    });
    (0, _defineProperty2.default)(this, "onThisRoomMembership", (0, _lodash.throttle)(() => {
      this.forceUpdate();
    }, 200, {
      leading: true,
      trailing: true
    }));
    (0, _defineProperty2.default)(this, "onPowerLevelsChanged", (value, powerLevelKey) => {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const room = client.getRoom(this.props.roomId);
      const plEvent = room.currentState.getStateEvents(_event.EventType.RoomPowerLevels, '');
      let plContent = plEvent ? plEvent.getContent() || {} : {}; // Clone the power levels just in case

      plContent = Object.assign({}, plContent);
      const eventsLevelPrefix = "event_levels_";

      if (powerLevelKey.startsWith(eventsLevelPrefix)) {
        // deep copy "events" object, Object.assign itself won't deep copy
        plContent["events"] = Object.assign({}, plContent["events"] || {});
        plContent["events"][powerLevelKey.slice(eventsLevelPrefix.length)] = value;
      } else {
        const keyPath = powerLevelKey.split('.');
        let parentObj;
        let currentObj = plContent;

        for (const key of keyPath) {
          if (!currentObj[key]) {
            currentObj[key] = {};
          }

          parentObj = currentObj;
          currentObj = currentObj[key];
        }

        parentObj[keyPath[keyPath.length - 1]] = value;
      }

      client.sendStateEvent(this.props.roomId, _event.EventType.RoomPowerLevels, plContent).catch(e => {
        _logger.logger.error(e);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('Error changing power level requirement'),
          description: (0, _languageHandler._t)("An error occurred changing the room's power level requirements. Ensure you have sufficient " + "permissions and try again.")
        });
      });
    });
    (0, _defineProperty2.default)(this, "onUserPowerLevelChanged", (value, powerLevelKey) => {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const room = client.getRoom(this.props.roomId);
      const plEvent = room.currentState.getStateEvents(_event.EventType.RoomPowerLevels, '');
      let plContent = plEvent ? plEvent.getContent() || {} : {}; // Clone the power levels just in case

      plContent = Object.assign({}, plContent); // powerLevelKey should be a user ID

      if (!plContent['users']) plContent['users'] = {};
      plContent['users'][powerLevelKey] = value;
      client.sendStateEvent(this.props.roomId, _event.EventType.RoomPowerLevels, plContent).catch(e => {
        _logger.logger.error(e);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('Error changing power level'),
          description: (0, _languageHandler._t)("An error occurred changing the user's power level. Ensure you have sufficient " + "permissions and try again.")
        });
      });
    });
  }

  componentDidMount() {
    _MatrixClientPeg.MatrixClientPeg.get().on(_roomState.RoomStateEvent.Update, this.onRoomStateUpdate);
  }

  componentWillUnmount() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client) {
      client.removeListener(_roomState.RoomStateEvent.Update, this.onRoomStateUpdate);
    }
  }

  populateDefaultPlEvents(eventsSection, stateLevel, eventsLevel) {
    for (const desiredEvent of Object.keys(plEventsToShow)) {
      if (!(desiredEvent in eventsSection)) {
        eventsSection[desiredEvent] = plEventsToShow[desiredEvent].isState ? stateLevel : eventsLevel;
      }
    }
  }

  render() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(this.props.roomId);
    const isSpaceRoom = room.isSpaceRoom();
    const plEvent = room.currentState.getStateEvents(_event.EventType.RoomPowerLevels, '');
    const plContent = plEvent ? plEvent.getContent() || {} : {};
    const canChangeLevels = room.currentState.mayClientSendStateEvent(_event.EventType.RoomPowerLevels, client);
    const plEventsToLabels = {
      // These will be translated for us later.
      [_event.EventType.RoomAvatar]: isSpaceRoom ? (0, _languageHandler._td)("Change space avatar") : (0, _languageHandler._td)("Change room avatar"),
      [_event.EventType.RoomName]: isSpaceRoom ? (0, _languageHandler._td)("Change space name") : (0, _languageHandler._td)("Change room name"),
      [_event.EventType.RoomCanonicalAlias]: isSpaceRoom ? (0, _languageHandler._td)("Change main address for the space") : (0, _languageHandler._td)("Change main address for the room"),
      [_event.EventType.SpaceChild]: (0, _languageHandler._td)("Manage rooms in this space"),
      [_event.EventType.RoomHistoryVisibility]: (0, _languageHandler._td)("Change history visibility"),
      [_event.EventType.RoomPowerLevels]: (0, _languageHandler._td)("Change permissions"),
      [_event.EventType.RoomTopic]: isSpaceRoom ? (0, _languageHandler._td)("Change description") : (0, _languageHandler._td)("Change topic"),
      [_event.EventType.RoomTombstone]: (0, _languageHandler._td)("Upgrade the room"),
      [_event.EventType.RoomEncryption]: (0, _languageHandler._td)("Enable room encryption"),
      [_event.EventType.RoomServerAcl]: (0, _languageHandler._td)("Change server ACLs"),
      [_event.EventType.Reaction]: (0, _languageHandler._td)("Send reactions"),
      [_event.EventType.RoomRedaction]: (0, _languageHandler._td)("Remove messages sent by me"),
      // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
      "im.vector.modular.widgets": isSpaceRoom ? null : (0, _languageHandler._td)("Modify widgets")
    };

    if (_SettingsStore.default.getValue("feature_pinning")) {
      plEventsToLabels[_event.EventType.RoomPinnedEvents] = (0, _languageHandler._td)("Manage pinned events");
    }

    const powerLevelDescriptors = {
      "users_default": {
        desc: (0, _languageHandler._t)('Default role'),
        defaultValue: 0
      },
      "events_default": {
        desc: (0, _languageHandler._t)('Send messages'),
        defaultValue: 0,
        hideForSpace: true
      },
      "invite": {
        desc: (0, _languageHandler._t)('Invite users'),
        defaultValue: 0
      },
      "state_default": {
        desc: (0, _languageHandler._t)('Change settings'),
        defaultValue: 50
      },
      "kick": {
        desc: (0, _languageHandler._t)('Remove users'),
        defaultValue: 50
      },
      "ban": {
        desc: (0, _languageHandler._t)('Ban users'),
        defaultValue: 50
      },
      "redact": {
        desc: (0, _languageHandler._t)('Remove messages sent by others'),
        defaultValue: 50,
        hideForSpace: true
      },
      "notifications.room": {
        desc: (0, _languageHandler._t)('Notify everyone'),
        defaultValue: 50,
        hideForSpace: true
      }
    };
    const eventsLevels = plContent.events || {};
    const userLevels = plContent.users || {};
    const banLevel = parseIntWithDefault(plContent.ban, powerLevelDescriptors.ban.defaultValue);
    const defaultUserLevel = parseIntWithDefault(plContent.users_default, powerLevelDescriptors.users_default.defaultValue);
    let currentUserLevel = userLevels[client.getUserId()];

    if (currentUserLevel === undefined) {
      currentUserLevel = defaultUserLevel;
    }

    this.populateDefaultPlEvents(eventsLevels, parseIntWithDefault(plContent.state_default, powerLevelDescriptors.state_default.defaultValue), parseIntWithDefault(plContent.events_default, powerLevelDescriptors.events_default.defaultValue));

    let privilegedUsersSection = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('No users have specific privileges in this room'));

    let mutedUsersSection;

    if (Object.keys(userLevels).length) {
      const privilegedUsers = [];
      const mutedUsers = [];
      Object.keys(userLevels).forEach(user => {
        if (!Number.isInteger(userLevels[user])) {
          return;
        }

        const canChange = userLevels[user] < currentUserLevel && canChangeLevels;

        if (userLevels[user] > defaultUserLevel) {
          // privileged
          privilegedUsers.push( /*#__PURE__*/_react.default.createElement(_PowerSelector.default, {
            value: userLevels[user],
            disabled: !canChange,
            label: user,
            key: user,
            powerLevelKey: user // Will be sent as the second parameter to `onChange`
            ,
            onChange: this.onUserPowerLevelChanged
          }));
        } else if (userLevels[user] < defaultUserLevel) {
          // muted
          mutedUsers.push( /*#__PURE__*/_react.default.createElement(_PowerSelector.default, {
            value: userLevels[user],
            disabled: !canChange,
            label: user,
            key: user,
            powerLevelKey: user // Will be sent as the second parameter to `onChange`
            ,
            onChange: this.onUserPowerLevelChanged
          }));
        }
      }); // comparator for sorting PL users lexicographically on PL descending, MXID ascending. (case-insensitive)

      const comparator = (a, b) => {
        const plDiff = userLevels[b.key] - userLevels[a.key];
        return plDiff !== 0 ? plDiff : (0, _strings.compare)(a.key.toLocaleLowerCase(), b.key.toLocaleLowerCase());
      };

      privilegedUsers.sort(comparator);
      mutedUsers.sort(comparator);

      if (privilegedUsers.length) {
        privilegedUsersSection = /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
          legend: (0, _languageHandler._t)('Privileged Users')
        }, privilegedUsers);
      }

      if (mutedUsers.length) {
        mutedUsersSection = /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
          legend: (0, _languageHandler._t)('Muted Users')
        }, mutedUsers);
      }
    }

    const banned = room.getMembersWithMembership("ban");
    let bannedUsersSection;

    if (banned.length) {
      const canBanUsers = currentUserLevel >= banLevel;
      bannedUsersSection = /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
        legend: (0, _languageHandler._t)('Banned users')
      }, /*#__PURE__*/_react.default.createElement("ul", null, banned.map(member => {
        const banEvent = member.events.member.getContent();
        const sender = room.getMember(member.events.member.getSender());
        let bannedBy = member.events.member.getSender(); // start by falling back to mxid

        if (sender) bannedBy = sender.name;
        return /*#__PURE__*/_react.default.createElement(BannedUser, {
          key: member.userId,
          canUnban: canBanUsers,
          member: member,
          reason: banEvent.reason,
          by: bannedBy
        });
      })));
    }

    const powerSelectors = Object.keys(powerLevelDescriptors).map((key, index) => {
      const descriptor = powerLevelDescriptors[key];

      if (isSpaceRoom && descriptor.hideForSpace) {
        return null;
      }

      const keyPath = key.split('.');
      let currentObj = plContent;

      for (const prop of keyPath) {
        if (currentObj === undefined) {
          break;
        }

        currentObj = currentObj[prop];
      }

      const value = parseIntWithDefault(currentObj, descriptor.defaultValue);
      return /*#__PURE__*/_react.default.createElement("div", {
        key: index,
        className: ""
      }, /*#__PURE__*/_react.default.createElement(_PowerSelector.default, {
        label: descriptor.desc,
        value: value,
        usersDefault: defaultUserLevel,
        disabled: !canChangeLevels || currentUserLevel < value,
        powerLevelKey: key // Will be sent as the second parameter to `onChange`
        ,
        onChange: this.onPowerLevelsChanged
      }));
    }).filter(Boolean); // hide the power level selector for enabling E2EE if it the room is already encrypted

    if (client.isRoomEncrypted(this.props.roomId)) {
      delete eventsLevels[_event.EventType.RoomEncryption];
    }

    const eventPowerSelectors = Object.keys(eventsLevels).map((eventType, i) => {
      if (isSpaceRoom && plEventsToShow[eventType]?.hideForSpace) {
        return null;
      } else if (!isSpaceRoom && plEventsToShow[eventType]?.hideForRoom) {
        return null;
      }

      let label = plEventsToLabels[eventType];

      if (label) {
        label = (0, _languageHandler._t)(label);
      } else {
        label = (0, _languageHandler._t)("Send %(eventType)s events", {
          eventType
        });
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "",
        key: eventType
      }, /*#__PURE__*/_react.default.createElement(_PowerSelector.default, {
        label: label,
        value: eventsLevels[eventType],
        usersDefault: defaultUserLevel,
        disabled: !canChangeLevels || currentUserLevel < eventsLevels[eventType],
        powerLevelKey: "event_levels_" + eventType,
        onChange: this.onPowerLevelsChanged
      }));
    }).filter(Boolean);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_RolesRoomSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Roles & Permissions")), privilegedUsersSection, mutedUsersSection, bannedUsersSection, /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
      legend: (0, _languageHandler._t)("Permissions"),
      description: isSpaceRoom ? (0, _languageHandler._t)('Select the roles required to change various parts of the space') : (0, _languageHandler._t)('Select the roles required to change various parts of the room')
    }, powerSelectors, eventPowerSelectors));
  }

}

exports.default = RolesRoomSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwbEV2ZW50c1RvU2hvdyIsIkV2ZW50VHlwZSIsIlJvb21BdmF0YXIiLCJpc1N0YXRlIiwiUm9vbU5hbWUiLCJSb29tQ2Fub25pY2FsQWxpYXMiLCJTcGFjZUNoaWxkIiwiaGlkZUZvclJvb20iLCJSb29tSGlzdG9yeVZpc2liaWxpdHkiLCJoaWRlRm9yU3BhY2UiLCJSb29tUG93ZXJMZXZlbHMiLCJSb29tVG9waWMiLCJSb29tVG9tYnN0b25lIiwiUm9vbUVuY3J5cHRpb24iLCJSb29tU2VydmVyQWNsIiwiUm9vbVBpbm5lZEV2ZW50cyIsIlJlYWN0aW9uIiwiUm9vbVJlZGFjdGlvbiIsInBhcnNlSW50V2l0aERlZmF1bHQiLCJ2YWwiLCJkZWYiLCJyZXMiLCJwYXJzZUludCIsImlzTmFOIiwiQmFubmVkVXNlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInVuYmFuIiwicHJvcHMiLCJtZW1iZXIiLCJyb29tSWQiLCJ1c2VySWQiLCJjYXRjaCIsImVyciIsImxvZ2dlciIsImVycm9yIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiX3QiLCJkZXNjcmlwdGlvbiIsInJlbmRlciIsInVuYmFuQnV0dG9uIiwiY2FuVW5iYW4iLCJvblVuYmFuQ2xpY2siLCJuYW1lIiwiZGlzcGxheU5hbWUiLCJieSIsInJlYXNvbiIsIlJvbGVzUm9vbVNldHRpbmdzVGFiIiwic3RhdGUiLCJvblRoaXNSb29tTWVtYmVyc2hpcCIsInRocm90dGxlIiwiZm9yY2VVcGRhdGUiLCJsZWFkaW5nIiwidHJhaWxpbmciLCJ2YWx1ZSIsInBvd2VyTGV2ZWxLZXkiLCJjbGllbnQiLCJyb29tIiwiZ2V0Um9vbSIsInBsRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsInBsQ29udGVudCIsImdldENvbnRlbnQiLCJPYmplY3QiLCJhc3NpZ24iLCJldmVudHNMZXZlbFByZWZpeCIsInN0YXJ0c1dpdGgiLCJzbGljZSIsImxlbmd0aCIsImtleVBhdGgiLCJzcGxpdCIsInBhcmVudE9iaiIsImN1cnJlbnRPYmoiLCJrZXkiLCJzZW5kU3RhdGVFdmVudCIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJSb29tU3RhdGVFdmVudCIsIlVwZGF0ZSIsIm9uUm9vbVN0YXRlVXBkYXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsInBvcHVsYXRlRGVmYXVsdFBsRXZlbnRzIiwiZXZlbnRzU2VjdGlvbiIsInN0YXRlTGV2ZWwiLCJldmVudHNMZXZlbCIsImRlc2lyZWRFdmVudCIsImtleXMiLCJpc1NwYWNlUm9vbSIsImNhbkNoYW5nZUxldmVscyIsIm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50IiwicGxFdmVudHNUb0xhYmVscyIsIl90ZCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsInBvd2VyTGV2ZWxEZXNjcmlwdG9ycyIsImRlc2MiLCJkZWZhdWx0VmFsdWUiLCJldmVudHNMZXZlbHMiLCJldmVudHMiLCJ1c2VyTGV2ZWxzIiwidXNlcnMiLCJiYW5MZXZlbCIsImJhbiIsImRlZmF1bHRVc2VyTGV2ZWwiLCJ1c2Vyc19kZWZhdWx0IiwiY3VycmVudFVzZXJMZXZlbCIsImdldFVzZXJJZCIsInVuZGVmaW5lZCIsInN0YXRlX2RlZmF1bHQiLCJldmVudHNfZGVmYXVsdCIsInByaXZpbGVnZWRVc2Vyc1NlY3Rpb24iLCJtdXRlZFVzZXJzU2VjdGlvbiIsInByaXZpbGVnZWRVc2VycyIsIm11dGVkVXNlcnMiLCJmb3JFYWNoIiwidXNlciIsIk51bWJlciIsImlzSW50ZWdlciIsImNhbkNoYW5nZSIsInB1c2giLCJvblVzZXJQb3dlckxldmVsQ2hhbmdlZCIsImNvbXBhcmF0b3IiLCJhIiwiYiIsInBsRGlmZiIsImNvbXBhcmUiLCJ0b0xvY2FsZUxvd2VyQ2FzZSIsInNvcnQiLCJiYW5uZWQiLCJnZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAiLCJiYW5uZWRVc2Vyc1NlY3Rpb24iLCJjYW5CYW5Vc2VycyIsIm1hcCIsImJhbkV2ZW50Iiwic2VuZGVyIiwiZ2V0TWVtYmVyIiwiZ2V0U2VuZGVyIiwiYmFubmVkQnkiLCJwb3dlclNlbGVjdG9ycyIsImluZGV4IiwiZGVzY3JpcHRvciIsInByb3AiLCJvblBvd2VyTGV2ZWxzQ2hhbmdlZCIsImZpbHRlciIsIkJvb2xlYW4iLCJpc1Jvb21FbmNyeXB0ZWQiLCJldmVudFBvd2VyU2VsZWN0b3JzIiwiZXZlbnRUeXBlIiwiaSIsImxhYmVsIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvdGFicy9yb29tL1JvbGVzUm9vbVNldHRpbmdzVGFiLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTktMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHsgUm9vbVN0YXRlLCBSb29tU3RhdGVFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1zdGF0ZVwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgdGhyb3R0bGUgfSBmcm9tIFwibG9kYXNoXCI7XG5cbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IHsgY29tcGFyZSB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi91dGlscy9zdHJpbmdzXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSAnLi4vLi4vLi4vZGlhbG9ncy9FcnJvckRpYWxvZyc7XG5pbXBvcnQgUG93ZXJTZWxlY3RvciBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvUG93ZXJTZWxlY3RvclwiO1xuaW1wb3J0IFNldHRpbmdzRmllbGRzZXQgZnJvbSAnLi4vLi4vU2V0dGluZ3NGaWVsZHNldCc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuXG5pbnRlcmZhY2UgSUV2ZW50U2hvd09wdHMge1xuICAgIGlzU3RhdGU/OiBib29sZWFuO1xuICAgIGhpZGVGb3JTcGFjZT86IGJvb2xlYW47XG4gICAgaGlkZUZvclJvb20/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVBvd2VyTGV2ZWxEZXNjcmlwdG9yIHtcbiAgICBkZXNjOiBzdHJpbmc7XG4gICAgZGVmYXVsdFZhbHVlOiBudW1iZXI7XG4gICAgaGlkZUZvclNwYWNlPzogYm9vbGVhbjtcbn1cblxuY29uc3QgcGxFdmVudHNUb1Nob3c6IFJlY29yZDxzdHJpbmcsIElFdmVudFNob3dPcHRzPiA9IHtcbiAgICAvLyBJZiBhbiBldmVudCBpcyBsaXN0ZWQgaGVyZSwgaXQgd2lsbCBiZSBzaG93biBpbiB0aGUgUEwgc2V0dGluZ3MuIERlZmF1bHRzIHdpbGwgYmUgY2FsY3VsYXRlZC5cbiAgICBbRXZlbnRUeXBlLlJvb21BdmF0YXJdOiB7IGlzU3RhdGU6IHRydWUgfSxcbiAgICBbRXZlbnRUeXBlLlJvb21OYW1lXTogeyBpc1N0YXRlOiB0cnVlIH0sXG4gICAgW0V2ZW50VHlwZS5Sb29tQ2Fub25pY2FsQWxpYXNdOiB7IGlzU3RhdGU6IHRydWUgfSxcbiAgICBbRXZlbnRUeXBlLlNwYWNlQ2hpbGRdOiB7IGlzU3RhdGU6IHRydWUsIGhpZGVGb3JSb29tOiB0cnVlIH0sXG4gICAgW0V2ZW50VHlwZS5Sb29tSGlzdG9yeVZpc2liaWxpdHldOiB7IGlzU3RhdGU6IHRydWUsIGhpZGVGb3JTcGFjZTogdHJ1ZSB9LFxuICAgIFtFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzXTogeyBpc1N0YXRlOiB0cnVlIH0sXG4gICAgW0V2ZW50VHlwZS5Sb29tVG9waWNdOiB7IGlzU3RhdGU6IHRydWUgfSxcbiAgICBbRXZlbnRUeXBlLlJvb21Ub21ic3RvbmVdOiB7IGlzU3RhdGU6IHRydWUsIGhpZGVGb3JTcGFjZTogdHJ1ZSB9LFxuICAgIFtFdmVudFR5cGUuUm9vbUVuY3J5cHRpb25dOiB7IGlzU3RhdGU6IHRydWUsIGhpZGVGb3JTcGFjZTogdHJ1ZSB9LFxuICAgIFtFdmVudFR5cGUuUm9vbVNlcnZlckFjbF06IHsgaXNTdGF0ZTogdHJ1ZSwgaGlkZUZvclNwYWNlOiB0cnVlIH0sXG4gICAgW0V2ZW50VHlwZS5Sb29tUGlubmVkRXZlbnRzXTogeyBpc1N0YXRlOiB0cnVlLCBoaWRlRm9yU3BhY2U6IHRydWUgfSxcbiAgICBbRXZlbnRUeXBlLlJlYWN0aW9uXTogeyBpc1N0YXRlOiBmYWxzZSwgaGlkZUZvclNwYWNlOiB0cnVlIH0sXG4gICAgW0V2ZW50VHlwZS5Sb29tUmVkYWN0aW9uXTogeyBpc1N0YXRlOiBmYWxzZSwgaGlkZUZvclNwYWNlOiB0cnVlIH0sXG5cbiAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgXCJpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzXCI6IHsgaXNTdGF0ZTogdHJ1ZSwgaGlkZUZvclNwYWNlOiB0cnVlIH0sXG59O1xuXG4vLyBwYXJzZSBhIHN0cmluZyBhcyBhbiBpbnRlZ2VyOyBpZiB0aGUgaW5wdXQgaXMgdW5kZWZpbmVkLCBvciBjYW5ub3QgYmUgcGFyc2VkXG4vLyBhcyBhbiBpbnRlZ2VyLCByZXR1cm4gYSBkZWZhdWx0LlxuZnVuY3Rpb24gcGFyc2VJbnRXaXRoRGVmYXVsdCh2YWwsIGRlZikge1xuICAgIGNvbnN0IHJlcyA9IHBhcnNlSW50KHZhbCk7XG4gICAgcmV0dXJuIGlzTmFOKHJlcykgPyBkZWYgOiByZXM7XG59XG5cbmludGVyZmFjZSBJQmFubmVkVXNlclByb3BzIHtcbiAgICBjYW5VbmJhbj86IGJvb2xlYW47XG4gICAgbWVtYmVyOiBSb29tTWVtYmVyO1xuICAgIGJ5OiBzdHJpbmc7XG4gICAgcmVhc29uPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQmFubmVkVXNlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJQmFubmVkVXNlclByb3BzPiB7XG4gICAgcHJpdmF0ZSBvblVuYmFuQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudW5iYW4odGhpcy5wcm9wcy5tZW1iZXIucm9vbUlkLCB0aGlzLnByb3BzLm1lbWJlci51c2VySWQpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byB1bmJhbjogXCIgKyBlcnIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvcicpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnRmFpbGVkIHRvIHVuYmFuJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHVuYmFuQnV0dG9uO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNhblVuYmFuKSB7XG4gICAgICAgICAgICB1bmJhbkJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9J214X1JvbGVzUm9vbVNldHRpbmdzVGFiX3VuYmFuQnRuJ1xuICAgICAgICAgICAgICAgICAgICBraW5kPSdkYW5nZXJfc20nXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25VbmJhbkNsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnVW5iYW4nKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMucHJvcHMubWVtYmVyLm5hbWUgPT09IHRoaXMucHJvcHMubWVtYmVyLnVzZXJJZCA/IG51bGwgOiB0aGlzLnByb3BzLm1lbWJlci51c2VySWQ7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgeyB1bmJhbkJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9e190KFwiQmFubmVkIGJ5ICUoZGlzcGxheU5hbWUpc1wiLCB7IGRpc3BsYXlOYW1lOiB0aGlzLnByb3BzLmJ5IH0pfT5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz57IHRoaXMucHJvcHMubWVtYmVyLm5hbWUgfTwvc3Ryb25nPiB7IHVzZXJJZCB9XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5yZWFzb24gPyBcIiBcIiArIF90KCdSZWFzb24nKSArIFwiOiBcIiArIHRoaXMucHJvcHMucmVhc29uIDogXCJcIiB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb2xlc1Jvb21TZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFJvb21TdGF0ZUV2ZW50LlVwZGF0ZSwgdGhpcy5vblJvb21TdGF0ZVVwZGF0ZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaWVudCkge1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21TdGF0ZUV2ZW50LlVwZGF0ZSwgdGhpcy5vblJvb21TdGF0ZVVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbVN0YXRlVXBkYXRlID0gKHN0YXRlOiBSb29tU3RhdGUpID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tSWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5vblRoaXNSb29tTWVtYmVyc2hpcCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVGhpc1Jvb21NZW1iZXJzaGlwID0gdGhyb3R0bGUoKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfSwgMjAwLCB7IGxlYWRpbmc6IHRydWUsIHRyYWlsaW5nOiB0cnVlIH0pO1xuXG4gICAgcHJpdmF0ZSBwb3B1bGF0ZURlZmF1bHRQbEV2ZW50cyhldmVudHNTZWN0aW9uOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+LCBzdGF0ZUxldmVsOiBudW1iZXIsIGV2ZW50c0xldmVsOiBudW1iZXIpIHtcbiAgICAgICAgZm9yIChjb25zdCBkZXNpcmVkRXZlbnQgb2YgT2JqZWN0LmtleXMocGxFdmVudHNUb1Nob3cpKSB7XG4gICAgICAgICAgICBpZiAoIShkZXNpcmVkRXZlbnQgaW4gZXZlbnRzU2VjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBldmVudHNTZWN0aW9uW2Rlc2lyZWRFdmVudF0gPSAocGxFdmVudHNUb1Nob3dbZGVzaXJlZEV2ZW50XS5pc1N0YXRlID8gc3RhdGVMZXZlbCA6IGV2ZW50c0xldmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Qb3dlckxldmVsc0NoYW5nZWQgPSAodmFsdWU6IG51bWJlciwgcG93ZXJMZXZlbEtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgY29uc3QgcGxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHMsICcnKTtcbiAgICAgICAgbGV0IHBsQ29udGVudCA9IHBsRXZlbnQgPyAocGxFdmVudC5nZXRDb250ZW50KCkgfHwge30pIDoge307XG5cbiAgICAgICAgLy8gQ2xvbmUgdGhlIHBvd2VyIGxldmVscyBqdXN0IGluIGNhc2VcbiAgICAgICAgcGxDb250ZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgcGxDb250ZW50KTtcblxuICAgICAgICBjb25zdCBldmVudHNMZXZlbFByZWZpeCA9IFwiZXZlbnRfbGV2ZWxzX1wiO1xuXG4gICAgICAgIGlmIChwb3dlckxldmVsS2V5LnN0YXJ0c1dpdGgoZXZlbnRzTGV2ZWxQcmVmaXgpKSB7XG4gICAgICAgICAgICAvLyBkZWVwIGNvcHkgXCJldmVudHNcIiBvYmplY3QsIE9iamVjdC5hc3NpZ24gaXRzZWxmIHdvbid0IGRlZXAgY29weVxuICAgICAgICAgICAgcGxDb250ZW50W1wiZXZlbnRzXCJdID0gT2JqZWN0LmFzc2lnbih7fSwgcGxDb250ZW50W1wiZXZlbnRzXCJdIHx8IHt9KTtcbiAgICAgICAgICAgIHBsQ29udGVudFtcImV2ZW50c1wiXVtwb3dlckxldmVsS2V5LnNsaWNlKGV2ZW50c0xldmVsUHJlZml4Lmxlbmd0aCldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBrZXlQYXRoID0gcG93ZXJMZXZlbEtleS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgbGV0IHBhcmVudE9iajtcbiAgICAgICAgICAgIGxldCBjdXJyZW50T2JqID0gcGxDb250ZW50O1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2Yga2V5UGF0aCkge1xuICAgICAgICAgICAgICAgIGlmICghY3VycmVudE9ialtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPYmpba2V5XSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXJlbnRPYmogPSBjdXJyZW50T2JqO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRPYmogPSBjdXJyZW50T2JqW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnRPYmpba2V5UGF0aFtrZXlQYXRoLmxlbmd0aCAtIDFdXSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xpZW50LnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMucm9vbUlkLCBFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzLCBwbENvbnRlbnQpLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIGNoYW5naW5nIHBvd2VyIGxldmVsIHJlcXVpcmVtZW50JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkFuIGVycm9yIG9jY3VycmVkIGNoYW5naW5nIHRoZSByb29tJ3MgcG93ZXIgbGV2ZWwgcmVxdWlyZW1lbnRzLiBFbnN1cmUgeW91IGhhdmUgc3VmZmljaWVudCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwicGVybWlzc2lvbnMgYW5kIHRyeSBhZ2Fpbi5cIixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlclBvd2VyTGV2ZWxDaGFuZ2VkID0gKHZhbHVlOiBudW1iZXIsIHBvd2VyTGV2ZWxLZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IHBsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzLCAnJyk7XG4gICAgICAgIGxldCBwbENvbnRlbnQgPSBwbEV2ZW50ID8gKHBsRXZlbnQuZ2V0Q29udGVudCgpIHx8IHt9KSA6IHt9O1xuXG4gICAgICAgIC8vIENsb25lIHRoZSBwb3dlciBsZXZlbHMganVzdCBpbiBjYXNlXG4gICAgICAgIHBsQ29udGVudCA9IE9iamVjdC5hc3NpZ24oe30sIHBsQ29udGVudCk7XG5cbiAgICAgICAgLy8gcG93ZXJMZXZlbEtleSBzaG91bGQgYmUgYSB1c2VyIElEXG4gICAgICAgIGlmICghcGxDb250ZW50Wyd1c2VycyddKSBwbENvbnRlbnRbJ3VzZXJzJ10gPSB7fTtcbiAgICAgICAgcGxDb250ZW50Wyd1c2VycyddW3Bvd2VyTGV2ZWxLZXldID0gdmFsdWU7XG5cbiAgICAgICAgY2xpZW50LnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMucm9vbUlkLCBFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzLCBwbENvbnRlbnQpLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIGNoYW5naW5nIHBvd2VyIGxldmVsJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkFuIGVycm9yIG9jY3VycmVkIGNoYW5naW5nIHRoZSB1c2VyJ3MgcG93ZXIgbGV2ZWwuIEVuc3VyZSB5b3UgaGF2ZSBzdWZmaWNpZW50IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJwZXJtaXNzaW9ucyBhbmQgdHJ5IGFnYWluLlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICBjb25zdCBpc1NwYWNlUm9vbSA9IHJvb20uaXNTcGFjZVJvb20oKTtcblxuICAgICAgICBjb25zdCBwbEV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21Qb3dlckxldmVscywgJycpO1xuICAgICAgICBjb25zdCBwbENvbnRlbnQgPSBwbEV2ZW50ID8gKHBsRXZlbnQuZ2V0Q29udGVudCgpIHx8IHt9KSA6IHt9O1xuICAgICAgICBjb25zdCBjYW5DaGFuZ2VMZXZlbHMgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzLCBjbGllbnQpO1xuXG4gICAgICAgIGNvbnN0IHBsRXZlbnRzVG9MYWJlbHMgPSB7XG4gICAgICAgICAgICAvLyBUaGVzZSB3aWxsIGJlIHRyYW5zbGF0ZWQgZm9yIHVzIGxhdGVyLlxuICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tQXZhdGFyXTogaXNTcGFjZVJvb20gPyBfdGQoXCJDaGFuZ2Ugc3BhY2UgYXZhdGFyXCIpIDogX3RkKFwiQ2hhbmdlIHJvb20gYXZhdGFyXCIpLFxuICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tTmFtZV06IGlzU3BhY2VSb29tID8gX3RkKFwiQ2hhbmdlIHNwYWNlIG5hbWVcIikgOiBfdGQoXCJDaGFuZ2Ugcm9vbSBuYW1lXCIpLFxuICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tQ2Fub25pY2FsQWxpYXNdOiBpc1NwYWNlUm9vbVxuICAgICAgICAgICAgICAgID8gX3RkKFwiQ2hhbmdlIG1haW4gYWRkcmVzcyBmb3IgdGhlIHNwYWNlXCIpXG4gICAgICAgICAgICAgICAgOiBfdGQoXCJDaGFuZ2UgbWFpbiBhZGRyZXNzIGZvciB0aGUgcm9vbVwiKSxcbiAgICAgICAgICAgIFtFdmVudFR5cGUuU3BhY2VDaGlsZF06IF90ZChcIk1hbmFnZSByb29tcyBpbiB0aGlzIHNwYWNlXCIpLFxuICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tSGlzdG9yeVZpc2liaWxpdHldOiBfdGQoXCJDaGFuZ2UgaGlzdG9yeSB2aXNpYmlsaXR5XCIpLFxuICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHNdOiBfdGQoXCJDaGFuZ2UgcGVybWlzc2lvbnNcIiksXG4gICAgICAgICAgICBbRXZlbnRUeXBlLlJvb21Ub3BpY106IGlzU3BhY2VSb29tID8gX3RkKFwiQ2hhbmdlIGRlc2NyaXB0aW9uXCIpIDogX3RkKFwiQ2hhbmdlIHRvcGljXCIpLFxuICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tVG9tYnN0b25lXTogX3RkKFwiVXBncmFkZSB0aGUgcm9vbVwiKSxcbiAgICAgICAgICAgIFtFdmVudFR5cGUuUm9vbUVuY3J5cHRpb25dOiBfdGQoXCJFbmFibGUgcm9vbSBlbmNyeXB0aW9uXCIpLFxuICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tU2VydmVyQWNsXTogX3RkKFwiQ2hhbmdlIHNlcnZlciBBQ0xzXCIpLFxuICAgICAgICAgICAgW0V2ZW50VHlwZS5SZWFjdGlvbl06IF90ZChcIlNlbmQgcmVhY3Rpb25zXCIpLFxuICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tUmVkYWN0aW9uXTogX3RkKFwiUmVtb3ZlIG1lc3NhZ2VzIHNlbnQgYnkgbWVcIiksXG5cbiAgICAgICAgICAgIC8vIFRPRE86IEVuYWJsZSBzdXBwb3J0IGZvciBtLndpZGdldCBldmVudCB0eXBlIChodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMzExMSlcbiAgICAgICAgICAgIFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiOiBpc1NwYWNlUm9vbSA/IG51bGwgOiBfdGQoXCJNb2RpZnkgd2lkZ2V0c1wiKSxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfcGlubmluZ1wiKSkge1xuICAgICAgICAgICAgcGxFdmVudHNUb0xhYmVsc1tFdmVudFR5cGUuUm9vbVBpbm5lZEV2ZW50c10gPSBfdGQoXCJNYW5hZ2UgcGlubmVkIGV2ZW50c1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxEZXNjcmlwdG9yczogUmVjb3JkPHN0cmluZywgSVBvd2VyTGV2ZWxEZXNjcmlwdG9yPiA9IHtcbiAgICAgICAgICAgIFwidXNlcnNfZGVmYXVsdFwiOiB7XG4gICAgICAgICAgICAgICAgZGVzYzogX3QoJ0RlZmF1bHQgcm9sZScpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImV2ZW50c19kZWZhdWx0XCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnU2VuZCBtZXNzYWdlcycpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgICAgICAgICAgICBoaWRlRm9yU3BhY2U6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJpbnZpdGVcIjoge1xuICAgICAgICAgICAgICAgIGRlc2M6IF90KCdJbnZpdGUgdXNlcnMnKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzdGF0ZV9kZWZhdWx0XCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnQ2hhbmdlIHNldHRpbmdzJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiA1MCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImtpY2tcIjoge1xuICAgICAgICAgICAgICAgIGRlc2M6IF90KCdSZW1vdmUgdXNlcnMnKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDUwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiYmFuXCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnQmFuIHVzZXJzJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiA1MCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInJlZGFjdFwiOiB7XG4gICAgICAgICAgICAgICAgZGVzYzogX3QoJ1JlbW92ZSBtZXNzYWdlcyBzZW50IGJ5IG90aGVycycpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogNTAsXG4gICAgICAgICAgICAgICAgaGlkZUZvclNwYWNlOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibm90aWZpY2F0aW9ucy5yb29tXCI6IHtcbiAgICAgICAgICAgICAgICBkZXNjOiBfdCgnTm90aWZ5IGV2ZXJ5b25lJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiA1MCxcbiAgICAgICAgICAgICAgICBoaWRlRm9yU3BhY2U6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGV2ZW50c0xldmVscyA9IHBsQ29udGVudC5ldmVudHMgfHwge307XG4gICAgICAgIGNvbnN0IHVzZXJMZXZlbHMgPSBwbENvbnRlbnQudXNlcnMgfHwge307XG4gICAgICAgIGNvbnN0IGJhbkxldmVsID0gcGFyc2VJbnRXaXRoRGVmYXVsdChwbENvbnRlbnQuYmFuLCBwb3dlckxldmVsRGVzY3JpcHRvcnMuYmFuLmRlZmF1bHRWYWx1ZSk7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRVc2VyTGV2ZWwgPSBwYXJzZUludFdpdGhEZWZhdWx0KFxuICAgICAgICAgICAgcGxDb250ZW50LnVzZXJzX2RlZmF1bHQsXG4gICAgICAgICAgICBwb3dlckxldmVsRGVzY3JpcHRvcnMudXNlcnNfZGVmYXVsdC5kZWZhdWx0VmFsdWUsXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRVc2VyTGV2ZWwgPSB1c2VyTGV2ZWxzW2NsaWVudC5nZXRVc2VySWQoKV07XG4gICAgICAgIGlmIChjdXJyZW50VXNlckxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGN1cnJlbnRVc2VyTGV2ZWwgPSBkZWZhdWx0VXNlckxldmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wb3B1bGF0ZURlZmF1bHRQbEV2ZW50cyhcbiAgICAgICAgICAgIGV2ZW50c0xldmVscyxcbiAgICAgICAgICAgIHBhcnNlSW50V2l0aERlZmF1bHQocGxDb250ZW50LnN0YXRlX2RlZmF1bHQsIHBvd2VyTGV2ZWxEZXNjcmlwdG9ycy5zdGF0ZV9kZWZhdWx0LmRlZmF1bHRWYWx1ZSksXG4gICAgICAgICAgICBwYXJzZUludFdpdGhEZWZhdWx0KHBsQ29udGVudC5ldmVudHNfZGVmYXVsdCwgcG93ZXJMZXZlbERlc2NyaXB0b3JzLmV2ZW50c19kZWZhdWx0LmRlZmF1bHRWYWx1ZSksXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IHByaXZpbGVnZWRVc2Vyc1NlY3Rpb24gPSA8ZGl2PnsgX3QoJ05vIHVzZXJzIGhhdmUgc3BlY2lmaWMgcHJpdmlsZWdlcyBpbiB0aGlzIHJvb20nKSB9PC9kaXY+O1xuICAgICAgICBsZXQgbXV0ZWRVc2Vyc1NlY3Rpb247XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh1c2VyTGV2ZWxzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IHByaXZpbGVnZWRVc2VycyA9IFtdO1xuICAgICAgICAgICAgY29uc3QgbXV0ZWRVc2VycyA9IFtdO1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyh1c2VyTGV2ZWxzKS5mb3JFYWNoKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHVzZXJMZXZlbHNbdXNlcl0pKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbkNoYW5nZSA9IHVzZXJMZXZlbHNbdXNlcl0gPCBjdXJyZW50VXNlckxldmVsICYmIGNhbkNoYW5nZUxldmVscztcbiAgICAgICAgICAgICAgICBpZiAodXNlckxldmVsc1t1c2VyXSA+IGRlZmF1bHRVc2VyTGV2ZWwpIHsgLy8gcHJpdmlsZWdlZFxuICAgICAgICAgICAgICAgICAgICBwcml2aWxlZ2VkVXNlcnMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxQb3dlclNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3VzZXJMZXZlbHNbdXNlcl19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e3VzZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt1c2VyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWxLZXk9e3VzZXJ9IC8vIFdpbGwgYmUgc2VudCBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBgb25DaGFuZ2VgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Vc2VyUG93ZXJMZXZlbENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVzZXJMZXZlbHNbdXNlcl0gPCBkZWZhdWx0VXNlckxldmVsKSB7IC8vIG11dGVkXG4gICAgICAgICAgICAgICAgICAgIG11dGVkVXNlcnMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxQb3dlclNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3VzZXJMZXZlbHNbdXNlcl19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e3VzZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt1c2VyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWxLZXk9e3VzZXJ9IC8vIFdpbGwgYmUgc2VudCBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBgb25DaGFuZ2VgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Vc2VyUG93ZXJMZXZlbENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gY29tcGFyYXRvciBmb3Igc29ydGluZyBQTCB1c2VycyBsZXhpY29ncmFwaGljYWxseSBvbiBQTCBkZXNjZW5kaW5nLCBNWElEIGFzY2VuZGluZy4gKGNhc2UtaW5zZW5zaXRpdmUpXG4gICAgICAgICAgICBjb25zdCBjb21wYXJhdG9yID0gKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwbERpZmYgPSB1c2VyTGV2ZWxzW2Iua2V5XSAtIHVzZXJMZXZlbHNbYS5rZXldO1xuICAgICAgICAgICAgICAgIHJldHVybiBwbERpZmYgIT09IDAgPyBwbERpZmYgOiBjb21wYXJlKGEua2V5LnRvTG9jYWxlTG93ZXJDYXNlKCksIGIua2V5LnRvTG9jYWxlTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcHJpdmlsZWdlZFVzZXJzLnNvcnQoY29tcGFyYXRvcik7XG4gICAgICAgICAgICBtdXRlZFVzZXJzLnNvcnQoY29tcGFyYXRvcik7XG5cbiAgICAgICAgICAgIGlmIChwcml2aWxlZ2VkVXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcHJpdmlsZWdlZFVzZXJzU2VjdGlvbiA9XG4gICAgICAgICAgICAgICAgPFNldHRpbmdzRmllbGRzZXQgbGVnZW5kPXtfdCgnUHJpdmlsZWdlZCBVc2VycycpfT5cbiAgICAgICAgICAgICAgICAgICAgeyBwcml2aWxlZ2VkVXNlcnMgfVxuICAgICAgICAgICAgICAgIDwvU2V0dGluZ3NGaWVsZHNldD47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobXV0ZWRVc2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBtdXRlZFVzZXJzU2VjdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZpZWxkc2V0IGxlZ2VuZD17X3QoJ011dGVkIFVzZXJzJyl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtdXRlZFVzZXJzIH1cbiAgICAgICAgICAgICAgICAgICAgPC9TZXR0aW5nc0ZpZWxkc2V0PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJhbm5lZCA9IHJvb20uZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwKFwiYmFuXCIpO1xuICAgICAgICBsZXQgYmFubmVkVXNlcnNTZWN0aW9uO1xuICAgICAgICBpZiAoYmFubmVkLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgY2FuQmFuVXNlcnMgPSBjdXJyZW50VXNlckxldmVsID49IGJhbkxldmVsO1xuICAgICAgICAgICAgYmFubmVkVXNlcnNTZWN0aW9uID1cbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGaWVsZHNldCBsZWdlbmQ9e190KCdCYW5uZWQgdXNlcnMnKX0+XG4gICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYmFubmVkLm1hcCgobWVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFuRXZlbnQgPSBtZW1iZXIuZXZlbnRzLm1lbWJlci5nZXRDb250ZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VuZGVyID0gcm9vbS5nZXRNZW1iZXIobWVtYmVyLmV2ZW50cy5tZW1iZXIuZ2V0U2VuZGVyKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiYW5uZWRCeSA9IG1lbWJlci5ldmVudHMubWVtYmVyLmdldFNlbmRlcigpOyAvLyBzdGFydCBieSBmYWxsaW5nIGJhY2sgdG8gbXhpZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZW5kZXIpIGJhbm5lZEJ5ID0gc2VuZGVyLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJhbm5lZFVzZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17bWVtYmVyLnVzZXJJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhblVuYmFuPXtjYW5CYW5Vc2Vyc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uPXtiYW5FdmVudC5yZWFzb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieT17YmFubmVkQnl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L1NldHRpbmdzRmllbGRzZXQ+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcG93ZXJTZWxlY3RvcnMgPSBPYmplY3Qua2V5cyhwb3dlckxldmVsRGVzY3JpcHRvcnMpLm1hcCgoa2V5LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IHBvd2VyTGV2ZWxEZXNjcmlwdG9yc1trZXldO1xuICAgICAgICAgICAgaWYgKGlzU3BhY2VSb29tICYmIGRlc2NyaXB0b3IuaGlkZUZvclNwYWNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGtleVBhdGggPSBrZXkuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50T2JqID0gcGxDb250ZW50O1xuICAgICAgICAgICAgZm9yIChjb25zdCBwcm9wIG9mIGtleVBhdGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudE9iaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50T2JqID0gY3VycmVudE9ialtwcm9wXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUludFdpdGhEZWZhdWx0KGN1cnJlbnRPYmosIGRlc2NyaXB0b3IuZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGtleT17aW5kZXh9IGNsYXNzTmFtZT1cIlwiPlxuICAgICAgICAgICAgICAgIDxQb3dlclNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtkZXNjcmlwdG9yLmRlc2N9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgdXNlcnNEZWZhdWx0PXtkZWZhdWx0VXNlckxldmVsfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhbkNoYW5nZUxldmVscyB8fCBjdXJyZW50VXNlckxldmVsIDwgdmFsdWV9XG4gICAgICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWxLZXk9e2tleX0gLy8gV2lsbCBiZSBzZW50IGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIGBvbkNoYW5nZWBcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Qb3dlckxldmVsc0NoYW5nZWR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgICAgIC8vIGhpZGUgdGhlIHBvd2VyIGxldmVsIHNlbGVjdG9yIGZvciBlbmFibGluZyBFMkVFIGlmIGl0IHRoZSByb29tIGlzIGFscmVhZHkgZW5jcnlwdGVkXG4gICAgICAgIGlmIChjbGllbnQuaXNSb29tRW5jcnlwdGVkKHRoaXMucHJvcHMucm9vbUlkKSkge1xuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c0xldmVsc1tFdmVudFR5cGUuUm9vbUVuY3J5cHRpb25dO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXZlbnRQb3dlclNlbGVjdG9ycyA9IE9iamVjdC5rZXlzKGV2ZW50c0xldmVscykubWFwKChldmVudFR5cGUsIGkpID0+IHtcbiAgICAgICAgICAgIGlmIChpc1NwYWNlUm9vbSAmJiBwbEV2ZW50c1RvU2hvd1tldmVudFR5cGVdPy5oaWRlRm9yU3BhY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzU3BhY2VSb29tICYmIHBsRXZlbnRzVG9TaG93W2V2ZW50VHlwZV0/LmhpZGVGb3JSb29tKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBsYWJlbCA9IHBsRXZlbnRzVG9MYWJlbHNbZXZlbnRUeXBlXTtcbiAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gX3QobGFiZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IF90KFwiU2VuZCAlKGV2ZW50VHlwZSlzIGV2ZW50c1wiLCB7IGV2ZW50VHlwZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJcIiBrZXk9e2V2ZW50VHlwZX0+XG4gICAgICAgICAgICAgICAgICAgIDxQb3dlclNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17bGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17ZXZlbnRzTGV2ZWxzW2V2ZW50VHlwZV19XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2Vyc0RlZmF1bHQ9e2RlZmF1bHRVc2VyTGV2ZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhbkNoYW5nZUxldmVscyB8fCBjdXJyZW50VXNlckxldmVsIDwgZXZlbnRzTGV2ZWxzW2V2ZW50VHlwZV19XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3dlckxldmVsS2V5PXtcImV2ZW50X2xldmVsc19cIiArIGV2ZW50VHlwZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUG93ZXJMZXZlbHNDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiIG14X1JvbGVzUm9vbVNldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+eyBfdChcIlJvbGVzICYgUGVybWlzc2lvbnNcIikgfTwvZGl2PlxuICAgICAgICAgICAgICAgIHsgcHJpdmlsZWdlZFVzZXJzU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgeyBtdXRlZFVzZXJzU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgeyBiYW5uZWRVc2Vyc1NlY3Rpb24gfVxuICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZpZWxkc2V0XG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZD17X3QoXCJQZXJtaXNzaW9uc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNTcGFjZVJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90KCdTZWxlY3QgdGhlIHJvbGVzIHJlcXVpcmVkIHRvIGNoYW5nZSB2YXJpb3VzIHBhcnRzIG9mIHRoZSBzcGFjZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdCgnU2VsZWN0IHRoZSByb2xlcyByZXF1aXJlZCB0byBjaGFuZ2UgdmFyaW91cyBwYXJ0cyBvZiB0aGUgcm9vbScpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgcG93ZXJTZWxlY3RvcnMgfVxuICAgICAgICAgICAgICAgICAgICB7IGV2ZW50UG93ZXJTZWxlY3RvcnMgfVxuICAgICAgICAgICAgICAgIDwvU2V0dGluZ3NGaWVsZHNldD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQStCQSxNQUFNQSxjQUE4QyxHQUFHO0VBQ25EO0VBQ0EsQ0FBQ0MsZ0JBQUEsQ0FBVUMsVUFBWCxHQUF3QjtJQUFFQyxPQUFPLEVBQUU7RUFBWCxDQUYyQjtFQUduRCxDQUFDRixnQkFBQSxDQUFVRyxRQUFYLEdBQXNCO0lBQUVELE9BQU8sRUFBRTtFQUFYLENBSDZCO0VBSW5ELENBQUNGLGdCQUFBLENBQVVJLGtCQUFY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