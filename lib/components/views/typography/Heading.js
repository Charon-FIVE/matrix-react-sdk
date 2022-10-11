"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

const _excluded = ["size", "className", "children"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const Heading = _ref => {
  let {
    size,
    className,
    children
  } = _ref,
      rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return /*#__PURE__*/_react.default.createElement(size || 'h1', _objectSpread(_objectSpread({}, rest), {}, {
    className: (0, _classnames.default)(`mx_Heading_${size}`, className),
    children
  }));
};

var _default = Heading;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIZWFkaW5nIiwic2l6ZSIsImNsYXNzTmFtZSIsImNoaWxkcmVuIiwicmVzdCIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZXMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy90eXBvZ3JhcGh5L0hlYWRpbmcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbmh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IEhUTUxBdHRyaWJ1dGVzIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgU2l6ZSA9ICdoMScgfCAnaDInIHwgJ2gzJyB8ICdoNCc7XG5pbnRlcmZhY2UgSGVhZGluZ1Byb3BzIGV4dGVuZHMgSFRNTEF0dHJpYnV0ZXM8SFRNTEhlYWRpbmdFbGVtZW50PiB7XG4gICAgc2l6ZTogU2l6ZTtcbn1cblxuY29uc3QgSGVhZGluZzogUmVhY3QuRkM8SGVhZGluZ1Byb3BzPiA9ICh7IHNpemUsIGNsYXNzTmFtZSwgY2hpbGRyZW4sIC4uLnJlc3QgfSkgPT4gUmVhY3QuY3JlYXRlRWxlbWVudChzaXplIHx8ICdoMScsIHtcbiAgICAuLi5yZXN0LFxuICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lcyhgbXhfSGVhZGluZ18ke3NpemV9YCwgY2xhc3NOYW1lKSxcbiAgICBjaGlsZHJlbixcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBIZWFkaW5nO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOzs7Ozs7OztBQU9BLE1BQU1BLE9BQStCLEdBQUc7RUFBQSxJQUFDO0lBQUVDLElBQUY7SUFBUUMsU0FBUjtJQUFtQkM7RUFBbkIsQ0FBRDtFQUFBLElBQWlDQyxJQUFqQztFQUFBLG9CQUE0Q0MsY0FBQSxDQUFNQyxhQUFOLENBQW9CTCxJQUFJLElBQUksSUFBNUIsa0NBQzdFRyxJQUQ2RTtJQUVoRkYsU0FBUyxFQUFFLElBQUFLLG1CQUFBLEVBQVksY0FBYU4sSUFBSyxFQUE5QixFQUFpQ0MsU0FBakMsQ0FGcUU7SUFHaEZDO0VBSGdGLEdBQTVDO0FBQUEsQ0FBeEM7O2VBTWVILE8ifQ==