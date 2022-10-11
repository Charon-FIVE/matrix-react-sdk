"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _ConfirmUserActionDialog = _interopRequireDefault(require("./ConfirmUserActionDialog"));

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _SpaceChildrenPicker = _interopRequireDefault(require("../spaces/SpaceChildrenPicker"));

const _excluded = ["space", "spaceChildFilter", "allLabel", "specificLabel", "noneLabel", "warningMessage", "onFinished"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const ConfirmSpaceUserActionDialog = _ref => {
  let {
    space,
    spaceChildFilter,
    allLabel,
    specificLabel,
    noneLabel,
    warningMessage,
    onFinished
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const spaceChildren = (0, _react.useMemo)(() => {
    const children = _SpaceStore.default.instance.getChildren(space.roomId);

    if (spaceChildFilter) {
      return children.filter(spaceChildFilter);
    }

    return children;
  }, [space.roomId, spaceChildFilter]);
  const [roomsToLeave, setRoomsToLeave] = (0, _react.useState)([]);
  const selectedRooms = (0, _react.useMemo)(() => new Set(roomsToLeave), [roomsToLeave]);
  let warning;

  if (warningMessage) {
    warning = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ConfirmSpaceUserActionDialog_warning"
    }, warningMessage);
  }

  return /*#__PURE__*/_react.default.createElement(_ConfirmUserActionDialog.default, (0, _extends2.default)({}, props, {
    onFinished: (success, reason) => {
      onFinished(success, reason, roomsToLeave);
    },
    className: "mx_ConfirmSpaceUserActionDialog",
    roomId: space.roomId
  }), warning, /*#__PURE__*/_react.default.createElement(_SpaceChildrenPicker.default, {
    space: space,
    spaceChildren: spaceChildren,
    selected: selectedRooms,
    allLabel: allLabel,
    specificLabel: specificLabel,
    noneLabel: noneLabel,
    onChange: setRoomsToLeave
  }));
};

var _default = ConfirmSpaceUserActionDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25maXJtU3BhY2VVc2VyQWN0aW9uRGlhbG9nIiwic3BhY2UiLCJzcGFjZUNoaWxkRmlsdGVyIiwiYWxsTGFiZWwiLCJzcGVjaWZpY0xhYmVsIiwibm9uZUxhYmVsIiwid2FybmluZ01lc3NhZ2UiLCJvbkZpbmlzaGVkIiwicHJvcHMiLCJzcGFjZUNoaWxkcmVuIiwidXNlTWVtbyIsImNoaWxkcmVuIiwiU3BhY2VTdG9yZSIsImluc3RhbmNlIiwiZ2V0Q2hpbGRyZW4iLCJyb29tSWQiLCJmaWx0ZXIiLCJyb29tc1RvTGVhdmUiLCJzZXRSb29tc1RvTGVhdmUiLCJ1c2VTdGF0ZSIsInNlbGVjdGVkUm9vbXMiLCJTZXQiLCJ3YXJuaW5nIiwic3VjY2VzcyIsInJlYXNvbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ29uZmlybVNwYWNlVXNlckFjdGlvbkRpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudFByb3BzLCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IENvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nIGZyb20gXCIuL0NvbmZpcm1Vc2VyQWN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3NwYWNlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQgU3BhY2VDaGlsZHJlblBpY2tlciBmcm9tIFwiLi4vc3BhY2VzL1NwYWNlQ2hpbGRyZW5QaWNrZXJcIjtcblxudHlwZSBCYXNlUHJvcHMgPSBDb21wb25lbnRQcm9wczx0eXBlb2YgQ29uZmlybVVzZXJBY3Rpb25EaWFsb2c+O1xuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIE9taXQ8QmFzZVByb3BzLCBcIm1hdHJpeENsaWVudFwiIHwgXCJjaGlsZHJlblwiIHwgXCJvbkZpbmlzaGVkXCI+IHtcbiAgICBzcGFjZTogUm9vbTtcbiAgICBhbGxMYWJlbDogc3RyaW5nO1xuICAgIHNwZWNpZmljTGFiZWw6IHN0cmluZztcbiAgICBub25lTGFiZWw/OiBzdHJpbmc7XG4gICAgd2FybmluZ01lc3NhZ2U/OiBzdHJpbmc7XG4gICAgb25GaW5pc2hlZChzdWNjZXNzOiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcsIHJvb21zPzogUm9vbVtdKTogdm9pZDtcbiAgICBzcGFjZUNoaWxkRmlsdGVyPyhjaGlsZDogUm9vbSk6IGJvb2xlYW47XG59XG5cbmNvbnN0IENvbmZpcm1TcGFjZVVzZXJBY3Rpb25EaWFsb2c6IFJlYWN0LkZDPElQcm9wcz4gPSAoe1xuICAgIHNwYWNlLFxuICAgIHNwYWNlQ2hpbGRGaWx0ZXIsXG4gICAgYWxsTGFiZWwsXG4gICAgc3BlY2lmaWNMYWJlbCxcbiAgICBub25lTGFiZWwsXG4gICAgd2FybmluZ01lc3NhZ2UsXG4gICAgb25GaW5pc2hlZCxcbiAgICAuLi5wcm9wc1xufSkgPT4ge1xuICAgIGNvbnN0IHNwYWNlQ2hpbGRyZW4gPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBTcGFjZVN0b3JlLmluc3RhbmNlLmdldENoaWxkcmVuKHNwYWNlLnJvb21JZCk7XG4gICAgICAgIGlmIChzcGFjZUNoaWxkRmlsdGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRyZW4uZmlsdGVyKHNwYWNlQ2hpbGRGaWx0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICB9LCBbc3BhY2Uucm9vbUlkLCBzcGFjZUNoaWxkRmlsdGVyXSk7XG5cbiAgICBjb25zdCBbcm9vbXNUb0xlYXZlLCBzZXRSb29tc1RvTGVhdmVdID0gdXNlU3RhdGU8Um9vbVtdPihbXSk7XG4gICAgY29uc3Qgc2VsZWN0ZWRSb29tcyA9IHVzZU1lbW8oKCkgPT4gbmV3IFNldChyb29tc1RvTGVhdmUpLCBbcm9vbXNUb0xlYXZlXSk7XG5cbiAgICBsZXQgd2FybmluZzogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKHdhcm5pbmdNZXNzYWdlKSB7XG4gICAgICAgIHdhcm5pbmcgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0NvbmZpcm1TcGFjZVVzZXJBY3Rpb25EaWFsb2dfd2FybmluZ1wiPlxuICAgICAgICAgICAgeyB3YXJuaW5nTWVzc2FnZSB9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Q29uZmlybVVzZXJBY3Rpb25EaWFsb2dcbiAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAgIG9uRmluaXNoZWQ9eyhzdWNjZXNzOiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKHN1Y2Nlc3MsIHJlYXNvbiwgcm9vbXNUb0xlYXZlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Db25maXJtU3BhY2VVc2VyQWN0aW9uRGlhbG9nXCJcbiAgICAgICAgICAgIHJvb21JZD17c3BhY2Uucm9vbUlkfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IHdhcm5pbmcgfVxuICAgICAgICAgICAgPFNwYWNlQ2hpbGRyZW5QaWNrZXJcbiAgICAgICAgICAgICAgICBzcGFjZT17c3BhY2V9XG4gICAgICAgICAgICAgICAgc3BhY2VDaGlsZHJlbj17c3BhY2VDaGlsZHJlbn1cbiAgICAgICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWRSb29tc31cbiAgICAgICAgICAgICAgICBhbGxMYWJlbD17YWxsTGFiZWx9XG4gICAgICAgICAgICAgICAgc3BlY2lmaWNMYWJlbD17c3BlY2lmaWNMYWJlbH1cbiAgICAgICAgICAgICAgICBub25lTGFiZWw9e25vbmVMYWJlbH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0Um9vbXNUb0xlYXZlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9Db25maXJtVXNlckFjdGlvbkRpYWxvZz5cbiAgICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29uZmlybVNwYWNlVXNlckFjdGlvbkRpYWxvZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFhQSxNQUFNQSw0QkFBOEMsR0FBRyxRQVNqRDtFQUFBLElBVGtEO0lBQ3BEQyxLQURvRDtJQUVwREMsZ0JBRm9EO0lBR3BEQyxRQUhvRDtJQUlwREMsYUFKb0Q7SUFLcERDLFNBTG9EO0lBTXBEQyxjQU5vRDtJQU9wREM7RUFQb0QsQ0FTbEQ7RUFBQSxJQURDQyxLQUNEO0VBQ0YsTUFBTUMsYUFBYSxHQUFHLElBQUFDLGNBQUEsRUFBUSxNQUFNO0lBQ2hDLE1BQU1DLFFBQVEsR0FBR0MsbUJBQUEsQ0FBV0MsUUFBWCxDQUFvQkMsV0FBcEIsQ0FBZ0NiLEtBQUssQ0FBQ2MsTUFBdEMsQ0FBakI7O0lBQ0EsSUFBSWIsZ0JBQUosRUFBc0I7TUFDbEIsT0FBT1MsUUFBUSxDQUFDSyxNQUFULENBQWdCZCxnQkFBaEIsQ0FBUDtJQUNIOztJQUNELE9BQU9TLFFBQVA7RUFDSCxDQU5xQixFQU1uQixDQUFDVixLQUFLLENBQUNjLE1BQVAsRUFBZWIsZ0JBQWYsQ0FObUIsQ0FBdEI7RUFRQSxNQUFNLENBQUNlLFlBQUQsRUFBZUMsZUFBZixJQUFrQyxJQUFBQyxlQUFBLEVBQWlCLEVBQWpCLENBQXhDO0VBQ0EsTUFBTUMsYUFBYSxHQUFHLElBQUFWLGNBQUEsRUFBUSxNQUFNLElBQUlXLEdBQUosQ0FBUUosWUFBUixDQUFkLEVBQXFDLENBQUNBLFlBQUQsQ0FBckMsQ0FBdEI7RUFFQSxJQUFJSyxPQUFKOztFQUNBLElBQUloQixjQUFKLEVBQW9CO0lBQ2hCZ0IsT0FBTyxnQkFBRztNQUFLLFNBQVMsRUFBQztJQUFmLEdBQ0poQixjQURJLENBQVY7RUFHSDs7RUFFRCxvQkFDSSw2QkFBQyxnQ0FBRCw2QkFDUUUsS0FEUjtJQUVJLFVBQVUsRUFBRSxDQUFDZSxPQUFELEVBQW1CQyxNQUFuQixLQUF1QztNQUMvQ2pCLFVBQVUsQ0FBQ2dCLE9BQUQsRUFBVUMsTUFBVixFQUFrQlAsWUFBbEIsQ0FBVjtJQUNILENBSkw7SUFLSSxTQUFTLEVBQUMsaUNBTGQ7SUFNSSxNQUFNLEVBQUVoQixLQUFLLENBQUNjO0VBTmxCLElBUU1PLE9BUk4sZUFTSSw2QkFBQyw0QkFBRDtJQUNJLEtBQUssRUFBRXJCLEtBRFg7SUFFSSxhQUFhLEVBQUVRLGFBRm5CO0lBR0ksUUFBUSxFQUFFVyxhQUhkO0lBSUksUUFBUSxFQUFFakIsUUFKZDtJQUtJLGFBQWEsRUFBRUMsYUFMbkI7SUFNSSxTQUFTLEVBQUVDLFNBTmY7SUFPSSxRQUFRLEVBQUVhO0VBUGQsRUFUSixDQURKO0FBcUJILENBakREOztlQW1EZWxCLDRCIn0=