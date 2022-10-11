"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LocationButton = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _CollapsibleButton = require("../rooms/CollapsibleButton");

var _ContextMenu = require("../../structures/ContextMenu");

var _MessageComposerButtons = require("../rooms/MessageComposerButtons");

var _LocationShareMenu = _interopRequireDefault(require("./LocationShareMenu"));

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
const LocationButton = _ref => {
  let {
    roomId,
    sender,
    menuPosition,
    relation
  } = _ref;
  const overflowMenuCloser = (0, _react.useContext)(_MessageComposerButtons.OverflowMenuContext);
  const [menuDisplayed, button, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();

  const _onFinished = ev => {
    closeMenu(ev);
    overflowMenuCloser?.();
  };

  let contextMenu;

  if (menuDisplayed) {
    const position = menuPosition ?? (0, _ContextMenu.aboveLeftOf)(button.current.getBoundingClientRect());
    contextMenu = /*#__PURE__*/_react.default.createElement(_LocationShareMenu.default, {
      menuPosition: position,
      onFinished: _onFinished,
      sender: sender,
      roomId: roomId,
      openMenu: openMenu,
      relation: relation
    });
  }

  const className = (0, _classnames.default)("mx_MessageComposer_button", {
    "mx_MessageComposer_button_highlight": menuDisplayed
  });
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_CollapsibleButton.CollapsibleButton, {
    className: className,
    iconClassName: "mx_MessageComposer_location",
    onClick: openMenu,
    title: (0, _languageHandler._t)("Location")
  }), contextMenu);
};

exports.LocationButton = LocationButton;
var _default = LocationButton;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMb2NhdGlvbkJ1dHRvbiIsInJvb21JZCIsInNlbmRlciIsIm1lbnVQb3NpdGlvbiIsInJlbGF0aW9uIiwib3ZlcmZsb3dNZW51Q2xvc2VyIiwidXNlQ29udGV4dCIsIk92ZXJmbG93TWVudUNvbnRleHQiLCJtZW51RGlzcGxheWVkIiwiYnV0dG9uIiwib3Blbk1lbnUiLCJjbG9zZU1lbnUiLCJ1c2VDb250ZXh0TWVudSIsIl9vbkZpbmlzaGVkIiwiZXYiLCJjb250ZXh0TWVudSIsInBvc2l0aW9uIiwiYWJvdmVMZWZ0T2YiLCJjdXJyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2xhc3NOYW1lIiwiY2xhc3NOYW1lcyIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbG9jYXRpb24vTG9jYXRpb25CdXR0b24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdEVsZW1lbnQsIFN5bnRoZXRpY0V2ZW50LCB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyJztcbmltcG9ydCB7IElFdmVudFJlbGF0aW9uIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgQ29sbGFwc2libGVCdXR0b24gfSBmcm9tICcuLi9yb29tcy9Db2xsYXBzaWJsZUJ1dHRvbic7XG5pbXBvcnQgeyBhYm92ZUxlZnRPZiwgdXNlQ29udGV4dE1lbnUsIEFib3ZlTGVmdE9mIH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7IE92ZXJmbG93TWVudUNvbnRleHQgfSBmcm9tIFwiLi4vcm9vbXMvTWVzc2FnZUNvbXBvc2VyQnV0dG9uc1wiO1xuaW1wb3J0IExvY2F0aW9uU2hhcmVNZW51IGZyb20gJy4vTG9jYXRpb25TaGFyZU1lbnUnO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tSWQ6IHN0cmluZztcbiAgICBzZW5kZXI6IFJvb21NZW1iZXI7XG4gICAgbWVudVBvc2l0aW9uOiBBYm92ZUxlZnRPZjtcbiAgICByZWxhdGlvbj86IElFdmVudFJlbGF0aW9uO1xufVxuXG5leHBvcnQgY29uc3QgTG9jYXRpb25CdXR0b246IFJlYWN0LkZDPElQcm9wcz4gPSAoeyByb29tSWQsIHNlbmRlciwgbWVudVBvc2l0aW9uLCByZWxhdGlvbiB9KSA9PiB7XG4gICAgY29uc3Qgb3ZlcmZsb3dNZW51Q2xvc2VyID0gdXNlQ29udGV4dChPdmVyZmxvd01lbnVDb250ZXh0KTtcbiAgICBjb25zdCBbbWVudURpc3BsYXllZCwgYnV0dG9uLCBvcGVuTWVudSwgY2xvc2VNZW51XSA9IHVzZUNvbnRleHRNZW51KCk7XG5cbiAgICBjb25zdCBfb25GaW5pc2hlZCA9IChldj86IFN5bnRoZXRpY0V2ZW50KSA9PiB7XG4gICAgICAgIGNsb3NlTWVudShldik7XG4gICAgICAgIG92ZXJmbG93TWVudUNsb3Nlcj8uKCk7XG4gICAgfTtcblxuICAgIGxldCBjb250ZXh0TWVudTogUmVhY3RFbGVtZW50O1xuICAgIGlmIChtZW51RGlzcGxheWVkKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbWVudVBvc2l0aW9uID8/IGFib3ZlTGVmdE9mKFxuICAgICAgICAgICAgYnV0dG9uLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuXG4gICAgICAgIGNvbnRleHRNZW51ID0gPExvY2F0aW9uU2hhcmVNZW51XG4gICAgICAgICAgICBtZW51UG9zaXRpb249e3Bvc2l0aW9ufVxuICAgICAgICAgICAgb25GaW5pc2hlZD17X29uRmluaXNoZWR9XG4gICAgICAgICAgICBzZW5kZXI9e3NlbmRlcn1cbiAgICAgICAgICAgIHJvb21JZD17cm9vbUlkfVxuICAgICAgICAgICAgb3Blbk1lbnU9e29wZW5NZW51fVxuICAgICAgICAgICAgcmVsYXRpb249e3JlbGF0aW9ufVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKFxuICAgICAgICBcIm14X01lc3NhZ2VDb21wb3Nlcl9idXR0b25cIixcbiAgICAgICAge1xuICAgICAgICAgICAgXCJteF9NZXNzYWdlQ29tcG9zZXJfYnV0dG9uX2hpZ2hsaWdodFwiOiBtZW51RGlzcGxheWVkLFxuICAgICAgICB9LFxuICAgICk7XG5cbiAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICA8Q29sbGFwc2libGVCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9sb2NhdGlvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXtvcGVuTWVudX1cbiAgICAgICAgICAgIHRpdGxlPXtfdChcIkxvY2F0aW9uXCIpfVxuICAgICAgICAvPlxuXG4gICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTG9jYXRpb25CdXR0b247XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW9CTyxNQUFNQSxjQUFnQyxHQUFHLFFBQWdEO0VBQUEsSUFBL0M7SUFBRUMsTUFBRjtJQUFVQyxNQUFWO0lBQWtCQyxZQUFsQjtJQUFnQ0M7RUFBaEMsQ0FBK0M7RUFDNUYsTUFBTUMsa0JBQWtCLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0MsMkNBQVgsQ0FBM0I7RUFDQSxNQUFNLENBQUNDLGFBQUQsRUFBZ0JDLE1BQWhCLEVBQXdCQyxRQUF4QixFQUFrQ0MsU0FBbEMsSUFBK0MsSUFBQUMsMkJBQUEsR0FBckQ7O0VBRUEsTUFBTUMsV0FBVyxHQUFJQyxFQUFELElBQXlCO0lBQ3pDSCxTQUFTLENBQUNHLEVBQUQsQ0FBVDtJQUNBVCxrQkFBa0I7RUFDckIsQ0FIRDs7RUFLQSxJQUFJVSxXQUFKOztFQUNBLElBQUlQLGFBQUosRUFBbUI7SUFDZixNQUFNUSxRQUFRLEdBQUdiLFlBQVksSUFBSSxJQUFBYyx3QkFBQSxFQUM3QlIsTUFBTSxDQUFDUyxPQUFQLENBQWVDLHFCQUFmLEVBRDZCLENBQWpDO0lBR0FKLFdBQVcsZ0JBQUcsNkJBQUMsMEJBQUQ7TUFDVixZQUFZLEVBQUVDLFFBREo7TUFFVixVQUFVLEVBQUVILFdBRkY7TUFHVixNQUFNLEVBQUVYLE1BSEU7TUFJVixNQUFNLEVBQUVELE1BSkU7TUFLVixRQUFRLEVBQUVTLFFBTEE7TUFNVixRQUFRLEVBQUVOO0lBTkEsRUFBZDtFQVFIOztFQUVELE1BQU1nQixTQUFTLEdBQUcsSUFBQUMsbUJBQUEsRUFDZCwyQkFEYyxFQUVkO0lBQ0ksdUNBQXVDYjtFQUQzQyxDQUZjLENBQWxCO0VBT0Esb0JBQU8sNkJBQUMsY0FBRCxDQUFPLFFBQVAscUJBQ0gsNkJBQUMsb0NBQUQ7SUFDSSxTQUFTLEVBQUVZLFNBRGY7SUFFSSxhQUFhLEVBQUMsNkJBRmxCO0lBR0ksT0FBTyxFQUFFVixRQUhiO0lBSUksS0FBSyxFQUFFLElBQUFZLG1CQUFBLEVBQUcsVUFBSDtFQUpYLEVBREcsRUFRRFAsV0FSQyxDQUFQO0FBVUgsQ0F6Q007OztlQTJDUWYsYyJ9