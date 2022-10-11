"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2016 OpenMarket Ltd

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
class DirectorySearchBox extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "input", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onClearClick", () => {
      this.setState({
        value: ''
      });

      if (this.input.current) {
        this.input.current.focus();

        if (this.props.onClear) {
          this.props.onClear();
        }
      }
    });
    (0, _defineProperty2.default)(this, "onChange", ev => {
      if (!this.input.current) return;
      this.setState({
        value: ev.target.value
      });

      if (this.props.onChange) {
        this.props.onChange(ev.target.value);
      }
    });
    (0, _defineProperty2.default)(this, "onKeyUp", ev => {
      if (ev.key == 'Enter' && this.props.showJoinButton) {
        if (this.props.onJoinClick) {
          this.props.onJoinClick(this.state.value);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onJoinButtonClick", () => {
      if (this.props.onJoinClick) {
        this.props.onJoinClick(this.state.value);
      }
    });
    this.state = {
      value: this.props.initialText || ''
    };
  }

  render() {
    const searchboxClasses = {
      mx_DirectorySearchBox: true
    };
    searchboxClasses[this.props.className] = true;
    let joinButton;

    if (this.props.showJoinButton) {
      joinButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_DirectorySearchBox_joinButton",
        onClick: this.onJoinButtonClick
      }, (0, _languageHandler._t)("Join"));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: `mx_DirectorySearchBox ${this.props.className} mx_textinput`
    }, /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      name: "dirsearch",
      value: this.state.value,
      className: "mx_textinput_icon mx_textinput_search",
      ref: this.input,
      onChange: this.onChange,
      onKeyUp: this.onKeyUp,
      placeholder: this.props.placeholder,
      autoFocus: true
    }), joinButton, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_DirectorySearchBox_clear",
      onClick: this.onClearClick
    }));
  }

}

exports.default = DirectorySearchBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaXJlY3RvcnlTZWFyY2hCb3giLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJzZXRTdGF0ZSIsInZhbHVlIiwiaW5wdXQiLCJjdXJyZW50IiwiZm9jdXMiLCJvbkNsZWFyIiwiZXYiLCJ0YXJnZXQiLCJvbkNoYW5nZSIsImtleSIsInNob3dKb2luQnV0dG9uIiwib25Kb2luQ2xpY2siLCJzdGF0ZSIsImluaXRpYWxUZXh0IiwicmVuZGVyIiwic2VhcmNoYm94Q2xhc3NlcyIsIm14X0RpcmVjdG9yeVNlYXJjaEJveCIsImNsYXNzTmFtZSIsImpvaW5CdXR0b24iLCJvbkpvaW5CdXR0b25DbGljayIsIl90Iiwib25LZXlVcCIsInBsYWNlaG9sZGVyIiwib25DbGVhckNsaWNrIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRGlyZWN0b3J5U2VhcmNoQm94LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ2hhbmdlRXZlbnQsIGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4vQWNjZXNzaWJsZUJ1dHRvblwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgb25DaGFuZ2U/OiAodmFsdWU6IHN0cmluZykgPT4gdm9pZDtcbiAgICBvbkNsZWFyPzogKCkgPT4gdm9pZDtcbiAgICBvbkpvaW5DbGljaz86ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkO1xuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xuICAgIHNob3dKb2luQnV0dG9uPzogYm9vbGVhbjtcbiAgICBpbml0aWFsVGV4dD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdmFsdWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlyZWN0b3J5U2VhcmNoQm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBpbnB1dCA9IGNyZWF0ZVJlZjxIVE1MSW5wdXRFbGVtZW50PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmluaXRpYWxUZXh0IHx8ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DbGVhckNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6ICcnIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLmlucHV0LmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuY3VycmVudC5mb2N1cygpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNsZWFyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZSA9IChldjogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmlucHV0LmN1cnJlbnQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiBldi50YXJnZXQudmFsdWUgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXYudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5VXAgPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKGV2LmtleSA9PSAnRW50ZXInICYmIHRoaXMucHJvcHMuc2hvd0pvaW5CdXR0b24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uSm9pbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkpvaW5DbGljayh0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSm9pbkJ1dHRvbkNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkpvaW5DbGljaykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkpvaW5DbGljayh0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3Qgc2VhcmNoYm94Q2xhc3NlcyA9IHtcbiAgICAgICAgICAgIG14X0RpcmVjdG9yeVNlYXJjaEJveDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgICAgc2VhcmNoYm94Q2xhc3Nlc1t0aGlzLnByb3BzLmNsYXNzTmFtZV0gPSB0cnVlO1xuXG4gICAgICAgIGxldCBqb2luQnV0dG9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93Sm9pbkJ1dHRvbikge1xuICAgICAgICAgICAgam9pbkJ1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0RpcmVjdG9yeVNlYXJjaEJveF9qb2luQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uSm9pbkJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgPnsgX3QoXCJKb2luXCIpIH08L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtgbXhfRGlyZWN0b3J5U2VhcmNoQm94ICR7dGhpcy5wcm9wcy5jbGFzc05hbWV9IG14X3RleHRpbnB1dGB9PlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIG5hbWU9XCJkaXJzZWFyY2hcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X3RleHRpbnB1dF9pY29uIG14X3RleHRpbnB1dF9zZWFyY2hcIlxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5pbnB1dH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICBvbktleVVwPXt0aGlzLm9uS2V5VXB9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgeyBqb2luQnV0dG9uIH1cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0RpcmVjdG9yeVNlYXJjaEJveF9jbGVhclwiIG9uQ2xpY2s9e3RoaXMub25DbGVhckNsaWNrfSAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOzs7Ozs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBcUJlLE1BQU1BLGtCQUFOLFNBQWlDQyxjQUFBLENBQU1DLFNBQXZDLENBQWlFO0VBRzVFQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1QiwwREFGWCxJQUFBQyxnQkFBQSxHQUVXO0lBQUEsb0RBUUosTUFBWTtNQUMvQixLQUFLQyxRQUFMLENBQWM7UUFBRUMsS0FBSyxFQUFFO01BQVQsQ0FBZDs7TUFFQSxJQUFJLEtBQUtDLEtBQUwsQ0FBV0MsT0FBZixFQUF3QjtRQUNwQixLQUFLRCxLQUFMLENBQVdDLE9BQVgsQ0FBbUJDLEtBQW5COztRQUVBLElBQUksS0FBS04sS0FBTCxDQUFXTyxPQUFmLEVBQXdCO1VBQ3BCLEtBQUtQLEtBQUwsQ0FBV08sT0FBWDtRQUNIO01BQ0o7SUFDSixDQWxCMEI7SUFBQSxnREFvQlBDLEVBQUQsSUFBNkM7TUFDNUQsSUFBSSxDQUFDLEtBQUtKLEtBQUwsQ0FBV0MsT0FBaEIsRUFBeUI7TUFDekIsS0FBS0gsUUFBTCxDQUFjO1FBQUVDLEtBQUssRUFBRUssRUFBRSxDQUFDQyxNQUFILENBQVVOO01BQW5CLENBQWQ7O01BRUEsSUFBSSxLQUFLSCxLQUFMLENBQVdVLFFBQWYsRUFBeUI7UUFDckIsS0FBS1YsS0FBTCxDQUFXVSxRQUFYLENBQW9CRixFQUFFLENBQUNDLE1BQUgsQ0FBVU4sS0FBOUI7TUFDSDtJQUNKLENBM0IwQjtJQUFBLCtDQTZCUkssRUFBRCxJQUFtQztNQUNqRCxJQUFJQSxFQUFFLENBQUNHLEdBQUgsSUFBVSxPQUFWLElBQXFCLEtBQUtYLEtBQUwsQ0FBV1ksY0FBcEMsRUFBb0Q7UUFDaEQsSUFBSSxLQUFLWixLQUFMLENBQVdhLFdBQWYsRUFBNEI7VUFDeEIsS0FBS2IsS0FBTCxDQUFXYSxXQUFYLENBQXVCLEtBQUtDLEtBQUwsQ0FBV1gsS0FBbEM7UUFDSDtNQUNKO0lBQ0osQ0FuQzBCO0lBQUEseURBcUNDLE1BQVk7TUFDcEMsSUFBSSxLQUFLSCxLQUFMLENBQVdhLFdBQWYsRUFBNEI7UUFDeEIsS0FBS2IsS0FBTCxDQUFXYSxXQUFYLENBQXVCLEtBQUtDLEtBQUwsQ0FBV1gsS0FBbEM7TUFDSDtJQUNKLENBekMwQjtJQUd2QixLQUFLVyxLQUFMLEdBQWE7TUFDVFgsS0FBSyxFQUFFLEtBQUtILEtBQUwsQ0FBV2UsV0FBWCxJQUEwQjtJQUR4QixDQUFiO0VBR0g7O0VBcUNNQyxNQUFNLEdBQWdCO0lBQ3pCLE1BQU1DLGdCQUFnQixHQUFHO01BQ3JCQyxxQkFBcUIsRUFBRTtJQURGLENBQXpCO0lBR0FELGdCQUFnQixDQUFDLEtBQUtqQixLQUFMLENBQVdtQixTQUFaLENBQWhCLEdBQXlDLElBQXpDO0lBRUEsSUFBSUMsVUFBSjs7SUFDQSxJQUFJLEtBQUtwQixLQUFMLENBQVdZLGNBQWYsRUFBK0I7TUFDM0JRLFVBQVUsZ0JBQUcsNkJBQUMseUJBQUQ7UUFBa0IsU0FBUyxFQUFDLGtDQUE1QjtRQUNULE9BQU8sRUFBRSxLQUFLQztNQURMLEdBRVYsSUFBQUMsbUJBQUEsRUFBRyxNQUFILENBRlUsQ0FBYjtJQUdIOztJQUVELG9CQUFPO01BQUssU0FBUyxFQUFHLHlCQUF3QixLQUFLdEIsS0FBTCxDQUFXbUIsU0FBVTtJQUE5RCxnQkFDSDtNQUNJLElBQUksRUFBQyxNQURUO01BRUksSUFBSSxFQUFDLFdBRlQ7TUFHSSxLQUFLLEVBQUUsS0FBS0wsS0FBTCxDQUFXWCxLQUh0QjtNQUlJLFNBQVMsRUFBQyx1Q0FKZDtNQUtJLEdBQUcsRUFBRSxLQUFLQyxLQUxkO01BTUksUUFBUSxFQUFFLEtBQUtNLFFBTm5CO01BT0ksT0FBTyxFQUFFLEtBQUthLE9BUGxCO01BUUksV0FBVyxFQUFFLEtBQUt2QixLQUFMLENBQVd3QixXQVI1QjtNQVNJLFNBQVM7SUFUYixFQURHLEVBWURKLFVBWkMsZUFhSCw2QkFBQyx5QkFBRDtNQUFrQixTQUFTLEVBQUMsNkJBQTVCO01BQTBELE9BQU8sRUFBRSxLQUFLSztJQUF4RSxFQWJHLENBQVA7RUFlSDs7QUExRTJFIn0=