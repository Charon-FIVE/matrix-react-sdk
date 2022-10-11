"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IgnoredUser = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _utils = require("matrix-js-sdk/src/utils");

var _room = require("matrix-js-sdk/src/models/room");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _SecureBackupPanel = _interopRequireDefault(require("../../SecureBackupPanel"));

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _UIFeature = require("../../../../../settings/UIFeature");

var _E2eAdvancedPanel = _interopRequireWildcard(require("../../E2eAdvancedPanel"));

var _CryptographyPanel = _interopRequireDefault(require("../../CryptographyPanel"));

var _DevicesPanel = _interopRequireDefault(require("../../DevicesPanel"));

var _SettingsFlag = _interopRequireDefault(require("../../../elements/SettingsFlag"));

var _CrossSigningPanel = _interopRequireDefault(require("../../CrossSigningPanel"));

var _EventIndexPanel = _interopRequireDefault(require("../../EventIndexPanel"));

var _InlineSpinner = _interopRequireDefault(require("../../../elements/InlineSpinner"));

var _PosthogAnalytics = require("../../../../../PosthogAnalytics");

var _AnalyticsLearnMoreDialog = require("../../../dialogs/AnalyticsLearnMoreDialog");

var _rooms = require("../../../../../utils/rooms");

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
class IgnoredUser extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onUnignoreClicked", () => {
      this.props.onUnignored(this.props.userId);
    });
  }

  render() {
    const id = `mx_SecurityUserSettingsTab_ignoredUser_${this.props.userId}`;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SecurityUserSettingsTab_ignoredUser"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onUnignoreClicked,
      kind: "primary_sm",
      "aria-describedby": id,
      disabled: this.props.inProgress
    }, (0, _languageHandler._t)('Unignore')), /*#__PURE__*/_react.default.createElement("span", {
      id: id
    }, this.props.userId));
  }

}

exports.IgnoredUser = IgnoredUser;

class SecurityUserSettingsTab extends _react.default.Component {
  constructor(props) {
    super(props); // Get rooms we're invited to

    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", _ref => {
      let {
        action
      } = _ref;

      if (action === "ignore_state_changed") {
        const ignoredUserIds = _MatrixClientPeg.MatrixClientPeg.get().getIgnoredUsers();

        const newWaitingUnignored = this.state.waitingUnignored.filter(e => ignoredUserIds.includes(e));
        this.setState({
          ignoredUserIds,
          waitingUnignored: newWaitingUnignored
        });
      }
    });
    (0, _defineProperty2.default)(this, "onMyMembership", (room, membership) => {
      if (room.isSpaceRoom()) {
        return;
      }

      if (membership === "invite") {
        this.addInvitedRoom(room);
      } else if (this.state.invitedRoomIds.has(room.roomId)) {
        // The user isn't invited anymore
        this.removeInvitedRoom(room.roomId);
      }
    });
    (0, _defineProperty2.default)(this, "addInvitedRoom", room => {
      this.setState(_ref2 => {
        let {
          invitedRoomIds
        } = _ref2;
        return {
          invitedRoomIds: new Set(invitedRoomIds).add(room.roomId)
        };
      });
    });
    (0, _defineProperty2.default)(this, "removeInvitedRoom", roomId => {
      this.setState(_ref3 => {
        let {
          invitedRoomIds
        } = _ref3;
        const newInvitedRoomIds = new Set(invitedRoomIds);
        newInvitedRoomIds.delete(roomId);
        return {
          invitedRoomIds: newInvitedRoomIds
        };
      });
    });
    (0, _defineProperty2.default)(this, "onUserUnignored", async userId => {
      const {
        ignoredUserIds,
        waitingUnignored
      } = this.state;
      const currentlyIgnoredUserIds = ignoredUserIds.filter(e => !waitingUnignored.includes(e));
      const index = currentlyIgnoredUserIds.indexOf(userId);

      if (index !== -1) {
        currentlyIgnoredUserIds.splice(index, 1);
        this.setState(_ref4 => {
          let {
            waitingUnignored
          } = _ref4;
          return {
            waitingUnignored: [...waitingUnignored, userId]
          };
        });

        _MatrixClientPeg.MatrixClientPeg.get().setIgnoredUsers(currentlyIgnoredUserIds);
      }
    });
    (0, _defineProperty2.default)(this, "getInvitedRooms", () => {
      return _MatrixClientPeg.MatrixClientPeg.get().getRooms().filter(r => {
        return r.hasMembershipState(_MatrixClientPeg.MatrixClientPeg.get().getUserId(), "invite");
      });
    });
    (0, _defineProperty2.default)(this, "manageInvites", async accept => {
      this.setState({
        managingInvites: true
      }); // iterate with a normal for loop in order to retry on action failure

      const invitedRoomIdsValues = Array.from(this.state.invitedRoomIds); // Execute all acceptances/rejections sequentially

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const action = accept ? cli.joinRoom.bind(cli) : cli.leave.bind(cli);

      for (let i = 0; i < invitedRoomIdsValues.length; i++) {
        const roomId = invitedRoomIdsValues[i]; // Accept/reject invite

        await action(roomId).then(() => {
          // No error, update invited rooms button
          this.removeInvitedRoom(roomId);
        }, async e => {
          // Action failure
          if (e.errcode === "M_LIMIT_EXCEEDED") {
            // Add a delay between each invite change in order to avoid rate
            // limiting by the server.
            await (0, _utils.sleep)(e.retry_after_ms || 2500); // Redo last action

            i--;
          } else {
            // Print out error with joining/leaving room
            _logger.logger.warn(e);
          }
        });
      }

      this.setState({
        managingInvites: false
      });
    });
    (0, _defineProperty2.default)(this, "onAcceptAllInvitesClicked", () => {
      this.manageInvites(true);
    });
    (0, _defineProperty2.default)(this, "onRejectAllInvitesClicked", () => {
      this.manageInvites(false);
    });

    const _invitedRoomIds = new Set(this.getInvitedRooms().map(room => room.roomId));

    this.state = {
      ignoredUserIds: _MatrixClientPeg.MatrixClientPeg.get().getIgnoredUsers(),
      waitingUnignored: [],
      managingInvites: false,
      invitedRoomIds: _invitedRoomIds
    };
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _MatrixClientPeg.MatrixClientPeg.get().on(_room.RoomEvent.MyMembership, this.onMyMembership);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    _MatrixClientPeg.MatrixClientPeg.get().removeListener(_room.RoomEvent.MyMembership, this.onMyMembership);
  }

  renderIgnoredUsers() {
    const {
      waitingUnignored,
      ignoredUserIds
    } = this.state;
    const userIds = !ignoredUserIds?.length ? (0, _languageHandler._t)('You have no ignored users.') : ignoredUserIds.map(u => {
      return /*#__PURE__*/_react.default.createElement(IgnoredUser, {
        userId: u,
        onUnignored: this.onUserUnignored,
        key: u,
        inProgress: waitingUnignored.includes(u)
      });
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)('Ignored users')), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, userIds));
  }

  renderManageInvites() {
    const {
      invitedRoomIds
    } = this.state;

    if (invitedRoomIds.size === 0) {
      return null;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SecurityUserSettingsTab_bulkOptions"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)('Bulk options')), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onAcceptAllInvitesClicked,
      kind: "primary",
      disabled: this.state.managingInvites
    }, (0, _languageHandler._t)("Accept all %(invitedRooms)s invites", {
      invitedRooms: invitedRoomIds.size
    })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onRejectAllInvitesClicked,
      kind: "danger",
      disabled: this.state.managingInvites
    }, (0, _languageHandler._t)("Reject all %(invitedRooms)s invites", {
      invitedRooms: invitedRoomIds.size
    })), this.state.managingInvites ? /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null) : /*#__PURE__*/_react.default.createElement("div", null));
  }

  render() {
    const secureBackup = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Secure Backup")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement(_SecureBackupPanel.default, null)));

    const eventIndex = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Message search")), /*#__PURE__*/_react.default.createElement(_EventIndexPanel.default, null)); // XXX: There's no such panel in the current cross-signing designs, but
    // it's useful to have for testing the feature. If there's no interest
    // in having advanced details here once all flows are implemented, we
    // can remove this.


    const crossSigning = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Cross-signing")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement(_CrossSigningPanel.default, null)));

    let warning;

    if (!(0, _rooms.privateShouldBeEncrypted)()) {
      warning = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SecurityUserSettingsTab_warning"
      }, (0, _languageHandler._t)("Your server admin has disabled end-to-end encryption by default " + "in private rooms & Direct Messages."));
    }

    let privacySection;

    if (_PosthogAnalytics.PosthogAnalytics.instance.isEnabled()) {
      const onClickAnalyticsLearnMore = () => {
        (0, _AnalyticsLearnMoreDialog.showDialog)({
          primaryButton: (0, _languageHandler._t)("Okay"),
          hasCancel: false
        });
      };

      privacySection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_heading"
      }, (0, _languageHandler._t)("Privacy")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, _languageHandler._t)("Analytics")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Share anonymous data to help us identify issues. Nothing personal. " + "No third parties.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: onClickAnalyticsLearnMore
      }, (0, _languageHandler._t)("Learn more"))), _PosthogAnalytics.PosthogAnalytics.instance.isEnabled() && /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        name: "pseudonymousAnalyticsOptIn",
        level: _SettingLevel.SettingLevel.ACCOUNT
      })));
    }

    let advancedSection;

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.AdvancedSettings)) {
      const ignoreUsersPanel = this.renderIgnoredUsers();
      const invitesPanel = this.renderManageInvites();
      const e2ePanel = (0, _E2eAdvancedPanel.isE2eAdvancedPanelPossible)() ? /*#__PURE__*/_react.default.createElement(_E2eAdvancedPanel.default, null) : null; // only show the section if there's something to show

      if (ignoreUsersPanel || invitesPanel || e2ePanel) {
        advancedSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_heading"
        }, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SettingsTab_section"
        }, ignoreUsersPanel, invitesPanel, e2ePanel));
      }
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_SecurityUserSettingsTab"
    }, warning, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Where you're signed in")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)("Manage your signed-in devices below. " + "A device's name is visible to people you communicate with.")), /*#__PURE__*/_react.default.createElement(_DevicesPanel.default, null)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Encryption")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, secureBackup, eventIndex, crossSigning, /*#__PURE__*/_react.default.createElement(_CryptographyPanel.default, null)), privacySection, advancedSection);
  }

}

exports.default = SecurityUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJZ25vcmVkVXNlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwicHJvcHMiLCJvblVuaWdub3JlZCIsInVzZXJJZCIsInJlbmRlciIsImlkIiwib25Vbmlnbm9yZUNsaWNrZWQiLCJpblByb2dyZXNzIiwiX3QiLCJTZWN1cml0eVVzZXJTZXR0aW5nc1RhYiIsImNvbnN0cnVjdG9yIiwiYWN0aW9uIiwiaWdub3JlZFVzZXJJZHMiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRJZ25vcmVkVXNlcnMiLCJuZXdXYWl0aW5nVW5pZ25vcmVkIiwic3RhdGUiLCJ3YWl0aW5nVW5pZ25vcmVkIiwiZmlsdGVyIiwiZSIsImluY2x1ZGVzIiwic2V0U3RhdGUiLCJyb29tIiwibWVtYmVyc2hpcCIsImlzU3BhY2VSb29tIiwiYWRkSW52aXRlZFJvb20iLCJpbnZpdGVkUm9vbUlkcyIsImhhcyIsInJvb21JZCIsInJlbW92ZUludml0ZWRSb29tIiwiU2V0IiwiYWRkIiwibmV3SW52aXRlZFJvb21JZHMiLCJkZWxldGUiLCJjdXJyZW50bHlJZ25vcmVkVXNlcklkcyIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInNldElnbm9yZWRVc2VycyIsImdldFJvb21zIiwiciIsImhhc01lbWJlcnNoaXBTdGF0ZSIsImdldFVzZXJJZCIsImFjY2VwdCIsIm1hbmFnaW5nSW52aXRlcyIsImludml0ZWRSb29tSWRzVmFsdWVzIiwiQXJyYXkiLCJmcm9tIiwiY2xpIiwiam9pblJvb20iLCJiaW5kIiwibGVhdmUiLCJpIiwibGVuZ3RoIiwidGhlbiIsImVycmNvZGUiLCJzbGVlcCIsInJldHJ5X2FmdGVyX21zIiwibG9nZ2VyIiwid2FybiIsIm1hbmFnZUludml0ZXMiLCJnZXRJbnZpdGVkUm9vbXMiLCJtYXAiLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJkaXMiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwib24iLCJSb29tRXZlbnQiLCJNeU1lbWJlcnNoaXAiLCJvbk15TWVtYmVyc2hpcCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsInJlbW92ZUxpc3RlbmVyIiwicmVuZGVySWdub3JlZFVzZXJzIiwidXNlcklkcyIsInUiLCJvblVzZXJVbmlnbm9yZWQiLCJyZW5kZXJNYW5hZ2VJbnZpdGVzIiwic2l6ZSIsIm9uQWNjZXB0QWxsSW52aXRlc0NsaWNrZWQiLCJpbnZpdGVkUm9vbXMiLCJvblJlamVjdEFsbEludml0ZXNDbGlja2VkIiwic2VjdXJlQmFja3VwIiwiZXZlbnRJbmRleCIsImNyb3NzU2lnbmluZyIsIndhcm5pbmciLCJwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQiLCJwcml2YWN5U2VjdGlvbiIsIlBvc3Rob2dBbmFseXRpY3MiLCJpbnN0YW5jZSIsImlzRW5hYmxlZCIsIm9uQ2xpY2tBbmFseXRpY3NMZWFybk1vcmUiLCJzaG93QW5hbHl0aWNzTGVhcm5Nb3JlRGlhbG9nIiwicHJpbWFyeUJ1dHRvbiIsImhhc0NhbmNlbCIsIlNldHRpbmdMZXZlbCIsIkFDQ09VTlQiLCJhZHZhbmNlZFNlY3Rpb24iLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJBZHZhbmNlZFNldHRpbmdzIiwiaWdub3JlVXNlcnNQYW5lbCIsImludml0ZXNQYW5lbCIsImUyZVBhbmVsIiwiaXNFMmVBZHZhbmNlZFBhbmVsUG9zc2libGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy90YWJzL3VzZXIvU2VjdXJpdHlVc2VyU2V0dGluZ3NUYWIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgc2xlZXAgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvdXRpbHNcIjtcbmltcG9ydCB7IFJvb20sIFJvb21FdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBTZWN1cmVCYWNrdXBQYW5lbCBmcm9tIFwiLi4vLi4vU2VjdXJlQmFja3VwUGFuZWxcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBVSUZlYXR1cmUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgRTJlQWR2YW5jZWRQYW5lbCwgeyBpc0UyZUFkdmFuY2VkUGFuZWxQb3NzaWJsZSB9IGZyb20gXCIuLi8uLi9FMmVBZHZhbmNlZFBhbmVsXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCBDcnlwdG9ncmFwaHlQYW5lbCBmcm9tIFwiLi4vLi4vQ3J5cHRvZ3JhcGh5UGFuZWxcIjtcbmltcG9ydCBEZXZpY2VzUGFuZWwgZnJvbSBcIi4uLy4uL0RldmljZXNQYW5lbFwiO1xuaW1wb3J0IFNldHRpbmdzRmxhZyBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvU2V0dGluZ3NGbGFnXCI7XG5pbXBvcnQgQ3Jvc3NTaWduaW5nUGFuZWwgZnJvbSBcIi4uLy4uL0Nyb3NzU2lnbmluZ1BhbmVsXCI7XG5pbXBvcnQgRXZlbnRJbmRleFBhbmVsIGZyb20gXCIuLi8uLi9FdmVudEluZGV4UGFuZWxcIjtcbmltcG9ydCBJbmxpbmVTcGlubmVyIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9JbmxpbmVTcGlubmVyXCI7XG5pbXBvcnQgeyBQb3N0aG9nQW5hbHl0aWNzIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1Bvc3Rob2dBbmFseXRpY3NcIjtcbmltcG9ydCB7IHNob3dEaWFsb2cgYXMgc2hvd0FuYWx5dGljc0xlYXJuTW9yZURpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi9kaWFsb2dzL0FuYWx5dGljc0xlYXJuTW9yZURpYWxvZ1wiO1xuaW1wb3J0IHsgcHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3V0aWxzL3Jvb21zXCI7XG5cbmludGVyZmFjZSBJSWdub3JlZFVzZXJQcm9wcyB7XG4gICAgdXNlcklkOiBzdHJpbmc7XG4gICAgb25Vbmlnbm9yZWQ6ICh1c2VySWQ6IHN0cmluZykgPT4gdm9pZDtcbiAgICBpblByb2dyZXNzOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgSWdub3JlZFVzZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SUlnbm9yZWRVc2VyUHJvcHM+IHtcbiAgICBwcml2YXRlIG9uVW5pZ25vcmVDbGlja2VkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uVW5pZ25vcmVkKHRoaXMucHJvcHMudXNlcklkKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGlkID0gYG14X1NlY3VyaXR5VXNlclNldHRpbmdzVGFiX2lnbm9yZWRVc2VyXyR7dGhpcy5wcm9wcy51c2VySWR9YDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZWN1cml0eVVzZXJTZXR0aW5nc1RhYl9pZ25vcmVkVXNlcic+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vblVuaWdub3JlQ2xpY2tlZH0ga2luZD0ncHJpbWFyeV9zbScgYXJpYS1kZXNjcmliZWRieT17aWR9IGRpc2FibGVkPXt0aGlzLnByb3BzLmluUHJvZ3Jlc3N9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdVbmlnbm9yZScpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPHNwYW4gaWQ9e2lkfT57IHRoaXMucHJvcHMudXNlcklkIH08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGNsb3NlU2V0dGluZ3NGbjogKCkgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgaWdub3JlZFVzZXJJZHM6IHN0cmluZ1tdO1xuICAgIHdhaXRpbmdVbmlnbm9yZWQ6IHN0cmluZ1tdO1xuICAgIG1hbmFnaW5nSW52aXRlczogYm9vbGVhbjtcbiAgICBpbnZpdGVkUm9vbUlkczogU2V0PHN0cmluZz47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlY3VyaXR5VXNlclNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICAvLyBHZXQgcm9vbXMgd2UncmUgaW52aXRlZCB0b1xuICAgICAgICBjb25zdCBpbnZpdGVkUm9vbUlkcyA9IG5ldyBTZXQodGhpcy5nZXRJbnZpdGVkUm9vbXMoKS5tYXAocm9vbSA9PiByb29tLnJvb21JZCkpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpZ25vcmVkVXNlcklkczogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElnbm9yZWRVc2VycygpLFxuICAgICAgICAgICAgd2FpdGluZ1VuaWdub3JlZDogW10sXG4gICAgICAgICAgICBtYW5hZ2luZ0ludml0ZXM6IGZhbHNlLFxuICAgICAgICAgICAgaW52aXRlZFJvb21JZHMsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9ICh7IGFjdGlvbiB9OiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChhY3Rpb24gPT09IFwiaWdub3JlX3N0YXRlX2NoYW5nZWRcIikge1xuICAgICAgICAgICAgY29uc3QgaWdub3JlZFVzZXJJZHMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICBjb25zdCBuZXdXYWl0aW5nVW5pZ25vcmVkID0gdGhpcy5zdGF0ZS53YWl0aW5nVW5pZ25vcmVkLmZpbHRlcihlID0+IGlnbm9yZWRVc2VySWRzLmluY2x1ZGVzKGUpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpZ25vcmVkVXNlcklkcywgd2FpdGluZ1VuaWdub3JlZDogbmV3V2FpdGluZ1VuaWdub3JlZCB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25NeU1lbWJlcnNoaXAgPSAocm9vbTogUm9vbSwgbWVtYmVyc2hpcDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChyb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZW1iZXJzaGlwID09PSBcImludml0ZVwiKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEludml0ZWRSb29tKHJvb20pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaW52aXRlZFJvb21JZHMuaGFzKHJvb20ucm9vbUlkKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXNuJ3QgaW52aXRlZCBhbnltb3JlXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUludml0ZWRSb29tKHJvb20ucm9vbUlkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFkZEludml0ZWRSb29tID0gKHJvb206IFJvb20pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgoeyBpbnZpdGVkUm9vbUlkcyB9KSA9PiAoe1xuICAgICAgICAgICAgaW52aXRlZFJvb21JZHM6IG5ldyBTZXQoaW52aXRlZFJvb21JZHMpLmFkZChyb29tLnJvb21JZCksXG4gICAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW1vdmVJbnZpdGVkUm9vbSA9IChyb29tSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKCh7IGludml0ZWRSb29tSWRzIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0ludml0ZWRSb29tSWRzID0gbmV3IFNldChpbnZpdGVkUm9vbUlkcyk7XG4gICAgICAgICAgICBuZXdJbnZpdGVkUm9vbUlkcy5kZWxldGUocm9vbUlkKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbnZpdGVkUm9vbUlkczogbmV3SW52aXRlZFJvb21JZHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZXJVbmlnbm9yZWQgPSBhc3luYyAodXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgY29uc3QgeyBpZ25vcmVkVXNlcklkcywgd2FpdGluZ1VuaWdub3JlZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgY29uc3QgY3VycmVudGx5SWdub3JlZFVzZXJJZHMgPSBpZ25vcmVkVXNlcklkcy5maWx0ZXIoZSA9PiAhd2FpdGluZ1VuaWdub3JlZC5pbmNsdWRlcyhlKSk7XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSBjdXJyZW50bHlJZ25vcmVkVXNlcklkcy5pbmRleE9mKHVzZXJJZCk7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGN1cnJlbnRseUlnbm9yZWRVc2VySWRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKCh7IHdhaXRpbmdVbmlnbm9yZWQgfSkgPT4gKHsgd2FpdGluZ1VuaWdub3JlZDogWy4uLndhaXRpbmdVbmlnbm9yZWQsIHVzZXJJZF0gfSkpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldElnbm9yZWRVc2VycyhjdXJyZW50bHlJZ25vcmVkVXNlcklkcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRJbnZpdGVkUm9vbXMgPSAoKTogUm9vbVtdID0+IHtcbiAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tcygpLmZpbHRlcigocikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHIuaGFzTWVtYmVyc2hpcFN0YXRlKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSwgXCJpbnZpdGVcIik7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG1hbmFnZUludml0ZXMgPSBhc3luYyAoYWNjZXB0OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbWFuYWdpbmdJbnZpdGVzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBpdGVyYXRlIHdpdGggYSBub3JtYWwgZm9yIGxvb3AgaW4gb3JkZXIgdG8gcmV0cnkgb24gYWN0aW9uIGZhaWx1cmVcbiAgICAgICAgY29uc3QgaW52aXRlZFJvb21JZHNWYWx1ZXMgPSBBcnJheS5mcm9tKHRoaXMuc3RhdGUuaW52aXRlZFJvb21JZHMpO1xuXG4gICAgICAgIC8vIEV4ZWN1dGUgYWxsIGFjY2VwdGFuY2VzL3JlamVjdGlvbnMgc2VxdWVudGlhbGx5XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gYWNjZXB0ID8gY2xpLmpvaW5Sb29tLmJpbmQoY2xpKSA6IGNsaS5sZWF2ZS5iaW5kKGNsaSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW52aXRlZFJvb21JZHNWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGludml0ZWRSb29tSWRzVmFsdWVzW2ldO1xuXG4gICAgICAgICAgICAvLyBBY2NlcHQvcmVqZWN0IGludml0ZVxuICAgICAgICAgICAgYXdhaXQgYWN0aW9uKHJvb21JZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gTm8gZXJyb3IsIHVwZGF0ZSBpbnZpdGVkIHJvb21zIGJ1dHRvblxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlSW52aXRlZFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIH0sIGFzeW5jIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQWN0aW9uIGZhaWx1cmVcbiAgICAgICAgICAgICAgICBpZiAoZS5lcnJjb2RlID09PSBcIk1fTElNSVRfRVhDRUVERURcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYSBkZWxheSBiZXR3ZWVuIGVhY2ggaW52aXRlIGNoYW5nZSBpbiBvcmRlciB0byBhdm9pZCByYXRlXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpbWl0aW5nIGJ5IHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKGUucmV0cnlfYWZ0ZXJfbXMgfHwgMjUwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVkbyBsYXN0IGFjdGlvblxuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJpbnQgb3V0IGVycm9yIHdpdGggam9pbmluZy9sZWF2aW5nIHJvb21cbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG1hbmFnaW5nSW52aXRlczogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWNjZXB0QWxsSW52aXRlc0NsaWNrZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMubWFuYWdlSW52aXRlcyh0cnVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlamVjdEFsbEludml0ZXNDbGlja2VkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLm1hbmFnZUludml0ZXMoZmFsc2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlcklnbm9yZWRVc2VycygpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHsgd2FpdGluZ1VuaWdub3JlZCwgaWdub3JlZFVzZXJJZHMgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgY29uc3QgdXNlcklkcyA9ICFpZ25vcmVkVXNlcklkcz8ubGVuZ3RoXG4gICAgICAgICAgICA/IF90KCdZb3UgaGF2ZSBubyBpZ25vcmVkIHVzZXJzLicpXG4gICAgICAgICAgICA6IGlnbm9yZWRVc2VySWRzLm1hcCgodSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxJZ25vcmVkVXNlclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkPXt1fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Vbmlnbm9yZWQ9e3RoaXMub25Vc2VyVW5pZ25vcmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt1fVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5Qcm9ncmVzcz17d2FpdGluZ1VuaWdub3JlZC5pbmNsdWRlcyh1KX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPnsgX3QoJ0lnbm9yZWQgdXNlcnMnKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIHsgdXNlcklkcyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlck1hbmFnZUludml0ZXMoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCB7IGludml0ZWRSb29tSWRzIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGlmIChpbnZpdGVkUm9vbUlkcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZWN1cml0eVVzZXJTZXR0aW5nc1RhYl9idWxrT3B0aW9ucyc+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57IF90KCdCdWxrIG9wdGlvbnMnKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25BY2NlcHRBbGxJbnZpdGVzQ2xpY2tlZH0ga2luZD0ncHJpbWFyeScgZGlzYWJsZWQ9e3RoaXMuc3RhdGUubWFuYWdpbmdJbnZpdGVzfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkFjY2VwdCBhbGwgJShpbnZpdGVkUm9vbXMpcyBpbnZpdGVzXCIsIHsgaW52aXRlZFJvb21zOiBpbnZpdGVkUm9vbUlkcy5zaXplIH0pIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vblJlamVjdEFsbEludml0ZXNDbGlja2VkfSBraW5kPSdkYW5nZXInIGRpc2FibGVkPXt0aGlzLnN0YXRlLm1hbmFnaW5nSW52aXRlc30+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJSZWplY3QgYWxsICUoaW52aXRlZFJvb21zKXMgaW52aXRlc1wiLCB7IGludml0ZWRSb29tczogaW52aXRlZFJvb21JZHMuc2l6ZSB9KSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5tYW5hZ2luZ0ludml0ZXMgPyA8SW5saW5lU3Bpbm5lciAvPiA6IDxkaXYgLz4gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHNlY3VyZUJhY2t1cCA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+eyBfdChcIlNlY3VyZSBCYWNrdXBcIikgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICA8U2VjdXJlQmFja3VwUGFuZWwgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SW5kZXggPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+eyBfdChcIk1lc3NhZ2Ugc2VhcmNoXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPEV2ZW50SW5kZXhQYW5lbCAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gWFhYOiBUaGVyZSdzIG5vIHN1Y2ggcGFuZWwgaW4gdGhlIGN1cnJlbnQgY3Jvc3Mtc2lnbmluZyBkZXNpZ25zLCBidXRcbiAgICAgICAgLy8gaXQncyB1c2VmdWwgdG8gaGF2ZSBmb3IgdGVzdGluZyB0aGUgZmVhdHVyZS4gSWYgdGhlcmUncyBubyBpbnRlcmVzdFxuICAgICAgICAvLyBpbiBoYXZpbmcgYWR2YW5jZWQgZGV0YWlscyBoZXJlIG9uY2UgYWxsIGZsb3dzIGFyZSBpbXBsZW1lbnRlZCwgd2VcbiAgICAgICAgLy8gY2FuIHJlbW92ZSB0aGlzLlxuICAgICAgICBjb25zdCBjcm9zc1NpZ25pbmcgPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbic+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPnsgX3QoXCJDcm9zcy1zaWduaW5nXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgPENyb3NzU2lnbmluZ1BhbmVsIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgd2FybmluZztcbiAgICAgICAgaWYgKCFwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQoKSkge1xuICAgICAgICAgICAgd2FybmluZyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfU2VjdXJpdHlVc2VyU2V0dGluZ3NUYWJfd2FybmluZ1wiPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJZb3VyIHNlcnZlciBhZG1pbiBoYXMgZGlzYWJsZWQgZW5kLXRvLWVuZCBlbmNyeXB0aW9uIGJ5IGRlZmF1bHQgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImluIHByaXZhdGUgcm9vbXMgJiBEaXJlY3QgTWVzc2FnZXMuXCIpIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcml2YWN5U2VjdGlvbjtcbiAgICAgICAgaWYgKFBvc3Rob2dBbmFseXRpY3MuaW5zdGFuY2UuaXNFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG9uQ2xpY2tBbmFseXRpY3NMZWFybk1vcmUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2hvd0FuYWx5dGljc0xlYXJuTW9yZURpYWxvZyh7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b246IF90KFwiT2theVwiKSxcbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcml2YWN5U2VjdGlvbiA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiUHJpdmFjeVwiKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57IF90KFwiQW5hbHl0aWNzXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTaGFyZSBhbm9ueW1vdXMgZGF0YSB0byBoZWxwIHVzIGlkZW50aWZ5IGlzc3Vlcy4gTm90aGluZyBwZXJzb25hbC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk5vIHRoaXJkIHBhcnRpZXMuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2tBbmFseXRpY3NMZWFybk1vcmV9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkxlYXJuIG1vcmVcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBQb3N0aG9nQW5hbHl0aWNzLmluc3RhbmNlLmlzRW5hYmxlZCgpICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZsYWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwicHNldWRvbnltb3VzQW5hbHl0aWNzT3B0SW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuQUNDT1VOVH0gLz5cbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhZHZhbmNlZFNlY3Rpb247XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5BZHZhbmNlZFNldHRpbmdzKSkge1xuICAgICAgICAgICAgY29uc3QgaWdub3JlVXNlcnNQYW5lbCA9IHRoaXMucmVuZGVySWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICBjb25zdCBpbnZpdGVzUGFuZWwgPSB0aGlzLnJlbmRlck1hbmFnZUludml0ZXMoKTtcbiAgICAgICAgICAgIGNvbnN0IGUyZVBhbmVsID0gaXNFMmVBZHZhbmNlZFBhbmVsUG9zc2libGUoKSA/IDxFMmVBZHZhbmNlZFBhbmVsIC8+IDogbnVsbDtcbiAgICAgICAgICAgIC8vIG9ubHkgc2hvdyB0aGUgc2VjdGlvbiBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byBzaG93XG4gICAgICAgICAgICBpZiAoaWdub3JlVXNlcnNQYW5lbCB8fCBpbnZpdGVzUGFuZWwgfHwgZTJlUGFuZWwpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlZFNlY3Rpb24gPSA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiQWR2YW5jZWRcIikgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaWdub3JlVXNlcnNQYW5lbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGludml0ZXNQYW5lbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGUyZVBhbmVsIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWIgbXhfU2VjdXJpdHlVc2VyU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICB7IHdhcm5pbmcgfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPnsgX3QoXCJXaGVyZSB5b3UncmUgc2lnbmVkIGluXCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJNYW5hZ2UgeW91ciBzaWduZWQtaW4gZGV2aWNlcyBiZWxvdy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQSBkZXZpY2UncyBuYW1lIGlzIHZpc2libGUgdG8gcGVvcGxlIHlvdSBjb21tdW5pY2F0ZSB3aXRoLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPERldmljZXNQYW5lbCAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPnsgX3QoXCJFbmNyeXB0aW9uXCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgeyBzZWN1cmVCYWNrdXAgfVxuICAgICAgICAgICAgICAgICAgICB7IGV2ZW50SW5kZXggfVxuICAgICAgICAgICAgICAgICAgICB7IGNyb3NzU2lnbmluZyB9XG4gICAgICAgICAgICAgICAgICAgIDxDcnlwdG9ncmFwaHlQYW5lbCAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgcHJpdmFjeVNlY3Rpb24gfVxuICAgICAgICAgICAgICAgIHsgYWR2YW5jZWRTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQ08sTUFBTUEsV0FBTixTQUEwQkMsY0FBQSxDQUFNQyxTQUFoQyxDQUE2RDtFQUFBO0lBQUE7SUFBQSx5REFDcEMsTUFBWTtNQUNwQyxLQUFLQyxLQUFMLENBQVdDLFdBQVgsQ0FBdUIsS0FBS0QsS0FBTCxDQUFXRSxNQUFsQztJQUNILENBSCtEO0VBQUE7O0VBS3pEQyxNQUFNLEdBQWdCO0lBQ3pCLE1BQU1DLEVBQUUsR0FBSSwwQ0FBeUMsS0FBS0osS0FBTCxDQUFXRSxNQUFPLEVBQXZFO0lBQ0Esb0JBQ0k7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSSw2QkFBQyx5QkFBRDtNQUFrQixPQUFPLEVBQUUsS0FBS0csaUJBQWhDO01BQW1ELElBQUksRUFB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