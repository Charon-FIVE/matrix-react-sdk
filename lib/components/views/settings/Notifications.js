"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _PushRules = require("matrix-js-sdk/src/@types/PushRules");

var _threepids = require("matrix-js-sdk/src/@types/threepids");

var _logger = require("matrix-js-sdk/src/logger");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _notifications = require("../../../notifications");

var _languageHandler = require("../../../languageHandler");

var _LabelledToggleSwitch = _interopRequireDefault(require("../elements/LabelledToggleSwitch"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _StyledRadioButton = _interopRequireDefault(require("../elements/StyledRadioButton"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _TagComposer = _interopRequireDefault(require("../elements/TagComposer"));

var _objects = require("../../../utils/objects");

var _arrays = require("../../../utils/arrays");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// TODO: this "view" component still has far too much application logic in it,
// which should be factored out to other files.
var Phase;

(function (Phase) {
  Phase["Loading"] = "loading";
  Phase["Ready"] = "ready";
  Phase["Persisting"] = "persisting";
  Phase["Error"] = "error";
})(Phase || (Phase = {}));

var RuleClass;

(function (RuleClass) {
  RuleClass["Master"] = "master";
  RuleClass["VectorGlobal"] = "vector_global";
  RuleClass["VectorMentions"] = "vector_mentions";
  RuleClass["VectorOther"] = "vector_other";
  RuleClass["Other"] = "other";
})(RuleClass || (RuleClass = {}));

const KEYWORD_RULE_ID = "_keywords"; // used as a placeholder "Rule ID" throughout this component

const KEYWORD_RULE_CATEGORY = RuleClass.VectorMentions; // This array doesn't care about categories: it's just used for a simple sort

const RULE_DISPLAY_ORDER = [// Global
_PushRules.RuleId.DM, _PushRules.RuleId.EncryptedDM, _PushRules.RuleId.Message, _PushRules.RuleId.EncryptedMessage, // Mentions
_PushRules.RuleId.ContainsDisplayName, _PushRules.RuleId.ContainsUserName, _PushRules.RuleId.AtRoomNotification, // Other
_PushRules.RuleId.InviteToSelf, _PushRules.RuleId.IncomingCall, _PushRules.RuleId.SuppressNotices, _PushRules.RuleId.Tombstone];

class Notifications extends _react.default.PureComponent {
  constructor(props) {
    var _this;

    super(props);
    _this = this;
    (0, _defineProperty2.default)(this, "settingWatchers", void 0);
    (0, _defineProperty2.default)(this, "onMasterRuleChanged", async checked => {
      this.setState({
        phase: Phase.Persisting
      });

      try {
        const masterRule = this.state.masterPushRule;
        await _MatrixClientPeg.MatrixClientPeg.get().setPushRuleEnabled('global', masterRule.kind, masterRule.rule_id, !checked);
        await this.refreshFromServer();
      } catch (e) {
        this.setState({
          phase: Phase.Error
        });

        _logger.logger.error("Error updating master push rule:", e);

        this.showSaveError();
      }
    });
    (0, _defineProperty2.default)(this, "onEmailNotificationsChanged", async (email, checked) => {
      this.setState({
        phase: Phase.Persisting
      });

      try {
        if (checked) {
          await _MatrixClientPeg.MatrixClientPeg.get().setPusher({
            kind: "email",
            app_id: "m.email",
            pushkey: email,
            app_display_name: "Email Notifications",
            device_display_name: email,
            lang: navigator.language,
            data: {
              brand: _SdkConfig.default.get().brand
            },
            // We always append for email pushers since we don't want to stop other
            // accounts notifying to the same email address
            append: true
          });
        } else {
          const pusher = this.state.pushers.find(p => p.kind === "email" && p.pushkey === email);
          pusher.kind = null; // flag for delete

          await _MatrixClientPeg.MatrixClientPeg.get().setPusher(pusher);
        }

        await this.refreshFromServer();
      } catch (e) {
        this.setState({
          phase: Phase.Error
        });

        _logger.logger.error("Error updating email pusher:", e);

        this.showSaveError();
      }
    });
    (0, _defineProperty2.default)(this, "onDesktopNotificationsChanged", async checked => {
      await _SettingsStore.default.setValue("notificationsEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked);
    });
    (0, _defineProperty2.default)(this, "onDesktopShowBodyChanged", async checked => {
      await _SettingsStore.default.setValue("notificationBodyEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked);
    });
    (0, _defineProperty2.default)(this, "onAudioNotificationsChanged", async checked => {
      await _SettingsStore.default.setValue("audioNotificationsEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked);
    });
    (0, _defineProperty2.default)(this, "onRadioChecked", async (rule, checkedState) => {
      this.setState({
        phase: Phase.Persisting
      });

      try {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        if (rule.ruleId === KEYWORD_RULE_ID) {
          // Update all the keywords
          for (const rule of this.state.vectorKeywordRuleInfo.rules) {
            let enabled;
            let actions;

            if (checkedState === _notifications.VectorState.On) {
              if (rule.actions.length !== 1) {
                // XXX: Magic number
                actions = _notifications.PushRuleVectorState.actionsFor(checkedState);
              }

              if (this.state.vectorKeywordRuleInfo.vectorState === _notifications.VectorState.Off) {
                enabled = true;
              }
            } else if (checkedState === _notifications.VectorState.Loud) {
              if (rule.actions.length !== 3) {
                // XXX: Magic number
                actions = _notifications.PushRuleVectorState.actionsFor(checkedState);
              }

              if (this.state.vectorKeywordRuleInfo.vectorState === _notifications.VectorState.Off) {
                enabled = true;
              }
            } else {
              enabled = false;
            }

            if (actions) {
              await cli.setPushRuleActions('global', rule.kind, rule.rule_id, actions);
            }

            if (enabled !== undefined) {
              await cli.setPushRuleEnabled('global', rule.kind, rule.rule_id, enabled);
            }
          }
        } else {
          const definition = _notifications.VectorPushRulesDefinitions[rule.ruleId];
          const actions = definition.vectorStateToActions[checkedState];

          if (!actions) {
            await cli.setPushRuleEnabled('global', rule.rule.kind, rule.rule.rule_id, false);
          } else {
            await cli.setPushRuleActions('global', rule.rule.kind, rule.rule.rule_id, actions);
            await cli.setPushRuleEnabled('global', rule.rule.kind, rule.rule.rule_id, true);
          }
        }

        await this.refreshFromServer();
      } catch (e) {
        this.setState({
          phase: Phase.Error
        });

        _logger.logger.error("Error updating push rule:", e);

        this.showSaveError();
      }
    });
    (0, _defineProperty2.default)(this, "onClearNotificationsClicked", () => {
      _MatrixClientPeg.MatrixClientPeg.get().getRooms().forEach(r => {
        if (r.getUnreadNotificationCount() > 0) {
          const events = r.getLiveTimeline().getEvents();

          if (events.length) {
            // noinspection JSIgnoredPromiseFromCall
            _MatrixClientPeg.MatrixClientPeg.get().sendReadReceipt(events[events.length - 1]);
          }
        }
      });
    });
    (0, _defineProperty2.default)(this, "onKeywordAdd", keyword => {
      const originalRules = (0, _objects.objectClone)(this.state.vectorKeywordRuleInfo.rules); // We add the keyword immediately as a sort of local echo effect

      this.setState({
        phase: Phase.Persisting,
        vectorKeywordRuleInfo: _objectSpread(_objectSpread({}, this.state.vectorKeywordRuleInfo), {}, {
          rules: [...this.state.vectorKeywordRuleInfo.rules, // XXX: Horrible assumption that we don't need the remaining fields
          {
            pattern: keyword
          }]
        })
      }, async () => {
        await this.setKeywords(this.state.vectorKeywordRuleInfo.rules.map(r => r.pattern), originalRules);
      });
    });
    (0, _defineProperty2.default)(this, "onKeywordRemove", keyword => {
      const originalRules = (0, _objects.objectClone)(this.state.vectorKeywordRuleInfo.rules); // We remove the keyword immediately as a sort of local echo effect

      this.setState({
        phase: Phase.Persisting,
        vectorKeywordRuleInfo: _objectSpread(_objectSpread({}, this.state.vectorKeywordRuleInfo), {}, {
          rules: this.state.vectorKeywordRuleInfo.rules.filter(r => r.pattern !== keyword)
        })
      }, async () => {
        await this.setKeywords(this.state.vectorKeywordRuleInfo.rules.map(r => r.pattern), originalRules);
      });
    });
    this.state = {
      phase: Phase.Loading,
      desktopNotifications: _SettingsStore.default.getValue("notificationsEnabled"),
      desktopShowBody: _SettingsStore.default.getValue("notificationBodyEnabled"),
      audioNotifications: _SettingsStore.default.getValue("audioNotificationsEnabled")
    };
    this.settingWatchers = [_SettingsStore.default.watchSetting("notificationsEnabled", null, function () {
      for (var _len = arguments.length, _ref = new Array(_len), _key = 0; _key < _len; _key++) {
        _ref[_key] = arguments[_key];
      }

      let [,,,, value] = _ref;
      return _this.setState({
        desktopNotifications: value
      });
    }), _SettingsStore.default.watchSetting("notificationBodyEnabled", null, function () {
      for (var _len2 = arguments.length, _ref2 = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        _ref2[_key2] = arguments[_key2];
      }

      let [,,,, value] = _ref2;
      return _this.setState({
        desktopShowBody: value
      });
    }), _SettingsStore.default.watchSetting("audioNotificationsEnabled", null, function () {
      for (var _len3 = arguments.length, _ref3 = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        _ref3[_key3] = arguments[_key3];
      }

      let [,,,, value] = _ref3;
      return _this.setState({
        audioNotifications: value
      });
    })];
  }

  get isInhibited() {
    // Caution: The master rule's enabled state is inverted from expectation. When
    // the master rule is *enabled* it means all other rules are *disabled* (or
    // inhibited). Conversely, when the master rule is *disabled* then all other rules
    // are *enabled* (or operate fine).
    return this.state.masterPushRule?.enabled;
  }

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.refreshFromServer();
  }

  componentWillUnmount() {
    this.settingWatchers.forEach(watcher => _SettingsStore.default.unwatchSetting(watcher));
  }

  async refreshFromServer() {
    try {
      const newState = (await Promise.all([this.refreshRules(), this.refreshPushers(), this.refreshThreepids()])).reduce((p, c) => Object.assign(c, p), {});
      this.setState(_objectSpread(_objectSpread({}, newState), {}, {
        phase: Phase.Ready
      }));
    } catch (e) {
      _logger.logger.error("Error setting up notifications for settings: ", e);

      this.setState({
        phase: Phase.Error
      });
    }
  }

  async refreshRules() {
    const ruleSets = await _MatrixClientPeg.MatrixClientPeg.get().getPushRules();
    const categories = {
      [_PushRules.RuleId.Master]: RuleClass.Master,
      [_PushRules.RuleId.DM]: RuleClass.VectorGlobal,
      [_PushRules.RuleId.EncryptedDM]: RuleClass.VectorGlobal,
      [_PushRules.RuleId.Message]: RuleClass.VectorGlobal,
      [_PushRules.RuleId.EncryptedMessage]: RuleClass.VectorGlobal,
      [_PushRules.RuleId.ContainsDisplayName]: RuleClass.VectorMentions,
      [_PushRules.RuleId.ContainsUserName]: RuleClass.VectorMentions,
      [_PushRules.RuleId.AtRoomNotification]: RuleClass.VectorMentions,
      [_PushRules.RuleId.InviteToSelf]: RuleClass.VectorOther,
      [_PushRules.RuleId.IncomingCall]: RuleClass.VectorOther,
      [_PushRules.RuleId.SuppressNotices]: RuleClass.VectorOther,
      [_PushRules.RuleId.Tombstone]: RuleClass.VectorOther // Everything maps to a generic "other" (unknown rule)

    };
    const defaultRules = {
      [RuleClass.Master]: [],
      [RuleClass.VectorGlobal]: [],
      [RuleClass.VectorMentions]: [],
      [RuleClass.VectorOther]: [],
      [RuleClass.Other]: []
    };

    for (const k in ruleSets.global) {
      // noinspection JSUnfilteredForInLoop
      const kind = k;

      for (const r of ruleSets.global[kind]) {
        const rule = Object.assign(r, {
          kind
        });
        const category = categories[rule.rule_id] ?? RuleClass.Other;

        if (rule.rule_id[0] === '.') {
          defaultRules[category].push(rule);
        }
      }
    }

    const preparedNewState = {};

    if (defaultRules.master.length > 0) {
      preparedNewState.masterPushRule = defaultRules.master[0];
    } else {
      // XXX: Can this even happen? How do we safely recover?
      throw new Error("Failed to locate a master push rule");
    } // Parse keyword rules


    preparedNewState.vectorKeywordRuleInfo = _notifications.ContentRules.parseContentRules(ruleSets); // Prepare rendering for all of our known rules

    preparedNewState.vectorPushRules = {};
    const vectorCategories = [RuleClass.VectorGlobal, RuleClass.VectorMentions, RuleClass.VectorOther];

    for (const category of vectorCategories) {
      preparedNewState.vectorPushRules[category] = [];

      for (const rule of defaultRules[category]) {
        const definition = _notifications.VectorPushRulesDefinitions[rule.rule_id];
        const vectorState = definition.ruleToVectorState(rule);
        preparedNewState.vectorPushRules[category].push({
          ruleId: rule.rule_id,
          rule,
          vectorState,
          description: (0, _languageHandler._t)(definition.description)
        });
      } // Quickly sort the rules for display purposes


      preparedNewState.vectorPushRules[category].sort((a, b) => {
        let idxA = RULE_DISPLAY_ORDER.indexOf(a.ruleId);
        let idxB = RULE_DISPLAY_ORDER.indexOf(b.ruleId); // Assume unknown things go at the end

        if (idxA < 0) idxA = RULE_DISPLAY_ORDER.length;
        if (idxB < 0) idxB = RULE_DISPLAY_ORDER.length;
        return idxA - idxB;
      });

      if (category === KEYWORD_RULE_CATEGORY) {
        preparedNewState.vectorPushRules[category].push({
          ruleId: KEYWORD_RULE_ID,
          description: (0, _languageHandler._t)("Messages containing keywords"),
          vectorState: preparedNewState.vectorKeywordRuleInfo.vectorState
        });
      }
    }

    return preparedNewState;
  }

  refreshPushers() {
    return _MatrixClientPeg.MatrixClientPeg.get().getPushers();
  }

  refreshThreepids() {
    return _MatrixClientPeg.MatrixClientPeg.get().getThreePids();
  }

  showSaveError() {
    _Modal.default.createDialog(_ErrorDialog.default, {
      title: (0, _languageHandler._t)('Error saving notification preferences'),
      description: (0, _languageHandler._t)('An error occurred whilst saving your notification preferences.')
    });
  }

  async setKeywords(keywords, originalRules) {
    try {
      // De-duplicate and remove empties
      keywords = Array.from(new Set(keywords)).filter(k => !!k);
      const oldKeywords = Array.from(new Set(originalRules.map(r => r.pattern))).filter(k => !!k); // Note: Technically because of the UI interaction (at the time of writing), the diff
      // will only ever be +/-1 so we don't really have to worry about efficiently handling
      // tons of keyword changes.

      const diff = (0, _arrays.arrayDiff)(oldKeywords, keywords);

      for (const word of diff.removed) {
        for (const rule of originalRules.filter(r => r.pattern === word)) {
          await _MatrixClientPeg.MatrixClientPeg.get().deletePushRule('global', rule.kind, rule.rule_id);
        }
      }

      let ruleVectorState = this.state.vectorKeywordRuleInfo.vectorState;

      if (ruleVectorState === _notifications.VectorState.Off) {
        // When the current global keywords rule is OFF, we need to look at
        // the flavor of existing rules to apply the same actions
        // when creating the new rule.
        if (originalRules.length) {
          ruleVectorState = _notifications.PushRuleVectorState.contentRuleVectorStateKind(originalRules[0]);
        } else {
          ruleVectorState = _notifications.VectorState.On; // default
        }
      }

      const kind = _PushRules.PushRuleKind.ContentSpecific;

      for (const word of diff.added) {
        await _MatrixClientPeg.MatrixClientPeg.get().addPushRule('global', kind, word, {
          actions: _notifications.PushRuleVectorState.actionsFor(ruleVectorState),
          pattern: word
        });

        if (ruleVectorState === _notifications.VectorState.Off) {
          await _MatrixClientPeg.MatrixClientPeg.get().setPushRuleEnabled('global', kind, word, false);
        }
      }

      await this.refreshFromServer();
    } catch (e) {
      this.setState({
        phase: Phase.Error
      });

      _logger.logger.error("Error updating keyword push rules:", e);

      this.showSaveError();
    }
  }

  renderTopSection() {
    const masterSwitch = /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      "data-test-id": "notif-master-switch",
      value: !this.isInhibited,
      label: (0, _languageHandler._t)("Enable for this account"),
      onChange: this.onMasterRuleChanged,
      disabled: this.state.phase === Phase.Persisting
    }); // If all the rules are inhibited, don't show anything.


    if (this.isInhibited) {
      return masterSwitch;
    }

    const emailSwitches = (this.state.threepids || []).filter(t => t.medium === _threepids.ThreepidMedium.Email).map(e => /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      "data-test-id": "notif-email-switch",
      key: e.address,
      value: this.state.pushers.some(p => p.kind === "email" && p.pushkey === e.address),
      label: (0, _languageHandler._t)("Enable email notifications for %(email)s", {
        email: e.address
      }),
      onChange: this.onEmailNotificationsChanged.bind(this, e.address),
      disabled: this.state.phase === Phase.Persisting
    }));
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, masterSwitch, /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      "data-test-id": "notif-setting-notificationsEnabled",
      value: this.state.desktopNotifications,
      onChange: this.onDesktopNotificationsChanged,
      label: (0, _languageHandler._t)('Enable desktop notifications for this session'),
      disabled: this.state.phase === Phase.Persisting
    }), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      "data-test-id": "notif-setting-notificationBodyEnabled",
      value: this.state.desktopShowBody,
      onChange: this.onDesktopShowBodyChanged,
      label: (0, _languageHandler._t)('Show message in desktop notification'),
      disabled: this.state.phase === Phase.Persisting
    }), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      "data-test-id": "notif-setting-audioNotificationsEnabled",
      value: this.state.audioNotifications,
      onChange: this.onAudioNotificationsChanged,
      label: (0, _languageHandler._t)('Enable audible notifications for this session'),
      disabled: this.state.phase === Phase.Persisting
    }), emailSwitches);
  }

  renderCategory(category) {
    if (category !== RuleClass.VectorOther && this.isInhibited) {
      return null; // nothing to show for the section
    }

    let clearNotifsButton;

    if (category === RuleClass.VectorOther && _MatrixClientPeg.MatrixClientPeg.get().getRooms().some(r => r.getUnreadNotificationCount() > 0)) {
      clearNotifsButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onClearNotificationsClicked,
        kind: "danger",
        className: "mx_UserNotifSettings_clearNotifsButton"
      }, (0, _languageHandler._t)("Clear notifications"));
    }

    if (category === RuleClass.VectorOther && this.isInhibited) {
      // only render the utility buttons (if needed)
      if (clearNotifsButton) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_UserNotifSettings_floatingSection"
        }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Other")), clearNotifsButton);
      }

      return null;
    }

    let keywordComposer;

    if (category === RuleClass.VectorMentions) {
      keywordComposer = /*#__PURE__*/_react.default.createElement(_TagComposer.default, {
        tags: this.state.vectorKeywordRuleInfo?.rules.map(r => r.pattern),
        onAdd: this.onKeywordAdd,
        onRemove: this.onKeywordRemove,
        disabled: this.state.phase === Phase.Persisting,
        label: (0, _languageHandler._t)("Keyword"),
        placeholder: (0, _languageHandler._t)("New keyword")
      });
    }

    const VectorStateToLabel = {
      [_notifications.VectorState.On]: (0, _languageHandler._t)('On'),
      [_notifications.VectorState.Off]: (0, _languageHandler._t)('Off'),
      [_notifications.VectorState.Loud]: (0, _languageHandler._t)('Noisy')
    };

    const makeRadio = (r, s) => /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      key: r.ruleId + s,
      name: r.ruleId,
      checked: r.vectorState === s,
      onChange: this.onRadioChecked.bind(this, r, s),
      disabled: this.state.phase === Phase.Persisting,
      "aria-label": VectorStateToLabel[s]
    });

    const fieldsetRows = this.state.vectorPushRules[category].map(r => /*#__PURE__*/_react.default.createElement("fieldset", {
      key: category + r.ruleId,
      "data-test-id": category + r.ruleId,
      className: "mx_UserNotifSettings_gridRowContainer"
    }, /*#__PURE__*/_react.default.createElement("legend", {
      className: "mx_UserNotifSettings_gridRowLabel"
    }, r.description), makeRadio(r, _notifications.VectorState.Off), makeRadio(r, _notifications.VectorState.On), makeRadio(r, _notifications.VectorState.Loud)));
    let sectionName;

    switch (category) {
      case RuleClass.VectorGlobal:
        sectionName = (0, _languageHandler._t)("Global");
        break;

      case RuleClass.VectorMentions:
        sectionName = (0, _languageHandler._t)("Mentions & keywords");
        break;

      case RuleClass.VectorOther:
        sectionName = (0, _languageHandler._t)("Other");
        break;

      default:
        throw new Error("Developer error: Unnamed notifications section: " + category);
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      "data-test-id": `notif-section-${category}`,
      className: "mx_UserNotifSettings_grid"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UserNotifSettings_gridRowLabel mx_UserNotifSettings_gridRowHeading"
    }, sectionName), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UserNotifSettings_gridColumnLabel"
    }, VectorStateToLabel[_notifications.VectorState.Off]), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UserNotifSettings_gridColumnLabel"
    }, VectorStateToLabel[_notifications.VectorState.On]), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UserNotifSettings_gridColumnLabel"
    }, VectorStateToLabel[_notifications.VectorState.Loud]), fieldsetRows), clearNotifsButton, keywordComposer);
  }

  renderTargets() {
    if (this.isInhibited) return null; // no targets if there's no notifications

    const rows = this.state.pushers.map(p => /*#__PURE__*/_react.default.createElement("tr", {
      key: p.kind + p.pushkey
    }, /*#__PURE__*/_react.default.createElement("td", null, p.app_display_name), /*#__PURE__*/_react.default.createElement("td", null, p.device_display_name)));
    if (!rows.length) return null; // no targets to show

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserNotifSettings_floatingSection"
    }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Notification targets")), /*#__PURE__*/_react.default.createElement("table", null, /*#__PURE__*/_react.default.createElement("tbody", null, rows)));
  }

  render() {
    if (this.state.phase === Phase.Loading) {
      // Ends up default centered
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else if (this.state.phase === Phase.Error) {
      return /*#__PURE__*/_react.default.createElement("p", {
        "data-test-id": "error-message"
      }, (0, _languageHandler._t)("There was an error loading your notification settings."));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserNotifSettings"
    }, this.renderTopSection(), this.renderCategory(RuleClass.VectorGlobal), this.renderCategory(RuleClass.VectorMentions), this.renderCategory(RuleClass.VectorOther), this.renderTargets());
  }

}

exports.default = Notifications;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGFzZSIsIlJ1bGVDbGFzcyIsIktFWVdPUkRfUlVMRV9JRCIsIktFWVdPUkRfUlVMRV9DQVRFR09SWSIsIlZlY3Rvck1lbnRpb25zIiwiUlVMRV9ESVNQTEFZX09SREVSIiwiUnVsZUlkIiwiRE0iLCJFbmNyeXB0ZWRETSIsIk1lc3NhZ2UiLCJFbmNyeXB0ZWRNZXNzYWdlIiwiQ29udGFpbnNEaXNwbGF5TmFtZSIsIkNvbnRhaW5zVXNlck5hbWUiLCJBdFJvb21Ob3RpZmljYXRpb24iLCJJbnZpdGVUb1NlbGYiLCJJbmNvbWluZ0NhbGwiLCJTdXBwcmVzc05vdGljZXMiLCJUb21ic3RvbmUiLCJOb3RpZmljYXRpb25zIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNoZWNrZWQiLCJzZXRTdGF0ZSIsInBoYXNlIiwiUGVyc2lzdGluZyIsIm1hc3RlclJ1bGUiLCJzdGF0ZSIsIm1hc3RlclB1c2hSdWxlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic2V0UHVzaFJ1bGVFbmFibGVkIiwia2luZCIsInJ1bGVfaWQiLCJyZWZyZXNoRnJvbVNlcnZlciIsImUiLCJFcnJvciIsImxvZ2dlciIsImVycm9yIiwic2hvd1NhdmVFcnJvciIsImVtYWlsIiwic2V0UHVzaGVyIiwiYXBwX2lkIiwicHVzaGtleSIsImFwcF9kaXNwbGF5X25hbWUiLCJkZXZpY2VfZGlzcGxheV9uYW1lIiwibGFuZyIsIm5hdmlnYXRvciIsImxhbmd1YWdlIiwiZGF0YSIsImJyYW5kIiwiU2RrQ29uZmlnIiwiYXBwZW5kIiwicHVzaGVyIiwicHVzaGVycyIsImZpbmQiLCJwIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwicnVsZSIsImNoZWNrZWRTdGF0ZSIsImNsaSIsInJ1bGVJZCIsInZlY3RvcktleXdvcmRSdWxlSW5mbyIsInJ1bGVzIiwiZW5hYmxlZCIsImFjdGlvbnMiLCJWZWN0b3JTdGF0ZSIsIk9uIiwibGVuZ3RoIiwiUHVzaFJ1bGVWZWN0b3JTdGF0ZSIsImFjdGlvbnNGb3IiLCJ2ZWN0b3JTdGF0ZSIsIk9mZiIsIkxvdWQiLCJzZXRQdXNoUnVsZUFjdGlvbnMiLCJ1bmRlZmluZWQiLCJkZWZpbml0aW9uIiwiVmVjdG9yUHVzaFJ1bGVzRGVmaW5pdGlvbnMiLCJ2ZWN0b3JTdGF0ZVRvQWN0aW9ucyIsImdldFJvb21zIiwiZm9yRWFjaCIsInIiLCJnZXRVbnJlYWROb3RpZmljYXRpb25Db3VudCIsImV2ZW50cyIsImdldExpdmVUaW1lbGluZSIsImdldEV2ZW50cyIsInNlbmRSZWFkUmVjZWlwdCIsImtleXdvcmQiLCJvcmlnaW5hbFJ1bGVzIiwib2JqZWN0Q2xvbmUiLCJwYXR0ZXJuIiwic2V0S2V5d29yZHMiLCJtYXAiLCJmaWx0ZXIiLCJMb2FkaW5nIiwiZGVza3RvcE5vdGlmaWNhdGlvbnMiLCJnZXRWYWx1ZSIsImRlc2t0b3BTaG93Qm9keSIsImF1ZGlvTm90aWZpY2F0aW9ucyIsInNldHRpbmdXYXRjaGVycyIsIndhdGNoU2V0dGluZyIsInZhbHVlIiwiaXNJbmhpYml0ZWQiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwid2F0Y2hlciIsInVud2F0Y2hTZXR0aW5nIiwibmV3U3RhdGUiLCJQcm9taXNlIiwiYWxsIiwicmVmcmVzaFJ1bGVzIiwicmVmcmVzaFB1c2hlcnMiLCJyZWZyZXNoVGhyZWVwaWRzIiwicmVkdWNlIiwiYyIsIk9iamVjdCIsImFzc2lnbiIsIlJlYWR5IiwicnVsZVNldHMiLCJnZXRQdXNoUnVsZXMiLCJjYXRlZ29yaWVzIiwiTWFzdGVyIiwiVmVjdG9yR2xvYmFsIiwiVmVjdG9yT3RoZXIiLCJkZWZhdWx0UnVsZXMiLCJPdGhlciIsImsiLCJnbG9iYWwiLCJjYXRlZ29yeSIsInB1c2giLCJwcmVwYXJlZE5ld1N0YXRlIiwibWFzdGVyIiwiQ29udGVudFJ1bGVzIiwicGFyc2VDb250ZW50UnVsZXMiLCJ2ZWN0b3JQdXNoUnVsZXMiLCJ2ZWN0b3JDYXRlZ29yaWVzIiwicnVsZVRvVmVjdG9yU3RhdGUiLCJkZXNjcmlwdGlvbiIsIl90Iiwic29ydCIsImEiLCJiIiwiaWR4QSIsImluZGV4T2YiLCJpZHhCIiwiZ2V0UHVzaGVycyIsImdldFRocmVlUGlkcyIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImtleXdvcmRzIiwiQXJyYXkiLCJmcm9tIiwiU2V0Iiwib2xkS2V5d29yZHMiLCJkaWZmIiwiYXJyYXlEaWZmIiwid29yZCIsInJlbW92ZWQiLCJkZWxldGVQdXNoUnVsZSIsInJ1bGVWZWN0b3JTdGF0ZSIsImNvbnRlbnRSdWxlVmVjdG9yU3RhdGVLaW5kIiwiUHVzaFJ1bGVLaW5kIiwiQ29udGVudFNwZWNpZmljIiwiYWRkZWQiLCJhZGRQdXNoUnVsZSIsInJlbmRlclRvcFNlY3Rpb24iLCJtYXN0ZXJTd2l0Y2giLCJvbk1hc3RlclJ1bGVDaGFuZ2VkIiwiZW1haWxTd2l0Y2hlcyIsInRocmVlcGlkcyIsInQiLCJtZWRpdW0iLCJUaHJlZXBpZE1lZGl1bSIsIkVtYWlsIiwiYWRkcmVzcyIsInNvbWUiLCJvbkVtYWlsTm90aWZpY2F0aW9uc0NoYW5nZWQiLCJiaW5kIiwib25EZXNrdG9wTm90aWZpY2F0aW9uc0NoYW5nZWQiLCJvbkRlc2t0b3BTaG93Qm9keUNoYW5nZWQiLCJvbkF1ZGlvTm90aWZpY2F0aW9uc0NoYW5nZWQiLCJyZW5kZXJDYXRlZ29yeSIsImNsZWFyTm90aWZzQnV0dG9uIiwib25DbGVhck5vdGlmaWNhdGlvbnNDbGlja2VkIiwia2V5d29yZENvbXBvc2VyIiwib25LZXl3b3JkQWRkIiwib25LZXl3b3JkUmVtb3ZlIiwiVmVjdG9yU3RhdGVUb0xhYmVsIiwibWFrZVJhZGlvIiwicyIsIm9uUmFkaW9DaGVja2VkIiwiZmllbGRzZXRSb3dzIiwic2VjdGlvbk5hbWUiLCJyZW5kZXJUYXJnZXRzIiwicm93cyIsInJlbmRlciJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL05vdGlmaWNhdGlvbnMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJQW5ub3RhdGVkUHVzaFJ1bGUsIElQdXNoZXIsIFB1c2hSdWxlQWN0aW9uLCBQdXNoUnVsZUtpbmQsIFJ1bGVJZCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvUHVzaFJ1bGVzXCI7XG5pbXBvcnQgeyBJVGhyZWVwaWQsIFRocmVlcGlkTWVkaXVtIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy90aHJlZXBpZHNcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7XG4gICAgQ29udGVudFJ1bGVzLFxuICAgIElDb250ZW50UnVsZXMsXG4gICAgUHVzaFJ1bGVWZWN0b3JTdGF0ZSxcbiAgICBWZWN0b3JQdXNoUnVsZXNEZWZpbml0aW9ucyxcbiAgICBWZWN0b3JTdGF0ZSxcbn0gZnJvbSBcIi4uLy4uLy4uL25vdGlmaWNhdGlvbnNcIjtcbmltcG9ydCB0eXBlIHsgVmVjdG9yUHVzaFJ1bGVEZWZpbml0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL25vdGlmaWNhdGlvbnNcIjtcbmltcG9ydCB7IF90LCBUcmFuc2xhdGVkU3RyaW5nIH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IExhYmVsbGVkVG9nZ2xlU3dpdGNoIGZyb20gXCIuLi9lbGVtZW50cy9MYWJlbGxlZFRvZ2dsZVN3aXRjaFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBTdHlsZWRSYWRpb0J1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkUmFkaW9CdXR0b25cIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFRhZ0NvbXBvc2VyIGZyb20gXCIuLi9lbGVtZW50cy9UYWdDb21wb3NlclwiO1xuaW1wb3J0IHsgb2JqZWN0Q2xvbmUgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvb2JqZWN0c1wiO1xuaW1wb3J0IHsgYXJyYXlEaWZmIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2FycmF5c1wiO1xuXG4vLyBUT0RPOiB0aGlzIFwidmlld1wiIGNvbXBvbmVudCBzdGlsbCBoYXMgZmFyIHRvbyBtdWNoIGFwcGxpY2F0aW9uIGxvZ2ljIGluIGl0LFxuLy8gd2hpY2ggc2hvdWxkIGJlIGZhY3RvcmVkIG91dCB0byBvdGhlciBmaWxlcy5cblxuZW51bSBQaGFzZSB7XG4gICAgTG9hZGluZyA9IFwibG9hZGluZ1wiLFxuICAgIFJlYWR5ID0gXCJyZWFkeVwiLFxuICAgIFBlcnNpc3RpbmcgPSBcInBlcnNpc3RpbmdcIiwgLy8gdGVjaG5pY2FsbHkgYSBtZXRhLXN0YXRlIGZvciBSZWFkeSwgYnV0IHdoYXRldmVyXG4gICAgRXJyb3IgPSBcImVycm9yXCIsXG59XG5cbmVudW0gUnVsZUNsYXNzIHtcbiAgICBNYXN0ZXIgPSBcIm1hc3RlclwiLFxuXG4gICAgLy8gVGhlIHZlY3RvciBzZWN0aW9ucyBtYXAgYXBwcm94aW1hdGVseSB0byBVSSBzZWN0aW9uc1xuICAgIFZlY3Rvckdsb2JhbCA9IFwidmVjdG9yX2dsb2JhbFwiLFxuICAgIFZlY3Rvck1lbnRpb25zID0gXCJ2ZWN0b3JfbWVudGlvbnNcIixcbiAgICBWZWN0b3JPdGhlciA9IFwidmVjdG9yX290aGVyXCIsXG4gICAgT3RoZXIgPSBcIm90aGVyXCIsIC8vIHVua25vd24gcnVsZXMsIGVzc2VudGlhbGx5XG59XG5cbmNvbnN0IEtFWVdPUkRfUlVMRV9JRCA9IFwiX2tleXdvcmRzXCI7IC8vIHVzZWQgYXMgYSBwbGFjZWhvbGRlciBcIlJ1bGUgSURcIiB0aHJvdWdob3V0IHRoaXMgY29tcG9uZW50XG5jb25zdCBLRVlXT1JEX1JVTEVfQ0FURUdPUlkgPSBSdWxlQ2xhc3MuVmVjdG9yTWVudGlvbnM7XG5cbi8vIFRoaXMgYXJyYXkgZG9lc24ndCBjYXJlIGFib3V0IGNhdGVnb3JpZXM6IGl0J3MganVzdCB1c2VkIGZvciBhIHNpbXBsZSBzb3J0XG5jb25zdCBSVUxFX0RJU1BMQVlfT1JERVI6IHN0cmluZ1tdID0gW1xuICAgIC8vIEdsb2JhbFxuICAgIFJ1bGVJZC5ETSxcbiAgICBSdWxlSWQuRW5jcnlwdGVkRE0sXG4gICAgUnVsZUlkLk1lc3NhZ2UsXG4gICAgUnVsZUlkLkVuY3J5cHRlZE1lc3NhZ2UsXG5cbiAgICAvLyBNZW50aW9uc1xuICAgIFJ1bGVJZC5Db250YWluc0Rpc3BsYXlOYW1lLFxuICAgIFJ1bGVJZC5Db250YWluc1VzZXJOYW1lLFxuICAgIFJ1bGVJZC5BdFJvb21Ob3RpZmljYXRpb24sXG5cbiAgICAvLyBPdGhlclxuICAgIFJ1bGVJZC5JbnZpdGVUb1NlbGYsXG4gICAgUnVsZUlkLkluY29taW5nQ2FsbCxcbiAgICBSdWxlSWQuU3VwcHJlc3NOb3RpY2VzLFxuICAgIFJ1bGVJZC5Ub21ic3RvbmUsXG5dO1xuXG5pbnRlcmZhY2UgSVZlY3RvclB1c2hSdWxlIHtcbiAgICBydWxlSWQ6IFJ1bGVJZCB8IHR5cGVvZiBLRVlXT1JEX1JVTEVfSUQgfCBzdHJpbmc7XG4gICAgcnVsZT86IElBbm5vdGF0ZWRQdXNoUnVsZTtcbiAgICBkZXNjcmlwdGlvbjogVHJhbnNsYXRlZFN0cmluZyB8IHN0cmluZztcbiAgICB2ZWN0b3JTdGF0ZTogVmVjdG9yU3RhdGU7XG59XG5cbmludGVyZmFjZSBJUHJvcHMge31cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgcGhhc2U6IFBoYXNlO1xuXG4gICAgLy8gT3B0aW9uYWwgc3R1ZmYgaXMgcmVxdWlyZWQgd2hlbiBgcGhhc2UgPT09IFJlYWR5YFxuICAgIG1hc3RlclB1c2hSdWxlPzogSUFubm90YXRlZFB1c2hSdWxlO1xuICAgIHZlY3RvcktleXdvcmRSdWxlSW5mbz86IElDb250ZW50UnVsZXM7XG4gICAgdmVjdG9yUHVzaFJ1bGVzPzoge1xuICAgICAgICBbY2F0ZWdvcnkgaW4gUnVsZUNsYXNzXT86IElWZWN0b3JQdXNoUnVsZVtdO1xuICAgIH07XG4gICAgcHVzaGVycz86IElQdXNoZXJbXTtcbiAgICB0aHJlZXBpZHM/OiBJVGhyZWVwaWRbXTtcblxuICAgIGRlc2t0b3BOb3RpZmljYXRpb25zOiBib29sZWFuO1xuICAgIGRlc2t0b3BTaG93Qm9keTogYm9vbGVhbjtcbiAgICBhdWRpb05vdGlmaWNhdGlvbnM6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vdGlmaWNhdGlvbnMgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBzZXR0aW5nV2F0Y2hlcnM6IHN0cmluZ1tdO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwaGFzZTogUGhhc2UuTG9hZGluZyxcbiAgICAgICAgICAgIGRlc2t0b3BOb3RpZmljYXRpb25zOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibm90aWZpY2F0aW9uc0VuYWJsZWRcIiksXG4gICAgICAgICAgICBkZXNrdG9wU2hvd0JvZHk6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJub3RpZmljYXRpb25Cb2R5RW5hYmxlZFwiKSxcbiAgICAgICAgICAgIGF1ZGlvTm90aWZpY2F0aW9uczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImF1ZGlvTm90aWZpY2F0aW9uc0VuYWJsZWRcIiksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXR0aW5nV2F0Y2hlcnMgPSBbXG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcIm5vdGlmaWNhdGlvbnNFbmFibGVkXCIsIG51bGwsICguLi5bLCwsLCB2YWx1ZV0pID0+XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlc2t0b3BOb3RpZmljYXRpb25zOiB2YWx1ZSBhcyBib29sZWFuIH0pLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwibm90aWZpY2F0aW9uQm9keUVuYWJsZWRcIiwgbnVsbCwgKC4uLlssLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGVza3RvcFNob3dCb2R5OiB2YWx1ZSBhcyBib29sZWFuIH0pLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwiYXVkaW9Ob3RpZmljYXRpb25zRW5hYmxlZFwiLCBudWxsLCAoLi4uWywsLCwgdmFsdWVdKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBhdWRpb05vdGlmaWNhdGlvbnM6IHZhbHVlIGFzIGJvb2xlYW4gfSksXG4gICAgICAgICAgICApLFxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGlzSW5oaWJpdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBDYXV0aW9uOiBUaGUgbWFzdGVyIHJ1bGUncyBlbmFibGVkIHN0YXRlIGlzIGludmVydGVkIGZyb20gZXhwZWN0YXRpb24uIFdoZW5cbiAgICAgICAgLy8gdGhlIG1hc3RlciBydWxlIGlzICplbmFibGVkKiBpdCBtZWFucyBhbGwgb3RoZXIgcnVsZXMgYXJlICpkaXNhYmxlZCogKG9yXG4gICAgICAgIC8vIGluaGliaXRlZCkuIENvbnZlcnNlbHksIHdoZW4gdGhlIG1hc3RlciBydWxlIGlzICpkaXNhYmxlZCogdGhlbiBhbGwgb3RoZXIgcnVsZXNcbiAgICAgICAgLy8gYXJlICplbmFibGVkKiAob3Igb3BlcmF0ZSBmaW5lKS5cbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUubWFzdGVyUHVzaFJ1bGU/LmVuYWJsZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsXG4gICAgICAgIHRoaXMucmVmcmVzaEZyb21TZXJ2ZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ1dhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHdhdGNoZXIpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlZnJlc2hGcm9tU2VydmVyKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFJ1bGVzKCksXG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUHVzaGVycygpLFxuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFRocmVlcGlkcygpLFxuICAgICAgICAgICAgXSkpLnJlZHVjZSgocCwgYykgPT4gT2JqZWN0LmFzc2lnbihjLCBwKSwge30pO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlPGtleW9mIE9taXQ8SVN0YXRlLCBcImRlc2t0b3BOb3RpZmljYXRpb25zXCIgfCBcImRlc2t0b3BTaG93Qm9keVwiIHwgXCJhdWRpb05vdGlmaWNhdGlvbnNcIj4+KHtcbiAgICAgICAgICAgICAgICAuLi5uZXdTdGF0ZSxcbiAgICAgICAgICAgICAgICBwaGFzZTogUGhhc2UuUmVhZHksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3Igc2V0dGluZyB1cCBub3RpZmljYXRpb25zIGZvciBzZXR0aW5nczogXCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5FcnJvciB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVmcmVzaFJ1bGVzKCk6IFByb21pc2U8UGFydGlhbDxJU3RhdGU+PiB7XG4gICAgICAgIGNvbnN0IHJ1bGVTZXRzID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFB1c2hSdWxlcygpO1xuICAgICAgICBjb25zdCBjYXRlZ29yaWVzID0ge1xuICAgICAgICAgICAgW1J1bGVJZC5NYXN0ZXJdOiBSdWxlQ2xhc3MuTWFzdGVyLFxuXG4gICAgICAgICAgICBbUnVsZUlkLkRNXTogUnVsZUNsYXNzLlZlY3Rvckdsb2JhbCxcbiAgICAgICAgICAgIFtSdWxlSWQuRW5jcnlwdGVkRE1dOiBSdWxlQ2xhc3MuVmVjdG9yR2xvYmFsLFxuICAgICAgICAgICAgW1J1bGVJZC5NZXNzYWdlXTogUnVsZUNsYXNzLlZlY3Rvckdsb2JhbCxcbiAgICAgICAgICAgIFtSdWxlSWQuRW5jcnlwdGVkTWVzc2FnZV06IFJ1bGVDbGFzcy5WZWN0b3JHbG9iYWwsXG5cbiAgICAgICAgICAgIFtSdWxlSWQuQ29udGFpbnNEaXNwbGF5TmFtZV06IFJ1bGVDbGFzcy5WZWN0b3JNZW50aW9ucyxcbiAgICAgICAgICAgIFtSdWxlSWQuQ29udGFpbnNVc2VyTmFtZV06IFJ1bGVDbGFzcy5WZWN0b3JNZW50aW9ucyxcbiAgICAgICAgICAgIFtSdWxlSWQuQXRSb29tTm90aWZpY2F0aW9uXTogUnVsZUNsYXNzLlZlY3Rvck1lbnRpb25zLFxuXG4gICAgICAgICAgICBbUnVsZUlkLkludml0ZVRvU2VsZl06IFJ1bGVDbGFzcy5WZWN0b3JPdGhlcixcbiAgICAgICAgICAgIFtSdWxlSWQuSW5jb21pbmdDYWxsXTogUnVsZUNsYXNzLlZlY3Rvck90aGVyLFxuICAgICAgICAgICAgW1J1bGVJZC5TdXBwcmVzc05vdGljZXNdOiBSdWxlQ2xhc3MuVmVjdG9yT3RoZXIsXG4gICAgICAgICAgICBbUnVsZUlkLlRvbWJzdG9uZV06IFJ1bGVDbGFzcy5WZWN0b3JPdGhlcixcblxuICAgICAgICAgICAgLy8gRXZlcnl0aGluZyBtYXBzIHRvIGEgZ2VuZXJpYyBcIm90aGVyXCIgKHVua25vd24gcnVsZSlcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkZWZhdWx0UnVsZXM6IHtcbiAgICAgICAgICAgIFtrIGluIFJ1bGVDbGFzc106IElBbm5vdGF0ZWRQdXNoUnVsZVtdO1xuICAgICAgICB9ID0ge1xuICAgICAgICAgICAgW1J1bGVDbGFzcy5NYXN0ZXJdOiBbXSxcbiAgICAgICAgICAgIFtSdWxlQ2xhc3MuVmVjdG9yR2xvYmFsXTogW10sXG4gICAgICAgICAgICBbUnVsZUNsYXNzLlZlY3Rvck1lbnRpb25zXTogW10sXG4gICAgICAgICAgICBbUnVsZUNsYXNzLlZlY3Rvck90aGVyXTogW10sXG4gICAgICAgICAgICBbUnVsZUNsYXNzLk90aGVyXTogW10sXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBrIGluIHJ1bGVTZXRzLmdsb2JhbCkge1xuICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTVW5maWx0ZXJlZEZvckluTG9vcFxuICAgICAgICAgICAgY29uc3Qga2luZCA9IGsgYXMgUHVzaFJ1bGVLaW5kO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHIgb2YgcnVsZVNldHMuZ2xvYmFsW2tpbmRdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcnVsZTogSUFubm90YXRlZFB1c2hSdWxlID0gT2JqZWN0LmFzc2lnbihyLCB7IGtpbmQgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBjYXRlZ29yaWVzW3J1bGUucnVsZV9pZF0gPz8gUnVsZUNsYXNzLk90aGVyO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUucnVsZV9pZFswXSA9PT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRSdWxlc1tjYXRlZ29yeV0ucHVzaChydWxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcmVwYXJlZE5ld1N0YXRlOiBQYXJ0aWFsPElTdGF0ZT4gPSB7fTtcbiAgICAgICAgaWYgKGRlZmF1bHRSdWxlcy5tYXN0ZXIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcHJlcGFyZWROZXdTdGF0ZS5tYXN0ZXJQdXNoUnVsZSA9IGRlZmF1bHRSdWxlcy5tYXN0ZXJbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBYWFg6IENhbiB0aGlzIGV2ZW4gaGFwcGVuPyBIb3cgZG8gd2Ugc2FmZWx5IHJlY292ZXI/XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9jYXRlIGEgbWFzdGVyIHB1c2ggcnVsZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhcnNlIGtleXdvcmQgcnVsZXNcbiAgICAgICAgcHJlcGFyZWROZXdTdGF0ZS52ZWN0b3JLZXl3b3JkUnVsZUluZm8gPSBDb250ZW50UnVsZXMucGFyc2VDb250ZW50UnVsZXMocnVsZVNldHMpO1xuXG4gICAgICAgIC8vIFByZXBhcmUgcmVuZGVyaW5nIGZvciBhbGwgb2Ygb3VyIGtub3duIHJ1bGVzXG4gICAgICAgIHByZXBhcmVkTmV3U3RhdGUudmVjdG9yUHVzaFJ1bGVzID0ge307XG4gICAgICAgIGNvbnN0IHZlY3RvckNhdGVnb3JpZXMgPSBbUnVsZUNsYXNzLlZlY3Rvckdsb2JhbCwgUnVsZUNsYXNzLlZlY3Rvck1lbnRpb25zLCBSdWxlQ2xhc3MuVmVjdG9yT3RoZXJdO1xuICAgICAgICBmb3IgKGNvbnN0IGNhdGVnb3J5IG9mIHZlY3RvckNhdGVnb3JpZXMpIHtcbiAgICAgICAgICAgIHByZXBhcmVkTmV3U3RhdGUudmVjdG9yUHVzaFJ1bGVzW2NhdGVnb3J5XSA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIGRlZmF1bHRSdWxlc1tjYXRlZ29yeV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWZpbml0aW9uOiBWZWN0b3JQdXNoUnVsZURlZmluaXRpb24gPSBWZWN0b3JQdXNoUnVsZXNEZWZpbml0aW9uc1tydWxlLnJ1bGVfaWRdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZlY3RvclN0YXRlID0gZGVmaW5pdGlvbi5ydWxlVG9WZWN0b3JTdGF0ZShydWxlKTtcbiAgICAgICAgICAgICAgICBwcmVwYXJlZE5ld1N0YXRlLnZlY3RvclB1c2hSdWxlc1tjYXRlZ29yeV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHJ1bGVJZDogcnVsZS5ydWxlX2lkLFxuICAgICAgICAgICAgICAgICAgICBydWxlLCB2ZWN0b3JTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KGRlZmluaXRpb24uZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBRdWlja2x5IHNvcnQgdGhlIHJ1bGVzIGZvciBkaXNwbGF5IHB1cnBvc2VzXG4gICAgICAgICAgICBwcmVwYXJlZE5ld1N0YXRlLnZlY3RvclB1c2hSdWxlc1tjYXRlZ29yeV0uc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpZHhBID0gUlVMRV9ESVNQTEFZX09SREVSLmluZGV4T2YoYS5ydWxlSWQpO1xuICAgICAgICAgICAgICAgIGxldCBpZHhCID0gUlVMRV9ESVNQTEFZX09SREVSLmluZGV4T2YoYi5ydWxlSWQpO1xuXG4gICAgICAgICAgICAgICAgLy8gQXNzdW1lIHVua25vd24gdGhpbmdzIGdvIGF0IHRoZSBlbmRcbiAgICAgICAgICAgICAgICBpZiAoaWR4QSA8IDApIGlkeEEgPSBSVUxFX0RJU1BMQVlfT1JERVIubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGlmIChpZHhCIDwgMCkgaWR4QiA9IFJVTEVfRElTUExBWV9PUkRFUi5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gaWR4QSAtIGlkeEI7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBLRVlXT1JEX1JVTEVfQ0FURUdPUlkpIHtcbiAgICAgICAgICAgICAgICBwcmVwYXJlZE5ld1N0YXRlLnZlY3RvclB1c2hSdWxlc1tjYXRlZ29yeV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHJ1bGVJZDogS0VZV09SRF9SVUxFX0lELFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJNZXNzYWdlcyBjb250YWluaW5nIGtleXdvcmRzXCIpLFxuICAgICAgICAgICAgICAgICAgICB2ZWN0b3JTdGF0ZTogcHJlcGFyZWROZXdTdGF0ZS52ZWN0b3JLZXl3b3JkUnVsZUluZm8udmVjdG9yU3RhdGUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJlcGFyZWROZXdTdGF0ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZnJlc2hQdXNoZXJzKCk6IFByb21pc2U8UGFydGlhbDxJU3RhdGU+PiB7XG4gICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHVzaGVycygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVmcmVzaFRocmVlcGlkcygpOiBQcm9taXNlPFBhcnRpYWw8SVN0YXRlPj4ge1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFRocmVlUGlkcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd1NhdmVFcnJvcigpIHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIHNhdmluZyBub3RpZmljYXRpb24gcHJlZmVyZW5jZXMnKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnQW4gZXJyb3Igb2NjdXJyZWQgd2hpbHN0IHNhdmluZyB5b3VyIG5vdGlmaWNhdGlvbiBwcmVmZXJlbmNlcy4nKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1hc3RlclJ1bGVDaGFuZ2VkID0gYXN5bmMgKGNoZWNrZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5QZXJzaXN0aW5nIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtYXN0ZXJSdWxlID0gdGhpcy5zdGF0ZS5tYXN0ZXJQdXNoUnVsZTtcbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRQdXNoUnVsZUVuYWJsZWQoJ2dsb2JhbCcsIG1hc3RlclJ1bGUua2luZCwgbWFzdGVyUnVsZS5ydWxlX2lkLCAhY2hlY2tlZCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJlZnJlc2hGcm9tU2VydmVyKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuRXJyb3IgfSk7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciB1cGRhdGluZyBtYXN0ZXIgcHVzaCBydWxlOlwiLCBlKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NhdmVFcnJvcigpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FbWFpbE5vdGlmaWNhdGlvbnNDaGFuZ2VkID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIGNoZWNrZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5QZXJzaXN0aW5nIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRQdXNoZXIoe1xuICAgICAgICAgICAgICAgICAgICBraW5kOiBcImVtYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgIGFwcF9pZDogXCJtLmVtYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgIHB1c2hrZXk6IGVtYWlsLFxuICAgICAgICAgICAgICAgICAgICBhcHBfZGlzcGxheV9uYW1lOiBcIkVtYWlsIE5vdGlmaWNhdGlvbnNcIixcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlX2Rpc3BsYXlfbmFtZTogZW1haWwsXG4gICAgICAgICAgICAgICAgICAgIGxhbmc6IG5hdmlnYXRvci5sYW5ndWFnZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmQ6IFNka0NvbmZpZy5nZXQoKS5icmFuZCxcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBhbHdheXMgYXBwZW5kIGZvciBlbWFpbCBwdXNoZXJzIHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gc3RvcCBvdGhlclxuICAgICAgICAgICAgICAgICAgICAvLyBhY2NvdW50cyBub3RpZnlpbmcgdG8gdGhlIHNhbWUgZW1haWwgYWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICBhcHBlbmQ6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHB1c2hlciA9IHRoaXMuc3RhdGUucHVzaGVycy5maW5kKHAgPT4gcC5raW5kID09PSBcImVtYWlsXCIgJiYgcC5wdXNoa2V5ID09PSBlbWFpbCk7XG4gICAgICAgICAgICAgICAgcHVzaGVyLmtpbmQgPSBudWxsOyAvLyBmbGFnIGZvciBkZWxldGVcbiAgICAgICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0UHVzaGVyKHB1c2hlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVmcmVzaEZyb21TZXJ2ZXIoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5FcnJvciB9KTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIHVwZGF0aW5nIGVtYWlsIHB1c2hlcjpcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLnNob3dTYXZlRXJyb3IoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRGVza3RvcE5vdGlmaWNhdGlvbnNDaGFuZ2VkID0gYXN5bmMgKGNoZWNrZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgYXdhaXQgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcIm5vdGlmaWNhdGlvbnNFbmFibGVkXCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIGNoZWNrZWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRGVza3RvcFNob3dCb2R5Q2hhbmdlZCA9IGFzeW5jIChjaGVja2VkOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGF3YWl0IFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJub3RpZmljYXRpb25Cb2R5RW5hYmxlZFwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBjaGVja2VkKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkF1ZGlvTm90aWZpY2F0aW9uc0NoYW5nZWQgPSBhc3luYyAoY2hlY2tlZDogYm9vbGVhbikgPT4ge1xuICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiYXVkaW9Ob3RpZmljYXRpb25zRW5hYmxlZFwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBjaGVja2VkKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJhZGlvQ2hlY2tlZCA9IGFzeW5jIChydWxlOiBJVmVjdG9yUHVzaFJ1bGUsIGNoZWNrZWRTdGF0ZTogVmVjdG9yU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5QZXJzaXN0aW5nIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBpZiAocnVsZS5ydWxlSWQgPT09IEtFWVdPUkRfUlVMRV9JRCkge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBhbGwgdGhlIGtleXdvcmRzXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIHRoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvLnJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbmFibGVkOiBib29sZWFuO1xuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0aW9uczogUHVzaFJ1bGVBY3Rpb25bXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrZWRTdGF0ZSA9PT0gVmVjdG9yU3RhdGUuT24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydWxlLmFjdGlvbnMubGVuZ3RoICE9PSAxKSB7IC8vIFhYWDogTWFnaWMgbnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9ucyA9IFB1c2hSdWxlVmVjdG9yU3RhdGUuYWN0aW9uc0ZvcihjaGVja2VkU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvLnZlY3RvclN0YXRlID09PSBWZWN0b3JTdGF0ZS5PZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGVja2VkU3RhdGUgPT09IFZlY3RvclN0YXRlLkxvdWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydWxlLmFjdGlvbnMubGVuZ3RoICE9PSAzKSB7IC8vIFhYWDogTWFnaWMgbnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9ucyA9IFB1c2hSdWxlVmVjdG9yU3RhdGUuYWN0aW9uc0ZvcihjaGVja2VkU3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvLnZlY3RvclN0YXRlID09PSBWZWN0b3JTdGF0ZS5PZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGkuc2V0UHVzaFJ1bGVBY3Rpb25zKCdnbG9iYWwnLCBydWxlLmtpbmQsIHJ1bGUucnVsZV9pZCwgYWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuYWJsZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnNldFB1c2hSdWxlRW5hYmxlZCgnZ2xvYmFsJywgcnVsZS5raW5kLCBydWxlLnJ1bGVfaWQsIGVuYWJsZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWZpbml0aW9uOiBWZWN0b3JQdXNoUnVsZURlZmluaXRpb24gPSBWZWN0b3JQdXNoUnVsZXNEZWZpbml0aW9uc1tydWxlLnJ1bGVJZF07XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRlZmluaXRpb24udmVjdG9yU3RhdGVUb0FjdGlvbnNbY2hlY2tlZFN0YXRlXTtcbiAgICAgICAgICAgICAgICBpZiAoIWFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnNldFB1c2hSdWxlRW5hYmxlZCgnZ2xvYmFsJywgcnVsZS5ydWxlLmtpbmQsIHJ1bGUucnVsZS5ydWxlX2lkLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnNldFB1c2hSdWxlQWN0aW9ucygnZ2xvYmFsJywgcnVsZS5ydWxlLmtpbmQsIHJ1bGUucnVsZS5ydWxlX2lkLCBhY3Rpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnNldFB1c2hSdWxlRW5hYmxlZCgnZ2xvYmFsJywgcnVsZS5ydWxlLmtpbmQsIHJ1bGUucnVsZS5ydWxlX2lkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVmcmVzaEZyb21TZXJ2ZXIoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5FcnJvciB9KTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIHVwZGF0aW5nIHB1c2ggcnVsZTpcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLnNob3dTYXZlRXJyb3IoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xlYXJOb3RpZmljYXRpb25zQ2xpY2tlZCA9ICgpID0+IHtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb21zKCkuZm9yRWFjaChyID0+IHtcbiAgICAgICAgICAgIGlmIChyLmdldFVucmVhZE5vdGlmaWNhdGlvbkNvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gci5nZXRMaXZlVGltZWxpbmUoKS5nZXRFdmVudHMoKTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsXG4gICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kUmVhZFJlY2VpcHQoZXZlbnRzW2V2ZW50cy5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyBzZXRLZXl3b3JkcyhrZXl3b3Jkczogc3RyaW5nW10sIG9yaWdpbmFsUnVsZXM6IElBbm5vdGF0ZWRQdXNoUnVsZVtdKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBEZS1kdXBsaWNhdGUgYW5kIHJlbW92ZSBlbXB0aWVzXG4gICAgICAgICAgICBrZXl3b3JkcyA9IEFycmF5LmZyb20obmV3IFNldChrZXl3b3JkcykpLmZpbHRlcihrID0+ICEhayk7XG4gICAgICAgICAgICBjb25zdCBvbGRLZXl3b3JkcyA9IEFycmF5LmZyb20obmV3IFNldChvcmlnaW5hbFJ1bGVzLm1hcChyID0+IHIucGF0dGVybikpKS5maWx0ZXIoayA9PiAhIWspO1xuXG4gICAgICAgICAgICAvLyBOb3RlOiBUZWNobmljYWxseSBiZWNhdXNlIG9mIHRoZSBVSSBpbnRlcmFjdGlvbiAoYXQgdGhlIHRpbWUgb2Ygd3JpdGluZyksIHRoZSBkaWZmXG4gICAgICAgICAgICAvLyB3aWxsIG9ubHkgZXZlciBiZSArLy0xIHNvIHdlIGRvbid0IHJlYWxseSBoYXZlIHRvIHdvcnJ5IGFib3V0IGVmZmljaWVudGx5IGhhbmRsaW5nXG4gICAgICAgICAgICAvLyB0b25zIG9mIGtleXdvcmQgY2hhbmdlcy5cblxuICAgICAgICAgICAgY29uc3QgZGlmZiA9IGFycmF5RGlmZihvbGRLZXl3b3Jkcywga2V5d29yZHMpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHdvcmQgb2YgZGlmZi5yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIG9yaWdpbmFsUnVsZXMuZmlsdGVyKHIgPT4gci5wYXR0ZXJuID09PSB3b3JkKSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlUHVzaFJ1bGUoJ2dsb2JhbCcsIHJ1bGUua2luZCwgcnVsZS5ydWxlX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBydWxlVmVjdG9yU3RhdGUgPSB0aGlzLnN0YXRlLnZlY3RvcktleXdvcmRSdWxlSW5mby52ZWN0b3JTdGF0ZTtcbiAgICAgICAgICAgIGlmIChydWxlVmVjdG9yU3RhdGUgPT09IFZlY3RvclN0YXRlLk9mZikge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIGN1cnJlbnQgZ2xvYmFsIGtleXdvcmRzIHJ1bGUgaXMgT0ZGLCB3ZSBuZWVkIHRvIGxvb2sgYXRcbiAgICAgICAgICAgICAgICAvLyB0aGUgZmxhdm9yIG9mIGV4aXN0aW5nIHJ1bGVzIHRvIGFwcGx5IHRoZSBzYW1lIGFjdGlvbnNcbiAgICAgICAgICAgICAgICAvLyB3aGVuIGNyZWF0aW5nIHRoZSBuZXcgcnVsZS5cbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxSdWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVsZVZlY3RvclN0YXRlID0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5jb250ZW50UnVsZVZlY3RvclN0YXRlS2luZChvcmlnaW5hbFJ1bGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBydWxlVmVjdG9yU3RhdGUgPSBWZWN0b3JTdGF0ZS5PbjsgLy8gZGVmYXVsdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGtpbmQgPSBQdXNoUnVsZUtpbmQuQ29udGVudFNwZWNpZmljO1xuICAgICAgICAgICAgZm9yIChjb25zdCB3b3JkIG9mIGRpZmYuYWRkZWQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuYWRkUHVzaFJ1bGUoJ2dsb2JhbCcsIGtpbmQsIHdvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogUHVzaFJ1bGVWZWN0b3JTdGF0ZS5hY3Rpb25zRm9yKHJ1bGVWZWN0b3JTdGF0ZSksXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IHdvcmQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVWZWN0b3JTdGF0ZSA9PT0gVmVjdG9yU3RhdGUuT2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRQdXNoUnVsZUVuYWJsZWQoJ2dsb2JhbCcsIGtpbmQsIHdvcmQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVmcmVzaEZyb21TZXJ2ZXIoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5FcnJvciB9KTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIHVwZGF0aW5nIGtleXdvcmQgcHVzaCBydWxlczpcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLnNob3dTYXZlRXJyb3IoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25LZXl3b3JkQWRkID0gKGtleXdvcmQ6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW5hbFJ1bGVzID0gb2JqZWN0Q2xvbmUodGhpcy5zdGF0ZS52ZWN0b3JLZXl3b3JkUnVsZUluZm8ucnVsZXMpO1xuXG4gICAgICAgIC8vIFdlIGFkZCB0aGUga2V5d29yZCBpbW1lZGlhdGVseSBhcyBhIHNvcnQgb2YgbG9jYWwgZWNobyBlZmZlY3RcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogUGhhc2UuUGVyc2lzdGluZyxcbiAgICAgICAgICAgIHZlY3RvcktleXdvcmRSdWxlSW5mbzoge1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvLFxuICAgICAgICAgICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICAgICAgICAgIC4uLnRoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvLnJ1bGVzLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFhYWDogSG9ycmlibGUgYXNzdW1wdGlvbiB0aGF0IHdlIGRvbid0IG5lZWQgdGhlIHJlbWFpbmluZyBmaWVsZHNcbiAgICAgICAgICAgICAgICAgICAgeyBwYXR0ZXJuOiBrZXl3b3JkIH0gYXMgSUFubm90YXRlZFB1c2hSdWxlLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNldEtleXdvcmRzKHRoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvLnJ1bGVzLm1hcChyID0+IHIucGF0dGVybiksIG9yaWdpbmFsUnVsZXMpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleXdvcmRSZW1vdmUgPSAoa2V5d29yZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsUnVsZXMgPSBvYmplY3RDbG9uZSh0aGlzLnN0YXRlLnZlY3RvcktleXdvcmRSdWxlSW5mby5ydWxlcyk7XG5cbiAgICAgICAgLy8gV2UgcmVtb3ZlIHRoZSBrZXl3b3JkIGltbWVkaWF0ZWx5IGFzIGEgc29ydCBvZiBsb2NhbCBlY2hvIGVmZmVjdFxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5QZXJzaXN0aW5nLFxuICAgICAgICAgICAgdmVjdG9yS2V5d29yZFJ1bGVJbmZvOiB7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS52ZWN0b3JLZXl3b3JkUnVsZUluZm8sXG4gICAgICAgICAgICAgICAgcnVsZXM6IHRoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvLnJ1bGVzLmZpbHRlcihyID0+IHIucGF0dGVybiAhPT0ga2V5d29yZCksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNldEtleXdvcmRzKHRoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvLnJ1bGVzLm1hcChyID0+IHIucGF0dGVybiksIG9yaWdpbmFsUnVsZXMpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJUb3BTZWN0aW9uKCkge1xuICAgICAgICBjb25zdCBtYXN0ZXJTd2l0Y2ggPSA8TGFiZWxsZWRUb2dnbGVTd2l0Y2hcbiAgICAgICAgICAgIGRhdGEtdGVzdC1pZD0nbm90aWYtbWFzdGVyLXN3aXRjaCdcbiAgICAgICAgICAgIHZhbHVlPXshdGhpcy5pc0luaGliaXRlZH1cbiAgICAgICAgICAgIGxhYmVsPXtfdChcIkVuYWJsZSBmb3IgdGhpcyBhY2NvdW50XCIpfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25NYXN0ZXJSdWxlQ2hhbmdlZH1cbiAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnBoYXNlID09PSBQaGFzZS5QZXJzaXN0aW5nfVxuICAgICAgICAvPjtcblxuICAgICAgICAvLyBJZiBhbGwgdGhlIHJ1bGVzIGFyZSBpbmhpYml0ZWQsIGRvbid0IHNob3cgYW55dGhpbmcuXG4gICAgICAgIGlmICh0aGlzLmlzSW5oaWJpdGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFzdGVyU3dpdGNoO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW1haWxTd2l0Y2hlcyA9ICh0aGlzLnN0YXRlLnRocmVlcGlkcyB8fCBbXSkuZmlsdGVyKHQgPT4gdC5tZWRpdW0gPT09IFRocmVlcGlkTWVkaXVtLkVtYWlsKVxuICAgICAgICAgICAgLm1hcChlID0+IDxMYWJlbGxlZFRvZ2dsZVN3aXRjaFxuICAgICAgICAgICAgICAgIGRhdGEtdGVzdC1pZD0nbm90aWYtZW1haWwtc3dpdGNoJ1xuICAgICAgICAgICAgICAgIGtleT17ZS5hZGRyZXNzfVxuICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnB1c2hlcnMuc29tZShwID0+IHAua2luZCA9PT0gXCJlbWFpbFwiICYmIHAucHVzaGtleSA9PT0gZS5hZGRyZXNzKX1cbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJFbmFibGUgZW1haWwgbm90aWZpY2F0aW9ucyBmb3IgJShlbWFpbClzXCIsIHsgZW1haWw6IGUuYWRkcmVzcyB9KX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkVtYWlsTm90aWZpY2F0aW9uc0NoYW5nZWQuYmluZCh0aGlzLCBlLmFkZHJlc3MpfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnBoYXNlID09PSBQaGFzZS5QZXJzaXN0aW5nfVxuICAgICAgICAgICAgLz4pO1xuXG4gICAgICAgIHJldHVybiA8PlxuICAgICAgICAgICAgeyBtYXN0ZXJTd2l0Y2ggfVxuXG4gICAgICAgICAgICA8TGFiZWxsZWRUb2dnbGVTd2l0Y2hcbiAgICAgICAgICAgICAgICBkYXRhLXRlc3QtaWQ9J25vdGlmLXNldHRpbmctbm90aWZpY2F0aW9uc0VuYWJsZWQnXG4gICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZGVza3RvcE5vdGlmaWNhdGlvbnN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25EZXNrdG9wTm90aWZpY2F0aW9uc0NoYW5nZWR9XG4gICAgICAgICAgICAgICAgbGFiZWw9e190KCdFbmFibGUgZGVza3RvcCBub3RpZmljYXRpb25zIGZvciB0aGlzIHNlc3Npb24nKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5waGFzZSA9PT0gUGhhc2UuUGVyc2lzdGluZ31cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaFxuICAgICAgICAgICAgICAgIGRhdGEtdGVzdC1pZD0nbm90aWYtc2V0dGluZy1ub3RpZmljYXRpb25Cb2R5RW5hYmxlZCdcbiAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5kZXNrdG9wU2hvd0JvZHl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25EZXNrdG9wU2hvd0JvZHlDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnU2hvdyBtZXNzYWdlIGluIGRlc2t0b3Agbm90aWZpY2F0aW9uJyl9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLlBlcnNpc3Rpbmd9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICA8TGFiZWxsZWRUb2dnbGVTd2l0Y2hcbiAgICAgICAgICAgICAgICBkYXRhLXRlc3QtaWQ9J25vdGlmLXNldHRpbmctYXVkaW9Ob3RpZmljYXRpb25zRW5hYmxlZCdcbiAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5hdWRpb05vdGlmaWNhdGlvbnN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25BdWRpb05vdGlmaWNhdGlvbnNDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnRW5hYmxlIGF1ZGlibGUgbm90aWZpY2F0aW9ucyBmb3IgdGhpcyBzZXNzaW9uJyl9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLlBlcnNpc3Rpbmd9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICB7IGVtYWlsU3dpdGNoZXMgfVxuICAgICAgICA8Lz47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJDYXRlZ29yeShjYXRlZ29yeTogUnVsZUNsYXNzKSB7XG4gICAgICAgIGlmIChjYXRlZ29yeSAhPT0gUnVsZUNsYXNzLlZlY3Rvck90aGVyICYmIHRoaXMuaXNJbmhpYml0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBub3RoaW5nIHRvIHNob3cgZm9yIHRoZSBzZWN0aW9uXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2xlYXJOb3RpZnNCdXR0b246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICBjYXRlZ29yeSA9PT0gUnVsZUNsYXNzLlZlY3Rvck90aGVyXG4gICAgICAgICAgICAmJiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbXMoKS5zb21lKHIgPT4gci5nZXRVbnJlYWROb3RpZmljYXRpb25Db3VudCgpID4gMClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjbGVhck5vdGlmc0J1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsZWFyTm90aWZpY2F0aW9uc0NsaWNrZWR9XG4gICAgICAgICAgICAgICAga2luZD0nZGFuZ2VyJ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfVXNlck5vdGlmU2V0dGluZ3NfY2xlYXJOb3RpZnNCdXR0b24nXG4gICAgICAgICAgICA+eyBfdChcIkNsZWFyIG5vdGlmaWNhdGlvbnNcIikgfTwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IFJ1bGVDbGFzcy5WZWN0b3JPdGhlciAmJiB0aGlzLmlzSW5oaWJpdGVkKSB7XG4gICAgICAgICAgICAvLyBvbmx5IHJlbmRlciB0aGUgdXRpbGl0eSBidXR0b25zIChpZiBuZWVkZWQpXG4gICAgICAgICAgICBpZiAoY2xlYXJOb3RpZnNCdXR0b24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9J214X1VzZXJOb3RpZlNldHRpbmdzX2Zsb2F0aW5nU2VjdGlvbic+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+eyBfdChcIk90aGVyXCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBjbGVhck5vdGlmc0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQga2V5d29yZENvbXBvc2VyOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBSdWxlQ2xhc3MuVmVjdG9yTWVudGlvbnMpIHtcbiAgICAgICAgICAgIGtleXdvcmRDb21wb3NlciA9IDxUYWdDb21wb3NlclxuICAgICAgICAgICAgICAgIHRhZ3M9e3RoaXMuc3RhdGUudmVjdG9yS2V5d29yZFJ1bGVJbmZvPy5ydWxlcy5tYXAociA9PiByLnBhdHRlcm4pfVxuICAgICAgICAgICAgICAgIG9uQWRkPXt0aGlzLm9uS2V5d29yZEFkZH1cbiAgICAgICAgICAgICAgICBvblJlbW92ZT17dGhpcy5vbktleXdvcmRSZW1vdmV9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLlBlcnNpc3Rpbmd9XG4gICAgICAgICAgICAgICAgbGFiZWw9e190KFwiS2V5d29yZFwiKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJOZXcga2V5d29yZFwiKX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgVmVjdG9yU3RhdGVUb0xhYmVsID0ge1xuICAgICAgICAgICAgW1ZlY3RvclN0YXRlLk9uXTogX3QoJ09uJyksXG4gICAgICAgICAgICBbVmVjdG9yU3RhdGUuT2ZmXTogX3QoJ09mZicpLFxuICAgICAgICAgICAgW1ZlY3RvclN0YXRlLkxvdWRdOiBfdCgnTm9pc3knKSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBtYWtlUmFkaW8gPSAocjogSVZlY3RvclB1c2hSdWxlLCBzOiBWZWN0b3JTdGF0ZSkgPT4gKFxuICAgICAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXtyLnJ1bGVJZCArIHN9XG4gICAgICAgICAgICAgICAgbmFtZT17ci5ydWxlSWR9XG4gICAgICAgICAgICAgICAgY2hlY2tlZD17ci52ZWN0b3JTdGF0ZSA9PT0gc31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblJhZGlvQ2hlY2tlZC5iaW5kKHRoaXMsIHIsIHMpfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnBoYXNlID09PSBQaGFzZS5QZXJzaXN0aW5nfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e1ZlY3RvclN0YXRlVG9MYWJlbFtzXX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZmllbGRzZXRSb3dzID0gdGhpcy5zdGF0ZS52ZWN0b3JQdXNoUnVsZXNbY2F0ZWdvcnldLm1hcChyID0+XG4gICAgICAgICAgICA8ZmllbGRzZXRcbiAgICAgICAgICAgICAgICBrZXk9e2NhdGVnb3J5ICsgci5ydWxlSWR9XG4gICAgICAgICAgICAgICAgZGF0YS10ZXN0LWlkPXtjYXRlZ29yeSArIHIucnVsZUlkfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfVXNlck5vdGlmU2V0dGluZ3NfZ3JpZFJvd0NvbnRhaW5lcidcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8bGVnZW5kIGNsYXNzTmFtZT0nbXhfVXNlck5vdGlmU2V0dGluZ3NfZ3JpZFJvd0xhYmVsJz57IHIuZGVzY3JpcHRpb24gfTwvbGVnZW5kPlxuICAgICAgICAgICAgICAgIHsgbWFrZVJhZGlvKHIsIFZlY3RvclN0YXRlLk9mZikgfVxuICAgICAgICAgICAgICAgIHsgbWFrZVJhZGlvKHIsIFZlY3RvclN0YXRlLk9uKSB9XG4gICAgICAgICAgICAgICAgeyBtYWtlUmFkaW8ociwgVmVjdG9yU3RhdGUuTG91ZCkgfVxuICAgICAgICAgICAgPC9maWVsZHNldD4pO1xuXG4gICAgICAgIGxldCBzZWN0aW9uTmFtZTogVHJhbnNsYXRlZFN0cmluZztcbiAgICAgICAgc3dpdGNoIChjYXRlZ29yeSkge1xuICAgICAgICAgICAgY2FzZSBSdWxlQ2xhc3MuVmVjdG9yR2xvYmFsOlxuICAgICAgICAgICAgICAgIHNlY3Rpb25OYW1lID0gX3QoXCJHbG9iYWxcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFJ1bGVDbGFzcy5WZWN0b3JNZW50aW9uczpcbiAgICAgICAgICAgICAgICBzZWN0aW9uTmFtZSA9IF90KFwiTWVudGlvbnMgJiBrZXl3b3Jkc1wiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUnVsZUNsYXNzLlZlY3Rvck90aGVyOlxuICAgICAgICAgICAgICAgIHNlY3Rpb25OYW1lID0gX3QoXCJPdGhlclwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGV2ZWxvcGVyIGVycm9yOiBVbm5hbWVkIG5vdGlmaWNhdGlvbnMgc2VjdGlvbjogXCIgKyBjYXRlZ29yeSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPD5cbiAgICAgICAgICAgIDxkaXYgZGF0YS10ZXN0LWlkPXtgbm90aWYtc2VjdGlvbi0ke2NhdGVnb3J5fWB9IGNsYXNzTmFtZT0nbXhfVXNlck5vdGlmU2V0dGluZ3NfZ3JpZCc+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9Vc2VyTm90aWZTZXR0aW5nc19ncmlkUm93TGFiZWwgbXhfVXNlck5vdGlmU2V0dGluZ3NfZ3JpZFJvd0hlYWRpbmcnPnsgc2VjdGlvbk5hbWUgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1VzZXJOb3RpZlNldHRpbmdzX2dyaWRDb2x1bW5MYWJlbCc+eyBWZWN0b3JTdGF0ZVRvTGFiZWxbVmVjdG9yU3RhdGUuT2ZmXSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfVXNlck5vdGlmU2V0dGluZ3NfZ3JpZENvbHVtbkxhYmVsJz57IFZlY3RvclN0YXRlVG9MYWJlbFtWZWN0b3JTdGF0ZS5Pbl0gfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1VzZXJOb3RpZlNldHRpbmdzX2dyaWRDb2x1bW5MYWJlbCc+eyBWZWN0b3JTdGF0ZVRvTGFiZWxbVmVjdG9yU3RhdGUuTG91ZF0gfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7IGZpZWxkc2V0Um93cyB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgY2xlYXJOb3RpZnNCdXR0b24gfVxuICAgICAgICAgICAgeyBrZXl3b3JkQ29tcG9zZXIgfVxuICAgICAgICA8Lz47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJUYXJnZXRzKCkge1xuICAgICAgICBpZiAodGhpcy5pc0luaGliaXRlZCkgcmV0dXJuIG51bGw7IC8vIG5vIHRhcmdldHMgaWYgdGhlcmUncyBubyBub3RpZmljYXRpb25zXG5cbiAgICAgICAgY29uc3Qgcm93cyA9IHRoaXMuc3RhdGUucHVzaGVycy5tYXAocCA9PiA8dHIga2V5PXtwLmtpbmQrcC5wdXNoa2V5fT5cbiAgICAgICAgICAgIDx0ZD57IHAuYXBwX2Rpc3BsYXlfbmFtZSB9PC90ZD5cbiAgICAgICAgICAgIDx0ZD57IHAuZGV2aWNlX2Rpc3BsYXlfbmFtZSB9PC90ZD5cbiAgICAgICAgPC90cj4pO1xuXG4gICAgICAgIGlmICghcm93cy5sZW5ndGgpIHJldHVybiBudWxsOyAvLyBubyB0YXJnZXRzIHRvIHNob3dcblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9J214X1VzZXJOb3RpZlNldHRpbmdzX2Zsb2F0aW5nU2VjdGlvbic+XG4gICAgICAgICAgICA8ZGl2PnsgX3QoXCJOb3RpZmljYXRpb24gdGFyZ2V0c1wiKSB9PC9kaXY+XG4gICAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICB7IHJvd3MgfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLkxvYWRpbmcpIHtcbiAgICAgICAgICAgIC8vIEVuZHMgdXAgZGVmYXVsdCBjZW50ZXJlZFxuICAgICAgICAgICAgcmV0dXJuIDxTcGlubmVyIC8+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLkVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gPHAgZGF0YS10ZXN0LWlkPSdlcnJvci1tZXNzYWdlJz57IF90KFwiVGhlcmUgd2FzIGFuIGVycm9yIGxvYWRpbmcgeW91ciBub3RpZmljYXRpb24gc2V0dGluZ3MuXCIpIH08L3A+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdteF9Vc2VyTm90aWZTZXR0aW5ncyc+XG4gICAgICAgICAgICB7IHRoaXMucmVuZGVyVG9wU2VjdGlvbigpIH1cbiAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJDYXRlZ29yeShSdWxlQ2xhc3MuVmVjdG9yR2xvYmFsKSB9XG4gICAgICAgICAgICB7IHRoaXMucmVuZGVyQ2F0ZWdvcnkoUnVsZUNsYXNzLlZlY3Rvck1lbnRpb25zKSB9XG4gICAgICAgICAgICB7IHRoaXMucmVuZGVyQ2F0ZWdvcnkoUnVsZUNsYXNzLlZlY3Rvck90aGVyKSB9XG4gICAgICAgICAgICB7IHRoaXMucmVuZGVyVGFyZ2V0cygpIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBUUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBO0FBQ0E7SUFFS0EsSzs7V0FBQUEsSztFQUFBQSxLO0VBQUFBLEs7RUFBQUEsSztFQUFBQSxLO0dBQUFBLEssS0FBQUEsSzs7SUFPQUMsUzs7V0FBQUEsUztFQUFBQSxTO0VBQUFBLFM7RUFBQUEsUztFQUFBQSxTO0VBQUFBLFM7R0FBQUEsUyxLQUFBQSxTOztBQVVMLE1BQU1DLGVBQWUsR0FBRyxXQUF4QixDLENBQXFDOztBQUNyQyxNQUFNQyxxQkFBcUIsR0FBR0YsU0FBUyxDQUFDRyxjQUF4QyxDLENBRUE7O0FBQ0EsTUFBTUMsa0JBQTRCLEdBQUcsQ0FDakM7QUFDQUMsaUJBQUEsQ0FBT0MsRUFGMEIsRUFHakNELGlCQUFBLENBQU9FLFdBSDBCLEVBSWpDRixpQkFBQSxDQUFPRyxPQUowQixFQUtqQ0gsaUJBQUEsQ0FBT0ksZ0JBTDBCLEVBT2pDO0FBQ0FKLGlCQUFBLENBQU9LLG1CQVIwQixFQVNqQ0wsaUJBQUEsQ0FBT00sZ0JBVDBCLEVBVWpDTixpQkFBQSxDQUFPTyxrQkFWMEIsRUFZakM7QUFDQVAsaUJBQUEsQ0FBT1EsWUFiMEIsRUFjakNSLGlCQUFBLENBQU9TLFlBZDBCLEVBZWpDVCxpQkFBQSxDQUFPVSxlQWYwQixFQWdCakNWLGlCQUFBLENBQU9XLFNBaEIwQixDQUFyQzs7QUE2Q2UsTUFBTUMsYUFBTixTQUE0QkMsY0FBQSxDQUFNQyxhQUFsQyxDQUFnRTtFQUdwRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQUE7O0lBQzlCLE1BQU1BLEtBQU4sQ0FEOEI7SUFBQTtJQUFBO0lBQUEsMkRBeUtKLE1BQU9DLE9B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