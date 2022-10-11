"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.UnwrappedEventTile = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _event2 = require("matrix-js-sdk/src/models/event");

var _thread2 = require("matrix-js-sdk/src/models/thread");

var _logger = require("matrix-js-sdk/src/logger");

var _room = require("matrix-js-sdk/src/models/room");

var _call = require("matrix-js-sdk/src/webrtc/call");

var _crypto = require("matrix-js-sdk/src/crypto");

var _link = require("../../../../res/img/element-icons/link.svg");

var _viewInRoom = require("../../../../res/img/element-icons/view-in-room.svg");

var _ReplyChain = _interopRequireDefault(require("../elements/ReplyChain"));

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Layout = require("../../../settings/enums/Layout");

var _DateUtils = require("../../../DateUtils");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _E2EIcon = require("./E2EIcon");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _MessageContextMenu = _interopRequireDefault(require("../context_menus/MessageContextMenu"));

var _ContextMenu = require("../../structures/ContextMenu");

var _objects = require("../../../utils/objects");

var _Tooltip = _interopRequireWildcard(require("../elements/Tooltip"));

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _NotificationBadge = _interopRequireDefault(require("./NotificationBadge"));

var _actions = require("../../../dispatcher/actions");

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _SenderProfile = _interopRequireDefault(require("../messages/SenderProfile"));

var _MessageTimestamp = _interopRequireDefault(require("../messages/MessageTimestamp"));

var _TooltipButton = _interopRequireDefault(require("../elements/TooltipButton"));

var _MessageActionBar = _interopRequireDefault(require("../messages/MessageActionBar"));

var _ReactionsRow = _interopRequireDefault(require("../messages/ReactionsRow"));

var _EventRenderingUtils = require("../../../utils/EventRenderingUtils");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _MessagePreviewStore = require("../../../stores/room-list/MessagePreviewStore");

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _MediaEventHelper = require("../../../utils/MediaEventHelper");

var _Toolbar = _interopRequireDefault(require("../../../accessibility/Toolbar"));

var _RovingAccessibleTooltipButton = require("../../../accessibility/roving/RovingAccessibleTooltipButton");

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _NotificationState = require("../../../stores/notifications/NotificationState");

var _NotificationColor = require("../../../stores/notifications/NotificationColor");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _strings = require("../../../utils/strings");

var _DecryptionFailureTracker = require("../../../DecryptionFailureTracker");

var _RedactedBody = _interopRequireDefault(require("../messages/RedactedBody"));

var _Reply = require("../../../utils/Reply");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _TileErrorBoundary = _interopRequireDefault(require("../messages/TileErrorBoundary"));

var _EventTileFactory = require("../../../events/EventTileFactory");

var _ThreadSummary = _interopRequireWildcard(require("./ThreadSummary"));

var _ReadReceiptGroup = require("./ReadReceiptGroup");

var _useTooltip = require("../../../utils/useTooltip");

var _isLocalRoom = require("../../../utils/localRoom/isLocalRoom");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// MUST be rendered within a RoomContext with a set timelineRenderingType
class UnwrappedEventTile extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "suppressReadReceiptAnimation", void 0);
    (0, _defineProperty2.default)(this, "isListeningForReceipts", void 0);
    (0, _defineProperty2.default)(this, "tile", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "replyChain", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "threadState", void 0);
    (0, _defineProperty2.default)(this, "ref", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onThreadStateUpdate", () => {
      let threadNotification = null;

      switch (this.threadState?.color) {
        case _NotificationColor.NotificationColor.Grey:
          threadNotification = _room.NotificationCountType.Total;
          break;

        case _NotificationColor.NotificationColor.Red:
          threadNotification = _room.NotificationCountType.Highlight;
          break;
      }

      this.setState({
        threadNotification
      });
    });
    (0, _defineProperty2.default)(this, "updateThread", thread => {
      if (thread !== this.state.thread) {
        if (this.threadState) {
          this.threadState.off(_NotificationState.NotificationStateEvents.Update, this.onThreadStateUpdate);
        }

        this.setupNotificationListener(thread);
      }

      this.setState({
        thread
      });
    });
    (0, _defineProperty2.default)(this, "onNewThread", thread => {
      if (thread.id === this.props.mxEvent.getId()) {
        this.updateThread(thread);

        const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

        room.off(_thread2.ThreadEvent.New, this.onNewThread);
      }
    });
    (0, _defineProperty2.default)(this, "viewInRoom", evt => {
      evt.preventDefault();
      evt.stopPropagation();

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        event_id: this.props.mxEvent.getId(),
        highlighted: true,
        room_id: this.props.mxEvent.getRoomId(),
        metricsTrigger: undefined // room doesn't change

      });
    });
    (0, _defineProperty2.default)(this, "copyLinkToThread", async evt => {
      evt.preventDefault();
      evt.stopPropagation();
      const {
        permalinkCreator,
        mxEvent
      } = this.props;
      const matrixToUrl = permalinkCreator.forEvent(mxEvent.getId());
      await (0, _strings.copyPlaintext)(matrixToUrl);
    });
    (0, _defineProperty2.default)(this, "onRoomReceipt", (ev, room) => {
      // ignore events for other rooms
      const tileRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

      if (room !== tileRoom) return;

      if (!this.shouldShowSentReceipt && !this.shouldShowSendingReceipt && !this.isListeningForReceipts) {
        return;
      } // We force update because we have no state or prop changes to queue up, instead relying on
      // the getters we use here to determine what needs rendering.


      this.forceUpdate(() => {
        // Per elsewhere in this file, we can remove the listener once we will have no further purpose for it.
        if (!this.shouldShowSentReceipt && !this.shouldShowSendingReceipt) {
          _MatrixClientPeg.MatrixClientPeg.get().removeListener(_room.RoomEvent.Receipt, this.onRoomReceipt);

          this.isListeningForReceipts = false;
        }
      });
    });
    (0, _defineProperty2.default)(this, "onDecrypted", () => {
      // we need to re-verify the sending device.
      // (we call onHeightChanged in verifyEvent to handle the case where decryption
      // has caused a change in size of the event tile)
      this.verifyEvent(this.props.mxEvent);
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onDeviceVerificationChanged", (userId, device) => {
      if (userId === this.props.mxEvent.getSender()) {
        this.verifyEvent(this.props.mxEvent);
      }
    });
    (0, _defineProperty2.default)(this, "onUserVerificationChanged", (userId, _trustStatus) => {
      if (userId === this.props.mxEvent.getSender()) {
        this.verifyEvent(this.props.mxEvent);
      }
    });
    (0, _defineProperty2.default)(this, "onSenderProfileClick", () => {
      _dispatcher.default.dispatch({
        action: _actions.Action.ComposerInsert,
        userId: this.props.mxEvent.getSender(),
        timelineRenderingType: this.context.timelineRenderingType
      });
    });
    (0, _defineProperty2.default)(this, "onRequestKeysClick", () => {
      this.setState({
        // Indicate in the UI that the keys have been requested (this is expected to
        // be reset if the component is mounted in the future).
        previouslyRequestedKeys: true
      }); // Cancel any outgoing key request for this event and resend it. If a response
      // is received for the request with the required keys, the event could be
      // decrypted successfully.

      _MatrixClientPeg.MatrixClientPeg.get().cancelAndResendEventRoomKeyRequest(this.props.mxEvent);
    });
    (0, _defineProperty2.default)(this, "onPermalinkClicked", e => {
      // This allows the permalink to be opened in a new tab/window or copied as
      // matrix.to, but also for it to enable routing within Element when clicked.
      e.preventDefault();

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        event_id: this.props.mxEvent.getId(),
        highlighted: true,
        room_id: this.props.mxEvent.getRoomId(),
        metricsTrigger: this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Search ? "MessageSearch" : undefined
      });
    });
    (0, _defineProperty2.default)(this, "onActionBarFocusChange", actionBarFocused => {
      this.setState({
        actionBarFocused
      });
    });
    (0, _defineProperty2.default)(this, "getTile", () => this.tile.current);
    (0, _defineProperty2.default)(this, "getReplyChain", () => this.replyChain.current);
    (0, _defineProperty2.default)(this, "getReactions", () => {
      if (!this.props.showReactions || !this.props.getRelationsForEvent) {
        return null;
      }

      const eventId = this.props.mxEvent.getId();
      return this.props.getRelationsForEvent(eventId, "m.annotation", "m.reaction");
    });
    (0, _defineProperty2.default)(this, "onReactionsCreated", (relationType, eventType) => {
      if (relationType !== "m.annotation" || eventType !== "m.reaction") {
        return;
      }

      this.setState({
        reactions: this.getReactions()
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenu", ev => {
      this.showContextMenu(ev);
    });
    (0, _defineProperty2.default)(this, "onTimestampContextMenu", ev => {
      this.showContextMenu(ev, this.props.permalinkCreator?.forEvent(this.props.mxEvent.getId()));
    });
    (0, _defineProperty2.default)(this, "onCloseMenu", () => {
      this.setState({
        contextMenu: null,
        actionBarFocused: false
      });
    });
    (0, _defineProperty2.default)(this, "setQuoteExpanded", expanded => {
      this.setState({
        isQuoteExpanded: expanded
      });
    });
    const _thread = this.thread;
    this.state = {
      // Whether the action bar is focused.
      actionBarFocused: false,
      // Whether the event's sender has been verified.
      verified: null,
      // Whether onRequestKeysClick has been called since mounting.
      previouslyRequestedKeys: false,
      // The Relations model from the JS SDK for reactions to `mxEvent`
      reactions: this.getReactions(),
      // Context menu position
      contextMenu: null,
      hover: false,
      thread: _thread
    }; // don't do RR animations until we are mounted

    this.suppressReadReceiptAnimation = true; // Throughout the component we manage a read receipt listener to see if our tile still
    // qualifies for a "sent" or "sending" state (based on their relevant conditions). We
    // don't want to over-subscribe to the read receipt events being fired, so we use a flag
    // to determine if we've already subscribed and use a combination of other flags to find
    // out if we should even be subscribed at all.

    this.isListeningForReceipts = false;
  }
  /**
   * When true, the tile qualifies for some sort of special read receipt. This could be a 'sending'
   * or 'sent' receipt, for example.
   * @returns {boolean}
   */


  get isEligibleForSpecialReceipt() {
    // First, if there are other read receipts then just short-circuit this.
    if (this.props.readReceipts && this.props.readReceipts.length > 0) return false;
    if (!this.props.mxEvent) return false; // Sanity check (should never happen, but we shouldn't explode if it does)

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

    if (!room) return false; // Quickly check to see if the event was sent by us. If it wasn't, it won't qualify for
    // special read receipts.

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    if (this.props.mxEvent.getSender() !== myUserId) return false; // Finally, determine if the type is relevant to the user. This notably excludes state
    // events and pretty much anything that can't be sent by the composer as a message. For
    // those we rely on local echo giving the impression of things changing, and expect them
    // to be quick.

    const simpleSendableEvents = [_event.EventType.Sticker, _event.EventType.RoomMessage, _event.EventType.RoomMessageEncrypted];
    if (!simpleSendableEvents.includes(this.props.mxEvent.getType())) return false; // Default case

    return true;
  }

  get shouldShowSentReceipt() {
    // If we're not even eligible, don't show the receipt.
    if (!this.isEligibleForSpecialReceipt) return false; // We only show the 'sent' receipt on the last successful event.

    if (!this.props.lastSuccessful) return false; // Check to make sure the sending state is appropriate. A null/undefined send status means
    // that the message is 'sent', so we're just double checking that it's explicitly not sent.

    if (this.props.eventSendStatus && this.props.eventSendStatus !== _event2.EventStatus.SENT) return false; // If anyone has read the event besides us, we don't want to show a sent receipt.

    const receipts = this.props.readReceipts || [];

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    if (receipts.some(r => r.userId !== myUserId)) return false; // Finally, we should show a receipt.

    return true;
  }

  get shouldShowSendingReceipt() {
    // If we're not even eligible, don't show the receipt.
    if (!this.isEligibleForSpecialReceipt) return false; // Check the event send status to see if we are pending. Null/undefined status means the
    // message was sent, so check for that and 'sent' explicitly.

    if (!this.props.eventSendStatus || this.props.eventSendStatus === _event2.EventStatus.SENT) return false; // Default to showing - there's no other event properties/behaviours we care about at
    // this point.

    return true;
  } // TODO: [REACT-WARNING] Move into constructor
  // eslint-disable-next-line


  UNSAFE_componentWillMount() {
    this.verifyEvent(this.props.mxEvent);
  }

  componentDidMount() {
    this.suppressReadReceiptAnimation = false;

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!this.props.forExport) {
      client.on(_crypto.CryptoEvent.DeviceVerificationChanged, this.onDeviceVerificationChanged);
      client.on(_crypto.CryptoEvent.UserTrustStatusChanged, this.onUserVerificationChanged);
      this.props.mxEvent.on(_event2.MatrixEventEvent.Decrypted, this.onDecrypted);

      _DecryptionFailureTracker.DecryptionFailureTracker.instance.addVisibleEvent(this.props.mxEvent);

      if (this.props.showReactions) {
        this.props.mxEvent.on(_event2.MatrixEventEvent.RelationsCreated, this.onReactionsCreated);
      }

      if (this.shouldShowSentReceipt || this.shouldShowSendingReceipt) {
        client.on(_room.RoomEvent.Receipt, this.onRoomReceipt);
        this.isListeningForReceipts = true;
      }
    }

    if (_SettingsStore.default.getValue("feature_thread")) {
      this.props.mxEvent.on(_thread2.ThreadEvent.Update, this.updateThread);

      if (this.thread) {
        this.setupNotificationListener(this.thread);
      }
    }

    client.decryptEventIfNeeded(this.props.mxEvent);
    const room = client.getRoom(this.props.mxEvent.getRoomId());
    room?.on(_thread2.ThreadEvent.New, this.onNewThread);
  }

  setupNotificationListener(thread) {
    const notifications = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getThreadsRoomState(thread.room);

    this.threadState = notifications.getThreadRoomState(thread);
    this.threadState.on(_NotificationState.NotificationStateEvents.Update, this.onThreadStateUpdate);
    this.onThreadStateUpdate();
  }

  // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    // re-check the sender verification as outgoing events progress through
    // the send process.
    if (nextProps.eventSendStatus !== this.props.eventSendStatus) {
      this.verifyEvent(nextProps.mxEvent);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if ((0, _objects.objectHasDiff)(this.state, nextState)) {
      return true;
    }

    return !this.propsEqual(this.props, nextProps);
  }

  componentWillUnmount() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    client.removeListener(_crypto.CryptoEvent.DeviceVerificationChanged, this.onDeviceVerificationChanged);
    client.removeListener(_crypto.CryptoEvent.UserTrustStatusChanged, this.onUserVerificationChanged);
    client.removeListener(_room.RoomEvent.Receipt, this.onRoomReceipt);
    this.isListeningForReceipts = false;
    this.props.mxEvent.removeListener(_event2.MatrixEventEvent.Decrypted, this.onDecrypted);

    if (this.props.showReactions) {
      this.props.mxEvent.removeListener(_event2.MatrixEventEvent.RelationsCreated, this.onReactionsCreated);
    }

    if (_SettingsStore.default.getValue("feature_thread")) {
      this.props.mxEvent.off(_thread2.ThreadEvent.Update, this.updateThread);
    }

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

    room?.off(_thread2.ThreadEvent.New, this.onNewThread);

    if (this.threadState) {
      this.threadState.off(_NotificationState.NotificationStateEvents.Update, this.onThreadStateUpdate);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we're not listening for receipts and expect to be, register a listener.
    if (!this.isListeningForReceipts && (this.shouldShowSentReceipt || this.shouldShowSendingReceipt)) {
      _MatrixClientPeg.MatrixClientPeg.get().on(_room.RoomEvent.Receipt, this.onRoomReceipt);

      this.isListeningForReceipts = true;
    }
  }

  get thread() {
    if (!_SettingsStore.default.getValue("feature_thread")) {
      return null;
    }

    let thread = this.props.mxEvent.getThread();
    /**
     * Accessing the threads value through the room due to a race condition
     * that will be solved when there are proper backend support for threads
     * We currently have no reliable way to discover than an event is a thread
     * when we are at the sync stage
     */

    if (!thread) {
      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

      thread = room?.findThreadForEvent(this.props.mxEvent);
    }

    return thread ?? null;
  }

  renderThreadPanelSummary() {
    if (!this.state.thread) {
      return null;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ThreadPanel_replies"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ThreadPanel_replies_amount"
    }, this.state.thread.length), /*#__PURE__*/_react.default.createElement(_ThreadSummary.ThreadMessagePreview, {
      thread: this.state.thread
    }));
  }

  renderThreadInfo() {
    if (this.state.thread?.id === this.props.mxEvent.getId()) {
      return /*#__PURE__*/_react.default.createElement(_ThreadSummary.default, {
        mxEvent: this.props.mxEvent,
        thread: this.state.thread
      });
    }

    if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Search && this.props.mxEvent.threadRootId) {
      if (this.props.highlightLink) {
        return /*#__PURE__*/_react.default.createElement("a", {
          className: "mx_ThreadSummary_icon",
          href: this.props.highlightLink
        }, (0, _languageHandler._t)("From a thread"));
      }

      return /*#__PURE__*/_react.default.createElement("p", {
        className: "mx_ThreadSummary_icon"
      }, (0, _languageHandler._t)("From a thread"));
    }
  }

  async verifyEvent(mxEvent) {
    if (!mxEvent.isEncrypted() || mxEvent.isRedacted()) {
      return;
    }

    const encryptionInfo = _MatrixClientPeg.MatrixClientPeg.get().getEventEncryptionInfo(mxEvent);

    const senderId = mxEvent.getSender();

    const userTrust = _MatrixClientPeg.MatrixClientPeg.get().checkUserTrust(senderId);

    if (encryptionInfo.mismatchedSender) {
      // something definitely wrong is going on here
      this.setState({
        verified: _E2EIcon.E2EState.Warning
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    if (!userTrust.isCrossSigningVerified()) {
      // user is not verified, so default to everything is normal
      this.setState({
        verified: _E2EIcon.E2EState.Normal
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    const eventSenderTrust = encryptionInfo.sender && _MatrixClientPeg.MatrixClientPeg.get().checkDeviceTrust(senderId, encryptionInfo.sender.deviceId);

    if (!eventSenderTrust) {
      this.setState({
        verified: _E2EIcon.E2EState.Unknown
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    if (!eventSenderTrust.isVerified()) {
      this.setState({
        verified: _E2EIcon.E2EState.Warning
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    if (!encryptionInfo.authenticated) {
      this.setState({
        verified: _E2EIcon.E2EState.Unauthenticated
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    this.setState({
      verified: _E2EIcon.E2EState.Verified
    }, this.props.onHeightChanged); // Decryption may have caused a change in size
  }

  propsEqual(objA, objB) {
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i];

      if (!objB.hasOwnProperty(key)) {
        return false;
      } // need to deep-compare readReceipts


      if (key === 'readReceipts') {
        const rA = objA[key];
        const rB = objB[key];

        if (rA === rB) {
          continue;
        }

        if (!rA || !rB) {
          return false;
        }

        if (rA.length !== rB.length) {
          return false;
        }

        for (let j = 0; j < rA.length; j++) {
          if (rA[j].userId !== rB[j].userId) {
            return false;
          } // one has a member set and the other doesn't?


          if (rA[j].roomMember !== rB[j].roomMember) {
            return false;
          }
        }
      } else {
        if (objA[key] !== objB[key]) {
          return false;
        }
      }
    }

    return true;
  }

  shouldHighlight() {
    if (this.props.forExport) return false;
    if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Notification) return false;
    if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.ThreadsList) return false;

    const actions = _MatrixClientPeg.MatrixClientPeg.get().getPushActionsForEvent(this.props.mxEvent.replacingEvent() || this.props.mxEvent);

    if (!actions || !actions.tweaks) {
      return false;
    } // don't show self-highlights from another of our clients


    if (this.props.mxEvent.getSender() === _MatrixClientPeg.MatrixClientPeg.get().credentials.userId) {
      return false;
    }

    return actions.tweaks.highlight;
  }

  renderE2EPadlock() {
    const ev = this.props.mxEvent; // no icon for local rooms

    if ((0, _isLocalRoom.isLocalRoom)(ev.getRoomId())) return; // event could not be decrypted

    if (ev.getContent().msgtype === 'm.bad.encrypted') {
      return /*#__PURE__*/_react.default.createElement(E2ePadlockUndecryptable, null);
    } // event is encrypted and not redacted, display padlock corresponding to whether or not it is verified


    if (ev.isEncrypted() && !ev.isRedacted()) {
      if (this.state.verified === _E2EIcon.E2EState.Normal) {
        return; // no icon if we've not even cross-signed the user
      } else if (this.state.verified === _E2EIcon.E2EState.Verified) {
        return; // no icon for verified
      } else if (this.state.verified === _E2EIcon.E2EState.Unauthenticated) {
        return /*#__PURE__*/_react.default.createElement(E2ePadlockUnauthenticated, null);
      } else if (this.state.verified === _E2EIcon.E2EState.Unknown) {
        return /*#__PURE__*/_react.default.createElement(E2ePadlockUnknown, null);
      } else {
        return /*#__PURE__*/_react.default.createElement(E2ePadlockUnverified, null);
      }
    }

    if (_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(ev.getRoomId())) {
      // else if room is encrypted
      // and event is being encrypted or is not_sent (Unknown Devices/Network Error)
      if (ev.status === _event2.EventStatus.ENCRYPTING) {
        return;
      }

      if (ev.status === _event2.EventStatus.NOT_SENT) {
        return;
      }

      if (ev.isState()) {
        return; // we expect this to be unencrypted
      }

      if (ev.isRedacted()) {
        return; // we expect this to be unencrypted
      } // if the event is not encrypted, but it's an e2e room, show the open padlock


      return /*#__PURE__*/_react.default.createElement(E2ePadlockUnencrypted, null);
    } // no padlock needed


    return null;
  }

  showContextMenu(ev, permalink) {
    const clickTarget = ev.target; // Try to find an anchor element

    const anchorElement = clickTarget instanceof HTMLAnchorElement ? clickTarget : clickTarget.closest("a"); // There is no way to copy non-PNG images into clipboard, so we can't
    // have our own handling for copying images, so we leave it to the
    // Electron layer (webcontents-handler.ts)

    if (clickTarget instanceof HTMLImageElement) return; // Return if we're in a browser and click either an a tag or we have
    // selected text, as in those cases we want to use the native browser
    // menu

    if (!_PlatformPeg.default.get().allowOverridingNativeContextMenus() && ((0, _strings.getSelectedText)() || anchorElement)) return; // We don't want to show the menu when editing a message

    if (this.props.editState) return;
    ev.preventDefault();
    ev.stopPropagation();
    this.setState({
      contextMenu: {
        position: {
          left: ev.clientX,
          top: ev.clientY,
          bottom: ev.clientY
        },
        link: anchorElement?.href || permalink
      },
      actionBarFocused: true
    });
  }

  /**
   * In some cases we can't use shouldHideEvent() since whether or not we hide
   * an event depends on other things that the event itself
   * @returns {boolean} true if event should be hidden
   */
  shouldHideEvent() {
    // If the call was replaced we don't render anything since we render the other call
    if (this.props.callEventGrouper?.hangupReason === _call.CallErrorCode.Replaced) return true;
    return false;
  }

  renderContextMenu() {
    if (!this.state.contextMenu) return null;
    const tile = this.getTile();
    const replyChain = this.getReplyChain();
    const eventTileOps = tile?.getEventTileOps ? tile.getEventTileOps() : undefined;
    const collapseReplyChain = replyChain?.canCollapse() ? replyChain.collapse : undefined;
    return /*#__PURE__*/_react.default.createElement(_MessageContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.aboveRightOf)(this.state.contextMenu.position), {
      mxEvent: this.props.mxEvent,
      permalinkCreator: this.props.permalinkCreator,
      eventTileOps: eventTileOps,
      collapseReplyChain: collapseReplyChain,
      onFinished: this.onCloseMenu,
      rightClick: true,
      reactions: this.state.reactions,
      link: this.state.contextMenu.link
    }));
  }

  render() {
    const msgtype = this.props.mxEvent.getContent().msgtype;
    const eventType = this.props.mxEvent.getType();
    const {
      hasRenderer,
      isBubbleMessage,
      isInfoMessage,
      isLeftAlignedBubbleMessage,
      noBubbleEvent,
      isSeeingThroughMessageHiddenForModeration
    } = (0, _EventRenderingUtils.getEventDisplayInfo)(this.props.mxEvent, this.context.showHiddenEvents, this.shouldHideEvent());
    const {
      isQuoteExpanded
    } = this.state; // This shouldn't happen: the caller should check we support this type
    // before trying to instantiate us

    if (!hasRenderer) {
      const {
        mxEvent
      } = this.props;

      _logger.logger.warn(`Event type not supported: type:${eventType} isState:${mxEvent.isState()}`);

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile mx_EventTile_info mx_MNoticeBody"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile_line"
      }, (0, _languageHandler._t)('This event could not be displayed')));
    }

    const isProbablyMedia = _MediaEventHelper.MediaEventHelper.isEligible(this.props.mxEvent);

    const lineClasses = (0, _classnames.default)("mx_EventTile_line", {
      mx_EventTile_mediaLine: isProbablyMedia,
      mx_EventTile_image: this.props.mxEvent.getType() === _event.EventType.RoomMessage && this.props.mxEvent.getContent().msgtype === _event.MsgType.Image,
      mx_EventTile_sticker: this.props.mxEvent.getType() === _event.EventType.Sticker,
      mx_EventTile_emote: this.props.mxEvent.getType() === _event.EventType.RoomMessage && this.props.mxEvent.getContent().msgtype === _event.MsgType.Emote
    });
    const isSending = ['sending', 'queued', 'encrypting'].indexOf(this.props.eventSendStatus) !== -1;
    const isRedacted = (0, _EventTileFactory.isMessageEvent)(this.props.mxEvent) && this.props.isRedacted;
    const isEncryptionFailure = this.props.mxEvent.isDecryptionFailure();
    let isContinuation = this.props.continuation;

    if (this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Room && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Search && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Thread && this.props.layout !== _Layout.Layout.Bubble) {
      isContinuation = false;
    }

    const isEditing = !!this.props.editState;
    const classes = (0, _classnames.default)({
      mx_EventTile_bubbleContainer: isBubbleMessage,
      mx_EventTile_leftAlignedBubble: isLeftAlignedBubbleMessage,
      mx_EventTile: true,
      mx_EventTile_isEditing: isEditing,
      mx_EventTile_info: isInfoMessage,
      mx_EventTile_12hr: this.props.isTwelveHour,
      // Note: we keep the `sending` state class for tests, not for our styles
      mx_EventTile_sending: !isEditing && isSending,
      mx_EventTile_highlight: this.shouldHighlight(),
      mx_EventTile_selected: this.props.isSelectedEvent || this.state.contextMenu,
      mx_EventTile_continuation: isContinuation || eventType === _event.EventType.CallInvite,
      mx_EventTile_last: this.props.last,
      mx_EventTile_lastInSection: this.props.lastInSection,
      mx_EventTile_contextual: this.props.contextual,
      mx_EventTile_actionBarFocused: this.state.actionBarFocused,
      mx_EventTile_verified: !isBubbleMessage && this.state.verified === _E2EIcon.E2EState.Verified,
      mx_EventTile_unverified: !isBubbleMessage && this.state.verified === _E2EIcon.E2EState.Warning,
      mx_EventTile_unknown: !isBubbleMessage && this.state.verified === _E2EIcon.E2EState.Unknown,
      mx_EventTile_bad: isEncryptionFailure,
      mx_EventTile_emote: msgtype === _event.MsgType.Emote,
      mx_EventTile_noSender: this.props.hideSender,
      mx_EventTile_clamp: this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.ThreadsList,
      mx_EventTile_noBubble: noBubbleEvent
    }); // If the tile is in the Sending state, don't speak the message.

    const ariaLive = this.props.eventSendStatus !== null ? 'off' : undefined;
    let permalink = "#";

    if (this.props.permalinkCreator) {
      permalink = this.props.permalinkCreator.forEvent(this.props.mxEvent.getId());
    } // we can't use local echoes as scroll tokens, because their event IDs change.
    // Local echos have a send "status".


    const scrollToken = this.props.mxEvent.status ? undefined : this.props.mxEvent.getId();
    let avatar;
    let sender;
    let avatarSize;
    let needsSenderProfile;

    if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Notification) {
      avatarSize = 24;
      needsSenderProfile = true;
    } else if (isInfoMessage) {
      // a small avatar, with no sender profile, for
      // joins/parts/etc
      avatarSize = 14;
      needsSenderProfile = false;
    } else if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.ThreadsList || this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Thread && !this.props.continuation) {
      avatarSize = 32;
      needsSenderProfile = true;
    } else if (eventType === _event.EventType.RoomCreate || isBubbleMessage) {
      avatarSize = 0;
      needsSenderProfile = false;
    } else if (this.props.layout == _Layout.Layout.IRC) {
      avatarSize = 14;
      needsSenderProfile = true;
    } else if (this.props.continuation && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.File || eventType === _event.EventType.CallInvite) {
      // no avatar or sender profile for continuation messages and call tiles
      avatarSize = 0;
      needsSenderProfile = false;
    } else {
      avatarSize = 30;
      needsSenderProfile = true;
    }

    if (this.props.mxEvent.sender && avatarSize) {
      let member; // set member to receiver (target) if it is a 3PID invite
      // so that the correct avatar is shown as the text is
      // `$target accepted the invitation for $email`

      if (this.props.mxEvent.getContent().third_party_invite) {
        member = this.props.mxEvent.target;
      } else {
        member = this.props.mxEvent.sender;
      }

      avatar = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile_avatar"
      }, /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
        member: member,
        width: avatarSize,
        height: avatarSize,
        viewUserOnClick: true,
        forceHistorical: this.props.mxEvent.getType() === _event.EventType.RoomMember
      }));
    }

    if (needsSenderProfile && this.props.hideSender !== true) {
      if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Room || this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Search || this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Pinned || this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Thread) {
        sender = /*#__PURE__*/_react.default.createElement(_SenderProfile.default, {
          onClick: this.onSenderProfileClick,
          mxEvent: this.props.mxEvent
        });
      } else {
        sender = /*#__PURE__*/_react.default.createElement(_SenderProfile.default, {
          mxEvent: this.props.mxEvent
        });
      }
    }

    const showMessageActionBar = !isEditing && !this.props.forExport;
    const actionBar = showMessageActionBar ? /*#__PURE__*/_react.default.createElement(_MessageActionBar.default, {
      mxEvent: this.props.mxEvent,
      reactions: this.state.reactions,
      permalinkCreator: this.props.permalinkCreator,
      getTile: this.getTile,
      getReplyChain: this.getReplyChain,
      onFocusChange: this.onActionBarFocusChange,
      isQuoteExpanded: isQuoteExpanded,
      toggleThreadExpanded: () => this.setQuoteExpanded(!isQuoteExpanded),
      getRelationsForEvent: this.props.getRelationsForEvent
    }) : undefined;
    const showTimestamp = this.props.mxEvent.getTs() && (this.props.alwaysShowTimestamps || this.props.last || this.state.hover || this.state.actionBarFocused || Boolean(this.state.contextMenu)); // Thread panel shows the timestamp of the last reply in that thread

    let ts = this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.ThreadsList ? this.props.mxEvent.getTs() : this.state.thread?.replyToEvent?.getTs();

    if (typeof ts !== "number") {
      // Fall back to something we can use
      ts = this.props.mxEvent.getTs();
    }

    const messageTimestamp = /*#__PURE__*/_react.default.createElement(_MessageTimestamp.default, {
      showRelative: this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.ThreadsList,
      showTwelveHour: this.props.isTwelveHour,
      ts: ts
    });

    const timestamp = showTimestamp && ts ? messageTimestamp : null;

    const keyRequestHelpText = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EventTile_keyRequestInfo_tooltip_contents"
    }, /*#__PURE__*/_react.default.createElement("p", null, this.state.previouslyRequestedKeys ? (0, _languageHandler._t)('Your key share request has been sent - please check your other sessions ' + 'for key share requests.') : (0, _languageHandler._t)('Key share requests are sent to your other sessions automatically. If you ' + 'rejected or dismissed the key share request on your other sessions, click ' + 'here to request the keys for this session again.')), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('If your other sessions do not have the key for this message you will not ' + 'be able to decrypt them.')));

    const keyRequestInfoContent = this.state.previouslyRequestedKeys ? (0, _languageHandler._t)('Key request sent.') : (0, _languageHandler._t)('<requestLink>Re-request encryption keys</requestLink> from your other sessions.', {}, {
      'requestLink': sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_EventTile_rerequestKeysCta",
        kind: "link_inline",
        tabIndex: 0,
        onClick: this.onRequestKeysClick
      }, sub)
    });
    const keyRequestInfo = isEncryptionFailure && !isRedacted ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EventTile_keyRequestInfo"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_keyRequestInfo_text"
    }, keyRequestInfoContent), /*#__PURE__*/_react.default.createElement(_TooltipButton.default, {
      helpText: keyRequestHelpText
    })) : null;
    let reactionsRow;

    if (!isRedacted) {
      reactionsRow = /*#__PURE__*/_react.default.createElement(_ReactionsRow.default, {
        mxEvent: this.props.mxEvent,
        reactions: this.state.reactions,
        key: "mx_EventTile_reactionsRow"
      });
    }

    const linkedTimestamp = /*#__PURE__*/_react.default.createElement("a", {
      href: permalink,
      onClick: this.onPermalinkClicked,
      "aria-label": (0, _DateUtils.formatTime)(new Date(this.props.mxEvent.getTs()), this.props.isTwelveHour),
      onContextMenu: this.onTimestampContextMenu
    }, timestamp);

    const useIRCLayout = this.props.layout === _Layout.Layout.IRC;
    const groupTimestamp = !useIRCLayout ? linkedTimestamp : null;
    const ircTimestamp = useIRCLayout ? linkedTimestamp : null;
    const bubbleTimestamp = this.props.layout === _Layout.Layout.Bubble ? messageTimestamp : null;
    const groupPadlock = !useIRCLayout && !isBubbleMessage && this.renderE2EPadlock();
    const ircPadlock = useIRCLayout && !isBubbleMessage && this.renderE2EPadlock();
    let msgOption;

    if (this.props.showReadReceipts) {
      if (this.shouldShowSentReceipt || this.shouldShowSendingReceipt) {
        msgOption = /*#__PURE__*/_react.default.createElement(SentReceipt, {
          messageState: this.props.mxEvent.getAssociatedStatus()
        });
      } else {
        msgOption = /*#__PURE__*/_react.default.createElement(_ReadReceiptGroup.ReadReceiptGroup, {
          readReceipts: this.props.readReceipts ?? [],
          readReceiptMap: this.props.readReceiptMap ?? {},
          checkUnmounting: this.props.checkUnmounting,
          suppressAnimation: this.suppressReadReceiptAnimation,
          isTwelveHour: this.props.isTwelveHour
        });
      }
    }

    let replyChain;

    if ((0, _EventTileFactory.haveRendererForEvent)(this.props.mxEvent, this.context.showHiddenEvents) && (0, _Reply.shouldDisplayReply)(this.props.mxEvent)) {
      replyChain = /*#__PURE__*/_react.default.createElement(_ReplyChain.default, {
        parentEv: this.props.mxEvent,
        onHeightChanged: this.props.onHeightChanged,
        ref: this.replyChain,
        forExport: this.props.forExport,
        permalinkCreator: this.props.permalinkCreator,
        layout: this.props.layout,
        alwaysShowTimestamps: this.props.alwaysShowTimestamps || this.state.hover,
        isQuoteExpanded: isQuoteExpanded,
        setQuoteExpanded: this.setQuoteExpanded,
        getRelationsForEvent: this.props.getRelationsForEvent
      });
    } // Use `getSender()` because searched events might not have a proper `sender`.


    const isOwnEvent = this.props.mxEvent?.getSender() === _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    switch (this.context.timelineRenderingType) {
      case _RoomContext.TimelineRenderingType.Notification:
        {
          const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

          return /*#__PURE__*/_react.default.createElement(this.props.as || "li", {
            "className": classes,
            "aria-live": ariaLive,
            "aria-atomic": true,
            "data-scroll-tokens": scrollToken
          }, [/*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_roomName",
            key: "mx_EventTile_roomName"
          }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
            room: room,
            width: 28,
            height: 28
          }), /*#__PURE__*/_react.default.createElement("a", {
            href: permalink,
            onClick: this.onPermalinkClicked
          }, room ? room.name : '')), /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_senderDetails",
            key: "mx_EventTile_senderDetails"
          }, avatar, /*#__PURE__*/_react.default.createElement("a", {
            href: permalink,
            onClick: this.onPermalinkClicked,
            onContextMenu: this.onTimestampContextMenu
          }, sender, timestamp)), /*#__PURE__*/_react.default.createElement("div", {
            className: lineClasses,
            key: "mx_EventTile_line",
            onContextMenu: this.onContextMenu
          }, this.renderContextMenu(), (0, _EventTileFactory.renderTile)(_RoomContext.TimelineRenderingType.Notification, _objectSpread(_objectSpread({}, this.props), {}, {
            // overrides
            ref: this.tile,
            isSeeingThroughMessageHiddenForModeration,
            // appease TS
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            onHeightChanged: this.props.onHeightChanged,
            permalinkCreator: this.props.permalinkCreator
          }), this.context.showHiddenEvents))]);
        }

      case _RoomContext.TimelineRenderingType.Thread:
        {
          const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

          return /*#__PURE__*/_react.default.createElement(this.props.as || "li", {
            "ref": this.ref,
            "className": classes,
            "aria-live": ariaLive,
            "aria-atomic": true,
            "data-scroll-tokens": scrollToken,
            "data-has-reply": !!replyChain,
            "data-layout": this.props.layout,
            "data-self": isOwnEvent,
            "data-event-id": this.props.mxEvent.getId(),
            "onMouseEnter": () => this.setState({
              hover: true
            }),
            "onMouseLeave": () => this.setState({
              hover: false
            })
          }, [/*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_roomName",
            key: "mx_EventTile_roomName"
          }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
            room: room,
            width: 28,
            height: 28
          }), /*#__PURE__*/_react.default.createElement("a", {
            href: permalink,
            onClick: this.onPermalinkClicked
          }, room ? room.name : '')), /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_senderDetails",
            key: "mx_EventTile_senderDetails"
          }, avatar, sender), /*#__PURE__*/_react.default.createElement("div", {
            className: lineClasses,
            key: "mx_EventTile_line",
            onContextMenu: this.onContextMenu
          }, this.renderContextMenu(), replyChain, (0, _EventTileFactory.renderTile)(_RoomContext.TimelineRenderingType.Thread, _objectSpread(_objectSpread({}, this.props), {}, {
            // overrides
            ref: this.tile,
            isSeeingThroughMessageHiddenForModeration,
            // appease TS
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            onHeightChanged: this.props.onHeightChanged,
            permalinkCreator: this.props.permalinkCreator
          }), this.context.showHiddenEvents), actionBar, /*#__PURE__*/_react.default.createElement("a", {
            href: permalink,
            onClick: this.onPermalinkClicked
          }, timestamp)), reactionsRow]);
        }

      case _RoomContext.TimelineRenderingType.ThreadsList:
        {
          // tab-index=-1 to allow it to be focusable but do not add tab stop for it, primarily for screen readers
          return /*#__PURE__*/_react.default.createElement(this.props.as || "li", {
            "ref": this.ref,
            "className": classes,
            "tabIndex": -1,
            "aria-live": ariaLive,
            "aria-atomic": "true",
            "data-scroll-tokens": scrollToken,
            "data-layout": this.props.layout,
            "data-shape": this.context.timelineRenderingType,
            "data-self": isOwnEvent,
            "data-has-reply": !!replyChain,
            "data-notification": this.state.threadNotification,
            "onMouseEnter": () => this.setState({
              hover: true
            }),
            "onMouseLeave": () => this.setState({
              hover: false
            }),
            "onClick": ev => {
              _dispatcher.default.dispatch({
                action: _actions.Action.ShowThread,
                rootEvent: this.props.mxEvent,
                push: true
              });

              const target = ev.currentTarget;
              const index = Array.from(target.parentElement.children).indexOf(target);

              _PosthogTrackers.default.trackInteraction("WebThreadsPanelThreadItem", ev, index);
            }
          }, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, sender, avatar, timestamp, /*#__PURE__*/_react.default.createElement("div", {
            className: lineClasses,
            key: "mx_EventTile_line"
          }, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_body"
          }, this.props.mxEvent.isRedacted() ? /*#__PURE__*/_react.default.createElement(_RedactedBody.default, {
            mxEvent: this.props.mxEvent
          }) : _MessagePreviewStore.MessagePreviewStore.instance.generatePreviewForEvent(this.props.mxEvent)), this.renderThreadPanelSummary()), /*#__PURE__*/_react.default.createElement(_Toolbar.default, {
            className: "mx_MessageActionBar",
            "aria-label": (0, _languageHandler._t)("Message Actions"),
            "aria-live": "off"
          }, /*#__PURE__*/_react.default.createElement(_RovingAccessibleTooltipButton.RovingAccessibleTooltipButton, {
            className: "mx_MessageActionBar_iconButton",
            onClick: this.viewInRoom,
            title: (0, _languageHandler._t)("View in room"),
            key: "view_in_room"
          }, /*#__PURE__*/_react.default.createElement(_viewInRoom.Icon, null)), /*#__PURE__*/_react.default.createElement(_RovingAccessibleTooltipButton.RovingAccessibleTooltipButton, {
            className: "mx_MessageActionBar_iconButton",
            onClick: this.copyLinkToThread,
            title: (0, _languageHandler._t)("Copy link to thread"),
            key: "copy_link_to_thread"
          }, /*#__PURE__*/_react.default.createElement(_link.Icon, null))), msgOption));
        }

      case _RoomContext.TimelineRenderingType.File:
        {
          return /*#__PURE__*/_react.default.createElement(this.props.as || "li", {
            "className": classes,
            "aria-live": ariaLive,
            "aria-atomic": true,
            "data-scroll-tokens": scrollToken
          }, [/*#__PURE__*/_react.default.createElement("div", {
            className: lineClasses,
            key: "mx_EventTile_line",
            onContextMenu: this.onContextMenu
          }, this.renderContextMenu(), (0, _EventTileFactory.renderTile)(_RoomContext.TimelineRenderingType.File, _objectSpread(_objectSpread({}, this.props), {}, {
            // overrides
            ref: this.tile,
            isSeeingThroughMessageHiddenForModeration,
            // appease TS
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            onHeightChanged: this.props.onHeightChanged,
            permalinkCreator: this.props.permalinkCreator
          }), this.context.showHiddenEvents)), /*#__PURE__*/_react.default.createElement("a", {
            className: "mx_EventTile_senderDetailsLink",
            key: "mx_EventTile_senderDetailsLink",
            href: permalink,
            onClick: this.onPermalinkClicked
          }, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_senderDetails",
            onContextMenu: this.onTimestampContextMenu
          }, sender, timestamp))]);
        }

      default:
        {
          // Pinned, Room, Search
          // tab-index=-1 to allow it to be focusable but do not add tab stop for it, primarily for screen readers
          return /*#__PURE__*/_react.default.createElement(this.props.as || "li", {
            "ref": this.ref,
            "className": classes,
            "tabIndex": -1,
            "aria-live": ariaLive,
            "aria-atomic": "true",
            "data-scroll-tokens": scrollToken,
            "data-layout": this.props.layout,
            "data-self": isOwnEvent,
            "data-event-id": this.props.mxEvent.getId(),
            "data-has-reply": !!replyChain,
            "onMouseEnter": () => this.setState({
              hover: true
            }),
            "onMouseLeave": () => this.setState({
              hover: false
            })
          }, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, ircTimestamp, sender, ircPadlock, avatar, /*#__PURE__*/_react.default.createElement("div", {
            className: lineClasses,
            key: "mx_EventTile_line",
            onContextMenu: this.onContextMenu
          }, this.renderContextMenu(), groupTimestamp, groupPadlock, replyChain, (0, _EventTileFactory.renderTile)(this.context.timelineRenderingType, _objectSpread(_objectSpread({}, this.props), {}, {
            // overrides
            ref: this.tile,
            isSeeingThroughMessageHiddenForModeration,
            timestamp: bubbleTimestamp,
            // appease TS
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            onHeightChanged: this.props.onHeightChanged,
            permalinkCreator: this.props.permalinkCreator
          }), this.context.showHiddenEvents), keyRequestInfo, actionBar, this.props.layout === _Layout.Layout.IRC && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, reactionsRow, this.renderThreadInfo())), this.props.layout !== _Layout.Layout.IRC && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, reactionsRow, this.renderThreadInfo()), msgOption));
        }
    }
  }

} // Wrap all event tiles with the tile error boundary so that any throws even during construction are captured


exports.UnwrappedEventTile = UnwrappedEventTile;
(0, _defineProperty2.default)(UnwrappedEventTile, "defaultProps", {
  // no-op function because onHeightChanged is optional yet some sub-components assume its existence
  onHeightChanged: function () {},
  forExport: false,
  layout: _Layout.Layout.Group
});
(0, _defineProperty2.default)(UnwrappedEventTile, "contextType", _RoomContext.default);
const SafeEventTile = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  return /*#__PURE__*/_react.default.createElement(_TileErrorBoundary.default, {
    mxEvent: props.mxEvent,
    layout: props.layout
  }, /*#__PURE__*/_react.default.createElement(UnwrappedEventTile, (0, _extends2.default)({
    ref: ref
  }, props)));
});
var _default = SafeEventTile;
exports.default = _default;

function E2ePadlockUndecryptable(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("This message cannot be decrypted"),
    icon: E2ePadlockIcon.Warning
  }, props));
}

function E2ePadlockUnverified(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("Encrypted by an unverified session"),
    icon: E2ePadlockIcon.Warning
  }, props));
}

function E2ePadlockUnencrypted(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("Unencrypted"),
    icon: E2ePadlockIcon.Warning
  }, props));
}

function E2ePadlockUnknown(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("Encrypted by a deleted session"),
    icon: E2ePadlockIcon.Normal
  }, props));
}

function E2ePadlockUnauthenticated(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("The authenticity of this encrypted message can't be guaranteed on this device."),
    icon: E2ePadlockIcon.Normal
  }, props));
}

var E2ePadlockIcon;

(function (E2ePadlockIcon) {
  E2ePadlockIcon["Normal"] = "normal";
  E2ePadlockIcon["Warning"] = "warning";
})(E2ePadlockIcon || (E2ePadlockIcon = {}));

class E2ePadlock extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onHoverStart", () => {
      this.setState({
        hover: true
      });
    });
    (0, _defineProperty2.default)(this, "onHoverEnd", () => {
      this.setState({
        hover: false
      });
    });
    this.state = {
      hover: false
    };
  }

  render() {
    let tooltip = null;

    if (this.state.hover) {
      tooltip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
        className: "mx_EventTile_e2eIcon_tooltip",
        label: this.props.title
      });
    }

    const classes = `mx_EventTile_e2eIcon mx_EventTile_e2eIcon_${this.props.icon}`;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      onMouseEnter: this.onHoverStart,
      onMouseLeave: this.onHoverEnd
    }, tooltip);
  }

}

function SentReceipt(_ref) {
  let {
    messageState
  } = _ref;
  const isSent = !messageState || messageState === 'sent';
  const isFailed = messageState === 'not_sent';
  const receiptClasses = (0, _classnames.default)({
    'mx_EventTile_receiptSent': isSent,
    'mx_EventTile_receiptSending': !isSent && !isFailed
  });
  let nonCssBadge = null;

  if (isFailed) {
    nonCssBadge = /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
      notification: _StaticNotificationState.StaticNotificationState.RED_EXCLAMATION
    });
  }

  let label = (0, _languageHandler._t)("Sending your message...");

  if (messageState === 'encrypting') {
    label = (0, _languageHandler._t)("Encrypting your message...");
  } else if (isSent) {
    label = (0, _languageHandler._t)("Your message was sent");
  } else if (isFailed) {
    label = (0, _languageHandler._t)("Failed to send");
  }

  const [{
    showTooltip,
    hideTooltip
  }, tooltip] = (0, _useTooltip.useTooltip)({
    label: label,
    alignment: _Tooltip.Alignment.TopRight
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_EventTile_msgOption"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ReadReceiptGroup"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ReadReceiptGroup_button",
    onMouseOver: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_ReadReceiptGroup_container"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: receiptClasses
  }, nonCssBadge))), tooltip));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVbndyYXBwZWRFdmVudFRpbGUiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwiY3JlYXRlUmVmIiwidGhyZWFkTm90aWZpY2F0aW9uIiwidGhyZWFkU3RhdGUiLCJjb2xvciIsIk5vdGlmaWNhdGlvbkNvbG9yIiwiR3JleSIsIk5vdGlmaWNhdGlvbkNvdW50VHlwZSIsIlRvdGFsIiwiUmVkIiwiSGlnaGxpZ2h0Iiwic2V0U3RhdGUiLCJ0aHJlYWQiLCJzdGF0ZSIsIm9mZiIsIk5vdGlmaWNhdGlvblN0YXRlRXZlbnRzIiwiVXBkYXRlIiwib25UaHJlYWRTdGF0ZVVwZGF0ZSIsInNldHVwTm90aWZpY2F0aW9uTGlzdGVuZXIiLCJpZCIsIm14RXZlbnQiLCJnZXRJZCIsInVwZGF0ZVRocmVhZCIsInJvb20iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwiZ2V0Um9vbUlkIiwiVGhyZWFkRXZlbnQiLCJOZXciLCJvbk5ld1RocmVhZCIsImV2dCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3Um9vbSIsImV2ZW50X2lkIiwiaGlnaGxpZ2h0ZWQiLCJyb29tX2lkIiwibWV0cmljc1RyaWdnZXIiLCJ1bmRlZmluZWQiLCJwZXJtYWxpbmtDcmVhdG9yIiwibWF0cml4VG9VcmwiLCJmb3JFdmVudCIsImNvcHlQbGFpbnRleHQiLCJldiIsInRpbGVSb29tIiwic2hvdWxkU2hvd1NlbnRSZWNlaXB0Iiwic2hvdWxkU2hvd1NlbmRpbmdSZWNlaXB0IiwiaXNMaXN0ZW5pbmdGb3JSZWNlaXB0cyIsImZvcmNlVXBkYXRlIiwicmVtb3ZlTGlzdGVuZXIiLCJSb29tRXZlbnQiLCJSZWNlaXB0Iiwib25Sb29tUmVjZWlwdCIsInZlcmlmeUV2ZW50IiwidXNlcklkIiwiZGV2aWNlIiwiZ2V0U2VuZGVyIiwiX3RydXN0U3RhdHVzIiwiQ29tcG9zZXJJbnNlcnQiLCJ0aW1lbGluZVJlbmRlcmluZ1R5cGUiLCJwcmV2aW91c2x5UmVxdWVzdGVkS2V5cyIsImNhbmNlbEFuZFJlc2VuZEV2ZW50Um9vbUtleVJlcXVlc3QiLCJlIiwiVGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiU2VhcmNoIiwiYWN0aW9uQmFyRm9jdXNlZCIsInRpbGUiLCJjdXJyZW50IiwicmVwbHlDaGFpbiIsInNob3dSZWFjdGlvbnMiLCJnZXRSZWxhdGlvbnNGb3JFdmVudCIsImV2ZW50SWQiLCJyZWxhdGlvblR5cGUiLCJldmVudFR5cGUiLCJyZWFjdGlvbnMiLCJnZXRSZWFjdGlvbnMiLCJzaG93Q29udGV4dE1lbnUiLCJjb250ZXh0TWVudSIsImV4cGFuZGVkIiwiaXNRdW90ZUV4cGFuZGVkIiwidmVyaWZpZWQiLCJob3ZlciIsInN1cHByZXNzUmVhZFJlY2VpcHRBbmltYXRpb24iLCJpc0VsaWdpYmxlRm9yU3BlY2lhbFJlY2VpcHQiLCJyZWFkUmVjZWlwdHMiLCJsZW5ndGgiLCJteVVzZXJJZCIsImdldFVzZXJJZCIsInNpbXBsZVNlbmRhYmxlRXZlbnRzIiwiRXZlbnRUeXBlIiwiU3RpY2tlciIsIlJvb21NZXNzYWdlIiwiUm9vbU1lc3NhZ2VFbmNyeXB0ZWQiLCJpbmNsdWRlcyIsImdldFR5cGUiLCJsYXN0U3VjY2Vzc2Z1bCIsImV2ZW50U2VuZFN0YXR1cyIsIkV2ZW50U3RhdHVzIiwiU0VOVCIsInJlY2VpcHRzIiwic29tZSIsInIiLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiY29tcG9uZW50RGlkTW91bnQiLCJjbGllbnQiLCJmb3JFeHBvcnQiLCJvbiIsIkNyeXB0b0V2ZW50IiwiRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIlVzZXJUcnVzdFN0YXR1c0NoYW5nZWQiLCJvblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkIiwiTWF0cml4RXZlbnRFdmVudCIsIkRlY3J5cHRlZCIsIm9uRGVjcnlwdGVkIiwiRGVjcnlwdGlvbkZhaWx1cmVUcmFja2VyIiwiaW5zdGFuY2UiLCJhZGRWaXNpYmxlRXZlbnQiLCJSZWxhdGlvbnNDcmVhdGVkIiwib25SZWFjdGlvbnNDcmVhdGVkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiZGVjcnlwdEV2ZW50SWZOZWVkZWQiLCJub3RpZmljYXRpb25zIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJnZXRUaHJlYWRzUm9vbVN0YXRlIiwiZ2V0VGhyZWFkUm9vbVN0YXRlIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0U3RhdGUiLCJvYmplY3RIYXNEaWZmIiwicHJvcHNFcXVhbCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwic25hcHNob3QiLCJnZXRUaHJlYWQiLCJmaW5kVGhyZWFkRm9yRXZlbnQiLCJyZW5kZXJUaHJlYWRQYW5lbFN1bW1hcnkiLCJyZW5kZXJUaHJlYWRJbmZvIiwidGhyZWFkUm9vdElkIiwiaGlnaGxpZ2h0TGluayIsIl90IiwiaXNFbmNyeXB0ZWQiLCJpc1JlZGFjdGVkIiwiZW5jcnlwdGlvbkluZm8iLCJnZXRFdmVudEVuY3J5cHRpb25JbmZvIiwic2VuZGVySWQiLCJ1c2VyVHJ1c3QiLCJjaGVja1VzZXJUcnVzdCIsIm1pc21hdGNoZWRTZW5kZXIiLCJFMkVTdGF0ZSIsIldhcm5pbmciLCJvbkhlaWdodENoYW5nZWQiLCJpc0Nyb3NzU2lnbmluZ1ZlcmlmaWVkIiwiTm9ybWFsIiwiZXZlbnRTZW5kZXJUcnVzdCIsInNlbmRlciIsImNoZWNrRGV2aWNlVHJ1c3QiLCJkZXZpY2VJZCIsIlVua25vd24iLCJpc1ZlcmlmaWVkIiwiYXV0aGVudGljYXRlZCIsIlVuYXV0aGVudGljYXRlZCIsIlZlcmlmaWVkIiwib2JqQSIsIm9iakIiLCJrZXlzQSIsIk9iamVjdCIsImtleXMiLCJrZXlzQiIsImkiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInJBIiwickIiLCJqIiwicm9vbU1lbWJlciIsInNob3VsZEhpZ2hsaWdodCIsIk5vdGlmaWNhdGlvbiIsIlRocmVhZHNMaXN0IiwiYWN0aW9ucyIsImdldFB1c2hBY3Rpb25zRm9yRXZlbnQiLCJyZXBsYWNpbmdFdmVudCIsInR3ZWFrcyIsImNyZWRlbnRpYWxzIiwiaGlnaGxpZ2h0IiwicmVuZGVyRTJFUGFkbG9jayIsImlzTG9jYWxSb29tIiwiZ2V0Q29udGVudCIsIm1zZ3R5cGUiLCJpc1Jvb21FbmNyeXB0ZWQiLCJzdGF0dXMiLCJFTkNSWVBUSU5HIiwiTk9UX1NFTlQiLCJpc1N0YXRlIiwicGVybWFsaW5rIiwiY2xpY2tUYXJnZXQiLCJ0YXJnZXQiLCJhbmNob3JFbGVtZW50IiwiSFRNTEFuY2hvckVsZW1lbnQiLCJjbG9zZXN0IiwiSFRNTEltYWdlRWxlbWVudCIsIlBsYXRmb3JtUGVnIiwiYWxsb3dPdmVycmlkaW5nTmF0aXZlQ29udGV4dE1lbnVzIiwiZ2V0U2VsZWN0ZWRUZXh0IiwiZWRpdFN0YXRlIiwicG9zaXRpb24iLCJsZWZ0IiwiY2xpZW50WCIsInRvcCIsImNsaWVudFkiLCJib3R0b20iLCJsaW5rIiwiaHJlZiIsInNob3VsZEhpZGVFdmVudCIsImNhbGxFdmVudEdyb3VwZXIiLCJoYW5ndXBSZWFzb24iLCJDYWxsRXJyb3JDb2RlIiwiUmVwbGFjZWQiLCJyZW5kZXJDb250ZXh0TWVudSIsImdldFRpbGUiLCJnZXRSZXBseUNoYWluIiwiZXZlbnRUaWxlT3BzIiwiZ2V0RXZlbnRUaWxlT3BzIiwiY29sbGFwc2VSZXBseUNoYWluIiwiY2FuQ29sbGFwc2UiLCJjb2xsYXBzZSIsImFib3ZlUmlnaHRPZiIsIm9uQ2xvc2VNZW51IiwicmVuZGVyIiwiaGFzUmVuZGVyZXIiLCJpc0J1YmJsZU1lc3NhZ2UiLCJpc0luZm9NZXNzYWdlIiwiaXNMZWZ0QWxpZ25lZEJ1YmJsZU1lc3NhZ2UiLCJub0J1YmJsZUV2ZW50IiwiaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24iLCJnZXRFdmVudERpc3BsYXlJbmZvIiwic2hvd0hpZGRlbkV2ZW50cyIsImxvZ2dlciIsIndhcm4iLCJpc1Byb2JhYmx5TWVkaWEiLCJNZWRpYUV2ZW50SGVscGVyIiwiaXNFbGlnaWJsZSIsImxpbmVDbGFzc2VzIiwiY2xhc3NOYW1lcyIsIm14X0V2ZW50VGlsZV9tZWRpYUxpbmUiLCJteF9FdmVudFRpbGVfaW1hZ2UiLCJNc2dUeXBlIiwiSW1hZ2UiLCJteF9FdmVudFRpbGVfc3RpY2tlciIsIm14X0V2ZW50VGlsZV9lbW90ZSIsIkVtb3RlIiwiaXNTZW5kaW5nIiwiaW5kZXhPZiIsImlzTWVzc2FnZUV2ZW50IiwiaXNFbmNyeXB0aW9uRmFpbHVyZSIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJpc0NvbnRpbnVhdGlvbiIsImNvbnRpbnVhdGlvbiIsIlJvb20iLCJUaHJlYWQiLCJsYXlvdXQiLCJMYXlvdXQiLCJCdWJibGUiLCJpc0VkaXRpbmciLCJjbGFzc2VzIiwibXhfRXZlbnRUaWxlX2J1YmJsZUNvbnRhaW5lciIsIm14X0V2ZW50VGlsZV9sZWZ0QWxpZ25lZEJ1YmJsZSIsIm14X0V2ZW50VGlsZSIsIm14X0V2ZW50VGlsZV9pc0VkaXRpbmciLCJteF9FdmVudFRpbGVfaW5mbyIsIm14X0V2ZW50VGlsZV8xMmhyIiwiaXNUd2VsdmVIb3VyIiwibXhfRXZlbnRUaWxlX3NlbmRpbmciLCJteF9FdmVudFRpbGVfaGlnaGxpZ2h0IiwibXhfRXZlbnRUaWxlX3NlbGVjdGVkIiwiaXNTZWxlY3RlZEV2ZW50IiwibXhfRXZlbnRUaWxlX2NvbnRpbnVhdGlvbiIsIkNhbGxJbnZpdGUiLCJteF9FdmVudFRpbGVfbGFzdCIsImxhc3QiLCJteF9FdmVudFRpbGVfbGFzdEluU2VjdGlvbiIsImxhc3RJblNlY3Rpb24iLCJteF9FdmVudFRpbGVfY29udGV4dHVhbCIsImNvbnRleHR1YWwiLCJteF9FdmVudFRpbGVfYWN0aW9uQmFyRm9jdXNlZCIsIm14X0V2ZW50VGlsZV92ZXJpZmllZCIsIm14X0V2ZW50VGlsZV91bnZlcmlmaWVkIiwibXhfRXZlbnRUaWxlX3Vua25vd24iLCJteF9FdmVudFRpbGVfYmFkIiwibXhfRXZlbnRUaWxlX25vU2VuZGVyIiwiaGlkZVNlbmRlciIsIm14X0V2ZW50VGlsZV9jbGFtcCIsIm14X0V2ZW50VGlsZV9ub0J1YmJsZSIsImFyaWFMaXZlIiwic2Nyb2xsVG9rZW4iLCJhdmF0YXIiLCJhdmF0YXJTaXplIiwibmVlZHNTZW5kZXJQcm9maWxlIiwiUm9vbUNyZWF0ZSIsIklSQyIsIkZpbGUiLCJtZW1iZXIiLCJ0aGlyZF9wYXJ0eV9pbnZpdGUiLCJSb29tTWVtYmVyIiwiUGlubmVkIiwib25TZW5kZXJQcm9maWxlQ2xpY2siLCJzaG93TWVzc2FnZUFjdGlvbkJhciIsImFjdGlvbkJhciIsIm9uQWN0aW9uQmFyRm9jdXNDaGFuZ2UiLCJzZXRRdW90ZUV4cGFuZGVkIiwic2hvd1RpbWVzdGFtcCIsImdldFRzIiwiYWx3YXlzU2hvd1RpbWVzdGFtcHMiLCJCb29sZWFuIiwidHMiLCJyZXBseVRvRXZlbnQiLCJtZXNzYWdlVGltZXN0YW1wIiwidGltZXN0YW1wIiwia2V5UmVxdWVzdEhlbHBUZXh0Iiwia2V5UmVxdWVzdEluZm9Db250ZW50Iiwic3ViIiwib25SZXF1ZXN0S2V5c0NsaWNrIiwia2V5UmVxdWVzdEluZm8iLCJyZWFjdGlvbnNSb3ciLCJsaW5rZWRUaW1lc3RhbXAiLCJvblBlcm1hbGlua0NsaWNrZWQiLCJmb3JtYXRUaW1lIiwiRGF0ZSIsIm9uVGltZXN0YW1wQ29udGV4dE1lbnUiLCJ1c2VJUkNMYXlvdXQiLCJncm91cFRpbWVzdGFtcCIsImlyY1RpbWVzdGFtcCIsImJ1YmJsZVRpbWVzdGFtcCIsImdyb3VwUGFkbG9jayIsImlyY1BhZGxvY2siLCJtc2dPcHRpb24iLCJzaG93UmVhZFJlY2VpcHRzIiwiZ2V0QXNzb2NpYXRlZFN0YXR1cyIsInJlYWRSZWNlaXB0TWFwIiwiY2hlY2tVbm1vdW50aW5nIiwiaGF2ZVJlbmRlcmVyRm9yRXZlbnQiLCJzaG91bGREaXNwbGF5UmVwbHkiLCJpc093bkV2ZW50IiwiY3JlYXRlRWxlbWVudCIsImFzIiwibmFtZSIsIm9uQ29udGV4dE1lbnUiLCJyZW5kZXJUaWxlIiwicmVmIiwiaGlnaGxpZ2h0cyIsIlNob3dUaHJlYWQiLCJyb290RXZlbnQiLCJwdXNoIiwiY3VycmVudFRhcmdldCIsImluZGV4IiwiQXJyYXkiLCJmcm9tIiwicGFyZW50RWxlbWVudCIsImNoaWxkcmVuIiwiUG9zdGhvZ1RyYWNrZXJzIiwidHJhY2tJbnRlcmFjdGlvbiIsIk1lc3NhZ2VQcmV2aWV3U3RvcmUiLCJnZW5lcmF0ZVByZXZpZXdGb3JFdmVudCIsInZpZXdJblJvb20iLCJjb3B5TGlua1RvVGhyZWFkIiwiR3JvdXAiLCJSb29tQ29udGV4dCIsIlNhZmVFdmVudFRpbGUiLCJmb3J3YXJkUmVmIiwiRTJlUGFkbG9ja1VuZGVjcnlwdGFibGUiLCJFMmVQYWRsb2NrSWNvbiIsIkUyZVBhZGxvY2tVbnZlcmlmaWVkIiwiRTJlUGFkbG9ja1VuZW5jcnlwdGVkIiwiRTJlUGFkbG9ja1Vua25vd24iLCJFMmVQYWRsb2NrVW5hdXRoZW50aWNhdGVkIiwiRTJlUGFkbG9jayIsInRvb2x0aXAiLCJ0aXRsZSIsImljb24iLCJvbkhvdmVyU3RhcnQiLCJvbkhvdmVyRW5kIiwiU2VudFJlY2VpcHQiLCJtZXNzYWdlU3RhdGUiLCJpc1NlbnQiLCJpc0ZhaWxlZCIsInJlY2VpcHRDbGFzc2VzIiwibm9uQ3NzQmFkZ2UiLCJTdGF0aWNOb3RpZmljYXRpb25TdGF0ZSIsIlJFRF9FWENMQU1BVElPTiIsImxhYmVsIiwic2hvd1Rvb2x0aXAiLCJoaWRlVG9vbHRpcCIsInVzZVRvb2x0aXAiLCJhbGlnbm1lbnQiLCJBbGlnbm1lbnQiLCJUb3BSaWdodCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0V2ZW50VGlsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiwgZm9yd2FyZFJlZiwgTW91c2VFdmVudCwgUmVmT2JqZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSwgTXNnVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IEV2ZW50U3RhdHVzLCBNYXRyaXhFdmVudCwgTWF0cml4RXZlbnRFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IFJlbGF0aW9ucyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcmVsYXRpb25zXCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHsgVGhyZWFkLCBUaHJlYWRFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy90aHJlYWQnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uQ291bnRUeXBlLCBSb29tLCBSb29tRXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbSc7XG5pbXBvcnQgeyBDYWxsRXJyb3JDb2RlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsXCI7XG5pbXBvcnQgeyBDcnlwdG9FdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG9cIjtcbmltcG9ydCB7IFVzZXJUcnVzdExldmVsIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL0Nyb3NzU2lnbmluZyc7XG5cbmltcG9ydCB7IEljb24gYXMgTGlua0ljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvbGluay5zdmcnO1xuaW1wb3J0IHsgSWNvbiBhcyBWaWV3SW5Sb29tSWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy92aWV3LWluLXJvb20uc3ZnJztcbmltcG9ydCBSZXBseUNoYWluIGZyb20gXCIuLi9lbGVtZW50cy9SZXBseUNoYWluXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBMYXlvdXQgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvZW51bXMvTGF5b3V0XCI7XG5pbXBvcnQgeyBmb3JtYXRUaW1lIH0gZnJvbSBcIi4uLy4uLy4uL0RhdGVVdGlsc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgeyBFMkVTdGF0ZSB9IGZyb20gXCIuL0UyRUljb25cIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBNZXNzYWdlQ29udGV4dE1lbnUgZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvTWVzc2FnZUNvbnRleHRNZW51XCI7XG5pbXBvcnQgeyBhYm92ZVJpZ2h0T2YgfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51JztcbmltcG9ydCB7IG9iamVjdEhhc0RpZmYgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvb2JqZWN0c1wiO1xuaW1wb3J0IFRvb2x0aXAsIHsgQWxpZ25tZW50IH0gZnJvbSBcIi4uL2VsZW1lbnRzL1Rvb2x0aXBcIjtcbmltcG9ydCBFZGl0b3JTdGF0ZVRyYW5zZmVyIGZyb20gXCIuLi8uLi8uLi91dGlscy9FZGl0b3JTdGF0ZVRyYW5zZmVyXCI7XG5pbXBvcnQgeyBSb29tUGVybWFsaW5rQ3JlYXRvciB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rcyc7XG5pbXBvcnQgeyBTdGF0aWNOb3RpZmljYXRpb25TdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9TdGF0aWNOb3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IE5vdGlmaWNhdGlvbkJhZGdlIGZyb20gXCIuL05vdGlmaWNhdGlvbkJhZGdlXCI7XG5pbXBvcnQgTGVnYWN5Q2FsbEV2ZW50R3JvdXBlciBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9MZWdhY3lDYWxsRXZlbnRHcm91cGVyXCI7XG5pbXBvcnQgeyBDb21wb3Nlckluc2VydFBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Db21wb3Nlckluc2VydFBheWxvYWRcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSAnLi4vLi4vLi4vUGxhdGZvcm1QZWcnO1xuaW1wb3J0IE1lbWJlckF2YXRhciBmcm9tICcuLi9hdmF0YXJzL01lbWJlckF2YXRhcic7XG5pbXBvcnQgU2VuZGVyUHJvZmlsZSBmcm9tICcuLi9tZXNzYWdlcy9TZW5kZXJQcm9maWxlJztcbmltcG9ydCBNZXNzYWdlVGltZXN0YW1wIGZyb20gJy4uL21lc3NhZ2VzL01lc3NhZ2VUaW1lc3RhbXAnO1xuaW1wb3J0IFRvb2x0aXBCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvVG9vbHRpcEJ1dHRvbic7XG5pbXBvcnQgeyBJUmVhZFJlY2VpcHRJbmZvIH0gZnJvbSBcIi4vUmVhZFJlY2VpcHRNYXJrZXJcIjtcbmltcG9ydCBNZXNzYWdlQWN0aW9uQmFyIGZyb20gXCIuLi9tZXNzYWdlcy9NZXNzYWdlQWN0aW9uQmFyXCI7XG5pbXBvcnQgUmVhY3Rpb25zUm93IGZyb20gJy4uL21lc3NhZ2VzL1JlYWN0aW9uc1Jvdyc7XG5pbXBvcnQgeyBnZXRFdmVudERpc3BsYXlJbmZvIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvRXZlbnRSZW5kZXJpbmdVdGlscyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVByZXZpZXdTdG9yZSB9IGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvTWVzc2FnZVByZXZpZXdTdG9yZSc7XG5pbXBvcnQgUm9vbUNvbnRleHQsIHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgeyBNZWRpYUV2ZW50SGVscGVyIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL01lZGlhRXZlbnRIZWxwZXJcIjtcbmltcG9ydCBUb29sYmFyIGZyb20gJy4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvVG9vbGJhcic7XG5pbXBvcnQgeyBSb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiB9IGZyb20gJy4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvcm92aW5nL1JvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uJztcbmltcG9ydCB7IFRocmVhZE5vdGlmaWNhdGlvblN0YXRlIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvVGhyZWFkTm90aWZpY2F0aW9uU3RhdGUnO1xuaW1wb3J0IHsgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSc7XG5pbXBvcnQgeyBOb3RpZmljYXRpb25TdGF0ZUV2ZW50cyB9IGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL05vdGlmaWNhdGlvblN0YXRlJztcbmltcG9ydCB7IE5vdGlmaWNhdGlvbkNvbG9yIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvTm90aWZpY2F0aW9uQ29sb3InO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCB7IGNvcHlQbGFpbnRleHQsIGdldFNlbGVjdGVkVGV4dCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3N0cmluZ3MnO1xuaW1wb3J0IHsgRGVjcnlwdGlvbkZhaWx1cmVUcmFja2VyIH0gZnJvbSAnLi4vLi4vLi4vRGVjcnlwdGlvbkZhaWx1cmVUcmFja2VyJztcbmltcG9ydCBSZWRhY3RlZEJvZHkgZnJvbSAnLi4vbWVzc2FnZXMvUmVkYWN0ZWRCb2R5JztcbmltcG9ydCB7IFZpZXdSb29tUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuaW1wb3J0IHsgc2hvdWxkRGlzcGxheVJlcGx5IH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvUmVwbHknO1xuaW1wb3J0IFBvc3Rob2dUcmFja2VycyBmcm9tIFwiLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5pbXBvcnQgVGlsZUVycm9yQm91bmRhcnkgZnJvbSAnLi4vbWVzc2FnZXMvVGlsZUVycm9yQm91bmRhcnknO1xuaW1wb3J0IHsgaGF2ZVJlbmRlcmVyRm9yRXZlbnQsIGlzTWVzc2FnZUV2ZW50LCByZW5kZXJUaWxlIH0gZnJvbSBcIi4uLy4uLy4uL2V2ZW50cy9FdmVudFRpbGVGYWN0b3J5XCI7XG5pbXBvcnQgVGhyZWFkU3VtbWFyeSwgeyBUaHJlYWRNZXNzYWdlUHJldmlldyB9IGZyb20gXCIuL1RocmVhZFN1bW1hcnlcIjtcbmltcG9ydCB7IFJlYWRSZWNlaXB0R3JvdXAgfSBmcm9tICcuL1JlYWRSZWNlaXB0R3JvdXAnO1xuaW1wb3J0IHsgdXNlVG9vbHRpcCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy91c2VUb29sdGlwXCI7XG5pbXBvcnQgeyBTaG93VGhyZWFkUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1Nob3dUaHJlYWRQYXlsb2FkXCI7XG5pbXBvcnQgeyBpc0xvY2FsUm9vbSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2xvY2FsUm9vbS9pc0xvY2FsUm9vbSc7XG5cbmV4cG9ydCB0eXBlIEdldFJlbGF0aW9uc0ZvckV2ZW50ID0gKGV2ZW50SWQ6IHN0cmluZywgcmVsYXRpb25UeXBlOiBzdHJpbmcsIGV2ZW50VHlwZTogc3RyaW5nKSA9PiBSZWxhdGlvbnM7XG5cbi8vIE91ciBjb21wb25lbnQgc3RydWN0dXJlIGZvciBFdmVudFRpbGVzIG9uIHRoZSB0aW1lbGluZSBpczpcbi8vXG4vLyAuLUV2ZW50VGlsZS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS5cbi8vIHwgTWVtYmVyQXZhdGFyIChTZW5kZXJQcm9maWxlKSAgICAgICAgICAgICAgICAgICBUaW1lU3RhbXAgfFxuLy8gfCAgICAuLXtNZXNzYWdlLFRleHR1YWx9RXZlbnQtLS0tLS0tLS0tLS0tLS0uIFJlYWQgQXZhdGFycyB8XG4vLyB8ICAgIHwgICAuLU1Gb29Cb2R5LS0tLS0tLS0tLS0tLS0tLS0tLS4gICAgIHwgICAgICAgICAgICAgIHxcbi8vIHwgICAgfCAgIHwgIChvbmx5IGlmIE1lc3NhZ2VFdmVudCkgICAgfCAgICAgfCAgICAgICAgICAgICAgfFxuLy8gfCAgICB8ICAgJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICAgICB8ICAgICAgICAgICAgICB8XG4vLyB8ICAgICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgICAgICAgICAgICAgIHxcbi8vICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJ1xuXG5leHBvcnQgaW50ZXJmYWNlIElSZWFkUmVjZWlwdFByb3BzIHtcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICByb29tTWVtYmVyOiBSb29tTWVtYmVyIHwgbnVsbDtcbiAgICB0czogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElFdmVudFRpbGVPcHMge1xuICAgIGlzV2lkZ2V0SGlkZGVuKCk6IGJvb2xlYW47XG4gICAgdW5oaWRlV2lkZ2V0KCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUV2ZW50VGlsZVR5cGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGdldEV2ZW50VGlsZU9wcz8oKTogSUV2ZW50VGlsZU9wcztcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gdGhlIE1hdHJpeEV2ZW50IHRvIHNob3dcbiAgICBteEV2ZW50OiBNYXRyaXhFdmVudDtcblxuICAgIC8vIHRydWUgaWYgbXhFdmVudCBpcyByZWRhY3RlZC4gVGhpcyBpcyBhIHByb3AgYmVjYXVzZSB1c2luZyBteEV2ZW50LmlzUmVkYWN0ZWQoKVxuICAgIC8vIG1pZ2h0IG5vdCBiZSBlbm91Z2ggd2hlbiBkZWNpZGluZyBzaG91bGRDb21wb25lbnRVcGRhdGUgLSBwcmV2UHJvcHMubXhFdmVudFxuICAgIC8vIHJlZmVyZW5jZXMgdGhlIHNhbWUgdGhpcy5wcm9wcy5teEV2ZW50LlxuICAgIGlzUmVkYWN0ZWQ/OiBib29sZWFuO1xuXG4gICAgLy8gdHJ1ZSBpZiB0aGlzIGlzIGEgY29udGludWF0aW9uIG9mIHRoZSBwcmV2aW91cyBldmVudCAod2hpY2ggaGFzIHRoZVxuICAgIC8vIGVmZmVjdCBvZiBub3Qgc2hvd2luZyBhbm90aGVyIGF2YXRhci9kaXNwbGF5bmFtZVxuICAgIGNvbnRpbnVhdGlvbj86IGJvb2xlYW47XG5cbiAgICAvLyB0cnVlIGlmIHRoaXMgaXMgdGhlIGxhc3QgZXZlbnQgaW4gdGhlIHRpbWVsaW5lICh3aGljaCBoYXMgdGhlIGVmZmVjdFxuICAgIC8vIG9mIGFsd2F5cyBzaG93aW5nIHRoZSB0aW1lc3RhbXApXG4gICAgbGFzdD86IGJvb2xlYW47XG5cbiAgICAvLyB0cnVlIGlmIHRoZSBldmVudCBpcyB0aGUgbGFzdCBldmVudCBpbiBhIHNlY3Rpb24gKGFkZHMgYSBjc3MgY2xhc3MgZm9yXG4gICAgLy8gdGFyZ2V0aW5nKVxuICAgIGxhc3RJblNlY3Rpb24/OiBib29sZWFuO1xuXG4gICAgLy8gVHJ1ZSBpZiB0aGUgZXZlbnQgaXMgdGhlIGxhc3Qgc3VjY2Vzc2Z1bCAoc2VudCkgZXZlbnQuXG4gICAgbGFzdFN1Y2Nlc3NmdWw/OiBib29sZWFuO1xuXG4gICAgLy8gdHJ1ZSBpZiB0aGlzIGlzIHNlYXJjaCBjb250ZXh0ICh3aGljaCBoYXMgdGhlIGVmZmVjdCBvZiBncmV5aW5nIG91dFxuICAgIC8vIHRoZSB0ZXh0XG4gICAgY29udGV4dHVhbD86IGJvb2xlYW47XG5cbiAgICAvLyBhIGxpc3Qgb2Ygd29yZHMgdG8gaGlnaGxpZ2h0LCBvcmRlcmVkIGJ5IGxvbmdlc3QgZmlyc3RcbiAgICBoaWdobGlnaHRzPzogc3RyaW5nW107XG5cbiAgICAvLyBsaW5rIFVSTCBmb3IgdGhlIGhpZ2hsaWdodHNcbiAgICBoaWdobGlnaHRMaW5rPzogc3RyaW5nO1xuXG4gICAgLy8gc2hvdWxkIHNob3cgVVJMIHByZXZpZXdzIGZvciB0aGlzIGV2ZW50XG4gICAgc2hvd1VybFByZXZpZXc/OiBib29sZWFuO1xuXG4gICAgLy8gaXMgdGhpcyB0aGUgZm9jdXNlZCBldmVudFxuICAgIGlzU2VsZWN0ZWRFdmVudD86IGJvb2xlYW47XG5cbiAgICAvLyBjYWxsYmFjayBjYWxsZWQgd2hlbiBkeW5hbWljIGNvbnRlbnQgaW4gZXZlbnRzIGFyZSBsb2FkZWRcbiAgICBvbkhlaWdodENoYW5nZWQ/OiAoKSA9PiB2b2lkO1xuXG4gICAgLy8gYSBsaXN0IG9mIHJlYWQtcmVjZWlwdHMgd2Ugc2hvdWxkIHNob3cuIEVhY2ggb2JqZWN0IGhhcyBhICdyb29tTWVtYmVyJyBhbmQgJ3RzJy5cbiAgICByZWFkUmVjZWlwdHM/OiBJUmVhZFJlY2VpcHRQcm9wc1tdO1xuXG4gICAgLy8gb3BhcXVlIHJlYWRyZWNlaXB0IGluZm8gZm9yIGVhY2ggdXNlcklkOyB1c2VkIGJ5IFJlYWRSZWNlaXB0TWFya2VyXG4gICAgLy8gdG8gbWFuYWdlIGl0cyBhbmltYXRpb25zLiBTaG91bGQgYmUgYW4gZW1wdHkgb2JqZWN0IHdoZW4gdGhlIHJvb21cbiAgICAvLyBmaXJzdCBsb2Fkc1xuICAgIHJlYWRSZWNlaXB0TWFwPzogeyBbdXNlcklkOiBzdHJpbmddOiBJUmVhZFJlY2VpcHRJbmZvIH07XG5cbiAgICAvLyBBIGZ1bmN0aW9uIHdoaWNoIGlzIHVzZWQgdG8gY2hlY2sgaWYgdGhlIHBhcmVudCBwYW5lbCBpcyBiZWluZ1xuICAgIC8vIHVubW91bnRlZCwgdG8gYXZvaWQgdW5uZWNlc3Nhcnkgd29yay4gU2hvdWxkIHJldHVybiB0cnVlIGlmIHdlXG4gICAgLy8gYXJlIGJlaW5nIHVubW91bnRlZC5cbiAgICBjaGVja1VubW91bnRpbmc/OiAoKSA9PiBib29sZWFuO1xuXG4gICAgLy8gdGhlIHN0YXR1cyBvZiB0aGlzIGV2ZW50IC0gaWUsIG14RXZlbnQuc3RhdHVzLiBEZW5vcm1hbGlzZWQgdG8gaGVyZSBzb1xuICAgIC8vIHRoYXQgd2UgY2FuIHRlbGwgd2hlbiBpdCBjaGFuZ2VzLlxuICAgIGV2ZW50U2VuZFN0YXR1cz86IHN0cmluZztcblxuICAgIGZvckV4cG9ydD86IGJvb2xlYW47XG5cbiAgICAvLyBzaG93IHR3ZWx2ZSBob3VyIHRpbWVzdGFtcHNcbiAgICBpc1R3ZWx2ZUhvdXI/OiBib29sZWFuO1xuXG4gICAgLy8gaGVscGVyIGZ1bmN0aW9uIHRvIGFjY2VzcyByZWxhdGlvbnMgZm9yIHRoaXMgZXZlbnRcbiAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD86IEdldFJlbGF0aW9uc0ZvckV2ZW50O1xuXG4gICAgLy8gd2hldGhlciB0byBzaG93IHJlYWN0aW9ucyBmb3IgdGhpcyBldmVudFxuICAgIHNob3dSZWFjdGlvbnM/OiBib29sZWFuO1xuXG4gICAgLy8gd2hpY2ggbGF5b3V0IHRvIHVzZVxuICAgIGxheW91dD86IExheW91dDtcblxuICAgIC8vIHdoZXRoZXIgb3Igbm90IHRvIHNob3cgcmVhZCByZWNlaXB0c1xuICAgIHNob3dSZWFkUmVjZWlwdHM/OiBib29sZWFuO1xuXG4gICAgLy8gVXNlZCB3aGlsZSBlZGl0aW5nLCB0byBwYXNzIHRoZSBldmVudCwgYW5kIHRvIHByZXNlcnZlIGVkaXRvciBzdGF0ZVxuICAgIC8vIGZyb20gb25lIGVkaXRvciBpbnN0YW5jZSB0byBhbm90aGVyIHdoZW4gcmVtb3VudGluZyB0aGUgZWRpdG9yXG4gICAgLy8gdXBvbiByZWNlaXZpbmcgdGhlIHJlbW90ZSBlY2hvIGZvciBhbiB1bnNlbnQgZXZlbnQuXG4gICAgZWRpdFN0YXRlPzogRWRpdG9yU3RhdGVUcmFuc2ZlcjtcblxuICAgIC8vIEV2ZW50IElEIG9mIHRoZSBldmVudCByZXBsYWNpbmcgdGhlIGNvbnRlbnQgb2YgdGhpcyBldmVudCwgaWYgYW55XG4gICAgcmVwbGFjaW5nRXZlbnRJZD86IHN0cmluZztcblxuICAgIC8vIEhlbHBlciB0byBidWlsZCBwZXJtYWxpbmtzIGZvciB0aGUgcm9vbVxuICAgIHBlcm1hbGlua0NyZWF0b3I/OiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcblxuICAgIC8vIExlZ2FjeUNhbGxFdmVudEdyb3VwZXIgZm9yIHRoaXMgZXZlbnRcbiAgICBjYWxsRXZlbnRHcm91cGVyPzogTGVnYWN5Q2FsbEV2ZW50R3JvdXBlcjtcblxuICAgIC8vIFN5bWJvbCBvZiB0aGUgcm9vdCBub2RlXG4gICAgYXM/OiBzdHJpbmc7XG5cbiAgICAvLyB3aGV0aGVyIG9yIG5vdCB0byBhbHdheXMgc2hvdyB0aW1lc3RhbXBzXG4gICAgYWx3YXlzU2hvd1RpbWVzdGFtcHM/OiBib29sZWFuO1xuXG4gICAgLy8gd2hldGhlciBvciBub3QgdG8gZGlzcGxheSB0aGUgc2VuZGVyXG4gICAgaGlkZVNlbmRlcj86IGJvb2xlYW47XG5cbiAgICAvLyB3aGV0aGVyIG9yIG5vdCB0byBkaXNwbGF5IHRocmVhZCBpbmZvXG4gICAgc2hvd1RocmVhZEluZm8/OiBib29sZWFuO1xuXG4gICAgLy8gaWYgc3BlY2lmaWVkIGFuZCBgdHJ1ZWAsIHRoZSBtZXNzYWdlIGlzIGJlaW5nXG4gICAgLy8gaGlkZGVuIGZvciBtb2RlcmF0aW9uIGZyb20gb3RoZXIgdXNlcnMgYnV0IGlzXG4gICAgLy8gZGlzcGxheWVkIHRvIHRoZSBjdXJyZW50IHVzZXIgZWl0aGVyIGJlY2F1c2UgdGhleSdyZVxuICAgIC8vIHRoZSBhdXRob3Igb3IgdGhleSBhcmUgYSBtb2RlcmF0b3JcbiAgICBpc1NlZWluZ1Rocm91Z2hNZXNzYWdlSGlkZGVuRm9yTW9kZXJhdGlvbj86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIC8vIFdoZXRoZXIgdGhlIGFjdGlvbiBiYXIgaXMgZm9jdXNlZC5cbiAgICBhY3Rpb25CYXJGb2N1c2VkOiBib29sZWFuO1xuICAgIC8vIFdoZXRoZXIgdGhlIGV2ZW50J3Mgc2VuZGVyIGhhcyBiZWVuIHZlcmlmaWVkLlxuICAgIHZlcmlmaWVkOiBzdHJpbmc7XG4gICAgLy8gV2hldGhlciBvblJlcXVlc3RLZXlzQ2xpY2sgaGFzIGJlZW4gY2FsbGVkIHNpbmNlIG1vdW50aW5nLlxuICAgIHByZXZpb3VzbHlSZXF1ZXN0ZWRLZXlzOiBib29sZWFuO1xuICAgIC8vIFRoZSBSZWxhdGlvbnMgbW9kZWwgZnJvbSB0aGUgSlMgU0RLIGZvciByZWFjdGlvbnMgdG8gYG14RXZlbnRgXG4gICAgcmVhY3Rpb25zOiBSZWxhdGlvbnM7XG5cbiAgICBob3ZlcjogYm9vbGVhbjtcblxuICAgIC8vIFBvc2l0aW9uIG9mIHRoZSBjb250ZXh0IG1lbnVcbiAgICBjb250ZXh0TWVudT86IHtcbiAgICAgICAgcG9zaXRpb246IFBpY2s8RE9NUmVjdCwgXCJ0b3BcIiB8IFwibGVmdFwiIHwgXCJib3R0b21cIj47XG4gICAgICAgIGxpbms/OiBzdHJpbmc7XG4gICAgfTtcblxuICAgIGlzUXVvdGVFeHBhbmRlZD86IGJvb2xlYW47XG5cbiAgICB0aHJlYWQ6IFRocmVhZDtcbiAgICB0aHJlYWROb3RpZmljYXRpb24/OiBOb3RpZmljYXRpb25Db3VudFR5cGU7XG59XG5cbi8vIE1VU1QgYmUgcmVuZGVyZWQgd2l0aGluIGEgUm9vbUNvbnRleHQgd2l0aCBhIHNldCB0aW1lbGluZVJlbmRlcmluZ1R5cGVcbmV4cG9ydCBjbGFzcyBVbndyYXBwZWRFdmVudFRpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHN1cHByZXNzUmVhZFJlY2VpcHRBbmltYXRpb246IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBpc0xpc3RlbmluZ0ZvclJlY2VpcHRzOiBib29sZWFuO1xuICAgIHByaXZhdGUgdGlsZSA9IFJlYWN0LmNyZWF0ZVJlZjxJRXZlbnRUaWxlVHlwZT4oKTtcbiAgICBwcml2YXRlIHJlcGx5Q2hhaW4gPSBSZWFjdC5jcmVhdGVSZWY8UmVwbHlDaGFpbj4oKTtcbiAgICBwcml2YXRlIHRocmVhZFN0YXRlOiBUaHJlYWROb3RpZmljYXRpb25TdGF0ZTtcblxuICAgIHB1YmxpYyByZWFkb25seSByZWYgPSBjcmVhdGVSZWY8SFRNTEVsZW1lbnQ+KCk7XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICAvLyBuby1vcCBmdW5jdGlvbiBiZWNhdXNlIG9uSGVpZ2h0Q2hhbmdlZCBpcyBvcHRpb25hbCB5ZXQgc29tZSBzdWItY29tcG9uZW50cyBhc3N1bWUgaXRzIGV4aXN0ZW5jZVxuICAgICAgICBvbkhlaWdodENoYW5nZWQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGZvckV4cG9ydDogZmFsc2UsXG4gICAgICAgIGxheW91dDogTGF5b3V0Lkdyb3VwLFxuICAgIH07XG5cbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBSb29tQ29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzLCBjb250ZXh0OiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgTWF0cml4Q2xpZW50Q29udGV4dD4pIHtcbiAgICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuXG4gICAgICAgIGNvbnN0IHRocmVhZCA9IHRoaXMudGhyZWFkO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAvLyBXaGV0aGVyIHRoZSBhY3Rpb24gYmFyIGlzIGZvY3VzZWQuXG4gICAgICAgICAgICBhY3Rpb25CYXJGb2N1c2VkOiBmYWxzZSxcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdGhlIGV2ZW50J3Mgc2VuZGVyIGhhcyBiZWVuIHZlcmlmaWVkLlxuICAgICAgICAgICAgdmVyaWZpZWQ6IG51bGwsXG4gICAgICAgICAgICAvLyBXaGV0aGVyIG9uUmVxdWVzdEtleXNDbGljayBoYXMgYmVlbiBjYWxsZWQgc2luY2UgbW91bnRpbmcuXG4gICAgICAgICAgICBwcmV2aW91c2x5UmVxdWVzdGVkS2V5czogZmFsc2UsXG4gICAgICAgICAgICAvLyBUaGUgUmVsYXRpb25zIG1vZGVsIGZyb20gdGhlIEpTIFNESyBmb3IgcmVhY3Rpb25zIHRvIGBteEV2ZW50YFxuICAgICAgICAgICAgcmVhY3Rpb25zOiB0aGlzLmdldFJlYWN0aW9ucygpLFxuICAgICAgICAgICAgLy8gQ29udGV4dCBtZW51IHBvc2l0aW9uXG4gICAgICAgICAgICBjb250ZXh0TWVudTogbnVsbCxcblxuICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuXG4gICAgICAgICAgICB0aHJlYWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gZG9uJ3QgZG8gUlIgYW5pbWF0aW9ucyB1bnRpbCB3ZSBhcmUgbW91bnRlZFxuICAgICAgICB0aGlzLnN1cHByZXNzUmVhZFJlY2VpcHRBbmltYXRpb24gPSB0cnVlO1xuXG4gICAgICAgIC8vIFRocm91Z2hvdXQgdGhlIGNvbXBvbmVudCB3ZSBtYW5hZ2UgYSByZWFkIHJlY2VpcHQgbGlzdGVuZXIgdG8gc2VlIGlmIG91ciB0aWxlIHN0aWxsXG4gICAgICAgIC8vIHF1YWxpZmllcyBmb3IgYSBcInNlbnRcIiBvciBcInNlbmRpbmdcIiBzdGF0ZSAoYmFzZWQgb24gdGhlaXIgcmVsZXZhbnQgY29uZGl0aW9ucykuIFdlXG4gICAgICAgIC8vIGRvbid0IHdhbnQgdG8gb3Zlci1zdWJzY3JpYmUgdG8gdGhlIHJlYWQgcmVjZWlwdCBldmVudHMgYmVpbmcgZmlyZWQsIHNvIHdlIHVzZSBhIGZsYWdcbiAgICAgICAgLy8gdG8gZGV0ZXJtaW5lIGlmIHdlJ3ZlIGFscmVhZHkgc3Vic2NyaWJlZCBhbmQgdXNlIGEgY29tYmluYXRpb24gb2Ygb3RoZXIgZmxhZ3MgdG8gZmluZFxuICAgICAgICAvLyBvdXQgaWYgd2Ugc2hvdWxkIGV2ZW4gYmUgc3Vic2NyaWJlZCBhdCBhbGwuXG4gICAgICAgIHRoaXMuaXNMaXN0ZW5pbmdGb3JSZWNlaXB0cyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZW4gdHJ1ZSwgdGhlIHRpbGUgcXVhbGlmaWVzIGZvciBzb21lIHNvcnQgb2Ygc3BlY2lhbCByZWFkIHJlY2VpcHQuIFRoaXMgY291bGQgYmUgYSAnc2VuZGluZydcbiAgICAgKiBvciAnc2VudCcgcmVjZWlwdCwgZm9yIGV4YW1wbGUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXQgaXNFbGlnaWJsZUZvclNwZWNpYWxSZWNlaXB0KCk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBGaXJzdCwgaWYgdGhlcmUgYXJlIG90aGVyIHJlYWQgcmVjZWlwdHMgdGhlbiBqdXN0IHNob3J0LWNpcmN1aXQgdGhpcy5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVhZFJlY2VpcHRzICYmIHRoaXMucHJvcHMucmVhZFJlY2VpcHRzLmxlbmd0aCA+IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm14RXZlbnQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAvLyBTYW5pdHkgY2hlY2sgKHNob3VsZCBuZXZlciBoYXBwZW4sIGJ1dCB3ZSBzaG91bGRuJ3QgZXhwbG9kZSBpZiBpdCBkb2VzKVxuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgaWYgKCFyb29tKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gUXVpY2tseSBjaGVjayB0byBzZWUgaWYgdGhlIGV2ZW50IHdhcyBzZW50IGJ5IHVzLiBJZiBpdCB3YXNuJ3QsIGl0IHdvbid0IHF1YWxpZnkgZm9yXG4gICAgICAgIC8vIHNwZWNpYWwgcmVhZCByZWNlaXB0cy5cbiAgICAgICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm14RXZlbnQuZ2V0U2VuZGVyKCkgIT09IG15VXNlcklkKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gRmluYWxseSwgZGV0ZXJtaW5lIGlmIHRoZSB0eXBlIGlzIHJlbGV2YW50IHRvIHRoZSB1c2VyLiBUaGlzIG5vdGFibHkgZXhjbHVkZXMgc3RhdGVcbiAgICAgICAgLy8gZXZlbnRzIGFuZCBwcmV0dHkgbXVjaCBhbnl0aGluZyB0aGF0IGNhbid0IGJlIHNlbnQgYnkgdGhlIGNvbXBvc2VyIGFzIGEgbWVzc2FnZS4gRm9yXG4gICAgICAgIC8vIHRob3NlIHdlIHJlbHkgb24gbG9jYWwgZWNobyBnaXZpbmcgdGhlIGltcHJlc3Npb24gb2YgdGhpbmdzIGNoYW5naW5nLCBhbmQgZXhwZWN0IHRoZW1cbiAgICAgICAgLy8gdG8gYmUgcXVpY2suXG4gICAgICAgIGNvbnN0IHNpbXBsZVNlbmRhYmxlRXZlbnRzID0gW1xuICAgICAgICAgICAgRXZlbnRUeXBlLlN0aWNrZXIsXG4gICAgICAgICAgICBFdmVudFR5cGUuUm9vbU1lc3NhZ2UsXG4gICAgICAgICAgICBFdmVudFR5cGUuUm9vbU1lc3NhZ2VFbmNyeXB0ZWQsXG4gICAgICAgIF07XG4gICAgICAgIGlmICghc2ltcGxlU2VuZGFibGVFdmVudHMuaW5jbHVkZXModGhpcy5wcm9wcy5teEV2ZW50LmdldFR5cGUoKSBhcyBFdmVudFR5cGUpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gRGVmYXVsdCBjYXNlXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IHNob3VsZFNob3dTZW50UmVjZWlwdCgpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGV2ZW4gZWxpZ2libGUsIGRvbid0IHNob3cgdGhlIHJlY2VpcHQuXG4gICAgICAgIGlmICghdGhpcy5pc0VsaWdpYmxlRm9yU3BlY2lhbFJlY2VpcHQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAvLyBXZSBvbmx5IHNob3cgdGhlICdzZW50JyByZWNlaXB0IG9uIHRoZSBsYXN0IHN1Y2Nlc3NmdWwgZXZlbnQuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5sYXN0U3VjY2Vzc2Z1bCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIENoZWNrIHRvIG1ha2Ugc3VyZSB0aGUgc2VuZGluZyBzdGF0ZSBpcyBhcHByb3ByaWF0ZS4gQSBudWxsL3VuZGVmaW5lZCBzZW5kIHN0YXR1cyBtZWFuc1xuICAgICAgICAvLyB0aGF0IHRoZSBtZXNzYWdlIGlzICdzZW50Jywgc28gd2UncmUganVzdCBkb3VibGUgY2hlY2tpbmcgdGhhdCBpdCdzIGV4cGxpY2l0bHkgbm90IHNlbnQuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cyAmJiB0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cyAhPT0gRXZlbnRTdGF0dXMuU0VOVCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIElmIGFueW9uZSBoYXMgcmVhZCB0aGUgZXZlbnQgYmVzaWRlcyB1cywgd2UgZG9uJ3Qgd2FudCB0byBzaG93IGEgc2VudCByZWNlaXB0LlxuICAgICAgICBjb25zdCByZWNlaXB0cyA9IHRoaXMucHJvcHMucmVhZFJlY2VpcHRzIHx8IFtdO1xuICAgICAgICBjb25zdCBteVVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICAgICAgaWYgKHJlY2VpcHRzLnNvbWUociA9PiByLnVzZXJJZCAhPT0gbXlVc2VySWQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gRmluYWxseSwgd2Ugc2hvdWxkIHNob3cgYSByZWNlaXB0LlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBzaG91bGRTaG93U2VuZGluZ1JlY2VpcHQoKSB7XG4gICAgICAgIC8vIElmIHdlJ3JlIG5vdCBldmVuIGVsaWdpYmxlLCBkb24ndCBzaG93IHRoZSByZWNlaXB0LlxuICAgICAgICBpZiAoIXRoaXMuaXNFbGlnaWJsZUZvclNwZWNpYWxSZWNlaXB0KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGV2ZW50IHNlbmQgc3RhdHVzIHRvIHNlZSBpZiB3ZSBhcmUgcGVuZGluZy4gTnVsbC91bmRlZmluZWQgc3RhdHVzIG1lYW5zIHRoZVxuICAgICAgICAvLyBtZXNzYWdlIHdhcyBzZW50LCBzbyBjaGVjayBmb3IgdGhhdCBhbmQgJ3NlbnQnIGV4cGxpY2l0bHkuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5ldmVudFNlbmRTdGF0dXMgfHwgdGhpcy5wcm9wcy5ldmVudFNlbmRTdGF0dXMgPT09IEV2ZW50U3RhdHVzLlNFTlQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAvLyBEZWZhdWx0IHRvIHNob3dpbmcgLSB0aGVyZSdzIG5vIG90aGVyIGV2ZW50IHByb3BlcnRpZXMvYmVoYXZpb3VycyB3ZSBjYXJlIGFib3V0IGF0XG4gICAgICAgIC8vIHRoaXMgcG9pbnQuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBNb3ZlIGludG8gY29uc3RydWN0b3JcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICB0aGlzLnZlcmlmeUV2ZW50KHRoaXMucHJvcHMubXhFdmVudCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuc3VwcHJlc3NSZWFkUmVjZWlwdEFuaW1hdGlvbiA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5mb3JFeHBvcnQpIHtcbiAgICAgICAgICAgIGNsaWVudC5vbihDcnlwdG9FdmVudC5EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkLCB0aGlzLm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgICAgICBjbGllbnQub24oQ3J5cHRvRXZlbnQuVXNlclRydXN0U3RhdHVzQ2hhbmdlZCwgdGhpcy5vblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5vbihNYXRyaXhFdmVudEV2ZW50LkRlY3J5cHRlZCwgdGhpcy5vbkRlY3J5cHRlZCk7XG4gICAgICAgICAgICBEZWNyeXB0aW9uRmFpbHVyZVRyYWNrZXIuaW5zdGFuY2UuYWRkVmlzaWJsZUV2ZW50KHRoaXMucHJvcHMubXhFdmVudCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93UmVhY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50Lm9uKE1hdHJpeEV2ZW50RXZlbnQuUmVsYXRpb25zQ3JlYXRlZCwgdGhpcy5vblJlYWN0aW9uc0NyZWF0ZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5zaG91bGRTaG93U2VudFJlY2VpcHQgfHwgdGhpcy5zaG91bGRTaG93U2VuZGluZ1JlY2VpcHQpIHtcbiAgICAgICAgICAgICAgICBjbGllbnQub24oUm9vbUV2ZW50LlJlY2VpcHQsIHRoaXMub25Sb29tUmVjZWlwdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0xpc3RlbmluZ0ZvclJlY2VpcHRzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIikpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5vbihUaHJlYWRFdmVudC5VcGRhdGUsIHRoaXMudXBkYXRlVGhyZWFkKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMudGhyZWFkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cE5vdGlmaWNhdGlvbkxpc3RlbmVyKHRoaXMudGhyZWFkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNsaWVudC5kZWNyeXB0RXZlbnRJZk5lZWRlZCh0aGlzLnByb3BzLm14RXZlbnQpO1xuXG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICByb29tPy5vbihUaHJlYWRFdmVudC5OZXcsIHRoaXMub25OZXdUaHJlYWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0dXBOb3RpZmljYXRpb25MaXN0ZW5lcih0aHJlYWQ6IFRocmVhZCk6IHZvaWQge1xuICAgICAgICBjb25zdCBub3RpZmljYXRpb25zID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0VGhyZWFkc1Jvb21TdGF0ZSh0aHJlYWQucm9vbSk7XG5cbiAgICAgICAgdGhpcy50aHJlYWRTdGF0ZSA9IG5vdGlmaWNhdGlvbnMuZ2V0VGhyZWFkUm9vbVN0YXRlKHRocmVhZCk7XG5cbiAgICAgICAgdGhpcy50aHJlYWRTdGF0ZS5vbihOb3RpZmljYXRpb25TdGF0ZUV2ZW50cy5VcGRhdGUsIHRoaXMub25UaHJlYWRTdGF0ZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMub25UaHJlYWRTdGF0ZVVwZGF0ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25UaHJlYWRTdGF0ZVVwZGF0ZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgbGV0IHRocmVhZE5vdGlmaWNhdGlvbiA9IG51bGw7XG4gICAgICAgIHN3aXRjaCAodGhpcy50aHJlYWRTdGF0ZT8uY29sb3IpIHtcbiAgICAgICAgICAgIGNhc2UgTm90aWZpY2F0aW9uQ29sb3IuR3JleTpcbiAgICAgICAgICAgICAgICB0aHJlYWROb3RpZmljYXRpb24gPSBOb3RpZmljYXRpb25Db3VudFR5cGUuVG90YWw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvbkNvbG9yLlJlZDpcbiAgICAgICAgICAgICAgICB0aHJlYWROb3RpZmljYXRpb24gPSBOb3RpZmljYXRpb25Db3VudFR5cGUuSGlnaGxpZ2h0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0aHJlYWROb3RpZmljYXRpb24sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZVRocmVhZCA9ICh0aHJlYWQ6IFRocmVhZCkgPT4ge1xuICAgICAgICBpZiAodGhyZWFkICE9PSB0aGlzLnN0YXRlLnRocmVhZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGhyZWFkU3RhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRocmVhZFN0YXRlLm9mZihOb3RpZmljYXRpb25TdGF0ZUV2ZW50cy5VcGRhdGUsIHRoaXMub25UaHJlYWRTdGF0ZVVwZGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0dXBOb3RpZmljYXRpb25MaXN0ZW5lcih0aHJlYWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRocmVhZCB9KTtcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IElQcm9wcykge1xuICAgICAgICAvLyByZS1jaGVjayB0aGUgc2VuZGVyIHZlcmlmaWNhdGlvbiBhcyBvdXRnb2luZyBldmVudHMgcHJvZ3Jlc3MgdGhyb3VnaFxuICAgICAgICAvLyB0aGUgc2VuZCBwcm9jZXNzLlxuICAgICAgICBpZiAobmV4dFByb3BzLmV2ZW50U2VuZFN0YXR1cyAhPT0gdGhpcy5wcm9wcy5ldmVudFNlbmRTdGF0dXMpIHtcbiAgICAgICAgICAgIHRoaXMudmVyaWZ5RXZlbnQobmV4dFByb3BzLm14RXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogSVByb3BzLCBuZXh0U3RhdGU6IElTdGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAob2JqZWN0SGFzRGlmZih0aGlzLnN0YXRlLCBuZXh0U3RhdGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhdGhpcy5wcm9wc0VxdWFsKHRoaXMucHJvcHMsIG5leHRQcm9wcyk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKENyeXB0b0V2ZW50LkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQsIHRoaXMub25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKENyeXB0b0V2ZW50LlVzZXJUcnVzdFN0YXR1c0NoYW5nZWQsIHRoaXMub25Vc2VyVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihSb29tRXZlbnQuUmVjZWlwdCwgdGhpcy5vblJvb21SZWNlaXB0KTtcbiAgICAgICAgdGhpcy5pc0xpc3RlbmluZ0ZvclJlY2VpcHRzID0gZmFsc2U7XG4gICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5yZW1vdmVMaXN0ZW5lcihNYXRyaXhFdmVudEV2ZW50LkRlY3J5cHRlZCwgdGhpcy5vbkRlY3J5cHRlZCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dSZWFjdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5yZW1vdmVMaXN0ZW5lcihNYXRyaXhFdmVudEV2ZW50LlJlbGF0aW9uc0NyZWF0ZWQsIHRoaXMub25SZWFjdGlvbnNDcmVhdGVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfdGhyZWFkXCIpKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub2ZmKFRocmVhZEV2ZW50LlVwZGF0ZSwgdGhpcy51cGRhdGVUaHJlYWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIHJvb20/Lm9mZihUaHJlYWRFdmVudC5OZXcsIHRoaXMub25OZXdUaHJlYWQpO1xuICAgICAgICBpZiAodGhpcy50aHJlYWRTdGF0ZSkge1xuICAgICAgICAgICAgdGhpcy50aHJlYWRTdGF0ZS5vZmYoTm90aWZpY2F0aW9uU3RhdGVFdmVudHMuVXBkYXRlLCB0aGlzLm9uVGhyZWFkU3RhdGVVcGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogSVByb3BzLCBwcmV2U3RhdGU6IElTdGF0ZSwgc25hcHNob3QpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGxpc3RlbmluZyBmb3IgcmVjZWlwdHMgYW5kIGV4cGVjdCB0byBiZSwgcmVnaXN0ZXIgYSBsaXN0ZW5lci5cbiAgICAgICAgaWYgKCF0aGlzLmlzTGlzdGVuaW5nRm9yUmVjZWlwdHMgJiYgKHRoaXMuc2hvdWxkU2hvd1NlbnRSZWNlaXB0IHx8IHRoaXMuc2hvdWxkU2hvd1NlbmRpbmdSZWNlaXB0KSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFJvb21FdmVudC5SZWNlaXB0LCB0aGlzLm9uUm9vbVJlY2VpcHQpO1xuICAgICAgICAgICAgdGhpcy5pc0xpc3RlbmluZ0ZvclJlY2VpcHRzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25OZXdUaHJlYWQgPSAodGhyZWFkOiBUaHJlYWQpID0+IHtcbiAgICAgICAgaWYgKHRocmVhZC5pZCA9PT0gdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGhyZWFkKHRocmVhZCk7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgICAgIHJvb20ub2ZmKFRocmVhZEV2ZW50Lk5ldywgdGhpcy5vbk5ld1RocmVhZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXQgdGhyZWFkKCk6IFRocmVhZCB8IG51bGwge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3RocmVhZFwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGhyZWFkID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFRocmVhZCgpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQWNjZXNzaW5nIHRoZSB0aHJlYWRzIHZhbHVlIHRocm91Z2ggdGhlIHJvb20gZHVlIHRvIGEgcmFjZSBjb25kaXRpb25cbiAgICAgICAgICogdGhhdCB3aWxsIGJlIHNvbHZlZCB3aGVuIHRoZXJlIGFyZSBwcm9wZXIgYmFja2VuZCBzdXBwb3J0IGZvciB0aHJlYWRzXG4gICAgICAgICAqIFdlIGN1cnJlbnRseSBoYXZlIG5vIHJlbGlhYmxlIHdheSB0byBkaXNjb3ZlciB0aGFuIGFuIGV2ZW50IGlzIGEgdGhyZWFkXG4gICAgICAgICAqIHdoZW4gd2UgYXJlIGF0IHRoZSBzeW5jIHN0YWdlXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoIXRocmVhZCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgICAgICB0aHJlYWQgPSByb29tPy5maW5kVGhyZWFkRm9yRXZlbnQodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhyZWFkID8/IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJUaHJlYWRQYW5lbFN1bW1hcnkoKTogSlNYLkVsZW1lbnQgfCBudWxsIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnRocmVhZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9UaHJlYWRQYW5lbF9yZXBsaWVzXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9UaHJlYWRQYW5lbF9yZXBsaWVzX2Ftb3VudFwiPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS50aHJlYWQubGVuZ3RoIH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDxUaHJlYWRNZXNzYWdlUHJldmlldyB0aHJlYWQ9e3RoaXMuc3RhdGUudGhyZWFkfSAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJUaHJlYWRJbmZvKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRocmVhZD8uaWQgPT09IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gPFRocmVhZFN1bW1hcnkgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fSB0aHJlYWQ9e3RoaXMuc3RhdGUudGhyZWFkfSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoICYmIHRoaXMucHJvcHMubXhFdmVudC50aHJlYWRSb290SWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmhpZ2hsaWdodExpbmspIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8YSBjbGFzc05hbWU9XCJteF9UaHJlYWRTdW1tYXJ5X2ljb25cIiBocmVmPXt0aGlzLnByb3BzLmhpZ2hsaWdodExpbmt9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkZyb20gYSB0aHJlYWRcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJteF9UaHJlYWRTdW1tYXJ5X2ljb25cIj57IF90KFwiRnJvbSBhIHRocmVhZFwiKSB9PC9wPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlld0luUm9vbSA9IChldnQ6IEJ1dHRvbkV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgZXZlbnRfaWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IHRydWUsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogdW5kZWZpbmVkLCAvLyByb29tIGRvZXNuJ3QgY2hhbmdlXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNvcHlMaW5rVG9UaHJlYWQgPSBhc3luYyAoZXZ0OiBCdXR0b25FdmVudCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCB7IHBlcm1hbGlua0NyZWF0b3IsIG14RXZlbnQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IG1hdHJpeFRvVXJsID0gcGVybWFsaW5rQ3JlYXRvci5mb3JFdmVudChteEV2ZW50LmdldElkKCkpO1xuICAgICAgICBhd2FpdCBjb3B5UGxhaW50ZXh0KG1hdHJpeFRvVXJsKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21SZWNlaXB0ID0gKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciByb29tc1xuICAgICAgICBjb25zdCB0aWxlUm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIGlmIChyb29tICE9PSB0aWxlUm9vbSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICghdGhpcy5zaG91bGRTaG93U2VudFJlY2VpcHQgJiYgIXRoaXMuc2hvdWxkU2hvd1NlbmRpbmdSZWNlaXB0ICYmICF0aGlzLmlzTGlzdGVuaW5nRm9yUmVjZWlwdHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIGZvcmNlIHVwZGF0ZSBiZWNhdXNlIHdlIGhhdmUgbm8gc3RhdGUgb3IgcHJvcCBjaGFuZ2VzIHRvIHF1ZXVlIHVwLCBpbnN0ZWFkIHJlbHlpbmcgb25cbiAgICAgICAgLy8gdGhlIGdldHRlcnMgd2UgdXNlIGhlcmUgdG8gZGV0ZXJtaW5lIHdoYXQgbmVlZHMgcmVuZGVyaW5nLlxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFBlciBlbHNld2hlcmUgaW4gdGhpcyBmaWxlLCB3ZSBjYW4gcmVtb3ZlIHRoZSBsaXN0ZW5lciBvbmNlIHdlIHdpbGwgaGF2ZSBubyBmdXJ0aGVyIHB1cnBvc2UgZm9yIGl0LlxuICAgICAgICAgICAgaWYgKCF0aGlzLnNob3VsZFNob3dTZW50UmVjZWlwdCAmJiAhdGhpcy5zaG91bGRTaG93U2VuZGluZ1JlY2VpcHQpIHtcbiAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoUm9vbUV2ZW50LlJlY2VpcHQsIHRoaXMub25Sb29tUmVjZWlwdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0xpc3RlbmluZ0ZvclJlY2VpcHRzID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKiogY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGRlY3J5cHRlZCBhZnRlciB3ZSBzaG93IGl0LlxuICAgICAqL1xuICAgIHByaXZhdGUgb25EZWNyeXB0ZWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIHdlIG5lZWQgdG8gcmUtdmVyaWZ5IHRoZSBzZW5kaW5nIGRldmljZS5cbiAgICAgICAgLy8gKHdlIGNhbGwgb25IZWlnaHRDaGFuZ2VkIGluIHZlcmlmeUV2ZW50IHRvIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSBkZWNyeXB0aW9uXG4gICAgICAgIC8vIGhhcyBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZSBvZiB0aGUgZXZlbnQgdGlsZSlcbiAgICAgICAgdGhpcy52ZXJpZnlFdmVudCh0aGlzLnByb3BzLm14RXZlbnQpO1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkID0gKHVzZXJJZDogc3RyaW5nLCBkZXZpY2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodXNlcklkID09PSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0U2VuZGVyKCkpIHtcbiAgICAgICAgICAgIHRoaXMudmVyaWZ5RXZlbnQodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQgPSAodXNlcklkOiBzdHJpbmcsIF90cnVzdFN0YXR1czogVXNlclRydXN0TGV2ZWwpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHVzZXJJZCA9PT0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFNlbmRlcigpKSB7XG4gICAgICAgICAgICB0aGlzLnZlcmlmeUV2ZW50KHRoaXMucHJvcHMubXhFdmVudCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyB2ZXJpZnlFdmVudChteEV2ZW50OiBNYXRyaXhFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIW14RXZlbnQuaXNFbmNyeXB0ZWQoKSB8fCBteEV2ZW50LmlzUmVkYWN0ZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jcnlwdGlvbkluZm8gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0RXZlbnRFbmNyeXB0aW9uSW5mbyhteEV2ZW50KTtcbiAgICAgICAgY29uc3Qgc2VuZGVySWQgPSBteEV2ZW50LmdldFNlbmRlcigpO1xuICAgICAgICBjb25zdCB1c2VyVHJ1c3QgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY2hlY2tVc2VyVHJ1c3Qoc2VuZGVySWQpO1xuXG4gICAgICAgIGlmIChlbmNyeXB0aW9uSW5mby5taXNtYXRjaGVkU2VuZGVyKSB7XG4gICAgICAgICAgICAvLyBzb21ldGhpbmcgZGVmaW5pdGVseSB3cm9uZyBpcyBnb2luZyBvbiBoZXJlXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB2ZXJpZmllZDogRTJFU3RhdGUuV2FybmluZyxcbiAgICAgICAgICAgIH0sIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKTsgLy8gRGVjcnlwdGlvbiBtYXkgaGF2ZSBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1c2VyVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAvLyB1c2VyIGlzIG5vdCB2ZXJpZmllZCwgc28gZGVmYXVsdCB0byBldmVyeXRoaW5nIGlzIG5vcm1hbFxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZpZWQ6IEUyRVN0YXRlLk5vcm1hbCxcbiAgICAgICAgICAgIH0sIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKTsgLy8gRGVjcnlwdGlvbiBtYXkgaGF2ZSBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXZlbnRTZW5kZXJUcnVzdCA9IGVuY3J5cHRpb25JbmZvLnNlbmRlciAmJiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY2hlY2tEZXZpY2VUcnVzdChcbiAgICAgICAgICAgIHNlbmRlcklkLCBlbmNyeXB0aW9uSW5mby5zZW5kZXIuZGV2aWNlSWQsXG4gICAgICAgICk7XG4gICAgICAgIGlmICghZXZlbnRTZW5kZXJUcnVzdCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZpZWQ6IEUyRVN0YXRlLlVua25vd24sXG4gICAgICAgICAgICB9LCB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCk7IC8vIERlY3J5cHRpb24gbWF5IGhhdmUgY2F1c2VkIGEgY2hhbmdlIGluIHNpemVcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXZlbnRTZW5kZXJUcnVzdC5pc1ZlcmlmaWVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVTdGF0ZS5XYXJuaW5nLFxuICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQpOyAvLyBEZWNyeXB0aW9uIG1heSBoYXZlIGNhdXNlZCBhIGNoYW5nZSBpbiBzaXplXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWVuY3J5cHRpb25JbmZvLmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVTdGF0ZS5VbmF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICB9LCB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCk7IC8vIERlY3J5cHRpb24gbWF5IGhhdmUgY2F1c2VkIGEgY2hhbmdlIGluIHNpemVcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmVyaWZpZWQ6IEUyRVN0YXRlLlZlcmlmaWVkLFxuICAgICAgICB9LCB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCk7IC8vIERlY3J5cHRpb24gbWF5IGhhdmUgY2F1c2VkIGEgY2hhbmdlIGluIHNpemVcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb3BzRXF1YWwob2JqQTogSVByb3BzLCBvYmpCOiBJUHJvcHMpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3Qga2V5c0EgPSBPYmplY3Qua2V5cyhvYmpBKTtcbiAgICAgICAgY29uc3Qga2V5c0IgPSBPYmplY3Qua2V5cyhvYmpCKTtcblxuICAgICAgICBpZiAoa2V5c0EubGVuZ3RoICE9PSBrZXlzQi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5c0EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGtleXNBW2ldO1xuXG4gICAgICAgICAgICBpZiAoIW9iakIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbmVlZCB0byBkZWVwLWNvbXBhcmUgcmVhZFJlY2VpcHRzXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAncmVhZFJlY2VpcHRzJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJBID0gb2JqQVtrZXldO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJCID0gb2JqQltrZXldO1xuICAgICAgICAgICAgICAgIGlmIChyQSA9PT0gckIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFyQSB8fCAhckIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChyQS5sZW5ndGggIT09IHJCLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgckEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJBW2pdLnVzZXJJZCAhPT0gckJbal0udXNlcklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gb25lIGhhcyBhIG1lbWJlciBzZXQgYW5kIHRoZSBvdGhlciBkb2Vzbid0P1xuICAgICAgICAgICAgICAgICAgICBpZiAockFbal0ucm9vbU1lbWJlciAhPT0gckJbal0ucm9vbU1lbWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqQVtrZXldICE9PSBvYmpCW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3VsZEhpZ2hsaWdodCgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9yRXhwb3J0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuTm90aWZpY2F0aW9uKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkc0xpc3QpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBjb25zdCBhY3Rpb25zID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFB1c2hBY3Rpb25zRm9yRXZlbnQoXG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQucmVwbGFjaW5nRXZlbnQoKSB8fCB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgICk7XG4gICAgICAgIGlmICghYWN0aW9ucyB8fCAhYWN0aW9ucy50d2Vha3MpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgLy8gZG9uJ3Qgc2hvdyBzZWxmLWhpZ2hsaWdodHMgZnJvbSBhbm90aGVyIG9mIG91ciBjbGllbnRzXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm14RXZlbnQuZ2V0U2VuZGVyKCkgPT09IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhY3Rpb25zLnR3ZWFrcy5oaWdobGlnaHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlbmRlclByb2ZpbGVDbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoPENvbXBvc2VySW5zZXJ0UGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uQ29tcG9zZXJJbnNlcnQsXG4gICAgICAgICAgICB1c2VySWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRTZW5kZXIoKSxcbiAgICAgICAgICAgIHRpbWVsaW5lUmVuZGVyaW5nVHlwZTogdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXF1ZXN0S2V5c0NsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIC8vIEluZGljYXRlIGluIHRoZSBVSSB0aGF0IHRoZSBrZXlzIGhhdmUgYmVlbiByZXF1ZXN0ZWQgKHRoaXMgaXMgZXhwZWN0ZWQgdG9cbiAgICAgICAgICAgIC8vIGJlIHJlc2V0IGlmIHRoZSBjb21wb25lbnQgaXMgbW91bnRlZCBpbiB0aGUgZnV0dXJlKS5cbiAgICAgICAgICAgIHByZXZpb3VzbHlSZXF1ZXN0ZWRLZXlzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYW5jZWwgYW55IG91dGdvaW5nIGtleSByZXF1ZXN0IGZvciB0aGlzIGV2ZW50IGFuZCByZXNlbmQgaXQuIElmIGEgcmVzcG9uc2VcbiAgICAgICAgLy8gaXMgcmVjZWl2ZWQgZm9yIHRoZSByZXF1ZXN0IHdpdGggdGhlIHJlcXVpcmVkIGtleXMsIHRoZSBldmVudCBjb3VsZCBiZVxuICAgICAgICAvLyBkZWNyeXB0ZWQgc3VjY2Vzc2Z1bGx5LlxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY2FuY2VsQW5kUmVzZW5kRXZlbnRSb29tS2V5UmVxdWVzdCh0aGlzLnByb3BzLm14RXZlbnQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGVybWFsaW5rQ2xpY2tlZCA9IGUgPT4ge1xuICAgICAgICAvLyBUaGlzIGFsbG93cyB0aGUgcGVybWFsaW5rIHRvIGJlIG9wZW5lZCBpbiBhIG5ldyB0YWIvd2luZG93IG9yIGNvcGllZCBhc1xuICAgICAgICAvLyBtYXRyaXgudG8sIGJ1dCBhbHNvIGZvciBpdCB0byBlbmFibGUgcm91dGluZyB3aXRoaW4gRWxlbWVudCB3aGVuIGNsaWNrZWQuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICBldmVudF9pZDogdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSxcbiAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoXG4gICAgICAgICAgICAgICAgPyBcIk1lc3NhZ2VTZWFyY2hcIlxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJFMkVQYWRsb2NrKCkge1xuICAgICAgICBjb25zdCBldiA9IHRoaXMucHJvcHMubXhFdmVudDtcblxuICAgICAgICAvLyBubyBpY29uIGZvciBsb2NhbCByb29tc1xuICAgICAgICBpZiAoaXNMb2NhbFJvb20oZXYuZ2V0Um9vbUlkKCkpKSByZXR1cm47XG5cbiAgICAgICAgLy8gZXZlbnQgY291bGQgbm90IGJlIGRlY3J5cHRlZFxuICAgICAgICBpZiAoZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUgPT09ICdtLmJhZC5lbmNyeXB0ZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gPEUyZVBhZGxvY2tVbmRlY3J5cHRhYmxlIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZXZlbnQgaXMgZW5jcnlwdGVkIGFuZCBub3QgcmVkYWN0ZWQsIGRpc3BsYXkgcGFkbG9jayBjb3JyZXNwb25kaW5nIHRvIHdoZXRoZXIgb3Igbm90IGl0IGlzIHZlcmlmaWVkXG4gICAgICAgIGlmIChldi5pc0VuY3J5cHRlZCgpICYmICFldi5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVTdGF0ZS5Ob3JtYWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIG5vIGljb24gaWYgd2UndmUgbm90IGV2ZW4gY3Jvc3Mtc2lnbmVkIHRoZSB1c2VyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmVyaWZpZWQgPT09IEUyRVN0YXRlLlZlcmlmaWVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBubyBpY29uIGZvciB2ZXJpZmllZFxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVTdGF0ZS5VbmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKDxFMmVQYWRsb2NrVW5hdXRoZW50aWNhdGVkIC8+KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52ZXJpZmllZCA9PT0gRTJFU3RhdGUuVW5rbm93bikge1xuICAgICAgICAgICAgICAgIHJldHVybiAoPEUyZVBhZGxvY2tVbmtub3duIC8+KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICg8RTJlUGFkbG9ja1VudmVyaWZpZWQgLz4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQoZXYuZ2V0Um9vbUlkKCkpKSB7XG4gICAgICAgICAgICAvLyBlbHNlIGlmIHJvb20gaXMgZW5jcnlwdGVkXG4gICAgICAgICAgICAvLyBhbmQgZXZlbnQgaXMgYmVpbmcgZW5jcnlwdGVkIG9yIGlzIG5vdF9zZW50IChVbmtub3duIERldmljZXMvTmV0d29yayBFcnJvcilcbiAgICAgICAgICAgIGlmIChldi5zdGF0dXMgPT09IEV2ZW50U3RhdHVzLkVOQ1JZUFRJTkcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYuc3RhdHVzID09PSBFdmVudFN0YXR1cy5OT1RfU0VOVCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldi5pc1N0YXRlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIHdlIGV4cGVjdCB0aGlzIHRvIGJlIHVuZW5jcnlwdGVkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyB3ZSBleHBlY3QgdGhpcyB0byBiZSB1bmVuY3J5cHRlZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBlbmNyeXB0ZWQsIGJ1dCBpdCdzIGFuIGUyZSByb29tLCBzaG93IHRoZSBvcGVuIHBhZGxvY2tcbiAgICAgICAgICAgIHJldHVybiA8RTJlUGFkbG9ja1VuZW5jcnlwdGVkIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbm8gcGFkbG9jayBuZWVkZWRcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbkJhckZvY3VzQ2hhbmdlID0gKGFjdGlvbkJhckZvY3VzZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGlvbkJhckZvY3VzZWQgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0VGlsZTogKCkgPT4gSUV2ZW50VGlsZVR5cGUgPSAoKSA9PiB0aGlzLnRpbGUuY3VycmVudDtcblxuICAgIHByaXZhdGUgZ2V0UmVwbHlDaGFpbiA9ICgpOiBSZXBseUNoYWluID0+IHRoaXMucmVwbHlDaGFpbi5jdXJyZW50O1xuXG4gICAgcHJpdmF0ZSBnZXRSZWFjdGlvbnMgPSAoKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICF0aGlzLnByb3BzLnNob3dSZWFjdGlvbnMgfHxcbiAgICAgICAgICAgICF0aGlzLnByb3BzLmdldFJlbGF0aW9uc0ZvckV2ZW50XG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5nZXRSZWxhdGlvbnNGb3JFdmVudChldmVudElkLCBcIm0uYW5ub3RhdGlvblwiLCBcIm0ucmVhY3Rpb25cIik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWFjdGlvbnNDcmVhdGVkID0gKHJlbGF0aW9uVHlwZTogc3RyaW5nLCBldmVudFR5cGU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAocmVsYXRpb25UeXBlICE9PSBcIm0uYW5ub3RhdGlvblwiIHx8IGV2ZW50VHlwZSAhPT0gXCJtLnJlYWN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJlYWN0aW9uczogdGhpcy5nZXRSZWFjdGlvbnMoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db250ZXh0TWVudSA9IChldjogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNob3dDb250ZXh0TWVudShldik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25UaW1lc3RhbXBDb250ZXh0TWVudSA9IChldjogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNob3dDb250ZXh0TWVudShldiwgdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yPy5mb3JFdmVudCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNob3dDb250ZXh0TWVudShldjogUmVhY3QuTW91c2VFdmVudCwgcGVybWFsaW5rPzogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaWNrVGFyZ2V0ID0gZXYudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXG4gICAgICAgIC8vIFRyeSB0byBmaW5kIGFuIGFuY2hvciBlbGVtZW50XG4gICAgICAgIGNvbnN0IGFuY2hvckVsZW1lbnQgPSAoY2xpY2tUYXJnZXQgaW5zdGFuY2VvZiBIVE1MQW5jaG9yRWxlbWVudCkgPyBjbGlja1RhcmdldCA6IGNsaWNrVGFyZ2V0LmNsb3Nlc3QoXCJhXCIpO1xuXG4gICAgICAgIC8vIFRoZXJlIGlzIG5vIHdheSB0byBjb3B5IG5vbi1QTkcgaW1hZ2VzIGludG8gY2xpcGJvYXJkLCBzbyB3ZSBjYW4ndFxuICAgICAgICAvLyBoYXZlIG91ciBvd24gaGFuZGxpbmcgZm9yIGNvcHlpbmcgaW1hZ2VzLCBzbyB3ZSBsZWF2ZSBpdCB0byB0aGVcbiAgICAgICAgLy8gRWxlY3Ryb24gbGF5ZXIgKHdlYmNvbnRlbnRzLWhhbmRsZXIudHMpXG4gICAgICAgIGlmIChjbGlja1RhcmdldCBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpIHJldHVybjtcblxuICAgICAgICAvLyBSZXR1cm4gaWYgd2UncmUgaW4gYSBicm93c2VyIGFuZCBjbGljayBlaXRoZXIgYW4gYSB0YWcgb3Igd2UgaGF2ZVxuICAgICAgICAvLyBzZWxlY3RlZCB0ZXh0LCBhcyBpbiB0aG9zZSBjYXNlcyB3ZSB3YW50IHRvIHVzZSB0aGUgbmF0aXZlIGJyb3dzZXJcbiAgICAgICAgLy8gbWVudVxuICAgICAgICBpZiAoIVBsYXRmb3JtUGVnLmdldCgpLmFsbG93T3ZlcnJpZGluZ05hdGl2ZUNvbnRleHRNZW51cygpICYmIChnZXRTZWxlY3RlZFRleHQoKSB8fCBhbmNob3JFbGVtZW50KSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gc2hvdyB0aGUgbWVudSB3aGVuIGVkaXRpbmcgYSBtZXNzYWdlXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRTdGF0ZSkgcmV0dXJuO1xuXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51OiB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogZXYuY2xpZW50WCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBldi5jbGllbnRZLFxuICAgICAgICAgICAgICAgICAgICBib3R0b206IGV2LmNsaWVudFksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsaW5rOiBhbmNob3JFbGVtZW50Py5ocmVmIHx8IHBlcm1hbGluayxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhY3Rpb25CYXJGb2N1c2VkOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2xvc2VNZW51ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51OiBudWxsLFxuICAgICAgICAgICAgYWN0aW9uQmFyRm9jdXNlZDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNldFF1b3RlRXhwYW5kZWQgPSAoZXhwYW5kZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc1F1b3RlRXhwYW5kZWQ6IGV4cGFuZGVkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW4gc29tZSBjYXNlcyB3ZSBjYW4ndCB1c2Ugc2hvdWxkSGlkZUV2ZW50KCkgc2luY2Ugd2hldGhlciBvciBub3Qgd2UgaGlkZVxuICAgICAqIGFuIGV2ZW50IGRlcGVuZHMgb24gb3RoZXIgdGhpbmdzIHRoYXQgdGhlIGV2ZW50IGl0c2VsZlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGV2ZW50IHNob3VsZCBiZSBoaWRkZW5cbiAgICAgKi9cbiAgICBwcml2YXRlIHNob3VsZEhpZGVFdmVudCgpOiBib29sZWFuIHtcbiAgICAgICAgLy8gSWYgdGhlIGNhbGwgd2FzIHJlcGxhY2VkIHdlIGRvbid0IHJlbmRlciBhbnl0aGluZyBzaW5jZSB3ZSByZW5kZXIgdGhlIG90aGVyIGNhbGxcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FsbEV2ZW50R3JvdXBlcj8uaGFuZ3VwUmVhc29uID09PSBDYWxsRXJyb3JDb2RlLlJlcGxhY2VkKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJDb250ZXh0TWVudSgpOiBSZWFjdC5SZWFjdEZyYWdtZW50IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNvbnRleHRNZW51KSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCB0aWxlID0gdGhpcy5nZXRUaWxlKCk7XG4gICAgICAgIGNvbnN0IHJlcGx5Q2hhaW4gPSB0aGlzLmdldFJlcGx5Q2hhaW4oKTtcbiAgICAgICAgY29uc3QgZXZlbnRUaWxlT3BzID0gdGlsZT8uZ2V0RXZlbnRUaWxlT3BzID8gdGlsZS5nZXRFdmVudFRpbGVPcHMoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgY29sbGFwc2VSZXBseUNoYWluID0gcmVwbHlDaGFpbj8uY2FuQ29sbGFwc2UoKSA/IHJlcGx5Q2hhaW4uY29sbGFwc2UgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxNZXNzYWdlQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICB7Li4uYWJvdmVSaWdodE9mKHRoaXMuc3RhdGUuY29udGV4dE1lbnUucG9zaXRpb24pfVxuICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgZXZlbnRUaWxlT3BzPXtldmVudFRpbGVPcHN9XG4gICAgICAgICAgICAgICAgY29sbGFwc2VSZXBseUNoYWluPXtjb2xsYXBzZVJlcGx5Q2hhaW59XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICByaWdodENsaWNrPXt0cnVlfVxuICAgICAgICAgICAgICAgIHJlYWN0aW9ucz17dGhpcy5zdGF0ZS5yZWFjdGlvbnN9XG4gICAgICAgICAgICAgICAgbGluaz17dGhpcy5zdGF0ZS5jb250ZXh0TWVudS5saW5rfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBtc2d0eXBlID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKS5tc2d0eXBlO1xuICAgICAgICBjb25zdCBldmVudFR5cGUgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0VHlwZSgpIGFzIEV2ZW50VHlwZTtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgaGFzUmVuZGVyZXIsXG4gICAgICAgICAgICBpc0J1YmJsZU1lc3NhZ2UsXG4gICAgICAgICAgICBpc0luZm9NZXNzYWdlLFxuICAgICAgICAgICAgaXNMZWZ0QWxpZ25lZEJ1YmJsZU1lc3NhZ2UsXG4gICAgICAgICAgICBub0J1YmJsZUV2ZW50LFxuICAgICAgICAgICAgaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24sXG4gICAgICAgIH0gPSBnZXRFdmVudERpc3BsYXlJbmZvKHRoaXMucHJvcHMubXhFdmVudCwgdGhpcy5jb250ZXh0LnNob3dIaWRkZW5FdmVudHMsIHRoaXMuc2hvdWxkSGlkZUV2ZW50KCkpO1xuICAgICAgICBjb25zdCB7IGlzUXVvdGVFeHBhbmRlZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgLy8gVGhpcyBzaG91bGRuJ3QgaGFwcGVuOiB0aGUgY2FsbGVyIHNob3VsZCBjaGVjayB3ZSBzdXBwb3J0IHRoaXMgdHlwZVxuICAgICAgICAvLyBiZWZvcmUgdHJ5aW5nIHRvIGluc3RhbnRpYXRlIHVzXG4gICAgICAgIGlmICghaGFzUmVuZGVyZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgbXhFdmVudCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBFdmVudCB0eXBlIG5vdCBzdXBwb3J0ZWQ6IHR5cGU6JHtldmVudFR5cGV9IGlzU3RhdGU6JHtteEV2ZW50LmlzU3RhdGUoKX1gKTtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZSBteF9FdmVudFRpbGVfaW5mbyBteF9NTm90aWNlQm9keVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2xpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnVGhpcyBldmVudCBjb3VsZCBub3QgYmUgZGlzcGxheWVkJykgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQcm9iYWJseU1lZGlhID0gTWVkaWFFdmVudEhlbHBlci5pc0VsaWdpYmxlKHRoaXMucHJvcHMubXhFdmVudCk7XG5cbiAgICAgICAgY29uc3QgbGluZUNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfRXZlbnRUaWxlX2xpbmVcIiwge1xuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX21lZGlhTGluZTogaXNQcm9iYWJseU1lZGlhLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2ltYWdlOiAoXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlJvb21NZXNzYWdlICYmXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKS5tc2d0eXBlID09PSBNc2dUeXBlLkltYWdlXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX3N0aWNrZXI6IHRoaXMucHJvcHMubXhFdmVudC5nZXRUeXBlKCkgPT09IEV2ZW50VHlwZS5TdGlja2VyLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2Vtb3RlOiAoXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlJvb21NZXNzYWdlICYmXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKS5tc2d0eXBlID09PSBNc2dUeXBlLkVtb3RlXG4gICAgICAgICAgICApLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpc1NlbmRpbmcgPSAoWydzZW5kaW5nJywgJ3F1ZXVlZCcsICdlbmNyeXB0aW5nJ10uaW5kZXhPZih0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cykgIT09IC0xKTtcbiAgICAgICAgY29uc3QgaXNSZWRhY3RlZCA9IGlzTWVzc2FnZUV2ZW50KHRoaXMucHJvcHMubXhFdmVudCkgJiYgdGhpcy5wcm9wcy5pc1JlZGFjdGVkO1xuICAgICAgICBjb25zdCBpc0VuY3J5cHRpb25GYWlsdXJlID0gdGhpcy5wcm9wcy5teEV2ZW50LmlzRGVjcnlwdGlvbkZhaWx1cmUoKTtcblxuICAgICAgICBsZXQgaXNDb250aW51YXRpb24gPSB0aGlzLnByb3BzLmNvbnRpbnVhdGlvbjtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgIT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tICYmXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoICYmXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLmxheW91dCAhPT0gTGF5b3V0LkJ1YmJsZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGlzQ29udGludWF0aW9uID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc0VkaXRpbmcgPSAhIXRoaXMucHJvcHMuZWRpdFN0YXRlO1xuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBteF9FdmVudFRpbGVfYnViYmxlQ29udGFpbmVyOiBpc0J1YmJsZU1lc3NhZ2UsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfbGVmdEFsaWduZWRCdWJibGU6IGlzTGVmdEFsaWduZWRCdWJibGVNZXNzYWdlLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlOiB0cnVlLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2lzRWRpdGluZzogaXNFZGl0aW5nLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2luZm86IGlzSW5mb01lc3NhZ2UsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfMTJocjogdGhpcy5wcm9wcy5pc1R3ZWx2ZUhvdXIsXG4gICAgICAgICAgICAvLyBOb3RlOiB3ZSBrZWVwIHRoZSBgc2VuZGluZ2Agc3RhdGUgY2xhc3MgZm9yIHRlc3RzLCBub3QgZm9yIG91ciBzdHlsZXNcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9zZW5kaW5nOiAhaXNFZGl0aW5nICYmIGlzU2VuZGluZyxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9oaWdobGlnaHQ6IHRoaXMuc2hvdWxkSGlnaGxpZ2h0KCksXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfc2VsZWN0ZWQ6IHRoaXMucHJvcHMuaXNTZWxlY3RlZEV2ZW50IHx8IHRoaXMuc3RhdGUuY29udGV4dE1lbnUsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfY29udGludWF0aW9uOiBpc0NvbnRpbnVhdGlvbiB8fCBldmVudFR5cGUgPT09IEV2ZW50VHlwZS5DYWxsSW52aXRlLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2xhc3Q6IHRoaXMucHJvcHMubGFzdCxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9sYXN0SW5TZWN0aW9uOiB0aGlzLnByb3BzLmxhc3RJblNlY3Rpb24sXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfY29udGV4dHVhbDogdGhpcy5wcm9wcy5jb250ZXh0dWFsLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2FjdGlvbkJhckZvY3VzZWQ6IHRoaXMuc3RhdGUuYWN0aW9uQmFyRm9jdXNlZCxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV92ZXJpZmllZDogIWlzQnViYmxlTWVzc2FnZSAmJiB0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVTdGF0ZS5WZXJpZmllZCxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV91bnZlcmlmaWVkOiAhaXNCdWJibGVNZXNzYWdlICYmIHRoaXMuc3RhdGUudmVyaWZpZWQgPT09IEUyRVN0YXRlLldhcm5pbmcsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfdW5rbm93bjogIWlzQnViYmxlTWVzc2FnZSAmJiB0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVTdGF0ZS5Vbmtub3duLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2JhZDogaXNFbmNyeXB0aW9uRmFpbHVyZSxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9lbW90ZTogbXNndHlwZSA9PT0gTXNnVHlwZS5FbW90ZSxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9ub1NlbmRlcjogdGhpcy5wcm9wcy5oaWRlU2VuZGVyLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2NsYW1wOiB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkc0xpc3QsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfbm9CdWJibGU6IG5vQnViYmxlRXZlbnQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIElmIHRoZSB0aWxlIGlzIGluIHRoZSBTZW5kaW5nIHN0YXRlLCBkb24ndCBzcGVhayB0aGUgbWVzc2FnZS5cbiAgICAgICAgY29uc3QgYXJpYUxpdmUgPSAodGhpcy5wcm9wcy5ldmVudFNlbmRTdGF0dXMgIT09IG51bGwpID8gJ29mZicgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgbGV0IHBlcm1hbGluayA9IFwiI1wiO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yKSB7XG4gICAgICAgICAgICBwZXJtYWxpbmsgPSB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IuZm9yRXZlbnQodGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgY2FuJ3QgdXNlIGxvY2FsIGVjaG9lcyBhcyBzY3JvbGwgdG9rZW5zLCBiZWNhdXNlIHRoZWlyIGV2ZW50IElEcyBjaGFuZ2UuXG4gICAgICAgIC8vIExvY2FsIGVjaG9zIGhhdmUgYSBzZW5kIFwic3RhdHVzXCIuXG4gICAgICAgIGNvbnN0IHNjcm9sbFRva2VuID0gdGhpcy5wcm9wcy5teEV2ZW50LnN0YXR1c1xuICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgIDogdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCk7XG5cbiAgICAgICAgbGV0IGF2YXRhcjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGxldCBzZW5kZXI6IEpTWC5FbGVtZW50O1xuICAgICAgICBsZXQgYXZhdGFyU2l6ZTogbnVtYmVyO1xuICAgICAgICBsZXQgbmVlZHNTZW5kZXJQcm9maWxlOiBib29sZWFuO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuTm90aWZpY2F0aW9uKSB7XG4gICAgICAgICAgICBhdmF0YXJTaXplID0gMjQ7XG4gICAgICAgICAgICBuZWVkc1NlbmRlclByb2ZpbGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSW5mb01lc3NhZ2UpIHtcbiAgICAgICAgICAgIC8vIGEgc21hbGwgYXZhdGFyLCB3aXRoIG5vIHNlbmRlciBwcm9maWxlLCBmb3JcbiAgICAgICAgICAgIC8vIGpvaW5zL3BhcnRzL2V0Y1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDE0O1xuICAgICAgICAgICAgbmVlZHNTZW5kZXJQcm9maWxlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZHNMaXN0IHx8XG4gICAgICAgICAgICAodGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZCAmJiAhdGhpcy5wcm9wcy5jb250aW51YXRpb24pXG4gICAgICAgICkge1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDMyO1xuICAgICAgICAgICAgbmVlZHNTZW5kZXJQcm9maWxlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudFR5cGUgPT09IEV2ZW50VHlwZS5Sb29tQ3JlYXRlIHx8IGlzQnViYmxlTWVzc2FnZSkge1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDA7XG4gICAgICAgICAgICBuZWVkc1NlbmRlclByb2ZpbGUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmxheW91dCA9PSBMYXlvdXQuSVJDKSB7XG4gICAgICAgICAgICBhdmF0YXJTaXplID0gMTQ7XG4gICAgICAgICAgICBuZWVkc1NlbmRlclByb2ZpbGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgKHRoaXMucHJvcHMuY29udGludWF0aW9uICYmIHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgIT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5GaWxlKSB8fFxuICAgICAgICAgICAgZXZlbnRUeXBlID09PSBFdmVudFR5cGUuQ2FsbEludml0ZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIG5vIGF2YXRhciBvciBzZW5kZXIgcHJvZmlsZSBmb3IgY29udGludWF0aW9uIG1lc3NhZ2VzIGFuZCBjYWxsIHRpbGVzXG4gICAgICAgICAgICBhdmF0YXJTaXplID0gMDtcbiAgICAgICAgICAgIG5lZWRzU2VuZGVyUHJvZmlsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDMwO1xuICAgICAgICAgICAgbmVlZHNTZW5kZXJQcm9maWxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm14RXZlbnQuc2VuZGVyICYmIGF2YXRhclNpemUpIHtcbiAgICAgICAgICAgIGxldCBtZW1iZXI7XG4gICAgICAgICAgICAvLyBzZXQgbWVtYmVyIHRvIHJlY2VpdmVyICh0YXJnZXQpIGlmIGl0IGlzIGEgM1BJRCBpbnZpdGVcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgdGhlIGNvcnJlY3QgYXZhdGFyIGlzIHNob3duIGFzIHRoZSB0ZXh0IGlzXG4gICAgICAgICAgICAvLyBgJHRhcmdldCBhY2NlcHRlZCB0aGUgaW52aXRhdGlvbiBmb3IgJGVtYWlsYFxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkudGhpcmRfcGFydHlfaW52aXRlKSB7XG4gICAgICAgICAgICAgICAgbWVtYmVyID0gdGhpcy5wcm9wcy5teEV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVtYmVyID0gdGhpcy5wcm9wcy5teEV2ZW50LnNlbmRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF2YXRhciA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9hdmF0YXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPE1lbWJlckF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyPXttZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdVc2VyT25DbGljaz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlSGlzdG9yaWNhbD17dGhpcy5wcm9wcy5teEV2ZW50LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlJvb21NZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5lZWRzU2VuZGVyUHJvZmlsZSAmJiB0aGlzLnByb3BzLmhpZGVTZW5kZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuUm9vbSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5TZWFyY2ggfHxcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuUGlubmVkIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc2VuZGVyID0gPFNlbmRlclByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblNlbmRlclByb2ZpbGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZW5kZXIgPSA8U2VuZGVyUHJvZmlsZVxuICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaG93TWVzc2FnZUFjdGlvbkJhciA9ICFpc0VkaXRpbmcgJiYgIXRoaXMucHJvcHMuZm9yRXhwb3J0O1xuICAgICAgICBjb25zdCBhY3Rpb25CYXIgPSBzaG93TWVzc2FnZUFjdGlvbkJhciA/IDxNZXNzYWdlQWN0aW9uQmFyXG4gICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICByZWFjdGlvbnM9e3RoaXMuc3RhdGUucmVhY3Rpb25zfVxuICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgZ2V0VGlsZT17dGhpcy5nZXRUaWxlfVxuICAgICAgICAgICAgZ2V0UmVwbHlDaGFpbj17dGhpcy5nZXRSZXBseUNoYWlufVxuICAgICAgICAgICAgb25Gb2N1c0NoYW5nZT17dGhpcy5vbkFjdGlvbkJhckZvY3VzQ2hhbmdlfVxuICAgICAgICAgICAgaXNRdW90ZUV4cGFuZGVkPXtpc1F1b3RlRXhwYW5kZWR9XG4gICAgICAgICAgICB0b2dnbGVUaHJlYWRFeHBhbmRlZD17KCkgPT4gdGhpcy5zZXRRdW90ZUV4cGFuZGVkKCFpc1F1b3RlRXhwYW5kZWQpfVxuICAgICAgICAgICAgZ2V0UmVsYXRpb25zRm9yRXZlbnQ9e3RoaXMucHJvcHMuZ2V0UmVsYXRpb25zRm9yRXZlbnR9XG4gICAgICAgIC8+IDogdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHNob3dUaW1lc3RhbXAgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0VHMoKVxuICAgICAgICAgICAgJiYgKHRoaXMucHJvcHMuYWx3YXlzU2hvd1RpbWVzdGFtcHNcbiAgICAgICAgICAgIHx8IHRoaXMucHJvcHMubGFzdFxuICAgICAgICAgICAgfHwgdGhpcy5zdGF0ZS5ob3ZlclxuICAgICAgICAgICAgfHwgdGhpcy5zdGF0ZS5hY3Rpb25CYXJGb2N1c2VkXG4gICAgICAgICAgICB8fCBCb29sZWFuKHRoaXMuc3RhdGUuY29udGV4dE1lbnUpKTtcblxuICAgICAgICAvLyBUaHJlYWQgcGFuZWwgc2hvd3MgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbGFzdCByZXBseSBpbiB0aGF0IHRocmVhZFxuICAgICAgICBsZXQgdHMgPSB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkc0xpc3RcbiAgICAgICAgICAgID8gdGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKClcbiAgICAgICAgICAgIDogdGhpcy5zdGF0ZS50aHJlYWQ/LnJlcGx5VG9FdmVudD8uZ2V0VHMoKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0cyAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgLy8gRmFsbCBiYWNrIHRvIHNvbWV0aGluZyB3ZSBjYW4gdXNlXG4gICAgICAgICAgICB0cyA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRUcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZVRpbWVzdGFtcCA9IDxNZXNzYWdlVGltZXN0YW1wXG4gICAgICAgICAgICBzaG93UmVsYXRpdmU9e3RoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWRzTGlzdH1cbiAgICAgICAgICAgIHNob3dUd2VsdmVIb3VyPXt0aGlzLnByb3BzLmlzVHdlbHZlSG91cn1cbiAgICAgICAgICAgIHRzPXt0c31cbiAgICAgICAgLz47XG5cbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gc2hvd1RpbWVzdGFtcCAmJiB0cyA/IG1lc3NhZ2VUaW1lc3RhbXAgOiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGtleVJlcXVlc3RIZWxwVGV4dCA9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9rZXlSZXF1ZXN0SW5mb190b29sdGlwX2NvbnRlbnRzXCI+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5wcmV2aW91c2x5UmVxdWVzdGVkS2V5cyA/XG4gICAgICAgICAgICAgICAgICAgICAgICBfdCgnWW91ciBrZXkgc2hhcmUgcmVxdWVzdCBoYXMgYmVlbiBzZW50IC0gcGxlYXNlIGNoZWNrIHlvdXIgb3RoZXIgc2Vzc2lvbnMgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnZm9yIGtleSBzaGFyZSByZXF1ZXN0cy4nKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBfdCgnS2V5IHNoYXJlIHJlcXVlc3RzIGFyZSBzZW50IHRvIHlvdXIgb3RoZXIgc2Vzc2lvbnMgYXV0b21hdGljYWxseS4gSWYgeW91ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JlamVjdGVkIG9yIGRpc21pc3NlZCB0aGUga2V5IHNoYXJlIHJlcXVlc3Qgb24geW91ciBvdGhlciBzZXNzaW9ucywgY2xpY2sgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnaGVyZSB0byByZXF1ZXN0IHRoZSBrZXlzIGZvciB0aGlzIHNlc3Npb24gYWdhaW4uJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnSWYgeW91ciBvdGhlciBzZXNzaW9ucyBkbyBub3QgaGF2ZSB0aGUga2V5IGZvciB0aGlzIG1lc3NhZ2UgeW91IHdpbGwgbm90ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdiZSBhYmxlIHRvIGRlY3J5cHQgdGhlbS4nKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICBjb25zdCBrZXlSZXF1ZXN0SW5mb0NvbnRlbnQgPSB0aGlzLnN0YXRlLnByZXZpb3VzbHlSZXF1ZXN0ZWRLZXlzID9cbiAgICAgICAgICAgIF90KCdLZXkgcmVxdWVzdCBzZW50LicpIDpcbiAgICAgICAgICAgIF90KFxuICAgICAgICAgICAgICAgICc8cmVxdWVzdExpbms+UmUtcmVxdWVzdCBlbmNyeXB0aW9uIGtleXM8L3JlcXVlc3RMaW5rPiBmcm9tIHlvdXIgb3RoZXIgc2Vzc2lvbnMuJyxcbiAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICdyZXF1ZXN0TGluayc6IChzdWIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9yZXJlcXVlc3RLZXlzQ3RhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPSdsaW5rX2lubGluZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUmVxdWVzdEtleXNDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGtleVJlcXVlc3RJbmZvID0gaXNFbmNyeXB0aW9uRmFpbHVyZSAmJiAhaXNSZWRhY3RlZCA/XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9rZXlSZXF1ZXN0SW5mb1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9rZXlSZXF1ZXN0SW5mb190ZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsga2V5UmVxdWVzdEluZm9Db250ZW50IH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPFRvb2x0aXBCdXR0b24gaGVscFRleHQ9e2tleVJlcXVlc3RIZWxwVGV4dH0gLz5cbiAgICAgICAgICAgIDwvZGl2PiA6IG51bGw7XG5cbiAgICAgICAgbGV0IHJlYWN0aW9uc1JvdztcbiAgICAgICAgaWYgKCFpc1JlZGFjdGVkKSB7XG4gICAgICAgICAgICByZWFjdGlvbnNSb3cgPSA8UmVhY3Rpb25zUm93XG4gICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgIHJlYWN0aW9ucz17dGhpcy5zdGF0ZS5yZWFjdGlvbnN9XG4gICAgICAgICAgICAgICAga2V5PVwibXhfRXZlbnRUaWxlX3JlYWN0aW9uc1Jvd1wiXG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxpbmtlZFRpbWVzdGFtcCA9IDxhXG4gICAgICAgICAgICBocmVmPXtwZXJtYWxpbmt9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUGVybWFsaW5rQ2xpY2tlZH1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2Zvcm1hdFRpbWUobmV3IERhdGUodGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCkpLCB0aGlzLnByb3BzLmlzVHdlbHZlSG91cil9XG4gICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uVGltZXN0YW1wQ29udGV4dE1lbnV9XG4gICAgICAgID5cbiAgICAgICAgICAgIHsgdGltZXN0YW1wIH1cbiAgICAgICAgPC9hPjtcblxuICAgICAgICBjb25zdCB1c2VJUkNMYXlvdXQgPSB0aGlzLnByb3BzLmxheW91dCA9PT0gTGF5b3V0LklSQztcbiAgICAgICAgY29uc3QgZ3JvdXBUaW1lc3RhbXAgPSAhdXNlSVJDTGF5b3V0ID8gbGlua2VkVGltZXN0YW1wIDogbnVsbDtcbiAgICAgICAgY29uc3QgaXJjVGltZXN0YW1wID0gdXNlSVJDTGF5b3V0ID8gbGlua2VkVGltZXN0YW1wIDogbnVsbDtcbiAgICAgICAgY29uc3QgYnViYmxlVGltZXN0YW1wID0gdGhpcy5wcm9wcy5sYXlvdXQgPT09IExheW91dC5CdWJibGUgPyBtZXNzYWdlVGltZXN0YW1wIDogbnVsbDtcbiAgICAgICAgY29uc3QgZ3JvdXBQYWRsb2NrID0gIXVzZUlSQ0xheW91dCAmJiAhaXNCdWJibGVNZXNzYWdlICYmIHRoaXMucmVuZGVyRTJFUGFkbG9jaygpO1xuICAgICAgICBjb25zdCBpcmNQYWRsb2NrID0gdXNlSVJDTGF5b3V0ICYmICFpc0J1YmJsZU1lc3NhZ2UgJiYgdGhpcy5yZW5kZXJFMkVQYWRsb2NrKCk7XG5cbiAgICAgICAgbGV0IG1zZ09wdGlvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2hvd1JlYWRSZWNlaXB0cykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2hvd1NlbnRSZWNlaXB0IHx8IHRoaXMuc2hvdWxkU2hvd1NlbmRpbmdSZWNlaXB0KSB7XG4gICAgICAgICAgICAgICAgbXNnT3B0aW9uID0gPFNlbnRSZWNlaXB0IG1lc3NhZ2VTdGF0ZT17dGhpcy5wcm9wcy5teEV2ZW50LmdldEFzc29jaWF0ZWRTdGF0dXMoKX0gLz47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1zZ09wdGlvbiA9IDxSZWFkUmVjZWlwdEdyb3VwXG4gICAgICAgICAgICAgICAgICAgIHJlYWRSZWNlaXB0cz17dGhpcy5wcm9wcy5yZWFkUmVjZWlwdHMgPz8gW119XG4gICAgICAgICAgICAgICAgICAgIHJlYWRSZWNlaXB0TWFwPXt0aGlzLnByb3BzLnJlYWRSZWNlaXB0TWFwID8/IHt9fVxuICAgICAgICAgICAgICAgICAgICBjaGVja1VubW91bnRpbmc9e3RoaXMucHJvcHMuY2hlY2tVbm1vdW50aW5nfVxuICAgICAgICAgICAgICAgICAgICBzdXBwcmVzc0FuaW1hdGlvbj17dGhpcy5zdXBwcmVzc1JlYWRSZWNlaXB0QW5pbWF0aW9ufVxuICAgICAgICAgICAgICAgICAgICBpc1R3ZWx2ZUhvdXI9e3RoaXMucHJvcHMuaXNUd2VsdmVIb3VyfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlcGx5Q2hhaW47XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGhhdmVSZW5kZXJlckZvckV2ZW50KHRoaXMucHJvcHMubXhFdmVudCwgdGhpcy5jb250ZXh0LnNob3dIaWRkZW5FdmVudHMpICYmXG4gICAgICAgICAgICBzaG91bGREaXNwbGF5UmVwbHkodGhpcy5wcm9wcy5teEV2ZW50KVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJlcGx5Q2hhaW4gPSA8UmVwbHlDaGFpblxuICAgICAgICAgICAgICAgIHBhcmVudEV2PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgb25IZWlnaHRDaGFuZ2VkPXt0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICByZWY9e3RoaXMucmVwbHlDaGFpbn1cbiAgICAgICAgICAgICAgICBmb3JFeHBvcnQ9e3RoaXMucHJvcHMuZm9yRXhwb3J0fVxuICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcn1cbiAgICAgICAgICAgICAgICBsYXlvdXQ9e3RoaXMucHJvcHMubGF5b3V0fVxuICAgICAgICAgICAgICAgIGFsd2F5c1Nob3dUaW1lc3RhbXBzPXt0aGlzLnByb3BzLmFsd2F5c1Nob3dUaW1lc3RhbXBzIHx8IHRoaXMuc3RhdGUuaG92ZXJ9XG4gICAgICAgICAgICAgICAgaXNRdW90ZUV4cGFuZGVkPXtpc1F1b3RlRXhwYW5kZWR9XG4gICAgICAgICAgICAgICAgc2V0UXVvdGVFeHBhbmRlZD17dGhpcy5zZXRRdW90ZUV4cGFuZGVkfVxuICAgICAgICAgICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PXt0aGlzLnByb3BzLmdldFJlbGF0aW9uc0ZvckV2ZW50fVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2UgYGdldFNlbmRlcigpYCBiZWNhdXNlIHNlYXJjaGVkIGV2ZW50cyBtaWdodCBub3QgaGF2ZSBhIHByb3BlciBgc2VuZGVyYC5cbiAgICAgICAgY29uc3QgaXNPd25FdmVudCA9IHRoaXMucHJvcHMubXhFdmVudD8uZ2V0U2VuZGVyKCkgPT09IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgVGltZWxpbmVSZW5kZXJpbmdUeXBlLk5vdGlmaWNhdGlvbjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMuYXMgfHwgXCJsaVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IGNsYXNzZXMsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1saXZlXCI6IGFyaWFMaXZlLFxuICAgICAgICAgICAgICAgICAgICBcImFyaWEtYXRvbWljXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zY3JvbGwtdG9rZW5zXCI6IHNjcm9sbFRva2VuLFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfcm9vbU5hbWVcIiBrZXk9XCJteF9FdmVudFRpbGVfcm9vbU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e3Jvb219IHdpZHRoPXsyOH0gaGVpZ2h0PXsyOH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e3Blcm1hbGlua30gb25DbGljaz17dGhpcy5vblBlcm1hbGlua0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcm9vbSA/IHJvb20ubmFtZSA6ICcnIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9zZW5kZXJEZXRhaWxzXCIga2V5PVwibXhfRXZlbnRUaWxlX3NlbmRlckRldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17cGVybWFsaW5rfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25QZXJtYWxpbmtDbGlja2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29udGV4dE1lbnU9e3RoaXMub25UaW1lc3RhbXBDb250ZXh0TWVudX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtsaW5lQ2xhc3Nlc30ga2V5PVwibXhfRXZlbnRUaWxlX2xpbmVcIiBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckNvbnRleHRNZW51KCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZW5kZXJUaWxlKFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Ob3RpZmljYXRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi50aGlzLnByb3BzLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiB0aGlzLnRpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcHBlYXNlIFRTXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0czogdGhpcy5wcm9wcy5oaWdobGlnaHRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodExpbms6IHRoaXMucHJvcHMuaGlnaGxpZ2h0TGluayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ6IHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I6IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMuY29udGV4dC5zaG93SGlkZGVuRXZlbnRzKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMuYXMgfHwgXCJsaVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IHRoaXMucmVmLFxuICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBjbGFzc2VzLFxuICAgICAgICAgICAgICAgICAgICBcImFyaWEtbGl2ZVwiOiBhcmlhTGl2ZSxcbiAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWF0b21pY1wiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBcImRhdGEtc2Nyb2xsLXRva2Vuc1wiOiBzY3JvbGxUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWhhcy1yZXBseVwiOiAhIXJlcGx5Q2hhaW4sXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YS1sYXlvdXRcIjogdGhpcy5wcm9wcy5sYXlvdXQsXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zZWxmXCI6IGlzT3duRXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YS1ldmVudC1pZFwiOiB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgXCJvbk1vdXNlRW50ZXJcIjogKCkgPT4gdGhpcy5zZXRTdGF0ZSh7IGhvdmVyOiB0cnVlIH0pLFxuICAgICAgICAgICAgICAgICAgICBcIm9uTW91c2VMZWF2ZVwiOiAoKSA9PiB0aGlzLnNldFN0YXRlKHsgaG92ZXI6IGZhbHNlIH0pLFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfcm9vbU5hbWVcIiBrZXk9XCJteF9FdmVudFRpbGVfcm9vbU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e3Jvb219IHdpZHRoPXsyOH0gaGVpZ2h0PXsyOH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e3Blcm1hbGlua30gb25DbGljaz17dGhpcy5vblBlcm1hbGlua0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcm9vbSA/IHJvb20ubmFtZSA6ICcnIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9zZW5kZXJEZXRhaWxzXCIga2V5PVwibXhfRXZlbnRUaWxlX3NlbmRlckRldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc2VuZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17bGluZUNsYXNzZXN9IGtleT1cIm14X0V2ZW50VGlsZV9saW5lXCIgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJDb250ZXh0TWVudSgpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVwbHlDaGFpbiB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlbmRlclRpbGUoVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnRoaXMucHJvcHMsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvdmVycmlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IHRoaXMudGlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlZWluZ1Rocm91Z2hNZXNzYWdlSGlkZGVuRm9yTW9kZXJhdGlvbixcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFwcGVhc2UgVFNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRzOiB0aGlzLnByb3BzLmhpZ2hsaWdodHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0TGluazogdGhpcy5wcm9wcy5oaWdobGlnaHRMaW5rLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZDogdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcjogdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5jb250ZXh0LnNob3dIaWRkZW5FdmVudHMpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYWN0aW9uQmFyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e3Blcm1hbGlua30gb25DbGljaz17dGhpcy5vblBlcm1hbGlua0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGltZXN0YW1wIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgICAgICByZWFjdGlvbnNSb3csXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWRzTGlzdDoge1xuICAgICAgICAgICAgICAgIC8vIHRhYi1pbmRleD0tMSB0byBhbGxvdyBpdCB0byBiZSBmb2N1c2FibGUgYnV0IGRvIG5vdCBhZGQgdGFiIHN0b3AgZm9yIGl0LCBwcmltYXJpbHkgZm9yIHNjcmVlbiByZWFkZXJzXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCh0aGlzLnByb3BzLmFzIHx8IFwibGlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogdGhpcy5yZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBjbGFzc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0YWJJbmRleFwiOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1saXZlXCI6IGFyaWFMaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWF0b21pY1wiOiBcInRydWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zY3JvbGwtdG9rZW5zXCI6IHNjcm9sbFRva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWxheW91dFwiOiB0aGlzLnByb3BzLmxheW91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zaGFwZVwiOiB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLXNlbGZcIjogaXNPd25FdmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1oYXMtcmVwbHlcIjogISFyZXBseUNoYWluLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLW5vdGlmaWNhdGlvblwiOiB0aGlzLnN0YXRlLnRocmVhZE5vdGlmaWNhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwib25Nb3VzZUVudGVyXCI6ICgpID0+IHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogdHJ1ZSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwib25Nb3VzZUxlYXZlXCI6ICgpID0+IHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogZmFsc2UgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm9uQ2xpY2tcIjogKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFNob3dUaHJlYWRQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlNob3dUaHJlYWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RFdmVudDogdGhpcy5wcm9wcy5teEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2LmN1cnJlbnRUYXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBBcnJheS5mcm9tKHRhcmdldC5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKS5pbmRleE9mKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJUaHJlYWRzUGFuZWxUaHJlYWRJdGVtXCIsIGV2LCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LCA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzZW5kZXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bGluZUNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PVwibXhfRXZlbnRUaWxlX2xpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLm14RXZlbnQuaXNSZWRhY3RlZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IDxSZWRhY3RlZEJvZHkgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBNZXNzYWdlUHJldmlld1N0b3JlLmluc3RhbmNlLmdlbmVyYXRlUHJldmlld0ZvckV2ZW50KHRoaXMucHJvcHMubXhFdmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJUaHJlYWRQYW5lbFN1bW1hcnkoKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxUb29sYmFyIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXJcIiBhcmlhLWxhYmVsPXtfdChcIk1lc3NhZ2UgQWN0aW9uc1wiKX0gYXJpYS1saXZlPVwib2ZmXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXJfaWNvbkJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudmlld0luUm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiVmlldyBpbiByb29tXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJ2aWV3X2luX3Jvb21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFZpZXdJblJvb21JY29uIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Sb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Um92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUFjdGlvbkJhcl9pY29uQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5jb3B5TGlua1RvVGhyZWFkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJDb3B5IGxpbmsgdG8gdGhyZWFkXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJjb3B5X2xpbmtfdG9fdGhyZWFkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMaW5rSWNvbiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1Rvb2xiYXI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IG1zZ09wdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvPilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuRmlsZToge1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMuYXMgfHwgXCJsaVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IGNsYXNzZXMsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJpYS1saXZlXCI6IGFyaWFMaXZlLFxuICAgICAgICAgICAgICAgICAgICBcImFyaWEtYXRvbWljXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zY3JvbGwtdG9rZW5zXCI6IHNjcm9sbFRva2VuLFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2xpbmVDbGFzc2VzfSBrZXk9XCJteF9FdmVudFRpbGVfbGluZVwiIG9uQ29udGV4dE1lbnU9e3RoaXMub25Db250ZXh0TWVudX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQ29udGV4dE1lbnUoKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlbmRlclRpbGUoVGltZWxpbmVSZW5kZXJpbmdUeXBlLkZpbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi50aGlzLnByb3BzLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiB0aGlzLnRpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcHBlYXNlIFRTXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0czogdGhpcy5wcm9wcy5oaWdobGlnaHRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodExpbms6IHRoaXMucHJvcHMuaGlnaGxpZ2h0TGluayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ6IHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I6IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMuY29udGV4dC5zaG93SGlkZGVuRXZlbnRzKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9zZW5kZXJEZXRhaWxzTGlua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJteF9FdmVudFRpbGVfc2VuZGVyRGV0YWlsc0xpbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17cGVybWFsaW5rfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblBlcm1hbGlua0NsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfc2VuZGVyRGV0YWlsc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vblRpbWVzdGFtcENvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc2VuZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRpbWVzdGFtcCB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9hPixcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVmYXVsdDogeyAvLyBQaW5uZWQsIFJvb20sIFNlYXJjaFxuICAgICAgICAgICAgICAgIC8vIHRhYi1pbmRleD0tMSB0byBhbGxvdyBpdCB0byBiZSBmb2N1c2FibGUgYnV0IGRvIG5vdCBhZGQgdGFiIHN0b3AgZm9yIGl0LCBwcmltYXJpbHkgZm9yIHNjcmVlbiByZWFkZXJzXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCh0aGlzLnByb3BzLmFzIHx8IFwibGlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogdGhpcy5yZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBjbGFzc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0YWJJbmRleFwiOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1saXZlXCI6IGFyaWFMaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhcmlhLWF0b21pY1wiOiBcInRydWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zY3JvbGwtdG9rZW5zXCI6IHNjcm9sbFRva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWxheW91dFwiOiB0aGlzLnByb3BzLmxheW91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1zZWxmXCI6IGlzT3duRXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtZXZlbnQtaWRcIjogdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtaGFzLXJlcGx5XCI6ICEhcmVwbHlDaGFpbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwib25Nb3VzZUVudGVyXCI6ICgpID0+IHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogdHJ1ZSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwib25Nb3VzZUxlYXZlXCI6ICgpID0+IHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogZmFsc2UgfSksXG4gICAgICAgICAgICAgICAgICAgIH0sIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlyY1RpbWVzdGFtcCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlyY1BhZGxvY2sgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2xpbmVDbGFzc2VzfSBrZXk9XCJteF9FdmVudFRpbGVfbGluZVwiIG9uQ29udGV4dE1lbnU9e3RoaXMub25Db250ZXh0TWVudX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckNvbnRleHRNZW51KCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBUaW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBQYWRsb2NrIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlcGx5Q2hhaW4gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVuZGVyVGlsZSh0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnRoaXMucHJvcHMsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogdGhpcy50aWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1NlZWluZ1Rocm91Z2hNZXNzYWdlSGlkZGVuRm9yTW9kZXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBidWJibGVUaW1lc3RhbXAsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXBwZWFzZSBUU1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRzOiB0aGlzLnByb3BzLmhpZ2hsaWdodHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodExpbms6IHRoaXMucHJvcHMuaGlnaGxpZ2h0TGluayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25IZWlnaHRDaGFuZ2VkOiB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcjogdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMuY29udGV4dC5zaG93SGlkZGVuRXZlbnRzKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBrZXlSZXF1ZXN0SW5mbyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBhY3Rpb25CYXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5sYXlvdXQgPT09IExheW91dC5JUkMgJiYgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWFjdGlvbnNSb3cgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyVGhyZWFkSW5mbygpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Lz4gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMubGF5b3V0ICE9PSBMYXlvdXQuSVJDICYmIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWFjdGlvbnNSb3cgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJUaHJlYWRJbmZvKCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC8+IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbXNnT3B0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgPC8+KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIFdyYXAgYWxsIGV2ZW50IHRpbGVzIHdpdGggdGhlIHRpbGUgZXJyb3IgYm91bmRhcnkgc28gdGhhdCBhbnkgdGhyb3dzIGV2ZW4gZHVyaW5nIGNvbnN0cnVjdGlvbiBhcmUgY2FwdHVyZWRcbmNvbnN0IFNhZmVFdmVudFRpbGUgPSBmb3J3YXJkUmVmKChwcm9wczogSVByb3BzLCByZWY6IFJlZk9iamVjdDxVbndyYXBwZWRFdmVudFRpbGU+KSA9PiB7XG4gICAgcmV0dXJuIDxUaWxlRXJyb3JCb3VuZGFyeSBteEV2ZW50PXtwcm9wcy5teEV2ZW50fSBsYXlvdXQ9e3Byb3BzLmxheW91dH0+XG4gICAgICAgIDxVbndyYXBwZWRFdmVudFRpbGUgcmVmPXtyZWZ9IHsuLi5wcm9wc30gLz5cbiAgICA8L1RpbGVFcnJvckJvdW5kYXJ5Pjtcbn0pO1xuZXhwb3J0IGRlZmF1bHQgU2FmZUV2ZW50VGlsZTtcblxuZnVuY3Rpb24gRTJlUGFkbG9ja1VuZGVjcnlwdGFibGUocHJvcHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8RTJlUGFkbG9jayB0aXRsZT17X3QoXCJUaGlzIG1lc3NhZ2UgY2Fubm90IGJlIGRlY3J5cHRlZFwiKX0gaWNvbj17RTJlUGFkbG9ja0ljb24uV2FybmluZ30gey4uLnByb3BzfSAvPlxuICAgICk7XG59XG5cbmZ1bmN0aW9uIEUyZVBhZGxvY2tVbnZlcmlmaWVkKHByb3BzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEUyZVBhZGxvY2sgdGl0bGU9e190KFwiRW5jcnlwdGVkIGJ5IGFuIHVudmVyaWZpZWQgc2Vzc2lvblwiKX0gaWNvbj17RTJlUGFkbG9ja0ljb24uV2FybmluZ30gey4uLnByb3BzfSAvPlxuICAgICk7XG59XG5cbmZ1bmN0aW9uIEUyZVBhZGxvY2tVbmVuY3J5cHRlZChwcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxFMmVQYWRsb2NrIHRpdGxlPXtfdChcIlVuZW5jcnlwdGVkXCIpfSBpY29uPXtFMmVQYWRsb2NrSWNvbi5XYXJuaW5nfSB7Li4ucHJvcHN9IC8+XG4gICAgKTtcbn1cblxuZnVuY3Rpb24gRTJlUGFkbG9ja1Vua25vd24ocHJvcHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8RTJlUGFkbG9jayB0aXRsZT17X3QoXCJFbmNyeXB0ZWQgYnkgYSBkZWxldGVkIHNlc3Npb25cIil9IGljb249e0UyZVBhZGxvY2tJY29uLk5vcm1hbH0gey4uLnByb3BzfSAvPlxuICAgICk7XG59XG5cbmZ1bmN0aW9uIEUyZVBhZGxvY2tVbmF1dGhlbnRpY2F0ZWQocHJvcHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8RTJlUGFkbG9ja1xuICAgICAgICAgICAgdGl0bGU9e190KFwiVGhlIGF1dGhlbnRpY2l0eSBvZiB0aGlzIGVuY3J5cHRlZCBtZXNzYWdlIGNhbid0IGJlIGd1YXJhbnRlZWQgb24gdGhpcyBkZXZpY2UuXCIpfVxuICAgICAgICAgICAgaWNvbj17RTJlUGFkbG9ja0ljb24uTm9ybWFsfVxuICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAvPlxuICAgICk7XG59XG5cbmVudW0gRTJlUGFkbG9ja0ljb24ge1xuICAgIE5vcm1hbCA9IFwibm9ybWFsXCIsXG4gICAgV2FybmluZyA9IFwid2FybmluZ1wiLFxufVxuXG5pbnRlcmZhY2UgSUUyZVBhZGxvY2tQcm9wcyB7XG4gICAgaWNvbjogRTJlUGFkbG9ja0ljb247XG4gICAgdGl0bGU6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElFMmVQYWRsb2NrU3RhdGUge1xuICAgIGhvdmVyOiBib29sZWFuO1xufVxuXG5jbGFzcyBFMmVQYWRsb2NrIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElFMmVQYWRsb2NrUHJvcHMsIElFMmVQYWRsb2NrU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSUUyZVBhZGxvY2tQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uSG92ZXJTdGFydCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhvdmVyOiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSG92ZXJFbmQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogZmFsc2UgfSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBsZXQgdG9vbHRpcCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmhvdmVyKSB7XG4gICAgICAgICAgICB0b29sdGlwID0gPFRvb2x0aXAgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2UyZUljb25fdG9vbHRpcFwiIGxhYmVsPXt0aGlzLnByb3BzLnRpdGxlfSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBgbXhfRXZlbnRUaWxlX2UyZUljb24gbXhfRXZlbnRUaWxlX2UyZUljb25fJHt0aGlzLnByb3BzLmljb259YDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLm9uSG92ZXJTdGFydH1cbiAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMub25Ib3ZlckVuZH1cbiAgICAgICAgICAgID57IHRvb2x0aXAgfTwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElTZW50UmVjZWlwdFByb3BzIHtcbiAgICBtZXNzYWdlU3RhdGU6IHN0cmluZzsgLy8gVE9ETzogVHlwZXMgZm9yIG1lc3NhZ2Ugc2VuZGluZyBzdGF0ZVxufVxuXG5mdW5jdGlvbiBTZW50UmVjZWlwdCh7IG1lc3NhZ2VTdGF0ZSB9OiBJU2VudFJlY2VpcHRQcm9wcykge1xuICAgIGNvbnN0IGlzU2VudCA9ICFtZXNzYWdlU3RhdGUgfHwgbWVzc2FnZVN0YXRlID09PSAnc2VudCc7XG4gICAgY29uc3QgaXNGYWlsZWQgPSBtZXNzYWdlU3RhdGUgPT09ICdub3Rfc2VudCc7XG4gICAgY29uc3QgcmVjZWlwdENsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgJ214X0V2ZW50VGlsZV9yZWNlaXB0U2VudCc6IGlzU2VudCxcbiAgICAgICAgJ214X0V2ZW50VGlsZV9yZWNlaXB0U2VuZGluZyc6ICFpc1NlbnQgJiYgIWlzRmFpbGVkLFxuICAgIH0pO1xuXG4gICAgbGV0IG5vbkNzc0JhZGdlID0gbnVsbDtcbiAgICBpZiAoaXNGYWlsZWQpIHtcbiAgICAgICAgbm9uQ3NzQmFkZ2UgPSAoXG4gICAgICAgICAgICA8Tm90aWZpY2F0aW9uQmFkZ2Ugbm90aWZpY2F0aW9uPXtTdGF0aWNOb3RpZmljYXRpb25TdGF0ZS5SRURfRVhDTEFNQVRJT059IC8+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGxhYmVsID0gX3QoXCJTZW5kaW5nIHlvdXIgbWVzc2FnZS4uLlwiKTtcbiAgICBpZiAobWVzc2FnZVN0YXRlID09PSAnZW5jcnlwdGluZycpIHtcbiAgICAgICAgbGFiZWwgPSBfdChcIkVuY3J5cHRpbmcgeW91ciBtZXNzYWdlLi4uXCIpO1xuICAgIH0gZWxzZSBpZiAoaXNTZW50KSB7XG4gICAgICAgIGxhYmVsID0gX3QoXCJZb3VyIG1lc3NhZ2Ugd2FzIHNlbnRcIik7XG4gICAgfSBlbHNlIGlmIChpc0ZhaWxlZCkge1xuICAgICAgICBsYWJlbCA9IF90KFwiRmFpbGVkIHRvIHNlbmRcIik7XG4gICAgfVxuICAgIGNvbnN0IFt7IHNob3dUb29sdGlwLCBoaWRlVG9vbHRpcCB9LCB0b29sdGlwXSA9IHVzZVRvb2x0aXAoe1xuICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgIGFsaWdubWVudDogQWxpZ25tZW50LlRvcFJpZ2h0LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfbXNnT3B0aW9uXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1JlYWRSZWNlaXB0R3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1JlYWRSZWNlaXB0R3JvdXBfYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU92ZXI9e3Nob3dUb29sdGlwfVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9e2hpZGVUb29sdGlwfVxuICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXtzaG93VG9vbHRpcH1cbiAgICAgICAgICAgICAgICAgICAgb25CbHVyPXtoaWRlVG9vbHRpcH0+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1JlYWRSZWNlaXB0R3JvdXBfY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3JlY2VpcHRDbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5vbkNzc0JhZGdlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgdG9vbHRpcCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7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