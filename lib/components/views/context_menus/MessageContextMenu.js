"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/models/event");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _matrixEventsSdk = require("matrix-events-sdk");

var _thread = require("matrix-js-sdk/src/models/thread");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _Resend = _interopRequireDefault(require("../../../Resend"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _HtmlUtils = require("../../../HtmlUtils");

var _EventUtils = require("../../../utils/EventUtils");

var _IconizedContextMenu = _interopRequireWildcard(require("./IconizedContextMenu"));

var _types = require("../right_panel/types");

var _actions = require("../../../dispatcher/actions");

var _strings = require("../../../utils/strings");

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _ReactionPicker = _interopRequireDefault(require("../emojipicker/ReactionPicker"));

var _ViewSource = _interopRequireDefault(require("../../structures/ViewSource"));

var _ConfirmRedactDialog = require("../dialogs/ConfirmRedactDialog");

var _ShareDialog = _interopRequireDefault(require("../dialogs/ShareDialog"));

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _EndPollDialog = _interopRequireDefault(require("../dialogs/EndPollDialog"));

var _MPollBody = require("../messages/MPollBody");

var _location = require("../../../utils/location");

var _getForwardableEvent = require("../../../events/forward/getForwardableEvent");

var _getShareableLocationEvent = require("../../../events/location/getShareableLocationEvent");

var _context = require("../right_panel/context");

var _UserTab = require("../dialogs/UserTab");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2015 - 2022 The Matrix.org Foundation C.I.C.
Copyright 2021 - 2022 Šimon Brandner <simon.bra.ag@gmail.com>

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
const ReplyInThreadButton = _ref => {
  let {
    mxEvent,
    closeMenu
  } = _ref;
  const context = (0, _react.useContext)(_context.CardContext);
  const relationType = mxEvent?.getRelation()?.rel_type; // Can't create a thread from an event with an existing relation

  if (Boolean(relationType) && relationType !== _event2.RelationType.Thread) return;

  const onClick = () => {
    if (!localStorage.getItem("mx_seen_feature_thread")) {
      localStorage.setItem("mx_seen_feature_thread", "true");
    }

    if (!_SettingsStore.default.getValue("feature_thread")) {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewUserSettings,
        initialTabId: _UserTab.UserTab.Labs
      });
    } else if (mxEvent.getThread() && !mxEvent.isThreadRoot) {
      _dispatcher.default.dispatch({
        action: _actions.Action.ShowThread,
        rootEvent: mxEvent.getThread().rootEvent,
        initialEvent: mxEvent,
        scroll_into_view: true,
        highlighted: true,
        push: context.isCard
      });
    } else {
      _dispatcher.default.dispatch({
        action: _actions.Action.ShowThread,
        rootEvent: mxEvent,
        push: context.isCard
      });
    }

    closeMenu();
  };

  return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
    iconClassName: "mx_MessageContextMenu_iconReplyInThread",
    label: (0, _languageHandler._t)("Reply in thread"),
    onClick: onClick
  });
};

class MessageContextMenu extends _react.default.Component {
  // XXX Ref to a functional component
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "reactButtonRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "checkPermissions", () => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(this.props.mxEvent.getRoomId()); // We explicitly decline to show the redact option on ACL events as it has a potential
      // to obliterate the room - https://github.com/matrix-org/synapse/issues/4042
      // Similarly for encryption events, since redacting them "breaks everything"

      const canRedact = room.currentState.maySendRedactionForEvent(this.props.mxEvent, cli.credentials.userId) && this.props.mxEvent.getType() !== _event2.EventType.RoomServerAcl && this.props.mxEvent.getType() !== _event2.EventType.RoomEncryption;

      let canPin = room.currentState.mayClientSendStateEvent(_event2.EventType.RoomPinnedEvents, cli) && (0, _EventUtils.canPinEvent)(this.props.mxEvent); // HACK: Intentionally say we can't pin if the user doesn't want to use the functionality

      if (!_SettingsStore.default.getValue("feature_pinning")) canPin = false;
      this.setState({
        canRedact,
        canPin
      });
    });
    (0, _defineProperty2.default)(this, "onResendReactionsClick", () => {
      for (const reaction of this.getUnsentReactions()) {
        _Resend.default.resend(reaction);
      }

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onJumpToRelatedEventClick", relatedEventId => {
      _dispatcher.default.dispatch({
        action: "view_room",
        room_id: this.props.mxEvent.getRoomId(),
        event_id: relatedEventId,
        highlighted: true
      });
    });
    (0, _defineProperty2.default)(this, "onReportEventClick", () => {
      _dispatcher.default.dispatch({
        action: _actions.Action.OpenReportEventDialog,
        event: this.props.mxEvent
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onViewSourceClick", () => {
      _Modal.default.createDialog(_ViewSource.default, {
        mxEvent: this.props.mxEvent
      }, 'mx_Dialog_viewsource');

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onRedactClick", () => {
      const {
        mxEvent,
        onCloseDialog
      } = this.props;
      (0, _ConfirmRedactDialog.createRedactEventDialog)({
        mxEvent,
        onCloseDialog
      });
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onForwardClick", forwardableEvent => () => {
      _dispatcher.default.dispatch({
        action: _actions.Action.OpenForwardDialog,
        event: forwardableEvent,
        permalinkCreator: this.props.permalinkCreator
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onPinClick", () => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(this.props.mxEvent.getRoomId());
      const eventId = this.props.mxEvent.getId();
      const pinnedIds = room?.currentState?.getStateEvents(_event2.EventType.RoomPinnedEvents, "")?.getContent().pinned || [];

      if (pinnedIds.includes(eventId)) {
        pinnedIds.splice(pinnedIds.indexOf(eventId), 1);
      } else {
        pinnedIds.push(eventId);
        cli.setRoomAccountData(room.roomId, _types.ReadPinsEventId, {
          event_ids: [...(room.getAccountData(_types.ReadPinsEventId)?.getContent()?.event_ids || []), eventId]
        });
      }

      cli.sendStateEvent(this.props.mxEvent.getRoomId(), _event2.EventType.RoomPinnedEvents, {
        pinned: pinnedIds
      }, "");
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "closeMenu", () => {
      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onUnhidePreviewClick", () => {
      this.props.eventTileOps?.unhideWidget();
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onQuoteClick", () => {
      _dispatcher.default.dispatch({
        action: _actions.Action.ComposerInsert,
        event: this.props.mxEvent,
        timelineRenderingType: this.context.timelineRenderingType
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onShareClick", e => {
      e.preventDefault();

      _Modal.default.createDialog(_ShareDialog.default, {
        target: this.props.mxEvent,
        permalinkCreator: this.props.permalinkCreator
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onCopyLinkClick", e => {
      e.preventDefault(); // So that we don't open the permalink

      (0, _strings.copyPlaintext)(this.props.link);
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onCollapseReplyChainClick", () => {
      this.props.collapseReplyChain();
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onCopyClick", () => {
      (0, _strings.copyPlaintext)((0, _strings.getSelectedText)());
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onEditClick", () => {
      (0, _EventUtils.editEvent)(this.props.mxEvent, this.context.timelineRenderingType, this.props.getRelationsForEvent);
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onReplyClick", () => {
      _dispatcher.default.dispatch({
        action: 'reply_to_event',
        event: this.props.mxEvent,
        context: this.context.timelineRenderingType
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onReactClick", () => {
      this.setState({
        reactionPickerDisplayed: true
      });
    });
    (0, _defineProperty2.default)(this, "onCloseReactionPicker", () => {
      this.setState({
        reactionPickerDisplayed: false
      });
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onEndPollClick", () => {
      const matrixClient = _MatrixClientPeg.MatrixClientPeg.get();

      _Modal.default.createDialog(_EndPollDialog.default, {
        matrixClient,
        event: this.props.mxEvent,
        getRelationsForEvent: this.props.getRelationsForEvent
      }, 'mx_Dialog_endPoll');

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "viewInRoom", () => {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        event_id: this.props.mxEvent.getId(),
        highlighted: true,
        room_id: this.props.mxEvent.getRoomId(),
        metricsTrigger: undefined // room doesn't change

      });

      this.closeMenu();
    });
    this.state = {
      canRedact: false,
      canPin: false,
      reactionPickerDisplayed: false
    };
  }

  componentDidMount() {
    _MatrixClientPeg.MatrixClientPeg.get().on(_roomMember.RoomMemberEvent.PowerLevel, this.checkPermissions);

    this.checkPermissions();
  }

  componentWillUnmount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli) {
      cli.removeListener(_roomMember.RoomMemberEvent.PowerLevel, this.checkPermissions);
    }
  }

  isPinned() {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

    const pinnedEvent = room.currentState.getStateEvents(_event2.EventType.RoomPinnedEvents, '');
    if (!pinnedEvent) return false;
    const content = pinnedEvent.getContent();
    return content.pinned && Array.isArray(content.pinned) && content.pinned.includes(this.props.mxEvent.getId());
  }

  canEndPoll(mxEvent) {
    return _matrixEventsSdk.M_POLL_START.matches(mxEvent.getType()) && this.state.canRedact && !(0, _MPollBody.isPollEnded)(mxEvent, _MatrixClientPeg.MatrixClientPeg.get(), this.props.getRelationsForEvent);
  }

  getReactions(filter) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(this.props.mxEvent.getRoomId());
    const eventId = this.props.mxEvent.getId();
    return room.getPendingEvents().filter(e => {
      const relation = e.getRelation();
      return relation?.rel_type === _event2.RelationType.Annotation && relation.event_id === eventId && filter(e);
    });
  }

  getUnsentReactions() {
    return this.getReactions(e => e.status === _event.EventStatus.NOT_SENT);
  }

  render() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const me = cli.getUserId();
    const {
      mxEvent,
      rightClick,
      link,
      eventTileOps,
      reactions,
      collapseReplyChain
    } = this.props;
    const eventStatus = mxEvent.status;
    const unsentReactionsCount = this.getUnsentReactions().length;
    const contentActionable = (0, _EventUtils.isContentActionable)(mxEvent);
    const permalink = this.props.permalinkCreator?.forEvent(this.props.mxEvent.getId()); // status is SENT before remote-echo, null after

    const isSent = !eventStatus || eventStatus === _event.EventStatus.SENT;
    const {
      timelineRenderingType,
      canReact,
      canSendMessages
    } = this.context;
    const isThread = timelineRenderingType === _RoomContext.TimelineRenderingType.Thread || timelineRenderingType === _RoomContext.TimelineRenderingType.ThreadsList;
    const isThreadRootEvent = isThread && mxEvent?.getThread()?.rootEvent === mxEvent;
    let resendReactionsButton;

    if (!mxEvent.isRedacted() && unsentReactionsCount !== 0) {
      resendReactionsButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconResend",
        label: (0, _languageHandler._t)('Resend %(unsentCount)s reaction(s)', {
          unsentCount: unsentReactionsCount
        }),
        onClick: this.onResendReactionsClick
      });
    }

    let redactButton;

    if (isSent && this.state.canRedact) {
      redactButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconRedact",
        label: (0, _languageHandler._t)("Remove"),
        onClick: this.onRedactClick
      });
    }

    let openInMapSiteButton;
    const shareableLocationEvent = (0, _getShareableLocationEvent.getShareableLocationEvent)(mxEvent, cli);

    if (shareableLocationEvent) {
      const mapSiteLink = (0, _location.createMapSiteLinkFromEvent)(shareableLocationEvent);
      openInMapSiteButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconOpenInMapSite",
        onClick: null,
        label: (0, _languageHandler._t)('Open in OpenStreetMap'),
        element: "a",
        href: mapSiteLink,
        target: "_blank",
        rel: "noreferrer noopener"
      });
    }

    let forwardButton;
    const forwardableEvent = (0, _getForwardableEvent.getForwardableEvent)(mxEvent, cli);

    if (contentActionable && forwardableEvent) {
      forwardButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconForward",
        label: (0, _languageHandler._t)("Forward"),
        onClick: this.onForwardClick(forwardableEvent)
      });
    }

    let pinButton;

    if (contentActionable && this.state.canPin) {
      pinButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconPin",
        label: this.isPinned() ? (0, _languageHandler._t)('Unpin') : (0, _languageHandler._t)('Pin'),
        onClick: this.onPinClick
      });
    } // This is specifically not behind the developerMode flag to give people insight into the Matrix


    const viewSourceButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      iconClassName: "mx_MessageContextMenu_iconSource",
      label: (0, _languageHandler._t)("View source"),
      onClick: this.onViewSourceClick
    });

    let unhidePreviewButton;

    if (eventTileOps?.isWidgetHidden()) {
      unhidePreviewButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconUnhidePreview",
        label: (0, _languageHandler._t)("Show preview"),
        onClick: this.onUnhidePreviewClick
      });
    }

    let permalinkButton;

    if (permalink) {
      permalinkButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconPermalink",
        onClick: this.onShareClick,
        label: (0, _languageHandler._t)('Share'),
        element: "a",
        href: permalink,
        target: "_blank",
        rel: "noreferrer noopener"
      });
    }

    let endPollButton;

    if (this.canEndPoll(mxEvent)) {
      endPollButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconEndPoll",
        label: (0, _languageHandler._t)("End Poll"),
        onClick: this.onEndPollClick
      });
    }

    let quoteButton;

    if (eventTileOps && canSendMessages) {
      // this event is rendered using TextualBody
      quoteButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconQuote",
        label: (0, _languageHandler._t)("Quote"),
        onClick: this.onQuoteClick
      });
    } // Bridges can provide a 'external_url' to link back to the source.


    let externalURLButton;

    if (typeof mxEvent.getContent().external_url === "string" && (0, _HtmlUtils.isUrlPermitted)(mxEvent.getContent().external_url)) {
      externalURLButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconLink",
        onClick: this.closeMenu,
        label: (0, _languageHandler._t)('Source URL'),
        element: "a",
        target: "_blank",
        rel: "noreferrer noopener",
        href: mxEvent.getContent().external_url
      });
    }

    let collapseReplyChainButton;

    if (collapseReplyChain) {
      collapseReplyChainButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconCollapse",
        label: (0, _languageHandler._t)("Collapse reply thread"),
        onClick: this.onCollapseReplyChainClick
      });
    }

    let jumpToRelatedEventButton;
    const relatedEventId = mxEvent.getWireContent()?.["m.relates_to"]?.event_id;

    if (relatedEventId && _SettingsStore.default.getValue("developerMode")) {
      jumpToRelatedEventButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_jumpToEvent",
        label: (0, _languageHandler._t)("View related event"),
        onClick: () => this.onJumpToRelatedEventClick(relatedEventId)
      });
    }

    let reportEventButton;

    if (mxEvent.getSender() !== me) {
      reportEventButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconReport",
        label: (0, _languageHandler._t)("Report"),
        onClick: this.onReportEventClick
      });
    }

    let copyLinkButton;

    if (link) {
      copyLinkButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconCopy",
        onClick: this.onCopyLinkClick,
        label: (0, _languageHandler._t)('Copy link'),
        element: "a",
        href: link,
        target: "_blank",
        rel: "noreferrer noopener"
      });
    }

    let copyButton;

    if (rightClick && (0, _strings.getSelectedText)()) {
      copyButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconCopy",
        label: (0, _languageHandler._t)("Copy"),
        triggerOnMouseDown: true // We use onMouseDown so that the selection isn't cleared when we click
        ,
        onClick: this.onCopyClick
      });
    }

    let editButton;

    if (rightClick && (0, _EventUtils.canEditContent)(mxEvent)) {
      editButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconEdit",
        label: (0, _languageHandler._t)("Edit"),
        onClick: this.onEditClick
      });
    }

    let replyButton;

    if (rightClick && contentActionable && canSendMessages) {
      replyButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconReply",
        label: (0, _languageHandler._t)("Reply"),
        onClick: this.onReplyClick
      });
    }

    let replyInThreadButton;

    if (rightClick && contentActionable && canSendMessages && _SettingsStore.default.getValue("feature_thread") && _thread.Thread.hasServerSideSupport && timelineRenderingType !== _RoomContext.TimelineRenderingType.Thread) {
      replyInThreadButton = /*#__PURE__*/_react.default.createElement(ReplyInThreadButton, {
        mxEvent: mxEvent,
        closeMenu: this.closeMenu
      });
    }

    let reactButton;

    if (rightClick && contentActionable && canReact) {
      reactButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconReact",
        label: (0, _languageHandler._t)("React"),
        onClick: this.onReactClick,
        inputRef: this.reactButtonRef
      });
    }

    let viewInRoomButton;

    if (isThreadRootEvent) {
      viewInRoomButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_MessageContextMenu_iconViewInRoom",
        label: (0, _languageHandler._t)("View in room"),
        onClick: this.viewInRoom
      });
    }

    let nativeItemsList;

    if (copyButton || copyLinkButton) {
      nativeItemsList = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, copyButton, copyLinkButton);
    }

    let quickItemsList;

    if (editButton || replyButton || reactButton) {
      quickItemsList = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, reactButton, replyButton, replyInThreadButton, editButton);
    }

    const commonItemsList = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, viewInRoomButton, openInMapSiteButton, endPollButton, quoteButton, forwardButton, pinButton, permalinkButton, reportEventButton, externalURLButton, jumpToRelatedEventButton, unhidePreviewButton, viewSourceButton, resendReactionsButton, collapseReplyChainButton);

    let redactItemList;

    if (redactButton) {
      redactItemList = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        red: true
      }, redactButton);
    }

    let reactionPicker;

    if (this.state.reactionPickerDisplayed) {
      const buttonRect = this.reactButtonRef.current?.getBoundingClientRect();
      reactionPicker = /*#__PURE__*/_react.default.createElement(_ContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.toRightOf)(buttonRect), {
        onFinished: this.closeMenu,
        managed: false
      }), /*#__PURE__*/_react.default.createElement(_ReactionPicker.default, {
        mxEvent: mxEvent,
        onFinished: this.onCloseReactionPicker,
        reactions: reactions
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, this.props, {
      className: "mx_MessageContextMenu",
      compact: true,
      "data-testid": "mx_MessageContextMenu"
    }), nativeItemsList, quickItemsList, commonItemsList, redactItemList), reactionPicker);
  }

}

exports.default = MessageContextMenu;
(0, _defineProperty2.default)(MessageContextMenu, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXBseUluVGhyZWFkQnV0dG9uIiwibXhFdmVudCIsImNsb3NlTWVudSIsImNvbnRleHQiLCJ1c2VDb250ZXh0IiwiQ2FyZENvbnRleHQiLCJyZWxhdGlvblR5cGUiLCJnZXRSZWxhdGlvbiIsInJlbF90eXBlIiwiQm9vbGVhbiIsIlJlbGF0aW9uVHlwZSIsIlRocmVhZCIsIm9uQ2xpY2siLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwic2V0SXRlbSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1VzZXJTZXR0aW5ncyIsImluaXRpYWxUYWJJZCIsIlVzZXJUYWIiLCJMYWJzIiwiZ2V0VGhyZWFkIiwiaXNUaHJlYWRSb290IiwiU2hvd1RocmVhZCIsInJvb3RFdmVudCIsImluaXRpYWxFdmVudCIsInNjcm9sbF9pbnRvX3ZpZXciLCJoaWdobGlnaHRlZCIsInB1c2giLCJpc0NhcmQiLCJfdCIsIk1lc3NhZ2VDb250ZXh0TWVudSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsImNsaSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInJvb20iLCJnZXRSb29tIiwiZ2V0Um9vbUlkIiwiY2FuUmVkYWN0IiwiY3VycmVudFN0YXRlIiwibWF5U2VuZFJlZGFjdGlvbkZvckV2ZW50IiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJnZXRUeXBlIiwiRXZlbnRUeXBlIiwiUm9vbVNlcnZlckFjbCIsIlJvb21FbmNyeXB0aW9uIiwiY2FuUGluIiwibWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQiLCJSb29tUGlubmVkRXZlbnRzIiwiY2FuUGluRXZlbnQiLCJzZXRTdGF0ZSIsInJlYWN0aW9uIiwiZ2V0VW5zZW50UmVhY3Rpb25zIiwiUmVzZW5kIiwicmVzZW5kIiwicmVsYXRlZEV2ZW50SWQiLCJyb29tX2lkIiwiZXZlbnRfaWQiLCJPcGVuUmVwb3J0RXZlbnREaWFsb2ciLCJldmVudCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiVmlld1NvdXJjZSIsIm9uQ2xvc2VEaWFsb2ciLCJjcmVhdGVSZWRhY3RFdmVudERpYWxvZyIsImZvcndhcmRhYmxlRXZlbnQiLCJPcGVuRm9yd2FyZERpYWxvZyIsInBlcm1hbGlua0NyZWF0b3IiLCJldmVudElkIiwiZ2V0SWQiLCJwaW5uZWRJZHMiLCJnZXRTdGF0ZUV2ZW50cyIsImdldENvbnRlbnQiLCJwaW5uZWQiLCJpbmNsdWRlcyIsInNwbGljZSIsImluZGV4T2YiLCJzZXRSb29tQWNjb3VudERhdGEiLCJyb29tSWQiLCJSZWFkUGluc0V2ZW50SWQiLCJldmVudF9pZHMiLCJnZXRBY2NvdW50RGF0YSIsInNlbmRTdGF0ZUV2ZW50Iiwib25GaW5pc2hlZCIsImV2ZW50VGlsZU9wcyIsInVuaGlkZVdpZGdldCIsIkNvbXBvc2VySW5zZXJ0IiwidGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiZSIsInByZXZlbnREZWZhdWx0IiwiU2hhcmVEaWFsb2ciLCJ0YXJnZXQiLCJjb3B5UGxhaW50ZXh0IiwibGluayIsImNvbGxhcHNlUmVwbHlDaGFpbiIsImdldFNlbGVjdGVkVGV4dCIsImVkaXRFdmVudCIsImdldFJlbGF0aW9uc0ZvckV2ZW50IiwicmVhY3Rpb25QaWNrZXJEaXNwbGF5ZWQiLCJtYXRyaXhDbGllbnQiLCJFbmRQb2xsRGlhbG9nIiwiVmlld1Jvb20iLCJtZXRyaWNzVHJpZ2dlciIsInVuZGVmaW5lZCIsInN0YXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsIlJvb21NZW1iZXJFdmVudCIsIlBvd2VyTGV2ZWwiLCJjaGVja1Blcm1pc3Npb25zIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsImlzUGlubmVkIiwicGlubmVkRXZlbnQiLCJjb250ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiY2FuRW5kUG9sbCIsIk1fUE9MTF9TVEFSVCIsIm1hdGNoZXMiLCJpc1BvbGxFbmRlZCIsImdldFJlYWN0aW9ucyIsImZpbHRlciIsImdldFBlbmRpbmdFdmVudHMiLCJyZWxhdGlvbiIsIkFubm90YXRpb24iLCJzdGF0dXMiLCJFdmVudFN0YXR1cyIsIk5PVF9TRU5UIiwicmVuZGVyIiwibWUiLCJnZXRVc2VySWQiLCJyaWdodENsaWNrIiwicmVhY3Rpb25zIiwiZXZlbnRTdGF0dXMiLCJ1bnNlbnRSZWFjdGlvbnNDb3VudCIsImxlbmd0aCIsImNvbnRlbnRBY3Rpb25hYmxlIiwiaXNDb250ZW50QWN0aW9uYWJsZSIsInBlcm1hbGluayIsImZvckV2ZW50IiwiaXNTZW50IiwiU0VOVCIsImNhblJlYWN0IiwiY2FuU2VuZE1lc3NhZ2VzIiwiaXNUaHJlYWQiLCJUaW1lbGluZVJlbmRlcmluZ1R5cGUiLCJUaHJlYWRzTGlzdCIsImlzVGhyZWFkUm9vdEV2ZW50IiwicmVzZW5kUmVhY3Rpb25zQnV0dG9uIiwiaXNSZWRhY3RlZCIsInVuc2VudENvdW50Iiwib25SZXNlbmRSZWFjdGlvbnNDbGljayIsInJlZGFjdEJ1dHRvbiIsIm9uUmVkYWN0Q2xpY2siLCJvcGVuSW5NYXBTaXRlQnV0dG9uIiwic2hhcmVhYmxlTG9jYXRpb25FdmVudCIsImdldFNoYXJlYWJsZUxvY2F0aW9uRXZlbnQiLCJtYXBTaXRlTGluayIsImNyZWF0ZU1hcFNpdGVMaW5rRnJvbUV2ZW50IiwiaHJlZiIsInJlbCIsImZvcndhcmRCdXR0b24iLCJnZXRGb3J3YXJkYWJsZUV2ZW50Iiwib25Gb3J3YXJkQ2xpY2siLCJwaW5CdXR0b24iLCJvblBpbkNsaWNrIiwidmlld1NvdXJjZUJ1dHRvbiIsIm9uVmlld1NvdXJjZUNsaWNrIiwidW5oaWRlUHJldmlld0J1dHRvbiIsImlzV2lkZ2V0SGlkZGVuIiwib25VbmhpZGVQcmV2aWV3Q2xpY2siLCJwZXJtYWxpbmtCdXR0b24iLCJvblNoYXJlQ2xpY2siLCJlbmRQb2xsQnV0dG9uIiwib25FbmRQb2xsQ2xpY2siLCJxdW90ZUJ1dHRvbiIsIm9uUXVvdGVDbGljayIsImV4dGVybmFsVVJMQnV0dG9uIiwiZXh0ZXJuYWxfdXJsIiwiaXNVcmxQZXJtaXR0ZWQiLCJjb2xsYXBzZVJlcGx5Q2hhaW5CdXR0b24iLCJvbkNvbGxhcHNlUmVwbHlDaGFpbkNsaWNrIiwianVtcFRvUmVsYXRlZEV2ZW50QnV0dG9uIiwiZ2V0V2lyZUNvbnRlbnQiLCJvbkp1bXBUb1JlbGF0ZWRFdmVudENsaWNrIiwicmVwb3J0RXZlbnRCdXR0b24iLCJnZXRTZW5kZXIiLCJvblJlcG9ydEV2ZW50Q2xpY2siLCJjb3B5TGlua0J1dHRvbiIsIm9uQ29weUxpbmtDbGljayIsImNvcHlCdXR0b24iLCJvbkNvcHlDbGljayIsImVkaXRCdXR0b24iLCJjYW5FZGl0Q29udGVudCIsIm9uRWRpdENsaWNrIiwicmVwbHlCdXR0b24iLCJvblJlcGx5Q2xpY2siLCJyZXBseUluVGhyZWFkQnV0dG9uIiwiaGFzU2VydmVyU2lkZVN1cHBvcnQiLCJyZWFjdEJ1dHRvbiIsIm9uUmVhY3RDbGljayIsInJlYWN0QnV0dG9uUmVmIiwidmlld0luUm9vbUJ1dHRvbiIsInZpZXdJblJvb20iLCJuYXRpdmVJdGVtc0xpc3QiLCJxdWlja0l0ZW1zTGlzdCIsImNvbW1vbkl0ZW1zTGlzdCIsInJlZGFjdEl0ZW1MaXN0IiwicmVhY3Rpb25QaWNrZXIiLCJidXR0b25SZWN0IiwiY3VycmVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInRvUmlnaHRPZiIsIm9uQ2xvc2VSZWFjdGlvblBpY2tlciIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvY29udGV4dF9tZW51cy9NZXNzYWdlQ29udGV4dE1lbnUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDE1IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuQ29weXJpZ2h0IDIwMjEgLSAyMDIyIMWgaW1vbiBCcmFuZG5lciA8c2ltb24uYnJhLmFnQGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmLCB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRXZlbnRTdGF0dXMsIE1hdHJpeEV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCB7IEV2ZW50VHlwZSwgUmVsYXRpb25UeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgUmVsYXRpb25zIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3JlbGF0aW9ucyc7XG5pbXBvcnQgeyBSb29tTWVtYmVyRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyXCI7XG5pbXBvcnQgeyBNX1BPTExfU1RBUlQgfSBmcm9tIFwibWF0cml4LWV2ZW50cy1zZGtcIjtcbmltcG9ydCB7IFRocmVhZCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvdGhyZWFkXCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IFJlc2VuZCBmcm9tICcuLi8uLi8uLi9SZXNlbmQnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZSc7XG5pbXBvcnQgeyBpc1VybFBlcm1pdHRlZCB9IGZyb20gJy4uLy4uLy4uL0h0bWxVdGlscyc7XG5pbXBvcnQge1xuICAgIGNhbkVkaXRDb250ZW50LFxuICAgIGNhblBpbkV2ZW50LFxuICAgIGVkaXRFdmVudCxcbiAgICBpc0NvbnRlbnRBY3Rpb25hYmxlLFxufSBmcm9tICcuLi8uLi8uLi91dGlscy9FdmVudFV0aWxzJztcbmltcG9ydCBJY29uaXplZENvbnRleHRNZW51LCB7IEljb25pemVkQ29udGV4dE1lbnVPcHRpb24sIEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IH0gZnJvbSAnLi9JY29uaXplZENvbnRleHRNZW51JztcbmltcG9ydCB7IFJlYWRQaW5zRXZlbnRJZCB9IGZyb20gXCIuLi9yaWdodF9wYW5lbC90eXBlc1wiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgUm9vbVBlcm1hbGlua0NyZWF0b3IgfSBmcm9tICcuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3MnO1xuaW1wb3J0IHsgQnV0dG9uRXZlbnQgfSBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCB7IGNvcHlQbGFpbnRleHQsIGdldFNlbGVjdGVkVGV4dCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3N0cmluZ3MnO1xuaW1wb3J0IENvbnRleHRNZW51LCB7IHRvUmlnaHRPZiwgSVBvc2l0aW9uLCBDaGV2cm9uRmFjZSB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnUnO1xuaW1wb3J0IFJlYWN0aW9uUGlja2VyIGZyb20gJy4uL2Vtb2ppcGlja2VyL1JlYWN0aW9uUGlja2VyJztcbmltcG9ydCBWaWV3U291cmNlIGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvVmlld1NvdXJjZSc7XG5pbXBvcnQgeyBjcmVhdGVSZWRhY3RFdmVudERpYWxvZyB9IGZyb20gJy4uL2RpYWxvZ3MvQ29uZmlybVJlZGFjdERpYWxvZyc7XG5pbXBvcnQgU2hhcmVEaWFsb2cgZnJvbSAnLi4vZGlhbG9ncy9TaGFyZURpYWxvZyc7XG5pbXBvcnQgUm9vbUNvbnRleHQsIHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSAnLi4vLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHQnO1xuaW1wb3J0IHsgQ29tcG9zZXJJbnNlcnRQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvQ29tcG9zZXJJbnNlcnRQYXlsb2FkXCI7XG5pbXBvcnQgRW5kUG9sbERpYWxvZyBmcm9tICcuLi9kaWFsb2dzL0VuZFBvbGxEaWFsb2cnO1xuaW1wb3J0IHsgaXNQb2xsRW5kZWQgfSBmcm9tICcuLi9tZXNzYWdlcy9NUG9sbEJvZHknO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyBHZXRSZWxhdGlvbnNGb3JFdmVudCwgSUV2ZW50VGlsZU9wcyB9IGZyb20gXCIuLi9yb29tcy9FdmVudFRpbGVcIjtcbmltcG9ydCB7IE9wZW5Gb3J3YXJkRGlhbG9nUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL09wZW5Gb3J3YXJkRGlhbG9nUGF5bG9hZFwiO1xuaW1wb3J0IHsgT3BlblJlcG9ydEV2ZW50RGlhbG9nUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL09wZW5SZXBvcnRFdmVudERpYWxvZ1BheWxvYWRcIjtcbmltcG9ydCB7IGNyZWF0ZU1hcFNpdGVMaW5rRnJvbUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbG9jYXRpb24nO1xuaW1wb3J0IHsgZ2V0Rm9yd2FyZGFibGVFdmVudCB9IGZyb20gJy4uLy4uLy4uL2V2ZW50cy9mb3J3YXJkL2dldEZvcndhcmRhYmxlRXZlbnQnO1xuaW1wb3J0IHsgZ2V0U2hhcmVhYmxlTG9jYXRpb25FdmVudCB9IGZyb20gJy4uLy4uLy4uL2V2ZW50cy9sb2NhdGlvbi9nZXRTaGFyZWFibGVMb2NhdGlvbkV2ZW50JztcbmltcG9ydCB7IFNob3dUaHJlYWRQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvU2hvd1RocmVhZFBheWxvYWRcIjtcbmltcG9ydCB7IENhcmRDb250ZXh0IH0gZnJvbSBcIi4uL3JpZ2h0X3BhbmVsL2NvbnRleHRcIjtcbmltcG9ydCB7IFVzZXJUYWIgfSBmcm9tIFwiLi4vZGlhbG9ncy9Vc2VyVGFiXCI7XG5cbmludGVyZmFjZSBJUmVwbHlJblRocmVhZEJ1dHRvbiB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgY2xvc2VNZW51OiAoKSA9PiB2b2lkO1xufVxuXG5jb25zdCBSZXBseUluVGhyZWFkQnV0dG9uID0gKHsgbXhFdmVudCwgY2xvc2VNZW51IH06IElSZXBseUluVGhyZWFkQnV0dG9uKSA9PiB7XG4gICAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQ2FyZENvbnRleHQpO1xuICAgIGNvbnN0IHJlbGF0aW9uVHlwZSA9IG14RXZlbnQ/LmdldFJlbGF0aW9uKCk/LnJlbF90eXBlO1xuXG4gICAgLy8gQ2FuJ3QgY3JlYXRlIGEgdGhyZWFkIGZyb20gYW4gZXZlbnQgd2l0aCBhbiBleGlzdGluZyByZWxhdGlvblxuICAgIGlmIChCb29sZWFuKHJlbGF0aW9uVHlwZSkgJiYgcmVsYXRpb25UeXBlICE9PSBSZWxhdGlvblR5cGUuVGhyZWFkKSByZXR1cm47XG5cbiAgICBjb25zdCBvbkNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIWxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfc2Vlbl9mZWF0dXJlX3RocmVhZFwiKSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9zZWVuX2ZlYXR1cmVfdGhyZWFkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfdGhyZWFkXCIpKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgaW5pdGlhbFRhYklkOiBVc2VyVGFiLkxhYnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChteEV2ZW50LmdldFRocmVhZCgpICYmICFteEV2ZW50LmlzVGhyZWFkUm9vdCkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFNob3dUaHJlYWRQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uU2hvd1RocmVhZCxcbiAgICAgICAgICAgICAgICByb290RXZlbnQ6IG14RXZlbnQuZ2V0VGhyZWFkKCkucm9vdEV2ZW50LFxuICAgICAgICAgICAgICAgIGluaXRpYWxFdmVudDogbXhFdmVudCxcbiAgICAgICAgICAgICAgICBzY3JvbGxfaW50b192aWV3OiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHB1c2g6IGNvbnRleHQuaXNDYXJkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2g8U2hvd1RocmVhZFBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TaG93VGhyZWFkLFxuICAgICAgICAgICAgICAgIHJvb3RFdmVudDogbXhFdmVudCxcbiAgICAgICAgICAgICAgICBwdXNoOiBjb250ZXh0LmlzQ2FyZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uUmVwbHlJblRocmVhZFwiXG4gICAgICAgICAgICBsYWJlbD17X3QoXCJSZXBseSBpbiB0aHJlYWRcIil9XG4gICAgICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgICAvPlxuICAgICk7XG59O1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSVBvc2l0aW9uIHtcbiAgICBjaGV2cm9uRmFjZTogQ2hldnJvbkZhY2U7XG4gICAgLyogdGhlIE1hdHJpeEV2ZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgY29udGV4dCBtZW51ICovXG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgLy8gQW4gb3B0aW9uYWwgRXZlbnRUaWxlT3BzIGltcGxlbWVudGF0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gdW5oaWRlIHByZXZpZXcgd2lkZ2V0c1xuICAgIGV2ZW50VGlsZU9wcz86IElFdmVudFRpbGVPcHM7XG4gICAgLy8gQ2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIG1lbnUgaXMgZGlzbWlzc2VkXG4gICAgcGVybWFsaW5rQ3JlYXRvcj86IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuICAgIC8qIGFuIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGNsaWNrcyBjb2xsYXBzZSB0aHJlYWQsIGlmIG5vdCBwcm92aWRlZCBoaWRlIGJ1dHRvbiAqL1xuICAgIGNvbGxhcHNlUmVwbHlDaGFpbj8oKTogdm9pZDtcbiAgICAvKiBjYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgbWVudSBpcyBkaXNtaXNzZWQgKi9cbiAgICBvbkZpbmlzaGVkKCk6IHZvaWQ7XG4gICAgLy8gSWYgdGhlIG1lbnUgaXMgaW5zaWRlIGEgZGlhbG9nLCB3ZSBzb21ldGltZXMgbmVlZCB0byBjbG9zZSB0aGF0IGRpYWxvZyBhZnRlciBjbGljayAoZm9yd2FyZGluZylcbiAgICBvbkNsb3NlRGlhbG9nPygpOiB2b2lkO1xuICAgIC8vIFRydWUgaWYgdGhlIG1lbnUgaXMgYmVpbmcgdXNlZCBhcyBhIHJpZ2h0IGNsaWNrIG1lbnVcbiAgICByaWdodENsaWNrPzogYm9vbGVhbjtcbiAgICAvLyBUaGUgUmVsYXRpb25zIG1vZGVsIGZyb20gdGhlIEpTIFNESyBmb3IgcmVhY3Rpb25zIHRvIGBteEV2ZW50YFxuICAgIHJlYWN0aW9ucz86IFJlbGF0aW9ucztcbiAgICAvLyBBIHBlcm1hbGluayB0byB0aGlzIGV2ZW50IG9yIGFuIGhyZWYgb2YgYW4gYW5jaG9yIGVsZW1lbnQgdGhlIHVzZXIgaGFzIGNsaWNrZWRcbiAgICBsaW5rPzogc3RyaW5nO1xuXG4gICAgZ2V0UmVsYXRpb25zRm9yRXZlbnQ/OiBHZXRSZWxhdGlvbnNGb3JFdmVudDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgY2FuUmVkYWN0OiBib29sZWFuO1xuICAgIGNhblBpbjogYm9vbGVhbjtcbiAgICByZWFjdGlvblBpY2tlckRpc3BsYXllZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZUNvbnRleHRNZW51IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gUm9vbUNvbnRleHQ7XG4gICAgcHVibGljIGNvbnRleHQhOiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgUm9vbUNvbnRleHQ+O1xuXG4gICAgcHJpdmF0ZSByZWFjdEJ1dHRvblJlZiA9IGNyZWF0ZVJlZjxhbnk+KCk7IC8vIFhYWCBSZWYgdG8gYSBmdW5jdGlvbmFsIGNvbXBvbmVudFxuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNhblJlZGFjdDogZmFsc2UsXG4gICAgICAgICAgICBjYW5QaW46IGZhbHNlLFxuICAgICAgICAgICAgcmVhY3Rpb25QaWNrZXJEaXNwbGF5ZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFJvb21NZW1iZXJFdmVudC5Qb3dlckxldmVsLCB0aGlzLmNoZWNrUGVybWlzc2lvbnMpO1xuICAgICAgICB0aGlzLmNoZWNrUGVybWlzc2lvbnMoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaSkge1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKFJvb21NZW1iZXJFdmVudC5Qb3dlckxldmVsLCB0aGlzLmNoZWNrUGVybWlzc2lvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja1Blcm1pc3Npb25zID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuXG4gICAgICAgIC8vIFdlIGV4cGxpY2l0bHkgZGVjbGluZSB0byBzaG93IHRoZSByZWRhY3Qgb3B0aW9uIG9uIEFDTCBldmVudHMgYXMgaXQgaGFzIGEgcG90ZW50aWFsXG4gICAgICAgIC8vIHRvIG9ibGl0ZXJhdGUgdGhlIHJvb20gLSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy80MDQyXG4gICAgICAgIC8vIFNpbWlsYXJseSBmb3IgZW5jcnlwdGlvbiBldmVudHMsIHNpbmNlIHJlZGFjdGluZyB0aGVtIFwiYnJlYWtzIGV2ZXJ5dGhpbmdcIlxuICAgICAgICBjb25zdCBjYW5SZWRhY3QgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kUmVkYWN0aW9uRm9yRXZlbnQodGhpcy5wcm9wcy5teEV2ZW50LCBjbGkuY3JlZGVudGlhbHMudXNlcklkKVxuICAgICAgICAgICAgJiYgdGhpcy5wcm9wcy5teEV2ZW50LmdldFR5cGUoKSAhPT0gRXZlbnRUeXBlLlJvb21TZXJ2ZXJBY2xcbiAgICAgICAgICAgICYmIHRoaXMucHJvcHMubXhFdmVudC5nZXRUeXBlKCkgIT09IEV2ZW50VHlwZS5Sb29tRW5jcnlwdGlvbjtcblxuICAgICAgICBsZXQgY2FuUGluID0gcm9vbS5jdXJyZW50U3RhdGUubWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlJvb21QaW5uZWRFdmVudHMsIGNsaSkgJiZcbiAgICAgICAgICAgIGNhblBpbkV2ZW50KHRoaXMucHJvcHMubXhFdmVudCk7XG5cbiAgICAgICAgLy8gSEFDSzogSW50ZW50aW9uYWxseSBzYXkgd2UgY2FuJ3QgcGluIGlmIHRoZSB1c2VyIGRvZXNuJ3Qgd2FudCB0byB1c2UgdGhlIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9waW5uaW5nXCIpKSBjYW5QaW4gPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY2FuUmVkYWN0LCBjYW5QaW4gfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgaXNQaW5uZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICBjb25zdCBwaW5uZWRFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tUGlubmVkRXZlbnRzLCAnJyk7XG4gICAgICAgIGlmICghcGlubmVkRXZlbnQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHBpbm5lZEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQucGlubmVkICYmIEFycmF5LmlzQXJyYXkoY29udGVudC5waW5uZWQpICYmIGNvbnRlbnQucGlubmVkLmluY2x1ZGVzKHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbkVuZFBvbGwobXhFdmVudDogTWF0cml4RXZlbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIE1fUE9MTF9TVEFSVC5tYXRjaGVzKG14RXZlbnQuZ2V0VHlwZSgpKSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5jYW5SZWRhY3QgJiZcbiAgICAgICAgICAgICFpc1BvbGxFbmRlZChteEV2ZW50LCBNYXRyaXhDbGllbnRQZWcuZ2V0KCksIHRoaXMucHJvcHMuZ2V0UmVsYXRpb25zRm9yRXZlbnQpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlc2VuZFJlYWN0aW9uc0NsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHJlYWN0aW9uIG9mIHRoaXMuZ2V0VW5zZW50UmVhY3Rpb25zKCkpIHtcbiAgICAgICAgICAgIFJlc2VuZC5yZXNlbmQocmVhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25KdW1wVG9SZWxhdGVkRXZlbnRDbGljayA9IChyZWxhdGVkRXZlbnRJZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFwidmlld19yb29tXCIsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICBldmVudF9pZDogcmVsYXRlZEV2ZW50SWQsXG4gICAgICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXBvcnRFdmVudENsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2g8T3BlblJlcG9ydEV2ZW50RGlhbG9nUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uT3BlblJlcG9ydEV2ZW50RGlhbG9nLFxuICAgICAgICAgICAgZXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25WaWV3U291cmNlQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhWaWV3U291cmNlLCB7XG4gICAgICAgICAgICBteEV2ZW50OiB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgIH0sICdteF9EaWFsb2dfdmlld3NvdXJjZScpO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVkYWN0Q2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHsgbXhFdmVudCwgb25DbG9zZURpYWxvZyB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY3JlYXRlUmVkYWN0RXZlbnREaWFsb2coe1xuICAgICAgICAgICAgbXhFdmVudCxcbiAgICAgICAgICAgIG9uQ2xvc2VEaWFsb2csXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9yd2FyZENsaWNrID0gKGZvcndhcmRhYmxlRXZlbnQ6IE1hdHJpeEV2ZW50KSA9PiAoKTogdm9pZCA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxPcGVuRm9yd2FyZERpYWxvZ1BheWxvYWQ+KHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLk9wZW5Gb3J3YXJkRGlhbG9nLFxuICAgICAgICAgICAgZXZlbnQ6IGZvcndhcmRhYmxlRXZlbnQsXG4gICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yOiB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGluQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKTtcblxuICAgICAgICBjb25zdCBwaW5uZWRJZHMgPSByb29tPy5jdXJyZW50U3RhdGU/LmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tUGlubmVkRXZlbnRzLCBcIlwiKT8uZ2V0Q29udGVudCgpLnBpbm5lZCB8fCBbXTtcblxuICAgICAgICBpZiAocGlubmVkSWRzLmluY2x1ZGVzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICBwaW5uZWRJZHMuc3BsaWNlKHBpbm5lZElkcy5pbmRleE9mKGV2ZW50SWQpLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBpbm5lZElkcy5wdXNoKGV2ZW50SWQpO1xuICAgICAgICAgICAgY2xpLnNldFJvb21BY2NvdW50RGF0YShyb29tLnJvb21JZCwgUmVhZFBpbnNFdmVudElkLCB7XG4gICAgICAgICAgICAgICAgZXZlbnRfaWRzOiBbXG4gICAgICAgICAgICAgICAgICAgIC4uLihyb29tLmdldEFjY291bnREYXRhKFJlYWRQaW5zRXZlbnRJZCk/LmdldENvbnRlbnQoKT8uZXZlbnRfaWRzIHx8IFtdKSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRJZCxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2xpLnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSwgRXZlbnRUeXBlLlJvb21QaW5uZWRFdmVudHMsIHsgcGlubmVkOiBwaW5uZWRJZHMgfSwgXCJcIik7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2xvc2VNZW51ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVuaGlkZVByZXZpZXdDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5ldmVudFRpbGVPcHM/LnVuaGlkZVdpZGdldCgpO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUXVvdGVDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoPENvbXBvc2VySW5zZXJ0UGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uQ29tcG9zZXJJbnNlcnQsXG4gICAgICAgICAgICBldmVudDogdGhpcy5wcm9wcy5teEV2ZW50LFxuICAgICAgICAgICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlOiB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNoYXJlQ2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhTaGFyZURpYWxvZywge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yOiB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29weUxpbmtDbGljayA9IChlOiBCdXR0b25FdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIFNvIHRoYXQgd2UgZG9uJ3Qgb3BlbiB0aGUgcGVybWFsaW5rXG4gICAgICAgIGNvcHlQbGFpbnRleHQodGhpcy5wcm9wcy5saW5rKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbGxhcHNlUmVwbHlDaGFpbkNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLmNvbGxhcHNlUmVwbHlDaGFpbigpO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29weUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb3B5UGxhaW50ZXh0KGdldFNlbGVjdGVkVGV4dCgpKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVkaXRDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgZWRpdEV2ZW50KHRoaXMucHJvcHMubXhFdmVudCwgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSwgdGhpcy5wcm9wcy5nZXRSZWxhdGlvbnNGb3JFdmVudCk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXBseUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAncmVwbHlfdG9fZXZlbnQnLFxuICAgICAgICAgICAgZXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVhY3RDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlYWN0aW9uUGlja2VyRGlzcGxheWVkOiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xvc2VSZWFjdGlvblBpY2tlciA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlYWN0aW9uUGlja2VyRGlzcGxheWVkOiBmYWxzZSB9KTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVuZFBvbGxDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgbWF0cml4Q2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRW5kUG9sbERpYWxvZywge1xuICAgICAgICAgICAgbWF0cml4Q2xpZW50LFxuICAgICAgICAgICAgZXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50OiB0aGlzLnByb3BzLmdldFJlbGF0aW9uc0ZvckV2ZW50LFxuICAgICAgICB9LCAnbXhfRGlhbG9nX2VuZFBvbGwnKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRSZWFjdGlvbnMoZmlsdGVyOiAoZTogTWF0cml4RXZlbnQpID0+IGJvb2xlYW4pOiBNYXRyaXhFdmVudFtdIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20odGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpO1xuICAgICAgICByZXR1cm4gcm9vbS5nZXRQZW5kaW5nRXZlbnRzKCkuZmlsdGVyKGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBlLmdldFJlbGF0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gcmVsYXRpb24/LnJlbF90eXBlID09PSBSZWxhdGlvblR5cGUuQW5ub3RhdGlvbiAmJiByZWxhdGlvbi5ldmVudF9pZCA9PT0gZXZlbnRJZCAmJiBmaWx0ZXIoZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VW5zZW50UmVhY3Rpb25zKCk6IE1hdHJpeEV2ZW50W10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZWFjdGlvbnMoZSA9PiBlLnN0YXR1cyA9PT0gRXZlbnRTdGF0dXMuTk9UX1NFTlQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlld0luUm9vbSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICBldmVudF9pZDogdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSxcbiAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IG1lID0gY2xpLmdldFVzZXJJZCgpO1xuICAgICAgICBjb25zdCB7IG14RXZlbnQsIHJpZ2h0Q2xpY2ssIGxpbmssIGV2ZW50VGlsZU9wcywgcmVhY3Rpb25zLCBjb2xsYXBzZVJlcGx5Q2hhaW4gfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IGV2ZW50U3RhdHVzID0gbXhFdmVudC5zdGF0dXM7XG4gICAgICAgIGNvbnN0IHVuc2VudFJlYWN0aW9uc0NvdW50ID0gdGhpcy5nZXRVbnNlbnRSZWFjdGlvbnMoKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRBY3Rpb25hYmxlID0gaXNDb250ZW50QWN0aW9uYWJsZShteEV2ZW50KTtcbiAgICAgICAgY29uc3QgcGVybWFsaW5rID0gdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yPy5mb3JFdmVudCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgIC8vIHN0YXR1cyBpcyBTRU5UIGJlZm9yZSByZW1vdGUtZWNobywgbnVsbCBhZnRlclxuICAgICAgICBjb25zdCBpc1NlbnQgPSAhZXZlbnRTdGF0dXMgfHwgZXZlbnRTdGF0dXMgPT09IEV2ZW50U3RhdHVzLlNFTlQ7XG4gICAgICAgIGNvbnN0IHsgdGltZWxpbmVSZW5kZXJpbmdUeXBlLCBjYW5SZWFjdCwgY2FuU2VuZE1lc3NhZ2VzIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNvbnN0IGlzVGhyZWFkID0gKFxuICAgICAgICAgICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlID09PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkIHx8XG4gICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGUgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWRzTGlzdFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpc1RocmVhZFJvb3RFdmVudCA9IGlzVGhyZWFkICYmIG14RXZlbnQ/LmdldFRocmVhZCgpPy5yb290RXZlbnQgPT09IG14RXZlbnQ7XG5cbiAgICAgICAgbGV0IHJlc2VuZFJlYWN0aW9uc0J1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICghbXhFdmVudC5pc1JlZGFjdGVkKCkgJiYgdW5zZW50UmVhY3Rpb25zQ291bnQgIT09IDApIHtcbiAgICAgICAgICAgIHJlc2VuZFJlYWN0aW9uc0J1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ljb25SZXNlbmRcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ1Jlc2VuZCAlKHVuc2VudENvdW50KXMgcmVhY3Rpb24ocyknLCB7IHVuc2VudENvdW50OiB1bnNlbnRSZWFjdGlvbnNDb3VudCB9KX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJlc2VuZFJlYWN0aW9uc0NsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlZGFjdEJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChpc1NlbnQgJiYgdGhpcy5zdGF0ZS5jYW5SZWRhY3QpIHtcbiAgICAgICAgICAgIHJlZGFjdEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ljb25SZWRhY3RcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSZW1vdmVcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZWRhY3RDbGlja31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvcGVuSW5NYXBTaXRlQnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgY29uc3Qgc2hhcmVhYmxlTG9jYXRpb25FdmVudCA9IGdldFNoYXJlYWJsZUxvY2F0aW9uRXZlbnQobXhFdmVudCwgY2xpKTtcbiAgICAgICAgaWYgKHNoYXJlYWJsZUxvY2F0aW9uRXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcFNpdGVMaW5rID0gY3JlYXRlTWFwU2l0ZUxpbmtGcm9tRXZlbnQoc2hhcmVhYmxlTG9jYXRpb25FdmVudCk7XG4gICAgICAgICAgICBvcGVuSW5NYXBTaXRlQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfaWNvbk9wZW5Jbk1hcFNpdGVcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtudWxsfVxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ09wZW4gaW4gT3BlblN0cmVldE1hcCcpfVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50PVwiYVwiXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmOiBtYXBTaXRlTGluayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsOiBcIm5vcmVmZXJyZXIgbm9vcGVuZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZvcndhcmRCdXR0b246IEpTWC5FbGVtZW50O1xuICAgICAgICBjb25zdCBmb3J3YXJkYWJsZUV2ZW50ID0gZ2V0Rm9yd2FyZGFibGVFdmVudChteEV2ZW50LCBjbGkpO1xuICAgICAgICBpZiAoY29udGVudEFjdGlvbmFibGUgJiYgZm9yd2FyZGFibGVFdmVudCkge1xuICAgICAgICAgICAgZm9yd2FyZEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ljb25Gb3J3YXJkXCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRm9yd2FyZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkZvcndhcmRDbGljayhmb3J3YXJkYWJsZUV2ZW50KX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwaW5CdXR0b246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoY29udGVudEFjdGlvbmFibGUgJiYgdGhpcy5zdGF0ZS5jYW5QaW4pIHtcbiAgICAgICAgICAgIHBpbkJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ljb25QaW5cIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17dGhpcy5pc1Bpbm5lZCgpID8gX3QoJ1VucGluJykgOiBfdCgnUGluJyl9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25QaW5DbGlja31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaXMgc3BlY2lmaWNhbGx5IG5vdCBiZWhpbmQgdGhlIGRldmVsb3Blck1vZGUgZmxhZyB0byBnaXZlIHBlb3BsZSBpbnNpZ2h0IGludG8gdGhlIE1hdHJpeFxuICAgICAgICBjb25zdCB2aWV3U291cmNlQnV0dG9uID0gKFxuICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ljb25Tb3VyY2VcIlxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlZpZXcgc291cmNlXCIpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25WaWV3U291cmNlQ2xpY2t9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuXG4gICAgICAgIGxldCB1bmhpZGVQcmV2aWV3QnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKGV2ZW50VGlsZU9wcz8uaXNXaWRnZXRIaWRkZW4oKSkge1xuICAgICAgICAgICAgdW5oaWRlUHJldmlld0J1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ljb25VbmhpZGVQcmV2aWV3XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2hvdyBwcmV2aWV3XCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uVW5oaWRlUHJldmlld0NsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBlcm1hbGlua0J1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChwZXJtYWxpbmspIHtcbiAgICAgICAgICAgIHBlcm1hbGlua0J1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ljb25QZXJtYWxpbmtcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2hhcmVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdTaGFyZScpfVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50PVwiYVwiXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFhYWDogVHlwZXNjcmlwdCBzaWduYXR1cmUgZm9yIEFjY2Vzc2libGVCdXR0b24gZG9lc24ndCB3b3JrIHByb3Blcmx5IGZvciBub24taW5wdXRzIGxpa2UgYGFgXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZjogcGVybWFsaW5rLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogXCJfYmxhbmtcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw6IFwibm9yZWZlcnJlciBub29wZW5lclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZW5kUG9sbEJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLmNhbkVuZFBvbGwobXhFdmVudCkpIHtcbiAgICAgICAgICAgIGVuZFBvbGxCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uRW5kUG9sbFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVuZCBQb2xsXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRW5kUG9sbENsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHF1b3RlQnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKGV2ZW50VGlsZU9wcyAmJiBjYW5TZW5kTWVzc2FnZXMpIHsgLy8gdGhpcyBldmVudCBpcyByZW5kZXJlZCB1c2luZyBUZXh0dWFsQm9keVxuICAgICAgICAgICAgcXVvdGVCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uUXVvdGVcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJRdW90ZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblF1b3RlQ2xpY2t9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCcmlkZ2VzIGNhbiBwcm92aWRlIGEgJ2V4dGVybmFsX3VybCcgdG8gbGluayBiYWNrIHRvIHRoZSBzb3VyY2UuXG4gICAgICAgIGxldCBleHRlcm5hbFVSTEJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHR5cGVvZiAobXhFdmVudC5nZXRDb250ZW50KCkuZXh0ZXJuYWxfdXJsKSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICAgICAgaXNVcmxQZXJtaXR0ZWQobXhFdmVudC5nZXRDb250ZW50KCkuZXh0ZXJuYWxfdXJsKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGV4dGVybmFsVVJMQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfaWNvbkxpbmtcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdTb3VyY2UgVVJMJyl9XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJhXCJcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gWFhYOiBUeXBlc2NyaXB0IHNpZ25hdHVyZSBmb3IgQWNjZXNzaWJsZUJ1dHRvbiBkb2Vzbid0IHdvcmsgcHJvcGVybHkgZm9yIG5vbi1pbnB1dHMgbGlrZSBgYWBcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsOiBcIm5vcmVmZXJyZXIgbm9vcGVuZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmOiBteEV2ZW50LmdldENvbnRlbnQoKS5leHRlcm5hbF91cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb2xsYXBzZVJlcGx5Q2hhaW5CdXR0b246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoY29sbGFwc2VSZXBseUNoYWluKSB7XG4gICAgICAgICAgICBjb2xsYXBzZVJlcGx5Q2hhaW5CdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uQ29sbGFwc2VcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJDb2xsYXBzZSByZXBseSB0aHJlYWRcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db2xsYXBzZVJlcGx5Q2hhaW5DbGlja31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBqdW1wVG9SZWxhdGVkRXZlbnRCdXR0b246IEpTWC5FbGVtZW50O1xuICAgICAgICBjb25zdCByZWxhdGVkRXZlbnRJZCA9IG14RXZlbnQuZ2V0V2lyZUNvbnRlbnQoKT8uW1wibS5yZWxhdGVzX3RvXCJdPy5ldmVudF9pZDtcbiAgICAgICAgaWYgKHJlbGF0ZWRFdmVudElkICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJkZXZlbG9wZXJNb2RlXCIpKSB7XG4gICAgICAgICAgICBqdW1wVG9SZWxhdGVkRXZlbnRCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9qdW1wVG9FdmVudFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlZpZXcgcmVsYXRlZCBldmVudFwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5vbkp1bXBUb1JlbGF0ZWRFdmVudENsaWNrKHJlbGF0ZWRFdmVudElkKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZXBvcnRFdmVudEJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChteEV2ZW50LmdldFNlbmRlcigpICE9PSBtZSkge1xuICAgICAgICAgICAgcmVwb3J0RXZlbnRCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uUmVwb3J0XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiUmVwb3J0XCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUmVwb3J0RXZlbnRDbGlja31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb3B5TGlua0J1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgICAgICBjb3B5TGlua0J1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ljb25Db3B5XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNvcHlMaW5rQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnQ29weSBsaW5rJyl9XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJhXCJcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBYWFg6IFR5cGVzY3JpcHQgc2lnbmF0dXJlIGZvciBBY2Nlc3NpYmxlQnV0dG9uIGRvZXNuJ3Qgd29yayBwcm9wZXJseSBmb3Igbm9uLWlucHV0cyBsaWtlIGBhYFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ue1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY6IGxpbmssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbDogXCJub3JlZmVycmVyIG5vb3BlbmVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb3B5QnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHJpZ2h0Q2xpY2sgJiYgZ2V0U2VsZWN0ZWRUZXh0KCkpIHtcbiAgICAgICAgICAgIGNvcHlCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uQ29weVwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkNvcHlcIil9XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJPbk1vdXNlRG93bj17dHJ1ZX0gLy8gV2UgdXNlIG9uTW91c2VEb3duIHNvIHRoYXQgdGhlIHNlbGVjdGlvbiBpc24ndCBjbGVhcmVkIHdoZW4gd2UgY2xpY2tcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNvcHlDbGlja31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlZGl0QnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHJpZ2h0Q2xpY2sgJiYgY2FuRWRpdENvbnRlbnQobXhFdmVudCkpIHtcbiAgICAgICAgICAgIGVkaXRCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uRWRpdFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVkaXRcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FZGl0Q2xpY2t9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVwbHlCdXR0b246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAocmlnaHRDbGljayAmJiBjb250ZW50QWN0aW9uYWJsZSAmJiBjYW5TZW5kTWVzc2FnZXMpIHtcbiAgICAgICAgICAgIHJlcGx5QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfaWNvblJlcGx5XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiUmVwbHlcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZXBseUNsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlcGx5SW5UaHJlYWRCdXR0b246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICByaWdodENsaWNrICYmXG4gICAgICAgICAgICBjb250ZW50QWN0aW9uYWJsZSAmJlxuICAgICAgICAgICAgY2FuU2VuZE1lc3NhZ2VzICYmXG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIikgJiZcbiAgICAgICAgICAgIFRocmVhZC5oYXNTZXJ2ZXJTaWRlU3VwcG9ydCAmJlxuICAgICAgICAgICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmVwbHlJblRocmVhZEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8UmVwbHlJblRocmVhZEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXtteEV2ZW50fVxuICAgICAgICAgICAgICAgICAgICBjbG9zZU1lbnU9e3RoaXMuY2xvc2VNZW51fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlYWN0QnV0dG9uO1xuICAgICAgICBpZiAocmlnaHRDbGljayAmJiBjb250ZW50QWN0aW9uYWJsZSAmJiBjYW5SZWFjdCkge1xuICAgICAgICAgICAgcmVhY3RCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uUmVhY3RcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSZWFjdFwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJlYWN0Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLnJlYWN0QnV0dG9uUmVmfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHZpZXdJblJvb21CdXR0b246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoaXNUaHJlYWRSb290RXZlbnQpIHtcbiAgICAgICAgICAgIHZpZXdJblJvb21CdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9pY29uVmlld0luUm9vbVwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlZpZXcgaW4gcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy52aWV3SW5Sb29tfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5hdGl2ZUl0ZW1zTGlzdDogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChjb3B5QnV0dG9uIHx8IGNvcHlMaW5rQnV0dG9uKSB7XG4gICAgICAgICAgICBuYXRpdmVJdGVtc0xpc3QgPSAoXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgICAgICB7IGNvcHlCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICB7IGNvcHlMaW5rQnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBxdWlja0l0ZW1zTGlzdDogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChlZGl0QnV0dG9uIHx8IHJlcGx5QnV0dG9uIHx8IHJlYWN0QnV0dG9uKSB7XG4gICAgICAgICAgICBxdWlja0l0ZW1zTGlzdCA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgICAgIHsgcmVhY3RCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICB7IHJlcGx5QnV0dG9uIH1cbiAgICAgICAgICAgICAgICAgICAgeyByZXBseUluVGhyZWFkQnV0dG9uIH1cbiAgICAgICAgICAgICAgICAgICAgeyBlZGl0QnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbW1vbkl0ZW1zTGlzdCA9IChcbiAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICAgICB7IHZpZXdJblJvb21CdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgb3BlbkluTWFwU2l0ZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBlbmRQb2xsQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHF1b3RlQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IGZvcndhcmRCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgcGluQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHBlcm1hbGlua0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyByZXBvcnRFdmVudEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBleHRlcm5hbFVSTEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBqdW1wVG9SZWxhdGVkRXZlbnRCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgdW5oaWRlUHJldmlld0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyB2aWV3U291cmNlQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHJlc2VuZFJlYWN0aW9uc0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBjb2xsYXBzZVJlcGx5Q2hhaW5CdXR0b24gfVxuICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgcmVkYWN0SXRlbUxpc3Q6IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAocmVkYWN0QnV0dG9uKSB7XG4gICAgICAgICAgICByZWRhY3RJdGVtTGlzdCA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgcmVkPlxuICAgICAgICAgICAgICAgICAgICB7IHJlZGFjdEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVhY3Rpb25QaWNrZXI6IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWFjdGlvblBpY2tlckRpc3BsYXllZCkge1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uUmVjdCA9ICh0aGlzLnJlYWN0QnV0dG9uUmVmLmN1cnJlbnQgYXMgSFRNTEVsZW1lbnQpPy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHJlYWN0aW9uUGlja2VyID0gKFxuICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICB7Li4udG9SaWdodE9mKGJ1dHRvblJlY3QpfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLmNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICAgICAgbWFuYWdlZD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8UmVhY3Rpb25QaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e214RXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uQ2xvc2VSZWFjdGlvblBpY2tlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWN0aW9ucz17cmVhY3Rpb25zfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvQ29udGV4dE1lbnU+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51XCJcbiAgICAgICAgICAgICAgICAgICAgY29tcGFjdD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgZGF0YS10ZXN0aWQ9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBuYXRpdmVJdGVtc0xpc3QgfVxuICAgICAgICAgICAgICAgICAgICB7IHF1aWNrSXRlbXNMaXN0IH1cbiAgICAgICAgICAgICAgICAgICAgeyBjb21tb25JdGVtc0xpc3QgfVxuICAgICAgICAgICAgICAgICAgICB7IHJlZGFjdEl0ZW1MaXN0IH1cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+XG4gICAgICAgICAgICAgICAgeyByZWFjdGlvblBpY2tlciB9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUtBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7QUEvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNEQSxNQUFNQSxtQkFBbUIsR0FBRyxRQUFrRDtFQUFBLElBQWpEO0lBQUVDLE9BQUY7SUFBV0M7RUFBWCxDQUFpRDtFQUMxRSxNQUFNQyxPQUFPLEdBQUcsSUFBQUMsaUJB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