"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSenderName = getSenderName;
exports.hasText = hasText;
exports.textForEvent = textForEvent;
exports.textForLocationEvent = textForLocationEvent;

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _utils = require("matrix-js-sdk/src/utils");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _event = require("matrix-js-sdk/src/@types/event");

var _matrixEventsSdk = require("matrix-events-sdk");

var _languageHandler = require("./languageHandler");

var Roles = _interopRequireWildcard(require("./Roles"));

var _RoomInvite = require("./RoomInvite");

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _BanList = require("./mjolnir/BanList");

var _WidgetLayoutStore = require("./stores/widgets/WidgetLayoutStore");

var _RightPanelStorePhases = require("./stores/right-panel/RightPanelStorePhases");

var _actions = require("./dispatcher/actions");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _RoomSettingsDialog = require("./components/views/dialogs/RoomSettingsDialog");

var _AccessibleButton = _interopRequireDefault(require("./components/views/elements/AccessibleButton"));

var _RightPanelStore = _interopRequireDefault(require("./stores/right-panel/RightPanelStore"));

var _UserIdentifier = _interopRequireDefault(require("./customisations/UserIdentifier"));

var _EventUtils = require("./utils/EventUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015 - 2022 The Matrix.org Foundation C.I.C.

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
function getSenderName(event) {
  return event.sender?.name ?? event.getSender() ?? (0, _languageHandler._t)("Someone");
}

function getRoomMemberDisplayname(event) {
  let userId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : event.getSender();

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const roomId = event.getRoomId();
  const member = client.getRoom(roomId)?.getMember(userId);
  return member?.rawDisplayName || userId || (0, _languageHandler._t)("Someone");
} // These functions are frequently used just to check whether an event has
// any text to display at all. For this reason they return deferred values
// to avoid the expense of looking up translations when they're not needed.


function textForCallInviteEvent(event) {
  const senderName = getSenderName(event); // FIXME: Find a better way to determine this from the event?

  const isVoice = !event.getContent().offer?.sdp?.includes('m=video');

  const isSupported = _MatrixClientPeg.MatrixClientPeg.get().supportsVoip(); // This ladder could be reduced down to a couple string variables, however other languages
  // can have a hard time translating those strings. In an effort to make translations easier
  // and more accurate, we break out the string-based variables to a couple booleans.


  if (isVoice && isSupported) {
    return () => (0, _languageHandler._t)("%(senderName)s placed a voice call.", {
      senderName
    });
  } else if (isVoice && !isSupported) {
    return () => (0, _languageHandler._t)("%(senderName)s placed a voice call. (not supported by this browser)", {
      senderName
    });
  } else if (!isVoice && isSupported) {
    return () => (0, _languageHandler._t)("%(senderName)s placed a video call.", {
      senderName
    });
  } else if (!isVoice && !isSupported) {
    return () => (0, _languageHandler._t)("%(senderName)s placed a video call. (not supported by this browser)", {
      senderName
    });
  }
}

function textForMemberEvent(ev, allowJSX, showHiddenEvents) {
  // XXX: SYJS-16 "sender is sometimes null for join messages"
  const senderName = ev.sender?.name || getRoomMemberDisplayname(ev);
  const targetName = ev.target?.name || getRoomMemberDisplayname(ev, ev.getStateKey());
  const prevContent = ev.getPrevContent();
  const content = ev.getContent();
  const reason = content.reason;

  switch (content.membership) {
    case 'invite':
      {
        const threePidContent = content.third_party_invite;

        if (threePidContent) {
          if (threePidContent.display_name) {
            return () => (0, _languageHandler._t)('%(targetName)s accepted the invitation for %(displayName)s', {
              targetName,
              displayName: threePidContent.display_name
            });
          } else {
            return () => (0, _languageHandler._t)('%(targetName)s accepted an invitation', {
              targetName
            });
          }
        } else {
          return () => (0, _languageHandler._t)('%(senderName)s invited %(targetName)s', {
            senderName,
            targetName
          });
        }
      }

    case 'ban':
      return () => reason ? (0, _languageHandler._t)('%(senderName)s banned %(targetName)s: %(reason)s', {
        senderName,
        targetName,
        reason
      }) : (0, _languageHandler._t)('%(senderName)s banned %(targetName)s', {
        senderName,
        targetName
      });

    case 'join':
      if (prevContent && prevContent.membership === 'join') {
        if (prevContent.displayname && content.displayname && prevContent.displayname !== content.displayname) {
          return () => (0, _languageHandler._t)('%(oldDisplayName)s changed their display name to %(displayName)s', {
            // We're taking the display namke directly from the event content here so we need
            // to strip direction override chars which the js-sdk would normally do when
            // calculating the display name
            oldDisplayName: (0, _utils.removeDirectionOverrideChars)(prevContent.displayname),
            displayName: (0, _utils.removeDirectionOverrideChars)(content.displayname)
          });
        } else if (!prevContent.displayname && content.displayname) {
          return () => (0, _languageHandler._t)('%(senderName)s set their display name to %(displayName)s', {
            senderName: ev.getSender(),
            displayName: (0, _utils.removeDirectionOverrideChars)(content.displayname)
          });
        } else if (prevContent.displayname && !content.displayname) {
          return () => (0, _languageHandler._t)('%(senderName)s removed their display name (%(oldDisplayName)s)', {
            senderName,
            oldDisplayName: (0, _utils.removeDirectionOverrideChars)(prevContent.displayname)
          });
        } else if (prevContent.avatar_url && !content.avatar_url) {
          return () => (0, _languageHandler._t)('%(senderName)s removed their profile picture', {
            senderName
          });
        } else if (prevContent.avatar_url && content.avatar_url && prevContent.avatar_url !== content.avatar_url) {
          return () => (0, _languageHandler._t)('%(senderName)s changed their profile picture', {
            senderName
          });
        } else if (!prevContent.avatar_url && content.avatar_url) {
          return () => (0, _languageHandler._t)('%(senderName)s set a profile picture', {
            senderName
          });
        } else if (showHiddenEvents ?? _SettingsStore.default.getValue("showHiddenEventsInTimeline")) {
          // This is a null rejoin, it will only be visible if using 'show hidden events' (labs)
          return () => (0, _languageHandler._t)("%(senderName)s made no change", {
            senderName
          });
        } else {
          return null;
        }
      } else {
        if (!ev.target) _logger.logger.warn("Join message has no target! -- " + ev.getContent().state_key);
        return () => (0, _languageHandler._t)('%(targetName)s joined the room', {
          targetName
        });
      }

    case 'leave':
      if (ev.getSender() === ev.getStateKey()) {
        if (prevContent.membership === "invite") {
          return () => (0, _languageHandler._t)('%(targetName)s rejected the invitation', {
            targetName
          });
        } else {
          return () => reason ? (0, _languageHandler._t)('%(targetName)s left the room: %(reason)s', {
            targetName,
            reason
          }) : (0, _languageHandler._t)('%(targetName)s left the room', {
            targetName
          });
        }
      } else if (prevContent.membership === "ban") {
        return () => (0, _languageHandler._t)('%(senderName)s unbanned %(targetName)s', {
          senderName,
          targetName
        });
      } else if (prevContent.membership === "invite") {
        return () => reason ? (0, _languageHandler._t)('%(senderName)s withdrew %(targetName)s\'s invitation: %(reason)s', {
          senderName,
          targetName,
          reason
        }) : (0, _languageHandler._t)('%(senderName)s withdrew %(targetName)s\'s invitation', {
          senderName,
          targetName
        });
      } else if (prevContent.membership === "join") {
        return () => reason ? (0, _languageHandler._t)('%(senderName)s removed %(targetName)s: %(reason)s', {
          senderName,
          targetName,
          reason
        }) : (0, _languageHandler._t)('%(senderName)s removed %(targetName)s', {
          senderName,
          targetName
        });
      } else {
        return null;
      }

  }
}

function textForTopicEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  return () => (0, _languageHandler._t)('%(senderDisplayName)s changed the topic to "%(topic)s".', {
    senderDisplayName,
    topic: ev.getContent().topic
  });
}

function textForRoomAvatarEvent(ev) {
  const senderDisplayName = ev?.sender?.name || ev.getSender();
  return () => (0, _languageHandler._t)('%(senderDisplayName)s changed the room avatar.', {
    senderDisplayName
  });
}

function textForRoomNameEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

  if (!ev.getContent().name || ev.getContent().name.trim().length === 0) {
    return () => (0, _languageHandler._t)('%(senderDisplayName)s removed the room name.', {
      senderDisplayName
    });
  }

  if (ev.getPrevContent().name) {
    return () => (0, _languageHandler._t)('%(senderDisplayName)s changed the room name from %(oldRoomName)s to %(newRoomName)s.', {
      senderDisplayName,
      oldRoomName: ev.getPrevContent().name,
      newRoomName: ev.getContent().name
    });
  }

  return () => (0, _languageHandler._t)('%(senderDisplayName)s changed the room name to %(roomName)s.', {
    senderDisplayName,
    roomName: ev.getContent().name
  });
}

function textForTombstoneEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  return () => (0, _languageHandler._t)('%(senderDisplayName)s upgraded this room.', {
    senderDisplayName
  });
}

const onViewJoinRuleSettingsClick = () => {
  _dispatcher.default.dispatch({
    action: "open_room_settings",
    initial_tab_id: _RoomSettingsDialog.ROOM_SECURITY_TAB
  });
};

function textForJoinRulesEvent(ev, allowJSX) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

  switch (ev.getContent().join_rule) {
    case _partials.JoinRule.Public:
      return () => (0, _languageHandler._t)('%(senderDisplayName)s made the room public to whoever knows the link.', {
        senderDisplayName
      });

    case _partials.JoinRule.Invite:
      return () => (0, _languageHandler._t)('%(senderDisplayName)s made the room invite only.', {
        senderDisplayName
      });

    case _partials.JoinRule.Restricted:
      if (allowJSX) {
        return () => /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)('%(senderDisplayName)s changed who can join this room. <a>View settings</a>.', {
          senderDisplayName
        }, {
          "a": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: onViewJoinRuleSettingsClick
          }, sub)
        }));
      }

      return () => (0, _languageHandler._t)('%(senderDisplayName)s changed who can join this room.', {
        senderDisplayName
      });

    default:
      // The spec supports "knock" and "private", however nothing implements these.
      return () => (0, _languageHandler._t)('%(senderDisplayName)s changed the join rule to %(rule)s', {
        senderDisplayName,
        rule: ev.getContent().join_rule
      });
  }
}

function textForGuestAccessEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

  switch (ev.getContent().guest_access) {
    case _partials.GuestAccess.CanJoin:
      return () => (0, _languageHandler._t)('%(senderDisplayName)s has allowed guests to join the room.', {
        senderDisplayName
      });

    case _partials.GuestAccess.Forbidden:
      return () => (0, _languageHandler._t)('%(senderDisplayName)s has prevented guests from joining the room.', {
        senderDisplayName
      });

    default:
      // There's no other options we can expect, however just for safety's sake we'll do this.
      return () => (0, _languageHandler._t)('%(senderDisplayName)s changed guest access to %(rule)s', {
        senderDisplayName,
        rule: ev.getContent().guest_access
      });
  }
}

function textForServerACLEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  const prevContent = ev.getPrevContent();
  const current = ev.getContent();
  const prev = {
    deny: Array.isArray(prevContent.deny) ? prevContent.deny : [],
    allow: Array.isArray(prevContent.allow) ? prevContent.allow : [],
    allow_ip_literals: prevContent.allow_ip_literals !== false
  };
  let getText = null;

  if (prev.deny.length === 0 && prev.allow.length === 0) {
    getText = () => (0, _languageHandler._t)("%(senderDisplayName)s set the server ACLs for this room.", {
      senderDisplayName
    });
  } else {
    getText = () => (0, _languageHandler._t)("%(senderDisplayName)s changed the server ACLs for this room.", {
      senderDisplayName
    });
  }

  if (!Array.isArray(current.allow)) {
    current.allow = [];
  } // If we know for sure everyone is banned, mark the room as obliterated


  if (current.allow.length === 0) {
    return () => getText() + " " + (0, _languageHandler._t)("🎉 All servers are banned from participating! This room can no longer be used.");
  }

  return getText;
}

function textForMessageEvent(ev) {
  if ((0, _EventUtils.isLocationEvent)(ev)) {
    return textForLocationEvent(ev);
  }

  return () => {
    const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
    let message = ev.getContent().body;

    if (ev.isRedacted()) {
      message = textForRedactedPollAndMessageEvent(ev);
    }

    if (_SettingsStore.default.isEnabled("feature_extensible_events")) {
      const extev = ev.unstableExtensibleEvent;

      if (extev) {
        if (extev.isEquivalentTo(_matrixEventsSdk.M_EMOTE)) {
          return `* ${senderDisplayName} ${extev.text}`;
        } else if (extev.isEquivalentTo(_matrixEventsSdk.M_NOTICE) || extev.isEquivalentTo(_matrixEventsSdk.M_MESSAGE)) {
          return `${senderDisplayName}: ${extev.text}`;
        }
      }
    }

    if (ev.getContent().msgtype === _event.MsgType.Emote) {
      message = "* " + senderDisplayName + " " + message;
    } else if (ev.getContent().msgtype === _event.MsgType.Image) {
      message = (0, _languageHandler._t)('%(senderDisplayName)s sent an image.', {
        senderDisplayName
      });
    } else if (ev.getType() == _event.EventType.Sticker) {
      message = (0, _languageHandler._t)('%(senderDisplayName)s sent a sticker.', {
        senderDisplayName
      });
    } else {
      // in this case, parse it as a plain text message
      message = senderDisplayName + ': ' + message;
    }

    return message;
  };
}

function textForCanonicalAliasEvent(ev) {
  const senderName = getSenderName(ev);
  const oldAlias = ev.getPrevContent().alias;
  const oldAltAliases = ev.getPrevContent().alt_aliases || [];
  const newAlias = ev.getContent().alias;
  const newAltAliases = ev.getContent().alt_aliases || [];
  const removedAltAliases = oldAltAliases.filter(alias => !newAltAliases.includes(alias));
  const addedAltAliases = newAltAliases.filter(alias => !oldAltAliases.includes(alias));

  if (!removedAltAliases.length && !addedAltAliases.length) {
    if (newAlias) {
      return () => (0, _languageHandler._t)('%(senderName)s set the main address for this room to %(address)s.', {
        senderName,
        address: ev.getContent().alias
      });
    } else if (oldAlias) {
      return () => (0, _languageHandler._t)('%(senderName)s removed the main address for this room.', {
        senderName
      });
    }
  } else if (newAlias === oldAlias) {
    if (addedAltAliases.length && !removedAltAliases.length) {
      return () => (0, _languageHandler._t)('%(senderName)s added the alternative addresses %(addresses)s for this room.', {
        senderName,
        addresses: addedAltAliases.join(", "),
        count: addedAltAliases.length
      });
    }

    if (removedAltAliases.length && !addedAltAliases.length) {
      return () => (0, _languageHandler._t)('%(senderName)s removed the alternative addresses %(addresses)s for this room.', {
        senderName,
        addresses: removedAltAliases.join(", "),
        count: removedAltAliases.length
      });
    }

    if (removedAltAliases.length && addedAltAliases.length) {
      return () => (0, _languageHandler._t)('%(senderName)s changed the alternative addresses for this room.', {
        senderName
      });
    }
  } else {
    // both alias and alt_aliases where modified
    return () => (0, _languageHandler._t)('%(senderName)s changed the main and alternative addresses for this room.', {
      senderName
    });
  } // in case there is no difference between the two events,
  // say something as we can't simply hide the tile from here


  return () => (0, _languageHandler._t)('%(senderName)s changed the addresses for this room.', {
    senderName
  });
}

function textForThreePidInviteEvent(event) {
  const senderName = getSenderName(event);

  if (!(0, _RoomInvite.isValid3pidInvite)(event)) {
    return () => (0, _languageHandler._t)('%(senderName)s revoked the invitation for %(targetDisplayName)s to join the room.', {
      senderName,
      targetDisplayName: event.getPrevContent().display_name || (0, _languageHandler._t)("Someone")
    });
  }

  return () => (0, _languageHandler._t)('%(senderName)s sent an invitation to %(targetDisplayName)s to join the room.', {
    senderName,
    targetDisplayName: event.getContent().display_name
  });
}

function textForHistoryVisibilityEvent(event) {
  const senderName = getSenderName(event);

  switch (event.getContent().history_visibility) {
    case _partials.HistoryVisibility.Invited:
      return () => (0, _languageHandler._t)('%(senderName)s made future room history visible to all room members, ' + 'from the point they are invited.', {
        senderName
      });

    case _partials.HistoryVisibility.Joined:
      return () => (0, _languageHandler._t)('%(senderName)s made future room history visible to all room members, ' + 'from the point they joined.', {
        senderName
      });

    case _partials.HistoryVisibility.Shared:
      return () => (0, _languageHandler._t)('%(senderName)s made future room history visible to all room members.', {
        senderName
      });

    case _partials.HistoryVisibility.WorldReadable:
      return () => (0, _languageHandler._t)('%(senderName)s made future room history visible to anyone.', {
        senderName
      });

    default:
      return () => (0, _languageHandler._t)('%(senderName)s made future room history visible to unknown (%(visibility)s).', {
        senderName,
        visibility: event.getContent().history_visibility
      });
  }
} // Currently will only display a change if a user's power level is changed


function textForPowerEvent(event) {
  const senderName = getSenderName(event);

  if (!event.getPrevContent()?.users || !event.getContent()?.users) {
    return null;
  }

  const previousUserDefault = event.getPrevContent().users_default || 0;
  const currentUserDefault = event.getContent().users_default || 0; // Construct set of userIds

  const users = [];
  Object.keys(event.getContent().users).forEach(userId => {
    if (users.indexOf(userId) === -1) users.push(userId);
  });
  Object.keys(event.getPrevContent().users).forEach(userId => {
    if (users.indexOf(userId) === -1) users.push(userId);
  });
  const diffs = [];
  users.forEach(userId => {
    // Previous power level
    let from = event.getPrevContent().users[userId];

    if (!Number.isInteger(from)) {
      from = previousUserDefault;
    } // Current power level


    let to = event.getContent().users[userId];

    if (!Number.isInteger(to)) {
      to = currentUserDefault;
    }

    if (from === previousUserDefault && to === currentUserDefault) {
      return;
    }

    if (to !== from) {
      const name = _UserIdentifier.default.getDisplayUserIdentifier(userId, {
        roomId: event.getRoomId()
      });

      diffs.push({
        userId,
        name,
        from,
        to
      });
    }
  });

  if (!diffs.length) {
    return null;
  } // XXX: This is also surely broken for i18n


  return () => (0, _languageHandler._t)('%(senderName)s changed the power level of %(powerLevelDiffText)s.', {
    senderName,
    powerLevelDiffText: diffs.map(diff => (0, _languageHandler._t)('%(userId)s from %(fromPowerLevel)s to %(toPowerLevel)s', {
      userId: diff.name,
      fromPowerLevel: Roles.textualPowerLevel(diff.from, previousUserDefault),
      toPowerLevel: Roles.textualPowerLevel(diff.to, currentUserDefault)
    })).join(", ")
  });
}

const onPinnedOrUnpinnedMessageClick = (messageId, roomId) => {
  _dispatcher.default.dispatch({
    action: _actions.Action.ViewRoom,
    event_id: messageId,
    highlighted: true,
    room_id: roomId,
    metricsTrigger: undefined // room doesn't change

  });
};

const onPinnedMessagesClick = () => {
  _RightPanelStore.default.instance.setCard({
    phase: _RightPanelStorePhases.RightPanelPhases.PinnedMessages
  }, false);
};

function textForPinnedEvent(event, allowJSX) {
  if (!_SettingsStore.default.getValue("feature_pinning")) return null;
  const senderName = getSenderName(event);
  const roomId = event.getRoomId();
  const pinned = event.getContent().pinned ?? [];
  const previouslyPinned = event.getPrevContent().pinned ?? [];
  const newlyPinned = pinned.filter(item => previouslyPinned.indexOf(item) < 0);
  const newlyUnpinned = previouslyPinned.filter(item => pinned.indexOf(item) < 0);

  if (newlyPinned.length === 1 && newlyUnpinned.length === 0) {
    // A single message was pinned, include a link to that message.
    if (allowJSX) {
      const messageId = newlyPinned.pop();
      return () => /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("%(senderName)s pinned <a>a message</a> to this room. See all <b>pinned messages</b>.", {
        senderName
      }, {
        "a": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: e => onPinnedOrUnpinnedMessageClick(messageId, roomId)
        }, sub),
        "b": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: onPinnedMessagesClick
        }, sub)
      }));
    }

    return () => (0, _languageHandler._t)("%(senderName)s pinned a message to this room. See all pinned messages.", {
      senderName
    });
  }

  if (newlyUnpinned.length === 1 && newlyPinned.length === 0) {
    // A single message was unpinned, include a link to that message.
    if (allowJSX) {
      const messageId = newlyUnpinned.pop();
      return () => /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("%(senderName)s unpinned <a>a message</a> from this room. See all <b>pinned messages</b>.", {
        senderName
      }, {
        "a": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: e => onPinnedOrUnpinnedMessageClick(messageId, roomId)
        }, sub),
        "b": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: onPinnedMessagesClick
        }, sub)
      }));
    }

    return () => (0, _languageHandler._t)("%(senderName)s unpinned a message from this room. See all pinned messages.", {
      senderName
    });
  }

  if (allowJSX) {
    return () => /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("%(senderName)s changed the <a>pinned messages</a> for the room.", {
      senderName
    }, {
      "a": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: onPinnedMessagesClick
      }, sub)
    }));
  }

  return () => (0, _languageHandler._t)("%(senderName)s changed the pinned messages for the room.", {
    senderName
  });
}

function textForWidgetEvent(event) {
  const senderName = getSenderName(event);
  const {
    name: prevName,
    type: prevType,
    url: prevUrl
  } = event.getPrevContent();
  const {
    name,
    type,
    url
  } = event.getContent() || {};
  let widgetName = name || prevName || type || prevType || ''; // Apply sentence case to widget name

  if (widgetName && widgetName.length > 0) {
    widgetName = widgetName[0].toUpperCase() + widgetName.slice(1);
  } // If the widget was removed, its content should be {}, but this is sufficiently
  // equivalent to that condition.


  if (url) {
    if (prevUrl) {
      return () => (0, _languageHandler._t)('%(widgetName)s widget modified by %(senderName)s', {
        widgetName,
        senderName
      });
    } else {
      return () => (0, _languageHandler._t)('%(widgetName)s widget added by %(senderName)s', {
        widgetName,
        senderName
      });
    }
  } else {
    return () => (0, _languageHandler._t)('%(widgetName)s widget removed by %(senderName)s', {
      widgetName,
      senderName
    });
  }
}

function textForWidgetLayoutEvent(event) {
  const senderName = getSenderName(event);
  return () => (0, _languageHandler._t)("%(senderName)s has updated the room layout", {
    senderName
  });
}

function textForMjolnirEvent(event) {
  const senderName = getSenderName(event);
  const {
    entity: prevEntity
  } = event.getPrevContent();
  const {
    entity,
    recommendation,
    reason
  } = event.getContent(); // Rule removed

  if (!entity) {
    if (_BanList.USER_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s removed the rule banning users matching %(glob)s", {
        senderName,
        glob: prevEntity
      });
    } else if (_BanList.ROOM_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s removed the rule banning rooms matching %(glob)s", {
        senderName,
        glob: prevEntity
      });
    } else if (_BanList.SERVER_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s removed the rule banning servers matching %(glob)s", {
        senderName,
        glob: prevEntity
      });
    } // Unknown type. We'll say something, but we shouldn't end up here.


    return () => (0, _languageHandler._t)("%(senderName)s removed a ban rule matching %(glob)s", {
      senderName,
      glob: prevEntity
    });
  } // Invalid rule


  if (!recommendation || !reason) return () => (0, _languageHandler._t)(`%(senderName)s updated an invalid ban rule`, {
    senderName
  }); // Rule updated

  if (entity === prevEntity) {
    if (_BanList.USER_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s updated the rule banning users matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } else if (_BanList.ROOM_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s updated the rule banning rooms matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } else if (_BanList.SERVER_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s updated the rule banning servers matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } // Unknown type. We'll say something but we shouldn't end up here.


    return () => (0, _languageHandler._t)("%(senderName)s updated a ban rule matching %(glob)s for %(reason)s", {
      senderName,
      glob: entity,
      reason
    });
  } // New rule


  if (!prevEntity) {
    if (_BanList.USER_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s created a rule banning users matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } else if (_BanList.ROOM_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s created a rule banning rooms matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } else if (_BanList.SERVER_RULE_TYPES.includes(event.getType())) {
      return () => (0, _languageHandler._t)("%(senderName)s created a rule banning servers matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } // Unknown type. We'll say something but we shouldn't end up here.


    return () => (0, _languageHandler._t)("%(senderName)s created a ban rule matching %(glob)s for %(reason)s", {
      senderName,
      glob: entity,
      reason
    });
  } // else the entity !== prevEntity - count as a removal & add


  if (_BanList.USER_RULE_TYPES.includes(event.getType())) {
    return () => (0, _languageHandler._t)("%(senderName)s changed a rule that was banning users matching %(oldGlob)s to matching " + "%(newGlob)s for %(reason)s", {
      senderName,
      oldGlob: prevEntity,
      newGlob: entity,
      reason
    });
  } else if (_BanList.ROOM_RULE_TYPES.includes(event.getType())) {
    return () => (0, _languageHandler._t)("%(senderName)s changed a rule that was banning rooms matching %(oldGlob)s to matching " + "%(newGlob)s for %(reason)s", {
      senderName,
      oldGlob: prevEntity,
      newGlob: entity,
      reason
    });
  } else if (_BanList.SERVER_RULE_TYPES.includes(event.getType())) {
    return () => (0, _languageHandler._t)("%(senderName)s changed a rule that was banning servers matching %(oldGlob)s to matching " + "%(newGlob)s for %(reason)s", {
      senderName,
      oldGlob: prevEntity,
      newGlob: entity,
      reason
    });
  } // Unknown type. We'll say something but we shouldn't end up here.


  return () => (0, _languageHandler._t)("%(senderName)s updated a ban rule that was matching %(oldGlob)s to matching %(newGlob)s " + "for %(reason)s", {
    senderName,
    oldGlob: prevEntity,
    newGlob: entity,
    reason
  });
}

function textForLocationEvent(event) {
  return () => (0, _languageHandler._t)("%(senderName)s has shared their location", {
    senderName: getSenderName(event)
  });
}

function textForRedactedPollAndMessageEvent(ev) {
  let message = (0, _languageHandler._t)("Message deleted");
  const unsigned = ev.getUnsigned();
  const redactedBecauseUserId = unsigned?.redacted_because?.sender;

  if (redactedBecauseUserId && redactedBecauseUserId !== ev.getSender()) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(ev.getRoomId());

    const sender = room?.getMember(redactedBecauseUserId);
    message = (0, _languageHandler._t)("Message deleted by %(name)s", {
      name: sender?.name || redactedBecauseUserId
    });
  }

  return message;
}

function textForPollStartEvent(event) {
  return () => {
    let message = '';

    if (event.isRedacted()) {
      message = textForRedactedPollAndMessageEvent(event);
      const senderDisplayName = event.sender?.name ?? event.getSender();
      message = senderDisplayName + ': ' + message;
    } else {
      message = (0, _languageHandler._t)("%(senderName)s has started a poll - %(pollQuestion)s", {
        senderName: getSenderName(event),
        pollQuestion: event.unstableExtensibleEvent?.question?.text
      });
    }

    return message;
  };
}

function textForPollEndEvent(event) {
  return () => (0, _languageHandler._t)("%(senderName)s has ended a poll", {
    senderName: getSenderName(event)
  });
}

const handlers = {
  [_event.EventType.RoomMessage]: textForMessageEvent,
  [_event.EventType.Sticker]: textForMessageEvent,
  [_event.EventType.CallInvite]: textForCallInviteEvent,
  [_matrixEventsSdk.M_POLL_START.name]: textForPollStartEvent,
  [_matrixEventsSdk.M_POLL_END.name]: textForPollEndEvent,
  [_matrixEventsSdk.M_POLL_START.altName]: textForPollStartEvent,
  [_matrixEventsSdk.M_POLL_END.altName]: textForPollEndEvent
};
const stateHandlers = {
  [_event.EventType.RoomCanonicalAlias]: textForCanonicalAliasEvent,
  [_event.EventType.RoomName]: textForRoomNameEvent,
  [_event.EventType.RoomTopic]: textForTopicEvent,
  [_event.EventType.RoomMember]: textForMemberEvent,
  [_event.EventType.RoomAvatar]: textForRoomAvatarEvent,
  [_event.EventType.RoomThirdPartyInvite]: textForThreePidInviteEvent,
  [_event.EventType.RoomHistoryVisibility]: textForHistoryVisibilityEvent,
  [_event.EventType.RoomPowerLevels]: textForPowerEvent,
  [_event.EventType.RoomPinnedEvents]: textForPinnedEvent,
  [_event.EventType.RoomServerAcl]: textForServerACLEvent,
  [_event.EventType.RoomTombstone]: textForTombstoneEvent,
  [_event.EventType.RoomJoinRules]: textForJoinRulesEvent,
  [_event.EventType.RoomGuestAccess]: textForGuestAccessEvent,
  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  'im.vector.modular.widgets': textForWidgetEvent,
  [_WidgetLayoutStore.WIDGET_LAYOUT_EVENT_TYPE]: textForWidgetLayoutEvent
}; // Add all the Mjolnir stuff to the renderer

for (const evType of _BanList.ALL_RULE_TYPES) {
  stateHandlers[evType] = textForMjolnirEvent;
}
/**
 * Determines whether the given event has text to display.
 * @param ev The event
 * @param showHiddenEvents An optional cached setting value for showHiddenEventsInTimeline
 *     to avoid hitting the settings store
 */


function hasText(ev, showHiddenEvents) {
  const handler = (ev.isState() ? stateHandlers : handlers)[ev.getType()];
  return Boolean(handler?.(ev, false, showHiddenEvents));
}
/**
 * Gets the textual content of the given event.
 * @param ev The event
 * @param allowJSX Whether to output rich JSX content
 * @param showHiddenEvents An optional cached setting value for showHiddenEventsInTimeline
 *     to avoid hitting the settings store
 */


function textForEvent(ev) {
  let allowJSX = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  let showHiddenEvents = arguments.length > 2 ? arguments[2] : undefined;
  const handler = (ev.isState() ? stateHandlers : handlers)[ev.getType()];
  return handler?.(ev, allowJSX, showHiddenEvents)?.() || '';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRTZW5kZXJOYW1lIiwiZXZlbnQiLCJzZW5kZXIiLCJuYW1lIiwiZ2V0U2VuZGVyIiwiX3QiLCJnZXRSb29tTWVtYmVyRGlzcGxheW5hbWUiLCJ1c2VySWQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyb29tSWQiLCJnZXRSb29tSWQiLCJtZW1iZXIiLCJnZXRSb29tIiwiZ2V0TWVtYmVyIiwicmF3RGlzcGxheU5hbWUiLCJ0ZXh0Rm9yQ2FsbEludml0ZUV2ZW50Iiwic2VuZGVyTmFtZSIsImlzVm9pY2UiLCJnZXRDb250ZW50Iiwib2ZmZXIiLCJzZHAiLCJpbmNsdWRlcyIsImlzU3VwcG9ydGVkIiwic3VwcG9ydHNWb2lwIiwidGV4dEZvck1lbWJlckV2ZW50IiwiZXYiLCJhbGxvd0pTWCIsInNob3dIaWRkZW5FdmVudHMiLCJ0YXJnZXROYW1lIiwidGFyZ2V0IiwiZ2V0U3RhdGVLZXkiLCJwcmV2Q29udGVudCIsImdldFByZXZDb250ZW50IiwiY29udGVudCIsInJlYXNvbiIsIm1lbWJlcnNoaXAiLCJ0aHJlZVBpZENvbnRlbnQiLCJ0aGlyZF9wYXJ0eV9pbnZpdGUiLCJkaXNwbGF5X25hbWUiLCJkaXNwbGF5TmFtZSIsImRpc3BsYXluYW1lIiwib2xkRGlzcGxheU5hbWUiLCJyZW1vdmVEaXJlY3Rpb25PdmVycmlkZUNoYXJzIiwiYXZhdGFyX3VybCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImxvZ2dlciIsIndhcm4iLCJzdGF0ZV9rZXkiLCJ0ZXh0Rm9yVG9waWNFdmVudCIsInNlbmRlckRpc3BsYXlOYW1lIiwidG9waWMiLCJ0ZXh0Rm9yUm9vbUF2YXRhckV2ZW50IiwidGV4dEZvclJvb21OYW1lRXZlbnQiLCJ0cmltIiwibGVuZ3RoIiwib2xkUm9vbU5hbWUiLCJuZXdSb29tTmFtZSIsInJvb21OYW1lIiwidGV4dEZvclRvbWJzdG9uZUV2ZW50Iiwib25WaWV3Sm9pblJ1bGVTZXR0aW5nc0NsaWNrIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsImluaXRpYWxfdGFiX2lkIiwiUk9PTV9TRUNVUklUWV9UQUIiLCJ0ZXh0Rm9ySm9pblJ1bGVzRXZlbnQiLCJqb2luX3J1bGUiLCJKb2luUnVsZSIsIlB1YmxpYyIsIkludml0ZSIsIlJlc3RyaWN0ZWQiLCJzdWIiLCJydWxlIiwidGV4dEZvckd1ZXN0QWNjZXNzRXZlbnQiLCJndWVzdF9hY2Nlc3MiLCJHdWVzdEFjY2VzcyIsIkNhbkpvaW4iLCJGb3JiaWRkZW4iLCJ0ZXh0Rm9yU2VydmVyQUNMRXZlbnQiLCJjdXJyZW50IiwicHJldiIsImRlbnkiLCJBcnJheSIsImlzQXJyYXkiLCJhbGxvdyIsImFsbG93X2lwX2xpdGVyYWxzIiwiZ2V0VGV4dCIsInRleHRGb3JNZXNzYWdlRXZlbnQiLCJpc0xvY2F0aW9uRXZlbnQiLCJ0ZXh0Rm9yTG9jYXRpb25FdmVudCIsIm1lc3NhZ2UiLCJib2R5IiwiaXNSZWRhY3RlZCIsInRleHRGb3JSZWRhY3RlZFBvbGxBbmRNZXNzYWdlRXZlbnQiLCJpc0VuYWJsZWQiLCJleHRldiIsInVuc3RhYmxlRXh0ZW5zaWJsZUV2ZW50IiwiaXNFcXVpdmFsZW50VG8iLCJNX0VNT1RFIiwidGV4dCIsIk1fTk9USUNFIiwiTV9NRVNTQUdFIiwibXNndHlwZSIsIk1zZ1R5cGUiLCJFbW90ZSIsIkltYWdlIiwiZ2V0VHlwZSIsIkV2ZW50VHlwZSIsIlN0aWNrZXIiLCJ0ZXh0Rm9yQ2Fub25pY2FsQWxpYXNFdmVudCIsIm9sZEFsaWFzIiwiYWxpYXMiLCJvbGRBbHRBbGlhc2VzIiwiYWx0X2FsaWFzZXMiLCJuZXdBbGlhcyIsIm5ld0FsdEFsaWFzZXMiLCJyZW1vdmVkQWx0QWxpYXNlcyIsImZpbHRlciIsImFkZGVkQWx0QWxpYXNlcyIsImFkZHJlc3MiLCJhZGRyZXNzZXMiLCJqb2luIiwiY291bnQiLCJ0ZXh0Rm9yVGhyZWVQaWRJbnZpdGVFdmVudCIsImlzVmFsaWQzcGlkSW52aXRlIiwidGFyZ2V0RGlzcGxheU5hbWUiLCJ0ZXh0Rm9ySGlzdG9yeVZpc2liaWxpdHlFdmVudCIsImhpc3RvcnlfdmlzaWJpbGl0eSIsIkhpc3RvcnlWaXNpYmlsaXR5IiwiSW52aXRlZCIsIkpvaW5lZCIsIlNoYXJlZCIsIldvcmxkUmVhZGFibGUiLCJ2aXNpYmlsaXR5IiwidGV4dEZvclBvd2VyRXZlbnQiLCJ1c2VycyIsInByZXZpb3VzVXNlckRlZmF1bHQiLCJ1c2Vyc19kZWZhdWx0IiwiY3VycmVudFVzZXJEZWZhdWx0IiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJpbmRleE9mIiwicHVzaCIsImRpZmZzIiwiZnJvbSIsIk51bWJlciIsImlzSW50ZWdlciIsInRvIiwiVXNlcklkZW50aWZpZXJDdXN0b21pc2F0aW9ucyIsImdldERpc3BsYXlVc2VySWRlbnRpZmllciIsInBvd2VyTGV2ZWxEaWZmVGV4dCIsIm1hcCIsImRpZmYiLCJmcm9tUG93ZXJMZXZlbCIsIlJvbGVzIiwidGV4dHVhbFBvd2VyTGV2ZWwiLCJ0b1Bvd2VyTGV2ZWwiLCJvblBpbm5lZE9yVW5waW5uZWRNZXNzYWdlQ2xpY2siLCJtZXNzYWdlSWQiLCJBY3Rpb24iLCJWaWV3Um9vbSIsImV2ZW50X2lkIiwiaGlnaGxpZ2h0ZWQiLCJyb29tX2lkIiwibWV0cmljc1RyaWdnZXIiLCJ1bmRlZmluZWQiLCJvblBpbm5lZE1lc3NhZ2VzQ2xpY2siLCJSaWdodFBhbmVsU3RvcmUiLCJpbnN0YW5jZSIsInNldENhcmQiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJQaW5uZWRNZXNzYWdlcyIsInRleHRGb3JQaW5uZWRFdmVudCIsInBpbm5lZCIsInByZXZpb3VzbHlQaW5uZWQiLCJuZXdseVBpbm5lZCIsIml0ZW0iLCJuZXdseVVucGlubmVkIiwicG9wIiwiZSIsInRleHRGb3JXaWRnZXRFdmVudCIsInByZXZOYW1lIiwidHlwZSIsInByZXZUeXBlIiwidXJsIiwicHJldlVybCIsIndpZGdldE5hbWUiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwidGV4dEZvcldpZGdldExheW91dEV2ZW50IiwidGV4dEZvck1qb2xuaXJFdmVudCIsImVudGl0eSIsInByZXZFbnRpdHkiLCJyZWNvbW1lbmRhdGlvbiIsIlVTRVJfUlVMRV9UWVBFUyIsImdsb2IiLCJST09NX1JVTEVfVFlQRVMiLCJTRVJWRVJfUlVMRV9UWVBFUyIsIm9sZEdsb2IiLCJuZXdHbG9iIiwidW5zaWduZWQiLCJnZXRVbnNpZ25lZCIsInJlZGFjdGVkQmVjYXVzZVVzZXJJZCIsInJlZGFjdGVkX2JlY2F1c2UiLCJyb29tIiwidGV4dEZvclBvbGxTdGFydEV2ZW50IiwicG9sbFF1ZXN0aW9uIiwicXVlc3Rpb24iLCJ0ZXh0Rm9yUG9sbEVuZEV2ZW50IiwiaGFuZGxlcnMiLCJSb29tTWVzc2FnZSIsIkNhbGxJbnZpdGUiLCJNX1BPTExfU1RBUlQiLCJNX1BPTExfRU5EIiwiYWx0TmFtZSIsInN0YXRlSGFuZGxlcnMiLCJSb29tQ2Fub25pY2FsQWxpYXMiLCJSb29tTmFtZSIsIlJvb21Ub3BpYyIsIlJvb21NZW1iZXIiLCJSb29tQXZhdGFyIiwiUm9vbVRoaXJkUGFydHlJbnZpdGUiLCJSb29tSGlzdG9yeVZpc2liaWxpdHkiLCJSb29tUG93ZXJMZXZlbHMiLCJSb29tUGlubmVkRXZlbnRzIiwiUm9vbVNlcnZlckFjbCIsIlJvb21Ub21ic3RvbmUiLCJSb29tSm9pblJ1bGVzIiwiUm9vbUd1ZXN0QWNjZXNzIiwiV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFIiwiZXZUeXBlIiwiQUxMX1JVTEVfVFlQRVMiLCJoYXNUZXh0IiwiaGFuZGxlciIsImlzU3RhdGUiLCJCb29sZWFuIiwidGV4dEZvckV2ZW50Il0sInNvdXJjZXMiOlsiLi4vc3JjL1RleHRGb3JFdmVudC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IHJlbW92ZURpcmVjdGlvbk92ZXJyaWRlQ2hhcnMgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy91dGlscyc7XG5pbXBvcnQgeyBHdWVzdEFjY2VzcywgSGlzdG9yeVZpc2liaWxpdHksIEpvaW5SdWxlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFsc1wiO1xuaW1wb3J0IHsgRXZlbnRUeXBlLCBNc2dUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHtcbiAgICBNX0VNT1RFLFxuICAgIE1fTk9USUNFLFxuICAgIE1fTUVTU0FHRSxcbiAgICBNZXNzYWdlRXZlbnQsXG4gICAgTV9QT0xMX1NUQVJULFxuICAgIE1fUE9MTF9FTkQsXG4gICAgUG9sbFN0YXJ0RXZlbnQsXG59IGZyb20gXCJtYXRyaXgtZXZlbnRzLXNka1wiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIFJvbGVzIGZyb20gJy4vUm9sZXMnO1xuaW1wb3J0IHsgaXNWYWxpZDNwaWRJbnZpdGUgfSBmcm9tIFwiLi9Sb29tSW52aXRlXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBBTExfUlVMRV9UWVBFUywgUk9PTV9SVUxFX1RZUEVTLCBTRVJWRVJfUlVMRV9UWVBFUywgVVNFUl9SVUxFX1RZUEVTIH0gZnJvbSBcIi4vbWpvbG5pci9CYW5MaXN0XCI7XG5pbXBvcnQgeyBXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEUgfSBmcm9tIFwiLi9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRMYXlvdXRTdG9yZVwiO1xuaW1wb3J0IHsgUmlnaHRQYW5lbFBoYXNlcyB9IGZyb20gJy4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVBoYXNlcyc7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBST09NX1NFQ1VSSVRZX1RBQiB9IGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9Sb29tU2V0dGluZ3NEaWFsb2dcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBSaWdodFBhbmVsU3RvcmUgZnJvbSAnLi9zdG9yZXMvcmlnaHQtcGFuZWwvUmlnaHRQYW5lbFN0b3JlJztcbmltcG9ydCBVc2VySWRlbnRpZmllckN1c3RvbWlzYXRpb25zIGZyb20gJy4vY3VzdG9taXNhdGlvbnMvVXNlcklkZW50aWZpZXInO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCB7IGlzTG9jYXRpb25FdmVudCB9IGZyb20gJy4vdXRpbHMvRXZlbnRVdGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZW5kZXJOYW1lKGV2ZW50OiBNYXRyaXhFdmVudCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGV2ZW50LnNlbmRlcj8ubmFtZSA/PyBldmVudC5nZXRTZW5kZXIoKSA/PyBfdChcIlNvbWVvbmVcIik7XG59XG5cbmZ1bmN0aW9uIGdldFJvb21NZW1iZXJEaXNwbGF5bmFtZShldmVudDogTWF0cml4RXZlbnQsIHVzZXJJZCA9IGV2ZW50LmdldFNlbmRlcigpKTogc3RyaW5nIHtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgY29uc3Qgcm9vbUlkID0gZXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgY29uc3QgbWVtYmVyID0gY2xpZW50LmdldFJvb20ocm9vbUlkKT8uZ2V0TWVtYmVyKHVzZXJJZCk7XG4gICAgcmV0dXJuIG1lbWJlcj8ucmF3RGlzcGxheU5hbWUgfHwgdXNlcklkIHx8IF90KFwiU29tZW9uZVwiKTtcbn1cblxuLy8gVGhlc2UgZnVuY3Rpb25zIGFyZSBmcmVxdWVudGx5IHVzZWQganVzdCB0byBjaGVjayB3aGV0aGVyIGFuIGV2ZW50IGhhc1xuLy8gYW55IHRleHQgdG8gZGlzcGxheSBhdCBhbGwuIEZvciB0aGlzIHJlYXNvbiB0aGV5IHJldHVybiBkZWZlcnJlZCB2YWx1ZXNcbi8vIHRvIGF2b2lkIHRoZSBleHBlbnNlIG9mIGxvb2tpbmcgdXAgdHJhbnNsYXRpb25zIHdoZW4gdGhleSdyZSBub3QgbmVlZGVkLlxuXG5mdW5jdGlvbiB0ZXh0Rm9yQ2FsbEludml0ZUV2ZW50KGV2ZW50OiBNYXRyaXhFdmVudCk6ICgpID0+IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHNlbmRlck5hbWUgPSBnZXRTZW5kZXJOYW1lKGV2ZW50KTtcbiAgICAvLyBGSVhNRTogRmluZCBhIGJldHRlciB3YXkgdG8gZGV0ZXJtaW5lIHRoaXMgZnJvbSB0aGUgZXZlbnQ/XG4gICAgY29uc3QgaXNWb2ljZSA9ICFldmVudC5nZXRDb250ZW50KCkub2ZmZXI/LnNkcD8uaW5jbHVkZXMoJ209dmlkZW8nKTtcbiAgICBjb25zdCBpc1N1cHBvcnRlZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdXBwb3J0c1ZvaXAoKTtcblxuICAgIC8vIFRoaXMgbGFkZGVyIGNvdWxkIGJlIHJlZHVjZWQgZG93biB0byBhIGNvdXBsZSBzdHJpbmcgdmFyaWFibGVzLCBob3dldmVyIG90aGVyIGxhbmd1YWdlc1xuICAgIC8vIGNhbiBoYXZlIGEgaGFyZCB0aW1lIHRyYW5zbGF0aW5nIHRob3NlIHN0cmluZ3MuIEluIGFuIGVmZm9ydCB0byBtYWtlIHRyYW5zbGF0aW9ucyBlYXNpZXJcbiAgICAvLyBhbmQgbW9yZSBhY2N1cmF0ZSwgd2UgYnJlYWsgb3V0IHRoZSBzdHJpbmctYmFzZWQgdmFyaWFibGVzIHRvIGEgY291cGxlIGJvb2xlYW5zLlxuICAgIGlmIChpc1ZvaWNlICYmIGlzU3VwcG9ydGVkKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIHBsYWNlZCBhIHZvaWNlIGNhbGwuXCIsIHsgc2VuZGVyTmFtZSB9KTtcbiAgICB9IGVsc2UgaWYgKGlzVm9pY2UgJiYgIWlzU3VwcG9ydGVkKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIHBsYWNlZCBhIHZvaWNlIGNhbGwuIChub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgYnJvd3NlcilcIiwgeyBzZW5kZXJOYW1lIH0pO1xuICAgIH0gZWxzZSBpZiAoIWlzVm9pY2UgJiYgaXNTdXBwb3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IF90KFwiJShzZW5kZXJOYW1lKXMgcGxhY2VkIGEgdmlkZW8gY2FsbC5cIiwgeyBzZW5kZXJOYW1lIH0pO1xuICAgIH0gZWxzZSBpZiAoIWlzVm9pY2UgJiYgIWlzU3VwcG9ydGVkKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIHBsYWNlZCBhIHZpZGVvIGNhbGwuIChub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgYnJvd3NlcilcIiwgeyBzZW5kZXJOYW1lIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdGV4dEZvck1lbWJlckV2ZW50KGV2OiBNYXRyaXhFdmVudCwgYWxsb3dKU1g6IGJvb2xlYW4sIHNob3dIaWRkZW5FdmVudHM/OiBib29sZWFuKTogKCkgPT4gc3RyaW5nIHwgbnVsbCB7XG4gICAgLy8gWFhYOiBTWUpTLTE2IFwic2VuZGVyIGlzIHNvbWV0aW1lcyBudWxsIGZvciBqb2luIG1lc3NhZ2VzXCJcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZXYuc2VuZGVyPy5uYW1lIHx8IGdldFJvb21NZW1iZXJEaXNwbGF5bmFtZShldik7XG4gICAgY29uc3QgdGFyZ2V0TmFtZSA9IGV2LnRhcmdldD8ubmFtZSB8fCBnZXRSb29tTWVtYmVyRGlzcGxheW5hbWUoZXYsIGV2LmdldFN0YXRlS2V5KCkpO1xuICAgIGNvbnN0IHByZXZDb250ZW50ID0gZXYuZ2V0UHJldkNvbnRlbnQoKTtcbiAgICBjb25zdCBjb250ZW50ID0gZXYuZ2V0Q29udGVudCgpO1xuICAgIGNvbnN0IHJlYXNvbiA9IGNvbnRlbnQucmVhc29uO1xuXG4gICAgc3dpdGNoIChjb250ZW50Lm1lbWJlcnNoaXApIHtcbiAgICAgICAgY2FzZSAnaW52aXRlJzoge1xuICAgICAgICAgICAgY29uc3QgdGhyZWVQaWRDb250ZW50ID0gY29udGVudC50aGlyZF9wYXJ0eV9pbnZpdGU7XG4gICAgICAgICAgICBpZiAodGhyZWVQaWRDb250ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRocmVlUGlkQ29udGVudC5kaXNwbGF5X25hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHRhcmdldE5hbWUpcyBhY2NlcHRlZCB0aGUgaW52aXRhdGlvbiBmb3IgJShkaXNwbGF5TmFtZSlzJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiB0aHJlZVBpZENvbnRlbnQuZGlzcGxheV9uYW1lLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUodGFyZ2V0TmFtZSlzIGFjY2VwdGVkIGFuIGludml0YXRpb24nLCB7IHRhcmdldE5hbWUgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyTmFtZSlzIGludml0ZWQgJSh0YXJnZXROYW1lKXMnLCB7IHNlbmRlck5hbWUsIHRhcmdldE5hbWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmFuJzpcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiByZWFzb25cbiAgICAgICAgICAgICAgICA/IF90KCclKHNlbmRlck5hbWUpcyBiYW5uZWQgJSh0YXJnZXROYW1lKXM6ICUocmVhc29uKXMnLCB7IHNlbmRlck5hbWUsIHRhcmdldE5hbWUsIHJlYXNvbiB9KVxuICAgICAgICAgICAgICAgIDogX3QoJyUoc2VuZGVyTmFtZSlzIGJhbm5lZCAlKHRhcmdldE5hbWUpcycsIHsgc2VuZGVyTmFtZSwgdGFyZ2V0TmFtZSB9KTtcbiAgICAgICAgY2FzZSAnam9pbic6XG4gICAgICAgICAgICBpZiAocHJldkNvbnRlbnQgJiYgcHJldkNvbnRlbnQubWVtYmVyc2hpcCA9PT0gJ2pvaW4nKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZDb250ZW50LmRpc3BsYXluYW1lICYmIGNvbnRlbnQuZGlzcGxheW5hbWUgJiYgcHJldkNvbnRlbnQuZGlzcGxheW5hbWUgIT09IGNvbnRlbnQuZGlzcGxheW5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKG9sZERpc3BsYXlOYW1lKXMgY2hhbmdlZCB0aGVpciBkaXNwbGF5IG5hbWUgdG8gJShkaXNwbGF5TmFtZSlzJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgdGFraW5nIHRoZSBkaXNwbGF5IG5hbWtlIGRpcmVjdGx5IGZyb20gdGhlIGV2ZW50IGNvbnRlbnQgaGVyZSBzbyB3ZSBuZWVkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0byBzdHJpcCBkaXJlY3Rpb24gb3ZlcnJpZGUgY2hhcnMgd2hpY2ggdGhlIGpzLXNkayB3b3VsZCBub3JtYWxseSBkbyB3aGVuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGluZyB0aGUgZGlzcGxheSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBvbGREaXNwbGF5TmFtZTogcmVtb3ZlRGlyZWN0aW9uT3ZlcnJpZGVDaGFycyhwcmV2Q29udGVudC5kaXNwbGF5bmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogcmVtb3ZlRGlyZWN0aW9uT3ZlcnJpZGVDaGFycyhjb250ZW50LmRpc3BsYXluYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghcHJldkNvbnRlbnQuZGlzcGxheW5hbWUgJiYgY29udGVudC5kaXNwbGF5bmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyTmFtZSlzIHNldCB0aGVpciBkaXNwbGF5IG5hbWUgdG8gJShkaXNwbGF5TmFtZSlzJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyTmFtZTogZXYuZ2V0U2VuZGVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogcmVtb3ZlRGlyZWN0aW9uT3ZlcnJpZGVDaGFycyhjb250ZW50LmRpc3BsYXluYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2Q29udGVudC5kaXNwbGF5bmFtZSAmJiAhY29udGVudC5kaXNwbGF5bmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyTmFtZSlzIHJlbW92ZWQgdGhlaXIgZGlzcGxheSBuYW1lICglKG9sZERpc3BsYXlOYW1lKXMpJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZERpc3BsYXlOYW1lOiByZW1vdmVEaXJlY3Rpb25PdmVycmlkZUNoYXJzKHByZXZDb250ZW50LmRpc3BsYXluYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2Q29udGVudC5hdmF0YXJfdXJsICYmICFjb250ZW50LmF2YXRhcl91cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyByZW1vdmVkIHRoZWlyIHByb2ZpbGUgcGljdHVyZScsIHsgc2VuZGVyTmFtZSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByZXZDb250ZW50LmF2YXRhcl91cmwgJiYgY29udGVudC5hdmF0YXJfdXJsICYmXG4gICAgICAgICAgICAgICAgICAgIHByZXZDb250ZW50LmF2YXRhcl91cmwgIT09IGNvbnRlbnQuYXZhdGFyX3VybCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyTmFtZSlzIGNoYW5nZWQgdGhlaXIgcHJvZmlsZSBwaWN0dXJlJywgeyBzZW5kZXJOYW1lIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXByZXZDb250ZW50LmF2YXRhcl91cmwgJiYgY29udGVudC5hdmF0YXJfdXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJOYW1lKXMgc2V0IGEgcHJvZmlsZSBwaWN0dXJlJywgeyBzZW5kZXJOYW1lIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2hvd0hpZGRlbkV2ZW50cyA/PyBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd0hpZGRlbkV2ZW50c0luVGltZWxpbmVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG51bGwgcmVqb2luLCBpdCB3aWxsIG9ubHkgYmUgdmlzaWJsZSBpZiB1c2luZyAnc2hvdyBoaWRkZW4gZXZlbnRzJyAobGFicylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KFwiJShzZW5kZXJOYW1lKXMgbWFkZSBubyBjaGFuZ2VcIiwgeyBzZW5kZXJOYW1lIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFldi50YXJnZXQpIGxvZ2dlci53YXJuKFwiSm9pbiBtZXNzYWdlIGhhcyBubyB0YXJnZXQhIC0tIFwiICsgZXYuZ2V0Q29udGVudCgpLnN0YXRlX2tleSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHRhcmdldE5hbWUpcyBqb2luZWQgdGhlIHJvb20nLCB7IHRhcmdldE5hbWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2xlYXZlJzpcbiAgICAgICAgICAgIGlmIChldi5nZXRTZW5kZXIoKSA9PT0gZXYuZ2V0U3RhdGVLZXkoKSkge1xuICAgICAgICAgICAgICAgIGlmIChwcmV2Q29udGVudC5tZW1iZXJzaGlwID09PSBcImludml0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdCgnJSh0YXJnZXROYW1lKXMgcmVqZWN0ZWQgdGhlIGludml0YXRpb24nLCB7IHRhcmdldE5hbWUgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHJlYXNvblxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfdCgnJSh0YXJnZXROYW1lKXMgbGVmdCB0aGUgcm9vbTogJShyZWFzb24pcycsIHsgdGFyZ2V0TmFtZSwgcmVhc29uIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IF90KCclKHRhcmdldE5hbWUpcyBsZWZ0IHRoZSByb29tJywgeyB0YXJnZXROYW1lIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJldkNvbnRlbnQubWVtYmVyc2hpcCA9PT0gXCJiYW5cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJOYW1lKXMgdW5iYW5uZWQgJSh0YXJnZXROYW1lKXMnLCB7IHNlbmRlck5hbWUsIHRhcmdldE5hbWUgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByZXZDb250ZW50Lm1lbWJlcnNoaXAgPT09IFwiaW52aXRlXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gcmVhc29uXG4gICAgICAgICAgICAgICAgICAgID8gX3QoJyUoc2VuZGVyTmFtZSlzIHdpdGhkcmV3ICUodGFyZ2V0TmFtZSlzXFwncyBpbnZpdGF0aW9uOiAlKHJlYXNvbilzJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb24sXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoJyUoc2VuZGVyTmFtZSlzIHdpdGhkcmV3ICUodGFyZ2V0TmFtZSlzXFwncyBpbnZpdGF0aW9uJywgeyBzZW5kZXJOYW1lLCB0YXJnZXROYW1lIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2Q29udGVudC5tZW1iZXJzaGlwID09PSBcImpvaW5cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiByZWFzb25cbiAgICAgICAgICAgICAgICAgICAgPyBfdCgnJShzZW5kZXJOYW1lKXMgcmVtb3ZlZCAlKHRhcmdldE5hbWUpczogJShyZWFzb24pcycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uLFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KCclKHNlbmRlck5hbWUpcyByZW1vdmVkICUodGFyZ2V0TmFtZSlzJywgeyBzZW5kZXJOYW1lLCB0YXJnZXROYW1lIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JUb3BpY0V2ZW50KGV2OiBNYXRyaXhFdmVudCk6ICgpID0+IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHNlbmRlckRpc3BsYXlOYW1lID0gZXYuc2VuZGVyICYmIGV2LnNlbmRlci5uYW1lID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcbiAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBjaGFuZ2VkIHRoZSB0b3BpYyB0byBcIiUodG9waWMpc1wiLicsIHtcbiAgICAgICAgc2VuZGVyRGlzcGxheU5hbWUsXG4gICAgICAgIHRvcGljOiBldi5nZXRDb250ZW50KCkudG9waWMsXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JSb29tQXZhdGFyRXZlbnQoZXY6IE1hdHJpeEV2ZW50KTogKCkgPT4gc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3Qgc2VuZGVyRGlzcGxheU5hbWUgPSBldj8uc2VuZGVyPy5uYW1lIHx8IGV2LmdldFNlbmRlcigpO1xuICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIGNoYW5nZWQgdGhlIHJvb20gYXZhdGFyLicsIHsgc2VuZGVyRGlzcGxheU5hbWUgfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JSb29tTmFtZUV2ZW50KGV2OiBNYXRyaXhFdmVudCk6ICgpID0+IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHNlbmRlckRpc3BsYXlOYW1lID0gZXYuc2VuZGVyICYmIGV2LnNlbmRlci5uYW1lID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcblxuICAgIGlmICghZXYuZ2V0Q29udGVudCgpLm5hbWUgfHwgZXYuZ2V0Q29udGVudCgpLm5hbWUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyByZW1vdmVkIHRoZSByb29tIG5hbWUuJywgeyBzZW5kZXJEaXNwbGF5TmFtZSB9KTtcbiAgICB9XG4gICAgaWYgKGV2LmdldFByZXZDb250ZW50KCkubmFtZSkge1xuICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBjaGFuZ2VkIHRoZSByb29tIG5hbWUgZnJvbSAlKG9sZFJvb21OYW1lKXMgdG8gJShuZXdSb29tTmFtZSlzLicsIHtcbiAgICAgICAgICAgIHNlbmRlckRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgb2xkUm9vbU5hbWU6IGV2LmdldFByZXZDb250ZW50KCkubmFtZSxcbiAgICAgICAgICAgIG5ld1Jvb21OYW1lOiBldi5nZXRDb250ZW50KCkubmFtZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIGNoYW5nZWQgdGhlIHJvb20gbmFtZSB0byAlKHJvb21OYW1lKXMuJywge1xuICAgICAgICBzZW5kZXJEaXNwbGF5TmFtZSxcbiAgICAgICAgcm9vbU5hbWU6IGV2LmdldENvbnRlbnQoKS5uYW1lLFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yVG9tYnN0b25lRXZlbnQoZXY6IE1hdHJpeEV2ZW50KTogKCkgPT4gc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3Qgc2VuZGVyRGlzcGxheU5hbWUgPSBldi5zZW5kZXIgJiYgZXYuc2VuZGVyLm5hbWUgPyBldi5zZW5kZXIubmFtZSA6IGV2LmdldFNlbmRlcigpO1xuICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIHVwZ3JhZGVkIHRoaXMgcm9vbS4nLCB7IHNlbmRlckRpc3BsYXlOYW1lIH0pO1xufVxuXG5jb25zdCBvblZpZXdKb2luUnVsZVNldHRpbmdzQ2xpY2sgPSAoKSA9PiB7XG4gICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IFwib3Blbl9yb29tX3NldHRpbmdzXCIsXG4gICAgICAgIGluaXRpYWxfdGFiX2lkOiBST09NX1NFQ1VSSVRZX1RBQixcbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIHRleHRGb3JKb2luUnVsZXNFdmVudChldjogTWF0cml4RXZlbnQsIGFsbG93SlNYOiBib29sZWFuKTogKCkgPT4gUmVuZGVyYWJsZSB7XG4gICAgY29uc3Qgc2VuZGVyRGlzcGxheU5hbWUgPSBldi5zZW5kZXIgJiYgZXYuc2VuZGVyLm5hbWUgPyBldi5zZW5kZXIubmFtZSA6IGV2LmdldFNlbmRlcigpO1xuICAgIHN3aXRjaCAoZXYuZ2V0Q29udGVudCgpLmpvaW5fcnVsZSkge1xuICAgICAgICBjYXNlIEpvaW5SdWxlLlB1YmxpYzpcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIG1hZGUgdGhlIHJvb20gcHVibGljIHRvIHdob2V2ZXIga25vd3MgdGhlIGxpbmsuJywge1xuICAgICAgICAgICAgICAgIHNlbmRlckRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgSm9pblJ1bGUuSW52aXRlOlxuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlckRpc3BsYXlOYW1lKXMgbWFkZSB0aGUgcm9vbSBpbnZpdGUgb25seS4nLCB7XG4gICAgICAgICAgICAgICAgc2VuZGVyRGlzcGxheU5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY2FzZSBKb2luUnVsZS5SZXN0cmljdGVkOlxuICAgICAgICAgICAgaWYgKGFsbG93SlNYKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCclKHNlbmRlckRpc3BsYXlOYW1lKXMgY2hhbmdlZCB3aG8gY2FuIGpvaW4gdGhpcyByb29tLiA8YT5WaWV3IHNldHRpbmdzPC9hPi4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXJEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhXCI6IChzdWIpID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXtvblZpZXdKb2luUnVsZVNldHRpbmdzQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBjaGFuZ2VkIHdobyBjYW4gam9pbiB0aGlzIHJvb20uJywgeyBzZW5kZXJEaXNwbGF5TmFtZSB9KTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIFRoZSBzcGVjIHN1cHBvcnRzIFwia25vY2tcIiBhbmQgXCJwcml2YXRlXCIsIGhvd2V2ZXIgbm90aGluZyBpbXBsZW1lbnRzIHRoZXNlLlxuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlckRpc3BsYXlOYW1lKXMgY2hhbmdlZCB0aGUgam9pbiBydWxlIHRvICUocnVsZSlzJywge1xuICAgICAgICAgICAgICAgIHNlbmRlckRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgIHJ1bGU6IGV2LmdldENvbnRlbnQoKS5qb2luX3J1bGUsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JHdWVzdEFjY2Vzc0V2ZW50KGV2OiBNYXRyaXhFdmVudCk6ICgpID0+IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHNlbmRlckRpc3BsYXlOYW1lID0gZXYuc2VuZGVyICYmIGV2LnNlbmRlci5uYW1lID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcbiAgICBzd2l0Y2ggKGV2LmdldENvbnRlbnQoKS5ndWVzdF9hY2Nlc3MpIHtcbiAgICAgICAgY2FzZSBHdWVzdEFjY2Vzcy5DYW5Kb2luOlxuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlckRpc3BsYXlOYW1lKXMgaGFzIGFsbG93ZWQgZ3Vlc3RzIHRvIGpvaW4gdGhlIHJvb20uJywgeyBzZW5kZXJEaXNwbGF5TmFtZSB9KTtcbiAgICAgICAgY2FzZSBHdWVzdEFjY2Vzcy5Gb3JiaWRkZW46XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBoYXMgcHJldmVudGVkIGd1ZXN0cyBmcm9tIGpvaW5pbmcgdGhlIHJvb20uJywgeyBzZW5kZXJEaXNwbGF5TmFtZSB9KTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIFRoZXJlJ3Mgbm8gb3RoZXIgb3B0aW9ucyB3ZSBjYW4gZXhwZWN0LCBob3dldmVyIGp1c3QgZm9yIHNhZmV0eSdzIHNha2Ugd2UnbGwgZG8gdGhpcy5cbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIGNoYW5nZWQgZ3Vlc3QgYWNjZXNzIHRvICUocnVsZSlzJywge1xuICAgICAgICAgICAgICAgIHNlbmRlckRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgIHJ1bGU6IGV2LmdldENvbnRlbnQoKS5ndWVzdF9hY2Nlc3MsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JTZXJ2ZXJBQ0xFdmVudChldjogTWF0cml4RXZlbnQpOiAoKSA9PiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBzZW5kZXJEaXNwbGF5TmFtZSA9IGV2LnNlbmRlciAmJiBldi5zZW5kZXIubmFtZSA/IGV2LnNlbmRlci5uYW1lIDogZXYuZ2V0U2VuZGVyKCk7XG4gICAgY29uc3QgcHJldkNvbnRlbnQgPSBldi5nZXRQcmV2Q29udGVudCgpO1xuICAgIGNvbnN0IGN1cnJlbnQgPSBldi5nZXRDb250ZW50KCk7XG4gICAgY29uc3QgcHJldiA9IHtcbiAgICAgICAgZGVueTogQXJyYXkuaXNBcnJheShwcmV2Q29udGVudC5kZW55KSA/IHByZXZDb250ZW50LmRlbnkgOiBbXSxcbiAgICAgICAgYWxsb3c6IEFycmF5LmlzQXJyYXkocHJldkNvbnRlbnQuYWxsb3cpID8gcHJldkNvbnRlbnQuYWxsb3cgOiBbXSxcbiAgICAgICAgYWxsb3dfaXBfbGl0ZXJhbHM6IHByZXZDb250ZW50LmFsbG93X2lwX2xpdGVyYWxzICE9PSBmYWxzZSxcbiAgICB9O1xuXG4gICAgbGV0IGdldFRleHQgPSBudWxsO1xuICAgIGlmIChwcmV2LmRlbnkubGVuZ3RoID09PSAwICYmIHByZXYuYWxsb3cubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGdldFRleHQgPSAoKSA9PiBfdChcIiUoc2VuZGVyRGlzcGxheU5hbWUpcyBzZXQgdGhlIHNlcnZlciBBQ0xzIGZvciB0aGlzIHJvb20uXCIsIHsgc2VuZGVyRGlzcGxheU5hbWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0VGV4dCA9ICgpID0+IF90KFwiJShzZW5kZXJEaXNwbGF5TmFtZSlzIGNoYW5nZWQgdGhlIHNlcnZlciBBQ0xzIGZvciB0aGlzIHJvb20uXCIsIHsgc2VuZGVyRGlzcGxheU5hbWUgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGN1cnJlbnQuYWxsb3cpKSB7XG4gICAgICAgIGN1cnJlbnQuYWxsb3cgPSBbXTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBrbm93IGZvciBzdXJlIGV2ZXJ5b25lIGlzIGJhbm5lZCwgbWFyayB0aGUgcm9vbSBhcyBvYmxpdGVyYXRlZFxuICAgIGlmIChjdXJyZW50LmFsbG93Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gKCkgPT4gZ2V0VGV4dCgpICsgXCIgXCIgK1xuICAgICAgICAgICAgX3QoXCLwn46JIEFsbCBzZXJ2ZXJzIGFyZSBiYW5uZWQgZnJvbSBwYXJ0aWNpcGF0aW5nISBUaGlzIHJvb20gY2FuIG5vIGxvbmdlciBiZSB1c2VkLlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0VGV4dDtcbn1cblxuZnVuY3Rpb24gdGV4dEZvck1lc3NhZ2VFdmVudChldjogTWF0cml4RXZlbnQpOiAoKSA9PiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoaXNMb2NhdGlvbkV2ZW50KGV2KSkge1xuICAgICAgICByZXR1cm4gdGV4dEZvckxvY2F0aW9uRXZlbnQoZXYpO1xuICAgIH1cblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlbmRlckRpc3BsYXlOYW1lID0gZXYuc2VuZGVyICYmIGV2LnNlbmRlci5uYW1lID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBldi5nZXRDb250ZW50KCkuYm9keTtcbiAgICAgICAgaWYgKGV2LmlzUmVkYWN0ZWQoKSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IHRleHRGb3JSZWRhY3RlZFBvbGxBbmRNZXNzYWdlRXZlbnQoZXYpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuaXNFbmFibGVkKFwiZmVhdHVyZV9leHRlbnNpYmxlX2V2ZW50c1wiKSkge1xuICAgICAgICAgICAgY29uc3QgZXh0ZXYgPSBldi51bnN0YWJsZUV4dGVuc2libGVFdmVudCBhcyBNZXNzYWdlRXZlbnQ7XG4gICAgICAgICAgICBpZiAoZXh0ZXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZXYuaXNFcXVpdmFsZW50VG8oTV9FTU9URSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAqICR7c2VuZGVyRGlzcGxheU5hbWV9ICR7ZXh0ZXYudGV4dH1gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXh0ZXYuaXNFcXVpdmFsZW50VG8oTV9OT1RJQ0UpIHx8IGV4dGV2LmlzRXF1aXZhbGVudFRvKE1fTUVTU0FHRSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3NlbmRlckRpc3BsYXlOYW1lfTogJHtleHRldi50ZXh0fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2LmdldENvbnRlbnQoKS5tc2d0eXBlID09PSBNc2dUeXBlLkVtb3RlKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gXCIqIFwiICsgc2VuZGVyRGlzcGxheU5hbWUgKyBcIiBcIiArIG1lc3NhZ2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUgPT09IE1zZ1R5cGUuSW1hZ2UpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIHNlbnQgYW4gaW1hZ2UuJywgeyBzZW5kZXJEaXNwbGF5TmFtZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChldi5nZXRUeXBlKCkgPT0gRXZlbnRUeXBlLlN0aWNrZXIpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIHNlbnQgYSBzdGlja2VyLicsIHsgc2VuZGVyRGlzcGxheU5hbWUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpbiB0aGlzIGNhc2UsIHBhcnNlIGl0IGFzIGEgcGxhaW4gdGV4dCBtZXNzYWdlXG4gICAgICAgICAgICBtZXNzYWdlID0gc2VuZGVyRGlzcGxheU5hbWUgKyAnOiAnICsgbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yQ2Fub25pY2FsQWxpYXNFdmVudChldjogTWF0cml4RXZlbnQpOiAoKSA9PiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZ2V0U2VuZGVyTmFtZShldik7XG4gICAgY29uc3Qgb2xkQWxpYXMgPSBldi5nZXRQcmV2Q29udGVudCgpLmFsaWFzO1xuICAgIGNvbnN0IG9sZEFsdEFsaWFzZXMgPSBldi5nZXRQcmV2Q29udGVudCgpLmFsdF9hbGlhc2VzIHx8IFtdO1xuICAgIGNvbnN0IG5ld0FsaWFzID0gZXYuZ2V0Q29udGVudCgpLmFsaWFzO1xuICAgIGNvbnN0IG5ld0FsdEFsaWFzZXMgPSBldi5nZXRDb250ZW50KCkuYWx0X2FsaWFzZXMgfHwgW107XG4gICAgY29uc3QgcmVtb3ZlZEFsdEFsaWFzZXMgPSBvbGRBbHRBbGlhc2VzLmZpbHRlcihhbGlhcyA9PiAhbmV3QWx0QWxpYXNlcy5pbmNsdWRlcyhhbGlhcykpO1xuICAgIGNvbnN0IGFkZGVkQWx0QWxpYXNlcyA9IG5ld0FsdEFsaWFzZXMuZmlsdGVyKGFsaWFzID0+ICFvbGRBbHRBbGlhc2VzLmluY2x1ZGVzKGFsaWFzKSk7XG5cbiAgICBpZiAoIXJlbW92ZWRBbHRBbGlhc2VzLmxlbmd0aCAmJiAhYWRkZWRBbHRBbGlhc2VzLmxlbmd0aCkge1xuICAgICAgICBpZiAobmV3QWxpYXMpIHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJOYW1lKXMgc2V0IHRoZSBtYWluIGFkZHJlc3MgZm9yIHRoaXMgcm9vbSB0byAlKGFkZHJlc3Mpcy4nLCB7XG4gICAgICAgICAgICAgICAgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBldi5nZXRDb250ZW50KCkuYWxpYXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChvbGRBbGlhcykge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyByZW1vdmVkIHRoZSBtYWluIGFkZHJlc3MgZm9yIHRoaXMgcm9vbS4nLCB7XG4gICAgICAgICAgICAgICAgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChuZXdBbGlhcyA9PT0gb2xkQWxpYXMpIHtcbiAgICAgICAgaWYgKGFkZGVkQWx0QWxpYXNlcy5sZW5ndGggJiYgIXJlbW92ZWRBbHRBbGlhc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyBhZGRlZCB0aGUgYWx0ZXJuYXRpdmUgYWRkcmVzc2VzICUoYWRkcmVzc2VzKXMgZm9yIHRoaXMgcm9vbS4nLCB7XG4gICAgICAgICAgICAgICAgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzZXM6IGFkZGVkQWx0QWxpYXNlcy5qb2luKFwiLCBcIiksXG4gICAgICAgICAgICAgICAgY291bnQ6IGFkZGVkQWx0QWxpYXNlcy5sZW5ndGgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVtb3ZlZEFsdEFsaWFzZXMubGVuZ3RoICYmICFhZGRlZEFsdEFsaWFzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyTmFtZSlzIHJlbW92ZWQgdGhlIGFsdGVybmF0aXZlIGFkZHJlc3NlcyAlKGFkZHJlc3NlcylzIGZvciB0aGlzIHJvb20uJywge1xuICAgICAgICAgICAgICAgIHNlbmRlck5hbWUsXG4gICAgICAgICAgICAgICAgYWRkcmVzc2VzOiByZW1vdmVkQWx0QWxpYXNlcy5qb2luKFwiLCBcIiksXG4gICAgICAgICAgICAgICAgY291bnQ6IHJlbW92ZWRBbHRBbGlhc2VzLmxlbmd0aCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZW1vdmVkQWx0QWxpYXNlcy5sZW5ndGggJiYgYWRkZWRBbHRBbGlhc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyBjaGFuZ2VkIHRoZSBhbHRlcm5hdGl2ZSBhZGRyZXNzZXMgZm9yIHRoaXMgcm9vbS4nLCB7XG4gICAgICAgICAgICAgICAgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYm90aCBhbGlhcyBhbmQgYWx0X2FsaWFzZXMgd2hlcmUgbW9kaWZpZWRcbiAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyBjaGFuZ2VkIHRoZSBtYWluIGFuZCBhbHRlcm5hdGl2ZSBhZGRyZXNzZXMgZm9yIHRoaXMgcm9vbS4nLCB7XG4gICAgICAgICAgICBzZW5kZXJOYW1lLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gaW4gY2FzZSB0aGVyZSBpcyBubyBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHR3byBldmVudHMsXG4gICAgLy8gc2F5IHNvbWV0aGluZyBhcyB3ZSBjYW4ndCBzaW1wbHkgaGlkZSB0aGUgdGlsZSBmcm9tIGhlcmVcbiAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyTmFtZSlzIGNoYW5nZWQgdGhlIGFkZHJlc3NlcyBmb3IgdGhpcyByb29tLicsIHtcbiAgICAgICAgc2VuZGVyTmFtZSxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdGV4dEZvclRocmVlUGlkSW52aXRlRXZlbnQoZXZlbnQ6IE1hdHJpeEV2ZW50KTogKCkgPT4gc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3Qgc2VuZGVyTmFtZSA9IGdldFNlbmRlck5hbWUoZXZlbnQpO1xuXG4gICAgaWYgKCFpc1ZhbGlkM3BpZEludml0ZShldmVudCkpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyByZXZva2VkIHRoZSBpbnZpdGF0aW9uIGZvciAlKHRhcmdldERpc3BsYXlOYW1lKXMgdG8gam9pbiB0aGUgcm9vbS4nLCB7XG4gICAgICAgICAgICBzZW5kZXJOYW1lLFxuICAgICAgICAgICAgdGFyZ2V0RGlzcGxheU5hbWU6IGV2ZW50LmdldFByZXZDb250ZW50KCkuZGlzcGxheV9uYW1lIHx8IF90KFwiU29tZW9uZVwiKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyBzZW50IGFuIGludml0YXRpb24gdG8gJSh0YXJnZXREaXNwbGF5TmFtZSlzIHRvIGpvaW4gdGhlIHJvb20uJywge1xuICAgICAgICBzZW5kZXJOYW1lLFxuICAgICAgICB0YXJnZXREaXNwbGF5TmFtZTogZXZlbnQuZ2V0Q29udGVudCgpLmRpc3BsYXlfbmFtZSxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdGV4dEZvckhpc3RvcnlWaXNpYmlsaXR5RXZlbnQoZXZlbnQ6IE1hdHJpeEV2ZW50KTogKCkgPT4gc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3Qgc2VuZGVyTmFtZSA9IGdldFNlbmRlck5hbWUoZXZlbnQpO1xuICAgIHN3aXRjaCAoZXZlbnQuZ2V0Q29udGVudCgpLmhpc3RvcnlfdmlzaWJpbGl0eSkge1xuICAgICAgICBjYXNlIEhpc3RvcnlWaXNpYmlsaXR5Lkludml0ZWQ6XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyTmFtZSlzIG1hZGUgZnV0dXJlIHJvb20gaGlzdG9yeSB2aXNpYmxlIHRvIGFsbCByb29tIG1lbWJlcnMsICdcbiAgICAgICAgICAgICAgICArICdmcm9tIHRoZSBwb2ludCB0aGV5IGFyZSBpbnZpdGVkLicsIHsgc2VuZGVyTmFtZSB9KTtcbiAgICAgICAgY2FzZSBIaXN0b3J5VmlzaWJpbGl0eS5Kb2luZWQ6XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoJyUoc2VuZGVyTmFtZSlzIG1hZGUgZnV0dXJlIHJvb20gaGlzdG9yeSB2aXNpYmxlIHRvIGFsbCByb29tIG1lbWJlcnMsICdcbiAgICAgICAgICAgICAgICArICdmcm9tIHRoZSBwb2ludCB0aGV5IGpvaW5lZC4nLCB7IHNlbmRlck5hbWUgfSk7XG4gICAgICAgIGNhc2UgSGlzdG9yeVZpc2liaWxpdHkuU2hhcmVkOlxuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyBtYWRlIGZ1dHVyZSByb29tIGhpc3RvcnkgdmlzaWJsZSB0byBhbGwgcm9vbSBtZW1iZXJzLicsIHsgc2VuZGVyTmFtZSB9KTtcbiAgICAgICAgY2FzZSBIaXN0b3J5VmlzaWJpbGl0eS5Xb3JsZFJlYWRhYmxlOlxuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyBtYWRlIGZ1dHVyZSByb29tIGhpc3RvcnkgdmlzaWJsZSB0byBhbnlvbmUuJywgeyBzZW5kZXJOYW1lIH0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHNlbmRlck5hbWUpcyBtYWRlIGZ1dHVyZSByb29tIGhpc3RvcnkgdmlzaWJsZSB0byB1bmtub3duICglKHZpc2liaWxpdHkpcykuJywge1xuICAgICAgICAgICAgICAgIHNlbmRlck5hbWUsXG4gICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogZXZlbnQuZ2V0Q29udGVudCgpLmhpc3RvcnlfdmlzaWJpbGl0eSxcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy8gQ3VycmVudGx5IHdpbGwgb25seSBkaXNwbGF5IGEgY2hhbmdlIGlmIGEgdXNlcidzIHBvd2VyIGxldmVsIGlzIGNoYW5nZWRcbmZ1bmN0aW9uIHRleHRGb3JQb3dlckV2ZW50KGV2ZW50OiBNYXRyaXhFdmVudCk6ICgpID0+IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHNlbmRlck5hbWUgPSBnZXRTZW5kZXJOYW1lKGV2ZW50KTtcbiAgICBpZiAoIWV2ZW50LmdldFByZXZDb250ZW50KCk/LnVzZXJzIHx8ICFldmVudC5nZXRDb250ZW50KCk/LnVzZXJzKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBwcmV2aW91c1VzZXJEZWZhdWx0OiBudW1iZXIgPSBldmVudC5nZXRQcmV2Q29udGVudCgpLnVzZXJzX2RlZmF1bHQgfHwgMDtcbiAgICBjb25zdCBjdXJyZW50VXNlckRlZmF1bHQ6IG51bWJlciA9IGV2ZW50LmdldENvbnRlbnQoKS51c2Vyc19kZWZhdWx0IHx8IDA7XG4gICAgLy8gQ29uc3RydWN0IHNldCBvZiB1c2VySWRzXG4gICAgY29uc3QgdXNlcnM6IHN0cmluZ1tdID0gW107XG4gICAgT2JqZWN0LmtleXMoZXZlbnQuZ2V0Q29udGVudCgpLnVzZXJzKS5mb3JFYWNoKCh1c2VySWQpID0+IHtcbiAgICAgICAgaWYgKHVzZXJzLmluZGV4T2YodXNlcklkKSA9PT0gLTEpIHVzZXJzLnB1c2godXNlcklkKTtcbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhldmVudC5nZXRQcmV2Q29udGVudCgpLnVzZXJzKS5mb3JFYWNoKCh1c2VySWQpID0+IHtcbiAgICAgICAgaWYgKHVzZXJzLmluZGV4T2YodXNlcklkKSA9PT0gLTEpIHVzZXJzLnB1c2godXNlcklkKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRpZmZzOiB7XG4gICAgICAgIHVzZXJJZDogc3RyaW5nO1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIGZyb206IG51bWJlcjtcbiAgICAgICAgdG86IG51bWJlcjtcbiAgICB9W10gPSBbXTtcbiAgICB1c2Vycy5mb3JFYWNoKCh1c2VySWQpID0+IHtcbiAgICAgICAgLy8gUHJldmlvdXMgcG93ZXIgbGV2ZWxcbiAgICAgICAgbGV0IGZyb206IG51bWJlciA9IGV2ZW50LmdldFByZXZDb250ZW50KCkudXNlcnNbdXNlcklkXTtcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGZyb20pKSB7XG4gICAgICAgICAgICBmcm9tID0gcHJldmlvdXNVc2VyRGVmYXVsdDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDdXJyZW50IHBvd2VyIGxldmVsXG4gICAgICAgIGxldCB0byA9IGV2ZW50LmdldENvbnRlbnQoKS51c2Vyc1t1c2VySWRdO1xuICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIodG8pKSB7XG4gICAgICAgICAgICB0byA9IGN1cnJlbnRVc2VyRGVmYXVsdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZnJvbSA9PT0gcHJldmlvdXNVc2VyRGVmYXVsdCAmJiB0byA9PT0gY3VycmVudFVzZXJEZWZhdWx0KSB7IHJldHVybjsgfVxuICAgICAgICBpZiAodG8gIT09IGZyb20pIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBVc2VySWRlbnRpZmllckN1c3RvbWlzYXRpb25zLmdldERpc3BsYXlVc2VySWRlbnRpZmllcih1c2VySWQsIHsgcm9vbUlkOiBldmVudC5nZXRSb29tSWQoKSB9KTtcbiAgICAgICAgICAgIGRpZmZzLnB1c2goeyB1c2VySWQsIG5hbWUsIGZyb20sIHRvIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFkaWZmcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gWFhYOiBUaGlzIGlzIGFsc28gc3VyZWx5IGJyb2tlbiBmb3IgaTE4blxuICAgIHJldHVybiAoKSA9PiBfdCgnJShzZW5kZXJOYW1lKXMgY2hhbmdlZCB0aGUgcG93ZXIgbGV2ZWwgb2YgJShwb3dlckxldmVsRGlmZlRleHQpcy4nLCB7XG4gICAgICAgIHNlbmRlck5hbWUsXG4gICAgICAgIHBvd2VyTGV2ZWxEaWZmVGV4dDogZGlmZnMubWFwKGRpZmYgPT5cbiAgICAgICAgICAgIF90KCclKHVzZXJJZClzIGZyb20gJShmcm9tUG93ZXJMZXZlbClzIHRvICUodG9Qb3dlckxldmVsKXMnLCB7XG4gICAgICAgICAgICAgICAgdXNlcklkOiBkaWZmLm5hbWUsXG4gICAgICAgICAgICAgICAgZnJvbVBvd2VyTGV2ZWw6IFJvbGVzLnRleHR1YWxQb3dlckxldmVsKGRpZmYuZnJvbSwgcHJldmlvdXNVc2VyRGVmYXVsdCksXG4gICAgICAgICAgICAgICAgdG9Qb3dlckxldmVsOiBSb2xlcy50ZXh0dWFsUG93ZXJMZXZlbChkaWZmLnRvLCBjdXJyZW50VXNlckRlZmF1bHQpLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICkuam9pbihcIiwgXCIpLFxuICAgIH0pO1xufVxuXG5jb25zdCBvblBpbm5lZE9yVW5waW5uZWRNZXNzYWdlQ2xpY2sgPSAobWVzc2FnZUlkOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICBldmVudF9pZDogbWVzc2FnZUlkLFxuICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICBtZXRyaWNzVHJpZ2dlcjogdW5kZWZpbmVkLCAvLyByb29tIGRvZXNuJ3QgY2hhbmdlXG4gICAgfSk7XG59O1xuXG5jb25zdCBvblBpbm5lZE1lc3NhZ2VzQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnNldENhcmQoeyBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5QaW5uZWRNZXNzYWdlcyB9LCBmYWxzZSk7XG59O1xuXG5mdW5jdGlvbiB0ZXh0Rm9yUGlubmVkRXZlbnQoZXZlbnQ6IE1hdHJpeEV2ZW50LCBhbGxvd0pTWDogYm9vbGVhbik6ICgpID0+IFJlbmRlcmFibGUge1xuICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfcGlubmluZ1wiKSkgcmV0dXJuIG51bGw7XG4gICAgY29uc3Qgc2VuZGVyTmFtZSA9IGdldFNlbmRlck5hbWUoZXZlbnQpO1xuICAgIGNvbnN0IHJvb21JZCA9IGV2ZW50LmdldFJvb21JZCgpO1xuXG4gICAgY29uc3QgcGlubmVkID0gZXZlbnQuZ2V0Q29udGVudCgpLnBpbm5lZCA/PyBbXTtcbiAgICBjb25zdCBwcmV2aW91c2x5UGlubmVkID0gZXZlbnQuZ2V0UHJldkNvbnRlbnQoKS5waW5uZWQgPz8gW107XG4gICAgY29uc3QgbmV3bHlQaW5uZWQgPSBwaW5uZWQuZmlsdGVyKGl0ZW0gPT4gcHJldmlvdXNseVBpbm5lZC5pbmRleE9mKGl0ZW0pIDwgMCk7XG4gICAgY29uc3QgbmV3bHlVbnBpbm5lZCA9IHByZXZpb3VzbHlQaW5uZWQuZmlsdGVyKGl0ZW0gPT4gcGlubmVkLmluZGV4T2YoaXRlbSkgPCAwKTtcblxuICAgIGlmIChuZXdseVBpbm5lZC5sZW5ndGggPT09IDEgJiYgbmV3bHlVbnBpbm5lZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gQSBzaW5nbGUgbWVzc2FnZSB3YXMgcGlubmVkLCBpbmNsdWRlIGEgbGluayB0byB0aGF0IG1lc3NhZ2UuXG4gICAgICAgIGlmIChhbGxvd0pTWCkge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZUlkID0gbmV3bHlQaW5uZWQucG9wKCk7XG5cbiAgICAgICAgICAgIHJldHVybiAoKSA9PiAoXG4gICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiUoc2VuZGVyTmFtZSlzIHBpbm5lZCA8YT5hIG1lc3NhZ2U8L2E+IHRvIHRoaXMgcm9vbS4gU2VlIGFsbCA8Yj5waW5uZWQgbWVzc2FnZXM8L2I+LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzZW5kZXJOYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhXCI6IChzdWIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXsoZSkgPT4gb25QaW5uZWRPclVucGlubmVkTWVzc2FnZUNsaWNrKG1lc3NhZ2VJZCwgcm9vbUlkKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiXCI6IChzdWIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXtvblBpbm5lZE1lc3NhZ2VzQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIHBpbm5lZCBhIG1lc3NhZ2UgdG8gdGhpcyByb29tLiBTZWUgYWxsIHBpbm5lZCBtZXNzYWdlcy5cIiwgeyBzZW5kZXJOYW1lIH0pO1xuICAgIH1cblxuICAgIGlmIChuZXdseVVucGlubmVkLmxlbmd0aCA9PT0gMSAmJiBuZXdseVBpbm5lZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gQSBzaW5nbGUgbWVzc2FnZSB3YXMgdW5waW5uZWQsIGluY2x1ZGUgYSBsaW5rIHRvIHRoYXQgbWVzc2FnZS5cbiAgICAgICAgaWYgKGFsbG93SlNYKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlSWQgPSBuZXdseVVucGlubmVkLnBvcCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gKFxuICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCIlKHNlbmRlck5hbWUpcyB1bnBpbm5lZCA8YT5hIG1lc3NhZ2U8L2E+IGZyb20gdGhpcyByb29tLiBTZWUgYWxsIDxiPnBpbm5lZCBtZXNzYWdlczwvYj4uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlbmRlck5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFcIjogKHN1YikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0nbGlua19pbmxpbmUnIG9uQ2xpY2s9eyhlKSA9PiBvblBpbm5lZE9yVW5waW5uZWRNZXNzYWdlQ2xpY2sobWVzc2FnZUlkLCByb29tSWQpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJcIjogKHN1YikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0nbGlua19pbmxpbmUnIG9uQ2xpY2s9e29uUGlubmVkTWVzc2FnZXNDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgpID0+IF90KFwiJShzZW5kZXJOYW1lKXMgdW5waW5uZWQgYSBtZXNzYWdlIGZyb20gdGhpcyByb29tLiBTZWUgYWxsIHBpbm5lZCBtZXNzYWdlcy5cIiwgeyBzZW5kZXJOYW1lIH0pO1xuICAgIH1cblxuICAgIGlmIChhbGxvd0pTWCkge1xuICAgICAgICByZXR1cm4gKCkgPT4gKFxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCIlKHNlbmRlck5hbWUpcyBjaGFuZ2VkIHRoZSA8YT5waW5uZWQgbWVzc2FnZXM8L2E+IGZvciB0aGUgcm9vbS5cIixcbiAgICAgICAgICAgICAgICAgICAgeyBzZW5kZXJOYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYVwiOiAoc3ViKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXtvblBpbm5lZE1lc3NhZ2VzQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyBjaGFuZ2VkIHRoZSBwaW5uZWQgbWVzc2FnZXMgZm9yIHRoZSByb29tLlwiLCB7IHNlbmRlck5hbWUgfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JXaWRnZXRFdmVudChldmVudDogTWF0cml4RXZlbnQpOiAoKSA9PiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZ2V0U2VuZGVyTmFtZShldmVudCk7XG4gICAgY29uc3QgeyBuYW1lOiBwcmV2TmFtZSwgdHlwZTogcHJldlR5cGUsIHVybDogcHJldlVybCB9ID0gZXZlbnQuZ2V0UHJldkNvbnRlbnQoKTtcbiAgICBjb25zdCB7IG5hbWUsIHR5cGUsIHVybCB9ID0gZXZlbnQuZ2V0Q29udGVudCgpIHx8IHt9O1xuXG4gICAgbGV0IHdpZGdldE5hbWUgPSBuYW1lIHx8IHByZXZOYW1lIHx8IHR5cGUgfHwgcHJldlR5cGUgfHwgJyc7XG4gICAgLy8gQXBwbHkgc2VudGVuY2UgY2FzZSB0byB3aWRnZXQgbmFtZVxuICAgIGlmICh3aWRnZXROYW1lICYmIHdpZGdldE5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgICB3aWRnZXROYW1lID0gd2lkZ2V0TmFtZVswXS50b1VwcGVyQ2FzZSgpICsgd2lkZ2V0TmFtZS5zbGljZSgxKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgd2lkZ2V0IHdhcyByZW1vdmVkLCBpdHMgY29udGVudCBzaG91bGQgYmUge30sIGJ1dCB0aGlzIGlzIHN1ZmZpY2llbnRseVxuICAgIC8vIGVxdWl2YWxlbnQgdG8gdGhhdCBjb25kaXRpb24uXG4gICAgaWYgKHVybCkge1xuICAgICAgICBpZiAocHJldlVybCkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHdpZGdldE5hbWUpcyB3aWRnZXQgbW9kaWZpZWQgYnkgJShzZW5kZXJOYW1lKXMnLCB7XG4gICAgICAgICAgICAgICAgd2lkZ2V0TmFtZSwgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHdpZGdldE5hbWUpcyB3aWRnZXQgYWRkZWQgYnkgJShzZW5kZXJOYW1lKXMnLCB7XG4gICAgICAgICAgICAgICAgd2lkZ2V0TmFtZSwgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICgpID0+IF90KCclKHdpZGdldE5hbWUpcyB3aWRnZXQgcmVtb3ZlZCBieSAlKHNlbmRlck5hbWUpcycsIHtcbiAgICAgICAgICAgIHdpZGdldE5hbWUsIHNlbmRlck5hbWUsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdGV4dEZvcldpZGdldExheW91dEV2ZW50KGV2ZW50OiBNYXRyaXhFdmVudCk6ICgpID0+IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHNlbmRlck5hbWUgPSBnZXRTZW5kZXJOYW1lKGV2ZW50KTtcbiAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyBoYXMgdXBkYXRlZCB0aGUgcm9vbSBsYXlvdXRcIiwgeyBzZW5kZXJOYW1lIH0pO1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yTWpvbG5pckV2ZW50KGV2ZW50OiBNYXRyaXhFdmVudCk6ICgpID0+IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IHNlbmRlck5hbWUgPSBnZXRTZW5kZXJOYW1lKGV2ZW50KTtcbiAgICBjb25zdCB7IGVudGl0eTogcHJldkVudGl0eSB9ID0gZXZlbnQuZ2V0UHJldkNvbnRlbnQoKTtcbiAgICBjb25zdCB7IGVudGl0eSwgcmVjb21tZW5kYXRpb24sIHJlYXNvbiB9ID0gZXZlbnQuZ2V0Q29udGVudCgpO1xuXG4gICAgLy8gUnVsZSByZW1vdmVkXG4gICAgaWYgKCFlbnRpdHkpIHtcbiAgICAgICAgaWYgKFVTRVJfUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyByZW1vdmVkIHRoZSBydWxlIGJhbm5pbmcgdXNlcnMgbWF0Y2hpbmcgJShnbG9iKXNcIixcbiAgICAgICAgICAgICAgICB7IHNlbmRlck5hbWUsIGdsb2I6IHByZXZFbnRpdHkgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoUk9PTV9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIHJlbW92ZWQgdGhlIHJ1bGUgYmFubmluZyByb29tcyBtYXRjaGluZyAlKGdsb2Ipc1wiLFxuICAgICAgICAgICAgICAgIHsgc2VuZGVyTmFtZSwgZ2xvYjogcHJldkVudGl0eSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChTRVJWRVJfUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyByZW1vdmVkIHRoZSBydWxlIGJhbm5pbmcgc2VydmVycyBtYXRjaGluZyAlKGdsb2Ipc1wiLFxuICAgICAgICAgICAgICAgIHsgc2VuZGVyTmFtZSwgZ2xvYjogcHJldkVudGl0eSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVua25vd24gdHlwZS4gV2UnbGwgc2F5IHNvbWV0aGluZywgYnV0IHdlIHNob3VsZG4ndCBlbmQgdXAgaGVyZS5cbiAgICAgICAgcmV0dXJuICgpID0+IF90KFwiJShzZW5kZXJOYW1lKXMgcmVtb3ZlZCBhIGJhbiBydWxlIG1hdGNoaW5nICUoZ2xvYilzXCIsIHsgc2VuZGVyTmFtZSwgZ2xvYjogcHJldkVudGl0eSB9KTtcbiAgICB9XG5cbiAgICAvLyBJbnZhbGlkIHJ1bGVcbiAgICBpZiAoIXJlY29tbWVuZGF0aW9uIHx8ICFyZWFzb24pIHJldHVybiAoKSA9PiBfdChgJShzZW5kZXJOYW1lKXMgdXBkYXRlZCBhbiBpbnZhbGlkIGJhbiBydWxlYCwgeyBzZW5kZXJOYW1lIH0pO1xuXG4gICAgLy8gUnVsZSB1cGRhdGVkXG4gICAgaWYgKGVudGl0eSA9PT0gcHJldkVudGl0eSkge1xuICAgICAgICBpZiAoVVNFUl9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIHVwZGF0ZWQgdGhlIHJ1bGUgYmFubmluZyB1c2VycyBtYXRjaGluZyAlKGdsb2IpcyBmb3IgJShyZWFzb24pc1wiLFxuICAgICAgICAgICAgICAgIHsgc2VuZGVyTmFtZSwgZ2xvYjogZW50aXR5LCByZWFzb24gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoUk9PTV9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIHVwZGF0ZWQgdGhlIHJ1bGUgYmFubmluZyByb29tcyBtYXRjaGluZyAlKGdsb2IpcyBmb3IgJShyZWFzb24pc1wiLFxuICAgICAgICAgICAgICAgIHsgc2VuZGVyTmFtZSwgZ2xvYjogZW50aXR5LCByZWFzb24gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoU0VSVkVSX1JVTEVfVFlQRVMuaW5jbHVkZXMoZXZlbnQuZ2V0VHlwZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IF90KFwiJShzZW5kZXJOYW1lKXMgdXBkYXRlZCB0aGUgcnVsZSBiYW5uaW5nIHNlcnZlcnMgbWF0Y2hpbmcgJShnbG9iKXMgZm9yICUocmVhc29uKXNcIixcbiAgICAgICAgICAgICAgICB7IHNlbmRlck5hbWUsIGdsb2I6IGVudGl0eSwgcmVhc29uIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVW5rbm93biB0eXBlLiBXZSdsbCBzYXkgc29tZXRoaW5nIGJ1dCB3ZSBzaG91bGRuJ3QgZW5kIHVwIGhlcmUuXG4gICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIHVwZGF0ZWQgYSBiYW4gcnVsZSBtYXRjaGluZyAlKGdsb2IpcyBmb3IgJShyZWFzb24pc1wiLFxuICAgICAgICAgICAgeyBzZW5kZXJOYW1lLCBnbG9iOiBlbnRpdHksIHJlYXNvbiB9KTtcbiAgICB9XG5cbiAgICAvLyBOZXcgcnVsZVxuICAgIGlmICghcHJldkVudGl0eSkge1xuICAgICAgICBpZiAoVVNFUl9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIGNyZWF0ZWQgYSBydWxlIGJhbm5pbmcgdXNlcnMgbWF0Y2hpbmcgJShnbG9iKXMgZm9yICUocmVhc29uKXNcIixcbiAgICAgICAgICAgICAgICB7IHNlbmRlck5hbWUsIGdsb2I6IGVudGl0eSwgcmVhc29uIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKFJPT01fUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyBjcmVhdGVkIGEgcnVsZSBiYW5uaW5nIHJvb21zIG1hdGNoaW5nICUoZ2xvYilzIGZvciAlKHJlYXNvbilzXCIsXG4gICAgICAgICAgICAgICAgeyBzZW5kZXJOYW1lLCBnbG9iOiBlbnRpdHksIHJlYXNvbiB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChTRVJWRVJfUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyBjcmVhdGVkIGEgcnVsZSBiYW5uaW5nIHNlcnZlcnMgbWF0Y2hpbmcgJShnbG9iKXMgZm9yICUocmVhc29uKXNcIixcbiAgICAgICAgICAgICAgICB7IHNlbmRlck5hbWUsIGdsb2I6IGVudGl0eSwgcmVhc29uIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVW5rbm93biB0eXBlLiBXZSdsbCBzYXkgc29tZXRoaW5nIGJ1dCB3ZSBzaG91bGRuJ3QgZW5kIHVwIGhlcmUuXG4gICAgICAgIHJldHVybiAoKSA9PiBfdChcIiUoc2VuZGVyTmFtZSlzIGNyZWF0ZWQgYSBiYW4gcnVsZSBtYXRjaGluZyAlKGdsb2IpcyBmb3IgJShyZWFzb24pc1wiLFxuICAgICAgICAgICAgeyBzZW5kZXJOYW1lLCBnbG9iOiBlbnRpdHksIHJlYXNvbiB9KTtcbiAgICB9XG5cbiAgICAvLyBlbHNlIHRoZSBlbnRpdHkgIT09IHByZXZFbnRpdHkgLSBjb3VudCBhcyBhIHJlbW92YWwgJiBhZGRcbiAgICBpZiAoVVNFUl9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IF90KFxuICAgICAgICAgICAgXCIlKHNlbmRlck5hbWUpcyBjaGFuZ2VkIGEgcnVsZSB0aGF0IHdhcyBiYW5uaW5nIHVzZXJzIG1hdGNoaW5nICUob2xkR2xvYilzIHRvIG1hdGNoaW5nIFwiICtcbiAgICAgICAgICAgIFwiJShuZXdHbG9iKXMgZm9yICUocmVhc29uKXNcIixcbiAgICAgICAgICAgIHsgc2VuZGVyTmFtZSwgb2xkR2xvYjogcHJldkVudGl0eSwgbmV3R2xvYjogZW50aXR5LCByZWFzb24gfSxcbiAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKFJPT01fUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBfdChcbiAgICAgICAgICAgIFwiJShzZW5kZXJOYW1lKXMgY2hhbmdlZCBhIHJ1bGUgdGhhdCB3YXMgYmFubmluZyByb29tcyBtYXRjaGluZyAlKG9sZEdsb2IpcyB0byBtYXRjaGluZyBcIiArXG4gICAgICAgICAgICBcIiUobmV3R2xvYilzIGZvciAlKHJlYXNvbilzXCIsXG4gICAgICAgICAgICB7IHNlbmRlck5hbWUsIG9sZEdsb2I6IHByZXZFbnRpdHksIG5ld0dsb2I6IGVudGl0eSwgcmVhc29uIH0sXG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChTRVJWRVJfUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBfdChcbiAgICAgICAgICAgIFwiJShzZW5kZXJOYW1lKXMgY2hhbmdlZCBhIHJ1bGUgdGhhdCB3YXMgYmFubmluZyBzZXJ2ZXJzIG1hdGNoaW5nICUob2xkR2xvYilzIHRvIG1hdGNoaW5nIFwiICtcbiAgICAgICAgICAgIFwiJShuZXdHbG9iKXMgZm9yICUocmVhc29uKXNcIixcbiAgICAgICAgICAgIHsgc2VuZGVyTmFtZSwgb2xkR2xvYjogcHJldkVudGl0eSwgbmV3R2xvYjogZW50aXR5LCByZWFzb24gfSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBVbmtub3duIHR5cGUuIFdlJ2xsIHNheSBzb21ldGhpbmcgYnV0IHdlIHNob3VsZG4ndCBlbmQgdXAgaGVyZS5cbiAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyB1cGRhdGVkIGEgYmFuIHJ1bGUgdGhhdCB3YXMgbWF0Y2hpbmcgJShvbGRHbG9iKXMgdG8gbWF0Y2hpbmcgJShuZXdHbG9iKXMgXCIgK1xuICAgICAgICBcImZvciAlKHJlYXNvbilzXCIsIHsgc2VuZGVyTmFtZSwgb2xkR2xvYjogcHJldkVudGl0eSwgbmV3R2xvYjogZW50aXR5LCByZWFzb24gfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0Rm9yTG9jYXRpb25FdmVudChldmVudDogTWF0cml4RXZlbnQpOiAoKSA9PiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyBoYXMgc2hhcmVkIHRoZWlyIGxvY2F0aW9uXCIsIHtcbiAgICAgICAgc2VuZGVyTmFtZTogZ2V0U2VuZGVyTmFtZShldmVudCksXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JSZWRhY3RlZFBvbGxBbmRNZXNzYWdlRXZlbnQoZXY6IE1hdHJpeEV2ZW50KTogc3RyaW5nIHtcbiAgICBsZXQgbWVzc2FnZSA9IF90KFwiTWVzc2FnZSBkZWxldGVkXCIpO1xuICAgIGNvbnN0IHVuc2lnbmVkID0gZXYuZ2V0VW5zaWduZWQoKTtcbiAgICBjb25zdCByZWRhY3RlZEJlY2F1c2VVc2VySWQgPSB1bnNpZ25lZD8ucmVkYWN0ZWRfYmVjYXVzZT8uc2VuZGVyO1xuICAgIGlmIChyZWRhY3RlZEJlY2F1c2VVc2VySWQgJiYgcmVkYWN0ZWRCZWNhdXNlVXNlcklkICE9PSBldi5nZXRTZW5kZXIoKSkge1xuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oZXYuZ2V0Um9vbUlkKCkpO1xuICAgICAgICBjb25zdCBzZW5kZXIgPSByb29tPy5nZXRNZW1iZXIocmVkYWN0ZWRCZWNhdXNlVXNlcklkKTtcbiAgICAgICAgbWVzc2FnZSA9IF90KFwiTWVzc2FnZSBkZWxldGVkIGJ5ICUobmFtZSlzXCIsIHtcbiAgICAgICAgICAgIG5hbWU6IHNlbmRlcj8ubmFtZSB8fCByZWRhY3RlZEJlY2F1c2VVc2VySWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBtZXNzYWdlO1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yUG9sbFN0YXJ0RXZlbnQoZXZlbnQ6IE1hdHJpeEV2ZW50KTogKCkgPT4gc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcblxuICAgICAgICBpZiAoZXZlbnQuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gdGV4dEZvclJlZGFjdGVkUG9sbEFuZE1lc3NhZ2VFdmVudChldmVudCk7XG4gICAgICAgICAgICBjb25zdCBzZW5kZXJEaXNwbGF5TmFtZSA9IGV2ZW50LnNlbmRlcj8ubmFtZSA/PyBldmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBzZW5kZXJEaXNwbGF5TmFtZSArICc6ICcgKyBtZXNzYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KFwiJShzZW5kZXJOYW1lKXMgaGFzIHN0YXJ0ZWQgYSBwb2xsIC0gJShwb2xsUXVlc3Rpb24pc1wiLCB7XG4gICAgICAgICAgICAgICAgc2VuZGVyTmFtZTogZ2V0U2VuZGVyTmFtZShldmVudCksXG4gICAgICAgICAgICAgICAgcG9sbFF1ZXN0aW9uOiAoZXZlbnQudW5zdGFibGVFeHRlbnNpYmxlRXZlbnQgYXMgUG9sbFN0YXJ0RXZlbnQpPy5xdWVzdGlvbj8udGV4dCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZvclBvbGxFbmRFdmVudChldmVudDogTWF0cml4RXZlbnQpOiAoKSA9PiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gKCkgPT4gX3QoXCIlKHNlbmRlck5hbWUpcyBoYXMgZW5kZWQgYSBwb2xsXCIsIHtcbiAgICAgICAgc2VuZGVyTmFtZTogZ2V0U2VuZGVyTmFtZShldmVudCksXG4gICAgfSk7XG59XG5cbnR5cGUgUmVuZGVyYWJsZSA9IHN0cmluZyB8IEpTWC5FbGVtZW50IHwgbnVsbDtcblxuaW50ZXJmYWNlIElIYW5kbGVycyB7XG4gICAgW3R5cGU6IHN0cmluZ106XG4gICAgICAgIChldjogTWF0cml4RXZlbnQsIGFsbG93SlNYOiBib29sZWFuLCBzaG93SGlkZGVuRXZlbnRzPzogYm9vbGVhbikgPT5cbiAgICAgICAgICAgICgoKSA9PiBSZW5kZXJhYmxlKTtcbn1cblxuY29uc3QgaGFuZGxlcnM6IElIYW5kbGVycyA9IHtcbiAgICBbRXZlbnRUeXBlLlJvb21NZXNzYWdlXTogdGV4dEZvck1lc3NhZ2VFdmVudCxcbiAgICBbRXZlbnRUeXBlLlN0aWNrZXJdOiB0ZXh0Rm9yTWVzc2FnZUV2ZW50LFxuICAgIFtFdmVudFR5cGUuQ2FsbEludml0ZV06IHRleHRGb3JDYWxsSW52aXRlRXZlbnQsXG4gICAgW01fUE9MTF9TVEFSVC5uYW1lXTogdGV4dEZvclBvbGxTdGFydEV2ZW50LFxuICAgIFtNX1BPTExfRU5ELm5hbWVdOiB0ZXh0Rm9yUG9sbEVuZEV2ZW50LFxuICAgIFtNX1BPTExfU1RBUlQuYWx0TmFtZV06IHRleHRGb3JQb2xsU3RhcnRFdmVudCxcbiAgICBbTV9QT0xMX0VORC5hbHROYW1lXTogdGV4dEZvclBvbGxFbmRFdmVudCxcbn07XG5cbmNvbnN0IHN0YXRlSGFuZGxlcnM6IElIYW5kbGVycyA9IHtcbiAgICBbRXZlbnRUeXBlLlJvb21DYW5vbmljYWxBbGlhc106IHRleHRGb3JDYW5vbmljYWxBbGlhc0V2ZW50LFxuICAgIFtFdmVudFR5cGUuUm9vbU5hbWVdOiB0ZXh0Rm9yUm9vbU5hbWVFdmVudCxcbiAgICBbRXZlbnRUeXBlLlJvb21Ub3BpY106IHRleHRGb3JUb3BpY0V2ZW50LFxuICAgIFtFdmVudFR5cGUuUm9vbU1lbWJlcl06IHRleHRGb3JNZW1iZXJFdmVudCxcbiAgICBbRXZlbnRUeXBlLlJvb21BdmF0YXJdOiB0ZXh0Rm9yUm9vbUF2YXRhckV2ZW50LFxuICAgIFtFdmVudFR5cGUuUm9vbVRoaXJkUGFydHlJbnZpdGVdOiB0ZXh0Rm9yVGhyZWVQaWRJbnZpdGVFdmVudCxcbiAgICBbRXZlbnRUeXBlLlJvb21IaXN0b3J5VmlzaWJpbGl0eV06IHRleHRGb3JIaXN0b3J5VmlzaWJpbGl0eUV2ZW50LFxuICAgIFtFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzXTogdGV4dEZvclBvd2VyRXZlbnQsXG4gICAgW0V2ZW50VHlwZS5Sb29tUGlubmVkRXZlbnRzXTogdGV4dEZvclBpbm5lZEV2ZW50LFxuICAgIFtFdmVudFR5cGUuUm9vbVNlcnZlckFjbF06IHRleHRGb3JTZXJ2ZXJBQ0xFdmVudCxcbiAgICBbRXZlbnRUeXBlLlJvb21Ub21ic3RvbmVdOiB0ZXh0Rm9yVG9tYnN0b25lRXZlbnQsXG4gICAgW0V2ZW50VHlwZS5Sb29tSm9pblJ1bGVzXTogdGV4dEZvckpvaW5SdWxlc0V2ZW50LFxuICAgIFtFdmVudFR5cGUuUm9vbUd1ZXN0QWNjZXNzXTogdGV4dEZvckd1ZXN0QWNjZXNzRXZlbnQsXG5cbiAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgJ2ltLnZlY3Rvci5tb2R1bGFyLndpZGdldHMnOiB0ZXh0Rm9yV2lkZ2V0RXZlbnQsXG4gICAgW1dJREdFVF9MQVlPVVRfRVZFTlRfVFlQRV06IHRleHRGb3JXaWRnZXRMYXlvdXRFdmVudCxcbn07XG5cbi8vIEFkZCBhbGwgdGhlIE1qb2xuaXIgc3R1ZmYgdG8gdGhlIHJlbmRlcmVyXG5mb3IgKGNvbnN0IGV2VHlwZSBvZiBBTExfUlVMRV9UWVBFUykge1xuICAgIHN0YXRlSGFuZGxlcnNbZXZUeXBlXSA9IHRleHRGb3JNam9sbmlyRXZlbnQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBnaXZlbiBldmVudCBoYXMgdGV4dCB0byBkaXNwbGF5LlxuICogQHBhcmFtIGV2IFRoZSBldmVudFxuICogQHBhcmFtIHNob3dIaWRkZW5FdmVudHMgQW4gb3B0aW9uYWwgY2FjaGVkIHNldHRpbmcgdmFsdWUgZm9yIHNob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lXG4gKiAgICAgdG8gYXZvaWQgaGl0dGluZyB0aGUgc2V0dGluZ3Mgc3RvcmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1RleHQoZXY6IE1hdHJpeEV2ZW50LCBzaG93SGlkZGVuRXZlbnRzPzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGhhbmRsZXIgPSAoZXYuaXNTdGF0ZSgpID8gc3RhdGVIYW5kbGVycyA6IGhhbmRsZXJzKVtldi5nZXRUeXBlKCldO1xuICAgIHJldHVybiBCb29sZWFuKGhhbmRsZXI/LihldiwgZmFsc2UsIHNob3dIaWRkZW5FdmVudHMpKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB0ZXh0dWFsIGNvbnRlbnQgb2YgdGhlIGdpdmVuIGV2ZW50LlxuICogQHBhcmFtIGV2IFRoZSBldmVudFxuICogQHBhcmFtIGFsbG93SlNYIFdoZXRoZXIgdG8gb3V0cHV0IHJpY2ggSlNYIGNvbnRlbnRcbiAqIEBwYXJhbSBzaG93SGlkZGVuRXZlbnRzIEFuIG9wdGlvbmFsIGNhY2hlZCBzZXR0aW5nIHZhbHVlIGZvciBzaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZVxuICogICAgIHRvIGF2b2lkIGhpdHRpbmcgdGhlIHNldHRpbmdzIHN0b3JlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0Rm9yRXZlbnQoZXY6IE1hdHJpeEV2ZW50KTogc3RyaW5nO1xuZXhwb3J0IGZ1bmN0aW9uIHRleHRGb3JFdmVudChldjogTWF0cml4RXZlbnQsIGFsbG93SlNYOiB0cnVlLCBzaG93SGlkZGVuRXZlbnRzPzogYm9vbGVhbik6IHN0cmluZyB8IEpTWC5FbGVtZW50O1xuZXhwb3J0IGZ1bmN0aW9uIHRleHRGb3JFdmVudChldjogTWF0cml4RXZlbnQsIGFsbG93SlNYID0gZmFsc2UsIHNob3dIaWRkZW5FdmVudHM/OiBib29sZWFuKTogc3RyaW5nIHwgSlNYLkVsZW1lbnQge1xuICAgIGNvbnN0IGhhbmRsZXIgPSAoZXYuaXNTdGF0ZSgpID8gc3RhdGVIYW5kbGVycyA6IGhhbmRsZXJzKVtldi5nZXRUeXBlKCldO1xuICAgIHJldHVybiBoYW5kbGVyPy4oZXYsIGFsbG93SlNYLCBzaG93SGlkZGVuRXZlbnRzKT8u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