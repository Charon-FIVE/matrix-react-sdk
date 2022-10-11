"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _utils = require("matrix-js-sdk/src/utils");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _DateUtils = require("../../../DateUtils");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _ScrollPanel = _interopRequireDefault(require("../../structures/ScrollPanel"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _EditHistoryMessage = _interopRequireDefault(require("../messages/EditHistoryMessage"));

var _DateSeparator = _interopRequireDefault(require("../messages/DateSeparator"));

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
class MessageEditHistoryDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "loadMoreEdits", async backwards => {
      if (backwards || !this.state.nextBatch && !this.state.isLoading) {
        // bail out on backwards as we only paginate in one direction
        return false;
      }

      const opts = {
        from: this.state.nextBatch
      };
      const roomId = this.props.mxEvent.getRoomId();
      const eventId = this.props.mxEvent.getId();

      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const {
        resolve,
        reject,
        promise
      } = (0, _utils.defer)();
      let result;

      try {
        result = await client.relations(roomId, eventId, _event.RelationType.Replace, _event.EventType.RoomMessage, opts);
      } catch (error) {
        // log if the server returned an error
        if (error.errcode) {
          _logger.logger.error("fetching /relations failed with error", error);
        }

        this.setState({
          error
        }, () => reject(error));
        return promise;
      }

      const newEvents = result.events;
      this.locallyRedactEventsIfNeeded(newEvents);
      this.setState({
        originalEvent: this.state.originalEvent || result.originalEvent,
        events: this.state.events.concat(newEvents),
        nextBatch: result.nextBatch,
        isLoading: false
      }, () => {
        const hasMoreResults = !!this.state.nextBatch;
        resolve(hasMoreResults);
      });
      return promise;
    });
    this.state = {
      originalEvent: null,
      error: null,
      events: [],
      nextBatch: null,
      isLoading: true,
      isTwelveHour: _SettingsStore.default.getValue("showTwelveHourTimestamps")
    };
  }

  locallyRedactEventsIfNeeded(newEvents) {
    const roomId = this.props.mxEvent.getRoomId();

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(roomId);
    const pendingEvents = room.getPendingEvents();

    for (const e of newEvents) {
      const pendingRedaction = pendingEvents.find(pe => {
        return pe.getType() === _event.EventType.RoomRedaction && pe.getAssociatedId() === e.getId();
      });

      if (pendingRedaction) {
        e.markLocallyRedacted(pendingRedaction);
      }
    }
  }

  componentDidMount() {
    this.loadMoreEdits();
  }

  renderEdits() {
    const nodes = [];
    let lastEvent;
    let allEvents = this.state.events; // append original event when we've done last pagination

    if (this.state.originalEvent && !this.state.nextBatch) {
      allEvents = allEvents.concat(this.state.originalEvent);
    }

    const baseEventId = this.props.mxEvent.getId();
    allEvents.forEach((e, i) => {
      if (!lastEvent || (0, _DateUtils.wantsDateSeparator)(lastEvent.getDate(), e.getDate())) {
        nodes.push( /*#__PURE__*/_react.default.createElement("li", {
          key: e.getTs() + "~"
        }, /*#__PURE__*/_react.default.createElement(_DateSeparator.default, {
          roomId: e.getRoomId(),
          ts: e.getTs()
        })));
      }

      const isBaseEvent = e.getId() === baseEventId;
      nodes.push( /*#__PURE__*/_react.default.createElement(_EditHistoryMessage.default, {
        key: e.getId(),
        previousEdit: !isBaseEvent ? allEvents[i + 1] : null,
        isBaseEvent: isBaseEvent,
        mxEvent: e,
        isTwelveHour: this.state.isTwelveHour
      }));
      lastEvent = e;
    });
    return nodes;
  }

  render() {
    let content;

    if (this.state.error) {
      const {
        error
      } = this.state;

      if (error.errcode === "M_UNRECOGNIZED") {
        content = /*#__PURE__*/_react.default.createElement("p", {
          className: "mx_MessageEditHistoryDialog_error"
        }, (0, _languageHandler._t)("Your homeserver doesn't seem to support this feature."));
      } else if (error.errcode) {
        // some kind of error from the homeserver
        content = /*#__PURE__*/_react.default.createElement("p", {
          className: "mx_MessageEditHistoryDialog_error"
        }, (0, _languageHandler._t)("Something went wrong!"));
      } else {
        content = /*#__PURE__*/_react.default.createElement("p", {
          className: "mx_MessageEditHistoryDialog_error"
        }, (0, _languageHandler._t)("Cannot reach homeserver"), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Ensure you have a stable internet connection, or get in touch with the server admin"));
      }
    } else if (this.state.isLoading) {
      content = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      content = /*#__PURE__*/_react.default.createElement(_ScrollPanel.default, {
        className: "mx_MessageEditHistoryDialog_scrollPanel",
        onFillRequest: this.loadMoreEdits,
        stickyBottom: false,
        startAtBottom: false
      }, /*#__PURE__*/_react.default.createElement("ul", {
        className: "mx_MessageEditHistoryDialog_edits"
      }, this.renderEdits()));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_MessageEditHistoryDialog",
      hasCancel: true,
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Message edits")
    }, content);
  }

}

exports.default = MessageEditHistoryDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiYmFja3dhcmRzIiwic3RhdGUiLCJuZXh0QmF0Y2giLCJpc0xvYWRpbmciLCJvcHRzIiwiZnJvbSIsInJvb21JZCIsIm14RXZlbnQiLCJnZXRSb29tSWQiLCJldmVudElkIiwiZ2V0SWQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyZXNvbHZlIiwicmVqZWN0IiwicHJvbWlzZSIsImRlZmVyIiwicmVzdWx0IiwicmVsYXRpb25zIiwiUmVsYXRpb25UeXBlIiwiUmVwbGFjZSIsIkV2ZW50VHlwZSIsIlJvb21NZXNzYWdlIiwiZXJyb3IiLCJlcnJjb2RlIiwibG9nZ2VyIiwic2V0U3RhdGUiLCJuZXdFdmVudHMiLCJldmVudHMiLCJsb2NhbGx5UmVkYWN0RXZlbnRzSWZOZWVkZWQiLCJvcmlnaW5hbEV2ZW50IiwiY29uY2F0IiwiaGFzTW9yZVJlc3VsdHMiLCJpc1R3ZWx2ZUhvdXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJyb29tIiwiZ2V0Um9vbSIsInBlbmRpbmdFdmVudHMiLCJnZXRQZW5kaW5nRXZlbnRzIiwiZSIsInBlbmRpbmdSZWRhY3Rpb24iLCJmaW5kIiwicGUiLCJnZXRUeXBlIiwiUm9vbVJlZGFjdGlvbiIsImdldEFzc29jaWF0ZWRJZCIsIm1hcmtMb2NhbGx5UmVkYWN0ZWQiLCJjb21wb25lbnREaWRNb3VudCIsImxvYWRNb3JlRWRpdHMiLCJyZW5kZXJFZGl0cyIsIm5vZGVzIiwibGFzdEV2ZW50IiwiYWxsRXZlbnRzIiwiYmFzZUV2ZW50SWQiLCJmb3JFYWNoIiwiaSIsIndhbnRzRGF0ZVNlcGFyYXRvciIsImdldERhdGUiLCJwdXNoIiwiZ2V0VHMiLCJpc0Jhc2VFdmVudCIsInJlbmRlciIsImNvbnRlbnQiLCJfdCIsIm9uRmluaXNoZWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL01lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlLCBSZWxhdGlvblR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBkZWZlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy91dGlsc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgd2FudHNEYXRlU2VwYXJhdG9yIH0gZnJvbSAnLi4vLi4vLi4vRGF0ZVV0aWxzJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gJy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IFNjcm9sbFBhbmVsIGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1Njcm9sbFBhbmVsXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IEVkaXRIaXN0b3J5TWVzc2FnZSBmcm9tIFwiLi4vbWVzc2FnZXMvRWRpdEhpc3RvcnlNZXNzYWdlXCI7XG5pbXBvcnQgRGF0ZVNlcGFyYXRvciBmcm9tIFwiLi4vbWVzc2FnZXMvRGF0ZVNlcGFyYXRvclwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBvcmlnaW5hbEV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICBlcnJvcjoge1xuICAgICAgICBlcnJjb2RlOiBzdHJpbmc7XG4gICAgfTtcbiAgICBldmVudHM6IE1hdHJpeEV2ZW50W107XG4gICAgbmV4dEJhdGNoOiBzdHJpbmc7XG4gICAgaXNMb2FkaW5nOiBib29sZWFuO1xuICAgIGlzVHdlbHZlSG91cjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgb3JpZ2luYWxFdmVudDogbnVsbCxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgICAgIG5leHRCYXRjaDogbnVsbCxcbiAgICAgICAgICAgIGlzTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIGlzVHdlbHZlSG91cjogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dUd2VsdmVIb3VyVGltZXN0YW1wc1wiKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRNb3JlRWRpdHMgPSBhc3luYyAoYmFja3dhcmRzPzogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgICBpZiAoYmFja3dhcmRzIHx8ICghdGhpcy5zdGF0ZS5uZXh0QmF0Y2ggJiYgIXRoaXMuc3RhdGUuaXNMb2FkaW5nKSkge1xuICAgICAgICAgICAgLy8gYmFpbCBvdXQgb24gYmFja3dhcmRzIGFzIHdlIG9ubHkgcGFnaW5hdGUgaW4gb25lIGRpcmVjdGlvblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wdHMgPSB7IGZyb206IHRoaXMuc3RhdGUubmV4dEJhdGNoIH07XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKTtcbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QsIHByb21pc2UgfSA9IGRlZmVyPGJvb2xlYW4+KCk7XG4gICAgICAgIGxldCByZXN1bHQ6IEF3YWl0ZWQ8UmV0dXJuVHlwZTxNYXRyaXhDbGllbnRbXCJyZWxhdGlvbnNcIl0+PjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnJlbGF0aW9ucyhyb29tSWQsIGV2ZW50SWQsIFJlbGF0aW9uVHlwZS5SZXBsYWNlLCBFdmVudFR5cGUuUm9vbU1lc3NhZ2UsIG9wdHMpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gbG9nIGlmIHRoZSBzZXJ2ZXIgcmV0dXJuZWQgYW4gZXJyb3JcbiAgICAgICAgICAgIGlmIChlcnJvci5lcnJjb2RlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiZmV0Y2hpbmcgL3JlbGF0aW9ucyBmYWlsZWQgd2l0aCBlcnJvclwiLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3IgfSwgKCkgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld0V2ZW50cyA9IHJlc3VsdC5ldmVudHM7XG4gICAgICAgIHRoaXMubG9jYWxseVJlZGFjdEV2ZW50c0lmTmVlZGVkKG5ld0V2ZW50cyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgb3JpZ2luYWxFdmVudDogdGhpcy5zdGF0ZS5vcmlnaW5hbEV2ZW50IHx8IHJlc3VsdC5vcmlnaW5hbEV2ZW50LFxuICAgICAgICAgICAgZXZlbnRzOiB0aGlzLnN0YXRlLmV2ZW50cy5jb25jYXQobmV3RXZlbnRzKSxcbiAgICAgICAgICAgIG5leHRCYXRjaDogcmVzdWx0Lm5leHRCYXRjaCxcbiAgICAgICAgICAgIGlzTG9hZGluZzogZmFsc2UsXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhhc01vcmVSZXN1bHRzID0gISF0aGlzLnN0YXRlLm5leHRCYXRjaDtcbiAgICAgICAgICAgIHJlc29sdmUoaGFzTW9yZVJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHByaXZhdGUgbG9jYWxseVJlZGFjdEV2ZW50c0lmTmVlZGVkKG5ld0V2ZW50czogTWF0cml4RXZlbnRbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdFdmVudHMgPSByb29tLmdldFBlbmRpbmdFdmVudHMoKTtcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIG5ld0V2ZW50cykge1xuICAgICAgICAgICAgY29uc3QgcGVuZGluZ1JlZGFjdGlvbiA9IHBlbmRpbmdFdmVudHMuZmluZChwZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBlLmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlJvb21SZWRhY3Rpb24gJiYgcGUuZ2V0QXNzb2NpYXRlZElkKCkgPT09IGUuZ2V0SWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdSZWRhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBlLm1hcmtMb2NhbGx5UmVkYWN0ZWQocGVuZGluZ1JlZGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMubG9hZE1vcmVFZGl0cygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyRWRpdHMoKTogSlNYLkVsZW1lbnRbXSB7XG4gICAgICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgICAgIGxldCBsYXN0RXZlbnQ7XG4gICAgICAgIGxldCBhbGxFdmVudHMgPSB0aGlzLnN0YXRlLmV2ZW50cztcbiAgICAgICAgLy8gYXBwZW5kIG9yaWdpbmFsIGV2ZW50IHdoZW4gd2UndmUgZG9uZSBsYXN0IHBhZ2luYXRpb25cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUub3JpZ2luYWxFdmVudCAmJiAhdGhpcy5zdGF0ZS5uZXh0QmF0Y2gpIHtcbiAgICAgICAgICAgIGFsbEV2ZW50cyA9IGFsbEV2ZW50cy5jb25jYXQodGhpcy5zdGF0ZS5vcmlnaW5hbEV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBiYXNlRXZlbnRJZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpO1xuICAgICAgICBhbGxFdmVudHMuZm9yRWFjaCgoZSwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFsYXN0RXZlbnQgfHwgd2FudHNEYXRlU2VwYXJhdG9yKGxhc3RFdmVudC5nZXREYXRlKCksIGUuZ2V0RGF0ZSgpKSkge1xuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2goPGxpIGtleT17ZS5nZXRUcygpICsgXCJ+XCJ9PjxEYXRlU2VwYXJhdG9yIHJvb21JZD17ZS5nZXRSb29tSWQoKX0gdHM9e2UuZ2V0VHMoKX0gLz48L2xpPik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpc0Jhc2VFdmVudCA9IGUuZ2V0SWQoKSA9PT0gYmFzZUV2ZW50SWQ7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKChcbiAgICAgICAgICAgICAgICA8RWRpdEhpc3RvcnlNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIGtleT17ZS5nZXRJZCgpfVxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0VkaXQ9eyFpc0Jhc2VFdmVudCA/IGFsbEV2ZW50c1tpICsgMV0gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICBpc0Jhc2VFdmVudD17aXNCYXNlRXZlbnR9XG4gICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e2V9XG4gICAgICAgICAgICAgICAgICAgIGlzVHdlbHZlSG91cj17dGhpcy5zdGF0ZS5pc1R3ZWx2ZUhvdXJ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgbGFzdEV2ZW50ID0gZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCB7IGVycm9yIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgaWYgKGVycm9yLmVycmNvZGUgPT09IFwiTV9VTlJFQ09HTklaRURcIikge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSAoPHAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nX2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJZb3VyIGhvbWVzZXJ2ZXIgZG9lc24ndCBzZWVtIHRvIHN1cHBvcnQgdGhpcyBmZWF0dXJlLlwiKSB9XG4gICAgICAgICAgICAgICAgPC9wPik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmVycmNvZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBzb21lIGtpbmQgb2YgZXJyb3IgZnJvbSB0aGUgaG9tZXNlcnZlclxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSAoPHAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nX2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTb21ldGhpbmcgd2VudCB3cm9uZyFcIikgfVxuICAgICAgICAgICAgICAgIDwvcD4pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gKDxwIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZ19lcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2Fubm90IHJlYWNoIGhvbWVzZXJ2ZXJcIikgfVxuICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkVuc3VyZSB5b3UgaGF2ZSBhIHN0YWJsZSBpbnRlcm5ldCBjb25uZWN0aW9uLCBvciBnZXQgaW4gdG91Y2ggd2l0aCB0aGUgc2VydmVyIGFkbWluXCIpIH1cbiAgICAgICAgICAgICAgICA8L3A+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmlzTG9hZGluZykge1xuICAgICAgICAgICAgY29udGVudCA9IDxTcGlubmVyIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9ICg8U2Nyb2xsUGFuZWxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2dfc2Nyb2xsUGFuZWxcIlxuICAgICAgICAgICAgICAgIG9uRmlsbFJlcXVlc3Q9e3RoaXMubG9hZE1vcmVFZGl0c31cbiAgICAgICAgICAgICAgICBzdGlja3lCb3R0b209e2ZhbHNlfVxuICAgICAgICAgICAgICAgIHN0YXJ0QXRCb3R0b209e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJteF9NZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2dfZWRpdHNcIj57IHRoaXMucmVuZGVyRWRpdHMoKSB9PC91bD5cbiAgICAgICAgICAgIDwvU2Nyb2xsUGFuZWw+KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X01lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZydcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIk1lc3NhZ2UgZWRpdHNcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQS9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQ2UsTUFBTUEsd0JBQU4sU0FBdUNDLGNBQUEsQ0FBTUMsYUFBN0MsQ0FBMkU7RUFDdEZDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOO0lBRHVCLHFEQVlILE1BQU9DLFNBQVAsSUFBaUQ7TUFDckUsSUFBSUEsU0FBUyxJQUFLLENBQUMsS0FBS0MsS0FBTCxDQUFXQyxTQUFaLElBQXlCLENBQUMsS0FBS0QsS0FBTCxDQUFXRSxTQUF2RCxFQUFtRTtRQUMvRDtRQUNBLE9BQU8sS0FBUDtNQUNIOztNQUNELE1BQU1DLElBQUksR0FBRztRQUFFQyxJQUFJLEVBQUUsS0FBS0osS0FBTCxDQUFXQztNQUFuQixDQUFiO01BQ0EsTUFBTUksTUFBTSxHQUFHLEtBQUtQLEtBQUwsQ0FBV1EsT0FBWCxDQUFtQkMsU0FBbkIsRUFBZjtNQUNBLE1BQU1DLE9BQU8sR0FBRyxLQUFLVixLQUFMLENBQVdRLE9BQVgsQ0FBbUJHLEtBQW5C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