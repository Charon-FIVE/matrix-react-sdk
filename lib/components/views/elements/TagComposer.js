"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _Field = _interopRequireDefault(require("./Field"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _Tag = require("./Tag");

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
 * A simple, controlled, composer for entering string tags. Contains a simple
 * input, add button, and per-tag remove button.
 */
class TagComposer extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onInputChange", ev => {
      this.setState({
        newTag: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onAdd", ev => {
      ev.preventDefault();
      if (!this.state.newTag) return;
      this.props.onAdd(this.state.newTag);
      this.setState({
        newTag: ""
      });
    });
    this.state = {
      newTag: ""
    };
  }

  onRemove(tag) {
    // We probably don't need to proxy this, but for
    // sanity of `this` we'll do so anyways.
    this.props.onRemove(tag);
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_TagComposer"
    }, /*#__PURE__*/_react.default.createElement("form", {
      className: "mx_TagComposer_input",
      onSubmit: this.onAdd
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      value: this.state.newTag,
      onChange: this.onInputChange,
      label: this.props.label || (0, _languageHandler._t)("Keyword"),
      placeholder: this.props.placeholder || (0, _languageHandler._t)("New keyword"),
      disabled: this.props.disabled,
      autoComplete: "off"
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onAdd,
      kind: "primary",
      disabled: this.props.disabled
    }, (0, _languageHandler._t)("Add"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_TagComposer_tags"
    }, this.props.tags.map((t, i) => /*#__PURE__*/_react.default.createElement(_Tag.Tag, {
      label: t,
      key: t,
      onDeleteClick: this.onRemove.bind(this, t),
      disabled: this.props.disabled
    }))));
  }

}

exports.default = TagComposer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWdDb21wb3NlciIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldiIsInNldFN0YXRlIiwibmV3VGFnIiwidGFyZ2V0IiwidmFsdWUiLCJwcmV2ZW50RGVmYXVsdCIsInN0YXRlIiwib25BZGQiLCJvblJlbW92ZSIsInRhZyIsInJlbmRlciIsIm9uSW5wdXRDaGFuZ2UiLCJsYWJlbCIsIl90IiwicGxhY2Vob2xkZXIiLCJkaXNhYmxlZCIsInRhZ3MiLCJtYXAiLCJ0IiwiaSIsImJpbmQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9UYWdDb21wb3Nlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IENoYW5nZUV2ZW50LCBGb3JtRXZlbnQgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IEZpZWxkIGZyb20gXCIuL0ZpZWxkXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IFRhZyB9IGZyb20gXCIuL1RhZ1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICB0YWdzOiBzdHJpbmdbXTtcbiAgICBvbkFkZDogKHRhZzogc3RyaW5nKSA9PiB2b2lkO1xuICAgIG9uUmVtb3ZlOiAodGFnOiBzdHJpbmcpID0+IHZvaWQ7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBuZXdUYWc6IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIHNpbXBsZSwgY29udHJvbGxlZCwgY29tcG9zZXIgZm9yIGVudGVyaW5nIHN0cmluZyB0YWdzLiBDb250YWlucyBhIHNpbXBsZVxuICogaW5wdXQsIGFkZCBidXR0b24sIGFuZCBwZXItdGFnIHJlbW92ZSBidXR0b24uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhZ0NvbXBvc2VyIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbmV3VGFnOiBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25JbnB1dENoYW5nZSA9IChldjogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG5ld1RhZzogZXYudGFyZ2V0LnZhbHVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWRkID0gKGV2OiBGb3JtRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLm5ld1RhZykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25BZGQodGhpcy5zdGF0ZS5uZXdUYWcpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbmV3VGFnOiBcIlwiIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVtb3ZlKHRhZzogc3RyaW5nKSB7XG4gICAgICAgIC8vIFdlIHByb2JhYmx5IGRvbid0IG5lZWQgdG8gcHJveHkgdGhpcywgYnV0IGZvclxuICAgICAgICAvLyBzYW5pdHkgb2YgYHRoaXNgIHdlJ2xsIGRvIHNvIGFueXdheXMuXG4gICAgICAgIHRoaXMucHJvcHMub25SZW1vdmUodGFnKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9J214X1RhZ0NvbXBvc2VyJz5cbiAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT0nbXhfVGFnQ29tcG9zZXJfaW5wdXQnIG9uU3VibWl0PXt0aGlzLm9uQWRkfT5cbiAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3VGFnfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbklucHV0Q2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17dGhpcy5wcm9wcy5sYWJlbCB8fCBfdChcIktleXdvcmRcIil9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyIHx8IF90KFwiTmV3IGtleXdvcmRcIil9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vbkFkZH0ga2luZD0ncHJpbWFyeScgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQWRkXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfVGFnQ29tcG9zZXJfdGFncyc+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLnRhZ3MubWFwKCh0LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxUYWdcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDbGljaz17dGhpcy5vblJlbW92ZS5iaW5kKHRoaXMsIHQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+XG4gICAgICAgICAgICAgICAgKSkgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBc0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsV0FBTixTQUEwQkMsY0FBQSxDQUFNQyxhQUFoQyxDQUE4RDtFQUNsRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQzlCLE1BQU1BLEtBQU47SUFEOEIscURBUVRDLEVBQUQsSUFBdUM7TUFDM0QsS0FBS0MsUUFBTCxDQUFjO1FBQUVDLE1BQU0sRUFBRUYsRUFBRSxDQUFDRyxNQUFILENBQVVDO01BQXBCLENBQWQ7SUFDSCxDQVZpQztJQUFBLDZDQVlqQkosRUFBRCxJQUFtQjtNQUMvQkEsRUFBRSxDQUFDSyxjQUFIO01BQ0EsSUFBSSxDQUFDLEtBQUtDLEtBQUwsQ0FBV0osTUFBaEIsRUFBd0I7TUFFeEIsS0FBS0gsS0FBTCxDQUFXUSxLQUFYLENBQWlCLEtBQUtELEtBQUwsQ0FBV0osTUFBNUI7TUFDQSxLQUFLRCxRQUFMLENBQWM7UUFBRUMsTUFBTSxFQUFFO01BQVYsQ0FBZDtJQUNILENBbEJpQztJQUc5QixLQUFLSSxLQUFMLEdBQWE7TUFDVEosTUFBTSxFQUFFO0lBREMsQ0FBYjtFQUdIOztFQWNPTSxRQUFRLENBQUNDLEdBQUQsRUFBYztJQUMxQjtJQUNBO0lBQ0EsS0FBS1YsS0FBTCxDQUFXUyxRQUFYLENBQW9CQyxHQUFwQjtFQUNIOztFQUVNQyxNQUFNLEdBQUc7SUFDWixvQkFBTztNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNIO01BQU0sU0FBUyxFQUFDLHNCQUFoQjtNQUF1QyxRQUFRLEVBQUUsS0FBS0g7SUFBdEQsZ0JBQ0ksNkJBQUMsY0FBRDtNQUNJLEtBQUssRUFBRSxLQUFLRCxLQUFMLENBQVdKLE1BRHRCO01BRUksUUFBUSxFQUFFLEtBQUtTLGFBRm5CO01BR0ksS0FBSyxFQUFFLEtBQUtaLEtBQUwsQ0FBV2EsS0FBWCxJQUFvQixJQUFBQyxtQkFBQSxFQUFHLFNBQUgsQ0FIL0I7TUFJSSxXQUFXLEVBQUUsS0FBS2QsS0FBTCxDQUFXZSxXQUFYLElBQTBCLElBQUFELG1CQUFBLEVBQUcsYUFBSCxDQUozQztNQUtJLFFBQVEsRUFBRSxLQUFLZCxLQUFMLENBQVdnQixRQUx6QjtNQU1JLFlBQVksRUFBQztJQU5qQixFQURKLGVBU0ksNkJBQUMseUJBQUQ7TUFBa0IsT0FBTyxFQUFFLEtBQUtSLEtBQWhDO01BQXVDLElBQUksRUFBQyxTQUE1QztNQUFzRCxRQUFRLEVBQUUsS0FBS1IsS0FBTCxDQUFXZ0I7SUFBM0UsR0FDTSxJQUFBRixtQkFBQSxFQUFHLEtBQUgsQ0FETixDQVRKLENBREcsZUFjSDtNQUFLLFNBQVMsRUFBQztJQUFmLEdBQ00sS0FBS2QsS0FBTCxDQUFXaUIsSUFBWCxDQUFnQkMsR0FBaEIsQ0FBb0IsQ0FBQ0MsQ0FBRCxFQUFJQyxDQUFKLGtCQUNsQiw2QkFBQyxRQUFEO01BQ0ksS0FBSyxFQUFFRCxDQURYO01BRUksR0FBRyxFQUFFQSxDQUZUO01BR0ksYUFBYSxFQUFFLEtBQUtWLFFBQUwsQ0FBY1ksSUFBZCxDQUFtQixJQUFuQixFQUF5QkYsQ0FBekIsQ0FIbkI7TUFJSSxRQUFRLEVBQUUsS0FBS25CLEtBQUwsQ0FBV2dCO0lBSnpCLEVBREYsQ0FETixDQWRHLENBQVA7RUF3Qkg7O0FBcER3RSJ9