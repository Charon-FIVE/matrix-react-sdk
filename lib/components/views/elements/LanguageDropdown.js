"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var languageHandler = _interopRequireWildcard(require("../../../languageHandler"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Spinner = _interopRequireDefault(require("./Spinner"));

var _Dropdown = _interopRequireDefault(require("./Dropdown"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 Marcel Radzio (MTRNord)
Copyright 2017 Vector Creations Ltd.

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
function languageMatchesSearchQuery(query, language) {
  if (language.label.toUpperCase().includes(query.toUpperCase())) return true;
  if (language.value.toUpperCase() === query.toUpperCase()) return true;
  return false;
}

class LanguageDropdown extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onSearchChange", search => {
      this.setState({
        searchQuery: search
      });
    });
    this.state = {
      searchQuery: '',
      langs: null
    };
  }

  componentDidMount() {
    languageHandler.getAllLanguagesFromJson().then(langs => {
      langs.sort(function (a, b) {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
      });
      this.setState({
        langs
      });
    }).catch(() => {
      this.setState({
        langs: ['en']
      });
    });

    if (!this.props.value) {
      // If no value is given, we start with the first
      // country selected, but our parent component
      // doesn't know this, therefore we do this.
      const language = languageHandler.getUserLanguage();
      this.props.onOptionChange(language);
    }
  }

  render() {
    if (this.state.langs === null) {
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    let displayedLanguages;

    if (this.state.searchQuery) {
      displayedLanguages = this.state.langs.filter(lang => {
        return languageMatchesSearchQuery(this.state.searchQuery, lang);
      });
    } else {
      displayedLanguages = this.state.langs;
    }

    const options = displayedLanguages.map(language => {
      return /*#__PURE__*/_react.default.createElement("div", {
        key: language.value
      }, language.label);
    }); // default value here too, otherwise we need to handle null / undefined
    // values between mounting and the initial value propagating

    let language = _SettingsStore.default.getValue("language", null,
    /*excludeDefault:*/
    true);

    let value = null;

    if (language) {
      value = this.props.value || language;
    } else {
      language = navigator.language || navigator.userLanguage;
      value = this.props.value || language;
    }

    return /*#__PURE__*/_react.default.createElement(_Dropdown.default, {
      id: "mx_LanguageDropdown",
      className: this.props.className,
      onOptionChange: this.props.onOptionChange,
      onSearchChange: this.onSearchChange,
      searchEnabled: true,
      value: value,
      label: (0, languageHandler._t)("Language Dropdown"),
      disabled: this.props.disabled
    }, options);
  }

}

exports.default = LanguageDropdown;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsYW5ndWFnZU1hdGNoZXNTZWFyY2hRdWVyeSIsInF1ZXJ5IiwibGFuZ3VhZ2UiLCJsYWJlbCIsInRvVXBwZXJDYXNlIiwiaW5jbHVkZXMiLCJ2YWx1ZSIsIkxhbmd1YWdlRHJvcGRvd24iLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzZWFyY2giLCJzZXRTdGF0ZSIsInNlYXJjaFF1ZXJ5Iiwic3RhdGUiLCJsYW5ncyIsImNvbXBvbmVudERpZE1vdW50IiwibGFuZ3VhZ2VIYW5kbGVyIiwiZ2V0QWxsTGFuZ3VhZ2VzRnJvbUpzb24iLCJ0aGVuIiwic29ydCIsImEiLCJiIiwiY2F0Y2giLCJnZXRVc2VyTGFuZ3VhZ2UiLCJvbk9wdGlvbkNoYW5nZSIsInJlbmRlciIsImRpc3BsYXllZExhbmd1YWdlcyIsImZpbHRlciIsImxhbmciLCJvcHRpb25zIiwibWFwIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwibmF2aWdhdG9yIiwidXNlckxhbmd1YWdlIiwiY2xhc3NOYW1lIiwib25TZWFyY2hDaGFuZ2UiLCJfdCIsImRpc2FibGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvTGFuZ3VhZ2VEcm9wZG93bi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE1hcmNlbCBSYWR6aW8gKE1UUk5vcmQpXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgKiBhcyBsYW5ndWFnZUhhbmRsZXIgZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuL1NwaW5uZXJcIjtcbmltcG9ydCBEcm9wZG93biBmcm9tIFwiLi9Ecm9wZG93blwiO1xuXG5mdW5jdGlvbiBsYW5ndWFnZU1hdGNoZXNTZWFyY2hRdWVyeShxdWVyeSwgbGFuZ3VhZ2UpIHtcbiAgICBpZiAobGFuZ3VhZ2UubGFiZWwudG9VcHBlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50b1VwcGVyQ2FzZSgpKSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGxhbmd1YWdlLnZhbHVlLnRvVXBwZXJDYXNlKCkgPT09IHF1ZXJ5LnRvVXBwZXJDYXNlKCkpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICAgIG9uT3B0aW9uQ2hhbmdlOiAobGFuZ3VhZ2U6IHN0cmluZykgPT4gdm9pZDtcbiAgICB2YWx1ZT86IHN0cmluZztcbiAgICBkaXNhYmxlZD86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHNlYXJjaFF1ZXJ5OiBzdHJpbmc7XG4gICAgbGFuZ3M6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYW5ndWFnZURyb3Bkb3duIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNlYXJjaFF1ZXJ5OiAnJyxcbiAgICAgICAgICAgIGxhbmdzOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgbGFuZ3VhZ2VIYW5kbGVyLmdldEFsbExhbmd1YWdlc0Zyb21Kc29uKCkudGhlbigobGFuZ3MpID0+IHtcbiAgICAgICAgICAgIGxhbmdzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgIGlmIChhLmxhYmVsIDwgYi5sYWJlbCkgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgIGlmIChhLmxhYmVsID4gYi5sYWJlbCkgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsYW5ncyB9KTtcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxhbmdzOiBbJ2VuJ10gfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgLy8gSWYgbm8gdmFsdWUgaXMgZ2l2ZW4sIHdlIHN0YXJ0IHdpdGggdGhlIGZpcnN0XG4gICAgICAgICAgICAvLyBjb3VudHJ5IHNlbGVjdGVkLCBidXQgb3VyIHBhcmVudCBjb21wb25lbnRcbiAgICAgICAgICAgIC8vIGRvZXNuJ3Qga25vdyB0aGlzLCB0aGVyZWZvcmUgd2UgZG8gdGhpcy5cbiAgICAgICAgICAgIGNvbnN0IGxhbmd1YWdlID0gbGFuZ3VhZ2VIYW5kbGVyLmdldFVzZXJMYW5ndWFnZSgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbk9wdGlvbkNoYW5nZShsYW5ndWFnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2VhcmNoQ2hhbmdlID0gKHNlYXJjaDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoUXVlcnk6IHNlYXJjaCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sYW5ncyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIDxTcGlubmVyIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRpc3BsYXllZExhbmd1YWdlcztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUXVlcnkpIHtcbiAgICAgICAgICAgIGRpc3BsYXllZExhbmd1YWdlcyA9IHRoaXMuc3RhdGUubGFuZ3MuZmlsdGVyKChsYW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhbmd1YWdlTWF0Y2hlc1NlYXJjaFF1ZXJ5KHRoaXMuc3RhdGUuc2VhcmNoUXVlcnksIGxhbmcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXNwbGF5ZWRMYW5ndWFnZXMgPSB0aGlzLnN0YXRlLmxhbmdzO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGRpc3BsYXllZExhbmd1YWdlcy5tYXAoKGxhbmd1YWdlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBrZXk9e2xhbmd1YWdlLnZhbHVlfT5cbiAgICAgICAgICAgICAgICB7IGxhbmd1YWdlLmxhYmVsIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZGVmYXVsdCB2YWx1ZSBoZXJlIHRvbywgb3RoZXJ3aXNlIHdlIG5lZWQgdG8gaGFuZGxlIG51bGwgLyB1bmRlZmluZWRcbiAgICAgICAgLy8gdmFsdWVzIGJldHdlZW4gbW91bnRpbmcgYW5kIHRoZSBpbml0aWFsIHZhbHVlIHByb3BhZ2F0aW5nXG4gICAgICAgIGxldCBsYW5ndWFnZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsYW5ndWFnZVwiLCBudWxsLCAvKmV4Y2x1ZGVEZWZhdWx0OiovdHJ1ZSk7XG4gICAgICAgIGxldCB2YWx1ZSA9IG51bGw7XG4gICAgICAgIGlmIChsYW5ndWFnZSkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlIHx8IGxhbmd1YWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBuYXZpZ2F0b3IubGFuZ3VhZ2UgfHwgbmF2aWdhdG9yLnVzZXJMYW5ndWFnZTtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZSB8fCBsYW5ndWFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8RHJvcGRvd25cbiAgICAgICAgICAgIGlkPVwibXhfTGFuZ3VhZ2VEcm9wZG93blwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfVxuICAgICAgICAgICAgb25PcHRpb25DaGFuZ2U9e3RoaXMucHJvcHMub25PcHRpb25DaGFuZ2V9XG4gICAgICAgICAgICBvblNlYXJjaENoYW5nZT17dGhpcy5vblNlYXJjaENoYW5nZX1cbiAgICAgICAgICAgIHNlYXJjaEVuYWJsZWQ9e3RydWV9XG4gICAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgICBsYWJlbD17X3QoXCJMYW5ndWFnZSBEcm9wZG93blwiKX1cbiAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IG9wdGlvbnMgfVxuICAgICAgICA8L0Ryb3Bkb3duPjtcbiAgICB9XG59XG5cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7OztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVBLFNBQVNBLDBCQUFULENBQW9DQyxLQUFwQyxFQUEyQ0MsUUFBM0MsRUFBcUQ7RUFDakQsSUFBSUEsUUFBUSxDQUFDQyxLQUFULENBQWVDLFdBQWYsR0FBNkJDLFFBQTdCLENBQXNDSixLQUFLLENBQUNHLFdBQU4sRUFBdEMsQ0FBSixFQUFnRSxPQUFPLElBQVA7RUFDaEUsSUFBSUYsUUFBUSxDQUFDSSxLQUFULENBQWVGLFdBQWYsT0FBaUNILEtBQUssQ0FBQ0csV0FBTixFQUFyQyxFQUEwRCxPQUFPLElBQVA7RUFDMUQsT0FBTyxLQUFQO0FBQ0g7O0FBY2MsTUFBTUcsZ0JBQU4sU0FBK0JDLGNBQUEsQ0FBTUMsU0FBckMsQ0FBK0Q7RUFDMUVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOO0lBRHVCLHNEQThCREMsTUFBRCxJQUEwQjtNQUMvQyxLQUFLQyxRQUFMLENBQWM7UUFDVkMsV0FBVyxFQUFFRjtNQURILENBQWQ7SUFHSCxDQWxDMEI7SUFHdkIsS0FBS0csS0FBTCxHQUFhO01BQ1RELFdBQVcsRUFBRSxFQURKO01BRVRFLEtBQUssRUFBRTtJQUZFLENBQWI7RUFJSDs7RUFFTUMsaUJBQWlCLEdBQVM7SUFDN0JDLGVBQWUsQ0FBQ0MsdUJBQWhCLEdBQTBDQyxJ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