"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withMatrixClientHOC = exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

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
const MatrixClientContext = /*#__PURE__*/(0, _react.createContext)(undefined);
MatrixClientContext.displayName = "MatrixClientContext";
var _default = MatrixClientContext;
exports.default = _default;

const matrixHOC = ComposedComponent => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const TypedComponent = ComposedComponent;
  return /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
    const client = (0, _react.useContext)(MatrixClientContext); // @ts-ignore

    return /*#__PURE__*/_react.default.createElement(TypedComponent, (0, _extends2.default)({
      ref: ref
    }, props, {
      mxClient: client
    }));
  });
};

const withMatrixClientHOC = matrixHOC;
exports.withMatrixClientHOC = withMatrixClientHOC;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXhDbGllbnRDb250ZXh0IiwiY3JlYXRlQ29udGV4dCIsInVuZGVmaW5lZCIsImRpc3BsYXlOYW1lIiwibWF0cml4SE9DIiwiQ29tcG9zZWRDb21wb25lbnQiLCJUeXBlZENvbXBvbmVudCIsImZvcndhcmRSZWYiLCJwcm9wcyIsInJlZiIsImNsaWVudCIsInVzZUNvbnRleHQiLCJ3aXRoTWF0cml4Q2xpZW50SE9DIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnRDbGFzcywgY3JlYXRlQ29udGV4dCwgZm9yd2FyZFJlZiwgdXNlQ29udGV4dCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuXG5jb25zdCBNYXRyaXhDbGllbnRDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxNYXRyaXhDbGllbnQ+KHVuZGVmaW5lZCk7XG5NYXRyaXhDbGllbnRDb250ZXh0LmRpc3BsYXlOYW1lID0gXCJNYXRyaXhDbGllbnRDb250ZXh0XCI7XG5leHBvcnQgZGVmYXVsdCBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG5leHBvcnQgaW50ZXJmYWNlIE1hdHJpeENsaWVudFByb3BzIHtcbiAgICBteENsaWVudDogTWF0cml4Q2xpZW50O1xufVxuXG5jb25zdCBtYXRyaXhIT0MgPSA8Q29tcG9zZWRDb21wb25lbnRQcm9wcyBleHRlbmRzIHt9PihcbiAgICBDb21wb3NlZENvbXBvbmVudDogQ29tcG9uZW50Q2xhc3M8Q29tcG9zZWRDb21wb25lbnRQcm9wcz4sXG4pID0+IHtcbiAgICB0eXBlIENvbXBvc2VkQ29tcG9uZW50SW5zdGFuY2UgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIENvbXBvc2VkQ29tcG9uZW50PjtcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9ydWxlcy1vZi1ob29rc1xuXG4gICAgY29uc3QgVHlwZWRDb21wb25lbnQgPSBDb21wb3NlZENvbXBvbmVudDtcblxuICAgIHJldHVybiBmb3J3YXJkUmVmPENvbXBvc2VkQ29tcG9uZW50SW5zdGFuY2UsIE9taXQ8Q29tcG9zZWRDb21wb25lbnRQcm9wcywgJ214Q2xpZW50Jz4+KFxuICAgICAgICAocHJvcHMsIHJlZikgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIDxUeXBlZENvbXBvbmVudCByZWY9e3JlZn0gey4uLnByb3BzfSBteENsaWVudD17Y2xpZW50fSAvPjtcbiAgICAgICAgfSxcbiAgICApO1xufTtcbmV4cG9ydCBjb25zdCB3aXRoTWF0cml4Q2xpZW50SE9DID0gbWF0cml4SE9DO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7Ozs7O0FBaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUtBLE1BQU1BLG1CQUFtQixnQkFBRyxJQUFBQyxvQkFBQSxFQUE0QkMsU0FBNUIsQ0FBNUI7QUFDQUYsbUJBQW1CLENBQUNHLFdBQXBCLEdBQWtDLHFCQUFsQztlQUNlSCxtQjs7O0FBTWYsTUFBTUksU0FBUyxHQUNYQyxpQkFEYyxJQUViO0VBR0Q7RUFFQSxNQUFNQyxjQUFjLEdBQUdELGlCQUF2QjtFQUVBLG9CQUFPLElBQUFFLGlCQUFBLEVBQ0gsQ0FBQ0MsS0FBRCxFQUFRQyxHQUFSLEtBQWdCO0lBQ1osTUFBTUMsTUFBTSxHQUFHLElBQUFDLGlCQUFBLEVBQVdYLG1CQUFYLENBQWYsQ0FEWSxDQUdaOztJQUNBLG9CQUFPLDZCQUFDLGNBQUQ7TUFBZ0IsR0FBRyxFQUFFUztJQUFyQixHQUE4QkQsS0FBOUI7TUFBcUMsUUFBUSxFQUFFRTtJQUEvQyxHQUFQO0VBQ0gsQ0FORSxDQUFQO0FBUUgsQ0FqQkQ7O0FBa0JPLE1BQU1FLG1CQUFtQixHQUFHUixTQUE1QiJ9