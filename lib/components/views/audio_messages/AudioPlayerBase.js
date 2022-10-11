"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _AsyncStore = require("../../../stores/AsyncStore");

var _languageHandler = require("../../../languageHandler");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 - 2022 The Matrix.org Foundation C.I.C.

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
class AudioPlayerBase extends _react.default.PureComponent {
  constructor(props) {
    super(props); // Playback instances can be reused in the composer

    (0, _defineProperty2.default)(this, "seekRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "playPauseRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      let handled = true;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.Space:
          this.playPauseRef.current?.toggleState();
          break;

        case _KeyboardShortcuts.KeyBindingAction.ArrowLeft:
          this.seekRef.current?.left();
          break;

        case _KeyboardShortcuts.KeyBindingAction.ArrowRight:
          this.seekRef.current?.right();
          break;

        default:
          handled = false;
          break;
      } // stopPropagation() prevents the FocusComposer catch-all from triggering,
      // but we need to do it on key down instead of press (even though the user
      // interaction is typically on press).


      if (handled) {
        ev.stopPropagation();
      }
    });
    (0, _defineProperty2.default)(this, "onPlaybackUpdate", ev => {
      this.setState({
        playbackPhase: ev
      });
    });
    this.state = {
      playbackPhase: this.props.playback.currentState
    }; // We don't need to de-register: the class handles this for us internally

    this.props.playback.on(_AsyncStore.UPDATE_EVENT, this.onPlaybackUpdate); // Don't wait for the promise to complete - it will emit a progress update when it
    // is done, and it's not meant to take long anyhow.

    this.props.playback.prepare().catch(e => {
      _logger.logger.error("Error processing audio file:", e);

      this.setState({
        error: true
      });
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, this.renderComponent(), this.state.error && /*#__PURE__*/_react.default.createElement("div", {
      className: "text-warning"
    }, (0, _languageHandler._t)("Error downloading audio")));
  }

}

exports.default = AudioPlayerBase;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdWRpb1BsYXllckJhc2UiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiZXYiLCJoYW5kbGVkIiwiYWN0aW9uIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJTcGFjZSIsInBsYXlQYXVzZVJlZiIsImN1cnJlbnQiLCJ0b2dnbGVTdGF0ZSIsIkFycm93TGVmdCIsInNlZWtSZWYiLCJsZWZ0IiwiQXJyb3dSaWdodCIsInJpZ2h0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2V0U3RhdGUiLCJwbGF5YmFja1BoYXNlIiwic3RhdGUiLCJwbGF5YmFjayIsImN1cnJlbnRTdGF0ZSIsIm9uIiwiVVBEQVRFX0VWRU5UIiwib25QbGF5YmFja1VwZGF0ZSIsInByZXBhcmUiLCJjYXRjaCIsImUiLCJsb2dnZXIiLCJlcnJvciIsInJlbmRlciIsInJlbmRlckNvbXBvbmVudCIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvYXVkaW9fbWVzc2FnZXMvQXVkaW9QbGF5ZXJCYXNlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiwgUmVhY3ROb2RlLCBSZWZPYmplY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgUGxheWJhY2ssIFBsYXliYWNrU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vYXVkaW8vUGxheWJhY2tcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCBTZWVrQmFyIGZyb20gXCIuL1NlZWtCYXJcIjtcbmltcG9ydCBQbGF5UGF1c2VCdXR0b24gZnJvbSBcIi4vUGxheVBhdXNlQnV0dG9uXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyBQbGF5YmFjayBpbnN0YW5jZSB0byByZW5kZXIuIENhbm5vdCBjaGFuZ2UgZHVyaW5nIGNvbXBvbmVudCBsaWZlY3ljbGU6IGNyZWF0ZVxuICAgIC8vIGFuIGFsbC1uZXcgY29tcG9uZW50IGluc3RlYWQuXG4gICAgcGxheWJhY2s6IFBsYXliYWNrO1xuXG4gICAgbWVkaWFOYW1lPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBwbGF5YmFja1BoYXNlOiBQbGF5YmFja1N0YXRlO1xuICAgIGVycm9yPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgQXVkaW9QbGF5ZXJCYXNlPFQgZXh0ZW5kcyBJUHJvcHMgPSBJUHJvcHM+IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxULCBJU3RhdGU+IHtcbiAgICBwcm90ZWN0ZWQgc2Vla1JlZjogUmVmT2JqZWN0PFNlZWtCYXI+ID0gY3JlYXRlUmVmKCk7XG4gICAgcHJvdGVjdGVkIHBsYXlQYXVzZVJlZjogUmVmT2JqZWN0PFBsYXlQYXVzZUJ1dHRvbj4gPSBjcmVhdGVSZWYoKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBUKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICAvLyBQbGF5YmFjayBpbnN0YW5jZXMgY2FuIGJlIHJldXNlZCBpbiB0aGUgY29tcG9zZXJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBsYXliYWNrUGhhc2U6IHRoaXMucHJvcHMucGxheWJhY2suY3VycmVudFN0YXRlLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZGUtcmVnaXN0ZXI6IHRoZSBjbGFzcyBoYW5kbGVzIHRoaXMgZm9yIHVzIGludGVybmFsbHlcbiAgICAgICAgdGhpcy5wcm9wcy5wbGF5YmFjay5vbihVUERBVEVfRVZFTlQsIHRoaXMub25QbGF5YmFja1VwZGF0ZSk7XG5cbiAgICAgICAgLy8gRG9uJ3Qgd2FpdCBmb3IgdGhlIHByb21pc2UgdG8gY29tcGxldGUgLSBpdCB3aWxsIGVtaXQgYSBwcm9ncmVzcyB1cGRhdGUgd2hlbiBpdFxuICAgICAgICAvLyBpcyBkb25lLCBhbmQgaXQncyBub3QgbWVhbnQgdG8gdGFrZSBsb25nIGFueWhvdy5cbiAgICAgICAgdGhpcy5wcm9wcy5wbGF5YmFjay5wcmVwYXJlKCkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciBwcm9jZXNzaW5nIGF1ZGlvIGZpbGU6XCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiB0cnVlIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgb25LZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGxldCBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihldik7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5TcGFjZTpcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlQYXVzZVJlZi5jdXJyZW50Py50b2dnbGVTdGF0ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkFycm93TGVmdDpcbiAgICAgICAgICAgICAgICB0aGlzLnNlZWtSZWYuY3VycmVudD8ubGVmdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkFycm93UmlnaHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5zZWVrUmVmLmN1cnJlbnQ/LnJpZ2h0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3BQcm9wYWdhdGlvbigpIHByZXZlbnRzIHRoZSBGb2N1c0NvbXBvc2VyIGNhdGNoLWFsbCBmcm9tIHRyaWdnZXJpbmcsXG4gICAgICAgIC8vIGJ1dCB3ZSBuZWVkIHRvIGRvIGl0IG9uIGtleSBkb3duIGluc3RlYWQgb2YgcHJlc3MgKGV2ZW4gdGhvdWdoIHRoZSB1c2VyXG4gICAgICAgIC8vIGludGVyYWN0aW9uIGlzIHR5cGljYWxseSBvbiBwcmVzcykuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGxheWJhY2tVcGRhdGUgPSAoZXY6IFBsYXliYWNrU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXliYWNrUGhhc2U6IGV2IH0pO1xuICAgIH07XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVuZGVyQ29tcG9uZW50KCk6IFJlYWN0Tm9kZTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogUmVhY3ROb2RlIHtcbiAgICAgICAgcmV0dXJuIDw+XG4gICAgICAgICAgICB7IHRoaXMucmVuZGVyQ29tcG9uZW50KCkgfVxuICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVycm9yICYmIDxkaXYgY2xhc3NOYW1lPVwidGV4dC13YXJuaW5nXCI+eyBfdChcIkVycm9yIGRvd25sb2FkaW5nIGF1ZGlvXCIpIH08L2Rpdj4gfVxuICAgICAgICA8Lz47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTBCZSxNQUFlQSxlQUFmLFNBQWtFQyxjQUFBLENBQU1DLGFBQXhFLENBQWlHO0VBSTVHQyxXQUFXLENBQUNDLEtBQUQsRUFBVztJQUNsQixNQUFNQSxLQUFOLEVBRGtCLENBR2xCOztJQUhrQiw0REFIa0IsSUFBQUMsZ0JBQUEsR0FHbEI7SUFBQSxpRUFGK0IsSUFBQUEsZ0JBQUEsR0FFL0I7SUFBQSxpREFtQkNDLEVBQUQsSUFBNkI7TUFDL0MsSUFBSUMsT0FBTyxHQUFHLElBQWQ7TUFDQSxNQUFNQyxNQUFNLEdBQUcsSUFBQUMseUNBQUEsSUFBd0JDLHNCQUF4QixDQUErQ0osRUFBL0MsQ0FBZjs7TUFFQSxRQUFRRSxNQUFSO1FBQ0ksS0FBS0csbUNBQUEsQ0FBaUJDLEtBQXRCO1VBQ0ksS0FBS0MsWUFBTCxDQUFrQkMsT0FBbEIsRUFBMkJDLFdBQTNCO1VBQ0E7O1FBQ0osS0FBS0osbUNBQUEsQ0FBaUJLLFNBQXRCO1VBQ0ksS0FBS0MsT0FBTCxDQUFhSCxPQUFiLEVBQXNCSSxJQUF0QjtVQUNBOztRQUNKLEtBQUtQLG1DQUFBLENBQWlCUSxVQUF0QjtVQUNJLEtBQUtGLE9BQUwsQ0FBYUgsT0FBYixFQUFzQk0sS0FBdEI7VUFDQTs7UUFDSjtVQUNJYixPQUFPLEdBQUcsS0FBVjtVQUNBO01BWlIsQ0FKK0MsQ0FtQi9DO01BQ0E7TUFDQTs7O01BQ0EsSUFBSUEsT0FBSixFQUFhO1FBQ1RELEVBQUUsQ0FBQ2UsZUFBSDtNQUNIO0lBQ0osQ0E1Q3FCO0lBQUEsd0RBOENNZixFQUFELElBQXVCO01BQzlDLEtBQUtnQixRQUFMLENBQWM7UUFBRUMsYUFBYSxFQUFFakI7TUFBakIsQ0FBZDtJQUNILENBaERxQjtJQUlsQixLQUFLa0IsS0FBTCxHQUFhO01BQ1RELGFBQWEsRUFBRSxLQUFLbkIsS0FBTCxDQUFXcUIsUUFBWCxDQUFvQkM7SUFEMUIsQ0FBYixDQUprQixDQVFsQjs7SUFDQSxLQUFLdEIsS0FBTCxDQUFXcUIsUUFBWCxDQUFvQkUsRUFBcEIsQ0FBdUJDLHdCQUF2QixFQUFxQyxLQUFLQyxnQkFBMUMsRUFUa0IsQ0FXbEI7SUFDQTs7SUFDQSxLQUFLekIsS0FBTCxDQUFXcUIsUUFBWCxDQUFvQkssT0FBcEIsR0FBOEJDLEtBQTlCLENBQW9DQyxDQUFDLElBQUk7TUFDckNDLGNBQUEsQ0FBT0MsS0FBUCxDQUFhLDhCQUFiLEVBQTZDRixDQUE3Qzs7TUFDQSxLQUFLVixRQUFMLENBQWM7UUFBRVksS0FBSyxFQUFFO01BQVQsQ0FBZDtJQUNILENBSEQ7RUFJSDs7RUFtQ01DLE1BQU0sR0FBYztJQUN2QixvQkFBTyw0REFDRCxLQUFLQyxlQUFMLEVBREMsRUFFRCxLQUFLWixLQUFMLENBQVdVLEtBQVgsaUJBQW9CO01BQUssU0FBUyxFQUFDO0lBQWYsR0FBZ0MsSUFBQUcsbUJBQUEsRUFBRyx5QkFBSCxDQUFoQyxDQUZuQixDQUFQO0VBSUg7O0FBN0QyRyJ9