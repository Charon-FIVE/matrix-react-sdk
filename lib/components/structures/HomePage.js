"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

var _pages = require("../../utils/pages");

var _languageHandler = require("../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _actions = require("../../dispatcher/actions");

var _BaseAvatar = _interopRequireDefault(require("../views/avatars/BaseAvatar"));

var _OwnProfileStore = require("../../stores/OwnProfileStore");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _AsyncStore = require("../../stores/AsyncStore");

var _useEventEmitter = require("../../hooks/useEventEmitter");

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _MiniAvatarUploader = _interopRequireWildcard(require("../views/elements/MiniAvatarUploader"));

var _PosthogTrackers = _interopRequireDefault(require("../../PosthogTrackers"));

var _EmbeddedPage = _interopRequireDefault(require("./EmbeddedPage"));

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
const onClickSendDm = ev => {
  _PosthogTrackers.default.trackInteraction("WebHomeCreateChatButton", ev);

  _dispatcher.default.dispatch({
    action: 'view_create_chat'
  });
};

const onClickExplore = ev => {
  _PosthogTrackers.default.trackInteraction("WebHomeExploreRoomsButton", ev);

  _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
};

const onClickNewRoom = ev => {
  _PosthogTrackers.default.trackInteraction("WebHomeCreateRoomButton", ev);

  _dispatcher.default.dispatch({
    action: 'view_create_room'
  });
};

const getOwnProfile = userId => ({
  displayName: _OwnProfileStore.OwnProfileStore.instance.displayName || userId,
  avatarUrl: _OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl(_MiniAvatarUploader.AVATAR_SIZE)
});

const UserWelcomeTop = () => {
  const cli = (0, React.useContext)(_MatrixClientContext.default);
  const userId = cli.getUserId();
  const [ownProfile, setOwnProfile] = (0, React.useState)(getOwnProfile(userId));
  (0, _useEventEmitter.useEventEmitter)(_OwnProfileStore.OwnProfileStore.instance, _AsyncStore.UPDATE_EVENT, () => {
    setOwnProfile(getOwnProfile(userId));
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(_MiniAvatarUploader.default, {
    hasAvatar: !!ownProfile.avatarUrl,
    hasAvatarLabel: (0, _languageHandler._tDom)("Great, that'll help people know it's you"),
    noAvatarLabel: (0, _languageHandler._tDom)("Add a photo so people know it's you."),
    setAvatarUrl: url => cli.setAvatarUrl(url),
    isUserAvatar: true,
    onClick: ev => _PosthogTrackers.default.trackInteraction("WebHomeMiniAvatarUploadButton", ev)
  }, /*#__PURE__*/React.createElement(_BaseAvatar.default, {
    idName: userId,
    name: ownProfile.displayName,
    url: ownProfile.avatarUrl,
    width: _MiniAvatarUploader.AVATAR_SIZE,
    height: _MiniAvatarUploader.AVATAR_SIZE,
    resizeMethod: "crop"
  })), /*#__PURE__*/React.createElement("h1", null, (0, _languageHandler._tDom)("Welcome %(name)s", {
    name: ownProfile.displayName
  })), /*#__PURE__*/React.createElement("h2", null, (0, _languageHandler._tDom)("Now, let's help you get started")));
};

const HomePage = _ref => {
  let {
    justRegistered = false
  } = _ref;

  const config = _SdkConfig.default.get();

  const pageUrl = (0, _pages.getHomePageUrl)(config);

  if (pageUrl) {
    return /*#__PURE__*/React.createElement(_EmbeddedPage.default, {
      className: "mx_HomePage",
      url: pageUrl,
      scrollbar: true
    });
  }

  let introSection;

  if (justRegistered || !_OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl(_MiniAvatarUploader.AVATAR_SIZE)) {
    introSection = /*#__PURE__*/React.createElement(UserWelcomeTop, null);
  } else {
    const brandingConfig = _SdkConfig.default.getObject("branding");

    const logoUrl = brandingConfig?.get("auth_header_logo_url") ?? "themes/element/img/logos/element-logo.svg";
    introSection = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
      src: logoUrl,
      alt: config.brand
    }), /*#__PURE__*/React.createElement("h1", null, (0, _languageHandler._tDom)("Welcome to %(appName)s", {
      appName: config.brand
    })), /*#__PURE__*/React.createElement("h2", null, (0, _languageHandler._tDom)("Own your conversations.")));
  }

  return /*#__PURE__*/React.createElement(_AutoHideScrollbar.default, {
    className: "mx_HomePage mx_HomePage_default",
    element: "main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx_HomePage_default_wrapper"
  }, introSection, /*#__PURE__*/React.createElement("div", {
    className: "mx_HomePage_default_buttons"
  }, /*#__PURE__*/React.createElement(_AccessibleButton.default, {
    onClick: onClickSendDm,
    className: "mx_HomePage_button_sendDm"
  }, (0, _languageHandler._tDom)("Send a Direct Message")), /*#__PURE__*/React.createElement(_AccessibleButton.default, {
    onClick: onClickExplore,
    className: "mx_HomePage_button_explore"
  }, (0, _languageHandler._tDom)("Explore Public Rooms")), /*#__PURE__*/React.createElement(_AccessibleButton.default, {
    onClick: onClickNewRoom,
    className: "mx_HomePage_button_createGroup"
  }, (0, _languageHandler._tDom)("Create a Group Chat")))));
};

var _default = HomePage;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvbkNsaWNrU2VuZERtIiwiZXYiLCJQb3N0aG9nVHJhY2tlcnMiLCJ0cmFja0ludGVyYWN0aW9uIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJvbkNsaWNrRXhwbG9yZSIsImZpcmUiLCJBY3Rpb24iLCJWaWV3Um9vbURpcmVjdG9yeSIsIm9uQ2xpY2tOZXdSb29tIiwiZ2V0T3duUHJvZmlsZSIsInVzZXJJZCIsImRpc3BsYXlOYW1lIiwiT3duUHJvZmlsZVN0b3JlIiwiaW5zdGFuY2UiLCJhdmF0YXJVcmwiLCJnZXRIdHRwQXZhdGFyVXJsIiwiQVZBVEFSX1NJWkUiLCJVc2VyV2VsY29tZVRvcCIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiZ2V0VXNlcklkIiwib3duUHJvZmlsZSIsInNldE93blByb2ZpbGUiLCJ1c2VTdGF0ZSIsInVzZUV2ZW50RW1pdHRlciIsIlVQREFURV9FVkVOVCIsIl90RG9tIiwidXJsIiwic2V0QXZhdGFyVXJsIiwibmFtZSIsIkhvbWVQYWdlIiwianVzdFJlZ2lzdGVyZWQiLCJjb25maWciLCJTZGtDb25maWciLCJnZXQiLCJwYWdlVXJsIiwiZ2V0SG9tZVBhZ2VVcmwiLCJpbnRyb1NlY3Rpb24iLCJicmFuZGluZ0NvbmZpZyIsImdldE9iamVjdCIsImxvZ29VcmwiLCJicmFuZCIsImFwcE5hbWUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL0hvbWVQYWdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUNvbnRleHQsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBBdXRvSGlkZVNjcm9sbGJhciBmcm9tICcuL0F1dG9IaWRlU2Nyb2xsYmFyJztcbmltcG9ydCB7IGdldEhvbWVQYWdlVXJsIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3BhZ2VzXCI7XG5pbXBvcnQgeyBfdERvbSB9IGZyb20gXCIuLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgQmFzZUF2YXRhciBmcm9tIFwiLi4vdmlld3MvYXZhdGFycy9CYXNlQXZhdGFyXCI7XG5pbXBvcnQgeyBPd25Qcm9maWxlU3RvcmUgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL093blByb2ZpbGVTdG9yZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgeyB1c2VFdmVudEVtaXR0ZXIgfSBmcm9tIFwiLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IE1pbmlBdmF0YXJVcGxvYWRlciwgeyBBVkFUQVJfU0laRSB9IGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9NaW5pQXZhdGFyVXBsb2FkZXJcIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uLy4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuaW1wb3J0IEVtYmVkZGVkUGFnZSBmcm9tIFwiLi9FbWJlZGRlZFBhZ2VcIjtcblxuY29uc3Qgb25DbGlja1NlbmREbSA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYkhvbWVDcmVhdGVDaGF0QnV0dG9uXCIsIGV2KTtcbiAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICd2aWV3X2NyZWF0ZV9jaGF0JyB9KTtcbn07XG5cbmNvbnN0IG9uQ2xpY2tFeHBsb3JlID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViSG9tZUV4cGxvcmVSb29tc0J1dHRvblwiLCBldik7XG4gICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdSb29tRGlyZWN0b3J5KTtcbn07XG5cbmNvbnN0IG9uQ2xpY2tOZXdSb29tID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViSG9tZUNyZWF0ZVJvb21CdXR0b25cIiwgZXYpO1xuICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3ZpZXdfY3JlYXRlX3Jvb20nIH0pO1xufTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAganVzdFJlZ2lzdGVyZWQ/OiBib29sZWFuO1xufVxuXG5jb25zdCBnZXRPd25Qcm9maWxlID0gKHVzZXJJZDogc3RyaW5nKSA9PiAoe1xuICAgIGRpc3BsYXlOYW1lOiBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZGlzcGxheU5hbWUgfHwgdXNlcklkLFxuICAgIGF2YXRhclVybDogT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmdldEh0dHBBdmF0YXJVcmwoQVZBVEFSX1NJWkUpLFxufSk7XG5cbmNvbnN0IFVzZXJXZWxjb21lVG9wID0gKCkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgdXNlcklkID0gY2xpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IFtvd25Qcm9maWxlLCBzZXRPd25Qcm9maWxlXSA9IHVzZVN0YXRlKGdldE93blByb2ZpbGUodXNlcklkKSk7XG4gICAgdXNlRXZlbnRFbWl0dGVyKE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZSwgVVBEQVRFX0VWRU5ULCAoKSA9PiB7XG4gICAgICAgIHNldE93blByb2ZpbGUoZ2V0T3duUHJvZmlsZSh1c2VySWQpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiA8ZGl2PlxuICAgICAgICA8TWluaUF2YXRhclVwbG9hZGVyXG4gICAgICAgICAgICBoYXNBdmF0YXI9eyEhb3duUHJvZmlsZS5hdmF0YXJVcmx9XG4gICAgICAgICAgICBoYXNBdmF0YXJMYWJlbD17X3REb20oXCJHcmVhdCwgdGhhdCdsbCBoZWxwIHBlb3BsZSBrbm93IGl0J3MgeW91XCIpfVxuICAgICAgICAgICAgbm9BdmF0YXJMYWJlbD17X3REb20oXCJBZGQgYSBwaG90byBzbyBwZW9wbGUga25vdyBpdCdzIHlvdS5cIil9XG4gICAgICAgICAgICBzZXRBdmF0YXJVcmw9e3VybCA9PiBjbGkuc2V0QXZhdGFyVXJsKHVybCl9XG4gICAgICAgICAgICBpc1VzZXJBdmF0YXJcbiAgICAgICAgICAgIG9uQ2xpY2s9e2V2ID0+IFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViSG9tZU1pbmlBdmF0YXJVcGxvYWRCdXR0b25cIiwgZXYpfVxuICAgICAgICA+XG4gICAgICAgICAgICA8QmFzZUF2YXRhclxuICAgICAgICAgICAgICAgIGlkTmFtZT17dXNlcklkfVxuICAgICAgICAgICAgICAgIG5hbWU9e293blByb2ZpbGUuZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgdXJsPXtvd25Qcm9maWxlLmF2YXRhclVybH1cbiAgICAgICAgICAgICAgICB3aWR0aD17QVZBVEFSX1NJWkV9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXtBVkFUQVJfU0laRX1cbiAgICAgICAgICAgICAgICByZXNpemVNZXRob2Q9XCJjcm9wXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvTWluaUF2YXRhclVwbG9hZGVyPlxuXG4gICAgICAgIDxoMT57IF90RG9tKFwiV2VsY29tZSAlKG5hbWUpc1wiLCB7IG5hbWU6IG93blByb2ZpbGUuZGlzcGxheU5hbWUgfSkgfTwvaDE+XG4gICAgICAgIDxoMj57IF90RG9tKFwiTm93LCBsZXQncyBoZWxwIHlvdSBnZXQgc3RhcnRlZFwiKSB9PC9oMj5cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBIb21lUGFnZTogUmVhY3QuRkM8SVByb3BzPiA9ICh7IGp1c3RSZWdpc3RlcmVkID0gZmFsc2UgfSkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IFNka0NvbmZpZy5nZXQoKTtcbiAgICBjb25zdCBwYWdlVXJsID0gZ2V0SG9tZVBhZ2VVcmwoY29uZmlnKTtcblxuICAgIGlmIChwYWdlVXJsKSB7XG4gICAgICAgIHJldHVybiA8RW1iZWRkZWRQYWdlIGNsYXNzTmFtZT1cIm14X0hvbWVQYWdlXCIgdXJsPXtwYWdlVXJsfSBzY3JvbGxiYXI9e3RydWV9IC8+O1xuICAgIH1cblxuICAgIGxldCBpbnRyb1NlY3Rpb246IEpTWC5FbGVtZW50O1xuICAgIGlmIChqdXN0UmVnaXN0ZXJlZCB8fCAhT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmdldEh0dHBBdmF0YXJVcmwoQVZBVEFSX1NJWkUpKSB7XG4gICAgICAgIGludHJvU2VjdGlvbiA9IDxVc2VyV2VsY29tZVRvcCAvPjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBicmFuZGluZ0NvbmZpZyA9IFNka0NvbmZpZy5nZXRPYmplY3QoXCJicmFuZGluZ1wiKTtcbiAgICAgICAgY29uc3QgbG9nb1VybCA9IGJyYW5kaW5nQ29uZmlnPy5nZXQoXCJhdXRoX2hlYWRlcl9sb2dvX3VybFwiKSA/PyBcInRoZW1lcy9lbGVtZW50L2ltZy9sb2dvcy9lbGVtZW50LWxvZ28uc3ZnXCI7XG5cbiAgICAgICAgaW50cm9TZWN0aW9uID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgPGltZyBzcmM9e2xvZ29Vcmx9IGFsdD17Y29uZmlnLmJyYW5kfSAvPlxuICAgICAgICAgICAgPGgxPnsgX3REb20oXCJXZWxjb21lIHRvICUoYXBwTmFtZSlzXCIsIHsgYXBwTmFtZTogY29uZmlnLmJyYW5kIH0pIH08L2gxPlxuICAgICAgICAgICAgPGgyPnsgX3REb20oXCJPd24geW91ciBjb252ZXJzYXRpb25zLlwiKSB9PC9oMj5cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxBdXRvSGlkZVNjcm9sbGJhciBjbGFzc05hbWU9XCJteF9Ib21lUGFnZSBteF9Ib21lUGFnZV9kZWZhdWx0XCIgZWxlbWVudD1cIm1haW5cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ib21lUGFnZV9kZWZhdWx0X3dyYXBwZXJcIj5cbiAgICAgICAgICAgIHsgaW50cm9TZWN0aW9uIH1cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSG9tZVBhZ2VfZGVmYXVsdF9idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25DbGlja1NlbmREbX0gY2xhc3NOYW1lPVwibXhfSG9tZVBhZ2VfYnV0dG9uX3NlbmREbVwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90RG9tKFwiU2VuZCBhIERpcmVjdCBNZXNzYWdlXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25DbGlja0V4cGxvcmV9IGNsYXNzTmFtZT1cIm14X0hvbWVQYWdlX2J1dHRvbl9leHBsb3JlXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3REb20oXCJFeHBsb3JlIFB1YmxpYyBSb29tc1wiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e29uQ2xpY2tOZXdSb29tfSBjbGFzc05hbWU9XCJteF9Ib21lUGFnZV9idXR0b25fY3JlYXRlR3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdERvbShcIkNyZWF0ZSBhIEdyb3VwIENoYXRcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L0F1dG9IaWRlU2Nyb2xsYmFyPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEhvbWVQYWdlO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWpDQTtB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