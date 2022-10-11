"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/models/event");

var _classnames = _interopRequireDefault(require("classnames"));

var _event2 = require("matrix-js-sdk/src/@types/event");

var _thread = require("matrix-js-sdk/src/models/thread");

var _beacon = require("matrix-js-sdk/src/@types/beacon");

var _contextMenu = require("../../../../res/img/element-icons/context-menu.svg");

var _edit = require("../../../../res/img/element-icons/room/message-bar/edit.svg");

var _emoji = require("../../../../res/img/element-icons/room/message-bar/emoji.svg");

var _retry = require("../../../../res/img/element-icons/retry.svg");

var _thread2 = require("../../../../res/img/element-icons/message/thread.svg");

var _trashcan = require("../../../../res/img/element-icons/trashcan.svg");

var _star = require("../../../../res/img/element-icons/room/message-bar/star.svg");

var _reply = require("../../../../res/img/element-icons/room/message-bar/reply.svg");

var _expandMessage = require("../../../../res/img/element-icons/expand-message.svg");

var _collapseMessage = require("../../../../res/img/element-icons/collapse-message.svg");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireWildcard(require("../../../dispatcher/dispatcher"));

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _EventUtils = require("../../../utils/EventUtils");

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _Toolbar = _interopRequireDefault(require("../../../accessibility/Toolbar"));

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _MessageContextMenu = _interopRequireDefault(require("../context_menus/MessageContextMenu"));

var _Resend = _interopRequireDefault(require("../../../Resend"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _MediaEventHelper = require("../../../utils/MediaEventHelper");

var _DownloadActionButton = _interopRequireDefault(require("./DownloadActionButton"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _ReactionPicker = _interopRequireDefault(require("../emojipicker/ReactionPicker"));

var _context = require("../right_panel/context");

var _Reply = require("../../../utils/Reply");

var _Keyboard = require("../../../Keyboard");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _UserTab = require("../dialogs/UserTab");

var _actions = require("../../../dispatcher/actions");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _useFavouriteMessages = _interopRequireDefault(require("../../../hooks/useFavouriteMessages"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const OptionsButton = _ref => {
  let {
    mxEvent,
    getTile,
    getReplyChain,
    permalinkCreator,
    onFocusChange,
    getRelationsForEvent
  } = _ref;
  const [menuDisplayed, button, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  const [onFocus, isActive, ref] = (0, _RovingTabIndex.useRovingTabIndex)(button);
  (0, _react.useEffect)(() => {
    onFocusChange(menuDisplayed);
  }, [onFocusChange, menuDisplayed]);
  const onOptionsClick = (0, _react.useCallback)(e => {
    // Don't open the regular browser or our context menu on right-click
    e.preventDefault();
    e.stopPropagation();
    openMenu(); // when the context menu is opened directly, e.g. via mouse click, the onFocus handler which tracks
    // the element that is currently focused is skipped. So we want to call onFocus manually to keep the
    // position in the page even when someone is clicking around.

    onFocus();
  }, [openMenu, onFocus]);
  let contextMenu;

  if (menuDisplayed) {
    const tile = getTile && getTile();
    const replyChain = getReplyChain && getReplyChain();
    const buttonRect = button.current.getBoundingClientRect();
    contextMenu = /*#__PURE__*/_react.default.createElement(_MessageContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.aboveLeftOf)(buttonRect), {
      mxEvent: mxEvent,
      permalinkCreator: permalinkCreator,
      eventTileOps: tile && tile.getEventTileOps ? tile.getEventTileOps() : undefined,
      collapseReplyChain: replyChain && replyChain.canCollapse() ? replyChain.collapse : undefined,
      onFinished: closeMenu,
      getRelationsForEvent: getRelationsForEvent
    }));
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
    className: "mx_MessageActionBar_iconButton mx_MessageActionBar_optionsButton",
    title: (0, _languageHandler._t)("Options"),
    onClick: onOptionsClick,
    onContextMenu: onOptionsClick,
    isExpanded: menuDisplayed,
    inputRef: ref,
    onFocus: onFocus,
    tabIndex: isActive ? 0 : -1
  }, /*#__PURE__*/_react.default.createElement(_contextMenu.Icon, null)), contextMenu);
};

const ReactButton = _ref2 => {
  let {
    mxEvent,
    reactions,
    onFocusChange
  } = _ref2;
  const [menuDisplayed, button, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  const [onFocus, isActive, ref] = (0, _RovingTabIndex.useRovingTabIndex)(button);
  (0, _react.useEffect)(() => {
    onFocusChange(menuDisplayed);
  }, [onFocusChange, menuDisplayed]);
  let contextMenu;

  if (menuDisplayed) {
    const buttonRect = button.current.getBoundingClientRect();
    contextMenu = /*#__PURE__*/_react.default.createElement(_ContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.aboveLeftOf)(buttonRect), {
      onFinished: closeMenu,
      managed: false
    }), /*#__PURE__*/_react.default.createElement(_ReactionPicker.default, {
      mxEvent: mxEvent,
      reactions: reactions,
      onFinished: closeMenu
    }));
  }

  const onClick = (0, _react.useCallback)(e => {
    // Don't open the regular browser or our context menu on right-click
    e.preventDefault();
    e.stopPropagation();
    openMenu(); // when the context menu is opened directly, e.g. via mouse click, the onFocus handler which tracks
    // the element that is currently focused is skipped. So we want to call onFocus manually to keep the
    // position in the page even when someone is clicking around.

    onFocus();
  }, [openMenu, onFocus]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
    className: "mx_MessageActionBar_iconButton",
    title: (0, _languageHandler._t)("React"),
    onClick: onClick,
    onContextMenu: onClick,
    isExpanded: menuDisplayed,
    inputRef: ref,
    onFocus: onFocus,
    tabIndex: isActive ? 0 : -1
  }, /*#__PURE__*/_react.default.createElement(_emoji.Icon, null)), contextMenu);
};

const ReplyInThreadButton = _ref3 => {
  let {
    mxEvent
  } = _ref3;
  const context = (0, _react.useContext)(_context.CardContext);
  const relationType = mxEvent?.getRelation()?.rel_type;
  const hasARelation = !!relationType && relationType !== _event2.RelationType.Thread;
  const firstTimeSeeingThreads = !localStorage.getItem("mx_seen_feature_thread");

  const threadsEnabled = _SettingsStore.default.getValue("feature_thread");

  if (!threadsEnabled && !_thread.Thread.hasServerSideSupport) {
    // hide the prompt if the user would only have degraded mode
    return null;
  }

  const onClick = e => {
    // Don't open the regular browser or our context menu on right-click
    e.preventDefault();
    e.stopPropagation();

    if (firstTimeSeeingThreads) {
      localStorage.setItem("mx_seen_feature_thread", "true");
    }

    if (!_SettingsStore.default.getValue("feature_thread")) {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewUserSettings,
        initialTabId: _UserTab.UserTab.Labs
      });
    } else if (mxEvent.getThread() && !mxEvent.isThreadRoot) {
      _dispatcher.defaultDispatcher.dispatch({
        action: _actions.Action.ShowThread,
        rootEvent: mxEvent.getThread().rootEvent,
        initialEvent: mxEvent,
        scroll_into_view: true,
        highlighted: true,
        push: context.isCard
      });
    } else {
      _dispatcher.defaultDispatcher.dispatch({
        action: _actions.Action.ShowThread,
        rootEvent: mxEvent,
        push: context.isCard
      });
    }
  };

  return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
    className: "mx_MessageActionBar_iconButton mx_MessageActionBar_threadButton",
    disabled: hasARelation,
    tooltip: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Tooltip_title"
    }, !hasARelation ? (0, _languageHandler._t)("Reply in thread") : (0, _languageHandler._t)("Can't create a thread from an event with an existing relation")), !hasARelation && /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Tooltip_sub"
    }, _SettingsStore.default.getValue("feature_thread") ? (0, _languageHandler._t)("Beta feature") : (0, _languageHandler._t)("Beta feature. Click to learn more."))),
    title: !hasARelation ? (0, _languageHandler._t)("Reply in thread") : (0, _languageHandler._t)("Can't create a thread from an event with an existing relation"),
    onClick: onClick,
    onContextMenu: onClick
  }, /*#__PURE__*/_react.default.createElement(_thread2.Icon, null), firstTimeSeeingThreads && !threadsEnabled && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Indicator"
  }));
};

const FavouriteButton = _ref4 => {
  let {
    mxEvent
  } = _ref4;
  const {
    isFavourite,
    toggleFavourite
  } = (0, _useFavouriteMessages.default)();
  const eventId = mxEvent.getId();
  const classes = (0, _classnames.default)("mx_MessageActionBar_iconButton mx_MessageActionBar_favouriteButton", {
    'mx_MessageActionBar_favouriteButton_fillstar': isFavourite(eventId)
  });
  const onClick = (0, _react.useCallback)(e => {
    // Don't open the regular browser or our context menu on right-click
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(eventId);
  }, [toggleFavourite, eventId]);
  return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
    className: classes,
    title: (0, _languageHandler._t)("Favourite"),
    onClick: onClick,
    onContextMenu: onClick,
    "data-testid": eventId
  }, /*#__PURE__*/_react.default.createElement(_star.Icon, null));
};

class MessageActionBar extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onDecrypted", () => {
      // When an event decrypts, it is likely to change the set of available
      // actions, so we force an update to check again.
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onBeforeRedaction", () => {
      // When an event is redacted, we can't edit it so update the available actions.
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onSent", () => {
      // When an event is sent and echoed the possible actions change.
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onFocusChange", focused => {
      this.props.onFocusChange?.(focused);
    });
    (0, _defineProperty2.default)(this, "onReplyClick", e => {
      // Don't open the regular browser or our context menu on right-click
      e.preventDefault();
      e.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'reply_to_event',
        event: this.props.mxEvent,
        context: this.context.timelineRenderingType
      });
    });
    (0, _defineProperty2.default)(this, "onEditClick", e => {
      // Don't open the regular browser or our context menu on right-click
      e.preventDefault();
      e.stopPropagation();
      (0, _EventUtils.editEvent)(this.props.mxEvent, this.context.timelineRenderingType, this.props.getRelationsForEvent);
    });
    (0, _defineProperty2.default)(this, "forbiddenThreadHeadMsgType", [_event2.MsgType.KeyVerificationRequest]);
    (0, _defineProperty2.default)(this, "onResendClick", ev => {
      // Don't open the regular browser or our context menu on right-click
      ev.preventDefault();
      ev.stopPropagation();
      this.runActionOnFailedEv(tarEv => _Resend.default.resend(tarEv));
    });
    (0, _defineProperty2.default)(this, "onCancelClick", ev => {
      this.runActionOnFailedEv(tarEv => _Resend.default.removeFromQueue(tarEv), testEv => (0, _EventUtils.canCancel)(testEv.status));
    });
  }

  componentDidMount() {
    if (this.props.mxEvent.status && this.props.mxEvent.status !== _event.EventStatus.SENT) {
      this.props.mxEvent.on(_event.MatrixEventEvent.Status, this.onSent);
    }

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    client.decryptEventIfNeeded(this.props.mxEvent);

    if (this.props.mxEvent.isBeingDecrypted()) {
      this.props.mxEvent.once(_event.MatrixEventEvent.Decrypted, this.onDecrypted);
    }

    this.props.mxEvent.on(_event.MatrixEventEvent.BeforeRedaction, this.onBeforeRedaction);
  }

  componentWillUnmount() {
    this.props.mxEvent.off(_event.MatrixEventEvent.Status, this.onSent);
    this.props.mxEvent.off(_event.MatrixEventEvent.Decrypted, this.onDecrypted);
    this.props.mxEvent.off(_event.MatrixEventEvent.BeforeRedaction, this.onBeforeRedaction);
  }

  get showReplyInThreadAction() {
    if (!_SettingsStore.default.getValue("feature_thread") && !_thread.Thread.hasServerSideSupport) {
      // hide the prompt if the user would only have degraded mode
      return null;
    }

    if (!_SettingsStore.default.getBetaInfo("feature_thread") && !_SettingsStore.default.getValue("feature_thread") && !_SdkConfig.default.get("show_labs_settings")) {
      // Hide the beta prompt if there is no UI to enable it,
      // e.g if config.json disables it and doesn't enable show labs flags
      return false;
    }

    const inNotThreadTimeline = this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Thread;
    const isAllowedMessageType = !this.forbiddenThreadHeadMsgType.includes(this.props.mxEvent.getContent().msgtype) &&
    /** forbid threads from live location shares
     * until cross-platform support
     * (PSF-1041)
     */
    !_beacon.M_BEACON_INFO.matches(this.props.mxEvent.getType());
    return inNotThreadTimeline && isAllowedMessageType;
  }
  /**
   * Runs a given fn on the set of possible events to test. The first event
   * that passes the checkFn will have fn executed on it. Both functions take
   * a MatrixEvent object. If no particular conditions are needed, checkFn can
   * be null/undefined. If no functions pass the checkFn, no action will be
   * taken.
   * @param {Function} fn The execution function.
   * @param {Function} checkFn The test function.
   */


  runActionOnFailedEv(fn, checkFn) {
    if (!checkFn) checkFn = () => true;
    const mxEvent = this.props.mxEvent;
    const editEvent = mxEvent.replacingEvent();
    const redactEvent = mxEvent.localRedactionEvent();
    const tryOrder = [redactEvent, editEvent, mxEvent];

    for (const ev of tryOrder) {
      if (ev && checkFn(ev)) {
        fn(ev);
        break;
      }
    }
  }

  render() {
    const toolbarOpts = [];

    if ((0, _EventUtils.canEditContent)(this.props.mxEvent)) {
      toolbarOpts.push( /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
        className: "mx_MessageActionBar_iconButton",
        title: (0, _languageHandler._t)("Edit"),
        onClick: this.onEditClick,
        onContextMenu: this.onEditClick,
        key: "edit"
      }, /*#__PURE__*/_react.default.createElement(_edit.Icon, null)));
    }

    const cancelSendingButton = /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
      className: "mx_MessageActionBar_iconButton",
      title: (0, _languageHandler._t)("Delete"),
      onClick: this.onCancelClick,
      onContextMenu: this.onCancelClick,
      key: "cancel"
    }, /*#__PURE__*/_react.default.createElement(_trashcan.Icon, null));

    const threadTooltipButton = /*#__PURE__*/_react.default.createElement(ReplyInThreadButton, {
      mxEvent: this.props.mxEvent,
      key: "reply_thread"
    }); // We show a different toolbar for failed events, so detect that first.


    const mxEvent = this.props.mxEvent;
    const editStatus = mxEvent.replacingEvent() && mxEvent.replacingEvent().status;
    const redactStatus = mxEvent.localRedactionEvent() && mxEvent.localRedactionEvent().status;
    const allowCancel = (0, _EventUtils.canCancel)(mxEvent.status) || (0, _EventUtils.canCancel)(editStatus) || (0, _EventUtils.canCancel)(redactStatus);
    const isFailed = [mxEvent.status, editStatus, redactStatus].includes(_event.EventStatus.NOT_SENT);

    if (allowCancel && isFailed) {
      // The resend button needs to appear ahead of the edit button, so insert to the
      // start of the opts
      toolbarOpts.splice(0, 0, /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
        className: "mx_MessageActionBar_iconButton",
        title: (0, _languageHandler._t)("Retry"),
        onClick: this.onResendClick,
        onContextMenu: this.onResendClick,
        key: "resend"
      }, /*#__PURE__*/_react.default.createElement(_retry.Icon, null))); // The delete button should appear last, so we can just drop it at the end

      toolbarOpts.push(cancelSendingButton);
    } else {
      if ((0, _EventUtils.isContentActionable)(this.props.mxEvent)) {
        // Like the resend button, the react and reply buttons need to appear before the edit.
        // The only catch is we do the reply button first so that we can make sure the react
        // button is the very first button without having to do length checks for `splice()`.
        if (this.context.canSendMessages) {
          if (this.showReplyInThreadAction) {
            toolbarOpts.splice(0, 0, threadTooltipButton);
          }

          toolbarOpts.splice(0, 0, /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
            className: "mx_MessageActionBar_iconButton",
            title: (0, _languageHandler._t)("Reply"),
            onClick: this.onReplyClick,
            onContextMenu: this.onReplyClick,
            key: "reply"
          }, /*#__PURE__*/_react.default.createElement(_reply.Icon, null)));
        }

        if (this.context.canReact) {
          toolbarOpts.splice(0, 0, /*#__PURE__*/_react.default.createElement(ReactButton, {
            mxEvent: this.props.mxEvent,
            reactions: this.props.reactions,
            onFocusChange: this.onFocusChange,
            key: "react"
          }));
        }

        if (_SettingsStore.default.getValue("feature_favourite_messages")) {
          toolbarOpts.splice(-1, 0, /*#__PURE__*/_react.default.createElement(FavouriteButton, {
            key: "favourite",
            mxEvent: this.props.mxEvent
          }));
        } // XXX: Assuming that the underlying tile will be a media event if it is eligible media.


        if (_MediaEventHelper.MediaEventHelper.isEligible(this.props.mxEvent)) {
          toolbarOpts.splice(0, 0, /*#__PURE__*/_react.default.createElement(_DownloadActionButton.default, {
            mxEvent: this.props.mxEvent,
            mediaEventHelperGet: () => this.props.getTile?.().getMediaHelper?.(),
            key: "download"
          }));
        }
      } else if (_SettingsStore.default.getValue("feature_thread") && // Show thread icon even for deleted messages, but only within main timeline
      this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Room && this.props.mxEvent.getThread()) {
        toolbarOpts.unshift(threadTooltipButton);
      }

      if (allowCancel) {
        toolbarOpts.push(cancelSendingButton);
      }

      if (this.props.isQuoteExpanded !== undefined && (0, _Reply.shouldDisplayReply)(this.props.mxEvent)) {
        const expandClassName = (0, _classnames.default)({
          'mx_MessageActionBar_iconButton': true,
          'mx_MessageActionBar_expandCollapseMessageButton': true
        });

        const tooltip = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_Tooltip_title"
        }, this.props.isQuoteExpanded ? (0, _languageHandler._t)("Collapse quotes") : (0, _languageHandler._t)("Expand quotes")), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_Tooltip_sub"
        }, (0, _languageHandler._t)(_KeyboardShortcuts.ALTERNATE_KEY_NAME[_Keyboard.Key.SHIFT]) + " + " + (0, _languageHandler._t)("Click")));

        toolbarOpts.push( /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
          className: expandClassName,
          title: this.props.isQuoteExpanded ? (0, _languageHandler._t)("Collapse quotes") : (0, _languageHandler._t)("Expand quotes"),
          tooltip: tooltip,
          onClick: this.props.toggleThreadExpanded,
          key: "expand"
        }, this.props.isQuoteExpanded ? /*#__PURE__*/_react.default.createElement(_collapseMessage.Icon, null) : /*#__PURE__*/_react.default.createElement(_expandMessage.Icon, null)));
      } // The menu button should be last, so dump it there.


      toolbarOpts.push( /*#__PURE__*/_react.default.createElement(OptionsButton, {
        mxEvent: this.props.mxEvent,
        getReplyChain: this.props.getReplyChain,
        getTile: this.props.getTile,
        permalinkCreator: this.props.permalinkCreator,
        onFocusChange: this.onFocusChange,
        key: "menu",
        getRelationsForEvent: this.props.getRelationsForEvent
      }));
    } // aria-live=off to not have this read out automatically as navigating around timeline, gets repetitive.


    return /*#__PURE__*/_react.default.createElement(_Toolbar.default, {
      className: "mx_MessageActionBar",
      "aria-label": (0, _languageHandler._t)("Message Actions"),
      "aria-live": "off"
    }, toolbarOpts);
  }

}

exports.default = MessageActionBar;
(0, _defineProperty2.default)(MessageActionBar, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPcHRpb25zQnV0dG9uIiwibXhFdmVudCIsImdldFRpbGUiLCJnZXRSZXBseUNoYWluIiwicGVybWFsaW5rQ3JlYXRvciIsIm9uRm9jdXNDaGFuZ2UiLCJnZXRSZWxhdGlvbnNGb3JFdmVudCIsIm1lbnVEaXNwbGF5ZWQiLCJidXR0b24iLCJvcGVuTWVudSIsImNsb3NlTWVudSIsInVzZUNvbnRleHRNZW51Iiwib25Gb2N1cyIsImlzQWN0aXZlIiwicmVmIiwidXNlUm92aW5nVGFiSW5kZXgiLCJ1c2VFZmZlY3QiLCJvbk9wdGlvbnNDbGljayIsInVzZUNhbGxiYWNrIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiY29udGV4dE1lbnUiLCJ0aWxlIiwicmVwbHlDaGFpbiIsImJ1dHRvblJlY3QiLCJjdXJyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiYWJvdmVMZWZ0T2YiLCJnZXRFdmVudFRpbGVPcHMiLCJ1bmRlZmluZWQiLCJjYW5Db2xsYXBzZSIsImNvbGxhcHNlIiwiX3QiLCJSZWFjdEJ1dHRvbiIsInJlYWN0aW9ucyIsIm9uQ2xpY2siLCJSZXBseUluVGhyZWFkQnV0dG9uIiwiY29udGV4dCIsInVzZUNvbnRleHQiLCJDYXJkQ29udGV4dCIsInJlbGF0aW9uVHlwZSIsImdldFJlbGF0aW9uIiwicmVsX3R5cGUiLCJoYXNBUmVsYXRpb24iLCJSZWxhdGlvblR5cGUiLCJUaHJlYWQiLCJmaXJzdFRpbWVTZWVpbmdUaHJlYWRzIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInRocmVhZHNFbmFibGVkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiaGFzU2VydmVyU2lkZVN1cHBvcnQiLCJzZXRJdGVtIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwiaW5pdGlhbFRhYklkIiwiVXNlclRhYiIsIkxhYnMiLCJnZXRUaHJlYWQiLCJpc1RocmVhZFJvb3QiLCJkZWZhdWx0RGlzcGF0Y2hlciIsIlNob3dUaHJlYWQiLCJyb290RXZlbnQiLCJpbml0aWFsRXZlbnQiLCJzY3JvbGxfaW50b192aWV3IiwiaGlnaGxpZ2h0ZWQiLCJwdXNoIiwiaXNDYXJkIiwiRmF2b3VyaXRlQnV0dG9uIiwiaXNGYXZvdXJpdGUiLCJ0b2dnbGVGYXZvdXJpdGUiLCJ1c2VGYXZvdXJpdGVNZXNzYWdlcyIsImV2ZW50SWQiLCJnZXRJZCIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwiTWVzc2FnZUFjdGlvbkJhciIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImZvcmNlVXBkYXRlIiwiZm9jdXNlZCIsInByb3BzIiwiZXZlbnQiLCJ0aW1lbGluZVJlbmRlcmluZ1R5cGUiLCJlZGl0RXZlbnQiLCJNc2dUeXBlIiwiS2V5VmVyaWZpY2F0aW9uUmVxdWVzdCIsImV2IiwicnVuQWN0aW9uT25GYWlsZWRFdiIsInRhckV2IiwiUmVzZW5kIiwicmVzZW5kIiwicmVtb3ZlRnJvbVF1ZXVlIiwidGVzdEV2IiwiY2FuQ2FuY2VsIiwic3RhdHVzIiwiY29tcG9uZW50RGlkTW91bnQiLCJFdmVudFN0YXR1cyIsIlNFTlQiLCJvbiIsIk1hdHJpeEV2ZW50RXZlbnQiLCJTdGF0dXMiLCJvblNlbnQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkZWNyeXB0RXZlbnRJZk5lZWRlZCIsImlzQmVpbmdEZWNyeXB0ZWQiLCJvbmNlIiwiRGVjcnlwdGVkIiwib25EZWNyeXB0ZWQiLCJCZWZvcmVSZWRhY3Rpb24iLCJvbkJlZm9yZVJlZGFjdGlvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwic2hvd1JlcGx5SW5UaHJlYWRBY3Rpb24iLCJnZXRCZXRhSW5mbyIsIlNka0NvbmZpZyIsImluTm90VGhyZWFkVGltZWxpbmUiLCJUaW1lbGluZVJlbmRlcmluZ1R5cGUiLCJpc0FsbG93ZWRNZXNzYWdlVHlwZSIsImZvcmJpZGRlblRocmVhZEhlYWRNc2dUeXBlIiwiaW5jbHVkZXMiLCJnZXRDb250ZW50IiwibXNndHlwZSIsIk1fQkVBQ09OX0lORk8iLCJtYXRjaGVzIiwiZ2V0VHlwZSIsImZuIiwiY2hlY2tGbiIsInJlcGxhY2luZ0V2ZW50IiwicmVkYWN0RXZlbnQiLCJsb2NhbFJlZGFjdGlvbkV2ZW50IiwidHJ5T3JkZXIiLCJyZW5kZXIiLCJ0b29sYmFyT3B0cyIsImNhbkVkaXRDb250ZW50Iiwib25FZGl0Q2xpY2siLCJjYW5jZWxTZW5kaW5nQnV0dG9uIiwib25DYW5jZWxDbGljayIsInRocmVhZFRvb2x0aXBCdXR0b24iLCJlZGl0U3RhdHVzIiwicmVkYWN0U3RhdHVzIiwiYWxsb3dDYW5jZWwiLCJpc0ZhaWxlZCIsIk5PVF9TRU5UIiwic3BsaWNlIiwib25SZXNlbmRDbGljayIsImlzQ29udGVudEFjdGlvbmFibGUiLCJjYW5TZW5kTWVzc2FnZXMiLCJvblJlcGx5Q2xpY2siLCJjYW5SZWFjdCIsIk1lZGlhRXZlbnRIZWxwZXIiLCJpc0VsaWdpYmxlIiwiZ2V0TWVkaWFIZWxwZXIiLCJSb29tIiwidW5zaGlmdCIsImlzUXVvdGVFeHBhbmRlZCIsInNob3VsZERpc3BsYXlSZXBseSIsImV4cGFuZENsYXNzTmFtZSIsInRvb2x0aXAiLCJBTFRFUk5BVEVfS0VZX05BTUUiLCJLZXkiLCJTSElGVCIsInRvZ2dsZVRocmVhZEV4cGFuZGVkIiwiUm9vbUNvbnRleHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9NZXNzYWdlQWN0aW9uQmFyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgUmVhY3RFbGVtZW50LCB1c2VDYWxsYmFjaywgdXNlQ29udGV4dCwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRXZlbnRTdGF0dXMsIE1hdHJpeEV2ZW50LCBNYXRyaXhFdmVudEV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgTXNnVHlwZSwgUmVsYXRpb25UeXBlIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50JztcbmltcG9ydCB7IFRocmVhZCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy90aHJlYWQnO1xuaW1wb3J0IHsgTV9CRUFDT05fSU5GTyB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9iZWFjb24nO1xuXG5pbXBvcnQgeyBJY29uIGFzIENvbnRleHRNZW51SWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9jb250ZXh0LW1lbnUuc3ZnJztcbmltcG9ydCB7IEljb24gYXMgRWRpdEljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvcm9vbS9tZXNzYWdlLWJhci9lZGl0LnN2Zyc7XG5pbXBvcnQgeyBJY29uIGFzIEVtb2ppSWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9yb29tL21lc3NhZ2UtYmFyL2Vtb2ppLnN2Zyc7XG5pbXBvcnQgeyBJY29uIGFzIFJlc2VuZEljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvcmV0cnkuc3ZnJztcbmltcG9ydCB7IEljb24gYXMgVGhyZWFkSWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9tZXNzYWdlL3RocmVhZC5zdmcnO1xuaW1wb3J0IHsgSWNvbiBhcyBUcmFzaGNhbkljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvdHJhc2hjYW4uc3ZnJztcbmltcG9ydCB7IEljb24gYXMgU3Rhckljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvcm9vbS9tZXNzYWdlLWJhci9zdGFyLnN2Zyc7XG5pbXBvcnQgeyBJY29uIGFzIFJlcGx5SWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9yb29tL21lc3NhZ2UtYmFyL3JlcGx5LnN2Zyc7XG5pbXBvcnQgeyBJY29uIGFzIEV4cGFuZE1lc3NhZ2VJY29uIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGVtZW50LWljb25zL2V4cGFuZC1tZXNzYWdlLnN2Zyc7XG5pbXBvcnQgeyBJY29uIGFzIENvbGxhcHNlTWVzc2FnZUljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvY29sbGFwc2UtbWVzc2FnZS5zdmcnO1xuaW1wb3J0IHR5cGUgeyBSZWxhdGlvbnMgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcmVsYXRpb25zJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBkaXMsIHsgZGVmYXVsdERpc3BhdGNoZXIgfSBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IENvbnRleHRNZW51LCB7IGFib3ZlTGVmdE9mLCBDb250ZXh0TWVudVRvb2x0aXBCdXR0b24sIHVzZUNvbnRleHRNZW51IH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudSc7XG5pbXBvcnQgeyBpc0NvbnRlbnRBY3Rpb25hYmxlLCBjYW5FZGl0Q29udGVudCwgZWRpdEV2ZW50LCBjYW5DYW5jZWwgfSBmcm9tICcuLi8uLi8uLi91dGlscy9FdmVudFV0aWxzJztcbmltcG9ydCBSb29tQ29udGV4dCwgeyBUaW1lbGluZVJlbmRlcmluZ1R5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCBUb29sYmFyIGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L1Rvb2xiYXJcIjtcbmltcG9ydCB7IFJvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uLCB1c2VSb3ZpbmdUYWJJbmRleCB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L1JvdmluZ1RhYkluZGV4XCI7XG5pbXBvcnQgTWVzc2FnZUNvbnRleHRNZW51IGZyb20gXCIuLi9jb250ZXh0X21lbnVzL01lc3NhZ2VDb250ZXh0TWVudVwiO1xuaW1wb3J0IFJlc2VuZCBmcm9tIFwiLi4vLi4vLi4vUmVzZW5kXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBNZWRpYUV2ZW50SGVscGVyIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL01lZGlhRXZlbnRIZWxwZXJcIjtcbmltcG9ydCBEb3dubG9hZEFjdGlvbkJ1dHRvbiBmcm9tIFwiLi9Eb3dubG9hZEFjdGlvbkJ1dHRvblwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZSc7XG5pbXBvcnQgeyBSb29tUGVybWFsaW5rQ3JlYXRvciB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rcyc7XG5pbXBvcnQgUmVwbHlDaGFpbiBmcm9tICcuLi9lbGVtZW50cy9SZXBseUNoYWluJztcbmltcG9ydCBSZWFjdGlvblBpY2tlciBmcm9tIFwiLi4vZW1vamlwaWNrZXIvUmVhY3Rpb25QaWNrZXJcIjtcbmltcG9ydCB7IENhcmRDb250ZXh0IH0gZnJvbSAnLi4vcmlnaHRfcGFuZWwvY29udGV4dCc7XG5pbXBvcnQgeyBzaG91bGREaXNwbGF5UmVwbHkgfSBmcm9tICcuLi8uLi8uLi91dGlscy9SZXBseSc7XG5pbXBvcnQgeyBLZXkgfSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7IEFMVEVSTkFURV9LRVlfTkFNRSB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5pbXBvcnQgeyBVc2VyVGFiIH0gZnJvbSAnLi4vZGlhbG9ncy9Vc2VyVGFiJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB7IFNob3dUaHJlYWRQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvU2hvd1RocmVhZFBheWxvYWRcIjtcbmltcG9ydCB1c2VGYXZvdXJpdGVNZXNzYWdlcyBmcm9tICcuLi8uLi8uLi9ob29rcy91c2VGYXZvdXJpdGVNZXNzYWdlcyc7XG5cbmludGVyZmFjZSBJT3B0aW9uc0J1dHRvblByb3BzIHtcbiAgICBteEV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICAvLyBUT0RPOiBUeXBlc1xuICAgIGdldFRpbGU6ICgpID0+IGFueSB8IG51bGw7XG4gICAgZ2V0UmVwbHlDaGFpbjogKCkgPT4gUmVwbHlDaGFpbjtcbiAgICBwZXJtYWxpbmtDcmVhdG9yOiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbiAgICBvbkZvY3VzQ2hhbmdlOiAobWVudURpc3BsYXllZDogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD86IChcbiAgICAgICAgZXZlbnRJZDogc3RyaW5nLFxuICAgICAgICByZWxhdGlvblR5cGU6IHN0cmluZyxcbiAgICAgICAgZXZlbnRUeXBlOiBzdHJpbmdcbiAgICApID0+IFJlbGF0aW9ucztcbn1cblxuY29uc3QgT3B0aW9uc0J1dHRvbjogUmVhY3QuRkM8SU9wdGlvbnNCdXR0b25Qcm9wcz4gPSAoe1xuICAgIG14RXZlbnQsXG4gICAgZ2V0VGlsZSxcbiAgICBnZXRSZXBseUNoYWluLFxuICAgIHBlcm1hbGlua0NyZWF0b3IsXG4gICAgb25Gb2N1c0NoYW5nZSxcbiAgICBnZXRSZWxhdGlvbnNGb3JFdmVudCxcbn0pID0+IHtcbiAgICBjb25zdCBbbWVudURpc3BsYXllZCwgYnV0dG9uLCBvcGVuTWVudSwgY2xvc2VNZW51XSA9IHVzZUNvbnRleHRNZW51KCk7XG4gICAgY29uc3QgW29uRm9jdXMsIGlzQWN0aXZlLCByZWZdID0gdXNlUm92aW5nVGFiSW5kZXgoYnV0dG9uKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBvbkZvY3VzQ2hhbmdlKG1lbnVEaXNwbGF5ZWQpO1xuICAgIH0sIFtvbkZvY3VzQ2hhbmdlLCBtZW51RGlzcGxheWVkXSk7XG5cbiAgICBjb25zdCBvbk9wdGlvbnNDbGljayA9IHVzZUNhbGxiYWNrKChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIC8vIERvbid0IG9wZW4gdGhlIHJlZ3VsYXIgYnJvd3NlciBvciBvdXIgY29udGV4dCBtZW51IG9uIHJpZ2h0LWNsaWNrXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgb3Blbk1lbnUoKTtcbiAgICAgICAgLy8gd2hlbiB0aGUgY29udGV4dCBtZW51IGlzIG9wZW5lZCBkaXJlY3RseSwgZS5nLiB2aWEgbW91c2UgY2xpY2ssIHRoZSBvbkZvY3VzIGhhbmRsZXIgd2hpY2ggdHJhY2tzXG4gICAgICAgIC8vIHRoZSBlbGVtZW50IHRoYXQgaXMgY3VycmVudGx5IGZvY3VzZWQgaXMgc2tpcHBlZC4gU28gd2Ugd2FudCB0byBjYWxsIG9uRm9jdXMgbWFudWFsbHkgdG8ga2VlcCB0aGVcbiAgICAgICAgLy8gcG9zaXRpb24gaW4gdGhlIHBhZ2UgZXZlbiB3aGVuIHNvbWVvbmUgaXMgY2xpY2tpbmcgYXJvdW5kLlxuICAgICAgICBvbkZvY3VzKCk7XG4gICAgfSwgW29wZW5NZW51LCBvbkZvY3VzXSk7XG5cbiAgICBsZXQgY29udGV4dE1lbnU6IFJlYWN0RWxlbWVudCB8IG51bGw7XG4gICAgaWYgKG1lbnVEaXNwbGF5ZWQpIHtcbiAgICAgICAgY29uc3QgdGlsZSA9IGdldFRpbGUgJiYgZ2V0VGlsZSgpO1xuICAgICAgICBjb25zdCByZXBseUNoYWluID0gZ2V0UmVwbHlDaGFpbiAmJiBnZXRSZXBseUNoYWluKCk7XG5cbiAgICAgICAgY29uc3QgYnV0dG9uUmVjdCA9IGJ1dHRvbi5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb250ZXh0TWVudSA9IDxNZXNzYWdlQ29udGV4dE1lbnVcbiAgICAgICAgICAgIHsuLi5hYm92ZUxlZnRPZihidXR0b25SZWN0KX1cbiAgICAgICAgICAgIG14RXZlbnQ9e214RXZlbnR9XG4gICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXtwZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgZXZlbnRUaWxlT3BzPXt0aWxlICYmIHRpbGUuZ2V0RXZlbnRUaWxlT3BzID8gdGlsZS5nZXRFdmVudFRpbGVPcHMoKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIGNvbGxhcHNlUmVwbHlDaGFpbj17cmVwbHlDaGFpbiAmJiByZXBseUNoYWluLmNhbkNvbGxhcHNlKCkgPyByZXBseUNoYWluLmNvbGxhcHNlIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgb25GaW5pc2hlZD17Y2xvc2VNZW51fVxuICAgICAgICAgICAgZ2V0UmVsYXRpb25zRm9yRXZlbnQ9e2dldFJlbGF0aW9uc0ZvckV2ZW50fVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZXNzYWdlQWN0aW9uQmFyX2ljb25CdXR0b24gbXhfTWVzc2FnZUFjdGlvbkJhcl9vcHRpb25zQnV0dG9uXCJcbiAgICAgICAgICAgIHRpdGxlPXtfdChcIk9wdGlvbnNcIil9XG4gICAgICAgICAgICBvbkNsaWNrPXtvbk9wdGlvbnNDbGlja31cbiAgICAgICAgICAgIG9uQ29udGV4dE1lbnU9e29uT3B0aW9uc0NsaWNrfVxuICAgICAgICAgICAgaXNFeHBhbmRlZD17bWVudURpc3BsYXllZH1cbiAgICAgICAgICAgIGlucHV0UmVmPXtyZWZ9XG4gICAgICAgICAgICBvbkZvY3VzPXtvbkZvY3VzfVxuICAgICAgICAgICAgdGFiSW5kZXg9e2lzQWN0aXZlID8gMCA6IC0xfVxuICAgICAgICA+XG4gICAgICAgICAgICA8Q29udGV4dE1lbnVJY29uIC8+XG4gICAgICAgIDwvQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uPlxuICAgICAgICB7IGNvbnRleHRNZW51IH1cbiAgICA8L1JlYWN0LkZyYWdtZW50Pjtcbn07XG5cbmludGVyZmFjZSBJUmVhY3RCdXR0b25Qcm9wcyB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgcmVhY3Rpb25zOiBSZWxhdGlvbnM7XG4gICAgb25Gb2N1c0NoYW5nZTogKG1lbnVEaXNwbGF5ZWQ6IGJvb2xlYW4pID0+IHZvaWQ7XG59XG5cbmNvbnN0IFJlYWN0QnV0dG9uOiBSZWFjdC5GQzxJUmVhY3RCdXR0b25Qcm9wcz4gPSAoeyBteEV2ZW50LCByZWFjdGlvbnMsIG9uRm9jdXNDaGFuZ2UgfSkgPT4ge1xuICAgIGNvbnN0IFttZW51RGlzcGxheWVkLCBidXR0b24sIG9wZW5NZW51LCBjbG9zZU1lbnVdID0gdXNlQ29udGV4dE1lbnUoKTtcbiAgICBjb25zdCBbb25Gb2N1cywgaXNBY3RpdmUsIHJlZl0gPSB1c2VSb3ZpbmdUYWJJbmRleChidXR0b24pO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIG9uRm9jdXNDaGFuZ2UobWVudURpc3BsYXllZCk7XG4gICAgfSwgW29uRm9jdXNDaGFuZ2UsIG1lbnVEaXNwbGF5ZWRdKTtcblxuICAgIGxldCBjb250ZXh0TWVudTtcbiAgICBpZiAobWVudURpc3BsYXllZCkge1xuICAgICAgICBjb25zdCBidXR0b25SZWN0ID0gYnV0dG9uLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnRleHRNZW51ID0gPENvbnRleHRNZW51IHsuLi5hYm92ZUxlZnRPZihidXR0b25SZWN0KX0gb25GaW5pc2hlZD17Y2xvc2VNZW51fSBtYW5hZ2VkPXtmYWxzZX0+XG4gICAgICAgICAgICA8UmVhY3Rpb25QaWNrZXIgbXhFdmVudD17bXhFdmVudH0gcmVhY3Rpb25zPXtyZWFjdGlvbnN9IG9uRmluaXNoZWQ9e2Nsb3NlTWVudX0gLz5cbiAgICAgICAgPC9Db250ZXh0TWVudT47XG4gICAgfVxuXG4gICAgY29uc3Qgb25DbGljayA9IHVzZUNhbGxiYWNrKChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIC8vIERvbid0IG9wZW4gdGhlIHJlZ3VsYXIgYnJvd3NlciBvciBvdXIgY29udGV4dCBtZW51IG9uIHJpZ2h0LWNsaWNrXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBvcGVuTWVudSgpO1xuICAgICAgICAvLyB3aGVuIHRoZSBjb250ZXh0IG1lbnUgaXMgb3BlbmVkIGRpcmVjdGx5LCBlLmcuIHZpYSBtb3VzZSBjbGljaywgdGhlIG9uRm9jdXMgaGFuZGxlciB3aGljaCB0cmFja3NcbiAgICAgICAgLy8gdGhlIGVsZW1lbnQgdGhhdCBpcyBjdXJyZW50bHkgZm9jdXNlZCBpcyBza2lwcGVkLiBTbyB3ZSB3YW50IHRvIGNhbGwgb25Gb2N1cyBtYW51YWxseSB0byBrZWVwIHRoZVxuICAgICAgICAvLyBwb3NpdGlvbiBpbiB0aGUgcGFnZSBldmVuIHdoZW4gc29tZW9uZSBpcyBjbGlja2luZyBhcm91bmQuXG4gICAgICAgIG9uRm9jdXMoKTtcbiAgICB9LCBbb3Blbk1lbnUsIG9uRm9jdXNdKTtcblxuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIDxDb250ZXh0TWVudVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXJfaWNvbkJ1dHRvblwiXG4gICAgICAgICAgICB0aXRsZT17X3QoXCJSZWFjdFwiKX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICBvbkNvbnRleHRNZW51PXtvbkNsaWNrfVxuICAgICAgICAgICAgaXNFeHBhbmRlZD17bWVudURpc3BsYXllZH1cbiAgICAgICAgICAgIGlucHV0UmVmPXtyZWZ9XG4gICAgICAgICAgICBvbkZvY3VzPXtvbkZvY3VzfVxuICAgICAgICAgICAgdGFiSW5kZXg9e2lzQWN0aXZlID8gMCA6IC0xfVxuICAgICAgICA+XG4gICAgICAgICAgICA8RW1vamlJY29uIC8+XG4gICAgICAgIDwvQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uPlxuXG4gICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xufTtcblxuaW50ZXJmYWNlIElSZXBseUluVGhyZWFkQnV0dG9uIHtcbiAgICBteEV2ZW50OiBNYXRyaXhFdmVudDtcbn1cblxuY29uc3QgUmVwbHlJblRocmVhZEJ1dHRvbiA9ICh7IG14RXZlbnQgfTogSVJlcGx5SW5UaHJlYWRCdXR0b24pID0+IHtcbiAgICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChDYXJkQ29udGV4dCk7XG5cbiAgICBjb25zdCByZWxhdGlvblR5cGUgPSBteEV2ZW50Py5nZXRSZWxhdGlvbigpPy5yZWxfdHlwZTtcbiAgICBjb25zdCBoYXNBUmVsYXRpb24gPSAhIXJlbGF0aW9uVHlwZSAmJiByZWxhdGlvblR5cGUgIT09IFJlbGF0aW9uVHlwZS5UaHJlYWQ7XG4gICAgY29uc3QgZmlyc3RUaW1lU2VlaW5nVGhyZWFkcyA9ICFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X3NlZW5fZmVhdHVyZV90aHJlYWRcIik7XG4gICAgY29uc3QgdGhyZWFkc0VuYWJsZWQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIik7XG5cbiAgICBpZiAoIXRocmVhZHNFbmFibGVkICYmICFUaHJlYWQuaGFzU2VydmVyU2lkZVN1cHBvcnQpIHtcbiAgICAgICAgLy8gaGlkZSB0aGUgcHJvbXB0IGlmIHRoZSB1c2VyIHdvdWxkIG9ubHkgaGF2ZSBkZWdyYWRlZCBtb2RlXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG9uQ2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBEb24ndCBvcGVuIHRoZSByZWd1bGFyIGJyb3dzZXIgb3Igb3VyIGNvbnRleHQgbWVudSBvbiByaWdodC1jbGlja1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgaWYgKGZpcnN0VGltZVNlZWluZ1RocmVhZHMpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfc2Vlbl9mZWF0dXJlX3RocmVhZFwiLCBcInRydWVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3RocmVhZFwiKSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3VXNlclNldHRpbmdzLFxuICAgICAgICAgICAgICAgIGluaXRpYWxUYWJJZDogVXNlclRhYi5MYWJzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAobXhFdmVudC5nZXRUaHJlYWQoKSAmJiAhbXhFdmVudC5pc1RocmVhZFJvb3QpIHtcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFNob3dUaHJlYWRQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uU2hvd1RocmVhZCxcbiAgICAgICAgICAgICAgICByb290RXZlbnQ6IG14RXZlbnQuZ2V0VGhyZWFkKCkucm9vdEV2ZW50LFxuICAgICAgICAgICAgICAgIGluaXRpYWxFdmVudDogbXhFdmVudCxcbiAgICAgICAgICAgICAgICBzY3JvbGxfaW50b192aWV3OiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHB1c2g6IGNvbnRleHQuaXNDYXJkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxTaG93VGhyZWFkUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlNob3dUaHJlYWQsXG4gICAgICAgICAgICAgICAgcm9vdEV2ZW50OiBteEV2ZW50LFxuICAgICAgICAgICAgICAgIHB1c2g6IGNvbnRleHQuaXNDYXJkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIDxSb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9XCJteF9NZXNzYWdlQWN0aW9uQmFyX2ljb25CdXR0b24gbXhfTWVzc2FnZUFjdGlvbkJhcl90aHJlYWRCdXR0b25cIlxuICAgICAgICBkaXNhYmxlZD17aGFzQVJlbGF0aW9ufVxuICAgICAgICB0b29sdGlwPXs8PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ub29sdGlwX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgeyAhaGFzQVJlbGF0aW9uXG4gICAgICAgICAgICAgICAgICAgID8gX3QoXCJSZXBseSBpbiB0aHJlYWRcIilcbiAgICAgICAgICAgICAgICAgICAgOiBfdChcIkNhbid0IGNyZWF0ZSBhIHRocmVhZCBmcm9tIGFuIGV2ZW50IHdpdGggYW4gZXhpc3RpbmcgcmVsYXRpb25cIikgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7ICFoYXNBUmVsYXRpb24gJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVG9vbHRpcF9zdWJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJCZXRhIGZlYXR1cmVcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJCZXRhIGZlYXR1cmUuIENsaWNrIHRvIGxlYXJuIG1vcmUuXCIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgfVxuICAgICAgICA8Lz59XG5cbiAgICAgICAgdGl0bGU9eyFoYXNBUmVsYXRpb25cbiAgICAgICAgICAgID8gX3QoXCJSZXBseSBpbiB0aHJlYWRcIilcbiAgICAgICAgICAgIDogX3QoXCJDYW4ndCBjcmVhdGUgYSB0aHJlYWQgZnJvbSBhbiBldmVudCB3aXRoIGFuIGV4aXN0aW5nIHJlbGF0aW9uXCIpfVxuXG4gICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgIG9uQ29udGV4dE1lbnU9e29uQ2xpY2t9XG4gICAgPlxuICAgICAgICA8VGhyZWFkSWNvbiAvPlxuICAgICAgICB7IGZpcnN0VGltZVNlZWluZ1RocmVhZHMgJiYgIXRocmVhZHNFbmFibGVkICYmIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW5kaWNhdG9yXCIgLz5cbiAgICAgICAgKSB9XG4gICAgPC9Sb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj47XG59O1xuXG5pbnRlcmZhY2UgSUZhdm91cml0ZUJ1dHRvblByb3Age1xuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xufVxuXG5jb25zdCBGYXZvdXJpdGVCdXR0b24gPSAoeyBteEV2ZW50IH06IElGYXZvdXJpdGVCdXR0b25Qcm9wKSA9PiB7XG4gICAgY29uc3QgeyBpc0Zhdm91cml0ZSwgdG9nZ2xlRmF2b3VyaXRlIH0gPSB1c2VGYXZvdXJpdGVNZXNzYWdlcygpO1xuXG4gICAgY29uc3QgZXZlbnRJZCA9IG14RXZlbnQuZ2V0SWQoKTtcbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X01lc3NhZ2VBY3Rpb25CYXJfaWNvbkJ1dHRvbiBteF9NZXNzYWdlQWN0aW9uQmFyX2Zhdm91cml0ZUJ1dHRvblwiLCB7XG4gICAgICAgICdteF9NZXNzYWdlQWN0aW9uQmFyX2Zhdm91cml0ZUJ1dHRvbl9maWxsc3Rhcic6IGlzRmF2b3VyaXRlKGV2ZW50SWQpLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25DbGljayA9IHVzZUNhbGxiYWNrKChlOiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIC8vIERvbid0IG9wZW4gdGhlIHJlZ3VsYXIgYnJvd3NlciBvciBvdXIgY29udGV4dCBtZW51IG9uIHJpZ2h0LWNsaWNrXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB0b2dnbGVGYXZvdXJpdGUoZXZlbnRJZCk7XG4gICAgfSwgW3RvZ2dsZUZhdm91cml0ZSwgZXZlbnRJZF0pO1xuXG4gICAgcmV0dXJuIDxSb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgIHRpdGxlPXtfdChcIkZhdm91cml0ZVwiKX1cbiAgICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgICAgb25Db250ZXh0TWVudT17b25DbGlja31cbiAgICAgICAgZGF0YS10ZXN0aWQ9e2V2ZW50SWR9XG4gICAgPlxuICAgICAgICA8U3Rhckljb24gLz5cbiAgICA8L1JvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPjtcbn07XG5cbmludGVyZmFjZSBJTWVzc2FnZUFjdGlvbkJhclByb3BzIHtcbiAgICBteEV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICByZWFjdGlvbnM/OiBSZWxhdGlvbnM7XG4gICAgLy8gVE9ETzogVHlwZXNcbiAgICBnZXRUaWxlOiAoKSA9PiBhbnkgfCBudWxsO1xuICAgIGdldFJlcGx5Q2hhaW46ICgpID0+IFJlcGx5Q2hhaW4gfCB1bmRlZmluZWQ7XG4gICAgcGVybWFsaW5rQ3JlYXRvcj86IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuICAgIG9uRm9jdXNDaGFuZ2U/OiAobWVudURpc3BsYXllZDogYm9vbGVhbikgPT4gdm9pZDtcbiAgICB0b2dnbGVUaHJlYWRFeHBhbmRlZDogKCkgPT4gdm9pZDtcbiAgICBpc1F1b3RlRXhwYW5kZWQ/OiBib29sZWFuO1xuICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PzogKFxuICAgICAgICBldmVudElkOiBzdHJpbmcsXG4gICAgICAgIHJlbGF0aW9uVHlwZTogUmVsYXRpb25UeXBlIHwgc3RyaW5nLFxuICAgICAgICBldmVudFR5cGU6IHN0cmluZ1xuICAgICkgPT4gUmVsYXRpb25zO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlQWN0aW9uQmFyIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJTWVzc2FnZUFjdGlvbkJhclByb3BzPiB7XG4gICAgcHVibGljIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5teEV2ZW50LnN0YXR1cyAmJiB0aGlzLnByb3BzLm14RXZlbnQuc3RhdHVzICE9PSBFdmVudFN0YXR1cy5TRU5UKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub24oTWF0cml4RXZlbnRFdmVudC5TdGF0dXMsIHRoaXMub25TZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY2xpZW50LmRlY3J5cHRFdmVudElmTmVlZGVkKHRoaXMucHJvcHMubXhFdmVudCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudC5pc0JlaW5nRGVjcnlwdGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5vbmNlKE1hdHJpeEV2ZW50RXZlbnQuRGVjcnlwdGVkLCB0aGlzLm9uRGVjcnlwdGVkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub24oTWF0cml4RXZlbnRFdmVudC5CZWZvcmVSZWRhY3Rpb24sIHRoaXMub25CZWZvcmVSZWRhY3Rpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50Lm9mZihNYXRyaXhFdmVudEV2ZW50LlN0YXR1cywgdGhpcy5vblNlbnQpO1xuICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub2ZmKE1hdHJpeEV2ZW50RXZlbnQuRGVjcnlwdGVkLCB0aGlzLm9uRGVjcnlwdGVkKTtcbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50Lm9mZihNYXRyaXhFdmVudEV2ZW50LkJlZm9yZVJlZGFjdGlvbiwgdGhpcy5vbkJlZm9yZVJlZGFjdGlvbik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRlY3J5cHRlZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgLy8gV2hlbiBhbiBldmVudCBkZWNyeXB0cywgaXQgaXMgbGlrZWx5IHRvIGNoYW5nZSB0aGUgc2V0IG9mIGF2YWlsYWJsZVxuICAgICAgICAvLyBhY3Rpb25zLCBzbyB3ZSBmb3JjZSBhbiB1cGRhdGUgdG8gY2hlY2sgYWdhaW4uXG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkJlZm9yZVJlZGFjdGlvbiA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgLy8gV2hlbiBhbiBldmVudCBpcyByZWRhY3RlZCwgd2UgY2FuJ3QgZWRpdCBpdCBzbyB1cGRhdGUgdGhlIGF2YWlsYWJsZSBhY3Rpb25zLlxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TZW50ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBXaGVuIGFuIGV2ZW50IGlzIHNlbnQgYW5kIGVjaG9lZCB0aGUgcG9zc2libGUgYWN0aW9ucyBjaGFuZ2UuXG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZvY3VzQ2hhbmdlID0gKGZvY3VzZWQ6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZvY3VzQ2hhbmdlPy4oZm9jdXNlZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXBseUNsaWNrID0gKGU6IFJlYWN0Lk1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgLy8gRG9uJ3Qgb3BlbiB0aGUgcmVndWxhciBicm93c2VyIG9yIG91ciBjb250ZXh0IG1lbnUgb24gcmlnaHQtY2xpY2tcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdyZXBseV90b19ldmVudCcsXG4gICAgICAgICAgICBldmVudDogdGhpcy5wcm9wcy5teEV2ZW50LFxuICAgICAgICAgICAgY29udGV4dDogdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FZGl0Q2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBEb24ndCBvcGVuIHRoZSByZWd1bGFyIGJyb3dzZXIgb3Igb3VyIGNvbnRleHQgbWVudSBvbiByaWdodC1jbGlja1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZWRpdEV2ZW50KHRoaXMucHJvcHMubXhFdmVudCwgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSwgdGhpcy5wcm9wcy5nZXRSZWxhdGlvbnNGb3JFdmVudCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZm9yYmlkZGVuVGhyZWFkSGVhZE1zZ1R5cGUgPSBbXG4gICAgICAgIE1zZ1R5cGUuS2V5VmVyaWZpY2F0aW9uUmVxdWVzdCxcbiAgICBdO1xuXG4gICAgcHJpdmF0ZSBnZXQgc2hvd1JlcGx5SW5UaHJlYWRBY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfdGhyZWFkXCIpICYmICFUaHJlYWQuaGFzU2VydmVyU2lkZVN1cHBvcnQpIHtcbiAgICAgICAgICAgIC8vIGhpZGUgdGhlIHByb21wdCBpZiB0aGUgdXNlciB3b3VsZCBvbmx5IGhhdmUgZGVncmFkZWQgbW9kZVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0QmV0YUluZm8oXCJmZWF0dXJlX3RocmVhZFwiKSAmJlxuICAgICAgICAgICAgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3RocmVhZFwiKSAmJlxuICAgICAgICAgICAgIVNka0NvbmZpZy5nZXQoXCJzaG93X2xhYnNfc2V0dGluZ3NcIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBIaWRlIHRoZSBiZXRhIHByb21wdCBpZiB0aGVyZSBpcyBubyBVSSB0byBlbmFibGUgaXQsXG4gICAgICAgICAgICAvLyBlLmcgaWYgY29uZmlnLmpzb24gZGlzYWJsZXMgaXQgYW5kIGRvZXNuJ3QgZW5hYmxlIHNob3cgbGFicyBmbGFnc1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW5Ob3RUaHJlYWRUaW1lbGluZSA9IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgIT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQ7XG5cbiAgICAgICAgY29uc3QgaXNBbGxvd2VkTWVzc2FnZVR5cGUgPSAoXG4gICAgICAgICAgICAhdGhpcy5mb3JiaWRkZW5UaHJlYWRIZWFkTXNnVHlwZS5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpLm1zZ3R5cGUgYXMgTXNnVHlwZSkgJiZcbiAgICAgICAgICAgIC8qKiBmb3JiaWQgdGhyZWFkcyBmcm9tIGxpdmUgbG9jYXRpb24gc2hhcmVzXG4gICAgICAgICAgICAgKiB1bnRpbCBjcm9zcy1wbGF0Zm9ybSBzdXBwb3J0XG4gICAgICAgICAgICAgKiAoUFNGLTEwNDEpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICFNX0JFQUNPTl9JTkZPLm1hdGNoZXModGhpcy5wcm9wcy5teEV2ZW50LmdldFR5cGUoKSlcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gaW5Ob3RUaHJlYWRUaW1lbGluZSAmJiBpc0FsbG93ZWRNZXNzYWdlVHlwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIGEgZ2l2ZW4gZm4gb24gdGhlIHNldCBvZiBwb3NzaWJsZSBldmVudHMgdG8gdGVzdC4gVGhlIGZpcnN0IGV2ZW50XG4gICAgICogdGhhdCBwYXNzZXMgdGhlIGNoZWNrRm4gd2lsbCBoYXZlIGZuIGV4ZWN1dGVkIG9uIGl0LiBCb3RoIGZ1bmN0aW9ucyB0YWtlXG4gICAgICogYSBNYXRyaXhFdmVudCBvYmplY3QuIElmIG5vIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbmVlZGVkLCBjaGVja0ZuIGNhblxuICAgICAqIGJlIG51bGwvdW5kZWZpbmVkLiBJZiBubyBmdW5jdGlvbnMgcGFzcyB0aGUgY2hlY2tGbiwgbm8gYWN0aW9uIHdpbGwgYmVcbiAgICAgKiB0YWtlbi5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZXhlY3V0aW9uIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNoZWNrRm4gVGhlIHRlc3QgZnVuY3Rpb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSBydW5BY3Rpb25PbkZhaWxlZEV2KGZuOiAoZXY6IE1hdHJpeEV2ZW50KSA9PiB2b2lkLCBjaGVja0ZuPzogKGV2OiBNYXRyaXhFdmVudCkgPT4gYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoIWNoZWNrRm4pIGNoZWNrRm4gPSAoKSA9PiB0cnVlO1xuXG4gICAgICAgIGNvbnN0IG14RXZlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGNvbnN0IGVkaXRFdmVudCA9IG14RXZlbnQucmVwbGFjaW5nRXZlbnQoKTtcbiAgICAgICAgY29uc3QgcmVkYWN0RXZlbnQgPSBteEV2ZW50LmxvY2FsUmVkYWN0aW9uRXZlbnQoKTtcbiAgICAgICAgY29uc3QgdHJ5T3JkZXIgPSBbcmVkYWN0RXZlbnQsIGVkaXRFdmVudCwgbXhFdmVudF07XG4gICAgICAgIGZvciAoY29uc3QgZXYgb2YgdHJ5T3JkZXIpIHtcbiAgICAgICAgICAgIGlmIChldiAmJiBjaGVja0ZuKGV2KSkge1xuICAgICAgICAgICAgICAgIGZuKGV2KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25SZXNlbmRDbGljayA9IChldjogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBEb24ndCBvcGVuIHRoZSByZWd1bGFyIGJyb3dzZXIgb3Igb3VyIGNvbnRleHQgbWVudSBvbiByaWdodC1jbGlja1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB0aGlzLnJ1bkFjdGlvbk9uRmFpbGVkRXYoKHRhckV2KSA9PiBSZXNlbmQucmVzZW5kKHRhckV2KSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DYW5jZWxDbGljayA9IChldjogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnJ1bkFjdGlvbk9uRmFpbGVkRXYoXG4gICAgICAgICAgICAodGFyRXYpID0+IFJlc2VuZC5yZW1vdmVGcm9tUXVldWUodGFyRXYpLFxuICAgICAgICAgICAgKHRlc3RFdikgPT4gY2FuQ2FuY2VsKHRlc3RFdi5zdGF0dXMpLFxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgdG9vbGJhck9wdHMgPSBbXTtcbiAgICAgICAgaWYgKGNhbkVkaXRDb250ZW50KHRoaXMucHJvcHMubXhFdmVudCkpIHtcbiAgICAgICAgICAgIHRvb2xiYXJPcHRzLnB1c2goPFJvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUFjdGlvbkJhcl9pY29uQnV0dG9uXCJcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJFZGl0XCIpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FZGl0Q2xpY2t9XG4gICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkVkaXRDbGlja31cbiAgICAgICAgICAgICAgICBrZXk9XCJlZGl0XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8RWRpdEljb24gLz5cbiAgICAgICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNhbmNlbFNlbmRpbmdCdXR0b24gPSA8Um92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXJfaWNvbkJ1dHRvblwiXG4gICAgICAgICAgICB0aXRsZT17X3QoXCJEZWxldGVcIil9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICBrZXk9XCJjYW5jZWxcIlxuICAgICAgICA+XG4gICAgICAgICAgICA8VHJhc2hjYW5JY29uIC8+XG4gICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+O1xuXG4gICAgICAgIGNvbnN0IHRocmVhZFRvb2x0aXBCdXR0b24gPSA8UmVwbHlJblRocmVhZEJ1dHRvbiBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9IGtleT1cInJlcGx5X3RocmVhZFwiIC8+O1xuXG4gICAgICAgIC8vIFdlIHNob3cgYSBkaWZmZXJlbnQgdG9vbGJhciBmb3IgZmFpbGVkIGV2ZW50cywgc28gZGV0ZWN0IHRoYXQgZmlyc3QuXG4gICAgICAgIGNvbnN0IG14RXZlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGNvbnN0IGVkaXRTdGF0dXMgPSBteEV2ZW50LnJlcGxhY2luZ0V2ZW50KCkgJiYgbXhFdmVudC5yZXBsYWNpbmdFdmVudCgpLnN0YXR1cztcbiAgICAgICAgY29uc3QgcmVkYWN0U3RhdHVzID0gbXhFdmVudC5sb2NhbFJlZGFjdGlvbkV2ZW50KCkgJiYgbXhFdmVudC5sb2NhbFJlZGFjdGlvbkV2ZW50KCkuc3RhdHVzO1xuICAgICAgICBjb25zdCBhbGxvd0NhbmNlbCA9IGNhbkNhbmNlbChteEV2ZW50LnN0YXR1cykgfHwgY2FuQ2FuY2VsKGVkaXRTdGF0dXMpIHx8IGNhbkNhbmNlbChyZWRhY3RTdGF0dXMpO1xuICAgICAgICBjb25zdCBpc0ZhaWxlZCA9IFtteEV2ZW50LnN0YXR1cywgZWRpdFN0YXR1cywgcmVkYWN0U3RhdHVzXS5pbmNsdWRlcyhFdmVudFN0YXR1cy5OT1RfU0VOVCk7XG4gICAgICAgIGlmIChhbGxvd0NhbmNlbCAmJiBpc0ZhaWxlZCkge1xuICAgICAgICAgICAgLy8gVGhlIHJlc2VuZCBidXR0b24gbmVlZHMgdG8gYXBwZWFyIGFoZWFkIG9mIHRoZSBlZGl0IGJ1dHRvbiwgc28gaW5zZXJ0IHRvIHRoZVxuICAgICAgICAgICAgLy8gc3RhcnQgb2YgdGhlIG9wdHNcbiAgICAgICAgICAgIHRvb2xiYXJPcHRzLnNwbGljZSgwLCAwLCA8Um92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZXNzYWdlQWN0aW9uQmFyX2ljb25CdXR0b25cIlxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlJldHJ5XCIpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZXNlbmRDbGlja31cbiAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uUmVzZW5kQ2xpY2t9XG4gICAgICAgICAgICAgICAga2V5PVwicmVzZW5kXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8UmVzZW5kSWNvbiAvPlxuICAgICAgICAgICAgPC9Sb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj4pO1xuXG4gICAgICAgICAgICAvLyBUaGUgZGVsZXRlIGJ1dHRvbiBzaG91bGQgYXBwZWFyIGxhc3QsIHNvIHdlIGNhbiBqdXN0IGRyb3AgaXQgYXQgdGhlIGVuZFxuICAgICAgICAgICAgdG9vbGJhck9wdHMucHVzaChjYW5jZWxTZW5kaW5nQnV0dG9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc0NvbnRlbnRBY3Rpb25hYmxlKHRoaXMucHJvcHMubXhFdmVudCkpIHtcbiAgICAgICAgICAgICAgICAvLyBMaWtlIHRoZSByZXNlbmQgYnV0dG9uLCB0aGUgcmVhY3QgYW5kIHJlcGx5IGJ1dHRvbnMgbmVlZCB0byBhcHBlYXIgYmVmb3JlIHRoZSBlZGl0LlxuICAgICAgICAgICAgICAgIC8vIFRoZSBvbmx5IGNhdGNoIGlzIHdlIGRvIHRoZSByZXBseSBidXR0b24gZmlyc3Qgc28gdGhhdCB3ZSBjYW4gbWFrZSBzdXJlIHRoZSByZWFjdFxuICAgICAgICAgICAgICAgIC8vIGJ1dHRvbiBpcyB0aGUgdmVyeSBmaXJzdCBidXR0b24gd2l0aG91dCBoYXZpbmcgdG8gZG8gbGVuZ3RoIGNoZWNrcyBmb3IgYHNwbGljZSgpYC5cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQuY2FuU2VuZE1lc3NhZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dSZXBseUluVGhyZWFkQWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sYmFyT3B0cy5zcGxpY2UoMCwgMCwgdGhyZWFkVG9vbHRpcEJ1dHRvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdG9vbGJhck9wdHMuc3BsaWNlKDAsIDAsIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxSb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXJfaWNvbkJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiUmVwbHlcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJlcGx5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vblJlcGx5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PVwicmVwbHlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxSZXBseUljb24gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0LmNhblJlYWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvb2xiYXJPcHRzLnNwbGljZSgwLCAwLCA8UmVhY3RCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWN0aW9ucz17dGhpcy5wcm9wcy5yZWFjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZvY3VzQ2hhbmdlPXt0aGlzLm9uRm9jdXNDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJyZWFjdFwiXG4gICAgICAgICAgICAgICAgICAgIC8+KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2Zhdm91cml0ZV9tZXNzYWdlc1wiKSkge1xuICAgICAgICAgICAgICAgICAgICB0b29sYmFyT3B0cy5zcGxpY2UoLTEsIDAsIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxGYXZvdXJpdGVCdXR0b24ga2V5PVwiZmF2b3VyaXRlXCIgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fSAvPlxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBYWFg6IEFzc3VtaW5nIHRoYXQgdGhlIHVuZGVybHlpbmcgdGlsZSB3aWxsIGJlIGEgbWVkaWEgZXZlbnQgaWYgaXQgaXMgZWxpZ2libGUgbWVkaWEuXG4gICAgICAgICAgICAgICAgaWYgKE1lZGlhRXZlbnRIZWxwZXIuaXNFbGlnaWJsZSh0aGlzLnByb3BzLm14RXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvb2xiYXJPcHRzLnNwbGljZSgwLCAwLCA8RG93bmxvYWRBY3Rpb25CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1lZGlhRXZlbnRIZWxwZXJHZXQ9eygpID0+IHRoaXMucHJvcHMuZ2V0VGlsZT8uKCkuZ2V0TWVkaWFIZWxwZXI/LigpfVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PVwiZG93bmxvYWRcIlxuICAgICAgICAgICAgICAgICAgICAvPik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIikgJiZcbiAgICAgICAgICAgICAgICAvLyBTaG93IHRocmVhZCBpY29uIGV2ZW4gZm9yIGRlbGV0ZWQgbWVzc2FnZXMsIGJ1dCBvbmx5IHdpdGhpbiBtYWluIHRpbWVsaW5lXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb20gJiZcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQuZ2V0VGhyZWFkKClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRvb2xiYXJPcHRzLnVuc2hpZnQodGhyZWFkVG9vbHRpcEJ1dHRvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhbGxvd0NhbmNlbCkge1xuICAgICAgICAgICAgICAgIHRvb2xiYXJPcHRzLnB1c2goY2FuY2VsU2VuZGluZ0J1dHRvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzUXVvdGVFeHBhbmRlZCAhPT0gdW5kZWZpbmVkICYmIHNob3VsZERpc3BsYXlSZXBseSh0aGlzLnByb3BzLm14RXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhwYW5kQ2xhc3NOYW1lID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgICAgICdteF9NZXNzYWdlQWN0aW9uQmFyX2ljb25CdXR0b24nOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnbXhfTWVzc2FnZUFjdGlvbkJhcl9leHBhbmRDb2xsYXBzZU1lc3NhZ2VCdXR0b24nOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb2x0aXAgPSA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5pc1F1b3RlRXhwYW5kZWQgPyBfdChcIkNvbGxhcHNlIHF1b3Rlc1wiKSA6IF90KFwiRXhwYW5kIHF1b3Rlc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfc3ViXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KEFMVEVSTkFURV9LRVlfTkFNRVtLZXkuU0hJRlRdKSArIFwiICsgXCIgKyBfdChcIkNsaWNrXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgICAgIHRvb2xiYXJPcHRzLnB1c2goPFJvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17ZXhwYW5kQ2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy5pc1F1b3RlRXhwYW5kZWQgPyBfdChcIkNvbGxhcHNlIHF1b3Rlc1wiKSA6IF90KFwiRXhwYW5kIHF1b3Rlc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD17dG9vbHRpcH1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy50b2dnbGVUaHJlYWRFeHBhbmRlZH1cbiAgICAgICAgICAgICAgICAgICAga2V5PVwiZXhwYW5kXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5pc1F1b3RlRXhwYW5kZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gPENvbGxhcHNlTWVzc2FnZUljb24gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDogPEV4cGFuZE1lc3NhZ2VJY29uIC8+XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L1JvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRoZSBtZW51IGJ1dHRvbiBzaG91bGQgYmUgbGFzdCwgc28gZHVtcCBpdCB0aGVyZS5cbiAgICAgICAgICAgIHRvb2xiYXJPcHRzLnB1c2goPE9wdGlvbnNCdXR0b25cbiAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgZ2V0UmVwbHlDaGFpbj17dGhpcy5wcm9wcy5nZXRSZXBseUNoYWlufVxuICAgICAgICAgICAgICAgIGdldFRpbGU9e3RoaXMucHJvcHMuZ2V0VGlsZX1cbiAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgb25Gb2N1c0NoYW5nZT17dGhpcy5vbkZvY3VzQ2hhbmdlfVxuICAgICAgICAgICAgICAgIGtleT1cIm1lbnVcIlxuICAgICAgICAgICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PXt0aGlzLnByb3BzLmdldFJlbGF0aW9uc0ZvckV2ZW50fVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXJpYS1saXZlPW9mZiB0byBub3QgaGF2ZSB0aGlzIHJlYWQgb3V0IGF1dG9tYXRpY2FsbHkgYXMgbmF2aWdhdGluZyBhcm91bmQgdGltZWxpbmUsIGdldHMgcmVwZXRpdGl2ZS5cbiAgICAgICAgcmV0dXJuIDxUb29sYmFyIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXJcIiBhcmlhLWxhYmVsPXtfdChcIk1lc3NhZ2UgQWN0aW9uc1wiKX0gYXJpYS1saXZlPVwib2ZmXCI+XG4gICAgICAgICAgICB7IHRvb2xiYXJPcHRzIH1cbiAgICAgICAgPC9Ub29sYmFyPjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FB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