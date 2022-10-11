"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _logger = require("matrix-js-sdk/src/logger");

var _info = require("../../../../res/img/element-icons/info.svg");

var _iconEmailPillAvatar = require("../../../../res/img/icon-email-pill-avatar.svg");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var Email = _interopRequireWildcard(require("../../../email"));

var _IdentityServerUtils = require("../../../utils/IdentityServerUtils");

var _SortMembers = require("../../../utils/SortMembers");

var _UrlUtils = require("../../../utils/UrlUtils");

var _IdentityAuthClient = _interopRequireDefault(require("../../../IdentityAuthClient"));

var _humanize = require("../../../utils/humanize");

var _RoomInvite = require("../../../RoomInvite");

var _actions = require("../../../dispatcher/actions");

var _models = require("../../../stores/room-list/models");

var _RoomListStore = _interopRequireDefault(require("../../../stores/room-list/RoomListStore"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _Media = require("../../../customisations/Media");

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _SearchResultAvatar = require("../avatars/SearchResultAvatar");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _strings = require("../../../utils/strings");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _TabbedView = _interopRequireWildcard(require("../../structures/TabbedView"));

var _DialPad = _interopRequireDefault(require("../voip/DialPad"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialPadBackspaceButton = _interopRequireDefault(require("../elements/DialPadBackspaceButton"));

var _LegacyCallHandler = _interopRequireDefault(require("../../../LegacyCallHandler"));

var _UserIdentifier = _interopRequireDefault(require("../../../customisations/UserIdentifier"));

var _CopyableText = _interopRequireDefault(require("../elements/CopyableText"));

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _directMessages = require("../../../utils/direct-messages");

var _InviteDialogTypes = require("./InviteDialogTypes");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 - 2022 The Matrix.org Foundation C.I.C.

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
const INITIAL_ROOMS_SHOWN = 3; // Number of rooms to show at first

const INCREMENT_ROOMS_SHOWN = 5; // Number of rooms to add when 'show more' is clicked

var TabId;

(function (TabId) {
  TabId["UserDirectory"] = "users";
  TabId["DialPad"] = "dialpad";
})(TabId || (TabId = {}));

class DMUserTile extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onRemove", e => {
      // Stop the browser from highlighting text
      e.preventDefault();
      e.stopPropagation();
      this.props.onRemove(this.props.member);
    });
  }

  render() {
    const avatarSize = 20;

    const avatar = /*#__PURE__*/_react.default.createElement(_SearchResultAvatar.SearchResultAvatar, {
      user: this.props.member,
      size: avatarSize
    });

    let closeButton;

    if (this.props.onRemove) {
      closeButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_InviteDialog_userTile_remove",
        onClick: this.onRemove
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../../res/img/icon-pill-remove.svg").default,
        alt: (0, _languageHandler._t)('Remove'),
        width: 8,
        height: 8
      }));
    }

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_userTile"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_userTile_pill"
    }, avatar, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_userTile_name"
    }, this.props.member.name)), closeButton);
  }

}

class DMRoomTile extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onClick", e => {
      // Stop the browser from highlighting text
      e.preventDefault();
      e.stopPropagation();
      this.props.onToggle(this.props.member);
    });
  }

  highlightName(str) {
    if (!this.props.highlightWord) return str; // We convert things to lowercase for index searching, but pull substrings from
    // the submitted text to preserve case. Note: we don't need to htmlEntities the
    // string because React will safely encode the text for us.

    const lowerStr = str.toLowerCase();
    const filterStr = this.props.highlightWord.toLowerCase();
    const result = [];
    let i = 0;
    let ii;

    while ((ii = lowerStr.indexOf(filterStr, i)) >= 0) {
      // Push any text we missed (first bit/middle of text)
      if (ii > i) {
        // Push any text we aren't highlighting (middle of text match, or beginning of text)
        result.push( /*#__PURE__*/_react.default.createElement("span", {
          key: i + 'begin'
        }, str.substring(i, ii)));
      }

      i = ii; // copy over ii only if we have a match (to preserve i for end-of-text matching)
      // Highlight the word the user entered

      const substr = str.substring(i, filterStr.length + i);
      result.push( /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_InviteDialog_tile--room_highlight",
        key: i + 'bold'
      }, substr));
      i += substr.length;
    } // Push any text we missed (end of text)


    if (i < str.length) {
      result.push( /*#__PURE__*/_react.default.createElement("span", {
        key: i + 'end'
      }, str.substring(i)));
    }

    return result;
  }

  render() {
    let timestamp = null;

    if (this.props.lastActiveTs) {
      const humanTs = (0, _humanize.humanizeTime)(this.props.lastActiveTs);
      timestamp = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_InviteDialog_tile--room_time"
      }, humanTs);
    }

    const avatarSize = 36;
    const avatar = this.props.member.isEmail ? /*#__PURE__*/_react.default.createElement(_iconEmailPillAvatar.Icon, {
      width: avatarSize,
      height: avatarSize
    }) : /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
      url: this.props.member.getMxcAvatarUrl() ? (0, _Media.mediaFromMxc)(this.props.member.getMxcAvatarUrl()).getSquareThumbnailHttp(avatarSize) : null,
      name: this.props.member.name,
      idName: this.props.member.userId,
      width: avatarSize,
      height: avatarSize
    });
    let checkmark = null;

    if (this.props.isSelected) {
      // To reduce flickering we put the 'selected' room tile above the real avatar
      checkmark = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_tile--room_selected"
      });
    } // To reduce flickering we put the checkmark on top of the actual avatar (prevents
    // the browser from reloading the image source when the avatar remounts).


    const stackedAvatar = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_tile_avatarStack"
    }, avatar, checkmark);

    const userIdentifier = _UserIdentifier.default.getDisplayUserIdentifier(this.props.member.userId, {
      withDisplayName: true
    });

    const caption = this.props.member.isEmail ? (0, _languageHandler._t)("Invite by email") : this.highlightName(userIdentifier);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_tile mx_InviteDialog_tile--room",
      onClick: this.onClick
    }, stackedAvatar, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_InviteDialog_tile_nameStack"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_tile_nameStack_name"
    }, this.highlightName(this.props.member.name)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_tile_nameStack_userId"
    }, caption)), timestamp);
  }

}

class InviteDialog extends _react.default.PureComponent {
  // actually number because we're in the browser
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "closeCopiedTooltip", void 0);
    (0, _defineProperty2.default)(this, "debounceTimer", null);
    (0, _defineProperty2.default)(this, "editorRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "numberEntryFieldRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "onConsultFirstChange", ev => {
      this.setState({
        consultFirst: ev.target.checked
      });
    });
    (0, _defineProperty2.default)(this, "startDm", async () => {
      try {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const targets = this.convertFilter();
        (0, _directMessages.startDmOnFirstMessage)(cli, targets);
        this.props.onFinished(true);
      } catch (err) {
        _logger.logger.error(err);

        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("We couldn't create your DM.")
        });
      }
    });
    (0, _defineProperty2.default)(this, "inviteUsers", async () => {
      this.setState({
        busy: true
      });
      this.convertFilter();
      const targets = this.convertFilter();
      const targetIds = targets.map(t => t.userId);

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(this.props.roomId);

      if (!room) {
        _logger.logger.error("Failed to find the room to invite users to");

        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("Something went wrong trying to invite the users.")
        });
        return;
      }

      try {
        const result = await (0, _RoomInvite.inviteMultipleToRoom)(this.props.roomId, targetIds, true);

        if (!this.shouldAbortAfterInviteError(result, room)) {
          // handles setting error message too
          this.props.onFinished(true);
        }
      } catch (err) {
        _logger.logger.error(err);

        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("We couldn't invite those users. Please check the users you want to invite and try again.")
        });
      }
    });
    (0, _defineProperty2.default)(this, "transferCall", async () => {
      if (this.state.currentTabId == TabId.UserDirectory) {
        this.convertFilter();
        const targets = this.convertFilter();
        const targetIds = targets.map(t => t.userId);

        if (targetIds.length > 1) {
          this.setState({
            errorText: (0, _languageHandler._t)("A call can only be transferred to a single user.")
          });
          return;
        }

        _LegacyCallHandler.default.instance.startTransferToMatrixID(this.props.call, targetIds[0], this.state.consultFirst);
      } else {
        _LegacyCallHandler.default.instance.startTransferToPhoneNumber(this.props.call, this.state.dialPadValue, this.state.consultFirst);
      }

      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "onKeyDown", e => {
      if (this.state.busy) return;
      let handled = false;
      const value = e.target.value.trim();
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(e);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Backspace:
          if (value || this.state.targets.length <= 0) break; // when the field is empty and the user hits backspace remove the right-most target

          this.removeMember(this.state.targets[this.state.targets.length - 1]);
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.Space:
          if (!value || !value.includes("@") || value.includes(" ")) break; // when the user hits space and their input looks like an e-mail/MXID then try to convert it

          this.convertFilter();
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.Enter:
          if (!value) break; // when the user hits enter with something in their field try to convert it

          this.convertFilter();
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "updateSuggestions", async term => {
      _MatrixClientPeg.MatrixClientPeg.get().searchUserDirectory({
        term
      }).then(async r => {
        if (term !== this.state.filterText) {
          // Discard the results - we were probably too slow on the server-side to make
          // these results useful. This is a race we want to avoid because we could overwrite
          // more accurate results.
          return;
        }

        if (!r.results) r.results = []; // While we're here, try and autocomplete a search result for the mxid itself
        // if there's no matches (and the input looks like a mxid).

        if (term[0] === '@' && term.indexOf(':') > 1) {
          try {
            const profile = await _MatrixClientPeg.MatrixClientPeg.get().getProfileInfo(term);

            if (profile) {
              // If we have a profile, we have enough information to assume that
              // the mxid can be invited - add it to the list. We stick it at the
              // top so it is most obviously presented to the user.
              r.results.splice(0, 0, {
                user_id: term,
                display_name: profile['displayname'],
                avatar_url: profile['avatar_url']
              });
            }
          } catch (e) {
            _logger.logger.warn("Non-fatal error trying to make an invite for a user ID");

            _logger.logger.warn(e); // Add a result anyways, just without a profile. We stick it at the
            // top so it is most obviously presented to the user.


            r.results.splice(0, 0, {
              user_id: term,
              display_name: term,
              avatar_url: null
            });
          }
        }

        this.setState({
          serverResultsMixin: r.results.map(u => ({
            userId: u.user_id,
            user: new _directMessages.DirectoryMember(u)
          }))
        });
      }).catch(e => {
        _logger.logger.error("Error searching user directory:");

        _logger.logger.error(e);

        this.setState({
          serverResultsMixin: []
        }); // clear results because it's moderately fatal
      }); // Whenever we search the directory, also try to search the identity server. It's
      // all debounced the same anyways.


      if (!this.state.canUseIdentityServer) {
        // The user doesn't have an identity server set - warn them of that.
        this.setState({
          tryingIdentityServer: true
        });
        return;
      }

      if (term.indexOf('@') > 0 && Email.looksValid(term) && _SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer)) {
        // Start off by suggesting the plain email while we try and resolve it
        // to a real account.
        this.setState({
          // per above: the userId is a lie here - it's just a regular identifier
          threepidResultsMixin: [{
            user: new _directMessages.ThreepidMember(term),
            userId: term
          }]
        });

        try {
          const authClient = new _IdentityAuthClient.default();
          const token = await authClient.getAccessToken();
          if (term !== this.state.filterText) return; // abandon hope

          const lookup = await _MatrixClientPeg.MatrixClientPeg.get().lookupThreePid('email', term, undefined, // callback
          token);
          if (term !== this.state.filterText) return; // abandon hope

          if (!lookup || !lookup.mxid) {
            // We weren't able to find anyone - we're already suggesting the plain email
            // as an alternative, so do nothing.
            return;
          } // We append the user suggestion to give the user an option to click
          // the email anyways, and so we don't cause things to jump around. In
          // theory, the user would see the user pop up and think "ah yes, that
          // person!"


          const profile = await _MatrixClientPeg.MatrixClientPeg.get().getProfileInfo(lookup.mxid);
          if (term !== this.state.filterText || !profile) return; // abandon hope

          this.setState({
            threepidResultsMixin: [...this.state.threepidResultsMixin, {
              user: new _directMessages.DirectoryMember({
                user_id: lookup.mxid,
                display_name: profile.displayname,
                avatar_url: profile.avatar_url
              }),
              userId: lookup.mxid
            }]
          });
        } catch (e) {
          _logger.logger.error("Error searching identity server:");

          _logger.logger.error(e);

          this.setState({
            threepidResultsMixin: []
          }); // clear results because it's moderately fatal
        }
      }
    });
    (0, _defineProperty2.default)(this, "updateFilter", e => {
      const term = e.target.value;
      this.setState({
        filterText: term
      }); // Debounce server lookups to reduce spam. We don't clear the existing server
      // results because they might still be vaguely accurate, likewise for races which
      // could happen here.

      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.updateSuggestions(term);
      }, 150); // 150ms debounce (human reaction time + some)
    });
    (0, _defineProperty2.default)(this, "showMoreRecents", () => {
      this.setState({
        numRecentsShown: this.state.numRecentsShown + INCREMENT_ROOMS_SHOWN
      });
    });
    (0, _defineProperty2.default)(this, "showMoreSuggestions", () => {
      this.setState({
        numSuggestionsShown: this.state.numSuggestionsShown + INCREMENT_ROOMS_SHOWN
      });
    });
    (0, _defineProperty2.default)(this, "toggleMember", member => {
      if (!this.state.busy) {
        let filterText = this.state.filterText;
        let targets = this.state.targets.map(t => t); // cheap clone for mutation

        const idx = targets.indexOf(member);

        if (idx >= 0) {
          targets.splice(idx, 1);
        } else {
          if (this.props.kind === _InviteDialogTypes.KIND_CALL_TRANSFER && targets.length > 0) {
            targets = [];
          }

          targets.push(member);
          filterText = ""; // clear the filter when the user accepts a suggestion
        }

        this.setState({
          targets,
          filterText
        });

        if (this.editorRef && this.editorRef.current) {
          this.editorRef.current.focus();
        }
      }
    });
    (0, _defineProperty2.default)(this, "removeMember", member => {
      const targets = this.state.targets.map(t => t); // cheap clone for mutation

      const idx = targets.indexOf(member);

      if (idx >= 0) {
        targets.splice(idx, 1);
        this.setState({
          targets
        });
      }

      if (this.editorRef && this.editorRef.current) {
        this.editorRef.current.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onPaste", async e => {
      if (this.state.filterText) {
        // if the user has already typed something, just let them
        // paste normally.
        return;
      } // Prevent the text being pasted into the input


      e.preventDefault(); // Process it as a list of addresses to add instead

      const text = e.clipboardData.getData("text");
      const possibleMembers = [// If we can avoid hitting the profile endpoint, we should.
      ...this.state.recents, ...this.state.suggestions, ...this.state.serverResultsMixin, ...this.state.threepidResultsMixin];
      const toAdd = [];
      const failed = [];
      const potentialAddresses = text.split(/[\s,]+/).map(p => p.trim()).filter(p => !!p); // filter empty strings

      for (const address of potentialAddresses) {
        const member = possibleMembers.find(m => m.userId === address);

        if (member) {
          toAdd.push(member.user);
          continue;
        }

        if (address.indexOf('@') > 0 && Email.looksValid(address)) {
          toAdd.push(new _directMessages.ThreepidMember(address));
          continue;
        }

        if (address[0] !== '@') {
          failed.push(address); // not a user ID

          continue;
        }

        try {
          const profile = await _MatrixClientPeg.MatrixClientPeg.get().getProfileInfo(address);
          const displayName = profile ? profile.displayname : null;
          const avatarUrl = profile ? profile.avatar_url : null;
          toAdd.push(new _directMessages.DirectoryMember({
            user_id: address,
            display_name: displayName,
            avatar_url: avatarUrl
          }));
        } catch (e) {
          _logger.logger.error("Error looking up profile for " + address);

          _logger.logger.error(e);

          failed.push(address);
        }
      }

      if (this.unmounted) return;

      if (failed.length > 0) {
        _Modal.default.createDialog(_QuestionDialog.default, {
          title: (0, _languageHandler._t)('Failed to find the following users'),
          description: (0, _languageHandler._t)("The following users might not exist or are invalid, and cannot be invited: %(csvNames)s", {
            csvNames: failed.join(", ")
          }),
          button: (0, _languageHandler._t)('OK')
        });
      }

      this.setState({
        targets: [...this.state.targets, ...toAdd]
      });
    });
    (0, _defineProperty2.default)(this, "onClickInputArea", e => {
      // Stop the browser from highlighting text
      e.preventDefault();
      e.stopPropagation();

      if (this.editorRef && this.editorRef.current) {
        this.editorRef.current.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onUseDefaultIdentityServerClick", e => {
      e.preventDefault(); // Update the IS in account data. Actually using it may trigger terms.
      // eslint-disable-next-line react-hooks/rules-of-hooks

      (0, _IdentityServerUtils.setToDefaultIdentityServer)();
      this.setState({
        canUseIdentityServer: true,
        tryingIdentityServer: false
      });
    });
    (0, _defineProperty2.default)(this, "onManageSettingsClick", e => {
      e.preventDefault();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);

      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onDialFormSubmit", ev => {
      ev.preventDefault();
      this.transferCall();
    });
    (0, _defineProperty2.default)(this, "onDialChange", ev => {
      this.setState({
        dialPadValue: ev.currentTarget.value
      });
    });
    (0, _defineProperty2.default)(this, "onDigitPress", (digit, ev) => {
      this.setState({
        dialPadValue: this.state.dialPadValue + digit
      }); // Keep the number field focused so that keyboard entry is still available
      // However, don't focus if this wasn't the result of directly clicking on the button,
      // i.e someone using keyboard navigation.

      if (ev.type === "click") {
        this.numberEntryFieldRef.current?.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onDeletePress", ev => {
      if (this.state.dialPadValue.length === 0) return;
      this.setState({
        dialPadValue: this.state.dialPadValue.slice(0, -1)
      }); // Keep the number field focused so that keyboard entry is still available
      // However, don't focus if this wasn't the result of directly clicking on the button,
      // i.e someone using keyboard navigation.

      if (ev.type === "click") {
        this.numberEntryFieldRef.current?.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onTabChange", tabId => {
      this.setState({
        currentTabId: tabId
      });
    });

    if (props.kind === _InviteDialogTypes.KIND_INVITE && !props.roomId) {
      throw new Error("When using KIND_INVITE a roomId is required for an InviteDialog");
    } else if (props.kind === _InviteDialogTypes.KIND_CALL_TRANSFER && !props.call) {
      throw new Error("When using KIND_CALL_TRANSFER a call is required for an InviteDialog");
    }

    const alreadyInvited = new Set([_MatrixClientPeg.MatrixClientPeg.get().getUserId(), _SdkConfig.default.get("welcome_user_id")]);

    if (props.roomId) {
      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(props.roomId);

      if (!room) throw new Error("Room ID given to InviteDialog does not look like a room");
      room.getMembersWithMembership('invite').forEach(m => alreadyInvited.add(m.userId));
      room.getMembersWithMembership('join').forEach(m => alreadyInvited.add(m.userId)); // add banned users, so we don't try to invite them

      room.getMembersWithMembership('ban').forEach(m => alreadyInvited.add(m.userId));
    }

    this.state = {
      targets: [],
      // array of Member objects (see interface above)
      filterText: this.props.initialText,
      recents: InviteDialog.buildRecents(alreadyInvited),
      numRecentsShown: INITIAL_ROOMS_SHOWN,
      suggestions: this.buildSuggestions(alreadyInvited),
      numSuggestionsShown: INITIAL_ROOMS_SHOWN,
      serverResultsMixin: [],
      threepidResultsMixin: [],
      canUseIdentityServer: !!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl(),
      tryingIdentityServer: false,
      consultFirst: false,
      dialPadValue: '',
      currentTabId: TabId.UserDirectory,
      // These two flags are used for the 'Go' button to communicate what is going on.
      busy: false,
      errorText: null
    };
  }

  componentDidMount() {
    if (this.props.initialText) {
      this.updateSuggestions(this.props.initialText);
    }
  }

  componentWillUnmount() {
    this.unmounted = true; // if the Copied tooltip is open then get rid of it, there are ways to close the modal which wouldn't close
    // the tooltip otherwise, such as pressing Escape or clicking X really quickly

    if (this.closeCopiedTooltip) this.closeCopiedTooltip();
  }

  static buildRecents(excludedTargetIds) {
    const rooms = _DMRoomMap.default.shared().getUniqueRoomsWithIndividuals(); // map of userId => js-sdk Room
    // Also pull in all the rooms tagged as DefaultTagID.DM so we don't miss anything. Sometimes the
    // room list doesn't tag the room for the DMRoomMap, but does for the room list.


    const dmTaggedRooms = _RoomListStore.default.instance.orderedLists[_models.DefaultTagID.DM] || [];

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    for (const dmRoom of dmTaggedRooms) {
      const otherMembers = dmRoom.getJoinedMembers().filter(u => u.userId !== myUserId);

      for (const member of otherMembers) {
        if (rooms[member.userId]) continue; // already have a room

        _logger.logger.warn(`Adding DM room for ${member.userId} as ${dmRoom.roomId} from tag, not DM map`);

        rooms[member.userId] = dmRoom;
      }
    }

    const recents = [];

    for (const userId in rooms) {
      // Filter out user IDs that are already in the room / should be excluded
      if (excludedTargetIds.has(userId)) {
        _logger.logger.warn(`[Invite:Recents] Excluding ${userId} from recents`);

        continue;
      }

      const room = rooms[userId];
      const member = room.getMember(userId);

      if (!member) {
        // just skip people who don't have memberships for some reason
        _logger.logger.warn(`[Invite:Recents] ${userId} is missing a member object in their own DM (${room.roomId})`);

        continue;
      } // Find the last timestamp for a message event


      const searchTypes = ["m.room.message", "m.room.encrypted", "m.sticker"];
      const maxSearchEvents = 20; // to prevent traversing history

      let lastEventTs = 0;

      if (room.timeline && room.timeline.length) {
        for (let i = room.timeline.length - 1; i >= 0; i--) {
          const ev = room.timeline[i];

          if (searchTypes.includes(ev.getType())) {
            lastEventTs = ev.getTs();
            break;
          }

          if (room.timeline.length - i > maxSearchEvents) break;
        }
      }

      if (!lastEventTs) {
        // something weird is going on with this room
        _logger.logger.warn(`[Invite:Recents] ${userId} (${room.roomId}) has a weird last timestamp: ${lastEventTs}`);

        continue;
      }

      recents.push({
        userId,
        user: member,
        lastActive: lastEventTs
      });
    }

    if (!recents) _logger.logger.warn("[Invite:Recents] No recents to suggest!"); // Sort the recents by last active to save us time later

    recents.sort((a, b) => b.lastActive - a.lastActive);
    return recents;
  }

  buildSuggestions(excludedTargetIds) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const activityScores = (0, _SortMembers.buildActivityScores)(cli);
    const memberScores = (0, _SortMembers.buildMemberScores)(cli);
    const memberComparator = (0, _SortMembers.compareMembers)(activityScores, memberScores);
    return Object.values(memberScores).map(_ref => {
      let {
        member
      } = _ref;
      return member;
    }).filter(member => !excludedTargetIds.has(member.userId)).sort(memberComparator).map(member => ({
      userId: member.userId,
      user: member
    }));
  }

  shouldAbortAfterInviteError(result, room) {
    this.setState({
      busy: false
    });
    const userMap = new Map(this.state.targets.map(member => [member.userId, member]));
    return !(0, _RoomInvite.showAnyInviteErrors)(result.states, room, result.inviter, userMap);
  }

  convertFilter() {
    // Check to see if there's anything to convert first
    if (!this.state.filterText || !this.state.filterText.includes('@')) return this.state.targets || [];
    let newMember;

    if (this.state.filterText.startsWith('@')) {
      // Assume mxid
      newMember = new _directMessages.DirectoryMember({
        user_id: this.state.filterText,
        display_name: null,
        avatar_url: null
      });
    } else if (_SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer)) {
      // Assume email
      newMember = new _directMessages.ThreepidMember(this.state.filterText);
    }

    const newTargets = [...(this.state.targets || []), newMember];
    this.setState({
      targets: newTargets,
      filterText: ''
    });
    return newTargets;
  }

  renderSection(kind) {
    let sourceMembers = kind === 'recents' ? this.state.recents : this.state.suggestions;
    let showNum = kind === 'recents' ? this.state.numRecentsShown : this.state.numSuggestionsShown;
    const showMoreFn = kind === 'recents' ? this.showMoreRecents.bind(this) : this.showMoreSuggestions.bind(this);

    const lastActive = m => kind === 'recents' ? m.lastActive : null;

    let sectionName = kind === 'recents' ? (0, _languageHandler._t)("Recent Conversations") : (0, _languageHandler._t)("Suggestions");

    if (this.props.kind === _InviteDialogTypes.KIND_INVITE) {
      sectionName = kind === 'recents' ? (0, _languageHandler._t)("Recently Direct Messaged") : (0, _languageHandler._t)("Suggestions");
    } // Mix in the server results if we have any, but only if we're searching. We track the additional
    // members separately because we want to filter sourceMembers but trust the mixin arrays to have
    // the right members in them.


    let priorityAdditionalMembers = []; // Shows up before our own suggestions, higher quality

    let otherAdditionalMembers = []; // Shows up after our own suggestions, lower quality

    const hasMixins = this.state.serverResultsMixin || this.state.threepidResultsMixin;

    if (this.state.filterText && hasMixins && kind === 'suggestions') {
      // We don't want to duplicate members though, so just exclude anyone we've already seen.
      // The type of u is a pain to define but members of both mixins have the 'userId' property
      const notAlreadyExists = u => {
        return !sourceMembers.some(m => m.userId === u.userId) && !priorityAdditionalMembers.some(m => m.userId === u.userId) && !otherAdditionalMembers.some(m => m.userId === u.userId);
      };

      otherAdditionalMembers = this.state.serverResultsMixin.filter(notAlreadyExists);
      priorityAdditionalMembers = this.state.threepidResultsMixin.filter(notAlreadyExists);
    }

    const hasAdditionalMembers = priorityAdditionalMembers.length > 0 || otherAdditionalMembers.length > 0; // Hide the section if there's nothing to filter by

    if (sourceMembers.length === 0 && !hasAdditionalMembers) return null; // Do some simple filtering on the input before going much further. If we get no results, say so.

    if (this.state.filterText) {
      const filterBy = this.state.filterText.toLowerCase();
      sourceMembers = sourceMembers.filter(m => m.user.name.toLowerCase().includes(filterBy) || m.userId.toLowerCase().includes(filterBy));

      if (sourceMembers.length === 0 && !hasAdditionalMembers) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_InviteDialog_section"
        }, /*#__PURE__*/_react.default.createElement("h3", null, sectionName), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("No results")));
      }
    } // Now we mix in the additional members. Again, we presume these have already been filtered. We
    // also assume they are more relevant than our suggestions and prepend them to the list.


    sourceMembers = [...priorityAdditionalMembers, ...sourceMembers, ...otherAdditionalMembers]; // If we're going to hide one member behind 'show more', just use up the space of the button
    // with the member's tile instead.

    if (showNum === sourceMembers.length - 1) showNum++; // .slice() will return an incomplete array but won't error on us if we go too far

    const toRender = sourceMembers.slice(0, showNum);
    const hasMore = toRender.length < sourceMembers.length;
    let showMore = null;

    if (hasMore) {
      showMore = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_section_showMore"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: showMoreFn,
        kind: "link"
      }, (0, _languageHandler._t)("Show more")));
    }

    const tiles = toRender.map(r => /*#__PURE__*/_react.default.createElement(DMRoomTile, {
      member: r.user,
      lastActiveTs: lastActive(r),
      key: r.userId,
      onToggle: this.toggleMember,
      highlightWord: this.state.filterText,
      isSelected: this.state.targets.some(t => t.userId === r.userId)
    }));
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_section"
    }, /*#__PURE__*/_react.default.createElement("h3", null, sectionName), tiles, showMore);
  }

  renderEditor() {
    const hasPlaceholder = this.props.kind == _InviteDialogTypes.KIND_CALL_TRANSFER && this.state.targets.length === 0 && this.state.filterText.length === 0;
    const targets = this.state.targets.map(t => /*#__PURE__*/_react.default.createElement(DMUserTile, {
      member: t,
      onRemove: !this.state.busy && this.removeMember,
      key: t.userId
    }));

    const input = /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      onKeyDown: this.onKeyDown,
      onChange: this.updateFilter,
      value: this.state.filterText,
      ref: this.editorRef,
      onPaste: this.onPaste,
      autoFocus: true,
      disabled: this.state.busy || this.props.kind == _InviteDialogTypes.KIND_CALL_TRANSFER && this.state.targets.length > 0,
      autoComplete: "off",
      placeholder: hasPlaceholder ? (0, _languageHandler._t)("Search") : null,
      "data-test-id": "invite-dialog-input"
    });

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_editor",
      onClick: this.onClickInputArea
    }, targets, input);
  }

  renderIdentityServerWarning() {
    if (!this.state.tryingIdentityServer || this.state.canUseIdentityServer || !_SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer)) {
      return null;
    }

    const defaultIdentityServerUrl = (0, _IdentityServerUtils.getDefaultIdentityServerUrl)();

    if (defaultIdentityServerUrl) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_identityServer"
      }, (0, _languageHandler._t)("Use an identity server to invite by email. " + "<default>Use the default (%(defaultIdentityServerName)s)</default> " + "or manage in <settings>Settings</settings>.", {
        defaultIdentityServerName: (0, _UrlUtils.abbreviateUrl)(defaultIdentityServerUrl)
      }, {
        default: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onUseDefaultIdentityServerClick
        }, sub),
        settings: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onManageSettingsClick
        }, sub)
      }));
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_identityServer"
      }, (0, _languageHandler._t)("Use an identity server to invite by email. " + "Manage in <settings>Settings</settings>.", {}, {
        settings: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onManageSettingsClick
        }, sub)
      }));
    }
  }

  async onLinkClick(e) {
    e.preventDefault();
    (0, _strings.selectText)(e.target);
  }

  get screenName() {
    switch (this.props.kind) {
      case _InviteDialogTypes.KIND_DM:
        return "StartChat";
    }
  }

  render() {
    let spinner = null;

    if (this.state.busy) {
      spinner = /*#__PURE__*/_react.default.createElement(_Spinner.default, {
        w: 20,
        h: 20
      });
    }

    let title;
    let helpText;
    let buttonText;
    let goButtonFn;
    let consultConnectSection;
    let extraSection;
    let footer;

    let keySharingWarning = /*#__PURE__*/_react.default.createElement("span", null);

    const identityServersEnabled = _SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer);

    const hasSelection = this.state.targets.length > 0 || this.state.filterText && this.state.filterText.includes('@');

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const userId = cli.getUserId();

    if (this.props.kind === _InviteDialogTypes.KIND_DM) {
      title = (0, _languageHandler._t)("Direct Messages");

      if (identityServersEnabled) {
        helpText = (0, _languageHandler._t)("Start a conversation with someone using their name, email address or username (like <userId/>).", {}, {
          userId: () => {
            return /*#__PURE__*/_react.default.createElement("a", {
              href: (0, _Permalinks.makeUserPermalink)(userId),
              rel: "noreferrer noopener",
              target: "_blank"
            }, userId);
          }
        });
      } else {
        helpText = (0, _languageHandler._t)("Start a conversation with someone using their name or username (like <userId/>).", {}, {
          userId: () => {
            return /*#__PURE__*/_react.default.createElement("a", {
              href: (0, _Permalinks.makeUserPermalink)(userId),
              rel: "noreferrer noopener",
              target: "_blank"
            }, userId);
          }
        });
      }

      buttonText = (0, _languageHandler._t)("Go");
      goButtonFn = this.startDm;
      extraSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_section_hidden_suggestions_disclaimer"
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Some suggestions may be hidden for privacy.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you can't see who you're looking for, send them your invite link below.")));
      const link = (0, _Permalinks.makeUserPermalink)(_MatrixClientPeg.MatrixClientPeg.get().getUserId());
      footer = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_footer"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Or send invite link")), /*#__PURE__*/_react.default.createElement(_CopyableText.default, {
        getTextToCopy: () => (0, _Permalinks.makeUserPermalink)(_MatrixClientPeg.MatrixClientPeg.get().getUserId())
      }, /*#__PURE__*/_react.default.createElement("a", {
        href: link,
        onClick: this.onLinkClick
      }, link)));
    } else if (this.props.kind === _InviteDialogTypes.KIND_INVITE) {
      const room = _MatrixClientPeg.MatrixClientPeg.get()?.getRoom(this.props.roomId);
      const isSpace = room?.isSpaceRoom();
      title = isSpace ? (0, _languageHandler._t)("Invite to %(spaceName)s", {
        spaceName: room.name || (0, _languageHandler._t)("Unnamed Space")
      }) : (0, _languageHandler._t)("Invite to %(roomName)s", {
        roomName: room.name || (0, _languageHandler._t)("Unnamed Room")
      });
      let helpTextUntranslated;

      if (isSpace) {
        if (identityServersEnabled) {
          helpTextUntranslated = (0, _languageHandler._td)("Invite someone using their name, email address, username " + "(like <userId/>) or <a>share this space</a>.");
        } else {
          helpTextUntranslated = (0, _languageHandler._td)("Invite someone using their name, username " + "(like <userId/>) or <a>share this space</a>.");
        }
      } else {
        if (identityServersEnabled) {
          helpTextUntranslated = (0, _languageHandler._td)("Invite someone using their name, email address, username " + "(like <userId/>) or <a>share this room</a>.");
        } else {
          helpTextUntranslated = (0, _languageHandler._td)("Invite someone using their name, username " + "(like <userId/>) or <a>share this room</a>.");
        }
      }

      helpText = (0, _languageHandler._t)(helpTextUntranslated, {}, {
        userId: () => /*#__PURE__*/_react.default.createElement("a", {
          href: (0, _Permalinks.makeUserPermalink)(userId),
          rel: "noreferrer noopener",
          target: "_blank"
        }, userId),
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: (0, _Permalinks.makeRoomPermalink)(this.props.roomId),
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub)
      });
      buttonText = (0, _languageHandler._t)("Invite");
      goButtonFn = this.inviteUsers;

      if (cli.isRoomEncrypted(this.props.roomId)) {
        const room = cli.getRoom(this.props.roomId);
        const visibilityEvent = room.currentState.getStateEvents("m.room.history_visibility", "");
        const visibility = visibilityEvent && visibilityEvent.getContent() && visibilityEvent.getContent().history_visibility;

        if (visibility === "world_readable" || visibility === "shared") {
          keySharingWarning = /*#__PURE__*/_react.default.createElement("p", {
            className: "mx_InviteDialog_helpText"
          }, /*#__PURE__*/_react.default.createElement(_info.Icon, {
            height: 14,
            width: 14
          }), " " + (0, _languageHandler._t)("Invited people will be able to read old messages."));
        }
      }
    } else if (this.props.kind === _InviteDialogTypes.KIND_CALL_TRANSFER) {
      title = (0, _languageHandler._t)("Transfer");
      consultConnectSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_transferConsultConnect"
      }, /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
        type: "checkbox",
        checked: this.state.consultFirst,
        onChange: this.onConsultFirstChange
      }), (0, _languageHandler._t)("Consult first")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "secondary",
        onClick: this.onCancel,
        className: "mx_InviteDialog_transferConsultConnect_pushRight"
      }, (0, _languageHandler._t)("Cancel")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.transferCall,
        className: "mx_InviteDialog_transferButton",
        disabled: !hasSelection && this.state.dialPadValue === ''
      }, (0, _languageHandler._t)("Transfer")));
    } else {
      _logger.logger.error("Unknown kind of InviteDialog: " + this.props.kind);
    }

    const goButton = this.props.kind == _InviteDialogTypes.KIND_CALL_TRANSFER ? null : /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: goButtonFn,
      className: "mx_InviteDialog_goButton",
      disabled: this.state.busy || !hasSelection
    }, buttonText);

    const usersSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_InviteDialog_helpText"
    }, helpText), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_addressBar"
    }, this.renderEditor(), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_buttonAndSpinner"
    }, goButton, spinner)), keySharingWarning, this.renderIdentityServerWarning(), /*#__PURE__*/_react.default.createElement("div", {
      className: "error"
    }, this.state.errorText), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_userSections"
    }, this.renderSection('recents'), this.renderSection('suggestions'), extraSection), footer);

    let dialogContent;

    if (this.props.kind === _InviteDialogTypes.KIND_CALL_TRANSFER) {
      const tabs = [];
      tabs.push(new _TabbedView.Tab(TabId.UserDirectory, (0, _languageHandler._td)("User Directory"), 'mx_InviteDialog_userDirectoryIcon', usersSection));

      const backspaceButton = /*#__PURE__*/_react.default.createElement(_DialPadBackspaceButton.default, {
        onBackspacePress: this.onDeletePress
      }); // Only show the backspace button if the field has content


      let dialPadField;

      if (this.state.dialPadValue.length !== 0) {
        dialPadField = /*#__PURE__*/_react.default.createElement(_Field.default, {
          ref: this.numberEntryFieldRef,
          className: "mx_InviteDialog_dialPadField",
          id: "dialpad_number",
          value: this.state.dialPadValue,
          autoFocus: true,
          onChange: this.onDialChange,
          postfixComponent: backspaceButton
        });
      } else {
        dialPadField = /*#__PURE__*/_react.default.createElement(_Field.default, {
          ref: this.numberEntryFieldRef,
          className: "mx_InviteDialog_dialPadField",
          id: "dialpad_number",
          value: this.state.dialPadValue,
          autoFocus: true,
          onChange: this.onDialChange
        });
      }

      const dialPadSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InviteDialog_dialPad"
      }, /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this.onDialFormSubmit
      }, dialPadField), /*#__PURE__*/_react.default.createElement(_DialPad.default, {
        hasDial: false,
        onDigitPress: this.onDigitPress,
        onDeletePress: this.onDeletePress
      }));

      tabs.push(new _TabbedView.Tab(TabId.DialPad, (0, _languageHandler._td)("Dial pad"), 'mx_InviteDialog_dialPadIcon', dialPadSection));
      dialogContent = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_TabbedView.default, {
        tabs: tabs,
        initialTabId: this.state.currentTabId,
        tabLocation: _TabbedView.TabLocation.TOP,
        onChange: this.onTabChange
      }), consultConnectSection);
    } else {
      dialogContent = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, usersSection, consultConnectSection);
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: (0, _classnames.default)({
        mx_InviteDialog_transfer: this.props.kind === _InviteDialogTypes.KIND_CALL_TRANSFER,
        mx_InviteDialog_other: this.props.kind !== _InviteDialogTypes.KIND_CALL_TRANSFER,
        mx_InviteDialog_hasFooter: !!footer
      }),
      hasCancel: true,
      onFinished: this.props.onFinished,
      title: title,
      screenName: this.screenName
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteDialog_content"
    }, dialogContent));
  }

}

exports.default = InviteDialog;
(0, _defineProperty2.default)(InviteDialog, "defaultProps", {
  kind: _InviteDialogTypes.KIND_DM,
  initialText: ""
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJTklUSUFMX1JPT01TX1NIT1dOIiwiSU5DUkVNRU5UX1JPT01TX1NIT1dOIiwiVGFiSWQiLCJETVVzZXJUaWxlIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwicHJvcHMiLCJvblJlbW92ZSIsIm1lbWJlciIsInJlbmRlciIsImF2YXRhclNpemUiLCJhdmF0YXIiLCJjbG9zZUJ1dHRvbiIsInJlcXVpcmUiLCJkZWZhdWx0IiwiX3QiLCJuYW1lIiwiRE1Sb29tVGlsZSIsIm9uVG9nZ2xlIiwiaGlnaGxpZ2h0TmFtZSIsInN0ciIsImhpZ2hsaWdodFdvcmQiLCJsb3dlclN0ciIsInRvTG93ZXJDYXNlIiwiZmlsdGVyU3RyIiwicmVzdWx0IiwiaSIsImlpIiwiaW5kZXhPZiIsInB1c2giLCJzdWJzdHJpbmciLCJzdWJzdHIiLCJsZW5ndGgiLCJ0aW1lc3RhbXAiLCJsYXN0QWN0aXZlVHMiLCJodW1hblRzIiwiaHVtYW5pemVUaW1lIiwiaXNFbWFpbCIsImdldE14Y0F2YXRhclVybCIsIm1lZGlhRnJvbU14YyIsImdldFNxdWFyZVRodW1ibmFpbEh0dHAiLCJ1c2VySWQiLCJjaGVja21hcmsiLCJpc1NlbGVjdGVkIiwic3RhY2tlZEF2YXRhciIsInVzZXJJZGVudGlmaWVyIiwiVXNlcklkZW50aWZpZXJDdXN0b21pc2F0aW9ucyIsImdldERpc3BsYXlVc2VySWRlbnRpZmllciIsIndpdGhEaXNwbGF5TmFtZSIsImNhcHRpb24iLCJvbkNsaWNrIiwiSW52aXRlRGlhbG9nIiwiY29uc3RydWN0b3IiLCJjcmVhdGVSZWYiLCJldiIsInNldFN0YXRlIiwiY29uc3VsdEZpcnN0IiwidGFyZ2V0IiwiY2hlY2tlZCIsImNsaSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInRhcmdldHMiLCJjb252ZXJ0RmlsdGVyIiwic3RhcnREbU9uRmlyc3RNZXNzYWdlIiwib25GaW5pc2hlZCIsImVyciIsImxvZ2dlciIsImVycm9yIiwiYnVzeSIsImVycm9yVGV4dCIsInRhcmdldElkcyIsIm1hcCIsInQiLCJyb29tIiwiZ2V0Um9vbSIsInJvb21JZCIsImludml0ZU11bHRpcGxlVG9Sb29tIiwic2hvdWxkQWJvcnRBZnRlckludml0ZUVycm9yIiwic3RhdGUiLCJjdXJyZW50VGFiSWQiLCJVc2VyRGlyZWN0b3J5IiwiTGVnYWN5Q2FsbEhhbmRsZXIiLCJpbnN0YW5jZSIsInN0YXJ0VHJhbnNmZXJUb01hdHJpeElEIiwiY2FsbCIsInN0YXJ0VHJhbnNmZXJUb1Bob25lTnVtYmVyIiwiZGlhbFBhZFZhbHVlIiwiaGFuZGxlZCIsInZhbHVlIiwidHJpbSIsImFjdGlvbiIsImdldEtleUJpbmRpbmdzTWFuYWdlciIsImdldEFjY2Vzc2liaWxpdHlBY3Rpb24iLCJLZXlCaW5kaW5nQWN0aW9uIiwiQmFja3NwYWNlIiwicmVtb3ZlTWVtYmVyIiwiU3BhY2UiLCJpbmNsdWRlcyIsIkVudGVyIiwidGVybSIsInNlYXJjaFVzZXJEaXJlY3RvcnkiLCJ0aGVuIiwiciIsImZpbHRlclRleHQiLCJyZXN1bHRzIiwicHJvZmlsZSIsImdldFByb2ZpbGVJbmZvIiwic3BsaWNlIiwidXNlcl9pZCIsImRpc3BsYXlfbmFtZSIsImF2YXRhcl91cmwiLCJ3YXJuIiwic2VydmVyUmVzdWx0c01peGluIiwidSIsInVzZXIiLCJEaXJlY3RvcnlNZW1iZXIiLCJjYXRjaCIsImNhblVzZUlkZW50aXR5U2VydmVyIiwidHJ5aW5nSWRlbnRpdHlTZXJ2ZXIiLCJFbWFpbCIsImxvb2tzVmFsaWQiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJJZGVudGl0eVNlcnZlciIsInRocmVlcGlkUmVzdWx0c01peGluIiwiVGhyZWVwaWRNZW1iZXIiLCJhdXRoQ2xpZW50IiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwidG9rZW4iLCJnZXRBY2Nlc3NUb2tlbiIsImxvb2t1cCIsImxvb2t1cFRocmVlUGlkIiwidW5kZWZpbmVkIiwibXhpZCIsImRpc3BsYXluYW1lIiwiZGVib3VuY2VUaW1lciIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJ1cGRhdGVTdWdnZXN0aW9ucyIsIm51bVJlY2VudHNTaG93biIsIm51bVN1Z2dlc3Rpb25zU2hvd24iLCJpZHgiLCJraW5kIiwiS0lORF9DQUxMX1RSQU5TRkVSIiwiZWRpdG9yUmVmIiwiY3VycmVudCIsImZvY3VzIiwidGV4dCIsImNsaXBib2FyZERhdGEiLCJnZXREYXRhIiwicG9zc2libGVNZW1iZXJzIiwicmVjZW50cyIsInN1Z2dlc3Rpb25zIiwidG9BZGQiLCJmYWlsZWQiLCJwb3RlbnRpYWxBZGRyZXNzZXMiLCJzcGxpdCIsInAiLCJmaWx0ZXIiLCJhZGRyZXNzIiwiZmluZCIsIm0iLCJkaXNwbGF5TmFtZSIsImF2YXRhclVybCIsInVubW91bnRlZCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiUXVlc3Rpb25EaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiY3N2TmFtZXMiLCJqb2luIiwiYnV0dG9uIiwic2V0VG9EZWZhdWx0SWRlbnRpdHlTZXJ2ZXIiLCJkaXMiLCJmaXJlIiwiQWN0aW9uIiwiVmlld1VzZXJTZXR0aW5ncyIsInRyYW5zZmVyQ2FsbCIsImN1cnJlbnRUYXJnZXQiLCJkaWdpdCIsInR5cGUiLCJudW1iZXJFbnRyeUZpZWxkUmVmIiwic2xpY2UiLCJ0YWJJZCIsIktJTkRfSU5WSVRFIiwiRXJyb3IiLCJhbHJlYWR5SW52aXRlZCIsIlNldCIsImdldFVzZXJJZCIsIlNka0NvbmZpZyIsImdldE1lbWJlcnNXaXRoTWVtYmVyc2hpcCIsImZvckVhY2giLCJhZGQiLCJpbml0aWFsVGV4dCIsImJ1aWxkUmVjZW50cyIsImJ1aWxkU3VnZ2VzdGlvbnMiLCJnZXRJZGVudGl0eVNlcnZlclVybCIsImNvbXBvbmVudERpZE1vdW50IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJjbG9zZUNvcGllZFRvb2x0aXAiLCJleGNsdWRlZFRhcmdldElkcyIsInJvb21zIiwiRE1Sb29tTWFwIiwic2hhcmVkIiwiZ2V0VW5pcXVlUm9vbXNXaXRoSW5kaXZpZHVhbHMiLCJkbVRhZ2dlZFJvb21zIiwiUm9vbUxpc3RTdG9yZSIsIm9yZGVyZWRMaXN0cyIsIkRlZmF1bHRUYWdJRCIsIkRNIiwibXlVc2VySWQiLCJkbVJvb20iLCJvdGhlck1lbWJlcnMiLCJnZXRKb2luZWRNZW1iZXJzIiwiaGFzIiwiZ2V0TWVtYmVyIiwic2VhcmNoVHlwZXMiLCJtYXhTZWFyY2hFdmVudHMiLCJsYXN0RXZlbnRUcyIsInRpbWVsaW5lIiwiZ2V0VHlwZSIsImdldFRzIiwibGFzdEFjdGl2ZSIsInNvcnQiLCJhIiwiYiIsImFjdGl2aXR5U2NvcmVzIiwiYnVpbGRBY3Rpdml0eVNjb3JlcyIsIm1lbWJlclNjb3JlcyIsImJ1aWxkTWVtYmVyU2NvcmVzIiwibWVtYmVyQ29tcGFyYXRvciIsImNvbXBhcmVNZW1iZXJzIiwiT2JqZWN0IiwidmFsdWVzIiwidXNlck1hcCIsIk1hcCIsInNob3dBbnlJbnZpdGVFcnJvcnMiLCJzdGF0ZXMiLCJpbnZpdGVyIiwibmV3TWVtYmVyIiwic3RhcnRzV2l0aCIsIm5ld1RhcmdldHMiLCJyZW5kZXJTZWN0aW9uIiwic291cmNlTWVtYmVycyIsInNob3dOdW0iLCJzaG93TW9yZUZuIiwic2hvd01vcmVSZWNlbnRzIiwiYmluZCIsInNob3dNb3JlU3VnZ2VzdGlvbnMiLCJzZWN0aW9uTmFtZSIsInByaW9yaXR5QWRkaXRpb25hbE1lbWJlcnMiLCJvdGhlckFkZGl0aW9uYWxNZW1iZXJzIiwiaGFzTWl4aW5zIiwibm90QWxyZWFkeUV4aXN0cyIsInNvbWUiLCJoYXNBZGRpdGlvbmFsTWVtYmVycyIsImZpbHRlckJ5IiwidG9SZW5kZXIiLCJoYXNNb3JlIiwic2hvd01vcmUiLCJ0aWxlcyIsInRvZ2dsZU1lbWJlciIsInJlbmRlckVkaXRvciIsImhhc1BsYWNlaG9sZGVyIiwiaW5wdXQiLCJvbktleURvd24iLCJ1cGRhdGVGaWx0ZXIiLCJvblBhc3RlIiwib25DbGlja0lucHV0QXJlYSIsInJlbmRlcklkZW50aXR5U2VydmVyV2FybmluZyIsImRlZmF1bHRJZGVudGl0eVNlcnZlclVybCIsImdldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCIsImRlZmF1bHRJZGVudGl0eVNlcnZlck5hbWUiLCJhYmJyZXZpYXRlVXJsIiwic3ViIiwib25Vc2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXJDbGljayIsInNldHRpbmdzIiwib25NYW5hZ2VTZXR0aW5nc0NsaWNrIiwib25MaW5rQ2xpY2siLCJzZWxlY3RUZXh0Iiwic2NyZWVuTmFtZSIsIktJTkRfRE0iLCJzcGlubmVyIiwiaGVscFRleHQiLCJidXR0b25UZXh0IiwiZ29CdXR0b25GbiIsImNvbnN1bHRDb25uZWN0U2VjdGlvbiIsImV4dHJhU2VjdGlvbiIsImZvb3RlciIsImtleVNoYXJpbmdXYXJuaW5nIiwiaWRlbnRpdHlTZXJ2ZXJzRW5hYmxlZCIsImhhc1NlbGVjdGlvbiIsIm1ha2VVc2VyUGVybWFsaW5rIiwic3RhcnREbSIsImxpbmsiLCJpc1NwYWNlIiwiaXNTcGFjZVJvb20iLCJzcGFjZU5hbWUiLCJyb29tTmFtZSIsImhlbHBUZXh0VW50cmFuc2xhdGVkIiwiX3RkIiwibWFrZVJvb21QZXJtYWxpbmsiLCJpbnZpdGVVc2VycyIsImlzUm9vbUVuY3J5cHRlZCIsInZpc2liaWxpdHlFdmVudCIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwidmlzaWJpbGl0eSIsImdldENvbnRlbnQiLCJoaXN0b3J5X3Zpc2liaWxpdHkiLCJvbkNvbnN1bHRGaXJzdENoYW5nZSIsIm9uQ2FuY2VsIiwiZ29CdXR0b24iLCJ1c2Vyc1NlY3Rpb24iLCJkaWFsb2dDb250ZW50IiwidGFicyIsIlRhYiIsImJhY2tzcGFjZUJ1dHRvbiIsIm9uRGVsZXRlUHJlc3MiLCJkaWFsUGFkRmllbGQiLCJvbkRpYWxDaGFuZ2UiLCJkaWFsUGFkU2VjdGlvbiIsIm9uRGlhbEZvcm1TdWJtaXQiLCJvbkRpZ2l0UHJlc3MiLCJEaWFsUGFkIiwiVGFiTG9jYXRpb24iLCJUT1AiLCJvblRhYkNoYW5nZSIsImNsYXNzTmFtZXMiLCJteF9JbnZpdGVEaWFsb2dfdHJhbnNmZXIiLCJteF9JbnZpdGVEaWFsb2dfb3RoZXIiLCJteF9JbnZpdGVEaWFsb2dfaGFzRm9vdGVyIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9JbnZpdGVEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgTWF0cml4Q2FsbCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgSWNvbiBhcyBJbmZvSWNvbiB9IGZyb20gXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvaW5mby5zdmdcIjtcbmltcG9ydCB7IEljb24gYXMgRW1haWxQaWxsQXZhdGFySWNvbiB9IGZyb20gXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2ljb24tZW1haWwtcGlsbC1hdmF0YXIuc3ZnXCI7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgbWFrZVJvb21QZXJtYWxpbmssIG1ha2VVc2VyUGVybWFsaW5rIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCAqIGFzIEVtYWlsIGZyb20gXCIuLi8uLi8uLi9lbWFpbFwiO1xuaW1wb3J0IHsgZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsLCBzZXRUb0RlZmF1bHRJZGVudGl0eVNlcnZlciB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9JZGVudGl0eVNlcnZlclV0aWxzXCI7XG5pbXBvcnQgeyBidWlsZEFjdGl2aXR5U2NvcmVzLCBidWlsZE1lbWJlclNjb3JlcywgY29tcGFyZU1lbWJlcnMgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvU29ydE1lbWJlcnNcIjtcbmltcG9ydCB7IGFiYnJldmlhdGVVcmwgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvVXJsVXRpbHNcIjtcbmltcG9ydCBJZGVudGl0eUF1dGhDbGllbnQgZnJvbSBcIi4uLy4uLy4uL0lkZW50aXR5QXV0aENsaWVudFwiO1xuaW1wb3J0IHsgaHVtYW5pemVUaW1lIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2h1bWFuaXplXCI7XG5pbXBvcnQge1xuICAgIElJbnZpdGVSZXN1bHQsXG4gICAgaW52aXRlTXVsdGlwbGVUb1Jvb20sXG4gICAgc2hvd0FueUludml0ZUVycm9ycyxcbn0gZnJvbSBcIi4uLy4uLy4uL1Jvb21JbnZpdGVcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IERlZmF1bHRUYWdJRCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L21vZGVsc1wiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFVJRmVhdHVyZSB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCB7IG1lZGlhRnJvbU14YyB9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IEJhc2VBdmF0YXIgZnJvbSAnLi4vYXZhdGFycy9CYXNlQXZhdGFyJztcbmltcG9ydCB7IFNlYXJjaFJlc3VsdEF2YXRhciB9IGZyb20gXCIuLi9hdmF0YXJzL1NlYXJjaFJlc3VsdEF2YXRhclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCB7IHNlbGVjdFRleHQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9zdHJpbmdzJztcbmltcG9ydCBGaWVsZCBmcm9tICcuLi9lbGVtZW50cy9GaWVsZCc7XG5pbXBvcnQgVGFiYmVkVmlldywgeyBUYWIsIFRhYkxvY2F0aW9uIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9UYWJiZWRWaWV3JztcbmltcG9ydCBEaWFscGFkIGZyb20gJy4uL3ZvaXAvRGlhbFBhZCc7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4vUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRGlhbFBhZEJhY2tzcGFjZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbFBhZEJhY2tzcGFjZUJ1dHRvblwiO1xuaW1wb3J0IExlZ2FjeUNhbGxIYW5kbGVyIGZyb20gXCIuLi8uLi8uLi9MZWdhY3lDYWxsSGFuZGxlclwiO1xuaW1wb3J0IFVzZXJJZGVudGlmaWVyQ3VzdG9taXNhdGlvbnMgZnJvbSAnLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvVXNlcklkZW50aWZpZXInO1xuaW1wb3J0IENvcHlhYmxlVGV4dCBmcm9tIFwiLi4vZWxlbWVudHMvQ29weWFibGVUZXh0XCI7XG5pbXBvcnQgeyBTY3JlZW5OYW1lIH0gZnJvbSAnLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzJztcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuaW1wb3J0IHtcbiAgICBEaXJlY3RvcnlNZW1iZXIsXG4gICAgSURNVXNlclRpbGVQcm9wcyxcbiAgICBNZW1iZXIsXG4gICAgc3RhcnREbU9uRmlyc3RNZXNzYWdlLFxuICAgIFRocmVlcGlkTWVtYmVyLFxufSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvZGlyZWN0LW1lc3NhZ2VzXCI7XG5pbXBvcnQgeyBBbnlJbnZpdGVLaW5kLCBLSU5EX0NBTExfVFJBTlNGRVIsIEtJTkRfRE0sIEtJTkRfSU5WSVRFIH0gZnJvbSAnLi9JbnZpdGVEaWFsb2dUeXBlcyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5cbi8vIHdlIGhhdmUgYSBudW1iZXIgb2YgdHlwZXMgZGVmaW5lZCBmcm9tIHRoZSBNYXRyaXggc3BlYyB3aGljaCBjYW4ndCByZWFzb25hYmx5IGJlIGFsdGVyZWQgaGVyZS5cbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuXG5pbnRlcmZhY2UgSVJlY2VudFVzZXIge1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICAgIHVzZXI6IFJvb21NZW1iZXI7XG4gICAgbGFzdEFjdGl2ZTogbnVtYmVyO1xufVxuXG5jb25zdCBJTklUSUFMX1JPT01TX1NIT1dOID0gMzsgLy8gTnVtYmVyIG9mIHJvb21zIHRvIHNob3cgYXQgZmlyc3RcbmNvbnN0IElOQ1JFTUVOVF9ST09NU19TSE9XTiA9IDU7IC8vIE51bWJlciBvZiByb29tcyB0byBhZGQgd2hlbiAnc2hvdyBtb3JlJyBpcyBjbGlja2VkXG5cbmVudW0gVGFiSWQge1xuICAgIFVzZXJEaXJlY3RvcnkgPSAndXNlcnMnLFxuICAgIERpYWxQYWQgPSAnZGlhbHBhZCcsXG59XG5cbmNsYXNzIERNVXNlclRpbGUgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElETVVzZXJUaWxlUHJvcHM+IHtcbiAgICBwcml2YXRlIG9uUmVtb3ZlID0gKGUpID0+IHtcbiAgICAgICAgLy8gU3RvcCB0aGUgYnJvd3NlciBmcm9tIGhpZ2hsaWdodGluZyB0ZXh0XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMubWVtYmVyKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBhdmF0YXJTaXplID0gMjA7XG4gICAgICAgIGNvbnN0IGF2YXRhciA9IDxTZWFyY2hSZXN1bHRBdmF0YXIgdXNlcj17dGhpcy5wcm9wcy5tZW1iZXJ9IHNpemU9e2F2YXRhclNpemV9IC8+O1xuXG4gICAgICAgIGxldCBjbG9zZUJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25SZW1vdmUpIHtcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3VzZXJUaWxlX3JlbW92ZSdcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJlbW92ZX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvaWNvbi1waWxsLXJlbW92ZS5zdmdcIikuZGVmYXVsdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdD17X3QoJ1JlbW92ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezh9XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezh9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyVGlsZSc+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfdXNlclRpbGVfcGlsbCc+XG4gICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyIH1cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfdXNlclRpbGVfbmFtZSc+eyB0aGlzLnByb3BzLm1lbWJlci5uYW1lIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIHsgY2xvc2VCdXR0b24gfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElETVJvb21UaWxlUHJvcHMge1xuICAgIG1lbWJlcjogTWVtYmVyO1xuICAgIGxhc3RBY3RpdmVUczogbnVtYmVyO1xuICAgIG9uVG9nZ2xlKG1lbWJlcjogTWVtYmVyKTogdm9pZDtcbiAgICBoaWdobGlnaHRXb3JkOiBzdHJpbmc7XG4gICAgaXNTZWxlY3RlZDogYm9vbGVhbjtcbn1cblxuY2xhc3MgRE1Sb29tVGlsZSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SURNUm9vbVRpbGVQcm9wcz4ge1xuICAgIHByaXZhdGUgb25DbGljayA9IChlKSA9PiB7XG4gICAgICAgIC8vIFN0b3AgdGhlIGJyb3dzZXIgZnJvbSBoaWdobGlnaHRpbmcgdGV4dFxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vblRvZ2dsZSh0aGlzLnByb3BzLm1lbWJlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgaGlnaGxpZ2h0TmFtZShzdHI6IHN0cmluZykge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuaGlnaGxpZ2h0V29yZCkgcmV0dXJuIHN0cjtcblxuICAgICAgICAvLyBXZSBjb252ZXJ0IHRoaW5ncyB0byBsb3dlcmNhc2UgZm9yIGluZGV4IHNlYXJjaGluZywgYnV0IHB1bGwgc3Vic3RyaW5ncyBmcm9tXG4gICAgICAgIC8vIHRoZSBzdWJtaXR0ZWQgdGV4dCB0byBwcmVzZXJ2ZSBjYXNlLiBOb3RlOiB3ZSBkb24ndCBuZWVkIHRvIGh0bWxFbnRpdGllcyB0aGVcbiAgICAgICAgLy8gc3RyaW5nIGJlY2F1c2UgUmVhY3Qgd2lsbCBzYWZlbHkgZW5jb2RlIHRoZSB0ZXh0IGZvciB1cy5cbiAgICAgICAgY29uc3QgbG93ZXJTdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgZmlsdGVyU3RyID0gdGhpcy5wcm9wcy5oaWdobGlnaHRXb3JkLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgaWk7XG4gICAgICAgIHdoaWxlICgoaWkgPSBsb3dlclN0ci5pbmRleE9mKGZpbHRlclN0ciwgaSkpID49IDApIHtcbiAgICAgICAgICAgIC8vIFB1c2ggYW55IHRleHQgd2UgbWlzc2VkIChmaXJzdCBiaXQvbWlkZGxlIG9mIHRleHQpXG4gICAgICAgICAgICBpZiAoaWkgPiBpKSB7XG4gICAgICAgICAgICAgICAgLy8gUHVzaCBhbnkgdGV4dCB3ZSBhcmVuJ3QgaGlnaGxpZ2h0aW5nIChtaWRkbGUgb2YgdGV4dCBtYXRjaCwgb3IgYmVnaW5uaW5nIG9mIHRleHQpXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goPHNwYW4ga2V5PXtpICsgJ2JlZ2luJ30+eyBzdHIuc3Vic3RyaW5nKGksIGlpKSB9PC9zcGFuPik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGkgPSBpaTsgLy8gY29weSBvdmVyIGlpIG9ubHkgaWYgd2UgaGF2ZSBhIG1hdGNoICh0byBwcmVzZXJ2ZSBpIGZvciBlbmQtb2YtdGV4dCBtYXRjaGluZylcblxuICAgICAgICAgICAgLy8gSGlnaGxpZ2h0IHRoZSB3b3JkIHRoZSB1c2VyIGVudGVyZWRcbiAgICAgICAgICAgIGNvbnN0IHN1YnN0ciA9IHN0ci5zdWJzdHJpbmcoaSwgZmlsdGVyU3RyLmxlbmd0aCArIGkpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfdGlsZS0tcm9vbV9oaWdobGlnaHQnIGtleT17aSArICdib2xkJ30+eyBzdWJzdHIgfTwvc3Bhbj4pO1xuICAgICAgICAgICAgaSArPSBzdWJzdHIubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHVzaCBhbnkgdGV4dCB3ZSBtaXNzZWQgKGVuZCBvZiB0ZXh0KVxuICAgICAgICBpZiAoaSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKDxzcGFuIGtleT17aSArICdlbmQnfT57IHN0ci5zdWJzdHJpbmcoaSkgfTwvc3Bhbj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCB0aW1lc3RhbXAgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5sYXN0QWN0aXZlVHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGh1bWFuVHMgPSBodW1hbml6ZVRpbWUodGhpcy5wcm9wcy5sYXN0QWN0aXZlVHMpO1xuICAgICAgICAgICAgdGltZXN0YW1wID0gPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfdGlsZS0tcm9vbV90aW1lJz57IGh1bWFuVHMgfTwvc3Bhbj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhdmF0YXJTaXplID0gMzY7XG4gICAgICAgIGNvbnN0IGF2YXRhciA9ICh0aGlzLnByb3BzLm1lbWJlciBhcyBUaHJlZXBpZE1lbWJlcikuaXNFbWFpbFxuICAgICAgICAgICAgPyA8RW1haWxQaWxsQXZhdGFySWNvblxuICAgICAgICAgICAgICAgIHdpZHRoPXthdmF0YXJTaXplfVxuICAgICAgICAgICAgICAgIGhlaWdodD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA6IDxCYXNlQXZhdGFyXG4gICAgICAgICAgICAgICAgdXJsPXt0aGlzLnByb3BzLm1lbWJlci5nZXRNeGNBdmF0YXJVcmwoKVxuICAgICAgICAgICAgICAgICAgICA/IG1lZGlhRnJvbU14Yyh0aGlzLnByb3BzLm1lbWJlci5nZXRNeGNBdmF0YXJVcmwoKSkuZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cChhdmF0YXJTaXplKVxuICAgICAgICAgICAgICAgICAgICA6IG51bGx9XG4gICAgICAgICAgICAgICAgbmFtZT17dGhpcy5wcm9wcy5tZW1iZXIubmFtZX1cbiAgICAgICAgICAgICAgICBpZE5hbWU9e3RoaXMucHJvcHMubWVtYmVyLnVzZXJJZH1cbiAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9e2F2YXRhclNpemV9IC8+O1xuXG4gICAgICAgIGxldCBjaGVja21hcmsgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAvLyBUbyByZWR1Y2UgZmxpY2tlcmluZyB3ZSBwdXQgdGhlICdzZWxlY3RlZCcgcm9vbSB0aWxlIGFib3ZlIHRoZSByZWFsIGF2YXRhclxuICAgICAgICAgICAgY2hlY2ttYXJrID0gPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ190aWxlLS1yb29tX3NlbGVjdGVkJyAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRvIHJlZHVjZSBmbGlja2VyaW5nIHdlIHB1dCB0aGUgY2hlY2ttYXJrIG9uIHRvcCBvZiB0aGUgYWN0dWFsIGF2YXRhciAocHJldmVudHNcbiAgICAgICAgLy8gdGhlIGJyb3dzZXIgZnJvbSByZWxvYWRpbmcgdGhlIGltYWdlIHNvdXJjZSB3aGVuIHRoZSBhdmF0YXIgcmVtb3VudHMpLlxuICAgICAgICBjb25zdCBzdGFja2VkQXZhdGFyID0gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfdGlsZV9hdmF0YXJTdGFjayc+XG4gICAgICAgICAgICAgICAgeyBhdmF0YXIgfVxuICAgICAgICAgICAgICAgIHsgY2hlY2ttYXJrIH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB1c2VySWRlbnRpZmllciA9IFVzZXJJZGVudGlmaWVyQ3VzdG9taXNhdGlvbnMuZ2V0RGlzcGxheVVzZXJJZGVudGlmaWVyKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tZW1iZXIudXNlcklkLCB7IHdpdGhEaXNwbGF5TmFtZTogdHJ1ZSB9LFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGNhcHRpb24gPSAodGhpcy5wcm9wcy5tZW1iZXIgYXMgVGhyZWVwaWRNZW1iZXIpLmlzRW1haWxcbiAgICAgICAgICAgID8gX3QoXCJJbnZpdGUgYnkgZW1haWxcIilcbiAgICAgICAgICAgIDogdGhpcy5oaWdobGlnaHROYW1lKHVzZXJJZGVudGlmaWVyKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ190aWxlIG14X0ludml0ZURpYWxvZ190aWxlLS1yb29tJyBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PlxuICAgICAgICAgICAgICAgIHsgc3RhY2tlZEF2YXRhciB9XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfSW52aXRlRGlhbG9nX3RpbGVfbmFtZVN0YWNrXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfdGlsZV9uYW1lU3RhY2tfbmFtZSc+eyB0aGlzLmhpZ2hsaWdodE5hbWUodGhpcy5wcm9wcy5tZW1iZXIubmFtZSkgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW52aXRlRGlhbG9nX3RpbGVfbmFtZVN0YWNrX3VzZXJJZCc+eyBjYXB0aW9uIH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgeyB0aW1lc3RhbXAgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSUludml0ZURpYWxvZ1Byb3BzIHtcbiAgICAvLyBUYWtlcyBhIGJvb2xlYW4gd2hpY2ggaXMgdHJ1ZSBpZiBhIHVzZXIgLyB1c2VycyB3ZXJlIGludml0ZWQgL1xuICAgIC8vIGEgY2FsbCB0cmFuc2ZlciB3YXMgaW5pdGlhdGVkIG9yIGZhbHNlIGlmIHRoZSBkaWFsb2cgd2FzIGNhbmNlbGxlZFxuICAgIC8vIHdpdGggbm8gYWN0aW9uIHRha2VuLlxuICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkO1xuXG4gICAgLy8gVGhlIGtpbmQgb2YgaW52aXRlIGJlaW5nIHBlcmZvcm1lZC4gQXNzdW1lZCB0byBiZSBLSU5EX0RNIGlmXG4gICAgLy8gbm90IHByb3ZpZGVkLlxuICAgIGtpbmQ6IEFueUludml0ZUtpbmQ7XG5cbiAgICAvLyBUaGUgcm9vbSBJRCB0aGlzIGRpYWxvZyBpcyBmb3IuIE9ubHkgcmVxdWlyZWQgZm9yIEtJTkRfSU5WSVRFLlxuICAgIHJvb21JZDogc3RyaW5nO1xuXG4gICAgLy8gVGhlIGNhbGwgdG8gdHJhbnNmZXIuIE9ubHkgcmVxdWlyZWQgZm9yIEtJTkRfQ0FMTF9UUkFOU0ZFUi5cbiAgICBjYWxsOiBNYXRyaXhDYWxsO1xuXG4gICAgLy8gSW5pdGlhbCB2YWx1ZSB0byBwb3B1bGF0ZSB0aGUgZmlsdGVyIHdpdGhcbiAgICBpbml0aWFsVGV4dDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSUludml0ZURpYWxvZ1N0YXRlIHtcbiAgICB0YXJnZXRzOiBNZW1iZXJbXTsgLy8gYXJyYXkgb2YgTWVtYmVyIG9iamVjdHMgKHNlZSBpbnRlcmZhY2UgYWJvdmUpXG4gICAgZmlsdGVyVGV4dDogc3RyaW5nO1xuICAgIHJlY2VudHM6IHsgdXNlcjogTWVtYmVyLCB1c2VySWQ6IHN0cmluZyB9W107XG4gICAgbnVtUmVjZW50c1Nob3duOiBudW1iZXI7XG4gICAgc3VnZ2VzdGlvbnM6IHsgdXNlcjogTWVtYmVyLCB1c2VySWQ6IHN0cmluZyB9W107XG4gICAgbnVtU3VnZ2VzdGlvbnNTaG93bjogbnVtYmVyO1xuICAgIHNlcnZlclJlc3VsdHNNaXhpbjogeyB1c2VyOiBNZW1iZXIsIHVzZXJJZDogc3RyaW5nIH1bXTtcbiAgICB0aHJlZXBpZFJlc3VsdHNNaXhpbjogeyB1c2VyOiBNZW1iZXIsIHVzZXJJZDogc3RyaW5nfVtdO1xuICAgIGNhblVzZUlkZW50aXR5U2VydmVyOiBib29sZWFuO1xuICAgIHRyeWluZ0lkZW50aXR5U2VydmVyOiBib29sZWFuO1xuICAgIGNvbnN1bHRGaXJzdDogYm9vbGVhbjtcbiAgICBkaWFsUGFkVmFsdWU6IHN0cmluZztcbiAgICBjdXJyZW50VGFiSWQ6IFRhYklkO1xuXG4gICAgLy8gVGhlc2UgdHdvIGZsYWdzIGFyZSB1c2VkIGZvciB0aGUgJ0dvJyBidXR0b24gdG8gY29tbXVuaWNhdGUgd2hhdCBpcyBnb2luZyBvbi5cbiAgICBidXN5OiBib29sZWFuO1xuICAgIGVycm9yVGV4dDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnZpdGVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElJbnZpdGVEaWFsb2dQcm9wcywgSUludml0ZURpYWxvZ1N0YXRlPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAga2luZDogS0lORF9ETSxcbiAgICAgICAgaW5pdGlhbFRleHQ6IFwiXCIsXG4gICAgfTtcblxuICAgIHByaXZhdGUgY2xvc2VDb3BpZWRUb29sdGlwOiAoKSA9PiB2b2lkO1xuICAgIHByaXZhdGUgZGVib3VuY2VUaW1lcjogbnVtYmVyID0gbnVsbDsgLy8gYWN0dWFsbHkgbnVtYmVyIGJlY2F1c2Ugd2UncmUgaW4gdGhlIGJyb3dzZXJcbiAgICBwcml2YXRlIGVkaXRvclJlZiA9IGNyZWF0ZVJlZjxIVE1MSW5wdXRFbGVtZW50PigpO1xuICAgIHByaXZhdGUgbnVtYmVyRW50cnlGaWVsZFJlZjogUmVhY3QuUmVmT2JqZWN0PEZpZWxkPiA9IGNyZWF0ZVJlZigpO1xuICAgIHByaXZhdGUgdW5tb3VudGVkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgaWYgKChwcm9wcy5raW5kID09PSBLSU5EX0lOVklURSkgJiYgIXByb3BzLnJvb21JZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2hlbiB1c2luZyBLSU5EX0lOVklURSBhIHJvb21JZCBpcyByZXF1aXJlZCBmb3IgYW4gSW52aXRlRGlhbG9nXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3BzLmtpbmQgPT09IEtJTkRfQ0FMTF9UUkFOU0ZFUiAmJiAhcHJvcHMuY2FsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2hlbiB1c2luZyBLSU5EX0NBTExfVFJBTlNGRVIgYSBjYWxsIGlzIHJlcXVpcmVkIGZvciBhbiBJbnZpdGVEaWFsb2dcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhbHJlYWR5SW52aXRlZCA9IG5ldyBTZXQoW01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSwgU2RrQ29uZmlnLmdldChcIndlbGNvbWVfdXNlcl9pZFwiKV0pO1xuICAgICAgICBpZiAocHJvcHMucm9vbUlkKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocHJvcHMucm9vbUlkKTtcbiAgICAgICAgICAgIGlmICghcm9vbSkgdGhyb3cgbmV3IEVycm9yKFwiUm9vbSBJRCBnaXZlbiB0byBJbnZpdGVEaWFsb2cgZG9lcyBub3QgbG9vayBsaWtlIGEgcm9vbVwiKTtcbiAgICAgICAgICAgIHJvb20uZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwKCdpbnZpdGUnKS5mb3JFYWNoKG0gPT4gYWxyZWFkeUludml0ZWQuYWRkKG0udXNlcklkKSk7XG4gICAgICAgICAgICByb29tLmdldE1lbWJlcnNXaXRoTWVtYmVyc2hpcCgnam9pbicpLmZvckVhY2gobSA9PiBhbHJlYWR5SW52aXRlZC5hZGQobS51c2VySWQpKTtcbiAgICAgICAgICAgIC8vIGFkZCBiYW5uZWQgdXNlcnMsIHNvIHdlIGRvbid0IHRyeSB0byBpbnZpdGUgdGhlbVxuICAgICAgICAgICAgcm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoJ2JhbicpLmZvckVhY2gobSA9PiBhbHJlYWR5SW52aXRlZC5hZGQobS51c2VySWQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB0YXJnZXRzOiBbXSwgLy8gYXJyYXkgb2YgTWVtYmVyIG9iamVjdHMgKHNlZSBpbnRlcmZhY2UgYWJvdmUpXG4gICAgICAgICAgICBmaWx0ZXJUZXh0OiB0aGlzLnByb3BzLmluaXRpYWxUZXh0LFxuICAgICAgICAgICAgcmVjZW50czogSW52aXRlRGlhbG9nLmJ1aWxkUmVjZW50cyhhbHJlYWR5SW52aXRlZCksXG4gICAgICAgICAgICBudW1SZWNlbnRzU2hvd246IElOSVRJQUxfUk9PTVNfU0hPV04sXG4gICAgICAgICAgICBzdWdnZXN0aW9uczogdGhpcy5idWlsZFN1Z2dlc3Rpb25zKGFscmVhZHlJbnZpdGVkKSxcbiAgICAgICAgICAgIG51bVN1Z2dlc3Rpb25zU2hvd246IElOSVRJQUxfUk9PTVNfU0hPV04sXG4gICAgICAgICAgICBzZXJ2ZXJSZXN1bHRzTWl4aW46IFtdLFxuICAgICAgICAgICAgdGhyZWVwaWRSZXN1bHRzTWl4aW46IFtdLFxuICAgICAgICAgICAgY2FuVXNlSWRlbnRpdHlTZXJ2ZXI6ICEhTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCksXG4gICAgICAgICAgICB0cnlpbmdJZGVudGl0eVNlcnZlcjogZmFsc2UsXG4gICAgICAgICAgICBjb25zdWx0Rmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbFBhZFZhbHVlOiAnJyxcbiAgICAgICAgICAgIGN1cnJlbnRUYWJJZDogVGFiSWQuVXNlckRpcmVjdG9yeSxcblxuICAgICAgICAgICAgLy8gVGhlc2UgdHdvIGZsYWdzIGFyZSB1c2VkIGZvciB0aGUgJ0dvJyBidXR0b24gdG8gY29tbXVuaWNhdGUgd2hhdCBpcyBnb2luZyBvbi5cbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3JUZXh0OiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pbml0aWFsVGV4dCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdWdnZXN0aW9ucyh0aGlzLnByb3BzLmluaXRpYWxUZXh0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLnVubW91bnRlZCA9IHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBDb3BpZWQgdG9vbHRpcCBpcyBvcGVuIHRoZW4gZ2V0IHJpZCBvZiBpdCwgdGhlcmUgYXJlIHdheXMgdG8gY2xvc2UgdGhlIG1vZGFsIHdoaWNoIHdvdWxkbid0IGNsb3NlXG4gICAgICAgIC8vIHRoZSB0b29sdGlwIG90aGVyd2lzZSwgc3VjaCBhcyBwcmVzc2luZyBFc2NhcGUgb3IgY2xpY2tpbmcgWCByZWFsbHkgcXVpY2tseVxuICAgICAgICBpZiAodGhpcy5jbG9zZUNvcGllZFRvb2x0aXApIHRoaXMuY2xvc2VDb3BpZWRUb29sdGlwKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNvbnN1bHRGaXJzdENoYW5nZSA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uc3VsdEZpcnN0OiBldi50YXJnZXQuY2hlY2tlZCB9KTtcbiAgICB9O1xuXG4gICAgcHVibGljIHN0YXRpYyBidWlsZFJlY2VudHMoZXhjbHVkZWRUYXJnZXRJZHM6IFNldDxzdHJpbmc+KTogSVJlY2VudFVzZXJbXSB7XG4gICAgICAgIGNvbnN0IHJvb21zID0gRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVuaXF1ZVJvb21zV2l0aEluZGl2aWR1YWxzKCk7IC8vIG1hcCBvZiB1c2VySWQgPT4ganMtc2RrIFJvb21cblxuICAgICAgICAvLyBBbHNvIHB1bGwgaW4gYWxsIHRoZSByb29tcyB0YWdnZWQgYXMgRGVmYXVsdFRhZ0lELkRNIHNvIHdlIGRvbid0IG1pc3MgYW55dGhpbmcuIFNvbWV0aW1lcyB0aGVcbiAgICAgICAgLy8gcm9vbSBsaXN0IGRvZXNuJ3QgdGFnIHRoZSByb29tIGZvciB0aGUgRE1Sb29tTWFwLCBidXQgZG9lcyBmb3IgdGhlIHJvb20gbGlzdC5cbiAgICAgICAgY29uc3QgZG1UYWdnZWRSb29tcyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzW0RlZmF1bHRUYWdJRC5ETV0gfHwgW107XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGRtUm9vbSBvZiBkbVRhZ2dlZFJvb21zKSB7XG4gICAgICAgICAgICBjb25zdCBvdGhlck1lbWJlcnMgPSBkbVJvb20uZ2V0Sm9pbmVkTWVtYmVycygpLmZpbHRlcih1ID0+IHUudXNlcklkICE9PSBteVVzZXJJZCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBvdGhlck1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAocm9vbXNbbWVtYmVyLnVzZXJJZF0pIGNvbnRpbnVlOyAvLyBhbHJlYWR5IGhhdmUgYSByb29tXG5cbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgQWRkaW5nIERNIHJvb20gZm9yICR7bWVtYmVyLnVzZXJJZH0gYXMgJHtkbVJvb20ucm9vbUlkfSBmcm9tIHRhZywgbm90IERNIG1hcGApO1xuICAgICAgICAgICAgICAgIHJvb21zW21lbWJlci51c2VySWRdID0gZG1Sb29tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVjZW50cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHVzZXJJZCBpbiByb29tcykge1xuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCB1c2VyIElEcyB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSByb29tIC8gc2hvdWxkIGJlIGV4Y2x1ZGVkXG4gICAgICAgICAgICBpZiAoZXhjbHVkZWRUYXJnZXRJZHMuaGFzKHVzZXJJZCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgW0ludml0ZTpSZWNlbnRzXSBFeGNsdWRpbmcgJHt1c2VySWR9IGZyb20gcmVjZW50c2ApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByb29tID0gcm9vbXNbdXNlcklkXTtcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHJvb20uZ2V0TWVtYmVyKHVzZXJJZCk7XG4gICAgICAgICAgICBpZiAoIW1lbWJlcikge1xuICAgICAgICAgICAgICAgIC8vIGp1c3Qgc2tpcCBwZW9wbGUgd2hvIGRvbid0IGhhdmUgbWVtYmVyc2hpcHMgZm9yIHNvbWUgcmVhc29uXG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFtJbnZpdGU6UmVjZW50c10gJHt1c2VySWR9IGlzIG1pc3NpbmcgYSBtZW1iZXIgb2JqZWN0IGluIHRoZWlyIG93biBETSAoJHtyb29tLnJvb21JZH0pYCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGxhc3QgdGltZXN0YW1wIGZvciBhIG1lc3NhZ2UgZXZlbnRcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaFR5cGVzID0gW1wibS5yb29tLm1lc3NhZ2VcIiwgXCJtLnJvb20uZW5jcnlwdGVkXCIsIFwibS5zdGlja2VyXCJdO1xuICAgICAgICAgICAgY29uc3QgbWF4U2VhcmNoRXZlbnRzID0gMjA7IC8vIHRvIHByZXZlbnQgdHJhdmVyc2luZyBoaXN0b3J5XG4gICAgICAgICAgICBsZXQgbGFzdEV2ZW50VHMgPSAwO1xuICAgICAgICAgICAgaWYgKHJvb20udGltZWxpbmUgJiYgcm9vbS50aW1lbGluZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gcm9vbS50aW1lbGluZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldiA9IHJvb20udGltZWxpbmVbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWFyY2hUeXBlcy5pbmNsdWRlcyhldi5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0RXZlbnRUcyA9IGV2LmdldFRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocm9vbS50aW1lbGluZS5sZW5ndGggLSBpID4gbWF4U2VhcmNoRXZlbnRzKSBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWxhc3RFdmVudFRzKSB7XG4gICAgICAgICAgICAgICAgLy8gc29tZXRoaW5nIHdlaXJkIGlzIGdvaW5nIG9uIHdpdGggdGhpcyByb29tXG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFtJbnZpdGU6UmVjZW50c10gJHt1c2VySWR9ICgke3Jvb20ucm9vbUlkfSkgaGFzIGEgd2VpcmQgbGFzdCB0aW1lc3RhbXA6ICR7bGFzdEV2ZW50VHN9YCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlY2VudHMucHVzaCh7IHVzZXJJZCwgdXNlcjogbWVtYmVyLCBsYXN0QWN0aXZlOiBsYXN0RXZlbnRUcyB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlY2VudHMpIGxvZ2dlci53YXJuKFwiW0ludml0ZTpSZWNlbnRzXSBObyByZWNlbnRzIHRvIHN1Z2dlc3QhXCIpO1xuXG4gICAgICAgIC8vIFNvcnQgdGhlIHJlY2VudHMgYnkgbGFzdCBhY3RpdmUgdG8gc2F2ZSB1cyB0aW1lIGxhdGVyXG4gICAgICAgIHJlY2VudHMuc29ydCgoYSwgYikgPT4gYi5sYXN0QWN0aXZlIC0gYS5sYXN0QWN0aXZlKTtcblxuICAgICAgICByZXR1cm4gcmVjZW50cztcbiAgICB9XG5cbiAgICBwcml2YXRlIGJ1aWxkU3VnZ2VzdGlvbnMoZXhjbHVkZWRUYXJnZXRJZHM6IFNldDxzdHJpbmc+KToge3VzZXJJZDogc3RyaW5nLCB1c2VyOiBSb29tTWVtYmVyfVtdIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBhY3Rpdml0eVNjb3JlcyA9IGJ1aWxkQWN0aXZpdHlTY29yZXMoY2xpKTtcbiAgICAgICAgY29uc3QgbWVtYmVyU2NvcmVzID0gYnVpbGRNZW1iZXJTY29yZXMoY2xpKTtcbiAgICAgICAgY29uc3QgbWVtYmVyQ29tcGFyYXRvciA9IGNvbXBhcmVNZW1iZXJzKGFjdGl2aXR5U2NvcmVzLCBtZW1iZXJTY29yZXMpO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKG1lbWJlclNjb3JlcykubWFwKCh7IG1lbWJlciB9KSA9PiBtZW1iZXIpXG4gICAgICAgICAgICAuZmlsdGVyKG1lbWJlciA9PiAhZXhjbHVkZWRUYXJnZXRJZHMuaGFzKG1lbWJlci51c2VySWQpKVxuICAgICAgICAgICAgLnNvcnQobWVtYmVyQ29tcGFyYXRvcilcbiAgICAgICAgICAgIC5tYXAobWVtYmVyID0+ICh7IHVzZXJJZDogbWVtYmVyLnVzZXJJZCwgdXNlcjogbWVtYmVyIH0pKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3VsZEFib3J0QWZ0ZXJJbnZpdGVFcnJvcihyZXN1bHQ6IElJbnZpdGVSZXN1bHQsIHJvb206IFJvb20pOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJ1c3k6IGZhbHNlIH0pO1xuICAgICAgICBjb25zdCB1c2VyTWFwID0gbmV3IE1hcDxzdHJpbmcsIE1lbWJlcj4odGhpcy5zdGF0ZS50YXJnZXRzLm1hcChtZW1iZXIgPT4gW21lbWJlci51c2VySWQsIG1lbWJlcl0pKTtcbiAgICAgICAgcmV0dXJuICFzaG93QW55SW52aXRlRXJyb3JzKHJlc3VsdC5zdGF0ZXMsIHJvb20sIHJlc3VsdC5pbnZpdGVyLCB1c2VyTWFwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnZlcnRGaWx0ZXIoKTogTWVtYmVyW10ge1xuICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlcmUncyBhbnl0aGluZyB0byBjb252ZXJ0IGZpcnN0XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5maWx0ZXJUZXh0IHx8ICF0aGlzLnN0YXRlLmZpbHRlclRleHQuaW5jbHVkZXMoJ0AnKSkgcmV0dXJuIHRoaXMuc3RhdGUudGFyZ2V0cyB8fCBbXTtcblxuICAgICAgICBsZXQgbmV3TWVtYmVyOiBNZW1iZXI7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZpbHRlclRleHQuc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgICAvLyBBc3N1bWUgbXhpZFxuICAgICAgICAgICAgbmV3TWVtYmVyID0gbmV3IERpcmVjdG9yeU1lbWJlcih7IHVzZXJfaWQ6IHRoaXMuc3RhdGUuZmlsdGVyVGV4dCwgZGlzcGxheV9uYW1lOiBudWxsLCBhdmF0YXJfdXJsOiBudWxsIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLklkZW50aXR5U2VydmVyKSkge1xuICAgICAgICAgICAgLy8gQXNzdW1lIGVtYWlsXG4gICAgICAgICAgICBuZXdNZW1iZXIgPSBuZXcgVGhyZWVwaWRNZW1iZXIodGhpcy5zdGF0ZS5maWx0ZXJUZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdUYXJnZXRzID0gWy4uLih0aGlzLnN0YXRlLnRhcmdldHMgfHwgW10pLCBuZXdNZW1iZXJdO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFyZ2V0czogbmV3VGFyZ2V0cywgZmlsdGVyVGV4dDogJycgfSk7XG4gICAgICAgIHJldHVybiBuZXdUYXJnZXRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnREbSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldHMgPSB0aGlzLmNvbnZlcnRGaWx0ZXIoKTtcbiAgICAgICAgICAgIHN0YXJ0RG1PbkZpcnN0TWVzc2FnZShjbGksIHRhcmdldHMpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIldlIGNvdWxkbid0IGNyZWF0ZSB5b3VyIERNLlwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaW52aXRlVXNlcnMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlIH0pO1xuICAgICAgICB0aGlzLmNvbnZlcnRGaWx0ZXIoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuY29udmVydEZpbHRlcigpO1xuICAgICAgICBjb25zdCB0YXJnZXRJZHMgPSB0YXJnZXRzLm1hcCh0ID0+IHQudXNlcklkKTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGZpbmQgdGhlIHJvb20gdG8gaW52aXRlIHVzZXJzIHRvXCIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIlNvbWV0aGluZyB3ZW50IHdyb25nIHRyeWluZyB0byBpbnZpdGUgdGhlIHVzZXJzLlwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGludml0ZU11bHRpcGxlVG9Sb29tKHRoaXMucHJvcHMucm9vbUlkLCB0YXJnZXRJZHMsIHRydWUpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnNob3VsZEFib3J0QWZ0ZXJJbnZpdGVFcnJvcihyZXN1bHQsIHJvb20pKSB7IC8vIGhhbmRsZXMgc2V0dGluZyBlcnJvciBtZXNzYWdlIHRvb1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiV2UgY291bGRuJ3QgaW52aXRlIHRob3NlIHVzZXJzLiBQbGVhc2UgY2hlY2sgdGhlIHVzZXJzIHlvdSB3YW50IHRvIGludml0ZSBhbmQgdHJ5IGFnYWluLlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHRyYW5zZmVyQ2FsbCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VycmVudFRhYklkID09IFRhYklkLlVzZXJEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIHRoaXMuY29udmVydEZpbHRlcigpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuY29udmVydEZpbHRlcigpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0SWRzID0gdGFyZ2V0cy5tYXAodCA9PiB0LnVzZXJJZCk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0SWRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIkEgY2FsbCBjYW4gb25seSBiZSB0cmFuc2ZlcnJlZCB0byBhIHNpbmdsZSB1c2VyLlwiKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnN0YXJ0VHJhbnNmZXJUb01hdHJpeElEKFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2FsbCxcbiAgICAgICAgICAgICAgICB0YXJnZXRJZHNbMF0sXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5jb25zdWx0Rmlyc3QsXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2Uuc3RhcnRUcmFuc2ZlclRvUGhvbmVOdW1iZXIoXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jYWxsLFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZGlhbFBhZFZhbHVlLFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY29uc3VsdEZpcnN0LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGUpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYnVzeSkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZS50YXJnZXQudmFsdWUudHJpbSgpO1xuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBY2Nlc3NpYmlsaXR5QWN0aW9uKGUpO1xuXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uQmFja3NwYWNlOlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSB8fCB0aGlzLnN0YXRlLnRhcmdldHMubGVuZ3RoIDw9IDApIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgLy8gd2hlbiB0aGUgZmllbGQgaXMgZW1wdHkgYW5kIHRoZSB1c2VyIGhpdHMgYmFja3NwYWNlIHJlbW92ZSB0aGUgcmlnaHQtbW9zdCB0YXJnZXRcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU1lbWJlcih0aGlzLnN0YXRlLnRhcmdldHNbdGhpcy5zdGF0ZS50YXJnZXRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5TcGFjZTpcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlIHx8ICF2YWx1ZS5pbmNsdWRlcyhcIkBcIikgfHwgdmFsdWUuaW5jbHVkZXMoXCIgXCIpKSBicmVhaztcblxuICAgICAgICAgICAgICAgIC8vIHdoZW4gdGhlIHVzZXIgaGl0cyBzcGFjZSBhbmQgdGhlaXIgaW5wdXQgbG9va3MgbGlrZSBhbiBlLW1haWwvTVhJRCB0aGVuIHRyeSB0byBjb252ZXJ0IGl0XG4gICAgICAgICAgICAgICAgdGhpcy5jb252ZXJ0RmlsdGVyKCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRW50ZXI6XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAvLyB3aGVuIHRoZSB1c2VyIGhpdHMgZW50ZXIgd2l0aCBzb21ldGhpbmcgaW4gdGhlaXIgZmllbGQgdHJ5IHRvIGNvbnZlcnQgaXRcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnZlcnRGaWx0ZXIoKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVTdWdnZXN0aW9ucyA9IGFzeW5jICh0ZXJtKSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZWFyY2hVc2VyRGlyZWN0b3J5KHsgdGVybSB9KS50aGVuKGFzeW5jIHIgPT4ge1xuICAgICAgICAgICAgaWYgKHRlcm0gIT09IHRoaXMuc3RhdGUuZmlsdGVyVGV4dCkge1xuICAgICAgICAgICAgICAgIC8vIERpc2NhcmQgdGhlIHJlc3VsdHMgLSB3ZSB3ZXJlIHByb2JhYmx5IHRvbyBzbG93IG9uIHRoZSBzZXJ2ZXItc2lkZSB0byBtYWtlXG4gICAgICAgICAgICAgICAgLy8gdGhlc2UgcmVzdWx0cyB1c2VmdWwuIFRoaXMgaXMgYSByYWNlIHdlIHdhbnQgdG8gYXZvaWQgYmVjYXVzZSB3ZSBjb3VsZCBvdmVyd3JpdGVcbiAgICAgICAgICAgICAgICAvLyBtb3JlIGFjY3VyYXRlIHJlc3VsdHMuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXIucmVzdWx0cykgci5yZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIC8vIFdoaWxlIHdlJ3JlIGhlcmUsIHRyeSBhbmQgYXV0b2NvbXBsZXRlIGEgc2VhcmNoIHJlc3VsdCBmb3IgdGhlIG14aWQgaXRzZWxmXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSdzIG5vIG1hdGNoZXMgKGFuZCB0aGUgaW5wdXQgbG9va3MgbGlrZSBhIG14aWQpLlxuICAgICAgICAgICAgaWYgKHRlcm1bMF0gPT09ICdAJyAmJiB0ZXJtLmluZGV4T2YoJzonKSA+IDEpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFByb2ZpbGVJbmZvKHRlcm0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIHByb2ZpbGUsIHdlIGhhdmUgZW5vdWdoIGluZm9ybWF0aW9uIHRvIGFzc3VtZSB0aGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgbXhpZCBjYW4gYmUgaW52aXRlZCAtIGFkZCBpdCB0byB0aGUgbGlzdC4gV2Ugc3RpY2sgaXQgYXQgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0b3Agc28gaXQgaXMgbW9zdCBvYnZpb3VzbHkgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgICAgci5yZXN1bHRzLnNwbGljZSgwLCAwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogdGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5X25hbWU6IHByb2ZpbGVbJ2Rpc3BsYXluYW1lJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogcHJvZmlsZVsnYXZhdGFyX3VybCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiTm9uLWZhdGFsIGVycm9yIHRyeWluZyB0byBtYWtlIGFuIGludml0ZSBmb3IgYSB1c2VyIElEXCIpO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSByZXN1bHQgYW55d2F5cywganVzdCB3aXRob3V0IGEgcHJvZmlsZS4gV2Ugc3RpY2sgaXQgYXQgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvcCBzbyBpdCBpcyBtb3N0IG9idmlvdXNseSBwcmVzZW50ZWQgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgICAgIHIucmVzdWx0cy5zcGxpY2UoMCwgMCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogdGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlfbmFtZTogdGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2VydmVyUmVzdWx0c01peGluOiByLnJlc3VsdHMubWFwKHUgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1LnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IG5ldyBEaXJlY3RvcnlNZW1iZXIodSksXG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3Igc2VhcmNoaW5nIHVzZXIgZGlyZWN0b3J5OlwiKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZXJ2ZXJSZXN1bHRzTWl4aW46IFtdIH0pOyAvLyBjbGVhciByZXN1bHRzIGJlY2F1c2UgaXQncyBtb2RlcmF0ZWx5IGZhdGFsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFdoZW5ldmVyIHdlIHNlYXJjaCB0aGUgZGlyZWN0b3J5LCBhbHNvIHRyeSB0byBzZWFyY2ggdGhlIGlkZW50aXR5IHNlcnZlci4gSXQnc1xuICAgICAgICAvLyBhbGwgZGVib3VuY2VkIHRoZSBzYW1lIGFueXdheXMuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5jYW5Vc2VJZGVudGl0eVNlcnZlcikge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgZG9lc24ndCBoYXZlIGFuIGlkZW50aXR5IHNlcnZlciBzZXQgLSB3YXJuIHRoZW0gb2YgdGhhdC5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0cnlpbmdJZGVudGl0eVNlcnZlcjogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGVybS5pbmRleE9mKCdAJykgPiAwICYmIEVtYWlsLmxvb2tzVmFsaWQodGVybSkgJiYgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuSWRlbnRpdHlTZXJ2ZXIpKSB7XG4gICAgICAgICAgICAvLyBTdGFydCBvZmYgYnkgc3VnZ2VzdGluZyB0aGUgcGxhaW4gZW1haWwgd2hpbGUgd2UgdHJ5IGFuZCByZXNvbHZlIGl0XG4gICAgICAgICAgICAvLyB0byBhIHJlYWwgYWNjb3VudC5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIC8vIHBlciBhYm92ZTogdGhlIHVzZXJJZCBpcyBhIGxpZSBoZXJlIC0gaXQncyBqdXN0IGEgcmVndWxhciBpZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgdGhyZWVwaWRSZXN1bHRzTWl4aW46IFt7IHVzZXI6IG5ldyBUaHJlZXBpZE1lbWJlcih0ZXJtKSwgdXNlcklkOiB0ZXJtIH1dLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGF1dGhDbGllbnQgPSBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCBhdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRlcm0gIT09IHRoaXMuc3RhdGUuZmlsdGVyVGV4dCkgcmV0dXJuOyAvLyBhYmFuZG9uIGhvcGVcblxuICAgICAgICAgICAgICAgIGNvbnN0IGxvb2t1cCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5sb29rdXBUaHJlZVBpZChcbiAgICAgICAgICAgICAgICAgICAgJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgdGVybSxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLCAvLyBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0ZXJtICE9PSB0aGlzLnN0YXRlLmZpbHRlclRleHQpIHJldHVybjsgLy8gYWJhbmRvbiBob3BlXG5cbiAgICAgICAgICAgICAgICBpZiAoIWxvb2t1cCB8fCAhbG9va3VwLm14aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2Ugd2VyZW4ndCBhYmxlIHRvIGZpbmQgYW55b25lIC0gd2UncmUgYWxyZWFkeSBzdWdnZXN0aW5nIHRoZSBwbGFpbiBlbWFpbFxuICAgICAgICAgICAgICAgICAgICAvLyBhcyBhbiBhbHRlcm5hdGl2ZSwgc28gZG8gbm90aGluZy5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdlIGFwcGVuZCB0aGUgdXNlciBzdWdnZXN0aW9uIHRvIGdpdmUgdGhlIHVzZXIgYW4gb3B0aW9uIHRvIGNsaWNrXG4gICAgICAgICAgICAgICAgLy8gdGhlIGVtYWlsIGFueXdheXMsIGFuZCBzbyB3ZSBkb24ndCBjYXVzZSB0aGluZ3MgdG8ganVtcCBhcm91bmQuIEluXG4gICAgICAgICAgICAgICAgLy8gdGhlb3J5LCB0aGUgdXNlciB3b3VsZCBzZWUgdGhlIHVzZXIgcG9wIHVwIGFuZCB0aGluayBcImFoIHllcywgdGhhdFxuICAgICAgICAgICAgICAgIC8vIHBlcnNvbiFcIlxuICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHJvZmlsZUluZm8obG9va3VwLm14aWQpO1xuICAgICAgICAgICAgICAgIGlmICh0ZXJtICE9PSB0aGlzLnN0YXRlLmZpbHRlclRleHQgfHwgIXByb2ZpbGUpIHJldHVybjsgLy8gYWJhbmRvbiBob3BlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHRocmVlcGlkUmVzdWx0c01peGluOiBbLi4udGhpcy5zdGF0ZS50aHJlZXBpZFJlc3VsdHNNaXhpbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogbmV3IERpcmVjdG9yeU1lbWJlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogbG9va3VwLm14aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheV9uYW1lOiBwcm9maWxlLmRpc3BsYXluYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IHByb2ZpbGUuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBsb29rdXAubXhpZCxcbiAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3Igc2VhcmNoaW5nIGlkZW50aXR5IHNlcnZlcjpcIik7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0aHJlZXBpZFJlc3VsdHNNaXhpbjogW10gfSk7IC8vIGNsZWFyIHJlc3VsdHMgYmVjYXVzZSBpdCdzIG1vZGVyYXRlbHkgZmF0YWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZUZpbHRlciA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IHRlcm0gPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbHRlclRleHQ6IHRlcm0gfSk7XG5cbiAgICAgICAgLy8gRGVib3VuY2Ugc2VydmVyIGxvb2t1cHMgdG8gcmVkdWNlIHNwYW0uIFdlIGRvbid0IGNsZWFyIHRoZSBleGlzdGluZyBzZXJ2ZXJcbiAgICAgICAgLy8gcmVzdWx0cyBiZWNhdXNlIHRoZXkgbWlnaHQgc3RpbGwgYmUgdmFndWVseSBhY2N1cmF0ZSwgbGlrZXdpc2UgZm9yIHJhY2VzIHdoaWNoXG4gICAgICAgIC8vIGNvdWxkIGhhcHBlbiBoZXJlLlxuICAgICAgICBpZiAodGhpcy5kZWJvdW5jZVRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5kZWJvdW5jZVRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3VnZ2VzdGlvbnModGVybSk7XG4gICAgICAgIH0sIDE1MCk7IC8vIDE1MG1zIGRlYm91bmNlIChodW1hbiByZWFjdGlvbiB0aW1lICsgc29tZSlcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzaG93TW9yZVJlY2VudHMgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBudW1SZWNlbnRzU2hvd246IHRoaXMuc3RhdGUubnVtUmVjZW50c1Nob3duICsgSU5DUkVNRU5UX1JPT01TX1NIT1dOIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNob3dNb3JlU3VnZ2VzdGlvbnMgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBudW1TdWdnZXN0aW9uc1Nob3duOiB0aGlzLnN0YXRlLm51bVN1Z2dlc3Rpb25zU2hvd24gKyBJTkNSRU1FTlRfUk9PTVNfU0hPV04gfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdG9nZ2xlTWVtYmVyID0gKG1lbWJlcjogTWVtYmVyKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5idXN5KSB7XG4gICAgICAgICAgICBsZXQgZmlsdGVyVGV4dCA9IHRoaXMuc3RhdGUuZmlsdGVyVGV4dDtcbiAgICAgICAgICAgIGxldCB0YXJnZXRzID0gdGhpcy5zdGF0ZS50YXJnZXRzLm1hcCh0ID0+IHQpOyAvLyBjaGVhcCBjbG9uZSBmb3IgbXV0YXRpb25cbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHRhcmdldHMuaW5kZXhPZihtZW1iZXIpO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0cy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMua2luZCA9PT0gS0lORF9DQUxMX1RSQU5TRkVSICYmIHRhcmdldHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhcmdldHMucHVzaChtZW1iZXIpO1xuICAgICAgICAgICAgICAgIGZpbHRlclRleHQgPSBcIlwiOyAvLyBjbGVhciB0aGUgZmlsdGVyIHdoZW4gdGhlIHVzZXIgYWNjZXB0cyBhIHN1Z2dlc3Rpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YXJnZXRzLCBmaWx0ZXJUZXh0IH0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5lZGl0b3JSZWYgJiYgdGhpcy5lZGl0b3JSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbW92ZU1lbWJlciA9IChtZW1iZXI6IE1lbWJlcikgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5zdGF0ZS50YXJnZXRzLm1hcCh0ID0+IHQpOyAvLyBjaGVhcCBjbG9uZSBmb3IgbXV0YXRpb25cbiAgICAgICAgY29uc3QgaWR4ID0gdGFyZ2V0cy5pbmRleE9mKG1lbWJlcik7XG4gICAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAgICAgdGFyZ2V0cy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YXJnZXRzIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yUmVmICYmIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzdGUgPSBhc3luYyAoZSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5maWx0ZXJUZXh0KSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBoYXMgYWxyZWFkeSB0eXBlZCBzb21ldGhpbmcsIGp1c3QgbGV0IHRoZW1cbiAgICAgICAgICAgIC8vIHBhc3RlIG5vcm1hbGx5LlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJldmVudCB0aGUgdGV4dCBiZWluZyBwYXN0ZWQgaW50byB0aGUgaW5wdXRcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgaXQgYXMgYSBsaXN0IG9mIGFkZHJlc3NlcyB0byBhZGQgaW5zdGVhZFxuICAgICAgICBjb25zdCB0ZXh0ID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJ0ZXh0XCIpO1xuICAgICAgICBjb25zdCBwb3NzaWJsZU1lbWJlcnMgPSBbXG4gICAgICAgICAgICAvLyBJZiB3ZSBjYW4gYXZvaWQgaGl0dGluZyB0aGUgcHJvZmlsZSBlbmRwb2ludCwgd2Ugc2hvdWxkLlxuICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS5yZWNlbnRzLFxuICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS5zdWdnZXN0aW9ucyxcbiAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUuc2VydmVyUmVzdWx0c01peGluLFxuICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS50aHJlZXBpZFJlc3VsdHNNaXhpbixcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgdG9BZGQgPSBbXTtcbiAgICAgICAgY29uc3QgZmFpbGVkID0gW107XG4gICAgICAgIGNvbnN0IHBvdGVudGlhbEFkZHJlc3NlcyA9IHRleHQuc3BsaXQoL1tcXHMsXSsvKS5tYXAocCA9PiBwLnRyaW0oKSkuZmlsdGVyKHAgPT4gISFwKTsgLy8gZmlsdGVyIGVtcHR5IHN0cmluZ3NcbiAgICAgICAgZm9yIChjb25zdCBhZGRyZXNzIG9mIHBvdGVudGlhbEFkZHJlc3Nlcykge1xuICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gcG9zc2libGVNZW1iZXJzLmZpbmQobSA9PiBtLnVzZXJJZCA9PT0gYWRkcmVzcyk7XG4gICAgICAgICAgICBpZiAobWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgdG9BZGQucHVzaChtZW1iZXIudXNlcik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhZGRyZXNzLmluZGV4T2YoJ0AnKSA+IDAgJiYgRW1haWwubG9va3NWYWxpZChhZGRyZXNzKSkge1xuICAgICAgICAgICAgICAgIHRvQWRkLnB1c2gobmV3IFRocmVlcGlkTWVtYmVyKGFkZHJlc3MpKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFkZHJlc3NbMF0gIT09ICdAJykge1xuICAgICAgICAgICAgICAgIGZhaWxlZC5wdXNoKGFkZHJlc3MpOyAvLyBub3QgYSB1c2VyIElEXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRQcm9maWxlSW5mbyhhZGRyZXNzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHByb2ZpbGUgPyBwcm9maWxlLmRpc3BsYXluYW1lIDogbnVsbDtcbiAgICAgICAgICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSBwcm9maWxlID8gcHJvZmlsZS5hdmF0YXJfdXJsIDogbnVsbDtcbiAgICAgICAgICAgICAgICB0b0FkZC5wdXNoKG5ldyBEaXJlY3RvcnlNZW1iZXIoe1xuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiBhZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5X25hbWU6IGRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBhdmF0YXJVcmwsXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIGxvb2tpbmcgdXAgcHJvZmlsZSBmb3IgXCIgKyBhZGRyZXNzKTtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgZmFpbGVkLnB1c2goYWRkcmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG5cbiAgICAgICAgaWYgKGZhaWxlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byBmaW5kIHRoZSBmb2xsb3dpbmcgdXNlcnMnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVGhlIGZvbGxvd2luZyB1c2VycyBtaWdodCBub3QgZXhpc3Qgb3IgYXJlIGludmFsaWQsIGFuZCBjYW5ub3QgYmUgaW52aXRlZDogJShjc3ZOYW1lcylzXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgY3N2TmFtZXM6IGZhaWxlZC5qb2luKFwiLCBcIikgfSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoJ09LJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YXJnZXRzOiBbLi4udGhpcy5zdGF0ZS50YXJnZXRzLCAuLi50b0FkZF0gfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbGlja0lucHV0QXJlYSA9IChlKSA9PiB7XG4gICAgICAgIC8vIFN0b3AgdGhlIGJyb3dzZXIgZnJvbSBoaWdobGlnaHRpbmcgdGV4dFxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yUmVmICYmIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlRGVmYXVsdElkZW50aXR5U2VydmVyQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBJUyBpbiBhY2NvdW50IGRhdGEuIEFjdHVhbGx5IHVzaW5nIGl0IG1heSB0cmlnZ2VyIHRlcm1zLlxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvcnVsZXMtb2YtaG9va3NcbiAgICAgICAgc2V0VG9EZWZhdWx0SWRlbnRpdHlTZXJ2ZXIoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNhblVzZUlkZW50aXR5U2VydmVyOiB0cnVlLCB0cnlpbmdJZGVudGl0eVNlcnZlcjogZmFsc2UgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NYW5hZ2VTZXR0aW5nc0NsaWNrID0gKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyU2VjdGlvbihraW5kOiBcInJlY2VudHNcInxcInN1Z2dlc3Rpb25zXCIpIHtcbiAgICAgICAgbGV0IHNvdXJjZU1lbWJlcnMgPSBraW5kID09PSAncmVjZW50cycgPyB0aGlzLnN0YXRlLnJlY2VudHMgOiB0aGlzLnN0YXRlLnN1Z2dlc3Rpb25zO1xuICAgICAgICBsZXQgc2hvd051bSA9IGtpbmQgPT09ICdyZWNlbnRzJyA/IHRoaXMuc3RhdGUubnVtUmVjZW50c1Nob3duIDogdGhpcy5zdGF0ZS5udW1TdWdnZXN0aW9uc1Nob3duO1xuICAgICAgICBjb25zdCBzaG93TW9yZUZuID0ga2luZCA9PT0gJ3JlY2VudHMnID8gdGhpcy5zaG93TW9yZVJlY2VudHMuYmluZCh0aGlzKSA6IHRoaXMuc2hvd01vcmVTdWdnZXN0aW9ucy5iaW5kKHRoaXMpO1xuICAgICAgICBjb25zdCBsYXN0QWN0aXZlID0gKG0pID0+IGtpbmQgPT09ICdyZWNlbnRzJyA/IG0ubGFzdEFjdGl2ZSA6IG51bGw7XG4gICAgICAgIGxldCBzZWN0aW9uTmFtZSA9IGtpbmQgPT09ICdyZWNlbnRzJyA/IF90KFwiUmVjZW50IENvbnZlcnNhdGlvbnNcIikgOiBfdChcIlN1Z2dlc3Rpb25zXCIpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmtpbmQgPT09IEtJTkRfSU5WSVRFKSB7XG4gICAgICAgICAgICBzZWN0aW9uTmFtZSA9IGtpbmQgPT09ICdyZWNlbnRzJyA/IF90KFwiUmVjZW50bHkgRGlyZWN0IE1lc3NhZ2VkXCIpIDogX3QoXCJTdWdnZXN0aW9uc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1peCBpbiB0aGUgc2VydmVyIHJlc3VsdHMgaWYgd2UgaGF2ZSBhbnksIGJ1dCBvbmx5IGlmIHdlJ3JlIHNlYXJjaGluZy4gV2UgdHJhY2sgdGhlIGFkZGl0aW9uYWxcbiAgICAgICAgLy8gbWVtYmVycyBzZXBhcmF0ZWx5IGJlY2F1c2Ugd2Ugd2FudCB0byBmaWx0ZXIgc291cmNlTWVtYmVycyBidXQgdHJ1c3QgdGhlIG1peGluIGFycmF5cyB0byBoYXZlXG4gICAgICAgIC8vIHRoZSByaWdodCBtZW1iZXJzIGluIHRoZW0uXG4gICAgICAgIGxldCBwcmlvcml0eUFkZGl0aW9uYWxNZW1iZXJzID0gW107IC8vIFNob3dzIHVwIGJlZm9yZSBvdXIgb3duIHN1Z2dlc3Rpb25zLCBoaWdoZXIgcXVhbGl0eVxuICAgICAgICBsZXQgb3RoZXJBZGRpdGlvbmFsTWVtYmVycyA9IFtdOyAvLyBTaG93cyB1cCBhZnRlciBvdXIgb3duIHN1Z2dlc3Rpb25zLCBsb3dlciBxdWFsaXR5XG4gICAgICAgIGNvbnN0IGhhc01peGlucyA9IHRoaXMuc3RhdGUuc2VydmVyUmVzdWx0c01peGluIHx8IHRoaXMuc3RhdGUudGhyZWVwaWRSZXN1bHRzTWl4aW47XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZpbHRlclRleHQgJiYgaGFzTWl4aW5zICYmIGtpbmQgPT09ICdzdWdnZXN0aW9ucycpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gZHVwbGljYXRlIG1lbWJlcnMgdGhvdWdoLCBzbyBqdXN0IGV4Y2x1ZGUgYW55b25lIHdlJ3ZlIGFscmVhZHkgc2Vlbi5cbiAgICAgICAgICAgIC8vIFRoZSB0eXBlIG9mIHUgaXMgYSBwYWluIHRvIGRlZmluZSBidXQgbWVtYmVycyBvZiBib3RoIG1peGlucyBoYXZlIHRoZSAndXNlcklkJyBwcm9wZXJ0eVxuICAgICAgICAgICAgY29uc3Qgbm90QWxyZWFkeUV4aXN0cyA9ICh1OiBhbnkpOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXNvdXJjZU1lbWJlcnMuc29tZShtID0+IG0udXNlcklkID09PSB1LnVzZXJJZClcbiAgICAgICAgICAgICAgICAgICAgJiYgIXByaW9yaXR5QWRkaXRpb25hbE1lbWJlcnMuc29tZShtID0+IG0udXNlcklkID09PSB1LnVzZXJJZClcbiAgICAgICAgICAgICAgICAgICAgJiYgIW90aGVyQWRkaXRpb25hbE1lbWJlcnMuc29tZShtID0+IG0udXNlcklkID09PSB1LnVzZXJJZCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvdGhlckFkZGl0aW9uYWxNZW1iZXJzID0gdGhpcy5zdGF0ZS5zZXJ2ZXJSZXN1bHRzTWl4aW4uZmlsdGVyKG5vdEFscmVhZHlFeGlzdHMpO1xuICAgICAgICAgICAgcHJpb3JpdHlBZGRpdGlvbmFsTWVtYmVycyA9IHRoaXMuc3RhdGUudGhyZWVwaWRSZXN1bHRzTWl4aW4uZmlsdGVyKG5vdEFscmVhZHlFeGlzdHMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhc0FkZGl0aW9uYWxNZW1iZXJzID0gcHJpb3JpdHlBZGRpdGlvbmFsTWVtYmVycy5sZW5ndGggPiAwIHx8IG90aGVyQWRkaXRpb25hbE1lbWJlcnMubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBIaWRlIHRoZSBzZWN0aW9uIGlmIHRoZXJlJ3Mgbm90aGluZyB0byBmaWx0ZXIgYnlcbiAgICAgICAgaWYgKHNvdXJjZU1lbWJlcnMubGVuZ3RoID09PSAwICYmICFoYXNBZGRpdGlvbmFsTWVtYmVycykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8gRG8gc29tZSBzaW1wbGUgZmlsdGVyaW5nIG9uIHRoZSBpbnB1dCBiZWZvcmUgZ29pbmcgbXVjaCBmdXJ0aGVyLiBJZiB3ZSBnZXQgbm8gcmVzdWx0cywgc2F5IHNvLlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5maWx0ZXJUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJCeSA9IHRoaXMuc3RhdGUuZmlsdGVyVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgc291cmNlTWVtYmVycyA9IHNvdXJjZU1lbWJlcnNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG0gPT4gbS51c2VyLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJCeSkgfHwgbS51c2VySWQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJCeSkpO1xuXG4gICAgICAgICAgICBpZiAoc291cmNlTWVtYmVycy5sZW5ndGggPT09IDAgJiYgIWhhc0FkZGl0aW9uYWxNZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMz57IHNlY3Rpb25OYW1lIH08L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIk5vIHJlc3VsdHNcIikgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyB3ZSBtaXggaW4gdGhlIGFkZGl0aW9uYWwgbWVtYmVycy4gQWdhaW4sIHdlIHByZXN1bWUgdGhlc2UgaGF2ZSBhbHJlYWR5IGJlZW4gZmlsdGVyZWQuIFdlXG4gICAgICAgIC8vIGFsc28gYXNzdW1lIHRoZXkgYXJlIG1vcmUgcmVsZXZhbnQgdGhhbiBvdXIgc3VnZ2VzdGlvbnMgYW5kIHByZXBlbmQgdGhlbSB0byB0aGUgbGlzdC5cbiAgICAgICAgc291cmNlTWVtYmVycyA9IFsuLi5wcmlvcml0eUFkZGl0aW9uYWxNZW1iZXJzLCAuLi5zb3VyY2VNZW1iZXJzLCAuLi5vdGhlckFkZGl0aW9uYWxNZW1iZXJzXTtcblxuICAgICAgICAvLyBJZiB3ZSdyZSBnb2luZyB0byBoaWRlIG9uZSBtZW1iZXIgYmVoaW5kICdzaG93IG1vcmUnLCBqdXN0IHVzZSB1cCB0aGUgc3BhY2Ugb2YgdGhlIGJ1dHRvblxuICAgICAgICAvLyB3aXRoIHRoZSBtZW1iZXIncyB0aWxlIGluc3RlYWQuXG4gICAgICAgIGlmIChzaG93TnVtID09PSBzb3VyY2VNZW1iZXJzLmxlbmd0aCAtIDEpIHNob3dOdW0rKztcblxuICAgICAgICAvLyAuc2xpY2UoKSB3aWxsIHJldHVybiBhbiBpbmNvbXBsZXRlIGFycmF5IGJ1dCB3b24ndCBlcnJvciBvbiB1cyBpZiB3ZSBnbyB0b28gZmFyXG4gICAgICAgIGNvbnN0IHRvUmVuZGVyID0gc291cmNlTWVtYmVycy5zbGljZSgwLCBzaG93TnVtKTtcbiAgICAgICAgY29uc3QgaGFzTW9yZSA9IHRvUmVuZGVyLmxlbmd0aCA8IHNvdXJjZU1lbWJlcnMubGVuZ3RoO1xuXG4gICAgICAgIGxldCBzaG93TW9yZSA9IG51bGw7XG4gICAgICAgIGlmIChoYXNNb3JlKSB7XG4gICAgICAgICAgICBzaG93TW9yZSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ludml0ZURpYWxvZ19zZWN0aW9uX3Nob3dNb3JlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3Nob3dNb3JlRm59IGtpbmQ9XCJsaW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiU2hvdyBtb3JlXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRpbGVzID0gdG9SZW5kZXIubWFwKHIgPT4gKFxuICAgICAgICAgICAgPERNUm9vbVRpbGVcbiAgICAgICAgICAgICAgICBtZW1iZXI9e3IudXNlcn1cbiAgICAgICAgICAgICAgICBsYXN0QWN0aXZlVHM9e2xhc3RBY3RpdmUocil9XG4gICAgICAgICAgICAgICAga2V5PXtyLnVzZXJJZH1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17dGhpcy50b2dnbGVNZW1iZXJ9XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0V29yZD17dGhpcy5zdGF0ZS5maWx0ZXJUZXh0fVxuICAgICAgICAgICAgICAgIGlzU2VsZWN0ZWQ9e3RoaXMuc3RhdGUudGFyZ2V0cy5zb21lKHQgPT4gdC51c2VySWQgPT09IHIudXNlcklkKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICkpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8aDM+eyBzZWN0aW9uTmFtZSB9PC9oMz5cbiAgICAgICAgICAgICAgICB7IHRpbGVzIH1cbiAgICAgICAgICAgICAgICB7IHNob3dNb3JlIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyRWRpdG9yKCkge1xuICAgICAgICBjb25zdCBoYXNQbGFjZWhvbGRlciA9IChcbiAgICAgICAgICAgIHRoaXMucHJvcHMua2luZCA9PSBLSU5EX0NBTExfVFJBTlNGRVIgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudGFyZ2V0cy5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuZmlsdGVyVGV4dC5sZW5ndGggPT09IDBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuc3RhdGUudGFyZ2V0cy5tYXAodCA9PiAoXG4gICAgICAgICAgICA8RE1Vc2VyVGlsZSBtZW1iZXI9e3R9IG9uUmVtb3ZlPXshdGhpcy5zdGF0ZS5idXN5ICYmIHRoaXMucmVtb3ZlTWVtYmVyfSBrZXk9e3QudXNlcklkfSAvPlxuICAgICAgICApKTtcbiAgICAgICAgY29uc3QgaW5wdXQgPSAoXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy51cGRhdGVGaWx0ZXJ9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZmlsdGVyVGV4dH1cbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuZWRpdG9yUmVmfVxuICAgICAgICAgICAgICAgIG9uUGFzdGU9e3RoaXMub25QYXN0ZX1cbiAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeSB8fCAodGhpcy5wcm9wcy5raW5kID09IEtJTkRfQ0FMTF9UUkFOU0ZFUiAmJiB0aGlzLnN0YXRlLnRhcmdldHMubGVuZ3RoID4gMCl9XG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17aGFzUGxhY2Vob2xkZXIgPyBfdChcIlNlYXJjaFwiKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgZGF0YS10ZXN0LWlkPVwiaW52aXRlLWRpYWxvZy1pbnB1dFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19lZGl0b3InIG9uQ2xpY2s9e3RoaXMub25DbGlja0lucHV0QXJlYX0+XG4gICAgICAgICAgICAgICAgeyB0YXJnZXRzIH1cbiAgICAgICAgICAgICAgICB7IGlucHV0IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVySWRlbnRpdHlTZXJ2ZXJXYXJuaW5nKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUudHJ5aW5nSWRlbnRpdHlTZXJ2ZXIgfHwgdGhpcy5zdGF0ZS5jYW5Vc2VJZGVudGl0eVNlcnZlciB8fFxuICAgICAgICAgICAgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLklkZW50aXR5U2VydmVyKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVmYXVsdElkZW50aXR5U2VydmVyVXJsID0gZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsKCk7XG4gICAgICAgIGlmIChkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnZpdGVEaWFsb2dfaWRlbnRpdHlTZXJ2ZXJcIj57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgdG8gaW52aXRlIGJ5IGVtYWlsLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGRlZmF1bHQ+VXNlIHRoZSBkZWZhdWx0ICglKGRlZmF1bHRJZGVudGl0eVNlcnZlck5hbWUpcyk8L2RlZmF1bHQ+IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJvciBtYW5hZ2UgaW4gPHNldHRpbmdzPlNldHRpbmdzPC9zZXR0aW5ncz4uXCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRJZGVudGl0eVNlcnZlck5hbWU6IGFiYnJldmlhdGVVcmwoZGVmYXVsdElkZW50aXR5U2VydmVyVXJsKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogc3ViID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0nbGlua19pbmxpbmUnIG9uQ2xpY2s9e3RoaXMub25Vc2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHN1YiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXt0aGlzLm9uTWFuYWdlU2V0dGluZ3NDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICkgfTwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnZpdGVEaWFsb2dfaWRlbnRpdHlTZXJ2ZXJcIj57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgdG8gaW52aXRlIGJ5IGVtYWlsLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiTWFuYWdlIGluIDxzZXR0aW5ncz5TZXR0aW5nczwvc2V0dGluZ3M+LlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHN1YiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXt0aGlzLm9uTWFuYWdlU2V0dGluZ3NDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICkgfTwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25EaWFsRm9ybVN1Ym1pdCA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy50cmFuc2ZlckNhbGwoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRpYWxDaGFuZ2UgPSBldiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkaWFsUGFkVmFsdWU6IGV2LmN1cnJlbnRUYXJnZXQudmFsdWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25EaWdpdFByZXNzID0gKGRpZ2l0OiBzdHJpbmcsIGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGlhbFBhZFZhbHVlOiB0aGlzLnN0YXRlLmRpYWxQYWRWYWx1ZSArIGRpZ2l0IH0pO1xuXG4gICAgICAgIC8vIEtlZXAgdGhlIG51bWJlciBmaWVsZCBmb2N1c2VkIHNvIHRoYXQga2V5Ym9hcmQgZW50cnkgaXMgc3RpbGwgYXZhaWxhYmxlXG4gICAgICAgIC8vIEhvd2V2ZXIsIGRvbid0IGZvY3VzIGlmIHRoaXMgd2Fzbid0IHRoZSByZXN1bHQgb2YgZGlyZWN0bHkgY2xpY2tpbmcgb24gdGhlIGJ1dHRvbixcbiAgICAgICAgLy8gaS5lIHNvbWVvbmUgdXNpbmcga2V5Ym9hcmQgbmF2aWdhdGlvbi5cbiAgICAgICAgaWYgKGV2LnR5cGUgPT09IFwiY2xpY2tcIikge1xuICAgICAgICAgICAgdGhpcy5udW1iZXJFbnRyeUZpZWxkUmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRlbGV0ZVByZXNzID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaWFsUGFkVmFsdWUubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkaWFsUGFkVmFsdWU6IHRoaXMuc3RhdGUuZGlhbFBhZFZhbHVlLnNsaWNlKDAsIC0xKSB9KTtcblxuICAgICAgICAvLyBLZWVwIHRoZSBudW1iZXIgZmllbGQgZm9jdXNlZCBzbyB0aGF0IGtleWJvYXJkIGVudHJ5IGlzIHN0aWxsIGF2YWlsYWJsZVxuICAgICAgICAvLyBIb3dldmVyLCBkb24ndCBmb2N1cyBpZiB0aGlzIHdhc24ndCB0aGUgcmVzdWx0IG9mIGRpcmVjdGx5IGNsaWNraW5nIG9uIHRoZSBidXR0b24sXG4gICAgICAgIC8vIGkuZSBzb21lb25lIHVzaW5nIGtleWJvYXJkIG5hdmlnYXRpb24uXG4gICAgICAgIGlmIChldi50eXBlID09PSBcImNsaWNrXCIpIHtcbiAgICAgICAgICAgIHRoaXMubnVtYmVyRW50cnlGaWVsZFJlZi5jdXJyZW50Py5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25UYWJDaGFuZ2UgPSAodGFiSWQ6IFRhYklkKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXJyZW50VGFiSWQ6IHRhYklkIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIG9uTGlua0NsaWNrKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZWxlY3RUZXh0KGUudGFyZ2V0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBzY3JlZW5OYW1lKCk6IFNjcmVlbk5hbWUge1xuICAgICAgICBzd2l0Y2ggKHRoaXMucHJvcHMua2luZCkge1xuICAgICAgICAgICAgY2FzZSBLSU5EX0RNOlxuICAgICAgICAgICAgICAgIHJldHVybiBcIlN0YXJ0Q2hhdFwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgc3Bpbm5lciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmJ1c3kpIHtcbiAgICAgICAgICAgIHNwaW5uZXIgPSA8U3Bpbm5lciB3PXsyMH0gaD17MjB9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICBsZXQgaGVscFRleHQ7XG4gICAgICAgIGxldCBidXR0b25UZXh0O1xuICAgICAgICBsZXQgZ29CdXR0b25GbjtcbiAgICAgICAgbGV0IGNvbnN1bHRDb25uZWN0U2VjdGlvbjtcbiAgICAgICAgbGV0IGV4dHJhU2VjdGlvbjtcbiAgICAgICAgbGV0IGZvb3RlcjtcbiAgICAgICAgbGV0IGtleVNoYXJpbmdXYXJuaW5nID0gPHNwYW4gLz47XG5cbiAgICAgICAgY29uc3QgaWRlbnRpdHlTZXJ2ZXJzRW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLklkZW50aXR5U2VydmVyKTtcblxuICAgICAgICBjb25zdCBoYXNTZWxlY3Rpb24gPSB0aGlzLnN0YXRlLnRhcmdldHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgfHwgKHRoaXMuc3RhdGUuZmlsdGVyVGV4dCAmJiB0aGlzLnN0YXRlLmZpbHRlclRleHQuaW5jbHVkZXMoJ0AnKSk7XG5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCB1c2VySWQgPSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmtpbmQgPT09IEtJTkRfRE0pIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJEaXJlY3QgTWVzc2FnZXNcIik7XG5cbiAgICAgICAgICAgIGlmIChpZGVudGl0eVNlcnZlcnNFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgaGVscFRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJTdGFydCBhIGNvbnZlcnNhdGlvbiB3aXRoIHNvbWVvbmUgdXNpbmcgdGhlaXIgbmFtZSwgZW1haWwgYWRkcmVzcyBvciB1c2VybmFtZSAobGlrZSA8dXNlcklkLz4pLlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgeyB1c2VySWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17bWFrZVVzZXJQZXJtYWxpbmsodXNlcklkKX0gcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPnsgdXNlcklkIH08L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVscFRleHQgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJTdGFydCBhIGNvbnZlcnNhdGlvbiB3aXRoIHNvbWVvbmUgdXNpbmcgdGhlaXIgbmFtZSBvciB1c2VybmFtZSAobGlrZSA8dXNlcklkLz4pLlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgeyB1c2VySWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17bWFrZVVzZXJQZXJtYWxpbmsodXNlcklkKX0gcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPnsgdXNlcklkIH08L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnV0dG9uVGV4dCA9IF90KFwiR29cIik7XG4gICAgICAgICAgICBnb0J1dHRvbkZuID0gdGhpcy5zdGFydERtO1xuICAgICAgICAgICAgZXh0cmFTZWN0aW9uID0gPGRpdiBjbGFzc05hbWU9XCJteF9JbnZpdGVEaWFsb2dfc2VjdGlvbl9oaWRkZW5fc3VnZ2VzdGlvbnNfZGlzY2xhaW1lclwiPlxuICAgICAgICAgICAgICAgIDxzcGFuPnsgX3QoXCJTb21lIHN1Z2dlc3Rpb25zIG1heSBiZSBoaWRkZW4gZm9yIHByaXZhY3kuXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIklmIHlvdSBjYW4ndCBzZWUgd2hvIHlvdSdyZSBsb29raW5nIGZvciwgc2VuZCB0aGVtIHlvdXIgaW52aXRlIGxpbmsgYmVsb3cuXCIpIH08L3A+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICBjb25zdCBsaW5rID0gbWFrZVVzZXJQZXJtYWxpbmsoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIGZvb3RlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfSW52aXRlRGlhbG9nX2Zvb3RlclwiPlxuICAgICAgICAgICAgICAgIDxoMz57IF90KFwiT3Igc2VuZCBpbnZpdGUgbGlua1wiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICA8Q29weWFibGVUZXh0IGdldFRleHRUb0NvcHk9eygpID0+IG1ha2VVc2VyUGVybWFsaW5rKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSl9PlxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXtsaW5rfSBvbkNsaWNrPXt0aGlzLm9uTGlua0NsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbGluayB9XG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICA8L0NvcHlhYmxlVGV4dD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmtpbmQgPT09IEtJTkRfSU5WSVRFKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpPy5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGlzU3BhY2UgPSByb29tPy5pc1NwYWNlUm9vbSgpO1xuICAgICAgICAgICAgdGl0bGUgPSBpc1NwYWNlXG4gICAgICAgICAgICAgICAgPyBfdChcIkludml0ZSB0byAlKHNwYWNlTmFtZSlzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgc3BhY2VOYW1lOiByb29tLm5hbWUgfHwgX3QoXCJVbm5hbWVkIFNwYWNlXCIpLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgOiBfdChcIkludml0ZSB0byAlKHJvb21OYW1lKXNcIiwge1xuICAgICAgICAgICAgICAgICAgICByb29tTmFtZTogcm9vbS5uYW1lIHx8IF90KFwiVW5uYW1lZCBSb29tXCIpLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgaGVscFRleHRVbnRyYW5zbGF0ZWQ7XG4gICAgICAgICAgICBpZiAoaXNTcGFjZSkge1xuICAgICAgICAgICAgICAgIGlmIChpZGVudGl0eVNlcnZlcnNFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlbHBUZXh0VW50cmFuc2xhdGVkID0gX3RkKFwiSW52aXRlIHNvbWVvbmUgdXNpbmcgdGhlaXIgbmFtZSwgZW1haWwgYWRkcmVzcywgdXNlcm5hbWUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIobGlrZSA8dXNlcklkLz4pIG9yIDxhPnNoYXJlIHRoaXMgc3BhY2U8L2E+LlwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBoZWxwVGV4dFVudHJhbnNsYXRlZCA9IF90ZChcIkludml0ZSBzb21lb25lIHVzaW5nIHRoZWlyIG5hbWUsIHVzZXJuYW1lIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiKGxpa2UgPHVzZXJJZC8+KSBvciA8YT5zaGFyZSB0aGlzIHNwYWNlPC9hPi5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaWRlbnRpdHlTZXJ2ZXJzRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICBoZWxwVGV4dFVudHJhbnNsYXRlZCA9IF90ZChcIkludml0ZSBzb21lb25lIHVzaW5nIHRoZWlyIG5hbWUsIGVtYWlsIGFkZHJlc3MsIHVzZXJuYW1lIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiKGxpa2UgPHVzZXJJZC8+KSBvciA8YT5zaGFyZSB0aGlzIHJvb208L2E+LlwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBoZWxwVGV4dFVudHJhbnNsYXRlZCA9IF90ZChcIkludml0ZSBzb21lb25lIHVzaW5nIHRoZWlyIG5hbWUsIHVzZXJuYW1lIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiKGxpa2UgPHVzZXJJZC8+KSBvciA8YT5zaGFyZSB0aGlzIHJvb208L2E+LlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGhlbHBUZXh0ID0gX3QoaGVscFRleHRVbnRyYW5zbGF0ZWQsIHt9LCB7XG4gICAgICAgICAgICAgICAgdXNlcklkOiAoKSA9PlxuICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlVXNlclBlcm1hbGluayh1c2VySWQpfSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+eyB1c2VySWQgfTwvYT4sXG4gICAgICAgICAgICAgICAgYTogKHN1YikgPT5cbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17bWFrZVJvb21QZXJtYWxpbmsodGhpcy5wcm9wcy5yb29tSWQpfSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+eyBzdWIgfTwvYT4sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYnV0dG9uVGV4dCA9IF90KFwiSW52aXRlXCIpO1xuICAgICAgICAgICAgZ29CdXR0b25GbiA9IHRoaXMuaW52aXRlVXNlcnM7XG5cbiAgICAgICAgICAgIGlmIChjbGkuaXNSb29tRW5jcnlwdGVkKHRoaXMucHJvcHMucm9vbUlkKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmlzaWJpbGl0eUV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXG4gICAgICAgICAgICAgICAgICAgIFwibS5yb29tLmhpc3RvcnlfdmlzaWJpbGl0eVwiLCBcIlwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmlzaWJpbGl0eSA9IHZpc2liaWxpdHlFdmVudCAmJiB2aXNpYmlsaXR5RXZlbnQuZ2V0Q29udGVudCgpICYmXG4gICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHlFdmVudC5nZXRDb250ZW50KCkuaGlzdG9yeV92aXNpYmlsaXR5O1xuICAgICAgICAgICAgICAgIGlmICh2aXNpYmlsaXR5ID09PSBcIndvcmxkX3JlYWRhYmxlXCIgfHwgdmlzaWJpbGl0eSA9PT0gXCJzaGFyZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBrZXlTaGFyaW5nV2FybmluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19oZWxwVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEluZm9JY29uIGhlaWdodD17MTR9IHdpZHRoPXsxNH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IFwiIFwiICsgX3QoXCJJbnZpdGVkIHBlb3BsZSB3aWxsIGJlIGFibGUgdG8gcmVhZCBvbGQgbWVzc2FnZXMuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMua2luZCA9PT0gS0lORF9DQUxMX1RSQU5TRkVSKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiVHJhbnNmZXJcIik7XG5cbiAgICAgICAgICAgIGNvbnN1bHRDb25uZWN0U2VjdGlvbiA9IDxkaXYgY2xhc3NOYW1lPVwibXhfSW52aXRlRGlhbG9nX3RyYW5zZmVyQ29uc3VsdENvbm5lY3RcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkPXt0aGlzLnN0YXRlLmNvbnN1bHRGaXJzdH0gb25DaGFuZ2U9e3RoaXMub25Db25zdWx0Rmlyc3RDaGFuZ2V9IC8+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDb25zdWx0IGZpcnN0XCIpIH1cbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJzZWNvbmRhcnlcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ190cmFuc2ZlckNvbnN1bHRDb25uZWN0X3B1c2hSaWdodCdcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDYW5jZWxcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudHJhbnNmZXJDYWxsfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ190cmFuc2ZlckJ1dHRvbidcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFoYXNTZWxlY3Rpb24gJiYgdGhpcy5zdGF0ZS5kaWFsUGFkVmFsdWUgPT09ICcnfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlRyYW5zZmVyXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJVbmtub3duIGtpbmQgb2YgSW52aXRlRGlhbG9nOiBcIiArIHRoaXMucHJvcHMua2luZCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnb0J1dHRvbiA9IHRoaXMucHJvcHMua2luZCA9PSBLSU5EX0NBTExfVFJBTlNGRVIgPyBudWxsIDogPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e2dvQnV0dG9uRm59XG4gICAgICAgICAgICBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19nb0J1dHRvbidcbiAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3kgfHwgIWhhc1NlbGVjdGlvbn1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBidXR0b25UZXh0IH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcblxuICAgICAgICBjb25zdCB1c2Vyc1NlY3Rpb24gPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19oZWxwVGV4dCc+eyBoZWxwVGV4dCB9PC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ19hZGRyZXNzQmFyJz5cbiAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyRWRpdG9yKCkgfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfYnV0dG9uQW5kU3Bpbm5lcic+XG4gICAgICAgICAgICAgICAgICAgIHsgZ29CdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICB7IHNwaW5uZXIgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7IGtleVNoYXJpbmdXYXJuaW5nIH1cbiAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJJZGVudGl0eVNlcnZlcldhcm5pbmcoKSB9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZXJyb3InPnsgdGhpcy5zdGF0ZS5lcnJvclRleHQgfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludml0ZURpYWxvZ191c2VyU2VjdGlvbnMnPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJTZWN0aW9uKCdyZWNlbnRzJykgfVxuICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJTZWN0aW9uKCdzdWdnZXN0aW9ucycpIH1cbiAgICAgICAgICAgICAgICB7IGV4dHJhU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgZm9vdGVyIH1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG5cbiAgICAgICAgbGV0IGRpYWxvZ0NvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmtpbmQgPT09IEtJTkRfQ0FMTF9UUkFOU0ZFUikge1xuICAgICAgICAgICAgY29uc3QgdGFicyA9IFtdO1xuICAgICAgICAgICAgdGFicy5wdXNoKG5ldyBUYWIoXG4gICAgICAgICAgICAgICAgVGFiSWQuVXNlckRpcmVjdG9yeSwgX3RkKFwiVXNlciBEaXJlY3RvcnlcIiksICdteF9JbnZpdGVEaWFsb2dfdXNlckRpcmVjdG9yeUljb24nLCB1c2Vyc1NlY3Rpb24sXG4gICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgY29uc3QgYmFja3NwYWNlQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxEaWFsUGFkQmFja3NwYWNlQnV0dG9uIG9uQmFja3NwYWNlUHJlc3M9e3RoaXMub25EZWxldGVQcmVzc30gLz5cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgc2hvdyB0aGUgYmFja3NwYWNlIGJ1dHRvbiBpZiB0aGUgZmllbGQgaGFzIGNvbnRlbnRcbiAgICAgICAgICAgIGxldCBkaWFsUGFkRmllbGQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaWFsUGFkVmFsdWUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZGlhbFBhZEZpZWxkID0gPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5udW1iZXJFbnRyeUZpZWxkUmVmfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbnZpdGVEaWFsb2dfZGlhbFBhZEZpZWxkXCJcbiAgICAgICAgICAgICAgICAgICAgaWQ9XCJkaWFscGFkX251bWJlclwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmRpYWxQYWRWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkRpYWxDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHBvc3RmaXhDb21wb25lbnQ9e2JhY2tzcGFjZUJ1dHRvbn1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlhbFBhZEZpZWxkID0gPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5udW1iZXJFbnRyeUZpZWxkUmVmfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbnZpdGVEaWFsb2dfZGlhbFBhZEZpZWxkXCJcbiAgICAgICAgICAgICAgICAgICAgaWQ9XCJkaWFscGFkX251bWJlclwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmRpYWxQYWRWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkRpYWxDaGFuZ2V9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRpYWxQYWRTZWN0aW9uID0gPGRpdiBjbGFzc05hbWU9XCJteF9JbnZpdGVEaWFsb2dfZGlhbFBhZFwiPlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uRGlhbEZvcm1TdWJtaXR9PlxuICAgICAgICAgICAgICAgICAgICB7IGRpYWxQYWRGaWVsZCB9XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgIDxEaWFscGFkXG4gICAgICAgICAgICAgICAgICAgIGhhc0RpYWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBvbkRpZ2l0UHJlc3M9e3RoaXMub25EaWdpdFByZXNzfVxuICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZVByZXNzPXt0aGlzLm9uRGVsZXRlUHJlc3N9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIHRhYnMucHVzaChuZXcgVGFiKFRhYklkLkRpYWxQYWQsIF90ZChcIkRpYWwgcGFkXCIpLCAnbXhfSW52aXRlRGlhbG9nX2RpYWxQYWRJY29uJywgZGlhbFBhZFNlY3Rpb24pKTtcbiAgICAgICAgICAgIGRpYWxvZ0NvbnRlbnQgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPFRhYmJlZFZpZXdcbiAgICAgICAgICAgICAgICAgICAgdGFicz17dGFic31cbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFRhYklkPXt0aGlzLnN0YXRlLmN1cnJlbnRUYWJJZH1cbiAgICAgICAgICAgICAgICAgICAgdGFiTG9jYXRpb249e1RhYkxvY2F0aW9uLlRPUH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25UYWJDaGFuZ2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7IGNvbnN1bHRDb25uZWN0U2VjdGlvbiB9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpYWxvZ0NvbnRlbnQgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgeyB1c2Vyc1NlY3Rpb24gfVxuICAgICAgICAgICAgICAgIHsgY29uc3VsdENvbm5lY3RTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICAgICAgbXhfSW52aXRlRGlhbG9nX3RyYW5zZmVyOiB0aGlzLnByb3BzLmtpbmQgPT09IEtJTkRfQ0FMTF9UUkFOU0ZFUixcbiAgICAgICAgICAgICAgICAgICAgbXhfSW52aXRlRGlhbG9nX290aGVyOiB0aGlzLnByb3BzLmtpbmQgIT09IEtJTkRfQ0FMTF9UUkFOU0ZFUixcbiAgICAgICAgICAgICAgICAgICAgbXhfSW52aXRlRGlhbG9nX2hhc0Zvb3RlcjogISFmb290ZXIsXG4gICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICAgICAgc2NyZWVuTmFtZT17dGhpcy5zY3JlZW5OYW1lfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbnZpdGVEaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIHsgZGlhbG9nQ29udGVudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFJQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFD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