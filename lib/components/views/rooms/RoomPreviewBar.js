"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _classnames = _interopRequireDefault(require("classnames"));

var _RoomViewLifecycle = require("@matrix-org/react-sdk-module-api/lib/lifecycles/RoomViewLifecycle");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _IdentityAuthClient = _interopRequireDefault(require("../../../IdentityAuthClient"));

var _InviteReason = _interopRequireDefault(require("../elements/InviteReason"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _ModuleRunner = require("../../../modules/ModuleRunner");

/*
Copyright 2015-2021 The Matrix.org Foundation C.I.C.

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
const MemberEventHtmlReasonField = "io.element.html_reason";
var MessageCase;

(function (MessageCase) {
  MessageCase["NotLoggedIn"] = "NotLoggedIn";
  MessageCase["Joining"] = "Joining";
  MessageCase["Loading"] = "Loading";
  MessageCase["Rejecting"] = "Rejecting";
  MessageCase["Kicked"] = "Kicked";
  MessageCase["Banned"] = "Banned";
  MessageCase["OtherThreePIDError"] = "OtherThreePIDError";
  MessageCase["InvitedEmailNotFoundInAccount"] = "InvitedEmailNotFoundInAccount";
  MessageCase["InvitedEmailNoIdentityServer"] = "InvitedEmailNoIdentityServer";
  MessageCase["InvitedEmailMismatch"] = "InvitedEmailMismatch";
  MessageCase["Invite"] = "Invite";
  MessageCase["ViewingRoom"] = "ViewingRoom";
  MessageCase["RoomNotFound"] = "RoomNotFound";
  MessageCase["OtherError"] = "OtherError";
})(MessageCase || (MessageCase = {}));

class RoomPreviewBar extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onLoginClick", () => {
      _dispatcher.default.dispatch({
        action: 'start_login',
        screenAfterLogin: this.makeScreenAfterLogin()
      });
    });
    (0, _defineProperty2.default)(this, "onRegisterClick", () => {
      _dispatcher.default.dispatch({
        action: 'start_registration',
        screenAfterLogin: this.makeScreenAfterLogin()
      });
    });
    this.state = {
      busy: false
    };
  }

  componentDidMount() {
    this.checkInvitedEmail();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.invitedEmail !== prevProps.invitedEmail || this.props.inviterName !== prevProps.inviterName) {
      this.checkInvitedEmail();
    }
  }

  async checkInvitedEmail() {
    // If this is an invite and we've been told what email address was
    // invited, fetch the user's account emails and discovery bindings so we
    // can check them against the email that was invited.
    if (this.props.inviterName && this.props.invitedEmail) {
      this.setState({
        busy: true
      });

      try {
        // Gather the account 3PIDs
        const account3pids = await _MatrixClientPeg.MatrixClientPeg.get().getThreePids();
        this.setState({
          accountEmails: account3pids.threepids.filter(b => b.medium === 'email').map(b => b.address)
        }); // If we have an IS connected, use that to lookup the email and
        // check the bound MXID.

        if (!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()) {
          this.setState({
            busy: false
          });
          return;
        }

        const authClient = new _IdentityAuthClient.default();
        const identityAccessToken = await authClient.getAccessToken();
        const result = await _MatrixClientPeg.MatrixClientPeg.get().lookupThreePid('email', this.props.invitedEmail, undefined
        /* callback */
        , identityAccessToken);
        this.setState({
          invitedEmailMxid: result.mxid
        });
      } catch (err) {
        this.setState({
          threePidFetchError: err
        });
      }

      this.setState({
        busy: false
      });
    }
  }

  getMessageCase() {
    const isGuest = _MatrixClientPeg.MatrixClientPeg.get().isGuest();

    if (isGuest) {
      return MessageCase.NotLoggedIn;
    }

    const myMember = this.getMyMember();

    if (myMember) {
      if (myMember.isKicked()) {
        return MessageCase.Kicked;
      } else if (myMember.membership === "ban") {
        return MessageCase.Banned;
      }
    }

    if (this.props.joining) {
      return MessageCase.Joining;
    } else if (this.props.rejecting) {
      return MessageCase.Rejecting;
    } else if (this.props.loading || this.state.busy) {
      return MessageCase.Loading;
    }

    if (this.props.inviterName) {
      if (this.props.invitedEmail) {
        if (this.state.threePidFetchError) {
          return MessageCase.OtherThreePIDError;
        } else if (this.state.accountEmails && !this.state.accountEmails.includes(this.props.invitedEmail)) {
          return MessageCase.InvitedEmailNotFoundInAccount;
        } else if (!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()) {
          return MessageCase.InvitedEmailNoIdentityServer;
        } else if (this.state.invitedEmailMxid != _MatrixClientPeg.MatrixClientPeg.get().getUserId()) {
          return MessageCase.InvitedEmailMismatch;
        }
      }

      return MessageCase.Invite;
    } else if (this.props.error) {
      if (this.props.error.errcode == 'M_NOT_FOUND') {
        return MessageCase.RoomNotFound;
      } else {
        return MessageCase.OtherError;
      }
    } else {
      return MessageCase.ViewingRoom;
    }
  }

  getKickOrBanInfo() {
    const myMember = this.getMyMember();

    if (!myMember) {
      return {};
    }

    const kickerMember = this.props.room.currentState.getMember(myMember.events.member.getSender());
    const memberName = kickerMember ? kickerMember.name : myMember.events.member.getSender();
    const reason = myMember.events.member.getContent().reason;
    return {
      memberName,
      reason
    };
  }

  joinRule() {
    return this.props.room?.currentState.getStateEvents(_event.EventType.RoomJoinRules, "")?.getContent().join_rule;
  }

  getMyMember() {
    return this.props.room?.getMember(_MatrixClientPeg.MatrixClientPeg.get().getUserId());
  }

  getInviteMember() {
    const {
      room
    } = this.props;

    if (!room) {
      return;
    }

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    const inviteEvent = room.currentState.getMember(myUserId);

    if (!inviteEvent) {
      return;
    }

    const inviterUserId = inviteEvent.events.member.getSender();
    return room.currentState.getMember(inviterUserId);
  }

  isDMInvite() {
    const myMember = this.getMyMember();

    if (!myMember) {
      return false;
    }

    const memberEvent = myMember.events.member;
    const memberContent = memberEvent.getContent();
    return memberContent.membership === "invite" && memberContent.is_direct;
  }

  makeScreenAfterLogin() {
    return {
      screen: 'room',
      params: {
        email: this.props.invitedEmail,
        signurl: this.props.signUrl,
        room_name: this.props.oobData ? this.props.oobData.room_name : null,
        room_avatar_url: this.props.oobData ? this.props.oobData.avatarUrl : null,
        inviter_name: this.props.oobData ? this.props.oobData.inviterName : null
      }
    };
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    const roomName = this.props.room?.name ?? this.props.roomAlias ?? "";

    const isSpace = this.props.room?.isSpaceRoom() ?? this.props.oobData?.roomType === _event.RoomType.Space;

    let showSpinner = false;
    let title;
    let subTitle;
    let reasonElement;
    let primaryActionHandler;
    let primaryActionLabel;
    let secondaryActionHandler;
    let secondaryActionLabel;
    let footer;
    const extraComponents = [];
    const messageCase = this.getMessageCase();

    switch (messageCase) {
      case MessageCase.Joining:
        {
          if (this.props.oobData?.roomType || isSpace) {
            title = isSpace ? (0, _languageHandler._t)("Joining space …") : (0, _languageHandler._t)("Joining room …");
          } else {
            title = (0, _languageHandler._t)("Joining …");
          }

          showSpinner = true;
          break;
        }

      case MessageCase.Loading:
        {
          title = (0, _languageHandler._t)("Loading …");
          showSpinner = true;
          break;
        }

      case MessageCase.Rejecting:
        {
          title = (0, _languageHandler._t)("Rejecting invite …");
          showSpinner = true;
          break;
        }

      case MessageCase.NotLoggedIn:
        {
          const opts = {
            canJoin: false
          };

          if (this.props.room?.roomId) {
            _ModuleRunner.ModuleRunner.instance.invoke(_RoomViewLifecycle.RoomViewLifecycle.PreviewRoomNotLoggedIn, opts, this.props.room.roomId);
          }

          if (opts.canJoin) {
            title = (0, _languageHandler._t)("Join the room to participate");
            primaryActionLabel = (0, _languageHandler._t)("Join");

            primaryActionHandler = () => {
              _ModuleRunner.ModuleRunner.instance.invoke(_RoomViewLifecycle.RoomViewLifecycle.JoinFromRoomPreview, this.props.room.roomId);
            };
          } else {
            title = (0, _languageHandler._t)("Join the conversation with an account");

            if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Registration)) {
              primaryActionLabel = (0, _languageHandler._t)("Sign Up");
              primaryActionHandler = this.onRegisterClick;
            }

            secondaryActionLabel = (0, _languageHandler._t)("Sign In");
            secondaryActionHandler = this.onLoginClick;
          }

          if (this.props.previewLoading) {
            footer = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
              w: 20,
              h: 20
            }), (0, _languageHandler._t)("Loading preview"));
          }

          break;
        }

      case MessageCase.Kicked:
        {
          const {
            memberName,
            reason
          } = this.getKickOrBanInfo();

          if (roomName) {
            title = (0, _languageHandler._t)("You were removed from %(roomName)s by %(memberName)s", {
              memberName,
              roomName
            });
          } else {
            title = (0, _languageHandler._t)("You were removed by %(memberName)s", {
              memberName
            });
          }

          subTitle = reason ? (0, _languageHandler._t)("Reason: %(reason)s", {
            reason
          }) : null;

          if (isSpace) {
            primaryActionLabel = (0, _languageHandler._t)("Forget this space");
          } else {
            primaryActionLabel = (0, _languageHandler._t)("Forget this room");
          }

          primaryActionHandler = this.props.onForgetClick;

          if (this.joinRule() !== _partials.JoinRule.Invite) {
            secondaryActionLabel = primaryActionLabel;
            secondaryActionHandler = primaryActionHandler;
            primaryActionLabel = (0, _languageHandler._t)("Re-join");
            primaryActionHandler = this.props.onJoinClick;
          }

          break;
        }

      case MessageCase.Banned:
        {
          const {
            memberName,
            reason
          } = this.getKickOrBanInfo();

          if (roomName) {
            title = (0, _languageHandler._t)("You were banned from %(roomName)s by %(memberName)s", {
              memberName,
              roomName
            });
          } else {
            title = (0, _languageHandler._t)("You were banned by %(memberName)s", {
              memberName
            });
          }

          subTitle = reason ? (0, _languageHandler._t)("Reason: %(reason)s", {
            reason
          }) : null;

          if (isSpace) {
            primaryActionLabel = (0, _languageHandler._t)("Forget this space");
          } else {
            primaryActionLabel = (0, _languageHandler._t)("Forget this room");
          }

          primaryActionHandler = this.props.onForgetClick;
          break;
        }

      case MessageCase.OtherThreePIDError:
        {
          if (roomName) {
            title = (0, _languageHandler._t)("Something went wrong with your invite to %(roomName)s", {
              roomName
            });
          } else {
            title = (0, _languageHandler._t)("Something went wrong with your invite.");
          }

          const joinRule = this.joinRule();
          const errCodeMessage = (0, _languageHandler._t)("An error (%(errcode)s) was returned while trying to validate your " + "invite. You could try to pass this information on to the person who invited you.", {
            errcode: this.state.threePidFetchError.errcode || (0, _languageHandler._t)("unknown error code")
          });

          switch (joinRule) {
            case "invite":
              subTitle = [(0, _languageHandler._t)("You can only join it with a working invite."), errCodeMessage];
              primaryActionLabel = (0, _languageHandler._t)("Try to join anyway");
              primaryActionHandler = this.props.onJoinClick;
              break;

            case "public":
              subTitle = (0, _languageHandler._t)("You can still join here.");
              primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
              primaryActionHandler = this.props.onJoinClick;
              break;

            default:
              subTitle = errCodeMessage;
              primaryActionLabel = (0, _languageHandler._t)("Try to join anyway");
              primaryActionHandler = this.props.onJoinClick;
              break;
          }

          break;
        }

      case MessageCase.InvitedEmailNotFoundInAccount:
        {
          if (roomName) {
            title = (0, _languageHandler._t)("This invite to %(roomName)s was sent to %(email)s which is not " + "associated with your account", {
              roomName,
              email: this.props.invitedEmail
            });
          } else {
            title = (0, _languageHandler._t)("This invite was sent to %(email)s which is not associated with your account", {
              email: this.props.invitedEmail
            });
          }

          subTitle = (0, _languageHandler._t)("Link this email with your account in Settings to receive invites " + "directly in %(brand)s.", {
            brand
          });
          primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
          primaryActionHandler = this.props.onJoinClick;
          break;
        }

      case MessageCase.InvitedEmailNoIdentityServer:
        {
          if (roomName) {
            title = (0, _languageHandler._t)("This invite to %(roomName)s was sent to %(email)s", {
              roomName,
              email: this.props.invitedEmail
            });
          } else {
            title = (0, _languageHandler._t)("This invite was sent to %(email)s", {
              email: this.props.invitedEmail
            });
          }

          subTitle = (0, _languageHandler._t)("Use an identity server in Settings to receive invites directly in %(brand)s.", {
            brand
          });
          primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
          primaryActionHandler = this.props.onJoinClick;
          break;
        }

      case MessageCase.InvitedEmailMismatch:
        {
          if (roomName) {
            title = (0, _languageHandler._t)("This invite to %(roomName)s was sent to %(email)s", {
              roomName,
              email: this.props.invitedEmail
            });
          } else {
            title = (0, _languageHandler._t)("This invite was sent to %(email)s", {
              email: this.props.invitedEmail
            });
          }

          subTitle = (0, _languageHandler._t)("Share this email in Settings to receive invites directly in %(brand)s.", {
            brand
          });
          primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
          primaryActionHandler = this.props.onJoinClick;
          break;
        }

      case MessageCase.Invite:
        {
          const avatar = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
            room: this.props.room,
            oobData: this.props.oobData
          });

          const inviteMember = this.getInviteMember();
          let inviterElement;

          if (inviteMember) {
            inviterElement = /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("span", {
              className: "mx_RoomPreviewBar_inviter"
            }, inviteMember.rawDisplayName), " (", inviteMember.userId, ")");
          } else {
            inviterElement = /*#__PURE__*/_react.default.createElement("span", {
              className: "mx_RoomPreviewBar_inviter"
            }, this.props.inviterName);
          }

          const isDM = this.isDMInvite();

          if (isDM) {
            title = (0, _languageHandler._t)("Do you want to chat with %(user)s?", {
              user: inviteMember.name
            });
            subTitle = [avatar, (0, _languageHandler._t)("<userName/> wants to chat", {}, {
              userName: () => inviterElement
            })];
            primaryActionLabel = (0, _languageHandler._t)("Start chatting");
          } else {
            title = (0, _languageHandler._t)("Do you want to join %(roomName)s?", {
              roomName
            });
            subTitle = [avatar, (0, _languageHandler._t)("<userName/> invited you", {}, {
              userName: () => inviterElement
            })];
            primaryActionLabel = (0, _languageHandler._t)("Accept");
          }

          const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

          const memberEventContent = this.props.room.currentState.getMember(myUserId).events.member.getContent();

          if (memberEventContent.reason) {
            reasonElement = /*#__PURE__*/_react.default.createElement(_InviteReason.default, {
              reason: memberEventContent.reason,
              htmlReason: memberEventContent[MemberEventHtmlReasonField]
            });
          }

          primaryActionHandler = this.props.onJoinClick;
          secondaryActionLabel = (0, _languageHandler._t)("Reject");
          secondaryActionHandler = this.props.onRejectClick;

          if (this.props.onRejectAndIgnoreClick) {
            extraComponents.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
              kind: "secondary",
              onClick: this.props.onRejectAndIgnoreClick,
              key: "ignore"
            }, (0, _languageHandler._t)("Reject & Ignore user")));
          }

          break;
        }

      case MessageCase.ViewingRoom:
        {
          if (this.props.canPreview) {
            title = (0, _languageHandler._t)("You're previewing %(roomName)s. Want to join it?", {
              roomName
            });
          } else if (roomName) {
            title = (0, _languageHandler._t)("%(roomName)s can't be previewed. Do you want to join it?", {
              roomName
            });
          } else {
            title = (0, _languageHandler._t)("There's no preview, would you like to join?");
          }

          primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
          primaryActionHandler = this.props.onJoinClick;
          break;
        }

      case MessageCase.RoomNotFound:
        {
          if (roomName) {
            title = (0, _languageHandler._t)("%(roomName)s does not exist.", {
              roomName
            });
          } else {
            title = (0, _languageHandler._t)("This room or space does not exist.");
          }

          subTitle = (0, _languageHandler._t)("Are you sure you're at the right place?");
          break;
        }

      case MessageCase.OtherError:
        {
          if (roomName) {
            title = (0, _languageHandler._t)("%(roomName)s is not accessible at this time.", {
              roomName
            });
          } else {
            title = (0, _languageHandler._t)("This room or space is not accessible at this time.");
          }

          subTitle = [(0, _languageHandler._t)("Try again later, or ask a room or space admin to check if you have access."), (0, _languageHandler._t)("%(errcode)s was returned while trying to access the room or space. " + "If you think you're seeing this message in error, please " + "<issueLink>submit a bug report</issueLink>.", {
            errcode: this.props.error.errcode
          }, {
            issueLink: label => /*#__PURE__*/_react.default.createElement("a", {
              href: "https://github.com/vector-im/element-web/issues/new/choose",
              target: "_blank",
              rel: "noreferrer noopener"
            }, label)
          })];
          break;
        }
    }

    let subTitleElements;

    if (subTitle) {
      if (!Array.isArray(subTitle)) {
        subTitle = [subTitle];
      }

      subTitleElements = subTitle.map((t, i) => /*#__PURE__*/_react.default.createElement("p", {
        key: `subTitle${i}`
      }, t));
    }

    let titleElement;

    if (showSpinner) {
      titleElement = /*#__PURE__*/_react.default.createElement("h3", {
        className: "mx_RoomPreviewBar_spinnerTitle"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null), title);
    } else {
      titleElement = /*#__PURE__*/_react.default.createElement("h3", null, title);
    }

    let primaryButton;

    if (primaryActionHandler) {
      primaryButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: primaryActionHandler
      }, primaryActionLabel);
    }

    let secondaryButton;

    if (secondaryActionHandler) {
      secondaryButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "secondary",
        onClick: secondaryActionHandler
      }, secondaryActionLabel);
    }

    const isPanel = this.props.canPreview;
    const classes = (0, _classnames.default)("mx_RoomPreviewBar", "dark-panel", `mx_RoomPreviewBar_${messageCase}`, {
      "mx_RoomPreviewBar_panel": isPanel,
      "mx_RoomPreviewBar_dialog": !isPanel
    }); // ensure correct tab order for both views

    const actions = isPanel ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, secondaryButton, extraComponents, primaryButton) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, primaryButton, extraComponents, secondaryButton);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewBar_message"
    }, titleElement, subTitleElements), reasonElement, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewBar_actions"
    }, actions), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewBar_footer"
    }, footer));
  }

}

exports.default = RoomPreviewBar;
(0, _defineProperty2.default)(RoomPreviewBar, "defaultProps", {
  onJoinClick() {}

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZW1iZXJFdmVudEh0bWxSZWFzb25GaWVsZCIsIk1lc3NhZ2VDYXNlIiwiUm9vbVByZXZpZXdCYXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInNjcmVlbkFmdGVyTG9naW4iLCJtYWtlU2NyZWVuQWZ0ZXJMb2dpbiIsInN0YXRlIiwiYnVzeSIsImNvbXBvbmVudERpZE1vdW50IiwiY2hlY2tJbnZpdGVkRW1haWwiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJwcmV2U3RhdGUiLCJpbnZpdGVkRW1haWwiLCJpbnZpdGVyTmFtZSIsInNldFN0YXRlIiwiYWNjb3VudDNwaWRzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VGhyZWVQaWRzIiwiYWNjb3VudEVtYWlscyIsInRocmVlcGlkcyIsImZpbHRlciIsImIiLCJtZWRpdW0iLCJtYXAiLCJhZGRyZXNzIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJhdXRoQ2xpZW50IiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwiaWRlbnRpdHlBY2Nlc3NUb2tlbiIsImdldEFjY2Vzc1Rva2VuIiwicmVzdWx0IiwibG9va3VwVGhyZWVQaWQiLCJ1bmRlZmluZWQiLCJpbnZpdGVkRW1haWxNeGlkIiwibXhpZCIsImVyciIsInRocmVlUGlkRmV0Y2hFcnJvciIsImdldE1lc3NhZ2VDYXNlIiwiaXNHdWVzdCIsIk5vdExvZ2dlZEluIiwibXlNZW1iZXIiLCJnZXRNeU1lbWJlciIsImlzS2lja2VkIiwiS2lja2VkIiwibWVtYmVyc2hpcCIsIkJhbm5lZCIsImpvaW5pbmciLCJKb2luaW5nIiwicmVqZWN0aW5nIiwiUmVqZWN0aW5nIiwibG9hZGluZyIsIkxvYWRpbmciLCJPdGhlclRocmVlUElERXJyb3IiLCJpbmNsdWRlcyIsIkludml0ZWRFbWFpbE5vdEZvdW5kSW5BY2NvdW50IiwiSW52aXRlZEVtYWlsTm9JZGVudGl0eVNlcnZlciIsImdldFVzZXJJZCIsIkludml0ZWRFbWFpbE1pc21hdGNoIiwiSW52aXRlIiwiZXJyb3IiLCJlcnJjb2RlIiwiUm9vbU5vdEZvdW5kIiwiT3RoZXJFcnJvciIsIlZpZXdpbmdSb29tIiwiZ2V0S2lja09yQmFuSW5mbyIsImtpY2tlck1lbWJlciIsInJvb20iLCJjdXJyZW50U3RhdGUiLCJnZXRNZW1iZXIiLCJldmVudHMiLCJtZW1iZXIiLCJnZXRTZW5kZXIiLCJtZW1iZXJOYW1lIiwibmFtZSIsInJlYXNvbiIsImdldENvbnRlbnQiLCJqb2luUnVsZSIsImdldFN0YXRlRXZlbnRzIiwiRXZlbnRUeXBlIiwiUm9vbUpvaW5SdWxlcyIsImpvaW5fcnVsZSIsImdldEludml0ZU1lbWJlciIsIm15VXNlcklkIiwiaW52aXRlRXZlbnQiLCJpbnZpdGVyVXNlcklkIiwiaXNETUludml0ZSIsIm1lbWJlckV2ZW50IiwibWVtYmVyQ29udGVudCIsImlzX2RpcmVjdCIsInNjcmVlbiIsInBhcmFtcyIsImVtYWlsIiwic2lnbnVybCIsInNpZ25VcmwiLCJyb29tX25hbWUiLCJvb2JEYXRhIiwicm9vbV9hdmF0YXJfdXJsIiwiYXZhdGFyVXJsIiwiaW52aXRlcl9uYW1lIiwicmVuZGVyIiwiYnJhbmQiLCJTZGtDb25maWciLCJyb29tTmFtZSIsInJvb21BbGlhcyIsImlzU3BhY2UiLCJpc1NwYWNlUm9vbSIsInJvb21UeXBlIiwiUm9vbVR5cGUiLCJTcGFjZSIsInNob3dTcGlubmVyIiwidGl0bGUiLCJzdWJUaXRsZSIsInJlYXNvbkVsZW1lbnQiLCJwcmltYXJ5QWN0aW9uSGFuZGxlciIsInByaW1hcnlBY3Rpb25MYWJlbCIsInNlY29uZGFyeUFjdGlvbkhhbmRsZXIiLCJzZWNvbmRhcnlBY3Rpb25MYWJlbCIsImZvb3RlciIsImV4dHJhQ29tcG9uZW50cyIsIm1lc3NhZ2VDYXNlIiwiX3QiLCJvcHRzIiwiY2FuSm9pbiIsInJvb21JZCIsIk1vZHVsZVJ1bm5lciIsImluc3RhbmNlIiwiaW52b2tlIiwiUm9vbVZpZXdMaWZlY3ljbGUiLCJQcmV2aWV3Um9vbU5vdExvZ2dlZEluIiwiSm9pbkZyb21Sb29tUHJldmlldyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIlJlZ2lzdHJhdGlvbiIsIm9uUmVnaXN0ZXJDbGljayIsIm9uTG9naW5DbGljayIsInByZXZpZXdMb2FkaW5nIiwib25Gb3JnZXRDbGljayIsIkpvaW5SdWxlIiwib25Kb2luQ2xpY2siLCJlcnJDb2RlTWVzc2FnZSIsImF2YXRhciIsImludml0ZU1lbWJlciIsImludml0ZXJFbGVtZW50IiwicmF3RGlzcGxheU5hbWUiLCJ1c2VySWQiLCJpc0RNIiwidXNlciIsInVzZXJOYW1lIiwibWVtYmVyRXZlbnRDb250ZW50Iiwib25SZWplY3RDbGljayIsIm9uUmVqZWN0QW5kSWdub3JlQ2xpY2siLCJwdXNoIiwiY2FuUHJldmlldyIsImlzc3VlTGluayIsImxhYmVsIiwic3ViVGl0bGVFbGVtZW50cyIsIkFycmF5IiwiaXNBcnJheSIsInQiLCJpIiwidGl0bGVFbGVtZW50IiwicHJpbWFyeUJ1dHRvbiIsInNlY29uZGFyeUJ1dHRvbiIsImlzUGFuZWwiLCJjbGFzc2VzIiwiY2xhc3NOYW1lcyIsImFjdGlvbnMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9Sb29tUHJldmlld0Jhci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBNYXRyaXhFcnJvciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9odHRwLWFwaVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlLCBSb29tVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IElKb2luUnVsZUV2ZW50Q29udGVudCwgSm9pblJ1bGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3BhcnRpYWxzXCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge1xuICAgIFJvb21QcmV2aWV3T3B0cyxcbiAgICBSb29tVmlld0xpZmVjeWNsZSxcbn0gZnJvbSBcIkBtYXRyaXgtb3JnL3JlYWN0LXNkay1tb2R1bGUtYXBpL2xpYi9saWZlY3ljbGVzL1Jvb21WaWV3TGlmZWN5Y2xlXCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBJZGVudGl0eUF1dGhDbGllbnQgZnJvbSAnLi4vLi4vLi4vSWRlbnRpdHlBdXRoQ2xpZW50JztcbmltcG9ydCBJbnZpdGVSZWFzb24gZnJvbSBcIi4uL2VsZW1lbnRzL0ludml0ZVJlYXNvblwiO1xuaW1wb3J0IHsgSU9PQkRhdGEgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1RocmVlcGlkSW52aXRlU3RvcmVcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFVJRmVhdHVyZSB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCB7IE1vZHVsZVJ1bm5lciB9IGZyb20gXCIuLi8uLi8uLi9tb2R1bGVzL01vZHVsZVJ1bm5lclwiO1xuXG5jb25zdCBNZW1iZXJFdmVudEh0bWxSZWFzb25GaWVsZCA9IFwiaW8uZWxlbWVudC5odG1sX3JlYXNvblwiO1xuXG5lbnVtIE1lc3NhZ2VDYXNlIHtcbiAgICBOb3RMb2dnZWRJbiA9IFwiTm90TG9nZ2VkSW5cIixcbiAgICBKb2luaW5nID0gXCJKb2luaW5nXCIsXG4gICAgTG9hZGluZyA9IFwiTG9hZGluZ1wiLFxuICAgIFJlamVjdGluZyA9IFwiUmVqZWN0aW5nXCIsXG4gICAgS2lja2VkID0gXCJLaWNrZWRcIixcbiAgICBCYW5uZWQgPSBcIkJhbm5lZFwiLFxuICAgIE90aGVyVGhyZWVQSURFcnJvciA9IFwiT3RoZXJUaHJlZVBJREVycm9yXCIsXG4gICAgSW52aXRlZEVtYWlsTm90Rm91bmRJbkFjY291bnQgPSBcIkludml0ZWRFbWFpbE5vdEZvdW5kSW5BY2NvdW50XCIsXG4gICAgSW52aXRlZEVtYWlsTm9JZGVudGl0eVNlcnZlciA9IFwiSW52aXRlZEVtYWlsTm9JZGVudGl0eVNlcnZlclwiLFxuICAgIEludml0ZWRFbWFpbE1pc21hdGNoID0gXCJJbnZpdGVkRW1haWxNaXNtYXRjaFwiLFxuICAgIEludml0ZSA9IFwiSW52aXRlXCIsXG4gICAgVmlld2luZ1Jvb20gPSBcIlZpZXdpbmdSb29tXCIsXG4gICAgUm9vbU5vdEZvdW5kID0gXCJSb29tTm90Rm91bmRcIixcbiAgICBPdGhlckVycm9yID0gXCJPdGhlckVycm9yXCIsXG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIGlmIGludml0ZXJOYW1lIGlzIHNwZWNpZmllZCwgdGhlIHByZXZpZXcgYmFyIHdpbGwgc2hvd24gYW4gaW52aXRlIHRvIHRoZSByb29tLlxuICAgIC8vIFlvdSBzaG91bGQgYWxzbyBzcGVjaWZ5IG9uUmVqZWN0Q2xpY2sgaWYgc3BlY2lmeWluZyBpbnZpdGVyTmFtZVxuICAgIGludml0ZXJOYW1lPzogc3RyaW5nO1xuXG4gICAgLy8gSWYgaW52aXRlZCBieSAzcmQgcGFydHkgaW52aXRlLCB0aGUgZW1haWwgYWRkcmVzcyB0aGUgaW52aXRlIHdhcyBzZW50IHRvXG4gICAgaW52aXRlZEVtYWlsPzogc3RyaW5nO1xuXG4gICAgLy8gRm9yIHRoaXJkIHBhcnR5IGludml0ZXMsIGluZm9ybWF0aW9uIHBhc3NlZCBhYm91dCB0aGUgcm9vbSBvdXQtb2YtYmFuZFxuICAgIG9vYkRhdGE/OiBJT09CRGF0YTtcblxuICAgIC8vIEZvciB0aGlyZCBwYXJ0eSBpbnZpdGVzLCBhIFVSTCBmb3IgYSAzcGlkIGludml0ZSBzaWduaW5nIHNlcnZpY2VcbiAgICBzaWduVXJsPzogc3RyaW5nO1xuXG4gICAgLy8gQSBzdGFuZGFyZCBjbGllbnQvc2VydmVyIEFQSSBlcnJvciBvYmplY3QuIElmIHN1cHBsaWVkLCBpbmRpY2F0ZXMgdGhhdCB0aGVcbiAgICAvLyBjYWxsZXIgd2FzIHVuYWJsZSB0byBmZXRjaCBkZXRhaWxzIGFib3V0IHRoZSByb29tIGZvciB0aGUgZ2l2ZW4gcmVhc29uLlxuICAgIGVycm9yPzogTWF0cml4RXJyb3I7XG5cbiAgICBjYW5QcmV2aWV3PzogYm9vbGVhbjtcbiAgICBwcmV2aWV3TG9hZGluZz86IGJvb2xlYW47XG4gICAgcm9vbT86IFJvb207XG5cbiAgICBsb2FkaW5nPzogYm9vbGVhbjtcbiAgICBqb2luaW5nPzogYm9vbGVhbjtcbiAgICByZWplY3Rpbmc/OiBib29sZWFuO1xuICAgIC8vIFRoZSBhbGlhcyB0aGF0IHdhcyB1c2VkIHRvIGFjY2VzcyB0aGlzIHJvb20sIGlmIGFwcHJvcHJpYXRlXG4gICAgLy8gSWYgZ2l2ZW4sIHRoaXMgd2lsbCBiZSBob3cgdGhlIHJvb20gaXMgcmVmZXJyZWQgdG8gKGVnLlxuICAgIC8vIGluIGVycm9yIG1lc3NhZ2VzKS5cbiAgICByb29tQWxpYXM/OiBzdHJpbmc7XG5cbiAgICBvbkpvaW5DbGljaz8oKTogdm9pZDtcbiAgICBvblJlamVjdENsaWNrPygpOiB2b2lkO1xuICAgIG9uUmVqZWN0QW5kSWdub3JlQ2xpY2s/KCk6IHZvaWQ7XG4gICAgb25Gb3JnZXRDbGljaz8oKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICBhY2NvdW50RW1haWxzPzogc3RyaW5nW107XG4gICAgaW52aXRlZEVtYWlsTXhpZD86IHN0cmluZztcbiAgICB0aHJlZVBpZEZldGNoRXJyb3I/OiBNYXRyaXhFcnJvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbVByZXZpZXdCYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBvbkpvaW5DbGljaygpIHt9LFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmNoZWNrSW52aXRlZEVtYWlsKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmludml0ZWRFbWFpbCAhPT0gcHJldlByb3BzLmludml0ZWRFbWFpbCB8fCB0aGlzLnByb3BzLmludml0ZXJOYW1lICE9PSBwcmV2UHJvcHMuaW52aXRlck5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tJbnZpdGVkRW1haWwoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY2hlY2tJbnZpdGVkRW1haWwoKSB7XG4gICAgICAgIC8vIElmIHRoaXMgaXMgYW4gaW52aXRlIGFuZCB3ZSd2ZSBiZWVuIHRvbGQgd2hhdCBlbWFpbCBhZGRyZXNzIHdhc1xuICAgICAgICAvLyBpbnZpdGVkLCBmZXRjaCB0aGUgdXNlcidzIGFjY291bnQgZW1haWxzIGFuZCBkaXNjb3ZlcnkgYmluZGluZ3Mgc28gd2VcbiAgICAgICAgLy8gY2FuIGNoZWNrIHRoZW0gYWdhaW5zdCB0aGUgZW1haWwgdGhhdCB3YXMgaW52aXRlZC5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaW52aXRlck5hbWUgJiYgdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlIH0pO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBHYXRoZXIgdGhlIGFjY291bnQgM1BJRHNcbiAgICAgICAgICAgICAgICBjb25zdCBhY2NvdW50M3BpZHMgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VGhyZWVQaWRzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRFbWFpbHM6IGFjY291bnQzcGlkcy50aHJlZXBpZHMuZmlsdGVyKGIgPT4gYi5tZWRpdW0gPT09ICdlbWFpbCcpLm1hcChiID0+IGIuYWRkcmVzcyksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBJUyBjb25uZWN0ZWQsIHVzZSB0aGF0IHRvIGxvb2t1cCB0aGUgZW1haWwgYW5kXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdGhlIGJvdW5kIE1YSUQuXG4gICAgICAgICAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgYnVzeTogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgYXV0aENsaWVudCA9IG5ldyBJZGVudGl0eUF1dGhDbGllbnQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZGVudGl0eUFjY2Vzc1Rva2VuID0gYXdhaXQgYXV0aENsaWVudC5nZXRBY2Nlc3NUb2tlbigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5sb29rdXBUaHJlZVBpZChcbiAgICAgICAgICAgICAgICAgICAgJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCAvKiBjYWxsYmFjayAqLyxcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpdHlBY2Nlc3NUb2tlbixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpbnZpdGVkRW1haWxNeGlkOiByZXN1bHQubXhpZCB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0aHJlZVBpZEZldGNoRXJyb3I6IGVyciB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TWVzc2FnZUNhc2UoKTogTWVzc2FnZUNhc2Uge1xuICAgICAgICBjb25zdCBpc0d1ZXN0ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKTtcblxuICAgICAgICBpZiAoaXNHdWVzdCkge1xuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLk5vdExvZ2dlZEluO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbXlNZW1iZXIgPSB0aGlzLmdldE15TWVtYmVyKCk7XG5cbiAgICAgICAgaWYgKG15TWVtYmVyKSB7XG4gICAgICAgICAgICBpZiAobXlNZW1iZXIuaXNLaWNrZWQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5LaWNrZWQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG15TWVtYmVyLm1lbWJlcnNoaXAgPT09IFwiYmFuXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuQmFubmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuam9pbmluZykge1xuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLkpvaW5pbmc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5yZWplY3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5SZWplY3Rpbmc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5sb2FkaW5nIHx8IHRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLkxvYWRpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5pbnZpdGVyTmFtZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaW52aXRlZEVtYWlsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudGhyZWVQaWRGZXRjaEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5PdGhlclRocmVlUElERXJyb3I7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5hY2NvdW50RW1haWxzICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnN0YXRlLmFjY291bnRFbWFpbHMuaW5jbHVkZXModGhpcy5wcm9wcy5pbnZpdGVkRW1haWwpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5JbnZpdGVkRW1haWxOb3RGb3VuZEluQWNjb3VudDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuSW52aXRlZEVtYWlsTm9JZGVudGl0eVNlcnZlcjtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaW52aXRlZEVtYWlsTXhpZCAhPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLkludml0ZWRFbWFpbE1pc21hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5JbnZpdGU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5lcnJvcikge1xuICAgICAgICAgICAgaWYgKCh0aGlzLnByb3BzLmVycm9yIGFzIE1hdHJpeEVycm9yKS5lcnJjb2RlID09ICdNX05PVF9GT1VORCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuUm9vbU5vdEZvdW5kO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuT3RoZXJFcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5WaWV3aW5nUm9vbTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0S2lja09yQmFuSW5mbygpOiB7IG1lbWJlck5hbWU/OiBzdHJpbmcsIHJlYXNvbj86IHN0cmluZyB9IHtcbiAgICAgICAgY29uc3QgbXlNZW1iZXIgPSB0aGlzLmdldE15TWVtYmVyKCk7XG4gICAgICAgIGlmICghbXlNZW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBraWNrZXJNZW1iZXIgPSB0aGlzLnByb3BzLnJvb20uY3VycmVudFN0YXRlLmdldE1lbWJlcihcbiAgICAgICAgICAgIG15TWVtYmVyLmV2ZW50cy5tZW1iZXIuZ2V0U2VuZGVyKCksXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IG1lbWJlck5hbWUgPSBraWNrZXJNZW1iZXIgP1xuICAgICAgICAgICAga2lja2VyTWVtYmVyLm5hbWUgOiBteU1lbWJlci5ldmVudHMubWVtYmVyLmdldFNlbmRlcigpO1xuICAgICAgICBjb25zdCByZWFzb24gPSBteU1lbWJlci5ldmVudHMubWVtYmVyLmdldENvbnRlbnQoKS5yZWFzb247XG4gICAgICAgIHJldHVybiB7IG1lbWJlck5hbWUsIHJlYXNvbiB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgam9pblJ1bGUoKTogSm9pblJ1bGUge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5yb29tPy5jdXJyZW50U3RhdGVcbiAgICAgICAgICAgIC5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbUpvaW5SdWxlcywgXCJcIik/LmdldENvbnRlbnQ8SUpvaW5SdWxlRXZlbnRDb250ZW50PigpLmpvaW5fcnVsZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE15TWVtYmVyKCk6IFJvb21NZW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5yb29tPy5nZXRNZW1iZXIoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEludml0ZU1lbWJlcigpOiBSb29tTWVtYmVyIHtcbiAgICAgICAgY29uc3QgeyByb29tIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBteVVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgaW52aXRlRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIobXlVc2VySWQpO1xuICAgICAgICBpZiAoIWludml0ZUV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW52aXRlclVzZXJJZCA9IGludml0ZUV2ZW50LmV2ZW50cy5tZW1iZXIuZ2V0U2VuZGVyKCk7XG4gICAgICAgIHJldHVybiByb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIoaW52aXRlclVzZXJJZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0RNSW52aXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBteU1lbWJlciA9IHRoaXMuZ2V0TXlNZW1iZXIoKTtcbiAgICAgICAgaWYgKCFteU1lbWJlcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lbWJlckV2ZW50ID0gbXlNZW1iZXIuZXZlbnRzLm1lbWJlcjtcbiAgICAgICAgY29uc3QgbWVtYmVyQ29udGVudCA9IG1lbWJlckV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgcmV0dXJuIG1lbWJlckNvbnRlbnQubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIiAmJiBtZW1iZXJDb250ZW50LmlzX2RpcmVjdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1ha2VTY3JlZW5BZnRlckxvZ2luKCk6IHsgc2NyZWVuOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55PiB9IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjcmVlbjogJ3Jvb20nLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IHRoaXMucHJvcHMuaW52aXRlZEVtYWlsLFxuICAgICAgICAgICAgICAgIHNpZ251cmw6IHRoaXMucHJvcHMuc2lnblVybCxcbiAgICAgICAgICAgICAgICByb29tX25hbWU6IHRoaXMucHJvcHMub29iRGF0YSA/IHRoaXMucHJvcHMub29iRGF0YS5yb29tX25hbWUgOiBudWxsLFxuICAgICAgICAgICAgICAgIHJvb21fYXZhdGFyX3VybDogdGhpcy5wcm9wcy5vb2JEYXRhID8gdGhpcy5wcm9wcy5vb2JEYXRhLmF2YXRhclVybCA6IG51bGwsXG4gICAgICAgICAgICAgICAgaW52aXRlcl9uYW1lOiB0aGlzLnByb3BzLm9vYkRhdGEgPyB0aGlzLnByb3BzLm9vYkRhdGEuaW52aXRlck5hbWUgOiBudWxsLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTG9naW5DbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnc3RhcnRfbG9naW4nLCBzY3JlZW5BZnRlckxvZ2luOiB0aGlzLm1ha2VTY3JlZW5BZnRlckxvZ2luKCkgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWdpc3RlckNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nLCBzY3JlZW5BZnRlckxvZ2luOiB0aGlzLm1ha2VTY3JlZW5BZnRlckxvZ2luKCkgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgIGNvbnN0IHJvb21OYW1lID0gdGhpcy5wcm9wcy5yb29tPy5uYW1lID8/IHRoaXMucHJvcHMucm9vbUFsaWFzID8/IFwiXCI7XG4gICAgICAgIGNvbnN0IGlzU3BhY2UgPSB0aGlzLnByb3BzLnJvb20/LmlzU3BhY2VSb29tKCkgPz8gdGhpcy5wcm9wcy5vb2JEYXRhPy5yb29tVHlwZSA9PT0gUm9vbVR5cGUuU3BhY2U7XG5cbiAgICAgICAgbGV0IHNob3dTcGlubmVyID0gZmFsc2U7XG4gICAgICAgIGxldCB0aXRsZTtcbiAgICAgICAgbGV0IHN1YlRpdGxlO1xuICAgICAgICBsZXQgcmVhc29uRWxlbWVudDtcbiAgICAgICAgbGV0IHByaW1hcnlBY3Rpb25IYW5kbGVyO1xuICAgICAgICBsZXQgcHJpbWFyeUFjdGlvbkxhYmVsO1xuICAgICAgICBsZXQgc2Vjb25kYXJ5QWN0aW9uSGFuZGxlcjtcbiAgICAgICAgbGV0IHNlY29uZGFyeUFjdGlvbkxhYmVsO1xuICAgICAgICBsZXQgZm9vdGVyO1xuICAgICAgICBjb25zdCBleHRyYUNvbXBvbmVudHMgPSBbXTtcblxuICAgICAgICBjb25zdCBtZXNzYWdlQ2FzZSA9IHRoaXMuZ2V0TWVzc2FnZUNhc2UoKTtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlQ2FzZSkge1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5Kb2luaW5nOiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub29iRGF0YT8ucm9vbVR5cGUgfHwgaXNTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IGlzU3BhY2UgPyBfdChcIkpvaW5pbmcgc3BhY2Ug4oCmXCIpIDogX3QoXCJKb2luaW5nIHJvb20g4oCmXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJKb2luaW5nIOKAplwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzaG93U3Bpbm5lciA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkxvYWRpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiTG9hZGluZyDigKZcIik7XG4gICAgICAgICAgICAgICAgc2hvd1NwaW5uZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5SZWplY3Rpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiUmVqZWN0aW5nIGludml0ZSDigKZcIik7XG4gICAgICAgICAgICAgICAgc2hvd1NwaW5uZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5Ob3RMb2dnZWRJbjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wdHM6IFJvb21QcmV2aWV3T3B0cyA9IHsgY2FuSm9pbjogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tPy5yb29tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgTW9kdWxlUnVubmVyLmluc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAuaW52b2tlKFJvb21WaWV3TGlmZWN5Y2xlLlByZXZpZXdSb29tTm90TG9nZ2VkSW4sIG9wdHMsIHRoaXMucHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0cy5jYW5Kb2luKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJKb2luIHRoZSByb29tIHRvIHBhcnRpY2lwYXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIkpvaW5cIik7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kdWxlUnVubmVyLmluc3RhbmNlLmludm9rZShSb29tVmlld0xpZmVjeWNsZS5Kb2luRnJvbVJvb21QcmV2aWV3LCB0aGlzLnByb3BzLnJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiSm9pbiB0aGUgY29udmVyc2F0aW9uIHdpdGggYW4gYWNjb3VudFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlJlZ2lzdHJhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiU2lnbiBVcFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5vblJlZ2lzdGVyQ2xpY2s7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5QWN0aW9uTGFiZWwgPSBfdChcIlNpZ24gSW5cIik7XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLm9uTG9naW5DbGljaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMucHJldmlld0xvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9vdGVyID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U3Bpbm5lciB3PXsyMH0gaD17MjB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkxvYWRpbmcgcHJldmlld1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLktpY2tlZDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgbWVtYmVyTmFtZSwgcmVhc29uIH0gPSB0aGlzLmdldEtpY2tPckJhbkluZm8oKTtcbiAgICAgICAgICAgICAgICBpZiAocm9vbU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSB3ZXJlIHJlbW92ZWQgZnJvbSAlKHJvb21OYW1lKXMgYnkgJShtZW1iZXJOYW1lKXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbWVtYmVyTmFtZSwgcm9vbU5hbWUgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSB3ZXJlIHJlbW92ZWQgYnkgJShtZW1iZXJOYW1lKXNcIiwgeyBtZW1iZXJOYW1lIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IHJlYXNvbiA/IF90KFwiUmVhc29uOiAlKHJlYXNvbilzXCIsIHsgcmVhc29uIH0pIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIGlmIChpc1NwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiRm9yZ2V0IHRoaXMgc3BhY2VcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJGb3JnZXQgdGhpcyByb29tXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Gb3JnZXRDbGljaztcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmpvaW5SdWxlKCkgIT09IEpvaW5SdWxlLkludml0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlBY3Rpb25MYWJlbCA9IHByaW1hcnlBY3Rpb25MYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5QWN0aW9uSGFuZGxlciA9IHByaW1hcnlBY3Rpb25IYW5kbGVyO1xuXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiUmUtam9pblwiKTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLnByb3BzLm9uSm9pbkNsaWNrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuQmFubmVkOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBtZW1iZXJOYW1lLCByZWFzb24gfSA9IHRoaXMuZ2V0S2lja09yQmFuSW5mbygpO1xuICAgICAgICAgICAgICAgIGlmIChyb29tTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiWW91IHdlcmUgYmFubmVkIGZyb20gJShyb29tTmFtZSlzIGJ5ICUobWVtYmVyTmFtZSlzXCIsIHsgbWVtYmVyTmFtZSwgcm9vbU5hbWUgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSB3ZXJlIGJhbm5lZCBieSAlKG1lbWJlck5hbWUpc1wiLCB7IG1lbWJlck5hbWUgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gcmVhc29uID8gX3QoXCJSZWFzb246ICUocmVhc29uKXNcIiwgeyByZWFzb24gfSkgOiBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChpc1NwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiRm9yZ2V0IHRoaXMgc3BhY2VcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJGb3JnZXQgdGhpcyByb29tXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Gb3JnZXRDbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuT3RoZXJUaHJlZVBJREVycm9yOiB7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJTb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHlvdXIgaW52aXRlIHRvICUocm9vbU5hbWUpc1wiLCB7IHJvb21OYW1lIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJTb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHlvdXIgaW52aXRlLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgam9pblJ1bGUgPSB0aGlzLmpvaW5SdWxlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyQ29kZU1lc3NhZ2UgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBbiBlcnJvciAoJShlcnJjb2RlKXMpIHdhcyByZXR1cm5lZCB3aGlsZSB0cnlpbmcgdG8gdmFsaWRhdGUgeW91ciBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiaW52aXRlLiBZb3UgY291bGQgdHJ5IHRvIHBhc3MgdGhpcyBpbmZvcm1hdGlvbiBvbiB0byB0aGUgcGVyc29uIHdobyBpbnZpdGVkIHlvdS5cIixcbiAgICAgICAgICAgICAgICAgICAgeyBlcnJjb2RlOiB0aGlzLnN0YXRlLnRocmVlUGlkRmV0Y2hFcnJvci5lcnJjb2RlIHx8IF90KFwidW5rbm93biBlcnJvciBjb2RlXCIpIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGpvaW5SdWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJpbnZpdGVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90KFwiWW91IGNhbiBvbmx5IGpvaW4gaXQgd2l0aCBhIHdvcmtpbmcgaW52aXRlLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJDb2RlTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIlRyeSB0byBqb2luIGFueXdheVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicHVibGljXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IF90KFwiWW91IGNhbiBzdGlsbCBqb2luIGhlcmUuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJKb2luIHRoZSBkaXNjdXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLnByb3BzLm9uSm9pbkNsaWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IGVyckNvZGVNZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJUcnkgdG8gam9pbiBhbnl3YXlcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkludml0ZWRFbWFpbE5vdEZvdW5kSW5BY2NvdW50OiB7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXMgd2hpY2ggaXMgbm90IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXNzb2NpYXRlZCB3aXRoIHlvdXIgYWNjb3VudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLnByb3BzLmludml0ZWRFbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyBpbnZpdGUgd2FzIHNlbnQgdG8gJShlbWFpbClzIHdoaWNoIGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggeW91ciBhY2NvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGVtYWlsOiB0aGlzLnByb3BzLmludml0ZWRFbWFpbCB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiTGluayB0aGlzIGVtYWlsIHdpdGggeW91ciBhY2NvdW50IGluIFNldHRpbmdzIHRvIHJlY2VpdmUgaW52aXRlcyBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZGlyZWN0bHkgaW4gJShicmFuZClzLlwiLFxuICAgICAgICAgICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIkpvaW4gdGhlIGRpc2N1c3Npb25cIik7XG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLnByb3BzLm9uSm9pbkNsaWNrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5JbnZpdGVkRW1haWxOb0lkZW50aXR5U2VydmVyOiB7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJUaGlzIGludml0ZSB3YXMgc2VudCB0byAlKGVtYWlsKXNcIiwgeyBlbWFpbDogdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyIGluIFNldHRpbmdzIHRvIHJlY2VpdmUgaW52aXRlcyBkaXJlY3RseSBpbiAlKGJyYW5kKXMuXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiSm9pbiB0aGUgZGlzY3Vzc2lvblwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkludml0ZWRFbWFpbE1pc21hdGNoOiB7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJUaGlzIGludml0ZSB3YXMgc2VudCB0byAlKGVtYWlsKXNcIiwgeyBlbWFpbDogdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJTaGFyZSB0aGlzIGVtYWlsIGluIFNldHRpbmdzIHRvIHJlY2VpdmUgaW52aXRlcyBkaXJlY3RseSBpbiAlKGJyYW5kKXMuXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiSm9pbiB0aGUgZGlzY3Vzc2lvblwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkludml0ZToge1xuICAgICAgICAgICAgICAgIGNvbnN0IGF2YXRhciA9IDxSb29tQXZhdGFyIHJvb209e3RoaXMucHJvcHMucm9vbX0gb29iRGF0YT17dGhpcy5wcm9wcy5vb2JEYXRhfSAvPjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZU1lbWJlciA9IHRoaXMuZ2V0SW52aXRlTWVtYmVyKCk7XG4gICAgICAgICAgICAgICAgbGV0IGludml0ZXJFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmIChpbnZpdGVNZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52aXRlckVsZW1lbnQgPSA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1Jvb21QcmV2aWV3QmFyX2ludml0ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGludml0ZU1lbWJlci5yYXdEaXNwbGF5TmFtZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+ICh7IGludml0ZU1lbWJlci51c2VySWQgfSlcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbnZpdGVyRWxlbWVudCA9ICg8c3BhbiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9pbnZpdGVyXCI+eyB0aGlzLnByb3BzLmludml0ZXJOYW1lIH08L3NwYW4+KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpc0RNID0gdGhpcy5pc0RNSW52aXRlKCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRE0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIkRvIHlvdSB3YW50IHRvIGNoYXQgd2l0aCAlKHVzZXIpcz9cIiwgeyB1c2VyOiBpbnZpdGVNZW1iZXIubmFtZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfdChcIjx1c2VyTmFtZS8+IHdhbnRzIHRvIGNoYXRcIiwge30sIHsgdXNlck5hbWU6ICgpID0+IGludml0ZXJFbGVtZW50IH0pLFxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIlN0YXJ0IGNoYXR0aW5nXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJEbyB5b3Ugd2FudCB0byBqb2luICUocm9vbU5hbWUpcz9cIiwgeyByb29tTmFtZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfdChcIjx1c2VyTmFtZS8+IGludml0ZWQgeW91XCIsIHt9LCB7IHVzZXJOYW1lOiAoKSA9PiBpbnZpdGVyRWxlbWVudCB9KSxcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJBY2NlcHRcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyRXZlbnRDb250ZW50ID0gdGhpcy5wcm9wcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIobXlVc2VySWQpLmV2ZW50cy5tZW1iZXIuZ2V0Q29udGVudCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1lbWJlckV2ZW50Q29udGVudC5yZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uRWxlbWVudCA9IDxJbnZpdGVSZWFzb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbj17bWVtYmVyRXZlbnRDb250ZW50LnJlYXNvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxSZWFzb249e21lbWJlckV2ZW50Q29udGVudFtNZW1iZXJFdmVudEh0bWxSZWFzb25GaWVsZF19XG4gICAgICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlBY3Rpb25MYWJlbCA9IF90KFwiUmVqZWN0XCIpO1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLnByb3BzLm9uUmVqZWN0Q2xpY2s7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlamVjdEFuZElnbm9yZUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhQ29tcG9uZW50cy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInNlY29uZGFyeVwiIG9uQ2xpY2s9e3RoaXMucHJvcHMub25SZWplY3RBbmRJZ25vcmVDbGlja30ga2V5PVwiaWdub3JlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlJlamVjdCAmIElnbm9yZSB1c2VyXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5WaWV3aW5nUm9vbToge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmNhblByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSdyZSBwcmV2aWV3aW5nICUocm9vbU5hbWUpcy4gV2FudCB0byBqb2luIGl0P1wiLCB7IHJvb21OYW1lIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocm9vbU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIiUocm9vbU5hbWUpcyBjYW4ndCBiZSBwcmV2aWV3ZWQuIERvIHlvdSB3YW50IHRvIGpvaW4gaXQ/XCIsIHsgcm9vbU5hbWUgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIlRoZXJlJ3Mgbm8gcHJldmlldywgd291bGQgeW91IGxpa2UgdG8gam9pbj9cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiSm9pbiB0aGUgZGlzY3Vzc2lvblwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLlJvb21Ob3RGb3VuZDoge1xuICAgICAgICAgICAgICAgIGlmIChyb29tTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiJShyb29tTmFtZSlzIGRvZXMgbm90IGV4aXN0LlwiLCB7IHJvb21OYW1lIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJUaGlzIHJvb20gb3Igc3BhY2UgZG9lcyBub3QgZXhpc3QuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IF90KFwiQXJlIHlvdSBzdXJlIHlvdSdyZSBhdCB0aGUgcmlnaHQgcGxhY2U/XCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5PdGhlckVycm9yOiB7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCIlKHJvb21OYW1lKXMgaXMgbm90IGFjY2Vzc2libGUgYXQgdGhpcyB0aW1lLlwiLCB7IHJvb21OYW1lIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJUaGlzIHJvb20gb3Igc3BhY2UgaXMgbm90IGFjY2Vzc2libGUgYXQgdGhpcyB0aW1lLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBbXG4gICAgICAgICAgICAgICAgICAgIF90KFwiVHJ5IGFnYWluIGxhdGVyLCBvciBhc2sgYSByb29tIG9yIHNwYWNlIGFkbWluIHRvIGNoZWNrIGlmIHlvdSBoYXZlIGFjY2Vzcy5cIiksXG4gICAgICAgICAgICAgICAgICAgIF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCIlKGVycmNvZGUpcyB3YXMgcmV0dXJuZWQgd2hpbGUgdHJ5aW5nIHRvIGFjY2VzcyB0aGUgcm9vbSBvciBzcGFjZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UgdGhpbmsgeW91J3JlIHNlZWluZyB0aGlzIG1lc3NhZ2UgaW4gZXJyb3IsIHBsZWFzZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjxpc3N1ZUxpbms+c3VibWl0IGEgYnVnIHJlcG9ydDwvaXNzdWVMaW5rPi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZXJyY29kZTogdGhpcy5wcm9wcy5lcnJvci5lcnJjb2RlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlzc3VlTGluazogbGFiZWwgPT4gPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvbmV3L2Nob29zZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+eyBsYWJlbCB9PC9hPiB9LFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3ViVGl0bGVFbGVtZW50cztcbiAgICAgICAgaWYgKHN1YlRpdGxlKSB7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoc3ViVGl0bGUpKSB7XG4gICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBbc3ViVGl0bGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ViVGl0bGVFbGVtZW50cyA9IHN1YlRpdGxlLm1hcCgodCwgaSkgPT4gPHAga2V5PXtgc3ViVGl0bGUke2l9YH0+eyB0IH08L3A+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0aXRsZUVsZW1lbnQ7XG4gICAgICAgIGlmIChzaG93U3Bpbm5lcikge1xuICAgICAgICAgICAgdGl0bGVFbGVtZW50ID0gPGgzIGNsYXNzTmFtZT1cIm14X1Jvb21QcmV2aWV3QmFyX3NwaW5uZXJUaXRsZVwiPjxTcGlubmVyIC8+eyB0aXRsZSB9PC9oMz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aXRsZUVsZW1lbnQgPSA8aDM+eyB0aXRsZSB9PC9oMz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJpbWFyeUJ1dHRvbjtcbiAgICAgICAgaWYgKHByaW1hcnlBY3Rpb25IYW5kbGVyKSB7XG4gICAgICAgICAgICBwcmltYXJ5QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17cHJpbWFyeUFjdGlvbkhhbmRsZXJ9PlxuICAgICAgICAgICAgICAgICAgICB7IHByaW1hcnlBY3Rpb25MYWJlbCB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzZWNvbmRhcnlCdXR0b247XG4gICAgICAgIGlmIChzZWNvbmRhcnlBY3Rpb25IYW5kbGVyKSB7XG4gICAgICAgICAgICBzZWNvbmRhcnlCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInNlY29uZGFyeVwiIG9uQ2xpY2s9e3NlY29uZGFyeUFjdGlvbkhhbmRsZXJ9PlxuICAgICAgICAgICAgICAgICAgICB7IHNlY29uZGFyeUFjdGlvbkxhYmVsIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQYW5lbCA9IHRoaXMucHJvcHMuY2FuUHJldmlldztcblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21QcmV2aWV3QmFyXCIsIFwiZGFyay1wYW5lbFwiLCBgbXhfUm9vbVByZXZpZXdCYXJfJHttZXNzYWdlQ2FzZX1gLCB7XG4gICAgICAgICAgICBcIm14X1Jvb21QcmV2aWV3QmFyX3BhbmVsXCI6IGlzUGFuZWwsXG4gICAgICAgICAgICBcIm14X1Jvb21QcmV2aWV3QmFyX2RpYWxvZ1wiOiAhaXNQYW5lbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZW5zdXJlIGNvcnJlY3QgdGFiIG9yZGVyIGZvciBib3RoIHZpZXdzXG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBpc1BhbmVsXG4gICAgICAgICAgICA/IDw+XG4gICAgICAgICAgICAgICAgeyBzZWNvbmRhcnlCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgZXh0cmFDb21wb25lbnRzIH1cbiAgICAgICAgICAgICAgICB7IHByaW1hcnlCdXR0b24gfVxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICA6IDw+XG4gICAgICAgICAgICAgICAgeyBwcmltYXJ5QnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IGV4dHJhQ29tcG9uZW50cyB9XG4gICAgICAgICAgICAgICAgeyBzZWNvbmRhcnlCdXR0b24gfVxuICAgICAgICAgICAgPC8+O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9tZXNzYWdlXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGl0bGVFbGVtZW50IH1cbiAgICAgICAgICAgICAgICAgICAgeyBzdWJUaXRsZUVsZW1lbnRzIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHJlYXNvbkVsZW1lbnQgfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdCYXJfYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgICAgICB7IGFjdGlvbnMgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdCYXJfZm9vdGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgZm9vdGVyIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7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