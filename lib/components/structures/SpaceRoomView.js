"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _event = require("matrix-js-sdk/src/@types/event");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _logger = require("matrix-js-sdk/src/logger");

var _room = require("matrix-js-sdk/src/models/room");

var _react = _interopRequireWildcard(require("react"));

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _createRoom = _interopRequireDefault(require("../../createRoom"));

var _UIComponents = require("../../customisations/helpers/UIComponents");

var _actions = require("../../dispatcher/actions");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var Email = _interopRequireWildcard(require("../../email"));

var _useEventEmitter = require("../../hooks/useEventEmitter");

var _useRoomMembers = require("../../hooks/useRoomMembers");

var _useSettings = require("../../hooks/useSettings");

var _useStateArray = require("../../hooks/useStateArray");

var _languageHandler = require("../../languageHandler");

var _PosthogTrackers = _interopRequireDefault(require("../../PosthogTrackers"));

var _RoomInvite = require("../../RoomInvite");

var _UIFeature = require("../../settings/UIFeature");

var _AsyncStore = require("../../stores/AsyncStore");

var _RightPanelStore = _interopRequireDefault(require("../../stores/right-panel/RightPanelStore"));

var _RightPanelStorePhases = require("../../stores/right-panel/RightPanelStorePhases");

var _space = require("../../utils/space");

var _RoomAvatar = _interopRequireDefault(require("../views/avatars/RoomAvatar"));

var _BetaCard = require("../views/beta/BetaCard");

var _IconizedContextMenu = _interopRequireWildcard(require("../views/context_menus/IconizedContextMenu"));

var _AddExistingToSpaceDialog = require("../views/dialogs/AddExistingToSpaceDialog");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../views/elements/AccessibleTooltipButton"));

var _ErrorBoundary = _interopRequireDefault(require("../views/elements/ErrorBoundary"));

var _Field = _interopRequireDefault(require("../views/elements/Field"));

var _RoomFacePile = _interopRequireDefault(require("../views/elements/RoomFacePile"));

var _RoomName = _interopRequireDefault(require("../views/elements/RoomName"));

var _RoomTopic = _interopRequireDefault(require("../views/elements/RoomTopic"));

var _Validation = _interopRequireDefault(require("../views/elements/Validation"));

var _RoomInfoLine = _interopRequireDefault(require("../views/rooms/RoomInfoLine"));

var _RoomPreviewCard = _interopRequireDefault(require("../views/rooms/RoomPreviewCard"));

var _SpaceCreateMenu = require("../views/spaces/SpaceCreateMenu");

var _SpacePublicShare = _interopRequireDefault(require("../views/spaces/SpacePublicShare"));

var _ContextMenu = require("./ContextMenu");

var _MainSplit = _interopRequireDefault(require("./MainSplit"));

var _RightPanel = _interopRequireDefault(require("./RightPanel"));

var _SpaceHierarchy = _interopRequireWildcard(require("./SpaceHierarchy"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021-2022 The Matrix.org Foundation C.I.C.

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
var Phase;

(function (Phase) {
  Phase[Phase["Landing"] = 0] = "Landing";
  Phase[Phase["PublicCreateRooms"] = 1] = "PublicCreateRooms";
  Phase[Phase["PublicShare"] = 2] = "PublicShare";
  Phase[Phase["PrivateScope"] = 3] = "PrivateScope";
  Phase[Phase["PrivateInvite"] = 4] = "PrivateInvite";
  Phase[Phase["PrivateCreateRooms"] = 5] = "PrivateCreateRooms";
  Phase[Phase["PrivateExistingRooms"] = 6] = "PrivateExistingRooms";
})(Phase || (Phase = {}));

const SpaceLandingAddButton = _ref => {
  let {
    space
  } = _ref;
  const [menuDisplayed, handle, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  const canCreateRoom = (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.CreateRooms);
  const canCreateSpace = (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.CreateSpaces);
  const videoRoomsEnabled = (0, _useSettings.useFeatureEnabled)("feature_video_rooms");
  let contextMenu;

  if (menuDisplayed) {
    const rect = handle.current.getBoundingClientRect();
    contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, {
      left: rect.left + window.scrollX + 0,
      top: rect.bottom + window.scrollY + 8,
      chevronFace: _ContextMenu.ChevronFace.None,
      onFinished: closeMenu,
      className: "mx_RoomTile_contextMenu",
      compact: true
    }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
      first: true
    }, canCreateRoom && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("New room"),
      iconClassName: "mx_RoomList_iconNewRoom",
      onClick: async e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();

        _PosthogTrackers.default.trackInteraction("WebSpaceHomeCreateRoomButton", e);

        if (await (0, _space.showCreateNewRoom)(space)) {
          _dispatcher.default.fire(_actions.Action.UpdateSpaceHierarchy);
        }
      }
    }), videoRoomsEnabled && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("New video room"),
      iconClassName: "mx_RoomList_iconNewVideoRoom",
      onClick: async e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();

        if (await (0, _space.showCreateNewRoom)(space, _event.RoomType.ElementVideo)) {
          _dispatcher.default.fire(_actions.Action.UpdateSpaceHierarchy);
        }
      }
    }, /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, null))), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("Add existing room"),
      iconClassName: "mx_RoomList_iconAddExistingRoom",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        (0, _space.showAddExistingRooms)(space);
      }
    }), canCreateSpace && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("Add space"),
      iconClassName: "mx_RoomList_iconPlus",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        (0, _space.showCreateNewSubspace)(space);
      }
    }, /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, null))));
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
    kind: "primary",
    inputRef: handle,
    onClick: openMenu,
    isExpanded: menuDisplayed,
    label: (0, _languageHandler._t)("Add")
  }, (0, _languageHandler._t)("Add")), contextMenu);
};

const SpaceLanding = _ref2 => {
  let {
    space
  } = _ref2;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const myMembership = (0, _useRoomMembers.useMyRoomMembership)(space);
  const userId = cli.getUserId();
  const storeIsShowingSpaceMembers = (0, _react.useCallback)(() => _RightPanelStore.default.instance.isOpenForRoom(space.roomId) && _RightPanelStore.default.instance.currentCardForRoom(space.roomId)?.phase === _RightPanelStorePhases.RightPanelPhases.SpaceMemberList, [space.roomId]);
  const isShowingMembers = (0, _useEventEmitter.useEventEmitterState)(_RightPanelStore.default.instance, _AsyncStore.UPDATE_EVENT, storeIsShowingSpaceMembers);
  let inviteButton;

  if ((0, _space.shouldShowSpaceInvite)(space) && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.InviteUsers)) {
    inviteButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_SpaceRoomView_landing_inviteButton",
      onClick: () => {
        (0, _space.showSpaceInvite)(space);
      }
    }, (0, _languageHandler._t)("Invite"));
  }

  const hasAddRoomPermissions = myMembership === "join" && space.currentState.maySendStateEvent(_event.EventType.SpaceChild, userId);
  let addRoomButton;

  if (hasAddRoomPermissions) {
    addRoomButton = /*#__PURE__*/_react.default.createElement(SpaceLandingAddButton, {
      space: space
    });
  }

  let settingsButton;

  if ((0, _space.shouldShowSpaceSettings)(space)) {
    settingsButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_SpaceRoomView_landing_settingsButton",
      onClick: () => {
        (0, _space.showSpaceSettings)(space);
      },
      title: (0, _languageHandler._t)("Settings")
    });
  }

  const onMembersClick = () => {
    _RightPanelStore.default.instance.setCard({
      phase: _RightPanelStorePhases.RightPanelPhases.SpaceMemberList
    });
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing_header"
  }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
    room: space,
    height: 80,
    width: 80,
    viewAvatarOnClick: true
  }), /*#__PURE__*/_react.default.createElement(_SpaceCreateMenu.SpaceFeedbackPrompt, null)), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing_name"
  }, /*#__PURE__*/_react.default.createElement(_RoomName.default, {
    room: space
  }, name => {
    const tags = {
      name: () => /*#__PURE__*/_react.default.createElement("h1", null, name)
    };
    return (0, _languageHandler._t)("Welcome to <name/>", {}, tags);
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing_infoBar"
  }, /*#__PURE__*/_react.default.createElement(_RoomInfoLine.default, {
    room: space
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_landing_infoBar_interactive"
  }, /*#__PURE__*/_react.default.createElement(_RoomFacePile.default, {
    room: space,
    onlyKnownUsers: false,
    numShown: 7,
    onClick: isShowingMembers ? undefined : onMembersClick
  }), inviteButton, settingsButton)), /*#__PURE__*/_react.default.createElement(_RoomTopic.default, {
    room: space,
    className: "mx_SpaceRoomView_landing_topic"
  }), /*#__PURE__*/_react.default.createElement(_SpaceHierarchy.default, {
    space: space,
    showRoom: _SpaceHierarchy.showRoom,
    additionalButtons: addRoomButton
  }));
};

const SpaceSetupFirstRooms = _ref3 => {
  let {
    space,
    title,
    description,
    onFinished
  } = _ref3;
  const [busy, setBusy] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)("");
  const numFields = 3;
  const placeholders = [(0, _languageHandler._t)("General"), (0, _languageHandler._t)("Random"), (0, _languageHandler._t)("Support")];
  const [roomNames, setRoomName] = (0, _useStateArray.useStateArray)(numFields, [(0, _languageHandler._t)("General"), (0, _languageHandler._t)("Random"), ""]);
  const fields = new Array(numFields).fill(0).map((x, i) => {
    const name = "roomName" + i;
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      key: name,
      name: name,
      type: "text",
      label: (0, _languageHandler._t)("Room name"),
      placeholder: placeholders[i],
      value: roomNames[i],
      onChange: ev => setRoomName(i, ev.target.value),
      autoFocus: i === 2,
      disabled: busy,
      autoComplete: "off"
    });
  });

  const onNextClick = async ev => {
    ev.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);

    try {
      const isPublic = space.getJoinRule() === _partials.JoinRule.Public;

      const filteredRoomNames = roomNames.map(name => name.trim()).filter(Boolean);
      const roomIds = await Promise.all(filteredRoomNames.map(name => {
        return (0, _createRoom.default)({
          createOpts: {
            preset: isPublic ? _partials.Preset.PublicChat : _partials.Preset.PrivateChat,
            name
          },
          spinner: false,
          encryption: false,
          andView: false,
          inlineErrors: true,
          parentSpace: space,
          joinRule: !isPublic ? _partials.JoinRule.Restricted : undefined,
          suggested: true
        });
      }));
      onFinished(roomIds[0]);
    } catch (e) {
      _logger.logger.error("Failed to create initial space rooms", e);

      setError((0, _languageHandler._t)("Failed to create initial space rooms"));
    }

    setBusy(false);
  };

  let onClick = ev => {
    ev.preventDefault();
    onFinished();
  };

  let buttonLabel = (0, _languageHandler._t)("Skip for now");

  if (roomNames.some(name => name.trim())) {
    onClick = onNextClick;
    buttonLabel = busy ? (0, _languageHandler._t)("Creating rooms...") : (0, _languageHandler._t)("Continue");
  }

  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", null, title), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, description), error && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_errorText"
  }, error), /*#__PURE__*/_react.default.createElement("form", {
    onSubmit: onClick,
    id: "mx_SpaceSetupFirstRooms"
  }, fields), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    disabled: busy,
    onClick: onClick,
    element: "input",
    type: "submit",
    form: "mx_SpaceSetupFirstRooms",
    value: buttonLabel
  })));
};

const SpaceAddExistingRooms = _ref4 => {
  let {
    space,
    onFinished
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("What do you want to organise?")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, (0, _languageHandler._t)("Pick rooms or conversations to add. This is just a space for you, " + "no one will be informed. You can add more later.")), /*#__PURE__*/_react.default.createElement(_AddExistingToSpaceDialog.AddExistingToSpace, {
    space: space,
    emptySelectionButton: /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: onFinished
    }, (0, _languageHandler._t)("Skip for now")),
    filterPlaceholder: (0, _languageHandler._t)("Search for rooms or spaces"),
    onFinished: onFinished,
    roomsRenderer: _AddExistingToSpaceDialog.defaultRoomsRenderer,
    dmsRenderer: _AddExistingToSpaceDialog.defaultDmsRenderer
  }));
};

const SpaceSetupPublicShare = _ref5 => {
  let {
    justCreatedOpts,
    space,
    onFinished,
    firstRoomId
  } = _ref5;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_publicShare"
  }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Share %(name)s", {
    name: justCreatedOpts?.createOpts?.name || space.name
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, (0, _languageHandler._t)("It's just you at the moment, it will be even better with others.")), /*#__PURE__*/_react.default.createElement(_SpacePublicShare.default, {
    space: space
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    onClick: onFinished
  }, firstRoomId ? (0, _languageHandler._t)("Go to my first room") : (0, _languageHandler._t)("Go to my space"))));
};

const SpaceSetupPrivateScope = _ref6 => {
  let {
    space,
    justCreatedOpts,
    onFinished
  } = _ref6;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_privateScope"
  }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Who are you working with?")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, (0, _languageHandler._t)("Make sure the right people have access to %(name)s", {
    name: justCreatedOpts?.createOpts?.name || space.name
  })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpaceRoomView_privateScope_justMeButton",
    onClick: () => {
      onFinished(false);
    }
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Just me")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("A private space to organise your rooms"))), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpaceRoomView_privateScope_meAndMyTeammatesButton",
    onClick: () => {
      onFinished(true);
    }
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Me and my teammates")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("A private space for you and your teammates"))));
};

const validateEmailRules = (0, _Validation.default)({
  rules: [{
    key: "email",
    test: _ref7 => {
      let {
        value
      } = _ref7;
      return !value || Email.looksValid(value);
    },
    invalid: () => (0, _languageHandler._t)("Doesn't look like a valid email address")
  }]
});

const SpaceSetupPrivateInvite = _ref8 => {
  let {
    space,
    onFinished
  } = _ref8;
  const [busy, setBusy] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)("");
  const numFields = 3;
  const fieldRefs = [(0, _react.useRef)(), (0, _react.useRef)(), (0, _react.useRef)()];
  const [emailAddresses, setEmailAddress] = (0, _useStateArray.useStateArray)(numFields, "");
  const fields = new Array(numFields).fill(0).map((x, i) => {
    const name = "emailAddress" + i;
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      key: name,
      name: name,
      type: "text",
      label: (0, _languageHandler._t)("Email address"),
      placeholder: (0, _languageHandler._t)("Email"),
      value: emailAddresses[i],
      onChange: ev => setEmailAddress(i, ev.target.value),
      ref: fieldRefs[i],
      onValidate: validateEmailRules,
      autoFocus: i === 0,
      disabled: busy
    });
  });

  const onNextClick = async ev => {
    ev.preventDefault();
    if (busy) return;
    setError("");

    for (let i = 0; i < fieldRefs.length; i++) {
      const fieldRef = fieldRefs[i];
      const valid = await fieldRef.current.validate({
        allowEmpty: true
      });

      if (valid === false) {
        // true/null are allowed
        fieldRef.current.focus();
        fieldRef.current.validate({
          allowEmpty: true,
          focused: true
        });
        return;
      }
    }

    setBusy(true);
    const targetIds = emailAddresses.map(name => name.trim()).filter(Boolean);

    try {
      const result = await (0, _RoomInvite.inviteMultipleToRoom)(space.roomId, targetIds);
      const failedUsers = Object.keys(result.states).filter(a => result.states[a] === "error");

      if (failedUsers.length > 0) {
        _logger.logger.log("Failed to invite users to space: ", result);

        setError((0, _languageHandler._t)("Failed to invite the following users to your space: %(csvUsers)s", {
          csvUsers: failedUsers.join(", ")
        }));
      } else {
        onFinished();
      }
    } catch (err) {
      _logger.logger.error("Failed to invite users to space: ", err);

      setError((0, _languageHandler._t)("We couldn't invite those users. Please check the users you want to invite and try again."));
    }

    setBusy(false);
  };

  let onClick = ev => {
    ev.preventDefault();
    onFinished();
  };

  let buttonLabel = (0, _languageHandler._t)("Skip for now");

  if (emailAddresses.some(name => name.trim())) {
    onClick = onNextClick;
    buttonLabel = busy ? (0, _languageHandler._t)("Inviting...") : (0, _languageHandler._t)("Continue");
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_inviteTeammates"
  }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Invite your teammates")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_description"
  }, (0, _languageHandler._t)("Make sure the right people have access. You can invite more later.")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_inviteTeammates_betaDisclaimer"
  }, (0, _languageHandler._t)("<b>This is an experimental feature.</b> For now, " + "new users receiving an invite will have to open the invite on <link/> to actually join.", {}, {
    b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub),
    link: () => /*#__PURE__*/_react.default.createElement("a", {
      href: "https://app.element.io/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "app.element.io")
  })), error && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_errorText"
  }, error), /*#__PURE__*/_react.default.createElement("form", {
    onSubmit: onClick,
    id: "mx_SpaceSetupPrivateInvite"
  }, fields), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_inviteTeammates_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_SpaceRoomView_inviteTeammates_inviteDialogButton",
    onClick: () => (0, _RoomInvite.showRoomInviteDialog)(space.roomId)
  }, (0, _languageHandler._t)("Invite by username"))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_buttons"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    disabled: busy,
    onClick: onClick,
    element: "input",
    type: "submit",
    form: "mx_SpaceSetupPrivateInvite",
    value: buttonLabel
  })));
};

class SpaceRoomView extends _react.default.PureComponent {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "creator", void 0);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onMyMembership", (room, myMembership) => {
      if (room.roomId === this.props.space.roomId) {
        this.setState({
          myMembership
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRightPanelStoreUpdate", () => {
      this.setState({
        showRightPanel: _RightPanelStore.default.instance.isOpenForRoom(this.props.space.roomId)
      });
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === _actions.Action.ViewRoom && payload.room_id === this.props.space.roomId) {
        this.setState({
          phase: Phase.Landing
        });
        return;
      }

      if (payload.action !== _actions.Action.ViewUser && payload.action !== "view_3pid_invite") return;

      if (payload.action === _actions.Action.ViewUser && payload.member) {
        const spaceMemberInfoCard = {
          phase: _RightPanelStorePhases.RightPanelPhases.SpaceMemberInfo,
          state: {
            spaceId: this.props.space.roomId,
            member: payload.member
          }
        };

        if (payload.push) {
          _RightPanelStore.default.instance.pushCard(spaceMemberInfoCard);
        } else {
          _RightPanelStore.default.instance.setCards([{
            phase: _RightPanelStorePhases.RightPanelPhases.SpaceMemberList,
            state: {
              spaceId: this.props.space.roomId
            }
          }, spaceMemberInfoCard]);
        }
      } else if (payload.action === "view_3pid_invite" && payload.event) {
        _RightPanelStore.default.instance.setCard({
          phase: _RightPanelStorePhases.RightPanelPhases.Space3pidMemberInfo,
          state: {
            spaceId: this.props.space.roomId,
            memberInfoEvent: payload.event
          }
        });
      } else {
        _RightPanelStore.default.instance.setCard({
          phase: _RightPanelStorePhases.RightPanelPhases.SpaceMemberList,
          state: {
            spaceId: this.props.space.roomId
          }
        });
      }
    });
    (0, _defineProperty2.default)(this, "goToFirstRoom", async () => {
      if (this.state.firstRoomId) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: this.state.firstRoomId,
          metricsTrigger: undefined // other

        });

        return;
      }

      this.setState({
        phase: Phase.Landing
      });
    });
    let phase = Phase.Landing;
    this.creator = this.props.space.currentState.getStateEvents(_event.EventType.RoomCreate, "")?.getSender();
    const showSetup = this.props.justCreatedOpts && context.getUserId() === this.creator;

    if (showSetup) {
      phase = this.props.justCreatedOpts.createOpts.preset === _partials.Preset.PublicChat ? Phase.PublicCreateRooms : Phase.PrivateScope;
    }

    this.state = {
      phase,
      showRightPanel: _RightPanelStore.default.instance.isOpenForRoom(this.props.space.roomId),
      myMembership: this.props.space.getMyMembership()
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _RightPanelStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.onRightPanelStoreUpdate);
  }

  componentDidMount() {
    this.context.on(_room.RoomEvent.MyMembership, this.onMyMembership);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    _RightPanelStore.default.instance.off(_AsyncStore.UPDATE_EVENT, this.onRightPanelStoreUpdate);

    this.context.off(_room.RoomEvent.MyMembership, this.onMyMembership);
  }

  renderBody() {
    switch (this.state.phase) {
      case Phase.Landing:
        if (this.state.myMembership === "join") {
          return /*#__PURE__*/_react.default.createElement(SpaceLanding, {
            space: this.props.space
          });
        } else {
          return /*#__PURE__*/_react.default.createElement(_RoomPreviewCard.default, {
            room: this.props.space,
            onJoinButtonClicked: this.props.onJoinButtonClicked,
            onRejectButtonClicked: this.props.onRejectButtonClicked
          });
        }

      case Phase.PublicCreateRooms:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupFirstRooms, {
          space: this.props.space,
          title: (0, _languageHandler._t)("What are some things you want to discuss in %(spaceName)s?", {
            spaceName: this.props.justCreatedOpts?.createOpts?.name || this.props.space.name
          }),
          description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("Let's create a room for each of them."), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("You can add more later too, including already existing ones.")),
          onFinished: firstRoomId => this.setState({
            phase: Phase.PublicShare,
            firstRoomId
          })
        });

      case Phase.PublicShare:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupPublicShare, {
          justCreatedOpts: this.props.justCreatedOpts,
          space: this.props.space,
          onFinished: this.goToFirstRoom,
          firstRoomId: this.state.firstRoomId
        });

      case Phase.PrivateScope:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupPrivateScope, {
          space: this.props.space,
          justCreatedOpts: this.props.justCreatedOpts,
          onFinished: invite => {
            this.setState({
              phase: invite ? Phase.PrivateCreateRooms : Phase.PrivateExistingRooms
            });
          }
        });

      case Phase.PrivateInvite:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupPrivateInvite, {
          space: this.props.space,
          onFinished: () => this.setState({
            phase: Phase.Landing
          })
        });

      case Phase.PrivateCreateRooms:
        return /*#__PURE__*/_react.default.createElement(SpaceSetupFirstRooms, {
          space: this.props.space,
          title: (0, _languageHandler._t)("What projects are your team working on?"),
          description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("We'll create rooms for each of them."), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("You can add more later too, including already existing ones.")),
          onFinished: firstRoomId => this.setState({
            phase: Phase.PrivateInvite,
            firstRoomId
          })
        });

      case Phase.PrivateExistingRooms:
        return /*#__PURE__*/_react.default.createElement(SpaceAddExistingRooms, {
          space: this.props.space,
          onFinished: () => this.setState({
            phase: Phase.Landing
          })
        });
    }
  }

  render() {
    const rightPanel = this.state.showRightPanel && this.state.phase === Phase.Landing ? /*#__PURE__*/_react.default.createElement(_RightPanel.default, {
      room: this.props.space,
      resizeNotifier: this.props.resizeNotifier
    }) : null;
    return /*#__PURE__*/_react.default.createElement("main", {
      className: "mx_SpaceRoomView"
    }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_MainSplit.default, {
      panel: rightPanel,
      resizeNotifier: this.props.resizeNotifier
    }, this.renderBody())));
  }

}

exports.default = SpaceRoomView;
(0, _defineProperty2.default)(SpaceRoomView, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGFzZSIsIlNwYWNlTGFuZGluZ0FkZEJ1dHRvbiIsInNwYWNlIiwibWVudURpc3BsYXllZCIsImhhbmRsZSIsIm9wZW5NZW51IiwiY2xvc2VNZW51IiwidXNlQ29udGV4dE1lbnUiLCJjYW5DcmVhdGVSb29tIiwic2hvdWxkU2hvd0NvbXBvbmVudCIsIlVJQ29tcG9uZW50IiwiQ3JlYXRlUm9vbXMiLCJjYW5DcmVhdGVTcGFjZSIsIkNyZWF0ZVNwYWNlcyIsInZpZGVvUm9vbXNFbmFibGVkIiwidXNlRmVhdHVyZUVuYWJsZWQiLCJjb250ZXh0TWVudSIsInJlY3QiLCJjdXJyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwibGVmdCIsIndpbmRvdyIsInNjcm9sbFgiLCJib3R0b20iLCJzY3JvbGxZIiwiQ2hldnJvbkZhY2UiLCJOb25lIiwiX3QiLCJlIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJQb3N0aG9nVHJhY2tlcnMiLCJ0cmFja0ludGVyYWN0aW9uIiwic2hvd0NyZWF0ZU5ld1Jvb20iLCJkZWZhdWx0RGlzcGF0Y2hlciIsImZpcmUiLCJBY3Rpb24iLCJVcGRhdGVTcGFjZUhpZXJhcmNoeSIsIlJvb21UeXBlIiwiRWxlbWVudFZpZGVvIiwic2hvd0FkZEV4aXN0aW5nUm9vbXMiLCJzaG93Q3JlYXRlTmV3U3Vic3BhY2UiLCJTcGFjZUxhbmRpbmciLCJjbGkiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIm15TWVtYmVyc2hpcCIsInVzZU15Um9vbU1lbWJlcnNoaXAiLCJ1c2VySWQiLCJnZXRVc2VySWQiLCJzdG9yZUlzU2hvd2luZ1NwYWNlTWVtYmVycyIsInVzZUNhbGxiYWNrIiwiUmlnaHRQYW5lbFN0b3JlIiwiaW5zdGFuY2UiLCJpc09wZW5Gb3JSb29tIiwicm9vbUlkIiwiY3VycmVudENhcmRGb3JSb29tIiwicGhhc2UiLCJSaWdodFBhbmVsUGhhc2VzIiwiU3BhY2VNZW1iZXJMaXN0IiwiaXNTaG93aW5nTWVtYmVycyIsInVzZUV2ZW50RW1pdHRlclN0YXRlIiwiVVBEQVRFX0VWRU5UIiwiaW52aXRlQnV0dG9uIiwic2hvdWxkU2hvd1NwYWNlSW52aXRlIiwiSW52aXRlVXNlcnMiLCJzaG93U3BhY2VJbnZpdGUiLCJoYXNBZGRSb29tUGVybWlzc2lvbnMiLCJjdXJyZW50U3RhdGUiLCJtYXlTZW5kU3RhdGVFdmVudCIsIkV2ZW50VHlwZSIsIlNwYWNlQ2hpbGQiLCJhZGRSb29tQnV0dG9uIiwic2V0dGluZ3NCdXR0b24iLCJzaG91bGRTaG93U3BhY2VTZXR0aW5ncyIsInNob3dTcGFjZVNldHRpbmdzIiwib25NZW1iZXJzQ2xpY2siLCJzZXRDYXJkIiwibmFtZSIsInRhZ3MiLCJ1bmRlZmluZWQiLCJzaG93Um9vbSIsIlNwYWNlU2V0dXBGaXJzdFJvb21zIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm9uRmluaXNoZWQiLCJidXN5Iiwic2V0QnVzeSIsInVzZVN0YXRlIiwiZXJyb3IiLCJzZXRFcnJvciIsIm51bUZpZWxkcyIsInBsYWNlaG9sZGVycyIsInJvb21OYW1lcyIsInNldFJvb21OYW1lIiwidXNlU3RhdGVBcnJheSIsImZpZWxkcyIsIkFycmF5IiwiZmlsbCIsIm1hcCIsIngiLCJpIiwiZXYiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uTmV4dENsaWNrIiwiaXNQdWJsaWMiLCJnZXRKb2luUnVsZSIsIkpvaW5SdWxlIiwiUHVibGljIiwiZmlsdGVyZWRSb29tTmFtZXMiLCJ0cmltIiwiZmlsdGVyIiwiQm9vbGVhbiIsInJvb21JZHMiLCJQcm9taXNlIiwiYWxsIiwiY3JlYXRlUm9vbSIsImNyZWF0ZU9wdHMiLCJwcmVzZXQiLCJQcmVzZXQiLCJQdWJsaWNDaGF0IiwiUHJpdmF0ZUNoYXQiLCJzcGlubmVyIiwiZW5jcnlwdGlvbiIsImFuZFZpZXciLCJpbmxpbmVFcnJvcnMiLCJwYXJlbnRTcGFjZSIsImpvaW5SdWxlIiwiUmVzdHJpY3RlZCIsInN1Z2dlc3RlZCIsImxvZ2dlciIsIm9uQ2xpY2siLCJidXR0b25MYWJlbCIsInNvbWUiLCJTcGFjZUFkZEV4aXN0aW5nUm9vbXMiLCJkZWZhdWx0Um9vbXNSZW5kZXJlciIsImRlZmF1bHREbXNSZW5kZXJlciIsIlNwYWNlU2V0dXBQdWJsaWNTaGFyZSIsImp1c3RDcmVhdGVkT3B0cyIsImZpcnN0Um9vbUlkIiwiU3BhY2VTZXR1cFByaXZhdGVTY29wZSIsInZhbGlkYXRlRW1haWxSdWxlcyIsIndpdGhWYWxpZGF0aW9uIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiRW1haWwiLCJsb29rc1ZhbGlkIiwiaW52YWxpZCIsIlNwYWNlU2V0dXBQcml2YXRlSW52aXRlIiwiZmllbGRSZWZzIiwidXNlUmVmIiwiZW1haWxBZGRyZXNzZXMiLCJzZXRFbWFpbEFkZHJlc3MiLCJsZW5ndGgiLCJmaWVsZFJlZiIsInZhbGlkIiwidmFsaWRhdGUiLCJhbGxvd0VtcHR5IiwiZm9jdXMiLCJmb2N1c2VkIiwidGFyZ2V0SWRzIiwicmVzdWx0IiwiaW52aXRlTXVsdGlwbGVUb1Jvb20iLCJmYWlsZWRVc2VycyIsIk9iamVjdCIsImtleXMiLCJzdGF0ZXMiLCJhIiwibG9nIiwiY3N2VXNlcnMiLCJqb2luIiwiZXJyIiwiYiIsInN1YiIsImxpbmsiLCJzaG93Um9vbUludml0ZURpYWxvZyIsIlNwYWNlUm9vbVZpZXciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInJvb20iLCJzZXRTdGF0ZSIsInNob3dSaWdodFBhbmVsIiwicGF5bG9hZCIsImFjdGlvbiIsIlZpZXdSb29tIiwicm9vbV9pZCIsIkxhbmRpbmciLCJWaWV3VXNlciIsIm1lbWJlciIsInNwYWNlTWVtYmVySW5mb0NhcmQiLCJTcGFjZU1lbWJlckluZm8iLCJzdGF0ZSIsInNwYWNlSWQiLCJwdXNoIiwicHVzaENhcmQiLCJzZXRDYXJkcyIsImV2ZW50IiwiU3BhY2UzcGlkTWVtYmVySW5mbyIsIm1lbWJlckluZm9FdmVudCIsImRpc3BhdGNoIiwibWV0cmljc1RyaWdnZXIiLCJjcmVhdG9yIiwiZ2V0U3RhdGVFdmVudHMiLCJSb29tQ3JlYXRlIiwiZ2V0U2VuZGVyIiwic2hvd1NldHVwIiwiUHVibGljQ3JlYXRlUm9vbXMiLCJQcml2YXRlU2NvcGUiLCJnZXRNeU1lbWJlcnNoaXAiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsIm9uIiwib25SaWdodFBhbmVsU3RvcmVVcGRhdGUiLCJjb21wb25lbnREaWRNb3VudCIsIlJvb21FdmVudCIsIk15TWVtYmVyc2hpcCIsIm9uTXlNZW1iZXJzaGlwIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwib2ZmIiwicmVuZGVyQm9keSIsIm9uSm9pbkJ1dHRvbkNsaWNrZWQiLCJvblJlamVjdEJ1dHRvbkNsaWNrZWQiLCJzcGFjZU5hbWUiLCJQdWJsaWNTaGFyZSIsImdvVG9GaXJzdFJvb20iLCJpbnZpdGUiLCJQcml2YXRlQ3JlYXRlUm9vbXMiLCJQcml2YXRlRXhpc3RpbmdSb29tcyIsIlByaXZhdGVJbnZpdGUiLCJyZW5kZXIiLCJyaWdodFBhbmVsIiwicmVzaXplTm90aWZpZXIiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL1NwYWNlUm9vbVZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMS0yMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgRXZlbnRUeXBlLCBSb29tVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IEpvaW5SdWxlLCBQcmVzZXQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3BhcnRpYWxzXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBSb29tLCBSb29tRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBSZWFjdCwgeyBSZWZPYmplY3QsIHVzZUNhbGxiYWNrLCB1c2VDb250ZXh0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgY3JlYXRlUm9vbSwgeyBJT3B0cyB9IGZyb20gXCIuLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQgeyBzaG91bGRTaG93Q29tcG9uZW50IH0gZnJvbSBcIi4uLy4uL2N1c3RvbWlzYXRpb25zL2hlbHBlcnMvVUlDb21wb25lbnRzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCAqIGFzIEVtYWlsIGZyb20gXCIuLi8uLi9lbWFpbFwiO1xuaW1wb3J0IHsgdXNlRXZlbnRFbWl0dGVyU3RhdGUgfSBmcm9tIFwiLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQgeyB1c2VNeVJvb21NZW1iZXJzaGlwIH0gZnJvbSBcIi4uLy4uL2hvb2tzL3VzZVJvb21NZW1iZXJzXCI7XG5pbXBvcnQgeyB1c2VGZWF0dXJlRW5hYmxlZCB9IGZyb20gXCIuLi8uLi9ob29rcy91c2VTZXR0aW5nc1wiO1xuaW1wb3J0IHsgdXNlU3RhdGVBcnJheSB9IGZyb20gXCIuLi8uLi9ob29rcy91c2VTdGF0ZUFycmF5XCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uLy4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuaW1wb3J0IHsgaW52aXRlTXVsdGlwbGVUb1Jvb20sIHNob3dSb29tSW52aXRlRGlhbG9nIH0gZnJvbSBcIi4uLy4uL1Jvb21JbnZpdGVcIjtcbmltcG9ydCB7IFVJQ29tcG9uZW50IH0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvcmlnaHQtcGFuZWwvUmlnaHRQYW5lbFN0b3JlXCI7XG5pbXBvcnQgeyBJUmlnaHRQYW5lbENhcmQgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZUlQYW5lbFN0YXRlXCI7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcbmltcG9ydCBSZXNpemVOb3RpZmllciBmcm9tIFwiLi4vLi4vdXRpbHMvUmVzaXplTm90aWZpZXJcIjtcbmltcG9ydCB7XG4gICAgc2hvdWxkU2hvd1NwYWNlSW52aXRlLFxuICAgIHNob3VsZFNob3dTcGFjZVNldHRpbmdzLFxuICAgIHNob3dBZGRFeGlzdGluZ1Jvb21zLFxuICAgIHNob3dDcmVhdGVOZXdSb29tLFxuICAgIHNob3dDcmVhdGVOZXdTdWJzcGFjZSxcbiAgICBzaG93U3BhY2VJbnZpdGUsXG4gICAgc2hvd1NwYWNlU2V0dGluZ3MsXG59IGZyb20gXCIuLi8uLi91dGlscy9zcGFjZVwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL3ZpZXdzL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IHsgQmV0YVBpbGwgfSBmcm9tIFwiLi4vdmlld3MvYmV0YS9CZXRhQ2FyZFwiO1xuaW1wb3J0IEljb25pemVkQ29udGV4dE1lbnUsIHtcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uLFxuICAgIEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0LFxufSBmcm9tIFwiLi4vdmlld3MvY29udGV4dF9tZW51cy9JY29uaXplZENvbnRleHRNZW51XCI7XG5pbXBvcnQge1xuICAgIEFkZEV4aXN0aW5nVG9TcGFjZSxcbiAgICBkZWZhdWx0RG1zUmVuZGVyZXIsXG4gICAgZGVmYXVsdFJvb21zUmVuZGVyZXIsXG59IGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0FkZEV4aXN0aW5nVG9TcGFjZURpYWxvZ1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IEVycm9yQm91bmRhcnkgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0Vycm9yQm91bmRhcnlcIjtcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBSb29tRmFjZVBpbGUgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1Jvb21GYWNlUGlsZVwiO1xuaW1wb3J0IFJvb21OYW1lIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9Sb29tTmFtZVwiO1xuaW1wb3J0IFJvb21Ub3BpYyBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvUm9vbVRvcGljXCI7XG5pbXBvcnQgd2l0aFZhbGlkYXRpb24gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1ZhbGlkYXRpb25cIjtcbmltcG9ydCBSb29tSW5mb0xpbmUgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21JbmZvTGluZVwiO1xuaW1wb3J0IFJvb21QcmV2aWV3Q2FyZCBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUm9vbVByZXZpZXdDYXJkXCI7XG5pbXBvcnQgeyBTcGFjZUZlZWRiYWNrUHJvbXB0IH0gZnJvbSBcIi4uL3ZpZXdzL3NwYWNlcy9TcGFjZUNyZWF0ZU1lbnVcIjtcbmltcG9ydCBTcGFjZVB1YmxpY1NoYXJlIGZyb20gXCIuLi92aWV3cy9zcGFjZXMvU3BhY2VQdWJsaWNTaGFyZVwiO1xuaW1wb3J0IHsgQ2hldnJvbkZhY2UsIENvbnRleHRNZW51QnV0dG9uLCB1c2VDb250ZXh0TWVudSB9IGZyb20gXCIuL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgTWFpblNwbGl0IGZyb20gJy4vTWFpblNwbGl0JztcbmltcG9ydCBSaWdodFBhbmVsIGZyb20gXCIuL1JpZ2h0UGFuZWxcIjtcbmltcG9ydCBTcGFjZUhpZXJhcmNoeSwgeyBzaG93Um9vbSB9IGZyb20gXCIuL1NwYWNlSGllcmFyY2h5XCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNwYWNlOiBSb29tO1xuICAgIGp1c3RDcmVhdGVkT3B0cz86IElPcHRzO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICBvbkpvaW5CdXR0b25DbGlja2VkKCk6IHZvaWQ7XG4gICAgb25SZWplY3RCdXR0b25DbGlja2VkKCk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHBoYXNlOiBQaGFzZTtcbiAgICBmaXJzdFJvb21JZD86IHN0cmluZzsgLy8gaW50ZXJuYWwgc3RhdGUgZm9yIHRoZSBjcmVhdGlvbiB3aXphcmRcbiAgICBzaG93UmlnaHRQYW5lbDogYm9vbGVhbjtcbiAgICBteU1lbWJlcnNoaXA6IHN0cmluZztcbn1cblxuZW51bSBQaGFzZSB7XG4gICAgTGFuZGluZyxcbiAgICBQdWJsaWNDcmVhdGVSb29tcyxcbiAgICBQdWJsaWNTaGFyZSxcbiAgICBQcml2YXRlU2NvcGUsXG4gICAgUHJpdmF0ZUludml0ZSxcbiAgICBQcml2YXRlQ3JlYXRlUm9vbXMsXG4gICAgUHJpdmF0ZUV4aXN0aW5nUm9vbXMsXG59XG5cbmNvbnN0IFNwYWNlTGFuZGluZ0FkZEJ1dHRvbiA9ICh7IHNwYWNlIH0pID0+IHtcbiAgICBjb25zdCBbbWVudURpc3BsYXllZCwgaGFuZGxlLCBvcGVuTWVudSwgY2xvc2VNZW51XSA9IHVzZUNvbnRleHRNZW51KCk7XG4gICAgY29uc3QgY2FuQ3JlYXRlUm9vbSA9IHNob3VsZFNob3dDb21wb25lbnQoVUlDb21wb25lbnQuQ3JlYXRlUm9vbXMpO1xuICAgIGNvbnN0IGNhbkNyZWF0ZVNwYWNlID0gc2hvdWxkU2hvd0NvbXBvbmVudChVSUNvbXBvbmVudC5DcmVhdGVTcGFjZXMpO1xuICAgIGNvbnN0IHZpZGVvUm9vbXNFbmFibGVkID0gdXNlRmVhdHVyZUVuYWJsZWQoXCJmZWF0dXJlX3ZpZGVvX3Jvb21zXCIpO1xuXG4gICAgbGV0IGNvbnRleHRNZW51O1xuICAgIGlmIChtZW51RGlzcGxheWVkKSB7XG4gICAgICAgIGNvbnN0IHJlY3QgPSBoYW5kbGUuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29udGV4dE1lbnUgPSA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgbGVmdD17cmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFggKyAwfVxuICAgICAgICAgICAgdG9wPXtyZWN0LmJvdHRvbSArIHdpbmRvdy5zY3JvbGxZICsgOH1cbiAgICAgICAgICAgIGNoZXZyb25GYWNlPXtDaGV2cm9uRmFjZS5Ob25lfVxuICAgICAgICAgICAgb25GaW5pc2hlZD17Y2xvc2VNZW51fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfY29udGV4dE1lbnVcIlxuICAgICAgICAgICAgY29tcGFjdFxuICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgZmlyc3Q+XG4gICAgICAgICAgICAgICAgeyBjYW5DcmVhdGVSb29tICYmIDw+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOZXcgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uTmV3Um9vbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXthc3luYyAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlTWVudSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJTcGFjZUhvbWVDcmVhdGVSb29tQnV0dG9uXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhd2FpdCBzaG93Q3JlYXRlTmV3Um9vbShzcGFjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZmlyZShBY3Rpb24uVXBkYXRlU3BhY2VIaWVyYXJjaHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgdmlkZW9Sb29tc0VuYWJsZWQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOZXcgdmlkZW8gcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfaWNvbk5ld1ZpZGVvUm9vbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1lbnUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXdhaXQgc2hvd0NyZWF0ZU5ld1Jvb20oc3BhY2UsIFJvb21UeXBlLkVsZW1lbnRWaWRlbykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmZpcmUoQWN0aW9uLlVwZGF0ZVNwYWNlSGllcmFyY2h5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJldGFQaWxsIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgIDwvPiB9XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQWRkIGV4aXN0aW5nIHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uQWRkRXhpc3RpbmdSb29tXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dBZGRFeGlzdGluZ1Jvb21zKHNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHsgY2FuQ3JlYXRlU3BhY2UgJiZcbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkFkZCBzcGFjZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uUGx1c1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dDcmVhdGVOZXdTdWJzcGFjZShzcGFjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QmV0YVBpbGwgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudT47XG4gICAgfVxuXG4gICAgcmV0dXJuIDw+XG4gICAgICAgIDxDb250ZXh0TWVudUJ1dHRvblxuICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgaW5wdXRSZWY9e2hhbmRsZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29wZW5NZW51fVxuICAgICAgICAgICAgaXNFeHBhbmRlZD17bWVudURpc3BsYXllZH1cbiAgICAgICAgICAgIGxhYmVsPXtfdChcIkFkZFwiKX1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBfdChcIkFkZFwiKSB9XG4gICAgICAgIDwvQ29udGV4dE1lbnVCdXR0b24+XG4gICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgIDwvPjtcbn07XG5cbmNvbnN0IFNwYWNlTGFuZGluZyA9ICh7IHNwYWNlIH06IHsgc3BhY2U6IFJvb20gfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgbXlNZW1iZXJzaGlwID0gdXNlTXlSb29tTWVtYmVyc2hpcChzcGFjZSk7XG4gICAgY29uc3QgdXNlcklkID0gY2xpLmdldFVzZXJJZCgpO1xuXG4gICAgY29uc3Qgc3RvcmVJc1Nob3dpbmdTcGFjZU1lbWJlcnMgPSB1c2VDYWxsYmFjayhcbiAgICAgICAgKCkgPT4gUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLmlzT3BlbkZvclJvb20oc3BhY2Uucm9vbUlkKVxuICAgICAgICAgICAgJiYgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLmN1cnJlbnRDYXJkRm9yUm9vbShzcGFjZS5yb29tSWQpPy5waGFzZSA9PT0gUmlnaHRQYW5lbFBoYXNlcy5TcGFjZU1lbWJlckxpc3QsXG4gICAgICAgIFtzcGFjZS5yb29tSWRdLFxuICAgICk7XG4gICAgY29uc3QgaXNTaG93aW5nTWVtYmVycyA9IHVzZUV2ZW50RW1pdHRlclN0YXRlKFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZSwgVVBEQVRFX0VWRU5ULCBzdG9yZUlzU2hvd2luZ1NwYWNlTWVtYmVycyk7XG5cbiAgICBsZXQgaW52aXRlQnV0dG9uO1xuICAgIGlmIChzaG91bGRTaG93U3BhY2VJbnZpdGUoc3BhY2UpICYmIHNob3VsZFNob3dDb21wb25lbnQoVUlDb21wb25lbnQuSW52aXRlVXNlcnMpKSB7XG4gICAgICAgIGludml0ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfbGFuZGluZ19pbnZpdGVCdXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvd1NwYWNlSW52aXRlKHNwYWNlKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJJbnZpdGVcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc0FkZFJvb21QZXJtaXNzaW9ucyA9IG15TWVtYmVyc2hpcCA9PT0gXCJqb2luXCIgJiZcbiAgICAgICAgc3BhY2UuY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5TcGFjZUNoaWxkLCB1c2VySWQpO1xuXG4gICAgbGV0IGFkZFJvb21CdXR0b247XG4gICAgaWYgKGhhc0FkZFJvb21QZXJtaXNzaW9ucykge1xuICAgICAgICBhZGRSb29tQnV0dG9uID0gPFNwYWNlTGFuZGluZ0FkZEJ1dHRvbiBzcGFjZT17c3BhY2V9IC8+O1xuICAgIH1cblxuICAgIGxldCBzZXR0aW5nc0J1dHRvbjtcbiAgICBpZiAoc2hvdWxkU2hvd1NwYWNlU2V0dGluZ3Moc3BhY2UpKSB7XG4gICAgICAgIHNldHRpbmdzQnV0dG9uID0gPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2xhbmRpbmdfc2V0dGluZ3NCdXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNob3dTcGFjZVNldHRpbmdzKHNwYWNlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB0aXRsZT17X3QoXCJTZXR0aW5nc1wiKX1cbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgY29uc3Qgb25NZW1iZXJzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5zZXRDYXJkKHsgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2VNZW1iZXJMaXN0IH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2xhbmRpbmdcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2xhbmRpbmdfaGVhZGVyXCI+XG4gICAgICAgICAgICA8Um9vbUF2YXRhciByb29tPXtzcGFjZX0gaGVpZ2h0PXs4MH0gd2lkdGg9ezgwfSB2aWV3QXZhdGFyT25DbGljaz17dHJ1ZX0gLz5cbiAgICAgICAgICAgIDxTcGFjZUZlZWRiYWNrUHJvbXB0IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfbGFuZGluZ19uYW1lXCI+XG4gICAgICAgICAgICA8Um9vbU5hbWUgcm9vbT17c3BhY2V9PlxuICAgICAgICAgICAgICAgIHsgKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFncyA9IHsgbmFtZTogKCkgPT4gPGgxPnsgbmFtZSB9PC9oMT4gfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiV2VsY29tZSB0byA8bmFtZS8+XCIsIHt9LCB0YWdzKSBhcyBKU1guRWxlbWVudDtcbiAgICAgICAgICAgICAgICB9IH1cbiAgICAgICAgICAgIDwvUm9vbU5hbWU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfbGFuZGluZ19pbmZvQmFyXCI+XG4gICAgICAgICAgICA8Um9vbUluZm9MaW5lIHJvb209e3NwYWNlfSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2xhbmRpbmdfaW5mb0Jhcl9pbnRlcmFjdGl2ZVwiPlxuICAgICAgICAgICAgICAgIDxSb29tRmFjZVBpbGVcbiAgICAgICAgICAgICAgICAgICAgcm9vbT17c3BhY2V9XG4gICAgICAgICAgICAgICAgICAgIG9ubHlLbm93blVzZXJzPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgbnVtU2hvd249ezd9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2lzU2hvd2luZ01lbWJlcnMgPyB1bmRlZmluZWQgOiBvbk1lbWJlcnNDbGlja31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHsgaW52aXRlQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHNldHRpbmdzQnV0dG9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPFJvb21Ub3BpYyByb29tPXtzcGFjZX0gY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19sYW5kaW5nX3RvcGljXCIgLz5cblxuICAgICAgICA8U3BhY2VIaWVyYXJjaHkgc3BhY2U9e3NwYWNlfSBzaG93Um9vbT17c2hvd1Jvb219IGFkZGl0aW9uYWxCdXR0b25zPXthZGRSb29tQnV0dG9ufSAvPlxuICAgIDwvZGl2Pjtcbn07XG5cbmNvbnN0IFNwYWNlU2V0dXBGaXJzdFJvb21zID0gKHsgc3BhY2UsIHRpdGxlLCBkZXNjcmlwdGlvbiwgb25GaW5pc2hlZCB9KSA9PiB7XG4gICAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgbnVtRmllbGRzID0gMztcbiAgICBjb25zdCBwbGFjZWhvbGRlcnMgPSBbX3QoXCJHZW5lcmFsXCIpLCBfdChcIlJhbmRvbVwiKSwgX3QoXCJTdXBwb3J0XCIpXTtcbiAgICBjb25zdCBbcm9vbU5hbWVzLCBzZXRSb29tTmFtZV0gPSB1c2VTdGF0ZUFycmF5KG51bUZpZWxkcywgW190KFwiR2VuZXJhbFwiKSwgX3QoXCJSYW5kb21cIiksIFwiXCJdKTtcbiAgICBjb25zdCBmaWVsZHMgPSBuZXcgQXJyYXkobnVtRmllbGRzKS5maWxsKDApLm1hcCgoeCwgaSkgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gXCJyb29tTmFtZVwiICsgaTtcbiAgICAgICAgcmV0dXJuIDxGaWVsZFxuICAgICAgICAgICAga2V5PXtuYW1lfVxuICAgICAgICAgICAgbmFtZT17bmFtZX1cbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIGxhYmVsPXtfdChcIlJvb20gbmFtZVwiKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtwbGFjZWhvbGRlcnNbaV19XG4gICAgICAgICAgICB2YWx1ZT17cm9vbU5hbWVzW2ldfVxuICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHNldFJvb21OYW1lKGksIGV2LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBhdXRvRm9jdXM9e2kgPT09IDJ9XG4gICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgIC8+O1xuICAgIH0pO1xuXG4gICAgY29uc3Qgb25OZXh0Q2xpY2sgPSBhc3luYyAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChidXN5KSByZXR1cm47XG4gICAgICAgIHNldEVycm9yKFwiXCIpO1xuICAgICAgICBzZXRCdXN5KHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgaXNQdWJsaWMgPSBzcGFjZS5nZXRKb2luUnVsZSgpID09PSBKb2luUnVsZS5QdWJsaWM7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZFJvb21OYW1lcyA9IHJvb21OYW1lcy5tYXAobmFtZSA9PiBuYW1lLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkcyA9IGF3YWl0IFByb21pc2UuYWxsKGZpbHRlcmVkUm9vbU5hbWVzLm1hcChuYW1lID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlUm9vbSh7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU9wdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXNldDogaXNQdWJsaWMgPyBQcmVzZXQuUHVibGljQ2hhdCA6IFByZXNldC5Qcml2YXRlQ2hhdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNwaW5uZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlbmNyeXB0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYW5kVmlldzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZUVycm9yczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50U3BhY2U6IHNwYWNlLFxuICAgICAgICAgICAgICAgICAgICBqb2luUnVsZTogIWlzUHVibGljID8gSm9pblJ1bGUuUmVzdHJpY3RlZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgb25GaW5pc2hlZChyb29tSWRzWzBdKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBpbml0aWFsIHNwYWNlIHJvb21zXCIsIGUpO1xuICAgICAgICAgICAgc2V0RXJyb3IoX3QoXCJGYWlsZWQgdG8gY3JlYXRlIGluaXRpYWwgc3BhY2Ugcm9vbXNcIikpO1xuICAgICAgICB9XG4gICAgICAgIHNldEJ1c3koZmFsc2UpO1xuICAgIH07XG5cbiAgICBsZXQgb25DbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgIH07XG4gICAgbGV0IGJ1dHRvbkxhYmVsID0gX3QoXCJTa2lwIGZvciBub3dcIik7XG4gICAgaWYgKHJvb21OYW1lcy5zb21lKG5hbWUgPT4gbmFtZS50cmltKCkpKSB7XG4gICAgICAgIG9uQ2xpY2sgPSBvbk5leHRDbGljaztcbiAgICAgICAgYnV0dG9uTGFiZWwgPSBidXN5ID8gX3QoXCJDcmVhdGluZyByb29tcy4uLlwiKSA6IF90KFwiQ29udGludWVcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXY+XG4gICAgICAgIDxoMT57IHRpdGxlIH08L2gxPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfZGVzY3JpcHRpb25cIj57IGRlc2NyaXB0aW9uIH08L2Rpdj5cblxuICAgICAgICB7IGVycm9yICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19lcnJvclRleHRcIj57IGVycm9yIH08L2Rpdj4gfVxuICAgICAgICA8Zm9ybSBvblN1Ym1pdD17b25DbGlja30gaWQ9XCJteF9TcGFjZVNldHVwRmlyc3RSb29tc1wiPlxuICAgICAgICAgICAgeyBmaWVsZHMgfVxuICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2J1dHRvbnNcIj5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICAgICAgZWxlbWVudD1cImlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICBmb3JtPVwibXhfU3BhY2VTZXR1cEZpcnN0Um9vbXNcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtidXR0b25MYWJlbH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2Pjtcbn07XG5cbmNvbnN0IFNwYWNlQWRkRXhpc3RpbmdSb29tcyA9ICh7IHNwYWNlLCBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgPGgxPnsgX3QoXCJXaGF0IGRvIHlvdSB3YW50IHRvIG9yZ2FuaXNlP1wiKSB9PC9oMT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICB7IF90KFwiUGljayByb29tcyBvciBjb252ZXJzYXRpb25zIHRvIGFkZC4gVGhpcyBpcyBqdXN0IGEgc3BhY2UgZm9yIHlvdSwgXCIgK1xuICAgICAgICAgICAgICAgIFwibm8gb25lIHdpbGwgYmUgaW5mb3JtZWQuIFlvdSBjYW4gYWRkIG1vcmUgbGF0ZXIuXCIpIH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPEFkZEV4aXN0aW5nVG9TcGFjZVxuICAgICAgICAgICAgc3BhY2U9e3NwYWNlfVxuICAgICAgICAgICAgZW1wdHlTZWxlY3Rpb25CdXR0b249e1xuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17b25GaW5pc2hlZH0+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTa2lwIGZvciBub3dcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlclBsYWNlaG9sZGVyPXtfdChcIlNlYXJjaCBmb3Igcm9vbXMgb3Igc3BhY2VzXCIpfVxuICAgICAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICAgICAgICAgIHJvb21zUmVuZGVyZXI9e2RlZmF1bHRSb29tc1JlbmRlcmVyfVxuICAgICAgICAgICAgZG1zUmVuZGVyZXI9e2RlZmF1bHREbXNSZW5kZXJlcn1cbiAgICAgICAgLz5cbiAgICA8L2Rpdj47XG59O1xuXG5pbnRlcmZhY2UgSVNwYWNlU2V0dXBQdWJsaWNTaGFyZVByb3BzIGV4dGVuZHMgUGljazxJUHJvcHMgJiBJU3RhdGUsIFwianVzdENyZWF0ZWRPcHRzXCIgfCBcInNwYWNlXCIgfCBcImZpcnN0Um9vbUlkXCI+IHtcbiAgICBvbkZpbmlzaGVkKCk6IHZvaWQ7XG59XG5cbmNvbnN0IFNwYWNlU2V0dXBQdWJsaWNTaGFyZSA9ICh7IGp1c3RDcmVhdGVkT3B0cywgc3BhY2UsIG9uRmluaXNoZWQsIGZpcnN0Um9vbUlkIH06IElTcGFjZVNldHVwUHVibGljU2hhcmVQcm9wcykgPT4ge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfcHVibGljU2hhcmVcIj5cbiAgICAgICAgPGgxPnsgX3QoXCJTaGFyZSAlKG5hbWUpc1wiLCB7XG4gICAgICAgICAgICBuYW1lOiBqdXN0Q3JlYXRlZE9wdHM/LmNyZWF0ZU9wdHM/Lm5hbWUgfHwgc3BhY2UubmFtZSxcbiAgICAgICAgfSkgfTwvaDE+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgeyBfdChcIkl0J3MganVzdCB5b3UgYXQgdGhlIG1vbWVudCwgaXQgd2lsbCBiZSBldmVuIGJldHRlciB3aXRoIG90aGVycy5cIikgfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8U3BhY2VQdWJsaWNTaGFyZSBzcGFjZT17c3BhY2V9IC8+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2J1dHRvbnNcIj5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17b25GaW5pc2hlZH0+XG4gICAgICAgICAgICAgICAgeyBmaXJzdFJvb21JZCA/IF90KFwiR28gdG8gbXkgZmlyc3Qgcm9vbVwiKSA6IF90KFwiR28gdG8gbXkgc3BhY2VcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBTcGFjZVNldHVwUHJpdmF0ZVNjb3BlID0gKHsgc3BhY2UsIGp1c3RDcmVhdGVkT3B0cywgb25GaW5pc2hlZCB9KSA9PiB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19wcml2YXRlU2NvcGVcIj5cbiAgICAgICAgPGgxPnsgX3QoXCJXaG8gYXJlIHlvdSB3b3JraW5nIHdpdGg/XCIpIH08L2gxPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIHsgX3QoXCJNYWtlIHN1cmUgdGhlIHJpZ2h0IHBlb3BsZSBoYXZlIGFjY2VzcyB0byAlKG5hbWUpc1wiLCB7XG4gICAgICAgICAgICAgICAgbmFtZToganVzdENyZWF0ZWRPcHRzPy5jcmVhdGVPcHRzPy5uYW1lIHx8IHNwYWNlLm5hbWUsXG4gICAgICAgICAgICB9KSB9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X3ByaXZhdGVTY29wZV9qdXN0TWVCdXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBvbkZpbmlzaGVkKGZhbHNlKTsgfX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGgzPnsgX3QoXCJKdXN0IG1lXCIpIH08L2gzPlxuICAgICAgICAgICAgPGRpdj57IF90KFwiQSBwcml2YXRlIHNwYWNlIHRvIG9yZ2FuaXNlIHlvdXIgcm9vbXNcIikgfTwvZGl2PlxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X3ByaXZhdGVTY29wZV9tZUFuZE15VGVhbW1hdGVzQnV0dG9uXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHsgb25GaW5pc2hlZCh0cnVlKTsgfX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGgzPnsgX3QoXCJNZSBhbmQgbXkgdGVhbW1hdGVzXCIpIH08L2gzPlxuICAgICAgICAgICAgPGRpdj57IF90KFwiQSBwcml2YXRlIHNwYWNlIGZvciB5b3UgYW5kIHlvdXIgdGVhbW1hdGVzXCIpIH08L2Rpdj5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgIDwvZGl2Pjtcbn07XG5cbmNvbnN0IHZhbGlkYXRlRW1haWxSdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICBydWxlczogW3tcbiAgICAgICAga2V5OiBcImVtYWlsXCIsXG4gICAgICAgIHRlc3Q6ICh7IHZhbHVlIH0pID0+ICF2YWx1ZSB8fCBFbWFpbC5sb29rc1ZhbGlkKHZhbHVlKSxcbiAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJEb2Vzbid0IGxvb2sgbGlrZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3NcIiksXG4gICAgfV0sXG59KTtcblxuY29uc3QgU3BhY2VTZXR1cFByaXZhdGVJbnZpdGUgPSAoeyBzcGFjZSwgb25GaW5pc2hlZCB9KSA9PiB7XG4gICAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgbnVtRmllbGRzID0gMztcbiAgICBjb25zdCBmaWVsZFJlZnM6IFJlZk9iamVjdDxGaWVsZD5bXSA9IFt1c2VSZWYoKSwgdXNlUmVmKCksIHVzZVJlZigpXTtcbiAgICBjb25zdCBbZW1haWxBZGRyZXNzZXMsIHNldEVtYWlsQWRkcmVzc10gPSB1c2VTdGF0ZUFycmF5KG51bUZpZWxkcywgXCJcIik7XG4gICAgY29uc3QgZmllbGRzID0gbmV3IEFycmF5KG51bUZpZWxkcykuZmlsbCgwKS5tYXAoKHgsIGkpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IFwiZW1haWxBZGRyZXNzXCIgKyBpO1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICBrZXk9e25hbWV9XG4gICAgICAgICAgICBuYW1lPXtuYW1lfVxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgbGFiZWw9e190KFwiRW1haWwgYWRkcmVzc1wiKX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIkVtYWlsXCIpfVxuICAgICAgICAgICAgdmFsdWU9e2VtYWlsQWRkcmVzc2VzW2ldfVxuICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHNldEVtYWlsQWRkcmVzcyhpLCBldi50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcmVmPXtmaWVsZFJlZnNbaV19XG4gICAgICAgICAgICBvblZhbGlkYXRlPXt2YWxpZGF0ZUVtYWlsUnVsZXN9XG4gICAgICAgICAgICBhdXRvRm9jdXM9e2kgPT09IDB9XG4gICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgLz47XG4gICAgfSk7XG5cbiAgICBjb25zdCBvbk5leHRDbGljayA9IGFzeW5jIChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoYnVzeSkgcmV0dXJuO1xuICAgICAgICBzZXRFcnJvcihcIlwiKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWVsZFJlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkUmVmID0gZmllbGRSZWZzW2ldO1xuICAgICAgICAgICAgY29uc3QgdmFsaWQgPSBhd2FpdCBmaWVsZFJlZi5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgaWYgKHZhbGlkID09PSBmYWxzZSkgeyAvLyB0cnVlL251bGwgYXJlIGFsbG93ZWRcbiAgICAgICAgICAgICAgICBmaWVsZFJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgZmllbGRSZWYuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IHRydWUsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0QnVzeSh0cnVlKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWRzID0gZW1haWxBZGRyZXNzZXMubWFwKG5hbWUgPT4gbmFtZS50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGludml0ZU11bHRpcGxlVG9Sb29tKHNwYWNlLnJvb21JZCwgdGFyZ2V0SWRzKTtcblxuICAgICAgICAgICAgY29uc3QgZmFpbGVkVXNlcnMgPSBPYmplY3Qua2V5cyhyZXN1bHQuc3RhdGVzKS5maWx0ZXIoYSA9PiByZXN1bHQuc3RhdGVzW2FdID09PSBcImVycm9yXCIpO1xuICAgICAgICAgICAgaWYgKGZhaWxlZFVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiRmFpbGVkIHRvIGludml0ZSB1c2VycyB0byBzcGFjZTogXCIsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IoX3QoXCJGYWlsZWQgdG8gaW52aXRlIHRoZSBmb2xsb3dpbmcgdXNlcnMgdG8geW91ciBzcGFjZTogJShjc3ZVc2VycylzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgY3N2VXNlcnM6IGZhaWxlZFVzZXJzLmpvaW4oXCIsIFwiKSxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gaW52aXRlIHVzZXJzIHRvIHNwYWNlOiBcIiwgZXJyKTtcbiAgICAgICAgICAgIHNldEVycm9yKF90KFwiV2UgY291bGRuJ3QgaW52aXRlIHRob3NlIHVzZXJzLiBQbGVhc2UgY2hlY2sgdGhlIHVzZXJzIHlvdSB3YW50IHRvIGludml0ZSBhbmQgdHJ5IGFnYWluLlwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0QnVzeShmYWxzZSk7XG4gICAgfTtcblxuICAgIGxldCBvbkNsaWNrID0gKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICB9O1xuICAgIGxldCBidXR0b25MYWJlbCA9IF90KFwiU2tpcCBmb3Igbm93XCIpO1xuICAgIGlmIChlbWFpbEFkZHJlc3Nlcy5zb21lKG5hbWUgPT4gbmFtZS50cmltKCkpKSB7XG4gICAgICAgIG9uQ2xpY2sgPSBvbk5leHRDbGljaztcbiAgICAgICAgYnV0dG9uTGFiZWwgPSBidXN5ID8gX3QoXCJJbnZpdGluZy4uLlwiKSA6IF90KFwiQ29udGludWVcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19pbnZpdGVUZWFtbWF0ZXNcIj5cbiAgICAgICAgPGgxPnsgX3QoXCJJbnZpdGUgeW91ciB0ZWFtbWF0ZXNcIikgfTwvaDE+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgeyBfdChcIk1ha2Ugc3VyZSB0aGUgcmlnaHQgcGVvcGxlIGhhdmUgYWNjZXNzLiBZb3UgY2FuIGludml0ZSBtb3JlIGxhdGVyLlwiKSB9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19pbnZpdGVUZWFtbWF0ZXNfYmV0YURpc2NsYWltZXJcIj5cbiAgICAgICAgICAgIHsgX3QoXCI8Yj5UaGlzIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLjwvYj4gRm9yIG5vdywgXCIgK1xuICAgICAgICAgICAgICAgIFwibmV3IHVzZXJzIHJlY2VpdmluZyBhbiBpbnZpdGUgd2lsbCBoYXZlIHRvIG9wZW4gdGhlIGludml0ZSBvbiA8bGluay8+IHRvIGFjdHVhbGx5IGpvaW4uXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPnsgc3ViIH08L2I+LFxuICAgICAgICAgICAgICAgIGxpbms6ICgpID0+IDxhIGhyZWY9XCJodHRwczovL2FwcC5lbGVtZW50LmlvL1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiB0YXJnZXQ9XCJfYmxhbmtcIj5cbiAgICAgICAgICAgICAgICAgICAgYXBwLmVsZW1lbnQuaW9cbiAgICAgICAgICAgICAgICA8L2E+LFxuICAgICAgICAgICAgfSkgfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7IGVycm9yICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld19lcnJvclRleHRcIj57IGVycm9yIH08L2Rpdj4gfVxuICAgICAgICA8Zm9ybSBvblN1Ym1pdD17b25DbGlja30gaWQ9XCJteF9TcGFjZVNldHVwUHJpdmF0ZUludml0ZVwiPlxuICAgICAgICAgICAgeyBmaWVsZHMgfVxuICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2ludml0ZVRlYW1tYXRlc19idXR0b25zXCI+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfaW52aXRlVGVhbW1hdGVzX2ludml0ZURpYWxvZ0J1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2hvd1Jvb21JbnZpdGVEaWFsb2coc3BhY2Uucm9vbUlkKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiSW52aXRlIGJ5IHVzZXJuYW1lXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVJvb21WaWV3X2J1dHRvbnNcIj5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICAgICAgZWxlbWVudD1cImlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICBmb3JtPVwibXhfU3BhY2VTZXR1cFByaXZhdGVJbnZpdGVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtidXR0b25MYWJlbH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwYWNlUm9vbVZpZXcgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBNYXRyaXhDbGllbnRDb250ZXh0PjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgY3JlYXRvcjogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcywgY29udGV4dDogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIE1hdHJpeENsaWVudENvbnRleHQ+KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICBsZXQgcGhhc2UgPSBQaGFzZS5MYW5kaW5nO1xuXG4gICAgICAgIHRoaXMuY3JlYXRvciA9IHRoaXMucHJvcHMuc3BhY2UuY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tQ3JlYXRlLCBcIlwiKT8uZ2V0U2VuZGVyKCk7XG4gICAgICAgIGNvbnN0IHNob3dTZXR1cCA9IHRoaXMucHJvcHMuanVzdENyZWF0ZWRPcHRzICYmIGNvbnRleHQuZ2V0VXNlcklkKCkgPT09IHRoaXMuY3JlYXRvcjtcblxuICAgICAgICBpZiAoc2hvd1NldHVwKSB7XG4gICAgICAgICAgICBwaGFzZSA9IHRoaXMucHJvcHMuanVzdENyZWF0ZWRPcHRzLmNyZWF0ZU9wdHMucHJlc2V0ID09PSBQcmVzZXQuUHVibGljQ2hhdFxuICAgICAgICAgICAgICAgID8gUGhhc2UuUHVibGljQ3JlYXRlUm9vbXMgOiBQaGFzZS5Qcml2YXRlU2NvcGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICBzaG93UmlnaHRQYW5lbDogUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLmlzT3BlbkZvclJvb20odGhpcy5wcm9wcy5zcGFjZS5yb29tSWQpLFxuICAgICAgICAgICAgbXlNZW1iZXJzaGlwOiB0aGlzLnByb3BzLnNwYWNlLmdldE15TWVtYmVyc2hpcCgpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRlZmF1bHREaXNwYXRjaGVyLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uUmlnaHRQYW5lbFN0b3JlVXBkYXRlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX0VWRU5ULCB0aGlzLm9uUmlnaHRQYW5lbFN0b3JlVXBkYXRlKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9mZihSb29tRXZlbnQuTXlNZW1iZXJzaGlwLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTXlNZW1iZXJzaGlwID0gKHJvb206IFJvb20sIG15TWVtYmVyc2hpcDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChyb29tLnJvb21JZCA9PT0gdGhpcy5wcm9wcy5zcGFjZS5yb29tSWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBteU1lbWJlcnNoaXAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaG93UmlnaHRQYW5lbDogUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLmlzT3BlbkZvclJvb20odGhpcy5wcm9wcy5zcGFjZS5yb29tSWQpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLlZpZXdSb29tICYmIHBheWxvYWQucm9vbV9pZCA9PT0gdGhpcy5wcm9wcy5zcGFjZS5yb29tSWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuTGFuZGluZyB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiAhPT0gQWN0aW9uLlZpZXdVc2VyICYmIHBheWxvYWQuYWN0aW9uICE9PSBcInZpZXdfM3BpZF9pbnZpdGVcIikgcmV0dXJuO1xuXG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLlZpZXdVc2VyICYmIHBheWxvYWQubWVtYmVyKSB7XG4gICAgICAgICAgICBjb25zdCBzcGFjZU1lbWJlckluZm9DYXJkOiBJUmlnaHRQYW5lbENhcmQgPSB7XG4gICAgICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2VNZW1iZXJJbmZvLFxuICAgICAgICAgICAgICAgIHN0YXRlOiB7IHNwYWNlSWQ6IHRoaXMucHJvcHMuc3BhY2Uucm9vbUlkLCBtZW1iZXI6IHBheWxvYWQubWVtYmVyIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHBheWxvYWQucHVzaCkge1xuICAgICAgICAgICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5wdXNoQ2FyZChzcGFjZU1lbWJlckluZm9DYXJkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnNldENhcmRzKFtcbiAgICAgICAgICAgICAgICAgICAgeyBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5TcGFjZU1lbWJlckxpc3QsIHN0YXRlOiB7IHNwYWNlSWQ6IHRoaXMucHJvcHMuc3BhY2Uucm9vbUlkIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VNZW1iZXJJbmZvQ2FyZCxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gXCJ2aWV3XzNwaWRfaW52aXRlXCIgJiYgcGF5bG9hZC5ldmVudCkge1xuICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnNldENhcmQoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlNwYWNlM3BpZE1lbWJlckluZm8sXG4gICAgICAgICAgICAgICAgc3RhdGU6IHsgc3BhY2VJZDogdGhpcy5wcm9wcy5zcGFjZS5yb29tSWQsIG1lbWJlckluZm9FdmVudDogcGF5bG9hZC5ldmVudCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2Uuc2V0Q2FyZCh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2VNZW1iZXJMaXN0LFxuICAgICAgICAgICAgICAgIHN0YXRlOiB7IHNwYWNlSWQ6IHRoaXMucHJvcHMuc3BhY2Uucm9vbUlkIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdvVG9GaXJzdFJvb20gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZpcnN0Um9vbUlkKSB7XG4gICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICByb29tX2lkOiB0aGlzLnN0YXRlLmZpcnN0Um9vbUlkLFxuICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIG90aGVyXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuTGFuZGluZyB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJCb2R5KCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUucGhhc2UpIHtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuTGFuZGluZzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5teU1lbWJlcnNoaXAgPT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiA8U3BhY2VMYW5kaW5nIHNwYWNlPXt0aGlzLnByb3BzLnNwYWNlfSAvPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gPFJvb21QcmV2aWV3Q2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5zcGFjZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSm9pbkJ1dHRvbkNsaWNrZWQ9e3RoaXMucHJvcHMub25Kb2luQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVqZWN0QnV0dG9uQ2xpY2tlZD17dGhpcy5wcm9wcy5vblJlamVjdEJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgUGhhc2UuUHVibGljQ3JlYXRlUm9vbXM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxTcGFjZVNldHVwRmlyc3RSb29tc1xuICAgICAgICAgICAgICAgICAgICBzcGFjZT17dGhpcy5wcm9wcy5zcGFjZX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiV2hhdCBhcmUgc29tZSB0aGluZ3MgeW91IHdhbnQgdG8gZGlzY3VzcyBpbiAlKHNwYWNlTmFtZSlzP1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZU5hbWU6IHRoaXMucHJvcHMuanVzdENyZWF0ZWRPcHRzPy5jcmVhdGVPcHRzPy5uYW1lIHx8IHRoaXMucHJvcHMuc3BhY2UubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXs8PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkxldCdzIGNyZWF0ZSBhIHJvb20gZm9yIGVhY2ggb2YgdGhlbS5cIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiWW91IGNhbiBhZGQgbW9yZSBsYXRlciB0b28sIGluY2x1ZGluZyBhbHJlYWR5IGV4aXN0aW5nIG9uZXMuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC8+fVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXsoZmlyc3RSb29tSWQ6IHN0cmluZykgPT4gdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5QdWJsaWNTaGFyZSwgZmlyc3RSb29tSWQgfSl9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBjYXNlIFBoYXNlLlB1YmxpY1NoYXJlOlxuICAgICAgICAgICAgICAgIHJldHVybiA8U3BhY2VTZXR1cFB1YmxpY1NoYXJlXG4gICAgICAgICAgICAgICAgICAgIGp1c3RDcmVhdGVkT3B0cz17dGhpcy5wcm9wcy5qdXN0Q3JlYXRlZE9wdHN9XG4gICAgICAgICAgICAgICAgICAgIHNwYWNlPXt0aGlzLnByb3BzLnNwYWNlfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLmdvVG9GaXJzdFJvb219XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0Um9vbUlkPXt0aGlzLnN0YXRlLmZpcnN0Um9vbUlkfVxuICAgICAgICAgICAgICAgIC8+O1xuXG4gICAgICAgICAgICBjYXNlIFBoYXNlLlByaXZhdGVTY29wZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gPFNwYWNlU2V0dXBQcml2YXRlU2NvcGVcbiAgICAgICAgICAgICAgICAgICAgc3BhY2U9e3RoaXMucHJvcHMuc3BhY2V9XG4gICAgICAgICAgICAgICAgICAgIGp1c3RDcmVhdGVkT3B0cz17dGhpcy5wcm9wcy5qdXN0Q3JlYXRlZE9wdHN9XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9eyhpbnZpdGU6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogaW52aXRlID8gUGhhc2UuUHJpdmF0ZUNyZWF0ZVJvb21zIDogUGhhc2UuUHJpdmF0ZUV4aXN0aW5nUm9vbXMgfSk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBjYXNlIFBoYXNlLlByaXZhdGVJbnZpdGU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxTcGFjZVNldHVwUHJpdmF0ZUludml0ZVxuICAgICAgICAgICAgICAgICAgICBzcGFjZT17dGhpcy5wcm9wcy5zcGFjZX1cbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZD17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5MYW5kaW5nIH0pfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5Qcml2YXRlQ3JlYXRlUm9vbXM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxTcGFjZVNldHVwRmlyc3RSb29tc1xuICAgICAgICAgICAgICAgICAgICBzcGFjZT17dGhpcy5wcm9wcy5zcGFjZX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiV2hhdCBwcm9qZWN0cyBhcmUgeW91ciB0ZWFtIHdvcmtpbmcgb24/XCIpfVxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbj17PD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJXZSdsbCBjcmVhdGUgcm9vbXMgZm9yIGVhY2ggb2YgdGhlbS5cIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiWW91IGNhbiBhZGQgbW9yZSBsYXRlciB0b28sIGluY2x1ZGluZyBhbHJlYWR5IGV4aXN0aW5nIG9uZXMuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC8+fVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXsoZmlyc3RSb29tSWQ6IHN0cmluZykgPT4gdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5Qcml2YXRlSW52aXRlLCBmaXJzdFJvb21JZCB9KX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuUHJpdmF0ZUV4aXN0aW5nUm9vbXM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxTcGFjZUFkZEV4aXN0aW5nUm9vbXNcbiAgICAgICAgICAgICAgICAgICAgc3BhY2U9e3RoaXMucHJvcHMuc3BhY2V9XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9eygpID0+IHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuTGFuZGluZyB9KX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgcmlnaHRQYW5lbCA9IHRoaXMuc3RhdGUuc2hvd1JpZ2h0UGFuZWwgJiYgdGhpcy5zdGF0ZS5waGFzZSA9PT0gUGhhc2UuTGFuZGluZ1xuICAgICAgICAgICAgPyA8UmlnaHRQYW5lbCByb29tPXt0aGlzLnByb3BzLnNwYWNlfSByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0gLz5cbiAgICAgICAgICAgIDogbnVsbDtcblxuICAgICAgICByZXR1cm4gPG1haW4gY2xhc3NOYW1lPVwibXhfU3BhY2VSb29tVmlld1wiPlxuICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgPE1haW5TcGxpdCBwYW5lbD17cmlnaHRQYW5lbH0gcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQm9keSgpIH1cbiAgICAgICAgICAgICAgICA8L01haW5TcGxpdD5cbiAgICAgICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgICAgPC9tYWluPjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNB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