"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _languageHandler = require("../../../languageHandler");

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _RoomInvite = require("../../../RoomInvite");

var _GenericEventListSummary = _interopRequireDefault(require("./GenericEventListSummary"));

var _RightPanelStorePhases = require("../../../stores/right-panel/RightPanelStorePhases");

var _ReactUtils = require("../../../utils/ReactUtils");

var _Layout = require("../../../settings/enums/Layout");

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

/*
Copyright 2016 OpenMarket Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
const onPinnedMessagesClick = () => {
  _RightPanelStore.default.instance.setCard({
    phase: _RightPanelStorePhases.RightPanelPhases.PinnedMessages
  }, false);
};

const TARGET_AS_DISPLAY_NAME_EVENTS = [_event.EventType.RoomMember];
var TransitionType;

(function (TransitionType) {
  TransitionType["Joined"] = "joined";
  TransitionType["Left"] = "left";
  TransitionType["JoinedAndLeft"] = "joined_and_left";
  TransitionType["LeftAndJoined"] = "left_and_joined";
  TransitionType["InviteReject"] = "invite_reject";
  TransitionType["InviteWithdrawal"] = "invite_withdrawal";
  TransitionType["Invited"] = "invited";
  TransitionType["Banned"] = "banned";
  TransitionType["Unbanned"] = "unbanned";
  TransitionType["Kicked"] = "kicked";
  TransitionType["ChangedName"] = "changed_name";
  TransitionType["ChangedAvatar"] = "changed_avatar";
  TransitionType["NoChange"] = "no_change";
  TransitionType["ServerAcl"] = "server_acl";
  TransitionType["ChangedPins"] = "pinned_messages";
  TransitionType["MessageRemoved"] = "message_removed";
  TransitionType["HiddenEvent"] = "hidden_event";
})(TransitionType || (TransitionType = {}));

const SEP = ",";

class EventListSummary extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "context", void 0);
  }

  shouldComponentUpdate(nextProps) {
    // Update if
    //  - The number of summarised events has changed
    //  - or if the summary is about to toggle to become collapsed
    //  - or if there are fewEvents, meaning the child eventTiles are shown as-is
    return nextProps.events.length !== this.props.events.length || nextProps.events.length < this.props.threshold || nextProps.layout !== this.props.layout;
  }
  /**
   * Generate the text for users aggregated by their transition sequences (`eventAggregates`) where
   * the sequences are ordered by `orderedTransitionSequences`.
   * @param {object} eventAggregates a map of transition sequence to array of user display names
   * or user IDs.
   * @param {string[]} orderedTransitionSequences an array which is some ordering of
   * `Object.keys(eventAggregates)`.
   * @returns {string} the textual summary of the aggregated events that occurred.
   */


  generateSummary(eventAggregates, orderedTransitionSequences) {
    const summaries = orderedTransitionSequences.map(transitions => {
      const userNames = eventAggregates[transitions];
      const nameList = this.renderNameList(userNames);
      const splitTransitions = transitions.split(SEP); // Some neighbouring transitions are common, so canonicalise some into "pair"
      // transitions

      const canonicalTransitions = EventListSummary.getCanonicalTransitions(splitTransitions); // Transform into consecutive repetitions of the same transition (like 5
      // consecutive 'joined_and_left's)

      const coalescedTransitions = EventListSummary.coalesceRepeatedTransitions(canonicalTransitions);
      const descs = coalescedTransitions.map(t => {
        return EventListSummary.getDescriptionForTransition(t.transitionType, userNames.length, t.repeats);
      });
      const desc = (0, _FormattingUtils.formatCommaSeparatedList)(descs);
      return (0, _languageHandler._t)('%(nameList)s %(transitionList)s', {
        nameList,
        transitionList: desc
      });
    });

    if (!summaries) {
      return null;
    }

    return (0, _ReactUtils.jsxJoin)(summaries, ", ");
  }
  /**
   * @param {string[]} users an array of user display names or user IDs.
   * @returns {string} a comma-separated list that ends with "and [n] others" if there are
   * more items in `users` than `this.props.summaryLength`, which is the number of names
   * included before "and [n] others".
   */


  renderNameList(users) {
    return (0, _FormattingUtils.formatCommaSeparatedList)(users, this.props.summaryLength);
  }
  /**
   * Canonicalise an array of transitions such that some pairs of transitions become
   * single transitions. For example an input ['joined','left'] would result in an output
   * ['joined_and_left'].
   * @param {string[]} transitions an array of transitions.
   * @returns {string[]} an array of transitions.
   */


  static getCanonicalTransitions(transitions) {
    const modMap = {
      [TransitionType.Joined]: {
        after: TransitionType.Left,
        newTransition: TransitionType.JoinedAndLeft
      },
      [TransitionType.Left]: {
        after: TransitionType.Joined,
        newTransition: TransitionType.LeftAndJoined
      } // $currentTransition : {
      //     'after' : $nextTransition,
      //     'newTransition' : 'new_transition_type',
      // },

    };
    const res = [];

    for (let i = 0; i < transitions.length; i++) {
      const t = transitions[i];
      const t2 = transitions[i + 1];
      let transition = t;

      if (i < transitions.length - 1 && modMap[t] && modMap[t].after === t2) {
        transition = modMap[t].newTransition;
        i++;
      }

      res.push(transition);
    }

    return res;
  }
  /**
   * Transform an array of transitions into an array of transitions and how many times
   * they are repeated consecutively.
   *
   * An array of 123 "joined_and_left" transitions, would result in:
   * ```
   * [{
   *   transitionType: "joined_and_left"
   *   repeats: 123
   * }]
   * ```
   * @param {string[]} transitions the array of transitions to transform.
   * @returns {object[]} an array of coalesced transitions.
   */


  static coalesceRepeatedTransitions(transitions) {
    const res = [];

    for (let i = 0; i < transitions.length; i++) {
      if (res.length > 0 && res[res.length - 1].transitionType === transitions[i]) {
        res[res.length - 1].repeats += 1;
      } else {
        res.push({
          transitionType: transitions[i],
          repeats: 1
        });
      }
    }

    return res;
  }
  /**
   * For a certain transition, t, describe what happened to the users that
   * underwent the transition.
   * @param {string} t the transition type.
   * @param {number} userCount number of usernames
   * @param {number} repeats the number of times the transition was repeated in a row.
   * @returns {string} the written Human Readable equivalent of the transition.
   */


  static getDescriptionForTransition(t, userCount, count) {
    // The empty interpolations 'severalUsers' and 'oneUser'
    // are there only to show translators to non-English languages
    // that the verb is conjugated to plural or singular Subject.
    let res = null;

    switch (t) {
      case TransitionType.Joined:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sjoined %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)sjoined %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.Left:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sleft %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)sleft %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.JoinedAndLeft:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sjoined and left %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)sjoined and left %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.LeftAndJoined:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sleft and rejoined %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)sleft and rejoined %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.InviteReject:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)srejected their invitations %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)srejected their invitation %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.InviteWithdrawal:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)shad their invitations withdrawn %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)shad their invitation withdrawn %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.Invited:
        res = userCount > 1 ? (0, _languageHandler._t)("were invited %(count)s times", {
          count
        }) : (0, _languageHandler._t)("was invited %(count)s times", {
          count
        });
        break;

      case TransitionType.Banned:
        res = userCount > 1 ? (0, _languageHandler._t)("were banned %(count)s times", {
          count
        }) : (0, _languageHandler._t)("was banned %(count)s times", {
          count
        });
        break;

      case TransitionType.Unbanned:
        res = userCount > 1 ? (0, _languageHandler._t)("were unbanned %(count)s times", {
          count
        }) : (0, _languageHandler._t)("was unbanned %(count)s times", {
          count
        });
        break;

      case TransitionType.Kicked:
        res = userCount > 1 ? (0, _languageHandler._t)("were removed %(count)s times", {
          count
        }) : (0, _languageHandler._t)("was removed %(count)s times", {
          count
        });
        break;

      case TransitionType.ChangedName:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)schanged their name %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)schanged their name %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.ChangedAvatar:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)schanged their avatar %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)schanged their avatar %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.NoChange:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)smade no changes %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)smade no changes %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.ServerAcl:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)schanged the server ACLs %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)schanged the server ACLs %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.ChangedPins:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)schanged the <a>pinned messages</a> for the room %(count)s times", {
          severalUsers: "",
          count
        }, {
          "a": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: onPinnedMessagesClick
          }, sub)
        }) : (0, _languageHandler._t)("%(oneUser)schanged the <a>pinned messages</a> for the room %(count)s times", {
          oneUser: "",
          count
        }, {
          "a": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: onPinnedMessagesClick
          }, sub)
        });
        break;

      case TransitionType.MessageRemoved:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)sremoved a message %(count)s times", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)sremoved a message %(count)s times", {
          oneUser: "",
          count
        });
        break;

      case TransitionType.HiddenEvent:
        res = userCount > 1 ? (0, _languageHandler._t)("%(severalUsers)ssent %(count)s hidden messages", {
          severalUsers: "",
          count
        }) : (0, _languageHandler._t)("%(oneUser)ssent %(count)s hidden messages", {
          oneUser: "",
          count
        });
        break;
    }

    return res;
  }

  static getTransitionSequence(events) {
    return events.map(EventListSummary.getTransition);
  }
  /**
   * Label a given membership event, `e`, where `getContent().membership` has
   * changed for each transition allowed by the Matrix protocol. This attempts to
   * label the membership changes that occur in `../../../TextForEvent.js`.
   * @param {MatrixEvent} e the membership change event to label.
   * @returns {string?} the transition type given to this event. This defaults to `null`
   * if a transition is not recognised.
   */


  static getTransition(e) {
    if (e.mxEvent.isRedacted()) {
      return TransitionType.MessageRemoved;
    }

    switch (e.mxEvent.getType()) {
      case _event.EventType.RoomThirdPartyInvite:
        // Handle 3pid invites the same as invites so they get bundled together
        if (!(0, _RoomInvite.isValid3pidInvite)(e.mxEvent)) {
          return TransitionType.InviteWithdrawal;
        }

        return TransitionType.Invited;

      case _event.EventType.RoomServerAcl:
        return TransitionType.ServerAcl;

      case _event.EventType.RoomPinnedEvents:
        return TransitionType.ChangedPins;

      case _event.EventType.RoomMember:
        switch (e.mxEvent.getContent().membership) {
          case 'invite':
            return TransitionType.Invited;

          case 'ban':
            return TransitionType.Banned;

          case 'join':
            if (e.mxEvent.getPrevContent().membership === 'join') {
              if (e.mxEvent.getContent().displayname !== e.mxEvent.getPrevContent().displayname) {
                return TransitionType.ChangedName;
              } else if (e.mxEvent.getContent().avatar_url !== e.mxEvent.getPrevContent().avatar_url) {
                return TransitionType.ChangedAvatar;
              } // console.log("MELS ignoring duplicate membership join event");


              return TransitionType.NoChange;
            } else {
              return TransitionType.Joined;
            }

          case 'leave':
            if (e.mxEvent.getSender() === e.mxEvent.getStateKey()) {
              if (e.mxEvent.getPrevContent().membership === "invite") {
                return TransitionType.InviteReject;
              }

              return TransitionType.Left;
            }

            switch (e.mxEvent.getPrevContent().membership) {
              case 'invite':
                return TransitionType.InviteWithdrawal;

              case 'ban':
                return TransitionType.Unbanned;
              // sender is not target and made the target leave, if not from invite/ban then this is a kick

              default:
                return TransitionType.Kicked;
            }

          default:
            return null;
        }

      default:
        // otherwise, assume this is a hidden event
        return TransitionType.HiddenEvent;
    }
  }

  getAggregate(userEvents) {
    // A map of aggregate type to arrays of display names. Each aggregate type
    // is a comma-delimited string of transitions, e.g. "joined,left,kicked".
    // The array of display names is the array of users who went through that
    // sequence during eventsToRender.
    const aggregate = {// $aggregateType : []:string
    }; // A map of aggregate types to the indices that order them (the index of
    // the first event for a given transition sequence)

    const aggregateIndices = {// $aggregateType : int
    };
    const users = Object.keys(userEvents);
    users.forEach(userId => {
      const firstEvent = userEvents[userId][0];
      const displayName = firstEvent.displayName;
      const seq = EventListSummary.getTransitionSequence(userEvents[userId]).join(SEP);

      if (!aggregate[seq]) {
        aggregate[seq] = [];
        aggregateIndices[seq] = -1;
      }

      aggregate[seq].push(displayName);

      if (aggregateIndices[seq] === -1 || firstEvent.index < aggregateIndices[seq]) {
        aggregateIndices[seq] = firstEvent.index;
      }
    });
    return {
      names: aggregate,
      indices: aggregateIndices
    };
  }

  render() {
    const eventsToRender = this.props.events; // Map user IDs to latest Avatar Member. ES6 Maps are ordered by when the key was created,
    // so this works perfectly for us to match event order whilst storing the latest Avatar Member

    const latestUserAvatarMember = new Map(); // Object mapping user IDs to an array of IUserEvents

    const userEvents = {};
    eventsToRender.forEach((e, index) => {
      const type = e.getType();
      let userId = e.getSender();

      if (type === _event.EventType.RoomMember) {
        userId = e.getStateKey();
      } else if (e.isRedacted()) {
        userId = e.getUnsigned()?.redacted_because?.sender;
      } // Initialise a user's events


      if (!userEvents[userId]) {
        userEvents[userId] = [];
      }

      let displayName = userId;

      if (type === _event.EventType.RoomThirdPartyInvite) {
        displayName = e.getContent().display_name;

        if (e.sender) {
          latestUserAvatarMember.set(userId, e.sender);
        }
      } else if (e.isRedacted()) {
        const sender = this.context?.room.getMember(userId);

        if (sender) {
          displayName = sender.name;
          latestUserAvatarMember.set(userId, sender);
        }
      } else if (e.target && TARGET_AS_DISPLAY_NAME_EVENTS.includes(type)) {
        displayName = e.target.name;
        latestUserAvatarMember.set(userId, e.target);
      } else if (e.sender) {
        displayName = e.sender.name;
        latestUserAvatarMember.set(userId, e.sender);
      }

      userEvents[userId].push({
        mxEvent: e,
        displayName,
        index: index
      });
    });
    const aggregate = this.getAggregate(userEvents); // Sort types by order of lowest event index within sequence

    const orderedTransitionSequences = Object.keys(aggregate.names).sort((seq1, seq2) => aggregate.indices[seq1] - aggregate.indices[seq2]);
    return /*#__PURE__*/_react.default.createElement(_GenericEventListSummary.default, {
      "data-testid": this.props['data-testid'],
      events: this.props.events,
      threshold: this.props.threshold,
      onToggle: this.props.onToggle,
      startExpanded: this.props.startExpanded,
      children: this.props.children,
      summaryMembers: [...latestUserAvatarMember.values()],
      layout: this.props.layout,
      summaryText: this.generateSummary(aggregate.names, orderedTransitionSequences)
    });
  }

}

exports.default = EventListSummary;
(0, _defineProperty2.default)(EventListSummary, "contextType", _RoomContext.default);
(0, _defineProperty2.default)(EventListSummary, "defaultProps", {
  summaryLength: 1,
  threshold: 3,
  avatarsMaxLength: 5,
  layout: _Layout.Layout.Group
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvblBpbm5lZE1lc3NhZ2VzQ2xpY2siLCJSaWdodFBhbmVsU3RvcmUiLCJpbnN0YW5jZSIsInNldENhcmQiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJQaW5uZWRNZXNzYWdlcyIsIlRBUkdFVF9BU19ESVNQTEFZX05BTUVfRVZFTlRTIiwiRXZlbnRUeXBlIiwiUm9vbU1lbWJlciIsIlRyYW5zaXRpb25UeXBlIiwiU0VQIiwiRXZlbnRMaXN0U3VtbWFyeSIsIlJlYWN0IiwiQ29tcG9uZW50Iiwic2hvdWxkQ29tcG9uZW50VXBkYXRlIiwibmV4dFByb3BzIiwiZXZlbnRzIiwibGVuZ3RoIiwicHJvcHMiLCJ0aHJlc2hvbGQiLCJsYXlvdXQiLCJnZW5lcmF0ZVN1bW1hcnkiLCJldmVudEFnZ3JlZ2F0ZXMiLCJvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlcyIsInN1bW1hcmllcyIsIm1hcCIsInRyYW5zaXRpb25zIiwidXNlck5hbWVzIiwibmFtZUxpc3QiLCJyZW5kZXJOYW1lTGlzdCIsInNwbGl0VHJhbnNpdGlvbnMiLCJzcGxpdCIsImNhbm9uaWNhbFRyYW5zaXRpb25zIiwiZ2V0Q2Fub25pY2FsVHJhbnNpdGlvbnMiLCJjb2FsZXNjZWRUcmFuc2l0aW9ucyIsImNvYWxlc2NlUmVwZWF0ZWRUcmFuc2l0aW9ucyIsImRlc2NzIiwidCIsImdldERlc2NyaXB0aW9uRm9yVHJhbnNpdGlvbiIsInRyYW5zaXRpb25UeXBlIiwicmVwZWF0cyIsImRlc2MiLCJmb3JtYXRDb21tYVNlcGFyYXRlZExpc3QiLCJfdCIsInRyYW5zaXRpb25MaXN0IiwianN4Sm9pbiIsInVzZXJzIiwic3VtbWFyeUxlbmd0aCIsIm1vZE1hcCIsIkpvaW5lZCIsImFmdGVyIiwiTGVmdCIsIm5ld1RyYW5zaXRpb24iLCJKb2luZWRBbmRMZWZ0IiwiTGVmdEFuZEpvaW5lZCIsInJlcyIsImkiLCJ0MiIsInRyYW5zaXRpb24iLCJwdXNoIiwidXNlckNvdW50IiwiY291bnQiLCJzZXZlcmFsVXNlcnMiLCJvbmVVc2VyIiwiSW52aXRlUmVqZWN0IiwiSW52aXRlV2l0aGRyYXdhbCIsIkludml0ZWQiLCJCYW5uZWQiLCJVbmJhbm5lZCIsIktpY2tlZCIsIkNoYW5nZWROYW1lIiwiQ2hhbmdlZEF2YXRhciIsIk5vQ2hhbmdlIiwiU2VydmVyQWNsIiwiQ2hhbmdlZFBpbnMiLCJzdWIiLCJNZXNzYWdlUmVtb3ZlZCIsIkhpZGRlbkV2ZW50IiwiZ2V0VHJhbnNpdGlvblNlcXVlbmNlIiwiZ2V0VHJhbnNpdGlvbiIsImUiLCJteEV2ZW50IiwiaXNSZWRhY3RlZCIsImdldFR5cGUiLCJSb29tVGhpcmRQYXJ0eUludml0ZSIsImlzVmFsaWQzcGlkSW52aXRlIiwiUm9vbVNlcnZlckFjbCIsIlJvb21QaW5uZWRFdmVudHMiLCJnZXRDb250ZW50IiwibWVtYmVyc2hpcCIsImdldFByZXZDb250ZW50IiwiZGlzcGxheW5hbWUiLCJhdmF0YXJfdXJsIiwiZ2V0U2VuZGVyIiwiZ2V0U3RhdGVLZXkiLCJnZXRBZ2dyZWdhdGUiLCJ1c2VyRXZlbnRzIiwiYWdncmVnYXRlIiwiYWdncmVnYXRlSW5kaWNlcyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwidXNlcklkIiwiZmlyc3RFdmVudCIsImRpc3BsYXlOYW1lIiwic2VxIiwiam9pbiIsImluZGV4IiwibmFtZXMiLCJpbmRpY2VzIiwicmVuZGVyIiwiZXZlbnRzVG9SZW5kZXIiLCJsYXRlc3RVc2VyQXZhdGFyTWVtYmVyIiwiTWFwIiwidHlwZSIsImdldFVuc2lnbmVkIiwicmVkYWN0ZWRfYmVjYXVzZSIsInNlbmRlciIsImRpc3BsYXlfbmFtZSIsInNldCIsImNvbnRleHQiLCJyb29tIiwiZ2V0TWVtYmVyIiwibmFtZSIsInRhcmdldCIsImluY2x1ZGVzIiwic29ydCIsInNlcTEiLCJzZXEyIiwib25Ub2dnbGUiLCJzdGFydEV4cGFuZGVkIiwiY2hpbGRyZW4iLCJ2YWx1ZXMiLCJSb29tQ29udGV4dCIsImF2YXRhcnNNYXhMZW5ndGgiLCJMYXlvdXQiLCJHcm91cCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0V2ZW50TGlzdFN1bW1hcnkudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnRQcm9wcyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudCc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IGZvcm1hdENvbW1hU2VwYXJhdGVkTGlzdCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0Zvcm1hdHRpbmdVdGlscyc7XG5pbXBvcnQgeyBpc1ZhbGlkM3BpZEludml0ZSB9IGZyb20gXCIuLi8uLi8uLi9Sb29tSW52aXRlXCI7XG5pbXBvcnQgR2VuZXJpY0V2ZW50TGlzdFN1bW1hcnkgZnJvbSBcIi4vR2VuZXJpY0V2ZW50TGlzdFN1bW1hcnlcIjtcbmltcG9ydCB7IFJpZ2h0UGFuZWxQaGFzZXMgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvcmlnaHQtcGFuZWwvUmlnaHRQYW5lbFN0b3JlUGhhc2VzJztcbmltcG9ydCB7IGpzeEpvaW4gfSBmcm9tICcuLi8uLi8uLi91dGlscy9SZWFjdFV0aWxzJztcbmltcG9ydCB7IExheW91dCB9IGZyb20gJy4uLy4uLy4uL3NldHRpbmdzL2VudW1zL0xheW91dCc7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmUnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBSb29tQ29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcblxuY29uc3Qgb25QaW5uZWRNZXNzYWdlc0NsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5zZXRDYXJkKHsgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUGlubmVkTWVzc2FnZXMgfSwgZmFsc2UpO1xufTtcblxuY29uc3QgVEFSR0VUX0FTX0RJU1BMQVlfTkFNRV9FVkVOVFMgPSBbRXZlbnRUeXBlLlJvb21NZW1iZXJdO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgT21pdDxDb21wb25lbnRQcm9wczx0eXBlb2YgR2VuZXJpY0V2ZW50TGlzdFN1bW1hcnk+LCBcInN1bW1hcnlUZXh0XCIgfCBcInN1bW1hcnlNZW1iZXJzXCI+IHtcbiAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2YgbmFtZXMgdG8gc2hvdyBpbiBlaXRoZXIgZWFjaCBzdW1tYXJ5IGUuZy4gMiB3b3VsZCByZXN1bHQgXCJBLCBCIGFuZCAyMzQgb3RoZXJzIGxlZnRcIlxuICAgIHN1bW1hcnlMZW5ndGg/OiBudW1iZXI7XG4gICAgLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIGF2YXRhcnMgdG8gZGlzcGxheSBpbiB0aGUgc3VtbWFyeVxuICAgIGF2YXRhcnNNYXhMZW5ndGg/OiBudW1iZXI7XG4gICAgLy8gVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBsYXlvdXRcbiAgICBsYXlvdXQ6IExheW91dDtcbn1cblxuaW50ZXJmYWNlIElVc2VyRXZlbnRzIHtcbiAgICAvLyBUaGUgb3JpZ2luYWwgZXZlbnRcbiAgICBteEV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICAvLyBUaGUgZGlzcGxheSBuYW1lIG9mIHRoZSB1c2VyIChpZiBub3QsIHRoZW4gdXNlciBJRClcbiAgICBkaXNwbGF5TmFtZTogc3RyaW5nO1xuICAgIC8vIFRoZSBvcmlnaW5hbCBpbmRleCBvZiB0aGUgZXZlbnQgaW4gdGhpcy5wcm9wcy5ldmVudHNcbiAgICBpbmRleDogbnVtYmVyO1xufVxuXG5lbnVtIFRyYW5zaXRpb25UeXBlIHtcbiAgICBKb2luZWQgPSBcImpvaW5lZFwiLFxuICAgIExlZnQgPSBcImxlZnRcIixcbiAgICBKb2luZWRBbmRMZWZ0ID0gXCJqb2luZWRfYW5kX2xlZnRcIixcbiAgICBMZWZ0QW5kSm9pbmVkID0gXCJsZWZ0X2FuZF9qb2luZWRcIixcbiAgICBJbnZpdGVSZWplY3QgPSBcImludml0ZV9yZWplY3RcIixcbiAgICBJbnZpdGVXaXRoZHJhd2FsID0gXCJpbnZpdGVfd2l0aGRyYXdhbFwiLFxuICAgIEludml0ZWQgPSBcImludml0ZWRcIixcbiAgICBCYW5uZWQgPSBcImJhbm5lZFwiLFxuICAgIFVuYmFubmVkID0gXCJ1bmJhbm5lZFwiLFxuICAgIEtpY2tlZCA9IFwia2lja2VkXCIsXG4gICAgQ2hhbmdlZE5hbWUgPSBcImNoYW5nZWRfbmFtZVwiLFxuICAgIENoYW5nZWRBdmF0YXIgPSBcImNoYW5nZWRfYXZhdGFyXCIsXG4gICAgTm9DaGFuZ2UgPSBcIm5vX2NoYW5nZVwiLFxuICAgIFNlcnZlckFjbCA9IFwic2VydmVyX2FjbFwiLFxuICAgIENoYW5nZWRQaW5zID0gXCJwaW5uZWRfbWVzc2FnZXNcIixcbiAgICBNZXNzYWdlUmVtb3ZlZCA9IFwibWVzc2FnZV9yZW1vdmVkXCIsXG4gICAgSGlkZGVuRXZlbnQgPSBcImhpZGRlbl9ldmVudFwiLFxufVxuXG5jb25zdCBTRVAgPSBcIixcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRMaXN0U3VtbWFyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBSb29tQ29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD47XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBzdW1tYXJ5TGVuZ3RoOiAxLFxuICAgICAgICB0aHJlc2hvbGQ6IDMsXG4gICAgICAgIGF2YXRhcnNNYXhMZW5ndGg6IDUsXG4gICAgICAgIGxheW91dDogTGF5b3V0Lkdyb3VwLFxuICAgIH07XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBJUHJvcHMpOiBib29sZWFuIHtcbiAgICAgICAgLy8gVXBkYXRlIGlmXG4gICAgICAgIC8vICAtIFRoZSBudW1iZXIgb2Ygc3VtbWFyaXNlZCBldmVudHMgaGFzIGNoYW5nZWRcbiAgICAgICAgLy8gIC0gb3IgaWYgdGhlIHN1bW1hcnkgaXMgYWJvdXQgdG8gdG9nZ2xlIHRvIGJlY29tZSBjb2xsYXBzZWRcbiAgICAgICAgLy8gIC0gb3IgaWYgdGhlcmUgYXJlIGZld0V2ZW50cywgbWVhbmluZyB0aGUgY2hpbGQgZXZlbnRUaWxlcyBhcmUgc2hvd24gYXMtaXNcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIG5leHRQcm9wcy5ldmVudHMubGVuZ3RoICE9PSB0aGlzLnByb3BzLmV2ZW50cy5sZW5ndGggfHxcbiAgICAgICAgICAgIG5leHRQcm9wcy5ldmVudHMubGVuZ3RoIDwgdGhpcy5wcm9wcy50aHJlc2hvbGQgfHxcbiAgICAgICAgICAgIG5leHRQcm9wcy5sYXlvdXQgIT09IHRoaXMucHJvcHMubGF5b3V0XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgdGhlIHRleHQgZm9yIHVzZXJzIGFnZ3JlZ2F0ZWQgYnkgdGhlaXIgdHJhbnNpdGlvbiBzZXF1ZW5jZXMgKGBldmVudEFnZ3JlZ2F0ZXNgKSB3aGVyZVxuICAgICAqIHRoZSBzZXF1ZW5jZXMgYXJlIG9yZGVyZWQgYnkgYG9yZGVyZWRUcmFuc2l0aW9uU2VxdWVuY2VzYC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnRBZ2dyZWdhdGVzIGEgbWFwIG9mIHRyYW5zaXRpb24gc2VxdWVuY2UgdG8gYXJyYXkgb2YgdXNlciBkaXNwbGF5IG5hbWVzXG4gICAgICogb3IgdXNlciBJRHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gb3JkZXJlZFRyYW5zaXRpb25TZXF1ZW5jZXMgYW4gYXJyYXkgd2hpY2ggaXMgc29tZSBvcmRlcmluZyBvZlxuICAgICAqIGBPYmplY3Qua2V5cyhldmVudEFnZ3JlZ2F0ZXMpYC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgdGV4dHVhbCBzdW1tYXJ5IG9mIHRoZSBhZ2dyZWdhdGVkIGV2ZW50cyB0aGF0IG9jY3VycmVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVTdW1tYXJ5KFxuICAgICAgICBldmVudEFnZ3JlZ2F0ZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPixcbiAgICAgICAgb3JkZXJlZFRyYW5zaXRpb25TZXF1ZW5jZXM6IHN0cmluZ1tdLFxuICAgICk6IHN0cmluZyB8IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3Qgc3VtbWFyaWVzID0gb3JkZXJlZFRyYW5zaXRpb25TZXF1ZW5jZXMubWFwKCh0cmFuc2l0aW9ucykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXNlck5hbWVzID0gZXZlbnRBZ2dyZWdhdGVzW3RyYW5zaXRpb25zXTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVMaXN0ID0gdGhpcy5yZW5kZXJOYW1lTGlzdCh1c2VyTmFtZXMpO1xuXG4gICAgICAgICAgICBjb25zdCBzcGxpdFRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuc3BsaXQoU0VQKSBhcyBUcmFuc2l0aW9uVHlwZVtdO1xuXG4gICAgICAgICAgICAvLyBTb21lIG5laWdoYm91cmluZyB0cmFuc2l0aW9ucyBhcmUgY29tbW9uLCBzbyBjYW5vbmljYWxpc2Ugc29tZSBpbnRvIFwicGFpclwiXG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uc1xuICAgICAgICAgICAgY29uc3QgY2Fub25pY2FsVHJhbnNpdGlvbnMgPSBFdmVudExpc3RTdW1tYXJ5LmdldENhbm9uaWNhbFRyYW5zaXRpb25zKHNwbGl0VHJhbnNpdGlvbnMpO1xuICAgICAgICAgICAgLy8gVHJhbnNmb3JtIGludG8gY29uc2VjdXRpdmUgcmVwZXRpdGlvbnMgb2YgdGhlIHNhbWUgdHJhbnNpdGlvbiAobGlrZSA1XG4gICAgICAgICAgICAvLyBjb25zZWN1dGl2ZSAnam9pbmVkX2FuZF9sZWZ0J3MpXG4gICAgICAgICAgICBjb25zdCBjb2FsZXNjZWRUcmFuc2l0aW9ucyA9IEV2ZW50TGlzdFN1bW1hcnkuY29hbGVzY2VSZXBlYXRlZFRyYW5zaXRpb25zKGNhbm9uaWNhbFRyYW5zaXRpb25zKTtcblxuICAgICAgICAgICAgY29uc3QgZGVzY3MgPSBjb2FsZXNjZWRUcmFuc2l0aW9ucy5tYXAoKHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRXZlbnRMaXN0U3VtbWFyeS5nZXREZXNjcmlwdGlvbkZvclRyYW5zaXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHQudHJhbnNpdGlvblR5cGUsIHVzZXJOYW1lcy5sZW5ndGgsIHQucmVwZWF0cyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRlc2MgPSBmb3JtYXRDb21tYVNlcGFyYXRlZExpc3QoZGVzY3MpO1xuXG4gICAgICAgICAgICByZXR1cm4gX3QoJyUobmFtZUxpc3QpcyAlKHRyYW5zaXRpb25MaXN0KXMnLCB7IG5hbWVMaXN0LCB0cmFuc2l0aW9uTGlzdDogZGVzYyB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFzdW1tYXJpZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGpzeEpvaW4oc3VtbWFyaWVzLCBcIiwgXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHVzZXJzIGFuIGFycmF5IG9mIHVzZXIgZGlzcGxheSBuYW1lcyBvciB1c2VyIElEcy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IHRoYXQgZW5kcyB3aXRoIFwiYW5kIFtuXSBvdGhlcnNcIiBpZiB0aGVyZSBhcmVcbiAgICAgKiBtb3JlIGl0ZW1zIGluIGB1c2Vyc2AgdGhhbiBgdGhpcy5wcm9wcy5zdW1tYXJ5TGVuZ3RoYCwgd2hpY2ggaXMgdGhlIG51bWJlciBvZiBuYW1lc1xuICAgICAqIGluY2x1ZGVkIGJlZm9yZSBcImFuZCBbbl0gb3RoZXJzXCIuXG4gICAgICovXG4gICAgcHJpdmF0ZSByZW5kZXJOYW1lTGlzdCh1c2Vyczogc3RyaW5nW10pIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdENvbW1hU2VwYXJhdGVkTGlzdCh1c2VycywgdGhpcy5wcm9wcy5zdW1tYXJ5TGVuZ3RoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYW5vbmljYWxpc2UgYW4gYXJyYXkgb2YgdHJhbnNpdGlvbnMgc3VjaCB0aGF0IHNvbWUgcGFpcnMgb2YgdHJhbnNpdGlvbnMgYmVjb21lXG4gICAgICogc2luZ2xlIHRyYW5zaXRpb25zLiBGb3IgZXhhbXBsZSBhbiBpbnB1dCBbJ2pvaW5lZCcsJ2xlZnQnXSB3b3VsZCByZXN1bHQgaW4gYW4gb3V0cHV0XG4gICAgICogWydqb2luZWRfYW5kX2xlZnQnXS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB0cmFuc2l0aW9ucyBhbiBhcnJheSBvZiB0cmFuc2l0aW9ucy5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IGFuIGFycmF5IG9mIHRyYW5zaXRpb25zLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldENhbm9uaWNhbFRyYW5zaXRpb25zKHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uVHlwZVtdKTogVHJhbnNpdGlvblR5cGVbXSB7XG4gICAgICAgIGNvbnN0IG1vZE1hcCA9IHtcbiAgICAgICAgICAgIFtUcmFuc2l0aW9uVHlwZS5Kb2luZWRdOiB7XG4gICAgICAgICAgICAgICAgYWZ0ZXI6IFRyYW5zaXRpb25UeXBlLkxlZnQsXG4gICAgICAgICAgICAgICAgbmV3VHJhbnNpdGlvbjogVHJhbnNpdGlvblR5cGUuSm9pbmVkQW5kTGVmdCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbVHJhbnNpdGlvblR5cGUuTGVmdF06IHtcbiAgICAgICAgICAgICAgICBhZnRlcjogVHJhbnNpdGlvblR5cGUuSm9pbmVkLFxuICAgICAgICAgICAgICAgIG5ld1RyYW5zaXRpb246IFRyYW5zaXRpb25UeXBlLkxlZnRBbmRKb2luZWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gJGN1cnJlbnRUcmFuc2l0aW9uIDoge1xuICAgICAgICAgICAgLy8gICAgICdhZnRlcicgOiAkbmV4dFRyYW5zaXRpb24sXG4gICAgICAgICAgICAvLyAgICAgJ25ld1RyYW5zaXRpb24nIDogJ25ld190cmFuc2l0aW9uX3R5cGUnLFxuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzOiBUcmFuc2l0aW9uVHlwZVtdID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgdCA9IHRyYW5zaXRpb25zW2ldO1xuICAgICAgICAgICAgY29uc3QgdDIgPSB0cmFuc2l0aW9uc1tpICsgMV07XG5cbiAgICAgICAgICAgIGxldCB0cmFuc2l0aW9uID0gdDtcblxuICAgICAgICAgICAgaWYgKGkgPCB0cmFuc2l0aW9ucy5sZW5ndGggLSAxICYmIG1vZE1hcFt0XSAmJiBtb2RNYXBbdF0uYWZ0ZXIgPT09IHQyKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbiA9IG1vZE1hcFt0XS5uZXdUcmFuc2l0aW9uO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzLnB1c2godHJhbnNpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm0gYW4gYXJyYXkgb2YgdHJhbnNpdGlvbnMgaW50byBhbiBhcnJheSBvZiB0cmFuc2l0aW9ucyBhbmQgaG93IG1hbnkgdGltZXNcbiAgICAgKiB0aGV5IGFyZSByZXBlYXRlZCBjb25zZWN1dGl2ZWx5LlxuICAgICAqXG4gICAgICogQW4gYXJyYXkgb2YgMTIzIFwiam9pbmVkX2FuZF9sZWZ0XCIgdHJhbnNpdGlvbnMsIHdvdWxkIHJlc3VsdCBpbjpcbiAgICAgKiBgYGBcbiAgICAgKiBbe1xuICAgICAqICAgdHJhbnNpdGlvblR5cGU6IFwiam9pbmVkX2FuZF9sZWZ0XCJcbiAgICAgKiAgIHJlcGVhdHM6IDEyM1xuICAgICAqIH1dXG4gICAgICogYGBgXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJhbnNpdGlvbnMgdGhlIGFycmF5IG9mIHRyYW5zaXRpb25zIHRvIHRyYW5zZm9ybS5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0W119IGFuIGFycmF5IG9mIGNvYWxlc2NlZCB0cmFuc2l0aW9ucy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBjb2FsZXNjZVJlcGVhdGVkVHJhbnNpdGlvbnModHJhbnNpdGlvbnM6IFRyYW5zaXRpb25UeXBlW10pIHtcbiAgICAgICAgY29uc3QgcmVzOiB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uVHlwZTogVHJhbnNpdGlvblR5cGU7XG4gICAgICAgICAgICByZXBlYXRzOiBudW1iZXI7XG4gICAgICAgIH1bXSA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMCAmJiByZXNbcmVzLmxlbmd0aCAtIDFdLnRyYW5zaXRpb25UeXBlID09PSB0cmFuc2l0aW9uc1tpXSkge1xuICAgICAgICAgICAgICAgIHJlc1tyZXMubGVuZ3RoIC0gMV0ucmVwZWF0cyArPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25UeXBlOiB0cmFuc2l0aW9uc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0czogMSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvciBhIGNlcnRhaW4gdHJhbnNpdGlvbiwgdCwgZGVzY3JpYmUgd2hhdCBoYXBwZW5lZCB0byB0aGUgdXNlcnMgdGhhdFxuICAgICAqIHVuZGVyd2VudCB0aGUgdHJhbnNpdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdCB0aGUgdHJhbnNpdGlvbiB0eXBlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB1c2VyQ291bnQgbnVtYmVyIG9mIHVzZXJuYW1lc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZXBlYXRzIHRoZSBudW1iZXIgb2YgdGltZXMgdGhlIHRyYW5zaXRpb24gd2FzIHJlcGVhdGVkIGluIGEgcm93LlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSB3cml0dGVuIEh1bWFuIFJlYWRhYmxlIGVxdWl2YWxlbnQgb2YgdGhlIHRyYW5zaXRpb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0RGVzY3JpcHRpb25Gb3JUcmFuc2l0aW9uKFxuICAgICAgICB0OiBUcmFuc2l0aW9uVHlwZSxcbiAgICAgICAgdXNlckNvdW50OiBudW1iZXIsXG4gICAgICAgIGNvdW50OiBudW1iZXIsXG4gICAgKTogc3RyaW5nIHwgSlNYLkVsZW1lbnQge1xuICAgICAgICAvLyBUaGUgZW1wdHkgaW50ZXJwb2xhdGlvbnMgJ3NldmVyYWxVc2VycycgYW5kICdvbmVVc2VyJ1xuICAgICAgICAvLyBhcmUgdGhlcmUgb25seSB0byBzaG93IHRyYW5zbGF0b3JzIHRvIG5vbi1FbmdsaXNoIGxhbmd1YWdlc1xuICAgICAgICAvLyB0aGF0IHRoZSB2ZXJiIGlzIGNvbmp1Z2F0ZWQgdG8gcGx1cmFsIG9yIHNpbmd1bGFyIFN1YmplY3QuXG4gICAgICAgIGxldCByZXMgPSBudWxsO1xuICAgICAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgICAgIGNhc2UgVHJhbnNpdGlvblR5cGUuSm9pbmVkOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc2pvaW5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50IH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc2pvaW5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudCB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhbnNpdGlvblR5cGUuTGVmdDpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNsZWZ0ICUoY291bnQpcyB0aW1lc1wiLCB7IHNldmVyYWxVc2VyczogXCJcIiwgY291bnQgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzbGVmdCAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudCB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhbnNpdGlvblR5cGUuSm9pbmVkQW5kTGVmdDpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNqb2luZWQgYW5kIGxlZnQgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudCB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNqb2luZWQgYW5kIGxlZnQgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFRyYW5zaXRpb25UeXBlLkxlZnRBbmRKb2luZWQ6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2VycylzbGVmdCBhbmQgcmVqb2luZWQgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudCB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNsZWZ0IGFuZCByZWpvaW5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudCB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhbnNpdGlvblR5cGUuSW52aXRlUmVqZWN0OlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc3JlamVjdGVkIHRoZWlyIGludml0YXRpb25zICUoY291bnQpcyB0aW1lc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXZlcmFsVXNlcnM6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzcmVqZWN0ZWQgdGhlaXIgaW52aXRhdGlvbiAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudCB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhbnNpdGlvblR5cGUuSW52aXRlV2l0aGRyYXdhbDpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNoYWQgdGhlaXIgaW52aXRhdGlvbnMgd2l0aGRyYXduICUoY291bnQpcyB0aW1lc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXZlcmFsVXNlcnM6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzaGFkIHRoZWlyIGludml0YXRpb24gd2l0aGRyYXduICUoY291bnQpcyB0aW1lc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50IH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBUcmFuc2l0aW9uVHlwZS5JbnZpdGVkOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwid2VyZSBpbnZpdGVkICUoY291bnQpcyB0aW1lc1wiLCB7IGNvdW50IH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCJ3YXMgaW52aXRlZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudCB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhbnNpdGlvblR5cGUuQmFubmVkOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwid2VyZSBiYW5uZWQgJShjb3VudClzIHRpbWVzXCIsIHsgY291bnQgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIndhcyBiYW5uZWQgJShjb3VudClzIHRpbWVzXCIsIHsgY291bnQgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFRyYW5zaXRpb25UeXBlLlVuYmFubmVkOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwid2VyZSB1bmJhbm5lZCAlKGNvdW50KXMgdGltZXNcIiwgeyBjb3VudCB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwid2FzIHVuYmFubmVkICUoY291bnQpcyB0aW1lc1wiLCB7IGNvdW50IH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBUcmFuc2l0aW9uVHlwZS5LaWNrZWQ6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCJ3ZXJlIHJlbW92ZWQgJShjb3VudClzIHRpbWVzXCIsIHsgY291bnQgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIndhcyByZW1vdmVkICUoY291bnQpcyB0aW1lc1wiLCB7IGNvdW50IH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBUcmFuc2l0aW9uVHlwZS5DaGFuZ2VkTmFtZTpcbiAgICAgICAgICAgICAgICByZXMgPSAodXNlckNvdW50ID4gMSlcbiAgICAgICAgICAgICAgICAgICAgPyBfdChcIiUoc2V2ZXJhbFVzZXJzKXNjaGFuZ2VkIHRoZWlyIG5hbWUgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudCB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNjaGFuZ2VkIHRoZWlyIG5hbWUgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFRyYW5zaXRpb25UeXBlLkNoYW5nZWRBdmF0YXI6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2VycylzY2hhbmdlZCB0aGVpciBhdmF0YXIgJShjb3VudClzIHRpbWVzXCIsIHsgc2V2ZXJhbFVzZXJzOiBcIlwiLCBjb3VudCB9KVxuICAgICAgICAgICAgICAgICAgICA6IF90KFwiJShvbmVVc2VyKXNjaGFuZ2VkIHRoZWlyIGF2YXRhciAlKGNvdW50KXMgdGltZXNcIiwgeyBvbmVVc2VyOiBcIlwiLCBjb3VudCB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhbnNpdGlvblR5cGUuTm9DaGFuZ2U6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2VycylzbWFkZSBubyBjaGFuZ2VzICUoY291bnQpcyB0aW1lc1wiLCB7IHNldmVyYWxVc2VyczogXCJcIiwgY291bnQgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzbWFkZSBubyBjaGFuZ2VzICUoY291bnQpcyB0aW1lc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50IH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBUcmFuc2l0aW9uVHlwZS5TZXJ2ZXJBY2w6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2VycylzY2hhbmdlZCB0aGUgc2VydmVyIEFDTHMgJShjb3VudClzIHRpbWVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNldmVyYWxVc2VyczogXCJcIiwgY291bnQgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzY2hhbmdlZCB0aGUgc2VydmVyIEFDTHMgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFRyYW5zaXRpb25UeXBlLkNoYW5nZWRQaW5zOlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc2NoYW5nZWQgdGhlIDxhPnBpbm5lZCBtZXNzYWdlczwvYT4gZm9yIHRoZSByb29tICUoY291bnQpcyB0aW1lc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhXCI6IChzdWIpID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXtvblBpbm5lZE1lc3NhZ2VzQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc2NoYW5nZWQgdGhlIDxhPnBpbm5lZCBtZXNzYWdlczwvYT4gZm9yIHRoZSByb29tICUoY291bnQpcyB0aW1lc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBvbmVVc2VyOiBcIlwiLCBjb3VudCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYVwiOiAoc3ViKSA9PiA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdsaW5rX2lubGluZScgb25DbGljaz17b25QaW5uZWRNZXNzYWdlc0NsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgVHJhbnNpdGlvblR5cGUuTWVzc2FnZVJlbW92ZWQ6XG4gICAgICAgICAgICAgICAgcmVzID0gKHVzZXJDb3VudCA+IDEpXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCIlKHNldmVyYWxVc2VycylzcmVtb3ZlZCBhIG1lc3NhZ2UgJShjb3VudClzIHRpbWVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNldmVyYWxVc2VyczogXCJcIiwgY291bnQgfSlcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIiUob25lVXNlcilzcmVtb3ZlZCBhIG1lc3NhZ2UgJShjb3VudClzIHRpbWVzXCIsIHsgb25lVXNlcjogXCJcIiwgY291bnQgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFRyYW5zaXRpb25UeXBlLkhpZGRlbkV2ZW50OlxuICAgICAgICAgICAgICAgIHJlcyA9ICh1c2VyQ291bnQgPiAxKVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiJShzZXZlcmFsVXNlcnMpc3NlbnQgJShjb3VudClzIGhpZGRlbiBtZXNzYWdlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzZXZlcmFsVXNlcnM6IFwiXCIsIGNvdW50IH0pXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCIlKG9uZVVzZXIpc3NlbnQgJShjb3VudClzIGhpZGRlbiBtZXNzYWdlc1wiLCB7IG9uZVVzZXI6IFwiXCIsIGNvdW50IH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRUcmFuc2l0aW9uU2VxdWVuY2UoZXZlbnRzOiBJVXNlckV2ZW50c1tdKSB7XG4gICAgICAgIHJldHVybiBldmVudHMubWFwKEV2ZW50TGlzdFN1bW1hcnkuZ2V0VHJhbnNpdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGFiZWwgYSBnaXZlbiBtZW1iZXJzaGlwIGV2ZW50LCBgZWAsIHdoZXJlIGBnZXRDb250ZW50KCkubWVtYmVyc2hpcGAgaGFzXG4gICAgICogY2hhbmdlZCBmb3IgZWFjaCB0cmFuc2l0aW9uIGFsbG93ZWQgYnkgdGhlIE1hdHJpeCBwcm90b2NvbC4gVGhpcyBhdHRlbXB0cyB0b1xuICAgICAqIGxhYmVsIHRoZSBtZW1iZXJzaGlwIGNoYW5nZXMgdGhhdCBvY2N1ciBpbiBgLi4vLi4vLi4vVGV4dEZvckV2ZW50LmpzYC5cbiAgICAgKiBAcGFyYW0ge01hdHJpeEV2ZW50fSBlIHRoZSBtZW1iZXJzaGlwIGNoYW5nZSBldmVudCB0byBsYWJlbC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nP30gdGhlIHRyYW5zaXRpb24gdHlwZSBnaXZlbiB0byB0aGlzIGV2ZW50LiBUaGlzIGRlZmF1bHRzIHRvIGBudWxsYFxuICAgICAqIGlmIGEgdHJhbnNpdGlvbiBpcyBub3QgcmVjb2duaXNlZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRUcmFuc2l0aW9uKGU6IElVc2VyRXZlbnRzKTogVHJhbnNpdGlvblR5cGUge1xuICAgICAgICBpZiAoZS5teEV2ZW50LmlzUmVkYWN0ZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLk1lc3NhZ2VSZW1vdmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChlLm14RXZlbnQuZ2V0VHlwZSgpKSB7XG4gICAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5Sb29tVGhpcmRQYXJ0eUludml0ZTpcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgM3BpZCBpbnZpdGVzIHRoZSBzYW1lIGFzIGludml0ZXMgc28gdGhleSBnZXQgYnVuZGxlZCB0b2dldGhlclxuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZDNwaWRJbnZpdGUoZS5teEV2ZW50KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuSW52aXRlV2l0aGRyYXdhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLkludml0ZWQ7XG5cbiAgICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJvb21TZXJ2ZXJBY2w6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLlNlcnZlckFjbDtcblxuICAgICAgICAgICAgY2FzZSBFdmVudFR5cGUuUm9vbVBpbm5lZEV2ZW50czpcbiAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuQ2hhbmdlZFBpbnM7XG5cbiAgICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJvb21NZW1iZXI6XG4gICAgICAgICAgICAgICAgc3dpdGNoIChlLm14RXZlbnQuZ2V0Q29udGVudCgpLm1lbWJlcnNoaXApIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW52aXRlJzogcmV0dXJuIFRyYW5zaXRpb25UeXBlLkludml0ZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Jhbic6IHJldHVybiBUcmFuc2l0aW9uVHlwZS5CYW5uZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2pvaW4nOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUubXhFdmVudC5nZXRQcmV2Q29udGVudCgpLm1lbWJlcnNoaXAgPT09ICdqb2luJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLm14RXZlbnQuZ2V0Q29udGVudCgpLmRpc3BsYXluYW1lICE9PSBlLm14RXZlbnQuZ2V0UHJldkNvbnRlbnQoKS5kaXNwbGF5bmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuQ2hhbmdlZE5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlLm14RXZlbnQuZ2V0Q29udGVudCgpLmF2YXRhcl91cmwgIT09IGUubXhFdmVudC5nZXRQcmV2Q29udGVudCgpLmF2YXRhcl91cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLkNoYW5nZWRBdmF0YXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiTUVMUyBpZ25vcmluZyBkdXBsaWNhdGUgbWVtYmVyc2hpcCBqb2luIGV2ZW50XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBUcmFuc2l0aW9uVHlwZS5Ob0NoYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25UeXBlLkpvaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGVhdmUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUubXhFdmVudC5nZXRTZW5kZXIoKSA9PT0gZS5teEV2ZW50LmdldFN0YXRlS2V5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5teEV2ZW50LmdldFByZXZDb250ZW50KCkubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuSW52aXRlUmVqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblR5cGUuTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZS5teEV2ZW50LmdldFByZXZDb250ZW50KCkubWVtYmVyc2hpcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2ludml0ZSc6IHJldHVybiBUcmFuc2l0aW9uVHlwZS5JbnZpdGVXaXRoZHJhd2FsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Jhbic6IHJldHVybiBUcmFuc2l0aW9uVHlwZS5VbmJhbm5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZW5kZXIgaXMgbm90IHRhcmdldCBhbmQgbWFkZSB0aGUgdGFyZ2V0IGxlYXZlLCBpZiBub3QgZnJvbSBpbnZpdGUvYmFuIHRoZW4gdGhpcyBpcyBhIGtpY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gVHJhbnNpdGlvblR5cGUuS2lja2VkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBhc3N1bWUgdGhpcyBpcyBhIGhpZGRlbiBldmVudFxuICAgICAgICAgICAgICAgIHJldHVybiBUcmFuc2l0aW9uVHlwZS5IaWRkZW5FdmVudDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEFnZ3JlZ2F0ZSh1c2VyRXZlbnRzOiBSZWNvcmQ8c3RyaW5nLCBJVXNlckV2ZW50c1tdPikge1xuICAgICAgICAvLyBBIG1hcCBvZiBhZ2dyZWdhdGUgdHlwZSB0byBhcnJheXMgb2YgZGlzcGxheSBuYW1lcy4gRWFjaCBhZ2dyZWdhdGUgdHlwZVxuICAgICAgICAvLyBpcyBhIGNvbW1hLWRlbGltaXRlZCBzdHJpbmcgb2YgdHJhbnNpdGlvbnMsIGUuZy4gXCJqb2luZWQsbGVmdCxraWNrZWRcIi5cbiAgICAgICAgLy8gVGhlIGFycmF5IG9mIGRpc3BsYXkgbmFtZXMgaXMgdGhlIGFycmF5IG9mIHVzZXJzIHdobyB3ZW50IHRocm91Z2ggdGhhdFxuICAgICAgICAvLyBzZXF1ZW5jZSBkdXJpbmcgZXZlbnRzVG9SZW5kZXIuXG4gICAgICAgIGNvbnN0IGFnZ3JlZ2F0ZTogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge1xuICAgICAgICAgICAgLy8gJGFnZ3JlZ2F0ZVR5cGUgOiBbXTpzdHJpbmdcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQSBtYXAgb2YgYWdncmVnYXRlIHR5cGVzIHRvIHRoZSBpbmRpY2VzIHRoYXQgb3JkZXIgdGhlbSAodGhlIGluZGV4IG9mXG4gICAgICAgIC8vIHRoZSBmaXJzdCBldmVudCBmb3IgYSBnaXZlbiB0cmFuc2l0aW9uIHNlcXVlbmNlKVxuICAgICAgICBjb25zdCBhZ2dyZWdhdGVJbmRpY2VzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge1xuICAgICAgICAgICAgLy8gJGFnZ3JlZ2F0ZVR5cGUgOiBpbnRcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB1c2VycyA9IE9iamVjdC5rZXlzKHVzZXJFdmVudHMpO1xuICAgICAgICB1c2Vycy5mb3JFYWNoKFxuICAgICAgICAgICAgKHVzZXJJZCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0RXZlbnQgPSB1c2VyRXZlbnRzW3VzZXJJZF1bMF07XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSBmaXJzdEV2ZW50LmRpc3BsYXlOYW1lO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VxID0gRXZlbnRMaXN0U3VtbWFyeS5nZXRUcmFuc2l0aW9uU2VxdWVuY2UodXNlckV2ZW50c1t1c2VySWRdKS5qb2luKFNFUCk7XG4gICAgICAgICAgICAgICAgaWYgKCFhZ2dyZWdhdGVbc2VxXSkge1xuICAgICAgICAgICAgICAgICAgICBhZ2dyZWdhdGVbc2VxXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBhZ2dyZWdhdGVJbmRpY2VzW3NlcV0gPSAtMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhZ2dyZWdhdGVbc2VxXS5wdXNoKGRpc3BsYXlOYW1lKTtcblxuICAgICAgICAgICAgICAgIGlmIChhZ2dyZWdhdGVJbmRpY2VzW3NlcV0gPT09IC0xIHx8XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0RXZlbnQuaW5kZXggPCBhZ2dyZWdhdGVJbmRpY2VzW3NlcV1cbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRlSW5kaWNlc1tzZXFdID0gZmlyc3RFdmVudC5pbmRleDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lczogYWdncmVnYXRlLFxuICAgICAgICAgICAgaW5kaWNlczogYWdncmVnYXRlSW5kaWNlcyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50c1RvUmVuZGVyID0gdGhpcy5wcm9wcy5ldmVudHM7XG5cbiAgICAgICAgLy8gTWFwIHVzZXIgSURzIHRvIGxhdGVzdCBBdmF0YXIgTWVtYmVyLiBFUzYgTWFwcyBhcmUgb3JkZXJlZCBieSB3aGVuIHRoZSBrZXkgd2FzIGNyZWF0ZWQsXG4gICAgICAgIC8vIHNvIHRoaXMgd29ya3MgcGVyZmVjdGx5IGZvciB1cyB0byBtYXRjaCBldmVudCBvcmRlciB3aGlsc3Qgc3RvcmluZyB0aGUgbGF0ZXN0IEF2YXRhciBNZW1iZXJcbiAgICAgICAgY29uc3QgbGF0ZXN0VXNlckF2YXRhck1lbWJlciA9IG5ldyBNYXA8c3RyaW5nLCBSb29tTWVtYmVyPigpO1xuXG4gICAgICAgIC8vIE9iamVjdCBtYXBwaW5nIHVzZXIgSURzIHRvIGFuIGFycmF5IG9mIElVc2VyRXZlbnRzXG4gICAgICAgIGNvbnN0IHVzZXJFdmVudHM6IFJlY29yZDxzdHJpbmcsIElVc2VyRXZlbnRzW10+ID0ge307XG4gICAgICAgIGV2ZW50c1RvUmVuZGVyLmZvckVhY2goKGUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gZS5nZXRUeXBlKCk7XG5cbiAgICAgICAgICAgIGxldCB1c2VySWQgPSBlLmdldFNlbmRlcigpO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IEV2ZW50VHlwZS5Sb29tTWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgdXNlcklkID0gZS5nZXRTdGF0ZUtleSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlLmlzUmVkYWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgIHVzZXJJZCA9IGUuZ2V0VW5zaWduZWQoKT8ucmVkYWN0ZWRfYmVjYXVzZT8uc2VuZGVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbml0aWFsaXNlIGEgdXNlcidzIGV2ZW50c1xuICAgICAgICAgICAgaWYgKCF1c2VyRXZlbnRzW3VzZXJJZF0pIHtcbiAgICAgICAgICAgICAgICB1c2VyRXZlbnRzW3VzZXJJZF0gPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRpc3BsYXlOYW1lID0gdXNlcklkO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IEV2ZW50VHlwZS5Sb29tVGhpcmRQYXJ0eUludml0ZSkge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lID0gZS5nZXRDb250ZW50KCkuZGlzcGxheV9uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChlLnNlbmRlcikge1xuICAgICAgICAgICAgICAgICAgICBsYXRlc3RVc2VyQXZhdGFyTWVtYmVyLnNldCh1c2VySWQsIGUuc2VuZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VuZGVyID0gdGhpcy5jb250ZXh0Py5yb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICAgICAgICAgIGlmIChzZW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWUgPSBzZW5kZXIubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbGF0ZXN0VXNlckF2YXRhck1lbWJlci5zZXQodXNlcklkLCBzZW5kZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS50YXJnZXQgJiYgVEFSR0VUX0FTX0RJU1BMQVlfTkFNRV9FVkVOVFMuaW5jbHVkZXModHlwZSBhcyBFdmVudFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWUgPSBlLnRhcmdldC5uYW1lO1xuICAgICAgICAgICAgICAgIGxhdGVzdFVzZXJBdmF0YXJNZW1iZXIuc2V0KHVzZXJJZCwgZS50YXJnZXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlLnNlbmRlcikge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lID0gZS5zZW5kZXIubmFtZTtcbiAgICAgICAgICAgICAgICBsYXRlc3RVc2VyQXZhdGFyTWVtYmVyLnNldCh1c2VySWQsIGUuc2VuZGVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdXNlckV2ZW50c1t1c2VySWRdLnB1c2goe1xuICAgICAgICAgICAgICAgIG14RXZlbnQ6IGUsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGFnZ3JlZ2F0ZSA9IHRoaXMuZ2V0QWdncmVnYXRlKHVzZXJFdmVudHMpO1xuXG4gICAgICAgIC8vIFNvcnQgdHlwZXMgYnkgb3JkZXIgb2YgbG93ZXN0IGV2ZW50IGluZGV4IHdpdGhpbiBzZXF1ZW5jZVxuICAgICAgICBjb25zdCBvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlcyA9IE9iamVjdC5rZXlzKGFnZ3JlZ2F0ZS5uYW1lcykuc29ydChcbiAgICAgICAgICAgIChzZXExLCBzZXEyKSA9PiBhZ2dyZWdhdGUuaW5kaWNlc1tzZXExXSAtIGFnZ3JlZ2F0ZS5pbmRpY2VzW3NlcTJdLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiA8R2VuZXJpY0V2ZW50TGlzdFN1bW1hcnlcbiAgICAgICAgICAgIGRhdGEtdGVzdGlkPXt0aGlzLnByb3BzWydkYXRhLXRlc3RpZCddfVxuICAgICAgICAgICAgZXZlbnRzPXt0aGlzLnByb3BzLmV2ZW50c31cbiAgICAgICAgICAgIHRocmVzaG9sZD17dGhpcy5wcm9wcy50aHJlc2hvbGR9XG4gICAgICAgICAgICBvblRvZ2dsZT17dGhpcy5wcm9wcy5vblRvZ2dsZX1cbiAgICAgICAgICAgIHN0YXJ0RXhwYW5kZWQ9e3RoaXMucHJvcHMuc3RhcnRFeHBhbmRlZH1cbiAgICAgICAgICAgIGNoaWxkcmVuPXt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgc3VtbWFyeU1lbWJlcnM9e1suLi5sYXRlc3RVc2VyQXZhdGFyTWVtYmVyLnZhbHVlcygpXX1cbiAgICAgICAgICAgIGxheW91dD17dGhpcy5wcm9wcy5sYXlvdXR9XG4gICAgICAgICAgICBzdW1tYXJ5VGV4dD17dGhpcy5nZW5lcmF0ZVN1bW1hcnkoYWdncmVnYXRlLm5hbWVzLCBvcmRlcmVkVHJhbnNpdGlvblNlcXVlbmNlcyl9IC8+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBR0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFrQkEsTUFBTUEscUJBQXFCLEdBQUcsTUFBWTtFQUN0Q0Msd0JBQUEsQ0FBZ0JDLFFBQWhCLENBQXlCQyxPQUF6QixDQUFpQztJQUFFQyxLQUFLLEVBQUVDLHVDQUFBLENBQWlCQztFQUExQixDQUFqQyxFQUE2RSxLQUE3RTtBQUNILENBRkQ7O0FBSUEsTUFBTUMsNkJBQTZCLEdBQUcsQ0FBQ0MsZ0JBQUEsQ0FBVUMsVUFBWCxDQUF0QztJQW9CS0MsYzs7V0FBQUEsYztFQUFBQSxjO0VBQUFBLGM7RUFBQUEsYztFQUFBQSxjO0VBQUFBLGM7RUFBQUEsYztFQUFBQSxjO0VBQUFBLGM7RUFBQUEs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