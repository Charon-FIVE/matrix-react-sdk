"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.labGroupNames = exports.SETTINGS = exports.LabGroup = void 0;

var _client = require("matrix-js-sdk/src/client");

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../languageHandler");

var _NotificationControllers = require("./controllers/NotificationControllers");

var _ThemeController = _interopRequireDefault(require("./controllers/ThemeController"));

var _PushToMatrixClientController = _interopRequireDefault(require("./controllers/PushToMatrixClientController"));

var _ReloadOnChangeController = _interopRequireDefault(require("./controllers/ReloadOnChangeController"));

var _FontSizeController = _interopRequireDefault(require("./controllers/FontSizeController"));

var _SystemFontController = _interopRequireDefault(require("./controllers/SystemFontController"));

var _UseSystemFontController = _interopRequireDefault(require("./controllers/UseSystemFontController"));

var _SettingLevel = require("./SettingLevel");

var _Keyboard = require("../Keyboard");

var _UIFeatureController = _interopRequireDefault(require("./controllers/UIFeatureController"));

var _UIFeature = require("./UIFeature");

var _OrderedMultiController = require("./controllers/OrderedMultiController");

var _Layout = require("./enums/Layout");

var _ReducedMotionController = _interopRequireDefault(require("./controllers/ReducedMotionController"));

var _IncompatibleController = _interopRequireDefault(require("./controllers/IncompatibleController"));

var _ImageSize = require("./enums/ImageSize");

var _spaces = require("../stores/spaces");

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _ThreadBetaController = _interopRequireDefault(require("./controllers/ThreadBetaController"));

var _FontWatcher = require("./watchers/FontWatcher");

/*
Copyright 2017 Travis Ralston
Copyright 2018 - 2021 The Matrix.org Foundation C.I.C.

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
// These are just a bunch of helper arrays to avoid copy/pasting a bunch of times
const LEVELS_ROOM_SETTINGS = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ACCOUNT, _SettingLevel.SettingLevel.CONFIG];
const LEVELS_ROOM_OR_ACCOUNT = [_SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ACCOUNT];
const LEVELS_ROOM_SETTINGS_WITH_ROOM = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ACCOUNT, _SettingLevel.SettingLevel.CONFIG, _SettingLevel.SettingLevel.ROOM];
const LEVELS_ACCOUNT_SETTINGS = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.ACCOUNT, _SettingLevel.SettingLevel.CONFIG];
const LEVELS_FEATURE = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.CONFIG];
const LEVELS_DEVICE_ONLY_SETTINGS = [_SettingLevel.SettingLevel.DEVICE];
const LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.CONFIG];
const LEVELS_UI_FEATURE = [_SettingLevel.SettingLevel.CONFIG // in future we might have a .well-known level or something
];
let LabGroup;
exports.LabGroup = LabGroup;

(function (LabGroup) {
  LabGroup[LabGroup["Messaging"] = 0] = "Messaging";
  LabGroup[LabGroup["Profile"] = 1] = "Profile";
  LabGroup[LabGroup["Spaces"] = 2] = "Spaces";
  LabGroup[LabGroup["Widgets"] = 3] = "Widgets";
  LabGroup[LabGroup["Rooms"] = 4] = "Rooms";
  LabGroup[LabGroup["Moderation"] = 5] = "Moderation";
  LabGroup[LabGroup["Analytics"] = 6] = "Analytics";
  LabGroup[LabGroup["MessagePreviews"] = 7] = "MessagePreviews";
  LabGroup[LabGroup["Themes"] = 8] = "Themes";
  LabGroup[LabGroup["Encryption"] = 9] = "Encryption";
  LabGroup[LabGroup["Experimental"] = 10] = "Experimental";
  LabGroup[LabGroup["Developer"] = 11] = "Developer";
})(LabGroup || (exports.LabGroup = LabGroup = {}));

const labGroupNames = {
  [LabGroup.Messaging]: (0, _languageHandler._td)("Messaging"),
  [LabGroup.Profile]: (0, _languageHandler._td)("Profile"),
  [LabGroup.Spaces]: (0, _languageHandler._td)("Spaces"),
  [LabGroup.Widgets]: (0, _languageHandler._td)("Widgets"),
  [LabGroup.Rooms]: (0, _languageHandler._td)("Rooms"),
  [LabGroup.Moderation]: (0, _languageHandler._td)("Moderation"),
  [LabGroup.Analytics]: (0, _languageHandler._td)("Analytics"),
  [LabGroup.MessagePreviews]: (0, _languageHandler._td)("Message Previews"),
  [LabGroup.Themes]: (0, _languageHandler._td)("Themes"),
  [LabGroup.Encryption]: (0, _languageHandler._td)("Encryption"),
  [LabGroup.Experimental]: (0, _languageHandler._td)("Experimental"),
  [LabGroup.Developer]: (0, _languageHandler._td)("Developer")
};
exports.labGroupNames = labGroupNames;
const SETTINGS = {
  "feature_video_rooms": {
    isFeature: true,
    labsGroup: LabGroup.Rooms,
    displayName: (0, _languageHandler._td)("Video rooms"),
    supportedLevels: LEVELS_FEATURE,
    default: false,
    // Reload to ensure that the left panel etc. get remounted
    controller: new _ReloadOnChangeController.default(),
    betaInfo: {
      title: (0, _languageHandler._td)("Video rooms"),
      caption: () => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("A new way to chat over voice and video in %(brand)s.", {
        brand: _SdkConfig.default.get().brand
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Video rooms are always-on VoIP channels embedded within a room in %(brand)s.", {
        brand: _SdkConfig.default.get().brand
      }))),
      faq: () => _SdkConfig.default.get().bug_report_endpoint_url && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("How can I create a video room?")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Use the “+” button in the room section of the left panel.")), /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("Can I use text chat alongside the video call?")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Yes, the chat timeline is displayed alongside the video."))),
      feedbackLabel: "video-room-feedback",
      feedbackSubheading: (0, _languageHandler._td)("Thank you for trying the beta, " + "please go into as much detail as you can so we can improve it."),
      image: require("../../res/img/betas/video_rooms.png"),
      requiresRefresh: true
    }
  },
  "feature_exploring_public_spaces": {
    displayName: (0, _languageHandler._td)("Explore public spaces in the new search dialog"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_msc3531_hide_messages_pending_moderation": {
    isFeature: true,
    labsGroup: LabGroup.Moderation,
    // Requires a reload since this setting is cached in EventUtils
    controller: new _ReloadOnChangeController.default(),
    displayName: (0, _languageHandler._td)("Let moderators hide messages pending moderation."),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_report_to_moderators": {
    isFeature: true,
    labsGroup: LabGroup.Moderation,
    displayName: (0, _languageHandler._td)("Report to moderators prototype. " + "In rooms that support moderation, the `report` button will let you report abuse to room moderators"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_latex_maths": {
    isFeature: true,
    labsGroup: LabGroup.Messaging,
    displayName: (0, _languageHandler._td)("Render LaTeX maths in messages"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_pinning": {
    isFeature: true,
    labsGroup: LabGroup.Messaging,
    displayName: (0, _languageHandler._td)("Message Pinning"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_thread": {
    isFeature: true,
    labsGroup: LabGroup.Messaging,
    controller: new _ThreadBetaController.default(),
    displayName: (0, _languageHandler._td)("Threaded messaging"),
    supportedLevels: LEVELS_FEATURE,
    default: false,
    betaInfo: {
      title: (0, _languageHandler._td)("Threads"),
      caption: () => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Keep discussions organised with threads.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Threads help keep conversations on-topic and easy to track. <a>Learn more</a>.", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "https://element.io/help#threads",
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub)
      }))),
      faq: () => _SdkConfig.default.get().bug_report_endpoint_url && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("How can I start a thread?")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Use “%(replyInThread)s” when hovering over a message.", {
        replyInThread: (0, _languageHandler._t)("Reply in thread")
      })), /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("How can I leave the beta?")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("To leave, return to this page and use the “%(leaveTheBeta)s” button.", {
        leaveTheBeta: (0, _languageHandler._t)("Leave the beta")
      }))),
      feedbackLabel: "thread-feedback",
      feedbackSubheading: (0, _languageHandler._td)("Thank you for trying the beta, " + "please go into as much detail as you can so we can improve it."),
      image: require("../../res/img/betas/threads.png"),
      requiresRefresh: true
    }
  },
  "feature_state_counters": {
    isFeature: true,
    labsGroup: LabGroup.Rooms,
    displayName: (0, _languageHandler._td)("Render simple counters in room header"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_mjolnir": {
    isFeature: true,
    labsGroup: LabGroup.Moderation,
    displayName: (0, _languageHandler._td)("Try out new ways to ignore people (experimental)"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_custom_themes": {
    isFeature: true,
    labsGroup: LabGroup.Themes,
    displayName: (0, _languageHandler._td)("Support adding custom themes"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_roomlist_preview_reactions_dms": {
    isFeature: true,
    labsGroup: LabGroup.MessagePreviews,
    displayName: (0, _languageHandler._td)("Show message previews for reactions in DMs"),
    supportedLevels: LEVELS_FEATURE,
    default: false,
    // this option is a subset of `feature_roomlist_preview_reactions_all` so disable it when that one is enabled
    controller: new _IncompatibleController.default("feature_roomlist_preview_reactions_all")
  },
  "feature_roomlist_preview_reactions_all": {
    isFeature: true,
    labsGroup: LabGroup.MessagePreviews,
    displayName: (0, _languageHandler._td)("Show message previews for reactions in all rooms"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_dehydration": {
    isFeature: true,
    labsGroup: LabGroup.Encryption,
    displayName: (0, _languageHandler._td)("Offline encrypted messaging using dehydrated devices"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_extensible_events": {
    isFeature: true,
    labsGroup: LabGroup.Developer,
    // developer for now, eventually Messaging and default on
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Show extensible event representation of events"),
    default: false
  },
  "useOnlyCurrentProfiles": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show current avatar and name for users in message history"),
    default: false
  },
  "mjolnirRooms": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: []
  },
  "mjolnirPersonalRoom": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: null
  },
  "feature_html_topic": {
    isFeature: true,
    labsGroup: LabGroup.Rooms,
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Show HTML representation of room topics"),
    default: false
  },
  "feature_bridge_state": {
    isFeature: true,
    labsGroup: LabGroup.Rooms,
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Show info about bridges in room settings"),
    default: false
  },
  "feature_breadcrumbs_v2": {
    isFeature: true,
    labsGroup: LabGroup.Rooms,
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Use new room breadcrumbs"),
    default: false
  },
  "feature_right_panel_default_open": {
    isFeature: true,
    labsGroup: LabGroup.Rooms,
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Right panel stays open (defaults to room member list)"),
    default: false
  },
  "feature_jump_to_date": {
    // We purposely leave out `isFeature: true` so it doesn't show in Labs
    // by default. We will conditionally show it depending on whether we can
    // detect MSC3030 support (see LabUserSettingsTab.tsx).
    // labsGroup: LabGroup.Messaging,
    displayName: (0, _languageHandler._td)("Jump to date (adds /jumptodate and jump to date headers)"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "RoomList.backgroundImage": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: null
  },
  "sendReadReceipts": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Send read receipts"),
    default: true
  },
  "feature_location_share_live": {
    isFeature: true,
    labsGroup: LabGroup.Messaging,
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Live Location Sharing (temporary implementation: locations persist in room history)"),
    default: false
  },
  "feature_favourite_messages": {
    isFeature: true,
    labsGroup: LabGroup.Messaging,
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Favourite Messages (under active development)"),
    default: false
  },
  "feature_new_device_manager": {
    isFeature: true,
    labsGroup: LabGroup.Experimental,
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Use new session manager (under active development)"),
    default: false
  },
  "baseFontSize": {
    displayName: (0, _languageHandler._td)("Font size"),
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: _FontWatcher.FontWatcher.DEFAULT_SIZE,
    controller: new _FontSizeController.default()
  },
  "useCustomFontSize": {
    displayName: (0, _languageHandler._td)("Use custom size"),
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false
  },
  "MessageComposerInput.suggestEmoji": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable Emoji suggestions while typing'),
    default: true,
    invertedSettingName: 'MessageComposerInput.dontSuggestEmoji'
  },
  "MessageComposerInput.showStickersButton": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show stickers button'),
    default: true,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.Widgets, false)
  },
  "MessageComposerInput.showPollsButton": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show polls button'),
    default: true
  },
  "MessageComposerInput.insertTrailingColon": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Insert a trailing colon after user mentions at the start of a message'),
    default: true
  },
  // TODO: Wire up appropriately to UI (FTUE notifications)
  "Notifications.alwaysShowBadgeCounts": {
    supportedLevels: LEVELS_ROOM_OR_ACCOUNT,
    default: false
  },
  "useCompactLayout": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("Use a more compact 'Modern' layout"),
    default: false,
    controller: new _IncompatibleController.default("layout", false, v => v !== _Layout.Layout.Group)
  },
  "showRedactions": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)('Show a placeholder for removed messages'),
    default: true,
    invertedSettingName: 'hideRedactions'
  },
  "showJoinLeaves": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)('Show join/leave messages (invites/removes/bans unaffected)'),
    default: true,
    invertedSettingName: 'hideJoinLeaves'
  },
  "showAvatarChanges": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)('Show avatar changes'),
    default: true,
    invertedSettingName: 'hideAvatarChanges'
  },
  "showDisplaynameChanges": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)('Show display name changes'),
    default: true,
    invertedSettingName: 'hideDisplaynameChanges'
  },
  "showReadReceipts": {
    supportedLevels: LEVELS_ROOM_SETTINGS,
    displayName: (0, _languageHandler._td)('Show read receipts sent by other users'),
    default: true,
    invertedSettingName: 'hideReadReceipts'
  },
  "showTwelveHourTimestamps": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show timestamps in 12 hour format (e.g. 2:30pm)'),
    default: false
  },
  "alwaysShowTimestamps": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Always show message timestamps'),
    default: false
  },
  "autoplayGifs": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Autoplay GIFs'),
    default: false
  },
  "autoplayVideo": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Autoplay videos'),
    default: false
  },
  "enableSyntaxHighlightLanguageDetection": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable automatic language detection for syntax highlighting'),
    default: false
  },
  "expandCodeByDefault": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Expand code blocks by default'),
    default: false
  },
  "showCodeLineNumbers": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show line numbers in code blocks'),
    default: true
  },
  "scrollToBottomOnMessageSent": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Jump to the bottom of the timeline when you send a message'),
    default: true
  },
  "Pill.shouldShowPillAvatar": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show avatars in user and room mentions'),
    default: true,
    invertedSettingName: 'Pill.shouldHidePillAvatar'
  },
  "TextualBody.enableBigEmoji": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable big emoji in chat'),
    default: true,
    invertedSettingName: 'TextualBody.disableBigEmoji'
  },
  "MessageComposerInput.isRichTextEnabled": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false
  },
  "MessageComposer.showFormatting": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false
  },
  "sendTypingNotifications": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Send typing notifications"),
    default: true,
    invertedSettingName: 'dontSendTypingNotifications'
  },
  "showTypingNotifications": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show typing notifications"),
    default: true
  },
  "ctrlFForSearch": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: _Keyboard.IS_MAC ? (0, _languageHandler._td)("Use Command + F to search timeline") : (0, _languageHandler._td)("Use Ctrl + F to search timeline"),
    default: false
  },
  "MessageComposerInput.ctrlEnterToSend": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: _Keyboard.IS_MAC ? (0, _languageHandler._td)("Use Command + Enter to send a message") : (0, _languageHandler._td)("Use Ctrl + Enter to send a message"),
    default: false
  },
  "MessageComposerInput.surroundWith": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Surround selected text when typing special characters"),
    default: false
  },
  "MessageComposerInput.autoReplaceEmoji": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Automatically replace plain text Emoji'),
    default: false
  },
  "MessageComposerInput.useMarkdown": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable Markdown'),
    description: () => (0, _languageHandler._t)("Start messages with <code>/plain</code> to send without markdown and <code>/md</code> to send with.", {}, {
      code: sub => /*#__PURE__*/_react.default.createElement("code", null, sub)
    }),
    default: true
  },
  "VideoView.flipVideoHorizontally": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Mirror local video feed'),
    default: false
  },
  "theme": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: "light",
    controller: new _ThemeController.default()
  },
  "custom_themes": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: []
  },
  "use_system_theme": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: true,
    displayName: (0, _languageHandler._td)("Match system theme")
  },
  "useSystemFont": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false,
    displayName: (0, _languageHandler._td)("Use a system font"),
    controller: new _UseSystemFontController.default()
  },
  "systemFont": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: "",
    displayName: (0, _languageHandler._td)("System font name"),
    controller: new _SystemFontController.default()
  },
  "webRtcAllowPeerToPeer": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    displayName: (0, _languageHandler._td)("Allow Peer-to-Peer for 1:1 calls " + "(if you enable this, the other party might be able to see your IP address)"),
    default: true,
    invertedSettingName: 'webRtcForceTURN'
  },
  "webrtc_audiooutput": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: "default"
  },
  "webrtc_audioinput": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: "default"
  },
  "webrtc_videoinput": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: "default"
  },
  "language": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: "en"
  },
  "breadcrumb_rooms": {
    // not really a setting
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: []
  },
  "recent_emoji": {
    // not really a setting
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: []
  },
  "SpotlightSearch.recentSearches": {
    // not really a setting
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: [] // list of room IDs, most recent first

  },
  "room_directory_servers": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: []
  },
  "integrationProvisioning": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: true
  },
  "allowedWidgets": {
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ROOM_DEVICE],
    supportedLevelsAreOrdered: true,
    default: {} // none allowed

  },
  // Legacy, kept around for transitionary purposes
  "analyticsOptIn": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: false
  },
  "pseudonymousAnalyticsOptIn": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    displayName: (0, _languageHandler._td)('Send analytics data'),
    default: null
  },
  "FTUE.useCaseSelection": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: null
  },
  "autocompleteDelay": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: 200
  },
  "readMarkerInViewThresholdMs": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: 3000
  },
  "readMarkerOutOfViewThresholdMs": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: 30000
  },
  "blacklistUnverifiedDevices": {
    // We specifically want to have room-device > device so that users may set a device default
    // with a per-room override.
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.DEVICE],
    supportedLevelsAreOrdered: true,
    displayName: {
      "default": (0, _languageHandler._td)('Never send encrypted messages to unverified sessions from this session'),
      "room-device": (0, _languageHandler._td)('Never send encrypted messages to unverified sessions in this room from this session')
    },
    default: false,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.AdvancedEncryption)
  },
  "urlPreviewsEnabled": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: {
      "default": (0, _languageHandler._td)('Enable inline URL previews by default'),
      "room-account": (0, _languageHandler._td)("Enable URL previews for this room (only affects you)"),
      "room": (0, _languageHandler._td)("Enable URL previews by default for participants in this room")
    },
    default: true,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.URLPreviews)
  },
  "urlPreviewsEnabled_e2ee": {
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.ROOM_ACCOUNT],
    displayName: {
      "room-account": (0, _languageHandler._td)("Enable URL previews for this room (only affects you)")
    },
    default: false,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.URLPreviews)
  },
  "notificationsEnabled": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false,
    controller: new _NotificationControllers.NotificationsEnabledController()
  },
  "notificationSound": {
    supportedLevels: LEVELS_ROOM_OR_ACCOUNT,
    default: false
  },
  "notificationBodyEnabled": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: true,
    controller: new _NotificationControllers.NotificationBodyEnabledController()
  },
  "audioNotificationsEnabled": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: true
  },
  "enableWidgetScreenshots": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable widget screenshots on supported widgets'),
    default: false
  },
  "promptBeforeInviteUnknownUsers": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Prompt before sending invites to potentially invalid matrix IDs'),
    default: true
  },
  "widgetOpenIDPermissions": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: {
      allow: [],
      deny: []
    }
  },
  // TODO: Remove setting: https://github.com/vector-im/element-web/issues/14373
  "RoomList.orderAlphabetically": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Order rooms by name"),
    default: false
  },
  // TODO: Remove setting: https://github.com/vector-im/element-web/issues/14373
  "RoomList.orderByImportance": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show rooms with unread notifications first"),
    default: true
  },
  "breadcrumbs": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show shortcuts to recently viewed rooms above the room list"),
    default: true,
    controller: new _IncompatibleController.default("feature_breadcrumbs_v2", true)
  },
  "FTUE.userOnboardingButton": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show shortcut to welcome checklist above the room list"),
    default: true
  },
  "showHiddenEventsInTimeline": {
    displayName: (0, _languageHandler._td)("Show hidden events in timeline"),
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "lowBandwidth": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    displayName: (0, _languageHandler._td)('Low bandwidth mode (requires compatible homeserver)'),
    default: false,
    controller: new _ReloadOnChangeController.default()
  },
  "fallbackICEServerAllowed": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("Allow fallback call assist server turn.matrix.org when your homeserver " + "does not offer one (your IP address would be shared during a call)"),
    // This is a tri-state value, where `null` means "prompt the user".
    default: null
  },
  "showImages": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show previews/thumbnails for images"),
    default: true
  },
  "RightPanel.phasesGlobal": {
    supportedLevels: [_SettingLevel.SettingLevel.DEVICE],
    default: null
  },
  "RightPanel.phases": {
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_DEVICE],
    default: null
  },
  "enableEventIndexing": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("Enable message search in encrypted rooms"),
    default: true
  },
  "crawlerSleepTime": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("How fast should messages be downloaded."),
    default: 3000
  },
  "showCallButtonsInComposer": {
    // Dev note: This is no longer "in composer" but is instead "in room header".
    // TODO: Rename with settings v3
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: true,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.Voip)
  },
  "e2ee.manuallyVerifyAllSessions": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("Manually verify all remote sessions"),
    default: false,
    controller: new _OrderedMultiController.OrderedMultiController([// Apply the feature controller first to ensure that the setting doesn't
    // show up and can't be toggled. PushToMatrixClientController doesn't
    // do any overrides anyways.
    new _UIFeatureController.default(_UIFeature.UIFeature.AdvancedEncryption), new _PushToMatrixClientController.default(_client.MatrixClient.prototype.setCryptoTrustCrossSignedDevices, true)])
  },
  "ircDisplayNameWidth": {
    // We specifically want to have room-device > device so that users may set a device default
    // with a per-room override.
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.DEVICE],
    supportedLevelsAreOrdered: true,
    displayName: (0, _languageHandler._td)("IRC display name width"),
    default: 80
  },
  "layout": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: _Layout.Layout.Group
  },
  "Images.size": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: _ImageSize.ImageSize.Normal
  },
  "showChatEffects": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)("Show chat effects (animations when receiving e.g. confetti)"),
    default: true,
    controller: new _ReducedMotionController.default()
  },
  "Performance.addSendMessageTimingMetadata": {
    supportedLevels: [_SettingLevel.SettingLevel.CONFIG],
    default: false
  },
  "Widgets.pinned": {
    // deprecated
    supportedLevels: LEVELS_ROOM_OR_ACCOUNT,
    default: {}
  },
  "Widgets.layout": {
    supportedLevels: LEVELS_ROOM_OR_ACCOUNT,
    default: {}
  },
  "Spaces.allRoomsInHome": {
    displayName: (0, _languageHandler._td)("Show all rooms in Home"),
    description: (0, _languageHandler._td)("All rooms you're in will appear in Home."),
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false
  },
  "Spaces.enabledMetaSpaces": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: {
      [_spaces.MetaSpace.Home]: true
    }
  },
  "Spaces.showPeopleInSpace": {
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_ACCOUNT],
    default: true
  },
  "developerMode": {
    displayName: (0, _languageHandler._td)("Developer mode"),
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false
  },
  "automaticErrorReporting": {
    displayName: (0, _languageHandler._td)("Automatically send debug logs on any error"),
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false,
    controller: new _ReloadOnChangeController.default()
  },
  "automaticDecryptionErrorReporting": {
    displayName: (0, _languageHandler._td)("Automatically send debug logs on decryption errors"),
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false,
    controller: new _ReloadOnChangeController.default()
  },
  "automaticKeyBackNotEnabledReporting": {
    displayName: (0, _languageHandler._td)("Automatically send debug logs when key backup is not functioning"),
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: false
  },
  "debug_scroll_panel": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "debug_timeline_panel": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "debug_registration": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "debug_animation": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "audioInputMuted": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "videoInputMuted": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "activeCallRoomIds": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: []
  },
  [_UIFeature.UIFeature.RoomHistorySettings]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.AdvancedEncryption]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.URLPreviews]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Widgets]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Voip]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Feedback]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Registration]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.PasswordReset]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Deactivate]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.ShareQRCode]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.ShareSocial]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.IdentityServer]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true,
    // Identity server (discovery) settings make no sense if 3PIDs in general are hidden
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.ThirdPartyID)
  },
  [_UIFeature.UIFeature.ThirdPartyID]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.AdvancedSettings]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.TimelineEnableRelativeDates]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  // Electron-specific settings, they are stored by Electron and set/read over an IPC.
  // We store them over there are they are necessary to know before the renderer process launches.
  "Electron.autoLaunch": {
    supportedLevels: [_SettingLevel.SettingLevel.PLATFORM],
    displayName: (0, _languageHandler._td)("Start automatically after system login"),
    default: false
  },
  "Electron.warnBeforeExit": {
    supportedLevels: [_SettingLevel.SettingLevel.PLATFORM],
    displayName: (0, _languageHandler._td)("Warn before quitting"),
    default: true
  },
  "Electron.alwaysShowMenuBar": {
    supportedLevels: [_SettingLevel.SettingLevel.PLATFORM],
    displayName: (0, _languageHandler._td)("Always show the window menu bar"),
    default: false
  },
  "Electron.showTrayIcon": {
    supportedLevels: [_SettingLevel.SettingLevel.PLATFORM],
    displayName: (0, _languageHandler._td)("Show tray icon and minimise window to it on close"),
    default: true
  },
  "Electron.enableHardwareAcceleration": {
    supportedLevels: [_SettingLevel.SettingLevel.PLATFORM],
    displayName: (0, _languageHandler._td)("Enable hardware acceleration"),
    default: true
  }
};
exports.SETTINGS = SETTINGS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMRVZFTFNfUk9PTV9TRVRUSU5HUyIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIlJPT01fREVWSUNFIiwiUk9PTV9BQ0NPVU5UIiwiQUNDT1VOVCIsIkNPTkZJRyIsIkxFVkVMU19ST09NX09SX0FDQ09VTlQiLCJMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00iLCJST09NIiwiTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MiLCJMRVZFTFNfRkVBVFVSRSIsIkxFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyIsIkxFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyIsIkxFVkVMU19VSV9GRUFUVVJFIiwiTGFiR3JvdXAiLCJsYWJHcm91cE5hbWVzIiwiTWVzc2FnaW5nIiwiX3RkIiwiUHJvZmlsZSIsIlNwYWNlcyIsIldpZGdldHMiLCJSb29tcyIsIk1vZGVyYXRpb24iLCJBbmFseXRpY3MiLCJNZXNzYWdlUHJldmlld3MiLCJUaGVtZXMiLCJFbmNyeXB0aW9uIiwiRXhwZXJpbWVudGFsIiwiRGV2ZWxvcGVyIiwiU0VUVElOR1MiLCJpc0ZlYXR1cmUiLCJsYWJzR3JvdXAiLCJkaXNwbGF5TmFtZSIsInN1cHBvcnRlZExldmVscyIsImRlZmF1bHQiLCJjb250cm9sbGVyIiwiUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyIiwiYmV0YUluZm8iLCJ0aXRsZSIsImNhcHRpb24iLCJfdCIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0IiwiZmFxIiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJmZWVkYmFja0xhYmVsIiwiZmVlZGJhY2tTdWJoZWFkaW5nIiwiaW1hZ2UiLCJyZXF1aXJlIiwicmVxdWlyZXNSZWZyZXNoIiwiVGhyZWFkQmV0YUNvbnRyb2xsZXIiLCJhIiwic3ViIiwicmVwbHlJblRocmVhZCIsImxlYXZlVGhlQmV0YSIsIkluY29tcGF0aWJsZUNvbnRyb2xsZXIiLCJGb250V2F0Y2hlciIsIkRFRkFVTFRfU0laRSIsIkZvbnRTaXplQ29udHJvbGxlciIsImludmVydGVkU2V0dGluZ05hbWUiLCJVSUZlYXR1cmVDb250cm9sbGVyIiwiVUlGZWF0dXJlIiwidiIsIkxheW91dCIsIkdyb3VwIiwiSVNfTUFDIiwiZGVzY3JpcHRpb24iLCJjb2RlIiwiVGhlbWVDb250cm9sbGVyIiwiVXNlU3lzdGVtRm9udENvbnRyb2xsZXIiLCJTeXN0ZW1Gb250Q29udHJvbGxlciIsInN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQiLCJBZHZhbmNlZEVuY3J5cHRpb24iLCJVUkxQcmV2aWV3cyIsIk5vdGlmaWNhdGlvbnNFbmFibGVkQ29udHJvbGxlciIsIk5vdGlmaWNhdGlvbkJvZHlFbmFibGVkQ29udHJvbGxlciIsImFsbG93IiwiZGVueSIsIlZvaXAiLCJPcmRlcmVkTXVsdGlDb250cm9sbGVyIiwiUHVzaFRvTWF0cml4Q2xpZW50Q29udHJvbGxlciIsIk1hdHJpeENsaWVudCIsInByb3RvdHlwZSIsInNldENyeXB0b1RydXN0Q3Jvc3NTaWduZWREZXZpY2VzIiwiSW1hZ2VTaXplIiwiTm9ybWFsIiwiUmVkdWNlZE1vdGlvbkNvbnRyb2xsZXIiLCJNZXRhU3BhY2UiLCJIb21lIiwiUm9vbUhpc3RvcnlTZXR0aW5ncyIsIkZlZWRiYWNrIiwiUmVnaXN0cmF0aW9uIiwiUGFzc3dvcmRSZXNldCIsIkRlYWN0aXZhdGUiLCJTaGFyZVFSQ29kZSIsIlNoYXJlU29jaWFsIiwiSWRlbnRpdHlTZXJ2ZXIiLCJUaGlyZFBhcnR5SUQiLCJBZHZhbmNlZFNldHRpbmdzIiwiVGltZWxpbmVFbmFibGVSZWxhdGl2ZURhdGVzIiwiUExBVEZPUk0iXSwic291cmNlcyI6WyIuLi8uLi9zcmMvc2V0dGluZ3MvU2V0dGluZ3MudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTggLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge1xuICAgIE5vdGlmaWNhdGlvbkJvZHlFbmFibGVkQ29udHJvbGxlcixcbiAgICBOb3RpZmljYXRpb25zRW5hYmxlZENvbnRyb2xsZXIsXG59IGZyb20gXCIuL2NvbnRyb2xsZXJzL05vdGlmaWNhdGlvbkNvbnRyb2xsZXJzXCI7XG5pbXBvcnQgVGhlbWVDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvVGhlbWVDb250cm9sbGVyJztcbmltcG9ydCBQdXNoVG9NYXRyaXhDbGllbnRDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvUHVzaFRvTWF0cml4Q2xpZW50Q29udHJvbGxlcic7XG5pbXBvcnQgUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyIGZyb20gXCIuL2NvbnRyb2xsZXJzL1JlbG9hZE9uQ2hhbmdlQ29udHJvbGxlclwiO1xuaW1wb3J0IEZvbnRTaXplQ29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL0ZvbnRTaXplQ29udHJvbGxlcic7XG5pbXBvcnQgU3lzdGVtRm9udENvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9TeXN0ZW1Gb250Q29udHJvbGxlcic7XG5pbXBvcnQgVXNlU3lzdGVtRm9udENvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9Vc2VTeXN0ZW1Gb250Q29udHJvbGxlcic7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBTZXR0aW5nQ29udHJvbGxlciBmcm9tIFwiLi9jb250cm9sbGVycy9TZXR0aW5nQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgSVNfTUFDIH0gZnJvbSAnLi4vS2V5Ym9hcmQnO1xuaW1wb3J0IFVJRmVhdHVyZUNvbnRyb2xsZXIgZnJvbSBcIi4vY29udHJvbGxlcnMvVUlGZWF0dXJlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgVUlGZWF0dXJlIH0gZnJvbSBcIi4vVUlGZWF0dXJlXCI7XG5pbXBvcnQgeyBPcmRlcmVkTXVsdGlDb250cm9sbGVyIH0gZnJvbSBcIi4vY29udHJvbGxlcnMvT3JkZXJlZE11bHRpQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSBcIi4vZW51bXMvTGF5b3V0XCI7XG5pbXBvcnQgUmVkdWNlZE1vdGlvbkNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9SZWR1Y2VkTW90aW9uQ29udHJvbGxlcic7XG5pbXBvcnQgSW5jb21wYXRpYmxlQ29udHJvbGxlciBmcm9tIFwiLi9jb250cm9sbGVycy9JbmNvbXBhdGlibGVDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBJbWFnZVNpemUgfSBmcm9tIFwiLi9lbnVtcy9JbWFnZVNpemVcIjtcbmltcG9ydCB7IE1ldGFTcGFjZSB9IGZyb20gXCIuLi9zdG9yZXMvc3BhY2VzXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi9TZGtDb25maWdcIjtcbmltcG9ydCBUaHJlYWRCZXRhQ29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL1RocmVhZEJldGFDb250cm9sbGVyJztcbmltcG9ydCB7IEZvbnRXYXRjaGVyIH0gZnJvbSBcIi4vd2F0Y2hlcnMvRm9udFdhdGNoZXJcIjtcblxuLy8gVGhlc2UgYXJlIGp1c3QgYSBidW5jaCBvZiBoZWxwZXIgYXJyYXlzIHRvIGF2b2lkIGNvcHkvcGFzdGluZyBhIGJ1bmNoIG9mIHRpbWVzXG5jb25zdCBMRVZFTFNfUk9PTV9TRVRUSU5HUyA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgIFNldHRpbmdMZXZlbC5ST09NX0RFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5ULFxuICAgIFNldHRpbmdMZXZlbC5BQ0NPVU5ULFxuICAgIFNldHRpbmdMZXZlbC5DT05GSUcsXG5dO1xuY29uc3QgTEVWRUxTX1JPT01fT1JfQUNDT1VOVCA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5ULFxuICAgIFNldHRpbmdMZXZlbC5BQ0NPVU5ULFxuXTtcbmNvbnN0IExFVkVMU19ST09NX1NFVFRJTkdTX1dJVEhfUk9PTSA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgIFNldHRpbmdMZXZlbC5ST09NX0RFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5ULFxuICAgIFNldHRpbmdMZXZlbC5BQ0NPVU5ULFxuICAgIFNldHRpbmdMZXZlbC5DT05GSUcsXG4gICAgU2V0dGluZ0xldmVsLlJPT00sXG5dO1xuY29uc3QgTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MgPSBbXG4gICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuQUNDT1VOVCxcbiAgICBTZXR0aW5nTGV2ZWwuQ09ORklHLFxuXTtcbmNvbnN0IExFVkVMU19GRUFUVVJFID0gW1xuICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgU2V0dGluZ0xldmVsLkNPTkZJRyxcbl07XG5jb25zdCBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MgPSBbXG4gICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbl07XG5jb25zdCBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcgPSBbXG4gICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuQ09ORklHLFxuXTtcbmNvbnN0IExFVkVMU19VSV9GRUFUVVJFID0gW1xuICAgIFNldHRpbmdMZXZlbC5DT05GSUcsXG4gICAgLy8gaW4gZnV0dXJlIHdlIG1pZ2h0IGhhdmUgYSAud2VsbC1rbm93biBsZXZlbCBvciBzb21ldGhpbmdcbl07XG5cbmV4cG9ydCBlbnVtIExhYkdyb3VwIHtcbiAgICBNZXNzYWdpbmcsXG4gICAgUHJvZmlsZSxcbiAgICBTcGFjZXMsXG4gICAgV2lkZ2V0cyxcbiAgICBSb29tcyxcbiAgICBNb2RlcmF0aW9uLFxuICAgIEFuYWx5dGljcyxcbiAgICBNZXNzYWdlUHJldmlld3MsXG4gICAgVGhlbWVzLFxuICAgIEVuY3J5cHRpb24sXG4gICAgRXhwZXJpbWVudGFsLFxuICAgIERldmVsb3Blcixcbn1cblxuZXhwb3J0IGNvbnN0IGxhYkdyb3VwTmFtZXM6IFJlY29yZDxMYWJHcm91cCwgc3RyaW5nPiA9IHtcbiAgICBbTGFiR3JvdXAuTWVzc2FnaW5nXTogX3RkKFwiTWVzc2FnaW5nXCIpLFxuICAgIFtMYWJHcm91cC5Qcm9maWxlXTogX3RkKFwiUHJvZmlsZVwiKSxcbiAgICBbTGFiR3JvdXAuU3BhY2VzXTogX3RkKFwiU3BhY2VzXCIpLFxuICAgIFtMYWJHcm91cC5XaWRnZXRzXTogX3RkKFwiV2lkZ2V0c1wiKSxcbiAgICBbTGFiR3JvdXAuUm9vbXNdOiBfdGQoXCJSb29tc1wiKSxcbiAgICBbTGFiR3JvdXAuTW9kZXJhdGlvbl06IF90ZChcIk1vZGVyYXRpb25cIiksXG4gICAgW0xhYkdyb3VwLkFuYWx5dGljc106IF90ZChcIkFuYWx5dGljc1wiKSxcbiAgICBbTGFiR3JvdXAuTWVzc2FnZVByZXZpZXdzXTogX3RkKFwiTWVzc2FnZSBQcmV2aWV3c1wiKSxcbiAgICBbTGFiR3JvdXAuVGhlbWVzXTogX3RkKFwiVGhlbWVzXCIpLFxuICAgIFtMYWJHcm91cC5FbmNyeXB0aW9uXTogX3RkKFwiRW5jcnlwdGlvblwiKSxcbiAgICBbTGFiR3JvdXAuRXhwZXJpbWVudGFsXTogX3RkKFwiRXhwZXJpbWVudGFsXCIpLFxuICAgIFtMYWJHcm91cC5EZXZlbG9wZXJdOiBfdGQoXCJEZXZlbG9wZXJcIiksXG59O1xuXG5leHBvcnQgdHlwZSBTZXR0aW5nVmFsdWVUeXBlID0gYm9vbGVhbiB8XG4gICAgbnVtYmVyIHxcbiAgICBzdHJpbmcgfFxuICAgIG51bWJlcltdIHxcbiAgICBzdHJpbmdbXSB8XG4gICAgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUJhc2VTZXR0aW5nPFQgZXh0ZW5kcyBTZXR0aW5nVmFsdWVUeXBlID0gU2V0dGluZ1ZhbHVlVHlwZT4ge1xuICAgIGlzRmVhdHVyZT86IGZhbHNlIHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gRGlzcGxheSBuYW1lcyBhcmUgc3Ryb25nbHkgcmVjb21tZW5kZWQgZm9yIGNsYXJpdHkuXG4gICAgLy8gRGlzcGxheSBuYW1lIGNhbiBhbHNvIGJlIGFuIG9iamVjdCBmb3IgZGlmZmVyZW50IGxldmVscy5cbiAgICBkaXNwbGF5TmFtZT86IHN0cmluZyB8IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIHRoZSBrZXkgdG8gYmUgYSBzdHJpbmcsIGJ1dCB3ZSBrbm93IGJldHRlclxuICAgICAgICBbbGV2ZWw6IFNldHRpbmdMZXZlbF06IHN0cmluZztcbiAgICB9O1xuXG4gICAgLy8gT3B0aW9uYWwgZGVzY3JpcHRpb24gd2hpY2ggd2lsbCBiZSBzaG93biBhcyBtaWNyb0NvcHkgdW5kZXIgU2V0dGluZ3NGbGFnc1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nIHwgKCgpID0+IFJlYWN0Tm9kZSk7XG5cbiAgICAvLyBUaGUgc3VwcG9ydGVkIGxldmVscyBhcmUgcmVxdWlyZWQuIFByZWZlcmFibHksIHVzZSB0aGUgcHJlc2V0IGFycmF5c1xuICAgIC8vIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlIHRvIGRlZmluZSB0aGlzIHJhdGhlciB0aGFuIGEgY3VzdG9tIGFycmF5LlxuICAgIHN1cHBvcnRlZExldmVscz86IFNldHRpbmdMZXZlbFtdO1xuXG4gICAgLy8gUmVxdWlyZWQuIENhbiBiZSBhbnkgZGF0YSB0eXBlLiBUaGUgdmFsdWUgc3BlY2lmaWVkIGhlcmUgc2hvdWxkIG1hdGNoXG4gICAgLy8gdGhlIGRhdGEgYmVpbmcgc3RvcmVkIChpZTogaWYgYSBib29sZWFuIGlzIHVzZWQsIHRoZSBzZXR0aW5nIHNob3VsZFxuICAgIC8vIHJlcHJlc2VudCBhIGJvb2xlYW4pLlxuICAgIGRlZmF1bHQ6IFQ7XG5cbiAgICAvLyBPcHRpb25hbCBzZXR0aW5ncyBjb250cm9sbGVyLiBTZWUgU2V0dGluZ3NDb250cm9sbGVyIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgIGNvbnRyb2xsZXI/OiBTZXR0aW5nQ29udHJvbGxlcjtcblxuICAgIC8vIE9wdGlvbmFsIGZsYWcgdG8gbWFrZSBzdXBwb3J0ZWRMZXZlbHMgYmUgcmVzcGVjdGVkIGFzIHRoZSBvcmRlciB0byBoYW5kbGVcbiAgICAvLyBzZXR0aW5ncy4gVGhlIGZpcnN0IGVsZW1lbnQgaXMgdHJlYXRlZCBhcyBcIm1vc3QgcHJlZmVycmVkXCIuIFRoZSBcImRlZmF1bHRcIlxuICAgIC8vIGxldmVsIGlzIGFsd2F5cyBhcHBlbmRlZCB0byB0aGUgZW5kLlxuICAgIHN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQ/OiBib29sZWFuO1xuXG4gICAgLy8gT3B0aW9uYWwgdmFsdWUgdG8gaW52ZXJ0IGEgYm9vbGVhbiBzZXR0aW5nJ3MgdmFsdWUuIFRoZSBzdHJpbmcgZ2l2ZW4gd2lsbFxuICAgIC8vIGJlIHJlYWQgYXMgdGhlIHNldHRpbmcncyBJRCBpbnN0ZWFkIG9mIHRoZSBvbmUgcHJvdmlkZWQgYXMgdGhlIGtleSBmb3IgdGhlXG4gICAgLy8gc2V0dGluZyBkZWZpbml0aW9uLiBCeSBzZXR0aW5nIHRoaXMsIHRoZSByZXR1cm5lZCB2YWx1ZSB3aWxsIGF1dG9tYXRpY2FsbHlcbiAgICAvLyBiZSBpbnZlcnRlZCwgZXhjZXB0IGZvciB3aGVuIHRoZSBkZWZhdWx0IHZhbHVlIGlzIHJldHVybmVkLiBJbnZlcnNpb24gd2lsbFxuICAgIC8vIG9jY3VyIGFmdGVyIHRoZSBjb250cm9sbGVyIGlzIGFza2VkIGZvciBhbiBvdmVycmlkZS4gVGhpcyBzaG91bGQgYmUgdXNlZCBieVxuICAgIC8vIGhpc3RvcmljYWwgc2V0dGluZ3Mgd2hpY2ggd2UgZG9uJ3Qgd2FudCBleGlzdGluZyB1c2VyJ3MgdmFsdWVzIGJlIHdpcGVkLiBEb1xuICAgIC8vIG5vdCB1c2UgdGhpcyBmb3IgbmV3IHNldHRpbmdzLlxuICAgIGludmVydGVkU2V0dGluZ05hbWU/OiBzdHJpbmc7XG5cbiAgICAvLyBYWFg6IEtlZXAgdGhpcyBhcm91bmQgZm9yIHJlLXVzZSBpbiBmdXR1cmUgQmV0YXNcbiAgICBiZXRhSW5mbz86IHtcbiAgICAgICAgdGl0bGU6IHN0cmluZzsgLy8gX3RkXG4gICAgICAgIGNhcHRpb246ICgpID0+IFJlYWN0Tm9kZTtcbiAgICAgICAgZmFxPzogKGVuYWJsZWQ6IGJvb2xlYW4pID0+IFJlYWN0Tm9kZTtcbiAgICAgICAgaW1hZ2U/OiBzdHJpbmc7IC8vIHJlcXVpcmUoLi4uKVxuICAgICAgICBmZWVkYmFja1N1YmhlYWRpbmc/OiBzdHJpbmc7XG4gICAgICAgIGZlZWRiYWNrTGFiZWw/OiBzdHJpbmc7XG4gICAgICAgIGV4dHJhU2V0dGluZ3M/OiBzdHJpbmdbXTtcbiAgICAgICAgcmVxdWlyZXNSZWZyZXNoPzogYm9vbGVhbjtcbiAgICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElGZWF0dXJlIGV4dGVuZHMgT21pdDxJQmFzZVNldHRpbmc8Ym9vbGVhbj4sIFwiaXNGZWF0dXJlXCI+IHtcbiAgICAvLyBNdXN0IGJlIHNldCB0byB0cnVlIGZvciBmZWF0dXJlcy5cbiAgICBpc0ZlYXR1cmU6IHRydWU7XG4gICAgbGFic0dyb3VwOiBMYWJHcm91cDtcbn1cblxuLy8gVHlwZSB1c2luZyBJLWlkZW50aWZpZXIgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGZyb20gYmVmb3JlIGl0IGJlY2FtZSBhIGRpc2NyaW1pbmF0ZWQgdW5pb25cbmV4cG9ydCB0eXBlIElTZXR0aW5nID0gSUJhc2VTZXR0aW5nIHwgSUZlYXR1cmU7XG5cbmV4cG9ydCBjb25zdCBTRVRUSU5HUzoge1tzZXR0aW5nOiBzdHJpbmddOiBJU2V0dGluZ30gPSB7XG4gICAgXCJmZWF0dXJlX3ZpZGVvX3Jvb21zXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBsYWJzR3JvdXA6IExhYkdyb3VwLlJvb21zLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiVmlkZW8gcm9vbXNcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAvLyBSZWxvYWQgdG8gZW5zdXJlIHRoYXQgdGhlIGxlZnQgcGFuZWwgZXRjLiBnZXQgcmVtb3VudGVkXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBSZWxvYWRPbkNoYW5nZUNvbnRyb2xsZXIoKSxcbiAgICAgICAgYmV0YUluZm86IHtcbiAgICAgICAgICAgIHRpdGxlOiBfdGQoXCJWaWRlbyByb29tc1wiKSxcbiAgICAgICAgICAgIGNhcHRpb246ICgpID0+IDw+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBIG5ldyB3YXkgdG8gY2hhdCBvdmVyIHZvaWNlIGFuZCB2aWRlbyBpbiAlKGJyYW5kKXMuXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBTZGtDb25maWcuZ2V0KCkuYnJhbmQsXG4gICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJWaWRlbyByb29tcyBhcmUgYWx3YXlzLW9uIFZvSVAgY2hhbm5lbHMgZW1iZWRkZWQgd2l0aGluIGEgcm9vbSBpbiAlKGJyYW5kKXMuXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kOiBTZGtDb25maWcuZ2V0KCkuYnJhbmQsXG4gICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8Lz4sXG4gICAgICAgICAgICBmYXE6ICgpID0+XG4gICAgICAgICAgICAgICAgU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsICYmIDw+XG4gICAgICAgICAgICAgICAgICAgIDxoND57IF90KFwiSG93IGNhbiBJIGNyZWF0ZSBhIHZpZGVvIHJvb20/XCIpIH08L2g0PlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiVXNlIHRoZSDigJwr4oCdIGJ1dHRvbiBpbiB0aGUgcm9vbSBzZWN0aW9uIG9mIHRoZSBsZWZ0IHBhbmVsLlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8aDQ+eyBfdChcIkNhbiBJIHVzZSB0ZXh0IGNoYXQgYWxvbmdzaWRlIHRoZSB2aWRlbyBjYWxsP1wiKSB9PC9oND5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIlllcywgdGhlIGNoYXQgdGltZWxpbmUgaXMgZGlzcGxheWVkIGFsb25nc2lkZSB0aGUgdmlkZW8uXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPC8+LFxuICAgICAgICAgICAgZmVlZGJhY2tMYWJlbDogXCJ2aWRlby1yb29tLWZlZWRiYWNrXCIsXG4gICAgICAgICAgICBmZWVkYmFja1N1YmhlYWRpbmc6IF90ZChcIlRoYW5rIHlvdSBmb3IgdHJ5aW5nIHRoZSBiZXRhLCBcIiArXG4gICAgICAgICAgICAgICAgXCJwbGVhc2UgZ28gaW50byBhcyBtdWNoIGRldGFpbCBhcyB5b3UgY2FuIHNvIHdlIGNhbiBpbXByb3ZlIGl0LlwiKSxcbiAgICAgICAgICAgIGltYWdlOiByZXF1aXJlKFwiLi4vLi4vcmVzL2ltZy9iZXRhcy92aWRlb19yb29tcy5wbmdcIiksXG4gICAgICAgICAgICByZXF1aXJlc1JlZnJlc2g6IHRydWUsXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBcImZlYXR1cmVfZXhwbG9yaW5nX3B1YmxpY19zcGFjZXNcIjoge1xuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiRXhwbG9yZSBwdWJsaWMgc3BhY2VzIGluIHRoZSBuZXcgc2VhcmNoIGRpYWxvZ1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfbXNjMzUzMV9oaWRlX21lc3NhZ2VzX3BlbmRpbmdfbW9kZXJhdGlvblwiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgbGFic0dyb3VwOiBMYWJHcm91cC5Nb2RlcmF0aW9uLFxuICAgICAgICAvLyBSZXF1aXJlcyBhIHJlbG9hZCBzaW5jZSB0aGlzIHNldHRpbmcgaXMgY2FjaGVkIGluIEV2ZW50VXRpbHNcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFJlbG9hZE9uQ2hhbmdlQ29udHJvbGxlcigpLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiTGV0IG1vZGVyYXRvcnMgaGlkZSBtZXNzYWdlcyBwZW5kaW5nIG1vZGVyYXRpb24uXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9yZXBvcnRfdG9fbW9kZXJhdG9yc1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgbGFic0dyb3VwOiBMYWJHcm91cC5Nb2RlcmF0aW9uLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiUmVwb3J0IHRvIG1vZGVyYXRvcnMgcHJvdG90eXBlLiBcIiArXG4gICAgICAgICAgICBcIkluIHJvb21zIHRoYXQgc3VwcG9ydCBtb2RlcmF0aW9uLCB0aGUgYHJlcG9ydGAgYnV0dG9uIHdpbGwgbGV0IHlvdSByZXBvcnQgYWJ1c2UgdG8gcm9vbSBtb2RlcmF0b3JzXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9sYXRleF9tYXRoc1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgbGFic0dyb3VwOiBMYWJHcm91cC5NZXNzYWdpbmcsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJSZW5kZXIgTGFUZVggbWF0aHMgaW4gbWVzc2FnZXNcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX3Bpbm5pbmdcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGxhYnNHcm91cDogTGFiR3JvdXAuTWVzc2FnaW5nLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiTWVzc2FnZSBQaW5uaW5nXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV90aHJlYWRcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGxhYnNHcm91cDogTGFiR3JvdXAuTWVzc2FnaW5nLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVGhyZWFkQmV0YUNvbnRyb2xsZXIoKSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlRocmVhZGVkIG1lc3NhZ2luZ1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGJldGFJbmZvOiB7XG4gICAgICAgICAgICB0aXRsZTogX3RkKFwiVGhyZWFkc1wiKSxcbiAgICAgICAgICAgIGNhcHRpb246ICgpID0+IDw+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIktlZXAgZGlzY3Vzc2lvbnMgb3JnYW5pc2VkIHdpdGggdGhyZWFkcy5cIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57IF90KFwiVGhyZWFkcyBoZWxwIGtlZXAgY29udmVyc2F0aW9ucyBvbi10b3BpYyBhbmQgZWFzeSB0byB0cmFjay4gPGE+TGVhcm4gbW9yZTwvYT4uXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgIGE6IChzdWIpID0+IDxhIGhyZWY9XCJodHRwczovL2VsZW1lbnQuaW8vaGVscCN0aHJlYWRzXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICA8L2E+LFxuICAgICAgICAgICAgICAgIH0pIH08L3A+XG4gICAgICAgICAgICA8Lz4sXG4gICAgICAgICAgICBmYXE6ICgpID0+XG4gICAgICAgICAgICAgICAgU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsICYmIDw+XG4gICAgICAgICAgICAgICAgICAgIDxoND57IF90KFwiSG93IGNhbiBJIHN0YXJ0IGEgdGhyZWFkP1wiKSB9PC9oND5cbiAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiVXNlIOKAnCUocmVwbHlJblRocmVhZClz4oCdIHdoZW4gaG92ZXJpbmcgb3ZlciBhIG1lc3NhZ2UuXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUluVGhyZWFkOiBfdChcIlJlcGx5IGluIHRocmVhZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8aDQ+eyBfdChcIkhvdyBjYW4gSSBsZWF2ZSB0aGUgYmV0YT9cIikgfTwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlRvIGxlYXZlLCByZXR1cm4gdG8gdGhpcyBwYWdlIGFuZCB1c2UgdGhlIOKAnCUobGVhdmVUaGVCZXRhKXPigJ0gYnV0dG9uLlwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVhdmVUaGVCZXRhOiBfdChcIkxlYXZlIHRoZSBiZXRhXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPC8+LFxuICAgICAgICAgICAgZmVlZGJhY2tMYWJlbDogXCJ0aHJlYWQtZmVlZGJhY2tcIixcbiAgICAgICAgICAgIGZlZWRiYWNrU3ViaGVhZGluZzogX3RkKFwiVGhhbmsgeW91IGZvciB0cnlpbmcgdGhlIGJldGEsIFwiICtcbiAgICAgICAgICAgICAgICBcInBsZWFzZSBnbyBpbnRvIGFzIG11Y2ggZGV0YWlsIGFzIHlvdSBjYW4gc28gd2UgY2FuIGltcHJvdmUgaXQuXCIpLFxuICAgICAgICAgICAgaW1hZ2U6IHJlcXVpcmUoXCIuLi8uLi9yZXMvaW1nL2JldGFzL3RocmVhZHMucG5nXCIpLFxuICAgICAgICAgICAgcmVxdWlyZXNSZWZyZXNoOiB0cnVlLFxuICAgICAgICB9LFxuXG4gICAgfSxcbiAgICBcImZlYXR1cmVfc3RhdGVfY291bnRlcnNcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGxhYnNHcm91cDogTGFiR3JvdXAuUm9vbXMsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJSZW5kZXIgc2ltcGxlIGNvdW50ZXJzIGluIHJvb20gaGVhZGVyXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9tam9sbmlyXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBsYWJzR3JvdXA6IExhYkdyb3VwLk1vZGVyYXRpb24sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJUcnkgb3V0IG5ldyB3YXlzIHRvIGlnbm9yZSBwZW9wbGUgKGV4cGVyaW1lbnRhbClcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX2N1c3RvbV90aGVtZXNcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGxhYnNHcm91cDogTGFiR3JvdXAuVGhlbWVzLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU3VwcG9ydCBhZGRpbmcgY3VzdG9tIHRoZW1lc1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfcm9vbWxpc3RfcHJldmlld19yZWFjdGlvbnNfZG1zXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBsYWJzR3JvdXA6IExhYkdyb3VwLk1lc3NhZ2VQcmV2aWV3cyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgbWVzc2FnZSBwcmV2aWV3cyBmb3IgcmVhY3Rpb25zIGluIERNc1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIC8vIHRoaXMgb3B0aW9uIGlzIGEgc3Vic2V0IG9mIGBmZWF0dXJlX3Jvb21saXN0X3ByZXZpZXdfcmVhY3Rpb25zX2FsbGAgc28gZGlzYWJsZSBpdCB3aGVuIHRoYXQgb25lIGlzIGVuYWJsZWRcbiAgICAgICAgY29udHJvbGxlcjogbmV3IEluY29tcGF0aWJsZUNvbnRyb2xsZXIoXCJmZWF0dXJlX3Jvb21saXN0X3ByZXZpZXdfcmVhY3Rpb25zX2FsbFwiKSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9yb29tbGlzdF9wcmV2aWV3X3JlYWN0aW9uc19hbGxcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGxhYnNHcm91cDogTGFiR3JvdXAuTWVzc2FnZVByZXZpZXdzLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBtZXNzYWdlIHByZXZpZXdzIGZvciByZWFjdGlvbnMgaW4gYWxsIHJvb21zXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9kZWh5ZHJhdGlvblwiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgbGFic0dyb3VwOiBMYWJHcm91cC5FbmNyeXB0aW9uLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiT2ZmbGluZSBlbmNyeXB0ZWQgbWVzc2FnaW5nIHVzaW5nIGRlaHlkcmF0ZWQgZGV2aWNlc1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfZXh0ZW5zaWJsZV9ldmVudHNcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGxhYnNHcm91cDogTGFiR3JvdXAuRGV2ZWxvcGVyLCAvLyBkZXZlbG9wZXIgZm9yIG5vdywgZXZlbnR1YWxseSBNZXNzYWdpbmcgYW5kIGRlZmF1bHQgb25cbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgZXh0ZW5zaWJsZSBldmVudCByZXByZXNlbnRhdGlvbiBvZiBldmVudHNcIiksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJ1c2VPbmx5Q3VycmVudFByb2ZpbGVzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgY3VycmVudCBhdmF0YXIgYW5kIG5hbWUgZm9yIHVzZXJzIGluIG1lc3NhZ2UgaGlzdG9yeVwiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIm1qb2xuaXJSb29tc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcIm1qb2xuaXJQZXJzb25hbFJvb21cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuQUNDT1VOVF0sXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfaHRtbF90b3BpY1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgbGFic0dyb3VwOiBMYWJHcm91cC5Sb29tcyxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgSFRNTCByZXByZXNlbnRhdGlvbiBvZiByb29tIHRvcGljc1wiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfYnJpZGdlX3N0YXRlXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBsYWJzR3JvdXA6IExhYkdyb3VwLlJvb21zLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBpbmZvIGFib3V0IGJyaWRnZXMgaW4gcm9vbSBzZXR0aW5nc1wiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfYnJlYWRjcnVtYnNfdjJcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGxhYnNHcm91cDogTGFiR3JvdXAuUm9vbXMsXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJVc2UgbmV3IHJvb20gYnJlYWRjcnVtYnNcIiksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX3JpZ2h0X3BhbmVsX2RlZmF1bHRfb3BlblwiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgbGFic0dyb3VwOiBMYWJHcm91cC5Sb29tcyxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlJpZ2h0IHBhbmVsIHN0YXlzIG9wZW4gKGRlZmF1bHRzIHRvIHJvb20gbWVtYmVyIGxpc3QpXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9qdW1wX3RvX2RhdGVcIjoge1xuICAgICAgICAvLyBXZSBwdXJwb3NlbHkgbGVhdmUgb3V0IGBpc0ZlYXR1cmU6IHRydWVgIHNvIGl0IGRvZXNuJ3Qgc2hvdyBpbiBMYWJzXG4gICAgICAgIC8vIGJ5IGRlZmF1bHQuIFdlIHdpbGwgY29uZGl0aW9uYWxseSBzaG93IGl0IGRlcGVuZGluZyBvbiB3aGV0aGVyIHdlIGNhblxuICAgICAgICAvLyBkZXRlY3QgTVNDMzAzMCBzdXBwb3J0IChzZWUgTGFiVXNlclNldHRpbmdzVGFiLnRzeCkuXG4gICAgICAgIC8vIGxhYnNHcm91cDogTGFiR3JvdXAuTWVzc2FnaW5nLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiSnVtcCB0byBkYXRlIChhZGRzIC9qdW1wdG9kYXRlIGFuZCBqdW1wIHRvIGRhdGUgaGVhZGVycylcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJSb29tTGlzdC5iYWNrZ3JvdW5kSW1hZ2VcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgIH0sXG4gICAgXCJzZW5kUmVhZFJlY2VpcHRzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNlbmQgcmVhZCByZWNlaXB0c1wiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9sb2NhdGlvbl9zaGFyZV9saXZlXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBsYWJzR3JvdXA6IExhYkdyb3VwLk1lc3NhZ2luZyxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcbiAgICAgICAgICAgIFwiTGl2ZSBMb2NhdGlvbiBTaGFyaW5nICh0ZW1wb3JhcnkgaW1wbGVtZW50YXRpb246IGxvY2F0aW9ucyBwZXJzaXN0IGluIHJvb20gaGlzdG9yeSlcIixcbiAgICAgICAgKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfZmF2b3VyaXRlX21lc3NhZ2VzXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBsYWJzR3JvdXA6IExhYkdyb3VwLk1lc3NhZ2luZyxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkZhdm91cml0ZSBNZXNzYWdlcyAodW5kZXIgYWN0aXZlIGRldmVsb3BtZW50KVwiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfbmV3X2RldmljZV9tYW5hZ2VyXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBsYWJzR3JvdXA6IExhYkdyb3VwLkV4cGVyaW1lbnRhbCxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlVzZSBuZXcgc2Vzc2lvbiBtYW5hZ2VyICh1bmRlciBhY3RpdmUgZGV2ZWxvcG1lbnQpXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiYmFzZUZvbnRTaXplXCI6IHtcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkZvbnQgc2l6ZVwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogRm9udFdhdGNoZXIuREVGQVVMVF9TSVpFLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgRm9udFNpemVDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcInVzZUN1c3RvbUZvbnRTaXplXCI6IHtcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlVzZSBjdXN0b20gc2l6ZVwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIk1lc3NhZ2VDb21wb3NlcklucHV0LnN1Z2dlc3RFbW9qaVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBFbW9qaSBzdWdnZXN0aW9ucyB3aGlsZSB0eXBpbmcnKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgaW52ZXJ0ZWRTZXR0aW5nTmFtZTogJ01lc3NhZ2VDb21wb3NlcklucHV0LmRvbnRTdWdnZXN0RW1vamknLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93U3RpY2tlcnNCdXR0b25cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IHN0aWNrZXJzIGJ1dHRvbicpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVUlGZWF0dXJlQ29udHJvbGxlcihVSUZlYXR1cmUuV2lkZ2V0cywgZmFsc2UpLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93UG9sbHNCdXR0b25cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IHBvbGxzIGJ1dHRvbicpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5pbnNlcnRUcmFpbGluZ0NvbG9uXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnSW5zZXJ0IGEgdHJhaWxpbmcgY29sb24gYWZ0ZXIgdXNlciBtZW50aW9ucyBhdCB0aGUgc3RhcnQgb2YgYSBtZXNzYWdlJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICAvLyBUT0RPOiBXaXJlIHVwIGFwcHJvcHJpYXRlbHkgdG8gVUkgKEZUVUUgbm90aWZpY2F0aW9ucylcbiAgICBcIk5vdGlmaWNhdGlvbnMuYWx3YXlzU2hvd0JhZGdlQ291bnRzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9PUl9BQ0NPVU5ULFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwidXNlQ29tcGFjdExheW91dFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiVXNlIGEgbW9yZSBjb21wYWN0ICdNb2Rlcm4nIGxheW91dFwiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBJbmNvbXBhdGlibGVDb250cm9sbGVyKFwibGF5b3V0XCIsIGZhbHNlLCB2ID0+IHYgIT09IExheW91dC5Hcm91cCksXG4gICAgfSxcbiAgICBcInNob3dSZWRhY3Rpb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1Nob3cgYSBwbGFjZWhvbGRlciBmb3IgcmVtb3ZlZCBtZXNzYWdlcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZVJlZGFjdGlvbnMnLFxuICAgIH0sXG4gICAgXCJzaG93Sm9pbkxlYXZlc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fU0VUVElOR1NfV0lUSF9ST09NLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGpvaW4vbGVhdmUgbWVzc2FnZXMgKGludml0ZXMvcmVtb3Zlcy9iYW5zIHVuYWZmZWN0ZWQpJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdoaWRlSm9pbkxlYXZlcycsXG4gICAgfSxcbiAgICBcInNob3dBdmF0YXJDaGFuZ2VzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1Nob3cgYXZhdGFyIGNoYW5nZXMnKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgaW52ZXJ0ZWRTZXR0aW5nTmFtZTogJ2hpZGVBdmF0YXJDaGFuZ2VzJyxcbiAgICB9LFxuICAgIFwic2hvd0Rpc3BsYXluYW1lQ2hhbmdlc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fU0VUVElOR1NfV0lUSF9ST09NLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGRpc3BsYXkgbmFtZSBjaGFuZ2VzJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdoaWRlRGlzcGxheW5hbWVDaGFuZ2VzJyxcbiAgICB9LFxuICAgIFwic2hvd1JlYWRSZWNlaXB0c1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1Nob3cgcmVhZCByZWNlaXB0cyBzZW50IGJ5IG90aGVyIHVzZXJzJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdoaWRlUmVhZFJlY2VpcHRzJyxcbiAgICB9LFxuICAgIFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnU2hvdyB0aW1lc3RhbXBzIGluIDEyIGhvdXIgZm9ybWF0IChlLmcuIDI6MzBwbSknKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImFsd2F5c1Nob3dUaW1lc3RhbXBzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnQWx3YXlzIHNob3cgbWVzc2FnZSB0aW1lc3RhbXBzJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJhdXRvcGxheUdpZnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdBdXRvcGxheSBHSUZzJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJhdXRvcGxheVZpZGVvXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnQXV0b3BsYXkgdmlkZW9zJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJlbmFibGVTeW50YXhIaWdobGlnaHRMYW5ndWFnZURldGVjdGlvblwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBhdXRvbWF0aWMgbGFuZ3VhZ2UgZGV0ZWN0aW9uIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJleHBhbmRDb2RlQnlEZWZhdWx0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnRXhwYW5kIGNvZGUgYmxvY2tzIGJ5IGRlZmF1bHQnKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNob3dDb2RlTGluZU51bWJlcnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGxpbmUgbnVtYmVycyBpbiBjb2RlIGJsb2NrcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJzY3JvbGxUb0JvdHRvbU9uTWVzc2FnZVNlbnRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdKdW1wIHRvIHRoZSBib3R0b20gb2YgdGhlIHRpbWVsaW5lIHdoZW4geW91IHNlbmQgYSBtZXNzYWdlJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGF2YXRhcnMgaW4gdXNlciBhbmQgcm9vbSBtZW50aW9ucycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnUGlsbC5zaG91bGRIaWRlUGlsbEF2YXRhcicsXG4gICAgfSxcbiAgICBcIlRleHR1YWxCb2R5LmVuYWJsZUJpZ0Vtb2ppXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnRW5hYmxlIGJpZyBlbW9qaSBpbiBjaGF0JyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdUZXh0dWFsQm9keS5kaXNhYmxlQmlnRW1vamknLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5pc1JpY2hUZXh0RW5hYmxlZFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXIuc2hvd0Zvcm1hdHRpbmdcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwic2VuZFR5cGluZ05vdGlmaWNhdGlvbnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2VuZCB0eXBpbmcgbm90aWZpY2F0aW9uc1wiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgaW52ZXJ0ZWRTZXR0aW5nTmFtZTogJ2RvbnRTZW5kVHlwaW5nTm90aWZpY2F0aW9ucycsXG4gICAgfSxcbiAgICBcInNob3dUeXBpbmdOb3RpZmljYXRpb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgdHlwaW5nIG5vdGlmaWNhdGlvbnNcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcImN0cmxGRm9yU2VhcmNoXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IElTX01BQyA/IF90ZChcIlVzZSBDb21tYW5kICsgRiB0byBzZWFyY2ggdGltZWxpbmVcIikgOiBfdGQoXCJVc2UgQ3RybCArIEYgdG8gc2VhcmNoIHRpbWVsaW5lXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuY3RybEVudGVyVG9TZW5kXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IElTX01BQyA/IF90ZChcIlVzZSBDb21tYW5kICsgRW50ZXIgdG8gc2VuZCBhIG1lc3NhZ2VcIikgOiBfdGQoXCJVc2UgQ3RybCArIEVudGVyIHRvIHNlbmQgYSBtZXNzYWdlXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuc3Vycm91bmRXaXRoXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlN1cnJvdW5kIHNlbGVjdGVkIHRleHQgd2hlbiB0eXBpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuYXV0b1JlcGxhY2VFbW9qaVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0F1dG9tYXRpY2FsbHkgcmVwbGFjZSBwbGFpbiB0ZXh0IEVtb2ppJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC51c2VNYXJrZG93blwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBNYXJrZG93bicpLFxuICAgICAgICBkZXNjcmlwdGlvbjogKCkgPT4gX3QoXG4gICAgICAgICAgICBcIlN0YXJ0IG1lc3NhZ2VzIHdpdGggPGNvZGU+L3BsYWluPC9jb2RlPiB0byBzZW5kIHdpdGhvdXQgbWFya2Rvd24gYW5kIDxjb2RlPi9tZDwvY29kZT4gdG8gc2VuZCB3aXRoLlwiLFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7IGNvZGU6IChzdWIpID0+IDxjb2RlPnsgc3ViIH08L2NvZGU+IH0sXG4gICAgICAgICksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcIlZpZGVvVmlldy5mbGlwVmlkZW9Ib3Jpem9udGFsbHlcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdNaXJyb3IgbG9jYWwgdmlkZW8gZmVlZCcpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwidGhlbWVcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBcImxpZ2h0XCIsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBUaGVtZUNvbnRyb2xsZXIoKSxcbiAgICB9LFxuICAgIFwiY3VzdG9tX3RoZW1lc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgIH0sXG4gICAgXCJ1c2Vfc3lzdGVtX3RoZW1lXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJNYXRjaCBzeXN0ZW0gdGhlbWVcIiksXG4gICAgfSxcbiAgICBcInVzZVN5c3RlbUZvbnRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJVc2UgYSBzeXN0ZW0gZm9udFwiKSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFVzZVN5c3RlbUZvbnRDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcInN5c3RlbUZvbnRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogXCJcIixcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlN5c3RlbSBmb250IG5hbWVcIiksXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBTeXN0ZW1Gb250Q29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJ3ZWJSdGNBbGxvd1BlZXJUb1BlZXJcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcbiAgICAgICAgICAgIFwiQWxsb3cgUGVlci10by1QZWVyIGZvciAxOjEgY2FsbHMgXCIgK1xuICAgICAgICAgICAgXCIoaWYgeW91IGVuYWJsZSB0aGlzLCB0aGUgb3RoZXIgcGFydHkgbWlnaHQgYmUgYWJsZSB0byBzZWUgeW91ciBJUCBhZGRyZXNzKVwiLFxuICAgICAgICApLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnd2ViUnRjRm9yY2VUVVJOJyxcbiAgICB9LFxuICAgIFwid2VicnRjX2F1ZGlvb3V0cHV0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IFwiZGVmYXVsdFwiLFxuICAgIH0sXG4gICAgXCJ3ZWJydGNfYXVkaW9pbnB1dFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBcImRlZmF1bHRcIixcbiAgICB9LFxuICAgIFwid2VicnRjX3ZpZGVvaW5wdXRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogXCJkZWZhdWx0XCIsXG4gICAgfSxcbiAgICBcImxhbmd1YWdlXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRlZmF1bHQ6IFwiZW5cIixcbiAgICB9LFxuICAgIFwiYnJlYWRjcnVtYl9yb29tc1wiOiB7XG4gICAgICAgIC8vIG5vdCByZWFsbHkgYSBzZXR0aW5nXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcInJlY2VudF9lbW9qaVwiOiB7XG4gICAgICAgIC8vIG5vdCByZWFsbHkgYSBzZXR0aW5nXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcIlNwb3RsaWdodFNlYXJjaC5yZWNlbnRTZWFyY2hlc1wiOiB7XG4gICAgICAgIC8vIG5vdCByZWFsbHkgYSBzZXR0aW5nXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sIC8vIGxpc3Qgb2Ygcm9vbSBJRHMsIG1vc3QgcmVjZW50IGZpcnN0XG4gICAgfSxcbiAgICBcInJvb21fZGlyZWN0b3J5X3NlcnZlcnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuQUNDT1VOVF0sXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgIH0sXG4gICAgXCJpbnRlZ3JhdGlvblByb3Zpc2lvbmluZ1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiYWxsb3dlZFdpZGdldHNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5ULCBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0VdLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkOiB0cnVlLFxuICAgICAgICBkZWZhdWx0OiB7fSwgLy8gbm9uZSBhbGxvd2VkXG4gICAgfSxcbiAgICAvLyBMZWdhY3ksIGtlcHQgYXJvdW5kIGZvciB0cmFuc2l0aW9uYXJ5IHB1cnBvc2VzXG4gICAgXCJhbmFseXRpY3NPcHRJblwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTX1dJVEhfQ09ORklHLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwicHNldWRvbnltb3VzQW5hbHl0aWNzT3B0SW5cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuQUNDT1VOVF0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1NlbmQgYW5hbHl0aWNzIGRhdGEnKSxcbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIFwiRlRVRS51c2VDYXNlU2VsZWN0aW9uXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIFwiYXV0b2NvbXBsZXRlRGVsYXlcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogMjAwLFxuICAgIH0sXG4gICAgXCJyZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogMzAwMCxcbiAgICB9LFxuICAgIFwicmVhZE1hcmtlck91dE9mVmlld1RocmVzaG9sZE1zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRlZmF1bHQ6IDMwMDAwLFxuICAgIH0sXG4gICAgXCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiOiB7XG4gICAgICAgIC8vIFdlIHNwZWNpZmljYWxseSB3YW50IHRvIGhhdmUgcm9vbS1kZXZpY2UgPiBkZXZpY2Ugc28gdGhhdCB1c2VycyBtYXkgc2V0IGEgZGV2aWNlIGRlZmF1bHRcbiAgICAgICAgLy8gd2l0aCBhIHBlci1yb29tIG92ZXJyaWRlLlxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsIFNldHRpbmdMZXZlbC5ERVZJQ0VdLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZToge1xuICAgICAgICAgICAgXCJkZWZhdWx0XCI6IF90ZCgnTmV2ZXIgc2VuZCBlbmNyeXB0ZWQgbWVzc2FnZXMgdG8gdW52ZXJpZmllZCBzZXNzaW9ucyBmcm9tIHRoaXMgc2Vzc2lvbicpLFxuICAgICAgICAgICAgXCJyb29tLWRldmljZVwiOiBfdGQoJ05ldmVyIHNlbmQgZW5jcnlwdGVkIG1lc3NhZ2VzIHRvIHVudmVyaWZpZWQgc2Vzc2lvbnMgaW4gdGhpcyByb29tIGZyb20gdGhpcyBzZXNzaW9uJyksXG4gICAgICAgIH0sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVUlGZWF0dXJlQ29udHJvbGxlcihVSUZlYXR1cmUuQWR2YW5jZWRFbmNyeXB0aW9uKSxcbiAgICB9LFxuICAgIFwidXJsUHJldmlld3NFbmFibGVkXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00sXG4gICAgICAgIGRpc3BsYXlOYW1lOiB7XG4gICAgICAgICAgICBcImRlZmF1bHRcIjogX3RkKCdFbmFibGUgaW5saW5lIFVSTCBwcmV2aWV3cyBieSBkZWZhdWx0JyksXG4gICAgICAgICAgICBcInJvb20tYWNjb3VudFwiOiBfdGQoXCJFbmFibGUgVVJMIHByZXZpZXdzIGZvciB0aGlzIHJvb20gKG9ubHkgYWZmZWN0cyB5b3UpXCIpLFxuICAgICAgICAgICAgXCJyb29tXCI6IF90ZChcIkVuYWJsZSBVUkwgcHJldmlld3MgYnkgZGVmYXVsdCBmb3IgcGFydGljaXBhbnRzIGluIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFVJRmVhdHVyZUNvbnRyb2xsZXIoVUlGZWF0dXJlLlVSTFByZXZpZXdzKSxcbiAgICB9LFxuICAgIFwidXJsUHJldmlld3NFbmFibGVkX2UyZWVcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsIFNldHRpbmdMZXZlbC5ST09NX0FDQ09VTlRdLFxuICAgICAgICBkaXNwbGF5TmFtZToge1xuICAgICAgICAgICAgXCJyb29tLWFjY291bnRcIjogX3RkKFwiRW5hYmxlIFVSTCBwcmV2aWV3cyBmb3IgdGhpcyByb29tIChvbmx5IGFmZmVjdHMgeW91KVwiKSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBVSUZlYXR1cmVDb250cm9sbGVyKFVJRmVhdHVyZS5VUkxQcmV2aWV3cyksXG4gICAgfSxcbiAgICBcIm5vdGlmaWNhdGlvbnNFbmFibGVkXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgTm90aWZpY2F0aW9uc0VuYWJsZWRDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcIm5vdGlmaWNhdGlvblNvdW5kXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9PUl9BQ0NPVU5ULFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwibm90aWZpY2F0aW9uQm9keUVuYWJsZWRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IE5vdGlmaWNhdGlvbkJvZHlFbmFibGVkQ29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJhdWRpb05vdGlmaWNhdGlvbnNFbmFibGVkXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcImVuYWJsZVdpZGdldFNjcmVlbnNob3RzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnRW5hYmxlIHdpZGdldCBzY3JlZW5zaG90cyBvbiBzdXBwb3J0ZWQgd2lkZ2V0cycpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwicHJvbXB0QmVmb3JlSW52aXRlVW5rbm93blVzZXJzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnUHJvbXB0IGJlZm9yZSBzZW5kaW5nIGludml0ZXMgdG8gcG90ZW50aWFsbHkgaW52YWxpZCBtYXRyaXggSURzJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcIndpZGdldE9wZW5JRFBlcm1pc3Npb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGFsbG93OiBbXSxcbiAgICAgICAgICAgIGRlbnk6IFtdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgLy8gVE9ETzogUmVtb3ZlIHNldHRpbmc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MzczXG4gICAgXCJSb29tTGlzdC5vcmRlckFscGhhYmV0aWNhbGx5XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk9yZGVyIHJvb21zIGJ5IG5hbWVcIiksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgLy8gVE9ETzogUmVtb3ZlIHNldHRpbmc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MzczXG4gICAgXCJSb29tTGlzdC5vcmRlckJ5SW1wb3J0YW5jZVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTaG93IHJvb21zIHdpdGggdW5yZWFkIG5vdGlmaWNhdGlvbnMgZmlyc3RcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcImJyZWFkY3J1bWJzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgc2hvcnRjdXRzIHRvIHJlY2VudGx5IHZpZXdlZCByb29tcyBhYm92ZSB0aGUgcm9vbSBsaXN0XCIpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgSW5jb21wYXRpYmxlQ29udHJvbGxlcihcImZlYXR1cmVfYnJlYWRjcnVtYnNfdjJcIiwgdHJ1ZSksXG4gICAgfSxcbiAgICBcIkZUVUUudXNlck9uYm9hcmRpbmdCdXR0b25cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBzaG9ydGN1dCB0byB3ZWxjb21lIGNoZWNrbGlzdCBhYm92ZSB0aGUgcm9vbSBsaXN0XCIpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJzaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZVwiOiB7XG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTaG93IGhpZGRlbiBldmVudHMgaW4gdGltZWxpbmVcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwibG93QmFuZHdpZHRoXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0xvdyBiYW5kd2lkdGggbW9kZSAocmVxdWlyZXMgY29tcGF0aWJsZSBob21lc2VydmVyKScpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFJlbG9hZE9uQ2hhbmdlQ29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcbiAgICAgICAgICAgIFwiQWxsb3cgZmFsbGJhY2sgY2FsbCBhc3Npc3Qgc2VydmVyIHR1cm4ubWF0cml4Lm9yZyB3aGVuIHlvdXIgaG9tZXNlcnZlciBcIiArXG4gICAgICAgICAgICBcImRvZXMgbm90IG9mZmVyIG9uZSAoeW91ciBJUCBhZGRyZXNzIHdvdWxkIGJlIHNoYXJlZCBkdXJpbmcgYSBjYWxsKVwiLFxuICAgICAgICApLFxuICAgICAgICAvLyBUaGlzIGlzIGEgdHJpLXN0YXRlIHZhbHVlLCB3aGVyZSBgbnVsbGAgbWVhbnMgXCJwcm9tcHQgdGhlIHVzZXJcIi5cbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIFwic2hvd0ltYWdlc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTaG93IHByZXZpZXdzL3RodW1ibmFpbHMgZm9yIGltYWdlc1wiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiUmlnaHRQYW5lbC5waGFzZXNHbG9iYWxcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuREVWSUNFXSxcbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIFwiUmlnaHRQYW5lbC5waGFzZXNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0VdLFxuICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgIH0sXG4gICAgXCJlbmFibGVFdmVudEluZGV4aW5nXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJFbmFibGUgbWVzc2FnZSBzZWFyY2ggaW4gZW5jcnlwdGVkIHJvb21zXCIpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJjcmF3bGVyU2xlZXBUaW1lXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJIb3cgZmFzdCBzaG91bGQgbWVzc2FnZXMgYmUgZG93bmxvYWRlZC5cIiksXG4gICAgICAgIGRlZmF1bHQ6IDMwMDAsXG4gICAgfSxcbiAgICBcInNob3dDYWxsQnV0dG9uc0luQ29tcG9zZXJcIjoge1xuICAgICAgICAvLyBEZXYgbm90ZTogVGhpcyBpcyBubyBsb25nZXIgXCJpbiBjb21wb3NlclwiIGJ1dCBpcyBpbnN0ZWFkIFwiaW4gcm9vbSBoZWFkZXJcIi5cbiAgICAgICAgLy8gVE9ETzogUmVuYW1lIHdpdGggc2V0dGluZ3MgdjNcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBVSUZlYXR1cmVDb250cm9sbGVyKFVJRmVhdHVyZS5Wb2lwKSxcbiAgICB9LFxuICAgIFwiZTJlZS5tYW51YWxseVZlcmlmeUFsbFNlc3Npb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJNYW51YWxseSB2ZXJpZnkgYWxsIHJlbW90ZSBzZXNzaW9uc1wiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBPcmRlcmVkTXVsdGlDb250cm9sbGVyKFtcbiAgICAgICAgICAgIC8vIEFwcGx5IHRoZSBmZWF0dXJlIGNvbnRyb2xsZXIgZmlyc3QgdG8gZW5zdXJlIHRoYXQgdGhlIHNldHRpbmcgZG9lc24ndFxuICAgICAgICAgICAgLy8gc2hvdyB1cCBhbmQgY2FuJ3QgYmUgdG9nZ2xlZC4gUHVzaFRvTWF0cml4Q2xpZW50Q29udHJvbGxlciBkb2Vzbid0XG4gICAgICAgICAgICAvLyBkbyBhbnkgb3ZlcnJpZGVzIGFueXdheXMuXG4gICAgICAgICAgICBuZXcgVUlGZWF0dXJlQ29udHJvbGxlcihVSUZlYXR1cmUuQWR2YW5jZWRFbmNyeXB0aW9uKSxcbiAgICAgICAgICAgIG5ldyBQdXNoVG9NYXRyaXhDbGllbnRDb250cm9sbGVyKFxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudC5wcm90b3R5cGUuc2V0Q3J5cHRvVHJ1c3RDcm9zc1NpZ25lZERldmljZXMsIHRydWUsXG4gICAgICAgICAgICApLFxuICAgICAgICBdKSxcbiAgICB9LFxuICAgIFwiaXJjRGlzcGxheU5hbWVXaWR0aFwiOiB7XG4gICAgICAgIC8vIFdlIHNwZWNpZmljYWxseSB3YW50IHRvIGhhdmUgcm9vbS1kZXZpY2UgPiBkZXZpY2Ugc28gdGhhdCB1c2VycyBtYXkgc2V0IGEgZGV2aWNlIGRlZmF1bHRcbiAgICAgICAgLy8gd2l0aCBhIHBlci1yb29tIG92ZXJyaWRlLlxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsIFNldHRpbmdMZXZlbC5ERVZJQ0VdLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiSVJDIGRpc3BsYXkgbmFtZSB3aWR0aFwiKSxcbiAgICAgICAgZGVmYXVsdDogODAsXG4gICAgfSxcbiAgICBcImxheW91dFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IExheW91dC5Hcm91cCxcbiAgICB9LFxuICAgIFwiSW1hZ2VzLnNpemVcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBJbWFnZVNpemUuTm9ybWFsLFxuICAgIH0sXG4gICAgXCJzaG93Q2hhdEVmZmVjdHNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ST09NX1NFVFRJTkdTX1dJVEhfUk9PTSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgY2hhdCBlZmZlY3RzIChhbmltYXRpb25zIHdoZW4gcmVjZWl2aW5nIGUuZy4gY29uZmV0dGkpXCIpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgUmVkdWNlZE1vdGlvbkNvbnRyb2xsZXIoKSxcbiAgICB9LFxuICAgIFwiUGVyZm9ybWFuY2UuYWRkU2VuZE1lc3NhZ2VUaW1pbmdNZXRhZGF0YVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5DT05GSUddLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiV2lkZ2V0cy5waW5uZWRcIjogeyAvLyBkZXByZWNhdGVkXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fT1JfQUNDT1VOVCxcbiAgICAgICAgZGVmYXVsdDoge30sXG4gICAgfSxcbiAgICBcIldpZGdldHMubGF5b3V0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9PUl9BQ0NPVU5ULFxuICAgICAgICBkZWZhdWx0OiB7fSxcbiAgICB9LFxuICAgIFwiU3BhY2VzLmFsbFJvb21zSW5Ib21lXCI6IHtcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgYWxsIHJvb21zIGluIEhvbWVcIiksXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJBbGwgcm9vbXMgeW91J3JlIGluIHdpbGwgYXBwZWFyIGluIEhvbWUuXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiU3BhY2VzLmVuYWJsZWRNZXRhU3BhY2VzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgW01ldGFTcGFjZS5Ib21lXTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIFwiU3BhY2VzLnNob3dQZW9wbGVJblNwYWNlXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBbU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVF0sXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcImRldmVsb3Blck1vZGVcIjoge1xuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiRGV2ZWxvcGVyIG1vZGVcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJhdXRvbWF0aWNFcnJvclJlcG9ydGluZ1wiOiB7XG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJBdXRvbWF0aWNhbGx5IHNlbmQgZGVidWcgbG9ncyBvbiBhbnkgZXJyb3JcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcImF1dG9tYXRpY0RlY3J5cHRpb25FcnJvclJlcG9ydGluZ1wiOiB7XG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJBdXRvbWF0aWNhbGx5IHNlbmQgZGVidWcgbG9ncyBvbiBkZWNyeXB0aW9uIGVycm9yc1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcImF1dG9tYXRpY0tleUJhY2tOb3RFbmFibGVkUmVwb3J0aW5nXCI6IHtcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkF1dG9tYXRpY2FsbHkgc2VuZCBkZWJ1ZyBsb2dzIHdoZW4ga2V5IGJhY2t1cCBpcyBub3QgZnVuY3Rpb25pbmdcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTX1dJVEhfQ09ORklHLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZGVidWdfc2Nyb2xsX3BhbmVsXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJkZWJ1Z190aW1lbGluZV9wYW5lbFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZGVidWdfcmVnaXN0cmF0aW9uXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJkZWJ1Z19hbmltYXRpb25cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImF1ZGlvSW5wdXRNdXRlZFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwidmlkZW9JbnB1dE11dGVkXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJhY3RpdmVDYWxsUm9vbUlkc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuUm9vbUhpc3RvcnlTZXR0aW5nc106IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuQWR2YW5jZWRFbmNyeXB0aW9uXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5VUkxQcmV2aWV3c106IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuV2lkZ2V0c106IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuVm9pcF06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuRmVlZGJhY2tdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlJlZ2lzdHJhdGlvbl06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuUGFzc3dvcmRSZXNldF06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuRGVhY3RpdmF0ZV06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuU2hhcmVRUkNvZGVdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlNoYXJlU29jaWFsXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5JZGVudGl0eVNlcnZlcl06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgLy8gSWRlbnRpdHkgc2VydmVyIChkaXNjb3ZlcnkpIHNldHRpbmdzIG1ha2Ugbm8gc2Vuc2UgaWYgM1BJRHMgaW4gZ2VuZXJhbCBhcmUgaGlkZGVuXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBVSUZlYXR1cmVDb250cm9sbGVyKFVJRmVhdHVyZS5UaGlyZFBhcnR5SUQpLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5UaGlyZFBhcnR5SURdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLkFkdmFuY2VkU2V0dGluZ3NdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlRpbWVsaW5lRW5hYmxlUmVsYXRpdmVEYXRlc106IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuXG4gICAgLy8gRWxlY3Ryb24tc3BlY2lmaWMgc2V0dGluZ3MsIHRoZXkgYXJlIHN0b3JlZCBieSBFbGVjdHJvbiBhbmQgc2V0L3JlYWQgb3ZlciBhbiBJUEMuXG4gICAgLy8gV2Ugc3RvcmUgdGhlbSBvdmVyIHRoZXJlIGFyZSB0aGV5IGFyZSBuZWNlc3NhcnkgdG8ga25vdyBiZWZvcmUgdGhlIHJlbmRlcmVyIHByb2Nlc3MgbGF1bmNoZXMuXG4gICAgXCJFbGVjdHJvbi5hdXRvTGF1bmNoXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBbU2V0dGluZ0xldmVsLlBMQVRGT1JNXSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlN0YXJ0IGF1dG9tYXRpY2FsbHkgYWZ0ZXIgc3lzdGVtIGxvZ2luXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiRWxlY3Ryb24ud2FybkJlZm9yZUV4aXRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUExBVEZPUk1dLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiV2FybiBiZWZvcmUgcXVpdHRpbmdcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcIkVsZWN0cm9uLmFsd2F5c1Nob3dNZW51QmFyXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBbU2V0dGluZ0xldmVsLlBMQVRGT1JNXSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkFsd2F5cyBzaG93IHRoZSB3aW5kb3cgbWVudSBiYXJcIiksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJFbGVjdHJvbi5zaG93VHJheUljb25cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUExBVEZPUk1dLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyB0cmF5IGljb24gYW5kIG1pbmltaXNlIHdpbmRvdyB0byBpdCBvbiBjbG9zZVwiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiRWxlY3Ryb24uZW5hYmxlSGFyZHdhcmVBY2NlbGVyYXRpb25cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUExBVEZPUk1dLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiRW5hYmxlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblwiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUNBOztBQUlBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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