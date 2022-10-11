"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RoomTopic;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _useTopic = require("../../../hooks/room/useTopic");

var _Tooltip = require("./Tooltip");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _InfoDialog = _interopRequireDefault(require("../dialogs/InfoDialog"));

var _useDispatcher = require("../../../hooks/useDispatcher");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _Linkify = require("./Linkify");

var _TooltipTarget = _interopRequireDefault(require("./TooltipTarget"));

var _HtmlUtils = require("../../../HtmlUtils");

const _excluded = ["room"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function RoomTopic(_ref) {
  let {
    room
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const client = (0, _react.useContext)(_MatrixClientContext.default);
  const ref = (0, _react.useRef)();
  const topic = (0, _useTopic.useTopic)(room);
  const body = (0, _HtmlUtils.topicToHtml)(topic?.text, topic?.html, ref);
  const onClick = (0, _react.useCallback)(e => {
    props.onClick?.(e);
    const target = e.target;

    if (target.tagName.toUpperCase() === "A") {
      return;
    }

    _dispatcher.default.fire(_actions.Action.ShowRoomTopic);
  }, [props]);

  const ignoreHover = ev => {
    return ev.target.tagName.toUpperCase() === "A";
  };

  (0, _useDispatcher.useDispatcher)(_dispatcher.default, payload => {
    if (payload.action === _actions.Action.ShowRoomTopic) {
      const canSetTopic = room.currentState.maySendStateEvent(_event.EventType.RoomTopic, client.getUserId());
      const body = (0, _HtmlUtils.topicToHtml)(topic?.text, topic?.html, ref, true);

      const modal = _Modal.default.createDialog(_InfoDialog.default, {
        title: room.name,
        description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Linkify.Linkify, {
          as: "p",
          onClick: ev => {
            if (ev.target.tagName.toUpperCase() === "A") {
              modal.close();
            }
          }
        }, body), canSetTopic && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "primary_outline",
          onClick: () => {
            modal.close();

            _dispatcher.default.dispatch({
              action: "open_room_settings"
            });
          }
        }, (0, _languageHandler._t)("Edit topic"))),
        hasCloseButton: true,
        button: false
      });
    }
  });
  const className = (0, _classnames.default)(props.className, "mx_RoomTopic");
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, props, {
    ref: ref,
    onClick: onClick,
    dir: "auto",
    className: className
  }), /*#__PURE__*/_react.default.createElement(_TooltipTarget.default, {
    label: (0, _languageHandler._t)("Click to read topic"),
    alignment: _Tooltip.Alignment.Bottom,
    ignoreHover: ignoreHover
  }, /*#__PURE__*/_react.default.createElement(_Linkify.Linkify, null, body)));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tVG9waWMiLCJyb29tIiwicHJvcHMiLCJjbGllbnQiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsInJlZiIsInVzZVJlZiIsInRvcGljIiwidXNlVG9waWMiLCJib2R5IiwidG9waWNUb0h0bWwiLCJ0ZXh0IiwiaHRtbCIsIm9uQ2xpY2siLCJ1c2VDYWxsYmFjayIsImUiLCJ0YXJnZXQiLCJ0YWdOYW1lIiwidG9VcHBlckNhc2UiLCJkaXMiLCJmaXJlIiwiQWN0aW9uIiwiU2hvd1Jvb21Ub3BpYyIsImlnbm9yZUhvdmVyIiwiZXYiLCJ1c2VEaXNwYXRjaGVyIiwicGF5bG9hZCIsImFjdGlvbiIsImNhblNldFRvcGljIiwiY3VycmVudFN0YXRlIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJFdmVudFR5cGUiLCJnZXRVc2VySWQiLCJtb2RhbCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiSW5mb0RpYWxvZyIsInRpdGxlIiwibmFtZSIsImRlc2NyaXB0aW9uIiwiY2xvc2UiLCJkaXNwYXRjaCIsIl90IiwiaGFzQ2xvc2VCdXR0b24iLCJidXR0b24iLCJjbGFzc05hbWUiLCJjbGFzc05hbWVzIiwiQWxpZ25tZW50IiwiQm90dG9tIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvUm9vbVRvcGljLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUNhbGxiYWNrLCB1c2VDb250ZXh0LCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5cbmltcG9ydCB7IHVzZVRvcGljIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3Jvb20vdXNlVG9waWNcIjtcbmltcG9ydCB7IEFsaWdubWVudCB9IGZyb20gXCIuL1Rvb2x0aXBcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgSW5mb0RpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9JbmZvRGlhbG9nXCI7XG5pbXBvcnQgeyB1c2VEaXNwYXRjaGVyIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZURpc3BhdGNoZXJcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgeyBMaW5raWZ5IH0gZnJvbSBcIi4vTGlua2lmeVwiO1xuaW1wb3J0IFRvb2x0aXBUYXJnZXQgZnJvbSBcIi4vVG9vbHRpcFRhcmdldFwiO1xuaW1wb3J0IHsgdG9waWNUb0h0bWwgfSBmcm9tIFwiLi4vLi4vLi4vSHRtbFV0aWxzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBSZWFjdC5IVE1MUHJvcHM8SFRNTERpdkVsZW1lbnQ+IHtcbiAgICByb29tPzogUm9vbTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUm9vbVRvcGljKHtcbiAgICByb29tLFxuICAgIC4uLnByb3BzXG59OiBJUHJvcHMpIHtcbiAgICBjb25zdCBjbGllbnQgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IHJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcblxuICAgIGNvbnN0IHRvcGljID0gdXNlVG9waWMocm9vbSk7XG4gICAgY29uc3QgYm9keSA9IHRvcGljVG9IdG1sKHRvcGljPy50ZXh0LCB0b3BpYz8uaHRtbCwgcmVmKTtcblxuICAgIGNvbnN0IG9uQ2xpY2sgPSB1c2VDYWxsYmFjaygoZTogUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4pID0+IHtcbiAgICAgICAgcHJvcHMub25DbGljaz8uKGUpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgaWYgKHRhcmdldC50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09IFwiQVwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkaXMuZmlyZShBY3Rpb24uU2hvd1Jvb21Ub3BpYyk7XG4gICAgfSwgW3Byb3BzXSk7XG5cbiAgICBjb25zdCBpZ25vcmVIb3ZlciA9IChldjogUmVhY3QuTW91c2VFdmVudCk6IGJvb2xlYW4gPT4ge1xuICAgICAgICByZXR1cm4gKGV2LnRhcmdldCBhcyBIVE1MRWxlbWVudCkudGFnTmFtZS50b1VwcGVyQ2FzZSgpID09PSBcIkFcIjtcbiAgICB9O1xuXG4gICAgdXNlRGlzcGF0Y2hlcihkaXMsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLlNob3dSb29tVG9waWMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhblNldFRvcGljID0gcm9vbS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlJvb21Ub3BpYywgY2xpZW50LmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSB0b3BpY1RvSHRtbCh0b3BpYz8udGV4dCwgdG9waWM/Lmh0bWwsIHJlZiwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlRGlhbG9nKEluZm9EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogcm9vbS5uYW1lLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8TGlua2lmeVxuICAgICAgICAgICAgICAgICAgICAgICAgYXM9XCJwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldjogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09IFwiQVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgICAgICAgICAgPC9MaW5raWZ5PlxuICAgICAgICAgICAgICAgICAgICB7IGNhblNldFRvcGljICYmIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeV9vdXRsaW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJvcGVuX3Jvb21fc2V0dGluZ3NcIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkVkaXQgdG9waWNcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgaGFzQ2xvc2VCdXR0b246IHRydWUsXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKHByb3BzLmNsYXNzTmFtZSwgXCJteF9Sb29tVG9waWNcIik7XG5cbiAgICByZXR1cm4gPGRpdiB7Li4ucHJvcHN9XG4gICAgICAgIHJlZj17cmVmfVxuICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgICBkaXI9XCJhdXRvXCJcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgPlxuICAgICAgICA8VG9vbHRpcFRhcmdldCBsYWJlbD17X3QoXCJDbGljayB0byByZWFkIHRvcGljXCIpfSBhbGlnbm1lbnQ9e0FsaWdubWVudC5Cb3R0b219IGlnbm9yZUhvdmVyPXtpZ25vcmVIb3Zlcn0+XG4gICAgICAgICAgICA8TGlua2lmeT5cbiAgICAgICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICAgICAgPC9MaW5raWZ5PlxuICAgICAgICA8L1Rvb2x0aXBUYXJnZXQ+XG4gICAgPC9kaXY+O1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQU1lLFNBQVNBLFNBQVQsT0FHSjtFQUFBLElBSHVCO0lBQzlCQztFQUQ4QixDQUd2QjtFQUFBLElBREpDLEtBQ0k7RUFDUCxNQUFNQyxNQUFNLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0MsNEJBQVgsQ0FBZjtFQUNBLE1BQU1DLEdBQUcsR0FBRyxJQUFBQyxhQUFBLEdBQVo7RUFFQSxNQUFNQyxLQUFLLEdBQUcsSUFBQUMsa0JBQUEsRUFBU1IsSUFBVCxDQUFkO0VBQ0EsTUFBTVMsSUFBSSxHQUFHLElBQUFDLHNCQUFBLEVBQVlILEtBQUssRUFBRUksSUFBbkIsRUFBeUJKLEtBQUssRUFBRUssSUFBaEMsRUFBc0NQLEdBQXRDLENBQWI7RUFFQSxNQUFNUSxPQUFPLEdBQUcsSUFBQUMsa0JBQUEsRUFBYUMsQ0FBRCxJQUF5QztJQUNqRWQsS0FBSyxDQUFDWSxPQUFOLEdBQWdCRSxDQUFoQjtJQUNBLE1BQU1DLE1BQU0sR0FBR0QsQ0FBQyxDQUFDQyxNQUFqQjs7SUFDQSxJQUFJQSxNQUFNLENBQUNDLE9BQVAsQ0FBZUMsV0FBZixPQUFpQyxHQUFyQyxFQUEwQztNQUN0QztJQUNIOztJQUVEQyxtQkFBQSxDQUFJQyxJQUFKLENBQVNDLGVBQUEsQ0FBT0MsYUFBaEI7RUFDSCxDQVJlLEVBUWIsQ0FBQ3JCLEtBQUQsQ0FSYSxDQUFoQjs7RUFVQSxNQUFNc0IsV0FBVyxHQUFJQyxFQUFELElBQW1DO0lBQ25ELE9BQVFBLEVBQUUsQ0FBQ1IsTUFBSixDQUEyQkMsT0FBM0IsQ0FBbUNDLFdBQW5DLE9BQXFELEdBQTVEO0VBQ0gsQ0FGRDs7RUFJQSxJQUFBTyw0QkFBQSxFQUFjTixtQkFBZCxFQUFvQk8sT0FBRCxJQUFhO0lBQzVCLElBQUlBLE9BQU8sQ0FBQ0MsTUFBUixLQUFtQk4sZUFBQSxDQUFPQyxhQUE5QixFQUE2QztNQUN6QyxNQUFNTSxXQUFXLEdBQUc1QixJQUFJLENBQUM2QixZQUFMLENBQWtCQyxpQkFBbEIsQ0FBb0NDLGdCQUFBLENBQVVoQyxTQUE5QyxFQUF5REcsTUFBTSxDQUFDOEIsU0FBUCxFQUF6RCxDQUFwQjtNQUNBLE1BQU12QixJQUFJLEdBQUcsSUFBQUMsc0JBQUEsRUFBWUgsS0FBSyxFQUFFSSxJQUFuQixFQUF5QkosS0FBSyxFQUFFSyxJQUFoQyxFQUFzQ1AsR0FBdEMsRUFBMkMsSUFBM0MsQ0FBYjs7TUFFQSxNQUFNNEIsS0FBSyxHQUFHQyxjQUFBLENBQU1DLFlBQU4sQ0FBbUJDLG1CQUFuQixFQUErQjtRQUN6Q0MsS0FBSyxFQUFFckMsSUFBSSxDQUFDc0MsSUFENkI7UUFFekNDLFdBQVcsZUFBRSx1REFDVCw2QkFBQyxnQkFBRDtVQUNJLEVBQUUsRUFBQyxHQURQO1VBRUksT0FBTyxFQUFHZixFQUFELElBQW9CO1lBQ3pCLElBQUtBLEVBQUUsQ0FBQ1IsTUFBSixDQUEyQkMsT0FBM0IsQ0FBbUNDLFdBQW5DLE9BQXFELEdBQXpELEVBQThEO2NBQzFEZSxLQUFLLENBQUNPLEtBQU47WUFDSDtVQUNKO1FBTkwsR0FRTS9CLElBUk4sQ0FEUyxFQVdQbUIsV0FBVyxpQkFBSSw2QkFBQyx5QkFBRDtVQUNiLElBQUksRUFBQyxpQkFEUTtVQUViLE9BQU8sRUFBRSxNQUFNO1lBQ1hLLEtBQUssQ0FBQ08sS0FBTjs7WUFDQXJCLG1CQUFBLENBQUlzQixRQUFKLENBQWE7Y0FBRWQsTUFBTSxFQUFFO1lBQVYsQ0FBYjtVQUNIO1FBTFksR0FNWCxJQUFBZSxtQkFBQSxFQUFHLFlBQUgsQ0FOVyxDQVhSLENBRjRCO1FBc0J6Q0MsY0FBYyxFQUFFLElBdEJ5QjtRQXVCekNDLE1BQU0sRUFBRTtNQXZCaUMsQ0FBL0IsQ0FBZDtJQXlCSDtFQUNKLENBL0JEO0VBaUNBLE1BQU1DLFNBQVMsR0FBRyxJQUFBQyxtQkFBQSxFQUFXN0MsS0FBSyxDQUFDNEMsU0FBakIsRUFBNEIsY0FBNUIsQ0FBbEI7RUFFQSxvQkFBTywrREFBUzVDLEtBQVQ7SUFDSCxHQUFHLEVBQUVJLEdBREY7SUFFSCxPQUFPLEVBQUVRLE9BRk47SUFHSCxHQUFHLEVBQUMsTUFIRDtJQUlILFNBQVMsRUFBRWdDO0VBSlIsaUJBTUgsNkJBQUMsc0JBQUQ7SUFBZSxLQUFLLEVBQUUsSUFBQUgsbUJBQUEsRUFBRyxxQkFBSCxDQUF0QjtJQUFpRCxTQUFTLEVBQUVLLGtCQUFBLENBQVVDLE1BQXRFO0lBQThFLFdBQVcsRUFBRXpCO0VBQTNGLGdCQUNJLDZCQUFDLGdCQUFELFFBQ01kLElBRE4sQ0FESixDQU5HLENBQVA7QUFZSCJ9