"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _BaseCard = _interopRequireDefault(require("./BaseCard"));

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _AppTile = _interopRequireDefault(require("../elements/AppTile"));

var _languageHandler = require("../../../languageHandler");

var _RoomSummaryCard = require("./RoomSummaryCard");

var _ContextMenu = require("../../structures/ContextMenu");

var _WidgetContextMenu = _interopRequireDefault(require("../context_menus/WidgetContextMenu"));

var _WidgetLayoutStore = require("../../../stores/widgets/WidgetLayoutStore");

var _UIStore = _interopRequireDefault(require("../../../stores/UIStore"));

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

var _Heading = _interopRequireDefault(require("../typography/Heading"));

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
const WidgetCard = _ref => {
  let {
    room,
    widgetId,
    onClose
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const apps = (0, _RoomSummaryCard.useWidgets)(room);
  const app = apps.find(a => a.id === widgetId);

  const isRight = app && _WidgetLayoutStore.WidgetLayoutStore.instance.isInContainer(room, app, _WidgetLayoutStore.Container.Right);

  const [menuDisplayed, handle, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  (0, _react.useEffect)(() => {
    if (!app || !isRight) {
      // stop showing this card
      _RightPanelStore.default.instance.popCard();
    }
  }, [app, isRight]); // Don't render anything as we are about to transition

  if (!app || !isRight) return null;
  let contextMenu;

  if (menuDisplayed) {
    const rect = handle.current.getBoundingClientRect();
    contextMenu = /*#__PURE__*/_react.default.createElement(_WidgetContextMenu.default, {
      chevronFace: _ContextMenu.ChevronFace.None,
      right: _UIStore.default.instance.windowWidth - rect.right - 12,
      top: rect.bottom + 12,
      onFinished: closeMenu,
      app: app
    });
  }

  const header = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_BaseCard_header_title"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h4",
    className: "mx_BaseCard_header_title_heading"
  }, _WidgetUtils.default.getWidgetName(app)), /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
    className: "mx_BaseCard_header_title_button--option",
    inputRef: handle,
    onClick: openMenu,
    isExpanded: menuDisplayed,
    label: (0, _languageHandler._t)("Options")
  }), contextMenu);

  return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
    header: header,
    className: "mx_WidgetCard",
    onClose: onClose,
    withoutScrollContainer: true
  }, /*#__PURE__*/_react.default.createElement(_AppTile.default, {
    app: app,
    fullWidth: true,
    showMenubar: false,
    room: room,
    userId: cli.getUserId(),
    creatorUserId: app.creatorUserId,
    widgetPageTitle: _WidgetUtils.default.getWidgetDataTitle(app),
    waitForIframeLoad: app.waitForIframeLoad
  }));
};

var _default = WidgetCard;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJXaWRnZXRDYXJkIiwicm9vbSIsIndpZGdldElkIiwib25DbG9zZSIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiYXBwcyIsInVzZVdpZGdldHMiLCJhcHAiLCJmaW5kIiwiYSIsImlkIiwiaXNSaWdodCIsIldpZGdldExheW91dFN0b3JlIiwiaW5zdGFuY2UiLCJpc0luQ29udGFpbmVyIiwiQ29udGFpbmVyIiwiUmlnaHQiLCJtZW51RGlzcGxheWVkIiwiaGFuZGxlIiwib3Blbk1lbnUiLCJjbG9zZU1lbnUiLCJ1c2VDb250ZXh0TWVudSIsInVzZUVmZmVjdCIsIlJpZ2h0UGFuZWxTdG9yZSIsInBvcENhcmQiLCJjb250ZXh0TWVudSIsInJlY3QiLCJjdXJyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiQ2hldnJvbkZhY2UiLCJOb25lIiwiVUlTdG9yZSIsIndpbmRvd1dpZHRoIiwicmlnaHQiLCJib3R0b20iLCJoZWFkZXIiLCJXaWRnZXRVdGlscyIsImdldFdpZGdldE5hbWUiLCJfdCIsImdldFVzZXJJZCIsImNyZWF0b3JVc2VySWQiLCJnZXRXaWRnZXREYXRhVGl0bGUiLCJ3YWl0Rm9ySWZyYW1lTG9hZCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3JpZ2h0X3BhbmVsL1dpZGdldENhcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0LCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBCYXNlQ2FyZCBmcm9tIFwiLi9CYXNlQ2FyZFwiO1xuaW1wb3J0IFdpZGdldFV0aWxzIGZyb20gXCIuLi8uLi8uLi91dGlscy9XaWRnZXRVdGlsc1wiO1xuaW1wb3J0IEFwcFRpbGUgZnJvbSBcIi4uL2VsZW1lbnRzL0FwcFRpbGVcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgdXNlV2lkZ2V0cyB9IGZyb20gXCIuL1Jvb21TdW1tYXJ5Q2FyZFwiO1xuaW1wb3J0IHsgQ2hldnJvbkZhY2UsIENvbnRleHRNZW51QnV0dG9uLCB1c2VDb250ZXh0TWVudSB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgV2lkZ2V0Q29udGV4dE1lbnUgZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvV2lkZ2V0Q29udGV4dE1lbnVcIjtcbmltcG9ydCB7IENvbnRhaW5lciwgV2lkZ2V0TGF5b3V0U3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3dpZGdldHMvV2lkZ2V0TGF5b3V0U3RvcmVcIjtcbmltcG9ydCBVSVN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVUlTdG9yZVwiO1xuaW1wb3J0IFJpZ2h0UGFuZWxTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVwiO1xuaW1wb3J0IEhlYWRpbmcgZnJvbSAnLi4vdHlwb2dyYXBoeS9IZWFkaW5nJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbiAgICB3aWRnZXRJZDogc3RyaW5nO1xuICAgIG9uQ2xvc2UoKTogdm9pZDtcbn1cblxuY29uc3QgV2lkZ2V0Q2FyZDogUmVhY3QuRkM8SVByb3BzPiA9ICh7IHJvb20sIHdpZGdldElkLCBvbkNsb3NlIH0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuXG4gICAgY29uc3QgYXBwcyA9IHVzZVdpZGdldHMocm9vbSk7XG4gICAgY29uc3QgYXBwID0gYXBwcy5maW5kKGEgPT4gYS5pZCA9PT0gd2lkZ2V0SWQpO1xuICAgIGNvbnN0IGlzUmlnaHQgPSBhcHAgJiYgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2UuaXNJbkNvbnRhaW5lcihyb29tLCBhcHAsIENvbnRhaW5lci5SaWdodCk7XG5cbiAgICBjb25zdCBbbWVudURpc3BsYXllZCwgaGFuZGxlLCBvcGVuTWVudSwgY2xvc2VNZW51XSA9IHVzZUNvbnRleHRNZW51KCk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoIWFwcCB8fCAhaXNSaWdodCkge1xuICAgICAgICAgICAgLy8gc3RvcCBzaG93aW5nIHRoaXMgY2FyZFxuICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnBvcENhcmQoKTtcbiAgICAgICAgfVxuICAgIH0sIFthcHAsIGlzUmlnaHRdKTtcblxuICAgIC8vIERvbid0IHJlbmRlciBhbnl0aGluZyBhcyB3ZSBhcmUgYWJvdXQgdG8gdHJhbnNpdGlvblxuICAgIGlmICghYXBwIHx8ICFpc1JpZ2h0KSByZXR1cm4gbnVsbDtcblxuICAgIGxldCBjb250ZXh0TWVudTtcbiAgICBpZiAobWVudURpc3BsYXllZCkge1xuICAgICAgICBjb25zdCByZWN0ID0gaGFuZGxlLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnRleHRNZW51ID0gKFxuICAgICAgICAgICAgPFdpZGdldENvbnRleHRNZW51XG4gICAgICAgICAgICAgICAgY2hldnJvbkZhY2U9e0NoZXZyb25GYWNlLk5vbmV9XG4gICAgICAgICAgICAgICAgcmlnaHQ9e1VJU3RvcmUuaW5zdGFuY2Uud2luZG93V2lkdGggLSByZWN0LnJpZ2h0IC0gMTJ9XG4gICAgICAgICAgICAgICAgdG9wPXtyZWN0LmJvdHRvbSArIDEyfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e2Nsb3NlTWVudX1cbiAgICAgICAgICAgICAgICBhcHA9e2FwcH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9CYXNlQ2FyZF9oZWFkZXJfdGl0bGVcIj5cbiAgICAgICAgPEhlYWRpbmcgc2l6ZT1cImg0XCIgY2xhc3NOYW1lPVwibXhfQmFzZUNhcmRfaGVhZGVyX3RpdGxlX2hlYWRpbmdcIj57IFdpZGdldFV0aWxzLmdldFdpZGdldE5hbWUoYXBwKSB9PC9IZWFkaW5nPlxuICAgICAgICA8Q29udGV4dE1lbnVCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0Jhc2VDYXJkX2hlYWRlcl90aXRsZV9idXR0b24tLW9wdGlvblwiXG4gICAgICAgICAgICBpbnB1dFJlZj17aGFuZGxlfVxuICAgICAgICAgICAgb25DbGljaz17b3Blbk1lbnV9XG4gICAgICAgICAgICBpc0V4cGFuZGVkPXttZW51RGlzcGxheWVkfVxuICAgICAgICAgICAgbGFiZWw9e190KFwiT3B0aW9uc1wiKX1cbiAgICAgICAgLz5cbiAgICAgICAgeyBjb250ZXh0TWVudSB9XG4gICAgPC9kaXY+O1xuXG4gICAgcmV0dXJuIDxCYXNlQ2FyZFxuICAgICAgICBoZWFkZXI9e2hlYWRlcn1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfV2lkZ2V0Q2FyZFwiXG4gICAgICAgIG9uQ2xvc2U9e29uQ2xvc2V9XG4gICAgICAgIHdpdGhvdXRTY3JvbGxDb250YWluZXJcbiAgICA+XG4gICAgICAgIDxBcHBUaWxlXG4gICAgICAgICAgICBhcHA9e2FwcH1cbiAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgc2hvd01lbnViYXI9e2ZhbHNlfVxuICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgIHVzZXJJZD17Y2xpLmdldFVzZXJJZCgpfVxuICAgICAgICAgICAgY3JlYXRvclVzZXJJZD17YXBwLmNyZWF0b3JVc2VySWR9XG4gICAgICAgICAgICB3aWRnZXRQYWdlVGl0bGU9e1dpZGdldFV0aWxzLmdldFdpZGdldERhdGFUaXRsZShhcHApfVxuICAgICAgICAgICAgd2FpdEZvcklmcmFtZUxvYWQ9e2FwcC53YWl0Rm9ySWZyYW1lTG9hZH1cbiAgICAgICAgLz5cbiAgICA8L0Jhc2VDYXJkPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldENhcmQ7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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