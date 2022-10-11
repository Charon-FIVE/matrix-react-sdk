"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class MjolnirBody extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onAllowClick", e => {
      e.preventDefault();
      e.stopPropagation();
      const key = `mx_mjolnir_render_${this.props.mxEvent.getRoomId()}__${this.props.mxEvent.getId()}`;
      localStorage.setItem(key, "true");
      this.props.onMessageAllowed();
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MjolnirBody"
    }, /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)("You have ignored this user, so their message is hidden. <a>Show anyways.</a>", {}, {
      a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: this.onAllowClick
      }, sub)
    })));
  }

}

exports.default = MjolnirBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNam9sbmlyQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwia2V5IiwicHJvcHMiLCJteEV2ZW50IiwiZ2V0Um9vbUlkIiwiZ2V0SWQiLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwib25NZXNzYWdlQWxsb3dlZCIsInJlbmRlciIsIl90IiwiYSIsInN1YiIsIm9uQWxsb3dDbGljayJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01qb2xuaXJCb2R5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBteEV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICBvbk1lc3NhZ2VBbGxvd2VkOiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNam9sbmlyQm9keSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIG9uQWxsb3dDbGljayA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBjb25zdCBrZXkgPSBgbXhfbWpvbG5pcl9yZW5kZXJfJHt0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCl9X18ke3RoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpfWA7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgXCJ0cnVlXCIpO1xuICAgICAgICB0aGlzLnByb3BzLm9uTWVzc2FnZUFsbG93ZWQoKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfTWpvbG5pckJvZHknPjxpPnsgX3QoXG4gICAgICAgICAgICAgICAgXCJZb3UgaGF2ZSBpZ25vcmVkIHRoaXMgdXNlciwgc28gdGhlaXIgbWVzc2FnZSBpcyBoaWRkZW4uIDxhPlNob3cgYW55d2F5cy48L2E+XCIsXG4gICAgICAgICAgICAgICAge30sIHtcbiAgICAgICAgICAgICAgICAgICAgYTogKHN1YikgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtfaW5saW5lXCIgb25DbGljaz17dGhpcy5vbkFsbG93Q2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApIH08L2k+PC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYWUsTUFBTUEsV0FBTixTQUEwQkMsY0FBQSxDQUFNQyxTQUFoQyxDQUFrRDtFQUFBO0lBQUE7SUFBQSxvREFDckNDLENBQUQsSUFBK0I7TUFDbERBLENBQUMsQ0FBQ0MsY0FBRjtNQUNBRCxDQUFDLENBQUNFLGVBQUY7TUFFQSxNQUFNQyxHQUFHLEdBQUkscUJBQW9CLEtBQUtDLEtBQUwsQ0FBV0MsT0FBWCxDQUFtQkMsU0FBbkIsRUFBK0IsS0FBSSxLQUFLRixLQUFMLENBQVdDLE9BQVgsQ0FBbUJFLEtBQW5CLEVBQTJCLEVBQS9GO01BQ0FDLFlBQVksQ0FBQ0MsT0FBYixDQUFxQk4sR0FBckIsRUFBMEIsTUFBMUI7TUFDQSxLQUFLQyxLQUFMLENBQVdNLGdCQUFYO0lBQ0gsQ0FSNEQ7RUFBQTs7RUFVdERDLE1BQU0sR0FBZ0I7SUFDekIsb0JBQ0k7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFBZ0Msd0NBQUssSUFBQUMsbUJBQUEsRUFDakMsOEVBRGlDLEVBRWpDLEVBRmlDLEVBRTdCO01BQ0FDLENBQUMsRUFBR0MsR0FBRCxpQkFBUyw2QkFBQyx5QkFBRDtRQUFrQixJQUFJLEVBQUMsYUFBdkI7UUFBcUMsT0FBTyxFQUFFLEtBQUtDO01BQW5ELEdBQ05ELEdBRE07SUFEWixDQUY2QixDQUFMLENBQWhDLENBREo7RUFVSDs7QUFyQjREIn0=