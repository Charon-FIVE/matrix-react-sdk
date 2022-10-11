"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/models/event");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _location = require("matrix-js-sdk/src/@types/location");

var _contentHelpers = require("matrix-js-sdk/src/content-helpers");

var _beacon = require("matrix-js-sdk/src/@types/beacon");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _useSettings = require("../../../hooks/useSettings");

var _Layout = require("../../../settings/enums/Layout");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _Avatar = require("../../../Avatar");

var _EventTile = _interopRequireDefault(require("../rooms/EventTile"));

var _SearchBox = _interopRequireDefault(require("../../structures/SearchBox"));

var _DecoratedRoomAvatar = _interopRequireDefault(require("../avatars/DecoratedRoomAvatar"));

var _Tooltip = require("../elements/Tooltip");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _NotificationBadge = _interopRequireDefault(require("../rooms/NotificationBadge"));

var _RecentAlgorithm = require("../../../stores/room-list/algorithms/tag-sorting/RecentAlgorithm");

var _QueryMatcher = _interopRequireDefault(require("../../../autocomplete/QueryMatcher"));

var _TruncatedList = _interopRequireDefault(require("../elements/TruncatedList"));

var _EntityTile = _interopRequireDefault(require("../rooms/EntityTile"));

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _actions = require("../../../dispatcher/actions");

var _EventUtils = require("../../../utils/EventUtils");

var _location2 = require("../../../utils/location");

var _RoomContextDetails = require("../rooms/RoomContextDetails");

const _excluded = ["m.relates_to"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const AVATAR_SIZE = 30;
var SendState;

(function (SendState) {
  SendState[SendState["CanSend"] = 0] = "CanSend";
  SendState[SendState["Sending"] = 1] = "Sending";
  SendState[SendState["Sent"] = 2] = "Sent";
  SendState[SendState["Failed"] = 3] = "Failed";
})(SendState || (SendState = {}));

const Entry = _ref => {
  let {
    room,
    type,
    content,
    matrixClient: cli,
    onFinished
  } = _ref;
  const [sendState, setSendState] = (0, _react.useState)(SendState.CanSend);

  const jumpToRoom = ev => {
    _dispatcher.default.dispatch({
      action: _actions.Action.ViewRoom,
      room_id: room.roomId,
      metricsTrigger: "WebForwardShortcut",
      metricsViaKeyboard: ev.type !== "click"
    });

    onFinished(true);
  };

  const send = async () => {
    setSendState(SendState.Sending);

    try {
      await cli.sendEvent(room.roomId, type, content);
      setSendState(SendState.Sent);
    } catch (e) {
      setSendState(SendState.Failed);
    }
  };

  let className;
  let disabled = false;
  let title;
  let icon;

  if (sendState === SendState.CanSend) {
    className = "mx_ForwardList_canSend";

    if (!room.maySendMessage()) {
      disabled = true;
      title = (0, _languageHandler._t)("You don't have permission to do this");
    }
  } else if (sendState === SendState.Sending) {
    className = "mx_ForwardList_sending";
    disabled = true;
    title = (0, _languageHandler._t)("Sending");
    icon = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ForwardList_sendIcon",
      "aria-label": title
    });
  } else if (sendState === SendState.Sent) {
    className = "mx_ForwardList_sent";
    disabled = true;
    title = (0, _languageHandler._t)("Sent");
    icon = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ForwardList_sendIcon",
      "aria-label": title
    });
  } else {
    className = "mx_ForwardList_sendFailed";
    disabled = true;
    title = (0, _languageHandler._t)("Failed to send");
    icon = /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
      notification: _StaticNotificationState.StaticNotificationState.RED_EXCLAMATION
    });
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ForwardList_entry"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_ForwardList_roomButton",
    onClick: jumpToRoom,
    title: (0, _languageHandler._t)("Open room"),
    alignment: _Tooltip.Alignment.Top
  }, /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
    room: room,
    avatarSize: 32
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_ForwardList_entry_name"
  }, room.name), /*#__PURE__*/_react.default.createElement(_RoomContextDetails.RoomContextDetails, {
    component: "span",
    className: "mx_ForwardList_entry_detail",
    room: room
  })), /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    kind: sendState === SendState.Failed ? "danger_outline" : "primary_outline",
    className: `mx_ForwardList_sendButton ${className}`,
    onClick: send,
    disabled: disabled,
    title: title,
    alignment: _Tooltip.Alignment.Top
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ForwardList_sendLabel"
  }, (0, _languageHandler._t)("Send")), icon));
};

const transformEvent = event => {
  const _event$getContent = event.getContent(),
        {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    "m.relates_to": _
  } = _event$getContent,
        content = (0, _objectWithoutProperties2.default)(_event$getContent, _excluded); // beacon pulses get transformed into static locations on forward


  const type = _beacon.M_BEACON.matches(event.getType()) ? _event2.EventType.RoomMessage : event.getType(); // self location shares should have their description removed
  // and become 'pin' share type

  if ((0, _EventUtils.isLocationEvent)(event) && (0, _location2.isSelfLocation)(content) || // beacon pulses get transformed into static locations on forward
  _beacon.M_BEACON.matches(event.getType())) {
    const timestamp = _location.M_TIMESTAMP.findIn(content);

    const geoUri = (0, _location2.locationEventGeoUri)(event);
    return {
      type,
      content: _objectSpread(_objectSpread({}, content), (0, _contentHelpers.makeLocationContent)(undefined, // text
      geoUri, timestamp || Date.now(), undefined, // description
      _location.LocationAssetType.Pin))
    };
  }

  return {
    type,
    content
  };
};

const ForwardDialog = _ref2 => {
  let {
    matrixClient: cli,
    event,
    permalinkCreator,
    onFinished
  } = _ref2;
  const userId = cli.getUserId();
  const [profileInfo, setProfileInfo] = (0, _react.useState)({});
  (0, _react.useEffect)(() => {
    cli.getProfileInfo(userId).then(info => setProfileInfo(info));
  }, [cli, userId]);
  const {
    type,
    content
  } = transformEvent(event); // For the message preview we fake the sender as ourselves

  const mockEvent = new _event.MatrixEvent({
    type: "m.room.message",
    sender: userId,
    content,
    unsigned: {
      age: 97
    },
    event_id: "$9999999999999999999999999999999999999999999",
    room_id: event.getRoomId()
  });
  mockEvent.sender = {
    name: profileInfo.displayname || userId,
    rawDisplayName: profileInfo.displayname,
    userId,
    getAvatarUrl: function () {
      return (0, _Avatar.avatarUrlForUser)({
        avatarUrl: profileInfo.avatar_url
      }, AVATAR_SIZE, AVATAR_SIZE, "crop");
    },
    getMxcAvatarUrl: () => profileInfo.avatar_url
  };
  const [query, setQuery] = (0, _react.useState)("");
  const lcQuery = query.toLowerCase();
  const previewLayout = (0, _useSettings.useSettingValue)("layout");
  let rooms = (0, _react.useMemo)(() => (0, _RecentAlgorithm.sortRooms)(cli.getVisibleRooms().filter(room => room.getMyMembership() === "join" && !room.isSpaceRoom())), [cli]);

  if (lcQuery) {
    rooms = new _QueryMatcher.default(rooms, {
      keys: ["name"],
      funcs: [r => [r.getCanonicalAlias(), ...r.getAltAliases()].filter(Boolean)],
      shouldMatchWordsOnly: false
    }).match(lcQuery);
  }

  const [truncateAt, setTruncateAt] = (0, _react.useState)(20);

  function overflowTile(overflowCount, totalCount) {
    const text = (0, _languageHandler._t)("and %(count)s others...", {
      count: overflowCount
    });
    return /*#__PURE__*/_react.default.createElement(_EntityTile.default, {
      className: "mx_EntityTile_ellipsis",
      avatarJsx: /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
        url: require("../../../../res/img/ellipsis.svg").default,
        name: "...",
        width: 36,
        height: 36
      }),
      name: text,
      presenceState: "online",
      suppressOnHover: true,
      onClick: () => setTruncateAt(totalCount)
    });
  }

  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    title: (0, _languageHandler._t)("Forward message"),
    className: "mx_ForwardDialog",
    contentId: "mx_ForwardList",
    onFinished: onFinished,
    fixedWidth: false
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Message preview")), /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)("mx_ForwardDialog_preview", {
      "mx_IRCLayout": previewLayout == _Layout.Layout.IRC
    })
  }, /*#__PURE__*/_react.default.createElement(_EventTile.default, {
    mxEvent: mockEvent,
    layout: previewLayout,
    permalinkCreator: permalinkCreator,
    as: "div"
  })), /*#__PURE__*/_react.default.createElement("hr", null), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ForwardList",
    id: "mx_ForwardList"
  }, /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
    className: "mx_textinput_icon mx_textinput_search",
    placeholder: (0, _languageHandler._t)("Search for rooms or people"),
    onSearch: setQuery,
    autoFocus: true
  }), /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
    className: "mx_ForwardList_content"
  }, rooms.length > 0 ? /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ForwardList_results"
  }, /*#__PURE__*/_react.default.createElement(_TruncatedList.default, {
    className: "mx_ForwardList_resultsList",
    truncateAt: truncateAt,
    createOverflowElement: overflowTile,
    getChildren: (start, end) => rooms.slice(start, end).map(room => /*#__PURE__*/_react.default.createElement(Entry, {
      key: room.roomId,
      room: room,
      type: type,
      content: content,
      matrixClient: cli,
      onFinished: onFinished
    })),
    getChildCount: () => rooms.length
  })) : /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_ForwardList_noResults"
  }, (0, _languageHandler._t)("No results")))));
};

var _default = ForwardDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBVkFUQVJfU0laRSIsIlNlbmRTdGF0ZSIsIkVudHJ5Iiwicm9vbSIsInR5cGUiLCJjb250ZW50IiwibWF0cml4Q2xpZW50IiwiY2xpIiwib25GaW5pc2hlZCIsInNlbmRTdGF0ZSIsInNldFNlbmRTdGF0ZSIsInVzZVN0YXRlIiwiQ2FuU2VuZCIsImp1bXBUb1Jvb20iLCJldiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1Jvb20iLCJyb29tX2lkIiwicm9vbUlkIiwibWV0cmljc1RyaWdnZXIiLCJtZXRyaWNzVmlhS2V5Ym9hcmQiLCJzZW5kIiwiU2VuZGluZyIsInNlbmRFdmVudCIsIlNlbnQiLCJlIiwiRmFpbGVkIiwiY2xhc3NOYW1lIiwiZGlzYWJsZWQiLCJ0aXRsZSIsImljb24iLCJtYXlTZW5kTWVzc2FnZSIsIl90IiwiU3RhdGljTm90aWZpY2F0aW9uU3RhdGUiLCJSRURfRVhDTEFNQVRJT04iLCJBbGlnbm1lbnQiLCJUb3AiLCJuYW1lIiwidHJhbnNmb3JtRXZlbnQiLCJldmVudCIsImdldENvbnRlbnQiLCJfIiwiTV9CRUFDT04iLCJtYXRjaGVzIiwiZ2V0VHlwZSIsIkV2ZW50VHlwZSIsIlJvb21NZXNzYWdlIiwiaXNMb2NhdGlvbkV2ZW50IiwiaXNTZWxmTG9jYXRpb24iLCJ0aW1lc3RhbXAiLCJNX1RJTUVTVEFNUCIsImZpbmRJbiIsImdlb1VyaSIsImxvY2F0aW9uRXZlbnRHZW9VcmkiLCJtYWtlTG9jYXRpb25Db250ZW50IiwidW5kZWZpbmVkIiwiRGF0ZSIsIm5vdyIsIkxvY2F0aW9uQXNzZXRUeXBlIiwiUGluIiwiRm9yd2FyZERpYWxvZyIsInBlcm1hbGlua0NyZWF0b3IiLCJ1c2VySWQiLCJnZXRVc2VySWQiLCJwcm9maWxlSW5mbyIsInNldFByb2ZpbGVJbmZvIiwidXNlRWZmZWN0IiwiZ2V0UHJvZmlsZUluZm8iLCJ0aGVuIiwiaW5mbyIsIm1vY2tFdmVudCIsIk1hdHJpeEV2ZW50Iiwic2VuZGVyIiwidW5zaWduZWQiLCJhZ2UiLCJldmVudF9pZCIsImdldFJvb21JZCIsImRpc3BsYXluYW1lIiwicmF3RGlzcGxheU5hbWUiLCJnZXRBdmF0YXJVcmwiLCJhdmF0YXJVcmxGb3JVc2VyIiwiYXZhdGFyVXJsIiwiYXZhdGFyX3VybCIsImdldE14Y0F2YXRhclVybCIsInF1ZXJ5Iiwic2V0UXVlcnkiLCJsY1F1ZXJ5IiwidG9Mb3dlckNhc2UiLCJwcmV2aWV3TGF5b3V0IiwidXNlU2V0dGluZ1ZhbHVlIiwicm9vbXMiLCJ1c2VNZW1vIiwic29ydFJvb21zIiwiZ2V0VmlzaWJsZVJvb21zIiwiZmlsdGVyIiwiZ2V0TXlNZW1iZXJzaGlwIiwiaXNTcGFjZVJvb20iLCJRdWVyeU1hdGNoZXIiLCJrZXlzIiwiZnVuY3MiLCJyIiwiZ2V0Q2Fub25pY2FsQWxpYXMiLCJnZXRBbHRBbGlhc2VzIiwiQm9vbGVhbiIsInNob3VsZE1hdGNoV29yZHNPbmx5IiwibWF0Y2giLCJ0cnVuY2F0ZUF0Iiwic2V0VHJ1bmNhdGVBdCIsIm92ZXJmbG93VGlsZSIsIm92ZXJmbG93Q291bnQiLCJ0b3RhbENvdW50IiwidGV4dCIsImNvdW50IiwicmVxdWlyZSIsImRlZmF1bHQiLCJjbGFzc25hbWVzIiwiTGF5b3V0IiwiSVJDIiwibGVuZ3RoIiwic3RhcnQiLCJlbmQiLCJzbGljZSIsIm1hcCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRm9yd2FyZERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFJvYmluIFRvd25zZW5kIDxyb2JpbkByb2Jpbi50b3duPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHsgSUNvbnRlbnQsIE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IElMb2NhdGlvbkNvbnRlbnQsIExvY2F0aW9uQXNzZXRUeXBlLCBNX1RJTUVTVEFNUCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvbG9jYXRpb25cIjtcbmltcG9ydCB7IG1ha2VMb2NhdGlvbkNvbnRlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY29udGVudC1oZWxwZXJzXCI7XG5pbXBvcnQgeyBNX0JFQUNPTiB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvYmVhY29uXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyB1c2VTZXR0aW5nVmFsdWUgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlU2V0dGluZ3NcIjtcbmltcG9ydCB7IExheW91dCB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9lbnVtcy9MYXlvdXRcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuL0lEaWFsb2dQcm9wc1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IHsgYXZhdGFyVXJsRm9yVXNlciB9IGZyb20gXCIuLi8uLi8uLi9BdmF0YXJcIjtcbmltcG9ydCBFdmVudFRpbGUgZnJvbSBcIi4uL3Jvb21zL0V2ZW50VGlsZVwiO1xuaW1wb3J0IFNlYXJjaEJveCBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9TZWFyY2hCb3hcIjtcbmltcG9ydCBEZWNvcmF0ZWRSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL0RlY29yYXRlZFJvb21BdmF0YXJcIjtcbmltcG9ydCB7IEFsaWdubWVudCB9IGZyb20gJy4uL2VsZW1lbnRzL1Rvb2x0aXAnO1xuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0F1dG9IaWRlU2Nyb2xsYmFyXCI7XG5pbXBvcnQgeyBTdGF0aWNOb3RpZmljYXRpb25TdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9TdGF0aWNOb3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IE5vdGlmaWNhdGlvbkJhZGdlIGZyb20gXCIuLi9yb29tcy9Ob3RpZmljYXRpb25CYWRnZVwiO1xuaW1wb3J0IHsgUm9vbVBlcm1hbGlua0NyZWF0b3IgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgeyBzb3J0Um9vbXMgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9hbGdvcml0aG1zL3RhZy1zb3J0aW5nL1JlY2VudEFsZ29yaXRobVwiO1xuaW1wb3J0IFF1ZXJ5TWF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vYXV0b2NvbXBsZXRlL1F1ZXJ5TWF0Y2hlclwiO1xuaW1wb3J0IFRydW5jYXRlZExpc3QgZnJvbSBcIi4uL2VsZW1lbnRzL1RydW5jYXRlZExpc3RcIjtcbmltcG9ydCBFbnRpdHlUaWxlIGZyb20gXCIuLi9yb29tcy9FbnRpdHlUaWxlXCI7XG5pbXBvcnQgQmFzZUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9CYXNlQXZhdGFyXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IGlzTG9jYXRpb25FdmVudCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9FdmVudFV0aWxzXCI7XG5pbXBvcnQgeyBpc1NlbGZMb2NhdGlvbiwgbG9jYXRpb25FdmVudEdlb1VyaSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9sb2NhdGlvblwiO1xuaW1wb3J0IHsgUm9vbUNvbnRleHREZXRhaWxzIH0gZnJvbSBcIi4uL3Jvb21zL1Jvb21Db250ZXh0RGV0YWlsc1wiO1xuXG5jb25zdCBBVkFUQVJfU0laRSA9IDMwO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudDtcbiAgICAvLyBUaGUgZXZlbnQgdG8gZm9yd2FyZFxuICAgIGV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICAvLyBXZSBuZWVkIGEgcGVybWFsaW5rIGNyZWF0b3IgZm9yIHRoZSBzb3VyY2Ugcm9vbSB0byBwYXNzIHRocm91Z2ggdG8gRXZlbnRUaWxlXG4gICAgLy8gaW4gY2FzZSB0aGUgZXZlbnQgaXMgYSByZXBseSAoZXZlbiB0aG91Z2ggdGhlIHVzZXIgY2FuJ3QgZ2V0IGF0IHRoZSBsaW5rKVxuICAgIHBlcm1hbGlua0NyZWF0b3I6IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xufVxuXG5pbnRlcmZhY2UgSUVudHJ5UHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgdHlwZTogRXZlbnRUeXBlIHwgc3RyaW5nO1xuICAgIGNvbnRlbnQ6IElDb250ZW50O1xuICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50O1xuICAgIG9uRmluaXNoZWQoc3VjY2VzczogYm9vbGVhbik6IHZvaWQ7XG59XG5cbmVudW0gU2VuZFN0YXRlIHtcbiAgICBDYW5TZW5kLFxuICAgIFNlbmRpbmcsXG4gICAgU2VudCxcbiAgICBGYWlsZWQsXG59XG5cbmNvbnN0IEVudHJ5OiBSZWFjdC5GQzxJRW50cnlQcm9wcz4gPSAoeyByb29tLCB0eXBlLCBjb250ZW50LCBtYXRyaXhDbGllbnQ6IGNsaSwgb25GaW5pc2hlZCB9KSA9PiB7XG4gICAgY29uc3QgW3NlbmRTdGF0ZSwgc2V0U2VuZFN0YXRlXSA9IHVzZVN0YXRlPFNlbmRTdGF0ZT4oU2VuZFN0YXRlLkNhblNlbmQpO1xuXG4gICAgY29uc3QganVtcFRvUm9vbSA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIldlYkZvcndhcmRTaG9ydGN1dFwiLFxuICAgICAgICAgICAgbWV0cmljc1ZpYUtleWJvYXJkOiBldi50eXBlICE9PSBcImNsaWNrXCIsXG4gICAgICAgIH0pO1xuICAgICAgICBvbkZpbmlzaGVkKHRydWUpO1xuICAgIH07XG4gICAgY29uc3Qgc2VuZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0U2VuZFN0YXRlKFNlbmRTdGF0ZS5TZW5kaW5nKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNsaS5zZW5kRXZlbnQocm9vbS5yb29tSWQsIHR5cGUsIGNvbnRlbnQpO1xuICAgICAgICAgICAgc2V0U2VuZFN0YXRlKFNlbmRTdGF0ZS5TZW50KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgc2V0U2VuZFN0YXRlKFNlbmRTdGF0ZS5GYWlsZWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGxldCBjbGFzc05hbWU7XG4gICAgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgbGV0IHRpdGxlO1xuICAgIGxldCBpY29uO1xuICAgIGlmIChzZW5kU3RhdGUgPT09IFNlbmRTdGF0ZS5DYW5TZW5kKSB7XG4gICAgICAgIGNsYXNzTmFtZSA9IFwibXhfRm9yd2FyZExpc3RfY2FuU2VuZFwiO1xuICAgICAgICBpZiAoIXJvb20ubWF5U2VuZE1lc3NhZ2UoKSkge1xuICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSBkb24ndCBoYXZlIHBlcm1pc3Npb24gdG8gZG8gdGhpc1wiKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc2VuZFN0YXRlID09PSBTZW5kU3RhdGUuU2VuZGluZykge1xuICAgICAgICBjbGFzc05hbWUgPSBcIm14X0ZvcndhcmRMaXN0X3NlbmRpbmdcIjtcbiAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aXRsZSA9IF90KFwiU2VuZGluZ1wiKTtcbiAgICAgICAgaWNvbiA9IDxkaXYgY2xhc3NOYW1lPVwibXhfRm9yd2FyZExpc3Rfc2VuZEljb25cIiBhcmlhLWxhYmVsPXt0aXRsZX0gLz47XG4gICAgfSBlbHNlIGlmIChzZW5kU3RhdGUgPT09IFNlbmRTdGF0ZS5TZW50KSB7XG4gICAgICAgIGNsYXNzTmFtZSA9IFwibXhfRm9yd2FyZExpc3Rfc2VudFwiO1xuICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIHRpdGxlID0gX3QoXCJTZW50XCIpO1xuICAgICAgICBpY29uID0gPGRpdiBjbGFzc05hbWU9XCJteF9Gb3J3YXJkTGlzdF9zZW5kSWNvblwiIGFyaWEtbGFiZWw9e3RpdGxlfSAvPjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjbGFzc05hbWUgPSBcIm14X0ZvcndhcmRMaXN0X3NlbmRGYWlsZWRcIjtcbiAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aXRsZSA9IF90KFwiRmFpbGVkIHRvIHNlbmRcIik7XG4gICAgICAgIGljb24gPSA8Tm90aWZpY2F0aW9uQmFkZ2VcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbj17U3RhdGljTm90aWZpY2F0aW9uU3RhdGUuUkVEX0VYQ0xBTUFUSU9OfVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Gb3J3YXJkTGlzdF9lbnRyeVwiPlxuICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0ZvcndhcmRMaXN0X3Jvb21CdXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17anVtcFRvUm9vbX1cbiAgICAgICAgICAgIHRpdGxlPXtfdChcIk9wZW4gcm9vbVwiKX1cbiAgICAgICAgICAgIGFsaWdubWVudD17QWxpZ25tZW50LlRvcH1cbiAgICAgICAgPlxuICAgICAgICAgICAgPERlY29yYXRlZFJvb21BdmF0YXIgcm9vbT17cm9vbX0gYXZhdGFyU2l6ZT17MzJ9IC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Gb3J3YXJkTGlzdF9lbnRyeV9uYW1lXCI+eyByb29tLm5hbWUgfTwvc3Bhbj5cbiAgICAgICAgICAgIDxSb29tQ29udGV4dERldGFpbHMgY29tcG9uZW50PVwic3BhblwiIGNsYXNzTmFtZT1cIm14X0ZvcndhcmRMaXN0X2VudHJ5X2RldGFpbFwiIHJvb209e3Jvb219IC8+XG4gICAgICAgIDwvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAga2luZD17c2VuZFN0YXRlID09PSBTZW5kU3RhdGUuRmFpbGVkID8gXCJkYW5nZXJfb3V0bGluZVwiIDogXCJwcmltYXJ5X291dGxpbmVcIn1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17YG14X0ZvcndhcmRMaXN0X3NlbmRCdXR0b24gJHtjbGFzc05hbWV9YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3NlbmR9XG4gICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICBhbGlnbm1lbnQ9e0FsaWdubWVudC5Ub3B9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRm9yd2FyZExpc3Rfc2VuZExhYmVsXCI+eyBfdChcIlNlbmRcIikgfTwvZGl2PlxuICAgICAgICAgICAgeyBpY29uIH1cbiAgICAgICAgPC9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj5cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCB0cmFuc2Zvcm1FdmVudCA9IChldmVudDogTWF0cml4RXZlbnQpOiB7dHlwZTogc3RyaW5nLCBjb250ZW50OiBJQ29udGVudCB9ID0+IHtcbiAgICBjb25zdCB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgXCJtLnJlbGF0ZXNfdG9cIjogXywgLy8gc3RyaXAgcmVsYXRpb25zIC0gaW4gZnV0dXJlIHdlIHdpbGwgYXR0YWNoIGEgcmVsYXRpb24gcG9pbnRpbmcgYXQgdGhlIG9yaWdpbmFsIGV2ZW50XG4gICAgICAgIC8vIFdlJ3JlIHRha2luZyBhIHNoYWxsb3cgY29weSBoZXJlIHRvIGF2b2lkIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEwOTI0XG4gICAgICAgIC4uLmNvbnRlbnRcbiAgICB9ID0gZXZlbnQuZ2V0Q29udGVudCgpO1xuXG4gICAgLy8gYmVhY29uIHB1bHNlcyBnZXQgdHJhbnNmb3JtZWQgaW50byBzdGF0aWMgbG9jYXRpb25zIG9uIGZvcndhcmRcbiAgICBjb25zdCB0eXBlID0gTV9CRUFDT04ubWF0Y2hlcyhldmVudC5nZXRUeXBlKCkpID8gRXZlbnRUeXBlLlJvb21NZXNzYWdlIDogZXZlbnQuZ2V0VHlwZSgpO1xuXG4gICAgLy8gc2VsZiBsb2NhdGlvbiBzaGFyZXMgc2hvdWxkIGhhdmUgdGhlaXIgZGVzY3JpcHRpb24gcmVtb3ZlZFxuICAgIC8vIGFuZCBiZWNvbWUgJ3Bpbicgc2hhcmUgdHlwZVxuICAgIGlmIChcbiAgICAgICAgKGlzTG9jYXRpb25FdmVudChldmVudCkgJiYgaXNTZWxmTG9jYXRpb24oY29udGVudCBhcyBJTG9jYXRpb25Db250ZW50KSkgfHxcbiAgICAgICAgLy8gYmVhY29uIHB1bHNlcyBnZXQgdHJhbnNmb3JtZWQgaW50byBzdGF0aWMgbG9jYXRpb25zIG9uIGZvcndhcmRcbiAgICAgICAgTV9CRUFDT04ubWF0Y2hlcyhldmVudC5nZXRUeXBlKCkpXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IE1fVElNRVNUQU1QLmZpbmRJbjxudW1iZXI+KGNvbnRlbnQpO1xuICAgICAgICBjb25zdCBnZW9VcmkgPSBsb2NhdGlvbkV2ZW50R2VvVXJpKGV2ZW50KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgLi4uY29udGVudCxcbiAgICAgICAgICAgICAgICAuLi5tYWtlTG9jYXRpb25Db250ZW50KFxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsIC8vIHRleHRcbiAgICAgICAgICAgICAgICAgICAgZ2VvVXJpLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXAgfHwgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLCAvLyBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICBMb2NhdGlvbkFzc2V0VHlwZS5QaW4sXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdHlwZSwgY29udGVudCB9O1xufTtcblxuY29uc3QgRm9yd2FyZERpYWxvZzogUmVhY3QuRkM8SVByb3BzPiA9ICh7IG1hdHJpeENsaWVudDogY2xpLCBldmVudCwgcGVybWFsaW5rQ3JlYXRvciwgb25GaW5pc2hlZCB9KSA9PiB7XG4gICAgY29uc3QgdXNlcklkID0gY2xpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IFtwcm9maWxlSW5mbywgc2V0UHJvZmlsZUluZm9dID0gdXNlU3RhdGU8YW55Pih7fSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY2xpLmdldFByb2ZpbGVJbmZvKHVzZXJJZCkudGhlbihpbmZvID0+IHNldFByb2ZpbGVJbmZvKGluZm8pKTtcbiAgICB9LCBbY2xpLCB1c2VySWRdKTtcblxuICAgIGNvbnN0IHsgdHlwZSwgY29udGVudCB9ID0gdHJhbnNmb3JtRXZlbnQoZXZlbnQpO1xuXG4gICAgLy8gRm9yIHRoZSBtZXNzYWdlIHByZXZpZXcgd2UgZmFrZSB0aGUgc2VuZGVyIGFzIG91cnNlbHZlc1xuICAgIGNvbnN0IG1vY2tFdmVudCA9IG5ldyBNYXRyaXhFdmVudCh7XG4gICAgICAgIHR5cGU6IFwibS5yb29tLm1lc3NhZ2VcIixcbiAgICAgICAgc2VuZGVyOiB1c2VySWQsXG4gICAgICAgIGNvbnRlbnQsXG4gICAgICAgIHVuc2lnbmVkOiB7XG4gICAgICAgICAgICBhZ2U6IDk3LFxuICAgICAgICB9LFxuICAgICAgICBldmVudF9pZDogXCIkOTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OVwiLFxuICAgICAgICByb29tX2lkOiBldmVudC5nZXRSb29tSWQoKSxcbiAgICB9KTtcbiAgICBtb2NrRXZlbnQuc2VuZGVyID0ge1xuICAgICAgICBuYW1lOiBwcm9maWxlSW5mby5kaXNwbGF5bmFtZSB8fCB1c2VySWQsXG4gICAgICAgIHJhd0Rpc3BsYXlOYW1lOiBwcm9maWxlSW5mby5kaXNwbGF5bmFtZSxcbiAgICAgICAgdXNlcklkLFxuICAgICAgICBnZXRBdmF0YXJVcmw6ICguLi5fKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXZhdGFyVXJsRm9yVXNlcihcbiAgICAgICAgICAgICAgICB7IGF2YXRhclVybDogcHJvZmlsZUluZm8uYXZhdGFyX3VybCB9LFxuICAgICAgICAgICAgICAgIEFWQVRBUl9TSVpFLCBBVkFUQVJfU0laRSwgXCJjcm9wXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICBnZXRNeGNBdmF0YXJVcmw6ICgpID0+IHByb2ZpbGVJbmZvLmF2YXRhcl91cmwsXG4gICAgfSBhcyBSb29tTWVtYmVyO1xuXG4gICAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgICBjb25zdCBsY1F1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcblxuICAgIGNvbnN0IHByZXZpZXdMYXlvdXQgPSB1c2VTZXR0aW5nVmFsdWU8TGF5b3V0PihcImxheW91dFwiKTtcblxuICAgIGxldCByb29tcyA9IHVzZU1lbW8oKCkgPT4gc29ydFJvb21zKFxuICAgICAgICBjbGkuZ2V0VmlzaWJsZVJvb21zKCkuZmlsdGVyKFxuICAgICAgICAgICAgcm9vbSA9PiByb29tLmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIiAmJiAhcm9vbS5pc1NwYWNlUm9vbSgpLFxuICAgICAgICApLFxuICAgICksIFtjbGldKTtcblxuICAgIGlmIChsY1F1ZXJ5KSB7XG4gICAgICAgIHJvb21zID0gbmV3IFF1ZXJ5TWF0Y2hlcjxSb29tPihyb29tcywge1xuICAgICAgICAgICAga2V5czogW1wibmFtZVwiXSxcbiAgICAgICAgICAgIGZ1bmNzOiBbciA9PiBbci5nZXRDYW5vbmljYWxBbGlhcygpLCAuLi5yLmdldEFsdEFsaWFzZXMoKV0uZmlsdGVyKEJvb2xlYW4pXSxcbiAgICAgICAgICAgIHNob3VsZE1hdGNoV29yZHNPbmx5OiBmYWxzZSxcbiAgICAgICAgfSkubWF0Y2gobGNRdWVyeSk7XG4gICAgfVxuXG4gICAgY29uc3QgW3RydW5jYXRlQXQsIHNldFRydW5jYXRlQXRdID0gdXNlU3RhdGUoMjApO1xuICAgIGZ1bmN0aW9uIG92ZXJmbG93VGlsZShvdmVyZmxvd0NvdW50LCB0b3RhbENvdW50KSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBfdChcImFuZCAlKGNvdW50KXMgb3RoZXJzLi4uXCIsIHsgY291bnQ6IG92ZXJmbG93Q291bnQgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RW50aXR5VGlsZVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0VudGl0eVRpbGVfZWxsaXBzaXNcIlxuICAgICAgICAgICAgICAgIGF2YXRhckpzeD17XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyIHVybD17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxsaXBzaXMuc3ZnXCIpLmRlZmF1bHR9IG5hbWU9XCIuLi5cIiB3aWR0aD17MzZ9IGhlaWdodD17MzZ9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5hbWU9e3RleHR9XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VTdGF0ZT1cIm9ubGluZVwiXG4gICAgICAgICAgICAgICAgc3VwcHJlc3NPbkhvdmVyPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFRydW5jYXRlQXQodG90YWxDb3VudCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiA8QmFzZURpYWxvZ1xuICAgICAgICB0aXRsZT17X3QoXCJGb3J3YXJkIG1lc3NhZ2VcIil9XG4gICAgICAgIGNsYXNzTmFtZT1cIm14X0ZvcndhcmREaWFsb2dcIlxuICAgICAgICBjb250ZW50SWQ9XCJteF9Gb3J3YXJkTGlzdFwiXG4gICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9XG4gICAgICAgIGZpeGVkV2lkdGg9e2ZhbHNlfVxuICAgID5cbiAgICAgICAgPGgzPnsgX3QoXCJNZXNzYWdlIHByZXZpZXdcIikgfTwvaDM+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc25hbWVzKFwibXhfRm9yd2FyZERpYWxvZ19wcmV2aWV3XCIsIHtcbiAgICAgICAgICAgIFwibXhfSVJDTGF5b3V0XCI6IHByZXZpZXdMYXlvdXQgPT0gTGF5b3V0LklSQyxcbiAgICAgICAgfSl9PlxuICAgICAgICAgICAgPEV2ZW50VGlsZVxuICAgICAgICAgICAgICAgIG14RXZlbnQ9e21vY2tFdmVudH1cbiAgICAgICAgICAgICAgICBsYXlvdXQ9e3ByZXZpZXdMYXlvdXR9XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17cGVybWFsaW5rQ3JlYXRvcn1cbiAgICAgICAgICAgICAgICBhcz1cImRpdlwiXG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGhyIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRm9yd2FyZExpc3RcIiBpZD1cIm14X0ZvcndhcmRMaXN0XCI+XG4gICAgICAgICAgICA8U2VhcmNoQm94XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfdGV4dGlucHV0X2ljb24gbXhfdGV4dGlucHV0X3NlYXJjaFwiXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiU2VhcmNoIGZvciByb29tcyBvciBwZW9wbGVcIil9XG4gICAgICAgICAgICAgICAgb25TZWFyY2g9e3NldFF1ZXJ5fVxuICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8QXV0b0hpZGVTY3JvbGxiYXIgY2xhc3NOYW1lPVwibXhfRm9yd2FyZExpc3RfY29udGVudFwiPlxuICAgICAgICAgICAgICAgIHsgcm9vbXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Gb3J3YXJkTGlzdF9yZXN1bHRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VHJ1bmNhdGVkTGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0ZvcndhcmRMaXN0X3Jlc3VsdHNMaXN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVuY2F0ZUF0PXt0cnVuY2F0ZUF0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU92ZXJmbG93RWxlbWVudD17b3ZlcmZsb3dUaWxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldENoaWxkcmVuPXsoc3RhcnQsIGVuZCkgPT4gcm9vbXMuc2xpY2Uoc3RhcnQsIGVuZCkubWFwKHJvb20gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEVudHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3Jvb20ucm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9e3R5cGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50PXtjb250ZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50PXtjbGl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldENoaWxkQ291bnQ9eygpID0+IHJvb21zLmxlbmd0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiA8c3BhbiBjbGFzc05hbWU9XCJteF9Gb3J3YXJkTGlzdF9ub1Jlc3VsdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIk5vIHJlc3VsdHNcIikgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj4gfVxuICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9CYXNlRGlhbG9nPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEZvcndhcmREaWFsb2c7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FB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