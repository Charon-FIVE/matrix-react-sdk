"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _BreadcrumbsStore = require("../../../stores/BreadcrumbsStore");

var _AsyncStore = require("../../../stores/AsyncStore");

var _ContextMenu = require("../../structures/ContextMenu");

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RoomContextDetails = require("./RoomContextDetails");

var _InteractiveTooltip = _interopRequireWildcard(require("../elements/InteractiveTooltip"));

var _actions = require("../../../dispatcher/actions");

var _DecoratedRoomAvatar = _interopRequireDefault(require("../avatars/DecoratedRoomAvatar"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

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
const RecentlyViewedButton = () => {
  const tooltipRef = (0, _react.useRef)();
  const crumbs = (0, _useEventEmitter.useEventEmitterState)(_BreadcrumbsStore.BreadcrumbsStore.instance, _AsyncStore.UPDATE_EVENT, () => _BreadcrumbsStore.BreadcrumbsStore.instance.rooms);

  const content = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RecentlyViewedButton_ContextMenu"
  }, /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("Recently viewed")), /*#__PURE__*/_react.default.createElement("div", null, crumbs.map(crumb => {
    return /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
      key: crumb.roomId,
      onClick: ev => {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: crumb.roomId,
          metricsTrigger: "WebVerticalBreadcrumbs",
          metricsViaKeyboard: ev.type !== "click"
        });

        tooltipRef.current?.hideTooltip();
      }
    }, crumb.isSpaceRoom() ? /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: crumb,
      width: 24,
      height: 24
    }) : /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
      room: crumb,
      avatarSize: 24,
      tooltipProps: {
        tabIndex: -1
      }
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_RecentlyViewedButton_entry_label"
    }, /*#__PURE__*/_react.default.createElement("div", null, crumb.name), /*#__PURE__*/_react.default.createElement(_RoomContextDetails.RoomContextDetails, {
      className: "mx_RecentlyViewedButton_entry_spaces",
      room: crumb
    })));
  })));

  return /*#__PURE__*/_react.default.createElement(_InteractiveTooltip.default, {
    content: content,
    direction: _InteractiveTooltip.Direction.Right,
    ref: tooltipRef
  }, _ref => {
    let {
      ref,
      onMouseOver
    } = _ref;
    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_LeftPanel_recentsButton",
      title: (0, _languageHandler._t)("Recently viewed"),
      ref: ref,
      onMouseOver: onMouseOver
    });
  });
};

var _default = RecentlyViewedButton;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWNlbnRseVZpZXdlZEJ1dHRvbiIsInRvb2x0aXBSZWYiLCJ1c2VSZWYiLCJjcnVtYnMiLCJ1c2VFdmVudEVtaXR0ZXJTdGF0ZSIsIkJyZWFkY3J1bWJzU3RvcmUiLCJpbnN0YW5jZSIsIlVQREFURV9FVkVOVCIsInJvb21zIiwiY29udGVudCIsIl90IiwibWFwIiwiY3J1bWIiLCJyb29tSWQiLCJldiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1Jvb20iLCJyb29tX2lkIiwibWV0cmljc1RyaWdnZXIiLCJtZXRyaWNzVmlhS2V5Ym9hcmQiLCJ0eXBlIiwiY3VycmVudCIsImhpZGVUb29sdGlwIiwiaXNTcGFjZVJvb20iLCJ0YWJJbmRleCIsIm5hbWUiLCJEaXJlY3Rpb24iLCJSaWdodCIsInJlZiIsIm9uTW91c2VPdmVyIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvUmVjZW50bHlWaWV3ZWRCdXR0b24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgQnJlYWRjcnVtYnNTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQnJlYWRjcnVtYnNTdG9yZVwiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgeyBNZW51SXRlbSB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgeyB1c2VFdmVudEVtaXR0ZXJTdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXJcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBSb29tQ29udGV4dERldGFpbHMgfSBmcm9tIFwiLi9Sb29tQ29udGV4dERldGFpbHNcIjtcbmltcG9ydCBJbnRlcmFjdGl2ZVRvb2x0aXAsIHsgRGlyZWN0aW9uIH0gZnJvbSBcIi4uL2VsZW1lbnRzL0ludGVyYWN0aXZlVG9vbHRpcFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IERlY29yYXRlZFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvRGVjb3JhdGVkUm9vbUF2YXRhclwiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9Sb29tQXZhdGFyXCI7XG5cbmNvbnN0IFJlY2VudGx5Vmlld2VkQnV0dG9uID0gKCkgPT4ge1xuICAgIGNvbnN0IHRvb2x0aXBSZWYgPSB1c2VSZWY8SW50ZXJhY3RpdmVUb29sdGlwPigpO1xuICAgIGNvbnN0IGNydW1icyA9IHVzZUV2ZW50RW1pdHRlclN0YXRlKEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2UsIFVQREFURV9FVkVOVCwgKCkgPT4gQnJlYWRjcnVtYnNTdG9yZS5pbnN0YW5jZS5yb29tcyk7XG5cbiAgICBjb25zdCBjb250ZW50ID0gPGRpdiBjbGFzc05hbWU9XCJteF9SZWNlbnRseVZpZXdlZEJ1dHRvbl9Db250ZXh0TWVudVwiPlxuICAgICAgICA8aDQ+eyBfdChcIlJlY2VudGx5IHZpZXdlZFwiKSB9PC9oND5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIHsgY3J1bWJzLm1hcChjcnVtYiA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxNZW51SXRlbVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2NydW1iLnJvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogY3J1bWIucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIldlYlZlcnRpY2FsQnJlYWRjcnVtYnNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVmlhS2V5Ym9hcmQ6IGV2LnR5cGUgIT09IFwiY2xpY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcFJlZi5jdXJyZW50Py5oaWRlVG9vbHRpcCgpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBjcnVtYi5pc1NwYWNlUm9vbSgpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IDxSb29tQXZhdGFyIHJvb209e2NydW1ifSB3aWR0aD17MjR9IGhlaWdodD17MjR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA6IDxEZWNvcmF0ZWRSb29tQXZhdGFyIHJvb209e2NydW1ifSBhdmF0YXJTaXplPXsyNH0gdG9vbHRpcFByb3BzPXt7IHRhYkluZGV4OiAtMSB9fSAvPlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1JlY2VudGx5Vmlld2VkQnV0dG9uX2VudHJ5X2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PnsgY3J1bWIubmFtZSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUNvbnRleHREZXRhaWxzIGNsYXNzTmFtZT1cIm14X1JlY2VudGx5Vmlld2VkQnV0dG9uX2VudHJ5X3NwYWNlc1wiIHJvb209e2NydW1ifSAvPlxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT47XG4gICAgICAgICAgICB9KSB9XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PjtcblxuICAgIHJldHVybiA8SW50ZXJhY3RpdmVUb29sdGlwIGNvbnRlbnQ9e2NvbnRlbnR9IGRpcmVjdGlvbj17RGlyZWN0aW9uLlJpZ2h0fSByZWY9e3Rvb2x0aXBSZWZ9PlxuICAgICAgICB7ICh7IHJlZiwgb25Nb3VzZU92ZXIgfSkgPT4gKFxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfcmVjZW50c0J1dHRvblwiXG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiUmVjZW50bHkgdmlld2VkXCIpfVxuICAgICAgICAgICAgICAgIHJlZj17cmVmfVxuICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyPXtvbk1vdXNlT3Zlcn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICkgfVxuICAgIDwvSW50ZXJhY3RpdmVUb29sdGlwPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFJlY2VudGx5Vmlld2VkQnV0dG9uO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7OztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkEsTUFBTUEsb0JBQW9CLEdBQUcsTUFBTTtFQUMvQixNQUFNQyxVQUFVLEdBQUcsSUFBQUMsYUFBQSxHQUFuQjtFQUNBLE1BQU1DLE1BQU0sR0FBRyxJQUFBQyxxQ0FBQSxFQUFxQkMsa0NBQUEsQ0FBaUJDLFFBQXRDLEVBQWdEQyx3QkFBaEQsRUFBOEQsTUFBTUYsa0NBQUEsQ0FBaUJDLFFBQWpCLENBQTBCRSxLQUE5RixDQUFmOztFQUVBLE1BQU1DLE9BQU8sZ0JBQUc7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDWix5Q0FBTSxJQUFBQyxtQkFBQSxFQUFHLGlCQUFILENBQU4sQ0FEWSxlQUVaLDBDQUNNUCxNQUFNLENBQUNRLEdBQVAsQ0FBV0MsS0FBSyxJQUFJO0lBQ2xCLG9CQUFPLDZCQUFDLHFCQUFEO01BQ0gsR0FBRyxFQUFFQSxLQUFLLENBQUNDLE1BRFI7TUFFSCxPQUFPLEVBQUdDLEVBQUQsSUFBUTtRQUNiQyxtQkFBQSxDQUFJQyxRQUFKLENBQThCO1VBQzFCQyxNQUFNLEVBQUVDLGVBQUEsQ0FBT0MsUUFEVztVQUUxQkMsT0FBTyxFQUFFUixLQUFLLENBQUNDLE1BRlc7VUFHMUJRLGNBQWMsRUFBRSx3QkFIVTtVQUkxQkMsa0JBQWtCLEVBQUVSLEVBQUUsQ0FBQ1MsSUFBSCxLQUFZO1FBSk4sQ0FBOUI7O1FBTUF0QixVQUFVLENBQUN1QixPQUFYLEVBQW9CQyxXQUFwQjtNQUNIO0lBVkUsR0FZRGIsS0FBSyxDQUFDYyxXQUFOLGtCQUNJLDZCQUFDLG1CQUFEO01BQVksSUFBSSxFQUFFZCxLQUFsQjtNQUF5QixLQUFLLEVBQUUsRUFBaEM7TUFBb0MsTUFBTSxFQUFFO0lBQTVDLEVBREosZ0JBRUksNkJBQUMsNEJBQUQ7TUFBcUIsSUFBSSxFQUFFQSxLQUEzQjtNQUFrQyxVQUFVLEVBQUUsRUFBOUM7TUFBa0QsWUFBWSxFQUFFO1FBQUVlLFFBQVEsRUFBRSxDQUFDO01BQWI7SUFBaEUsRUFkSCxlQWdCSDtNQUFNLFNBQVMsRUFBQztJQUFoQixnQkFDSSwwQ0FBT2YsS0FBSyxDQUFDZ0IsSUFBYixDQURKLGVBRUksNkJBQUMsc0NBQUQ7TUFBb0IsU0FBUyxFQUFDLHNDQUE5QjtNQUFxRSxJQUFJLEVBQUVoQjtJQUEzRSxFQUZKLENBaEJHLENBQVA7RUFxQkgsQ0F0QkMsQ0FETixDQUZZLENBQWhCOztFQTZCQSxvQkFBTyw2QkFBQywyQkFBRDtJQUFvQixPQUFPLEVBQUVILE9BQTdCO0lBQXNDLFNBQVMsRUFBRW9CLDZCQUFBLENBQVVDLEtBQTNEO0lBQWtFLEdBQUcsRUFBRTdCO0VBQXZFLEdBQ0Q7SUFBQSxJQUFDO01BQUU4QixHQUFGO01BQU9DO0lBQVAsQ0FBRDtJQUFBLG9CQUNFO01BQ0ksU0FBUyxFQUFDLDRCQURkO01BRUksS0FBSyxFQUFFLElBQUF0QixtQkFBQSxFQUFHLGlCQUFILENBRlg7TUFHSSxHQUFHLEVBQUVxQixHQUhUO01BSUksV0FBVyxFQUFFQztJQUpqQixFQURGO0VBQUEsQ0FEQyxDQUFQO0FBVUgsQ0EzQ0Q7O2VBNkNlaEMsb0IifQ==