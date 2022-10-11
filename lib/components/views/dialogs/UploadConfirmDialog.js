"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _filesize = _interopRequireDefault(require("filesize"));

var _files = require("../../../../res/img/feather-customised/files.svg");

var _languageHandler = require("../../../languageHandler");

var _blobs = require("../../../utils/blobs");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
class UploadConfirmDialog extends _react.default.Component {
  constructor(props) {
    super(props); // Create a fresh `Blob` for previewing (even though `File` already is
    // one) so we can adjust the MIME type if needed.

    (0, _defineProperty2.default)(this, "objectUrl", void 0);
    (0, _defineProperty2.default)(this, "mimeType", void 0);
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onUploadClick", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "onUploadAllClick", () => {
      this.props.onFinished(true, true);
    });
    this.mimeType = (0, _blobs.getBlobSafeMimeType)(props.file.type);
    const blob = new Blob([props.file], {
      type: this.mimeType
    });
    this.objectUrl = URL.createObjectURL(blob);
  }

  componentWillUnmount() {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  render() {
    let title;

    if (this.props.totalFiles > 1 && this.props.currentIndex !== undefined) {
      title = (0, _languageHandler._t)("Upload files (%(current)s of %(total)s)", {
        current: this.props.currentIndex + 1,
        total: this.props.totalFiles
      });
    } else {
      title = (0, _languageHandler._t)('Upload files');
    }

    const fileId = `mx-uploadconfirmdialog-${this.props.file.name}`;
    let preview;
    let placeholder;

    if (this.mimeType.startsWith("image/")) {
      preview = /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_UploadConfirmDialog_imagePreview",
        src: this.objectUrl,
        "aria-labelledby": fileId
      });
    } else if (this.mimeType.startsWith("video/")) {
      preview = /*#__PURE__*/_react.default.createElement("video", {
        className: "mx_UploadConfirmDialog_imagePreview",
        src: this.objectUrl,
        playsInline: true,
        controls: false
      });
    } else {
      placeholder = /*#__PURE__*/_react.default.createElement(_files.Icon, {
        className: "mx_UploadConfirmDialog_fileIcon",
        height: 18,
        width: 18
      });
    }

    let uploadAllButton;

    if (this.props.currentIndex + 1 < this.props.totalFiles) {
      uploadAllButton = /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onUploadAllClick
      }, (0, _languageHandler._t)("Upload all"));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_UploadConfirmDialog",
      fixedWidth: false,
      onFinished: this.onCancelClick,
      title: title,
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UploadConfirmDialog_previewOuter"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UploadConfirmDialog_previewInner"
    }, preview && /*#__PURE__*/_react.default.createElement("div", null, preview), /*#__PURE__*/_react.default.createElement("div", {
      id: fileId
    }, placeholder, this.props.file.name, " (", (0, _filesize.default)(this.props.file.size), ")")))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Upload'),
      hasCancel: false,
      onPrimaryButtonClick: this.onUploadClick,
      focus: true
    }, uploadAllButton));
  }

}

exports.default = UploadConfirmDialog;
(0, _defineProperty2.default)(UploadConfirmDialog, "defaultProps", {
  totalFiles: 1
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVcGxvYWRDb25maXJtRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwib25GaW5pc2hlZCIsIm1pbWVUeXBlIiwiZ2V0QmxvYlNhZmVNaW1lVHlwZSIsImZpbGUiLCJ0eXBlIiwiYmxvYiIsIkJsb2IiLCJvYmplY3RVcmwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJldm9rZU9iamVjdFVSTCIsInJlbmRlciIsInRpdGxlIiwidG90YWxGaWxlcyIsImN1cnJlbnRJbmRleCIsInVuZGVmaW5lZCIsIl90IiwiY3VycmVudCIsInRvdGFsIiwiZmlsZUlkIiwibmFtZSIsInByZXZpZXciLCJwbGFjZWhvbGRlciIsInN0YXJ0c1dpdGgiLCJ1cGxvYWRBbGxCdXR0b24iLCJvblVwbG9hZEFsbENsaWNrIiwib25DYW5jZWxDbGljayIsImZpbGVzaXplIiwic2l6ZSIsIm9uVXBsb2FkQ2xpY2siXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1VwbG9hZENvbmZpcm1EaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBmaWxlc2l6ZSBmcm9tIFwiZmlsZXNpemVcIjtcblxuaW1wb3J0IHsgSWNvbiBhcyBGaWxlSWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZmVhdGhlci1jdXN0b21pc2VkL2ZpbGVzLnN2Zyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBnZXRCbG9iU2FmZU1pbWVUeXBlIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvYmxvYnMnO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgZmlsZTogRmlsZTtcbiAgICBjdXJyZW50SW5kZXg6IG51bWJlcjtcbiAgICB0b3RhbEZpbGVzPzogbnVtYmVyO1xuICAgIG9uRmluaXNoZWQ6ICh1cGxvYWRDb25maXJtZWQ6IGJvb2xlYW4sIHVwbG9hZEFsbD86IGJvb2xlYW4pID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVwbG9hZENvbmZpcm1EaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBvYmplY3RVcmw6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1pbWVUeXBlOiBzdHJpbmc7XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICB0b3RhbEZpbGVzOiAxLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgZnJlc2ggYEJsb2JgIGZvciBwcmV2aWV3aW5nIChldmVuIHRob3VnaCBgRmlsZWAgYWxyZWFkeSBpc1xuICAgICAgICAvLyBvbmUpIHNvIHdlIGNhbiBhZGp1c3QgdGhlIE1JTUUgdHlwZSBpZiBuZWVkZWQuXG4gICAgICAgIHRoaXMubWltZVR5cGUgPSBnZXRCbG9iU2FmZU1pbWVUeXBlKHByb3BzLmZpbGUudHlwZSk7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbcHJvcHMuZmlsZV0sIHsgdHlwZTpcbiAgICAgICAgICAgIHRoaXMubWltZVR5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm9iamVjdFVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLm9iamVjdFVybCkgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLm9iamVjdFVybCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXBsb2FkQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVwbG9hZEFsbENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHRpdGxlOiBzdHJpbmc7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRvdGFsRmlsZXMgPiAxICYmIHRoaXMucHJvcHMuY3VycmVudEluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXG4gICAgICAgICAgICAgICAgXCJVcGxvYWQgZmlsZXMgKCUoY3VycmVudClzIG9mICUodG90YWwpcylcIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IHRoaXMucHJvcHMuY3VycmVudEluZGV4ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWw6IHRoaXMucHJvcHMudG90YWxGaWxlcyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoJ1VwbG9hZCBmaWxlcycpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlsZUlkID0gYG14LXVwbG9hZGNvbmZpcm1kaWFsb2ctJHt0aGlzLnByb3BzLmZpbGUubmFtZX1gO1xuICAgICAgICBsZXQgcHJldmlldzogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGxldCBwbGFjZWhvbGRlcjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLm1pbWVUeXBlLnN0YXJ0c1dpdGgoXCJpbWFnZS9cIikpIHtcbiAgICAgICAgICAgIHByZXZpZXcgPSAoXG4gICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9VcGxvYWRDb25maXJtRGlhbG9nX2ltYWdlUHJldmlld1wiXG4gICAgICAgICAgICAgICAgICAgIHNyYz17dGhpcy5vYmplY3RVcmx9XG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT17ZmlsZUlkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubWltZVR5cGUuc3RhcnRzV2l0aChcInZpZGVvL1wiKSkge1xuICAgICAgICAgICAgcHJldmlldyA9IChcbiAgICAgICAgICAgICAgICA8dmlkZW8gY2xhc3NOYW1lPVwibXhfVXBsb2FkQ29uZmlybURpYWxvZ19pbWFnZVByZXZpZXdcIiBzcmM9e3RoaXMub2JqZWN0VXJsfSBwbGF5c0lubGluZSBjb250cm9scz17ZmFsc2V9IC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSAoXG4gICAgICAgICAgICAgICAgPEZpbGVJY29uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1VwbG9hZENvbmZpcm1EaWFsb2dfZmlsZUljb25cIlxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezE4fVxuICAgICAgICAgICAgICAgICAgICB3aWR0aD17MTh9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXBsb2FkQWxsQnV0dG9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jdXJyZW50SW5kZXggKyAxIDwgdGhpcy5wcm9wcy50b3RhbEZpbGVzKSB7XG4gICAgICAgICAgICB1cGxvYWRBbGxCdXR0b24gPSA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25VcGxvYWRBbGxDbGlja30+XG4gICAgICAgICAgICAgICAgeyBfdChcIlVwbG9hZCBhbGxcIikgfVxuICAgICAgICAgICAgPC9idXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXBsb2FkQ29uZmlybURpYWxvZ1wiXG4gICAgICAgICAgICAgICAgZml4ZWRXaWR0aD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9XCJteF9EaWFsb2dfY29udGVudFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXBsb2FkQ29uZmlybURpYWxvZ19wcmV2aWV3T3V0ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXBsb2FkQ29uZmlybURpYWxvZ19wcmV2aWV3SW5uZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHByZXZpZXcgJiYgPGRpdj57IHByZXZpZXcgfTwvZGl2PiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD17ZmlsZUlkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBwbGFjZWhvbGRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5maWxlLm5hbWUgfSAoeyBmaWxlc2l6ZSh0aGlzLnByb3BzLmZpbGUuc2l6ZSkgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdVcGxvYWQnKX1cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25VcGxvYWRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IHVwbG9hZEFsbEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9EaWFsb2dCdXR0b25zPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0JlLE1BQU1BLG1CQUFOLFNBQWtDQyxjQUFBLENBQU1DLFNBQXhDLENBQTBEO0VBUXJFQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU4sRUFEZSxDQUdmO0lBQ0E7O0lBSmU7SUFBQTtJQUFBLHFEQWdCSyxNQUFNO01BQzFCLEtBQUtBLEtBQUwsQ0FBV0MsVUFBWCxDQUFzQixLQUF0QjtJQUNILENBbEJrQjtJQUFBLHFEQW9CSyxNQUFNO01BQzFCLEtBQUtELEtBQUwsQ0FBV0MsVUFBWCxDQUFzQixJQUF0QjtJQUNILENBdEJrQjtJQUFBLHdEQXdCUSxNQUFNO01BQzdCLEtBQUtELEtBQUwsQ0FBV0MsVUFBWCxDQUFzQixJQUF0QixFQUE0QixJQUE1QjtJQUNILENBMUJrQjtJQUtmLEtBQUtDLFFBQUwsR0FBZ0IsSUFBQUMsMEJBQUEsRUFBb0JILEtBQUssQ0FBQ0ksSUFBTixDQUFXQyxJQUEvQixDQUFoQjtJQUNBLE1BQU1DLElBQUksR0FBRyxJQUFJQyxJQUFKLENBQVMsQ0FBQ1AsS0FBSyxDQUFDSSxJQUFQLENBQVQsRUFBdUI7TUFBRUMsSUFBSSxFQUN0QyxLQUFLSDtJQUQyQixDQUF2QixDQUFiO0lBR0EsS0FBS00sU0FBTCxHQUFpQkMsR0FBRyxDQUFDQyxlQUFKLENBQW9CSixJQUFw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