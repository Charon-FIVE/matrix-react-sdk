"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollapsibleButton = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _MessageComposerButtons = require("./MessageComposerButtons");

var _IconizedContextMenu = require("../context_menus/IconizedContextMenu");

const _excluded = ["title", "children", "className", "iconClassName"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const CollapsibleButton = _ref => {
  let {
    title,
    children,
    className,
    iconClassName
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const inOverflowMenu = !!(0, _react.useContext)(_MessageComposerButtons.OverflowMenuContext);

  if (inOverflowMenu) {
    return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, (0, _extends2.default)({}, props, {
      iconClassName: iconClassName,
      label: title
    }));
  }

  return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, (0, _extends2.default)({}, props, {
    title: title,
    className: (0, _classnames.default)(className, iconClassName)
  }), children);
};

exports.CollapsibleButton = CollapsibleButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xsYXBzaWJsZUJ1dHRvbiIsInRpdGxlIiwiY2hpbGRyZW4iLCJjbGFzc05hbWUiLCJpY29uQ2xhc3NOYW1lIiwicHJvcHMiLCJpbk92ZXJmbG93TWVudSIsInVzZUNvbnRleHQiLCJPdmVyZmxvd01lbnVDb250ZXh0IiwiY2xhc3NOYW1lcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0NvbGxhcHNpYmxlQnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50UHJvcHMsIHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IHsgTWVudUl0ZW0gfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IHsgT3ZlcmZsb3dNZW51Q29udGV4dCB9IGZyb20gJy4vTWVzc2FnZUNvbXBvc2VyQnV0dG9ucyc7XG5pbXBvcnQgeyBJY29uaXplZENvbnRleHRNZW51T3B0aW9uIH0gZnJvbSAnLi4vY29udGV4dF9tZW51cy9JY29uaXplZENvbnRleHRNZW51JztcblxuaW50ZXJmYWNlIElDb2xsYXBzaWJsZUJ1dHRvblByb3BzIGV4dGVuZHMgQ29tcG9uZW50UHJvcHM8dHlwZW9mIE1lbnVJdGVtPiB7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBpY29uQ2xhc3NOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBDb2xsYXBzaWJsZUJ1dHRvbiA9ICh7IHRpdGxlLCBjaGlsZHJlbiwgY2xhc3NOYW1lLCBpY29uQ2xhc3NOYW1lLCAuLi5wcm9wcyB9OiBJQ29sbGFwc2libGVCdXR0b25Qcm9wcykgPT4ge1xuICAgIGNvbnN0IGluT3ZlcmZsb3dNZW51ID0gISF1c2VDb250ZXh0KE92ZXJmbG93TWVudUNvbnRleHQpO1xuICAgIGlmIChpbk92ZXJmbG93TWVudSkge1xuICAgICAgICByZXR1cm4gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAgIGljb25DbGFzc05hbWU9e2ljb25DbGFzc05hbWV9XG4gICAgICAgICAgICBsYWJlbD17dGl0bGV9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIHJldHVybiA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhjbGFzc05hbWUsIGljb25DbGFzc05hbWUpfVxuICAgID5cbiAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgPC9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj47XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOzs7Ozs7OztBQU9PLE1BQU1BLGlCQUFpQixHQUFHLFFBQXNGO0VBQUEsSUFBckY7SUFBRUMsS0FBRjtJQUFTQyxRQUFUO0lBQW1CQyxTQUFuQjtJQUE4QkM7RUFBOUIsQ0FBcUY7RUFBQSxJQUFyQ0MsS0FBcUM7RUFDbkgsTUFBTUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxJQUFBQyxpQkFBQSxFQUFXQywyQ0FBWCxDQUF6Qjs7RUFDQSxJQUFJRixjQUFKLEVBQW9CO0lBQ2hCLG9CQUFPLDZCQUFDLDhDQUFELDZCQUNDRCxLQUREO01BRUgsYUFBYSxFQUFFRCxhQUZaO01BR0gsS0FBSyxFQUFFSDtJQUhKLEdBQVA7RUFLSDs7RUFFRCxvQkFBTyw2QkFBQyxnQ0FBRCw2QkFDQ0ksS0FERDtJQUVILEtBQUssRUFBRUosS0FGSjtJQUdILFNBQVMsRUFBRSxJQUFBUSxtQkFBQSxFQUFXTixTQUFYLEVBQXNCQyxhQUF0QjtFQUhSLElBS0RGLFFBTEMsQ0FBUDtBQU9ILENBakJNIn0=