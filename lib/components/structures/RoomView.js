"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.RoomView = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _room = require("matrix-js-sdk/src/models/room");

var _event = require("matrix-js-sdk/src/models/event");

var _logger = require("matrix-js-sdk/src/logger");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _lodash = require("lodash");

var _client = require("matrix-js-sdk/src/client");

var _crypto = require("matrix-js-sdk/src/crypto");

var _thread = require("matrix-js-sdk/src/models/thread");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _shouldHideEvent = _interopRequireDefault(require("../../shouldHideEvent"));

var _languageHandler = require("../../languageHandler");

var _Permalinks = require("../../utils/permalinks/Permalinks");

var _ContentMessages = _interopRequireDefault(require("../../ContentMessages"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _LegacyCallHandler = _interopRequireWildcard(require("../../LegacyCallHandler"));

var _dispatcher = _interopRequireWildcard(require("../../dispatcher/dispatcher"));

var Rooms = _interopRequireWildcard(require("../../Rooms"));

var _Searching = _interopRequireWildcard(require("../../Searching"));

var _MainSplit = _interopRequireDefault(require("./MainSplit"));

var _RightPanel = _interopRequireDefault(require("./RightPanel"));

var _RoomViewStore = require("../../stores/RoomViewStore");

var _RoomScrollStateStore = _interopRequireDefault(require("../../stores/RoomScrollStateStore"));

var _WidgetEchoStore = _interopRequireDefault(require("../../stores/WidgetEchoStore"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _Layout = require("../../settings/enums/Layout");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _RightPanelStore = _interopRequireDefault(require("../../stores/right-panel/RightPanelStore"));

var _RoomContext = _interopRequireWildcard(require("../../contexts/RoomContext"));

var _MatrixClientContext = _interopRequireWildcard(require("../../contexts/MatrixClientContext"));

var _ShieldUtils = require("../../utils/ShieldUtils");

var _actions = require("../../dispatcher/actions");

var _ScrollPanel = _interopRequireDefault(require("./ScrollPanel"));

var _TimelinePanel = _interopRequireDefault(require("./TimelinePanel"));

var _ErrorBoundary = _interopRequireDefault(require("../views/elements/ErrorBoundary"));

var _RoomPreviewBar = _interopRequireDefault(require("../views/rooms/RoomPreviewBar"));

var _RoomPreviewCard = _interopRequireDefault(require("../views/rooms/RoomPreviewCard"));

var _SearchBar = _interopRequireWildcard(require("../views/rooms/SearchBar"));

var _RoomUpgradeWarningBar = _interopRequireDefault(require("../views/rooms/RoomUpgradeWarningBar"));

var _AuxPanel = _interopRequireDefault(require("../views/rooms/AuxPanel"));

var _RoomHeader = _interopRequireDefault(require("../views/rooms/RoomHeader"));

var _EffectsOverlay = _interopRequireDefault(require("../views/elements/EffectsOverlay"));

var _utils = require("../../effects/utils");

var _effects = require("../../effects");

var _WidgetStore = _interopRequireDefault(require("../../stores/WidgetStore"));

var _VideoRoomView = require("./VideoRoomView");

var _AsyncStore = require("../../stores/AsyncStore");

var _Notifier = _interopRequireDefault(require("../../Notifier"));

var _DesktopNotificationsToast = require("../../toasts/DesktopNotificationsToast");

var _RoomNotificationStateStore = require("../../stores/notifications/RoomNotificationStateStore");

var _WidgetLayoutStore = require("../../stores/widgets/WidgetLayoutStore");

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _objects = require("../../utils/objects");

var _SpaceRoomView = _interopRequireDefault(require("./SpaceRoomView"));

var _EditorStateTransfer = _interopRequireDefault(require("../../utils/EditorStateTransfer"));

var _ErrorDialog = _interopRequireDefault(require("../views/dialogs/ErrorDialog"));

var _SearchResultTile = _interopRequireDefault(require("../views/rooms/SearchResultTile"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _UploadBar = _interopRequireDefault(require("./UploadBar"));

var _RoomStatusBar = _interopRequireDefault(require("./RoomStatusBar"));

var _MessageComposer = _interopRequireDefault(require("../views/rooms/MessageComposer"));

var _JumpToBottomButton = _interopRequireDefault(require("../views/rooms/JumpToBottomButton"));

var _TopUnreadMessagesBar = _interopRequireDefault(require("../views/rooms/TopUnreadMessagesBar"));

var _EventUtils = require("../../utils/EventUtils");

var _ComposerInsertPayload = require("../../dispatcher/payloads/ComposerInsertPayload");

var _AppsDrawer = _interopRequireDefault(require("../views/rooms/AppsDrawer"));

var _RightPanelStorePhases = require("../../stores/right-panel/RightPanelStorePhases");

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

var _FileDropTarget = _interopRequireDefault(require("./FileDropTarget"));

var _Measured = _interopRequireDefault(require("../views/elements/Measured"));

var _EventTileFactory = require("../../events/EventTileFactory");

var _LocalRoom = require("../../models/LocalRoom");

var _directMessages = require("../../utils/direct-messages");

var _NewRoomIntro = _interopRequireDefault(require("../views/rooms/NewRoomIntro"));

var _EncryptionEvent = _interopRequireDefault(require("../views/messages/EncryptionEvent"));

var _StaticNotificationState = require("../../stores/notifications/StaticNotificationState");

var _isLocalRoom = require("../../utils/localRoom/isLocalRoom");

var _RoomStatusBarUnsentMessages = require("./RoomStatusBarUnsentMessages");

var _LargeLoader = require("./LargeLoader");

const _excluded = ["upgradeRecommendation"],
      _excluded2 = ["upgradeRecommendation"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const DEBUG = false;

let debuglog = function (msg) {};

const BROWSER_SUPPORTS_SANDBOX = ('sandbox' in document.createElement('iframe'));

if (DEBUG) {
  // using bind means that we get to keep useful line numbers in the console
  debuglog = _logger.logger.log.bind(console);
}

// This defines the content of the mainSplit.
// If the mainSplit does not contain the Timeline, the chat is shown in the right panel.
var MainSplitContentType;

(function (MainSplitContentType) {
  MainSplitContentType[MainSplitContentType["Timeline"] = 0] = "Timeline";
  MainSplitContentType[MainSplitContentType["MaximisedWidget"] = 1] = "MaximisedWidget";
  MainSplitContentType[MainSplitContentType["Video"] = 2] = "Video";
})(MainSplitContentType || (MainSplitContentType = {}));

/**
 * Local room view. Uses only the bits necessary to display a local room view like room header or composer.
 *
 * @param {LocalRoomViewProps} props Room view props
 * @returns {ReactElement}
 */
function LocalRoomView(props) {
  const context = (0, _react.useContext)(_RoomContext.default);
  const room = context.room;
  const encryptionEvent = context.room.currentState.getStateEvents(_event2.EventType.RoomEncryption)[0];
  let encryptionTile;

  if (encryptionEvent) {
    encryptionTile = /*#__PURE__*/_react.default.createElement(_EncryptionEvent.default, {
      mxEvent: encryptionEvent
    });
  }

  const onRetryClicked = () => {
    room.state = _LocalRoom.LocalRoomState.NEW;

    _dispatcher.defaultDispatcher.dispatch({
      action: "local_room_event",
      roomId: room.roomId
    });
  };

  let statusBar;
  let composer;

  if (room.isError) {
    const buttons = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onRetryClicked,
      className: "mx_RoomStatusBar_unsentRetry"
    }, (0, _languageHandler._t)("Retry"));

    statusBar = /*#__PURE__*/_react.default.createElement(_RoomStatusBarUnsentMessages.RoomStatusBarUnsentMessages, {
      title: (0, _languageHandler._t)("Some of your messages have not been sent"),
      notificationState: _StaticNotificationState.StaticNotificationState.RED_EXCLAMATION,
      buttons: buttons
    });
  } else {
    composer = /*#__PURE__*/_react.default.createElement(_MessageComposer.default, {
      room: context.room,
      resizeNotifier: props.resizeNotifier,
      permalinkCreator: props.permalinkCreator
    });
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomView mx_RoomView--local"
  }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomHeader.default, {
    room: context.room,
    searchInfo: null,
    inRoom: true,
    onSearchClick: null,
    onInviteClick: null,
    onForgetClick: null,
    e2eStatus: _ShieldUtils.E2EStatus.Normal,
    onAppsClick: null,
    appsShown: false,
    onCallPlaced: null,
    excludedRightPanelPhaseButtons: [],
    showButtons: false,
    enableRoomOptionsMenu: false
  }), /*#__PURE__*/_react.default.createElement("main", {
    className: "mx_RoomView_body",
    ref: props.roomView
  }, /*#__PURE__*/_react.default.createElement(_FileDropTarget.default, {
    parent: props.roomView.current,
    onFileDrop: props.onFileDrop
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomView_timeline"
  }, /*#__PURE__*/_react.default.createElement(_ScrollPanel.default, {
    className: "mx_RoomView_messagePanel",
    resizeNotifier: props.resizeNotifier
  }, encryptionTile, /*#__PURE__*/_react.default.createElement(_NewRoomIntro.default, null))), statusBar, composer)));
}

/**
 * Room create loader view displaying a message and a spinner.
 *
 * @param {ILocalRoomCreateLoaderProps} props Room view props
 * @return {ReactElement}
 */
function LocalRoomCreateLoader(props) {
  const context = (0, _react.useContext)(_RoomContext.default);
  const text = (0, _languageHandler._t)("We're creating a room with %(names)s", {
    names: props.names
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomView mx_RoomView--local"
  }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomHeader.default, {
    room: context.room,
    searchInfo: null,
    inRoom: true,
    onSearchClick: null,
    onInviteClick: null,
    onForgetClick: null,
    e2eStatus: _ShieldUtils.E2EStatus.Normal,
    onAppsClick: null,
    appsShown: false,
    onCallPlaced: null,
    excludedRightPanelPhaseButtons: [],
    showButtons: false,
    enableRoomOptionsMenu: false
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomView_body"
  }, /*#__PURE__*/_react.default.createElement(_LargeLoader.LargeLoader, {
    text: text
  }))));
}

class RoomView extends _react.default.Component {
  constructor(props, context) {
    var _this;

    super(props, context);
    _this = this;
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "roomStoreToken", void 0);
    (0, _defineProperty2.default)(this, "settingWatchers", void 0);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "permalinkCreators", {});
    (0, _defineProperty2.default)(this, "searchId", void 0);
    (0, _defineProperty2.default)(this, "roomView", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "searchResultsPanel", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "messagePanel", void 0);
    (0, _defineProperty2.default)(this, "roomViewBody", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onIsResizing", resizing => {
      this.setState({
        resizing
      });
    });
    (0, _defineProperty2.default)(this, "onWidgetStoreUpdate", () => {
      if (!this.state.room) return;
      this.checkWidgets(this.state.room);
    });
    (0, _defineProperty2.default)(this, "onWidgetEchoStoreUpdate", () => {
      if (!this.state.room) return;
      this.checkWidgets(this.state.room);
    });
    (0, _defineProperty2.default)(this, "onWidgetLayoutChange", () => {
      if (!this.state.room) return;

      _dispatcher.default.dispatch({
        action: "appsDrawer",
        show: true
      });

      if (_WidgetLayoutStore.WidgetLayoutStore.instance.hasMaximisedWidget(this.state.room)) {
        // Show chat in right panel when a widget is maximised
        _RightPanelStore.default.instance.setCard({
          phase: _RightPanelStorePhases.RightPanelPhases.Timeline
        });
      } else if (_RightPanelStore.default.instance.isOpen && _RightPanelStore.default.instance.roomPhaseHistory.some(card => card.phase === _RightPanelStorePhases.RightPanelPhases.Timeline)) {
        // hide chat in right panel when the widget is minimized
        _RightPanelStore.default.instance.setCard({
          phase: _RightPanelStorePhases.RightPanelPhases.RoomSummary
        });

        _RightPanelStore.default.instance.togglePanel(this.state.roomId);
      }

      this.checkWidgets(this.state.room);
    });
    (0, _defineProperty2.default)(this, "checkWidgets", room => {
      this.setState({
        hasPinnedWidgets: _WidgetLayoutStore.WidgetLayoutStore.instance.hasPinnedWidgets(room),
        mainSplitContentType: this.getMainSplitContentType(room),
        showApps: this.shouldShowApps(room)
      });
    });
    (0, _defineProperty2.default)(this, "getMainSplitContentType", room => {
      if (_SettingsStore.default.getValue("feature_video_rooms") && room.isElementVideoRoom()) {
        return MainSplitContentType.Video;
      }

      if (_WidgetLayoutStore.WidgetLayoutStore.instance.hasMaximisedWidget(room)) {
        return MainSplitContentType.MaximisedWidget;
      }

      return MainSplitContentType.Timeline;
    });
    (0, _defineProperty2.default)(this, "onRoomViewStoreUpdate", async initial => {
      if (this.unmounted) {
        return;
      }

      if (!initial && this.state.roomId !== _RoomViewStore.RoomViewStore.instance.getRoomId()) {
        // RoomView explicitly does not support changing what room
        // is being viewed: instead it should just be re-mounted when
        // switching rooms. Therefore, if the room ID changes, we
        // ignore this. We either need to do this or add code to handle
        // saving the scroll position (otherwise we end up saving the
        // scroll position against the wrong room).
        // Given that doing the setState here would cause a bunch of
        // unnecessary work, we just ignore the change since we know
        // that if the current room ID has changed from what we thought
        // it was, it means we're about to be unmounted.
        return;
      }

      const roomId = _RoomViewStore.RoomViewStore.instance.getRoomId(); // This convoluted type signature ensures we get IntelliSense *and* correct typing


      const newState = {
        roomId,
        roomAlias: _RoomViewStore.RoomViewStore.instance.getRoomAlias(),
        roomLoading: _RoomViewStore.RoomViewStore.instance.isRoomLoading(),
        roomLoadError: _RoomViewStore.RoomViewStore.instance.getRoomLoadError(),
        joining: _RoomViewStore.RoomViewStore.instance.isJoining(),
        replyToEvent: _RoomViewStore.RoomViewStore.instance.getQuotingEvent(),
        // we should only peek once we have a ready client
        shouldPeek: this.state.matrixClientIsReady && _RoomViewStore.RoomViewStore.instance.shouldPeek(),
        showReadReceipts: _SettingsStore.default.getValue("showReadReceipts", roomId),
        showRedactions: _SettingsStore.default.getValue("showRedactions", roomId),
        showJoinLeaves: _SettingsStore.default.getValue("showJoinLeaves", roomId),
        showAvatarChanges: _SettingsStore.default.getValue("showAvatarChanges", roomId),
        showDisplaynameChanges: _SettingsStore.default.getValue("showDisplaynameChanges", roomId),
        wasContextSwitch: _RoomViewStore.RoomViewStore.instance.getWasContextSwitch(),
        initialEventId: null,
        // default to clearing this, will get set later in the method if needed
        showRightPanel: _RightPanelStore.default.instance.isOpenForRoom(roomId)
      };

      const initialEventId = _RoomViewStore.RoomViewStore.instance.getInitialEventId();

      if (initialEventId) {
        const room = this.context.getRoom(roomId);
        let initialEvent = room?.findEventById(initialEventId); // The event does not exist in the current sync data
        // We need to fetch it to know whether to route this request
        // to the main timeline or to a threaded one
        // In the current state, if a thread does not exist in the sync data
        // We will only display the event targeted by the `matrix.to` link
        // and the root event.
        // The rest will be lost for now, until the aggregation API on the server
        // becomes available to fetch a whole thread

        if (!initialEvent) {
          initialEvent = await (0, _EventUtils.fetchInitialEvent)(this.context, roomId, initialEventId);
        } // If we have an initial event, we want to reset the event pixel offset to ensure it ends up
        // visible


        newState.initialEventPixelOffset = null;
        const thread = initialEvent?.getThread();

        if (thread && !initialEvent?.isThreadRoot) {
          _dispatcher.default.dispatch({
            action: _actions.Action.ShowThread,
            rootEvent: thread.rootEvent,
            initialEvent,
            highlighted: _RoomViewStore.RoomViewStore.instance.isInitialEventHighlighted(),
            scroll_into_view: _RoomViewStore.RoomViewStore.instance.initialEventScrollIntoView()
          });
        } else {
          newState.initialEventId = initialEventId;
          newState.isInitialEventHighlighted = _RoomViewStore.RoomViewStore.instance.isInitialEventHighlighted();
          newState.initialEventScrollIntoView = _RoomViewStore.RoomViewStore.instance.initialEventScrollIntoView();

          if (thread && initialEvent?.isThreadRoot) {
            _dispatcher.default.dispatch({
              action: _actions.Action.ShowThread,
              rootEvent: thread.rootEvent,
              initialEvent,
              highlighted: _RoomViewStore.RoomViewStore.instance.isInitialEventHighlighted(),
              scroll_into_view: _RoomViewStore.RoomViewStore.instance.initialEventScrollIntoView()
            });
          }
        }
      } // Add watchers for each of the settings we just looked up


      this.settingWatchers = this.settingWatchers.concat([_SettingsStore.default.watchSetting("showReadReceipts", roomId, function () {
        for (var _len = arguments.length, _ref = new Array(_len), _key = 0; _key < _len; _key++) {
          _ref[_key] = arguments[_key];
        }

        let [,,, value] = _ref;
        return _this.setState({
          showReadReceipts: value
        });
      }), _SettingsStore.default.watchSetting("showRedactions", roomId, function () {
        for (var _len2 = arguments.length, _ref2 = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          _ref2[_key2] = arguments[_key2];
        }

        let [,,, value] = _ref2;
        return _this.setState({
          showRedactions: value
        });
      }), _SettingsStore.default.watchSetting("showJoinLeaves", roomId, function () {
        for (var _len3 = arguments.length, _ref3 = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          _ref3[_key3] = arguments[_key3];
        }

        let [,,, value] = _ref3;
        return _this.setState({
          showJoinLeaves: value
        });
      }), _SettingsStore.default.watchSetting("showAvatarChanges", roomId, function () {
        for (var _len4 = arguments.length, _ref4 = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          _ref4[_key4] = arguments[_key4];
        }

        let [,,, value] = _ref4;
        return _this.setState({
          showAvatarChanges: value
        });
      }), _SettingsStore.default.watchSetting("showDisplaynameChanges", roomId, function () {
        for (var _len5 = arguments.length, _ref5 = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          _ref5[_key5] = arguments[_key5];
        }

        let [,,, value] = _ref5;
        return _this.setState({
          showDisplaynameChanges: value
        });
      })]);

      if (!initial && this.state.shouldPeek && !newState.shouldPeek) {
        // Stop peeking because we have joined this room now
        this.context.stopPeeking();
      } // Temporary logging to diagnose https://github.com/vector-im/element-web/issues/4307


      _logger.logger.log('RVS update:', newState.roomId, newState.roomAlias, 'loading?', newState.roomLoading, 'joining?', newState.joining, 'initial?', initial, 'shouldPeek?', newState.shouldPeek); // NB: This does assume that the roomID will not change for the lifetime of
      // the RoomView instance


      if (initial) {
        newState.room = this.context.getRoom(newState.roomId);

        if (newState.room) {
          newState.showApps = this.shouldShowApps(newState.room);
          this.onRoomLoaded(newState.room);
        }
      }

      if (this.state.roomId === null && newState.roomId !== null) {
        // Get the scroll state for the new room
        // If an event ID wasn't specified, default to the one saved for this room
        // in the scroll state store. Assume initialEventPixelOffset should be set.
        if (!newState.initialEventId) {
          const roomScrollState = _RoomScrollStateStore.default.getScrollState(newState.roomId);

          if (roomScrollState) {
            newState.initialEventId = roomScrollState.focussedEvent;
            newState.initialEventPixelOffset = roomScrollState.pixelOffset;
          }
        }
      } // Clear the search results when clicking a search result (which changes the
      // currently scrolled to event, this.state.initialEventId).


      if (this.state.initialEventId !== newState.initialEventId) {
        newState.searchResults = null;
      }

      this.setState(newState); // At this point, newState.roomId could be null (e.g. the alias might not
      // have been resolved yet) so anything called here must handle this case.
      // We pass the new state into this function for it to read: it needs to
      // observe the new state but we don't want to put it in the setState
      // callback because this would prevent the setStates from being batched,
      // ie. cause it to render RoomView twice rather than the once that is necessary.

      if (initial) {
        this.setupRoom(newState.room, newState.roomId, newState.joining, newState.shouldPeek);
      }
    });
    (0, _defineProperty2.default)(this, "getRoomId", () => {
      // According to `onRoomViewStoreUpdate`, `state.roomId` can be null
      // if we have a room alias we haven't resolved yet. To work around this,
      // first we'll try the room object if it's there, and then fallback to
      // the bare room ID. (We may want to update `state.roomId` after
      // resolving aliases, so we could always trust it.)
      return this.state.room ? this.state.room.roomId : this.state.roomId;
    });
    (0, _defineProperty2.default)(this, "onRightPanelStoreUpdate", () => {
      this.setState({
        showRightPanel: _RightPanelStore.default.instance.isOpenForRoom(this.state.roomId)
      });
    });
    (0, _defineProperty2.default)(this, "onPageUnload", event => {
      if (_ContentMessages.default.sharedInstance().getCurrentUploads().length > 0) {
        return event.returnValue = (0, _languageHandler._t)("You seem to be uploading files, are you sure you want to quit?");
      } else if (this.getCallForRoom() && this.state.callState !== 'ended') {
        return event.returnValue = (0, _languageHandler._t)("You seem to be in a call, are you sure you want to quit?");
      }
    });
    (0, _defineProperty2.default)(this, "onReactKeyDown", ev => {
      let handled = false;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.DismissReadMarker:
          this.messagePanel.forgetReadMarker();
          this.jumpToLiveTimeline();
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.JumpToOldestUnread:
          this.jumpToReadMarker();
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.UploadFile:
          {
            _dispatcher.default.dispatch({
              action: "upload_file",
              context: _RoomContext.TimelineRenderingType.Room
            }, true);

            handled = true;
            break;
          }
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onCallState", roomId => {
      // don't filter out payloads for room IDs other than props.room because
      // we may be interested in the conf 1:1 room
      if (!roomId) return;
      const call = this.getCallForRoom();
      this.setState({
        callState: call ? call.state : null
      });
    });
    (0, _defineProperty2.default)(this, "onAction", async payload => {
      switch (payload.action) {
        case 'message_sent':
          this.checkDesktopNotifications();
          break;

        case 'post_sticker_message':
          this.injectSticker(payload.data.content.url, payload.data.content.info, payload.data.description || payload.data.name, payload.data.threadId);
          break;

        case 'picture_snapshot':
          _ContentMessages.default.sharedInstance().sendContentListToRoom([payload.file], this.state.room.roomId, null, this.context);

          break;

        case 'notifier_enabled':
        case _actions.Action.UploadStarted:
        case _actions.Action.UploadFinished:
        case _actions.Action.UploadCanceled:
          this.forceUpdate();
          break;

        case 'appsDrawer':
          this.setState({
            showApps: payload.show
          });
          break;

        case 'reply_to_event':
          if (!this.unmounted && this.state.searchResults && payload.event?.getRoomId() === this.state.roomId && payload.context === _RoomContext.TimelineRenderingType.Search) {
            this.onCancelSearchClick(); // we don't need to re-dispatch as RoomViewStore knows to persist with context=Search also
          }

          break;

        case 'MatrixActions.sync':
          if (!this.state.matrixClientIsReady) {
            this.setState({
              matrixClientIsReady: this.context?.isInitialSyncComplete()
            }, () => {
              // send another "initial" RVS update to trigger peeking if needed
              this.onRoomViewStoreUpdate(true);
            });
          }

          break;

        case 'focus_search':
          this.onSearchClick();
          break;

        case 'local_room_event':
          this.onLocalRoomEvent(payload.roomId);
          break;

        case _actions.Action.EditEvent:
          {
            // Quit early if we're trying to edit events in wrong rendering context
            if (payload.timelineRenderingType !== this.state.timelineRenderingType) return;
            const editState = payload.event ? new _EditorStateTransfer.default(payload.event) : null;
            this.setState({
              editState
            }, () => {
              if (payload.event) {
                this.messagePanel?.scrollToEventIfNeeded(payload.event.getId());
              }
            });
            break;
          }

        case _actions.Action.ComposerInsert:
          {
            if (payload.composerType) break;
            let timelineRenderingType = payload.timelineRenderingType; // ThreadView handles Action.ComposerInsert itself due to it having its own editState

            if (timelineRenderingType === _RoomContext.TimelineRenderingType.Thread) break;

            if (this.state.timelineRenderingType === _RoomContext.TimelineRenderingType.Search && payload.timelineRenderingType === _RoomContext.TimelineRenderingType.Search) {
              // we don't have the composer rendered in this state, so bring it back first
              await this.onCancelSearchClick();
              timelineRenderingType = _RoomContext.TimelineRenderingType.Room;
            } // re-dispatch to the correct composer


            _dispatcher.default.dispatch(_objectSpread(_objectSpread({}, payload), {}, {
              timelineRenderingType,
              composerType: this.state.editState ? _ComposerInsertPayload.ComposerType.Edit : _ComposerInsertPayload.ComposerType.Send
            }));

            break;
          }

        case _actions.Action.FocusAComposer:
          {
            _dispatcher.default.dispatch(_objectSpread(_objectSpread({}, payload), {}, {
              // re-dispatch to the correct composer
              action: this.state.editState ? _actions.Action.FocusEditMessageComposer : _actions.Action.FocusSendMessageComposer
            }));

            break;
          }

        case "scroll_to_bottom":
          if (payload.timelineRenderingType === _RoomContext.TimelineRenderingType.Room) {
            this.messagePanel?.jumpToLiveTimeline();
          }

          break;
      }
    });
    (0, _defineProperty2.default)(this, "onRoomTimeline", (ev, room, toStartOfTimeline, removed, data) => {
      if (this.unmounted) return; // ignore events for other rooms or the notification timeline set

      if (!room || room.roomId !== this.state.room?.roomId) return; // ignore events from filtered timelines

      if (data.timeline.getTimelineSet() !== room.getUnfilteredTimelineSet()) return;

      if (ev.getType() === "org.matrix.room.preview_urls") {
        this.updatePreviewUrlVisibility(room);
      }

      if (ev.getType() === "m.room.encryption") {
        this.updateE2EStatus(room);
        this.updatePreviewUrlVisibility(room);
      } // ignore anything but real-time updates at the end of the room:
      // updates from pagination will happen when the paginate completes.


      if (toStartOfTimeline || !data || !data.liveEvent) return; // no point handling anything while we're waiting for the join to finish:
      // we'll only be showing a spinner.

      if (this.state.joining) return;

      if (!ev.isBeingDecrypted() && !ev.isDecryptionFailure()) {
        this.handleEffects(ev);
      }

      if (ev.getSender() !== this.context.credentials.userId) {
        // update unread count when scrolled up
        if (!this.state.searchResults && this.state.atEndOfLiveTimeline) {// no change
        } else if (!(0, _shouldHideEvent.default)(ev, this.state)) {
          this.setState((state, props) => {
            return {
              numUnreadMessages: state.numUnreadMessages + 1
            };
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "onEventDecrypted", ev => {
      if (!this.state.room || !this.state.matrixClientIsReady) return; // not ready at all

      if (ev.getRoomId() !== this.state.room.roomId) return; // not for us

      if (ev.isDecryptionFailure()) return;
      this.handleEffects(ev);
    });
    (0, _defineProperty2.default)(this, "handleEffects", ev => {
      const notifState = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(this.state.room);

      if (!notifState.isUnread) return;

      _effects.CHAT_EFFECTS.forEach(effect => {
        if ((0, _utils.containsEmoji)(ev.getContent(), effect.emojis) || ev.getContent().msgtype === effect.msgType) {
          // For initial threads launch, chat effects are disabled see #19731
          if (!_SettingsStore.default.getValue("feature_thread") || !ev.isRelation(_thread.THREAD_RELATION_TYPE.name)) {
            _dispatcher.default.dispatch({
              action: `effects.${effect.command}`
            });
          }
        }
      });
    });
    (0, _defineProperty2.default)(this, "onRoomName", room => {
      if (this.state.room && room.roomId == this.state.room.roomId) {
        this.forceUpdate();
      }
    });
    (0, _defineProperty2.default)(this, "onKeyBackupStatus", () => {
      // Key backup status changes affect whether the in-room recovery
      // reminder is displayed.
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "canResetTimeline", () => {
      if (!this.messagePanel) {
        return true;
      }

      return this.messagePanel.canResetTimeline();
    });
    (0, _defineProperty2.default)(this, "onRoomLoaded", room => {
      if (this.unmounted) return; // Attach a widget store listener only when we get a room

      _WidgetLayoutStore.WidgetLayoutStore.instance.on(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(room), this.onWidgetLayoutChange);

      this.calculatePeekRules(room);
      this.updatePreviewUrlVisibility(room);
      this.loadMembersIfJoined(room);
      this.calculateRecommendedVersion(room);
      this.updateE2EStatus(room);
      this.updatePermissions(room);
      this.checkWidgets(room);

      if (this.getMainSplitContentType(room) !== MainSplitContentType.Timeline && _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(room).isUnread) {
        // Automatically open the chat panel to make unread messages easier to discover
        _RightPanelStore.default.instance.setCard({
          phase: _RightPanelStorePhases.RightPanelPhases.Timeline
        }, true, room.roomId);
      }

      this.setState({
        tombstone: this.getRoomTombstone(room),
        liveTimeline: room.getLiveTimeline()
      });
    });
    (0, _defineProperty2.default)(this, "onRoomTimelineReset", (room, timelineSet) => {
      if (!room || room.roomId !== this.state.room?.roomId) return;

      _logger.logger.log(`Live timeline of ${room.roomId} was reset`);

      this.setState({
        liveTimeline: timelineSet.getLiveTimeline()
      });
    });
    (0, _defineProperty2.default)(this, "onRoom", room => {
      if (!room || room.roomId !== this.state.roomId) {
        return;
      } // Detach the listener if the room is changing for some reason


      if (this.state.room) {
        _WidgetLayoutStore.WidgetLayoutStore.instance.off(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(this.state.room), this.onWidgetLayoutChange);
      }

      this.setState({
        room: room
      }, () => {
        this.onRoomLoaded(room);
      });
    });
    (0, _defineProperty2.default)(this, "onDeviceVerificationChanged", userId => {
      const room = this.state.room;

      if (!room.currentState.getMember(userId)) {
        return;
      }

      this.updateE2EStatus(room);
    });
    (0, _defineProperty2.default)(this, "onUserVerificationChanged", userId => {
      const room = this.state.room;

      if (!room || !room.currentState.getMember(userId)) {
        return;
      }

      this.updateE2EStatus(room);
    });
    (0, _defineProperty2.default)(this, "onCrossSigningKeysChanged", () => {
      const room = this.state.room;

      if (room) {
        this.updateE2EStatus(room);
      }
    });
    (0, _defineProperty2.default)(this, "onUrlPreviewsEnabledChange", () => {
      if (this.state.room) {
        this.updatePreviewUrlVisibility(this.state.room);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvents", (ev, state) => {
      // ignore if we don't have a room yet
      if (!this.state.room || this.state.room.roomId !== state.roomId) return;

      switch (ev.getType()) {
        case _event2.EventType.RoomTombstone:
          this.setState({
            tombstone: this.getRoomTombstone()
          });
          break;

        default:
          this.updatePermissions(this.state.room);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateUpdate", state => {
      // ignore members in other rooms
      if (state.roomId !== this.state.room?.roomId) {
        return;
      }

      this.updateRoomMembers();
    });
    (0, _defineProperty2.default)(this, "onMyMembership", (room, membership, oldMembership) => {
      if (room.roomId === this.state.roomId) {
        this.forceUpdate();
        this.loadMembersIfJoined(room);
        this.updatePermissions(room);
      }
    });
    (0, _defineProperty2.default)(this, "updateRoomMembers", (0, _lodash.throttle)(() => {
      this.updateDMState();
      this.updateE2EStatus(this.state.room);
    }, 500, {
      leading: true,
      trailing: true
    }));
    (0, _defineProperty2.default)(this, "onSearchResultsFillRequest", backwards => {
      if (!backwards) {
        return Promise.resolve(false);
      }

      if (this.state.searchResults.next_batch) {
        debuglog("requesting more search results");
        const searchPromise = (0, _Searching.searchPagination)(this.state.searchResults);
        return this.handleSearchResult(searchPromise);
      } else {
        debuglog("no more search results");
        return Promise.resolve(false);
      }
    });
    (0, _defineProperty2.default)(this, "onInviteClick", () => {
      // open the room inviter
      _dispatcher.default.dispatch({
        action: 'view_invite',
        roomId: this.state.room.roomId
      });
    });
    (0, _defineProperty2.default)(this, "onJoinButtonClicked", () => {
      // If the user is a ROU, allow them to transition to a PWLU
      if (this.context?.isGuest()) {
        // Join this room once the user has registered and logged in
        // (If we failed to peek, we may not have a valid room object.)
        _dispatcher.default.dispatch({
          action: _actions.Action.DoAfterSyncPrepared,
          deferred_action: {
            action: _actions.Action.ViewRoom,
            room_id: this.getRoomId(),
            metricsTrigger: undefined
          }
        });

        _dispatcher.default.dispatch({
          action: 'require_registration'
        });
      } else {
        Promise.resolve().then(() => {
          const signUrl = this.props.threepidInvite?.signUrl;

          _dispatcher.default.dispatch({
            action: _actions.Action.JoinRoom,
            roomId: this.getRoomId(),
            opts: {
              inviteSignUrl: signUrl
            },
            metricsTrigger: this.state.room?.getMyMembership() === "invite" ? "Invite" : "RoomPreview"
          });

          return Promise.resolve();
        });
      }
    });
    (0, _defineProperty2.default)(this, "onMessageListScroll", ev => {
      if (this.messagePanel.isAtEndOfLiveTimeline()) {
        this.setState({
          numUnreadMessages: 0,
          atEndOfLiveTimeline: true
        });
      } else {
        this.setState({
          atEndOfLiveTimeline: false
        });
      }

      this.updateTopUnreadMessagesBar();
    });
    (0, _defineProperty2.default)(this, "resetJumpToEvent", eventId => {
      if (this.state.initialEventId && this.state.initialEventScrollIntoView && this.state.initialEventId === eventId) {
        debuglog("Removing scroll_into_view flag from initial event");

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: this.state.room.roomId,
          event_id: this.state.initialEventId,
          highlighted: this.state.isInitialEventHighlighted,
          scroll_into_view: false,
          replyingToEvent: this.state.replyToEvent,
          metricsTrigger: undefined // room doesn't change

        });
      }
    });
    (0, _defineProperty2.default)(this, "onSearch", (term, scope) => {
      this.setState({
        searchTerm: term,
        searchScope: scope,
        searchResults: {},
        searchHighlights: []
      }); // if we already have a search panel, we need to tell it to forget
      // about its scroll state.

      if (this.searchResultsPanel.current) {
        this.searchResultsPanel.current.resetScrollState();
      } // make sure that we don't end up showing results from
      // an aborted search by keeping a unique id.
      //
      // todo: should cancel any previous search requests.


      this.searchId = new Date().getTime();
      let roomId;
      if (scope === _SearchBar.SearchScope.Room) roomId = this.state.room.roomId;
      debuglog("sending search request");
      const searchPromise = (0, _Searching.default)(term, roomId);
      this.handleSearchResult(searchPromise);
    });
    (0, _defineProperty2.default)(this, "onCallPlaced", type => {
      _LegacyCallHandler.default.instance.placeCall(this.state.room?.roomId, type);
    });
    (0, _defineProperty2.default)(this, "onAppsClick", () => {
      _dispatcher.default.dispatch({
        action: "appsDrawer",
        show: !this.state.showApps
      });
    });
    (0, _defineProperty2.default)(this, "onForgetClick", () => {
      _dispatcher.default.dispatch({
        action: 'forget_room',
        room_id: this.state.room.roomId
      });
    });
    (0, _defineProperty2.default)(this, "onRejectButtonClicked", () => {
      this.setState({
        rejecting: true
      });
      this.context.leave(this.state.roomId).then(() => {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewHomePage
        });

        this.setState({
          rejecting: false
        });
      }, error => {
        _logger.logger.error("Failed to reject invite: %s", error);

        const msg = error.message ? error.message : JSON.stringify(error);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Failed to reject invite"),
          description: msg
        });

        this.setState({
          rejecting: false,
          rejectError: error
        });
      });
    });
    (0, _defineProperty2.default)(this, "onRejectAndIgnoreClick", async () => {
      this.setState({
        rejecting: true
      });

      try {
        const myMember = this.state.room.getMember(this.context.getUserId());
        const inviteEvent = myMember.events.member;
        const ignoredUsers = this.context.getIgnoredUsers();
        ignoredUsers.push(inviteEvent.getSender()); // de-duped internally in the js-sdk

        await this.context.setIgnoredUsers(ignoredUsers);
        await this.context.leave(this.state.roomId);

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewHomePage
        });

        this.setState({
          rejecting: false
        });
      } catch (error) {
        _logger.logger.error("Failed to reject invite: %s", error);

        const msg = error.message ? error.message : JSON.stringify(error);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Failed to reject invite"),
          description: msg
        });

        this.setState({
          rejecting: false,
          rejectError: error
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRejectThreepidInviteButtonClicked", () => {
      // We can reject 3pid invites in the same way that we accept them,
      // using /leave rather than /join. In the short term though, we
      // just ignore them.
      // https://github.com/vector-im/vector-web/issues/1134
      _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
    });
    (0, _defineProperty2.default)(this, "onSearchClick", () => {
      this.setState({
        timelineRenderingType: this.state.timelineRenderingType === _RoomContext.TimelineRenderingType.Search ? _RoomContext.TimelineRenderingType.Room : _RoomContext.TimelineRenderingType.Search
      });
    });
    (0, _defineProperty2.default)(this, "onCancelSearchClick", () => {
      return new Promise(resolve => {
        this.setState({
          timelineRenderingType: _RoomContext.TimelineRenderingType.Room,
          searchResults: null
        }, resolve);
      });
    });
    (0, _defineProperty2.default)(this, "jumpToLiveTimeline", () => {
      if (this.state.initialEventId && this.state.isInitialEventHighlighted) {
        // If we were viewing a highlighted event, firing view_room without
        // an event will take care of both clearing the URL fragment and
        // jumping to the bottom
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: this.state.room.roomId,
          metricsTrigger: undefined // room doesn't change

        });
      } else {
        // Otherwise we have to jump manually
        this.messagePanel.jumpToLiveTimeline();

        _dispatcher.default.fire(_actions.Action.FocusSendMessageComposer);
      }
    });
    (0, _defineProperty2.default)(this, "jumpToReadMarker", () => {
      this.messagePanel.jumpToReadMarker();
    });
    (0, _defineProperty2.default)(this, "forgetReadMarker", ev => {
      ev.stopPropagation();
      this.messagePanel.forgetReadMarker();
    });
    (0, _defineProperty2.default)(this, "updateTopUnreadMessagesBar", () => {
      if (!this.messagePanel) {
        return;
      }

      const showBar = this.messagePanel.canJumpToReadMarker();

      if (this.state.showTopUnreadMessagesBar != showBar) {
        this.setState({
          showTopUnreadMessagesBar: showBar
        });
      }
    });
    (0, _defineProperty2.default)(this, "onStatusBarVisible", () => {
      if (this.unmounted || this.state.statusBarVisible) return;
      this.setState({
        statusBarVisible: true
      });
    });
    (0, _defineProperty2.default)(this, "onStatusBarHidden", () => {
      // This is currently not desired as it is annoying if it keeps expanding and collapsing
      if (this.unmounted || !this.state.statusBarVisible) return;
      this.setState({
        statusBarVisible: false
      });
    });
    (0, _defineProperty2.default)(this, "handleScrollKey", ev => {
      let panel;

      if (this.searchResultsPanel.current) {
        panel = this.searchResultsPanel.current;
      } else if (this.messagePanel) {
        panel = this.messagePanel;
      }

      if (panel) {
        panel.handleScrollKey(ev);
      }
    });
    (0, _defineProperty2.default)(this, "gatherTimelinePanelRef", r => {
      this.messagePanel = r;
    });
    (0, _defineProperty2.default)(this, "onHiddenHighlightsClick", () => {
      const oldRoom = this.getOldRoom();
      if (!oldRoom) return;

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: oldRoom.roomId,
        metricsTrigger: "Predecessor"
      });
    });
    (0, _defineProperty2.default)(this, "onFileDrop", dataTransfer => _ContentMessages.default.sharedInstance().sendContentListToRoom(Array.from(dataTransfer.files), this.state.room?.roomId ?? this.state.roomId, null, this.context, _RoomContext.TimelineRenderingType.Room));
    (0, _defineProperty2.default)(this, "onMeasurement", narrow => {
      this.setState({
        narrow
      });
    });
    const llMembers = context.hasLazyLoadMembersEnabled();
    this.state = {
      roomId: null,
      roomLoading: true,
      peekLoading: false,
      shouldPeek: true,
      membersLoaded: !llMembers,
      numUnreadMessages: 0,
      searchResults: null,
      callState: null,
      canPeek: false,
      canSelfRedact: false,
      showApps: false,
      isPeeking: false,
      showRightPanel: false,
      joining: false,
      showTopUnreadMessagesBar: false,
      statusBarVisible: false,
      canReact: false,
      canSendMessages: false,
      resizing: false,
      layout: _SettingsStore.default.getValue("layout"),
      lowBandwidth: _SettingsStore.default.getValue("lowBandwidth"),
      alwaysShowTimestamps: _SettingsStore.default.getValue("alwaysShowTimestamps"),
      showTwelveHourTimestamps: _SettingsStore.default.getValue("showTwelveHourTimestamps"),
      readMarkerInViewThresholdMs: _SettingsStore.default.getValue("readMarkerInViewThresholdMs"),
      readMarkerOutOfViewThresholdMs: _SettingsStore.default.getValue("readMarkerOutOfViewThresholdMs"),
      showHiddenEvents: _SettingsStore.default.getValue("showHiddenEventsInTimeline"),
      showReadReceipts: true,
      showRedactions: true,
      showJoinLeaves: true,
      showAvatarChanges: true,
      showDisplaynameChanges: true,
      matrixClientIsReady: context?.isInitialSyncComplete(),
      mainSplitContentType: MainSplitContentType.Timeline,
      timelineRenderingType: _RoomContext.TimelineRenderingType.Room,
      liveTimeline: undefined,
      narrow: false
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    context.on(_client.ClientEvent.Room, this.onRoom);
    context.on(_room.RoomEvent.Timeline, this.onRoomTimeline);
    context.on(_room.RoomEvent.TimelineReset, this.onRoomTimelineReset);
    context.on(_room.RoomEvent.Name, this.onRoomName);
    context.on(_roomState.RoomStateEvent.Events, this.onRoomStateEvents);
    context.on(_roomState.RoomStateEvent.Update, this.onRoomStateUpdate);
    context.on(_room.RoomEvent.MyMembership, this.onMyMembership);
    context.on(_crypto.CryptoEvent.KeyBackupStatus, this.onKeyBackupStatus);
    context.on(_crypto.CryptoEvent.DeviceVerificationChanged, this.onDeviceVerificationChanged);
    context.on(_crypto.CryptoEvent.UserTrustStatusChanged, this.onUserVerificationChanged);
    context.on(_crypto.CryptoEvent.KeysChanged, this.onCrossSigningKeysChanged);
    context.on(_event.MatrixEventEvent.Decrypted, this.onEventDecrypted); // Start listening for RoomViewStore updates

    this.roomStoreToken = _RoomViewStore.RoomViewStore.instance.addListener(this.onRoomViewStoreUpdate);

    _RightPanelStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.onRightPanelStoreUpdate);

    _WidgetEchoStore.default.on(_AsyncStore.UPDATE_EVENT, this.onWidgetEchoStoreUpdate);

    _WidgetStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.onWidgetStoreUpdate);

    this.props.resizeNotifier.on("isResizing", this.onIsResizing);
    this.settingWatchers = [_SettingsStore.default.watchSetting("layout", null, function () {
      for (var _len6 = arguments.length, _ref6 = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        _ref6[_key6] = arguments[_key6];
      }

      let [,,, value] = _ref6;
      return _this.setState({
        layout: value
      });
    }), _SettingsStore.default.watchSetting("lowBandwidth", null, function () {
      for (var _len7 = arguments.length, _ref7 = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        _ref7[_key7] = arguments[_key7];
      }

      let [,,, value] = _ref7;
      return _this.setState({
        lowBandwidth: value
      });
    }), _SettingsStore.default.watchSetting("alwaysShowTimestamps", null, function () {
      for (var _len8 = arguments.length, _ref8 = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        _ref8[_key8] = arguments[_key8];
      }

      let [,,, value] = _ref8;
      return _this.setState({
        alwaysShowTimestamps: value
      });
    }), _SettingsStore.default.watchSetting("showTwelveHourTimestamps", null, function () {
      for (var _len9 = arguments.length, _ref9 = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        _ref9[_key9] = arguments[_key9];
      }

      let [,,, value] = _ref9;
      return _this.setState({
        showTwelveHourTimestamps: value
      });
    }), _SettingsStore.default.watchSetting("readMarkerInViewThresholdMs", null, function () {
      for (var _len10 = arguments.length, _ref10 = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        _ref10[_key10] = arguments[_key10];
      }

      let [,,, value] = _ref10;
      return _this.setState({
        readMarkerInViewThresholdMs: value
      });
    }), _SettingsStore.default.watchSetting("readMarkerOutOfViewThresholdMs", null, function () {
      for (var _len11 = arguments.length, _ref11 = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        _ref11[_key11] = arguments[_key11];
      }

      let [,,, value] = _ref11;
      return _this.setState({
        readMarkerOutOfViewThresholdMs: value
      });
    }), _SettingsStore.default.watchSetting("showHiddenEventsInTimeline", null, function () {
      for (var _len12 = arguments.length, _ref12 = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        _ref12[_key12] = arguments[_key12];
      }

      let [,,, value] = _ref12;
      return _this.setState({
        showHiddenEvents: value
      });
    }), _SettingsStore.default.watchSetting("urlPreviewsEnabled", null, this.onUrlPreviewsEnabledChange), _SettingsStore.default.watchSetting("urlPreviewsEnabled_e2ee", null, this.onUrlPreviewsEnabledChange)];
  }

  getPermalinkCreatorForRoom(room) {
    if (this.permalinkCreators[room.roomId]) return this.permalinkCreators[room.roomId];
    this.permalinkCreators[room.roomId] = new _Permalinks.RoomPermalinkCreator(room);

    if (this.state.room && room.roomId === this.state.room.roomId) {
      // We want to watch for changes in the creator for the primary room in the view, but
      // don't need to do so for search results.
      this.permalinkCreators[room.roomId].start();
    } else {
      this.permalinkCreators[room.roomId].load();
    }

    return this.permalinkCreators[room.roomId];
  }

  stopAllPermalinkCreators() {
    if (!this.permalinkCreators) return;

    for (const roomId of Object.keys(this.permalinkCreators)) {
      this.permalinkCreators[roomId].stop();
    }
  }

  setupRoom(room, roomId, joining, shouldPeek) {
    // if this is an unknown room then we're in one of three states:
    // - This is a room we can peek into (search engine) (we can /peek)
    // - This is a room we can publicly join or were invited to. (we can /join)
    // - This is a room we cannot join at all. (no action can help us)
    // We can't try to /join because this may implicitly accept invites (!)
    // We can /peek though. If it fails then we present the join UI. If it
    // succeeds then great, show the preview (but we still may be able to /join!).
    // Note that peeking works by room ID and room ID only, as opposed to joining
    // which must be by alias or invite wherever possible (peeking currently does
    // not work over federation).
    // NB. We peek if we have never seen the room before (i.e. js-sdk does not know
    // about it). We don't peek in the historical case where we were joined but are
    // now not joined because the js-sdk peeking API will clobber our historical room,
    // making it impossible to indicate a newly joined room.
    if (!joining && roomId) {
      if (!room && shouldPeek) {
        _logger.logger.info("Attempting to peek into room %s", roomId);

        this.setState({
          peekLoading: true,
          isPeeking: true // this will change to false if peeking fails

        });
        this.context.peekInRoom(roomId).then(room => {
          if (this.unmounted) {
            return;
          }

          this.setState({
            room: room,
            peekLoading: false
          });
          this.onRoomLoaded(room);
        }).catch(err => {
          if (this.unmounted) {
            return;
          } // Stop peeking if anything went wrong


          this.setState({
            isPeeking: false
          }); // This won't necessarily be a MatrixError, but we duck-type
          // here and say if it's got an 'errcode' key with the right value,
          // it means we can't peek.

          if (err.errcode === "M_GUEST_ACCESS_FORBIDDEN" || err.errcode === 'M_FORBIDDEN') {
            // This is fine: the room just isn't peekable (we assume).
            this.setState({
              peekLoading: false
            });
          } else {
            throw err;
          }
        });
      } else if (room) {
        // Stop peeking because we have joined this room previously
        this.context.stopPeeking();
        this.setState({
          isPeeking: false
        });
      }
    }
  }

  shouldShowApps(room) {
    if (!BROWSER_SUPPORTS_SANDBOX || !room) return false; // Check if user has previously chosen to hide the app drawer for this
    // room. If so, do not show apps

    const hideWidgetKey = room.roomId + "_hide_widget_drawer";
    const hideWidgetDrawer = localStorage.getItem(hideWidgetKey); // If unset show the Tray
    // Otherwise (in case the user set hideWidgetDrawer by clicking the button) follow the parameter.

    const isManuallyShown = hideWidgetDrawer ? hideWidgetDrawer === "false" : true;

    const widgets = _WidgetLayoutStore.WidgetLayoutStore.instance.getContainerWidgets(room, _WidgetLayoutStore.Container.Top);

    return isManuallyShown && widgets.length > 0;
  }

  componentDidMount() {
    this.onRoomViewStoreUpdate(true);
    const call = this.getCallForRoom();
    const callState = call ? call.state : null;
    this.setState({
      callState: callState
    });

    _LegacyCallHandler.default.instance.on(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.onCallState);

    window.addEventListener('beforeunload', this.onPageUnload);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const hasPropsDiff = (0, _objects.objectHasDiff)(this.props, nextProps);
    const _this$state = this.state,
          {
      upgradeRecommendation
    } = _this$state,
          state = (0, _objectWithoutProperties2.default)(_this$state, _excluded);
    const {
      upgradeRecommendation: newUpgradeRecommendation
    } = nextState,
          newState = (0, _objectWithoutProperties2.default)(nextState, _excluded2);
    const hasStateDiff = newUpgradeRecommendation?.needsUpgrade !== upgradeRecommendation?.needsUpgrade || (0, _objects.objectHasDiff)(state, newState);
    return hasPropsDiff || hasStateDiff;
  }

  componentDidUpdate() {
    // Note: We check the ref here with a flag because componentDidMount, despite
    // documentation, does not define our messagePanel ref. It looks like our spinner
    // in render() prevents the ref from being set on first mount, so we try and
    // catch the messagePanel when it does mount. Because we only want the ref once,
    // we use a boolean flag to avoid duplicate work.
    if (this.messagePanel && this.state.atEndOfLiveTimeline === undefined) {
      this.setState({
        atEndOfLiveTimeline: this.messagePanel.isAtEndOfLiveTimeline()
      });
    }
  }

  componentWillUnmount() {
    // set a boolean to say we've been unmounted, which any pending
    // promises can use to throw away their results.
    //
    // (We could use isMounted, but facebook have deprecated that.)
    this.unmounted = true;

    _LegacyCallHandler.default.instance.removeListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.onCallState); // update the scroll map before we get unmounted


    if (this.state.roomId) {
      _RoomScrollStateStore.default.setScrollState(this.state.roomId, this.getScrollState());
    }

    if (this.state.shouldPeek) {
      this.context.stopPeeking();
    } // stop tracking room changes to format permalinks


    this.stopAllPermalinkCreators();

    _dispatcher.default.unregister(this.dispatcherRef);

    if (this.context) {
      this.context.removeListener(_client.ClientEvent.Room, this.onRoom);
      this.context.removeListener(_room.RoomEvent.Timeline, this.onRoomTimeline);
      this.context.removeListener(_room.RoomEvent.Name, this.onRoomName);
      this.context.removeListener(_roomState.RoomStateEvent.Events, this.onRoomStateEvents);
      this.context.removeListener(_room.RoomEvent.MyMembership, this.onMyMembership);
      this.context.removeListener(_roomState.RoomStateEvent.Update, this.onRoomStateUpdate);
      this.context.removeListener(_crypto.CryptoEvent.KeyBackupStatus, this.onKeyBackupStatus);
      this.context.removeListener(_crypto.CryptoEvent.DeviceVerificationChanged, this.onDeviceVerificationChanged);
      this.context.removeListener(_crypto.CryptoEvent.UserTrustStatusChanged, this.onUserVerificationChanged);
      this.context.removeListener(_crypto.CryptoEvent.KeysChanged, this.onCrossSigningKeysChanged);
      this.context.removeListener(_event.MatrixEventEvent.Decrypted, this.onEventDecrypted);
    }

    window.removeEventListener('beforeunload', this.onPageUnload); // Remove RoomStore listener

    if (this.roomStoreToken) {
      this.roomStoreToken.remove();
    }

    _RightPanelStore.default.instance.off(_AsyncStore.UPDATE_EVENT, this.onRightPanelStoreUpdate);

    _WidgetEchoStore.default.removeListener(_AsyncStore.UPDATE_EVENT, this.onWidgetEchoStoreUpdate);

    _WidgetStore.default.instance.removeListener(_AsyncStore.UPDATE_EVENT, this.onWidgetStoreUpdate);

    this.props.resizeNotifier.off("isResizing", this.onIsResizing);

    if (this.state.room) {
      _WidgetLayoutStore.WidgetLayoutStore.instance.off(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(this.state.room), this.onWidgetLayoutChange);
    }

    _LegacyCallHandler.default.instance.off(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.onCallState); // cancel any pending calls to the throttled updated


    this.updateRoomMembers.cancel();

    for (const watcher of this.settingWatchers) {
      _SettingsStore.default.unwatchSetting(watcher);
    }

    if (this.viewsLocalRoom) {
      // clean up if this was a local room
      this.props.mxClient.store.removeRoom(this.state.room.roomId);
    }
  }

  onLocalRoomEvent(roomId) {
    if (roomId !== this.state.room.roomId) return;
    (0, _directMessages.createRoomFromLocalRoom)(this.props.mxClient, this.state.room);
  }

  getRoomTombstone() {
    let room = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.room;
    return room?.currentState.getStateEvents(_event2.EventType.RoomTombstone, "");
  }

  async calculateRecommendedVersion(room) {
    const upgradeRecommendation = await room.getRecommendedVersion();
    if (this.unmounted) return;
    this.setState({
      upgradeRecommendation
    });
  }

  async loadMembersIfJoined(room) {
    // lazy load members if enabled
    if (this.context.hasLazyLoadMembersEnabled()) {
      if (room && room.getMyMembership() === 'join') {
        try {
          await room.loadMembersIfNeeded();

          if (!this.unmounted) {
            this.setState({
              membersLoaded: true
            });
          }
        } catch (err) {
          const errorMessage = `Fetching room members for ${room.roomId} failed.` + " Room members will appear incomplete.";

          _logger.logger.error(errorMessage);

          _logger.logger.error(err);
        }
      }
    }
  }

  calculatePeekRules(room) {
    const historyVisibility = room.currentState.getStateEvents(_event2.EventType.RoomHistoryVisibility, "");
    this.setState({
      canPeek: historyVisibility?.getContent().history_visibility === _partials.HistoryVisibility.WorldReadable
    });
  }

  updatePreviewUrlVisibility(_ref13) {
    let {
      roomId
    } = _ref13;
    // URL Previews in E2EE rooms can be a privacy leak so use a different setting which is per-room explicit
    const key = this.context.isRoomEncrypted(roomId) ? 'urlPreviewsEnabled_e2ee' : 'urlPreviewsEnabled';
    this.setState({
      showUrlPreview: _SettingsStore.default.getValue(key, roomId)
    });
  }

  async updateE2EStatus(room) {
    if (!this.context.isRoomEncrypted(room.roomId)) return; // If crypto is not currently enabled, we aren't tracking devices at all,
    // so we don't know what the answer is. Let's error on the safe side and show
    // a warning for this case.

    let e2eStatus = _ShieldUtils.E2EStatus.Warning;

    if (this.context.isCryptoEnabled()) {
      /* At this point, the user has encryption on and cross-signing on */
      e2eStatus = await (0, _ShieldUtils.shieldStatusForRoom)(this.context, room);
    }

    if (this.unmounted) return;
    this.setState({
      e2eStatus
    });
  }

  updatePermissions(room) {
    if (room) {
      const me = this.context.getUserId();
      const canReact = room.getMyMembership() === "join" && room.currentState.maySendEvent(_event2.EventType.Reaction, me);
      const canSendMessages = room.maySendMessage();
      const canSelfRedact = room.currentState.maySendEvent(_event2.EventType.RoomRedaction, me);
      this.setState({
        canReact,
        canSendMessages,
        canSelfRedact
      });
    }
  } // rate limited because a power level change will emit an event for every member in the room.


  checkDesktopNotifications() {
    const memberCount = this.state.room.getJoinedMemberCount() + this.state.room.getInvitedMemberCount(); // if they are not alone prompt the user about notifications so they don't miss replies

    if (memberCount > 1 && _Notifier.default.shouldShowPrompt()) {
      (0, _DesktopNotificationsToast.showToast)(true);
    }
  }

  updateDMState() {
    const room = this.state.room;

    if (room.getMyMembership() != "join") {
      return;
    }

    const dmInviter = room.getDMInviter();

    if (dmInviter) {
      Rooms.setDMRoom(room.roomId, dmInviter);
    }
  }

  injectSticker(url, info, text, threadId) {
    if (this.context.isGuest()) {
      _dispatcher.default.dispatch({
        action: 'require_registration'
      });

      return;
    }

    _ContentMessages.default.sharedInstance().sendStickerContentToRoom(url, this.state.room.roomId, threadId, info, text, this.context).then(undefined, error => {
      if (error.name === "UnknownDeviceError") {
        // Let the staus bar handle this
        return;
      }
    });
  }

  handleSearchResult(searchPromise) {
    // keep a record of the current search id, so that if the search terms
    // change before we get a response, we can ignore the results.
    const localSearchId = this.searchId;
    this.setState({
      searchInProgress: true
    });
    return searchPromise.then(async results => {
      debuglog("search complete");

      if (this.unmounted || this.state.timelineRenderingType !== _RoomContext.TimelineRenderingType.Search || this.searchId != localSearchId) {
        _logger.logger.error("Discarding stale search results");

        return false;
      } // postgres on synapse returns us precise details of the strings
      // which actually got matched for highlighting.
      //
      // In either case, we want to highlight the literal search term
      // whether it was used by the search engine or not.


      let highlights = results.highlights;

      if (highlights.indexOf(this.state.searchTerm) < 0) {
        highlights = highlights.concat(this.state.searchTerm);
      } // For overlapping highlights,
      // favour longer (more specific) terms first


      highlights = highlights.sort(function (a, b) {
        return b.length - a.length;
      });

      if (this.context.supportsExperimentalThreads()) {
        // Process all thread roots returned in this batch of search results
        // XXX: This won't work for results coming from Seshat which won't include the bundled relationship
        for (const result of results.results) {
          for (const event of result.context.getTimeline()) {
            const bundledRelationship = event.getServerAggregatedRelation(_thread.THREAD_RELATION_TYPE.name);
            if (!bundledRelationship || event.getThread()) continue;
            const room = this.context.getRoom(event.getRoomId());
            const thread = room.findThreadForEvent(event);

            if (thread) {
              event.setThread(thread);
            } else {
              room.createThread(event.getId(), event, [], true);
            }
          }
        }
      }

      this.setState({
        searchHighlights: highlights,
        searchResults: results
      });
    }, error => {
      _logger.logger.error("Search failed", error);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Search failed"),
        description: error && error.message ? error.message : (0, _languageHandler._t)("Server may be unavailable, overloaded, or search timed out :(")
      });

      return false;
    }).finally(() => {
      this.setState({
        searchInProgress: false
      });
    });
  }

  getSearchResultTiles() {
    // XXX: todo: merge overlapping results somehow?
    // XXX: why doesn't searching on name work?
    const ret = [];

    if (this.state.searchInProgress) {
      ret.push( /*#__PURE__*/_react.default.createElement("li", {
        key: "search-spinner"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null)));
    }

    if (!this.state.searchResults.next_batch) {
      if (!this.state.searchResults?.results?.length) {
        ret.push( /*#__PURE__*/_react.default.createElement("li", {
          key: "search-top-marker"
        }, /*#__PURE__*/_react.default.createElement("h2", {
          className: "mx_RoomView_topMarker"
        }, (0, _languageHandler._t)("No results"))));
      } else {
        ret.push( /*#__PURE__*/_react.default.createElement("li", {
          key: "search-top-marker"
        }, /*#__PURE__*/_react.default.createElement("h2", {
          className: "mx_RoomView_topMarker"
        }, (0, _languageHandler._t)("No more results"))));
      }
    } // once dynamic content in the search results load, make the scrollPanel check
    // the scroll offsets.


    const onHeightChanged = () => {
      const scrollPanel = this.searchResultsPanel.current;

      if (scrollPanel) {
        scrollPanel.checkScroll();
      }
    };

    let lastRoomId;

    for (let i = (this.state.searchResults?.results?.length || 0) - 1; i >= 0; i--) {
      const result = this.state.searchResults.results[i];
      const mxEv = result.context.getEvent();
      const roomId = mxEv.getRoomId();
      const room = this.context.getRoom(roomId);

      if (!room) {
        // if we do not have the room in js-sdk stores then hide it as we cannot easily show it
        // As per the spec, an all rooms search can create this condition,
        // it happens with Seshat but not Synapse.
        // It will make the result count not match the displayed count.
        _logger.logger.log("Hiding search result from an unknown room", roomId);

        continue;
      }

      if (!(0, _EventTileFactory.haveRendererForEvent)(mxEv, this.state.showHiddenEvents)) {
        // XXX: can this ever happen? It will make the result count
        // not match the displayed count.
        continue;
      }

      if (this.state.searchScope === 'All') {
        if (roomId !== lastRoomId) {
          ret.push( /*#__PURE__*/_react.default.createElement("li", {
            key: mxEv.getId() + "-room"
          }, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Room"), ": ", room.name)));
          lastRoomId = roomId;
        }
      }

      const resultLink = "#/room/" + roomId + "/" + mxEv.getId();
      ret.push( /*#__PURE__*/_react.default.createElement(_SearchResultTile.default, {
        key: mxEv.getId(),
        searchResult: result,
        searchHighlights: this.state.searchHighlights,
        resultLink: resultLink,
        permalinkCreator: this.permalinkCreator,
        onHeightChanged: onHeightChanged
      }));
    }

    return ret;
  }

  // get the current scroll position of the room, so that it can be
  // restored when we switch back to it.
  //
  getScrollState() {
    const messagePanel = this.messagePanel;
    if (!messagePanel) return null; // if we're following the live timeline, we want to return null; that
    // means that, if we switch back, we will jump to the read-up-to mark.
    //
    // That should be more intuitive than slavishly preserving the current
    // scroll state, in the case where the room advances in the meantime
    // (particularly in the case that the user reads some stuff on another
    // device).
    //

    if (this.state.atEndOfLiveTimeline) {
      return null;
    }

    const scrollState = messagePanel.getScrollState(); // getScrollState on TimelinePanel *may* return null, so guard against that

    if (!scrollState || scrollState.stuckAtBottom) {
      // we don't really expect to be in this state, but it will
      // occasionally happen when no scroll state has been set on the
      // messagePanel (ie, we didn't have an initial event (so it's
      // probably a new room), there has been no user-initiated scroll, and
      // no read-receipts have arrived to update the scroll position).
      //
      // Return null, which will cause us to scroll to last unread on
      // reload.
      return null;
    }

    return {
      focussedEvent: scrollState.trackedScrollToken,
      pixelOffset: scrollState.pixelOffset
    };
  }

  /**
   * get any current call for this room
   */
  getCallForRoom() {
    if (!this.state.room) {
      return null;
    }

    return _LegacyCallHandler.default.instance.getCallForRoom(this.state.room.roomId);
  } // this has to be a proper method rather than an unnamed function,
  // otherwise react calls it with null on each update.


  getOldRoom() {
    const createEvent = this.state.room.currentState.getStateEvents(_event2.EventType.RoomCreate, "");
    if (!createEvent || !createEvent.getContent()['predecessor']) return null;
    return this.context.getRoom(createEvent.getContent()['predecessor']['room_id']);
  }

  getHiddenHighlightCount() {
    const oldRoom = this.getOldRoom();
    if (!oldRoom) return 0;
    return oldRoom.getUnreadNotificationCount(_room.NotificationCountType.Highlight);
  }

  get messagePanelClassNames() {
    return (0, _classnames.default)("mx_RoomView_messagePanel", {
      mx_IRCLayout: this.state.layout === _Layout.Layout.IRC
    });
  }

  get viewsLocalRoom() {
    return (0, _isLocalRoom.isLocalRoom)(this.state.room);
  }

  get permalinkCreator() {
    return this.getPermalinkCreatorForRoom(this.state.room);
  }

  renderLocalRoomCreateLoader() {
    const names = this.state.room.getDefaultRoomName(this.props.mxClient.getUserId());
    return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
      value: this.state
    }, /*#__PURE__*/_react.default.createElement(LocalRoomCreateLoader, {
      names: names,
      resizeNotifier: this.props.resizeNotifier
    }));
  }

  renderLocalRoomView() {
    return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
      value: this.state
    }, /*#__PURE__*/_react.default.createElement(LocalRoomView, {
      resizeNotifier: this.props.resizeNotifier,
      permalinkCreator: this.permalinkCreator,
      roomView: this.roomView,
      onFileDrop: this.onFileDrop
    }));
  }

  render() {
    if (this.state.room instanceof _LocalRoom.LocalRoom) {
      if (this.state.room.state === _LocalRoom.LocalRoomState.CREATING) {
        return this.renderLocalRoomCreateLoader();
      }

      return this.renderLocalRoomView();
    }

    if (!this.state.room) {
      const loading = !this.state.matrixClientIsReady || this.state.roomLoading || this.state.peekLoading;

      if (loading) {
        // Assume preview loading if we don't have a ready client or a room ID (still resolving the alias)
        const previewLoading = !this.state.matrixClientIsReady || !this.state.roomId || this.state.peekLoading;
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView"
        }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
          canPreview: false,
          previewLoading: previewLoading && !this.state.roomLoadError,
          error: this.state.roomLoadError,
          loading: loading,
          joining: this.state.joining,
          oobData: this.props.oobData
        })));
      } else {
        let inviterName = undefined;

        if (this.props.oobData) {
          inviterName = this.props.oobData.inviterName;
        }

        const invitedEmail = this.props.threepidInvite?.toEmail; // We have no room object for this room, only the ID.
        // We've got to this room by following a link, possibly a third party invite.

        const roomAlias = this.state.roomAlias;
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView"
        }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
          onJoinClick: this.onJoinButtonClicked,
          onForgetClick: this.onForgetClick,
          onRejectClick: this.onRejectThreepidInviteButtonClicked,
          canPreview: false,
          error: this.state.roomLoadError,
          roomAlias: roomAlias,
          joining: this.state.joining,
          inviterName: inviterName,
          invitedEmail: invitedEmail,
          oobData: this.props.oobData,
          signUrl: this.props.threepidInvite?.signUrl,
          room: this.state.room
        })));
      }
    }

    const myMembership = this.state.room.getMyMembership();

    if (this.state.room.isElementVideoRoom() && !(_SettingsStore.default.getValue("feature_video_rooms") && myMembership === "join")) {
      return /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MainSplit"
      }, /*#__PURE__*/_react.default.createElement(_RoomPreviewCard.default, {
        room: this.state.room,
        onJoinButtonClicked: this.onJoinButtonClicked,
        onRejectButtonClicked: this.onRejectButtonClicked
      })), ";");
    } // SpaceRoomView handles invites itself


    if (myMembership === "invite" && !this.state.room.isSpaceRoom()) {
      if (this.state.joining || this.state.rejecting) {
        return /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
          canPreview: false,
          error: this.state.roomLoadError,
          joining: this.state.joining,
          rejecting: this.state.rejecting
        }));
      } else {
        const myUserId = this.context.credentials.userId;
        const myMember = this.state.room.getMember(myUserId);
        const inviteEvent = myMember ? myMember.events.member : null;
        let inviterName = (0, _languageHandler._t)("Unknown");

        if (inviteEvent) {
          inviterName = inviteEvent.sender ? inviteEvent.sender.name : inviteEvent.getSender();
        } // We deliberately don't try to peek into invites, even if we have permission to peek
        // as they could be a spam vector.
        // XXX: in future we could give the option of a 'Preview' button which lets them view anyway.
        // We have a regular invite for this room.


        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView"
        }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
          onJoinClick: this.onJoinButtonClicked,
          onForgetClick: this.onForgetClick,
          onRejectClick: this.onRejectButtonClicked,
          onRejectAndIgnoreClick: this.onRejectAndIgnoreClick,
          inviterName: inviterName,
          canPreview: false,
          joining: this.state.joining,
          room: this.state.room
        })));
      }
    } // We have successfully loaded this room, and are not previewing.
    // Display the "normal" room view.


    let activeCall = null;
    {
      // New block because this variable doesn't need to hang around for the rest of the function
      const call = this.getCallForRoom();

      if (call && this.state.callState !== 'ended' && this.state.callState !== 'ringing') {
        activeCall = call;
      }
    }
    const scrollheaderClasses = (0, _classnames.default)({
      mx_RoomView_scrollheader: true
    });
    let statusBar;
    let isStatusAreaExpanded = true;

    if (_ContentMessages.default.sharedInstance().getCurrentUploads().length > 0) {
      statusBar = /*#__PURE__*/_react.default.createElement(_UploadBar.default, {
        room: this.state.room
      });
    } else if (!this.state.searchResults) {
      isStatusAreaExpanded = this.state.statusBarVisible;
      statusBar = /*#__PURE__*/_react.default.createElement(_RoomStatusBar.default, {
        room: this.state.room,
        isPeeking: myMembership !== "join",
        onInviteClick: this.onInviteClick,
        onVisible: this.onStatusBarVisible,
        onHidden: this.onStatusBarHidden
      });
    }

    const statusBarAreaClass = (0, _classnames.default)("mx_RoomView_statusArea", {
      "mx_RoomView_statusArea_expanded": isStatusAreaExpanded
    }); // if statusBar does not exist then statusBarArea is blank and takes up unnecessary space on the screen
    // show statusBarArea only if statusBar is present

    const statusBarArea = statusBar && /*#__PURE__*/_react.default.createElement("div", {
      className: statusBarAreaClass
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_statusAreaBox"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_statusAreaBox_line"
    }), statusBar));

    const roomVersionRecommendation = this.state.upgradeRecommendation;
    const showRoomUpgradeBar = roomVersionRecommendation && roomVersionRecommendation.needsUpgrade && this.state.room.userMayUpgradeRoom(this.context.credentials.userId);
    const hiddenHighlightCount = this.getHiddenHighlightCount();
    let aux = null;
    let previewBar;

    if (this.state.timelineRenderingType === _RoomContext.TimelineRenderingType.Search) {
      aux = /*#__PURE__*/_react.default.createElement(_SearchBar.default, {
        searchInProgress: this.state.searchInProgress,
        onCancelClick: this.onCancelSearchClick,
        onSearch: this.onSearch,
        isRoomEncrypted: this.context.isRoomEncrypted(this.state.room.roomId)
      });
    } else if (showRoomUpgradeBar) {
      aux = /*#__PURE__*/_react.default.createElement(_RoomUpgradeWarningBar.default, {
        room: this.state.room
      });
    } else if (myMembership !== "join") {
      // We do have a room object for this room, but we're not currently in it.
      // We may have a 3rd party invite to it.
      let inviterName = undefined;

      if (this.props.oobData) {
        inviterName = this.props.oobData.inviterName;
      }

      const invitedEmail = this.props.threepidInvite?.toEmail;
      previewBar = /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
        onJoinClick: this.onJoinButtonClicked,
        onForgetClick: this.onForgetClick,
        onRejectClick: this.onRejectThreepidInviteButtonClicked,
        joining: this.state.joining,
        inviterName: inviterName,
        invitedEmail: invitedEmail,
        oobData: this.props.oobData,
        canPreview: this.state.canPeek,
        room: this.state.room
      });

      if (!this.state.canPeek && !this.state.room?.isSpaceRoom()) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView"
        }, previewBar);
      }
    } else if (hiddenHighlightCount > 0) {
      aux = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        element: "div",
        className: "mx_RoomView_auxPanel_hiddenHighlights",
        onClick: this.onHiddenHighlightsClick
      }, (0, _languageHandler._t)("You have %(count)s unread notifications in a prior version of this room.", {
        count: hiddenHighlightCount
      }));
    }

    if (this.state.room?.isSpaceRoom() && !this.props.forceTimeline) {
      return /*#__PURE__*/_react.default.createElement(_SpaceRoomView.default, {
        space: this.state.room,
        justCreatedOpts: this.props.justCreatedOpts,
        resizeNotifier: this.props.resizeNotifier,
        onJoinButtonClicked: this.onJoinButtonClicked,
        onRejectButtonClicked: this.props.threepidInvite ? this.onRejectThreepidInviteButtonClicked : this.onRejectButtonClicked
      });
    }

    const auxPanel = /*#__PURE__*/_react.default.createElement(_AuxPanel.default, {
      room: this.state.room,
      userId: this.context.credentials.userId,
      showApps: this.state.showApps,
      resizeNotifier: this.props.resizeNotifier
    }, aux);

    let messageComposer;
    let searchInfo;
    const showComposer = // joined and not showing search results
    myMembership === 'join' && !this.state.searchResults;

    if (showComposer) {
      messageComposer = /*#__PURE__*/_react.default.createElement(_MessageComposer.default, {
        room: this.state.room,
        e2eStatus: this.state.e2eStatus,
        resizeNotifier: this.props.resizeNotifier,
        replyToEvent: this.state.replyToEvent,
        permalinkCreator: this.permalinkCreator
      });
    } // TODO: Why aren't we storing the term/scope/count in this format
    // in this.state if this is what RoomHeader desires?


    if (this.state.searchResults) {
      searchInfo = {
        searchTerm: this.state.searchTerm,
        searchScope: this.state.searchScope,
        searchCount: this.state.searchResults.count
      };
    } // if we have search results, we keep the messagepanel (so that it preserves its
    // scroll state), but hide it.


    let searchResultsPanel;
    let hideMessagePanel = false;

    if (this.state.searchResults) {
      // show searching spinner
      if (this.state.searchResults.count === undefined) {
        searchResultsPanel = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView_messagePanel mx_RoomView_messagePanelSearchSpinner"
        });
      } else {
        searchResultsPanel = /*#__PURE__*/_react.default.createElement(_ScrollPanel.default, {
          ref: this.searchResultsPanel,
          className: "mx_RoomView_searchResultsPanel " + this.messagePanelClassNames,
          onFillRequest: this.onSearchResultsFillRequest,
          resizeNotifier: this.props.resizeNotifier
        }, /*#__PURE__*/_react.default.createElement("li", {
          className: scrollheaderClasses
        }), this.getSearchResultTiles());
      }

      hideMessagePanel = true;
    }

    let highlightedEventId = null;

    if (this.state.isInitialEventHighlighted) {
      highlightedEventId = this.state.initialEventId;
    } // console.info("ShowUrlPreview for %s is %s", this.state.room.roomId, this.state.showUrlPreview);


    const messagePanel = /*#__PURE__*/_react.default.createElement(_TimelinePanel.default, {
      ref: this.gatherTimelinePanelRef,
      timelineSet: this.state.room.getUnfilteredTimelineSet(),
      showReadReceipts: this.state.showReadReceipts,
      manageReadReceipts: !this.state.isPeeking,
      sendReadReceiptOnLoad: !this.state.wasContextSwitch,
      manageReadMarkers: !this.state.isPeeking,
      hidden: hideMessagePanel,
      highlightedEventId: highlightedEventId,
      eventId: this.state.initialEventId,
      eventScrollIntoView: this.state.initialEventScrollIntoView,
      eventPixelOffset: this.state.initialEventPixelOffset,
      onScroll: this.onMessageListScroll,
      onEventScrolledIntoView: this.resetJumpToEvent,
      onReadMarkerUpdated: this.updateTopUnreadMessagesBar,
      showUrlPreview: this.state.showUrlPreview,
      className: this.messagePanelClassNames,
      membersLoaded: this.state.membersLoaded,
      permalinkCreator: this.permalinkCreator,
      resizeNotifier: this.props.resizeNotifier,
      showReactions: true,
      layout: this.state.layout,
      editState: this.state.editState
    });

    let topUnreadMessagesBar = null; // Do not show TopUnreadMessagesBar if we have search results showing, it makes no sense

    if (this.state.showTopUnreadMessagesBar && !this.state.searchResults) {
      topUnreadMessagesBar = /*#__PURE__*/_react.default.createElement(_TopUnreadMessagesBar.default, {
        onScrollUpClick: this.jumpToReadMarker,
        onCloseClick: this.forgetReadMarker
      });
    }

    let jumpToBottom; // Do not show JumpToBottomButton if we have search results showing, it makes no sense

    if (this.state.atEndOfLiveTimeline === false && !this.state.searchResults) {
      jumpToBottom = /*#__PURE__*/_react.default.createElement(_JumpToBottomButton.default, {
        highlight: this.state.room.getUnreadNotificationCount(_room.NotificationCountType.Highlight) > 0,
        numUnreadMessages: this.state.numUnreadMessages,
        onScrollToBottomClick: this.jumpToLiveTimeline
      });
    }

    const showRightPanel = this.state.room && this.state.showRightPanel;
    const rightPanel = showRightPanel ? /*#__PURE__*/_react.default.createElement(_RightPanel.default, {
      room: this.state.room,
      resizeNotifier: this.props.resizeNotifier,
      permalinkCreator: this.permalinkCreator,
      e2eStatus: this.state.e2eStatus
    }) : null;
    const timelineClasses = (0, _classnames.default)("mx_RoomView_timeline", {
      mx_RoomView_timeline_rr_enabled: this.state.showReadReceipts
    });
    const mainClasses = (0, _classnames.default)("mx_RoomView", {
      mx_RoomView_inCall: Boolean(activeCall),
      mx_RoomView_immersive: this.state.mainSplitContentType === MainSplitContentType.Video
    });

    const showChatEffects = _SettingsStore.default.getValue('showChatEffects');

    let mainSplitBody;
    let mainSplitContentClassName; // Decide what to show in the main split

    switch (this.state.mainSplitContentType) {
      case MainSplitContentType.Timeline:
        mainSplitContentClassName = "mx_MainSplit_timeline";
        mainSplitBody = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Measured.default, {
          sensor: this.roomViewBody.current,
          onMeasurement: this.onMeasurement
        }), auxPanel, /*#__PURE__*/_react.default.createElement("div", {
          className: timelineClasses
        }, /*#__PURE__*/_react.default.createElement(_FileDropTarget.default, {
          parent: this.roomView.current,
          onFileDrop: this.onFileDrop
        }), topUnreadMessagesBar, jumpToBottom, messagePanel, searchResultsPanel), statusBarArea, previewBar, messageComposer);
        break;

      case MainSplitContentType.MaximisedWidget:
        mainSplitContentClassName = "mx_MainSplit_maximisedWidget";
        mainSplitBody = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AppsDrawer.default, {
          room: this.state.room,
          userId: this.context.credentials.userId,
          resizeNotifier: this.props.resizeNotifier,
          showApps: true
        }), previewBar);
        break;

      case MainSplitContentType.Video:
        {
          mainSplitContentClassName = "mx_MainSplit_video";
          mainSplitBody = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_VideoRoomView.VideoRoomView, {
            room: this.state.room,
            resizing: this.state.resizing
          }), previewBar);
        }
    }

    const mainSplitContentClasses = (0, _classnames.default)("mx_RoomView_body", mainSplitContentClassName);
    let excludedRightPanelPhaseButtons = [_RightPanelStorePhases.RightPanelPhases.Timeline];
    let onCallPlaced = this.onCallPlaced;
    let onAppsClick = this.onAppsClick;
    let onForgetClick = this.onForgetClick;
    let onSearchClick = this.onSearchClick;
    let onInviteClick = null; // Simplify the header for other main split types

    switch (this.state.mainSplitContentType) {
      case MainSplitContentType.MaximisedWidget:
        excludedRightPanelPhaseButtons = [_RightPanelStorePhases.RightPanelPhases.ThreadPanel, _RightPanelStorePhases.RightPanelPhases.PinnedMessages];
        onAppsClick = null;
        onForgetClick = null;
        onSearchClick = null;
        break;

      case MainSplitContentType.Video:
        excludedRightPanelPhaseButtons = [_RightPanelStorePhases.RightPanelPhases.ThreadPanel, _RightPanelStorePhases.RightPanelPhases.PinnedMessages, _RightPanelStorePhases.RightPanelPhases.NotificationPanel];
        onCallPlaced = null;
        onAppsClick = null;
        onForgetClick = null;
        onSearchClick = null;

        if (this.state.room.canInvite(this.context.credentials.userId)) {
          onInviteClick = this.onInviteClick;
        }

    }

    return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
      value: this.state
    }, /*#__PURE__*/_react.default.createElement("main", {
      className: mainClasses,
      ref: this.roomView,
      onKeyDown: this.onReactKeyDown
    }, showChatEffects && this.roomView.current && /*#__PURE__*/_react.default.createElement(_EffectsOverlay.default, {
      roomWidth: this.roomView.current.offsetWidth
    }), /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomHeader.default, {
      room: this.state.room,
      searchInfo: searchInfo,
      oobData: this.props.oobData,
      inRoom: myMembership === 'join',
      onSearchClick: onSearchClick,
      onInviteClick: onInviteClick,
      onForgetClick: myMembership === "leave" ? onForgetClick : null,
      e2eStatus: this.state.e2eStatus,
      onAppsClick: this.state.hasPinnedWidgets ? onAppsClick : null,
      appsShown: this.state.showApps,
      onCallPlaced: onCallPlaced,
      excludedRightPanelPhaseButtons: excludedRightPanelPhaseButtons,
      showButtons: !this.viewsLocalRoom,
      enableRoomOptionsMenu: !this.viewsLocalRoom
    }), /*#__PURE__*/_react.default.createElement(_MainSplit.default, {
      panel: rightPanel,
      resizeNotifier: this.props.resizeNotifier
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: mainSplitContentClasses,
      ref: this.roomViewBody,
      "data-layout": this.state.layout
    }, mainSplitBody)))));
  }

}

exports.RoomView = RoomView;
(0, _defineProperty2.default)(RoomView, "contextType", _MatrixClientContext.default);
const RoomViewWithMatrixClient = (0, _MatrixClientContext.withMatrixClientHOC)(RoomView);
var _default = RoomViewWithMatrixClient;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJERUJVRyIsImRlYnVnbG9nIiwibXNnIiwiQlJPV1NFUl9TVVBQT1JUU19TQU5EQk9YIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwibG9nZ2VyIiwibG9nIiwiYmluZCIsImNvbnNvbGUiLCJNYWluU3BsaXRDb250ZW50VHlwZSIsIkxvY2FsUm9vbVZpZXciLCJwcm9wcyIsImNvbnRleHQiLCJ1c2VDb250ZXh0IiwiUm9vbUNvbnRleHQiLCJyb29tIiwiZW5jcnlwdGlvbkV2ZW50IiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJFdmVudFR5cGUiLCJSb29tRW5jcnlwdGlvbiIsImVuY3J5cHRpb25UaWxlIiwib25SZXRyeUNsaWNrZWQiLCJzdGF0ZSIsIkxvY2FsUm9vbVN0YXRlIiwiTkVXIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21JZCIsInN0YXR1c0JhciIsImNvbXBvc2VyIiwiaXNFcnJvciIsImJ1dHRvbnMiLCJfdCIsIlN0YXRpY05vdGlmaWNhdGlvblN0YXRlIiwiUkVEX0VYQ0xBTUFUSU9OIiwicmVzaXplTm90aWZpZXIiLCJwZXJtYWxpbmtDcmVhdG9yIiwiRTJFU3RhdHVzIiwiTm9ybWFsIiwicm9vbVZpZXciLCJjdXJyZW50Iiwib25GaWxlRHJvcCIsIkxvY2FsUm9vbUNyZWF0ZUxvYWRlciIsInRleHQiLCJuYW1lcyIsIlJvb21WaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsImNyZWF0ZVJlZiIsInJlc2l6aW5nIiwic2V0U3RhdGUiLCJjaGVja1dpZGdldHMiLCJkaXMiLCJzaG93IiwiV2lkZ2V0TGF5b3V0U3RvcmUiLCJpbnN0YW5jZSIsImhhc01heGltaXNlZFdpZGdldCIsIlJpZ2h0UGFuZWxTdG9yZSIsInNldENhcmQiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJUaW1lbGluZSIsImlzT3BlbiIsInJvb21QaGFzZUhpc3RvcnkiLCJzb21lIiwiY2FyZCIsIlJvb21TdW1tYXJ5IiwidG9nZ2xlUGFuZWwiLCJoYXNQaW5uZWRXaWRnZXRzIiwibWFpblNwbGl0Q29udGVudFR5cGUiLCJnZXRNYWluU3BsaXRDb250ZW50VHlwZSIsInNob3dBcHBzIiwic2hvdWxkU2hvd0FwcHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJpc0VsZW1lbnRWaWRlb1Jvb20iLCJWaWRlbyIsIk1heGltaXNlZFdpZGdldCIsImluaXRpYWwiLCJ1bm1vdW50ZWQiLCJSb29tVmlld1N0b3JlIiwiZ2V0Um9vbUlkIiwibmV3U3RhdGUiLCJyb29tQWxpYXMiLCJnZXRSb29tQWxpYXMiLCJyb29tTG9hZGluZyIsImlzUm9vbUxvYWRpbmciLCJyb29tTG9hZEVycm9yIiwiZ2V0Um9vbUxvYWRFcnJvciIsImpvaW5pbmciLCJpc0pvaW5pbmciLCJyZXBseVRvRXZlbnQiLCJnZXRRdW90aW5nRXZlbnQiLCJzaG91bGRQZWVrIiwibWF0cml4Q2xpZW50SXNSZWFkeSIsInNob3dSZWFkUmVjZWlwdHMiLCJzaG93UmVkYWN0aW9ucyIsInNob3dKb2luTGVhdmVzIiwic2hvd0F2YXRhckNoYW5nZXMiLCJzaG93RGlzcGxheW5hbWVDaGFuZ2VzIiwid2FzQ29udGV4dFN3aXRjaCIsImdldFdhc0NvbnRleHRTd2l0Y2giLCJpbml0aWFsRXZlbnRJZCIsInNob3dSaWdodFBhbmVsIiwiaXNPcGVuRm9yUm9vbSIsImdldEluaXRpYWxFdmVudElkIiwiZ2V0Um9vbSIsImluaXRpYWxFdmVudCIsImZpbmRFdmVudEJ5SWQiLCJmZXRjaEluaXRpYWxFdmVudCIsImluaXRpYWxFdmVudFBpeGVsT2Zmc2V0IiwidGhyZWFkIiwiZ2V0VGhyZWFkIiwiaXNUaHJlYWRSb290IiwiQWN0aW9uIiwiU2hvd1RocmVhZCIsInJvb3RFdmVudCIsImhpZ2hsaWdodGVkIiwiaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZCIsInNjcm9sbF9pbnRvX3ZpZXciLCJpbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldyIsInNldHRpbmdXYXRjaGVycyIsImNvbmNhdCIsIndhdGNoU2V0dGluZyIsInZhbHVlIiwic3RvcFBlZWtpbmciLCJvblJvb21Mb2FkZWQiLCJyb29tU2Nyb2xsU3RhdGUiLCJSb29tU2Nyb2xsU3RhdGVTdG9yZSIsImdldFNjcm9sbFN0YXRlIiwiZm9jdXNzZWRFdmVudCIsInBpeGVsT2Zmc2V0Iiwic2VhcmNoUmVzdWx0cyIsInNldHVwUm9vbSIsImV2ZW50IiwiQ29udGVudE1lc3NhZ2VzIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRDdXJyZW50VXBsb2FkcyIsImxlbmd0aCIsInJldHVyblZhbHVlIiwiZ2V0Q2FsbEZvclJvb20iLCJjYWxsU3RhdGUiLCJldiIsImhhbmRsZWQiLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRSb29tQWN0aW9uIiwiS2V5QmluZGluZ0FjdGlvbiIsIkRpc21pc3NSZWFkTWFya2VyIiwibWVzc2FnZVBhbmVsIiwiZm9yZ2V0UmVhZE1hcmtlciIsImp1bXBUb0xpdmVUaW1lbGluZSIsIkp1bXBUb09sZGVzdFVucmVhZCIsImp1bXBUb1JlYWRNYXJrZXIiLCJVcGxvYWRGaWxlIiwiVGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiUm9vbSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiY2FsbCIsInBheWxvYWQiLCJjaGVja0Rlc2t0b3BOb3RpZmljYXRpb25zIiwiaW5qZWN0U3RpY2tlciIsImRhdGEiLCJjb250ZW50IiwidXJsIiwiaW5mbyIsImRlc2NyaXB0aW9uIiwibmFtZSIsInRocmVhZElkIiwic2VuZENvbnRlbnRMaXN0VG9Sb29tIiwiZmlsZSIsIlVwbG9hZFN0YXJ0ZWQiLCJVcGxvYWRGaW5pc2hlZCIsIlVwbG9hZENhbmNlbGVkIiwiZm9yY2VVcGRhdGUiLCJTZWFyY2giLCJvbkNhbmNlbFNlYXJjaENsaWNrIiwiaXNJbml0aWFsU3luY0NvbXBsZXRlIiwib25Sb29tVmlld1N0b3JlVXBkYXRlIiwib25TZWFyY2hDbGljayIsIm9uTG9jYWxSb29tRXZlbnQiLCJFZGl0RXZlbnQiLCJ0aW1lbGluZVJlbmRlcmluZ1R5cGUiLCJlZGl0U3RhdGUiLCJFZGl0b3JTdGF0ZVRyYW5zZmVyIiwic2Nyb2xsVG9FdmVudElmTmVlZGVkIiwiZ2V0SWQiLCJDb21wb3Nlckluc2VydCIsImNvbXBvc2VyVHlwZSIsIlRocmVhZCIsIkNvbXBvc2VyVHlwZSIsIkVkaXQiLCJTZW5kIiwiRm9jdXNBQ29tcG9zZXIiLCJGb2N1c0VkaXRNZXNzYWdlQ29tcG9zZXIiLCJGb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIiLCJ0b1N0YXJ0T2ZUaW1lbGluZSIsInJlbW92ZWQiLCJ0aW1lbGluZSIsImdldFRpbWVsaW5lU2V0IiwiZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0IiwiZ2V0VHlwZSIsInVwZGF0ZVByZXZpZXdVcmxWaXNpYmlsaXR5IiwidXBkYXRlRTJFU3RhdHVzIiwibGl2ZUV2ZW50IiwiaXNCZWluZ0RlY3J5cHRlZCIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJoYW5kbGVFZmZlY3RzIiwiZ2V0U2VuZGVyIiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJhdEVuZE9mTGl2ZVRpbWVsaW5lIiwic2hvdWxkSGlkZUV2ZW50IiwibnVtVW5yZWFkTWVzc2FnZXMiLCJub3RpZlN0YXRlIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJnZXRSb29tU3RhdGUiLCJpc1VucmVhZCIsIkNIQVRfRUZGRUNUUyIsImZvckVhY2giLCJlZmZlY3QiLCJjb250YWluc0Vtb2ppIiwiZ2V0Q29udGVudCIsImVtb2ppcyIsIm1zZ3R5cGUiLCJtc2dUeXBlIiwiaXNSZWxhdGlvbiIsIlRIUkVBRF9SRUxBVElPTl9UWVBFIiwiY29tbWFuZCIsImNhblJlc2V0VGltZWxpbmUiLCJvbiIsImVtaXNzaW9uRm9yUm9vbSIsIm9uV2lkZ2V0TGF5b3V0Q2hhbmdlIiwiY2FsY3VsYXRlUGVla1J1bGVzIiwibG9hZE1lbWJlcnNJZkpvaW5lZCIsImNhbGN1bGF0ZVJlY29tbWVuZGVkVmVyc2lvbiIsInVwZGF0ZVBlcm1pc3Npb25zIiwidG9tYnN0b25lIiwiZ2V0Um9vbVRvbWJzdG9uZSIsImxpdmVUaW1lbGluZSIsImdldExpdmVUaW1lbGluZSIsInRpbWVsaW5lU2V0Iiwib2ZmIiwiZ2V0TWVtYmVyIiwiUm9vbVRvbWJzdG9uZSIsInVwZGF0ZVJvb21NZW1iZXJzIiwibWVtYmVyc2hpcCIsIm9sZE1lbWJlcnNoaXAiLCJ0aHJvdHRsZSIsInVwZGF0ZURNU3RhdGUiLCJsZWFkaW5nIiwidHJhaWxpbmciLCJiYWNrd2FyZHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsIm5leHRfYmF0Y2giLCJzZWFyY2hQcm9taXNlIiwic2VhcmNoUGFnaW5hdGlvbiIsImhhbmRsZVNlYXJjaFJlc3VsdCIsImlzR3Vlc3QiLCJEb0FmdGVyU3luY1ByZXBhcmVkIiwiZGVmZXJyZWRfYWN0aW9uIiwiVmlld1Jvb20iLCJyb29tX2lkIiwibWV0cmljc1RyaWdnZXIiLCJ1bmRlZmluZWQiLCJ0aGVuIiwic2lnblVybCIsInRocmVlcGlkSW52aXRlIiwiSm9pblJvb20iLCJvcHRzIiwiaW52aXRlU2lnblVybCIsImdldE15TWVtYmVyc2hpcCIsImlzQXRFbmRPZkxpdmVUaW1lbGluZSIsInVwZGF0ZVRvcFVucmVhZE1lc3NhZ2VzQmFyIiwiZXZlbnRJZCIsImV2ZW50X2lkIiwicmVwbHlpbmdUb0V2ZW50IiwidGVybSIsInNjb3BlIiwic2VhcmNoVGVybSIsInNlYXJjaFNjb3BlIiwic2VhcmNoSGlnaGxpZ2h0cyIsInNlYXJjaFJlc3VsdHNQYW5lbCIsInJlc2V0U2Nyb2xsU3RhdGUiLCJzZWFyY2hJZCIsIkRhdGUiLCJnZXRUaW1lIiwiU2VhcmNoU2NvcGUiLCJldmVudFNlYXJjaCIsInR5cGUiLCJMZWdhY3lDYWxsSGFuZGxlciIsInBsYWNlQ2FsbCIsInJlamVjdGluZyIsImxlYXZlIiwiVmlld0hvbWVQYWdlIiwiZXJyb3IiLCJtZXNzYWdlIiwiSlNPTiIsInN0cmluZ2lmeSIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsInJlamVjdEVycm9yIiwibXlNZW1iZXIiLCJnZXRVc2VySWQiLCJpbnZpdGVFdmVudCIsImV2ZW50cyIsIm1lbWJlciIsImlnbm9yZWRVc2VycyIsImdldElnbm9yZWRVc2VycyIsInB1c2giLCJzZXRJZ25vcmVkVXNlcnMiLCJmaXJlIiwiVmlld1Jvb21EaXJlY3RvcnkiLCJzaG93QmFyIiwiY2FuSnVtcFRvUmVhZE1hcmtlciIsInNob3dUb3BVbnJlYWRNZXNzYWdlc0JhciIsInN0YXR1c0JhclZpc2libGUiLCJwYW5lbCIsImhhbmRsZVNjcm9sbEtleSIsInIiLCJvbGRSb29tIiwiZ2V0T2xkUm9vbSIsImRhdGFUcmFuc2ZlciIsIkFycmF5IiwiZnJvbSIsImZpbGVzIiwibmFycm93IiwibGxNZW1iZXJzIiwiaGFzTGF6eUxvYWRNZW1iZXJzRW5hYmxlZCIsInBlZWtMb2FkaW5nIiwibWVtYmVyc0xvYWRlZCIsImNhblBlZWsiLCJjYW5TZWxmUmVkYWN0IiwiaXNQZWVraW5nIiwiY2FuUmVhY3QiLCJjYW5TZW5kTWVzc2FnZXMiLCJsYXlvdXQiLCJsb3dCYW5kd2lkdGgiLCJhbHdheXNTaG93VGltZXN0YW1wcyIsInNob3dUd2VsdmVIb3VyVGltZXN0YW1wcyIsInJlYWRNYXJrZXJJblZpZXdUaHJlc2hvbGRNcyIsInJlYWRNYXJrZXJPdXRPZlZpZXdUaHJlc2hvbGRNcyIsInNob3dIaWRkZW5FdmVudHMiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsIkNsaWVudEV2ZW50Iiwib25Sb29tIiwiUm9vbUV2ZW50Iiwib25Sb29tVGltZWxpbmUiLCJUaW1lbGluZVJlc2V0Iiwib25Sb29tVGltZWxpbmVSZXNldCIsIk5hbWUiLCJvblJvb21OYW1lIiwiUm9vbVN0YXRlRXZlbnQiLCJFdmVudHMiLCJvblJvb21TdGF0ZUV2ZW50cyIsIlVwZGF0ZSIsIm9uUm9vbVN0YXRlVXBkYXRlIiwiTXlNZW1iZXJzaGlwIiwib25NeU1lbWJlcnNoaXAiLCJDcnlwdG9FdmVudCIsIktleUJhY2t1cFN0YXR1cyIsIm9uS2V5QmFja3VwU3RhdHVzIiwiRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIlVzZXJUcnVzdFN0YXR1c0NoYW5nZWQiLCJvblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkIiwiS2V5c0NoYW5nZWQiLCJvbkNyb3NzU2lnbmluZ0tleXNDaGFuZ2VkIiwiTWF0cml4RXZlbnRFdmVudCIsIkRlY3J5cHRlZCIsIm9uRXZlbnREZWNyeXB0ZWQiLCJyb29tU3RvcmVUb2tlbiIsImFkZExpc3RlbmVyIiwiVVBEQVRFX0VWRU5UIiwib25SaWdodFBhbmVsU3RvcmVVcGRhdGUiLCJXaWRnZXRFY2hvU3RvcmUiLCJvbldpZGdldEVjaG9TdG9yZVVwZGF0ZSIsIldpZGdldFN0b3JlIiwib25XaWRnZXRTdG9yZVVwZGF0ZSIsIm9uSXNSZXNpemluZyIsIm9uVXJsUHJldmlld3NFbmFibGVkQ2hhbmdlIiwiZ2V0UGVybWFsaW5rQ3JlYXRvckZvclJvb20iLCJwZXJtYWxpbmtDcmVhdG9ycyIsIlJvb21QZXJtYWxpbmtDcmVhdG9yIiwic3RhcnQiLCJsb2FkIiwic3RvcEFsbFBlcm1hbGlua0NyZWF0b3JzIiwiT2JqZWN0Iiwia2V5cyIsInN0b3AiLCJwZWVrSW5Sb29tIiwiY2F0Y2giLCJlcnIiLCJlcnJjb2RlIiwiaGlkZVdpZGdldEtleSIsImhpZGVXaWRnZXREcmF3ZXIiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiaXNNYW51YWxseVNob3duIiwid2lkZ2V0cyIsImdldENvbnRhaW5lcldpZGdldHMiLCJDb250YWluZXIiLCJUb3AiLCJjb21wb25lbnREaWRNb3VudCIsIkxlZ2FjeUNhbGxIYW5kbGVyRXZlbnQiLCJDYWxsU3RhdGUiLCJvbkNhbGxTdGF0ZSIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJvblBhZ2VVbmxvYWQiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJoYXNQcm9wc0RpZmYiLCJvYmplY3RIYXNEaWZmIiwidXBncmFkZVJlY29tbWVuZGF0aW9uIiwibmV3VXBncmFkZVJlY29tbWVuZGF0aW9uIiwiaGFzU3RhdGVEaWZmIiwibmVlZHNVcGdyYWRlIiwiY29tcG9uZW50RGlkVXBkYXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsInNldFNjcm9sbFN0YXRlIiwidW5yZWdpc3RlciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmUiLCJjYW5jZWwiLCJ3YXRjaGVyIiwidW53YXRjaFNldHRpbmciLCJ2aWV3c0xvY2FsUm9vbSIsIm14Q2xpZW50Iiwic3RvcmUiLCJyZW1vdmVSb29tIiwiY3JlYXRlUm9vbUZyb21Mb2NhbFJvb20iLCJnZXRSZWNvbW1lbmRlZFZlcnNpb24iLCJsb2FkTWVtYmVyc0lmTmVlZGVkIiwiZXJyb3JNZXNzYWdlIiwiaGlzdG9yeVZpc2liaWxpdHkiLCJSb29tSGlzdG9yeVZpc2liaWxpdHkiLCJoaXN0b3J5X3Zpc2liaWxpdHkiLCJIaXN0b3J5VmlzaWJpbGl0eSIsIldvcmxkUmVhZGFibGUiLCJrZXkiLCJpc1Jvb21FbmNyeXB0ZWQiLCJzaG93VXJsUHJldmlldyIsImUyZVN0YXR1cyIsIldhcm5pbmciLCJpc0NyeXB0b0VuYWJsZWQiLCJzaGllbGRTdGF0dXNGb3JSb29tIiwibWUiLCJtYXlTZW5kRXZlbnQiLCJSZWFjdGlvbiIsIm1heVNlbmRNZXNzYWdlIiwiUm9vbVJlZGFjdGlvbiIsIm1lbWJlckNvdW50IiwiZ2V0Sm9pbmVkTWVtYmVyQ291bnQiLCJnZXRJbnZpdGVkTWVtYmVyQ291bnQiLCJOb3RpZmllciIsInNob3VsZFNob3dQcm9tcHQiLCJzaG93Tm90aWZpY2F0aW9uc1RvYXN0IiwiZG1JbnZpdGVyIiwiZ2V0RE1JbnZpdGVyIiwiUm9vbXMiLCJzZXRETVJvb20iLCJzZW5kU3RpY2tlckNvbnRlbnRUb1Jvb20iLCJsb2NhbFNlYXJjaElkIiwic2VhcmNoSW5Qcm9ncmVzcyIsInJlc3VsdHMiLCJoaWdobGlnaHRzIiwiaW5kZXhPZiIsInNvcnQiLCJhIiwiYiIsInN1cHBvcnRzRXhwZXJpbWVudGFsVGhyZWFkcyIsInJlc3VsdCIsImdldFRpbWVsaW5lIiwiYnVuZGxlZFJlbGF0aW9uc2hpcCIsImdldFNlcnZlckFnZ3JlZ2F0ZWRSZWxhdGlvbiIsImZpbmRUaHJlYWRGb3JFdmVudCIsInNldFRocmVhZCIsImNyZWF0ZVRocmVhZCIsImZpbmFsbHkiLCJnZXRTZWFyY2hSZXN1bHRUaWxlcyIsInJldCIsIm9uSGVpZ2h0Q2hhbmdlZCIsInNjcm9sbFBhbmVsIiwiY2hlY2tTY3JvbGwiLCJsYXN0Um9vbUlkIiwiaSIsIm14RXYiLCJnZXRFdmVudCIsImhhdmVSZW5kZXJlckZvckV2ZW50IiwicmVzdWx0TGluayIsInNjcm9sbFN0YXRlIiwic3R1Y2tBdEJvdHRvbSIsInRyYWNrZWRTY3JvbGxUb2tlbiIsImNyZWF0ZUV2ZW50IiwiUm9vbUNyZWF0ZSIsImdldEhpZGRlbkhpZ2hsaWdodENvdW50IiwiZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQiLCJOb3RpZmljYXRpb25Db3VudFR5cGUiLCJIaWdobGlnaHQiLCJtZXNzYWdlUGFuZWxDbGFzc05hbWVzIiwiY2xhc3NOYW1lcyIsIm14X0lSQ0xheW91dCIsIkxheW91dCIsIklSQyIsImlzTG9jYWxSb29tIiwicmVuZGVyTG9jYWxSb29tQ3JlYXRlTG9hZGVyIiwiZ2V0RGVmYXVsdFJvb21OYW1lIiwicmVuZGVyTG9jYWxSb29tVmlldyIsInJlbmRlciIsIkxvY2FsUm9vbSIsIkNSRUFUSU5HIiwibG9hZGluZyIsInByZXZpZXdMb2FkaW5nIiwib29iRGF0YSIsImludml0ZXJOYW1lIiwiaW52aXRlZEVtYWlsIiwidG9FbWFpbCIsIm9uSm9pbkJ1dHRvbkNsaWNrZWQiLCJvbkZvcmdldENsaWNrIiwib25SZWplY3RUaHJlZXBpZEludml0ZUJ1dHRvbkNsaWNrZWQiLCJteU1lbWJlcnNoaXAiLCJvblJlamVjdEJ1dHRvbkNsaWNrZWQiLCJpc1NwYWNlUm9vbSIsIm15VXNlcklkIiwic2VuZGVyIiwib25SZWplY3RBbmRJZ25vcmVDbGljayIsImFjdGl2ZUNhbGwiLCJzY3JvbGxoZWFkZXJDbGFzc2VzIiwibXhfUm9vbVZpZXdfc2Nyb2xsaGVhZGVyIiwiaXNTdGF0dXNBcmVhRXhwYW5kZWQiLCJvbkludml0ZUNsaWNrIiwib25TdGF0dXNCYXJWaXNpYmxlIiwib25TdGF0dXNCYXJIaWRkZW4iLCJzdGF0dXNCYXJBcmVhQ2xhc3MiLCJzdGF0dXNCYXJBcmVhIiwicm9vbVZlcnNpb25SZWNvbW1lbmRhdGlvbiIsInNob3dSb29tVXBncmFkZUJhciIsInVzZXJNYXlVcGdyYWRlUm9vbSIsImhpZGRlbkhpZ2hsaWdodENvdW50IiwiYXV4IiwicHJldmlld0JhciIsIm9uU2VhcmNoIiwib25IaWRkZW5IaWdobGlnaHRzQ2xpY2siLCJjb3VudCIsImZvcmNlVGltZWxpbmUiLCJqdXN0Q3JlYXRlZE9wdHMiLCJhdXhQYW5lbCIsIm1lc3NhZ2VDb21wb3NlciIsInNlYXJjaEluZm8iLCJzaG93Q29tcG9zZXIiLCJzZWFyY2hDb3VudCIsImhpZGVNZXNzYWdlUGFuZWwiLCJvblNlYXJjaFJlc3VsdHNGaWxsUmVxdWVzdCIsImhpZ2hsaWdodGVkRXZlbnRJZCIsImdhdGhlclRpbWVsaW5lUGFuZWxSZWYiLCJvbk1lc3NhZ2VMaXN0U2Nyb2xsIiwicmVzZXRKdW1wVG9FdmVudCIsInRvcFVucmVhZE1lc3NhZ2VzQmFyIiwianVtcFRvQm90dG9tIiwicmlnaHRQYW5lbCIsInRpbWVsaW5lQ2xhc3NlcyIsIm14X1Jvb21WaWV3X3RpbWVsaW5lX3JyX2VuYWJsZWQiLCJtYWluQ2xhc3NlcyIsIm14X1Jvb21WaWV3X2luQ2FsbCIsIkJvb2xlYW4iLCJteF9Sb29tVmlld19pbW1lcnNpdmUiLCJzaG93Q2hhdEVmZmVjdHMiLCJtYWluU3BsaXRCb2R5IiwibWFpblNwbGl0Q29udGVudENsYXNzTmFtZSIsInJvb21WaWV3Qm9keSIsIm9uTWVhc3VyZW1lbnQiLCJtYWluU3BsaXRDb250ZW50Q2xhc3NlcyIsImV4Y2x1ZGVkUmlnaHRQYW5lbFBoYXNlQnV0dG9ucyIsIm9uQ2FsbFBsYWNlZCIsIm9uQXBwc0NsaWNrIiwiVGhyZWFkUGFuZWwiLCJQaW5uZWRNZXNzYWdlcyIsIk5vdGlmaWNhdGlvblBhbmVsIiwiY2FuSW52aXRlIiwib25SZWFjdEtleURvd24iLCJvZmZzZXRXaWR0aCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJSb29tVmlld1dpdGhNYXRyaXhDbGllbnQiLCJ3aXRoTWF0cml4Q2xpZW50SE9DIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9Sb29tVmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8vIFRPRE86IFRoaXMgY29tcG9uZW50IGlzIGVub3Jtb3VzISBUaGVyZSdzIHNldmVyYWwgdGhpbmdzIHdoaWNoIGNvdWxkIHN0YW5kLWFsb25lOlxuLy8gIC0gU2VhcmNoIHJlc3VsdHMgY29tcG9uZW50XG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlLCBSZWZPYmplY3QsIHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IElSZWNvbW1lbmRlZFZlcnNpb24sIE5vdGlmaWNhdGlvbkNvdW50VHlwZSwgUm9vbSwgUm9vbUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBJVGhyZWFkQnVuZGxlZFJlbGF0aW9uc2hpcCwgTWF0cml4RXZlbnQsIE1hdHJpeEV2ZW50RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBFdmVudFN1YnNjcmlwdGlvbiB9IGZyb20gXCJmYmVtaXR0ZXJcIjtcbmltcG9ydCB7IElTZWFyY2hSZXN1bHRzIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3NlYXJjaCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBFdmVudFRpbWVsaW5lIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50LXRpbWVsaW5lJztcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudCc7XG5pbXBvcnQgeyBSb29tU3RhdGUsIFJvb21TdGF0ZUV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tc3RhdGUnO1xuaW1wb3J0IHsgRXZlbnRUaW1lbGluZVNldCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQtdGltZWxpbmUtc2V0XCI7XG5pbXBvcnQgeyBDYWxsU3RhdGUsIENhbGxUeXBlLCBNYXRyaXhDYWxsIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsXCI7XG5pbXBvcnQgeyB0aHJvdHRsZSB9IGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IE1hdHJpeEVycm9yIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvaHR0cC1hcGknO1xuaW1wb3J0IHsgQ2xpZW50RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBDcnlwdG9FdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG9cIjtcbmltcG9ydCB7IFRIUkVBRF9SRUxBVElPTl9UWVBFIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3RocmVhZCc7XG5pbXBvcnQgeyBIaXN0b3J5VmlzaWJpbGl0eSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFscyc7XG5cbmltcG9ydCBzaG91bGRIaWRlRXZlbnQgZnJvbSAnLi4vLi4vc2hvdWxkSGlkZUV2ZW50JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzJztcbmltcG9ydCBSZXNpemVOb3RpZmllciBmcm9tICcuLi8uLi91dGlscy9SZXNpemVOb3RpZmllcic7XG5pbXBvcnQgQ29udGVudE1lc3NhZ2VzIGZyb20gJy4uLy4uL0NvbnRlbnRNZXNzYWdlcyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vTW9kYWwnO1xuaW1wb3J0IExlZ2FjeUNhbGxIYW5kbGVyLCB7IExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQgfSBmcm9tICcuLi8uLi9MZWdhY3lDYWxsSGFuZGxlcic7XG5pbXBvcnQgZGlzLCB7IGRlZmF1bHREaXNwYXRjaGVyIH0gZnJvbSAnLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCAqIGFzIFJvb21zIGZyb20gJy4uLy4uL1Jvb21zJztcbmltcG9ydCBldmVudFNlYXJjaCwgeyBzZWFyY2hQYWdpbmF0aW9uIH0gZnJvbSAnLi4vLi4vU2VhcmNoaW5nJztcbmltcG9ydCBNYWluU3BsaXQgZnJvbSAnLi9NYWluU3BsaXQnO1xuaW1wb3J0IFJpZ2h0UGFuZWwgZnJvbSAnLi9SaWdodFBhbmVsJztcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tICcuLi8uLi9zdG9yZXMvUm9vbVZpZXdTdG9yZSc7XG5pbXBvcnQgUm9vbVNjcm9sbFN0YXRlU3RvcmUsIHsgU2Nyb2xsU3RhdGUgfSBmcm9tICcuLi8uLi9zdG9yZXMvUm9vbVNjcm9sbFN0YXRlU3RvcmUnO1xuaW1wb3J0IFdpZGdldEVjaG9TdG9yZSBmcm9tICcuLi8uLi9zdG9yZXMvV2lkZ2V0RWNob1N0b3JlJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBMYXlvdXQgfSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvZW51bXMvTGF5b3V0XCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFJpZ2h0UGFuZWxTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVwiO1xuaW1wb3J0IFJvb21Db250ZXh0LCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gXCIuLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQsIHsgTWF0cml4Q2xpZW50UHJvcHMsIHdpdGhNYXRyaXhDbGllbnRIT0MgfSBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHsgRTJFU3RhdHVzLCBzaGllbGRTdGF0dXNGb3JSb29tIH0gZnJvbSAnLi4vLi4vdXRpbHMvU2hpZWxkVXRpbHMnO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgSU1hdHJpeENsaWVudENyZWRzIH0gZnJvbSBcIi4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFNjcm9sbFBhbmVsIGZyb20gXCIuL1Njcm9sbFBhbmVsXCI7XG5pbXBvcnQgVGltZWxpbmVQYW5lbCBmcm9tIFwiLi9UaW1lbGluZVBhbmVsXCI7XG5pbXBvcnQgRXJyb3JCb3VuZGFyeSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvRXJyb3JCb3VuZGFyeVwiO1xuaW1wb3J0IFJvb21QcmV2aWV3QmFyIGZyb20gXCIuLi92aWV3cy9yb29tcy9Sb29tUHJldmlld0JhclwiO1xuaW1wb3J0IFJvb21QcmV2aWV3Q2FyZCBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUm9vbVByZXZpZXdDYXJkXCI7XG5pbXBvcnQgU2VhcmNoQmFyLCB7IFNlYXJjaFNjb3BlIH0gZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1NlYXJjaEJhclwiO1xuaW1wb3J0IFJvb21VcGdyYWRlV2FybmluZ0JhciBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUm9vbVVwZ3JhZGVXYXJuaW5nQmFyXCI7XG5pbXBvcnQgQXV4UGFuZWwgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL0F1eFBhbmVsXCI7XG5pbXBvcnQgUm9vbUhlYWRlciBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUm9vbUhlYWRlclwiO1xuaW1wb3J0IHsgWE9SIH0gZnJvbSBcIi4uLy4uL0B0eXBlcy9jb21tb25cIjtcbmltcG9ydCB7IElPT0JEYXRhLCBJVGhyZWVwaWRJbnZpdGUgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL1RocmVlcGlkSW52aXRlU3RvcmVcIjtcbmltcG9ydCBFZmZlY3RzT3ZlcmxheSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvRWZmZWN0c092ZXJsYXlcIjtcbmltcG9ydCB7IGNvbnRhaW5zRW1vamkgfSBmcm9tICcuLi8uLi9lZmZlY3RzL3V0aWxzJztcbmltcG9ydCB7IENIQVRfRUZGRUNUUyB9IGZyb20gJy4uLy4uL2VmZmVjdHMnO1xuaW1wb3J0IFdpZGdldFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvV2lkZ2V0U3RvcmVcIjtcbmltcG9ydCB7IFZpZGVvUm9vbVZpZXcgfSBmcm9tIFwiLi9WaWRlb1Jvb21WaWV3XCI7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcbmltcG9ydCBOb3RpZmllciBmcm9tIFwiLi4vLi4vTm90aWZpZXJcIjtcbmltcG9ydCB7IHNob3dUb2FzdCBhcyBzaG93Tm90aWZpY2F0aW9uc1RvYXN0IH0gZnJvbSBcIi4uLy4uL3RvYXN0cy9EZXNrdG9wTm90aWZpY2F0aW9uc1RvYXN0XCI7XG5pbXBvcnQgeyBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZVwiO1xuaW1wb3J0IHsgQ29udGFpbmVyLCBXaWRnZXRMYXlvdXRTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRMYXlvdXRTdG9yZVwiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyJztcbmltcG9ydCB7IG9iamVjdEhhc0RpZmYgfSBmcm9tIFwiLi4vLi4vdXRpbHMvb2JqZWN0c1wiO1xuaW1wb3J0IFNwYWNlUm9vbVZpZXcgZnJvbSBcIi4vU3BhY2VSb29tVmlld1wiO1xuaW1wb3J0IHsgSU9wdHMgfSBmcm9tIFwiLi4vLi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IEVkaXRvclN0YXRlVHJhbnNmZXIgZnJvbSBcIi4uLy4uL3V0aWxzL0VkaXRvclN0YXRlVHJhbnNmZXJcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tICcuLi92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nJztcbmltcG9ydCBTZWFyY2hSZXN1bHRUaWxlIGZyb20gJy4uL3ZpZXdzL3Jvb21zL1NlYXJjaFJlc3VsdFRpbGUnO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCBVcGxvYWRCYXIgZnJvbSAnLi9VcGxvYWRCYXInO1xuaW1wb3J0IFJvb21TdGF0dXNCYXIgZnJvbSBcIi4vUm9vbVN0YXR1c0JhclwiO1xuaW1wb3J0IE1lc3NhZ2VDb21wb3NlciBmcm9tICcuLi92aWV3cy9yb29tcy9NZXNzYWdlQ29tcG9zZXInO1xuaW1wb3J0IEp1bXBUb0JvdHRvbUJ1dHRvbiBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvSnVtcFRvQm90dG9tQnV0dG9uXCI7XG5pbXBvcnQgVG9wVW5yZWFkTWVzc2FnZXNCYXIgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1RvcFVucmVhZE1lc3NhZ2VzQmFyXCI7XG5pbXBvcnQgeyBmZXRjaEluaXRpYWxFdmVudCB9IGZyb20gXCIuLi8uLi91dGlscy9FdmVudFV0aWxzXCI7XG5pbXBvcnQgeyBDb21wb3Nlckluc2VydFBheWxvYWQsIENvbXBvc2VyVHlwZSB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL0NvbXBvc2VySW5zZXJ0UGF5bG9hZFwiO1xuaW1wb3J0IEFwcHNEcmF3ZXIgZnJvbSAnLi4vdmlld3Mvcm9vbXMvQXBwc0RyYXdlcic7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSAnLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVBoYXNlcyc7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyBKb2luUm9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Kb2luUm9vbVBheWxvYWRcIjtcbmltcG9ydCB7IERvQWZ0ZXJTeW5jUHJlcGFyZWRQYXlsb2FkIH0gZnJvbSAnLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Eb0FmdGVyU3luY1ByZXBhcmVkUGF5bG9hZCc7XG5pbXBvcnQgRmlsZURyb3BUYXJnZXQgZnJvbSAnLi9GaWxlRHJvcFRhcmdldCc7XG5pbXBvcnQgTWVhc3VyZWQgZnJvbSAnLi4vdmlld3MvZWxlbWVudHMvTWVhc3VyZWQnO1xuaW1wb3J0IHsgRm9jdXNDb21wb3NlclBheWxvYWQgfSBmcm9tICcuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL0ZvY3VzQ29tcG9zZXJQYXlsb2FkJztcbmltcG9ydCB7IGhhdmVSZW5kZXJlckZvckV2ZW50IH0gZnJvbSBcIi4uLy4uL2V2ZW50cy9FdmVudFRpbGVGYWN0b3J5XCI7XG5pbXBvcnQgeyBMb2NhbFJvb20sIExvY2FsUm9vbVN0YXRlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL0xvY2FsUm9vbSc7XG5pbXBvcnQgeyBjcmVhdGVSb29tRnJvbUxvY2FsUm9vbSB9IGZyb20gJy4uLy4uL3V0aWxzL2RpcmVjdC1tZXNzYWdlcyc7XG5pbXBvcnQgTmV3Um9vbUludHJvIGZyb20gJy4uL3ZpZXdzL3Jvb21zL05ld1Jvb21JbnRybyc7XG5pbXBvcnQgRW5jcnlwdGlvbkV2ZW50IGZyb20gJy4uL3ZpZXdzL21lc3NhZ2VzL0VuY3J5cHRpb25FdmVudCc7XG5pbXBvcnQgeyBTdGF0aWNOb3RpZmljYXRpb25TdGF0ZSB9IGZyb20gJy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1N0YXRpY05vdGlmaWNhdGlvblN0YXRlJztcbmltcG9ydCB7IGlzTG9jYWxSb29tIH0gZnJvbSAnLi4vLi4vdXRpbHMvbG9jYWxSb29tL2lzTG9jYWxSb29tJztcbmltcG9ydCB7IFNob3dUaHJlYWRQYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvU2hvd1RocmVhZFBheWxvYWRcIjtcbmltcG9ydCB7IFJvb21TdGF0dXNCYXJVbnNlbnRNZXNzYWdlcyB9IGZyb20gJy4vUm9vbVN0YXR1c0JhclVuc2VudE1lc3NhZ2VzJztcbmltcG9ydCB7IExhcmdlTG9hZGVyIH0gZnJvbSAnLi9MYXJnZUxvYWRlcic7XG5cbmNvbnN0IERFQlVHID0gZmFsc2U7XG5sZXQgZGVidWdsb2cgPSBmdW5jdGlvbihtc2c6IHN0cmluZykge307XG5cbmNvbnN0IEJST1dTRVJfU1VQUE9SVFNfU0FOREJPWCA9ICdzYW5kYm94JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblxuaWYgKERFQlVHKSB7XG4gICAgLy8gdXNpbmcgYmluZCBtZWFucyB0aGF0IHdlIGdldCB0byBrZWVwIHVzZWZ1bCBsaW5lIG51bWJlcnMgaW4gdGhlIGNvbnNvbGVcbiAgICBkZWJ1Z2xvZyA9IGxvZ2dlci5sb2cuYmluZChjb25zb2xlKTtcbn1cblxuaW50ZXJmYWNlIElSb29tUHJvcHMgZXh0ZW5kcyBNYXRyaXhDbGllbnRQcm9wcyB7XG4gICAgdGhyZWVwaWRJbnZpdGU6IElUaHJlZXBpZEludml0ZTtcbiAgICBvb2JEYXRhPzogSU9PQkRhdGE7XG5cbiAgICByZXNpemVOb3RpZmllcjogUmVzaXplTm90aWZpZXI7XG4gICAganVzdENyZWF0ZWRPcHRzPzogSU9wdHM7XG5cbiAgICBmb3JjZVRpbWVsaW5lPzogYm9vbGVhbjsgLy8gc2hvdWxkIHdlIGZvcmNlIGFjY2VzcyB0byB0aGUgdGltZWxpbmUsIG92ZXJyaWRpbmcgKGZvciBlZykgc3BhY2VzXG5cbiAgICAvLyBDYWxsZWQgd2l0aCB0aGUgY3JlZGVudGlhbHMgb2YgYSByZWdpc3RlcmVkIHVzZXIgKGlmIHRoZXkgd2VyZSBhIFJPVSB0aGF0IHRyYW5zaXRpb25lZCB0byBQV0xVKVxuICAgIG9uUmVnaXN0ZXJlZD8oY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcyk6IHZvaWQ7XG59XG5cbi8vIFRoaXMgZGVmaW5lcyB0aGUgY29udGVudCBvZiB0aGUgbWFpblNwbGl0LlxuLy8gSWYgdGhlIG1haW5TcGxpdCBkb2VzIG5vdCBjb250YWluIHRoZSBUaW1lbGluZSwgdGhlIGNoYXQgaXMgc2hvd24gaW4gdGhlIHJpZ2h0IHBhbmVsLlxuZW51bSBNYWluU3BsaXRDb250ZW50VHlwZSB7XG4gICAgVGltZWxpbmUsXG4gICAgTWF4aW1pc2VkV2lkZ2V0LFxuICAgIFZpZGVvLCAvLyBpbW1lcnNpdmUgdm9pcFxufVxuZXhwb3J0IGludGVyZmFjZSBJUm9vbVN0YXRlIHtcbiAgICByb29tPzogUm9vbTtcbiAgICByb29tSWQ/OiBzdHJpbmc7XG4gICAgcm9vbUFsaWFzPzogc3RyaW5nO1xuICAgIHJvb21Mb2FkaW5nOiBib29sZWFuO1xuICAgIHBlZWtMb2FkaW5nOiBib29sZWFuO1xuICAgIHNob3VsZFBlZWs6IGJvb2xlYW47XG4gICAgLy8gdXNlZCB0byB0cmlnZ2VyIGEgcmVyZW5kZXIgaW4gVGltZWxpbmVQYW5lbCBvbmNlIHRoZSBtZW1iZXJzIGFyZSBsb2FkZWQsXG4gICAgLy8gc28gUlIgYXJlIHJlbmRlcmVkIGFnYWluIChub3cgd2l0aCB0aGUgbWVtYmVycyBhdmFpbGFibGUpLCAuLi5cbiAgICBtZW1iZXJzTG9hZGVkOiBib29sZWFuO1xuICAgIC8vIFRoZSBldmVudCB0byBiZSBzY3JvbGxlZCB0byBpbml0aWFsbHlcbiAgICBpbml0aWFsRXZlbnRJZD86IHN0cmluZztcbiAgICAvLyBUaGUgb2Zmc2V0IGluIHBpeGVscyBmcm9tIHRoZSBldmVudCB3aXRoIHdoaWNoIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5XG4gICAgaW5pdGlhbEV2ZW50UGl4ZWxPZmZzZXQ/OiBudW1iZXI7XG4gICAgLy8gV2hldGhlciB0byBoaWdobGlnaHQgdGhlIGV2ZW50IHNjcm9sbGVkIHRvXG4gICAgaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZD86IGJvb2xlYW47XG4gICAgLy8gV2hldGhlciB0byBzY3JvbGwgdGhlIGV2ZW50IGludG8gdmlld1xuICAgIGluaXRpYWxFdmVudFNjcm9sbEludG9WaWV3PzogYm9vbGVhbjtcbiAgICByZXBseVRvRXZlbnQ/OiBNYXRyaXhFdmVudDtcbiAgICBudW1VbnJlYWRNZXNzYWdlczogbnVtYmVyO1xuICAgIHNlYXJjaFRlcm0/OiBzdHJpbmc7XG4gICAgc2VhcmNoU2NvcGU/OiBTZWFyY2hTY29wZTtcbiAgICBzZWFyY2hSZXN1bHRzPzogWE9SPHt9LCBJU2VhcmNoUmVzdWx0cz47XG4gICAgc2VhcmNoSGlnaGxpZ2h0cz86IHN0cmluZ1tdO1xuICAgIHNlYXJjaEluUHJvZ3Jlc3M/OiBib29sZWFuO1xuICAgIGNhbGxTdGF0ZT86IENhbGxTdGF0ZTtcbiAgICBjYW5QZWVrOiBib29sZWFuO1xuICAgIGNhblNlbGZSZWRhY3Q6IGJvb2xlYW47XG4gICAgc2hvd0FwcHM6IGJvb2xlYW47XG4gICAgaXNQZWVraW5nOiBib29sZWFuO1xuICAgIHNob3dSaWdodFBhbmVsOiBib29sZWFuO1xuICAgIC8vIGVycm9yIG9iamVjdCwgYXMgZnJvbSB0aGUgbWF0cml4IGNsaWVudC9zZXJ2ZXIgQVBJXG4gICAgLy8gSWYgd2UgZmFpbGVkIHRvIGxvYWQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJvb20sXG4gICAgLy8gc3RvcmUgdGhlIGVycm9yIGhlcmUuXG4gICAgcm9vbUxvYWRFcnJvcj86IE1hdHJpeEVycm9yO1xuICAgIC8vIEhhdmUgd2Ugc2VudCBhIHJlcXVlc3QgdG8gam9pbiB0aGUgcm9vbSB0aGF0IHdlJ3JlIHdhaXRpbmcgdG8gY29tcGxldGU/XG4gICAgam9pbmluZzogYm9vbGVhbjtcbiAgICAvLyB0aGlzIGlzIHRydWUgaWYgd2UgYXJlIGZ1bGx5IHNjcm9sbGVkLWRvd24sIGFuZCBhcmUgbG9va2luZyBhdFxuICAgIC8vIHRoZSBlbmQgb2YgdGhlIGxpdmUgdGltZWxpbmUuIEl0IGhhcyB0aGUgZWZmZWN0IG9mIGhpZGluZyB0aGVcbiAgICAvLyAnc2Nyb2xsIHRvIGJvdHRvbScga25vYiwgYW1vbmcgYSBjb3VwbGUgb2Ygb3RoZXIgdGhpbmdzLlxuICAgIGF0RW5kT2ZMaXZlVGltZWxpbmU/OiBib29sZWFuO1xuICAgIHNob3dUb3BVbnJlYWRNZXNzYWdlc0JhcjogYm9vbGVhbjtcbiAgICBzdGF0dXNCYXJWaXNpYmxlOiBib29sZWFuO1xuICAgIC8vIFdlIGxvYWQgdGhpcyBsYXRlciBieSBhc2tpbmcgdGhlIGpzLXNkayB0byBzdWdnZXN0IGEgdmVyc2lvbiBmb3IgdXMuXG4gICAgLy8gVGhpcyBvYmplY3QgaXMgdGhlIHJlc3VsdCBvZiBSb29tI2dldFJlY29tbWVuZGVkVmVyc2lvbigpXG5cbiAgICB1cGdyYWRlUmVjb21tZW5kYXRpb24/OiBJUmVjb21tZW5kZWRWZXJzaW9uO1xuICAgIGNhblJlYWN0OiBib29sZWFuO1xuICAgIGNhblNlbmRNZXNzYWdlczogYm9vbGVhbjtcbiAgICB0b21ic3RvbmU/OiBNYXRyaXhFdmVudDtcbiAgICByZXNpemluZzogYm9vbGVhbjtcbiAgICBsYXlvdXQ6IExheW91dDtcbiAgICBsb3dCYW5kd2lkdGg6IGJvb2xlYW47XG4gICAgYWx3YXlzU2hvd1RpbWVzdGFtcHM6IGJvb2xlYW47XG4gICAgc2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzOiBib29sZWFuO1xuICAgIHJlYWRNYXJrZXJJblZpZXdUaHJlc2hvbGRNczogbnVtYmVyO1xuICAgIHJlYWRNYXJrZXJPdXRPZlZpZXdUaHJlc2hvbGRNczogbnVtYmVyO1xuICAgIHNob3dIaWRkZW5FdmVudHM6IGJvb2xlYW47XG4gICAgc2hvd1JlYWRSZWNlaXB0czogYm9vbGVhbjtcbiAgICBzaG93UmVkYWN0aW9uczogYm9vbGVhbjtcbiAgICBzaG93Sm9pbkxlYXZlczogYm9vbGVhbjtcbiAgICBzaG93QXZhdGFyQ2hhbmdlczogYm9vbGVhbjtcbiAgICBzaG93RGlzcGxheW5hbWVDaGFuZ2VzOiBib29sZWFuO1xuICAgIG1hdHJpeENsaWVudElzUmVhZHk6IGJvb2xlYW47XG4gICAgc2hvd1VybFByZXZpZXc/OiBib29sZWFuO1xuICAgIGUyZVN0YXR1cz86IEUyRVN0YXR1cztcbiAgICByZWplY3Rpbmc/OiBib29sZWFuO1xuICAgIHJlamVjdEVycm9yPzogRXJyb3I7XG4gICAgaGFzUGlubmVkV2lkZ2V0cz86IGJvb2xlYW47XG4gICAgbWFpblNwbGl0Q29udGVudFR5cGU/OiBNYWluU3BsaXRDb250ZW50VHlwZTtcbiAgICAvLyB3aGV0aGVyIG9yIG5vdCBhIHNwYWNlcyBjb250ZXh0IHN3aXRjaCBicm91Z2h0IHVzIGhlcmUsXG4gICAgLy8gaWYgaXQgZGlkIHdlIGRvbid0IHdhbnQgdGhlIHJvb20gdG8gYmUgbWFya2VkIGFzIHJlYWQgYXMgc29vbiBhcyBpdCBpcyBsb2FkZWQuXG4gICAgd2FzQ29udGV4dFN3aXRjaD86IGJvb2xlYW47XG4gICAgZWRpdFN0YXRlPzogRWRpdG9yU3RhdGVUcmFuc2ZlcjtcbiAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZTtcbiAgICB0aHJlYWRJZD86IHN0cmluZztcbiAgICBsaXZlVGltZWxpbmU/OiBFdmVudFRpbWVsaW5lO1xuICAgIG5hcnJvdzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIExvY2FsUm9vbVZpZXdQcm9wcyB7XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIHBlcm1hbGlua0NyZWF0b3I6IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuICAgIHJvb21WaWV3OiBSZWZPYmplY3Q8SFRNTEVsZW1lbnQ+O1xuICAgIG9uRmlsZURyb3A6IChkYXRhVHJhbnNmZXI6IERhdGFUcmFuc2ZlcikgPT4gUHJvbWlzZTx2b2lkPjtcbn1cblxuLyoqXG4gKiBMb2NhbCByb29tIHZpZXcuIFVzZXMgb25seSB0aGUgYml0cyBuZWNlc3NhcnkgdG8gZGlzcGxheSBhIGxvY2FsIHJvb20gdmlldyBsaWtlIHJvb20gaGVhZGVyIG9yIGNvbXBvc2VyLlxuICpcbiAqIEBwYXJhbSB7TG9jYWxSb29tVmlld1Byb3BzfSBwcm9wcyBSb29tIHZpZXcgcHJvcHNcbiAqIEByZXR1cm5zIHtSZWFjdEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIExvY2FsUm9vbVZpZXcocHJvcHM6IExvY2FsUm9vbVZpZXdQcm9wcyk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoUm9vbUNvbnRleHQpO1xuICAgIGNvbnN0IHJvb20gPSBjb250ZXh0LnJvb20gYXMgTG9jYWxSb29tO1xuICAgIGNvbnN0IGVuY3J5cHRpb25FdmVudCA9IGNvbnRleHQucm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uKVswXTtcbiAgICBsZXQgZW5jcnlwdGlvblRpbGU6IFJlYWN0Tm9kZTtcblxuICAgIGlmIChlbmNyeXB0aW9uRXZlbnQpIHtcbiAgICAgICAgZW5jcnlwdGlvblRpbGUgPSA8RW5jcnlwdGlvbkV2ZW50IG14RXZlbnQ9e2VuY3J5cHRpb25FdmVudH0gLz47XG4gICAgfVxuXG4gICAgY29uc3Qgb25SZXRyeUNsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIHJvb20uc3RhdGUgPSBMb2NhbFJvb21TdGF0ZS5ORVc7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJsb2NhbF9yb29tX2V2ZW50XCIsXG4gICAgICAgICAgICByb29tSWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgbGV0IHN0YXR1c0JhcjogUmVhY3RFbGVtZW50O1xuICAgIGxldCBjb21wb3NlcjogUmVhY3RFbGVtZW50O1xuXG4gICAgaWYgKHJvb20uaXNFcnJvcikge1xuICAgICAgICBjb25zdCBidXR0b25zID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25SZXRyeUNsaWNrZWR9IGNsYXNzTmFtZT1cIm14X1Jvb21TdGF0dXNCYXJfdW5zZW50UmV0cnlcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiUmV0cnlcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuXG4gICAgICAgIHN0YXR1c0JhciA9IDxSb29tU3RhdHVzQmFyVW5zZW50TWVzc2FnZXNcbiAgICAgICAgICAgIHRpdGxlPXtfdChcIlNvbWUgb2YgeW91ciBtZXNzYWdlcyBoYXZlIG5vdCBiZWVuIHNlbnRcIil9XG4gICAgICAgICAgICBub3RpZmljYXRpb25TdGF0ZT17U3RhdGljTm90aWZpY2F0aW9uU3RhdGUuUkVEX0VYQ0xBTUFUSU9OfVxuICAgICAgICAgICAgYnV0dG9ucz17YnV0dG9uc31cbiAgICAgICAgLz47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29tcG9zZXIgPSA8TWVzc2FnZUNvbXBvc2VyXG4gICAgICAgICAgICByb29tPXtjb250ZXh0LnJvb219XG4gICAgICAgICAgICByZXNpemVOb3RpZmllcj17cHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXtwcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3IG14X1Jvb21WaWV3LS1sb2NhbFwiPlxuICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgPFJvb21IZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgcm9vbT17Y29udGV4dC5yb29tfVxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hJbmZvPXtudWxsfVxuICAgICAgICAgICAgICAgICAgICBpblJvb209e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VhcmNoQ2xpY2s9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIG9uSW52aXRlQ2xpY2s9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIG9uRm9yZ2V0Q2xpY2s9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIGUyZVN0YXR1cz17RTJFU3RhdHVzLk5vcm1hbH1cbiAgICAgICAgICAgICAgICAgICAgb25BcHBzQ2xpY2s9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIGFwcHNTaG93bj17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2FsbFBsYWNlZD17bnVsbH1cbiAgICAgICAgICAgICAgICAgICAgZXhjbHVkZWRSaWdodFBhbmVsUGhhc2VCdXR0b25zPXtbXX1cbiAgICAgICAgICAgICAgICAgICAgc2hvd0J1dHRvbnM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBlbmFibGVSb29tT3B0aW9uc01lbnU9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPG1haW4gY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfYm9keVwiIHJlZj17cHJvcHMucm9vbVZpZXd9PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZURyb3BUYXJnZXQgcGFyZW50PXtwcm9wcy5yb29tVmlldy5jdXJyZW50fSBvbkZpbGVEcm9wPXtwcm9wcy5vbkZpbGVEcm9wfSAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X3RpbWVsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2Nyb2xsUGFuZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVmlld19tZXNzYWdlUGFuZWxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXtwcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGVuY3J5cHRpb25UaWxlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TmV3Um9vbUludHJvIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1Njcm9sbFBhbmVsPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBzdGF0dXNCYXIgfVxuICAgICAgICAgICAgICAgICAgICB7IGNvbXBvc2VyIH1cbiAgICAgICAgICAgICAgICA8L21haW4+XG4gICAgICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG5cbmludGVyZmFjZSBJTG9jYWxSb29tQ3JlYXRlTG9hZGVyUHJvcHMge1xuICAgIG5hbWVzOiBzdHJpbmc7XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xufVxuXG4vKipcbiAqIFJvb20gY3JlYXRlIGxvYWRlciB2aWV3IGRpc3BsYXlpbmcgYSBtZXNzYWdlIGFuZCBhIHNwaW5uZXIuXG4gKlxuICogQHBhcmFtIHtJTG9jYWxSb29tQ3JlYXRlTG9hZGVyUHJvcHN9IHByb3BzIFJvb20gdmlldyBwcm9wc1xuICogQHJldHVybiB7UmVhY3RFbGVtZW50fVxuICovXG5mdW5jdGlvbiBMb2NhbFJvb21DcmVhdGVMb2FkZXIocHJvcHM6IElMb2NhbFJvb21DcmVhdGVMb2FkZXJQcm9wcyk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoUm9vbUNvbnRleHQpO1xuICAgIGNvbnN0IHRleHQgPSBfdChcIldlJ3JlIGNyZWF0aW5nIGEgcm9vbSB3aXRoICUobmFtZXMpc1wiLCB7IG5hbWVzOiBwcm9wcy5uYW1lcyB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3IG14X1Jvb21WaWV3LS1sb2NhbFwiPlxuICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgPFJvb21IZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgcm9vbT17Y29udGV4dC5yb29tfVxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hJbmZvPXtudWxsfVxuICAgICAgICAgICAgICAgICAgICBpblJvb209e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VhcmNoQ2xpY2s9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIG9uSW52aXRlQ2xpY2s9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIG9uRm9yZ2V0Q2xpY2s9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIGUyZVN0YXR1cz17RTJFU3RhdHVzLk5vcm1hbH1cbiAgICAgICAgICAgICAgICAgICAgb25BcHBzQ2xpY2s9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIGFwcHNTaG93bj17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2FsbFBsYWNlZD17bnVsbH1cbiAgICAgICAgICAgICAgICAgICAgZXhjbHVkZWRSaWdodFBhbmVsUGhhc2VCdXR0b25zPXtbXX1cbiAgICAgICAgICAgICAgICAgICAgc2hvd0J1dHRvbnM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBlbmFibGVSb29tT3B0aW9uc01lbnU9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld19ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxMYXJnZUxvYWRlciB0ZXh0PXt0ZXh0fSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuXG5leHBvcnQgY2xhc3MgUm9vbVZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVJvb21Qcm9wcywgSVJvb21TdGF0ZT4ge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcm9vbVN0b3JlVG9rZW46IEV2ZW50U3Vic2NyaXB0aW9uO1xuICAgIHByaXZhdGUgc2V0dGluZ1dhdGNoZXJzOiBzdHJpbmdbXTtcblxuICAgIHByaXZhdGUgdW5tb3VudGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBwZXJtYWxpbmtDcmVhdG9yczogUmVjb3JkPHN0cmluZywgUm9vbVBlcm1hbGlua0NyZWF0b3I+ID0ge307XG4gICAgcHJpdmF0ZSBzZWFyY2hJZDogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSByb29tVmlldyA9IGNyZWF0ZVJlZjxIVE1MRWxlbWVudD4oKTtcbiAgICBwcml2YXRlIHNlYXJjaFJlc3VsdHNQYW5lbCA9IGNyZWF0ZVJlZjxTY3JvbGxQYW5lbD4oKTtcbiAgICBwcml2YXRlIG1lc3NhZ2VQYW5lbDogVGltZWxpbmVQYW5lbDtcbiAgICBwcml2YXRlIHJvb21WaWV3Qm9keSA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG4gICAgcHVibGljIGNvbnRleHQhOiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgTWF0cml4Q2xpZW50Q29udGV4dD47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVJvb21Qcm9wcywgY29udGV4dDogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIE1hdHJpeENsaWVudENvbnRleHQ+KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICBjb25zdCBsbE1lbWJlcnMgPSBjb250ZXh0Lmhhc0xhenlMb2FkTWVtYmVyc0VuYWJsZWQoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHJvb21JZDogbnVsbCxcbiAgICAgICAgICAgIHJvb21Mb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgcGVla0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgc2hvdWxkUGVlazogdHJ1ZSxcbiAgICAgICAgICAgIG1lbWJlcnNMb2FkZWQ6ICFsbE1lbWJlcnMsXG4gICAgICAgICAgICBudW1VbnJlYWRNZXNzYWdlczogMCxcbiAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6IG51bGwsXG4gICAgICAgICAgICBjYWxsU3RhdGU6IG51bGwsXG4gICAgICAgICAgICBjYW5QZWVrOiBmYWxzZSxcbiAgICAgICAgICAgIGNhblNlbGZSZWRhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgc2hvd0FwcHM6IGZhbHNlLFxuICAgICAgICAgICAgaXNQZWVraW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dSaWdodFBhbmVsOiBmYWxzZSxcbiAgICAgICAgICAgIGpvaW5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgc2hvd1RvcFVucmVhZE1lc3NhZ2VzQmFyOiBmYWxzZSxcbiAgICAgICAgICAgIHN0YXR1c0JhclZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgY2FuUmVhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuU2VuZE1lc3NhZ2VzOiBmYWxzZSxcbiAgICAgICAgICAgIHJlc2l6aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGxheW91dDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxheW91dFwiKSxcbiAgICAgICAgICAgIGxvd0JhbmR3aWR0aDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxvd0JhbmR3aWR0aFwiKSxcbiAgICAgICAgICAgIGFsd2F5c1Nob3dUaW1lc3RhbXBzOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWx3YXlzU2hvd1RpbWVzdGFtcHNcIiksXG4gICAgICAgICAgICBzaG93VHdlbHZlSG91clRpbWVzdGFtcHM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHdlbHZlSG91clRpbWVzdGFtcHNcIiksXG4gICAgICAgICAgICByZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJyZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXNcIiksXG4gICAgICAgICAgICByZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJyZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXNcIiksXG4gICAgICAgICAgICBzaG93SGlkZGVuRXZlbnRzOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd0hpZGRlbkV2ZW50c0luVGltZWxpbmVcIiksXG4gICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd1JlZGFjdGlvbnM6IHRydWUsXG4gICAgICAgICAgICBzaG93Sm9pbkxlYXZlczogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dBdmF0YXJDaGFuZ2VzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0Rpc3BsYXluYW1lQ2hhbmdlczogdHJ1ZSxcbiAgICAgICAgICAgIG1hdHJpeENsaWVudElzUmVhZHk6IGNvbnRleHQ/LmlzSW5pdGlhbFN5bmNDb21wbGV0ZSgpLFxuICAgICAgICAgICAgbWFpblNwbGl0Q29udGVudFR5cGU6IE1haW5TcGxpdENvbnRlbnRUeXBlLlRpbWVsaW5lLFxuICAgICAgICAgICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlOiBUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbSxcbiAgICAgICAgICAgIGxpdmVUaW1lbGluZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmFycm93OiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIGNvbnRleHQub24oQ2xpZW50RXZlbnQuUm9vbSwgdGhpcy5vblJvb20pO1xuICAgICAgICBjb250ZXh0Lm9uKFJvb21FdmVudC5UaW1lbGluZSwgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgICAgIGNvbnRleHQub24oUm9vbUV2ZW50LlRpbWVsaW5lUmVzZXQsIHRoaXMub25Sb29tVGltZWxpbmVSZXNldCk7XG4gICAgICAgIGNvbnRleHQub24oUm9vbUV2ZW50Lk5hbWUsIHRoaXMub25Sb29tTmFtZSk7XG4gICAgICAgIGNvbnRleHQub24oUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgY29udGV4dC5vbihSb29tU3RhdGVFdmVudC5VcGRhdGUsIHRoaXMub25Sb29tU3RhdGVVcGRhdGUpO1xuICAgICAgICBjb250ZXh0Lm9uKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgICAgICBjb250ZXh0Lm9uKENyeXB0b0V2ZW50LktleUJhY2t1cFN0YXR1cywgdGhpcy5vbktleUJhY2t1cFN0YXR1cyk7XG4gICAgICAgIGNvbnRleHQub24oQ3J5cHRvRXZlbnQuRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCwgdGhpcy5vbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQpO1xuICAgICAgICBjb250ZXh0Lm9uKENyeXB0b0V2ZW50LlVzZXJUcnVzdFN0YXR1c0NoYW5nZWQsIHRoaXMub25Vc2VyVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgIGNvbnRleHQub24oQ3J5cHRvRXZlbnQuS2V5c0NoYW5nZWQsIHRoaXMub25Dcm9zc1NpZ25pbmdLZXlzQ2hhbmdlZCk7XG4gICAgICAgIGNvbnRleHQub24oTWF0cml4RXZlbnRFdmVudC5EZWNyeXB0ZWQsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgIC8vIFN0YXJ0IGxpc3RlbmluZyBmb3IgUm9vbVZpZXdTdG9yZSB1cGRhdGVzXG4gICAgICAgIHRoaXMucm9vbVN0b3JlVG9rZW4gPSBSb29tVmlld1N0b3JlLmluc3RhbmNlLmFkZExpc3RlbmVyKHRoaXMub25Sb29tVmlld1N0b3JlVXBkYXRlKTtcblxuICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uUmlnaHRQYW5lbFN0b3JlVXBkYXRlKTtcblxuICAgICAgICBXaWRnZXRFY2hvU3RvcmUub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uV2lkZ2V0RWNob1N0b3JlVXBkYXRlKTtcbiAgICAgICAgV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uV2lkZ2V0U3RvcmVVcGRhdGUpO1xuXG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub24oXCJpc1Jlc2l6aW5nXCIsIHRoaXMub25Jc1Jlc2l6aW5nKTtcblxuICAgICAgICB0aGlzLnNldHRpbmdXYXRjaGVycyA9IFtcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwibGF5b3V0XCIsIG51bGwsICguLi5bLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbGF5b3V0OiB2YWx1ZSBhcyBMYXlvdXQgfSksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJsb3dCYW5kd2lkdGhcIiwgbnVsbCwgKC4uLlssLCwgdmFsdWVdKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb3dCYW5kd2lkdGg6IHZhbHVlIGFzIGJvb2xlYW4gfSksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJhbHdheXNTaG93VGltZXN0YW1wc1wiLCBudWxsLCAoLi4uWywsLCB2YWx1ZV0pID0+XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGFsd2F5c1Nob3dUaW1lc3RhbXBzOiB2YWx1ZSBhcyBib29sZWFuIH0pLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCIsIG51bGwsICguLi5bLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzOiB2YWx1ZSBhcyBib29sZWFuIH0pLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwicmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zXCIsIG51bGwsICguLi5bLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zOiB2YWx1ZSBhcyBudW1iZXIgfSksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJyZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXNcIiwgbnVsbCwgKC4uLlssLCwgdmFsdWVdKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXM6IHZhbHVlIGFzIG51bWJlciB9KSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcInNob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lXCIsIG51bGwsICguLi5bLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd0hpZGRlbkV2ZW50czogdmFsdWUgYXMgYm9vbGVhbiB9KSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcInVybFByZXZpZXdzRW5hYmxlZFwiLCBudWxsLCB0aGlzLm9uVXJsUHJldmlld3NFbmFibGVkQ2hhbmdlKSxcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwidXJsUHJldmlld3NFbmFibGVkX2UyZWVcIiwgbnVsbCwgdGhpcy5vblVybFByZXZpZXdzRW5hYmxlZENoYW5nZSksXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbklzUmVzaXppbmcgPSAocmVzaXppbmc6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlc2l6aW5nIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uV2lkZ2V0U3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yb29tKSByZXR1cm47XG4gICAgICAgIHRoaXMuY2hlY2tXaWRnZXRzKHRoaXMuc3RhdGUucm9vbSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25XaWRnZXRFY2hvU3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yb29tKSByZXR1cm47XG4gICAgICAgIHRoaXMuY2hlY2tXaWRnZXRzKHRoaXMuc3RhdGUucm9vbSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25XaWRnZXRMYXlvdXRDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yb29tKSByZXR1cm47XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFwiYXBwc0RyYXdlclwiLFxuICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5oYXNNYXhpbWlzZWRXaWRnZXQodGhpcy5zdGF0ZS5yb29tKSkge1xuICAgICAgICAgICAgLy8gU2hvdyBjaGF0IGluIHJpZ2h0IHBhbmVsIHdoZW4gYSB3aWRnZXQgaXMgbWF4aW1pc2VkXG4gICAgICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2Uuc2V0Q2FyZCh7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlRpbWVsaW5lIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLmlzT3BlbiAmJlxuICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnJvb21QaGFzZUhpc3Rvcnkuc29tZShjYXJkID0+IChjYXJkLnBoYXNlID09PSBSaWdodFBhbmVsUGhhc2VzLlRpbWVsaW5lKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBoaWRlIGNoYXQgaW4gcmlnaHQgcGFuZWwgd2hlbiB0aGUgd2lkZ2V0IGlzIG1pbmltaXplZFxuICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnNldENhcmQoeyBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5Sb29tU3VtbWFyeSB9KTtcbiAgICAgICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS50b2dnbGVQYW5lbCh0aGlzLnN0YXRlLnJvb21JZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja1dpZGdldHModGhpcy5zdGF0ZS5yb29tKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjaGVja1dpZGdldHMgPSAocm9vbTogUm9vbSk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhhc1Bpbm5lZFdpZGdldHM6IFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmhhc1Bpbm5lZFdpZGdldHMocm9vbSksXG4gICAgICAgICAgICBtYWluU3BsaXRDb250ZW50VHlwZTogdGhpcy5nZXRNYWluU3BsaXRDb250ZW50VHlwZShyb29tKSxcbiAgICAgICAgICAgIHNob3dBcHBzOiB0aGlzLnNob3VsZFNob3dBcHBzKHJvb20pLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRNYWluU3BsaXRDb250ZW50VHlwZSA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV92aWRlb19yb29tc1wiKSAmJiByb29tLmlzRWxlbWVudFZpZGVvUm9vbSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFpblNwbGl0Q29udGVudFR5cGUuVmlkZW87XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmhhc01heGltaXNlZFdpZGdldChyb29tKSkge1xuICAgICAgICAgICAgcmV0dXJuIE1haW5TcGxpdENvbnRlbnRUeXBlLk1heGltaXNlZFdpZGdldDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWFpblNwbGl0Q29udGVudFR5cGUuVGltZWxpbmU7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tVmlld1N0b3JlVXBkYXRlID0gYXN5bmMgKGluaXRpYWw/OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpbml0aWFsICYmIHRoaXMuc3RhdGUucm9vbUlkICE9PSBSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFJvb21JZCgpKSB7XG4gICAgICAgICAgICAvLyBSb29tVmlldyBleHBsaWNpdGx5IGRvZXMgbm90IHN1cHBvcnQgY2hhbmdpbmcgd2hhdCByb29tXG4gICAgICAgICAgICAvLyBpcyBiZWluZyB2aWV3ZWQ6IGluc3RlYWQgaXQgc2hvdWxkIGp1c3QgYmUgcmUtbW91bnRlZCB3aGVuXG4gICAgICAgICAgICAvLyBzd2l0Y2hpbmcgcm9vbXMuIFRoZXJlZm9yZSwgaWYgdGhlIHJvb20gSUQgY2hhbmdlcywgd2VcbiAgICAgICAgICAgIC8vIGlnbm9yZSB0aGlzLiBXZSBlaXRoZXIgbmVlZCB0byBkbyB0aGlzIG9yIGFkZCBjb2RlIHRvIGhhbmRsZVxuICAgICAgICAgICAgLy8gc2F2aW5nIHRoZSBzY3JvbGwgcG9zaXRpb24gKG90aGVyd2lzZSB3ZSBlbmQgdXAgc2F2aW5nIHRoZVxuICAgICAgICAgICAgLy8gc2Nyb2xsIHBvc2l0aW9uIGFnYWluc3QgdGhlIHdyb25nIHJvb20pLlxuXG4gICAgICAgICAgICAvLyBHaXZlbiB0aGF0IGRvaW5nIHRoZSBzZXRTdGF0ZSBoZXJlIHdvdWxkIGNhdXNlIGEgYnVuY2ggb2ZcbiAgICAgICAgICAgIC8vIHVubmVjZXNzYXJ5IHdvcmssIHdlIGp1c3QgaWdub3JlIHRoZSBjaGFuZ2Ugc2luY2Ugd2Uga25vd1xuICAgICAgICAgICAgLy8gdGhhdCBpZiB0aGUgY3VycmVudCByb29tIElEIGhhcyBjaGFuZ2VkIGZyb20gd2hhdCB3ZSB0aG91Z2h0XG4gICAgICAgICAgICAvLyBpdCB3YXMsIGl0IG1lYW5zIHdlJ3JlIGFib3V0IHRvIGJlIHVubW91bnRlZC5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb21JZCA9IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCk7XG5cbiAgICAgICAgLy8gVGhpcyBjb252b2x1dGVkIHR5cGUgc2lnbmF0dXJlIGVuc3VyZXMgd2UgZ2V0IEludGVsbGlTZW5zZSAqYW5kKiBjb3JyZWN0IHR5cGluZ1xuICAgICAgICBjb25zdCBuZXdTdGF0ZTogUGFydGlhbDxJUm9vbVN0YXRlPiAmIFBpY2s8SVJvb21TdGF0ZSwgYW55PiA9IHtcbiAgICAgICAgICAgIHJvb21JZCxcbiAgICAgICAgICAgIHJvb21BbGlhczogUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tQWxpYXMoKSxcbiAgICAgICAgICAgIHJvb21Mb2FkaW5nOiBSb29tVmlld1N0b3JlLmluc3RhbmNlLmlzUm9vbUxvYWRpbmcoKSxcbiAgICAgICAgICAgIHJvb21Mb2FkRXJyb3I6IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUxvYWRFcnJvcigpLFxuICAgICAgICAgICAgam9pbmluZzogUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5pc0pvaW5pbmcoKSxcbiAgICAgICAgICAgIHJlcGx5VG9FdmVudDogUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRRdW90aW5nRXZlbnQoKSxcbiAgICAgICAgICAgIC8vIHdlIHNob3VsZCBvbmx5IHBlZWsgb25jZSB3ZSBoYXZlIGEgcmVhZHkgY2xpZW50XG4gICAgICAgICAgICBzaG91bGRQZWVrOiB0aGlzLnN0YXRlLm1hdHJpeENsaWVudElzUmVhZHkgJiYgUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5zaG91bGRQZWVrKCksXG4gICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1JlYWRSZWNlaXB0c1wiLCByb29tSWQpLFxuICAgICAgICAgICAgc2hvd1JlZGFjdGlvbnM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93UmVkYWN0aW9uc1wiLCByb29tSWQpLFxuICAgICAgICAgICAgc2hvd0pvaW5MZWF2ZXM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93Sm9pbkxlYXZlc1wiLCByb29tSWQpLFxuICAgICAgICAgICAgc2hvd0F2YXRhckNoYW5nZXM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93QXZhdGFyQ2hhbmdlc1wiLCByb29tSWQpLFxuICAgICAgICAgICAgc2hvd0Rpc3BsYXluYW1lQ2hhbmdlczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dEaXNwbGF5bmFtZUNoYW5nZXNcIiwgcm9vbUlkKSxcbiAgICAgICAgICAgIHdhc0NvbnRleHRTd2l0Y2g6IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0V2FzQ29udGV4dFN3aXRjaCgpLFxuICAgICAgICAgICAgaW5pdGlhbEV2ZW50SWQ6IG51bGwsIC8vIGRlZmF1bHQgdG8gY2xlYXJpbmcgdGhpcywgd2lsbCBnZXQgc2V0IGxhdGVyIGluIHRoZSBtZXRob2QgaWYgbmVlZGVkXG4gICAgICAgICAgICBzaG93UmlnaHRQYW5lbDogUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLmlzT3BlbkZvclJvb20ocm9vbUlkKSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBpbml0aWFsRXZlbnRJZCA9IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0SW5pdGlhbEV2ZW50SWQoKTtcbiAgICAgICAgaWYgKGluaXRpYWxFdmVudElkKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5jb250ZXh0LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIGxldCBpbml0aWFsRXZlbnQgPSByb29tPy5maW5kRXZlbnRCeUlkKGluaXRpYWxFdmVudElkKTtcbiAgICAgICAgICAgIC8vIFRoZSBldmVudCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgY3VycmVudCBzeW5jIGRhdGFcbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZmV0Y2ggaXQgdG8ga25vdyB3aGV0aGVyIHRvIHJvdXRlIHRoaXMgcmVxdWVzdFxuICAgICAgICAgICAgLy8gdG8gdGhlIG1haW4gdGltZWxpbmUgb3IgdG8gYSB0aHJlYWRlZCBvbmVcbiAgICAgICAgICAgIC8vIEluIHRoZSBjdXJyZW50IHN0YXRlLCBpZiBhIHRocmVhZCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgc3luYyBkYXRhXG4gICAgICAgICAgICAvLyBXZSB3aWxsIG9ubHkgZGlzcGxheSB0aGUgZXZlbnQgdGFyZ2V0ZWQgYnkgdGhlIGBtYXRyaXgudG9gIGxpbmtcbiAgICAgICAgICAgIC8vIGFuZCB0aGUgcm9vdCBldmVudC5cbiAgICAgICAgICAgIC8vIFRoZSByZXN0IHdpbGwgYmUgbG9zdCBmb3Igbm93LCB1bnRpbCB0aGUgYWdncmVnYXRpb24gQVBJIG9uIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgIC8vIGJlY29tZXMgYXZhaWxhYmxlIHRvIGZldGNoIGEgd2hvbGUgdGhyZWFkXG4gICAgICAgICAgICBpZiAoIWluaXRpYWxFdmVudCkge1xuICAgICAgICAgICAgICAgIGluaXRpYWxFdmVudCA9IGF3YWl0IGZldGNoSW5pdGlhbEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgIHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEV2ZW50SWQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBpbml0aWFsIGV2ZW50LCB3ZSB3YW50IHRvIHJlc2V0IHRoZSBldmVudCBwaXhlbCBvZmZzZXQgdG8gZW5zdXJlIGl0IGVuZHMgdXBcbiAgICAgICAgICAgIC8vIHZpc2libGVcbiAgICAgICAgICAgIG5ld1N0YXRlLmluaXRpYWxFdmVudFBpeGVsT2Zmc2V0ID0gbnVsbDtcblxuICAgICAgICAgICAgY29uc3QgdGhyZWFkID0gaW5pdGlhbEV2ZW50Py5nZXRUaHJlYWQoKTtcbiAgICAgICAgICAgIGlmICh0aHJlYWQgJiYgIWluaXRpYWxFdmVudD8uaXNUaHJlYWRSb290KSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFNob3dUaHJlYWRQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlNob3dUaHJlYWQsXG4gICAgICAgICAgICAgICAgICAgIHJvb3RFdmVudDogdGhyZWFkLnJvb3RFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRlZDogUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5pc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkKCksXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbF9pbnRvX3ZpZXc6IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuaW5pdGlhbEV2ZW50U2Nyb2xsSW50b1ZpZXcoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhdGUuaW5pdGlhbEV2ZW50SWQgPSBpbml0aWFsRXZlbnRJZDtcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZS5pc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkID0gUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5pc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkKCk7XG4gICAgICAgICAgICAgICAgbmV3U3RhdGUuaW5pdGlhbEV2ZW50U2Nyb2xsSW50b1ZpZXcgPSBSb29tVmlld1N0b3JlLmluc3RhbmNlLmluaXRpYWxFdmVudFNjcm9sbEludG9WaWV3KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhyZWFkICYmIGluaXRpYWxFdmVudD8uaXNUaHJlYWRSb290KSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxTaG93VGhyZWFkUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uU2hvd1RocmVhZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RFdmVudDogdGhyZWFkLnJvb3RFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkOiBSb29tVmlld1N0b3JlLmluc3RhbmNlLmlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbF9pbnRvX3ZpZXc6IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuaW5pdGlhbEV2ZW50U2Nyb2xsSW50b1ZpZXcoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHdhdGNoZXJzIGZvciBlYWNoIG9mIHRoZSBzZXR0aW5ncyB3ZSBqdXN0IGxvb2tlZCB1cFxuICAgICAgICB0aGlzLnNldHRpbmdXYXRjaGVycyA9IHRoaXMuc2V0dGluZ1dhdGNoZXJzLmNvbmNhdChbXG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcInNob3dSZWFkUmVjZWlwdHNcIiwgcm9vbUlkLCAoLi4uWywsLCB2YWx1ZV0pID0+XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dSZWFkUmVjZWlwdHM6IHZhbHVlIGFzIGJvb2xlYW4gfSksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJzaG93UmVkYWN0aW9uc1wiLCByb29tSWQsICguLi5bLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1JlZGFjdGlvbnM6IHZhbHVlIGFzIGJvb2xlYW4gfSksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJzaG93Sm9pbkxlYXZlc1wiLCByb29tSWQsICguLi5bLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd0pvaW5MZWF2ZXM6IHZhbHVlIGFzIGJvb2xlYW4gfSksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJzaG93QXZhdGFyQ2hhbmdlc1wiLCByb29tSWQsICguLi5bLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd0F2YXRhckNoYW5nZXM6IHZhbHVlIGFzIGJvb2xlYW4gfSksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJzaG93RGlzcGxheW5hbWVDaGFuZ2VzXCIsIHJvb21JZCwgKC4uLlssLCwgdmFsdWVdKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93RGlzcGxheW5hbWVDaGFuZ2VzOiB2YWx1ZSBhcyBib29sZWFuIH0pLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgaWYgKCFpbml0aWFsICYmIHRoaXMuc3RhdGUuc2hvdWxkUGVlayAmJiAhbmV3U3RhdGUuc2hvdWxkUGVlaykge1xuICAgICAgICAgICAgLy8gU3RvcCBwZWVraW5nIGJlY2F1c2Ugd2UgaGF2ZSBqb2luZWQgdGhpcyByb29tIG5vd1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnN0b3BQZWVraW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZW1wb3JhcnkgbG9nZ2luZyB0byBkaWFnbm9zZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy80MzA3XG4gICAgICAgIGxvZ2dlci5sb2coXG4gICAgICAgICAgICAnUlZTIHVwZGF0ZTonLFxuICAgICAgICAgICAgbmV3U3RhdGUucm9vbUlkLFxuICAgICAgICAgICAgbmV3U3RhdGUucm9vbUFsaWFzLFxuICAgICAgICAgICAgJ2xvYWRpbmc/JywgbmV3U3RhdGUucm9vbUxvYWRpbmcsXG4gICAgICAgICAgICAnam9pbmluZz8nLCBuZXdTdGF0ZS5qb2luaW5nLFxuICAgICAgICAgICAgJ2luaXRpYWw/JywgaW5pdGlhbCxcbiAgICAgICAgICAgICdzaG91bGRQZWVrPycsIG5ld1N0YXRlLnNob3VsZFBlZWssXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gTkI6IFRoaXMgZG9lcyBhc3N1bWUgdGhhdCB0aGUgcm9vbUlEIHdpbGwgbm90IGNoYW5nZSBmb3IgdGhlIGxpZmV0aW1lIG9mXG4gICAgICAgIC8vIHRoZSBSb29tVmlldyBpbnN0YW5jZVxuICAgICAgICBpZiAoaW5pdGlhbCkge1xuICAgICAgICAgICAgbmV3U3RhdGUucm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKG5ld1N0YXRlLnJvb21JZCk7XG4gICAgICAgICAgICBpZiAobmV3U3RhdGUucm9vbSkge1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLnNob3dBcHBzID0gdGhpcy5zaG91bGRTaG93QXBwcyhuZXdTdGF0ZS5yb29tKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUm9vbUxvYWRlZChuZXdTdGF0ZS5yb29tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb21JZCA9PT0gbnVsbCAmJiBuZXdTdGF0ZS5yb29tSWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgc2Nyb2xsIHN0YXRlIGZvciB0aGUgbmV3IHJvb21cblxuICAgICAgICAgICAgLy8gSWYgYW4gZXZlbnQgSUQgd2Fzbid0IHNwZWNpZmllZCwgZGVmYXVsdCB0byB0aGUgb25lIHNhdmVkIGZvciB0aGlzIHJvb21cbiAgICAgICAgICAgIC8vIGluIHRoZSBzY3JvbGwgc3RhdGUgc3RvcmUuIEFzc3VtZSBpbml0aWFsRXZlbnRQaXhlbE9mZnNldCBzaG91bGQgYmUgc2V0LlxuICAgICAgICAgICAgaWYgKCFuZXdTdGF0ZS5pbml0aWFsRXZlbnRJZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21TY3JvbGxTdGF0ZSA9IFJvb21TY3JvbGxTdGF0ZVN0b3JlLmdldFNjcm9sbFN0YXRlKG5ld1N0YXRlLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21TY3JvbGxTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdTdGF0ZS5pbml0aWFsRXZlbnRJZCA9IHJvb21TY3JvbGxTdGF0ZS5mb2N1c3NlZEV2ZW50O1xuICAgICAgICAgICAgICAgICAgICBuZXdTdGF0ZS5pbml0aWFsRXZlbnRQaXhlbE9mZnNldCA9IHJvb21TY3JvbGxTdGF0ZS5waXhlbE9mZnNldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhciB0aGUgc2VhcmNoIHJlc3VsdHMgd2hlbiBjbGlja2luZyBhIHNlYXJjaCByZXN1bHQgKHdoaWNoIGNoYW5nZXMgdGhlXG4gICAgICAgIC8vIGN1cnJlbnRseSBzY3JvbGxlZCB0byBldmVudCwgdGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRJZCkuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmluaXRpYWxFdmVudElkICE9PSBuZXdTdGF0ZS5pbml0aWFsRXZlbnRJZCkge1xuICAgICAgICAgICAgbmV3U3RhdGUuc2VhcmNoUmVzdWx0cyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgbmV3U3RhdGUucm9vbUlkIGNvdWxkIGJlIG51bGwgKGUuZy4gdGhlIGFsaWFzIG1pZ2h0IG5vdFxuICAgICAgICAvLyBoYXZlIGJlZW4gcmVzb2x2ZWQgeWV0KSBzbyBhbnl0aGluZyBjYWxsZWQgaGVyZSBtdXN0IGhhbmRsZSB0aGlzIGNhc2UuXG5cbiAgICAgICAgLy8gV2UgcGFzcyB0aGUgbmV3IHN0YXRlIGludG8gdGhpcyBmdW5jdGlvbiBmb3IgaXQgdG8gcmVhZDogaXQgbmVlZHMgdG9cbiAgICAgICAgLy8gb2JzZXJ2ZSB0aGUgbmV3IHN0YXRlIGJ1dCB3ZSBkb24ndCB3YW50IHRvIHB1dCBpdCBpbiB0aGUgc2V0U3RhdGVcbiAgICAgICAgLy8gY2FsbGJhY2sgYmVjYXVzZSB0aGlzIHdvdWxkIHByZXZlbnQgdGhlIHNldFN0YXRlcyBmcm9tIGJlaW5nIGJhdGNoZWQsXG4gICAgICAgIC8vIGllLiBjYXVzZSBpdCB0byByZW5kZXIgUm9vbVZpZXcgdHdpY2UgcmF0aGVyIHRoYW4gdGhlIG9uY2UgdGhhdCBpcyBuZWNlc3NhcnkuXG4gICAgICAgIGlmIChpbml0aWFsKSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwUm9vbShuZXdTdGF0ZS5yb29tLCBuZXdTdGF0ZS5yb29tSWQsIG5ld1N0YXRlLmpvaW5pbmcsIG5ld1N0YXRlLnNob3VsZFBlZWspO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0Um9vbUlkID0gKCkgPT4ge1xuICAgICAgICAvLyBBY2NvcmRpbmcgdG8gYG9uUm9vbVZpZXdTdG9yZVVwZGF0ZWAsIGBzdGF0ZS5yb29tSWRgIGNhbiBiZSBudWxsXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSByb29tIGFsaWFzIHdlIGhhdmVuJ3QgcmVzb2x2ZWQgeWV0LiBUbyB3b3JrIGFyb3VuZCB0aGlzLFxuICAgICAgICAvLyBmaXJzdCB3ZSdsbCB0cnkgdGhlIHJvb20gb2JqZWN0IGlmIGl0J3MgdGhlcmUsIGFuZCB0aGVuIGZhbGxiYWNrIHRvXG4gICAgICAgIC8vIHRoZSBiYXJlIHJvb20gSUQuIChXZSBtYXkgd2FudCB0byB1cGRhdGUgYHN0YXRlLnJvb21JZGAgYWZ0ZXJcbiAgICAgICAgLy8gcmVzb2x2aW5nIGFsaWFzZXMsIHNvIHdlIGNvdWxkIGFsd2F5cyB0cnVzdCBpdC4pXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJvb20gPyB0aGlzLnN0YXRlLnJvb20ucm9vbUlkIDogdGhpcy5zdGF0ZS5yb29tSWQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0UGVybWFsaW5rQ3JlYXRvckZvclJvb20ocm9vbTogUm9vbSkge1xuICAgICAgICBpZiAodGhpcy5wZXJtYWxpbmtDcmVhdG9yc1tyb29tLnJvb21JZF0pIHJldHVybiB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb20ucm9vbUlkXTtcblxuICAgICAgICB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb20ucm9vbUlkXSA9IG5ldyBSb29tUGVybWFsaW5rQ3JlYXRvcihyb29tKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbSAmJiByb29tLnJvb21JZCA9PT0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZCkge1xuICAgICAgICAgICAgLy8gV2Ugd2FudCB0byB3YXRjaCBmb3IgY2hhbmdlcyBpbiB0aGUgY3JlYXRvciBmb3IgdGhlIHByaW1hcnkgcm9vbSBpbiB0aGUgdmlldywgYnV0XG4gICAgICAgICAgICAvLyBkb24ndCBuZWVkIHRvIGRvIHNvIGZvciBzZWFyY2ggcmVzdWx0cy5cbiAgICAgICAgICAgIHRoaXMucGVybWFsaW5rQ3JlYXRvcnNbcm9vbS5yb29tSWRdLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb20ucm9vbUlkXS5sb2FkKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGVybWFsaW5rQ3JlYXRvcnNbcm9vbS5yb29tSWRdO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RvcEFsbFBlcm1hbGlua0NyZWF0b3JzKCkge1xuICAgICAgICBpZiAoIXRoaXMucGVybWFsaW5rQ3JlYXRvcnMpIHJldHVybjtcbiAgICAgICAgZm9yIChjb25zdCByb29tSWQgb2YgT2JqZWN0LmtleXModGhpcy5wZXJtYWxpbmtDcmVhdG9ycykpIHtcbiAgICAgICAgICAgIHRoaXMucGVybWFsaW5rQ3JlYXRvcnNbcm9vbUlkXS5zdG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldHVwUm9vbShyb29tOiBSb29tLCByb29tSWQ6IHN0cmluZywgam9pbmluZzogYm9vbGVhbiwgc2hvdWxkUGVlazogYm9vbGVhbikge1xuICAgICAgICAvLyBpZiB0aGlzIGlzIGFuIHVua25vd24gcm9vbSB0aGVuIHdlJ3JlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6XG4gICAgICAgIC8vIC0gVGhpcyBpcyBhIHJvb20gd2UgY2FuIHBlZWsgaW50byAoc2VhcmNoIGVuZ2luZSkgKHdlIGNhbiAvcGVlaylcbiAgICAgICAgLy8gLSBUaGlzIGlzIGEgcm9vbSB3ZSBjYW4gcHVibGljbHkgam9pbiBvciB3ZXJlIGludml0ZWQgdG8uICh3ZSBjYW4gL2pvaW4pXG4gICAgICAgIC8vIC0gVGhpcyBpcyBhIHJvb20gd2UgY2Fubm90IGpvaW4gYXQgYWxsLiAobm8gYWN0aW9uIGNhbiBoZWxwIHVzKVxuICAgICAgICAvLyBXZSBjYW4ndCB0cnkgdG8gL2pvaW4gYmVjYXVzZSB0aGlzIG1heSBpbXBsaWNpdGx5IGFjY2VwdCBpbnZpdGVzICghKVxuICAgICAgICAvLyBXZSBjYW4gL3BlZWsgdGhvdWdoLiBJZiBpdCBmYWlscyB0aGVuIHdlIHByZXNlbnQgdGhlIGpvaW4gVUkuIElmIGl0XG4gICAgICAgIC8vIHN1Y2NlZWRzIHRoZW4gZ3JlYXQsIHNob3cgdGhlIHByZXZpZXcgKGJ1dCB3ZSBzdGlsbCBtYXkgYmUgYWJsZSB0byAvam9pbiEpLlxuICAgICAgICAvLyBOb3RlIHRoYXQgcGVla2luZyB3b3JrcyBieSByb29tIElEIGFuZCByb29tIElEIG9ubHksIGFzIG9wcG9zZWQgdG8gam9pbmluZ1xuICAgICAgICAvLyB3aGljaCBtdXN0IGJlIGJ5IGFsaWFzIG9yIGludml0ZSB3aGVyZXZlciBwb3NzaWJsZSAocGVla2luZyBjdXJyZW50bHkgZG9lc1xuICAgICAgICAvLyBub3Qgd29yayBvdmVyIGZlZGVyYXRpb24pLlxuXG4gICAgICAgIC8vIE5CLiBXZSBwZWVrIGlmIHdlIGhhdmUgbmV2ZXIgc2VlbiB0aGUgcm9vbSBiZWZvcmUgKGkuZS4ganMtc2RrIGRvZXMgbm90IGtub3dcbiAgICAgICAgLy8gYWJvdXQgaXQpLiBXZSBkb24ndCBwZWVrIGluIHRoZSBoaXN0b3JpY2FsIGNhc2Ugd2hlcmUgd2Ugd2VyZSBqb2luZWQgYnV0IGFyZVxuICAgICAgICAvLyBub3cgbm90IGpvaW5lZCBiZWNhdXNlIHRoZSBqcy1zZGsgcGVla2luZyBBUEkgd2lsbCBjbG9iYmVyIG91ciBoaXN0b3JpY2FsIHJvb20sXG4gICAgICAgIC8vIG1ha2luZyBpdCBpbXBvc3NpYmxlIHRvIGluZGljYXRlIGEgbmV3bHkgam9pbmVkIHJvb20uXG4gICAgICAgIGlmICgham9pbmluZyAmJiByb29tSWQpIHtcbiAgICAgICAgICAgIGlmICghcm9vbSAmJiBzaG91bGRQZWVrKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJBdHRlbXB0aW5nIHRvIHBlZWsgaW50byByb29tICVzXCIsIHJvb21JZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHBlZWtMb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpc1BlZWtpbmc6IHRydWUsIC8vIHRoaXMgd2lsbCBjaGFuZ2UgdG8gZmFsc2UgaWYgcGVla2luZyBmYWlsc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wZWVrSW5Sb29tKHJvb21JZCkudGhlbigocm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBwZWVrTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUm9vbUxvYWRlZChyb29tKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU3RvcCBwZWVraW5nIGlmIGFueXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1BlZWtpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHdvbid0IG5lY2Vzc2FyaWx5IGJlIGEgTWF0cml4RXJyb3IsIGJ1dCB3ZSBkdWNrLXR5cGVcbiAgICAgICAgICAgICAgICAgICAgLy8gaGVyZSBhbmQgc2F5IGlmIGl0J3MgZ290IGFuICdlcnJjb2RlJyBrZXkgd2l0aCB0aGUgcmlnaHQgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIC8vIGl0IG1lYW5zIHdlIGNhbid0IHBlZWsuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gXCJNX0dVRVNUX0FDQ0VTU19GT1JCSURERU5cIiB8fCBlcnIuZXJyY29kZSA9PT0gJ01fRk9SQklEREVOJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBmaW5lOiB0aGUgcm9vbSBqdXN0IGlzbid0IHBlZWthYmxlICh3ZSBhc3N1bWUpLlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVla0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgIC8vIFN0b3AgcGVla2luZyBiZWNhdXNlIHdlIGhhdmUgam9pbmVkIHRoaXMgcm9vbSBwcmV2aW91c2x5XG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnN0b3BQZWVraW5nKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzUGVla2luZzogZmFsc2UgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3VsZFNob3dBcHBzKHJvb206IFJvb20pIHtcbiAgICAgICAgaWYgKCFCUk9XU0VSX1NVUFBPUlRTX1NBTkRCT1ggfHwgIXJvb20pIHJldHVybiBmYWxzZTtcblxuICAgICAgICAvLyBDaGVjayBpZiB1c2VyIGhhcyBwcmV2aW91c2x5IGNob3NlbiB0byBoaWRlIHRoZSBhcHAgZHJhd2VyIGZvciB0aGlzXG4gICAgICAgIC8vIHJvb20uIElmIHNvLCBkbyBub3Qgc2hvdyBhcHBzXG4gICAgICAgIGNvbnN0IGhpZGVXaWRnZXRLZXkgPSByb29tLnJvb21JZCArIFwiX2hpZGVfd2lkZ2V0X2RyYXdlclwiO1xuICAgICAgICBjb25zdCBoaWRlV2lkZ2V0RHJhd2VyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oaGlkZVdpZGdldEtleSk7XG5cbiAgICAgICAgLy8gSWYgdW5zZXQgc2hvdyB0aGUgVHJheVxuICAgICAgICAvLyBPdGhlcndpc2UgKGluIGNhc2UgdGhlIHVzZXIgc2V0IGhpZGVXaWRnZXREcmF3ZXIgYnkgY2xpY2tpbmcgdGhlIGJ1dHRvbikgZm9sbG93IHRoZSBwYXJhbWV0ZXIuXG4gICAgICAgIGNvbnN0IGlzTWFudWFsbHlTaG93biA9IGhpZGVXaWRnZXREcmF3ZXIgPyBoaWRlV2lkZ2V0RHJhd2VyID09PSBcImZhbHNlXCI6IHRydWU7XG5cbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmdldENvbnRhaW5lcldpZGdldHMocm9vbSwgQ29udGFpbmVyLlRvcCk7XG4gICAgICAgIHJldHVybiBpc01hbnVhbGx5U2hvd24gJiYgd2lkZ2V0cy5sZW5ndGggPiAwO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLm9uUm9vbVZpZXdTdG9yZVVwZGF0ZSh0cnVlKTtcblxuICAgICAgICBjb25zdCBjYWxsID0gdGhpcy5nZXRDYWxsRm9yUm9vbSgpO1xuICAgICAgICBjb25zdCBjYWxsU3RhdGUgPSBjYWxsID8gY2FsbC5zdGF0ZSA6IG51bGw7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY2FsbFN0YXRlOiBjYWxsU3RhdGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLm9uKExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQuQ2FsbFN0YXRlLCB0aGlzLm9uQ2FsbFN0YXRlKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHRoaXMub25QYWdlVW5sb2FkKTtcbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgY29uc3QgaGFzUHJvcHNEaWZmID0gb2JqZWN0SGFzRGlmZih0aGlzLnByb3BzLCBuZXh0UHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHsgdXBncmFkZVJlY29tbWVuZGF0aW9uLCAuLi5zdGF0ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgY29uc3QgeyB1cGdyYWRlUmVjb21tZW5kYXRpb246IG5ld1VwZ3JhZGVSZWNvbW1lbmRhdGlvbiwgLi4ubmV3U3RhdGUgfSA9IG5leHRTdGF0ZTtcblxuICAgICAgICBjb25zdCBoYXNTdGF0ZURpZmYgPVxuICAgICAgICAgICAgbmV3VXBncmFkZVJlY29tbWVuZGF0aW9uPy5uZWVkc1VwZ3JhZGUgIT09IHVwZ3JhZGVSZWNvbW1lbmRhdGlvbj8ubmVlZHNVcGdyYWRlIHx8XG4gICAgICAgICAgICBvYmplY3RIYXNEaWZmKHN0YXRlLCBuZXdTdGF0ZSk7XG5cbiAgICAgICAgcmV0dXJuIGhhc1Byb3BzRGlmZiB8fCBoYXNTdGF0ZURpZmY7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAvLyBOb3RlOiBXZSBjaGVjayB0aGUgcmVmIGhlcmUgd2l0aCBhIGZsYWcgYmVjYXVzZSBjb21wb25lbnREaWRNb3VudCwgZGVzcGl0ZVxuICAgICAgICAvLyBkb2N1bWVudGF0aW9uLCBkb2VzIG5vdCBkZWZpbmUgb3VyIG1lc3NhZ2VQYW5lbCByZWYuIEl0IGxvb2tzIGxpa2Ugb3VyIHNwaW5uZXJcbiAgICAgICAgLy8gaW4gcmVuZGVyKCkgcHJldmVudHMgdGhlIHJlZiBmcm9tIGJlaW5nIHNldCBvbiBmaXJzdCBtb3VudCwgc28gd2UgdHJ5IGFuZFxuICAgICAgICAvLyBjYXRjaCB0aGUgbWVzc2FnZVBhbmVsIHdoZW4gaXQgZG9lcyBtb3VudC4gQmVjYXVzZSB3ZSBvbmx5IHdhbnQgdGhlIHJlZiBvbmNlLFxuICAgICAgICAvLyB3ZSB1c2UgYSBib29sZWFuIGZsYWcgdG8gYXZvaWQgZHVwbGljYXRlIHdvcmsuXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VQYW5lbCAmJiB0aGlzLnN0YXRlLmF0RW5kT2ZMaXZlVGltZWxpbmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYXRFbmRPZkxpdmVUaW1lbGluZTogdGhpcy5tZXNzYWdlUGFuZWwuaXNBdEVuZE9mTGl2ZVRpbWVsaW5lKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvLyBzZXQgYSBib29sZWFuIHRvIHNheSB3ZSd2ZSBiZWVuIHVubW91bnRlZCwgd2hpY2ggYW55IHBlbmRpbmdcbiAgICAgICAgLy8gcHJvbWlzZXMgY2FuIHVzZSB0byB0aHJvdyBhd2F5IHRoZWlyIHJlc3VsdHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIChXZSBjb3VsZCB1c2UgaXNNb3VudGVkLCBidXQgZmFjZWJvb2sgaGF2ZSBkZXByZWNhdGVkIHRoYXQuKVxuICAgICAgICB0aGlzLnVubW91bnRlZCA9IHRydWU7XG5cbiAgICAgICAgTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2UucmVtb3ZlTGlzdGVuZXIoTGVnYWN5Q2FsbEhhbmRsZXJFdmVudC5DYWxsU3RhdGUsIHRoaXMub25DYWxsU3RhdGUpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgc2Nyb2xsIG1hcCBiZWZvcmUgd2UgZ2V0IHVubW91bnRlZFxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tSWQpIHtcbiAgICAgICAgICAgIFJvb21TY3JvbGxTdGF0ZVN0b3JlLnNldFNjcm9sbFN0YXRlKHRoaXMuc3RhdGUucm9vbUlkLCB0aGlzLmdldFNjcm9sbFN0YXRlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvdWxkUGVlaykge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnN0b3BQZWVraW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9wIHRyYWNraW5nIHJvb20gY2hhbmdlcyB0byBmb3JtYXQgcGVybWFsaW5rc1xuICAgICAgICB0aGlzLnN0b3BBbGxQZXJtYWxpbmtDcmVhdG9ycygpO1xuXG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihDbGllbnRFdmVudC5Sb29tLCB0aGlzLm9uUm9vbSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoUm9vbUV2ZW50LlRpbWVsaW5lLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihSb29tRXZlbnQuTmFtZSwgdGhpcy5vblJvb21OYW1lKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihSb29tU3RhdGVFdmVudC5FdmVudHMsIHRoaXMub25Sb29tU3RhdGVFdmVudHMpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFJvb21TdGF0ZUV2ZW50LlVwZGF0ZSwgdGhpcy5vblJvb21TdGF0ZVVwZGF0ZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoQ3J5cHRvRXZlbnQuS2V5QmFja3VwU3RhdHVzLCB0aGlzLm9uS2V5QmFja3VwU3RhdHVzKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihDcnlwdG9FdmVudC5EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkLCB0aGlzLm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoQ3J5cHRvRXZlbnQuVXNlclRydXN0U3RhdHVzQ2hhbmdlZCwgdGhpcy5vblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihDcnlwdG9FdmVudC5LZXlzQ2hhbmdlZCwgdGhpcy5vbkNyb3NzU2lnbmluZ0tleXNDaGFuZ2VkKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihNYXRyaXhFdmVudEV2ZW50LkRlY3J5cHRlZCwgdGhpcy5vbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCB0aGlzLm9uUGFnZVVubG9hZCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIFJvb21TdG9yZSBsaXN0ZW5lclxuICAgICAgICBpZiAodGhpcy5yb29tU3RvcmVUb2tlbikge1xuICAgICAgICAgICAgdGhpcy5yb29tU3RvcmVUb2tlbi5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX0VWRU5ULCB0aGlzLm9uUmlnaHRQYW5lbFN0b3JlVXBkYXRlKTtcbiAgICAgICAgV2lkZ2V0RWNob1N0b3JlLnJlbW92ZUxpc3RlbmVyKFVQREFURV9FVkVOVCwgdGhpcy5vbldpZGdldEVjaG9TdG9yZVVwZGF0ZSk7XG4gICAgICAgIFdpZGdldFN0b3JlLmluc3RhbmNlLnJlbW92ZUxpc3RlbmVyKFVQREFURV9FVkVOVCwgdGhpcy5vbldpZGdldFN0b3JlVXBkYXRlKTtcblxuICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLm9mZihcImlzUmVzaXppbmdcIiwgdGhpcy5vbklzUmVzaXppbmcpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm9mZihcbiAgICAgICAgICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5lbWlzc2lvbkZvclJvb20odGhpcy5zdGF0ZS5yb29tKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9uV2lkZ2V0TGF5b3V0Q2hhbmdlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLm9mZihMZWdhY3lDYWxsSGFuZGxlckV2ZW50LkNhbGxTdGF0ZSwgdGhpcy5vbkNhbGxTdGF0ZSk7XG5cbiAgICAgICAgLy8gY2FuY2VsIGFueSBwZW5kaW5nIGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgdXBkYXRlZFxuICAgICAgICB0aGlzLnVwZGF0ZVJvb21NZW1iZXJzLmNhbmNlbCgpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgd2F0Y2hlciBvZiB0aGlzLnNldHRpbmdXYXRjaGVycykge1xuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh3YXRjaGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnZpZXdzTG9jYWxSb29tKSB7XG4gICAgICAgICAgICAvLyBjbGVhbiB1cCBpZiB0aGlzIHdhcyBhIGxvY2FsIHJvb21cbiAgICAgICAgICAgIHRoaXMucHJvcHMubXhDbGllbnQuc3RvcmUucmVtb3ZlUm9vbSh0aGlzLnN0YXRlLnJvb20ucm9vbUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25SaWdodFBhbmVsU3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd1JpZ2h0UGFuZWw6IFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5pc09wZW5Gb3JSb29tKHRoaXMuc3RhdGUucm9vbUlkKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYWdlVW5sb2FkID0gZXZlbnQgPT4ge1xuICAgICAgICBpZiAoQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuZ2V0Q3VycmVudFVwbG9hZHMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZXZlbnQucmV0dXJuVmFsdWUgPVxuICAgICAgICAgICAgICAgIF90KFwiWW91IHNlZW0gdG8gYmUgdXBsb2FkaW5nIGZpbGVzLCBhcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcXVpdD9cIik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRDYWxsRm9yUm9vbSgpICYmIHRoaXMuc3RhdGUuY2FsbFN0YXRlICE9PSAnZW5kZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gZXZlbnQucmV0dXJuVmFsdWUgPVxuICAgICAgICAgICAgICAgIF90KFwiWW91IHNlZW0gdG8gYmUgaW4gYSBjYWxsLCBhcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcXVpdD9cIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlYWN0S2V5RG93biA9IGV2ID0+IHtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRSb29tQWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5EaXNtaXNzUmVhZE1hcmtlcjpcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VQYW5lbC5mb3JnZXRSZWFkTWFya2VyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1wVG9MaXZlVGltZWxpbmUoKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5KdW1wVG9PbGRlc3RVbnJlYWQ6XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1wVG9SZWFkTWFya2VyKCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uVXBsb2FkRmlsZToge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ1cGxvYWRfZmlsZVwiLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbSxcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbGxTdGF0ZSA9IChyb29tSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBkb24ndCBmaWx0ZXIgb3V0IHBheWxvYWRzIGZvciByb29tIElEcyBvdGhlciB0aGFuIHByb3BzLnJvb20gYmVjYXVzZVxuICAgICAgICAvLyB3ZSBtYXkgYmUgaW50ZXJlc3RlZCBpbiB0aGUgY29uZiAxOjEgcm9vbVxuXG4gICAgICAgIGlmICghcm9vbUlkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNhbGwgPSB0aGlzLmdldENhbGxGb3JSb29tKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjYWxsU3RhdGU6IGNhbGwgPyBjYWxsLnN0YXRlIDogbnVsbCB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IGFzeW5jIChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ21lc3NhZ2Vfc2VudCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Rlc2t0b3BOb3RpZmljYXRpb25zKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdwb3N0X3N0aWNrZXJfbWVzc2FnZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5pbmplY3RTdGlja2VyKFxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmRhdGEuY29udGVudC51cmwsXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuZGF0YS5jb250ZW50LmluZm8sXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuZGF0YS5kZXNjcmlwdGlvbiB8fCBwYXlsb2FkLmRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5kYXRhLnRocmVhZElkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3BpY3R1cmVfc25hcHNob3QnOlxuICAgICAgICAgICAgICAgIENvbnRlbnRNZXNzYWdlcy5zaGFyZWRJbnN0YW5jZSgpLnNlbmRDb250ZW50TGlzdFRvUm9vbShcbiAgICAgICAgICAgICAgICAgICAgW3BheWxvYWQuZmlsZV0sIHRoaXMuc3RhdGUucm9vbS5yb29tSWQsIG51bGwsIHRoaXMuY29udGV4dCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub3RpZmllcl9lbmFibGVkJzpcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlVwbG9hZFN0YXJ0ZWQ6XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5VcGxvYWRGaW5pc2hlZDpcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlVwbG9hZENhbmNlbGVkOlxuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FwcHNEcmF3ZXInOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzaG93QXBwczogcGF5bG9hZC5zaG93LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVwbHlfdG9fZXZlbnQnOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy51bm1vdW50ZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzICYmXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuZXZlbnQ/LmdldFJvb21JZCgpID09PSB0aGlzLnN0YXRlLnJvb21JZCAmJlxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmNvbnRleHQgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5TZWFyY2hcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNhbmNlbFNlYXJjaENsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gcmUtZGlzcGF0Y2ggYXMgUm9vbVZpZXdTdG9yZSBrbm93cyB0byBwZXJzaXN0IHdpdGggY29udGV4dD1TZWFyY2ggYWxzb1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ01hdHJpeEFjdGlvbnMuc3luYyc6XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLm1hdHJpeENsaWVudElzUmVhZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnRJc1JlYWR5OiB0aGlzLmNvbnRleHQ/LmlzSW5pdGlhbFN5bmNDb21wbGV0ZSgpLFxuICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZW5kIGFub3RoZXIgXCJpbml0aWFsXCIgUlZTIHVwZGF0ZSB0byB0cmlnZ2VyIHBlZWtpbmcgaWYgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUm9vbVZpZXdTdG9yZVVwZGF0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZm9jdXNfc2VhcmNoJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2VhcmNoQ2xpY2soKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbG9jYWxfcm9vbV9ldmVudCc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbkxvY2FsUm9vbUV2ZW50KHBheWxvYWQucm9vbUlkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uRWRpdEV2ZW50OiB7XG4gICAgICAgICAgICAgICAgLy8gUXVpdCBlYXJseSBpZiB3ZSdyZSB0cnlpbmcgdG8gZWRpdCBldmVudHMgaW4gd3JvbmcgcmVuZGVyaW5nIGNvbnRleHRcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC50aW1lbGluZVJlbmRlcmluZ1R5cGUgIT09IHRoaXMuc3RhdGUudGltZWxpbmVSZW5kZXJpbmdUeXBlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgZWRpdFN0YXRlID0gcGF5bG9hZC5ldmVudCA/IG5ldyBFZGl0b3JTdGF0ZVRyYW5zZmVyKHBheWxvYWQuZXZlbnQpIDogbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdFN0YXRlIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZVBhbmVsPy5zY3JvbGxUb0V2ZW50SWZOZWVkZWQocGF5bG9hZC5ldmVudC5nZXRJZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5Db21wb3Nlckluc2VydDoge1xuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLmNvbXBvc2VyVHlwZSkgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBsZXQgdGltZWxpbmVSZW5kZXJpbmdUeXBlOiBUaW1lbGluZVJlbmRlcmluZ1R5cGUgPSBwYXlsb2FkLnRpbWVsaW5lUmVuZGVyaW5nVHlwZTtcbiAgICAgICAgICAgICAgICAvLyBUaHJlYWRWaWV3IGhhbmRsZXMgQWN0aW9uLkNvbXBvc2VySW5zZXJ0IGl0c2VsZiBkdWUgdG8gaXQgaGF2aW5nIGl0cyBvd24gZWRpdFN0YXRlXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoICYmXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IGhhdmUgdGhlIGNvbXBvc2VyIHJlbmRlcmVkIGluIHRoaXMgc3RhdGUsIHNvIGJyaW5nIGl0IGJhY2sgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5vbkNhbmNlbFNlYXJjaENsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHJlLWRpc3BhdGNoIHRvIHRoZSBjb3JyZWN0IGNvbXBvc2VyXG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPENvbXBvc2VySW5zZXJ0UGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICAuLi4ocGF5bG9hZCBhcyBDb21wb3Nlckluc2VydFBheWxvYWQpLFxuICAgICAgICAgICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvc2VyVHlwZTogdGhpcy5zdGF0ZS5lZGl0U3RhdGUgPyBDb21wb3NlclR5cGUuRWRpdCA6IENvbXBvc2VyVHlwZS5TZW5kLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5Gb2N1c0FDb21wb3Nlcjoge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxGb2N1c0NvbXBvc2VyUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICAuLi4ocGF5bG9hZCBhcyBGb2N1c0NvbXBvc2VyUGF5bG9hZCksXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlLWRpc3BhdGNoIHRvIHRoZSBjb3JyZWN0IGNvbXBvc2VyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5zdGF0ZS5lZGl0U3RhdGUgPyBBY3Rpb24uRm9jdXNFZGl0TWVzc2FnZUNvbXBvc2VyIDogQWN0aW9uLkZvY3VzU2VuZE1lc3NhZ2VDb21wb3NlcixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSBcInNjcm9sbF90b19ib3R0b21cIjpcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC50aW1lbGluZVJlbmRlcmluZ1R5cGUgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZVBhbmVsPy5qdW1wVG9MaXZlVGltZWxpbmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkxvY2FsUm9vbUV2ZW50KHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIGlmIChyb29tSWQgIT09IHRoaXMuc3RhdGUucm9vbS5yb29tSWQpIHJldHVybjtcbiAgICAgICAgY3JlYXRlUm9vbUZyb21Mb2NhbFJvb20odGhpcy5wcm9wcy5teENsaWVudCwgdGhpcy5zdGF0ZS5yb29tIGFzIExvY2FsUm9vbSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJvb21UaW1lbGluZSA9IChldjogTWF0cml4RXZlbnQsIHJvb206IFJvb20gfCBudWxsLCB0b1N0YXJ0T2ZUaW1lbGluZTogYm9vbGVhbiwgcmVtb3ZlZCwgZGF0YSkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciByb29tcyBvciB0aGUgbm90aWZpY2F0aW9uIHRpbWVsaW5lIHNldFxuICAgICAgICBpZiAoIXJvb20gfHwgcm9vbS5yb29tSWQgIT09IHRoaXMuc3RhdGUucm9vbT8ucm9vbUlkKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWdub3JlIGV2ZW50cyBmcm9tIGZpbHRlcmVkIHRpbWVsaW5lc1xuICAgICAgICBpZiAoZGF0YS50aW1lbGluZS5nZXRUaW1lbGluZVNldCgpICE9PSByb29tLmdldFVuZmlsdGVyZWRUaW1lbGluZVNldCgpKSByZXR1cm47XG5cbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gXCJvcmcubWF0cml4LnJvb20ucHJldmlld191cmxzXCIpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlld1VybFZpc2liaWxpdHkocm9vbSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5lbmNyeXB0aW9uXCIpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRTJFU3RhdHVzKHJvb20pO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3VXJsVmlzaWJpbGl0eShyb29tKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlnbm9yZSBhbnl0aGluZyBidXQgcmVhbC10aW1lIHVwZGF0ZXMgYXQgdGhlIGVuZCBvZiB0aGUgcm9vbTpcbiAgICAgICAgLy8gdXBkYXRlcyBmcm9tIHBhZ2luYXRpb24gd2lsbCBoYXBwZW4gd2hlbiB0aGUgcGFnaW5hdGUgY29tcGxldGVzLlxuICAgICAgICBpZiAodG9TdGFydE9mVGltZWxpbmUgfHwgIWRhdGEgfHwgIWRhdGEubGl2ZUV2ZW50KSByZXR1cm47XG5cbiAgICAgICAgLy8gbm8gcG9pbnQgaGFuZGxpbmcgYW55dGhpbmcgd2hpbGUgd2UncmUgd2FpdGluZyBmb3IgdGhlIGpvaW4gdG8gZmluaXNoOlxuICAgICAgICAvLyB3ZSdsbCBvbmx5IGJlIHNob3dpbmcgYSBzcGlubmVyLlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5qb2luaW5nKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCFldi5pc0JlaW5nRGVjcnlwdGVkKCkgJiYgIWV2LmlzRGVjcnlwdGlvbkZhaWx1cmUoKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFZmZlY3RzKGV2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldi5nZXRTZW5kZXIoKSAhPT0gdGhpcy5jb250ZXh0LmNyZWRlbnRpYWxzLnVzZXJJZCkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHVucmVhZCBjb3VudCB3aGVuIHNjcm9sbGVkIHVwXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cyAmJiB0aGlzLnN0YXRlLmF0RW5kT2ZMaXZlVGltZWxpbmUpIHtcbiAgICAgICAgICAgICAgICAvLyBubyBjaGFuZ2VcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXNob3VsZEhpZGVFdmVudChldiwgdGhpcy5zdGF0ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKChzdGF0ZSwgcHJvcHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgbnVtVW5yZWFkTWVzc2FnZXM6IHN0YXRlLm51bVVucmVhZE1lc3NhZ2VzICsgMSB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FdmVudERlY3J5cHRlZCA9IChldjogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20gfHwgIXRoaXMuc3RhdGUubWF0cml4Q2xpZW50SXNSZWFkeSkgcmV0dXJuOyAvLyBub3QgcmVhZHkgYXQgYWxsXG4gICAgICAgIGlmIChldi5nZXRSb29tSWQoKSAhPT0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZCkgcmV0dXJuOyAvLyBub3QgZm9yIHVzXG4gICAgICAgIGlmIChldi5pc0RlY3J5cHRpb25GYWlsdXJlKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5oYW5kbGVFZmZlY3RzKGV2KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBoYW5kbGVFZmZlY3RzID0gKGV2OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBub3RpZlN0YXRlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHRoaXMuc3RhdGUucm9vbSk7XG4gICAgICAgIGlmICghbm90aWZTdGF0ZS5pc1VucmVhZCkgcmV0dXJuO1xuXG4gICAgICAgIENIQVRfRUZGRUNUUy5mb3JFYWNoKGVmZmVjdCA9PiB7XG4gICAgICAgICAgICBpZiAoY29udGFpbnNFbW9qaShldi5nZXRDb250ZW50KCksIGVmZmVjdC5lbW9qaXMpIHx8IGV2LmdldENvbnRlbnQoKS5tc2d0eXBlID09PSBlZmZlY3QubXNnVHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIEZvciBpbml0aWFsIHRocmVhZHMgbGF1bmNoLCBjaGF0IGVmZmVjdHMgYXJlIGRpc2FibGVkIHNlZSAjMTk3MzFcbiAgICAgICAgICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3RocmVhZFwiKSB8fCAhZXYuaXNSZWxhdGlvbihUSFJFQURfUkVMQVRJT05fVFlQRS5uYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IGBlZmZlY3RzLiR7ZWZmZWN0LmNvbW1hbmR9YCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbU5hbWUgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tICYmIHJvb20ucm9vbUlkID09IHRoaXMuc3RhdGUucm9vbS5yb29tSWQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5QmFja3VwU3RhdHVzID0gKCkgPT4ge1xuICAgICAgICAvLyBLZXkgYmFja3VwIHN0YXR1cyBjaGFuZ2VzIGFmZmVjdCB3aGV0aGVyIHRoZSBpbi1yb29tIHJlY292ZXJ5XG4gICAgICAgIC8vIHJlbWluZGVyIGlzIGRpc3BsYXllZC5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgY2FuUmVzZXRUaW1lbGluZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2VQYW5lbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZVBhbmVsLmNhblJlc2V0VGltZWxpbmUoKTtcbiAgICB9O1xuXG4gICAgLy8gY2FsbGVkIHdoZW4gc3RhdGUucm9vbSBpcyBmaXJzdCBpbml0aWFsaXNlZCAoZWl0aGVyIGF0IGluaXRpYWwgbG9hZCxcbiAgICAvLyBhZnRlciBhIHN1Y2Nlc3NmdWwgcGVlaywgb3IgYWZ0ZXIgd2Ugam9pbiB0aGUgcm9vbSkuXG4gICAgcHJpdmF0ZSBvblJvb21Mb2FkZWQgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgLy8gQXR0YWNoIGEgd2lkZ2V0IHN0b3JlIGxpc3RlbmVyIG9ubHkgd2hlbiB3ZSBnZXQgYSByb29tXG4gICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm9uKFdpZGdldExheW91dFN0b3JlLmVtaXNzaW9uRm9yUm9vbShyb29tKSwgdGhpcy5vbldpZGdldExheW91dENoYW5nZSk7XG5cbiAgICAgICAgdGhpcy5jYWxjdWxhdGVQZWVrUnVsZXMocm9vbSk7XG4gICAgICAgIHRoaXMudXBkYXRlUHJldmlld1VybFZpc2liaWxpdHkocm9vbSk7XG4gICAgICAgIHRoaXMubG9hZE1lbWJlcnNJZkpvaW5lZChyb29tKTtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVSZWNvbW1lbmRlZFZlcnNpb24ocm9vbSk7XG4gICAgICAgIHRoaXMudXBkYXRlRTJFU3RhdHVzKHJvb20pO1xuICAgICAgICB0aGlzLnVwZGF0ZVBlcm1pc3Npb25zKHJvb20pO1xuICAgICAgICB0aGlzLmNoZWNrV2lkZ2V0cyhyb29tKTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLmdldE1haW5TcGxpdENvbnRlbnRUeXBlKHJvb20pICE9PSBNYWluU3BsaXRDb250ZW50VHlwZS5UaW1lbGluZVxuICAgICAgICAgICAgJiYgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHJvb20pLmlzVW5yZWFkXG4gICAgICAgICkge1xuICAgICAgICAgICAgLy8gQXV0b21hdGljYWxseSBvcGVuIHRoZSBjaGF0IHBhbmVsIHRvIG1ha2UgdW5yZWFkIG1lc3NhZ2VzIGVhc2llciB0byBkaXNjb3ZlclxuICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnNldENhcmQoeyBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5UaW1lbGluZSB9LCB0cnVlLCByb29tLnJvb21JZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRvbWJzdG9uZTogdGhpcy5nZXRSb29tVG9tYnN0b25lKHJvb20pLFxuICAgICAgICAgICAgbGl2ZVRpbWVsaW5lOiByb29tLmdldExpdmVUaW1lbGluZSgpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21UaW1lbGluZVJlc2V0ID0gKHJvb206IFJvb20sIHRpbWVsaW5lU2V0OiBFdmVudFRpbWVsaW5lU2V0KSA9PiB7XG4gICAgICAgIGlmICghcm9vbSB8fCByb29tLnJvb21JZCAhPT0gdGhpcy5zdGF0ZS5yb29tPy5yb29tSWQpIHJldHVybjtcbiAgICAgICAgbG9nZ2VyLmxvZyhgTGl2ZSB0aW1lbGluZSBvZiAke3Jvb20ucm9vbUlkfSB3YXMgcmVzZXRgKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxpdmVUaW1lbGluZTogdGltZWxpbmVTZXQuZ2V0TGl2ZVRpbWVsaW5lKCkgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0Um9vbVRvbWJzdG9uZShyb29tID0gdGhpcy5zdGF0ZS5yb29tKSB7XG4gICAgICAgIHJldHVybiByb29tPy5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21Ub21ic3RvbmUsIFwiXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY2FsY3VsYXRlUmVjb21tZW5kZWRWZXJzaW9uKHJvb206IFJvb20pIHtcbiAgICAgICAgY29uc3QgdXBncmFkZVJlY29tbWVuZGF0aW9uID0gYXdhaXQgcm9vbS5nZXRSZWNvbW1lbmRlZFZlcnNpb24oKTtcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1cGdyYWRlUmVjb21tZW5kYXRpb24gfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkTWVtYmVyc0lmSm9pbmVkKHJvb206IFJvb20pIHtcbiAgICAgICAgLy8gbGF6eSBsb2FkIG1lbWJlcnMgaWYgZW5hYmxlZFxuICAgICAgICBpZiAodGhpcy5jb250ZXh0Lmhhc0xhenlMb2FkTWVtYmVyc0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgaWYgKHJvb20gJiYgcm9vbS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gJ2pvaW4nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgcm9vbS5sb2FkTWVtYmVyc0lmTmVlZGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZW1iZXJzTG9hZGVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBGZXRjaGluZyByb29tIG1lbWJlcnMgZm9yICR7cm9vbS5yb29tSWR9IGZhaWxlZC5gICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIFJvb20gbWVtYmVycyB3aWxsIGFwcGVhciBpbmNvbXBsZXRlLlwiO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVQZWVrUnVsZXMocm9vbTogUm9vbSkge1xuICAgICAgICBjb25zdCBoaXN0b3J5VmlzaWJpbGl0eSA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tSGlzdG9yeVZpc2liaWxpdHksIFwiXCIpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNhblBlZWs6IGhpc3RvcnlWaXNpYmlsaXR5Py5nZXRDb250ZW50KCkuaGlzdG9yeV92aXNpYmlsaXR5ID09PSBIaXN0b3J5VmlzaWJpbGl0eS5Xb3JsZFJlYWRhYmxlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVByZXZpZXdVcmxWaXNpYmlsaXR5KHsgcm9vbUlkIH06IFJvb20pIHtcbiAgICAgICAgLy8gVVJMIFByZXZpZXdzIGluIEUyRUUgcm9vbXMgY2FuIGJlIGEgcHJpdmFjeSBsZWFrIHNvIHVzZSBhIGRpZmZlcmVudCBzZXR0aW5nIHdoaWNoIGlzIHBlci1yb29tIGV4cGxpY2l0XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuY29udGV4dC5pc1Jvb21FbmNyeXB0ZWQocm9vbUlkKSA/ICd1cmxQcmV2aWV3c0VuYWJsZWRfZTJlZScgOiAndXJsUHJldmlld3NFbmFibGVkJztcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaG93VXJsUHJldmlldzogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShrZXksIHJvb21JZCksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Sb29tID0gKHJvb206IFJvb20pID0+IHtcbiAgICAgICAgaWYgKCFyb29tIHx8IHJvb20ucm9vbUlkICE9PSB0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0YWNoIHRoZSBsaXN0ZW5lciBpZiB0aGUgcm9vbSBpcyBjaGFuZ2luZyBmb3Igc29tZSByZWFzb25cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbSkge1xuICAgICAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2Uub2ZmKFxuICAgICAgICAgICAgICAgIFdpZGdldExheW91dFN0b3JlLmVtaXNzaW9uRm9yUm9vbSh0aGlzLnN0YXRlLnJvb20pLFxuICAgICAgICAgICAgICAgIHRoaXMub25XaWRnZXRMYXlvdXRDaGFuZ2UsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uUm9vbUxvYWRlZChyb29tKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkID0gKHVzZXJJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnN0YXRlLnJvb207XG4gICAgICAgIGlmICghcm9vbS5jdXJyZW50U3RhdGUuZ2V0TWVtYmVyKHVzZXJJZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyhyb29tKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkID0gKHVzZXJJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnN0YXRlLnJvb207XG4gICAgICAgIGlmICghcm9vbSB8fCAhcm9vbS5jdXJyZW50U3RhdGUuZ2V0TWVtYmVyKHVzZXJJZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyhyb29tKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNyb3NzU2lnbmluZ0tleXNDaGFuZ2VkID0gKCkgPT4ge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5zdGF0ZS5yb29tO1xuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVFMkVTdGF0dXMocm9vbSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyB1cGRhdGVFMkVTdGF0dXMocm9vbTogUm9vbSkge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dC5pc1Jvb21FbmNyeXB0ZWQocm9vbS5yb29tSWQpKSByZXR1cm47XG5cbiAgICAgICAgLy8gSWYgY3J5cHRvIGlzIG5vdCBjdXJyZW50bHkgZW5hYmxlZCwgd2UgYXJlbid0IHRyYWNraW5nIGRldmljZXMgYXQgYWxsLFxuICAgICAgICAvLyBzbyB3ZSBkb24ndCBrbm93IHdoYXQgdGhlIGFuc3dlciBpcy4gTGV0J3MgZXJyb3Igb24gdGhlIHNhZmUgc2lkZSBhbmQgc2hvd1xuICAgICAgICAvLyBhIHdhcm5pbmcgZm9yIHRoaXMgY2FzZS5cbiAgICAgICAgbGV0IGUyZVN0YXR1cyA9IEUyRVN0YXR1cy5XYXJuaW5nO1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0LmlzQ3J5cHRvRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAvKiBBdCB0aGlzIHBvaW50LCB0aGUgdXNlciBoYXMgZW5jcnlwdGlvbiBvbiBhbmQgY3Jvc3Mtc2lnbmluZyBvbiAqL1xuICAgICAgICAgICAgZTJlU3RhdHVzID0gYXdhaXQgc2hpZWxkU3RhdHVzRm9yUm9vbSh0aGlzLmNvbnRleHQsIHJvb20pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlMmVTdGF0dXMgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblVybFByZXZpZXdzRW5hYmxlZENoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3VXJsVmlzaWJpbGl0eSh0aGlzLnN0YXRlLnJvb20pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVFdmVudHMgPSAoZXY6IE1hdHJpeEV2ZW50LCBzdGF0ZTogUm9vbVN0YXRlKSA9PiB7XG4gICAgICAgIC8vIGlnbm9yZSBpZiB3ZSBkb24ndCBoYXZlIGEgcm9vbSB5ZXRcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20gfHwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCAhPT0gc3RhdGUucm9vbUlkKSByZXR1cm47XG5cbiAgICAgICAgc3dpdGNoIChldi5nZXRUeXBlKCkpIHtcbiAgICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJvb21Ub21ic3RvbmU6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRvbWJzdG9uZTogdGhpcy5nZXRSb29tVG9tYnN0b25lKCkgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQZXJtaXNzaW9ucyh0aGlzLnN0YXRlLnJvb20pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVVcGRhdGUgPSAoc3RhdGU6IFJvb21TdGF0ZSkgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgbWVtYmVycyBpbiBvdGhlciByb29tc1xuICAgICAgICBpZiAoc3RhdGUucm9vbUlkICE9PSB0aGlzLnN0YXRlLnJvb20/LnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVSb29tTWVtYmVycygpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTXlNZW1iZXJzaGlwID0gKHJvb206IFJvb20sIG1lbWJlcnNoaXA6IHN0cmluZywgb2xkTWVtYmVyc2hpcDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChyb29tLnJvb21JZCA9PT0gdGhpcy5zdGF0ZS5yb29tSWQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMubG9hZE1lbWJlcnNJZkpvaW5lZChyb29tKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGVybWlzc2lvbnMocm9vbSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVQZXJtaXNzaW9ucyhyb29tOiBSb29tKSB7XG4gICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXMuY29udGV4dC5nZXRVc2VySWQoKTtcbiAgICAgICAgICAgIGNvbnN0IGNhblJlYWN0ID0gKFxuICAgICAgICAgICAgICAgIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiICYmXG4gICAgICAgICAgICAgICAgcm9vbS5jdXJyZW50U3RhdGUubWF5U2VuZEV2ZW50KEV2ZW50VHlwZS5SZWFjdGlvbiwgbWUpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgY2FuU2VuZE1lc3NhZ2VzID0gcm9vbS5tYXlTZW5kTWVzc2FnZSgpO1xuICAgICAgICAgICAgY29uc3QgY2FuU2VsZlJlZGFjdCA9IHJvb20uY3VycmVudFN0YXRlLm1heVNlbmRFdmVudChFdmVudFR5cGUuUm9vbVJlZGFjdGlvbiwgbWUpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY2FuUmVhY3QsIGNhblNlbmRNZXNzYWdlcywgY2FuU2VsZlJlZGFjdCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJhdGUgbGltaXRlZCBiZWNhdXNlIGEgcG93ZXIgbGV2ZWwgY2hhbmdlIHdpbGwgZW1pdCBhbiBldmVudCBmb3IgZXZlcnkgbWVtYmVyIGluIHRoZSByb29tLlxuICAgIHByaXZhdGUgdXBkYXRlUm9vbU1lbWJlcnMgPSB0aHJvdHRsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlRE1TdGF0ZSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyh0aGlzLnN0YXRlLnJvb20pO1xuICAgIH0sIDUwMCwgeyBsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogdHJ1ZSB9KTtcblxuICAgIHByaXZhdGUgY2hlY2tEZXNrdG9wTm90aWZpY2F0aW9ucygpIHtcbiAgICAgICAgY29uc3QgbWVtYmVyQ291bnQgPSB0aGlzLnN0YXRlLnJvb20uZ2V0Sm9pbmVkTWVtYmVyQ291bnQoKSArIHRoaXMuc3RhdGUucm9vbS5nZXRJbnZpdGVkTWVtYmVyQ291bnQoKTtcbiAgICAgICAgLy8gaWYgdGhleSBhcmUgbm90IGFsb25lIHByb21wdCB0aGUgdXNlciBhYm91dCBub3RpZmljYXRpb25zIHNvIHRoZXkgZG9uJ3QgbWlzcyByZXBsaWVzXG4gICAgICAgIGlmIChtZW1iZXJDb3VudCA+IDEgJiYgTm90aWZpZXIuc2hvdWxkU2hvd1Byb21wdCgpKSB7XG4gICAgICAgICAgICBzaG93Tm90aWZpY2F0aW9uc1RvYXN0KHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVETVN0YXRlKCkge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5zdGF0ZS5yb29tO1xuICAgICAgICBpZiAocm9vbS5nZXRNeU1lbWJlcnNoaXAoKSAhPSBcImpvaW5cIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRtSW52aXRlciA9IHJvb20uZ2V0RE1JbnZpdGVyKCk7XG4gICAgICAgIGlmIChkbUludml0ZXIpIHtcbiAgICAgICAgICAgIFJvb21zLnNldERNUm9vbShyb29tLnJvb21JZCwgZG1JbnZpdGVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25TZWFyY2hSZXN1bHRzRmlsbFJlcXVlc3QgPSAoYmFja3dhcmRzOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgIGlmICghYmFja3dhcmRzKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubmV4dF9iYXRjaCkge1xuICAgICAgICAgICAgZGVidWdsb2coXCJyZXF1ZXN0aW5nIG1vcmUgc2VhcmNoIHJlc3VsdHNcIik7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2hQcm9taXNlID0gc2VhcmNoUGFnaW5hdGlvbih0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMgYXMgSVNlYXJjaFJlc3VsdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VhcmNoUmVzdWx0KHNlYXJjaFByb21pc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVidWdsb2coXCJubyBtb3JlIHNlYXJjaCByZXN1bHRzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkludml0ZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICAvLyBvcGVuIHRoZSByb29tIGludml0ZXJcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfaW52aXRlJyxcbiAgICAgICAgICAgIHJvb21JZDogdGhpcy5zdGF0ZS5yb29tLnJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Kb2luQnV0dG9uQ2xpY2tlZCA9ICgpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgYSBST1UsIGFsbG93IHRoZW0gdG8gdHJhbnNpdGlvbiB0byBhIFBXTFVcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dD8uaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICAvLyBKb2luIHRoaXMgcm9vbSBvbmNlIHRoZSB1c2VyIGhhcyByZWdpc3RlcmVkIGFuZCBsb2dnZWQgaW5cbiAgICAgICAgICAgIC8vIChJZiB3ZSBmYWlsZWQgdG8gcGVlaywgd2UgbWF5IG5vdCBoYXZlIGEgdmFsaWQgcm9vbSBvYmplY3QuKVxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPERvQWZ0ZXJTeW5jUHJlcGFyZWRQYXlsb2FkPFZpZXdSb29tUGF5bG9hZD4+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Eb0FmdGVyU3luY1ByZXBhcmVkLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5nZXRSb29tSWQoKSxcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbicgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWduVXJsID0gdGhpcy5wcm9wcy50aHJlZXBpZEludml0ZT8uc2lnblVybDtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Sm9pblJvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkpvaW5Sb29tLFxuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IHRoaXMuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgIG9wdHM6IHsgaW52aXRlU2lnblVybDogc2lnblVybCB9LFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogdGhpcy5zdGF0ZS5yb29tPy5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJpbnZpdGVcIiA/IFwiSW52aXRlXCIgOiBcIlJvb21QcmV2aWV3XCIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1lc3NhZ2VMaXN0U2Nyb2xsID0gZXYgPT4ge1xuICAgICAgICBpZiAodGhpcy5tZXNzYWdlUGFuZWwuaXNBdEVuZE9mTGl2ZVRpbWVsaW5lKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIG51bVVucmVhZE1lc3NhZ2VzOiAwLFxuICAgICAgICAgICAgICAgIGF0RW5kT2ZMaXZlVGltZWxpbmU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGF0RW5kT2ZMaXZlVGltZWxpbmU6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVUb3BVbnJlYWRNZXNzYWdlc0JhcigpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlc2V0SnVtcFRvRXZlbnQgPSAoZXZlbnRJZD86IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRJZCAmJiB0aGlzLnN0YXRlLmluaXRpYWxFdmVudFNjcm9sbEludG9WaWV3ICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmluaXRpYWxFdmVudElkID09PSBldmVudElkKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIlJlbW92aW5nIHNjcm9sbF9pbnRvX3ZpZXcgZmxhZyBmcm9tIGluaXRpYWwgZXZlbnRcIik7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5zdGF0ZS5yb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICBldmVudF9pZDogdGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRJZCxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRlZDogdGhpcy5zdGF0ZS5pc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkLFxuICAgICAgICAgICAgICAgIHNjcm9sbF9pbnRvX3ZpZXc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlcGx5aW5nVG9FdmVudDogdGhpcy5zdGF0ZS5yZXBseVRvRXZlbnQsXG4gICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IHVuZGVmaW5lZCwgLy8gcm9vbSBkb2Vzbid0IGNoYW5nZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpbmplY3RTdGlja2VyKHVybDogc3RyaW5nLCBpbmZvOiBvYmplY3QsIHRleHQ6IHN0cmluZywgdGhyZWFkSWQ6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dC5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJyB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIENvbnRlbnRNZXNzYWdlcy5zaGFyZWRJbnN0YW5jZSgpXG4gICAgICAgICAgICAuc2VuZFN0aWNrZXJDb250ZW50VG9Sb29tKHVybCwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCwgdGhyZWFkSWQsIGluZm8sIHRleHQsIHRoaXMuY29udGV4dClcbiAgICAgICAgICAgIC50aGVuKHVuZGVmaW5lZCwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLm5hbWUgPT09IFwiVW5rbm93bkRldmljZUVycm9yXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTGV0IHRoZSBzdGF1cyBiYXIgaGFuZGxlIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TZWFyY2ggPSAodGVybTogc3RyaW5nLCBzY29wZTogU2VhcmNoU2NvcGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hUZXJtOiB0ZXJtLFxuICAgICAgICAgICAgc2VhcmNoU2NvcGU6IHNjb3BlLFxuICAgICAgICAgICAgc2VhcmNoUmVzdWx0czoge30sXG4gICAgICAgICAgICBzZWFyY2hIaWdobGlnaHRzOiBbXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gaWYgd2UgYWxyZWFkeSBoYXZlIGEgc2VhcmNoIHBhbmVsLCB3ZSBuZWVkIHRvIHRlbGwgaXQgdG8gZm9yZ2V0XG4gICAgICAgIC8vIGFib3V0IGl0cyBzY3JvbGwgc3RhdGUuXG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHNQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaFJlc3VsdHNQYW5lbC5jdXJyZW50LnJlc2V0U2Nyb2xsU3RhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIGRvbid0IGVuZCB1cCBzaG93aW5nIHJlc3VsdHMgZnJvbVxuICAgICAgICAvLyBhbiBhYm9ydGVkIHNlYXJjaCBieSBrZWVwaW5nIGEgdW5pcXVlIGlkLlxuICAgICAgICAvL1xuICAgICAgICAvLyB0b2RvOiBzaG91bGQgY2FuY2VsIGFueSBwcmV2aW91cyBzZWFyY2ggcmVxdWVzdHMuXG4gICAgICAgIHRoaXMuc2VhcmNoSWQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICBsZXQgcm9vbUlkO1xuICAgICAgICBpZiAoc2NvcGUgPT09IFNlYXJjaFNjb3BlLlJvb20pIHJvb21JZCA9IHRoaXMuc3RhdGUucm9vbS5yb29tSWQ7XG5cbiAgICAgICAgZGVidWdsb2coXCJzZW5kaW5nIHNlYXJjaCByZXF1ZXN0XCIpO1xuICAgICAgICBjb25zdCBzZWFyY2hQcm9taXNlID0gZXZlbnRTZWFyY2godGVybSwgcm9vbUlkKTtcbiAgICAgICAgdGhpcy5oYW5kbGVTZWFyY2hSZXN1bHQoc2VhcmNoUHJvbWlzZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgaGFuZGxlU2VhcmNoUmVzdWx0KHNlYXJjaFByb21pc2U6IFByb21pc2U8SVNlYXJjaFJlc3VsdHM+KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIC8vIGtlZXAgYSByZWNvcmQgb2YgdGhlIGN1cnJlbnQgc2VhcmNoIGlkLCBzbyB0aGF0IGlmIHRoZSBzZWFyY2ggdGVybXNcbiAgICAgICAgLy8gY2hhbmdlIGJlZm9yZSB3ZSBnZXQgYSByZXNwb25zZSwgd2UgY2FuIGlnbm9yZSB0aGUgcmVzdWx0cy5cbiAgICAgICAgY29uc3QgbG9jYWxTZWFyY2hJZCA9IHRoaXMuc2VhcmNoSWQ7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hJblByb2dyZXNzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VhcmNoUHJvbWlzZS50aGVuKGFzeW5jIChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInNlYXJjaCBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCB8fFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hJZCAhPSBsb2NhbFNlYXJjaElkXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJEaXNjYXJkaW5nIHN0YWxlIHNlYXJjaCByZXN1bHRzXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcG9zdGdyZXMgb24gc3luYXBzZSByZXR1cm5zIHVzIHByZWNpc2UgZGV0YWlscyBvZiB0aGUgc3RyaW5nc1xuICAgICAgICAgICAgLy8gd2hpY2ggYWN0dWFsbHkgZ290IG1hdGNoZWQgZm9yIGhpZ2hsaWdodGluZy5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBJbiBlaXRoZXIgY2FzZSwgd2Ugd2FudCB0byBoaWdobGlnaHQgdGhlIGxpdGVyYWwgc2VhcmNoIHRlcm1cbiAgICAgICAgICAgIC8vIHdoZXRoZXIgaXQgd2FzIHVzZWQgYnkgdGhlIHNlYXJjaCBlbmdpbmUgb3Igbm90LlxuXG4gICAgICAgICAgICBsZXQgaGlnaGxpZ2h0cyA9IHJlc3VsdHMuaGlnaGxpZ2h0cztcbiAgICAgICAgICAgIGlmIChoaWdobGlnaHRzLmluZGV4T2YodGhpcy5zdGF0ZS5zZWFyY2hUZXJtKSA8IDApIHtcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRzID0gaGlnaGxpZ2h0cy5jb25jYXQodGhpcy5zdGF0ZS5zZWFyY2hUZXJtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9yIG92ZXJsYXBwaW5nIGhpZ2hsaWdodHMsXG4gICAgICAgICAgICAvLyBmYXZvdXIgbG9uZ2VyIChtb3JlIHNwZWNpZmljKSB0ZXJtcyBmaXJzdFxuICAgICAgICAgICAgaGlnaGxpZ2h0cyA9IGhpZ2hsaWdodHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGIubGVuZ3RoIC0gYS5sZW5ndGg7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dC5zdXBwb3J0c0V4cGVyaW1lbnRhbFRocmVhZHMoKSkge1xuICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgYWxsIHRocmVhZCByb290cyByZXR1cm5lZCBpbiB0aGlzIGJhdGNoIG9mIHNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICAgICAgLy8gWFhYOiBUaGlzIHdvbid0IHdvcmsgZm9yIHJlc3VsdHMgY29taW5nIGZyb20gU2VzaGF0IHdoaWNoIHdvbid0IGluY2x1ZGUgdGhlIGJ1bmRsZWQgcmVsYXRpb25zaGlwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cy5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgcmVzdWx0LmNvbnRleHQuZ2V0VGltZWxpbmUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVuZGxlZFJlbGF0aW9uc2hpcCA9IGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmdldFNlcnZlckFnZ3JlZ2F0ZWRSZWxhdGlvbjxJVGhyZWFkQnVuZGxlZFJlbGF0aW9uc2hpcD4oVEhSRUFEX1JFTEFUSU9OX1RZUEUubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJ1bmRsZWRSZWxhdGlvbnNoaXAgfHwgZXZlbnQuZ2V0VGhyZWFkKCkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKGV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRocmVhZCA9IHJvb20uZmluZFRocmVhZEZvckV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aHJlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zZXRUaHJlYWQodGhyZWFkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbS5jcmVhdGVUaHJlYWQoZXZlbnQuZ2V0SWQoKSwgZXZlbnQsIFtdLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2VhcmNoSGlnaGxpZ2h0czogaGlnaGxpZ2h0cyxcbiAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRzOiByZXN1bHRzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiU2VhcmNoIGZhaWxlZFwiLCBlcnJvcik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJTZWFyY2ggZmFpbGVkXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVycm9yICYmIGVycm9yLm1lc3NhZ2UpID8gZXJyb3IubWVzc2FnZSA6XG4gICAgICAgICAgICAgICAgICAgIF90KFwiU2VydmVyIG1heSBiZSB1bmF2YWlsYWJsZSwgb3ZlcmxvYWRlZCwgb3Igc2VhcmNoIHRpbWVkIG91dCA6KFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWFyY2hJblByb2dyZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFNlYXJjaFJlc3VsdFRpbGVzKCkge1xuICAgICAgICAvLyBYWFg6IHRvZG86IG1lcmdlIG92ZXJsYXBwaW5nIHJlc3VsdHMgc29tZWhvdz9cbiAgICAgICAgLy8gWFhYOiB3aHkgZG9lc24ndCBzZWFyY2hpbmcgb24gbmFtZSB3b3JrP1xuXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaEluUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKDxsaSBrZXk9XCJzZWFyY2gtc3Bpbm5lclwiPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICA8L2xpPik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5uZXh0X2JhdGNoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cz8ucmVzdWx0cz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goPGxpIGtleT1cInNlYXJjaC10b3AtbWFya2VyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJteF9Sb29tVmlld190b3BNYXJrZXJcIj57IF90KFwiTm8gcmVzdWx0c1wiKSB9PC9oMj5cbiAgICAgICAgICAgICAgICA8L2xpPixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXQucHVzaCg8bGkga2V5PVwic2VhcmNoLXRvcC1tYXJrZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X3RvcE1hcmtlclwiPnsgX3QoXCJObyBtb3JlIHJlc3VsdHNcIikgfTwvaDI+XG4gICAgICAgICAgICAgICAgPC9saT4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9uY2UgZHluYW1pYyBjb250ZW50IGluIHRoZSBzZWFyY2ggcmVzdWx0cyBsb2FkLCBtYWtlIHRoZSBzY3JvbGxQYW5lbCBjaGVja1xuICAgICAgICAvLyB0aGUgc2Nyb2xsIG9mZnNldHMuXG4gICAgICAgIGNvbnN0IG9uSGVpZ2h0Q2hhbmdlZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFBhbmVsID0gdGhpcy5zZWFyY2hSZXN1bHRzUGFuZWwuY3VycmVudDtcbiAgICAgICAgICAgIGlmIChzY3JvbGxQYW5lbCkge1xuICAgICAgICAgICAgICAgIHNjcm9sbFBhbmVsLmNoZWNrU2Nyb2xsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGxhc3RSb29tSWQ7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9ICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHM/LnJlc3VsdHM/Lmxlbmd0aCB8fCAwKSAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMucmVzdWx0c1tpXTtcblxuICAgICAgICAgICAgY29uc3QgbXhFdiA9IHJlc3VsdC5jb250ZXh0LmdldEV2ZW50KCk7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBteEV2LmdldFJvb21JZCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBkbyBub3QgaGF2ZSB0aGUgcm9vbSBpbiBqcy1zZGsgc3RvcmVzIHRoZW4gaGlkZSBpdCBhcyB3ZSBjYW5ub3QgZWFzaWx5IHNob3cgaXRcbiAgICAgICAgICAgICAgICAvLyBBcyBwZXIgdGhlIHNwZWMsIGFuIGFsbCByb29tcyBzZWFyY2ggY2FuIGNyZWF0ZSB0aGlzIGNvbmRpdGlvbixcbiAgICAgICAgICAgICAgICAvLyBpdCBoYXBwZW5zIHdpdGggU2VzaGF0IGJ1dCBub3QgU3luYXBzZS5cbiAgICAgICAgICAgICAgICAvLyBJdCB3aWxsIG1ha2UgdGhlIHJlc3VsdCBjb3VudCBub3QgbWF0Y2ggdGhlIGRpc3BsYXllZCBjb3VudC5cbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiSGlkaW5nIHNlYXJjaCByZXN1bHQgZnJvbSBhbiB1bmtub3duIHJvb21cIiwgcm9vbUlkKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFoYXZlUmVuZGVyZXJGb3JFdmVudChteEV2LCB0aGlzLnN0YXRlLnNob3dIaWRkZW5FdmVudHMpKSB7XG4gICAgICAgICAgICAgICAgLy8gWFhYOiBjYW4gdGhpcyBldmVyIGhhcHBlbj8gSXQgd2lsbCBtYWtlIHRoZSByZXN1bHQgY291bnRcbiAgICAgICAgICAgICAgICAvLyBub3QgbWF0Y2ggdGhlIGRpc3BsYXllZCBjb3VudC5cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoU2NvcGUgPT09ICdBbGwnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21JZCAhPT0gbGFzdFJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICByZXQucHVzaCg8bGkga2V5PXtteEV2LmdldElkKCkgKyBcIi1yb29tXCJ9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGgyPnsgX3QoXCJSb29tXCIpIH06IHsgcm9vbS5uYW1lIH08L2gyPlxuICAgICAgICAgICAgICAgICAgICA8L2xpPik7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RSb29tSWQgPSByb29tSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZXN1bHRMaW5rID0gXCIjL3Jvb20vXCIrcm9vbUlkK1wiL1wiK214RXYuZ2V0SWQoKTtcblxuICAgICAgICAgICAgcmV0LnB1c2goPFNlYXJjaFJlc3VsdFRpbGVcbiAgICAgICAgICAgICAgICBrZXk9e214RXYuZ2V0SWQoKX1cbiAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHQ9e3Jlc3VsdH1cbiAgICAgICAgICAgICAgICBzZWFyY2hIaWdobGlnaHRzPXt0aGlzLnN0YXRlLnNlYXJjaEhpZ2hsaWdodHN9XG4gICAgICAgICAgICAgICAgcmVzdWx0TGluaz17cmVzdWx0TGlua31cbiAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgb25IZWlnaHRDaGFuZ2VkPXtvbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICAvPik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2FsbFBsYWNlZCA9ICh0eXBlOiBDYWxsVHlwZSk6IHZvaWQgPT4ge1xuICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5wbGFjZUNhbGwodGhpcy5zdGF0ZS5yb29tPy5yb29tSWQsIHR5cGUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQXBwc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBcImFwcHNEcmF3ZXJcIixcbiAgICAgICAgICAgIHNob3c6ICF0aGlzLnN0YXRlLnNob3dBcHBzLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZvcmdldENsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnZm9yZ2V0X3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5zdGF0ZS5yb29tLnJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWplY3RCdXR0b25DbGlja2VkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJlamVjdGluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5sZWF2ZSh0aGlzLnN0YXRlLnJvb21JZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IEFjdGlvbi5WaWV3SG9tZVBhZ2UgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWplY3Rpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHJlamVjdCBpbnZpdGU6ICVzXCIsIGVycm9yKTtcblxuICAgICAgICAgICAgY29uc3QgbXNnID0gZXJyb3IubWVzc2FnZSA/IGVycm9yLm1lc3NhZ2UgOiBKU09OLnN0cmluZ2lmeShlcnJvcik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8gcmVqZWN0IGludml0ZVwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbXNnLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlamVjdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVqZWN0RXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVqZWN0QW5kSWdub3JlQ2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVqZWN0aW5nOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbXlNZW1iZXIgPSB0aGlzLnN0YXRlLnJvb20uZ2V0TWVtYmVyKHRoaXMuY29udGV4dC5nZXRVc2VySWQoKSk7XG4gICAgICAgICAgICBjb25zdCBpbnZpdGVFdmVudCA9IG15TWVtYmVyLmV2ZW50cy5tZW1iZXI7XG4gICAgICAgICAgICBjb25zdCBpZ25vcmVkVXNlcnMgPSB0aGlzLmNvbnRleHQuZ2V0SWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICBpZ25vcmVkVXNlcnMucHVzaChpbnZpdGVFdmVudC5nZXRTZW5kZXIoKSk7IC8vIGRlLWR1cGVkIGludGVybmFsbHkgaW4gdGhlIGpzLXNka1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jb250ZXh0LnNldElnbm9yZWRVc2VycyhpZ25vcmVkVXNlcnMpO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRleHQubGVhdmUodGhpcy5zdGF0ZS5yb29tSWQpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBBY3Rpb24uVmlld0hvbWVQYWdlIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVqZWN0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHJlamVjdCBpbnZpdGU6ICVzXCIsIGVycm9yKTtcblxuICAgICAgICAgICAgY29uc3QgbXNnID0gZXJyb3IubWVzc2FnZSA/IGVycm9yLm1lc3NhZ2UgOiBKU09OLnN0cmluZ2lmeShlcnJvcik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8gcmVqZWN0IGludml0ZVwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbXNnLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlamVjdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVqZWN0RXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlamVjdFRocmVlcGlkSW52aXRlQnV0dG9uQ2xpY2tlZCA9ICgpID0+IHtcbiAgICAgICAgLy8gV2UgY2FuIHJlamVjdCAzcGlkIGludml0ZXMgaW4gdGhlIHNhbWUgd2F5IHRoYXQgd2UgYWNjZXB0IHRoZW0sXG4gICAgICAgIC8vIHVzaW5nIC9sZWF2ZSByYXRoZXIgdGhhbiAvam9pbi4gSW4gdGhlIHNob3J0IHRlcm0gdGhvdWdoLCB3ZVxuICAgICAgICAvLyBqdXN0IGlnbm9yZSB0aGVtLlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL3ZlY3Rvci13ZWIvaXNzdWVzLzExMzRcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdSb29tRGlyZWN0b3J5KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNlYXJjaENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRpbWVsaW5lUmVuZGVyaW5nVHlwZTogdGhpcy5zdGF0ZS50aW1lbGluZVJlbmRlcmluZ1R5cGUgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5TZWFyY2hcbiAgICAgICAgICAgICAgICA/IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tXG4gICAgICAgICAgICAgICAgOiBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbFNlYXJjaENsaWNrID0gKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tLFxuICAgICAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6IG51bGwsXG4gICAgICAgICAgICB9LCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIGp1bXAgZG93biB0byB0aGUgYm90dG9tIG9mIHRoaXMgcm9vbSwgd2hlcmUgbmV3IGV2ZW50cyBhcmUgYXJyaXZpbmdcbiAgICBwcml2YXRlIGp1bXBUb0xpdmVUaW1lbGluZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaW5pdGlhbEV2ZW50SWQgJiYgdGhpcy5zdGF0ZS5pc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSB3ZXJlIHZpZXdpbmcgYSBoaWdobGlnaHRlZCBldmVudCwgZmlyaW5nIHZpZXdfcm9vbSB3aXRob3V0XG4gICAgICAgICAgICAvLyBhbiBldmVudCB3aWxsIHRha2UgY2FyZSBvZiBib3RoIGNsZWFyaW5nIHRoZSBVUkwgZnJhZ21lbnQgYW5kXG4gICAgICAgICAgICAvLyBqdW1waW5nIHRvIHRoZSBib3R0b21cbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICByb29tX2lkOiB0aGlzLnN0YXRlLnJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIHdlIGhhdmUgdG8ganVtcCBtYW51YWxseVxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlUGFuZWwuanVtcFRvTGl2ZVRpbWVsaW5lKCk7XG4gICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNTZW5kTWVzc2FnZUNvbXBvc2VyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBqdW1wIHVwIHRvIHdoZXJldmVyIG91ciByZWFkIG1hcmtlciBpc1xuICAgIHByaXZhdGUganVtcFRvUmVhZE1hcmtlciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlUGFuZWwuanVtcFRvUmVhZE1hcmtlcigpO1xuICAgIH07XG5cbiAgICAvLyB1cGRhdGUgdGhlIHJlYWQgbWFya2VyIHRvIG1hdGNoIHRoZSByZWFkLXJlY2VpcHRcbiAgICBwcml2YXRlIGZvcmdldFJlYWRNYXJrZXIgPSBldiA9PiB7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VQYW5lbC5mb3JnZXRSZWFkTWFya2VyKCk7XG4gICAgfTtcblxuICAgIC8vIGRlY2lkZSB3aGV0aGVyIG9yIG5vdCB0aGUgdG9wICd1bnJlYWQgbWVzc2FnZXMnIGJhciBzaG91bGQgYmUgc2hvd25cbiAgICBwcml2YXRlIHVwZGF0ZVRvcFVucmVhZE1lc3NhZ2VzQmFyID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubWVzc2FnZVBhbmVsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaG93QmFyID0gdGhpcy5tZXNzYWdlUGFuZWwuY2FuSnVtcFRvUmVhZE1hcmtlcigpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93VG9wVW5yZWFkTWVzc2FnZXNCYXIgIT0gc2hvd0Jhcikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dUb3BVbnJlYWRNZXNzYWdlc0Jhcjogc2hvd0JhciB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBnZXQgdGhlIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uIG9mIHRoZSByb29tLCBzbyB0aGF0IGl0IGNhbiBiZVxuICAgIC8vIHJlc3RvcmVkIHdoZW4gd2Ugc3dpdGNoIGJhY2sgdG8gaXQuXG4gICAgLy9cbiAgICBwcml2YXRlIGdldFNjcm9sbFN0YXRlKCk6IFNjcm9sbFN0YXRlIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZVBhbmVsID0gdGhpcy5tZXNzYWdlUGFuZWw7XG4gICAgICAgIGlmICghbWVzc2FnZVBhbmVsKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyBpZiB3ZSdyZSBmb2xsb3dpbmcgdGhlIGxpdmUgdGltZWxpbmUsIHdlIHdhbnQgdG8gcmV0dXJuIG51bGw7IHRoYXRcbiAgICAgICAgLy8gbWVhbnMgdGhhdCwgaWYgd2Ugc3dpdGNoIGJhY2ssIHdlIHdpbGwganVtcCB0byB0aGUgcmVhZC11cC10byBtYXJrLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGF0IHNob3VsZCBiZSBtb3JlIGludHVpdGl2ZSB0aGFuIHNsYXZpc2hseSBwcmVzZXJ2aW5nIHRoZSBjdXJyZW50XG4gICAgICAgIC8vIHNjcm9sbCBzdGF0ZSwgaW4gdGhlIGNhc2Ugd2hlcmUgdGhlIHJvb20gYWR2YW5jZXMgaW4gdGhlIG1lYW50aW1lXG4gICAgICAgIC8vIChwYXJ0aWN1bGFybHkgaW4gdGhlIGNhc2UgdGhhdCB0aGUgdXNlciByZWFkcyBzb21lIHN0dWZmIG9uIGFub3RoZXJcbiAgICAgICAgLy8gZGV2aWNlKS5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXRFbmRPZkxpdmVUaW1lbGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY3JvbGxTdGF0ZSA9IG1lc3NhZ2VQYW5lbC5nZXRTY3JvbGxTdGF0ZSgpO1xuXG4gICAgICAgIC8vIGdldFNjcm9sbFN0YXRlIG9uIFRpbWVsaW5lUGFuZWwgKm1heSogcmV0dXJuIG51bGwsIHNvIGd1YXJkIGFnYWluc3QgdGhhdFxuICAgICAgICBpZiAoIXNjcm9sbFN0YXRlIHx8IHNjcm9sbFN0YXRlLnN0dWNrQXRCb3R0b20pIHtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHJlYWxseSBleHBlY3QgdG8gYmUgaW4gdGhpcyBzdGF0ZSwgYnV0IGl0IHdpbGxcbiAgICAgICAgICAgIC8vIG9jY2FzaW9uYWxseSBoYXBwZW4gd2hlbiBubyBzY3JvbGwgc3RhdGUgaGFzIGJlZW4gc2V0IG9uIHRoZVxuICAgICAgICAgICAgLy8gbWVzc2FnZVBhbmVsIChpZSwgd2UgZGlkbid0IGhhdmUgYW4gaW5pdGlhbCBldmVudCAoc28gaXQnc1xuICAgICAgICAgICAgLy8gcHJvYmFibHkgYSBuZXcgcm9vbSksIHRoZXJlIGhhcyBiZWVuIG5vIHVzZXItaW5pdGlhdGVkIHNjcm9sbCwgYW5kXG4gICAgICAgICAgICAvLyBubyByZWFkLXJlY2VpcHRzIGhhdmUgYXJyaXZlZCB0byB1cGRhdGUgdGhlIHNjcm9sbCBwb3NpdGlvbikuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gUmV0dXJuIG51bGwsIHdoaWNoIHdpbGwgY2F1c2UgdXMgdG8gc2Nyb2xsIHRvIGxhc3QgdW5yZWFkIG9uXG4gICAgICAgICAgICAvLyByZWxvYWQuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb2N1c3NlZEV2ZW50OiBzY3JvbGxTdGF0ZS50cmFja2VkU2Nyb2xsVG9rZW4sXG4gICAgICAgICAgICBwaXhlbE9mZnNldDogc2Nyb2xsU3RhdGUucGl4ZWxPZmZzZXQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YXR1c0JhclZpc2libGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCB8fCB0aGlzLnN0YXRlLnN0YXR1c0JhclZpc2libGUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN0YXR1c0JhclZpc2libGU6IHRydWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TdGF0dXNCYXJIaWRkZW4gPSAoKSA9PiB7XG4gICAgICAgIC8vIFRoaXMgaXMgY3VycmVudGx5IG5vdCBkZXNpcmVkIGFzIGl0IGlzIGFubm95aW5nIGlmIGl0IGtlZXBzIGV4cGFuZGluZyBhbmQgY29sbGFwc2luZ1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQgfHwgIXRoaXMuc3RhdGUuc3RhdHVzQmFyVmlzaWJsZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc3RhdHVzQmFyVmlzaWJsZTogZmFsc2UgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIGNhbGxlZCBieSB0aGUgcGFyZW50IGNvbXBvbmVudCB3aGVuIFBhZ2VVcC9Eb3duL2V0YyBpcyBwcmVzc2VkLlxuICAgICAqXG4gICAgICogV2UgcGFzcyBpdCBkb3duIHRvIHRoZSBzY3JvbGwgcGFuZWwuXG4gICAgICovXG4gICAgcHVibGljIGhhbmRsZVNjcm9sbEtleSA9IGV2ID0+IHtcbiAgICAgICAgbGV0IHBhbmVsOiBTY3JvbGxQYW5lbCB8IFRpbWVsaW5lUGFuZWw7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHNQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICBwYW5lbCA9IHRoaXMuc2VhcmNoUmVzdWx0c1BhbmVsLmN1cnJlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tZXNzYWdlUGFuZWwpIHtcbiAgICAgICAgICAgIHBhbmVsID0gdGhpcy5tZXNzYWdlUGFuZWw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFuZWwpIHtcbiAgICAgICAgICAgIHBhbmVsLmhhbmRsZVNjcm9sbEtleShldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogZ2V0IGFueSBjdXJyZW50IGNhbGwgZm9yIHRoaXMgcm9vbVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0Q2FsbEZvclJvb20oKTogTWF0cml4Q2FsbCB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yb29tKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2UuZ2V0Q2FsbEZvclJvb20odGhpcy5zdGF0ZS5yb29tLnJvb21JZCk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBoYXMgdG8gYmUgYSBwcm9wZXIgbWV0aG9kIHJhdGhlciB0aGFuIGFuIHVubmFtZWQgZnVuY3Rpb24sXG4gICAgLy8gb3RoZXJ3aXNlIHJlYWN0IGNhbGxzIGl0IHdpdGggbnVsbCBvbiBlYWNoIHVwZGF0ZS5cbiAgICBwcml2YXRlIGdhdGhlclRpbWVsaW5lUGFuZWxSZWYgPSByID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlUGFuZWwgPSByO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldE9sZFJvb20oKSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gdGhpcy5zdGF0ZS5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbUNyZWF0ZSwgXCJcIik7XG4gICAgICAgIGlmICghY3JlYXRlRXZlbnQgfHwgIWNyZWF0ZUV2ZW50LmdldENvbnRlbnQoKVsncHJlZGVjZXNzb3InXSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5nZXRSb29tKGNyZWF0ZUV2ZW50LmdldENvbnRlbnQoKVsncHJlZGVjZXNzb3InXVsncm9vbV9pZCddKTtcbiAgICB9XG5cbiAgICBnZXRIaWRkZW5IaWdobGlnaHRDb3VudCgpIHtcbiAgICAgICAgY29uc3Qgb2xkUm9vbSA9IHRoaXMuZ2V0T2xkUm9vbSgpO1xuICAgICAgICBpZiAoIW9sZFJvb20pIHJldHVybiAwO1xuICAgICAgICByZXR1cm4gb2xkUm9vbS5nZXRVbnJlYWROb3RpZmljYXRpb25Db3VudChOb3RpZmljYXRpb25Db3VudFR5cGUuSGlnaGxpZ2h0KTtcbiAgICB9XG5cbiAgICBvbkhpZGRlbkhpZ2hsaWdodHNDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgb2xkUm9vbSA9IHRoaXMuZ2V0T2xkUm9vbSgpO1xuICAgICAgICBpZiAoIW9sZFJvb20pIHJldHVybjtcbiAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICByb29tX2lkOiBvbGRSb29tLnJvb21JZCxcbiAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIlByZWRlY2Vzc29yXCIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldCBtZXNzYWdlUGFuZWxDbGFzc05hbWVzKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBjbGFzc05hbWVzKFwibXhfUm9vbVZpZXdfbWVzc2FnZVBhbmVsXCIsIHtcbiAgICAgICAgICAgIG14X0lSQ0xheW91dDogdGhpcy5zdGF0ZS5sYXlvdXQgPT09IExheW91dC5JUkMsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25GaWxlRHJvcCA9IChkYXRhVHJhbnNmZXI6IERhdGFUcmFuc2ZlcikgPT4gQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICBBcnJheS5mcm9tKGRhdGFUcmFuc2Zlci5maWxlcyksXG4gICAgICAgIHRoaXMuc3RhdGUucm9vbT8ucm9vbUlkID8/IHRoaXMuc3RhdGUucm9vbUlkLFxuICAgICAgICBudWxsLFxuICAgICAgICB0aGlzLmNvbnRleHQsXG4gICAgICAgIFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tLFxuICAgICk7XG5cbiAgICBwcml2YXRlIG9uTWVhc3VyZW1lbnQgPSAobmFycm93OiBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBuYXJyb3cgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0IHZpZXdzTG9jYWxSb29tKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gaXNMb2NhbFJvb20odGhpcy5zdGF0ZS5yb29tKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBwZXJtYWxpbmtDcmVhdG9yKCk6IFJvb21QZXJtYWxpbmtDcmVhdG9yIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGVybWFsaW5rQ3JlYXRvckZvclJvb20odGhpcy5zdGF0ZS5yb29tKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckxvY2FsUm9vbUNyZWF0ZUxvYWRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgICAgICBjb25zdCBuYW1lcyA9IHRoaXMuc3RhdGUucm9vbS5nZXREZWZhdWx0Um9vbU5hbWUodGhpcy5wcm9wcy5teENsaWVudC5nZXRVc2VySWQoKSk7XG4gICAgICAgIHJldHVybiA8Um9vbUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3RoaXMuc3RhdGV9PlxuICAgICAgICAgICAgPExvY2FsUm9vbUNyZWF0ZUxvYWRlclxuICAgICAgICAgICAgICAgIG5hbWVzPXtuYW1lc31cbiAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvUm9vbUNvbnRleHQuUHJvdmlkZXI+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyTG9jYWxSb29tVmlldygpOiBSZWFjdEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gPFJvb21Db250ZXh0LlByb3ZpZGVyIHZhbHVlPXt0aGlzLnN0YXRlfT5cbiAgICAgICAgICAgIDxMb2NhbFJvb21WaWV3XG4gICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgICAgIHJvb21WaWV3PXt0aGlzLnJvb21WaWV3fVxuICAgICAgICAgICAgICAgIG9uRmlsZURyb3A9e3RoaXMub25GaWxlRHJvcH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvUm9vbUNvbnRleHQuUHJvdmlkZXI+O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbSBpbnN0YW5jZW9mIExvY2FsUm9vbSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbS5zdGF0ZSA9PT0gTG9jYWxSb29tU3RhdGUuQ1JFQVRJTkcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJMb2NhbFJvb21DcmVhdGVMb2FkZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTG9jYWxSb29tVmlldygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRpbmcgPSAhdGhpcy5zdGF0ZS5tYXRyaXhDbGllbnRJc1JlYWR5IHx8IHRoaXMuc3RhdGUucm9vbUxvYWRpbmcgfHwgdGhpcy5zdGF0ZS5wZWVrTG9hZGluZztcbiAgICAgICAgICAgIGlmIChsb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgLy8gQXNzdW1lIHByZXZpZXcgbG9hZGluZyBpZiB3ZSBkb24ndCBoYXZlIGEgcmVhZHkgY2xpZW50IG9yIGEgcm9vbSBJRCAoc3RpbGwgcmVzb2x2aW5nIHRoZSBhbGlhcylcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aWV3TG9hZGluZyA9ICF0aGlzLnN0YXRlLm1hdHJpeENsaWVudElzUmVhZHkgfHwgIXRoaXMuc3RhdGUucm9vbUlkIHx8IHRoaXMuc3RhdGUucGVla0xvYWRpbmc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21QcmV2aWV3QmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhblByZXZpZXc9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2aWV3TG9hZGluZz17cHJldmlld0xvYWRpbmcgJiYgIXRoaXMuc3RhdGUucm9vbUxvYWRFcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I9e3RoaXMuc3RhdGUucm9vbUxvYWRFcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgam9pbmluZz17dGhpcy5zdGF0ZS5qb2luaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvb2JEYXRhPXt0aGlzLnByb3BzLm9vYkRhdGF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGludml0ZXJOYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9vYkRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52aXRlck5hbWUgPSB0aGlzLnByb3BzLm9vYkRhdGEuaW52aXRlck5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZWRFbWFpbCA9IHRoaXMucHJvcHMudGhyZWVwaWRJbnZpdGU/LnRvRW1haWw7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIG5vIHJvb20gb2JqZWN0IGZvciB0aGlzIHJvb20sIG9ubHkgdGhlIElELlxuICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIGdvdCB0byB0aGlzIHJvb20gYnkgZm9sbG93aW5nIGEgbGluaywgcG9zc2libHkgYSB0aGlyZCBwYXJ0eSBpbnZpdGUuXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbUFsaWFzID0gdGhpcy5zdGF0ZS5yb29tQWxpYXM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21QcmV2aWV3QmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSm9pbkNsaWNrPXt0aGlzLm9uSm9pbkJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9yZ2V0Q2xpY2s9e3RoaXMub25Gb3JnZXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25SZWplY3RDbGljaz17dGhpcy5vblJlamVjdFRocmVlcGlkSW52aXRlQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuUHJldmlldz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yPXt0aGlzLnN0YXRlLnJvb21Mb2FkRXJyb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21BbGlhcz17cm9vbUFsaWFzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqb2luaW5nPXt0aGlzLnN0YXRlLmpvaW5pbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludml0ZXJOYW1lPXtpbnZpdGVyTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52aXRlZEVtYWlsPXtpbnZpdGVkRW1haWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9vYkRhdGE9e3RoaXMucHJvcHMub29iRGF0YX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnblVybD17dGhpcy5wcm9wcy50aHJlZXBpZEludml0ZT8uc2lnblVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBteU1lbWJlcnNoaXAgPSB0aGlzLnN0YXRlLnJvb20uZ2V0TXlNZW1iZXJzaGlwKCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucm9vbS5pc0VsZW1lbnRWaWRlb1Jvb20oKSAmJlxuICAgICAgICAgICAgIShTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV92aWRlb19yb29tc1wiKSAmJiBteU1lbWJlcnNoaXAgPT09IFwiam9pblwiKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01haW5TcGxpdFwiPlxuICAgICAgICAgICAgICAgICAgICA8Um9vbVByZXZpZXdDYXJkXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tPXt0aGlzLnN0YXRlLnJvb219XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkpvaW5CdXR0b25DbGlja2VkPXt0aGlzLm9uSm9pbkJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlamVjdEJ1dHRvbkNsaWNrZWQ9e3RoaXMub25SZWplY3RCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIDwvRXJyb3JCb3VuZGFyeT47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGFjZVJvb21WaWV3IGhhbmRsZXMgaW52aXRlcyBpdHNlbGZcbiAgICAgICAgaWYgKG15TWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIiAmJiAhdGhpcy5zdGF0ZS5yb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmpvaW5pbmcgfHwgdGhpcy5zdGF0ZS5yZWplY3RpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tUHJldmlld0JhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhblByZXZpZXc9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yPXt0aGlzLnN0YXRlLnJvb21Mb2FkRXJyb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgam9pbmluZz17dGhpcy5zdGF0ZS5qb2luaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdGluZz17dGhpcy5zdGF0ZS5yZWplY3Rpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXlVc2VySWQgPSB0aGlzLmNvbnRleHQuY3JlZGVudGlhbHMudXNlcklkO1xuICAgICAgICAgICAgICAgIGNvbnN0IG15TWVtYmVyID0gdGhpcy5zdGF0ZS5yb29tLmdldE1lbWJlcihteVVzZXJJZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52aXRlRXZlbnQgPSBteU1lbWJlciA/IG15TWVtYmVyLmV2ZW50cy5tZW1iZXIgOiBudWxsO1xuICAgICAgICAgICAgICAgIGxldCBpbnZpdGVyTmFtZSA9IF90KFwiVW5rbm93blwiKTtcbiAgICAgICAgICAgICAgICBpZiAoaW52aXRlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52aXRlck5hbWUgPSBpbnZpdGVFdmVudC5zZW5kZXIgPyBpbnZpdGVFdmVudC5zZW5kZXIubmFtZSA6IGludml0ZUV2ZW50LmdldFNlbmRlcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdlIGRlbGliZXJhdGVseSBkb24ndCB0cnkgdG8gcGVlayBpbnRvIGludml0ZXMsIGV2ZW4gaWYgd2UgaGF2ZSBwZXJtaXNzaW9uIHRvIHBlZWtcbiAgICAgICAgICAgICAgICAvLyBhcyB0aGV5IGNvdWxkIGJlIGEgc3BhbSB2ZWN0b3IuXG4gICAgICAgICAgICAgICAgLy8gWFhYOiBpbiBmdXR1cmUgd2UgY291bGQgZ2l2ZSB0aGUgb3B0aW9uIG9mIGEgJ1ByZXZpZXcnIGJ1dHRvbiB3aGljaCBsZXRzIHRoZW0gdmlldyBhbnl3YXkuXG5cbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgcmVndWxhciBpbnZpdGUgZm9yIHRoaXMgcm9vbS5cbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Um9vbVByZXZpZXdCYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Kb2luQ2xpY2s9e3RoaXMub25Kb2luQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Gb3JnZXRDbGljaz17dGhpcy5vbkZvcmdldENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblJlamVjdENsaWNrPXt0aGlzLm9uUmVqZWN0QnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25SZWplY3RBbmRJZ25vcmVDbGljaz17dGhpcy5vblJlamVjdEFuZElnbm9yZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZT17aW52aXRlck5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhblByZXZpZXc9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqb2luaW5nPXt0aGlzLnN0YXRlLmpvaW5pbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMuc3RhdGUucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgaGF2ZSBzdWNjZXNzZnVsbHkgbG9hZGVkIHRoaXMgcm9vbSwgYW5kIGFyZSBub3QgcHJldmlld2luZy5cbiAgICAgICAgLy8gRGlzcGxheSB0aGUgXCJub3JtYWxcIiByb29tIHZpZXcuXG5cbiAgICAgICAgbGV0IGFjdGl2ZUNhbGwgPSBudWxsO1xuICAgICAgICB7XG4gICAgICAgICAgICAvLyBOZXcgYmxvY2sgYmVjYXVzZSB0aGlzIHZhcmlhYmxlIGRvZXNuJ3QgbmVlZCB0byBoYW5nIGFyb3VuZCBmb3IgdGhlIHJlc3Qgb2YgdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICBjb25zdCBjYWxsID0gdGhpcy5nZXRDYWxsRm9yUm9vbSgpO1xuICAgICAgICAgICAgaWYgKGNhbGwgJiYgKHRoaXMuc3RhdGUuY2FsbFN0YXRlICE9PSAnZW5kZWQnICYmIHRoaXMuc3RhdGUuY2FsbFN0YXRlICE9PSAncmluZ2luZycpKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlQ2FsbCA9IGNhbGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY3JvbGxoZWFkZXJDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBteF9Sb29tVmlld19zY3JvbGxoZWFkZXI6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBzdGF0dXNCYXI7XG4gICAgICAgIGxldCBpc1N0YXR1c0FyZWFFeHBhbmRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKENvbnRlbnRNZXNzYWdlcy5zaGFyZWRJbnN0YW5jZSgpLmdldEN1cnJlbnRVcGxvYWRzKCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc3RhdHVzQmFyID0gPFVwbG9hZEJhciByb29tPXt0aGlzLnN0YXRlLnJvb219IC8+O1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlzU3RhdHVzQXJlYUV4cGFuZGVkID0gdGhpcy5zdGF0ZS5zdGF0dXNCYXJWaXNpYmxlO1xuICAgICAgICAgICAgc3RhdHVzQmFyID0gPFJvb21TdGF0dXNCYXJcbiAgICAgICAgICAgICAgICByb29tPXt0aGlzLnN0YXRlLnJvb219XG4gICAgICAgICAgICAgICAgaXNQZWVraW5nPXtteU1lbWJlcnNoaXAgIT09IFwiam9pblwifVxuICAgICAgICAgICAgICAgIG9uSW52aXRlQ2xpY2s9e3RoaXMub25JbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICBvblZpc2libGU9e3RoaXMub25TdGF0dXNCYXJWaXNpYmxlfVxuICAgICAgICAgICAgICAgIG9uSGlkZGVuPXt0aGlzLm9uU3RhdHVzQmFySGlkZGVufVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdGF0dXNCYXJBcmVhQ2xhc3MgPSBjbGFzc05hbWVzKFwibXhfUm9vbVZpZXdfc3RhdHVzQXJlYVwiLCB7XG4gICAgICAgICAgICBcIm14X1Jvb21WaWV3X3N0YXR1c0FyZWFfZXhwYW5kZWRcIjogaXNTdGF0dXNBcmVhRXhwYW5kZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGlmIHN0YXR1c0JhciBkb2VzIG5vdCBleGlzdCB0aGVuIHN0YXR1c0JhckFyZWEgaXMgYmxhbmsgYW5kIHRha2VzIHVwIHVubmVjZXNzYXJ5IHNwYWNlIG9uIHRoZSBzY3JlZW5cbiAgICAgICAgLy8gc2hvdyBzdGF0dXNCYXJBcmVhIG9ubHkgaWYgc3RhdHVzQmFyIGlzIHByZXNlbnRcbiAgICAgICAgY29uc3Qgc3RhdHVzQmFyQXJlYSA9IHN0YXR1c0JhciAmJiA8ZGl2IGNsYXNzTmFtZT17c3RhdHVzQmFyQXJlYUNsYXNzfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfc3RhdHVzQXJlYUJveFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfc3RhdHVzQXJlYUJveF9saW5lXCIgLz5cbiAgICAgICAgICAgICAgICB7IHN0YXR1c0JhciB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIGNvbnN0IHJvb21WZXJzaW9uUmVjb21tZW5kYXRpb24gPSB0aGlzLnN0YXRlLnVwZ3JhZGVSZWNvbW1lbmRhdGlvbjtcbiAgICAgICAgY29uc3Qgc2hvd1Jvb21VcGdyYWRlQmFyID0gKFxuICAgICAgICAgICAgcm9vbVZlcnNpb25SZWNvbW1lbmRhdGlvbiAmJlxuICAgICAgICAgICAgcm9vbVZlcnNpb25SZWNvbW1lbmRhdGlvbi5uZWVkc1VwZ3JhZGUgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucm9vbS51c2VyTWF5VXBncmFkZVJvb20odGhpcy5jb250ZXh0LmNyZWRlbnRpYWxzLnVzZXJJZClcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBoaWRkZW5IaWdobGlnaHRDb3VudCA9IHRoaXMuZ2V0SGlkZGVuSGlnaGxpZ2h0Q291bnQoKTtcblxuICAgICAgICBsZXQgYXV4ID0gbnVsbDtcbiAgICAgICAgbGV0IHByZXZpZXdCYXI7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlNlYXJjaCkge1xuICAgICAgICAgICAgYXV4ID0gPFNlYXJjaEJhclxuICAgICAgICAgICAgICAgIHNlYXJjaEluUHJvZ3Jlc3M9e3RoaXMuc3RhdGUuc2VhcmNoSW5Qcm9ncmVzc31cbiAgICAgICAgICAgICAgICBvbkNhbmNlbENsaWNrPXt0aGlzLm9uQ2FuY2VsU2VhcmNoQ2xpY2t9XG4gICAgICAgICAgICAgICAgb25TZWFyY2g9e3RoaXMub25TZWFyY2h9XG4gICAgICAgICAgICAgICAgaXNSb29tRW5jcnlwdGVkPXt0aGlzLmNvbnRleHQuaXNSb29tRW5jcnlwdGVkKHRoaXMuc3RhdGUucm9vbS5yb29tSWQpfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH0gZWxzZSBpZiAoc2hvd1Jvb21VcGdyYWRlQmFyKSB7XG4gICAgICAgICAgICBhdXggPSA8Um9vbVVwZ3JhZGVXYXJuaW5nQmFyIHJvb209e3RoaXMuc3RhdGUucm9vbX0gLz47XG4gICAgICAgIH0gZWxzZSBpZiAobXlNZW1iZXJzaGlwICE9PSBcImpvaW5cIikge1xuICAgICAgICAgICAgLy8gV2UgZG8gaGF2ZSBhIHJvb20gb2JqZWN0IGZvciB0aGlzIHJvb20sIGJ1dCB3ZSdyZSBub3QgY3VycmVudGx5IGluIGl0LlxuICAgICAgICAgICAgLy8gV2UgbWF5IGhhdmUgYSAzcmQgcGFydHkgaW52aXRlIHRvIGl0LlxuICAgICAgICAgICAgbGV0IGludml0ZXJOYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub29iRGF0YSkge1xuICAgICAgICAgICAgICAgIGludml0ZXJOYW1lID0gdGhpcy5wcm9wcy5vb2JEYXRhLmludml0ZXJOYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaW52aXRlZEVtYWlsID0gdGhpcy5wcm9wcy50aHJlZXBpZEludml0ZT8udG9FbWFpbDtcbiAgICAgICAgICAgIHByZXZpZXdCYXIgPSAoXG4gICAgICAgICAgICAgICAgPFJvb21QcmV2aWV3QmFyXG4gICAgICAgICAgICAgICAgICAgIG9uSm9pbkNsaWNrPXt0aGlzLm9uSm9pbkJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uRm9yZ2V0Q2xpY2s9e3RoaXMub25Gb3JnZXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgb25SZWplY3RDbGljaz17dGhpcy5vblJlamVjdFRocmVlcGlkSW52aXRlQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgam9pbmluZz17dGhpcy5zdGF0ZS5qb2luaW5nfVxuICAgICAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZT17aW52aXRlck5hbWV9XG4gICAgICAgICAgICAgICAgICAgIGludml0ZWRFbWFpbD17aW52aXRlZEVtYWlsfVxuICAgICAgICAgICAgICAgICAgICBvb2JEYXRhPXt0aGlzLnByb3BzLm9vYkRhdGF9XG4gICAgICAgICAgICAgICAgICAgIGNhblByZXZpZXc9e3RoaXMuc3RhdGUuY2FuUGVla31cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNhblBlZWsgJiYgIXRoaXMuc3RhdGUucm9vbT8uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcHJldmlld0JhciB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaGlkZGVuSGlnaGxpZ2h0Q291bnQgPiAwKSB7XG4gICAgICAgICAgICBhdXggPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cImRpdlwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X2F1eFBhbmVsX2hpZGRlbkhpZ2hsaWdodHNcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uSGlkZGVuSGlnaGxpZ2h0c0NsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiWW91IGhhdmUgJShjb3VudClzIHVucmVhZCBub3RpZmljYXRpb25zIGluIGEgcHJpb3IgdmVyc2lvbiBvZiB0aGlzIHJvb20uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNvdW50OiBoaWRkZW5IaWdobGlnaHRDb3VudCB9LFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbT8uaXNTcGFjZVJvb20oKSAmJiAhdGhpcy5wcm9wcy5mb3JjZVRpbWVsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gPFNwYWNlUm9vbVZpZXdcbiAgICAgICAgICAgICAgICBzcGFjZT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgIGp1c3RDcmVhdGVkT3B0cz17dGhpcy5wcm9wcy5qdXN0Q3JlYXRlZE9wdHN9XG4gICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgb25Kb2luQnV0dG9uQ2xpY2tlZD17dGhpcy5vbkpvaW5CdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICAgIG9uUmVqZWN0QnV0dG9uQ2xpY2tlZD17dGhpcy5wcm9wcy50aHJlZXBpZEludml0ZVxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMub25SZWplY3RUaHJlZXBpZEludml0ZUJ1dHRvbkNsaWNrZWRcbiAgICAgICAgICAgICAgICAgICAgOiB0aGlzLm9uUmVqZWN0QnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXV4UGFuZWwgPSAoXG4gICAgICAgICAgICA8QXV4UGFuZWxcbiAgICAgICAgICAgICAgICByb29tPXt0aGlzLnN0YXRlLnJvb219XG4gICAgICAgICAgICAgICAgdXNlcklkPXt0aGlzLmNvbnRleHQuY3JlZGVudGlhbHMudXNlcklkfVxuICAgICAgICAgICAgICAgIHNob3dBcHBzPXt0aGlzLnN0YXRlLnNob3dBcHBzfVxuICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgYXV4IH1cbiAgICAgICAgICAgIDwvQXV4UGFuZWw+XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IG1lc3NhZ2VDb21wb3NlcjsgbGV0IHNlYXJjaEluZm87XG4gICAgICAgIGNvbnN0IHNob3dDb21wb3NlciA9IChcbiAgICAgICAgICAgIC8vIGpvaW5lZCBhbmQgbm90IHNob3dpbmcgc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgICAgIG15TWVtYmVyc2hpcCA9PT0gJ2pvaW4nICYmICF0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHNcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHNob3dDb21wb3Nlcikge1xuICAgICAgICAgICAgbWVzc2FnZUNvbXBvc2VyID1cbiAgICAgICAgICAgICAgICA8TWVzc2FnZUNvbXBvc2VyXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMuc3RhdGUucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgZTJlU3RhdHVzPXt0aGlzLnN0YXRlLmUyZVN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudD17dGhpcy5zdGF0ZS5yZXBseVRvRXZlbnR9XG4gICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMucGVybWFsaW5rQ3JlYXRvcn1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IFdoeSBhcmVuJ3Qgd2Ugc3RvcmluZyB0aGUgdGVybS9zY29wZS9jb3VudCBpbiB0aGlzIGZvcm1hdFxuICAgICAgICAvLyBpbiB0aGlzLnN0YXRlIGlmIHRoaXMgaXMgd2hhdCBSb29tSGVhZGVyIGRlc2lyZXM/XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMpIHtcbiAgICAgICAgICAgIHNlYXJjaEluZm8gPSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoVGVybTogdGhpcy5zdGF0ZS5zZWFyY2hUZXJtLFxuICAgICAgICAgICAgICAgIHNlYXJjaFNjb3BlOiB0aGlzLnN0YXRlLnNlYXJjaFNjb3BlLFxuICAgICAgICAgICAgICAgIHNlYXJjaENvdW50OiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMuY291bnQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBzZWFyY2ggcmVzdWx0cywgd2Uga2VlcCB0aGUgbWVzc2FnZXBhbmVsIChzbyB0aGF0IGl0IHByZXNlcnZlcyBpdHNcbiAgICAgICAgLy8gc2Nyb2xsIHN0YXRlKSwgYnV0IGhpZGUgaXQuXG4gICAgICAgIGxldCBzZWFyY2hSZXN1bHRzUGFuZWw7XG4gICAgICAgIGxldCBoaWRlTWVzc2FnZVBhbmVsID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cykge1xuICAgICAgICAgICAgLy8gc2hvdyBzZWFyY2hpbmcgc3Bpbm5lclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5jb3VudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0c1BhbmVsID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbCBteF9Sb29tVmlld19tZXNzYWdlUGFuZWxTZWFyY2hTcGlubmVyXCIgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRzUGFuZWwgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxTY3JvbGxQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnNlYXJjaFJlc3VsdHNQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17XCJteF9Sb29tVmlld19zZWFyY2hSZXN1bHRzUGFuZWwgXCIgKyB0aGlzLm1lc3NhZ2VQYW5lbENsYXNzTmFtZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbGxSZXF1ZXN0PXt0aGlzLm9uU2VhcmNoUmVzdWx0c0ZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9e3Njcm9sbGhlYWRlckNsYXNzZXN9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuZ2V0U2VhcmNoUmVzdWx0VGlsZXMoKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvU2Nyb2xsUGFuZWw+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhpZGVNZXNzYWdlUGFuZWwgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhpZ2hsaWdodGVkRXZlbnRJZCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQpIHtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkRXZlbnRJZCA9IHRoaXMuc3RhdGUuaW5pdGlhbEV2ZW50SWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb25zb2xlLmluZm8oXCJTaG93VXJsUHJldmlldyBmb3IgJXMgaXMgJXNcIiwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCwgdGhpcy5zdGF0ZS5zaG93VXJsUHJldmlldyk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VQYW5lbCA9IChcbiAgICAgICAgICAgIDxUaW1lbGluZVBhbmVsXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLmdhdGhlclRpbWVsaW5lUGFuZWxSZWZ9XG4gICAgICAgICAgICAgICAgdGltZWxpbmVTZXQ9e3RoaXMuc3RhdGUucm9vbS5nZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQoKX1cbiAgICAgICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzPXt0aGlzLnN0YXRlLnNob3dSZWFkUmVjZWlwdHN9XG4gICAgICAgICAgICAgICAgbWFuYWdlUmVhZFJlY2VpcHRzPXshdGhpcy5zdGF0ZS5pc1BlZWtpbmd9XG4gICAgICAgICAgICAgICAgc2VuZFJlYWRSZWNlaXB0T25Mb2FkPXshdGhpcy5zdGF0ZS53YXNDb250ZXh0U3dpdGNofVxuICAgICAgICAgICAgICAgIG1hbmFnZVJlYWRNYXJrZXJzPXshdGhpcy5zdGF0ZS5pc1BlZWtpbmd9XG4gICAgICAgICAgICAgICAgaGlkZGVuPXtoaWRlTWVzc2FnZVBhbmVsfVxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkRXZlbnRJZD17aGlnaGxpZ2h0ZWRFdmVudElkfVxuICAgICAgICAgICAgICAgIGV2ZW50SWQ9e3RoaXMuc3RhdGUuaW5pdGlhbEV2ZW50SWR9XG4gICAgICAgICAgICAgICAgZXZlbnRTY3JvbGxJbnRvVmlldz17dGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlld31cbiAgICAgICAgICAgICAgICBldmVudFBpeGVsT2Zmc2V0PXt0aGlzLnN0YXRlLmluaXRpYWxFdmVudFBpeGVsT2Zmc2V0fVxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uTWVzc2FnZUxpc3RTY3JvbGx9XG4gICAgICAgICAgICAgICAgb25FdmVudFNjcm9sbGVkSW50b1ZpZXc9e3RoaXMucmVzZXRKdW1wVG9FdmVudH1cbiAgICAgICAgICAgICAgICBvblJlYWRNYXJrZXJVcGRhdGVkPXt0aGlzLnVwZGF0ZVRvcFVucmVhZE1lc3NhZ2VzQmFyfVxuICAgICAgICAgICAgICAgIHNob3dVcmxQcmV2aWV3PXt0aGlzLnN0YXRlLnNob3dVcmxQcmV2aWV3fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5tZXNzYWdlUGFuZWxDbGFzc05hbWVzfVxuICAgICAgICAgICAgICAgIG1lbWJlcnNMb2FkZWQ9e3RoaXMuc3RhdGUubWVtYmVyc0xvYWRlZH1cbiAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgc2hvd1JlYWN0aW9ucz17dHJ1ZX1cbiAgICAgICAgICAgICAgICBsYXlvdXQ9e3RoaXMuc3RhdGUubGF5b3V0fVxuICAgICAgICAgICAgICAgIGVkaXRTdGF0ZT17dGhpcy5zdGF0ZS5lZGl0U3RhdGV9XG4gICAgICAgICAgICAvPik7XG5cbiAgICAgICAgbGV0IHRvcFVucmVhZE1lc3NhZ2VzQmFyID0gbnVsbDtcbiAgICAgICAgLy8gRG8gbm90IHNob3cgVG9wVW5yZWFkTWVzc2FnZXNCYXIgaWYgd2UgaGF2ZSBzZWFyY2ggcmVzdWx0cyBzaG93aW5nLCBpdCBtYWtlcyBubyBzZW5zZVxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93VG9wVW5yZWFkTWVzc2FnZXNCYXIgJiYgIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cykge1xuICAgICAgICAgICAgdG9wVW5yZWFkTWVzc2FnZXNCYXIgPSAoXG4gICAgICAgICAgICAgICAgPFRvcFVucmVhZE1lc3NhZ2VzQmFyIG9uU2Nyb2xsVXBDbGljaz17dGhpcy5qdW1wVG9SZWFkTWFya2VyfSBvbkNsb3NlQ2xpY2s9e3RoaXMuZm9yZ2V0UmVhZE1hcmtlcn0gLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGp1bXBUb0JvdHRvbTtcbiAgICAgICAgLy8gRG8gbm90IHNob3cgSnVtcFRvQm90dG9tQnV0dG9uIGlmIHdlIGhhdmUgc2VhcmNoIHJlc3VsdHMgc2hvd2luZywgaXQgbWFrZXMgbm8gc2Vuc2VcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXRFbmRPZkxpdmVUaW1lbGluZSA9PT0gZmFsc2UgJiYgIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cykge1xuICAgICAgICAgICAganVtcFRvQm90dG9tID0gKDxKdW1wVG9Cb3R0b21CdXR0b25cbiAgICAgICAgICAgICAgICBoaWdobGlnaHQ9e3RoaXMuc3RhdGUucm9vbS5nZXRVbnJlYWROb3RpZmljYXRpb25Db3VudChOb3RpZmljYXRpb25Db3VudFR5cGUuSGlnaGxpZ2h0KSA+IDB9XG4gICAgICAgICAgICAgICAgbnVtVW5yZWFkTWVzc2FnZXM9e3RoaXMuc3RhdGUubnVtVW5yZWFkTWVzc2FnZXN9XG4gICAgICAgICAgICAgICAgb25TY3JvbGxUb0JvdHRvbUNsaWNrPXt0aGlzLmp1bXBUb0xpdmVUaW1lbGluZX1cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNob3dSaWdodFBhbmVsID0gdGhpcy5zdGF0ZS5yb29tICYmIHRoaXMuc3RhdGUuc2hvd1JpZ2h0UGFuZWw7XG5cbiAgICAgICAgY29uc3QgcmlnaHRQYW5lbCA9IHNob3dSaWdodFBhbmVsXG4gICAgICAgICAgICA/IDxSaWdodFBhbmVsXG4gICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMucGVybWFsaW5rQ3JlYXRvcn1cbiAgICAgICAgICAgICAgICBlMmVTdGF0dXM9e3RoaXMuc3RhdGUuZTJlU3RhdHVzfSAvPlxuICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIGNvbnN0IHRpbWVsaW5lQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9Sb29tVmlld190aW1lbGluZVwiLCB7XG4gICAgICAgICAgICBteF9Sb29tVmlld190aW1lbGluZV9ycl9lbmFibGVkOiB0aGlzLnN0YXRlLnNob3dSZWFkUmVjZWlwdHMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG1haW5DbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21WaWV3XCIsIHtcbiAgICAgICAgICAgIG14X1Jvb21WaWV3X2luQ2FsbDogQm9vbGVhbihhY3RpdmVDYWxsKSxcbiAgICAgICAgICAgIG14X1Jvb21WaWV3X2ltbWVyc2l2ZTogdGhpcy5zdGF0ZS5tYWluU3BsaXRDb250ZW50VHlwZSA9PT0gTWFpblNwbGl0Q29udGVudFR5cGUuVmlkZW8sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHNob3dDaGF0RWZmZWN0cyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ3Nob3dDaGF0RWZmZWN0cycpO1xuXG4gICAgICAgIGxldCBtYWluU3BsaXRCb2R5OiBSZWFjdC5SZWFjdEZyYWdtZW50O1xuICAgICAgICBsZXQgbWFpblNwbGl0Q29udGVudENsYXNzTmFtZTogc3RyaW5nO1xuICAgICAgICAvLyBEZWNpZGUgd2hhdCB0byBzaG93IGluIHRoZSBtYWluIHNwbGl0XG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5tYWluU3BsaXRDb250ZW50VHlwZSkge1xuICAgICAgICAgICAgY2FzZSBNYWluU3BsaXRDb250ZW50VHlwZS5UaW1lbGluZTpcbiAgICAgICAgICAgICAgICBtYWluU3BsaXRDb250ZW50Q2xhc3NOYW1lID0gXCJteF9NYWluU3BsaXRfdGltZWxpbmVcIjtcbiAgICAgICAgICAgICAgICBtYWluU3BsaXRCb2R5ID0gPD5cbiAgICAgICAgICAgICAgICAgICAgPE1lYXN1cmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5zb3I9e3RoaXMucm9vbVZpZXdCb2R5LmN1cnJlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1lYXN1cmVtZW50PXt0aGlzLm9uTWVhc3VyZW1lbnR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgYXV4UGFuZWwgfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dGltZWxpbmVDbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWxlRHJvcFRhcmdldCBwYXJlbnQ9e3RoaXMucm9vbVZpZXcuY3VycmVudH0gb25GaWxlRHJvcD17dGhpcy5vbkZpbGVEcm9wfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0b3BVbnJlYWRNZXNzYWdlc0JhciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGp1bXBUb0JvdHRvbSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IG1lc3NhZ2VQYW5lbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlYXJjaFJlc3VsdHNQYW5lbCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHN0YXR1c0JhckFyZWEgfVxuICAgICAgICAgICAgICAgICAgICB7IHByZXZpZXdCYXIgfVxuICAgICAgICAgICAgICAgICAgICB7IG1lc3NhZ2VDb21wb3NlciB9XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNYWluU3BsaXRDb250ZW50VHlwZS5NYXhpbWlzZWRXaWRnZXQ6XG4gICAgICAgICAgICAgICAgbWFpblNwbGl0Q29udGVudENsYXNzTmFtZSA9IFwibXhfTWFpblNwbGl0X21heGltaXNlZFdpZGdldFwiO1xuICAgICAgICAgICAgICAgIG1haW5TcGxpdEJvZHkgPSA8PlxuICAgICAgICAgICAgICAgICAgICA8QXBwc0RyYXdlclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkPXt0aGlzLmNvbnRleHQuY3JlZGVudGlhbHMudXNlcklkfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93QXBwcz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBwcmV2aWV3QmFyIH1cbiAgICAgICAgICAgICAgICA8Lz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1haW5TcGxpdENvbnRlbnRUeXBlLlZpZGVvOiB7XG4gICAgICAgICAgICAgICAgbWFpblNwbGl0Q29udGVudENsYXNzTmFtZSA9IFwibXhfTWFpblNwbGl0X3ZpZGVvXCI7XG4gICAgICAgICAgICAgICAgbWFpblNwbGl0Qm9keSA9IDw+XG4gICAgICAgICAgICAgICAgICAgIDxWaWRlb1Jvb21WaWV3IHJvb209e3RoaXMuc3RhdGUucm9vbX0gcmVzaXppbmc9e3RoaXMuc3RhdGUucmVzaXppbmd9IC8+XG4gICAgICAgICAgICAgICAgICAgIHsgcHJldmlld0JhciB9XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1haW5TcGxpdENvbnRlbnRDbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21WaWV3X2JvZHlcIiwgbWFpblNwbGl0Q29udGVudENsYXNzTmFtZSk7XG5cbiAgICAgICAgbGV0IGV4Y2x1ZGVkUmlnaHRQYW5lbFBoYXNlQnV0dG9ucyA9IFtSaWdodFBhbmVsUGhhc2VzLlRpbWVsaW5lXTtcbiAgICAgICAgbGV0IG9uQ2FsbFBsYWNlZCA9IHRoaXMub25DYWxsUGxhY2VkO1xuICAgICAgICBsZXQgb25BcHBzQ2xpY2sgPSB0aGlzLm9uQXBwc0NsaWNrO1xuICAgICAgICBsZXQgb25Gb3JnZXRDbGljayA9IHRoaXMub25Gb3JnZXRDbGljaztcbiAgICAgICAgbGV0IG9uU2VhcmNoQ2xpY2sgPSB0aGlzLm9uU2VhcmNoQ2xpY2s7XG4gICAgICAgIGxldCBvbkludml0ZUNsaWNrID0gbnVsbDtcblxuICAgICAgICAvLyBTaW1wbGlmeSB0aGUgaGVhZGVyIGZvciBvdGhlciBtYWluIHNwbGl0IHR5cGVzXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5tYWluU3BsaXRDb250ZW50VHlwZSkge1xuICAgICAgICAgICAgY2FzZSBNYWluU3BsaXRDb250ZW50VHlwZS5NYXhpbWlzZWRXaWRnZXQ6XG4gICAgICAgICAgICAgICAgZXhjbHVkZWRSaWdodFBhbmVsUGhhc2VCdXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICBSaWdodFBhbmVsUGhhc2VzLlRocmVhZFBhbmVsLFxuICAgICAgICAgICAgICAgICAgICBSaWdodFBhbmVsUGhhc2VzLlBpbm5lZE1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgb25BcHBzQ2xpY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgIG9uRm9yZ2V0Q2xpY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ2xpY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNYWluU3BsaXRDb250ZW50VHlwZS5WaWRlbzpcbiAgICAgICAgICAgICAgICBleGNsdWRlZFJpZ2h0UGFuZWxQaGFzZUJ1dHRvbnMgPSBbXG4gICAgICAgICAgICAgICAgICAgIFJpZ2h0UGFuZWxQaGFzZXMuVGhyZWFkUGFuZWwsXG4gICAgICAgICAgICAgICAgICAgIFJpZ2h0UGFuZWxQaGFzZXMuUGlubmVkTWVzc2FnZXMsXG4gICAgICAgICAgICAgICAgICAgIFJpZ2h0UGFuZWxQaGFzZXMuTm90aWZpY2F0aW9uUGFuZWwsXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBvbkNhbGxQbGFjZWQgPSBudWxsO1xuICAgICAgICAgICAgICAgIG9uQXBwc0NsaWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICBvbkZvcmdldENsaWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICBvblNlYXJjaENsaWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tLmNhbkludml0ZSh0aGlzLmNvbnRleHQuY3JlZGVudGlhbHMudXNlcklkKSkge1xuICAgICAgICAgICAgICAgICAgICBvbkludml0ZUNsaWNrID0gdGhpcy5vbkludml0ZUNsaWNrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Um9vbUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3RoaXMuc3RhdGV9PlxuICAgICAgICAgICAgICAgIDxtYWluIGNsYXNzTmFtZT17bWFpbkNsYXNzZXN9IHJlZj17dGhpcy5yb29tVmlld30gb25LZXlEb3duPXt0aGlzLm9uUmVhY3RLZXlEb3dufT5cbiAgICAgICAgICAgICAgICAgICAgeyBzaG93Q2hhdEVmZmVjdHMgJiYgdGhpcy5yb29tVmlldy5jdXJyZW50ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICA8RWZmZWN0c092ZXJsYXkgcm9vbVdpZHRoPXt0aGlzLnJvb21WaWV3LmN1cnJlbnQub2Zmc2V0V2lkdGh9IC8+XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUhlYWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMuc3RhdGUucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hJbmZvPXtzZWFyY2hJbmZvfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9vYkRhdGE9e3RoaXMucHJvcHMub29iRGF0YX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblJvb209e215TWVtYmVyc2hpcCA9PT0gJ2pvaW4nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VhcmNoQ2xpY2s9e29uU2VhcmNoQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25JbnZpdGVDbGljaz17b25JbnZpdGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZvcmdldENsaWNrPXsobXlNZW1iZXJzaGlwID09PSBcImxlYXZlXCIpID8gb25Gb3JnZXRDbGljayA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZTJlU3RhdHVzPXt0aGlzLnN0YXRlLmUyZVN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkFwcHNDbGljaz17dGhpcy5zdGF0ZS5oYXNQaW5uZWRXaWRnZXRzID8gb25BcHBzQ2xpY2sgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHNTaG93bj17dGhpcy5zdGF0ZS5zaG93QXBwc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNhbGxQbGFjZWQ9e29uQ2FsbFBsYWNlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlZFJpZ2h0UGFuZWxQaGFzZUJ1dHRvbnM9e2V4Y2x1ZGVkUmlnaHRQYW5lbFBoYXNlQnV0dG9uc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93QnV0dG9ucz17IXRoaXMudmlld3NMb2NhbFJvb219XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlUm9vbU9wdGlvbnNNZW51PXshdGhpcy52aWV3c0xvY2FsUm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8TWFpblNwbGl0IHBhbmVsPXtyaWdodFBhbmVsfSByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e21haW5TcGxpdENvbnRlbnRDbGFzc2VzfSByZWY9e3RoaXMucm9vbVZpZXdCb2R5fSBkYXRhLWxheW91dD17dGhpcy5zdGF0ZS5sYXlvdXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG1haW5TcGxpdEJvZHkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9NYWluU3BsaXQ+XG4gICAgICAgICAgICAgICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICA8L21haW4+XG4gICAgICAgICAgICA8L1Jvb21Db250ZXh0LlByb3ZpZGVyPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY29uc3QgUm9vbVZpZXdXaXRoTWF0cml4Q2xpZW50ID0gd2l0aE1hdHJpeENsaWVudEhPQyhSb29tVmlldyk7XG5leHBvcnQg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