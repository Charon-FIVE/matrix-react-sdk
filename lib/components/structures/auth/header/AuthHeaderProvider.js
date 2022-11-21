"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthHeaderActionType = void 0;
exports.AuthHeaderProvider = AuthHeaderProvider;

var _lodash = require("lodash");

var _react = _interopRequireWildcard(require("react"));

var _AuthHeaderContext = require("./AuthHeaderContext");

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
let AuthHeaderActionType;
exports.AuthHeaderActionType = AuthHeaderActionType;

(function (AuthHeaderActionType) {
  AuthHeaderActionType[AuthHeaderActionType["Add"] = 0] = "Add";
  AuthHeaderActionType[AuthHeaderActionType["Remove"] = 1] = "Remove";
})(AuthHeaderActionType || (exports.AuthHeaderActionType = AuthHeaderActionType = {}));

function AuthHeaderProvider(_ref) {
  let {
    children
  } = _ref;
  const [state, dispatch] = (0, _react.useReducer)((state, action) => {
    switch (action.type) {
      case AuthHeaderActionType.Add:
        return [action.value, ...state];

      case AuthHeaderActionType.Remove:
        return state.length && (0, _lodash.isEqual)(state[0], action.value) ? state.slice(1) : state;
    }
  }, []);
  return /*#__PURE__*/_react.default.createElement(_AuthHeaderContext.AuthHeaderContext.Provider, {
    value: {
      state,
      dispatch
    }
  }, children);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdXRoSGVhZGVyQWN0aW9uVHlwZSIsIkF1dGhIZWFkZXJQcm92aWRlciIsImNoaWxkcmVuIiwic3RhdGUiLCJkaXNwYXRjaCIsInVzZVJlZHVjZXIiLCJhY3Rpb24iLCJ0eXBlIiwiQWRkIiwidmFsdWUiLCJSZW1vdmUiLCJsZW5ndGgiLCJpc0VxdWFsIiwic2xpY2UiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL2F1dGgvaGVhZGVyL0F1dGhIZWFkZXJQcm92aWRlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgaXNFcXVhbCB9IGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnRQcm9wcywgUHJvcHNXaXRoQ2hpbGRyZW4sIFJlZHVjZXIsIHVzZVJlZHVjZXIgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgQXV0aEhlYWRlckNvbnRleHQgfSBmcm9tIFwiLi9BdXRoSGVhZGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQXV0aEhlYWRlck1vZGlmaWVyIH0gZnJvbSBcIi4vQXV0aEhlYWRlck1vZGlmaWVyXCI7XG5cbmV4cG9ydCBlbnVtIEF1dGhIZWFkZXJBY3Rpb25UeXBlIHtcbiAgICBBZGQsXG4gICAgUmVtb3ZlXG59XG5cbmludGVyZmFjZSBBdXRoSGVhZGVyQWN0aW9uIHtcbiAgICB0eXBlOiBBdXRoSGVhZGVyQWN0aW9uVHlwZTtcbiAgICB2YWx1ZTogQ29tcG9uZW50UHJvcHM8dHlwZW9mIEF1dGhIZWFkZXJNb2RpZmllcj47XG59XG5cbmV4cG9ydCB0eXBlIEF1dGhIZWFkZXJSZWR1Y2VyID0gUmVkdWNlcjxDb21wb25lbnRQcm9wczx0eXBlb2YgQXV0aEhlYWRlck1vZGlmaWVyPltdLCBBdXRoSGVhZGVyQWN0aW9uPjtcblxuZXhwb3J0IGZ1bmN0aW9uIEF1dGhIZWFkZXJQcm92aWRlcih7IGNoaWxkcmVuIH06IFByb3BzV2l0aENoaWxkcmVuPHt9Pikge1xuICAgIGNvbnN0IFtzdGF0ZSwgZGlzcGF0Y2hdID0gdXNlUmVkdWNlcjxBdXRoSGVhZGVyUmVkdWNlcj4oXG4gICAgICAgIChzdGF0ZTogQ29tcG9uZW50UHJvcHM8dHlwZW9mIEF1dGhIZWFkZXJNb2RpZmllcj5bXSwgYWN0aW9uOiBBdXRoSGVhZGVyQWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBBdXRoSGVhZGVyQWN0aW9uVHlwZS5BZGQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbYWN0aW9uLnZhbHVlLCAuLi5zdGF0ZV07XG4gICAgICAgICAgICAgICAgY2FzZSBBdXRoSGVhZGVyQWN0aW9uVHlwZS5SZW1vdmU6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoc3RhdGUubGVuZ3RoICYmIGlzRXF1YWwoc3RhdGVbMF0sIGFjdGlvbi52YWx1ZSkpID8gc3RhdGUuc2xpY2UoMSkgOiBzdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgW10gYXMgQ29tcG9uZW50UHJvcHM8dHlwZW9mIEF1dGhIZWFkZXJNb2RpZmllcj5bXSxcbiAgICApO1xuICAgIHJldHVybiAoXG4gICAgICAgIDxBdXRoSGVhZGVyQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17eyBzdGF0ZSwgZGlzcGF0Y2ggfX0+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9BdXRoSGVhZGVyQ29udGV4dC5Qcm92aWRlcj5cbiAgICApO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7Ozs7O0FBbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQVFZQSxvQjs7O1dBQUFBLG9CO0VBQUFBLG9CLENBQUFBLG9CO0VBQUFBLG9CLENBQUFBLG9CO0dBQUFBLG9CLG9DQUFBQSxvQjs7QUFZTCxTQUFTQyxrQkFBVCxPQUFpRTtFQUFBLElBQXJDO0lBQUVDO0VBQUYsQ0FBcUM7RUFDcEUsTUFBTSxDQUFDQyxLQUFELEVBQVFDLFFBQVIsSUFBb0IsSUFBQUMsaUJBQUEsRUFDdEIsQ0FBQ0YsS0FBRCxFQUFxREcsTUFBckQsS0FBa0Y7SUFDOUUsUUFBUUEsTUFBTSxDQUFDQyxJQUFmO01BQ0ksS0FBS1Asb0JBQW9CLENBQUNRLEdBQTFCO1FBQ0ksT0FBTyxDQUFDRixNQUFNLENBQUNHLEtBQVIsRUFBZSxHQUFHTixLQUFsQixDQUFQOztNQUNKLEtBQUtILG9CQUFvQixDQUFDVSxNQUExQjtRQUNJLE9BQVFQLEtBQUssQ0FBQ1EsTUFBTixJQUFnQixJQUFBQyxlQUFBLEVBQVFULEtBQUssQ0FBQyxDQUFELENBQWIsRUFBa0JHLE1BQU0sQ0FBQ0csS0FBekIsQ0FBakIsR0FBb0ROLEtBQUssQ0FBQ1UsS0FBTixDQUFZLENBQVosQ0FBcEQsR0FBcUVWLEtBQTVFO0lBSlI7RUFNSCxDQVJxQixFQVN0QixFQVRzQixDQUExQjtFQVdBLG9CQUNJLDZCQUFDLG9DQUFELENBQW1CLFFBQW5CO0lBQTRCLEtBQUssRUFBRTtNQUFFQSxLQUFGO01BQVNDO0lBQVQ7RUFBbkMsR0FDTUYsUUFETixDQURKO0FBS0gifQ==