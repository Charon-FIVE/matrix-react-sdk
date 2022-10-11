"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SpaceAvatar = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _BrowserWorkarounds = require("../../../utils/BrowserWorkarounds");

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
const SpaceAvatar = _ref => {
  let {
    avatarUrl,
    avatarDisabled = false,
    setAvatar
  } = _ref;
  const avatarUploadRef = (0, _react.useRef)();
  const [avatar, setAvatarDataUrl] = (0, _react.useState)(avatarUrl); // avatar data url cache

  let avatarSection;

  if (avatarDisabled) {
    if (avatar) {
      avatarSection = /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_SpaceBasicSettings_avatar",
        src: avatar,
        alt: ""
      });
    } else {
      avatarSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceBasicSettings_avatar"
      });
    }
  } else {
    if (avatar) {
      avatarSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_SpaceBasicSettings_avatar",
        onClick: () => avatarUploadRef.current?.click(),
        element: "img",
        src: avatar,
        alt: ""
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: () => {
          avatarUploadRef.current.value = "";
          setAvatarDataUrl(undefined);
          setAvatar(undefined);
        },
        kind: "link",
        className: "mx_SpaceBasicSettings_avatar_remove",
        "aria-label": (0, _languageHandler._t)("Delete avatar")
      }, (0, _languageHandler._t)("Delete")));
    } else {
      avatarSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceBasicSettings_avatar",
        onClick: () => avatarUploadRef.current?.click()
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: () => avatarUploadRef.current?.click(),
        kind: "link",
        "aria-label": (0, _languageHandler._t)("Upload avatar")
      }, (0, _languageHandler._t)("Upload")));
    }
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceBasicSettings_avatarContainer"
  }, avatarSection, /*#__PURE__*/_react.default.createElement("input", {
    type: "file",
    ref: avatarUploadRef,
    onClick: _BrowserWorkarounds.chromeFileInputFix,
    onChange: e => {
      if (!e.target.files?.length) return;
      const file = e.target.files[0];
      setAvatar(file);
      const reader = new FileReader();

      reader.onload = ev => {
        setAvatarDataUrl(ev.target.result);
      };

      reader.readAsDataURL(file);
    },
    accept: "image/*"
  }));
};

exports.SpaceAvatar = SpaceAvatar;

const SpaceBasicSettings = _ref2 => {
  let {
    avatarUrl,
    avatarDisabled = false,
    setAvatar,
    name = "",
    nameDisabled = false,
    setName,
    topic = "",
    topicDisabled = false,
    setTopic
  } = _ref2;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceBasicSettings"
  }, /*#__PURE__*/_react.default.createElement(SpaceAvatar, {
    avatarUrl: avatarUrl,
    avatarDisabled: avatarDisabled,
    setAvatar: setAvatar
  }), /*#__PURE__*/_react.default.createElement(_Field.default, {
    name: "spaceName",
    label: (0, _languageHandler._t)("Name"),
    autoFocus: true,
    value: name,
    onChange: ev => setName(ev.target.value),
    disabled: nameDisabled
  }), /*#__PURE__*/_react.default.createElement(_Field.default, {
    name: "spaceTopic",
    element: "textarea",
    label: (0, _languageHandler._t)("Description"),
    value: topic,
    onChange: ev => setTopic(ev.target.value),
    rows: 3,
    disabled: topicDisabled
  }));
};

var _default = SpaceBasicSettings;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcGFjZUF2YXRhciIsImF2YXRhclVybCIsImF2YXRhckRpc2FibGVkIiwic2V0QXZhdGFyIiwiYXZhdGFyVXBsb2FkUmVmIiwidXNlUmVmIiwiYXZhdGFyIiwic2V0QXZhdGFyRGF0YVVybCIsInVzZVN0YXRlIiwiYXZhdGFyU2VjdGlvbiIsImN1cnJlbnQiLCJjbGljayIsInZhbHVlIiwidW5kZWZpbmVkIiwiX3QiLCJjaHJvbWVGaWxlSW5wdXRGaXgiLCJlIiwidGFyZ2V0IiwiZmlsZXMiLCJsZW5ndGgiLCJmaWxlIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImV2IiwicmVzdWx0IiwicmVhZEFzRGF0YVVSTCIsIlNwYWNlQmFzaWNTZXR0aW5ncyIsIm5hbWUiLCJuYW1lRGlzYWJsZWQiLCJzZXROYW1lIiwidG9waWMiLCJ0b3BpY0Rpc2FibGVkIiwic2V0VG9waWMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zcGFjZXMvU3BhY2VCYXNpY1NldHRpbmdzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgeyBjaHJvbWVGaWxlSW5wdXRGaXggfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQnJvd3Nlcldvcmthcm91bmRzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGF2YXRhclVybD86IHN0cmluZztcbiAgICBhdmF0YXJEaXNhYmxlZD86IGJvb2xlYW47XG4gICAgbmFtZT86IHN0cmluZztcbiAgICBuYW1lRGlzYWJsZWQ/OiBib29sZWFuO1xuICAgIHRvcGljPzogc3RyaW5nO1xuICAgIHRvcGljRGlzYWJsZWQ/OiBib29sZWFuO1xuICAgIHNldEF2YXRhcihhdmF0YXI6IEZpbGUpOiB2b2lkO1xuICAgIHNldE5hbWUobmFtZTogc3RyaW5nKTogdm9pZDtcbiAgICBzZXRUb3BpYyh0b3BpYzogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IFNwYWNlQXZhdGFyID0gKHtcbiAgICBhdmF0YXJVcmwsXG4gICAgYXZhdGFyRGlzYWJsZWQgPSBmYWxzZSxcbiAgICBzZXRBdmF0YXIsXG59OiBQaWNrPElQcm9wcywgXCJhdmF0YXJVcmxcIiB8IFwiYXZhdGFyRGlzYWJsZWRcIiB8IFwic2V0QXZhdGFyXCI+KSA9PiB7XG4gICAgY29uc3QgYXZhdGFyVXBsb2FkUmVmID0gdXNlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG4gICAgY29uc3QgW2F2YXRhciwgc2V0QXZhdGFyRGF0YVVybF0gPSB1c2VTdGF0ZShhdmF0YXJVcmwpOyAvLyBhdmF0YXIgZGF0YSB1cmwgY2FjaGVcblxuICAgIGxldCBhdmF0YXJTZWN0aW9uO1xuICAgIGlmIChhdmF0YXJEaXNhYmxlZCkge1xuICAgICAgICBpZiAoYXZhdGFyKSB7XG4gICAgICAgICAgICBhdmF0YXJTZWN0aW9uID0gPGltZyBjbGFzc05hbWU9XCJteF9TcGFjZUJhc2ljU2V0dGluZ3NfYXZhdGFyXCIgc3JjPXthdmF0YXJ9IGFsdD1cIlwiIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXZhdGFyU2VjdGlvbiA9IDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VCYXNpY1NldHRpbmdzX2F2YXRhclwiIC8+O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGF2YXRhcikge1xuICAgICAgICAgICAgYXZhdGFyU2VjdGlvbiA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUJhc2ljU2V0dGluZ3NfYXZhdGFyXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gYXZhdGFyVXBsb2FkUmVmLmN1cnJlbnQ/LmNsaWNrKCl9XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJpbWdcIlxuICAgICAgICAgICAgICAgICAgICBzcmM9e2F2YXRhcn1cbiAgICAgICAgICAgICAgICAgICAgYWx0PVwiXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVwbG9hZFJlZi5jdXJyZW50LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEF2YXRhckRhdGFVcmwodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEF2YXRhcih1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlQmFzaWNTZXR0aW5nc19hdmF0YXJfcmVtb3ZlXCJcbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJEZWxldGUgYXZhdGFyXCIpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRlbGV0ZVwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdmF0YXJTZWN0aW9uID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VCYXNpY1NldHRpbmdzX2F2YXRhclwiIG9uQ2xpY2s9eygpID0+IGF2YXRhclVwbG9hZFJlZi5jdXJyZW50Py5jbGljaygpfSAvPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGF2YXRhclVwbG9hZFJlZi5jdXJyZW50Py5jbGljaygpfVxuICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiVXBsb2FkIGF2YXRhclwiKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJVcGxvYWRcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VCYXNpY1NldHRpbmdzX2F2YXRhckNvbnRhaW5lclwiPlxuICAgICAgICB7IGF2YXRhclNlY3Rpb24gfVxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgIHJlZj17YXZhdGFyVXBsb2FkUmVmfVxuICAgICAgICAgICAgb25DbGljaz17Y2hyb21lRmlsZUlucHV0Rml4fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFlLnRhcmdldC5maWxlcz8ubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICAgICAgICAgIHNldEF2YXRhcihmaWxlKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0QXZhdGFyRGF0YVVybChldi50YXJnZXQucmVzdWx0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBhY2NlcHQ9XCJpbWFnZS8qXCJcbiAgICAgICAgLz5cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBTcGFjZUJhc2ljU2V0dGluZ3MgPSAoe1xuICAgIGF2YXRhclVybCxcbiAgICBhdmF0YXJEaXNhYmxlZCA9IGZhbHNlLFxuICAgIHNldEF2YXRhcixcbiAgICBuYW1lID0gXCJcIixcbiAgICBuYW1lRGlzYWJsZWQgPSBmYWxzZSxcbiAgICBzZXROYW1lLFxuICAgIHRvcGljID0gXCJcIixcbiAgICB0b3BpY0Rpc2FibGVkID0gZmFsc2UsXG4gICAgc2V0VG9waWMsXG59OiBJUHJvcHMpID0+IHtcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUJhc2ljU2V0dGluZ3NcIj5cbiAgICAgICAgPFNwYWNlQXZhdGFyIGF2YXRhclVybD17YXZhdGFyVXJsfSBhdmF0YXJEaXNhYmxlZD17YXZhdGFyRGlzYWJsZWR9IHNldEF2YXRhcj17c2V0QXZhdGFyfSAvPlxuXG4gICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgbmFtZT1cInNwYWNlTmFtZVwiXG4gICAgICAgICAgICBsYWJlbD17X3QoXCJOYW1lXCIpfVxuICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgdmFsdWU9e25hbWV9XG4gICAgICAgICAgICBvbkNoYW5nZT17ZXYgPT4gc2V0TmFtZShldi50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e25hbWVEaXNhYmxlZH1cbiAgICAgICAgLz5cblxuICAgICAgICA8RmllbGRcbiAgICAgICAgICAgIG5hbWU9XCJzcGFjZVRvcGljXCJcbiAgICAgICAgICAgIGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICBsYWJlbD17X3QoXCJEZXNjcmlwdGlvblwiKX1cbiAgICAgICAgICAgIHZhbHVlPXt0b3BpY31cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtldiA9PiBzZXRUb3BpYyhldi50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgcm93cz17M31cbiAgICAgICAgICAgIGRpc2FibGVkPXt0b3BpY0Rpc2FibGVkfVxuICAgICAgICAvPlxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNwYWNlQmFzaWNTZXR0aW5ncztcbiJdLCJtYXBwaW5ncyI6Ijs7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