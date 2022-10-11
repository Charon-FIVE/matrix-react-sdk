"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _filter = require("matrix-js-sdk/src/filter");

var _event = require("matrix-js-sdk/src/models/event");

var _room = require("matrix-js-sdk/src/models/room");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _EventIndexPeg = _interopRequireDefault(require("../../indexing/EventIndexPeg"));

var _languageHandler = require("../../languageHandler");

var _SearchWarning = _interopRequireWildcard(require("../views/elements/SearchWarning"));

var _BaseCard = _interopRequireDefault(require("../views/right_panel/BaseCard"));

var _TimelinePanel = _interopRequireDefault(require("./TimelinePanel"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _Layout = require("../../settings/enums/Layout");

var _RoomContext = _interopRequireWildcard(require("../../contexts/RoomContext"));

var _Measured = _interopRequireDefault(require("../views/elements/Measured"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/*
 * Component which shows the filtered file using a TimelinePanel
 */
class FilePanel extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "decryptingEvents", new Set());
    (0, _defineProperty2.default)(this, "noRoom", void 0);
    (0, _defineProperty2.default)(this, "card", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "state", {
      timelineSet: null,
      narrow: false
    });
    (0, _defineProperty2.default)(this, "onRoomTimeline", (ev, room, toStartOfTimeline, removed, data) => {
      if (room?.roomId !== this.props?.roomId) return;
      if (toStartOfTimeline || !data || !data.liveEvent || ev.isRedacted()) return;

      const client = _MatrixClientPeg.MatrixClientPeg.get();

      client.decryptEventIfNeeded(ev);

      if (ev.isBeingDecrypted()) {
        this.decryptingEvents.add(ev.getId());
      } else {
        this.addEncryptedLiveEvent(ev);
      }
    });
    (0, _defineProperty2.default)(this, "onEventDecrypted", (ev, err) => {
      if (ev.getRoomId() !== this.props.roomId) return;
      const eventId = ev.getId();
      if (!this.decryptingEvents.delete(eventId)) return;
      if (err) return;
      this.addEncryptedLiveEvent(ev);
    });
    (0, _defineProperty2.default)(this, "onPaginationRequest", (timelineWindow, direction, limit) => {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const eventIndex = _EventIndexPeg.default.get();

      const roomId = this.props.roomId;
      const room = client.getRoom(roomId); // We override the pagination request for encrypted rooms so that we ask
      // the event index to fulfill the pagination request. Asking the server
      // to paginate won't ever work since the server can't correctly filter
      // out events containing URLs

      if (client.isRoomEncrypted(roomId) && eventIndex !== null) {
        return eventIndex.paginateTimelineWindow(room, timelineWindow, direction, limit);
      } else {
        return timelineWindow.paginate(direction, limit);
      }
    });
    (0, _defineProperty2.default)(this, "onMeasurement", narrow => {
      this.setState({
        narrow
      });
    });
  }

  addEncryptedLiveEvent(ev) {
    if (!this.state.timelineSet) return;
    const timeline = this.state.timelineSet.getLiveTimeline();
    if (ev.getType() !== "m.room.message") return;

    if (["m.file", "m.image", "m.video", "m.audio"].indexOf(ev.getContent().msgtype) == -1) {
      return;
    }

    if (!this.state.timelineSet.eventIdToTimeline(ev.getId())) {
      this.state.timelineSet.addEventToTimeline(ev, timeline, false);
    }
  }

  async componentDidMount() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    await this.updateTimelineSet(this.props.roomId);
    if (!_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(this.props.roomId)) return; // The timelineSets filter makes sure that encrypted events that contain
    // URLs never get added to the timeline, even if they are live events.
    // These methods are here to manually listen for such events and add
    // them despite the filter's best efforts.
    //
    // We do this only for encrypted rooms and if an event index exists,
    // this could be made more general in the future or the filter logic
    // could be fixed.

    if (_EventIndexPeg.default.get() !== null) {
      client.on(_room.RoomEvent.Timeline, this.onRoomTimeline);
      client.on(_event.MatrixEventEvent.Decrypted, this.onEventDecrypted);
    }
  }

  componentWillUnmount() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client === null) return;
    if (!_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(this.props.roomId)) return;

    if (_EventIndexPeg.default.get() !== null) {
      client.removeListener(_room.RoomEvent.Timeline, this.onRoomTimeline);
      client.removeListener(_event.MatrixEventEvent.Decrypted, this.onEventDecrypted);
    }
  }

  async fetchFileEventsServer(room) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const filter = new _filter.Filter(client.credentials.userId);
    filter.setDefinition({
      "room": {
        "timeline": {
          "contains_url": true,
          "types": ["m.room.message"]
        }
      }
    });
    const filterId = await client.getOrCreateFilter("FILTER_FILES_" + client.credentials.userId, filter);
    filter.filterId = filterId;
    const timelineSet = room.getOrCreateFilteredTimelineSet(filter);
    return timelineSet;
  }

  async updateTimelineSet(roomId) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(roomId);

    const eventIndex = _EventIndexPeg.default.get();

    this.noRoom = !room;

    if (room) {
      let timelineSet;

      try {
        timelineSet = await this.fetchFileEventsServer(room); // If this room is encrypted the file panel won't be populated
        // correctly since the defined filter doesn't support encrypted
        // events and the server can't check if encrypted events contain
        // URLs.
        //
        // This is where our event index comes into place, we ask the
        // event index to populate the timelineSet for us. This call
        // will add 10 events to the live timeline of the set. More can
        // be requested using pagination.

        if (client.isRoomEncrypted(roomId) && eventIndex !== null) {
          const timeline = timelineSet.getLiveTimeline();
          await eventIndex.populateFileTimeline(timelineSet, timeline, room, 10);
        }

        this.setState({
          timelineSet: timelineSet
        });
      } catch (error) {
        _logger.logger.error("Failed to get or create file panel filter", error);
      }
    } else {
      _logger.logger.error("Failed to add filtered timelineSet for FilePanel as no room!");
    }
  }

  render() {
    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
      return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
        className: "mx_FilePanel mx_RoomView_messageListWrapper",
        onClose: this.props.onClose
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomView_empty"
      }, (0, _languageHandler._t)("You must <a>register</a> to use this functionality", {}, {
        'a': sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "#/register",
          key: "sub"
        }, sub)
      })));
    } else if (this.noRoom) {
      return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
        className: "mx_FilePanel mx_RoomView_messageListWrapper",
        onClose: this.props.onClose
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomView_empty"
      }, (0, _languageHandler._t)("You must join the room to see its files")));
    } // wrap a TimelinePanel with the jump-to-event bits turned off.


    const emptyState = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RightPanel_empty mx_FilePanel_empty"
    }, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)('No files visible in this room')), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('Attach files from chat or just drag and drop them anywhere in a room.')));

    const isRoomEncrypted = this.noRoom ? false : _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(this.props.roomId);

    if (this.state.timelineSet) {
      return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
        value: _objectSpread(_objectSpread({}, this.context), {}, {
          timelineRenderingType: _RoomContext.TimelineRenderingType.File,
          narrow: this.state.narrow
        })
      }, /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
        className: "mx_FilePanel",
        onClose: this.props.onClose,
        withoutScrollContainer: true,
        ref: this.card
      }, /*#__PURE__*/_react.default.createElement(_Measured.default, {
        sensor: this.card.current,
        onMeasurement: this.onMeasurement
      }), /*#__PURE__*/_react.default.createElement(_SearchWarning.default, {
        isRoomEncrypted: isRoomEncrypted,
        kind: _SearchWarning.WarningKind.Files
      }), /*#__PURE__*/_react.default.createElement(_TimelinePanel.default, {
        manageReadReceipts: false,
        manageReadMarkers: false,
        timelineSet: this.state.timelineSet,
        showUrlPreview: false,
        onPaginationRequest: this.onPaginationRequest,
        resizeNotifier: this.props.resizeNotifier,
        empty: emptyState,
        layout: _Layout.Layout.Group
      })));
    } else {
      return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
        value: _objectSpread(_objectSpread({}, this.context), {}, {
          timelineRenderingType: _RoomContext.TimelineRenderingType.File
        })
      }, /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
        className: "mx_FilePanel",
        onClose: this.props.onClose
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null)));
    }
  }

}

(0, _defineProperty2.default)(FilePanel, "contextType", _RoomContext.default);
var _default = FilePanel;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWxlUGFuZWwiLCJSZWFjdCIsIkNvbXBvbmVudCIsIlNldCIsImNyZWF0ZVJlZiIsInRpbWVsaW5lU2V0IiwibmFycm93IiwiZXYiLCJyb29tIiwidG9TdGFydE9mVGltZWxpbmUiLCJyZW1vdmVkIiwiZGF0YSIsInJvb21JZCIsInByb3BzIiwibGl2ZUV2ZW50IiwiaXNSZWRhY3RlZCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImRlY3J5cHRFdmVudElmTmVlZGVkIiwiaXNCZWluZ0RlY3J5cHRlZCIsImRlY3J5cHRpbmdFdmVudHMiLCJhZGQiLCJnZXRJZCIsImFkZEVuY3J5cHRlZExpdmVFdmVudCIsImVyciIsImdldFJvb21JZCIsImV2ZW50SWQiLCJkZWxldGUiLCJ0aW1lbGluZVdpbmRvdyIsImRpcmVjdGlvbiIsImxpbWl0IiwiZXZlbnRJbmRleCIsIkV2ZW50SW5kZXhQZWciLCJnZXRSb29tIiwiaXNSb29tRW5jcnlwdGVkIiwicGFnaW5hdGVUaW1lbGluZVdpbmRvdyIsInBhZ2luYXRlIiwic2V0U3RhdGUiLCJzdGF0ZSIsInRpbWVsaW5lIiwiZ2V0TGl2ZVRpbWVsaW5lIiwiZ2V0VHlwZSIsImluZGV4T2YiLCJnZXRDb250ZW50IiwibXNndHlwZSIsImV2ZW50SWRUb1RpbWVsaW5lIiwiYWRkRXZlbnRUb1RpbWVsaW5lIiwiY29tcG9uZW50RGlkTW91bnQiLCJ1cGRhdGVUaW1lbGluZVNldCIsIm9uIiwiUm9vbUV2ZW50IiwiVGltZWxpbmUiLCJvblJvb21UaW1lbGluZSIsIk1hdHJpeEV2ZW50RXZlbnQiLCJEZWNyeXB0ZWQiLCJvbkV2ZW50RGVjcnlwdGVkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsImZldGNoRmlsZUV2ZW50c1NlcnZlciIsImZpbHRlciIsIkZpbHRlciIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwic2V0RGVmaW5pdGlvbiIsImZpbHRlcklkIiwiZ2V0T3JDcmVhdGVGaWx0ZXIiLCJnZXRPckNyZWF0ZUZpbHRlcmVkVGltZWxpbmVTZXQiLCJub1Jvb20iLCJwb3B1bGF0ZUZpbGVUaW1lbGluZSIsImVycm9yIiwibG9nZ2VyIiwicmVuZGVyIiwiaXNHdWVzdCIsIm9uQ2xvc2UiLCJfdCIsInN1YiIsImVtcHR5U3RhdGUiLCJjb250ZXh0IiwidGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiVGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiRmlsZSIsImNhcmQiLCJjdXJyZW50Iiwib25NZWFzdXJlbWVudCIsIldhcm5pbmdLaW5kIiwiRmlsZXMiLCJvblBhZ2luYXRpb25SZXF1ZXN0IiwicmVzaXplTm90aWZpZXIiLCJMYXlvdXQiLCJHcm91cCIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9GaWxlUGFuZWwudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTkgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEZpbHRlciB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2ZpbHRlcic7XG5pbXBvcnQgeyBFdmVudFRpbWVsaW5lU2V0LCBJUm9vbVRpbWVsaW5lRGF0YSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQtdGltZWxpbmUtc2V0XCI7XG5pbXBvcnQgeyBEaXJlY3Rpb24gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50LXRpbWVsaW5lXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCwgTWF0cml4RXZlbnRFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IFJvb20sIFJvb21FdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tJztcbmltcG9ydCB7IFRpbWVsaW5lV2luZG93IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvdGltZWxpbmUtd2luZG93JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBFdmVudEluZGV4UGVnIGZyb20gXCIuLi8uLi9pbmRleGluZy9FdmVudEluZGV4UGVnXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2VhcmNoV2FybmluZywgeyBXYXJuaW5nS2luZCB9IGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9TZWFyY2hXYXJuaW5nXCI7XG5pbXBvcnQgQmFzZUNhcmQgZnJvbSBcIi4uL3ZpZXdzL3JpZ2h0X3BhbmVsL0Jhc2VDYXJkXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSAnLi4vLi4vdXRpbHMvUmVzaXplTm90aWZpZXInO1xuaW1wb3J0IFRpbWVsaW5lUGFuZWwgZnJvbSBcIi4vVGltZWxpbmVQYW5lbFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCB7IExheW91dCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9lbnVtcy9MYXlvdXRcIjtcbmltcG9ydCBSb29tQ29udGV4dCwgeyBUaW1lbGluZVJlbmRlcmluZ1R5cGUgfSBmcm9tICcuLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dCc7XG5pbXBvcnQgTWVhc3VyZWQgZnJvbSAnLi4vdmlld3MvZWxlbWVudHMvTWVhc3VyZWQnO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tSWQ6IHN0cmluZztcbiAgICBvbkNsb3NlOiAoKSA9PiB2b2lkO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdGltZWxpbmVTZXQ6IEV2ZW50VGltZWxpbmVTZXQ7XG4gICAgbmFycm93OiBib29sZWFuO1xufVxuXG4vKlxuICogQ29tcG9uZW50IHdoaWNoIHNob3dzIHRoZSBmaWx0ZXJlZCBmaWxlIHVzaW5nIGEgVGltZWxpbmVQYW5lbFxuICovXG5jbGFzcyBGaWxlUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBSb29tQ29udGV4dDtcblxuICAgIC8vIFRoaXMgaXMgdXNlZCB0byB0cmFjayBpZiBhIGRlY3J5cHRlZCBldmVudCB3YXMgYSBsaXZlIGV2ZW50IGFuZCBzaG91bGQgYmVcbiAgICAvLyBhZGRlZCB0byB0aGUgdGltZWxpbmUuXG4gICAgcHJpdmF0ZSBkZWNyeXB0aW5nRXZlbnRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgcHVibGljIG5vUm9vbTogYm9vbGVhbjtcbiAgICBwcml2YXRlIGNhcmQgPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgdGltZWxpbmVTZXQ6IG51bGwsXG4gICAgICAgIG5hcnJvdzogZmFsc2UsXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tVGltZWxpbmUgPSAoXG4gICAgICAgIGV2OiBNYXRyaXhFdmVudCxcbiAgICAgICAgcm9vbTogUm9vbSB8IG51bGwsXG4gICAgICAgIHRvU3RhcnRPZlRpbWVsaW5lOiBib29sZWFuLFxuICAgICAgICByZW1vdmVkOiBib29sZWFuLFxuICAgICAgICBkYXRhOiBJUm9vbVRpbWVsaW5lRGF0YSxcbiAgICApOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHJvb20/LnJvb21JZCAhPT0gdGhpcy5wcm9wcz8ucm9vbUlkKSByZXR1cm47XG4gICAgICAgIGlmICh0b1N0YXJ0T2ZUaW1lbGluZSB8fCAhZGF0YSB8fCAhZGF0YS5saXZlRXZlbnQgfHwgZXYuaXNSZWRhY3RlZCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjbGllbnQuZGVjcnlwdEV2ZW50SWZOZWVkZWQoZXYpO1xuXG4gICAgICAgIGlmIChldi5pc0JlaW5nRGVjcnlwdGVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGVjcnlwdGluZ0V2ZW50cy5hZGQoZXYuZ2V0SWQoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZEVuY3J5cHRlZExpdmVFdmVudChldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkV2ZW50RGVjcnlwdGVkID0gKGV2OiBNYXRyaXhFdmVudCwgZXJyPzogYW55KTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChldi5nZXRSb29tSWQoKSAhPT0gdGhpcy5wcm9wcy5yb29tSWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IGV2LmdldElkKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmRlY3J5cHRpbmdFdmVudHMuZGVsZXRlKGV2ZW50SWQpKSByZXR1cm47XG4gICAgICAgIGlmIChlcnIpIHJldHVybjtcblxuICAgICAgICB0aGlzLmFkZEVuY3J5cHRlZExpdmVFdmVudChldik7XG4gICAgfTtcblxuICAgIHB1YmxpYyBhZGRFbmNyeXB0ZWRMaXZlRXZlbnQoZXY6IE1hdHJpeEV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS50aW1lbGluZVNldCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHRpbWVsaW5lID0gdGhpcy5zdGF0ZS50aW1lbGluZVNldC5nZXRMaXZlVGltZWxpbmUoKTtcbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSAhPT0gXCJtLnJvb20ubWVzc2FnZVwiKSByZXR1cm47XG4gICAgICAgIGlmIChbXCJtLmZpbGVcIiwgXCJtLmltYWdlXCIsIFwibS52aWRlb1wiLCBcIm0uYXVkaW9cIl0uaW5kZXhPZihldi5nZXRDb250ZW50KCkubXNndHlwZSkgPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS50aW1lbGluZVNldC5ldmVudElkVG9UaW1lbGluZShldi5nZXRJZCgpKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS50aW1lbGluZVNldC5hZGRFdmVudFRvVGltZWxpbmUoZXYsIHRpbWVsaW5lLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVRpbWVsaW5lU2V0KHRoaXMucHJvcHMucm9vbUlkKTtcblxuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQodGhpcy5wcm9wcy5yb29tSWQpKSByZXR1cm47XG5cbiAgICAgICAgLy8gVGhlIHRpbWVsaW5lU2V0cyBmaWx0ZXIgbWFrZXMgc3VyZSB0aGF0IGVuY3J5cHRlZCBldmVudHMgdGhhdCBjb250YWluXG4gICAgICAgIC8vIFVSTHMgbmV2ZXIgZ2V0IGFkZGVkIHRvIHRoZSB0aW1lbGluZSwgZXZlbiBpZiB0aGV5IGFyZSBsaXZlIGV2ZW50cy5cbiAgICAgICAgLy8gVGhlc2UgbWV0aG9kcyBhcmUgaGVyZSB0byBtYW51YWxseSBsaXN0ZW4gZm9yIHN1Y2ggZXZlbnRzIGFuZCBhZGRcbiAgICAgICAgLy8gdGhlbSBkZXNwaXRlIHRoZSBmaWx0ZXIncyBiZXN0IGVmZm9ydHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIGRvIHRoaXMgb25seSBmb3IgZW5jcnlwdGVkIHJvb21zIGFuZCBpZiBhbiBldmVudCBpbmRleCBleGlzdHMsXG4gICAgICAgIC8vIHRoaXMgY291bGQgYmUgbWFkZSBtb3JlIGdlbmVyYWwgaW4gdGhlIGZ1dHVyZSBvciB0aGUgZmlsdGVyIGxvZ2ljXG4gICAgICAgIC8vIGNvdWxkIGJlIGZpeGVkLlxuICAgICAgICBpZiAoRXZlbnRJbmRleFBlZy5nZXQoKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY2xpZW50Lm9uKFJvb21FdmVudC5UaW1lbGluZSwgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgICAgICAgICBjbGllbnQub24oTWF0cml4RXZlbnRFdmVudC5EZWNyeXB0ZWQsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaWVudCA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzUm9vbUVuY3J5cHRlZCh0aGlzLnByb3BzLnJvb21JZCkpIHJldHVybjtcblxuICAgICAgICBpZiAoRXZlbnRJbmRleFBlZy5nZXQoKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5UaW1lbGluZSwgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoTWF0cml4RXZlbnRFdmVudC5EZWNyeXB0ZWQsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZmV0Y2hGaWxlRXZlbnRzU2VydmVyKHJvb206IFJvb20pOiBQcm9taXNlPEV2ZW50VGltZWxpbmVTZXQ+IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIGNvbnN0IGZpbHRlciA9IG5ldyBGaWx0ZXIoY2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCk7XG4gICAgICAgIGZpbHRlci5zZXREZWZpbml0aW9uKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwicm9vbVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwidGltZWxpbmVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250YWluc191cmxcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZXNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibS5yb29tLm1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZmlsdGVySWQgPSBhd2FpdCBjbGllbnQuZ2V0T3JDcmVhdGVGaWx0ZXIoXCJGSUxURVJfRklMRVNfXCIgKyBjbGllbnQuY3JlZGVudGlhbHMudXNlcklkLCBmaWx0ZXIpO1xuICAgICAgICBmaWx0ZXIuZmlsdGVySWQgPSBmaWx0ZXJJZDtcbiAgICAgICAgY29uc3QgdGltZWxpbmVTZXQgPSByb29tLmdldE9yQ3JlYXRlRmlsdGVyZWRUaW1lbGluZVNldChmaWx0ZXIpO1xuXG4gICAgICAgIHJldHVybiB0aW1lbGluZVNldDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGFnaW5hdGlvblJlcXVlc3QgPSAoXG4gICAgICAgIHRpbWVsaW5lV2luZG93OiBUaW1lbGluZVdpbmRvdyxcbiAgICAgICAgZGlyZWN0aW9uOiBEaXJlY3Rpb24sXG4gICAgICAgIGxpbWl0OiBudW1iZXIsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMucHJvcHMucm9vbUlkO1xuXG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuXG4gICAgICAgIC8vIFdlIG92ZXJyaWRlIHRoZSBwYWdpbmF0aW9uIHJlcXVlc3QgZm9yIGVuY3J5cHRlZCByb29tcyBzbyB0aGF0IHdlIGFza1xuICAgICAgICAvLyB0aGUgZXZlbnQgaW5kZXggdG8gZnVsZmlsbCB0aGUgcGFnaW5hdGlvbiByZXF1ZXN0LiBBc2tpbmcgdGhlIHNlcnZlclxuICAgICAgICAvLyB0byBwYWdpbmF0ZSB3b24ndCBldmVyIHdvcmsgc2luY2UgdGhlIHNlcnZlciBjYW4ndCBjb3JyZWN0bHkgZmlsdGVyXG4gICAgICAgIC8vIG91dCBldmVudHMgY29udGFpbmluZyBVUkxzXG4gICAgICAgIGlmIChjbGllbnQuaXNSb29tRW5jcnlwdGVkKHJvb21JZCkgJiYgZXZlbnRJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGV2ZW50SW5kZXgucGFnaW5hdGVUaW1lbGluZVdpbmRvdyhyb29tLCB0aW1lbGluZVdpbmRvdywgZGlyZWN0aW9uLCBsaW1pdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGltZWxpbmVXaW5kb3cucGFnaW5hdGUoZGlyZWN0aW9uLCBsaW1pdCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1lYXN1cmVtZW50ID0gKG5hcnJvdzogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbmFycm93IH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlVGltZWxpbmVTZXQocm9vbUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG5cbiAgICAgICAgdGhpcy5ub1Jvb20gPSAhcm9vbTtcblxuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgbGV0IHRpbWVsaW5lU2V0O1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lU2V0ID0gYXdhaXQgdGhpcy5mZXRjaEZpbGVFdmVudHNTZXJ2ZXIocm9vbSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIHJvb20gaXMgZW5jcnlwdGVkIHRoZSBmaWxlIHBhbmVsIHdvbid0IGJlIHBvcHVsYXRlZFxuICAgICAgICAgICAgICAgIC8vIGNvcnJlY3RseSBzaW5jZSB0aGUgZGVmaW5lZCBmaWx0ZXIgZG9lc24ndCBzdXBwb3J0IGVuY3J5cHRlZFxuICAgICAgICAgICAgICAgIC8vIGV2ZW50cyBhbmQgdGhlIHNlcnZlciBjYW4ndCBjaGVjayBpZiBlbmNyeXB0ZWQgZXZlbnRzIGNvbnRhaW5cbiAgICAgICAgICAgICAgICAvLyBVUkxzLlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB3aGVyZSBvdXIgZXZlbnQgaW5kZXggY29tZXMgaW50byBwbGFjZSwgd2UgYXNrIHRoZVxuICAgICAgICAgICAgICAgIC8vIGV2ZW50IGluZGV4IHRvIHBvcHVsYXRlIHRoZSB0aW1lbGluZVNldCBmb3IgdXMuIFRoaXMgY2FsbFxuICAgICAgICAgICAgICAgIC8vIHdpbGwgYWRkIDEwIGV2ZW50cyB0byB0aGUgbGl2ZSB0aW1lbGluZSBvZiB0aGUgc2V0LiBNb3JlIGNhblxuICAgICAgICAgICAgICAgIC8vIGJlIHJlcXVlc3RlZCB1c2luZyBwYWdpbmF0aW9uLlxuICAgICAgICAgICAgICAgIGlmIChjbGllbnQuaXNSb29tRW5jcnlwdGVkKHJvb21JZCkgJiYgZXZlbnRJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lbGluZSA9IHRpbWVsaW5lU2V0LmdldExpdmVUaW1lbGluZSgpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBldmVudEluZGV4LnBvcHVsYXRlRmlsZVRpbWVsaW5lKHRpbWVsaW5lU2V0LCB0aW1lbGluZSwgcm9vbSwgMTApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0aW1lbGluZVNldDogdGltZWxpbmVTZXQgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBnZXQgb3IgY3JlYXRlIGZpbGUgcGFuZWwgZmlsdGVyXCIsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBhZGQgZmlsdGVyZWQgdGltZWxpbmVTZXQgZm9yIEZpbGVQYW5lbCBhcyBubyByb29tIVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gPEJhc2VDYXJkXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRmlsZVBhbmVsIG14X1Jvb21WaWV3X21lc3NhZ2VMaXN0V3JhcHBlclwiXG4gICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5wcm9wcy5vbkNsb3NlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfZW1wdHlcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdSBtdXN0IDxhPnJlZ2lzdGVyPC9hPiB0byB1c2UgdGhpcyBmdW5jdGlvbmFsaXR5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgJ2EnOiAoc3ViKSA9PiA8YSBocmVmPVwiIy9yZWdpc3RlclwiIGtleT1cInN1YlwiPnsgc3ViIH08L2E+IH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZUNhcmQ+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubm9Sb29tKSB7XG4gICAgICAgICAgICByZXR1cm4gPEJhc2VDYXJkXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRmlsZVBhbmVsIG14X1Jvb21WaWV3X21lc3NhZ2VMaXN0V3JhcHBlclwiXG4gICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5wcm9wcy5vbkNsb3NlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfZW1wdHlcIj57IF90KFwiWW91IG11c3Qgam9pbiB0aGUgcm9vbSB0byBzZWUgaXRzIGZpbGVzXCIpIH08L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZUNhcmQ+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd3JhcCBhIFRpbWVsaW5lUGFuZWwgd2l0aCB0aGUganVtcC10by1ldmVudCBiaXRzIHR1cm5lZCBvZmYuXG5cbiAgICAgICAgY29uc3QgZW1wdHlTdGF0ZSA9ICg8ZGl2IGNsYXNzTmFtZT1cIm14X1JpZ2h0UGFuZWxfZW1wdHkgbXhfRmlsZVBhbmVsX2VtcHR5XCI+XG4gICAgICAgICAgICA8aDI+eyBfdCgnTm8gZmlsZXMgdmlzaWJsZSBpbiB0aGlzIHJvb20nKSB9PC9oMj5cbiAgICAgICAgICAgIDxwPnsgX3QoJ0F0dGFjaCBmaWxlcyBmcm9tIGNoYXQgb3IganVzdCBkcmFnIGFuZCBkcm9wIHRoZW0gYW55d2hlcmUgaW4gYSByb29tLicpIH08L3A+XG4gICAgICAgIDwvZGl2Pik7XG5cbiAgICAgICAgY29uc3QgaXNSb29tRW5jcnlwdGVkID0gdGhpcy5ub1Jvb20gPyBmYWxzZSA6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQodGhpcy5wcm9wcy5yb29tSWQpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRpbWVsaW5lU2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxSb29tQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17e1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVsaW5lUmVuZGVyaW5nVHlwZTogVGltZWxpbmVSZW5kZXJpbmdUeXBlLkZpbGUsXG4gICAgICAgICAgICAgICAgICAgIG5hcnJvdzogdGhpcy5zdGF0ZS5uYXJyb3csXG4gICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQ2FyZFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRmlsZVBhbmVsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMucHJvcHMub25DbG9zZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpdGhvdXRTY3JvbGxDb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5jYXJkfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8TWVhc3VyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5zb3I9e3RoaXMuY2FyZC5jdXJyZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTWVhc3VyZW1lbnQ9e3RoaXMub25NZWFzdXJlbWVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2VhcmNoV2FybmluZyBpc1Jvb21FbmNyeXB0ZWQ9e2lzUm9vbUVuY3J5cHRlZH0ga2luZD17V2FybmluZ0tpbmQuRmlsZXN9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VGltZWxpbmVQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hbmFnZVJlYWRSZWNlaXB0cz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFuYWdlUmVhZE1hcmtlcnM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVsaW5lU2V0PXt0aGlzLnN0YXRlLnRpbWVsaW5lU2V0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dVcmxQcmV2aWV3PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblBhZ2luYXRpb25SZXF1ZXN0PXt0aGlzLm9uUGFnaW5hdGlvblJlcXVlc3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHk9e2VtcHR5U3RhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0PXtMYXlvdXQuR3JvdXB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L0Jhc2VDYXJkPlxuICAgICAgICAgICAgICAgIDwvUm9vbUNvbnRleHQuUHJvdmlkZXI+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8Um9vbUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3tcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5GaWxlLFxuICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICA8QmFzZUNhcmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0ZpbGVQYW5lbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLnByb3BzLm9uQ2xvc2V9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvQmFzZUNhcmQ+XG4gICAgICAgICAgICAgICAgPC9Sb29tQ29udGV4dC5Qcm92aWRlcj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpbGVQYW5lbDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FB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