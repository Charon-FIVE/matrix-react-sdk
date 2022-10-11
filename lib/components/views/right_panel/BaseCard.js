"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Group = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

var _RightPanelStorePhases = require("../../../stores/right-panel/RightPanelStorePhases");

var _context = require("./context");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const Group = _ref => {
  let {
    className,
    title,
    children
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)("mx_BaseCard_Group", className)
  }, /*#__PURE__*/_react.default.createElement("h1", null, title), children);
};

exports.Group = Group;
const BaseCard = /*#__PURE__*/(0, _react.forwardRef)((_ref2, ref) => {
  let {
    closeLabel,
    onClose,
    onBack,
    className,
    header,
    footer,
    withoutScrollContainer,
    children,
    onKeyDown
  } = _ref2;
  let backButton;
  const cardHistory = _RightPanelStore.default.instance.roomPhaseHistory;

  if (cardHistory.length > 1) {
    const prevCard = cardHistory[cardHistory.length - 2];

    const onBackClick = ev => {
      onBack?.(ev);

      _RightPanelStore.default.instance.popCard();
    };

    const label = (0, _RightPanelStorePhases.backLabelForPhase)(prevCard.phase) ?? (0, _languageHandler._t)("Back");
    backButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_BaseCard_back",
      onClick: onBackClick,
      title: label
    });
  }

  let closeButton;

  if (onClose) {
    closeButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      "data-test-id": "base-card-close-button",
      className: "mx_BaseCard_close",
      onClick: onClose,
      title: closeLabel || (0, _languageHandler._t)("Close")
    });
  }

  if (!withoutScrollContainer) {
    children = /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, null, children);
  }

  return /*#__PURE__*/_react.default.createElement(_context.CardContext.Provider, {
    value: {
      isCard: true
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)("mx_BaseCard", className),
    ref: ref,
    onKeyDown: onKeyDown
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BaseCard_header"
  }, backButton, closeButton, header), children, footer && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BaseCard_footer"
  }, footer)));
});
var _default = BaseCard;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHcm91cCIsImNsYXNzTmFtZSIsInRpdGxlIiwiY2hpbGRyZW4iLCJjbGFzc05hbWVzIiwiQmFzZUNhcmQiLCJmb3J3YXJkUmVmIiwicmVmIiwiY2xvc2VMYWJlbCIsIm9uQ2xvc2UiLCJvbkJhY2siLCJoZWFkZXIiLCJmb290ZXIiLCJ3aXRob3V0U2Nyb2xsQ29udGFpbmVyIiwib25LZXlEb3duIiwiYmFja0J1dHRvbiIsImNhcmRIaXN0b3J5IiwiUmlnaHRQYW5lbFN0b3JlIiwiaW5zdGFuY2UiLCJyb29tUGhhc2VIaXN0b3J5IiwibGVuZ3RoIiwicHJldkNhcmQiLCJvbkJhY2tDbGljayIsImV2IiwicG9wQ2FyZCIsImxhYmVsIiwiYmFja0xhYmVsRm9yUGhhc2UiLCJwaGFzZSIsIl90IiwiY2xvc2VCdXR0b24iLCJpc0NhcmQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yaWdodF9wYW5lbC9CYXNlQ2FyZC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYsIFJlYWN0Tm9kZSwgS2V5Ym9hcmRFdmVudCwgUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBBdXRvSGlkZVNjcm9sbGJhciBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9BdXRvSGlkZVNjcm9sbGJhclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiwgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmUnO1xuaW1wb3J0IHsgYmFja0xhYmVsRm9yUGhhc2UgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvcmlnaHQtcGFuZWwvUmlnaHRQYW5lbFN0b3JlUGhhc2VzJztcbmltcG9ydCB7IENhcmRDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0JztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgaGVhZGVyPzogUmVhY3ROb2RlO1xuICAgIGZvb3Rlcj86IFJlYWN0Tm9kZTtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgd2l0aG91dFNjcm9sbENvbnRhaW5lcj86IGJvb2xlYW47XG4gICAgY2xvc2VMYWJlbD86IHN0cmluZztcbiAgICBvbkNsb3NlPyhldjogQnV0dG9uRXZlbnQpOiB2b2lkO1xuICAgIG9uQmFjaz8oZXY6IEJ1dHRvbkV2ZW50KTogdm9pZDtcbiAgICBvbktleURvd24/KGV2OiBLZXlib2FyZEV2ZW50KTogdm9pZDtcbiAgICBjYXJkU3RhdGU/OiBhbnk7XG4gICAgcmVmPzogUmVmPEhUTUxEaXZFbGVtZW50Pjtcbn1cblxuaW50ZXJmYWNlIElHcm91cFByb3BzIHtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IEdyb3VwOiBSZWFjdC5GQzxJR3JvdXBQcm9wcz4gPSAoeyBjbGFzc05hbWUsIHRpdGxlLCBjaGlsZHJlbiB9KSA9PiB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfQmFzZUNhcmRfR3JvdXBcIiwgY2xhc3NOYW1lKX0+XG4gICAgICAgIDxoMT57IHRpdGxlIH08L2gxPlxuICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBCYXNlQ2FyZDogUmVhY3QuRkM8SVByb3BzPiA9IGZvcndhcmRSZWY8SFRNTERpdkVsZW1lbnQsIElQcm9wcz4oKHtcbiAgICBjbG9zZUxhYmVsLFxuICAgIG9uQ2xvc2UsXG4gICAgb25CYWNrLFxuICAgIGNsYXNzTmFtZSxcbiAgICBoZWFkZXIsXG4gICAgZm9vdGVyLFxuICAgIHdpdGhvdXRTY3JvbGxDb250YWluZXIsXG4gICAgY2hpbGRyZW4sXG4gICAgb25LZXlEb3duLFxufSwgcmVmKSA9PiB7XG4gICAgbGV0IGJhY2tCdXR0b247XG4gICAgY29uc3QgY2FyZEhpc3RvcnkgPSBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2Uucm9vbVBoYXNlSGlzdG9yeTtcbiAgICBpZiAoY2FyZEhpc3RvcnkubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCBwcmV2Q2FyZCA9IGNhcmRIaXN0b3J5W2NhcmRIaXN0b3J5Lmxlbmd0aCAtIDJdO1xuICAgICAgICBjb25zdCBvbkJhY2tDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgIG9uQmFjaz8uKGV2KTtcbiAgICAgICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5wb3BDYXJkKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGxhYmVsID0gYmFja0xhYmVsRm9yUGhhc2UocHJldkNhcmQucGhhc2UpID8/IF90KFwiQmFja1wiKTtcbiAgICAgICAgYmFja0J1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0Jhc2VDYXJkX2JhY2tcIiBvbkNsaWNrPXtvbkJhY2tDbGlja30gdGl0bGU9e2xhYmVsfSAvPjtcbiAgICB9XG5cbiAgICBsZXQgY2xvc2VCdXR0b247XG4gICAgaWYgKG9uQ2xvc2UpIHtcbiAgICAgICAgY2xvc2VCdXR0b24gPSA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgZGF0YS10ZXN0LWlkPSdiYXNlLWNhcmQtY2xvc2UtYnV0dG9uJ1xuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQmFzZUNhcmRfY2xvc2VcIlxuICAgICAgICAgICAgb25DbGljaz17b25DbG9zZX1cbiAgICAgICAgICAgIHRpdGxlPXtjbG9zZUxhYmVsIHx8IF90KFwiQ2xvc2VcIil9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIGlmICghd2l0aG91dFNjcm9sbENvbnRhaW5lcikge1xuICAgICAgICBjaGlsZHJlbiA9IDxBdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICA8L0F1dG9IaWRlU2Nyb2xsYmFyPjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Q2FyZENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3sgaXNDYXJkOiB0cnVlIH19PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9CYXNlQ2FyZFwiLCBjbGFzc05hbWUpfSByZWY9e3JlZn0gb25LZXlEb3duPXtvbktleURvd259PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQmFzZUNhcmRfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgYmFja0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIHsgY2xvc2VCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICB7IGhlYWRlciB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgeyBmb290ZXIgJiYgPGRpdiBjbGFzc05hbWU9XCJteF9CYXNlQ2FyZF9mb290ZXJcIj57IGZvb3RlciB9PC9kaXY+IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0NhcmRDb250ZXh0LlByb3ZpZGVyPlxuICAgICk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQmFzZUNhcmQ7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQThCTyxNQUFNQSxLQUE0QixHQUFHLFFBQW9DO0VBQUEsSUFBbkM7SUFBRUMsU0FBRjtJQUFhQyxLQUFiO0lBQW9CQztFQUFwQixDQUFtQztFQUM1RSxvQkFBTztJQUFLLFNBQVMsRUFBRSxJQUFBQyxtQkFBQSxFQUFXLG1CQUFYLEVBQWdDSCxTQUFoQztFQUFoQixnQkFDSCx5Q0FBTUMsS0FBTixDQURHLEVBRURDLFFBRkMsQ0FBUDtBQUlILENBTE07OztBQU9QLE1BQU1FLFFBQTBCLGdCQUFHLElBQUFDLGlCQUFBLEVBQW1DLFFBVW5FQyxHQVZtRSxLQVUzRDtFQUFBLElBVjREO0lBQ25FQyxVQURtRTtJQUVuRUMsT0FGbUU7SUFHbkVDLE1BSG1FO0lBSW5FVCxTQUptRTtJQUtuRVUsTUFMbUU7SUFNbkVDLE1BTm1FO0lBT25FQyxzQkFQbUU7SUFRbkVWLFFBUm1FO0lBU25FVztFQVRtRSxDQVU1RDtFQUNQLElBQUlDLFVBQUo7RUFDQSxNQUFNQyxXQUFXLEdBQUdDLHdCQUFBLENBQWdCQyxRQUFoQixDQUF5QkMsZ0JBQTdDOztFQUNBLElBQUlILFdBQVcsQ0FBQ0ksTUFBWixHQUFxQixDQUF6QixFQUE0QjtJQUN4QixNQUFNQyxRQUFRLEdBQUdMLFdBQVcsQ0FBQ0EsV0FBVyxDQUFDSSxNQUFaLEdBQXFCLENBQXRCLENBQTVCOztJQUNBLE1BQU1FLFdBQVcsR0FBSUMsRUFBRCxJQUFxQjtNQUNyQ2IsTUFBTSxHQUFHYSxFQUFILENBQU47O01BQ0FOLHdCQUFBLENBQWdCQyxRQUFoQixDQUF5Qk0sT0FBekI7SUFDSCxDQUhEOztJQUlBLE1BQU1DLEtBQUssR0FBRyxJQUFBQyx3Q0FBQSxFQUFrQkwsUUFBUSxDQUFDTSxLQUEzQixLQUFxQyxJQUFBQyxtQkFBQSxFQUFHLE1BQUgsQ0FBbkQ7SUFDQWIsVUFBVSxnQkFBRyw2QkFBQyx5QkFBRDtNQUFrQixTQUFTLEVBQUMsa0JBQTVCO01BQStDLE9BQU8sRUFBRU8sV0FBeEQ7TUFBcUUsS0FBSyxFQUFFRztJQUE1RSxFQUFiO0VBQ0g7O0VBRUQsSUFBSUksV0FBSjs7RUFDQSxJQUFJcEIsT0FBSixFQUFhO0lBQ1RvQixXQUFXLGdCQUFHLDZCQUFDLHlCQUFEO01BQ1YsZ0JBQWEsd0JBREg7TUFFVixTQUFTLEVBQUMsbUJBRkE7TUFHVixPQUFPLEVBQUVwQixPQUhDO01BSVYsS0FBSyxFQUFFRCxVQUFVLElBQUksSUFBQW9CLG1CQUFBLEVBQUcsT0FBSDtJQUpYLEVBQWQ7RUFNSDs7RUFFRCxJQUFJLENBQUNmLHNCQUFMLEVBQTZCO0lBQ3pCVixRQUFRLGdCQUFHLDZCQUFDLDBCQUFELFFBQ0xBLFFBREssQ0FBWDtFQUdIOztFQUVELG9CQUNJLDZCQUFDLG9CQUFELENBQWEsUUFBYjtJQUFzQixLQUFLLEVBQUU7TUFBRTJCLE1BQU0sRUFBRTtJQUFWO0VBQTdCLGdCQUNJO0lBQUssU0FBUyxFQUFFLElBQUExQixtQkFBQSxFQUFXLGFBQVgsRUFBMEJILFNBQTFCLENBQWhCO0lBQXNELEdBQUcsRUFBRU0sR0FBM0Q7SUFBZ0UsU0FBUyxFQUFFTztFQUEzRSxnQkFDSTtJQUFLLFNBQVMsRUFBQztFQUFmLEdBQ01DLFVBRE4sRUFFTWMsV0FGTixFQUdNbEIsTUFITixDQURKLEVBTU1SLFFBTk4sRUFPTVMsTUFBTSxpQkFBSTtJQUFLLFNBQVMsRUFBQztFQUFmLEdBQXNDQSxNQUF0QyxDQVBoQixDQURKLENBREo7QUFhSCxDQXBEa0MsQ0FBbkM7ZUFzRGVQLFEifQ==