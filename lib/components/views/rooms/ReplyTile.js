"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/models/event");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _SenderProfile = _interopRequireDefault(require("../messages/SenderProfile"));

var _MImageReplyBody = _interopRequireDefault(require("../messages/MImageReplyBody"));

var _EventUtils = require("../../../utils/EventUtils");

var _EventRenderingUtils = require("../../../utils/EventRenderingUtils");

var _MFileBody = _interopRequireDefault(require("../messages/MFileBody"));

var _MVoiceMessageBody = _interopRequireDefault(require("../messages/MVoiceMessageBody"));

var _EventTileFactory = require("../../../events/EventTileFactory");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class ReplyTile extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "anchorElement", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onDecrypted", () => {
      this.forceUpdate();

      if (this.props.onHeightChanged) {
        this.props.onHeightChanged();
      }
    });
    (0, _defineProperty2.default)(this, "onEventRequiresUpdate", () => {
      // Force update when necessary - redactions and edits
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onClick", e => {
      const clickTarget = e.target; // Following a link within a reply should not dispatch the `view_room` action
      // so that the browser can direct the user to the correct location
      // The exception being the link wrapping the reply

      if (clickTarget.tagName.toLowerCase() !== "a" || clickTarget.closest("a") === null || clickTarget === this.anchorElement.current) {
        // This allows the permalink to be opened in a new tab/window or copied as
        // matrix.to, but also for it to enable routing within Riot when clicked.
        e.preventDefault(); // Expand thread on shift key

        if (this.props.toggleExpandedQuote && e.shiftKey) {
          this.props.toggleExpandedQuote();
        } else {
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoom,
            event_id: this.props.mxEvent.getId(),
            highlighted: true,
            room_id: this.props.mxEvent.getRoomId(),
            metricsTrigger: undefined // room doesn't change

          });
        }
      }
    });
  }

  componentDidMount() {
    this.props.mxEvent.on(_event.MatrixEventEvent.Decrypted, this.onDecrypted);
    this.props.mxEvent.on(_event.MatrixEventEvent.BeforeRedaction, this.onEventRequiresUpdate);
    this.props.mxEvent.on(_event.MatrixEventEvent.Replaced, this.onEventRequiresUpdate);
  }

  componentWillUnmount() {
    this.props.mxEvent.removeListener(_event.MatrixEventEvent.Decrypted, this.onDecrypted);
    this.props.mxEvent.removeListener(_event.MatrixEventEvent.BeforeRedaction, this.onEventRequiresUpdate);
    this.props.mxEvent.removeListener(_event.MatrixEventEvent.Replaced, this.onEventRequiresUpdate);
  }

  render() {
    const mxEvent = this.props.mxEvent;
    const msgType = mxEvent.getContent().msgtype;
    const evType = mxEvent.getType();
    const {
      hasRenderer,
      isInfoMessage,
      isSeeingThroughMessageHiddenForModeration
    } = (0, _EventRenderingUtils.getEventDisplayInfo)(mxEvent, false
    /* Replies are never hidden, so this should be fine */
    ); // This shouldn't happen: the caller should check we support this type
    // before trying to instantiate us

    if (!hasRenderer) {
      const {
        mxEvent
      } = this.props;

      _logger.logger.warn(`Event type not supported: type:${mxEvent.getType()} isState:${mxEvent.isState()}`);

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ReplyTile mx_ReplyTile_info mx_MNoticeBody"
      }, (0, _languageHandler._t)('This event could not be displayed'));
    }

    const classes = (0, _classnames.default)("mx_ReplyTile", {
      mx_ReplyTile_info: isInfoMessage && !mxEvent.isRedacted(),
      mx_ReplyTile_audio: msgType === _event2.MsgType.Audio,
      mx_ReplyTile_video: msgType === _event2.MsgType.Video
    });
    let permalink = "#";

    if (this.props.permalinkCreator) {
      permalink = this.props.permalinkCreator.forEvent(mxEvent.getId());
    }

    let sender;
    const needsSenderProfile = !isInfoMessage && msgType !== _event2.MsgType.Image && evType !== _event2.EventType.Sticker && evType !== _event2.EventType.RoomCreate;

    if (needsSenderProfile) {
      sender = /*#__PURE__*/_react.default.createElement(_SenderProfile.default, {
        mxEvent: mxEvent
      });
    }

    const msgtypeOverrides = {
      [_event2.MsgType.Image]: _MImageReplyBody.default,
      // Override audio and video body with file body. We also hide the download/decrypt button using CSS
      [_event2.MsgType.Audio]: (0, _EventUtils.isVoiceMessage)(mxEvent) ? _MVoiceMessageBody.default : _MFileBody.default,
      [_event2.MsgType.Video]: _MFileBody.default
    };
    const evOverrides = {
      // Use MImageReplyBody so that the sticker isn't taking up a lot of space
      [_event2.EventType.Sticker]: _MImageReplyBody.default
    };
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement("a", {
      href: permalink,
      onClick: this.onClick,
      ref: this.anchorElement
    }, sender, (0, _EventTileFactory.renderReplyTile)(_objectSpread(_objectSpread({}, this.props), {}, {
      // overrides
      ref: null,
      showUrlPreview: false,
      overrideBodyTypes: msgtypeOverrides,
      overrideEventTypes: evOverrides,
      maxImageHeight: 96,
      isSeeingThroughMessageHiddenForModeration,
      // appease TS
      highlights: this.props.highlights,
      highlightLink: this.props.highlightLink,
      onHeightChanged: this.props.onHeightChanged,
      permalinkCreator: this.props.permalinkCreator
    }), false
    /* showHiddenEvents shouldn't be relevant */
    )));
  }

}

exports.default = ReplyTile;
(0, _defineProperty2.default)(ReplyTile, "defaultProps", {
  onHeightChanged: () => {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXBseVRpbGUiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjcmVhdGVSZWYiLCJmb3JjZVVwZGF0ZSIsInByb3BzIiwib25IZWlnaHRDaGFuZ2VkIiwiZSIsImNsaWNrVGFyZ2V0IiwidGFyZ2V0IiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiY2xvc2VzdCIsImFuY2hvckVsZW1lbnQiLCJjdXJyZW50IiwicHJldmVudERlZmF1bHQiLCJ0b2dnbGVFeHBhbmRlZFF1b3RlIiwic2hpZnRLZXkiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdSb29tIiwiZXZlbnRfaWQiLCJteEV2ZW50IiwiZ2V0SWQiLCJoaWdobGlnaHRlZCIsInJvb21faWQiLCJnZXRSb29tSWQiLCJtZXRyaWNzVHJpZ2dlciIsInVuZGVmaW5lZCIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJNYXRyaXhFdmVudEV2ZW50IiwiRGVjcnlwdGVkIiwib25EZWNyeXB0ZWQiLCJCZWZvcmVSZWRhY3Rpb24iLCJvbkV2ZW50UmVxdWlyZXNVcGRhdGUiLCJSZXBsYWNlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJyZW5kZXIiLCJtc2dUeXBlIiwiZ2V0Q29udGVudCIsIm1zZ3R5cGUiLCJldlR5cGUiLCJnZXRUeXBlIiwiaGFzUmVuZGVyZXIiLCJpc0luZm9NZXNzYWdlIiwiaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24iLCJnZXRFdmVudERpc3BsYXlJbmZvIiwibG9nZ2VyIiwid2FybiIsImlzU3RhdGUiLCJfdCIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwibXhfUmVwbHlUaWxlX2luZm8iLCJpc1JlZGFjdGVkIiwibXhfUmVwbHlUaWxlX2F1ZGlvIiwiTXNnVHlwZSIsIkF1ZGlvIiwibXhfUmVwbHlUaWxlX3ZpZGVvIiwiVmlkZW8iLCJwZXJtYWxpbmsiLCJwZXJtYWxpbmtDcmVhdG9yIiwiZm9yRXZlbnQiLCJzZW5kZXIiLCJuZWVkc1NlbmRlclByb2ZpbGUiLCJJbWFnZSIsIkV2ZW50VHlwZSIsIlN0aWNrZXIiLCJSb29tQ3JlYXRlIiwibXNndHlwZU92ZXJyaWRlcyIsIk1JbWFnZVJlcGx5Qm9keSIsImlzVm9pY2VNZXNzYWdlIiwiTVZvaWNlTWVzc2FnZUJvZHkiLCJNRmlsZUJvZHkiLCJldk92ZXJyaWRlcyIsIm9uQ2xpY2siLCJyZW5kZXJSZXBseVRpbGUiLCJyZWYiLCJzaG93VXJsUHJldmlldyIsIm92ZXJyaWRlQm9keVR5cGVzIiwib3ZlcnJpZGVFdmVudFR5cGVzIiwibWF4SW1hZ2VIZWlnaHQiLCJoaWdobGlnaHRzIiwiaGlnaGxpZ2h0TGluayJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1JlcGx5VGlsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLTIwMjEgVHVsaXIgQXNva2FuIDx0dWxpckBtYXVuaXVtLm5ldD5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCwgTWF0cml4RXZlbnRFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSwgTXNnVHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBSZWxhdGlvbnMgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcmVsYXRpb25zJztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zJztcbmltcG9ydCB7IFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzJztcbmltcG9ydCBTZW5kZXJQcm9maWxlIGZyb20gXCIuLi9tZXNzYWdlcy9TZW5kZXJQcm9maWxlXCI7XG5pbXBvcnQgTUltYWdlUmVwbHlCb2R5IGZyb20gXCIuLi9tZXNzYWdlcy9NSW1hZ2VSZXBseUJvZHlcIjtcbmltcG9ydCB7IGlzVm9pY2VNZXNzYWdlIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvRXZlbnRVdGlscyc7XG5pbXBvcnQgeyBnZXRFdmVudERpc3BsYXlJbmZvIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0V2ZW50UmVuZGVyaW5nVXRpbHNcIjtcbmltcG9ydCBNRmlsZUJvZHkgZnJvbSBcIi4uL21lc3NhZ2VzL01GaWxlQm9keVwiO1xuaW1wb3J0IE1Wb2ljZU1lc3NhZ2VCb2R5IGZyb20gXCIuLi9tZXNzYWdlcy9NVm9pY2VNZXNzYWdlQm9keVwiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyByZW5kZXJSZXBseVRpbGUgfSBmcm9tIFwiLi4vLi4vLi4vZXZlbnRzL0V2ZW50VGlsZUZhY3RvcnlcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgcGVybWFsaW5rQ3JlYXRvcj86IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuICAgIGhpZ2hsaWdodHM/OiBzdHJpbmdbXTtcbiAgICBoaWdobGlnaHRMaW5rPzogc3RyaW5nO1xuICAgIG9uSGVpZ2h0Q2hhbmdlZD8oKTogdm9pZDtcbiAgICB0b2dnbGVFeHBhbmRlZFF1b3RlPzogKCkgPT4gdm9pZDtcbiAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD86IChcbiAgICAgICAgKGV2ZW50SWQ6IHN0cmluZywgcmVsYXRpb25UeXBlOiBzdHJpbmcsIGV2ZW50VHlwZTogc3RyaW5nKSA9PiBSZWxhdGlvbnNcbiAgICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBseVRpbGUgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHByaXZhdGUgYW5jaG9yRWxlbWVudCA9IGNyZWF0ZVJlZjxIVE1MQW5jaG9yRWxlbWVudD4oKTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIG9uSGVpZ2h0Q2hhbmdlZDogKCkgPT4ge30sXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub24oTWF0cml4RXZlbnRFdmVudC5EZWNyeXB0ZWQsIHRoaXMub25EZWNyeXB0ZWQpO1xuICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub24oTWF0cml4RXZlbnRFdmVudC5CZWZvcmVSZWRhY3Rpb24sIHRoaXMub25FdmVudFJlcXVpcmVzVXBkYXRlKTtcbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50Lm9uKE1hdHJpeEV2ZW50RXZlbnQuUmVwbGFjZWQsIHRoaXMub25FdmVudFJlcXVpcmVzVXBkYXRlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LnJlbW92ZUxpc3RlbmVyKE1hdHJpeEV2ZW50RXZlbnQuRGVjcnlwdGVkLCB0aGlzLm9uRGVjcnlwdGVkKTtcbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LnJlbW92ZUxpc3RlbmVyKE1hdHJpeEV2ZW50RXZlbnQuQmVmb3JlUmVkYWN0aW9uLCB0aGlzLm9uRXZlbnRSZXF1aXJlc1VwZGF0ZSk7XG4gICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5yZW1vdmVMaXN0ZW5lcihNYXRyaXhFdmVudEV2ZW50LlJlcGxhY2VkLCB0aGlzLm9uRXZlbnRSZXF1aXJlc1VwZGF0ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRlY3J5cHRlZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkV2ZW50UmVxdWlyZXNVcGRhdGUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIEZvcmNlIHVwZGF0ZSB3aGVuIG5lY2Vzc2FyeSAtIHJlZGFjdGlvbnMgYW5kIGVkaXRzXG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsaWNrID0gKGU6IFJlYWN0Lk1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgY2xpY2tUYXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgLy8gRm9sbG93aW5nIGEgbGluayB3aXRoaW4gYSByZXBseSBzaG91bGQgbm90IGRpc3BhdGNoIHRoZSBgdmlld19yb29tYCBhY3Rpb25cbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYnJvd3NlciBjYW4gZGlyZWN0IHRoZSB1c2VyIHRvIHRoZSBjb3JyZWN0IGxvY2F0aW9uXG4gICAgICAgIC8vIFRoZSBleGNlcHRpb24gYmVpbmcgdGhlIGxpbmsgd3JhcHBpbmcgdGhlIHJlcGx5XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGNsaWNrVGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gXCJhXCIgfHxcbiAgICAgICAgICAgIGNsaWNrVGFyZ2V0LmNsb3Nlc3QoXCJhXCIpID09PSBudWxsIHx8XG4gICAgICAgICAgICBjbGlja1RhcmdldCA9PT0gdGhpcy5hbmNob3JFbGVtZW50LmN1cnJlbnRcbiAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGFsbG93cyB0aGUgcGVybWFsaW5rIHRvIGJlIG9wZW5lZCBpbiBhIG5ldyB0YWIvd2luZG93IG9yIGNvcGllZCBhc1xuICAgICAgICAgICAgLy8gbWF0cml4LnRvLCBidXQgYWxzbyBmb3IgaXQgdG8gZW5hYmxlIHJvdXRpbmcgd2l0aGluIFJpb3Qgd2hlbiBjbGlja2VkLlxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgLy8gRXhwYW5kIHRocmVhZCBvbiBzaGlmdCBrZXlcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnRvZ2dsZUV4cGFuZGVkUXVvdGUgJiYgZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudG9nZ2xlRXhwYW5kZWRRdW90ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgICAgICBldmVudF9pZDogdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IG14RXZlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGNvbnN0IG1zZ1R5cGUgPSBteEV2ZW50LmdldENvbnRlbnQoKS5tc2d0eXBlO1xuICAgICAgICBjb25zdCBldlR5cGUgPSBteEV2ZW50LmdldFR5cGUoKSBhcyBFdmVudFR5cGU7XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgaGFzUmVuZGVyZXIsIGlzSW5mb01lc3NhZ2UsIGlzU2VlaW5nVGhyb3VnaE1lc3NhZ2VIaWRkZW5Gb3JNb2RlcmF0aW9uLFxuICAgICAgICB9ID0gZ2V0RXZlbnREaXNwbGF5SW5mbyhteEV2ZW50LCBmYWxzZSAvKiBSZXBsaWVzIGFyZSBuZXZlciBoaWRkZW4sIHNvIHRoaXMgc2hvdWxkIGJlIGZpbmUgKi8pO1xuICAgICAgICAvLyBUaGlzIHNob3VsZG4ndCBoYXBwZW46IHRoZSBjYWxsZXIgc2hvdWxkIGNoZWNrIHdlIHN1cHBvcnQgdGhpcyB0eXBlXG4gICAgICAgIC8vIGJlZm9yZSB0cnlpbmcgdG8gaW5zdGFudGlhdGUgdXNcbiAgICAgICAgaWYgKCFoYXNSZW5kZXJlcikge1xuICAgICAgICAgICAgY29uc3QgeyBteEV2ZW50IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYEV2ZW50IHR5cGUgbm90IHN1cHBvcnRlZDogdHlwZToke214RXZlbnQuZ2V0VHlwZSgpfSBpc1N0YXRlOiR7bXhFdmVudC5pc1N0YXRlKCl9YCk7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9SZXBseVRpbGUgbXhfUmVwbHlUaWxlX2luZm8gbXhfTU5vdGljZUJvZHlcIj5cbiAgICAgICAgICAgICAgICB7IF90KCdUaGlzIGV2ZW50IGNvdWxkIG5vdCBiZSBkaXNwbGF5ZWQnKSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1JlcGx5VGlsZVwiLCB7XG4gICAgICAgICAgICBteF9SZXBseVRpbGVfaW5mbzogaXNJbmZvTWVzc2FnZSAmJiAhbXhFdmVudC5pc1JlZGFjdGVkKCksXG4gICAgICAgICAgICBteF9SZXBseVRpbGVfYXVkaW86IG1zZ1R5cGUgPT09IE1zZ1R5cGUuQXVkaW8sXG4gICAgICAgICAgICBteF9SZXBseVRpbGVfdmlkZW86IG1zZ1R5cGUgPT09IE1zZ1R5cGUuVmlkZW8sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBwZXJtYWxpbmsgPSBcIiNcIjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcikge1xuICAgICAgICAgICAgcGVybWFsaW5rID0gdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yLmZvckV2ZW50KG14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VuZGVyO1xuICAgICAgICBjb25zdCBuZWVkc1NlbmRlclByb2ZpbGUgPSAoXG4gICAgICAgICAgICAhaXNJbmZvTWVzc2FnZVxuICAgICAgICAgICAgJiYgbXNnVHlwZSAhPT0gTXNnVHlwZS5JbWFnZVxuICAgICAgICAgICAgJiYgZXZUeXBlICE9PSBFdmVudFR5cGUuU3RpY2tlclxuICAgICAgICAgICAgJiYgZXZUeXBlICE9PSBFdmVudFR5cGUuUm9vbUNyZWF0ZVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChuZWVkc1NlbmRlclByb2ZpbGUpIHtcbiAgICAgICAgICAgIHNlbmRlciA9IDxTZW5kZXJQcm9maWxlXG4gICAgICAgICAgICAgICAgbXhFdmVudD17bXhFdmVudH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbXNndHlwZU92ZXJyaWRlczogUmVjb3JkPHN0cmluZywgdHlwZW9mIFJlYWN0LkNvbXBvbmVudD4gPSB7XG4gICAgICAgICAgICBbTXNnVHlwZS5JbWFnZV06IE1JbWFnZVJlcGx5Qm9keSxcbiAgICAgICAgICAgIC8vIE92ZXJyaWRlIGF1ZGlvIGFuZCB2aWRlbyBib2R5IHdpdGggZmlsZSBib2R5LiBXZSBhbHNvIGhpZGUgdGhlIGRvd25sb2FkL2RlY3J5cHQgYnV0dG9uIHVzaW5nIENTU1xuICAgICAgICAgICAgW01zZ1R5cGUuQXVkaW9dOiBpc1ZvaWNlTWVzc2FnZShteEV2ZW50KSA/IE1Wb2ljZU1lc3NhZ2VCb2R5IDogTUZpbGVCb2R5LFxuICAgICAgICAgICAgW01zZ1R5cGUuVmlkZW9dOiBNRmlsZUJvZHksXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGV2T3ZlcnJpZGVzOiBSZWNvcmQ8c3RyaW5nLCB0eXBlb2YgUmVhY3QuQ29tcG9uZW50PiA9IHtcbiAgICAgICAgICAgIC8vIFVzZSBNSW1hZ2VSZXBseUJvZHkgc28gdGhhdCB0aGUgc3RpY2tlciBpc24ndCB0YWtpbmcgdXAgYSBsb3Qgb2Ygc3BhY2VcbiAgICAgICAgICAgIFtFdmVudFR5cGUuU3RpY2tlcl06IE1JbWFnZVJlcGx5Qm9keSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9e3Blcm1hbGlua30gb25DbGljaz17dGhpcy5vbkNsaWNrfSByZWY9e3RoaXMuYW5jaG9yRWxlbWVudH0+XG4gICAgICAgICAgICAgICAgICAgIHsgc2VuZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgeyByZW5kZXJSZXBseVRpbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5wcm9wcyxcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93VXJsUHJldmlldzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVycmlkZUJvZHlUeXBlczogbXNndHlwZU92ZXJyaWRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJyaWRlRXZlbnRUeXBlczogZXZPdmVycmlkZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhJbWFnZUhlaWdodDogOTYsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc1NlZWluZ1Rocm91Z2hNZXNzYWdlSGlkZGVuRm9yTW9kZXJhdGlvbixcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXBwZWFzZSBUU1xuICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0czogdGhpcy5wcm9wcy5oaWdobGlnaHRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0TGluazogdGhpcy5wcm9wcy5oaWdobGlnaHRMaW5rLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25IZWlnaHRDaGFuZ2VkOiB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I6IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICAgICAgfSwgZmFsc2UgLyogc2hvd0hpZGRlbkV2ZW50cyBzaG91bGRuJ3QgYmUgcmVsZXZhbnQgKi8pIH1cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7O0FBY2UsTUFBTUEsU0FBTixTQUF3QkMsY0FBQSxDQUFNQyxhQUE5QixDQUFvRDtFQUFBO0lBQUE7SUFBQSxrRUFDdkMsSUFBQUMsZ0JBQUEsR0FEdUM7SUFBQSxtREFtQnpDLE1BQVk7TUFDOUIsS0FBS0MsV0FBTDs7TUFDQSxJQUFJLEtBQUtDLEtBQUwsQ0FBV0MsZUFBZixFQUFnQztRQUM1QixLQUFLRCxLQUFMLENBQVdDLGVBQVg7TUFDSDtJQUNKLENBeEI4RDtJQUFBLDZEQTBCL0IsTUFBWTtNQUN4QztNQUNBLEtBQUtGLFdBQUw7SUFDSCxDQTdCOEQ7SUFBQSwrQ0ErQjVDRyxDQUFELElBQStCO01BQzdDLE1BQU1DLFdBQVcsR0FBR0QsQ0FBQyxDQUFDRSxNQUF0QixDQUQ2QyxDQUU3QztNQUNBO01BQ0E7O01BQ0EsSUFDSUQsV0FBVyxDQUFDRSxPQUFaLENBQW9CQyxXQUFwQixPQUFzQyxHQUF0QyxJQUNBSCxXQUFXLENBQUNJLE9BQVosQ0FBb0IsR0FBcEIsTUFBNkIsSUFEN0IsSUFFQUosV0FBVyxLQUFLLEtBQUtLLGFBQUwsQ0FBbUJDLE9BSHZDLEVBSUU7UUFDRTtRQUNBO1FBQ0FQLENBQUMsQ0FBQ1EsY0FBRixHQUhGLENBSUU7O1FBQ0EsSUFBSSxLQUFLVixLQUFMLENBQVdXLG1CQUFYLElBQWtDVCxDQUFDLENBQUNVLFFBQXhDLEVBQWtEO1VBQzlDLEtB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