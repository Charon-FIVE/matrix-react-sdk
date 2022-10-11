"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _StyledCheckbox = _interopRequireWildcard(require("../../elements/StyledCheckbox"));

var _DeviceTile = _interopRequireDefault(require("./DeviceTile"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
const SelectableDeviceTile = _ref => {
  let {
    children,
    device,
    isSelected,
    onClick
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SelectableDeviceTile"
  }, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
    kind: _StyledCheckbox.CheckboxStyle.Solid,
    checked: isSelected,
    onChange: onClick,
    className: "mx_SelectableDeviceTile_checkbox",
    id: `device-tile-checkbox-${device.device_id}`
  }), /*#__PURE__*/_react.default.createElement(_DeviceTile.default, {
    device: device,
    onClick: onClick
  }, children));
};

var _default = SelectableDeviceTile;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZWxlY3RhYmxlRGV2aWNlVGlsZSIsImNoaWxkcmVuIiwiZGV2aWNlIiwiaXNTZWxlY3RlZCIsIm9uQ2xpY2siLCJDaGVja2JveFN0eWxlIiwiU29saWQiLCJkZXZpY2VfaWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy9kZXZpY2VzL1NlbGVjdGFibGVEZXZpY2VUaWxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgU3R5bGVkQ2hlY2tib3gsIHsgQ2hlY2tib3hTdHlsZSB9IGZyb20gJy4uLy4uL2VsZW1lbnRzL1N0eWxlZENoZWNrYm94JztcbmltcG9ydCBEZXZpY2VUaWxlLCB7IERldmljZVRpbGVQcm9wcyB9IGZyb20gJy4vRGV2aWNlVGlsZSc7XG5cbmludGVyZmFjZSBQcm9wcyBleHRlbmRzIERldmljZVRpbGVQcm9wcyB7XG4gICAgaXNTZWxlY3RlZDogYm9vbGVhbjtcbiAgICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufVxuXG5jb25zdCBTZWxlY3RhYmxlRGV2aWNlVGlsZTogUmVhY3QuRkM8UHJvcHM+ID0gKHsgY2hpbGRyZW4sIGRldmljZSwgaXNTZWxlY3RlZCwgb25DbGljayB9KSA9PiB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSdteF9TZWxlY3RhYmxlRGV2aWNlVGlsZSc+XG4gICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAga2luZD17Q2hlY2tib3hTdHlsZS5Tb2xpZH1cbiAgICAgICAgICAgIGNoZWNrZWQ9e2lzU2VsZWN0ZWR9XG4gICAgICAgICAgICBvbkNoYW5nZT17b25DbGlja31cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfU2VsZWN0YWJsZURldmljZVRpbGVfY2hlY2tib3gnXG4gICAgICAgICAgICBpZD17YGRldmljZS10aWxlLWNoZWNrYm94LSR7ZGV2aWNlLmRldmljZV9pZH1gfVxuICAgICAgICAvPlxuICAgICAgICA8RGV2aWNlVGlsZSBkZXZpY2U9e2RldmljZX0gb25DbGljaz17b25DbGlja30+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9EZXZpY2VUaWxlPlxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNlbGVjdGFibGVEZXZpY2VUaWxlO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7Ozs7OztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZQSxNQUFNQSxvQkFBcUMsR0FBRyxRQUErQztFQUFBLElBQTlDO0lBQUVDLFFBQUY7SUFBWUMsTUFBWjtJQUFvQkMsVUFBcEI7SUFBZ0NDO0VBQWhDLENBQThDO0VBQ3pGLG9CQUFPO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0gsNkJBQUMsdUJBQUQ7SUFDSSxJQUFJLEVBQUVDLDZCQUFBLENBQWNDLEtBRHhCO0lBRUksT0FBTyxFQUFFSCxVQUZiO0lBR0ksUUFBUSxFQUFFQyxPQUhkO0lBSUksU0FBUyxFQUFDLGtDQUpkO0lBS0ksRUFBRSxFQUFHLHdCQUF1QkYsTUFBTSxDQUFDSyxTQUFVO0VBTGpELEVBREcsZUFRSCw2QkFBQyxtQkFBRDtJQUFZLE1BQU0sRUFBRUwsTUFBcEI7SUFBNEIsT0FBTyxFQUFFRTtFQUFyQyxHQUNNSCxRQUROLENBUkcsQ0FBUDtBQVlILENBYkQ7O2VBZWVELG9CIn0=