"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _languageHandler = require("../../../languageHandler");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2017 - 2021 The Matrix.org Foundation C.I.C.

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
class MenuOption extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onMouseEnter", () => {
      this.props.onMouseEnter(this.props.dropdownKey);
    });
    (0, _defineProperty2.default)(this, "onClick", e => {
      e.preventDefault();
      e.stopPropagation();
      this.props.onClick(this.props.dropdownKey);
    });
  }

  render() {
    const optClasses = (0, _classnames.default)({
      mx_Dropdown_option: true,
      mx_Dropdown_option_highlight: this.props.highlighted
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      id: this.props.id,
      className: optClasses,
      onClick: this.onClick,
      onMouseEnter: this.onMouseEnter,
      role: "option",
      "aria-selected": this.props.highlighted,
      ref: this.props.inputRef
    }, this.props.children);
  }

}

(0, _defineProperty2.default)(MenuOption, "defaultProps", {
  disabled: false
});

/*
 * Reusable dropdown select control, akin to react-select,
 * but somewhat simpler as react-select is 79KB of minified
 * javascript.
 */
class Dropdown extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "buttonRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "dropdownRootElement", null);
    (0, _defineProperty2.default)(this, "ignoreEvent", null);
    (0, _defineProperty2.default)(this, "childrenByKey", {});
    (0, _defineProperty2.default)(this, "onDocumentClick", ev => {
      // Close the dropdown if the user clicks anywhere that isn't
      // within our root element
      if (ev !== this.ignoreEvent) {
        this.setState({
          expanded: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRootClick", ev => {
      // This captures any clicks that happen within our elements,
      // such that we can then ignore them when they're seen by the
      // click listener on the document handler, ie. not close the
      // dropdown immediately after opening it.
      // NB. We can't just stopPropagation() because then the event
      // doesn't reach the React onClick().
      this.ignoreEvent = ev;
    });
    (0, _defineProperty2.default)(this, "onAccessibleButtonClick", ev => {
      if (this.props.disabled) return;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      if (!this.state.expanded) {
        this.setState({
          expanded: true
        });
        ev.preventDefault();
      } else if (action === _KeyboardShortcuts.KeyBindingAction.Enter) {
        // the accessible button consumes enter onKeyDown for firing onClick, so handle it here
        this.props.onOptionChange(this.state.highlightedOption);
        this.close();
      } else if (!ev.key) {
        // collapse on other non-keyboard event activations
        this.setState({
          expanded: false
        });
        ev.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onMenuOptionClick", dropdownKey => {
      this.close();
      this.props.onOptionChange(dropdownKey);
    });
    (0, _defineProperty2.default)(this, "onKeyDown", e => {
      let handled = true; // These keys don't generate keypress events and so needs to be on keyup

      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(e);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Enter:
          this.props.onOptionChange(this.state.highlightedOption);
        // fallthrough

        case _KeyboardShortcuts.KeyBindingAction.Escape:
          this.close();
          break;

        case _KeyboardShortcuts.KeyBindingAction.ArrowDown:
          if (this.state.expanded) {
            this.setState({
              highlightedOption: this.nextOption(this.state.highlightedOption)
            });
          } else {
            this.setState({
              expanded: true
            });
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.ArrowUp:
          if (this.state.expanded) {
            this.setState({
              highlightedOption: this.prevOption(this.state.highlightedOption)
            });
          } else {
            this.setState({
              expanded: true
            });
          }

          break;

        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    (0, _defineProperty2.default)(this, "onInputChange", e => {
      this.setState({
        searchQuery: e.currentTarget.value
      });

      if (this.props.onSearchChange) {
        this.props.onSearchChange(e.currentTarget.value);
      }
    });
    (0, _defineProperty2.default)(this, "collectRoot", e => {
      if (this.dropdownRootElement) {
        this.dropdownRootElement.removeEventListener('click', this.onRootClick, false);
      }

      if (e) {
        e.addEventListener('click', this.onRootClick, false);
      }

      this.dropdownRootElement = e;
    });
    (0, _defineProperty2.default)(this, "setHighlightedOption", optionKey => {
      this.setState({
        highlightedOption: optionKey
      });
    });
    this.reindexChildren(this.props.children);

    const firstChild = _react.default.Children.toArray(props.children)[0];

    this.state = {
      // True if the menu is dropped-down
      expanded: false,
      // The key of the highlighted option
      // (the option that would become selected if you pressed enter)
      highlightedOption: firstChild ? firstChild.key : null,
      // the current search query
      searchQuery: ''
    }; // Listen for all clicks on the document so we can close the
    // menu when the user clicks somewhere else

    document.addEventListener('click', this.onDocumentClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onDocumentClick, false);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event


  UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line
    if (!nextProps.children || nextProps.children.length === 0) {
      return;
    }

    this.reindexChildren(nextProps.children);
    const firstChild = nextProps.children[0];
    this.setState({
      highlightedOption: firstChild ? firstChild.key : null
    });
  }

  reindexChildren(children) {
    this.childrenByKey = {};

    _react.default.Children.forEach(children, child => {
      this.childrenByKey[child.key] = child;
    });
  }

  close() {
    this.setState({
      expanded: false
    }); // their focus was on the input, its getting unmounted, move it to the button

    if (this.buttonRef.current) {
      this.buttonRef.current.focus();
    }
  }

  nextOption(optionKey) {
    const keys = Object.keys(this.childrenByKey);
    const index = keys.indexOf(optionKey);
    return keys[(index + 1) % keys.length];
  }

  prevOption(optionKey) {
    const keys = Object.keys(this.childrenByKey);
    const index = keys.indexOf(optionKey);
    return keys[index <= 0 ? keys.length - 1 : (index - 1) % keys.length];
  }

  scrollIntoView(node) {
    if (node) {
      node.scrollIntoView({
        block: "nearest",
        behavior: "auto"
      });
    }
  }

  getMenuOptions() {
    const options = _react.default.Children.map(this.props.children, child => {
      const highlighted = this.state.highlightedOption === child.key;
      return /*#__PURE__*/_react.default.createElement(MenuOption, {
        id: `${this.props.id}__${child.key}`,
        key: child.key,
        dropdownKey: child.key,
        highlighted: highlighted,
        onMouseEnter: this.setHighlightedOption,
        onClick: this.onMenuOptionClick,
        inputRef: highlighted ? this.scrollIntoView : undefined
      }, child);
    });

    if (options.length === 0) {
      return [/*#__PURE__*/_react.default.createElement("div", {
        key: "0",
        className: "mx_Dropdown_option",
        role: "option",
        "aria-selected": false
      }, (0, _languageHandler._t)("No results"))];
    }

    return options;
  }

  render() {
    let currentValue;
    const menuStyle = {};
    if (this.props.menuWidth) menuStyle.width = this.props.menuWidth;
    let menu;

    if (this.state.expanded) {
      if (this.props.searchEnabled) {
        currentValue = /*#__PURE__*/_react.default.createElement("input", {
          id: `${this.props.id}_input`,
          type: "text",
          autoFocus: true,
          className: "mx_Dropdown_option",
          onChange: this.onInputChange,
          value: this.state.searchQuery,
          role: "combobox",
          "aria-autocomplete": "list",
          "aria-activedescendant": `${this.props.id}__${this.state.highlightedOption}`,
          "aria-expanded": this.state.expanded,
          "aria-controls": `${this.props.id}_listbox`,
          "aria-disabled": this.props.disabled,
          "aria-label": this.props.label,
          onKeyDown: this.onKeyDown
        });
      }

      menu = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dropdown_menu",
        style: menuStyle,
        role: "listbox",
        id: `${this.props.id}_listbox`
      }, this.getMenuOptions());
    }

    if (!currentValue) {
      const selectedChild = this.props.getShortOption ? this.props.getShortOption(this.props.value) : this.childrenByKey[this.props.value];
      currentValue = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dropdown_option",
        id: `${this.props.id}_value`
      }, selectedChild || this.props.placeholder);
    }

    const dropdownClasses = {
      mx_Dropdown: true,
      mx_Dropdown_disabled: this.props.disabled
    };

    if (this.props.className) {
      dropdownClasses[this.props.className] = true;
    } // Note the menu sits inside the AccessibleButton div so it's anchored
    // to the input, but overflows below it. The root contains both.


    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)(dropdownClasses),
      ref: this.collectRoot
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_Dropdown_input mx_no_textinput",
      onClick: this.onAccessibleButtonClick,
      "aria-haspopup": "listbox",
      "aria-expanded": this.state.expanded,
      disabled: this.props.disabled,
      inputRef: this.buttonRef,
      "aria-label": this.props.label,
      "aria-describedby": `${this.props.id}_value`,
      "aria-owns": `${this.props.id}_input`,
      onKeyDown: this.onKeyDown
    }, currentValue, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_Dropdown_arrow"
    }), menu));
  }

}

exports.default = Dropdown;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZW51T3B0aW9uIiwiUmVhY3QiLCJDb21wb25lbnQiLCJwcm9wcyIsIm9uTW91c2VFbnRlciIsImRyb3Bkb3duS2V5IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwib25DbGljayIsInJlbmRlciIsIm9wdENsYXNzZXMiLCJjbGFzc25hbWVzIiwibXhfRHJvcGRvd25fb3B0aW9uIiwibXhfRHJvcGRvd25fb3B0aW9uX2hpZ2hsaWdodCIsImhpZ2hsaWdodGVkIiwiaWQiLCJpbnB1dFJlZiIsImNoaWxkcmVuIiwiZGlzYWJsZWQiLCJEcm9wZG93biIsImNvbnN0cnVjdG9yIiwiY3JlYXRlUmVmIiwiZXYiLCJpZ25vcmVFdmVudCIsInNldFN0YXRlIiwiZXhwYW5kZWQiLCJhY3Rpb24iLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRBY2Nlc3NpYmlsaXR5QWN0aW9uIiwic3RhdGUiLCJLZXlCaW5kaW5nQWN0aW9uIiwiRW50ZXIiLCJvbk9wdGlvbkNoYW5nZSIsImhpZ2hsaWdodGVkT3B0aW9uIiwiY2xvc2UiLCJrZXkiLCJoYW5kbGVkIiwiRXNjYXBlIiwiQXJyb3dEb3duIiwibmV4dE9wdGlvbiIsIkFycm93VXAiLCJwcmV2T3B0aW9uIiwic2VhcmNoUXVlcnkiLCJjdXJyZW50VGFyZ2V0IiwidmFsdWUiLCJvblNlYXJjaENoYW5nZSIsImRyb3Bkb3duUm9vdEVsZW1lbnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25Sb290Q2xpY2siLCJhZGRFdmVudExpc3RlbmVyIiwib3B0aW9uS2V5IiwicmVpbmRleENoaWxkcmVuIiwiZmlyc3RDaGlsZCIsIkNoaWxkcmVuIiwidG9BcnJheSIsImRvY3VtZW50Iiwib25Eb2N1bWVudENsaWNrIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsImxlbmd0aCIsImNoaWxkcmVuQnlLZXkiLCJmb3JFYWNoIiwiY2hpbGQiLCJidXR0b25SZWYiLCJjdXJyZW50IiwiZm9jdXMiLCJrZXlzIiwiT2JqZWN0IiwiaW5kZXgiLCJpbmRleE9mIiwic2Nyb2xsSW50b1ZpZXciLCJub2RlIiwiYmxvY2siLCJiZWhhdmlvciIsImdldE1lbnVPcHRpb25zIiwib3B0aW9ucyIsIm1hcCIsInNldEhpZ2hsaWdodGVkT3B0aW9uIiwib25NZW51T3B0aW9uQ2xpY2siLCJ1bmRlZmluZWQiLCJfdCIsImN1cnJlbnRWYWx1ZSIsIm1lbnVTdHlsZSIsIm1lbnVXaWR0aCIsIndpZHRoIiwibWVudSIsInNlYXJjaEVuYWJsZWQiLCJvbklucHV0Q2hhbmdlIiwibGFiZWwiLCJvbktleURvd24iLCJzZWxlY3RlZENoaWxkIiwiZ2V0U2hvcnRPcHRpb24iLCJwbGFjZWhvbGRlciIsImRyb3Bkb3duQ2xhc3NlcyIsIm14X0Ryb3Bkb3duIiwibXhfRHJvcGRvd25fZGlzYWJsZWQiLCJjbGFzc05hbWUiLCJjb2xsZWN0Um9vdCIsIm9uQWNjZXNzaWJsZUJ1dHRvbkNsaWNrIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRHJvcGRvd24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDE3IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDaGFuZ2VFdmVudCwgY3JlYXRlUmVmLCBDU1NQcm9wZXJ0aWVzLCBSZWFjdEVsZW1lbnQsIFJlYWN0Tm9kZSwgUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uLCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSAnLi9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IGdldEtleUJpbmRpbmdzTWFuYWdlciB9IGZyb20gXCIuLi8uLi8uLi9LZXlCaW5kaW5nc01hbmFnZXJcIjtcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuXG5pbnRlcmZhY2UgSU1lbnVPcHRpb25Qcm9wcyB7XG4gICAgY2hpbGRyZW46IFJlYWN0RWxlbWVudDtcbiAgICBoaWdobGlnaHRlZD86IGJvb2xlYW47XG4gICAgZHJvcGRvd25LZXk6IHN0cmluZztcbiAgICBpZD86IHN0cmluZztcbiAgICBpbnB1dFJlZj86IFJlZjxIVE1MRGl2RWxlbWVudD47XG4gICAgb25DbGljayhkcm9wZG93bktleTogc3RyaW5nKTogdm9pZDtcbiAgICBvbk1vdXNlRW50ZXIoZHJvcGRvd25LZXk6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmNsYXNzIE1lbnVPcHRpb24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SU1lbnVPcHRpb25Qcm9wcz4ge1xuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1vdXNlRW50ZXIgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25Nb3VzZUVudGVyKHRoaXMucHJvcHMuZHJvcGRvd25LZXkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25DbGljayh0aGlzLnByb3BzLmRyb3Bkb3duS2V5KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBvcHRDbGFzc2VzID0gY2xhc3NuYW1lcyh7XG4gICAgICAgICAgICBteF9Ecm9wZG93bl9vcHRpb246IHRydWUsXG4gICAgICAgICAgICBteF9Ecm9wZG93bl9vcHRpb25faGlnaGxpZ2h0OiB0aGlzLnByb3BzLmhpZ2hsaWdodGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPGRpdlxuICAgICAgICAgICAgaWQ9e3RoaXMucHJvcHMuaWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9e29wdENsYXNzZXN9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9XG4gICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMub25Nb3VzZUVudGVyfVxuICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0aGlzLnByb3BzLmhpZ2hsaWdodGVkfVxuICAgICAgICAgICAgcmVmPXt0aGlzLnByb3BzLmlucHV0UmVmfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyb3Bkb3duUHJvcHMge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgLy8gQVJJQSBsYWJlbFxuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgdmFsdWU/OiBzdHJpbmc7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICAgIGNoaWxkcmVuOiBSZWFjdEVsZW1lbnRbXTtcbiAgICAvLyBuZWdhdGl2ZSBmb3IgY29uc2lzdGVuY3kgd2l0aCBIVE1MXG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICAgIC8vIFRoZSB3aWR0aCB0aGF0IHRoZSBkcm9wZG93biBzaG91bGQgYmUuIElmIHNwZWNpZmllZCxcbiAgICAvLyB0aGUgZHJvcHBlZC1kb3duIHBhcnQgb2YgdGhlIG1lbnUgd2lsbCBiZSBzZXQgdG8gdGhpc1xuICAgIC8vIHdpZHRoLlxuICAgIG1lbnVXaWR0aD86IG51bWJlcjtcbiAgICBzZWFyY2hFbmFibGVkPzogYm9vbGVhbjtcbiAgICAvLyBQbGFjZWhvbGRlciB0byBzaG93IHdoZW4gbm8gdmFsdWUgaXMgc2VsZWN0ZWRcbiAgICBwbGFjZWhvbGRlcj86IHN0cmluZztcbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgc2VsZWN0ZWQgb3B0aW9uIGNoYW5nZXNcbiAgICBvbk9wdGlvbkNoYW5nZShkcm9wZG93bktleTogc3RyaW5nKTogdm9pZDtcbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgdmFsdWUgb2YgdGhlIHNlYXJjaCBmaWVsZCBjaGFuZ2VzXG4gICAgb25TZWFyY2hDaGFuZ2U/KHF1ZXJ5OiBzdHJpbmcpOiB2b2lkO1xuICAgIC8vIEZ1bmN0aW9uIHRoYXQsIGdpdmVuIHRoZSBrZXkgb2YgYW4gb3B0aW9uLCByZXR1cm5zXG4gICAgLy8gYSBub2RlIHJlcHJlc2VudGluZyB0aGF0IG9wdGlvbiB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlXG4gICAgLy8gYm94IGl0c2VsZiBhcyB0aGUgY3VycmVudGx5LXNlbGVjdGVkIG9wdGlvbiAoaWUuIGFzXG4gICAgLy8gb3Bwb3NlZCB0byBpbiB0aGUgYWN0dWFsIGRyb3BwZWQtZG93biBwYXJ0KS4gSWZcbiAgICAvLyB1bnNwZWNpZmllZCwgdGhlIGFwcHJvcHJpYXRlIGNoaWxkIGVsZW1lbnQgaXMgdXNlZCBhc1xuICAgIC8vIGluIHRoZSBkcm9wcGVkLWRvd24gbWVudS5cbiAgICBnZXRTaG9ydE9wdGlvbj8odmFsdWU6IHN0cmluZyk6IFJlYWN0Tm9kZTtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZXhwYW5kZWQ6IGJvb2xlYW47XG4gICAgaGlnaGxpZ2h0ZWRPcHRpb246IHN0cmluZyB8IG51bGw7XG4gICAgc2VhcmNoUXVlcnk6IHN0cmluZztcbn1cblxuLypcbiAqIFJldXNhYmxlIGRyb3Bkb3duIHNlbGVjdCBjb250cm9sLCBha2luIHRvIHJlYWN0LXNlbGVjdCxcbiAqIGJ1dCBzb21ld2hhdCBzaW1wbGVyIGFzIHJlYWN0LXNlbGVjdCBpcyA3OUtCIG9mIG1pbmlmaWVkXG4gKiBqYXZhc2NyaXB0LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wZG93biBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxEcm9wZG93blByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGJ1dHRvblJlZiA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGRyb3Bkb3duUm9vdEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50ID0gbnVsbDtcbiAgICBwcml2YXRlIGlnbm9yZUV2ZW50OiBNb3VzZUV2ZW50ID0gbnVsbDtcbiAgICBwcml2YXRlIGNoaWxkcmVuQnlLZXk6IFJlY29yZDxzdHJpbmcsIFJlYWN0Tm9kZT4gPSB7fTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBEcm9wZG93blByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnJlaW5kZXhDaGlsZHJlbih0aGlzLnByb3BzLmNoaWxkcmVuKTtcblxuICAgICAgICBjb25zdCBmaXJzdENoaWxkID0gUmVhY3QuQ2hpbGRyZW4udG9BcnJheShwcm9wcy5jaGlsZHJlbilbMF0gYXMgUmVhY3RFbGVtZW50O1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAvLyBUcnVlIGlmIHRoZSBtZW51IGlzIGRyb3BwZWQtZG93blxuICAgICAgICAgICAgZXhwYW5kZWQ6IGZhbHNlLFxuICAgICAgICAgICAgLy8gVGhlIGtleSBvZiB0aGUgaGlnaGxpZ2h0ZWQgb3B0aW9uXG4gICAgICAgICAgICAvLyAodGhlIG9wdGlvbiB0aGF0IHdvdWxkIGJlY29tZSBzZWxlY3RlZCBpZiB5b3UgcHJlc3NlZCBlbnRlcilcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkT3B0aW9uOiBmaXJzdENoaWxkID8gZmlyc3RDaGlsZC5rZXkgYXMgc3RyaW5nIDogbnVsbCxcbiAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IHNlYXJjaCBxdWVyeVxuICAgICAgICAgICAgc2VhcmNoUXVlcnk6ICcnLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3IgYWxsIGNsaWNrcyBvbiB0aGUgZG9jdW1lbnQgc28gd2UgY2FuIGNsb3NlIHRoZVxuICAgICAgICAvLyBtZW51IHdoZW4gdGhlIHVzZXIgY2xpY2tzIHNvbWV3aGVyZSBlbHNlXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkRvY3VtZW50Q2xpY2ssIGZhbHNlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uRG9jdW1lbnRDbGljaywgZmFsc2UpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgaWYgKCFuZXh0UHJvcHMuY2hpbGRyZW4gfHwgbmV4dFByb3BzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVpbmRleENoaWxkcmVuKG5leHRQcm9wcy5jaGlsZHJlbik7XG4gICAgICAgIGNvbnN0IGZpcnN0Q2hpbGQgPSBuZXh0UHJvcHMuY2hpbGRyZW5bMF07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRPcHRpb246IGZpcnN0Q2hpbGQgPyBmaXJzdENoaWxkLmtleSA6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVpbmRleENoaWxkcmVuKGNoaWxkcmVuOiBSZWFjdEVsZW1lbnRbXSk6IHZvaWQge1xuICAgICAgICB0aGlzLmNoaWxkcmVuQnlLZXkgPSB7fTtcbiAgICAgICAgUmVhY3QuQ2hpbGRyZW4uZm9yRWFjaChjaGlsZHJlbiwgKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuQnlLZXlbY2hpbGQua2V5XSA9IGNoaWxkO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRG9jdW1lbnRDbGljayA9IChldjogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAvLyBDbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzIGFueXdoZXJlIHRoYXQgaXNuJ3RcbiAgICAgICAgLy8gd2l0aGluIG91ciByb290IGVsZW1lbnRcbiAgICAgICAgaWYgKGV2ICE9PSB0aGlzLmlnbm9yZUV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vdENsaWNrID0gKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIC8vIFRoaXMgY2FwdHVyZXMgYW55IGNsaWNrcyB0aGF0IGhhcHBlbiB3aXRoaW4gb3VyIGVsZW1lbnRzLFxuICAgICAgICAvLyBzdWNoIHRoYXQgd2UgY2FuIHRoZW4gaWdub3JlIHRoZW0gd2hlbiB0aGV5J3JlIHNlZW4gYnkgdGhlXG4gICAgICAgIC8vIGNsaWNrIGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudCBoYW5kbGVyLCBpZS4gbm90IGNsb3NlIHRoZVxuICAgICAgICAvLyBkcm9wZG93biBpbW1lZGlhdGVseSBhZnRlciBvcGVuaW5nIGl0LlxuICAgICAgICAvLyBOQi4gV2UgY2FuJ3QganVzdCBzdG9wUHJvcGFnYXRpb24oKSBiZWNhdXNlIHRoZW4gdGhlIGV2ZW50XG4gICAgICAgIC8vIGRvZXNuJ3QgcmVhY2ggdGhlIFJlYWN0IG9uQ2xpY2soKS5cbiAgICAgICAgdGhpcy5pZ25vcmVFdmVudCA9IGV2O1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWNjZXNzaWJsZUJ1dHRvbkNsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXYgYXMgUmVhY3QuS2V5Ym9hcmRFdmVudCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmV4cGFuZGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXhwYW5kZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gS2V5QmluZGluZ0FjdGlvbi5FbnRlcikge1xuICAgICAgICAgICAgLy8gdGhlIGFjY2Vzc2libGUgYnV0dG9uIGNvbnN1bWVzIGVudGVyIG9uS2V5RG93biBmb3IgZmlyaW5nIG9uQ2xpY2ssIHNvIGhhbmRsZSBpdCBoZXJlXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uT3B0aW9uQ2hhbmdlKHRoaXMuc3RhdGUuaGlnaGxpZ2h0ZWRPcHRpb24pO1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCEoZXYgYXMgUmVhY3QuS2V5Ym9hcmRFdmVudCkua2V5KSB7XG4gICAgICAgICAgICAvLyBjb2xsYXBzZSBvbiBvdGhlciBub24ta2V5Ym9hcmQgZXZlbnQgYWN0aXZhdGlvbnNcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBleHBhbmRlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXhwYW5kZWQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gdGhlaXIgZm9jdXMgd2FzIG9uIHRoZSBpbnB1dCwgaXRzIGdldHRpbmcgdW5tb3VudGVkLCBtb3ZlIGl0IHRvIHRoZSBidXR0b25cbiAgICAgICAgaWYgKHRoaXMuYnV0dG9uUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25NZW51T3B0aW9uQ2xpY2sgPSAoZHJvcGRvd25LZXk6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25PcHRpb25DaGFuZ2UoZHJvcGRvd25LZXkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChlOiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGxldCBoYW5kbGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBUaGVzZSBrZXlzIGRvbid0IGdlbmVyYXRlIGtleXByZXNzIGV2ZW50cyBhbmQgc28gbmVlZHMgdG8gYmUgb24ga2V5dXBcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihlKTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5FbnRlcjpcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uT3B0aW9uQ2hhbmdlKHRoaXMuc3RhdGUuaGlnaGxpZ2h0ZWRPcHRpb24pO1xuICAgICAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRXNjYXBlOlxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5BcnJvd0Rvd246XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXhwYW5kZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRlZE9wdGlvbjogdGhpcy5uZXh0T3B0aW9uKHRoaXMuc3RhdGUuaGlnaGxpZ2h0ZWRPcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXhwYW5kZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkFycm93VXA6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXhwYW5kZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRlZE9wdGlvbjogdGhpcy5wcmV2T3B0aW9uKHRoaXMuc3RhdGUuaGlnaGxpZ2h0ZWRPcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXhwYW5kZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSW5wdXRDaGFuZ2UgPSAoZTogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hRdWVyeTogZS5jdXJyZW50VGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25TZWFyY2hDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25TZWFyY2hDaGFuZ2UoZS5jdXJyZW50VGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGNvbGxlY3RSb290ID0gKGU6IEhUTUxEaXZFbGVtZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRyb3Bkb3duUm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZHJvcGRvd25Sb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25Sb290Q2xpY2ssIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25Sb290Q2xpY2ssIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyb3Bkb3duUm9vdEVsZW1lbnQgPSBlO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNldEhpZ2hsaWdodGVkT3B0aW9uID0gKG9wdGlvbktleTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRPcHRpb246IG9wdGlvbktleSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgbmV4dE9wdGlvbihvcHRpb25LZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNoaWxkcmVuQnlLZXkpO1xuICAgICAgICBjb25zdCBpbmRleCA9IGtleXMuaW5kZXhPZihvcHRpb25LZXkpO1xuICAgICAgICByZXR1cm4ga2V5c1soaW5kZXggKyAxKSAlIGtleXMubGVuZ3RoXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByZXZPcHRpb24ob3B0aW9uS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGlsZHJlbkJ5S2V5KTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBrZXlzLmluZGV4T2Yob3B0aW9uS2V5KTtcbiAgICAgICAgcmV0dXJuIGtleXNbaW5kZXggPD0gMCA/IGtleXMubGVuZ3RoIC0gMSA6IChpbmRleCAtIDEpICUga2V5cy5sZW5ndGhdO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2Nyb2xsSW50b1ZpZXcobm9kZTogRWxlbWVudCkge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgbm9kZS5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgICAgICAgICAgYmxvY2s6IFwibmVhcmVzdFwiLFxuICAgICAgICAgICAgICAgIGJlaGF2aW9yOiBcImF1dG9cIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNZW51T3B0aW9ucygpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IFJlYWN0LkNoaWxkcmVuLm1hcCh0aGlzLnByb3BzLmNoaWxkcmVuLCAoY2hpbGQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkID0gdGhpcy5zdGF0ZS5oaWdobGlnaHRlZE9wdGlvbiA9PT0gY2hpbGQua2V5O1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpZD17YCR7dGhpcy5wcm9wcy5pZH1fXyR7Y2hpbGQua2V5fWB9XG4gICAgICAgICAgICAgICAgICAgIGtleT17Y2hpbGQua2V5fVxuICAgICAgICAgICAgICAgICAgICBkcm9wZG93bktleT17Y2hpbGQua2V5IGFzIHN0cmluZ31cbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ9e2hpZ2hsaWdodGVkfVxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMuc2V0SGlnaGxpZ2h0ZWRPcHRpb259XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25NZW51T3B0aW9uQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXtoaWdobGlnaHRlZCA/IHRoaXMuc2Nyb2xsSW50b1ZpZXcgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IGNoaWxkIH1cbiAgICAgICAgICAgICAgICA8L01lbnVPcHRpb24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gWzxkaXYga2V5PVwiMFwiIGNsYXNzTmFtZT1cIm14X0Ryb3Bkb3duX29wdGlvblwiIHJvbGU9XCJvcHRpb25cIiBhcmlhLXNlbGVjdGVkPXtmYWxzZX0+XG4gICAgICAgICAgICAgICAgeyBfdChcIk5vIHJlc3VsdHNcIikgfVxuICAgICAgICAgICAgPC9kaXY+XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBjdXJyZW50VmFsdWU7XG5cbiAgICAgICAgY29uc3QgbWVudVN0eWxlOiBDU1NQcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1lbnVXaWR0aCkgbWVudVN0eWxlLndpZHRoID0gdGhpcy5wcm9wcy5tZW51V2lkdGg7XG5cbiAgICAgICAgbGV0IG1lbnU7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmV4cGFuZGVkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWFyY2hFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlID0gKFxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPXtgJHt0aGlzLnByb3BzLmlkfV9pbnB1dGB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Ecm9wZG93bl9vcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25JbnB1dENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnNlYXJjaFF1ZXJ5fVxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cImNvbWJvYm94XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtYXV0b2NvbXBsZXRlPVwibGlzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQ9e2Ake3RoaXMucHJvcHMuaWR9X18ke3RoaXMuc3RhdGUuaGlnaGxpZ2h0ZWRPcHRpb259YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e3RoaXMuc3RhdGUuZXhwYW5kZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWNvbnRyb2xzPXtgJHt0aGlzLnByb3BzLmlkfV9saXN0Ym94YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWVudSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0Ryb3Bkb3duX21lbnVcIiBzdHlsZT17bWVudVN0eWxlfSByb2xlPVwibGlzdGJveFwiIGlkPXtgJHt0aGlzLnByb3BzLmlkfV9saXN0Ym94YH0+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5nZXRNZW51T3B0aW9ucygpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRDaGlsZCA9IHRoaXMucHJvcHMuZ2V0U2hvcnRPcHRpb24gP1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0U2hvcnRPcHRpb24odGhpcy5wcm9wcy52YWx1ZSkgOlxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5CeUtleVt0aGlzLnByb3BzLnZhbHVlXTtcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IDxkaXYgY2xhc3NOYW1lPVwibXhfRHJvcGRvd25fb3B0aW9uXCIgaWQ9e2Ake3RoaXMucHJvcHMuaWR9X3ZhbHVlYH0+XG4gICAgICAgICAgICAgICAgeyBzZWxlY3RlZENoaWxkIHx8IHRoaXMucHJvcHMucGxhY2Vob2xkZXIgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZHJvcGRvd25DbGFzc2VzID0ge1xuICAgICAgICAgICAgbXhfRHJvcGRvd246IHRydWUsXG4gICAgICAgICAgICBteF9Ecm9wZG93bl9kaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBkcm9wZG93bkNsYXNzZXNbdGhpcy5wcm9wcy5jbGFzc05hbWVdID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGUgdGhlIG1lbnUgc2l0cyBpbnNpZGUgdGhlIEFjY2Vzc2libGVCdXR0b24gZGl2IHNvIGl0J3MgYW5jaG9yZWRcbiAgICAgICAgLy8gdG8gdGhlIGlucHV0LCBidXQgb3ZlcmZsb3dzIGJlbG93IGl0LiBUaGUgcm9vdCBjb250YWlucyBib3RoLlxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoZHJvcGRvd25DbGFzc2VzKX0gcmVmPXt0aGlzLmNvbGxlY3RSb290fT5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRHJvcGRvd25faW5wdXQgbXhfbm9fdGV4dGlucHV0XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQWNjZXNzaWJsZUJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXt0aGlzLnN0YXRlLmV4cGFuZGVkfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLmJ1dHRvblJlZn1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICAgICAgICAgIGFyaWEtZGVzY3JpYmVkYnk9e2Ake3RoaXMucHJvcHMuaWR9X3ZhbHVlYH1cbiAgICAgICAgICAgICAgICBhcmlhLW93bnM9e2Ake3RoaXMucHJvcHMuaWR9X2lucHV0YH1cbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgY3VycmVudFZhbHVlIH1cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Ecm9wZG93bl9hcnJvd1wiIC8+XG4gICAgICAgICAgICAgICAgeyBtZW51IH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW9CQSxNQUFNQSxVQUFOLFNBQXlCQyxjQUFBLENBQU1DLFNBQS9CLENBQTJEO0VBQUE7SUFBQTtJQUFBLG9EQUtoQyxNQUFNO01BQ3pCLEtBQUtDLEtBQUwsQ0FBV0MsWUFBWCxDQUF3QixLQUFLRCxLQUFMLENBQVdFLFdBQW5DO0lBQ0gsQ0FQc0Q7SUFBQSwrQ0FTcENDLENBQUQsSUFBeUI7TUFDdkNBLENBQUMsQ0FBQ0MsY0FBRjtNQUNBRCxDQUFDLENBQUNFLGVBQUY7TUFDQSxLQUFLTCxLQUFMLENBQVdNLE9BQVgsQ0FBbUIsS0FBS04sS0FBTCxDQUFXRSxXQUE5QjtJQUNILENBYnNEO0VBQUE7O0VBZXZESyxNQUFNLEdBQUc7SUFDTCxNQUFNQyxVQUFVLEdBQUcsSUFBQUMsbUJBQUEsRUFBVztNQUMxQkMsa0JBQWtCLEVBQUUsSUFETTtNQUUxQkMsNEJBQTRCLEVBQUUsS0FBS1gsS0FBTCxDQUFXWTtJQUZmLENBQVgsQ0FBbkI7SUFLQSxvQkFBTztNQUNILEVBQUUsRUFBRSxLQUFLWixLQUFMLENBQVdhLEVBRFo7TUFFSCxTQUFTLEVBQUVMLFVBRlI7TUFHSCxPQUFPLEVBQUUsS0FBS0YsT0FIWDtNQUlILFlBQVksRUFBRSxLQUFLTCxZQUpoQjtNQUtILElBQUksRUFBQyxRQUxGO01BTUgsaUJBQWUsS0FBS0QsS0FBTCxDQUFXWSxXQU52QjtNQU9ILEdBQUcsRUFBRSxLQUFLWixLQUFMLENBQVdjO0lBUGIsR0FTRCxLQUFLZCxLQUFMLENBQVdlLFFBVFYsQ0FBUDtFQVdIOztBQWhDc0Q7OzhCQUFyRGxCLFUsa0JBQ29CO0VBQ2xCbUIsUUFBUSxFQUFFO0FBRFEsQzs7QUFxRTFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQyxRQUFOLFNBQXVCbkIsY0FBQSxDQUFNQyxTQUE3QixDQUE4RDtFQU16RW1CLFdBQVcsQ0FBQ2xCLEtBQUQsRUFBdUI7SUFDOUIsTUFBTUEsS0FBTjtJQUQ4Qiw4REFMTCxJQUFBbUIsZ0JBQUEsR0FLSztJQUFBLDJEQUpZLElBSVo7SUFBQSxtREFIQSxJQUdBO0lBQUEscURBRmlCLEVBRWpCO0lBQUEsdURBNkNQQyxFQUFELElBQW9CO01BQzFDO01BQ0E7TUFDQSxJQUFJQSxFQUFFLEtBQUssS0FBS0MsV0FBaEIsRUFBNkI7UUFDekIsS0FBS0MsUUFBTCxDQUFjO1VBQ1ZDLFFBQVEsRUFBRTtRQURBLENBQWQ7TUFHSDtJQUNKLENBckRpQztJQUFBLG1EQXVEWEgsRUFBRCxJQUFvQjtNQUN0QztNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQSxLQUFLQyxXQUFMLEdBQW1CRCxFQUFuQjtJQUNILENBL0RpQztJQUFBLCtEQWlFQ0EsRUFBRCxJQUFxQjtNQUNuRCxJQUFJLEtBQUtwQixLQUFMLENBQVdnQixRQUFmLEVBQXlCO01BRXpCLE1BQU1RLE1BQU0sR0FBRyxJQUFBQyx5Q0FBQSxJQUF3QkMsc0JBQXhCLENBQStDTixFQUEvQyxDQUFmOztNQUVBLElBQUksQ0FBQyxLQUFLTyxLQUFMLENBQVdKLFFBQWhCLEVBQTBCO1FBQ3RCLEtBQUtELFFBQUwsQ0FBYztVQUFFQyxRQUFRLEVBQUU7UUFBWixDQUFkO1FBQ0FILEVBQUUsQ0FBQ2hCLGNBQUg7TUFDSCxDQUhELE1BR08sSUFBSW9CLE1BQU0sS0FBS0ksbUNBQUEsQ0FBaUJDLEtBQWhDLEVBQXVDO1FBQzFDO1FBQ0EsS0FBSzdCLEtBQUwsQ0FBVzhCLGNBQVgsQ0FBMEIsS0FBS0gsS0FBTCxDQUFXSSxpQkFBckM7UUFDQSxLQUFLQyxLQUFMO01BQ0gsQ0FKTSxNQUlBLElBQUksQ0FBRVosRUFBRCxDQUE0QmEsR0FBakMsRUFBc0M7UUFDekM7UUFDQSxLQUFLWCxRQUFMLENBQWM7VUFBRUMsUUFBUSxFQUFFO1FBQVosQ0FBZDtRQUNBSCxFQUFFLENBQUNoQixjQUFIO01BQ0g7SUFDSixDQWxGaUM7SUFBQSx5REE4RkxGLFdBQUQsSUFBeUI7TUFDakQsS0FBSzhCLEtBQUw7TUFDQSxLQUFLaEMsS0FBTCxDQUFXOEIsY0FBWCxDQUEwQjVCLFdBQTFCO0lBQ0gsQ0FqR2lDO0lBQUEsaURBbUdiQyxDQUFELElBQTRCO01BQzVDLElBQUkrQixPQUFPLEdBQUcsSUFBZCxDQUQ0QyxDQUc1Qzs7TUFDQSxNQUFNVixNQUFNLEdBQUcsSUFBQUMseUNBQUEsSUFBd0JDLHNCQUF4QixDQUErQ3ZCLENBQS9DLENBQWY7O01BQ0EsUUFBUXFCLE1BQVI7UUFDSSxLQUFLSSxtQ0FBQSxDQUFpQkMsS0FBdEI7VUFDSSxLQUFLN0IsS0FBTCxDQUFXOEIsY0FBWCxDQUEwQixLQUFLSCxLQUFMLENBQVdJLGlCQUFyQztRQUNBOztRQUNKLEtBQUtILG1DQUFBLENBQWlCTyxNQUF0QjtVQUNJLEtBQUtILEtBQUw7VUFDQTs7UUFDSixLQUFLSixtQ0FBQSxDQUFpQlEsU0FBdEI7VUFDSSxJQUFJLEtBQUtULEtBQUwsQ0FBV0osUUFBZixFQUF5QjtZQUNyQixLQUFLRCxRQUFMLENBQWM7Y0FDVlMsaUJBQWlCLEVBQUUsS0FBS00sVUFBTCxDQUFnQixLQUFLVixLQUFMLENBQVdJLGlCQUEzQjtZQURULENBQWQ7VUFHSCxDQUpELE1BSU87WUFDSCxLQUFLVCxRQUFMLENBQWM7Y0FBRUMsUUFBUSxFQUFFO1lBQVosQ0FBZDtVQUNIOztVQUNEOztRQUNKLEtBQUtLLG1DQUFBLENBQWlCVSxPQUF0QjtVQUNJLElBQUksS0FBS1gsS0FBTCxDQUFXSixRQUFmLEVBQXlCO1lBQ3JCLEtBQUtELFFBQUwsQ0FBYztjQUNWUyxpQkFBaUIsRUFBRSxLQUFLUSxVQUFMLENBQWdCLEtBQUtaLEtBQUwsQ0FBV0ksaUJBQTNCO1lBRFQsQ0FBZDtVQUdILENBSkQsTUFJTztZQUNILEtBQUtULFFBQUwsQ0FBYztjQUFFQyxRQUFRLEVBQUU7WUFBWixDQUFkO1VBQ0g7O1VBQ0Q7O1FBQ0o7VUFDSVcsT0FBTyxHQUFHLEtBQVY7TUExQlI7O01BNkJBLElBQUlBLE9BQUosRUFBYTtRQUNUL0IsQ0FBQyxDQUFDQyxjQUFGO1FBQ0FELENBQUMsQ0FBQ0UsZUFBRjtNQUNIO0lBQ0osQ0F6SWlDO0lBQUEscURBMklURixDQUFELElBQXNDO01BQzFELEtBQUttQixRQUFMLENBQWM7UUFDVmtCLFdBQVcsRUFBRXJDLENBQUMsQ0FBQ3NDLGFBQUYsQ0FBZ0JDO01BRG5CLENBQWQ7O01BR0EsSUFBSSxLQUFLMUMsS0FBTCxDQUFXMkMsY0FBZixFQUErQjtRQUMzQixLQUFLM0MsS0FBTCxDQUFXMkMsY0FBWCxDQUEwQnhDLENBQUMsQ0FBQ3NDLGFBQUYsQ0FBZ0JDLEtBQTFDO01BQ0g7SUFDSixDQWxKaUM7SUFBQSxtREFvSlh2QyxDQUFELElBQXVCO01BQ3pDLElBQUksS0FBS3lDLG1CQUFULEVBQThCO1FBQzFCLEtBQUtBLG1CQUFMLENBQXlCQyxtQkFBekIsQ0FBNkMsT0FBN0MsRUFBc0QsS0FBS0MsV0FBM0QsRUFBd0UsS0FBeEU7TUFDSDs7TUFDRCxJQUFJM0MsQ0FBSixFQUFPO1FBQ0hBLENBQUMsQ0FBQzRDLGdCQUFGLENBQW1CLE9BQW5CLEVBQTRCLEtBQUtELFdBQWpDLEVBQThDLEtBQTlDO01BQ0g7O01BQ0QsS0FBS0YsbUJBQUwsR0FBMkJ6QyxDQUEzQjtJQUNILENBNUppQztJQUFBLDREQThKRjZDLFNBQUQsSUFBdUI7TUFDbEQsS0FBSzFCLFFBQUwsQ0FBYztRQUNWUyxpQkFBaUIsRUFBRWlCO01BRFQsQ0FBZDtJQUdILENBbEtpQztJQUc5QixLQUFLQyxlQUFMLENBQXFCLEtBQUtqRCxLQUFMLENBQVdlLFFBQWhDOztJQUVBLE1BQU1tQyxVQUFVLEdBQUdwRCxjQUFBLENBQU1xRCxRQUFOLENBQWVDLE9BQWYsQ0FBdUJwRCxLQUFLLENBQUNlLFFBQTdCLEVBQXVDLENBQXZDLENBQW5COztJQUVBLEtBQUtZLEtBQUwsR0FBYTtNQUNUO01BQ0FKLFFBQVEsRUFBRSxLQUZEO01BR1Q7TUFDQTtNQUNBUSxpQkFBaUIsRUFBRW1CLFVBQVUsR0FBR0EsVUFBVSxDQUFDakIsR0FBZCxHQUE4QixJQUxsRDtNQU1UO01BQ0FPLFdBQVcsRUFBRTtJQVBKLENBQWIsQ0FQOEIsQ0FpQjlCO0lBQ0E7O0lBQ0FhLFFBQVEsQ0FBQ04sZ0JBQVQsQ0FBMEIsT0FBMUIsRUFBbUMsS0FBS08sZUFBeEMsRUFBeUQsS0FBekQ7RUFDSDs7RUFFREMsb0JBQW9CLEdBQUc7SUFDbkJGLFFBQVEsQ0FBQ1IsbUJBQVQsQ0FBNkIsT0FBN0IsRUFBc0MsS0FBS1MsZUFBM0MsRUFBNEQsS0FBNUQ7RUFDSCxDQTlCd0UsQ0FnQ3pFOzs7RUFDQUUsZ0NBQWdDLENBQUNDLFNBQUQsRUFBWTtJQUFFO0lBQzFDLElBQUksQ0FBQ0EsU0FBUyxDQUFDMUMsUUFBWCxJQUF1QjBDLFNBQVMsQ0FBQzFDLFFBQVYsQ0FBbUIyQyxNQUFuQixLQUE4QixDQUF6RCxFQUE0RDtNQUN4RDtJQUNIOztJQUNELEtBQUtULGVBQUwsQ0FBcUJRLFNBQVMsQ0FBQzFDLFFBQS9CO0lBQ0EsTUFBTW1DLFVBQVUsR0FBR08sU0FBUyxDQUFDMUMsUUFBVixDQUFtQixDQUFuQixDQUFuQjtJQUNBLEtBQUtPLFFBQUwsQ0FBYztNQUNWUyxpQkFBaUIsRUFBRW1CLFVBQVUsR0FBR0EsVUFBVSxDQUFDakIsR0FBZCxHQUFvQjtJQUR2QyxDQUFkO0VBR0g7O0VBRU9nQixlQUFlLENBQUNsQyxRQUFELEVBQWlDO0lBQ3BELEtBQUs0QyxhQUFMLEdBQXFCLEVBQXJCOztJQUNBN0QsY0FBQSxDQUFNcUQsUUFBTixDQUFlUyxPQUFmLENBQXVCN0MsUUFBdkIsRUFBa0M4QyxLQUFELElBQVc7TUFDeEMsS0FBS0YsYUFBTCxDQUFtQkUsS0FBSyxDQUFDNUIsR0FBekIsSUFBZ0M0QixLQUFoQztJQUNILENBRkQ7RUFHSDs7RUF5Q083QixLQUFLLEdBQUc7SUFDWixLQUFLVixRQUFMLENBQWM7TUFDVkMsUUFBUSxFQUFFO0lBREEsQ0FBZCxFQURZLENBSVo7O0lBQ0EsSUFBSSxLQUFLdUMsU0FBTCxDQUFlQyxPQUFuQixFQUE0QjtNQUN4QixLQUFLRCxTQUFMLENBQWVDLE9BQWYsQ0FBdUJDLEtBQXZCO0lBQ0g7RUFDSjs7RUF3RU8zQixVQUFVLENBQUNXLFNBQUQsRUFBNEI7SUFDMUMsTUFBTWlCLElBQUksR0FBR0MsTUFBTSxDQUFDRCxJQUFQLENBQVksS0FBS04sYUFBakIsQ0FBYjtJQUNBLE1BQU1RLEtBQUssR0FBR0YsSUFBSSxDQUFDRyxPQUFMLENBQWFwQixTQUFiLENBQWQ7SUFDQSxPQUFPaUIsSUFBSSxDQUFDLENBQUNFLEtBQUssR0FBRyxDQUFULElBQWNGLElBQUksQ0FBQ1AsTUFBcEIsQ0FBWDtFQUNIOztFQUVPbkIsVUFBVSxDQUFDUyxTQUFELEVBQTRCO0lBQzFDLE1BQU1pQixJQUFJLEdBQUdDLE1BQU0sQ0FBQ0QsSUFBUCxDQUFZLEtBQUtOLGFBQWpCLENBQWI7SUFDQSxNQUFNUSxLQUFLLEdBQUdGLElBQUksQ0FBQ0csT0FBTCxDQUFhcEIsU0FBYixDQUFkO0lBQ0EsT0FBT2lCLElBQUksQ0FBQ0UsS0FBSyxJQUFJLENBQVQsR0FBYUYsSUFBSSxDQUFDUCxNQUFMLEdBQWMsQ0FBM0IsR0FBK0IsQ0FBQ1MsS0FBSyxHQUFHLENBQVQsSUFBY0YsSUFBSSxDQUFDUCxNQUFuRCxDQUFYO0VBQ0g7O0VBRU9XLGNBQWMsQ0FBQ0MsSUFBRCxFQUFnQjtJQUNsQyxJQUFJQSxJQUFKLEVBQVU7TUFDTkEsSUFBSSxDQUFDRCxjQUFMLENBQW9CO1FBQ2hCRSxLQUFLLEVBQUUsU0FEUztRQUVoQkMsUUFBUSxFQUFFO01BRk0sQ0FBcEI7SUFJSDtFQUNKOztFQUVPQyxjQUFjLEdBQUc7SUFDckIsTUFBTUMsT0FBTyxHQUFHNUUsY0FBQSxDQUFNcUQsUUFBTixDQUFld0IsR0FBZixDQUFtQixLQUFLM0UsS0FBTCxDQUFXZSxRQUE5QixFQUF5QzhDLEtBQUQsSUFBVztNQUMvRCxNQUFNakQsV0FBVyxHQUFHLEtBQUtlLEtBQUwsQ0FBV0ksaUJBQVgsS0FBaUM4QixLQUFLLENBQUM1QixHQUEzRDtNQUNBLG9CQUNJLDZCQUFDLFVBQUQ7UUFDSSxFQUFFLEVBQUcsR0FBRSxLQUFLakMsS0FBTCxDQUFXYSxFQUFHLEtBQUlnRCxLQUFLLENBQUM1QixHQUFJLEVBRHZDO1FBRUksR0FBRyxFQUFFNEIsS0FBSyxDQUFDNUIsR0FGZjtRQUdJLFdBQVcsRUFBRTRCLEtBQUssQ0FBQzVCLEdBSHZCO1FBSUksV0FBVyxFQUFFckIsV0FKakI7UUFLSSxZQUFZLEVBQUUsS0FBS2dFLG9CQUx2QjtRQU1JLE9BQU8sRUFBRSxLQUFLQyxpQkFObEI7UUFPSSxRQUFRLEVBQUVqRSxXQUFXLEdBQUcsS0FBS3lELGNBQVIsR0FBeUJTO01BUGxELEdBU01qQixLQVROLENBREo7SUFhSCxDQWZlLENBQWhCOztJQWdCQSxJQUFJYSxPQUFPLENBQUNoQixNQUFSLEtBQW1CLENBQXZCLEVBQTBCO01BQ3RCLE9BQU8sY0FBQztRQUFLLEdBQUcsRUFBQyxHQUFUO1FBQWEsU0FBUyxFQUFDLG9CQUF2QjtRQUE0QyxJQUFJLEVBQUMsUUFBakQ7UUFBMEQsaUJBQWU7TUFBekUsR0FDRixJQUFBcUIsbUJBQUEsRUFBRyxZQUFILENBREUsQ0FBRCxDQUFQO0lBR0g7O0lBQ0QsT0FBT0wsT0FBUDtFQUNIOztFQUVEbkUsTUFBTSxHQUFHO0lBQ0wsSUFBSXlFLFlBQUo7SUFFQSxNQUFNQyxTQUF3QixHQUFHLEVBQWpDO0lBQ0EsSUFBSSxLQUFLakYsS0FBTCxDQUFXa0YsU0FBZixFQUEwQkQsU0FBUyxDQUFDRSxLQUFWLEdBQWtCLEtBQUtuRixLQUFMLENBQVdrRixTQUE3QjtJQUUxQixJQUFJRSxJQUFKOztJQUNBLElBQUksS0FBS3pELEtBQUwsQ0FBV0osUUFBZixFQUF5QjtNQUNyQixJQUFJLEtBQUt2QixLQUFMLENBQVdxRixhQUFmLEVBQThCO1FBQzFCTCxZQUFZLGdCQUNSO1VBQ0ksRUFBRSxFQUFHLEdBQUUsS0FBS2hGLEtBQUwsQ0FBV2EsRUFBRyxRQUR6QjtVQUVJLElBQUksRUFBQyxNQUZUO1VBR0ksU0FBUyxFQUFFLElBSGY7VUFJSSxTQUFTLEVBQUMsb0JBSmQ7VUFLSSxRQUFRLEVBQUUsS0FBS3lFLGFBTG5CO1VBTUksS0FBSyxFQUFFLEtBQUszRCxLQUFMLENBQVdhLFdBTnRCO1VBT0ksSUFBSSxFQUFDLFVBUFQ7VUFRSSxxQkFBa0IsTUFSdEI7VUFTSSx5QkFBd0IsR0FBRSxLQUFLeEMsS0FBTCxDQUFXYSxFQUFHLEtBQUksS0FBS2MsS0FBTCxDQUFXSSxpQkFBa0IsRUFUN0U7VUFVSSxpQkFBZSxLQUFLSixLQUFMLENBQVdKLFFBVjlCO1VBV0ksaUJBQWdCLEdBQUUsS0FBS3ZCLEtBQUwsQ0FBV2EsRUFBRyxVQVhwQztVQVlJLGlCQUFlLEtBQUtiLEtBQUwsQ0FBV2dCLFFBWjlCO1VBYUksY0FBWSxLQUFLaEIsS0FBTCxDQUFXdUYsS0FiM0I7VUFjSSxTQUFTLEVBQUUsS0FBS0M7UUFkcEIsRUFESjtNQWtCSDs7TUFDREosSUFBSSxnQkFDQTtRQUFLLFNBQVMsRUFBQyxrQkFBZjtRQUFrQyxLQUFLLEVBQUVILFNBQXpDO1FBQW9ELElBQUksRUFBQyxTQUF6RDtRQUFtRSxFQUFFLEVBQUcsR0FBRSxLQUFLakYsS0FBTCxDQUFXYSxFQUFHO01BQXhGLEdBQ00sS0FBSzRELGNBQUwsRUFETixDQURKO0lBS0g7O0lBRUQsSUFBSSxDQUFDTyxZQUFMLEVBQW1CO01BQ2YsTUFBTVMsYUFBYSxHQUFHLEtBQUt6RixLQUFMLENBQVcwRixjQUFYLEdBQ2xCLEtBQUsxRixLQUFMLENBQVcwRixjQUFYLENBQTBCLEtBQUsxRixLQUFMLENBQVcwQyxLQUFyQyxDQURrQixHQUVsQixLQUFLaUIsYUFBTCxDQUFtQixLQUFLM0QsS0FBTCxDQUFXMEMsS0FBOUIsQ0FGSjtNQUdBc0MsWUFBWSxnQkFBRztRQUFLLFNBQVMsRUFBQyxvQkFBZjtRQUFvQyxFQUFFLEVBQUcsR0FBRSxLQUFLaEYsS0FBTCxDQUFXYSxFQUFHO01BQXpELEdBQ1Q0RSxhQUFhLElBQUksS0FBS3pGLEtBQUwsQ0FBVzJGLFdBRG5CLENBQWY7SUFHSDs7SUFFRCxNQUFNQyxlQUFlLEdBQUc7TUFDcEJDLFdBQVcsRUFBRSxJQURPO01BRXBCQyxvQkFBb0IsRUFBRSxLQUFLOUYsS0FBTCxDQUFXZ0I7SUFGYixDQUF4Qjs7SUFJQSxJQUFJLEtBQUtoQixLQUFMLENBQVcrRixTQUFmLEVBQTBCO01BQ3RCSCxlQUFlLENBQUMsS0FBSzVGLEtBQUwsQ0FBVytGLFNBQVosQ0FBZixHQUF3QyxJQUF4QztJQUNILENBbERJLENBb0RMO0lBQ0E7OztJQUNBLG9CQUFPO01BQUssU0FBUyxFQUFFLElBQUF0RixtQkFBQSxFQUFXbUYsZUFBWCxDQUFoQjtNQUE2QyxHQUFHLEVBQUUsS0FBS0k7SUFBdkQsZ0JBQ0gsNkJBQUMseUJBQUQ7TUFDSSxTQUFTLEVBQUMsbUNBRGQ7TUFFSSxPQUFPLEVBQUUsS0FBS0MsdUJBRmxCO01BR0ksaUJBQWMsU0FIbEI7TUFJSSxpQkFBZSxLQUFLdEUsS0FBTCxDQUFXSixRQUo5QjtNQUtJLFFBQVEsRUFBRSxLQUFLdkIsS0FBTCxDQUFXZ0IsUUFMekI7TUFNSSxRQUFRLEVBQUUsS0FBSzhDLFNBTm5CO01BT0ksY0FBWSxLQUFLOUQsS0FBTCxDQUFXdUYsS0FQM0I7TUFRSSxvQkFBbUIsR0FBRSxLQUFLdkYsS0FBTCxDQUFXYSxFQUFHLFFBUnZDO01BU0ksYUFBWSxHQUFFLEtBQUtiLEtBQUwsQ0FBV2EsRUFBRyxRQVRoQztNQVVJLFNBQVMsRUFBRSxLQUFLMkU7SUFWcEIsR0FZTVIsWUFaTixlQWFJO01BQU0sU0FBUyxFQUFDO0lBQWhCLEVBYkosRUFjTUksSUFkTixDQURHLENBQVA7RUFrQkg7O0FBaFN3RSJ9