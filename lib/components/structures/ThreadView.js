"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _thread = require("matrix-js-sdk/src/models/thread");

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _logger = require("matrix-js-sdk/src/logger");

var _BaseCard = _interopRequireDefault(require("../views/right_panel/BaseCard"));

var _RightPanelStorePhases = require("../../stores/right-panel/RightPanelStorePhases");

var _MessageComposer = _interopRequireDefault(require("../views/rooms/MessageComposer"));

var _Layout = require("../../settings/enums/Layout");

var _TimelinePanel = _interopRequireDefault(require("./TimelinePanel"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _actions = require("../../dispatcher/actions");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _EditorStateTransfer = _interopRequireDefault(require("../../utils/EditorStateTransfer"));

var _RoomContext = _interopRequireWildcard(require("../../contexts/RoomContext"));

var _ContentMessages = _interopRequireDefault(require("../../ContentMessages"));

var _UploadBar = _interopRequireDefault(require("./UploadBar"));

var _languageHandler = require("../../languageHandler");

var _ThreadListContextMenu = _interopRequireDefault(require("../views/context_menus/ThreadListContextMenu"));

var _RightPanelStore = _interopRequireDefault(require("../../stores/right-panel/RightPanelStore"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _FileDropTarget = _interopRequireDefault(require("./FileDropTarget"));

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

var _Measured = _interopRequireDefault(require("../views/elements/Measured"));

var _PosthogTrackers = _interopRequireDefault(require("../../PosthogTrackers"));

var _RoomViewStore = require("../../stores/RoomViewStore");

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _ComposerInsertPayload = require("../../dispatcher/payloads/ComposerInsertPayload");

var _Heading = _interopRequireDefault(require("../views/typography/Heading"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class ThreadView extends _react.default.Component {
  constructor(props) {
    var _this;

    super(props);
    _this = this;
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "layoutWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "timelinePanel", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "card", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.phase == _RightPanelStorePhases.RightPanelPhases.ThreadView && payload.event) {
        this.setupThread(payload.event);
      }

      switch (payload.action) {
        case _actions.Action.ComposerInsert:
          {
            if (payload.composerType) break;
            if (payload.timelineRenderingType !== _RoomContext.TimelineRenderingType.Thread) break; // re-dispatch to the correct composer

            _dispatcher.default.dispatch(_objectSpread(_objectSpread({}, payload), {}, {
              composerType: this.state.editState ? _ComposerInsertPayload.ComposerType.Edit : _ComposerInsertPayload.ComposerType.Send
            }));

            break;
          }

        case _actions.Action.EditEvent:
          // Quit early if it's not a thread context
          if (payload.timelineRenderingType !== _RoomContext.TimelineRenderingType.Thread) return; // Quit early if that's not a thread event

          if (payload.event && !payload.event.getThread()) return;
          this.setState({
            editState: payload.event ? new _EditorStateTransfer.default(payload.event) : null
          }, () => {
            if (payload.event) {
              this.timelinePanel.current?.scrollToEventIfNeeded(payload.event.getId());
            }
          });
          break;

        case 'reply_to_event':
          if (payload.context === _RoomContext.TimelineRenderingType.Thread) {
            this.setState({
              replyToEvent: payload.event
            });
          }

          break;

        default:
          break;
      }
    });
    (0, _defineProperty2.default)(this, "setupThread", mxEv => {
      let thread = this.props.room.getThread(mxEv.getId());

      if (!thread) {
        thread = this.props.room.createThread(mxEv.getId(), mxEv, [mxEv], true);
      }

      this.updateThread(thread);
    });
    (0, _defineProperty2.default)(this, "onNewThread", thread => {
      if (thread.id === this.props.mxEvent.getId()) {
        this.setupThread(this.props.mxEvent);
      }
    });
    (0, _defineProperty2.default)(this, "updateThread", thread => {
      if (thread && this.state.thread !== thread) {
        this.setState({
          thread
        }, async () => {
          thread.emit(_thread.ThreadEvent.ViewThread);
          await thread.fetchInitialEvents();
          this.nextBatch = thread.liveTimeline.getPaginationToken(_eventTimeline.Direction.Backward);
          this.timelinePanel.current?.refreshTimeline();
        });
      }
    });
    (0, _defineProperty2.default)(this, "resetJumpToEvent", event => {
      if (this.props.initialEvent && this.props.initialEventScrollIntoView && event === this.props.initialEvent?.getId()) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: this.props.room.roomId,
          event_id: this.props.initialEvent?.getId(),
          highlighted: this.props.isInitialEventHighlighted,
          scroll_into_view: false,
          replyingToEvent: this.state.replyToEvent,
          metricsTrigger: undefined // room doesn't change

        });
      }
    });
    (0, _defineProperty2.default)(this, "onMeasurement", narrow => {
      this.setState({
        narrow
      });
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      let handled = false;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.UploadFile:
          {
            _dispatcher.default.dispatch({
              action: "upload_file",
              context: _RoomContext.TimelineRenderingType.Thread
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
    (0, _defineProperty2.default)(this, "nextBatch", void 0);
    (0, _defineProperty2.default)(this, "onPaginationRequest", async function (timelineWindow) {
      let direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _eventTimeline.Direction.Backward;
      let limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;

      if (!_thread.Thread.hasServerSideSupport) {
        timelineWindow.extend(direction, limit);
        return true;
      }

      const opts = {
        limit
      };

      if (_this.nextBatch) {
        opts.from = _this.nextBatch;
      }

      const {
        nextBatch
      } = await _this.state.thread.fetchEvents(opts);
      _this.nextBatch = nextBatch; // Advances the marker on the TimelineWindow to define the correct
      // window of events to display on screen

      timelineWindow.extend(direction, limit);
      return !!nextBatch;
    });
    (0, _defineProperty2.default)(this, "onFileDrop", dataTransfer => {
      _ContentMessages.default.sharedInstance().sendContentListToRoom(Array.from(dataTransfer.files), this.props.mxEvent.getRoomId(), this.threadRelation, _MatrixClientPeg.MatrixClientPeg.get(), _RoomContext.TimelineRenderingType.Thread);
    });
    (0, _defineProperty2.default)(this, "renderThreadViewHeader", () => {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_BaseCard_header_title"
      }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
        size: "h4",
        className: "mx_BaseCard_header_title_heading"
      }, (0, _languageHandler._t)("Thread")), /*#__PURE__*/_react.default.createElement(_ThreadListContextMenu.default, {
        mxEvent: this.props.mxEvent,
        permalinkCreator: this.props.permalinkCreator
      }));
    });
    this.state = {
      layout: _SettingsStore.default.getValue("layout"),
      narrow: false
    };
    this.layoutWatcherRef = _SettingsStore.default.watchSetting("layout", null, function () {
      for (var _len = arguments.length, _ref = new Array(_len), _key = 0; _key < _len; _key++) {
        _ref[_key] = arguments[_key];
      }

      let [,,, value] = _ref;
      return _this.setState({
        layout: value
      });
    });
  }

  componentDidMount() {
    this.setupThread(this.props.mxEvent);
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

    room.on(_thread.ThreadEvent.New, this.onNewThread);
  }

  componentWillUnmount() {
    if (this.dispatcherRef) _dispatcher.default.unregister(this.dispatcherRef);
    const roomId = this.props.mxEvent.getRoomId();

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    room.removeListener(_thread.ThreadEvent.New, this.onNewThread);

    _SettingsStore.default.unwatchSetting(this.layoutWatcherRef);

    const hasRoomChanged = _RoomViewStore.RoomViewStore.instance.getRoomId() !== roomId;

    if (this.props.isInitialEventHighlighted && !hasRoomChanged) {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: this.props.room.roomId,
        metricsTrigger: undefined // room doesn't change

      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mxEvent !== this.props.mxEvent) {
      this.setupThread(this.props.mxEvent);
    }

    if (prevProps.room !== this.props.room) {
      _RightPanelStore.default.instance.setCard({
        phase: _RightPanelStorePhases.RightPanelPhases.RoomSummary
      });
    }
  }

  get threadRelation() {
    const lastThreadReply = this.state.thread?.lastReply(ev => {
      return ev.isRelation(_thread.THREAD_RELATION_TYPE.name) && !ev.status;
    });
    return {
      "rel_type": _thread.THREAD_RELATION_TYPE.name,
      "event_id": this.state.thread?.id,
      "is_falling_back": true,
      "m.in_reply_to": {
        "event_id": lastThreadReply?.getId() ?? this.state.thread?.id
      }
    };
  }

  render() {
    const highlightedEventId = this.props.isInitialEventHighlighted ? this.props.initialEvent?.getId() : null;
    const threadRelation = this.threadRelation;
    let timeline;

    if (this.state.thread) {
      if (this.props.initialEvent && this.props.initialEvent.getRoomId() !== this.state.thread.roomId) {
        _logger.logger.warn("ThreadView attempting to render TimelinePanel with mismatched initialEvent", this.state.thread.roomId, this.props.initialEvent.getRoomId(), this.props.initialEvent.getId());
      }

      timeline = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_FileDropTarget.default, {
        parent: this.card.current,
        onFileDrop: this.onFileDrop
      }), /*#__PURE__*/_react.default.createElement(_TimelinePanel.default, {
        key: this.state.thread.id,
        ref: this.timelinePanel,
        showReadReceipts: false // Hide the read receipts
        // until homeservers speak threads language
        ,
        manageReadReceipts: true,
        manageReadMarkers: true,
        sendReadReceiptOnLoad: true,
        timelineSet: this.state.thread.timelineSet,
        showUrlPreview: this.context.showUrlPreview // ThreadView doesn't support IRC layout at this time
        ,
        layout: this.state.layout === _Layout.Layout.Bubble ? _Layout.Layout.Bubble : _Layout.Layout.Group,
        hideThreadedMessages: false,
        hidden: false,
        showReactions: true,
        className: "mx_RoomView_messagePanel",
        permalinkCreator: this.props.permalinkCreator,
        membersLoaded: true,
        editState: this.state.editState,
        eventId: this.props.initialEvent?.getId(),
        highlightedEventId: highlightedEventId,
        eventScrollIntoView: this.props.initialEventScrollIntoView,
        onEventScrolledIntoView: this.resetJumpToEvent,
        onPaginationRequest: this.onPaginationRequest
      }));
    } else {
      timeline = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomView_messagePanelSpinner"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
      value: _objectSpread(_objectSpread({}, this.context), {}, {
        timelineRenderingType: _RoomContext.TimelineRenderingType.Thread,
        threadId: this.state.thread?.id,
        liveTimeline: this.state?.thread?.timelineSet?.getLiveTimeline(),
        narrow: this.state.narrow
      })
    }, /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
      className: "mx_ThreadView mx_ThreadPanel",
      onClose: this.props.onClose,
      withoutScrollContainer: true,
      header: this.renderThreadViewHeader(),
      ref: this.card,
      onKeyDown: this.onKeyDown,
      onBack: ev => {
        _PosthogTrackers.default.trackInteraction("WebThreadViewBackButton", ev);
      }
    }, /*#__PURE__*/_react.default.createElement(_Measured.default, {
      sensor: this.card.current,
      onMeasurement: this.onMeasurement
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ThreadView_timelinePanelWrapper"
    }, timeline), _ContentMessages.default.sharedInstance().getCurrentUploads(threadRelation).length > 0 && /*#__PURE__*/_react.default.createElement(_UploadBar.default, {
      room: this.props.room,
      relation: threadRelation
    }), this.state.thread?.timelineSet && /*#__PURE__*/_react.default.createElement(_MessageComposer.default, {
      room: this.props.room,
      resizeNotifier: this.props.resizeNotifier,
      relation: threadRelation,
      replyToEvent: this.state.replyToEvent,
      permalinkCreator: this.props.permalinkCreator,
      e2eStatus: this.props.e2eStatus,
      compact: true
    })));
  }

}

exports.default = ThreadView;
(0, _defineProperty2.default)(ThreadView, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaHJlYWRWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwicGF5bG9hZCIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsImV2ZW50Iiwic2V0dXBUaHJlYWQiLCJhY3Rpb24iLCJBY3Rpb24iLCJDb21wb3Nlckluc2VydCIsImNvbXBvc2VyVHlwZSIsInRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlRocmVhZCIsImRpcyIsImRpc3BhdGNoIiwic3RhdGUiLCJlZGl0U3RhdGUiLCJDb21wb3NlclR5cGUiLCJFZGl0IiwiU2VuZCIsIkVkaXRFdmVudCIsImdldFRocmVhZCIsInNldFN0YXRlIiwiRWRpdG9yU3RhdGVUcmFuc2ZlciIsInRpbWVsaW5lUGFuZWwiLCJjdXJyZW50Iiwic2Nyb2xsVG9FdmVudElmTmVlZGVkIiwiZ2V0SWQiLCJjb250ZXh0IiwicmVwbHlUb0V2ZW50IiwibXhFdiIsInRocmVhZCIsInJvb20iLCJjcmVhdGVUaHJlYWQiLCJ1cGRhdGVUaHJlYWQiLCJpZCIsIm14RXZlbnQiLCJlbWl0IiwiVGhyZWFkRXZlbnQiLCJWaWV3VGhyZWFkIiwiZmV0Y2hJbml0aWFsRXZlbnRzIiwibmV4dEJhdGNoIiwibGl2ZVRpbWVsaW5lIiwiZ2V0UGFnaW5hdGlvblRva2VuIiwiRGlyZWN0aW9uIiwiQmFja3dhcmQiLCJyZWZyZXNoVGltZWxpbmUiLCJpbml0aWFsRXZlbnQiLCJpbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldyIsIlZpZXdSb29tIiwicm9vbV9pZCIsInJvb21JZCIsImV2ZW50X2lkIiwiaGlnaGxpZ2h0ZWQiLCJpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkIiwic2Nyb2xsX2ludG9fdmlldyIsInJlcGx5aW5nVG9FdmVudCIsIm1ldHJpY3NUcmlnZ2VyIiwidW5kZWZpbmVkIiwibmFycm93IiwiZXYiLCJoYW5kbGVkIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0Um9vbUFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJVcGxvYWRGaWxlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJ0aW1lbGluZVdpbmRvdyIsImRpcmVjdGlvbiIsImxpbWl0IiwiaGFzU2VydmVyU2lkZVN1cHBvcnQiLCJleHRlbmQiLCJvcHRzIiwiZnJvbSIsImZldGNoRXZlbnRzIiwiZGF0YVRyYW5zZmVyIiwiQ29udGVudE1lc3NhZ2VzIiwic2hhcmVkSW5zdGFuY2UiLCJzZW5kQ29udGVudExpc3RUb1Jvb20iLCJBcnJheSIsImZpbGVzIiwiZ2V0Um9vbUlkIiwidGhyZWFkUmVsYXRpb24iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJfdCIsInBlcm1hbGlua0NyZWF0b3IiLCJsYXlvdXQiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJsYXlvdXRXYXRjaGVyUmVmIiwid2F0Y2hTZXR0aW5nIiwidmFsdWUiLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiZ2V0Um9vbSIsIm9uIiwiTmV3Iiwib25OZXdUaHJlYWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJyZW1vdmVMaXN0ZW5lciIsInVud2F0Y2hTZXR0aW5nIiwiaGFzUm9vbUNoYW5nZWQiLCJSb29tVmlld1N0b3JlIiwiaW5zdGFuY2UiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJSaWdodFBhbmVsU3RvcmUiLCJzZXRDYXJkIiwiUm9vbVN1bW1hcnkiLCJsYXN0VGhyZWFkUmVwbHkiLCJsYXN0UmVwbHkiLCJpc1JlbGF0aW9uIiwiVEhSRUFEX1JFTEFUSU9OX1RZUEUiLCJuYW1lIiwic3RhdHVzIiwicmVuZGVyIiwiaGlnaGxpZ2h0ZWRFdmVudElkIiwidGltZWxpbmUiLCJsb2dnZXIiLCJ3YXJuIiwiY2FyZCIsIm9uRmlsZURyb3AiLCJ0aW1lbGluZVNldCIsInNob3dVcmxQcmV2aWV3IiwiTGF5b3V0IiwiQnViYmxlIiwiR3JvdXAiLCJyZXNldEp1bXBUb0V2ZW50Iiwib25QYWdpbmF0aW9uUmVxdWVzdCIsInRocmVhZElkIiwiZ2V0TGl2ZVRpbWVsaW5lIiwib25DbG9zZSIsInJlbmRlclRocmVhZFZpZXdIZWFkZXIiLCJvbktleURvd24iLCJQb3N0aG9nVHJhY2tlcnMiLCJ0cmFja0ludGVyYWN0aW9uIiwib25NZWFzdXJlbWVudCIsImdldEN1cnJlbnRVcGxvYWRzIiwibGVuZ3RoIiwicmVzaXplTm90aWZpZXIiLCJlMmVTdGF0dXMiLCJSb29tQ29udGV4dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVGhyZWFkVmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYsIEtleWJvYXJkRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBUaHJlYWQsIFRIUkVBRF9SRUxBVElPTl9UWVBFLCBUaHJlYWRFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy90aHJlYWQnO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tJztcbmltcG9ydCB7IElFdmVudFJlbGF0aW9uLCBNYXRyaXhFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudCc7XG5pbXBvcnQgeyBUaW1lbGluZVdpbmRvdyB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3RpbWVsaW5lLXdpbmRvdyc7XG5pbXBvcnQgeyBEaXJlY3Rpb24gfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQtdGltZWxpbmUnO1xuaW1wb3J0IHsgSVJlbGF0aW9uc1JlcXVlc3RPcHRzIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3JlcXVlc3RzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlcic7XG5cbmltcG9ydCBCYXNlQ2FyZCBmcm9tIFwiLi4vdmlld3MvcmlnaHRfcGFuZWwvQmFzZUNhcmRcIjtcbmltcG9ydCB7IFJpZ2h0UGFuZWxQaGFzZXMgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVBoYXNlc1wiO1xuaW1wb3J0IFJlc2l6ZU5vdGlmaWVyIGZyb20gJy4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyJztcbmltcG9ydCBNZXNzYWdlQ29tcG9zZXIgZnJvbSAnLi4vdmlld3Mvcm9vbXMvTWVzc2FnZUNvbXBvc2VyJztcbmltcG9ydCB7IFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzJztcbmltcG9ydCB7IExheW91dCB9IGZyb20gJy4uLy4uL3NldHRpbmdzL2VudW1zL0xheW91dCc7XG5pbXBvcnQgVGltZWxpbmVQYW5lbCBmcm9tICcuL1RpbWVsaW5lUGFuZWwnO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSAnLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcyc7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnMnO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IEUyRVN0YXR1cyB9IGZyb20gJy4uLy4uL3V0aWxzL1NoaWVsZFV0aWxzJztcbmltcG9ydCBFZGl0b3JTdGF0ZVRyYW5zZmVyIGZyb20gJy4uLy4uL3V0aWxzL0VkaXRvclN0YXRlVHJhbnNmZXInO1xuaW1wb3J0IFJvb21Db250ZXh0LCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gJy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0JztcbmltcG9ydCBDb250ZW50TWVzc2FnZXMgZnJvbSAnLi4vLi4vQ29udGVudE1lc3NhZ2VzJztcbmltcG9ydCBVcGxvYWRCYXIgZnJvbSAnLi9VcGxvYWRCYXInO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFRocmVhZExpc3RDb250ZXh0TWVudSBmcm9tICcuLi92aWV3cy9jb250ZXh0X21lbnVzL1RocmVhZExpc3RDb250ZXh0TWVudSc7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gJy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmUnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFZpZXdSb29tUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuaW1wb3J0IEZpbGVEcm9wVGFyZ2V0IGZyb20gXCIuL0ZpbGVEcm9wVGFyZ2V0XCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCBNZWFzdXJlZCBmcm9tICcuLi92aWV3cy9lbGVtZW50cy9NZWFzdXJlZCc7XG5pbXBvcnQgUG9zdGhvZ1RyYWNrZXJzIGZyb20gXCIuLi8uLi9Qb3N0aG9nVHJhY2tlcnNcIjtcbmltcG9ydCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tICcuLi8uLi9zdG9yZXMvUm9vbVZpZXdTdG9yZSc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IHsgQ29tcG9zZXJJbnNlcnRQYXlsb2FkLCBDb21wb3NlclR5cGUgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Db21wb3Nlckluc2VydFBheWxvYWRcIjtcbmltcG9ydCBIZWFkaW5nIGZyb20gJy4uL3ZpZXdzL3R5cG9ncmFwaHkvSGVhZGluZyc7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgb25DbG9zZTogKCkgPT4gdm9pZDtcbiAgICByZXNpemVOb3RpZmllcjogUmVzaXplTm90aWZpZXI7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgcGVybWFsaW5rQ3JlYXRvcj86IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuICAgIGUyZVN0YXR1cz86IEUyRVN0YXR1cztcbiAgICBpbml0aWFsRXZlbnQ/OiBNYXRyaXhFdmVudDtcbiAgICBpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkPzogYm9vbGVhbjtcbiAgICBpbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldz86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHRocmVhZD86IFRocmVhZDtcbiAgICBsYXlvdXQ6IExheW91dDtcbiAgICBlZGl0U3RhdGU/OiBFZGl0b3JTdGF0ZVRyYW5zZmVyO1xuICAgIHJlcGx5VG9FdmVudD86IE1hdHJpeEV2ZW50O1xuICAgIG5hcnJvdzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGhyZWFkVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0PjtcblxuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbGF5b3V0V2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgdGltZWxpbmVQYW5lbCA9IGNyZWF0ZVJlZjxUaW1lbGluZVBhbmVsPigpO1xuICAgIHByaXZhdGUgY2FyZCA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBsYXlvdXQ6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsYXlvdXRcIiksXG4gICAgICAgICAgICBuYXJyb3c6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubGF5b3V0V2F0Y2hlclJlZiA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwibGF5b3V0XCIsIG51bGwsICguLi5bLCwsIHZhbHVlXSkgPT5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsYXlvdXQ6IHZhbHVlIGFzIExheW91dCB9KSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2V0dXBUaHJlYWQodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuXG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICByb29tLm9uKFRocmVhZEV2ZW50Lk5ldywgdGhpcy5vbk5ld1RocmVhZCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVyUmVmKSBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICByb29tLnJlbW92ZUxpc3RlbmVyKFRocmVhZEV2ZW50Lk5ldywgdGhpcy5vbk5ld1RocmVhZCk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5sYXlvdXRXYXRjaGVyUmVmKTtcblxuICAgICAgICBjb25zdCBoYXNSb29tQ2hhbmdlZCA9IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCkgIT09IHJvb21JZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZCAmJiAhaGFzUm9vbUNoYW5nZWQpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLnJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMpIHtcbiAgICAgICAgaWYgKHByZXZQcm9wcy5teEV2ZW50ICE9PSB0aGlzLnByb3BzLm14RXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBUaHJlYWQodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmV2UHJvcHMucm9vbSAhPT0gdGhpcy5wcm9wcy5yb29tKSB7XG4gICAgICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2Uuc2V0Q2FyZCh7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlJvb21TdW1tYXJ5IH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLnBoYXNlID09IFJpZ2h0UGFuZWxQaGFzZXMuVGhyZWFkVmlldyAmJiBwYXlsb2FkLmV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwVGhyZWFkKHBheWxvYWQuZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkNvbXBvc2VySW5zZXJ0OiB7XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuY29tcG9zZXJUeXBlKSBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC50aW1lbGluZVJlbmRlcmluZ1R5cGUgIT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQpIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgLy8gcmUtZGlzcGF0Y2ggdG8gdGhlIGNvcnJlY3QgY29tcG9zZXJcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Q29tcG9zZXJJbnNlcnRQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIC4uLihwYXlsb2FkIGFzIENvbXBvc2VySW5zZXJ0UGF5bG9hZCksXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvc2VyVHlwZTogdGhpcy5zdGF0ZS5lZGl0U3RhdGUgPyBDb21wb3NlclR5cGUuRWRpdCA6IENvbXBvc2VyVHlwZS5TZW5kLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5FZGl0RXZlbnQ6XG4gICAgICAgICAgICAgICAgLy8gUXVpdCBlYXJseSBpZiBpdCdzIG5vdCBhIHRocmVhZCBjb250ZXh0XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gUXVpdCBlYXJseSBpZiB0aGF0J3Mgbm90IGEgdGhyZWFkIGV2ZW50XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuZXZlbnQgJiYgIXBheWxvYWQuZXZlbnQuZ2V0VGhyZWFkKCkpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZWRpdFN0YXRlOiBwYXlsb2FkLmV2ZW50ID8gbmV3IEVkaXRvclN0YXRlVHJhbnNmZXIocGF5bG9hZC5ldmVudCkgOiBudWxsLFxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGltZWxpbmVQYW5lbC5jdXJyZW50Py5zY3JvbGxUb0V2ZW50SWZOZWVkZWQocGF5bG9hZC5ldmVudC5nZXRJZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVwbHlfdG9fZXZlbnQnOlxuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLmNvbnRleHQgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBseVRvRXZlbnQ6IHBheWxvYWQuZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzZXR1cFRocmVhZCA9IChteEV2OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBsZXQgdGhyZWFkID0gdGhpcy5wcm9wcy5yb29tLmdldFRocmVhZChteEV2LmdldElkKCkpO1xuICAgICAgICBpZiAoIXRocmVhZCkge1xuICAgICAgICAgICAgdGhyZWFkID0gdGhpcy5wcm9wcy5yb29tLmNyZWF0ZVRocmVhZChteEV2LmdldElkKCksIG14RXYsIFtteEV2XSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVUaHJlYWQodGhyZWFkKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk5ld1RocmVhZCA9ICh0aHJlYWQ6IFRocmVhZCkgPT4ge1xuICAgICAgICBpZiAodGhyZWFkLmlkID09PSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXR1cFRocmVhZCh0aGlzLnByb3BzLm14RXZlbnQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlVGhyZWFkID0gKHRocmVhZD86IFRocmVhZCkgPT4ge1xuICAgICAgICBpZiAodGhyZWFkICYmIHRoaXMuc3RhdGUudGhyZWFkICE9PSB0aHJlYWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHRocmVhZCxcbiAgICAgICAgICAgIH0sIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJlYWQuZW1pdChUaHJlYWRFdmVudC5WaWV3VGhyZWFkKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aHJlYWQuZmV0Y2hJbml0aWFsRXZlbnRzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0QmF0Y2ggPSB0aHJlYWQubGl2ZVRpbWVsaW5lLmdldFBhZ2luYXRpb25Ub2tlbihEaXJlY3Rpb24uQmFja3dhcmQpO1xuICAgICAgICAgICAgICAgIHRoaXMudGltZWxpbmVQYW5lbC5jdXJyZW50Py5yZWZyZXNoVGltZWxpbmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVzZXRKdW1wVG9FdmVudCA9IChldmVudD86IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pbml0aWFsRXZlbnQgJiYgdGhpcy5wcm9wcy5pbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldyAmJlxuICAgICAgICAgICAgZXZlbnQgPT09IHRoaXMucHJvcHMuaW5pdGlhbEV2ZW50Py5nZXRJZCgpKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5yb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICBldmVudF9pZDogdGhpcy5wcm9wcy5pbml0aWFsRXZlbnQ/LmdldElkKCksXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IHRoaXMucHJvcHMuaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZCxcbiAgICAgICAgICAgICAgICBzY3JvbGxfaW50b192aWV3OiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXBseWluZ1RvRXZlbnQ6IHRoaXMuc3RhdGUucmVwbHlUb0V2ZW50LFxuICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NZWFzdXJlbWVudCA9IChuYXJyb3c6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG5hcnJvdyB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXY6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRSb29tQWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5VcGxvYWRGaWxlOiB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInVwbG9hZF9maWxlXCIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQsXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgbmV4dEJhdGNoOiBzdHJpbmc7XG5cbiAgICBwcml2YXRlIG9uUGFnaW5hdGlvblJlcXVlc3QgPSBhc3luYyAoXG4gICAgICAgIHRpbWVsaW5lV2luZG93OiBUaW1lbGluZVdpbmRvdyB8IG51bGwsXG4gICAgICAgIGRpcmVjdGlvbiA9IERpcmVjdGlvbi5CYWNrd2FyZCxcbiAgICAgICAgbGltaXQgPSAyMCxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgICAgaWYgKCFUaHJlYWQuaGFzU2VydmVyU2lkZVN1cHBvcnQpIHtcbiAgICAgICAgICAgIHRpbWVsaW5lV2luZG93LmV4dGVuZChkaXJlY3Rpb24sIGxpbWl0KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3B0czogSVJlbGF0aW9uc1JlcXVlc3RPcHRzID0ge1xuICAgICAgICAgICAgbGltaXQsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMubmV4dEJhdGNoKSB7XG4gICAgICAgICAgICBvcHRzLmZyb20gPSB0aGlzLm5leHRCYXRjaDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgbmV4dEJhdGNoIH0gPSBhd2FpdCB0aGlzLnN0YXRlLnRocmVhZC5mZXRjaEV2ZW50cyhvcHRzKTtcblxuICAgICAgICB0aGlzLm5leHRCYXRjaCA9IG5leHRCYXRjaDtcblxuICAgICAgICAvLyBBZHZhbmNlcyB0aGUgbWFya2VyIG9uIHRoZSBUaW1lbGluZVdpbmRvdyB0byBkZWZpbmUgdGhlIGNvcnJlY3RcbiAgICAgICAgLy8gd2luZG93IG9mIGV2ZW50cyB0byBkaXNwbGF5IG9uIHNjcmVlblxuICAgICAgICB0aW1lbGluZVdpbmRvdy5leHRlbmQoZGlyZWN0aW9uLCBsaW1pdCk7XG5cbiAgICAgICAgcmV0dXJuICEhbmV4dEJhdGNoO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRmlsZURyb3AgPSAoZGF0YVRyYW5zZmVyOiBEYXRhVHJhbnNmZXIpID0+IHtcbiAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICAgICAgQXJyYXkuZnJvbShkYXRhVHJhbnNmZXIuZmlsZXMpLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpLFxuICAgICAgICAgICAgdGhpcy50aHJlYWRSZWxhdGlvbixcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKSxcbiAgICAgICAgICAgIFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQsXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0IHRocmVhZFJlbGF0aW9uKCk6IElFdmVudFJlbGF0aW9uIHtcbiAgICAgICAgY29uc3QgbGFzdFRocmVhZFJlcGx5ID0gdGhpcy5zdGF0ZS50aHJlYWQ/Lmxhc3RSZXBseSgoZXY6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZXYuaXNSZWxhdGlvbihUSFJFQURfUkVMQVRJT05fVFlQRS5uYW1lKSAmJiAhZXYuc3RhdHVzO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJyZWxfdHlwZVwiOiBUSFJFQURfUkVMQVRJT05fVFlQRS5uYW1lLFxuICAgICAgICAgICAgXCJldmVudF9pZFwiOiB0aGlzLnN0YXRlLnRocmVhZD8uaWQsXG4gICAgICAgICAgICBcImlzX2ZhbGxpbmdfYmFja1wiOiB0cnVlLFxuICAgICAgICAgICAgXCJtLmluX3JlcGx5X3RvXCI6IHtcbiAgICAgICAgICAgICAgICBcImV2ZW50X2lkXCI6IGxhc3RUaHJlYWRSZXBseT8uZ2V0SWQoKSA/PyB0aGlzLnN0YXRlLnRocmVhZD8uaWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyVGhyZWFkVmlld0hlYWRlciA9ICgpOiBKU1guRWxlbWVudCA9PiB7XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0Jhc2VDYXJkX2hlYWRlcl90aXRsZVwiPlxuICAgICAgICAgICAgPEhlYWRpbmcgc2l6ZT1cImg0XCIgY2xhc3NOYW1lPVwibXhfQmFzZUNhcmRfaGVhZGVyX3RpdGxlX2hlYWRpbmdcIj57IF90KFwiVGhyZWFkXCIpIH08L0hlYWRpbmc+XG4gICAgICAgICAgICA8VGhyZWFkTGlzdENvbnRleHRNZW51XG4gICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcn0gLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgaGlnaGxpZ2h0ZWRFdmVudElkID0gdGhpcy5wcm9wcy5pc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkXG4gICAgICAgICAgICA/IHRoaXMucHJvcHMuaW5pdGlhbEV2ZW50Py5nZXRJZCgpXG4gICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgY29uc3QgdGhyZWFkUmVsYXRpb24gPSB0aGlzLnRocmVhZFJlbGF0aW9uO1xuXG4gICAgICAgIGxldCB0aW1lbGluZTogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRocmVhZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaW5pdGlhbEV2ZW50ICYmIHRoaXMucHJvcHMuaW5pdGlhbEV2ZW50LmdldFJvb21JZCgpICE9PSB0aGlzLnN0YXRlLnRocmVhZC5yb29tSWQpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihcIlRocmVhZFZpZXcgYXR0ZW1wdGluZyB0byByZW5kZXIgVGltZWxpbmVQYW5lbCB3aXRoIG1pc21hdGNoZWQgaW5pdGlhbEV2ZW50XCIsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudGhyZWFkLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5pbml0aWFsRXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuaW5pdGlhbEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGltZWxpbmUgPSA8PlxuICAgICAgICAgICAgICAgIDxGaWxlRHJvcFRhcmdldCBwYXJlbnQ9e3RoaXMuY2FyZC5jdXJyZW50fSBvbkZpbGVEcm9wPXt0aGlzLm9uRmlsZURyb3B9IC8+XG4gICAgICAgICAgICAgICAgPFRpbWVsaW5lUGFuZWxcbiAgICAgICAgICAgICAgICAgICAga2V5PXt0aGlzLnN0YXRlLnRocmVhZC5pZH1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnRpbWVsaW5lUGFuZWx9XG4gICAgICAgICAgICAgICAgICAgIHNob3dSZWFkUmVjZWlwdHM9e2ZhbHNlfSAvLyBIaWRlIHRoZSByZWFkIHJlY2VpcHRzXG4gICAgICAgICAgICAgICAgICAgIC8vIHVudGlsIGhvbWVzZXJ2ZXJzIHNwZWFrIHRocmVhZHMgbGFuZ3VhZ2VcbiAgICAgICAgICAgICAgICAgICAgbWFuYWdlUmVhZFJlY2VpcHRzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBtYW5hZ2VSZWFkTWFya2Vycz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlYWRSZWNlaXB0T25Mb2FkPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICB0aW1lbGluZVNldD17dGhpcy5zdGF0ZS50aHJlYWQudGltZWxpbmVTZXR9XG4gICAgICAgICAgICAgICAgICAgIHNob3dVcmxQcmV2aWV3PXt0aGlzLmNvbnRleHQuc2hvd1VybFByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgIC8vIFRocmVhZFZpZXcgZG9lc24ndCBzdXBwb3J0IElSQyBsYXlvdXQgYXQgdGhpcyB0aW1lXG4gICAgICAgICAgICAgICAgICAgIGxheW91dD17dGhpcy5zdGF0ZS5sYXlvdXQgPT09IExheW91dC5CdWJibGUgPyBMYXlvdXQuQnViYmxlIDogTGF5b3V0Lkdyb3VwfVxuICAgICAgICAgICAgICAgICAgICBoaWRlVGhyZWFkZWRNZXNzYWdlcz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIGhpZGRlbj17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIHNob3dSZWFjdGlvbnM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbFwiXG4gICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcn1cbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc0xvYWRlZD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgZWRpdFN0YXRlPXt0aGlzLnN0YXRlLmVkaXRTdGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgZXZlbnRJZD17dGhpcy5wcm9wcy5pbml0aWFsRXZlbnQ/LmdldElkKCl9XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkRXZlbnRJZD17aGlnaGxpZ2h0ZWRFdmVudElkfVxuICAgICAgICAgICAgICAgICAgICBldmVudFNjcm9sbEludG9WaWV3PXt0aGlzLnByb3BzLmluaXRpYWxFdmVudFNjcm9sbEludG9WaWV3fVxuICAgICAgICAgICAgICAgICAgICBvbkV2ZW50U2Nyb2xsZWRJbnRvVmlldz17dGhpcy5yZXNldEp1bXBUb0V2ZW50fVxuICAgICAgICAgICAgICAgICAgICBvblBhZ2luYXRpb25SZXF1ZXN0PXt0aGlzLm9uUGFnaW5hdGlvblJlcXVlc3R9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVsaW5lID0gPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld19tZXNzYWdlUGFuZWxTcGlubmVyXCI+XG4gICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Um9vbUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3tcbiAgICAgICAgICAgICAgICAuLi50aGlzLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlOiBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkLFxuICAgICAgICAgICAgICAgIHRocmVhZElkOiB0aGlzLnN0YXRlLnRocmVhZD8uaWQsXG4gICAgICAgICAgICAgICAgbGl2ZVRpbWVsaW5lOiB0aGlzLnN0YXRlPy50aHJlYWQ/LnRpbWVsaW5lU2V0Py5nZXRMaXZlVGltZWxpbmUoKSxcbiAgICAgICAgICAgICAgICBuYXJyb3c6IHRoaXMuc3RhdGUubmFycm93LFxuICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgPEJhc2VDYXJkXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1RocmVhZFZpZXcgbXhfVGhyZWFkUGFuZWxcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLnByb3BzLm9uQ2xvc2V9XG4gICAgICAgICAgICAgICAgICAgIHdpdGhvdXRTY3JvbGxDb250YWluZXI9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcj17dGhpcy5yZW5kZXJUaHJlYWRWaWV3SGVhZGVyKCl9XG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5jYXJkfVxuICAgICAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgICAgICBvbkJhY2s9eyhldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViVGhyZWFkVmlld0JhY2tCdXR0b25cIiwgZXYpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPE1lYXN1cmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5zb3I9e3RoaXMuY2FyZC5jdXJyZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25NZWFzdXJlbWVudD17dGhpcy5vbk1lYXN1cmVtZW50fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1RocmVhZFZpZXdfdGltZWxpbmVQYW5lbFdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGltZWxpbmUgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICB7IENvbnRlbnRNZXNzYWdlcy5zaGFyZWRJbnN0YW5jZSgpLmdldEN1cnJlbnRVcGxvYWRzKHRocmVhZFJlbGF0aW9uKS5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxVcGxvYWRCYXIgcm9vbT17dGhpcy5wcm9wcy5yb29tfSByZWxhdGlvbj17dGhyZWFkUmVsYXRpb259IC8+XG4gICAgICAgICAgICAgICAgICAgICkgfVxuXG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS50aHJlYWQ/LnRpbWVsaW5lU2V0ICYmICg8TWVzc2FnZUNvbXBvc2VyXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tPXt0aGlzLnByb3BzLnJvb219XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uPXt0aHJlYWRSZWxhdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudD17dGhpcy5zdGF0ZS5yZXBseVRvRXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgICBlMmVTdGF0dXM9e3RoaXMucHJvcHMuZTJlU3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFjdD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz4pIH1cbiAgICAgICAgICAgICAgICA8L0Jhc2VDYXJkPlxuICAgICAgICAgICAgPC9Sb29tQ29udGV4dC5Qcm92aWRlcj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUlBOztBQUVBOztBQUVBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBc0JlLE1BQU1BLFVBQU4sU0FBeUJDLGNBQUEsQ0FBTUMsU0FBL0IsQ0FBeUQ7RUFTcEVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUFBOztJQUN2QixNQUFNQSxLQUFOLENBRHVCO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQSxrRUFISCxJQUFBQyxnQkFBQSxHQUdHO0lBQUEseURBRlosSUFBQUEsZ0JBQUEsR0FFWTtJQUFBLGdEQWdEUEMsT0FBRCxJQUFrQztNQUNqRCxJQUFJQSxPQUFPLENBQUNDLEtBQVIsSUFBaUJDLHVDQUFBLENBQWlCUixVQUFsQyxJQUFnRE0sT0FBTyxDQUFDRyxLQUE1RCxFQUFtRTtRQUMvRCxLQUFLQyxXQUFMLENBQWlCSixPQUFPLENBQUNHLEtBQXpCO01BQ0g7O01BQ0QsUUFBUUgsT0FBTyxDQUFDSyxNQUFoQjtRQUNJLEtBQUtDLGVBQUEsQ0FBT0MsY0FBWjtVQUE0QjtZQUN4QixJQUFJUCxPQUFPLENBQUNRLFlBQVosRUFBMEI7WUFDMUIsSUFBSVIsT0FBTyxDQUFDUyxxQkFBUixLQUFrQ0Msa0NBQUEsQ0FBc0JDLE1BQTVELEVBQW9FLE1BRjVDLENBSXhCOztZQUNBQyxtQkFBQSxDQUFJQyxRQUFKLGlDQUNRYixPQURSO2NBRUlRLFlBQVksRUFBRSxLQUFLTSxLQUFMLENBQVdDLFNBQVgsR0FBdUJDLG1DQUFBLENBQWFDLElBQXBDLEdBQTJDRCxtQ0FBQSxDQUFhRTtZQUYxRTs7WUFJQTtVQUNIOztRQUVELEtBQUtaLGVBQUEsQ0FBT2EsU0FBWjtVQUNJO1VBQ0EsSUFBSW5CLE9BQU8sQ0FBQ1MscUJBQVIsS0FBa0NDLGtDQUFBLENBQXNCQyxNQUE1RCxFQUFvRSxPQUZ4RSxDQUdJOztVQUNBLElBQUlYLE9BQU8sQ0FBQ0csS0FBUixJQUFpQixDQUFDSCxPQUFPLENBQUNHLEtBQVIsQ0FBY2lCLFNBQWQsRUFBdEIsRUFBaUQ7VUFDakQsS0FBS0MsUUFBTCxDQUFjO1lBQ1ZOLFNBQVMsRUFBRWYsT0FBTyxDQUFDRyxLQUFSLEdBQWdCLElBQUltQiw0QkFBSixDQUF3QnRCLE9BQU8sQ0FBQ0csS0FBaEMsQ0FBaEIsR0FBeUQ7VUFEMUQsQ0FBZCxFQUVHLE1BQU07WUFDTCxJQUFJSCxPQUFPLENBQUNHLEtBQVosRUFBbUI7Y0FDZixLQUFLb0IsYUFBTCxDQUFtQkMsT0FBbkIsRUFBNEJDLHFCQUE1QixDQUFrRHpCLE9BQU8sQ0FBQ0csS0FBUixDQUFjdUIsS0FBZCxFQUFsRDtZQUNIO1VBQ0osQ0FORDtVQU9BOztRQUNKLEtBQUssZ0JBQUw7VUFDSSxJQUFJMUIsT0FBTyxDQUFDMkIsT0FBUixLQUFvQmpCLGtDQUFBLENBQXNCQyxNQUE5QyxFQUFzRDtZQUNsRCxLQUFLVSxRQUFMLENBQWM7Y0FDVk8sWUFBWSxFQUFFNUIsT0FBTyxDQUFDRztZQURaLENBQWQ7VUFHSDs7VUFDRDs7UUFDSjtVQUNJO01BbENSO0lBb0NILENBeEYwQjtJQUFBLG1EQTBGSjBCLElBQUQsSUFBdUI7TUFDekMsSUFBSUMsTUFBTSxHQUFHLEtBQUtoQyxLQUFMLENBQVdpQyxJQUFYLENBQWdCWCxTQUFoQixDQUEwQlMsSUFBSSxDQUFDSCxLQUFMLEVBQTFCLENBQWI7O01BQ0EsSUFBSSxDQUFDSSxNQUFMLEVBQWE7UUFDVEEsTUFBTSxHQUFHLEtBQUtoQyxLQUFMLENBQVdpQyxJQUFYLENBQWdCQyxZQUFoQixDQUE2QkgsSUFBSSxDQUFDSCxLQUFMLEVBQTdCLEVBQTJDRyxJQUEzQyxFQUFpRCxDQUFDQSxJQUFELENBQWpELEVBQXlELElBQXpELENBQVQ7TUFDSDs7TUFDRCxLQUFLSSxZQUFMLENBQWtCSCxNQUFsQjtJQUNILENBaEcwQjtJQUFBLG1EQWtHSkEsTUFBRCxJQUFvQjtNQUN0QyxJQUFJQSxNQUFNLENBQUNJLEVBQVAsS0FBYyxLQUFLcEMsS0FBTCxDQUFXcUMsT0FBWCxDQUFtQlQsS0FBbkIsRUFBbEIsRUFBOEM7UUFDMUMsS0FBS3RCLFdBQUwsQ0FBaUIsS0FBS04sS0FBTCxDQUFXcUMsT0FBNUI7TUFDSDtJQUNKLENBdEcwQjtJQUFBLG9EQXdHSEwsTUFBRCxJQUFxQjtNQUN4QyxJQUFJQSxNQUFNLElBQUksS0FBS2hCLEtBQUwsQ0FBV2dCLE1BQVgsS0FBc0JBLE1BQXBDLEVBQTRDO1FBQ3hDLEtBQUtULFFBQUwsQ0FBYztVQUNWUztRQURVLENBQWQsRUFFRyxZQUFZO1VBQ1hBLE1BQU0sQ0FBQ00sSUFBUCxDQUFZQyxtQkFBQSxDQUFZQyxVQUF4QjtVQUNBLE1BQU1SLE1BQU0sQ0FBQ1Msa0JBQVAsRUFBTjtVQUNBLEtBQUtDLFNBQUwsR0FBaUJWLE1BQU0sQ0FBQ1csWUFBUCxDQUFvQkMsa0JBQXBCLENBQXVDQyx3QkFBQSxDQUFVQyxRQUFqRCxDQUFqQjtVQUNBLEtBQUtyQixhQUFMLENBQW1CQyxPQUFuQixFQUE0QnFCLGVBQTVCO1FBQ0gsQ0FQRDtNQVFIO0lBQ0osQ0FuSDBCO0lBQUEsd0RBcUhDMUMsS0FBRCxJQUEwQjtNQUNqRCxJQUFJLEtBQUtMLEtBQUwsQ0FBV2dELFlBQVgsSUFBMkIsS0FBS2hELEtBQUwsQ0FBV2lELDBCQUF0QyxJQUNBNUMsS0FBSyxLQUFLLEtBQUtMLEtBQUwsQ0FBV2dELFlBQVgsRUFBeUJwQixLQUF6QixFQURkLEVBQ2dEO1FBQzVDZCxtQkFBQSxDQUFJQyxRQUFKLENBQThCO1VBQzFCUixNQUFNLEVBQUVDLGVBQUEsQ0FBTzBDLFFBRFc7VUFFMUJDLE9BQU8sRUFBRSxLQUFLbkQsS0FBTCxDQUFXaUMsSUFBWCxDQUFnQm1CLE1BRkM7VUFHMUJDLFFBQVEsRUFBRSxLQUFLckQsS0FBTCxDQUFXZ0QsWUFBWCxFQUF5QnBCLEtBQXpCLEVBSGdCO1VBSTFCMEIsV0FBVyxFQUFFLEtBQUt0RCxLQUFMLENBQVd1RCx5QkFKRTtVQUsxQkMsZ0JBQWdCLEVBQUUsS0FMUTtVQU0xQkMsZUFBZSxFQUFFLEtBQUt6QyxLQUFMLENBQVdjLFlBTkY7VUFPMUI0QixjQUFjLEVBQUVDLFNBUFUsQ0FPQzs7UUFQRCxDQUE5QjtNQVNIO0lBQ0osQ0FsSTBCO0lBQUEscURBb0lGQyxNQUFELElBQTJCO01BQy9DLEtBQUtyQyxRQUFMLENBQWM7UUFBRXFDO01BQUYsQ0FBZDtJQUNILENBdEkwQjtJQUFBLGlEQXdJTkMsRUFBRCxJQUF1QjtNQUN2QyxJQUFJQyxPQUFPLEdBQUcsS0FBZDtNQUVBLE1BQU12RCxNQUFNLEdBQUcsSUFBQXdELHlDQUFBLElBQXdCQyxhQUF4QixDQUFzQ0gsRUFBdEMsQ0FBZjs7TUFDQSxRQUFRdEQsTUFBUjtRQUNJLEtBQUswRCxtQ0FBQSxDQUFpQkMsVUFBdEI7VUFBa0M7WUFDOUJwRCxtQkFBQSxDQUFJQyxRQUFKLENBQWE7Y0FDVFIsTUFBTSxFQUFFLGFBREM7Y0FFVHNCLE9BQU8sRUFBRWpCLGtDQUFBLENBQXNCQztZQUZ0QixDQUFiLEVBR0csSUFISDs7WUFJQWlELE9BQU8sR0FBRyxJQUFWO1lBQ0E7VUFDSDtNQVJMOztNQVdBLElBQUlBLE9BQUosRUFBYTtRQUNURCxFQUFFLENBQUNNLGVBQUg7UUFDQU4sRUFBRSxDQUFDTyxjQUFIO01BQ0g7SUFDSixDQTNKMEI7SUFBQTtJQUFBLDJEQStKRyxnQkFDMUJDLGNBRDBCLEVBSVA7TUFBQSxJQUZuQkMsU0FFbUIsdUVBRlB6Qix3QkFBQSxDQUFVQyxRQUVIO01BQUEsSUFEbkJ5QixLQUNtQix1RUFEWCxFQUNXOztNQUNuQixJQUFJLENBQUMxRCxjQUFBLENBQU8yRCxvQkFBWixFQUFrQztRQUM5QkgsY0FBYyxDQUFDSSxNQUFmLENBQXNCSCxTQUF0QixFQUFpQ0MsS0FBakM7UUFDQSxPQUFPLElBQVA7TUFDSDs7TUFFRCxNQUFNRyxJQUEyQixHQUFHO1FBQ2hDSDtNQURnQyxDQUFwQzs7TUFJQSxJQUFJLEtBQUksQ0FBQzdCLFNBQVQsRUFBb0I7UUFDaEJnQyxJQUFJLENBQUNDLElBQUwsR0FBWSxLQUFJLENBQUNqQyxTQUFqQjtNQUNIOztNQUVELE1BQU07UUFBRUE7TUFBRixJQUFnQixNQUFNLEtBQUksQ0FBQzFCLEtBQUwsQ0FBV2dCLE1BQVgsQ0FBa0I0QyxXQUFsQixDQUE4QkYsSUFBOUIsQ0FBNUI7TUFFQSxLQUFJLENBQUNoQyxTQUFMLEdBQWlCQSxTQUFqQixDQWhCbUIsQ0FrQm5CO01BQ0E7O01BQ0EyQixjQUFjLENBQUNJLE1BQWYsQ0FBc0JILFNBQXRCLEVBQWlDQyxLQUFqQztNQUVBLE9BQU8sQ0FBQyxDQUFDN0IsU0FBVDtJQUNILENBMUwwQjtJQUFBLGtEQTRMTG1DLFlBQUQsSUFBZ0M7TUFDakRDLHdCQUFBLENBQWdCQyxjQUFoQixHQUFpQ0MscUJBQWpDLENBQ0lDLEtBQUssQ0FBQ04sSUFBTixDQUFXRSxZQUFZLENBQUNLLEtBQXhCLENBREosRUFFSSxLQUFLbEYsS0FBTCxDQUFXcUMsT0FBWCxDQUFtQjhDLFNBQW5CLEVBRkosRUFHSSxLQUFLQyxjQUhULEVBSUlDLGdDQUFBLENBQWdCQyxHQUFoQixFQUpKLEVBS0kxRSxrQ0FBQSxDQUFzQkMsTUFMMUI7SUFPSCxDQXBNMEI7SUFBQSw4REFxTk0sTUFBbUI7TUFDaEQsb0JBQU87UUFBSyxTQUFTLEVBQUM7TUFBZixnQkFDSCw2QkFBQyxnQkFBRDtRQUFTLElBQUksRUFBQyxJQUFkO1FBQW1CLFNBQVMsRUFBQztNQUE3QixHQUFrRSxJQUFBMEUsbUJBQUEsRUFBRyxRQUFILENBQWxFLENBREcsZUFFSCw2QkFBQyw4QkFBRDtRQUNJLE9BQU8sRUFBRSxLQUFLdkYsS0FBTCxDQUFXcUMsT0FEeEI7UUFFSSxnQkFBZ0IsRUFBRSxLQUFLckMsS0FBTCxDQUFXd0Y7TUFGakMsRUFGRyxDQUFQO0lBTUgsQ0E1TjBCO0lBR3ZCLEtBQUt4RSxLQUFMLEdBQWE7TUFDVHlFLE1BQU0sRUFBRUMsc0JBQUEsQ0FBY0MsUUFBZCxDQUF1QixRQUF2QixDQURDO01BRVQvQixNQUFNLEVBQUU7SUFGQyxDQUFiO0lBS0EsS0FBS2dDLGdCQUFMLEdBQXdCRixzQkFBQSxDQUFjRyxZQUFkLENBQTJCLFFBQTNCLEVBQXFDLElBQXJDLEVBQTJDO01BQUE7UUFBQTtNQUFBOztNQUFBLElBQUksS0FBS0MsS0FBTCxDQUFKO01BQUEsT0FDL0QsS0FBSSxDQUFDdkUsUUFBTCxDQUFjO1FBQUVrRSxNQUFNLEVBQUVLO01BQVYsQ0FBZCxDQUQrRDtJQUFBLENBQTNDLENBQXhCO0VBR0g7O0VBRU1DLGlCQUFpQixHQUFTO0lBQzdCLEtBQUt6RixXQUFMLENBQWlCLEtBQUtOLEtBQUwsQ0FBV3FDLE9BQTVCO0lBQ0EsS0FBSzJELGFBQUwsR0FBcUJsRixtQkFBQSxDQUFJbUYsUUFBSixDQUFhLEtBQUtDLFFBQWxCLENBQXJCOztJQUVBLE1BQU1qRSxJQUFJLEdBQUdvRCxnQ0FBQSxDQUFnQkMsR0FBaEIsR0FBc0JhLE9BQXRCLENBQThCLEtBQUtuRyxLQUFMLENBQVdxQyxPQUFYLENBQW1COEMsU0FBbkIsRUFBOUIsQ0FBYjs7SUFDQWxELElBQUksQ0FBQ21FLEVBQUwsQ0FBUTdELG1CQUFBLENBQVk4RCxHQUFwQixFQUF5QixLQUFLQyxXQUE5QjtFQUNIOztFQUVNQyxvQkFBb0IsR0FBUztJQUNoQyxJQUFJLEtBQUtQLGFBQVQsRUFBd0JsRixtQkFBQSxDQUFJMEYsVUFBSixDQUFlLEtBQUtSLGFBQXBCO0lBQ3hCLE1BQU01QyxNQUFNLEdBQUcsS0FBS3BELEtBQUwsQ0FBV3FDLE9BQVgsQ0FBbUI4QyxTQUFuQixFQUFmOztJQUNBLE1BQU1sRCxJQUFJLEdBQUdvRCxnQ0FBQSxDQUFnQkMsR0FBaEIsR0FBc0JhLE9BQXRCLENBQThCL0MsTUFBOUIsQ0FBYjs7SUFDQW5CLElBQUksQ0FBQ3dFLGNBQUwsQ0FBb0JsRSxtQkFBQSxDQUFZOEQsR0FBaEMsRUFBcUMsS0FBS0MsV0FBMUM7O0lBQ0FaLHNCQUFBLENBQWNnQixjQUFkLENBQTZCLEtBQUtkLGdCQUFsQzs7SUFFQSxNQUFNZSxjQUFjLEdBQUdDLDRCQUFBLENBQWNDLFFBQWQsQ0FBdUIxQixTQUF2QixPQUF1Qy9CLE1BQTlEOztJQUNBLElBQUksS0FBS3BELEtBQUwsQ0FBV3VELHlCQUFYLElBQXdDLENBQUNvRCxjQUE3QyxFQUE2RDtNQUN6RDdGLG1CQUFBLENBQUlDLFFBQUosQ0FBOEI7UUFDMUJSLE1BQU0sRUFBRUMsZUFBQSxDQUFPMEMsUUFEVztRQUUxQkMsT0FBTyxFQUFFLEtBQUtuRCxLQUFMLENBQVdpQyxJQUFYLENBQWdCbUIsTUFGQztRQUcxQk0sY0FBYyxFQUFFQyxTQUhVLENBR0M7O01BSEQsQ0FBOUI7SUFLSDtFQUNKOztFQUVNbUQsa0JBQWtCLENBQUNDLFNBQUQsRUFBWTtJQUNqQyxJQUFJQSxTQUFTLENBQUMxRSxPQUFWLEtBQXNCLEtBQUtyQyxLQUFMLENBQVdxQyxPQUFyQyxFQUE4QztNQUMxQyxLQUFLL0IsV0FBTCxDQUFpQixLQUFLTixLQUFMLENBQVdxQyxPQUE1QjtJQUNIOztJQUVELElBQUkwRSxTQUFTLENBQUM5RSxJQUFWLEtBQW1CLEtBQUtqQyxLQUFMLENBQVdpQyxJQUFsQyxFQUF3QztNQUNwQytFLHdCQUFBLENBQWdCSCxRQUFoQixDQUF5QkksT0FBekIsQ0FBaUM7UUFBRTlHLEtBQUssRUFBRUMsdUNBQUEsQ0FBaUI4RztNQUExQixDQUFqQztJQUNIO0VBQ0o7O0VBd0p5QixJQUFkOUIsY0FBYyxHQUFtQjtJQUN6QyxNQUFNK0IsZUFBZSxHQUFHLEtBQUtuRyxLQUFMLENBQVdnQixNQUFYLEVBQW1Cb0YsU0FBbkIsQ0FBOEJ2RCxFQUFELElBQXFCO01BQ3RFLE9BQU9BLEVBQUUsQ0FBQ3dELFVBQUgsQ0FBY0MsNEJBQUEsQ0FBcUJDLElBQW5DLEtBQTRDLENBQUMxRCxFQUFFLENBQUMyRCxNQUF2RDtJQUNILENBRnVCLENBQXhCO0lBSUEsT0FBTztNQUNILFlBQVlGLDRCQUFBLENBQXFCQyxJQUQ5QjtNQUVILFlBQVksS0FBS3ZHLEtBQUwsQ0FBV2dCLE1BQVgsRUFBbUJJLEVBRjVCO01BR0gsbUJBQW1CLElBSGhCO01BSUgsaUJBQWlCO1FBQ2IsWUFBWStFLGVBQWUsRUFBRXZGLEtBQWpCLE1BQTRCLEtBQUtaLEtBQUwsQ0FBV2dCLE1BQVgsRUFBbUJJO01BRDlDO0lBSmQsQ0FBUDtFQVFIOztFQVdNcUYsTUFBTSxHQUFnQjtJQUN6QixNQUFNQyxrQkFBa0IsR0FBRyxLQUFLMUgsS0FBTCxDQUFXdUQseUJBQVgsR0FDckIsS0FBS3ZELEtBQUwsQ0FBV2dELFlBQVgsRUFBeUJwQixLQUF6QixFQURxQixHQUVyQixJQUZOO0lBSUEsTUFBTXdELGNBQWMsR0FBRyxLQUFLQSxjQUE1QjtJQUVBLElBQUl1QyxRQUFKOztJQUNBLElBQUksS0FBSzNHLEtBQUwsQ0FBV2dCLE1BQWYsRUFBdUI7TUFDbkIsSUFBSSxLQUFLaEMsS0FBTCxDQUFXZ0QsWUFBWCxJQUEyQixLQUFLaEQsS0FBTCxDQUFXZ0QsWUFBWCxDQUF3Qm1DLFNBQXhCLE9BQXdDLEtBQUtuRSxLQUFMLENBQVdnQixNQUFYLENBQWtCb0IsTUFBekYsRUFBaUc7UUFDN0Z3RSxjQUFBLENBQU9DLElBQVAsQ0FBWSw0RUFBWixFQUNJLEtBQUs3RyxLQUFMLENBQVdnQixNQUFYLENBQWtCb0IsTUFEdEIsRUFFSSxLQUFLcEQsS0FBTCxDQUFXZ0QsWUFBWCxDQUF3Qm1DLFNBQXhCLEVBRkosRUFHSSxLQUFLbkYsS0FBTCxDQUFXZ0QsWUFBWCxDQUF3QnBCLEtBQXhCLEVBSEo7TUFLSDs7TUFFRCtGLFFBQVEsZ0JBQUcseUVBQ1AsNkJBQUMsdUJBQUQ7UUFBZ0IsTUFBTSxFQUFFLEtBQUtHLElBQUwsQ0FBVXBHLE9BQWxDO1FBQTJDLFVBQVUsRUFBRSxLQUFLcUc7TUFBNUQsRUFETyxlQUVQLDZCQUFDLHNCQUFEO1FBQ0ksR0FBRyxFQUFFLEtBQUsvRyxLQUFMLENBQVdnQixNQUFYLENBQWtCSSxFQUQzQjtRQUVJLEdBQUcsRUFBRSxLQUFLWCxhQUZkO1FBR0ksZ0JBQWdCLEVBQUUsS0FIdEIsQ0FHNkI7UUFDekI7UUFKSjtRQUtJLGtCQUFrQixFQUFFLElBTHhCO1FBTUksaUJBQWlCLEVBQUUsSUFOdkI7UUFPSSxxQkFBcUIsRUFBRSxJQVAzQjtRQVFJLFdBQVcsRUFBRSxLQUFLVCxLQUFMLENBQVdnQixNQUFYLENBQWtCZ0csV0FSbkM7UUFTSSxjQUFjLEVBQUUsS0FBS25HLE9BQUwsQ0FBYW9HLGNBVGpDLENBVUk7UUFWSjtRQVdJLE1BQU0sRUFBRSxLQUFLakgsS0FBTCxDQUFXeUUsTUFBWCxLQUFzQnlDLGNBQUEsQ0FBT0MsTUFBN0IsR0FBc0NELGNBQUEsQ0FBT0MsTUFBN0MsR0FBc0RELGNBQUEsQ0FBT0UsS0FYekU7UUFZSSxvQkFBb0IsRUFBRSxLQVoxQjtRQWFJLE1BQU0sRUFBRSxLQWJaO1FBY0ksYUFBYSxFQUFFLElBZG5CO1FBZUksU0FBUyxFQUFDLDBCQWZkO1FBZ0JJLGdCQUFnQixFQUFFLEtBQUtwSSxLQUFMLENBQVd3RixnQkFoQmpDO1FBaUJJLGFBQWEsRUFBRSxJQWpCbkI7UUFrQkksU0FBUyxFQUFFLEtBQUt4RSxLQUFMLENBQVdDLFNBbEIxQjtRQW1CSSxPQUFPLEVBQUUsS0FBS2pCLEtBQUwsQ0FBV2dELFlBQVgsRUFBeUJwQixLQUF6QixFQW5CYjtRQW9CSSxrQkFBa0IsRUFBRThGLGtCQXBCeEI7UUFxQkksbUJBQW1CLEVBQUUsS0FBSzFILEtBQUwsQ0FBV2lELDBCQXJCcEM7UUFzQkksdUJBQXVCLEVBQUUsS0FBS29GLGdCQXRCbEM7UUF1QkksbUJBQW1CLEVBQUUsS0FBS0M7TUF2QjlCLEVBRk8sQ0FBWDtJQTRCSCxDQXJDRCxNQXFDTztNQUNIWCxRQUFRLGdCQUFHO1FBQUssU0FBUyxFQUFDO01BQWYsZ0JBQ1AsNkJBQUMsZ0JBQUQsT0FETyxDQUFYO0lBR0g7O0lBRUQsb0JBQ0ksNkJBQUMsb0JBQUQsQ0FBYSxRQUFiO01BQXNCLEtBQUssa0NBQ3BCLEtBQUs5RixPQURlO1FBRXZCbEIscUJBQXFCLEVBQUVDLGtDQUFBLENBQXNCQyxNQUZ0QjtRQUd2QjBILFFBQVEsRUFBRSxLQUFLdkgsS0FBTCxDQUFXZ0IsTUFBWCxFQUFtQkksRUFITjtRQUl2Qk8sWUFBWSxFQUFFLEtBQUszQixLQUFMLEVBQVlnQixNQUFaLEVBQW9CZ0csV0FBcEIsRUFBaUNRLGVBQWpDLEVBSlM7UUFLdkI1RSxNQUFNLEVBQUUsS0FBSzVDLEtBQUwsQ0FBVzRDO01BTEk7SUFBM0IsZ0JBT0ksNkJBQUMsaUJBQUQ7TUFDSSxTQUFTLEVBQUMsOEJBRGQ7TUFFSSxPQUFPLEVBQUUsS0FBSzVELEtBQUwsQ0FBV3lJLE9BRnhCO01BR0ksc0JBQXNCLEVBQUUsSUFINUI7TUFJSSxNQUFNLEVBQUUsS0FBS0Msc0JBQUwsRUFKWjtNQUtJLEdBQUcsRUFBRSxLQUFLWixJQUxkO01BTUksU0FBUyxFQUFFLEtBQUthLFNBTnBCO01BT0ksTUFBTSxFQUFHOUUsRUFBRCxJQUFxQjtRQUN6QitFLHdCQUFBLENBQWdCQyxnQkFBaEIsQ0FBaUMseUJBQWpDLEVBQTREaEYsRUFBNUQ7TUFDSDtJQVRMLGdCQVdJLDZCQUFDLGlCQUFEO01BQ0ksTUFBTSxFQUFFLEtBQUtpRSxJQUFMLENBQVVwRyxPQUR0QjtNQUVJLGFBQWEsRUFBRSxLQUFLb0g7SUFGeEIsRUFYSixlQWVJO01BQUssU0FBUyxFQUFDO0lBQWYsR0FDTW5CLFFBRE4sQ0FmSixFQW1CTTdDLHdCQUFBLENBQWdCQyxjQUFoQixHQUFpQ2dFLGlCQUFqQyxDQUFtRDNELGNBQW5ELEVBQW1FNEQsTUFBbkUsR0FBNEUsQ0FBNUUsaUJBQ0UsNkJBQUMsa0JBQUQ7TUFBVyxJQUFJLEVBQUUsS0FBS2hKLEtBQUwsQ0FBV2lDLElBQTVCO01BQWtDLFFBQVEsRUFBRW1EO0lBQTVDLEVBcEJSLEVBdUJNLEtBQUtwRSxLQUFMLENBQVdnQixNQUFYLEVBQW1CZ0csV0FBbkIsaUJBQW1DLDZCQUFDLHdCQUFEO01BQ2pDLElBQUksRUFBRSxLQUFLaEksS0FBTCxDQUFXaUMsSUFEZ0I7TUFFakMsY0FBYyxFQUFFLEtBQUtqQyxLQUFMLENBQVdpSixjQUZNO01BR2pDLFFBQVEsRUFBRTdELGNBSHVCO01BSWpDLFlBQVksRUFBRSxLQUFLcEUsS0FBTCxDQUFXYyxZQUpRO01BS2pDLGdCQUFnQixFQUFFLEtBQUs5QixLQUFMLENBQVd3RixnQkFMSTtNQU1qQyxTQUFTLEVBQUUsS0FBS3hGLEtBQUwsQ0FBV2tKLFNBTlc7TUFPakMsT0FBTyxFQUFFO0lBUHdCLEVBdkJ6QyxDQVBKLENBREo7RUEyQ0g7O0FBclVtRTs7OzhCQUFuRHRKLFUsaUJBQ0l1SixvQiJ9