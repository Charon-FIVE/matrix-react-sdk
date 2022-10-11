"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _NonUrgentToastStore = _interopRequireDefault(require("../../stores/NonUrgentToastStore"));

var _AsyncStore = require("../../stores/AsyncStore");

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
class NonUrgentToastContainer extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "onUpdateToasts", () => {
      this.setState({
        toasts: _NonUrgentToastStore.default.instance.components
      });
    });
    this.state = {
      toasts: _NonUrgentToastStore.default.instance.components
    };

    _NonUrgentToastStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.onUpdateToasts);
  }

  componentWillUnmount() {
    _NonUrgentToastStore.default.instance.off(_AsyncStore.UPDATE_EVENT, this.onUpdateToasts);
  }

  render() {
    const toasts = this.state.toasts.map((t, i) => {
      return /*#__PURE__*/React.createElement("div", {
        className: "mx_NonUrgentToastContainer_toast",
        key: `toast-${i}`
      }, /*#__PURE__*/React.createElement(t, {}));
    });
    return /*#__PURE__*/React.createElement("div", {
      className: "mx_NonUrgentToastContainer",
      role: "alert"
    }, toasts);
  }

}

exports.default = NonUrgentToastContainer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb25VcmdlbnRUb2FzdENvbnRhaW5lciIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0Iiwic2V0U3RhdGUiLCJ0b2FzdHMiLCJOb25VcmdlbnRUb2FzdFN0b3JlIiwiaW5zdGFuY2UiLCJjb21wb25lbnRzIiwic3RhdGUiLCJvbiIsIlVQREFURV9FVkVOVCIsIm9uVXBkYXRlVG9hc3RzIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJvZmYiLCJyZW5kZXIiLCJtYXAiLCJ0IiwiaSIsImNyZWF0ZUVsZW1lbnQiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL05vblVyZ2VudFRvYXN0Q29udGFpbmVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgQ29tcG9uZW50Q2xhc3MgfSBmcm9tIFwiLi4vLi4vQHR5cGVzL2NvbW1vblwiO1xuaW1wb3J0IE5vblVyZ2VudFRvYXN0U3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9Ob25VcmdlbnRUb2FzdFN0b3JlXCI7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHRvYXN0czogQ29tcG9uZW50Q2xhc3NbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9uVXJnZW50VG9hc3RDb250YWluZXIgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdG9hc3RzOiBOb25VcmdlbnRUb2FzdFN0b3JlLmluc3RhbmNlLmNvbXBvbmVudHMsXG4gICAgICAgIH07XG5cbiAgICAgICAgTm9uVXJnZW50VG9hc3RTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMub25VcGRhdGVUb2FzdHMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgTm9uVXJnZW50VG9hc3RTdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX0VWRU5ULCB0aGlzLm9uVXBkYXRlVG9hc3RzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVXBkYXRlVG9hc3RzID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdG9hc3RzOiBOb25VcmdlbnRUb2FzdFN0b3JlLmluc3RhbmNlLmNvbXBvbmVudHMgfSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHRvYXN0cyA9IHRoaXMuc3RhdGUudG9hc3RzLm1hcCgodCwgaSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X05vblVyZ2VudFRvYXN0Q29udGFpbmVyX3RvYXN0XCIga2V5PXtgdG9hc3QtJHtpfWB9PlxuICAgICAgICAgICAgICAgICAgICB7IFJlYWN0LmNyZWF0ZUVsZW1lbnQodCwge30pIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X05vblVyZ2VudFRvYXN0Q29udGFpbmVyXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgICAgICAgICAgeyB0b2FzdHMgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7Ozs7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWVlLE1BQU1BLHVCQUFOLFNBQXNDQyxLQUFLLENBQUNDLGFBQTVDLENBQTBFO0VBQzlFQyxXQUFXLENBQUNDLEtBQUQsRUFBUUMsT0FBUixFQUFpQjtJQUMvQixNQUFNRCxLQUFOLEVBQWFDLE9BQWI7SUFEK0Isc0RBY1YsTUFBTTtNQUMzQixLQUFLQyxRQUFMLENBQWM7UUFBRUMsTUFBTSxFQUFFQyw0QkFBQSxDQUFvQkMsUUFBcEIsQ0FBNkJDO01BQXZDLENBQWQ7SUFDSCxDQWhCa0M7SUFHL0IsS0FBS0MsS0FBTCxHQUFhO01BQ1RKLE1BQU0sRUFBRUMsNEJBQUEsQ0FBb0JDLFFBQXBCLENBQTZCQztJQUQ1QixDQUFiOztJQUlBRiw0QkFBQSxDQUFvQkMsUUFBcEIsQ0FBNkJHLEVBQTdCLENBQWdDQyx3QkFBaEMsRUFBOEMsS0FBS0MsY0FBbkQ7RUFDSDs7RUFFTUMsb0JBQW9CLEdBQUc7SUFDMUJQLDRCQUFBLENBQW9CQyxRQUFwQixDQUE2Qk8sR0FBN0IsQ0FBaUNILHdCQUFqQyxFQUErQyxLQUFLQyxjQUFwRDtFQUNIOztFQU1NRyxNQUFNLEdBQUc7SUFDWixNQUFNVixNQUFNLEdBQUcsS0FBS0ksS0FBTCxDQUFXSixNQUFYLENBQWtCVyxHQUFsQixDQUFzQixDQUFDQyxDQUFELEVBQUlDLENBQUosS0FBVTtNQUMzQyxvQkFDSTtRQUFLLFNBQVMsRUFBQyxrQ0FBZjtRQUFrRCxHQUFHLEVBQUcsU0FBUUEsQ0FBRTtNQUFsRSxnQkFDTW5CLEtBQUssQ0FBQ29CLGFBQU4sQ0FBb0JGLENBQXBCLEVBQXVCLEVBQXZCLENBRE4sQ0FESjtJQUtILENBTmMsQ0FBZjtJQVFBLG9CQUNJO01BQUssU0FBUyxFQUFDLDRCQUFmO01BQTRDLElBQUksRUFBQztJQUFqRCxHQUNNWixNQUROLENBREo7RUFLSDs7QUFqQ29GIn0=