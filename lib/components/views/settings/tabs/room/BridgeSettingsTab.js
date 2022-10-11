"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _BridgeTile = _interopRequireDefault(require("../../BridgeTile"));

/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const BRIDGE_EVENT_TYPES = ["uk.half-shot.bridge" // m.bridge
];
const BRIDGES_LINK = "https://matrix.org/bridges/";

class BridgeSettingsTab extends _react.default.Component {
  renderBridgeCard(event, room) {
    const content = event.getContent();

    if (!content || !content.channel || !content.protocol) {
      return null;
    }

    return /*#__PURE__*/_react.default.createElement(_BridgeTile.default, {
      key: event.getId(),
      room: room,
      ev: event
    });
  }

  static getBridgeStateEvents(roomId) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const roomState = client.getRoom(roomId).currentState;
    return BRIDGE_EVENT_TYPES.map(typeName => roomState.getStateEvents(typeName)).flat(1);
  }

  render() {
    // This settings tab will only be invoked if the following function returns more
    // than 0 events, so no validation is needed at this stage.
    const bridgeEvents = BridgeSettingsTab.getBridgeStateEvents(this.props.roomId);

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(this.props.roomId);
    let content;

    if (bridgeEvents.length > 0) {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This room is bridging messages to the following platforms. " + "<a>Learn more.</a>", {}, {
        // TODO: We don't have this link yet: this will prevent the translators
        // having to re-translate the string when we do.
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: BRIDGES_LINK,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      })), /*#__PURE__*/_react.default.createElement("ul", {
        className: "mx_RoomSettingsDialog_BridgeList"
      }, bridgeEvents.map(event => this.renderBridgeCard(event, room))));
    } else {
      content = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This room isn't bridging messages to any platforms. " + "<a>Learn more.</a>", {}, {
        // TODO: We don't have this link yet: this will prevent the translators
        // having to re-translate the string when we do.
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: BRIDGES_LINK,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Bridges")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, content));
  }

}

exports.default = BridgeSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCUklER0VfRVZFTlRfVFlQRVMiLCJCUklER0VTX0xJTksiLCJCcmlkZ2VTZXR0aW5nc1RhYiIsIlJlYWN0IiwiQ29tcG9uZW50IiwicmVuZGVyQnJpZGdlQ2FyZCIsImV2ZW50Iiwicm9vbSIsImNvbnRlbnQiLCJnZXRDb250ZW50IiwiY2hhbm5lbCIsInByb3RvY29sIiwiZ2V0SWQiLCJnZXRCcmlkZ2VTdGF0ZUV2ZW50cyIsInJvb21JZCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInJvb21TdGF0ZSIsImdldFJvb20iLCJjdXJyZW50U3RhdGUiLCJtYXAiLCJ0eXBlTmFtZSIsImdldFN0YXRlRXZlbnRzIiwiZmxhdCIsInJlbmRlciIsImJyaWRnZUV2ZW50cyIsInByb3BzIiwibGVuZ3RoIiwiX3QiLCJhIiwic3ViIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvdGFicy9yb29tL0JyaWRnZVNldHRpbmdzVGFiLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgQnJpZGdlVGlsZSBmcm9tIFwiLi4vLi4vQnJpZGdlVGlsZVwiO1xuXG5jb25zdCBCUklER0VfRVZFTlRfVFlQRVMgPSBbXG4gICAgXCJ1ay5oYWxmLXNob3QuYnJpZGdlXCIsXG4gICAgLy8gbS5icmlkZ2Vcbl07XG5cbmNvbnN0IEJSSURHRVNfTElOSyA9IFwiaHR0cHM6Ly9tYXRyaXgub3JnL2JyaWRnZXMvXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmlkZ2VTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIHJlbmRlckJyaWRnZUNhcmQoZXZlbnQ6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBldmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIGlmICghY29udGVudCB8fCAhY29udGVudC5jaGFubmVsIHx8ICFjb250ZW50LnByb3RvY29sKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gPEJyaWRnZVRpbGUga2V5PXtldmVudC5nZXRJZCgpfSByb29tPXtyb29tfSBldj17ZXZlbnR9IC8+O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRCcmlkZ2VTdGF0ZUV2ZW50cyhyb29tSWQ6IHN0cmluZyk6IE1hdHJpeEV2ZW50W10ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb21TdGF0ZSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCkuY3VycmVudFN0YXRlO1xuXG4gICAgICAgIHJldHVybiBCUklER0VfRVZFTlRfVFlQRVMubWFwKHR5cGVOYW1lID0+IHJvb21TdGF0ZS5nZXRTdGF0ZUV2ZW50cyh0eXBlTmFtZSkpLmZsYXQoMSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBUaGlzIHNldHRpbmdzIHRhYiB3aWxsIG9ubHkgYmUgaW52b2tlZCBpZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uIHJldHVybnMgbW9yZVxuICAgICAgICAvLyB0aGFuIDAgZXZlbnRzLCBzbyBubyB2YWxpZGF0aW9uIGlzIG5lZWRlZCBhdCB0aGlzIHN0YWdlLlxuICAgICAgICBjb25zdCBicmlkZ2VFdmVudHMgPSBCcmlkZ2VTZXR0aW5nc1RhYi5nZXRCcmlkZ2VTdGF0ZUV2ZW50cyh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcblxuICAgICAgICBsZXQgY29udGVudDogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChicmlkZ2VFdmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHJvb20gaXMgYnJpZGdpbmcgbWVzc2FnZXMgdG8gdGhlIGZvbGxvd2luZyBwbGF0Zm9ybXMuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8YT5MZWFybiBtb3JlLjwvYT5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFdlIGRvbid0IGhhdmUgdGhpcyBsaW5rIHlldDogdGhpcyB3aWxsIHByZXZlbnQgdGhlIHRyYW5zbGF0b3JzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBoYXZpbmcgdG8gcmUtdHJhbnNsYXRlIHRoZSBzdHJpbmcgd2hlbiB3ZSBkby5cbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8YSBocmVmPXtCUklER0VTX0xJTkt9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57IHN1YiB9PC9hPixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cIm14X1Jvb21TZXR0aW5nc0RpYWxvZ19CcmlkZ2VMaXN0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgYnJpZGdlRXZlbnRzLm1hcCgoZXZlbnQpID0+IHRoaXMucmVuZGVyQnJpZGdlQ2FyZChldmVudCwgcm9vbSkpIH1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgXCJUaGlzIHJvb20gaXNuJ3QgYnJpZGdpbmcgbWVzc2FnZXMgdG8gYW55IHBsYXRmb3Jtcy4gXCIgK1xuICAgICAgICAgICAgICAgIFwiPGE+TGVhcm4gbW9yZS48L2E+XCIsIHt9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogV2UgZG9uJ3QgaGF2ZSB0aGlzIGxpbmsgeWV0OiB0aGlzIHdpbGwgcHJldmVudCB0aGUgdHJhbnNsYXRvcnNcbiAgICAgICAgICAgICAgICAgICAgLy8gaGF2aW5nIHRvIHJlLXRyYW5zbGF0ZSB0aGUgc3RyaW5nIHdoZW4gd2UgZG8uXG4gICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8YSBocmVmPXtCUklER0VTX0xJTkt9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57IHN1YiB9PC9hPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKSB9PC9wPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+eyBfdChcIkJyaWRnZXNcIikgfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUlBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQSxNQUFNQSxrQkFBa0IsR0FBRyxDQUN2QixxQkFEdUIsQ0FFdkI7QUFGdUIs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