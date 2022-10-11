"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _room = require("matrix-js-sdk/src/models/room");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _user = require("matrix-js-sdk/src/models/user");

var _lodash = require("lodash");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _client = require("matrix-js-sdk/src/client");

var _event = require("matrix-js-sdk/src/@types/event");

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RoomInvite = require("../../../RoomInvite");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _BaseCard = _interopRequireDefault(require("../right_panel/BaseCard"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _RoomName = _interopRequireDefault(require("../elements/RoomName"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _TruncatedList = _interopRequireDefault(require("../elements/TruncatedList"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _SearchBox = _interopRequireDefault(require("../../structures/SearchBox"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _EntityTile = _interopRequireDefault(require("./EntityTile"));

var _MemberTile = _interopRequireDefault(require("./MemberTile"));

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _UIComponents = require("../../../customisations/helpers/UIComponents");

var _UIFeature = require("../../../settings/UIFeature");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2017, 2018 New Vector Ltd
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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
const INITIAL_LOAD_NUM_MEMBERS = 30;
const INITIAL_LOAD_NUM_INVITED = 5;
const SHOW_MORE_INCREMENT = 100; // Regex applied to filter our punctuation in member names before applying sort, to fuzzy it a little
// matches all ASCII punctuation: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~

const SORT_REGEX = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]+/g;

class MemberList extends _react.default.Component {
  // RoomMember -> sortName
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "showPresence", true);
    (0, _defineProperty2.default)(this, "mounted", false);
    (0, _defineProperty2.default)(this, "collator", void 0);
    (0, _defineProperty2.default)(this, "sortNames", new Map());
    (0, _defineProperty2.default)(this, "onUserPresenceChange", (event, user) => {
      // Attach a SINGLE listener for global presence changes then locate the
      // member tile and re-render it. This is more efficient than every tile
      // ever attaching their own listener.
      const tile = this.refs[user.userId]; // console.log(`Got presence update for ${user.userId}. hasTile=${!!tile}`);

      if (tile) {
        this.updateList(); // reorder the membership list
      }
    });
    (0, _defineProperty2.default)(this, "onRoom", room => {
      if (room.roomId !== this.props.roomId) {
        return;
      } // We listen for room events because when we accept an invite
      // we need to wait till the room is fully populated with state
      // before refreshing the member list else we get a stale list.


      this.showMembersAccordingToMembershipWithLL();
    });
    (0, _defineProperty2.default)(this, "onMyMembership", (room, membership, oldMembership) => {
      if (room.roomId === this.props.roomId && membership === "join") {
        this.showMembersAccordingToMembershipWithLL();
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateUpdate", state => {
      if (state.roomId !== this.props.roomId) return;
      this.updateList();
    });
    (0, _defineProperty2.default)(this, "onRoomMemberName", (ev, member) => {
      if (member.roomId !== this.props.roomId) {
        return;
      }

      this.updateList();
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvent", event => {
      if (event.getRoomId() === this.props.roomId && event.getType() === _event.EventType.RoomThirdPartyInvite) {
        this.updateList();
      }

      if (this.canInvite !== this.state.canInvite) this.setState({
        canInvite: this.canInvite
      });
    });
    (0, _defineProperty2.default)(this, "updateList", (0, _lodash.throttle)(() => {
      this.updateListNow();
    }, 500, {
      leading: true,
      trailing: true
    }));
    (0, _defineProperty2.default)(this, "createOverflowTileJoined", (overflowCount, totalCount) => {
      return this.createOverflowTile(overflowCount, totalCount, this.showMoreJoinedMemberList);
    });
    (0, _defineProperty2.default)(this, "createOverflowTileInvited", (overflowCount, totalCount) => {
      return this.createOverflowTile(overflowCount, totalCount, this.showMoreInvitedMemberList);
    });
    (0, _defineProperty2.default)(this, "createOverflowTile", (overflowCount, totalCount, onClick) => {
      // For now we'll pretend this is any entity. It should probably be a separate tile.
      const text = (0, _languageHandler._t)("and %(count)s others...", {
        count: overflowCount
      });
      return /*#__PURE__*/_react.default.createElement(_EntityTile.default, {
        className: "mx_EntityTile_ellipsis",
        avatarJsx: /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
          url: require("../../../../res/img/ellipsis.svg").default,
          name: "...",
          width: 36,
          height: 36
        }),
        name: text,
        presenceState: "online",
        suppressOnHover: true,
        onClick: onClick
      });
    });
    (0, _defineProperty2.default)(this, "showMoreJoinedMemberList", () => {
      this.setState({
        truncateAtJoined: this.state.truncateAtJoined + SHOW_MORE_INCREMENT
      });
    });
    (0, _defineProperty2.default)(this, "showMoreInvitedMemberList", () => {
      this.setState({
        truncateAtInvited: this.state.truncateAtInvited + SHOW_MORE_INCREMENT
      });
    });
    (0, _defineProperty2.default)(this, "memberSort", (memberA, memberB) => {
      // order by presence, with "active now" first.
      // ...and then by power level
      // ...and then by last active
      // ...and then alphabetically.
      // We could tiebreak instead by "last recently spoken in this room" if we wanted to.
      // console.log(`Comparing userA=${this.memberString(memberA)} userB=${this.memberString(memberB)}`);
      const userA = memberA.user;
      const userB = memberB.user; // if (!userA) console.log("!! MISSING USER FOR A-SIDE: " + memberA.name + " !!");
      // if (!userB) console.log("!! MISSING USER FOR B-SIDE: " + memberB.name + " !!");

      if (!userA && !userB) return 0;
      if (userA && !userB) return -1;
      if (!userA && userB) return 1; // First by presence

      if (this.showPresence) {
        const convertPresence = p => p === 'unavailable' ? 'online' : p;

        const presenceIndex = p => {
          const order = ['active', 'online', 'offline'];
          const idx = order.indexOf(convertPresence(p));
          return idx === -1 ? order.length : idx; // unknown states at the end
        };

        const idxA = presenceIndex(userA.currentlyActive ? 'active' : userA.presence);
        const idxB = presenceIndex(userB.currentlyActive ? 'active' : userB.presence); // console.log(`userA_presenceGroup=${idxA} userB_presenceGroup=${idxB}`);

        if (idxA !== idxB) {
          // console.log("Comparing on presence group - returning");
          return idxA - idxB;
        }
      } // Second by power level


      if (memberA.powerLevel !== memberB.powerLevel) {
        // console.log("Comparing on power level - returning");
        return memberB.powerLevel - memberA.powerLevel;
      } // Third by last active


      if (this.showPresence && userA.getLastActiveTs() !== userB.getLastActiveTs()) {
        // console.log("Comparing on last active timestamp - returning");
        return userB.getLastActiveTs() - userA.getLastActiveTs();
      } // Fourth by name (alphabetical)


      return this.collator.compare(this.sortNames.get(memberA), this.sortNames.get(memberB));
    });
    (0, _defineProperty2.default)(this, "onSearchQueryChanged", searchQuery => {
      this.props.onSearchQueryChanged(searchQuery);
      this.setState({
        filteredJoinedMembers: this.filterMembers(this.state.members, 'join', searchQuery),
        filteredInvitedMembers: this.filterMembers(this.state.members, 'invite', searchQuery)
      });
    });
    (0, _defineProperty2.default)(this, "onPending3pidInviteClick", inviteEvent => {
      _dispatcher.default.dispatch({
        action: 'view_3pid_invite',
        event: inviteEvent
      });
    });
    (0, _defineProperty2.default)(this, "getChildrenJoined", (start, end) => {
      return this.makeMemberTiles(this.state.filteredJoinedMembers.slice(start, end));
    });
    (0, _defineProperty2.default)(this, "getChildCountJoined", () => this.state.filteredJoinedMembers.length);
    (0, _defineProperty2.default)(this, "getChildrenInvited", (start, end) => {
      let targets = this.state.filteredInvitedMembers;

      if (end > this.state.filteredInvitedMembers.length) {
        targets = targets.concat(this.getPending3PidInvites());
      }

      return this.makeMemberTiles(targets.slice(start, end));
    });
    (0, _defineProperty2.default)(this, "getChildCountInvited", () => {
      return this.state.filteredInvitedMembers.length + (this.getPending3PidInvites() || []).length;
    });
    (0, _defineProperty2.default)(this, "onInviteButtonClick", ev => {
      _PosthogTrackers.default.trackInteraction("WebRightPanelMemberListInviteButton", ev);

      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        _dispatcher.default.dispatch({
          action: 'require_registration'
        });

        return;
      } // open the room inviter


      _dispatcher.default.dispatch({
        action: 'view_invite',
        roomId: this.props.roomId
      });
    });

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli.hasLazyLoadMembersEnabled()) {
      // show an empty list
      this.state = this.getMembersState([]);
    } else {
      this.state = this.getMembersState(this.roomMembers());
    }

    cli.on(_client.ClientEvent.Room, this.onRoom); // invites & joining after peek

    const enablePresenceByHsUrl = _SdkConfig.default.get("enable_presence_by_hs_url");

    const hsUrl = _MatrixClientPeg.MatrixClientPeg.get().baseUrl;

    this.showPresence = enablePresenceByHsUrl?.[hsUrl] ?? true;
  } // eslint-disable-next-line


  UNSAFE_componentWillMount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    this.mounted = true;

    if (cli.hasLazyLoadMembersEnabled()) {
      this.showMembersAccordingToMembershipWithLL();
      cli.on(_room.RoomEvent.MyMembership, this.onMyMembership);
    } else {
      this.listenForMembersChanges();
    }
  }

  listenForMembersChanges() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    cli.on(_roomState.RoomStateEvent.Update, this.onRoomStateUpdate);
    cli.on(_roomMember.RoomMemberEvent.Name, this.onRoomMemberName);
    cli.on(_roomState.RoomStateEvent.Events, this.onRoomStateEvent); // We listen for changes to the lastPresenceTs which is essentially
    // listening for all presence events (we display most of not all of
    // the information contained in presence events).

    cli.on(_user.UserEvent.LastPresenceTs, this.onUserPresenceChange);
    cli.on(_user.UserEvent.Presence, this.onUserPresenceChange);
    cli.on(_user.UserEvent.CurrentlyActive, this.onUserPresenceChange); // cli.on("Room.timeline", this.onRoomTimeline);
  }

  componentWillUnmount() {
    this.mounted = false;

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli) {
      cli.removeListener(_roomState.RoomStateEvent.Update, this.onRoomStateUpdate);
      cli.removeListener(_roomMember.RoomMemberEvent.Name, this.onRoomMemberName);
      cli.removeListener(_room.RoomEvent.MyMembership, this.onMyMembership);
      cli.removeListener(_roomState.RoomStateEvent.Events, this.onRoomStateEvent);
      cli.removeListener(_client.ClientEvent.Room, this.onRoom);
      cli.removeListener(_user.UserEvent.LastPresenceTs, this.onUserPresenceChange);
      cli.removeListener(_user.UserEvent.Presence, this.onUserPresenceChange);
      cli.removeListener(_user.UserEvent.CurrentlyActive, this.onUserPresenceChange);
    } // cancel any pending calls to the rate_limited_funcs


    this.updateList.cancel();
  }
  /**
   * If lazy loading is enabled, either:
   * show a spinner and load the members if the user is joined,
   * or show the members available so far if the user is invited
   */


  async showMembersAccordingToMembershipWithLL() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli.hasLazyLoadMembersEnabled()) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(this.props.roomId);
      const membership = room && room.getMyMembership();

      if (membership === "join") {
        this.setState({
          loading: true
        });

        try {
          await room.loadMembersIfNeeded();
        } catch (ex) {
          /* already logged in RoomView */
        }

        if (this.mounted) {
          this.setState(this.getMembersState(this.roomMembers()));
          this.listenForMembersChanges();
        }
      } else {
        // show the members we already have loaded
        this.setState(this.getMembersState(this.roomMembers()));
      }
    }
  }

  get canInvite() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(this.props.roomId);
    return room?.canInvite(cli.getUserId()) || room?.isSpaceRoom() && room.getJoinRule() === _partials.JoinRule.Public;
  }

  getMembersState(members) {
    // set the state after determining showPresence to make sure it's
    // taken into account while rendering
    return {
      loading: false,
      members: members,
      filteredJoinedMembers: this.filterMembers(members, 'join', this.props.searchQuery),
      filteredInvitedMembers: this.filterMembers(members, 'invite', this.props.searchQuery),
      canInvite: this.canInvite,
      // ideally we'd size this to the page height, but
      // in practice I find that a little constraining
      truncateAtJoined: INITIAL_LOAD_NUM_MEMBERS,
      truncateAtInvited: INITIAL_LOAD_NUM_INVITED
    };
  }

  updateListNow() {
    const members = this.roomMembers();
    this.setState({
      loading: false,
      members: members,
      filteredJoinedMembers: this.filterMembers(members, 'join', this.props.searchQuery),
      filteredInvitedMembers: this.filterMembers(members, 'invite', this.props.searchQuery)
    });
  }

  getMembersWithUser() {
    if (!this.props.roomId) return [];

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(this.props.roomId);
    if (!room) return [];
    const allMembers = Object.values(room.currentState.members);
    allMembers.forEach(member => {
      // work around a race where you might have a room member object
      // before the user object exists. This may or may not cause
      // https://github.com/vector-im/vector-web/issues/186
      if (!member.user) {
        member.user = cli.getUser(member.userId);
      }

      this.sortNames.set(member, (member.name[0] === '@' ? member.name.slice(1) : member.name).replace(SORT_REGEX, "")); // XXX: this user may have no lastPresenceTs value!
      // the right solution here is to fix the race rather than leave it as 0
    });
    return allMembers;
  }

  roomMembers() {
    const allMembers = this.getMembersWithUser();
    const filteredAndSortedMembers = allMembers.filter(m => {
      return m.membership === 'join' || m.membership === 'invite';
    });

    const language = _SettingsStore.default.getValue("language");

    this.collator = new Intl.Collator(language, {
      sensitivity: 'base',
      ignorePunctuation: false
    });
    filteredAndSortedMembers.sort(this.memberSort);
    return filteredAndSortedMembers;
  }

  /**
   * SHOULD ONLY BE USED BY TESTS
   */
  memberString(member) {
    if (!member) {
      return "(null)";
    } else {
      const u = member.user;
      return "(" + member.name + ", " + member.powerLevel + ", " + (u ? u.lastActiveAgo : "<null>") + ", " + (u ? u.getLastActiveTs() : "<null>") + ", " + (u ? u.currentlyActive : "<null>") + ", " + (u ? u.presence : "<null>") + ")";
    }
  } // returns negative if a comes before b,
  // returns 0 if a and b are equivalent in ordering
  // returns positive if a comes after b.


  filterMembers(members, membership, query) {
    return members.filter(m => {
      if (query) {
        query = query.toLowerCase();
        const matchesName = m.name.toLowerCase().indexOf(query) !== -1;
        const matchesId = m.userId.toLowerCase().indexOf(query) !== -1;

        if (!matchesName && !matchesId) {
          return false;
        }
      }

      return m.membership === membership;
    });
  }

  getPending3PidInvites() {
    // include 3pid invites (m.room.third_party_invite) state events.
    // The HS may have already converted these into m.room.member invites so
    // we shouldn't add them if the 3pid invite state key (token) is in the
    // member invite (content.third_party_invite.signed.token)
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

    if (room) {
      return room.currentState.getStateEvents("m.room.third_party_invite").filter(function (e) {
        if (!(0, _RoomInvite.isValid3pidInvite)(e)) return false; // discard all invites which have a m.room.member event since we've
        // already added them.

        const memberEvent = room.currentState.getInviteForThreePidToken(e.getStateKey());
        if (memberEvent) return false;
        return true;
      });
    }
  }

  makeMemberTiles(members) {
    return members.map(m => {
      if (m instanceof _roomMember.RoomMember) {
        // Is a Matrix invite
        return /*#__PURE__*/_react.default.createElement(_MemberTile.default, {
          key: m.userId,
          member: m,
          ref: m.userId,
          showPresence: this.showPresence
        });
      } else {
        // Is a 3pid invite
        return /*#__PURE__*/_react.default.createElement(_EntityTile.default, {
          key: m.getStateKey(),
          name: m.getContent().display_name,
          suppressOnHover: true,
          onClick: () => this.onPending3pidInviteClick(m)
        });
      }
    });
  }

  render() {
    if (this.state.loading) {
      return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
        className: "mx_MemberList",
        onClose: this.props.onClose
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(this.props.roomId);
    let inviteButton;

    if (room?.getMyMembership() === 'join' && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.InviteUsers)) {
      let inviteButtonText = (0, _languageHandler._t)("Invite to this room");

      if (room.isSpaceRoom()) {
        inviteButtonText = (0, _languageHandler._t)("Invite to this space");
      }

      inviteButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_MemberList_invite",
        onClick: this.onInviteButtonClick,
        disabled: !this.state.canInvite
      }, /*#__PURE__*/_react.default.createElement("span", null, inviteButtonText));
    }

    let invitedHeader;
    let invitedSection;

    if (this.getChildCountInvited() > 0) {
      invitedHeader = /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Invited"));
      invitedSection = /*#__PURE__*/_react.default.createElement(_TruncatedList.default, {
        className: "mx_MemberList_section mx_MemberList_invited",
        truncateAt: this.state.truncateAtInvited,
        createOverflowElement: this.createOverflowTileInvited,
        getChildren: this.getChildrenInvited,
        getChildCount: this.getChildCountInvited
      });
    }

    const footer = /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
      className: "mx_MemberList_query mx_textinput_icon mx_textinput_search",
      placeholder: (0, _languageHandler._t)('Filter room members'),
      onSearch: this.onSearchQueryChanged,
      initialValue: this.props.searchQuery
    });

    let scopeHeader;

    if (room?.isSpaceRoom()) {
      scopeHeader = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RightPanel_scopeHeader"
      }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        room: room,
        height: 32,
        width: 32
      }), /*#__PURE__*/_react.default.createElement(_RoomName.default, {
        room: room
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
      className: "mx_MemberList",
      header: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, scopeHeader, inviteButton),
      footer: footer,
      onClose: this.props.onClose
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MemberList_wrapper"
    }, /*#__PURE__*/_react.default.createElement(_TruncatedList.default, {
      className: "mx_MemberList_section mx_MemberList_joined",
      truncateAt: this.state.truncateAtJoined,
      createOverflowElement: this.createOverflowTileJoined,
      getChildren: this.getChildrenJoined,
      getChildCount: this.getChildCountJoined
    }), invitedHeader, invitedSection));
  }

}

exports.default = MemberList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJTklUSUFMX0xPQURfTlVNX01FTUJFUlMiLCJJTklUSUFMX0xPQURfTlVNX0lOVklURUQiLCJTSE9XX01PUkVfSU5DUkVNRU5UIiwiU09SVF9SRUdFWCIsIk1lbWJlckxpc3QiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJNYXAiLCJldmVudCIsInVzZXIiLCJ0aWxlIiwicmVmcyIsInVzZXJJZCIsInVwZGF0ZUxpc3QiLCJyb29tIiwicm9vbUlkIiwic2hvd01lbWJlcnNBY2NvcmRpbmdUb01lbWJlcnNoaXBXaXRoTEwiLCJtZW1iZXJzaGlwIiwib2xkTWVtYmVyc2hpcCIsInN0YXRlIiwiZXYiLCJtZW1iZXIiLCJnZXRSb29tSWQiLCJnZXRUeXBlIiwiRXZlbnRUeXBlIiwiUm9vbVRoaXJkUGFydHlJbnZpdGUiLCJjYW5JbnZpdGUiLCJzZXRTdGF0ZSIsInRocm90dGxlIiwidXBkYXRlTGlzdE5vdyIsImxlYWRpbmciLCJ0cmFpbGluZyIsIm92ZXJmbG93Q291bnQiLCJ0b3RhbENvdW50IiwiY3JlYXRlT3ZlcmZsb3dUaWxlIiwic2hvd01vcmVKb2luZWRNZW1iZXJMaXN0Iiwic2hvd01vcmVJbnZpdGVkTWVtYmVyTGlzdCIsIm9uQ2xpY2siLCJ0ZXh0IiwiX3QiLCJjb3VudCIsInJlcXVpcmUiLCJkZWZhdWx0IiwidHJ1bmNhdGVBdEpvaW5lZCIsInRydW5jYXRlQXRJbnZpdGVkIiwibWVtYmVyQSIsIm1lbWJlckIiLCJ1c2VyQSIsInVzZXJCIiwic2hvd1ByZXNlbmNlIiwiY29udmVydFByZXNlbmNlIiwicCIsInByZXNlbmNlSW5kZXgiLCJvcmRlciIsImlkeCIsImluZGV4T2YiLCJsZW5ndGgiLCJpZHhBIiwiY3VycmVudGx5QWN0aXZlIiwicHJlc2VuY2UiLCJpZHhCIiwicG93ZXJMZXZlbCIsImdldExhc3RBY3RpdmVUcyIsImNvbGxhdG9yIiwiY29tcGFyZSIsInNvcnROYW1lcyIsImdldCIsInNlYXJjaFF1ZXJ5Iiwib25TZWFyY2hRdWVyeUNoYW5nZWQiLCJmaWx0ZXJlZEpvaW5lZE1lbWJlcnMiLCJmaWx0ZXJNZW1iZXJzIiwibWVtYmVycyIsImZpbHRlcmVkSW52aXRlZE1lbWJlcnMiLCJpbnZpdGVFdmVudCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwic3RhcnQiLCJlbmQiLCJtYWtlTWVtYmVyVGlsZXMiLCJzbGljZSIsInRhcmdldHMiLCJjb25jYXQiLCJnZXRQZW5kaW5nM1BpZEludml0ZXMiLCJQb3N0aG9nVHJhY2tlcnMiLCJ0cmFja0ludGVyYWN0aW9uIiwiTWF0cml4Q2xpZW50UGVnIiwiaXNHdWVzdCIsImNsaSIsImhhc0xhenlMb2FkTWVtYmVyc0VuYWJsZWQiLCJnZXRNZW1iZXJzU3RhdGUiLCJyb29tTWVtYmVycyIsIm9uIiwiQ2xpZW50RXZlbnQiLCJSb29tIiwib25Sb29tIiwiZW5hYmxlUHJlc2VuY2VCeUhzVXJsIiwiU2RrQ29uZmlnIiwiaHNVcmwiLCJiYXNlVXJsIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsIm1vdW50ZWQiLCJSb29tRXZlbnQiLCJNeU1lbWJlcnNoaXAiLCJvbk15TWVtYmVyc2hpcCIsImxpc3RlbkZvck1lbWJlcnNDaGFuZ2VzIiwiUm9vbVN0YXRlRXZlbnQiLCJVcGRhdGUiLCJvblJvb21TdGF0ZVVwZGF0ZSIsIlJvb21NZW1iZXJFdmVudCIsIk5hbWUiLCJvblJvb21NZW1iZXJOYW1lIiwiRXZlbnRzIiwib25Sb29tU3RhdGVFdmVudCIsIlVzZXJFdmVudCIsIkxhc3RQcmVzZW5jZVRzIiwib25Vc2VyUHJlc2VuY2VDaGFuZ2UiLCJQcmVzZW5jZSIsIkN1cnJlbnRseUFjdGl2ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJjYW5jZWwiLCJnZXRSb29tIiwiZ2V0TXlNZW1iZXJzaGlwIiwibG9hZGluZyIsImxvYWRNZW1iZXJzSWZOZWVkZWQiLCJleCIsImdldFVzZXJJZCIsImlzU3BhY2VSb29tIiwiZ2V0Sm9pblJ1bGUiLCJKb2luUnVsZSIsIlB1YmxpYyIsImdldE1lbWJlcnNXaXRoVXNlciIsImFsbE1lbWJlcnMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJjdXJyZW50U3RhdGUiLCJmb3JFYWNoIiwiZ2V0VXNlciIsInNldCIsIm5hbWUiLCJyZXBsYWNlIiwiZmlsdGVyZWRBbmRTb3J0ZWRNZW1iZXJzIiwiZmlsdGVyIiwibSIsImxhbmd1YWdlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiSW50bCIsIkNvbGxhdG9yIiwic2Vuc2l0aXZpdHkiLCJpZ25vcmVQdW5jdHVhdGlvbiIsInNvcnQiLCJtZW1iZXJTb3J0IiwibWVtYmVyU3RyaW5nIiwidSIsImxhc3RBY3RpdmVBZ28iLCJxdWVyeSIsInRvTG93ZXJDYXNlIiwibWF0Y2hlc05hbWUiLCJtYXRjaGVzSWQiLCJnZXRTdGF0ZUV2ZW50cyIsImUiLCJpc1ZhbGlkM3BpZEludml0ZSIsIm1lbWJlckV2ZW50IiwiZ2V0SW52aXRlRm9yVGhyZWVQaWRUb2tlbiIsImdldFN0YXRlS2V5IiwibWFwIiwiUm9vbU1lbWJlciIsImdldENvbnRlbnQiLCJkaXNwbGF5X25hbWUiLCJvblBlbmRpbmczcGlkSW52aXRlQ2xpY2siLCJyZW5kZXIiLCJvbkNsb3NlIiwiaW52aXRlQnV0dG9uIiwic2hvdWxkU2hvd0NvbXBvbmVudCIsIlVJQ29tcG9uZW50IiwiSW52aXRlVXNlcnMiLCJpbnZpdGVCdXR0b25UZXh0Iiwib25JbnZpdGVCdXR0b25DbGljayIsImludml0ZWRIZWFkZXIiLCJpbnZpdGVkU2VjdGlvbiIsImdldENoaWxkQ291bnRJbnZpdGVkIiwiY3JlYXRlT3ZlcmZsb3dUaWxlSW52aXRlZCIsImdldENoaWxkcmVuSW52aXRlZCIsImZvb3RlciIsInNjb3BlSGVhZGVyIiwiY3JlYXRlT3ZlcmZsb3dUaWxlSm9pbmVkIiwiZ2V0Q2hpbGRyZW5Kb2luZWQiLCJnZXRDaGlsZENvdW50Sm9pbmVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvTWVtYmVyTGlzdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIxIMWgaW1vbiBCcmFuZG5lciA8c2ltb24uYnJhLmFnQGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuaW1wb3J0IHsgUm9vbSwgUm9vbUV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IHsgUm9vbU1lbWJlciwgUm9vbU1lbWJlckV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyJztcbmltcG9ydCB7IFJvb21TdGF0ZSwgUm9vbVN0YXRlRXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1zdGF0ZSc7XG5pbXBvcnQgeyBVc2VyLCBVc2VyRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3VzZXJcIjtcbmltcG9ydCB7IHRocm90dGxlIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEpvaW5SdWxlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFsc1wiO1xuaW1wb3J0IHsgQ2xpZW50RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IGlzVmFsaWQzcGlkSW52aXRlIH0gZnJvbSBcIi4uLy4uLy4uL1Jvb21JbnZpdGVcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBCYXNlQ2FyZCBmcm9tIFwiLi4vcmlnaHRfcGFuZWwvQmFzZUNhcmRcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBSb29tTmFtZSBmcm9tIFwiLi4vZWxlbWVudHMvUm9vbU5hbWVcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgVHJ1bmNhdGVkTGlzdCBmcm9tICcuLi9lbGVtZW50cy9UcnVuY2F0ZWRMaXN0JztcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgU2VhcmNoQm94IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1NlYXJjaEJveFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBFbnRpdHlUaWxlIGZyb20gXCIuL0VudGl0eVRpbGVcIjtcbmltcG9ydCBNZW1iZXJUaWxlIGZyb20gXCIuL01lbWJlclRpbGVcIjtcbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gJy4uL2F2YXRhcnMvQmFzZUF2YXRhcic7XG5pbXBvcnQgeyBzaG91bGRTaG93Q29tcG9uZW50IH0gZnJvbSBcIi4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL2hlbHBlcnMvVUlDb21wb25lbnRzXCI7XG5pbXBvcnQgeyBVSUNvbXBvbmVudCB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uLy4uLy4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuXG5jb25zdCBJTklUSUFMX0xPQURfTlVNX01FTUJFUlMgPSAzMDtcbmNvbnN0IElOSVRJQUxfTE9BRF9OVU1fSU5WSVRFRCA9IDU7XG5jb25zdCBTSE9XX01PUkVfSU5DUkVNRU5UID0gMTAwO1xuXG4vLyBSZWdleCBhcHBsaWVkIHRvIGZpbHRlciBvdXIgcHVuY3R1YXRpb24gaW4gbWVtYmVyIG5hbWVzIGJlZm9yZSBhcHBseWluZyBzb3J0LCB0byBmdXp6eSBpdCBhIGxpdHRsZVxuLy8gbWF0Y2hlcyBhbGwgQVNDSUkgcHVuY3R1YXRpb246ICFcIiMkJSYnKCkqKywtLi86Ozw9Pj9AW1xcXV5fYHt8fX5cbmNvbnN0IFNPUlRfUkVHRVggPSAvW1xceDIxLVxceDJGXFx4M0EtXFx4NDBcXHg1Qi1cXHg2MFxceDdCLVxceDdFXSsvZztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcm9vbUlkOiBzdHJpbmc7XG4gICAgc2VhcmNoUXVlcnk6IHN0cmluZztcbiAgICBvbkNsb3NlKCk6IHZvaWQ7XG4gICAgb25TZWFyY2hRdWVyeUNoYW5nZWQ6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBsb2FkaW5nOiBib29sZWFuO1xuICAgIG1lbWJlcnM6IEFycmF5PFJvb21NZW1iZXI+O1xuICAgIGZpbHRlcmVkSm9pbmVkTWVtYmVyczogQXJyYXk8Um9vbU1lbWJlcj47XG4gICAgZmlsdGVyZWRJbnZpdGVkTWVtYmVyczogQXJyYXk8Um9vbU1lbWJlciB8IE1hdHJpeEV2ZW50PjtcbiAgICBjYW5JbnZpdGU6IGJvb2xlYW47XG4gICAgdHJ1bmNhdGVBdEpvaW5lZDogbnVtYmVyO1xuICAgIHRydW5jYXRlQXRJbnZpdGVkOiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lbWJlckxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHNob3dQcmVzZW5jZSA9IHRydWU7XG4gICAgcHJpdmF0ZSBtb3VudGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBjb2xsYXRvcjogSW50bC5Db2xsYXRvcjtcbiAgICBwcml2YXRlIHNvcnROYW1lcyA9IG5ldyBNYXA8Um9vbU1lbWJlciwgc3RyaW5nPigpOyAvLyBSb29tTWVtYmVyIC0+IHNvcnROYW1lXG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpLmhhc0xhenlMb2FkTWVtYmVyc0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgLy8gc2hvdyBhbiBlbXB0eSBsaXN0XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5nZXRNZW1iZXJzU3RhdGUoW10pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuZ2V0TWVtYmVyc1N0YXRlKHRoaXMucm9vbU1lbWJlcnMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjbGkub24oQ2xpZW50RXZlbnQuUm9vbSwgdGhpcy5vblJvb20pOyAvLyBpbnZpdGVzICYgam9pbmluZyBhZnRlciBwZWVrXG4gICAgICAgIGNvbnN0IGVuYWJsZVByZXNlbmNlQnlIc1VybCA9IFNka0NvbmZpZy5nZXQoXCJlbmFibGVfcHJlc2VuY2VfYnlfaHNfdXJsXCIpO1xuICAgICAgICBjb25zdCBoc1VybCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5iYXNlVXJsO1xuICAgICAgICB0aGlzLnNob3dQcmVzZW5jZSA9IGVuYWJsZVByZXNlbmNlQnlIc1VybD8uW2hzVXJsXSA/PyB0cnVlO1xuICAgIH1cblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgdGhpcy5tb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNsaS5oYXNMYXp5TG9hZE1lbWJlcnNFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd01lbWJlcnNBY2NvcmRpbmdUb01lbWJlcnNoaXBXaXRoTEwoKTtcbiAgICAgICAgICAgIGNsaS5vbihSb29tRXZlbnQuTXlNZW1iZXJzaGlwLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuRm9yTWVtYmVyc0NoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbGlzdGVuRm9yTWVtYmVyc0NoYW5nZXMoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY2xpLm9uKFJvb21TdGF0ZUV2ZW50LlVwZGF0ZSwgdGhpcy5vblJvb21TdGF0ZVVwZGF0ZSk7XG4gICAgICAgIGNsaS5vbihSb29tTWVtYmVyRXZlbnQuTmFtZSwgdGhpcy5vblJvb21NZW1iZXJOYW1lKTtcbiAgICAgICAgY2xpLm9uKFJvb21TdGF0ZUV2ZW50LkV2ZW50cywgdGhpcy5vblJvb21TdGF0ZUV2ZW50KTtcbiAgICAgICAgLy8gV2UgbGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBsYXN0UHJlc2VuY2VUcyB3aGljaCBpcyBlc3NlbnRpYWxseVxuICAgICAgICAvLyBsaXN0ZW5pbmcgZm9yIGFsbCBwcmVzZW5jZSBldmVudHMgKHdlIGRpc3BsYXkgbW9zdCBvZiBub3QgYWxsIG9mXG4gICAgICAgIC8vIHRoZSBpbmZvcm1hdGlvbiBjb250YWluZWQgaW4gcHJlc2VuY2UgZXZlbnRzKS5cbiAgICAgICAgY2xpLm9uKFVzZXJFdmVudC5MYXN0UHJlc2VuY2VUcywgdGhpcy5vblVzZXJQcmVzZW5jZUNoYW5nZSk7XG4gICAgICAgIGNsaS5vbihVc2VyRXZlbnQuUHJlc2VuY2UsIHRoaXMub25Vc2VyUHJlc2VuY2VDaGFuZ2UpO1xuICAgICAgICBjbGkub24oVXNlckV2ZW50LkN1cnJlbnRseUFjdGl2ZSwgdGhpcy5vblVzZXJQcmVzZW5jZUNoYW5nZSk7XG4gICAgICAgIC8vIGNsaS5vbihcIlJvb20udGltZWxpbmVcIiwgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMubW91bnRlZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChjbGkpIHtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihSb29tU3RhdGVFdmVudC5VcGRhdGUsIHRoaXMub25Sb29tU3RhdGVVcGRhdGUpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFJvb21NZW1iZXJFdmVudC5OYW1lLCB0aGlzLm9uUm9vbU1lbWJlck5hbWUpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFJvb21TdGF0ZUV2ZW50LkV2ZW50cywgdGhpcy5vblJvb21TdGF0ZUV2ZW50KTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihDbGllbnRFdmVudC5Sb29tLCB0aGlzLm9uUm9vbSk7XG4gICAgICAgICAgICBjbGkucmVtb3ZlTGlzdGVuZXIoVXNlckV2ZW50Lkxhc3RQcmVzZW5jZVRzLCB0aGlzLm9uVXNlclByZXNlbmNlQ2hhbmdlKTtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcihVc2VyRXZlbnQuUHJlc2VuY2UsIHRoaXMub25Vc2VyUHJlc2VuY2VDaGFuZ2UpO1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFVzZXJFdmVudC5DdXJyZW50bHlBY3RpdmUsIHRoaXMub25Vc2VyUHJlc2VuY2VDaGFuZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FuY2VsIGFueSBwZW5kaW5nIGNhbGxzIHRvIHRoZSByYXRlX2xpbWl0ZWRfZnVuY3NcbiAgICAgICAgdGhpcy51cGRhdGVMaXN0LmNhbmNlbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIGxhenkgbG9hZGluZyBpcyBlbmFibGVkLCBlaXRoZXI6XG4gICAgICogc2hvdyBhIHNwaW5uZXIgYW5kIGxvYWQgdGhlIG1lbWJlcnMgaWYgdGhlIHVzZXIgaXMgam9pbmVkLFxuICAgICAqIG9yIHNob3cgdGhlIG1lbWJlcnMgYXZhaWxhYmxlIHNvIGZhciBpZiB0aGUgdXNlciBpcyBpbnZpdGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBzaG93TWVtYmVyc0FjY29yZGluZ1RvTWVtYmVyc2hpcFdpdGhMTCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpLmhhc0xhenlMb2FkTWVtYmVyc0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlcnNoaXAgPSByb29tICYmIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCk7XG4gICAgICAgICAgICBpZiAobWVtYmVyc2hpcCA9PT0gXCJqb2luXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCByb29tLmxvYWRNZW1iZXJzSWZOZWVkZWQoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkgey8qIGFscmVhZHkgbG9nZ2VkIGluIFJvb21WaWV3ICovfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldE1lbWJlcnNTdGF0ZSh0aGlzLnJvb21NZW1iZXJzKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0ZW5Gb3JNZW1iZXJzQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gc2hvdyB0aGUgbWVtYmVycyB3ZSBhbHJlYWR5IGhhdmUgbG9hZGVkXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldE1lbWJlcnNTdGF0ZSh0aGlzLnJvb21NZW1iZXJzKCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGNhbkludml0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICByb29tPy5jYW5JbnZpdGUoY2xpLmdldFVzZXJJZCgpKSB8fFxuICAgICAgICAgICAgKHJvb20/LmlzU3BhY2VSb29tKCkgJiYgcm9vbS5nZXRKb2luUnVsZSgpID09PSBKb2luUnVsZS5QdWJsaWMpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNZW1iZXJzU3RhdGUobWVtYmVyczogQXJyYXk8Um9vbU1lbWJlcj4pOiBJU3RhdGUge1xuICAgICAgICAvLyBzZXQgdGhlIHN0YXRlIGFmdGVyIGRldGVybWluaW5nIHNob3dQcmVzZW5jZSB0byBtYWtlIHN1cmUgaXQnc1xuICAgICAgICAvLyB0YWtlbiBpbnRvIGFjY291bnQgd2hpbGUgcmVuZGVyaW5nXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIG1lbWJlcnM6IG1lbWJlcnMsXG4gICAgICAgICAgICBmaWx0ZXJlZEpvaW5lZE1lbWJlcnM6IHRoaXMuZmlsdGVyTWVtYmVycyhtZW1iZXJzLCAnam9pbicsIHRoaXMucHJvcHMuc2VhcmNoUXVlcnkpLFxuICAgICAgICAgICAgZmlsdGVyZWRJbnZpdGVkTWVtYmVyczogdGhpcy5maWx0ZXJNZW1iZXJzKG1lbWJlcnMsICdpbnZpdGUnLCB0aGlzLnByb3BzLnNlYXJjaFF1ZXJ5KSxcbiAgICAgICAgICAgIGNhbkludml0ZTogdGhpcy5jYW5JbnZpdGUsXG5cbiAgICAgICAgICAgIC8vIGlkZWFsbHkgd2UnZCBzaXplIHRoaXMgdG8gdGhlIHBhZ2UgaGVpZ2h0LCBidXRcbiAgICAgICAgICAgIC8vIGluIHByYWN0aWNlIEkgZmluZCB0aGF0IGEgbGl0dGxlIGNvbnN0cmFpbmluZ1xuICAgICAgICAgICAgdHJ1bmNhdGVBdEpvaW5lZDogSU5JVElBTF9MT0FEX05VTV9NRU1CRVJTLFxuICAgICAgICAgICAgdHJ1bmNhdGVBdEludml0ZWQ6IElOSVRJQUxfTE9BRF9OVU1fSU5WSVRFRCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVXNlclByZXNlbmNlQ2hhbmdlID0gKGV2ZW50OiBNYXRyaXhFdmVudCwgdXNlcjogVXNlcik6IHZvaWQgPT4ge1xuICAgICAgICAvLyBBdHRhY2ggYSBTSU5HTEUgbGlzdGVuZXIgZm9yIGdsb2JhbCBwcmVzZW5jZSBjaGFuZ2VzIHRoZW4gbG9jYXRlIHRoZVxuICAgICAgICAvLyBtZW1iZXIgdGlsZSBhbmQgcmUtcmVuZGVyIGl0LiBUaGlzIGlzIG1vcmUgZWZmaWNpZW50IHRoYW4gZXZlcnkgdGlsZVxuICAgICAgICAvLyBldmVyIGF0dGFjaGluZyB0aGVpciBvd24gbGlzdGVuZXIuXG4gICAgICAgIGNvbnN0IHRpbGUgPSB0aGlzLnJlZnNbdXNlci51c2VySWRdO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgR290IHByZXNlbmNlIHVwZGF0ZSBmb3IgJHt1c2VyLnVzZXJJZH0uIGhhc1RpbGU9JHshIXRpbGV9YCk7XG4gICAgICAgIGlmICh0aWxlKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxpc3QoKTsgLy8gcmVvcmRlciB0aGUgbWVtYmVyc2hpcCBsaXN0XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb20gPSAocm9vbTogUm9vbSk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAocm9vbS5yb29tSWQgIT09IHRoaXMucHJvcHMucm9vbUlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgbGlzdGVuIGZvciByb29tIGV2ZW50cyBiZWNhdXNlIHdoZW4gd2UgYWNjZXB0IGFuIGludml0ZVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIHdhaXQgdGlsbCB0aGUgcm9vbSBpcyBmdWxseSBwb3B1bGF0ZWQgd2l0aCBzdGF0ZVxuICAgICAgICAvLyBiZWZvcmUgcmVmcmVzaGluZyB0aGUgbWVtYmVyIGxpc3QgZWxzZSB3ZSBnZXQgYSBzdGFsZSBsaXN0LlxuICAgICAgICB0aGlzLnNob3dNZW1iZXJzQWNjb3JkaW5nVG9NZW1iZXJzaGlwV2l0aExMKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NeU1lbWJlcnNoaXAgPSAocm9vbTogUm9vbSwgbWVtYmVyc2hpcDogc3RyaW5nLCBvbGRNZW1iZXJzaGlwOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHJvb20ucm9vbUlkID09PSB0aGlzLnByb3BzLnJvb21JZCAmJiBtZW1iZXJzaGlwID09PSBcImpvaW5cIikge1xuICAgICAgICAgICAgdGhpcy5zaG93TWVtYmVyc0FjY29yZGluZ1RvTWVtYmVyc2hpcFdpdGhMTCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVVcGRhdGUgPSAoc3RhdGU6IFJvb21TdGF0ZSk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoc3RhdGUucm9vbUlkICE9PSB0aGlzLnByb3BzLnJvb21JZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnVwZGF0ZUxpc3QoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21NZW1iZXJOYW1lID0gKGV2OiBNYXRyaXhFdmVudCwgbWVtYmVyOiBSb29tTWVtYmVyKTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChtZW1iZXIucm9vbUlkICE9PSB0aGlzLnByb3BzLnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlTGlzdCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbVN0YXRlRXZlbnQgPSAoZXZlbnQ6IE1hdHJpeEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChldmVudC5nZXRSb29tSWQoKSA9PT0gdGhpcy5wcm9wcy5yb29tSWQgJiYgZXZlbnQuZ2V0VHlwZSgpID09PSBFdmVudFR5cGUuUm9vbVRoaXJkUGFydHlJbnZpdGUpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGlzdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY2FuSW52aXRlICE9PSB0aGlzLnN0YXRlLmNhbkludml0ZSkgdGhpcy5zZXRTdGF0ZSh7IGNhbkludml0ZTogdGhpcy5jYW5JbnZpdGUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlTGlzdCA9IHRocm90dGxlKCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVMaXN0Tm93KCk7XG4gICAgfSwgNTAwLCB7IGxlYWRpbmc6IHRydWUsIHRyYWlsaW5nOiB0cnVlIH0pO1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVMaXN0Tm93KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBtZW1iZXJzID0gdGhpcy5yb29tTWVtYmVycygpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBtZW1iZXJzOiBtZW1iZXJzLFxuICAgICAgICAgICAgZmlsdGVyZWRKb2luZWRNZW1iZXJzOiB0aGlzLmZpbHRlck1lbWJlcnMobWVtYmVycywgJ2pvaW4nLCB0aGlzLnByb3BzLnNlYXJjaFF1ZXJ5KSxcbiAgICAgICAgICAgIGZpbHRlcmVkSW52aXRlZE1lbWJlcnM6IHRoaXMuZmlsdGVyTWVtYmVycyhtZW1iZXJzLCAnaW52aXRlJywgdGhpcy5wcm9wcy5zZWFyY2hRdWVyeSksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TWVtYmVyc1dpdGhVc2VyKCk6IEFycmF5PFJvb21NZW1iZXI+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnJvb21JZCkgcmV0dXJuIFtdO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGlmICghcm9vbSkgcmV0dXJuIFtdO1xuXG4gICAgICAgIGNvbnN0IGFsbE1lbWJlcnMgPSBPYmplY3QudmFsdWVzKHJvb20uY3VycmVudFN0YXRlLm1lbWJlcnMpO1xuXG4gICAgICAgIGFsbE1lbWJlcnMuZm9yRWFjaCgobWVtYmVyKSA9PiB7XG4gICAgICAgICAgICAvLyB3b3JrIGFyb3VuZCBhIHJhY2Ugd2hlcmUgeW91IG1pZ2h0IGhhdmUgYSByb29tIG1lbWJlciBvYmplY3RcbiAgICAgICAgICAgIC8vIGJlZm9yZSB0aGUgdXNlciBvYmplY3QgZXhpc3RzLiBUaGlzIG1heSBvciBtYXkgbm90IGNhdXNlXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL3ZlY3Rvci13ZWIvaXNzdWVzLzE4NlxuICAgICAgICAgICAgaWYgKCFtZW1iZXIudXNlcikge1xuICAgICAgICAgICAgICAgIG1lbWJlci51c2VyID0gY2xpLmdldFVzZXIobWVtYmVyLnVzZXJJZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc29ydE5hbWVzLnNldChcbiAgICAgICAgICAgICAgICBtZW1iZXIsXG4gICAgICAgICAgICAgICAgKG1lbWJlci5uYW1lWzBdID09PSAnQCcgPyBtZW1iZXIubmFtZS5zbGljZSgxKSA6IG1lbWJlci5uYW1lKS5yZXBsYWNlKFNPUlRfUkVHRVgsIFwiXCIpLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gWFhYOiB0aGlzIHVzZXIgbWF5IGhhdmUgbm8gbGFzdFByZXNlbmNlVHMgdmFsdWUhXG4gICAgICAgICAgICAvLyB0aGUgcmlnaHQgc29sdXRpb24gaGVyZSBpcyB0byBmaXggdGhlIHJhY2UgcmF0aGVyIHRoYW4gbGVhdmUgaXQgYXMgMFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYWxsTWVtYmVycztcbiAgICB9XG5cbiAgICBwcml2YXRlIHJvb21NZW1iZXJzKCk6IEFycmF5PFJvb21NZW1iZXI+IHtcbiAgICAgICAgY29uc3QgYWxsTWVtYmVycyA9IHRoaXMuZ2V0TWVtYmVyc1dpdGhVc2VyKCk7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkQW5kU29ydGVkTWVtYmVycyA9IGFsbE1lbWJlcnMuZmlsdGVyKChtKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIG0ubWVtYmVyc2hpcCA9PT0gJ2pvaW4nIHx8IG0ubWVtYmVyc2hpcCA9PT0gJ2ludml0ZSdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBsYW5ndWFnZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsYW5ndWFnZVwiKTtcbiAgICAgICAgdGhpcy5jb2xsYXRvciA9IG5ldyBJbnRsLkNvbGxhdG9yKGxhbmd1YWdlLCB7IHNlbnNpdGl2aXR5OiAnYmFzZScsIGlnbm9yZVB1bmN0dWF0aW9uOiBmYWxzZSB9KTtcbiAgICAgICAgZmlsdGVyZWRBbmRTb3J0ZWRNZW1iZXJzLnNvcnQodGhpcy5tZW1iZXJTb3J0KTtcbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkQW5kU29ydGVkTWVtYmVycztcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZU92ZXJmbG93VGlsZUpvaW5lZCA9IChvdmVyZmxvd0NvdW50OiBudW1iZXIsIHRvdGFsQ291bnQ6IG51bWJlcik6IEpTWC5FbGVtZW50ID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlT3ZlcmZsb3dUaWxlKG92ZXJmbG93Q291bnQsIHRvdGFsQ291bnQsIHRoaXMuc2hvd01vcmVKb2luZWRNZW1iZXJMaXN0KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjcmVhdGVPdmVyZmxvd1RpbGVJbnZpdGVkID0gKG92ZXJmbG93Q291bnQ6IG51bWJlciwgdG90YWxDb3VudDogbnVtYmVyKTogSlNYLkVsZW1lbnQgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVPdmVyZmxvd1RpbGUob3ZlcmZsb3dDb3VudCwgdG90YWxDb3VudCwgdGhpcy5zaG93TW9yZUludml0ZWRNZW1iZXJMaXN0KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjcmVhdGVPdmVyZmxvd1RpbGUgPSAob3ZlcmZsb3dDb3VudDogbnVtYmVyLCB0b3RhbENvdW50OiBudW1iZXIsIG9uQ2xpY2s6ICgpID0+IHZvaWQpOiBKU1guRWxlbWVudCA9PiB7XG4gICAgICAgIC8vIEZvciBub3cgd2UnbGwgcHJldGVuZCB0aGlzIGlzIGFueSBlbnRpdHkuIEl0IHNob3VsZCBwcm9iYWJseSBiZSBhIHNlcGFyYXRlIHRpbGUuXG4gICAgICAgIGNvbnN0IHRleHQgPSBfdChcImFuZCAlKGNvdW50KXMgb3RoZXJzLi4uXCIsIHsgY291bnQ6IG92ZXJmbG93Q291bnQgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RW50aXR5VGlsZVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0VudGl0eVRpbGVfZWxsaXBzaXNcIlxuICAgICAgICAgICAgICAgIGF2YXRhckpzeD17XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyIHVybD17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxsaXBzaXMuc3ZnXCIpLmRlZmF1bHR9IG5hbWU9XCIuLi5cIiB3aWR0aD17MzZ9IGhlaWdodD17MzZ9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5hbWU9e3RleHR9XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VTdGF0ZT1cIm9ubGluZVwiXG4gICAgICAgICAgICAgICAgc3VwcHJlc3NPbkhvdmVyPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNob3dNb3JlSm9pbmVkTWVtYmVyTGlzdCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cnVuY2F0ZUF0Sm9pbmVkOiB0aGlzLnN0YXRlLnRydW5jYXRlQXRKb2luZWQgKyBTSE9XX01PUkVfSU5DUkVNRU5ULFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzaG93TW9yZUludml0ZWRNZW1iZXJMaXN0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRydW5jYXRlQXRJbnZpdGVkOiB0aGlzLnN0YXRlLnRydW5jYXRlQXRJbnZpdGVkICsgU0hPV19NT1JFX0lOQ1JFTUVOVCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNIT1VMRCBPTkxZIEJFIFVTRUQgQlkgVEVTVFNcbiAgICAgKi9cbiAgICBwdWJsaWMgbWVtYmVyU3RyaW5nKG1lbWJlcjogUm9vbU1lbWJlcik6IHN0cmluZyB7XG4gICAgICAgIGlmICghbWVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIobnVsbClcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHUgPSBtZW1iZXIudXNlcjtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgXCIoXCIgK1xuICAgICAgICAgICAgICAgIG1lbWJlci5uYW1lICtcbiAgICAgICAgICAgICAgICBcIiwgXCIgK1xuICAgICAgICAgICAgICAgIG1lbWJlci5wb3dlckxldmVsICtcbiAgICAgICAgICAgICAgICBcIiwgXCIgK1xuICAgICAgICAgICAgICAgICh1ID8gdS5sYXN0QWN0aXZlQWdvIDogXCI8bnVsbD5cIikgK1xuICAgICAgICAgICAgICAgIFwiLCBcIiArXG4gICAgICAgICAgICAgICAgKHUgPyB1LmdldExhc3RBY3RpdmVUcygpIDogXCI8bnVsbD5cIikgK1xuICAgICAgICAgICAgICAgIFwiLCBcIiArXG4gICAgICAgICAgICAgICAgKHUgPyB1LmN1cnJlbnRseUFjdGl2ZSA6IFwiPG51bGw+XCIpICtcbiAgICAgICAgICAgICAgICBcIiwgXCIgK1xuICAgICAgICAgICAgICAgICh1ID8gdS5wcmVzZW5jZSA6IFwiPG51bGw+XCIpICtcbiAgICAgICAgICAgICAgICBcIilcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybnMgbmVnYXRpdmUgaWYgYSBjb21lcyBiZWZvcmUgYixcbiAgICAvLyByZXR1cm5zIDAgaWYgYSBhbmQgYiBhcmUgZXF1aXZhbGVudCBpbiBvcmRlcmluZ1xuICAgIC8vIHJldHVybnMgcG9zaXRpdmUgaWYgYSBjb21lcyBhZnRlciBiLlxuICAgIHByaXZhdGUgbWVtYmVyU29ydCA9IChtZW1iZXJBOiBSb29tTWVtYmVyLCBtZW1iZXJCOiBSb29tTWVtYmVyKTogbnVtYmVyID0+IHtcbiAgICAgICAgLy8gb3JkZXIgYnkgcHJlc2VuY2UsIHdpdGggXCJhY3RpdmUgbm93XCIgZmlyc3QuXG4gICAgICAgIC8vIC4uLmFuZCB0aGVuIGJ5IHBvd2VyIGxldmVsXG4gICAgICAgIC8vIC4uLmFuZCB0aGVuIGJ5IGxhc3QgYWN0aXZlXG4gICAgICAgIC8vIC4uLmFuZCB0aGVuIGFscGhhYmV0aWNhbGx5LlxuICAgICAgICAvLyBXZSBjb3VsZCB0aWVicmVhayBpbnN0ZWFkIGJ5IFwibGFzdCByZWNlbnRseSBzcG9rZW4gaW4gdGhpcyByb29tXCIgaWYgd2Ugd2FudGVkIHRvLlxuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBDb21wYXJpbmcgdXNlckE9JHt0aGlzLm1lbWJlclN0cmluZyhtZW1iZXJBKX0gdXNlckI9JHt0aGlzLm1lbWJlclN0cmluZyhtZW1iZXJCKX1gKTtcblxuICAgICAgICBjb25zdCB1c2VyQSA9IG1lbWJlckEudXNlcjtcbiAgICAgICAgY29uc3QgdXNlckIgPSBtZW1iZXJCLnVzZXI7XG5cbiAgICAgICAgLy8gaWYgKCF1c2VyQSkgY29uc29sZS5sb2coXCIhISBNSVNTSU5HIFVTRVIgRk9SIEEtU0lERTogXCIgKyBtZW1iZXJBLm5hbWUgKyBcIiAhIVwiKTtcbiAgICAgICAgLy8gaWYgKCF1c2VyQikgY29uc29sZS5sb2coXCIhISBNSVNTSU5HIFVTRVIgRk9SIEItU0lERTogXCIgKyBtZW1iZXJCLm5hbWUgKyBcIiAhIVwiKTtcblxuICAgICAgICBpZiAoIXVzZXJBICYmICF1c2VyQikgcmV0dXJuIDA7XG4gICAgICAgIGlmICh1c2VyQSAmJiAhdXNlckIpIHJldHVybiAtMTtcbiAgICAgICAgaWYgKCF1c2VyQSAmJiB1c2VyQikgcmV0dXJuIDE7XG5cbiAgICAgICAgLy8gRmlyc3QgYnkgcHJlc2VuY2VcbiAgICAgICAgaWYgKHRoaXMuc2hvd1ByZXNlbmNlKSB7XG4gICAgICAgICAgICBjb25zdCBjb252ZXJ0UHJlc2VuY2UgPSAocCkgPT4gcCA9PT0gJ3VuYXZhaWxhYmxlJyA/ICdvbmxpbmUnIDogcDtcbiAgICAgICAgICAgIGNvbnN0IHByZXNlbmNlSW5kZXggPSBwID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBvcmRlciA9IFsnYWN0aXZlJywgJ29ubGluZScsICdvZmZsaW5lJ107XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gb3JkZXIuaW5kZXhPZihjb252ZXJ0UHJlc2VuY2UocCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZHggPT09IC0xID8gb3JkZXIubGVuZ3RoIDogaWR4OyAvLyB1bmtub3duIHN0YXRlcyBhdCB0aGUgZW5kXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBpZHhBID0gcHJlc2VuY2VJbmRleCh1c2VyQS5jdXJyZW50bHlBY3RpdmUgPyAnYWN0aXZlJyA6IHVzZXJBLnByZXNlbmNlKTtcbiAgICAgICAgICAgIGNvbnN0IGlkeEIgPSBwcmVzZW5jZUluZGV4KHVzZXJCLmN1cnJlbnRseUFjdGl2ZSA/ICdhY3RpdmUnIDogdXNlckIucHJlc2VuY2UpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYHVzZXJBX3ByZXNlbmNlR3JvdXA9JHtpZHhBfSB1c2VyQl9wcmVzZW5jZUdyb3VwPSR7aWR4Qn1gKTtcbiAgICAgICAgICAgIGlmIChpZHhBICE9PSBpZHhCKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJDb21wYXJpbmcgb24gcHJlc2VuY2UgZ3JvdXAgLSByZXR1cm5pbmdcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkeEEgLSBpZHhCO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2Vjb25kIGJ5IHBvd2VyIGxldmVsXG4gICAgICAgIGlmIChtZW1iZXJBLnBvd2VyTGV2ZWwgIT09IG1lbWJlckIucG93ZXJMZXZlbCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJDb21wYXJpbmcgb24gcG93ZXIgbGV2ZWwgLSByZXR1cm5pbmdcIik7XG4gICAgICAgICAgICByZXR1cm4gbWVtYmVyQi5wb3dlckxldmVsIC0gbWVtYmVyQS5wb3dlckxldmVsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcmQgYnkgbGFzdCBhY3RpdmVcbiAgICAgICAgaWYgKHRoaXMuc2hvd1ByZXNlbmNlICYmIHVzZXJBLmdldExhc3RBY3RpdmVUcygpICE9PSB1c2VyQi5nZXRMYXN0QWN0aXZlVHMoKSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJDb21wYXJpbmcgb24gbGFzdCBhY3RpdmUgdGltZXN0YW1wIC0gcmV0dXJuaW5nXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHVzZXJCLmdldExhc3RBY3RpdmVUcygpIC0gdXNlckEuZ2V0TGFzdEFjdGl2ZVRzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3VydGggYnkgbmFtZSAoYWxwaGFiZXRpY2FsKVxuICAgICAgICByZXR1cm4gdGhpcy5jb2xsYXRvci5jb21wYXJlKHRoaXMuc29ydE5hbWVzLmdldChtZW1iZXJBKSwgdGhpcy5zb3J0TmFtZXMuZ2V0KG1lbWJlckIpKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNlYXJjaFF1ZXJ5Q2hhbmdlZCA9IChzZWFyY2hRdWVyeTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25TZWFyY2hRdWVyeUNoYW5nZWQoc2VhcmNoUXVlcnkpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGZpbHRlcmVkSm9pbmVkTWVtYmVyczogdGhpcy5maWx0ZXJNZW1iZXJzKHRoaXMuc3RhdGUubWVtYmVycywgJ2pvaW4nLCBzZWFyY2hRdWVyeSksXG4gICAgICAgICAgICBmaWx0ZXJlZEludml0ZWRNZW1iZXJzOiB0aGlzLmZpbHRlck1lbWJlcnModGhpcy5zdGF0ZS5tZW1iZXJzLCAnaW52aXRlJywgc2VhcmNoUXVlcnkpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBlbmRpbmczcGlkSW52aXRlQ2xpY2sgPSAoaW52aXRlRXZlbnQ6IE1hdHJpeEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3XzNwaWRfaW52aXRlJyxcbiAgICAgICAgICAgIGV2ZW50OiBpbnZpdGVFdmVudCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZmlsdGVyTWVtYmVycyhtZW1iZXJzOiBBcnJheTxSb29tTWVtYmVyPiwgbWVtYmVyc2hpcDogc3RyaW5nLCBxdWVyeT86IHN0cmluZyk6IEFycmF5PFJvb21NZW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIG1lbWJlcnMuZmlsdGVyKChtKSA9PiB7XG4gICAgICAgICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlc05hbWUgPSBtLm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlc0lkID0gbS51c2VySWQudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSAhPT0gLTE7XG5cbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZXNOYW1lICYmICFtYXRjaGVzSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG0ubWVtYmVyc2hpcCA9PT0gbWVtYmVyc2hpcDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRQZW5kaW5nM1BpZEludml0ZXMoKTogQXJyYXk8TWF0cml4RXZlbnQ+IHtcbiAgICAgICAgLy8gaW5jbHVkZSAzcGlkIGludml0ZXMgKG0ucm9vbS50aGlyZF9wYXJ0eV9pbnZpdGUpIHN0YXRlIGV2ZW50cy5cbiAgICAgICAgLy8gVGhlIEhTIG1heSBoYXZlIGFscmVhZHkgY29udmVydGVkIHRoZXNlIGludG8gbS5yb29tLm1lbWJlciBpbnZpdGVzIHNvXG4gICAgICAgIC8vIHdlIHNob3VsZG4ndCBhZGQgdGhlbSBpZiB0aGUgM3BpZCBpbnZpdGUgc3RhdGUga2V5ICh0b2tlbikgaXMgaW4gdGhlXG4gICAgICAgIC8vIG1lbWJlciBpbnZpdGUgKGNvbnRlbnQudGhpcmRfcGFydHlfaW52aXRlLnNpZ25lZC50b2tlbilcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcblxuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnRoaXJkX3BhcnR5X2ludml0ZVwiKS5maWx0ZXIoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZDNwaWRJbnZpdGUoZSkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIGRpc2NhcmQgYWxsIGludml0ZXMgd2hpY2ggaGF2ZSBhIG0ucm9vbS5tZW1iZXIgZXZlbnQgc2luY2Ugd2UndmVcbiAgICAgICAgICAgICAgICAvLyBhbHJlYWR5IGFkZGVkIHRoZW0uXG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRJbnZpdGVGb3JUaHJlZVBpZFRva2VuKGUuZ2V0U3RhdGVLZXkoKSk7XG4gICAgICAgICAgICAgICAgaWYgKG1lbWJlckV2ZW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbWFrZU1lbWJlclRpbGVzKG1lbWJlcnM6IEFycmF5PFJvb21NZW1iZXIgfCBNYXRyaXhFdmVudD4pIHtcbiAgICAgICAgcmV0dXJuIG1lbWJlcnMubWFwKChtKSA9PiB7XG4gICAgICAgICAgICBpZiAobSBpbnN0YW5jZW9mIFJvb21NZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAvLyBJcyBhIE1hdHJpeCBpbnZpdGVcbiAgICAgICAgICAgICAgICByZXR1cm4gPE1lbWJlclRpbGUga2V5PXttLnVzZXJJZH0gbWVtYmVyPXttfSByZWY9e20udXNlcklkfSBzaG93UHJlc2VuY2U9e3RoaXMuc2hvd1ByZXNlbmNlfSAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSXMgYSAzcGlkIGludml0ZVxuICAgICAgICAgICAgICAgIHJldHVybiA8RW50aXR5VGlsZVxuICAgICAgICAgICAgICAgICAgICBrZXk9e20uZ2V0U3RhdGVLZXkoKX1cbiAgICAgICAgICAgICAgICAgICAgbmFtZT17bS5nZXRDb250ZW50KCkuZGlzcGxheV9uYW1lfVxuICAgICAgICAgICAgICAgICAgICBzdXBwcmVzc09uSG92ZXI9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMub25QZW5kaW5nM3BpZEludml0ZUNsaWNrKG0pfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoaWxkcmVuSm9pbmVkID0gKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogQXJyYXk8SlNYLkVsZW1lbnQ+ID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZU1lbWJlclRpbGVzKHRoaXMuc3RhdGUuZmlsdGVyZWRKb2luZWRNZW1iZXJzLnNsaWNlKHN0YXJ0LCBlbmQpKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRDaGlsZENvdW50Sm9pbmVkID0gKCk6IG51bWJlciA9PiB0aGlzLnN0YXRlLmZpbHRlcmVkSm9pbmVkTWVtYmVycy5sZW5ndGg7XG5cbiAgICBwcml2YXRlIGdldENoaWxkcmVuSW52aXRlZCA9IChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IEFycmF5PEpTWC5FbGVtZW50PiA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRzID0gdGhpcy5zdGF0ZS5maWx0ZXJlZEludml0ZWRNZW1iZXJzO1xuICAgICAgICBpZiAoZW5kID4gdGhpcy5zdGF0ZS5maWx0ZXJlZEludml0ZWRNZW1iZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGFyZ2V0cyA9IHRhcmdldHMuY29uY2F0KHRoaXMuZ2V0UGVuZGluZzNQaWRJbnZpdGVzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZU1lbWJlclRpbGVzKHRhcmdldHMuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldENoaWxkQ291bnRJbnZpdGVkID0gKCk6IG51bWJlciA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmZpbHRlcmVkSW52aXRlZE1lbWJlcnMubGVuZ3RoICsgKHRoaXMuZ2V0UGVuZGluZzNQaWRJbnZpdGVzKCkgfHwgW10pLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gPEJhc2VDYXJkXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVtYmVyTGlzdFwiXG4gICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5wcm9wcy5vbkNsb3NlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICA8L0Jhc2VDYXJkPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgbGV0IGludml0ZUJ1dHRvbjtcblxuICAgICAgICBpZiAocm9vbT8uZ2V0TXlNZW1iZXJzaGlwKCkgPT09ICdqb2luJyAmJiBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50Lkludml0ZVVzZXJzKSkge1xuICAgICAgICAgICAgbGV0IGludml0ZUJ1dHRvblRleHQgPSBfdChcIkludml0ZSB0byB0aGlzIHJvb21cIik7XG4gICAgICAgICAgICBpZiAocm9vbS5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICAgICAgaW52aXRlQnV0dG9uVGV4dCA9IF90KFwiSW52aXRlIHRvIHRoaXMgc3BhY2VcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGludml0ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X2ludml0ZVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25JbnZpdGVCdXR0b25DbGlja31cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLmNhbkludml0ZX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPnsgaW52aXRlQnV0dG9uVGV4dCB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW52aXRlZEhlYWRlcjtcbiAgICAgICAgbGV0IGludml0ZWRTZWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5nZXRDaGlsZENvdW50SW52aXRlZCgpID4gMCkge1xuICAgICAgICAgICAgaW52aXRlZEhlYWRlciA9IDxoMj57IF90KFwiSW52aXRlZFwiKSB9PC9oMj47XG4gICAgICAgICAgICBpbnZpdGVkU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8VHJ1bmNhdGVkTGlzdFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X3NlY3Rpb24gbXhfTWVtYmVyTGlzdF9pbnZpdGVkXCJcbiAgICAgICAgICAgICAgICAgICAgdHJ1bmNhdGVBdD17dGhpcy5zdGF0ZS50cnVuY2F0ZUF0SW52aXRlZH1cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlT3ZlcmZsb3dFbGVtZW50PXt0aGlzLmNyZWF0ZU92ZXJmbG93VGlsZUludml0ZWR9XG4gICAgICAgICAgICAgICAgICAgIGdldENoaWxkcmVuPXt0aGlzLmdldENoaWxkcmVuSW52aXRlZH1cbiAgICAgICAgICAgICAgICAgICAgZ2V0Q2hpbGRDb3VudD17dGhpcy5nZXRDaGlsZENvdW50SW52aXRlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvb3RlciA9IChcbiAgICAgICAgICAgIDxTZWFyY2hCb3hcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X3F1ZXJ5IG14X3RleHRpbnB1dF9pY29uIG14X3RleHRpbnB1dF9zZWFyY2hcIlxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdCgnRmlsdGVyIHJvb20gbWVtYmVycycpfVxuICAgICAgICAgICAgICAgIG9uU2VhcmNoPXt0aGlzLm9uU2VhcmNoUXVlcnlDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5zZWFyY2hRdWVyeX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IHNjb3BlSGVhZGVyO1xuICAgICAgICBpZiAocm9vbT8uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgc2NvcGVIZWFkZXIgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1JpZ2h0UGFuZWxfc2NvcGVIZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8Um9vbUF2YXRhciByb29tPXtyb29tfSBoZWlnaHQ9ezMyfSB3aWR0aD17MzJ9IC8+XG4gICAgICAgICAgICAgICAgPFJvb21OYW1lIHJvb209e3Jvb219IC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPEJhc2VDYXJkXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0XCJcbiAgICAgICAgICAgIGhlYWRlcj17PFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIHsgc2NvcGVIZWFkZXIgfVxuICAgICAgICAgICAgICAgIHsgaW52aXRlQnV0dG9uIH1cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+fVxuICAgICAgICAgICAgZm9vdGVyPXtmb290ZXJ9XG4gICAgICAgICAgICBvbkNsb3NlPXt0aGlzLnByb3BzLm9uQ2xvc2V9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVtYmVyTGlzdF93cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPFRydW5jYXRlZExpc3RcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVtYmVyTGlzdF9zZWN0aW9uIG14X01lbWJlckxpc3Rfam9pbmVkXCJcbiAgICAgICAgICAgICAgICAgICAgdHJ1bmNhdGVBdD17dGhpcy5zdGF0ZS50cnVuY2F0ZUF0Sm9pbmVkfVxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVPdmVyZmxvd0VsZW1lbnQ9e3RoaXMuY3JlYXRlT3ZlcmZsb3dUaWxlSm9pbmVkfVxuICAgICAgICAgICAgICAgICAgICBnZXRDaGlsZHJlbj17dGhpcy5nZXRDaGlsZHJlbkpvaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgZ2V0Q2hpbGRDb3VudD17dGhpcy5nZXRDaGlsZENvdW50Sm9pbmVkfSAvPlxuICAgICAgICAgICAgICAgIHsgaW52aXRlZEhlYWRlciB9XG4gICAgICAgICAgICAgICAgeyBpbnZpdGVkU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9CYXNlQ2FyZD47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkludml0ZUJ1dHRvbkNsaWNrID0gKGV2OiBCdXR0b25FdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJpZ2h0UGFuZWxNZW1iZXJMaXN0SW52aXRlQnV0dG9uXCIsIGV2KTtcblxuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb3BlbiB0aGUgcm9vbSBpbnZpdGVyXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X2ludml0ZScsXG4gICAgICAgICAgICByb29tSWQ6IHRoaXMucHJvcHMucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICB9O1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW1CQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUNBLE1BQU1BLHdCQUF3QixHQUFHLEVBQWpDO0FBQ0EsTUFBTUMsd0JBQXdCLEdBQUcsQ0FBakM7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxHQUE1QixDLENBRUE7QUFDQTs7QUFDQSxNQUFNQyxVQUFVLEdBQUcsMENBQW5COztBQW1CZSxNQUFNQyxVQUFOLFNBQXlCQyxjQUFBLENBQU1DLFNBQS9CLENBQXlEO0VBSWpCO0VBRW5EQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZSxvREFMSSxJQUtKO0lBQUEsK0NBSkQsS0FJQztJQUFBO0lBQUEsaURBRkMsSUFBSUMsR0FBSixFQUVEO0lBQUEsNERBbUhZLENBQUNDLEtBQUQsRUFBcUJDLElBQXJCLEtBQTBDO01BQ3JFO01BQ0E7TUFDQTtNQUNBLE1BQU1DLElBQUksR0FBRyxLQUFLQyxJQUFMLENBQVVGLElBQUksQ0FBQ0csTUFBZixDQUFiLENBSnFFLENBS3JFOztNQUNBLElBQUlGLElBQUosRUFBVTtRQUNOLEtBQUtHLFVBQUwsR0FETSxDQUNhO01BQ3RCO0lBQ0osQ0E1SGtCO0lBQUEsOENBOEhEQyxJQUFELElBQXNCO01BQ25DLElBQUlBLElBQUksQ0FBQ0MsTUFBTCxLQUFnQixLQUFLVCxLQUFMLENBQVdTLE1BQS9CLEVBQXVDO1FBQ25DO01BQ0gsQ0FIa0MsQ0FJbkM7TUFDQTtNQUNBOzs7TUFDQSxLQUFLQyxzQ0FBTDtJQUNILENBdElrQjtJQUFBLHNEQXdJTSxDQUFDRixJQUFELEVBQWFHLFVBQWIsRUFBaUNDLGFBQWpDLEtBQWlFO01BQ3RGLElBQUlKLElBQUksQ0FBQ0MsTUFBTCxLQUFnQixLQUFLVCxLQUFMLENBQVdTLE1BQTNCLElBQXFDRSxVQUFVLEtBQUssTUFBeEQsRUFBZ0U7UUFDNUQsS0FBS0Qsc0NBQUw7TUFDSDtJQUNKLENBNUlrQjtJQUFBLHlEQThJVUcsS0FBRCxJQUE0QjtNQUNwRCxJQUFJQSxLQUFLLENBQUNKLE1BQU4sS0FBaUIsS0FBS1QsS0FBTCxDQUFXUyxNQUFoQyxFQUF3QztNQUN4QyxLQUFLRixVQUFMO0lBQ0gsQ0FqSmtCO0lBQUEsd0RBbUpRLENBQUNPLEVBQUQsRUFBa0JDLE1BQWxCLEtBQStDO01BQ3RFLElBQUlBLE1BQU0sQ0FBQ04sTUFBUCxLQUFrQixLQUFLVCxLQUFMLENBQVdTLE1BQWpDLEVBQXlDO1FBQ3JDO01BQ0g7O01BQ0QsS0FBS0YsVUFBTDtJQUNILENBeEprQjtJQUFBLHdEQTBKU0wsS0FBRCxJQUE4QjtNQUNyRCxJQUFJQSxLQUFLLENBQUNjLFNBQU4sT0FBc0IsS0FBS2hCLEtBQUwsQ0FBV1MsTUFBakMsSUFBMkNQLEtBQUssQ0FBQ2UsT0FBTixPQUFvQkMsZ0JBQUEsQ0FBVUMsb0JBQTdFLEVBQW1HO1FBQy9GLEtBQUtaLFVBQUw7TUFDSDs7TUFFRCxJQUFJLEtBQUthLFNBQUwsS0FBbUIsS0FBS1AsS0FBTCxDQUFXTyxTQUFsQyxFQUE2QyxLQUFLQyxRQUFMLENBQWM7UUFBRUQsU0FBUyxFQUFFLEtBQUtBO01BQWxCLENBQWQ7SUFDaEQsQ0FoS2tCO0lBQUEsa0RBa0tFLElBQUFFLGdCQUFBLEVBQVMsTUFBTTtNQUNoQyxLQUFLQyxhQUFMO0lBQ0gsQ0FGb0IsRUFFbEIsR0FGa0IsRUFFYjtNQUFFQyxPQUFPLEVBQUUsSUFBWDtNQUFpQkMsUUFBUSxFQUFFO0lBQTNCLENBRmEsQ0FsS0Y7SUFBQSxnRUEwTmdCLENBQUNDLGFBQUQsRUFBd0JDLFVBQXhCLEtBQTREO01BQzNGLE9BQU8sS0FBS0Msa0JBQUwsQ0FBd0JGLGFBQXhCLEVBQXVDQyxVQUF2QyxFQUFtRCxLQUFLRSx3QkFBeEQsQ0FBUDtJQUNILENBNU5rQjtJQUFBLGlFQThOaUIsQ0FBQ0gsYUFBRCxFQUF3QkMsVUFBeEIsS0FBNEQ7TUFDNUYsT0FBTyxLQUFLQyxrQkFBTCxDQUF3QkYsYUFBeEIsRUFBdUNDLFVBQXZDLEVBQW1ELEtBQUtHLHlCQUF4RCxDQUFQO0lBQ0gsQ0FoT2tCO0lBQUEsMERBa09VLENBQUNKLGFBQUQsRUFBd0JDLFVBQXhCLEVBQTRDSSxPQUE1QyxLQUFpRjtNQUMxRztNQUNBLE1BQU1DLElBQUksR0FBRyxJQUFBQyxtQkFBQSxFQUFHLHlCQUFILEVBQThCO1FBQUVDLEtBQUssRUFBRVI7TUFBVCxDQUE5QixDQUFiO01BQ0Esb0JBQ0ksNkJBQUMsbUJBQUQ7UUFDSSxTQUFTLEVBQUMsd0JBRGQ7UUFFSSxTQUFTLGVBQ0wsNkJBQUMsbUJBQUQ7VUFBWSxHQUFHLEVBQUVTLE9BQU8sQ0FBQyxrQ0FBRCxDQUFQLENBQTRDQyxPQUE3RDtVQUFzRSxJQUFJLEVBQUMsS0FBM0U7VUFBaUYsS0FBSyxFQUFFLEVBQXhGO1VBQTRGLE1BQU0sRUFBRTtRQUFwRyxFQUhSO1FBS0ksSUFBSSxFQUFFSixJQUxWO1FBTUksYUFBYSxFQUFDLFFBTmxCO1FBT0ksZUFBZSxFQUFFLElBUHJCO1FBUUksT0FBTyxFQUFFRDtNQVJiLEVBREo7SUFZSCxDQWpQa0I7SUFBQSxnRUFtUGdCLE1BQVk7TUFDM0MsS0FBS1YsUUFBTCxDQUFjO1FBQ1ZnQixnQkFBZ0IsRUFBRSxLQUFLeEIsS0FBTCxDQUFXd0IsZ0JBQVgsR0FBOEIzQztNQUR0QyxDQUFkO0lBR0gsQ0F2UGtCO0lBQUEsaUVBeVBpQixNQUFZO01BQzVDLEtBQUsyQixRQUFMLENBQWM7UUFDVmlCLGlCQUFpQixFQUFFLEtBQUt6QixLQUFMLENBQVd5QixpQkFBWCxHQUErQjVDO01BRHhDLENBQWQ7SUFHSCxDQTdQa0I7SUFBQSxrREE0UkUsQ0FBQzZDLE9BQUQsRUFBc0JDLE9BQXRCLEtBQXNEO01BQ3ZFO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFFQTtNQUVBLE1BQU1DLEtBQUssR0FBR0YsT0FBTyxDQUFDcEMsSUFBdEI7TUFDQSxNQUFNdUMsS0FBSyxHQUFHRixPQUFPLENBQUNyQyxJQUF0QixDQVZ1RSxDQVl2RTtNQUNBOztNQUVBLElBQUksQ0FBQ3NDLEtBQUQsSUFBVSxDQUFDQyxLQUFmLEVBQXNCLE9BQU8sQ0FBUDtNQUN0QixJQUFJRCxLQUFLLElBQUksQ0FBQ0MsS0FBZCxFQUFxQixPQUFPLENBQUMsQ0FBUjtNQUNyQixJQUFJLENBQUNELEtBQUQsSUFBVUMsS0FBZCxFQUFxQixPQUFPLENBQVAsQ0FqQmtELENBbUJ2RTs7TUFDQSxJQUFJLEtBQUtDLFlBQVQsRUFBdUI7UUFDbkIsTUFBTUMsZUFBZSxHQUFJQyxDQUFELElBQU9BLENBQUMsS0FBSyxhQUFOLEdBQXNCLFFBQXRCLEdBQWlDQSxDQUFoRTs7UUFDQSxNQUFNQyxhQUFhLEdBQUdELENBQUMsSUFBSTtVQUN2QixNQUFNRSxLQUFLLEdBQUcsQ0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQixTQUFyQixDQUFkO1VBQ0EsTUFBTUMsR0FBRyxHQUFHRCxLQUFLLENBQUNFLE9BQU4sQ0FBY0wsZUFBZSxDQUFDQyxDQUFELENBQTdCLENBQVo7VUFDQSxPQUFPRyxHQUFHLEtBQUssQ0FBQyxDQUFULEdBQWFELEtBQUssQ0FBQ0csTUFBbkIsR0FBNEJGLEdBQW5DLENBSHVCLENBR2lCO1FBQzNDLENBSkQ7O1FBTUEsTUFBTUcsSUFBSSxHQUFHTCxhQUFhLENBQUNMLEtBQUssQ0FBQ1csZUFBTixHQUF3QixRQUF4QixHQUFtQ1gsS0FBSyxDQUFDWSxRQUExQyxDQUExQjtRQUNBLE1BQU1DLElBQUksR0FBR1IsYUFBYSxDQUFDSixLQUFLLENBQUNVLGVBQU4sR0FBd0IsUUFBeEIsR0FBbUNWLEtBQUssQ0FBQ1csUUFBMUMsQ0FBMUIsQ0FUbUIsQ0FVbkI7O1FBQ0EsSUFBSUYsSUFBSSxLQUFLRyxJQUFiLEVBQW1CO1VBQ2Y7VUFDQSxPQUFPSCxJQUFJLEdBQUdHLElBQWQ7UUFDSDtNQUNKLENBbkNzRSxDQXFDdkU7OztNQUNBLElBQUlmLE9BQU8sQ0FBQ2dCLFVBQVIsS0FBdUJmLE9BQU8sQ0FBQ2UsVUFBbkMsRUFBK0M7UUFDM0M7UUFDQSxPQUFPZixPQUFPLENBQUNlLFVBQVIsR0FBcUJoQixPQUFPLENBQUNnQixVQUFwQztNQUNILENBekNzRSxDQTJDdkU7OztNQUNBLElBQUksS0FBS1osWUFBTCxJQUFxQkYsS0FBSyxDQUFDZSxlQUFOLE9BQTRCZCxLQUFLLENBQUNjLGVBQU4sRUFBckQsRUFBOEU7UUFDMUU7UUFDQSxPQUFPZCxLQUFLLENBQUNjLGVBQU4sS0FBMEJmLEtBQUssQ0FBQ2UsZUFBTixFQUFqQztNQUNILENBL0NzRSxDQWlEdkU7OztNQUNBLE9BQU8sS0FBS0MsUUFBTCxDQUFjQyxPQUFkLENBQXNCLEtBQUtDLFNBQUwsQ0FBZUMsR0FBZixDQUFtQnJCLE9BQW5CLENBQXRCLEVBQW1ELEtBQUtvQixTQUFMLENBQWVDLEdBQWYsQ0FBbUJwQixPQUFuQixDQUFuRCxDQUFQO0lBQ0gsQ0EvVWtCO0lBQUEsNERBaVZhcUIsV0FBRCxJQUErQjtNQUMxRCxLQUFLN0QsS0FBTCxDQUFXOEQsb0JBQVgsQ0FBZ0NELFdBQWhDO01BQ0EsS0FBS3hDLFFBQUwsQ0FBYztRQUNWMEMscUJBQXFCLEVBQUUsS0FBS0MsYUFBTCxDQUFtQixLQUFLbkQsS0FBTCxDQUFXb0QsT0FBOUIsRUFBdUMsTUFBdkMsRUFBK0NKLFdBQS9DLENBRGI7UUFFVkssc0JBQXNCLEVBQUUsS0FBS0YsYUFBTCxDQUFtQixLQUFLbkQsS0FBTCxDQUFXb0QsT0FBOUIsRUFBdUMsUUFBdkMsRUFBaURKLFdBQWpEO01BRmQsQ0FBZDtJQUlILENBdlZrQjtJQUFBLGdFQXlWaUJNLFdBQUQsSUFBb0M7TUFDbkVDLG1CQUFBLENBQUlDLFFBQUosQ0FBYTtRQUNUQyxNQUFNLEVBQUUsa0JBREM7UUFFVHBFLEtBQUssRUFBRWlFO01BRkUsQ0FBYjtJQUlILENBOVZrQjtJQUFBLHlEQXFaUyxDQUFDSSxLQUFELEVBQWdCQyxHQUFoQixLQUFvRDtNQUM1RSxPQUFPLEtBQUtDLGVBQUwsQ0FBcUIsS0FBSzVELEtBQUwsQ0FBV2tELHFCQUFYLENBQWlDVyxLQUFqQyxDQUF1Q0gsS0FBdkMsRUFBOENDLEdBQTlDLENBQXJCLENBQVA7SUFDSCxDQXZaa0I7SUFBQSwyREF5WlcsTUFBYyxLQUFLM0QsS0FBTCxDQUFXa0QscUJBQVgsQ0FBaUNiLE1BeloxRDtJQUFBLDBEQTJaVSxDQUFDcUIsS0FBRCxFQUFnQkMsR0FBaEIsS0FBb0Q7TUFDN0UsSUFBSUcsT0FBTyxHQUFHLEtBQUs5RCxLQUFMLENBQVdxRCxzQkFBekI7O01BQ0EsSUFBSU0sR0FBRyxHQUFHLEtBQUszRCxLQUFMLENBQVdxRCxzQkFBWCxDQUFrQ2hCLE1BQTVDLEVBQW9EO1FBQ2hEeUIsT0FBTyxHQUFHQSxPQUFPLENBQUNDLE1BQVIsQ0FBZSxLQUFLQyxxQkFBTCxFQUFmLENBQVY7TUFDSDs7TUFFRCxPQUFPLEtBQUtKLGVBQUwsQ0FBcUJFLE9BQU8sQ0FBQ0QsS0FBUixDQUFjSCxLQUFkLEVBQXFCQyxHQUFyQixDQUFyQixDQUFQO0lBQ0gsQ0FsYWtCO0lBQUEsNERBb2FZLE1BQWM7TUFDekMsT0FBTyxLQUFLM0QsS0FBTCxDQUFXcUQsc0JBQVgsQ0FBa0NoQixNQUFsQyxHQUEyQyxDQUFDLEtBQUsyQixxQkFBTCxNQUFnQyxFQUFqQyxFQUFxQzNCLE1BQXZGO0lBQ0gsQ0F0YWtCO0lBQUEsMkRBNmZZcEMsRUFBRCxJQUEyQjtNQUNyRGdFLHdCQUFBLENBQWdCQyxnQkFBaEIsQ0FBaUMscUNBQWpDLEVBQXdFakUsRUFBeEU7O01BRUEsSUFBSWtFLGdDQUFBLENBQWdCcEIsR0FBaEIsR0FBc0JxQixPQUF0QixFQUFKLEVBQXFDO1FBQ2pDYixtQkFBQSxDQUFJQyxRQUFKLENBQWE7VUFBRUMsTUFBTSxFQUFFO1FBQVYsQ0FBYjs7UUFDQTtNQUNILENBTm9ELENBUXJEOzs7TUFDQUYsbUJBQUEsQ0FBSUMsUUFBSixDQUFhO1FBQ1RDLE1BQU0sRUFBRSxhQURDO1FBRVQ3RCxNQUFNLEVBQUUsS0FBS1QsS0FBTCxDQUFXUztNQUZWLENBQWI7SUFJSCxDQTFnQmtCOztJQUdmLE1BQU15RSxHQUFHLEdBQUdGLGdDQUFBLENBQWdCcEIsR0FBaEIsRUFBWjs7SUFDQSxJQUFJc0IsR0FBRyxDQUFDQyx5QkFBSixFQUFKLEVBQXFDO01BQ2pDO01BQ0EsS0FBS3RFLEtBQUwsR0FBYSxLQUFLdUUsZUFBTCxDQUFxQixFQUFyQixDQUFiO0lBQ0gsQ0FIRCxNQUdPO01BQ0gsS0FBS3ZFLEtBQUwsR0FBYSxLQUFLdUUsZUFBTCxDQUFxQixLQUFLQyxXQUFMLEVBQXJCLENBQWI7SUFDSDs7SUFFREgsR0FBRyxDQUFDSSxFQUFKLENBQU9DLG1CQUFBLENBQVlDLElBQW5CLEVBQXlCLEtBQUtDLE1BQTlCLEVBWGUsQ0FXd0I7O0lBQ3ZDLE1BQU1DLHFCQUFxQixHQUFHQyxrQkFBQSxDQUFVL0IsR0FBVixDQUFjLDJCQUFkLENBQTlCOztJQUNBLE1BQU1nQyxLQUFLLEdBQUdaLGdDQUFBLENBQWdCcEIsR0FBaEIsR0FBc0JpQyxPQUFwQzs7SUFDQSxLQUFLbEQsWUFBTCxHQUFvQitDLHFCQUFxQixHQUFHRSxLQUFILENBQXJCLElBQWtDLElBQXREO0VBQ0gsQ0FyQm1FLENBdUJwRTs7O0VBQ0FFLHlCQUF5QixHQUFHO0lBQ3hCLE1BQU1aLEdBQUcsR0FBR0YsZ0NBQUEsQ0FBZ0JwQixHQUFoQixFQUFaOztJQUNBLEtBQUttQyxPQUFMLEdBQWUsSUFBZjs7SUFDQSxJQUFJYixHQUFHLENBQUNDLHlCQUFKLEVBQUosRUFBcUM7TUFDakMsS0FBS3pFLHNDQUFMO01BQ0F3RSxHQUFHLENBQUNJLEVBQUosQ0FBT1UsZUFBQSxDQUFVQyxZQUFqQixFQUErQixLQUFLQyxjQUFwQztJQUNILENBSEQsTUFHTztNQUNILEtBQUtDLHVCQUFMO0lBQ0g7RUFDSjs7RUFFT0EsdUJBQXVCLEdBQVM7SUFDcEMsTUFBTWpCLEdBQUcsR0FBR0YsZ0NBQUEsQ0FBZ0JwQixHQUFoQixFQUFaOztJQUNBc0IsR0FBRyxDQUFDSSxFQUFKLENBQU9jLHlCQUFBLENBQWVDLE1BQXRCLEVBQThCLEtBQUtDLGlCQUFuQztJQUNBcEIsR0FBRyxDQUFDSSxFQUFKLENBQU9pQiwyQkFBQSxDQUFnQkMsSUFBdkIsRUFBNkIsS0FBS0MsZ0JBQWxDO0lBQ0F2QixHQUFHLENBQUNJLEVBQUosQ0FBT2MseUJBQUEsQ0FBZU0sTUFBdEIsRUFBOEIsS0FBS0MsZ0JBQW5DLEVBSm9DLENBS3BDO0lBQ0E7SUFDQTs7SUFDQXpCLEdBQUcsQ0FBQ0ksRUFBSixDQUFPc0IsZUFBQSxDQUFVQyxjQUFqQixFQUFpQyxLQUFLQyxvQkFBdEM7SUFDQTVCLEdBQUcsQ0FBQ0ksRUFBSixDQUFPc0IsZUFBQSxDQUFVRyxRQUFqQixFQUEyQixLQUFLRCxvQkFBaEM7SUFDQTVCLEdBQUcsQ0FBQ0ksRUFBSixDQUFPc0IsZUFBQSxDQUFVSSxlQUFqQixFQUFrQyxLQUFLRixvQkFBdkMsRUFWb0MsQ0FXcEM7RUFDSDs7RUFFREcsb0JBQW9CLEdBQUc7SUFDbkIsS0FBS2xCLE9BQUwsR0FBZSxLQUFmOztJQUNBLE1BQU1iLEdBQUcsR0FBR0YsZ0NBQUEsQ0FBZ0JwQixHQUFoQixFQUFaOztJQUNBLElBQUlzQixHQUFKLEVBQVM7TUFDTEEsR0FBRyxDQUFDZ0MsY0FBSixDQUFtQmQseUJBQUEsQ0FBZUMsTUFBbEMsRUFBMEMsS0FBS0MsaUJBQS9DO01BQ0FwQixHQUFHLENBQUNnQyxjQUFKLENBQW1CWCwyQkFBQSxDQUFnQkMsSUFBbkMsRUFBeUMsS0FBS0MsZ0JBQTlDO01BQ0F2QixHQUFHLENBQUNnQyxjQUFKLENBQW1CbEIsZUFBQSxDQUFVQyxZQUE3QixFQUEyQyxLQUFLQyxjQUFoRDtNQUNBaEIsR0FBRyxDQUFDZ0MsY0FBSixDQUFtQmQseUJBQUEsQ0FBZU0sTUFBbEMsRUFBMEMsS0FBS0MsZ0JBQS9DO01BQ0F6QixHQUFHLENBQUNnQyxjQUFKLENBQW1CM0IsbUJBQUEsQ0FBWUMsSUFBL0IsRUFBcUMsS0FBS0MsTUFBMUM7TUFDQVAsR0FBRyxDQUFDZ0MsY0FBSixDQUFtQk4sZUFBQSxDQUFVQyxjQUE3QixFQUE2QyxLQUFLQyxvQkFBbEQ7TUFDQTVCLEdBQUcsQ0FBQ2dDLGNBQUosQ0FBbUJOLGVBQUEsQ0FBVUcsUUFBN0IsRUFBdUMsS0FBS0Qsb0JBQTVDO01BQ0E1QixHQUFHLENBQUNnQyxjQUFKLENBQW1CTixlQUFBLENBQVVJLGVBQTdCLEVBQThDLEtBQUtGLG9CQUFuRDtJQUNILENBWmtCLENBY25COzs7SUFDQSxLQUFLdkcsVUFBTCxDQUFnQjRHLE1BQWhCO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7RUFDd0QsTUFBdEN6RyxzQ0FBc0MsR0FBa0I7SUFDbEUsTUFBTXdFLEdBQUcsR0FBR0YsZ0NBQUEsQ0FBZ0JwQixHQUFoQixFQUFaOztJQUNBLElBQUlzQixHQUFHLENBQUNDLHlCQUFKLEVBQUosRUFBcUM7TUFDakMsTUFBTUQsR0FBRyxHQUFHRixnQ0FBQSxDQUFnQnBCLEdBQWhCLEVBQVo7O01BQ0EsTUFBTXBELElBQUksR0FBRzBFLEdBQUcsQ0FBQ2tDLE9BQUosQ0FBWSxLQUFLcEgsS0FBTCxDQUFXUyxNQUF2QixDQUFiO01BQ0EsTUFBTUUsVUFBVSxHQUFHSCxJQUFJLElBQUlBLElBQUksQ0FBQzZHLGVBQUwsRUFBM0I7O01BQ0EsSUFBSTFHLFVBQVUsS0FBSyxNQUFuQixFQUEyQjtRQUN2QixLQUFLVSxRQUFMLENBQWM7VUFBRWlHLE9BQU8sRUFBRTtRQUFYLENBQWQ7O1FBQ0EsSUFBSTtVQUNBLE1BQU05RyxJQUFJLENBQUMrRyxtQkFBTCxFQUFOO1FBQ0gsQ0FGRCxDQUVFLE9BQU9DLEVBQVAsRUFBVztVQUFDO1FBQWlDOztRQUMvQyxJQUFJLEtBQUt6QixPQUFULEVBQWtCO1VBQ2QsS0FBSzFFLFFBQUwsQ0FBYyxLQUFLK0QsZUFBTCxDQUFxQixLQUFLQyxXQUFMLEVBQXJCLENBQWQ7VUFDQSxLQUFLYyx1QkFBTDtRQUNIO01BQ0osQ0FURCxNQVNPO1FBQ0g7UUFDQSxLQUFLOUUsUUFBTCxDQUFjLEtBQUsrRCxlQUFMLENBQXFCLEtBQUtDLFdBQUwsRUFBckIsQ0FBZDtNQUNIO0lBQ0o7RUFDSjs7RUFFb0IsSUFBVGpFLFNBQVMsR0FBWTtJQUM3QixNQUFNOEQsR0FBRyxHQUFHRixnQ0FBQSxDQUFnQnBCLEdBQWhCLEVBQVo7O0lBQ0EsTUFBTXBELElBQUksR0FBRzBFLEdBQUcsQ0FBQ2tDLE9BQUosQ0FBWSxLQUFLcEgsS0FBTCxDQUFXUyxNQUF2QixDQUFiO0lBRUEsT0FDSUQsSUFBSSxFQUFFWSxTQUFOLENBQWdCOEQsR0FBRyxDQUFDdUMsU0FBSixFQUFoQixLQUNDakgsSUFBSSxFQUFFa0gsV0FBTixNQUF1QmxILElBQUksQ0FBQ21ILFdBQUwsT0FBdUJDLGtCQUFBLENBQVNDLE1BRjVEO0VBSUg7O0VBRU96QyxlQUFlLENBQUNuQixPQUFELEVBQXFDO0lBQ3hEO0lBQ0E7SUFDQSxPQUFPO01BQ0hxRCxPQUFPLEVBQUUsS0FETjtNQUVIckQsT0FBTyxFQUFFQSxPQUZOO01BR0hGLHFCQUFxQixFQUFFLEtBQUtDLGFBQUwsQ0FBbUJDLE9BQW5CLEVBQTRCLE1BQTVCLEVBQW9DLEtBQUtqRSxLQUFMLENBQVc2RCxXQUEvQyxDQUhwQjtNQUlISyxzQkFBc0IsRUFBRSxLQUFLRixhQUFMLENBQW1CQyxPQUFuQixFQUE0QixRQUE1QixFQUFzQyxLQUFLakUsS0FBTCxDQUFXNkQsV0FBakQsQ0FKckI7TUFLSHpDLFNBQVMsRUFBRSxLQUFLQSxTQUxiO01BT0g7TUFDQTtNQUNBaUIsZ0JBQWdCLEVBQUU3Qyx3QkFUZjtNQVVIOEMsaUJBQWlCLEVBQUU3QztJQVZoQixDQUFQO0VBWUg7O0VBcURPOEIsYUFBYSxHQUFTO0lBQzFCLE1BQU0wQyxPQUFPLEdBQUcsS0FBS29CLFdBQUwsRUFBaEI7SUFFQSxLQUFLaEUsUUFBTCxDQUFjO01BQ1ZpRyxPQUFPLEVBQUUsS0FEQztNQUVWckQsT0FBTyxFQUFFQSxPQUZDO01BR1ZGLHFCQUFxQixFQUFFLEtBQUtDLGFBQUwsQ0FBbUJDLE9BQW5CLEVBQTRCLE1BQTVCLEVBQW9DLEtBQUtqRSxLQUFMLENBQVc2RCxXQUEvQyxDQUhiO01BSVZLLHNCQUFzQixFQUFFLEtBQUtGLGFBQUwsQ0FBbUJDLE9BQW5CLEVBQTRCLFFBQTVCLEVBQXNDLEtBQUtqRSxLQUFMLENBQVc2RCxXQUFqRDtJQUpkLENBQWQ7RUFNSDs7RUFFT2lFLGtCQUFrQixHQUFzQjtJQUM1QyxJQUFJLENBQUMsS0FBSzlILEtBQUwsQ0FBV1MsTUFBaEIsRUFBd0IsT0FBTyxFQUFQOztJQUN4QixNQUFNeUUsR0FBRyxHQUFHRixnQ0FBQSxDQUFnQnBCLEdBQWhCLEVBQVo7O0lBQ0EsTUFBTXBELElBQUksR0FBRzBFLEdBQUcsQ0FBQ2tDLE9BQUosQ0FBWSxLQUFLcEgsS0FBTCxDQUFXUyxNQUF2QixDQUFiO0lBQ0EsSUFBSSxDQUFDRCxJQUFMLEVBQVcsT0FBTyxFQUFQO0lBRVgsTUFBTXVILFVBQVUsR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWN6SCxJQUFJLENBQUMwSCxZQUFMLENBQWtCakUsT0FBaEMsQ0FBbkI7SUFFQThELFVBQVUsQ0FBQ0ksT0FBWCxDQUFvQnBILE1BQUQsSUFBWTtNQUMzQjtNQUNBO01BQ0E7TUFDQSxJQUFJLENBQUNBLE1BQU0sQ0FBQ1osSUFBWixFQUFrQjtRQUNkWSxNQUFNLENBQUNaLElBQVAsR0FBYytFLEdBQUcsQ0FBQ2tELE9BQUosQ0FBWXJILE1BQU0sQ0FBQ1QsTUFBbkIsQ0FBZDtNQUNIOztNQUVELEtBQUtxRCxTQUFMLENBQWUwRSxHQUFmLENBQ0l0SCxNQURKLEVBRUksQ0FBQ0EsTUFBTSxDQUFDdUgsSUFBUCxDQUFZLENBQVosTUFBbUIsR0FBbkIsR0FBeUJ2SCxNQUFNLENBQUN1SCxJQUFQLENBQVk1RCxLQUFaLENBQWtCLENBQWxCLENBQXpCLEdBQWdEM0QsTUFBTSxDQUFDdUgsSUFBeEQsRUFBOERDLE9BQTlELENBQXNFNUksVUFBdEUsRUFBa0YsRUFBbEYsQ0FGSixFQVIyQixDQWEzQjtNQUNBO0lBQ0gsQ0FmRDtJQWlCQSxPQUFPb0ksVUFBUDtFQUNIOztFQUVPMUMsV0FBVyxHQUFzQjtJQUNyQyxNQUFNMEMsVUFBVSxHQUFHLEtBQUtELGtCQUFMLEVBQW5CO0lBQ0EsTUFBTVUsd0JBQXdCLEdBQUdULFVBQVUsQ0FBQ1UsTUFBWCxDQUFtQkMsQ0FBRCxJQUFPO01BQ3RELE9BQ0lBLENBQUMsQ0FBQy9ILFVBQUYsS0FBaUIsTUFBakIsSUFBMkIrSCxDQUFDLENBQUMvSCxVQUFGLEtBQWlCLFFBRGhEO0lBR0gsQ0FKZ0MsQ0FBakM7O0lBS0EsTUFBTWdJLFFBQVEsR0FBR0Msc0JBQUEsQ0FBY0MsUUFBZCxDQUF1QixVQUF2QixDQUFqQjs7SUFDQSxLQUFLcEYsUUFBTCxHQUFnQixJQUFJcUYsSUFBSSxDQUFDQyxRQUFULENBQWtCSixRQUFsQixFQUE0QjtNQUFFSyxXQUFXLEVBQUUsTUFBZjtNQUF1QkMsaUJBQWlCLEVBQUU7SUFBMUMsQ0FBNUIsQ0FBaEI7SUFDQVQsd0JBQXdCLENBQUNVLElBQXpCLENBQThCLEtBQUtDLFVBQW5DO0lBQ0EsT0FBT1gsd0JBQVA7RUFDSDs7RUF1Q0Q7QUFDSjtBQUNBO0VBQ1dZLFlBQVksQ0FBQ3JJLE1BQUQsRUFBNkI7SUFDNUMsSUFBSSxDQUFDQSxNQUFMLEVBQWE7TUFDVCxPQUFPLFFBQVA7SUFDSCxDQUZELE1BRU87TUFDSCxNQUFNc0ksQ0FBQyxHQUFHdEksTUFBTSxDQUFDWixJQUFqQjtNQUNBLE9BQ0ksTUFDQVksTUFBTSxDQUFDdUgsSUFEUCxHQUVBLElBRkEsR0FHQXZILE1BQU0sQ0FBQ3dDLFVBSFAsR0FJQSxJQUpBLElBS0M4RixDQUFDLEdBQUdBLENBQUMsQ0FBQ0MsYUFBTCxHQUFxQixRQUx2QixJQU1BLElBTkEsSUFPQ0QsQ0FBQyxHQUFHQSxDQUFDLENBQUM3RixlQUFGLEVBQUgsR0FBeUIsUUFQM0IsSUFRQSxJQVJBLElBU0M2RixDQUFDLEdBQUdBLENBQUMsQ0FBQ2pHLGVBQUwsR0FBdUIsUUFUekIsSUFVQSxJQVZBLElBV0NpRyxDQUFDLEdBQUdBLENBQUMsQ0FBQ2hHLFFBQUwsR0FBZ0IsUUFYbEIsSUFZQSxHQWJKO0lBZUg7RUFDSixDQTdSbUUsQ0ErUnBFO0VBQ0E7RUFDQTs7O0VBcUVRVyxhQUFhLENBQUNDLE9BQUQsRUFBNkJ0RCxVQUE3QixFQUFpRDRJLEtBQWpELEVBQW9GO0lBQ3JHLE9BQU90RixPQUFPLENBQUN3RSxNQUFSLENBQWdCQyxDQUFELElBQU87TUFDekIsSUFBSWEsS0FBSixFQUFXO1FBQ1BBLEtBQUssR0FBR0EsS0FBSyxDQUFDQyxXQUFOLEVBQVI7UUFDQSxNQUFNQyxXQUFXLEdBQUdmLENBQUMsQ0FBQ0osSUFBRixDQUFPa0IsV0FBUCxHQUFxQnZHLE9BQXJCLENBQTZCc0csS0FBN0IsTUFBd0MsQ0FBQyxDQUE3RDtRQUNBLE1BQU1HLFNBQVMsR0FBR2hCLENBQUMsQ0FBQ3BJLE1BQUYsQ0FBU2tKLFdBQVQsR0FBdUJ2RyxPQUF2QixDQUErQnNHLEtBQS9CLE1BQTBDLENBQUMsQ0FBN0Q7O1FBRUEsSUFBSSxDQUFDRSxXQUFELElBQWdCLENBQUNDLFNBQXJCLEVBQWdDO1VBQzVCLE9BQU8sS0FBUDtRQUNIO01BQ0o7O01BRUQsT0FBT2hCLENBQUMsQ0FBQy9ILFVBQUYsS0FBaUJBLFVBQXhCO0lBQ0gsQ0FaTSxDQUFQO0VBYUg7O0VBRU9rRSxxQkFBcUIsR0FBdUI7SUFDaEQ7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNckUsSUFBSSxHQUFHd0UsZ0NBQUEsQ0FBZ0JwQixHQUFoQixHQUFzQndELE9BQXRCLENBQThCLEtBQUtwSCxLQUFMLENBQVdTLE1BQXpDLENBQWI7O0lBRUEsSUFBSUQsSUFBSixFQUFVO01BQ04sT0FBT0EsSUFBSSxDQUFDMEgsWUFBTCxDQUFrQnlCLGNBQWxCLENBQWlDLDJCQUFqQyxFQUE4RGxCLE1BQTlELENBQXFFLFVBQVNtQixDQUFULEVBQVk7UUFDcEYsSUFBSSxDQUFDLElBQUFDLDZCQUFBLEVBQWtCRCxDQUFsQixDQUFMLEVBQTJCLE9BQU8sS0FBUCxDQUR5RCxDQUdwRjtRQUNBOztRQUNBLE1BQU1FLFdBQVcsR0FBR3RKLElBQUksQ0FBQzBILFlBQUwsQ0FBa0I2Qix5QkFBbEIsQ0FBNENILENBQUMsQ0FBQ0ksV0FBRixFQUE1QyxDQUFwQjtRQUNBLElBQUlGLFdBQUosRUFBaUIsT0FBTyxLQUFQO1FBQ2pCLE9BQU8sSUFBUDtNQUNILENBUk0sQ0FBUDtJQVNIO0VBQ0o7O0VBRU9yRixlQUFlLENBQUNSLE9BQUQsRUFBMkM7SUFDOUQsT0FBT0EsT0FBTyxDQUFDZ0csR0FBUixDQUFhdkIsQ0FBRCxJQUFPO01BQ3RCLElBQUlBLENBQUMsWUFBWXdCLHNCQUFqQixFQUE2QjtRQUN6QjtRQUNBLG9CQUFPLDZCQUFDLG1CQUFEO1VBQVksR0FBRyxFQUFFeEIsQ0FBQyxDQUFDcEksTUFBbkI7VUFBMkIsTUFBTSxFQUFFb0ksQ0FBbkM7VUFBc0MsR0FBRyxFQUFFQSxDQUFDLENBQUNwSSxNQUE3QztVQUFxRCxZQUFZLEVBQUUsS0FBS3FDO1FBQXhFLEVBQVA7TUFDSCxDQUhELE1BR087UUFDSDtRQUNBLG9CQUFPLDZCQUFDLG1CQUFEO1VBQ0gsR0FBRyxFQUFFK0YsQ0FBQyxDQUFDc0IsV0FBRixFQURGO1VBRUgsSUFBSSxFQUFFdEIsQ0FBQyxDQUFDeUIsVUFBRixHQUFlQyxZQUZsQjtVQUdILGVBQWUsRUFBRSxJQUhkO1VBSUgsT0FBTyxFQUFFLE1BQU0sS0FBS0Msd0JBQUwsQ0FBOEIzQixDQUE5QjtRQUpaLEVBQVA7TUFNSDtJQUNKLENBYk0sQ0FBUDtFQWNIOztFQXFCRDRCLE1BQU0sR0FBRztJQUNMLElBQUksS0FBS3pKLEtBQUwsQ0FBV3lHLE9BQWYsRUFBd0I7TUFDcEIsb0JBQU8sNkJBQUMsaUJBQUQ7UUFDSCxTQUFTLEVBQUMsZUFEUDtRQUVILE9BQU8sRUFBRSxLQUFLdEgsS0FBTCxDQUFXdUs7TUFGakIsZ0JBSUgsNkJBQUMsZ0JBQUQsT0FKRyxDQUFQO0lBTUg7O0lBRUQsTUFBTXJGLEdBQUcsR0FBR0YsZ0NBQUEsQ0FBZ0JwQixHQUFoQixFQUFaOztJQUNBLE1BQU1wRCxJQUFJLEdBQUcwRSxHQUFHLENBQUNrQyxPQUFKLENBQVksS0FBS3BILEtBQUwsQ0FBV1MsTUFBdkIsQ0FBYjtJQUNBLElBQUkrSixZQUFKOztJQUVBLElBQUloSyxJQUFJLEVBQUU2RyxlQUFOLE9BQTRCLE1BQTVCLElBQXNDLElBQUFvRCxpQ0FBQSxFQUFvQkMsc0JBQUEsQ0FBWUMsV0FBaEMsQ0FBMUMsRUFBd0Y7TUFDcEYsSUFBSUMsZ0JBQWdCLEdBQUcsSUFBQTNJLG1CQUFBLEVBQUcscUJBQUgsQ0FBdkI7O01BQ0EsSUFBSXpCLElBQUksQ0FBQ2tILFdBQUwsRUFBSixFQUF3QjtRQUNwQmtELGdCQUFnQixHQUFHLElBQUEzSSxtQkFBQSxFQUFHLHNCQUFILENBQW5CO01BQ0g7O01BRUR1SSxZQUFZLGdCQUNSLDZCQUFDLHlCQUFEO1FBQ0ksU0FBUyxFQUFDLHNCQURkO1FBRUksT0FBTyxFQUFFLEtBQUtLLG1CQUZsQjtRQUdJLFFBQVEsRUFBRSxDQUFDLEtBQUtoSyxLQUFMLENBQVdPO01BSDFCLGdCQUtJLDJDQUFRd0osZ0JBQVIsQ0FMSixDQURKO0lBU0g7O0lBRUQsSUFBSUUsYUFBSjtJQUNBLElBQUlDLGNBQUo7O0lBQ0EsSUFBSSxLQUFLQyxvQkFBTCxLQUE4QixDQUFsQyxFQUFxQztNQUNqQ0YsYUFBYSxnQkFBRyx5Q0FBTSxJQUFBN0ksbUJBQUEsRUFBRyxTQUFILENBQU4sQ0FBaEI7TUFDQThJLGNBQWMsZ0JBQ1YsNkJBQUMsc0JBQUQ7UUFDSSxTQUFTLEVBQUMsNkNBRGQ7UUFFSSxVQUFVLEVBQUUsS0FBS2xLLEtBQUwsQ0FBV3lCLGlCQUYzQjtRQUdJLHFCQUFxQixFQUFFLEtBQUsySSx5QkFIaEM7UUFJSSxXQUFXLEVBQUUsS0FBS0Msa0JBSnRCO1FBS0ksYUFBYSxFQUFFLEtBQUtGO01BTHhCLEVBREo7SUFTSDs7SUFFRCxNQUFNRyxNQUFNLGdCQUNSLDZCQUFDLGtCQUFEO01BQ0ksU0FBUyxFQUFDLDJEQURkO01BRUksV0FBVyxFQUFFLElBQUFsSixtQkFBQSxFQUFHLHFCQUFILENBRmpCO01BR0ksUUFBUSxFQUFFLEtBQUs2QixvQkFIbkI7TUFJSSxZQUFZLEVBQUUsS0FBSzlELEtBQUwsQ0FBVzZEO0lBSjdCLEVBREo7O0lBU0EsSUFBSXVILFdBQUo7O0lBQ0EsSUFBSTVLLElBQUksRUFBRWtILFdBQU4sRUFBSixFQUF5QjtNQUNyQjBELFdBQVcsZ0JBQUc7UUFBSyxTQUFTLEVBQUM7TUFBZixnQkFDViw2QkFBQyxtQkFBRDtRQUFZLElBQUksRUFBRTVLLElBQWxCO1FBQXdCLE1BQU0sRUFBRSxFQUFoQztRQUFvQyxLQUFLLEVBQUU7TUFBM0MsRUFEVSxlQUVWLDZCQUFDLGlCQUFEO1FBQVUsSUFBSSxFQUFFQTtNQUFoQixFQUZVLENBQWQ7SUFJSDs7SUFFRCxvQkFBTyw2QkFBQyxpQkFBRDtNQUNILFNBQVMsRUFBQyxlQURQO01BRUgsTUFBTSxlQUFFLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLFFBQ0Y0SyxXQURFLEVBRUZaLFlBRkUsQ0FGTDtNQU1ILE1BQU0sRUFBRVcsTUFOTDtNQU9ILE9BQU8sRUFBRSxLQUFLbkwsS0FBTCxDQUFXdUs7SUFQakIsZ0JBU0g7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSSw2QkFBQyxzQkFBRDtNQUNJLFNBQVMsRUFBQyw0Q0FEZDtNQUVJLFVBQVUsRUFBRSxLQUFLMUosS0FBTCxDQUFXd0IsZ0JBRjNCO01BR0kscUJBQXFCLEVBQUUsS0FBS2dKLHdCQUhoQztNQUlJLFdBQVcsRUFBRSxLQUFLQyxpQkFKdEI7TUFLSSxhQUFhLEVBQUUsS0FBS0M7SUFMeEIsRUFESixFQU9NVCxhQVBOLEVBUU1DLGNBUk4sQ0FURyxDQUFQO0VBb0JIOztBQWpnQm1FIn0=