"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _event = require("matrix-js-sdk/src/@types/event");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _Media = require("../../../customisations/Media");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _BrowserWorkarounds = require("../../../utils/BrowserWorkarounds");

/*
Copyright 2015-2021 The Matrix.org Foundation C.I.C.

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
var Phases;

(function (Phases) {
  Phases["Display"] = "display";
  Phases["Uploading"] = "uploading";
  Phases["Error"] = "error";
})(Phases || (Phases = {}));

class ChangeAvatar extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "avatarSet", false);
    (0, _defineProperty2.default)(this, "onRoomStateEvents", ev => {
      if (!this.props.room) {
        return;
      }

      if (ev.getRoomId() !== this.props.room.roomId || ev.getType() !== _event.EventType.RoomAvatar || ev.getSender() !== _MatrixClientPeg.MatrixClientPeg.get().getUserId()) {
        return;
      }

      if (!ev.getContent().url) {
        this.avatarSet = false;
        this.setState({}); // force update
      }
    });
    (0, _defineProperty2.default)(this, "onFileSelected", ev => {
      this.avatarSet = true;
      return this.setAvatarFromFile(ev.target.files[0]);
    });
    (0, _defineProperty2.default)(this, "onError", () => {
      this.setState({
        errorText: (0, _languageHandler._t)("Failed to upload profile picture!")
      });
    });
    this.state = {
      avatarUrl: this.props.initialAvatarUrl,
      phase: Phases.Display
    };
  }

  componentDidMount() {
    _MatrixClientPeg.MatrixClientPeg.get().on(_roomState.RoomStateEvent.Events, this.onRoomStateEvents);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line


  UNSAFE_componentWillReceiveProps(newProps) {
    if (this.avatarSet) {
      // don't clobber what the user has just set
      return;
    }

    this.setState({
      avatarUrl: newProps.initialAvatarUrl
    });
  }

  componentWillUnmount() {
    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_roomState.RoomStateEvent.Events, this.onRoomStateEvents);
    }
  }

  setAvatarFromFile(file) {
    let newUrl = null;
    this.setState({
      phase: Phases.Uploading
    });

    const httpPromise = _MatrixClientPeg.MatrixClientPeg.get().uploadContent(file).then(url => {
      newUrl = url;

      if (this.props.room) {
        return _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(this.props.room.roomId, 'm.room.avatar', {
          url: url
        }, '');
      } else {
        return _MatrixClientPeg.MatrixClientPeg.get().setAvatarUrl(url);
      }
    });

    httpPromise.then(() => {
      this.setState({
        phase: Phases.Display,
        avatarUrl: (0, _Media.mediaFromMxc)(newUrl).srcHttp
      });
    }, () => {
      this.setState({
        phase: Phases.Error
      });
      this.onError();
    });
    return httpPromise;
  }

  render() {
    let avatarImg; // Having just set an avatar we just display that since it will take a little
    // time to propagate through to the RoomAvatar.

    if (this.props.room && !this.avatarSet) {
      avatarImg = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        room: this.props.room,
        width: this.props.width,
        height: this.props.height,
        resizeMethod: "crop"
      });
    } else {
      // XXX: FIXME: once we track in the JS what our own displayname is(!) then use it here rather than ?
      avatarImg = /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
        width: this.props.width,
        height: this.props.height,
        resizeMethod: "crop",
        name: "?",
        idName: _MatrixClientPeg.MatrixClientPeg.get().getUserIdLocalpart(),
        url: this.state.avatarUrl
      });
    }

    let uploadSection;

    if (this.props.showUploadSection) {
      uploadSection = /*#__PURE__*/_react.default.createElement("div", {
        className: this.props.className
      }, (0, _languageHandler._t)("Upload new:"), /*#__PURE__*/_react.default.createElement("input", {
        type: "file",
        accept: "image/*",
        onClick: _BrowserWorkarounds.chromeFileInputFix,
        onChange: this.onFileSelected
      }), this.state.errorText);
    }

    switch (this.state.phase) {
      case Phases.Display:
      case Phases.Error:
        return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
          className: this.props.className
        }, avatarImg), uploadSection);

      case Phases.Uploading:
        return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }
  }

}

exports.default = ChangeAvatar;
(0, _defineProperty2.default)(ChangeAvatar, "defaultProps", {
  showUploadSection: true,
  className: "",
  width: 80,
  height: 80
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGFzZXMiLCJDaGFuZ2VBdmF0YXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldiIsInJvb20iLCJnZXRSb29tSWQiLCJyb29tSWQiLCJnZXRUeXBlIiwiRXZlbnRUeXBlIiwiUm9vbUF2YXRhciIsImdldFNlbmRlciIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFVzZXJJZCIsImdldENvbnRlbnQiLCJ1cmwiLCJhdmF0YXJTZXQiLCJzZXRTdGF0ZSIsInNldEF2YXRhckZyb21GaWxlIiwidGFyZ2V0IiwiZmlsZXMiLCJlcnJvclRleHQiLCJfdCIsInN0YXRlIiwiYXZhdGFyVXJsIiwiaW5pdGlhbEF2YXRhclVybCIsInBoYXNlIiwiRGlzcGxheSIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJSb29tU3RhdGVFdmVudCIsIkV2ZW50cyIsIm9uUm9vbVN0YXRlRXZlbnRzIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJmaWxlIiwibmV3VXJsIiwiVXBsb2FkaW5nIiwiaHR0cFByb21pc2UiLCJ1cGxvYWRDb250ZW50IiwidGhlbiIsInNlbmRTdGF0ZUV2ZW50Iiwic2V0QXZhdGFyVXJsIiwibWVkaWFGcm9tTXhjIiwic3JjSHR0cCIsIkVycm9yIiwib25FcnJvciIsInJlbmRlciIsImF2YXRhckltZyIsIndpZHRoIiwiaGVpZ2h0IiwiZ2V0VXNlcklkTG9jYWxwYXJ0IiwidXBsb2FkU2VjdGlvbiIsInNob3dVcGxvYWRTZWN0aW9uIiwiY2xhc3NOYW1lIiwiY2hyb21lRmlsZUlucHV0Rml4Iiwib25GaWxlU2VsZWN0ZWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy9DaGFuZ2VBdmF0YXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNS0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCB7IFJvb20gfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbSc7XG5pbXBvcnQgeyBSb29tU3RhdGVFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1zdGF0ZVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9TcGlubmVyJztcbmltcG9ydCB7IG1lZGlhRnJvbU14YyB9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSAnLi4vYXZhdGFycy9Sb29tQXZhdGFyJztcbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gJy4uL2F2YXRhcnMvQmFzZUF2YXRhcic7XG5pbXBvcnQgeyBjaHJvbWVGaWxlSW5wdXRGaXggfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQnJvd3Nlcldvcmthcm91bmRzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGluaXRpYWxBdmF0YXJVcmw/OiBzdHJpbmc7XG4gICAgcm9vbT86IFJvb207XG4gICAgLy8gaWYgZmFsc2UsIHlvdSBuZWVkIHRvIGNhbGwgY2hhbmdlQXZhdGFyLm9uRmlsZVNlbGVjdGVkIHlvdXJzZWxmLlxuICAgIHNob3dVcGxvYWRTZWN0aW9uPzogYm9vbGVhbjtcbiAgICB3aWR0aD86IG51bWJlcjtcbiAgICBoZWlnaHQ/OiBudW1iZXI7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBhdmF0YXJVcmw/OiBzdHJpbmc7XG4gICAgZXJyb3JUZXh0Pzogc3RyaW5nO1xuICAgIHBoYXNlPzogUGhhc2VzO1xufVxuXG5lbnVtIFBoYXNlcyB7XG4gICAgRGlzcGxheSA9IFwiZGlzcGxheVwiLFxuICAgIFVwbG9hZGluZyA9IFwidXBsb2FkaW5nXCIsXG4gICAgRXJyb3IgPSBcImVycm9yXCIsXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYW5nZUF2YXRhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBzaG93VXBsb2FkU2VjdGlvbjogdHJ1ZSxcbiAgICAgICAgY2xhc3NOYW1lOiBcIlwiLFxuICAgICAgICB3aWR0aDogODAsXG4gICAgICAgIGhlaWdodDogODAsXG4gICAgfTtcblxuICAgIHByaXZhdGUgYXZhdGFyU2V0ID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgYXZhdGFyVXJsOiB0aGlzLnByb3BzLmluaXRpYWxBdmF0YXJVcmwsXG4gICAgICAgICAgICBwaGFzZTogUGhhc2VzLkRpc3BsYXksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIHB1YmxpYyBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wczogSVByb3BzKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmF2YXRhclNldCkge1xuICAgICAgICAgICAgLy8gZG9uJ3QgY2xvYmJlciB3aGF0IHRoZSB1c2VyIGhhcyBqdXN0IHNldFxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYXZhdGFyVXJsOiBuZXdQcm9wcy5pbml0aWFsQXZhdGFyVXJsLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihSb29tU3RhdGVFdmVudC5FdmVudHMsIHRoaXMub25Sb29tU3RhdGVFdmVudHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJvb21TdGF0ZUV2ZW50cyA9IChldjogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnJvb20pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldi5nZXRSb29tSWQoKSAhPT0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCB8fFxuICAgICAgICAgICAgZXYuZ2V0VHlwZSgpICE9PSBFdmVudFR5cGUuUm9vbUF2YXRhciB8fFxuICAgICAgICAgICAgZXYuZ2V0U2VuZGVyKCkgIT09IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXYuZ2V0Q29udGVudCgpLnVybCkge1xuICAgICAgICAgICAgdGhpcy5hdmF0YXJTZXQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe30pOyAvLyBmb3JjZSB1cGRhdGVcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHNldEF2YXRhckZyb21GaWxlKGZpbGU6IEZpbGUpOiBQcm9taXNlPHt9PiB7XG4gICAgICAgIGxldCBuZXdVcmwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhhc2U6IFBoYXNlcy5VcGxvYWRpbmcsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBodHRwUHJvbWlzZSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS51cGxvYWRDb250ZW50KGZpbGUpLnRoZW4oKHVybCkgPT4ge1xuICAgICAgICAgICAgbmV3VXJsID0gdXJsO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMucm9vbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgICdtLnJvb20uYXZhdGFyJyxcbiAgICAgICAgICAgICAgICAgICAgeyB1cmw6IHVybCB9LFxuICAgICAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldEF2YXRhclVybCh1cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBodHRwUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBQaGFzZXMuRGlzcGxheSxcbiAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IG1lZGlhRnJvbU14YyhuZXdVcmwpLnNyY0h0dHAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IFBoYXNlcy5FcnJvcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBodHRwUHJvbWlzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRmlsZVNlbGVjdGVkID0gKGV2OiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICB0aGlzLmF2YXRhclNldCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF2YXRhckZyb21GaWxlKGV2LnRhcmdldC5maWxlc1swXSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FcnJvciA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlcnJvclRleHQ6IF90KFwiRmFpbGVkIHRvIHVwbG9hZCBwcm9maWxlIHBpY3R1cmUhXCIpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBhdmF0YXJJbWc7XG4gICAgICAgIC8vIEhhdmluZyBqdXN0IHNldCBhbiBhdmF0YXIgd2UganVzdCBkaXNwbGF5IHRoYXQgc2luY2UgaXQgd2lsbCB0YWtlIGEgbGl0dGxlXG4gICAgICAgIC8vIHRpbWUgdG8gcHJvcGFnYXRlIHRocm91Z2ggdG8gdGhlIFJvb21BdmF0YXIuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJvb20gJiYgIXRoaXMuYXZhdGFyU2V0KSB7XG4gICAgICAgICAgICBhdmF0YXJJbWcgPSA8Um9vbUF2YXRhclxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICB3aWR0aD17dGhpcy5wcm9wcy53aWR0aH1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9e3RoaXMucHJvcHMuaGVpZ2h0fVxuICAgICAgICAgICAgICAgIHJlc2l6ZU1ldGhvZD0nY3JvcCdcbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gWFhYOiBGSVhNRTogb25jZSB3ZSB0cmFjayBpbiB0aGUgSlMgd2hhdCBvdXIgb3duIGRpc3BsYXluYW1lIGlzKCEpIHRoZW4gdXNlIGl0IGhlcmUgcmF0aGVyIHRoYW4gP1xuICAgICAgICAgICAgYXZhdGFySW1nID0gPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICB3aWR0aD17dGhpcy5wcm9wcy53aWR0aH1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9e3RoaXMucHJvcHMuaGVpZ2h0fVxuICAgICAgICAgICAgICAgIHJlc2l6ZU1ldGhvZD0nY3JvcCdcbiAgICAgICAgICAgICAgICBuYW1lPSc/J1xuICAgICAgICAgICAgICAgIGlkTmFtZT17TWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZExvY2FscGFydCgpfVxuICAgICAgICAgICAgICAgIHVybD17dGhpcy5zdGF0ZS5hdmF0YXJVcmx9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGxvYWRTZWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93VXBsb2FkU2VjdGlvbikge1xuICAgICAgICAgICAgdXBsb2FkU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVXBsb2FkIG5ldzpcIikgfVxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgb25DbGljaz17Y2hyb21lRmlsZUlucHV0Rml4fSBvbkNoYW5nZT17dGhpcy5vbkZpbGVTZWxlY3RlZH0gLz5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLnBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIFBoYXNlcy5EaXNwbGF5OlxuICAgICAgICAgICAgY2FzZSBQaGFzZXMuRXJyb3I6XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXJJbWcgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHVwbG9hZFNlY3Rpb24gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSBQaGFzZXMuVXBsb2FkaW5nOlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQWdDS0EsTTs7V0FBQUEsTTtFQUFBQSxNO0VBQUFBLE07RUFBQUEsTTtHQUFBQSxNLEtBQUFBLE07O0FBTVUsTUFBTUMsWUFBTixTQUEyQkMsY0FBQSxDQUFNQyxTQUFqQyxDQUEyRDtFQVV0RUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIsaURBRlAsS0FFTztJQUFBLHlEQStCRUMsRUFBRCxJQUFxQjtNQUM3QyxJQUFJLENBQUMsS0FBS0QsS0FBTCxDQUFXRSxJQUFoQixFQUFzQjtRQUNsQjtNQUNIOztNQUVELElBQUlELEVBQUUsQ0FBQ0UsU0FBSCxPQUFtQixLQUFLSCxLQUFMLENBQVdFLElBQVgsQ0FBZ0JFLE1BQW5DLElBQ0FILEVBQUUsQ0FBQ0ksT0FBSCxPQUFpQkMsZ0JBQUEsQ0FBVUMsVUFEM0IsSUFFQU4sRUFBRSxDQUFDTyxTQUFILE9BQW1CQyxnQ0FBQSxDQUFnQkMsR0FBaEIs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