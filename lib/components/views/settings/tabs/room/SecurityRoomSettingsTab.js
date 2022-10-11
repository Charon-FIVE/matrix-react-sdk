"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _partials = require("matrix-js-sdk/src/@types/partials");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _event = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _warning = require("../../../../../../res/img/warning.svg");

var _languageHandler = require("../../../../../languageHandler");

var _LabelledToggleSwitch = _interopRequireDefault(require("../../../elements/LabelledToggleSwitch"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _QuestionDialog = _interopRequireDefault(require("../../../dialogs/QuestionDialog"));

var _StyledRadioGroup = _interopRequireDefault(require("../../../elements/StyledRadioGroup"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _UIFeature = require("../../../../../settings/UIFeature");

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _SettingsFlag = _interopRequireDefault(require("../../../elements/SettingsFlag"));

var _createRoom = _interopRequireDefault(require("../../../../../createRoom"));

var _CreateRoomDialog = _interopRequireDefault(require("../../../dialogs/CreateRoomDialog"));

var _JoinRuleSettings = _interopRequireDefault(require("../../JoinRuleSettings"));

var _ErrorDialog = _interopRequireDefault(require("../../../dialogs/ErrorDialog"));

var _SettingsFieldset = _interopRequireDefault(require("../../SettingsFieldset"));

var _ExternalLink = _interopRequireDefault(require("../../../elements/ExternalLink"));

var _PosthogTrackers = _interopRequireDefault(require("../../../../../PosthogTrackers"));

var _MatrixClientContext = _interopRequireDefault(require("../../../../../contexts/MatrixClientContext"));

/*
Copyright 2019-2022 The Matrix.org Foundation C.I.C.

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
class SecurityRoomSettingsTab extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onStateEvent", e => {
      const refreshWhenTypes = [_event.EventType.RoomJoinRules, _event.EventType.RoomGuestAccess, _event.EventType.RoomHistoryVisibility, _event.EventType.RoomEncryption];
      if (refreshWhenTypes.includes(e.getType())) this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onEncryptionChange", async () => {
      if (this.context.getRoom(this.props.roomId)?.getJoinRule() === _partials.JoinRule.Public) {
        const dialog = _Modal.default.createDialog(_QuestionDialog.default, {
          title: (0, _languageHandler._t)('Are you sure you want to add encryption to this public room?'),
          description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, " ", (0, _languageHandler._t)("<b>It's not recommended to add encryption to public rooms.</b> " + "Anyone can find and join public rooms, so anyone can read messages in them. " + "You'll get none of the benefits of encryption, and you won't be able to turn it " + "off later. Encrypting messages in a public room will make receiving and sending " + "messages slower.", null, {
            "b": sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
          }), " "), /*#__PURE__*/_react.default.createElement("p", null, " ", (0, _languageHandler._t)("To avoid these issues, create a <a>new encrypted room</a> for " + "the conversation you plan to have.", null, {
            "a": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
              kind: "link_inline",
              onClick: () => {
                dialog.close();
                this.createNewRoom(false, true);
              }
            }, " ", sub, " ")
          }), " "))
        });

        const {
          finished
        } = dialog;
        const [confirm] = await finished;
        if (!confirm) return;
      }

      _Modal.default.createDialog(_QuestionDialog.default, {
        title: (0, _languageHandler._t)('Enable encryption?'),
        description: (0, _languageHandler._t)("Once enabled, encryption for a room cannot be disabled. Messages sent in an encrypted " + "room cannot be seen by the server, only by the participants of the room. Enabling encryption " + "may prevent many bots and bridges from working correctly. <a>Learn more about encryption.</a>", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_ExternalLink.default, {
            href: "https://element.io/help#encryption"
          }, sub)
        }),
        onFinished: confirm => {
          if (!confirm) {
            this.setState({
              encrypted: false
            });
            return;
          }

          const beforeEncrypted = this.state.encrypted;
          this.setState({
            encrypted: true
          });
          this.context.sendStateEvent(this.props.roomId, _event.EventType.RoomEncryption, {
            algorithm: "m.megolm.v1.aes-sha2"
          }).catch(e => {
            _logger.logger.error(e);

            this.setState({
              encrypted: beforeEncrypted
            });
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "onGuestAccessChange", allowed => {
      const guestAccess = allowed ? _partials.GuestAccess.CanJoin : _partials.GuestAccess.Forbidden;
      const beforeGuestAccess = this.state.guestAccess;
      if (beforeGuestAccess === guestAccess) return;
      this.setState({
        guestAccess
      });
      this.context.sendStateEvent(this.props.roomId, _event.EventType.RoomGuestAccess, {
        guest_access: guestAccess
      }, "").catch(e => {
        _logger.logger.error(e);

        this.setState({
          guestAccess: beforeGuestAccess
        });
      });
    });
    (0, _defineProperty2.default)(this, "createNewRoom", async (defaultPublic, defaultEncrypted) => {
      const modal = _Modal.default.createDialog(_CreateRoomDialog.default, {
        defaultPublic,
        defaultEncrypted
      });

      _PosthogTrackers.default.trackInteraction("WebRoomSettingsSecurityTabCreateNewRoomButton");

      const [shouldCreate, opts] = await modal.finished;

      if (shouldCreate) {
        await (0, _createRoom.default)(opts);
      }

      return shouldCreate;
    });
    (0, _defineProperty2.default)(this, "onHistoryRadioToggle", history => {
      const beforeHistory = this.state.history;
      if (beforeHistory === history) return;
      this.setState({
        history: history
      });
      this.context.sendStateEvent(this.props.roomId, _event.EventType.RoomHistoryVisibility, {
        history_visibility: history
      }, "").catch(e => {
        _logger.logger.error(e);

        this.setState({
          history: beforeHistory
        });
      });
    });
    (0, _defineProperty2.default)(this, "updateBlacklistDevicesFlag", checked => {
      this.context.getRoom(this.props.roomId).setBlacklistUnverifiedDevices(checked);
    });
    (0, _defineProperty2.default)(this, "onJoinRuleChangeError", error => {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Failed to update the join rules"),
        description: error.message ?? (0, _languageHandler._t)("Unknown failure")
      });
    });
    (0, _defineProperty2.default)(this, "onBeforeJoinRuleChange", async joinRule => {
      if (this.state.encrypted && joinRule === _partials.JoinRule.Public) {
        const dialog = _Modal.default.createDialog(_QuestionDialog.default, {
          title: (0, _languageHandler._t)("Are you sure you want to make this encrypted room public?"),
          description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, " ", (0, _languageHandler._t)("<b>It's not recommended to make encrypted rooms public.</b> " + "It will mean anyone can find and join the room, so anyone can read messages. " + "You'll get none of the benefits of encryption. Encrypting messages in a public " + "room will make receiving and sending messages slower.", null, {
            "b": sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
          }), " "), /*#__PURE__*/_react.default.createElement("p", null, " ", (0, _languageHandler._t)("To avoid these issues, create a <a>new public room</a> for the conversation " + "you plan to have.", null, {
            "a": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
              kind: "link_inline",
              onClick: () => {
                dialog.close();
                this.createNewRoom(true, false);
              }
            }, " ", sub, " ")
          }), " "))
        });

        const {
          finished
        } = dialog;
        const [confirm] = await finished;
        if (!confirm) return false;
      }

      return true;
    });
    (0, _defineProperty2.default)(this, "toggleAdvancedSection", () => {
      this.setState({
        showAdvancedSection: !this.state.showAdvancedSection
      });
    });
    const state = context.getRoom(this.props.roomId).currentState;
    this.state = {
      guestAccess: this.pullContentPropertyFromEvent(state.getStateEvents(_event.EventType.RoomGuestAccess, ""), 'guest_access', _partials.GuestAccess.Forbidden),
      history: this.pullContentPropertyFromEvent(state.getStateEvents(_event.EventType.RoomHistoryVisibility, ""), 'history_visibility', _partials.HistoryVisibility.Shared),
      hasAliases: false,
      // async loaded in componentDidMount
      encrypted: context.isRoomEncrypted(this.props.roomId),
      showAdvancedSection: false
    };
  }

  componentDidMount() {
    this.context.on(_roomState.RoomStateEvent.Events, this.onStateEvent);
    this.hasAliases().then(hasAliases => this.setState({
      hasAliases
    }));
  }

  pullContentPropertyFromEvent(event, key, defaultValue) {
    return event?.getContent()[key] || defaultValue;
  }

  componentWillUnmount() {
    this.context.removeListener(_roomState.RoomStateEvent.Events, this.onStateEvent);
  }

  async hasAliases() {
    const cli = this.context;
    const response = await cli.getLocalAliases(this.props.roomId);
    const localAliases = response.aliases;
    return Array.isArray(localAliases) && localAliases.length !== 0;
  }

  renderJoinRule() {
    const client = this.context;
    const room = client.getRoom(this.props.roomId);
    let aliasWarning = null;

    if (room.getJoinRule() === _partials.JoinRule.Public && !this.state.hasAliases) {
      aliasWarning = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SecurityRoomSettingsTab_warning"
      }, /*#__PURE__*/_react.default.createElement(_warning.Icon, {
        width: 15,
        height: 15
      }), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("To link to this room, please add an address.")));
    }

    const description = (0, _languageHandler._t)("Decide who can join %(roomName)s.", {
      roomName: room?.name
    });
    return /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
      legend: (0, _languageHandler._t)("Access"),
      description: description
    }, /*#__PURE__*/_react.default.createElement(_JoinRuleSettings.default, {
      room: room,
      beforeChange: this.onBeforeJoinRuleChange,
      onError: this.onJoinRuleChangeError,
      closeSettingsFn: this.props.closeSettingsFn,
      promptUpgrade: true,
      aliasWarning: aliasWarning
    }));
  }

  renderHistory() {
    if (!_SettingsStore.default.getValue(_UIFeature.UIFeature.RoomHistorySettings)) {
      return null;
    }

    const client = this.context;
    const history = this.state.history;
    const state = client.getRoom(this.props.roomId).currentState;
    const canChangeHistory = state.mayClientSendStateEvent(_event.EventType.RoomHistoryVisibility, client);
    const options = [{
      value: _partials.HistoryVisibility.Shared,
      label: (0, _languageHandler._t)('Members only (since the point in time of selecting this option)')
    }, {
      value: _partials.HistoryVisibility.Invited,
      label: (0, _languageHandler._t)('Members only (since they were invited)')
    }, {
      value: _partials.HistoryVisibility.Joined,
      label: (0, _languageHandler._t)('Members only (since they joined)')
    }]; // World readable doesn't make sense for encrypted rooms

    if (!this.state.encrypted || history === _partials.HistoryVisibility.WorldReadable) {
      options.unshift({
        value: _partials.HistoryVisibility.WorldReadable,
        label: (0, _languageHandler._t)("Anyone")
      });
    }

    const description = (0, _languageHandler._t)('Changes to who can read history will only apply to future messages in this room. ' + 'The visibility of existing history will be unchanged.');
    return /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
      legend: (0, _languageHandler._t)("Who can read history?"),
      description: description
    }, /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "historyVis",
      value: history,
      onChange: this.onHistoryRadioToggle,
      disabled: !canChangeHistory,
      definitions: options
    }));
  }

  renderAdvanced() {
    const client = this.context;
    const guestAccess = this.state.guestAccess;
    const state = client.getRoom(this.props.roomId).currentState;
    const canSetGuestAccess = state.mayClientSendStateEvent(_event.EventType.RoomGuestAccess, client);
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: guestAccess === _partials.GuestAccess.CanJoin,
      onChange: this.onGuestAccessChange,
      disabled: !canSetGuestAccess,
      label: (0, _languageHandler._t)("Enable guest access")
    }), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("People with supported clients will be able to join " + "the room without having a registered account.")));
  }

  render() {
    const client = this.context;
    const room = client.getRoom(this.props.roomId);
    const isEncrypted = this.state.encrypted;
    const hasEncryptionPermission = room.currentState.mayClientSendStateEvent(_event.EventType.RoomEncryption, client);
    const canEnableEncryption = !isEncrypted && hasEncryptionPermission;
    let encryptionSettings = null;

    if (isEncrypted && _SettingsStore.default.isEnabled("blacklistUnverifiedDevices")) {
      encryptionSettings = /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        name: "blacklistUnverifiedDevices",
        level: _SettingLevel.SettingLevel.ROOM_DEVICE,
        onChange: this.updateBlacklistDevicesFlag,
        roomId: this.props.roomId
      });
    }

    const historySection = this.renderHistory();
    let advanced;

    if (room.getJoinRule() === _partials.JoinRule.Public) {
      advanced = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.toggleAdvancedSection,
        kind: "link",
        className: "mx_SettingsTab_showAdvanced"
      }, this.state.showAdvancedSection ? (0, _languageHandler._t)("Hide advanced") : (0, _languageHandler._t)("Show advanced")), this.state.showAdvancedSection && this.renderAdvanced());
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_SecurityRoomSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Security & Privacy")), /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
      legend: (0, _languageHandler._t)("Encryption"),
      description: (0, _languageHandler._t)("Once enabled, encryption cannot be disabled.")
    }, /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: isEncrypted,
      onChange: this.onEncryptionChange,
      label: (0, _languageHandler._t)("Encrypted"),
      disabled: !canEnableEncryption
    }), encryptionSettings), this.renderJoinRule(), advanced, historySection);
  }

}

exports.default = SecurityRoomSettingsTab;
(0, _defineProperty2.default)(SecurityRoomSettingsTab, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZWN1cml0eVJvb21TZXR0aW5nc1RhYiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJlIiwicmVmcmVzaFdoZW5UeXBlcyIsIkV2ZW50VHlwZSIsIlJvb21Kb2luUnVsZXMiLCJSb29tR3Vlc3RBY2Nlc3MiLCJSb29tSGlzdG9yeVZpc2liaWxpdHkiLCJSb29tRW5jcnlwdGlvbiIsImluY2x1ZGVzIiwiZ2V0VHlwZSIsImZvcmNlVXBkYXRlIiwiZ2V0Um9vbSIsInJvb21JZCIsImdldEpvaW5SdWxlIiwiSm9pblJ1bGUiLCJQdWJsaWMiLCJkaWFsb2ciLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlF1ZXN0aW9uRGlhbG9nIiwidGl0bGUiLCJfdCIsImRlc2NyaXB0aW9uIiwic3ViIiwiY2xvc2UiLCJjcmVhdGVOZXdSb29tIiwiZmluaXNoZWQiLCJjb25maXJtIiwiYSIsIm9uRmluaXNoZWQiLCJzZXRTdGF0ZSIsImVuY3J5cHRlZCIsImJlZm9yZUVuY3J5cHRlZCIsInN0YXRlIiwic2VuZFN0YXRlRXZlbnQiLCJhbGdvcml0aG0iLCJjYXRjaCIsImxvZ2dlciIsImVycm9yIiwiYWxsb3dlZCIsImd1ZXN0QWNjZXNzIiwiR3Vlc3RBY2Nlc3MiLCJDYW5Kb2luIiwiRm9yYmlkZGVuIiwiYmVmb3JlR3Vlc3RBY2Nlc3MiLCJndWVzdF9hY2Nlc3MiLCJkZWZhdWx0UHVibGljIiwiZGVmYXVsdEVuY3J5cHRlZCIsIm1vZGFsIiwiQ3JlYXRlUm9vbURpYWxvZyIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrSW50ZXJhY3Rpb24iLCJzaG91bGRDcmVhdGUiLCJvcHRzIiwiY3JlYXRlUm9vbSIsImhpc3RvcnkiLCJiZWZvcmVIaXN0b3J5IiwiaGlzdG9yeV92aXNpYmlsaXR5IiwiY2hlY2tlZCIsInNldEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzIiwiRXJyb3JEaWFsb2ciLCJtZXNzYWdlIiwiam9pblJ1bGUiLCJzaG93QWR2YW5jZWRTZWN0aW9uIiwiY3VycmVudFN0YXRlIiwicHVsbENvbnRlbnRQcm9wZXJ0eUZyb21FdmVudCIsImdldFN0YXRlRXZlbnRzIiwiSGlzdG9yeVZpc2liaWxpdHkiLCJTaGFyZWQiLCJoYXNBbGlhc2VzIiwiaXNSb29tRW5jcnlwdGVkIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsIlJvb21TdGF0ZUV2ZW50IiwiRXZlbnRzIiwib25TdGF0ZUV2ZW50IiwidGhlbiIsImV2ZW50Iiwia2V5IiwiZGVmYXVsdFZhbHVlIiwiZ2V0Q29udGVudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJjbGkiLCJyZXNwb25zZSIsImdldExvY2FsQWxpYXNlcyIsImxvY2FsQWxpYXNlcyIsImFsaWFzZXMiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJyZW5kZXJKb2luUnVsZSIsImNsaWVudCIsInJvb20iLCJhbGlhc1dhcm5pbmciLCJyb29tTmFtZSIsIm5hbWUiLCJvbkJlZm9yZUpvaW5SdWxlQ2hhbmdlIiwib25Kb2luUnVsZUNoYW5nZUVycm9yIiwiY2xvc2VTZXR0aW5nc0ZuIiwicmVuZGVySGlzdG9yeSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIlJvb21IaXN0b3J5U2V0dGluZ3MiLCJjYW5DaGFuZ2VIaXN0b3J5IiwibWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQiLCJvcHRpb25zIiwidmFsdWUiLCJsYWJlbCIsIkludml0ZWQiLCJKb2luZWQiLCJXb3JsZFJlYWRhYmxlIiwidW5zaGlmdCIsIm9uSGlzdG9yeVJhZGlvVG9nZ2xlIiwicmVuZGVyQWR2YW5jZWQiLCJjYW5TZXRHdWVzdEFjY2VzcyIsIm9uR3Vlc3RBY2Nlc3NDaGFuZ2UiLCJyZW5kZXIiLCJpc0VuY3J5cHRlZCIsImhhc0VuY3J5cHRpb25QZXJtaXNzaW9uIiwiY2FuRW5hYmxlRW5jcnlwdGlvbiIsImVuY3J5cHRpb25TZXR0aW5ncyIsImlzRW5hYmxlZCIsIlNldHRpbmdMZXZlbCIsIlJPT01fREVWSUNFIiwidXBkYXRlQmxhY2tsaXN0RGV2aWNlc0ZsYWciLCJoaXN0b3J5U2VjdGlvbiIsImFkdmFuY2VkIiwidG9nZ2xlQWR2YW5jZWRTZWN0aW9uIiwib25FbmNyeXB0aW9uQ2hhbmdlIiwiTWF0cml4Q2xpZW50Q29udGV4dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9TZWN1cml0eVJvb21TZXR0aW5nc1RhYi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LTIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgR3Vlc3RBY2Nlc3MsIEhpc3RvcnlWaXNpYmlsaXR5LCBKb2luUnVsZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvcGFydGlhbHNcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbVN0YXRlRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tc3RhdGVcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IEljb24gYXMgV2FybmluZ0ljb24gfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vLi4vcmVzL2ltZy93YXJuaW5nLnN2Z1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgTGFiZWxsZWRUb2dnbGVTd2l0Y2ggZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0xhYmVsbGVkVG9nZ2xlU3dpdGNoXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4uLy4uLy4uL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBTdHlsZWRSYWRpb0dyb3VwIGZyb20gJy4uLy4uLy4uL2VsZW1lbnRzL1N0eWxlZFJhZGlvR3JvdXAnO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFVJRmVhdHVyZSB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgU2V0dGluZ3NGbGFnIGZyb20gJy4uLy4uLy4uL2VsZW1lbnRzL1NldHRpbmdzRmxhZyc7XG5pbXBvcnQgY3JlYXRlUm9vbSwgeyBJT3B0cyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2NyZWF0ZVJvb20nO1xuaW1wb3J0IENyZWF0ZVJvb21EaWFsb2cgZnJvbSAnLi4vLi4vLi4vZGlhbG9ncy9DcmVhdGVSb29tRGlhbG9nJztcbmltcG9ydCBKb2luUnVsZVNldHRpbmdzIGZyb20gXCIuLi8uLi9Kb2luUnVsZVNldHRpbmdzXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4uLy4uLy4uL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBTZXR0aW5nc0ZpZWxkc2V0IGZyb20gJy4uLy4uL1NldHRpbmdzRmllbGRzZXQnO1xuaW1wb3J0IEV4dGVybmFsTGluayBmcm9tICcuLi8uLi8uLi9lbGVtZW50cy9FeHRlcm5hbExpbmsnO1xuaW1wb3J0IFBvc3Rob2dUcmFja2VycyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tSWQ6IHN0cmluZztcbiAgICBjbG9zZVNldHRpbmdzRm46ICgpID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGd1ZXN0QWNjZXNzOiBHdWVzdEFjY2VzcztcbiAgICBoaXN0b3J5OiBIaXN0b3J5VmlzaWJpbGl0eTtcbiAgICBoYXNBbGlhc2VzOiBib29sZWFuO1xuICAgIGVuY3J5cHRlZDogYm9vbGVhbjtcbiAgICBzaG93QWR2YW5jZWRTZWN0aW9uOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWN1cml0eVJvb21TZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG4gICAgcHVibGljIGNvbnRleHQhOiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgTWF0cml4Q2xpZW50Q29udGV4dD47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSBjb250ZXh0LmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpLmN1cnJlbnRTdGF0ZTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZ3Vlc3RBY2Nlc3M6IHRoaXMucHVsbENvbnRlbnRQcm9wZXJ0eUZyb21FdmVudDxHdWVzdEFjY2Vzcz4oXG4gICAgICAgICAgICAgICAgc3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21HdWVzdEFjY2VzcywgXCJcIiksXG4gICAgICAgICAgICAgICAgJ2d1ZXN0X2FjY2VzcycsXG4gICAgICAgICAgICAgICAgR3Vlc3RBY2Nlc3MuRm9yYmlkZGVuLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGhpc3Rvcnk6IHRoaXMucHVsbENvbnRlbnRQcm9wZXJ0eUZyb21FdmVudDxIaXN0b3J5VmlzaWJpbGl0eT4oXG4gICAgICAgICAgICAgICAgc3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21IaXN0b3J5VmlzaWJpbGl0eSwgXCJcIiksXG4gICAgICAgICAgICAgICAgJ2hpc3RvcnlfdmlzaWJpbGl0eScsXG4gICAgICAgICAgICAgICAgSGlzdG9yeVZpc2liaWxpdHkuU2hhcmVkLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGhhc0FsaWFzZXM6IGZhbHNlLCAvLyBhc3luYyBsb2FkZWQgaW4gY29tcG9uZW50RGlkTW91bnRcbiAgICAgICAgICAgIGVuY3J5cHRlZDogY29udGV4dC5pc1Jvb21FbmNyeXB0ZWQodGhpcy5wcm9wcy5yb29tSWQpLFxuICAgICAgICAgICAgc2hvd0FkdmFuY2VkU2VjdGlvbjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihSb29tU3RhdGVFdmVudC5FdmVudHMsIHRoaXMub25TdGF0ZUV2ZW50KTtcbiAgICAgICAgdGhpcy5oYXNBbGlhc2VzKCkudGhlbihoYXNBbGlhc2VzID0+IHRoaXMuc2V0U3RhdGUoeyBoYXNBbGlhc2VzIH0pKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHB1bGxDb250ZW50UHJvcGVydHlGcm9tRXZlbnQ8VD4oZXZlbnQ6IE1hdHJpeEV2ZW50LCBrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBUKTogVCB7XG4gICAgICAgIHJldHVybiBldmVudD8uZ2V0Q29udGVudCgpW2tleV0gfHwgZGVmYXVsdFZhbHVlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uU3RhdGVFdmVudCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YXRlRXZlbnQgPSAoZTogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgcmVmcmVzaFdoZW5UeXBlczogRXZlbnRUeXBlW10gPSBbXG4gICAgICAgICAgICBFdmVudFR5cGUuUm9vbUpvaW5SdWxlcyxcbiAgICAgICAgICAgIEV2ZW50VHlwZS5Sb29tR3Vlc3RBY2Nlc3MsXG4gICAgICAgICAgICBFdmVudFR5cGUuUm9vbUhpc3RvcnlWaXNpYmlsaXR5LFxuICAgICAgICAgICAgRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uLFxuICAgICAgICBdO1xuICAgICAgICBpZiAocmVmcmVzaFdoZW5UeXBlcy5pbmNsdWRlcyhlLmdldFR5cGUoKSBhcyBFdmVudFR5cGUpKSB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FbmNyeXB0aW9uQ2hhbmdlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0LmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpPy5nZXRKb2luUnVsZSgpID09PSBKb2luUnVsZS5QdWJsaWMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpYWxvZyA9IE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGFkZCBlbmNyeXB0aW9uIHRvIHRoaXMgcHVibGljIHJvb20/JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxwPiB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCI8Yj5JdCdzIG5vdCByZWNvbW1lbmRlZCB0byBhZGQgZW5jcnlwdGlvbiB0byBwdWJsaWMgcm9vbXMuPC9iPiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFueW9uZSBjYW4gZmluZCBhbmQgam9pbiBwdWJsaWMgcm9vbXMsIHNvIGFueW9uZSBjYW4gcmVhZCBtZXNzYWdlcyBpbiB0aGVtLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIllvdSdsbCBnZXQgbm9uZSBvZiB0aGUgYmVuZWZpdHMgb2YgZW5jcnlwdGlvbiwgYW5kIHlvdSB3b24ndCBiZSBhYmxlIHRvIHR1cm4gaXQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJvZmYgbGF0ZXIuIEVuY3J5cHRpbmcgbWVzc2FnZXMgaW4gYSBwdWJsaWMgcm9vbSB3aWxsIG1ha2UgcmVjZWl2aW5nIGFuZCBzZW5kaW5nIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZXMgc2xvd2VyLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgXCJiXCI6IChzdWIpID0+IDxiPnsgc3ViIH08L2I+IH0sXG4gICAgICAgICAgICAgICAgICAgICkgfSA8L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPiB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUbyBhdm9pZCB0aGVzZSBpc3N1ZXMsIGNyZWF0ZSBhIDxhPm5ldyBlbmNyeXB0ZWQgcm9vbTwvYT4gZm9yIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIGNvbnZlcnNhdGlvbiB5b3UgcGxhbiB0byBoYXZlLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFcIjogKHN1YikgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD0nbGlua19pbmxpbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVOZXdSb29tKGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+IHsgc3ViIH0gPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICkgfSA8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+LFxuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gZGlhbG9nO1xuICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1dID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICBpZiAoIWNvbmZpcm0pIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KCdFbmFibGUgZW5jcnlwdGlvbj8nKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICBcIk9uY2UgZW5hYmxlZCwgZW5jcnlwdGlvbiBmb3IgYSByb29tIGNhbm5vdCBiZSBkaXNhYmxlZC4gTWVzc2FnZXMgc2VudCBpbiBhbiBlbmNyeXB0ZWQgXCIgK1xuICAgICAgICAgICAgICAgIFwicm9vbSBjYW5ub3QgYmUgc2VlbiBieSB0aGUgc2VydmVyLCBvbmx5IGJ5IHRoZSBwYXJ0aWNpcGFudHMgb2YgdGhlIHJvb20uIEVuYWJsaW5nIGVuY3J5cHRpb24gXCIgK1xuICAgICAgICAgICAgICAgIFwibWF5IHByZXZlbnQgbWFueSBib3RzIGFuZCBicmlkZ2VzIGZyb20gd29ya2luZyBjb3JyZWN0bHkuIDxhPkxlYXJuIG1vcmUgYWJvdXQgZW5jcnlwdGlvbi48L2E+XCIsXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPEV4dGVybmFsTGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZWxlbWVudC5pby9oZWxwI2VuY3J5cHRpb25cIlxuICAgICAgICAgICAgICAgICAgICA+eyBzdWIgfTwvRXh0ZXJuYWxMaW5rPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChjb25maXJtKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25maXJtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgYmVmb3JlRW5jcnlwdGVkID0gdGhpcy5zdGF0ZS5lbmNyeXB0ZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVuY3J5cHRlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQuc2VuZFN0YXRlRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbUlkLCBFdmVudFR5cGUuUm9vbUVuY3J5cHRpb24sXG4gICAgICAgICAgICAgICAgICAgIHsgYWxnb3JpdGhtOiBcIm0ubWVnb2xtLnYxLmFlcy1zaGEyXCIgfSxcbiAgICAgICAgICAgICAgICApLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVuY3J5cHRlZDogYmVmb3JlRW5jcnlwdGVkIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25HdWVzdEFjY2Vzc0NoYW5nZSA9IChhbGxvd2VkOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IGd1ZXN0QWNjZXNzID0gYWxsb3dlZCA/IEd1ZXN0QWNjZXNzLkNhbkpvaW4gOiBHdWVzdEFjY2Vzcy5Gb3JiaWRkZW47XG4gICAgICAgIGNvbnN0IGJlZm9yZUd1ZXN0QWNjZXNzID0gdGhpcy5zdGF0ZS5ndWVzdEFjY2VzcztcbiAgICAgICAgaWYgKGJlZm9yZUd1ZXN0QWNjZXNzID09PSBndWVzdEFjY2VzcykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBndWVzdEFjY2VzcyB9KTtcblxuICAgICAgICB0aGlzLmNvbnRleHQuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIEV2ZW50VHlwZS5Sb29tR3Vlc3RBY2Nlc3MsIHtcbiAgICAgICAgICAgIGd1ZXN0X2FjY2VzczogZ3Vlc3RBY2Nlc3MsXG4gICAgICAgIH0sIFwiXCIpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZ3Vlc3RBY2Nlc3M6IGJlZm9yZUd1ZXN0QWNjZXNzIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjcmVhdGVOZXdSb29tID0gYXN5bmMgKGRlZmF1bHRQdWJsaWM6IGJvb2xlYW4sIGRlZmF1bHRFbmNyeXB0ZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgY29uc3QgbW9kYWwgPSBNb2RhbC5jcmVhdGVEaWFsb2c8W2Jvb2xlYW4sIElPcHRzXT4oXG4gICAgICAgICAgICBDcmVhdGVSb29tRGlhbG9nLFxuICAgICAgICAgICAgeyBkZWZhdWx0UHVibGljLCBkZWZhdWx0RW5jcnlwdGVkIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJSb29tU2V0dGluZ3NTZWN1cml0eVRhYkNyZWF0ZU5ld1Jvb21CdXR0b25cIik7XG5cbiAgICAgICAgY29uc3QgW3Nob3VsZENyZWF0ZSwgb3B0c10gPSBhd2FpdCBtb2RhbC5maW5pc2hlZDtcbiAgICAgICAgaWYgKHNob3VsZENyZWF0ZSkge1xuICAgICAgICAgICAgYXdhaXQgY3JlYXRlUm9vbShvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2hvdWxkQ3JlYXRlO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSGlzdG9yeVJhZGlvVG9nZ2xlID0gKGhpc3Rvcnk6IEhpc3RvcnlWaXNpYmlsaXR5KSA9PiB7XG4gICAgICAgIGNvbnN0IGJlZm9yZUhpc3RvcnkgPSB0aGlzLnN0YXRlLmhpc3Rvcnk7XG4gICAgICAgIGlmIChiZWZvcmVIaXN0b3J5ID09PSBoaXN0b3J5KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhpc3Rvcnk6IGhpc3RvcnkgfSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLnJvb21JZCwgRXZlbnRUeXBlLlJvb21IaXN0b3J5VmlzaWJpbGl0eSwge1xuICAgICAgICAgICAgaGlzdG9yeV92aXNpYmlsaXR5OiBoaXN0b3J5LFxuICAgICAgICB9LCBcIlwiKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhpc3Rvcnk6IGJlZm9yZUhpc3RvcnkgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZUJsYWNrbGlzdERldmljZXNGbGFnID0gKGNoZWNrZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpLnNldEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzKGNoZWNrZWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIGhhc0FsaWFzZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGNsaSA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGkuZ2V0TG9jYWxBbGlhc2VzKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgY29uc3QgbG9jYWxBbGlhc2VzID0gcmVzcG9uc2UuYWxpYXNlcztcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkobG9jYWxBbGlhc2VzKSAmJiBsb2NhbEFsaWFzZXMubGVuZ3RoICE9PSAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVySm9pblJ1bGUoKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcblxuICAgICAgICBsZXQgYWxpYXNXYXJuaW5nID0gbnVsbDtcbiAgICAgICAgaWYgKHJvb20uZ2V0Sm9pblJ1bGUoKSA9PT0gSm9pblJ1bGUuUHVibGljICYmICF0aGlzLnN0YXRlLmhhc0FsaWFzZXMpIHtcbiAgICAgICAgICAgIGFsaWFzV2FybmluZyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2VjdXJpdHlSb29tU2V0dGluZ3NUYWJfd2FybmluZyc+XG4gICAgICAgICAgICAgICAgICAgIDxXYXJuaW5nSWNvbiB3aWR0aD17MTV9IGhlaWdodD17MTV9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlRvIGxpbmsgdG8gdGhpcyByb29tLCBwbGVhc2UgYWRkIGFuIGFkZHJlc3MuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IF90KFwiRGVjaWRlIHdobyBjYW4gam9pbiAlKHJvb21OYW1lKXMuXCIsIHtcbiAgICAgICAgICAgIHJvb21OYW1lOiByb29tPy5uYW1lLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPFNldHRpbmdzRmllbGRzZXQgbGVnZW5kPXtfdChcIkFjY2Vzc1wiKX0gZGVzY3JpcHRpb249e2Rlc2NyaXB0aW9ufT5cbiAgICAgICAgICAgIDxKb2luUnVsZVNldHRpbmdzXG4gICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICBiZWZvcmVDaGFuZ2U9e3RoaXMub25CZWZvcmVKb2luUnVsZUNoYW5nZX1cbiAgICAgICAgICAgICAgICBvbkVycm9yPXt0aGlzLm9uSm9pblJ1bGVDaGFuZ2VFcnJvcn1cbiAgICAgICAgICAgICAgICBjbG9zZVNldHRpbmdzRm49e3RoaXMucHJvcHMuY2xvc2VTZXR0aW5nc0ZufVxuICAgICAgICAgICAgICAgIHByb21wdFVwZ3JhZGU9e3RydWV9XG4gICAgICAgICAgICAgICAgYWxpYXNXYXJuaW5nPXthbGlhc1dhcm5pbmd9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L1NldHRpbmdzRmllbGRzZXQ+O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Kb2luUnVsZUNoYW5nZUVycm9yID0gKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byB1cGRhdGUgdGhlIGpvaW4gcnVsZXNcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyb3IubWVzc2FnZSA/PyBfdChcIlVua25vd24gZmFpbHVyZVwiKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25CZWZvcmVKb2luUnVsZUNoYW5nZSA9IGFzeW5jIChqb2luUnVsZTogSm9pblJ1bGUpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZW5jcnlwdGVkICYmIGpvaW5SdWxlID09PSBKb2luUnVsZS5QdWJsaWMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpYWxvZyA9IE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBtYWtlIHRoaXMgZW5jcnlwdGVkIHJvb20gcHVibGljP1wiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHA+IHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjxiPkl0J3Mgbm90IHJlY29tbWVuZGVkIHRvIG1ha2UgZW5jcnlwdGVkIHJvb21zIHB1YmxpYy48L2I+IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSXQgd2lsbCBtZWFuIGFueW9uZSBjYW4gZmluZCBhbmQgam9pbiB0aGUgcm9vbSwgc28gYW55b25lIGNhbiByZWFkIG1lc3NhZ2VzLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIllvdSdsbCBnZXQgbm9uZSBvZiB0aGUgYmVuZWZpdHMgb2YgZW5jcnlwdGlvbi4gRW5jcnlwdGluZyBtZXNzYWdlcyBpbiBhIHB1YmxpYyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInJvb20gd2lsbCBtYWtlIHJlY2VpdmluZyBhbmQgc2VuZGluZyBtZXNzYWdlcyBzbG93ZXIuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBcImJcIjogKHN1YikgPT4gPGI+eyBzdWIgfTwvYj4gfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9IDwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHA+IHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRvIGF2b2lkIHRoZXNlIGlzc3VlcywgY3JlYXRlIGEgPGE+bmV3IHB1YmxpYyByb29tPC9hPiBmb3IgdGhlIGNvbnZlcnNhdGlvbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInlvdSBwbGFuIHRvIGhhdmUuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYVwiOiAoc3ViKSA9PiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPSdsaW5rX2lubGluZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZU5ld1Jvb20odHJ1ZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fT4geyBzdWIgfSA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9IDwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gZGlhbG9nO1xuICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1dID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICBpZiAoIWNvbmZpcm0pIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckhpc3RvcnkoKSB7XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuUm9vbUhpc3RvcnlTZXR0aW5ncykpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy5zdGF0ZS5oaXN0b3J5O1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKS5jdXJyZW50U3RhdGU7XG4gICAgICAgIGNvbnN0IGNhbkNoYW5nZUhpc3RvcnkgPSBzdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuUm9vbUhpc3RvcnlWaXNpYmlsaXR5LCBjbGllbnQpO1xuXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IEhpc3RvcnlWaXNpYmlsaXR5LlNoYXJlZCxcbiAgICAgICAgICAgICAgICBsYWJlbDogX3QoJ01lbWJlcnMgb25seSAoc2luY2UgdGhlIHBvaW50IGluIHRpbWUgb2Ygc2VsZWN0aW5nIHRoaXMgb3B0aW9uKScpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogSGlzdG9yeVZpc2liaWxpdHkuSW52aXRlZCxcbiAgICAgICAgICAgICAgICBsYWJlbDogX3QoJ01lbWJlcnMgb25seSAoc2luY2UgdGhleSB3ZXJlIGludml0ZWQpJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBIaXN0b3J5VmlzaWJpbGl0eS5Kb2luZWQsXG4gICAgICAgICAgICAgICAgbGFiZWw6IF90KCdNZW1iZXJzIG9ubHkgKHNpbmNlIHRoZXkgam9pbmVkKScpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBXb3JsZCByZWFkYWJsZSBkb2Vzbid0IG1ha2Ugc2Vuc2UgZm9yIGVuY3J5cHRlZCByb29tc1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZW5jcnlwdGVkIHx8IGhpc3RvcnkgPT09IEhpc3RvcnlWaXNpYmlsaXR5LldvcmxkUmVhZGFibGUpIHtcbiAgICAgICAgICAgIG9wdGlvbnMudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IEhpc3RvcnlWaXNpYmlsaXR5LldvcmxkUmVhZGFibGUsXG4gICAgICAgICAgICAgICAgbGFiZWw6IF90KFwiQW55b25lXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IF90KCdDaGFuZ2VzIHRvIHdobyBjYW4gcmVhZCBoaXN0b3J5IHdpbGwgb25seSBhcHBseSB0byBmdXR1cmUgbWVzc2FnZXMgaW4gdGhpcyByb29tLiAnICtcbiAgICAgICAgJ1RoZSB2aXNpYmlsaXR5IG9mIGV4aXN0aW5nIGhpc3Rvcnkgd2lsbCBiZSB1bmNoYW5nZWQuJyk7XG5cbiAgICAgICAgcmV0dXJuICg8U2V0dGluZ3NGaWVsZHNldCBsZWdlbmQ9e190KFwiV2hvIGNhbiByZWFkIGhpc3Rvcnk/XCIpfSBkZXNjcmlwdGlvbj17ZGVzY3JpcHRpb259PlxuICAgICAgICAgICAgPFN0eWxlZFJhZGlvR3JvdXBcbiAgICAgICAgICAgICAgICBuYW1lPVwiaGlzdG9yeVZpc1wiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2hpc3Rvcnl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25IaXN0b3J5UmFkaW9Ub2dnbGV9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5DaGFuZ2VIaXN0b3J5fVxuICAgICAgICAgICAgICAgIGRlZmluaXRpb25zPXtvcHRpb25zfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9TZXR0aW5nc0ZpZWxkc2V0Pik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0b2dnbGVBZHZhbmNlZFNlY3Rpb24gPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93QWR2YW5jZWRTZWN0aW9uOiAhdGhpcy5zdGF0ZS5zaG93QWR2YW5jZWRTZWN0aW9uIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckFkdmFuY2VkKCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNvbnN0IGd1ZXN0QWNjZXNzID0gdGhpcy5zdGF0ZS5ndWVzdEFjY2VzcztcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCkuY3VycmVudFN0YXRlO1xuICAgICAgICBjb25zdCBjYW5TZXRHdWVzdEFjY2VzcyA9IHN0YXRlLm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5Sb29tR3Vlc3RBY2Nlc3MsIGNsaWVudCk7XG5cbiAgICAgICAgcmV0dXJuIDw+XG4gICAgICAgICAgICA8TGFiZWxsZWRUb2dnbGVTd2l0Y2hcbiAgICAgICAgICAgICAgICB2YWx1ZT17Z3Vlc3RBY2Nlc3MgPT09IEd1ZXN0QWNjZXNzLkNhbkpvaW59XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25HdWVzdEFjY2Vzc0NoYW5nZX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhblNldEd1ZXN0QWNjZXNzfVxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVuYWJsZSBndWVzdCBhY2Nlc3NcIil9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgeyBfdChcIlBlb3BsZSB3aXRoIHN1cHBvcnRlZCBjbGllbnRzIHdpbGwgYmUgYWJsZSB0byBqb2luIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGUgcm9vbSB3aXRob3V0IGhhdmluZyBhIHJlZ2lzdGVyZWQgYWNjb3VudC5cIikgfVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICA8Lz47XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gdGhpcy5zdGF0ZS5lbmNyeXB0ZWQ7XG4gICAgICAgIGNvbnN0IGhhc0VuY3J5cHRpb25QZXJtaXNzaW9uID0gcm9vbS5jdXJyZW50U3RhdGUubWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uLCBjbGllbnQpO1xuICAgICAgICBjb25zdCBjYW5FbmFibGVFbmNyeXB0aW9uID0gIWlzRW5jcnlwdGVkICYmIGhhc0VuY3J5cHRpb25QZXJtaXNzaW9uO1xuXG4gICAgICAgIGxldCBlbmNyeXB0aW9uU2V0dGluZ3MgPSBudWxsO1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWQgJiYgU2V0dGluZ3NTdG9yZS5pc0VuYWJsZWQoXCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiKSkge1xuICAgICAgICAgICAgZW5jcnlwdGlvblNldHRpbmdzID0gPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgIG5hbWU9XCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiXG4gICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ST09NX0RFVklDRX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy51cGRhdGVCbGFja2xpc3REZXZpY2VzRmxhZ31cbiAgICAgICAgICAgICAgICByb29tSWQ9e3RoaXMucHJvcHMucm9vbUlkfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoaXN0b3J5U2VjdGlvbiA9IHRoaXMucmVuZGVySGlzdG9yeSgpO1xuXG4gICAgICAgIGxldCBhZHZhbmNlZDtcbiAgICAgICAgaWYgKHJvb20uZ2V0Sm9pblJ1bGUoKSA9PT0gSm9pblJ1bGUuUHVibGljKSB7XG4gICAgICAgICAgICBhZHZhbmNlZCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlQWR2YW5jZWRTZWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2hvd0FkdmFuY2VkXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLnNob3dBZHZhbmNlZFNlY3Rpb24gPyBfdChcIkhpZGUgYWR2YW5jZWRcIikgOiBfdChcIlNob3cgYWR2YW5jZWRcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5zaG93QWR2YW5jZWRTZWN0aW9uICYmIHRoaXMucmVuZGVyQWR2YW5jZWQoKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWIgbXhfU2VjdXJpdHlSb29tU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiU2VjdXJpdHkgJiBQcml2YWN5XCIpIH08L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZpZWxkc2V0IGxlZ2VuZD17X3QoXCJFbmNyeXB0aW9uXCIpfSBkZXNjcmlwdGlvbj17X3QoXCJPbmNlIGVuYWJsZWQsIGVuY3J5cHRpb24gY2Fubm90IGJlIGRpc2FibGVkLlwiKX0+XG4gICAgICAgICAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2lzRW5jcnlwdGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmNyeXB0aW9uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRW5jcnlwdGVkXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5FbmFibGVFbmNyeXB0aW9ufVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IGVuY3J5cHRpb25TZXR0aW5ncyB9XG4gICAgICAgICAgICAgICAgPC9TZXR0aW5nc0ZpZWxkc2V0PlxuXG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckpvaW5SdWxlKCkgfVxuXG4gICAgICAgICAgICAgICAgeyBhZHZhbmNlZCB9XG4gICAgICAgICAgICAgICAgeyBoaXN0b3J5U2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUEwQ2UsTUFBTUEsdUJBQU4sU0FBc0NDLGNBQUEsQ0FBTUMsU0FBNUMsQ0FBc0U7RUFJakZDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRQyxPQUFSLEVBQWlCO0lBQ3hCLE1BQU1ELEtBQU4sRUFBYUMsT0FBYjtJQUR3QjtJQUFBLG9EQW1DSkMsQ0FBRCxJQUFvQjtNQUN2QyxNQUFNQyxnQkFBNkIsR0FBRyxDQUNsQ0MsZ0JBQUEsQ0FBVUMsYUFEd0IsRUFFbENELGdCQUFBLENBQVVFLGVBRndCLEVBR2xDRixnQkFBQSxDQUFVRyxxQkFId0IsRUFJbENILGdCQUFBLENBQVVJLGNBSndCLENBQXRDO01BTUEsSUFBSUwsZ0JBQWdCLENBQUNNLFFBQWpCLENBQTBCUCxDQUFDLENBQUNRLE9BQUYsRUFBMUIsQ0FBSixFQUF5RCxLQUFLQyxXQUFMO0lBQzVELENBM0MyQjtJQUFBLDBEQTZDQyxZQUFZO01BQ3JDLElBQUksS0FBS1YsT0FBTCxDQUFhVyxPQUFiLENBQXFCLEtBQUtaLEtBQUwsQ0FBV2EsTUFBaEMsR0FBeUNDLFdBQXpDLE9BQTJEQyxrQkFBQSxDQUFTQyxNQUF4RSxFQUFnRjtRQUM1RSxNQUFNQyxNQUFNLEdBQUdDLGNBQUEsQ0FBTUMsWUFB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