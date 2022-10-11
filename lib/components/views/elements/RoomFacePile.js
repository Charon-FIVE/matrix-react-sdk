"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _lodash = require("lodash");

var _languageHandler = require("../../../languageHandler");

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _FacePile = _interopRequireDefault(require("./FacePile"));

var _useRoomMembers = require("../../../hooks/useRoomMembers");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

const _excluded = ["room", "onlyKnownUsers", "numShown"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const DEFAULT_NUM_FACES = 5;

const isKnownMember = member => !!_DMRoomMap.default.shared().getDMRoomsForUserId(member.userId)?.length;

const RoomFacePile = _ref => {
  let {
    room,
    onlyKnownUsers = true,
    numShown = DEFAULT_NUM_FACES
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const isJoined = room.getMyMembership() === "join";
  let members = (0, _useRoomMembers.useRoomMembers)(room);
  const count = members.length; // sort users with an explicit avatar first

  const iteratees = [member => member.getMxcAvatarUrl() ? 0 : 1];

  if (onlyKnownUsers) {
    members = members.filter(isKnownMember);
  } else {
    // sort known users first
    iteratees.unshift(member => isKnownMember(member) ? 0 : 1);
  } // exclude ourselves from the shown members list


  const shownMembers = (0, _lodash.sortBy)(members.filter(m => m.userId !== cli.getUserId()), iteratees).slice(0, numShown);
  if (shownMembers.length < 1) return null; // We reverse the order of the shown faces in CSS to simplify their visual overlap,
  // reverse members in tooltip order to make the order between the two match up.

  const commaSeparatedMembers = shownMembers.map(m => m.name).reverse().join(", ");

  const tooltip = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Tooltip_title"
  }, props.onClick ? (0, _languageHandler._t)("View all %(count)s members", {
    count
  }) : (0, _languageHandler._t)("%(count)s members", {
    count
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Tooltip_sub"
  }, isJoined ? (0, _languageHandler._t)("Including you, %(commaSeparatedMembers)s", {
    commaSeparatedMembers
  }) : (0, _languageHandler._t)("Including %(commaSeparatedMembers)s", {
    commaSeparatedMembers
  })));

  return /*#__PURE__*/_react.default.createElement(_FacePile.default, (0, _extends2.default)({
    members: shownMembers,
    faceSize: 28,
    overflow: members.length > numShown,
    tooltip: tooltip
  }, props), onlyKnownUsers && /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_FacePile_summary"
  }, (0, _languageHandler._t)("%(count)s people you know have already joined", {
    count: members.length
  })));
};

var _default = RoomFacePile;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJERUZBVUxUX05VTV9GQUNFUyIsImlzS25vd25NZW1iZXIiLCJtZW1iZXIiLCJETVJvb21NYXAiLCJzaGFyZWQiLCJnZXRETVJvb21zRm9yVXNlcklkIiwidXNlcklkIiwibGVuZ3RoIiwiUm9vbUZhY2VQaWxlIiwicm9vbSIsIm9ubHlLbm93blVzZXJzIiwibnVtU2hvd24iLCJwcm9wcyIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiaXNKb2luZWQiLCJnZXRNeU1lbWJlcnNoaXAiLCJtZW1iZXJzIiwidXNlUm9vbU1lbWJlcnMiLCJjb3VudCIsIml0ZXJhdGVlcyIsImdldE14Y0F2YXRhclVybCIsImZpbHRlciIsInVuc2hpZnQiLCJzaG93bk1lbWJlcnMiLCJzb3J0QnkiLCJtIiwiZ2V0VXNlcklkIiwic2xpY2UiLCJjb21tYVNlcGFyYXRlZE1lbWJlcnMiLCJtYXAiLCJuYW1lIiwicmV2ZXJzZSIsImpvaW4iLCJ0b29sdGlwIiwib25DbGljayIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvUm9vbUZhY2VQaWxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEtMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBGQywgSFRNTEF0dHJpYnV0ZXMsIHVzZUNvbnRleHQgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IFJvb21NZW1iZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyXCI7XG5pbXBvcnQgeyBzb3J0QnkgfSBmcm9tIFwibG9kYXNoXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQgRmFjZVBpbGUgZnJvbSBcIi4vRmFjZVBpbGVcIjtcbmltcG9ydCB7IHVzZVJvb21NZW1iZXJzIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVJvb21NZW1iZXJzXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuXG5jb25zdCBERUZBVUxUX05VTV9GQUNFUyA9IDU7XG5cbmNvbnN0IGlzS25vd25NZW1iZXIgPSAobWVtYmVyOiBSb29tTWVtYmVyKSA9PiAhIURNUm9vbU1hcC5zaGFyZWQoKS5nZXRETVJvb21zRm9yVXNlcklkKG1lbWJlci51c2VySWQpPy5sZW5ndGg7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBIVE1MQXR0cmlidXRlczxIVE1MU3BhbkVsZW1lbnQ+IHtcbiAgICByb29tOiBSb29tO1xuICAgIG9ubHlLbm93blVzZXJzPzogYm9vbGVhbjtcbiAgICBudW1TaG93bj86IG51bWJlcjtcbn1cblxuY29uc3QgUm9vbUZhY2VQaWxlOiBGQzxJUHJvcHM+ID0gKFxuICAgIHsgcm9vbSwgb25seUtub3duVXNlcnMgPSB0cnVlLCBudW1TaG93biA9IERFRkFVTFRfTlVNX0ZBQ0VTLCAuLi5wcm9wcyB9LFxuKSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCBpc0pvaW5lZCA9IHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiO1xuICAgIGxldCBtZW1iZXJzID0gdXNlUm9vbU1lbWJlcnMocm9vbSk7XG4gICAgY29uc3QgY291bnQgPSBtZW1iZXJzLmxlbmd0aDtcblxuICAgIC8vIHNvcnQgdXNlcnMgd2l0aCBhbiBleHBsaWNpdCBhdmF0YXIgZmlyc3RcbiAgICBjb25zdCBpdGVyYXRlZXMgPSBbbWVtYmVyID0+IG1lbWJlci5nZXRNeGNBdmF0YXJVcmwoKSA/IDAgOiAxXTtcbiAgICBpZiAob25seUtub3duVXNlcnMpIHtcbiAgICAgICAgbWVtYmVycyA9IG1lbWJlcnMuZmlsdGVyKGlzS25vd25NZW1iZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHNvcnQga25vd24gdXNlcnMgZmlyc3RcbiAgICAgICAgaXRlcmF0ZWVzLnVuc2hpZnQobWVtYmVyID0+IGlzS25vd25NZW1iZXIobWVtYmVyKSA/IDAgOiAxKTtcbiAgICB9XG5cbiAgICAvLyBleGNsdWRlIG91cnNlbHZlcyBmcm9tIHRoZSBzaG93biBtZW1iZXJzIGxpc3RcbiAgICBjb25zdCBzaG93bk1lbWJlcnMgPSBzb3J0QnkobWVtYmVycy5maWx0ZXIobSA9PiBtLnVzZXJJZCAhPT0gY2xpLmdldFVzZXJJZCgpKSwgaXRlcmF0ZWVzKS5zbGljZSgwLCBudW1TaG93bik7XG4gICAgaWYgKHNob3duTWVtYmVycy5sZW5ndGggPCAxKSByZXR1cm4gbnVsbDtcblxuICAgIC8vIFdlIHJldmVyc2UgdGhlIG9yZGVyIG9mIHRoZSBzaG93biBmYWNlcyBpbiBDU1MgdG8gc2ltcGxpZnkgdGhlaXIgdmlzdWFsIG92ZXJsYXAsXG4gICAgLy8gcmV2ZXJzZSBtZW1iZXJzIGluIHRvb2x0aXAgb3JkZXIgdG8gbWFrZSB0aGUgb3JkZXIgYmV0d2VlbiB0aGUgdHdvIG1hdGNoIHVwLlxuICAgIGNvbnN0IGNvbW1hU2VwYXJhdGVkTWVtYmVycyA9IHNob3duTWVtYmVycy5tYXAobSA9PiBtLm5hbWUpLnJldmVyc2UoKS5qb2luKFwiLCBcIik7XG5cbiAgICBjb25zdCB0b29sdGlwID0gPGRpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ub29sdGlwX3RpdGxlXCI+XG4gICAgICAgICAgICB7IHByb3BzLm9uQ2xpY2tcbiAgICAgICAgICAgICAgICA/IF90KFwiVmlldyBhbGwgJShjb3VudClzIG1lbWJlcnNcIiwgeyBjb3VudCB9KVxuICAgICAgICAgICAgICAgIDogX3QoXCIlKGNvdW50KXMgbWVtYmVyc1wiLCB7IGNvdW50IH0pIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVG9vbHRpcF9zdWJcIj5cbiAgICAgICAgICAgIHsgaXNKb2luZWRcbiAgICAgICAgICAgICAgICA/IF90KFwiSW5jbHVkaW5nIHlvdSwgJShjb21tYVNlcGFyYXRlZE1lbWJlcnMpc1wiLCB7IGNvbW1hU2VwYXJhdGVkTWVtYmVycyB9KVxuICAgICAgICAgICAgICAgIDogX3QoXCJJbmNsdWRpbmcgJShjb21tYVNlcGFyYXRlZE1lbWJlcnMpc1wiLCB7IGNvbW1hU2VwYXJhdGVkTWVtYmVycyB9KSB9XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PjtcblxuICAgIHJldHVybiA8RmFjZVBpbGVcbiAgICAgICAgbWVtYmVycz17c2hvd25NZW1iZXJzfVxuICAgICAgICBmYWNlU2l6ZT17Mjh9XG4gICAgICAgIG92ZXJmbG93PXttZW1iZXJzLmxlbmd0aCA+IG51bVNob3dufVxuICAgICAgICB0b29sdGlwPXt0b29sdGlwfVxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgPlxuICAgICAgICB7IG9ubHlLbm93blVzZXJzICYmIDxzcGFuIGNsYXNzTmFtZT1cIm14X0ZhY2VQaWxlX3N1bW1hcnlcIj5cbiAgICAgICAgICAgIHsgX3QoXCIlKGNvdW50KXMgcGVvcGxlIHlvdSBrbm93IGhhdmUgYWxyZWFkeSBqb2luZWRcIiwgeyBjb3VudDogbWVtYmVycy5sZW5ndGggfSkgfVxuICAgICAgICA8L3NwYW4+IH1cbiAgICA8L0ZhY2VQaWxlPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFJvb21GYWNlUGlsZTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxNQUFNQSxpQkFBaUIsR0FBRyxDQUExQjs7QUFFQSxNQUFNQyxhQUFhLEdBQUlDLE1BQUQsSUFBd0IsQ0FBQyxDQUFDQyxrQkFBQSxDQUFVQyxNQUFWLEdBQW1CQyxtQkFBbkIsQ0FBdUNILE1BQU0sQ0FBQ0ksTUFBOUMsR0FBdURDLE1BQXZHOztBQVFBLE1BQU1DLFlBQXdCLEdBQUcsUUFFNUI7RUFBQSxJQUREO0lBQUVDLElBQUY7SUFBUUMsY0FBYyxHQUFHLElBQXpCO0lBQStCQyxRQUFRLEdBQUdYO0VBQTFDLENBQ0M7RUFBQSxJQUQrRFksS0FDL0Q7RUFDRCxNQUFNQyxHQUFHLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0MsNEJBQVgsQ0FBWjtFQUNBLE1BQU1DLFFBQVEsR0FBR1AsSUFBSSxDQUFDUSxlQUFMLE9BQTJCLE1BQTVDO0VBQ0EsSUFBSUMsT0FBTyxHQUFHLElBQUFDLDhCQUFBLEVBQWVWLElBQWYsQ0FBZDtFQUNBLE1BQU1XLEtBQUssR0FBR0YsT0FBTyxDQUFDWCxNQUF0QixDQUpDLENBTUQ7O0VBQ0EsTUFBTWMsU0FBUyxHQUFHLENBQUNuQixNQUFNLElBQUlBLE1BQU0sQ0FBQ29CLGVBQVAsS0FBMkIsQ0FBM0IsR0FBK0IsQ0FBMUMsQ0FBbEI7O0VBQ0EsSUFBSVosY0FBSixFQUFvQjtJQUNoQlEsT0FBTyxHQUFHQSxPQUFPLENBQUNLLE1BQVIsQ0FBZXRCLGFBQWYsQ0FBVjtFQUNILENBRkQsTUFFTztJQUNIO0lBQ0FvQixTQUFTLENBQUNHLE9BQVYsQ0FBa0J0QixNQUFNLElBQUlELGFBQWEsQ0FBQ0MsTUFBRCxDQUFiLEdBQXdCLENBQXhCLEdBQTRCLENBQXhEO0VBQ0gsQ0FiQSxDQWVEOzs7RUFDQSxNQUFNdUIsWUFBWSxHQUFHLElBQUFDLGNBQUEsRUFBT1IsT0FBTyxDQUFDSyxNQUFSLENBQWVJLENBQUMsSUFBSUEsQ0FBQyxDQUFDckIsTUFBRixLQUFhTyxHQUFHLENBQUNlLFNBQUosRUFBakMsQ0FBUCxFQUEwRFAsU0FBMUQsRUFBcUVRLEtBQXJFLENBQTJFLENBQTNFLEVBQThFbEIsUUFBOUUsQ0FBckI7RUFDQSxJQUFJYyxZQUFZLENBQUNsQixNQUFiLEdBQXNCLENBQTFCLEVBQTZCLE9BQU8sSUFBUCxDQWpCNUIsQ0FtQkQ7RUFDQTs7RUFDQSxNQUFNdUIscUJBQXFCLEdBQUdMLFlBQVksQ0FBQ00sR0FBYixDQUFpQkosQ0FBQyxJQUFJQSxDQUFDLENBQUNLLElBQXhCLEVBQThCQyxPQUE5QixHQUF3Q0MsSUFBeEMsQ0FBNkMsSUFBN0MsQ0FBOUI7O0VBRUEsTUFBTUMsT0FBTyxnQkFBRyx1REFDWjtJQUFLLFNBQVMsRUFBQztFQUFmLEdBQ012QixLQUFLLENBQUN3QixPQUFOLEdBQ0ksSUFBQUMsbUJBQUEsRUFBRyw0QkFBSCxFQUFpQztJQUFFakI7RUFBRixDQUFqQyxDQURKLEdBRUksSUFBQWlCLG1CQUFBLEVBQUcsbUJBQUgsRUFBd0I7SUFBRWpCO0VBQUYsQ0FBeEIsQ0FIVixDQURZLGVBTVo7SUFBSyxTQUFTLEVBQUM7RUFBZixHQUNNSixRQUFRLEdBQ0osSUFBQXFCLG1CQUFBLEVBQUcsMENBQUgsRUFBK0M7SUFBRVA7RUFBRixDQUEvQyxDQURJLEdBRUosSUFBQU8sbUJBQUEsRUFBRyxxQ0FBSCxFQUEwQztJQUFFUDtFQUFGLENBQTFDLENBSFYsQ0FOWSxDQUFoQjs7RUFhQSxvQkFBTyw2QkFBQyxpQkFBRDtJQUNILE9BQU8sRUFBRUwsWUFETjtJQUVILFFBQVEsRUFBRSxFQUZQO0lBR0gsUUFBUSxFQUFFUCxPQUFPLENBQUNYLE1BQVIsR0FBaUJJLFFBSHhCO0lBSUgsT0FBTyxFQUFFd0I7RUFKTixHQUtDdkIsS0FMRCxHQU9ERixjQUFjLGlCQUFJO0lBQU0sU0FBUyxFQUFDO0VBQWhCLEdBQ2QsSUFBQTJCLG1CQUFBLEVBQUcsK0NBQUgsRUFBb0Q7SUFBRWpCLEtBQUssRUFBRUYsT0FBTyxDQUFDWDtFQUFqQixDQUFwRCxDQURjLENBUGpCLENBQVA7QUFXSCxDQWpERDs7ZUFtRGVDLFkifQ==