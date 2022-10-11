"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _event = require("matrix-js-sdk/src/models/event");

var _server = require("react-dom/server");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _Exporter = _interopRequireDefault(require("./Exporter"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _Media = require("../../customisations/Media");

var _Layout = require("../../settings/enums/Layout");

var _MessagePanel = require("../../components/structures/MessagePanel");

var _DateUtils = require("../../DateUtils");

var _Permalinks = require("../permalinks/Permalinks");

var _languageHandler = require("../../languageHandler");

var Avatar = _interopRequireWildcard(require("../../Avatar"));

var _EventTile = _interopRequireDefault(require("../../components/views/rooms/EventTile"));

var _DateSeparator = _interopRequireDefault(require("../../components/views/messages/DateSeparator"));

var _BaseAvatar = _interopRequireDefault(require("../../components/views/avatars/BaseAvatar"));

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _exportCSS = _interopRequireDefault(require("./exportCSS"));

var _TextForEvent = require("../../TextForEvent");

var _EventTileFactory = require("../../events/EventTileFactory");

var _exportJS = _interopRequireDefault(require("!!raw-loader!./exportJS"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
class HTMLExporter extends _Exporter.default {
  constructor(room, exportType, exportOptions, setProgressText) {
    super(room, exportType, exportOptions, setProgressText);
    (0, _defineProperty2.default)(this, "avatars", void 0);
    (0, _defineProperty2.default)(this, "permalinkCreator", void 0);
    (0, _defineProperty2.default)(this, "totalSize", void 0);
    (0, _defineProperty2.default)(this, "mediaOmitText", void 0);
    (0, _defineProperty2.default)(this, "threadsEnabled", void 0);
    this.avatars = new Map();
    this.permalinkCreator = new _Permalinks.RoomPermalinkCreator(this.room);
    this.totalSize = 0;
    this.mediaOmitText = !this.exportOptions.attachmentsIncluded ? (0, _languageHandler._t)("Media omitted") : (0, _languageHandler._t)("Media omitted - file size limit exceeded");
    this.threadsEnabled = _SettingsStore.default.getValue("feature_thread");
  }

  async getRoomAvatar() {
    let blob;
    const avatarUrl = Avatar.avatarUrlForRoom(this.room, 32, 32, "crop");
    const avatarPath = "room.png";

    if (avatarUrl) {
      try {
        const image = await fetch(avatarUrl);
        blob = await image.blob();
        this.totalSize += blob.size;
        this.addFile(avatarPath, blob);
      } catch (err) {
        _logger.logger.log("Failed to fetch room's avatar" + err);
      }
    }

    const avatar = /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
      width: 32,
      height: 32,
      name: this.room.name,
      title: this.room.name,
      url: blob ? avatarPath : null,
      resizeMethod: "crop"
    });

    return (0, _server.renderToStaticMarkup)(avatar);
  }

  async wrapHTML(content) {
    const roomAvatar = await this.getRoomAvatar();
    const exportDate = (0, _DateUtils.formatFullDateNoDayNoTime)(new Date());
    const creator = this.room.currentState.getStateEvents(_event2.EventType.RoomCreate, "")?.getSender();
    const creatorName = this.room?.getMember(creator)?.rawDisplayName || creator;
    const exporter = this.client.getUserId();
    const exporterName = this.room?.getMember(exporter)?.rawDisplayName;
    const topic = this.room.currentState.getStateEvents(_event2.EventType.RoomTopic, "")?.getContent()?.topic || "";
    const createdText = (0, _languageHandler._t)("%(creatorName)s created this room.", {
      creatorName
    });
    const exportedText = (0, _server.renderToStaticMarkup)( /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This is the start of export of <roomName/>. Exported by <exporterDetails/> at %(exportDate)s.", {
      exportDate
    }, {
      roomName: () => /*#__PURE__*/_react.default.createElement("b", null, this.room.name),
      exporterDetails: () => /*#__PURE__*/_react.default.createElement("a", {
        href: `https://matrix.to/#/${exporter}`,
        target: "_blank",
        rel: "noopener noreferrer"
      }, exporterName ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("b", null, exporterName), " (" + exporter + ")") : /*#__PURE__*/_react.default.createElement("b", null, exporter))
    })));
    const topicText = topic ? (0, _languageHandler._t)("Topic: %(topic)s", {
      topic
    }) : "";
    return `
          <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="css/style.css" rel="stylesheet" />
                <script src="js/script.js"></script>
                <title>Exported Data</title>
            </head>
            <body style="height: 100vh;">
                <section
                id="matrixchat"
                style="height: 100%; overflow: auto"
                class="notranslate"
                >
                <div class="mx_MatrixChat_wrapper" aria-hidden="false">
                    <div class="mx_MatrixChat">
                    <main class="mx_RoomView">
                        <div class="mx_RoomHeader light-panel">
                        <div class="mx_RoomHeader_wrapper" aria-owns="mx_RightPanel">
                            <div class="mx_RoomHeader_avatar">
                            <div class="mx_DecoratedRoomAvatar">
                               ${roomAvatar}
                            </div>
                            </div>
                            <div class="mx_RoomHeader_name">
                            <div
                                dir="auto"
                                class="mx_RoomHeader_nametext"
                                title="${this.room.name}"
                            >
                                ${this.room.name}
                            </div>
                            </div>
                            <div class="mx_RoomHeader_topic" dir="auto"> ${topic} </div>
                        </div>
                        </div>
                        <div class="mx_MainSplit">
                        <div class="mx_RoomView_body">
                            <div
                            class="mx_RoomView_timeline mx_RoomView_timeline_rr_enabled"
                            >
                            <div
                                class="
                                mx_AutoHideScrollbar
                                mx_ScrollPanel
                                mx_RoomView_messagePanel
                                "
                            >
                                <div class="mx_RoomView_messageListWrapper">
                                <ol
                                    class="mx_RoomView_MessageList"
                                    aria-live="polite"
                                    role="list"
                                >
                                <div class="mx_NewRoomIntro">
                                    ${roomAvatar}
                                    <h2> ${this.room.name} </h2>
                                    <p> ${createdText} <br/><br/> ${exportedText} </p>
                                    <br/>
                                    <p> ${topicText} </p>
                                </div>
                                ${content}
                                </ol>
                                </div>
                            </div>
                            </div>
                            <div class="mx_RoomView_statusArea">
                            <div class="mx_RoomView_statusAreaBox">
                                <div class="mx_RoomView_statusAreaBox_line"></div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </main>
                    </div>
                </div>
                </section>
                <div id="snackbar"/>
            </body>
        </html>`;
  }

  getAvatarURL(event) {
    const member = event.sender;
    return member.getMxcAvatarUrl() && (0, _Media.mediaFromMxc)(member.getMxcAvatarUrl()).getThumbnailOfSourceHttp(30, 30, "crop");
  }

  async saveAvatarIfNeeded(event) {
    const member = event.sender;

    if (!this.avatars.has(member.userId)) {
      try {
        const avatarUrl = this.getAvatarURL(event);
        this.avatars.set(member.userId, true);
        const image = await fetch(avatarUrl);
        const blob = await image.blob();
        this.addFile(`users/${member.userId.replace(/:/g, '-')}.png`, blob);
      } catch (err) {
        _logger.logger.log("Failed to fetch user's avatar" + err);
      }
    }
  }

  getDateSeparator(event) {
    const ts = event.getTs();

    const dateSeparator = /*#__PURE__*/_react.default.createElement("li", {
      key: ts
    }, /*#__PURE__*/_react.default.createElement(_DateSeparator.default, {
      forExport: true,
      key: ts,
      roomId: event.getRoomId(),
      ts: ts
    }));

    return (0, _server.renderToStaticMarkup)(dateSeparator);
  }

  needsDateSeparator(event, prevEvent) {
    if (prevEvent == null) return true;
    return (0, _DateUtils.wantsDateSeparator)(prevEvent.getDate(), event.getDate());
  }

  getEventTile(mxEv, continuation) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Export_EventWrapper",
      id: mxEv.getId()
    }, /*#__PURE__*/_react.default.createElement(_MatrixClientContext.default.Provider, {
      value: this.client
    }, /*#__PURE__*/_react.default.createElement(_EventTile.default, {
      mxEvent: mxEv,
      continuation: continuation,
      isRedacted: mxEv.isRedacted(),
      replacingEventId: mxEv.replacingEventId(),
      forExport: true,
      readReceipts: null,
      alwaysShowTimestamps: true,
      readReceiptMap: null,
      showUrlPreview: false,
      checkUnmounting: () => false,
      isTwelveHour: false,
      last: false,
      lastInSection: false,
      permalinkCreator: this.permalinkCreator,
      lastSuccessful: false,
      isSelectedEvent: false,
      getRelationsForEvent: null,
      showReactions: false,
      layout: _Layout.Layout.Group,
      showReadReceipts: false
    })));
  }

  async getEventTileMarkup(mxEv, continuation, filePath) {
    const hasAvatar = !!this.getAvatarURL(mxEv);
    if (hasAvatar) await this.saveAvatarIfNeeded(mxEv);
    const EventTile = this.getEventTile(mxEv, continuation);
    let eventTileMarkup;

    if (mxEv.getContent().msgtype == _event2.MsgType.Emote || mxEv.getContent().msgtype == _event2.MsgType.Notice || mxEv.getContent().msgtype === _event2.MsgType.Text) {
      // to linkify textual events, we'll need lifecycle methods which won't be invoked in renderToString
      // So, we'll have to render the component into a temporary root element
      const tempRoot = document.createElement('div');

      _reactDom.default.render(EventTile, tempRoot);

      eventTileMarkup = tempRoot.innerHTML;
    } else {
      eventTileMarkup = (0, _server.renderToStaticMarkup)(EventTile);
    }

    if (filePath) {
      const mxc = mxEv.getContent().url || mxEv.getContent().file?.url;
      eventTileMarkup = eventTileMarkup.split(mxc).join(filePath);
    }

    eventTileMarkup = eventTileMarkup.replace(/<span class="mx_MFileBody_info_icon".*?>.*?<\/span>/, '');

    if (hasAvatar) {
      eventTileMarkup = eventTileMarkup.replace(encodeURI(this.getAvatarURL(mxEv)).replace(/&/g, '&amp;'), `users/${mxEv.sender.userId.replace(/:/g, "-")}.png`);
    }

    return eventTileMarkup;
  }

  createModifiedEvent(text, mxEv) {
    let italic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    const modifiedContent = {
      msgtype: "m.text",
      body: `${text}`,
      format: "org.matrix.custom.html",
      formatted_body: `${text}`
    };

    if (italic) {
      modifiedContent.formatted_body = '<em>' + modifiedContent.formatted_body + '</em>';
      modifiedContent.body = '*' + modifiedContent.body + '*';
    }

    const modifiedEvent = new _event.MatrixEvent();
    modifiedEvent.event = mxEv.event;
    modifiedEvent.sender = mxEv.sender;
    modifiedEvent.event.type = "m.room.message";
    modifiedEvent.event.content = modifiedContent;
    return modifiedEvent;
  }

  async createMessageBody(mxEv) {
    let joined = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let eventTile;

    try {
      if (this.isAttachment(mxEv)) {
        if (this.exportOptions.attachmentsIncluded) {
          try {
            const blob = await this.getMediaBlob(mxEv);

            if (this.totalSize + blob.size > this.exportOptions.maxSize) {
              eventTile = await this.getEventTileMarkup(this.createModifiedEvent(this.mediaOmitText, mxEv), joined);
            } else {
              this.totalSize += blob.size;
              const filePath = this.getFilePath(mxEv);
              eventTile = await this.getEventTileMarkup(mxEv, joined, filePath);

              if (this.totalSize == this.exportOptions.maxSize) {
                this.exportOptions.attachmentsIncluded = false;
              }

              this.addFile(filePath, blob);
            }
          } catch (e) {
            _logger.logger.log("Error while fetching file" + e);

            eventTile = await this.getEventTileMarkup(this.createModifiedEvent((0, _languageHandler._t)("Error fetching file"), mxEv), joined);
          }
        } else {
          eventTile = await this.getEventTileMarkup(this.createModifiedEvent(this.mediaOmitText, mxEv), joined);
        }
      } else eventTile = await this.getEventTileMarkup(mxEv, joined);
    } catch (e) {
      // TODO: Handle callEvent errors
      _logger.logger.error(e);

      eventTile = await this.getEventTileMarkup(this.createModifiedEvent((0, _TextForEvent.textForEvent)(mxEv), mxEv, false), joined);
    }

    return eventTile;
  }

  async createHTML(events, start) {
    let content = "";
    let prevEvent = null;

    for (let i = start; i < Math.min(start + 1000, events.length); i++) {
      const event = events[i];
      this.updateProgress((0, _languageHandler._t)("Processing event %(number)s out of %(total)s", {
        number: i + 1,
        total: events.length
      }), false, true);
      if (this.cancelled) return this.cleanUp();
      if (!(0, _EventTileFactory.haveRendererForEvent)(event, false)) continue;
      content += this.needsDateSeparator(event, prevEvent) ? this.getDateSeparator(event) : "";
      const shouldBeJoined = !this.needsDateSeparator(event, prevEvent) && (0, _MessagePanel.shouldFormContinuation)(prevEvent, event, false, this.threadsEnabled);
      const body = await this.createMessageBody(event, shouldBeJoined);
      this.totalSize += Buffer.byteLength(body);
      content += body;
      prevEvent = event;
    }

    return this.wrapHTML(content);
  }

  async export() {
    this.updateProgress((0, _languageHandler._t)("Starting export..."));
    const fetchStart = performance.now();
    const res = await this.getRequiredEvents();
    const fetchEnd = performance.now();
    this.updateProgress((0, _languageHandler._t)("Fetched %(count)s events in %(seconds)ss", {
      count: res.length,
      seconds: (fetchEnd - fetchStart) / 1000
    }), true, false);
    this.updateProgress((0, _languageHandler._t)("Creating HTML..."));
    const usedClasses = new Set();

    for (let page = 0; page < res.length / 1000; page++) {
      const html = await this.createHTML(res, page * 1000);
      const document = new DOMParser().parseFromString(html, "text/html");
      document.querySelectorAll("*").forEach(element => {
        element.classList.forEach(c => usedClasses.add(c));
      });
      this.addFile(`messages${page ? page + 1 : ""}.html`, new Blob([html]));
    }

    const exportCSS = await (0, _exportCSS.default)(usedClasses);
    this.addFile("css/style.css", new Blob([exportCSS]));
    this.addFile("js/script.js", new Blob([_exportJS.default]));
    await this.downloadZIP();
    const exportEnd = performance.now();

    if (this.cancelled) {
      _logger.logger.info("Export cancelled successfully");
    } else {
      this.updateProgress((0, _languageHandler._t)("Export successful!"));
      this.updateProgress((0, _languageHandler._t)("Exported %(count)s events in %(seconds)s seconds", {
        count: res.length,
        seconds: (exportEnd - fetchStart) / 1000
      }));
    }

    this.cleanUp();
  }

}

exports.default = HTMLExporter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIVE1MRXhwb3J0ZXIiLCJFeHBvcnRlciIsImNvbnN0cnVjdG9yIiwicm9vbSIsImV4cG9ydFR5cGUiLCJleHBvcnRPcHRpb25zIiwic2V0UHJvZ3Jlc3NUZXh0IiwiYXZhdGFycyIsIk1hcCIsInBlcm1hbGlua0NyZWF0b3IiLCJSb29tUGVybWFsaW5rQ3JlYXRvciIsInRvdGFsU2l6ZSIsIm1lZGlhT21pdFRleHQiLCJhdHRhY2htZW50c0luY2x1ZGVkIiwiX3QiLCJ0aHJlYWRzRW5hYmxlZCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImdldFJvb21BdmF0YXIiLCJibG9iIiwiYXZhdGFyVXJsIiwiQXZhdGFyIiwiYXZhdGFyVXJsRm9yUm9vbSIsImF2YXRhclBhdGgiLCJpbWFnZSIsImZldGNoIiwic2l6ZSIsImFkZEZpbGUiLCJlcnIiLCJsb2dnZXIiLCJsb2ciLCJhdmF0YXIiLCJuYW1lIiwicmVuZGVyVG9TdGF0aWNNYXJrdXAiLCJ3cmFwSFRNTCIsImNvbnRlbnQiLCJyb29tQXZhdGFyIiwiZXhwb3J0RGF0ZSIsImZvcm1hdEZ1bGxEYXRlTm9EYXlOb1RpbWUiLCJEYXRlIiwiY3JlYXRvciIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiRXZlbnRUeXBlIiwiUm9vbUNyZWF0ZSIsImdldFNlbmRlciIsImNyZWF0b3JOYW1lIiwiZ2V0TWVtYmVyIiwicmF3RGlzcGxheU5hbWUiLCJleHBvcnRlciIsImNsaWVudCIsImdldFVzZXJJZCIsImV4cG9ydGVyTmFtZSIsInRvcGljIiwiUm9vbVRvcGljIiwiZ2V0Q29udGVudCIsImNyZWF0ZWRUZXh0IiwiZXhwb3J0ZWRUZXh0Iiwicm9vbU5hbWUiLCJleHBvcnRlckRldGFpbHMiLCJ0b3BpY1RleHQiLCJnZXRBdmF0YXJVUkwiLCJldmVudCIsIm1lbWJlciIsInNlbmRlciIsImdldE14Y0F2YXRhclVybCIsIm1lZGlhRnJvbU14YyIsImdldFRodW1ibmFpbE9mU291cmNlSHR0cCIsInNhdmVBdmF0YXJJZk5lZWRlZCIsImhhcyIsInVzZXJJZCIsInNldCIsInJlcGxhY2UiLCJnZXREYXRlU2VwYXJhdG9yIiwidHMiLCJnZXRUcyIsImRhdGVTZXBhcmF0b3IiLCJnZXRSb29tSWQiLCJuZWVkc0RhdGVTZXBhcmF0b3IiLCJwcmV2RXZlbnQiLCJ3YW50c0RhdGVTZXBhcmF0b3IiLCJnZXREYXRlIiwiZ2V0RXZlbnRUaWxlIiwibXhFdiIsImNvbnRpbnVhdGlvbiIsImdldElkIiwiaXNSZWRhY3RlZCIsInJlcGxhY2luZ0V2ZW50SWQiLCJMYXlvdXQiLCJHcm91cCIsImdldEV2ZW50VGlsZU1hcmt1cCIsImZpbGVQYXRoIiwiaGFzQXZhdGFyIiwiRXZlbnRUaWxlIiwiZXZlbnRUaWxlTWFya3VwIiwibXNndHlwZSIsIk1zZ1R5cGUiLCJFbW90ZSIsIk5vdGljZSIsIlRleHQiLCJ0ZW1wUm9vdCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIlJlYWN0RE9NIiwicmVuZGVyIiwiaW5uZXJIVE1MIiwibXhjIiwidXJsIiwiZmlsZSIsInNwbGl0Iiwiam9pbiIsImVuY29kZVVSSSIsImNyZWF0ZU1vZGlmaWVkRXZlbnQiLCJ0ZXh0IiwiaXRhbGljIiwibW9kaWZpZWRDb250ZW50IiwiYm9keSIsImZvcm1hdCIsImZvcm1hdHRlZF9ib2R5IiwibW9kaWZpZWRFdmVudCIsIk1hdHJpeEV2ZW50IiwidHlwZSIsImNyZWF0ZU1lc3NhZ2VCb2R5Iiwiam9pbmVkIiwiZXZlbnRUaWxlIiwiaXNBdHRhY2htZW50IiwiZ2V0TWVkaWFCbG9iIiwibWF4U2l6ZSIsImdldEZpbGVQYXRoIiwiZSIsImVycm9yIiwidGV4dEZvckV2ZW50IiwiY3JlYXRlSFRNTCIsImV2ZW50cyIsInN0YXJ0IiwiaSIsIk1hdGgiLCJtaW4iLCJsZW5ndGgiLCJ1cGRhdGVQcm9ncmVzcyIsIm51bWJlciIsInRvdGFsIiwiY2FuY2VsbGVkIiwiY2xlYW5VcCIsImhhdmVSZW5kZXJlckZvckV2ZW50Iiwic2hvdWxkQmVKb2luZWQiLCJzaG91bGRGb3JtQ29udGludWF0aW9uIiwiQnVmZmVyIiwiYnl0ZUxlbmd0aCIsImV4cG9ydCIsImZldGNoU3RhcnQiLCJwZXJmb3JtYW5jZSIsIm5vdyIsInJlcyIsImdldFJlcXVpcmVkRXZlbnRzIiwiZmV0Y2hFbmQiLCJjb3VudCIsInNlY29uZHMiLCJ1c2VkQ2xhc3NlcyIsIlNldCIsInBhZ2UiLCJodG1sIiwiRE9NUGFyc2VyIiwicGFyc2VGcm9tU3RyaW5nIiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giLCJlbGVtZW50IiwiY2xhc3NMaXN0IiwiYyIsImFkZCIsIkJsb2IiLCJleHBvcnRDU1MiLCJnZXRFeHBvcnRDU1MiLCJleHBvcnRKUyIsImRvd25sb2FkWklQIiwiZXhwb3J0RW5kIiwiaW5mbyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9leHBvcnRVdGlscy9IdG1sRXhwb3J0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyByZW5kZXJUb1N0YXRpY01hcmt1cCB9IGZyb20gXCJyZWFjdC1kb20vc2VydmVyXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUsIE1zZ1R5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCBFeHBvcnRlciBmcm9tIFwiLi9FeHBvcnRlclwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IG1lZGlhRnJvbU14YyB9IGZyb20gXCIuLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL2VudW1zL0xheW91dFwiO1xuaW1wb3J0IHsgc2hvdWxkRm9ybUNvbnRpbnVhdGlvbiB9IGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3N0cnVjdHVyZXMvTWVzc2FnZVBhbmVsXCI7XG5pbXBvcnQgeyBmb3JtYXRGdWxsRGF0ZU5vRGF5Tm9UaW1lLCB3YW50c0RhdGVTZXBhcmF0b3IgfSBmcm9tIFwiLi4vLi4vRGF0ZVV0aWxzXCI7XG5pbXBvcnQgeyBSb29tUGVybWFsaW5rQ3JlYXRvciB9IGZyb20gXCIuLi9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0ICogYXMgQXZhdGFyIGZyb20gXCIuLi8uLi9BdmF0YXJcIjtcbmltcG9ydCBFdmVudFRpbGUgZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvRXZlbnRUaWxlXCI7XG5pbXBvcnQgRGF0ZVNlcGFyYXRvciBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9EYXRlU2VwYXJhdG9yXCI7XG5pbXBvcnQgQmFzZUF2YXRhciBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy92aWV3cy9hdmF0YXJzL0Jhc2VBdmF0YXJcIjtcbmltcG9ydCB7IEV4cG9ydFR5cGUsIElFeHBvcnRPcHRpb25zIH0gZnJvbSBcIi4vZXhwb3J0VXRpbHNcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgZ2V0RXhwb3J0Q1NTIGZyb20gXCIuL2V4cG9ydENTU1wiO1xuaW1wb3J0IHsgdGV4dEZvckV2ZW50IH0gZnJvbSBcIi4uLy4uL1RleHRGb3JFdmVudFwiO1xuaW1wb3J0IHsgaGF2ZVJlbmRlcmVyRm9yRXZlbnQgfSBmcm9tIFwiLi4vLi4vZXZlbnRzL0V2ZW50VGlsZUZhY3RvcnlcIjtcblxuaW1wb3J0IGV4cG9ydEpTIGZyb20gXCIhIXJhdy1sb2FkZXIhLi9leHBvcnRKU1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIVE1MRXhwb3J0ZXIgZXh0ZW5kcyBFeHBvcnRlciB7XG4gICAgcHJvdGVjdGVkIGF2YXRhcnM6IE1hcDxzdHJpbmcsIGJvb2xlYW4+O1xuICAgIHByb3RlY3RlZCBwZXJtYWxpbmtDcmVhdG9yOiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbiAgICBwcm90ZWN0ZWQgdG90YWxTaXplOiBudW1iZXI7XG4gICAgcHJvdGVjdGVkIG1lZGlhT21pdFRleHQ6IHN0cmluZztcbiAgICBwcml2YXRlIHRocmVhZHNFbmFibGVkOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJvb206IFJvb20sXG4gICAgICAgIGV4cG9ydFR5cGU6IEV4cG9ydFR5cGUsXG4gICAgICAgIGV4cG9ydE9wdGlvbnM6IElFeHBvcnRPcHRpb25zLFxuICAgICAgICBzZXRQcm9ncmVzc1RleHQ6IFJlYWN0LkRpc3BhdGNoPFJlYWN0LlNldFN0YXRlQWN0aW9uPHN0cmluZz4+LFxuICAgICkge1xuICAgICAgICBzdXBlcihyb29tLCBleHBvcnRUeXBlLCBleHBvcnRPcHRpb25zLCBzZXRQcm9ncmVzc1RleHQpO1xuICAgICAgICB0aGlzLmF2YXRhcnMgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcbiAgICAgICAgdGhpcy5wZXJtYWxpbmtDcmVhdG9yID0gbmV3IFJvb21QZXJtYWxpbmtDcmVhdG9yKHRoaXMucm9vbSk7XG4gICAgICAgIHRoaXMudG90YWxTaXplID0gMDtcbiAgICAgICAgdGhpcy5tZWRpYU9taXRUZXh0ID0gIXRoaXMuZXhwb3J0T3B0aW9ucy5hdHRhY2htZW50c0luY2x1ZGVkXG4gICAgICAgICAgICA/IF90KFwiTWVkaWEgb21pdHRlZFwiKVxuICAgICAgICAgICAgOiBfdChcIk1lZGlhIG9taXR0ZWQgLSBmaWxlIHNpemUgbGltaXQgZXhjZWVkZWRcIik7XG4gICAgICAgIHRoaXMudGhyZWFkc0VuYWJsZWQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIGdldFJvb21BdmF0YXIoKSB7XG4gICAgICAgIGxldCBibG9iOiBCbG9iO1xuICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSBBdmF0YXIuYXZhdGFyVXJsRm9yUm9vbSh0aGlzLnJvb20sIDMyLCAzMiwgXCJjcm9wXCIpO1xuICAgICAgICBjb25zdCBhdmF0YXJQYXRoID0gXCJyb29tLnBuZ1wiO1xuICAgICAgICBpZiAoYXZhdGFyVXJsKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlID0gYXdhaXQgZmV0Y2goYXZhdGFyVXJsKTtcbiAgICAgICAgICAgICAgICBibG9iID0gYXdhaXQgaW1hZ2UuYmxvYigpO1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxTaXplICs9IGJsb2Iuc2l6ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEZpbGUoYXZhdGFyUGF0aCwgYmxvYik7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiRmFpbGVkIHRvIGZldGNoIHJvb20ncyBhdmF0YXJcIiArIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXZhdGFyID0gKFxuICAgICAgICAgICAgPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICB3aWR0aD17MzJ9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXszMn1cbiAgICAgICAgICAgICAgICBuYW1lPXt0aGlzLnJvb20ubmFtZX1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5yb29tLm5hbWV9XG4gICAgICAgICAgICAgICAgdXJsPXtibG9iID8gYXZhdGFyUGF0aCA6IG51bGx9XG4gICAgICAgICAgICAgICAgcmVzaXplTWV0aG9kPVwiY3JvcFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVuZGVyVG9TdGF0aWNNYXJrdXAoYXZhdGFyKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgd3JhcEhUTUwoY29udGVudDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHJvb21BdmF0YXIgPSBhd2FpdCB0aGlzLmdldFJvb21BdmF0YXIoKTtcbiAgICAgICAgY29uc3QgZXhwb3J0RGF0ZSA9IGZvcm1hdEZ1bGxEYXRlTm9EYXlOb1RpbWUobmV3IERhdGUoKSk7XG4gICAgICAgIGNvbnN0IGNyZWF0b3IgPSB0aGlzLnJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tQ3JlYXRlLCBcIlwiKT8uZ2V0U2VuZGVyKCk7XG4gICAgICAgIGNvbnN0IGNyZWF0b3JOYW1lID0gdGhpcy5yb29tPy5nZXRNZW1iZXIoY3JlYXRvcik/LnJhd0Rpc3BsYXlOYW1lIHx8IGNyZWF0b3I7XG4gICAgICAgIGNvbnN0IGV4cG9ydGVyID0gdGhpcy5jbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgICAgIGNvbnN0IGV4cG9ydGVyTmFtZSA9IHRoaXMucm9vbT8uZ2V0TWVtYmVyKGV4cG9ydGVyKT8ucmF3RGlzcGxheU5hbWU7XG4gICAgICAgIGNvbnN0IHRvcGljID0gdGhpcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbVRvcGljLCBcIlwiKT8uZ2V0Q29udGVudCgpPy50b3BpYyB8fCBcIlwiO1xuICAgICAgICBjb25zdCBjcmVhdGVkVGV4dCA9IF90KFwiJShjcmVhdG9yTmFtZSlzIGNyZWF0ZWQgdGhpcyByb29tLlwiLCB7XG4gICAgICAgICAgICBjcmVhdG9yTmFtZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZXhwb3J0ZWRUZXh0ID0gcmVuZGVyVG9TdGF0aWNNYXJrdXAoXG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaXMgdGhlIHN0YXJ0IG9mIGV4cG9ydCBvZiA8cm9vbU5hbWUvPi4gRXhwb3J0ZWQgYnkgPGV4cG9ydGVyRGV0YWlscy8+IGF0ICUoZXhwb3J0RGF0ZSlzLlwiLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvcnREYXRlLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tTmFtZTogKCkgPT4gPGI+eyB0aGlzLnJvb20ubmFtZSB9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydGVyRGV0YWlsczogKCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e2BodHRwczovL21hdHJpeC50by8jLyR7ZXhwb3J0ZXJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGV4cG9ydGVyTmFtZSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGI+eyBleHBvcnRlck5hbWUgfTwvYj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IFwiIChcIiArIGV4cG9ydGVyICsgXCIpXCIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Yj57IGV4cG9ydGVyIH08L2I+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L3A+LFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHRvcGljVGV4dCA9IHRvcGljID8gX3QoXCJUb3BpYzogJSh0b3BpYylzXCIsIHsgdG9waWMgfSkgOiBcIlwiO1xuXG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgPCFET0NUWVBFIGh0bWw+XG4gICAgICAgICAgICA8aHRtbCBsYW5nPVwiZW5cIj5cbiAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cIlgtVUEtQ29tcGF0aWJsZVwiIGNvbnRlbnQ9XCJJRT1lZGdlXCIgLz5cbiAgICAgICAgICAgICAgICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMFwiIC8+XG4gICAgICAgICAgICAgICAgPGxpbmsgaHJlZj1cImNzcy9zdHlsZS5jc3NcIiByZWw9XCJzdHlsZXNoZWV0XCIgLz5cbiAgICAgICAgICAgICAgICA8c2NyaXB0IHNyYz1cImpzL3NjcmlwdC5qc1wiPjwvc2NyaXB0PlxuICAgICAgICAgICAgICAgIDx0aXRsZT5FeHBvcnRlZCBEYXRhPC90aXRsZT5cbiAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgIDxib2R5IHN0eWxlPVwiaGVpZ2h0OiAxMDB2aDtcIj5cbiAgICAgICAgICAgICAgICA8c2VjdGlvblxuICAgICAgICAgICAgICAgIGlkPVwibWF0cml4Y2hhdFwiXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7IG92ZXJmbG93OiBhdXRvXCJcbiAgICAgICAgICAgICAgICBjbGFzcz1cIm5vdHJhbnNsYXRlXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X01hdHJpeENoYXRfd3JhcHBlclwiIGFyaWEtaGlkZGVuPVwiZmFsc2VcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X01hdHJpeENoYXRcIj5cbiAgICAgICAgICAgICAgICAgICAgPG1haW4gY2xhc3M9XCJteF9Sb29tVmlld1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X1Jvb21IZWFkZXIgbGlnaHQtcGFuZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJteF9Sb29tSGVhZGVyX3dyYXBwZXJcIiBhcmlhLW93bnM9XCJteF9SaWdodFBhbmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X1Jvb21IZWFkZXJfYXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X0RlY29yYXRlZFJvb21BdmF0YXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3Jvb21BdmF0YXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X1Jvb21IZWFkZXJfbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyPVwiYXV0b1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwibXhfUm9vbUhlYWRlcl9uYW1ldGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiJHt0aGlzLnJvb20ubmFtZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLnJvb20ubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXhfUm9vbUhlYWRlcl90b3BpY1wiIGRpcj1cImF1dG9cIj4gJHt0b3BpY30gPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X01haW5TcGxpdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X1Jvb21WaWV3X2JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJteF9Sb29tVmlld190aW1lbGluZSBteF9Sb29tVmlld190aW1lbGluZV9ycl9lbmFibGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteF9BdXRvSGlkZVNjcm9sbGJhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteF9TY3JvbGxQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteF9Sb29tVmlld19tZXNzYWdlUGFuZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJteF9Sb29tVmlld19tZXNzYWdlTGlzdFdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cIm14X1Jvb21WaWV3X01lc3NhZ2VMaXN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGl2ZT1cInBvbGl0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwibGlzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X05ld1Jvb21JbnRyb1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyb29tQXZhdGFyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgyPiAke3RoaXMucm9vbS5uYW1lfSA8L2gyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+ICR7Y3JlYXRlZFRleHR9IDxici8+PGJyLz4gJHtleHBvcnRlZFRleHR9IDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxici8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4gJHt0b3BpY1RleHR9IDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7Y29udGVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm14X1Jvb21WaWV3X3N0YXR1c0FyZWFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXhfUm9vbVZpZXdfc3RhdHVzQXJlYUJveFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXhfUm9vbVZpZXdfc3RhdHVzQXJlYUJveF9saW5lXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L21haW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwic25hY2tiYXJcIi8+XG4gICAgICAgICAgICA8L2JvZHk+XG4gICAgICAgIDwvaHRtbD5gO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRBdmF0YXJVUkwoZXZlbnQ6IE1hdHJpeEV2ZW50KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gZXZlbnQuc2VuZGVyO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgbWVtYmVyLmdldE14Y0F2YXRhclVybCgpICYmXG4gICAgICAgICAgICBtZWRpYUZyb21NeGMobWVtYmVyLmdldE14Y0F2YXRhclVybCgpKS5nZXRUaHVtYm5haWxPZlNvdXJjZUh0dHAoXG4gICAgICAgICAgICAgICAgMzAsXG4gICAgICAgICAgICAgICAgMzAsXG4gICAgICAgICAgICAgICAgXCJjcm9wXCIsXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIHNhdmVBdmF0YXJJZk5lZWRlZChldmVudDogTWF0cml4RXZlbnQpIHtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gZXZlbnQuc2VuZGVyO1xuICAgICAgICBpZiAoIXRoaXMuYXZhdGFycy5oYXMobWVtYmVyLnVzZXJJZCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gdGhpcy5nZXRBdmF0YXJVUkwoZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXZhdGFycy5zZXQobWVtYmVyLnVzZXJJZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBhd2FpdCBmZXRjaChhdmF0YXJVcmwpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBpbWFnZS5ibG9iKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGaWxlKGB1c2Vycy8ke21lbWJlci51c2VySWQucmVwbGFjZSgvOi9nLCAnLScpfS5wbmdgLCBibG9iKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJGYWlsZWQgdG8gZmV0Y2ggdXNlcidzIGF2YXRhclwiICsgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXREYXRlU2VwYXJhdG9yKGV2ZW50OiBNYXRyaXhFdmVudCkge1xuICAgICAgICBjb25zdCB0cyA9IGV2ZW50LmdldFRzKCk7XG4gICAgICAgIGNvbnN0IGRhdGVTZXBhcmF0b3IgPSAoXG4gICAgICAgICAgICA8bGkga2V5PXt0c30+XG4gICAgICAgICAgICAgICAgPERhdGVTZXBhcmF0b3IgZm9yRXhwb3J0PXt0cnVlfSBrZXk9e3RzfSByb29tSWQ9e2V2ZW50LmdldFJvb21JZCgpfSB0cz17dHN9IC8+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVuZGVyVG9TdGF0aWNNYXJrdXAoZGF0ZVNlcGFyYXRvcik7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG5lZWRzRGF0ZVNlcGFyYXRvcihldmVudDogTWF0cml4RXZlbnQsIHByZXZFdmVudDogTWF0cml4RXZlbnQpIHtcbiAgICAgICAgaWYgKHByZXZFdmVudCA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHdhbnRzRGF0ZVNlcGFyYXRvcihwcmV2RXZlbnQuZ2V0RGF0ZSgpLCBldmVudC5nZXREYXRlKCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRFdmVudFRpbGUobXhFdjogTWF0cml4RXZlbnQsIGNvbnRpbnVhdGlvbjogYm9vbGVhbikge1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9FeHBvcnRfRXZlbnRXcmFwcGVyXCIgaWQ9e214RXYuZ2V0SWQoKX0+XG4gICAgICAgICAgICA8TWF0cml4Q2xpZW50Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17dGhpcy5jbGllbnR9PlxuICAgICAgICAgICAgICAgIDxFdmVudFRpbGVcbiAgICAgICAgICAgICAgICAgICAgbXhFdmVudD17bXhFdn1cbiAgICAgICAgICAgICAgICAgICAgY29udGludWF0aW9uPXtjb250aW51YXRpb259XG4gICAgICAgICAgICAgICAgICAgIGlzUmVkYWN0ZWQ9e214RXYuaXNSZWRhY3RlZCgpfVxuICAgICAgICAgICAgICAgICAgICByZXBsYWNpbmdFdmVudElkPXtteEV2LnJlcGxhY2luZ0V2ZW50SWQoKX1cbiAgICAgICAgICAgICAgICAgICAgZm9yRXhwb3J0PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICByZWFkUmVjZWlwdHM9e251bGx9XG4gICAgICAgICAgICAgICAgICAgIGFsd2F5c1Nob3dUaW1lc3RhbXBzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICByZWFkUmVjZWlwdE1hcD17bnVsbH1cbiAgICAgICAgICAgICAgICAgICAgc2hvd1VybFByZXZpZXc9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBjaGVja1VubW91bnRpbmc9eygpID0+IGZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBpc1R3ZWx2ZUhvdXI9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBsYXN0PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgbGFzdEluU2VjdGlvbj17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMucGVybWFsaW5rQ3JlYXRvcn1cbiAgICAgICAgICAgICAgICAgICAgbGFzdFN1Y2Nlc3NmdWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBpc1NlbGVjdGVkRXZlbnQ9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD17bnVsbH1cbiAgICAgICAgICAgICAgICAgICAgc2hvd1JlYWN0aW9ucz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIGxheW91dD17TGF5b3V0Lkdyb3VwfVxuICAgICAgICAgICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9NYXRyaXhDbGllbnRDb250ZXh0LlByb3ZpZGVyPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIGdldEV2ZW50VGlsZU1hcmt1cChteEV2OiBNYXRyaXhFdmVudCwgY29udGludWF0aW9uOiBib29sZWFuLCBmaWxlUGF0aD86IHN0cmluZykge1xuICAgICAgICBjb25zdCBoYXNBdmF0YXIgPSAhIXRoaXMuZ2V0QXZhdGFyVVJMKG14RXYpO1xuICAgICAgICBpZiAoaGFzQXZhdGFyKSBhd2FpdCB0aGlzLnNhdmVBdmF0YXJJZk5lZWRlZChteEV2KTtcbiAgICAgICAgY29uc3QgRXZlbnRUaWxlID0gdGhpcy5nZXRFdmVudFRpbGUobXhFdiwgY29udGludWF0aW9uKTtcbiAgICAgICAgbGV0IGV2ZW50VGlsZU1hcmt1cDogc3RyaW5nO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIG14RXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUgPT0gTXNnVHlwZS5FbW90ZSB8fFxuICAgICAgICAgICAgbXhFdi5nZXRDb250ZW50KCkubXNndHlwZSA9PSBNc2dUeXBlLk5vdGljZSB8fFxuICAgICAgICAgICAgbXhFdi5nZXRDb250ZW50KCkubXNndHlwZSA9PT0gTXNnVHlwZS5UZXh0XG4gICAgICAgICkge1xuICAgICAgICAgICAgLy8gdG8gbGlua2lmeSB0ZXh0dWFsIGV2ZW50cywgd2UnbGwgbmVlZCBsaWZlY3ljbGUgbWV0aG9kcyB3aGljaCB3b24ndCBiZSBpbnZva2VkIGluIHJlbmRlclRvU3RyaW5nXG4gICAgICAgICAgICAvLyBTbywgd2UnbGwgaGF2ZSB0byByZW5kZXIgdGhlIGNvbXBvbmVudCBpbnRvIGEgdGVtcG9yYXJ5IHJvb3QgZWxlbWVudFxuICAgICAgICAgICAgY29uc3QgdGVtcFJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgICAgICAgICBFdmVudFRpbGUsXG4gICAgICAgICAgICAgICAgdGVtcFJvb3QsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgZXZlbnRUaWxlTWFya3VwID0gdGVtcFJvb3QuaW5uZXJIVE1MO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnRUaWxlTWFya3VwID0gcmVuZGVyVG9TdGF0aWNNYXJrdXAoRXZlbnRUaWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICAgICAgY29uc3QgbXhjID0gbXhFdi5nZXRDb250ZW50KCkudXJsIHx8IG14RXYuZ2V0Q29udGVudCgpLmZpbGU/LnVybDtcbiAgICAgICAgICAgIGV2ZW50VGlsZU1hcmt1cCA9IGV2ZW50VGlsZU1hcmt1cC5zcGxpdChteGMpLmpvaW4oZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50VGlsZU1hcmt1cCA9IGV2ZW50VGlsZU1hcmt1cC5yZXBsYWNlKC88c3BhbiBjbGFzcz1cIm14X01GaWxlQm9keV9pbmZvX2ljb25cIi4qPz4uKj88XFwvc3Bhbj4vLCAnJyk7XG4gICAgICAgIGlmIChoYXNBdmF0YXIpIHtcbiAgICAgICAgICAgIGV2ZW50VGlsZU1hcmt1cCA9IGV2ZW50VGlsZU1hcmt1cC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIGVuY29kZVVSSSh0aGlzLmdldEF2YXRhclVSTChteEV2KSkucmVwbGFjZSgvJi9nLCAnJmFtcDsnKSxcbiAgICAgICAgICAgICAgICBgdXNlcnMvJHtteEV2LnNlbmRlci51c2VySWQucmVwbGFjZSgvOi9nLCBcIi1cIil9LnBuZ2AsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBldmVudFRpbGVNYXJrdXA7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZU1vZGlmaWVkRXZlbnQodGV4dDogc3RyaW5nLCBteEV2OiBNYXRyaXhFdmVudCwgaXRhbGljPXRydWUpIHtcbiAgICAgICAgY29uc3QgbW9kaWZpZWRDb250ZW50ID0ge1xuICAgICAgICAgICAgbXNndHlwZTogXCJtLnRleHRcIixcbiAgICAgICAgICAgIGJvZHk6IGAke3RleHR9YCxcbiAgICAgICAgICAgIGZvcm1hdDogXCJvcmcubWF0cml4LmN1c3RvbS5odG1sXCIsXG4gICAgICAgICAgICBmb3JtYXR0ZWRfYm9keTogYCR7dGV4dH1gLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoaXRhbGljKSB7XG4gICAgICAgICAgICBtb2RpZmllZENvbnRlbnQuZm9ybWF0dGVkX2JvZHkgPSAnPGVtPicgKyBtb2RpZmllZENvbnRlbnQuZm9ybWF0dGVkX2JvZHkgKyAnPC9lbT4nO1xuICAgICAgICAgICAgbW9kaWZpZWRDb250ZW50LmJvZHkgPSAnKicgKyBtb2RpZmllZENvbnRlbnQuYm9keSArICcqJztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtb2RpZmllZEV2ZW50ID0gbmV3IE1hdHJpeEV2ZW50KCk7XG4gICAgICAgIG1vZGlmaWVkRXZlbnQuZXZlbnQgPSBteEV2LmV2ZW50O1xuICAgICAgICBtb2RpZmllZEV2ZW50LnNlbmRlciA9IG14RXYuc2VuZGVyO1xuICAgICAgICBtb2RpZmllZEV2ZW50LmV2ZW50LnR5cGUgPSBcIm0ucm9vbS5tZXNzYWdlXCI7XG4gICAgICAgIG1vZGlmaWVkRXZlbnQuZXZlbnQuY29udGVudCA9IG1vZGlmaWVkQ29udGVudDtcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVkRXZlbnQ7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZU1lc3NhZ2VCb2R5KG14RXY6IE1hdHJpeEV2ZW50LCBqb2luZWQgPSBmYWxzZSkge1xuICAgICAgICBsZXQgZXZlbnRUaWxlOiBzdHJpbmc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0F0dGFjaG1lbnQobXhFdikpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5leHBvcnRPcHRpb25zLmF0dGFjaG1lbnRzSW5jbHVkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB0aGlzLmdldE1lZGlhQmxvYihteEV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRvdGFsU2l6ZSArIGJsb2Iuc2l6ZSA+IHRoaXMuZXhwb3J0T3B0aW9ucy5tYXhTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUaWxlID0gYXdhaXQgdGhpcy5nZXRFdmVudFRpbGVNYXJrdXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTW9kaWZpZWRFdmVudCh0aGlzLm1lZGlhT21pdFRleHQsIG14RXYpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqb2luZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b3RhbFNpemUgKz0gYmxvYi5zaXplO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGhpcy5nZXRGaWxlUGF0aChteEV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFRpbGUgPSBhd2FpdCB0aGlzLmdldEV2ZW50VGlsZU1hcmt1cChteEV2LCBqb2luZWQsIGZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50b3RhbFNpemUgPT0gdGhpcy5leHBvcnRPcHRpb25zLm1heFNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBvcnRPcHRpb25zLmF0dGFjaG1lbnRzSW5jbHVkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRGaWxlKGZpbGVQYXRoLCBibG9iKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkVycm9yIHdoaWxlIGZldGNoaW5nIGZpbGVcIiArIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUaWxlID0gYXdhaXQgdGhpcy5nZXRFdmVudFRpbGVNYXJrdXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVNb2RpZmllZEV2ZW50KF90KFwiRXJyb3IgZmV0Y2hpbmcgZmlsZVwiKSwgbXhFdiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgam9pbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VGlsZSA9IGF3YWl0IHRoaXMuZ2V0RXZlbnRUaWxlTWFya3VwKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVNb2RpZmllZEV2ZW50KHRoaXMubWVkaWFPbWl0VGV4dCwgbXhFdiksXG4gICAgICAgICAgICAgICAgICAgICAgICBqb2luZWQsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGV2ZW50VGlsZSA9IGF3YWl0IHRoaXMuZ2V0RXZlbnRUaWxlTWFya3VwKG14RXYsIGpvaW5lZCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IEhhbmRsZSBjYWxsRXZlbnQgZXJyb3JzXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICBldmVudFRpbGUgPSBhd2FpdCB0aGlzLmdldEV2ZW50VGlsZU1hcmt1cChcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZU1vZGlmaWVkRXZlbnQodGV4dEZvckV2ZW50KG14RXYpLCBteEV2LCBmYWxzZSksXG4gICAgICAgICAgICAgICAgam9pbmVkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBldmVudFRpbGU7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUhUTUwoZXZlbnRzOiBNYXRyaXhFdmVudFtdLCBzdGFydDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBjb250ZW50ID0gXCJcIjtcbiAgICAgICAgbGV0IHByZXZFdmVudCA9IG51bGw7XG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IE1hdGgubWluKHN0YXJ0ICsgMTAwMCwgZXZlbnRzLmxlbmd0aCk7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBldmVudHNbaV07XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2dyZXNzKF90KFwiUHJvY2Vzc2luZyBldmVudCAlKG51bWJlcilzIG91dCBvZiAlKHRvdGFsKXNcIiwge1xuICAgICAgICAgICAgICAgIG51bWJlcjogaSArIDEsXG4gICAgICAgICAgICAgICAgdG90YWw6IGV2ZW50cy5sZW5ndGgsXG4gICAgICAgICAgICB9KSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY2FuY2VsbGVkKSByZXR1cm4gdGhpcy5jbGVhblVwKCk7XG4gICAgICAgICAgICBpZiAoIWhhdmVSZW5kZXJlckZvckV2ZW50KGV2ZW50LCBmYWxzZSkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb250ZW50ICs9IHRoaXMubmVlZHNEYXRlU2VwYXJhdG9yKGV2ZW50LCBwcmV2RXZlbnQpID8gdGhpcy5nZXREYXRlU2VwYXJhdG9yKGV2ZW50KSA6IFwiXCI7XG4gICAgICAgICAgICBjb25zdCBzaG91bGRCZUpvaW5lZCA9ICF0aGlzLm5lZWRzRGF0ZVNlcGFyYXRvcihldmVudCwgcHJldkV2ZW50KSAmJlxuICAgICAgICAgICAgICAgIHNob3VsZEZvcm1Db250aW51YXRpb24ocHJldkV2ZW50LCBldmVudCwgZmFsc2UsIHRoaXMudGhyZWFkc0VuYWJsZWQpO1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHRoaXMuY3JlYXRlTWVzc2FnZUJvZHkoZXZlbnQsIHNob3VsZEJlSm9pbmVkKTtcbiAgICAgICAgICAgIHRoaXMudG90YWxTaXplICs9IEJ1ZmZlci5ieXRlTGVuZ3RoKGJvZHkpO1xuICAgICAgICAgICAgY29udGVudCArPSBib2R5O1xuICAgICAgICAgICAgcHJldkV2ZW50ID0gZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMud3JhcEhUTUwoY29udGVudCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGV4cG9ydCgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzcyhfdChcIlN0YXJ0aW5nIGV4cG9ydC4uLlwiKSk7XG5cbiAgICAgICAgY29uc3QgZmV0Y2hTdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmdldFJlcXVpcmVkRXZlbnRzKCk7XG4gICAgICAgIGNvbnN0IGZldGNoRW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzcyhfdChcIkZldGNoZWQgJShjb3VudClzIGV2ZW50cyBpbiAlKHNlY29uZHMpc3NcIiwge1xuICAgICAgICAgICAgY291bnQ6IHJlcy5sZW5ndGgsXG4gICAgICAgICAgICBzZWNvbmRzOiAoZmV0Y2hFbmQgLSBmZXRjaFN0YXJ0KSAvIDEwMDAsXG4gICAgICAgIH0pLCB0cnVlLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzcyhfdChcIkNyZWF0aW5nIEhUTUwuLi5cIikpO1xuXG4gICAgICAgIGNvbnN0IHVzZWRDbGFzc2VzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGZvciAobGV0IHBhZ2UgPSAwOyBwYWdlIDwgcmVzLmxlbmd0aCAvIDEwMDA7IHBhZ2UrKykge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IGF3YWl0IHRoaXMuY3JlYXRlSFRNTChyZXMsIHBhZ2UgKiAxMDAwKTtcbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50ID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhodG1sLCBcInRleHQvaHRtbFwiKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuZm9yRWFjaChjID0+IHVzZWRDbGFzc2VzLmFkZChjKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWRkRmlsZShgbWVzc2FnZXMke3BhZ2UgPyBwYWdlICsgMSA6IFwiXCJ9Lmh0bWxgLCBuZXcgQmxvYihbaHRtbF0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV4cG9ydENTUyA9IGF3YWl0IGdldEV4cG9ydENTUyh1c2VkQ2xhc3Nlcyk7XG4gICAgICAgIHRoaXMuYWRkRmlsZShcImNzcy9zdHlsZS5jc3NcIiwgbmV3IEJsb2IoW2V4cG9ydENTU10pKTtcbiAgICAgICAgdGhpcy5hZGRGaWxlKFwianMvc2NyaXB0LmpzXCIsIG5ldyBCbG9iKFtleHBvcnRKU10pKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmRvd25sb2FkWklQKCk7XG5cbiAgICAgICAgY29uc3QgZXhwb3J0RW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhcIkV4cG9ydCBjYW5jZWxsZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzcyhfdChcIkV4cG9ydCBzdWNjZXNzZnVsIVwiKSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByb2dyZXNzKF90KFwiRXhwb3J0ZWQgJShjb3VudClzIGV2ZW50cyBpbiAlKHNlY29uZHMpcyBzZWNvbmRzXCIsIHtcbiAgICAgICAgICAgICAgICBjb3VudDogcmVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzZWNvbmRzOiAoZXhwb3J0RW5kIC0gZmV0Y2hTdGFydCkgLyAxMDAwLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGVhblVwKCk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7O0FBMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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