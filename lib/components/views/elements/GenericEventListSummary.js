"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _lodash = require("lodash");

var _logger = require("matrix-js-sdk/src/logger");

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _languageHandler = require("../../../languageHandler");

var _useStateToggle = require("../../../hooks/useStateToggle");

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _Layout = require("../../../settings/enums/Layout");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 - 2022 The Matrix.org Foundation C.I.C.

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
const GenericEventListSummary = _ref => {
  let {
    events,
    children,
    threshold = 3,
    onToggle,
    startExpanded = false,
    summaryMembers = [],
    summaryText,
    layout = _Layout.Layout.Group,
    'data-testid': testId
  } = _ref;
  const [expanded, toggleExpanded] = (0, _useStateToggle.useStateToggle)(startExpanded); // Whenever expanded changes call onToggle

  (0, _react.useEffect)(() => {
    if (onToggle) {
      onToggle();
    }
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  const eventIds = events.map(e => e.getId()).join(','); // If we are only given few events then just pass them through

  if (events.length < threshold) {
    return /*#__PURE__*/_react.default.createElement("li", {
      className: "mx_GenericEventListSummary",
      "data-scroll-tokens": eventIds,
      "data-expanded": true,
      "data-layout": layout
    }, /*#__PURE__*/_react.default.createElement("ol", {
      className: "mx_GenericEventListSummary_unstyledList"
    }, children));
  }

  let body;

  if (expanded) {
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GenericEventListSummary_line"
    }, "\xA0"), /*#__PURE__*/_react.default.createElement("ol", {
      className: "mx_GenericEventListSummary_unstyledList"
    }, children));
  } else {
    const uniqueMembers = (0, _lodash.uniqBy)(summaryMembers.filter(member => {
      if (!member?.getMxcAvatarUrl) {
        _logger.logger.error("EventListSummary given null summaryMember, termites may be afoot eating event senders", summaryMembers);

        return false;
      }

      return true;
    }), member => member.getMxcAvatarUrl());
    const avatars = uniqueMembers.map(m => /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
      key: m.userId,
      member: m,
      width: 14,
      height: 14
    }));
    body = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EventTile_line"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EventTile_info"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_GenericEventListSummary_avatars",
      onClick: toggleExpanded
    }, avatars), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_TextualEvent mx_GenericEventListSummary_summary"
    }, summaryText)));
  }

  return /*#__PURE__*/_react.default.createElement("li", {
    className: "mx_GenericEventListSummary",
    "data-scroll-tokens": eventIds,
    "data-expanded": expanded + "",
    "data-layout": layout,
    "data-testid": testId
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link_inline",
    className: "mx_GenericEventListSummary_toggle",
    onClick: toggleExpanded,
    "aria-expanded": expanded
  }, expanded ? (0, _languageHandler._t)('collapse') : (0, _languageHandler._t)('expand')), body);
};

var _default = GenericEventListSummary;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHZW5lcmljRXZlbnRMaXN0U3VtbWFyeSIsImV2ZW50cyIsImNoaWxkcmVuIiwidGhyZXNob2xkIiwib25Ub2dnbGUiLCJzdGFydEV4cGFuZGVkIiwic3VtbWFyeU1lbWJlcnMiLCJzdW1tYXJ5VGV4dCIsImxheW91dCIsIkxheW91dCIsIkdyb3VwIiwidGVzdElkIiwiZXhwYW5kZWQiLCJ0b2dnbGVFeHBhbmRlZCIsInVzZVN0YXRlVG9nZ2xlIiwidXNlRWZmZWN0IiwiZXZlbnRJZHMiLCJtYXAiLCJlIiwiZ2V0SWQiLCJqb2luIiwibGVuZ3RoIiwiYm9keSIsInVuaXF1ZU1lbWJlcnMiLCJ1bmlxQnkiLCJmaWx0ZXIiLCJtZW1iZXIiLCJnZXRNeGNBdmF0YXJVcmwiLCJsb2dnZXIiLCJlcnJvciIsImF2YXRhcnMiLCJtIiwidXNlcklkIiwiX3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9HZW5lcmljRXZlbnRMaXN0U3VtbWFyeS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdW5pcUJ5IH0gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgTWVtYmVyQXZhdGFyIGZyb20gJy4uL2F2YXRhcnMvTWVtYmVyQXZhdGFyJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IHVzZVN0YXRlVG9nZ2xlIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVN0YXRlVG9nZ2xlXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgeyBMYXlvdXQgfSBmcm9tICcuLi8uLi8uLi9zZXR0aW5ncy9lbnVtcy9MYXlvdXQnO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyBBbiBhcnJheSBvZiBtZW1iZXIgZXZlbnRzIHRvIHN1bW1hcmlzZVxuICAgIGV2ZW50czogTWF0cml4RXZlbnRbXTtcbiAgICAvLyBUaGUgbWluaW11bSBudW1iZXIgb2YgZXZlbnRzIG5lZWRlZCB0byB0cmlnZ2VyIHN1bW1hcmlzYXRpb25cbiAgICB0aHJlc2hvbGQ/OiBudW1iZXI7XG4gICAgLy8gV2hldGhlciBvciBub3QgdG8gYmVnaW4gd2l0aCBzdGF0ZS5leHBhbmRlZD10cnVlXG4gICAgc3RhcnRFeHBhbmRlZD86IGJvb2xlYW47XG4gICAgLy8gVGhlIGxpc3Qgb2Ygcm9vbSBtZW1iZXJzIGZvciB3aGljaCB0byBzaG93IGF2YXRhcnMgbmV4dCB0byB0aGUgc3VtbWFyeVxuICAgIHN1bW1hcnlNZW1iZXJzPzogUm9vbU1lbWJlcltdO1xuICAgIC8vIFRoZSB0ZXh0IHRvIHNob3cgYXMgdGhlIHN1bW1hcnkgb2YgdGhpcyBldmVudCBsaXN0XG4gICAgc3VtbWFyeVRleHQ/OiBzdHJpbmcgfCBKU1guRWxlbWVudDtcbiAgICAvLyBBbiBhcnJheSBvZiBFdmVudFRpbGVzIHRvIHJlbmRlciB3aGVuIGV4cGFuZGVkXG4gICAgY2hpbGRyZW46IFJlYWN0Tm9kZVtdO1xuICAgIC8vIENhbGxlZCB3aGVuIHRoZSBldmVudCBsaXN0IGV4cGFuc2lvbiBpcyB0b2dnbGVkXG4gICAgb25Ub2dnbGU/KCk6IHZvaWQ7XG4gICAgLy8gVGhlIGxheW91dCBjdXJyZW50bHkgdXNlZFxuICAgIGxheW91dD86IExheW91dDtcbiAgICAnZGF0YS10ZXN0aWQnPzogc3RyaW5nO1xufVxuXG5jb25zdCBHZW5lcmljRXZlbnRMaXN0U3VtbWFyeTogUmVhY3QuRkM8SVByb3BzPiA9ICh7XG4gICAgZXZlbnRzLFxuICAgIGNoaWxkcmVuLFxuICAgIHRocmVzaG9sZCA9IDMsXG4gICAgb25Ub2dnbGUsXG4gICAgc3RhcnRFeHBhbmRlZCA9IGZhbHNlLFxuICAgIHN1bW1hcnlNZW1iZXJzID0gW10sXG4gICAgc3VtbWFyeVRleHQsXG4gICAgbGF5b3V0ID0gTGF5b3V0Lkdyb3VwLFxuICAgICdkYXRhLXRlc3RpZCc6IHRlc3RJZCxcbn0pID0+IHtcbiAgICBjb25zdCBbZXhwYW5kZWQsIHRvZ2dsZUV4cGFuZGVkXSA9IHVzZVN0YXRlVG9nZ2xlKHN0YXJ0RXhwYW5kZWQpO1xuXG4gICAgLy8gV2hlbmV2ZXIgZXhwYW5kZWQgY2hhbmdlcyBjYWxsIG9uVG9nZ2xlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKG9uVG9nZ2xlKSB7XG4gICAgICAgICAgICBvblRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfSwgW2V4cGFuZGVkXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgICBjb25zdCBldmVudElkcyA9IGV2ZW50cy5tYXAoKGUpID0+IGUuZ2V0SWQoKSkuam9pbignLCcpO1xuXG4gICAgLy8gSWYgd2UgYXJlIG9ubHkgZ2l2ZW4gZmV3IGV2ZW50cyB0aGVuIGp1c3QgcGFzcyB0aGVtIHRocm91Z2hcbiAgICBpZiAoZXZlbnRzLmxlbmd0aCA8IHRocmVzaG9sZCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIm14X0dlbmVyaWNFdmVudExpc3RTdW1tYXJ5XCIgZGF0YS1zY3JvbGwtdG9rZW5zPXtldmVudElkc30gZGF0YS1leHBhbmRlZD17dHJ1ZX0gZGF0YS1sYXlvdXQ9e2xheW91dH0+XG4gICAgICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIm14X0dlbmVyaWNFdmVudExpc3RTdW1tYXJ5X3Vuc3R5bGVkTGlzdFwiPlxuICAgICAgICAgICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgICAgICA8L29sPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgYm9keTtcbiAgICBpZiAoZXhwYW5kZWQpIHtcbiAgICAgICAgYm9keSA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR2VuZXJpY0V2ZW50TGlzdFN1bW1hcnlfbGluZVwiPiZuYnNwOzwvZGl2PlxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIm14X0dlbmVyaWNFdmVudExpc3RTdW1tYXJ5X3Vuc3R5bGVkTGlzdFwiPlxuICAgICAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgdW5pcXVlTWVtYmVycyA9IHVuaXFCeShzdW1tYXJ5TWVtYmVycy5maWx0ZXIobWVtYmVyID0+IHtcbiAgICAgICAgICAgIGlmICghbWVtYmVyPy5nZXRNeGNBdmF0YXJVcmwpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFdmVudExpc3RTdW1tYXJ5IGdpdmVuIG51bGwgc3VtbWFyeU1lbWJlciwgdGVybWl0ZXMgbWF5IGJlIGFmb290IGVhdGluZyBldmVudCBzZW5kZXJzXCIsXG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnlNZW1iZXJzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSksIG1lbWJlciA9PiBtZW1iZXIuZ2V0TXhjQXZhdGFyVXJsKCkpO1xuICAgICAgICBjb25zdCBhdmF0YXJzID0gdW5pcXVlTWVtYmVycy5tYXAoKG0pID0+IDxNZW1iZXJBdmF0YXIga2V5PXttLnVzZXJJZH0gbWVtYmVyPXttfSB3aWR0aD17MTR9IGhlaWdodD17MTR9IC8+KTtcbiAgICAgICAgYm9keSA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2xpbmVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0dlbmVyaWNFdmVudExpc3RTdW1tYXJ5X2F2YXRhcnNcIiBvbkNsaWNrPXt0b2dnbGVFeHBhbmRlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGF2YXRhcnMgfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1RleHR1YWxFdmVudCBteF9HZW5lcmljRXZlbnRMaXN0U3VtbWFyeV9zdW1tYXJ5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN1bW1hcnlUZXh0IH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGxpXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9HZW5lcmljRXZlbnRMaXN0U3VtbWFyeVwiXG4gICAgICAgICAgICBkYXRhLXNjcm9sbC10b2tlbnM9e2V2ZW50SWRzfVxuICAgICAgICAgICAgZGF0YS1leHBhbmRlZD17ZXhwYW5kZWQgKyBcIlwifVxuICAgICAgICAgICAgZGF0YS1sYXlvdXQ9e2xheW91dH1cbiAgICAgICAgICAgIGRhdGEtdGVzdGlkPXt0ZXN0SWR9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAga2luZD1cImxpbmtfaW5saW5lXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9HZW5lcmljRXZlbnRMaXN0U3VtbWFyeV90b2dnbGVcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUV4cGFuZGVkfVxuICAgICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e2V4cGFuZGVkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgZXhwYW5kZWQgPyBfdCgnY29sbGFwc2UnKSA6IF90KCdleHBhbmQnKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICA8L2xpPlxuICAgICk7XG59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