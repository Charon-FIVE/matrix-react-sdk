"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../languageHandler");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _BaseCard = _interopRequireDefault(require("../views/right_panel/BaseCard"));

var _TimelinePanel = _interopRequireDefault(require("./TimelinePanel"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _Layout = require("../../settings/enums/Layout");

var _RoomContext = _interopRequireWildcard(require("../../contexts/RoomContext"));

var _Measured = _interopRequireDefault(require("../views/elements/Measured"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/*
 * Component which shows the global notification list using a TimelinePanel
 */
class NotificationPanel extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "card", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onMeasurement", narrow => {
      this.setState({
        narrow
      });
    });
    this.state = {
      narrow: false
    };
  }

  render() {
    const emptyState = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RightPanel_empty mx_NotificationPanel_empty"
    }, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("You're all caught up")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('You have no visible notifications.')));

    let content;

    const timelineSet = _MatrixClientPeg.MatrixClientPeg.get().getNotifTimelineSet();

    if (timelineSet) {
      // wrap a TimelinePanel with the jump-to-event bits turned off.
      content = /*#__PURE__*/_react.default.createElement(_TimelinePanel.default, {
        manageReadReceipts: false,
        manageReadMarkers: false,
        timelineSet: timelineSet,
        showUrlPreview: false,
        empty: emptyState,
        alwaysShowTimestamps: true,
        layout: _Layout.Layout.Group
      });
    } else {
      _logger.logger.error("No notifTimelineSet available!");

      content = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
      value: _objectSpread(_objectSpread({}, this.context), {}, {
        timelineRenderingType: _RoomContext.TimelineRenderingType.Notification,
        narrow: this.state.narrow
      })
    }, /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
      className: "mx_NotificationPanel",
      onClose: this.props.onClose,
      withoutScrollContainer: true
    }, /*#__PURE__*/_react.default.createElement(_Measured.default, {
      sensor: this.card.current,
      onMeasurement: this.onMeasurement
    }), content));
  }

}

exports.default = NotificationPanel;
(0, _defineProperty2.default)(NotificationPanel, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb3RpZmljYXRpb25QYW5lbCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJuYXJyb3ciLCJzZXRTdGF0ZSIsInN0YXRlIiwicmVuZGVyIiwiZW1wdHlTdGF0ZSIsIl90IiwiY29udGVudCIsInRpbWVsaW5lU2V0IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0Tm90aWZUaW1lbGluZVNldCIsIkxheW91dCIsIkdyb3VwIiwibG9nZ2VyIiwiZXJyb3IiLCJjb250ZXh0IiwidGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiVGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiTm90aWZpY2F0aW9uIiwib25DbG9zZSIsImNhcmQiLCJjdXJyZW50Iiwib25NZWFzdXJlbWVudCIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9Ob3RpZmljYXRpb25QYW5lbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEJhc2VDYXJkIGZyb20gXCIuLi92aWV3cy9yaWdodF9wYW5lbC9CYXNlQ2FyZFwiO1xuaW1wb3J0IFRpbWVsaW5lUGFuZWwgZnJvbSBcIi4vVGltZWxpbmVQYW5lbFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCB7IExheW91dCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9lbnVtcy9MYXlvdXRcIjtcbmltcG9ydCBSb29tQ29udGV4dCwgeyBUaW1lbGluZVJlbmRlcmluZ1R5cGUgfSBmcm9tIFwiLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCBNZWFzdXJlZCBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvTWVhc3VyZWRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgb25DbG9zZSgpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBuYXJyb3c6IGJvb2xlYW47XG59XG5cbi8qXG4gKiBDb21wb25lbnQgd2hpY2ggc2hvd3MgdGhlIGdsb2JhbCBub3RpZmljYXRpb24gbGlzdCB1c2luZyBhIFRpbWVsaW5lUGFuZWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm90aWZpY2F0aW9uUGFuZWwgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gUm9vbUNvbnRleHQ7XG5cbiAgICBwcml2YXRlIGNhcmQgPSBSZWFjdC5jcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG5hcnJvdzogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1lYXN1cmVtZW50ID0gKG5hcnJvdzogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbmFycm93IH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGVtcHR5U3RhdGUgPSAoPGRpdiBjbGFzc05hbWU9XCJteF9SaWdodFBhbmVsX2VtcHR5IG14X05vdGlmaWNhdGlvblBhbmVsX2VtcHR5XCI+XG4gICAgICAgICAgICA8aDI+eyBfdChcIllvdSdyZSBhbGwgY2F1Z2h0IHVwXCIpIH08L2gyPlxuICAgICAgICAgICAgPHA+eyBfdCgnWW91IGhhdmUgbm8gdmlzaWJsZSBub3RpZmljYXRpb25zLicpIH08L3A+XG4gICAgICAgIDwvZGl2Pik7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHRpbWVsaW5lU2V0ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldE5vdGlmVGltZWxpbmVTZXQoKTtcbiAgICAgICAgaWYgKHRpbWVsaW5lU2V0KSB7XG4gICAgICAgICAgICAvLyB3cmFwIGEgVGltZWxpbmVQYW5lbCB3aXRoIHRoZSBqdW1wLXRvLWV2ZW50IGJpdHMgdHVybmVkIG9mZi5cbiAgICAgICAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgICAgICAgICAgPFRpbWVsaW5lUGFuZWxcbiAgICAgICAgICAgICAgICAgICAgbWFuYWdlUmVhZFJlY2VpcHRzPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgbWFuYWdlUmVhZE1hcmtlcnM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICB0aW1lbGluZVNldD17dGltZWxpbmVTZXR9XG4gICAgICAgICAgICAgICAgICAgIHNob3dVcmxQcmV2aWV3PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgZW1wdHk9e2VtcHR5U3RhdGV9XG4gICAgICAgICAgICAgICAgICAgIGFsd2F5c1Nob3dUaW1lc3RhbXBzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBsYXlvdXQ9e0xheW91dC5Hcm91cH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIk5vIG5vdGlmVGltZWxpbmVTZXQgYXZhaWxhYmxlIVwiKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8Um9vbUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3tcbiAgICAgICAgICAgIC4uLnRoaXMuY29udGV4dCxcbiAgICAgICAgICAgIHRpbWVsaW5lUmVuZGVyaW5nVHlwZTogVGltZWxpbmVSZW5kZXJpbmdUeXBlLk5vdGlmaWNhdGlvbixcbiAgICAgICAgICAgIG5hcnJvdzogdGhpcy5zdGF0ZS5uYXJyb3csXG4gICAgICAgIH19PlxuICAgICAgICAgICAgPEJhc2VDYXJkIGNsYXNzTmFtZT1cIm14X05vdGlmaWNhdGlvblBhbmVsXCIgb25DbG9zZT17dGhpcy5wcm9wcy5vbkNsb3NlfSB3aXRob3V0U2Nyb2xsQ29udGFpbmVyPlxuICAgICAgICAgICAgICAgIDxNZWFzdXJlZFxuICAgICAgICAgICAgICAgICAgICBzZW5zb3I9e3RoaXMuY2FyZC5jdXJyZW50fVxuICAgICAgICAgICAgICAgICAgICBvbk1lYXN1cmVtZW50PXt0aGlzLm9uTWVhc3VyZW1lbnR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgPC9CYXNlQ2FyZD5cbiAgICAgICAgPC9Sb29tQ29udGV4dC5Qcm92aWRlcj47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQVVBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLGlCQUFOLFNBQWdDQyxjQUFBLENBQU1DLGFBQXRDLENBQW9FO0VBSy9FQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZSx5REFGSkgsY0FBQSxDQUFNSSxTQUFOLEVBRUk7SUFBQSxxREFRTUMsTUFBRCxJQUEyQjtNQUMvQyxLQUFLQyxRQUFMLENBQWM7UUFBRUQ7TUFBRixDQUFkO0lBQ0gsQ0FWa0I7SUFHZixLQUFLRSxLQUFMLEdBQWE7TUFDVEYsTUFBTSxFQUFFO0lBREMsQ0FBYjtFQUdIOztFQU1ERyxNQUFNLEdBQUc7SUFDTCxNQUFNQyxVQUFVLGdCQUFJO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQ2hCLHlDQUFNLElBQUFDLG1CQUFBLEVBQUcsc0JBQUgsQ0FBTixDQURnQixlQUVoQix3Q0FBSyxJQUFBQSxtQkFBQSxFQUFHLG9DQUFILENBQUwsQ0FGZ0IsQ0FBcEI7O0lBS0EsSUFBSUMsT0FBSjs7SUFDQSxNQUFNQyxXQUFXLEdBQUdDLGdDQUFBLENBQWdCQyxHQUFoQixHQUFzQkMsbUJBQXRCLEVBQXBCOztJQUNBLElBQUlILFdBQUosRUFBaUI7TUFDYjtNQUNBRCxPQUFPLGdCQUNILDZCQUFDLHNCQUFEO1FBQ0ksa0JBQWtCLEVBQUUsS0FEeEI7UUFFSSxpQkFBaUIsRUFBRSxLQUZ2QjtRQUdJLFdBQVcsRUFBRUMsV0FIakI7UUFJSSxjQUFjLEVBQUUsS0FKcEI7UUFLSSxLQUFLLEVBQUVILFVBTFg7UUFNSSxvQkFBb0IsRUFBRSxJQU4xQjtRQU9JLE1BQU0sRUFBRU8sY0FBQSxDQUFPQztNQVBuQixFQURKO0lBV0gsQ0FiRCxNQWFPO01BQ0hDLGNBQUEsQ0FBT0MsS0FBUCxDQUFhLGdDQUFiOztNQUNBUixPQUFPLGdCQUFHLDZCQUFDLGdCQUFELE9BQVY7SUFDSDs7SUFFRCxvQkFBTyw2QkFBQyxvQkFBRCxDQUFhLFFBQWI7TUFBc0IsS0FBSyxrQ0FDM0IsS0FBS1MsT0FEc0I7UUFFOUJDLHFCQUFxQixFQUFFQyxrQ0FBQSxDQUFzQkMsWUFGZjtRQUc5QmxCLE1BQU0sRUFBRSxLQUFLRSxLQUFMLENBQVdGO01BSFc7SUFBM0IsZ0JBS0gsNkJBQUMsaUJBQUQ7TUFBVSxTQUFTLEVBQUMsc0JBQXBCO01BQTJDLE9BQU8sRUFBRSxLQUFLRixLQUFMLENBQVdxQixPQUEvRDtNQUF3RSxzQkFBc0I7SUFBOUYsZ0JBQ0ksNkJBQUMsaUJBQUQ7TUFDSSxNQUFNLEVBQUUsS0FBS0MsSUFBTCxDQUFVQyxPQUR0QjtNQUVJLGFBQWEsRUFBRSxLQUFLQztJQUZ4QixFQURKLEVBS01oQixPQUxOLENBTEcsQ0FBUDtFQWFIOztBQXhEOEU7Ozs4QkFBOURaLGlCLGlCQUNJNkIsb0IifQ==