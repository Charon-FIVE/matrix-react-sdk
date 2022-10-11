"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _room = require("matrix-js-sdk/src/models/room");

var _user = require("matrix-js-sdk/src/models/user");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _event = require("matrix-js-sdk/src/models/event");

var _languageHandler = require("../../../languageHandler");

var _QRCode = _interopRequireDefault(require("../elements/QRCode"));

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _strings = require("../../../utils/strings");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _CopyableText = _interopRequireDefault(require("../elements/CopyableText"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2018 New Vector Ltd
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
const socials = [{
  name: 'Facebook',
  img: require("../../../../res/img/social/facebook.png"),
  url: url => `https://www.facebook.com/sharer/sharer.php?u=${url}`
}, {
  name: 'Twitter',
  img: require("../../../../res/img/social/twitter-2.png"),
  url: url => `https://twitter.com/home?status=${url}`
},
/* // icon missing
 name: 'Google Plus',
 img: 'img/social/',
 url: (url) => `https://plus.google.com/share?url=${url}`,
},*/
{
  name: 'LinkedIn',
  img: require("../../../../res/img/social/linkedin.png"),
  url: url => `https://www.linkedin.com/shareArticle?mini=true&url=${url}`
}, {
  name: 'Reddit',
  img: require("../../../../res/img/social/reddit.png"),
  url: url => `https://www.reddit.com/submit?url=${url}`
}, {
  name: 'email',
  img: require("../../../../res/img/social/email-1.png"),
  url: url => `mailto:?body=${url}`
}];

class ShareDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "closeCopiedTooltip", void 0);
    (0, _defineProperty2.default)(this, "onLinkSpecificEventCheckboxClick", () => {
      this.setState({
        linkSpecificEvent: !this.state.linkSpecificEvent
      });
    });
    let permalinkCreator = null;

    if (props.target instanceof _room.Room) {
      permalinkCreator = new _Permalinks.RoomPermalinkCreator(props.target);
      permalinkCreator.load();
    }

    this.state = {
      // MatrixEvent defaults to share linkSpecificEvent
      linkSpecificEvent: this.props.target instanceof _event.MatrixEvent,
      permalinkCreator
    };
  }

  static onLinkClick(e) {
    e.preventDefault();
    (0, _strings.selectText)(e.target);
  }

  componentWillUnmount() {
    // if the Copied tooltip is open then get rid of it, there are ways to close the modal which wouldn't close
    // the tooltip otherwise, such as pressing Escape or clicking X really quickly
    if (this.closeCopiedTooltip) this.closeCopiedTooltip();
  }

  getUrl() {
    let matrixToUrl;

    if (this.props.target instanceof _room.Room) {
      if (this.state.linkSpecificEvent) {
        const events = this.props.target.getLiveTimeline().getEvents();
        matrixToUrl = this.state.permalinkCreator.forEvent(events[events.length - 1].getId());
      } else {
        matrixToUrl = this.state.permalinkCreator.forShareableRoom();
      }
    } else if (this.props.target instanceof _user.User || this.props.target instanceof _roomMember.RoomMember) {
      matrixToUrl = (0, _Permalinks.makeUserPermalink)(this.props.target.userId);
    } else if (this.props.target instanceof _event.MatrixEvent) {
      if (this.state.linkSpecificEvent) {
        matrixToUrl = this.props.permalinkCreator.forEvent(this.props.target.getId());
      } else {
        matrixToUrl = this.props.permalinkCreator.forShareableRoom();
      }
    }

    return matrixToUrl;
  }

  render() {
    let title;
    let checkbox;

    if (this.props.target instanceof _room.Room) {
      title = (0, _languageHandler._t)('Share Room');
      const events = this.props.target.getLiveTimeline().getEvents();

      if (events.length > 0) {
        checkbox = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(_StyledCheckbox.default, {
          checked: this.state.linkSpecificEvent,
          onChange: this.onLinkSpecificEventCheckboxClick
        }, (0, _languageHandler._t)('Link to most recent message')));
      }
    } else if (this.props.target instanceof _user.User || this.props.target instanceof _roomMember.RoomMember) {
      title = (0, _languageHandler._t)('Share User');
    } else if (this.props.target instanceof _event.MatrixEvent) {
      title = (0, _languageHandler._t)('Share Room Message');
      checkbox = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(_StyledCheckbox.default, {
        checked: this.state.linkSpecificEvent,
        onChange: this.onLinkSpecificEventCheckboxClick
      }, (0, _languageHandler._t)('Link to selected message')));
    }

    const matrixToUrl = this.getUrl();
    const encodedUrl = encodeURIComponent(matrixToUrl);

    const showQrCode = _SettingsStore.default.getValue(_UIFeature.UIFeature.ShareQRCode);

    const showSocials = _SettingsStore.default.getValue(_UIFeature.UIFeature.ShareSocial);

    let qrSocialSection;

    if (showQrCode || showSocials) {
      qrSocialSection = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", {
        className: "mx_ShareDialog_split"
      }, showQrCode && /*#__PURE__*/React.createElement("div", {
        className: "mx_ShareDialog_qrcode_container"
      }, /*#__PURE__*/React.createElement(_QRCode.default, {
        data: matrixToUrl,
        width: 256
      })), showSocials && /*#__PURE__*/React.createElement("div", {
        className: "mx_ShareDialog_social_container"
      }, socials.map(social => /*#__PURE__*/React.createElement("a", {
        rel: "noreferrer noopener",
        target: "_blank",
        key: social.name,
        title: social.name,
        href: social.url(encodedUrl),
        className: "mx_ShareDialog_social_icon"
      }, /*#__PURE__*/React.createElement("img", {
        src: social.img,
        alt: social.name,
        height: 64,
        width: 64
      }))))));
    }

    return /*#__PURE__*/React.createElement(_BaseDialog.default, {
      title: title,
      className: "mx_ShareDialog",
      contentId: "mx_Dialog_content",
      onFinished: this.props.onFinished
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_ShareDialog_content"
    }, /*#__PURE__*/React.createElement(_CopyableText.default, {
      getTextToCopy: () => matrixToUrl
    }, /*#__PURE__*/React.createElement("a", {
      title: (0, _languageHandler._t)('Link to room'),
      href: matrixToUrl,
      onClick: ShareDialog.onLinkClick
    }, matrixToUrl)), checkbox, qrSocialSection));
  }

}

exports.default = ShareDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzb2NpYWxzIiwibmFtZSIsImltZyIsInJlcXVpcmUiLCJ1cmwiLCJTaGFyZURpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzZXRTdGF0ZSIsImxpbmtTcGVjaWZpY0V2ZW50Iiwic3RhdGUiLCJwZXJtYWxpbmtDcmVhdG9yIiwidGFyZ2V0IiwiUm9vbSIsIlJvb21QZXJtYWxpbmtDcmVhdG9yIiwibG9hZCIsIk1hdHJpeEV2ZW50Iiwib25MaW5rQ2xpY2siLCJlIiwicHJldmVudERlZmF1bHQiLCJzZWxlY3RUZXh0IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJjbG9zZUNvcGllZFRvb2x0aXAiLCJnZXRVcmwiLCJtYXRyaXhUb1VybCIsImV2ZW50cyIsImdldExpdmVUaW1lbGluZSIsImdldEV2ZW50cyIsImZvckV2ZW50IiwibGVuZ3RoIiwiZ2V0SWQiLCJmb3JTaGFyZWFibGVSb29tIiwiVXNlciIsIlJvb21NZW1iZXIiLCJtYWtlVXNlclBlcm1hbGluayIsInVzZXJJZCIsInJlbmRlciIsInRpdGxlIiwiY2hlY2tib3giLCJfdCIsIm9uTGlua1NwZWNpZmljRXZlbnRDaGVja2JveENsaWNrIiwiZW5jb2RlZFVybCIsImVuY29kZVVSSUNvbXBvbmVudCIsInNob3dRckNvZGUiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJTaGFyZVFSQ29kZSIsInNob3dTb2NpYWxzIiwiU2hhcmVTb2NpYWwiLCJxclNvY2lhbFNlY3Rpb24iLCJtYXAiLCJzb2NpYWwiLCJvbkZpbmlzaGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9TaGFyZURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3VzZXJcIjtcbmltcG9ydCB7IFJvb21NZW1iZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFFSQ29kZSBmcm9tIFwiLi4vZWxlbWVudHMvUVJDb2RlXCI7XG5pbXBvcnQgeyBSb29tUGVybWFsaW5rQ3JlYXRvciwgbWFrZVVzZXJQZXJtYWxpbmsgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgeyBzZWxlY3RUZXh0IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3N0cmluZ3NcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tICcuLi9lbGVtZW50cy9TdHlsZWRDaGVja2JveCc7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBVSUZlYXR1cmUgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgQ29weWFibGVUZXh0IGZyb20gXCIuLi9lbGVtZW50cy9Db3B5YWJsZVRleHRcIjtcblxuY29uc3Qgc29jaWFscyA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6ICdGYWNlYm9vaycsXG4gICAgICAgIGltZzogcmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvc29jaWFsL2ZhY2Vib29rLnBuZ1wiKSxcbiAgICAgICAgdXJsOiAodXJsKSA9PiBgaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9JHt1cmx9YCxcbiAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdUd2l0dGVyJyxcbiAgICAgICAgaW1nOiByZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9zb2NpYWwvdHdpdHRlci0yLnBuZ1wiKSxcbiAgICAgICAgdXJsOiAodXJsKSA9PiBgaHR0cHM6Ly90d2l0dGVyLmNvbS9ob21lP3N0YXR1cz0ke3VybH1gLFxuICAgIH0sIC8qIC8vIGljb24gbWlzc2luZ1xuICAgICAgICBuYW1lOiAnR29vZ2xlIFBsdXMnLFxuICAgICAgICBpbWc6ICdpbWcvc29jaWFsLycsXG4gICAgICAgIHVybDogKHVybCkgPT4gYGh0dHBzOi8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD0ke3VybH1gLFxuICAgIH0sKi8ge1xuICAgICAgICBuYW1lOiAnTGlua2VkSW4nLFxuICAgICAgICBpbWc6IHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3NvY2lhbC9saW5rZWRpbi5wbmdcIiksXG4gICAgICAgIHVybDogKHVybCkgPT4gYGh0dHBzOi8vd3d3LmxpbmtlZGluLmNvbS9zaGFyZUFydGljbGU/bWluaT10cnVlJnVybD0ke3VybH1gLFxuICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ1JlZGRpdCcsXG4gICAgICAgIGltZzogcmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvc29jaWFsL3JlZGRpdC5wbmdcIiksXG4gICAgICAgIHVybDogKHVybCkgPT4gYGh0dHBzOi8vd3d3LnJlZGRpdC5jb20vc3VibWl0P3VybD0ke3VybH1gLFxuICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ2VtYWlsJyxcbiAgICAgICAgaW1nOiByZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9zb2NpYWwvZW1haWwtMS5wbmdcIiksXG4gICAgICAgIHVybDogKHVybCkgPT4gYG1haWx0bzo/Ym9keT0ke3VybH1gLFxuICAgIH0sXG5dO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICB0YXJnZXQ6IFJvb20gfCBVc2VyIHwgUm9vbU1lbWJlciB8IE1hdHJpeEV2ZW50O1xuICAgIHBlcm1hbGlua0NyZWF0b3I6IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBsaW5rU3BlY2lmaWNFdmVudDogYm9vbGVhbjtcbiAgICBwZXJtYWxpbmtDcmVhdG9yOiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcmVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJvdGVjdGVkIGNsb3NlQ29waWVkVG9vbHRpcDogKCkgPT4gdm9pZDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBsZXQgcGVybWFsaW5rQ3JlYXRvcjogUm9vbVBlcm1hbGlua0NyZWF0b3IgPSBudWxsO1xuICAgICAgICBpZiAocHJvcHMudGFyZ2V0IGluc3RhbmNlb2YgUm9vbSkge1xuICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvciA9IG5ldyBSb29tUGVybWFsaW5rQ3JlYXRvcihwcm9wcy50YXJnZXQpO1xuICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvci5sb2FkKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gTWF0cml4RXZlbnQgZGVmYXVsdHMgdG8gc2hhcmUgbGlua1NwZWNpZmljRXZlbnRcbiAgICAgICAgICAgIGxpbmtTcGVjaWZpY0V2ZW50OiB0aGlzLnByb3BzLnRhcmdldCBpbnN0YW5jZW9mIE1hdHJpeEV2ZW50LFxuICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgb25MaW5rQ2xpY2soZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNlbGVjdFRleHQoZS50YXJnZXQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25MaW5rU3BlY2lmaWNFdmVudENoZWNrYm94Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbGlua1NwZWNpZmljRXZlbnQ6ICF0aGlzLnN0YXRlLmxpbmtTcGVjaWZpY0V2ZW50LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIC8vIGlmIHRoZSBDb3BpZWQgdG9vbHRpcCBpcyBvcGVuIHRoZW4gZ2V0IHJpZCBvZiBpdCwgdGhlcmUgYXJlIHdheXMgdG8gY2xvc2UgdGhlIG1vZGFsIHdoaWNoIHdvdWxkbid0IGNsb3NlXG4gICAgICAgIC8vIHRoZSB0b29sdGlwIG90aGVyd2lzZSwgc3VjaCBhcyBwcmVzc2luZyBFc2NhcGUgb3IgY2xpY2tpbmcgWCByZWFsbHkgcXVpY2tseVxuICAgICAgICBpZiAodGhpcy5jbG9zZUNvcGllZFRvb2x0aXApIHRoaXMuY2xvc2VDb3BpZWRUb29sdGlwKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRVcmwoKSB7XG4gICAgICAgIGxldCBtYXRyaXhUb1VybDtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy50YXJnZXQgaW5zdGFuY2VvZiBSb29tKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5saW5rU3BlY2lmaWNFdmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMucHJvcHMudGFyZ2V0LmdldExpdmVUaW1lbGluZSgpLmdldEV2ZW50cygpO1xuICAgICAgICAgICAgICAgIG1hdHJpeFRvVXJsID0gdGhpcy5zdGF0ZS5wZXJtYWxpbmtDcmVhdG9yLmZvckV2ZW50KGV2ZW50c1tldmVudHMubGVuZ3RoIC0gMV0uZ2V0SWQoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1hdHJpeFRvVXJsID0gdGhpcy5zdGF0ZS5wZXJtYWxpbmtDcmVhdG9yLmZvclNoYXJlYWJsZVJvb20oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnRhcmdldCBpbnN0YW5jZW9mIFVzZXIgfHwgdGhpcy5wcm9wcy50YXJnZXQgaW5zdGFuY2VvZiBSb29tTWVtYmVyKSB7XG4gICAgICAgICAgICBtYXRyaXhUb1VybCA9IG1ha2VVc2VyUGVybWFsaW5rKHRoaXMucHJvcHMudGFyZ2V0LnVzZXJJZCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50YXJnZXQgaW5zdGFuY2VvZiBNYXRyaXhFdmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubGlua1NwZWNpZmljRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBtYXRyaXhUb1VybCA9IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvci5mb3JFdmVudCh0aGlzLnByb3BzLnRhcmdldC5nZXRJZCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWF0cml4VG9VcmwgPSB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IuZm9yU2hhcmVhYmxlUm9vbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRyaXhUb1VybDtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCB0aXRsZTtcbiAgICAgICAgbGV0IGNoZWNrYm94O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRhcmdldCBpbnN0YW5jZW9mIFJvb20pIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoJ1NoYXJlIFJvb20nKTtcblxuICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gdGhpcy5wcm9wcy50YXJnZXQuZ2V0TGl2ZVRpbWVsaW5lKCkuZ2V0RXZlbnRzKCk7XG4gICAgICAgICAgICBpZiAoZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjaGVja2JveCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5saW5rU3BlY2lmaWNFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTGlua1NwZWNpZmljRXZlbnRDaGVja2JveENsaWNrfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdMaW5rIHRvIG1vc3QgcmVjZW50IG1lc3NhZ2UnKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkQ2hlY2tib3g+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMudGFyZ2V0IGluc3RhbmNlb2YgVXNlciB8fCB0aGlzLnByb3BzLnRhcmdldCBpbnN0YW5jZW9mIFJvb21NZW1iZXIpIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoJ1NoYXJlIFVzZXInKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnRhcmdldCBpbnN0YW5jZW9mIE1hdHJpeEV2ZW50KSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KCdTaGFyZSBSb29tIE1lc3NhZ2UnKTtcbiAgICAgICAgICAgIGNoZWNrYm94ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8U3R5bGVkQ2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5saW5rU3BlY2lmaWNFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25MaW5rU3BlY2lmaWNFdmVudENoZWNrYm94Q2xpY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdMaW5rIHRvIHNlbGVjdGVkIG1lc3NhZ2UnKSB9XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRDaGVja2JveD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1hdHJpeFRvVXJsID0gdGhpcy5nZXRVcmwoKTtcbiAgICAgICAgY29uc3QgZW5jb2RlZFVybCA9IGVuY29kZVVSSUNvbXBvbmVudChtYXRyaXhUb1VybCk7XG5cbiAgICAgICAgY29uc3Qgc2hvd1FyQ29kZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlNoYXJlUVJDb2RlKTtcbiAgICAgICAgY29uc3Qgc2hvd1NvY2lhbHMgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5TaGFyZVNvY2lhbCk7XG5cbiAgICAgICAgbGV0IHFyU29jaWFsU2VjdGlvbjtcbiAgICAgICAgaWYgKHNob3dRckNvZGUgfHwgc2hvd1NvY2lhbHMpIHtcbiAgICAgICAgICAgIHFyU29jaWFsU2VjdGlvbiA9IDw+XG4gICAgICAgICAgICAgICAgPGhyIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TaGFyZURpYWxvZ19zcGxpdFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHNob3dRckNvZGUgJiYgPGRpdiBjbGFzc05hbWU9XCJteF9TaGFyZURpYWxvZ19xcmNvZGVfY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8UVJDb2RlIGRhdGE9e21hdHJpeFRvVXJsfSB3aWR0aD17MjU2fSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgICAgICAgICB7IHNob3dTb2NpYWxzICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfU2hhcmVEaWFsb2dfc29jaWFsX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzb2NpYWxzLm1hcCgoc29jaWFsKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17c29jaWFsLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtzb2NpYWwubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj17c29jaWFsLnVybChlbmNvZGVkVXJsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU2hhcmVEaWFsb2dfc29jaWFsX2ljb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3NvY2lhbC5pbWd9IGFsdD17c29jaWFsLm5hbWV9IGhlaWdodD17NjR9IHdpZHRoPXs2NH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICApKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPEJhc2VEaWFsb2dcbiAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfU2hhcmVEaWFsb2cnXG4gICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NoYXJlRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8Q29weWFibGVUZXh0IGdldFRleHRUb0NvcHk9eygpID0+IG1hdHJpeFRvVXJsfT5cbiAgICAgICAgICAgICAgICAgICAgPGEgdGl0bGU9e190KCdMaW5rIHRvIHJvb20nKX0gaHJlZj17bWF0cml4VG9Vcmx9IG9uQ2xpY2s9e1NoYXJlRGlhbG9nLm9uTGlua0NsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbWF0cml4VG9VcmwgfVxuICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgPC9Db3B5YWJsZVRleHQ+XG4gICAgICAgICAgICAgICAgeyBjaGVja2JveCB9XG4gICAgICAgICAgICAgICAgeyBxclNvY2lhbFNlY3Rpb24gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQmFzZURpYWxvZz47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbUJBLE1BQU1BLE9BQU8sR0FBRyxDQUNaO0VBQ0lDLElBQUksRUFBRSxVQURWO0VBRUlDLEdBQUcsRUFBRUMsT0FBTyxDQUFDLHlDQUFELENBRmhCO0VBR0lDLEdBQUcsRUFBR0EsR0FBRCxJQUFVLGdEQUErQ0EsR0FBSTtBQUh0RSxDQURZLEVBS1Q7RUFDQ0gsSUFBSSxFQUFFLFNBRFA7RUFFQ0MsR0FBRyxFQUFFQyxPQUFPLENBQUMsMENBQUQsQ0FGYjtFQUdDQyxHQUFHLEVBQUdBLEdBQUQsSUFBVSxtQ0FBa0NBLEdBQUk7QUFIdEQsQ0FMUztBQVNUO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFBUztFQUNESCxJQUFJLEVBQUUsVUFETDtFQUVEQyxHQUFHLEVBQUVDLE9BQU8sQ0FBQyx5Q0FBRCxDQUZYO0VBR0RDLEdBQUcsRUFBR0EsR0FBRCxJQUFVLHVEQUFzREEsR0FBSTtBQUh4RSxDQWJPLEVBaUJUO0VBQ0NILElBQUksRUFBRSxRQURQO0VBRUNDLEdBQUcsRUFBRUMsT0FBTyxDQUFDLHVDQUFELENBRmI7RUFHQ0MsR0FBRyxFQUFHQSxHQUFELElBQVUscUNBQW9DQSxHQUFJO0FBSHhELENBakJTLEVBcUJUO0VBQ0NILElBQUksRUFBRSxPQURQO0VBRUNDLEdBQUcsRUFBRUMsT0FBTyxDQUFDLHdDQUFELENBRmI7RUFHQ0MsR0FBRyxFQUFHQSxHQUFELElBQVUsZ0JBQWVBLEdBQUk7QUFIbkMsQ0FyQlMsQ0FBaEI7O0FBc0NlLE1BQU1DLFdBQU4sU0FBMEJDLEtBQUssQ0FBQ0MsYUFBaEMsQ0FBOEQ7RUFHekVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0lBQ2YsTUFBTUEsS0FBTjtJQURlO0lBQUEsd0VBcUJ3QixNQUFNO01BQzdDLEtBQUtDLFFBQUwsQ0FBYztRQUNWQyxpQkFBaUIsRUFBRSxDQUFDLEtBQUtDLEtBQUwsQ0FBV0Q7TUFEckIsQ0FBZDtJQUdILENBekJrQjtJQUdmLElBQUlFLGdCQUFzQyxHQUFHLElBQTdDOztJQUNBLElBQUlKLEtBQUssQ0FBQ0ssTUFBTixZQUF3QkMsVUFBNUIsRUFBa0M7TUFDOUJGLGdCQUFnQixHQUFHLElBQUlHLGdDQUFKLENBQXlCUCxLQUFLLENBQUNLLE1BQS9CLENBQW5CO01BQ0FELGdCQUFnQixDQUFDSSxJQUFqQjtJQUNIOztJQUVELEtBQUtMLEtBQUwsR0FBYTtNQUNUO01BQ0FELGlCQUFpQixFQUFFLEtBQUtGLEtBQUwsQ0FBV0ssTUFBWCxZQUE2Qkksa0JBRnZDO01BR1RMO0lBSFMsQ0FBYjtFQUtIOztFQUVpQixPQUFYTSxXQUFXLENBQUNDLENBQUQsRUFBSTtJQUNsQkEsQ0FBQyxDQUFDQyxjQUFGO0lBQ0EsSUFBQUMsbUJBQUEsRUFBV0YsQ0FBQyxDQUFDTixNQUFiO0VBQ0g7O0VBUURTLG9CQUFvQixHQUFHO0lBQ25CO0lBQ0E7SUFDQSxJQUFJLEtBQUtDLGtCQUFULEVBQTZCLEtBQUtBLGtCQUFMO0VBQ2hDOztFQUVPQyxNQUFNLEdBQUc7SUFDYixJQUFJQyxXQUFKOztJQUVBLElBQUksS0FBS2pCLEtBQUwsQ0FBV0ssTUFBWCxZQUE2QkMsVUFBakMsRUFBdUM7TUFDbkMsSUFBSSxLQUFLSCxLQUFMLENBQVdELGlCQUFmLEVBQWtDO1FBQzlCLE1BQU1nQixNQUFNLEdBQUcsS0FBS2xCLEtBQUwsQ0FBV0ssTUFBWCxDQUFrQmMsZUFBbEIsR0FBb0NDLFNBQXBDLEVBQWY7UUFDQUgsV0FBVyxHQUFHLEtBQUtkLEtBQUwsQ0FBV0MsZ0JBQVgsQ0FBNEJpQixRQUE1QixDQUFxQ0gsTUFBTSxDQUFDQSxNQUFNLENBQUNJLE1BQVAsR0FBZ0IsQ0FBakIsQ0FBTixDQUEwQkMsS0FBMUIsRUFBckMsQ0FBZDtNQUNILENBSEQsTUFHTztRQUNITixXQUFXLEdBQUcsS0FBS2QsS0FBTCxDQUFXQyxnQkFBWCxDQUE0Qm9CLGdCQUE1QixFQUFkO01BQ0g7SUFDSixDQVBELE1BT08sSUFBSSxLQUFLeEIsS0FBTCxDQUFXSyxNQUFYLFlBQTZCb0IsVUFBN0IsSUFBcUMsS0FBS3pCLEtBQUwsQ0FBV0ssTUFBWCxZQUE2QnFCLHNCQUF0RSxFQUFrRjtNQUNyRlQsV0FBVyxHQUFHLElBQUFVLDZCQUFBLEVBQWtCLEtBQUszQixLQUFMLENBQVdLLE1BQVgsQ0FBa0J1QixNQUFwQyxDQUFkO0lBQ0gsQ0FGTSxNQUVBLElBQUksS0FBSzVCLEtBQUwsQ0FBV0ssTUFBWCxZQUE2Qkksa0JBQWpDLEVBQThDO01BQ2pELElBQUksS0FBS04sS0FBTCxDQUFXRCxpQkFBZixFQUFrQztRQUM5QmUsV0FBVyxHQUFHLEtBQUtqQixLQUFMLENBQVdJLGdCQUFYLENBQTRCaUIsUUFBNUIsQ0FBcUMsS0FBS3JCLEtBQUwsQ0FBV0ssTUFBWCxDQUFrQmtCLEtBQWxCLEVBQXJDLENBQWQ7TUFDSCxDQUZELE1BRU87UUFDSE4sV0FBVyxHQUFHLEtBQUtqQixLQUFMLENBQVdJLGdCQUFYLENBQTRCb0IsZ0JBQTVCLEVBQWQ7TUFDSDtJQUNKOztJQUNELE9BQU9QLFdBQVA7RUFDSDs7RUFFRFksTUFBTSxHQUFHO0lBQ0wsSUFBSUMsS0FBSjtJQUNBLElBQUlDLFFBQUo7O0lBRUEsSUFBSSxLQUFLL0IsS0FBTCxDQUFXSyxNQUFYLFlBQTZCQyxVQUFqQyxFQUF1QztNQUNuQ3dCLEtBQUssR0FBRyxJQUFBRSxtQkFBQSxFQUFHLFlBQUgsQ0FBUjtNQUVBLE1BQU1kLE1BQU0sR0FBRyxLQUFLbEIsS0FBTCxDQUFXSyxNQUFYLENBQWtCYyxlQUFsQixHQUFvQ0MsU0FBcEMsRUFBZjs7TUFDQSxJQUFJRixNQUFNLENBQUNJLE1BQVAsR0FBZ0IsQ0FBcEIsRUFBdUI7UUFDbkJTLFFBQVEsZ0JBQUcsOENBQ1Asb0JBQUMsdUJBQUQ7VUFDSSxPQUFPLEVBQUUsS0FBSzVCLEtBQUwsQ0FBV0QsaUJBRHhCO1VBRUksUUFBUSxFQUFFLEtBQUsrQjtRQUZuQixHQUlNLElBQUFELG1CQUFBLEVBQUcsNkJBQUgsQ0FKTixDQURPLENBQVg7TUFRSDtJQUNKLENBZEQsTUFjTyxJQUFJLEtBQUtoQyxLQUFMLENBQVdLLE1BQVgsWUFBNkJvQixVQUE3QixJQUFxQyxLQUFLekIsS0FBTCxDQUFXSyxNQUFYLFlBQTZCcUIsc0JBQXRFLEVBQWtGO01BQ3JGSSxLQUFLLEdBQUcsSUFBQUUsbUJBQUEsRUFBRyxZQUFILENBQVI7SUFDSCxDQUZNLE1BRUEsSUFBSSxLQUFLaEMsS0FBTCxDQUFXSyxNQUFYLFlBQTZCSSxrQkFBakMsRUFBOEM7TUFDakRxQixLQUFLLEdBQUcsSUFBQUUsbUJBQUEsRUFBRyxvQkFBSCxDQUFSO01BQ0FELFFBQVEsZ0JBQUcsOENBQ1Asb0JBQUMsdUJBQUQ7UUFDSSxPQUFPLEVBQUUsS0FBSzVCLEtBQUwsQ0FBV0QsaUJBRHhCO1FBRUksUUFBUSxFQUFFLEtBQUsrQjtNQUZuQixHQUlNLElBQUFELG1CQUFBLEVBQUcsMEJBQUgsQ0FKTixDQURPLENBQVg7SUFRSDs7SUFFRCxNQUFNZixXQUFXLEdBQUcsS0FBS0QsTUFBTCxFQUFwQjtJQUNBLE1BQU1rQixVQUFVLEdBQUdDLGtCQUFrQixDQUFDbEIsV0FBRCxDQUFyQzs7SUFFQSxNQUFNbUIsVUFBVSxHQUFHQyxzQkFBQSxDQUFjQyxRQUFkLENBQXVCQyxvQkFBQSxDQUFVQyxXQUFqQyxDQUFuQjs7SUFDQSxNQUFNQyxXQUFXLEdBQUdKLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUJDLG9CQUFBLENBQVVHLFdBQWpDLENBQXBCOztJQUVBLElBQUlDLGVBQUo7O0lBQ0EsSUFBSVAsVUFBVSxJQUFJSyxXQUFsQixFQUErQjtNQUMzQkUsZUFBZSxnQkFBRyx1REFDZCwrQkFEYyxlQUVkO1FBQUssU0FBUyxFQUFDO01BQWYsR0FDTVAsVUFBVSxpQkFBSTtRQUFLLFNBQVMsRUFBQztNQUFmLGdCQUNaLG9CQUFDLGVBQUQ7UUFBUSxJQUFJLEVBQUVuQixXQUFkO1FBQTJCLEtBQUssRUFBRTtNQUFsQyxFQURZLENBRHBCLEVBSU13QixXQUFXLGlCQUFJO1FBQUssU0FBUyxFQUFDO01BQWYsR0FDWGxELE9BQU8sQ0FBQ3FELEdBQVIsQ0FBYUMsTUFBRCxpQkFDVjtRQUNJLEdBQUcsRUFBQyxxQkFEUjtRQUVJLE1BQU0sRUFBQyxRQUZYO1FBR0ksR0FBRyxFQUFFQSxNQUFNLENBQUNyRCxJQUhoQjtRQUlJLEtBQUssRUFBRXFELE1BQU0sQ0FBQ3JELElBSmxCO1FBS0ksSUFBSSxFQUFFcUQsTUFBTSxDQUFDbEQsR0FBUCxDQUFXdUMsVUFBWCxDQUxWO1FBTUksU0FBUyxFQUFDO01BTmQsZ0JBUUk7UUFBSyxHQUFHLEVBQUVXLE1BQU0sQ0FBQ3BELEdBQWpCO1FBQXNCLEdBQUcsRUFBRW9ELE1BQU0sQ0FBQ3JELElBQWxDO1FBQXdDLE1BQU0sRUFBRSxFQUFoRDtRQUFvRCxLQUFLLEVBQUU7TUFBM0QsRUFSSixDQURGLENBRFcsQ0FKckIsQ0FGYyxDQUFsQjtJQXNCSDs7SUFFRCxvQkFBTyxvQkFBQyxtQkFBRDtNQUNILEtBQUssRUFBRXNDLEtBREo7TUFFSCxTQUFTLEVBQUMsZ0JBRlA7TUFHSCxTQUFTLEVBQUMsbUJBSFA7TUFJSCxVQUFVLEVBQUUsS0FBSzlCLEtBQUwsQ0FBVzhDO0lBSnBCLGdCQU1IO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQ0ksb0JBQUMscUJBQUQ7TUFBYyxhQUFhLEVBQUUsTUFBTTdCO0lBQW5DLGdCQUNJO01BQUcsS0FBSyxFQUFFLElBQUFlLG1CQUFBLEVBQUcsY0FBSCxDQUFWO01BQThCLElBQUksRUFBRWYsV0FBcEM7TUFBaUQsT0FBTyxFQUFFckIsV0FBVyxDQUFDYztJQUF0RSxHQUNNTyxXQUROLENBREosQ0FESixFQU1NYyxRQU5OLEVBT01ZLGVBUE4sQ0FORyxDQUFQO0VBZ0JIOztBQTFJd0UifQ==