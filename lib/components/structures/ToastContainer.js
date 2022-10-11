"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _ToastStore = _interopRequireDefault(require("../../stores/ToastStore"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
class ToastContainer extends React.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "onToastStoreUpdate", () => {
      this.setState({
        toasts: _ToastStore.default.sharedInstance().getToasts(),
        countSeen: _ToastStore.default.sharedInstance().getCountSeen()
      });
    });
    this.state = {
      toasts: _ToastStore.default.sharedInstance().getToasts(),
      countSeen: _ToastStore.default.sharedInstance().getCountSeen()
    }; // Start listening here rather than in componentDidMount because
    // toasts may dismiss themselves in their didMount if they find
    // they're already irrelevant by the time they're mounted, and
    // our own componentDidMount is too late.

    _ToastStore.default.sharedInstance().on('update', this.onToastStoreUpdate);
  }

  componentWillUnmount() {
    _ToastStore.default.sharedInstance().removeListener('update', this.onToastStoreUpdate);
  }

  render() {
    const totalCount = this.state.toasts.length;
    const isStacked = totalCount > 1;
    let toast;
    let containerClasses;

    if (totalCount !== 0) {
      const topToast = this.state.toasts[0];
      const {
        title,
        icon,
        key,
        component,
        className,
        bodyClassName,
        props
      } = topToast;
      const bodyClasses = (0, _classnames.default)("mx_Toast_body", bodyClassName);
      const toastClasses = (0, _classnames.default)("mx_Toast_toast", className, {
        "mx_Toast_hasIcon": icon,
        [`mx_Toast_icon_${icon}`]: icon
      });
      const toastProps = Object.assign({}, props, {
        key,
        toastKey: key
      });
      const content = /*#__PURE__*/React.createElement(component, toastProps);
      let countIndicator;

      if (title && isStacked || this.state.countSeen > 0) {
        countIndicator = ` (${this.state.countSeen + 1}/${this.state.countSeen + totalCount})`;
      }

      let titleElement;

      if (title) {
        titleElement = /*#__PURE__*/React.createElement("div", {
          className: "mx_Toast_title"
        }, /*#__PURE__*/React.createElement("h2", null, title), /*#__PURE__*/React.createElement("span", {
          className: "mx_Toast_title_countIndicator"
        }, countIndicator));
      }

      toast = /*#__PURE__*/React.createElement("div", {
        className: toastClasses
      }, titleElement, /*#__PURE__*/React.createElement("div", {
        className: bodyClasses
      }, content));
      containerClasses = (0, _classnames.default)("mx_ToastContainer", {
        "mx_ToastContainer_stacked": isStacked
      });
    }

    return toast ? /*#__PURE__*/React.createElement("div", {
      className: containerClasses,
      role: "alert"
    }, toast) : null;
  }

}

exports.default = ToastContainer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUb2FzdENvbnRhaW5lciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJzZXRTdGF0ZSIsInRvYXN0cyIsIlRvYXN0U3RvcmUiLCJzaGFyZWRJbnN0YW5jZSIsImdldFRvYXN0cyIsImNvdW50U2VlbiIsImdldENvdW50U2VlbiIsInN0YXRlIiwib24iLCJvblRvYXN0U3RvcmVVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwicmVuZGVyIiwidG90YWxDb3VudCIsImxlbmd0aCIsImlzU3RhY2tlZCIsInRvYXN0IiwiY29udGFpbmVyQ2xhc3NlcyIsInRvcFRvYXN0IiwidGl0bGUiLCJpY29uIiwia2V5IiwiY29tcG9uZW50IiwiY2xhc3NOYW1lIiwiYm9keUNsYXNzTmFtZSIsImJvZHlDbGFzc2VzIiwiY2xhc3NOYW1lcyIsInRvYXN0Q2xhc3NlcyIsInRvYXN0UHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJ0b2FzdEtleSIsImNvbnRlbnQiLCJjcmVhdGVFbGVtZW50IiwiY291bnRJbmRpY2F0b3IiLCJ0aXRsZUVsZW1lbnQiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL1RvYXN0Q29udGFpbmVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCBUb2FzdFN0b3JlLCB7IElUb2FzdCB9IGZyb20gXCIuLi8uLi9zdG9yZXMvVG9hc3RTdG9yZVwiO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICB0b2FzdHM6IElUb2FzdDxhbnk+W107XG4gICAgY291bnRTZWVuOiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvYXN0Q29udGFpbmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHt9LCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB0b2FzdHM6IFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5nZXRUb2FzdHMoKSxcbiAgICAgICAgICAgIGNvdW50U2VlbjogVG9hc3RTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLmdldENvdW50U2VlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFN0YXJ0IGxpc3RlbmluZyBoZXJlIHJhdGhlciB0aGFuIGluIGNvbXBvbmVudERpZE1vdW50IGJlY2F1c2VcbiAgICAgICAgLy8gdG9hc3RzIG1heSBkaXNtaXNzIHRoZW1zZWx2ZXMgaW4gdGhlaXIgZGlkTW91bnQgaWYgdGhleSBmaW5kXG4gICAgICAgIC8vIHRoZXkncmUgYWxyZWFkeSBpcnJlbGV2YW50IGJ5IHRoZSB0aW1lIHRoZXkncmUgbW91bnRlZCwgYW5kXG4gICAgICAgIC8vIG91ciBvd24gY29tcG9uZW50RGlkTW91bnQgaXMgdG9vIGxhdGUuXG4gICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5vbigndXBkYXRlJywgdGhpcy5vblRvYXN0U3RvcmVVcGRhdGUpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkucmVtb3ZlTGlzdGVuZXIoJ3VwZGF0ZScsIHRoaXMub25Ub2FzdFN0b3JlVXBkYXRlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVG9hc3RTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0b2FzdHM6IFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5nZXRUb2FzdHMoKSxcbiAgICAgICAgICAgIGNvdW50U2VlbjogVG9hc3RTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLmdldENvdW50U2VlbigpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB0b3RhbENvdW50ID0gdGhpcy5zdGF0ZS50b2FzdHMubGVuZ3RoO1xuICAgICAgICBjb25zdCBpc1N0YWNrZWQgPSB0b3RhbENvdW50ID4gMTtcbiAgICAgICAgbGV0IHRvYXN0O1xuICAgICAgICBsZXQgY29udGFpbmVyQ2xhc3NlcztcbiAgICAgICAgaWYgKHRvdGFsQ291bnQgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHRvcFRvYXN0ID0gdGhpcy5zdGF0ZS50b2FzdHNbMF07XG4gICAgICAgICAgICBjb25zdCB7IHRpdGxlLCBpY29uLCBrZXksIGNvbXBvbmVudCwgY2xhc3NOYW1lLCBib2R5Q2xhc3NOYW1lLCBwcm9wcyB9ID0gdG9wVG9hc3Q7XG4gICAgICAgICAgICBjb25zdCBib2R5Q2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9Ub2FzdF9ib2R5XCIsIGJvZHlDbGFzc05hbWUpO1xuICAgICAgICAgICAgY29uc3QgdG9hc3RDbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1RvYXN0X3RvYXN0XCIsIGNsYXNzTmFtZSwge1xuICAgICAgICAgICAgICAgIFwibXhfVG9hc3RfaGFzSWNvblwiOiBpY29uLFxuICAgICAgICAgICAgICAgIFtgbXhfVG9hc3RfaWNvbl8ke2ljb259YF06IGljb24sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHRvYXN0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wcywge1xuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICB0b2FzdEtleToga2V5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudChjb21wb25lbnQsIHRvYXN0UHJvcHMpO1xuXG4gICAgICAgICAgICBsZXQgY291bnRJbmRpY2F0b3I7XG4gICAgICAgICAgICBpZiAodGl0bGUgJiYgaXNTdGFja2VkIHx8IHRoaXMuc3RhdGUuY291bnRTZWVuID4gMCkge1xuICAgICAgICAgICAgICAgIGNvdW50SW5kaWNhdG9yID0gYCAoJHt0aGlzLnN0YXRlLmNvdW50U2VlbiArIDF9LyR7dGhpcy5zdGF0ZS5jb3VudFNlZW4gKyB0b3RhbENvdW50fSlgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdGl0bGVFbGVtZW50O1xuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgdGl0bGVFbGVtZW50ID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1RvYXN0X3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDI+eyB0aXRsZSB9PC9oMj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1RvYXN0X3RpdGxlX2NvdW50SW5kaWNhdG9yXCI+eyBjb3VudEluZGljYXRvciB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b2FzdCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dG9hc3RDbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aXRsZUVsZW1lbnQgfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Ym9keUNsYXNzZXN9PnsgY29udGVudCB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb250YWluZXJDbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1RvYXN0Q29udGFpbmVyXCIsIHtcbiAgICAgICAgICAgICAgICBcIm14X1RvYXN0Q29udGFpbmVyX3N0YWNrZWRcIjogaXNTdGFja2VkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvYXN0XG4gICAgICAgICAgICA/IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y29udGFpbmVyQ2xhc3Nlc30gcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdG9hc3QgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7Ozs7OztBQW5CQTtB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