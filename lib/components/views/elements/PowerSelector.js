"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var Roles = _interopRequireWildcard(require("../../../Roles"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("./Field"));

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd

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
const CUSTOM_VALUE = "SELECT_VALUE_CUSTOM";

class PowerSelector extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onSelectChange", event => {
      const isCustom = event.target.value === CUSTOM_VALUE;

      if (isCustom) {
        this.setState({
          custom: true
        });
      } else {
        const powerLevel = parseInt(event.target.value);
        this.props.onChange(powerLevel, this.props.powerLevelKey);
        this.setState({
          selectValue: powerLevel
        });
      }
    });
    (0, _defineProperty2.default)(this, "onCustomChange", event => {
      this.setState({
        customValue: parseInt(event.target.value)
      });
    });
    (0, _defineProperty2.default)(this, "onCustomBlur", event => {
      event.preventDefault();
      event.stopPropagation();
      this.props.onChange(this.state.customValue, this.props.powerLevelKey);
    });
    (0, _defineProperty2.default)(this, "onCustomKeyDown", event => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(event);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Enter:
          event.preventDefault();
          event.stopPropagation(); // Do not call the onChange handler directly here - it can cause an infinite loop.
          // Long story short, a user hits Enter to submit the value which onChange handles as
          // raising a dialog which causes a blur which causes a dialog which causes a blur and
          // so on. By not causing the onChange to be called here, we avoid the loop because we
          // handle the onBlur safely.

          event.target.blur();
          break;
      }
    });
    this.state = {
      levelRoleMap: {},
      // List of power levels to show in the drop-down
      options: [],
      customValue: this.props.value,
      selectValue: 0
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention


  UNSAFE_componentWillMount() {
    this.initStateFromProps(this.props);
  } // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention


  UNSAFE_componentWillReceiveProps(newProps) {
    this.initStateFromProps(newProps);
  }

  initStateFromProps(newProps) {
    // This needs to be done now because levelRoleMap has translated strings
    const levelRoleMap = Roles.levelRoleMap(newProps.usersDefault);
    const options = Object.keys(levelRoleMap).filter(level => {
      return level === undefined || parseInt(level) <= newProps.maxValue || parseInt(level) == newProps.value;
    }).map(level => parseInt(level));
    const isCustom = levelRoleMap[newProps.value] === undefined;
    this.setState({
      levelRoleMap,
      options,
      custom: isCustom,
      customLevel: newProps.value,
      selectValue: isCustom ? CUSTOM_VALUE : newProps.value
    });
  }

  render() {
    let picker;
    const label = typeof this.props.label === "undefined" ? (0, _languageHandler._t)("Power level") : this.props.label;

    if (this.state.custom) {
      picker = /*#__PURE__*/_react.default.createElement(_Field.default, {
        type: "number",
        label: label,
        max: this.props.maxValue,
        onBlur: this.onCustomBlur,
        onKeyDown: this.onCustomKeyDown,
        onChange: this.onCustomChange,
        value: String(this.state.customValue),
        disabled: this.props.disabled
      });
    } else {
      // Each level must have a definition in this.state.levelRoleMap
      const options = this.state.options.map(level => {
        return {
          value: String(level),
          text: Roles.textualPowerLevel(level, this.props.usersDefault)
        };
      });
      options.push({
        value: CUSTOM_VALUE,
        text: (0, _languageHandler._t)("Custom level")
      });
      const optionsElements = options.map(op => {
        return /*#__PURE__*/_react.default.createElement("option", {
          value: op.value,
          key: op.value
        }, op.text);
      });
      picker = /*#__PURE__*/_react.default.createElement(_Field.default, {
        element: "select",
        label: label,
        onChange: this.onSelectChange,
        value: String(this.state.selectValue),
        disabled: this.props.disabled
      }, optionsElements);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PowerSelector"
    }, picker);
  }

}

exports.default = PowerSelector;
(0, _defineProperty2.default)(PowerSelector, "defaultProps", {
  maxValue: Infinity,
  usersDefault: 0
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDVVNUT01fVkFMVUUiLCJQb3dlclNlbGVjdG9yIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXZlbnQiLCJpc0N1c3RvbSIsInRhcmdldCIsInZhbHVlIiwic2V0U3RhdGUiLCJjdXN0b20iLCJwb3dlckxldmVsIiwicGFyc2VJbnQiLCJvbkNoYW5nZSIsInBvd2VyTGV2ZWxLZXkiLCJzZWxlY3RWYWx1ZSIsImN1c3RvbVZhbHVlIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzdGF0ZSIsImFjdGlvbiIsImdldEtleUJpbmRpbmdzTWFuYWdlciIsImdldEFjY2Vzc2liaWxpdHlBY3Rpb24iLCJLZXlCaW5kaW5nQWN0aW9uIiwiRW50ZXIiLCJibHVyIiwibGV2ZWxSb2xlTWFwIiwib3B0aW9ucyIsIlVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQiLCJpbml0U3RhdGVGcm9tUHJvcHMiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5ld1Byb3BzIiwiUm9sZXMiLCJ1c2Vyc0RlZmF1bHQiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwibGV2ZWwiLCJ1bmRlZmluZWQiLCJtYXhWYWx1ZSIsIm1hcCIsImN1c3RvbUxldmVsIiwicmVuZGVyIiwicGlja2VyIiwibGFiZWwiLCJfdCIsIm9uQ3VzdG9tQmx1ciIsIm9uQ3VzdG9tS2V5RG93biIsIm9uQ3VzdG9tQ2hhbmdlIiwiU3RyaW5nIiwiZGlzYWJsZWQiLCJ0ZXh0IiwidGV4dHVhbFBvd2VyTGV2ZWwiLCJwdXNoIiwib3B0aW9uc0VsZW1lbnRzIiwib3AiLCJvblNlbGVjdENoYW5nZSIsIkluZmluaXR5Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvUG93ZXJTZWxlY3Rvci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0ICogYXMgUm9sZXMgZnJvbSAnLi4vLi4vLi4vUm9sZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuL0ZpZWxkXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCB7IGdldEtleUJpbmRpbmdzTWFuYWdlciB9IGZyb20gXCIuLi8uLi8uLi9LZXlCaW5kaW5nc01hbmFnZXJcIjtcblxuY29uc3QgQ1VTVE9NX1ZBTFVFID0gXCJTRUxFQ1RfVkFMVUVfQ1VTVE9NXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHZhbHVlOiBudW1iZXI7XG4gICAgLy8gVGhlIG1heGltdW0gdmFsdWUgdGhhdCBjYW4gYmUgc2V0IHdpdGggdGhlIHBvd2VyIHNlbGVjdG9yXG4gICAgbWF4VmFsdWU6IG51bWJlcjtcblxuICAgIC8vIERlZmF1bHQgdXNlciBwb3dlciBsZXZlbCBmb3IgdGhlIHJvb21cbiAgICB1c2Vyc0RlZmF1bHQ6IG51bWJlcjtcblxuICAgIC8vIHNob3VsZCB0aGUgdXNlciBiZSBhYmxlIHRvIGNoYW5nZSB0aGUgdmFsdWU/IGZhbHNlIGJ5IGRlZmF1bHQuXG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICAgIG9uQ2hhbmdlPzogKHZhbHVlOiBudW1iZXIsIHBvd2VyTGV2ZWxLZXk6IHN0cmluZykgPT4gdm9pZDtcblxuICAgIC8vIE9wdGlvbmFsIGtleSB0byBwYXNzIGFzIHRoZSBzZWNvbmQgYXJndW1lbnQgdG8gYG9uQ2hhbmdlYFxuICAgIHBvd2VyTGV2ZWxLZXk/OiBzdHJpbmc7XG5cbiAgICAvLyBUaGUgbmFtZSB0byBhbm5vdGF0ZSB0aGUgc2VsZWN0b3Igd2l0aFxuICAgIGxhYmVsPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBsZXZlbFJvbGVNYXA6IHt9O1xuICAgIC8vIExpc3Qgb2YgcG93ZXIgbGV2ZWxzIHRvIHNob3cgaW4gdGhlIGRyb3AtZG93blxuICAgIG9wdGlvbnM6IG51bWJlcltdO1xuXG4gICAgY3VzdG9tVmFsdWU6IG51bWJlcjtcbiAgICBzZWxlY3RWYWx1ZTogbnVtYmVyIHwgc3RyaW5nO1xuICAgIGN1c3RvbT86IGJvb2xlYW47XG4gICAgY3VzdG9tTGV2ZWw/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvd2VyU2VsZWN0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwdWJsaWMgc3RhdGljIGRlZmF1bHRQcm9wczogUGFydGlhbDxJUHJvcHM+ID0ge1xuICAgICAgICBtYXhWYWx1ZTogSW5maW5pdHksXG4gICAgICAgIHVzZXJzRGVmYXVsdDogMCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxldmVsUm9sZU1hcDoge30sXG4gICAgICAgICAgICAvLyBMaXN0IG9mIHBvd2VyIGxldmVscyB0byBzaG93IGluIHRoZSBkcm9wLWRvd25cbiAgICAgICAgICAgIG9wdGlvbnM6IFtdLFxuXG4gICAgICAgICAgICBjdXN0b21WYWx1ZTogdGhpcy5wcm9wcy52YWx1ZSxcbiAgICAgICAgICAgIHNlbGVjdFZhbHVlOiAwLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZSwgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG4gICAgcHVibGljIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaW5pdFN0YXRlRnJvbVByb3BzKHRoaXMucHJvcHMpO1xuICAgIH1cblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2UsIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuICAgIHB1YmxpYyBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wczogSVByb3BzKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaW5pdFN0YXRlRnJvbVByb3BzKG5ld1Byb3BzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRTdGF0ZUZyb21Qcm9wcyhuZXdQcm9wczogSVByb3BzKTogdm9pZCB7XG4gICAgICAgIC8vIFRoaXMgbmVlZHMgdG8gYmUgZG9uZSBub3cgYmVjYXVzZSBsZXZlbFJvbGVNYXAgaGFzIHRyYW5zbGF0ZWQgc3RyaW5nc1xuICAgICAgICBjb25zdCBsZXZlbFJvbGVNYXAgPSBSb2xlcy5sZXZlbFJvbGVNYXAobmV3UHJvcHMudXNlcnNEZWZhdWx0KTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5rZXlzKGxldmVsUm9sZU1hcCkuZmlsdGVyKGxldmVsID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgbGV2ZWwgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgICAgIHBhcnNlSW50KGxldmVsKSA8PSBuZXdQcm9wcy5tYXhWYWx1ZSB8fFxuICAgICAgICAgICAgICAgIHBhcnNlSW50KGxldmVsKSA9PSBuZXdQcm9wcy52YWx1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSkubWFwKGxldmVsID0+IHBhcnNlSW50KGxldmVsKSk7XG5cbiAgICAgICAgY29uc3QgaXNDdXN0b20gPSBsZXZlbFJvbGVNYXBbbmV3UHJvcHMudmFsdWVdID09PSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsZXZlbFJvbGVNYXAsXG4gICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgY3VzdG9tOiBpc0N1c3RvbSxcbiAgICAgICAgICAgIGN1c3RvbUxldmVsOiBuZXdQcm9wcy52YWx1ZSxcbiAgICAgICAgICAgIHNlbGVjdFZhbHVlOiBpc0N1c3RvbSA/IENVU1RPTV9WQUxVRSA6IG5ld1Byb3BzLnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2VsZWN0Q2hhbmdlID0gKGV2ZW50OiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MU2VsZWN0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgaXNDdXN0b20gPSBldmVudC50YXJnZXQudmFsdWUgPT09IENVU1RPTV9WQUxVRTtcbiAgICAgICAgaWYgKGlzQ3VzdG9tKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY3VzdG9tOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcG93ZXJMZXZlbCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHBvd2VyTGV2ZWwsIHRoaXMucHJvcHMucG93ZXJMZXZlbEtleSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0VmFsdWU6IHBvd2VyTGV2ZWwgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkN1c3RvbUNoYW5nZSA9IChldmVudDogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1c3RvbVZhbHVlOiBwYXJzZUludChldmVudC50YXJnZXQudmFsdWUpIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ3VzdG9tQmx1ciA9IChldmVudDogUmVhY3QuRm9jdXNFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMuc3RhdGUuY3VzdG9tVmFsdWUsIHRoaXMucHJvcHMucG93ZXJMZXZlbEtleSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DdXN0b21LZXlEb3duID0gKGV2ZW50OiBSZWFjdC5LZXlib2FyZEV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXZlbnQpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVudGVyOlxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBEbyBub3QgY2FsbCB0aGUgb25DaGFuZ2UgaGFuZGxlciBkaXJlY3RseSBoZXJlIC0gaXQgY2FuIGNhdXNlIGFuIGluZmluaXRlIGxvb3AuXG4gICAgICAgICAgICAgICAgLy8gTG9uZyBzdG9yeSBzaG9ydCwgYSB1c2VyIGhpdHMgRW50ZXIgdG8gc3VibWl0IHRoZSB2YWx1ZSB3aGljaCBvbkNoYW5nZSBoYW5kbGVzIGFzXG4gICAgICAgICAgICAgICAgLy8gcmFpc2luZyBhIGRpYWxvZyB3aGljaCBjYXVzZXMgYSBibHVyIHdoaWNoIGNhdXNlcyBhIGRpYWxvZyB3aGljaCBjYXVzZXMgYSBibHVyIGFuZFxuICAgICAgICAgICAgICAgIC8vIHNvIG9uLiBCeSBub3QgY2F1c2luZyB0aGUgb25DaGFuZ2UgdG8gYmUgY2FsbGVkIGhlcmUsIHdlIGF2b2lkIHRoZSBsb29wIGJlY2F1c2Ugd2VcbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgdGhlIG9uQmx1ciBzYWZlbHkuXG4gICAgICAgICAgICAgICAgKGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5ibHVyKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBwaWNrZXI7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gdHlwZW9mIHRoaXMucHJvcHMubGFiZWwgPT09IFwidW5kZWZpbmVkXCIgPyBfdChcIlBvd2VyIGxldmVsXCIpIDogdGhpcy5wcm9wcy5sYWJlbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VzdG9tKSB7XG4gICAgICAgICAgICBwaWNrZXIgPSAoXG4gICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17bGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIG1heD17dGhpcy5wcm9wcy5tYXhWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uQ3VzdG9tQmx1cn1cbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uQ3VzdG9tS2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DdXN0b21DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtTdHJpbmcodGhpcy5zdGF0ZS5jdXN0b21WYWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRWFjaCBsZXZlbCBtdXN0IGhhdmUgYSBkZWZpbml0aW9uIGluIHRoaXMuc3RhdGUubGV2ZWxSb2xlTWFwXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zLm1hcCgobGV2ZWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogU3RyaW5nKGxldmVsKSxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogUm9sZXMudGV4dHVhbFBvd2VyTGV2ZWwobGV2ZWwsIHRoaXMucHJvcHMudXNlcnNEZWZhdWx0KSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvcHRpb25zLnB1c2goeyB2YWx1ZTogQ1VTVE9NX1ZBTFVFLCB0ZXh0OiBfdChcIkN1c3RvbSBsZXZlbFwiKSB9KTtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnNFbGVtZW50cyA9IG9wdGlvbnMubWFwKChvcCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiA8b3B0aW9uIHZhbHVlPXtvcC52YWx1ZX0ga2V5PXtvcC52YWx1ZX0+eyBvcC50ZXh0IH08L29wdGlvbj47XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcGlja2VyID0gKFxuICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50PVwic2VsZWN0XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblNlbGVjdENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e1N0cmluZyh0aGlzLnN0YXRlLnNlbGVjdFZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IG9wdGlvbnNFbGVtZW50cyB9XG4gICAgICAgICAgICAgICAgPC9GaWVsZD5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Qb3dlclNlbGVjdG9yXCI+XG4gICAgICAgICAgICAgICAgeyBwaWNrZXIgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVBLE1BQU1BLFlBQVksR0FBRyxxQkFBckI7O0FBZ0NlLE1BQU1DLGFBQU4sU0FBNEJDLGNBQUEsQ0FBTUMsU0FBbEMsQ0FB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