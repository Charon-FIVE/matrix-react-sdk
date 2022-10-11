"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _partials = require("matrix-js-sdk/src/@types/partials");

var _event = require("matrix-js-sdk/src/@types/event");

var _StyledRadioGroup = _interopRequireDefault(require("../elements/StyledRadioGroup"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ManageRestrictedJoinRuleDialog = _interopRequireDefault(require("../dialogs/ManageRestrictedJoinRuleDialog"));

var _RoomUpgradeWarningDialog = _interopRequireDefault(require("../dialogs/RoomUpgradeWarningDialog"));

var _RoomUpgrade = require("../../../utils/RoomUpgrade");

var _arrays = require("../../../utils/arrays");

var _useLocalEcho = require("../../../hooks/useLocalEcho");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RoomSettingsDialog = require("../dialogs/RoomSettingsDialog");

var _actions = require("../../../dispatcher/actions");

var _PreferredRoomVersions = require("../../../utils/PreferredRoomVersions");

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
const JoinRuleSettings = _ref => {
  let {
    room,
    promptUpgrade,
    aliasWarning,
    onError,
    beforeChange,
    closeSettingsFn
  } = _ref;
  const cli = room.client;
  const roomSupportsRestricted = (0, _PreferredRoomVersions.doesRoomVersionSupport)(room.getVersion(), _PreferredRoomVersions.PreferredRoomVersions.RestrictedRooms);
  const preferredRestrictionVersion = !roomSupportsRestricted && promptUpgrade ? _PreferredRoomVersions.PreferredRoomVersions.RestrictedRooms : undefined;
  const disabled = !room.currentState.mayClientSendStateEvent(_event.EventType.RoomJoinRules, cli);
  const [content, setContent] = (0, _useLocalEcho.useLocalEcho)(() => room.currentState.getStateEvents(_event.EventType.RoomJoinRules, "")?.getContent(), content => cli.sendStateEvent(room.roomId, _event.EventType.RoomJoinRules, content, ""), onError);
  const {
    join_rule: joinRule = _partials.JoinRule.Invite
  } = content || {};
  const restrictedAllowRoomIds = joinRule === _partials.JoinRule.Restricted ? content.allow?.filter(o => o.type === _partials.RestrictedAllowType.RoomMembership).map(o => o.room_id) : undefined;

  const editRestrictedRoomIds = async () => {
    let selected = restrictedAllowRoomIds;

    if (!selected?.length && _SpaceStore.default.instance.activeSpaceRoom) {
      selected = [_SpaceStore.default.instance.activeSpaceRoom.roomId];
    }

    const matrixClient = _MatrixClientPeg.MatrixClientPeg.get();

    const {
      finished
    } = _Modal.default.createDialog(_ManageRestrictedJoinRuleDialog.default, {
      matrixClient,
      room,
      selected
    }, "mx_ManageRestrictedJoinRuleDialog_wrapper");

    const [roomIds] = await finished;
    return roomIds;
  };

  const definitions = [{
    value: _partials.JoinRule.Invite,
    label: (0, _languageHandler._t)("Private (invite only)"),
    description: (0, _languageHandler._t)("Only invited people can join."),
    checked: joinRule === _partials.JoinRule.Invite || joinRule === _partials.JoinRule.Restricted && !restrictedAllowRoomIds?.length
  }, {
    value: _partials.JoinRule.Public,
    label: (0, _languageHandler._t)("Public"),
    description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("Anyone can find and join."), aliasWarning)
  }];

  if (roomSupportsRestricted || preferredRestrictionVersion || joinRule === _partials.JoinRule.Restricted) {
    let upgradeRequiredPill;

    if (preferredRestrictionVersion) {
      upgradeRequiredPill = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_JoinRuleSettings_upgradeRequired"
      }, (0, _languageHandler._t)("Upgrade required"));
    }

    let description;

    if (joinRule === _partials.JoinRule.Restricted && restrictedAllowRoomIds?.length) {
      // only show the first 4 spaces we know about, so that the UI doesn't grow out of proportion there are lots.
      const shownSpaces = restrictedAllowRoomIds.map(roomId => cli.getRoom(roomId)).filter(room => room?.isSpaceRoom()).slice(0, 4);
      let moreText;

      if (shownSpaces.length < restrictedAllowRoomIds.length) {
        if (shownSpaces.length > 0) {
          moreText = (0, _languageHandler._t)("& %(count)s more", {
            count: restrictedAllowRoomIds.length - shownSpaces.length
          });
        } else {
          moreText = (0, _languageHandler._t)("Currently, %(count)s spaces have access", {
            count: restrictedAllowRoomIds.length
          });
        }
      }

      const onRestrictedRoomIdsChange = newAllowRoomIds => {
        if (!(0, _arrays.arrayHasDiff)(restrictedAllowRoomIds || [], newAllowRoomIds)) return;

        if (!newAllowRoomIds.length) {
          setContent({
            join_rule: _partials.JoinRule.Invite
          });
          return;
        }

        setContent({
          join_rule: _partials.JoinRule.Restricted,
          allow: newAllowRoomIds.map(roomId => ({
            "type": _partials.RestrictedAllowType.RoomMembership,
            "room_id": roomId
          }))
        });
      };

      const onEditRestrictedClick = async () => {
        const restrictedAllowRoomIds = await editRestrictedRoomIds();
        if (!Array.isArray(restrictedAllowRoomIds)) return;

        if (restrictedAllowRoomIds.length > 0) {
          onRestrictedRoomIdsChange(restrictedAllowRoomIds);
        } else {
          onChange(_partials.JoinRule.Invite);
        }
      };

      description = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Anyone in a space can find and join. <a>Edit which spaces can access here.</a>", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          disabled: disabled,
          onClick: onEditRestrictedClick,
          kind: "link_inline"
        }, sub)
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_JoinRuleSettings_spacesWithAccess"
      }, /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("Spaces with access")), shownSpaces.map(room => {
        return /*#__PURE__*/_react.default.createElement("span", {
          key: room.roomId
        }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
          room: room,
          height: 32,
          width: 32
        }), room.name);
      }), moreText && /*#__PURE__*/_react.default.createElement("span", null, moreText)));
    } else if (_SpaceStore.default.instance.activeSpaceRoom) {
      description = (0, _languageHandler._t)("Anyone in <spaceName/> can find and join. You can select other spaces too.", {}, {
        spaceName: () => /*#__PURE__*/_react.default.createElement("b", null, _SpaceStore.default.instance.activeSpaceRoom.name)
      });
    } else {
      description = (0, _languageHandler._t)("Anyone in a space can find and join. You can select multiple spaces.");
    }

    definitions.splice(1, 0, {
      value: _partials.JoinRule.Restricted,
      label: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("Space members"), upgradeRequiredPill),
      description,
      // if there are 0 allowed spaces then render it as invite only instead
      checked: joinRule === _partials.JoinRule.Restricted && !!restrictedAllowRoomIds?.length
    });
  }

  const onChange = async joinRule => {
    const beforeJoinRule = content.join_rule;
    let restrictedAllowRoomIds;

    if (joinRule === _partials.JoinRule.Restricted) {
      if (beforeJoinRule === _partials.JoinRule.Restricted || roomSupportsRestricted) {
        // Have the user pick which spaces to allow joins from
        restrictedAllowRoomIds = await editRestrictedRoomIds();
        if (!Array.isArray(restrictedAllowRoomIds)) return;
      } else if (preferredRestrictionVersion) {
        // Block this action on a room upgrade otherwise it'd make their room unjoinable
        const targetVersion = preferredRestrictionVersion;
        let warning;
        const userId = cli.getUserId();
        const unableToUpdateSomeParents = Array.from(_SpaceStore.default.instance.getKnownParents(room.roomId)).some(roomId => !cli.getRoom(roomId)?.currentState.maySendStateEvent(_event.EventType.SpaceChild, userId));

        if (unableToUpdateSomeParents) {
          warning = /*#__PURE__*/_react.default.createElement("b", null, (0, _languageHandler._t)("This room is in some spaces you're not an admin of. " + "In those spaces, the old room will still be shown, " + "but people will be prompted to join the new one."));
        }

        _Modal.default.createDialog(_RoomUpgradeWarningDialog.default, {
          roomId: room.roomId,
          targetVersion,
          description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("This upgrade will allow members of selected spaces " + "access to this room without an invite."), warning),
          doUpgrade: async (opts, fn) => {
            const roomId = await (0, _RoomUpgrade.upgradeRoom)(room, targetVersion, opts.invite, true, true, true, progress => {
              const total = 2 + progress.updateSpacesTotal + progress.inviteUsersTotal;

              if (!progress.roomUpgraded) {
                fn((0, _languageHandler._t)("Upgrading room"), 0, total);
              } else if (!progress.roomSynced) {
                fn((0, _languageHandler._t)("Loading new room"), 1, total);
              } else if (progress.inviteUsersProgress < progress.inviteUsersTotal) {
                fn((0, _languageHandler._t)("Sending invites... (%(progress)s out of %(count)s)", {
                  progress: progress.inviteUsersProgress,
                  count: progress.inviteUsersTotal
                }), 2 + progress.inviteUsersProgress, total);
              } else if (progress.updateSpacesProgress < progress.updateSpacesTotal) {
                fn((0, _languageHandler._t)("Updating spaces... (%(progress)s out of %(count)s)", {
                  progress: progress.updateSpacesProgress,
                  count: progress.updateSpacesTotal
                }), 2 + progress.inviteUsersProgress + progress.updateSpacesProgress, total);
              }
            });
            closeSettingsFn(); // switch to the new room in the background

            _dispatcher.default.dispatch({
              action: _actions.Action.ViewRoom,
              room_id: roomId,
              metricsTrigger: undefined // other

            }); // open new settings on this tab


            _dispatcher.default.dispatch({
              action: "open_room_settings",
              initial_tab_id: _RoomSettingsDialog.ROOM_SECURITY_TAB
            });
          }
        });

        return;
      } // when setting to 0 allowed rooms/spaces set to invite only instead as per the note


      if (!restrictedAllowRoomIds.length) {
        joinRule = _partials.JoinRule.Invite;
      }
    }

    if (beforeJoinRule === joinRule && !restrictedAllowRoomIds) return;
    if (beforeChange && !(await beforeChange(joinRule))) return;
    const newContent = {
      join_rule: joinRule
    }; // pre-set the accepted spaces with the currently viewed one as per the microcopy

    if (joinRule === _partials.JoinRule.Restricted) {
      newContent.allow = restrictedAllowRoomIds.map(roomId => ({
        "type": _partials.RestrictedAllowType.RoomMembership,
        "room_id": roomId
      }));
    }

    setContent(newContent);
  };

  return /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
    name: "joinRule",
    value: joinRule,
    onChange: onChange,
    definitions: definitions,
    disabled: disabled,
    className: "mx_JoinRuleSettings_radioButton"
  });
};

var _default = JoinRuleSettings;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJKb2luUnVsZVNldHRpbmdzIiwicm9vbSIsInByb21wdFVwZ3JhZGUiLCJhbGlhc1dhcm5pbmciLCJvbkVycm9yIiwiYmVmb3JlQ2hhbmdlIiwiY2xvc2VTZXR0aW5nc0ZuIiwiY2xpIiwiY2xpZW50Iiwicm9vbVN1cHBvcnRzUmVzdHJpY3RlZCIsImRvZXNSb29tVmVyc2lvblN1cHBvcnQiLCJnZXRWZXJzaW9uIiwiUHJlZmVycmVkUm9vbVZlcnNpb25zIiwiUmVzdHJpY3RlZFJvb21zIiwicHJlZmVycmVkUmVzdHJpY3Rpb25WZXJzaW9uIiwidW5kZWZpbmVkIiwiZGlzYWJsZWQiLCJjdXJyZW50U3RhdGUiLCJtYXlDbGllbnRTZW5kU3RhdGVFdmVudCIsIkV2ZW50VHlwZSIsIlJvb21Kb2luUnVsZXMiLCJjb250ZW50Iiwic2V0Q29udGVudCIsInVzZUxvY2FsRWNobyIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q29udGVudCIsInNlbmRTdGF0ZUV2ZW50Iiwicm9vbUlkIiwiam9pbl9ydWxlIiwiam9pblJ1bGUiLCJKb2luUnVsZSIsIkludml0ZSIsInJlc3RyaWN0ZWRBbGxvd1Jvb21JZHMiLCJSZXN0cmljdGVkIiwiYWxsb3ciLCJmaWx0ZXIiLCJvIiwidHlwZSIsIlJlc3RyaWN0ZWRBbGxvd1R5cGUiLCJSb29tTWVtYmVyc2hpcCIsIm1hcCIsInJvb21faWQiLCJlZGl0UmVzdHJpY3RlZFJvb21JZHMiLCJzZWxlY3RlZCIsImxlbmd0aCIsIlNwYWNlU3RvcmUiLCJpbnN0YW5jZSIsImFjdGl2ZVNwYWNlUm9vbSIsIm1hdHJpeENsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImZpbmlzaGVkIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJNYW5hZ2VSZXN0cmljdGVkSm9pblJ1bGVEaWFsb2ciLCJyb29tSWRzIiwiZGVmaW5pdGlvbnMiLCJ2YWx1ZSIsImxhYmVsIiwiX3QiLCJkZXNjcmlwdGlvbiIsImNoZWNrZWQiLCJQdWJsaWMiLCJ1cGdyYWRlUmVxdWlyZWRQaWxsIiwic2hvd25TcGFjZXMiLCJnZXRSb29tIiwiaXNTcGFjZVJvb20iLCJzbGljZSIsIm1vcmVUZXh0IiwiY291bnQiLCJvblJlc3RyaWN0ZWRSb29tSWRzQ2hhbmdlIiwibmV3QWxsb3dSb29tSWRzIiwiYXJyYXlIYXNEaWZmIiwib25FZGl0UmVzdHJpY3RlZENsaWNrIiwiQXJyYXkiLCJpc0FycmF5Iiwib25DaGFuZ2UiLCJhIiwic3ViIiwibmFtZSIsInNwYWNlTmFtZSIsInNwbGljZSIsImJlZm9yZUpvaW5SdWxlIiwidGFyZ2V0VmVyc2lvbiIsIndhcm5pbmciLCJ1c2VySWQiLCJnZXRVc2VySWQiLCJ1bmFibGVUb1VwZGF0ZVNvbWVQYXJlbnRzIiwiZnJvbSIsImdldEtub3duUGFyZW50cyIsInNvbWUiLCJtYXlTZW5kU3RhdGVFdmVudCIsIlNwYWNlQ2hpbGQiLCJSb29tVXBncmFkZVdhcm5pbmdEaWFsb2ciLCJkb1VwZ3JhZGUiLCJvcHRzIiwiZm4iLCJ1cGdyYWRlUm9vbSIsImludml0ZSIsInByb2dyZXNzIiwidG90YWwiLCJ1cGRhdGVTcGFjZXNUb3RhbCIsImludml0ZVVzZXJzVG90YWwiLCJyb29tVXBncmFkZWQiLCJyb29tU3luY2VkIiwiaW52aXRlVXNlcnNQcm9ncmVzcyIsInVwZGF0ZVNwYWNlc1Byb2dyZXNzIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3Um9vbSIsIm1ldHJpY3NUcmlnZ2VyIiwiaW5pdGlhbF90YWJfaWQiLCJST09NX1NFQ1VSSVRZX1RBQiIsIm5ld0NvbnRlbnQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy9Kb2luUnVsZVNldHRpbmdzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJSm9pblJ1bGVFdmVudENvbnRlbnQsIEpvaW5SdWxlLCBSZXN0cmljdGVkQWxsb3dUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFsc1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuXG5pbXBvcnQgU3R5bGVkUmFkaW9Hcm91cCwgeyBJRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9lbGVtZW50cy9TdHlsZWRSYWRpb0dyb3VwXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9Sb29tQXZhdGFyXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3NwYWNlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgTWFuYWdlUmVzdHJpY3RlZEpvaW5SdWxlRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL01hbmFnZVJlc3RyaWN0ZWRKb2luUnVsZURpYWxvZ1wiO1xuaW1wb3J0IFJvb21VcGdyYWRlV2FybmluZ0RpYWxvZywgeyBJRmluaXNoZWRPcHRzIH0gZnJvbSBcIi4uL2RpYWxvZ3MvUm9vbVVwZ3JhZGVXYXJuaW5nRGlhbG9nXCI7XG5pbXBvcnQgeyB1cGdyYWRlUm9vbSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9Sb29tVXBncmFkZVwiO1xuaW1wb3J0IHsgYXJyYXlIYXNEaWZmIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2FycmF5c1wiO1xuaW1wb3J0IHsgdXNlTG9jYWxFY2hvIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUxvY2FsRWNob1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBST09NX1NFQ1VSSVRZX1RBQiB9IGZyb20gXCIuLi9kaWFsb2dzL1Jvb21TZXR0aW5nc0RpYWxvZ1wiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyBkb2VzUm9vbVZlcnNpb25TdXBwb3J0LCBQcmVmZXJyZWRSb29tVmVyc2lvbnMgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvUHJlZmVycmVkUm9vbVZlcnNpb25zXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgcHJvbXB0VXBncmFkZT86IGJvb2xlYW47XG4gICAgY2xvc2VTZXR0aW5nc0ZuKCk6IHZvaWQ7XG4gICAgb25FcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkO1xuICAgIGJlZm9yZUNoYW5nZT8oam9pblJ1bGU6IEpvaW5SdWxlKTogUHJvbWlzZTxib29sZWFuPjsgLy8gaWYgcmV0dXJucyBmYWxzZSB0aGVuIGFib3J0cyB0aGUgY2hhbmdlXG4gICAgYWxpYXNXYXJuaW5nPzogUmVhY3ROb2RlO1xufVxuXG5jb25zdCBKb2luUnVsZVNldHRpbmdzID0gKHsgcm9vbSwgcHJvbXB0VXBncmFkZSwgYWxpYXNXYXJuaW5nLCBvbkVycm9yLCBiZWZvcmVDaGFuZ2UsIGNsb3NlU2V0dGluZ3NGbiB9OiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBjbGkgPSByb29tLmNsaWVudDtcblxuICAgIGNvbnN0IHJvb21TdXBwb3J0c1Jlc3RyaWN0ZWQgPSBkb2VzUm9vbVZlcnNpb25TdXBwb3J0KHJvb20uZ2V0VmVyc2lvbigpLCBQcmVmZXJyZWRSb29tVmVyc2lvbnMuUmVzdHJpY3RlZFJvb21zKTtcbiAgICBjb25zdCBwcmVmZXJyZWRSZXN0cmljdGlvblZlcnNpb24gPSAhcm9vbVN1cHBvcnRzUmVzdHJpY3RlZCAmJiBwcm9tcHRVcGdyYWRlXG4gICAgICAgID8gUHJlZmVycmVkUm9vbVZlcnNpb25zLlJlc3RyaWN0ZWRSb29tc1xuICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IGRpc2FibGVkID0gIXJvb20uY3VycmVudFN0YXRlLm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5Sb29tSm9pblJ1bGVzLCBjbGkpO1xuXG4gICAgY29uc3QgW2NvbnRlbnQsIHNldENvbnRlbnRdID0gdXNlTG9jYWxFY2hvPElKb2luUnVsZUV2ZW50Q29udGVudD4oXG4gICAgICAgICgpID0+IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tSm9pblJ1bGVzLCBcIlwiKT8uZ2V0Q29udGVudCgpLFxuICAgICAgICBjb250ZW50ID0+IGNsaS5zZW5kU3RhdGVFdmVudChyb29tLnJvb21JZCwgRXZlbnRUeXBlLlJvb21Kb2luUnVsZXMsIGNvbnRlbnQsIFwiXCIpLFxuICAgICAgICBvbkVycm9yLFxuICAgICk7XG5cbiAgICBjb25zdCB7IGpvaW5fcnVsZTogam9pblJ1bGUgPSBKb2luUnVsZS5JbnZpdGUgfSA9IGNvbnRlbnQgfHwge307XG4gICAgY29uc3QgcmVzdHJpY3RlZEFsbG93Um9vbUlkcyA9IGpvaW5SdWxlID09PSBKb2luUnVsZS5SZXN0cmljdGVkXG4gICAgICAgID8gY29udGVudC5hbGxvdz8uZmlsdGVyKG8gPT4gby50eXBlID09PSBSZXN0cmljdGVkQWxsb3dUeXBlLlJvb21NZW1iZXJzaGlwKS5tYXAobyA9PiBvLnJvb21faWQpXG4gICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgZWRpdFJlc3RyaWN0ZWRSb29tSWRzID0gYXN5bmMgKCk6IFByb21pc2U8c3RyaW5nW10gfCB1bmRlZmluZWQ+ID0+IHtcbiAgICAgICAgbGV0IHNlbGVjdGVkID0gcmVzdHJpY3RlZEFsbG93Um9vbUlkcztcbiAgICAgICAgaWYgKCFzZWxlY3RlZD8ubGVuZ3RoICYmIFNwYWNlU3RvcmUuaW5zdGFuY2UuYWN0aXZlU3BhY2VSb29tKSB7XG4gICAgICAgICAgICBzZWxlY3RlZCA9IFtTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlUm9vbS5yb29tSWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWF0cml4Q2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2coTWFuYWdlUmVzdHJpY3RlZEpvaW5SdWxlRGlhbG9nLCB7XG4gICAgICAgICAgICBtYXRyaXhDbGllbnQsXG4gICAgICAgICAgICByb29tLFxuICAgICAgICAgICAgc2VsZWN0ZWQsXG4gICAgICAgIH0sIFwibXhfTWFuYWdlUmVzdHJpY3RlZEpvaW5SdWxlRGlhbG9nX3dyYXBwZXJcIik7XG5cbiAgICAgICAgY29uc3QgW3Jvb21JZHNdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgIHJldHVybiByb29tSWRzO1xuICAgIH07XG5cbiAgICBjb25zdCBkZWZpbml0aW9uczogSURlZmluaXRpb248Sm9pblJ1bGU+W10gPSBbe1xuICAgICAgICB2YWx1ZTogSm9pblJ1bGUuSW52aXRlLFxuICAgICAgICBsYWJlbDogX3QoXCJQcml2YXRlIChpbnZpdGUgb25seSlcIiksXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIk9ubHkgaW52aXRlZCBwZW9wbGUgY2FuIGpvaW4uXCIpLFxuICAgICAgICBjaGVja2VkOiBqb2luUnVsZSA9PT0gSm9pblJ1bGUuSW52aXRlIHx8IChqb2luUnVsZSA9PT0gSm9pblJ1bGUuUmVzdHJpY3RlZCAmJiAhcmVzdHJpY3RlZEFsbG93Um9vbUlkcz8ubGVuZ3RoKSxcbiAgICB9LCB7XG4gICAgICAgIHZhbHVlOiBKb2luUnVsZS5QdWJsaWMsXG4gICAgICAgIGxhYmVsOiBfdChcIlB1YmxpY1wiKSxcbiAgICAgICAgZGVzY3JpcHRpb246IDw+XG4gICAgICAgICAgICB7IF90KFwiQW55b25lIGNhbiBmaW5kIGFuZCBqb2luLlwiKSB9XG4gICAgICAgICAgICB7IGFsaWFzV2FybmluZyB9XG4gICAgICAgIDwvPixcbiAgICB9XTtcblxuICAgIGlmIChyb29tU3VwcG9ydHNSZXN0cmljdGVkIHx8IHByZWZlcnJlZFJlc3RyaWN0aW9uVmVyc2lvbiB8fCBqb2luUnVsZSA9PT0gSm9pblJ1bGUuUmVzdHJpY3RlZCkge1xuICAgICAgICBsZXQgdXBncmFkZVJlcXVpcmVkUGlsbDtcbiAgICAgICAgaWYgKHByZWZlcnJlZFJlc3RyaWN0aW9uVmVyc2lvbikge1xuICAgICAgICAgICAgdXBncmFkZVJlcXVpcmVkUGlsbCA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0pvaW5SdWxlU2V0dGluZ3NfdXBncmFkZVJlcXVpcmVkXCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIlVwZ3JhZGUgcmVxdWlyZWRcIikgfVxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZXNjcmlwdGlvbjtcbiAgICAgICAgaWYgKGpvaW5SdWxlID09PSBKb2luUnVsZS5SZXN0cmljdGVkICYmIHJlc3RyaWN0ZWRBbGxvd1Jvb21JZHM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gb25seSBzaG93IHRoZSBmaXJzdCA0IHNwYWNlcyB3ZSBrbm93IGFib3V0LCBzbyB0aGF0IHRoZSBVSSBkb2Vzbid0IGdyb3cgb3V0IG9mIHByb3BvcnRpb24gdGhlcmUgYXJlIGxvdHMuXG4gICAgICAgICAgICBjb25zdCBzaG93blNwYWNlcyA9IHJlc3RyaWN0ZWRBbGxvd1Jvb21JZHNcbiAgICAgICAgICAgICAgICAubWFwKHJvb21JZCA9PiBjbGkuZ2V0Um9vbShyb29tSWQpKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIocm9vbSA9PiByb29tPy5pc1NwYWNlUm9vbSgpKVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLCA0KTtcblxuICAgICAgICAgICAgbGV0IG1vcmVUZXh0O1xuICAgICAgICAgICAgaWYgKHNob3duU3BhY2VzLmxlbmd0aCA8IHJlc3RyaWN0ZWRBbGxvd1Jvb21JZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3duU3BhY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbW9yZVRleHQgPSBfdChcIiYgJShjb3VudClzIG1vcmVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHJlc3RyaWN0ZWRBbGxvd1Jvb21JZHMubGVuZ3RoIC0gc2hvd25TcGFjZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtb3JlVGV4dCA9IF90KFwiQ3VycmVudGx5LCAlKGNvdW50KXMgc3BhY2VzIGhhdmUgYWNjZXNzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiByZXN0cmljdGVkQWxsb3dSb29tSWRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvblJlc3RyaWN0ZWRSb29tSWRzQ2hhbmdlID0gKG5ld0FsbG93Um9vbUlkczogc3RyaW5nW10pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWFycmF5SGFzRGlmZihyZXN0cmljdGVkQWxsb3dSb29tSWRzIHx8IFtdLCBuZXdBbGxvd1Jvb21JZHMpKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAoIW5ld0FsbG93Um9vbUlkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Q29udGVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBqb2luX3J1bGU6IEpvaW5SdWxlLkludml0ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXRDb250ZW50KHtcbiAgICAgICAgICAgICAgICAgICAgam9pbl9ydWxlOiBKb2luUnVsZS5SZXN0cmljdGVkLFxuICAgICAgICAgICAgICAgICAgICBhbGxvdzogbmV3QWxsb3dSb29tSWRzLm1hcChyb29tSWQgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBSZXN0cmljdGVkQWxsb3dUeXBlLlJvb21NZW1iZXJzaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyb29tX2lkXCI6IHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgb25FZGl0UmVzdHJpY3RlZENsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3RyaWN0ZWRBbGxvd1Jvb21JZHMgPSBhd2FpdCBlZGl0UmVzdHJpY3RlZFJvb21JZHMoKTtcbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzdHJpY3RlZEFsbG93Um9vbUlkcykpIHJldHVybjtcbiAgICAgICAgICAgICAgICBpZiAocmVzdHJpY3RlZEFsbG93Um9vbUlkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uUmVzdHJpY3RlZFJvb21JZHNDaGFuZ2UocmVzdHJpY3RlZEFsbG93Um9vbUlkcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UoSm9pblJ1bGUuSW52aXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBbnlvbmUgaW4gYSBzcGFjZSBjYW4gZmluZCBhbmQgam9pbi4gPGE+RWRpdCB3aGljaCBzcGFjZXMgY2FuIGFjY2VzcyBoZXJlLjwvYT5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbkVkaXRSZXN0cmljdGVkQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtfaW5saW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Kb2luUnVsZVNldHRpbmdzX3NwYWNlc1dpdGhBY2Nlc3NcIj5cbiAgICAgICAgICAgICAgICAgICAgPGg0PnsgX3QoXCJTcGFjZXMgd2l0aCBhY2Nlc3NcIikgfTwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIHsgc2hvd25TcGFjZXMubWFwKHJvb20gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGtleT17cm9vbS5yb29tSWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e3Jvb219IGhlaWdodD17MzJ9IHdpZHRoPXszMn0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJvb20ubmFtZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgICAgIHsgbW9yZVRleHQgJiYgPHNwYW4+eyBtb3JlVGV4dCB9PC9zcGFuPiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAoU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZVJvb20pIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXCJBbnlvbmUgaW4gPHNwYWNlTmFtZS8+IGNhbiBmaW5kIGFuZCBqb2luLiBZb3UgY2FuIHNlbGVjdCBvdGhlciBzcGFjZXMgdG9vLlwiLCB7fSwge1xuICAgICAgICAgICAgICAgIHNwYWNlTmFtZTogKCkgPT4gPGI+eyBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlUm9vbS5uYW1lIH08L2I+LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiQW55b25lIGluIGEgc3BhY2UgY2FuIGZpbmQgYW5kIGpvaW4uIFlvdSBjYW4gc2VsZWN0IG11bHRpcGxlIHNwYWNlcy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZpbml0aW9ucy5zcGxpY2UoMSwgMCwge1xuICAgICAgICAgICAgdmFsdWU6IEpvaW5SdWxlLlJlc3RyaWN0ZWQsXG4gICAgICAgICAgICBsYWJlbDogPD5cbiAgICAgICAgICAgICAgICB7IF90KFwiU3BhY2UgbWVtYmVyc1wiKSB9XG4gICAgICAgICAgICAgICAgeyB1cGdyYWRlUmVxdWlyZWRQaWxsIH1cbiAgICAgICAgICAgIDwvPixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIDAgYWxsb3dlZCBzcGFjZXMgdGhlbiByZW5kZXIgaXQgYXMgaW52aXRlIG9ubHkgaW5zdGVhZFxuICAgICAgICAgICAgY2hlY2tlZDogam9pblJ1bGUgPT09IEpvaW5SdWxlLlJlc3RyaWN0ZWQgJiYgISFyZXN0cmljdGVkQWxsb3dSb29tSWRzPy5sZW5ndGgsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IG9uQ2hhbmdlID0gYXN5bmMgKGpvaW5SdWxlOiBKb2luUnVsZSkgPT4ge1xuICAgICAgICBjb25zdCBiZWZvcmVKb2luUnVsZSA9IGNvbnRlbnQuam9pbl9ydWxlO1xuXG4gICAgICAgIGxldCByZXN0cmljdGVkQWxsb3dSb29tSWRzOiBzdHJpbmdbXTtcbiAgICAgICAgaWYgKGpvaW5SdWxlID09PSBKb2luUnVsZS5SZXN0cmljdGVkKSB7XG4gICAgICAgICAgICBpZiAoYmVmb3JlSm9pblJ1bGUgPT09IEpvaW5SdWxlLlJlc3RyaWN0ZWQgfHwgcm9vbVN1cHBvcnRzUmVzdHJpY3RlZCkge1xuICAgICAgICAgICAgICAgIC8vIEhhdmUgdGhlIHVzZXIgcGljayB3aGljaCBzcGFjZXMgdG8gYWxsb3cgam9pbnMgZnJvbVxuICAgICAgICAgICAgICAgIHJlc3RyaWN0ZWRBbGxvd1Jvb21JZHMgPSBhd2FpdCBlZGl0UmVzdHJpY3RlZFJvb21JZHMoKTtcbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzdHJpY3RlZEFsbG93Um9vbUlkcykpIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJlZmVycmVkUmVzdHJpY3Rpb25WZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gQmxvY2sgdGhpcyBhY3Rpb24gb24gYSByb29tIHVwZ3JhZGUgb3RoZXJ3aXNlIGl0J2QgbWFrZSB0aGVpciByb29tIHVuam9pbmFibGVcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRWZXJzaW9uID0gcHJlZmVycmVkUmVzdHJpY3Rpb25WZXJzaW9uO1xuXG4gICAgICAgICAgICAgICAgbGV0IHdhcm5pbmc6IEpTWC5FbGVtZW50O1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmFibGVUb1VwZGF0ZVNvbWVQYXJlbnRzID0gQXJyYXkuZnJvbShTcGFjZVN0b3JlLmluc3RhbmNlLmdldEtub3duUGFyZW50cyhyb29tLnJvb21JZCkpXG4gICAgICAgICAgICAgICAgICAgIC5zb21lKHJvb21JZCA9PiAhY2xpLmdldFJvb20ocm9vbUlkKT8uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5TcGFjZUNoaWxkLCB1c2VySWQpKTtcbiAgICAgICAgICAgICAgICBpZiAodW5hYmxlVG9VcGRhdGVTb21lUGFyZW50cykge1xuICAgICAgICAgICAgICAgICAgICB3YXJuaW5nID0gPGI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiVGhpcyByb29tIGlzIGluIHNvbWUgc3BhY2VzIHlvdSdyZSBub3QgYW4gYWRtaW4gb2YuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkluIHRob3NlIHNwYWNlcywgdGhlIG9sZCByb29tIHdpbGwgc3RpbGwgYmUgc2hvd24sIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJ1dCBwZW9wbGUgd2lsbCBiZSBwcm9tcHRlZCB0byBqb2luIHRoZSBuZXcgb25lLlwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvYj47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFJvb21VcGdyYWRlV2FybmluZ0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRWZXJzaW9uLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJUaGlzIHVwZ3JhZGUgd2lsbCBhbGxvdyBtZW1iZXJzIG9mIHNlbGVjdGVkIHNwYWNlcyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhY2Nlc3MgdG8gdGhpcyByb29tIHdpdGhvdXQgYW4gaW52aXRlLlwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHdhcm5pbmcgfVxuICAgICAgICAgICAgICAgICAgICA8Lz4sXG4gICAgICAgICAgICAgICAgICAgIGRvVXBncmFkZTogYXN5bmMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0czogSUZpbmlzaGVkT3B0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuOiAocHJvZ3Jlc3NUZXh0OiBzdHJpbmcsIHByb2dyZXNzOiBudW1iZXIsIHRvdGFsOiBudW1iZXIpID0+IHZvaWQsXG4gICAgICAgICAgICAgICAgICAgICk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gYXdhaXQgdXBncmFkZVJvb20oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWZXJzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMuaW52aXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG90YWwgPSAyICsgcHJvZ3Jlc3MudXBkYXRlU3BhY2VzVG90YWwgKyBwcm9ncmVzcy5pbnZpdGVVc2Vyc1RvdGFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXByb2dyZXNzLnJvb21VcGdyYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oX3QoXCJVcGdyYWRpbmcgcm9vbVwiKSwgMCwgdG90YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFwcm9ncmVzcy5yb29tU3luY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbihfdChcIkxvYWRpbmcgbmV3IHJvb21cIiksIDEsIHRvdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9ncmVzcy5pbnZpdGVVc2Vyc1Byb2dyZXNzIDwgcHJvZ3Jlc3MuaW52aXRlVXNlcnNUb3RhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oX3QoXCJTZW5kaW5nIGludml0ZXMuLi4gKCUocHJvZ3Jlc3MpcyBvdXQgb2YgJShjb3VudClzKVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHByb2dyZXNzLmludml0ZVVzZXJzUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHByb2dyZXNzLmludml0ZVVzZXJzVG90YWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgMiArIHByb2dyZXNzLmludml0ZVVzZXJzUHJvZ3Jlc3MsIHRvdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9ncmVzcy51cGRhdGVTcGFjZXNQcm9ncmVzcyA8IHByb2dyZXNzLnVwZGF0ZVNwYWNlc1RvdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbihfdChcIlVwZGF0aW5nIHNwYWNlcy4uLiAoJShwcm9ncmVzcylzIG91dCBvZiAlKGNvdW50KXMpXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogcHJvZ3Jlc3MudXBkYXRlU3BhY2VzUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHByb2dyZXNzLnVwZGF0ZVNwYWNlc1RvdGFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIDIgKyBwcm9ncmVzcy5pbnZpdGVVc2Vyc1Byb2dyZXNzICsgcHJvZ3Jlc3MudXBkYXRlU3BhY2VzUHJvZ3Jlc3MsIHRvdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VTZXR0aW5nc0ZuKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN3aXRjaCB0byB0aGUgbmV3IHJvb20gaW4gdGhlIGJhY2tncm91bmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IHVuZGVmaW5lZCwgLy8gb3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvcGVuIG5ldyBzZXR0aW5ncyBvbiB0aGlzIHRhYlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwib3Blbl9yb29tX3NldHRpbmdzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbF90YWJfaWQ6IFJPT01fU0VDVVJJVFlfVEFCLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdoZW4gc2V0dGluZyB0byAwIGFsbG93ZWQgcm9vbXMvc3BhY2VzIHNldCB0byBpbnZpdGUgb25seSBpbnN0ZWFkIGFzIHBlciB0aGUgbm90ZVxuICAgICAgICAgICAgaWYgKCFyZXN0cmljdGVkQWxsb3dSb29tSWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGpvaW5SdWxlID0gSm9pblJ1bGUuSW52aXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJlZm9yZUpvaW5SdWxlID09PSBqb2luUnVsZSAmJiAhcmVzdHJpY3RlZEFsbG93Um9vbUlkcykgcmV0dXJuO1xuICAgICAgICBpZiAoYmVmb3JlQ2hhbmdlICYmICEoYXdhaXQgYmVmb3JlQ2hhbmdlKGpvaW5SdWxlKSkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBuZXdDb250ZW50OiBJSm9pblJ1bGVFdmVudENvbnRlbnQgPSB7XG4gICAgICAgICAgICBqb2luX3J1bGU6IGpvaW5SdWxlLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHByZS1zZXQgdGhlIGFjY2VwdGVkIHNwYWNlcyB3aXRoIHRoZSBjdXJyZW50bHkgdmlld2VkIG9uZSBhcyBwZXIgdGhlIG1pY3JvY29weVxuICAgICAgICBpZiAoam9pblJ1bGUgPT09IEpvaW5SdWxlLlJlc3RyaWN0ZWQpIHtcbiAgICAgICAgICAgIG5ld0NvbnRlbnQuYWxsb3cgPSByZXN0cmljdGVkQWxsb3dSb29tSWRzLm1hcChyb29tSWQgPT4gKHtcbiAgICAgICAgICAgICAgICBcInR5cGVcIjogUmVzdHJpY3RlZEFsbG93VHlwZS5Sb29tTWVtYmVyc2hpcCxcbiAgICAgICAgICAgICAgICBcInJvb21faWRcIjogcm9vbUlkLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0Q29udGVudChuZXdDb250ZW50KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPFN0eWxlZFJhZGlvR3JvdXBcbiAgICAgICAgICAgIG5hbWU9XCJqb2luUnVsZVwiXG4gICAgICAgICAgICB2YWx1ZT17am9pblJ1bGV9XG4gICAgICAgICAgICBvbkNoYW5nZT17b25DaGFuZ2V9XG4gICAgICAgICAgICBkZWZpbml0aW9ucz17ZGVmaW5pdGlvbnN9XG4gICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Kb2luUnVsZVNldHRpbmdzX3JhZGlvQnV0dG9uXCJcbiAgICAgICAgLz5cbiAgICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSm9pblJ1bGVTZXR0aW5ncztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQXJDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFrQ0EsTUFBTUEsZ0JBQWdCLEdBQUcsUUFBMkY7RUFBQSxJQUExRjtJQUFFQyxJQUFGO0lBQVFDLGFBQVI7SUFBdUJDLFlBQXZCO0lBQXFDQyxPQUFyQztJQUE4Q0MsWUFBOUM7SUFBNERDO0VBQTVELENBQTBGO0VBQ2hILE1BQU1DLEdBQUcsR0FBR04sSUFBSSxDQUFDTyxNQUFqQjtFQUVBLE1BQU1DLHNCQUFzQixHQUFHLElBQUFDLDZDQUFBLEVBQXVCVCxJQUFJLENBQUNVLFVBQUwsRUFBdkIsRUFBMENDLDRDQUFBLENBQXNCQyxlQUFoRSxDQUEvQjtFQUNBLE1BQU1DLDJCQUEyQixHQUFHLENBQUNMLHNCQUFELElBQTJCUCxhQUEzQixHQUM5QlUsNENBQUEsQ0FBc0JDLGVBRFEsR0FFOUJFLFNBRk47RUFJQSxNQUFNQyxRQUFRLEdBQUcsQ0FBQ2YsSUFBSSxDQUFDZ0IsWUFBTCxDQUFrQkMsdUJBQWxCLENBQTBDQyxnQkFBQSxDQUFVQyxhQUFwRCxFQUFtRWIsR0FBbkUsQ0FBbEI7RUFFQSxNQUFNLENBQUNjLE9BQUQsRUFBVUMsVUFBVixJQUF3QixJQUFBQywwQkFBQSxFQUMxQixNQUFNdEIsSUFBSSxDQUFDZ0IsWUFBTCxDQUFrQk8sY0FBbEIsQ0FBaUNMLGdCQUFBLENBQVVD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