"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EditableItem = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("./Field"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

/*
Copyright 2017-2021 The Matrix.org Foundation C.I.C.

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
class EditableItem extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "state", {
      verifyRemove: false
    });
    (0, _defineProperty2.default)(this, "onRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        verifyRemove: true
      });
    });
    (0, _defineProperty2.default)(this, "onDontRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        verifyRemove: false
      });
    });
    (0, _defineProperty2.default)(this, "onActuallyRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      if (this.props.onRemove) this.props.onRemove(this.props.index);
      this.setState({
        verifyRemove: false
      });
    });
  }

  render() {
    if (this.state.verifyRemove) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EditableItem"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_EditableItem_promptText"
      }, (0, _languageHandler._t)("Are you sure?")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onActuallyRemove,
        kind: "primary_sm",
        className: "mx_EditableItem_confirmBtn"
      }, (0, _languageHandler._t)("Yes")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onDontRemove,
        kind: "danger_sm",
        className: "mx_EditableItem_confirmBtn"
      }, (0, _languageHandler._t)("No")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditableItem"
    }, /*#__PURE__*/_react.default.createElement("div", {
      onClick: this.onRemove,
      className: "mx_EditableItem_delete",
      title: (0, _languageHandler._t)("Remove"),
      role: "button"
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EditableItem_item"
    }, this.props.value));
  }

}

exports.EditableItem = EditableItem;

class EditableItemList extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onItemAdded", e => {
      e.stopPropagation();
      e.preventDefault();
      if (this.props.onItemAdded) this.props.onItemAdded(this.props.newItem);
    });
    (0, _defineProperty2.default)(this, "onItemRemoved", index => {
      if (this.props.onItemRemoved) this.props.onItemRemoved(index);
    });
    (0, _defineProperty2.default)(this, "onNewItemChanged", e => {
      if (this.props.onNewItemChanged) this.props.onNewItemChanged(e.target.value);
    });
  }

  renderNewItemField() {
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onItemAdded,
      autoComplete: "off",
      noValidate: true,
      className: "mx_EditableItemList_newItem"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: this.props.placeholder,
      type: "text",
      autoComplete: "off",
      value: this.props.newItem || "",
      onChange: this.onNewItemChanged,
      list: this.props.suggestionsListId
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onItemAdded,
      kind: "primary",
      type: "submit",
      disabled: !this.props.newItem
    }, (0, _languageHandler._t)("Add")));
  }

  render() {
    const editableItems = this.props.items.map((item, index) => {
      if (!this.props.canRemove) {
        return /*#__PURE__*/_react.default.createElement("li", {
          key: item
        }, item);
      }

      return /*#__PURE__*/_react.default.createElement(EditableItem, {
        key: item,
        index: index,
        value: item,
        onRemove: this.onItemRemoved
      });
    });
    const editableItemsSection = this.props.canRemove ? editableItems : /*#__PURE__*/_react.default.createElement("ul", null, editableItems);
    const label = this.props.items.length > 0 ? this.props.itemsLabel : this.props.noItemsLabel;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditableItemList",
      id: this.props.id
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditableItemList_label"
    }, label), editableItemsSection, this.props.canEdit ? this.renderNewItemField() : /*#__PURE__*/_react.default.createElement("div", null));
  }

}

exports.default = EditableItemList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFZGl0YWJsZUl0ZW0iLCJSZWFjdCIsIkNvbXBvbmVudCIsInZlcmlmeVJlbW92ZSIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInNldFN0YXRlIiwicHJvcHMiLCJvblJlbW92ZSIsImluZGV4IiwicmVuZGVyIiwic3RhdGUiLCJfdCIsIm9uQWN0dWFsbHlSZW1vdmUiLCJvbkRvbnRSZW1vdmUiLCJ2YWx1ZSIsIkVkaXRhYmxlSXRlbUxpc3QiLCJQdXJlQ29tcG9uZW50Iiwib25JdGVtQWRkZWQiLCJuZXdJdGVtIiwib25JdGVtUmVtb3ZlZCIsIm9uTmV3SXRlbUNoYW5nZWQiLCJ0YXJnZXQiLCJyZW5kZXJOZXdJdGVtRmllbGQiLCJwbGFjZWhvbGRlciIsInN1Z2dlc3Rpb25zTGlzdElkIiwiZWRpdGFibGVJdGVtcyIsIml0ZW1zIiwibWFwIiwiaXRlbSIsImNhblJlbW92ZSIsImVkaXRhYmxlSXRlbXNTZWN0aW9uIiwibGFiZWwiLCJsZW5ndGgiLCJpdGVtc0xhYmVsIiwibm9JdGVtc0xhYmVsIiwiaWQiLCJjYW5FZGl0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRWRpdGFibGVJdGVtTGlzdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi9GaWVsZFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4vQWNjZXNzaWJsZUJ1dHRvblwiO1xuXG5pbnRlcmZhY2UgSUl0ZW1Qcm9wcyB7XG4gICAgaW5kZXg/OiBudW1iZXI7XG4gICAgdmFsdWU/OiBzdHJpbmc7XG4gICAgb25SZW1vdmU/KGluZGV4OiBudW1iZXIpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSUl0ZW1TdGF0ZSB7XG4gICAgdmVyaWZ5UmVtb3ZlOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgRWRpdGFibGVJdGVtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElJdGVtUHJvcHMsIElJdGVtU3RhdGU+IHtcbiAgICBwdWJsaWMgc3RhdGUgPSB7XG4gICAgICAgIHZlcmlmeVJlbW92ZTogZmFsc2UsXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZlcmlmeVJlbW92ZTogdHJ1ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRvbnRSZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZlcmlmeVJlbW92ZTogZmFsc2UgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3R1YWxseVJlbW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlbW92ZSkgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZlcmlmeVJlbW92ZTogZmFsc2UgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVyaWZ5UmVtb3ZlKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0VkaXRhYmxlSXRlbV9wcm9tcHRUZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQXJlIHlvdSBzdXJlP1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25BY3R1YWxseVJlbW92ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0VkaXRhYmxlSXRlbV9jb25maXJtQnRuXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlllc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Eb250UmVtb3ZlfVxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImRhbmdlcl9zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FZGl0YWJsZUl0ZW1fY29uZmlybUJ0blwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJOb1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FZGl0YWJsZUl0ZW1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IG9uQ2xpY2s9e3RoaXMub25SZW1vdmV9IGNsYXNzTmFtZT1cIm14X0VkaXRhYmxlSXRlbV9kZWxldGVcIiB0aXRsZT17X3QoXCJSZW1vdmVcIil9IHJvbGU9XCJidXR0b25cIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0VkaXRhYmxlSXRlbV9pdGVtXCI+eyB0aGlzLnByb3BzLnZhbHVlIH08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgaXRlbXM6IHN0cmluZ1tdO1xuICAgIGl0ZW1zTGFiZWw/OiBzdHJpbmc7XG4gICAgbm9JdGVtc0xhYmVsPzogc3RyaW5nO1xuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xuICAgIG5ld0l0ZW0/OiBzdHJpbmc7XG4gICAgY2FuRWRpdD86IGJvb2xlYW47XG4gICAgY2FuUmVtb3ZlPzogYm9vbGVhbjtcbiAgICBzdWdnZXN0aW9uc0xpc3RJZD86IHN0cmluZztcbiAgICBvbkl0ZW1BZGRlZD8oaXRlbTogc3RyaW5nKTogdm9pZDtcbiAgICBvbkl0ZW1SZW1vdmVkPyhpbmRleDogbnVtYmVyKTogdm9pZDtcbiAgICBvbk5ld0l0ZW1DaGFuZ2VkPyhpdGVtOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0YWJsZUl0ZW1MaXN0PFAgPSB7fT4gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcyAmIFA+IHtcbiAgICBwcm90ZWN0ZWQgb25JdGVtQWRkZWQgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25JdGVtQWRkZWQpIHRoaXMucHJvcHMub25JdGVtQWRkZWQodGhpcy5wcm9wcy5uZXdJdGVtKTtcbiAgICB9O1xuXG4gICAgcHJvdGVjdGVkIG9uSXRlbVJlbW92ZWQgPSAoaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25JdGVtUmVtb3ZlZCkgdGhpcy5wcm9wcy5vbkl0ZW1SZW1vdmVkKGluZGV4KTtcbiAgICB9O1xuXG4gICAgcHJvdGVjdGVkIG9uTmV3SXRlbUNoYW5nZWQgPSAoZSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbk5ld0l0ZW1DaGFuZ2VkKSB0aGlzLnByb3BzLm9uTmV3SXRlbUNoYW5nZWQoZS50YXJnZXQudmFsdWUpO1xuICAgIH07XG5cbiAgICBwcm90ZWN0ZWQgcmVuZGVyTmV3SXRlbUZpZWxkKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGZvcm1cbiAgICAgICAgICAgICAgICBvblN1Ym1pdD17dGhpcy5vbkl0ZW1BZGRlZH1cbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgIG5vVmFsaWRhdGU9e3RydWV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtTGlzdF9uZXdJdGVtXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMubmV3SXRlbSB8fCBcIlwifVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbk5ld0l0ZW1DaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBsaXN0PXt0aGlzLnByb3BzLnN1Z2dlc3Rpb25zTGlzdElkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkl0ZW1BZGRlZH1cbiAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnByb3BzLm5ld0l0ZW19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQWRkXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBlZGl0YWJsZUl0ZW1zID0gdGhpcy5wcm9wcy5pdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxsaSBrZXk9e2l0ZW19PnsgaXRlbSB9PC9saT47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiA8RWRpdGFibGVJdGVtXG4gICAgICAgICAgICAgICAga2V5PXtpdGVtfVxuICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICB2YWx1ZT17aXRlbX1cbiAgICAgICAgICAgICAgICBvblJlbW92ZT17dGhpcy5vbkl0ZW1SZW1vdmVkfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGVkaXRhYmxlSXRlbXNTZWN0aW9uID0gdGhpcy5wcm9wcy5jYW5SZW1vdmUgPyBlZGl0YWJsZUl0ZW1zIDogPHVsPnsgZWRpdGFibGVJdGVtcyB9PC91bD47XG4gICAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5wcm9wcy5pdGVtcy5sZW5ndGggPiAwID8gdGhpcy5wcm9wcy5pdGVtc0xhYmVsIDogdGhpcy5wcm9wcy5ub0l0ZW1zTGFiZWw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtTGlzdFwiIGlkPXt0aGlzLnByb3BzLmlkfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0VkaXRhYmxlSXRlbUxpc3RfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBsYWJlbCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBlZGl0YWJsZUl0ZW1zU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNhbkVkaXQgPyB0aGlzLnJlbmRlck5ld0l0ZW1GaWVsZCgpIDogPGRpdiAv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