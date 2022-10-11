"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _location = require("../../../../res/img/element-icons/location.svg");

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

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

/**
 * Wrap with tooltip handlers when
 * tooltip is truthy
 */
const OptionalTooltip = _ref => {
  let {
    tooltip,
    children
  } = _ref;
  const [isVisible, setIsVisible] = (0, _react.useState)(false);

  if (!tooltip) {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, children);
  }

  const show = () => setIsVisible(true);

  const hide = () => setIsVisible(false);

  const toggleVisibility = e => {
    // stop map from zooming in on click
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    onMouseEnter: show,
    onClick: toggleVisibility,
    onMouseLeave: hide
  }, children, isVisible && tooltip);
};
/**
 * Generic location marker
 */


const Marker = /*#__PURE__*/_react.default.forwardRef((_ref2, ref) => {
  let {
    id,
    roomMember,
    useMemberColor,
    tooltip
  } = _ref2;
  const memberColorClass = useMemberColor && roomMember ? (0, _FormattingUtils.getUserNameColorClass)(roomMember.userId) : '';
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: ref,
    id: id,
    className: (0, _classnames.default)("mx_Marker", memberColorClass, {
      "mx_Marker_defaultColor": !memberColorClass
    })
  }, /*#__PURE__*/_react.default.createElement(OptionalTooltip, {
    tooltip: tooltip
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Marker_border"
  }, roomMember ? /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
    member: roomMember,
    width: 36,
    height: 36,
    viewUserOnClick: false // no mxid on hover when marker has tooltip
    ,
    hideTitle: !!tooltip
  }) : /*#__PURE__*/_react.default.createElement(_location.Icon, {
    className: "mx_Marker_icon"
  }))));
});

var _default = Marker;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPcHRpb25hbFRvb2x0aXAiLCJ0b29sdGlwIiwiY2hpbGRyZW4iLCJpc1Zpc2libGUiLCJzZXRJc1Zpc2libGUiLCJ1c2VTdGF0ZSIsInNob3ciLCJoaWRlIiwidG9nZ2xlVmlzaWJpbGl0eSIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJNYXJrZXIiLCJSZWFjdCIsImZvcndhcmRSZWYiLCJyZWYiLCJpZCIsInJvb21NZW1iZXIiLCJ1c2VNZW1iZXJDb2xvciIsIm1lbWJlckNvbG9yQ2xhc3MiLCJnZXRVc2VyTmFtZUNvbG9yQ2xhc3MiLCJ1c2VySWQiLCJjbGFzc05hbWVzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbG9jYXRpb24vTWFya2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5cbmltcG9ydCB7IEljb24gYXMgTG9jYXRpb25JY29uIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGVtZW50LWljb25zL2xvY2F0aW9uLnN2Zyc7XG5pbXBvcnQgeyBnZXRVc2VyTmFtZUNvbG9yQ2xhc3MgfSBmcm9tICcuLi8uLi8uLi91dGlscy9Gb3JtYXR0aW5nVXRpbHMnO1xuaW1wb3J0IE1lbWJlckF2YXRhciBmcm9tICcuLi9hdmF0YXJzL01lbWJlckF2YXRhcic7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgaWQ/OiBzdHJpbmc7XG4gICAgLy8gcmVuZGVycyBNZW1iZXJBdmF0YXIgd2hlbiBwcm92aWRlZFxuICAgIHJvb21NZW1iZXI/OiBSb29tTWVtYmVyO1xuICAgIC8vIHVzZSBtZW1iZXIgdGV4dCBjb2xvciBhcyBiYWNrZ3JvdW5kXG4gICAgdXNlTWVtYmVyQ29sb3I/OiBib29sZWFuO1xuICAgIHRvb2x0aXA/OiBSZWFjdE5vZGU7XG59XG5cbi8qKlxuICogV3JhcCB3aXRoIHRvb2x0aXAgaGFuZGxlcnMgd2hlblxuICogdG9vbHRpcCBpcyB0cnV0aHlcbiAqL1xuY29uc3QgT3B0aW9uYWxUb29sdGlwOiBSZWFjdC5GQzx7XG4gICAgdG9vbHRpcD86IFJlYWN0Tm9kZTsgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn0+ID0gKHsgdG9vbHRpcCwgY2hpbGRyZW4gfSkgPT4ge1xuICAgIGNvbnN0IFtpc1Zpc2libGUsIHNldElzVmlzaWJsZV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgaWYgKCF0b29sdGlwKSB7XG4gICAgICAgIHJldHVybiA8PnsgY2hpbGRyZW4gfTwvPjtcbiAgICB9XG5cbiAgICBjb25zdCBzaG93ID0gKCkgPT4gc2V0SXNWaXNpYmxlKHRydWUpO1xuICAgIGNvbnN0IGhpZGUgPSAoKSA9PiBzZXRJc1Zpc2libGUoZmFsc2UpO1xuICAgIGNvbnN0IHRvZ2dsZVZpc2liaWxpdHkgPSAoZTogUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudCwgTW91c2VFdmVudD4pID0+IHtcbiAgICAgICAgLy8gc3RvcCBtYXAgZnJvbSB6b29taW5nIGluIG9uIGNsaWNrXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNldElzVmlzaWJsZSghaXNWaXNpYmxlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIDxkaXYgb25Nb3VzZUVudGVyPXtzaG93fSBvbkNsaWNrPXt0b2dnbGVWaXNpYmlsaXR5fSBvbk1vdXNlTGVhdmU9e2hpZGV9PlxuICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgeyBpc1Zpc2libGUgJiYgdG9vbHRpcCB9XG4gICAgPC9kaXY+O1xufTtcblxuLyoqXG4gKiBHZW5lcmljIGxvY2F0aW9uIG1hcmtlclxuICovXG5jb25zdCBNYXJrZXIgPSBSZWFjdC5mb3J3YXJkUmVmPEhUTUxEaXZFbGVtZW50LCBQcm9wcz4oKHsgaWQsIHJvb21NZW1iZXIsIHVzZU1lbWJlckNvbG9yLCB0b29sdGlwIH0sIHJlZikgPT4ge1xuICAgIGNvbnN0IG1lbWJlckNvbG9yQ2xhc3MgPSB1c2VNZW1iZXJDb2xvciAmJiByb29tTWVtYmVyID8gZ2V0VXNlck5hbWVDb2xvckNsYXNzKHJvb21NZW1iZXIudXNlcklkKSA6ICcnO1xuICAgIHJldHVybiA8ZGl2XG4gICAgICAgIHJlZj17cmVmfVxuICAgICAgICBpZD17aWR9XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X01hcmtlclwiLCBtZW1iZXJDb2xvckNsYXNzLCB7XG4gICAgICAgICAgICBcIm14X01hcmtlcl9kZWZhdWx0Q29sb3JcIjogIW1lbWJlckNvbG9yQ2xhc3MsXG4gICAgICAgIH0pfVxuICAgID5cbiAgICAgICAgPE9wdGlvbmFsVG9vbHRpcCB0b29sdGlwPXt0b29sdGlwfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWFya2VyX2JvcmRlclwiPlxuICAgICAgICAgICAgICAgIHsgcm9vbU1lbWJlciA/XG4gICAgICAgICAgICAgICAgICAgIDxNZW1iZXJBdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcj17cm9vbU1lbWJlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXszNn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD17MzZ9XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3VXNlck9uQ2xpY2s9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm8gbXhpZCBvbiBob3ZlciB3aGVuIG1hcmtlciBoYXMgdG9vbHRpcFxuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZVRpdGxlPXshIXRvb2x0aXB9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDogPExvY2F0aW9uSWNvbiBjbGFzc05hbWU9XCJteF9NYXJrZXJfaWNvblwiIC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvT3B0aW9uYWxUb29sdGlwPlxuICAgIDwvZGl2Pjtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBNYXJrZXI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7Ozs7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxlQUVKLEdBQUcsUUFBMkI7RUFBQSxJQUExQjtJQUFFQyxPQUFGO0lBQVdDO0VBQVgsQ0FBMEI7RUFDNUIsTUFBTSxDQUFDQyxTQUFELEVBQVlDLFlBQVosSUFBNEIsSUFBQUMsZUFBQSxFQUFTLEtBQVQsQ0FBbEM7O0VBQ0EsSUFBSSxDQUFDSixPQUFMLEVBQWM7SUFDVixvQkFBTyw0REFBSUMsUUFBSixDQUFQO0VBQ0g7O0VBRUQsTUFBTUksSUFBSSxHQUFHLE1BQU1GLFlBQVksQ0FBQyxJQUFELENBQS9COztFQUNBLE1BQU1HLElBQUksR0FBRyxNQUFNSCxZQUFZLENBQUMsS0FBRCxDQUEvQjs7RUFDQSxNQUFNSSxnQkFBZ0IsR0FBSUMsQ0FBRCxJQUFxRDtJQUMxRTtJQUNBQSxDQUFDLENBQUNDLGVBQUY7SUFDQU4sWUFBWSxDQUFDLENBQUNELFNBQUYsQ0FBWjtFQUNILENBSkQ7O0VBTUEsb0JBQU87SUFBSyxZQUFZLEVBQUVHLElBQW5CO0lBQXlCLE9BQU8sRUFBRUUsZ0JBQWxDO0lBQW9ELFlBQVksRUFBRUQ7RUFBbEUsR0FDREwsUUFEQyxFQUVEQyxTQUFTLElBQUlGLE9BRlosQ0FBUDtBQUlILENBcEJEO0FBc0JBO0FBQ0E7QUFDQTs7O0FBQ0EsTUFBTVUsTUFBTSxnQkFBR0MsY0FBQSxDQUFNQyxVQUFOLENBQXdDLFFBQThDQyxHQUE5QyxLQUFzRDtFQUFBLElBQXJEO0lBQUVDLEVBQUY7SUFBTUMsVUFBTjtJQUFrQkMsY0FBbEI7SUFBa0NoQjtFQUFsQyxDQUFxRDtFQUN6RyxNQUFNaUIsZ0JBQWdCLEdBQUdELGNBQWMsSUFBSUQsVUFBbEIsR0FBK0IsSUFBQUcsc0NBQUEsRUFBc0JILFVBQVUsQ0FBQ0ksTUFBakMsQ0FBL0IsR0FBMEUsRUFBbkc7RUFDQSxvQkFBTztJQUNILEdBQUcsRUFBRU4sR0FERjtJQUVILEVBQUUsRUFBRUMsRUFGRDtJQUdILFNBQVMsRUFBRSxJQUFBTSxtQkFBQSxFQUFXLFdBQVgsRUFBd0JILGdCQUF4QixFQUEwQztNQUNqRCwwQkFBMEIsQ0FBQ0E7SUFEc0IsQ0FBMUM7RUFIUixnQkFPSCw2QkFBQyxlQUFEO0lBQWlCLE9BQU8sRUFBRWpCO0VBQTFCLGdCQUNJO0lBQUssU0FBUyxFQUFDO0VBQWYsR0FDTWUsVUFBVSxnQkFDUiw2QkFBQyxxQkFBRDtJQUNJLE1BQU0sRUFBRUEsVUFEWjtJQUVJLEtBQUssRUFBRSxFQUZYO0lBR0ksTUFBTSxFQUFFLEVBSFo7SUFJSSxlQUFlLEVBQUUsS0FKckIsQ0FLSTtJQUxKO0lBTUksU0FBUyxFQUFFLENBQUMsQ0FBQ2Y7RUFOakIsRUFEUSxnQkFTTiw2QkFBQyxjQUFEO0lBQWMsU0FBUyxFQUFDO0VBQXhCLEVBVlYsQ0FESixDQVBHLENBQVA7QUF1QkgsQ0F6QmMsQ0FBZjs7ZUEyQmVVLE0ifQ==