"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _RoomAliasField = _interopRequireDefault(require("../elements/RoomAliasField"));

var _LabelledToggleSwitch = _interopRequireDefault(require("../elements/LabelledToggleSwitch"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _BaseDialog = _interopRequireDefault(require("../dialogs/BaseDialog"));

var _JoinRuleDropdown = _interopRequireDefault(require("../elements/JoinRuleDropdown"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _rooms = require("../../../utils/rooms");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

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
class CreateRoomDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "supportsRestricted", void 0);
    (0, _defineProperty2.default)(this, "nameField", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "aliasField", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onKeyDown", event => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(event);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Enter:
          this.onOk();
          event.preventDefault();
          event.stopPropagation();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onOk", async () => {
      const activeElement = document.activeElement;

      if (activeElement) {
        activeElement.blur();
      }

      await this.nameField.current.validate({
        allowEmpty: false
      });

      if (this.aliasField.current) {
        await this.aliasField.current.validate({
          allowEmpty: false
        });
      } // Validation and state updates are async, so we need to wait for them to complete
      // first. Queue a `setState` callback and wait for it to resolve.


      await new Promise(resolve => this.setState({}, resolve));

      if (this.state.nameIsValid && (!this.aliasField.current || this.aliasField.current.isValid)) {
        this.props.onFinished(true, this.roomCreateOptions());
      } else {
        let field;

        if (!this.state.nameIsValid) {
          field = this.nameField.current;
        } else if (this.aliasField.current && !this.aliasField.current.isValid) {
          field = this.aliasField.current;
        }

        if (field) {
          field.focus();
          field.validate({
            allowEmpty: false,
            focused: true
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onNameChange", ev => {
      this.setState({
        name: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onTopicChange", ev => {
      this.setState({
        topic: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onJoinRuleChange", joinRule => {
      this.setState({
        joinRule
      });
    });
    (0, _defineProperty2.default)(this, "onEncryptedChange", isEncrypted => {
      this.setState({
        isEncrypted
      });
    });
    (0, _defineProperty2.default)(this, "onAliasChange", alias => {
      this.setState({
        alias
      });
    });
    (0, _defineProperty2.default)(this, "onDetailsToggled", ev => {
      this.setState({
        detailsOpen: ev.target.open
      });
    });
    (0, _defineProperty2.default)(this, "onNoFederateChange", noFederate => {
      this.setState({
        noFederate
      });
    });
    (0, _defineProperty2.default)(this, "onNameValidate", async fieldState => {
      const result = await CreateRoomDialog.validateRoomName(fieldState);
      this.setState({
        nameIsValid: result.valid
      });
      return result;
    });
    this.supportsRestricted = !!this.props.parentSpace;
    let _joinRule = _partials.JoinRule.Invite;

    if (this.props.defaultPublic) {
      _joinRule = _partials.JoinRule.Public;
    } else if (this.supportsRestricted) {
      _joinRule = _partials.JoinRule.Restricted;
    }

    this.state = {
      isPublic: this.props.defaultPublic || false,
      isEncrypted: this.props.defaultEncrypted ?? (0, _rooms.privateShouldBeEncrypted)(),
      joinRule: _joinRule,
      name: this.props.defaultName || "",
      topic: "",
      alias: "",
      detailsOpen: false,
      noFederate: _SdkConfig.default.get().default_federate === false,
      nameIsValid: false,
      canChangeEncryption: true
    };

    _MatrixClientPeg.MatrixClientPeg.get().doesServerForceEncryptionForPreset(_partials.Preset.PrivateChat).then(isForced => this.setState({
      canChangeEncryption: !isForced
    }));
  }

  roomCreateOptions() {
    const opts = {};
    const createOpts = opts.createOpts = {};
    opts.roomType = this.props.type;
    createOpts.name = this.state.name;

    if (this.state.joinRule === _partials.JoinRule.Public) {
      createOpts.visibility = _partials.Visibility.Public;
      createOpts.preset = _partials.Preset.PublicChat;
      opts.guestAccess = false;
      const {
        alias
      } = this.state;
      createOpts.room_alias_name = alias.substring(1, alias.indexOf(":"));
    } else {
      // If we cannot change encryption we pass `true` for safety, the server should automatically do this for us.
      opts.encryption = this.state.canChangeEncryption ? this.state.isEncrypted : true;
    }

    if (this.state.topic) {
      createOpts.topic = this.state.topic;
    }

    if (this.state.noFederate) {
      createOpts.creation_content = {
        'm.federate': false
      };
    }

    opts.parentSpace = this.props.parentSpace;

    if (this.props.parentSpace && this.state.joinRule === _partials.JoinRule.Restricted) {
      opts.joinRule = _partials.JoinRule.Restricted;
    }

    return opts;
  }

  componentDidMount() {
    // move focus to first field when showing dialog
    this.nameField.current.focus();
  }

  componentWillUnmount() {}

  render() {
    const isVideoRoom = this.props.type === _event.RoomType.ElementVideo;
    let aliasField;

    if (this.state.joinRule === _partials.JoinRule.Public) {
      const domain = _MatrixClientPeg.MatrixClientPeg.get().getDomain();

      aliasField = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CreateRoomDialog_aliasContainer"
      }, /*#__PURE__*/_react.default.createElement(_RoomAliasField.default, {
        ref: this.aliasField,
        onChange: this.onAliasChange,
        domain: domain,
        value: this.state.alias
      }));
    }

    let publicPrivateLabel;

    if (this.state.joinRule === _partials.JoinRule.Restricted) {
      publicPrivateLabel = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Everyone in <SpaceName/> will be able to find and join this room.", {}, {
        SpaceName: () => /*#__PURE__*/_react.default.createElement("b", null, this.props.parentSpace.name)
      }), "\xA0", (0, _languageHandler._t)("You can change this at any time from room settings."));
    } else if (this.state.joinRule === _partials.JoinRule.Public && this.props.parentSpace) {
      publicPrivateLabel = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Anyone will be able to find and join this room, not just members of <SpaceName/>.", {}, {
        SpaceName: () => /*#__PURE__*/_react.default.createElement("b", null, this.props.parentSpace.name)
      }), "\xA0", (0, _languageHandler._t)("You can change this at any time from room settings."));
    } else if (this.state.joinRule === _partials.JoinRule.Public) {
      publicPrivateLabel = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Anyone will be able to find and join this room."), "\xA0", (0, _languageHandler._t)("You can change this at any time from room settings."));
    } else if (this.state.joinRule === _partials.JoinRule.Invite) {
      publicPrivateLabel = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Only people invited will be able to find and join this room."), "\xA0", (0, _languageHandler._t)("You can change this at any time from room settings."));
    }

    let e2eeSection;

    if (this.state.joinRule !== _partials.JoinRule.Public) {
      let microcopy;

      if ((0, _rooms.privateShouldBeEncrypted)()) {
        if (this.state.canChangeEncryption) {
          microcopy = isVideoRoom ? (0, _languageHandler._t)("You can't disable this later. The room will be encrypted but the embedded call will not.") : (0, _languageHandler._t)("You can't disable this later. Bridges & most bots won't work yet.");
        } else {
          microcopy = (0, _languageHandler._t)("Your server requires encryption to be enabled in private rooms.");
        }
      } else {
        microcopy = (0, _languageHandler._t)("Your server admin has disabled end-to-end encryption by default " + "in private rooms & Direct Messages.");
      }

      e2eeSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
        label: (0, _languageHandler._t)("Enable end-to-end encryption"),
        onChange: this.onEncryptedChange,
        value: this.state.isEncrypted,
        className: "mx_CreateRoomDialog_e2eSwitch" // for end-to-end tests
        ,
        disabled: !this.state.canChangeEncryption
      }), /*#__PURE__*/_react.default.createElement("p", null, microcopy));
    }

    let federateLabel = (0, _languageHandler._t)("You might enable this if the room will only be used for collaborating with internal " + "teams on your homeserver. This cannot be changed later.");

    if (_SdkConfig.default.get().default_federate === false) {
      // We only change the label if the default setting is different to avoid jarring text changes to the
      // user. They will have read the implications of turning this off/on, so no need to rephrase for them.
      federateLabel = (0, _languageHandler._t)("You might disable this if the room will be used for collaborating with external " + "teams who have their own homeserver. This cannot be changed later.");
    }

    let title;

    if (isVideoRoom) {
      title = (0, _languageHandler._t)("Create a video room");
    } else if (this.props.parentSpace) {
      title = (0, _languageHandler._t)("Create a room");
    } else {
      title = this.state.joinRule === _partials.JoinRule.Public ? (0, _languageHandler._t)('Create a public room') : (0, _languageHandler._t)('Create a private room');
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_CreateRoomDialog",
      onFinished: this.props.onFinished,
      title: title,
      screenName: "CreateRoom"
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onOk,
      onKeyDown: this.onKeyDown
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      ref: this.nameField,
      label: (0, _languageHandler._t)('Name'),
      onChange: this.onNameChange,
      onValidate: this.onNameValidate,
      value: this.state.name,
      className: "mx_CreateRoomDialog_name"
    }), /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: (0, _languageHandler._t)('Topic (optional)'),
      onChange: this.onTopicChange,
      value: this.state.topic,
      className: "mx_CreateRoomDialog_topic"
    }), /*#__PURE__*/_react.default.createElement(_JoinRuleDropdown.default, {
      label: (0, _languageHandler._t)("Room visibility"),
      labelInvite: (0, _languageHandler._t)("Private room (invite only)"),
      labelPublic: (0, _languageHandler._t)("Public room"),
      labelRestricted: this.supportsRestricted ? (0, _languageHandler._t)("Visible to space members") : undefined,
      value: this.state.joinRule,
      onChange: this.onJoinRuleChange
    }), publicPrivateLabel, e2eeSection, aliasField, /*#__PURE__*/_react.default.createElement("details", {
      onToggle: this.onDetailsToggled,
      className: "mx_CreateRoomDialog_details"
    }, /*#__PURE__*/_react.default.createElement("summary", {
      className: "mx_CreateRoomDialog_details_summary"
    }, this.state.detailsOpen ? (0, _languageHandler._t)('Hide advanced') : (0, _languageHandler._t)('Show advanced')), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      label: (0, _languageHandler._t)("Block anyone not part of %(serverName)s from ever joining this room.", {
        serverName: _MatrixClientPeg.MatrixClientPeg.getHomeserverName()
      }),
      onChange: this.onNoFederateChange,
      value: this.state.noFederate
    }), /*#__PURE__*/_react.default.createElement("p", null, federateLabel)))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: isVideoRoom ? (0, _languageHandler._t)('Create video room') : (0, _languageHandler._t)('Create room'),
      onPrimaryButtonClick: this.onOk,
      onCancel: this.onCancel
    }));
  }

}

exports.default = CreateRoomDialog;
(0, _defineProperty2.default)(CreateRoomDialog, "validateRoomName", (0, _Validation.default)({
  rules: [{
    key: "required",
    test: async _ref => {
      let {
        value
      } = _ref;
      return !!value;
    },
    invalid: () => (0, _languageHandler._t)("Please enter a name for the room")
  }]
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGVSb29tRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiZXZlbnQiLCJhY3Rpb24iLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRBY2Nlc3NpYmlsaXR5QWN0aW9uIiwiS2V5QmluZGluZ0FjdGlvbiIsIkVudGVyIiwib25PayIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiYWN0aXZlRWxlbWVudCIsImRvY3VtZW50IiwiYmx1ciIsIm5hbWVGaWVsZCIsImN1cnJlbnQiLCJ2YWxpZGF0ZSIsImFsbG93RW1wdHkiLCJhbGlhc0ZpZWxkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRTdGF0ZSIsInN0YXRlIiwibmFtZUlzVmFsaWQiLCJpc1ZhbGlkIiwib25GaW5pc2hlZCIsInJvb21DcmVhdGVPcHRpb25zIiwiZmllbGQiLCJmb2N1cyIsImZvY3VzZWQiLCJldiIsIm5hbWUiLCJ0YXJnZXQiLCJ2YWx1ZSIsInRvcGljIiwiam9pblJ1bGUiLCJpc0VuY3J5cHRlZCIsImFsaWFzIiwiZGV0YWlsc09wZW4iLCJvcGVuIiwibm9GZWRlcmF0ZSIsImZpZWxkU3RhdGUiLCJyZXN1bHQiLCJ2YWxpZGF0ZVJvb21OYW1lIiwidmFsaWQiLCJzdXBwb3J0c1Jlc3RyaWN0ZWQiLCJwYXJlbnRTcGFjZSIsIkpvaW5SdWxlIiwiSW52aXRlIiwiZGVmYXVsdFB1YmxpYyIsIlB1YmxpYyIsIlJlc3RyaWN0ZWQiLCJpc1B1YmxpYyIsImRlZmF1bHRFbmNyeXB0ZWQiLCJwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQiLCJkZWZhdWx0TmFtZSIsIlNka0NvbmZpZyIsImdldCIsImRlZmF1bHRfZmVkZXJhdGUiLCJjYW5DaGFuZ2VFbmNyeXB0aW9uIiwiTWF0cml4Q2xpZW50UGVnIiwiZG9lc1NlcnZlckZvcmNlRW5jcnlwdGlvbkZvclByZXNldCIsIlByZXNldCIsIlByaXZhdGVDaGF0IiwidGhlbiIsImlzRm9yY2VkIiwib3B0cyIsImNyZWF0ZU9wdHMiLCJyb29tVHlwZSIsInR5cGUiLCJ2aXNpYmlsaXR5IiwiVmlzaWJpbGl0eSIsInByZXNldCIsIlB1YmxpY0NoYXQiLCJndWVzdEFjY2VzcyIsInJvb21fYWxpYXNfbmFtZSIsInN1YnN0cmluZyIsImluZGV4T2YiLCJlbmNyeXB0aW9uIiwiY3JlYXRpb25fY29udGVudCIsImNvbXBvbmVudERpZE1vdW50IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW5kZXIiLCJpc1ZpZGVvUm9vbSIsIlJvb21UeXBlIiwiRWxlbWVudFZpZGVvIiwiZG9tYWluIiwiZ2V0RG9tYWluIiwib25BbGlhc0NoYW5nZSIsInB1YmxpY1ByaXZhdGVMYWJlbCIsIl90IiwiU3BhY2VOYW1lIiwiZTJlZVNlY3Rpb24iLCJtaWNyb2NvcHkiLCJvbkVuY3J5cHRlZENoYW5nZSIsImZlZGVyYXRlTGFiZWwiLCJ0aXRsZSIsIm9uS2V5RG93biIsIm9uTmFtZUNoYW5nZSIsIm9uTmFtZVZhbGlkYXRlIiwib25Ub3BpY0NoYW5nZSIsInVuZGVmaW5lZCIsIm9uSm9pblJ1bGVDaGFuZ2UiLCJvbkRldGFpbHNUb2dnbGVkIiwic2VydmVyTmFtZSIsImdldEhvbWVzZXJ2ZXJOYW1lIiwib25Ob0ZlZGVyYXRlQ2hhbmdlIiwib25DYW5jZWwiLCJ3aXRoVmFsaWRhdGlvbiIsInJ1bGVzIiwia2V5IiwidGVzdCIsImludmFsaWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0NyZWF0ZVJvb21EaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDIwLCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IENoYW5nZUV2ZW50LCBjcmVhdGVSZWYsIEtleWJvYXJkRXZlbnQsIFN5bnRoZXRpY0V2ZW50IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBSb29tVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IEpvaW5SdWxlLCBQcmVzZXQsIFZpc2liaWxpdHkgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3BhcnRpYWxzXCI7XG5cbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiwgeyBJRmllbGRTdGF0ZSB9IGZyb20gJy4uL2VsZW1lbnRzL1ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IElPcHRzIH0gZnJvbSBcIi4uLy4uLy4uL2NyZWF0ZVJvb21cIjtcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBSb29tQWxpYXNGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvUm9vbUFsaWFzRmllbGRcIjtcbmltcG9ydCBMYWJlbGxlZFRvZ2dsZVN3aXRjaCBmcm9tIFwiLi4vZWxlbWVudHMvTGFiZWxsZWRUb2dnbGVTd2l0Y2hcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgSm9pblJ1bGVEcm9wZG93biBmcm9tIFwiLi4vZWxlbWVudHMvSm9pblJ1bGVEcm9wZG93blwiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuaW1wb3J0IHsgS2V5QmluZGluZ0FjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5pbXBvcnQgeyBwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcm9vbXNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdHlwZT86IFJvb21UeXBlO1xuICAgIGRlZmF1bHRQdWJsaWM/OiBib29sZWFuO1xuICAgIGRlZmF1bHROYW1lPzogc3RyaW5nO1xuICAgIHBhcmVudFNwYWNlPzogUm9vbTtcbiAgICBkZWZhdWx0RW5jcnlwdGVkPzogYm9vbGVhbjtcbiAgICBvbkZpbmlzaGVkKHByb2NlZWQ6IGJvb2xlYW4sIG9wdHM/OiBJT3B0cyk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGpvaW5SdWxlOiBKb2luUnVsZTtcbiAgICBpc1B1YmxpYzogYm9vbGVhbjtcbiAgICBpc0VuY3J5cHRlZDogYm9vbGVhbjtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdG9waWM6IHN0cmluZztcbiAgICBhbGlhczogc3RyaW5nO1xuICAgIGRldGFpbHNPcGVuOiBib29sZWFuO1xuICAgIG5vRmVkZXJhdGU6IGJvb2xlYW47XG4gICAgbmFtZUlzVmFsaWQ6IGJvb2xlYW47XG4gICAgY2FuQ2hhbmdlRW5jcnlwdGlvbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3JlYXRlUm9vbURpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3VwcG9ydHNSZXN0cmljdGVkOiBib29sZWFuO1xuICAgIHByaXZhdGUgbmFtZUZpZWxkID0gY3JlYXRlUmVmPEZpZWxkPigpO1xuICAgIHByaXZhdGUgYWxpYXNGaWVsZCA9IGNyZWF0ZVJlZjxSb29tQWxpYXNGaWVsZD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN1cHBvcnRzUmVzdHJpY3RlZCA9ICEhdGhpcy5wcm9wcy5wYXJlbnRTcGFjZTtcblxuICAgICAgICBsZXQgam9pblJ1bGUgPSBKb2luUnVsZS5JbnZpdGU7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRQdWJsaWMpIHtcbiAgICAgICAgICAgIGpvaW5SdWxlID0gSm9pblJ1bGUuUHVibGljO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3VwcG9ydHNSZXN0cmljdGVkKSB7XG4gICAgICAgICAgICBqb2luUnVsZSA9IEpvaW5SdWxlLlJlc3RyaWN0ZWQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNQdWJsaWM6IHRoaXMucHJvcHMuZGVmYXVsdFB1YmxpYyB8fCBmYWxzZSxcbiAgICAgICAgICAgIGlzRW5jcnlwdGVkOiB0aGlzLnByb3BzLmRlZmF1bHRFbmNyeXB0ZWQgPz8gcHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkKCksXG4gICAgICAgICAgICBqb2luUnVsZSxcbiAgICAgICAgICAgIG5hbWU6IHRoaXMucHJvcHMuZGVmYXVsdE5hbWUgfHwgXCJcIixcbiAgICAgICAgICAgIHRvcGljOiBcIlwiLFxuICAgICAgICAgICAgYWxpYXM6IFwiXCIsXG4gICAgICAgICAgICBkZXRhaWxzT3BlbjogZmFsc2UsXG4gICAgICAgICAgICBub0ZlZGVyYXRlOiBTZGtDb25maWcuZ2V0KCkuZGVmYXVsdF9mZWRlcmF0ZSA9PT0gZmFsc2UsXG4gICAgICAgICAgICBuYW1lSXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICBjYW5DaGFuZ2VFbmNyeXB0aW9uOiB0cnVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5kb2VzU2VydmVyRm9yY2VFbmNyeXB0aW9uRm9yUHJlc2V0KFByZXNldC5Qcml2YXRlQ2hhdClcbiAgICAgICAgICAgIC50aGVuKGlzRm9yY2VkID0+IHRoaXMuc2V0U3RhdGUoeyBjYW5DaGFuZ2VFbmNyeXB0aW9uOiAhaXNGb3JjZWQgfSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcm9vbUNyZWF0ZU9wdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IG9wdHM6IElPcHRzID0ge307XG4gICAgICAgIGNvbnN0IGNyZWF0ZU9wdHM6IElPcHRzW1wiY3JlYXRlT3B0c1wiXSA9IG9wdHMuY3JlYXRlT3B0cyA9IHt9O1xuICAgICAgICBvcHRzLnJvb21UeXBlID0gdGhpcy5wcm9wcy50eXBlO1xuICAgICAgICBjcmVhdGVPcHRzLm5hbWUgPSB0aGlzLnN0YXRlLm5hbWU7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuam9pblJ1bGUgPT09IEpvaW5SdWxlLlB1YmxpYykge1xuICAgICAgICAgICAgY3JlYXRlT3B0cy52aXNpYmlsaXR5ID0gVmlzaWJpbGl0eS5QdWJsaWM7XG4gICAgICAgICAgICBjcmVhdGVPcHRzLnByZXNldCA9IFByZXNldC5QdWJsaWNDaGF0O1xuICAgICAgICAgICAgb3B0cy5ndWVzdEFjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgeyBhbGlhcyB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGNyZWF0ZU9wdHMucm9vbV9hbGlhc19uYW1lID0gYWxpYXMuc3Vic3RyaW5nKDEsIGFsaWFzLmluZGV4T2YoXCI6XCIpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGNhbm5vdCBjaGFuZ2UgZW5jcnlwdGlvbiB3ZSBwYXNzIGB0cnVlYCBmb3Igc2FmZXR5LCB0aGUgc2VydmVyIHNob3VsZCBhdXRvbWF0aWNhbGx5IGRvIHRoaXMgZm9yIHVzLlxuICAgICAgICAgICAgb3B0cy5lbmNyeXB0aW9uID0gdGhpcy5zdGF0ZS5jYW5DaGFuZ2VFbmNyeXB0aW9uID8gdGhpcy5zdGF0ZS5pc0VuY3J5cHRlZCA6IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS50b3BpYykge1xuICAgICAgICAgICAgY3JlYXRlT3B0cy50b3BpYyA9IHRoaXMuc3RhdGUudG9waWM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubm9GZWRlcmF0ZSkge1xuICAgICAgICAgICAgY3JlYXRlT3B0cy5jcmVhdGlvbl9jb250ZW50ID0geyAnbS5mZWRlcmF0ZSc6IGZhbHNlIH07XG4gICAgICAgIH1cblxuICAgICAgICBvcHRzLnBhcmVudFNwYWNlID0gdGhpcy5wcm9wcy5wYXJlbnRTcGFjZTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucGFyZW50U3BhY2UgJiYgdGhpcy5zdGF0ZS5qb2luUnVsZSA9PT0gSm9pblJ1bGUuUmVzdHJpY3RlZCkge1xuICAgICAgICAgICAgb3B0cy5qb2luUnVsZSA9IEpvaW5SdWxlLlJlc3RyaWN0ZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3B0cztcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gbW92ZSBmb2N1cyB0byBmaXJzdCBmaWVsZCB3aGVuIHNob3dpbmcgZGlhbG9nXG4gICAgICAgIHRoaXMubmFtZUZpZWxkLmN1cnJlbnQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBY2Nlc3NpYmlsaXR5QWN0aW9uKGV2ZW50KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5FbnRlcjpcbiAgICAgICAgICAgICAgICB0aGlzLm9uT2soKTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25PayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLm5hbWVGaWVsZC5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG4gICAgICAgIGlmICh0aGlzLmFsaWFzRmllbGQuY3VycmVudCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hbGlhc0ZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBWYWxpZGF0aW9uIGFuZCBzdGF0ZSB1cGRhdGVzIGFyZSBhc3luYywgc28gd2UgbmVlZCB0byB3YWl0IGZvciB0aGVtIHRvIGNvbXBsZXRlXG4gICAgICAgIC8vIGZpcnN0LiBRdWV1ZSBhIGBzZXRTdGF0ZWAgY2FsbGJhY2sgYW5kIHdhaXQgZm9yIGl0IHRvIHJlc29sdmUuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7fSwgcmVzb2x2ZSkpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5uYW1lSXNWYWxpZCAmJiAoIXRoaXMuYWxpYXNGaWVsZC5jdXJyZW50IHx8IHRoaXMuYWxpYXNGaWVsZC5jdXJyZW50LmlzVmFsaWQpKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSwgdGhpcy5yb29tQ3JlYXRlT3B0aW9ucygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBmaWVsZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5uYW1lSXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIGZpZWxkID0gdGhpcy5uYW1lRmllbGQuY3VycmVudDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbGlhc0ZpZWxkLmN1cnJlbnQgJiYgIXRoaXMuYWxpYXNGaWVsZC5jdXJyZW50LmlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICBmaWVsZCA9IHRoaXMuYWxpYXNGaWVsZC5jdXJyZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgZmllbGQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBmaWVsZC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlLCBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25OYW1lQ2hhbmdlID0gKGV2OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbmFtZTogZXYudGFyZ2V0LnZhbHVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVG9waWNDaGFuZ2UgPSAoZXY6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3BpYzogZXYudGFyZ2V0LnZhbHVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSm9pblJ1bGVDaGFuZ2UgPSAoam9pblJ1bGU6IEpvaW5SdWxlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBqb2luUnVsZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVuY3J5cHRlZENoYW5nZSA9IChpc0VuY3J5cHRlZDogYm9vbGVhbikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaXNFbmNyeXB0ZWQgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BbGlhc0NoYW5nZSA9IChhbGlhczogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBhbGlhcyB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRldGFpbHNUb2dnbGVkID0gKGV2OiBTeW50aGV0aWNFdmVudDxIVE1MRGV0YWlsc0VsZW1lbnQ+KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkZXRhaWxzT3BlbjogKGV2LnRhcmdldCBhcyBIVE1MRGV0YWlsc0VsZW1lbnQpLm9wZW4gfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ob0ZlZGVyYXRlQ2hhbmdlID0gKG5vRmVkZXJhdGU6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG5vRmVkZXJhdGUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25OYW1lVmFsaWRhdGUgPSBhc3luYyAoZmllbGRTdGF0ZTogSUZpZWxkU3RhdGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ3JlYXRlUm9vbURpYWxvZy52YWxpZGF0ZVJvb21OYW1lKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbmFtZUlzVmFsaWQ6IHJlc3VsdC52YWxpZCB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgdmFsaWRhdGVSb29tTmFtZSA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiBhc3luYyAoeyB2YWx1ZSB9KSA9PiAhIXZhbHVlLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiUGxlYXNlIGVudGVyIGEgbmFtZSBmb3IgdGhlIHJvb21cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBpc1ZpZGVvUm9vbSA9IHRoaXMucHJvcHMudHlwZSA9PT0gUm9vbVR5cGUuRWxlbWVudFZpZGVvO1xuXG4gICAgICAgIGxldCBhbGlhc0ZpZWxkOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuam9pblJ1bGUgPT09IEpvaW5SdWxlLlB1YmxpYykge1xuICAgICAgICAgICAgY29uc3QgZG9tYWluID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERvbWFpbigpO1xuICAgICAgICAgICAgYWxpYXNGaWVsZCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVJvb21EaWFsb2dfYWxpYXNDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJvb21BbGlhc0ZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuYWxpYXNGaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQWxpYXNDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW49e2RvbWFpbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmFsaWFzfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwdWJsaWNQcml2YXRlTGFiZWw6IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5qb2luUnVsZSA9PT0gSm9pblJ1bGUuUmVzdHJpY3RlZCkge1xuICAgICAgICAgICAgcHVibGljUHJpdmF0ZUxhYmVsID0gPHA+XG4gICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJFdmVyeW9uZSBpbiA8U3BhY2VOYW1lLz4gd2lsbCBiZSBhYmxlIHRvIGZpbmQgYW5kIGpvaW4gdGhpcyByb29tLlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgU3BhY2VOYW1lOiAoKSA9PiA8Yj57IHRoaXMucHJvcHMucGFyZW50U3BhY2UubmFtZSB9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICB7IF90KFwiWW91IGNhbiBjaGFuZ2UgdGhpcyBhdCBhbnkgdGltZSBmcm9tIHJvb20gc2V0dGluZ3MuXCIpIH1cbiAgICAgICAgICAgIDwvcD47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5qb2luUnVsZSA9PT0gSm9pblJ1bGUuUHVibGljICYmIHRoaXMucHJvcHMucGFyZW50U3BhY2UpIHtcbiAgICAgICAgICAgIHB1YmxpY1ByaXZhdGVMYWJlbCA9IDxwPlxuICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQW55b25lIHdpbGwgYmUgYWJsZSB0byBmaW5kIGFuZCBqb2luIHRoaXMgcm9vbSwgbm90IGp1c3QgbWVtYmVycyBvZiA8U3BhY2VOYW1lLz4uXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTcGFjZU5hbWU6ICgpID0+IDxiPnsgdGhpcy5wcm9wcy5wYXJlbnRTcGFjZS5uYW1lIH08L2I+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICZuYnNwO1xuICAgICAgICAgICAgICAgIHsgX3QoXCJZb3UgY2FuIGNoYW5nZSB0aGlzIGF0IGFueSB0aW1lIGZyb20gcm9vbSBzZXR0aW5ncy5cIikgfVxuICAgICAgICAgICAgPC9wPjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmpvaW5SdWxlID09PSBKb2luUnVsZS5QdWJsaWMpIHtcbiAgICAgICAgICAgIHB1YmxpY1ByaXZhdGVMYWJlbCA9IDxwPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJBbnlvbmUgd2lsbCBiZSBhYmxlIHRvIGZpbmQgYW5kIGpvaW4gdGhpcyByb29tLlwiKSB9XG4gICAgICAgICAgICAgICAgJm5ic3A7XG4gICAgICAgICAgICAgICAgeyBfdChcIllvdSBjYW4gY2hhbmdlIHRoaXMgYXQgYW55IHRpbWUgZnJvbSByb29tIHNldHRpbmdzLlwiKSB9XG4gICAgICAgICAgICA8L3A+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuam9pblJ1bGUgPT09IEpvaW5SdWxlLkludml0ZSkge1xuICAgICAgICAgICAgcHVibGljUHJpdmF0ZUxhYmVsID0gPHA+XG4gICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJPbmx5IHBlb3BsZSBpbnZpdGVkIHdpbGwgYmUgYWJsZSB0byBmaW5kIGFuZCBqb2luIHRoaXMgcm9vbS5cIixcbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICB7IF90KFwiWW91IGNhbiBjaGFuZ2UgdGhpcyBhdCBhbnkgdGltZSBmcm9tIHJvb20gc2V0dGluZ3MuXCIpIH1cbiAgICAgICAgICAgIDwvcD47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZTJlZVNlY3Rpb246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5qb2luUnVsZSAhPT0gSm9pblJ1bGUuUHVibGljKSB7XG4gICAgICAgICAgICBsZXQgbWljcm9jb3B5OiBzdHJpbmc7XG4gICAgICAgICAgICBpZiAocHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5jYW5DaGFuZ2VFbmNyeXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1pY3JvY29weSA9IGlzVmlkZW9Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiWW91IGNhbid0IGRpc2FibGUgdGhpcyBsYXRlci4gVGhlIHJvb20gd2lsbCBiZSBlbmNyeXB0ZWQgYnV0IHRoZSBlbWJlZGRlZCBjYWxsIHdpbGwgbm90LlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIllvdSBjYW4ndCBkaXNhYmxlIHRoaXMgbGF0ZXIuIEJyaWRnZXMgJiBtb3N0IGJvdHMgd29uJ3Qgd29yayB5ZXQuXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1pY3JvY29weSA9IF90KFwiWW91ciBzZXJ2ZXIgcmVxdWlyZXMgZW5jcnlwdGlvbiB0byBiZSBlbmFibGVkIGluIHByaXZhdGUgcm9vbXMuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWljcm9jb3B5ID0gX3QoXCJZb3VyIHNlcnZlciBhZG1pbiBoYXMgZGlzYWJsZWQgZW5kLXRvLWVuZCBlbmNyeXB0aW9uIGJ5IGRlZmF1bHQgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImluIHByaXZhdGUgcm9vbXMgJiBEaXJlY3QgTWVzc2FnZXMuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZTJlZVNlY3Rpb24gPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPExhYmVsbGVkVG9nZ2xlU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVuYWJsZSBlbmQtdG8tZW5kIGVuY3J5cHRpb25cIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRW5jcnlwdGVkQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5pc0VuY3J5cHRlZH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9DcmVhdGVSb29tRGlhbG9nX2UyZVN3aXRjaCcgLy8gZm9yIGVuZC10by1lbmQgdGVzdHNcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLmNhbkNoYW5nZUVuY3J5cHRpb259XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8cD57IG1pY3JvY29weSB9PC9wPlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZmVkZXJhdGVMYWJlbCA9IF90KFxuICAgICAgICAgICAgXCJZb3UgbWlnaHQgZW5hYmxlIHRoaXMgaWYgdGhlIHJvb20gd2lsbCBvbmx5IGJlIHVzZWQgZm9yIGNvbGxhYm9yYXRpbmcgd2l0aCBpbnRlcm5hbCBcIiArXG4gICAgICAgICAgICBcInRlYW1zIG9uIHlvdXIgaG9tZXNlcnZlci4gVGhpcyBjYW5ub3QgYmUgY2hhbmdlZCBsYXRlci5cIixcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKFNka0NvbmZpZy5nZXQoKS5kZWZhdWx0X2ZlZGVyYXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8gV2Ugb25seSBjaGFuZ2UgdGhlIGxhYmVsIGlmIHRoZSBkZWZhdWx0IHNldHRpbmcgaXMgZGlmZmVyZW50IHRvIGF2b2lkIGphcnJpbmcgdGV4dCBjaGFuZ2VzIHRvIHRoZVxuICAgICAgICAgICAgLy8gdXNlci4gVGhleSB3aWxsIGhhdmUgcmVhZCB0aGUgaW1wbGljYXRpb25zIG9mIHR1cm5pbmcgdGhpcyBvZmYvb24sIHNvIG5vIG5lZWQgdG8gcmVwaHJhc2UgZm9yIHRoZW0uXG4gICAgICAgICAgICBmZWRlcmF0ZUxhYmVsID0gX3QoXG4gICAgICAgICAgICAgICAgXCJZb3UgbWlnaHQgZGlzYWJsZSB0aGlzIGlmIHRoZSByb29tIHdpbGwgYmUgdXNlZCBmb3IgY29sbGFib3JhdGluZyB3aXRoIGV4dGVybmFsIFwiICtcbiAgICAgICAgICAgICAgICBcInRlYW1zIHdobyBoYXZlIHRoZWlyIG93biBob21lc2VydmVyLiBUaGlzIGNhbm5vdCBiZSBjaGFuZ2VkIGxhdGVyLlwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0aXRsZTogc3RyaW5nO1xuICAgICAgICBpZiAoaXNWaWRlb1Jvb20pIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJDcmVhdGUgYSB2aWRlbyByb29tXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucGFyZW50U3BhY2UpIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJDcmVhdGUgYSByb29tXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGl0bGUgPSB0aGlzLnN0YXRlLmpvaW5SdWxlID09PSBKb2luUnVsZS5QdWJsaWMgPyBfdCgnQ3JlYXRlIGEgcHVibGljIHJvb20nKSA6IF90KCdDcmVhdGUgYSBwcml2YXRlIHJvb20nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0NyZWF0ZVJvb21EaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICAgICAgc2NyZWVuTmFtZT1cIkNyZWF0ZVJvb21cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uT2t9IG9uS2V5RG93bj17dGhpcy5vbktleURvd259PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMubmFtZUZpZWxkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnTmFtZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTmFtZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uTmFtZVZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlUm9vbURpYWxvZ19uYW1lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ1RvcGljIChvcHRpb25hbCknKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblRvcGljQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnRvcGljfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0NyZWF0ZVJvb21EaWFsb2dfdG9waWNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPEpvaW5SdWxlRHJvcGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSb29tIHZpc2liaWxpdHlcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxJbnZpdGU9e190KFwiUHJpdmF0ZSByb29tIChpbnZpdGUgb25seSlcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxQdWJsaWM9e190KFwiUHVibGljIHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxSZXN0cmljdGVkPXt0aGlzLnN1cHBvcnRzUmVzdHJpY3RlZCA/IF90KFwiVmlzaWJsZSB0byBzcGFjZSBtZW1iZXJzXCIpIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmpvaW5SdWxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uSm9pblJ1bGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHB1YmxpY1ByaXZhdGVMYWJlbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGUyZWVTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYWxpYXNGaWVsZCB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGV0YWlscyBvblRvZ2dsZT17dGhpcy5vbkRldGFpbHNUb2dnbGVkfSBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nX2RldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3VtbWFyeSBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nX2RldGFpbHNfc3VtbWFyeVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZGV0YWlsc09wZW4gPyBfdCgnSGlkZSBhZHZhbmNlZCcpIDogX3QoJ1Nob3cgYWR2YW5jZWQnKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkJsb2NrIGFueW9uZSBub3QgcGFydCBvZiAlKHNlcnZlck5hbWUpcyBmcm9tIGV2ZXIgam9pbmluZyB0aGlzIHJvb20uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHNlcnZlck5hbWU6IE1hdHJpeENsaWVudFBlZy5nZXRIb21lc2VydmVyTmFtZSgpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTm9GZWRlcmF0ZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubm9GZWRlcmF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPnsgZmVkZXJhdGVMYWJlbCB9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kZXRhaWxzPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17aXNWaWRlb1Jvb20gPyBfdCgnQ3JlYXRlIHZpZGVvIHJvb20nKSA6IF90KCdDcmVhdGUgcm9vbScpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbk9rfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbH0gLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE0Q2UsTUFBTUEsZ0JBQU4sU0FBK0JDLGNBQUEsQ0FBTUMsU0FBckMsQ0FBK0Q7RUFLMUVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0lBQ2YsTUFBTUEsS0FBTjtJQURlO0lBQUEsOERBSEMsSUFBQUMsZ0JBQUEsR0FHRDtJQUFBLCtEQUZFLElBQUFBLGdCQUFBLEdBRUY7SUFBQSxpREFxRUVDLEtBQUQsSUFBMEI7TUFDMUMsTUFBTUMsTUFBTSxHQUFHLElBQUFDLHlDQUFBLElBQXdCQyxzQkFBeEIsQ0FBK0NILEtBQS9DLENBQWY7O01BQ0EsUUFBUUMsTUFBUjtRQUNJLEtBQUtHLG1DQUFBLENBQWlCQyxLQUF0QjtVQUNJLEtBQUtDLElBQUw7VUFDQU4sS0FBSyxDQUFDTyxjQUFOO1VBQ0FQLEtBQUssQ0FBQ1Es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