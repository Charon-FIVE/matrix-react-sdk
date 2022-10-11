"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Tabs = exports.ExistingSource = void 0;
exports.getDesktopCapturerSources = getDesktopCapturerSources;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("..//dialogs/BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("./DialogButtons"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _TabbedView = _interopRequireWildcard(require("../../structures/TabbedView"));

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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
function getDesktopCapturerSources() {
  const options = {
    thumbnailSize: {
      height: 176,
      width: 312
    },
    types: ["screen", "window"]
  };
  return _PlatformPeg.default.get().getDesktopCapturerSources(options);
}

let Tabs;
exports.Tabs = Tabs;

(function (Tabs) {
  Tabs["Screens"] = "screen";
  Tabs["Windows"] = "window";
})(Tabs || (exports.Tabs = Tabs = {}));

class ExistingSource extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onClick", () => {
      this.props.onSelect(this.props.source);
    });
  }

  render() {
    const thumbnailClasses = (0, _classnames.default)({
      mx_desktopCapturerSourcePicker_source_thumbnail: true,
      mx_desktopCapturerSourcePicker_source_thumbnail_selected: this.props.selected
    });
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_desktopCapturerSourcePicker_source",
      title: this.props.source.name,
      onClick: this.onClick
    }, /*#__PURE__*/_react.default.createElement("img", {
      className: thumbnailClasses,
      src: this.props.source.thumbnailURL
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_desktopCapturerSourcePicker_source_name"
    }, this.props.source.name));
  }

}

exports.ExistingSource = ExistingSource;

class DesktopCapturerSourcePicker extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "interval", void 0);
    (0, _defineProperty2.default)(this, "onSelect", source => {
      this.setState({
        selectedSource: source
      });
    });
    (0, _defineProperty2.default)(this, "onShare", () => {
      this.props.onFinished(this.state.selectedSource.id);
    });
    (0, _defineProperty2.default)(this, "onTabChange", () => {
      this.setState({
        selectedSource: null
      });
    });
    (0, _defineProperty2.default)(this, "onCloseClick", () => {
      this.props.onFinished(null);
    });
    this.state = {
      selectedTab: Tabs.Screens,
      sources: [],
      selectedSource: null
    };
  }

  async componentDidMount() {
    // setInterval() first waits and then executes, therefore
    // we call getDesktopCapturerSources() here without any delay.
    // Otherwise the dialog would be left empty for some time.
    this.setState({
      sources: await getDesktopCapturerSources()
    }); // We update the sources every 500ms to get newer thumbnails

    this.interval = setInterval(async () => {
      this.setState({
        sources: await getDesktopCapturerSources()
      });
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getTab(type, label) {
    const sources = this.state.sources.filter(source => source.id.startsWith(type)).map(source => {
      return /*#__PURE__*/_react.default.createElement(ExistingSource, {
        selected: this.state.selectedSource?.id === source.id,
        source: source,
        onSelect: this.onSelect,
        key: source.id
      });
    });
    return new _TabbedView.Tab(type, label, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_desktopCapturerSourcePicker_tab"
    }, sources));
  }

  render() {
    const tabs = [this.getTab("screen", (0, _languageHandler._t)("Share entire screen")), this.getTab("window", (0, _languageHandler._t)("Application window"))];
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_desktopCapturerSourcePicker",
      onFinished: this.onCloseClick,
      title: (0, _languageHandler._t)("Share content")
    }, /*#__PURE__*/_react.default.createElement(_TabbedView.default, {
      tabs: tabs,
      tabLocation: _TabbedView.TabLocation.TOP,
      onChange: this.onTabChange
    }), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Share"),
      hasCancel: true,
      onCancel: this.onCloseClick,
      onPrimaryButtonClick: this.onShare,
      primaryDisabled: !this.state.selectedSource
    }));
  }

}

exports.default = DesktopCapturerSourcePicker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXREZXNrdG9wQ2FwdHVyZXJTb3VyY2VzIiwib3B0aW9ucyIsInRodW1ibmFpbFNpemUiLCJoZWlnaHQiLCJ3aWR0aCIsInR5cGVzIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJUYWJzIiwiRXhpc3RpbmdTb3VyY2UiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJvblNlbGVjdCIsInNvdXJjZSIsInJlbmRlciIsInRodW1ibmFpbENsYXNzZXMiLCJjbGFzc05hbWVzIiwibXhfZGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyX3NvdXJjZV90aHVtYm5haWwiLCJteF9kZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXJfc291cmNlX3RodW1ibmFpbF9zZWxlY3RlZCIsInNlbGVjdGVkIiwibmFtZSIsIm9uQ2xpY2siLCJ0aHVtYm5haWxVUkwiLCJEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXIiLCJzZXRTdGF0ZSIsInNlbGVjdGVkU291cmNlIiwib25GaW5pc2hlZCIsInN0YXRlIiwiaWQiLCJzZWxlY3RlZFRhYiIsIlNjcmVlbnMiLCJzb3VyY2VzIiwiY29tcG9uZW50RGlkTW91bnQiLCJpbnRlcnZhbCIsInNldEludGVydmFsIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJjbGVhckludGVydmFsIiwiZ2V0VGFiIiwidHlwZSIsImxhYmVsIiwiZmlsdGVyIiwic3RhcnRzV2l0aCIsIm1hcCIsIlRhYiIsInRhYnMiLCJfdCIsIm9uQ2xvc2VDbGljayIsIlRhYkxvY2F0aW9uIiwiVE9QIiwib25UYWJDaGFuZ2UiLCJvblNoYXJlIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgxaBpbW9uIEJyYW5kbmVyIDxzaW1vbi5icmEuYWdAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4uLy9kaWFsb2dzL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgVGFiYmVkVmlldywgeyBUYWIsIFRhYkxvY2F0aW9uIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9UYWJiZWRWaWV3JztcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi4vLi4vLi4vUGxhdGZvcm1QZWdcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlc2t0b3BDYXB0dXJlclNvdXJjZXMoKTogUHJvbWlzZTxBcnJheTxEZXNrdG9wQ2FwdHVyZXJTb3VyY2U+PiB7XG4gICAgY29uc3Qgb3B0aW9uczogR2V0U291cmNlc09wdGlvbnMgPSB7XG4gICAgICAgIHRodW1ibmFpbFNpemU6IHtcbiAgICAgICAgICAgIGhlaWdodDogMTc2LFxuICAgICAgICAgICAgd2lkdGg6IDMxMixcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZXM6IFtcbiAgICAgICAgICAgIFwic2NyZWVuXCIsXG4gICAgICAgICAgICBcIndpbmRvd1wiLFxuICAgICAgICBdLFxuICAgIH07XG4gICAgcmV0dXJuIFBsYXRmb3JtUGVnLmdldCgpLmdldERlc2t0b3BDYXB0dXJlclNvdXJjZXMob3B0aW9ucyk7XG59XG5cbmV4cG9ydCBlbnVtIFRhYnMge1xuICAgIFNjcmVlbnMgPSBcInNjcmVlblwiLFxuICAgIFdpbmRvd3MgPSBcIndpbmRvd1wiLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4aXN0aW5nU291cmNlSVByb3BzIHtcbiAgICBzb3VyY2U6IERlc2t0b3BDYXB0dXJlclNvdXJjZTtcbiAgICBvblNlbGVjdChzb3VyY2U6IERlc2t0b3BDYXB0dXJlclNvdXJjZSk6IHZvaWQ7XG4gICAgc2VsZWN0ZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBFeGlzdGluZ1NvdXJjZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxFeGlzdGluZ1NvdXJjZUlQcm9wcz4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBFeGlzdGluZ1NvdXJjZUlQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHRoaXMucHJvcHMuc291cmNlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB0aHVtYm5haWxDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBteF9kZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXJfc291cmNlX3RodW1ibmFpbDogdHJ1ZSxcbiAgICAgICAgICAgIG14X2Rlc2t0b3BDYXB0dXJlclNvdXJjZVBpY2tlcl9zb3VyY2VfdGh1bWJuYWlsX3NlbGVjdGVkOiB0aGlzLnByb3BzLnNlbGVjdGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9kZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXJfc291cmNlXCJcbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy5zb3VyY2UubmFtZX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3RodW1ibmFpbENsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgIHNyYz17dGhpcy5wcm9wcy5zb3VyY2UudGh1bWJuYWlsVVJMfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfZGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyX3NvdXJjZV9uYW1lXCI+eyB0aGlzLnByb3BzLnNvdXJjZS5uYW1lIH08L3NwYW4+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBpY2tlcklTdGF0ZSB7XG4gICAgc2VsZWN0ZWRUYWI6IFRhYnM7XG4gICAgc291cmNlczogQXJyYXk8RGVza3RvcENhcHR1cmVyU291cmNlPjtcbiAgICBzZWxlY3RlZFNvdXJjZTogRGVza3RvcENhcHR1cmVyU291cmNlIHwgbnVsbDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGlja2VySVByb3BzIHtcbiAgICBvbkZpbmlzaGVkKHNvdXJjZUlkOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8XG4gICAgUGlja2VySVByb3BzLFxuICAgIFBpY2tlcklTdGF0ZVxuPiB7XG4gICAgaW50ZXJ2YWw6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBQaWNrZXJJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZFRhYjogVGFicy5TY3JlZW5zLFxuICAgICAgICAgICAgc291cmNlczogW10sXG4gICAgICAgICAgICBzZWxlY3RlZFNvdXJjZTogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gc2V0SW50ZXJ2YWwoKSBmaXJzdCB3YWl0cyBhbmQgdGhlbiBleGVjdXRlcywgdGhlcmVmb3JlXG4gICAgICAgIC8vIHdlIGNhbGwgZ2V0RGVza3RvcENhcHR1cmVyU291cmNlcygpIGhlcmUgd2l0aG91dCBhbnkgZGVsYXkuXG4gICAgICAgIC8vIE90aGVyd2lzZSB0aGUgZGlhbG9nIHdvdWxkIGJlIGxlZnQgZW1wdHkgZm9yIHNvbWUgdGltZS5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzb3VyY2VzOiBhd2FpdCBnZXREZXNrdG9wQ2FwdHVyZXJTb3VyY2VzKCksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFdlIHVwZGF0ZSB0aGUgc291cmNlcyBldmVyeSA1MDBtcyB0byBnZXQgbmV3ZXIgdGh1bWJuYWlsc1xuICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc291cmNlczogYXdhaXQgZ2V0RGVza3RvcENhcHR1cmVyU291cmNlcygpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlbGVjdCA9IChzb3VyY2U6IERlc2t0b3BDYXB0dXJlclNvdXJjZSk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWRTb3VyY2U6IHNvdXJjZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNoYXJlID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodGhpcy5zdGF0ZS5zZWxlY3RlZFNvdXJjZS5pZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25UYWJDaGFuZ2UgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZFNvdXJjZTogbnVsbCB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsb3NlQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChudWxsKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRUYWIodHlwZTogXCJzY3JlZW5cIiB8IFwid2luZG93XCIsIGxhYmVsOiBzdHJpbmcpOiBUYWIge1xuICAgICAgICBjb25zdCBzb3VyY2VzID0gdGhpcy5zdGF0ZS5zb3VyY2VzLmZpbHRlcigoc291cmNlKSA9PiBzb3VyY2UuaWQuc3RhcnRzV2l0aCh0eXBlKSkubWFwKChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPEV4aXN0aW5nU291cmNlXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXt0aGlzLnN0YXRlLnNlbGVjdGVkU291cmNlPy5pZCA9PT0gc291cmNlLmlkfVxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U9e3NvdXJjZX1cbiAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Q9e3RoaXMub25TZWxlY3R9XG4gICAgICAgICAgICAgICAgICAgIGtleT17c291cmNlLmlkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbmV3IFRhYih0eXBlLCBsYWJlbCwgbnVsbCwgKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9kZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXJfdGFiXCI+XG4gICAgICAgICAgICAgICAgeyBzb3VyY2VzIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHRhYnMgPSBbXG4gICAgICAgICAgICB0aGlzLmdldFRhYihcInNjcmVlblwiLCBfdChcIlNoYXJlIGVudGlyZSBzY3JlZW5cIikpLFxuICAgICAgICAgICAgdGhpcy5nZXRUYWIoXCJ3aW5kb3dcIiwgX3QoXCJBcHBsaWNhdGlvbiB3aW5kb3dcIikpLFxuICAgICAgICBdO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X2Rlc2t0b3BDYXB0dXJlclNvdXJjZVBpY2tlclwiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlQ2xpY2t9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiU2hhcmUgY29udGVudFwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8VGFiYmVkVmlldyB0YWJzPXt0YWJzfSB0YWJMb2NhdGlvbj17VGFiTG9jYXRpb24uVE9QfSBvbkNoYW5nZT17dGhpcy5vblRhYkNoYW5nZX0gLz5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIlNoYXJlXCIpfVxuICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uQ2xvc2VDbGlja31cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25TaGFyZX1cbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXshdGhpcy5zdGF0ZS5zZWxlY3RlZFNvdXJjZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWU8sU0FBU0EseUJBQVQsR0FBNEU7RUFDL0UsTUFBTUMsT0FBMEIsR0FBRztJQUMvQkMsYUFBYSxFQUFFO01BQ1hDLE1BQU0sRUFBRSxHQURHO01BRVhDLEtBQUssRUFBRTtJQUZJLENBRGdCO0lBSy9CQyxLQUFLLEVBQUUsQ0FDSCxRQURHLEVBRUgsUUFGRztFQUx3QixDQUFuQztFQVVBLE9BQU9DLG9CQUFBLENBQVlDLEdBQVosR0FBa0JQLHlCQUFsQixDQUE0Q0MsT0FBNUMsQ0FBUDtBQUNIOztJQUVXTyxJOzs7V0FBQUEsSTtFQUFBQSxJO0VBQUFBLEk7R0FBQUEsSSxvQkFBQUEsSTs7QUFXTCxNQUFNQyxjQUFOLFNBQTZCQyxjQUFBLENBQU1DLFNBQW5DLENBQW1FO0VBQ3RFQyxX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