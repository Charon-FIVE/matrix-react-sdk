"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringify = exports.stateKeyField = exports.eventTypeField = exports.TimelineEventEditor = exports.EventViewer = exports.EventEditor = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../../languageHandler");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _BaseTool = _interopRequireWildcard(require("./BaseTool"));

var _MatrixClientContext = _interopRequireDefault(require("../../../../contexts/MatrixClientContext"));

var _Validation = _interopRequireDefault(require("../../elements/Validation"));

var _SyntaxHighlight = _interopRequireDefault(require("../../elements/SyntaxHighlight"));

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
const stringify = object => {
  return JSON.stringify(object, null, 2);
};

exports.stringify = stringify;

const eventTypeField = defaultValue => ({
  id: "eventType",
  label: (0, _languageHandler._td)("Event Type"),
  default: defaultValue
});

exports.eventTypeField = eventTypeField;

const stateKeyField = defaultValue => ({
  id: "stateKey",
  label: (0, _languageHandler._td)("State Key"),
  default: defaultValue
});

exports.stateKeyField = stateKeyField;
const validateEventContent = (0, _Validation.default)({
  deriveData(_ref) {
    let {
      value
    } = _ref;

    try {
      JSON.parse(value);
    } catch (e) {
      return e;
    }
  },

  rules: [{
    key: "validJson",
    test: (_ref2, error) => {
      let {
        value
      } = _ref2;
      if (!value) return true;
      return !error;
    },
    invalid: error => (0, _languageHandler._t)("Doesn't look like valid JSON.") + " " + error
  }]
});

const EventEditor = _ref3 => {
  let {
    fieldDefs,
    defaultContent = "{\n\n}",
    onSend,
    onBack
  } = _ref3;
  const [fieldData, setFieldData] = (0, _react.useState)(fieldDefs.map(def => def.default ?? ""));
  const [content, setContent] = (0, _react.useState)(defaultContent);
  const contentField = (0, _react.useRef)();
  const fields = fieldDefs.map((def, i) => /*#__PURE__*/_react.default.createElement(_Field.default, {
    key: def.id,
    id: def.id,
    label: (0, _languageHandler._t)(def.label),
    size: 42,
    autoFocus: defaultContent === undefined && i === 0,
    type: "text",
    autoComplete: "on",
    value: fieldData[i],
    onChange: ev => setFieldData(data => {
      data[i] = ev.target.value;
      return [...data];
    })
  }));

  const onAction = async () => {
    const valid = await contentField.current.validate({});

    if (!valid) {
      contentField.current.focus();
      contentField.current.validate({
        focused: true
      });
      return;
    }

    try {
      const json = JSON.parse(content);
      await onSend(fieldData, json);
    } catch (e) {
      return (0, _languageHandler._t)("Failed to send event!") + ` (${e.toString()})`;
    }

    return (0, _languageHandler._t)("Event sent!");
  };

  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    actionLabel: (0, _languageHandler._t)("Send"),
    onAction: onAction,
    onBack: onBack
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DevTools_eventTypeStateKeyGroup"
  }, fields), /*#__PURE__*/_react.default.createElement(_Field.default, {
    id: "evContent",
    label: (0, _languageHandler._t)("Event Content"),
    type: "text",
    className: "mx_DevTools_textarea",
    autoComplete: "off",
    value: content,
    onChange: ev => setContent(ev.target.value),
    element: "textarea",
    onValidate: validateEventContent,
    ref: contentField,
    autoFocus: !!defaultContent
  }));
};

exports.EventEditor = EventEditor;

const EventViewer = _ref4 => {
  let {
    mxEvent,
    onBack,
    Editor
  } = _ref4;
  const [editing, setEditing] = (0, _react.useState)(false);

  if (editing) {
    const onBack = () => {
      setEditing(false);
    };

    return /*#__PURE__*/_react.default.createElement(Editor, {
      mxEvent: mxEvent,
      onBack: onBack
    });
  }

  const onAction = async () => {
    setEditing(true);
  };

  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack,
    actionLabel: (0, _languageHandler._t)("Edit"),
    onAction: onAction
  }, /*#__PURE__*/_react.default.createElement(_SyntaxHighlight.default, {
    language: "json"
  }, stringify(mxEvent.event)));
}; // returns the id of the initial message, not the id of the previous edit


exports.EventViewer = EventViewer;

const getBaseEventId = baseEvent => {
  // show the replacing event, not the original, if it is an edit
  const mxEvent = baseEvent.replacingEvent() ?? baseEvent;
  return mxEvent.getWireContent()["m.relates_to"]?.event_id ?? baseEvent.getId();
};

const TimelineEventEditor = _ref5 => {
  let {
    mxEvent,
    onBack
  } = _ref5;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const fields = (0, _react.useMemo)(() => [eventTypeField(mxEvent?.getType())], [mxEvent]);

  const onSend = (_ref6, content) => {
    let [eventType] = _ref6;
    return cli.sendEvent(context.room.roomId, eventType, content);
  };

  let defaultContent;

  if (mxEvent) {
    const originalContent = mxEvent.getContent(); // prefill an edit-message event, keep only the `body` and `msgtype` fields of originalContent

    const bodyToStartFrom = originalContent["m.new_content"]?.body ?? originalContent.body; // prefill the last edit body, to start editing from there

    const newContent = {
      "body": ` * ${bodyToStartFrom}`,
      "msgtype": originalContent.msgtype,
      "m.new_content": {
        body: bodyToStartFrom,
        msgtype: originalContent.msgtype
      },
      "m.relates_to": {
        rel_type: "m.replace",
        event_id: getBaseEventId(mxEvent)
      }
    };
    defaultContent = stringify(newContent);
  }

  return /*#__PURE__*/_react.default.createElement(EventEditor, {
    fieldDefs: fields,
    defaultContent: defaultContent,
    onSend: onSend,
    onBack: onBack
  });
};

exports.TimelineEventEditor = TimelineEventEditor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdHJpbmdpZnkiLCJvYmplY3QiLCJKU09OIiwiZXZlbnRUeXBlRmllbGQiLCJkZWZhdWx0VmFsdWUiLCJpZCIsImxhYmVsIiwiX3RkIiwiZGVmYXVsdCIsInN0YXRlS2V5RmllbGQiLCJ2YWxpZGF0ZUV2ZW50Q29udGVudCIsIndpdGhWYWxpZGF0aW9uIiwiZGVyaXZlRGF0YSIsInZhbHVlIiwicGFyc2UiLCJlIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiZXJyb3IiLCJpbnZhbGlkIiwiX3QiLCJFdmVudEVkaXRvciIsImZpZWxkRGVmcyIsImRlZmF1bHRDb250ZW50Iiwib25TZW5kIiwib25CYWNrIiwiZmllbGREYXRhIiwic2V0RmllbGREYXRhIiwidXNlU3RhdGUiLCJtYXAiLCJkZWYiLCJjb250ZW50Iiwic2V0Q29udGVudCIsImNvbnRlbnRGaWVsZCIsInVzZVJlZiIsImZpZWxkcyIsImkiLCJ1bmRlZmluZWQiLCJldiIsImRhdGEiLCJ0YXJnZXQiLCJvbkFjdGlvbiIsInZhbGlkIiwiY3VycmVudCIsInZhbGlkYXRlIiwiZm9jdXMiLCJmb2N1c2VkIiwianNvbiIsInRvU3RyaW5nIiwiRXZlbnRWaWV3ZXIiLCJteEV2ZW50IiwiRWRpdG9yIiwiZWRpdGluZyIsInNldEVkaXRpbmciLCJldmVudCIsImdldEJhc2VFdmVudElkIiwiYmFzZUV2ZW50IiwicmVwbGFjaW5nRXZlbnQiLCJnZXRXaXJlQ29udGVudCIsImV2ZW50X2lkIiwiZ2V0SWQiLCJUaW1lbGluZUV2ZW50RWRpdG9yIiwiY29udGV4dCIsInVzZUNvbnRleHQiLCJEZXZ0b29sc0NvbnRleHQiLCJjbGkiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwidXNlTWVtbyIsImdldFR5cGUiLCJldmVudFR5cGUiLCJzZW5kRXZlbnQiLCJyb29tIiwicm9vbUlkIiwib3JpZ2luYWxDb250ZW50IiwiZ2V0Q29udGVudCIsImJvZHlUb1N0YXJ0RnJvbSIsImJvZHkiLCJuZXdDb250ZW50IiwibXNndHlwZSIsInJlbF90eXBlIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9kZXZ0b29scy9FdmVudC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJQ29udGVudCwgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQmFzZVRvb2wsIHsgRGV2dG9vbHNDb250ZXh0LCBJRGV2dG9vbHNQcm9wcyB9IGZyb20gXCIuL0Jhc2VUb29sXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uIGZyb20gXCIuLi8uLi9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5pbXBvcnQgU3ludGF4SGlnaGxpZ2h0IGZyb20gXCIuLi8uLi9lbGVtZW50cy9TeW50YXhIaWdobGlnaHRcIjtcblxuZXhwb3J0IGNvbnN0IHN0cmluZ2lmeSA9IChvYmplY3Q6IG9iamVjdCk6IHN0cmluZyA9PiB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iamVjdCwgbnVsbCwgMik7XG59O1xuXG5pbnRlcmZhY2UgSUV2ZW50RWRpdG9yUHJvcHMgZXh0ZW5kcyBQaWNrPElEZXZ0b29sc1Byb3BzLCBcIm9uQmFja1wiPiB7XG4gICAgZmllbGREZWZzOiBJRmllbGREZWZbXTsgLy8gaW1tdXRhYmxlXG4gICAgZGVmYXVsdENvbnRlbnQ/OiBzdHJpbmc7XG4gICAgb25TZW5kKGZpZWxkczogc3RyaW5nW10sIGNvbnRlbnQ/OiBJQ29udGVudCk6IFByb21pc2U8dW5rbm93bj47XG59XG5cbmludGVyZmFjZSBJRmllbGREZWYge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbGFiZWw6IHN0cmluZzsgLy8gX3RkXG4gICAgZGVmYXVsdD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IGV2ZW50VHlwZUZpZWxkID0gKGRlZmF1bHRWYWx1ZT86IHN0cmluZyk6IElGaWVsZERlZiA9PiAoe1xuICAgIGlkOiBcImV2ZW50VHlwZVwiLFxuICAgIGxhYmVsOiBfdGQoXCJFdmVudCBUeXBlXCIpLFxuICAgIGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZSxcbn0pO1xuXG5leHBvcnQgY29uc3Qgc3RhdGVLZXlGaWVsZCA9IChkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBJRmllbGREZWYgPT4gKHtcbiAgICBpZDogXCJzdGF0ZUtleVwiLFxuICAgIGxhYmVsOiBfdGQoXCJTdGF0ZSBLZXlcIiksXG4gICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxufSk7XG5cbmNvbnN0IHZhbGlkYXRlRXZlbnRDb250ZW50ID0gd2l0aFZhbGlkYXRpb248YW55LCBFcnJvciB8IHVuZGVmaW5lZD4oe1xuICAgIGRlcml2ZURhdGEoeyB2YWx1ZSB9KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJ1bGVzOiBbe1xuICAgICAgICBrZXk6IFwidmFsaWRKc29uXCIsXG4gICAgICAgIHRlc3Q6ICh7IHZhbHVlIH0sIGVycm9yKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiAhZXJyb3I7XG4gICAgICAgIH0sXG4gICAgICAgIGludmFsaWQ6IChlcnJvcikgPT4gX3QoXCJEb2Vzbid0IGxvb2sgbGlrZSB2YWxpZCBKU09OLlwiKSArIFwiIFwiICsgZXJyb3IsXG4gICAgfV0sXG59KTtcblxuZXhwb3J0IGNvbnN0IEV2ZW50RWRpdG9yID0gKHsgZmllbGREZWZzLCBkZWZhdWx0Q29udGVudCA9IFwie1xcblxcbn1cIiwgb25TZW5kLCBvbkJhY2sgfTogSUV2ZW50RWRpdG9yUHJvcHMpID0+IHtcbiAgICBjb25zdCBbZmllbGREYXRhLCBzZXRGaWVsZERhdGFdID0gdXNlU3RhdGU8c3RyaW5nW10+KGZpZWxkRGVmcy5tYXAoZGVmID0+IGRlZi5kZWZhdWx0ID8/IFwiXCIpKTtcbiAgICBjb25zdCBbY29udGVudCwgc2V0Q29udGVudF0gPSB1c2VTdGF0ZTxzdHJpbmc+KGRlZmF1bHRDb250ZW50KTtcbiAgICBjb25zdCBjb250ZW50RmllbGQgPSB1c2VSZWY8RmllbGQ+KCk7XG5cbiAgICBjb25zdCBmaWVsZHMgPSBmaWVsZERlZnMubWFwKChkZWYsIGkpID0+IChcbiAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICBrZXk9e2RlZi5pZH1cbiAgICAgICAgICAgIGlkPXtkZWYuaWR9XG4gICAgICAgICAgICBsYWJlbD17X3QoZGVmLmxhYmVsKX1cbiAgICAgICAgICAgIHNpemU9ezQyfVxuICAgICAgICAgICAgYXV0b0ZvY3VzPXtkZWZhdWx0Q29udGVudCA9PT0gdW5kZWZpbmVkICYmIGkgPT09IDB9XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvblwiXG4gICAgICAgICAgICB2YWx1ZT17ZmllbGREYXRhW2ldfVxuICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHNldEZpZWxkRGF0YShkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBkYXRhW2ldID0gZXYudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBbLi4uZGF0YV07XG4gICAgICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICApKTtcblxuICAgIGNvbnN0IG9uQWN0aW9uID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB2YWxpZCA9IGF3YWl0IGNvbnRlbnRGaWVsZC5jdXJyZW50LnZhbGlkYXRlKHt9KTtcblxuICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICBjb250ZW50RmllbGQuY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgY29udGVudEZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgICAgICAgYXdhaXQgb25TZW5kKGZpZWxkRGF0YSwganNvbik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIkZhaWxlZCB0byBzZW5kIGV2ZW50IVwiKSArIGAgKCR7ZS50b1N0cmluZygpfSlgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdChcIkV2ZW50IHNlbnQhXCIpO1xuICAgIH07XG5cbiAgICByZXR1cm4gPEJhc2VUb29sXG4gICAgICAgIGFjdGlvbkxhYmVsPXtfdChcIlNlbmRcIil9XG4gICAgICAgIG9uQWN0aW9uPXtvbkFjdGlvbn1cbiAgICAgICAgb25CYWNrPXtvbkJhY2t9XG4gICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX2V2ZW50VHlwZVN0YXRlS2V5R3JvdXBcIj5cbiAgICAgICAgICAgIHsgZmllbGRzIH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICBpZD1cImV2Q29udGVudFwiXG4gICAgICAgICAgICBsYWJlbD17X3QoXCJFdmVudCBDb250ZW50XCIpfVxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGV4dGFyZWFcIlxuICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgIHZhbHVlPXtjb250ZW50fVxuICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHNldENvbnRlbnQoZXYudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICBvblZhbGlkYXRlPXt2YWxpZGF0ZUV2ZW50Q29udGVudH1cbiAgICAgICAgICAgIHJlZj17Y29udGVudEZpZWxkfVxuICAgICAgICAgICAgYXV0b0ZvY3VzPXshIWRlZmF1bHRDb250ZW50fVxuICAgICAgICAvPlxuICAgIDwvQmFzZVRvb2w+O1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBJRWRpdG9yUHJvcHMgZXh0ZW5kcyBQaWNrPElEZXZ0b29sc1Byb3BzLCBcIm9uQmFja1wiPiB7XG4gICAgbXhFdmVudD86IE1hdHJpeEV2ZW50O1xufVxuXG5pbnRlcmZhY2UgSVZpZXdlclByb3BzIGV4dGVuZHMgUmVxdWlyZWQ8SUVkaXRvclByb3BzPiB7XG4gICAgRWRpdG9yOiBSZWFjdC5GQzxSZXF1aXJlZDxJRWRpdG9yUHJvcHM+Pjtcbn1cblxuZXhwb3J0IGNvbnN0IEV2ZW50Vmlld2VyID0gKHsgbXhFdmVudCwgb25CYWNrLCBFZGl0b3IgfTogSVZpZXdlclByb3BzKSA9PiB7XG4gICAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gICAgaWYgKGVkaXRpbmcpIHtcbiAgICAgICAgY29uc3Qgb25CYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgc2V0RWRpdGluZyhmYWxzZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiA8RWRpdG9yIG14RXZlbnQ9e214RXZlbnR9IG9uQmFjaz17b25CYWNrfSAvPjtcbiAgICB9XG5cbiAgICBjb25zdCBvbkFjdGlvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0RWRpdGluZyh0cnVlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIDxCYXNlVG9vbCBvbkJhY2s9e29uQmFja30gYWN0aW9uTGFiZWw9e190KFwiRWRpdFwiKX0gb25BY3Rpb249e29uQWN0aW9ufT5cbiAgICAgICAgPFN5bnRheEhpZ2hsaWdodCBsYW5ndWFnZT1cImpzb25cIj5cbiAgICAgICAgICAgIHsgc3RyaW5naWZ5KG14RXZlbnQuZXZlbnQpIH1cbiAgICAgICAgPC9TeW50YXhIaWdobGlnaHQ+XG4gICAgPC9CYXNlVG9vbD47XG59O1xuXG4vLyByZXR1cm5zIHRoZSBpZCBvZiB0aGUgaW5pdGlhbCBtZXNzYWdlLCBub3QgdGhlIGlkIG9mIHRoZSBwcmV2aW91cyBlZGl0XG5jb25zdCBnZXRCYXNlRXZlbnRJZCA9IChiYXNlRXZlbnQ6IE1hdHJpeEV2ZW50KTogc3RyaW5nID0+IHtcbiAgICAvLyBzaG93IHRoZSByZXBsYWNpbmcgZXZlbnQsIG5vdCB0aGUgb3JpZ2luYWwsIGlmIGl0IGlzIGFuIGVkaXRcbiAgICBjb25zdCBteEV2ZW50ID0gYmFzZUV2ZW50LnJlcGxhY2luZ0V2ZW50KCkgPz8gYmFzZUV2ZW50O1xuICAgIHJldHVybiBteEV2ZW50LmdldFdpcmVDb250ZW50KClbXCJtLnJlbGF0ZXNfdG9cIl0/LmV2ZW50X2lkID8/IGJhc2VFdmVudC5nZXRJZCgpO1xufTtcblxuZXhwb3J0IGNvbnN0IFRpbWVsaW5lRXZlbnRFZGl0b3IgPSAoeyBteEV2ZW50LCBvbkJhY2sgfTogSUVkaXRvclByb3BzKSA9PiB7XG4gICAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoRGV2dG9vbHNDb250ZXh0KTtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgY29uc3QgZmllbGRzID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIGV2ZW50VHlwZUZpZWxkKG14RXZlbnQ/LmdldFR5cGUoKSksXG4gICAgXSwgW214RXZlbnRdKTtcblxuICAgIGNvbnN0IG9uU2VuZCA9IChbZXZlbnRUeXBlXTogc3RyaW5nW10sIGNvbnRlbnQ/OiBJQ29udGVudCkgPT4ge1xuICAgICAgICByZXR1cm4gY2xpLnNlbmRFdmVudChjb250ZXh0LnJvb20ucm9vbUlkLCBldmVudFR5cGUsIGNvbnRlbnQpO1xuICAgIH07XG5cbiAgICBsZXQgZGVmYXVsdENvbnRlbnQ6IHN0cmluZztcblxuICAgIGlmIChteEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsQ29udGVudCA9IG14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICAvLyBwcmVmaWxsIGFuIGVkaXQtbWVzc2FnZSBldmVudCwga2VlcCBvbmx5IHRoZSBgYm9keWAgYW5kIGBtc2d0eXBlYCBmaWVsZHMgb2Ygb3JpZ2luYWxDb250ZW50XG4gICAgICAgIGNvbnN0IGJvZHlUb1N0YXJ0RnJvbSA9IG9yaWdpbmFsQ29udGVudFtcIm0ubmV3X2NvbnRlbnRcIl0/LmJvZHkgPz8gb3JpZ2luYWxDb250ZW50LmJvZHk7IC8vIHByZWZpbGwgdGhlIGxhc3QgZWRpdCBib2R5LCB0byBzdGFydCBlZGl0aW5nIGZyb20gdGhlcmVcbiAgICAgICAgY29uc3QgbmV3Q29udGVudCA9IHtcbiAgICAgICAgICAgIFwiYm9keVwiOiBgICogJHtib2R5VG9TdGFydEZyb219YCxcbiAgICAgICAgICAgIFwibXNndHlwZVwiOiBvcmlnaW5hbENvbnRlbnQubXNndHlwZSxcbiAgICAgICAgICAgIFwibS5uZXdfY29udGVudFwiOiB7XG4gICAgICAgICAgICAgICAgYm9keTogYm9keVRvU3RhcnRGcm9tLFxuICAgICAgICAgICAgICAgIG1zZ3R5cGU6IG9yaWdpbmFsQ29udGVudC5tc2d0eXBlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwibS5yZWxhdGVzX3RvXCI6IHtcbiAgICAgICAgICAgICAgICByZWxfdHlwZTogXCJtLnJlcGxhY2VcIixcbiAgICAgICAgICAgICAgICBldmVudF9pZDogZ2V0QmFzZUV2ZW50SWQobXhFdmVudCksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIGRlZmF1bHRDb250ZW50ID0gc3RyaW5naWZ5KG5ld0NvbnRlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiA8RXZlbnRFZGl0b3IgZmllbGREZWZzPXtmaWVsZHN9IGRlZmF1bHRDb250ZW50PXtkZWZhdWx0Q29udGVudH0gb25TZW5kPXtvblNlbmR9IG9uQmFjaz17b25CYWNrfSAvPjtcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBeEJBO0FBQ0E7QUFDQTtBQUNBO0FB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