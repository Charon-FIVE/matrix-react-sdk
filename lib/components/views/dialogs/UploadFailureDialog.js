"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _filesize = _interopRequireDefault(require("filesize"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

/*
Copyright 2019 New Vector Ltd

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

/*
 * Tells the user about files we know cannot be uploaded before we even try uploading
 * them. This is named fairly generically but the only thing we check right now is
 * the size of the file.
 */
class UploadFailureDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onUploadClick", () => {
      this.props.onFinished(true);
    });
  }

  render() {
    let message;
    let preview;
    let buttons;

    if (this.props.totalFiles === 1 && this.props.badFiles.length === 1) {
      message = (0, _languageHandler._t)("This file is <b>too large</b> to upload. " + "The file size limit is %(limit)s but this file is %(sizeOfThisFile)s.", {
        limit: (0, _filesize.default)(this.props.contentMessages.getUploadLimit()),
        sizeOfThisFile: (0, _filesize.default)(this.props.badFiles[0].size)
      }, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      });
      buttons = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('OK'),
        hasCancel: false,
        onPrimaryButtonClick: this.onCancelClick,
        focus: true
      });
    } else if (this.props.totalFiles === this.props.badFiles.length) {
      message = (0, _languageHandler._t)("These files are <b>too large</b> to upload. " + "The file size limit is %(limit)s.", {
        limit: (0, _filesize.default)(this.props.contentMessages.getUploadLimit())
      }, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      });
      buttons = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('OK'),
        hasCancel: false,
        onPrimaryButtonClick: this.onCancelClick,
        focus: true
      });
    } else {
      message = (0, _languageHandler._t)("Some files are <b>too large</b> to be uploaded. " + "The file size limit is %(limit)s.", {
        limit: (0, _filesize.default)(this.props.contentMessages.getUploadLimit())
      }, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      });
      const howManyOthers = this.props.totalFiles - this.props.badFiles.length;
      buttons = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Upload %(count)s other files', {
          count: howManyOthers
        }),
        onPrimaryButtonClick: this.onUploadClick,
        hasCancel: true,
        cancelButton: (0, _languageHandler._t)("Cancel All"),
        onCancel: this.onCancelClick,
        focus: true
      });
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_UploadFailureDialog",
      onFinished: this.onCancelClick,
      title: (0, _languageHandler._t)("Upload Error"),
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_Dialog_content"
    }, message, preview), buttons);
  }

}

exports.default = UploadFailureDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVcGxvYWRGYWlsdXJlRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJyZW5kZXIiLCJtZXNzYWdlIiwicHJldmlldyIsImJ1dHRvbnMiLCJ0b3RhbEZpbGVzIiwiYmFkRmlsZXMiLCJsZW5ndGgiLCJfdCIsImxpbWl0IiwiZmlsZXNpemUiLCJjb250ZW50TWVzc2FnZXMiLCJnZXRVcGxvYWRMaW1pdCIsInNpemVPZlRoaXNGaWxlIiwic2l6ZSIsImIiLCJzdWIiLCJvbkNhbmNlbENsaWNrIiwiaG93TWFueU90aGVycyIsImNvdW50Iiwib25VcGxvYWRDbGljayJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVXBsb2FkRmFpbHVyZURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGZpbGVzaXplIGZyb20gJ2ZpbGVzaXplJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBDb250ZW50TWVzc2FnZXMgZnJvbSAnLi4vLi4vLi4vQ29udGVudE1lc3NhZ2VzJztcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gXCIuLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgYmFkRmlsZXM6IEZpbGVbXTtcbiAgICB0b3RhbEZpbGVzOiBudW1iZXI7XG4gICAgY29udGVudE1lc3NhZ2VzOiBDb250ZW50TWVzc2FnZXM7XG59XG5cbi8qXG4gKiBUZWxscyB0aGUgdXNlciBhYm91dCBmaWxlcyB3ZSBrbm93IGNhbm5vdCBiZSB1cGxvYWRlZCBiZWZvcmUgd2UgZXZlbiB0cnkgdXBsb2FkaW5nXG4gKiB0aGVtLiBUaGlzIGlzIG5hbWVkIGZhaXJseSBnZW5lcmljYWxseSBidXQgdGhlIG9ubHkgdGhpbmcgd2UgY2hlY2sgcmlnaHQgbm93IGlzXG4gKiB0aGUgc2l6ZSBvZiB0aGUgZmlsZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXBsb2FkRmFpbHVyZURpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIG9uQ2FuY2VsQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25VcGxvYWRDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgbGV0IG1lc3NhZ2U7XG4gICAgICAgIGxldCBwcmV2aWV3O1xuICAgICAgICBsZXQgYnV0dG9ucztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMudG90YWxGaWxlcyA9PT0gMSAmJiB0aGlzLnByb3BzLmJhZEZpbGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgIFwiVGhpcyBmaWxlIGlzIDxiPnRvbyBsYXJnZTwvYj4gdG8gdXBsb2FkLiBcIiArXG4gICAgICAgICAgICAgICAgXCJUaGUgZmlsZSBzaXplIGxpbWl0IGlzICUobGltaXQpcyBidXQgdGhpcyBmaWxlIGlzICUoc2l6ZU9mVGhpc0ZpbGUpcy5cIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiBmaWxlc2l6ZSh0aGlzLnByb3BzLmNvbnRlbnRNZXNzYWdlcy5nZXRVcGxvYWRMaW1pdCgpKSxcbiAgICAgICAgICAgICAgICAgICAgc2l6ZU9mVGhpc0ZpbGU6IGZpbGVzaXplKHRoaXMucHJvcHMuYmFkRmlsZXNbMF0uc2l6ZSksXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBiOiBzdWIgPT4gPGI+eyBzdWIgfTwvYj4sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBidXR0b25zID0gPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ09LJyl9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50b3RhbEZpbGVzID09PSB0aGlzLnByb3BzLmJhZEZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgIFwiVGhlc2UgZmlsZXMgYXJlIDxiPnRvbyBsYXJnZTwvYj4gdG8gdXBsb2FkLiBcIiArXG4gICAgICAgICAgICAgICAgXCJUaGUgZmlsZSBzaXplIGxpbWl0IGlzICUobGltaXQpcy5cIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiBmaWxlc2l6ZSh0aGlzLnByb3BzLmNvbnRlbnRNZXNzYWdlcy5nZXRVcGxvYWRMaW1pdCgpKSxcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnT0snKX1cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfdChcbiAgICAgICAgICAgICAgICBcIlNvbWUgZmlsZXMgYXJlIDxiPnRvbyBsYXJnZTwvYj4gdG8gYmUgdXBsb2FkZWQuIFwiICtcbiAgICAgICAgICAgICAgICBcIlRoZSBmaWxlIHNpemUgbGltaXQgaXMgJShsaW1pdClzLlwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IGZpbGVzaXplKHRoaXMucHJvcHMuY29udGVudE1lc3NhZ2VzLmdldFVwbG9hZExpbWl0KCkpLFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPnsgc3ViIH08L2I+LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgaG93TWFueU90aGVycyA9IHRoaXMucHJvcHMudG90YWxGaWxlcyAtIHRoaXMucHJvcHMuYmFkRmlsZXMubGVuZ3RoO1xuICAgICAgICAgICAgYnV0dG9ucyA9IDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ1VwbG9hZCAlKGNvdW50KXMgb3RoZXIgZmlsZXMnLCB7IGNvdW50OiBob3dNYW55T3RoZXJzIH0pfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uVXBsb2FkQ2xpY2t9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbj17X3QoXCJDYW5jZWwgQWxsXCIpfVxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9J214X1VwbG9hZEZhaWx1cmVEaWFsb2cnXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlVwbG9hZCBFcnJvclwiKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgeyBtZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgeyBwcmV2aWV3IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIHsgYnV0dG9ucyB9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUF0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsbUJBQU4sU0FBa0NDLGNBQUEsQ0FBTUMsU0FBeEMsQ0FBMEQ7RUFBQTtJQUFBO0lBQUEscURBQzdDLE1BQVk7TUFDaEMsS0FBS0MsS0FBTCxDQUFXQyxVQUFYLENBQXNCLEtBQXRCO0lBQ0gsQ0FIb0U7SUFBQSxxREFLN0MsTUFBWTtNQUNoQyxLQUFLRCxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsSUFBdEI7SUFDSCxDQVBvRTtFQUFBOztFQVM5REMsTUFBTSxHQUFnQjtJQUN6QixJQUFJQyxPQUFKO0lBQ0EsSUFBSUMsT0FBSjtJQUNBLElBQUlDLE9BQUo7O0lBQ0EsSUFBSSxLQUFLTCxLQUFMLENBQVdNLFVBQVgsS0FBMEIsQ0FBMUIsSUFBK0IsS0FBS04sS0FBTCxDQUFXTyxRQUFYLENBQW9CQyxNQUFwQixLQUErQixDQUFsRSxFQUFxRTtNQUNqRUwsT0FBTyxHQUFHLElBQUFNLG1CQUFBLEVBQ04sOENBQ0EsdUVBRk0sRUFHTjtRQUNJQyxLQUFLLEVBQUUsSUFBQUMsaUJBQUEsRUFBUyxLQUFLWCxLQUFMLENBQVdZLGVBQVgsQ0FBMkJDLGNBQTNCLEVBQVQsQ0FEWDtRQUVJQyxjQUFjLEVBQUUsSUFBQUgsaUJBQUEsRUFBUyxLQUFLWCxLQUFMLENBQVdPLFFBQVgsQ0FBb0IsQ0FBcEIsRUFBdUJRLElBQWhDO01BRnBCLENBSE0sRUFNSDtRQUNDQyxDQUFDLEVBQUVDLEdBQUcsaUJBQUksd0NBQUtBLEdBQUw7TUFEWCxDQU5HLENBQVY7TUFVQVosT0FBTyxnQkFBRyw2QkFBQyxzQkFBRDtRQUFlLGFBQWEsRUFBRSxJQUFBSSxtQkFBQSxFQUFHLElBQUgsQ0FBOUI7UUFDTixTQUFTLEVBQUUsS0FETDtRQUVOLG9CQUFvQixFQUFFLEtBQUtTLGFBRnJCO1FBR04sS0FBSyxFQUFFO01BSEQsRUFBVjtJQUtILENBaEJELE1BZ0JPLElBQUksS0FBS2xCLEtBQUwsQ0FBV00sVUFBWCxLQUEwQixLQUFLTixLQUFMLENBQVdPLFFBQVgsQ0FBb0JDLE1BQWxELEVBQTBEO01BQzdETCxPQUFPLEdBQUcsSUFBQU0sbUJBQUEsRUFDTixpREFDQSxtQ0FGTSxFQUdOO1FBQ0lDLEtBQUssRUFBRSxJQUFBQyxpQkFBQSxFQUFTLEtBQUtYLEtBQUwsQ0FBV1ksZUFBWCxDQUEyQkMsY0FBM0IsRUFBVDtNQURYLENBSE0sRUFLSDtRQUNDRyxDQUFDLEVBQUVDLEdBQUcsaUJBQUksd0NBQUtBLEdBQUw7TUFEWCxDQUxHLENBQVY7TUFTQVosT0FBTyxnQkFBRyw2QkFBQyxzQkFBRDtRQUFlLGFBQWEsRUFBRSxJQUFBSSxtQkFBQSxFQUFHLElBQUgsQ0FBOUI7UUFDTixTQUFTLEVBQUUsS0FETDtRQUVOLG9CQUFvQixFQUFFLEtBQUtTLGFBRnJCO1FBR04sS0FBSyxFQUFFO01BSEQsRUFBVjtJQUtILENBZk0sTUFlQTtNQUNIZixPQUFPLEdBQUcsSUFBQU0sbUJBQUEsRUFDTixxREFDQSxtQ0FGTSxFQUdOO1FBQ0lDLEtBQUssRUFBRSxJQUFBQyxpQkFBQSxFQUFTLEtBQUtYLEtBQUwsQ0FBV1ksZUFBWCxDQUEyQkMsY0FBM0IsRUFBVDtNQURYLENBSE0sRUFLSDtRQUNDRyxDQUFDLEVBQUVDLEdBQUcsaUJBQUksd0NBQUtBLEdBQUw7TUFEWCxDQUxHLENBQVY7TUFTQSxNQUFNRSxhQUFhLEdBQUcsS0FBS25CLEtBQUwsQ0FBV00sVUFBWCxHQUF3QixLQUFLTixLQUFMLENBQVdPLFFBQVgsQ0FBb0JDLE1BQWxFO01BQ0FILE9BQU8sZ0JBQUcsNkJBQUMsc0JBQUQ7UUFDTixhQUFhLEVBQUUsSUFBQUksbUJBQUEsRUFBRyw4QkFBSCxFQUFtQztVQUFFVyxLQUFLLEVBQUVEO1FBQVQsQ0FBbkMsQ0FEVDtRQUVOLG9CQUFvQixFQUFFLEtBQUtFLGFBRnJCO1FBR04sU0FBUyxFQUFFLElBSEw7UUFJTixZQUFZLEVBQUUsSUFBQVosbUJBQUEsRUFBRyxZQUFILENBSlI7UUFLTixRQUFRLEVBQUUsS0FBS1MsYUFMVDtRQU1OLEtBQUssRUFBRTtNQU5ELEVBQVY7SUFRSDs7SUFFRCxvQkFDSSw2QkFBQyxtQkFBRDtNQUFZLFNBQVMsRUFBQyx3QkFBdEI7TUFDSSxVQUFVLEVBQUUsS0FBS0EsYUFEckI7TUFFSSxLQUFLLEVBQUUsSUFBQVQsbUJBQUEsRUFBRyxjQUFILENBRlg7TUFHSSxTQUFTLEVBQUM7SUFIZCxnQkFLSTtNQUFLLEVBQUUsRUFBQztJQUFSLEdBQ01OLE9BRE4sRUFFTUMsT0FGTixDQUxKLEVBVU1DLE9BVk4sQ0FESjtFQWNIOztBQS9Fb0UifQ==