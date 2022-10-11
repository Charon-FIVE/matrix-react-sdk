"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _DisambiguatedProfile = _interopRequireDefault(require("./DisambiguatedProfile"));

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
 Copyright 2015, 2016 OpenMarket Ltd

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
class SenderProfile extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "context", void 0);
  }

  render() {
    const {
      mxEvent,
      onClick
    } = this.props;
    const msgtype = mxEvent.getContent().msgtype;
    let member = mxEvent.sender;

    if (_SettingsStore.default.getValue("useOnlyCurrentProfiles")) {
      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(mxEvent.getRoomId());

      if (room) {
        member = room.getMember(mxEvent.getSender());
      }
    }

    return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Consumer, null, roomContext => {
      if (msgtype === _event.MsgType.Emote && roomContext.timelineRenderingType !== _RoomContext.TimelineRenderingType.ThreadsList) {
        return null; // emote message must include the name so don't duplicate it
      }

      return /*#__PURE__*/_react.default.createElement(_DisambiguatedProfile.default, {
        fallbackName: mxEvent.getSender() || "",
        onClick: onClick,
        member: member,
        colored: true,
        emphasizeDisplayName: true
      });
    });
  }

}

exports.default = SenderProfile;
(0, _defineProperty2.default)(SenderProfile, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZW5kZXJQcm9maWxlIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwicmVuZGVyIiwibXhFdmVudCIsIm9uQ2xpY2siLCJwcm9wcyIsIm1zZ3R5cGUiLCJnZXRDb250ZW50IiwibWVtYmVyIiwic2VuZGVyIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwicm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFJvb20iLCJnZXRSb29tSWQiLCJnZXRNZW1iZXIiLCJnZXRTZW5kZXIiLCJyb29tQ29udGV4dCIsIk1zZ1R5cGUiLCJFbW90ZSIsInRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlRocmVhZHNMaXN0IiwiTWF0cml4Q2xpZW50Q29udGV4dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1NlbmRlclByb2ZpbGUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBNc2dUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuXG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IERpc2FtYmlndWF0ZWRQcm9maWxlIGZyb20gXCIuL0Rpc2FtYmlndWF0ZWRQcm9maWxlXCI7XG5pbXBvcnQgUm9vbUNvbnRleHQsIHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSAnLi4vLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHQnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgb25DbGljaz8oKTogdm9pZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VuZGVyUHJvZmlsZSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHVibGljIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG4gICAgcHVibGljIGNvbnRleHQhOiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgTWF0cml4Q2xpZW50Q29udGV4dD47XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgbXhFdmVudCwgb25DbGljayB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgbXNndHlwZSA9IG14RXZlbnQuZ2V0Q29udGVudCgpLm1zZ3R5cGU7XG5cbiAgICAgICAgbGV0IG1lbWJlciA9IG14RXZlbnQuc2VuZGVyO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInVzZU9ubHlDdXJyZW50UHJvZmlsZXNcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShteEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgbWVtYmVyID0gcm9vbS5nZXRNZW1iZXIobXhFdmVudC5nZXRTZW5kZXIoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPFJvb21Db250ZXh0LkNvbnN1bWVyPlxuICAgICAgICAgICAgeyByb29tQ29udGV4dCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG1zZ3R5cGUgPT09IE1zZ1R5cGUuRW1vdGUgJiZcbiAgICAgICAgICAgICAgICAgICAgcm9vbUNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkc0xpc3RcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIGVtb3RlIG1lc3NhZ2UgbXVzdCBpbmNsdWRlIHRoZSBuYW1lIHNvIGRvbid0IGR1cGxpY2F0ZSBpdFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxEaXNhbWJpZ3VhdGVkUHJvZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGJhY2tOYW1lPXtteEV2ZW50LmdldFNlbmRlcigpIHx8IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyPXttZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcmVkPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgZW1waGFzaXplRGlzcGxheU5hbWU9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gfVxuICAgICAgICA8L1Jvb21Db250ZXh0LkNvbnN1bWVyPjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUJlLE1BQU1BLGFBQU4sU0FBNEJDLGNBQUEsQ0FBTUMsYUFBbEMsQ0FBd0Q7RUFBQTtJQUFBO0lBQUE7RUFBQTs7RUFJbkVDLE1BQU0sR0FBRztJQUNMLE1BQU07TUFBRUMsT0FBRjtNQUFXQztJQUFYLElBQXVCLEtBQUtDLEtBQWxDO0lBQ0EsTUFBTUMsT0FBTyxHQUFHSCxPQUFPLENBQUNJLFVBQVIsR0FBcUJELE9BQXJDO0lBRUEsSUFBSUUsTUFBTSxHQUFHTCxPQUFPLENBQUNNLE1BQXJCOztJQUNBLElBQUlDLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIsd0JBQXZCLENBQUosRUFBc0Q7TUFDbEQsTUFBTUMsSUFBSSxHQUFHQyxnQ0FBQSxDQUFnQkMsR0FBaEIsR0FBc0JDLE9BQXRCLENBQThCWixPQUFPLENBQUNhLFNBQVIsRUFBOUIsQ0FBYjs7TUFDQSxJQUFJSixJQUFKLEVBQVU7UUFDTkosTUFBTSxHQUFHSSxJQUFJLENBQUNLLFNBQUwsQ0FBZWQsT0FBTyxDQUFDZSxTQUFSLEVBQWYsQ0FBVDtNQUNIO0lBQ0o7O0lBRUQsb0JBQU8sNkJBQUMsb0JBQUQsQ0FBYSxRQUFiLFFBQ0RDLFdBQVcsSUFBSTtNQUNiLElBQUliLE9BQU8sS0FBS2MsY0FBQSxDQUFRQyxLQUFwQixJQUNBRixXQUFXLENBQUNHLHFCQUFaLEtBQXNDQyxrQ0FBQSxDQUFzQkMsV0FEaEUsRUFFRTtRQUNFLE9BQU8sSUFBUCxDQURGLENBQ2U7TUFDaEI7O01BRUQsb0JBQ0ksNkJBQUMsNkJBQUQ7UUFDSSxZQUFZLEVBQUVyQixPQUFPLENBQUNlLFNBQVIsTUFBdUIsRUFEekM7UUFFSSxPQUFPLEVBQUVkLE9BRmI7UUFHSSxNQUFNLEVBQUVJLE1BSFo7UUFJSSxPQUFPLEVBQUUsSUFKYjtRQUtJLG9CQUFvQixFQUFFO01BTDFCLEVBREo7SUFTSCxDQWpCRSxDQUFQO0VBbUJIOztBQW5Da0U7Ozs4QkFBbERULGEsaUJBQ1cwQiw0QiJ9