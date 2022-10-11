"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _RoomUpgrade = require("../../../utils/RoomUpgrade");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _ErrorDialog = _interopRequireDefault(require("./ErrorDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

/*
Copyright 2018 - 2021 The Matrix.org Foundation C.I.C.

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
class RoomUpgradeDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "targetVersion", void 0);
    (0, _defineProperty2.default)(this, "state", {
      busy: true
    });
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onUpgradeClick", () => {
      this.setState({
        busy: true
      });
      (0, _RoomUpgrade.upgradeRoom)(this.props.room, this.targetVersion, false, false).then(() => {
        this.props.onFinished(true);
      }).catch(err => {
        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Failed to upgrade room"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("The room upgrade could not be completed")
        });
      }).finally(() => {
        this.setState({
          busy: false
        });
      });
    });
  }

  async componentDidMount() {
    const recommended = await this.props.room.getRecommendedVersion();
    this.targetVersion = recommended.version;
    this.setState({
      busy: false
    });
  }

  render() {
    let buttons;

    if (this.state.busy) {
      buttons = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      buttons = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Upgrade this room to version %(version)s', {
          version: this.targetVersion
        }),
        primaryButtonClass: "danger",
        hasCancel: true,
        onPrimaryButtonClick: this.onUpgradeClick,
        onCancel: this.onCancelClick
      });
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_RoomUpgradeDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Upgrade Room Version"),
      contentId: "mx_Dialog_content",
      hasCancel: true
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Upgrading this room requires closing down the current " + "instance of the room and creating a new room in its place. " + "To give room members the best possible experience, we will:")), /*#__PURE__*/_react.default.createElement("ol", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Create a new room with the same name, description and avatar")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Update any local room aliases to point to the new room")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Stop users from speaking in the old version of the room, " + "and post a message advising users to move to the new room")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Put a link back to the old room at the start of the new room " + "so people can see old messages"))), buttons);
  }

}

exports.default = RoomUpgradeDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tVXBncmFkZURpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiYnVzeSIsInByb3BzIiwib25GaW5pc2hlZCIsInNldFN0YXRlIiwidXBncmFkZVJvb20iLCJyb29tIiwidGFyZ2V0VmVyc2lvbiIsInRoZW4iLCJjYXRjaCIsImVyciIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwiZmluYWxseSIsImNvbXBvbmVudERpZE1vdW50IiwicmVjb21tZW5kZWQiLCJnZXRSZWNvbW1lbmRlZFZlcnNpb24iLCJ2ZXJzaW9uIiwicmVuZGVyIiwiYnV0dG9ucyIsInN0YXRlIiwib25VcGdyYWRlQ2xpY2siLCJvbkNhbmNlbENsaWNrIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9Sb29tVXBncmFkZURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5cbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyB1cGdyYWRlUm9vbSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9Sb29tVXBncmFkZVwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSAnLi9FcnJvckRpYWxvZyc7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tICcuLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zJztcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIHJvb206IFJvb207XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGJ1c3k6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21VcGdyYWRlRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSB0YXJnZXRWZXJzaW9uOiBzdHJpbmc7XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgYnVzeTogdHJ1ZSxcbiAgICB9O1xuXG4gICAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHJlY29tbWVuZGVkID0gYXdhaXQgdGhpcy5wcm9wcy5yb29tLmdldFJlY29tbWVuZGVkVmVyc2lvbigpO1xuICAgICAgICB0aGlzLnRhcmdldFZlcnNpb24gPSByZWNvbW1lbmRlZC52ZXJzaW9uO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgYnVzeTogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbENsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXBncmFkZUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgYnVzeTogdHJ1ZSB9KTtcbiAgICAgICAgdXBncmFkZVJvb20odGhpcy5wcm9wcy5yb29tLCB0aGlzLnRhcmdldFZlcnNpb24sIGZhbHNlLCBmYWxzZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byB1cGdyYWRlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJUaGUgcm9vbSB1cGdyYWRlIGNvdWxkIG5vdCBiZSBjb21wbGV0ZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJ1c3k6IGZhbHNlIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgYnV0dG9ucztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgYnV0dG9ucyA9IDxTcGlubmVyIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9ucyA9IDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ1VwZ3JhZGUgdGhpcyByb29tIHRvIHZlcnNpb24gJSh2ZXJzaW9uKXMnLCB7IHZlcnNpb246IHRoaXMudGFyZ2V0VmVyc2lvbiB9KX1cbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uQ2xhc3M9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblVwZ3JhZGVDbGlja31cbiAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVXBncmFkZURpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlVwZ3JhZGUgUm9vbSBWZXJzaW9uXCIpfVxuICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJVcGdyYWRpbmcgdGhpcyByb29tIHJlcXVpcmVzIGNsb3NpbmcgZG93biB0aGUgY3VycmVudCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImluc3RhbmNlIG9mIHRoZSByb29tIGFuZCBjcmVhdGluZyBhIG5ldyByb29tIGluIGl0cyBwbGFjZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJUbyBnaXZlIHJvb20gbWVtYmVycyB0aGUgYmVzdCBwb3NzaWJsZSBleHBlcmllbmNlLCB3ZSB3aWxsOlwiLFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPG9sPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIkNyZWF0ZSBhIG5ldyByb29tIHdpdGggdGhlIHNhbWUgbmFtZSwgZGVzY3JpcHRpb24gYW5kIGF2YXRhclwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJVcGRhdGUgYW55IGxvY2FsIHJvb20gYWxpYXNlcyB0byBwb2ludCB0byB0aGUgbmV3IHJvb21cIikgfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57IF90KFwiU3RvcCB1c2VycyBmcm9tIHNwZWFraW5nIGluIHRoZSBvbGQgdmVyc2lvbiBvZiB0aGUgcm9vbSwgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhbmQgcG9zdCBhIG1lc3NhZ2UgYWR2aXNpbmcgdXNlcnMgdG8gbW92ZSB0byB0aGUgbmV3IHJvb21cIikgfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57IF90KFwiUHV0IGEgbGluayBiYWNrIHRvIHRoZSBvbGQgcm9vbSBhdCB0aGUgc3RhcnQgb2YgdGhlIG5ldyByb29tIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic28gcGVvcGxlIGNhbiBzZWUgb2xkIG1lc3NhZ2VzXCIpIH08L2xpPlxuICAgICAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgICAgICAgeyBidXR0b25zIH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxv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