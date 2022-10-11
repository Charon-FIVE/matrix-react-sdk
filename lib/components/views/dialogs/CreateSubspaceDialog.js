"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _partials = require("matrix-js-sdk/src/@types/partials");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _BetaCard = require("../beta/BetaCard");

var _SpaceCreateMenu = require("../spaces/SpaceCreateMenu");

var _AddExistingToSpaceDialog = require("./AddExistingToSpaceDialog");

var _JoinRuleDropdown = _interopRequireDefault(require("../elements/JoinRuleDropdown"));

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
const CreateSubspaceDialog = _ref => {
  let {
    space,
    onAddExistingSpaceClick,
    onFinished
  } = _ref;
  const [parentSpace, setParentSpace] = (0, _react.useState)(space);
  const [busy, setBusy] = (0, _react.useState)(false);
  const [name, setName] = (0, _react.useState)("");
  const spaceNameField = (0, _react.useRef)();
  const [alias, setAlias] = (0, _react.useState)("");
  const spaceAliasField = (0, _react.useRef)();
  const [avatar, setAvatar] = (0, _react.useState)(null);
  const [topic, setTopic] = (0, _react.useState)("");
  const spaceJoinRule = space.getJoinRule();
  let defaultJoinRule = _partials.JoinRule.Restricted;

  if (spaceJoinRule === _partials.JoinRule.Public) {
    defaultJoinRule = _partials.JoinRule.Public;
  }

  const [joinRule, setJoinRule] = (0, _react.useState)(defaultJoinRule);

  const onCreateSubspaceClick = async e => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); // require & validate the space name field

    if (!(await spaceNameField.current.validate({
      allowEmpty: false
    }))) {
      spaceNameField.current.focus();
      spaceNameField.current.validate({
        allowEmpty: false,
        focused: true
      });
      setBusy(false);
      return;
    } // validate the space name alias field but do not require it


    if (joinRule === _partials.JoinRule.Public && !(await spaceAliasField.current.validate({
      allowEmpty: true
    }))) {
      spaceAliasField.current.focus();
      spaceAliasField.current.validate({
        allowEmpty: true,
        focused: true
      });
      setBusy(false);
      return;
    }

    try {
      await (0, _SpaceCreateMenu.createSpace)(name, joinRule === _partials.JoinRule.Public, alias, topic, avatar, {}, {
        parentSpace,
        joinRule
      });
      onFinished(true);
    } catch (e) {
      _logger.logger.error(e);
    }
  };

  let joinRuleMicrocopy;

  if (joinRule === _partials.JoinRule.Restricted) {
    joinRuleMicrocopy = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Anyone in <SpaceName/> will be able to find and join.", {}, {
      SpaceName: () => /*#__PURE__*/_react.default.createElement("b", null, parentSpace.name)
    }));
  } else if (joinRule === _partials.JoinRule.Public) {
    joinRuleMicrocopy = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Anyone will be able to find and join this space, not just members of <SpaceName/>.", {}, {
      SpaceName: () => /*#__PURE__*/_react.default.createElement("b", null, parentSpace.name)
    }));
  } else if (joinRule === _partials.JoinRule.Invite) {
    joinRuleMicrocopy = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Only people invited will be able to find and join this space."));
  }

  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    title: /*#__PURE__*/_react.default.createElement(_AddExistingToSpaceDialog.SubspaceSelector, {
      title: (0, _languageHandler._t)("Create a space"),
      space: space,
      value: parentSpace,
      onChange: setParentSpace
    }),
    className: "mx_CreateSubspaceDialog",
    contentId: "mx_CreateSubspaceDialog",
    onFinished: onFinished,
    fixedWidth: false
  }, /*#__PURE__*/_react.default.createElement(_MatrixClientContext.default.Provider, {
    value: space.client
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_CreateSubspaceDialog_content"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_CreateSubspaceDialog_betaNotice"
  }, /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, null), (0, _languageHandler._t)("Add a space to a space you manage.")), /*#__PURE__*/_react.default.createElement(_SpaceCreateMenu.SpaceCreateForm, {
    busy: busy,
    onSubmit: onCreateSubspaceClick,
    setAvatar: setAvatar,
    name: name,
    setName: setName,
    nameFieldRef: spaceNameField,
    topic: topic,
    setTopic: setTopic,
    alias: alias,
    setAlias: setAlias,
    showAliasField: joinRule === _partials.JoinRule.Public,
    aliasFieldRef: spaceAliasField
  }, /*#__PURE__*/_react.default.createElement(_JoinRuleDropdown.default, {
    label: (0, _languageHandler._t)("Space visibility"),
    labelInvite: (0, _languageHandler._t)("Private space (invite only)"),
    labelPublic: (0, _languageHandler._t)("Public space"),
    labelRestricted: (0, _languageHandler._t)("Visible to space members"),
    width: 478,
    value: joinRule,
    onChange: setJoinRule
  }), joinRuleMicrocopy)), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_CreateSubspaceDialog_footer"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_CreateSubspaceDialog_footer_prompt"
  }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Want to add an existing space instead?")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    onClick: () => {
      onAddExistingSpaceClick();
      onFinished();
    }
  }, (0, _languageHandler._t)("Add existing space"))), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary_outline",
    disabled: busy,
    onClick: () => onFinished(false)
  }, (0, _languageHandler._t)("Cancel")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary",
    disabled: busy,
    onClick: onCreateSubspaceClick
  }, busy ? (0, _languageHandler._t)("Adding...") : (0, _languageHandler._t)("Add")))));
};

var _default = CreateSubspaceDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGVTdWJzcGFjZURpYWxvZyIsInNwYWNlIiwib25BZGRFeGlzdGluZ1NwYWNlQ2xpY2siLCJvbkZpbmlzaGVkIiwicGFyZW50U3BhY2UiLCJzZXRQYXJlbnRTcGFjZSIsInVzZVN0YXRlIiwiYnVzeSIsInNldEJ1c3kiLCJuYW1lIiwic2V0TmFtZSIsInNwYWNlTmFtZUZpZWxkIiwidXNlUmVmIiwiYWxpYXMiLCJzZXRBbGlhcyIsInNwYWNlQWxpYXNGaWVsZCIsImF2YXRhciIsInNldEF2YXRhciIsInRvcGljIiwic2V0VG9waWMiLCJzcGFjZUpvaW5SdWxlIiwiZ2V0Sm9pblJ1bGUiLCJkZWZhdWx0Sm9pblJ1bGUiLCJKb2luUnVsZSIsIlJlc3RyaWN0ZWQiLCJQdWJsaWMiLCJqb2luUnVsZSIsInNldEpvaW5SdWxlIiwib25DcmVhdGVTdWJzcGFjZUNsaWNrIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY3VycmVudCIsInZhbGlkYXRlIiwiYWxsb3dFbXB0eSIsImZvY3VzIiwiZm9jdXNlZCIsImNyZWF0ZVNwYWNlIiwibG9nZ2VyIiwiZXJyb3IiLCJqb2luUnVsZU1pY3JvY29weSIsIl90IiwiU3BhY2VOYW1lIiwiSW52aXRlIiwiY2xpZW50Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9DcmVhdGVTdWJzcGFjZURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IEpvaW5SdWxlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFsc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IEJldGFQaWxsIH0gZnJvbSBcIi4uL2JldGEvQmV0YUNhcmRcIjtcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBSb29tQWxpYXNGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvUm9vbUFsaWFzRmllbGRcIjtcbmltcG9ydCB7IGNyZWF0ZVNwYWNlLCBTcGFjZUNyZWF0ZUZvcm0gfSBmcm9tIFwiLi4vc3BhY2VzL1NwYWNlQ3JlYXRlTWVudVwiO1xuaW1wb3J0IHsgU3Vic3BhY2VTZWxlY3RvciB9IGZyb20gXCIuL0FkZEV4aXN0aW5nVG9TcGFjZURpYWxvZ1wiO1xuaW1wb3J0IEpvaW5SdWxlRHJvcGRvd24gZnJvbSBcIi4uL2VsZW1lbnRzL0pvaW5SdWxlRHJvcGRvd25cIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgc3BhY2U6IFJvb207XG4gICAgb25BZGRFeGlzdGluZ1NwYWNlQ2xpY2soKTogdm9pZDtcbiAgICBvbkZpbmlzaGVkKGFkZGVkPzogYm9vbGVhbik6IHZvaWQ7XG59XG5cbmNvbnN0IENyZWF0ZVN1YnNwYWNlRGlhbG9nOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgc3BhY2UsIG9uQWRkRXhpc3RpbmdTcGFjZUNsaWNrLCBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICBjb25zdCBbcGFyZW50U3BhY2UsIHNldFBhcmVudFNwYWNlXSA9IHVzZVN0YXRlKHNwYWNlKTtcblxuICAgIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlPGJvb2xlYW4+KGZhbHNlKTtcbiAgICBjb25zdCBbbmFtZSwgc2V0TmFtZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgICBjb25zdCBzcGFjZU5hbWVGaWVsZCA9IHVzZVJlZjxGaWVsZD4oKTtcbiAgICBjb25zdCBbYWxpYXMsIHNldEFsaWFzXSA9IHVzZVN0YXRlKFwiXCIpO1xuICAgIGNvbnN0IHNwYWNlQWxpYXNGaWVsZCA9IHVzZVJlZjxSb29tQWxpYXNGaWVsZD4oKTtcbiAgICBjb25zdCBbYXZhdGFyLCBzZXRBdmF0YXJdID0gdXNlU3RhdGU8RmlsZT4obnVsbCk7XG4gICAgY29uc3QgW3RvcGljLCBzZXRUb3BpY10gPSB1c2VTdGF0ZTxzdHJpbmc+KFwiXCIpO1xuXG4gICAgY29uc3Qgc3BhY2VKb2luUnVsZSA9IHNwYWNlLmdldEpvaW5SdWxlKCk7XG4gICAgbGV0IGRlZmF1bHRKb2luUnVsZSA9IEpvaW5SdWxlLlJlc3RyaWN0ZWQ7XG4gICAgaWYgKHNwYWNlSm9pblJ1bGUgPT09IEpvaW5SdWxlLlB1YmxpYykge1xuICAgICAgICBkZWZhdWx0Sm9pblJ1bGUgPSBKb2luUnVsZS5QdWJsaWM7XG4gICAgfVxuICAgIGNvbnN0IFtqb2luUnVsZSwgc2V0Sm9pblJ1bGVdID0gdXNlU3RhdGU8Sm9pblJ1bGU+KGRlZmF1bHRKb2luUnVsZSk7XG5cbiAgICBjb25zdCBvbkNyZWF0ZVN1YnNwYWNlQ2xpY2sgPSBhc3luYyAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChidXN5KSByZXR1cm47XG5cbiAgICAgICAgc2V0QnVzeSh0cnVlKTtcbiAgICAgICAgLy8gcmVxdWlyZSAmIHZhbGlkYXRlIHRoZSBzcGFjZSBuYW1lIGZpZWxkXG4gICAgICAgIGlmICghKGF3YWl0IHNwYWNlTmFtZUZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KSkpIHtcbiAgICAgICAgICAgIHNwYWNlTmFtZUZpZWxkLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIHNwYWNlTmFtZUZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHNldEJ1c3koZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZhbGlkYXRlIHRoZSBzcGFjZSBuYW1lIGFsaWFzIGZpZWxkIGJ1dCBkbyBub3QgcmVxdWlyZSBpdFxuICAgICAgICBpZiAoam9pblJ1bGUgPT09IEpvaW5SdWxlLlB1YmxpYyAmJiAhKGF3YWl0IHNwYWNlQWxpYXNGaWVsZC5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogdHJ1ZSB9KSkpIHtcbiAgICAgICAgICAgIHNwYWNlQWxpYXNGaWVsZC5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgICAgICBzcGFjZUFsaWFzRmllbGQuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IHRydWUsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICBzZXRCdXN5KGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBjcmVhdGVTcGFjZShuYW1lLCBqb2luUnVsZSA9PT0gSm9pblJ1bGUuUHVibGljLCBhbGlhcywgdG9waWMsIGF2YXRhciwge30sIHsgcGFyZW50U3BhY2UsIGpvaW5SdWxlIH0pO1xuXG4gICAgICAgICAgICBvbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IGpvaW5SdWxlTWljcm9jb3B5OiBKU1guRWxlbWVudDtcbiAgICBpZiAoam9pblJ1bGUgPT09IEpvaW5SdWxlLlJlc3RyaWN0ZWQpIHtcbiAgICAgICAgam9pblJ1bGVNaWNyb2NvcHkgPSA8cD5cbiAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgXCJBbnlvbmUgaW4gPFNwYWNlTmFtZS8+IHdpbGwgYmUgYWJsZSB0byBmaW5kIGFuZCBqb2luLlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICBTcGFjZU5hbWU6ICgpID0+IDxiPnsgcGFyZW50U3BhY2UubmFtZSB9PC9iPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKSB9XG4gICAgICAgIDwvcD47XG4gICAgfSBlbHNlIGlmIChqb2luUnVsZSA9PT0gSm9pblJ1bGUuUHVibGljKSB7XG4gICAgICAgIGpvaW5SdWxlTWljcm9jb3B5ID0gPHA+XG4gICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgIFwiQW55b25lIHdpbGwgYmUgYWJsZSB0byBmaW5kIGFuZCBqb2luIHRoaXMgc3BhY2UsIG5vdCBqdXN0IG1lbWJlcnMgb2YgPFNwYWNlTmFtZS8+LlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICBTcGFjZU5hbWU6ICgpID0+IDxiPnsgcGFyZW50U3BhY2UubmFtZSB9PC9iPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKSB9XG4gICAgICAgIDwvcD47XG4gICAgfSBlbHNlIGlmIChqb2luUnVsZSA9PT0gSm9pblJ1bGUuSW52aXRlKSB7XG4gICAgICAgIGpvaW5SdWxlTWljcm9jb3B5ID0gPHA+XG4gICAgICAgICAgICB7IF90KFwiT25seSBwZW9wbGUgaW52aXRlZCB3aWxsIGJlIGFibGUgdG8gZmluZCBhbmQgam9pbiB0aGlzIHNwYWNlLlwiKSB9XG4gICAgICAgIDwvcD47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxCYXNlRGlhbG9nXG4gICAgICAgIHRpdGxlPXsoXG4gICAgICAgICAgICA8U3Vic3BhY2VTZWxlY3RvclxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkNyZWF0ZSBhIHNwYWNlXCIpfVxuICAgICAgICAgICAgICAgIHNwYWNlPXtzcGFjZX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17cGFyZW50U3BhY2V9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldFBhcmVudFNwYWNlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU3Vic3BhY2VEaWFsb2dcIlxuICAgICAgICBjb250ZW50SWQ9XCJteF9DcmVhdGVTdWJzcGFjZURpYWxvZ1wiXG4gICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9XG4gICAgICAgIGZpeGVkV2lkdGg9e2ZhbHNlfVxuICAgID5cbiAgICAgICAgPE1hdHJpeENsaWVudENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3NwYWNlLmNsaWVudH0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVN1YnNwYWNlRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVN1YnNwYWNlRGlhbG9nX2JldGFOb3RpY2VcIj5cbiAgICAgICAgICAgICAgICAgICAgPEJldGFQaWxsIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBZGQgYSBzcGFjZSB0byBhIHNwYWNlIHlvdSBtYW5hZ2UuXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxTcGFjZUNyZWF0ZUZvcm1cbiAgICAgICAgICAgICAgICAgICAgYnVzeT17YnVzeX1cbiAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ9e29uQ3JlYXRlU3Vic3BhY2VDbGlja31cbiAgICAgICAgICAgICAgICAgICAgc2V0QXZhdGFyPXtzZXRBdmF0YXJ9XG4gICAgICAgICAgICAgICAgICAgIG5hbWU9e25hbWV9XG4gICAgICAgICAgICAgICAgICAgIHNldE5hbWU9e3NldE5hbWV9XG4gICAgICAgICAgICAgICAgICAgIG5hbWVGaWVsZFJlZj17c3BhY2VOYW1lRmllbGR9XG4gICAgICAgICAgICAgICAgICAgIHRvcGljPXt0b3BpY31cbiAgICAgICAgICAgICAgICAgICAgc2V0VG9waWM9e3NldFRvcGljfVxuICAgICAgICAgICAgICAgICAgICBhbGlhcz17YWxpYXN9XG4gICAgICAgICAgICAgICAgICAgIHNldEFsaWFzPXtzZXRBbGlhc31cbiAgICAgICAgICAgICAgICAgICAgc2hvd0FsaWFzRmllbGQ9e2pvaW5SdWxlID09PSBKb2luUnVsZS5QdWJsaWN9XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzRmllbGRSZWY9e3NwYWNlQWxpYXNGaWVsZH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxKb2luUnVsZURyb3Bkb3duXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTcGFjZSB2aXNpYmlsaXR5XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxJbnZpdGU9e190KFwiUHJpdmF0ZSBzcGFjZSAoaW52aXRlIG9ubHkpXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxQdWJsaWM9e190KFwiUHVibGljIHNwYWNlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxSZXN0cmljdGVkPXtfdChcIlZpc2libGUgdG8gc3BhY2UgbWVtYmVyc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXs0Nzh9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17am9pblJ1bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0Sm9pblJ1bGV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgam9pblJ1bGVNaWNyb2NvcHkgfVxuICAgICAgICAgICAgICAgIDwvU3BhY2VDcmVhdGVGb3JtPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU3Vic3BhY2VEaWFsb2dfZm9vdGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTdWJzcGFjZURpYWxvZ19mb290ZXJfcHJvbXB0XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+eyBfdChcIldhbnQgdG8gYWRkIGFuIGV4aXN0aW5nIHNwYWNlIGluc3RlYWQ/XCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkFkZEV4aXN0aW5nU3BhY2VDbGljaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBZGQgZXhpc3Rpbmcgc3BhY2VcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeV9vdXRsaW5lXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRmluaXNoZWQoZmFsc2UpfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNhbmNlbFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9e29uQ3JlYXRlU3Vic3BhY2VDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgYnVzeSA/IF90KFwiQWRkaW5nLi4uXCIpIDogX3QoXCJBZGRcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L01hdHJpeENsaWVudENvbnRleHQuUHJvdmlkZXI+XG4gICAgPC9CYXNlRGlhbG9nPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IENyZWF0ZVN1YnNwYWNlRGlhbG9nO1xuXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7Ozs7O0FBOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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