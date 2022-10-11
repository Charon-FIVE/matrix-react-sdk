"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _languageHandler = require("../../../languageHandler");

var _EchoStore = require("../../../stores/local-echo/EchoStore");

var _DateUtils = require("../../../DateUtils");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _RoomEchoContext = require("../../../stores/local-echo/RoomEchoContext");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _EchoTransaction = require("../../../stores/local-echo/EchoTransaction");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _AsyncStore = require("../../../stores/AsyncStore");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
class ServerOfflineDialog extends React.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onEchosUpdated", () => {
      this.forceUpdate(); // no state to worry about
    });
  }

  componentDidMount() {
    _EchoStore.EchoStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onEchosUpdated);
  }

  componentWillUnmount() {
    _EchoStore.EchoStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onEchosUpdated);
  }

  renderTimeline() {
    return _EchoStore.EchoStore.instance.contexts.map((c, i) => {
      if (!c.firstFailedTime) return null; // not useful

      if (!(c instanceof _RoomEchoContext.RoomEchoContext)) throw new Error("Cannot render unknown context: " + c);
      const header = /*#__PURE__*/React.createElement("div", {
        className: "mx_ServerOfflineDialog_content_context_timeline_header"
      }, /*#__PURE__*/React.createElement(_RoomAvatar.default, {
        width: 24,
        height: 24,
        room: c.room
      }), /*#__PURE__*/React.createElement("span", null, c.room.name));
      const entries = c.transactions.filter(t => t.status === _EchoTransaction.TransactionStatus.Error || t.didPreviouslyFail).map((t, j) => {
        let button = /*#__PURE__*/React.createElement(_Spinner.default, {
          w: 19,
          h: 19
        });

        if (t.status === _EchoTransaction.TransactionStatus.Error) {
          button = /*#__PURE__*/React.createElement(_AccessibleButton.default, {
            kind: "link",
            onClick: () => t.run()
          }, (0, _languageHandler._t)("Resend"));
        }

        return /*#__PURE__*/React.createElement("div", {
          className: "mx_ServerOfflineDialog_content_context_txn",
          key: `txn-${j}`
        }, /*#__PURE__*/React.createElement("span", {
          className: "mx_ServerOfflineDialog_content_context_txn_desc"
        }, t.auditName), button);
      });
      return /*#__PURE__*/React.createElement("div", {
        className: "mx_ServerOfflineDialog_content_context",
        key: `context-${i}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_ServerOfflineDialog_content_context_timestamp"
      }, (0, _DateUtils.formatTime)(c.firstFailedTime, _SettingsStore.default.getValue("showTwelveHourTimestamps"))), /*#__PURE__*/React.createElement("div", {
        className: "mx_ServerOfflineDialog_content_context_timeline"
      }, header, entries));
    });
  }

  render() {
    let timeline = this.renderTimeline().filter(c => !!c); // remove nulls for next check

    if (timeline.length === 0) {
      timeline = [/*#__PURE__*/React.createElement("div", {
        key: 1
      }, (0, _languageHandler._t)("You're all caught up."))];
    }

    const serverName = _MatrixClientPeg.MatrixClientPeg.getHomeserverName();

    return /*#__PURE__*/React.createElement(_BaseDialog.default, {
      title: (0, _languageHandler._t)("Server isn't responding"),
      className: "mx_ServerOfflineDialog",
      contentId: "mx_Dialog_content",
      onFinished: this.props.onFinished,
      hasCancel: true
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_ServerOfflineDialog_content"
    }, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("Your server isn't responding to some of your requests. " + "Below are some of the most likely reasons.")), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("The server (%(serverName)s) took too long to respond.", {
      serverName
    })), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("Your firewall or anti-virus is blocking the request.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("A browser extension is preventing the request.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("The server is offline.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("The server has denied your request.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("Your area is experiencing difficulties connecting to the internet.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("A connection error occurred while trying to contact the server.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("The server is not configured to indicate what the problem is (CORS)."))), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("h2", null, (0, _languageHandler._t)("Recent changes that have not yet been received")), timeline));
  }

}

exports.default = ServerOfflineDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXJ2ZXJPZmZsaW5lRGlhbG9nIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiZm9yY2VVcGRhdGUiLCJjb21wb25lbnREaWRNb3VudCIsIkVjaG9TdG9yZSIsImluc3RhbmNlIiwib24iLCJVUERBVEVfRVZFTlQiLCJvbkVjaG9zVXBkYXRlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwicmVuZGVyVGltZWxpbmUiLCJjb250ZXh0cyIsIm1hcCIsImMiLCJpIiwiZmlyc3RGYWlsZWRUaW1lIiwiUm9vbUVjaG9Db250ZXh0IiwiRXJyb3IiLCJoZWFkZXIiLCJyb29tIiwibmFtZSIsImVudHJpZXMiLCJ0cmFuc2FjdGlvbnMiLCJmaWx0ZXIiLCJ0Iiwic3RhdHVzIiwiVHJhbnNhY3Rpb25TdGF0dXMiLCJkaWRQcmV2aW91c2x5RmFpbCIsImoiLCJidXR0b24iLCJydW4iLCJfdCIsImF1ZGl0TmFtZSIsImZvcm1hdFRpbWUiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJyZW5kZXIiLCJ0aW1lbGluZSIsImxlbmd0aCIsInNlcnZlck5hbWUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXRIb21lc2VydmVyTmFtZSIsInByb3BzIiwib25GaW5pc2hlZCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2VydmVyT2ZmbGluZURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tICcuL0Jhc2VEaWFsb2cnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgRWNob1N0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9sb2NhbC1lY2hvL0VjaG9TdG9yZVwiO1xuaW1wb3J0IHsgZm9ybWF0VGltZSB9IGZyb20gXCIuLi8uLi8uLi9EYXRlVXRpbHNcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBSb29tRWNob0NvbnRleHQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL2xvY2FsLWVjaG8vUm9vbUVjaG9Db250ZXh0XCI7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9Sb29tQXZhdGFyXCI7XG5pbXBvcnQgeyBUcmFuc2FjdGlvblN0YXR1cyB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9FY2hvVHJhbnNhY3Rpb25cIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlck9mZmxpbmVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgRWNob1N0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vbkVjaG9zVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBFY2hvU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vbkVjaG9zVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkVjaG9zVXBkYXRlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyBubyBzdGF0ZSB0byB3b3JyeSBhYm91dFxuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclRpbWVsaW5lKCk6IFJlYWN0LlJlYWN0RWxlbWVudFtdIHtcbiAgICAgICAgcmV0dXJuIEVjaG9TdG9yZS5pbnN0YW5jZS5jb250ZXh0cy5tYXAoKGMsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghYy5maXJzdEZhaWxlZFRpbWUpIHJldHVybiBudWxsOyAvLyBub3QgdXNlZnVsXG4gICAgICAgICAgICBpZiAoIShjIGluc3RhbmNlb2YgUm9vbUVjaG9Db250ZXh0KSkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlbmRlciB1bmtub3duIGNvbnRleHQ6IFwiICsgYyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXJ2ZXJPZmZsaW5lRGlhbG9nX2NvbnRlbnRfY29udGV4dF90aW1lbGluZV9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJvb21BdmF0YXIgd2lkdGg9ezI0fSBoZWlnaHQ9ezI0fSByb29tPXtjLnJvb219IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPnsgYy5yb29tLm5hbWUgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYy50cmFuc2FjdGlvbnNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKHQgPT4gdC5zdGF0dXMgPT09IFRyYW5zYWN0aW9uU3RhdHVzLkVycm9yIHx8IHQuZGlkUHJldmlvdXNseUZhaWwpXG4gICAgICAgICAgICAgICAgLm1hcCgodCwgaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYnV0dG9uID0gPFNwaW5uZXIgdz17MTl9IGg9ezE5fSAvPjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQuc3RhdHVzID09PSBUcmFuc2FjdGlvblN0YXR1cy5FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17KCkgPT4gdC5ydW4oKX0+eyBfdChcIlJlc2VuZFwiKSB9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXJ2ZXJPZmZsaW5lRGlhbG9nX2NvbnRlbnRfY29udGV4dF90eG5cIiBrZXk9e2B0eG4tJHtqfWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NlcnZlck9mZmxpbmVEaWFsb2dfY29udGVudF9jb250ZXh0X3R4bl9kZXNjXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdC5hdWRpdE5hbWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXJ2ZXJPZmZsaW5lRGlhbG9nX2NvbnRlbnRfY29udGV4dFwiIGtleT17YGNvbnRleHQtJHtpfWB9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlcnZlck9mZmxpbmVEaWFsb2dfY29udGVudF9jb250ZXh0X3RpbWVzdGFtcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBmb3JtYXRUaW1lKGMuZmlyc3RGYWlsZWRUaW1lLCBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCIpKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlcnZlck9mZmxpbmVEaWFsb2dfY29udGVudF9jb250ZXh0X3RpbWVsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGhlYWRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGVudHJpZXMgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGxldCB0aW1lbGluZSA9IHRoaXMucmVuZGVyVGltZWxpbmUoKS5maWx0ZXIoYyA9PiAhIWMpOyAvLyByZW1vdmUgbnVsbHMgZm9yIG5leHQgY2hlY2tcbiAgICAgICAgaWYgKHRpbWVsaW5lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGltZWxpbmUgPSBbPGRpdiBrZXk9ezF9PnsgX3QoXCJZb3UncmUgYWxsIGNhdWdodCB1cC5cIikgfTwvZGl2Pl07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXJ2ZXJOYW1lID0gTWF0cml4Q2xpZW50UGVnLmdldEhvbWVzZXJ2ZXJOYW1lKCk7XG4gICAgICAgIHJldHVybiA8QmFzZURpYWxvZyB0aXRsZT17X3QoXCJTZXJ2ZXIgaXNuJ3QgcmVzcG9uZGluZ1wiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfU2VydmVyT2ZmbGluZURpYWxvZydcbiAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2VydmVyT2ZmbGluZURpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJZb3VyIHNlcnZlciBpc24ndCByZXNwb25kaW5nIHRvIHNvbWUgb2YgeW91ciByZXF1ZXN0cy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIkJlbG93IGFyZSBzb21lIG9mIHRoZSBtb3N0IGxpa2VseSByZWFzb25zLlwiLFxuICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57IF90KFwiVGhlIHNlcnZlciAoJShzZXJ2ZXJOYW1lKXMpIHRvb2sgdG9vIGxvbmcgdG8gcmVzcG9uZC5cIiwgeyBzZXJ2ZXJOYW1lIH0pIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIllvdXIgZmlyZXdhbGwgb3IgYW50aS12aXJ1cyBpcyBibG9ja2luZyB0aGUgcmVxdWVzdC5cIikgfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57IF90KFwiQSBicm93c2VyIGV4dGVuc2lvbiBpcyBwcmV2ZW50aW5nIHRoZSByZXF1ZXN0LlwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJUaGUgc2VydmVyIGlzIG9mZmxpbmUuXCIpIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIlRoZSBzZXJ2ZXIgaGFzIGRlbmllZCB5b3VyIHJlcXVlc3QuXCIpIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIllvdXIgYXJlYSBpcyBleHBlcmllbmNpbmcgZGlmZmljdWx0aWVzIGNvbm5lY3RpbmcgdG8gdGhlIGludGVybmV0LlwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJBIGNvbm5lY3Rpb24gZXJyb3Igb2NjdXJyZWQgd2hpbGUgdHJ5aW5nIHRvIGNvbnRhY3QgdGhlIHNlcnZlci5cIikgfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57IF90KFwiVGhlIHNlcnZlciBpcyBub3QgY29uZmlndXJlZCB0byBpbmRpY2F0ZSB3aGF0IHRoZSBwcm9ibGVtIGlzIChDT1JTKS5cIikgfTwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8aHIgLz5cbiAgICAgICAgICAgICAgICA8aDI+eyBfdChcIlJlY2VudCBjaGFuZ2VzIHRoYXQgaGF2ZSBub3QgeWV0IGJlZW4gcmVjZWl2ZWRcIikgfTwvaDI+XG4gICAgICAgICAgICAgICAgeyB0aW1lbGluZSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9CYXNlRGlhbG9nPjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUE3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBcUJlLE1BQU1BLG1CQUFOLFNBQWtDQyxLQUFLLENBQUNDLGFBQXhDLENBQThEO0VBQUE7SUFBQTtJQUFBLHNEQVNoRCxNQUFNO01BQzNCLEtBQUtDLFdBQUwsR0FEMkIsQ0FDUDtJQUN2QixDQVh3RTtFQUFBOztFQUNsRUMsaUJBQWlCLEdBQUc7SUFDdkJDLG9CQUFBLENBQVVDLFFBQVYsQ0FBbUJDLEVBQW5CLENBQXNCQyx3QkFBdEIsRUFBb0MsS0FBS0MsY0FBekM7RUFDSDs7RUFFTUMsb0JBQW9CLEdBQUc7SUFDMUJMLG9CQUFBLENBQVVDLFFBQVYsQ0FBbUJLLEdBQW5CLENBQXVCSCx3QkFBdkIsRUFBcUMsS0FBS0MsY0FBMUM7RUFDSDs7RUFNT0csY0FBYyxHQUF5QjtJQUMzQyxPQUFPUCxvQkFBQSxDQUFVQyxRQUFWLENBQW1CTyxRQUFuQixDQUE0QkMsR0FBNUIsQ0FBZ0MsQ0FBQ0MsQ0FBRCxFQUFJQyxDQUFKLEtBQVU7TUFDN0MsSUFBSSxDQUFDRCxDQUFDLENBQUNFLGVBQVAsRUFBd0IsT0FBTyxJQUFQLENBRHFCLENBQ1I7O01BQ3JDLElBQUksRUFBRUYsQ0FBQyxZQUFZRyxnQ0FBZixDQUFKLEVBQXFDLE1BQU0sSUFBSUMsS0FBSixDQUFVLG9D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