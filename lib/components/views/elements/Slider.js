"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

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
class Slider extends React.Component {
  // offset is a terrible inverse approximation.
  // if the values represents some function f(x) = y where x is the
  // index of the array and y = values[x] then offset(f, y) = x
  // s.t f(x) = y.
  // it assumes a monotonic function and interpolates linearly between
  // y values.
  // Offset is used for finding the location of a value on a
  // non linear slider.
  offset(values, value) {
    // the index of the first number greater than value.
    const closest = values.reduce((prev, curr) => {
      return value > curr ? prev + 1 : prev;
    }, 0); // Off the left

    if (closest === 0) {
      return 0;
    } // Off the right


    if (closest === values.length) {
      return 100;
    } // Now


    const closestLessValue = values[closest - 1];
    const closestGreaterValue = values[closest];
    const intervalWidth = 1 / (values.length - 1);
    const linearInterpolation = (value - closestLessValue) / (closestGreaterValue - closestLessValue);
    return 100 * (closest - 1 + linearInterpolation) * intervalWidth;
  }

  render() {
    const dots = this.props.values.map(v => /*#__PURE__*/React.createElement(Dot, {
      active: v <= this.props.value,
      label: this.props.displayFunc(v),
      onClick: this.props.disabled ? () => {} : () => this.props.onSelectionChange(v),
      key: v,
      disabled: this.props.disabled
    }));
    let selection = null;

    if (!this.props.disabled) {
      const offset = this.offset(this.props.values, this.props.value);
      selection = /*#__PURE__*/React.createElement("div", {
        className: "mx_Slider_selection"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_Slider_selectionDot",
        style: {
          left: "calc(-1.195em + " + offset + "%)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_Slider_selectionText"
      }, this.props.value)), /*#__PURE__*/React.createElement("hr", {
        style: {
          width: offset + "%"
        }
      }));
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider_bar"
    }, /*#__PURE__*/React.createElement("hr", {
      onClick: this.props.disabled ? () => {} : this.onClick.bind(this)
    }), selection), /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider_dotContainer"
    }, dots)));
  }

  onClick(event) {
    const width = event.target.clientWidth; // nativeEvent is safe to use because https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX
    // is supported by all modern browsers

    const relativeClick = event.nativeEvent.offsetX / width;
    const nearestValue = this.props.values[Math.round(relativeClick * (this.props.values.length - 1))];
    this.props.onSelectionChange(nearestValue);
  }

}

exports.default = Slider;

class Dot extends React.PureComponent {
  render() {
    let className = "mx_Slider_dot";

    if (!this.props.disabled && this.props.active) {
      className += " mx_Slider_dotActive";
    }

    return /*#__PURE__*/React.createElement("span", {
      onClick: this.props.onClick,
      className: "mx_Slider_dotValue"
    }, /*#__PURE__*/React.createElement("div", {
      className: className
    }), /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider_labelContainer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider_label"
    }, this.props.label)));
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTbGlkZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsIm9mZnNldCIsInZhbHVlcyIsInZhbHVlIiwiY2xvc2VzdCIsInJlZHVjZSIsInByZXYiLCJjdXJyIiwibGVuZ3RoIiwiY2xvc2VzdExlc3NWYWx1ZSIsImNsb3Nlc3RHcmVhdGVyVmFsdWUiLCJpbnRlcnZhbFdpZHRoIiwibGluZWFySW50ZXJwb2xhdGlvbiIsInJlbmRlciIsImRvdHMiLCJwcm9wcyIsIm1hcCIsInYiLCJkaXNwbGF5RnVuYyIsImRpc2FibGVkIiwib25TZWxlY3Rpb25DaGFuZ2UiLCJzZWxlY3Rpb24iLCJsZWZ0Iiwid2lkdGgiLCJvbkNsaWNrIiwiYmluZCIsImV2ZW50IiwidGFyZ2V0IiwiY2xpZW50V2lkdGgiLCJyZWxhdGl2ZUNsaWNrIiwibmF0aXZlRXZlbnQiLCJvZmZzZXRYIiwibmVhcmVzdFZhbHVlIiwiTWF0aCIsInJvdW5kIiwiRG90IiwiUHVyZUNvbXBvbmVudCIsImNsYXNzTmFtZSIsImFjdGl2ZSIsImxhYmVsIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvU2xpZGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIEEgY2FsbGJhY2sgZm9yIHRoZSBzZWxlY3RlZCB2YWx1ZVxuICAgIG9uU2VsZWN0aW9uQ2hhbmdlOiAodmFsdWU6IG51bWJlcikgPT4gdm9pZDtcblxuICAgIC8vIFRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBzbGlkZXJcbiAgICB2YWx1ZTogbnVtYmVyO1xuXG4gICAgLy8gVGhlIHJhbmdlIGFuZCB2YWx1ZXMgb2YgdGhlIHNsaWRlclxuICAgIC8vIEN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIGFuIGFzY2VuZGluZywgY29uc3RhbnQgaW50ZXJ2YWwgcmFuZ2VcbiAgICB2YWx1ZXM6IG51bWJlcltdO1xuXG4gICAgLy8gQSBmdW5jdGlvbiBmb3IgZm9ybWF0dGluZyB0aGUgdGhlIHZhbHVlc1xuICAgIGRpc3BsYXlGdW5jOiAodmFsdWU6IG51bWJlcikgPT4gc3RyaW5nO1xuXG4gICAgLy8gV2hldGhlciB0aGUgc2xpZGVyIGlzIGRpc2FibGVkXG4gICAgZGlzYWJsZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsaWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICAvLyBvZmZzZXQgaXMgYSB0ZXJyaWJsZSBpbnZlcnNlIGFwcHJveGltYXRpb24uXG4gICAgLy8gaWYgdGhlIHZhbHVlcyByZXByZXNlbnRzIHNvbWUgZnVuY3Rpb24gZih4KSA9IHkgd2hlcmUgeCBpcyB0aGVcbiAgICAvLyBpbmRleCBvZiB0aGUgYXJyYXkgYW5kIHkgPSB2YWx1ZXNbeF0gdGhlbiBvZmZzZXQoZiwgeSkgPSB4XG4gICAgLy8gcy50IGYoeCkgPSB5LlxuICAgIC8vIGl0IGFzc3VtZXMgYSBtb25vdG9uaWMgZnVuY3Rpb24gYW5kIGludGVycG9sYXRlcyBsaW5lYXJseSBiZXR3ZWVuXG4gICAgLy8geSB2YWx1ZXMuXG4gICAgLy8gT2Zmc2V0IGlzIHVzZWQgZm9yIGZpbmRpbmcgdGhlIGxvY2F0aW9uIG9mIGEgdmFsdWUgb24gYVxuICAgIC8vIG5vbiBsaW5lYXIgc2xpZGVyLlxuICAgIHByaXZhdGUgb2Zmc2V0KHZhbHVlczogbnVtYmVyW10sIHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICAvLyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IG51bWJlciBncmVhdGVyIHRoYW4gdmFsdWUuXG4gICAgICAgIGNvbnN0IGNsb3Nlc3QgPSB2YWx1ZXMucmVkdWNlKChwcmV2LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKHZhbHVlID4gY3VyciA/IHByZXYgKyAxIDogcHJldik7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIC8vIE9mZiB0aGUgbGVmdFxuICAgICAgICBpZiAoY2xvc2VzdCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPZmYgdGhlIHJpZ2h0XG4gICAgICAgIGlmIChjbG9zZXN0ID09PSB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93XG4gICAgICAgIGNvbnN0IGNsb3Nlc3RMZXNzVmFsdWUgPSB2YWx1ZXNbY2xvc2VzdCAtIDFdO1xuICAgICAgICBjb25zdCBjbG9zZXN0R3JlYXRlclZhbHVlID0gdmFsdWVzW2Nsb3Nlc3RdO1xuXG4gICAgICAgIGNvbnN0IGludGVydmFsV2lkdGggPSAxIC8gKHZhbHVlcy5sZW5ndGggLSAxKTtcblxuICAgICAgICBjb25zdCBsaW5lYXJJbnRlcnBvbGF0aW9uID0gKHZhbHVlIC0gY2xvc2VzdExlc3NWYWx1ZSkgLyAoY2xvc2VzdEdyZWF0ZXJWYWx1ZSAtIGNsb3Nlc3RMZXNzVmFsdWUpO1xuXG4gICAgICAgIHJldHVybiAxMDAgKiAoY2xvc2VzdCAtIDEgKyBsaW5lYXJJbnRlcnBvbGF0aW9uKSAqIGludGVydmFsV2lkdGg7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IGRvdHMgPSB0aGlzLnByb3BzLnZhbHVlcy5tYXAodiA9PiA8RG90XG4gICAgICAgICAgICBhY3RpdmU9e3YgPD0gdGhpcy5wcm9wcy52YWx1ZX1cbiAgICAgICAgICAgIGxhYmVsPXt0aGlzLnByb3BzLmRpc3BsYXlGdW5jKHYpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5kaXNhYmxlZCA/ICgpID0+IHt9IDogKCkgPT4gdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZSh2KX1cbiAgICAgICAgICAgIGtleT17dn1cbiAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAvPik7XG5cbiAgICAgICAgbGV0IHNlbGVjdGlvbiA9IG51bGw7XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldCh0aGlzLnByb3BzLnZhbHVlcywgdGhpcy5wcm9wcy52YWx1ZSk7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1NsaWRlcl9zZWxlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NsaWRlcl9zZWxlY3Rpb25Eb3RcIiBzdHlsZT17eyBsZWZ0OiBcImNhbGMoLTEuMTk1ZW0gKyBcIiArIG9mZnNldCArIFwiJSlcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TbGlkZXJfc2VsZWN0aW9uVGV4dFwiPnsgdGhpcy5wcm9wcy52YWx1ZSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGhyIHN0eWxlPXt7IHdpZHRoOiBvZmZzZXQgKyBcIiVcIiB9fSAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU2xpZGVyXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2xpZGVyX2JhclwiPlxuICAgICAgICAgICAgICAgICAgICA8aHIgb25DbGljaz17dGhpcy5wcm9wcy5kaXNhYmxlZCA/ICgpID0+IHt9IDogdGhpcy5vbkNsaWNrLmJpbmQodGhpcyl9IC8+XG4gICAgICAgICAgICAgICAgICAgIHsgc2VsZWN0aW9uIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NsaWRlcl9kb3RDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBkb3RzIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgb25DbGljayhldmVudDogUmVhY3QuTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCB3aWR0aCA9IChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsaWVudFdpZHRoO1xuICAgICAgICAvLyBuYXRpdmVFdmVudCBpcyBzYWZlIHRvIHVzZSBiZWNhdXNlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50L29mZnNldFhcbiAgICAgICAgLy8gaXMgc3VwcG9ydGVkIGJ5IGFsbCBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgY29uc3QgcmVsYXRpdmVDbGljayA9IChldmVudC5uYXRpdmVFdmVudC5vZmZzZXRYIC8gd2lkdGgpO1xuICAgICAgICBjb25zdCBuZWFyZXN0VmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlc1tNYXRoLnJvdW5kKHJlbGF0aXZlQ2xpY2sgKiAodGhpcy5wcm9wcy52YWx1ZXMubGVuZ3RoIC0gMSkpXTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZShuZWFyZXN0VmFsdWUpO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElEb3RQcm9wcyB7XG4gICAgLy8gQ2FsbGJhY2sgZm9yIGJlaGF2aW9yIG9uY2xpY2tcbiAgICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xuXG4gICAgLy8gV2hldGhlciB0aGUgZG90IHNob3VsZCBhcHBlYXIgYWN0aXZlXG4gICAgYWN0aXZlOiBib29sZWFuO1xuXG4gICAgLy8gVGhlIGxhYmVsIG9uIHRoZSBkb3RcbiAgICBsYWJlbDogc3RyaW5nO1xuXG4gICAgLy8gV2hldGhlciB0aGUgc2xpZGVyIGlzIGRpc2FibGVkXG4gICAgZGlzYWJsZWQ6IGJvb2xlYW47XG59XG5cbmNsYXNzIERvdCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SURvdFByb3BzPiB7XG4gICAgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBcIm14X1NsaWRlcl9kb3RcIjtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmRpc2FibGVkICYmIHRoaXMucHJvcHMuYWN0aXZlKSB7XG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gXCIgbXhfU2xpZGVyX2RvdEFjdGl2ZVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxzcGFuIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30gY2xhc3NOYW1lPVwibXhfU2xpZGVyX2RvdFZhbHVlXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TbGlkZXJfbGFiZWxDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NsaWRlcl9sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMubGFiZWwgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc3Bhbj47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBZ0JBOzs7Ozs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBc0JlLE1BQU1BLE1BQU4sU0FBcUJDLEtBQUssQ0FBQ0MsU0FBM0IsQ0FBNkM7RUFDeEQ7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNRQyxNQUFNLENBQUNDLE1BQUQsRUFBbUJDLEtBQW5CLEVBQTBDO0lBQ3BEO0lBQ0EsTUFBTUMsT0FBTyxHQUFHRixNQUFNLENBQUNHLE1BQVAsQ0FBYyxDQUFDQyxJQUFELEVBQU9DLElBQVAsS0FBZ0I7TUFDMUMsT0FBUUosS0FBSyxHQUFHSSxJQUFSLEdBQWVELElBQUksR0FBRyxDQUF0QixHQUEwQkEsSUFBbEM7SUFDSCxDQUZlLEVBRWIsQ0FGYSxDQUFoQixDQUZvRCxDQU1wRDs7SUFDQSxJQUFJRixPQUFPLEtBQUssQ0FBaEIsRUFBbUI7TUFDZixPQUFPLENBQVA7SUFDSCxDQVRtRCxDQVdwRDs7O0lBQ0EsSUFBSUEsT0FBTyxLQUFLRixNQUFNLENBQUNNLE1BQXZCLEVBQStCO01BQzNCLE9BQU8sR0FBUDtJQUNILENBZG1ELENBZ0JwRDs7O0lBQ0EsTUFBTUMsZ0JBQWdCLEdBQUdQLE1BQU0sQ0FBQ0UsT0FBTyxHQUFHLENBQVgsQ0FBL0I7SUFDQSxN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