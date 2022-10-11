"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _call = require("matrix-js-sdk/src/webrtc/call");

var _logger = require("matrix-js-sdk/src/logger");

var _classnames = _interopRequireDefault(require("classnames"));

var _LegacyCallView = _interopRequireDefault(require("./LegacyCallView"));

var _RoomViewStore = require("../../../stores/RoomViewStore");

var _LegacyCallHandler = _interopRequireWildcard(require("../../../LegacyCallHandler"));

var _PersistentApp = _interopRequireDefault(require("../elements/PersistentApp"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _PictureInPictureDragger = _interopRequireDefault(require("./PictureInPictureDragger"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _WidgetLayoutStore = require("../../../stores/widgets/WidgetLayoutStore");

var _LegacyCallViewHeader = _interopRequireDefault(require("./LegacyCallView/LegacyCallViewHeader"));

var _ActiveWidgetStore = _interopRequireWildcard(require("../../../stores/ActiveWidgetStore"));

var _WidgetStore = _interopRequireDefault(require("../../../stores/WidgetStore"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 - 2022 The Matrix.org Foundation C.I.C.

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
const SHOW_CALL_IN_STATES = [_call.CallState.Connected, _call.CallState.InviteSent, _call.CallState.Connecting, _call.CallState.CreateAnswer, _call.CallState.CreateOffer, _call.CallState.WaitLocalMedia];

const getRoomAndAppForWidget = (widgetId, roomId) => {
  if (!widgetId) return;
  if (!roomId) return;

  const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

  const app = _WidgetStore.default.instance.getApps(roomId).find(app => app.id === widgetId);

  return [room, app];
}; // Splits a list of calls into one 'primary' one and a list
// (which should be a single element) of other calls.
// The primary will be the one not on hold, or an arbitrary one
// if they're all on hold)


function getPrimarySecondaryCallsForPip(roomId) {
  const calls = _LegacyCallHandler.default.instance.getAllActiveCallsForPip(roomId);

  let primary = null;
  let secondaries = [];

  for (const call of calls) {
    if (!SHOW_CALL_IN_STATES.includes(call.state)) continue;

    if (!call.isRemoteOnHold() && primary === null) {
      primary = call;
    } else {
      secondaries.push(call);
    }
  }

  if (primary === null && secondaries.length > 0) {
    primary = secondaries[0];
    secondaries = secondaries.slice(1);
  }

  if (secondaries.length > 1) {
    // We should never be in more than two calls so this shouldn't happen
    _logger.logger.log("Found more than 1 secondary call! Other calls will not be shown.");
  }

  return [primary, secondaries];
}
/**
 * PipView shows a small version of the LegacyCallView or a sticky widget hovering over the UI in 'picture-in-picture'
 * (PiP mode). It displays the call(s) which is *not* in the room the user is currently viewing
 * and all widgets that are active but not shown in any other possible container.
 */


class PipView extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "roomStoreToken", void 0);
    (0, _defineProperty2.default)(this, "settingsWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "movePersistedElement", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onMove", () => this.movePersistedElement.current?.());
    (0, _defineProperty2.default)(this, "onRoomViewStoreUpdate", () => {
      const newRoomId = _RoomViewStore.RoomViewStore.instance.getRoomId();

      const oldRoomId = this.state.viewedRoomId;
      if (newRoomId === oldRoomId) return; // The WidgetLayoutStore observer always tracks the currently viewed Room,
      // so we don't end up with multiple observers and know what observer to remove on unmount

      const oldRoom = _MatrixClientPeg.MatrixClientPeg.get()?.getRoom(oldRoomId);

      if (oldRoom) {
        _WidgetLayoutStore.WidgetLayoutStore.instance.off(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(oldRoom), this.updateCalls);
      }

      const newRoom = _MatrixClientPeg.MatrixClientPeg.get()?.getRoom(newRoomId);

      if (newRoom) {
        _WidgetLayoutStore.WidgetLayoutStore.instance.on(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(newRoom), this.updateCalls);
      }

      if (!newRoomId) return;
      const [primaryCall, secondaryCalls] = getPrimarySecondaryCallsForPip(newRoomId);
      this.setState({
        viewedRoomId: newRoomId,
        primaryCall: primaryCall,
        secondaryCall: secondaryCalls[0]
      });
      this.updateShowWidgetInPip();
    });
    (0, _defineProperty2.default)(this, "onWidgetPersistence", () => {
      this.updateShowWidgetInPip(_ActiveWidgetStore.default.instance.getPersistentWidgetId(), _ActiveWidgetStore.default.instance.getPersistentRoomId());
    });
    (0, _defineProperty2.default)(this, "onWidgetDockChanges", () => {
      this.updateShowWidgetInPip();
    });
    (0, _defineProperty2.default)(this, "updateCalls", () => {
      if (!this.state.viewedRoomId) return;
      const [primaryCall, secondaryCalls] = getPrimarySecondaryCallsForPip(this.state.viewedRoomId);
      this.setState({
        primaryCall: primaryCall,
        secondaryCall: secondaryCalls[0]
      });
      this.updateShowWidgetInPip();
    });
    (0, _defineProperty2.default)(this, "onCallRemoteHold", () => {
      if (!this.state.viewedRoomId) return;
      const [primaryCall, secondaryCalls] = getPrimarySecondaryCallsForPip(this.state.viewedRoomId);
      this.setState({
        primaryCall: primaryCall,
        secondaryCall: secondaryCalls[0]
      });
    });
    (0, _defineProperty2.default)(this, "onDoubleClick", () => {
      const callRoomId = this.state.primaryCall?.roomId;

      if (callRoomId ?? this.state.persistentRoomId) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: callRoomId ?? this.state.persistentRoomId,
          metricsTrigger: "WebFloatingCallWindow"
        });
      }
    });
    (0, _defineProperty2.default)(this, "onMaximize", () => {
      const widgetId = this.state.persistentWidgetId;
      const roomId = this.state.persistentRoomId;

      if (this.state.showWidgetInPip && widgetId && roomId) {
        const [room, app] = getRoomAndAppForWidget(widgetId, roomId);

        _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(room, app, _WidgetLayoutStore.Container.Center);
      } else {
        _dispatcher.default.dispatch({
          action: 'video_fullscreen',
          fullscreen: true
        });
      }
    });
    (0, _defineProperty2.default)(this, "onPin", () => {
      if (!this.state.showWidgetInPip) return;
      const [room, app] = getRoomAndAppForWidget(this.state.persistentWidgetId, this.state.persistentRoomId);

      _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(room, app, _WidgetLayoutStore.Container.Top);
    });
    (0, _defineProperty2.default)(this, "onExpand", () => {
      const widgetId = this.state.persistentWidgetId;
      if (!widgetId || !this.state.showWidgetInPip) return;

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: this.state.persistentRoomId
      });
    });

    const _roomId = _RoomViewStore.RoomViewStore.instance.getRoomId();

    const [_primaryCall, _secondaryCalls] = getPrimarySecondaryCallsForPip(_roomId);
    this.state = {
      moving: false,
      viewedRoomId: _roomId,
      primaryCall: _primaryCall,
      secondaryCall: _secondaryCalls[0],
      persistentWidgetId: _ActiveWidgetStore.default.instance.getPersistentWidgetId(),
      persistentRoomId: _ActiveWidgetStore.default.instance.getPersistentRoomId(),
      showWidgetInPip: false
    };
  }

  componentDidMount() {
    _LegacyCallHandler.default.instance.addListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallChangeRoom, this.updateCalls);

    _LegacyCallHandler.default.instance.addListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.updateCalls);

    this.roomStoreToken = _RoomViewStore.RoomViewStore.instance.addListener(this.onRoomViewStoreUpdate);

    _MatrixClientPeg.MatrixClientPeg.get().on(_call.CallEvent.RemoteHoldUnhold, this.onCallRemoteHold);

    const room = _MatrixClientPeg.MatrixClientPeg.get()?.getRoom(this.state.viewedRoomId);

    if (room) {
      _WidgetLayoutStore.WidgetLayoutStore.instance.on(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(room), this.updateCalls);
    }

    _ActiveWidgetStore.default.instance.on(_ActiveWidgetStore.ActiveWidgetStoreEvent.Persistence, this.onWidgetPersistence);

    _ActiveWidgetStore.default.instance.on(_ActiveWidgetStore.ActiveWidgetStoreEvent.Dock, this.onWidgetDockChanges);

    _ActiveWidgetStore.default.instance.on(_ActiveWidgetStore.ActiveWidgetStoreEvent.Undock, this.onWidgetDockChanges);

    document.addEventListener("mouseup", this.onEndMoving.bind(this));
  }

  componentWillUnmount() {
    _LegacyCallHandler.default.instance.removeListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallChangeRoom, this.updateCalls);

    _LegacyCallHandler.default.instance.removeListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.updateCalls);

    _MatrixClientPeg.MatrixClientPeg.get().removeListener(_call.CallEvent.RemoteHoldUnhold, this.onCallRemoteHold);

    this.roomStoreToken?.remove();

    _SettingsStore.default.unwatchSetting(this.settingsWatcherRef);

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.state.viewedRoomId);

    if (room) {
      _WidgetLayoutStore.WidgetLayoutStore.instance.off(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(room), this.updateCalls);
    }

    _ActiveWidgetStore.default.instance.off(_ActiveWidgetStore.ActiveWidgetStoreEvent.Persistence, this.onWidgetPersistence);

    _ActiveWidgetStore.default.instance.off(_ActiveWidgetStore.ActiveWidgetStoreEvent.Dock, this.onWidgetDockChanges);

    _ActiveWidgetStore.default.instance.off(_ActiveWidgetStore.ActiveWidgetStoreEvent.Undock, this.onWidgetDockChanges);

    document.removeEventListener("mouseup", this.onEndMoving.bind(this));
  }

  onStartMoving() {
    this.setState({
      moving: true
    });
  }

  onEndMoving() {
    this.setState({
      moving: false
    });
  }

  // Accepts a persistentWidgetId to be able to skip awaiting the setState for persistentWidgetId
  updateShowWidgetInPip() {
    let persistentWidgetId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.persistentWidgetId;
    let persistentRoomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.state.persistentRoomId;
    let fromAnotherRoom = false;
    let notDocked = false; // Sanity check the room - the widget may have been destroyed between render cycles, and
    // thus no room is associated anymore.

    if (persistentWidgetId && _MatrixClientPeg.MatrixClientPeg.get().getRoom(persistentRoomId)) {
      notDocked = !_ActiveWidgetStore.default.instance.isDocked(persistentWidgetId, persistentRoomId);
      fromAnotherRoom = this.state.viewedRoomId !== persistentRoomId;
    } // The widget should only be shown as a persistent app (in a floating
    // pip container) if it is not visible on screen: either because we are
    // viewing a different room OR because it is in none of the possible
    // containers of the room view.


    const showWidgetInPip = fromAnotherRoom || notDocked;
    this.setState({
      showWidgetInPip,
      persistentWidgetId,
      persistentRoomId
    });
  }

  render() {
    const pipMode = true;
    let pipContent;

    if (this.state.primaryCall) {
      pipContent = _ref => {
        let {
          onStartMoving,
          onResize
        } = _ref;
        return /*#__PURE__*/_react.default.createElement(_LegacyCallView.default, {
          onMouseDownOnHeader: onStartMoving,
          call: this.state.primaryCall,
          secondaryCall: this.state.secondaryCall,
          pipMode: pipMode,
          onResize: onResize
        });
      };
    }

    if (this.state.showWidgetInPip) {
      const pipViewClasses = (0, _classnames.default)({
        mx_LegacyCallView: true,
        mx_LegacyCallView_pip: pipMode,
        mx_LegacyCallView_large: !pipMode
      });
      const roomId = this.state.persistentRoomId;

      const roomForWidget = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

      const viewingCallRoom = this.state.viewedRoomId === roomId;

      pipContent = _ref2 => {
        let {
          onStartMoving,
          _onResize
        } = _ref2;
        return /*#__PURE__*/_react.default.createElement("div", {
          className: pipViewClasses
        }, /*#__PURE__*/_react.default.createElement(_LegacyCallViewHeader.default, {
          onPipMouseDown: event => {
            onStartMoving(event);
            this.onStartMoving.bind(this)();
          },
          pipMode: pipMode,
          callRooms: [roomForWidget],
          onExpand: !viewingCallRoom && this.onExpand,
          onPin: viewingCallRoom && this.onPin,
          onMaximize: viewingCallRoom && this.onMaximize
        }), /*#__PURE__*/_react.default.createElement(_PersistentApp.default, {
          persistentWidgetId: this.state.persistentWidgetId,
          persistentRoomId: roomId,
          pointerEvents: this.state.moving ? 'none' : undefined,
          movePersistedElement: this.movePersistedElement
        }));
      };
    }

    if (!!pipContent) {
      return /*#__PURE__*/_react.default.createElement(_PictureInPictureDragger.default, {
        className: "mx_LegacyCallPreview",
        draggable: pipMode,
        onDoubleClick: this.onDoubleClick,
        onMove: this.onMove
      }, pipContent);
    }

    return null;
  }

}

exports.default = PipView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTSE9XX0NBTExfSU5fU1RBVEVTIiwiQ2FsbFN0YXRlIiwiQ29ubmVjdGVkIiwiSW52aXRlU2VudCIsIkNvbm5lY3RpbmciLCJDcmVhdGVBbnN3ZXIiLCJDcmVhdGVPZmZlciIsIldhaXRMb2NhbE1lZGlhIiwiZ2V0Um9vbUFuZEFwcEZvcldpZGdldCIsIndpZGdldElkIiwicm9vbUlkIiwicm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFJvb20iLCJhcHAiLCJXaWRnZXRTdG9yZSIsImluc3RhbmNlIiwiZ2V0QXBwcyIsImZpbmQiLCJpZCIsImdldFByaW1hcnlTZWNvbmRhcnlDYWxsc0ZvclBpcCIsImNhbGxzIiwiTGVnYWN5Q2FsbEhhbmRsZXIiLCJnZXRBbGxBY3RpdmVDYWxsc0ZvclBpcCIsInByaW1hcnkiLCJzZWNvbmRhcmllcyIsImNhbGwiLCJpbmNsdWRlcyIsInN0YXRlIiwiaXNSZW1vdGVPbkhvbGQiLCJwdXNoIiwibGVuZ3RoIiwic2xpY2UiLCJsb2dnZXIiLCJsb2ciLCJQaXBWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwibW92ZVBlcnNpc3RlZEVsZW1lbnQiLCJjdXJyZW50IiwibmV3Um9vbUlkIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsIm9sZFJvb21JZCIsInZpZXdlZFJvb21JZCIsIm9sZFJvb20iLCJXaWRnZXRMYXlvdXRTdG9yZSIsIm9mZiIsImVtaXNzaW9uRm9yUm9vbSIsInVwZGF0ZUNhbGxzIiwibmV3Um9vbSIsIm9uIiwicHJpbWFyeUNhbGwiLCJzZWNvbmRhcnlDYWxscyIsInNldFN0YXRlIiwic2Vjb25kYXJ5Q2FsbCIsInVwZGF0ZVNob3dXaWRnZXRJblBpcCIsIkFjdGl2ZVdpZGdldFN0b3JlIiwiZ2V0UGVyc2lzdGVudFdpZGdldElkIiwiZ2V0UGVyc2lzdGVudFJvb21JZCIsImNhbGxSb29tSWQiLCJwZXJzaXN0ZW50Um9vbUlkIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3Um9vbSIsInJvb21faWQiLCJtZXRyaWNzVHJpZ2dlciIsInBlcnNpc3RlbnRXaWRnZXRJZCIsInNob3dXaWRnZXRJblBpcCIsIm1vdmVUb0NvbnRhaW5lciIsIkNvbnRhaW5lciIsIkNlbnRlciIsImZ1bGxzY3JlZW4iLCJUb3AiLCJtb3ZpbmciLCJjb21wb25lbnREaWRNb3VudCIsImFkZExpc3RlbmVyIiwiTGVnYWN5Q2FsbEhhbmRsZXJFdmVudCIsIkNhbGxDaGFuZ2VSb29tIiwicm9vbVN0b3JlVG9rZW4iLCJvblJvb21WaWV3U3RvcmVVcGRhdGUiLCJDYWxsRXZlbnQiLCJSZW1vdGVIb2xkVW5ob2xkIiwib25DYWxsUmVtb3RlSG9sZCIsIkFjdGl2ZVdpZGdldFN0b3JlRXZlbnQiLCJQZXJzaXN0ZW5jZSIsIm9uV2lkZ2V0UGVyc2lzdGVuY2UiLCJEb2NrIiwib25XaWRnZXREb2NrQ2hhbmdlcyIsIlVuZG9jayIsImRvY3VtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uRW5kTW92aW5nIiwiYmluZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmUiLCJTZXR0aW5nc1N0b3JlIiwidW53YXRjaFNldHRpbmciLCJzZXR0aW5nc1dhdGNoZXJSZWYiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25TdGFydE1vdmluZyIsImZyb21Bbm90aGVyUm9vbSIsIm5vdERvY2tlZCIsImlzRG9ja2VkIiwicmVuZGVyIiwicGlwTW9kZSIsInBpcENvbnRlbnQiLCJvblJlc2l6ZSIsInBpcFZpZXdDbGFzc2VzIiwiY2xhc3NOYW1lcyIsIm14X0xlZ2FjeUNhbGxWaWV3IiwibXhfTGVnYWN5Q2FsbFZpZXdfcGlwIiwibXhfTGVnYWN5Q2FsbFZpZXdfbGFyZ2UiLCJyb29tRm9yV2lkZ2V0Iiwidmlld2luZ0NhbGxSb29tIiwiX29uUmVzaXplIiwiZXZlbnQiLCJvbkV4cGFuZCIsIm9uUGluIiwib25NYXhpbWl6ZSIsInVuZGVmaW5lZCIsIm9uRG91YmxlQ2xpY2siLCJvbk1vdmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy92b2lwL1BpcFZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQ2FsbEV2ZW50LCBDYWxsU3RhdGUsIE1hdHJpeENhbGwgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5pbXBvcnQgeyBFdmVudFN1YnNjcmlwdGlvbiB9IGZyb20gJ2ZiZW1pdHRlcic7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IExlZ2FjeUNhbGxWaWV3IGZyb20gXCIuL0xlZ2FjeUNhbGxWaWV3XCI7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmUnO1xuaW1wb3J0IExlZ2FjeUNhbGxIYW5kbGVyLCB7IExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQgfSBmcm9tICcuLi8uLi8uLi9MZWdhY3lDYWxsSGFuZGxlcic7XG5pbXBvcnQgUGVyc2lzdGVudEFwcCBmcm9tIFwiLi4vZWxlbWVudHMvUGVyc2lzdGVudEFwcFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgUGljdHVyZUluUGljdHVyZURyYWdnZXIgZnJvbSAnLi9QaWN0dXJlSW5QaWN0dXJlRHJhZ2dlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBDb250YWluZXIsIFdpZGdldExheW91dFN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL3dpZGdldHMvV2lkZ2V0TGF5b3V0U3RvcmUnO1xuaW1wb3J0IExlZ2FjeUNhbGxWaWV3SGVhZGVyIGZyb20gJy4vTGVnYWN5Q2FsbFZpZXcvTGVnYWN5Q2FsbFZpZXdIZWFkZXInO1xuaW1wb3J0IEFjdGl2ZVdpZGdldFN0b3JlLCB7IEFjdGl2ZVdpZGdldFN0b3JlRXZlbnQgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvQWN0aXZlV2lkZ2V0U3RvcmUnO1xuaW1wb3J0IFdpZGdldFN0b3JlLCB7IElBcHAgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1dpZGdldFN0b3JlXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcblxuY29uc3QgU0hPV19DQUxMX0lOX1NUQVRFUyA9IFtcbiAgICBDYWxsU3RhdGUuQ29ubmVjdGVkLFxuICAgIENhbGxTdGF0ZS5JbnZpdGVTZW50LFxuICAgIENhbGxTdGF0ZS5Db25uZWN0aW5nLFxuICAgIENhbGxTdGF0ZS5DcmVhdGVBbnN3ZXIsXG4gICAgQ2FsbFN0YXRlLkNyZWF0ZU9mZmVyLFxuICAgIENhbGxTdGF0ZS5XYWl0TG9jYWxNZWRpYSxcbl07XG5cbmludGVyZmFjZSBJUHJvcHMge1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICB2aWV3ZWRSb29tSWQ6IHN0cmluZztcblxuICAgIC8vIFRoZSBtYWluIGNhbGwgdGhhdCB3ZSBhcmUgZGlzcGxheWluZyAoaWUuIG5vdCBpbmNsdWRpbmcgdGhlIGNhbGwgaW4gdGhlIHJvb20gYmVpbmcgdmlld2VkLCBpZiBhbnkpXG4gICAgcHJpbWFyeUNhbGw6IE1hdHJpeENhbGw7XG5cbiAgICAvLyBBbnkgb3RoZXIgY2FsbCB3ZSdyZSBkaXNwbGF5aW5nOiBvbmx5IGlmIHRoZSB1c2VyIGlzIG9uIHR3byBjYWxscyBhbmQgbm90IHZpZXdpbmcgZWl0aGVyIG9mIHRoZSByb29tc1xuICAgIC8vIHRoZXkgYmVsb25nIHRvXG4gICAgc2Vjb25kYXJ5Q2FsbDogTWF0cml4Q2FsbDtcblxuICAgIC8vIHdpZGdldCBjYW5kaWRhdGUgdG8gYmUgZGlzcGxheWVkIGluIHRoZSBwaXAgdmlldy5cbiAgICBwZXJzaXN0ZW50V2lkZ2V0SWQ6IHN0cmluZztcbiAgICBwZXJzaXN0ZW50Um9vbUlkOiBzdHJpbmc7XG4gICAgc2hvd1dpZGdldEluUGlwOiBib29sZWFuO1xuXG4gICAgbW92aW5nOiBib29sZWFuO1xufVxuXG5jb25zdCBnZXRSb29tQW5kQXBwRm9yV2lkZ2V0ID0gKHdpZGdldElkOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nKTogW1Jvb20sIElBcHBdID0+IHtcbiAgICBpZiAoIXdpZGdldElkKSByZXR1cm47XG4gICAgaWYgKCFyb29tSWQpIHJldHVybjtcblxuICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgIGNvbnN0IGFwcCA9IFdpZGdldFN0b3JlLmluc3RhbmNlLmdldEFwcHMocm9vbUlkKS5maW5kKChhcHApID0+IGFwcC5pZCA9PT0gd2lkZ2V0SWQpO1xuXG4gICAgcmV0dXJuIFtyb29tLCBhcHBdO1xufTtcblxuLy8gU3BsaXRzIGEgbGlzdCBvZiBjYWxscyBpbnRvIG9uZSAncHJpbWFyeScgb25lIGFuZCBhIGxpc3Rcbi8vICh3aGljaCBzaG91bGQgYmUgYSBzaW5nbGUgZWxlbWVudCkgb2Ygb3RoZXIgY2FsbHMuXG4vLyBUaGUgcHJpbWFyeSB3aWxsIGJlIHRoZSBvbmUgbm90IG9uIGhvbGQsIG9yIGFuIGFyYml0cmFyeSBvbmVcbi8vIGlmIHRoZXkncmUgYWxsIG9uIGhvbGQpXG5mdW5jdGlvbiBnZXRQcmltYXJ5U2Vjb25kYXJ5Q2FsbHNGb3JQaXAocm9vbUlkOiBzdHJpbmcpOiBbTWF0cml4Q2FsbCwgTWF0cml4Q2FsbFtdXSB7XG4gICAgY29uc3QgY2FsbHMgPSBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5nZXRBbGxBY3RpdmVDYWxsc0ZvclBpcChyb29tSWQpO1xuXG4gICAgbGV0IHByaW1hcnk6IE1hdHJpeENhbGwgPSBudWxsO1xuICAgIGxldCBzZWNvbmRhcmllczogTWF0cml4Q2FsbFtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGNhbGwgb2YgY2FsbHMpIHtcbiAgICAgICAgaWYgKCFTSE9XX0NBTExfSU5fU1RBVEVTLmluY2x1ZGVzKGNhbGwuc3RhdGUpKSBjb250aW51ZTtcblxuICAgICAgICBpZiAoIWNhbGwuaXNSZW1vdGVPbkhvbGQoKSAmJiBwcmltYXJ5ID09PSBudWxsKSB7XG4gICAgICAgICAgICBwcmltYXJ5ID0gY2FsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlY29uZGFyaWVzLnB1c2goY2FsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJpbWFyeSA9PT0gbnVsbCAmJiBzZWNvbmRhcmllcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHByaW1hcnkgPSBzZWNvbmRhcmllc1swXTtcbiAgICAgICAgc2Vjb25kYXJpZXMgPSBzZWNvbmRhcmllcy5zbGljZSgxKTtcbiAgICB9XG5cbiAgICBpZiAoc2Vjb25kYXJpZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBXZSBzaG91bGQgbmV2ZXIgYmUgaW4gbW9yZSB0aGFuIHR3byBjYWxscyBzbyB0aGlzIHNob3VsZG4ndCBoYXBwZW5cbiAgICAgICAgbG9nZ2VyLmxvZyhcIkZvdW5kIG1vcmUgdGhhbiAxIHNlY29uZGFyeSBjYWxsISBPdGhlciBjYWxscyB3aWxsIG5vdCBiZSBzaG93bi5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtwcmltYXJ5LCBzZWNvbmRhcmllc107XG59XG5cbi8qKlxuICogUGlwVmlldyBzaG93cyBhIHNtYWxsIHZlcnNpb24gb2YgdGhlIExlZ2FjeUNhbGxWaWV3IG9yIGEgc3RpY2t5IHdpZGdldCBob3ZlcmluZyBvdmVyIHRoZSBVSSBpbiAncGljdHVyZS1pbi1waWN0dXJlJ1xuICogKFBpUCBtb2RlKS4gSXQgZGlzcGxheXMgdGhlIGNhbGwocykgd2hpY2ggaXMgKm5vdCogaW4gdGhlIHJvb20gdGhlIHVzZXIgaXMgY3VycmVudGx5IHZpZXdpbmdcbiAqIGFuZCBhbGwgd2lkZ2V0cyB0aGF0IGFyZSBhY3RpdmUgYnV0IG5vdCBzaG93biBpbiBhbnkgb3RoZXIgcG9zc2libGUgY29udGFpbmVyLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBpcFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHJvb21TdG9yZVRva2VuOiBFdmVudFN1YnNjcmlwdGlvbjtcbiAgICBwcml2YXRlIHNldHRpbmdzV2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgbW92ZVBlcnNpc3RlZEVsZW1lbnQgPSBjcmVhdGVSZWY8KCkgPT4gdm9pZD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHJvb21JZCA9IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCk7XG5cbiAgICAgICAgY29uc3QgW3ByaW1hcnlDYWxsLCBzZWNvbmRhcnlDYWxsc10gPSBnZXRQcmltYXJ5U2Vjb25kYXJ5Q2FsbHNGb3JQaXAocm9vbUlkKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW92aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHZpZXdlZFJvb21JZDogcm9vbUlkLFxuICAgICAgICAgICAgcHJpbWFyeUNhbGw6IHByaW1hcnlDYWxsLFxuICAgICAgICAgICAgc2Vjb25kYXJ5Q2FsbDogc2Vjb25kYXJ5Q2FsbHNbMF0sXG4gICAgICAgICAgICBwZXJzaXN0ZW50V2lkZ2V0SWQ6IEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLmdldFBlcnNpc3RlbnRXaWRnZXRJZCgpLFxuICAgICAgICAgICAgcGVyc2lzdGVudFJvb21JZDogQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZ2V0UGVyc2lzdGVudFJvb21JZCgpLFxuICAgICAgICAgICAgc2hvd1dpZGdldEluUGlwOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLmFkZExpc3RlbmVyKExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQuQ2FsbENoYW5nZVJvb20sIHRoaXMudXBkYXRlQ2FsbHMpO1xuICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5hZGRMaXN0ZW5lcihMZWdhY3lDYWxsSGFuZGxlckV2ZW50LkNhbGxTdGF0ZSwgdGhpcy51cGRhdGVDYWxscyk7XG4gICAgICAgIHRoaXMucm9vbVN0b3JlVG9rZW4gPSBSb29tVmlld1N0b3JlLmluc3RhbmNlLmFkZExpc3RlbmVyKHRoaXMub25Sb29tVmlld1N0b3JlVXBkYXRlKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKENhbGxFdmVudC5SZW1vdGVIb2xkVW5ob2xkLCB0aGlzLm9uQ2FsbFJlbW90ZUhvbGQpO1xuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpPy5nZXRSb29tKHRoaXMuc3RhdGUudmlld2VkUm9vbUlkKTtcbiAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm9uKFdpZGdldExheW91dFN0b3JlLmVtaXNzaW9uRm9yUm9vbShyb29tKSwgdGhpcy51cGRhdGVDYWxscyk7XG4gICAgICAgIH1cbiAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub24oQWN0aXZlV2lkZ2V0U3RvcmVFdmVudC5QZXJzaXN0ZW5jZSwgdGhpcy5vbldpZGdldFBlcnNpc3RlbmNlKTtcbiAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub24oQWN0aXZlV2lkZ2V0U3RvcmVFdmVudC5Eb2NrLCB0aGlzLm9uV2lkZ2V0RG9ja0NoYW5nZXMpO1xuICAgICAgICBBY3RpdmVXaWRnZXRTdG9yZS5pbnN0YW5jZS5vbihBY3RpdmVXaWRnZXRTdG9yZUV2ZW50LlVuZG9jaywgdGhpcy5vbldpZGdldERvY2tDaGFuZ2VzKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5vbkVuZE1vdmluZy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnJlbW92ZUxpc3RlbmVyKExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQuQ2FsbENoYW5nZVJvb20sIHRoaXMudXBkYXRlQ2FsbHMpO1xuICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5yZW1vdmVMaXN0ZW5lcihMZWdhY3lDYWxsSGFuZGxlckV2ZW50LkNhbGxTdGF0ZSwgdGhpcy51cGRhdGVDYWxscyk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihDYWxsRXZlbnQuUmVtb3RlSG9sZFVuaG9sZCwgdGhpcy5vbkNhbGxSZW1vdGVIb2xkKTtcbiAgICAgICAgdGhpcy5yb29tU3RvcmVUb2tlbj8ucmVtb3ZlKCk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5zZXR0aW5nc1dhdGNoZXJSZWYpO1xuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5zdGF0ZS52aWV3ZWRSb29tSWQpO1xuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2Uub2ZmKFdpZGdldExheW91dFN0b3JlLmVtaXNzaW9uRm9yUm9vbShyb29tKSwgdGhpcy51cGRhdGVDYWxscyk7XG4gICAgICAgIH1cbiAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub2ZmKEFjdGl2ZVdpZGdldFN0b3JlRXZlbnQuUGVyc2lzdGVuY2UsIHRoaXMub25XaWRnZXRQZXJzaXN0ZW5jZSk7XG4gICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLm9mZihBY3RpdmVXaWRnZXRTdG9yZUV2ZW50LkRvY2ssIHRoaXMub25XaWRnZXREb2NrQ2hhbmdlcyk7XG4gICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLm9mZihBY3RpdmVXaWRnZXRTdG9yZUV2ZW50LlVuZG9jaywgdGhpcy5vbldpZGdldERvY2tDaGFuZ2VzKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5vbkVuZE1vdmluZy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhcnRNb3ZpbmcoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb3Zpbmc6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkVuZE1vdmluZygpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdmluZzogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdmUgPSAoKSA9PiB0aGlzLm1vdmVQZXJzaXN0ZWRFbGVtZW50LmN1cnJlbnQ/LigpO1xuXG4gICAgcHJpdmF0ZSBvblJvb21WaWV3U3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1Jvb21JZCA9IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCk7XG4gICAgICAgIGNvbnN0IG9sZFJvb21JZCA9IHRoaXMuc3RhdGUudmlld2VkUm9vbUlkO1xuICAgICAgICBpZiAobmV3Um9vbUlkID09PSBvbGRSb29tSWQpIHJldHVybjtcbiAgICAgICAgLy8gVGhlIFdpZGdldExheW91dFN0b3JlIG9ic2VydmVyIGFsd2F5cyB0cmFja3MgdGhlIGN1cnJlbnRseSB2aWV3ZWQgUm9vbSxcbiAgICAgICAgLy8gc28gd2UgZG9uJ3QgZW5kIHVwIHdpdGggbXVsdGlwbGUgb2JzZXJ2ZXJzIGFuZCBrbm93IHdoYXQgb2JzZXJ2ZXIgdG8gcmVtb3ZlIG9uIHVubW91bnRcbiAgICAgICAgY29uc3Qgb2xkUm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKT8uZ2V0Um9vbShvbGRSb29tSWQpO1xuICAgICAgICBpZiAob2xkUm9vbSkge1xuICAgICAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2Uub2ZmKFdpZGdldExheW91dFN0b3JlLmVtaXNzaW9uRm9yUm9vbShvbGRSb29tKSwgdGhpcy51cGRhdGVDYWxscyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3Um9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKT8uZ2V0Um9vbShuZXdSb29tSWQpO1xuICAgICAgICBpZiAobmV3Um9vbSkge1xuICAgICAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2Uub24oV2lkZ2V0TGF5b3V0U3RvcmUuZW1pc3Npb25Gb3JSb29tKG5ld1Jvb20pLCB0aGlzLnVwZGF0ZUNhbGxzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5ld1Jvb21JZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IFtwcmltYXJ5Q2FsbCwgc2Vjb25kYXJ5Q2FsbHNdID0gZ2V0UHJpbWFyeVNlY29uZGFyeUNhbGxzRm9yUGlwKG5ld1Jvb21JZCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmlld2VkUm9vbUlkOiBuZXdSb29tSWQsXG4gICAgICAgICAgICBwcmltYXJ5Q2FsbDogcHJpbWFyeUNhbGwsXG4gICAgICAgICAgICBzZWNvbmRhcnlDYWxsOiBzZWNvbmRhcnlDYWxsc1swXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudXBkYXRlU2hvd1dpZGdldEluUGlwKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25XaWRnZXRQZXJzaXN0ZW5jZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTaG93V2lkZ2V0SW5QaXAoXG4gICAgICAgICAgICBBY3RpdmVXaWRnZXRTdG9yZS5pbnN0YW5jZS5nZXRQZXJzaXN0ZW50V2lkZ2V0SWQoKSxcbiAgICAgICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLmdldFBlcnNpc3RlbnRSb29tSWQoKSxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbldpZGdldERvY2tDaGFuZ2VzID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVNob3dXaWRnZXRJblBpcCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZUNhbGxzID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUudmlld2VkUm9vbUlkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IFtwcmltYXJ5Q2FsbCwgc2Vjb25kYXJ5Q2FsbHNdID0gZ2V0UHJpbWFyeVNlY29uZGFyeUNhbGxzRm9yUGlwKHRoaXMuc3RhdGUudmlld2VkUm9vbUlkKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByaW1hcnlDYWxsOiBwcmltYXJ5Q2FsbCxcbiAgICAgICAgICAgIHNlY29uZGFyeUNhbGw6IHNlY29uZGFyeUNhbGxzWzBdLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51cGRhdGVTaG93V2lkZ2V0SW5QaXAoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbGxSZW1vdGVIb2xkID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUudmlld2VkUm9vbUlkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IFtwcmltYXJ5Q2FsbCwgc2Vjb25kYXJ5Q2FsbHNdID0gZ2V0UHJpbWFyeVNlY29uZGFyeUNhbGxzRm9yUGlwKHRoaXMuc3RhdGUudmlld2VkUm9vbUlkKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByaW1hcnlDYWxsOiBwcmltYXJ5Q2FsbCxcbiAgICAgICAgICAgIHNlY29uZGFyeUNhbGw6IHNlY29uZGFyeUNhbGxzWzBdLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRvdWJsZUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBjYWxsUm9vbUlkID0gdGhpcy5zdGF0ZS5wcmltYXJ5Q2FsbD8ucm9vbUlkO1xuICAgICAgICBpZiAoY2FsbFJvb21JZCA/PyB0aGlzLnN0YXRlLnBlcnNpc3RlbnRSb29tSWQpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICByb29tX2lkOiBjYWxsUm9vbUlkID8/IHRoaXMuc3RhdGUucGVyc2lzdGVudFJvb21JZCxcbiAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJXZWJGbG9hdGluZ0NhbGxXaW5kb3dcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NYXhpbWl6ZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qgd2lkZ2V0SWQgPSB0aGlzLnN0YXRlLnBlcnNpc3RlbnRXaWRnZXRJZDtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5zdGF0ZS5wZXJzaXN0ZW50Um9vbUlkO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dXaWRnZXRJblBpcCAmJiB3aWRnZXRJZCAmJiByb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IFtyb29tLCBhcHBdID0gZ2V0Um9vbUFuZEFwcEZvcldpZGdldCh3aWRnZXRJZCwgcm9vbUlkKTtcbiAgICAgICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm1vdmVUb0NvbnRhaW5lcihyb29tLCBhcHAsIENvbnRhaW5lci5DZW50ZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWRlb19mdWxsc2NyZWVuJyxcbiAgICAgICAgICAgICAgICBmdWxsc2NyZWVuOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBpbiA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dXaWRnZXRJblBpcCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IFtyb29tLCBhcHBdID0gZ2V0Um9vbUFuZEFwcEZvcldpZGdldCh0aGlzLnN0YXRlLnBlcnNpc3RlbnRXaWRnZXRJZCwgdGhpcy5zdGF0ZS5wZXJzaXN0ZW50Um9vbUlkKTtcbiAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2UubW92ZVRvQ29udGFpbmVyKHJvb20sIGFwcCwgQ29udGFpbmVyLlRvcCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FeHBhbmQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHdpZGdldElkID0gdGhpcy5zdGF0ZS5wZXJzaXN0ZW50V2lkZ2V0SWQ7XG4gICAgICAgIGlmICghd2lkZ2V0SWQgfHwgIXRoaXMuc3RhdGUuc2hvd1dpZGdldEluUGlwKSByZXR1cm47XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5zdGF0ZS5wZXJzaXN0ZW50Um9vbUlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQWNjZXB0cyBhIHBlcnNpc3RlbnRXaWRnZXRJZCB0byBiZSBhYmxlIHRvIHNraXAgYXdhaXRpbmcgdGhlIHNldFN0YXRlIGZvciBwZXJzaXN0ZW50V2lkZ2V0SWRcbiAgICBwdWJsaWMgdXBkYXRlU2hvd1dpZGdldEluUGlwKFxuICAgICAgICBwZXJzaXN0ZW50V2lkZ2V0SWQgPSB0aGlzLnN0YXRlLnBlcnNpc3RlbnRXaWRnZXRJZCxcbiAgICAgICAgcGVyc2lzdGVudFJvb21JZCA9IHRoaXMuc3RhdGUucGVyc2lzdGVudFJvb21JZCxcbiAgICApIHtcbiAgICAgICAgbGV0IGZyb21Bbm90aGVyUm9vbSA9IGZhbHNlO1xuICAgICAgICBsZXQgbm90RG9ja2VkID0gZmFsc2U7XG4gICAgICAgIC8vIFNhbml0eSBjaGVjayB0aGUgcm9vbSAtIHRoZSB3aWRnZXQgbWF5IGhhdmUgYmVlbiBkZXN0cm95ZWQgYmV0d2VlbiByZW5kZXIgY3ljbGVzLCBhbmRcbiAgICAgICAgLy8gdGh1cyBubyByb29tIGlzIGFzc29jaWF0ZWQgYW55bW9yZS5cbiAgICAgICAgaWYgKHBlcnNpc3RlbnRXaWRnZXRJZCAmJiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShwZXJzaXN0ZW50Um9vbUlkKSkge1xuICAgICAgICAgICAgbm90RG9ja2VkID0gIUFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLmlzRG9ja2VkKHBlcnNpc3RlbnRXaWRnZXRJZCwgcGVyc2lzdGVudFJvb21JZCk7XG4gICAgICAgICAgICBmcm9tQW5vdGhlclJvb20gPSB0aGlzLnN0YXRlLnZpZXdlZFJvb21JZCAhPT0gcGVyc2lzdGVudFJvb21JZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSB3aWRnZXQgc2hvdWxkIG9ubHkgYmUgc2hvd24gYXMgYSBwZXJzaXN0ZW50IGFwcCAoaW4gYSBmbG9hdGluZ1xuICAgICAgICAvLyBwaXAgY29udGFpbmVyKSBpZiBpdCBpcyBub3QgdmlzaWJsZSBvbiBzY3JlZW46IGVpdGhlciBiZWNhdXNlIHdlIGFyZVxuICAgICAgICAvLyB2aWV3aW5nIGEgZGlmZmVyZW50IHJvb20gT1IgYmVjYXVzZSBpdCBpcyBpbiBub25lIG9mIHRoZSBwb3NzaWJsZVxuICAgICAgICAvLyBjb250YWluZXJzIG9mIHRoZSByb29tIHZpZXcuXG4gICAgICAgIGNvbnN0IHNob3dXaWRnZXRJblBpcCA9IGZyb21Bbm90aGVyUm9vbSB8fCBub3REb2NrZWQ7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dXaWRnZXRJblBpcCwgcGVyc2lzdGVudFdpZGdldElkLCBwZXJzaXN0ZW50Um9vbUlkIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHBpcE1vZGUgPSB0cnVlO1xuICAgICAgICBsZXQgcGlwQ29udGVudDtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wcmltYXJ5Q2FsbCkge1xuICAgICAgICAgICAgcGlwQ29udGVudCA9ICh7IG9uU3RhcnRNb3ZpbmcsIG9uUmVzaXplIH0pID0+XG4gICAgICAgICAgICAgICAgPExlZ2FjeUNhbGxWaWV3XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duT25IZWFkZXI9e29uU3RhcnRNb3Zpbmd9XG4gICAgICAgICAgICAgICAgICAgIGNhbGw9e3RoaXMuc3RhdGUucHJpbWFyeUNhbGx9XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeUNhbGw9e3RoaXMuc3RhdGUuc2Vjb25kYXJ5Q2FsbH1cbiAgICAgICAgICAgICAgICAgICAgcGlwTW9kZT17cGlwTW9kZX1cbiAgICAgICAgICAgICAgICAgICAgb25SZXNpemU9e29uUmVzaXplfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd1dpZGdldEluUGlwKSB7XG4gICAgICAgICAgICBjb25zdCBwaXBWaWV3Q2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIG14X0xlZ2FjeUNhbGxWaWV3OiB0cnVlLFxuICAgICAgICAgICAgICAgIG14X0xlZ2FjeUNhbGxWaWV3X3BpcDogcGlwTW9kZSxcbiAgICAgICAgICAgICAgICBteF9MZWdhY3lDYWxsVmlld19sYXJnZTogIXBpcE1vZGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMuc3RhdGUucGVyc2lzdGVudFJvb21JZDtcbiAgICAgICAgICAgIGNvbnN0IHJvb21Gb3JXaWRnZXQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgY29uc3Qgdmlld2luZ0NhbGxSb29tID0gdGhpcy5zdGF0ZS52aWV3ZWRSb29tSWQgPT09IHJvb21JZDtcblxuICAgICAgICAgICAgcGlwQ29udGVudCA9ICh7IG9uU3RhcnRNb3ZpbmcsIF9vblJlc2l6ZSB9KSA9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtwaXBWaWV3Q2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIDxMZWdhY3lDYWxsVmlld0hlYWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgb25QaXBNb3VzZURvd249eyhldmVudCkgPT4geyBvblN0YXJ0TW92aW5nKGV2ZW50KTsgdGhpcy5vblN0YXJ0TW92aW5nLmJpbmQodGhpcykoKTsgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBpcE1vZGU9e3BpcE1vZGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsUm9vbXM9e1tyb29tRm9yV2lkZ2V0XX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXhwYW5kPXshdmlld2luZ0NhbGxSb29tICYmIHRoaXMub25FeHBhbmR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblBpbj17dmlld2luZ0NhbGxSb29tICYmIHRoaXMub25QaW59XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1heGltaXplPXt2aWV3aW5nQ2FsbFJvb20gJiYgdGhpcy5vbk1heGltaXplfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8UGVyc2lzdGVudEFwcFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyc2lzdGVudFdpZGdldElkPXt0aGlzLnN0YXRlLnBlcnNpc3RlbnRXaWRnZXRJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNpc3RlbnRSb29tSWQ9e3Jvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50ZXJFdmVudHM9e3RoaXMuc3RhdGUubW92aW5nID8gJ25vbmUnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZVBlcnNpc3RlZEVsZW1lbnQ9e3RoaXMubW92ZVBlcnNpc3RlZEVsZW1lbnR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEhcGlwQ29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIDxQaWN0dXJlSW5QaWN0dXJlRHJhZ2dlclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxQcmV2aWV3XCJcbiAgICAgICAgICAgICAgICBkcmFnZ2FibGU9e3BpcE1vZGV9XG4gICAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5vbkRvdWJsZUNsaWNrfVxuICAgICAgICAgICAgICAgIG9uTW92ZT17dGhpcy5vbk1vdmV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBwaXBDb250ZW50IH1cbiAgICAgICAgICAgIDwvUGljdHVyZUluUGljdHVyZURyYWdnZXI+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXdCQSxNQUFNQSxtQkFBbUIsR0FBRyxDQUN4QkMsZUFBQSxDQUFVQyxTQURjLEVBRXhCRCxlQUFBLENBQVVFLFVBRmMsRUFHeEJGLGVBQUEsQ0FBVUcsVUFIYyxFQUl4QkgsZUFBQSxDQUFVSSxZQUpjLEVBS3hCSixlQUFBLENBQVVLLFdBTGMsRUFNeEJMLGVBQUEsQ0FBVU0sY0FOYyxDQUE1Qjs7QUE4QkEsTUFBTUMsc0JBQXNC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