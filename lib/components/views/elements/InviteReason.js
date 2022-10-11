"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireDefault(require("react"));

var _HtmlUtils = require("../../../HtmlUtils");

var _languageHandler = require("../../../languageHandler");

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
class InviteReason extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onViewClick", () => {
      this.setState({
        hidden: false
      });
    });
    this.state = {
      // We hide the reason for invitation by default, since it can be a
      // vector for spam/harassment.
      hidden: true
    };
  }

  render() {
    const classes = (0, _classnames.default)({
      "mx_InviteReason": true,
      "mx_InviteReason_hidden": this.state.hidden
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteReason_reason"
    }, this.props.htmlReason ? (0, _HtmlUtils.sanitizedHtmlNode)(this.props.htmlReason) : this.props.reason), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteReason_view",
      onClick: this.onViewClick
    }, (0, _languageHandler._t)("View message")));
  }

}

exports.default = InviteReason;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnZpdGVSZWFzb24iLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic2V0U3RhdGUiLCJoaWRkZW4iLCJzdGF0ZSIsInJlbmRlciIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwiaHRtbFJlYXNvbiIsInNhbml0aXplZEh0bWxOb2RlIiwicmVhc29uIiwib25WaWV3Q2xpY2siLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0ludml0ZVJlYXNvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgc2FuaXRpemVkSHRtbE5vZGUgfSBmcm9tIFwiLi4vLi4vLi4vSHRtbFV0aWxzXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcmVhc29uOiBzdHJpbmc7XG4gICAgaHRtbFJlYXNvbj86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgaGlkZGVuOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnZpdGVSZWFzb24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gV2UgaGlkZSB0aGUgcmVhc29uIGZvciBpbnZpdGF0aW9uIGJ5IGRlZmF1bHQsIHNpbmNlIGl0IGNhbiBiZSBhXG4gICAgICAgICAgICAvLyB2ZWN0b3IgZm9yIHNwYW0vaGFyYXNzbWVudC5cbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvblZpZXdDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBoaWRkZW46IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBcIm14X0ludml0ZVJlYXNvblwiOiB0cnVlLFxuICAgICAgICAgICAgXCJteF9JbnZpdGVSZWFzb25faGlkZGVuXCI6IHRoaXMuc3RhdGUuaGlkZGVuLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnZpdGVSZWFzb25fcmVhc29uXCI+eyB0aGlzLnByb3BzLmh0bWxSZWFzb24gPyBzYW5pdGl6ZWRIdG1sTm9kZSh0aGlzLnByb3BzLmh0bWxSZWFzb24pIDogdGhpcy5wcm9wcy5yZWFzb24gfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnZpdGVSZWFzb25fdmlld1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblZpZXdDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiVmlldyBtZXNzYWdlXCIpIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUJlLE1BQU1BLFlBQU4sU0FBMkJDLGNBQUEsQ0FBTUMsYUFBakMsQ0FBK0Q7RUFDMUVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0lBQ2YsTUFBTUEsS0FBTjtJQURlLG1EQVNMLE1BQU07TUFDaEIsS0FBS0MsUUFBTCxDQUFjO1FBQ1ZDLE1BQU0sRUFBRTtNQURFLENBQWQ7SUFHSCxDQWJrQjtJQUVmLEtBQUtDLEtBQUwsR0FBYTtNQUNUO01BQ0E7TUFDQUQsTUFBTSxFQUFFO0lBSEMsQ0FBYjtFQUtIOztFQVFERSxNQUFNLEdBQUc7SUFDTCxNQUFNQyxPQUFPLEdBQUcsSUFBQUMsbUJBQUEsRUFBVztNQUN2QixtQkFBbUIsSUFESTtNQUV2QiwwQkFBMEIsS0FBS0gsS0FBTCxDQUFXRDtJQUZkLENBQVgsQ0FBaEI7SUFLQSxvQkFBTztNQUFLLFNBQVMsRUFBRUc7SUFBaEIsZ0JBQ0g7TUFBSyxTQUFTLEVBQUM7SUFBZixHQUEwQyxLQUFLTCxLQUFMLENBQVdPLFVBQVgsR0FBd0IsSUFBQUMsNEJBQUEsRUFBa0IsS0FBS1IsS0FBTCxDQUFXTyxVQUE3QixDQUF4QixHQUFtRSxLQUFLUCxLQUFMLENBQVdTLE1BQXhILENBREcsZUFFSDtNQUFLLFNBQVMsRUFBQyxzQkFBZjtNQUNJLE9BQU8sRUFBRSxLQUFLQztJQURsQixHQUdNLElBQUFDLG1CQUFBLEVBQUcsY0FBSCxDQUhOLENBRkcsQ0FBUDtFQVFIOztBQTlCeUUifQ==