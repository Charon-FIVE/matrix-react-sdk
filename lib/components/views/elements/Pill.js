"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PillType = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _logger = require("matrix-js-sdk/src/logger");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _actions = require("../../../dispatcher/actions");

var _Tooltip = _interopRequireWildcard(require("./Tooltip"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 - 2019, 2021 The Matrix.org Foundation C.I.C.

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
let PillType;
exports.PillType = PillType;

(function (PillType) {
  PillType["UserMention"] = "TYPE_USER_MENTION";
  PillType["RoomMention"] = "TYPE_ROOM_MENTION";
  PillType["AtRoomMention"] = "TYPE_AT_ROOM_MENTION";
})(PillType || (exports.PillType = PillType = {}));

class Pill extends _react.default.Component {
  static roomNotifPos(text) {
    return text.indexOf("@room");
  }

  static roomNotifLen() {
    return "@room".length;
  }

  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", true);
    (0, _defineProperty2.default)(this, "matrixClient", void 0);
    (0, _defineProperty2.default)(this, "onMouseOver", () => {
      this.setState({
        hover: true
      });
    });
    (0, _defineProperty2.default)(this, "onMouseLeave", () => {
      this.setState({
        hover: false
      });
    });
    (0, _defineProperty2.default)(this, "onUserPillClicked", e => {
      e.preventDefault();

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewUser,
        member: this.state.member
      });
    });
    this.state = {
      resourceId: null,
      pillType: null,
      member: null,
      room: null,
      hover: false
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention


  async UNSAFE_componentWillReceiveProps(nextProps) {
    let resourceId;
    let prefix;

    if (nextProps.url) {
      if (nextProps.inMessage) {
        const parts = (0, _Permalinks.parsePermalink)(nextProps.url);
        resourceId = parts.primaryEntityId; // The room/user ID

        prefix = parts.sigil; // The first character of prefix
      } else {
        resourceId = (0, _Permalinks.getPrimaryPermalinkEntity)(nextProps.url);
        prefix = resourceId ? resourceId[0] : undefined;
      }
    }

    const pillType = this.props.type || {
      '@': PillType.UserMention,
      '#': PillType.RoomMention,
      '!': PillType.RoomMention
    }[prefix];
    let member;
    let room;

    switch (pillType) {
      case PillType.AtRoomMention:
        {
          room = nextProps.room;
        }
        break;

      case PillType.UserMention:
        {
          const localMember = nextProps.room ? nextProps.room.getMember(resourceId) : undefined;
          member = localMember;

          if (!localMember) {
            member = new _roomMember.RoomMember(null, resourceId);
            this.doProfileLookup(resourceId, member);
          }
        }
        break;

      case PillType.RoomMention:
        {
          const localRoom = resourceId[0] === '#' ? _MatrixClientPeg.MatrixClientPeg.get().getRooms().find(r => {
            return r.getCanonicalAlias() === resourceId || r.getAltAliases().includes(resourceId);
          }) : _MatrixClientPeg.MatrixClientPeg.get().getRoom(resourceId);
          room = localRoom;

          if (!localRoom) {// TODO: This would require a new API to resolve a room alias to
            // a room avatar and name.
            // this.doRoomProfileLookup(resourceId, member);
          }
        }
        break;
    }

    this.setState({
      resourceId,
      pillType,
      member,
      room
    });
  }

  componentDidMount() {
    this.unmounted = false;
    this.matrixClient = _MatrixClientPeg.MatrixClientPeg.get(); // eslint-disable-next-line new-cap

    this.UNSAFE_componentWillReceiveProps(this.props); // HACK: We shouldn't be calling lifecycle functions ourselves.
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  doProfileLookup(userId, member) {
    _MatrixClientPeg.MatrixClientPeg.get().getProfileInfo(userId).then(resp => {
      if (this.unmounted) {
        return;
      }

      member.name = resp.displayname;
      member.rawDisplayName = resp.displayname;
      member.events.member = {
        getContent: () => {
          return {
            avatar_url: resp.avatar_url
          };
        },
        getDirectionalContent: function () {
          return this.getContent();
        }
      };
      this.setState({
        member
      });
    }).catch(err => {
      _logger.logger.error('Could not retrieve profile data for ' + userId + ':', err);
    });
  }

  render() {
    const resource = this.state.resourceId;
    let avatar = null;
    let linkText = resource;
    let pillClass;
    let userId;
    let href = this.props.url;
    let onClick;

    switch (this.state.pillType) {
      case PillType.AtRoomMention:
        {
          const room = this.props.room;

          if (room) {
            linkText = "@room";

            if (this.props.shouldShowPillAvatar) {
              avatar = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
                room: room,
                width: 16,
                height: 16,
                "aria-hidden": "true"
              });
            }

            pillClass = 'mx_AtRoomPill';
          }
        }
        break;

      case PillType.UserMention:
        {
          // If this user is not a member of this room, default to the empty member
          const member = this.state.member;

          if (member) {
            userId = member.userId;
            member.rawDisplayName = member.rawDisplayName || '';
            linkText = member.rawDisplayName;

            if (this.props.shouldShowPillAvatar) {
              avatar = /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
                member: member,
                width: 16,
                height: 16,
                "aria-hidden": "true",
                hideTitle: true
              });
            }

            pillClass = 'mx_UserPill';
            href = null;
            onClick = this.onUserPillClicked;
          }
        }
        break;

      case PillType.RoomMention:
        {
          const room = this.state.room;

          if (room) {
            linkText = room.name || resource;

            if (this.props.shouldShowPillAvatar) {
              avatar = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
                room: room,
                width: 16,
                height: 16,
                "aria-hidden": "true"
              });
            }
          }

          pillClass = room?.isSpaceRoom() ? "mx_SpacePill" : "mx_RoomPill";
        }
        break;
    }

    const classes = (0, _classnames.default)("mx_Pill", pillClass, {
      "mx_UserPill_me": userId === _MatrixClientPeg.MatrixClientPeg.get().getUserId()
    });

    if (this.state.pillType) {
      let tip;

      if (this.state.hover && resource) {
        tip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
          label: resource,
          alignment: _Tooltip.Alignment.Right
        });
      }

      return /*#__PURE__*/_react.default.createElement("bdi", null, /*#__PURE__*/_react.default.createElement(_MatrixClientContext.default.Provider, {
        value: this.matrixClient
      }, this.props.inMessage ? /*#__PURE__*/_react.default.createElement("a", {
        className: classes,
        href: href,
        onClick: onClick,
        onMouseOver: this.onMouseOver,
        onMouseLeave: this.onMouseLeave
      }, avatar, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_Pill_linkText"
      }, linkText), tip) : /*#__PURE__*/_react.default.createElement("span", {
        className: classes,
        onMouseOver: this.onMouseOver,
        onMouseLeave: this.onMouseLeave
      }, avatar, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_Pill_linkText"
      }, linkText), tip)));
    } else {
      // Deliberately render nothing if the URL isn't recognised
      return null;
    }
  }

}

exports.default = Pill;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaWxsVHlwZSIsIlBpbGwiLCJSZWFjdCIsIkNvbXBvbmVudCIsInJvb21Ob3RpZlBvcyIsInRleHQiLCJpbmRleE9mIiwicm9vbU5vdGlmTGVuIiwibGVuZ3RoIiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwiaG92ZXIiLCJlIiwicHJldmVudERlZmF1bHQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdVc2VyIiwibWVtYmVyIiwic3RhdGUiLCJyZXNvdXJjZUlkIiwicGlsbFR5cGUiLCJyb29tIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJwcmVmaXgiLCJ1cmwiLCJpbk1lc3NhZ2UiLCJwYXJ0cyIsInBhcnNlUGVybWFsaW5rIiwicHJpbWFyeUVudGl0eUlkIiwic2lnaWwiLCJnZXRQcmltYXJ5UGVybWFsaW5rRW50aXR5IiwidW5kZWZpbmVkIiwidHlwZSIsIlVzZXJNZW50aW9uIiwiUm9vbU1lbnRpb24iLCJBdFJvb21NZW50aW9uIiwibG9jYWxNZW1iZXIiLCJnZXRNZW1iZXIiLCJSb29tTWVtYmVyIiwiZG9Qcm9maWxlTG9va3VwIiwibG9jYWxSb29tIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0Um9vbXMiLCJmaW5kIiwiciIsImdldENhbm9uaWNhbEFsaWFzIiwiZ2V0QWx0QWxpYXNlcyIsImluY2x1ZGVzIiwiZ2V0Um9vbSIsImNvbXBvbmVudERpZE1vdW50IiwidW5tb3VudGVkIiwibWF0cml4Q2xpZW50IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1c2VySWQiLCJnZXRQcm9maWxlSW5mbyIsInRoZW4iLCJyZXNwIiwibmFtZSIsImRpc3BsYXluYW1lIiwicmF3RGlzcGxheU5hbWUiLCJldmVudHMiLCJnZXRDb250ZW50IiwiYXZhdGFyX3VybCIsImdldERpcmVjdGlvbmFsQ29udGVudCIsImNhdGNoIiwiZXJyIiwibG9nZ2VyIiwiZXJyb3IiLCJyZW5kZXIiLCJyZXNvdXJjZSIsImF2YXRhciIsImxpbmtUZXh0IiwicGlsbENsYXNzIiwiaHJlZiIsIm9uQ2xpY2siLCJzaG91bGRTaG93UGlsbEF2YXRhciIsIm9uVXNlclBpbGxDbGlja2VkIiwiaXNTcGFjZVJvb20iLCJjbGFzc2VzIiwiY2xhc3NOYW1lcyIsImdldFVzZXJJZCIsInRpcCIsIkFsaWdubWVudCIsIlJpZ2h0Iiwib25Nb3VzZU92ZXIiLCJvbk1vdXNlTGVhdmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9QaWxsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgLSAyMDE5LCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tJztcbmltcG9ydCB7IFJvb21NZW1iZXIgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXInO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcblxuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IGdldFByaW1hcnlQZXJtYWxpbmtFbnRpdHksIHBhcnNlUGVybWFsaW5rIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBUb29sdGlwLCB7IEFsaWdubWVudCB9IGZyb20gJy4vVG9vbHRpcCc7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tICcuLi9hdmF0YXJzL1Jvb21BdmF0YXInO1xuaW1wb3J0IE1lbWJlckF2YXRhciBmcm9tICcuLi9hdmF0YXJzL01lbWJlckF2YXRhcic7XG5cbmV4cG9ydCBlbnVtIFBpbGxUeXBlIHtcbiAgICBVc2VyTWVudGlvbiA9ICdUWVBFX1VTRVJfTUVOVElPTicsXG4gICAgUm9vbU1lbnRpb24gPSAnVFlQRV9ST09NX01FTlRJT04nLFxuICAgIEF0Um9vbU1lbnRpb24gPSAnVFlQRV9BVF9ST09NX01FTlRJT04nLCAvLyAnQHJvb20nIG1lbnRpb25cbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gVGhlIFR5cGUgb2YgdGhpcyBQaWxsLiBJZiB1cmwgaXMgZ2l2ZW4sIHRoaXMgaXMgYXV0by1kZXRlY3RlZC5cbiAgICB0eXBlPzogUGlsbFR5cGU7XG4gICAgLy8gVGhlIFVSTCB0byBwaWxsaWZ5IChubyB2YWxpZGF0aW9uIGlzIGRvbmUpXG4gICAgdXJsPzogc3RyaW5nO1xuICAgIC8vIFdoZXRoZXIgdGhlIHBpbGwgaXMgaW4gYSBtZXNzYWdlXG4gICAgaW5NZXNzYWdlPzogYm9vbGVhbjtcbiAgICAvLyBUaGUgcm9vbSBpbiB3aGljaCB0aGlzIHBpbGwgaXMgYmVpbmcgcmVuZGVyZWRcbiAgICByb29tPzogUm9vbTtcbiAgICAvLyBXaGV0aGVyIHRvIGluY2x1ZGUgYW4gYXZhdGFyIGluIHRoZSBwaWxsXG4gICAgc2hvdWxkU2hvd1BpbGxBdmF0YXI/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICAvLyBJRC9hbGlhcyBvZiB0aGUgcm9vbS91c2VyXG4gICAgcmVzb3VyY2VJZDogc3RyaW5nO1xuICAgIC8vIFR5cGUgb2YgcGlsbFxuICAgIHBpbGxUeXBlOiBzdHJpbmc7XG4gICAgLy8gVGhlIG1lbWJlciByZWxhdGVkIHRvIHRoZSB1c2VyIHBpbGxcbiAgICBtZW1iZXI/OiBSb29tTWVtYmVyO1xuICAgIC8vIFRoZSByb29tIHJlbGF0ZWQgdG8gdGhlIHJvb20gcGlsbFxuICAgIHJvb20/OiBSb29tO1xuICAgIC8vIElzIHRoZSB1c2VyIGhvdmVyaW5nIHRoZSBwaWxsXG4gICAgaG92ZXI6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBpbGwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHVubW91bnRlZCA9IHRydWU7XG4gICAgcHJpdmF0ZSBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudDtcblxuICAgIHB1YmxpYyBzdGF0aWMgcm9vbU5vdGlmUG9zKHRleHQ6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0ZXh0LmluZGV4T2YoXCJAcm9vbVwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJvb21Ob3RpZkxlbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gXCJAcm9vbVwiLmxlbmd0aDtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcmVzb3VyY2VJZDogbnVsbCxcbiAgICAgICAgICAgIHBpbGxUeXBlOiBudWxsLFxuICAgICAgICAgICAgbWVtYmVyOiBudWxsLFxuICAgICAgICAgICAgcm9vbTogbnVsbCxcbiAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2UsIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuICAgIHB1YmxpYyBhc3luYyBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IElQcm9wcyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsZXQgcmVzb3VyY2VJZDtcbiAgICAgICAgbGV0IHByZWZpeDtcblxuICAgICAgICBpZiAobmV4dFByb3BzLnVybCkge1xuICAgICAgICAgICAgaWYgKG5leHRQcm9wcy5pbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IHBhcnNlUGVybWFsaW5rKG5leHRQcm9wcy51cmwpO1xuICAgICAgICAgICAgICAgIHJlc291cmNlSWQgPSBwYXJ0cy5wcmltYXJ5RW50aXR5SWQ7IC8vIFRoZSByb29tL3VzZXIgSURcbiAgICAgICAgICAgICAgICBwcmVmaXggPSBwYXJ0cy5zaWdpbDsgLy8gVGhlIGZpcnN0IGNoYXJhY3RlciBvZiBwcmVmaXhcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VJZCA9IGdldFByaW1hcnlQZXJtYWxpbmtFbnRpdHkobmV4dFByb3BzLnVybCk7XG4gICAgICAgICAgICAgICAgcHJlZml4ID0gcmVzb3VyY2VJZCA/IHJlc291cmNlSWRbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwaWxsVHlwZSA9IHRoaXMucHJvcHMudHlwZSB8fCB7XG4gICAgICAgICAgICAnQCc6IFBpbGxUeXBlLlVzZXJNZW50aW9uLFxuICAgICAgICAgICAgJyMnOiBQaWxsVHlwZS5Sb29tTWVudGlvbixcbiAgICAgICAgICAgICchJzogUGlsbFR5cGUuUm9vbU1lbnRpb24sXG4gICAgICAgIH1bcHJlZml4XTtcblxuICAgICAgICBsZXQgbWVtYmVyO1xuICAgICAgICBsZXQgcm9vbTtcbiAgICAgICAgc3dpdGNoIChwaWxsVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBQaWxsVHlwZS5BdFJvb21NZW50aW9uOiB7XG4gICAgICAgICAgICAgICAgcm9vbSA9IG5leHRQcm9wcy5yb29tO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQaWxsVHlwZS5Vc2VyTWVudGlvbjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsTWVtYmVyID0gbmV4dFByb3BzLnJvb20gPyBuZXh0UHJvcHMucm9vbS5nZXRNZW1iZXIocmVzb3VyY2VJZCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbWVtYmVyID0gbG9jYWxNZW1iZXI7XG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbE1lbWJlcikge1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXIgPSBuZXcgUm9vbU1lbWJlcihudWxsLCByZXNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb1Byb2ZpbGVMb29rdXAocmVzb3VyY2VJZCwgbWVtYmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBpbGxUeXBlLlJvb21NZW50aW9uOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxSb29tID0gcmVzb3VyY2VJZFswXSA9PT0gJyMnID9cbiAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb21zKCkuZmluZCgocikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHIuZ2V0Q2Fub25pY2FsQWxpYXMoKSA9PT0gcmVzb3VyY2VJZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIuZ2V0QWx0QWxpYXNlcygpLmluY2x1ZGVzKHJlc291cmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICB9KSA6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJlc291cmNlSWQpO1xuICAgICAgICAgICAgICAgIHJvb20gPSBsb2NhbFJvb207XG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbFJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogVGhpcyB3b3VsZCByZXF1aXJlIGEgbmV3IEFQSSB0byByZXNvbHZlIGEgcm9vbSBhbGlhcyB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBhIHJvb20gYXZhdGFyIGFuZCBuYW1lLlxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmRvUm9vbVByb2ZpbGVMb29rdXAocmVzb3VyY2VJZCwgbWVtYmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlc291cmNlSWQsIHBpbGxUeXBlLCBtZW1iZXIsIHJvb20gfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVubW91bnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuICAgICAgICB0aGlzLlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHRoaXMucHJvcHMpOyAvLyBIQUNLOiBXZSBzaG91bGRuJ3QgYmUgY2FsbGluZyBsaWZlY3ljbGUgZnVuY3Rpb25zIG91cnNlbHZlcy5cbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VPdmVyID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhvdmVyOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1vdXNlTGVhdmUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBkb1Byb2ZpbGVMb29rdXAodXNlcklkOiBzdHJpbmcsIG1lbWJlcik6IHZvaWQge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHJvZmlsZUluZm8odXNlcklkKS50aGVuKChyZXNwKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZW1iZXIubmFtZSA9IHJlc3AuZGlzcGxheW5hbWU7XG4gICAgICAgICAgICBtZW1iZXIucmF3RGlzcGxheU5hbWUgPSByZXNwLmRpc3BsYXluYW1lO1xuICAgICAgICAgICAgbWVtYmVyLmV2ZW50cy5tZW1iZXIgPSB7XG4gICAgICAgICAgICAgICAgZ2V0Q29udGVudDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBhdmF0YXJfdXJsOiByZXNwLmF2YXRhcl91cmwgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGdldERpcmVjdGlvbmFsQ29udGVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZW1iZXIgfSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ291bGQgbm90IHJldHJpZXZlIHByb2ZpbGUgZGF0YSBmb3IgJyArIHVzZXJJZCArICc6JywgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblVzZXJQaWxsQ2xpY2tlZCA9IChlKTogdm9pZCA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyLFxuICAgICAgICAgICAgbWVtYmVyOiB0aGlzLnN0YXRlLm1lbWJlcixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCByZXNvdXJjZSA9IHRoaXMuc3RhdGUucmVzb3VyY2VJZDtcblxuICAgICAgICBsZXQgYXZhdGFyID0gbnVsbDtcbiAgICAgICAgbGV0IGxpbmtUZXh0ID0gcmVzb3VyY2U7XG4gICAgICAgIGxldCBwaWxsQ2xhc3M7XG4gICAgICAgIGxldCB1c2VySWQ7XG4gICAgICAgIGxldCBocmVmID0gdGhpcy5wcm9wcy51cmw7XG4gICAgICAgIGxldCBvbkNsaWNrO1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUucGlsbFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUGlsbFR5cGUuQXRSb29tTWVudGlvbjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnByb3BzLnJvb207XG4gICAgICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgbGlua1RleHQgPSBcIkByb29tXCI7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNob3VsZFNob3dQaWxsQXZhdGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXIgPSA8Um9vbUF2YXRhciByb29tPXtyb29tfSB3aWR0aD17MTZ9IGhlaWdodD17MTZ9IGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBpbGxDbGFzcyA9ICdteF9BdFJvb21QaWxsJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBpbGxUeXBlLlVzZXJNZW50aW9uOiB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyB1c2VyIGlzIG5vdCBhIG1lbWJlciBvZiB0aGlzIHJvb20sIGRlZmF1bHQgdG8gdGhlIGVtcHR5IG1lbWJlclxuICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHRoaXMuc3RhdGUubWVtYmVyO1xuICAgICAgICAgICAgICAgIGlmIChtZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkID0gbWVtYmVyLnVzZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyLnJhd0Rpc3BsYXlOYW1lID0gbWVtYmVyLnJhd0Rpc3BsYXlOYW1lIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBsaW5rVGV4dCA9IG1lbWJlci5yYXdEaXNwbGF5TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2hvdWxkU2hvd1BpbGxBdmF0YXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhciA9IDxNZW1iZXJBdmF0YXIgbWVtYmVyPXttZW1iZXJ9IHdpZHRoPXsxNn0gaGVpZ2h0PXsxNn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgaGlkZVRpdGxlIC8+O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBpbGxDbGFzcyA9ICdteF9Vc2VyUGlsbCc7XG4gICAgICAgICAgICAgICAgICAgIGhyZWYgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrID0gdGhpcy5vblVzZXJQaWxsQ2xpY2tlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBpbGxUeXBlLlJvb21NZW50aW9uOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuc3RhdGUucm9vbTtcbiAgICAgICAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgICAgICBsaW5rVGV4dCA9IHJvb20ubmFtZSB8fCByZXNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2hvdWxkU2hvd1BpbGxBdmF0YXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhciA9IDxSb29tQXZhdGFyIHJvb209e3Jvb219IHdpZHRoPXsxNn0gaGVpZ2h0PXsxNn0gYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGlsbENsYXNzID0gcm9vbT8uaXNTcGFjZVJvb20oKSA/IFwibXhfU3BhY2VQaWxsXCIgOiBcIm14X1Jvb21QaWxsXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1BpbGxcIiwgcGlsbENsYXNzLCB7XG4gICAgICAgICAgICBcIm14X1VzZXJQaWxsX21lXCI6IHVzZXJJZCA9PT0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5waWxsVHlwZSkge1xuICAgICAgICAgICAgbGV0IHRpcDtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmhvdmVyICYmIHJlc291cmNlKSB7XG4gICAgICAgICAgICAgICAgdGlwID0gPFRvb2x0aXAgbGFiZWw9e3Jlc291cmNlfSBhbGlnbm1lbnQ9e0FsaWdubWVudC5SaWdodH0gLz47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiA8YmRpPjxNYXRyaXhDbGllbnRDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt0aGlzLm1hdHJpeENsaWVudH0+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmluTWVzc2FnZSA/XG4gICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBocmVmPXtocmVmfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLm9uTW91c2VPdmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLm9uTW91c2VMZWF2ZX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfUGlsbF9saW5rVGV4dFwiPnsgbGlua1RleHQgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGlwIH1cbiAgICAgICAgICAgICAgICAgICAgPC9hPiA6XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3Zlcj17dGhpcy5vbk1vdXNlT3Zlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbk1vdXNlTGVhdmV9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1BpbGxfbGlua1RleHRcIj57IGxpbmtUZXh0IH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRpcCB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gfVxuICAgICAgICAgICAgPC9NYXRyaXhDbGllbnRDb250ZXh0LlByb3ZpZGVyPjwvYmRpPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSByZW5kZXIgbm90aGluZyBpZiB0aGUgVVJMIGlzbid0IHJlY29nbmlzZWRcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7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