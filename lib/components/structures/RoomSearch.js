"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var React = _interopRequireWildcard(require("react"));

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _Keyboard = require("../../Keyboard");

var _languageHandler = require("../../languageHandler");

var _Modal = _interopRequireDefault(require("../../Modal"));

var _SpotlightDialog = _interopRequireDefault(require("../views/dialogs/spotlight/SpotlightDialog"));

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

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
class RoomSearch extends React.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === 'focus_room_filter') {
        this.openSpotlight();
      }
    });
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  openSpotlight() {
    _Modal.default.createDialog(_SpotlightDialog.default, {}, "mx_SpotlightDialog_wrapper", false, true);
  }

  render() {
    const classes = (0, _classnames.default)({
      'mx_RoomSearch': true,
      'mx_RoomSearch_minimized': this.props.isMinimized
    }, 'mx_RoomSearch_spotlightTrigger');
    const icon = /*#__PURE__*/React.createElement("div", {
      className: "mx_RoomSearch_icon"
    });
    const shortcutPrompt = /*#__PURE__*/React.createElement("kbd", {
      className: "mx_RoomSearch_shortcutPrompt"
    }, _Keyboard.IS_MAC ? "⌘ K" : (0, _languageHandler._t)(_KeyboardShortcuts.ALTERNATE_KEY_NAME[_Keyboard.Key.CONTROL]) + " K");
    return /*#__PURE__*/React.createElement(_AccessibleButton.default, {
      onClick: this.openSpotlight,
      className: classes
    }, icon, !this.props.isMinimized && /*#__PURE__*/React.createElement("div", {
      className: "mx_RoomSearch_spotlightTriggerText"
    }, (0, _languageHandler._t)("Search")), shortcutPrompt);
  }

}

exports.default = RoomSearch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tU2VhcmNoIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInBheWxvYWQiLCJhY3Rpb24iLCJvcGVuU3BvdGxpZ2h0IiwiZGlzcGF0Y2hlclJlZiIsImRlZmF1bHREaXNwYXRjaGVyIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiU3BvdGxpZ2h0RGlhbG9nIiwicmVuZGVyIiwiY2xhc3NlcyIsImNsYXNzTmFtZXMiLCJpc01pbmltaXplZCIsImljb24iLCJzaG9ydGN1dFByb21wdCIsIklTX01BQyIsIl90IiwiQUxURVJOQVRFX0tFWV9OQU1FIiwiS2V5IiwiQ09OVFJPTCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUm9vbVNlYXJjaC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBBTFRFUk5BVEVfS0VZX05BTUUgfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgSVNfTUFDLCBLZXkgfSBmcm9tIFwiLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFNwb3RsaWdodERpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9zcG90bGlnaHQvU3BvdGxpZ2h0RGlhbG9nXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbVNlYXJjaCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkZWZhdWx0RGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9wZW5TcG90bGlnaHQoKSB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhTcG90bGlnaHREaWFsb2csIHt9LCBcIm14X1Nwb3RsaWdodERpYWxvZ193cmFwcGVyXCIsIGZhbHNlLCB0cnVlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnZm9jdXNfcm9vbV9maWx0ZXInKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5TcG90bGlnaHQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoJzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX21pbmltaXplZCc6IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQsXG4gICAgICAgIH0sICdteF9Sb29tU2VhcmNoX3Nwb3RsaWdodFRyaWdnZXInKTtcblxuICAgICAgICBjb25zdCBpY29uID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tU2VhcmNoX2ljb25cIiAvPlxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHNob3J0Y3V0UHJvbXB0ID0gPGtiZCBjbGFzc05hbWU9XCJteF9Sb29tU2VhcmNoX3Nob3J0Y3V0UHJvbXB0XCI+XG4gICAgICAgICAgICB7IElTX01BQyA/IFwi4oyYIEtcIiA6IF90KEFMVEVSTkFURV9LRVlfTkFNRVtLZXkuQ09OVFJPTF0pICsgXCIgS1wiIH1cbiAgICAgICAgPC9rYmQ+O1xuXG4gICAgICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9wZW5TcG90bGlnaHR9IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICB7IGljb24gfVxuICAgICAgICAgICAgeyAoIXRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVNlYXJjaF9zcG90bGlnaHRUcmlnZ2VyVGV4dFwiPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJTZWFyY2hcIikgfVxuICAgICAgICAgICAgPC9kaXY+IH1cbiAgICAgICAgICAgIHsgc2hvcnRjdXRQcm9tcHQgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFrQmUsTUFBTUEsVUFBTixTQUF5QkMsS0FBSyxDQUFDQyxhQUEvQixDQUFxRDtFQUdoRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUI7SUFBQSxnREFjUEMsT0FBRCxJQUE0QjtNQUMzQyxJQUFJQSxPQUFPLENBQUNDLE1BQVIsS0FBbUIsbUJBQXZCLEVBQTRDO1FBQ3hDLEtBQUtDLGFBQUw7TUFDSDtJQUNKLENBbEIwQjtJQUd2QixLQUFLQyxhQUFMLEdBQXFCQyxtQkFBQSxDQUFrQkMsUUFBbEIsQ0FBMkIsS0FBS0MsUUFBaEMsQ0FBckI7RUFDSDs7RUFFTUMsb0JBQW9CLEdBQUc7SUFDMUJILG1CQUFBLENBQWtCSSxVQUFsQixDQUE2QixLQUFLTCxhQUFsQztFQUNIOztFQUVPRCxhQUFhLEdBQUc7SUFDcEJPLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsd0JBQW5CLEVBQW9DLEVBQXBDLEVBQXdDLDRCQUF4QyxFQUFzRSxLQUF0RSxFQUE2RSxJQUE3RTtFQUNIOztFQVFNQyxNQUFNLEdBQW9CO0lBQzdCLE1BQU1DLE9BQU8sR0FBRyxJQUFBQyxtQkFBQSxFQUFXO01BQ3ZCLGlCQUFpQixJQURNO01BRXZCLDJCQUEyQixLQUFLZixLQUFMLENBQVdnQjtJQUZmLENBQVgsRUFHYixnQ0FIYSxDQUFoQjtJQUtBLE1BQU1DLElBQUksZ0JBQ047TUFBSyxTQUFTLEVBQUM7SUFBZixFQURKO0lBSUEsTUFBTUMsY0FBYyxnQkFBRztNQUFLLFNBQVMsRUFBQztJQUFmLEdBQ2pCQyxnQkFBQSxHQUFTLEtBQVQsR0FBaUIsSUFBQUMsbUJBQUEsRUFBR0MscUNBQUEsQ0FBbUJDLGFBQUEsQ0FBSUMsT0FBdkIsQ0FBSCxJQUFzQyxJQUR0QyxDQUF2QjtJQUlBLG9CQUFPLG9CQUFDLHlCQUFEO01BQWtCLE9BQU8sRUFBRSxLQUFLcEIsYUFBaEM7TUFBK0MsU0FBUyxFQUFFVztJQUExRCxHQUNERyxJQURDLEVBRUEsQ0FBQyxLQUFLakIsS0FBTCxDQUFXZ0IsV0FBYixpQkFBNkI7TUFBSyxTQUFTLEVBQUM7SUFBZixHQUN6QixJQUFBSSxtQkFBQSxFQUFHLFFBQUgsQ0FEeUIsQ0FGNUIsRUFLREYsY0FMQyxDQUFQO0VBT0g7O0FBNUMrRCJ9