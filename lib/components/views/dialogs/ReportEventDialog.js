"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _createRoom = require("../../../createRoom");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Markdown = _interopRequireDefault(require("../../../Markdown"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _StyledRadioButton = _interopRequireDefault(require("../elements/StyledRadioButton"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _LabelledCheckbox = _interopRequireDefault(require("../elements/LabelledCheckbox"));

/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2022 The Matrix.org Foundation C.I.C.

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
const MODERATED_BY_STATE_EVENT_TYPE = ["org.matrix.msc3215.room.moderation.moderated_by"
/**
 * Unprefixed state event. Not ready for prime time.
 *
 * "m.room.moderation.moderated_by"
 */
];
const ABUSE_EVENT_TYPE = "org.matrix.msc3215.abuse.report"; // Standard abuse natures.

var Nature;

(function (Nature) {
  Nature["Disagreement"] = "org.matrix.msc3215.abuse.nature.disagreement";
  Nature["Toxic"] = "org.matrix.msc3215.abuse.nature.toxic";
  Nature["Illegal"] = "org.matrix.msc3215.abuse.nature.illegal";
  Nature["Spam"] = "org.matrix.msc3215.abuse.nature.spam";
  Nature["Other"] = "org.matrix.msc3215.abuse.nature.other";
})(Nature || (Nature = {}));

var NonStandardValue;

(function (NonStandardValue) {
  NonStandardValue["Admin"] = "non-standard.abuse.nature.admin";
})(NonStandardValue || (NonStandardValue = {}));

/*
 * A dialog for reporting an event.
 *
 * The actual content of the dialog will depend on two things:
 *
 * 1. Is `feature_report_to_moderators` enabled?
 * 2. Does the room support moderation as per MSC3215, i.e. is there
 *    a well-formed state event `m.room.moderation.moderated_by`
 *    /`org.matrix.msc3215.room.moderation.moderated_by`?
 */
class ReportEventDialog extends _react.default.Component {
  // If the room supports moderation, the moderation information.
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "moderation", void 0);
    (0, _defineProperty2.default)(this, "onIgnoreUserTooChanged", newVal => {
      this.setState({
        ignoreUserToo: newVal
      });
    });
    (0, _defineProperty2.default)(this, "onReasonChange", _ref => {
      let {
        target: {
          value: reason
        }
      } = _ref;
      this.setState({
        reason
      });
    });
    (0, _defineProperty2.default)(this, "onNatureChosen", e => {
      this.setState({
        nature: e.currentTarget.value
      });
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onSubmit", async () => {
      let reason = this.state.reason || "";
      reason = reason.trim();

      if (this.moderation) {
        // This room supports moderation.
        // We need a nature.
        // If the nature is `NATURE.OTHER` or `NON_STANDARD_NATURE.ADMIN`, we also need a `reason`.
        if (!this.state.nature || (this.state.nature == Nature.Other || this.state.nature == NonStandardValue.Admin) && !reason) {
          this.setState({
            err: (0, _languageHandler._t)("Please fill why you're reporting.")
          });
          return;
        }
      } else {
        // This room does not support moderation.
        // We need a `reason`.
        if (!reason) {
          this.setState({
            err: (0, _languageHandler._t)("Please fill why you're reporting.")
          });
          return;
        }
      }

      this.setState({
        busy: true,
        err: null
      });

      try {
        const client = _MatrixClientPeg.MatrixClientPeg.get();

        const ev = this.props.mxEvent;

        if (this.moderation && this.state.nature !== NonStandardValue.Admin) {
          const nature = this.state.nature; // Report to moderators through to the dedicated bot,
          // as configured in the room's state events.

          const dmRoomId = await (0, _createRoom.ensureDMExists)(client, this.moderation.moderationBotUserId);
          await client.sendEvent(dmRoomId, ABUSE_EVENT_TYPE, {
            event_id: ev.getId(),
            room_id: ev.getRoomId(),
            moderated_by_id: this.moderation.moderationRoomId,
            nature,
            reporter: client.getUserId(),
            comment: this.state.reason.trim()
          });
        } else {
          // Report to homeserver admin through the dedicated Matrix API.
          await client.reportEvent(ev.getRoomId(), ev.getId(), -100, this.state.reason.trim());
        } // if the user should also be ignored, do that


        if (this.state.ignoreUserToo) {
          await client.setIgnoredUsers([...client.getIgnoredUsers(), ev.getSender()]);
        }

        this.props.onFinished(true);
      } catch (e) {
        _logger.logger.error(e);

        this.setState({
          busy: false,
          err: e.message
        });
      }
    });
    let moderatedByRoomId = null;
    let moderatedByUserId = null;

    if (_SettingsStore.default.getValue("feature_report_to_moderators")) {
      // The client supports reporting to moderators.
      // Does the room support it, too?
      // Extract state events to determine whether we should display
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const room = client.getRoom(props.mxEvent.getRoomId());

      for (const stateEventType of MODERATED_BY_STATE_EVENT_TYPE) {
        const stateEvent = room.currentState.getStateEvents(stateEventType, stateEventType);

        if (!stateEvent) {
          continue;
        }

        if (Array.isArray(stateEvent)) {
          // Internal error.
          throw new TypeError(`getStateEvents(${stateEventType}, ${stateEventType}) ` + "should return at most one state event");
        }

        const event = stateEvent.event;

        if (!("content" in event) || typeof event["content"] != "object") {
          // The room is improperly configured.
          // Display this debug message for the sake of moderators.
          console.debug("Moderation error", "state event", stateEventType, "should have an object field `content`, got", event);
          continue;
        }

        const content = event["content"];

        if (!("room_id" in content) || typeof content["room_id"] != "string") {
          // The room is improperly configured.
          // Display this debug message for the sake of moderators.
          console.debug("Moderation error", "state event", stateEventType, "should have a string field `content.room_id`, got", event);
          continue;
        }

        if (!("user_id" in content) || typeof content["user_id"] != "string") {
          // The room is improperly configured.
          // Display this debug message for the sake of moderators.
          console.debug("Moderation error", "state event", stateEventType, "should have a string field `content.user_id`, got", event);
          continue;
        }

        moderatedByRoomId = content["room_id"];
        moderatedByUserId = content["user_id"];
      }

      if (moderatedByRoomId && moderatedByUserId) {
        // The room supports moderation.
        this.moderation = {
          moderationRoomId: moderatedByRoomId,
          moderationBotUserId: moderatedByUserId
        };
      }
    }

    this.state = {
      // A free-form text describing the abuse.
      reason: "",
      busy: false,
      err: null,
      // If specified, the nature of the abuse, as specified by MSC3215.
      nature: null,
      ignoreUserToo: false // default false, for now. Could easily be argued as default true

    };
  }

  render() {
    let error = null;

    if (this.state.err) {
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, this.state.err);
    }

    let progress = null;

    if (this.state.busy) {
      progress = /*#__PURE__*/_react.default.createElement("div", {
        className: "progress"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    const ignoreUserCheckbox = /*#__PURE__*/_react.default.createElement(_LabelledCheckbox.default, {
      value: this.state.ignoreUserToo,
      label: (0, _languageHandler._t)("Ignore user"),
      byline: (0, _languageHandler._t)("Check if you want to hide all current and future messages from this user."),
      onChange: this.onIgnoreUserTooChanged,
      disabled: this.state.busy
    });

    const adminMessageMD = _SdkConfig.default.getObject("report_event")?.get("admin_message_md", "adminMessageMD");
    let adminMessage;

    if (adminMessageMD) {
      const html = new _Markdown.default(adminMessageMD).toHTML({
        externalLinks: true
      });
      adminMessage = /*#__PURE__*/_react.default.createElement("p", {
        dangerouslySetInnerHTML: {
          __html: html
        }
      });
    }

    if (this.moderation) {
      // Display report-to-moderator dialog.
      // We let the user pick a nature.
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const homeServerName = _SdkConfig.default.get("validated_server_config").hsName;

      let subtitle;

      switch (this.state.nature) {
        case Nature.Disagreement:
          subtitle = (0, _languageHandler._t)("What this user is writing is wrong.\n" + "This will be reported to the room moderators.");
          break;

        case Nature.Toxic:
          subtitle = (0, _languageHandler._t)("This user is displaying toxic behaviour, " + "for instance by insulting other users or sharing " + " adult-only content in a family-friendly room " + " or otherwise violating the rules of this room.\n" + "This will be reported to the room moderators.");
          break;

        case Nature.Illegal:
          subtitle = (0, _languageHandler._t)("This user is displaying illegal behaviour, " + "for instance by doxing people or threatening violence.\n" + "This will be reported to the room moderators who may escalate this to legal authorities.");
          break;

        case Nature.Spam:
          subtitle = (0, _languageHandler._t)("This user is spamming the room with ads, links to ads or to propaganda.\n" + "This will be reported to the room moderators.");
          break;

        case NonStandardValue.Admin:
          if (client.isRoomEncrypted(this.props.mxEvent.getRoomId())) {
            subtitle = (0, _languageHandler._t)("This room is dedicated to illegal or toxic content " + "or the moderators fail to moderate illegal or toxic content.\n" + "This will be reported to the administrators of %(homeserver)s. " + "The administrators will NOT be able to read the encrypted content of this room.", {
              homeserver: homeServerName
            });
          } else {
            subtitle = (0, _languageHandler._t)("This room is dedicated to illegal or toxic content " + "or the moderators fail to moderate illegal or toxic content.\n" + " This will be reported to the administrators of %(homeserver)s.", {
              homeserver: homeServerName
            });
          }

          break;

        case Nature.Other:
          subtitle = (0, _languageHandler._t)("Any other reason. Please describe the problem.\n" + "This will be reported to the room moderators.");
          break;

        default:
          subtitle = (0, _languageHandler._t)("Please pick a nature and describe what makes this message abusive.");
          break;
      }

      return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
        className: "mx_ReportEventDialog",
        onFinished: this.props.onFinished,
        title: (0, _languageHandler._t)('Report Content'),
        contentId: "mx_ReportEventDialog"
      }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
        name: "nature",
        value: Nature.Disagreement,
        checked: this.state.nature == Nature.Disagreement,
        onChange: this.onNatureChosen
      }, (0, _languageHandler._t)('Disagree')), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
        name: "nature",
        value: Nature.Toxic,
        checked: this.state.nature == Nature.Toxic,
        onChange: this.onNatureChosen
      }, (0, _languageHandler._t)('Toxic Behaviour')), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
        name: "nature",
        value: Nature.Illegal,
        checked: this.state.nature == Nature.Illegal,
        onChange: this.onNatureChosen
      }, (0, _languageHandler._t)('Illegal Content')), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
        name: "nature",
        value: Nature.Spam,
        checked: this.state.nature == Nature.Spam,
        onChange: this.onNatureChosen
      }, (0, _languageHandler._t)('Spam or propaganda')), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
        name: "nature",
        value: NonStandardValue.Admin,
        checked: this.state.nature == NonStandardValue.Admin,
        onChange: this.onNatureChosen
      }, (0, _languageHandler._t)('Report the entire room')), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
        name: "nature",
        value: Nature.Other,
        checked: this.state.nature == Nature.Other,
        onChange: this.onNatureChosen
      }, (0, _languageHandler._t)('Other')), /*#__PURE__*/_react.default.createElement("p", null, subtitle), /*#__PURE__*/_react.default.createElement(_Field.default, {
        className: "mx_ReportEventDialog_reason",
        element: "textarea",
        label: (0, _languageHandler._t)("Reason"),
        rows: 5,
        onChange: this.onReasonChange,
        value: this.state.reason,
        disabled: this.state.busy
      }), progress, error, ignoreUserCheckbox), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("Send report"),
        onPrimaryButtonClick: this.onSubmit,
        focus: true,
        onCancel: this.onCancel,
        disabled: this.state.busy
      }));
    } // Report to homeserver admin.
    // Currently, the API does not support natures.


    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_ReportEventDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)('Report Content to Your Homeserver Administrator'),
      contentId: "mx_ReportEventDialog"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ReportEventDialog",
      id: "mx_ReportEventDialog"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Reporting this message will send its unique 'event ID' to the administrator of " + "your homeserver. If messages in this room are encrypted, your homeserver " + "administrator will not be able to read the message text or view any files " + "or images.")), adminMessage, /*#__PURE__*/_react.default.createElement(_Field.default, {
      className: "mx_ReportEventDialog_reason",
      element: "textarea",
      label: (0, _languageHandler._t)("Reason"),
      rows: 5,
      onChange: this.onReasonChange,
      value: this.state.reason,
      disabled: this.state.busy
    }), progress, error, ignoreUserCheckbox), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Send report"),
      onPrimaryButtonClick: this.onSubmit,
      focus: true,
      onCancel: this.onCancel,
      disabled: this.state.busy
    }));
  }

}

exports.default = ReportEventDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNT0RFUkFURURfQllfU1RBVEVfRVZFTlRfVFlQRSIsIkFCVVNFX0VWRU5UX1RZUEUiLCJOYXR1cmUiLCJOb25TdGFuZGFyZFZhbHVlIiwiUmVwb3J0RXZlbnREaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJuZXdWYWwiLCJzZXRTdGF0ZSIsImlnbm9yZVVzZXJUb28iLCJ0YXJnZXQiLCJ2YWx1ZSIsInJlYXNvbiIsImUiLCJuYXR1cmUiLCJjdXJyZW50VGFyZ2V0Iiwib25GaW5pc2hlZCIsInN0YXRlIiwidHJpbSIsIm1vZGVyYXRpb24iLCJPdGhlciIsIkFkbWluIiwiZXJyIiwiX3QiLCJidXN5IiwiY2xpZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZXYiLCJteEV2ZW50IiwiZG1Sb29tSWQiLCJlbnN1cmVETUV4aXN0cyIsIm1vZGVyYXRpb25Cb3RVc2VySWQiLCJzZW5kRXZlbnQiLCJldmVudF9pZCIsImdldElkIiwicm9vbV9pZCIsImdldFJvb21JZCIsIm1vZGVyYXRlZF9ieV9pZCIsIm1vZGVyYXRpb25Sb29tSWQiLCJyZXBvcnRlciIsImdldFVzZXJJZCIsImNvbW1lbnQiLCJyZXBvcnRFdmVudCIsInNldElnbm9yZWRVc2VycyIsImdldElnbm9yZWRVc2VycyIsImdldFNlbmRlciIsImxvZ2dlciIsImVycm9yIiwibWVzc2FnZSIsIm1vZGVyYXRlZEJ5Um9vbUlkIiwibW9kZXJhdGVkQnlVc2VySWQiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJyb29tIiwiZ2V0Um9vbSIsInN0YXRlRXZlbnRUeXBlIiwic3RhdGVFdmVudCIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiQXJyYXkiLCJpc0FycmF5IiwiVHlwZUVycm9yIiwiZXZlbnQiLCJjb25zb2xlIiwiZGVidWciLCJjb250ZW50IiwicmVuZGVyIiwicHJvZ3Jlc3MiLCJpZ25vcmVVc2VyQ2hlY2tib3giLCJvbklnbm9yZVVzZXJUb29DaGFuZ2VkIiwiYWRtaW5NZXNzYWdlTUQiLCJTZGtDb25maWciLCJnZXRPYmplY3QiLCJhZG1pbk1lc3NhZ2UiLCJodG1sIiwiTWFya2Rvd24iLCJ0b0hUTUwiLCJleHRlcm5hbExpbmtzIiwiX19odG1sIiwiaG9tZVNlcnZlck5hbWUiLCJoc05hbWUiLCJzdWJ0aXRsZSIsIkRpc2FncmVlbWVudCIsIlRveGljIiwiSWxsZWdhbCIsIlNwYW0iLCJpc1Jvb21FbmNyeXB0ZWQiLCJob21lc2VydmVyIiwib25OYXR1cmVDaG9zZW4iLCJvblJlYXNvbkNoYW5nZSIsIm9uU3VibWl0Iiwib25DYW5jZWwiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1JlcG9ydEV2ZW50RGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZW5zdXJlRE1FeGlzdHMgfSBmcm9tIFwiLi4vLi4vLi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uLy4uLy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgTWFya2Rvd24gZnJvbSAnLi4vLi4vLi4vTWFya2Rvd24nO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBTdHlsZWRSYWRpb0J1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkUmFkaW9CdXR0b25cIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IExhYmVsbGVkQ2hlY2tib3ggZnJvbSBcIi4uL2VsZW1lbnRzL0xhYmVsbGVkQ2hlY2tib3hcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIC8vIEEgZnJlZS1mb3JtIHRleHQgZGVzY3JpYmluZyB0aGUgYWJ1c2UuXG4gICAgcmVhc29uOiBzdHJpbmc7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICBlcnI/OiBzdHJpbmc7XG4gICAgLy8gSWYgd2Uga25vdyBpdCwgdGhlIG5hdHVyZSBvZiB0aGUgYWJ1c2UsIGFzIHNwZWNpZmllZCBieSBNU0MzMjE1LlxuICAgIG5hdHVyZT86IEV4dGVuZGVkTmF0dXJlO1xuICAgIGlnbm9yZVVzZXJUb286IGJvb2xlYW47IC8vIGlmIHRydWUsIHVzZXIgd2lsbCBiZSBpZ25vcmVkL2Jsb2NrZWQgb24gc3VibWl0XG59XG5cbmNvbnN0IE1PREVSQVRFRF9CWV9TVEFURV9FVkVOVF9UWVBFID0gW1xuICAgIFwib3JnLm1hdHJpeC5tc2MzMjE1LnJvb20ubW9kZXJhdGlvbi5tb2RlcmF0ZWRfYnlcIixcbiAgICAvKipcbiAgICAgKiBVbnByZWZpeGVkIHN0YXRlIGV2ZW50LiBOb3QgcmVhZHkgZm9yIHByaW1lIHRpbWUuXG4gICAgICpcbiAgICAgKiBcIm0ucm9vbS5tb2RlcmF0aW9uLm1vZGVyYXRlZF9ieVwiXG4gICAgICovXG5dO1xuXG5jb25zdCBBQlVTRV9FVkVOVF9UWVBFID0gXCJvcmcubWF0cml4Lm1zYzMyMTUuYWJ1c2UucmVwb3J0XCI7XG5cbi8vIFN0YW5kYXJkIGFidXNlIG5hdHVyZXMuXG5lbnVtIE5hdHVyZSB7XG4gICAgRGlzYWdyZWVtZW50ID0gXCJvcmcubWF0cml4Lm1zYzMyMTUuYWJ1c2UubmF0dXJlLmRpc2FncmVlbWVudFwiLFxuICAgIFRveGljID0gXCJvcmcubWF0cml4Lm1zYzMyMTUuYWJ1c2UubmF0dXJlLnRveGljXCIsXG4gICAgSWxsZWdhbCA9IFwib3JnLm1hdHJpeC5tc2MzMjE1LmFidXNlLm5hdHVyZS5pbGxlZ2FsXCIsXG4gICAgU3BhbSA9IFwib3JnLm1hdHJpeC5tc2MzMjE1LmFidXNlLm5hdHVyZS5zcGFtXCIsXG4gICAgT3RoZXIgPSBcIm9yZy5tYXRyaXgubXNjMzIxNS5hYnVzZS5uYXR1cmUub3RoZXJcIixcbn1cblxuZW51bSBOb25TdGFuZGFyZFZhbHVlIHtcbiAgICAvLyBOb24tc3RhbmRhcmQgYWJ1c2UgbmF0dXJlLlxuICAgIC8vIEl0IHNob3VsZCBuZXZlciBsZWF2ZSB0aGUgY2xpZW50IC0gd2UgdXNlIGl0IHRvIGZhbGxiYWNrIHRvXG4gICAgLy8gc2VydmVyLXdpZGUgYWJ1c2UgcmVwb3J0aW5nLlxuICAgIEFkbWluID0gXCJub24tc3RhbmRhcmQuYWJ1c2UubmF0dXJlLmFkbWluXCJcbn1cblxudHlwZSBFeHRlbmRlZE5hdHVyZSA9IE5hdHVyZSB8IE5vblN0YW5kYXJkVmFsdWU7XG5cbnR5cGUgTW9kZXJhdGlvbiA9IHtcbiAgICAvLyBUaGUgaWQgb2YgdGhlIG1vZGVyYXRpb24gcm9vbS5cbiAgICBtb2RlcmF0aW9uUm9vbUlkOiBzdHJpbmc7XG4gICAgLy8gVGhlIGlkIG9mIHRoZSBib3QgaW4gY2hhcmdlIG9mIGZvcndhcmRpbmcgYWJ1c2UgcmVwb3J0cyB0byB0aGUgbW9kZXJhdGlvbiByb29tLlxuICAgIG1vZGVyYXRpb25Cb3RVc2VySWQ6IHN0cmluZztcbn07XG4vKlxuICogQSBkaWFsb2cgZm9yIHJlcG9ydGluZyBhbiBldmVudC5cbiAqXG4gKiBUaGUgYWN0dWFsIGNvbnRlbnQgb2YgdGhlIGRpYWxvZyB3aWxsIGRlcGVuZCBvbiB0d28gdGhpbmdzOlxuICpcbiAqIDEuIElzIGBmZWF0dXJlX3JlcG9ydF90b19tb2RlcmF0b3JzYCBlbmFibGVkP1xuICogMi4gRG9lcyB0aGUgcm9vbSBzdXBwb3J0IG1vZGVyYXRpb24gYXMgcGVyIE1TQzMyMTUsIGkuZS4gaXMgdGhlcmVcbiAqICAgIGEgd2VsbC1mb3JtZWQgc3RhdGUgZXZlbnQgYG0ucm9vbS5tb2RlcmF0aW9uLm1vZGVyYXRlZF9ieWBcbiAqICAgIC9gb3JnLm1hdHJpeC5tc2MzMjE1LnJvb20ubW9kZXJhdGlvbi5tb2RlcmF0ZWRfYnlgP1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBvcnRFdmVudERpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIC8vIElmIHRoZSByb29tIHN1cHBvcnRzIG1vZGVyYXRpb24sIHRoZSBtb2RlcmF0aW9uIGluZm9ybWF0aW9uLlxuICAgIHByaXZhdGUgbW9kZXJhdGlvbj86IE1vZGVyYXRpb247XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBsZXQgbW9kZXJhdGVkQnlSb29tSWQgPSBudWxsO1xuICAgICAgICBsZXQgbW9kZXJhdGVkQnlVc2VySWQgPSBudWxsO1xuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9yZXBvcnRfdG9fbW9kZXJhdG9yc1wiKSkge1xuICAgICAgICAgICAgLy8gVGhlIGNsaWVudCBzdXBwb3J0cyByZXBvcnRpbmcgdG8gbW9kZXJhdG9ycy5cbiAgICAgICAgICAgIC8vIERvZXMgdGhlIHJvb20gc3VwcG9ydCBpdCwgdG9vP1xuXG4gICAgICAgICAgICAvLyBFeHRyYWN0IHN0YXRlIGV2ZW50cyB0byBkZXRlcm1pbmUgd2hldGhlciB3ZSBzaG91bGQgZGlzcGxheVxuICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN0YXRlRXZlbnRUeXBlIG9mIE1PREVSQVRFRF9CWV9TVEFURV9FVkVOVF9UWVBFKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKHN0YXRlRXZlbnRUeXBlLCBzdGF0ZUV2ZW50VHlwZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGF0ZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShzdGF0ZUV2ZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBlcnJvci5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZ2V0U3RhdGVFdmVudHMoJHtzdGF0ZUV2ZW50VHlwZX0sICR7c3RhdGVFdmVudFR5cGV9KSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic2hvdWxkIHJldHVybiBhdCBtb3N0IG9uZSBzdGF0ZSBldmVudFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBzdGF0ZUV2ZW50LmV2ZW50O1xuICAgICAgICAgICAgICAgIGlmICghKFwiY29udGVudFwiIGluIGV2ZW50KSB8fCB0eXBlb2YgZXZlbnRbXCJjb250ZW50XCJdICE9IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHJvb20gaXMgaW1wcm9wZXJseSBjb25maWd1cmVkLlxuICAgICAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IHRoaXMgZGVidWcgbWVzc2FnZSBmb3IgdGhlIHNha2Ugb2YgbW9kZXJhdG9ycy5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhcIk1vZGVyYXRpb24gZXJyb3JcIiwgXCJzdGF0ZSBldmVudFwiLCBzdGF0ZUV2ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic2hvdWxkIGhhdmUgYW4gb2JqZWN0IGZpZWxkIGBjb250ZW50YCwgZ290XCIsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBldmVudFtcImNvbnRlbnRcIl07XG4gICAgICAgICAgICAgICAgaWYgKCEoXCJyb29tX2lkXCIgaW4gY29udGVudCkgfHwgdHlwZW9mIGNvbnRlbnRbXCJyb29tX2lkXCJdICE9IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHJvb20gaXMgaW1wcm9wZXJseSBjb25maWd1cmVkLlxuICAgICAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IHRoaXMgZGVidWcgbWVzc2FnZSBmb3IgdGhlIHNha2Ugb2YgbW9kZXJhdG9ycy5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhcIk1vZGVyYXRpb24gZXJyb3JcIiwgXCJzdGF0ZSBldmVudFwiLCBzdGF0ZUV2ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic2hvdWxkIGhhdmUgYSBzdHJpbmcgZmllbGQgYGNvbnRlbnQucm9vbV9pZGAsIGdvdFwiLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIShcInVzZXJfaWRcIiBpbiBjb250ZW50KSB8fCB0eXBlb2YgY29udGVudFtcInVzZXJfaWRcIl0gIT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcm9vbSBpcyBpbXByb3Blcmx5IGNvbmZpZ3VyZWQuXG4gICAgICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgdGhpcyBkZWJ1ZyBtZXNzYWdlIGZvciB0aGUgc2FrZSBvZiBtb2RlcmF0b3JzLlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKFwiTW9kZXJhdGlvbiBlcnJvclwiLCBcInN0YXRlIGV2ZW50XCIsIHN0YXRlRXZlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzaG91bGQgaGF2ZSBhIHN0cmluZyBmaWVsZCBgY29udGVudC51c2VyX2lkYCwgZ290XCIsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZGVyYXRlZEJ5Um9vbUlkID0gY29udGVudFtcInJvb21faWRcIl07XG4gICAgICAgICAgICAgICAgbW9kZXJhdGVkQnlVc2VySWQgPSBjb250ZW50W1widXNlcl9pZFwiXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1vZGVyYXRlZEJ5Um9vbUlkICYmIG1vZGVyYXRlZEJ5VXNlcklkKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHJvb20gc3VwcG9ydHMgbW9kZXJhdGlvbi5cbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVyYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVyYXRpb25Sb29tSWQ6IG1vZGVyYXRlZEJ5Um9vbUlkLFxuICAgICAgICAgICAgICAgICAgICBtb2RlcmF0aW9uQm90VXNlcklkOiBtb2RlcmF0ZWRCeVVzZXJJZCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIEEgZnJlZS1mb3JtIHRleHQgZGVzY3JpYmluZyB0aGUgYWJ1c2UuXG4gICAgICAgICAgICByZWFzb246IFwiXCIsXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGVycjogbnVsbCxcbiAgICAgICAgICAgIC8vIElmIHNwZWNpZmllZCwgdGhlIG5hdHVyZSBvZiB0aGUgYWJ1c2UsIGFzIHNwZWNpZmllZCBieSBNU0MzMjE1LlxuICAgICAgICAgICAgbmF0dXJlOiBudWxsLFxuICAgICAgICAgICAgaWdub3JlVXNlclRvbzogZmFsc2UsIC8vIGRlZmF1bHQgZmFsc2UsIGZvciBub3cuIENvdWxkIGVhc2lseSBiZSBhcmd1ZWQgYXMgZGVmYXVsdCB0cnVlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbklnbm9yZVVzZXJUb29DaGFuZ2VkID0gKG5ld1ZhbDogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaWdub3JlVXNlclRvbzogbmV3VmFsIH0pO1xuICAgIH07XG5cbiAgICAvLyBUaGUgdXNlciBoYXMgd3JpdHRlbiBkb3duIGEgZnJlZWZvcm0gZGVzY3JpcHRpb24gb2YgdGhlIGFidXNlLlxuICAgIHByaXZhdGUgb25SZWFzb25DaGFuZ2UgPSAoeyB0YXJnZXQ6IHsgdmFsdWU6IHJlYXNvbiB9IH0pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlYXNvbiB9KTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIHVzZXIgaGFzIGNsaWNrZWQgb24gYSBuYXR1cmUuXG4gICAgcHJpdmF0ZSBvbk5hdHVyZUNob3NlbiA9IChlOiBSZWFjdC5Gb3JtRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG5hdHVyZTogZS5jdXJyZW50VGFyZ2V0LnZhbHVlIGFzIEV4dGVuZGVkTmF0dXJlIH0pO1xuICAgIH07XG5cbiAgICAvLyBUaGUgdXNlciBoYXMgY2xpY2tlZCBcImNhbmNlbFwiLlxuICAgIHByaXZhdGUgb25DYW5jZWwgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIC8vIFRoZSB1c2VyIGhhcyBjbGlja2VkIFwic3VibWl0XCIuXG4gICAgcHJpdmF0ZSBvblN1Ym1pdCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IHJlYXNvbiA9IHRoaXMuc3RhdGUucmVhc29uIHx8IFwiXCI7XG4gICAgICAgIHJlYXNvbiA9IHJlYXNvbi50cmltKCk7XG4gICAgICAgIGlmICh0aGlzLm1vZGVyYXRpb24pIHtcbiAgICAgICAgICAgIC8vIFRoaXMgcm9vbSBzdXBwb3J0cyBtb2RlcmF0aW9uLlxuICAgICAgICAgICAgLy8gV2UgbmVlZCBhIG5hdHVyZS5cbiAgICAgICAgICAgIC8vIElmIHRoZSBuYXR1cmUgaXMgYE5BVFVSRS5PVEhFUmAgb3IgYE5PTl9TVEFOREFSRF9OQVRVUkUuQURNSU5gLCB3ZSBhbHNvIG5lZWQgYSBgcmVhc29uYC5cbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5uYXR1cmUgfHxcbiAgICAgICAgICAgICAgICAgICAgKCh0aGlzLnN0YXRlLm5hdHVyZSA9PSBOYXR1cmUuT3RoZXIgfHwgdGhpcy5zdGF0ZS5uYXR1cmUgPT0gTm9uU3RhbmRhcmRWYWx1ZS5BZG1pbilcbiAgICAgICAgICAgICAgICAgICAgICAgICYmICFyZWFzb24pXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyOiBfdChcIlBsZWFzZSBmaWxsIHdoeSB5b3UncmUgcmVwb3J0aW5nLlwiKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIHJvb20gZG9lcyBub3Qgc3VwcG9ydCBtb2RlcmF0aW9uLlxuICAgICAgICAgICAgLy8gV2UgbmVlZCBhIGByZWFzb25gLlxuICAgICAgICAgICAgaWYgKCFyZWFzb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyOiBfdChcIlBsZWFzZSBmaWxsIHdoeSB5b3UncmUgcmVwb3J0aW5nLlwiKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBlcnI6IG51bGwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCBldiA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVyYXRpb24gJiYgdGhpcy5zdGF0ZS5uYXR1cmUgIT09IE5vblN0YW5kYXJkVmFsdWUuQWRtaW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYXR1cmU6IE5hdHVyZSA9IHRoaXMuc3RhdGUubmF0dXJlO1xuXG4gICAgICAgICAgICAgICAgLy8gUmVwb3J0IHRvIG1vZGVyYXRvcnMgdGhyb3VnaCB0byB0aGUgZGVkaWNhdGVkIGJvdCxcbiAgICAgICAgICAgICAgICAvLyBhcyBjb25maWd1cmVkIGluIHRoZSByb29tJ3Mgc3RhdGUgZXZlbnRzLlxuICAgICAgICAgICAgICAgIGNvbnN0IGRtUm9vbUlkID0gYXdhaXQgZW5zdXJlRE1FeGlzdHMoY2xpZW50LCB0aGlzLm1vZGVyYXRpb24ubW9kZXJhdGlvbkJvdFVzZXJJZCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LnNlbmRFdmVudChkbVJvb21JZCwgQUJVU0VfRVZFTlRfVFlQRSwge1xuICAgICAgICAgICAgICAgICAgICBldmVudF9pZDogZXYuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogZXYuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgIG1vZGVyYXRlZF9ieV9pZDogdGhpcy5tb2RlcmF0aW9uLm1vZGVyYXRpb25Sb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIG5hdHVyZSxcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ZXI6IGNsaWVudC5nZXRVc2VySWQoKSxcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogdGhpcy5zdGF0ZS5yZWFzb24udHJpbSgpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBSZXBvcnQgdG8gaG9tZXNlcnZlciBhZG1pbiB0aHJvdWdoIHRoZSBkZWRpY2F0ZWQgTWF0cml4IEFQSS5cbiAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQucmVwb3J0RXZlbnQoZXYuZ2V0Um9vbUlkKCksIGV2LmdldElkKCksIC0xMDAsIHRoaXMuc3RhdGUucmVhc29uLnRyaW0oKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIHNob3VsZCBhbHNvIGJlIGlnbm9yZWQsIGRvIHRoYXRcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmlnbm9yZVVzZXJUb28pIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQuc2V0SWdub3JlZFVzZXJzKFtcbiAgICAgICAgICAgICAgICAgICAgLi4uY2xpZW50LmdldElnbm9yZWRVc2VycygpLFxuICAgICAgICAgICAgICAgICAgICBldi5nZXRTZW5kZXIoKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnI6IGUubWVzc2FnZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycikge1xuICAgICAgICAgICAgZXJyb3IgPSA8ZGl2IGNsYXNzTmFtZT1cImVycm9yXCI+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVyciB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJvZ3Jlc3MgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5idXN5KSB7XG4gICAgICAgICAgICBwcm9ncmVzcyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByb2dyZXNzXCI+XG4gICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaWdub3JlVXNlckNoZWNrYm94ID0gPExhYmVsbGVkQ2hlY2tib3hcbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmlnbm9yZVVzZXJUb299XG4gICAgICAgICAgICBsYWJlbD17X3QoXCJJZ25vcmUgdXNlclwiKX1cbiAgICAgICAgICAgIGJ5bGluZT17X3QoXCJDaGVjayBpZiB5b3Ugd2FudCB0byBoaWRlIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgbWVzc2FnZXMgZnJvbSB0aGlzIHVzZXIuXCIpfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25JZ25vcmVVc2VyVG9vQ2hhbmdlZH1cbiAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgIC8+O1xuXG4gICAgICAgIGNvbnN0IGFkbWluTWVzc2FnZU1EID0gU2RrQ29uZmlnXG4gICAgICAgICAgICAuZ2V0T2JqZWN0KFwicmVwb3J0X2V2ZW50XCIpPy5nZXQoXCJhZG1pbl9tZXNzYWdlX21kXCIsIFwiYWRtaW5NZXNzYWdlTURcIik7XG4gICAgICAgIGxldCBhZG1pbk1lc3NhZ2U7XG4gICAgICAgIGlmIChhZG1pbk1lc3NhZ2VNRCkge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IG5ldyBNYXJrZG93bihhZG1pbk1lc3NhZ2VNRCkudG9IVE1MKHsgZXh0ZXJuYWxMaW5rczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGFkbWluTWVzc2FnZSA9IDxwIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogaHRtbCB9fSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1vZGVyYXRpb24pIHtcbiAgICAgICAgICAgIC8vIERpc3BsYXkgcmVwb3J0LXRvLW1vZGVyYXRvciBkaWFsb2cuXG4gICAgICAgICAgICAvLyBXZSBsZXQgdGhlIHVzZXIgcGljayBhIG5hdHVyZS5cbiAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IGhvbWVTZXJ2ZXJOYW1lID0gU2RrQ29uZmlnLmdldChcInZhbGlkYXRlZF9zZXJ2ZXJfY29uZmlnXCIpLmhzTmFtZTtcbiAgICAgICAgICAgIGxldCBzdWJ0aXRsZTtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5uYXR1cmUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIE5hdHVyZS5EaXNhZ3JlZW1lbnQ6XG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlID0gX3QoXCJXaGF0IHRoaXMgdXNlciBpcyB3cml0aW5nIGlzIHdyb25nLlxcblwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyB3aWxsIGJlIHJlcG9ydGVkIHRvIHRoZSByb29tIG1vZGVyYXRvcnMuXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE5hdHVyZS5Ub3hpYzpcbiAgICAgICAgICAgICAgICAgICAgc3VidGl0bGUgPSBfdChcIlRoaXMgdXNlciBpcyBkaXNwbGF5aW5nIHRveGljIGJlaGF2aW91ciwgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJmb3IgaW5zdGFuY2UgYnkgaW5zdWx0aW5nIG90aGVyIHVzZXJzIG9yIHNoYXJpbmcgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIgYWR1bHQtb25seSBjb250ZW50IGluIGEgZmFtaWx5LWZyaWVuZGx5IHJvb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIgb3Igb3RoZXJ3aXNlIHZpb2xhdGluZyB0aGUgcnVsZXMgb2YgdGhpcyByb29tLlxcblwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyB3aWxsIGJlIHJlcG9ydGVkIHRvIHRoZSByb29tIG1vZGVyYXRvcnMuXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE5hdHVyZS5JbGxlZ2FsOlxuICAgICAgICAgICAgICAgICAgICBzdWJ0aXRsZSA9IF90KFwiVGhpcyB1c2VyIGlzIGRpc3BsYXlpbmcgaWxsZWdhbCBiZWhhdmlvdXIsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZm9yIGluc3RhbmNlIGJ5IGRveGluZyBwZW9wbGUgb3IgdGhyZWF0ZW5pbmcgdmlvbGVuY2UuXFxuXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHdpbGwgYmUgcmVwb3J0ZWQgdG8gdGhlIHJvb20gbW9kZXJhdG9ycyB3aG8gbWF5IGVzY2FsYXRlIHRoaXMgdG8gbGVnYWwgYXV0aG9yaXRpZXMuXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE5hdHVyZS5TcGFtOlxuICAgICAgICAgICAgICAgICAgICBzdWJ0aXRsZSA9IF90KFwiVGhpcyB1c2VyIGlzIHNwYW1taW5nIHRoZSByb29tIHdpdGggYWRzLCBsaW5rcyB0byBhZHMgb3IgdG8gcHJvcGFnYW5kYS5cXG5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgd2lsbCBiZSByZXBvcnRlZCB0byB0aGUgcm9vbSBtb2RlcmF0b3JzLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBOb25TdGFuZGFyZFZhbHVlLkFkbWluOlxuICAgICAgICAgICAgICAgICAgICBpZiAoY2xpZW50LmlzUm9vbUVuY3J5cHRlZCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJ0aXRsZSA9IF90KFwiVGhpcyByb29tIGlzIGRlZGljYXRlZCB0byBpbGxlZ2FsIG9yIHRveGljIGNvbnRlbnQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib3IgdGhlIG1vZGVyYXRvcnMgZmFpbCB0byBtb2RlcmF0ZSBpbGxlZ2FsIG9yIHRveGljIGNvbnRlbnQuXFxuXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyB3aWxsIGJlIHJlcG9ydGVkIHRvIHRoZSBhZG1pbmlzdHJhdG9ycyBvZiAlKGhvbWVzZXJ2ZXIpcy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhlIGFkbWluaXN0cmF0b3JzIHdpbGwgTk9UIGJlIGFibGUgdG8gcmVhZCB0aGUgZW5jcnlwdGVkIGNvbnRlbnQgb2YgdGhpcyByb29tLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBob21lc2VydmVyOiBob21lU2VydmVyTmFtZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlID0gX3QoXCJUaGlzIHJvb20gaXMgZGVkaWNhdGVkIHRvIGlsbGVnYWwgb3IgdG94aWMgY29udGVudCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvciB0aGUgbW9kZXJhdG9ycyBmYWlsIHRvIG1vZGVyYXRlIGlsbGVnYWwgb3IgdG94aWMgY29udGVudC5cXG5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgVGhpcyB3aWxsIGJlIHJlcG9ydGVkIHRvIHRoZSBhZG1pbmlzdHJhdG9ycyBvZiAlKGhvbWVzZXJ2ZXIpcy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaG9tZXNlcnZlcjogaG9tZVNlcnZlck5hbWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBOYXR1cmUuT3RoZXI6XG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlID0gX3QoXCJBbnkgb3RoZXIgcmVhc29uLiBQbGVhc2UgZGVzY3JpYmUgdGhlIHByb2JsZW0uXFxuXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHdpbGwgYmUgcmVwb3J0ZWQgdG8gdGhlIHJvb20gbW9kZXJhdG9ycy5cIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHN1YnRpdGxlID0gX3QoXCJQbGVhc2UgcGljayBhIG5hdHVyZSBhbmQgZGVzY3JpYmUgd2hhdCBtYWtlcyB0aGlzIG1lc3NhZ2UgYWJ1c2l2ZS5cIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1JlcG9ydEV2ZW50RGlhbG9nXCJcbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoJ1JlcG9ydCBDb250ZW50Jyl9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfUmVwb3J0RXZlbnREaWFsb2cnXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cIm5hdHVyZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e05hdHVyZS5EaXNhZ3JlZW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5uYXR1cmUgPT0gTmF0dXJlLkRpc2FncmVlbWVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbk5hdHVyZUNob3Nlbn1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdEaXNhZ3JlZScpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkUmFkaW9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkUmFkaW9CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwibmF0dXJlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17TmF0dXJlLlRveGljfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUubmF0dXJlID09IE5hdHVyZS5Ub3hpY31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbk5hdHVyZUNob3Nlbn1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdUb3hpYyBCZWhhdmlvdXInKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZFJhZGlvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cIm5hdHVyZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e05hdHVyZS5JbGxlZ2FsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUubmF0dXJlID09IE5hdHVyZS5JbGxlZ2FsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTmF0dXJlQ2hvc2VufVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0lsbGVnYWwgQ29udGVudCcpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkUmFkaW9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkUmFkaW9CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwibmF0dXJlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17TmF0dXJlLlNwYW19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5uYXR1cmUgPT0gTmF0dXJlLlNwYW19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25OYXR1cmVDaG9zZW59XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnU3BhbSBvciBwcm9wYWdhbmRhJykgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWRSYWRpb0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTdHlsZWRSYWRpb0J1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJuYXR1cmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtOb25TdGFuZGFyZFZhbHVlLkFkbWlufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUubmF0dXJlID09IE5vblN0YW5kYXJkVmFsdWUuQWRtaW59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25OYXR1cmVDaG9zZW59XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnUmVwb3J0IHRoZSBlbnRpcmUgcm9vbScpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkUmFkaW9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkUmFkaW9CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwibmF0dXJlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17TmF0dXJlLk90aGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUubmF0dXJlID09IE5hdHVyZS5PdGhlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbk5hdHVyZUNob3Nlbn1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdPdGhlcicpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkUmFkaW9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YnRpdGxlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1JlcG9ydEV2ZW50RGlhbG9nX3JlYXNvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInRleHRhcmVhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSZWFzb25cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93cz17NX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblJlYXNvbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5yZWFzb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHByb2dyZXNzIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZXJyb3IgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBpZ25vcmVVc2VyQ2hlY2tib3ggfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiU2VuZCByZXBvcnRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVwb3J0IHRvIGhvbWVzZXJ2ZXIgYWRtaW4uXG4gICAgICAgIC8vIEN1cnJlbnRseSwgdGhlIEFQSSBkb2VzIG5vdCBzdXBwb3J0IG5hdHVyZXMuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1JlcG9ydEV2ZW50RGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KCdSZXBvcnQgQ29udGVudCB0byBZb3VyIEhvbWVzZXJ2ZXIgQWRtaW5pc3RyYXRvcicpfVxuICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfUmVwb3J0RXZlbnREaWFsb2cnXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9SZXBvcnRFdmVudERpYWxvZ1wiIGlkPVwibXhfUmVwb3J0RXZlbnREaWFsb2dcIj5cbiAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3QoXCJSZXBvcnRpbmcgdGhpcyBtZXNzYWdlIHdpbGwgc2VuZCBpdHMgdW5pcXVlICdldmVudCBJRCcgdG8gdGhlIGFkbWluaXN0cmF0b3Igb2YgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInlvdXIgaG9tZXNlcnZlci4gSWYgbWVzc2FnZXMgaW4gdGhpcyByb29tIGFyZSBlbmNyeXB0ZWQsIHlvdXIgaG9tZXNlcnZlciBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWRtaW5pc3RyYXRvciB3aWxsIG5vdCBiZSBhYmxlIHRvIHJlYWQgdGhlIG1lc3NhZ2UgdGV4dCBvciB2aWV3IGFueSBmaWxlcyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib3IgaW1hZ2VzLlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgIHsgYWRtaW5NZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9SZXBvcnRFdmVudERpYWxvZ19yZWFzb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInRleHRhcmVhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlJlYXNvblwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3M9ezV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblJlYXNvbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnJlYXNvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgcHJvZ3Jlc3MgfVxuICAgICAgICAgICAgICAgICAgICB7IGVycm9yIH1cbiAgICAgICAgICAgICAgICAgICAgeyBpZ25vcmVVc2VyQ2hlY2tib3ggfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiU2VuZCByZXBvcnRcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUVBOztB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