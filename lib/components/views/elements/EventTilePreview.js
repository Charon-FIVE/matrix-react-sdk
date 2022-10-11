"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/models/event");

var Avatar = _interopRequireWildcard(require("../../../Avatar"));

var _EventTile = _interopRequireDefault(require("../rooms/EventTile"));

var _Layout = require("../../../settings/enums/Layout");

var _Spinner = _interopRequireDefault(require("./Spinner"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const AVATAR_SIZE = 32;

class EventTilePreview extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: props.message
    };
  }

  fakeEvent(_ref) {
    var _this = this;

    let {
      message
    } = _ref;
    // Fake it till we make it

    /* eslint-disable quote-props */
    const rawEvent = {
      type: "m.room.message",
      sender: this.props.userId,
      content: {
        "m.new_content": {
          msgtype: "m.text",
          body: message,
          displayname: this.props.displayName,
          avatar_url: this.props.avatarUrl
        },
        msgtype: "m.text",
        body: message,
        displayname: this.props.displayName,
        avatar_url: this.props.avatarUrl
      },
      unsigned: {
        age: 97
      },
      event_id: "$9999999999999999999999999999999999999999999",
      room_id: "!999999999999999999:example.org"
    };
    const event = new _event.MatrixEvent(rawEvent);
    /* eslint-enable quote-props */
    // Fake it more

    event.sender = {
      name: this.props.displayName || this.props.userId,
      rawDisplayName: this.props.displayName,
      userId: this.props.userId,
      getAvatarUrl: function () {
        return Avatar.avatarUrlForUser({
          avatarUrl: _this.props.avatarUrl
        }, AVATAR_SIZE, AVATAR_SIZE, "crop");
      },
      getMxcAvatarUrl: () => this.props.avatarUrl
    };
    return event;
  }

  render() {
    const className = (0, _classnames.default)(this.props.className, {
      "mx_IRCLayout": this.props.layout == _Layout.Layout.IRC,
      "mx_EventTilePreview_loader": !this.props.userId
    });
    if (!this.props.userId) return /*#__PURE__*/_react.default.createElement("div", {
      className: className
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    const event = this.fakeEvent(this.state);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: className
    }, /*#__PURE__*/_react.default.createElement(_EventTile.default, {
      mxEvent: event,
      layout: this.props.layout,
      as: "div"
    }));
  }

}

exports.default = EventTilePreview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBVkFUQVJfU0laRSIsIkV2ZW50VGlsZVByZXZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzdGF0ZSIsIm1lc3NhZ2UiLCJmYWtlRXZlbnQiLCJyYXdFdmVudCIsInR5cGUiLCJzZW5kZXIiLCJ1c2VySWQiLCJjb250ZW50IiwibXNndHlwZSIsImJvZHkiLCJkaXNwbGF5bmFtZSIsImRpc3BsYXlOYW1lIiwiYXZhdGFyX3VybCIsImF2YXRhclVybCIsInVuc2lnbmVkIiwiYWdlIiwiZXZlbnRfaWQiLCJyb29tX2lkIiwiZXZlbnQiLCJNYXRyaXhFdmVudCIsIm5hbWUiLCJyYXdEaXNwbGF5TmFtZSIsImdldEF2YXRhclVybCIsIkF2YXRhciIsImF2YXRhclVybEZvclVzZXIiLCJnZXRNeGNBdmF0YXJVcmwiLCJyZW5kZXIiLCJjbGFzc05hbWUiLCJjbGFzc25hbWVzIiwibGF5b3V0IiwiTGF5b3V0IiwiSVJDIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRXZlbnRUaWxlUHJldmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlcic7XG5cbmltcG9ydCAqIGFzIEF2YXRhciBmcm9tICcuLi8uLi8uLi9BdmF0YXInO1xuaW1wb3J0IEV2ZW50VGlsZSBmcm9tICcuLi9yb29tcy9FdmVudFRpbGUnO1xuaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL2VudW1zL0xheW91dFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSAnLi9TcGlubmVyJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLyoqXG4gICAgICogVGhlIHRleHQgdG8gYmUgZGlzcGxheWVkIGluIHRoZSBtZXNzYWdlIHByZXZpZXdcbiAgICAgKi9cbiAgICBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRvIHVzZSB0aGUgaXJjIGxheW91dCBvciBub3RcbiAgICAgKi9cbiAgICBsYXlvdXQ6IExheW91dDtcblxuICAgIC8qKlxuICAgICAqIGNsYXNzbmFtZXMgdG8gYXBwbHkgdG8gdGhlIHdyYXBwZXIgb2YgdGhlIHByZXZpZXdcbiAgICAgKi9cbiAgICBjbGFzc05hbWU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFRoZSBJRCBvZiB0aGUgZGlzcGxheWVkIHVzZXJcbiAgICAgKi9cbiAgICB1c2VySWQ/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGlzcGxheSBuYW1lIG9mIHRoZSBkaXNwbGF5ZWQgdXNlclxuICAgICAqL1xuICAgIGRpc3BsYXlOYW1lPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG14YzovLyBhdmF0YXIgVVJMIG9mIHRoZSBkaXNwbGF5ZWQgdXNlclxuICAgICAqL1xuICAgIGF2YXRhclVybD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG5jb25zdCBBVkFUQVJfU0laRSA9IDMyO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudFRpbGVQcmV2aWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBwcm9wcy5tZXNzYWdlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZmFrZUV2ZW50KHsgbWVzc2FnZSB9OiBJU3RhdGUpIHtcbiAgICAgICAgLy8gRmFrZSBpdCB0aWxsIHdlIG1ha2UgaXRcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgcXVvdGUtcHJvcHMgKi9cbiAgICAgICAgY29uc3QgcmF3RXZlbnQgPSB7XG4gICAgICAgICAgICB0eXBlOiBcIm0ucm9vbS5tZXNzYWdlXCIsXG4gICAgICAgICAgICBzZW5kZXI6IHRoaXMucHJvcHMudXNlcklkLFxuICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgIFwibS5uZXdfY29udGVudFwiOiB7XG4gICAgICAgICAgICAgICAgICAgIG1zZ3R5cGU6IFwibS50ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXluYW1lOiB0aGlzLnByb3BzLmRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiB0aGlzLnByb3BzLmF2YXRhclVybCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1zZ3R5cGU6IFwibS50ZXh0XCIsXG4gICAgICAgICAgICAgICAgYm9keTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5bmFtZTogdGhpcy5wcm9wcy5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiB0aGlzLnByb3BzLmF2YXRhclVybCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bnNpZ25lZDoge1xuICAgICAgICAgICAgICAgIGFnZTogOTcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXZlbnRfaWQ6IFwiJDk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTlcIixcbiAgICAgICAgICAgIHJvb21faWQ6IFwiITk5OTk5OTk5OTk5OTk5OTk5OTpleGFtcGxlLm9yZ1wiLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBldmVudCA9IG5ldyBNYXRyaXhFdmVudChyYXdFdmVudCk7XG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgcXVvdGUtcHJvcHMgKi9cblxuICAgICAgICAvLyBGYWtlIGl0IG1vcmVcbiAgICAgICAgZXZlbnQuc2VuZGVyID0ge1xuICAgICAgICAgICAgbmFtZTogdGhpcy5wcm9wcy5kaXNwbGF5TmFtZSB8fCB0aGlzLnByb3BzLnVzZXJJZCxcbiAgICAgICAgICAgIHJhd0Rpc3BsYXlOYW1lOiB0aGlzLnByb3BzLmRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgdXNlcklkOiB0aGlzLnByb3BzLnVzZXJJZCxcbiAgICAgICAgICAgIGdldEF2YXRhclVybDogKC4uLl8pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXZhdGFyLmF2YXRhclVybEZvclVzZXIoXG4gICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyVXJsOiB0aGlzLnByb3BzLmF2YXRhclVybCB9LFxuICAgICAgICAgICAgICAgICAgICBBVkFUQVJfU0laRSwgQVZBVEFSX1NJWkUsIFwiY3JvcFwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0TXhjQXZhdGFyVXJsOiAoKSA9PiB0aGlzLnByb3BzLmF2YXRhclVybCxcbiAgICAgICAgfSBhcyBSb29tTWVtYmVyO1xuXG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc25hbWVzKHRoaXMucHJvcHMuY2xhc3NOYW1lLCB7XG4gICAgICAgICAgICBcIm14X0lSQ0xheW91dFwiOiB0aGlzLnByb3BzLmxheW91dCA9PSBMYXlvdXQuSVJDLFxuICAgICAgICAgICAgXCJteF9FdmVudFRpbGVQcmV2aWV3X2xvYWRlclwiOiAhdGhpcy5wcm9wcy51c2VySWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy51c2VySWQpIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfT48U3Bpbm5lciAvPjwvZGl2PjtcblxuICAgICAgICBjb25zdCBldmVudCA9IHRoaXMuZmFrZUV2ZW50KHRoaXMuc3RhdGUpO1xuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfT5cbiAgICAgICAgICAgIDxFdmVudFRpbGVcbiAgICAgICAgICAgICAgICBteEV2ZW50PXtldmVudH1cbiAgICAgICAgICAgICAgICBsYXlvdXQ9e3RoaXMucHJvcHMubGF5b3V0fVxuICAgICAgICAgICAgICAgIGFzPVwi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