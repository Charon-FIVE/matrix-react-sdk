"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _Pill = _interopRequireWildcard(require("../elements/Pill"));

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _HtmlUtils = require("../../../HtmlUtils");

var _Media = require("../../../customisations/Media");

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
class BridgeTile extends _react.default.PureComponent {
  render() {
    const content = this.props.ev.getContent(); // Validate

    if (!content.channel?.id || !content.protocol?.id) {
      _logger.logger.warn(`Bridge info event ${this.props.ev.getId()} has missing content. Tile will not render`);

      return null;
    }

    if (!content.bridgebot) {
      // Bridgebot was not required previously, so in order to not break rooms we are allowing
      // the sender to be used in place. When the proposal is merged, this should be removed.
      _logger.logger.warn(`Bridge info event ${this.props.ev.getId()} does not provide a 'bridgebot' key which` + "is deprecated behaviour. Using sender for now.");

      content.bridgebot = this.props.ev.getSender();
    }

    const {
      channel,
      network,
      protocol
    } = content;
    const protocolName = protocol.displayname || protocol.id;
    const channelName = channel.displayname || channel.id;
    let creator = null;

    if (content.creator) {
      creator = /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("This bridge was provisioned by <user />.", {}, {
        user: () => /*#__PURE__*/_react.default.createElement(_Pill.default, {
          type: _Pill.PillType.UserMention,
          room: this.props.room,
          url: (0, _Permalinks.makeUserPermalink)(content.creator),
          shouldShowPillAvatar: _SettingsStore.default.getValue("Pill.shouldShowPillAvatar")
        })
      }));
    }

    const bot = /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("This bridge is managed by <user />.", {}, {
      user: () => /*#__PURE__*/_react.default.createElement(_Pill.default, {
        type: _Pill.PillType.UserMention,
        room: this.props.room,
        url: (0, _Permalinks.makeUserPermalink)(content.bridgebot),
        shouldShowPillAvatar: _SettingsStore.default.getValue("Pill.shouldShowPillAvatar")
      })
    }));

    let networkIcon;

    if (protocol.avatar_url) {
      const avatarUrl = (0, _Media.mediaFromMxc)(protocol.avatar_url).getSquareThumbnailHttp(64);
      networkIcon = /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
        className: "mx_RoomSettingsDialog_protocolIcon",
        width: 48,
        height: 48,
        resizeMethod: "crop",
        name: protocolName,
        idName: protocolName,
        url: avatarUrl
      });
    } else {
      networkIcon = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomSettingsDialog_noProtocolIcon"
      });
    }

    let networkItem = null;

    if (network) {
      const networkName = network.displayname || network.id;

      let networkLink = /*#__PURE__*/_react.default.createElement("span", null, networkName);

      if (typeof network.external_url === "string" && (0, _HtmlUtils.isUrlPermitted)(network.external_url)) {
        networkLink = /*#__PURE__*/_react.default.createElement("a", {
          href: network.external_url,
          target: "_blank",
          rel: "noreferrer noopener"
        }, networkName);
      }

      networkItem = (0, _languageHandler._t)("Workspace: <networkLink/>", {}, {
        networkLink: () => networkLink
      });
    }

    let channelLink = /*#__PURE__*/_react.default.createElement("span", null, channelName);

    if (typeof channel.external_url === "string" && (0, _HtmlUtils.isUrlPermitted)(channel.external_url)) {
      channelLink = /*#__PURE__*/_react.default.createElement("a", {
        href: channel.external_url,
        target: "_blank",
        rel: "noreferrer noopener"
      }, channelName);
    }

    const id = this.props.ev.getId();
    return /*#__PURE__*/_react.default.createElement("li", {
      key: id,
      className: "mx_RoomSettingsDialog_BridgeList_listItem"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomSettingsDialog_column_icon"
    }, networkIcon), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomSettingsDialog_column_data"
    }, /*#__PURE__*/_react.default.createElement("h3", {
      className: "mx_RoomSettingsDialog_column_data_protocolName"
    }, protocolName), /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_RoomSettingsDialog_column_data_details mx_RoomSettingsDialog_workspace_channel_details"
    }, networkItem, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_RoomSettingsDialog_channel"
    }, (0, _languageHandler._t)("Channel: <channelLink/>", {}, {
      channelLink: () => channelLink
    }))), /*#__PURE__*/_react.default.createElement("ul", {
      className: "mx_RoomSettingsDialog_column_data_metadata mx_RoomSettingsDialog_metadata"
    }, creator, " ", bot)));
  }

}

exports.default = BridgeTile;
(0, _defineProperty2.default)(BridgeTile, "propTypes", {
  ev: _propTypes.default.object.isRequired,
  room: _propTypes.default.object.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCcmlkZ2VUaWxlIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwicmVuZGVyIiwiY29udGVudCIsInByb3BzIiwiZXYiLCJnZXRDb250ZW50IiwiY2hhbm5lbCIsImlkIiwicHJvdG9jb2wiLCJsb2dnZXIiLCJ3YXJuIiwiZ2V0SWQiLCJicmlkZ2Vib3QiLCJnZXRTZW5kZXIiLCJuZXR3b3JrIiwicHJvdG9jb2xOYW1lIiwiZGlzcGxheW5hbWUiLCJjaGFubmVsTmFtZSIsImNyZWF0b3IiLCJfdCIsInVzZXIiLCJQaWxsVHlwZSIsIlVzZXJNZW50aW9uIiwicm9vbSIsIm1ha2VVc2VyUGVybWFsaW5rIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiYm90IiwibmV0d29ya0ljb24iLCJhdmF0YXJfdXJsIiwiYXZhdGFyVXJsIiwibWVkaWFGcm9tTXhjIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsIm5ldHdvcmtJdGVtIiwibmV0d29ya05hbWUiLCJuZXR3b3JrTGluayIsImV4dGVybmFsX3VybCIsImlzVXJsUGVybWl0dGVkIiwiY2hhbm5lbExpbmsiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvQnJpZGdlVGlsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUGlsbCwgeyBQaWxsVHlwZSB9IGZyb20gXCIuLi9lbGVtZW50cy9QaWxsXCI7XG5pbXBvcnQgeyBtYWtlVXNlclBlcm1hbGluayB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL0Jhc2VBdmF0YXJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBpc1VybFBlcm1pdHRlZCB9IGZyb20gJy4uLy4uLy4uL0h0bWxVdGlscyc7XG5pbXBvcnQgeyBtZWRpYUZyb21NeGMgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgZXY6IE1hdHJpeEV2ZW50O1xuICAgIHJvb206IFJvb207XG59XG5cbi8qKlxuICogVGhpcyBzaG91bGQgbWF0Y2ggaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvbWF0cml4LWRvYy9ibG9iL2hzL21zYy1icmlkZ2UtaW5mL3Byb3Bvc2Fscy8yMzQ2LWJyaWRnZS1pbmZvLXN0YXRlLWV2ZW50Lm1kI21icmlkZ2VcbiAqL1xuaW50ZXJmYWNlIElCcmlkZ2VTdGF0ZUV2ZW50IHtcbiAgICBicmlkZ2Vib3Q6IHN0cmluZztcbiAgICBjcmVhdG9yPzogc3RyaW5nO1xuICAgIHByb3RvY29sOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIGRpc3BsYXluYW1lPzogc3RyaW5nO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGF2YXRhcl91cmw/OiBzdHJpbmc7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgZXh0ZXJuYWxfdXJsPzogc3RyaW5nO1xuICAgIH07XG4gICAgbmV0d29yaz86IHtcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgZGlzcGxheW5hbWU/OiBzdHJpbmc7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgYXZhdGFyX3VybD86IHN0cmluZztcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgICAgICBleHRlcm5hbF91cmw/OiBzdHJpbmc7XG4gICAgfTtcbiAgICBjaGFubmVsOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIGRpc3BsYXluYW1lPzogc3RyaW5nO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGF2YXRhcl91cmw/OiBzdHJpbmc7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgZXh0ZXJuYWxfdXJsPzogc3RyaW5nO1xuICAgIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyaWRnZVRpbGUgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGV2OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjb250ZW50OiBJQnJpZGdlU3RhdGVFdmVudCA9IHRoaXMucHJvcHMuZXYuZ2V0Q29udGVudCgpO1xuICAgICAgICAvLyBWYWxpZGF0ZVxuICAgICAgICBpZiAoIWNvbnRlbnQuY2hhbm5lbD8uaWQgfHwgIWNvbnRlbnQucHJvdG9jb2w/LmlkKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgQnJpZGdlIGluZm8gZXZlbnQgJHt0aGlzLnByb3BzLmV2LmdldElkKCl9IGhhcyBtaXNzaW5nIGNvbnRlbnQuIFRpbGUgd2lsbCBub3QgcmVuZGVyYCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbnRlbnQuYnJpZGdlYm90KSB7XG4gICAgICAgICAgICAvLyBCcmlkZ2Vib3Qgd2FzIG5vdCByZXF1aXJlZCBwcmV2aW91c2x5LCBzbyBpbiBvcmRlciB0byBub3QgYnJlYWsgcm9vbXMgd2UgYXJlIGFsbG93aW5nXG4gICAgICAgICAgICAvLyB0aGUgc2VuZGVyIHRvIGJlIHVzZWQgaW4gcGxhY2UuIFdoZW4gdGhlIHByb3Bvc2FsIGlzIG1lcmdlZCwgdGhpcyBzaG91bGQgYmUgcmVtb3ZlZC5cbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBCcmlkZ2UgaW5mbyBldmVudCAke3RoaXMucHJvcHMuZXYuZ2V0SWQoKX0gZG9lcyBub3QgcHJvdmlkZSBhICdicmlkZ2Vib3QnIGtleSB3aGljaGBcbiAgICAgICAgICAgICArIFwiaXMgZGVwcmVjYXRlZCBiZWhhdmlvdXIuIFVzaW5nIHNlbmRlciBmb3Igbm93LlwiKTtcbiAgICAgICAgICAgIGNvbnRlbnQuYnJpZGdlYm90ID0gdGhpcy5wcm9wcy5ldi5nZXRTZW5kZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGNoYW5uZWwsIG5ldHdvcmssIHByb3RvY29sIH0gPSBjb250ZW50O1xuICAgICAgICBjb25zdCBwcm90b2NvbE5hbWUgPSBwcm90b2NvbC5kaXNwbGF5bmFtZSB8fCBwcm90b2NvbC5pZDtcbiAgICAgICAgY29uc3QgY2hhbm5lbE5hbWUgPSBjaGFubmVsLmRpc3BsYXluYW1lIHx8IGNoYW5uZWwuaWQ7XG5cbiAgICAgICAgbGV0IGNyZWF0b3IgPSBudWxsO1xuICAgICAgICBpZiAoY29udGVudC5jcmVhdG9yKSB7XG4gICAgICAgICAgICBjcmVhdG9yID0gPGxpPnsgX3QoXCJUaGlzIGJyaWRnZSB3YXMgcHJvdmlzaW9uZWQgYnkgPHVzZXIgLz4uXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgdXNlcjogKCkgPT4gPFBpbGxcbiAgICAgICAgICAgICAgICAgICAgdHlwZT17UGlsbFR5cGUuVXNlck1lbnRpb259XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgdXJsPXttYWtlVXNlclBlcm1hbGluayhjb250ZW50LmNyZWF0b3IpfVxuICAgICAgICAgICAgICAgICAgICBzaG91bGRTaG93UGlsbEF2YXRhcj17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIil9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICB9KSB9PC9saT47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBib3QgPSA8bGk+eyBfdChcIlRoaXMgYnJpZGdlIGlzIG1hbmFnZWQgYnkgPHVzZXIgLz4uXCIsIHt9LCB7XG4gICAgICAgICAgICB1c2VyOiAoKSA9PiA8UGlsbFxuICAgICAgICAgICAgICAgIHR5cGU9e1BpbGxUeXBlLlVzZXJNZW50aW9ufVxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICB1cmw9e21ha2VVc2VyUGVybWFsaW5rKGNvbnRlbnQuYnJpZGdlYm90KX1cbiAgICAgICAgICAgICAgICBzaG91bGRTaG93UGlsbEF2YXRhcj17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIil9XG4gICAgICAgICAgICAvPixcbiAgICAgICAgfSkgfTwvbGk+O1xuXG4gICAgICAgIGxldCBuZXR3b3JrSWNvbjtcblxuICAgICAgICBpZiAocHJvdG9jb2wuYXZhdGFyX3VybCkge1xuICAgICAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gbWVkaWFGcm9tTXhjKHByb3RvY29sLmF2YXRhcl91cmwpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoNjQpO1xuXG4gICAgICAgICAgICBuZXR3b3JrSWNvbiA9IDxCYXNlQXZhdGFyIGNsYXNzTmFtZT1cIm14X1Jvb21TZXR0aW5nc0RpYWxvZ19wcm90b2NvbEljb25cIlxuICAgICAgICAgICAgICAgIHdpZHRoPXs0OH1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezQ4fVxuICAgICAgICAgICAgICAgIHJlc2l6ZU1ldGhvZD0nY3JvcCdcbiAgICAgICAgICAgICAgICBuYW1lPXtwcm90b2NvbE5hbWV9XG4gICAgICAgICAgICAgICAgaWROYW1lPXtwcm90b2NvbE5hbWV9XG4gICAgICAgICAgICAgICAgdXJsPXthdmF0YXJVcmx9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldHdvcmtJY29uID0gPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tU2V0dGluZ3NEaWFsb2dfbm9Qcm90b2NvbEljb25cIiAvPjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbmV0d29ya0l0ZW0gPSBudWxsO1xuICAgICAgICBpZiAobmV0d29yaykge1xuICAgICAgICAgICAgY29uc3QgbmV0d29ya05hbWUgPSBuZXR3b3JrLmRpc3BsYXluYW1lIHx8IG5ldHdvcmsuaWQ7XG4gICAgICAgICAgICBsZXQgbmV0d29ya0xpbmsgPSA8c3Bhbj57IG5ldHdvcmtOYW1lIH08L3NwYW4+O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBuZXR3b3JrLmV4dGVybmFsX3VybCA9PT0gXCJzdHJpbmdcIiAmJiBpc1VybFBlcm1pdHRlZChuZXR3b3JrLmV4dGVybmFsX3VybCkpIHtcbiAgICAgICAgICAgICAgICBuZXR3b3JrTGluayA9IChcbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17bmV0d29yay5leHRlcm5hbF91cmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57IG5ldHdvcmtOYW1lIH08L2E+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ldHdvcmtJdGVtID0gX3QoXCJXb3Jrc3BhY2U6IDxuZXR3b3JrTGluay8+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgbmV0d29ya0xpbms6ICgpID0+IG5ldHdvcmtMaW5rLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2hhbm5lbExpbmsgPSA8c3Bhbj57IGNoYW5uZWxOYW1lIH08L3NwYW4+O1xuICAgICAgICBpZiAodHlwZW9mIGNoYW5uZWwuZXh0ZXJuYWxfdXJsID09PSBcInN0cmluZ1wiICYmIGlzVXJsUGVybWl0dGVkKGNoYW5uZWwuZXh0ZXJuYWxfdXJsKSkge1xuICAgICAgICAgICAgY2hhbm5lbExpbmsgPSA8YSBocmVmPXtjaGFubmVsLmV4dGVybmFsX3VybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgY2hhbm5lbE5hbWUgfTwvYT47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpZCA9IHRoaXMucHJvcHMuZXYuZ2V0SWQoKTtcbiAgICAgICAgcmV0dXJuICg8bGkga2V5PXtpZH0gY2xhc3NOYW1lPVwibXhfUm9vbVNldHRpbmdzRGlhbG9nX0JyaWRnZUxpc3RfbGlzdEl0ZW1cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVNldHRpbmdzRGlhbG9nX2NvbHVtbl9pY29uXCI+XG4gICAgICAgICAgICAgICAgeyBuZXR3b3JrSWNvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVNldHRpbmdzRGlhbG9nX2NvbHVtbl9kYXRhXCI+XG4gICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cIm14X1Jvb21TZXR0aW5nc0RpYWxvZ19jb2x1bW5fZGF0YV9wcm90b2NvbE5hbWVcIj57IHByb3RvY29sTmFtZSB9PC9oMz5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJteF9Sb29tU2V0dGluZ3NEaWFsb2dfY29sdW1uX2RhdGFfZGV0YWlscyBteF9Sb29tU2V0dGluZ3NEaWFsb2dfd29ya3NwYWNlX2NoYW5uZWxfZGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgICAgICB7IG5ldHdvcmtJdGVtIH1cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfUm9vbVNldHRpbmdzRGlhbG9nX2NoYW5uZWxcIj57IF90KFwiQ2hhbm5lbDogPGNoYW5uZWxMaW5rLz5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWxMaW5rOiAoKSA9PiBjaGFubmVsTGluayxcbiAgICAgICAgICAgICAgICAgICAgfSkgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cIm14X1Jvb21TZXR0aW5nc0RpYWxvZ19jb2x1bW5fZGF0YV9tZXRhZGF0YSBteF9Sb29tU2V0dGluZ3NEaWFsb2dfbWV0YWRhdGFcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBjcmVhdG9yIH0geyBib3QgfVxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9saT4pO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBR0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFxRGUsTUFBTUEsVUFBTixTQUF5QkMsY0FBQSxDQUFNQyxhQUEvQixDQUFxRDtFQU1oRUMsTUFBTSxHQUFHO0lBQ0wsTUFBTUMsT0FBMEIsR0FBRyxLQUFLQyxLQUFMLENBQVdDLEVBQVgsQ0FBY0MsVUFBZCxFQUFuQyxDQURLLENBRUw7O0lBQ0EsSUFBSSxDQUFDSCxPQUFPLENBQUNJLE9BQVIsRUFBaUJDLEVBQWxCLElBQXdCLENBQUNMLE9BQU8sQ0FBQ00sUUFBUixFQUFrQkQsRUFBL0MsRUFBbUQ7TUFDL0NFLGNBQUEsQ0FBT0MsSUFBUCxDQUFhLHFCQUFvQixLQUFLUCxLQUFMLENBQVdDLEVBQVgsQ0FBY08sS0FBZCxFQUFzQiw0Q0FBdkQ7O01BQ0EsT0FBTyxJQUFQO0lBQ0g7O0lBQ0QsSUFBSSxDQUFDVCxPQUFPLENBQUNVLFNBQWIsRUFBd0I7TUFDcEI7TUFDQTtNQUNBSCxjQUFBLENBQU9DLElBQVAsQ0FBYSxxQkFBb0IsS0FBS1AsS0FBTCxDQUFXQyxFQUFYLENBQWNPLEtBQWQsRUFBc0IsMkNB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