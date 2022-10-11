"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _UIStore = _interopRequireWildcard(require("../../../stores/UIStore"));

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
class Measured extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "instanceId", void 0);
    (0, _defineProperty2.default)(this, "onResize", (type, entry) => {
      if (type !== _UIStore.UI_EVENTS.Resize) return;
      this.props.onMeasurement(entry.contentRect.width <= this.props.breakpoint);
    });
    this.instanceId = Measured.instanceCount++;
  }

  componentDidMount() {
    _UIStore.default.instance.on(`Measured${this.instanceId}`, this.onResize);
  }

  componentDidUpdate(prevProps) {
    const previous = prevProps.sensor;
    const current = this.props.sensor;
    if (previous === current) return;

    if (previous) {
      _UIStore.default.instance.stopTrackingElementDimensions(`Measured${this.instanceId}`);
    }

    if (current) {
      _UIStore.default.instance.trackElementDimensions(`Measured${this.instanceId}`, this.props.sensor);
    }
  }

  componentWillUnmount() {
    _UIStore.default.instance.off(`Measured${this.instanceId}`, this.onResize);

    _UIStore.default.instance.stopTrackingElementDimensions(`Measured${this.instanceId}`);
  }

  render() {
    return null;
  }

}

exports.default = Measured;
(0, _defineProperty2.default)(Measured, "instanceCount", 0);
(0, _defineProperty2.default)(Measured, "defaultProps", {
  breakpoint: 500
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZWFzdXJlZCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJ0eXBlIiwiZW50cnkiLCJVSV9FVkVOVFMiLCJSZXNpemUiLCJvbk1lYXN1cmVtZW50IiwiY29udGVudFJlY3QiLCJ3aWR0aCIsImJyZWFrcG9pbnQiLCJpbnN0YW5jZUlkIiwiaW5zdGFuY2VDb3VudCIsImNvbXBvbmVudERpZE1vdW50IiwiVUlTdG9yZSIsImluc3RhbmNlIiwib24iLCJvblJlc2l6ZSIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInByZXZpb3VzIiwic2Vuc29yIiwiY3VycmVudCIsInN0b3BUcmFja2luZ0VsZW1lbnREaW1lbnNpb25zIiwidHJhY2tFbGVtZW50RGltZW5zaW9ucyIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwicmVuZGVyIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvTWVhc3VyZWQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IFVJU3RvcmUsIHsgVUlfRVZFTlRTIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9VSVN0b3JlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNlbnNvcjogRWxlbWVudDtcbiAgICBicmVha3BvaW50OiBudW1iZXI7XG4gICAgb25NZWFzdXJlbWVudChuYXJyb3c6IGJvb2xlYW4pOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZWFzdXJlZCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2VDb3VudCA9IDA7XG4gICAgcHJpdmF0ZSByZWFkb25seSBpbnN0YW5jZUlkOiBudW1iZXI7XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBicmVha3BvaW50OiA1MDAsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLmluc3RhbmNlSWQgPSBNZWFzdXJlZC5pbnN0YW5jZUNvdW50Kys7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIFVJU3RvcmUuaW5zdGFuY2Uub24oYE1lYXN1cmVkJHt0aGlzLmluc3RhbmNlSWR9YCwgdGhpcy5vblJlc2l6ZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUmVhZG9ubHk8SVByb3BzPikge1xuICAgICAgICBjb25zdCBwcmV2aW91cyA9IHByZXZQcm9wcy5zZW5zb3I7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLnByb3BzLnNlbnNvcjtcbiAgICAgICAgaWYgKHByZXZpb3VzID09PSBjdXJyZW50KSByZXR1cm47XG4gICAgICAgIGlmIChwcmV2aW91cykge1xuICAgICAgICAgICAgVUlTdG9yZS5pbnN0YW5jZS5zdG9wVHJhY2tpbmdFbGVtZW50RGltZW5zaW9ucyhgTWVhc3VyZWQke3RoaXMuaW5zdGFuY2VJZH1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3VycmVudCkge1xuICAgICAgICAgICAgVUlTdG9yZS5pbnN0YW5jZS50cmFja0VsZW1lbnREaW1lbnNpb25zKGBNZWFzdXJlZCR7dGhpcy5pbnN0YW5jZUlkfWAsXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zZW5zb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIFVJU3RvcmUuaW5zdGFuY2Uub2ZmKGBNZWFzdXJlZCR7dGhpcy5pbnN0YW5jZUlkfWAsIHRoaXMub25SZXNpemUpO1xuICAgICAgICBVSVN0b3JlLmluc3RhbmNlLnN0b3BUcmFja2luZ0VsZW1lbnREaW1lbnNpb25zKGBNZWFzdXJlZCR7dGhpcy5pbnN0YW5jZUlkfWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZXNpemUgPSAodHlwZTogVUlfRVZFTlRTLCBlbnRyeTogUmVzaXplT2JzZXJ2ZXJFbnRyeSkgPT4ge1xuICAgICAgICBpZiAodHlwZSAhPT0gVUlfRVZFTlRTLlJlc2l6ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnByb3BzLm9uTWVhc3VyZW1lbnQoZW50cnkuY29udGVudFJlY3Qud2lkdGggPD0gdGhpcy5wcm9wcy5icmVha3BvaW50KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOzs7Ozs7QUFsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWWUsTUFBTUEsUUFBTixTQUF1QkMsY0FBQSxDQUFNQyxhQUE3QixDQUFtRDtFQVE5REMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGU7SUFBQSxnREE0QkEsQ0FBQ0MsSUFBRCxFQUFrQkMsS0FBbEIsS0FBaUQ7TUFDaEUsSUFBSUQsSUFBSSxLQUFLRSxrQkFBQSxDQUFVQyxNQUF2QixFQUErQjtNQUMvQixLQUFLSixLQUFMLENBQVdLLGFBQVgsQ0FBeUJILEtBQUssQ0FBQ0ksV0FBTixDQUFrQkMsS0FBbEIsSUFBMkIsS0FBS1AsS0FBTCxDQUFXUSxVQUEvRDtJQUNILENBL0JrQjtJQUdmLEtBQUtDLFVBQUwsR0FBa0JiLFFBQVEsQ0FBQ2MsYUFBVCxFQUFsQjtFQUNIOztFQUVEQyxpQkFBaUIsR0FBRztJQUNoQkMsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkMsRUFBakIsQ0FBcUIsV0FBVSxLQUFLTCxVQUFXLEVBQS9DLEVBQWtELEtBQUtNLFFBQXZEO0VBQ0g7O0VBRURDLGtCQUFrQixDQUFDQyxTQUFELEVBQThCO0lBQzVDLE1BQU1DLFFBQVEsR0FBR0QsU0FBUyxDQUFDRSxNQUEzQjtJQUNBLE1BQU1DLE9BQU8sR0FBRyxLQUFLcEIsS0FBTCxDQUFXbUIsTUFBM0I7SUFDQSxJQUFJRCxRQUFRLEtBQUtFLE9BQWpCLEVBQTBCOztJQUMxQixJQUFJRixRQUFKLEVBQWM7TUFDVk4sZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQlEsNkJBQWpCLENBQWdELFdBQVUsS0FBS1osVUFBVyxFQUExRTtJQUNIOztJQUNELElBQUlXLE9BQUosRUFBYTtNQUNUUixnQkFBQSxDQUFRQyxRQUFSLENBQWlCUyxzQkFBakIsQ0FBeUMsV0FBVSxLQUFLYixVQUFXLEVBQW5FLEVBQ0ksS0FBS1QsS0FBTCxDQUFXbUIsTUFEZjtJQUVIO0VBQ0o7O0VBRURJLG9CQUFvQixHQUFHO0lBQ25CWCxnQkFBQSxDQUFRQyxRQUFSLENBQWlCVyxHQUFqQixDQUFzQixXQUFVLEtBQUtmLFVBQVcsRUFBaEQsRUFBbUQsS0FBS00sUUFBeEQ7O0lBQ0FILGdCQUFBLENBQVFDLFFBQVIsQ0FBaUJRLDZCQUFqQixDQUFnRCxXQUFVLEtBQUtaLFVBQVcsRUFBMUU7RUFDSDs7RUFPRGdCLE1BQU0sR0FBRztJQUNMLE9BQU8sSUFBUDtFQUNIOztBQTNDNkQ7Ozs4QkFBN0M3QixRLG1CQUNjLEM7OEJBRGRBLFEsa0JBSUs7RUFDbEJZLFVBQVUsRUFBRTtBQURNLEMifQ==