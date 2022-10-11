"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

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
class DialPadBackspaceButton extends React.PureComponent {
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadBackspaceButtonWrapper"
    }, /*#__PURE__*/React.createElement(_AccessibleButton.default, {
      className: "mx_DialPadBackspaceButton",
      onClick: this.props.onBackspacePress,
      "aria-label": (0, _languageHandler._t)("Backspace")
    }));
  }

}

exports.default = DialPadBackspaceButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaWFsUGFkQmFja3NwYWNlQnV0dG9uIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwicmVuZGVyIiwicHJvcHMiLCJvbkJhY2tzcGFjZVByZXNzIiwiX3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9EaWFsUGFkQmFja3NwYWNlQnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiwgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuL0FjY2Vzc2libGVCdXR0b25cIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gQ2FsbGJhY2sgZm9yIHdoZW4gdGhlIGJ1dHRvbiBpcyBwcmVzc2VkXG4gICAgb25CYWNrc3BhY2VQcmVzczogKGV2OiBCdXR0b25FdmVudCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhbFBhZEJhY2tzcGFjZUJ1dHRvbiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkQmFja3NwYWNlQnV0dG9uV3JhcHBlclwiPlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9EaWFsUGFkQmFja3NwYWNlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQmFja3NwYWNlUHJlc3N9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJCYWNrc3BhY2VcIil9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7Ozs7OztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZZSxNQUFNQSxzQkFBTixTQUFxQ0MsS0FBSyxDQUFDQyxhQUEzQyxDQUFpRTtFQUM1RUMsTUFBTSxHQUFHO0lBQ0wsb0JBQU87TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSCxvQkFBQyx5QkFBRDtNQUNJLFNBQVMsRUFBQywyQkFEZDtNQUVJLE9BQU8sRUFBRSxLQUFLQyxLQUFMLENBQVdDLGdCQUZ4QjtNQUdJLGNBQVksSUFBQUMsbUJBQUEsRUFBRyxXQUFIO0lBSGhCLEVBREcsQ0FBUDtFQU9IOztBQVQyRSJ9