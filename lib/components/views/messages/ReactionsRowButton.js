"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _ReactionsRowButtonTooltip = _interopRequireDefault(require("./ReactionsRowButtonTooltip"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
class ReactionsRowButton extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "state", {
      tooltipRendered: false,
      tooltipVisible: false
    });
    (0, _defineProperty2.default)(this, "onClick", () => {
      const {
        mxEvent,
        myReactionEvent,
        content
      } = this.props;

      if (myReactionEvent) {
        this.context.redactEvent(mxEvent.getRoomId(), myReactionEvent.getId());
      } else {
        this.context.sendEvent(mxEvent.getRoomId(), "m.reaction", {
          "m.relates_to": {
            "rel_type": "m.annotation",
            "event_id": mxEvent.getId(),
            "key": content
          }
        });

        _dispatcher.default.dispatch({
          action: "message_sent"
        });
      }
    });
    (0, _defineProperty2.default)(this, "onMouseOver", () => {
      this.setState({
        // To avoid littering the DOM with a tooltip for every reaction,
        // only render it on first use.
        tooltipRendered: true,
        tooltipVisible: true
      });
    });
    (0, _defineProperty2.default)(this, "onMouseLeave", () => {
      this.setState({
        tooltipVisible: false
      });
    });
  }

  render() {
    const {
      mxEvent,
      content,
      count,
      reactionEvents,
      myReactionEvent
    } = this.props;
    const classes = (0, _classnames.default)({
      mx_ReactionsRowButton: true,
      mx_ReactionsRowButton_selected: !!myReactionEvent
    });
    let tooltip;

    if (this.state.tooltipRendered) {
      tooltip = /*#__PURE__*/_react.default.createElement(_ReactionsRowButtonTooltip.default, {
        mxEvent: this.props.mxEvent,
        content: content,
        reactionEvents: reactionEvents,
        visible: this.state.tooltipVisible
      });
    }

    const room = this.context.getRoom(mxEvent.getRoomId());
    let label;

    if (room) {
      const senders = [];

      for (const reactionEvent of reactionEvents) {
        const member = room.getMember(reactionEvent.getSender());
        senders.push(member?.name || reactionEvent.getSender());
      }

      const reactors = (0, _FormattingUtils.formatCommaSeparatedList)(senders, 6);

      if (content) {
        label = (0, _languageHandler._t)("%(reactors)s reacted with %(content)s", {
          reactors,
          content
        });
      } else {
        label = reactors;
      }
    }

    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: classes,
      "aria-label": label,
      onClick: this.onClick,
      disabled: this.props.disabled,
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ReactionsRowButton_content",
      "aria-hidden": "true"
    }, content), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ReactionsRowButton_count",
      "aria-hidden": "true"
    }, count), tooltip);
  }

}

exports.default = ReactionsRowButton;
(0, _defineProperty2.default)(ReactionsRowButton, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdGlvbnNSb3dCdXR0b24iLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJ0b29sdGlwUmVuZGVyZWQiLCJ0b29sdGlwVmlzaWJsZSIsIm14RXZlbnQiLCJteVJlYWN0aW9uRXZlbnQiLCJjb250ZW50IiwicHJvcHMiLCJjb250ZXh0IiwicmVkYWN0RXZlbnQiLCJnZXRSb29tSWQiLCJnZXRJZCIsInNlbmRFdmVudCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwic2V0U3RhdGUiLCJyZW5kZXIiLCJjb3VudCIsInJlYWN0aW9uRXZlbnRzIiwiY2xhc3NlcyIsImNsYXNzTmFtZXMiLCJteF9SZWFjdGlvbnNSb3dCdXR0b24iLCJteF9SZWFjdGlvbnNSb3dCdXR0b25fc2VsZWN0ZWQiLCJ0b29sdGlwIiwic3RhdGUiLCJyb29tIiwiZ2V0Um9vbSIsImxhYmVsIiwic2VuZGVycyIsInJlYWN0aW9uRXZlbnQiLCJtZW1iZXIiLCJnZXRNZW1iZXIiLCJnZXRTZW5kZXIiLCJwdXNoIiwibmFtZSIsInJlYWN0b3JzIiwiZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0IiwiX3QiLCJvbkNsaWNrIiwiZGlzYWJsZWQiLCJvbk1vdXNlT3ZlciIsIm9uTW91c2VMZWF2ZSIsIk1hdHJpeENsaWVudENvbnRleHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9SZWFjdGlvbnNSb3dCdXR0b24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0IH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvRm9ybWF0dGluZ1V0aWxzJztcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IFJlYWN0aW9uc1Jvd0J1dHRvblRvb2x0aXAgZnJvbSBcIi4vUmVhY3Rpb25zUm93QnV0dG9uVG9vbHRpcFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIFRoZSBldmVudCB3ZSdyZSBkaXNwbGF5aW5nIHJlYWN0aW9ucyBmb3JcbiAgICBteEV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICAvLyBUaGUgcmVhY3Rpb24gY29udGVudCAvIGtleSAvIGVtb2ppXG4gICAgY29udGVudDogc3RyaW5nO1xuICAgIC8vIFRoZSBjb3VudCBvZiB2b3RlcyBmb3IgdGhpcyBrZXlcbiAgICBjb3VudDogbnVtYmVyO1xuICAgIC8vIEEgU2V0IG9mIE1hdHJpeCByZWFjdGlvbiBldmVudHMgZm9yIHRoaXMga2V5XG4gICAgcmVhY3Rpb25FdmVudHM6IFNldDxNYXRyaXhFdmVudD47XG4gICAgLy8gQSBwb3NzaWJsZSBNYXRyaXggZXZlbnQgaWYgdGhlIGN1cnJlbnQgdXNlciBoYXMgdm90ZWQgZm9yIHRoaXMgdHlwZVxuICAgIG15UmVhY3Rpb25FdmVudD86IE1hdHJpeEV2ZW50O1xuICAgIC8vIFdoZXRoZXIgdG8gcHJldmVudCBxdWljay1yZWFjdGlvbnMgYnkgY2xpY2tpbmcgb24gdGhpcyByZWFjdGlvblxuICAgIGRpc2FibGVkPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdG9vbHRpcFJlbmRlcmVkOiBib29sZWFuO1xuICAgIHRvb2x0aXBWaXNpYmxlOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFjdGlvbnNSb3dCdXR0b24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBNYXRyaXhDbGllbnRDb250ZXh0PjtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICB0b29sdGlwUmVuZGVyZWQ6IGZhbHNlLFxuICAgICAgICB0b29sdGlwVmlzaWJsZTogZmFsc2UsXG4gICAgfTtcblxuICAgIG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbXhFdmVudCwgbXlSZWFjdGlvbkV2ZW50LCBjb250ZW50IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAobXlSZWFjdGlvbkV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVkYWN0RXZlbnQoXG4gICAgICAgICAgICAgICAgbXhFdmVudC5nZXRSb29tSWQoKSxcbiAgICAgICAgICAgICAgICBteVJlYWN0aW9uRXZlbnQuZ2V0SWQoKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuc2VuZEV2ZW50KG14RXZlbnQuZ2V0Um9vbUlkKCksIFwibS5yZWFjdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgXCJtLnJlbGF0ZXNfdG9cIjoge1xuICAgICAgICAgICAgICAgICAgICBcInJlbF90eXBlXCI6IFwibS5hbm5vdGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZXZlbnRfaWRcIjogbXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBjb250ZW50LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJtZXNzYWdlX3NlbnRcIiB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbk1vdXNlT3ZlciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAvLyBUbyBhdm9pZCBsaXR0ZXJpbmcgdGhlIERPTSB3aXRoIGEgdG9vbHRpcCBmb3IgZXZlcnkgcmVhY3Rpb24sXG4gICAgICAgICAgICAvLyBvbmx5IHJlbmRlciBpdCBvbiBmaXJzdCB1c2UuXG4gICAgICAgICAgICB0b29sdGlwUmVuZGVyZWQ6IHRydWUsXG4gICAgICAgICAgICB0b29sdGlwVmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTW91c2VMZWF2ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0b29sdGlwVmlzaWJsZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgbXhFdmVudCwgY29udGVudCwgY291bnQsIHJlYWN0aW9uRXZlbnRzLCBteVJlYWN0aW9uRXZlbnQgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfUmVhY3Rpb25zUm93QnV0dG9uOiB0cnVlLFxuICAgICAgICAgICAgbXhfUmVhY3Rpb25zUm93QnV0dG9uX3NlbGVjdGVkOiAhIW15UmVhY3Rpb25FdmVudCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHRvb2x0aXA7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRvb2x0aXBSZW5kZXJlZCkge1xuICAgICAgICAgICAgdG9vbHRpcCA9IDxSZWFjdGlvbnNSb3dCdXR0b25Ub29sdGlwXG4gICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgIGNvbnRlbnQ9e2NvbnRlbnR9XG4gICAgICAgICAgICAgICAgcmVhY3Rpb25FdmVudHM9e3JlYWN0aW9uRXZlbnRzfVxuICAgICAgICAgICAgICAgIHZpc2libGU9e3RoaXMuc3RhdGUudG9vbHRpcFZpc2libGV9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmNvbnRleHQuZ2V0Um9vbShteEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgbGV0IGxhYmVsOiBzdHJpbmc7XG4gICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICBjb25zdCBzZW5kZXJzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlYWN0aW9uRXZlbnQgb2YgcmVhY3Rpb25FdmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXIgPSByb29tLmdldE1lbWJlcihyZWFjdGlvbkV2ZW50LmdldFNlbmRlcigpKTtcbiAgICAgICAgICAgICAgICBzZW5kZXJzLnB1c2gobWVtYmVyPy5uYW1lIHx8IHJlYWN0aW9uRXZlbnQuZ2V0U2VuZGVyKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZWFjdG9ycyA9IGZvcm1hdENvbW1hU2VwYXJhdGVkTGlzdChzZW5kZXJzLCA2KTtcbiAgICAgICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSBfdChcIiUocmVhY3RvcnMpcyByZWFjdGVkIHdpdGggJShjb250ZW50KXNcIiwgeyByZWFjdG9ycywgY29udGVudCB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSByZWFjdG9ycztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9XG4gICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLm9uTW91c2VPdmVyfVxuICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLm9uTW91c2VMZWF2ZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfUmVhY3Rpb25zUm93QnV0dG9uX2NvbnRlbnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfUmVhY3Rpb25zUm93QnV0dG9uX2NvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgeyBjb3VudCB9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICB7IHRvb2x0aXAgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWlDZSxNQUFNQSxrQkFBTixTQUFpQ0MsY0FBQSxDQUFNQyxhQUF2QyxDQUFxRTtFQUFBO0lBQUE7SUFBQTtJQUFBLDZDQUl4RTtNQUNKQyxlQUFlLEVBQUUsS0FEYjtNQUVKQyxjQUFjLEVBQUU7SUFGWixDQUp3RTtJQUFBLCtDQVN0RSxNQUFNO01BQ1osTUFBTTtRQUFFQyxPQUFGO1FBQVdDLGVBQVg7UUFBNEJDO01BQTVCLElBQXdDLEtBQUtDLEtBQW5EOztNQUNBLElBQUlGLGVBQUosRUFBcUI7UUFDakIsS0FBS0csT0FBTCxDQUFhQyxXQUFiLENBQ0lMLE9BQU8sQ0FBQ00sU0FBUixFQURKLEVBRUlMLGVBQWUsQ0FBQ00sS0FBaEIsRUFGSjtNQUlILENBTEQsTUFLTztRQUNILEtBQUtILE9BQUwsQ0FBYUksU0FBYixDQUF1QlIsT0FBTyxDQUFDTSxTQUFSLEVBQXZCLEVBQTRDLFlBQTVDLEVBQTBEO1VBQ3RELGdCQUFnQjtZQUNaLFlBQVksY0FEQTtZQUVaLFlBQVlOLE9BQU8sQ0FBQ08sS0FBUixFQUZBO1lBR1osT0FBT0w7VUFISztRQURzQyxDQUExRDs7UUFPQU8sbUJBQUEsQ0FBSUMsUUFBSixDQUFhO1VBQUVDLE1BQU0sRUFBRTtRQUFWLENBQWI7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