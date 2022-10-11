"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _location = require("../../../../res/img/element-icons/location.svg");

var _map = require("../../../../res/img/location/map.svg");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

const _excluded = ["className", "isLoading", "children"];

const MapFallback = _ref => {
  let {
    className,
    isLoading,
    children
  } = _ref,
      rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    className: (0, _classnames.default)('mx_MapFallback', className)
  }, rest), /*#__PURE__*/_react.default.createElement(_map.Icon, {
    className: "mx_MapFallback_bg"
  }), isLoading ? /*#__PURE__*/_react.default.createElement(_Spinner.default, {
    h: 32,
    w: 32
  }) : /*#__PURE__*/_react.default.createElement(_location.Icon, {
    className: "mx_MapFallback_icon"
  }), children);
};

var _default = MapFallback;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXBGYWxsYmFjayIsImNsYXNzTmFtZSIsImlzTG9hZGluZyIsImNoaWxkcmVuIiwicmVzdCIsImNsYXNzTmFtZXMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9sb2NhdGlvbi9NYXBGYWxsYmFjay50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQgeyBJY29uIGFzIExvY2F0aW9uTWFya2VySWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9sb2NhdGlvbi5zdmcnO1xuaW1wb3J0IHsgSWNvbiBhcyBNYXBGYWxsYmFja0ltYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzL2ltZy9sb2NhdGlvbi9tYXAuc3ZnJztcbmltcG9ydCBTcGlubmVyIGZyb20gJy4uL2VsZW1lbnRzL1NwaW5uZXInO1xuXG5pbnRlcmZhY2UgUHJvcHMgZXh0ZW5kcyBSZWFjdC5IVE1MQXR0cmlidXRlczxIVE1MRGl2RWxlbWVudD4ge1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBpc0xvYWRpbmc/OiBib29sZWFuO1xuICAgIGNoaWxkcmVuPzogUmVhY3QuUmVhY3ROb2RlIHwgUmVhY3QuUmVhY3ROb2RlQXJyYXk7XG59XG5cbmNvbnN0IE1hcEZhbGxiYWNrOiBSZWFjdC5GQzxQcm9wcz4gPSAoeyBjbGFzc05hbWUsIGlzTG9hZGluZywgY2hpbGRyZW4sIC4uLnJlc3QgfSkgPT4ge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcygnbXhfTWFwRmFsbGJhY2snLCBjbGFzc05hbWUpfSB7Li4ucmVzdH0+XG4gICAgICAgIDxNYXBGYWxsYmFja0ltYWdlIGNsYXNzTmFtZT0nbXhfTWFwRmFsbGJhY2tfYmcnIC8+XG4gICAgICAgIHsgaXNMb2FkaW5nID8gPFNwaW5uZXIgaD17MzJ9IHc9ezMyfSAvPiA6IDxMb2NhdGlvbk1hcmtlckljb24gY2xhc3NOYW1lPSdteF9NYXBGYWxsYmFja19pY29uJyAvPiB9XG4gICAgICAgIHsgY2hpbGRyZW4gfVxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1hcEZhbGxiYWNrO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7O0FBUUEsTUFBTUEsV0FBNEIsR0FBRyxRQUFpRDtFQUFBLElBQWhEO0lBQUVDLFNBQUY7SUFBYUMsU0FBYjtJQUF3QkM7RUFBeEIsQ0FBZ0Q7RUFBQSxJQUFYQyxJQUFXO0VBQ2xGLG9CQUFPO0lBQUssU0FBUyxFQUFFLElBQUFDLG1CQUFBLEVBQVcsZ0JBQVgsRUFBNkJKLFNBQTdCO0VBQWhCLEdBQTZERyxJQUE3RCxnQkFDSCw2QkFBQyxTQUFEO0lBQWtCLFNBQVMsRUFBQztFQUE1QixFQURHLEVBRURGLFNBQVMsZ0JBQUcsNkJBQUMsZ0JBQUQ7SUFBUyxDQUFDLEVBQUUsRUFBWjtJQUFnQixDQUFDLEVBQUU7RUFBbkIsRUFBSCxnQkFBK0IsNkJBQUMsY0FBRDtJQUFvQixTQUFTLEVBQUM7RUFBOUIsRUFGdkMsRUFHREMsUUFIQyxDQUFQO0FBS0gsQ0FORDs7ZUFRZUgsVyJ9