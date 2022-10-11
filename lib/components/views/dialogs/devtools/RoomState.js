"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StateEventEditor = exports.RoomStateExplorer = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../../languageHandler");

var _BaseTool = _interopRequireWildcard(require("./BaseTool"));

var _MatrixClientContext = _interopRequireDefault(require("../../../../contexts/MatrixClientContext"));

var _Event = require("./Event");

var _FilteredList = _interopRequireDefault(require("./FilteredList"));

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
const StateEventEditor = _ref => {
  let {
    mxEvent,
    onBack
  } = _ref;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const fields = (0, _react.useMemo)(() => [(0, _Event.eventTypeField)(mxEvent?.getType()), (0, _Event.stateKeyField)(mxEvent?.getStateKey())], [mxEvent]);

  const onSend = (_ref2, content) => {
    let [eventType, stateKey] = _ref2;
    return cli.sendStateEvent(context.room.roomId, eventType, content, stateKey);
  };

  const defaultContent = mxEvent ? (0, _Event.stringify)(mxEvent.getContent()) : undefined;
  return /*#__PURE__*/_react.default.createElement(_Event.EventEditor, {
    fieldDefs: fields,
    defaultContent: defaultContent,
    onSend: onSend,
    onBack: onBack
  });
};

exports.StateEventEditor = StateEventEditor;

const StateEventButton = _ref3 => {
  let {
    label,
    onClick
  } = _ref3;
  const trimmed = label.trim();
  return /*#__PURE__*/_react.default.createElement("button", {
    className: (0, _classnames.default)("mx_DevTools_button", {
      mx_DevTools_RoomStateExplorer_button_hasSpaces: trimmed.length !== label.length,
      mx_DevTools_RoomStateExplorer_button_emptyString: !trimmed
    }),
    onClick: onClick
  }, trimmed ? label : (0, _languageHandler._t)("<%(count)s spaces>", {
    count: label.length
  }));
};

const RoomStateExplorerEventType = _ref4 => {
  let {
    eventType,
    onBack
  } = _ref4;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const [query, setQuery] = (0, _react.useState)("");
  const [event, setEvent] = (0, _react.useState)(null);
  const events = context.room.currentState.events.get(eventType);
  (0, _react.useEffect)(() => {
    if (events.size === 1 && events.has("")) {
      setEvent(events.get(""));
    } else {
      setEvent(null);
    }
  }, [events]);

  if (event) {
    const _onBack = () => {
      if (events?.size === 1 && events.has("")) {
        onBack();
      } else {
        setEvent(null);
      }
    };

    return /*#__PURE__*/_react.default.createElement(_Event.EventViewer, {
      mxEvent: event,
      onBack: _onBack,
      Editor: StateEventEditor
    });
  }

  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack
  }, /*#__PURE__*/_react.default.createElement(_FilteredList.default, {
    query: query,
    onChange: setQuery
  }, Array.from(events.entries()).map(_ref5 => {
    let [stateKey, ev] = _ref5;
    return /*#__PURE__*/_react.default.createElement(StateEventButton, {
      key: stateKey,
      label: stateKey,
      onClick: () => setEvent(ev)
    });
  })));
};

const RoomStateExplorer = _ref6 => {
  let {
    onBack,
    setTool
  } = _ref6;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const [query, setQuery] = (0, _react.useState)("");
  const [eventType, setEventType] = (0, _react.useState)(null);
  const events = context.room.currentState.events;

  if (eventType !== null) {
    const onBack = () => {
      setEventType(null);
    };

    return /*#__PURE__*/_react.default.createElement(RoomStateExplorerEventType, {
      eventType: eventType,
      onBack: onBack
    });
  }

  const onAction = async () => {
    setTool((0, _languageHandler._t)("Send custom state event"), StateEventEditor);
  };

  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack,
    actionLabel: (0, _languageHandler._t)("Send custom state event"),
    onAction: onAction
  }, /*#__PURE__*/_react.default.createElement(_FilteredList.default, {
    query: query,
    onChange: setQuery
  }, Array.from(events.keys()).map(eventType => /*#__PURE__*/_react.default.createElement(StateEventButton, {
    key: eventType,
    label: eventType,
    onClick: () => setEventType(eventType)
  }))));
};

exports.RoomStateExplorer = RoomStateExplorer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGF0ZUV2ZW50RWRpdG9yIiwibXhFdmVudCIsIm9uQmFjayIsImNvbnRleHQiLCJ1c2VDb250ZXh0IiwiRGV2dG9vbHNDb250ZXh0IiwiY2xpIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsImZpZWxkcyIsInVzZU1lbW8iLCJldmVudFR5cGVGaWVsZCIsImdldFR5cGUiLCJzdGF0ZUtleUZpZWxkIiwiZ2V0U3RhdGVLZXkiLCJvblNlbmQiLCJjb250ZW50IiwiZXZlbnRUeXBlIiwic3RhdGVLZXkiLCJzZW5kU3RhdGVFdmVudCIsInJvb20iLCJyb29tSWQiLCJkZWZhdWx0Q29udGVudCIsInN0cmluZ2lmeSIsImdldENvbnRlbnQiLCJ1bmRlZmluZWQiLCJTdGF0ZUV2ZW50QnV0dG9uIiwibGFiZWwiLCJvbkNsaWNrIiwidHJpbW1lZCIsInRyaW0iLCJjbGFzc05hbWVzIiwibXhfRGV2VG9vbHNfUm9vbVN0YXRlRXhwbG9yZXJfYnV0dG9uX2hhc1NwYWNlcyIsImxlbmd0aCIsIm14X0RldlRvb2xzX1Jvb21TdGF0ZUV4cGxvcmVyX2J1dHRvbl9lbXB0eVN0cmluZyIsIl90IiwiY291bnQiLCJSb29tU3RhdGVFeHBsb3JlckV2ZW50VHlwZSIsInF1ZXJ5Iiwic2V0UXVlcnkiLCJ1c2VTdGF0ZSIsImV2ZW50Iiwic2V0RXZlbnQiLCJldmVudHMiLCJjdXJyZW50U3RhdGUiLCJnZXQiLCJ1c2VFZmZlY3QiLCJzaXplIiwiaGFzIiwiX29uQmFjayIsIkFycmF5IiwiZnJvbSIsImVudHJpZXMiLCJtYXAiLCJldiIsIlJvb21TdGF0ZUV4cGxvcmVyIiwic2V0VG9vbCIsInNldEV2ZW50VHlwZSIsIm9uQWN0aW9uIiwia2V5cyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvZGV2dG9vbHMvUm9vbVN0YXRlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUNvbnRleHQsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IElDb250ZW50LCBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEJhc2VUb29sLCB7IERldnRvb2xzQ29udGV4dCwgSURldnRvb2xzUHJvcHMgfSBmcm9tIFwiLi9CYXNlVG9vbFwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IEV2ZW50RWRpdG9yLCBFdmVudFZpZXdlciwgZXZlbnRUeXBlRmllbGQsIHN0YXRlS2V5RmllbGQsIElFZGl0b3JQcm9wcywgc3RyaW5naWZ5IH0gZnJvbSBcIi4vRXZlbnRcIjtcbmltcG9ydCBGaWx0ZXJlZExpc3QgZnJvbSBcIi4vRmlsdGVyZWRMaXN0XCI7XG5cbmV4cG9ydCBjb25zdCBTdGF0ZUV2ZW50RWRpdG9yID0gKHsgbXhFdmVudCwgb25CYWNrIH06IElFZGl0b3JQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KERldnRvb2xzQ29udGV4dCk7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IGZpZWxkcyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICBldmVudFR5cGVGaWVsZChteEV2ZW50Py5nZXRUeXBlKCkpLFxuICAgICAgICBzdGF0ZUtleUZpZWxkKG14RXZlbnQ/LmdldFN0YXRlS2V5KCkpLFxuICAgIF0sIFtteEV2ZW50XSk7XG5cbiAgICBjb25zdCBvblNlbmQgPSAoW2V2ZW50VHlwZSwgc3RhdGVLZXldOiBzdHJpbmdbXSwgY29udGVudD86IElDb250ZW50KSA9PiB7XG4gICAgICAgIHJldHVybiBjbGkuc2VuZFN0YXRlRXZlbnQoY29udGV4dC5yb29tLnJvb21JZCwgZXZlbnRUeXBlLCBjb250ZW50LCBzdGF0ZUtleSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGRlZmF1bHRDb250ZW50ID0gbXhFdmVudCA/IHN0cmluZ2lmeShteEV2ZW50LmdldENvbnRlbnQoKSkgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIDxFdmVudEVkaXRvciBmaWVsZERlZnM9e2ZpZWxkc30gZGVmYXVsdENvbnRlbnQ9e2RlZmF1bHRDb250ZW50fSBvblNlbmQ9e29uU2VuZH0gb25CYWNrPXtvbkJhY2t9IC8+O1xufTtcblxuaW50ZXJmYWNlIFN0YXRlRXZlbnRCdXR0b25Qcm9wcyB7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBvbkNsaWNrKCk6IHZvaWQ7XG59XG5cbmNvbnN0IFN0YXRlRXZlbnRCdXR0b24gPSAoeyBsYWJlbCwgb25DbGljayB9OiBTdGF0ZUV2ZW50QnV0dG9uUHJvcHMpID0+IHtcbiAgICBjb25zdCB0cmltbWVkID0gbGFiZWwudHJpbSgpO1xuXG4gICAgcmV0dXJuIDxidXR0b25cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfRGV2VG9vbHNfYnV0dG9uXCIsIHtcbiAgICAgICAgICAgIG14X0RldlRvb2xzX1Jvb21TdGF0ZUV4cGxvcmVyX2J1dHRvbl9oYXNTcGFjZXM6IHRyaW1tZWQubGVuZ3RoICE9PSBsYWJlbC5sZW5ndGgsXG4gICAgICAgICAgICBteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9idXR0b25fZW1wdHlTdHJpbmc6ICF0cmltbWVkLFxuICAgICAgICB9KX1cbiAgICAgICAgb25DbGljaz17b25DbGlja31cbiAgICA+XG4gICAgICAgIHsgdHJpbW1lZCA/IGxhYmVsIDogX3QoXCI8JShjb3VudClzIHNwYWNlcz5cIiwgeyBjb3VudDogbGFiZWwubGVuZ3RoIH0pIH1cbiAgICA8L2J1dHRvbj47XG59O1xuXG5pbnRlcmZhY2UgSUV2ZW50VHlwZVByb3BzIGV4dGVuZHMgUGljazxJRGV2dG9vbHNQcm9wcywgXCJvbkJhY2tcIj4ge1xuICAgIGV2ZW50VHlwZTogc3RyaW5nO1xufVxuXG5jb25zdCBSb29tU3RhdGVFeHBsb3JlckV2ZW50VHlwZSA9ICh7IGV2ZW50VHlwZSwgb25CYWNrIH06IElFdmVudFR5cGVQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KERldnRvb2xzQ29udGV4dCk7XG4gICAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgICBjb25zdCBbZXZlbnQsIHNldEV2ZW50XSA9IHVzZVN0YXRlPE1hdHJpeEV2ZW50IHwgbnVsbD4obnVsbCk7XG5cbiAgICBjb25zdCBldmVudHMgPSBjb250ZXh0LnJvb20uY3VycmVudFN0YXRlLmV2ZW50cy5nZXQoZXZlbnRUeXBlKSE7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnRzLnNpemUgPT09IDEgJiYgZXZlbnRzLmhhcyhcIlwiKSkge1xuICAgICAgICAgICAgc2V0RXZlbnQoZXZlbnRzLmdldChcIlwiKSEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0RXZlbnQobnVsbCk7XG4gICAgICAgIH1cbiAgICB9LCBbZXZlbnRzXSk7XG5cbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgX29uQmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudHM/LnNpemUgPT09IDEgJiYgZXZlbnRzLmhhcyhcIlwiKSkge1xuICAgICAgICAgICAgICAgIG9uQmFjaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRFdmVudChudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIDxFdmVudFZpZXdlciBteEV2ZW50PXtldmVudH0gb25CYWNrPXtfb25CYWNrfSBFZGl0b3I9e1N0YXRlRXZlbnRFZGl0b3J9IC8+O1xuICAgIH1cblxuICAgIHJldHVybiA8QmFzZVRvb2wgb25CYWNrPXtvbkJhY2t9PlxuICAgICAgICA8RmlsdGVyZWRMaXN0IHF1ZXJ5PXtxdWVyeX0gb25DaGFuZ2U9e3NldFF1ZXJ5fT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBBcnJheS5mcm9tKGV2ZW50cy5lbnRyaWVzKCkpLm1hcCgoW3N0YXRlS2V5LCBldl0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgPFN0YXRlRXZlbnRCdXR0b24ga2V5PXtzdGF0ZUtleX0gbGFiZWw9e3N0YXRlS2V5fSBvbkNsaWNrPXsoKSA9PiBzZXRFdmVudChldil9IC8+XG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9GaWx0ZXJlZExpc3Q+XG4gICAgPC9CYXNlVG9vbD47XG59O1xuXG5leHBvcnQgY29uc3QgUm9vbVN0YXRlRXhwbG9yZXIgPSAoeyBvbkJhY2ssIHNldFRvb2wgfTogSURldnRvb2xzUHJvcHMpID0+IHtcbiAgICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChEZXZ0b29sc0NvbnRleHQpO1xuICAgIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgW2V2ZW50VHlwZSwgc2V0RXZlbnRUeXBlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gICAgY29uc3QgZXZlbnRzID0gY29udGV4dC5yb29tLmN1cnJlbnRTdGF0ZS5ldmVudHM7XG5cbiAgICBpZiAoZXZlbnRUeXBlICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG9uQmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIHNldEV2ZW50VHlwZShudWxsKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIDxSb29tU3RhdGVFeHBsb3JlckV2ZW50VHlwZSBldmVudFR5cGU9e2V2ZW50VHlwZX0gb25CYWNrPXtvbkJhY2t9IC8+O1xuICAgIH1cblxuICAgIGNvbnN0IG9uQWN0aW9uID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRUb29sKF90KFwiU2VuZCBjdXN0b20gc3RhdGUgZXZlbnRcIiksIFN0YXRlRXZlbnRFZGl0b3IpO1xuICAgIH07XG5cbiAgICByZXR1cm4gPEJhc2VUb29sIG9uQmFjaz17b25CYWNrfSBhY3Rpb25MYWJlbD17X3QoXCJTZW5kIGN1c3RvbSBzdGF0ZSBldmVudFwiKX0gb25BY3Rpb249e29uQWN0aW9ufT5cbiAgICAgICAgPEZpbHRlcmVkTGlzdCBxdWVyeT17cXVlcnl9IG9uQ2hhbmdlPXtzZXRRdWVyeX0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQXJyYXkuZnJvbShldmVudHMua2V5cygpKS5tYXAoKGV2ZW50VHlwZSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8U3RhdGVFdmVudEJ1dHRvbiBrZXk9e2V2ZW50VHlwZX0gbGFiZWw9e2V2ZW50VHlwZX0gb25DbGljaz17KCkgPT4gc2V0RXZlbnRUeXBlKGV2ZW50VHlwZSl9IC8+XG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9GaWx0ZXJlZExpc3Q+XG4gICAgPC9CYXNlVG9vbD47XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZTyxNQUFNQSxnQkFBZ0IsR0FBRyxRQUF1QztFQUFBLElBQXRDO0lBQUVDLE9BQUY7SUFBV0M7RUFBWCxDQUFzQztFQUNuRSxNQUFNQyxPQUFPLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0MseUJBQVgsQ0FBaEI7RUFDQSxNQUFNQyxHQUFHLEdBQUcsSUFBQUYsaUJBQUEsRUFBV0csNEJBQVgsQ0FBWjtFQUVBLE1BQU1DLE1BQU0sR0FBRyxJQUFBQyxjQUFBLEVBQVEsTUFBTSxDQUN6QixJQUFBQyxxQkFBQSxFQUFlVCxPQUFPLEVBQUVVLE9BQVQsRUFBZixDQUR5QixFQUV6QixJQUFBQyxvQkFBQSxFQUFjWCxPQUFPLEVBQUVZLFdBQVQsRUFBZCxDQUZ5QixDQUFkLEVBR1osQ0FBQ1osT0FBRCxDQUhZLENBQWY7O0VBS0EsTUFBTWEsTUFBTSxHQUFHLFFBQWtDQyxPQUFsQyxLQUF5RDtJQUFBLElBQXhELENBQUNDLFNBQUQsRUFBWUMsUUFBWixDQUF3RDtJQUNwRSxPQUFPWCxHQUFHLENBQUNZLGNBQUosQ0FBbUJm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