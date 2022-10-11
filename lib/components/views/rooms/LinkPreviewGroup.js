"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _useStateToggle = require("../../../hooks/useStateToggle");

var _LinkPreviewWidget = _interopRequireDefault(require("./LinkPreviewWidget"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useAsyncMemo = require("../../../hooks/useAsyncMemo");

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
const INITIAL_NUM_PREVIEWS = 2;

const LinkPreviewGroup = _ref => {
  let {
    links,
    mxEvent,
    onCancelClick,
    onHeightChanged
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [expanded, toggleExpanded] = (0, _useStateToggle.useStateToggle)();
  const ts = mxEvent.getTs();
  const previews = (0, _useAsyncMemo.useAsyncMemo)(async () => {
    return fetchPreviews(cli, links, ts);
  }, [links, ts], []);
  (0, _react.useEffect)(() => {
    onHeightChanged();
  }, [onHeightChanged, expanded, previews]);
  const showPreviews = expanded ? previews : previews.slice(0, INITIAL_NUM_PREVIEWS);
  let toggleButton;

  if (previews.length > INITIAL_NUM_PREVIEWS) {
    toggleButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: toggleExpanded
    }, expanded ? (0, _languageHandler._t)("Collapse") : (0, _languageHandler._t)("Show %(count)s other previews", {
      count: previews.length - showPreviews.length
    }));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_LinkPreviewGroup"
  }, showPreviews.map((_ref2, i) => {
    let [link, preview] = _ref2;
    return /*#__PURE__*/_react.default.createElement(_LinkPreviewWidget.default, {
      key: link,
      link: link,
      preview: preview,
      mxEvent: mxEvent
    }, i === 0 ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_LinkPreviewGroup_hide",
      onClick: onCancelClick,
      "aria-label": (0, _languageHandler._t)("Close preview")
    }, /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_filterFlipColor",
      alt: "",
      role: "presentation",
      src: require("../../../../res/img/cancel.svg").default,
      width: "18",
      height: "18"
    })) : undefined);
  }), toggleButton);
};

const fetchPreviews = (cli, links, ts) => {
  return Promise.all(links.map(async link => {
    try {
      const preview = await cli.getUrlPreview(link, ts);

      if (preview && Object.keys(preview).length > 0) {
        return [link, preview];
      }
    } catch (error) {
      _logger.logger.error("Failed to get URL preview: " + error);
    }
  })).then(a => a.filter(Boolean));
};

var _default = LinkPreviewGroup;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJTklUSUFMX05VTV9QUkVWSUVXUyIsIkxpbmtQcmV2aWV3R3JvdXAiLCJsaW5rcyIsIm14RXZlbnQiLCJvbkNhbmNlbENsaWNrIiwib25IZWlnaHRDaGFuZ2VkIiwiY2xpIiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJleHBhbmRlZCIsInRvZ2dsZUV4cGFuZGVkIiwidXNlU3RhdGVUb2dnbGUiLCJ0cyIsImdldFRzIiwicHJldmlld3MiLCJ1c2VBc3luY01lbW8iLCJmZXRjaFByZXZpZXdzIiwidXNlRWZmZWN0Iiwic2hvd1ByZXZpZXdzIiwic2xpY2UiLCJ0b2dnbGVCdXR0b24iLCJsZW5ndGgiLCJfdCIsImNvdW50IiwibWFwIiwiaSIsImxpbmsiLCJwcmV2aWV3IiwicmVxdWlyZSIsImRlZmF1bHQiLCJ1bmRlZmluZWQiLCJQcm9taXNlIiwiYWxsIiwiZ2V0VXJsUHJldmlldyIsIk9iamVjdCIsImtleXMiLCJlcnJvciIsImxvZ2dlciIsInRoZW4iLCJhIiwiZmlsdGVyIiwiQm9vbGVhbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0xpbmtQcmV2aWV3R3JvdXAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0LCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgSVByZXZpZXdVcmxSZXNwb25zZSwgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyB1c2VTdGF0ZVRvZ2dsZSB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VTdGF0ZVRvZ2dsZVwiO1xuaW1wb3J0IExpbmtQcmV2aWV3V2lkZ2V0IGZyb20gXCIuL0xpbmtQcmV2aWV3V2lkZ2V0XCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHsgdXNlQXN5bmNNZW1vIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUFzeW5jTWVtb1wiO1xuXG5jb25zdCBJTklUSUFMX05VTV9QUkVWSUVXUyA9IDI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGxpbmtzOiBzdHJpbmdbXTsgLy8gdGhlIFVSTHMgdG8gYmUgcHJldmlld2VkXG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7IC8vIHRoZSBFdmVudCBhc3NvY2lhdGVkIHdpdGggdGhlIHByZXZpZXdcbiAgICBvbkNhbmNlbENsaWNrKCk6IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHRoZSBwcmV2aWV3J3MgY2FuY2VsICgnaGlkZScpIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgb25IZWlnaHRDaGFuZ2VkKCk6IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHRoZSBwcmV2aWV3J3MgY29udGVudHMgaGFzIGxvYWRlZFxufVxuXG5jb25zdCBMaW5rUHJldmlld0dyb3VwOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgbGlua3MsIG14RXZlbnQsIG9uQ2FuY2VsQ2xpY2ssIG9uSGVpZ2h0Q2hhbmdlZCB9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCBbZXhwYW5kZWQsIHRvZ2dsZUV4cGFuZGVkXSA9IHVzZVN0YXRlVG9nZ2xlKCk7XG5cbiAgICBjb25zdCB0cyA9IG14RXZlbnQuZ2V0VHMoKTtcbiAgICBjb25zdCBwcmV2aWV3cyA9IHVzZUFzeW5jTWVtbzxbc3RyaW5nLCBJUHJldmlld1VybFJlc3BvbnNlXVtdPihhc3luYyAoKSA9PiB7XG4gICAgICAgIHJldHVybiBmZXRjaFByZXZpZXdzKGNsaSwgbGlua3MsIHRzKTtcbiAgICB9LCBbbGlua3MsIHRzXSwgW10pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgb25IZWlnaHRDaGFuZ2VkKCk7XG4gICAgfSwgW29uSGVpZ2h0Q2hhbmdlZCwgZXhwYW5kZWQsIHByZXZpZXdzXSk7XG5cbiAgICBjb25zdCBzaG93UHJldmlld3MgPSBleHBhbmRlZCA/IHByZXZpZXdzIDogcHJldmlld3Muc2xpY2UoMCwgSU5JVElBTF9OVU1fUFJFVklFV1MpO1xuXG4gICAgbGV0IHRvZ2dsZUJ1dHRvbjogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKHByZXZpZXdzLmxlbmd0aCA+IElOSVRJQUxfTlVNX1BSRVZJRVdTKSB7XG4gICAgICAgIHRvZ2dsZUJ1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RvZ2dsZUV4cGFuZGVkfT5cbiAgICAgICAgICAgIHsgZXhwYW5kZWRcbiAgICAgICAgICAgICAgICA/IF90KFwiQ29sbGFwc2VcIilcbiAgICAgICAgICAgICAgICA6IF90KFwiU2hvdyAlKGNvdW50KXMgb3RoZXIgcHJldmlld3NcIiwgeyBjb3VudDogcHJldmlld3MubGVuZ3RoIC0gc2hvd1ByZXZpZXdzLmxlbmd0aCB9KSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfTGlua1ByZXZpZXdHcm91cFwiPlxuICAgICAgICB7IHNob3dQcmV2aWV3cy5tYXAoKFtsaW5rLCBwcmV2aWV3XSwgaSkgPT4gKFxuICAgICAgICAgICAgPExpbmtQcmV2aWV3V2lkZ2V0IGtleT17bGlua30gbGluaz17bGlua30gcHJldmlldz17cHJldmlld30gbXhFdmVudD17bXhFdmVudH0+XG4gICAgICAgICAgICAgICAgeyBpID09PSAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTGlua1ByZXZpZXdHcm91cF9oaWRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIkNsb3NlIHByZXZpZXdcIil9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9maWx0ZXJGbGlwQ29sb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdD1cIlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cInByZXNlbnRhdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9jYW5jZWwuc3ZnXCIpLmRlZmF1bHR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9XCIxOFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVwiMThcIlxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICk6IHVuZGVmaW5lZCB9XG4gICAgICAgICAgICA8L0xpbmtQcmV2aWV3V2lkZ2V0PlxuICAgICAgICApKSB9XG4gICAgICAgIHsgdG9nZ2xlQnV0dG9uIH1cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBmZXRjaFByZXZpZXdzID0gKGNsaTogTWF0cml4Q2xpZW50LCBsaW5rczogc3RyaW5nW10sIHRzOiBudW1iZXIpOlxuICAgICAgICBQcm9taXNlPFtzdHJpbmcsIElQcmV2aWV3VXJsUmVzcG9uc2VdW10+ID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGw8W3N0cmluZywgSVByZXZpZXdVcmxSZXNwb25zZV0gfCB2b2lkPihsaW5rcy5tYXAoYXN5bmMgbGluayA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aWV3ID0gYXdhaXQgY2xpLmdldFVybFByZXZpZXcobGluaywgdHMpO1xuICAgICAgICAgICAgaWYgKHByZXZpZXcgJiYgT2JqZWN0LmtleXMocHJldmlldykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbbGluaywgcHJldmlld107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gZ2V0IFVSTCBwcmV2aWV3OiBcIiArIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0pKS50aGVuKGEgPT4gYS5maWx0ZXIoQm9vbGVhbikpIGFzIFByb21pc2U8W3N0cmluZywgSVByZXZpZXdVcmxSZXNwb25zZV1bXT47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMaW5rUHJldmlld0dyb3VwO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFjQSxNQUFNQSxvQkFBb0IsR0FBRyxDQUE3Qjs7QUFTQSxNQUFNQyxnQkFBa0MsR0FBRyxRQUF3RDtFQUFBLElBQXZEO0lBQUVDLEtBQUY7SUFBU0MsT0FBVDtJQUFrQkMsYUFBbEI7SUFBaUNDO0VBQWpDLENBQXVEO0VBQy9GLE1BQU1DLEdBQUcsR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFaO0VBQ0EsTUFBTSxDQUFDQyxRQUFELEVBQVdDLGNBQVgsSUFBNkIsSUFBQUMsOEJBQUEsR0FBbkM7RUFFQSxNQUFNQyxFQUFFLEdBQUdULE9BQU8sQ0FBQ1UsS0FBUixFQUFYO0VBQ0EsTUFBTUMsUUFBUSxHQUFHLElBQUFDLDBCQUFBLEVBQThDLFlBQVk7SUFDdkUsT0FBT0MsYUFBYSxDQUFDVixHQUFELEVBQU1KLEtBQU4sRUFBYVUsRUFBYixDQUFwQjtFQUNILENBRmdCLEVBRWQsQ0FBQ1YsS0FBRCxFQUFRVSxFQUFSLENBRmMsRUFFRCxFQUZDLENBQWpCO0VBSUEsSUFBQUssZ0JBQUEsRUFBVSxNQUFNO0lBQ1paLGVBQWU7RUFD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