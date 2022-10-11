"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _event = require("matrix-js-sdk/src/@types/event");

var _client = require("matrix-js-sdk/src/client");

var _room = require("matrix-js-sdk/src/models/room");

var _react = _interopRequireWildcard(require("react"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _UIComponents = require("../../../customisations/helpers/UIComponents");

var _actions = require("../../../dispatcher/actions");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _useDispatcher = require("../../../hooks/useDispatcher");

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _useSettings = require("../../../hooks/useSettings");

var _languageHandler = require("../../../languageHandler");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _UIFeature = require("../../../settings/UIFeature");

var _spaces = require("../../../stores/spaces");

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _space = require("../../../utils/space");

var _ContextMenu = require("../../structures/ContextMenu");

var _BetaCard = require("../beta/BetaCard");

var _IconizedContextMenu = _interopRequireWildcard(require("../context_menus/IconizedContextMenu"));

var _SpaceContextMenu = _interopRequireDefault(require("../context_menus/SpaceContextMenu"));

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _TooltipTarget = _interopRequireDefault(require("../elements/TooltipTarget"));

var _SpacePanel = require("../spaces/SpacePanel");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 - 2022 The Matrix.org Foundation C.I.C.

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
const contextMenuBelow = elementRect => {
  // align the context menu's icons with the icon which opened the context menu
  const left = elementRect.left + window.scrollX;
  const top = elementRect.bottom + window.scrollY + 12;
  const chevronFace = _ContextMenu.ChevronFace.None;
  return {
    left,
    top,
    chevronFace
  };
}; // Long-running actions that should trigger a spinner


var PendingActionType;

(function (PendingActionType) {
  PendingActionType[PendingActionType["JoinRoom"] = 0] = "JoinRoom";
  PendingActionType[PendingActionType["BulkRedact"] = 1] = "BulkRedact";
})(PendingActionType || (PendingActionType = {}));

const usePendingActions = () => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [actions, setActions] = (0, _react.useState)(new Map());

  const addAction = (type, key) => {
    const keys = new Set(actions.get(type));
    keys.add(key);
    setActions(new Map(actions).set(type, keys));
  };

  const removeAction = (type, key) => {
    const keys = new Set(actions.get(type));

    if (keys.delete(key)) {
      setActions(new Map(actions).set(type, keys));
    }
  };

  (0, _useDispatcher.useDispatcher)(_dispatcher.default, payload => {
    switch (payload.action) {
      case _actions.Action.JoinRoom:
        addAction(PendingActionType.JoinRoom, payload.roomId);
        break;

      case _actions.Action.JoinRoomReady:
      case _actions.Action.JoinRoomError:
        removeAction(PendingActionType.JoinRoom, payload.roomId);
        break;

      case _actions.Action.BulkRedactStart:
        addAction(PendingActionType.BulkRedact, payload.roomId);
        break;

      case _actions.Action.BulkRedactEnd:
        removeAction(PendingActionType.BulkRedact, payload.roomId);
        break;
    }
  });
  (0, _useEventEmitter.useTypedEventEmitter)(cli, _client.ClientEvent.Room, room => removeAction(PendingActionType.JoinRoom, room.roomId));
  return actions;
};

const RoomListHeader = _ref => {
  let {
    onVisibilityChange
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [mainMenuDisplayed, mainMenuHandle, openMainMenu, closeMainMenu] = (0, _ContextMenu.useContextMenu)();
  const [plusMenuDisplayed, plusMenuHandle, openPlusMenu, closePlusMenu] = (0, _ContextMenu.useContextMenu)();
  const [spaceKey, activeSpace] = (0, _useEventEmitter.useEventEmitterState)(_SpaceStore.default.instance, _spaces.UPDATE_SELECTED_SPACE, () => [_SpaceStore.default.instance.activeSpace, _SpaceStore.default.instance.activeSpaceRoom]);
  const allRoomsInHome = (0, _useEventEmitter.useEventEmitterState)(_SpaceStore.default.instance, _spaces.UPDATE_HOME_BEHAVIOUR, () => {
    return _SpaceStore.default.instance.allRoomsInHome;
  });
  const videoRoomsEnabled = (0, _useSettings.useFeatureEnabled)("feature_video_rooms");
  const pendingActions = usePendingActions();
  const canShowMainMenu = activeSpace || spaceKey === _spaces.MetaSpace.Home;
  (0, _react.useEffect)(() => {
    if (mainMenuDisplayed && !canShowMainMenu) {
      // Space changed under us and we no longer has a main menu to draw
      closeMainMenu();
    }
  }, [closeMainMenu, canShowMainMenu, mainMenuDisplayed]);
  const spaceName = (0, _useEventEmitter.useTypedEventEmitterState)(activeSpace, _room.RoomEvent.Name, () => activeSpace?.name);
  (0, _react.useEffect)(() => {
    if (onVisibilityChange) {
      onVisibilityChange();
    }
  }, [onVisibilityChange]);
  const canExploreRooms = (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.ExploreRooms);
  const canCreateRooms = (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.CreateRooms);
  const canCreateSpaces = (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.CreateSpaces);
  const hasPermissionToAddSpaceChild = activeSpace?.currentState?.maySendStateEvent(_event.EventType.SpaceChild, cli.getUserId());
  const canAddSubRooms = hasPermissionToAddSpaceChild && canCreateRooms;
  const canAddSubSpaces = hasPermissionToAddSpaceChild && canCreateSpaces; // If the user can't do anything on the plus menu, don't show it. This aims to target the
  // plus menu shown on the Home tab primarily: the user has options to use the menu for
  // communities and spaces, but is at risk of no options on the Home tab.

  const canShowPlusMenu = canCreateRooms || canExploreRooms || canCreateSpaces || activeSpace;
  let contextMenu;

  if (mainMenuDisplayed && mainMenuHandle.current) {
    let ContextMenuComponent;

    if (activeSpace) {
      ContextMenuComponent = _SpaceContextMenu.default;
    } else {
      ContextMenuComponent = _SpacePanel.HomeButtonContextMenu;
    }

    contextMenu = /*#__PURE__*/_react.default.createElement(ContextMenuComponent, (0, _extends2.default)({}, contextMenuBelow(mainMenuHandle.current.getBoundingClientRect()), {
      space: activeSpace,
      onFinished: closeMainMenu,
      hideHeader: true
    }));
  } else if (plusMenuDisplayed && activeSpace) {
    let inviteOption;

    if ((0, _space.shouldShowSpaceInvite)(activeSpace)) {
      inviteOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("Invite"),
        iconClassName: "mx_RoomListHeader_iconInvite",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          (0, _space.showSpaceInvite)(activeSpace);
          closePlusMenu();
        }
      });
    }

    let newRoomOptions;

    if (activeSpace?.currentState.maySendStateEvent(_event.EventType.RoomAvatar, cli.getUserId())) {
      newRoomOptions = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_RoomListHeader_iconNewRoom",
        label: (0, _languageHandler._t)("New room"),
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          (0, _space.showCreateNewRoom)(activeSpace);

          _PosthogTrackers.default.trackInteraction("WebRoomListHeaderPlusMenuCreateRoomItem", e);

          closePlusMenu();
        }
      }), videoRoomsEnabled && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_RoomListHeader_iconNewVideoRoom",
        label: (0, _languageHandler._t)("New video room"),
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          (0, _space.showCreateNewRoom)(activeSpace, _event.RoomType.ElementVideo);
          closePlusMenu();
        }
      }, /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, null)));
    }

    contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, contextMenuBelow(plusMenuHandle.current.getBoundingClientRect()), {
      onFinished: closePlusMenu,
      compact: true
    }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
      first: true
    }, inviteOption, newRoomOptions, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("Explore rooms"),
      iconClassName: "mx_RoomListHeader_iconExplore",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: activeSpace.roomId,
          metricsTrigger: undefined // other

        });

        closePlusMenu();

        _PosthogTrackers.default.trackInteraction("WebRoomListHeaderPlusMenuExploreRoomsItem", e);
      }
    }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("Add existing room"),
      iconClassName: "mx_RoomListHeader_iconPlus",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        (0, _space.showAddExistingRooms)(activeSpace);
        closePlusMenu();
      },
      disabled: !canAddSubRooms,
      tooltip: !canAddSubRooms && (0, _languageHandler._t)("You do not have permissions to add rooms to this space")
    }), canCreateSpaces && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("Add space"),
      iconClassName: "mx_RoomListHeader_iconPlus",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        (0, _space.showCreateNewSubspace)(activeSpace);
        closePlusMenu();
      },
      disabled: !canAddSubSpaces,
      tooltip: !canAddSubSpaces && (0, _languageHandler._t)("You do not have permissions to add spaces to this space")
    }, /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, null))));
  } else if (plusMenuDisplayed) {
    let newRoomOpts;
    let joinRoomOpt;

    if (canCreateRooms) {
      newRoomOpts = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("Start new chat"),
        iconClassName: "mx_RoomListHeader_iconStartChat",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();

          _dispatcher.default.dispatch({
            action: "view_create_chat"
          });

          _PosthogTrackers.default.trackInteraction("WebRoomListHeaderPlusMenuCreateChatItem", e);

          closePlusMenu();
        }
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("New room"),
        iconClassName: "mx_RoomListHeader_iconNewRoom",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();

          _dispatcher.default.dispatch({
            action: "view_create_room"
          });

          _PosthogTrackers.default.trackInteraction("WebRoomListHeaderPlusMenuCreateRoomItem", e);

          closePlusMenu();
        }
      }), videoRoomsEnabled && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("New video room"),
        iconClassName: "mx_RoomListHeader_iconNewVideoRoom",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();

          _dispatcher.default.dispatch({
            action: "view_create_room",
            type: _event.RoomType.ElementVideo
          });

          closePlusMenu();
        }
      }, /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, null)));
    }

    if (canExploreRooms) {
      joinRoomOpt = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("Join public room"),
        iconClassName: "mx_RoomListHeader_iconExplore",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();

          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDirectory
          });

          _PosthogTrackers.default.trackInteraction("WebRoomListHeaderPlusMenuExploreRoomsItem", e);

          closePlusMenu();
        }
      });
    }

    contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, contextMenuBelow(plusMenuHandle.current.getBoundingClientRect()), {
      onFinished: closePlusMenu,
      compact: true
    }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
      first: true
    }, newRoomOpts, joinRoomOpt));
  }

  let title;

  if (activeSpace) {
    title = spaceName;
  } else {
    title = (0, _spaces.getMetaSpaceName)(spaceKey, allRoomsInHome);
  }

  const pendingActionSummary = [...pendingActions.entries()].filter(_ref2 => {
    let [type, keys] = _ref2;
    return keys.size > 0;
  }).map(_ref3 => {
    let [type, keys] = _ref3;

    switch (type) {
      case PendingActionType.JoinRoom:
        return (0, _languageHandler._t)("Currently joining %(count)s rooms", {
          count: keys.size
        });

      case PendingActionType.BulkRedact:
        return (0, _languageHandler._t)("Currently removing messages in %(count)s rooms", {
          count: keys.size
        });
    }
  }).join("\n");

  let contextMenuButton = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomListHeader_contextLessTitle"
  }, title);

  if (canShowMainMenu) {
    contextMenuButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
      inputRef: mainMenuHandle,
      onClick: openMainMenu,
      isExpanded: mainMenuDisplayed,
      className: "mx_RoomListHeader_contextMenuButton",
      title: activeSpace ? (0, _languageHandler._t)("%(spaceName)s menu", {
        spaceName
      }) : (0, _languageHandler._t)("Home options")
    }, title);
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomListHeader"
  }, contextMenuButton, pendingActionSummary ? /*#__PURE__*/_react.default.createElement(_TooltipTarget.default, {
    label: pendingActionSummary
  }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null)) : null, canShowPlusMenu && /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
    inputRef: plusMenuHandle,
    onClick: openPlusMenu,
    isExpanded: plusMenuDisplayed,
    className: "mx_RoomListHeader_plusButton",
    title: (0, _languageHandler._t)("Add")
  }), contextMenu);
};

var _default = RoomListHeader;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb250ZXh0TWVudUJlbG93IiwiZWxlbWVudFJlY3QiLCJsZWZ0Iiwid2luZG93Iiwic2Nyb2xsWCIsInRvcCIsImJvdHRvbSIsInNjcm9sbFkiLCJjaGV2cm9uRmFjZSIsIkNoZXZyb25GYWNlIiwiTm9uZSIsIlBlbmRpbmdBY3Rpb25UeXBlIiwidXNlUGVuZGluZ0FjdGlvbnMiLCJjbGkiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsImFjdGlvbnMiLCJzZXRBY3Rpb25zIiwidXNlU3RhdGUiLCJNYXAiLCJhZGRBY3Rpb24iLCJ0eXBlIiwia2V5Iiwia2V5cyIsIlNldCIsImdldCIsImFkZCIsInNldCIsInJlbW92ZUFjdGlvbiIsImRlbGV0ZSIsInVzZURpc3BhdGNoZXIiLCJkZWZhdWx0RGlzcGF0Y2hlciIsInBheWxvYWQiLCJhY3Rpb24iLCJBY3Rpb24iLCJKb2luUm9vbSIsInJvb21JZCIsIkpvaW5Sb29tUmVhZHkiLCJKb2luUm9vbUVycm9yIiwiQnVsa1JlZGFjdFN0YXJ0IiwiQnVsa1JlZGFjdCIsIkJ1bGtSZWRhY3RFbmQiLCJ1c2VUeXBlZEV2ZW50RW1pdHRlciIsIkNsaWVudEV2ZW50IiwiUm9vbSIsInJvb20iLCJSb29tTGlzdEhlYWRlciIsIm9uVmlzaWJpbGl0eUNoYW5nZSIsIm1haW5NZW51RGlzcGxheWVkIiwibWFpbk1lbnVIYW5kbGUiLCJvcGVuTWFpbk1lbnUiLCJjbG9zZU1haW5NZW51IiwidXNlQ29udGV4dE1lbnUiLCJwbHVzTWVudURpc3BsYXllZCIsInBsdXNNZW51SGFuZGxlIiwib3BlblBsdXNNZW51IiwiY2xvc2VQbHVzTWVudSIsInNwYWNlS2V5IiwiYWN0aXZlU3BhY2UiLCJ1c2VFdmVudEVtaXR0ZXJTdGF0ZSIsIlNwYWNlU3RvcmUiLCJpbnN0YW5jZSIsIlVQREFURV9TRUxFQ1RFRF9TUEFDRSIsImFjdGl2ZVNwYWNlUm9vbSIsImFsbFJvb21zSW5Ib21lIiwiVVBEQVRFX0hPTUVfQkVIQVZJT1VSIiwidmlkZW9Sb29tc0VuYWJsZWQiLCJ1c2VGZWF0dXJlRW5hYmxlZCIsInBlbmRpbmdBY3Rpb25zIiwiY2FuU2hvd01haW5NZW51IiwiTWV0YVNwYWNlIiwiSG9tZSIsInVzZUVmZmVjdCIsInNwYWNlTmFtZSIsInVzZVR5cGVkRXZlbnRFbWl0dGVyU3RhdGUiLCJSb29tRXZlbnQiLCJOYW1lIiwibmFtZSIsImNhbkV4cGxvcmVSb29tcyIsInNob3VsZFNob3dDb21wb25lbnQiLCJVSUNvbXBvbmVudCIsIkV4cGxvcmVSb29tcyIsImNhbkNyZWF0ZVJvb21zIiwiQ3JlYXRlUm9vbXMiLCJjYW5DcmVhdGVTcGFjZXMiLCJDcmVhdGVTcGFjZXMiLCJoYXNQZXJtaXNzaW9uVG9BZGRTcGFjZUNoaWxkIiwiY3VycmVudFN0YXRlIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJFdmVudFR5cGUiLCJTcGFjZUNoaWxkIiwiZ2V0VXNlcklkIiwiY2FuQWRkU3ViUm9vbXMiLCJjYW5BZGRTdWJTcGFjZXMiLCJjYW5TaG93UGx1c01lbnUiLCJjb250ZXh0TWVudSIsImN1cnJlbnQiLCJDb250ZXh0TWVudUNvbXBvbmVudCIsIlNwYWNlQ29udGV4dE1lbnUiLCJIb21lQnV0dG9uQ29udGV4dE1lbnUiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJpbnZpdGVPcHRpb24iLCJzaG91bGRTaG93U3BhY2VJbnZpdGUiLCJfdCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dTcGFjZUludml0ZSIsIm5ld1Jvb21PcHRpb25zIiwiUm9vbUF2YXRhciIsInNob3dDcmVhdGVOZXdSb29tIiwiUG9zdGhvZ1RyYWNrZXJzIiwidHJhY2tJbnRlcmFjdGlvbiIsIlJvb21UeXBlIiwiRWxlbWVudFZpZGVvIiwiZGlzcGF0Y2giLCJWaWV3Um9vbSIsInJvb21faWQiLCJtZXRyaWNzVHJpZ2dlciIsInVuZGVmaW5lZCIsInNob3dBZGRFeGlzdGluZ1Jvb21zIiwic2hvd0NyZWF0ZU5ld1N1YnNwYWNlIiwibmV3Um9vbU9wdHMiLCJqb2luUm9vbU9wdCIsIlZpZXdSb29tRGlyZWN0b3J5IiwidGl0bGUiLCJnZXRNZXRhU3BhY2VOYW1lIiwicGVuZGluZ0FjdGlvblN1bW1hcnkiLCJlbnRyaWVzIiwiZmlsdGVyIiwic2l6ZSIsIm1hcCIsImNvdW50Iiwiam9pbiIsImNvbnRleHRNZW51QnV0dG9uIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvUm9vbUxpc3RIZWFkZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBFdmVudFR5cGUsIFJvb21UeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgQ2xpZW50RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBSb29tLCBSb29tRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0LCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgeyBzaG91bGRTaG93Q29tcG9uZW50IH0gZnJvbSBcIi4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL2hlbHBlcnMvVUlDb21wb25lbnRzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyB1c2VEaXNwYXRjaGVyIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZURpc3BhdGNoZXJcIjtcbmltcG9ydCB7IHVzZUV2ZW50RW1pdHRlclN0YXRlLCB1c2VUeXBlZEV2ZW50RW1pdHRlciwgdXNlVHlwZWRFdmVudEVtaXR0ZXJTdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXJcIjtcbmltcG9ydCB7IHVzZUZlYXR1cmVFbmFibGVkIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVNldHRpbmdzXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uLy4uLy4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuaW1wb3J0IHsgVUlDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQge1xuICAgIGdldE1ldGFTcGFjZU5hbWUsXG4gICAgTWV0YVNwYWNlLFxuICAgIFNwYWNlS2V5LFxuICAgIFVQREFURV9IT01FX0JFSEFWSU9VUixcbiAgICBVUERBVEVfU0VMRUNURURfU1BBQ0UsXG59IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvc3BhY2VzXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3NwYWNlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQge1xuICAgIHNob3VsZFNob3dTcGFjZUludml0ZSxcbiAgICBzaG93QWRkRXhpc3RpbmdSb29tcyxcbiAgICBzaG93Q3JlYXRlTmV3Um9vbSxcbiAgICBzaG93Q3JlYXRlTmV3U3Vic3BhY2UsXG4gICAgc2hvd1NwYWNlSW52aXRlLFxufSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3BhY2VcIjtcbmltcG9ydCB7IENoZXZyb25GYWNlLCBDb250ZXh0TWVudVRvb2x0aXBCdXR0b24sIHVzZUNvbnRleHRNZW51IH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7IEJldGFQaWxsIH0gZnJvbSBcIi4uL2JldGEvQmV0YUNhcmRcIjtcbmltcG9ydCBJY29uaXplZENvbnRleHRNZW51LCB7XG4gICAgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbixcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCxcbn0gZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IFNwYWNlQ29udGV4dE1lbnUgZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvU3BhY2VDb250ZXh0TWVudVwiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSBcIi4uL2VsZW1lbnRzL0lubGluZVNwaW5uZXJcIjtcbmltcG9ydCBUb29sdGlwVGFyZ2V0IGZyb20gXCIuLi9lbGVtZW50cy9Ub29sdGlwVGFyZ2V0XCI7XG5pbXBvcnQgeyBIb21lQnV0dG9uQ29udGV4dE1lbnUgfSBmcm9tIFwiLi4vc3BhY2VzL1NwYWNlUGFuZWxcIjtcblxuY29uc3QgY29udGV4dE1lbnVCZWxvdyA9IChlbGVtZW50UmVjdDogRE9NUmVjdCkgPT4ge1xuICAgIC8vIGFsaWduIHRoZSBjb250ZXh0IG1lbnUncyBpY29ucyB3aXRoIHRoZSBpY29uIHdoaWNoIG9wZW5lZCB0aGUgY29udGV4dCBtZW51XG4gICAgY29uc3QgbGVmdCA9IGVsZW1lbnRSZWN0LmxlZnQgKyB3aW5kb3cuc2Nyb2xsWDtcbiAgICBjb25zdCB0b3AgPSBlbGVtZW50UmVjdC5ib3R0b20gKyB3aW5kb3cuc2Nyb2xsWSArIDEyO1xuICAgIGNvbnN0IGNoZXZyb25GYWNlID0gQ2hldnJvbkZhY2UuTm9uZTtcbiAgICByZXR1cm4geyBsZWZ0LCB0b3AsIGNoZXZyb25GYWNlIH07XG59O1xuXG4vLyBMb25nLXJ1bm5pbmcgYWN0aW9ucyB0aGF0IHNob3VsZCB0cmlnZ2VyIGEgc3Bpbm5lclxuZW51bSBQZW5kaW5nQWN0aW9uVHlwZSB7XG4gICAgSm9pblJvb20sXG4gICAgQnVsa1JlZGFjdCxcbn1cblxuY29uc3QgdXNlUGVuZGluZ0FjdGlvbnMgPSAoKTogTWFwPFBlbmRpbmdBY3Rpb25UeXBlLCBTZXQ8c3RyaW5nPj4gPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgW2FjdGlvbnMsIHNldEFjdGlvbnNdID0gdXNlU3RhdGUobmV3IE1hcDxQZW5kaW5nQWN0aW9uVHlwZSwgU2V0PHN0cmluZz4+KCkpO1xuXG4gICAgY29uc3QgYWRkQWN0aW9uID0gKHR5cGU6IFBlbmRpbmdBY3Rpb25UeXBlLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBrZXlzID0gbmV3IFNldChhY3Rpb25zLmdldCh0eXBlKSk7XG4gICAgICAgIGtleXMuYWRkKGtleSk7XG4gICAgICAgIHNldEFjdGlvbnMobmV3IE1hcChhY3Rpb25zKS5zZXQodHlwZSwga2V5cykpO1xuICAgIH07XG4gICAgY29uc3QgcmVtb3ZlQWN0aW9uID0gKHR5cGU6IFBlbmRpbmdBY3Rpb25UeXBlLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBrZXlzID0gbmV3IFNldChhY3Rpb25zLmdldCh0eXBlKSk7XG4gICAgICAgIGlmIChrZXlzLmRlbGV0ZShrZXkpKSB7XG4gICAgICAgICAgICBzZXRBY3Rpb25zKG5ldyBNYXAoYWN0aW9ucykuc2V0KHR5cGUsIGtleXMpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1c2VEaXNwYXRjaGVyKGRlZmF1bHREaXNwYXRjaGVyLCBwYXlsb2FkID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBBY3Rpb24uSm9pblJvb206XG4gICAgICAgICAgICAgICAgYWRkQWN0aW9uKFBlbmRpbmdBY3Rpb25UeXBlLkpvaW5Sb29tLCBwYXlsb2FkLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5Kb2luUm9vbVJlYWR5OlxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uSm9pblJvb21FcnJvcjpcbiAgICAgICAgICAgICAgICByZW1vdmVBY3Rpb24oUGVuZGluZ0FjdGlvblR5cGUuSm9pblJvb20sIHBheWxvYWQucm9vbUlkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkJ1bGtSZWRhY3RTdGFydDpcbiAgICAgICAgICAgICAgICBhZGRBY3Rpb24oUGVuZGluZ0FjdGlvblR5cGUuQnVsa1JlZGFjdCwgcGF5bG9hZC5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpb24uQnVsa1JlZGFjdEVuZDpcbiAgICAgICAgICAgICAgICByZW1vdmVBY3Rpb24oUGVuZGluZ0FjdGlvblR5cGUuQnVsa1JlZGFjdCwgcGF5bG9hZC5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdXNlVHlwZWRFdmVudEVtaXR0ZXIoY2xpLCBDbGllbnRFdmVudC5Sb29tLCAocm9vbTogUm9vbSkgPT5cbiAgICAgICAgcmVtb3ZlQWN0aW9uKFBlbmRpbmdBY3Rpb25UeXBlLkpvaW5Sb29tLCByb29tLnJvb21JZCksXG4gICAgKTtcblxuICAgIHJldHVybiBhY3Rpb25zO1xufTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgb25WaXNpYmlsaXR5Q2hhbmdlPygpOiB2b2lkO1xufVxuXG5jb25zdCBSb29tTGlzdEhlYWRlciA9ICh7IG9uVmlzaWJpbGl0eUNoYW5nZSB9OiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IFttYWluTWVudURpc3BsYXllZCwgbWFpbk1lbnVIYW5kbGUsIG9wZW5NYWluTWVudSwgY2xvc2VNYWluTWVudV0gPSB1c2VDb250ZXh0TWVudTxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBjb25zdCBbcGx1c01lbnVEaXNwbGF5ZWQsIHBsdXNNZW51SGFuZGxlLCBvcGVuUGx1c01lbnUsIGNsb3NlUGx1c01lbnVdID0gdXNlQ29udGV4dE1lbnU8SFRNTERpdkVsZW1lbnQ+KCk7XG4gICAgY29uc3QgW3NwYWNlS2V5LCBhY3RpdmVTcGFjZV0gPSB1c2VFdmVudEVtaXR0ZXJTdGF0ZTxbU3BhY2VLZXksIFJvb20gfCBudWxsXT4oXG4gICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2UsXG4gICAgICAgIFVQREFURV9TRUxFQ1RFRF9TUEFDRSxcbiAgICAgICAgKCkgPT4gW1NwYWNlU3RvcmUuaW5zdGFuY2UuYWN0aXZlU3BhY2UsIFNwYWNlU3RvcmUuaW5zdGFuY2UuYWN0aXZlU3BhY2VSb29tXSxcbiAgICApO1xuICAgIGNvbnN0IGFsbFJvb21zSW5Ib21lID0gdXNlRXZlbnRFbWl0dGVyU3RhdGUoU3BhY2VTdG9yZS5pbnN0YW5jZSwgVVBEQVRFX0hPTUVfQkVIQVZJT1VSLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBTcGFjZVN0b3JlLmluc3RhbmNlLmFsbFJvb21zSW5Ib21lO1xuICAgIH0pO1xuICAgIGNvbnN0IHZpZGVvUm9vbXNFbmFibGVkID0gdXNlRmVhdHVyZUVuYWJsZWQoXCJmZWF0dXJlX3ZpZGVvX3Jvb21zXCIpO1xuICAgIGNvbnN0IHBlbmRpbmdBY3Rpb25zID0gdXNlUGVuZGluZ0FjdGlvbnMoKTtcblxuICAgIGNvbnN0IGNhblNob3dNYWluTWVudSA9IGFjdGl2ZVNwYWNlIHx8IHNwYWNlS2V5ID09PSBNZXRhU3BhY2UuSG9tZTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChtYWluTWVudURpc3BsYXllZCAmJiAhY2FuU2hvd01haW5NZW51KSB7XG4gICAgICAgICAgICAvLyBTcGFjZSBjaGFuZ2VkIHVuZGVyIHVzIGFuZCB3ZSBubyBsb25nZXIgaGFzIGEgbWFpbiBtZW51IHRvIGRyYXdcbiAgICAgICAgICAgIGNsb3NlTWFpbk1lbnUoKTtcbiAgICAgICAgfVxuICAgIH0sIFtjbG9zZU1haW5NZW51LCBjYW5TaG93TWFpbk1lbnUsIG1haW5NZW51RGlzcGxheWVkXSk7XG5cbiAgICBjb25zdCBzcGFjZU5hbWUgPSB1c2VUeXBlZEV2ZW50RW1pdHRlclN0YXRlKGFjdGl2ZVNwYWNlLCBSb29tRXZlbnQuTmFtZSwgKCkgPT4gYWN0aXZlU3BhY2U/Lm5hbWUpO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKG9uVmlzaWJpbGl0eUNoYW5nZSkge1xuICAgICAgICAgICAgb25WaXNpYmlsaXR5Q2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICB9LCBbb25WaXNpYmlsaXR5Q2hhbmdlXSk7XG5cbiAgICBjb25zdCBjYW5FeHBsb3JlUm9vbXMgPSBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50LkV4cGxvcmVSb29tcyk7XG4gICAgY29uc3QgY2FuQ3JlYXRlUm9vbXMgPSBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50LkNyZWF0ZVJvb21zKTtcbiAgICBjb25zdCBjYW5DcmVhdGVTcGFjZXMgPSBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50LkNyZWF0ZVNwYWNlcyk7XG5cbiAgICBjb25zdCBoYXNQZXJtaXNzaW9uVG9BZGRTcGFjZUNoaWxkID1cbiAgICAgICAgYWN0aXZlU3BhY2U/LmN1cnJlbnRTdGF0ZT8ubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlNwYWNlQ2hpbGQsIGNsaS5nZXRVc2VySWQoKSk7XG4gICAgY29uc3QgY2FuQWRkU3ViUm9vbXMgPSBoYXNQZXJtaXNzaW9uVG9BZGRTcGFjZUNoaWxkICYmIGNhbkNyZWF0ZVJvb21zO1xuICAgIGNvbnN0IGNhbkFkZFN1YlNwYWNlcyA9IGhhc1Blcm1pc3Npb25Ub0FkZFNwYWNlQ2hpbGQgJiYgY2FuQ3JlYXRlU3BhY2VzO1xuXG4gICAgLy8gSWYgdGhlIHVzZXIgY2FuJ3QgZG8gYW55dGhpbmcgb24gdGhlIHBsdXMgbWVudSwgZG9uJ3Qgc2hvdyBpdC4gVGhpcyBhaW1zIHRvIHRhcmdldCB0aGVcbiAgICAvLyBwbHVzIG1lbnUgc2hvd24gb24gdGhlIEhvbWUgdGFiIHByaW1hcmlseTogdGhlIHVzZXIgaGFzIG9wdGlvbnMgdG8gdXNlIHRoZSBtZW51IGZvclxuICAgIC8vIGNvbW11bml0aWVzIGFuZCBzcGFjZXMsIGJ1dCBpcyBhdCByaXNrIG9mIG5vIG9wdGlvbnMgb24gdGhlIEhvbWUgdGFiLlxuICAgIGNvbnN0IGNhblNob3dQbHVzTWVudSA9IGNhbkNyZWF0ZVJvb21zIHx8IGNhbkV4cGxvcmVSb29tcyB8fCBjYW5DcmVhdGVTcGFjZXMgfHwgYWN0aXZlU3BhY2U7XG5cbiAgICBsZXQgY29udGV4dE1lbnU6IEpTWC5FbGVtZW50O1xuICAgIGlmIChtYWluTWVudURpc3BsYXllZCAmJiBtYWluTWVudUhhbmRsZS5jdXJyZW50KSB7XG4gICAgICAgIGxldCBDb250ZXh0TWVudUNvbXBvbmVudDtcbiAgICAgICAgaWYgKGFjdGl2ZVNwYWNlKSB7XG4gICAgICAgICAgICBDb250ZXh0TWVudUNvbXBvbmVudCA9IFNwYWNlQ29udGV4dE1lbnU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBDb250ZXh0TWVudUNvbXBvbmVudCA9IEhvbWVCdXR0b25Db250ZXh0TWVudTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHRNZW51ID0gPENvbnRleHRNZW51Q29tcG9uZW50XG4gICAgICAgICAgICB7Li4uY29udGV4dE1lbnVCZWxvdyhtYWluTWVudUhhbmRsZS5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKX1cbiAgICAgICAgICAgIHNwYWNlPXthY3RpdmVTcGFjZX1cbiAgICAgICAgICAgIG9uRmluaXNoZWQ9e2Nsb3NlTWFpbk1lbnV9XG4gICAgICAgICAgICBoaWRlSGVhZGVyPXt0cnVlfVxuICAgICAgICAvPjtcbiAgICB9IGVsc2UgaWYgKHBsdXNNZW51RGlzcGxheWVkICYmIGFjdGl2ZVNwYWNlKSB7XG4gICAgICAgIGxldCBpbnZpdGVPcHRpb246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoc2hvdWxkU2hvd1NwYWNlSW52aXRlKGFjdGl2ZVNwYWNlKSkge1xuICAgICAgICAgICAgaW52aXRlT3B0aW9uID0gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJJbnZpdGVcIil9XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0SGVhZGVyX2ljb25JbnZpdGVcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgc2hvd1NwYWNlSW52aXRlKGFjdGl2ZVNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VQbHVzTWVudSgpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuZXdSb29tT3B0aW9uczogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVTcGFjZT8uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5Sb29tQXZhdGFyLCBjbGkuZ2V0VXNlcklkKCkpKSB7XG4gICAgICAgICAgICBuZXdSb29tT3B0aW9ucyA9IDw+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0SGVhZGVyX2ljb25OZXdSb29tXCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTmV3IHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0NyZWF0ZU5ld1Jvb20oYWN0aXZlU3BhY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJSb29tTGlzdEhlYWRlclBsdXNNZW51Q3JlYXRlUm9vbUl0ZW1cIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBsdXNNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7IHZpZGVvUm9vbXNFbmFibGVkICYmIChcbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdEhlYWRlcl9pY29uTmV3VmlkZW9Sb29tXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk5ldyB2aWRlbyByb29tXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93Q3JlYXRlTmV3Um9vbShhY3RpdmVTcGFjZSwgUm9vbVR5cGUuRWxlbWVudFZpZGVvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBsdXNNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QmV0YVBpbGwgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uPlxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dE1lbnUgPSA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgey4uLmNvbnRleHRNZW51QmVsb3cocGx1c01lbnVIYW5kbGUuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSl9XG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtjbG9zZVBsdXNNZW51fVxuICAgICAgICAgICAgY29tcGFjdFxuICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgZmlyc3Q+XG4gICAgICAgICAgICAgICAgeyBpbnZpdGVPcHRpb24gfVxuICAgICAgICAgICAgICAgIHsgbmV3Um9vbU9wdGlvbnMgfVxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkV4cGxvcmUgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdEhlYWRlcl9pY29uRXhwbG9yZVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogYWN0aXZlU3BhY2Uucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlUGx1c01lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViUm9vbUxpc3RIZWFkZXJQbHVzTWVudUV4cGxvcmVSb29tc0l0ZW1cIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJBZGQgZXhpc3Rpbmcgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0SGVhZGVyX2ljb25QbHVzXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93QWRkRXhpc3RpbmdSb29tcyhhY3RpdmVTcGFjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBsdXNNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshY2FuQWRkU3ViUm9vbXN9XG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9eyFjYW5BZGRTdWJSb29tcyAmJiBfdChcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9ucyB0byBhZGQgcm9vbXMgdG8gdGhpcyBzcGFjZVwiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHsgY2FuQ3JlYXRlU3BhY2VzICYmIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkFkZCBzcGFjZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0SGVhZGVyX2ljb25QbHVzXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93Q3JlYXRlTmV3U3Vic3BhY2UoYWN0aXZlU3BhY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQbHVzTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhbkFkZFN1YlNwYWNlc31cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD17IWNhbkFkZFN1YlNwYWNlcyAmJiBfdChcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9ucyB0byBhZGQgc3BhY2VzIHRvIHRoaXMgc3BhY2VcIil9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8QmV0YVBpbGwgLz5cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb24+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51PjtcbiAgICB9IGVsc2UgaWYgKHBsdXNNZW51RGlzcGxheWVkKSB7XG4gICAgICAgIGxldCBuZXdSb29tT3B0czogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGxldCBqb2luUm9vbU9wdDogSlNYLkVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKGNhbkNyZWF0ZVJvb21zKSB7XG4gICAgICAgICAgICBuZXdSb29tT3B0cyA9IDw+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU3RhcnQgbmV3IGNoYXRcIil9XG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdEhlYWRlcl9pY29uU3RhcnRDaGF0XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7IGFjdGlvbjogXCJ2aWV3X2NyZWF0ZV9jaGF0XCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21MaXN0SGVhZGVyUGx1c01lbnVDcmVhdGVDaGF0SXRlbVwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlUGx1c01lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk5ldyByb29tXCIpfVxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbUxpc3RIZWFkZXJfaWNvbk5ld1Jvb21cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfY3JlYXRlX3Jvb21cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViUm9vbUxpc3RIZWFkZXJQbHVzTWVudUNyZWF0ZVJvb21JdGVtXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQbHVzTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyB2aWRlb1Jvb21zRW5hYmxlZCAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOZXcgdmlkZW8gcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdEhlYWRlcl9pY29uTmV3VmlkZW9Sb29tXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwidmlld19jcmVhdGVfcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBSb29tVHlwZS5FbGVtZW50VmlkZW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQbHVzTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJldGFQaWxsIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbj5cbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgIDwvPjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FuRXhwbG9yZVJvb21zKSB7XG4gICAgICAgICAgICBqb2luUm9vbU9wdCA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJKb2luIHB1YmxpYyByb29tXCIpfVxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbUxpc3RIZWFkZXJfaWNvbkV4cGxvcmVcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb21EaXJlY3RvcnkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21MaXN0SGVhZGVyUGx1c01lbnVFeHBsb3JlUm9vbXNJdGVtXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQbHVzTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dE1lbnUgPSA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgey4uLmNvbnRleHRNZW51QmVsb3cocGx1c01lbnVIYW5kbGUuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSl9XG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtjbG9zZVBsdXNNZW51fVxuICAgICAgICAgICAgY29tcGFjdFxuICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgZmlyc3Q+XG4gICAgICAgICAgICAgICAgeyBuZXdSb29tT3B0cyB9XG4gICAgICAgICAgICAgICAgeyBqb2luUm9vbU9wdCB9XG4gICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+O1xuICAgIH1cblxuICAgIGxldCB0aXRsZTogc3RyaW5nO1xuICAgIGlmIChhY3RpdmVTcGFjZSkge1xuICAgICAgICB0aXRsZSA9IHNwYWNlTmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aXRsZSA9IGdldE1ldGFTcGFjZU5hbWUoc3BhY2VLZXkgYXMgTWV0YVNwYWNlLCBhbGxSb29tc0luSG9tZSk7XG4gICAgfVxuXG4gICAgY29uc3QgcGVuZGluZ0FjdGlvblN1bW1hcnkgPSBbLi4ucGVuZGluZ0FjdGlvbnMuZW50cmllcygpXVxuICAgICAgICAuZmlsdGVyKChbdHlwZSwga2V5c10pID0+IGtleXMuc2l6ZSA+IDApXG4gICAgICAgIC5tYXAoKFt0eXBlLCBrZXlzXSkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBQZW5kaW5nQWN0aW9uVHlwZS5Kb2luUm9vbTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiQ3VycmVudGx5IGpvaW5pbmcgJShjb3VudClzIHJvb21zXCIsIHsgY291bnQ6IGtleXMuc2l6ZSB9KTtcbiAgICAgICAgICAgICAgICBjYXNlIFBlbmRpbmdBY3Rpb25UeXBlLkJ1bGtSZWRhY3Q6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdChcIkN1cnJlbnRseSByZW1vdmluZyBtZXNzYWdlcyBpbiAlKGNvdW50KXMgcm9vbXNcIiwgeyBjb3VudDoga2V5cy5zaXplIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuam9pbihcIlxcblwiKTtcblxuICAgIGxldCBjb250ZXh0TWVudUJ1dHRvbjogSlNYLkVsZW1lbnQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21MaXN0SGVhZGVyX2NvbnRleHRMZXNzVGl0bGVcIj57IHRpdGxlIH08L2Rpdj47XG4gICAgaWYgKGNhblNob3dNYWluTWVudSkge1xuICAgICAgICBjb250ZXh0TWVudUJ1dHRvbiA9IDxDb250ZXh0TWVudVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgIGlucHV0UmVmPXttYWluTWVudUhhbmRsZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29wZW5NYWluTWVudX1cbiAgICAgICAgICAgIGlzRXhwYW5kZWQ9e21haW5NZW51RGlzcGxheWVkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUxpc3RIZWFkZXJfY29udGV4dE1lbnVCdXR0b25cIlxuICAgICAgICAgICAgdGl0bGU9e2FjdGl2ZVNwYWNlXG4gICAgICAgICAgICAgICAgPyBfdChcIiUoc3BhY2VOYW1lKXMgbWVudVwiLCB7IHNwYWNlTmFtZSB9KVxuICAgICAgICAgICAgICAgIDogX3QoXCJIb21lIG9wdGlvbnNcIil9XG4gICAgICAgID5cbiAgICAgICAgICAgIHsgdGl0bGUgfVxuICAgICAgICA8L0NvbnRleHRNZW51VG9vbHRpcEJ1dHRvbj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbUxpc3RIZWFkZXJcIj5cbiAgICAgICAgeyBjb250ZXh0TWVudUJ1dHRvbiB9XG4gICAgICAgIHsgcGVuZGluZ0FjdGlvblN1bW1hcnkgP1xuICAgICAgICAgICAgPFRvb2x0aXBUYXJnZXQgbGFiZWw9e3BlbmRpbmdBY3Rpb25TdW1tYXJ5fT48SW5saW5lU3Bpbm5lciAvPjwvVG9vbHRpcFRhcmdldD4gOlxuICAgICAgICAgICAgbnVsbCB9XG4gICAgICAgIHsgY2FuU2hvd1BsdXNNZW51ICYmIDxDb250ZXh0TWVudVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgIGlucHV0UmVmPXtwbHVzTWVudUhhbmRsZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29wZW5QbHVzTWVudX1cbiAgICAgICAgICAgIGlzRXhwYW5kZWQ9e3BsdXNNZW51RGlzcGxheWVkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUxpc3RIZWFkZXJfcGx1c0J1dHRvblwiXG4gICAgICAgICAgICB0aXRsZT17X3QoXCJBZGRcIil9XG4gICAgICAgIC8+IH1cblxuICAgICAgICB7IGNvbnRleHRNZW51IH1cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBSb29tTGlzdEhlYWRlcjtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBT0E7O0FBQ0E7O0FBT0E7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXhEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE0Q0EsTUFBTUEsZ0JBQWdCLEdBQUlDLFdBQUQsSUFBMEI7RUFDL0M7RUFDQSxNQUFNQyxJQUFJLEdBQUdELFdBQVcsQ0FBQ0MsSUFBWixHQUFtQkMsTUFBTSxDQUFDQyxPQUF2QztFQUNBLE1BQU1DLEdBQUcsR0FBR0osV0FBVyxDQUFDSyxNQUFaLEdBQXFCSCxNQUFNLENBQUNJLE9BQTVCLEdBQXNDLEVBQWxEO0VBQ0EsTUFBTUMsV0FBVyxHQUFHQyx3QkFBQSxDQUFZQyxJQUFoQztFQUNBLE9BQU87SUFBRVIsSUFBRjtJQUFRRyxHQUFSO0lBQWFHO0VBQWIsQ0FBUDtBQUNILENBTkQsQyxDQVFBOzs7SUFDS0csaUI7O1dBQUFBLGlCO0VBQUFBLGlCLENBQUFBLGlCO0VBQUFBLGlCLENBQUFBLGlCO0dBQUFBLGlCLEtBQUFBLGlCOztBQUtMLE1BQU1DLGlCQUFpQixHQUFHLE1BQTJDO0VBQ2pFLE1BQU1DLEdBQUcsR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFB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