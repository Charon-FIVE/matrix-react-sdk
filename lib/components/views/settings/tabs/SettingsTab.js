"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _Heading = _interopRequireDefault(require("../../typography/Heading"));

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
const SettingsTab = _ref => {
  let {
    heading,
    children
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h2"
  }, heading), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab_sections"
  }, children));
};

var _default = SettingsTab;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXR0aW5nc1RhYiIsImhlYWRpbmciLCJjaGlsZHJlbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvU2V0dGluZ3NUYWIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBIZWFkaW5nIGZyb20gXCIuLi8uLi90eXBvZ3JhcGh5L0hlYWRpbmdcIjtcblxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc1RhYlByb3BzIHtcbiAgICBoZWFkaW5nOiBzdHJpbmc7XG4gICAgY2hpbGRyZW4/OiBSZWFjdC5SZWFjdE5vZGU7XG59XG5cbmNvbnN0IFNldHRpbmdzVGFiOiBSZWFjdC5GQzxTZXR0aW5nc1RhYlByb3BzPiA9ICh7IGhlYWRpbmcsIGNoaWxkcmVuIH0pID0+IChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiXCI+XG4gICAgICAgIDxIZWFkaW5nIHNpemU9J2gyJz57IGhlYWRpbmcgfTwvSGVhZGluZz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uc1wiPlxuICAgICAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuKTtcblxuZXhwb3J0IGRlZmF1bHQgU2V0dGluZ3NUYWI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWVBOztBQUVBOztBQWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQSxNQUFNQSxXQUF1QyxHQUFHO0VBQUEsSUFBQztJQUFFQyxPQUFGO0lBQVdDO0VBQVgsQ0FBRDtFQUFBLG9CQUM1QztJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJLDZCQUFDLGdCQUFEO0lBQVMsSUFBSSxFQUFDO0VBQWQsR0FBcUJELE9BQXJCLENBREosZUFFSTtJQUFLLFNBQVMsRUFBQztFQUFmLEdBQ01DLFFBRE4sQ0FGSixDQUQ0QztBQUFBLENBQWhEOztlQVNlRixXIn0=