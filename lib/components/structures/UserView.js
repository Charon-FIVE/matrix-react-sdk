"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/models/event");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../Modal"));

var _languageHandler = require("../../languageHandler");

var _ErrorDialog = _interopRequireDefault(require("../views/dialogs/ErrorDialog"));

var _MainSplit = _interopRequireDefault(require("./MainSplit"));

var _RightPanel = _interopRequireDefault(require("./RightPanel"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _RightPanelStorePhases = require("../../stores/right-panel/RightPanelStorePhases");

var _UserOnboardingPage = require("../views/user-onboarding/UserOnboardingPage");

/*
Copyright 2019 New Vector Ltd
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
class UserView extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    if (this.props.userId) {
      this.loadProfileInfo();
    }
  }

  componentDidUpdate(prevProps) {
    // XXX: We shouldn't need to null check the userId here, but we declare
    // it as optional and MatrixChat sometimes fires in a way which results
    // in an NPE when we try to update the profile info.
    if (prevProps.userId !== this.props.userId && this.props.userId) {
      this.loadProfileInfo();
    }
  }

  async loadProfileInfo() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    this.setState({
      loading: true
    });
    let profileInfo;

    try {
      profileInfo = await cli.getProfileInfo(this.props.userId);
    } catch (err) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Could not load user profile'),
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });

      this.setState({
        loading: false
      });
      return;
    }

    const fakeEvent = new _event.MatrixEvent({
      type: "m.room.member",
      content: profileInfo
    });
    const member = new _roomMember.RoomMember(null, this.props.userId);
    member.setMembershipEvent(fakeEvent);
    this.setState({
      member,
      loading: false
    });
  }

  render() {
    if (this.state.loading) {
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else if (this.state.member) {
      const panel = /*#__PURE__*/_react.default.createElement(_RightPanel.default, {
        overwriteCard: {
          phase: _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo,
          state: {
            member: this.state.member
          }
        },
        resizeNotifier: this.props.resizeNotifier
      });

      return /*#__PURE__*/_react.default.createElement(_MainSplit.default, {
        panel: panel,
        resizeNotifier: this.props.resizeNotifier
      }, /*#__PURE__*/_react.default.createElement(_UserOnboardingPage.UserOnboardingPage, null));
    } else {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }
  }

}

exports.default = UserView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVc2VyVmlldyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwibG9hZGluZyIsImNvbXBvbmVudERpZE1vdW50IiwidXNlcklkIiwibG9hZFByb2ZpbGVJbmZvIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic2V0U3RhdGUiLCJwcm9maWxlSW5mbyIsImdldFByb2ZpbGVJbmZvIiwiZXJyIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiX3QiLCJkZXNjcmlwdGlvbiIsIm1lc3NhZ2UiLCJmYWtlRXZlbnQiLCJNYXRyaXhFdmVudCIsInR5cGUiLCJjb250ZW50IiwibWVtYmVyIiwiUm9vbU1lbWJlciIsInNldE1lbWJlcnNoaXBFdmVudCIsInJlbmRlciIsInBhbmVsIiwicGhhc2UiLCJSaWdodFBhbmVsUGhhc2VzIiwiUm9vbU1lbWJlckluZm8iLCJyZXNpemVOb3RpZmllciJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVXNlclZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgTWFpblNwbGl0IGZyb20gXCIuL01haW5TcGxpdFwiO1xuaW1wb3J0IFJpZ2h0UGFuZWwgZnJvbSBcIi4vUmlnaHRQYW5lbFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCBSZXNpemVOb3RpZmllciBmcm9tIFwiLi4vLi4vdXRpbHMvUmVzaXplTm90aWZpZXJcIjtcbmltcG9ydCB7IFJpZ2h0UGFuZWxQaGFzZXMgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVBoYXNlc1wiO1xuaW1wb3J0IHsgVXNlck9uYm9hcmRpbmdQYWdlIH0gZnJvbSBcIi4uL3ZpZXdzL3VzZXItb25ib2FyZGluZy9Vc2VyT25ib2FyZGluZ1BhZ2VcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdXNlcklkPzogc3RyaW5nO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgbG9hZGluZzogYm9vbGVhbjtcbiAgICBtZW1iZXI/OiBSb29tTWVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnVzZXJJZCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkUHJvZmlsZUluZm8oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBJUHJvcHMpOiB2b2lkIHtcbiAgICAgICAgLy8gWFhYOiBXZSBzaG91bGRuJ3QgbmVlZCB0byBudWxsIGNoZWNrIHRoZSB1c2VySWQgaGVyZSwgYnV0IHdlIGRlY2xhcmVcbiAgICAgICAgLy8gaXQgYXMgb3B0aW9uYWwgYW5kIE1hdHJpeENoYXQgc29tZXRpbWVzIGZpcmVzIGluIGEgd2F5IHdoaWNoIHJlc3VsdHNcbiAgICAgICAgLy8gaW4gYW4gTlBFIHdoZW4gd2UgdHJ5IHRvIHVwZGF0ZSB0aGUgcHJvZmlsZSBpbmZvLlxuICAgICAgICBpZiAocHJldlByb3BzLnVzZXJJZCAhPT0gdGhpcy5wcm9wcy51c2VySWQgJiYgdGhpcy5wcm9wcy51c2VySWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZFByb2ZpbGVJbmZvKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGxvYWRQcm9maWxlSW5mbygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgbGV0IHByb2ZpbGVJbmZvO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvZmlsZUluZm8gPSBhd2FpdCBjbGkuZ2V0UHJvZmlsZUluZm8odGhpcy5wcm9wcy51c2VySWQpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnQ291bGQgbm90IGxvYWQgdXNlciBwcm9maWxlJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZha2VFdmVudCA9IG5ldyBNYXRyaXhFdmVudCh7IHR5cGU6IFwibS5yb29tLm1lbWJlclwiLCBjb250ZW50OiBwcm9maWxlSW5mbyB9KTtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gbmV3IFJvb21NZW1iZXIobnVsbCwgdGhpcy5wcm9wcy51c2VySWQpO1xuICAgICAgICBtZW1iZXIuc2V0TWVtYmVyc2hpcEV2ZW50KGZha2VFdmVudCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZW1iZXIsIGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5tZW1iZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhbmVsID0gPFJpZ2h0UGFuZWxcbiAgICAgICAgICAgICAgICBvdmVyd3JpdGVDYXJkPXt7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJJbmZvLCBzdGF0ZTogeyBtZW1iZXI6IHRoaXMuc3RhdGUubWVtYmVyIH0gfX1cbiAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgcmV0dXJuICg8TWFpblNwbGl0IHBhbmVsPXtwYW5lbH0gcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9PlxuICAgICAgICAgICAgICAgIDxVc2VyT25ib2FyZGluZ1BhZ2UgLz5cbiAgICAgICAgICAgIDwvTWFpblNwbGl0Pik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKDxkaXYgLz4pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBMkJlLE1BQU1BLFFBQU4sU0FBdUJDLGNB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