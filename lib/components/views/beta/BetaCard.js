"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BetaPill = void 0;

var _react = _interopRequireWildcard(require("react"));

var _utils = require("matrix-js-sdk/src/utils");

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _BetaFeedbackDialog = _interopRequireDefault(require("../dialogs/BetaFeedbackDialog"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _SettingsFlag = _interopRequireDefault(require("../elements/SettingsFlag"));

var _useSettings = require("../../../hooks/useSettings");

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

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
const BetaPill = _ref => {
  let {
    onClick,
    tooltipTitle = (0, _languageHandler._t)("This is a beta feature"),
    tooltipCaption = (0, _languageHandler._t)("Click for more info")
  } = _ref;

  if (onClick) {
    return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_BetaCard_betaPill",
      title: `${tooltipTitle} ${tooltipCaption}`,
      tooltip: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Tooltip_title"
      }, tooltipTitle), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Tooltip_sub"
      }, tooltipCaption)),
      onClick: onClick
    }, (0, _languageHandler._t)("Beta"));
  }

  return /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_BetaCard_betaPill"
  }, (0, _languageHandler._t)("Beta"));
};

exports.BetaPill = BetaPill;

const BetaCard = _ref2 => {
  let {
    title: titleOverride,
    featureId
  } = _ref2;

  const info = _SettingsStore.default.getBetaInfo(featureId);

  const value = (0, _useSettings.useFeatureEnabled)(featureId);
  const [busy, setBusy] = (0, _react.useState)(false);
  if (!info) return null; // Beta is invalid/disabled

  const {
    title,
    caption,
    faq,
    image,
    feedbackLabel,
    feedbackSubheading,
    extraSettings,
    requiresRefresh
  } = info;
  let feedbackButton;

  if (value && feedbackLabel && feedbackSubheading && _SdkConfig.default.get().bug_report_endpoint_url) {
    feedbackButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: () => {
        _Modal.default.createDialog(_BetaFeedbackDialog.default, {
          featureId
        });
      },
      kind: "primary"
    }, (0, _languageHandler._t)("Feedback"));
  }

  let refreshWarning;

  if (requiresRefresh) {
    const brand = _SdkConfig.default.get().brand;

    refreshWarning = value ? (0, _languageHandler._t)("Leaving the beta will reload %(brand)s.", {
      brand
    }) : (0, _languageHandler._t)("Joining the beta will reload %(brand)s.", {
      brand
    });
  }

  let content;

  if (busy) {
    content = /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null);
  } else if (value) {
    content = (0, _languageHandler._t)("Leave the beta");
  } else {
    content = (0, _languageHandler._t)("Join the beta");
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard_columns"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard_columns_description"
  }, /*#__PURE__*/_react.default.createElement("h3", {
    className: "mx_BetaCard_title"
  }, /*#__PURE__*/_react.default.createElement("span", null, titleOverride || (0, _languageHandler._t)(title)), /*#__PURE__*/_react.default.createElement(BetaPill, null)), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard_caption"
  }, caption()), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard_buttons"
  }, feedbackButton, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: async () => {
      setBusy(true); // make it look like we're doing something for two seconds,
      // otherwise users think clicking did nothing

      if (!requiresRefresh) {
        await (0, _utils.sleep)(2000);
      }

      await _SettingsStore.default.setValue(featureId, null, _SettingLevel.SettingLevel.DEVICE, !value);

      if (!requiresRefresh) {
        setBusy(false);
      }
    },
    kind: feedbackButton ? "primary_outline" : "primary",
    disabled: busy
  }, content)), refreshWarning && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard_refreshWarning"
  }, refreshWarning), faq && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard_faq"
  }, faq(value))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard_columns_image_wrapper"
  }, /*#__PURE__*/_react.default.createElement("img", {
    className: "mx_BetaCard_columns_image",
    src: image,
    alt: ""
  }))), extraSettings && value && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BetaCard_relatedSettings"
  }, extraSettings.map(key => /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
    key: key,
    name: key,
    level: _SettingLevel.SettingLevel.DEVICE
  }))));
};

var _default = BetaCard;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCZXRhUGlsbCIsIm9uQ2xpY2siLCJ0b29sdGlwVGl0bGUiLCJfdCIsInRvb2x0aXBDYXB0aW9uIiwiQmV0YUNhcmQiLCJ0aXRsZSIsInRpdGxlT3ZlcnJpZGUiLCJmZWF0dXJlSWQiLCJpbmZvIiwiU2V0dGluZ3NTdG9yZSIsImdldEJldGFJbmZvIiwidmFsdWUiLCJ1c2VGZWF0dXJlRW5hYmxlZCIsImJ1c3kiLCJzZXRCdXN5IiwidXNlU3RhdGUiLCJjYXB0aW9uIiwiZmFxIiwiaW1hZ2UiLCJmZWVkYmFja0xhYmVsIiwiZmVlZGJhY2tTdWJoZWFkaW5nIiwiZXh0cmFTZXR0aW5ncyIsInJlcXVpcmVzUmVmcmVzaCIsImZlZWRiYWNrQnV0dG9uIiwiU2RrQ29uZmlnIiwiZ2V0IiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkJldGFGZWVkYmFja0RpYWxvZyIsInJlZnJlc2hXYXJuaW5nIiwiYnJhbmQiLCJjb250ZW50Iiwic2xlZXAiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIm1hcCIsImtleSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2JldGEvQmV0YUNhcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy91dGlsc1wiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEJldGFGZWVkYmFja0RpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9CZXRhRmVlZGJhY2tEaWFsb2dcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IFNldHRpbmdzRmxhZyBmcm9tIFwiLi4vZWxlbWVudHMvU2V0dGluZ3NGbGFnXCI7XG5pbXBvcnQgeyB1c2VGZWF0dXJlRW5hYmxlZCB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VTZXR0aW5nc1wiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSBcIi4uL2VsZW1lbnRzL0lubGluZVNwaW5uZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcblxuLy8gWFhYOiBLZWVwIHRoaXMgYXJvdW5kIGZvciByZS11c2UgaW4gZnV0dXJlIEJldGFzXG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHRpdGxlPzogc3RyaW5nO1xuICAgIGZlYXR1cmVJZDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSUJldGFQaWxsUHJvcHMge1xuICAgIG9uQ2xpY2s/OiAoKSA9PiB2b2lkO1xuICAgIHRvb2x0aXBUaXRsZT86IHN0cmluZztcbiAgICB0b29sdGlwQ2FwdGlvbj86IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IEJldGFQaWxsID0gKHtcbiAgICBvbkNsaWNrLFxuICAgIHRvb2x0aXBUaXRsZSA9IF90KFwiVGhpcyBpcyBhIGJldGEgZmVhdHVyZVwiKSxcbiAgICB0b29sdGlwQ2FwdGlvbiA9IF90KFwiQ2xpY2sgZm9yIG1vcmUgaW5mb1wiKSxcbn06IElCZXRhUGlsbFByb3BzKSA9PiB7XG4gICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgICAgcmV0dXJuIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQmV0YUNhcmRfYmV0YVBpbGxcIlxuICAgICAgICAgICAgdGl0bGU9e2Ake3Rvb2x0aXBUaXRsZX0gJHt0b29sdGlwQ2FwdGlvbn1gfVxuICAgICAgICAgICAgdG9vbHRpcD17PGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0b29sdGlwVGl0bGUgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVG9vbHRpcF9zdWJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0b29sdGlwQ2FwdGlvbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj59XG4gICAgICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IF90KFwiQmV0YVwiKSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+O1xuICAgIH1cblxuICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJteF9CZXRhQ2FyZF9iZXRhUGlsbFwiPlxuICAgICAgICB7IF90KFwiQmV0YVwiKSB9XG4gICAgPC9zcGFuPjtcbn07XG5cbmNvbnN0IEJldGFDYXJkID0gKHsgdGl0bGU6IHRpdGxlT3ZlcnJpZGUsIGZlYXR1cmVJZCB9OiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBpbmZvID0gU2V0dGluZ3NTdG9yZS5nZXRCZXRhSW5mbyhmZWF0dXJlSWQpO1xuICAgIGNvbnN0IHZhbHVlID0gdXNlRmVhdHVyZUVuYWJsZWQoZmVhdHVyZUlkKTtcbiAgICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgaWYgKCFpbmZvKSByZXR1cm4gbnVsbDsgLy8gQmV0YSBpcyBpbnZhbGlkL2Rpc2FibGVkXG5cbiAgICBjb25zdCB7XG4gICAgICAgIHRpdGxlLFxuICAgICAgICBjYXB0aW9uLFxuICAgICAgICBmYXEsXG4gICAgICAgIGltYWdlLFxuICAgICAgICBmZWVkYmFja0xhYmVsLFxuICAgICAgICBmZWVkYmFja1N1YmhlYWRpbmcsXG4gICAgICAgIGV4dHJhU2V0dGluZ3MsXG4gICAgICAgIHJlcXVpcmVzUmVmcmVzaCxcbiAgICB9ID0gaW5mbztcblxuICAgIGxldCBmZWVkYmFja0J1dHRvbjtcbiAgICBpZiAodmFsdWUgJiYgZmVlZGJhY2tMYWJlbCAmJiBmZWVkYmFja1N1YmhlYWRpbmcgJiYgU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgIGZlZWRiYWNrQnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coQmV0YUZlZWRiYWNrRGlhbG9nLCB7IGZlYXR1cmVJZCB9KTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgID5cbiAgICAgICAgICAgIHsgX3QoXCJGZWVkYmFja1wiKSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgfVxuXG4gICAgbGV0IHJlZnJlc2hXYXJuaW5nOiBzdHJpbmc7XG4gICAgaWYgKHJlcXVpcmVzUmVmcmVzaCkge1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcbiAgICAgICAgcmVmcmVzaFdhcm5pbmcgPSB2YWx1ZVxuICAgICAgICAgICAgPyBfdChcIkxlYXZpbmcgdGhlIGJldGEgd2lsbCByZWxvYWQgJShicmFuZClzLlwiLCB7IGJyYW5kIH0pXG4gICAgICAgICAgICA6IF90KFwiSm9pbmluZyB0aGUgYmV0YSB3aWxsIHJlbG9hZCAlKGJyYW5kKXMuXCIsIHsgYnJhbmQgfSk7XG4gICAgfVxuXG4gICAgbGV0IGNvbnRlbnQ6IFJlYWN0Tm9kZTtcbiAgICBpZiAoYnVzeSkge1xuICAgICAgICBjb250ZW50ID0gPElubGluZVNwaW5uZXIgLz47XG4gICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICBjb250ZW50ID0gX3QoXCJMZWF2ZSB0aGUgYmV0YVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50ID0gX3QoXCJKb2luIHRoZSBiZXRhXCIpO1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0JldGFDYXJkXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQmV0YUNhcmRfY29sdW1uc1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9CZXRhQ2FyZF9jb2x1bW5zX2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cIm14X0JldGFDYXJkX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPnsgdGl0bGVPdmVycmlkZSB8fCBfdCh0aXRsZSkgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPEJldGFQaWxsIC8+XG4gICAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0JldGFDYXJkX2NhcHRpb25cIj57IGNhcHRpb24oKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9CZXRhQ2FyZF9idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgZmVlZGJhY2tCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBpdCBsb29rIGxpa2Ugd2UncmUgZG9pbmcgc29tZXRoaW5nIGZvciB0d28gc2Vjb25kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgdXNlcnMgdGhpbmsgY2xpY2tpbmcgZGlkIG5vdGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcXVpcmVzUmVmcmVzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcCgyMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShmZWF0dXJlSWQsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsICF2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXF1aXJlc1JlZnJlc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0QnVzeShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9e2ZlZWRiYWNrQnV0dG9uID8gXCJwcmltYXJ5X291dGxpbmVcIiA6IFwicHJpbWFyeVwifVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHJlZnJlc2hXYXJuaW5nICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfQmV0YUNhcmRfcmVmcmVzaFdhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgeyByZWZyZXNoV2FybmluZyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+IH1cbiAgICAgICAgICAgICAgICB7IGZhcSAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X0JldGFDYXJkX2ZhcVwiPlxuICAgICAgICAgICAgICAgICAgICB7IGZhcSh2YWx1ZSkgfVxuICAgICAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQmV0YUNhcmRfY29sdW1uc19pbWFnZV93cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9XCJteF9CZXRhQ2FyZF9jb2x1bW5zX2ltYWdlXCIgc3JjPXtpbWFnZX0gYWx0PVwiXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyBleHRyYVNldHRpbmdzICYmIHZhbHVlICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfQmV0YUNhcmRfcmVsYXRlZFNldHRpbmdzXCI+XG4gICAgICAgICAgICB7IGV4dHJhU2V0dGluZ3MubWFwKGtleSA9PiAoXG4gICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBrZXk9e2tleX0gbmFtZT17a2V5fSBsZXZlbD17U2V0dGluZ0xldmVsLkRFVklDRX0gLz5cbiAgICAgICAgICAgICkpIH1cbiAgICAgICAgPC9kaXY+IH1cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBCZXRhQ2FyZDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUE3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBOEJPLE1BQU1BLFFBQVEsR0FBRyxRQUlGO0VBQUEsSUFKRztJQUNyQkMsT0FEcUI7SUFFckJDLFlBQVksR0FBRyxJQUFBQyxtQkFBQSxFQUFHLHdCQUFILENBRk07SUFHckJDLGNBQWMsR0FBRyxJQUFBRCxtQkFBQSxFQUFHLHFCQUFIO0VBSEksQ0FJSDs7RUFDbEIsSUFBSUYsT0FBSixFQUFhO0lBQ1Qsb0JBQU8sNkJBQUMsZ0NBQUQ7TUFDSCxTQUFTLEVBQUMsc0JBRFA7TUFFSCxLQUFLLEVBQUcsR0FBRUMsWUFBYSxJQUFHRSxjQUFlLEVBRnRDO01BR0gsT0FBTyxlQUFFLHVEQUNMO1FBQUssU0FBUyxFQUFDO01BQWYsR0FDTUYsWUFETixDQURLLGVBSUw7UUFBSyxTQUFTLEVBQUM7TUFBZixHQUNNRSxjQUROLENBSkssQ0FITjtN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