"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Direction = void 0;
exports.mouseWithinRegion = mouseWithinRegion;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _classnames = _interopRequireDefault(require("classnames"));

var _UIStore = _interopRequireDefault(require("../../../stores/UIStore"));

var _ContextMenu = require("../../structures/ContextMenu");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const InteractiveTooltipContainerId = "mx_InteractiveTooltip_Container"; // If the distance from tooltip to window edge is below this value, the tooltip
// will flip around to the other side of the target.

const MIN_SAFE_DISTANCE_TO_WINDOW_EDGE = 20;

function getOrCreateContainer() {
  let container = document.getElementById(InteractiveTooltipContainerId);

  if (!container) {
    container = document.createElement("div");
    container.id = InteractiveTooltipContainerId;
    document.body.appendChild(container);
  }

  return container;
}

function isInRect(x, y, rect) {
  const {
    top,
    right,
    bottom,
    left
  } = rect;
  return x >= left && x <= right && y >= top && y <= bottom;
}
/**
 * Returns the positive slope of the diagonal of the rect.
 *
 * @param {DOMRect} rect
 * @return {number}
 */


function getDiagonalSlope(rect) {
  const {
    top,
    right,
    bottom,
    left
  } = rect;
  return (bottom - top) / (right - left);
}

function isInUpperLeftHalf(x, y, rect) {
  const {
    bottom,
    left
  } = rect; // Negative slope because Y values grow downwards and for this case, the
  // diagonal goes from larger to smaller Y values.

  const diagonalSlope = getDiagonalSlope(rect) * -1;
  return isInRect(x, y, rect) && y <= bottom + diagonalSlope * (x - left);
}

function isInLowerRightHalf(x, y, rect) {
  const {
    bottom,
    left
  } = rect; // Negative slope because Y values grow downwards and for this case, the
  // diagonal goes from larger to smaller Y values.

  const diagonalSlope = getDiagonalSlope(rect) * -1;
  return isInRect(x, y, rect) && y >= bottom + diagonalSlope * (x - left);
}

function isInUpperRightHalf(x, y, rect) {
  const {
    top,
    left
  } = rect; // Positive slope because Y values grow downwards and for this case, the
  // diagonal goes from smaller to larger Y values.

  const diagonalSlope = getDiagonalSlope(rect) * 1;
  return isInRect(x, y, rect) && y <= top + diagonalSlope * (x - left);
}

function isInLowerLeftHalf(x, y, rect) {
  const {
    top,
    left
  } = rect; // Positive slope because Y values grow downwards and for this case, the
  // diagonal goes from smaller to larger Y values.

  const diagonalSlope = getDiagonalSlope(rect) * 1;
  return isInRect(x, y, rect) && y >= top + diagonalSlope * (x - left);
}

let Direction; // exported for tests

exports.Direction = Direction;

(function (Direction) {
  Direction[Direction["Top"] = 0] = "Top";
  Direction[Direction["Left"] = 1] = "Left";
  Direction[Direction["Bottom"] = 2] = "Bottom";
  Direction[Direction["Right"] = 3] = "Right";
})(Direction || (exports.Direction = Direction = {}));

function mouseWithinRegion(x, y, direction, targetRect, contentRect) {
  // When moving the mouse from the target to the tooltip, we create a safe area
  // that includes the tooltip, the target, and the trapezoid ABCD between them:
  //                            ┌───────────┐
  //                            │           │
  //                            │           │
  //                          A └───E───F───┘ B
  //                                  V
  //                                 ┌─┐
  //                                 │ │
  //                                C└─┘D
  //
  // As long as the mouse remains inside the safe area, the tooltip will stay open.
  const buffer = 50;

  if (isInRect(x, y, targetRect)) {
    return true;
  }

  switch (direction) {
    case Direction.Left:
      {
        const contentRectWithBuffer = {
          top: contentRect.top - buffer,
          right: contentRect.right,
          bottom: contentRect.bottom + buffer,
          left: contentRect.left - buffer
        };
        const trapezoidTop = {
          top: contentRect.top - buffer,
          right: targetRect.right,
          bottom: targetRect.top,
          left: contentRect.right
        };
        const trapezoidCenter = {
          top: targetRect.top,
          right: targetRect.left,
          bottom: targetRect.bottom,
          left: contentRect.right
        };
        const trapezoidBottom = {
          top: targetRect.bottom,
          right: targetRect.right,
          bottom: contentRect.bottom + buffer,
          left: contentRect.right
        };

        if (isInRect(x, y, contentRectWithBuffer) || isInLowerLeftHalf(x, y, trapezoidTop) || isInRect(x, y, trapezoidCenter) || isInUpperLeftHalf(x, y, trapezoidBottom)) {
          return true;
        }

        break;
      }

    case Direction.Right:
      {
        const contentRectWithBuffer = {
          top: contentRect.top - buffer,
          right: contentRect.right + buffer,
          bottom: contentRect.bottom + buffer,
          left: contentRect.left
        };
        const trapezoidTop = {
          top: contentRect.top - buffer,
          right: contentRect.left,
          bottom: targetRect.top,
          left: targetRect.left
        };
        const trapezoidCenter = {
          top: targetRect.top,
          right: contentRect.left,
          bottom: targetRect.bottom,
          left: targetRect.right
        };
        const trapezoidBottom = {
          top: targetRect.bottom,
          right: contentRect.left,
          bottom: contentRect.bottom + buffer,
          left: targetRect.left
        };

        if (isInRect(x, y, contentRectWithBuffer) || isInLowerRightHalf(x, y, trapezoidTop) || isInRect(x, y, trapezoidCenter) || isInUpperRightHalf(x, y, trapezoidBottom)) {
          return true;
        }

        break;
      }

    case Direction.Top:
      {
        const contentRectWithBuffer = {
          top: contentRect.top - buffer,
          right: contentRect.right + buffer,
          bottom: contentRect.bottom,
          left: contentRect.left - buffer
        };
        const trapezoidLeft = {
          top: contentRect.bottom,
          right: targetRect.left,
          bottom: targetRect.bottom,
          left: contentRect.left - buffer
        };
        const trapezoidCenter = {
          top: contentRect.bottom,
          right: targetRect.right,
          bottom: targetRect.top,
          left: targetRect.left
        };
        const trapezoidRight = {
          top: contentRect.bottom,
          right: contentRect.right + buffer,
          bottom: targetRect.bottom,
          left: targetRect.right
        };

        if (isInRect(x, y, contentRectWithBuffer) || isInUpperRightHalf(x, y, trapezoidLeft) || isInRect(x, y, trapezoidCenter) || isInUpperLeftHalf(x, y, trapezoidRight)) {
          return true;
        }

        break;
      }

    case Direction.Bottom:
      {
        const contentRectWithBuffer = {
          top: contentRect.top,
          right: contentRect.right + buffer,
          bottom: contentRect.bottom + buffer,
          left: contentRect.left - buffer
        };
        const trapezoidLeft = {
          top: targetRect.top,
          right: targetRect.left,
          bottom: contentRect.top,
          left: contentRect.left - buffer
        };
        const trapezoidCenter = {
          top: targetRect.bottom,
          right: targetRect.right,
          bottom: contentRect.top,
          left: targetRect.left
        };
        const trapezoidRight = {
          top: targetRect.top,
          right: contentRect.right + buffer,
          bottom: contentRect.top,
          left: targetRect.right
        };

        if (isInRect(x, y, contentRectWithBuffer) || isInLowerRightHalf(x, y, trapezoidLeft) || isInRect(x, y, trapezoidCenter) || isInLowerLeftHalf(x, y, trapezoidRight)) {
          return true;
        }

        break;
      }
  }

  return false;
}

/*
 * This style of tooltip takes a "target" element as its child and centers the
 * tooltip along one edge of the target.
 */
class InteractiveTooltip extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "target", void 0);
    (0, _defineProperty2.default)(this, "collectContentRect", element => {
      // We don't need to clean up when unmounting, so ignore
      if (!element) return;
      this.setState({
        contentRect: element.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "collectTarget", element => {
      this.target = element;
    });
    (0, _defineProperty2.default)(this, "onMouseMove", ev => {
      const {
        clientX: x,
        clientY: y
      } = ev;
      const {
        contentRect
      } = this.state;
      const targetRect = this.target.getBoundingClientRect();
      let direction;

      if (this.isOnTheSide) {
        direction = this.onLeftOfTarget() ? Direction.Left : Direction.Right;
      } else {
        direction = this.aboveTarget() ? Direction.Top : Direction.Bottom;
      }

      if (!mouseWithinRegion(x, y, direction, targetRect, contentRect)) {
        this.hideTooltip();
      }
    });
    (0, _defineProperty2.default)(this, "onTargetMouseOver", () => {
      this.showTooltip();
    });
    this.state = {
      contentRect: null,
      visible: false
    };
  }

  componentDidUpdate() {
    // Whenever this passthrough component updates, also render the tooltip
    // in a separate DOM tree. This allows the tooltip content to participate
    // the normal React rendering cycle: when this component re-renders, the
    // tooltip content re-renders.
    // Once we upgrade to React 16, this could be done a bit more naturally
    // using the portals feature instead.
    this.renderTooltip();
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove);
  }

  onLeftOfTarget() {
    const {
      contentRect
    } = this.state;
    const targetRect = this.target.getBoundingClientRect();

    if (this.props.direction === Direction.Left) {
      const targetLeft = targetRect.left + window.scrollX;
      return !contentRect || targetLeft - contentRect.width > MIN_SAFE_DISTANCE_TO_WINDOW_EDGE;
    } else {
      const targetRight = targetRect.right + window.scrollX;
      const spaceOnRight = _UIStore.default.instance.windowWidth - targetRight;
      return contentRect && spaceOnRight - contentRect.width < MIN_SAFE_DISTANCE_TO_WINDOW_EDGE;
    }
  }

  aboveTarget() {
    const {
      contentRect
    } = this.state;
    const targetRect = this.target.getBoundingClientRect();

    if (this.props.direction === Direction.Top) {
      const targetTop = targetRect.top + window.scrollY;
      return !contentRect || targetTop - contentRect.height > MIN_SAFE_DISTANCE_TO_WINDOW_EDGE;
    } else {
      const targetBottom = targetRect.bottom + window.scrollY;
      const spaceBelow = _UIStore.default.instance.windowHeight - targetBottom;
      return contentRect && spaceBelow - contentRect.height < MIN_SAFE_DISTANCE_TO_WINDOW_EDGE;
    }
  }

  get isOnTheSide() {
    return this.props.direction === Direction.Left || this.props.direction === Direction.Right;
  }

  showTooltip() {
    // Don't enter visible state if we haven't collected the target yet
    if (!this.target) return;
    this.setState({
      visible: true
    });
    this.props.onVisibilityChange?.(true);
    document.addEventListener("mousemove", this.onMouseMove);
  }

  hideTooltip() {
    this.setState({
      visible: false
    });
    this.props.onVisibilityChange?.(false);
    document.removeEventListener("mousemove", this.onMouseMove);
  }

  renderTooltip() {
    const {
      contentRect,
      visible
    } = this.state;

    if (!visible) {
      _reactDom.default.unmountComponentAtNode(getOrCreateContainer());

      return null;
    }

    const targetRect = this.target.getBoundingClientRect(); // The window X and Y offsets are to adjust position when zoomed in to page

    const targetLeft = targetRect.left + window.scrollX;
    const targetRight = targetRect.right + window.scrollX;
    const targetBottom = targetRect.bottom + window.scrollY;
    const targetTop = targetRect.top + window.scrollY; // Place the tooltip above the target by default. If we find that the
    // tooltip content would extend past the safe area towards the window
    // edge, flip around to below the target.

    const position = {};
    let chevronFace = null;

    if (this.isOnTheSide) {
      if (this.onLeftOfTarget()) {
        position.left = targetLeft;
        chevronFace = _ContextMenu.ChevronFace.Right;
      } else {
        position.left = targetRight;
        chevronFace = _ContextMenu.ChevronFace.Left;
      }

      position.top = targetTop;
    } else {
      if (this.aboveTarget()) {
        position.bottom = _UIStore.default.instance.windowHeight - targetTop;
        chevronFace = _ContextMenu.ChevronFace.Bottom;
      } else {
        position.top = targetBottom;
        chevronFace = _ContextMenu.ChevronFace.Top;
      } // Center the tooltip horizontally with the target's center.


      position.left = targetLeft + targetRect.width / 2;
    }

    const chevron = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InteractiveTooltip_chevron_" + chevronFace
    });

    const menuClasses = (0, _classnames.default)({
      'mx_InteractiveTooltip': true,
      'mx_InteractiveTooltip_withChevron_top': chevronFace === _ContextMenu.ChevronFace.Top,
      'mx_InteractiveTooltip_withChevron_left': chevronFace === _ContextMenu.ChevronFace.Left,
      'mx_InteractiveTooltip_withChevron_right': chevronFace === _ContextMenu.ChevronFace.Right,
      'mx_InteractiveTooltip_withChevron_bottom': chevronFace === _ContextMenu.ChevronFace.Bottom
    });
    const menuStyle = {};

    if (contentRect && !this.isOnTheSide) {
      menuStyle.left = `-${contentRect.width / 2}px`;
    }

    const tooltip = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InteractiveTooltip_wrapper",
      style: _objectSpread({}, position)
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: menuClasses,
      style: menuStyle,
      ref: this.collectContentRect
    }, chevron, this.props.content));

    _reactDom.default.render(tooltip, getOrCreateContainer());
  }

  render() {
    return this.props.children({
      ref: this.collectTarget,
      onMouseOver: this.onTargetMouseOver
    });
  }

}

exports.default = InteractiveTooltip;
(0, _defineProperty2.default)(InteractiveTooltip, "defaultProps", {
  side: Direction.Top
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcmFjdGl2ZVRvb2x0aXBDb250YWluZXJJZCIsIk1JTl9TQUZFX0RJU1RBTkNFX1RPX1dJTkRPV19FREdFIiwiZ2V0T3JDcmVhdGVDb250YWluZXIiLCJjb250YWluZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlRWxlbWVudCIsImlkIiwiYm9keSIsImFwcGVuZENoaWxkIiwiaXNJblJlY3QiLCJ4IiwieSIsInJlY3QiLCJ0b3AiLCJyaWdodCIsImJvdHRvbSIsImxlZnQiLCJnZXREaWFnb25hbFNsb3BlIiwiaXNJblVwcGVyTGVmdEhhbGYiLCJkaWFnb25hbFNsb3BlIiwiaXNJbkxvd2VyUmlnaHRIYWxmIiwiaXNJblVwcGVyUmlnaHRIYWxmIiwiaXNJbkxvd2VyTGVmdEhhbGYiLCJEaXJlY3Rpb24iLCJtb3VzZVdpdGhpblJlZ2lvbiIsImRpcmVjdGlvbiIsInRhcmdldFJlY3QiLCJjb250ZW50UmVjdCIsImJ1ZmZlciIsIkxlZnQiLCJjb250ZW50UmVjdFdpdGhCdWZmZXIiLCJ0cmFwZXpvaWRUb3AiLCJ0cmFwZXpvaWRDZW50ZXIiLCJ0cmFwZXpvaWRCb3R0b20iLCJSaWdodCIsIlRvcCIsInRyYXBlem9pZExlZnQiLCJ0cmFwZXpvaWRSaWdodCIsIkJvdHRvbSIsIkludGVyYWN0aXZlVG9vbHRpcCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJlbGVtZW50Iiwic2V0U3RhdGUiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ0YXJnZXQiLCJldiIsImNsaWVudFgiLCJjbGllbnRZIiwic3RhdGUiLCJpc09uVGhlU2lkZSIsIm9uTGVmdE9mVGFyZ2V0IiwiYWJvdmVUYXJnZXQiLCJoaWRlVG9vbHRpcCIsInNob3dUb29sdGlwIiwidmlzaWJsZSIsImNvbXBvbmVudERpZFVwZGF0ZSIsInJlbmRlclRvb2x0aXAiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvbk1vdXNlTW92ZSIsInRhcmdldExlZnQiLCJ3aW5kb3ciLCJzY3JvbGxYIiwid2lkdGgiLCJ0YXJnZXRSaWdodCIsInNwYWNlT25SaWdodCIsIlVJU3RvcmUiLCJpbnN0YW5jZSIsIndpbmRvd1dpZHRoIiwidGFyZ2V0VG9wIiwic2Nyb2xsWSIsImhlaWdodCIsInRhcmdldEJvdHRvbSIsInNwYWNlQmVsb3ciLCJ3aW5kb3dIZWlnaHQiLCJvblZpc2liaWxpdHlDaGFuZ2UiLCJhZGRFdmVudExpc3RlbmVyIiwiUmVhY3RET00iLCJ1bm1vdW50Q29tcG9uZW50QXROb2RlIiwicG9zaXRpb24iLCJjaGV2cm9uRmFjZSIsIkNoZXZyb25GYWNlIiwiY2hldnJvbiIsIm1lbnVDbGFzc2VzIiwiY2xhc3NOYW1lcyIsIm1lbnVTdHlsZSIsInRvb2x0aXAiLCJjb2xsZWN0Q29udGVudFJlY3QiLCJjb250ZW50IiwicmVuZGVyIiwiY2hpbGRyZW4iLCJyZWYiLCJjb2xsZWN0VGFyZ2V0Iiwib25Nb3VzZU92ZXIiLCJvblRhcmdldE1vdXNlT3ZlciIsInNpZGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9JbnRlcmFjdGl2ZVRvb2x0aXAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSAtIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ1NTUHJvcGVydGllcywgTW91c2VFdmVudEhhbmRsZXIsIFJlYWN0Tm9kZSwgUmVmQ2FsbGJhY2sgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5pbXBvcnQgVUlTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1VJU3RvcmVcIjtcbmltcG9ydCB7IENoZXZyb25GYWNlIH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcblxuY29uc3QgSW50ZXJhY3RpdmVUb29sdGlwQ29udGFpbmVySWQgPSBcIm14X0ludGVyYWN0aXZlVG9vbHRpcF9Db250YWluZXJcIjtcblxuLy8gSWYgdGhlIGRpc3RhbmNlIGZyb20gdG9vbHRpcCB0byB3aW5kb3cgZWRnZSBpcyBiZWxvdyB0aGlzIHZhbHVlLCB0aGUgdG9vbHRpcFxuLy8gd2lsbCBmbGlwIGFyb3VuZCB0byB0aGUgb3RoZXIgc2lkZSBvZiB0aGUgdGFyZ2V0LlxuY29uc3QgTUlOX1NBRkVfRElTVEFOQ0VfVE9fV0lORE9XX0VER0UgPSAyMDtcblxuZnVuY3Rpb24gZ2V0T3JDcmVhdGVDb250YWluZXIoKTogSFRNTEVsZW1lbnQge1xuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChJbnRlcmFjdGl2ZVRvb2x0aXBDb250YWluZXJJZCk7XG5cbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuaWQgPSBJbnRlcmFjdGl2ZVRvb2x0aXBDb250YWluZXJJZDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBjb250YWluZXI7XG59XG5cbmludGVyZmFjZSBJUmVjdCB7XG4gICAgdG9wOiBudW1iZXI7XG4gICAgcmlnaHQ6IG51bWJlcjtcbiAgICBib3R0b206IG51bWJlcjtcbiAgICBsZWZ0OiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIGlzSW5SZWN0KHg6IG51bWJlciwgeTogbnVtYmVyLCByZWN0OiBJUmVjdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0IH0gPSByZWN0O1xuICAgIHJldHVybiB4ID49IGxlZnQgJiYgeCA8PSByaWdodCAmJiB5ID49IHRvcCAmJiB5IDw9IGJvdHRvbTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwb3NpdGl2ZSBzbG9wZSBvZiB0aGUgZGlhZ29uYWwgb2YgdGhlIHJlY3QuXG4gKlxuICogQHBhcmFtIHtET01SZWN0fSByZWN0XG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldERpYWdvbmFsU2xvcGUocmVjdDogSVJlY3QpOiBudW1iZXIge1xuICAgIGNvbnN0IHsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0IH0gPSByZWN0O1xuICAgIHJldHVybiAoYm90dG9tIC0gdG9wKSAvIChyaWdodCAtIGxlZnQpO1xufVxuXG5mdW5jdGlvbiBpc0luVXBwZXJMZWZ0SGFsZih4OiBudW1iZXIsIHk6IG51bWJlciwgcmVjdDogSVJlY3QpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGJvdHRvbSwgbGVmdCB9ID0gcmVjdDtcbiAgICAvLyBOZWdhdGl2ZSBzbG9wZSBiZWNhdXNlIFkgdmFsdWVzIGdyb3cgZG93bndhcmRzIGFuZCBmb3IgdGhpcyBjYXNlLCB0aGVcbiAgICAvLyBkaWFnb25hbCBnb2VzIGZyb20gbGFyZ2VyIHRvIHNtYWxsZXIgWSB2YWx1ZXMuXG4gICAgY29uc3QgZGlhZ29uYWxTbG9wZSA9IGdldERpYWdvbmFsU2xvcGUocmVjdCkgKiAtMTtcbiAgICByZXR1cm4gaXNJblJlY3QoeCwgeSwgcmVjdCkgJiYgKHkgPD0gYm90dG9tICsgZGlhZ29uYWxTbG9wZSAqICh4IC0gbGVmdCkpO1xufVxuXG5mdW5jdGlvbiBpc0luTG93ZXJSaWdodEhhbGYoeDogbnVtYmVyLCB5OiBudW1iZXIsIHJlY3Q6IElSZWN0KTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBib3R0b20sIGxlZnQgfSA9IHJlY3Q7XG4gICAgLy8gTmVnYXRpdmUgc2xvcGUgYmVjYXVzZSBZIHZhbHVlcyBncm93IGRvd253YXJkcyBhbmQgZm9yIHRoaXMgY2FzZSwgdGhlXG4gICAgLy8gZGlhZ29uYWwgZ29lcyBmcm9tIGxhcmdlciB0byBzbWFsbGVyIFkgdmFsdWVzLlxuICAgIGNvbnN0IGRpYWdvbmFsU2xvcGUgPSBnZXREaWFnb25hbFNsb3BlKHJlY3QpICogLTE7XG4gICAgcmV0dXJuIGlzSW5SZWN0KHgsIHksIHJlY3QpICYmICh5ID49IGJvdHRvbSArIGRpYWdvbmFsU2xvcGUgKiAoeCAtIGxlZnQpKTtcbn1cblxuZnVuY3Rpb24gaXNJblVwcGVyUmlnaHRIYWxmKHg6IG51bWJlciwgeTogbnVtYmVyLCByZWN0OiBJUmVjdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgdG9wLCBsZWZ0IH0gPSByZWN0O1xuICAgIC8vIFBvc2l0aXZlIHNsb3BlIGJlY2F1c2UgWSB2YWx1ZXMgZ3JvdyBkb3dud2FyZHMgYW5kIGZvciB0aGlzIGNhc2UsIHRoZVxuICAgIC8vIGRpYWdvbmFsIGdvZXMgZnJvbSBzbWFsbGVyIHRvIGxhcmdlciBZIHZhbHVlcy5cbiAgICBjb25zdCBkaWFnb25hbFNsb3BlID0gZ2V0RGlhZ29uYWxTbG9wZShyZWN0KSAqIDE7XG4gICAgcmV0dXJuIGlzSW5SZWN0KHgsIHksIHJlY3QpICYmICh5IDw9IHRvcCArIGRpYWdvbmFsU2xvcGUgKiAoeCAtIGxlZnQpKTtcbn1cblxuZnVuY3Rpb24gaXNJbkxvd2VyTGVmdEhhbGYoeDogbnVtYmVyLCB5OiBudW1iZXIsIHJlY3Q6IElSZWN0KTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyB0b3AsIGxlZnQgfSA9IHJlY3Q7XG4gICAgLy8gUG9zaXRpdmUgc2xvcGUgYmVjYXVzZSBZIHZhbHVlcyBncm93IGRvd253YXJkcyBhbmQgZm9yIHRoaXMgY2FzZSwgdGhlXG4gICAgLy8gZGlhZ29uYWwgZ29lcyBmcm9tIHNtYWxsZXIgdG8gbGFyZ2VyIFkgdmFsdWVzLlxuICAgIGNvbnN0IGRpYWdvbmFsU2xvcGUgPSBnZXREaWFnb25hbFNsb3BlKHJlY3QpICogMTtcbiAgICByZXR1cm4gaXNJblJlY3QoeCwgeSwgcmVjdCkgJiYgKHkgPj0gdG9wICsgZGlhZ29uYWxTbG9wZSAqICh4IC0gbGVmdCkpO1xufVxuXG5leHBvcnQgZW51bSBEaXJlY3Rpb24ge1xuICAgIFRvcCxcbiAgICBMZWZ0LFxuICAgIEJvdHRvbSxcbiAgICBSaWdodCxcbn1cblxuLy8gZXhwb3J0ZWQgZm9yIHRlc3RzXG5leHBvcnQgZnVuY3Rpb24gbW91c2VXaXRoaW5SZWdpb24oXG4gICAgeDogbnVtYmVyLFxuICAgIHk6IG51bWJlcixcbiAgICBkaXJlY3Rpb246IERpcmVjdGlvbixcbiAgICB0YXJnZXRSZWN0OiBET01SZWN0LFxuICAgIGNvbnRlbnRSZWN0OiBET01SZWN0LFxuKTogYm9vbGVhbiB7XG4gICAgLy8gV2hlbiBtb3ZpbmcgdGhlIG1vdXNlIGZyb20gdGhlIHRhcmdldCB0byB0aGUgdG9vbHRpcCwgd2UgY3JlYXRlIGEgc2FmZSBhcmVhXG4gICAgLy8gdGhhdCBpbmNsdWRlcyB0aGUgdG9vbHRpcCwgdGhlIHRhcmdldCwgYW5kIHRoZSB0cmFwZXpvaWQgQUJDRCBiZXR3ZWVuIHRoZW06XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgICAgICDilIJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgICAgIOKUglxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICBBIOKUlOKUgOKUgOKUgEXilIDilIDilIBG4pSA4pSA4pSA4pSYIEJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIzilIDilJBcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDilIJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ+KUlOKUgOKUmERcbiAgICAvL1xuICAgIC8vIEFzIGxvbmcgYXMgdGhlIG1vdXNlIHJlbWFpbnMgaW5zaWRlIHRoZSBzYWZlIGFyZWEsIHRoZSB0b29sdGlwIHdpbGwgc3RheSBvcGVuLlxuICAgIGNvbnN0IGJ1ZmZlciA9IDUwO1xuICAgIGlmIChpc0luUmVjdCh4LCB5LCB0YXJnZXRSZWN0KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OiB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50UmVjdFdpdGhCdWZmZXIgPSB7XG4gICAgICAgICAgICAgICAgdG9wOiBjb250ZW50UmVjdC50b3AgLSBidWZmZXIsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IGNvbnRlbnRSZWN0LnJpZ2h0LFxuICAgICAgICAgICAgICAgIGJvdHRvbTogY29udGVudFJlY3QuYm90dG9tICsgYnVmZmVyLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGNvbnRlbnRSZWN0LmxlZnQgLSBidWZmZXIsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdHJhcGV6b2lkVG9wID0ge1xuICAgICAgICAgICAgICAgIHRvcDogY29udGVudFJlY3QudG9wIC0gYnVmZmVyLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiB0YXJnZXRSZWN0LnJpZ2h0LFxuICAgICAgICAgICAgICAgIGJvdHRvbTogdGFyZ2V0UmVjdC50b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogY29udGVudFJlY3QucmlnaHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdHJhcGV6b2lkQ2VudGVyID0ge1xuICAgICAgICAgICAgICAgIHRvcDogdGFyZ2V0UmVjdC50b3AsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IHRhcmdldFJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICBib3R0b206IHRhcmdldFJlY3QuYm90dG9tLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGNvbnRlbnRSZWN0LnJpZ2h0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHRyYXBlem9pZEJvdHRvbSA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IHRhcmdldFJlY3QuYm90dG9tLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiB0YXJnZXRSZWN0LnJpZ2h0LFxuICAgICAgICAgICAgICAgIGJvdHRvbTogY29udGVudFJlY3QuYm90dG9tICsgYnVmZmVyLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGNvbnRlbnRSZWN0LnJpZ2h0LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGlzSW5SZWN0KHgsIHksIGNvbnRlbnRSZWN0V2l0aEJ1ZmZlcikgfHxcbiAgICAgICAgICAgICAgICBpc0luTG93ZXJMZWZ0SGFsZih4LCB5LCB0cmFwZXpvaWRUb3ApIHx8XG4gICAgICAgICAgICAgICAgaXNJblJlY3QoeCwgeSwgdHJhcGV6b2lkQ2VudGVyKSB8fFxuICAgICAgICAgICAgICAgIGlzSW5VcHBlckxlZnRIYWxmKHgsIHksIHRyYXBlem9pZEJvdHRvbSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OiB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50UmVjdFdpdGhCdWZmZXIgPSB7XG4gICAgICAgICAgICAgICAgdG9wOiBjb250ZW50UmVjdC50b3AgLSBidWZmZXIsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IGNvbnRlbnRSZWN0LnJpZ2h0ICsgYnVmZmVyLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogY29udGVudFJlY3QuYm90dG9tICsgYnVmZmVyLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGNvbnRlbnRSZWN0LmxlZnQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdHJhcGV6b2lkVG9wID0ge1xuICAgICAgICAgICAgICAgIHRvcDogY29udGVudFJlY3QudG9wIC0gYnVmZmVyLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjb250ZW50UmVjdC5sZWZ0LFxuICAgICAgICAgICAgICAgIGJvdHRvbTogdGFyZ2V0UmVjdC50b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogdGFyZ2V0UmVjdC5sZWZ0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHRyYXBlem9pZENlbnRlciA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IHRhcmdldFJlY3QudG9wLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjb250ZW50UmVjdC5sZWZ0LFxuICAgICAgICAgICAgICAgIGJvdHRvbTogdGFyZ2V0UmVjdC5ib3R0b20sXG4gICAgICAgICAgICAgICAgbGVmdDogdGFyZ2V0UmVjdC5yaWdodCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB0cmFwZXpvaWRCb3R0b20gPSB7XG4gICAgICAgICAgICAgICAgdG9wOiB0YXJnZXRSZWN0LmJvdHRvbSxcbiAgICAgICAgICAgICAgICByaWdodDogY29udGVudFJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICBib3R0b206IGNvbnRlbnRSZWN0LmJvdHRvbSArIGJ1ZmZlcixcbiAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRSZWN0LmxlZnQsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXNJblJlY3QoeCwgeSwgY29udGVudFJlY3RXaXRoQnVmZmVyKSB8fFxuICAgICAgICAgICAgICAgIGlzSW5Mb3dlclJpZ2h0SGFsZih4LCB5LCB0cmFwZXpvaWRUb3ApIHx8XG4gICAgICAgICAgICAgICAgaXNJblJlY3QoeCwgeSwgdHJhcGV6b2lkQ2VudGVyKSB8fFxuICAgICAgICAgICAgICAgIGlzSW5VcHBlclJpZ2h0SGFsZih4LCB5LCB0cmFwZXpvaWRCb3R0b20pXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIERpcmVjdGlvbi5Ub3A6IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRSZWN0V2l0aEJ1ZmZlciA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IGNvbnRlbnRSZWN0LnRvcCAtIGJ1ZmZlcixcbiAgICAgICAgICAgICAgICByaWdodDogY29udGVudFJlY3QucmlnaHQgKyBidWZmZXIsXG4gICAgICAgICAgICAgICAgYm90dG9tOiBjb250ZW50UmVjdC5ib3R0b20sXG4gICAgICAgICAgICAgICAgbGVmdDogY29udGVudFJlY3QubGVmdCAtIGJ1ZmZlcixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB0cmFwZXpvaWRMZWZ0ID0ge1xuICAgICAgICAgICAgICAgIHRvcDogY29udGVudFJlY3QuYm90dG9tLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiB0YXJnZXRSZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgYm90dG9tOiB0YXJnZXRSZWN0LmJvdHRvbSxcbiAgICAgICAgICAgICAgICBsZWZ0OiBjb250ZW50UmVjdC5sZWZ0IC0gYnVmZmVyLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHRyYXBlem9pZENlbnRlciA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IGNvbnRlbnRSZWN0LmJvdHRvbSxcbiAgICAgICAgICAgICAgICByaWdodDogdGFyZ2V0UmVjdC5yaWdodCxcbiAgICAgICAgICAgICAgICBib3R0b206IHRhcmdldFJlY3QudG9wLFxuICAgICAgICAgICAgICAgIGxlZnQ6IHRhcmdldFJlY3QubGVmdCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB0cmFwZXpvaWRSaWdodCA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IGNvbnRlbnRSZWN0LmJvdHRvbSxcbiAgICAgICAgICAgICAgICByaWdodDogY29udGVudFJlY3QucmlnaHQgKyBidWZmZXIsXG4gICAgICAgICAgICAgICAgYm90dG9tOiB0YXJnZXRSZWN0LmJvdHRvbSxcbiAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRSZWN0LnJpZ2h0LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGlzSW5SZWN0KHgsIHksIGNvbnRlbnRSZWN0V2l0aEJ1ZmZlcikgfHxcbiAgICAgICAgICAgICAgICBpc0luVXBwZXJSaWdodEhhbGYoeCwgeSwgdHJhcGV6b2lkTGVmdCkgfHxcbiAgICAgICAgICAgICAgICBpc0luUmVjdCh4LCB5LCB0cmFwZXpvaWRDZW50ZXIpIHx8XG4gICAgICAgICAgICAgICAgaXNJblVwcGVyTGVmdEhhbGYoeCwgeSwgdHJhcGV6b2lkUmlnaHQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlIERpcmVjdGlvbi5Cb3R0b206IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRSZWN0V2l0aEJ1ZmZlciA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IGNvbnRlbnRSZWN0LnRvcCxcbiAgICAgICAgICAgICAgICByaWdodDogY29udGVudFJlY3QucmlnaHQgKyBidWZmZXIsXG4gICAgICAgICAgICAgICAgYm90dG9tOiBjb250ZW50UmVjdC5ib3R0b20gKyBidWZmZXIsXG4gICAgICAgICAgICAgICAgbGVmdDogY29udGVudFJlY3QubGVmdCAtIGJ1ZmZlcixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB0cmFwZXpvaWRMZWZ0ID0ge1xuICAgICAgICAgICAgICAgIHRvcDogdGFyZ2V0UmVjdC50b3AsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IHRhcmdldFJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICBib3R0b206IGNvbnRlbnRSZWN0LnRvcCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBjb250ZW50UmVjdC5sZWZ0IC0gYnVmZmVyLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHRyYXBlem9pZENlbnRlciA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IHRhcmdldFJlY3QuYm90dG9tLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiB0YXJnZXRSZWN0LnJpZ2h0LFxuICAgICAgICAgICAgICAgIGJvdHRvbTogY29udGVudFJlY3QudG9wLFxuICAgICAgICAgICAgICAgIGxlZnQ6IHRhcmdldFJlY3QubGVmdCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB0cmFwZXpvaWRSaWdodCA9IHtcbiAgICAgICAgICAgICAgICB0b3A6IHRhcmdldFJlY3QudG9wLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjb250ZW50UmVjdC5yaWdodCArIGJ1ZmZlcixcbiAgICAgICAgICAgICAgICBib3R0b206IGNvbnRlbnRSZWN0LnRvcCxcbiAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRSZWN0LnJpZ2h0LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGlzSW5SZWN0KHgsIHksIGNvbnRlbnRSZWN0V2l0aEJ1ZmZlcikgfHxcbiAgICAgICAgICAgICAgICBpc0luTG93ZXJSaWdodEhhbGYoeCwgeSwgdHJhcGV6b2lkTGVmdCkgfHxcbiAgICAgICAgICAgICAgICBpc0luUmVjdCh4LCB5LCB0cmFwZXpvaWRDZW50ZXIpIHx8XG4gICAgICAgICAgICAgICAgaXNJbkxvd2VyTGVmdEhhbGYoeCwgeSwgdHJhcGV6b2lkUmlnaHQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGNoaWxkcmVuKHByb3BzOiB7XG4gICAgICAgIHJlZjogUmVmQ2FsbGJhY2s8SFRNTEVsZW1lbnQ+O1xuICAgICAgICBvbk1vdXNlT3ZlcjogTW91c2VFdmVudEhhbmRsZXI7XG4gICAgfSk6IFJlYWN0Tm9kZTtcbiAgICAvLyBDb250ZW50IHRvIHNob3cgaW4gdGhlIHRvb2x0aXBcbiAgICBjb250ZW50OiBSZWFjdE5vZGU7XG4gICAgZGlyZWN0aW9uPzogRGlyZWN0aW9uO1xuICAgIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB2aXNpYmlsaXR5IG9mIHRoZSB0b29sdGlwIGNoYW5nZXNcbiAgICBvblZpc2liaWxpdHlDaGFuZ2U/KHZpc2libGU6IGJvb2xlYW4pOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBjb250ZW50UmVjdDogRE9NUmVjdDtcbiAgICB2aXNpYmxlOiBib29sZWFuO1xufVxuXG4vKlxuICogVGhpcyBzdHlsZSBvZiB0b29sdGlwIHRha2VzIGEgXCJ0YXJnZXRcIiBlbGVtZW50IGFzIGl0cyBjaGlsZCBhbmQgY2VudGVycyB0aGVcbiAqIHRvb2x0aXAgYWxvbmcgb25lIGVkZ2Ugb2YgdGhlIHRhcmdldC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJhY3RpdmVUb29sdGlwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSB0YXJnZXQ6IEhUTUxFbGVtZW50O1xuXG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIHNpZGU6IERpcmVjdGlvbi5Ub3AsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgY29udGVudFJlY3Q6IG51bGwsXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIC8vIFdoZW5ldmVyIHRoaXMgcGFzc3Rocm91Z2ggY29tcG9uZW50IHVwZGF0ZXMsIGFsc28gcmVuZGVyIHRoZSB0b29sdGlwXG4gICAgICAgIC8vIGluIGEgc2VwYXJhdGUgRE9NIHRyZWUuIFRoaXMgYWxsb3dzIHRoZSB0b29sdGlwIGNvbnRlbnQgdG8gcGFydGljaXBhdGVcbiAgICAgICAgLy8gdGhlIG5vcm1hbCBSZWFjdCByZW5kZXJpbmcgY3ljbGU6IHdoZW4gdGhpcyBjb21wb25lbnQgcmUtcmVuZGVycywgdGhlXG4gICAgICAgIC8vIHRvb2x0aXAgY29udGVudCByZS1yZW5kZXJzLlxuICAgICAgICAvLyBPbmNlIHdlIHVwZ3JhZGUgdG8gUmVhY3QgMTYsIHRoaXMgY291bGQgYmUgZG9uZSBhIGJpdCBtb3JlIG5hdHVyYWxseVxuICAgICAgICAvLyB1c2luZyB0aGUgcG9ydGFscyBmZWF0dXJlIGluc3RlYWQuXG4gICAgICAgIHRoaXMucmVuZGVyVG9vbHRpcCgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMub25Nb3VzZU1vdmUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29sbGVjdENvbnRlbnRSZWN0ID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCA9PiB7XG4gICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gY2xlYW4gdXAgd2hlbiB1bm1vdW50aW5nLCBzbyBpZ25vcmVcbiAgICAgICAgaWYgKCFlbGVtZW50KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb250ZW50UmVjdDogZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY29sbGVjdFRhcmdldCA9IChlbGVtZW50OiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICB0aGlzLnRhcmdldCA9IGVsZW1lbnQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25MZWZ0T2ZUYXJnZXQoKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHsgY29udGVudFJlY3QgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIGNvbnN0IHRhcmdldFJlY3QgPSB0aGlzLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kaXJlY3Rpb24gPT09IERpcmVjdGlvbi5MZWZ0KSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRMZWZ0ID0gdGFyZ2V0UmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFg7XG4gICAgICAgICAgICByZXR1cm4gIWNvbnRlbnRSZWN0IHx8ICh0YXJnZXRMZWZ0IC0gY29udGVudFJlY3Qud2lkdGggPiBNSU5fU0FGRV9ESVNUQU5DRV9UT19XSU5ET1dfRURHRSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRSaWdodCA9IHRhcmdldFJlY3QucmlnaHQgKyB3aW5kb3cuc2Nyb2xsWDtcbiAgICAgICAgICAgIGNvbnN0IHNwYWNlT25SaWdodCA9IFVJU3RvcmUuaW5zdGFuY2Uud2luZG93V2lkdGggLSB0YXJnZXRSaWdodDtcbiAgICAgICAgICAgIHJldHVybiBjb250ZW50UmVjdCAmJiAoc3BhY2VPblJpZ2h0IC0gY29udGVudFJlY3Qud2lkdGggPCBNSU5fU0FGRV9ESVNUQU5DRV9UT19XSU5ET1dfRURHRSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFib3ZlVGFyZ2V0KCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCB7IGNvbnRlbnRSZWN0IH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBjb25zdCB0YXJnZXRSZWN0ID0gdGhpcy50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGlyZWN0aW9uID09PSBEaXJlY3Rpb24uVG9wKSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUb3AgPSB0YXJnZXRSZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICAgICAgcmV0dXJuICFjb250ZW50UmVjdCB8fCAodGFyZ2V0VG9wIC0gY29udGVudFJlY3QuaGVpZ2h0ID4gTUlOX1NBRkVfRElTVEFOQ0VfVE9fV0lORE9XX0VER0UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0Qm90dG9tID0gdGFyZ2V0UmVjdC5ib3R0b20gKyB3aW5kb3cuc2Nyb2xsWTtcbiAgICAgICAgICAgIGNvbnN0IHNwYWNlQmVsb3cgPSBVSVN0b3JlLmluc3RhbmNlLndpbmRvd0hlaWdodCAtIHRhcmdldEJvdHRvbTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZW50UmVjdCAmJiAoc3BhY2VCZWxvdyAtIGNvbnRlbnRSZWN0LmhlaWdodCA8IE1JTl9TQUZFX0RJU1RBTkNFX1RPX1dJTkRPV19FREdFKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGlzT25UaGVTaWRlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5kaXJlY3Rpb24gPT09IERpcmVjdGlvbi5MZWZ0IHx8IHRoaXMucHJvcHMuZGlyZWN0aW9uID09PSBEaXJlY3Rpb24uUmlnaHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlTW92ZSA9IChldjogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7IGNsaWVudFg6IHgsIGNsaWVudFk6IHkgfSA9IGV2O1xuICAgICAgICBjb25zdCB7IGNvbnRlbnRSZWN0IH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBjb25zdCB0YXJnZXRSZWN0ID0gdGhpcy50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgbGV0IGRpcmVjdGlvbjogRGlyZWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5pc09uVGhlU2lkZSkge1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gdGhpcy5vbkxlZnRPZlRhcmdldCgpID8gRGlyZWN0aW9uLkxlZnQgOiBEaXJlY3Rpb24uUmlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSB0aGlzLmFib3ZlVGFyZ2V0KCkgPyBEaXJlY3Rpb24uVG9wIDogRGlyZWN0aW9uLkJvdHRvbTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbW91c2VXaXRoaW5SZWdpb24oeCwgeSwgZGlyZWN0aW9uLCB0YXJnZXRSZWN0LCBjb250ZW50UmVjdCkpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZVRvb2x0aXAoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVGFyZ2V0TW91c2VPdmVyID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNob3dUb29sdGlwKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2hvd1Rvb2x0aXAoKTogdm9pZCB7XG4gICAgICAgIC8vIERvbid0IGVudGVyIHZpc2libGUgc3RhdGUgaWYgd2UgaGF2ZW4ndCBjb2xsZWN0ZWQgdGhlIHRhcmdldCB5ZXRcbiAgICAgICAgaWYgKCF0aGlzLnRhcmdldCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25WaXNpYmlsaXR5Q2hhbmdlPy4odHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5vbk1vdXNlTW92ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGhpZGVUb29sdGlwKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblZpc2liaWxpdHlDaGFuZ2U/LihmYWxzZSk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5vbk1vdXNlTW92ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJUb29sdGlwKCkge1xuICAgICAgICBjb25zdCB7IGNvbnRlbnRSZWN0LCB2aXNpYmxlIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBpZiAoIXZpc2libGUpIHtcbiAgICAgICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRhcmdldFJlY3QgPSB0aGlzLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAvLyBUaGUgd2luZG93IFggYW5kIFkgb2Zmc2V0cyBhcmUgdG8gYWRqdXN0IHBvc2l0aW9uIHdoZW4gem9vbWVkIGluIHRvIHBhZ2VcbiAgICAgICAgY29uc3QgdGFyZ2V0TGVmdCA9IHRhcmdldFJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYO1xuICAgICAgICBjb25zdCB0YXJnZXRSaWdodCA9IHRhcmdldFJlY3QucmlnaHQgKyB3aW5kb3cuc2Nyb2xsWDtcbiAgICAgICAgY29uc3QgdGFyZ2V0Qm90dG9tID0gdGFyZ2V0UmVjdC5ib3R0b20gKyB3aW5kb3cuc2Nyb2xsWTtcbiAgICAgICAgY29uc3QgdGFyZ2V0VG9wID0gdGFyZ2V0UmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWTtcblxuICAgICAgICAvLyBQbGFjZSB0aGUgdG9vbHRpcCBhYm92ZSB0aGUgdGFyZ2V0IGJ5IGRlZmF1bHQuIElmIHdlIGZpbmQgdGhhdCB0aGVcbiAgICAgICAgLy8gdG9vbHRpcCBjb250ZW50IHdvdWxkIGV4dGVuZCBwYXN0IHRoZSBzYWZlIGFyZWEgdG93YXJkcyB0aGUgd2luZG93XG4gICAgICAgIC8vIGVkZ2UsIGZsaXAgYXJvdW5kIHRvIGJlbG93IHRoZSB0YXJnZXQuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uOiBQYXJ0aWFsPElSZWN0PiA9IHt9O1xuICAgICAgICBsZXQgY2hldnJvbkZhY2U6IENoZXZyb25GYWNlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuaXNPblRoZVNpZGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9uTGVmdE9mVGFyZ2V0KCkpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ID0gdGFyZ2V0TGVmdDtcbiAgICAgICAgICAgICAgICBjaGV2cm9uRmFjZSA9IENoZXZyb25GYWNlLlJpZ2h0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ID0gdGFyZ2V0UmlnaHQ7XG4gICAgICAgICAgICAgICAgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5MZWZ0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb3NpdGlvbi50b3AgPSB0YXJnZXRUb3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hYm92ZVRhcmdldCgpKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24uYm90dG9tID0gVUlTdG9yZS5pbnN0YW5jZS53aW5kb3dIZWlnaHQgLSB0YXJnZXRUb3A7XG4gICAgICAgICAgICAgICAgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5Cb3R0b207XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnRvcCA9IHRhcmdldEJvdHRvbTtcbiAgICAgICAgICAgICAgICBjaGV2cm9uRmFjZSA9IENoZXZyb25GYWNlLlRvcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2VudGVyIHRoZSB0b29sdGlwIGhvcml6b250YWxseSB3aXRoIHRoZSB0YXJnZXQncyBjZW50ZXIuXG4gICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ID0gdGFyZ2V0TGVmdCArIHRhcmdldFJlY3Qud2lkdGggLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hldnJvbiA9IDxkaXYgY2xhc3NOYW1lPXtcIm14X0ludGVyYWN0aXZlVG9vbHRpcF9jaGV2cm9uX1wiICsgY2hldnJvbkZhY2V9IC8+O1xuXG4gICAgICAgIGNvbnN0IG1lbnVDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnbXhfSW50ZXJhY3RpdmVUb29sdGlwJzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9JbnRlcmFjdGl2ZVRvb2x0aXBfd2l0aENoZXZyb25fdG9wJzogY2hldnJvbkZhY2UgPT09IENoZXZyb25GYWNlLlRvcCxcbiAgICAgICAgICAgICdteF9JbnRlcmFjdGl2ZVRvb2x0aXBfd2l0aENoZXZyb25fbGVmdCc6IGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5MZWZ0LFxuICAgICAgICAgICAgJ214X0ludGVyYWN0aXZlVG9vbHRpcF93aXRoQ2hldnJvbl9yaWdodCc6IGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5SaWdodCxcbiAgICAgICAgICAgICdteF9JbnRlcmFjdGl2ZVRvb2x0aXBfd2l0aENoZXZyb25fYm90dG9tJzogY2hldnJvbkZhY2UgPT09IENoZXZyb25GYWNlLkJvdHRvbSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgbWVudVN0eWxlOiBDU1NQcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGlmIChjb250ZW50UmVjdCAmJiAhdGhpcy5pc09uVGhlU2lkZSkge1xuICAgICAgICAgICAgbWVudVN0eWxlLmxlZnQgPSBgLSR7Y29udGVudFJlY3Qud2lkdGggLyAyfXB4YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRvb2x0aXAgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0ludGVyYWN0aXZlVG9vbHRpcF93cmFwcGVyXCIgc3R5bGU9e3sgLi4ucG9zaXRpb24gfX0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17bWVudUNsYXNzZXN9IHN0eWxlPXttZW51U3R5bGV9IHJlZj17dGhpcy5jb2xsZWN0Q29udGVudFJlY3R9PlxuICAgICAgICAgICAgICAgIHsgY2hldnJvbiB9XG4gICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNvbnRlbnQgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcblxuICAgICAgICBSZWFjdERPTS5yZW5kZXIodG9vbHRpcCwgZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbih7XG4gICAgICAgICAgICByZWY6IHRoaXMuY29sbGVjdFRhcmdldCxcbiAgICAgICAgICAgIG9uTW91c2VPdmVyOiB0aGlzLm9uVGFyZ2V0TW91c2VPdmVyLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsNkJBQTZCLEdBQUcsaUNBQXRDLEMsQ0FFQTtBQUNBOztBQUNBLE1BQU1DLGdDQUFnQyxHQUFHLEVBQXpDOztBQUVBLFNBQVNDLG9CQUFULEdBQTZDO0VBQ3pDLElBQUlDLFNBQVMsR0FBR0MsUUFBUSxDQUFDQyxjQUFULENBQXdCTCw2QkFBeEIsQ0FBaEI7O0VBRUEsSUFBSSxDQUFDRyxTQUFMLEVBQWdCO0lBQ1pBLFNBQVMsR0FBR0MsUUFBUSxDQUFDRSxhQUFULENBQXVCLEtBQXZCLENBQVo7SUFDQUgsU0FBUyxDQUFDSSxFQUFWLEdBQWVQLDZCQUFmO0lBQ0FJLFFBQVEsQ0FBQ0ksSUFBVCxDQUFjQyxXQUFkLENBQTBCTixTQUExQjtFQUNIOztFQUVELE9BQU9BLFNBQVA7QUFDSDs7QUFTRCxTQUFTTyxRQUFULENBQWtCQyxDQUFsQixFQUE2QkMsQ0FBN0IsRUFBd0NDLElBQXhDLEVBQThEO0VBQzFELE1BQU07SUFBRUMsR0FBRjtJQUFPQyxLQUFQO0lBQWNDLE1BQWQ7SUFBc0JDO0VBQXRCLElBQStCSixJQUFyQztFQUNBLE9BQU9GLENBQUMsSUFBSU0sSUFBTCxJQUFhTixDQUFDLElBQUlJLEtBQWxCLElBQTJCSCxDQUFDLElBQUlFLEdBQWhDLElBQXVDRixDQUFDLElBQUlJLE1BQW5EO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFNBQVNFLGdCQUFULENBQTBCTCxJQUExQixFQUErQztFQUMzQyxNQUFNO0lBQUVDLEdBQUY7SUFBT0MsS0FBUDtJQUFjQyxNQUFkO0lBQXNCQztFQUF0QixJQUErQkosSUFBckM7RUFDQSxPQUFPLENBQUNHLE1BQU0sR0FBR0YsR0FBVixLQUFrQkMsS0FBSyxHQUFHRSxJQUExQixDQUFQO0FBQ0g7O0FBRUQsU0FBU0UsaUJBQVQsQ0FBMkJSLENBQTNCLEVBQXNDQyxDQUF0QyxFQUFpREMsSUFBakQsRUFBdUU7RUFDbkUsTUFBTTtJQUFFRyxNQUFGO0lBQVVDO0VBQVYsSUFBbUJKLElBQXpCLENBRG1FLENBRW5FO0VBQ0E7O0VBQ0EsTUFBTU8sYUFBYSxHQUFHRixnQkFBZ0IsQ0FBQ0wsSUFBRCxDQUFoQixHQUF5QixDQUFDLENBQWhEO0VBQ0EsT0FBT0gsUUFBUSxDQUFDQyxDQUFELEVBQUlDLENBQUosRUFBT0MsSUFBUCxDQUFSLElBQXlCRCxDQUFDLElBQUlJLE1BQU0sR0FBR0ksYUFBYSxJQUFJVCxDQUFDLEdBQUdNLElBQVIsQ0FBM0Q7QUFDSDs7QUFFRCxTQUFTSSxrQkFBVCxDQUE0QlYsQ0FBNUIsRUFBdUNDLENBQXZDLEVBQWtEQyxJQUFsRCxFQUF3RTtFQUNwRSxNQUFNO0lBQUVHLE1BQUY7SUFBVUM7RUFBVixJQUFtQkosSUFBekIsQ0FEb0UsQ0FFcEU7RUFDQTs7RUFDQSxNQUFNTyxhQUFhLEdBQUdGLGdCQUFnQixDQUFDTCxJQUFELENBQWhCLEdBQXlCLENBQUMsQ0FBaEQ7RUFDQSxPQUFPSCxRQUFRLENBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFPQyxJQUFQLENBQVIsSUFBeUJELENBQUMsSUFBSUksTUFBTSxHQUFHSSxhQUFhLElBQUlULENBQUMsR0FBR00sSUFBUixDQUEzRDtBQUNIOztBQUVELFNBQVNLLGtCQUFULENBQTRCWCxDQUE1QixFQUF1Q0MsQ0FBdkMsRUFBa0RDLElBQWxELEVBQXdFO0VBQ3BFLE1BQU07SUFBRUMsR0FBRjtJQUFPRztFQUFQLElBQWdCSixJQUF0QixDQURvRSxDQUVwRTtFQUNBOztFQUNBLE1BQU1PLGFBQWEsR0FBR0YsZ0JBQWdCLENBQUNMLElBQUQsQ0FBaEIsR0FBeUIsQ0FBL0M7RUFDQSxPQUFPSCxRQUFRLENBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFPQyxJQUFQLENBQVIsSUFBeUJELENBQUMsSUFBSUUsR0FBRyxHQUFHTSxhQUFhLElBQUlULENBQUMsR0FBR00sSUFBUixDQUF4RDtBQUNIOztBQUVELFNBQVNNLGlCQUFULENBQTJCWixDQUEzQixFQUFzQ0MsQ0FBdEMsRUFBaURDLElBQWpELEVBQXVFO0VBQ25FLE1BQU07SUFBRUMsR0FBRjtJQUFPRztFQUFQLElBQWdCSixJQUF0QixDQURtRSxDQUVuRTtFQUNBOztFQUNBLE1BQU1PLGFBQWEsR0FBR0YsZ0JBQWdCLENBQUNMLElBQUQsQ0FBaEIsR0FBeUIsQ0FBL0M7RUFDQSxPQUFPSCxRQUFRLENBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFPQyxJQUFQLENBQVIsSUFBeUJELENBQUMsSUFBSUUsR0FBRyxHQUFHTSxhQUFhLElBQUlULENBQUMsR0FBR00sSUFBUixDQUF4RDtBQUNIOztJQUVXTyxTLEVBT1o7Ozs7V0FQWUEsUztFQUFBQSxTLENBQUFBLFM7RUFBQUEsUyxDQUFBQSxTO0VBQUFBLFMsQ0FBQUEsUztFQUFBQSxTLENBQUFBLFM7R0FBQUEsUyx5QkFBQUEsUzs7QUFRTCxTQUFTQyxpQkFBVCxDQUNIZCxDQURHLEVBRUhDLENBRkcsRUFHSGMsU0FIRyxFQUlIQyxVQUpHLEVBS0hDLFdBTEcsRUFNSTtFQUNQO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLE1BQU1DLE1BQU0sR0FBRyxFQUFmOztFQUNBLElBQUluQixRQUFRLENBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFPZSxVQUFQLENBQVosRUFBZ0M7SUFDNUIsT0FBTyxJQUFQO0VBQ0g7O0VBRUQsUUFBUUQsU0FBUjtJQUNJLEtBQUtGLFNBQVMsQ0FBQ00sSUFBZjtNQUFxQjtRQUNqQixNQUFNQyxxQkFBcUIsR0FBRztVQUMxQmpCLEdBQUcsRUFBRWMsV0FBVyxDQUFDZCxHQUFaLEdBQWtCZSxNQURHO1VBRTFCZCxLQUFLLEVBQUVhLFdBQVcsQ0FBQ2IsS0FGTztVQUcxQkMsTUFBTSxFQUFFWSxXQUFXLENBQUNaLE1BQVosR0FBcUJhLE1BSEg7VUFJMUJaLElBQUksRUFBRVcsV0FBVyxDQUFDWCxJQUFaLEdBQW1CWTtRQUpDLENBQTlCO1FBTUEsTUFBTUcsWUFBWSxHQUFHO1VBQ2pCbEIsR0FBRyxFQUFFYyxXQUFXLENBQUNkLEdBQVosR0FBa0JlLE1BRE47VUFFakJkLEtBQUssRUFBRVksVUFBVSxDQUFDWixLQUZEO1VBR2pCQyxNQUFNLEVBQUVXLFVBQVUsQ0FBQ2IsR0FIRjtVQUlqQkcsSUFBSSxFQUFFVyxXQUFXLENBQUNiO1FBSkQsQ0FBckI7UUFNQSxNQUFNa0IsZUFBZSxHQUFHO1VBQ3BCbkIsR0FBRyxFQUFFYSxVQUFVLENBQUNiLEdBREk7VUFFcEJDLEtBQUssRUFBRVksVUFBVSxDQUFDVixJQUZFO1VBR3BCRCxNQUFNLEVBQUVXLFVBQVUsQ0FBQ1gsTUFIQztVQUlwQkMsSUFBSSxFQUFFVyxXQUFXLENBQUNiO1FBSkUsQ0FBeEI7UUFNQSxNQUFNbUIsZUFBZSxHQUFHO1VBQ3BCcEIsR0FBRyxFQUFFYSxVQUFVLENBQUNYLE1BREk7VUFFcEJELEtBQUssRUFBRVksVUFBVSxDQUFDWixLQUZFO1VBR3BCQyxNQUFNLEVBQUVZLFdBQVcsQ0FBQ1osTUFBWixHQUFxQmEsTUFIVDtVQUlwQlosSUFBSSxFQUFFVyxXQUFXLENBQUNiO1FBSkUsQ0FBeEI7O1FBT0EsSUFDSUwsUUFBUSxDQUFDQyxDQUFELEVBQUlDLENBQUosRUFBT21CLHFCQUFQLENBQVIsSUFDQVIsaUJBQWlCLENBQUNaLENBQUQsRUFBSUMsQ0FBSixFQUFPb0IsWUFBUCxDQURqQixJQUVBdEIsUUFBUSxDQUFDQyxDQUFELEVBQUlDLENBQUosRUFBT3FCLGVBQVAsQ0FGUixJQUdBZCxpQkFBaUIsQ0FBQ1IsQ0FBRCxFQUFJQyxDQUFKLEVBQU9zQixlQUFQLENBSnJCLEVBS0U7VUFDRSxPQUFPLElBQVA7UUFDSDs7UUFFRDtNQUNIOztJQUVELEtBQUtWLFNBQVMsQ0FBQ1csS0FBZjtNQUFzQjtRQUNsQixNQUFNSixxQkFBcUIsR0FBRztVQUMxQmpCLEdBQUcsRUFBRWMsV0FBVyxDQUFDZCxHQUFaLEdBQWtCZSxNQURHO1VBRTFCZCxLQUFLLEVBQUVhLFdBQVcsQ0FBQ2IsS0FBWixHQUFvQmMsTUFGRDtVQUcxQmIsTUFBTSxFQUFFWSxXQUFXLENBQUNaLE1BQVosR0FBcUJhLE1BSEg7VUFJMUJaLElBQUksRUFBRVcsV0FBVyxDQUFDWDtRQUpRLENBQTlCO1FBTUEsTUFBTWUsWUFBWSxHQUFHO1VBQ2pCbEIsR0FBRyxFQUFFYyxXQUFXLENBQUNkLEdBQVosR0FBa0JlLE1BRE47VUFFakJkLEtBQUssRUFBRWEsV0FBVyxDQUFDWCxJQUZGO1VBR2pCRCxNQUFNLEVBQUVXLFVBQVUsQ0FBQ2IsR0FIRjtVQUlqQkcsSUFBSSxFQUFFVSxVQUFVLENBQUNWO1FBSkEsQ0FBckI7UUFNQSxNQUFNZ0IsZUFBZSxHQUFHO1VBQ3BCbkIsR0FBRyxFQUFFYSxVQUFVLENBQUNiLEdBREk7VUFFcEJDLEtBQUssRUFBRWEsV0FBVyxDQUFDWCxJQUZDO1VBR3BCRCxNQUFNLEVBQUVXLFVBQVUsQ0FBQ1gsTUFIQztVQUlwQkMsSUFBSSxFQUFFVSxVQUFVLENBQUNaO1FBSkcsQ0FBeEI7UUFNQSxNQUFNbUIsZUFBZSxHQUFHO1VBQ3BCcEIsR0FBRyxFQUFFYSxVQUFVLENBQUNYLE1BREk7VUFFcEJELEtBQUssRUFBRWEsV0FBVyxDQUFDWCxJQUZDO1VBR3BCRCxNQUFNLEVBQUVZLFdBQVcsQ0FBQ1osTUFBWixHQUFxQmEsTUFIVDtVQUlwQlosSUFBSSxFQUFFVSxVQUFVLENBQUNWO1FBSkcsQ0FBeEI7O1FBT0EsSUFDSVAsUUFBUSxDQUFDQyxDQUFELEVBQUlDLENBQUosRUFBT21CLHFCQUFQLENBQVIsSUFDQVYsa0JBQWtCLENBQUNWLENBQUQsRUFBSUMsQ0FBSixFQUFPb0IsWUFBUCxDQURsQixJQUVBdEIsUUFBUSxDQUFDQyxDQUFELEVBQUlDLENBQUosRUFBT3FCLGVBQVAsQ0FGUixJQUdBWCxrQkFBa0IsQ0FBQ1gsQ0FBRCxFQUFJQyxDQUFKLEVBQU9zQixlQUFQLENBSnRCLEVBS0U7VUFDRSxPQUFPLElBQVA7UUFDSDs7UUFFRDtNQUNIOztJQUVELEtBQUtWLFNBQVMsQ0FBQ1ksR0FBZjtNQUFvQjtRQUNoQixNQUFNTCxxQkFBcUIsR0FBRztVQUMxQmpCLEdBQUcsRUFBRWMsV0FBVyxDQUFDZCxHQUFaLEdBQWtCZSxNQURHO1VBRTFCZCxLQUFLLEVBQUVhLFdBQVcsQ0FBQ2IsS0FBWixHQUFvQmMsTUFGRDtVQUcxQmIsTUFBTSxFQUFFWSxXQUFXLENBQUNaLE1BSE07VUFJMUJDLElBQUksRUFBRVcsV0FBVyxDQUFDWCxJQUFaLEdBQW1CWTtRQUpDLENBQTlCO1FBTUEsTUFBTVEsYUFBYSxHQUFHO1VBQ2xCdkIsR0FBRyxFQUFFYyxXQUFXLENBQUNaLE1BREM7VUFFbEJELEtBQUssRUFBRVksVUFBVSxDQUFDVixJQUZBO1VBR2xCRCxNQUFNLEVBQUVXLFVBQVUsQ0FBQ1gsTUFIRDtVQUlsQkMsSUFBSSxFQUFFVyxXQUFXLENBQUNYLElBQVosR0FBbUJZO1FBSlAsQ0FBdEI7UUFNQSxNQUFNSSxlQUFlLEdBQUc7VUFDcEJuQixHQUFHLEVBQUVjLFdBQVcsQ0FBQ1osTUFERztVQUVwQkQsS0FBSyxFQUFFWSxVQUFVLENBQUNaLEtBRkU7VUFHcEJDLE1BQU0sRUFBRVcsVUFBVSxDQUFDYixHQUhDO1VBSXBCRyxJQUFJLEVBQUVVLFVBQVUsQ0FBQ1Y7UUFKRyxDQUF4QjtRQU1BLE1BQU1xQixjQUFjLEdBQUc7VUFDbkJ4QixHQUFHLEVBQUVjLFdBQVcsQ0FBQ1osTUFERTtVQUVuQkQsS0FBSyxFQUFFYSxXQUFXLENBQUNiLEtBQVosR0FBb0JjLE1BRlI7VUFHbkJiLE1BQU0sRUFBRVcsVUFBVSxDQUFDWCxNQUhBO1VBSW5CQyxJQUFJLEVBQUVVLFVBQVUsQ0FBQ1o7UUFKRSxDQUF2Qjs7UUFPQSxJQUNJTCxRQUFRLENBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFPbUIscUJBQVAsQ0FBUixJQUNBVCxrQkFBa0IsQ0FBQ1gsQ0FBRCxFQUFJQyxDQUFKLEVBQU95QixhQUFQLENBRGxCLElBRUEzQixRQUFRLENBQUNDLENBQUQsRUFBSUMsQ0FBSixFQUFPcUIsZUFBUCxDQUZSLElBR0FkLGlCQUFpQixDQUFDUixDQUFELEVBQUlDLENBQUosRUFBTzBCLGNBQVAsQ0FKckIsRUFLRTtVQUNFLE9BQU8sSUFBUDtRQUNIOztRQUVEO01BQ0g7O0lBRUQsS0FBS2QsU0FBUyxDQUFDZSxNQUFmO01BQXVCO1FBQ25CLE1BQU1SLHFCQUFxQixHQUFHO1VBQzFCakIsR0FBRyxFQUFFYyxXQUFXLENBQUNkLEdBRFM7VUFFMUJDLEtBQUssRUFBRWEsV0FBVyxDQUFDYixLQUFaLEdBQW9CYyxNQUZEO1VBRzFCYixNQUFNLEVBQUVZLFdBQVcsQ0FBQ1osTUFBWixHQUFxQmEsTUFISDtVQUkxQlosSUFBSSxFQUFFVyxXQUFXLENBQUNYLElBQVosR0FBbUJZO1FBSkMsQ0FBOUI7UUFNQSxNQUFNUSxhQUFhLEdBQUc7VUFDbEJ2QixHQUFHLEVBQUVhLFVBQVUsQ0FBQ2IsR0FERTtVQUVsQkMsS0FBSyxFQUFFWSxVQUFVLENBQUNWLElBRkE7VUFHbEJELE1BQU0sRUFBRVksV0FBVyxDQUFDZCxHQUhGO1VBSWxCRyxJQUFJLEVBQUVXLFdBQVcsQ0FBQ1gsSUFBWixHQUFtQlk7UUFKUCxDQUF0QjtRQU1BLE1BQU1JLGVBQWUsR0FBRztVQUNwQm5CLEdBQUcsRUFBRWEsVUFBVSxDQUFDWCxNQURJO1VBRXBCRCxLQUFLLEVBQUVZLFVBQVUsQ0FBQ1osS0FGRTtVQUdwQkMsTUFBTSxFQUFFWSxXQUFXLENBQUNkLEdBSEE7VUFJcEJHLElBQUksRUFBRVUsVUFBVSxDQUFDVjtRQUpHLENBQXhCO1FBTUEsTUFBTXFCLGNBQWMsR0FBRztVQUNuQnhCLEdBQUcsRUFBRWEsVUFBVSxDQUFDYixHQURHO1VBRW5CQyxLQUFLLEVBQUVhLFdBQVcsQ0FBQ2IsS0FBWixHQUFvQmMsTUFGUjtVQUduQmIsTUFBTSxFQUFFWSxXQUFXLENBQUNkLEdBSEQ7VUFJbkJHLElBQUksRUFBRVUsVUFBVSxDQUFDWjtRQUpFLENBQXZCOztRQU9BLElBQ0lMLFFBQVEsQ0FBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQU9tQixxQkFBUCxDQUFSLElBQ0FWLGtCQUFrQixDQUFDVixDQUFELEVBQUlDLENBQUosRUFBT3lCLGFBQVAsQ0FEbEIsSUFFQTNCLFFBQVEsQ0FBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQU9xQixlQUFQLENBRlIsSUFHQVYsaUJBQWlCLENBQUNaLENBQUQsRUFBSUMsQ0FBSixFQUFPMEIsY0FBUCxDQUpyQixFQUtFO1VBQ0UsT0FBTyxJQUFQO1FBQ0g7O1FBRUQ7TUFDSDtFQXZKTDs7RUEwSkEsT0FBTyxLQUFQO0FBQ0g7O0FBbUJEO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUUsa0JBQU4sU0FBaUNDLGNBQUEsQ0FBTUMsU0FBdkMsQ0FBaUU7RUFPNUVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRQyxPQUFSLEVBQWlCO0lBQ3hCLE1BQU1ELEtBQU4sRUFBYUMsT0FBYjtJQUR3QjtJQUFBLDBEQXVCRUMsT0FBRCxJQUFnQztNQUN6RDtNQUNBLElBQUksQ0FBQ0EsT0FBTCxFQUFjO01BRWQsS0FBS0MsUUFBTCxDQUFjO1FBQ1ZuQixXQUFXLEVBQUVrQixPQUFPLENBQUNFLHFCQUFSO01BREgsQ0FBZDtJQUdILENBOUIyQjtJQUFBLHFEQWdDSEYsT0FBRCxJQUEwQjtNQUM5QyxLQUFLRyxNQUFMLEdBQWNILE9BQWQ7SUFDSCxDQWxDMkI7SUFBQSxtREFvRUxJLEVBQUQsSUFBb0I7TUFDdEMsTUFBTTtRQUFFQyxPQUFPLEVBQUV4QyxDQUFYO1FBQWN5QyxPQUFPLEVBQUV4QztNQUF2QixJQUE2QnNDLEVBQW5DO01BQ0EsTUFBTTtRQUFFdEI7TUFBRixJQUFrQixLQUFLeUIsS0FBN0I7TUFDQSxNQUFNMUIsVUFBVSxHQUFHLEtBQUtzQixNQUFMLENBQVlELHFCQUFaLEVBQW5CO01BRUEsSUFBSXRCLFNBQUo7O01BQ0EsSUFBSSxLQUFLNEIsV0FBVCxFQUFzQjtRQUNsQjVCLFNBQVMsR0FBRyxLQUFLNkIsY0FBTCxLQUF3Qi9CLFNBQVMsQ0FBQ00sSUFBbEMsR0FBeUNOLFNBQVMsQ0FBQ1csS0FBL0Q7TUFDSCxDQUZELE1BRU87UUFDSFQsU0FBUyxHQUFHLEtBQUs4QixXQUFMLEtBQXFCaEMsU0FBUyxDQUFDWSxHQUEvQixHQUFxQ1osU0FBUyxDQUFDZSxNQUEzRDtNQUNIOztNQUVELElBQUksQ0FBQ2QsaUJBQWlCLENBQUNkLENBQUQsRUFBSUMsQ0FBSixFQUFPYyxTQUFQLEVBQWtCQyxVQUFsQixFQUE4QkMsV0FBOUIsQ0FBdEIsRUFBa0U7UUFDOUQsS0FBSzZCLFdBQUw7TUFDSDtJQUNKLENBbkYyQjtJQUFBLHlEQXFGQSxNQUFZO01BQ3BDLEtBQUtDLFdBQUw7SUFDSCxDQXZGMkI7SUFHeEIsS0FBS0wsS0FBTCxHQUFhO01BQ1R6QixXQUFXLEVBQUUsSUFESjtNQUVUK0IsT0FBTyxFQUFFO0lBRkEsQ0FBYjtFQUlIOztFQUVEQyxrQkFBa0IsR0FBRztJQUNqQjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxLQUFLQyxhQUFMO0VBQ0g7O0VBRURDLG9CQUFvQixHQUFHO0lBQ25CMUQsUUFBUSxDQUFDMkQsbUJBQVQsQ0FBNkIsV0FBN0IsRUFBMEMsS0FBS0MsV0FBL0M7RUFDSDs7RUFlT1QsY0FBYyxHQUFZO0lBQzlCLE1BQU07TUFBRTNCO0lBQUYsSUFBa0IsS0FBS3lCLEtBQTdCO0lBQ0EsTUFBTTFCLFVBQVUsR0FBRyxLQUFLc0IsTUFBTCxDQUFZRCxxQkFBWixFQUFuQjs7SUFFQSxJQUFJLEtBQUtKLEtBQUwsQ0FBV2xCLFNBQVgsS0FBeUJGLFNBQVMsQ0FBQ00sSUFBdkMsRUFBNkM7TUFDekMsTUFBTW1DLFVBQVUsR0FBR3RDLFVBQVUsQ0FBQ1YsSUFBWCxHQUFrQmlELE1BQU0sQ0FBQ0MsT0FBNUM7TUFDQSxPQUFPLENBQUN2QyxXQUFELElBQWlCcUMsVUFBVSxHQUFHckMsV0FBVyxDQUFDd0MsS0FBekIsR0FBaUNuRSxnQ0FBekQ7SUFDSCxDQUhELE1BR087TUFDSCxNQUFNb0UsV0FBVyxHQUFHMUMsVUFBVSxDQUFDWixLQUFYLEdBQW1CbUQsTUFBTSxDQUFDQyxPQUE5QztNQUNBLE1BQU1HLFlBQVksR0FBR0MsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkMsV0FBakIsR0FBK0JKLFdBQXBEO01BQ0EsT0FBT3pDLFdBQVcsSUFBSzBDLFlBQVksR0FBRzFDLFdBQVcsQ0FBQ3dDLEtBQTNCLEdBQW1DbkUsZ0NBQTFEO0lBQ0g7RUFDSjs7RUFFT3VELFdBQVcsR0FBWTtJQUMzQixNQUFNO01BQUU1QjtJQUFGLElBQWtCLEtBQUt5QixLQUE3QjtJQUNBLE1BQU0xQixVQUFVLEdBQUcsS0FBS3NCLE1BQUwsQ0FBWUQscUJBQVosRUFBbkI7O0lBRUEsSUFBSSxLQUFLSixLQUFMLENBQVdsQixTQUFYLEtBQXlCRixTQUFTLENBQUNZLEdBQXZDLEVBQTRDO01BQ3hDLE1BQU1zQyxTQUFTLEdBQUcvQyxVQUFVLENBQUNiLEdBQVgsR0FBaUJvRCxNQUFNLENBQUNTLE9BQTFDO01BQ0EsT0FBTyxDQUFDL0MsV0FBRCxJQUFpQjhDLFNBQVMsR0FBRzlDLFdBQVcsQ0FBQ2dELE1BQXhCLEdBQWlDM0UsZ0NBQXpEO0lBQ0gsQ0FIRCxNQUdPO01BQ0gsTUFBTTRFLFlBQVksR0FBR2xELFVBQVUsQ0FBQ1gsTUFBWCxHQUFvQmtELE1BQU0sQ0FBQ1MsT0FBaEQ7TUFDQSxNQUFNRyxVQUFVLEdBQUdQLGdCQUFBLENBQVFDLFFBQVIsQ0FBaUJPLFlBQWpCLEdBQWdDRixZQUFuRDtNQUNBLE9BQU9qRCxXQUFXLElBQUtrRCxVQUFVLEdBQUdsRCxXQUFXLENBQUNnRCxNQUF6QixHQUFrQzNFLGdDQUF6RDtJQUNIO0VBQ0o7O0VBRXNCLElBQVhxRCxXQUFXLEdBQVk7SUFDL0IsT0FBTyxLQUFLVixLQUFMLENBQVdsQixTQUFYLEtBQXlCRixTQUFTLENBQUNNLElBQW5DLElBQTJDLEtBQUtjLEtBQUwsQ0FBV2xCLFNBQVgsS0FBeUJGLFNBQVMsQ0FBQ1csS0FBckY7RUFDSDs7RUF1Qk91QixXQUFXLEdBQVM7SUFDeEI7SUFDQSxJQUFJLENBQUMsS0FBS1QsTUFBVixFQUFrQjtJQUVsQixLQUFLRixRQUFMLENBQWM7TUFDVlksT0FBTyxFQUFFO0lBREMsQ0FBZDtJQUdBLEtBQUtmLEtBQUwsQ0FBV29DLGtCQUFYLEdBQWdDLElBQWhDO0lBQ0E1RSxRQUFRLENBQUM2RSxnQkFBVCxDQUEwQixXQUExQixFQUF1QyxLQUFLakIsV0FBNUM7RUFDSDs7RUFFTVAsV0FBVyxHQUFHO0lBQ2pCLEtBQUtWLFFBQUwsQ0FBYztNQUNWWSxPQUFPLEVBQUU7SUFEQyxDQUFkO0lBR0EsS0FBS2YsS0FBTCxDQUFXb0Msa0JBQVgsR0FBZ0MsS0FBaEM7SUFDQTVFLFFBQVEsQ0FBQzJELG1CQUFULENBQTZCLFdBQTdCLEVBQTBDLEtBQUtDLFdBQS9DO0VBQ0g7O0VBRU9ILGFBQWEsR0FBRztJQUNwQixNQUFNO01BQUVqQyxXQUFGO01BQWUrQjtJQUFmLElBQTJCLEtBQUtOLEtBQXRDOztJQUNBLElBQUksQ0FBQ00sT0FBTCxFQUFjO01BQ1Z1QixpQkFBQSxDQUFTQyxzQkFBVCxDQUFnQ2pGLG9CQUFvQixFQUFwRDs7TUFDQSxPQUFPLElBQVA7SUFDSDs7SUFFRCxNQUFNeUIsVUFBVSxHQUFHLEtBQUtzQixNQUFMLENBQVlELHFCQUFaLEVBQW5CLENBUG9CLENBU3BCOztJQUNBLE1BQU1pQixVQUFVLEdBQUd0QyxVQUFVLENBQUNWLElBQVgsR0FBa0JpRCxNQUFNLENBQUNDLE9BQTVDO0lBQ0EsTUFBTUUsV0FBVyxHQUFHMUMsVUFBVSxDQUFDWixLQUFYLEdBQW1CbUQsTUFBTSxDQUFDQyxPQUE5QztJQUNBLE1BQU1VLFlBQVksR0FBR2xELFVBQVUsQ0FBQ1gsTUFBWCxHQUFvQmtELE1BQU0sQ0FBQ1MsT0FBaEQ7SUFDQSxNQUFNRCxTQUFTLEdBQUcvQyxVQUFVLENBQUNiLEdBQVgsR0FBaUJvRCxNQUFNLENBQUNTLE9BQTFDLENBYm9CLENBZXBCO0lBQ0E7SUFDQTs7SUFDQSxNQUFNUyxRQUF3QixHQUFHLEVBQWpDO0lBQ0EsSUFBSUMsV0FBd0IsR0FBRyxJQUEvQjs7SUFDQSxJQUFJLEtBQUsvQixXQUFULEVBQXNCO01BQ2xCLElBQUksS0FBS0MsY0FBTCxFQUFKLEVBQTJCO1FBQ3ZCNkIsUUFBUSxDQUFDbkUsSUFBVCxHQUFnQmdELFVBQWhCO1FBQ0FvQixXQUFXLEdBQUdDLHdCQUFBLENBQVluRCxLQUExQjtNQUNILENBSEQsTUFHTztRQUNIaUQsUUFBUSxDQUFDbkUsSUFBVCxHQUFnQm9ELFdBQWhCO1FBQ0FnQixXQUFXLEdBQUdDLHdCQUFBLENBQVl4RCxJQUExQjtNQUNIOztNQUVEc0QsUUFBUSxDQUFDdEUsR0FBVCxHQUFlNEQsU0FBZjtJQUNILENBVkQsTUFVTztNQUNILElBQUksS0FBS2xCLFdBQUwsRUFBSixFQUF3QjtRQUNwQjRCLFFBQVEsQ0FBQ3BFLE1BQVQsR0FBa0J1RCxnQkFBQSxDQUFRQyxRQUFSLENBQWlCTyxZQUFqQixHQUFnQ0wsU0FBbEQ7UUFDQVcsV0FBVyxHQUFHQyx3QkFBQSxDQUFZL0MsTUFBMUI7TUFDSCxDQUhELE1BR087UUFDSDZDLFFBQVEsQ0FBQ3RFLEdBQVQsR0FBZStELFlBQWY7UUFDQVEsV0FBVyxHQUFHQyx3QkFBQSxDQUFZbEQsR0FBMUI7TUFDSCxDQVBFLENBU0g7OztNQUNBZ0QsUUFBUSxDQUFDbkUsSUFBVCxHQUFnQmdELFVBQVUsR0FBR3RDLFVBQVUsQ0FBQ3lDLEtBQVgsR0FBbUIsQ0FBaEQ7SUFDSDs7SUFFRCxNQUFNbUIsT0FBTyxnQkFBRztNQUFLLFNBQVMsRUFBRSxtQ0FBbUNGO0lBQW5ELEVBQWhCOztJQUVBLE1BQU1HLFdBQVcsR0FBRyxJQUFBQyxtQkFBQSxFQUFXO01BQzNCLHlCQUF5QixJQURFO01BRTNCLHlDQUF5Q0osV0FBVyxLQUFLQyx3QkFBQSxDQUFZbEQsR0FGMUM7TUFHM0IsMENBQTBDaUQsV0FBVyxLQUFLQyx3QkFBQSxDQUFZeEQsSUFIM0M7TUFJM0IsMkNBQTJDdUQsV0FBVyxLQUFLQyx3QkFBQSxDQUFZbkQsS0FKNUM7TUFLM0IsNENBQTRDa0QsV0FBVyxLQUFLQyx3QkFBQSxDQUFZL0M7SUFMN0MsQ0FBWCxDQUFwQjtJQVFBLE1BQU1tRCxTQUF3QixHQUFHLEVBQWpDOztJQUNBLElBQUk5RCxXQUFXLElBQUksQ0FBQyxLQUFLMEIsV0FBekIsRUFBc0M7TUFDbENvQyxTQUFTLENBQUN6RSxJQUFWLEdBQWtCLElBQUdXLFdBQVcsQ0FBQ3dDLEtBQVosR0FBb0IsQ0FBRSxJQUEzQztJQUNIOztJQUVELE1BQU11QixPQUFPLGdCQUFHO01BQUssU0FBUyxFQUFDLCtCQUFmO01BQStDLEtBQUssb0JBQU9QLFFBQVA7SUFBcEQsZ0JBQ1o7TUFBSyxTQUFTLEVBQUVJLFdBQWhCO01BQTZCLEtBQUssRUFBRUUsU0FBcEM7TUFBK0MsR0FBRyxFQUFFLEtBQUtFO0lBQXpELEdBQ01MLE9BRE4sRUFFTSxLQUFLM0MsS0FBTCxDQUFXaUQsT0FGakIsQ0FEWSxDQUFoQjs7SUFPQVgsaUJBQUEsQ0FBU1ksTUFBVCxDQUFnQkgsT0FBaEIsRUFBeUJ6RixvQkFBb0IsRUFBN0M7RUFDSDs7RUFFRDRGLE1BQU0sR0FBRztJQUNMLE9BQU8sS0FBS2xELEtBQUwsQ0FBV21ELFFBQVgsQ0FBb0I7TUFDdkJDLEdBQUcsRUFBRSxLQUFLQyxhQURhO01BRXZCQyxXQUFXLEVBQUUsS0FBS0M7SUFGSyxDQUFwQixDQUFQO0VBSUg7O0FBNUwyRTs7OzhCQUEzRDNELGtCLGtCQUdZO0VBQ3pCNEQsSUFBSSxFQUFFNUUsU0FBUyxDQUFDWTtBQURTLEMifQ==