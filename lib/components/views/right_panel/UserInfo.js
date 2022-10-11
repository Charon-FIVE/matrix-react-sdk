"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRoomPowerLevels = exports.useDevices = exports.getE2EStatus = exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _client = require("matrix-js-sdk/src/client");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _event = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _crypto = require("matrix-js-sdk/src/crypto");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _RoomViewStore = require("../../../stores/RoomViewStore");

var _MultiInviter = _interopRequireDefault(require("../../../utils/MultiInviter"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _E2EIcon = _interopRequireDefault(require("../rooms/E2EIcon"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _Roles = require("../../../Roles");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _RightPanelStorePhases = require("../../../stores/right-panel/RightPanelStorePhases");

var _EncryptionPanel = _interopRequireDefault(require("./EncryptionPanel"));

var _useAsyncMemo = require("../../../hooks/useAsyncMemo");

var _verification = require("../../../verification");

var _actions = require("../../../dispatcher/actions");

var _UserTab = require("../dialogs/UserTab");

var _useIsEncrypted = require("../../../hooks/useIsEncrypted");

var _BaseCard = _interopRequireDefault(require("./BaseCard"));

var _ShieldUtils = require("../../../utils/ShieldUtils");

var _ImageView = _interopRequireDefault(require("../elements/ImageView"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _PowerSelector = _interopRequireDefault(require("../elements/PowerSelector"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _PresenceLabel = _interopRequireDefault(require("../rooms/PresenceLabel"));

var _BulkRedactDialog = _interopRequireDefault(require("../dialogs/BulkRedactDialog"));

var _ShareDialog = _interopRequireDefault(require("../dialogs/ShareDialog"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _QuestionDialog = _interopRequireDefault(require("../dialogs/QuestionDialog"));

var _ConfirmUserActionDialog = _interopRequireDefault(require("../dialogs/ConfirmUserActionDialog"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _RoomName = _interopRequireDefault(require("../elements/RoomName"));

var _Media = require("../../../customisations/Media");

var _UIStore = _interopRequireDefault(require("../../../stores/UIStore"));

var _ConfirmSpaceUserActionDialog = _interopRequireDefault(require("../dialogs/ConfirmSpaceUserActionDialog"));

var _space = require("../../../utils/space");

var _UIComponents = require("../../../customisations/helpers/UIComponents");

var _UIFeature = require("../../../settings/UIFeature");

var _RoomContext = require("../../../contexts/RoomContext");

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

var _UserIdentifier = _interopRequireDefault(require("../../../customisations/UserIdentifier"));

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _directMessages = require("../../../utils/direct-messages");

const _excluded = ["user", "room", "onClose", "phase"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const disambiguateDevices = devices => {
  const names = Object.create(null);

  for (let i = 0; i < devices.length; i++) {
    const name = devices[i].getDisplayName();
    const indexList = names[name] || [];
    indexList.push(i);
    names[name] = indexList;
  }

  for (const name in names) {
    if (names[name].length > 1) {
      names[name].forEach(j => {
        devices[j].ambiguous = true;
      });
    }
  }
};

const getE2EStatus = (cli, userId, devices) => {
  const isMe = userId === cli.getUserId();
  const userTrust = cli.checkUserTrust(userId);

  if (!userTrust.isCrossSigningVerified()) {
    return userTrust.wasCrossSigningVerified() ? _ShieldUtils.E2EStatus.Warning : _ShieldUtils.E2EStatus.Normal;
  }

  const anyDeviceUnverified = devices.some(device => {
    const {
      deviceId
    } = device; // For your own devices, we use the stricter check of cross-signing
    // verification to encourage everyone to trust their own devices via
    // cross-signing so that other users can then safely trust you.
    // For other people's devices, the more general verified check that
    // includes locally verified devices can be used.

    const deviceTrust = cli.checkDeviceTrust(userId, deviceId);
    return isMe ? !deviceTrust.isCrossSigningVerified() : !deviceTrust.isVerified();
  });
  return anyDeviceUnverified ? _ShieldUtils.E2EStatus.Warning : _ShieldUtils.E2EStatus.Verified;
};

exports.getE2EStatus = getE2EStatus;

async function openDMForUser(matrixClient, user) {
  const startDMUser = new _directMessages.DirectoryMember({
    user_id: user.userId,
    display_name: user.rawDisplayName,
    avatar_url: user.getMxcAvatarUrl()
  });
  (0, _directMessages.startDmOnFirstMessage)(matrixClient, [startDMUser]);
}

function useHasCrossSigningKeys(cli, member, canVerify, setUpdating) {
  return (0, _useAsyncMemo.useAsyncMemo)(async () => {
    if (!canVerify) {
      return undefined;
    }

    setUpdating(true);

    try {
      await cli.downloadKeys([member.userId]);
      const xsi = cli.getStoredCrossSigningForUser(member.userId);
      const key = xsi && xsi.getId();
      return !!key;
    } finally {
      setUpdating(false);
    }
  }, [cli, member, canVerify], undefined);
}

function DeviceItem(_ref) {
  let {
    userId,
    device
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const isMe = userId === cli.getUserId();
  const deviceTrust = cli.checkDeviceTrust(userId, device.deviceId);
  const userTrust = cli.checkUserTrust(userId); // For your own devices, we use the stricter check of cross-signing
  // verification to encourage everyone to trust their own devices via
  // cross-signing so that other users can then safely trust you.
  // For other people's devices, the more general verified check that
  // includes locally verified devices can be used.

  const isVerified = isMe ? deviceTrust.isCrossSigningVerified() : deviceTrust.isVerified();
  const classes = (0, _classnames.default)("mx_UserInfo_device", {
    mx_UserInfo_device_verified: isVerified,
    mx_UserInfo_device_unverified: !isVerified
  });
  const iconClasses = (0, _classnames.default)("mx_E2EIcon", {
    mx_E2EIcon_normal: !userTrust.isVerified(),
    mx_E2EIcon_verified: isVerified,
    mx_E2EIcon_warning: userTrust.isVerified() && !isVerified
  });

  const onDeviceClick = () => {
    (0, _verification.verifyDevice)(cli.getUser(userId), device);
  };

  let deviceName;

  if (!device.getDisplayName()?.trim()) {
    deviceName = device.deviceId;
  } else {
    deviceName = device.ambiguous ? device.getDisplayName() + " (" + device.deviceId + ")" : device.getDisplayName();
  }

  let trustedLabel = null;
  if (userTrust.isVerified()) trustedLabel = isVerified ? (0, _languageHandler._t)("Trusted") : (0, _languageHandler._t)("Not trusted");

  if (isVerified) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      title: device.deviceId
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: iconClasses
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_device_name"
    }, deviceName), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_device_trusted"
    }, trustedLabel));
  } else {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: classes,
      title: device.deviceId,
      onClick: onDeviceClick
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: iconClasses
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_device_name"
    }, deviceName), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_device_trusted"
    }, trustedLabel));
  }
}

function DevicesSection(_ref2) {
  let {
    devices,
    userId,
    loading
  } = _ref2;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const userTrust = cli.checkUserTrust(userId);
  const [isExpanded, setExpanded] = (0, _react.useState)(false);

  if (loading) {
    // still loading
    return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
  }

  if (devices === null) {
    return /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to load session list"));
  }

  const isMe = userId === cli.getUserId();
  const deviceTrusts = devices.map(d => cli.checkDeviceTrust(userId, d.deviceId));
  let expandSectionDevices = [];
  const unverifiedDevices = [];
  let expandCountCaption;
  let expandHideCaption;
  let expandIconClasses = "mx_E2EIcon";

  if (userTrust.isVerified()) {
    for (let i = 0; i < devices.length; ++i) {
      const device = devices[i];
      const deviceTrust = deviceTrusts[i]; // For your own devices, we use the stricter check of cross-signing
      // verification to encourage everyone to trust their own devices via
      // cross-signing so that other users can then safely trust you.
      // For other people's devices, the more general verified check that
      // includes locally verified devices can be used.

      const isVerified = isMe ? deviceTrust.isCrossSigningVerified() : deviceTrust.isVerified();

      if (isVerified) {
        expandSectionDevices.push(device);
      } else {
        unverifiedDevices.push(device);
      }
    }

    expandCountCaption = (0, _languageHandler._t)("%(count)s verified sessions", {
      count: expandSectionDevices.length
    });
    expandHideCaption = (0, _languageHandler._t)("Hide verified sessions");
    expandIconClasses += " mx_E2EIcon_verified";
  } else {
    expandSectionDevices = devices;
    expandCountCaption = (0, _languageHandler._t)("%(count)s sessions", {
      count: devices.length
    });
    expandHideCaption = (0, _languageHandler._t)("Hide sessions");
    expandIconClasses += " mx_E2EIcon_normal";
  }

  let expandButton;

  if (expandSectionDevices.length) {
    if (isExpanded) {
      expandButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        className: "mx_UserInfo_expand",
        onClick: () => setExpanded(false)
      }, /*#__PURE__*/_react.default.createElement("div", null, expandHideCaption));
    } else {
      expandButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        className: "mx_UserInfo_expand",
        onClick: () => setExpanded(true)
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: expandIconClasses
      }), /*#__PURE__*/_react.default.createElement("div", null, expandCountCaption));
    }
  }

  let deviceList = unverifiedDevices.map((device, i) => {
    return /*#__PURE__*/_react.default.createElement(DeviceItem, {
      key: i,
      userId: userId,
      device: device
    });
  });

  if (isExpanded) {
    const keyStart = unverifiedDevices.length;
    deviceList = deviceList.concat(expandSectionDevices.map((device, i) => {
      return /*#__PURE__*/_react.default.createElement(DeviceItem, {
        key: i + keyStart,
        userId: userId,
        device: device
      });
    }));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_devices"
  }, /*#__PURE__*/_react.default.createElement("div", null, deviceList), /*#__PURE__*/_react.default.createElement("div", null, expandButton));
}

const MessageButton = _ref3 => {
  let {
    member
  } = _ref3;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [busy, setBusy] = (0, _react.useState)(false);
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    onClick: async () => {
      if (busy) return;
      setBusy(true);
      await openDMForUser(cli, member);
      setBusy(false);
    },
    className: "mx_UserInfo_field",
    disabled: busy
  }, (0, _languageHandler._t)("Message"));
};

const UserOptionsSection = _ref4 => {
  let {
    member,
    isIgnored,
    canInvite,
    isSpace
  } = _ref4;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  let ignoreButton = null;
  let insertPillButton = null;
  let inviteUserButton = null;
  let readReceiptButton = null;
  const isMe = member.userId === cli.getUserId();

  const onShareUserClick = () => {
    _Modal.default.createDialog(_ShareDialog.default, {
      target: member
    });
  }; // Only allow the user to ignore the user if its not ourselves
  // same goes for jumping to read receipt


  if (!isMe) {
    const onIgnoreToggle = () => {
      const ignoredUsers = cli.getIgnoredUsers();

      if (isIgnored) {
        const index = ignoredUsers.indexOf(member.userId);
        if (index !== -1) ignoredUsers.splice(index, 1);
      } else {
        ignoredUsers.push(member.userId);
      }

      cli.setIgnoredUsers(ignoredUsers);
    };

    ignoreButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      onClick: onIgnoreToggle,
      className: (0, _classnames.default)("mx_UserInfo_field", {
        mx_UserInfo_destructive: !isIgnored
      })
    }, isIgnored ? (0, _languageHandler._t)("Unignore") : (0, _languageHandler._t)("Ignore"));

    if (member.roomId && !isSpace) {
      const onReadReceiptButton = function () {
        const room = cli.getRoom(member.roomId);

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          highlighted: true,
          event_id: room.getEventReadUpTo(member.userId),
          room_id: member.roomId,
          metricsTrigger: undefined // room doesn't change

        });
      };

      const onInsertPillButton = function () {
        _dispatcher.default.dispatch({
          action: _actions.Action.ComposerInsert,
          userId: member.userId,
          timelineRenderingType: _RoomContext.TimelineRenderingType.Room
        });
      };

      const room = cli.getRoom(member.roomId);

      if (room?.getEventReadUpTo(member.userId)) {
        readReceiptButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link",
          onClick: onReadReceiptButton,
          className: "mx_UserInfo_field"
        }, (0, _languageHandler._t)('Jump to read receipt'));
      }

      insertPillButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: onInsertPillButton,
        className: "mx_UserInfo_field"
      }, (0, _languageHandler._t)('Mention'));
    }

    if (canInvite && (member?.membership ?? 'leave') === 'leave' && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.InviteUsers)) {
      const roomId = member && member.roomId ? member.roomId : _RoomViewStore.RoomViewStore.instance.getRoomId();

      const onInviteUserButton = async ev => {
        try {
          // We use a MultiInviter to re-use the invite logic, even though we're only inviting one user.
          const inviter = new _MultiInviter.default(roomId);
          await inviter.invite([member.userId]).then(() => {
            if (inviter.getCompletionState(member.userId) !== "invited") {
              throw new Error(inviter.getErrorText(member.userId));
            }
          });
        } catch (err) {
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)('Failed to invite'),
            description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
          });
        }

        _PosthogTrackers.default.trackInteraction("WebRightPanelRoomUserInfoInviteButton", ev);
      };

      inviteUserButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: onInviteUserButton,
        className: "mx_UserInfo_field"
      }, (0, _languageHandler._t)('Invite'));
    }
  }

  const shareUserButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    onClick: onShareUserClick,
    className: "mx_UserInfo_field"
  }, (0, _languageHandler._t)('Share Link to User'));

  let directMessageButton;

  if (!isMe) {
    directMessageButton = /*#__PURE__*/_react.default.createElement(MessageButton, {
      member: member
    });
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Options")), /*#__PURE__*/_react.default.createElement("div", null, directMessageButton, readReceiptButton, shareUserButton, insertPillButton, inviteUserButton, ignoreButton));
};

const warnSelfDemote = async isSpace => {
  const {
    finished
  } = _Modal.default.createDialog(_QuestionDialog.default, {
    title: (0, _languageHandler._t)("Demote yourself?"),
    description: /*#__PURE__*/_react.default.createElement("div", null, isSpace ? (0, _languageHandler._t)("You will not be able to undo this change as you are demoting yourself, " + "if you are the last privileged user in the space it will be impossible " + "to regain privileges.") : (0, _languageHandler._t)("You will not be able to undo this change as you are demoting yourself, " + "if you are the last privileged user in the room it will be impossible " + "to regain privileges.")),
    button: (0, _languageHandler._t)("Demote")
  });

  const [confirmed] = await finished;
  return confirmed;
};

const GenericAdminToolsContainer = _ref5 => {
  let {
    children
  } = _ref5;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Admin Tools")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_buttons"
  }, children));
};

const isMuted = (member, powerLevelContent) => {
  if (!powerLevelContent || !member) return false;
  const levelToSend = (powerLevelContent.events ? powerLevelContent.events["m.room.message"] : null) || powerLevelContent.events_default;
  return member.powerLevel < levelToSend;
};

const getPowerLevels = room => room?.currentState?.getStateEvents(_event.EventType.RoomPowerLevels, "")?.getContent() || {};

const useRoomPowerLevels = (cli, room) => {
  const [powerLevels, setPowerLevels] = (0, _react.useState)(getPowerLevels(room));
  const update = (0, _react.useCallback)(ev => {
    if (!room) return;
    if (ev && ev.getType() !== _event.EventType.RoomPowerLevels) return;
    setPowerLevels(getPowerLevels(room));
  }, [room]);
  (0, _useEventEmitter.useTypedEventEmitter)(cli, _roomState.RoomStateEvent.Events, update);
  (0, _react.useEffect)(() => {
    update();
    return () => {
      setPowerLevels({});
    };
  }, [update]);
  return powerLevels;
};

exports.useRoomPowerLevels = useRoomPowerLevels;

const RoomKickButton = _ref6 => {
  let {
    room,
    member,
    startUpdating,
    stopUpdating
  } = _ref6;
  const cli = (0, _react.useContext)(_MatrixClientContext.default); // check if user can be kicked/disinvited

  if (member.membership !== "invite" && member.membership !== "join") return null;

  const onKick = async () => {
    const {
      finished
    } = _Modal.default.createDialog(room.isSpaceRoom() ? _ConfirmSpaceUserActionDialog.default : _ConfirmUserActionDialog.default, {
      member,
      action: room.isSpaceRoom() ? member.membership === "invite" ? (0, _languageHandler._t)("Disinvite from space") : (0, _languageHandler._t)("Remove from space") : member.membership === "invite" ? (0, _languageHandler._t)("Disinvite from room") : (0, _languageHandler._t)("Remove from room"),
      title: member.membership === "invite" ? (0, _languageHandler._t)("Disinvite from %(roomName)s", {
        roomName: room.name
      }) : (0, _languageHandler._t)("Remove from %(roomName)s", {
        roomName: room.name
      }),
      askReason: member.membership === "join",
      danger: true,
      // space-specific props
      space: room,
      spaceChildFilter: child => {
        // Return true if the target member is not banned and we have sufficient PL to ban them
        const myMember = child.getMember(cli.credentials.userId);
        const theirMember = child.getMember(member.userId);
        return myMember && theirMember && theirMember.membership === member.membership && myMember.powerLevel > theirMember.powerLevel && child.currentState.hasSufficientPowerLevelFor("kick", myMember.powerLevel);
      },
      allLabel: (0, _languageHandler._t)("Remove them from everything I'm able to"),
      specificLabel: (0, _languageHandler._t)("Remove them from specific things I'm able to"),
      warningMessage: (0, _languageHandler._t)("They'll still be able to access whatever you're not an admin of.")
    }, room.isSpaceRoom() ? "mx_ConfirmSpaceUserActionDialog_wrapper" : undefined);

    const [proceed, reason, rooms = []] = await finished;
    if (!proceed) return;
    startUpdating();
    (0, _space.bulkSpaceBehaviour)(room, rooms, room => cli.kick(room.roomId, member.userId, reason || undefined)).then(() => {
      // NO-OP; rely on the m.room.member event coming down else we could
      // get out of sync if we force setState here!
      _logger.logger.log("Kick success");
    }, function (err) {
      _logger.logger.error("Kick error: " + err);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Failed to remove user"),
        description: err && err.message ? err.message : "Operation failed"
      });
    }).finally(() => {
      stopUpdating();
    });
  };

  const kickLabel = room.isSpaceRoom() ? member.membership === "invite" ? (0, _languageHandler._t)("Disinvite from space") : (0, _languageHandler._t)("Remove from space") : member.membership === "invite" ? (0, _languageHandler._t)("Disinvite from room") : (0, _languageHandler._t)("Remove from room");
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    className: "mx_UserInfo_field mx_UserInfo_destructive",
    onClick: onKick
  }, kickLabel);
};

const RedactMessagesButton = _ref7 => {
  let {
    member
  } = _ref7;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);

  const onRedactAllMessages = () => {
    const room = cli.getRoom(member.roomId);
    if (!room) return;

    _Modal.default.createDialog(_BulkRedactDialog.default, {
      matrixClient: cli,
      room,
      member
    });
  };

  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    className: "mx_UserInfo_field mx_UserInfo_destructive",
    onClick: onRedactAllMessages
  }, (0, _languageHandler._t)("Remove recent messages"));
};

const BanToggleButton = _ref8 => {
  let {
    room,
    member,
    startUpdating,
    stopUpdating
  } = _ref8;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const isBanned = member.membership === "ban";

  const onBanOrUnban = async () => {
    const {
      finished
    } = _Modal.default.createDialog(room.isSpaceRoom() ? _ConfirmSpaceUserActionDialog.default : _ConfirmUserActionDialog.default, {
      member,
      action: room.isSpaceRoom() ? isBanned ? (0, _languageHandler._t)("Unban from space") : (0, _languageHandler._t)("Ban from space") : isBanned ? (0, _languageHandler._t)("Unban from room") : (0, _languageHandler._t)("Ban from room"),
      title: isBanned ? (0, _languageHandler._t)("Unban from %(roomName)s", {
        roomName: room.name
      }) : (0, _languageHandler._t)("Ban from %(roomName)s", {
        roomName: room.name
      }),
      askReason: !isBanned,
      danger: !isBanned,
      // space-specific props
      space: room,
      spaceChildFilter: isBanned ? child => {
        // Return true if the target member is banned and we have sufficient PL to unban
        const myMember = child.getMember(cli.credentials.userId);
        const theirMember = child.getMember(member.userId);
        return myMember && theirMember && theirMember.membership === "ban" && myMember.powerLevel > theirMember.powerLevel && child.currentState.hasSufficientPowerLevelFor("ban", myMember.powerLevel);
      } : child => {
        // Return true if the target member isn't banned and we have sufficient PL to ban
        const myMember = child.getMember(cli.credentials.userId);
        const theirMember = child.getMember(member.userId);
        return myMember && theirMember && theirMember.membership !== "ban" && myMember.powerLevel > theirMember.powerLevel && child.currentState.hasSufficientPowerLevelFor("ban", myMember.powerLevel);
      },
      allLabel: isBanned ? (0, _languageHandler._t)("Unban them from everything I'm able to") : (0, _languageHandler._t)("Ban them from everything I'm able to"),
      specificLabel: isBanned ? (0, _languageHandler._t)("Unban them from specific things I'm able to") : (0, _languageHandler._t)("Ban them from specific things I'm able to"),
      warningMessage: isBanned ? (0, _languageHandler._t)("They won't be able to access whatever you're not an admin of.") : (0, _languageHandler._t)("They'll still be able to access whatever you're not an admin of.")
    }, room.isSpaceRoom() ? "mx_ConfirmSpaceUserActionDialog_wrapper" : undefined);

    const [proceed, reason, rooms = []] = await finished;
    if (!proceed) return;
    startUpdating();

    const fn = roomId => {
      if (isBanned) {
        return cli.unban(roomId, member.userId);
      } else {
        return cli.ban(roomId, member.userId, reason || undefined);
      }
    };

    (0, _space.bulkSpaceBehaviour)(room, rooms, room => fn(room.roomId)).then(() => {
      // NO-OP; rely on the m.room.member event coming down else we could
      // get out of sync if we force setState here!
      _logger.logger.log("Ban success");
    }, function (err) {
      _logger.logger.error("Ban error: " + err);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Error"),
        description: (0, _languageHandler._t)("Failed to ban user")
      });
    }).finally(() => {
      stopUpdating();
    });
  };

  let label = room.isSpaceRoom() ? (0, _languageHandler._t)("Ban from space") : (0, _languageHandler._t)("Ban from room");

  if (isBanned) {
    label = room.isSpaceRoom() ? (0, _languageHandler._t)("Unban from space") : (0, _languageHandler._t)("Unban from room");
  }

  const classes = (0, _classnames.default)("mx_UserInfo_field", {
    mx_UserInfo_destructive: !isBanned
  });
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    className: classes,
    onClick: onBanOrUnban
  }, label);
};

const MuteToggleButton = _ref9 => {
  let {
    member,
    room,
    powerLevels,
    startUpdating,
    stopUpdating
  } = _ref9;
  const cli = (0, _react.useContext)(_MatrixClientContext.default); // Don't show the mute/unmute option if the user is not in the room

  if (member.membership !== "join") return null;
  const muted = isMuted(member, powerLevels);

  const onMuteToggle = async () => {
    const roomId = member.roomId;
    const target = member.userId; // if muting self, warn as it may be irreversible

    if (target === cli.getUserId()) {
      try {
        if (!(await warnSelfDemote(room?.isSpaceRoom()))) return;
      } catch (e) {
        _logger.logger.error("Failed to warn about self demotion: ", e);

        return;
      }
    }

    const powerLevelEvent = room.currentState.getStateEvents("m.room.power_levels", "");
    if (!powerLevelEvent) return;
    const powerLevels = powerLevelEvent.getContent();
    const levelToSend = (powerLevels.events ? powerLevels.events["m.room.message"] : null) || powerLevels.events_default;
    let level;

    if (muted) {
      // unmute
      level = levelToSend;
    } else {
      // mute
      level = levelToSend - 1;
    }

    level = parseInt(level);

    if (!isNaN(level)) {
      startUpdating();
      cli.setPowerLevel(roomId, target, level, powerLevelEvent).then(() => {
        // NO-OP; rely on the m.room.member event coming down else we could
        // get out of sync if we force setState here!
        _logger.logger.log("Mute toggle success");
      }, function (err) {
        _logger.logger.error("Mute error: " + err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error"),
          description: (0, _languageHandler._t)("Failed to mute user")
        });
      }).finally(() => {
        stopUpdating();
      });
    }
  };

  const classes = (0, _classnames.default)("mx_UserInfo_field", {
    mx_UserInfo_destructive: !muted
  });
  const muteLabel = muted ? (0, _languageHandler._t)("Unmute") : (0, _languageHandler._t)("Mute");
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    className: classes,
    onClick: onMuteToggle
  }, muteLabel);
};

const RoomAdminToolsContainer = _ref10 => {
  let {
    room,
    children,
    member,
    startUpdating,
    stopUpdating,
    powerLevels
  } = _ref10;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  let kickButton;
  let banButton;
  let muteButton;
  let redactButton;
  const editPowerLevel = (powerLevels.events ? powerLevels.events["m.room.power_levels"] : null) || powerLevels.state_default; // if these do not exist in the event then they should default to 50 as per the spec

  const {
    ban: banPowerLevel = 50,
    kick: kickPowerLevel = 50,
    redact: redactPowerLevel = 50
  } = powerLevels;
  const me = room.getMember(cli.getUserId());

  if (!me) {
    // we aren't in the room, so return no admin tooling
    return /*#__PURE__*/_react.default.createElement("div", null);
  }

  const isMe = me.userId === member.userId;
  const canAffectUser = member.powerLevel < me.powerLevel || isMe;

  if (!isMe && canAffectUser && me.powerLevel >= kickPowerLevel) {
    kickButton = /*#__PURE__*/_react.default.createElement(RoomKickButton, {
      room: room,
      member: member,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    });
  }

  if (me.powerLevel >= redactPowerLevel && !room.isSpaceRoom()) {
    redactButton = /*#__PURE__*/_react.default.createElement(RedactMessagesButton, {
      member: member,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    });
  }

  if (!isMe && canAffectUser && me.powerLevel >= banPowerLevel) {
    banButton = /*#__PURE__*/_react.default.createElement(BanToggleButton, {
      room: room,
      member: member,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    });
  }

  if (!isMe && canAffectUser && me.powerLevel >= editPowerLevel && !room.isSpaceRoom()) {
    muteButton = /*#__PURE__*/_react.default.createElement(MuteToggleButton, {
      member: member,
      room: room,
      powerLevels: powerLevels,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    });
  }

  if (kickButton || banButton || muteButton || redactButton || children) {
    return /*#__PURE__*/_react.default.createElement(GenericAdminToolsContainer, null, muteButton, kickButton, banButton, redactButton, children);
  }

  return /*#__PURE__*/_react.default.createElement("div", null);
};

const useIsSynapseAdmin = cli => {
  const [isAdmin, setIsAdmin] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    cli.isSynapseAdministrator().then(isAdmin => {
      setIsAdmin(isAdmin);
    }, () => {
      setIsAdmin(false);
    });
  }, [cli]);
  return isAdmin;
};

const useHomeserverSupportsCrossSigning = cli => {
  return (0, _useAsyncMemo.useAsyncMemo)(async () => {
    return cli.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing");
  }, [cli], false);
};

function useRoomPermissions(cli, room, user) {
  const [roomPermissions, setRoomPermissions] = (0, _react.useState)({
    // modifyLevelMax is the max PL we can set this user to, typically min(their PL, our PL) && canSetPL
    modifyLevelMax: -1,
    canEdit: false,
    canInvite: false
  });
  const updateRoomPermissions = (0, _react.useCallback)(() => {
    const powerLevels = room?.currentState.getStateEvents(_event.EventType.RoomPowerLevels, "")?.getContent();
    if (!powerLevels) return;
    const me = room.getMember(cli.getUserId());
    if (!me) return;
    const them = user;
    const isMe = me.userId === them.userId;
    const canAffectUser = them.powerLevel < me.powerLevel || isMe;
    let modifyLevelMax = -1;

    if (canAffectUser) {
      const editPowerLevel = powerLevels.events?.[_event.EventType.RoomPowerLevels] ?? powerLevels.state_default ?? 50;

      if (me.powerLevel >= editPowerLevel) {
        modifyLevelMax = me.powerLevel;
      }
    }

    setRoomPermissions({
      canInvite: me.powerLevel >= (powerLevels.invite ?? 0),
      canEdit: modifyLevelMax >= 0,
      modifyLevelMax
    });
  }, [cli, user, room]);
  (0, _useEventEmitter.useTypedEventEmitter)(cli, _roomState.RoomStateEvent.Update, updateRoomPermissions);
  (0, _react.useEffect)(() => {
    updateRoomPermissions();
    return () => {
      setRoomPermissions({
        modifyLevelMax: -1,
        canEdit: false,
        canInvite: false
      });
    };
  }, [updateRoomPermissions]);
  return roomPermissions;
}

const PowerLevelSection = _ref11 => {
  let {
    user,
    room,
    roomPermissions,
    powerLevels
  } = _ref11;

  if (roomPermissions.canEdit) {
    return /*#__PURE__*/_react.default.createElement(PowerLevelEditor, {
      user: user,
      room: room,
      roomPermissions: roomPermissions
    });
  } else {
    const powerLevelUsersDefault = powerLevels.users_default || 0;
    const powerLevel = user.powerLevel;
    const role = (0, _Roles.textualPowerLevel)(powerLevel, powerLevelUsersDefault);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_profileField"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_roleDescription"
    }, role));
  }
};

const PowerLevelEditor = _ref12 => {
  let {
    user,
    room,
    roomPermissions
  } = _ref12;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [selectedPowerLevel, setSelectedPowerLevel] = (0, _react.useState)(user.powerLevel);
  (0, _react.useEffect)(() => {
    setSelectedPowerLevel(user.powerLevel);
  }, [user]);
  const onPowerChange = (0, _react.useCallback)(async powerLevel => {
    setSelectedPowerLevel(powerLevel);

    const applyPowerChange = (roomId, target, powerLevel, powerLevelEvent) => {
      return cli.setPowerLevel(roomId, target, parseInt(powerLevel), powerLevelEvent).then(function () {
        // NO-OP; rely on the m.room.member event coming down else we could
        // get out of sync if we force setState here!
        _logger.logger.log("Power change success");
      }, function (err) {
        _logger.logger.error("Failed to change power level " + err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error"),
          description: (0, _languageHandler._t)("Failed to change power level")
        });
      });
    };

    const roomId = user.roomId;
    const target = user.userId;
    const powerLevelEvent = room.currentState.getStateEvents("m.room.power_levels", "");
    if (!powerLevelEvent) return;
    const myUserId = cli.getUserId();
    const myPower = powerLevelEvent.getContent().users[myUserId];

    if (myPower && parseInt(myPower) <= powerLevel && myUserId !== target) {
      const {
        finished
      } = _Modal.default.createDialog(_QuestionDialog.default, {
        title: (0, _languageHandler._t)("Warning!"),
        description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("You will not be able to undo this change as you are promoting the user " + "to have the same power level as yourself."), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Are you sure?")),
        button: (0, _languageHandler._t)("Continue")
      });

      const [confirmed] = await finished;
      if (!confirmed) return;
    } else if (myUserId === target && myPower && parseInt(myPower) > powerLevel) {
      // If we are changing our own PL it can only ever be decreasing, which we cannot reverse.
      try {
        if (!(await warnSelfDemote(room?.isSpaceRoom()))) return;
      } catch (e) {
        _logger.logger.error("Failed to warn about self demotion: ", e);
      }
    }

    await applyPowerChange(roomId, target, powerLevel, powerLevelEvent);
  }, [user.roomId, user.userId, cli, room]);
  const powerLevelEvent = room.currentState.getStateEvents("m.room.power_levels", "");
  const powerLevelUsersDefault = powerLevelEvent ? powerLevelEvent.getContent().users_default : 0;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_profileField"
  }, /*#__PURE__*/_react.default.createElement(_PowerSelector.default, {
    label: null,
    value: selectedPowerLevel,
    maxValue: roomPermissions.modifyLevelMax,
    usersDefault: powerLevelUsersDefault,
    onChange: onPowerChange
  }));
};

const useDevices = userId => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default); // undefined means yet to be loaded, null means failed to load, otherwise list of devices

  const [devices, setDevices] = (0, _react.useState)(undefined); // Download device lists

  (0, _react.useEffect)(() => {
    setDevices(undefined);
    let cancelled = false;

    async function downloadDeviceList() {
      try {
        await cli.downloadKeys([userId], true);
        const devices = cli.getStoredDevicesForUser(userId);

        if (cancelled) {
          // we got cancelled - presumably a different user now
          return;
        }

        disambiguateDevices(devices);
        setDevices(devices);
      } catch (err) {
        setDevices(null);
      }
    }

    downloadDeviceList(); // Handle being unmounted

    return () => {
      cancelled = true;
    };
  }, [cli, userId]); // Listen to changes

  (0, _react.useEffect)(() => {
    let cancel = false;

    const updateDevices = async () => {
      const newDevices = cli.getStoredDevicesForUser(userId);
      if (cancel) return;
      setDevices(newDevices);
    };

    const onDevicesUpdated = users => {
      if (!users.includes(userId)) return;
      updateDevices();
    };

    const onDeviceVerificationChanged = (_userId, device) => {
      if (_userId !== userId) return;
      updateDevices();
    };

    const onUserTrustStatusChanged = (_userId, trustStatus) => {
      if (_userId !== userId) return;
      updateDevices();
    };

    cli.on(_crypto.CryptoEvent.DevicesUpdated, onDevicesUpdated);
    cli.on(_crypto.CryptoEvent.DeviceVerificationChanged, onDeviceVerificationChanged);
    cli.on(_crypto.CryptoEvent.UserTrustStatusChanged, onUserTrustStatusChanged); // Handle being unmounted

    return () => {
      cancel = true;
      cli.removeListener(_crypto.CryptoEvent.DevicesUpdated, onDevicesUpdated);
      cli.removeListener(_crypto.CryptoEvent.DeviceVerificationChanged, onDeviceVerificationChanged);
      cli.removeListener(_crypto.CryptoEvent.UserTrustStatusChanged, onUserTrustStatusChanged);
    };
  }, [cli, userId]);
  return devices;
};

exports.useDevices = useDevices;

const BasicUserInfo = _ref13 => {
  let {
    room,
    member,
    devices,
    isRoomEncrypted
  } = _ref13;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const powerLevels = useRoomPowerLevels(cli, room); // Load whether or not we are a Synapse Admin

  const isSynapseAdmin = useIsSynapseAdmin(cli); // Check whether the user is ignored

  const [isIgnored, setIsIgnored] = (0, _react.useState)(cli.isUserIgnored(member.userId)); // Recheck if the user or client changes

  (0, _react.useEffect)(() => {
    setIsIgnored(cli.isUserIgnored(member.userId));
  }, [cli, member.userId]); // Recheck also if we receive new accountData m.ignored_user_list

  const accountDataHandler = (0, _react.useCallback)(ev => {
    if (ev.getType() === "m.ignored_user_list") {
      setIsIgnored(cli.isUserIgnored(member.userId));
    }
  }, [cli, member.userId]);
  (0, _useEventEmitter.useTypedEventEmitter)(cli, _client.ClientEvent.AccountData, accountDataHandler); // Count of how many operations are currently in progress, if > 0 then show a Spinner

  const [pendingUpdateCount, setPendingUpdateCount] = (0, _react.useState)(0);
  const startUpdating = (0, _react.useCallback)(() => {
    setPendingUpdateCount(pendingUpdateCount + 1);
  }, [pendingUpdateCount]);
  const stopUpdating = (0, _react.useCallback)(() => {
    setPendingUpdateCount(pendingUpdateCount - 1);
  }, [pendingUpdateCount]);
  const roomPermissions = useRoomPermissions(cli, room, member);
  const onSynapseDeactivate = (0, _react.useCallback)(async () => {
    const {
      finished
    } = _Modal.default.createDialog(_QuestionDialog.default, {
      title: (0, _languageHandler._t)("Deactivate user?"),
      description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Deactivating this user will log them out and prevent them from logging back in. Additionally, " + "they will leave all the rooms they are in. This action cannot be reversed. Are you sure you " + "want to deactivate this user?")),
      button: (0, _languageHandler._t)("Deactivate user"),
      danger: true
    });

    const [accepted] = await finished;
    if (!accepted) return;

    try {
      await cli.deactivateSynapseUser(member.userId);
    } catch (err) {
      _logger.logger.error("Failed to deactivate user");

      _logger.logger.error(err);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Failed to deactivate user'),
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    }
  }, [cli, member.userId]);
  let synapseDeactivateButton;
  let spinner; // We don't need a perfect check here, just something to pass as "probably not our homeserver". If
  // someone does figure out how to bypass this check the worst that happens is an error.
  // FIXME this should be using cli instead of MatrixClientPeg.matrixClient

  if (isSynapseAdmin && member.userId.endsWith(`:${_MatrixClientPeg.MatrixClientPeg.getHomeserverName()}`)) {
    synapseDeactivateButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      className: "mx_UserInfo_field mx_UserInfo_destructive",
      onClick: onSynapseDeactivate
    }, (0, _languageHandler._t)("Deactivate user"));
  }

  let memberDetails;
  let adminToolsContainer;

  if (room && member.roomId) {
    // hide the Roles section for DMs as it doesn't make sense there
    if (!_DMRoomMap.default.shared().getUserIdForRoomId(member.roomId)) {
      memberDetails = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserInfo_container"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Role in <RoomName/>", {}, {
        RoomName: () => /*#__PURE__*/_react.default.createElement("b", null, room.name)
      })), /*#__PURE__*/_react.default.createElement(PowerLevelSection, {
        powerLevels: powerLevels,
        user: member,
        room: room,
        roomPermissions: roomPermissions
      }));
    }

    adminToolsContainer = /*#__PURE__*/_react.default.createElement(RoomAdminToolsContainer, {
      powerLevels: powerLevels,
      member: member,
      room: room,
      startUpdating: startUpdating,
      stopUpdating: stopUpdating
    }, synapseDeactivateButton);
  } else if (synapseDeactivateButton) {
    adminToolsContainer = /*#__PURE__*/_react.default.createElement(GenericAdminToolsContainer, null, synapseDeactivateButton);
  }

  if (pendingUpdateCount > 0) {
    spinner = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
  } // only display the devices list if our client supports E2E


  const cryptoEnabled = cli.isCryptoEnabled();
  let text;

  if (!isRoomEncrypted) {
    if (!cryptoEnabled) {
      text = (0, _languageHandler._t)("This client does not support end-to-end encryption.");
    } else if (room && !room.isSpaceRoom()) {
      text = (0, _languageHandler._t)("Messages in this room are not end-to-end encrypted.");
    }
  } else if (!room.isSpaceRoom()) {
    text = (0, _languageHandler._t)("Messages in this room are end-to-end encrypted.");
  }

  let verifyButton;
  const homeserverSupportsCrossSigning = useHomeserverSupportsCrossSigning(cli);
  const userTrust = cryptoEnabled && cli.checkUserTrust(member.userId);
  const userVerified = cryptoEnabled && userTrust.isCrossSigningVerified();
  const isMe = member.userId === cli.getUserId();
  const canVerify = cryptoEnabled && homeserverSupportsCrossSigning && !userVerified && !isMe && devices && devices.length > 0;

  const setUpdating = updating => {
    setPendingUpdateCount(count => count + (updating ? 1 : -1));
  };

  const hasCrossSigningKeys = useHasCrossSigningKeys(cli, member, canVerify, setUpdating);
  const showDeviceListSpinner = devices === undefined;

  if (canVerify) {
    if (hasCrossSigningKeys !== undefined) {
      // Note: mx_UserInfo_verifyButton is for the end-to-end tests
      verifyButton = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserInfo_container_verifyButton"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        className: "mx_UserInfo_field mx_UserInfo_verifyButton",
        onClick: () => {
          if (hasCrossSigningKeys) {
            (0, _verification.verifyUser)(member);
          } else {
            (0, _verification.legacyVerifyUser)(member);
          }
        }
      }, (0, _languageHandler._t)("Verify")));
    } else if (!showDeviceListSpinner) {
      // HACK: only show a spinner if the device section spinner is not shown,
      // to avoid showing a double spinner
      // We should ask for a design that includes all the different loading states here
      verifyButton = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }
  }

  let editDevices;

  if (member.userId == cli.getUserId()) {
    editDevices = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      className: "mx_UserInfo_field",
      onClick: () => {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewUserSettings,
          initialTabId: _UserTab.UserTab.Security
        });
      }
    }, (0, _languageHandler._t)("Edit devices")));
  }

  const securitySection = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Security")), /*#__PURE__*/_react.default.createElement("p", null, text), verifyButton, cryptoEnabled && /*#__PURE__*/_react.default.createElement(DevicesSection, {
    loading: showDeviceListSpinner,
    devices: devices,
    userId: member.userId
  }), editDevices);

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, memberDetails, securitySection, /*#__PURE__*/_react.default.createElement(UserOptionsSection, {
    canInvite: roomPermissions.canInvite,
    isIgnored: isIgnored,
    member: member,
    isSpace: room?.isSpaceRoom()
  }), adminToolsContainer, spinner);
};

const UserInfoHeader = _ref14 => {
  let {
    member,
    e2eStatus,
    roomId
  } = _ref14;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const onMemberAvatarClick = (0, _react.useCallback)(() => {
    const avatarUrl = member.getMxcAvatarUrl ? member.getMxcAvatarUrl() : member.avatarUrl;
    if (!avatarUrl) return;
    const httpUrl = (0, _Media.mediaFromMxc)(avatarUrl).srcHttp;
    const params = {
      src: httpUrl,
      name: member.name || member.displayName
    };

    _Modal.default.createDialog(_ImageView.default, params, "mx_Dialog_lightbox", null, true);
  }, [member]);

  const avatarElement = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_avatar"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_avatar_transition"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_avatar_transition_child"
  }, /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
    key: member.userId // to instantly blank the avatar when UserInfo changes members
    ,
    member: member,
    width: 2 * 0.3 * _UIStore.default.instance.windowHeight // 2x@30vh
    ,
    height: 2 * 0.3 * _UIStore.default.instance.windowHeight // 2x@30vh
    ,
    resizeMethod: "scale",
    fallbackUserId: member.userId,
    onClick: onMemberAvatarClick,
    urls: member.avatarUrl ? [member.avatarUrl] : undefined
  }))));

  let presenceState;
  let presenceLastActiveAgo;
  let presenceCurrentlyActive;

  if (member instanceof _roomMember.RoomMember && member.user) {
    presenceState = member.user.presence;
    presenceLastActiveAgo = member.user.lastActiveAgo;
    presenceCurrentlyActive = member.user.currentlyActive;
  }

  const enablePresenceByHsUrl = _SdkConfig.default.get("enable_presence_by_hs_url");

  let showPresence = true;

  if (enablePresenceByHsUrl && enablePresenceByHsUrl[cli.baseUrl] !== undefined) {
    showPresence = enablePresenceByHsUrl[cli.baseUrl];
  }

  let presenceLabel = null;

  if (showPresence) {
    presenceLabel = /*#__PURE__*/_react.default.createElement(_PresenceLabel.default, {
      activeAgo: presenceLastActiveAgo,
      currentlyActive: presenceCurrentlyActive,
      presenceState: presenceState
    });
  }

  let e2eIcon;

  if (e2eStatus) {
    e2eIcon = /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
      size: 18,
      status: e2eStatus,
      isUser: true
    });
  }

  const displayName = member.rawDisplayName;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, avatarElement, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container mx_UserInfo_separator"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_profile"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", null, e2eIcon, /*#__PURE__*/_react.default.createElement("span", {
    title: displayName,
    "aria-label": displayName,
    dir: "auto"
  }, displayName))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_profile_mxid"
  }, _UserIdentifier.default.getDisplayUserIdentifier(member.userId, {
    roomId,
    withDisplayName: true
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_profileStatus"
  }, presenceLabel))));
};

const UserInfo = _ref15 => {
  let {
    user,
    room,
    onClose,
    phase = _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo
  } = _ref15,
      props = (0, _objectWithoutProperties2.default)(_ref15, _excluded);
  const cli = (0, _react.useContext)(_MatrixClientContext.default); // fetch latest room member if we have a room, so we don't show historical information, falling back to user

  const member = (0, _react.useMemo)(() => room ? room.getMember(user.userId) || user : user, [room, user]);
  const isRoomEncrypted = (0, _useIsEncrypted.useIsEncrypted)(cli, room);
  const devices = useDevices(user.userId);
  let e2eStatus;

  if (isRoomEncrypted && devices) {
    e2eStatus = getE2EStatus(cli, user.userId, devices);
  }

  const classes = ["mx_UserInfo"];
  let cardState; // We have no previousPhase for when viewing a UserInfo without a Room at this time

  if (room && phase === _RightPanelStorePhases.RightPanelPhases.EncryptionPanel) {
    cardState = {
      member
    };
  } else if (room?.isSpaceRoom()) {
    cardState = {
      spaceId: room.roomId
    };
  }

  const onEncryptionPanelClose = () => {
    _RightPanelStore.default.instance.popCard();
  };

  let content;

  switch (phase) {
    case _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo:
    case _RightPanelStorePhases.RightPanelPhases.SpaceMemberInfo:
      content = /*#__PURE__*/_react.default.createElement(BasicUserInfo, {
        room: room,
        member: member,
        devices: devices,
        isRoomEncrypted: isRoomEncrypted
      });
      break;

    case _RightPanelStorePhases.RightPanelPhases.EncryptionPanel:
      classes.push("mx_UserInfo_smallAvatar");
      content = /*#__PURE__*/_react.default.createElement(_EncryptionPanel.default, (0, _extends2.default)({}, props, {
        member: member,
        onClose: onEncryptionPanelClose,
        isRoomEncrypted: isRoomEncrypted
      }));
      break;
  }

  let closeLabel = undefined;

  if (phase === _RightPanelStorePhases.RightPanelPhases.EncryptionPanel) {
    const verificationRequest = props.verificationRequest;

    if (verificationRequest && verificationRequest.pending) {
      closeLabel = (0, _languageHandler._t)("Cancel");
    }
  }

  let scopeHeader;

  if (room?.isSpaceRoom()) {
    scopeHeader = /*#__PURE__*/_react.default.createElement("div", {
      "data-test-id": "space-header",
      className: "mx_RightPanel_scopeHeader"
    }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      height: 32,
      width: 32
    }), /*#__PURE__*/_react.default.createElement(_RoomName.default, {
      room: room
    }));
  }

  const header = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, scopeHeader, /*#__PURE__*/_react.default.createElement(UserInfoHeader, {
    member: member,
    e2eStatus: e2eStatus,
    roomId: room?.roomId
  }));

  return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
    className: classes.join(" "),
    header: header,
    onClose: onClose,
    closeLabel: closeLabel,
    cardState: cardState,
    onBack: ev => {
      if (_RightPanelStore.default.instance.previousCard.phase === _RightPanelStorePhases.RightPanelPhases.RoomMemberList) {
        _PosthogTrackers.default.trackInteraction("WebRightPanelRoomUserInfoBackButton", ev);
      }
    }
  }, content);
};

var _default = UserInfo;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkaXNhbWJpZ3VhdGVEZXZpY2VzIiwiZGV2aWNlcyIsIm5hbWVzIiwiT2JqZWN0IiwiY3JlYXRlIiwiaSIsImxlbmd0aCIsIm5hbWUiLCJnZXREaXNwbGF5TmFtZSIsImluZGV4TGlzdCIsInB1c2giLCJmb3JFYWNoIiwiaiIsImFtYmlndW91cyIsImdldEUyRVN0YXR1cyIsImNsaSIsInVzZXJJZCIsImlzTWUiLCJnZXRVc2VySWQiLCJ1c2VyVHJ1c3QiLCJjaGVja1VzZXJUcnVzdCIsImlzQ3Jvc3NTaWduaW5nVmVyaWZpZWQiLCJ3YXNDcm9zc1NpZ25pbmdWZXJpZmllZCIsIkUyRVN0YXR1cyIsIldhcm5pbmciLCJOb3JtYWwiLCJhbnlEZXZpY2VVbnZlcmlmaWVkIiwic29tZSIsImRldmljZSIsImRldmljZUlkIiwiZGV2aWNlVHJ1c3QiLCJjaGVja0RldmljZVRydXN0IiwiaXNWZXJpZmllZCIsIlZlcmlmaWVkIiwib3BlbkRNRm9yVXNlciIsIm1hdHJpeENsaWVudCIsInVzZXIiLCJzdGFydERNVXNlciIsIkRpcmVjdG9yeU1lbWJlciIsInVzZXJfaWQiLCJkaXNwbGF5X25hbWUiLCJyYXdEaXNwbGF5TmFtZSIsImF2YXRhcl91cmwiLCJnZXRNeGNBdmF0YXJVcmwiLCJzdGFydERtT25GaXJzdE1lc3NhZ2UiLCJ1c2VIYXNDcm9zc1NpZ25pbmdLZXlzIiwibWVtYmVyIiwiY2FuVmVyaWZ5Iiwic2V0VXBkYXRpbmciLCJ1c2VBc3luY01lbW8iLCJ1bmRlZmluZWQiLCJkb3dubG9hZEtleXMiLCJ4c2kiLCJnZXRTdG9yZWRDcm9zc1NpZ25pbmdGb3JVc2VyIiwia2V5IiwiZ2V0SWQiLCJEZXZpY2VJdGVtIiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJjbGFzc2VzIiwiY2xhc3NOYW1lcyIsIm14X1VzZXJJbmZvX2RldmljZV92ZXJpZmllZCIsIm14X1VzZXJJbmZvX2RldmljZV91bnZlcmlmaWVkIiwiaWNvbkNsYXNzZXMiLCJteF9FMkVJY29uX25vcm1hbCIsIm14X0UyRUljb25fdmVyaWZpZWQiLCJteF9FMkVJY29uX3dhcm5pbmciLCJvbkRldmljZUNsaWNrIiwidmVyaWZ5RGV2aWNlIiwiZ2V0VXNlciIsImRldmljZU5hbWUiLCJ0cmltIiwidHJ1c3RlZExhYmVsIiwiX3QiLCJEZXZpY2VzU2VjdGlvbiIsImxvYWRpbmciLCJpc0V4cGFuZGVkIiwic2V0RXhwYW5kZWQiLCJ1c2VTdGF0ZSIsImRldmljZVRydXN0cyIsIm1hcCIsImQiLCJleHBhbmRTZWN0aW9uRGV2aWNlcyIsInVudmVyaWZpZWREZXZpY2VzIiwiZXhwYW5kQ291bnRDYXB0aW9uIiwiZXhwYW5kSGlkZUNhcHRpb24iLCJleHBhbmRJY29uQ2xhc3NlcyIsImNvdW50IiwiZXhwYW5kQnV0dG9uIiwiZGV2aWNlTGlzdCIsImtleVN0YXJ0IiwiY29uY2F0IiwiTWVzc2FnZUJ1dHRvbiIsImJ1c3kiLCJzZXRCdXN5IiwiVXNlck9wdGlvbnNTZWN0aW9uIiwiaXNJZ25vcmVkIiwiY2FuSW52aXRlIiwiaXNTcGFjZSIsImlnbm9yZUJ1dHRvbiIsImluc2VydFBpbGxCdXR0b24iLCJpbnZpdGVVc2VyQnV0dG9uIiwicmVhZFJlY2VpcHRCdXR0b24iLCJvblNoYXJlVXNlckNsaWNrIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJTaGFyZURpYWxvZyIsInRhcmdldCIsIm9uSWdub3JlVG9nZ2xlIiwiaWdub3JlZFVzZXJzIiwiZ2V0SWdub3JlZFVzZXJzIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwic2V0SWdub3JlZFVzZXJzIiwibXhfVXNlckluZm9fZGVzdHJ1Y3RpdmUiLCJyb29tSWQiLCJvblJlYWRSZWNlaXB0QnV0dG9uIiwicm9vbSIsImdldFJvb20iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdSb29tIiwiaGlnaGxpZ2h0ZWQiLCJldmVudF9pZCIsImdldEV2ZW50UmVhZFVwVG8iLCJyb29tX2lkIiwibWV0cmljc1RyaWdnZXIiLCJvbkluc2VydFBpbGxCdXR0b24iLCJDb21wb3Nlckluc2VydCIsInRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlJvb20iLCJtZW1iZXJzaGlwIiwic2hvdWxkU2hvd0NvbXBvbmVudCIsIlVJQ29tcG9uZW50IiwiSW52aXRlVXNlcnMiLCJSb29tVmlld1N0b3JlIiwiaW5zdGFuY2UiLCJnZXRSb29tSWQiLCJvbkludml0ZVVzZXJCdXR0b24iLCJldiIsImludml0ZXIiLCJNdWx0aUludml0ZXIiLCJpbnZpdGUiLCJ0aGVuIiwiZ2V0Q29tcGxldGlvblN0YXRlIiwiRXJyb3IiLCJnZXRFcnJvclRleHQiLCJlcnIiLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwiUG9zdGhvZ1RyYWNrZXJzIiwidHJhY2tJbnRlcmFjdGlvbiIsInNoYXJlVXNlckJ1dHRvbiIsImRpcmVjdE1lc3NhZ2VCdXR0b24iLCJ3YXJuU2VsZkRlbW90ZSIsImZpbmlzaGVkIiwiUXVlc3Rpb25EaWFsb2ciLCJidXR0b24iLCJjb25maXJtZWQiLCJHZW5lcmljQWRtaW5Ub29sc0NvbnRhaW5lciIsImNoaWxkcmVuIiwiaXNNdXRlZCIsInBvd2VyTGV2ZWxDb250ZW50IiwibGV2ZWxUb1NlbmQiLCJldmVudHMiLCJldmVudHNfZGVmYXVsdCIsInBvd2VyTGV2ZWwiLCJnZXRQb3dlckxldmVscyIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiRXZlbnRUeXBlIiwiUm9vbVBvd2VyTGV2ZWxzIiwiZ2V0Q29udGVudCIsInVzZVJvb21Qb3dlckxldmVscyIsInBvd2VyTGV2ZWxzIiwic2V0UG93ZXJMZXZlbHMiLCJ1cGRhdGUiLCJ1c2VDYWxsYmFjayIsImdldFR5cGUiLCJ1c2VUeXBlZEV2ZW50RW1pdHRlciIsIlJvb21TdGF0ZUV2ZW50IiwiRXZlbnRzIiwidXNlRWZmZWN0IiwiUm9vbUtpY2tCdXR0b24iLCJzdGFydFVwZGF0aW5nIiwic3RvcFVwZGF0aW5nIiwib25LaWNrIiwiaXNTcGFjZVJvb20iLCJDb25maXJtU3BhY2VVc2VyQWN0aW9uRGlhbG9nIiwiQ29uZmlybVVzZXJBY3Rpb25EaWFsb2ciLCJyb29tTmFtZSIsImFza1JlYXNvbiIsImRhbmdlciIsInNwYWNlIiwic3BhY2VDaGlsZEZpbHRlciIsImNoaWxkIiwibXlNZW1iZXIiLCJnZXRNZW1iZXIiLCJjcmVkZW50aWFscyIsInRoZWlyTWVtYmVyIiwiaGFzU3VmZmljaWVudFBvd2VyTGV2ZWxGb3IiLCJhbGxMYWJlbCIsInNwZWNpZmljTGFiZWwiLCJ3YXJuaW5nTWVzc2FnZSIsInByb2NlZWQiLCJyZWFzb24iLCJyb29tcyIsImJ1bGtTcGFjZUJlaGF2aW91ciIsImtpY2siLCJsb2dnZXIiLCJsb2ciLCJlcnJvciIsImZpbmFsbHkiLCJraWNrTGFiZWwiLCJSZWRhY3RNZXNzYWdlc0J1dHRvbiIsIm9uUmVkYWN0QWxsTWVzc2FnZXMiLCJCdWxrUmVkYWN0RGlhbG9nIiwiQmFuVG9nZ2xlQnV0dG9uIiwiaXNCYW5uZWQiLCJvbkJhbk9yVW5iYW4iLCJmbiIsInVuYmFuIiwiYmFuIiwibGFiZWwiLCJNdXRlVG9nZ2xlQnV0dG9uIiwibXV0ZWQiLCJvbk11dGVUb2dnbGUiLCJlIiwicG93ZXJMZXZlbEV2ZW50IiwibGV2ZWwiLCJwYXJzZUludCIsImlzTmFOIiwic2V0UG93ZXJMZXZlbCIsIm11dGVMYWJlbCIsIlJvb21BZG1pblRvb2xzQ29udGFpbmVyIiwia2lja0J1dHRvbiIsImJhbkJ1dHRvbiIsIm11dGVCdXR0b24iLCJyZWRhY3RCdXR0b24iLCJlZGl0UG93ZXJMZXZlbCIsInN0YXRlX2RlZmF1bHQiLCJiYW5Qb3dlckxldmVsIiwia2lja1Bvd2VyTGV2ZWwiLCJyZWRhY3QiLCJyZWRhY3RQb3dlckxldmVsIiwibWUiLCJjYW5BZmZlY3RVc2VyIiwidXNlSXNTeW5hcHNlQWRtaW4iLCJpc0FkbWluIiwic2V0SXNBZG1pbiIsImlzU3luYXBzZUFkbWluaXN0cmF0b3IiLCJ1c2VIb21lc2VydmVyU3VwcG9ydHNDcm9zc1NpZ25pbmciLCJkb2VzU2VydmVyU3VwcG9ydFVuc3RhYmxlRmVhdHVyZSIsInVzZVJvb21QZXJtaXNzaW9ucyIsInJvb21QZXJtaXNzaW9ucyIsInNldFJvb21QZXJtaXNzaW9ucyIsIm1vZGlmeUxldmVsTWF4IiwiY2FuRWRpdCIsInVwZGF0ZVJvb21QZXJtaXNzaW9ucyIsInRoZW0iLCJVcGRhdGUiLCJQb3dlckxldmVsU2VjdGlvbiIsInBvd2VyTGV2ZWxVc2Vyc0RlZmF1bHQiLCJ1c2Vyc19kZWZhdWx0Iiwicm9sZSIsInRleHR1YWxQb3dlckxldmVsIiwiUG93ZXJMZXZlbEVkaXRvciIsInNlbGVjdGVkUG93ZXJMZXZlbCIsInNldFNlbGVjdGVkUG93ZXJMZXZlbCIsIm9uUG93ZXJDaGFuZ2UiLCJhcHBseVBvd2VyQ2hhbmdlIiwibXlVc2VySWQiLCJteVBvd2VyIiwidXNlcnMiLCJ1c2VEZXZpY2VzIiwic2V0RGV2aWNlcyIsImNhbmNlbGxlZCIsImRvd25sb2FkRGV2aWNlTGlzdCIsImdldFN0b3JlZERldmljZXNGb3JVc2VyIiwiY2FuY2VsIiwidXBkYXRlRGV2aWNlcyIsIm5ld0RldmljZXMiLCJvbkRldmljZXNVcGRhdGVkIiwiaW5jbHVkZXMiLCJvbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQiLCJfdXNlcklkIiwib25Vc2VyVHJ1c3RTdGF0dXNDaGFuZ2VkIiwidHJ1c3RTdGF0dXMiLCJvbiIsIkNyeXB0b0V2ZW50IiwiRGV2aWNlc1VwZGF0ZWQiLCJEZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkIiwiVXNlclRydXN0U3RhdHVzQ2hhbmdlZCIsInJlbW92ZUxpc3RlbmVyIiwiQmFzaWNVc2VySW5mbyIsImlzUm9vbUVuY3J5cHRlZCIsImlzU3luYXBzZUFkbWluIiwic2V0SXNJZ25vcmVkIiwiaXNVc2VySWdub3JlZCIsImFjY291bnREYXRhSGFuZGxlciIsIkNsaWVudEV2ZW50IiwiQWNjb3VudERhdGEiLCJwZW5kaW5nVXBkYXRlQ291bnQiLCJzZXRQZW5kaW5nVXBkYXRlQ291bnQiLCJvblN5bmFwc2VEZWFjdGl2YXRlIiwiYWNjZXB0ZWQiLCJkZWFjdGl2YXRlU3luYXBzZVVzZXIiLCJzeW5hcHNlRGVhY3RpdmF0ZUJ1dHRvbiIsInNwaW5uZXIiLCJlbmRzV2l0aCIsIk1hdHJpeENsaWVudFBlZyIsImdldEhvbWVzZXJ2ZXJOYW1lIiwibWVtYmVyRGV0YWlscyIsImFkbWluVG9vbHNDb250YWluZXIiLCJETVJvb21NYXAiLCJzaGFyZWQiLCJnZXRVc2VySWRGb3JSb29tSWQiLCJSb29tTmFtZSIsImNyeXB0b0VuYWJsZWQiLCJpc0NyeXB0b0VuYWJsZWQiLCJ0ZXh0IiwidmVyaWZ5QnV0dG9uIiwiaG9tZXNlcnZlclN1cHBvcnRzQ3Jvc3NTaWduaW5nIiwidXNlclZlcmlmaWVkIiwidXBkYXRpbmciLCJoYXNDcm9zc1NpZ25pbmdLZXlzIiwic2hvd0RldmljZUxpc3RTcGlubmVyIiwidmVyaWZ5VXNlciIsImxlZ2FjeVZlcmlmeVVzZXIiLCJlZGl0RGV2aWNlcyIsIlZpZXdVc2VyU2V0dGluZ3MiLCJpbml0aWFsVGFiSWQiLCJVc2VyVGFiIiwiU2VjdXJpdHkiLCJzZWN1cml0eVNlY3Rpb24iLCJVc2VySW5mb0hlYWRlciIsImUyZVN0YXR1cyIsIm9uTWVtYmVyQXZhdGFyQ2xpY2siLCJhdmF0YXJVcmwiLCJodHRwVXJsIiwibWVkaWFGcm9tTXhjIiwic3JjSHR0cCIsInBhcmFtcyIsInNyYyIsImRpc3BsYXlOYW1lIiwiSW1hZ2VWaWV3IiwiYXZhdGFyRWxlbWVudCIsIlVJU3RvcmUiLCJ3aW5kb3dIZWlnaHQiLCJwcmVzZW5jZVN0YXRlIiwicHJlc2VuY2VMYXN0QWN0aXZlQWdvIiwicHJlc2VuY2VDdXJyZW50bHlBY3RpdmUiLCJSb29tTWVtYmVyIiwicHJlc2VuY2UiLCJsYXN0QWN0aXZlQWdvIiwiY3VycmVudGx5QWN0aXZlIiwiZW5hYmxlUHJlc2VuY2VCeUhzVXJsIiwiU2RrQ29uZmlnIiwiZ2V0Iiwic2hvd1ByZXNlbmNlIiwiYmFzZVVybCIsInByZXNlbmNlTGFiZWwiLCJlMmVJY29uIiwiVXNlcklkZW50aWZpZXJDdXN0b21pc2F0aW9ucyIsImdldERpc3BsYXlVc2VySWRlbnRpZmllciIsIndpdGhEaXNwbGF5TmFtZSIsIlVzZXJJbmZvIiwib25DbG9zZSIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIlJvb21NZW1iZXJJbmZvIiwicHJvcHMiLCJ1c2VNZW1vIiwidXNlSXNFbmNyeXB0ZWQiLCJjYXJkU3RhdGUiLCJFbmNyeXB0aW9uUGFuZWwiLCJzcGFjZUlkIiwib25FbmNyeXB0aW9uUGFuZWxDbG9zZSIsIlJpZ2h0UGFuZWxTdG9yZSIsInBvcENhcmQiLCJjb250ZW50IiwiU3BhY2VNZW1iZXJJbmZvIiwiY2xvc2VMYWJlbCIsInZlcmlmaWNhdGlvblJlcXVlc3QiLCJwZW5kaW5nIiwic2NvcGVIZWFkZXIiLCJoZWFkZXIiLCJqb2luIiwicHJldmlvdXNDYXJkIiwiUm9vbU1lbWJlckxpc3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yaWdodF9wYW5lbC9Vc2VySW5mby50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDYWxsYmFjaywgdXNlQ29udGV4dCwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgQ2xpZW50RXZlbnQsIE1hdHJpeENsaWVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NsaWVudCc7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyJztcbmltcG9ydCB7IFVzZXIgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvdXNlcic7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuaW1wb3J0IHsgVmVyaWZpY2F0aW9uUmVxdWVzdCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vdmVyaWZpY2F0aW9uL3JlcXVlc3QvVmVyaWZpY2F0aW9uUmVxdWVzdFwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgQ3J5cHRvRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvXCI7XG5pbXBvcnQgeyBSb29tU3RhdGVFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1zdGF0ZVwiO1xuXG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tICcuLi8uLi8uLi91dGlscy9ETVJvb21NYXAnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCBNdWx0aUludml0ZXIgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL011bHRpSW52aXRlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEUyRUljb24gZnJvbSBcIi4uL3Jvb21zL0UyRUljb25cIjtcbmltcG9ydCB7IHVzZVR5cGVkRXZlbnRFbWl0dGVyIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlclwiO1xuaW1wb3J0IHsgdGV4dHVhbFBvd2VyTGV2ZWwgfSBmcm9tICcuLi8uLi8uLi9Sb2xlcyc7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHsgUmlnaHRQYW5lbFBoYXNlcyB9IGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVQaGFzZXMnO1xuaW1wb3J0IEVuY3J5cHRpb25QYW5lbCBmcm9tIFwiLi9FbmNyeXB0aW9uUGFuZWxcIjtcbmltcG9ydCB7IHVzZUFzeW5jTWVtbyB9IGZyb20gJy4uLy4uLy4uL2hvb2tzL3VzZUFzeW5jTWVtbyc7XG5pbXBvcnQgeyBsZWdhY3lWZXJpZnlVc2VyLCB2ZXJpZnlEZXZpY2UsIHZlcmlmeVVzZXIgfSBmcm9tICcuLi8uLi8uLi92ZXJpZmljYXRpb24nO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgVXNlclRhYiB9IGZyb20gXCIuLi9kaWFsb2dzL1VzZXJUYWJcIjtcbmltcG9ydCB7IHVzZUlzRW5jcnlwdGVkIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUlzRW5jcnlwdGVkXCI7XG5pbXBvcnQgQmFzZUNhcmQgZnJvbSBcIi4vQmFzZUNhcmRcIjtcbmltcG9ydCB7IEUyRVN0YXR1cyB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9TaGllbGRVdGlsc1wiO1xuaW1wb3J0IEltYWdlVmlldyBmcm9tIFwiLi4vZWxlbWVudHMvSW1hZ2VWaWV3XCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IFBvd2VyU2VsZWN0b3IgZnJvbSBcIi4uL2VsZW1lbnRzL1Bvd2VyU2VsZWN0b3JcIjtcbmltcG9ydCBNZW1iZXJBdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvTWVtYmVyQXZhdGFyXCI7XG5pbXBvcnQgUHJlc2VuY2VMYWJlbCBmcm9tIFwiLi4vcm9vbXMvUHJlc2VuY2VMYWJlbFwiO1xuaW1wb3J0IEJ1bGtSZWRhY3REaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvQnVsa1JlZGFjdERpYWxvZ1wiO1xuaW1wb3J0IFNoYXJlRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL1NoYXJlRGlhbG9nXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9RdWVzdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IENvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL0NvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9Sb29tQXZhdGFyXCI7XG5pbXBvcnQgUm9vbU5hbWUgZnJvbSBcIi4uL2VsZW1lbnRzL1Jvb21OYW1lXCI7XG5pbXBvcnQgeyBtZWRpYUZyb21NeGMgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCBVSVN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVUlTdG9yZVwiO1xuaW1wb3J0IHsgQ29tcG9zZXJJbnNlcnRQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvQ29tcG9zZXJJbnNlcnRQYXlsb2FkXCI7XG5pbXBvcnQgQ29uZmlybVNwYWNlVXNlckFjdGlvbkRpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9Db25maXJtU3BhY2VVc2VyQWN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgeyBidWxrU3BhY2VCZWhhdmlvdXIgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3BhY2VcIjtcbmltcG9ydCB7IHNob3VsZFNob3dDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvaGVscGVycy9VSUNvbXBvbmVudHNcIjtcbmltcG9ydCB7IFVJQ29tcG9uZW50IH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmUnO1xuaW1wb3J0IHsgSVJpZ2h0UGFuZWxDYXJkU3RhdGUgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvcmlnaHQtcGFuZWwvUmlnaHRQYW5lbFN0b3JlSVBhbmVsU3RhdGUnO1xuaW1wb3J0IFVzZXJJZGVudGlmaWVyQ3VzdG9taXNhdGlvbnMgZnJvbSAnLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvVXNlcklkZW50aWZpZXInO1xuaW1wb3J0IFBvc3Rob2dUcmFja2VycyBmcm9tIFwiLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCB7IERpcmVjdG9yeU1lbWJlciwgc3RhcnREbU9uRmlyc3RNZXNzYWdlIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZGlyZWN0LW1lc3NhZ2VzJztcblxuZXhwb3J0IGludGVyZmFjZSBJRGV2aWNlIHtcbiAgICBkZXZpY2VJZDogc3RyaW5nO1xuICAgIGFtYmlndW91cz86IGJvb2xlYW47XG4gICAgZ2V0RGlzcGxheU5hbWUoKTogc3RyaW5nO1xufVxuXG5jb25zdCBkaXNhbWJpZ3VhdGVEZXZpY2VzID0gKGRldmljZXM6IElEZXZpY2VbXSkgPT4ge1xuICAgIGNvbnN0IG5hbWVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGRldmljZXNbaV0uZ2V0RGlzcGxheU5hbWUoKTtcbiAgICAgICAgY29uc3QgaW5kZXhMaXN0ID0gbmFtZXNbbmFtZV0gfHwgW107XG4gICAgICAgIGluZGV4TGlzdC5wdXNoKGkpO1xuICAgICAgICBuYW1lc1tuYW1lXSA9IGluZGV4TGlzdDtcbiAgICB9XG4gICAgZm9yIChjb25zdCBuYW1lIGluIG5hbWVzKSB7XG4gICAgICAgIGlmIChuYW1lc1tuYW1lXS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBuYW1lc1tuYW1lXS5mb3JFYWNoKChqKSA9PiB7XG4gICAgICAgICAgICAgICAgZGV2aWNlc1tqXS5hbWJpZ3VvdXMgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RTJFU3RhdHVzID0gKGNsaTogTWF0cml4Q2xpZW50LCB1c2VySWQ6IHN0cmluZywgZGV2aWNlczogSURldmljZVtdKTogRTJFU3RhdHVzID0+IHtcbiAgICBjb25zdCBpc01lID0gdXNlcklkID09PSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgY29uc3QgdXNlclRydXN0ID0gY2xpLmNoZWNrVXNlclRydXN0KHVzZXJJZCk7XG4gICAgaWYgKCF1c2VyVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpKSB7XG4gICAgICAgIHJldHVybiB1c2VyVHJ1c3Qud2FzQ3Jvc3NTaWduaW5nVmVyaWZpZWQoKSA/IEUyRVN0YXR1cy5XYXJuaW5nIDogRTJFU3RhdHVzLk5vcm1hbDtcbiAgICB9XG5cbiAgICBjb25zdCBhbnlEZXZpY2VVbnZlcmlmaWVkID0gZGV2aWNlcy5zb21lKGRldmljZSA9PiB7XG4gICAgICAgIGNvbnN0IHsgZGV2aWNlSWQgfSA9IGRldmljZTtcbiAgICAgICAgLy8gRm9yIHlvdXIgb3duIGRldmljZXMsIHdlIHVzZSB0aGUgc3RyaWN0ZXIgY2hlY2sgb2YgY3Jvc3Mtc2lnbmluZ1xuICAgICAgICAvLyB2ZXJpZmljYXRpb24gdG8gZW5jb3VyYWdlIGV2ZXJ5b25lIHRvIHRydXN0IHRoZWlyIG93biBkZXZpY2VzIHZpYVxuICAgICAgICAvLyBjcm9zcy1zaWduaW5nIHNvIHRoYXQgb3RoZXIgdXNlcnMgY2FuIHRoZW4gc2FmZWx5IHRydXN0IHlvdS5cbiAgICAgICAgLy8gRm9yIG90aGVyIHBlb3BsZSdzIGRldmljZXMsIHRoZSBtb3JlIGdlbmVyYWwgdmVyaWZpZWQgY2hlY2sgdGhhdFxuICAgICAgICAvLyBpbmNsdWRlcyBsb2NhbGx5IHZlcmlmaWVkIGRldmljZXMgY2FuIGJlIHVzZWQuXG4gICAgICAgIGNvbnN0IGRldmljZVRydXN0ID0gY2xpLmNoZWNrRGV2aWNlVHJ1c3QodXNlcklkLCBkZXZpY2VJZCk7XG4gICAgICAgIHJldHVybiBpc01lID8gIWRldmljZVRydXN0LmlzQ3Jvc3NTaWduaW5nVmVyaWZpZWQoKSA6ICFkZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFueURldmljZVVudmVyaWZpZWQgPyBFMkVTdGF0dXMuV2FybmluZyA6IEUyRVN0YXR1cy5WZXJpZmllZDtcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIG9wZW5ETUZvclVzZXIobWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQsIHVzZXI6IFJvb21NZW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdGFydERNVXNlciA9IG5ldyBEaXJlY3RvcnlNZW1iZXIoe1xuICAgICAgICB1c2VyX2lkOiB1c2VyLnVzZXJJZCxcbiAgICAgICAgZGlzcGxheV9uYW1lOiB1c2VyLnJhd0Rpc3BsYXlOYW1lLFxuICAgICAgICBhdmF0YXJfdXJsOiB1c2VyLmdldE14Y0F2YXRhclVybCgpLFxuICAgIH0pO1xuICAgIHN0YXJ0RG1PbkZpcnN0TWVzc2FnZShtYXRyaXhDbGllbnQsIFtzdGFydERNVXNlcl0pO1xufVxuXG50eXBlIFNldFVwZGF0aW5nID0gKHVwZGF0aW5nOiBib29sZWFuKSA9PiB2b2lkO1xuXG5mdW5jdGlvbiB1c2VIYXNDcm9zc1NpZ25pbmdLZXlzKGNsaTogTWF0cml4Q2xpZW50LCBtZW1iZXI6IFVzZXIsIGNhblZlcmlmeTogYm9vbGVhbiwgc2V0VXBkYXRpbmc6IFNldFVwZGF0aW5nKSB7XG4gICAgcmV0dXJuIHVzZUFzeW5jTWVtbyhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghY2FuVmVyaWZ5KSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHNldFVwZGF0aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY2xpLmRvd25sb2FkS2V5cyhbbWVtYmVyLnVzZXJJZF0pO1xuICAgICAgICAgICAgY29uc3QgeHNpID0gY2xpLmdldFN0b3JlZENyb3NzU2lnbmluZ0ZvclVzZXIobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB4c2kgJiYgeHNpLmdldElkKCk7XG4gICAgICAgICAgICByZXR1cm4gISFrZXk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBzZXRVcGRhdGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbY2xpLCBtZW1iZXIsIGNhblZlcmlmeV0sIHVuZGVmaW5lZCk7XG59XG5cbmZ1bmN0aW9uIERldmljZUl0ZW0oeyB1c2VySWQsIGRldmljZSB9OiB7IHVzZXJJZDogc3RyaW5nLCBkZXZpY2U6IElEZXZpY2UgfSkge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgaXNNZSA9IHVzZXJJZCA9PT0gY2xpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IGRldmljZVRydXN0ID0gY2xpLmNoZWNrRGV2aWNlVHJ1c3QodXNlcklkLCBkZXZpY2UuZGV2aWNlSWQpO1xuICAgIGNvbnN0IHVzZXJUcnVzdCA9IGNsaS5jaGVja1VzZXJUcnVzdCh1c2VySWQpO1xuICAgIC8vIEZvciB5b3VyIG93biBkZXZpY2VzLCB3ZSB1c2UgdGhlIHN0cmljdGVyIGNoZWNrIG9mIGNyb3NzLXNpZ25pbmdcbiAgICAvLyB2ZXJpZmljYXRpb24gdG8gZW5jb3VyYWdlIGV2ZXJ5b25lIHRvIHRydXN0IHRoZWlyIG93biBkZXZpY2VzIHZpYVxuICAgIC8vIGNyb3NzLXNpZ25pbmcgc28gdGhhdCBvdGhlciB1c2VycyBjYW4gdGhlbiBzYWZlbHkgdHJ1c3QgeW91LlxuICAgIC8vIEZvciBvdGhlciBwZW9wbGUncyBkZXZpY2VzLCB0aGUgbW9yZSBnZW5lcmFsIHZlcmlmaWVkIGNoZWNrIHRoYXRcbiAgICAvLyBpbmNsdWRlcyBsb2NhbGx5IHZlcmlmaWVkIGRldmljZXMgY2FuIGJlIHVzZWQuXG4gICAgY29uc3QgaXNWZXJpZmllZCA9IGlzTWUgPyBkZXZpY2VUcnVzdC5pc0Nyb3NzU2lnbmluZ1ZlcmlmaWVkKCkgOiBkZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCk7XG5cbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1VzZXJJbmZvX2RldmljZVwiLCB7XG4gICAgICAgIG14X1VzZXJJbmZvX2RldmljZV92ZXJpZmllZDogaXNWZXJpZmllZCxcbiAgICAgICAgbXhfVXNlckluZm9fZGV2aWNlX3VudmVyaWZpZWQ6ICFpc1ZlcmlmaWVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGljb25DbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X0UyRUljb25cIiwge1xuICAgICAgICBteF9FMkVJY29uX25vcm1hbDogIXVzZXJUcnVzdC5pc1ZlcmlmaWVkKCksXG4gICAgICAgIG14X0UyRUljb25fdmVyaWZpZWQ6IGlzVmVyaWZpZWQsXG4gICAgICAgIG14X0UyRUljb25fd2FybmluZzogdXNlclRydXN0LmlzVmVyaWZpZWQoKSAmJiAhaXNWZXJpZmllZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IG9uRGV2aWNlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHZlcmlmeURldmljZShjbGkuZ2V0VXNlcih1c2VySWQpLCBkZXZpY2UpO1xuICAgIH07XG5cbiAgICBsZXQgZGV2aWNlTmFtZTtcbiAgICBpZiAoIWRldmljZS5nZXREaXNwbGF5TmFtZSgpPy50cmltKCkpIHtcbiAgICAgICAgZGV2aWNlTmFtZSA9IGRldmljZS5kZXZpY2VJZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkZXZpY2VOYW1lID0gZGV2aWNlLmFtYmlndW91cyA/XG4gICAgICAgICAgICBkZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSArIFwiIChcIiArIGRldmljZS5kZXZpY2VJZCArIFwiKVwiIDpcbiAgICAgICAgICAgIGRldmljZS5nZXREaXNwbGF5TmFtZSgpO1xuICAgIH1cblxuICAgIGxldCB0cnVzdGVkTGFiZWwgPSBudWxsO1xuICAgIGlmICh1c2VyVHJ1c3QuaXNWZXJpZmllZCgpKSB0cnVzdGVkTGFiZWwgPSBpc1ZlcmlmaWVkID8gX3QoXCJUcnVzdGVkXCIpIDogX3QoXCJOb3QgdHJ1c3RlZFwiKTtcblxuICAgIGlmIChpc1ZlcmlmaWVkKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30gdGl0bGU9e2RldmljZS5kZXZpY2VJZH0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2ljb25DbGFzc2VzfSAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZGV2aWNlX25hbWVcIj57IGRldmljZU5hbWUgfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZGV2aWNlX3RydXN0ZWRcIj57IHRydXN0ZWRMYWJlbCB9PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2RldmljZS5kZXZpY2VJZH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbkRldmljZUNsaWNrfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtpY29uQ2xhc3Nlc30gLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2RldmljZV9uYW1lXCI+eyBkZXZpY2VOYW1lIH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2RldmljZV90cnVzdGVkXCI+eyB0cnVzdGVkTGFiZWwgfTwvZGl2PlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gRGV2aWNlc1NlY3Rpb24oeyBkZXZpY2VzLCB1c2VySWQsIGxvYWRpbmcgfTogeyBkZXZpY2VzOiBJRGV2aWNlW10sIHVzZXJJZDogc3RyaW5nLCBsb2FkaW5nOiBib29sZWFuIH0pIHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IHVzZXJUcnVzdCA9IGNsaS5jaGVja1VzZXJUcnVzdCh1c2VySWQpO1xuXG4gICAgY29uc3QgW2lzRXhwYW5kZWQsIHNldEV4cGFuZGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGlmIChsb2FkaW5nKSB7XG4gICAgICAgIC8vIHN0aWxsIGxvYWRpbmdcbiAgICAgICAgcmV0dXJuIDxTcGlubmVyIC8+O1xuICAgIH1cbiAgICBpZiAoZGV2aWNlcyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gPHA+eyBfdChcIlVuYWJsZSB0byBsb2FkIHNlc3Npb24gbGlzdFwiKSB9PC9wPjtcbiAgICB9XG4gICAgY29uc3QgaXNNZSA9IHVzZXJJZCA9PT0gY2xpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IGRldmljZVRydXN0cyA9IGRldmljZXMubWFwKGQgPT4gY2xpLmNoZWNrRGV2aWNlVHJ1c3QodXNlcklkLCBkLmRldmljZUlkKSk7XG5cbiAgICBsZXQgZXhwYW5kU2VjdGlvbkRldmljZXMgPSBbXTtcbiAgICBjb25zdCB1bnZlcmlmaWVkRGV2aWNlcyA9IFtdO1xuXG4gICAgbGV0IGV4cGFuZENvdW50Q2FwdGlvbjtcbiAgICBsZXQgZXhwYW5kSGlkZUNhcHRpb247XG4gICAgbGV0IGV4cGFuZEljb25DbGFzc2VzID0gXCJteF9FMkVJY29uXCI7XG5cbiAgICBpZiAodXNlclRydXN0LmlzVmVyaWZpZWQoKSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IGRldmljZXNbaV07XG4gICAgICAgICAgICBjb25zdCBkZXZpY2VUcnVzdCA9IGRldmljZVRydXN0c1tpXTtcbiAgICAgICAgICAgIC8vIEZvciB5b3VyIG93biBkZXZpY2VzLCB3ZSB1c2UgdGhlIHN0cmljdGVyIGNoZWNrIG9mIGNyb3NzLXNpZ25pbmdcbiAgICAgICAgICAgIC8vIHZlcmlmaWNhdGlvbiB0byBlbmNvdXJhZ2UgZXZlcnlvbmUgdG8gdHJ1c3QgdGhlaXIgb3duIGRldmljZXMgdmlhXG4gICAgICAgICAgICAvLyBjcm9zcy1zaWduaW5nIHNvIHRoYXQgb3RoZXIgdXNlcnMgY2FuIHRoZW4gc2FmZWx5IHRydXN0IHlvdS5cbiAgICAgICAgICAgIC8vIEZvciBvdGhlciBwZW9wbGUncyBkZXZpY2VzLCB0aGUgbW9yZSBnZW5lcmFsIHZlcmlmaWVkIGNoZWNrIHRoYXRcbiAgICAgICAgICAgIC8vIGluY2x1ZGVzIGxvY2FsbHkgdmVyaWZpZWQgZGV2aWNlcyBjYW4gYmUgdXNlZC5cbiAgICAgICAgICAgIGNvbnN0IGlzVmVyaWZpZWQgPSBpc01lID8gZGV2aWNlVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpIDogZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpO1xuXG4gICAgICAgICAgICBpZiAoaXNWZXJpZmllZCkge1xuICAgICAgICAgICAgICAgIGV4cGFuZFNlY3Rpb25EZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdW52ZXJpZmllZERldmljZXMucHVzaChkZXZpY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV4cGFuZENvdW50Q2FwdGlvbiA9IF90KFwiJShjb3VudClzIHZlcmlmaWVkIHNlc3Npb25zXCIsIHsgY291bnQ6IGV4cGFuZFNlY3Rpb25EZXZpY2VzLmxlbmd0aCB9KTtcbiAgICAgICAgZXhwYW5kSGlkZUNhcHRpb24gPSBfdChcIkhpZGUgdmVyaWZpZWQgc2Vzc2lvbnNcIik7XG4gICAgICAgIGV4cGFuZEljb25DbGFzc2VzICs9IFwiIG14X0UyRUljb25fdmVyaWZpZWRcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBleHBhbmRTZWN0aW9uRGV2aWNlcyA9IGRldmljZXM7XG4gICAgICAgIGV4cGFuZENvdW50Q2FwdGlvbiA9IF90KFwiJShjb3VudClzIHNlc3Npb25zXCIsIHsgY291bnQ6IGRldmljZXMubGVuZ3RoIH0pO1xuICAgICAgICBleHBhbmRIaWRlQ2FwdGlvbiA9IF90KFwiSGlkZSBzZXNzaW9uc1wiKTtcbiAgICAgICAgZXhwYW5kSWNvbkNsYXNzZXMgKz0gXCIgbXhfRTJFSWNvbl9ub3JtYWxcIjtcbiAgICB9XG5cbiAgICBsZXQgZXhwYW5kQnV0dG9uO1xuICAgIGlmIChleHBhbmRTZWN0aW9uRGV2aWNlcy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGlzRXhwYW5kZWQpIHtcbiAgICAgICAgICAgIGV4cGFuZEJ1dHRvbiA9ICg8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19leHBhbmRcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEV4cGFuZGVkKGZhbHNlKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2PnsgZXhwYW5kSGlkZUNhcHRpb24gfTwvZGl2PlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHBhbmRCdXR0b24gPSAoPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZXhwYW5kXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRFeHBhbmRlZCh0cnVlKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17ZXhwYW5kSWNvbkNsYXNzZXN9IC8+XG4gICAgICAgICAgICAgICAgPGRpdj57IGV4cGFuZENvdW50Q2FwdGlvbiB9PC9kaXY+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCBkZXZpY2VMaXN0ID0gdW52ZXJpZmllZERldmljZXMubWFwKChkZXZpY2UsIGkpID0+IHtcbiAgICAgICAgcmV0dXJuICg8RGV2aWNlSXRlbSBrZXk9e2l9IHVzZXJJZD17dXNlcklkfSBkZXZpY2U9e2RldmljZX0gLz4pO1xuICAgIH0pO1xuICAgIGlmIChpc0V4cGFuZGVkKSB7XG4gICAgICAgIGNvbnN0IGtleVN0YXJ0ID0gdW52ZXJpZmllZERldmljZXMubGVuZ3RoO1xuICAgICAgICBkZXZpY2VMaXN0ID0gZGV2aWNlTGlzdC5jb25jYXQoZXhwYW5kU2VjdGlvbkRldmljZXMubWFwKChkZXZpY2UsIGkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoPERldmljZUl0ZW0ga2V5PXtpICsga2V5U3RhcnR9IHVzZXJJZD17dXNlcklkfSBkZXZpY2U9e2RldmljZX0gLz4pO1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19kZXZpY2VzXCI+XG4gICAgICAgICAgICA8ZGl2PnsgZGV2aWNlTGlzdCB9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PnsgZXhwYW5kQnV0dG9uIH08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cblxuY29uc3QgTWVzc2FnZUJ1dHRvbiA9ICh7IG1lbWJlciB9OiB7IG1lbWJlcjogUm9vbU1lbWJlciB9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChidXN5KSByZXR1cm47XG4gICAgICAgICAgICAgICAgc2V0QnVzeSh0cnVlKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBvcGVuRE1Gb3JVc2VyKGNsaSwgbWVtYmVyKTtcbiAgICAgICAgICAgICAgICBzZXRCdXN5KGZhbHNlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiXG4gICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBfdChcIk1lc3NhZ2VcIikgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgKTtcbn07XG5cbmNvbnN0IFVzZXJPcHRpb25zU2VjdGlvbjogUmVhY3QuRkM8e1xuICAgIG1lbWJlcjogUm9vbU1lbWJlcjtcbiAgICBpc0lnbm9yZWQ6IGJvb2xlYW47XG4gICAgY2FuSW52aXRlOiBib29sZWFuO1xuICAgIGlzU3BhY2U/OiBib29sZWFuO1xufT4gPSAoeyBtZW1iZXIsIGlzSWdub3JlZCwgY2FuSW52aXRlLCBpc1NwYWNlIH0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgbGV0IGlnbm9yZUJ1dHRvbiA9IG51bGw7XG4gICAgbGV0IGluc2VydFBpbGxCdXR0b24gPSBudWxsO1xuICAgIGxldCBpbnZpdGVVc2VyQnV0dG9uID0gbnVsbDtcbiAgICBsZXQgcmVhZFJlY2VpcHRCdXR0b24gPSBudWxsO1xuXG4gICAgY29uc3QgaXNNZSA9IG1lbWJlci51c2VySWQgPT09IGNsaS5nZXRVc2VySWQoKTtcblxuICAgIGNvbnN0IG9uU2hhcmVVc2VyQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhTaGFyZURpYWxvZywge1xuICAgICAgICAgICAgdGFyZ2V0OiBtZW1iZXIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBPbmx5IGFsbG93IHRoZSB1c2VyIHRvIGlnbm9yZSB0aGUgdXNlciBpZiBpdHMgbm90IG91cnNlbHZlc1xuICAgIC8vIHNhbWUgZ29lcyBmb3IganVtcGluZyB0byByZWFkIHJlY2VpcHRcbiAgICBpZiAoIWlzTWUpIHtcbiAgICAgICAgY29uc3Qgb25JZ25vcmVUb2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZ25vcmVkVXNlcnMgPSBjbGkuZ2V0SWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICBpZiAoaXNJZ25vcmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBpZ25vcmVkVXNlcnMuaW5kZXhPZihtZW1iZXIudXNlcklkKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSBpZ25vcmVkVXNlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWdub3JlZFVzZXJzLnB1c2gobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsaS5zZXRJZ25vcmVkVXNlcnMoaWdub3JlZFVzZXJzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZ25vcmVCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbklnbm9yZVRvZ2dsZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9Vc2VySW5mb19maWVsZFwiLCB7IG14X1VzZXJJbmZvX2Rlc3RydWN0aXZlOiAhaXNJZ25vcmVkIH0pfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgaXNJZ25vcmVkID8gX3QoXCJVbmlnbm9yZVwiKSA6IF90KFwiSWdub3JlXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobWVtYmVyLnJvb21JZCAmJiAhaXNTcGFjZSkge1xuICAgICAgICAgICAgY29uc3Qgb25SZWFkUmVjZWlwdEJ1dHRvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShtZW1iZXIucm9vbUlkKTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IHJvb20uZ2V0RXZlbnRSZWFkVXBUbyhtZW1iZXIudXNlcklkKSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogbWVtYmVyLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IHVuZGVmaW5lZCwgLy8gcm9vbSBkb2Vzbid0IGNoYW5nZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgb25JbnNlcnRQaWxsQnV0dG9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPENvbXBvc2VySW5zZXJ0UGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Db21wb3Nlckluc2VydCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBtZW1iZXIudXNlcklkLFxuICAgICAgICAgICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKG1lbWJlci5yb29tSWQpO1xuICAgICAgICAgICAgaWYgKHJvb20/LmdldEV2ZW50UmVhZFVwVG8obWVtYmVyLnVzZXJJZCkpIHtcbiAgICAgICAgICAgICAgICByZWFkUmVjZWlwdEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uUmVhZFJlY2VpcHRCdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0p1bXAgdG8gcmVhZCByZWNlaXB0JykgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5zZXJ0UGlsbEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uSW5zZXJ0UGlsbEJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fZmllbGRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnTWVudGlvbicpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbkludml0ZSAmJiAobWVtYmVyPy5tZW1iZXJzaGlwID8/ICdsZWF2ZScpID09PSAnbGVhdmUnICYmIHNob3VsZFNob3dDb21wb25lbnQoVUlDb21wb25lbnQuSW52aXRlVXNlcnMpKSB7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBtZW1iZXIgJiYgbWVtYmVyLnJvb21JZCA/IG1lbWJlci5yb29tSWQgOiBSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFJvb21JZCgpO1xuICAgICAgICAgICAgY29uc3Qgb25JbnZpdGVVc2VyQnV0dG9uID0gYXN5bmMgKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHVzZSBhIE11bHRpSW52aXRlciB0byByZS11c2UgdGhlIGludml0ZSBsb2dpYywgZXZlbiB0aG91Z2ggd2UncmUgb25seSBpbnZpdGluZyBvbmUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW52aXRlciA9IG5ldyBNdWx0aUludml0ZXIocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgaW52aXRlci5pbnZpdGUoW21lbWJlci51c2VySWRdKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnZpdGVyLmdldENvbXBsZXRpb25TdGF0ZShtZW1iZXIudXNlcklkKSAhPT0gXCJpbnZpdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52aXRlci5nZXRFcnJvclRleHQobWVtYmVyLnVzZXJJZCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byBpbnZpdGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViUmlnaHRQYW5lbFJvb21Vc2VySW5mb0ludml0ZUJ1dHRvblwiLCBldik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpbnZpdGVVc2VyQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25JbnZpdGVVc2VyQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdJbnZpdGUnKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNoYXJlVXNlckJ1dHRvbiA9IChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e29uU2hhcmVVc2VyQ2xpY2t9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiXG4gICAgICAgID5cbiAgICAgICAgICAgIHsgX3QoJ1NoYXJlIExpbmsgdG8gVXNlcicpIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICk7XG5cbiAgICBsZXQgZGlyZWN0TWVzc2FnZUJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKCFpc01lKSB7XG4gICAgICAgIGRpcmVjdE1lc3NhZ2VCdXR0b24gPSA8TWVzc2FnZUJ1dHRvbiBtZW1iZXI9e21lbWJlcn0gLz47XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxoMz57IF90KFwiT3B0aW9uc1wiKSB9PC9oMz5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgeyBkaXJlY3RNZXNzYWdlQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHJlYWRSZWNlaXB0QnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHNoYXJlVXNlckJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBpbnNlcnRQaWxsQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IGludml0ZVVzZXJCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgaWdub3JlQnV0dG9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufTtcblxuY29uc3Qgd2FyblNlbGZEZW1vdGUgPSBhc3luYyAoaXNTcGFjZTogYm9vbGVhbikgPT4ge1xuICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICB0aXRsZTogX3QoXCJEZW1vdGUgeW91cnNlbGY/XCIpLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgeyBpc1NwYWNlXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCJZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byB1bmRvIHRoaXMgY2hhbmdlIGFzIHlvdSBhcmUgZGVtb3RpbmcgeW91cnNlbGYsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaWYgeW91IGFyZSB0aGUgbGFzdCBwcml2aWxlZ2VkIHVzZXIgaW4gdGhlIHNwYWNlIGl0IHdpbGwgYmUgaW1wb3NzaWJsZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvIHJlZ2FpbiBwcml2aWxlZ2VzLlwiKVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiWW91IHdpbGwgbm90IGJlIGFibGUgdG8gdW5kbyB0aGlzIGNoYW5nZSBhcyB5b3UgYXJlIGRlbW90aW5nIHlvdXJzZWxmLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImlmIHlvdSBhcmUgdGhlIGxhc3QgcHJpdmlsZWdlZCB1c2VyIGluIHRoZSByb29tIGl0IHdpbGwgYmUgaW1wb3NzaWJsZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvIHJlZ2FpbiBwcml2aWxlZ2VzLlwiKSB9XG4gICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgIGJ1dHRvbjogX3QoXCJEZW1vdGVcIiksXG4gICAgfSk7XG5cbiAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgIHJldHVybiBjb25maXJtZWQ7XG59O1xuXG5jb25zdCBHZW5lcmljQWRtaW5Ub29sc0NvbnRhaW5lcjogUmVhY3QuRkM8e30+ID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8aDM+eyBfdChcIkFkbWluIFRvb2xzXCIpIH08L2gzPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn07XG5cbmludGVyZmFjZSBJUG93ZXJMZXZlbHNDb250ZW50IHtcbiAgICBldmVudHM/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICB1c2Vyc19kZWZhdWx0PzogbnVtYmVyO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBldmVudHNfZGVmYXVsdD86IG51bWJlcjtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc3RhdGVfZGVmYXVsdD86IG51bWJlcjtcbiAgICBiYW4/OiBudW1iZXI7XG4gICAga2ljaz86IG51bWJlcjtcbiAgICByZWRhY3Q/OiBudW1iZXI7XG59XG5cbmNvbnN0IGlzTXV0ZWQgPSAobWVtYmVyOiBSb29tTWVtYmVyLCBwb3dlckxldmVsQ29udGVudDogSVBvd2VyTGV2ZWxzQ29udGVudCkgPT4ge1xuICAgIGlmICghcG93ZXJMZXZlbENvbnRlbnQgfHwgIW1lbWJlcikgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgbGV2ZWxUb1NlbmQgPSAoXG4gICAgICAgIChwb3dlckxldmVsQ29udGVudC5ldmVudHMgPyBwb3dlckxldmVsQ29udGVudC5ldmVudHNbXCJtLnJvb20ubWVzc2FnZVwiXSA6IG51bGwpIHx8XG4gICAgICAgIHBvd2VyTGV2ZWxDb250ZW50LmV2ZW50c19kZWZhdWx0XG4gICAgKTtcbiAgICByZXR1cm4gbWVtYmVyLnBvd2VyTGV2ZWwgPCBsZXZlbFRvU2VuZDtcbn07XG5cbmNvbnN0IGdldFBvd2VyTGV2ZWxzID0gcm9vbSA9PiByb29tPy5jdXJyZW50U3RhdGU/LmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHMsIFwiXCIpPy5nZXRDb250ZW50KCkgfHwge307XG5cbmV4cG9ydCBjb25zdCB1c2VSb29tUG93ZXJMZXZlbHMgPSAoY2xpOiBNYXRyaXhDbGllbnQsIHJvb206IFJvb20pID0+IHtcbiAgICBjb25zdCBbcG93ZXJMZXZlbHMsIHNldFBvd2VyTGV2ZWxzXSA9IHVzZVN0YXRlPElQb3dlckxldmVsc0NvbnRlbnQ+KGdldFBvd2VyTGV2ZWxzKHJvb20pKTtcblxuICAgIGNvbnN0IHVwZGF0ZSA9IHVzZUNhbGxiYWNrKChldj86IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghcm9vbSkgcmV0dXJuO1xuICAgICAgICBpZiAoZXYgJiYgZXYuZ2V0VHlwZSgpICE9PSBFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzKSByZXR1cm47XG4gICAgICAgIHNldFBvd2VyTGV2ZWxzKGdldFBvd2VyTGV2ZWxzKHJvb20pKTtcbiAgICB9LCBbcm9vbV0pO1xuXG4gICAgdXNlVHlwZWRFdmVudEVtaXR0ZXIoY2xpLCBSb29tU3RhdGVFdmVudC5FdmVudHMsIHVwZGF0ZSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQb3dlckxldmVscyh7fSk7XG4gICAgICAgIH07XG4gICAgfSwgW3VwZGF0ZV0pO1xuICAgIHJldHVybiBwb3dlckxldmVscztcbn07XG5cbmludGVyZmFjZSBJQmFzZVByb3BzIHtcbiAgICBtZW1iZXI6IFJvb21NZW1iZXI7XG4gICAgc3RhcnRVcGRhdGluZygpOiB2b2lkO1xuICAgIHN0b3BVcGRhdGluZygpOiB2b2lkO1xufVxuXG5jb25zdCBSb29tS2lja0J1dHRvbiA9ICh7IHJvb20sIG1lbWJlciwgc3RhcnRVcGRhdGluZywgc3RvcFVwZGF0aW5nIH06IE9taXQ8SUJhc2VSb29tUHJvcHMsIFwicG93ZXJMZXZlbHNcIj4pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgLy8gY2hlY2sgaWYgdXNlciBjYW4gYmUga2lja2VkL2Rpc2ludml0ZWRcbiAgICBpZiAobWVtYmVyLm1lbWJlcnNoaXAgIT09IFwiaW52aXRlXCIgJiYgbWVtYmVyLm1lbWJlcnNoaXAgIT09IFwiam9pblwiKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IG9uS2ljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKFxuICAgICAgICAgICAgcm9vbS5pc1NwYWNlUm9vbSgpID8gQ29uZmlybVNwYWNlVXNlckFjdGlvbkRpYWxvZyA6IENvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lbWJlcixcbiAgICAgICAgICAgICAgICBhY3Rpb246IHJvb20uaXNTcGFjZVJvb20oKSA/XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlci5tZW1iZXJzaGlwID09PSBcImludml0ZVwiID8gX3QoXCJEaXNpbnZpdGUgZnJvbSBzcGFjZVwiKSA6IF90KFwiUmVtb3ZlIGZyb20gc3BhY2VcIilcbiAgICAgICAgICAgICAgICAgICAgOiBtZW1iZXIubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIiA/IF90KFwiRGlzaW52aXRlIGZyb20gcm9vbVwiKSA6IF90KFwiUmVtb3ZlIGZyb20gcm9vbVwiKSxcbiAgICAgICAgICAgICAgICB0aXRsZTogbWVtYmVyLm1lbWJlcnNoaXAgPT09IFwiaW52aXRlXCJcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIkRpc2ludml0ZSBmcm9tICUocm9vbU5hbWUpc1wiLCB7IHJvb21OYW1lOiByb29tLm5hbWUgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIlJlbW92ZSBmcm9tICUocm9vbU5hbWUpc1wiLCB7IHJvb21OYW1lOiByb29tLm5hbWUgfSksXG4gICAgICAgICAgICAgICAgYXNrUmVhc29uOiBtZW1iZXIubWVtYmVyc2hpcCA9PT0gXCJqb2luXCIsXG4gICAgICAgICAgICAgICAgZGFuZ2VyOiB0cnVlLFxuICAgICAgICAgICAgICAgIC8vIHNwYWNlLXNwZWNpZmljIHByb3BzXG4gICAgICAgICAgICAgICAgc3BhY2U6IHJvb20sXG4gICAgICAgICAgICAgICAgc3BhY2VDaGlsZEZpbHRlcjogKGNoaWxkOiBSb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJldHVybiB0cnVlIGlmIHRoZSB0YXJnZXQgbWVtYmVyIGlzIG5vdCBiYW5uZWQgYW5kIHdlIGhhdmUgc3VmZmljaWVudCBQTCB0byBiYW4gdGhlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBteU1lbWJlciA9IGNoaWxkLmdldE1lbWJlcihjbGkuY3JlZGVudGlhbHMudXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGhlaXJNZW1iZXIgPSBjaGlsZC5nZXRNZW1iZXIobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBteU1lbWJlciAmJiB0aGVpck1lbWJlciAmJiB0aGVpck1lbWJlci5tZW1iZXJzaGlwID09PSBtZW1iZXIubWVtYmVyc2hpcCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbXlNZW1iZXIucG93ZXJMZXZlbCA+IHRoZWlyTWVtYmVyLnBvd2VyTGV2ZWwgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmN1cnJlbnRTdGF0ZS5oYXNTdWZmaWNpZW50UG93ZXJMZXZlbEZvcihcImtpY2tcIiwgbXlNZW1iZXIucG93ZXJMZXZlbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhbGxMYWJlbDogX3QoXCJSZW1vdmUgdGhlbSBmcm9tIGV2ZXJ5dGhpbmcgSSdtIGFibGUgdG9cIiksXG4gICAgICAgICAgICAgICAgc3BlY2lmaWNMYWJlbDogX3QoXCJSZW1vdmUgdGhlbSBmcm9tIHNwZWNpZmljIHRoaW5ncyBJJ20gYWJsZSB0b1wiKSxcbiAgICAgICAgICAgICAgICB3YXJuaW5nTWVzc2FnZTogX3QoXCJUaGV5J2xsIHN0aWxsIGJlIGFibGUgdG8gYWNjZXNzIHdoYXRldmVyIHlvdSdyZSBub3QgYW4gYWRtaW4gb2YuXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJvb20uaXNTcGFjZVJvb20oKSA/IFwibXhfQ29uZmlybVNwYWNlVXNlckFjdGlvbkRpYWxvZ193cmFwcGVyXCIgOiB1bmRlZmluZWQsXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgW3Byb2NlZWQsIHJlYXNvbiwgcm9vbXMgPSBbXV0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgaWYgKCFwcm9jZWVkKSByZXR1cm47XG5cbiAgICAgICAgc3RhcnRVcGRhdGluZygpO1xuXG4gICAgICAgIGJ1bGtTcGFjZUJlaGF2aW91cihyb29tLCByb29tcywgcm9vbSA9PiBjbGkua2ljayhyb29tLnJvb21JZCwgbWVtYmVyLnVzZXJJZCwgcmVhc29uIHx8IHVuZGVmaW5lZCkpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gTk8tT1A7IHJlbHkgb24gdGhlIG0ucm9vbS5tZW1iZXIgZXZlbnQgY29taW5nIGRvd24gZWxzZSB3ZSBjb3VsZFxuICAgICAgICAgICAgLy8gZ2V0IG91dCBvZiBzeW5jIGlmIHdlIGZvcmNlIHNldFN0YXRlIGhlcmUhXG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiS2ljayBzdWNjZXNzXCIpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIktpY2sgZXJyb3I6IFwiICsgZXJyKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byByZW1vdmUgdXNlclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBcIk9wZXJhdGlvbiBmYWlsZWRcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBzdG9wVXBkYXRpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGtpY2tMYWJlbCA9IHJvb20uaXNTcGFjZVJvb20oKSA/XG4gICAgICAgIG1lbWJlci5tZW1iZXJzaGlwID09PSBcImludml0ZVwiID8gX3QoXCJEaXNpbnZpdGUgZnJvbSBzcGFjZVwiKSA6IF90KFwiUmVtb3ZlIGZyb20gc3BhY2VcIilcbiAgICAgICAgOiBtZW1iZXIubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIiA/IF90KFwiRGlzaW52aXRlIGZyb20gcm9vbVwiKSA6IF90KFwiUmVtb3ZlIGZyb20gcm9vbVwiKTtcblxuICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2ZpZWxkIG14X1VzZXJJbmZvX2Rlc3RydWN0aXZlXCJcbiAgICAgICAgb25DbGljaz17b25LaWNrfVxuICAgID5cbiAgICAgICAgeyBraWNrTGFiZWwgfVxuICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG59O1xuXG5jb25zdCBSZWRhY3RNZXNzYWdlc0J1dHRvbjogUmVhY3QuRkM8SUJhc2VQcm9wcz4gPSAoeyBtZW1iZXIgfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBvblJlZGFjdEFsbE1lc3NhZ2VzID0gKCkgPT4ge1xuICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20obWVtYmVyLnJvb21JZCk7XG4gICAgICAgIGlmICghcm9vbSkgcmV0dXJuO1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhCdWxrUmVkYWN0RGlhbG9nLCB7XG4gICAgICAgICAgICBtYXRyaXhDbGllbnQ6IGNsaSxcbiAgICAgICAgICAgIHJvb20sIG1lbWJlcixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2ZpZWxkIG14X1VzZXJJbmZvX2Rlc3RydWN0aXZlXCJcbiAgICAgICAgb25DbGljaz17b25SZWRhY3RBbGxNZXNzYWdlc31cbiAgICA+XG4gICAgICAgIHsgX3QoXCJSZW1vdmUgcmVjZW50IG1lc3NhZ2VzXCIpIH1cbiAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xufTtcblxuY29uc3QgQmFuVG9nZ2xlQnV0dG9uID0gKHsgcm9vbSwgbWVtYmVyLCBzdGFydFVwZGF0aW5nLCBzdG9wVXBkYXRpbmcgfTogT21pdDxJQmFzZVJvb21Qcm9wcywgXCJwb3dlckxldmVsc1wiPikgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBpc0Jhbm5lZCA9IG1lbWJlci5tZW1iZXJzaGlwID09PSBcImJhblwiO1xuICAgIGNvbnN0IG9uQmFuT3JVbmJhbiA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKFxuICAgICAgICAgICAgcm9vbS5pc1NwYWNlUm9vbSgpID8gQ29uZmlybVNwYWNlVXNlckFjdGlvbkRpYWxvZyA6IENvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lbWJlcixcbiAgICAgICAgICAgICAgICBhY3Rpb246IHJvb20uaXNTcGFjZVJvb20oKVxuICAgICAgICAgICAgICAgICAgICA/IChpc0Jhbm5lZCA/IF90KFwiVW5iYW4gZnJvbSBzcGFjZVwiKSA6IF90KFwiQmFuIGZyb20gc3BhY2VcIikpXG4gICAgICAgICAgICAgICAgICAgIDogKGlzQmFubmVkID8gX3QoXCJVbmJhbiBmcm9tIHJvb21cIikgOiBfdChcIkJhbiBmcm9tIHJvb21cIikpLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBpc0Jhbm5lZFxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiVW5iYW4gZnJvbSAlKHJvb21OYW1lKXNcIiwgeyByb29tTmFtZTogcm9vbS5uYW1lIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCJCYW4gZnJvbSAlKHJvb21OYW1lKXNcIiwgeyByb29tTmFtZTogcm9vbS5uYW1lIH0pLFxuICAgICAgICAgICAgICAgIGFza1JlYXNvbjogIWlzQmFubmVkLFxuICAgICAgICAgICAgICAgIGRhbmdlcjogIWlzQmFubmVkLFxuICAgICAgICAgICAgICAgIC8vIHNwYWNlLXNwZWNpZmljIHByb3BzXG4gICAgICAgICAgICAgICAgc3BhY2U6IHJvb20sXG4gICAgICAgICAgICAgICAgc3BhY2VDaGlsZEZpbHRlcjogaXNCYW5uZWRcbiAgICAgICAgICAgICAgICAgICAgPyAoY2hpbGQ6IFJvb20pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJldHVybiB0cnVlIGlmIHRoZSB0YXJnZXQgbWVtYmVyIGlzIGJhbm5lZCBhbmQgd2UgaGF2ZSBzdWZmaWNpZW50IFBMIHRvIHVuYmFuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBteU1lbWJlciA9IGNoaWxkLmdldE1lbWJlcihjbGkuY3JlZGVudGlhbHMudXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRoZWlyTWVtYmVyID0gY2hpbGQuZ2V0TWVtYmVyKG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG15TWVtYmVyICYmIHRoZWlyTWVtYmVyICYmIHRoZWlyTWVtYmVyLm1lbWJlcnNoaXAgPT09IFwiYmFuXCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBteU1lbWJlci5wb3dlckxldmVsID4gdGhlaXJNZW1iZXIucG93ZXJMZXZlbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmN1cnJlbnRTdGF0ZS5oYXNTdWZmaWNpZW50UG93ZXJMZXZlbEZvcihcImJhblwiLCBteU1lbWJlci5wb3dlckxldmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IChjaGlsZDogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIHRydWUgaWYgdGhlIHRhcmdldCBtZW1iZXIgaXNuJ3QgYmFubmVkIGFuZCB3ZSBoYXZlIHN1ZmZpY2llbnQgUEwgdG8gYmFuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBteU1lbWJlciA9IGNoaWxkLmdldE1lbWJlcihjbGkuY3JlZGVudGlhbHMudXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRoZWlyTWVtYmVyID0gY2hpbGQuZ2V0TWVtYmVyKG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG15TWVtYmVyICYmIHRoZWlyTWVtYmVyICYmIHRoZWlyTWVtYmVyLm1lbWJlcnNoaXAgIT09IFwiYmFuXCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBteU1lbWJlci5wb3dlckxldmVsID4gdGhlaXJNZW1iZXIucG93ZXJMZXZlbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLmN1cnJlbnRTdGF0ZS5oYXNTdWZmaWNpZW50UG93ZXJMZXZlbEZvcihcImJhblwiLCBteU1lbWJlci5wb3dlckxldmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhbGxMYWJlbDogaXNCYW5uZWRcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIlVuYmFuIHRoZW0gZnJvbSBldmVyeXRoaW5nIEknbSBhYmxlIHRvXCIpXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCJCYW4gdGhlbSBmcm9tIGV2ZXJ5dGhpbmcgSSdtIGFibGUgdG9cIiksXG4gICAgICAgICAgICAgICAgc3BlY2lmaWNMYWJlbDogaXNCYW5uZWRcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIlVuYmFuIHRoZW0gZnJvbSBzcGVjaWZpYyB0aGluZ3MgSSdtIGFibGUgdG9cIilcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIkJhbiB0aGVtIGZyb20gc3BlY2lmaWMgdGhpbmdzIEknbSBhYmxlIHRvXCIpLFxuICAgICAgICAgICAgICAgIHdhcm5pbmdNZXNzYWdlOiBpc0Jhbm5lZFxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiVGhleSB3b24ndCBiZSBhYmxlIHRvIGFjY2VzcyB3aGF0ZXZlciB5b3UncmUgbm90IGFuIGFkbWluIG9mLlwiKVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiVGhleSdsbCBzdGlsbCBiZSBhYmxlIHRvIGFjY2VzcyB3aGF0ZXZlciB5b3UncmUgbm90IGFuIGFkbWluIG9mLlwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByb29tLmlzU3BhY2VSb29tKCkgPyBcIm14X0NvbmZpcm1TcGFjZVVzZXJBY3Rpb25EaWFsb2dfd3JhcHBlclwiIDogdW5kZWZpbmVkLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IFtwcm9jZWVkLCByZWFzb24sIHJvb21zID0gW11dID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN0YXJ0VXBkYXRpbmcoKTtcblxuICAgICAgICBjb25zdCBmbiA9IChyb29tSWQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQmFubmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsaS51bmJhbihyb29tSWQsIG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xpLmJhbihyb29tSWQsIG1lbWJlci51c2VySWQsIHJlYXNvbiB8fCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGJ1bGtTcGFjZUJlaGF2aW91cihyb29tLCByb29tcywgcm9vbSA9PiBmbihyb29tLnJvb21JZCkpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gTk8tT1A7IHJlbHkgb24gdGhlIG0ucm9vbS5tZW1iZXIgZXZlbnQgY29taW5nIGRvd24gZWxzZSB3ZSBjb3VsZFxuICAgICAgICAgICAgLy8gZ2V0IG91dCBvZiBzeW5jIGlmIHdlIGZvcmNlIHNldFN0YXRlIGhlcmUhXG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiQmFuIHN1Y2Nlc3NcIik7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiQmFuIGVycm9yOiBcIiArIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJGYWlsZWQgdG8gYmFuIHVzZXJcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBzdG9wVXBkYXRpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxldCBsYWJlbCA9IHJvb20uaXNTcGFjZVJvb20oKVxuICAgICAgICA/IF90KFwiQmFuIGZyb20gc3BhY2VcIilcbiAgICAgICAgOiBfdChcIkJhbiBmcm9tIHJvb21cIik7XG4gICAgaWYgKGlzQmFubmVkKSB7XG4gICAgICAgIGxhYmVsID0gcm9vbS5pc1NwYWNlUm9vbSgpXG4gICAgICAgICAgICA/IF90KFwiVW5iYW4gZnJvbSBzcGFjZVwiKVxuICAgICAgICAgICAgOiBfdChcIlVuYmFuIGZyb20gcm9vbVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1VzZXJJbmZvX2ZpZWxkXCIsIHtcbiAgICAgICAgbXhfVXNlckluZm9fZGVzdHJ1Y3RpdmU6ICFpc0Jhbm5lZCxcbiAgICB9KTtcblxuICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgb25DbGljaz17b25CYW5PclVuYmFufVxuICAgID5cbiAgICAgICAgeyBsYWJlbCB9XG4gICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbn07XG5cbmludGVyZmFjZSBJQmFzZVJvb21Qcm9wcyBleHRlbmRzIElCYXNlUHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgcG93ZXJMZXZlbHM6IElQb3dlckxldmVsc0NvbnRlbnQ7XG59XG5cbmNvbnN0IE11dGVUb2dnbGVCdXR0b246IFJlYWN0LkZDPElCYXNlUm9vbVByb3BzPiA9ICh7IG1lbWJlciwgcm9vbSwgcG93ZXJMZXZlbHMsIHN0YXJ0VXBkYXRpbmcsIHN0b3BVcGRhdGluZyB9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIC8vIERvbid0IHNob3cgdGhlIG11dGUvdW5tdXRlIG9wdGlvbiBpZiB0aGUgdXNlciBpcyBub3QgaW4gdGhlIHJvb21cbiAgICBpZiAobWVtYmVyLm1lbWJlcnNoaXAgIT09IFwiam9pblwiKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IG11dGVkID0gaXNNdXRlZChtZW1iZXIsIHBvd2VyTGV2ZWxzKTtcbiAgICBjb25zdCBvbk11dGVUb2dnbGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IG1lbWJlci5yb29tSWQ7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IG1lbWJlci51c2VySWQ7XG5cbiAgICAgICAgLy8gaWYgbXV0aW5nIHNlbGYsIHdhcm4gYXMgaXQgbWF5IGJlIGlycmV2ZXJzaWJsZVxuICAgICAgICBpZiAodGFyZ2V0ID09PSBjbGkuZ2V0VXNlcklkKCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoYXdhaXQgd2FyblNlbGZEZW1vdGUocm9vbT8uaXNTcGFjZVJvb20oKSkpKSByZXR1cm47XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHdhcm4gYWJvdXQgc2VsZiBkZW1vdGlvbjogXCIsIGUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKCFwb3dlckxldmVsRXZlbnQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBwb3dlckxldmVscyA9IHBvd2VyTGV2ZWxFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIGNvbnN0IGxldmVsVG9TZW5kID0gKFxuICAgICAgICAgICAgKHBvd2VyTGV2ZWxzLmV2ZW50cyA/IHBvd2VyTGV2ZWxzLmV2ZW50c1tcIm0ucm9vbS5tZXNzYWdlXCJdIDogbnVsbCkgfHxcbiAgICAgICAgICAgIHBvd2VyTGV2ZWxzLmV2ZW50c19kZWZhdWx0XG4gICAgICAgICk7XG4gICAgICAgIGxldCBsZXZlbDtcbiAgICAgICAgaWYgKG11dGVkKSB7IC8vIHVubXV0ZVxuICAgICAgICAgICAgbGV2ZWwgPSBsZXZlbFRvU2VuZDtcbiAgICAgICAgfSBlbHNlIHsgLy8gbXV0ZVxuICAgICAgICAgICAgbGV2ZWwgPSBsZXZlbFRvU2VuZCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgbGV2ZWwgPSBwYXJzZUludChsZXZlbCk7XG5cbiAgICAgICAgaWYgKCFpc05hTihsZXZlbCkpIHtcbiAgICAgICAgICAgIHN0YXJ0VXBkYXRpbmcoKTtcbiAgICAgICAgICAgIGNsaS5zZXRQb3dlckxldmVsKHJvb21JZCwgdGFyZ2V0LCBsZXZlbCwgcG93ZXJMZXZlbEV2ZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOTy1PUDsgcmVseSBvbiB0aGUgbS5yb29tLm1lbWJlciBldmVudCBjb21pbmcgZG93biBlbHNlIHdlIGNvdWxkXG4gICAgICAgICAgICAgICAgLy8gZ2V0IG91dCBvZiBzeW5jIGlmIHdlIGZvcmNlIHNldFN0YXRlIGhlcmUhXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIk11dGUgdG9nZ2xlIHN1Y2Nlc3NcIik7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJNdXRlIGVycm9yOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJGYWlsZWQgdG8gbXV0ZSB1c2VyXCIpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RvcFVwZGF0aW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1VzZXJJbmZvX2ZpZWxkXCIsIHtcbiAgICAgICAgbXhfVXNlckluZm9fZGVzdHJ1Y3RpdmU6ICFtdXRlZCxcbiAgICB9KTtcblxuICAgIGNvbnN0IG11dGVMYWJlbCA9IG11dGVkID8gX3QoXCJVbm11dGVcIikgOiBfdChcIk11dGVcIik7XG4gICAgcmV0dXJuIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICBvbkNsaWNrPXtvbk11dGVUb2dnbGV9XG4gICAgPlxuICAgICAgICB7IG11dGVMYWJlbCB9XG4gICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbn07XG5cbmNvbnN0IFJvb21BZG1pblRvb2xzQ29udGFpbmVyOiBSZWFjdC5GQzxJQmFzZVJvb21Qcm9wcz4gPSAoe1xuICAgIHJvb20sXG4gICAgY2hpbGRyZW4sXG4gICAgbWVtYmVyLFxuICAgIHN0YXJ0VXBkYXRpbmcsXG4gICAgc3RvcFVwZGF0aW5nLFxuICAgIHBvd2VyTGV2ZWxzLFxufSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgbGV0IGtpY2tCdXR0b247XG4gICAgbGV0IGJhbkJ1dHRvbjtcbiAgICBsZXQgbXV0ZUJ1dHRvbjtcbiAgICBsZXQgcmVkYWN0QnV0dG9uO1xuXG4gICAgY29uc3QgZWRpdFBvd2VyTGV2ZWwgPSAoXG4gICAgICAgIChwb3dlckxldmVscy5ldmVudHMgPyBwb3dlckxldmVscy5ldmVudHNbXCJtLnJvb20ucG93ZXJfbGV2ZWxzXCJdIDogbnVsbCkgfHxcbiAgICAgICAgcG93ZXJMZXZlbHMuc3RhdGVfZGVmYXVsdFxuICAgICk7XG5cbiAgICAvLyBpZiB0aGVzZSBkbyBub3QgZXhpc3QgaW4gdGhlIGV2ZW50IHRoZW4gdGhleSBzaG91bGQgZGVmYXVsdCB0byA1MCBhcyBwZXIgdGhlIHNwZWNcbiAgICBjb25zdCB7XG4gICAgICAgIGJhbjogYmFuUG93ZXJMZXZlbCA9IDUwLFxuICAgICAgICBraWNrOiBraWNrUG93ZXJMZXZlbCA9IDUwLFxuICAgICAgICByZWRhY3Q6IHJlZGFjdFBvd2VyTGV2ZWwgPSA1MCxcbiAgICB9ID0gcG93ZXJMZXZlbHM7XG5cbiAgICBjb25zdCBtZSA9IHJvb20uZ2V0TWVtYmVyKGNsaS5nZXRVc2VySWQoKSk7XG4gICAgaWYgKCFtZSkge1xuICAgICAgICAvLyB3ZSBhcmVuJ3QgaW4gdGhlIHJvb20sIHNvIHJldHVybiBubyBhZG1pbiB0b29saW5nXG4gICAgICAgIHJldHVybiA8ZGl2IC8+O1xuICAgIH1cblxuICAgIGNvbnN0IGlzTWUgPSBtZS51c2VySWQgPT09IG1lbWJlci51c2VySWQ7XG4gICAgY29uc3QgY2FuQWZmZWN0VXNlciA9IG1lbWJlci5wb3dlckxldmVsIDwgbWUucG93ZXJMZXZlbCB8fCBpc01lO1xuXG4gICAgaWYgKCFpc01lICYmIGNhbkFmZmVjdFVzZXIgJiYgbWUucG93ZXJMZXZlbCA+PSBraWNrUG93ZXJMZXZlbCkge1xuICAgICAgICBraWNrQnV0dG9uID0gPFJvb21LaWNrQnV0dG9uXG4gICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgbWVtYmVyPXttZW1iZXJ9XG4gICAgICAgICAgICBzdGFydFVwZGF0aW5nPXtzdGFydFVwZGF0aW5nfVxuICAgICAgICAgICAgc3RvcFVwZGF0aW5nPXtzdG9wVXBkYXRpbmd9XG4gICAgICAgIC8+O1xuICAgIH1cbiAgICBpZiAobWUucG93ZXJMZXZlbCA+PSByZWRhY3RQb3dlckxldmVsICYmICFyb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgcmVkYWN0QnV0dG9uID0gKFxuICAgICAgICAgICAgPFJlZGFjdE1lc3NhZ2VzQnV0dG9uIG1lbWJlcj17bWVtYmVyfSBzdGFydFVwZGF0aW5nPXtzdGFydFVwZGF0aW5nfSBzdG9wVXBkYXRpbmc9e3N0b3BVcGRhdGluZ30gLz5cbiAgICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCFpc01lICYmIGNhbkFmZmVjdFVzZXIgJiYgbWUucG93ZXJMZXZlbCA+PSBiYW5Qb3dlckxldmVsKSB7XG4gICAgICAgIGJhbkJ1dHRvbiA9IDxCYW5Ub2dnbGVCdXR0b25cbiAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICBtZW1iZXI9e21lbWJlcn1cbiAgICAgICAgICAgIHN0YXJ0VXBkYXRpbmc9e3N0YXJ0VXBkYXRpbmd9XG4gICAgICAgICAgICBzdG9wVXBkYXRpbmc9e3N0b3BVcGRhdGluZ31cbiAgICAgICAgLz47XG4gICAgfVxuICAgIGlmICghaXNNZSAmJiBjYW5BZmZlY3RVc2VyICYmIG1lLnBvd2VyTGV2ZWwgPj0gZWRpdFBvd2VyTGV2ZWwgJiYgIXJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICBtdXRlQnV0dG9uID0gKFxuICAgICAgICAgICAgPE11dGVUb2dnbGVCdXR0b25cbiAgICAgICAgICAgICAgICBtZW1iZXI9e21lbWJlcn1cbiAgICAgICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWxzPXtwb3dlckxldmVsc31cbiAgICAgICAgICAgICAgICBzdGFydFVwZGF0aW5nPXtzdGFydFVwZGF0aW5nfVxuICAgICAgICAgICAgICAgIHN0b3BVcGRhdGluZz17c3RvcFVwZGF0aW5nfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoa2lja0J1dHRvbiB8fCBiYW5CdXR0b24gfHwgbXV0ZUJ1dHRvbiB8fCByZWRhY3RCdXR0b24gfHwgY2hpbGRyZW4pIHtcbiAgICAgICAgcmV0dXJuIDxHZW5lcmljQWRtaW5Ub29sc0NvbnRhaW5lcj5cbiAgICAgICAgICAgIHsgbXV0ZUJ1dHRvbiB9XG4gICAgICAgICAgICB7IGtpY2tCdXR0b24gfVxuICAgICAgICAgICAgeyBiYW5CdXR0b24gfVxuICAgICAgICAgICAgeyByZWRhY3RCdXR0b24gfVxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvR2VuZXJpY0FkbWluVG9vbHNDb250YWluZXI+O1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IC8+O1xufTtcblxuY29uc3QgdXNlSXNTeW5hcHNlQWRtaW4gPSAoY2xpOiBNYXRyaXhDbGllbnQpID0+IHtcbiAgICBjb25zdCBbaXNBZG1pbiwgc2V0SXNBZG1pbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY2xpLmlzU3luYXBzZUFkbWluaXN0cmF0b3IoKS50aGVuKChpc0FkbWluKSA9PiB7XG4gICAgICAgICAgICBzZXRJc0FkbWluKGlzQWRtaW4pO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRJc0FkbWluKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfSwgW2NsaV0pO1xuICAgIHJldHVybiBpc0FkbWluO1xufTtcblxuY29uc3QgdXNlSG9tZXNlcnZlclN1cHBvcnRzQ3Jvc3NTaWduaW5nID0gKGNsaTogTWF0cml4Q2xpZW50KSA9PiB7XG4gICAgcmV0dXJuIHVzZUFzeW5jTWVtbzxib29sZWFuPihhc3luYyAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjbGkuZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUoXCJvcmcubWF0cml4LmUyZV9jcm9zc19zaWduaW5nXCIpO1xuICAgIH0sIFtjbGldLCBmYWxzZSk7XG59O1xuXG5pbnRlcmZhY2UgSVJvb21QZXJtaXNzaW9ucyB7XG4gICAgbW9kaWZ5TGV2ZWxNYXg6IG51bWJlcjtcbiAgICBjYW5FZGl0OiBib29sZWFuO1xuICAgIGNhbkludml0ZTogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gdXNlUm9vbVBlcm1pc3Npb25zKGNsaTogTWF0cml4Q2xpZW50LCByb29tOiBSb29tLCB1c2VyOiBSb29tTWVtYmVyKTogSVJvb21QZXJtaXNzaW9ucyB7XG4gICAgY29uc3QgW3Jvb21QZXJtaXNzaW9ucywgc2V0Um9vbVBlcm1pc3Npb25zXSA9IHVzZVN0YXRlPElSb29tUGVybWlzc2lvbnM+KHtcbiAgICAgICAgLy8gbW9kaWZ5TGV2ZWxNYXggaXMgdGhlIG1heCBQTCB3ZSBjYW4gc2V0IHRoaXMgdXNlciB0bywgdHlwaWNhbGx5IG1pbih0aGVpciBQTCwgb3VyIFBMKSAmJiBjYW5TZXRQTFxuICAgICAgICBtb2RpZnlMZXZlbE1heDogLTEsXG4gICAgICAgIGNhbkVkaXQ6IGZhbHNlLFxuICAgICAgICBjYW5JbnZpdGU6IGZhbHNlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgdXBkYXRlUm9vbVBlcm1pc3Npb25zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3dlckxldmVscyA9IHJvb20/LmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzLCBcIlwiKT8uZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoIXBvd2VyTGV2ZWxzKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbWUgPSByb29tLmdldE1lbWJlcihjbGkuZ2V0VXNlcklkKCkpO1xuICAgICAgICBpZiAoIW1lKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgdGhlbSA9IHVzZXI7XG4gICAgICAgIGNvbnN0IGlzTWUgPSBtZS51c2VySWQgPT09IHRoZW0udXNlcklkO1xuICAgICAgICBjb25zdCBjYW5BZmZlY3RVc2VyID0gdGhlbS5wb3dlckxldmVsIDwgbWUucG93ZXJMZXZlbCB8fCBpc01lO1xuXG4gICAgICAgIGxldCBtb2RpZnlMZXZlbE1heCA9IC0xO1xuICAgICAgICBpZiAoY2FuQWZmZWN0VXNlcikge1xuICAgICAgICAgICAgY29uc3QgZWRpdFBvd2VyTGV2ZWwgPSBwb3dlckxldmVscy5ldmVudHM/LltFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzXSA/PyBwb3dlckxldmVscy5zdGF0ZV9kZWZhdWx0ID8/IDUwO1xuICAgICAgICAgICAgaWYgKG1lLnBvd2VyTGV2ZWwgPj0gZWRpdFBvd2VyTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICBtb2RpZnlMZXZlbE1heCA9IG1lLnBvd2VyTGV2ZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXRSb29tUGVybWlzc2lvbnMoe1xuICAgICAgICAgICAgY2FuSW52aXRlOiBtZS5wb3dlckxldmVsID49IChwb3dlckxldmVscy5pbnZpdGUgPz8gMCksXG4gICAgICAgICAgICBjYW5FZGl0OiBtb2RpZnlMZXZlbE1heCA+PSAwLFxuICAgICAgICAgICAgbW9kaWZ5TGV2ZWxNYXgsXG4gICAgICAgIH0pO1xuICAgIH0sIFtjbGksIHVzZXIsIHJvb21dKTtcblxuICAgIHVzZVR5cGVkRXZlbnRFbWl0dGVyKGNsaSwgUm9vbVN0YXRlRXZlbnQuVXBkYXRlLCB1cGRhdGVSb29tUGVybWlzc2lvbnMpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVJvb21QZXJtaXNzaW9ucygpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgc2V0Um9vbVBlcm1pc3Npb25zKHtcbiAgICAgICAgICAgICAgICBtb2RpZnlMZXZlbE1heDogLTEsXG4gICAgICAgICAgICAgICAgY2FuRWRpdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2FuSW52aXRlOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0sIFt1cGRhdGVSb29tUGVybWlzc2lvbnNdKTtcblxuICAgIHJldHVybiByb29tUGVybWlzc2lvbnM7XG59XG5cbmNvbnN0IFBvd2VyTGV2ZWxTZWN0aW9uOiBSZWFjdC5GQzx7XG4gICAgdXNlcjogUm9vbU1lbWJlcjtcbiAgICByb29tOiBSb29tO1xuICAgIHJvb21QZXJtaXNzaW9uczogSVJvb21QZXJtaXNzaW9ucztcbiAgICBwb3dlckxldmVsczogSVBvd2VyTGV2ZWxzQ29udGVudDtcbn0+ID0gKHsgdXNlciwgcm9vbSwgcm9vbVBlcm1pc3Npb25zLCBwb3dlckxldmVscyB9KSA9PiB7XG4gICAgaWYgKHJvb21QZXJtaXNzaW9ucy5jYW5FZGl0KSB7XG4gICAgICAgIHJldHVybiAoPFBvd2VyTGV2ZWxFZGl0b3IgdXNlcj17dXNlcn0gcm9vbT17cm9vbX0gcm9vbVBlcm1pc3Npb25zPXtyb29tUGVybWlzc2lvbnN9IC8+KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBwb3dlckxldmVsVXNlcnNEZWZhdWx0ID0gcG93ZXJMZXZlbHMudXNlcnNfZGVmYXVsdCB8fCAwO1xuICAgICAgICBjb25zdCBwb3dlckxldmVsID0gdXNlci5wb3dlckxldmVsO1xuICAgICAgICBjb25zdCByb2xlID0gdGV4dHVhbFBvd2VyTGV2ZWwocG93ZXJMZXZlbCwgcG93ZXJMZXZlbFVzZXJzRGVmYXVsdCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3Byb2ZpbGVGaWVsZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fcm9sZURlc2NyaXB0aW9uXCI+eyByb2xlIH08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn07XG5cbmNvbnN0IFBvd2VyTGV2ZWxFZGl0b3I6IFJlYWN0LkZDPHtcbiAgICB1c2VyOiBSb29tTWVtYmVyO1xuICAgIHJvb206IFJvb207XG4gICAgcm9vbVBlcm1pc3Npb25zOiBJUm9vbVBlcm1pc3Npb25zO1xufT4gPSAoeyB1c2VyLCByb29tLCByb29tUGVybWlzc2lvbnMgfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBbc2VsZWN0ZWRQb3dlckxldmVsLCBzZXRTZWxlY3RlZFBvd2VyTGV2ZWxdID0gdXNlU3RhdGUodXNlci5wb3dlckxldmVsKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZFBvd2VyTGV2ZWwodXNlci5wb3dlckxldmVsKTtcbiAgICB9LCBbdXNlcl0pO1xuXG4gICAgY29uc3Qgb25Qb3dlckNoYW5nZSA9IHVzZUNhbGxiYWNrKGFzeW5jIChwb3dlckxldmVsOiBudW1iZXIpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWRQb3dlckxldmVsKHBvd2VyTGV2ZWwpO1xuXG4gICAgICAgIGNvbnN0IGFwcGx5UG93ZXJDaGFuZ2UgPSAocm9vbUlkLCB0YXJnZXQsIHBvd2VyTGV2ZWwsIHBvd2VyTGV2ZWxFdmVudCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNsaS5zZXRQb3dlckxldmVsKHJvb21JZCwgdGFyZ2V0LCBwYXJzZUludChwb3dlckxldmVsKSwgcG93ZXJMZXZlbEV2ZW50KS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOTy1PUDsgcmVseSBvbiB0aGUgbS5yb29tLm1lbWJlciBldmVudCBjb21pbmcgZG93biBlbHNlIHdlIGNvdWxkXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCBvdXQgb2Ygc3luYyBpZiB3ZSBmb3JjZSBzZXRTdGF0ZSBoZXJlIVxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiUG93ZXIgY2hhbmdlIHN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBjaGFuZ2UgcG93ZXIgbGV2ZWwgXCIgKyBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiRmFpbGVkIHRvIGNoYW5nZSBwb3dlciBsZXZlbFwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdXNlci5yb29tSWQ7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHVzZXIudXNlcklkO1xuXG4gICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKCFwb3dlckxldmVsRXZlbnQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBteVVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgbXlQb3dlciA9IHBvd2VyTGV2ZWxFdmVudC5nZXRDb250ZW50KCkudXNlcnNbbXlVc2VySWRdO1xuICAgICAgICBpZiAobXlQb3dlciAmJiBwYXJzZUludChteVBvd2VyKSA8PSBwb3dlckxldmVsICYmIG15VXNlcklkICE9PSB0YXJnZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIldhcm5pbmchXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIHVuZG8gdGhpcyBjaGFuZ2UgYXMgeW91IGFyZSBwcm9tb3RpbmcgdGhlIHVzZXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG8gaGF2ZSB0aGUgc2FtZSBwb3dlciBsZXZlbCBhcyB5b3Vyc2VsZi5cIikgfTxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkFyZSB5b3Ugc3VyZT9cIikgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdChcIkNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKG15VXNlcklkID09PSB0YXJnZXQgJiYgbXlQb3dlciAmJiBwYXJzZUludChteVBvd2VyKSA+IHBvd2VyTGV2ZWwpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGFyZSBjaGFuZ2luZyBvdXIgb3duIFBMIGl0IGNhbiBvbmx5IGV2ZXIgYmUgZGVjcmVhc2luZywgd2hpY2ggd2UgY2Fubm90IHJldmVyc2UuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghKGF3YWl0IHdhcm5TZWxmRGVtb3RlKHJvb20/LmlzU3BhY2VSb29tKCkpKSkgcmV0dXJuO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byB3YXJuIGFib3V0IHNlbGYgZGVtb3Rpb246IFwiLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGFwcGx5UG93ZXJDaGFuZ2Uocm9vbUlkLCB0YXJnZXQsIHBvd2VyTGV2ZWwsIHBvd2VyTGV2ZWxFdmVudCk7XG4gICAgfSwgW3VzZXIucm9vbUlkLCB1c2VyLnVzZXJJZCwgY2xpLCByb29tXSk7XG5cbiAgICBjb25zdCBwb3dlckxldmVsRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgXCJcIik7XG4gICAgY29uc3QgcG93ZXJMZXZlbFVzZXJzRGVmYXVsdCA9IHBvd2VyTGV2ZWxFdmVudCA/IHBvd2VyTGV2ZWxFdmVudC5nZXRDb250ZW50KCkudXNlcnNfZGVmYXVsdCA6IDA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3Byb2ZpbGVGaWVsZFwiPlxuICAgICAgICAgICAgPFBvd2VyU2VsZWN0b3JcbiAgICAgICAgICAgICAgICBsYWJlbD17bnVsbH1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRQb3dlckxldmVsfVxuICAgICAgICAgICAgICAgIG1heFZhbHVlPXtyb29tUGVybWlzc2lvbnMubW9kaWZ5TGV2ZWxNYXh9XG4gICAgICAgICAgICAgICAgdXNlcnNEZWZhdWx0PXtwb3dlckxldmVsVXNlcnNEZWZhdWx0fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvblBvd2VyQ2hhbmdlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VEZXZpY2VzID0gKHVzZXJJZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIC8vIHVuZGVmaW5lZCBtZWFucyB5ZXQgdG8gYmUgbG9hZGVkLCBudWxsIG1lYW5zIGZhaWxlZCB0byBsb2FkLCBvdGhlcndpc2UgbGlzdCBvZiBkZXZpY2VzXG4gICAgY29uc3QgW2RldmljZXMsIHNldERldmljZXNdID0gdXNlU3RhdGUodW5kZWZpbmVkKTtcbiAgICAvLyBEb3dubG9hZCBkZXZpY2UgbGlzdHNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXREZXZpY2VzKHVuZGVmaW5lZCk7XG5cbiAgICAgICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkRGV2aWNlTGlzdCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpLmRvd25sb2FkS2V5cyhbdXNlcklkXSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlcyA9IGNsaS5nZXRTdG9yZWREZXZpY2VzRm9yVXNlcih1c2VySWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBnb3QgY2FuY2VsbGVkIC0gcHJlc3VtYWJseSBhIGRpZmZlcmVudCB1c2VyIG5vd1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGlzYW1iaWd1YXRlRGV2aWNlcyhkZXZpY2VzKTtcbiAgICAgICAgICAgICAgICBzZXREZXZpY2VzKGRldmljZXMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgc2V0RGV2aWNlcyhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkb3dubG9hZERldmljZUxpc3QoKTtcblxuICAgICAgICAvLyBIYW5kbGUgYmVpbmcgdW5tb3VudGVkXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICB9O1xuICAgIH0sIFtjbGksIHVzZXJJZF0pO1xuXG4gICAgLy8gTGlzdGVuIHRvIGNoYW5nZXNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsZXQgY2FuY2VsID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHVwZGF0ZURldmljZXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdEZXZpY2VzID0gY2xpLmdldFN0b3JlZERldmljZXNGb3JVc2VyKHVzZXJJZCk7XG4gICAgICAgICAgICBpZiAoY2FuY2VsKSByZXR1cm47XG4gICAgICAgICAgICBzZXREZXZpY2VzKG5ld0RldmljZXMpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvbkRldmljZXNVcGRhdGVkID0gKHVzZXJzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXVzZXJzLmluY2x1ZGVzKHVzZXJJZCkpIHJldHVybjtcbiAgICAgICAgICAgIHVwZGF0ZURldmljZXMoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkID0gKF91c2VySWQsIGRldmljZSkgPT4ge1xuICAgICAgICAgICAgaWYgKF91c2VySWQgIT09IHVzZXJJZCkgcmV0dXJuO1xuICAgICAgICAgICAgdXBkYXRlRGV2aWNlcygpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvblVzZXJUcnVzdFN0YXR1c0NoYW5nZWQgPSAoX3VzZXJJZCwgdHJ1c3RTdGF0dXMpID0+IHtcbiAgICAgICAgICAgIGlmIChfdXNlcklkICE9PSB1c2VySWQpIHJldHVybjtcbiAgICAgICAgICAgIHVwZGF0ZURldmljZXMoKTtcbiAgICAgICAgfTtcbiAgICAgICAgY2xpLm9uKENyeXB0b0V2ZW50LkRldmljZXNVcGRhdGVkLCBvbkRldmljZXNVcGRhdGVkKTtcbiAgICAgICAgY2xpLm9uKENyeXB0b0V2ZW50LkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQsIG9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgIGNsaS5vbihDcnlwdG9FdmVudC5Vc2VyVHJ1c3RTdGF0dXNDaGFuZ2VkLCBvblVzZXJUcnVzdFN0YXR1c0NoYW5nZWQpO1xuICAgICAgICAvLyBIYW5kbGUgYmVpbmcgdW5tb3VudGVkXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjYW5jZWwgPSB0cnVlO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKENyeXB0b0V2ZW50LkRldmljZXNVcGRhdGVkLCBvbkRldmljZXNVcGRhdGVkKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihDcnlwdG9FdmVudC5EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkLCBvbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKENyeXB0b0V2ZW50LlVzZXJUcnVzdFN0YXR1c0NoYW5nZWQsIG9uVXNlclRydXN0U3RhdHVzQ2hhbmdlZCk7XG4gICAgICAgIH07XG4gICAgfSwgW2NsaSwgdXNlcklkXSk7XG5cbiAgICByZXR1cm4gZGV2aWNlcztcbn07XG5cbmNvbnN0IEJhc2ljVXNlckluZm86IFJlYWN0LkZDPHtcbiAgICByb29tOiBSb29tO1xuICAgIG1lbWJlcjogVXNlciB8IFJvb21NZW1iZXI7XG4gICAgZGV2aWNlczogSURldmljZVtdO1xuICAgIGlzUm9vbUVuY3J5cHRlZDogYm9vbGVhbjtcbn0+ID0gKHsgcm9vbSwgbWVtYmVyLCBkZXZpY2VzLCBpc1Jvb21FbmNyeXB0ZWQgfSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBwb3dlckxldmVscyA9IHVzZVJvb21Qb3dlckxldmVscyhjbGksIHJvb20pO1xuICAgIC8vIExvYWQgd2hldGhlciBvciBub3Qgd2UgYXJlIGEgU3luYXBzZSBBZG1pblxuICAgIGNvbnN0IGlzU3luYXBzZUFkbWluID0gdXNlSXNTeW5hcHNlQWRtaW4oY2xpKTtcblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIHVzZXIgaXMgaWdub3JlZFxuICAgIGNvbnN0IFtpc0lnbm9yZWQsIHNldElzSWdub3JlZF0gPSB1c2VTdGF0ZShjbGkuaXNVc2VySWdub3JlZChtZW1iZXIudXNlcklkKSk7XG4gICAgLy8gUmVjaGVjayBpZiB0aGUgdXNlciBvciBjbGllbnQgY2hhbmdlc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHNldElzSWdub3JlZChjbGkuaXNVc2VySWdub3JlZChtZW1iZXIudXNlcklkKSk7XG4gICAgfSwgW2NsaSwgbWVtYmVyLnVzZXJJZF0pO1xuICAgIC8vIFJlY2hlY2sgYWxzbyBpZiB3ZSByZWNlaXZlIG5ldyBhY2NvdW50RGF0YSBtLmlnbm9yZWRfdXNlcl9saXN0XG4gICAgY29uc3QgYWNjb3VudERhdGFIYW5kbGVyID0gdXNlQ2FsbGJhY2soKGV2KSA9PiB7XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwibS5pZ25vcmVkX3VzZXJfbGlzdFwiKSB7XG4gICAgICAgICAgICBzZXRJc0lnbm9yZWQoY2xpLmlzVXNlcklnbm9yZWQobWVtYmVyLnVzZXJJZCkpO1xuICAgICAgICB9XG4gICAgfSwgW2NsaSwgbWVtYmVyLnVzZXJJZF0pO1xuICAgIHVzZVR5cGVkRXZlbnRFbWl0dGVyKGNsaSwgQ2xpZW50RXZlbnQuQWNjb3VudERhdGEsIGFjY291bnREYXRhSGFuZGxlcik7XG5cbiAgICAvLyBDb3VudCBvZiBob3cgbWFueSBvcGVyYXRpb25zIGFyZSBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MsIGlmID4gMCB0aGVuIHNob3cgYSBTcGlubmVyXG4gICAgY29uc3QgW3BlbmRpbmdVcGRhdGVDb3VudCwgc2V0UGVuZGluZ1VwZGF0ZUNvdW50XSA9IHVzZVN0YXRlKDApO1xuICAgIGNvbnN0IHN0YXJ0VXBkYXRpbmcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFBlbmRpbmdVcGRhdGVDb3VudChwZW5kaW5nVXBkYXRlQ291bnQgKyAxKTtcbiAgICB9LCBbcGVuZGluZ1VwZGF0ZUNvdW50XSk7XG4gICAgY29uc3Qgc3RvcFVwZGF0aW5nID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRQZW5kaW5nVXBkYXRlQ291bnQocGVuZGluZ1VwZGF0ZUNvdW50IC0gMSk7XG4gICAgfSwgW3BlbmRpbmdVcGRhdGVDb3VudF0pO1xuXG4gICAgY29uc3Qgcm9vbVBlcm1pc3Npb25zID0gdXNlUm9vbVBlcm1pc3Npb25zKGNsaSwgcm9vbSwgbWVtYmVyIGFzIFJvb21NZW1iZXIpO1xuXG4gICAgY29uc3Qgb25TeW5hcHNlRGVhY3RpdmF0ZSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJEZWFjdGl2YXRlIHVzZXI/XCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgPGRpdj57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkRlYWN0aXZhdGluZyB0aGlzIHVzZXIgd2lsbCBsb2cgdGhlbSBvdXQgYW5kIHByZXZlbnQgdGhlbSBmcm9tIGxvZ2dpbmcgYmFjayBpbi4gQWRkaXRpb25hbGx5LCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidGhleSB3aWxsIGxlYXZlIGFsbCB0aGUgcm9vbXMgdGhleSBhcmUgaW4uIFRoaXMgYWN0aW9uIGNhbm5vdCBiZSByZXZlcnNlZC4gQXJlIHlvdSBzdXJlIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwid2FudCB0byBkZWFjdGl2YXRlIHRoaXMgdXNlcj9cIixcbiAgICAgICAgICAgICAgICApIH08L2Rpdj4sXG4gICAgICAgICAgICBidXR0b246IF90KFwiRGVhY3RpdmF0ZSB1c2VyXCIpLFxuICAgICAgICAgICAgZGFuZ2VyOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBbYWNjZXB0ZWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgIGlmICghYWNjZXB0ZWQpIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNsaS5kZWFjdGl2YXRlU3luYXBzZVVzZXIobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGRlYWN0aXZhdGUgdXNlclwiKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byBkZWFjdGl2YXRlIHVzZXInKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbY2xpLCBtZW1iZXIudXNlcklkXSk7XG5cbiAgICBsZXQgc3luYXBzZURlYWN0aXZhdGVCdXR0b247XG4gICAgbGV0IHNwaW5uZXI7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIGEgcGVyZmVjdCBjaGVjayBoZXJlLCBqdXN0IHNvbWV0aGluZyB0byBwYXNzIGFzIFwicHJvYmFibHkgbm90IG91ciBob21lc2VydmVyXCIuIElmXG4gICAgLy8gc29tZW9uZSBkb2VzIGZpZ3VyZSBvdXQgaG93IHRvIGJ5cGFzcyB0aGlzIGNoZWNrIHRoZSB3b3JzdCB0aGF0IGhhcHBlbnMgaXMgYW4gZXJyb3IuXG4gICAgLy8gRklYTUUgdGhpcyBzaG91bGQgYmUgdXNpbmcgY2xpIGluc3RlYWQgb2YgTWF0cml4Q2xpZW50UGVnLm1hdHJpeENsaWVudFxuICAgIGlmIChpc1N5bmFwc2VBZG1pbiAmJiBtZW1iZXIudXNlcklkLmVuZHNXaXRoKGA6JHtNYXRyaXhDbGllbnRQZWcuZ2V0SG9tZXNlcnZlck5hbWUoKX1gKSkge1xuICAgICAgICBzeW5hcHNlRGVhY3RpdmF0ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2ZpZWxkIG14X1VzZXJJbmZvX2Rlc3RydWN0aXZlXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvblN5bmFwc2VEZWFjdGl2YXRlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJEZWFjdGl2YXRlIHVzZXJcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGxldCBtZW1iZXJEZXRhaWxzO1xuICAgIGxldCBhZG1pblRvb2xzQ29udGFpbmVyO1xuICAgIGlmIChyb29tICYmIChtZW1iZXIgYXMgUm9vbU1lbWJlcikucm9vbUlkKSB7XG4gICAgICAgIC8vIGhpZGUgdGhlIFJvbGVzIHNlY3Rpb24gZm9yIERNcyBhcyBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdGhlcmVcbiAgICAgICAgaWYgKCFETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKChtZW1iZXIgYXMgUm9vbU1lbWJlcikucm9vbUlkKSkge1xuICAgICAgICAgICAgbWVtYmVyRGV0YWlscyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgzPnsgX3QoXCJSb2xlIGluIDxSb29tTmFtZS8+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgIFJvb21OYW1lOiAoKSA9PiA8Yj57IHJvb20ubmFtZSB9PC9iPixcbiAgICAgICAgICAgICAgICB9KSB9PC9oMz5cbiAgICAgICAgICAgICAgICA8UG93ZXJMZXZlbFNlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgcG93ZXJMZXZlbHM9e3Bvd2VyTGV2ZWxzfVxuICAgICAgICAgICAgICAgICAgICB1c2VyPXttZW1iZXIgYXMgUm9vbU1lbWJlcn1cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgcm9vbVBlcm1pc3Npb25zPXtyb29tUGVybWlzc2lvbnN9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkbWluVG9vbHNDb250YWluZXIgPSAoXG4gICAgICAgICAgICA8Um9vbUFkbWluVG9vbHNDb250YWluZXJcbiAgICAgICAgICAgICAgICBwb3dlckxldmVscz17cG93ZXJMZXZlbHN9XG4gICAgICAgICAgICAgICAgbWVtYmVyPXttZW1iZXIgYXMgUm9vbU1lbWJlcn1cbiAgICAgICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgICAgIHN0YXJ0VXBkYXRpbmc9e3N0YXJ0VXBkYXRpbmd9XG4gICAgICAgICAgICAgICAgc3RvcFVwZGF0aW5nPXtzdG9wVXBkYXRpbmd9PlxuICAgICAgICAgICAgICAgIHsgc3luYXBzZURlYWN0aXZhdGVCdXR0b24gfVxuICAgICAgICAgICAgPC9Sb29tQWRtaW5Ub29sc0NvbnRhaW5lcj5cbiAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHN5bmFwc2VEZWFjdGl2YXRlQnV0dG9uKSB7XG4gICAgICAgIGFkbWluVG9vbHNDb250YWluZXIgPSAoXG4gICAgICAgICAgICA8R2VuZXJpY0FkbWluVG9vbHNDb250YWluZXI+XG4gICAgICAgICAgICAgICAgeyBzeW5hcHNlRGVhY3RpdmF0ZUJ1dHRvbiB9XG4gICAgICAgICAgICA8L0dlbmVyaWNBZG1pblRvb2xzQ29udGFpbmVyPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGlmIChwZW5kaW5nVXBkYXRlQ291bnQgPiAwKSB7XG4gICAgICAgIHNwaW5uZXIgPSA8U3Bpbm5lciAvPjtcbiAgICB9XG5cbiAgICAvLyBvbmx5IGRpc3BsYXkgdGhlIGRldmljZXMgbGlzdCBpZiBvdXIgY2xpZW50IHN1cHBvcnRzIEUyRVxuICAgIGNvbnN0IGNyeXB0b0VuYWJsZWQgPSBjbGkuaXNDcnlwdG9FbmFibGVkKCk7XG5cbiAgICBsZXQgdGV4dDtcbiAgICBpZiAoIWlzUm9vbUVuY3J5cHRlZCkge1xuICAgICAgICBpZiAoIWNyeXB0b0VuYWJsZWQpIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIlRoaXMgY2xpZW50IGRvZXMgbm90IHN1cHBvcnQgZW5kLXRvLWVuZCBlbmNyeXB0aW9uLlwiKTtcbiAgICAgICAgfSBlbHNlIGlmIChyb29tICYmICFyb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIk1lc3NhZ2VzIGluIHRoaXMgcm9vbSBhcmUgbm90IGVuZC10by1lbmQgZW5jcnlwdGVkLlwiKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICB0ZXh0ID0gX3QoXCJNZXNzYWdlcyBpbiB0aGlzIHJvb20gYXJlIGVuZC10by1lbmQgZW5jcnlwdGVkLlwiKTtcbiAgICB9XG5cbiAgICBsZXQgdmVyaWZ5QnV0dG9uO1xuICAgIGNvbnN0IGhvbWVzZXJ2ZXJTdXBwb3J0c0Nyb3NzU2lnbmluZyA9IHVzZUhvbWVzZXJ2ZXJTdXBwb3J0c0Nyb3NzU2lnbmluZyhjbGkpO1xuXG4gICAgY29uc3QgdXNlclRydXN0ID0gY3J5cHRvRW5hYmxlZCAmJiBjbGkuY2hlY2tVc2VyVHJ1c3QobWVtYmVyLnVzZXJJZCk7XG4gICAgY29uc3QgdXNlclZlcmlmaWVkID0gY3J5cHRvRW5hYmxlZCAmJiB1c2VyVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpO1xuICAgIGNvbnN0IGlzTWUgPSBtZW1iZXIudXNlcklkID09PSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgY29uc3QgY2FuVmVyaWZ5ID0gY3J5cHRvRW5hYmxlZCAmJiBob21lc2VydmVyU3VwcG9ydHNDcm9zc1NpZ25pbmcgJiYgIXVzZXJWZXJpZmllZCAmJiAhaXNNZSAmJlxuICAgICAgICBkZXZpY2VzICYmIGRldmljZXMubGVuZ3RoID4gMDtcblxuICAgIGNvbnN0IHNldFVwZGF0aW5nID0gKHVwZGF0aW5nKSA9PiB7XG4gICAgICAgIHNldFBlbmRpbmdVcGRhdGVDb3VudChjb3VudCA9PiBjb3VudCArICh1cGRhdGluZyA/IDEgOiAtMSkpO1xuICAgIH07XG4gICAgY29uc3QgaGFzQ3Jvc3NTaWduaW5nS2V5cyA9IHVzZUhhc0Nyb3NzU2lnbmluZ0tleXMoY2xpLCBtZW1iZXIgYXMgVXNlciwgY2FuVmVyaWZ5LCBzZXRVcGRhdGluZyk7XG5cbiAgICBjb25zdCBzaG93RGV2aWNlTGlzdFNwaW5uZXIgPSBkZXZpY2VzID09PSB1bmRlZmluZWQ7XG4gICAgaWYgKGNhblZlcmlmeSkge1xuICAgICAgICBpZiAoaGFzQ3Jvc3NTaWduaW5nS2V5cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBOb3RlOiBteF9Vc2VySW5mb192ZXJpZnlCdXR0b24gaXMgZm9yIHRoZSBlbmQtdG8tZW5kIHRlc3RzXG4gICAgICAgICAgICB2ZXJpZnlCdXR0b24gPSAoPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJfdmVyaWZ5QnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZCBteF9Vc2VySW5mb192ZXJpZnlCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQ3Jvc3NTaWduaW5nS2V5cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcmlmeVVzZXIobWVtYmVyIGFzIFVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWdhY3lWZXJpZnlVc2VyKG1lbWJlciBhcyBVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJWZXJpZnlcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2Pik7XG4gICAgICAgIH0gZWxzZSBpZiAoIXNob3dEZXZpY2VMaXN0U3Bpbm5lcikge1xuICAgICAgICAgICAgLy8gSEFDSzogb25seSBzaG93IGEgc3Bpbm5lciBpZiB0aGUgZGV2aWNlIHNlY3Rpb24gc3Bpbm5lciBpcyBub3Qgc2hvd24sXG4gICAgICAgICAgICAvLyB0byBhdm9pZCBzaG93aW5nIGEgZG91YmxlIHNwaW5uZXJcbiAgICAgICAgICAgIC8vIFdlIHNob3VsZCBhc2sgZm9yIGEgZGVzaWduIHRoYXQgaW5jbHVkZXMgYWxsIHRoZSBkaWZmZXJlbnQgbG9hZGluZyBzdGF0ZXMgaGVyZVxuICAgICAgICAgICAgdmVyaWZ5QnV0dG9uID0gPFNwaW5uZXIgLz47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZWRpdERldmljZXM7XG4gICAgaWYgKG1lbWJlci51c2VySWQgPT0gY2xpLmdldFVzZXJJZCgpKSB7XG4gICAgICAgIGVkaXREZXZpY2VzID0gKDxkaXY+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19maWVsZFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxUYWJJZDogVXNlclRhYi5TZWN1cml0eSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiRWRpdCBkZXZpY2VzXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9kaXY+KTtcbiAgICB9XG5cbiAgICBjb25zdCBzZWN1cml0eVNlY3Rpb24gPSAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8aDM+eyBfdChcIlNlY3VyaXR5XCIpIH08L2gzPlxuICAgICAgICAgICAgPHA+eyB0ZXh0IH08L3A+XG4gICAgICAgICAgICB7IHZlcmlmeUJ1dHRvbiB9XG4gICAgICAgICAgICB7IGNyeXB0b0VuYWJsZWQgJiYgPERldmljZXNTZWN0aW9uXG4gICAgICAgICAgICAgICAgbG9hZGluZz17c2hvd0RldmljZUxpc3RTcGlubmVyfVxuICAgICAgICAgICAgICAgIGRldmljZXM9e2RldmljZXN9XG4gICAgICAgICAgICAgICAgdXNlcklkPXttZW1iZXIudXNlcklkfSAvPiB9XG4gICAgICAgICAgICB7IGVkaXREZXZpY2VzIH1cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcblxuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIHsgbWVtYmVyRGV0YWlscyB9XG5cbiAgICAgICAgeyBzZWN1cml0eVNlY3Rpb24gfVxuICAgICAgICA8VXNlck9wdGlvbnNTZWN0aW9uXG4gICAgICAgICAgICBjYW5JbnZpdGU9e3Jvb21QZXJtaXNzaW9ucy5jYW5JbnZpdGV9XG4gICAgICAgICAgICBpc0lnbm9yZWQ9e2lzSWdub3JlZH1cbiAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyIGFzIFJvb21NZW1iZXJ9XG4gICAgICAgICAgICBpc1NwYWNlPXtyb29tPy5pc1NwYWNlUm9vbSgpfVxuICAgICAgICAvPlxuXG4gICAgICAgIHsgYWRtaW5Ub29sc0NvbnRhaW5lciB9XG5cbiAgICAgICAgeyBzcGlubmVyIH1cbiAgICA8L1JlYWN0LkZyYWdtZW50Pjtcbn07XG5cbmV4cG9ydCB0eXBlIE1lbWJlciA9IFVzZXIgfCBSb29tTWVtYmVyO1xuXG5jb25zdCBVc2VySW5mb0hlYWRlcjogUmVhY3QuRkM8e1xuICAgIG1lbWJlcjogTWVtYmVyO1xuICAgIGUyZVN0YXR1czogRTJFU3RhdHVzO1xuICAgIHJvb21JZD86IHN0cmluZztcbn0+ID0gKHsgbWVtYmVyLCBlMmVTdGF0dXMsIHJvb21JZCB9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IG9uTWVtYmVyQXZhdGFyQ2xpY2sgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGF2YXRhclVybCA9IChtZW1iZXIgYXMgUm9vbU1lbWJlcikuZ2V0TXhjQXZhdGFyVXJsXG4gICAgICAgICAgICA/IChtZW1iZXIgYXMgUm9vbU1lbWJlcikuZ2V0TXhjQXZhdGFyVXJsKClcbiAgICAgICAgICAgIDogKG1lbWJlciBhcyBVc2VyKS5hdmF0YXJVcmw7XG4gICAgICAgIGlmICghYXZhdGFyVXJsKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaHR0cFVybCA9IG1lZGlhRnJvbU14YyhhdmF0YXJVcmwpLnNyY0h0dHA7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgIHNyYzogaHR0cFVybCxcbiAgICAgICAgICAgIG5hbWU6IChtZW1iZXIgYXMgUm9vbU1lbWJlcikubmFtZSB8fCAobWVtYmVyIGFzIFVzZXIpLmRpc3BsYXlOYW1lLFxuICAgICAgICB9O1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhJbWFnZVZpZXcsIHBhcmFtcywgXCJteF9EaWFsb2dfbGlnaHRib3hcIiwgbnVsbCwgdHJ1ZSk7XG4gICAgfSwgW21lbWJlcl0pO1xuXG4gICAgY29uc3QgYXZhdGFyRWxlbWVudCA9IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19hdmF0YXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fYXZhdGFyX3RyYW5zaXRpb25cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2F2YXRhcl90cmFuc2l0aW9uX2NoaWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxNZW1iZXJBdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17bWVtYmVyLnVzZXJJZH0gLy8gdG8gaW5zdGFudGx5IGJsYW5rIHRoZSBhdmF0YXIgd2hlbiBVc2VySW5mbyBjaGFuZ2VzIG1lbWJlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyIGFzIFJvb21NZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17MiAqIDAuMyAqIFVJU3RvcmUuaW5zdGFuY2Uud2luZG93SGVpZ2h0fSAvLyAyeEAzMHZoXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezIgKiAwLjMgKiBVSVN0b3JlLmluc3RhbmNlLndpbmRvd0hlaWdodH0gLy8gMnhAMzB2aFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzaXplTWV0aG9kPVwic2NhbGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGJhY2tVc2VySWQ9e21lbWJlci51c2VySWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbk1lbWJlckF2YXRhckNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXJscz17KG1lbWJlciBhcyBVc2VyKS5hdmF0YXJVcmwgPyBbKG1lbWJlciBhcyBVc2VyKS5hdmF0YXJVcmxdIDogdW5kZWZpbmVkfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICBsZXQgcHJlc2VuY2VTdGF0ZTtcbiAgICBsZXQgcHJlc2VuY2VMYXN0QWN0aXZlQWdvO1xuICAgIGxldCBwcmVzZW5jZUN1cnJlbnRseUFjdGl2ZTtcbiAgICBpZiAobWVtYmVyIGluc3RhbmNlb2YgUm9vbU1lbWJlciAmJiBtZW1iZXIudXNlcikge1xuICAgICAgICBwcmVzZW5jZVN0YXRlID0gbWVtYmVyLnVzZXIucHJlc2VuY2U7XG4gICAgICAgIHByZXNlbmNlTGFzdEFjdGl2ZUFnbyA9IG1lbWJlci51c2VyLmxhc3RBY3RpdmVBZ287XG4gICAgICAgIHByZXNlbmNlQ3VycmVudGx5QWN0aXZlID0gbWVtYmVyLnVzZXIuY3VycmVudGx5QWN0aXZlO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYWJsZVByZXNlbmNlQnlIc1VybCA9IFNka0NvbmZpZy5nZXQoXCJlbmFibGVfcHJlc2VuY2VfYnlfaHNfdXJsXCIpO1xuICAgIGxldCBzaG93UHJlc2VuY2UgPSB0cnVlO1xuICAgIGlmIChlbmFibGVQcmVzZW5jZUJ5SHNVcmwgJiYgZW5hYmxlUHJlc2VuY2VCeUhzVXJsW2NsaS5iYXNlVXJsXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNob3dQcmVzZW5jZSA9IGVuYWJsZVByZXNlbmNlQnlIc1VybFtjbGkuYmFzZVVybF07XG4gICAgfVxuXG4gICAgbGV0IHByZXNlbmNlTGFiZWwgPSBudWxsO1xuICAgIGlmIChzaG93UHJlc2VuY2UpIHtcbiAgICAgICAgcHJlc2VuY2VMYWJlbCA9IChcbiAgICAgICAgICAgIDxQcmVzZW5jZUxhYmVsXG4gICAgICAgICAgICAgICAgYWN0aXZlQWdvPXtwcmVzZW5jZUxhc3RBY3RpdmVBZ299XG4gICAgICAgICAgICAgICAgY3VycmVudGx5QWN0aXZlPXtwcmVzZW5jZUN1cnJlbnRseUFjdGl2ZX1cbiAgICAgICAgICAgICAgICBwcmVzZW5jZVN0YXRlPXtwcmVzZW5jZVN0YXRlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgZTJlSWNvbjtcbiAgICBpZiAoZTJlU3RhdHVzKSB7XG4gICAgICAgIGUyZUljb24gPSA8RTJFSWNvbiBzaXplPXsxOH0gc3RhdHVzPXtlMmVTdGF0dXN9IGlzVXNlcj17dHJ1ZX0gLz47XG4gICAgfVxuXG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSAobWVtYmVyIGFzIFJvb21NZW1iZXIpLnJhd0Rpc3BsYXlOYW1lO1xuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIHsgYXZhdGFyRWxlbWVudCB9XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXIgbXhfVXNlckluZm9fc2VwYXJhdG9yXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3Byb2ZpbGVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGUyZUljb24gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gdGl0bGU9e2Rpc3BsYXlOYW1lfSBhcmlhLWxhYmVsPXtkaXNwbGF5TmFtZX0gZGlyPVwiYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZGlzcGxheU5hbWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2gyPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fcHJvZmlsZV9teGlkXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgVXNlcklkZW50aWZpZXJDdXN0b21pc2F0aW9ucy5nZXREaXNwbGF5VXNlcklkZW50aWZpZXIobWVtYmVyLnVzZXJJZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2l0aERpc3BsYXlOYW1lOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19wcm9maWxlU3RhdHVzXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgcHJlc2VuY2VMYWJlbCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG59O1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICB1c2VyOiBNZW1iZXI7XG4gICAgcm9vbT86IFJvb207XG4gICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm9cbiAgICAgICAgfCBSaWdodFBhbmVsUGhhc2VzLlNwYWNlTWVtYmVySW5mb1xuICAgICAgICB8IFJpZ2h0UGFuZWxQaGFzZXMuRW5jcnlwdGlvblBhbmVsO1xuICAgIG9uQ2xvc2UoKTogdm9pZDtcbiAgICB2ZXJpZmljYXRpb25SZXF1ZXN0PzogVmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICB2ZXJpZmljYXRpb25SZXF1ZXN0UHJvbWlzZT86IFByb21pc2U8VmVyaWZpY2F0aW9uUmVxdWVzdD47XG59XG5cbmNvbnN0IFVzZXJJbmZvOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHtcbiAgICB1c2VyLFxuICAgIHJvb20sXG4gICAgb25DbG9zZSxcbiAgICBwaGFzZSA9IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm8sXG4gICAgLi4ucHJvcHNcbn0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgLy8gZmV0Y2ggbGF0ZXN0IHJvb20gbWVtYmVyIGlmIHdlIGhhdmUgYSByb29tLCBzbyB3ZSBkb24ndCBzaG93IGhpc3RvcmljYWwgaW5mb3JtYXRpb24sIGZhbGxpbmcgYmFjayB0byB1c2VyXG4gICAgY29uc3QgbWVtYmVyID0gdXNlTWVtbygoKSA9PiByb29tID8gKHJvb20uZ2V0TWVtYmVyKHVzZXIudXNlcklkKSB8fCB1c2VyKSA6IHVzZXIsIFtyb29tLCB1c2VyXSk7XG5cbiAgICBjb25zdCBpc1Jvb21FbmNyeXB0ZWQgPSB1c2VJc0VuY3J5cHRlZChjbGksIHJvb20pO1xuICAgIGNvbnN0IGRldmljZXMgPSB1c2VEZXZpY2VzKHVzZXIudXNlcklkKTtcblxuICAgIGxldCBlMmVTdGF0dXM7XG4gICAgaWYgKGlzUm9vbUVuY3J5cHRlZCAmJiBkZXZpY2VzKSB7XG4gICAgICAgIGUyZVN0YXR1cyA9IGdldEUyRVN0YXR1cyhjbGksIHVzZXIudXNlcklkLCBkZXZpY2VzKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc2VzID0gW1wibXhfVXNlckluZm9cIl07XG5cbiAgICBsZXQgY2FyZFN0YXRlOiBJUmlnaHRQYW5lbENhcmRTdGF0ZTtcbiAgICAvLyBXZSBoYXZlIG5vIHByZXZpb3VzUGhhc2UgZm9yIHdoZW4gdmlld2luZyBhIFVzZXJJbmZvIHdpdGhvdXQgYSBSb29tIGF0IHRoaXMgdGltZVxuICAgIGlmIChyb29tICYmIHBoYXNlID09PSBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbCkge1xuICAgICAgICBjYXJkU3RhdGUgPSB7IG1lbWJlciB9O1xuICAgIH0gZWxzZSBpZiAocm9vbT8uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICBjYXJkU3RhdGUgPSB7IHNwYWNlSWQ6IHJvb20ucm9vbUlkIH07XG4gICAgfVxuXG4gICAgY29uc3Qgb25FbmNyeXB0aW9uUGFuZWxDbG9zZSA9ICgpID0+IHtcbiAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnBvcENhcmQoKTtcbiAgICB9O1xuXG4gICAgbGV0IGNvbnRlbnQ7XG4gICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm86XG4gICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5TcGFjZU1lbWJlckluZm86XG4gICAgICAgICAgICBjb250ZW50ID0gKFxuICAgICAgICAgICAgICAgIDxCYXNpY1VzZXJJbmZvXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyIGFzIFVzZXJ9XG4gICAgICAgICAgICAgICAgICAgIGRldmljZXM9e2RldmljZXN9XG4gICAgICAgICAgICAgICAgICAgIGlzUm9vbUVuY3J5cHRlZD17aXNSb29tRW5jcnlwdGVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWw6XG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goXCJteF9Vc2VySW5mb19zbWFsbEF2YXRhclwiKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgICAgICAgICAgPEVuY3J5cHRpb25QYW5lbFxuICAgICAgICAgICAgICAgICAgICB7Li4ucHJvcHMgYXMgUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEVuY3J5cHRpb25QYW5lbD59XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bWVtYmVyIGFzIFVzZXIgfCBSb29tTWVtYmVyfVxuICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXtvbkVuY3J5cHRpb25QYW5lbENsb3NlfVxuICAgICAgICAgICAgICAgICAgICBpc1Jvb21FbmNyeXB0ZWQ9e2lzUm9vbUVuY3J5cHRlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBjbG9zZUxhYmVsID0gdW5kZWZpbmVkO1xuICAgIGlmIChwaGFzZSA9PT0gUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWwpIHtcbiAgICAgICAgY29uc3QgdmVyaWZpY2F0aW9uUmVxdWVzdCA9IChwcm9wcyBhcyBSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgRW5jcnlwdGlvblBhbmVsPikudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgaWYgKHZlcmlmaWNhdGlvblJlcXVlc3QgJiYgdmVyaWZpY2F0aW9uUmVxdWVzdC5wZW5kaW5nKSB7XG4gICAgICAgICAgICBjbG9zZUxhYmVsID0gX3QoXCJDYW5jZWxcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgc2NvcGVIZWFkZXI7XG4gICAgaWYgKHJvb20/LmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgc2NvcGVIZWFkZXIgPSA8ZGl2IGRhdGEtdGVzdC1pZD0nc3BhY2UtaGVhZGVyJyBjbGFzc05hbWU9XCJteF9SaWdodFBhbmVsX3Njb3BlSGVhZGVyXCI+XG4gICAgICAgICAgICA8Um9vbUF2YXRhciByb29tPXtyb29tfSBoZWlnaHQ9ezMyfSB3aWR0aD17MzJ9IC8+XG4gICAgICAgICAgICA8Um9vbU5hbWUgcm9vbT17cm9vbX0gLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlciA9IDw+XG4gICAgICAgIHsgc2NvcGVIZWFkZXIgfVxuICAgICAgICA8VXNlckluZm9IZWFkZXIgbWVtYmVyPXttZW1iZXJ9IGUyZVN0YXR1cz17ZTJlU3RhdHVzfSByb29tSWQ9e3Jvb20/LnJvb21JZH0gLz5cbiAgICA8Lz47XG4gICAgcmV0dXJuIDxCYXNlQ2FyZFxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXMuam9pbihcIiBcIil9XG4gICAgICAgIGhlYWRlcj17aGVhZGVyfVxuICAgICAgICBvbkNsb3NlPXtvbkNsb3NlfVxuICAgICAgICBjbG9zZUxhYmVsPXtjbG9zZUxhYmVsfVxuICAgICAgICBjYXJkU3RhdGU9e2NhcmRTdGF0ZX1cbiAgICAgICAgb25CYWNrPXsoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnByZXZpb3VzQ2FyZC5waGFzZSA9PT0gUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdCkge1xuICAgICAgICAgICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViUmlnaHRQYW5lbFJvb21Vc2VySW5mb0JhY2tCdXR0b25cIiwgZXYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9fVxuICAgID5cbiAgICAgICAgeyBjb250ZW50IH1cbiAgICA8L0Jhc2VDYXJkPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFVzZXJJbmZvO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUNBOztBQUNBOztBQUtBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztB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