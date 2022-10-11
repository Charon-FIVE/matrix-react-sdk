"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TabLocation = exports.Tab = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../languageHandler");

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _PosthogTrackers = require("../../PosthogTrackers");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 Travis Ralston
Copyright 2019 New Vector Ltd
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

/**
 * Represents a tab for the TabbedView.
 */
class Tab {
  /**
   * Creates a new tab.
   * @param {string} id The tab's ID.
   * @param {string} label The untranslated tab label.
   * @param {string} icon The class for the tab icon. This should be a simple mask.
   * @param {React.ReactNode} body The JSX for the tab container.
   * @param {string} screenName The screen name to report to Posthog.
   */
  constructor(id, label, icon, body, screenName) {
    this.id = id;
    this.label = label;
    this.icon = icon;
    this.body = body;
    this.screenName = screenName;
  }

}

exports.Tab = Tab;
let TabLocation;
exports.TabLocation = TabLocation;

(function (TabLocation) {
  TabLocation["LEFT"] = "left";
  TabLocation["TOP"] = "top";
})(TabLocation || (exports.TabLocation = TabLocation = {}));

class TabbedView extends React.Component {
  constructor(props) {
    super(props);
    const initialTabIdIsValid = props.tabs.find(tab => tab.id === props.initialTabId);
    this.state = {
      activeTabId: initialTabIdIsValid ? props.initialTabId : props.tabs[0]?.id
    };
  }

  getTabById(id) {
    return this.props.tabs.find(tab => tab.id === id);
  }
  /**
   * Shows the given tab
   * @param {Tab} tab the tab to show
   * @private
   */


  setActiveTab(tab) {
    // make sure this tab is still in available tabs
    if (!!this.getTabById(tab.id)) {
      if (this.props.onChange) this.props.onChange(tab.id);
      this.setState({
        activeTabId: tab.id
      });
    } else {
      _logger.logger.error("Could not find tab " + tab.label + " in tabs");
    }
  }

  renderTabLabel(tab) {
    let classes = "mx_TabbedView_tabLabel ";
    if (this.state.activeTabId === tab.id) classes += "mx_TabbedView_tabLabel_active";
    let tabIcon = null;

    if (tab.icon) {
      tabIcon = /*#__PURE__*/React.createElement("span", {
        className: `mx_TabbedView_maskedIcon ${tab.icon}`
      });
    }

    const onClickHandler = () => this.setActiveTab(tab);

    const label = (0, _languageHandler._t)(tab.label);
    return /*#__PURE__*/React.createElement(_AccessibleButton.default, {
      className: classes,
      key: "tab_label_" + tab.label,
      onClick: onClickHandler,
      "data-testid": `settings-tab-${tab.id}`
    }, tabIcon, /*#__PURE__*/React.createElement("span", {
      className: "mx_TabbedView_tabLabel_text"
    }, label));
  }

  renderTabPanel(tab) {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx_TabbedView_tabPanel",
      key: "mx_tabpanel_" + tab.label
    }, /*#__PURE__*/React.createElement(_AutoHideScrollbar.default, {
      className: "mx_TabbedView_tabPanelContent"
    }, tab.body));
  }

  render() {
    const labels = this.props.tabs.map(tab => this.renderTabLabel(tab));
    const tab = this.getTabById(this.state.activeTabId);
    const panel = tab ? this.renderTabPanel(tab) : null;
    const tabbedViewClasses = (0, _classnames.default)({
      'mx_TabbedView': true,
      'mx_TabbedView_tabsOnLeft': this.props.tabLocation == TabLocation.LEFT,
      'mx_TabbedView_tabsOnTop': this.props.tabLocation == TabLocation.TOP
    });
    return /*#__PURE__*/React.createElement("div", {
      className: tabbedViewClasses
    }, /*#__PURE__*/React.createElement(_PosthogTrackers.PosthogScreenTracker, {
      screenName: tab?.screenName ?? this.props.screenName
    }), /*#__PURE__*/React.createElement("div", {
      className: "mx_TabbedView_tabLabels"
    }, labels), panel);
  }

}

exports.default = TabbedView;
(0, _defineProperty2.default)(TabbedView, "defaultProps", {
  tabLocation: TabLocation.LEFT
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWIiLCJjb25zdHJ1Y3RvciIsImlkIiwibGFiZWwiLCJpY29uIiwiYm9keSIsInNjcmVlbk5hbWUiLCJUYWJMb2NhdGlvbiIsIlRhYmJlZFZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsInByb3BzIiwiaW5pdGlhbFRhYklkSXNWYWxpZCIsInRhYnMiLCJmaW5kIiwidGFiIiwiaW5pdGlhbFRhYklkIiwic3RhdGUiLCJhY3RpdmVUYWJJZCIsImdldFRhYkJ5SWQiLCJzZXRBY3RpdmVUYWIiLCJvbkNoYW5nZSIsInNldFN0YXRlIiwibG9nZ2VyIiwiZXJyb3IiLCJyZW5kZXJUYWJMYWJlbCIsImNsYXNzZXMiLCJ0YWJJY29uIiwib25DbGlja0hhbmRsZXIiLCJfdCIsInJlbmRlclRhYlBhbmVsIiwicmVuZGVyIiwibGFiZWxzIiwibWFwIiwicGFuZWwiLCJ0YWJiZWRWaWV3Q2xhc3NlcyIsImNsYXNzTmFtZXMiLCJ0YWJMb2NhdGlvbiIsIkxFRlQiLCJUT1AiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL1RhYmJlZFZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSAnLi9BdXRvSGlkZVNjcm9sbGJhcic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgUG9zdGhvZ1NjcmVlblRyYWNrZXIsIFNjcmVlbk5hbWUgfSBmcm9tIFwiLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRhYiBmb3IgdGhlIFRhYmJlZFZpZXcuXG4gKi9cbmV4cG9ydCBjbGFzcyBUYWIge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgdGFiLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBUaGUgdGFiJ3MgSUQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIFRoZSB1bnRyYW5zbGF0ZWQgdGFiIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpY29uIFRoZSBjbGFzcyBmb3IgdGhlIHRhYiBpY29uLiBUaGlzIHNob3VsZCBiZSBhIHNpbXBsZSBtYXNrLlxuICAgICAqIEBwYXJhbSB7UmVhY3QuUmVhY3ROb2RlfSBib2R5IFRoZSBKU1ggZm9yIHRoZSB0YWIgY29udGFpbmVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzY3JlZW5OYW1lIFRoZSBzY3JlZW4gbmFtZSB0byByZXBvcnQgdG8gUG9zdGhvZy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmcsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBsYWJlbDogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgaWNvbjogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgYm9keTogUmVhY3QuUmVhY3ROb2RlLFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgc2NyZWVuTmFtZT86IFNjcmVlbk5hbWUsXG4gICAgKSB7fVxufVxuXG5leHBvcnQgZW51bSBUYWJMb2NhdGlvbiB7XG4gICAgTEVGVCA9ICdsZWZ0JyxcbiAgICBUT1AgPSAndG9wJyxcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdGFiczogVGFiW107XG4gICAgaW5pdGlhbFRhYklkPzogc3RyaW5nO1xuICAgIHRhYkxvY2F0aW9uOiBUYWJMb2NhdGlvbjtcbiAgICBvbkNoYW5nZT86ICh0YWJJZDogc3RyaW5nKSA9PiB2b2lkO1xuICAgIHNjcmVlbk5hbWU/OiBTY3JlZW5OYW1lO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBhY3RpdmVUYWJJZDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJiZWRWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgaW5pdGlhbFRhYklkSXNWYWxpZCA9IHByb3BzLnRhYnMuZmluZCh0YWIgPT4gdGFiLmlkID09PSBwcm9wcy5pbml0aWFsVGFiSWQpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgYWN0aXZlVGFiSWQ6IGluaXRpYWxUYWJJZElzVmFsaWQgPyBwcm9wcy5pbml0aWFsVGFiSWQgOiBwcm9wcy50YWJzWzBdPy5pZCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICB0YWJMb2NhdGlvbjogVGFiTG9jYXRpb24uTEVGVCxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRUYWJCeUlkKGlkOiBzdHJpbmcpOiBUYWIgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy50YWJzLmZpbmQodGFiID0+IHRhYi5pZCA9PT0gaWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIHRoZSBnaXZlbiB0YWJcbiAgICAgKiBAcGFyYW0ge1RhYn0gdGFiIHRoZSB0YWIgdG8gc2hvd1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRBY3RpdmVUYWIodGFiOiBUYWIpIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoaXMgdGFiIGlzIHN0aWxsIGluIGF2YWlsYWJsZSB0YWJzXG4gICAgICAgIGlmICghIXRoaXMuZ2V0VGFiQnlJZCh0YWIuaWQpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkgdGhpcy5wcm9wcy5vbkNoYW5nZSh0YWIuaWQpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZVRhYklkOiB0YWIuaWQgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJDb3VsZCBub3QgZmluZCB0YWIgXCIgKyB0YWIubGFiZWwgKyBcIiBpbiB0YWJzXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJUYWJMYWJlbCh0YWI6IFRhYikge1xuICAgICAgICBsZXQgY2xhc3NlcyA9IFwibXhfVGFiYmVkVmlld190YWJMYWJlbCBcIjtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVUYWJJZCA9PT0gdGFiLmlkKSBjbGFzc2VzICs9IFwibXhfVGFiYmVkVmlld190YWJMYWJlbF9hY3RpdmVcIjtcblxuICAgICAgICBsZXQgdGFiSWNvbiA9IG51bGw7XG4gICAgICAgIGlmICh0YWIuaWNvbikge1xuICAgICAgICAgICAgdGFiSWNvbiA9IDxzcGFuIGNsYXNzTmFtZT17YG14X1RhYmJlZFZpZXdfbWFza2VkSWNvbiAke3RhYi5pY29ufWB9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb25DbGlja0hhbmRsZXIgPSAoKSA9PiB0aGlzLnNldEFjdGl2ZVRhYih0YWIpO1xuXG4gICAgICAgIGNvbnN0IGxhYmVsID0gX3QodGFiLmxhYmVsKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgIGtleT17XCJ0YWJfbGFiZWxfXCIgKyB0YWIubGFiZWx9XG4gICAgICAgICAgICAgICAgb25DbGljaz17b25DbGlja0hhbmRsZXJ9XG4gICAgICAgICAgICAgICAgZGF0YS10ZXN0aWQ9e2BzZXR0aW5ncy10YWItJHt0YWIuaWR9YH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IHRhYkljb24gfVxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1RhYmJlZFZpZXdfdGFiTGFiZWxfdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJUYWJQYW5lbCh0YWI6IFRhYik6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1RhYmJlZFZpZXdfdGFiUGFuZWxcIiBrZXk9e1wibXhfdGFicGFuZWxfXCIgKyB0YWIubGFiZWx9PlxuICAgICAgICAgICAgICAgIDxBdXRvSGlkZVNjcm9sbGJhciBjbGFzc05hbWU9J214X1RhYmJlZFZpZXdfdGFiUGFuZWxDb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgeyB0YWIuYm9keSB9XG4gICAgICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAgICAgY29uc3QgbGFiZWxzID0gdGhpcy5wcm9wcy50YWJzLm1hcCh0YWIgPT4gdGhpcy5yZW5kZXJUYWJMYWJlbCh0YWIpKTtcbiAgICAgICAgY29uc3QgdGFiID0gdGhpcy5nZXRUYWJCeUlkKHRoaXMuc3RhdGUuYWN0aXZlVGFiSWQpO1xuICAgICAgICBjb25zdCBwYW5lbCA9IHRhYiA/IHRoaXMucmVuZGVyVGFiUGFuZWwodGFiKSA6IG51bGw7XG5cbiAgICAgICAgY29uc3QgdGFiYmVkVmlld0NsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9UYWJiZWRWaWV3JzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9UYWJiZWRWaWV3X3RhYnNPbkxlZnQnOiB0aGlzLnByb3BzLnRhYkxvY2F0aW9uID09IFRhYkxvY2F0aW9uLkxFRlQsXG4gICAgICAgICAgICAnbXhfVGFiYmVkVmlld190YWJzT25Ub3AnOiB0aGlzLnByb3BzLnRhYkxvY2F0aW9uID09IFRhYkxvY2F0aW9uLlRPUCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXt0YWJiZWRWaWV3Q2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgPFBvc3Rob2dTY3JlZW5UcmFja2VyIHNjcmVlbk5hbWU9e3RhYj8uc2NyZWVuTmFtZSA/PyB0aGlzLnByb3BzLnNjcmVlbk5hbWV9IC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9UYWJiZWRWaWV3X3RhYkxhYmVsc1wiPlxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVscyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBwYW5lbCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFXQTtBQUNBO0FBQ0E7QUFDTyxNQUFNQSxHQUFOLENBQVU7RUFDYjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0lDLFdBQVcsQ0FDU0MsRUFEVCxFQUVTQyxLQUZULEVBR1NDLElBSFQsRUFJU0MsSUFKVCxFQUtTQyxVQUxULEVBTVQ7SUFBQSxLQUxrQkosRUFLbEIsR0FMa0JBLEVBS2xCO0lBQUEsS0FKa0JDLEtBSWxCLEdBSmtCQSxLQUlsQjtJQUFBLEtBSGtCQyxJQUdsQixHQUhrQkEsSUFHbEI7SUFBQSxLQUZrQkMsSUFFbEIsR0FGa0JBLElBRWxCO0lBQUEsS0FEa0JDLFVBQ2xCLEdBRGtCQSxVQUNsQjtFQUFFOztBQWZTOzs7SUFrQkxDLFc7OztXQUFBQSxXO0VBQUFBLFc7RUFBQUEsVztHQUFBQSxXLDJCQUFBQSxXOztBQWlCRyxNQUFNQyxVQUFOLFNBQXlCQyxLQUFLLENBQUNDLFNBQS9CLENBQXlEO0VB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