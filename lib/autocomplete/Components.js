"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextualCompletion = exports.PillCompletion = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

const _excluded = ["title", "subtitle", "description", "className", "aria-selected"],
      _excluded2 = ["title", "subtitle", "description", "className", "children", "aria-selected"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const TextualCompletion = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    title,
    subtitle,
    description,
    className,
    'aria-selected': ariaSelectedAttribute
  } = props,
        restProps = (0, _objectWithoutProperties2.default)(props, _excluded);
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, restProps, {
    className: (0, _classnames.default)('mx_Autocomplete_Completion_block', className),
    role: "option",
    "aria-selected": ariaSelectedAttribute,
    ref: ref
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_Autocomplete_Completion_title"
  }, title), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_Autocomplete_Completion_subtitle"
  }, subtitle), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_Autocomplete_Completion_description"
  }, description));
});
exports.TextualCompletion = TextualCompletion;
const PillCompletion = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const {
    title,
    subtitle,
    description,
    className,
    children,
    'aria-selected': ariaSelectedAttribute
  } = props,
        restProps = (0, _objectWithoutProperties2.default)(props, _excluded2);
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, restProps, {
    className: (0, _classnames.default)('mx_Autocomplete_Completion_pill', className),
    role: "option",
    "aria-selected": ariaSelectedAttribute,
    ref: ref
  }), children, /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_Autocomplete_Completion_title"
  }, title), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_Autocomplete_Completion_subtitle"
  }, subtitle), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_Autocomplete_Completion_description"
  }, description));
});
exports.PillCompletion = PillCompletion;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0dWFsQ29tcGxldGlvbiIsImZvcndhcmRSZWYiLCJwcm9wcyIsInJlZiIsInRpdGxlIiwic3VidGl0bGUiLCJkZXNjcmlwdGlvbiIsImNsYXNzTmFtZSIsImFyaWFTZWxlY3RlZEF0dHJpYnV0ZSIsInJlc3RQcm9wcyIsImNsYXNzTmFtZXMiLCJQaWxsQ29tcGxldGlvbiIsImNoaWxkcmVuIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F1dG9jb21wbGV0ZS9Db21wb25lbnRzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgQXZpcmFsIERhc2d1cHRhXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuLyogVGhlc2Ugd2VyZSBlYXJsaWVyIHN0YXRlbGVzcyBmdW5jdGlvbmFsIGNvbXBvbmVudHMgYnV0IGhhZCB0byBiZSBjb252ZXJ0ZWRcbnNpbmNlIHdlIG5lZWQgdG8gdXNlIHJlZnMvZmluZERPTU5vZGUgdG8gYWNjZXNzIHRoZSB1bmRlcmx5aW5nIERPTSBub2RlIHRvIGZvY3VzIHRoZSBjb3JyZWN0IGNvbXBsZXRpb24sXG5zb21ldGhpbmcgdGhhdCBpcyBub3QgZW50aXJlbHkgcG9zc2libGUgd2l0aCBzdGF0ZWxlc3MgZnVuY3Rpb25hbCBjb21wb25lbnRzLiBPbmUgY291bGRcbnByZXN1bWFibHkgd3JhcCB0aGVtIGluIGEgPGRpdj4gYmVmb3JlIHJlbmRlcmluZyBidXQgSSB0aGluayB0aGlzIGlzIHRoZSBiZXR0ZXIgd2F5IHRvIGRvIGl0LlxuICovXG5cbmludGVyZmFjZSBJVGV4dHVhbENvbXBsZXRpb25Qcm9wcyB7XG4gICAgdGl0bGU/OiBzdHJpbmc7XG4gICAgc3VidGl0bGU/OiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgVGV4dHVhbENvbXBsZXRpb24gPSBmb3J3YXJkUmVmPElUZXh0dWFsQ29tcGxldGlvblByb3BzLCBhbnk+KChwcm9wcywgcmVmKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgc3VidGl0bGUsXG4gICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogYXJpYVNlbGVjdGVkQXR0cmlidXRlLFxuICAgICAgICAuLi5yZXN0UHJvcHNcbiAgICB9ID0gcHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiB7Li4ucmVzdFByb3BzfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKCdteF9BdXRvY29tcGxldGVfQ29tcGxldGlvbl9ibG9jaycsIGNsYXNzTmFtZSl9XG4gICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2FyaWFTZWxlY3RlZEF0dHJpYnV0ZX1cbiAgICAgICAgICAgIHJlZj17cmVmfVxuICAgICAgICA+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BdXRvY29tcGxldGVfQ29tcGxldGlvbl90aXRsZVwiPnsgdGl0bGUgfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0F1dG9jb21wbGV0ZV9Db21wbGV0aW9uX3N1YnRpdGxlXCI+eyBzdWJ0aXRsZSB9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQXV0b2NvbXBsZXRlX0NvbXBsZXRpb25fZGVzY3JpcHRpb25cIj57IGRlc2NyaXB0aW9uIH08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59KTtcblxuaW50ZXJmYWNlIElQaWxsQ29tcGxldGlvblByb3BzIGV4dGVuZHMgSVRleHR1YWxDb21wbGV0aW9uUHJvcHMge1xuICAgIGNoaWxkcmVuPzogUmVhY3QuUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgY29uc3QgUGlsbENvbXBsZXRpb24gPSBmb3J3YXJkUmVmPElQaWxsQ29tcGxldGlvblByb3BzLCBhbnk+KChwcm9wcywgcmVmKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgc3VidGl0bGUsXG4gICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IGFyaWFTZWxlY3RlZEF0dHJpYnV0ZSxcbiAgICAgICAgLi4ucmVzdFByb3BzXG4gICAgfSA9IHByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgey4uLnJlc3RQcm9wc31cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcygnbXhfQXV0b2NvbXBsZXRlX0NvbXBsZXRpb25fcGlsbCcsIGNsYXNzTmFtZSl9XG4gICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2FyaWFTZWxlY3RlZEF0dHJpYnV0ZX1cbiAgICAgICAgICAgIHJlZj17cmVmfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0F1dG9jb21wbGV0ZV9Db21wbGV0aW9uX3RpdGxlXCI+eyB0aXRsZSB9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQXV0b2NvbXBsZXRlX0NvbXBsZXRpb25fc3VidGl0bGVcIj57IHN1YnRpdGxlIH08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BdXRvY29tcGxldGVfQ29tcGxldGlvbl9kZXNjcmlwdGlvblwiPnsgZGVzY3JpcHRpb24gfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn0pO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOzs7Ozs7Ozs7QUFlTyxNQUFNQSxpQkFBaUIsZ0JBQUcsSUFBQUMsaUJBQUEsRUFBeUMsQ0FBQ0MsS0FBRCxFQUFRQyxHQUFSLEtBQWdCO0VBQ3RGLE1BQU07SUFDRkMsS0FERTtJQUVGQyxRQUZFO0lBR0ZDLFdBSEU7SUFJRkMsU0FKRTtJQUtGLGlCQUFpQkM7RUFMZixJQU9GTixLQVBKO0VBQUEsTUFNT08sU0FOUCwwQ0FPSVAsS0FQSjtFQVFBLG9CQUNJLCtEQUFTTyxTQUFUO0lBQ0ksU0FBUyxFQUFFLElBQUFDLG1CQUFBLEVBQVcsa0NBQVgsRUFBK0NILFNBQS9DLENBRGY7SUFFSSxJQUFJLEVBQUMsUUFGVDtJQUdJLGlCQUFlQyxxQkFIbkI7SUFJSSxHQUFHLEVBQUVMO0VBSlQsaUJBTUk7SUFBTSxTQUFTLEVBQUM7RUFBaEIsR0FBcURDLEtBQXJELENBTkosZUFPSTtJQUFNLFNBQVMsRUFBQztFQUFoQixHQUF3REMsUUFBeEQsQ0FQSixlQVFJO0lBQU0sU0FBUyxFQUFDO0VBQWhCLEdBQTJEQyxXQUEzRCxDQVJKLENBREo7QUFZSCxDQXJCZ0MsQ0FBMUI7O0FBMkJBLE1BQU1LLGNBQWMsZ0JBQUcsSUFBQVYsaUJBQUEsRUFBc0MsQ0FBQ0MsS0FBRCxFQUFRQyxHQUFSLEtBQWdCO0VBQ2hGLE1BQU07SUFDRkMsS0FERTtJQUVGQyxRQUZFO0lBR0ZDLFdBSEU7SUFJRkMsU0FKRTtJQUtGSyxRQUxFO0lBTUYsaUJBQWlCSjtFQU5mLElBUUZOLEtBUko7RUFBQSxNQU9PTyxTQVBQLDBDQVFJUCxLQVJKO0VBU0Esb0JBQ0ksK0RBQVNPLFNBQVQ7SUFDSSxTQUFTLEVBQUUsSUFBQUMsbUJBQUEsRUFBVyxpQ0FBWCxFQUE4Q0gsU0FBOUMsQ0FEZjtJQUVJLElBQUksRUFBQyxRQUZUO0lBR0ksaUJBQWVDLHFCQUhuQjtJQUlJLEdBQUcsRUFBRUw7RUFKVCxJQU1NUyxRQU5OLGVBT0k7SUFBTSxTQUFTLEVBQUM7RUFBaEIsR0FBcURSLEtBQXJELENBUEosZUFRSTtJQUFNLFNBQVMsRUFBQztFQUFoQixHQUF3REMsUUFBeEQsQ0FSSixlQVNJO0lBQU0sU0FBUyxFQUFDO0VBQWhCLEdBQTJEQyxXQUEzRCxDQVRKLENBREo7QUFhSCxDQXZCNkIsQ0FBdkIifQ==