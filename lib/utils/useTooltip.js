"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTooltip = useTooltip;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _Tooltip = _interopRequireDefault(require("../components/views/elements/Tooltip"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
function useTooltip(props) {
  const [isVisible, setIsVisible] = (0, _react.useState)(false);

  const showTooltip = () => setIsVisible(true);

  const hideTooltip = () => setIsVisible(false); // No need to fill up the DOM with hidden tooltip elements. Only add the
  // tooltip when we're hovering over the item (performance)


  const tooltip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, (0, _extends2.default)({}, props, {
    visible: isVisible
  }));

  return [{
    showTooltip,
    hideTooltip
  }, tooltip];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VUb29sdGlwIiwicHJvcHMiLCJpc1Zpc2libGUiLCJzZXRJc1Zpc2libGUiLCJ1c2VTdGF0ZSIsInNob3dUb29sdGlwIiwiaGlkZVRvb2x0aXAiLCJ0b29sdGlwIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3VzZVRvb2x0aXAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnRQcm9wcywgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IFRvb2x0aXAgZnJvbSBcIi4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvVG9vbHRpcFwiO1xuXG5pbnRlcmZhY2UgVG9vbHRpcEV2ZW50cyB7XG4gICAgc2hvd1Rvb2x0aXA6ICgpID0+IHZvaWQ7XG4gICAgaGlkZVRvb2x0aXA6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VUb29sdGlwKHByb3BzOiBDb21wb25lbnRQcm9wczx0eXBlb2YgVG9vbHRpcD4pOiBbVG9vbHRpcEV2ZW50cywgSlNYLkVsZW1lbnQgfCBudWxsXSB7XG4gICAgY29uc3QgW2lzVmlzaWJsZSwgc2V0SXNWaXNpYmxlXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGNvbnN0IHNob3dUb29sdGlwID0gKCkgPT4gc2V0SXNWaXNpYmxlKHRydWUpO1xuICAgIGNvbnN0IGhpZGVUb29sdGlwID0gKCkgPT4gc2V0SXNWaXNpYmxlKGZhbHNlKTtcblxuICAgIC8vIE5vIG5lZWQgdG8gZmlsbCB1cCB0aGUgRE9NIHdpdGggaGlkZGVuIHRvb2x0aXAgZWxlbWVudHMuIE9ubHkgYWRkIHRoZVxuICAgIC8vIHRvb2x0aXAgd2hlbiB3ZSdyZSBob3ZlcmluZyBvdmVyIHRoZSBpdGVtIChwZXJmb3JtYW5jZSlcbiAgICBjb25zdCB0b29sdGlwID0gPFRvb2x0aXBcbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgICB2aXNpYmxlPXtpc1Zpc2libGV9XG4gICAgLz47XG5cbiAgICByZXR1cm4gW3sgc2hvd1Rvb2x0aXAsIGhpZGVUb29sdGlwIH0sIHRvb2x0aXBdO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7Ozs7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVdPLFNBQVNBLFVBQVQsQ0FBb0JDLEtBQXBCLEVBQWdHO0VBQ25HLE1BQU0sQ0FBQ0MsU0FBRCxFQUFZQyxZQUFaLElBQTRCLElBQUFDLGVBQUEsRUFBUyxLQUFULENBQWxDOztFQUVBLE1BQU1DLFdBQVcsR0FBRyxNQUFNRixZQUFZLENBQUMsSUFBRCxDQUF0Qzs7RUFDQSxNQUFNRyxXQUFXLEdBQUcsTUFBTUgsWUFBWSxDQUFDLEtBQUQsQ0FBdEMsQ0FKbUcsQ0FNbkc7RUFDQTs7O0VBQ0EsTUFBTUksT0FBTyxnQkFBRyw2QkFBQyxnQkFBRCw2QkFDUk4sS0FEUTtJQUVaLE9BQU8sRUFBRUM7RUFGRyxHQUFoQjs7RUFLQSxPQUFPLENBQUM7SUFBRUcsV0FBRjtJQUFlQztFQUFmLENBQUQsRUFBK0JDLE9BQS9CLENBQVA7QUFDSCJ9