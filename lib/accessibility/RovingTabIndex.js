"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "RovingAccessibleButton", {
  enumerable: true,
  get: function () {
    return _RovingAccessibleButton.RovingAccessibleButton;
  }
});
Object.defineProperty(exports, "RovingAccessibleTooltipButton", {
  enumerable: true,
  get: function () {
    return _RovingAccessibleTooltipButton.RovingAccessibleTooltipButton;
  }
});
exports.RovingTabIndexProvider = exports.RovingTabIndexContext = void 0;
Object.defineProperty(exports, "RovingTabIndexWrapper", {
  enumerable: true,
  get: function () {
    return _RovingTabIndexWrapper.RovingTabIndexWrapper;
  }
});
exports.Type = void 0;
exports.checkInputableElement = checkInputableElement;
exports.useRovingTabIndex = exports.reducer = exports.findSiblingElement = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _KeyBindingsManager = require("../KeyBindingsManager");

var _KeyboardShortcuts = require("./KeyboardShortcuts");

var _RovingTabIndexWrapper = require("./roving/RovingTabIndexWrapper");

var _RovingAccessibleButton = require("./roving/RovingAccessibleButton");

var _RovingAccessibleTooltipButton = require("./roving/RovingAccessibleTooltipButton");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Module to simplify implementing the Roving TabIndex accessibility technique
 *
 * Wrap the Widget in an RovingTabIndexContextProvider
 * and then for all buttons make use of useRovingTabIndex or RovingTabIndexWrapper.
 * The code will keep track of which tabIndex was most recently focused and expose that information as `isActive` which
 * can then be used to only set the tabIndex to 0 as expected by the roving tabindex technique.
 * When the active button gets unmounted the closest button will be chosen as expected.
 * Initially the first button to mount will be given active state.
 *
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_Roving_tabindex
 */
// Check for form elements which utilize the arrow keys for native functions
// like many of the text input varieties.
//
// i.e. it's ok to press the down arrow on a radio button to move to the next
// radio. But it's not ok to press the down arrow on a <input type="text"> to
// move away because the down arrow should move the cursor to the end of the
// input.
function checkInputableElement(el) {
  return el.matches('input:not([type="radio"]):not([type="checkbox"]), textarea, select, [contenteditable=true]');
}

const RovingTabIndexContext = /*#__PURE__*/(0, _react.createContext)({
  state: {
    activeRef: null,
    refs: [] // list of refs in DOM order

  },
  dispatch: () => {}
});
exports.RovingTabIndexContext = RovingTabIndexContext;
RovingTabIndexContext.displayName = "RovingTabIndexContext";
let Type;
exports.Type = Type;

(function (Type) {
  Type["Register"] = "REGISTER";
  Type["Unregister"] = "UNREGISTER";
  Type["SetFocus"] = "SET_FOCUS";
})(Type || (exports.Type = Type = {}));

const reducer = (state, action) => {
  switch (action.type) {
    case Type.Register:
      {
        if (!state.activeRef) {
          // Our list of refs was empty, set activeRef to this first item
          state.activeRef = action.payload.ref;
        } // Sadly due to the potential of DOM elements swapping order we can't do anything fancy like a binary insert


        state.refs.push(action.payload.ref);
        state.refs.sort((a, b) => {
          if (a === b) {
            return 0;
          }

          const position = a.current.compareDocumentPosition(b.current);

          if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
            return -1;
          } else if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
            return 1;
          } else {
            return 0;
          }
        });
        return _objectSpread({}, state);
      }

    case Type.Unregister:
      {
        const oldIndex = state.refs.findIndex(r => r === action.payload.ref);

        if (oldIndex === -1) {
          return state; // already removed, this should not happen
        }

        if (state.refs.splice(oldIndex, 1)[0] === state.activeRef) {
          // we just removed the active ref, need to replace it
          // pick the ref closest to the index the old ref was in
          if (oldIndex >= state.refs.length) {
            state.activeRef = findSiblingElement(state.refs, state.refs.length - 1, true);
          } else {
            state.activeRef = findSiblingElement(state.refs, oldIndex) || findSiblingElement(state.refs, oldIndex, true);
          }

          if (document.activeElement === document.body) {
            // if the focus got reverted to the body then the user was likely focused on the unmounted element
            state.activeRef?.current?.focus();
          }
        } // update the refs list


        return _objectSpread({}, state);
      }

    case Type.SetFocus:
      {
        // if the ref doesn't change just return the same object reference to skip a re-render
        if (state.activeRef === action.payload.ref) return state; // update active ref

        state.activeRef = action.payload.ref;
        return _objectSpread({}, state);
      }

    default:
      return state;
  }
};

exports.reducer = reducer;

const findSiblingElement = function (refs, startIndex) {
  let backwards = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (backwards) {
    for (let i = startIndex; i < refs.length && i >= 0; i--) {
      if (refs[i].current?.offsetParent !== null) {
        return refs[i];
      }
    }
  } else {
    for (let i = startIndex; i < refs.length && i >= 0; i++) {
      if (refs[i].current?.offsetParent !== null) {
        return refs[i];
      }
    }
  }
};

exports.findSiblingElement = findSiblingElement;

const RovingTabIndexProvider = _ref => {
  let {
    children,
    handleHomeEnd,
    handleUpDown,
    handleLeftRight,
    onKeyDown
  } = _ref;
  const [state, dispatch] = (0, _react.useReducer)(reducer, {
    activeRef: null,
    refs: []
  });
  const context = (0, _react.useMemo)(() => ({
    state,
    dispatch
  }), [state]);
  const onKeyDownHandler = (0, _react.useCallback)(ev => {
    if (onKeyDown) {
      onKeyDown(ev, context.state);

      if (ev.defaultPrevented) {
        return;
      }
    }

    let handled = false;
    const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);
    let focusRef; // Don't interfere with input default keydown behaviour
    // but allow people to move focus from it with Tab.

    if (checkInputableElement(ev.target)) {
      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Tab:
          handled = true;

          if (context.state.refs.length > 0) {
            const idx = context.state.refs.indexOf(context.state.activeRef);
            focusRef = findSiblingElement(context.state.refs, idx + (ev.shiftKey ? -1 : 1), ev.shiftKey);
          }

          break;
      }
    } else {
      // check if we actually have any items
      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Home:
          if (handleHomeEnd) {
            handled = true; // move focus to first (visible) item

            focusRef = findSiblingElement(context.state.refs, 0);
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.End:
          if (handleHomeEnd) {
            handled = true; // move focus to last (visible) item

            focusRef = findSiblingElement(context.state.refs, context.state.refs.length - 1, true);
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.ArrowDown:
        case _KeyboardShortcuts.KeyBindingAction.ArrowRight:
          if (action === _KeyboardShortcuts.KeyBindingAction.ArrowDown && handleUpDown || action === _KeyboardShortcuts.KeyBindingAction.ArrowRight && handleLeftRight) {
            handled = true;

            if (context.state.refs.length > 0) {
              const idx = context.state.refs.indexOf(context.state.activeRef);
              focusRef = findSiblingElement(context.state.refs, idx + 1);
            }
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.ArrowUp:
        case _KeyboardShortcuts.KeyBindingAction.ArrowLeft:
          if (action === _KeyboardShortcuts.KeyBindingAction.ArrowUp && handleUpDown || action === _KeyboardShortcuts.KeyBindingAction.ArrowLeft && handleLeftRight) {
            handled = true;

            if (context.state.refs.length > 0) {
              const idx = context.state.refs.indexOf(context.state.activeRef);
              focusRef = findSiblingElement(context.state.refs, idx - 1, true);
            }
          }

          break;
      }
    }

    if (handled) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    if (focusRef) {
      focusRef.current?.focus(); // programmatic focus doesn't fire the onFocus handler, so we must do the do ourselves

      dispatch({
        type: Type.SetFocus,
        payload: {
          ref: focusRef
        }
      });
    }
  }, [context, onKeyDown, handleHomeEnd, handleUpDown, handleLeftRight]);
  return /*#__PURE__*/_react.default.createElement(RovingTabIndexContext.Provider, {
    value: context
  }, children({
    onKeyDownHandler
  }));
}; // Hook to register a roving tab index
// inputRef parameter specifies the ref to use
// onFocus should be called when the index gained focus in any manner
// isActive should be used to set tabIndex in a manner such as `tabIndex={isActive ? 0 : -1}`
// ref should be passed to a DOM node which will be used for DOM compareDocumentPosition


exports.RovingTabIndexProvider = RovingTabIndexProvider;

const useRovingTabIndex = inputRef => {
  const context = (0, _react.useContext)(RovingTabIndexContext);
  let ref = (0, _react.useRef)(null);

  if (inputRef) {
    // if we are given a ref, use it instead of ours
    ref = inputRef;
  } // setup (after refs)


  (0, _react.useLayoutEffect)(() => {
    context.dispatch({
      type: Type.Register,
      payload: {
        ref
      }
    }); // teardown

    return () => {
      context.dispatch({
        type: Type.Unregister,
        payload: {
          ref
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onFocus = (0, _react.useCallback)(() => {
    context.dispatch({
      type: Type.SetFocus,
      payload: {
        ref
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = context.state.activeRef === ref;
  return [onFocus, isActive, ref];
}; // re-export the semantic helper components for simplicity


exports.useRovingTabIndex = useRovingTabIndex;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGVja0lucHV0YWJsZUVsZW1lbnQiLCJlbCIsIm1hdGNoZXMiLCJSb3ZpbmdUYWJJbmRleENvbnRleHQiLCJjcmVhdGVDb250ZXh0Iiwic3RhdGUiLCJhY3RpdmVSZWYiLCJyZWZzIiwiZGlzcGF0Y2giLCJkaXNwbGF5TmFtZSIsIlR5cGUiLCJyZWR1Y2VyIiwiYWN0aW9uIiwidHlwZSIsIlJlZ2lzdGVyIiwicGF5bG9hZCIsInJlZiIsInB1c2giLCJzb3J0IiwiYSIsImIiLCJwb3NpdGlvbiIsImN1cnJlbnQiLCJjb21wYXJlRG9jdW1lbnRQb3NpdGlvbiIsIk5vZGUiLCJET0NVTUVOVF9QT1NJVElPTl9GT0xMT1dJTkciLCJET0NVTUVOVF9QT1NJVElPTl9DT05UQUlORURfQlkiLCJET0NVTUVOVF9QT1NJVElPTl9QUkVDRURJTkciLCJET0NVTUVOVF9QT1NJVElPTl9DT05UQUlOUyIsIlVucmVnaXN0ZXIiLCJvbGRJbmRleCIsImZpbmRJbmRleCIsInIiLCJzcGxpY2UiLCJsZW5ndGgiLCJmaW5kU2libGluZ0VsZW1lbnQiLCJkb2N1bWVudCIsImFjdGl2ZUVsZW1lbnQiLCJib2R5IiwiZm9jdXMiLCJTZXRGb2N1cyIsInN0YXJ0SW5kZXgiLCJiYWNrd2FyZHMiLCJpIiwib2Zmc2V0UGFyZW50IiwiUm92aW5nVGFiSW5kZXhQcm92aWRlciIsImNoaWxkcmVuIiwiaGFuZGxlSG9tZUVuZCIsImhhbmRsZVVwRG93biIsImhhbmRsZUxlZnRSaWdodCIsIm9uS2V5RG93biIsInVzZVJlZHVjZXIiLCJjb250ZXh0IiwidXNlTWVtbyIsIm9uS2V5RG93bkhhbmRsZXIiLCJ1c2VDYWxsYmFjayIsImV2IiwiZGVmYXVsdFByZXZlbnRlZCIsImhhbmRsZWQiLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRBY2Nlc3NpYmlsaXR5QWN0aW9uIiwiZm9jdXNSZWYiLCJ0YXJnZXQiLCJLZXlCaW5kaW5nQWN0aW9uIiwiVGFiIiwiaWR4IiwiaW5kZXhPZiIsInNoaWZ0S2V5IiwiSG9tZSIsIkVuZCIsIkFycm93RG93biIsIkFycm93UmlnaHQiLCJBcnJvd1VwIiwiQXJyb3dMZWZ0IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJ1c2VSb3ZpbmdUYWJJbmRleCIsImlucHV0UmVmIiwidXNlQ29udGV4dCIsInVzZVJlZiIsInVzZUxheW91dEVmZmVjdCIsIm9uRm9jdXMiLCJpc0FjdGl2ZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L1JvdmluZ1RhYkluZGV4LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtcbiAgICBjcmVhdGVDb250ZXh0LFxuICAgIHVzZUNhbGxiYWNrLFxuICAgIHVzZUNvbnRleHQsXG4gICAgdXNlTGF5b3V0RWZmZWN0LFxuICAgIHVzZU1lbW8sXG4gICAgdXNlUmVmLFxuICAgIHVzZVJlZHVjZXIsXG4gICAgUmVkdWNlcixcbiAgICBEaXNwYXRjaCxcbiAgICBSZWZPYmplY3QsXG59IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4vS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCB7IEZvY3VzSGFuZGxlciwgUmVmIH0gZnJvbSBcIi4vcm92aW5nL3R5cGVzXCI7XG5cbi8qKlxuICogTW9kdWxlIHRvIHNpbXBsaWZ5IGltcGxlbWVudGluZyB0aGUgUm92aW5nIFRhYkluZGV4IGFjY2Vzc2liaWxpdHkgdGVjaG5pcXVlXG4gKlxuICogV3JhcCB0aGUgV2lkZ2V0IGluIGFuIFJvdmluZ1RhYkluZGV4Q29udGV4dFByb3ZpZGVyXG4gKiBhbmQgdGhlbiBmb3IgYWxsIGJ1dHRvbnMgbWFrZSB1c2Ugb2YgdXNlUm92aW5nVGFiSW5kZXggb3IgUm92aW5nVGFiSW5kZXhXcmFwcGVyLlxuICogVGhlIGNvZGUgd2lsbCBrZWVwIHRyYWNrIG9mIHdoaWNoIHRhYkluZGV4IHdhcyBtb3N0IHJlY2VudGx5IGZvY3VzZWQgYW5kIGV4cG9zZSB0aGF0IGluZm9ybWF0aW9uIGFzIGBpc0FjdGl2ZWAgd2hpY2hcbiAqIGNhbiB0aGVuIGJlIHVzZWQgdG8gb25seSBzZXQgdGhlIHRhYkluZGV4IHRvIDAgYXMgZXhwZWN0ZWQgYnkgdGhlIHJvdmluZyB0YWJpbmRleCB0ZWNobmlxdWUuXG4gKiBXaGVuIHRoZSBhY3RpdmUgYnV0dG9uIGdldHMgdW5tb3VudGVkIHRoZSBjbG9zZXN0IGJ1dHRvbiB3aWxsIGJlIGNob3NlbiBhcyBleHBlY3RlZC5cbiAqIEluaXRpYWxseSB0aGUgZmlyc3QgYnV0dG9uIHRvIG1vdW50IHdpbGwgYmUgZ2l2ZW4gYWN0aXZlIHN0YXRlLlxuICpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FjY2Vzc2liaWxpdHkvS2V5Ym9hcmQtbmF2aWdhYmxlX0phdmFTY3JpcHRfd2lkZ2V0cyNUZWNobmlxdWVfMV9Sb3ZpbmdfdGFiaW5kZXhcbiAqL1xuXG4vLyBDaGVjayBmb3IgZm9ybSBlbGVtZW50cyB3aGljaCB1dGlsaXplIHRoZSBhcnJvdyBrZXlzIGZvciBuYXRpdmUgZnVuY3Rpb25zXG4vLyBsaWtlIG1hbnkgb2YgdGhlIHRleHQgaW5wdXQgdmFyaWV0aWVzLlxuLy9cbi8vIGkuZS4gaXQncyBvayB0byBwcmVzcyB0aGUgZG93biBhcnJvdyBvbiBhIHJhZGlvIGJ1dHRvbiB0byBtb3ZlIHRvIHRoZSBuZXh0XG4vLyByYWRpby4gQnV0IGl0J3Mgbm90IG9rIHRvIHByZXNzIHRoZSBkb3duIGFycm93IG9uIGEgPGlucHV0IHR5cGU9XCJ0ZXh0XCI+IHRvXG4vLyBtb3ZlIGF3YXkgYmVjYXVzZSB0aGUgZG93biBhcnJvdyBzaG91bGQgbW92ZSB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlXG4vLyBpbnB1dC5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lucHV0YWJsZUVsZW1lbnQoZWw6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsLm1hdGNoZXMoJ2lucHV0Om5vdChbdHlwZT1cInJhZGlvXCJdKTpub3QoW3R5cGU9XCJjaGVja2JveFwiXSksIHRleHRhcmVhLCBzZWxlY3QsIFtjb250ZW50ZWRpdGFibGU9dHJ1ZV0nKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3RhdGUge1xuICAgIGFjdGl2ZVJlZjogUmVmO1xuICAgIHJlZnM6IFJlZltdO1xufVxuXG5pbnRlcmZhY2UgSUNvbnRleHQge1xuICAgIHN0YXRlOiBJU3RhdGU7XG4gICAgZGlzcGF0Y2g6IERpc3BhdGNoPElBY3Rpb24+O1xufVxuXG5leHBvcnQgY29uc3QgUm92aW5nVGFiSW5kZXhDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxJQ29udGV4dD4oe1xuICAgIHN0YXRlOiB7XG4gICAgICAgIGFjdGl2ZVJlZjogbnVsbCxcbiAgICAgICAgcmVmczogW10sIC8vIGxpc3Qgb2YgcmVmcyBpbiBET00gb3JkZXJcbiAgICB9LFxuICAgIGRpc3BhdGNoOiAoKSA9PiB7fSxcbn0pO1xuUm92aW5nVGFiSW5kZXhDb250ZXh0LmRpc3BsYXlOYW1lID0gXCJSb3ZpbmdUYWJJbmRleENvbnRleHRcIjtcblxuZXhwb3J0IGVudW0gVHlwZSB7XG4gICAgUmVnaXN0ZXIgPSBcIlJFR0lTVEVSXCIsXG4gICAgVW5yZWdpc3RlciA9IFwiVU5SRUdJU1RFUlwiLFxuICAgIFNldEZvY3VzID0gXCJTRVRfRk9DVVNcIixcbn1cblxuaW50ZXJmYWNlIElBY3Rpb24ge1xuICAgIHR5cGU6IFR5cGU7XG4gICAgcGF5bG9hZDoge1xuICAgICAgICByZWY6IFJlZjtcbiAgICB9O1xufVxuXG5leHBvcnQgY29uc3QgcmVkdWNlciA9IChzdGF0ZTogSVN0YXRlLCBhY3Rpb246IElBY3Rpb24pID0+IHtcbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgICAgIGNhc2UgVHlwZS5SZWdpc3Rlcjoge1xuICAgICAgICAgICAgaWYgKCFzdGF0ZS5hY3RpdmVSZWYpIHtcbiAgICAgICAgICAgICAgICAvLyBPdXIgbGlzdCBvZiByZWZzIHdhcyBlbXB0eSwgc2V0IGFjdGl2ZVJlZiB0byB0aGlzIGZpcnN0IGl0ZW1cbiAgICAgICAgICAgICAgICBzdGF0ZS5hY3RpdmVSZWYgPSBhY3Rpb24ucGF5bG9hZC5yZWY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNhZGx5IGR1ZSB0byB0aGUgcG90ZW50aWFsIG9mIERPTSBlbGVtZW50cyBzd2FwcGluZyBvcmRlciB3ZSBjYW4ndCBkbyBhbnl0aGluZyBmYW5jeSBsaWtlIGEgYmluYXJ5IGluc2VydFxuICAgICAgICAgICAgc3RhdGUucmVmcy5wdXNoKGFjdGlvbi5wYXlsb2FkLnJlZik7XG4gICAgICAgICAgICBzdGF0ZS5yZWZzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGEuY3VycmVudC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihiLmN1cnJlbnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uICYgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9GT0xMT1dJTkcgfHwgcG9zaXRpb24gJiBOb2RlLkRPQ1VNRU5UX1BPU0lUSU9OX0NPTlRBSU5FRF9CWSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiAmIE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fUFJFQ0VESU5HIHx8IHBvc2l0aW9uICYgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9DT05UQUlOUykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHsgLi4uc3RhdGUgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgVHlwZS5VbnJlZ2lzdGVyOiB7XG4gICAgICAgICAgICBjb25zdCBvbGRJbmRleCA9IHN0YXRlLnJlZnMuZmluZEluZGV4KHIgPT4gciA9PT0gYWN0aW9uLnBheWxvYWQucmVmKTtcblxuICAgICAgICAgICAgaWYgKG9sZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZTsgLy8gYWxyZWFkeSByZW1vdmVkLCB0aGlzIHNob3VsZCBub3QgaGFwcGVuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZWZzLnNwbGljZShvbGRJbmRleCwgMSlbMF0gPT09IHN0YXRlLmFjdGl2ZVJlZikge1xuICAgICAgICAgICAgICAgIC8vIHdlIGp1c3QgcmVtb3ZlZCB0aGUgYWN0aXZlIHJlZiwgbmVlZCB0byByZXBsYWNlIGl0XG4gICAgICAgICAgICAgICAgLy8gcGljayB0aGUgcmVmIGNsb3Nlc3QgdG8gdGhlIGluZGV4IHRoZSBvbGQgcmVmIHdhcyBpblxuICAgICAgICAgICAgICAgIGlmIChvbGRJbmRleCA+PSBzdGF0ZS5yZWZzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5hY3RpdmVSZWYgPSBmaW5kU2libGluZ0VsZW1lbnQoc3RhdGUucmVmcywgc3RhdGUucmVmcy5sZW5ndGggLSAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5hY3RpdmVSZWYgPSBmaW5kU2libGluZ0VsZW1lbnQoc3RhdGUucmVmcywgb2xkSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBmaW5kU2libGluZ0VsZW1lbnQoc3RhdGUucmVmcywgb2xkSW5kZXgsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgZm9jdXMgZ290IHJldmVydGVkIHRvIHRoZSBib2R5IHRoZW4gdGhlIHVzZXIgd2FzIGxpa2VseSBmb2N1c2VkIG9uIHRoZSB1bm1vdW50ZWQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5hY3RpdmVSZWY/LmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHJlZnMgbGlzdFxuICAgICAgICAgICAgcmV0dXJuIHsgLi4uc3RhdGUgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgVHlwZS5TZXRGb2N1czoge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlZiBkb2Vzbid0IGNoYW5nZSBqdXN0IHJldHVybiB0aGUgc2FtZSBvYmplY3QgcmVmZXJlbmNlIHRvIHNraXAgYSByZS1yZW5kZXJcbiAgICAgICAgICAgIGlmIChzdGF0ZS5hY3RpdmVSZWYgPT09IGFjdGlvbi5wYXlsb2FkLnJlZikgcmV0dXJuIHN0YXRlO1xuICAgICAgICAgICAgLy8gdXBkYXRlIGFjdGl2ZSByZWZcbiAgICAgICAgICAgIHN0YXRlLmFjdGl2ZVJlZiA9IGFjdGlvbi5wYXlsb2FkLnJlZjtcbiAgICAgICAgICAgIHJldHVybiB7IC4uLnN0YXRlIH07XG4gICAgICAgIH1cblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbn07XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGhhbmRsZUhvbWVFbmQ/OiBib29sZWFuO1xuICAgIGhhbmRsZVVwRG93bj86IGJvb2xlYW47XG4gICAgaGFuZGxlTGVmdFJpZ2h0PzogYm9vbGVhbjtcbiAgICBjaGlsZHJlbihyZW5kZXJQcm9wczoge1xuICAgICAgICBvbktleURvd25IYW5kbGVyKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KTtcbiAgICB9KTtcbiAgICBvbktleURvd24/KGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50LCBzdGF0ZTogSVN0YXRlKTtcbn1cblxuZXhwb3J0IGNvbnN0IGZpbmRTaWJsaW5nRWxlbWVudCA9IChcbiAgICByZWZzOiBSZWZPYmplY3Q8SFRNTEVsZW1lbnQ+W10sXG4gICAgc3RhcnRJbmRleDogbnVtYmVyLFxuICAgIGJhY2t3YXJkcyA9IGZhbHNlLFxuKTogUmVmT2JqZWN0PEhUTUxFbGVtZW50PiA9PiB7XG4gICAgaWYgKGJhY2t3YXJkcykge1xuICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IHJlZnMubGVuZ3RoICYmIGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAocmVmc1tpXS5jdXJyZW50Py5vZmZzZXRQYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVmc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDwgcmVmcy5sZW5ndGggJiYgaSA+PSAwOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChyZWZzW2ldLmN1cnJlbnQ/Lm9mZnNldFBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWZzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IFJvdmluZ1RhYkluZGV4UHJvdmlkZXI6IFJlYWN0LkZDPElQcm9wcz4gPSAoe1xuICAgIGNoaWxkcmVuLFxuICAgIGhhbmRsZUhvbWVFbmQsXG4gICAgaGFuZGxlVXBEb3duLFxuICAgIGhhbmRsZUxlZnRSaWdodCxcbiAgICBvbktleURvd24sXG59KSA9PiB7XG4gICAgY29uc3QgW3N0YXRlLCBkaXNwYXRjaF0gPSB1c2VSZWR1Y2VyPFJlZHVjZXI8SVN0YXRlLCBJQWN0aW9uPj4ocmVkdWNlciwge1xuICAgICAgICBhY3RpdmVSZWY6IG51bGwsXG4gICAgICAgIHJlZnM6IFtdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgY29udGV4dCA9IHVzZU1lbW88SUNvbnRleHQ+KCgpID0+ICh7IHN0YXRlLCBkaXNwYXRjaCB9KSwgW3N0YXRlXSk7XG5cbiAgICBjb25zdCBvbktleURvd25IYW5kbGVyID0gdXNlQ2FsbGJhY2soKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvbktleURvd24pIHtcbiAgICAgICAgICAgIG9uS2V5RG93bihldiwgY29udGV4dC5zdGF0ZSk7XG4gICAgICAgICAgICBpZiAoZXYuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXYpO1xuICAgICAgICBsZXQgZm9jdXNSZWY6IFJlZk9iamVjdDxIVE1MRWxlbWVudD47XG4gICAgICAgIC8vIERvbid0IGludGVyZmVyZSB3aXRoIGlucHV0IGRlZmF1bHQga2V5ZG93biBiZWhhdmlvdXJcbiAgICAgICAgLy8gYnV0IGFsbG93IHBlb3BsZSB0byBtb3ZlIGZvY3VzIGZyb20gaXQgd2l0aCBUYWIuXG4gICAgICAgIGlmIChjaGVja0lucHV0YWJsZUVsZW1lbnQoZXYudGFyZ2V0IGFzIEhUTUxFbGVtZW50KSkge1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uVGFiOlxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuc3RhdGUucmVmcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBjb250ZXh0LnN0YXRlLnJlZnMuaW5kZXhPZihjb250ZXh0LnN0YXRlLmFjdGl2ZVJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c1JlZiA9IGZpbmRTaWJsaW5nRWxlbWVudChjb250ZXh0LnN0YXRlLnJlZnMsIGlkeCArIChldi5zaGlmdEtleSA/IC0xIDogMSksIGV2LnNoaWZ0S2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHdlIGFjdHVhbGx5IGhhdmUgYW55IGl0ZW1zXG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5Ib21lOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlSG9tZUVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtb3ZlIGZvY3VzIHRvIGZpcnN0ICh2aXNpYmxlKSBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c1JlZiA9IGZpbmRTaWJsaW5nRWxlbWVudChjb250ZXh0LnN0YXRlLnJlZnMsIDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVuZDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZUhvbWVFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbW92ZSBmb2N1cyB0byBsYXN0ICh2aXNpYmxlKSBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c1JlZiA9IGZpbmRTaWJsaW5nRWxlbWVudChjb250ZXh0LnN0YXRlLnJlZnMsIGNvbnRleHQuc3RhdGUucmVmcy5sZW5ndGggLSAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5BcnJvd0Rvd246XG4gICAgICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkFycm93UmlnaHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICgoYWN0aW9uID09PSBLZXlCaW5kaW5nQWN0aW9uLkFycm93RG93biAmJiBoYW5kbGVVcERvd24pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoYWN0aW9uID09PSBLZXlCaW5kaW5nQWN0aW9uLkFycm93UmlnaHQgJiYgaGFuZGxlTGVmdFJpZ2h0KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuc3RhdGUucmVmcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gY29udGV4dC5zdGF0ZS5yZWZzLmluZGV4T2YoY29udGV4dC5zdGF0ZS5hY3RpdmVSZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzUmVmID0gZmluZFNpYmxpbmdFbGVtZW50KGNvbnRleHQuc3RhdGUucmVmcywgaWR4ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uQXJyb3dVcDpcbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uQXJyb3dMZWZ0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoKGFjdGlvbiA9PT0gS2V5QmluZGluZ0FjdGlvbi5BcnJvd1VwICYmIGhhbmRsZVVwRG93bikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChhY3Rpb24gPT09IEtleUJpbmRpbmdBY3Rpb24uQXJyb3dMZWZ0ICYmIGhhbmRsZUxlZnRSaWdodClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LnN0YXRlLnJlZnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IGNvbnRleHQuc3RhdGUucmVmcy5pbmRleE9mKGNvbnRleHQuc3RhdGUuYWN0aXZlUmVmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1c1JlZiA9IGZpbmRTaWJsaW5nRWxlbWVudChjb250ZXh0LnN0YXRlLnJlZnMsIGlkeCAtIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmb2N1c1JlZikge1xuICAgICAgICAgICAgZm9jdXNSZWYuY3VycmVudD8uZm9jdXMoKTtcbiAgICAgICAgICAgIC8vIHByb2dyYW1tYXRpYyBmb2N1cyBkb2Vzbid0IGZpcmUgdGhlIG9uRm9jdXMgaGFuZGxlciwgc28gd2UgbXVzdCBkbyB0aGUgZG8gb3Vyc2VsdmVzXG4gICAgICAgICAgICBkaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVHlwZS5TZXRGb2N1cyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgICAgIHJlZjogZm9jdXNSZWYsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2NvbnRleHQsIG9uS2V5RG93biwgaGFuZGxlSG9tZUVuZCwgaGFuZGxlVXBEb3duLCBoYW5kbGVMZWZ0UmlnaHRdKTtcblxuICAgIHJldHVybiA8Um92aW5nVGFiSW5kZXhDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtjb250ZXh0fT5cbiAgICAgICAgeyBjaGlsZHJlbih7IG9uS2V5RG93bkhhbmRsZXIgfSkgfVxuICAgIDwvUm92aW5nVGFiSW5kZXhDb250ZXh0LlByb3ZpZGVyPjtcbn07XG5cbi8vIEhvb2sgdG8gcmVnaXN0ZXIgYSByb3ZpbmcgdGFiIGluZGV4XG4vLyBpbnB1dFJlZiBwYXJhbWV0ZXIgc3BlY2lmaWVzIHRoZSByZWYgdG8gdXNlXG4vLyBvbkZvY3VzIHNob3VsZCBiZSBjYWxsZWQgd2hlbiB0aGUgaW5kZXggZ2FpbmVkIGZvY3VzIGluIGFueSBtYW5uZXJcbi8vIGlzQWN0aXZlIHNob3VsZCBiZSB1c2VkIHRvIHNldCB0YWJJbmRleCBpbiBhIG1hbm5lciBzdWNoIGFzIGB0YWJJbmRleD17aXNBY3RpdmUgPyAwIDogLTF9YFxuLy8gcmVmIHNob3VsZCBiZSBwYXNzZWQgdG8gYSBET00gbm9kZSB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIERPTSBjb21wYXJlRG9jdW1lbnRQb3NpdGlvblxuZXhwb3J0IGNvbnN0IHVzZVJvdmluZ1RhYkluZGV4ID0gPFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4oXG4gICAgaW5wdXRSZWY/OiBSZWZPYmplY3Q8VD4sXG4pOiBbRm9jdXNIYW5kbGVyLCBib29sZWFuLCBSZWZPYmplY3Q8VD5dID0+IHtcbiAgICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChSb3ZpbmdUYWJJbmRleENvbnRleHQpO1xuICAgIGxldCByZWYgPSB1c2VSZWY8VD4obnVsbCk7XG5cbiAgICBpZiAoaW5wdXRSZWYpIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIGdpdmVuIGEgcmVmLCB1c2UgaXQgaW5zdGVhZCBvZiBvdXJzXG4gICAgICAgIHJlZiA9IGlucHV0UmVmO1xuICAgIH1cblxuICAgIC8vIHNldHVwIChhZnRlciByZWZzKVxuICAgIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogVHlwZS5SZWdpc3RlcixcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgcmVmIH0sXG4gICAgICAgIH0pO1xuICAgICAgICAvLyB0ZWFyZG93blxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY29udGV4dC5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVHlwZS5VbnJlZ2lzdGVyLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgcmVmIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9LCBbXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgICBjb25zdCBvbkZvY3VzID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBjb250ZXh0LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IFR5cGUuU2V0Rm9jdXMsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IHJlZiB9LFxuICAgICAgICB9KTtcbiAgICB9LCBbXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgICBjb25zdCBpc0FjdGl2ZSA9IGNvbnRleHQuc3RhdGUuYWN0aXZlUmVmID09PSByZWY7XG4gICAgcmV0dXJuIFtvbkZvY3VzLCBpc0FjdGl2ZSwgcmVmXTtcbn07XG5cbi8vIHJlLWV4cG9ydCB0aGUgc2VtYW50aWMgaGVscGVyIGNvbXBvbmVudHMgZm9yIHNpbXBsaWNpdHlcbmV4cG9ydCB7IFJvdmluZ1RhYkluZGV4V3JhcHBlciB9IGZyb20gXCIuL3JvdmluZy9Sb3ZpbmdUYWJJbmRleFdyYXBwZXJcIjtcbmV4cG9ydCB7IFJvdmluZ0FjY2Vzc2libGVCdXR0b24gfSBmcm9tIFwiLi9yb3ZpbmcvUm92aW5nQWNjZXNzaWJsZUJ1dHRvblwiO1xuZXhwb3J0IHsgUm92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gfSBmcm9tIFwiLi9yb3Zpbmcv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