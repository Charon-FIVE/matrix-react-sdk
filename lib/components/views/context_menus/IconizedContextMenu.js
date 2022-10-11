"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IconizedContextMenuRadio = exports.IconizedContextMenuOptionList = exports.IconizedContextMenuOption = exports.IconizedContextMenuCheckbox = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _languageHandler = require("../../../languageHandler");

const _excluded = ["label", "iconClassName", "active", "className"],
      _excluded2 = ["label", "iconClassName", "active", "className", "words"],
      _excluded3 = ["label", "className", "iconClassName", "children"],
      _excluded4 = ["className", "children", "compact"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const IconizedContextMenuRadio = _ref => {
  let {
    label,
    iconClassName,
    active,
    className
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItemRadio, (0, _extends2.default)({}, props, {
    className: (0, _classnames.default)(className, {
      mx_IconizedContextMenu_item: true,
      mx_IconizedContextMenu_active: active
    }),
    active: active,
    label: label
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _classnames.default)("mx_IconizedContextMenu_icon", iconClassName)
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_label"
  }, label), active && /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_icon mx_IconizedContextMenu_checked"
  }));
};

exports.IconizedContextMenuRadio = IconizedContextMenuRadio;

const IconizedContextMenuCheckbox = _ref2 => {
  let {
    label,
    iconClassName,
    active,
    className,
    words
  } = _ref2,
      props = (0, _objectWithoutProperties2.default)(_ref2, _excluded2);
  let marker;

  if (words) {
    marker = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_IconizedContextMenu_activeText"
    }, active ? (0, _languageHandler._t)("On") : (0, _languageHandler._t)("Off"));
  } else {
    marker = /*#__PURE__*/_react.default.createElement("span", {
      className: (0, _classnames.default)("mx_IconizedContextMenu_icon", {
        mx_IconizedContextMenu_checked: active,
        mx_IconizedContextMenu_unchecked: !active
      })
    });
  }

  return /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItemCheckbox, (0, _extends2.default)({}, props, {
    className: (0, _classnames.default)(className, {
      mx_IconizedContextMenu_item: true,
      mx_IconizedContextMenu_active: active
    }),
    active: active,
    label: label
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _classnames.default)("mx_IconizedContextMenu_icon", iconClassName)
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_label"
  }, label), marker);
};

exports.IconizedContextMenuCheckbox = IconizedContextMenuCheckbox;

const IconizedContextMenuOption = _ref3 => {
  let {
    label,
    className,
    iconClassName,
    children
  } = _ref3,
      props = (0, _objectWithoutProperties2.default)(_ref3, _excluded3);
  return /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, (0, _extends2.default)({}, props, {
    className: (0, _classnames.default)(className, {
      mx_IconizedContextMenu_item: true
    }),
    label: label
  }), iconClassName && /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _classnames.default)("mx_IconizedContextMenu_icon", iconClassName)
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_label"
  }, label), children);
};

exports.IconizedContextMenuOption = IconizedContextMenuOption;

const IconizedContextMenuOptionList = _ref4 => {
  let {
    first,
    red,
    className,
    label,
    children
  } = _ref4;
  const classes = (0, _classnames.default)("mx_IconizedContextMenu_optionList", className, {
    mx_IconizedContextMenu_optionList_notFirst: !first,
    mx_IconizedContextMenu_optionList_red: red
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: classes
  }, label && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_IconizedContextMenu_optionList_label"
  }, label)), children);
};

exports.IconizedContextMenuOptionList = IconizedContextMenuOptionList;

const IconizedContextMenu = _ref5 => {
  let {
    className,
    children,
    compact
  } = _ref5,
      props = (0, _objectWithoutProperties2.default)(_ref5, _excluded4);
  const classes = (0, _classnames.default)("mx_IconizedContextMenu", className, {
    mx_IconizedContextMenu_compact: compact
  });
  return /*#__PURE__*/_react.default.createElement(_ContextMenu.default, (0, _extends2.default)({
    chevronFace: _ContextMenu.ChevronFace.None
  }, props), /*#__PURE__*/_react.default.createElement("div", {
    className: classes
  }, children));
};

var _default = IconizedContextMenu;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJY29uaXplZENvbnRleHRNZW51UmFkaW8iLCJsYWJlbCIsImljb25DbGFzc05hbWUiLCJhY3RpdmUiLCJjbGFzc05hbWUiLCJwcm9wcyIsImNsYXNzTmFtZXMiLCJteF9JY29uaXplZENvbnRleHRNZW51X2l0ZW0iLCJteF9JY29uaXplZENvbnRleHRNZW51X2FjdGl2ZSIsIkljb25pemVkQ29udGV4dE1lbnVDaGVja2JveCIsIndvcmRzIiwibWFya2VyIiwiX3QiLCJteF9JY29uaXplZENvbnRleHRNZW51X2NoZWNrZWQiLCJteF9JY29uaXplZENvbnRleHRNZW51X3VuY2hlY2tlZCIsIkljb25pemVkQ29udGV4dE1lbnVPcHRpb24iLCJjaGlsZHJlbiIsIkljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IiwiZmlyc3QiLCJyZWQiLCJjbGFzc2VzIiwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25MaXN0X25vdEZpcnN0IiwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25MaXN0X3JlZCIsIkljb25pemVkQ29udGV4dE1lbnUiLCJjb21wYWN0IiwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9jb21wYWN0IiwiQ2hldnJvbkZhY2UiLCJOb25lIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvY29udGV4dF9tZW51cy9JY29uaXplZENvbnRleHRNZW51LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5pbXBvcnQgQ29udGV4dE1lbnUsIHtcbiAgICBDaGV2cm9uRmFjZSxcbiAgICBJUHJvcHMgYXMgSUNvbnRleHRNZW51UHJvcHMsXG4gICAgTWVudUl0ZW0sXG4gICAgTWVudUl0ZW1DaGVja2JveCwgTWVudUl0ZW1SYWRpbyxcbn0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSUNvbnRleHRNZW51UHJvcHMge1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBjb21wYWN0PzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElPcHRpb25MaXN0UHJvcHMge1xuICAgIGZpcnN0PzogYm9vbGVhbjtcbiAgICByZWQ/OiBib29sZWFuO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElPcHRpb25Qcm9wcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBNZW51SXRlbT4ge1xuICAgIGljb25DbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJQ2hlY2tib3hQcm9wcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBNZW51SXRlbUNoZWNrYm94PiB7XG4gICAgaWNvbkNsYXNzTmFtZTogc3RyaW5nO1xuICAgIHdvcmRzPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElSYWRpb1Byb3BzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIE1lbnVJdGVtUmFkaW8+IHtcbiAgICBpY29uQ2xhc3NOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBJY29uaXplZENvbnRleHRNZW51UmFkaW86IFJlYWN0LkZDPElSYWRpb1Byb3BzPiA9ICh7XG4gICAgbGFiZWwsXG4gICAgaWNvbkNsYXNzTmFtZSxcbiAgICBhY3RpdmUsXG4gICAgY2xhc3NOYW1lLFxuICAgIC4uLnByb3BzXG59KSA9PiB7XG4gICAgcmV0dXJuIDxNZW51SXRlbVJhZGlvXG4gICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKGNsYXNzTmFtZSwge1xuICAgICAgICAgICAgbXhfSWNvbml6ZWRDb250ZXh0TWVudV9pdGVtOiB0cnVlLFxuICAgICAgICAgICAgbXhfSWNvbml6ZWRDb250ZXh0TWVudV9hY3RpdmU6IGFjdGl2ZSxcbiAgICAgICAgfSl9XG4gICAgICAgIGFjdGl2ZT17YWN0aXZlfVxuICAgICAgICBsYWJlbD17bGFiZWx9XG4gICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9JY29uaXplZENvbnRleHRNZW51X2ljb25cIiwgaWNvbkNsYXNzTmFtZSl9IC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0ljb25pemVkQ29udGV4dE1lbnVfbGFiZWxcIj57IGxhYmVsIH08L3NwYW4+XG4gICAgICAgIHsgYWN0aXZlICYmIDxzcGFuIGNsYXNzTmFtZT1cIm14X0ljb25pemVkQ29udGV4dE1lbnVfaWNvbiBteF9JY29uaXplZENvbnRleHRNZW51X2NoZWNrZWRcIiAvPiB9XG4gICAgPC9NZW51SXRlbVJhZGlvPjtcbn07XG5cbmV4cG9ydCBjb25zdCBJY29uaXplZENvbnRleHRNZW51Q2hlY2tib3g6IFJlYWN0LkZDPElDaGVja2JveFByb3BzPiA9ICh7XG4gICAgbGFiZWwsXG4gICAgaWNvbkNsYXNzTmFtZSxcbiAgICBhY3RpdmUsXG4gICAgY2xhc3NOYW1lLFxuICAgIHdvcmRzLFxuICAgIC4uLnByb3BzXG59KSA9PiB7XG4gICAgbGV0IG1hcmtlcjogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKHdvcmRzKSB7XG4gICAgICAgIG1hcmtlciA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0ljb25pemVkQ29udGV4dE1lbnVfYWN0aXZlVGV4dFwiPlxuICAgICAgICAgICAgeyBhY3RpdmUgPyBfdChcIk9uXCIpIDogX3QoXCJPZmZcIikgfVxuICAgICAgICA8L3NwYW4+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcmtlciA9IDxzcGFuIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0ljb25pemVkQ29udGV4dE1lbnVfaWNvblwiLCB7XG4gICAgICAgICAgICBteF9JY29uaXplZENvbnRleHRNZW51X2NoZWNrZWQ6IGFjdGl2ZSxcbiAgICAgICAgICAgIG14X0ljb25pemVkQ29udGV4dE1lbnVfdW5jaGVja2VkOiAhYWN0aXZlLFxuICAgICAgICB9KX0gLz47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxNZW51SXRlbUNoZWNrYm94XG4gICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKGNsYXNzTmFtZSwge1xuICAgICAgICAgICAgbXhfSWNvbml6ZWRDb250ZXh0TWVudV9pdGVtOiB0cnVlLFxuICAgICAgICAgICAgbXhfSWNvbml6ZWRDb250ZXh0TWVudV9hY3RpdmU6IGFjdGl2ZSxcbiAgICAgICAgfSl9XG4gICAgICAgIGFjdGl2ZT17YWN0aXZlfVxuICAgICAgICBsYWJlbD17bGFiZWx9XG4gICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9JY29uaXplZENvbnRleHRNZW51X2ljb25cIiwgaWNvbkNsYXNzTmFtZSl9IC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0ljb25pemVkQ29udGV4dE1lbnVfbGFiZWxcIj57IGxhYmVsIH08L3NwYW4+XG4gICAgICAgIHsgbWFya2VyIH1cbiAgICA8L01lbnVJdGVtQ2hlY2tib3g+O1xufTtcblxuZXhwb3J0IGNvbnN0IEljb25pemVkQ29udGV4dE1lbnVPcHRpb246IFJlYWN0LkZDPElPcHRpb25Qcm9wcz4gPSAoe1xuICAgIGxhYmVsLFxuICAgIGNsYXNzTmFtZSxcbiAgICBpY29uQ2xhc3NOYW1lLFxuICAgIGNoaWxkcmVuLFxuICAgIC4uLnByb3BzXG59KSA9PiB7XG4gICAgcmV0dXJuIDxNZW51SXRlbVxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhjbGFzc05hbWUsIHtcbiAgICAgICAgICAgIG14X0ljb25pemVkQ29udGV4dE1lbnVfaXRlbTogdHJ1ZSxcbiAgICAgICAgfSl9XG4gICAgICAgIGxhYmVsPXtsYWJlbH1cbiAgICA+XG4gICAgICAgIHsgaWNvbkNsYXNzTmFtZSAmJiA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9JY29uaXplZENvbnRleHRNZW51X2ljb25cIiwgaWNvbkNsYXNzTmFtZSl9IC8+IH1cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9sYWJlbFwiPnsgbGFiZWwgfTwvc3Bhbj5cbiAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgPC9NZW51SXRlbT47XG59O1xuXG5leHBvcnQgY29uc3QgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q6IFJlYWN0LkZDPElPcHRpb25MaXN0UHJvcHM+ID0gKHtcbiAgICBmaXJzdCxcbiAgICByZWQsXG4gICAgY2xhc3NOYW1lLFxuICAgIGxhYmVsLFxuICAgIGNoaWxkcmVuLFxufSkgPT4ge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25MaXN0XCIsIGNsYXNzTmFtZSwge1xuICAgICAgICBteF9JY29uaXplZENvbnRleHRNZW51X29wdGlvbkxpc3Rfbm90Rmlyc3Q6ICFmaXJzdCxcbiAgICAgICAgbXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25MaXN0X3JlZDogcmVkLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgeyBsYWJlbCAmJiA8ZGl2PjxzcGFuIGNsYXNzTmFtZT1cIm14X0ljb25pemVkQ29udGV4dE1lbnVfb3B0aW9uTGlzdF9sYWJlbFwiPnsgbGFiZWwgfTwvc3Bhbj48L2Rpdj4gfVxuICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBJY29uaXplZENvbnRleHRNZW51OiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgY2xhc3NOYW1lLCBjaGlsZHJlbiwgY29tcGFjdCwgLi4ucHJvcHMgfSkgPT4ge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfSWNvbml6ZWRDb250ZXh0TWVudVwiLCBjbGFzc05hbWUsIHtcbiAgICAgICAgbXhfSWNvbml6ZWRDb250ZXh0TWVudV9jb21wYWN0OiBjb21wYWN0LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIDxDb250ZXh0TWVudSBjaGV2cm9uRmFjZT17Q2hldnJvbkZhY2UuTm9uZX0gey4uLnByb3BzfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvZGl2PlxuICAgIDwvQ29udGV4dE1lbnU+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSWNvbml6ZWRDb250ZXh0TWVudTtcblxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQU1BOzs7Ozs7Ozs7OztBQTJCTyxNQUFNQSx3QkFBK0MsR0FBRyxRQU16RDtFQUFBLElBTjBEO0lBQzVEQyxLQUQ0RDtJQUU1REMsYUFGNEQ7SUFHNURDLE1BSDREO0lBSTVEQztFQUo0RCxDQU0xRDtFQUFBLElBRENDLEtBQ0Q7RUFDRixvQkFBTyw2QkFBQywwQkFBRCw2QkFDQ0EsS0FERDtJQUVILFNBQVMsRUFBRSxJQUFBQyxtQkFBQSxFQUFXRixTQUFYLEVBQXNCO01BQzdCRywyQkFBMkIsRUFBRSxJQURBO01BRTdCQyw2QkFBNkIsRUFBRUw7SUFGRixDQUF0QixDQUZSO0lBTUgsTUFBTSxFQUFFQSxNQU5MO0lBT0gsS0FBSyxFQUFFRjtFQVBKLGlCQVNIO0lBQU0sU0FBUyxFQUFFLElBQUFLLG1CQUFBLEVBQVcsNkJBQVgsRUFBMENKLGFBQTFDO0VBQWpCLEVBVEcsZUFVSDtJQUFNLFNBQVMsRUFBQztFQUFoQixHQUFpREQsS0FBakQsQ0FWRyxFQVdERSxNQUFNLGlCQUFJO0lBQU0sU0FBUyxFQUFDO0VBQWhCLEVBWFQsQ0FBUDtBQWFILENBcEJNOzs7O0FBc0JBLE1BQU1NLDJCQUFxRCxHQUFHLFNBTy9EO0VBQUEsSUFQZ0U7SUFDbEVSLEtBRGtFO0lBRWxFQyxhQUZrRTtJQUdsRUMsTUFIa0U7SUFJbEVDLFNBSmtFO0lBS2xFTTtFQUxrRSxDQU9oRTtFQUFBLElBRENMLEtBQ0Q7RUFDRixJQUFJTSxNQUFKOztFQUNBLElBQUlELEtBQUosRUFBVztJQUNQQyxNQUFNLGdCQUFHO01BQU0sU0FBUyxFQUFDO0lBQWhCLEdBQ0hSLE1BQU0sR0FBRyxJQUFBUyxtQkFBQSxFQUFHLElBQUgsQ0FBSCxHQUFjLElBQUFBLG1CQUFBLEVBQUcsS0FBSCxDQURqQixDQUFUO0VBR0gsQ0FKRCxNQUlPO0lB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