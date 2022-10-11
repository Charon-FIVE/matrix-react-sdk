"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _actions = require("../../../dispatcher/actions");

var _Spinner = _interopRequireDefault(require("./Spinner"));

var _ReplyTile = _interopRequireDefault(require("../rooms/ReplyTile"));

var _Pill = _interopRequireWildcard(require("./Pill"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _Reply = require("../../../utils/Reply");

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 - 2021 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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

/**
 * This number is based on the previous behavior - if we have message of height
 * over 60px then we want to show button that will allow to expand it.
 */
const SHOW_EXPAND_QUOTE_PIXELS = 60;

// This component does no cycle detection, simply because the only way to make such a cycle would be to
// craft event_id's, using a homeserver that generates predictable event IDs; even then the impact would
// be low as each event being loaded (after the first) is triggered by an explicit user action.
class ReplyChain extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "room", void 0);
    (0, _defineProperty2.default)(this, "blockquoteRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "canCollapse", () => {
      return this.state.events.length > 1;
    });
    (0, _defineProperty2.default)(this, "collapse", () => {
      this.initialize();
    });
    (0, _defineProperty2.default)(this, "onQuoteClick", async event => {
      const events = [this.state.loadedEv, ...this.state.events];
      let loadedEv = null;

      if (events.length > 0) {
        loadedEv = await this.getNextEvent(events[0]);
      }

      this.setState({
        loadedEv,
        events
      });

      _dispatcher.default.fire(_actions.Action.FocusSendMessageComposer);
    });
    this.state = {
      events: [],
      loadedEv: null,
      loading: true,
      err: false
    };
    this.room = this.matrixClient.getRoom(this.props.parentEv.getRoomId());
  }

  get matrixClient() {
    return _MatrixClientPeg.MatrixClientPeg.get();
  }

  componentDidMount() {
    this.initialize();
    this.trySetExpandableQuotes();
  }

  componentDidUpdate() {
    this.props.onHeightChanged();
    this.trySetExpandableQuotes();
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  trySetExpandableQuotes() {
    if (this.props.isQuoteExpanded === undefined && this.blockquoteRef.current) {
      const el = this.blockquoteRef.current.querySelector('.mx_EventTile_body');

      if (el) {
        const code = el.querySelector('code');
        const isCodeEllipsisShown = code ? code.offsetHeight >= SHOW_EXPAND_QUOTE_PIXELS : false;
        const isElipsisShown = el.offsetHeight >= SHOW_EXPAND_QUOTE_PIXELS || isCodeEllipsisShown;

        if (isElipsisShown) {
          this.props.setQuoteExpanded(false);
        }
      }
    }
  }

  async initialize() {
    const {
      parentEv
    } = this.props; // at time of making this component we checked that props.parentEv has a parentEventId

    const ev = await this.getEvent((0, _Reply.getParentEventId)(parentEv));
    if (this.unmounted) return;

    if (ev) {
      const loadedEv = await this.getNextEvent(ev);
      this.setState({
        events: [ev],
        loadedEv,
        loading: false
      });
    } else {
      this.setState({
        err: true
      });
    }
  }

  async getNextEvent(ev) {
    try {
      const inReplyToEventId = (0, _Reply.getParentEventId)(ev);
      return await this.getEvent(inReplyToEventId);
    } catch (e) {
      return null;
    }
  }

  async getEvent(eventId) {
    if (!eventId) return null;
    const event = this.room.findEventById(eventId);
    if (event) return event;

    try {
      // ask the client to fetch the event we want using the context API, only interface to do so is to ask
      // for a timeline with that event, but once it is loaded we can use findEventById to look up the ev map
      await this.matrixClient.getEventTimeline(this.room.getUnfilteredTimelineSet(), eventId);
    } catch (e) {
      // if it fails catch the error and return early, there's no point trying to find the event in this case.
      // Return null as it is falsy and thus should be treated as an error (as the event cannot be resolved).
      return null;
    }

    return this.room.findEventById(eventId);
  }

  getReplyChainColorClass(ev) {
    return (0, _FormattingUtils.getUserNameColorClass)(ev.getSender()).replace("Username", "ReplyChain");
  }

  render() {
    let header = null;

    if (this.state.err) {
      header = /*#__PURE__*/_react.default.createElement("blockquote", {
        className: "mx_ReplyChain mx_ReplyChain_error"
      }, (0, _languageHandler._t)('Unable to load event that was replied to, ' + 'it either does not exist or you do not have permission to view it.'));
    } else if (this.state.loadedEv && (0, _Reply.shouldDisplayReply)(this.state.events[0])) {
      const ev = this.state.loadedEv;
      const room = this.matrixClient.getRoom(ev.getRoomId());
      header = /*#__PURE__*/_react.default.createElement("blockquote", {
        className: `mx_ReplyChain ${this.getReplyChainColorClass(ev)}`
      }, (0, _languageHandler._t)('<a>In reply to</a> <pill>', {}, {
        'a': sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          className: "mx_ReplyChain_show",
          onClick: this.onQuoteClick
        }, sub),
        'pill': /*#__PURE__*/_react.default.createElement(_Pill.default, {
          type: _Pill.PillType.UserMention,
          room: room,
          url: (0, _Permalinks.makeUserPermalink)(ev.getSender()),
          shouldShowPillAvatar: _SettingsStore.default.getValue("Pill.shouldShowPillAvatar")
        })
      }));
    } else if (this.props.forExport) {
      const eventId = (0, _Reply.getParentEventId)(this.props.parentEv);
      header = /*#__PURE__*/_react.default.createElement("p", {
        className: "mx_ReplyChain_Export"
      }, (0, _languageHandler._t)("In reply to <a>this message</a>", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          className: "mx_reply_anchor",
          href: `#${eventId}`,
          "scroll-to": eventId
        }, " ", sub, " ")
      }));
    } else if (this.state.loading) {
      header = /*#__PURE__*/_react.default.createElement(_Spinner.default, {
        w: 16,
        h: 16
      });
    }

    const {
      isQuoteExpanded
    } = this.props;
    const evTiles = this.state.events.map(ev => {
      const classname = (0, _classnames.default)({
        'mx_ReplyChain': true,
        [this.getReplyChainColorClass(ev)]: true,
        // We don't want to add the class if it's undefined, it should only be expanded/collapsed when it's true/false
        'mx_ReplyChain--expanded': isQuoteExpanded === true,
        // We don't want to add the class if it's undefined, it should only be expanded/collapsed when it's true/false
        'mx_ReplyChain--collapsed': isQuoteExpanded === false
      });
      return /*#__PURE__*/_react.default.createElement("blockquote", {
        ref: this.blockquoteRef,
        className: classname,
        key: ev.getId()
      }, /*#__PURE__*/_react.default.createElement(_ReplyTile.default, {
        mxEvent: ev,
        onHeightChanged: this.props.onHeightChanged,
        permalinkCreator: this.props.permalinkCreator,
        toggleExpandedQuote: () => this.props.setQuoteExpanded(!this.props.isQuoteExpanded),
        getRelationsForEvent: this.props.getRelationsForEvent
      }));
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ReplyChain_wrapper"
    }, /*#__PURE__*/_react.default.createElement("div", null, header), /*#__PURE__*/_react.default.createElement("div", null, evTiles));
  }

}

exports.default = ReplyChain;
(0, _defineProperty2.default)(ReplyChain, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTSE9XX0VYUEFORF9RVU9URV9QSVhFTFMiLCJSZXBseUNoYWluIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImNyZWF0ZVJlZiIsInN0YXRlIiwiZXZlbnRzIiwibGVuZ3RoIiwiaW5pdGlhbGl6ZSIsImV2ZW50IiwibG9hZGVkRXYiLCJnZXROZXh0RXZlbnQiLCJzZXRTdGF0ZSIsImRpcyIsImZpcmUiLCJBY3Rpb24iLCJGb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIiLCJsb2FkaW5nIiwiZXJyIiwicm9vbSIsIm1hdHJpeENsaWVudCIsImdldFJvb20iLCJwYXJlbnRFdiIsImdldFJvb21JZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImNvbXBvbmVudERpZE1vdW50IiwidHJ5U2V0RXhwYW5kYWJsZVF1b3RlcyIsImNvbXBvbmVudERpZFVwZGF0ZSIsIm9uSGVpZ2h0Q2hhbmdlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5tb3VudGVkIiwiaXNRdW90ZUV4cGFuZGVkIiwidW5kZWZpbmVkIiwiYmxvY2txdW90ZVJlZiIsImN1cnJlbnQiLCJlbCIsInF1ZXJ5U2VsZWN0b3IiLCJjb2RlIiwiaXNDb2RlRWxsaXBzaXNTaG93biIsIm9mZnNldEhlaWdodCIsImlzRWxpcHNpc1Nob3duIiwic2V0UXVvdGVFeHBhbmRlZCIsImV2IiwiZ2V0RXZlbnQiLCJnZXRQYXJlbnRFdmVudElkIiwiaW5SZXBseVRvRXZlbnRJZCIsImUiLCJldmVudElkIiwiZmluZEV2ZW50QnlJZCIsImdldEV2ZW50VGltZWxpbmUiLCJnZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQiLCJnZXRSZXBseUNoYWluQ29sb3JDbGFzcyIsImdldFVzZXJOYW1lQ29sb3JDbGFzcyIsImdldFNlbmRlciIsInJlcGxhY2UiLCJyZW5kZXIiLCJoZWFkZXIiLCJfdCIsInNob3VsZERpc3BsYXlSZXBseSIsInN1YiIsIm9uUXVvdGVDbGljayIsIlBpbGxUeXBlIiwiVXNlck1lbnRpb24iLCJtYWtlVXNlclBlcm1hbGluayIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImZvckV4cG9ydCIsImEiLCJldlRpbGVzIiwibWFwIiwiY2xhc3NuYW1lIiwiY2xhc3NOYW1lcyIsImdldElkIiwicGVybWFsaW5rQ3JlYXRvciIsImdldFJlbGF0aW9uc0ZvckV2ZW50IiwiUm9vbUNvbnRleHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9SZXBseUNoYWluLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudCc7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IHsgUmVsYXRpb25zIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3JlbGF0aW9ucyc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBtYWtlVXNlclBlcm1hbGluaywgUm9vbVBlcm1hbGlua0NyZWF0b3IgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL2VudW1zL0xheW91dFwiO1xuaW1wb3J0IHsgZ2V0VXNlck5hbWVDb2xvckNsYXNzIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0Zvcm1hdHRpbmdVdGlsc1wiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSAnLi9TcGlubmVyJztcbmltcG9ydCBSZXBseVRpbGUgZnJvbSBcIi4uL3Jvb21zL1JlcGx5VGlsZVwiO1xuaW1wb3J0IFBpbGwsIHsgUGlsbFR5cGUgfSBmcm9tICcuL1BpbGwnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tICcuL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHsgZ2V0UGFyZW50RXZlbnRJZCwgc2hvdWxkRGlzcGxheVJlcGx5IH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvUmVwbHknO1xuaW1wb3J0IFJvb21Db250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcblxuLyoqXG4gKiBUaGlzIG51bWJlciBpcyBiYXNlZCBvbiB0aGUgcHJldmlvdXMgYmVoYXZpb3IgLSBpZiB3ZSBoYXZlIG1lc3NhZ2Ugb2YgaGVpZ2h0XG4gKiBvdmVyIDYwcHggdGhlbiB3ZSB3YW50IHRvIHNob3cgYnV0dG9uIHRoYXQgd2lsbCBhbGxvdyB0byBleHBhbmQgaXQuXG4gKi9cbmNvbnN0IFNIT1dfRVhQQU5EX1FVT1RFX1BJWEVMUyA9IDYwO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyB0aGUgbGF0ZXN0IGV2ZW50IGluIHRoaXMgY2hhaW4gb2YgcmVwbGllc1xuICAgIHBhcmVudEV2PzogTWF0cml4RXZlbnQ7XG4gICAgLy8gY2FsbGVkIHdoZW4gdGhlIFJlcGx5Q2hhaW4gY29udGVudHMgaGFzIGNoYW5nZWQsIGluY2x1ZGluZyBFdmVudFRpbGVzIHRoZXJlb2ZcbiAgICBvbkhlaWdodENoYW5nZWQ6ICgpID0+IHZvaWQ7XG4gICAgcGVybWFsaW5rQ3JlYXRvcjogUm9vbVBlcm1hbGlua0NyZWF0b3I7XG4gICAgLy8gU3BlY2lmaWVzIHdoaWNoIGxheW91dCB0byB1c2UuXG4gICAgbGF5b3V0PzogTGF5b3V0O1xuICAgIC8vIFdoZXRoZXIgdG8gYWx3YXlzIHNob3cgYSB0aW1lc3RhbXBcbiAgICBhbHdheXNTaG93VGltZXN0YW1wcz86IGJvb2xlYW47XG4gICAgZm9yRXhwb3J0PzogYm9vbGVhbjtcbiAgICBpc1F1b3RlRXhwYW5kZWQ/OiBib29sZWFuO1xuICAgIHNldFF1b3RlRXhwYW5kZWQ6IChpc0V4cGFuZGVkOiBib29sZWFuKSA9PiB2b2lkO1xuICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PzogKFxuICAgICAgICAoZXZlbnRJZDogc3RyaW5nLCByZWxhdGlvblR5cGU6IHN0cmluZywgZXZlbnRUeXBlOiBzdHJpbmcpID0+IFJlbGF0aW9uc1xuICAgICk7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIC8vIFRoZSBsb2FkZWQgZXZlbnRzIHRvIGJlIHJlbmRlcmVkIGFzIGxpbmVhci1yZXBsaWVzXG4gICAgZXZlbnRzOiBNYXRyaXhFdmVudFtdO1xuICAgIC8vIFRoZSBsYXRlc3QgbG9hZGVkIGV2ZW50IHdoaWNoIGhhcyBub3QgeWV0IGJlZW4gc2hvd25cbiAgICBsb2FkZWRFdjogTWF0cml4RXZlbnQ7XG4gICAgLy8gV2hldGhlciB0aGUgY29tcG9uZW50IGlzIHN0aWxsIGxvYWRpbmcgbW9yZSBldmVudHNcbiAgICBsb2FkaW5nOiBib29sZWFuO1xuICAgIC8vIFdoZXRoZXIgYXMgZXJyb3Igd2FzIGVuY291bnRlcmVkIGZldGNoaW5nIGEgcmVwbGllZCB0byBldmVudC5cbiAgICBlcnI6IGJvb2xlYW47XG59XG5cbi8vIFRoaXMgY29tcG9uZW50IGRvZXMgbm8gY3ljbGUgZGV0ZWN0aW9uLCBzaW1wbHkgYmVjYXVzZSB0aGUgb25seSB3YXkgdG8gbWFrZSBzdWNoIGEgY3ljbGUgd291bGQgYmUgdG9cbi8vIGNyYWZ0IGV2ZW50X2lkJ3MsIHVzaW5nIGEgaG9tZXNlcnZlciB0aGF0IGdlbmVyYXRlcyBwcmVkaWN0YWJsZSBldmVudCBJRHM7IGV2ZW4gdGhlbiB0aGUgaW1wYWN0IHdvdWxkXG4vLyBiZSBsb3cgYXMgZWFjaCBldmVudCBiZWluZyBsb2FkZWQgKGFmdGVyIHRoZSBmaXJzdCkgaXMgdHJpZ2dlcmVkIGJ5IGFuIGV4cGxpY2l0IHVzZXIgYWN0aW9uLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwbHlDaGFpbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0PjtcblxuICAgIHByaXZhdGUgdW5tb3VudGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSByb29tOiBSb29tO1xuICAgIHByaXZhdGUgYmxvY2txdW90ZVJlZiA9IFJlYWN0LmNyZWF0ZVJlZjxIVE1MRWxlbWVudD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMsIGNvbnRleHQ6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD4pIHtcbiAgICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICAgICAgbG9hZGVkRXY6IG51bGwsXG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgZXJyOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucGFyZW50RXYuZ2V0Um9vbUlkKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IG1hdHJpeENsaWVudCgpOiBNYXRyaXhDbGllbnQge1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICAgICAgdGhpcy50cnlTZXRFeHBhbmRhYmxlUXVvdGVzKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCgpO1xuICAgICAgICB0aGlzLnRyeVNldEV4cGFuZGFibGVRdW90ZXMoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgdHJ5U2V0RXhwYW5kYWJsZVF1b3RlcygpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNRdW90ZUV4cGFuZGVkID09PSB1bmRlZmluZWQgJiYgdGhpcy5ibG9ja3F1b3RlUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSB0aGlzLmJsb2NrcXVvdGVSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yKCcubXhfRXZlbnRUaWxlX2JvZHknKTtcbiAgICAgICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ2NvZGUnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0NvZGVFbGxpcHNpc1Nob3duID0gY29kZSA/IGNvZGUub2Zmc2V0SGVpZ2h0ID49IFNIT1dfRVhQQU5EX1FVT1RFX1BJWEVMUyA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzRWxpcHNpc1Nob3duID0gZWwub2Zmc2V0SGVpZ2h0ID49IFNIT1dfRVhQQU5EX1FVT1RFX1BJWEVMUyB8fCBpc0NvZGVFbGxpcHNpc1Nob3duO1xuICAgICAgICAgICAgICAgIGlmIChpc0VsaXBzaXNTaG93bikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNldFF1b3RlRXhwYW5kZWQoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgeyBwYXJlbnRFdiB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgLy8gYXQgdGltZSBvZiBtYWtpbmcgdGhpcyBjb21wb25lbnQgd2UgY2hlY2tlZCB0aGF0IHByb3BzLnBhcmVudEV2IGhhcyBhIHBhcmVudEV2ZW50SWRcbiAgICAgICAgY29uc3QgZXYgPSBhd2FpdCB0aGlzLmdldEV2ZW50KGdldFBhcmVudEV2ZW50SWQocGFyZW50RXYpKTtcblxuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICBpZiAoZXYpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRlZEV2ID0gYXdhaXQgdGhpcy5nZXROZXh0RXZlbnQoZXYpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXZlbnRzOiBbZXZdLFxuICAgICAgICAgICAgICAgIGxvYWRlZEV2LFxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXROZXh0RXZlbnQoZXY6IE1hdHJpeEV2ZW50KTogUHJvbWlzZTxNYXRyaXhFdmVudD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgaW5SZXBseVRvRXZlbnRJZCA9IGdldFBhcmVudEV2ZW50SWQoZXYpO1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0RXZlbnQoaW5SZXBseVRvRXZlbnRJZCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRFdmVudChldmVudElkOiBzdHJpbmcpOiBQcm9taXNlPE1hdHJpeEV2ZW50PiB7XG4gICAgICAgIGlmICghZXZlbnRJZCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5yb29tLmZpbmRFdmVudEJ5SWQoZXZlbnRJZCk7XG4gICAgICAgIGlmIChldmVudCkgcmV0dXJuIGV2ZW50O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBhc2sgdGhlIGNsaWVudCB0byBmZXRjaCB0aGUgZXZlbnQgd2Ugd2FudCB1c2luZyB0aGUgY29udGV4dCBBUEksIG9ubHkgaW50ZXJmYWNlIHRvIGRvIHNvIGlzIHRvIGFza1xuICAgICAgICAgICAgLy8gZm9yIGEgdGltZWxpbmUgd2l0aCB0aGF0IGV2ZW50LCBidXQgb25jZSBpdCBpcyBsb2FkZWQgd2UgY2FuIHVzZSBmaW5kRXZlbnRCeUlkIHRvIGxvb2sgdXAgdGhlIGV2IG1hcFxuICAgICAgICAgICAgYXdhaXQgdGhpcy5tYXRyaXhDbGllbnQuZ2V0RXZlbnRUaW1lbGluZSh0aGlzLnJvb20uZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0KCksIGV2ZW50SWQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBpZiBpdCBmYWlscyBjYXRjaCB0aGUgZXJyb3IgYW5kIHJldHVybiBlYXJseSwgdGhlcmUncyBubyBwb2ludCB0cnlpbmcgdG8gZmluZCB0aGUgZXZlbnQgaW4gdGhpcyBjYXNlLlxuICAgICAgICAgICAgLy8gUmV0dXJuIG51bGwgYXMgaXQgaXMgZmFsc3kgYW5kIHRodXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgYW4gZXJyb3IgKGFzIHRoZSBldmVudCBjYW5ub3QgYmUgcmVzb2x2ZWQpLlxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucm9vbS5maW5kRXZlbnRCeUlkKGV2ZW50SWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5Db2xsYXBzZSA9ICgpOiBib29sZWFuID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZXZlbnRzLmxlbmd0aCA+IDE7XG4gICAgfTtcblxuICAgIHB1YmxpYyBjb2xsYXBzZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25RdW90ZUNsaWNrID0gYXN5bmMgKGV2ZW50OiBCdXR0b25FdmVudCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBldmVudHMgPSBbdGhpcy5zdGF0ZS5sb2FkZWRFdiwgLi4udGhpcy5zdGF0ZS5ldmVudHNdO1xuXG4gICAgICAgIGxldCBsb2FkZWRFdiA9IG51bGw7XG4gICAgICAgIGlmIChldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbG9hZGVkRXYgPSBhd2FpdCB0aGlzLmdldE5leHRFdmVudChldmVudHNbMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkZWRFdixcbiAgICAgICAgICAgIGV2ZW50cyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLkZvY3VzU2VuZE1lc3NhZ2VDb21wb3Nlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0UmVwbHlDaGFpbkNvbG9yQ2xhc3MoZXY6IE1hdHJpeEV2ZW50KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGdldFVzZXJOYW1lQ29sb3JDbGFzcyhldi5nZXRTZW5kZXIoKSkucmVwbGFjZShcIlVzZXJuYW1lXCIsIFwiUmVwbHlDaGFpblwiKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBoZWFkZXIgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnIpIHtcbiAgICAgICAgICAgIGhlYWRlciA9IDxibG9ja3F1b3RlIGNsYXNzTmFtZT1cIm14X1JlcGx5Q2hhaW4gbXhfUmVwbHlDaGFpbl9lcnJvclwiPlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgX3QoJ1VuYWJsZSB0byBsb2FkIGV2ZW50IHRoYXQgd2FzIHJlcGxpZWQgdG8sICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2l0IGVpdGhlciBkb2VzIG5vdCBleGlzdCBvciB5b3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byB2aWV3IGl0LicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9ibG9ja3F1b3RlPjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmxvYWRlZEV2ICYmIHNob3VsZERpc3BsYXlSZXBseSh0aGlzLnN0YXRlLmV2ZW50c1swXSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ID0gdGhpcy5zdGF0ZS5sb2FkZWRFdjtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKGV2LmdldFJvb21JZCgpKTtcbiAgICAgICAgICAgIGhlYWRlciA9IDxibG9ja3F1b3RlIGNsYXNzTmFtZT17YG14X1JlcGx5Q2hhaW4gJHt0aGlzLmdldFJlcGx5Q2hhaW5Db2xvckNsYXNzKGV2KX1gfT5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIF90KCc8YT5JbiByZXBseSB0bzwvYT4gPHBpbGw+Jywge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rX2lubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1JlcGx5Q2hhaW5fc2hvd1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25RdW90ZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAncGlsbCc6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8UGlsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPXtQaWxsVHlwZS5Vc2VyTWVudGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsPXttYWtlVXNlclBlcm1hbGluayhldi5nZXRTZW5kZXIoKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFNob3dQaWxsQXZhdGFyPXtTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUGlsbC5zaG91bGRTaG93UGlsbEF2YXRhclwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2Jsb2NrcXVvdGU+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZm9yRXhwb3J0KSB7XG4gICAgICAgICAgICBjb25zdCBldmVudElkID0gZ2V0UGFyZW50RXZlbnRJZCh0aGlzLnByb3BzLnBhcmVudEV2KTtcbiAgICAgICAgICAgIGhlYWRlciA9IDxwIGNsYXNzTmFtZT1cIm14X1JlcGx5Q2hhaW5fRXhwb3J0XCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIkluIHJlcGx5IHRvIDxhPnRoaXMgbWVzc2FnZTwvYT5cIixcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIHsgYTogKHN1YikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3NOYW1lPVwibXhfcmVwbHlfYW5jaG9yXCIgaHJlZj17YCMke2V2ZW50SWR9YH0gc2Nyb2xsLXRvPXtldmVudElkfT4geyBzdWIgfSA8L2E+XG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9wPjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgICAgICAgIGhlYWRlciA9IDxTcGlubmVyIHc9ezE2fSBoPXsxNn0gLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IGlzUXVvdGVFeHBhbmRlZCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgZXZUaWxlcyA9IHRoaXMuc3RhdGUuZXZlbnRzLm1hcCgoZXYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzbmFtZSA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICdteF9SZXBseUNoYWluJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBbdGhpcy5nZXRSZXBseUNoYWluQ29sb3JDbGFzcyhldildOiB0cnVlLFxuICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gYWRkIHRoZSBjbGFzcyBpZiBpdCdzIHVuZGVmaW5lZCwgaXQgc2hvdWxkIG9ubHkgYmUgZXhwYW5kZWQvY29sbGFwc2VkIHdoZW4gaXQncyB0cnVlL2ZhbHNlXG4gICAgICAgICAgICAgICAgJ214X1JlcGx5Q2hhaW4tLWV4cGFuZGVkJzogaXNRdW90ZUV4cGFuZGVkID09PSB0cnVlLFxuICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gYWRkIHRoZSBjbGFzcyBpZiBpdCdzIHVuZGVmaW5lZCwgaXQgc2hvdWxkIG9ubHkgYmUgZXhwYW5kZWQvY29sbGFwc2VkIHdoZW4gaXQncyB0cnVlL2ZhbHNlXG4gICAgICAgICAgICAgICAgJ214X1JlcGx5Q2hhaW4tLWNvbGxhcHNlZCc6IGlzUXVvdGVFeHBhbmRlZCA9PT0gZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGJsb2NrcXVvdGUgcmVmPXt0aGlzLmJsb2NrcXVvdGVSZWZ9IGNsYXNzTmFtZT17Y2xhc3NuYW1lfSBrZXk9e2V2LmdldElkKCl9PlxuICAgICAgICAgICAgICAgICAgICA8UmVwbHlUaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXtldn1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVFeHBhbmRlZFF1b3RlPXsoKSA9PiB0aGlzLnByb3BzLnNldFF1b3RlRXhwYW5kZWQoIXRoaXMucHJvcHMuaXNRdW90ZUV4cGFuZGVkKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50PXt0aGlzLnByb3BzLmdldFJlbGF0aW9uc0ZvckV2ZW50fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1JlcGx5Q2hhaW5fd3JhcHBlclwiPlxuICAgICAgICAgICAgPGRpdj57IGhlYWRlciB9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2PnsgZXZUaWxlcyB9PC9kaXY+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztB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