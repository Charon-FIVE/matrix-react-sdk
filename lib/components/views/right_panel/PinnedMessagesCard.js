"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReadPinnedEvents = exports.usePinnedEvents = exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _room = require("matrix-js-sdk/src/models/room");

var _event = require("matrix-js-sdk/src/models/event");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _contextMenu = require("../../../../res/img/element-icons/context-menu.svg");

var _emoji = require("../../../../res/img/element-icons/room/message-bar/emoji.svg");

var _reply = require("../../../../res/img/element-icons/room/message-bar/reply.svg");

var _languageHandler = require("../../../languageHandler");

var _BaseCard = _interopRequireDefault(require("./BaseCard"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _PinningUtils = _interopRequireDefault(require("../../../utils/PinningUtils"));

var _useAsyncMemo = require("../../../hooks/useAsyncMemo");

var _PinnedEventTile = _interopRequireDefault(require("../rooms/PinnedEventTile"));

var _useRoomState = require("../../../hooks/useRoomState");

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _types = require("./types");

var _Heading = _interopRequireDefault(require("../typography/Heading"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const usePinnedEvents = room => {
  const [pinnedEvents, setPinnedEvents] = (0, _react.useState)([]);
  const update = (0, _react.useCallback)(ev => {
    if (!room) return;
    if (ev && ev.getType() !== _event2.EventType.RoomPinnedEvents) return;
    setPinnedEvents(room.currentState.getStateEvents(_event2.EventType.RoomPinnedEvents, "")?.getContent()?.pinned || []);
  }, [room]);
  (0, _useEventEmitter.useTypedEventEmitter)(room?.currentState, _roomState.RoomStateEvent.Events, update);
  (0, _react.useEffect)(() => {
    update();
    return () => {
      setPinnedEvents([]);
    };
  }, [update]);
  return pinnedEvents;
};

exports.usePinnedEvents = usePinnedEvents;

const useReadPinnedEvents = room => {
  const [readPinnedEvents, setReadPinnedEvents] = (0, _react.useState)(new Set());
  const update = (0, _react.useCallback)(ev => {
    if (!room) return;
    if (ev && ev.getType() !== _types.ReadPinsEventId) return;
    const readPins = room.getAccountData(_types.ReadPinsEventId)?.getContent()?.event_ids;
    setReadPinnedEvents(new Set(readPins || []));
  }, [room]);
  (0, _useEventEmitter.useTypedEventEmitter)(room, _room.RoomEvent.AccountData, update);
  (0, _react.useEffect)(() => {
    update();
    return () => {
      setReadPinnedEvents(new Set());
    };
  }, [update]);
  return readPinnedEvents;
};

exports.useReadPinnedEvents = useReadPinnedEvents;

const PinnedMessagesCard = _ref => {
  let {
    room,
    onClose,
    permalinkCreator
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const roomContext = (0, _react.useContext)(_RoomContext.default);
  const canUnpin = (0, _useRoomState.useRoomState)(room, state => state.mayClientSendStateEvent(_event2.EventType.RoomPinnedEvents, cli));
  const pinnedEventIds = usePinnedEvents(room);
  const readPinnedEvents = useReadPinnedEvents(room);
  (0, _react.useEffect)(() => {
    const newlyRead = pinnedEventIds.filter(id => !readPinnedEvents.has(id));

    if (newlyRead.length > 0) {
      // clear out any read pinned events which no longer are pinned
      cli.setRoomAccountData(room.roomId, _types.ReadPinsEventId, {
        event_ids: pinnedEventIds
      });
    }
  }, [cli, room.roomId, pinnedEventIds, readPinnedEvents]);
  const pinnedEvents = (0, _useAsyncMemo.useAsyncMemo)(() => {
    const promises = pinnedEventIds.map(async eventId => {
      const timelineSet = room.getUnfilteredTimelineSet();
      const localEvent = timelineSet?.getTimelineForEvent(eventId)?.getEvents().find(e => e.getId() === eventId);
      if (localEvent) return _PinningUtils.default.isPinnable(localEvent) ? localEvent : null;

      try {
        // Fetch the event and latest edit in parallel
        const [evJson, {
          events: [edit]
        }] = await Promise.all([cli.fetchRoomEvent(room.roomId, eventId), cli.relations(room.roomId, eventId, _event2.RelationType.Replace, null, {
          limit: 1
        })]);
        const event = new _event.MatrixEvent(evJson);

        if (event.isEncrypted()) {
          await cli.decryptEventIfNeeded(event); // TODO await?
        }

        if (event && _PinningUtils.default.isPinnable(event)) {
          // Inject sender information
          event.sender = room.getMember(event.getSender()); // Also inject any edits we've found

          if (edit) event.makeReplaced(edit);
          return event;
        }
      } catch (err) {
        _logger.logger.error("Error looking up pinned event " + eventId + " in room " + room.roomId);

        _logger.logger.error(err);
      }

      return null;
    });
    return Promise.all(promises);
  }, [cli, room, pinnedEventIds], null);
  let content;

  if (!pinnedEvents) {
    content = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
  } else if (pinnedEvents.length > 0) {
    const onUnpinClicked = async event => {
      const pinnedEvents = room.currentState.getStateEvents(_event2.EventType.RoomPinnedEvents, "");

      if (pinnedEvents?.getContent()?.pinned) {
        const pinned = pinnedEvents.getContent().pinned;
        const index = pinned.indexOf(event.getId());

        if (index !== -1) {
          pinned.splice(index, 1);
          await cli.sendStateEvent(room.roomId, _event2.EventType.RoomPinnedEvents, {
            pinned
          }, "");
        }
      }
    }; // show them in reverse, with latest pinned at the top


    content = pinnedEvents.filter(Boolean).reverse().map(ev => /*#__PURE__*/_react.default.createElement(_PinnedEventTile.default, {
      key: ev.getId(),
      event: ev,
      onUnpinClicked: canUnpin ? () => onUnpinClicked(ev) : undefined,
      permalinkCreator: permalinkCreator
    }));
  } else {
    content = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PinnedMessagesCard_empty_wrapper"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PinnedMessagesCard_empty"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageActionBar mx_PinnedMessagesCard_MessageActionBar"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageActionBar_iconButton"
    }, /*#__PURE__*/_react.default.createElement(_emoji.Icon, null)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageActionBar_iconButton"
    }, /*#__PURE__*/_react.default.createElement(_reply.Icon, null)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageActionBar_iconButton mx_MessageActionBar_optionsButton"
    }, /*#__PURE__*/_react.default.createElement(_contextMenu.Icon, null))), /*#__PURE__*/_react.default.createElement(_Heading.default, {
      size: "h4",
      className: "mx_PinnedMessagesCard_empty_header"
    }, (0, _languageHandler._t)("Nothing pinned, yet")), (0, _languageHandler._t)("If you have permissions, open the menu on any message and select " + "<b>Pin</b> to stick them here.", {}, {
      b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
    })));
  }

  return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
    header: /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_BaseCard_header_title"
    }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
      size: "h4",
      className: "mx_BaseCard_header_title_heading"
    }, (0, _languageHandler._t)("Pinned messages"))),
    className: "mx_PinnedMessagesCard",
    onClose: onClose
  }, /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
    value: _objectSpread(_objectSpread({}, roomContext), {}, {
      timelineRenderingType: _RoomContext.TimelineRenderingType.Pinned
    })
  }, content));
};

var _default = PinnedMessagesCard;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VQaW5uZWRFdmVudHMiLCJyb29tIiwicGlubmVkRXZlbnRzIiwic2V0UGlubmVkRXZlbnRzIiwidXNlU3RhdGUiLCJ1cGRhdGUiLCJ1c2VDYWxsYmFjayIsImV2IiwiZ2V0VHlwZSIsIkV2ZW50VHlwZSIsIlJvb21QaW5uZWRFdmVudHMiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsImdldENvbnRlbnQiLCJwaW5uZWQiLCJ1c2VUeXBlZEV2ZW50RW1pdHRlciIsIlJvb21TdGF0ZUV2ZW50IiwiRXZlbnRzIiwidXNlRWZmZWN0IiwidXNlUmVhZFBpbm5lZEV2ZW50cyIsInJlYWRQaW5uZWRFdmVudHMiLCJzZXRSZWFkUGlubmVkRXZlbnRzIiwiU2V0IiwiUmVhZFBpbnNFdmVudElkIiwicmVhZFBpbnMiLCJnZXRBY2NvdW50RGF0YSIsImV2ZW50X2lkcyIsIlJvb21FdmVudCIsIkFjY291bnREYXRhIiwiUGlubmVkTWVzc2FnZXNDYXJkIiwib25DbG9zZSIsInBlcm1hbGlua0NyZWF0b3IiLCJjbGkiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsInJvb21Db250ZXh0IiwiUm9vbUNvbnRleHQiLCJjYW5VbnBpbiIsInVzZVJvb21TdGF0ZSIsInN0YXRlIiwibWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQiLCJwaW5uZWRFdmVudElkcyIsIm5ld2x5UmVhZCIsImZpbHRlciIsImlkIiwiaGFzIiwibGVuZ3RoIiwic2V0Um9vbUFjY291bnREYXRhIiwicm9vbUlkIiwidXNlQXN5bmNNZW1vIiwicHJvbWlzZXMiLCJtYXAiLCJldmVudElkIiwidGltZWxpbmVTZXQiLCJnZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQiLCJsb2NhbEV2ZW50IiwiZ2V0VGltZWxpbmVGb3JFdmVudCIsImdldEV2ZW50cyIsImZpbmQiLCJlIiwiZ2V0SWQiLCJQaW5uaW5nVXRpbHMiLCJpc1Bpbm5hYmxlIiwiZXZKc29uIiwiZXZlbnRzIiwiZWRpdCIsIlByb21pc2UiLCJhbGwiLCJmZXRjaFJvb21FdmVudCIsInJlbGF0aW9ucyIsIlJlbGF0aW9uVHlwZSIsIlJlcGxhY2UiLCJsaW1pdCIsImV2ZW50IiwiTWF0cml4RXZlbnQiLCJpc0VuY3J5cHRlZCIsImRlY3J5cHRFdmVudElmTmVlZGVkIiwic2VuZGVyIiwiZ2V0TWVtYmVyIiwiZ2V0U2VuZGVyIiwibWFrZVJlcGxhY2VkIiwiZXJyIiwibG9nZ2VyIiwiZXJyb3IiLCJjb250ZW50Iiwib25VbnBpbkNsaWNrZWQiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJzZW5kU3RhdGVFdmVudCIsIkJvb2xlYW4iLCJyZXZlcnNlIiwidW5kZWZpbmVkIiwiX3QiLCJiIiwic3ViIiwidGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiVGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiUGlubmVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvcmlnaHRfcGFuZWwvUGlubmVkTWVzc2FnZXNDYXJkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZUNvbnRleHQsIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20sIFJvb21FdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBFdmVudFR5cGUsIFJlbGF0aW9uVHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBSb29tU3RhdGVFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1zdGF0ZVwiO1xuXG5pbXBvcnQgeyBJY29uIGFzIENvbnRleHRNZW51SWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9jb250ZXh0LW1lbnUuc3ZnJztcbmltcG9ydCB7IEljb24gYXMgRW1vamlJY29uIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9yb29tL21lc3NhZ2UtYmFyL2Vtb2ppLnN2Z1wiO1xuaW1wb3J0IHsgSWNvbiBhcyBSZXBseUljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvcm9vbS9tZXNzYWdlLWJhci9yZXBseS5zdmcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgQmFzZUNhcmQgZnJvbSBcIi4vQmFzZUNhcmRcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHsgdXNlVHlwZWRFdmVudEVtaXR0ZXIgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQgUGlubmluZ1V0aWxzIGZyb20gXCIuLi8uLi8uLi91dGlscy9QaW5uaW5nVXRpbHNcIjtcbmltcG9ydCB7IHVzZUFzeW5jTWVtbyB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VBc3luY01lbW9cIjtcbmltcG9ydCBQaW5uZWRFdmVudFRpbGUgZnJvbSBcIi4uL3Jvb21zL1Bpbm5lZEV2ZW50VGlsZVwiO1xuaW1wb3J0IHsgdXNlUm9vbVN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVJvb21TdGF0ZVwiO1xuaW1wb3J0IFJvb21Db250ZXh0LCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IHsgUmVhZFBpbnNFdmVudElkIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCBIZWFkaW5nIGZyb20gJy4uL3R5cG9ncmFwaHkvSGVhZGluZyc7XG5pbXBvcnQgeyBSb29tUGVybWFsaW5rQ3JlYXRvciB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbiAgICBwZXJtYWxpbmtDcmVhdG9yOiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbiAgICBvbkNsb3NlKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCB1c2VQaW5uZWRFdmVudHMgPSAocm9vbTogUm9vbSk6IHN0cmluZ1tdID0+IHtcbiAgICBjb25zdCBbcGlubmVkRXZlbnRzLCBzZXRQaW5uZWRFdmVudHNdID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKTtcblxuICAgIGNvbnN0IHVwZGF0ZSA9IHVzZUNhbGxiYWNrKChldj86IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghcm9vbSkgcmV0dXJuO1xuICAgICAgICBpZiAoZXYgJiYgZXYuZ2V0VHlwZSgpICE9PSBFdmVudFR5cGUuUm9vbVBpbm5lZEV2ZW50cykgcmV0dXJuO1xuICAgICAgICBzZXRQaW5uZWRFdmVudHMocm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21QaW5uZWRFdmVudHMsIFwiXCIpPy5nZXRDb250ZW50KCk/LnBpbm5lZCB8fCBbXSk7XG4gICAgfSwgW3Jvb21dKTtcblxuICAgIHVzZVR5cGVkRXZlbnRFbWl0dGVyKHJvb20/LmN1cnJlbnRTdGF0ZSwgUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB1cGRhdGUpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGlubmVkRXZlbnRzKFtdKTtcbiAgICAgICAgfTtcbiAgICB9LCBbdXBkYXRlXSk7XG4gICAgcmV0dXJuIHBpbm5lZEV2ZW50cztcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VSZWFkUGlubmVkRXZlbnRzID0gKHJvb206IFJvb20pOiBTZXQ8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgW3JlYWRQaW5uZWRFdmVudHMsIHNldFJlYWRQaW5uZWRFdmVudHNdID0gdXNlU3RhdGU8U2V0PHN0cmluZz4+KG5ldyBTZXQoKSk7XG5cbiAgICBjb25zdCB1cGRhdGUgPSB1c2VDYWxsYmFjaygoZXY/OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBpZiAoIXJvb20pIHJldHVybjtcbiAgICAgICAgaWYgKGV2ICYmIGV2LmdldFR5cGUoKSAhPT0gUmVhZFBpbnNFdmVudElkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHJlYWRQaW5zID0gcm9vbS5nZXRBY2NvdW50RGF0YShSZWFkUGluc0V2ZW50SWQpPy5nZXRDb250ZW50KCk/LmV2ZW50X2lkcztcbiAgICAgICAgc2V0UmVhZFBpbm5lZEV2ZW50cyhuZXcgU2V0KHJlYWRQaW5zIHx8IFtdKSk7XG4gICAgfSwgW3Jvb21dKTtcblxuICAgIHVzZVR5cGVkRXZlbnRFbWl0dGVyKHJvb20sIFJvb21FdmVudC5BY2NvdW50RGF0YSwgdXBkYXRlKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHNldFJlYWRQaW5uZWRFdmVudHMobmV3IFNldCgpKTtcbiAgICAgICAgfTtcbiAgICB9LCBbdXBkYXRlXSk7XG4gICAgcmV0dXJuIHJlYWRQaW5uZWRFdmVudHM7XG59O1xuXG5jb25zdCBQaW5uZWRNZXNzYWdlc0NhcmQgPSAoeyByb29tLCBvbkNsb3NlLCBwZXJtYWxpbmtDcmVhdG9yIH06IElQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3Qgcm9vbUNvbnRleHQgPSB1c2VDb250ZXh0KFJvb21Db250ZXh0KTtcbiAgICBjb25zdCBjYW5VbnBpbiA9IHVzZVJvb21TdGF0ZShyb29tLCBzdGF0ZSA9PiBzdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuUm9vbVBpbm5lZEV2ZW50cywgY2xpKSk7XG4gICAgY29uc3QgcGlubmVkRXZlbnRJZHMgPSB1c2VQaW5uZWRFdmVudHMocm9vbSk7XG4gICAgY29uc3QgcmVhZFBpbm5lZEV2ZW50cyA9IHVzZVJlYWRQaW5uZWRFdmVudHMocm9vbSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdseVJlYWQgPSBwaW5uZWRFdmVudElkcy5maWx0ZXIoaWQgPT4gIXJlYWRQaW5uZWRFdmVudHMuaGFzKGlkKSk7XG4gICAgICAgIGlmIChuZXdseVJlYWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gY2xlYXIgb3V0IGFueSByZWFkIHBpbm5lZCBldmVudHMgd2hpY2ggbm8gbG9uZ2VyIGFyZSBwaW5uZWRcbiAgICAgICAgICAgIGNsaS5zZXRSb29tQWNjb3VudERhdGEocm9vbS5yb29tSWQsIFJlYWRQaW5zRXZlbnRJZCwge1xuICAgICAgICAgICAgICAgIGV2ZW50X2lkczogcGlubmVkRXZlbnRJZHMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtjbGksIHJvb20ucm9vbUlkLCBwaW5uZWRFdmVudElkcywgcmVhZFBpbm5lZEV2ZW50c10pO1xuXG4gICAgY29uc3QgcGlubmVkRXZlbnRzID0gdXNlQXN5bmNNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBwaW5uZWRFdmVudElkcy5tYXAoYXN5bmMgZXZlbnRJZCA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aW1lbGluZVNldCA9IHJvb20uZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0KCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbEV2ZW50ID0gdGltZWxpbmVTZXQ/LmdldFRpbWVsaW5lRm9yRXZlbnQoZXZlbnRJZCk/LmdldEV2ZW50cygpLmZpbmQoZSA9PiBlLmdldElkKCkgPT09IGV2ZW50SWQpO1xuICAgICAgICAgICAgaWYgKGxvY2FsRXZlbnQpIHJldHVybiBQaW5uaW5nVXRpbHMuaXNQaW5uYWJsZShsb2NhbEV2ZW50KSA/IGxvY2FsRXZlbnQgOiBudWxsO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIEZldGNoIHRoZSBldmVudCBhbmQgbGF0ZXN0IGVkaXQgaW4gcGFyYWxsZWxcbiAgICAgICAgICAgICAgICBjb25zdCBbZXZKc29uLCB7IGV2ZW50czogW2VkaXRdIH1dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgICAgICBjbGkuZmV0Y2hSb29tRXZlbnQocm9vbS5yb29tSWQsIGV2ZW50SWQpLFxuICAgICAgICAgICAgICAgICAgICBjbGkucmVsYXRpb25zKHJvb20ucm9vbUlkLCBldmVudElkLCBSZWxhdGlvblR5cGUuUmVwbGFjZSwgbnVsbCwgeyBsaW1pdDogMSB9KSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBNYXRyaXhFdmVudChldkpzb24pO1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5pc0VuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5kZWNyeXB0RXZlbnRJZk5lZWRlZChldmVudCk7IC8vIFRPRE8gYXdhaXQ/XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50ICYmIFBpbm5pbmdVdGlscy5pc1Bpbm5hYmxlKGV2ZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbmplY3Qgc2VuZGVyIGluZm9ybWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnNlbmRlciA9IHJvb20uZ2V0TWVtYmVyKGV2ZW50LmdldFNlbmRlcigpKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBpbmplY3QgYW55IGVkaXRzIHdlJ3ZlIGZvdW5kXG4gICAgICAgICAgICAgICAgICAgIGlmIChlZGl0KSBldmVudC5tYWtlUmVwbGFjZWQoZWRpdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIGxvb2tpbmcgdXAgcGlubmVkIGV2ZW50IFwiICsgZXZlbnRJZCArIFwiIGluIHJvb20gXCIgKyByb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICB9LCBbY2xpLCByb29tLCBwaW5uZWRFdmVudElkc10sIG51bGwpO1xuXG4gICAgbGV0IGNvbnRlbnQ7XG4gICAgaWYgKCFwaW5uZWRFdmVudHMpIHtcbiAgICAgICAgY29udGVudCA9IDxTcGlubmVyIC8+O1xuICAgIH0gZWxzZSBpZiAocGlubmVkRXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qgb25VbnBpbkNsaWNrZWQgPSBhc3luYyAoZXZlbnQ6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwaW5uZWRFdmVudHMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbVBpbm5lZEV2ZW50cywgXCJcIik7XG4gICAgICAgICAgICBpZiAocGlubmVkRXZlbnRzPy5nZXRDb250ZW50KCk/LnBpbm5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBpbm5lZCA9IHBpbm5lZEV2ZW50cy5nZXRDb250ZW50KCkucGlubmVkO1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcGlubmVkLmluZGV4T2YoZXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBwaW5uZWQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnNlbmRTdGF0ZUV2ZW50KHJvb20ucm9vbUlkLCBFdmVudFR5cGUuUm9vbVBpbm5lZEV2ZW50cywgeyBwaW5uZWQgfSwgXCJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHNob3cgdGhlbSBpbiByZXZlcnNlLCB3aXRoIGxhdGVzdCBwaW5uZWQgYXQgdGhlIHRvcFxuICAgICAgICBjb250ZW50ID0gcGlubmVkRXZlbnRzLmZpbHRlcihCb29sZWFuKS5yZXZlcnNlKCkubWFwKGV2ID0+IChcbiAgICAgICAgICAgIDxQaW5uZWRFdmVudFRpbGVcbiAgICAgICAgICAgICAgICBrZXk9e2V2LmdldElkKCl9XG4gICAgICAgICAgICAgICAgZXZlbnQ9e2V2fVxuICAgICAgICAgICAgICAgIG9uVW5waW5DbGlja2VkPXtjYW5VbnBpbiA/ICgpID0+IG9uVW5waW5DbGlja2VkKGV2KSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXtwZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29udGVudCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUGlubmVkTWVzc2FnZXNDYXJkX2VtcHR5X3dyYXBwZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUGlubmVkTWVzc2FnZXNDYXJkX2VtcHR5XCI+XG4gICAgICAgICAgICAgICAgeyAvKiBYWFg6IFdlIHJldXNlIHRoZSBjbGFzc2VzIGZvciBzaW1wbGljaXR5LCBidXQgZGVsaWJlcmF0ZWx5IG5vdCB0aGUgY29tcG9uZW50cyBmb3Igbm9uLWludGVyYWN0aXZpdHkuICovIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXIgbXhfUGlubmVkTWVzc2FnZXNDYXJkX01lc3NhZ2VBY3Rpb25CYXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZXNzYWdlQWN0aW9uQmFyX2ljb25CdXR0b25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxFbW9qaUljb24gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUFjdGlvbkJhcl9pY29uQnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8UmVwbHlJY29uIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXJfaWNvbkJ1dHRvbiBteF9NZXNzYWdlQWN0aW9uQmFyX29wdGlvbnNCdXR0b25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudUljb24gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8SGVhZGluZyBzaXplPVwiaDRcIiBjbGFzc05hbWU9XCJteF9QaW5uZWRNZXNzYWdlc0NhcmRfZW1wdHlfaGVhZGVyXCI+eyBfdChcIk5vdGhpbmcgcGlubmVkLCB5ZXRcIikgfTwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICB7IF90KFwiSWYgeW91IGhhdmUgcGVybWlzc2lvbnMsIG9wZW4gdGhlIG1lbnUgb24gYW55IG1lc3NhZ2UgYW5kIHNlbGVjdCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGI+UGluPC9iPiB0byBzdGljayB0aGVtIGhlcmUuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPixcbiAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHJldHVybiA8QmFzZUNhcmRcbiAgICAgICAgaGVhZGVyPXs8ZGl2IGNsYXNzTmFtZT1cIm14X0Jhc2VDYXJkX2hlYWRlcl90aXRsZVwiPlxuICAgICAgICAgICAgPEhlYWRpbmcgc2l6ZT1cImg0XCIgY2xhc3NOYW1lPVwibXhfQmFzZUNhcmRfaGVhZGVyX3RpdGxlX2hlYWRpbmdcIj57IF90KFwiUGlubmVkIG1lc3NhZ2VzXCIpIH08L0hlYWRpbmc+XG4gICAgICAgIDwvZGl2Pn1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfUGlubmVkTWVzc2FnZXNDYXJkXCJcbiAgICAgICAgb25DbG9zZT17b25DbG9zZX1cbiAgICA+XG4gICAgICAgIDxSb29tQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17e1xuICAgICAgICAgICAgLi4ucm9vbUNvbnRleHQsXG4gICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5QaW5uZWQsXG4gICAgICAgIH19PlxuICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgPC9Sb29tQ29udGV4dC5Qcm92aWRlcj5cbiAgICA8L0Jhc2VDYXJkPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBpbm5lZE1lc3NhZ2VzQ2FyZDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFTTyxNQUFNQSxlQUFlLEdBQUlDLElBQUQsSUFBMEI7RUFDckQsTUFBTSxDQUFDQyxZQUFELEVBQWVDLGVBQWYsSUFBa0MsSUFBQUMsZUFBQSxFQUFtQixFQUFuQixDQUF4QztFQUVBLE1BQU1DLE1BQU0sR0FBRyxJQUFBQyxrQkFBQSxFQUFhQyxFQUFELElBQXNCO0lBQzdDLElBQUksQ0FBQ04sSUFBTCxFQUFXO0lBQ1gsSUFBSU0sRUFBRSxJQUFJQSxFQUFFLENBQUNDLE9BQUgsT0FBaUJDLGlCQUFBLENBQVVDLGdCQUFyQyxFQUF1RDtJQUN2RFAsZUFBZSxDQUFDRixJQUFJLENBQUNVLFlBQUwsQ0FBa0JDLGNBQWxCLENBQWlDSCxpQkFBQSxDQUFVQyxnQkFBM0MsRUFBNkQs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