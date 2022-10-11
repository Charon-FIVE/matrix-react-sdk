"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _event2 = require("matrix-js-sdk/src/models/event");

var _classnames = _interopRequireDefault(require("classnames"));

var HtmlUtils = _interopRequireWildcard(require("../../../HtmlUtils"));

var _MessageDiffUtils = require("../../../utils/MessageDiffUtils");

var _DateUtils = require("../../../DateUtils");

var _pillify = require("../../../utils/pillify");

var _tooltipify = require("../../../utils/tooltipify");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _RedactedBody = _interopRequireDefault(require("./RedactedBody"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _ConfirmAndWaitRedactDialog = _interopRequireDefault(require("../dialogs/ConfirmAndWaitRedactDialog"));

var _ViewSource = _interopRequireDefault(require("../../structures/ViewSource"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

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
function getReplacedContent(event) {
  const originalContent = event.getOriginalContent();
  return originalContent["m.new_content"] || originalContent;
}

class EditHistoryMessage extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "content", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "pills", []);
    (0, _defineProperty2.default)(this, "tooltips", []);
    (0, _defineProperty2.default)(this, "onAssociatedStatusChanged", () => {
      this.setState({
        sendStatus: this.props.mxEvent.getAssociatedStatus()
      });
    });
    (0, _defineProperty2.default)(this, "onRedactClick", async () => {
      const event = this.props.mxEvent;

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      _Modal.default.createDialog(_ConfirmAndWaitRedactDialog.default, {
        redact: () => cli.redactEvent(event.getRoomId(), event.getId())
      }, 'mx_Dialog_confirmredact');
    });
    (0, _defineProperty2.default)(this, "onViewSourceClick", () => {
      _Modal.default.createDialog(_ViewSource.default, {
        mxEvent: this.props.mxEvent
      }, 'mx_Dialog_viewsource');
    });

    const _cli = _MatrixClientPeg.MatrixClientPeg.get();

    const {
      userId
    } = _cli.credentials;
    const _event = this.props.mxEvent;

    const room = _cli.getRoom(_event.getRoomId());

    if (_event.localRedactionEvent()) {
      _event.localRedactionEvent().on(_event2.MatrixEventEvent.Status, this.onAssociatedStatusChanged);
    }

    const canRedact = room.currentState.maySendRedactionForEvent(_event, userId);
    this.state = {
      canRedact,
      sendStatus: _event.getAssociatedStatus()
    };
  }

  pillifyLinks() {
    // not present for redacted events
    if (this.content.current) {
      (0, _pillify.pillifyLinks)(this.content.current.children, this.props.mxEvent, this.pills);
    }
  }

  tooltipifyLinks() {
    // not present for redacted events
    if (this.content.current) {
      (0, _tooltipify.tooltipifyLinks)(this.content.current.children, this.pills, this.tooltips);
    }
  }

  componentDidMount() {
    this.pillifyLinks();
    this.tooltipifyLinks();
  }

  componentWillUnmount() {
    (0, _pillify.unmountPills)(this.pills);
    (0, _tooltipify.unmountTooltips)(this.tooltips);
    const event = this.props.mxEvent;

    if (event.localRedactionEvent()) {
      event.localRedactionEvent().off(_event2.MatrixEventEvent.Status, this.onAssociatedStatusChanged);
    }
  }

  componentDidUpdate() {
    this.pillifyLinks();
    this.tooltipifyLinks();
  }

  renderActionBar() {
    // hide the button when already redacted
    let redactButton;

    if (!this.props.mxEvent.isRedacted() && !this.props.isBaseEvent && this.state.canRedact) {
      redactButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onRedactClick
      }, (0, _languageHandler._t)("Remove"));
    }

    let viewSourceButton;

    if (_SettingsStore.default.getValue("developerMode")) {
      viewSourceButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onViewSourceClick
      }, (0, _languageHandler._t)("View Source"));
    } // disabled remove button when not allowed


    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageActionBar"
    }, redactButton, viewSourceButton);
  }

  render() {
    const {
      mxEvent
    } = this.props;
    const content = getReplacedContent(mxEvent);
    let contentContainer;

    if (mxEvent.isRedacted()) {
      contentContainer = /*#__PURE__*/_react.default.createElement(_RedactedBody.default, {
        mxEvent: this.props.mxEvent
      });
    } else {
      let contentElements;

      if (this.props.previousEdit) {
        contentElements = (0, _MessageDiffUtils.editBodyDiffToHtml)(getReplacedContent(this.props.previousEdit), content);
      } else {
        contentElements = HtmlUtils.bodyToHtml(content, null, {
          stripReplyFallback: true,
          returnString: false
        });
      }

      if (mxEvent.getContent().msgtype === "m.emote") {
        const name = mxEvent.sender ? mxEvent.sender.name : mxEvent.getSender();
        contentContainer = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_EventTile_content",
          ref: this.content
        }, "*\xA0", /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MEmoteBody_sender"
        }, name), "\xA0", contentElements);
      } else {
        contentContainer = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_EventTile_content",
          ref: this.content
        }, contentElements);
      }
    }

    const timestamp = (0, _DateUtils.formatTime)(new Date(mxEvent.getTs()), this.props.isTwelveHour);
    const isSending = ['sending', 'queued', 'encrypting'].indexOf(this.state.sendStatus) !== -1;
    const classes = (0, _classnames.default)({
      "mx_EventTile": true,
      // Note: we keep the `sending` state class for tests, not for our styles
      "mx_EventTile_sending": isSending
    });
    return /*#__PURE__*/_react.default.createElement("li", null, /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EventTile_line"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MessageTimestamp"
    }, timestamp), contentContainer, this.renderActionBar())));
  }

}

exports.default = EditHistoryMessage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRSZXBsYWNlZENvbnRlbnQiLCJldmVudCIsIm9yaWdpbmFsQ29udGVudCIsImdldE9yaWdpbmFsQ29udGVudCIsIkVkaXRIaXN0b3J5TWVzc2FnZSIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJzZXRTdGF0ZSIsInNlbmRTdGF0dXMiLCJteEV2ZW50IiwiZ2V0QXNzb2NpYXRlZFN0YXR1cyIsImNsaSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiQ29uZmlybUFuZFdhaXRSZWRhY3REaWFsb2ciLCJyZWRhY3QiLCJyZWRhY3RFdmVudCIsImdldFJvb21JZCIsImdldElkIiwiVmlld1NvdXJjZSIsInVzZXJJZCIsImNyZWRlbnRpYWxzIiwicm9vbSIsImdldFJvb20iLCJsb2NhbFJlZGFjdGlvbkV2ZW50Iiwib24iLCJNYXRyaXhFdmVudEV2ZW50IiwiU3RhdHVzIiwib25Bc3NvY2lhdGVkU3RhdHVzQ2hhbmdlZCIsImNhblJlZGFjdCIsImN1cnJlbnRTdGF0ZSIsIm1heVNlbmRSZWRhY3Rpb25Gb3JFdmVudCIsInN0YXRlIiwicGlsbGlmeUxpbmtzIiwiY29udGVudCIsImN1cnJlbnQiLCJjaGlsZHJlbiIsInBpbGxzIiwidG9vbHRpcGlmeUxpbmtzIiwidG9vbHRpcHMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5tb3VudFBpbGxzIiwidW5tb3VudFRvb2x0aXBzIiwib2ZmIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicmVuZGVyQWN0aW9uQmFyIiwicmVkYWN0QnV0dG9uIiwiaXNSZWRhY3RlZCIsImlzQmFzZUV2ZW50Iiwib25SZWRhY3RDbGljayIsIl90Iiwidmlld1NvdXJjZUJ1dHRvbiIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIm9uVmlld1NvdXJjZUNsaWNrIiwicmVuZGVyIiwiY29udGVudENvbnRhaW5lciIsImNvbnRlbnRFbGVtZW50cyIsInByZXZpb3VzRWRpdCIsImVkaXRCb2R5RGlmZlRvSHRtbCIsIkh0bWxVdGlscyIsImJvZHlUb0h0bWwiLCJzdHJpcFJlcGx5RmFsbGJhY2siLCJyZXR1cm5TdHJpbmciLCJnZXRDb250ZW50IiwibXNndHlwZSIsIm5hbWUiLCJzZW5kZXIiLCJnZXRTZW5kZXIiLCJ0aW1lc3RhbXAiLCJmb3JtYXRUaW1lIiwiRGF0ZSIsImdldFRzIiwiaXNUd2VsdmVIb3VyIiwiaXNTZW5kaW5nIiwiaW5kZXhPZiIsImNsYXNzZXMiLCJjbGFzc05hbWVzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvRWRpdEhpc3RvcnlNZXNzYWdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRXZlbnRTdGF0dXMsIE1hdHJpeEV2ZW50LCBNYXRyaXhFdmVudEV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQgKiBhcyBIdG1sVXRpbHMgZnJvbSAnLi4vLi4vLi4vSHRtbFV0aWxzJztcbmltcG9ydCB7IGVkaXRCb2R5RGlmZlRvSHRtbCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL01lc3NhZ2VEaWZmVXRpbHMnO1xuaW1wb3J0IHsgZm9ybWF0VGltZSB9IGZyb20gJy4uLy4uLy4uL0RhdGVVdGlscyc7XG5pbXBvcnQgeyBwaWxsaWZ5TGlua3MsIHVubW91bnRQaWxscyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3BpbGxpZnknO1xuaW1wb3J0IHsgdG9vbHRpcGlmeUxpbmtzLCB1bm1vdW50VG9vbHRpcHMgfSBmcm9tICcuLi8uLi8uLi91dGlscy90b29sdGlwaWZ5JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IFJlZGFjdGVkQm9keSBmcm9tIFwiLi9SZWRhY3RlZEJvZHlcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgQ29uZmlybUFuZFdhaXRSZWRhY3REaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvQ29uZmlybUFuZFdhaXRSZWRhY3REaWFsb2dcIjtcbmltcG9ydCBWaWV3U291cmNlIGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1ZpZXdTb3VyY2VcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5cbmZ1bmN0aW9uIGdldFJlcGxhY2VkQ29udGVudChldmVudCkge1xuICAgIGNvbnN0IG9yaWdpbmFsQ29udGVudCA9IGV2ZW50LmdldE9yaWdpbmFsQ29udGVudCgpO1xuICAgIHJldHVybiBvcmlnaW5hbENvbnRlbnRbXCJtLm5ld19jb250ZW50XCJdIHx8IG9yaWdpbmFsQ29udGVudDtcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gdGhlIG1lc3NhZ2UgZXZlbnQgYmVpbmcgZWRpdGVkXG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgcHJldmlvdXNFZGl0PzogTWF0cml4RXZlbnQ7XG4gICAgaXNCYXNlRXZlbnQ/OiBib29sZWFuO1xuICAgIGlzVHdlbHZlSG91cj86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNhblJlZGFjdDogYm9vbGVhbjtcbiAgICBzZW5kU3RhdHVzOiBFdmVudFN0YXR1cztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdEhpc3RvcnlNZXNzYWdlIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgY29udGVudCA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIHBpbGxzOiBFbGVtZW50W10gPSBbXTtcbiAgICBwcml2YXRlIHRvb2x0aXBzOiBFbGVtZW50W10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgeyB1c2VySWQgfSA9IGNsaS5jcmVkZW50aWFscztcbiAgICAgICAgY29uc3QgZXZlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShldmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIGlmIChldmVudC5sb2NhbFJlZGFjdGlvbkV2ZW50KCkpIHtcbiAgICAgICAgICAgIGV2ZW50LmxvY2FsUmVkYWN0aW9uRXZlbnQoKS5vbihNYXRyaXhFdmVudEV2ZW50LlN0YXR1cywgdGhpcy5vbkFzc29jaWF0ZWRTdGF0dXNDaGFuZ2VkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYW5SZWRhY3QgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kUmVkYWN0aW9uRm9yRXZlbnQoZXZlbnQsIHVzZXJJZCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IGNhblJlZGFjdCwgc2VuZFN0YXR1czogZXZlbnQuZ2V0QXNzb2NpYXRlZFN0YXR1cygpIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFzc29jaWF0ZWRTdGF0dXNDaGFuZ2VkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VuZFN0YXR1czogdGhpcy5wcm9wcy5teEV2ZW50LmdldEFzc29jaWF0ZWRTdGF0dXMoKSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlZGFjdENsaWNrID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBldmVudCA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhDb25maXJtQW5kV2FpdFJlZGFjdERpYWxvZywge1xuICAgICAgICAgICAgcmVkYWN0OiAoKSA9PiBjbGkucmVkYWN0RXZlbnQoZXZlbnQuZ2V0Um9vbUlkKCksIGV2ZW50LmdldElkKCkpLFxuICAgICAgICB9LCAnbXhfRGlhbG9nX2NvbmZpcm1yZWRhY3QnKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblZpZXdTb3VyY2VDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFZpZXdTb3VyY2UsIHtcbiAgICAgICAgICAgIG14RXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgfSwgJ214X0RpYWxvZ192aWV3c291cmNlJyk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcGlsbGlmeUxpbmtzKCk6IHZvaWQge1xuICAgICAgICAvLyBub3QgcHJlc2VudCBmb3IgcmVkYWN0ZWQgZXZlbnRzXG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnQuY3VycmVudCkge1xuICAgICAgICAgICAgcGlsbGlmeUxpbmtzKHRoaXMuY29udGVudC5jdXJyZW50LmNoaWxkcmVuLCB0aGlzLnByb3BzLm14RXZlbnQsIHRoaXMucGlsbHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0b29sdGlwaWZ5TGlua3MoKTogdm9pZCB7XG4gICAgICAgIC8vIG5vdCBwcmVzZW50IGZvciByZWRhY3RlZCBldmVudHNcbiAgICAgICAgaWYgKHRoaXMuY29udGVudC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0b29sdGlwaWZ5TGlua3ModGhpcy5jb250ZW50LmN1cnJlbnQuY2hpbGRyZW4sIHRoaXMucGlsbHMsIHRoaXMudG9vbHRpcHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnBpbGxpZnlMaW5rcygpO1xuICAgICAgICB0aGlzLnRvb2x0aXBpZnlMaW5rcygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdW5tb3VudFBpbGxzKHRoaXMucGlsbHMpO1xuICAgICAgICB1bm1vdW50VG9vbHRpcHModGhpcy50b29sdGlwcyk7XG4gICAgICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICBpZiAoZXZlbnQubG9jYWxSZWRhY3Rpb25FdmVudCgpKSB7XG4gICAgICAgICAgICBldmVudC5sb2NhbFJlZGFjdGlvbkV2ZW50KCkub2ZmKE1hdHJpeEV2ZW50RXZlbnQuU3RhdHVzLCB0aGlzLm9uQXNzb2NpYXRlZFN0YXR1c0NoYW5nZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZFVwZGF0ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5waWxsaWZ5TGlua3MoKTtcbiAgICAgICAgdGhpcy50b29sdGlwaWZ5TGlua3MoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckFjdGlvbkJhcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIC8vIGhpZGUgdGhlIGJ1dHRvbiB3aGVuIGFscmVhZHkgcmVkYWN0ZWRcbiAgICAgICAgbGV0IHJlZGFjdEJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5teEV2ZW50LmlzUmVkYWN0ZWQoKSAmJiAhdGhpcy5wcm9wcy5pc0Jhc2VFdmVudCAmJiB0aGlzLnN0YXRlLmNhblJlZGFjdCkge1xuICAgICAgICAgICAgcmVkYWN0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25SZWRhY3RDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJSZW1vdmVcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdmlld1NvdXJjZUJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZGV2ZWxvcGVyTW9kZVwiKSkge1xuICAgICAgICAgICAgdmlld1NvdXJjZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uVmlld1NvdXJjZUNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlZpZXcgU291cmNlXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGlzYWJsZWQgcmVtb3ZlIGJ1dHRvbiB3aGVuIG5vdCBhbGxvd2VkXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VBY3Rpb25CYXJcIj5cbiAgICAgICAgICAgICAgICB7IHJlZGFjdEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyB2aWV3U291cmNlQnV0dG9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCB7IG14RXZlbnQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBnZXRSZXBsYWNlZENvbnRlbnQobXhFdmVudCk7XG4gICAgICAgIGxldCBjb250ZW50Q29udGFpbmVyO1xuICAgICAgICBpZiAobXhFdmVudC5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnRlbnRDb250YWluZXIgPSA8UmVkYWN0ZWRCb2R5IG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH0gLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgY29udGVudEVsZW1lbnRzO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMucHJldmlvdXNFZGl0KSB7XG4gICAgICAgICAgICAgICAgY29udGVudEVsZW1lbnRzID0gZWRpdEJvZHlEaWZmVG9IdG1sKGdldFJlcGxhY2VkQ29udGVudCh0aGlzLnByb3BzLnByZXZpb3VzRWRpdCksIGNvbnRlbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50RWxlbWVudHMgPSBIdG1sVXRpbHMuYm9keVRvSHRtbChcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHJpcFJlcGx5RmFsbGJhY2s6IHRydWUsIHJldHVyblN0cmluZzogZmFsc2UgfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG14RXZlbnQuZ2V0Q29udGVudCgpLm1zZ3R5cGUgPT09IFwibS5lbW90ZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IG14RXZlbnQuc2VuZGVyID8gbXhFdmVudC5zZW5kZXIubmFtZSA6IG14RXZlbnQuZ2V0U2VuZGVyKCk7XG4gICAgICAgICAgICAgICAgY29udGVudENvbnRhaW5lciA9IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfY29udGVudFwiIHJlZj17dGhpcy5jb250ZW50fT4qJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NRW1vdGVCb2R5X3NlbmRlclwiPnsgbmFtZSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgJm5ic3A7eyBjb250ZW50RWxlbWVudHMgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50Q29udGFpbmVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfY29udGVudFwiIHJlZj17dGhpcy5jb250ZW50fT57IGNvbnRlbnRFbGVtZW50cyB9PC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gZm9ybWF0VGltZShuZXcgRGF0ZShteEV2ZW50LmdldFRzKCkpLCB0aGlzLnByb3BzLmlzVHdlbHZlSG91cik7XG4gICAgICAgIGNvbnN0IGlzU2VuZGluZyA9IChbJ3NlbmRpbmcnLCAncXVldWVkJywgJ2VuY3J5cHRpbmcnXS5pbmRleE9mKHRoaXMuc3RhdGUuc2VuZFN0YXR1cykgIT09IC0xKTtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgXCJteF9FdmVudFRpbGVcIjogdHJ1ZSxcbiAgICAgICAgICAgIC8vIE5vdGU6IHdlIGtlZXAgdGhlIGBzZW5kaW5nYCBzdGF0ZSBjbGFzcyBmb3IgdGVzdHMsIG5vdCBmb3Igb3VyIHN0eWxlc1xuICAgICAgICAgICAgXCJteF9FdmVudFRpbGVfc2VuZGluZ1wiOiBpc1NlbmRpbmcsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfbGluZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTWVzc2FnZVRpbWVzdGFtcFwiPnsgdGltZXN0YW1wIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNvbnRlbnRDb250YWluZXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckFjdGlvbkJhcigpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7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