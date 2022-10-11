"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _call = require("matrix-js-sdk/src/webrtc/call");

var _react = _interopRequireDefault(require("react"));

var _reResizable = require("re-resizable");

var _LegacyCallHandler = _interopRequireWildcard(require("../../../LegacyCallHandler"));

var _LegacyCallView = _interopRequireDefault(require("./LegacyCallView"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 - 2022 The Matrix.org Foundation C.I.C.

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
 * Wrapper for LegacyCallView that always display the call in a given room,
 * or nothing if there is no call in that room.
 */
class LegacyCallViewForRoom extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "updateCall", () => {
      const newCall = this.getCall();

      if (newCall !== this.state.call) {
        this.setState({
          call: newCall
        });
      }
    });
    (0, _defineProperty2.default)(this, "onResizeStart", () => {
      this.props.resizeNotifier.startResizing();
    });
    (0, _defineProperty2.default)(this, "onResize", () => {
      this.props.resizeNotifier.notifyTimelineHeightChanged();
    });
    (0, _defineProperty2.default)(this, "onResizeStop", () => {
      this.props.resizeNotifier.stopResizing();
    });
    this.state = {
      call: this.getCall()
    };
  }

  componentDidMount() {
    _LegacyCallHandler.default.instance.addListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.updateCall);

    _LegacyCallHandler.default.instance.addListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallChangeRoom, this.updateCall);
  }

  componentWillUnmount() {
    _LegacyCallHandler.default.instance.removeListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.updateCall);

    _LegacyCallHandler.default.instance.removeListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallChangeRoom, this.updateCall);
  }

  getCall() {
    const call = _LegacyCallHandler.default.instance.getCallForRoom(this.props.roomId);

    if (call && [_call.CallState.Ended, _call.CallState.Ringing].includes(call.state)) return null;
    return call;
  }

  render() {
    if (!this.state.call) return null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallViewForRoom"
    }, /*#__PURE__*/_react.default.createElement(_reResizable.Resizable, {
      minHeight: 380,
      maxHeight: "80vh",
      enable: {
        top: false,
        right: false,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      },
      onResizeStart: this.onResizeStart,
      onResize: this.onResize,
      onResizeStop: this.onResizeStop,
      className: "mx_LegacyCallViewForRoom_ResizeWrapper",
      handleClasses: {
        bottom: "mx_LegacyCallViewForRoom_ResizeHandle"
      }
    }, /*#__PURE__*/_react.default.createElement(_LegacyCallView.default, {
      call: this.state.call,
      pipMode: false,
      showApps: this.props.showApps
    })));
  }

}

exports.default = LegacyCallViewForRoom;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMZWdhY3lDYWxsVmlld0ZvclJvb20iLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJuZXdDYWxsIiwiZ2V0Q2FsbCIsInN0YXRlIiwiY2FsbCIsInNldFN0YXRlIiwicmVzaXplTm90aWZpZXIiLCJzdGFydFJlc2l6aW5nIiwibm90aWZ5VGltZWxpbmVIZWlnaHRDaGFuZ2VkIiwic3RvcFJlc2l6aW5nIiwiY29tcG9uZW50RGlkTW91bnQiLCJMZWdhY3lDYWxsSGFuZGxlciIsImluc3RhbmNlIiwiYWRkTGlzdGVuZXIiLCJMZWdhY3lDYWxsSGFuZGxlckV2ZW50IiwiQ2FsbFN0YXRlIiwidXBkYXRlQ2FsbCIsIkNhbGxDaGFuZ2VSb29tIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsImdldENhbGxGb3JSb29tIiwicm9vbUlkIiwiRW5kZWQiLCJSaW5naW5nIiwiaW5jbHVkZXMiLCJyZW5kZXIiLCJ0b3AiLCJyaWdodCIsImJvdHRvbSIsImxlZnQiLCJ0b3BSaWdodCIsImJvdHRvbVJpZ2h0IiwiYm90dG9tTGVmdCIsInRvcExlZnQiLCJvblJlc2l6ZVN0YXJ0Iiwib25SZXNpemUiLCJvblJlc2l6ZVN0b3AiLCJzaG93QXBwcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvTGVnYWN5Q2FsbFZpZXdGb3JSb29tLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgQ2FsbFN0YXRlLCBNYXRyaXhDYWxsIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGwnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFJlc2l6YWJsZSB9IGZyb20gXCJyZS1yZXNpemFibGVcIjtcblxuaW1wb3J0IExlZ2FjeUNhbGxIYW5kbGVyLCB7IExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQgfSBmcm9tICcuLi8uLi8uLi9MZWdhY3lDYWxsSGFuZGxlcic7XG5pbXBvcnQgTGVnYWN5Q2FsbFZpZXcgZnJvbSAnLi9MZWdhY3lDYWxsVmlldyc7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIFdoYXQgcm9vbSB3ZSBzaG91bGQgZGlzcGxheSB0aGUgY2FsbCBmb3JcbiAgICByb29tSWQ6IHN0cmluZztcblxuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcblxuICAgIHNob3dBcHBzPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgY2FsbDogTWF0cml4Q2FsbCB8IG51bGw7XG59XG5cbi8qXG4gKiBXcmFwcGVyIGZvciBMZWdhY3lDYWxsVmlldyB0aGF0IGFsd2F5cyBkaXNwbGF5IHRoZSBjYWxsIGluIGEgZ2l2ZW4gcm9vbSxcbiAqIG9yIG5vdGhpbmcgaWYgdGhlcmUgaXMgbm8gY2FsbCBpbiB0aGF0IHJvb20uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExlZ2FjeUNhbGxWaWV3Rm9yUm9vbSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgY2FsbDogdGhpcy5nZXRDYWxsKCksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5hZGRMaXN0ZW5lcihMZWdhY3lDYWxsSGFuZGxlckV2ZW50LkNhbGxTdGF0ZSwgdGhpcy51cGRhdGVDYWxsKTtcbiAgICAgICAgTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2UuYWRkTGlzdGVuZXIoTGVnYWN5Q2FsbEhhbmRsZXJFdmVudC5DYWxsQ2hhbmdlUm9vbSwgdGhpcy51cGRhdGVDYWxsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnJlbW92ZUxpc3RlbmVyKExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQuQ2FsbFN0YXRlLCB0aGlzLnVwZGF0ZUNhbGwpO1xuICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5yZW1vdmVMaXN0ZW5lcihMZWdhY3lDYWxsSGFuZGxlckV2ZW50LkNhbGxDaGFuZ2VSb29tLCB0aGlzLnVwZGF0ZUNhbGwpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlQ2FsbCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3Q2FsbCA9IHRoaXMuZ2V0Q2FsbCgpO1xuICAgICAgICBpZiAobmV3Q2FsbCAhPT0gdGhpcy5zdGF0ZS5jYWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY2FsbDogbmV3Q2FsbCB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdldENhbGwoKTogTWF0cml4Q2FsbCB8IG51bGwge1xuICAgICAgICBjb25zdCBjYWxsID0gTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2UuZ2V0Q2FsbEZvclJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuXG4gICAgICAgIGlmIChjYWxsICYmIFtDYWxsU3RhdGUuRW5kZWQsIENhbGxTdGF0ZS5SaW5naW5nXS5pbmNsdWRlcyhjYWxsLnN0YXRlKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBjYWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZXNpemVTdGFydCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5zdGFydFJlc2l6aW5nKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIubm90aWZ5VGltZWxpbmVIZWlnaHRDaGFuZ2VkKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNpemVTdG9wID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLnN0b3BSZXNpemluZygpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuY2FsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbFZpZXdGb3JSb29tXCI+XG4gICAgICAgICAgICAgICAgPFJlc2l6YWJsZVxuICAgICAgICAgICAgICAgICAgICBtaW5IZWlnaHQ9ezM4MH1cbiAgICAgICAgICAgICAgICAgICAgbWF4SGVpZ2h0PVwiODB2aFwiXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wUmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tUmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tTGVmdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BMZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgb25SZXNpemVTdGFydD17dGhpcy5vblJlc2l6ZVN0YXJ0fVxuICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZT17dGhpcy5vblJlc2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgb25SZXNpemVTdG9wPXt0aGlzLm9uUmVzaXplU3RvcH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbFZpZXdGb3JSb29tX1Jlc2l6ZVdyYXBwZXJcIlxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVDbGFzc2VzPXt7IGJvdHRvbTogXCJteF9MZWdhY3lDYWxsVmlld0ZvclJvb21fUmVzaXplSGFuZGxlXCIgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxMZWdhY3lDYWxsVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbD17dGhpcy5zdGF0ZS5jYWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGlwTW9kZT17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93QXBwcz17dGhpcy5wcm9wcy5zaG93QXBwc31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1Jlc2l6YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7OztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEscUJBQU4sU0FBb0NDLGNBQUEsQ0FBTUMsU0FBMUMsQ0FBb0U7RUFDL0VDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOO0lBRHVCLGtEQWlCTixNQUFNO01BQ3ZCLE1BQU1DLE9BQU8sR0FBRyxLQUFLQyxPQUFMLEVBQWhCOztNQUNBLElBQUlELE9BQU8sS0FBSyxLQUFLRSxLQUFMLENBQVdDLElBQTNCLEVBQWlDO1FBQzdCLEtBQUtDLFFBQUwsQ0FBYztVQUFFRCxJQUFJLEVBQUVIO1FBQVIsQ0FBZDtNQUNIO0lBQ0osQ0F0QjBCO0lBQUEscURBK0JILE1BQU07TUFDMUIsS0FBS0QsS0FBTCxDQUFXTSxjQUFYLENBQTBCQyxhQUExQjtJQUNILENBakMwQjtJQUFBLGdEQW1DUixNQUFNO01BQ3JCLEtBQUtQLEtBQUwsQ0FBV00sY0FBWCxDQUEwQkUsMkJBQTFCO0lBQ0gsQ0FyQzBCO0lBQUEsb0RBdUNKLE1BQU07TUFDekIsS0FBS1IsS0FBTCxDQUFXTSxjQUFYLENBQTBCRyxZQUExQjtJQUNILENBekMwQjtJQUV2QixLQUFLTixLQUFMLEdBQWE7TUFDVEMsSUFBSSxFQUFFLEtBQUtGLE9BQUw7SUFERyxDQUFiO0VBR0g7O0VBRU1RLGlCQUFpQixHQUFHO0lBQ3ZCQywwQkFBQSxDQUFrQkMsUUFBbEIsQ0FBMkJDLFdBQTNCLENBQXVDQyx5Q0FBQSxDQUF1QkMsU0FBOUQsRUFBeUUsS0FBS0MsVUFBOUU7O0lBQ0FMLDBCQUFBLENBQWtCQyxRQUFsQixDQUEyQkMsV0FBM0IsQ0FBdUNDLHlDQUFBLENBQXVCRyxjQUE5RCxFQUE4RSxLQUFLRCxVQUFuRjtFQUNIOztFQUVNRSxvQkFBb0IsR0FBRztJQUMxQlAsMEJBQUEsQ0FBa0JDLFFBQWxCLENBQTJCTyxjQUEzQixDQUEwQ0wseUNBQUEsQ0FBdUJDLFNBQWpFLEVBQTRFLEtBQUtDLFVBQWpGOztJQUNBTCwwQkFBQSxDQUFrQkMsUUFBbEIsQ0FBMkJPLGNBQTNCLENBQTBDTCx5Q0FBQSxDQUF1QkcsY0FBakUsRUFBaUYsS0FBS0QsVUFBdEY7RUFDSDs7RUFTT2QsT0FBTyxHQUFzQjtJQUNqQyxNQUFNRSxJQUFJLEdBQUdPLDBCQUFBLENBQWtCQyxRQUFsQixDQUEyQlEsY0FBM0IsQ0FBMEMsS0FBS3BCLEtBQUwsQ0FBV3FCLE1BQXJELENBQWI7O0lBRUEsSUFBSWpCLElBQUksSUFBSSxDQUFDVyxlQUFBLENBQVVPLEtBQVgsRUFBa0JQLGVBQUEsQ0FBVVEsT0FBNUIsRUFBcUNDLFFBQXJDLENBQThDcEIsSUFBSSxDQUFDRCxLQUFuRCxDQUFaLEVBQXVFLE9BQU8sSUFBUDtJQUN2RSxPQUFPQyxJQUFQO0VBQ0g7O0VBY01xQixNQUFNLEdBQUc7SUFDWixJQUFJLENBQUMsS0FBS3RCLEtBQUwsQ0FBV0MsSUFBaEIsRUFBc0IsT0FBTyxJQUFQO0lBRXRCLG9CQUNJO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQ0ksNkJBQUMsc0JBQUQ7TUFDSSxTQUFTLEVBQUUsR0FEZjtNQUVJLFNBQVMsRUFBQyxNQUZkO01BR0ksTUFBTSxFQUFFO1FBQ0pzQixHQUFHLEVBQUUsS0FERDtRQUVKQyxLQUFLLEVBQUUsS0FGSDtRQUdKQyxNQUFNLEVBQUUsSUFISjtRQUlKQyxJQUFJLEVBQUUsS0FKRjtRQUtKQyxRQUFRLEVBQUUsS0FMTjtRQU1KQyxXQUFXLEVBQUUsS0FOVDtRQU9KQyxVQUFVLEVBQUUsS0FQUjtRQVFKQyxPQUFPLEVBQUU7TUFSTCxDQUhaO01BYUksYUFBYSxFQUFFLEtBQUtDLGFBYnhCO01BY0ksUUFBUSxFQUFFLEtBQUtDLFFBZG5CO01BZUksWUFBWSxFQUFFLEtBQUtDLFlBZnZCO01BZ0JJLFNBQVMsRUFBQyx3Q0FoQmQ7TUFpQkksYUFBYSxFQUFFO1FBQUVSLE1BQU0sRUFBRTtNQUFWO0lBakJuQixnQkFtQkksNkJBQUMsdUJBQUQ7TUFDSSxJQUFJLEVBQUUsS0FBS3pCLEtBQUwsQ0FBV0MsSUFEckI7TUFFSSxPQUFPLEVBQUUsS0FGYjtNQUdJLFFBQVEsRUFBRSxLQUFLSixLQUFMLENBQVdxQztJQUh6QixFQW5CSixDQURKLENBREo7RUE2Qkg7O0FBNUU4RSJ9