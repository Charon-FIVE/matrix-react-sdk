"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RoomAccountDataExplorer = exports.RoomAccountDataEventEditor = exports.AccountDataExplorer = exports.AccountDataEventEditor = void 0;

var _react = _interopRequireWildcard(require("react"));

var _BaseTool = _interopRequireWildcard(require("./BaseTool"));

var _MatrixClientContext = _interopRequireDefault(require("../../../../contexts/MatrixClientContext"));

var _Event = require("./Event");

var _FilteredList = _interopRequireDefault(require("./FilteredList"));

var _languageHandler = require("../../../../languageHandler");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 Michael Telatynski <7t3chguy@gmail.com>

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
const AccountDataEventEditor = _ref => {
  let {
    mxEvent,
    onBack
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const fields = (0, _react.useMemo)(() => [(0, _Event.eventTypeField)(mxEvent?.getType())], [mxEvent]);

  const onSend = (_ref2, content) => {
    let [eventType] = _ref2;
    return cli.setAccountData(eventType, content);
  };

  const defaultContent = mxEvent ? (0, _Event.stringify)(mxEvent.getContent()) : undefined;
  return /*#__PURE__*/_react.default.createElement(_Event.EventEditor, {
    fieldDefs: fields,
    defaultContent: defaultContent,
    onSend: onSend,
    onBack: onBack
  });
};

exports.AccountDataEventEditor = AccountDataEventEditor;

const RoomAccountDataEventEditor = _ref3 => {
  let {
    mxEvent,
    onBack
  } = _ref3;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const fields = (0, _react.useMemo)(() => [(0, _Event.eventTypeField)(mxEvent?.getType())], [mxEvent]);

  const onSend = (_ref4, content) => {
    let [eventType] = _ref4;
    return cli.setRoomAccountData(context.room.roomId, eventType, content);
  };

  const defaultContent = mxEvent ? (0, _Event.stringify)(mxEvent.getContent()) : undefined;
  return /*#__PURE__*/_react.default.createElement(_Event.EventEditor, {
    fieldDefs: fields,
    defaultContent: defaultContent,
    onSend: onSend,
    onBack: onBack
  });
};

exports.RoomAccountDataEventEditor = RoomAccountDataEventEditor;

const BaseAccountDataExplorer = _ref5 => {
  let {
    events,
    Editor,
    actionLabel,
    onBack,
    setTool
  } = _ref5;
  const [query, setQuery] = (0, _react.useState)("");
  const [event, setEvent] = (0, _react.useState)(null);

  if (event) {
    const onBack = () => {
      setEvent(null);
    };

    return /*#__PURE__*/_react.default.createElement(_Event.EventViewer, {
      mxEvent: event,
      onBack: onBack,
      Editor: Editor
    });
  }

  const onAction = async () => {
    setTool(actionLabel, Editor);
  };

  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack,
    actionLabel: actionLabel,
    onAction: onAction
  }, /*#__PURE__*/_react.default.createElement(_FilteredList.default, {
    query: query,
    onChange: setQuery
  }, Object.entries(events).map(_ref6 => {
    let [eventType, ev] = _ref6;

    const onClick = () => {
      setEvent(ev);
    };

    return /*#__PURE__*/_react.default.createElement("button", {
      className: "mx_DevTools_button",
      key: eventType,
      onClick: onClick
    }, eventType);
  })));
};

const AccountDataExplorer = _ref7 => {
  let {
    onBack,
    setTool
  } = _ref7;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  return /*#__PURE__*/_react.default.createElement(BaseAccountDataExplorer, {
    events: cli.store.accountData,
    Editor: AccountDataEventEditor,
    actionLabel: (0, _languageHandler._t)("Send custom account data event"),
    onBack: onBack,
    setTool: setTool
  });
};

exports.AccountDataExplorer = AccountDataExplorer;

const RoomAccountDataExplorer = _ref8 => {
  let {
    onBack,
    setTool
  } = _ref8;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  return /*#__PURE__*/_react.default.createElement(BaseAccountDataExplorer, {
    events: context.room.accountData,
    Editor: RoomAccountDataEventEditor,
    actionLabel: (0, _languageHandler._t)("Send custom room account data event"),
    onBack: onBack,
    setTool: setTool
  });
};

exports.RoomAccountDataExplorer = RoomAccountDataExplorer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBY2NvdW50RGF0YUV2ZW50RWRpdG9yIiwibXhFdmVudCIsIm9uQmFjayIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiZmllbGRzIiwidXNlTWVtbyIsImV2ZW50VHlwZUZpZWxkIiwiZ2V0VHlwZSIsIm9uU2VuZCIsImNvbnRlbnQiLCJldmVudFR5cGUiLCJzZXRBY2NvdW50RGF0YSIsImRlZmF1bHRDb250ZW50Iiwic3RyaW5naWZ5IiwiZ2V0Q29udGVudCIsInVuZGVmaW5lZCIsIlJvb21BY2NvdW50RGF0YUV2ZW50RWRpdG9yIiwiY29udGV4dCIsIkRldnRvb2xzQ29udGV4dCIsInNldFJvb21BY2NvdW50RGF0YSIsInJvb20iLCJyb29tSWQiLCJCYXNlQWNjb3VudERhdGFFeHBsb3JlciIsImV2ZW50cyIsIkVkaXRvciIsImFjdGlvbkxhYmVsIiwic2V0VG9vbCIsInF1ZXJ5Iiwic2V0UXVlcnkiLCJ1c2VTdGF0ZSIsImV2ZW50Iiwic2V0RXZlbnQiLCJvbkFjdGlvbiIsIk9iamVjdCIsImVudHJpZXMiLCJtYXAiLCJldiIsIm9uQ2xpY2siLCJBY2NvdW50RGF0YUV4cGxvcmVyIiwic3RvcmUiLCJhY2NvdW50RGF0YSIsIl90IiwiUm9vbUFjY291bnREYXRhRXhwbG9yZXIiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL2RldnRvb2xzL0FjY291bnREYXRhLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUNvbnRleHQsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJQ29udGVudCwgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCBCYXNlVG9vbCwgeyBEZXZ0b29sc0NvbnRleHQsIElEZXZ0b29sc1Byb3BzIH0gZnJvbSBcIi4vQmFzZVRvb2xcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgeyBFdmVudEVkaXRvciwgRXZlbnRWaWV3ZXIsIGV2ZW50VHlwZUZpZWxkLCBJRWRpdG9yUHJvcHMsIHN0cmluZ2lmeSB9IGZyb20gXCIuL0V2ZW50XCI7XG5pbXBvcnQgRmlsdGVyZWRMaXN0IGZyb20gXCIuL0ZpbHRlcmVkTGlzdFwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5cbmV4cG9ydCBjb25zdCBBY2NvdW50RGF0YUV2ZW50RWRpdG9yID0gKHsgbXhFdmVudCwgb25CYWNrIH06IElFZGl0b3JQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBmaWVsZHMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAgZXZlbnRUeXBlRmllbGQobXhFdmVudD8uZ2V0VHlwZSgpKSxcbiAgICBdLCBbbXhFdmVudF0pO1xuXG4gICAgY29uc3Qgb25TZW5kID0gKFtldmVudFR5cGVdOiBzdHJpbmdbXSwgY29udGVudD86IElDb250ZW50KSA9PiB7XG4gICAgICAgIHJldHVybiBjbGkuc2V0QWNjb3VudERhdGEoZXZlbnRUeXBlLCBjb250ZW50KTtcbiAgICB9O1xuXG4gICAgY29uc3QgZGVmYXVsdENvbnRlbnQgPSBteEV2ZW50ID8gc3RyaW5naWZ5KG14RXZlbnQuZ2V0Q29udGVudCgpKSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gPEV2ZW50RWRpdG9yIGZpZWxkRGVmcz17ZmllbGRzfSBkZWZhdWx0Q29udGVudD17ZGVmYXVsdENvbnRlbnR9IG9uU2VuZD17b25TZW5kfSBvbkJhY2s9e29uQmFja30gLz47XG59O1xuXG5leHBvcnQgY29uc3QgUm9vbUFjY291bnREYXRhRXZlbnRFZGl0b3IgPSAoeyBteEV2ZW50LCBvbkJhY2sgfTogSUVkaXRvclByb3BzKSA9PiB7XG4gICAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoRGV2dG9vbHNDb250ZXh0KTtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgY29uc3QgZmllbGRzID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIGV2ZW50VHlwZUZpZWxkKG14RXZlbnQ/LmdldFR5cGUoKSksXG4gICAgXSwgW214RXZlbnRdKTtcblxuICAgIGNvbnN0IG9uU2VuZCA9IChbZXZlbnRUeXBlXTogc3RyaW5nW10sIGNvbnRlbnQ/OiBJQ29udGVudCkgPT4ge1xuICAgICAgICByZXR1cm4gY2xpLnNldFJvb21BY2NvdW50RGF0YShjb250ZXh0LnJvb20ucm9vbUlkLCBldmVudFR5cGUsIGNvbnRlbnQpO1xuICAgIH07XG5cbiAgICBjb25zdCBkZWZhdWx0Q29udGVudCA9IG14RXZlbnQgPyBzdHJpbmdpZnkobXhFdmVudC5nZXRDb250ZW50KCkpIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiA8RXZlbnRFZGl0b3IgZmllbGREZWZzPXtmaWVsZHN9IGRlZmF1bHRDb250ZW50PXtkZWZhdWx0Q29udGVudH0gb25TZW5kPXtvblNlbmR9IG9uQmFjaz17b25CYWNrfSAvPjtcbn07XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGV2dG9vbHNQcm9wcyB7XG4gICAgZXZlbnRzOiBSZWNvcmQ8c3RyaW5nLCBNYXRyaXhFdmVudD47XG4gICAgRWRpdG9yOiBSZWFjdC5GQzxJRWRpdG9yUHJvcHM+O1xuICAgIGFjdGlvbkxhYmVsOiBzdHJpbmc7XG59XG5cbmNvbnN0IEJhc2VBY2NvdW50RGF0YUV4cGxvcmVyID0gKHsgZXZlbnRzLCBFZGl0b3IsIGFjdGlvbkxhYmVsLCBvbkJhY2ssIHNldFRvb2wgfTogSVByb3BzKSA9PiB7XG4gICAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgICBjb25zdCBbZXZlbnQsIHNldEV2ZW50XSA9IHVzZVN0YXRlPE1hdHJpeEV2ZW50PihudWxsKTtcblxuICAgIGlmIChldmVudCkge1xuICAgICAgICBjb25zdCBvbkJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBzZXRFdmVudChudWxsKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIDxFdmVudFZpZXdlciBteEV2ZW50PXtldmVudH0gb25CYWNrPXtvbkJhY2t9IEVkaXRvcj17RWRpdG9yfSAvPjtcbiAgICB9XG5cbiAgICBjb25zdCBvbkFjdGlvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0VG9vbChhY3Rpb25MYWJlbCwgRWRpdG9yKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIDxCYXNlVG9vbCBvbkJhY2s9e29uQmFja30gYWN0aW9uTGFiZWw9e2FjdGlvbkxhYmVsfSBvbkFjdGlvbj17b25BY3Rpb259PlxuICAgICAgICA8RmlsdGVyZWRMaXN0IHF1ZXJ5PXtxdWVyeX0gb25DaGFuZ2U9e3NldFF1ZXJ5fT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhldmVudHMpLm1hcCgoW2V2ZW50VHlwZSwgZXZdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRFdmVudChldik7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxidXR0b24gY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfYnV0dG9uXCIga2V5PXtldmVudFR5cGV9IG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBldmVudFR5cGUgfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj47XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9GaWx0ZXJlZExpc3Q+XG4gICAgPC9CYXNlVG9vbD47XG59O1xuXG5leHBvcnQgY29uc3QgQWNjb3VudERhdGFFeHBsb3JlciA9ICh7IG9uQmFjaywgc2V0VG9vbCB9OiBJRGV2dG9vbHNQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICByZXR1cm4gPEJhc2VBY2NvdW50RGF0YUV4cGxvcmVyXG4gICAgICAgIGV2ZW50cz17Y2xpLnN0b3JlLmFjY291bnREYXRhfVxuICAgICAgICBFZGl0b3I9e0FjY291bnREYXRhRXZlbnRFZGl0b3J9XG4gICAgICAgIGFjdGlvbkxhYmVsPXtfdChcIlNlbmQgY3VzdG9tIGFjY291bnQgZGF0YSBldmVudFwiKX1cbiAgICAgICAgb25CYWNrPXtvbkJhY2t9XG4gICAgICAgIHNldFRvb2w9e3NldFRvb2x9XG4gICAgLz47XG59O1xuXG5leHBvcnQgY29uc3QgUm9vbUFjY291bnREYXRhRXhwbG9yZXIgPSAoeyBvbkJhY2ssIHNldFRvb2wgfTogSURldnRvb2xzUHJvcHMpID0+IHtcbiAgICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChEZXZ0b29sc0NvbnRleHQpO1xuXG4gICAgcmV0dXJuIDxCYXNlQWNjb3VudERhdGFFeHBsb3JlclxuICAgICAgICBldmVudHM9e2NvbnRleHQucm9vbS5hY2NvdW50RGF0YX1cbiAgICAgICAgRWRpdG9yPXtSb29tQWNjb3VudERhdGFFdmVudEVkaXRvcn1cbiAgICAgICAgYWN0aW9uTGFiZWw9e190KFwiU2VuZCBjdXN0b20gcm9vbSBhY2NvdW50IGRhdGEgZXZlbnRcIil9XG4gICAgICAgIG9uQmFjaz17b25CYWNrfVxuICAgICAgICBzZXRUb29sPXtzZXRUb29sfVxuICAgIC8+O1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBV08sTUFBTUEsc0JBQXNCLEdBQUcsUUFBdUM7RUFBQSxJQUF0QztJQUFFQyxPQUFGO0lBQVdDO0VBQVgsQ0FBc0M7RUFDekUsTUFBTUMsR0FBRyxHQUFHLElBQUFDLGlCQUFBLEVBQVdDLDRCQUFYLENBQVo7RUFFQSxNQUFNQyxNQUFNLEdBQUcsSUFBQUMsY0FBQSxFQUFRLE1BQU0sQ0FDekIsSUFBQUMscUJBQUEsRUFBZVAsT0FBTyxFQUFFUSxPQUFULEVBQWYsQ0FEeUIsQ0FBZCxFQUVaLENBQUNSLE9BQUQsQ0FGWSxDQUFmOztFQUlBLE1BQU1T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