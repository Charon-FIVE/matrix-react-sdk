"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChevronFace = void 0;
Object.defineProperty(exports, "ContextMenuButton", {
  enumerable: true,
  get: function () {
    return _ContextMenuButton.ContextMenuButton;
  }
});
Object.defineProperty(exports, "ContextMenuTooltipButton", {
  enumerable: true,
  get: function () {
    return _ContextMenuTooltipButton.ContextMenuTooltipButton;
  }
});
Object.defineProperty(exports, "MenuItem", {
  enumerable: true,
  get: function () {
    return _MenuItem.MenuItem;
  }
});
Object.defineProperty(exports, "MenuItemCheckbox", {
  enumerable: true,
  get: function () {
    return _MenuItemCheckbox.MenuItemCheckbox;
  }
});
Object.defineProperty(exports, "MenuItemRadio", {
  enumerable: true,
  get: function () {
    return _MenuItemRadio.MenuItemRadio;
  }
});
Object.defineProperty(exports, "StyledMenuItemCheckbox", {
  enumerable: true,
  get: function () {
    return _StyledMenuItemCheckbox.StyledMenuItemCheckbox;
  }
});
Object.defineProperty(exports, "StyledMenuItemRadio", {
  enumerable: true,
  get: function () {
    return _StyledMenuItemRadio.StyledMenuItemRadio;
  }
});
exports.alwaysAboveRightOf = exports.alwaysAboveLeftOf = exports.aboveRightOf = exports.aboveLeftOf = void 0;
exports.createMenu = createMenu;
exports.useContextMenu = exports.toRightOf = exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _classnames = _interopRequireDefault(require("classnames"));

var _reactFocusLock = _interopRequireDefault(require("react-focus-lock"));

var _UIStore = _interopRequireDefault(require("../../stores/UIStore"));

var _RovingTabIndex = require("../../accessibility/RovingTabIndex");

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _ContextMenuButton = require("../../accessibility/context_menu/ContextMenuButton");

var _ContextMenuTooltipButton = require("../../accessibility/context_menu/ContextMenuTooltipButton");

var _MenuItem = require("../../accessibility/context_menu/MenuItem");

var _MenuItemCheckbox = require("../../accessibility/context_menu/MenuItemCheckbox");

var _MenuItemRadio = require("../../accessibility/context_menu/MenuItemRadio");

var _StyledMenuItemCheckbox = require("../../accessibility/context_menu/StyledMenuItemCheckbox");

var _StyledMenuItemRadio = require("../../accessibility/context_menu/StyledMenuItemRadio");

const _excluded = ["top", "bottom", "left", "right", "bottomAligned", "rightAligned", "menuClassName", "menuHeight", "menuWidth", "menuPaddingLeft", "menuPaddingRight", "menuPaddingBottom", "menuPaddingTop", "zIndex", "children", "focusLock", "managed", "wrapperClassName", "chevronFace", "chevronOffset"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// Shamelessly ripped off Modal.js.  There's probably a better way
// of doing reusable widgets like dialog boxes & menus where we go and
// pass in a custom control as the actual body.
const WINDOW_PADDING = 10;
const ContextualMenuContainerId = "mx_ContextualMenu_Container";

function getOrCreateContainer() {
  let container = document.getElementById(ContextualMenuContainerId);

  if (!container) {
    container = document.createElement("div");
    container.id = ContextualMenuContainerId;
    document.body.appendChild(container);
  }

  return container;
}

let ChevronFace;
exports.ChevronFace = ChevronFace;

(function (ChevronFace) {
  ChevronFace["Top"] = "top";
  ChevronFace["Bottom"] = "bottom";
  ChevronFace["Left"] = "left";
  ChevronFace["Right"] = "right";
  ChevronFace["None"] = "none";
})(ChevronFace || (exports.ChevronFace = ChevronFace = {}));

// Generic ContextMenu Portal wrapper
// all options inside the menu should be of role=menuitem/menuitemcheckbox/menuitemradiobutton and have tabIndex={-1}
// this will allow the ContextMenu to manage its own focus using arrow keys as per the ARIA guidelines.
class ContextMenu extends _react.default.PureComponent {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "initialFocus", void 0);
    (0, _defineProperty2.default)(this, "collectContextMenuRect", element => {
      // We don't need to clean up when unmounting, so ignore
      if (!element) return;
      const first = element.querySelector('[role^="menuitem"]') || element.querySelector('[tab-index]');

      if (first) {
        first.focus();
      }

      this.setState({
        contextMenuElem: element
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenu", e => {
      if (this.props.onFinished) {
        this.props.onFinished();
        e.preventDefault();
        e.stopPropagation();
        const x = e.clientX;
        const y = e.clientY; // XXX: This isn't pretty but the only way to allow opening a different context menu on right click whilst
        // a context menu and its click-guard are up without completely rewriting how the context menus work.

        setImmediate(() => {
          const clickEvent = new MouseEvent("contextmenu", {
            clientX: x,
            clientY: y,
            screenX: 0,
            screenY: 0,
            button: 0,
            // Left
            relatedTarget: null
          });
          document.elementFromPoint(x, y).dispatchEvent(clickEvent);
        });
      }
    });
    (0, _defineProperty2.default)(this, "onContextMenuPreventBubbling", e => {
      // stop propagation so that any context menu handlers don't leak out of this context menu
      // but do not inhibit the default browser menu
      e.stopPropagation();
    });
    (0, _defineProperty2.default)(this, "onFinished", ev => {
      ev.stopPropagation();
      ev.preventDefault();
      if (this.props.onFinished) this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onClick", ev => {
      // Don't allow clicks to escape the context menu wrapper
      ev.stopPropagation();
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      ev.stopPropagation(); // prevent keyboard propagating out of the context menu, we're focus-locked

      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev); // If someone is managing their own focus, we will only exit for them with Escape.
      // They are probably using props.focusLock along with this option as well.

      if (!this.props.managed) {
        if (action === _KeyboardShortcuts.KeyBindingAction.Escape) {
          this.props.onFinished();
        }

        return;
      } // When an <input> is focused, only handle the Escape key


      if ((0, _RovingTabIndex.checkInputableElement)(ev.target) && action !== _KeyboardShortcuts.KeyBindingAction.Escape) {
        return;
      }

      if ([_KeyboardShortcuts.KeyBindingAction.Escape, // You can only navigate the ContextMenu by arrow keys and Home/End (see RovingTabIndex).
      // Tabbing to the next section of the page, will close the ContextMenu.
      _KeyboardShortcuts.KeyBindingAction.Tab, // When someone moves left or right along a <Toolbar /> (like the
      // MessageActionBar), we should close any ContextMenu that is open.
      _KeyboardShortcuts.KeyBindingAction.ArrowLeft, _KeyboardShortcuts.KeyBindingAction.ArrowRight].includes(action)) {
        this.props.onFinished();
      }
    });
    this.state = {
      contextMenuElem: null
    }; // persist what had focus when we got initialized so we can return it after

    this.initialFocus = document.activeElement;
  }

  componentWillUnmount() {
    // return focus to the thing which had it before us
    this.initialFocus.focus();
  }

  renderMenu() {
    let hasBackground = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.hasBackground;
    const position = {};
    const _this$props = this.props,
          {
      top,
      bottom,
      left,
      right,
      bottomAligned,
      rightAligned,
      menuClassName,
      menuHeight,
      menuWidth,
      menuPaddingLeft,
      menuPaddingRight,
      menuPaddingBottom,
      menuPaddingTop,
      zIndex,
      children,
      focusLock,
      managed,
      wrapperClassName,
      chevronFace: propsChevronFace,
      chevronOffset: propsChevronOffset
    } = _this$props,
          props = (0, _objectWithoutProperties2.default)(_this$props, _excluded);

    if (top) {
      position.top = top;
    } else {
      position.bottom = bottom;
    }

    let chevronFace;

    if (left) {
      position.left = left;
      chevronFace = ChevronFace.Left;
    } else {
      position.right = right;
      chevronFace = ChevronFace.Right;
    }

    const contextMenuRect = this.state.contextMenuElem ? this.state.contextMenuElem.getBoundingClientRect() : null;
    const chevronOffset = {};

    if (propsChevronFace) {
      chevronFace = propsChevronFace;
    }

    const hasChevron = chevronFace && chevronFace !== ChevronFace.None;

    if (chevronFace === ChevronFace.Top || chevronFace === ChevronFace.Bottom) {
      chevronOffset.left = propsChevronOffset;
    } else {
      chevronOffset.top = propsChevronOffset;
    } // If we know the dimensions of the context menu, adjust its position to
    // keep it within the bounds of the (padded) window


    const {
      windowWidth,
      windowHeight
    } = _UIStore.default.instance;

    if (contextMenuRect) {
      if (position.top !== undefined) {
        let maxTop = windowHeight - WINDOW_PADDING;

        if (!bottomAligned) {
          maxTop -= contextMenuRect.height;
        }

        position.top = Math.min(position.top, maxTop); // Adjust the chevron if necessary

        if (chevronOffset.top !== undefined) {
          chevronOffset.top = propsChevronOffset + top - position.top;
        }
      } else if (position.bottom !== undefined) {
        position.bottom = Math.min(position.bottom, windowHeight - contextMenuRect.height - WINDOW_PADDING);

        if (chevronOffset.top !== undefined) {
          chevronOffset.top = propsChevronOffset + position.bottom - bottom;
        }
      }

      if (position.left !== undefined) {
        let maxLeft = windowWidth - WINDOW_PADDING;

        if (!rightAligned) {
          maxLeft -= contextMenuRect.width;
        }

        position.left = Math.min(position.left, maxLeft);

        if (chevronOffset.left !== undefined) {
          chevronOffset.left = propsChevronOffset + left - position.left;
        }
      } else if (position.right !== undefined) {
        position.right = Math.min(position.right, windowWidth - contextMenuRect.width - WINDOW_PADDING);

        if (chevronOffset.left !== undefined) {
          chevronOffset.left = propsChevronOffset + position.right - right;
        }
      }
    }

    let chevron;

    if (hasChevron) {
      chevron = /*#__PURE__*/_react.default.createElement("div", {
        style: chevronOffset,
        className: "mx_ContextualMenu_chevron_" + chevronFace
      });
    }

    const menuClasses = (0, _classnames.default)({
      'mx_ContextualMenu': true,

      /**
       * In some cases we may get the number of 0, which still means that we're supposed to properly
       * add the specific position class, but as it was falsy things didn't work as intended.
       * In addition, defensively check for counter cases where we may get more than one value,
       * even if we shouldn't.
       */
      'mx_ContextualMenu_left': !hasChevron && position.left !== undefined && !position.right,
      'mx_ContextualMenu_right': !hasChevron && position.right !== undefined && !position.left,
      'mx_ContextualMenu_top': !hasChevron && position.top !== undefined && !position.bottom,
      'mx_ContextualMenu_bottom': !hasChevron && position.bottom !== undefined && !position.top,
      'mx_ContextualMenu_withChevron_left': chevronFace === ChevronFace.Left,
      'mx_ContextualMenu_withChevron_right': chevronFace === ChevronFace.Right,
      'mx_ContextualMenu_withChevron_top': chevronFace === ChevronFace.Top,
      'mx_ContextualMenu_withChevron_bottom': chevronFace === ChevronFace.Bottom,
      'mx_ContextualMenu_rightAligned': rightAligned === true,
      'mx_ContextualMenu_bottomAligned': bottomAligned === true
    }, menuClassName);
    const menuStyle = {};

    if (menuWidth) {
      menuStyle.width = menuWidth;
    }

    if (menuHeight) {
      menuStyle.height = menuHeight;
    }

    if (!isNaN(Number(menuPaddingTop))) {
      menuStyle["paddingTop"] = menuPaddingTop;
    }

    if (!isNaN(Number(menuPaddingLeft))) {
      menuStyle["paddingLeft"] = menuPaddingLeft;
    }

    if (!isNaN(Number(menuPaddingBottom))) {
      menuStyle["paddingBottom"] = menuPaddingBottom;
    }

    if (!isNaN(Number(menuPaddingRight))) {
      menuStyle["paddingRight"] = menuPaddingRight;
    }

    const wrapperStyle = {};

    if (!isNaN(Number(zIndex))) {
      menuStyle["zIndex"] = zIndex + 1;
      wrapperStyle["zIndex"] = zIndex;
    }

    let background;

    if (hasBackground) {
      background = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ContextualMenu_background",
        style: wrapperStyle,
        onClick: this.onFinished,
        onContextMenu: this.onContextMenu
      });
    }

    let body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, chevron, children);

    if (focusLock) {
      body = /*#__PURE__*/_react.default.createElement(_reactFocusLock.default, null, body);
    }

    return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexProvider, {
      handleHomeEnd: true,
      handleUpDown: true,
      onKeyDown: this.onKeyDown
    }, _ref => {
      let {
        onKeyDownHandler
      } = _ref;
      return /*#__PURE__*/_react.default.createElement("div", {
        className: (0, _classnames.default)("mx_ContextualMenu_wrapper", wrapperClassName),
        style: _objectSpread(_objectSpread({}, position), wrapperStyle),
        onClick: this.onClick,
        onKeyDown: onKeyDownHandler,
        onContextMenu: this.onContextMenuPreventBubbling
      }, background, /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
        className: menuClasses,
        style: menuStyle,
        ref: this.collectContextMenuRect,
        role: managed ? "menu" : undefined
      }, props), body));
    });
  }

  render() {
    if (this.props.mountAsChild) {
      // Render as a child of the current parent
      return this.renderMenu();
    } else {
      // Render as a child of a container at the root of the DOM
      return /*#__PURE__*/_reactDom.default.createPortal(this.renderMenu(), getOrCreateContainer());
    }
  }

}

exports.default = ContextMenu;
(0, _defineProperty2.default)(ContextMenu, "defaultProps", {
  hasBackground: true,
  managed: true
});

// Placement method for <ContextMenu /> to position context menu to right of elementRect with chevronOffset
const toRightOf = function (elementRect) {
  let chevronOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 12;
  const left = elementRect.right + window.scrollX + 3;
  let top = elementRect.top + elementRect.height / 2 + window.scrollY;
  top -= chevronOffset + 8; // where 8 is half the height of the chevron

  return {
    left,
    top,
    chevronOffset
  };
};

exports.toRightOf = toRightOf;

// Placement method for <ContextMenu /> to position context menu right-aligned and flowing to the left of elementRect,
// and either above or below: wherever there is more space (maybe this should be aboveOrBelowLeftOf?)
const aboveLeftOf = function (elementRect) {
  let chevronFace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ChevronFace.None;
  let vPadding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  const menuOptions = {
    chevronFace
  };
  const buttonRight = elementRect.right + window.scrollX;
  const buttonBottom = elementRect.bottom + window.scrollY;
  const buttonTop = elementRect.top + window.scrollY; // Align the right edge of the menu to the right edge of the button

  menuOptions.right = _UIStore.default.instance.windowWidth - buttonRight; // Align the menu vertically on whichever side of the button has more space available.

  if (buttonBottom < _UIStore.default.instance.windowHeight / 2) {
    menuOptions.top = buttonBottom + vPadding;
  } else {
    menuOptions.bottom = _UIStore.default.instance.windowHeight - buttonTop + vPadding;
  }

  return menuOptions;
}; // Placement method for <ContextMenu /> to position context menu right-aligned and flowing to the right of elementRect,
// and either above or below: wherever there is more space (maybe this should be aboveOrBelowRightOf?)


exports.aboveLeftOf = aboveLeftOf;

const aboveRightOf = function (elementRect) {
  let chevronFace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ChevronFace.None;
  let vPadding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  const menuOptions = {
    chevronFace
  };
  const buttonLeft = elementRect.left + window.scrollX;
  const buttonBottom = elementRect.bottom + window.scrollY;
  const buttonTop = elementRect.top + window.scrollY; // Align the left edge of the menu to the left edge of the button

  menuOptions.left = buttonLeft; // Align the menu vertically on whichever side of the button has more space available.

  if (buttonBottom < _UIStore.default.instance.windowHeight / 2) {
    menuOptions.top = buttonBottom + vPadding;
  } else {
    menuOptions.bottom = _UIStore.default.instance.windowHeight - buttonTop + vPadding;
  }

  return menuOptions;
}; // Placement method for <ContextMenu /> to position context menu right-aligned and flowing to the left of elementRect
// and always above elementRect


exports.aboveRightOf = aboveRightOf;

const alwaysAboveLeftOf = function (elementRect) {
  let chevronFace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ChevronFace.None;
  let vPadding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  const menuOptions = {
    chevronFace
  };
  const buttonRight = elementRect.right + window.scrollX;
  const buttonBottom = elementRect.bottom + window.scrollY;
  const buttonTop = elementRect.top + window.scrollY; // Align the right edge of the menu to the right edge of the button

  menuOptions.right = _UIStore.default.instance.windowWidth - buttonRight; // Align the menu vertically on whichever side of the button has more space available.

  if (buttonBottom < _UIStore.default.instance.windowHeight / 2) {
    menuOptions.top = buttonBottom + vPadding;
  } else {
    menuOptions.bottom = _UIStore.default.instance.windowHeight - buttonTop + vPadding;
  }

  return menuOptions;
}; // Placement method for <ContextMenu /> to position context menu right-aligned and flowing to the right of elementRect
// and always above elementRect


exports.alwaysAboveLeftOf = alwaysAboveLeftOf;

const alwaysAboveRightOf = function (elementRect) {
  let chevronFace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ChevronFace.None;
  let vPadding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  const menuOptions = {
    chevronFace
  };
  const buttonLeft = elementRect.left + window.scrollX;
  const buttonTop = elementRect.top + window.scrollY; // Align the left edge of the menu to the left edge of the button

  menuOptions.left = buttonLeft; // Align the menu vertically above the menu

  menuOptions.bottom = _UIStore.default.instance.windowHeight - buttonTop + vPadding;
  return menuOptions;
};

exports.alwaysAboveRightOf = alwaysAboveRightOf;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const useContextMenu = () => {
  const button = (0, _react.useRef)(null);
  const [isOpen, setIsOpen] = (0, _react.useState)(false);

  const open = ev => {
    ev?.preventDefault();
    ev?.stopPropagation();
    setIsOpen(true);
  };

  const close = ev => {
    ev?.preventDefault();
    ev?.stopPropagation();
    setIsOpen(false);
  };

  return [isOpen, button, open, close, setIsOpen];
}; // XXX: Deprecated, used only for dynamic Tooltips. Avoid using at all costs.


exports.useContextMenu = useContextMenu;

function createMenu(ElementClass, props) {
  const onFinished = function () {
    _reactDom.default.unmountComponentAtNode(getOrCreateContainer());

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    props?.onFinished?.apply(null, args);
  };

  const menu = /*#__PURE__*/_react.default.createElement(ContextMenu, (0, _extends2.default)({}, props, {
    mountAsChild: true,
    hasBackground: false,
    onFinished: onFinished // eslint-disable-line react/jsx-no-bind
    ,
    windowResize: onFinished // eslint-disable-line react/jsx-no-bind

  }), /*#__PURE__*/_react.default.createElement(ElementClass, (0, _extends2.default)({}, props, {
    onFinished: onFinished
  })));

  _reactDom.default.render(menu, getOrCreateContainer());

  return {
    close: onFinished
  };
} // re-export the semantic helper components for simplicity
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJXSU5ET1dfUEFERElORyIsIkNvbnRleHR1YWxNZW51Q29udGFpbmVySWQiLCJnZXRPckNyZWF0ZUNvbnRhaW5lciIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJDaGV2cm9uRmFjZSIsIkNvbnRleHRNZW51IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJlbGVtZW50IiwiZmlyc3QiLCJxdWVyeVNlbGVjdG9yIiwiZm9jdXMiLCJzZXRTdGF0ZSIsImNvbnRleHRNZW51RWxlbSIsImUiLCJvbkZpbmlzaGVkIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJ4IiwiY2xpZW50WCIsInkiLCJjbGllbnRZIiwic2V0SW1tZWRpYXRlIiwiY2xpY2tFdmVudCIsIk1vdXNlRXZlbnQiLCJzY3JlZW5YIiwic2NyZWVuWSIsImJ1dHRvbiIsInJlbGF0ZWRUYXJnZXQiLCJlbGVtZW50RnJvbVBvaW50IiwiZGlzcGF0Y2hFdmVudCIsImV2IiwiYWN0aW9uIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbiIsIm1hbmFnZWQiLCJLZXlCaW5kaW5nQWN0aW9uIiwiRXNjYXBlIiwiY2hlY2tJbnB1dGFibGVFbGVtZW50IiwidGFyZ2V0IiwiVGFiIiwiQXJyb3dMZWZ0IiwiQXJyb3dSaWdodCIsImluY2x1ZGVzIiwic3RhdGUiLCJpbml0aWFsRm9jdXMiLCJhY3RpdmVFbGVtZW50IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW5kZXJNZW51IiwiaGFzQmFja2dyb3VuZCIsInBvc2l0aW9uIiwidG9wIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwiYm90dG9tQWxpZ25lZCIsInJpZ2h0QWxpZ25lZCIsIm1lbnVDbGFzc05hbWUiLCJtZW51SGVpZ2h0IiwibWVudVdpZHRoIiwibWVudVBhZGRpbmdMZWZ0IiwibWVudVBhZGRpbmdSaWdodCIsIm1lbnVQYWRkaW5nQm90dG9tIiwibWVudVBhZGRpbmdUb3AiLCJ6SW5kZXgiLCJjaGlsZHJlbiIsImZvY3VzTG9jayIsIndyYXBwZXJDbGFzc05hbWUiLCJjaGV2cm9uRmFjZSIsInByb3BzQ2hldnJvbkZhY2UiLCJjaGV2cm9uT2Zmc2V0IiwicHJvcHNDaGV2cm9uT2Zmc2V0IiwiTGVmdCIsIlJpZ2h0IiwiY29udGV4dE1lbnVSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiaGFzQ2hldnJvbiIsIk5vbmUiLCJUb3AiLCJCb3R0b20iLCJ3aW5kb3dXaWR0aCIsIndpbmRvd0hlaWdodCIsIlVJU3RvcmUiLCJpbnN0YW5jZSIsInVuZGVmaW5lZCIsIm1heFRvcCIsImhlaWdodCIsIk1hdGgiLCJtaW4iLCJtYXhMZWZ0Iiwid2lkdGgiLCJjaGV2cm9uIiwibWVudUNsYXNzZXMiLCJjbGFzc05hbWVzIiwibWVudVN0eWxlIiwiaXNOYU4iLCJOdW1iZXIiLCJ3cmFwcGVyU3R5bGUiLCJiYWNrZ3JvdW5kIiwib25Db250ZXh0TWVudSIsIm9uS2V5RG93biIsIm9uS2V5RG93bkhhbmRsZXIiLCJvbkNsaWNrIiwib25Db250ZXh0TWVudVByZXZlbnRCdWJibGluZyIsImNvbGxlY3RDb250ZXh0TWVudVJlY3QiLCJyZW5kZXIiLCJtb3VudEFzQ2hpbGQiLCJSZWFjdERPTSIsImNyZWF0ZVBvcnRhbCIsInRvUmlnaHRPZiIsImVsZW1lbnRSZWN0Iiwid2luZG93Iiwic2Nyb2xsWCIsInNjcm9sbFkiLCJhYm92ZUxlZnRPZiIsInZQYWRkaW5nIiwibWVudU9wdGlvbnMiLCJidXR0b25SaWdodCIsImJ1dHRvbkJvdHRvbSIsImJ1dHRvblRvcCIsImFib3ZlUmlnaHRPZiIsImJ1dHRvbkxlZnQiLCJhbHdheXNBYm92ZUxlZnRPZiIsImFsd2F5c0Fib3ZlUmlnaHRPZiIsInVzZUNvbnRleHRNZW51IiwidXNlUmVmIiwiaXNPcGVuIiwic2V0SXNPcGVuIiwidXNlU3RhdGUiLCJvcGVuIiwiY2xvc2UiLCJjcmVhdGVNZW51IiwiRWxlbWVudENsYXNzIiwidW5tb3VudENvbXBvbmVudEF0Tm9kZSIsImFyZ3MiLCJhcHBseSIsIm1lbnUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDU1NQcm9wZXJ0aWVzLCBSZWZPYmplY3QsIFN5bnRoZXRpY0V2ZW50LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCBGb2N1c0xvY2sgZnJvbSBcInJlYWN0LWZvY3VzLWxvY2tcIjtcblxuaW1wb3J0IHsgV3JpdGVhYmxlIH0gZnJvbSBcIi4uLy4uL0B0eXBlcy9jb21tb25cIjtcbmltcG9ydCBVSVN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvVUlTdG9yZVwiO1xuaW1wb3J0IHsgY2hlY2tJbnB1dGFibGVFbGVtZW50LCBSb3ZpbmdUYWJJbmRleFByb3ZpZGVyIH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvUm92aW5nVGFiSW5kZXhcIjtcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuXG4vLyBTaGFtZWxlc3NseSByaXBwZWQgb2ZmIE1vZGFsLmpzLiAgVGhlcmUncyBwcm9iYWJseSBhIGJldHRlciB3YXlcbi8vIG9mIGRvaW5nIHJldXNhYmxlIHdpZGdldHMgbGlrZSBkaWFsb2cgYm94ZXMgJiBtZW51cyB3aGVyZSB3ZSBnbyBhbmRcbi8vIHBhc3MgaW4gYSBjdXN0b20gY29udHJvbCBhcyB0aGUgYWN0dWFsIGJvZHkuXG5cbmNvbnN0IFdJTkRPV19QQURESU5HID0gMTA7XG5jb25zdCBDb250ZXh0dWFsTWVudUNvbnRhaW5lcklkID0gXCJteF9Db250ZXh0dWFsTWVudV9Db250YWluZXJcIjtcblxuZnVuY3Rpb24gZ2V0T3JDcmVhdGVDb250YWluZXIoKTogSFRNTERpdkVsZW1lbnQge1xuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChDb250ZXh0dWFsTWVudUNvbnRhaW5lcklkKSBhcyBIVE1MRGl2RWxlbWVudDtcblxuICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5pZCA9IENvbnRleHR1YWxNZW51Q29udGFpbmVySWQ7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQb3NpdGlvbiB7XG4gICAgdG9wPzogbnVtYmVyO1xuICAgIGJvdHRvbT86IG51bWJlcjtcbiAgICBsZWZ0PzogbnVtYmVyO1xuICAgIHJpZ2h0PzogbnVtYmVyO1xuICAgIHJpZ2h0QWxpZ25lZD86IGJvb2xlYW47XG4gICAgYm90dG9tQWxpZ25lZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBlbnVtIENoZXZyb25GYWNlIHtcbiAgICBUb3AgPSBcInRvcFwiLFxuICAgIEJvdHRvbSA9IFwiYm90dG9tXCIsXG4gICAgTGVmdCA9IFwibGVmdFwiLFxuICAgIFJpZ2h0ID0gXCJyaWdodFwiLFxuICAgIE5vbmUgPSBcIm5vbmVcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJUG9zaXRpb24ge1xuICAgIG1lbnVXaWR0aD86IG51bWJlcjtcbiAgICBtZW51SGVpZ2h0PzogbnVtYmVyO1xuXG4gICAgY2hldnJvbk9mZnNldD86IG51bWJlcjtcbiAgICBjaGV2cm9uRmFjZT86IENoZXZyb25GYWNlO1xuXG4gICAgbWVudVBhZGRpbmdUb3A/OiBudW1iZXI7XG4gICAgbWVudVBhZGRpbmdCb3R0b20/OiBudW1iZXI7XG4gICAgbWVudVBhZGRpbmdMZWZ0PzogbnVtYmVyO1xuICAgIG1lbnVQYWRkaW5nUmlnaHQ/OiBudW1iZXI7XG5cbiAgICB6SW5kZXg/OiBudW1iZXI7XG5cbiAgICAvLyBJZiB0cnVlLCBpbnNlcnQgYW4gaW52aXNpYmxlIHNjcmVlbi1zaXplZCBlbGVtZW50IGJlaGluZCB0aGUgbWVudSB0aGF0IHdoZW4gY2xpY2tlZCB3aWxsIGNsb3NlIGl0LlxuICAgIGhhc0JhY2tncm91bmQ/OiBib29sZWFuO1xuICAgIC8vIHdoZXRoZXIgdGhpcyBjb250ZXh0IG1lbnUgc2hvdWxkIGJlIGZvY3VzIG1hbmFnZWQuIElmIGZhbHNlIGl0IG11c3QgaGFuZGxlIGl0c2VsZlxuICAgIG1hbmFnZWQ/OiBib29sZWFuO1xuICAgIHdyYXBwZXJDbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgbWVudUNsYXNzTmFtZT86IHN0cmluZztcblxuICAgIC8vIElmIHRydWUsIHRoaXMgY29udGV4dCBtZW51IHdpbGwgYmUgbW91bnRlZCBhcyBhIGNoaWxkIHRvIHRoZSBwYXJlbnQgY29udGFpbmVyLiBPdGhlcndpc2VcbiAgICAvLyBpdCB3aWxsIGJlIG1vdW50ZWQgdG8gYSBjb250YWluZXIgYXQgdGhlIHJvb3Qgb2YgdGhlIERPTS5cbiAgICBtb3VudEFzQ2hpbGQ/OiBib29sZWFuO1xuXG4gICAgLy8gSWYgc3BlY2lmaWVkLCBjb250ZW50cyB3aWxsIGJlIHdyYXBwZWQgaW4gYSBGb2N1c0xvY2ssIHRoaXMgaXMgb25seSBuZWVkZWQgaWYgdGhlIGNvbnRleHQgbWVudSBpcyBiZWluZyByZW5kZXJlZFxuICAgIC8vIHdpdGhpbiBhbiBleGlzdGluZyBGb2N1c0xvY2sgZS5nIGluc2lkZSBhIG1vZGFsLlxuICAgIGZvY3VzTG9jaz86IGJvb2xlYW47XG5cbiAgICAvLyBGdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gbWVudSBjbG9zZVxuICAgIG9uRmluaXNoZWQoKTtcbiAgICAvLyBvbiByZXNpemUgY2FsbGJhY2tcbiAgICB3aW5kb3dSZXNpemU/KCk7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvbnRleHRNZW51RWxlbTogSFRNTERpdkVsZW1lbnQ7XG59XG5cbi8vIEdlbmVyaWMgQ29udGV4dE1lbnUgUG9ydGFsIHdyYXBwZXJcbi8vIGFsbCBvcHRpb25zIGluc2lkZSB0aGUgbWVudSBzaG91bGQgYmUgb2Ygcm9sZT1tZW51aXRlbS9tZW51aXRlbWNoZWNrYm94L21lbnVpdGVtcmFkaW9idXR0b24gYW5kIGhhdmUgdGFiSW5kZXg9ey0xfVxuLy8gdGhpcyB3aWxsIGFsbG93IHRoZSBDb250ZXh0TWVudSB0byBtYW5hZ2UgaXRzIG93biBmb2N1cyB1c2luZyBhcnJvdyBrZXlzIGFzIHBlciB0aGUgQVJJQSBndWlkZWxpbmVzLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGV4dE1lbnUgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBpbml0aWFsRm9jdXM6IEhUTUxFbGVtZW50O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgaGFzQmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgICAgbWFuYWdlZDogdHJ1ZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudUVsZW06IG51bGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gcGVyc2lzdCB3aGF0IGhhZCBmb2N1cyB3aGVuIHdlIGdvdCBpbml0aWFsaXplZCBzbyB3ZSBjYW4gcmV0dXJuIGl0IGFmdGVyXG4gICAgICAgIHRoaXMuaW5pdGlhbEZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gcmV0dXJuIGZvY3VzIHRvIHRoZSB0aGluZyB3aGljaCBoYWQgaXQgYmVmb3JlIHVzXG4gICAgICAgIHRoaXMuaW5pdGlhbEZvY3VzLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb2xsZWN0Q29udGV4dE1lbnVSZWN0ID0gKGVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50KSA9PiB7XG4gICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gY2xlYW4gdXAgd2hlbiB1bm1vdW50aW5nLCBzbyBpZ25vcmVcbiAgICAgICAgaWYgKCFlbGVtZW50KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZmlyc3QgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCdbcm9sZV49XCJtZW51aXRlbVwiXScpXG4gICAgICAgICAgICB8fCBlbGVtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KCdbdGFiLWluZGV4XScpO1xuXG4gICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgZmlyc3QuZm9jdXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29udGV4dE1lbnVFbGVtOiBlbGVtZW50LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbnRleHRNZW51ID0gKGUpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25GaW5pc2hlZCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCB4ID0gZS5jbGllbnRYO1xuICAgICAgICAgICAgY29uc3QgeSA9IGUuY2xpZW50WTtcblxuICAgICAgICAgICAgLy8gWFhYOiBUaGlzIGlzbid0IHByZXR0eSBidXQgdGhlIG9ubHkgd2F5IHRvIGFsbG93IG9wZW5pbmcgYSBkaWZmZXJlbnQgY29udGV4dCBtZW51IG9uIHJpZ2h0IGNsaWNrIHdoaWxzdFxuICAgICAgICAgICAgLy8gYSBjb250ZXh0IG1lbnUgYW5kIGl0cyBjbGljay1ndWFyZCBhcmUgdXAgd2l0aG91dCBjb21wbGV0ZWx5IHJld3JpdGluZyBob3cgdGhlIGNvbnRleHQgbWVudXMgd29yay5cbiAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpY2tFdmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY29udGV4dG1lbnVcIiwge1xuICAgICAgICAgICAgICAgICAgICBjbGllbnRYOiB4LFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRZOiB5LFxuICAgICAgICAgICAgICAgICAgICBzY3JlZW5YOiAwLFxuICAgICAgICAgICAgICAgICAgICBzY3JlZW5ZOiAwLFxuICAgICAgICAgICAgICAgICAgICBidXR0b246IDAsIC8vIExlZnRcbiAgICAgICAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDogbnVsbCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpLmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnVQcmV2ZW50QnViYmxpbmcgPSAoZSkgPT4ge1xuICAgICAgICAvLyBzdG9wIHByb3BhZ2F0aW9uIHNvIHRoYXQgYW55IGNvbnRleHQgbWVudSBoYW5kbGVycyBkb24ndCBsZWFrIG91dCBvZiB0aGlzIGNvbnRleHQgbWVudVxuICAgICAgICAvLyBidXQgZG8gbm90IGluaGliaXQgdGhlIGRlZmF1bHQgYnJvd3NlciBtZW51XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfTtcblxuICAgIC8vIFByZXZlbnQgY2xpY2tzIG9uIHRoZSBiYWNrZ3JvdW5kIGZyb20gZ29pbmcgdGhyb3VnaCB0byB0aGUgY29tcG9uZW50IHdoaWNoIG9wZW5lZCB0aGUgbWVudS5cbiAgICBwcml2YXRlIG9uRmluaXNoZWQgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRmluaXNoZWQpIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgLy8gRG9uJ3QgYWxsb3cgY2xpY2tzIHRvIGVzY2FwZSB0aGUgY29udGV4dCBtZW51IHdyYXBwZXJcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfTtcblxuICAgIC8vIFdlIG5vdyBvbmx5IGhhbmRsZSBjbG9zaW5nIHRoZSBDb250ZXh0TWVudSBpbiB0aGlzIGtleURvd24gaGFuZGxlci5cbiAgICAvLyBBbGwgb2YgdGhlIGl0ZW0vb3B0aW9uIG5hdmlnYXRpb24gaXMgZGVsZWdhdGVkIHRvIFJvdmluZ1RhYkluZGV4LlxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpOyAvLyBwcmV2ZW50IGtleWJvYXJkIHByb3BhZ2F0aW5nIG91dCBvZiB0aGUgY29udGV4dCBtZW51LCB3ZSdyZSBmb2N1cy1sb2NrZWRcblxuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBY2Nlc3NpYmlsaXR5QWN0aW9uKGV2KTtcblxuICAgICAgICAvLyBJZiBzb21lb25lIGlzIG1hbmFnaW5nIHRoZWlyIG93biBmb2N1cywgd2Ugd2lsbCBvbmx5IGV4aXQgZm9yIHRoZW0gd2l0aCBFc2NhcGUuXG4gICAgICAgIC8vIFRoZXkgYXJlIHByb2JhYmx5IHVzaW5nIHByb3BzLmZvY3VzTG9jayBhbG9uZyB3aXRoIHRoaXMgb3B0aW9uIGFzIHdlbGwuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5tYW5hZ2VkKSB7XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSBLZXlCaW5kaW5nQWN0aW9uLkVzY2FwZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2hlbiBhbiA8aW5wdXQ+IGlzIGZvY3VzZWQsIG9ubHkgaGFuZGxlIHRoZSBFc2NhcGUga2V5XG4gICAgICAgIGlmIChjaGVja0lucHV0YWJsZUVsZW1lbnQoZXYudGFyZ2V0IGFzIEhUTUxFbGVtZW50KSAmJiBhY3Rpb24gIT09IEtleUJpbmRpbmdBY3Rpb24uRXNjYXBlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoW1xuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5Fc2NhcGUsXG4gICAgICAgICAgICAvLyBZb3UgY2FuIG9ubHkgbmF2aWdhdGUgdGhlIENvbnRleHRNZW51IGJ5IGFycm93IGtleXMgYW5kIEhvbWUvRW5kIChzZWUgUm92aW5nVGFiSW5kZXgpLlxuICAgICAgICAgICAgLy8gVGFiYmluZyB0byB0aGUgbmV4dCBzZWN0aW9uIG9mIHRoZSBwYWdlLCB3aWxsIGNsb3NlIHRoZSBDb250ZXh0TWVudS5cbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uVGFiLFxuICAgICAgICAgICAgLy8gV2hlbiBzb21lb25lIG1vdmVzIGxlZnQgb3IgcmlnaHQgYWxvbmcgYSA8VG9vbGJhciAvPiAobGlrZSB0aGVcbiAgICAgICAgICAgIC8vIE1lc3NhZ2VBY3Rpb25CYXIpLCB3ZSBzaG91bGQgY2xvc2UgYW55IENvbnRleHRNZW51IHRoYXQgaXMgb3Blbi5cbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uQXJyb3dMZWZ0LFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5BcnJvd1JpZ2h0LFxuICAgICAgICBdLmluY2x1ZGVzKGFjdGlvbikpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb3RlY3RlZCByZW5kZXJNZW51KGhhc0JhY2tncm91bmQgPSB0aGlzLnByb3BzLmhhc0JhY2tncm91bmQpIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb246IFBhcnRpYWw8V3JpdGVhYmxlPERPTVJlY3Q+PiA9IHt9O1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICB0b3AsXG4gICAgICAgICAgICBib3R0b20sXG4gICAgICAgICAgICBsZWZ0LFxuICAgICAgICAgICAgcmlnaHQsXG4gICAgICAgICAgICBib3R0b21BbGlnbmVkLFxuICAgICAgICAgICAgcmlnaHRBbGlnbmVkLFxuICAgICAgICAgICAgbWVudUNsYXNzTmFtZSxcbiAgICAgICAgICAgIG1lbnVIZWlnaHQsXG4gICAgICAgICAgICBtZW51V2lkdGgsXG4gICAgICAgICAgICBtZW51UGFkZGluZ0xlZnQsXG4gICAgICAgICAgICBtZW51UGFkZGluZ1JpZ2h0LFxuICAgICAgICAgICAgbWVudVBhZGRpbmdCb3R0b20sXG4gICAgICAgICAgICBtZW51UGFkZGluZ1RvcCxcbiAgICAgICAgICAgIHpJbmRleCxcbiAgICAgICAgICAgIGNoaWxkcmVuLFxuICAgICAgICAgICAgZm9jdXNMb2NrLFxuICAgICAgICAgICAgbWFuYWdlZCxcbiAgICAgICAgICAgIHdyYXBwZXJDbGFzc05hbWUsXG4gICAgICAgICAgICBjaGV2cm9uRmFjZTogcHJvcHNDaGV2cm9uRmFjZSxcbiAgICAgICAgICAgIGNoZXZyb25PZmZzZXQ6IHByb3BzQ2hldnJvbk9mZnNldCxcbiAgICAgICAgICAgIC4uLnByb3BzXG4gICAgICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIGlmICh0b3ApIHtcbiAgICAgICAgICAgIHBvc2l0aW9uLnRvcCA9IHRvcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc2l0aW9uLmJvdHRvbSA9IGJvdHRvbTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjaGV2cm9uRmFjZTogQ2hldnJvbkZhY2U7XG4gICAgICAgIGlmIChsZWZ0KSB7XG4gICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ID0gbGVmdDtcbiAgICAgICAgICAgIGNoZXZyb25GYWNlID0gQ2hldnJvbkZhY2UuTGVmdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc2l0aW9uLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgICAgICBjaGV2cm9uRmFjZSA9IENoZXZyb25GYWNlLlJpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGV4dE1lbnVSZWN0ID0gdGhpcy5zdGF0ZS5jb250ZXh0TWVudUVsZW0gPyB0aGlzLnN0YXRlLmNvbnRleHRNZW51RWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSA6IG51bGw7XG5cbiAgICAgICAgY29uc3QgY2hldnJvbk9mZnNldDogQ1NTUHJvcGVydGllcyA9IHt9O1xuICAgICAgICBpZiAocHJvcHNDaGV2cm9uRmFjZSkge1xuICAgICAgICAgICAgY2hldnJvbkZhY2UgPSBwcm9wc0NoZXZyb25GYWNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhc0NoZXZyb24gPSBjaGV2cm9uRmFjZSAmJiBjaGV2cm9uRmFjZSAhPT0gQ2hldnJvbkZhY2UuTm9uZTtcblxuICAgICAgICBpZiAoY2hldnJvbkZhY2UgPT09IENoZXZyb25GYWNlLlRvcCB8fCBjaGV2cm9uRmFjZSA9PT0gQ2hldnJvbkZhY2UuQm90dG9tKSB7XG4gICAgICAgICAgICBjaGV2cm9uT2Zmc2V0LmxlZnQgPSBwcm9wc0NoZXZyb25PZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGV2cm9uT2Zmc2V0LnRvcCA9IHByb3BzQ2hldnJvbk9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIGtub3cgdGhlIGRpbWVuc2lvbnMgb2YgdGhlIGNvbnRleHQgbWVudSwgYWRqdXN0IGl0cyBwb3NpdGlvbiB0b1xuICAgICAgICAvLyBrZWVwIGl0IHdpdGhpbiB0aGUgYm91bmRzIG9mIHRoZSAocGFkZGVkKSB3aW5kb3dcbiAgICAgICAgY29uc3QgeyB3aW5kb3dXaWR0aCwgd2luZG93SGVpZ2h0IH0gPSBVSVN0b3JlLmluc3RhbmNlO1xuICAgICAgICBpZiAoY29udGV4dE1lbnVSZWN0KSB7XG4gICAgICAgICAgICBpZiAocG9zaXRpb24udG9wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgbWF4VG9wID0gd2luZG93SGVpZ2h0IC0gV0lORE9XX1BBRERJTkc7XG4gICAgICAgICAgICAgICAgaWYgKCFib3R0b21BbGlnbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heFRvcCAtPSBjb250ZXh0TWVudVJlY3QuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwb3NpdGlvbi50b3AgPSBNYXRoLm1pbihwb3NpdGlvbi50b3AsIG1heFRvcCk7XG4gICAgICAgICAgICAgICAgLy8gQWRqdXN0IHRoZSBjaGV2cm9uIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgIGlmIChjaGV2cm9uT2Zmc2V0LnRvcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZXZyb25PZmZzZXQudG9wID0gcHJvcHNDaGV2cm9uT2Zmc2V0ICsgdG9wIC0gcG9zaXRpb24udG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24uYm90dG9tICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5ib3R0b20gPSBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uYm90dG9tLFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3dIZWlnaHQgLSBjb250ZXh0TWVudVJlY3QuaGVpZ2h0IC0gV0lORE9XX1BBRERJTkcsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAoY2hldnJvbk9mZnNldC50b3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjaGV2cm9uT2Zmc2V0LnRvcCA9IHByb3BzQ2hldnJvbk9mZnNldCArIHBvc2l0aW9uLmJvdHRvbSAtIGJvdHRvbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocG9zaXRpb24ubGVmdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1heExlZnQgPSB3aW5kb3dXaWR0aCAtIFdJTkRPV19QQURESU5HO1xuICAgICAgICAgICAgICAgIGlmICghcmlnaHRBbGlnbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heExlZnQgLT0gY29udGV4dE1lbnVSZWN0LndpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ID0gTWF0aC5taW4ocG9zaXRpb24ubGVmdCwgbWF4TGVmdCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoZXZyb25PZmZzZXQubGVmdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZXZyb25PZmZzZXQubGVmdCA9IHByb3BzQ2hldnJvbk9mZnNldCArIGxlZnQgLSBwb3NpdGlvbi5sZWZ0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24ucmlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnJpZ2h0ID0gTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnJpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3dXaWR0aCAtIGNvbnRleHRNZW51UmVjdC53aWR0aCAtIFdJTkRPV19QQURESU5HLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKGNoZXZyb25PZmZzZXQubGVmdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZXZyb25PZmZzZXQubGVmdCA9IHByb3BzQ2hldnJvbk9mZnNldCArIHBvc2l0aW9uLnJpZ2h0IC0gcmlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNoZXZyb247XG4gICAgICAgIGlmIChoYXNDaGV2cm9uKSB7XG4gICAgICAgICAgICBjaGV2cm9uID0gPGRpdiBzdHlsZT17Y2hldnJvbk9mZnNldH0gY2xhc3NOYW1lPXtcIm14X0NvbnRleHR1YWxNZW51X2NoZXZyb25fXCIgKyBjaGV2cm9uRmFjZX0gLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZW51Q2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgJ214X0NvbnRleHR1YWxNZW51JzogdHJ1ZSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW4gc29tZSBjYXNlcyB3ZSBtYXkgZ2V0IHRoZSBudW1iZXIgb2YgMCwgd2hpY2ggc3RpbGwgbWVhbnMgdGhhdCB3ZSdyZSBzdXBwb3NlZCB0byBwcm9wZXJseVxuICAgICAgICAgICAgICogYWRkIHRoZSBzcGVjaWZpYyBwb3NpdGlvbiBjbGFzcywgYnV0IGFzIGl0IHdhcyBmYWxzeSB0aGluZ3MgZGlkbid0IHdvcmsgYXMgaW50ZW5kZWQuXG4gICAgICAgICAgICAgKiBJbiBhZGRpdGlvbiwgZGVmZW5zaXZlbHkgY2hlY2sgZm9yIGNvdW50ZXIgY2FzZXMgd2hlcmUgd2UgbWF5IGdldCBtb3JlIHRoYW4gb25lIHZhbHVlLFxuICAgICAgICAgICAgICogZXZlbiBpZiB3ZSBzaG91bGRuJ3QuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV9sZWZ0JzogIWhhc0NoZXZyb24gJiYgcG9zaXRpb24ubGVmdCAhPT0gdW5kZWZpbmVkICYmICFwb3NpdGlvbi5yaWdodCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV9yaWdodCc6ICFoYXNDaGV2cm9uICYmIHBvc2l0aW9uLnJpZ2h0ICE9PSB1bmRlZmluZWQgJiYgIXBvc2l0aW9uLmxlZnQsXG4gICAgICAgICAgICAnbXhfQ29udGV4dHVhbE1lbnVfdG9wJzogIWhhc0NoZXZyb24gJiYgcG9zaXRpb24udG9wICE9PSB1bmRlZmluZWQgJiYgIXBvc2l0aW9uLmJvdHRvbSxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV9ib3R0b20nOiAhaGFzQ2hldnJvbiAmJiBwb3NpdGlvbi5ib3R0b20gIT09IHVuZGVmaW5lZCAmJiAhcG9zaXRpb24udG9wLFxuICAgICAgICAgICAgJ214X0NvbnRleHR1YWxNZW51X3dpdGhDaGV2cm9uX2xlZnQnOiBjaGV2cm9uRmFjZSA9PT0gQ2hldnJvbkZhY2UuTGVmdCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV93aXRoQ2hldnJvbl9yaWdodCc6IGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5SaWdodCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV93aXRoQ2hldnJvbl90b3AnOiBjaGV2cm9uRmFjZSA9PT0gQ2hldnJvbkZhY2UuVG9wLFxuICAgICAgICAgICAgJ214X0NvbnRleHR1YWxNZW51X3dpdGhDaGV2cm9uX2JvdHRvbSc6IGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5Cb3R0b20sXG4gICAgICAgICAgICAnbXhfQ29udGV4dHVhbE1lbnVfcmlnaHRBbGlnbmVkJzogcmlnaHRBbGlnbmVkID09PSB0cnVlLFxuICAgICAgICAgICAgJ214X0NvbnRleHR1YWxNZW51X2JvdHRvbUFsaWduZWQnOiBib3R0b21BbGlnbmVkID09PSB0cnVlLFxuICAgICAgICB9LCBtZW51Q2xhc3NOYW1lKTtcblxuICAgICAgICBjb25zdCBtZW51U3R5bGU6IENTU1Byb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgaWYgKG1lbnVXaWR0aCkge1xuICAgICAgICAgICAgbWVudVN0eWxlLndpZHRoID0gbWVudVdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lbnVIZWlnaHQpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZS5oZWlnaHQgPSBtZW51SGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc05hTihOdW1iZXIobWVudVBhZGRpbmdUb3ApKSkge1xuICAgICAgICAgICAgbWVudVN0eWxlW1wicGFkZGluZ1RvcFwiXSA9IG1lbnVQYWRkaW5nVG9wO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNOYU4oTnVtYmVyKG1lbnVQYWRkaW5nTGVmdCkpKSB7XG4gICAgICAgICAgICBtZW51U3R5bGVbXCJwYWRkaW5nTGVmdFwiXSA9IG1lbnVQYWRkaW5nTGVmdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTmFOKE51bWJlcihtZW51UGFkZGluZ0JvdHRvbSkpKSB7XG4gICAgICAgICAgICBtZW51U3R5bGVbXCJwYWRkaW5nQm90dG9tXCJdID0gbWVudVBhZGRpbmdCb3R0b207XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc05hTihOdW1iZXIobWVudVBhZGRpbmdSaWdodCkpKSB7XG4gICAgICAgICAgICBtZW51U3R5bGVbXCJwYWRkaW5nUmlnaHRcIl0gPSBtZW51UGFkZGluZ1JpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd3JhcHBlclN0eWxlID0ge307XG4gICAgICAgIGlmICghaXNOYU4oTnVtYmVyKHpJbmRleCkpKSB7XG4gICAgICAgICAgICBtZW51U3R5bGVbXCJ6SW5kZXhcIl0gPSB6SW5kZXggKyAxO1xuICAgICAgICAgICAgd3JhcHBlclN0eWxlW1wiekluZGV4XCJdID0gekluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJhY2tncm91bmQ7XG4gICAgICAgIGlmIChoYXNCYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kID0gKFxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ29udGV4dHVhbE1lbnVfYmFja2dyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt3cmFwcGVyU3R5bGV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvZHkgPSA8PlxuICAgICAgICAgICAgeyBjaGV2cm9uIH1cbiAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICA8Lz47XG5cbiAgICAgICAgaWYgKGZvY3VzTG9jaykge1xuICAgICAgICAgICAgYm9keSA9IDxGb2N1c0xvY2s+XG4gICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgIDwvRm9jdXNMb2NrPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Um92aW5nVGFiSW5kZXhQcm92aWRlciBoYW5kbGVIb21lRW5kIGhhbmRsZVVwRG93biBvbktleURvd249e3RoaXMub25LZXlEb3dufT5cbiAgICAgICAgICAgICAgICB7ICh7IG9uS2V5RG93bkhhbmRsZXIgfSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9Db250ZXh0dWFsTWVudV93cmFwcGVyXCIsIHdyYXBwZXJDbGFzc05hbWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgLi4ucG9zaXRpb24sIC4uLndyYXBwZXJTdHlsZSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXtvbktleURvd25IYW5kbGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51UHJldmVudEJ1YmJsaW5nfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGJhY2tncm91bmQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bWVudUNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e21lbnVTdHlsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuY29sbGVjdENvbnRleHRNZW51UmVjdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPXttYW5hZ2VkID8gXCJtZW51XCIgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYm9keSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L1JvdmluZ1RhYkluZGV4UHJvdmlkZXI+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Q2hpbGQge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tb3VudEFzQ2hpbGQpIHtcbiAgICAgICAgICAgIC8vIFJlbmRlciBhcyBhIGNoaWxkIG9mIHRoZSBjdXJyZW50IHBhcmVudFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTWVudSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gUmVuZGVyIGFzIGEgY2hpbGQgb2YgYSBjb250YWluZXIgYXQgdGhlIHJvb3Qgb2YgdGhlIERPTVxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0RE9NLmNyZWF0ZVBvcnRhbCh0aGlzLnJlbmRlck1lbnUoKSwgZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB0eXBlIFRvUmlnaHRPZiA9IHtcbiAgICBsZWZ0OiBudW1iZXI7XG4gICAgdG9wOiBudW1iZXI7XG4gICAgY2hldnJvbk9mZnNldDogbnVtYmVyO1xufTtcblxuLy8gUGxhY2VtZW50IG1ldGhvZCBmb3IgPENvbnRleHRNZW51IC8+IHRvIHBvc2l0aW9uIGNvbnRleHQgbWVudSB0byByaWdodCBvZiBlbGVtZW50UmVjdCB3aXRoIGNoZXZyb25PZmZzZXRcbmV4cG9ydCBjb25zdCB0b1JpZ2h0T2YgPSAoZWxlbWVudFJlY3Q6IFBpY2s8RE9NUmVjdCwgXCJyaWdodFwiIHwgXCJ0b3BcIiB8IFwiaGVpZ2h0XCI+LCBjaGV2cm9uT2Zmc2V0ID0gMTIpOiBUb1JpZ2h0T2YgPT4ge1xuICAgIGNvbnN0IGxlZnQgPSBlbGVtZW50UmVjdC5yaWdodCArIHdpbmRvdy5zY3JvbGxYICsgMztcbiAgICBsZXQgdG9wID0gZWxlbWVudFJlY3QudG9wICsgKGVsZW1lbnRSZWN0LmhlaWdodCAvIDIpICsgd2luZG93LnNjcm9sbFk7XG4gICAgdG9wIC09IGNoZXZyb25PZmZzZXQgKyA4OyAvLyB3aGVyZSA4IGlzIGhhbGYgdGhlIGhlaWdodCBvZiB0aGUgY2hldnJvblxuICAgIHJldHVybiB7IGxlZnQsIHRvcCwgY2hldnJvbk9mZnNldCB9O1xufTtcblxuZXhwb3J0IHR5cGUgQWJvdmVMZWZ0T2YgPSBJUG9zaXRpb24gJiB7XG4gICAgY2hldnJvbkZhY2U6IENoZXZyb25GYWNlO1xufTtcblxuLy8gUGxhY2VtZW50IG1ldGhvZCBmb3IgPENvbnRleHRNZW51IC8+IHRvIHBvc2l0aW9uIGNvbnRleHQgbWVudSByaWdodC1hbGlnbmVkIGFuZCBmbG93aW5nIHRvIHRoZSBsZWZ0IG9mIGVsZW1lbnRSZWN0LFxuLy8gYW5kIGVpdGhlciBhYm92ZSBvciBiZWxvdzogd2hlcmV2ZXIgdGhlcmUgaXMgbW9yZSBzcGFjZSAobWF5YmUgdGhpcyBzaG91bGQgYmUgYWJvdmVPckJlbG93TGVmdE9mPylcbmV4cG9ydCBjb25zdCBhYm92ZUxlZnRPZiA9IChcbiAgICBlbGVtZW50UmVjdDogUGljazxET01SZWN0LCBcInJpZ2h0XCIgfCBcInRvcFwiIHwgXCJib3R0b21cIj4sXG4gICAgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5Ob25lLFxuICAgIHZQYWRkaW5nID0gMCxcbik6IEFib3ZlTGVmdE9mID0+IHtcbiAgICBjb25zdCBtZW51T3B0aW9uczogSVBvc2l0aW9uICYgeyBjaGV2cm9uRmFjZTogQ2hldnJvbkZhY2UgfSA9IHsgY2hldnJvbkZhY2UgfTtcblxuICAgIGNvbnN0IGJ1dHRvblJpZ2h0ID0gZWxlbWVudFJlY3QucmlnaHQgKyB3aW5kb3cuc2Nyb2xsWDtcbiAgICBjb25zdCBidXR0b25Cb3R0b20gPSBlbGVtZW50UmVjdC5ib3R0b20gKyB3aW5kb3cuc2Nyb2xsWTtcbiAgICBjb25zdCBidXR0b25Ub3AgPSBlbGVtZW50UmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWTtcbiAgICAvLyBBbGlnbiB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgbWVudSB0byB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgYnV0dG9uXG4gICAgbWVudU9wdGlvbnMucmlnaHQgPSBVSVN0b3JlLmluc3RhbmNlLndpbmRvd1dpZHRoIC0gYnV0dG9uUmlnaHQ7XG4gICAgLy8gQWxpZ24gdGhlIG1lbnUgdmVydGljYWxseSBvbiB3aGljaGV2ZXIgc2lkZSBvZiB0aGUgYnV0dG9uIGhhcyBtb3JlIHNwYWNlIGF2YWlsYWJsZS5cbiAgICBpZiAoYnV0dG9uQm90dG9tIDwgVUlTdG9yZS5pbnN0YW5jZS53aW5kb3dIZWlnaHQgLyAyKSB7XG4gICAgICAgIG1lbnVPcHRpb25zLnRvcCA9IGJ1dHRvbkJvdHRvbSArIHZQYWRkaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbnVPcHRpb25zLmJvdHRvbSA9IChVSVN0b3JlLmluc3RhbmNlLndpbmRvd0hlaWdodCAtIGJ1dHRvblRvcCkgKyB2UGFkZGluZztcbiAgICB9XG5cbiAgICByZXR1cm4gbWVudU9wdGlvbnM7XG59O1xuXG4vLyBQbGFjZW1lbnQgbWV0aG9kIGZvciA8Q29udGV4dE1lbnUgLz4gdG8gcG9zaXRpb24gY29udGV4dCBtZW51IHJpZ2h0LWFsaWduZWQgYW5kIGZsb3dpbmcgdG8gdGhlIHJpZ2h0IG9mIGVsZW1lbnRSZWN0LFxuLy8gYW5kIGVpdGhlciBhYm92ZSBvciBiZWxvdzogd2hlcmV2ZXIgdGhlcmUgaXMgbW9yZSBzcGFjZSAobWF5YmUgdGhpcyBzaG91bGQgYmUgYWJvdmVPckJlbG93UmlnaHRPZj8pXG5leHBvcnQgY29uc3QgYWJvdmVSaWdodE9mID0gKFxuICAgIGVsZW1lbnRSZWN0OiBQaWNrPERPTVJlY3QsIFwibGVmdFwiIHwgXCJ0b3BcIiB8IFwiYm90dG9tXCI+LFxuICAgIGNoZXZyb25GYWNlID0gQ2hldnJvbkZhY2UuTm9uZSxcbiAgICB2UGFkZGluZyA9IDAsXG4pOiBBYm92ZUxlZnRPZiA9PiB7XG4gICAgY29uc3QgbWVudU9wdGlvbnM6IElQb3NpdGlvbiAmIHsgY2hldnJvbkZhY2U6IENoZXZyb25GYWNlIH0gPSB7IGNoZXZyb25GYWNlIH07XG5cbiAgICBjb25zdCBidXR0b25MZWZ0ID0gZWxlbWVudFJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYO1xuICAgIGNvbnN0IGJ1dHRvbkJvdHRvbSA9IGVsZW1lbnRSZWN0LmJvdHRvbSArIHdpbmRvdy5zY3JvbGxZO1xuICAgIGNvbnN0IGJ1dHRvblRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xuICAgIC8vIEFsaWduIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIG1lbnUgdG8gdGhlIGxlZnQgZWRnZSBvZiB0aGUgYnV0dG9uXG4gICAgbWVudU9wdGlvbnMubGVmdCA9IGJ1dHRvbkxlZnQ7XG4gICAgLy8gQWxpZ24gdGhlIG1lbnUgdmVydGljYWxseSBvbiB3aGljaGV2ZXIgc2lkZSBvZiB0aGUgYnV0dG9uIGhhcyBtb3JlIHNwYWNlIGF2YWlsYWJsZS5cbiAgICBpZiAoYnV0dG9uQm90dG9tIDwgVUlTdG9yZS5pbnN0YW5jZS53aW5kb3dIZWlnaHQgLyAyKSB7XG4gICAgICAgIG1lbnVPcHRpb25zLnRvcCA9IGJ1dHRvbkJvdHRvbSArIHZQYWRkaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbnVPcHRpb25zLmJvdHRvbSA9IChVSVN0b3JlLmluc3RhbmNlLndpbmRvd0hlaWdodCAtIGJ1dHRvblRvcCkgKyB2UGFkZGluZztcbiAgICB9XG5cbiAgICByZXR1cm4gbWVudU9wdGlvbnM7XG59O1xuXG4vLyBQbGFjZW1lbnQgbWV0aG9kIGZvciA8Q29udGV4dE1lbnUgLz4gdG8gcG9zaXRpb24gY29udGV4dCBtZW51IHJpZ2h0LWFsaWduZWQgYW5kIGZsb3dpbmcgdG8gdGhlIGxlZnQgb2YgZWxlbWVudFJlY3Rcbi8vIGFuZCBhbHdheXMgYWJvdmUgZWxlbWVudFJlY3RcbmV4cG9ydCBjb25zdCBhbHdheXNBYm92ZUxlZnRPZiA9IChcbiAgICBlbGVtZW50UmVjdDogUGljazxET01SZWN0LCBcInJpZ2h0XCIgfCBcImJvdHRvbVwiIHwgXCJ0b3BcIj4sXG4gICAgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5Ob25lLFxuICAgIHZQYWRkaW5nID0gMCxcbikgPT4ge1xuICAgIGNvbnN0IG1lbnVPcHRpb25zOiBJUG9zaXRpb24gJiB7IGNoZXZyb25GYWNlOiBDaGV2cm9uRmFjZSB9ID0geyBjaGV2cm9uRmFjZSB9O1xuXG4gICAgY29uc3QgYnV0dG9uUmlnaHQgPSBlbGVtZW50UmVjdC5yaWdodCArIHdpbmRvdy5zY3JvbGxYO1xuICAgIGNvbnN0IGJ1dHRvbkJvdHRvbSA9IGVsZW1lbnRSZWN0LmJvdHRvbSArIHdpbmRvdy5zY3JvbGxZO1xuICAgIGNvbnN0IGJ1dHRvblRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xuICAgIC8vIEFsaWduIHRoZSByaWdodCBlZGdlIG9mIHRoZSBtZW51IHRvIHRoZSByaWdodCBlZGdlIG9mIHRoZSBidXR0b25cbiAgICBtZW51T3B0aW9ucy5yaWdodCA9IFVJU3RvcmUuaW5zdGFuY2Uud2luZG93V2lkdGggLSBidXR0b25SaWdodDtcbiAgICAvLyBBbGlnbiB0aGUgbWVudSB2ZXJ0aWNhbGx5IG9uIHdoaWNoZXZlciBzaWRlIG9mIHRoZSBidXR0b24gaGFzIG1vcmUgc3BhY2UgYXZhaWxhYmxlLlxuICAgIGlmIChidXR0b25Cb3R0b20gPCBVSVN0b3JlLmluc3RhbmNlLndpbmRvd0hlaWdodCAvIDIpIHtcbiAgICAgICAgbWVudU9wdGlvbnMudG9wID0gYnV0dG9uQm90dG9tICsgdlBhZGRpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWVudU9wdGlvbnMuYm90dG9tID0gKFVJU3RvcmUuaW5zdGFuY2Uud2luZG93SGVpZ2h0IC0gYnV0dG9uVG9wKSArIHZQYWRkaW5nO1xuICAgIH1cblxuICAgIHJldHVybiBtZW51T3B0aW9ucztcbn07XG5cbi8vIFBsYWNlbWVudCBtZXRob2QgZm9yIDxDb250ZXh0TWVudSAvPiB0byBwb3NpdGlvbiBjb250ZXh0IG1lbnUgcmlnaHQtYWxpZ25lZCBhbmQgZmxvd2luZyB0byB0aGUgcmlnaHQgb2YgZWxlbWVudFJlY3Rcbi8vIGFuZCBhbHdheXMgYWJvdmUgZWxlbWVudFJlY3RcbmV4cG9ydCBjb25zdCBhbHdheXNBYm92ZVJpZ2h0T2YgPSAoXG4gICAgZWxlbWVudFJlY3Q6IFBpY2s8RE9NUmVjdCwgXCJsZWZ0XCIgfCBcInRvcFwiPixcbiAgICBjaGV2cm9uRmFjZSA9IENoZXZyb25GYWNlLk5vbmUsXG4gICAgdlBhZGRpbmcgPSAwLFxuKSA9PiB7XG4gICAgY29uc3QgbWVudU9wdGlvbnM6IElQb3NpdGlvbiAmIHsgY2hldnJvbkZhY2U6IENoZXZyb25GYWNlIH0gPSB7IGNoZXZyb25GYWNlIH07XG5cbiAgICBjb25zdCBidXR0b25MZWZ0ID0gZWxlbWVudFJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYO1xuICAgIGNvbnN0IGJ1dHRvblRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZO1xuICAgIC8vIEFsaWduIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIG1lbnUgdG8gdGhlIGxlZnQgZWRnZSBvZiB0aGUgYnV0dG9uXG4gICAgbWVudU9wdGlvbnMubGVmdCA9IGJ1dHRvbkxlZnQ7XG4gICAgLy8gQWxpZ24gdGhlIG1lbnUgdmVydGljYWxseSBhYm92ZSB0aGUgbWVudVxuICAgIG1lbnVPcHRpb25zLmJvdHRvbSA9IChVSVN0b3JlLmluc3RhbmNlLndpbmRvd0hlaWdodCAtIGJ1dHRvblRvcCkgKyB2UGFkZGluZztcblxuICAgIHJldHVybiBtZW51T3B0aW9ucztcbn07XG5cbnR5cGUgQ29udGV4dE1lbnVUdXBsZTxUPiA9IFtcbiAgICBib29sZWFuLFxuICAgIFJlZk9iamVjdDxUPixcbiAgICAoZXY/OiBTeW50aGV0aWNFdmVudCkgPT4gdm9pZCxcbiAgICAoZXY/OiBTeW50aGV0aWNFdmVudCkgPT4gdm9pZCxcbiAgICAodmFsOiBib29sZWFuKSA9PiB2b2lkLFxuXTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5uZWNlc3NhcnktdHlwZS1jb25zdHJhaW50XG5leHBvcnQgY29uc3QgdXNlQ29udGV4dE1lbnUgPSA8VCBleHRlbmRzIGFueSA9IEhUTUxFbGVtZW50PigpOiBDb250ZXh0TWVudVR1cGxlPFQ+ID0+IHtcbiAgICBjb25zdCBidXR0b24gPSB1c2VSZWY8VD4obnVsbCk7XG4gICAgY29uc3QgW2lzT3Blbiwgc2V0SXNPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBvcGVuID0gKGV2PzogU3ludGhldGljRXZlbnQpID0+IHtcbiAgICAgICAgZXY/LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2Py5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2V0SXNPcGVuKHRydWUpO1xuICAgIH07XG4gICAgY29uc3QgY2xvc2UgPSAoZXY/OiBTeW50aGV0aWNFdmVudCkgPT4ge1xuICAgICAgICBldj8ucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXY/LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzZXRJc09wZW4oZmFsc2UpO1xuICAgIH07XG5cbiAgICByZXR1cm4gW2lzT3BlbiwgYnV0dG9uLCBvcGVuLCBjbG9zZSwgc2V0SXNPcGVuXTtcbn07XG5cbi8vIFhYWDogRGVwcmVjYXRlZCwgdXNlZCBvbmx5IGZvciBkeW5hbWljIFRvb2x0aXBzLiBBdm9pZCB1c2luZyBhdCBhbGwgY29zdHMuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWVudShFbGVtZW50Q2xhc3MsIHByb3BzKSB7XG4gICAgY29uc3Qgb25GaW5pc2hlZCA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShnZXRPckNyZWF0ZUNvbnRhaW5lcigpKTtcbiAgICAgICAgcHJvcHM/Lm9uRmluaXNoZWQ/LmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH07XG5cbiAgICBjb25zdCBtZW51ID0gPENvbnRleHRNZW51XG4gICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgbW91bnRBc0NoaWxkPXt0cnVlfVxuICAgICAgICBoYXNCYWNrZ3JvdW5kPXtmYWxzZX1cbiAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC9qc3gtbm8tYmluZFxuICAgICAgICB3aW5kb3dSZXNpemU9e29uRmluaXNoZWR9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QvanN4LW5vLWJpbmRcbiAgICA+XG4gICAgICAgIDxFbGVtZW50Q2xhc3Mgey4uLnByb3BzfSBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfSAvPlxuICAgIDwvQ29udGV4dE1lbnU+O1xuXG4gICAgUmVhY3RET00ucmVuZGVyKG1lbnUsIGdldE9yQ3JlYXRlQ29udGFpbmVyKCkpO1xuXG4gICAgcmV0dXJuIHsgY2xvc2U6IG9uRmluaXNoZWQgfTtcbn1cblxuLy8gcmUtZXhwb3J0IHRoZSBzZW1hbnRpYyBoZWxwZXIgY29tcG9uZW50cyBmb3Igc2ltcGxpY2l0eVxuZXhwb3J0IHsgQ29udGV4dE1lbnVCdXR0b24gfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvQ29udGV4dE1lbnVCdXR0b25cIjtcbmV4cG9ydCB7IENvbnRleHRNZW51VG9vbHRpcEJ1dHRvbiB9IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9Db250ZXh0TWVudVRvb2x0aXBCdXR0b25cIjtcbmV4cG9ydCB7IE1lbnVJdGVtIH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L01lbnVJdGVtXCI7XG5leHBvcnQgeyBNZW51SXRlbUNoZWNrYm94IH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L01lbnVJdGVtQ2hlY2tib3hcIjtcbmV4cG9ydCB7IE1lbnVJdGVtUmFkaW8gfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvTWVudUl0ZW1SYWRpb1wiO1xuZXhwb3J0IHsgU3R5bGVkTWVudUl0ZW1DaGVja2JveCB9IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9TdHlsZWRNZW51SXRlbUNoZWNrYm94XCI7XG5leHBvcnQgeyBTdHlsZWRNZW51SXRlbVJhZGlvIH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L1N0eWxlZE1lbnVJdGVtUmFkaW9cIjtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQXNqQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7OztBQTFqQkE7QUFDQTtBQUNBO0FBRUEsTUFBTUEsY0FBYyxHQUFHLEVBQXZCO0FBQ0EsTUFBTUMseUJBQXlCLEdBQUcsNkJBQWxDOztBQUVBLFNBQVNDLG9CQUFULEdBQWdEO0VBQzVDLElBQUlDLFNBQVMsR0FBR0MsUUFBUSxDQUFDQyxjQUFULENBQXdCSix5QkFBeEIsQ0FBaEI7O0VBRUEsSUFBSSxDQUFDRSxTQUFMLEVBQWdCO0lBQ1pBLFNBQVMsR0FBR0MsUUFBUSxDQUFDRSxhQUFULENBQXVCLEtBQXZCLENBQVo7SUFDQUgsU0FBUyxDQUFDSSxFQUFWLEdBQWVOLHlCQUFmO0lBQ0FHLFFBQVEsQ0FBQ0ksSUFBVCxDQUFjQyxXQUFkLENBQTBCTixTQUExQjtFQUNIOztFQUVELE9BQU9BLFNBQVA7QUFDSDs7SUFXV08sVzs7O1dBQUFBLFc7RUFBQUEsVztFQUFBQSxXO0VBQUFBLFc7RUFBQUEsVztFQUFBQSxXO0dBQUFBLFcsMkJBQUFBLFc7O0FBK0NaO0FBQ0E7QUFDQTtBQUNlLE1BQU1DLFdBQU4sU0FBMEJDLGNBQUEsQ0FBTUMsYUFBaEMsQ0FBOEQ7RUFRekVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRQyxPQUFSLEVBQWlCO0lBQ3hCLE1BQU1ELEtBQU4sRUFBYUMsT0FBYjtJQUR3QjtJQUFBLDhEQWdCTUMsT0FBRCxJQUE2QjtNQUMxRDtNQUNBLElBQUksQ0FBQ0EsT0FBTCxFQUFjO01BRWQsTUFBTUMsS0FBSyxHQUFHRCxPQUFPLENBQUNFLGFBQVIsQ0FBbUMsb0JBQW5DLEtBQ1BGLE9BQU8sQ0FBQ0UsYUFBUixDQUFtQyxhQUFuQyxDQURQOztNQUdBLElBQUlELEtBQUosRUFBVztRQUNQQSxLQUFLLENBQUNFLEtBQU47TUFDSDs7TUFFRCxLQUFLQyxRQUFMLENBQWM7UUFDVkMsZUFBZSxFQUFFTDtNQURQLENBQWQ7SUFHSCxDQTlCMkI7SUFBQSxxREFnQ0hNLENBQUQsSUFBTztNQUMzQixJQUFJLEtBQUtSLEtBQUwsQ0FBV1MsVUFBZixFQUEyQjtRQUN2QixLQUFLVCxLQUFMLENBQVdTLFVBQVg7UUFFQUQsQ0FBQyxDQUFDRSxjQUFGO1FBQ0FGLENBQUMsQ0FBQ0csZUFBRjtRQUNBLE1BQU1DLENBQUMsR0FBR0osQ0FBQyxDQUFDSyxPQUFaO1FBQ0EsTUFBTUMsQ0FBQyxHQUFHTixDQUFDLENBQUNPLE9BQVosQ0FOdUIsQ0FRdkI7UUFDQTs7UUFDQUMsWUFBWSxDQUFDLE1BQU07VUFDZixNQUFNQyxVQUFVLEdBQUcsSUFBSUMsVUFBSixDQUFlLGFBQWYsRUFBOEI7WUFDN0NMLE9BQU8sRUFBRUQsQ0FEb0M7WUFFN0NHLE9BQU8sRUFBRUQsQ0FGb0M7WUFHN0NLLE9BQU8sRUFBRSxDQUhvQztZQUk3Q0MsT0FBTyxFQUFFLENBSm9DO1lBSzdDQyxNQUFNLEVBQUUsQ0FMcUM7WUFLbEM7WUFDWEMsYUFBYSxFQUFFO1VBTjhCLENBQTlCLENBQW5CO1VBUUFqQyxRQUFRLENBQUNrQyxnQkFBVCxDQUEwQlgsQ0FBMUIsRUFBNkJFLENBQTdCLEVBQWdDVSxhQUFoQyxDQUE4Q1AsVUFBOUM7UUFDSCxDQVZXLENBQVo7TUFXSDtJQUNKLENBdkQyQjtJQUFBLG9FQXlEWVQsQ0FBRCxJQUFPO01BQzFDO01BQ0E7TUFDQUEsQ0FBQyxDQUFDRyxlQUFGO0lBQ0gsQ0E3RDJCO0lBQUEsa0RBZ0VOYyxFQUFELElBQTBCO01BQzNDQSxFQUFFLENBQUNkLGVBQUg7TUFDQWMsRUFBRSxDQUFDZixjQUFIO01BQ0EsSUFBSSxLQUFLVixLQUFMLENBQVdTLFVBQWYsRUFBMkIsS0FBS1QsS0FBTCxDQUFXUyxVQUFYO0lBQzlCLENBcEUyQjtJQUFBLCtDQXNFVGdCLEVBQUQsSUFBMEI7TUFDeEM7TUFDQUEsRUFBRSxDQUFDZCxlQUFIO0lBQ0gsQ0F6RTJCO0lBQUEsaURBNkVQYyxFQUFELElBQTZCO01BQzdDQSxFQUFFLENBQUNkLGVBQUgsR0FENkMsQ0FDdkI7O01BRXRCLE1BQU1lLE1BQU0sR0FBRyxJQUFBQyx5Q0FBQSxJQUF3QkMsc0JBQXhCLENBQStDSCxFQUEvQyxDQUFmLENBSDZDLENBSzdDO01BQ0E7O01BQ0EsSUFBSSxDQUFDLEtBQUt6QixLQUFMLENBQVc2QixPQUFoQixFQUF5QjtRQUNyQixJQUFJSCxNQUFNLEtBQUtJLG1DQUFBLENBQWlCQyxNQUFoQyxFQUF3QztVQUNwQyxLQUFLL0IsS0FBTCxDQUFXUyxVQUFYO1FBQ0g7O1FBQ0Q7TUFDSCxDQVo0QyxDQWM3Qzs7O01BQ0EsSUFBSSxJQUFBdUIscUNBQUEsRUFBc0JQLEVBQUUsQ0FBQ1EsTUFBekIsS0FBbURQLE1BQU0sS0FBS0ksbUNBQUEsQ0FBaUJDLE1BQW5GLEVBQTJGO1FBQ3ZGO01BQ0g7O01BRUQsSUFBSSxDQUNBRCxtQ0FBQSxDQUFpQkMsTUFEakIsRUFFQTtNQUNBO01BQ0FELG1DQUFBLENBQWlCSSxHQUpqQixFQUtBO01BQ0E7TUFDQUosbUNBQUEsQ0FBaUJLLFNBUGpCLEVBUUFMLG1DQUFBLENBQWlCTSxVQVJqQixFQVNGQyxRQVRFLENBU09YLE1BVFAsQ0FBSixFQVNvQjtRQUNoQixLQUFLMUIsS0FBTCxDQUFXUyxVQUFYO01BQ0g7SUFDSixDQTVHMkI7SUFHeEIsS0FBSzZCLEtBQUwsR0FBYTtNQUNUL0IsZUFBZSxFQUFFO0lBRFIsQ0FBYixDQUh3QixDQU94Qjs7SUFDQSxLQUFLZ0MsWUFBTCxHQUFvQmxELFFBQVEsQ0FBQ21ELGFBQTdCO0VBQ0g7O0VBRURDLG9CQUFvQixHQUFHO0lBQ25CO0lBQ0EsS0FBS0YsWUFBTCxDQUFrQmxDLEtBQWxCO0VBQ0g7O0VBZ0dTcUMsVUFBVSxHQUEyQztJQUFBLElBQTFDQyxhQUEwQyx1RUFBMUIsS0FBSzNDLEtBQUwsQ0FBVzJDLGFBQWU7SUFDM0QsTUFBTUMsUUFBcUMsR0FBRyxFQUE5QztJQUNBLG9CQXNCSSxLQUFLNUMsS0F0QlQ7SUFBQSxNQUFNO01BQ0Y2QyxHQURFO01BRUZDLE1BRkU7TUFHRkMsSUFIRTtNQUlGQyxLQUpFO01BS0ZDLGFBTEU7TUFNRkMsWUFORTtNQU9GQyxhQVBFO01BUUZDLFVBUkU7TUFTRkMsU0FURTtNQVVGQyxlQVZFO01BV0ZDLGdCQVhFO01BWUZDLGlCQVpFO01BYUZDLGNBYkU7TUFjRkMsTUFkRTtNQWVGQyxRQWZFO01BZ0JGQyxTQWhCRTtNQWlCRi9CLE9BakJFO01Ba0JGZ0MsZ0JBbEJFO01BbUJGQyxXQUFXLEVBQUVDLGdCQW5CWDtNQW9CRkMsYUFBYSxFQUFFQztJQXBCYixDQUFOO0lBQUEsTUFxQk9qRSxLQXJCUDs7SUF3QkEsSUFBSTZDLEdBQUosRUFBUztNQUNMRCxRQUFRLENBQUNDLEdBQVQsR0FBZUEsR0FBZjtJQUNILENBRkQsTUFFTztNQUNIRCxRQUFRLENBQUNFLE1BQVQsR0FBa0JBLE1BQWxCO0lBQ0g7O0lBRUQsSUFBSWdCLFdBQUo7O0lBQ0EsSUFBSWYsSUFBSixFQUFVO01BQ05ILFFBQVEsQ0FBQ0csSUFBVCxHQUFnQkEsSUFBaEI7TUFDQWUsV0FBVyxHQUFHbkUsV0FBVyxDQUFDdUUsSUFBMUI7SUFDSCxDQUhELE1BR087TUFDSHRCLFFBQVEsQ0FBQ0ksS0FBVCxHQUFpQkEsS0FBakI7TUFDQWMsV0FBVyxHQUFHbkUsV0FBVyxDQUFDd0UsS0FBMUI7SUFDSDs7SUFFRCxNQUFNQyxlQUFlLEdBQUcsS0FBSzlCLEtBQUwsQ0FBVy9CLGVBQVgsR0FBNkIsS0FBSytCLEtBQUwsQ0FBVy9CLGVBQVgsQ0FBMkI4RCxxQkFBM0IsRUFBN0IsR0FBa0YsSUFBMUc7SUFFQSxNQUFNTCxhQUE0QixHQUFHLEVBQXJDOztJQUNBLElBQUlELGdCQUFKLEVBQXNCO01BQ2xCRCxXQUFXLEdBQUdDLGdCQUFkO0lBQ0g7O0lBQ0QsTUFBTU8sVUFBVSxHQUFHUixXQUFXLElBQUlBLFdBQVcsS0FBS25FLFdBQVcsQ0FBQzRFLElBQTlEOztJQUVBLElBQUlULFdBQVcsS0FBS25FLFdBQVcsQ0FBQzZFLEdBQTVCLElBQW1DVixXQUFXLEtBQUtuRSxXQUFXLENBQUM4RSxNQUFuRSxFQUEyRTtNQUN2RVQsYUFBYSxDQUFDakIsSUFBZCxHQUFxQmtCLGtCQUFyQjtJQUNILENBRkQsTUFFTztNQUNIRCxhQUFhLENBQUNuQixHQUFkLEdBQW9Cb0Isa0JBQXBCO0lBQ0gsQ0FyRDBELENBdUQzRDtJQUNBOzs7SUFDQSxNQUFNO01BQUVTLFdBQUY7TUFBZUM7SUFBZixJQUFnQ0MsZ0JBQUEsQ0FBUUMsUUFBOUM7O0lBQ0EsSUFBSVQsZUFBSixFQUFxQjtNQUNqQixJQUFJeEIsUUFBUSxDQUFDQyxHQUFULEtBQWlCaUMsU0FBckIsRUFBZ0M7UUFDNUIsSUFBSUMsTUFBTSxHQUFHSixZQUFZLEdBQUcxRixjQUE1Qjs7UUFDQSxJQUFJLENBQUNnRSxhQUFMLEVBQW9CO1VBQ2hCOEIsTUFBTSxJQUFJWCxlQUFlLENBQUNZLE1BQTFCO1FBQ0g7O1FBQ0RwQyxRQUFRLENBQUNDLEdBQVQsR0FBZW9DLElBQUksQ0FBQ0MsR0FBTCxDQUFTdEMsUUFBUSxDQUFDQyxHQUFsQixFQUF1QmtDLE1BQXZCLENBQWYsQ0FMNEIsQ0FNNUI7O1FBQ0EsSUFBSWYsYUFBYSxDQUFDbkIsR0FBZCxLQUFzQmlDLFNBQTFCLEVBQXFDO1VBQ2pDZCxhQUFhLENBQUNuQixHQUFkLEdBQW9Cb0Isa0JBQWtCLEdBQUdwQixHQUFyQixHQUEyQkQsUUFBUSxDQUFDQyxHQUF4RDtRQUNIO01BQ0osQ0FWRCxNQVVPLElBQUlELFFBQVEsQ0FBQ0UsTUFBVCxLQUFvQmdDLFNBQXhCLEVBQW1DO1FBQ3RDbEMsUUFBUSxDQUFDRSxNQUFULEdBQWtCbUMsSUFBSSxDQUFDQyxHQUFMLENBQ2R0QyxRQUFRLENBQUNFLE1BREssRUFFZDZCLFlBQVksR0FBR1AsZUFBZSxDQUFDWSxNQUEvQixHQUF3Qy9GLGNBRjFCLENBQWxCOztRQUlBLElBQUkrRSxhQUFhLENBQUNuQixHQUFkLEtBQXNCaUMsU0FBMUIsRUFBcUM7VUFDakNkLGFBQWEsQ0FBQ25CLEdBQWQsR0FBb0JvQixrQkFBa0IsR0FBR3JCLFFBQVEsQ0FBQ0UsTUFBOUIsR0FBdUNBLE1BQTNEO1FBQ0g7TUFDSjs7TUFDRCxJQUFJRixRQUFRLENBQUNHLElBQVQsS0FBa0IrQixTQUF0QixFQUFpQztRQUM3QixJQUFJSyxPQUFPLEdBQUdULFdBQVcsR0FBR3pGLGNBQTVCOztRQUNBLElBQUksQ0FBQ2lFLFlBQUwsRUFBbUI7VUFDZmlDLE9BQU8sSUFBSWYsZUFBZSxDQUFDZ0IsS0FBM0I7UUFDSDs7UUFDRHhDLFFBQVEsQ0FBQ0csSUFBVCxHQUFnQmtDLElBQUksQ0FBQ0MsR0FBTCxDQUFTdEMsUUFBUSxDQUFDRyxJQUFsQixFQUF3Qm9DLE9BQXhCLENBQWhCOztRQUNBLElBQUluQixhQUFhLENBQUNqQixJQUFkLEtBQXVCK0IsU0FBM0IsRUFBc0M7VUFDbENkLGFBQWEsQ0FBQ2pCLElBQWQsR0FBcUJrQixrQkFBa0IsR0FBR2xCLElBQXJCLEdBQTRCSCxRQUFRLENBQUNHLElBQTFEO1FBQ0g7TUFDSixDQVRELE1BU08sSUFBSUgsUUFBUSxDQUFDSSxLQUFULEtBQW1COEIsU0FBdkIsRUFBa0M7UUFDckNsQyxRQUFRLENBQUNJLEtBQVQsR0FBaUJpQyxJQUFJLENBQUNDLEdBQUwsQ0FDYnRDLFFBQVEsQ0FBQ0ksS0FESSxFQUViMEIsV0FBVyxHQUFHTixlQUFlLENBQUNnQixLQUE5QixHQUFzQ25HLGNBRnpCLENBQWpCOztRQUlBLElBQUkrRSxhQUFhLENBQUNqQixJQUFkLEtBQXVCK0IsU0FBM0IsRUFBc0M7VUFDbENkLGFBQWEsQ0FBQ2pCLElBQWQsR0FBcUJrQixrQkFBa0IsR0FBR3JCLFFBQVEsQ0FBQ0ksS0FBOUIsR0FBc0NBLEtBQTNEO1FBQ0g7TUFDSjtJQUNKOztJQUVELElBQUlxQyxPQUFKOztJQUNBLElBQUlmLFVBQUosRUFBZ0I7TUFDWmUsT0FBTyxnQkFBRztRQUFLLEtBQUssRUFBRXJCLGFBQVo7UUFBMkIsU0FBUyxFQUFFLCtCQUErQkY7TUFBckUsRUFBVjtJQUNIOztJQUVELE1BQU13QixXQUFXLEdBQUcsSUFBQUMsbUJBQUEsRUFBVztNQUMzQixxQkFBcUIsSUFETTs7TUFFM0I7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ1ksMEJBQTBCLENBQUNqQixVQUFELElBQWUxQixRQUFRLENBQUNHLElBQVQsS0FBa0IrQixTQUFqQyxJQUE4QyxDQUFDbEMsUUFBUSxDQUFDSSxLQVJ2RDtNQVMzQiwyQkFBMkIsQ0FBQ3NCLFVBQUQsSUFBZTFCLFFBQVEsQ0FBQ0ksS0FBVCxLQUFtQjhCLFNBQWxDLElBQStDLENBQUNsQyxRQUFRLENBQUNHLElBVHpEO01BVTNCLHlCQUF5QixDQUFDdUIsVUFBRCxJQUFlMUIsUUFBUSxDQUFDQyxHQUFULEtBQWlCaUMsU0FBaEMsSUFBNkMsQ0FBQ2xDLFFBQVEsQ0FBQ0UsTUFWckQ7TUFXM0IsNEJBQTRCLENBQUN3QixVQUFELElBQWUxQixRQUFRLENBQUNFLE1BQVQsS0FBb0JnQyxTQUFuQyxJQUFnRCxDQUFDbEMsUUFBUSxDQUFDQyxHQVgzRDtNQVkzQixzQ0FBc0NpQixXQUFXLEtBQUtuRSxXQUFXLENBQUN1RSxJQVp2QztNQWEzQix1Q0FBdUNKLFdBQVcsS0FBS25FLFdBQVcsQ0FBQ3dFLEtBYnhDO01BYzNCLHFDQUFxQ0wsV0FBVyxLQUFLbkUsV0FBVyxDQUFDNkUsR0FkdEM7TUFlM0Isd0NBQXdDVixXQUFXLEtBQUtuRSxXQUFXLENBQUM4RSxNQWZ6QztNQWdCM0Isa0NBQWtDdkIsWUFBWSxLQUFLLElBaEJ4QjtNQWlCM0IsbUNBQW1DRCxhQUFhLEtBQUs7SUFqQjFCLENBQVgsRUFrQmpCRSxhQWxCaUIsQ0FBcEI7SUFvQkEsTUFBTXFDLFNBQXdCLEdBQUcsRUFBakM7O0lBQ0EsSUFBSW5DLFNBQUosRUFBZTtNQUNYbUMsU0FBUyxDQUFDSixLQUFWLEdBQWtCL0IsU0FBbEI7SUFDSDs7SUFFRCxJQUFJRCxVQUFKLEVBQWdCO01BQ1pvQyxTQUFTLENBQUNSLE1BQVYsR0FBbUI1QixVQUFuQjtJQUNIOztJQUVELElBQUksQ0FBQ3FDLEtBQUssQ0FBQ0MsTUFBTSxDQUFDakMsY0FBRCxDQUFQLENBQVYsRUFBb0M7TUFDaEMrQixTQUFTLENBQUMsWUFBRCxDQUFULEdBQTBCL0IsY0FBMUI7SUFDSDs7SUFDRCxJQUFJLENBQUNnQyxLQUFLLENBQUNDLE1BQU0sQ0FBQ3BDLGVBQUQsQ0FBUCxDQUFWLEVBQXFDO01BQ2pDa0MsU0FBUyxDQUFDLGFBQUQsQ0FBVCxHQUEyQmxDLGVBQTNCO0lBQ0g7O0lBQ0QsSUFBSSxDQUFDbUMsS0FBSyxDQUFDQyxNQUFNLENBQUNsQyxpQkFBRCxDQUFQLENBQVYsRUFBdUM7TUFDbkNnQyxTQUFTLENBQUMsZUFBRCxDQUFULEdBQTZCaEMsaUJBQTdCO0lBQ0g7O0lBQ0QsSUFBSSxDQUFDaUMsS0FBSyxDQUFDQyxNQUFNLENBQUNuQyxnQkFBRCxDQUFQLENBQVYsRUFBc0M7TUFDbENpQyxTQUFTLENBQUMsY0FBRCxDQUFULEdBQTRCakMsZ0JBQTVCO0lBQ0g7O0lBRUQsTUFBTW9DLFlBQVksR0FBRyxFQUFyQjs7SUFDQSxJQUFJLENBQUNGLEtBQUssQ0FBQ0MsTUFBTSxDQUFDaEMsTUFBRCxDQUFQLENBQVYsRUFBNEI7TUFDeEI4QixTQUFTLENBQUMsUUFBRCxDQUFULEdBQXNCOUIsTUFBTSxHQUFHLENBQS9CO01BQ0FpQyxZQUFZLENBQUMsUUFBRCxDQUFaLEdBQXlCakMsTUFBekI7SUFDSDs7SUFFRCxJQUFJa0MsVUFBSjs7SUFDQSxJQUFJakQsYUFBSixFQUFtQjtNQUNmaUQsVUFBVSxnQkFDTjtRQUNJLFNBQVMsRUFBQyw4QkFEZDtRQUVJLEtBQUssRUFBRUQsWUFGWDtRQUdJLE9BQU8sRUFBRSxLQUFLbEYsVUFIbEI7UUFJSSxhQUFhLEVBQUUsS0FBS29GO01BSnhCLEVBREo7SUFRSDs7SUFFRCxJQUFJcEcsSUFBSSxnQkFBRyw0REFDTDRGLE9BREssRUFFTDFCLFFBRkssQ0FBWDs7SUFLQSxJQUFJQyxTQUFKLEVBQWU7TUFDWG5FLElBQUksZ0JBQUcsNkJBQUMsdUJBQUQsUUFDREEsSUFEQyxDQUFQO0lBR0g7O0lBRUQsb0JBQ0ksNkJBQUMsc0NBQUQ7TUFBd0IsYUFBYSxNQUFyQztNQUFzQyxZQUFZLE1BQWxEO01BQW1ELFNBQVMsRUFBRSxLQUFLcUc7SUFBbkUsR0FDTTtNQUFBLElBQUM7UUFBRUM7TUFBRixDQUFEO01BQUEsb0JBQ0U7UUFDSSxTQUFTLEVBQUUsSUFBQVIsbUJBQUEsRUFBVywyQkFBWCxFQUF3QzFCLGdCQUF4QyxDQURmO1FBRUksS0FBSyxrQ0FBT2pCLFFBQVAsR0FBb0IrQyxZQUFwQixDQUZUO1FBR0ksT0FBTyxFQUFFLEtBQUtLLE9BSGxCO1FBSUksU0FBUyxFQUFFRCxnQkFKZjtRQUtJLGFBQWEsRUFBRSxLQUFLRTtNQUx4QixHQU9NTCxVQVBOLGVBUUk7UUFDSSxTQUFTLEVBQUVOLFdBRGY7UUFFSSxLQUFLLEVBQUVFLFNBRlg7UUFHSSxHQUFHLEVBQUUsS0FBS1Usc0JBSGQ7UUFJSSxJQUFJLEVBQUVyRSxPQUFPLEdBQUcsTUFBSCxHQUFZaUQ7TUFKN0IsR0FLUTlFLEtBTFIsR0FPTVAsSUFQTixDQVJKLENBREY7SUFBQSxDQUROLENBREo7RUF3Qkg7O0VBRUQwRyxNQUFNLEdBQXFCO0lBQ3ZCLElBQUksS0FBS25HLEtBQUwsQ0FBV29HLFlBQWYsRUFBNkI7TUFDekI7TUFDQSxPQUFPLEtBQUsxRCxVQUFMLEVBQVA7SUFDSCxDQUhELE1BR087TUFDSDtNQUNBLG9CQUFPMkQsaUJBQUEsQ0FBU0MsWUFBVCxDQUFzQixLQUFLNUQsVUFBTCxFQUF0QixFQUF5Q3ZELG9CQUFvQixFQUE3RCxDQUFQO0lBQ0g7RUFDSjs7QUF0VXdFOzs7OEJBQXhEUyxXLGtCQUdLO0VBQ2xCK0MsYUFBYSxFQUFFLElBREc7RUFFbEJkLE9BQU8sRUFBRTtBQUZTLEM7O0FBNFUxQjtBQUNPLE1BQU0wRSxTQUFTLEdBQUcsVUFBQ0MsV0FBRCxFQUEyRjtFQUFBLElBQWxDeEMsYUFBa0MsdUVBQWxCLEVBQWtCO0VBQ2hILE1BQU1qQixJQUFJLEdBQUd5RCxXQUFXLENBQUN4RCxLQUFaLEdBQW9CeUQsTUFBTSxDQUFDQyxPQUEzQixHQUFxQyxDQUFsRDtFQUNBLElBQUk3RCxHQUFHLEdBQUcyRCxXQUFXLENBQUMzRCxHQUFaLEdBQW1CMkQsV0FBVyxDQUFDeEIsTUFBWixHQUFxQixDQUF4QyxHQUE2Q3lCLE1BQU0sQ0FBQ0UsT0FBOUQ7RUFDQTlELEdBQUcsSUFBSW1CLGFBQWEsR0FBRyxDQUF2QixDQUhnSCxDQUd0Rjs7RUFDMUIsT0FBTztJQUFFakIsSUFBRjtJQUFRRixHQUFSO0lBQWFtQjtFQUFiLENBQVA7QUFDSCxDQUxNOzs7O0FBV1A7QUFDQTtBQUNPLE1BQU00QyxXQUFXLEdBQUcsVUFDdkJKLFdBRHVCLEVBSVQ7RUFBQSxJQUZkMUMsV0FFYyx1RUFGQW5FLFdBQVcsQ0FBQzRFLElBRVo7RUFBQSxJQURkc0MsUUFDYyx1RUFESCxDQUNHO0VBQ2QsTUFBTUMsV0FBcUQsR0FBRztJQUFFaEQ7RUFBRixDQUE5RDtFQUVBLE1BQU1pRCxXQUFXLEdBQUdQLFdBQVcsQ0FBQ3hELEtBQVosR0FBb0J5RCxNQUFNLENBQUNDLE9BQS9DO0VBQ0EsTUFBTU0sWUFBWSxHQUFHUixXQUFXLENBQUMxRCxNQUFaLEdBQXFCMkQsTUFBTSxDQUFDRSxPQUFqRDtFQUNBLE1BQU1NLFNBQVMsR0FBR1QsV0FBVyxDQUFDM0QsR0FBWixHQUFrQjRELE1BQU0sQ0FBQ0UsT0FBM0MsQ0FMYyxDQU1kOztFQUNBRyxXQUFXLENBQUM5RCxLQUFaLEdBQW9CNEIsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkgsV0FBakIsR0FBK0JxQyxXQUFuRCxDQVBjLENBUWQ7O0VBQ0EsSUFBSUMsWUFBWSxHQUFHcEMsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkYsWUFBakIsR0FBZ0MsQ0FBbkQsRUFBc0Q7SUFDbERtQyxXQUFXLENBQUNqRSxHQUFaLEdBQWtCbUUsWUFBWSxHQUFHSCxRQUFqQztFQUNILENBRkQsTUFFTztJQUNIQyxXQUFXLENBQUNoRSxNQUFaLEdBQXNCOEIsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkYsWUFBakIsR0FBZ0NzQyxTQUFqQyxHQUE4Q0osUUFBbkU7RUFDSDs7RUFFRCxPQUFPQyxXQUFQO0FBQ0gsQ0FwQk0sQyxDQXNCUDtBQUNBOzs7OztBQUNPLE1BQU1JLFlBQVksR0FBRyxVQUN4QlYsV0FEd0IsRUFJVjtFQUFBLElBRmQxQyxXQUVjLHVFQUZBbkUsV0FBVyxDQUFDNEUsSUFFWjtFQUFBLElBRGRzQyxRQUNjLHVFQURILENBQ0c7RUFDZCxNQUFNQyxXQUFxRCxHQUFHO0lBQUVoRDtFQUFGLENBQTlEO0VBRUEsTUFBTXFELFVBQVUsR0FBR1gsV0FBVyxDQUFDekQsSUFBWixHQUFtQjBELE1BQU0sQ0FBQ0MsT0FBN0M7RUFDQSxNQUFNTSxZQUFZLEdBQUdSLFdBQVcsQ0FBQzFELE1BQVosR0FBcUIyRCxNQUFNLENBQUNFLE9BQWpEO0VBQ0EsTUFBTU0sU0FBUyxHQUFHVCxXQUFXLENBQUMzRCxHQUFaLEdBQWtCNEQsTUFBTSxDQUFDRSxPQUEzQyxDQUxjLENBTWQ7O0VBQ0FHLFdBQVcsQ0FBQy9ELElBQVosR0FBbUJvRSxVQUFuQixDQVBjLENBUWQ7O0VBQ0EsSUFBSUgsWUFBWSxHQUFHcEMsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkYsWUFBakIsR0FBZ0MsQ0FBbkQsRUFBc0Q7SUFDbERtQyxXQUFXLENBQUNqRSxHQUFaLEdBQWtCbUUsWUFBWSxHQUFHSCxRQUFqQztFQUNILENBRkQsTUFFTztJQUNIQyxXQUFXLENBQUNoRSxNQUFaLEdBQXNCOEIsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkYsWUFBakIsR0FBZ0NzQyxTQUFqQyxHQUE4Q0osUUFBbkU7RUFDSDs7RUFFRCxPQUFPQyxXQUFQO0FBQ0gsQ0FwQk0sQyxDQXNCUDtBQUNBOzs7OztBQUNPLE1BQU1NLGlCQUFpQixHQUFHLFVBQzdCWixXQUQ2QixFQUk1QjtFQUFBLElBRkQxQyxXQUVDLHVFQUZhbkUsV0FBVyxDQUFDNEUsSUFFekI7RUFBQSxJQUREc0MsUUFDQyx1RUFEVSxDQUNWO0VBQ0QsTUFBTUMsV0FBcUQsR0FBRztJQUFFaEQ7RUFBRixDQUE5RDtFQUVBLE1BQU1pRCxXQUFXLEdBQUdQLFdBQVcsQ0FBQ3hELEtBQVosR0FBb0J5RCxNQUFNLENBQUNDLE9BQS9DO0VBQ0EsTUFBTU0sWUFBWSxHQUFHUixXQUFXLENBQUMxRCxNQUFaLEdBQXFCMkQsTUFBTSxDQUFDRSxPQUFqRDtFQUNBLE1BQU1NLFNBQVMsR0FBR1QsV0FBVyxDQUFDM0QsR0FBWixHQUFrQjRELE1BQU0sQ0FBQ0UsT0FBM0MsQ0FMQyxDQU1EOztFQUNBRyxXQUFXLENBQUM5RCxLQUFaLEdBQW9CNEIsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkgsV0FBakIsR0FBK0JxQyxXQUFuRCxDQVBDLENBUUQ7O0VBQ0EsSUFBSUMsWUFBWSxHQUFHcEMsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkYsWUFBakIsR0FBZ0MsQ0FBbkQsRUFBc0Q7SUFDbERtQyxXQUFXLENBQUNqRSxHQUFaLEdBQWtCbUUsWUFBWSxHQUFHSCxRQUFqQztFQUNILENBRkQsTUFFTztJQUNIQyxXQUFXLENBQUNoRSxNQUFaLEdBQXNCOEIsZ0JBQUEsQ0FBUUMsUUFBUixDQUFpQkYsWUFBakIsR0FBZ0NzQyxTQUFqQyxHQUE4Q0osUUFBbkU7RUFDSDs7RUFFRCxPQUFPQyxXQUFQO0FBQ0gsQ0FwQk0sQyxDQXNCUDtBQUNBOzs7OztBQUNPLE1BQU1PLGtCQUFrQixHQUFHLFVBQzlCYixXQUQ4QixFQUk3QjtFQUFBLElBRkQxQyxXQUVDLHVFQUZhbkUsV0FBVyxDQUFDNEUsSUFFekI7RUFBQSxJQUREc0MsUUFDQyx1RUFEVSxDQUNWO0VBQ0QsTUFBTUMsV0FBcUQsR0FBRztJQUFFaEQ7RUFBRixDQUE5RDtFQUVBLE1BQU1xRCxVQUFVLEdBQUdYLFdBQVcsQ0FBQ3pELElBQVosR0FBbUIwRCxNQUFNLENBQUNDLE9BQTdDO0VBQ0EsTUFBTU8sU0FBUyxHQUFHVCxXQUFXLENBQUMzRCxHQUFaLEdBQWtCNEQsTUFBTSxDQUFDRSxPQUEzQyxDQUpDLENBS0Q7O0VBQ0FHLFdBQVcsQ0FBQy9ELElBQVosR0FBbUJvRSxVQUFuQixDQU5DLENBT0Q7O0VBQ0FMLFdBQVcsQ0FBQ2hFLE1BQVosR0FBc0I4QixnQkFBQSxDQUFRQyxRQUFSLENBQWlCRixZQUFqQixHQUFnQ3NDLFNBQWpDLEdBQThDSixRQUFuRTtFQUVBLE9BQU9DLFdBQVA7QUFDSCxDQWZNOzs7O0FBd0JQO0FBQ08sTUFBTVEsY0FBYyxHQUFHLE1BQXdEO0VBQ2xGLE1BQU1qRyxNQUFNLEdBQUcsSUFBQWtHLGFBQUEsRUFBVSxJQUFWLENBQWY7RUFDQSxNQUFNLENBQUNDLE1BQUQsRUFBU0MsU0FBVCxJQUFzQixJQUFBQyxlQUFBLEVBQVMsS0FBVCxDQUE1Qjs7RUFDQSxNQUFNQyxJQUFJLEdBQUlsRyxFQUFELElBQXlCO0lBQ2xDQSxFQUFFLEVBQUVmLGNBQUo7SUFDQWUsRUFBRSxFQUFFZCxlQUFKO0lBQ0E4RyxTQUFTLENBQUMsSUFBRCxDQUFUO0VBQ0gsQ0FKRDs7RUFLQSxNQUFNRyxLQUFLLEdBQUluRyxFQUFELElBQXlCO0lBQ25DQSxFQUFFLEVBQUVmLGNBQUo7SUFDQWUsRUFBRSxFQUFFZCxlQUFKO0lBQ0E4RyxTQUFTLENBQUMsS0FBRCxDQUFUO0VBQ0gsQ0FKRDs7RUFNQSxPQUFPLENBQUNELE1BQUQsRUFBU25HLE1BQVQsRUFBaUJzRyxJQUFqQixFQUF1QkMsS0FBdkIsRUFBOEJILFNBQTlCLENBQVA7QUFDSCxDQWZNLEMsQ0FpQlA7Ozs7O0FBQ08sU0FBU0ksVUFBVCxDQUFvQkMsWUFBcEIsRUFBa0M5SCxLQUFsQyxFQUF5QztFQUM1QyxNQUFNUyxVQUFVLEdBQUcsWUFBa0I7SUFDakM0RixpQkFBQSxDQUFTMEIsc0JBQVQsQ0FBZ0M1SSxvQkFBb0IsRUFBcEQ7O0lBRGlDLGtDQUFONkksSUFBTTtNQUFOQSxJQUFNO0lBQUE7O0lBRWpDaEksS0FBSyxFQUFFUyxVQUFQLEVBQW1Cd0gsS0FBbkIsQ0FBeUIsSUFBekIsRUFBK0JELElBQS9CO0VBQ0gsQ0FIRDs7RUFLQSxNQUFNRSxJQUFJLGdCQUFHLDZCQUFDLFdBQUQsNkJBQ0xsSSxLQURLO0lBRVQsWUFBWSxFQUFFLElBRkw7SUFHVCxhQUFhLEVBQUUsS0FITjtJQUlULFVBQVUsRUFBRVMsVUFKSCxDQUllO0lBSmY7SUFLVCxZQUFZLEVBQUVBLFVBTEwsQ0FLaUI7O0VBTGpCLGlCQU9ULDZCQUFDLFlBQUQsNkJBQWtCVCxLQUFsQjtJQUF5QixVQUFVLEVBQUVTO0VBQXJDLEdBUFMsQ0FBYjs7RUFVQTRGLGlCQUFBLENBQVNGLE1BQVQsQ0FBZ0IrQixJQUFoQixFQUFzQi9JLG9CQUFvQixFQUExQzs7RUFFQSxPQUFPO0lBQUV5SSxLQUFLLEVBQUVuSDtFQUFULENBQVA7QUFDSCxDLENBRUQifQ==