"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _logger = require("matrix-js-sdk/src/logger");

var _crypto = require("matrix-js-sdk/src/crypto");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _verification = require("../../verification");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _RightPanelStorePhases = require("./RightPanelStorePhases");

var _SettingLevel = require("../../settings/SettingLevel");

var _AsyncStore = require("../AsyncStore");

var _ReadyWatchingStore = require("../ReadyWatchingStore");

var _RightPanelStoreIPanelState = require("./RightPanelStoreIPanelState");

var _actions = require("../../dispatcher/actions");

var _RoomViewStore = require("../RoomViewStore");

/*
Copyright 2019-2022 The Matrix.org Foundation C.I.C.

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

/**
 * A class for tracking the state of the right panel between layouts and
 * sessions. This state includes a history for each room. Each history element
 * contains the phase (e.g. RightPanelPhase.RoomMemberInfo) and the state (e.g.
 * the member) associated with it.
*/
class RightPanelStore extends _ReadyWatchingStore.ReadyWatchingStore {
  constructor() {
    super(_dispatcher.default);
    (0, _defineProperty2.default)(this, "global", void 0);
    (0, _defineProperty2.default)(this, "byRoom", void 0);
    (0, _defineProperty2.default)(this, "viewedRoomId", void 0);
    (0, _defineProperty2.default)(this, "onVerificationRequestUpdate", () => {
      if (!this.currentCard?.state) return;
      const {
        member
      } = this.currentCard.state;
      if (!member) return;
      const pendingRequest = (0, _verification.pendingVerificationRequestForUser)(member);

      if (pendingRequest) {
        this.currentCard.state.verificationRequest = pendingRequest;
        this.emitAndUpdateSettings();
      }
    });
    this.reset();
  }
  /**
   * Resets the store. Intended for test usage only.
   */


  reset() {
    this.global = null;
    this.byRoom = {};
    this.viewedRoomId = null;
  }

  async onReady() {
    this.viewedRoomId = _RoomViewStore.RoomViewStore.instance.getRoomId();
    this.matrixClient.on(_crypto.CryptoEvent.VerificationRequest, this.onVerificationRequestUpdate);
    this.loadCacheFromSettings();
    this.emitAndUpdateSettings();
  }

  async onNotReady() {
    this.matrixClient.off(_crypto.CryptoEvent.VerificationRequest, this.onVerificationRequestUpdate);
  }

  onDispatcherAction(payload) {
    if (payload.action !== _actions.Action.ActiveRoomChanged) return;
    const changePayload = payload;
    this.handleViewedRoomChange(changePayload.oldRoomId, changePayload.newRoomId);
  } // Getters

  /**
   * If you are calling this from a component that already knows about a
   * specific room from props / state, then it's best to prefer
   * `isOpenForRoom` below to ensure all your data is for a single room
   * during room changes.
   */


  get isOpen() {
    return this.byRoom[this.viewedRoomId]?.isOpen ?? false;
  }

  isOpenForRoom(roomId) {
    return this.byRoom[roomId]?.isOpen ?? false;
  }

  get roomPhaseHistory() {
    return this.byRoom[this.viewedRoomId]?.history ?? [];
  }
  /**
   * If you are calling this from a component that already knows about a
   * specific room from props / state, then it's best to prefer
   * `currentCardForRoom` below to ensure all your data is for a single room
   * during room changes.
   */


  get currentCard() {
    const hist = this.roomPhaseHistory;

    if (hist.length >= 1) {
      return hist[hist.length - 1];
    }

    return {
      state: {},
      phase: null
    };
  }

  currentCardForRoom(roomId) {
    const hist = this.byRoom[roomId]?.history ?? [];

    if (hist.length > 0) {
      return hist[hist.length - 1];
    }

    return {
      state: {},
      phase: null
    };
  }

  get previousCard() {
    const hist = this.roomPhaseHistory;

    if (hist?.length >= 2) {
      return hist[hist.length - 2];
    }

    return {
      state: {},
      phase: null
    };
  } // Setters


  setCard(card) {
    let allowClose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let roomId = arguments.length > 2 ? arguments[2] : undefined;
    const rId = roomId ?? this.viewedRoomId; // This function behaves as following:
    // Update state: if the same phase is send but with a state
    // Set right panel and erase history: if a "different to the current" phase is send (with or without a state)
    // If the right panel is set, this function also shows the right panel.

    const redirect = this.getVerificationRedirect(card);
    const targetPhase = redirect?.phase ?? card.phase;
    const cardState = redirect?.state ?? (Object.keys(card.state ?? {}).length === 0 ? null : card.state); // Checks for wrong SetRightPanelPhase requests

    if (!this.isPhaseValid(targetPhase, Boolean(rId))) return;

    if (targetPhase === this.currentCardForRoom(rId)?.phase && !!cardState) {
      // Update state: set right panel with a new state but keep the phase (don't know it this is ever needed...)
      const hist = this.byRoom[rId]?.history ?? [];
      hist[hist.length - 1].state = cardState;
      this.emitAndUpdateSettings();
    } else if (targetPhase !== this.currentCardForRoom(rId)?.phase || !this.byRoom[rId]) {
      // Set right panel and initialize/erase history
      const history = [{
        phase: targetPhase,
        state: cardState ?? {}
      }];
      this.byRoom[rId] = {
        history,
        isOpen: true
      };
      this.emitAndUpdateSettings();
    } else {
      this.show(rId);
      this.emitAndUpdateSettings();
    }
  }

  setCards(cards) {
    let allowClose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let roomId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    // This function sets the history of the right panel and shows the right panel if not already visible.
    const rId = roomId ?? this.viewedRoomId;
    const history = cards.map(c => ({
      phase: c.phase,
      state: c.state ?? {}
    }));
    this.byRoom[rId] = {
      history,
      isOpen: true
    };
    this.show(rId);
    this.emitAndUpdateSettings();
  } // Appends a card to the history and shows the right panel if not already visible


  pushCard(card) {
    let allowClose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let roomId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    const rId = roomId ?? this.viewedRoomId;
    const redirect = this.getVerificationRedirect(card);
    const targetPhase = redirect?.phase ?? card.phase;
    const pState = redirect?.state ?? card.state ?? {}; // Checks for wrong SetRightPanelPhase requests

    if (!this.isPhaseValid(targetPhase, Boolean(rId))) return;
    const roomCache = this.byRoom[rId];

    if (!!roomCache) {
      // append new phase
      roomCache.history.push({
        state: pState,
        phase: targetPhase
      });
      roomCache.isOpen = allowClose ? roomCache.isOpen : true;
    } else {
      // setup room panel cache with the new card
      this.byRoom[rId] = {
        history: [{
          phase: targetPhase,
          state: pState
        }],
        // if there was no right panel store object the the panel was closed -> keep it closed, except if allowClose==false
        isOpen: !allowClose
      };
    }

    this.show(rId);
    this.emitAndUpdateSettings();
  }

  popCard() {
    let roomId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    const rId = roomId ?? this.viewedRoomId;
    if (!this.byRoom[rId]) return;
    const removedCard = this.byRoom[rId].history.pop();
    this.emitAndUpdateSettings();
    return removedCard;
  }

  togglePanel(roomId) {
    const rId = roomId ?? this.viewedRoomId;
    if (!this.byRoom[rId]) return;
    this.byRoom[rId].isOpen = !this.byRoom[rId].isOpen;
    this.emitAndUpdateSettings();
  }

  show(roomId) {
    if (!this.isOpenForRoom(roomId ?? this.viewedRoomId)) {
      this.togglePanel(roomId);
    }
  }

  hide(roomId) {
    if (this.isOpenForRoom(roomId ?? this.viewedRoomId)) {
      this.togglePanel(roomId);
    }
  }

  loadCacheFromSettings() {
    if (this.viewedRoomId) {
      const room = this.mxClient?.getRoom(this.viewedRoomId);

      if (!!room) {
        this.global = this.global ?? (0, _RightPanelStoreIPanelState.convertToStatePanel)(_SettingsStore.default.getValue("RightPanel.phasesGlobal"), room);
        this.byRoom[this.viewedRoomId] = this.byRoom[this.viewedRoomId] ?? (0, _RightPanelStoreIPanelState.convertToStatePanel)(_SettingsStore.default.getValue("RightPanel.phases", this.viewedRoomId), room);
      } else {
        _logger.logger.warn("Could not restore the right panel after load because there was no associated room object.");
      }
    }
  }

  emitAndUpdateSettings() {
    this.filterValidCards(this.global);
    const storePanelGlobal = (0, _RightPanelStoreIPanelState.convertToStorePanel)(this.global);

    _SettingsStore.default.setValue("RightPanel.phasesGlobal", null, _SettingLevel.SettingLevel.DEVICE, storePanelGlobal);

    if (!!this.viewedRoomId) {
      const panelThisRoom = this.byRoom[this.viewedRoomId];
      this.filterValidCards(panelThisRoom);
      const storePanelThisRoom = (0, _RightPanelStoreIPanelState.convertToStorePanel)(panelThisRoom);

      _SettingsStore.default.setValue("RightPanel.phases", this.viewedRoomId, _SettingLevel.SettingLevel.ROOM_DEVICE, storePanelThisRoom);
    }

    this.emit(_AsyncStore.UPDATE_EVENT, null);
  }

  filterValidCards(rightPanelForRoom) {
    if (!rightPanelForRoom?.history) return;
    rightPanelForRoom.history = rightPanelForRoom.history.filter(card => this.isCardStateValid(card));

    if (!rightPanelForRoom.history.length) {
      rightPanelForRoom.isOpen = false;
    }
  }

  isCardStateValid(card) {
    // this function does a sanity check on the card. this is required because
    // some phases require specific state properties that might not be available.
    // This can be caused on if element is reloaded and the tries to reload right panel data from id's stored in the local storage.
    // we store id's of users and matrix events. If are not yet fetched on reload the right panel cannot display them.
    // or potentially other errors.
    // (A nicer fix could be to indicate, that the right panel is loading if there is missing state data and re-emit if the data is available)
    switch (card.phase) {
      case _RightPanelStorePhases.RightPanelPhases.ThreadPanel:
        if (!_SettingsStore.default.getValue("feature_thread")) return false;
        break;

      case _RightPanelStorePhases.RightPanelPhases.ThreadView:
        if (!_SettingsStore.default.getValue("feature_thread")) return false;

        if (!card.state.threadHeadEvent) {
          _logger.logger.warn("removed card from right panel because of missing threadHeadEvent in card state");
        }

        return !!card.state.threadHeadEvent;

      case _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo:
      case _RightPanelStorePhases.RightPanelPhases.SpaceMemberInfo:
      case _RightPanelStorePhases.RightPanelPhases.EncryptionPanel:
        if (!card.state.member) {
          _logger.logger.warn("removed card from right panel because of missing member in card state");
        }

        return !!card.state.member;

      case _RightPanelStorePhases.RightPanelPhases.Room3pidMemberInfo:
      case _RightPanelStorePhases.RightPanelPhases.Space3pidMemberInfo:
        if (!card.state.memberInfoEvent) {
          _logger.logger.warn("removed card from right panel because of missing memberInfoEvent in card state");
        }

        return !!card.state.memberInfoEvent;

      case _RightPanelStorePhases.RightPanelPhases.Widget:
        if (!card.state.widgetId) {
          _logger.logger.warn("removed card from right panel because of missing widgetId in card state");
        }

        return !!card.state.widgetId;
    }

    return true;
  }

  getVerificationRedirect(card) {
    if (card.phase === _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo && card.state) {
      // RightPanelPhases.RoomMemberInfo -> needs to be changed to RightPanelPhases.EncryptionPanel if there is a pending verification request
      const {
        member
      } = card.state;
      const pendingRequest = (0, _verification.pendingVerificationRequestForUser)(member);

      if (pendingRequest) {
        return {
          phase: _RightPanelStorePhases.RightPanelPhases.EncryptionPanel,
          state: {
            verificationRequest: pendingRequest,
            member
          }
        };
      }
    }

    return null;
  }

  isPhaseValid(targetPhase, isViewingRoom) {
    if (!_RightPanelStorePhases.RightPanelPhases[targetPhase]) {
      _logger.logger.warn(`Tried to switch right panel to unknown phase: ${targetPhase}`);

      return false;
    }

    if (!isViewingRoom) {
      _logger.logger.warn(`Tried to switch right panel to a room phase: ${targetPhase}, ` + `but we are currently not viewing a room`);

      return false;
    }

    return true;
  }

  handleViewedRoomChange(oldRoomId, newRoomId) {
    if (!this.mxClient) return; // not ready, onReady will handle the first room

    this.viewedRoomId = newRoomId; // load values from byRoomCache with the viewedRoomId.

    this.loadCacheFromSettings(); // when we're switching to a room, clear out any stale MemberInfo cards
    // in order to fix https://github.com/vector-im/element-web/issues/21487

    if (this.currentCard?.phase !== _RightPanelStorePhases.RightPanelPhases.EncryptionPanel) {
      const panel = this.byRoom[this.viewedRoomId];

      if (panel?.history) {
        panel.history = panel.history.filter(card => card.phase != _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo && card.phase != _RightPanelStorePhases.RightPanelPhases.Room3pidMemberInfo);
      }
    } // If the right panel stays open mode is used, and the panel was either
    // closed or never shown for that room, then force it open and display
    // the room member list.


    if (_SettingsStore.default.getValue("feature_right_panel_default_open") && !this.byRoom[this.viewedRoomId]?.isOpen) {
      const history = [{
        phase: _RightPanelStorePhases.RightPanelPhases.RoomMemberList
      }];
      const room = this.viewedRoomId && this.mxClient?.getRoom(this.viewedRoomId);

      if (!room?.isSpaceRoom()) {
        history.unshift({
          phase: _RightPanelStorePhases.RightPanelPhases.RoomSummary
        });
      }

      this.byRoom[this.viewedRoomId] = {
        isOpen: true,
        history
      };
    }

    this.emitAndUpdateSettings();
  }

  static get instance() {
    if (!this.internalInstance) {
      this.internalInstance = new RightPanelStore();
      this.internalInstance.start();
    }

    return this.internalInstance;
  }

}

exports.default = RightPanelStore;
(0, _defineProperty2.default)(RightPanelStore, "internalInstance", void 0);
window.mxRightPanelStore = RightPanelStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSaWdodFBhbmVsU3RvcmUiLCJSZWFkeVdhdGNoaW5nU3RvcmUiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHREaXNwYXRjaGVyIiwiY3VycmVudENhcmQiLCJzdGF0ZSIsIm1lbWJlciIsInBlbmRpbmdSZXF1ZXN0IiwicGVuZGluZ1ZlcmlmaWNhdGlvblJlcXVlc3RGb3JVc2VyIiwidmVyaWZpY2F0aW9uUmVxdWVzdCIsImVtaXRBbmRVcGRhdGVTZXR0aW5ncyIsInJlc2V0IiwiZ2xvYmFsIiwiYnlSb29tIiwidmlld2VkUm9vbUlkIiwib25SZWFkeSIsIlJvb21WaWV3U3RvcmUiLCJpbnN0YW5jZSIsImdldFJvb21JZCIsIm1hdHJpeENsaWVudCIsIm9uIiwiQ3J5cHRvRXZlbnQiLCJWZXJpZmljYXRpb25SZXF1ZXN0Iiwib25WZXJpZmljYXRpb25SZXF1ZXN0VXBkYXRlIiwibG9hZENhY2hlRnJvbVNldHRpbmdzIiwib25Ob3RSZWFkeSIsIm9mZiIsIm9uRGlzcGF0Y2hlckFjdGlvbiIsInBheWxvYWQiLCJhY3Rpb24iLCJBY3Rpb24iLCJBY3RpdmVSb29tQ2hhbmdlZCIsImNoYW5nZVBheWxvYWQiLCJoYW5kbGVWaWV3ZWRSb29tQ2hhbmdlIiwib2xkUm9vbUlkIiwibmV3Um9vbUlkIiwiaXNPcGVuIiwiaXNPcGVuRm9yUm9vbSIsInJvb21JZCIsInJvb21QaGFzZUhpc3RvcnkiLCJoaXN0b3J5IiwiaGlzdCIsImxlbmd0aCIsInBoYXNlIiwiY3VycmVudENhcmRGb3JSb29tIiwicHJldmlvdXNDYXJkIiwic2V0Q2FyZCIsImNhcmQiLCJhbGxvd0Nsb3NlIiwicklkIiwicmVkaXJlY3QiLCJnZXRWZXJpZmljYXRpb25SZWRpcmVjdCIsInRhcmdldFBoYXNlIiwiY2FyZFN0YXRlIiwiT2JqZWN0Iiwia2V5cyIsImlzUGhhc2VWYWxpZCIsIkJvb2xlYW4iLCJzaG93Iiwic2V0Q2FyZHMiLCJjYXJkcyIsIm1hcCIsImMiLCJwdXNoQ2FyZCIsInBTdGF0ZSIsInJvb21DYWNoZSIsInB1c2giLCJwb3BDYXJkIiwicmVtb3ZlZENhcmQiLCJwb3AiLCJ0b2dnbGVQYW5lbCIsImhpZGUiLCJyb29tIiwibXhDbGllbnQiLCJnZXRSb29tIiwiY29udmVydFRvU3RhdGVQYW5lbCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImxvZ2dlciIsIndhcm4iLCJmaWx0ZXJWYWxpZENhcmRzIiwic3RvcmVQYW5lbEdsb2JhbCIsImNvbnZlcnRUb1N0b3JlUGFuZWwiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsInBhbmVsVGhpc1Jvb20iLCJzdG9yZVBhbmVsVGhpc1Jvb20iLCJST09NX0RFVklDRSIsImVtaXQiLCJVUERBVEVfRVZFTlQiLCJyaWdodFBhbmVsRm9yUm9vbSIsImZpbHRlciIsImlzQ2FyZFN0YXRlVmFsaWQiLCJSaWdodFBhbmVsUGhhc2VzIiwiVGhyZWFkUGFuZWwiLCJUaHJlYWRWaWV3IiwidGhyZWFkSGVhZEV2ZW50IiwiUm9vbU1lbWJlckluZm8iLCJTcGFjZU1lbWJlckluZm8iLCJFbmNyeXB0aW9uUGFuZWwiLCJSb29tM3BpZE1lbWJlckluZm8iLCJTcGFjZTNwaWRNZW1iZXJJbmZvIiwibWVtYmVySW5mb0V2ZW50IiwiV2lkZ2V0Iiwid2lkZ2V0SWQiLCJpc1ZpZXdpbmdSb29tIiwicGFuZWwiLCJSb29tTWVtYmVyTGlzdCIsImlzU3BhY2VSb29tIiwidW5zaGlmdCIsIlJvb21TdW1tYXJ5IiwiaW50ZXJuYWxJbnN0YW5jZSIsInN0YXJ0Iiwid2luZG93IiwibXhSaWdodFBhbmVsU3RvcmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTktMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IENyeXB0b0V2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0b1wiO1xuaW1wb3J0IHsgT3B0aW9uYWwgfSBmcm9tIFwibWF0cml4LWV2ZW50cy1zZGtcIjtcblxuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBwZW5kaW5nVmVyaWZpY2F0aW9uUmVxdWVzdEZvclVzZXIgfSBmcm9tICcuLi8uLi92ZXJpZmljYXRpb24nO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFJpZ2h0UGFuZWxQaGFzZXMgfSBmcm9tIFwiLi9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gJy4uL0FzeW5jU3RvcmUnO1xuaW1wb3J0IHsgUmVhZHlXYXRjaGluZ1N0b3JlIH0gZnJvbSAnLi4vUmVhZHlXYXRjaGluZ1N0b3JlJztcbmltcG9ydCB7XG4gICAgY29udmVydFRvU3RhdGVQYW5lbCxcbiAgICBjb252ZXJ0VG9TdG9yZVBhbmVsLFxuICAgIElSaWdodFBhbmVsQ2FyZCxcbiAgICBJUmlnaHRQYW5lbEZvclJvb20sXG59IGZyb20gJy4vUmlnaHRQYW5lbFN0b3JlSVBhbmVsU3RhdGUnO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBBY3RpdmVSb29tQ2hhbmdlZFBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9BY3RpdmVSb29tQ2hhbmdlZFBheWxvYWRcIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi4vUm9vbVZpZXdTdG9yZVwiO1xuXG4vKipcbiAqIEEgY2xhc3MgZm9yIHRyYWNraW5nIHRoZSBzdGF0ZSBvZiB0aGUgcmlnaHQgcGFuZWwgYmV0d2VlbiBsYXlvdXRzIGFuZFxuICogc2Vzc2lvbnMuIFRoaXMgc3RhdGUgaW5jbHVkZXMgYSBoaXN0b3J5IGZvciBlYWNoIHJvb20uIEVhY2ggaGlzdG9yeSBlbGVtZW50XG4gKiBjb250YWlucyB0aGUgcGhhc2UgKGUuZy4gUmlnaHRQYW5lbFBoYXNlLlJvb21NZW1iZXJJbmZvKSBhbmQgdGhlIHN0YXRlIChlLmcuXG4gKiB0aGUgbWVtYmVyKSBhc3NvY2lhdGVkIHdpdGggaXQuXG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmlnaHRQYW5lbFN0b3JlIGV4dGVuZHMgUmVhZHlXYXRjaGluZ1N0b3JlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBpbnRlcm5hbEluc3RhbmNlOiBSaWdodFBhbmVsU3RvcmU7XG5cbiAgICBwcml2YXRlIGdsb2JhbD86IElSaWdodFBhbmVsRm9yUm9vbTtcbiAgICBwcml2YXRlIGJ5Um9vbTogeyBbcm9vbUlkOiBzdHJpbmddOiBJUmlnaHRQYW5lbEZvclJvb20gfTtcbiAgICBwcml2YXRlIHZpZXdlZFJvb21JZDogT3B0aW9uYWw8c3RyaW5nPjtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKGRlZmF1bHREaXNwYXRjaGVyKTtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGUgc3RvcmUuIEludGVuZGVkIGZvciB0ZXN0IHVzYWdlIG9ubHkuXG4gICAgICovXG4gICAgcHVibGljIHJlc2V0KCkge1xuICAgICAgICB0aGlzLmdsb2JhbCA9IG51bGw7XG4gICAgICAgIHRoaXMuYnlSb29tID0ge307XG4gICAgICAgIHRoaXMudmlld2VkUm9vbUlkID0gbnVsbDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25SZWFkeSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aGlzLnZpZXdlZFJvb21JZCA9IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCk7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50Lm9uKENyeXB0b0V2ZW50LlZlcmlmaWNhdGlvblJlcXVlc3QsIHRoaXMub25WZXJpZmljYXRpb25SZXF1ZXN0VXBkYXRlKTtcbiAgICAgICAgdGhpcy5sb2FkQ2FjaGVGcm9tU2V0dGluZ3MoKTtcbiAgICAgICAgdGhpcy5lbWl0QW5kVXBkYXRlU2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25Ob3RSZWFkeSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5vZmYoQ3J5cHRvRXZlbnQuVmVyaWZpY2F0aW9uUmVxdWVzdCwgdGhpcy5vblZlcmlmaWNhdGlvblJlcXVlc3RVcGRhdGUpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBvbkRpc3BhdGNoZXJBY3Rpb24ocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gIT09IEFjdGlvbi5BY3RpdmVSb29tQ2hhbmdlZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNoYW5nZVBheWxvYWQgPSA8QWN0aXZlUm9vbUNoYW5nZWRQYXlsb2FkPnBheWxvYWQ7XG4gICAgICAgIHRoaXMuaGFuZGxlVmlld2VkUm9vbUNoYW5nZShjaGFuZ2VQYXlsb2FkLm9sZFJvb21JZCwgY2hhbmdlUGF5bG9hZC5uZXdSb29tSWQpO1xuICAgIH1cblxuICAgIC8vIEdldHRlcnNcbiAgICAvKipcbiAgICAgKiBJZiB5b3UgYXJlIGNhbGxpbmcgdGhpcyBmcm9tIGEgY29tcG9uZW50IHRoYXQgYWxyZWFkeSBrbm93cyBhYm91dCBhXG4gICAgICogc3BlY2lmaWMgcm9vbSBmcm9tIHByb3BzIC8gc3RhdGUsIHRoZW4gaXQncyBiZXN0IHRvIHByZWZlclxuICAgICAqIGBpc09wZW5Gb3JSb29tYCBiZWxvdyB0byBlbnN1cmUgYWxsIHlvdXIgZGF0YSBpcyBmb3IgYSBzaW5nbGUgcm9vbVxuICAgICAqIGR1cmluZyByb29tIGNoYW5nZXMuXG4gICAgICovXG4gICAgcHVibGljIGdldCBpc09wZW4oKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ5Um9vbVt0aGlzLnZpZXdlZFJvb21JZF0/LmlzT3BlbiA/PyBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNPcGVuRm9yUm9vbShyb29tSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5ieVJvb21bcm9vbUlkXT8uaXNPcGVuID8/IGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcm9vbVBoYXNlSGlzdG9yeSgpOiBBcnJheTxJUmlnaHRQYW5lbENhcmQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnlSb29tW3RoaXMudmlld2VkUm9vbUlkXT8uaGlzdG9yeSA/PyBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiB5b3UgYXJlIGNhbGxpbmcgdGhpcyBmcm9tIGEgY29tcG9uZW50IHRoYXQgYWxyZWFkeSBrbm93cyBhYm91dCBhXG4gICAgICogc3BlY2lmaWMgcm9vbSBmcm9tIHByb3BzIC8gc3RhdGUsIHRoZW4gaXQncyBiZXN0IHRvIHByZWZlclxuICAgICAqIGBjdXJyZW50Q2FyZEZvclJvb21gIGJlbG93IHRvIGVuc3VyZSBhbGwgeW91ciBkYXRhIGlzIGZvciBhIHNpbmdsZSByb29tXG4gICAgICogZHVyaW5nIHJvb20gY2hhbmdlcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGN1cnJlbnRDYXJkKCk6IElSaWdodFBhbmVsQ2FyZCB7XG4gICAgICAgIGNvbnN0IGhpc3QgPSB0aGlzLnJvb21QaGFzZUhpc3Rvcnk7XG4gICAgICAgIGlmIChoaXN0Lmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gaGlzdFtoaXN0Lmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXRlOiB7fSwgcGhhc2U6IG51bGwgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3VycmVudENhcmRGb3JSb29tKHJvb21JZDogc3RyaW5nKTogSVJpZ2h0UGFuZWxDYXJkIHtcbiAgICAgICAgY29uc3QgaGlzdCA9IHRoaXMuYnlSb29tW3Jvb21JZF0/Lmhpc3RvcnkgPz8gW107XG4gICAgICAgIGlmIChoaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBoaXN0W2hpc3QubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IHt9LCBwaGFzZTogbnVsbCB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcHJldmlvdXNDYXJkKCk6IElSaWdodFBhbmVsQ2FyZCB7XG4gICAgICAgIGNvbnN0IGhpc3QgPSB0aGlzLnJvb21QaGFzZUhpc3Rvcnk7XG4gICAgICAgIGlmIChoaXN0Py5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgcmV0dXJuIGhpc3RbaGlzdC5sZW5ndGggLSAyXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0ZToge30sIHBoYXNlOiBudWxsIH07XG4gICAgfVxuXG4gICAgLy8gU2V0dGVyc1xuICAgIHB1YmxpYyBzZXRDYXJkKGNhcmQ6IElSaWdodFBhbmVsQ2FyZCwgYWxsb3dDbG9zZSA9IHRydWUsIHJvb21JZD86IHN0cmluZykge1xuICAgICAgICBjb25zdCBySWQgPSByb29tSWQgPz8gdGhpcy52aWV3ZWRSb29tSWQ7XG4gICAgICAgIC8vIFRoaXMgZnVuY3Rpb24gYmVoYXZlcyBhcyBmb2xsb3dpbmc6XG4gICAgICAgIC8vIFVwZGF0ZSBzdGF0ZTogaWYgdGhlIHNhbWUgcGhhc2UgaXMgc2VuZCBidXQgd2l0aCBhIHN0YXRlXG4gICAgICAgIC8vIFNldCByaWdodCBwYW5lbCBhbmQgZXJhc2UgaGlzdG9yeTogaWYgYSBcImRpZmZlcmVudCB0byB0aGUgY3VycmVudFwiIHBoYXNlIGlzIHNlbmQgKHdpdGggb3Igd2l0aG91dCBhIHN0YXRlKVxuICAgICAgICAvLyBJZiB0aGUgcmlnaHQgcGFuZWwgaXMgc2V0LCB0aGlzIGZ1bmN0aW9uIGFsc28gc2hvd3MgdGhlIHJpZ2h0IHBhbmVsLlxuICAgICAgICBjb25zdCByZWRpcmVjdCA9IHRoaXMuZ2V0VmVyaWZpY2F0aW9uUmVkaXJlY3QoY2FyZCk7XG4gICAgICAgIGNvbnN0IHRhcmdldFBoYXNlID0gcmVkaXJlY3Q/LnBoYXNlID8/IGNhcmQucGhhc2U7XG4gICAgICAgIGNvbnN0IGNhcmRTdGF0ZSA9IHJlZGlyZWN0Py5zdGF0ZSA/PyAoT2JqZWN0LmtleXMoY2FyZC5zdGF0ZSA/PyB7fSkubGVuZ3RoID09PSAwID8gbnVsbCA6IGNhcmQuc3RhdGUpO1xuXG4gICAgICAgIC8vIENoZWNrcyBmb3Igd3JvbmcgU2V0UmlnaHRQYW5lbFBoYXNlIHJlcXVlc3RzXG4gICAgICAgIGlmICghdGhpcy5pc1BoYXNlVmFsaWQodGFyZ2V0UGhhc2UsIEJvb2xlYW4ocklkKSkpIHJldHVybjtcblxuICAgICAgICBpZiAoKHRhcmdldFBoYXNlID09PSB0aGlzLmN1cnJlbnRDYXJkRm9yUm9vbShySWQpPy5waGFzZSAmJiAhIWNhcmRTdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBzdGF0ZTogc2V0IHJpZ2h0IHBhbmVsIHdpdGggYSBuZXcgc3RhdGUgYnV0IGtlZXAgdGhlIHBoYXNlIChkb24ndCBrbm93IGl0IHRoaXMgaXMgZXZlciBuZWVkZWQuLi4pXG4gICAgICAgICAgICBjb25zdCBoaXN0ID0gdGhpcy5ieVJvb21bcklkXT8uaGlzdG9yeSA/PyBbXTtcbiAgICAgICAgICAgIGhpc3RbaGlzdC5sZW5ndGggLSAxXS5zdGF0ZSA9IGNhcmRTdGF0ZTtcbiAgICAgICAgICAgIHRoaXMuZW1pdEFuZFVwZGF0ZVNldHRpbmdzKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0UGhhc2UgIT09IHRoaXMuY3VycmVudENhcmRGb3JSb29tKHJJZCk/LnBoYXNlIHx8ICF0aGlzLmJ5Um9vbVtySWRdKSB7XG4gICAgICAgICAgICAvLyBTZXQgcmlnaHQgcGFuZWwgYW5kIGluaXRpYWxpemUvZXJhc2UgaGlzdG9yeVxuICAgICAgICAgICAgY29uc3QgaGlzdG9yeSA9IFt7IHBoYXNlOiB0YXJnZXRQaGFzZSwgc3RhdGU6IGNhcmRTdGF0ZSA/PyB7fSB9XTtcbiAgICAgICAgICAgIHRoaXMuYnlSb29tW3JJZF0gPSB7IGhpc3RvcnksIGlzT3BlbjogdHJ1ZSB9O1xuICAgICAgICAgICAgdGhpcy5lbWl0QW5kVXBkYXRlU2V0dGluZ3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2hvdyhySWQpO1xuICAgICAgICAgICAgdGhpcy5lbWl0QW5kVXBkYXRlU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDYXJkcyhjYXJkczogSVJpZ2h0UGFuZWxDYXJkW10sIGFsbG93Q2xvc2UgPSB0cnVlLCByb29tSWQ6IHN0cmluZyA9IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBmdW5jdGlvbiBzZXRzIHRoZSBoaXN0b3J5IG9mIHRoZSByaWdodCBwYW5lbCBhbmQgc2hvd3MgdGhlIHJpZ2h0IHBhbmVsIGlmIG5vdCBhbHJlYWR5IHZpc2libGUuXG4gICAgICAgIGNvbnN0IHJJZCA9IHJvb21JZCA/PyB0aGlzLnZpZXdlZFJvb21JZDtcbiAgICAgICAgY29uc3QgaGlzdG9yeSA9IGNhcmRzLm1hcChjID0+ICh7IHBoYXNlOiBjLnBoYXNlLCBzdGF0ZTogYy5zdGF0ZSA/PyB7fSB9KSk7XG4gICAgICAgIHRoaXMuYnlSb29tW3JJZF0gPSB7IGhpc3RvcnksIGlzT3BlbjogdHJ1ZSB9O1xuICAgICAgICB0aGlzLnNob3cocklkKTtcbiAgICAgICAgdGhpcy5lbWl0QW5kVXBkYXRlU2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICAvLyBBcHBlbmRzIGEgY2FyZCB0byB0aGUgaGlzdG9yeSBhbmQgc2hvd3MgdGhlIHJpZ2h0IHBhbmVsIGlmIG5vdCBhbHJlYWR5IHZpc2libGVcbiAgICBwdWJsaWMgcHVzaENhcmQoXG4gICAgICAgIGNhcmQ6IElSaWdodFBhbmVsQ2FyZCxcbiAgICAgICAgYWxsb3dDbG9zZSA9IHRydWUsXG4gICAgICAgIHJvb21JZDogc3RyaW5nID0gbnVsbCxcbiAgICApIHtcbiAgICAgICAgY29uc3QgcklkID0gcm9vbUlkID8/IHRoaXMudmlld2VkUm9vbUlkO1xuICAgICAgICBjb25zdCByZWRpcmVjdCA9IHRoaXMuZ2V0VmVyaWZpY2F0aW9uUmVkaXJlY3QoY2FyZCk7XG4gICAgICAgIGNvbnN0IHRhcmdldFBoYXNlID0gcmVkaXJlY3Q/LnBoYXNlID8/IGNhcmQucGhhc2U7XG4gICAgICAgIGNvbnN0IHBTdGF0ZSA9IHJlZGlyZWN0Py5zdGF0ZSA/PyBjYXJkLnN0YXRlID8/IHt9O1xuXG4gICAgICAgIC8vIENoZWNrcyBmb3Igd3JvbmcgU2V0UmlnaHRQYW5lbFBoYXNlIHJlcXVlc3RzXG4gICAgICAgIGlmICghdGhpcy5pc1BoYXNlVmFsaWQodGFyZ2V0UGhhc2UsIEJvb2xlYW4ocklkKSkpIHJldHVybjtcblxuICAgICAgICBjb25zdCByb29tQ2FjaGUgPSB0aGlzLmJ5Um9vbVtySWRdO1xuICAgICAgICBpZiAoISFyb29tQ2FjaGUpIHtcbiAgICAgICAgICAgIC8vIGFwcGVuZCBuZXcgcGhhc2VcbiAgICAgICAgICAgIHJvb21DYWNoZS5oaXN0b3J5LnB1c2goeyBzdGF0ZTogcFN0YXRlLCBwaGFzZTogdGFyZ2V0UGhhc2UgfSk7XG4gICAgICAgICAgICByb29tQ2FjaGUuaXNPcGVuID0gYWxsb3dDbG9zZSA/IHJvb21DYWNoZS5pc09wZW4gOiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2V0dXAgcm9vbSBwYW5lbCBjYWNoZSB3aXRoIHRoZSBuZXcgY2FyZFxuICAgICAgICAgICAgdGhpcy5ieVJvb21bcklkXSA9IHtcbiAgICAgICAgICAgICAgICBoaXN0b3J5OiBbeyBwaGFzZTogdGFyZ2V0UGhhc2UsIHN0YXRlOiBwU3RhdGUgfV0sXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgd2FzIG5vIHJpZ2h0IHBhbmVsIHN0b3JlIG9iamVjdCB0aGUgdGhlIHBhbmVsIHdhcyBjbG9zZWQgLT4ga2VlcCBpdCBjbG9zZWQsIGV4Y2VwdCBpZiBhbGxvd0Nsb3NlPT1mYWxzZVxuICAgICAgICAgICAgICAgIGlzT3BlbjogIWFsbG93Q2xvc2UsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2hvdyhySWQpO1xuICAgICAgICB0aGlzLmVtaXRBbmRVcGRhdGVTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBwb3BDYXJkKHJvb21JZDogc3RyaW5nID0gbnVsbCkge1xuICAgICAgICBjb25zdCBySWQgPSByb29tSWQgPz8gdGhpcy52aWV3ZWRSb29tSWQ7XG4gICAgICAgIGlmICghdGhpcy5ieVJvb21bcklkXSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlbW92ZWRDYXJkID0gdGhpcy5ieVJvb21bcklkXS5oaXN0b3J5LnBvcCgpO1xuICAgICAgICB0aGlzLmVtaXRBbmRVcGRhdGVTZXR0aW5ncygpO1xuICAgICAgICByZXR1cm4gcmVtb3ZlZENhcmQ7XG4gICAgfVxuXG4gICAgcHVibGljIHRvZ2dsZVBhbmVsKHJvb21JZDogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBjb25zdCBySWQgPSByb29tSWQgPz8gdGhpcy52aWV3ZWRSb29tSWQ7XG4gICAgICAgIGlmICghdGhpcy5ieVJvb21bcklkXSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuYnlSb29tW3JJZF0uaXNPcGVuID0gIXRoaXMuYnlSb29tW3JJZF0uaXNPcGVuO1xuICAgICAgICB0aGlzLmVtaXRBbmRVcGRhdGVTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzaG93KHJvb21JZDogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNPcGVuRm9yUm9vbShyb29tSWQgPz8gdGhpcy52aWV3ZWRSb29tSWQpKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZVBhbmVsKHJvb21JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaGlkZShyb29tSWQ6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuRm9yUm9vbShyb29tSWQgPz8gdGhpcy52aWV3ZWRSb29tSWQpKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZVBhbmVsKHJvb21JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRDYWNoZUZyb21TZXR0aW5ncygpIHtcbiAgICAgICAgaWYgKHRoaXMudmlld2VkUm9vbUlkKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5teENsaWVudD8uZ2V0Um9vbSh0aGlzLnZpZXdlZFJvb21JZCk7XG4gICAgICAgICAgICBpZiAoISFyb29tKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWwgPSB0aGlzLmdsb2JhbCA/P1xuICAgICAgICAgICAgICAgICAgICBjb252ZXJ0VG9TdGF0ZVBhbmVsKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJSaWdodFBhbmVsLnBoYXNlc0dsb2JhbFwiKSwgcm9vbSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ieVJvb21bdGhpcy52aWV3ZWRSb29tSWRdID0gdGhpcy5ieVJvb21bdGhpcy52aWV3ZWRSb29tSWRdID8/XG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnRUb1N0YXRlUGFuZWwoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlJpZ2h0UGFuZWwucGhhc2VzXCIsIHRoaXMudmlld2VkUm9vbUlkKSwgcm9vbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFxuICAgICAgICAgICAgICAgICAgICBcIkNvdWxkIG5vdCByZXN0b3JlIHRoZSByaWdodCBwYW5lbCBhZnRlciBsb2FkIGJlY2F1c2UgdGhlcmUgd2FzIG5vIGFzc29jaWF0ZWQgcm9vbSBvYmplY3QuXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZW1pdEFuZFVwZGF0ZVNldHRpbmdzKCkge1xuICAgICAgICB0aGlzLmZpbHRlclZhbGlkQ2FyZHModGhpcy5nbG9iYWwpO1xuICAgICAgICBjb25zdCBzdG9yZVBhbmVsR2xvYmFsID0gY29udmVydFRvU3RvcmVQYW5lbCh0aGlzLmdsb2JhbCk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJSaWdodFBhbmVsLnBoYXNlc0dsb2JhbFwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBzdG9yZVBhbmVsR2xvYmFsKTtcblxuICAgICAgICBpZiAoISF0aGlzLnZpZXdlZFJvb21JZCkge1xuICAgICAgICAgICAgY29uc3QgcGFuZWxUaGlzUm9vbSA9IHRoaXMuYnlSb29tW3RoaXMudmlld2VkUm9vbUlkXTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyVmFsaWRDYXJkcyhwYW5lbFRoaXNSb29tKTtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlUGFuZWxUaGlzUm9vbSA9IGNvbnZlcnRUb1N0b3JlUGFuZWwocGFuZWxUaGlzUm9vbSk7XG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFxuICAgICAgICAgICAgICAgIFwiUmlnaHRQYW5lbC5waGFzZXNcIixcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdlZFJvb21JZCxcbiAgICAgICAgICAgICAgICBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsXG4gICAgICAgICAgICAgICAgc3RvcmVQYW5lbFRoaXNSb29tLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX0VWRU5ULCBudWxsKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbHRlclZhbGlkQ2FyZHMocmlnaHRQYW5lbEZvclJvb20/OiBJUmlnaHRQYW5lbEZvclJvb20pIHtcbiAgICAgICAgaWYgKCFyaWdodFBhbmVsRm9yUm9vbT8uaGlzdG9yeSkgcmV0dXJuO1xuICAgICAgICByaWdodFBhbmVsRm9yUm9vbS5oaXN0b3J5ID0gcmlnaHRQYW5lbEZvclJvb20uaGlzdG9yeS5maWx0ZXIoKGNhcmQpID0+IHRoaXMuaXNDYXJkU3RhdGVWYWxpZChjYXJkKSk7XG4gICAgICAgIGlmICghcmlnaHRQYW5lbEZvclJvb20uaGlzdG9yeS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJpZ2h0UGFuZWxGb3JSb29tLmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0NhcmRTdGF0ZVZhbGlkKGNhcmQ6IElSaWdodFBhbmVsQ2FyZCkge1xuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIGRvZXMgYSBzYW5pdHkgY2hlY2sgb24gdGhlIGNhcmQuIHRoaXMgaXMgcmVxdWlyZWQgYmVjYXVzZVxuICAgICAgICAvLyBzb21lIHBoYXNlcyByZXF1aXJlIHNwZWNpZmljIHN0YXRlIHByb3BlcnRpZXMgdGhhdCBtaWdodCBub3QgYmUgYXZhaWxhYmxlLlxuICAgICAgICAvLyBUaGlzIGNhbiBiZSBjYXVzZWQgb24gaWYgZWxlbWVudCBpcyByZWxvYWRlZCBhbmQgdGhlIHRyaWVzIHRvIHJlbG9hZCByaWdodCBwYW5lbCBkYXRhIGZyb20gaWQncyBzdG9yZWQgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG4gICAgICAgIC8vIHdlIHN0b3JlIGlkJ3Mgb2YgdXNlcnMgYW5kIG1hdHJpeCBldmVudHMuIElmIGFyZSBub3QgeWV0IGZldGNoZWQgb24gcmVsb2FkIHRoZSByaWdodCBwYW5lbCBjYW5ub3QgZGlzcGxheSB0aGVtLlxuICAgICAgICAvLyBvciBwb3RlbnRpYWxseSBvdGhlciBlcnJvcnMuXG4gICAgICAgIC8vIChBIG5pY2VyIGZpeCBjb3VsZCBiZSB0byBpbmRpY2F0ZSwgdGhhdCB0aGUgcmlnaHQgcGFuZWwgaXMgbG9hZGluZyBpZiB0aGVyZSBpcyBtaXNzaW5nIHN0YXRlIGRhdGEgYW5kIHJlLWVtaXQgaWYgdGhlIGRhdGEgaXMgYXZhaWxhYmxlKVxuICAgICAgICBzd2l0Y2ggKGNhcmQucGhhc2UpIHtcbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5UaHJlYWRQYW5lbDpcbiAgICAgICAgICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3RocmVhZFwiKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLlRocmVhZFZpZXc6XG4gICAgICAgICAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoIWNhcmQuc3RhdGUudGhyZWFkSGVhZEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwicmVtb3ZlZCBjYXJkIGZyb20gcmlnaHQgcGFuZWwgYmVjYXVzZSBvZiBtaXNzaW5nIHRocmVhZEhlYWRFdmVudCBpbiBjYXJkIHN0YXRlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gISFjYXJkLnN0YXRlLnRocmVhZEhlYWRFdmVudDtcbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVySW5mbzpcbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5TcGFjZU1lbWJlckluZm86XG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuRW5jcnlwdGlvblBhbmVsOlxuICAgICAgICAgICAgICAgIGlmICghY2FyZC5zdGF0ZS5tZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJyZW1vdmVkIGNhcmQgZnJvbSByaWdodCBwYW5lbCBiZWNhdXNlIG9mIG1pc3NpbmcgbWVtYmVyIGluIGNhcmQgc3RhdGVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAhIWNhcmQuc3RhdGUubWVtYmVyO1xuICAgICAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLlJvb20zcGlkTWVtYmVySW5mbzpcbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5TcGFjZTNwaWRNZW1iZXJJbmZvOlxuICAgICAgICAgICAgICAgIGlmICghY2FyZC5zdGF0ZS5tZW1iZXJJbmZvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJyZW1vdmVkIGNhcmQgZnJvbSByaWdodCBwYW5lbCBiZWNhdXNlIG9mIG1pc3NpbmcgbWVtYmVySW5mb0V2ZW50IGluIGNhcmQgc3RhdGVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAhIWNhcmQuc3RhdGUubWVtYmVySW5mb0V2ZW50O1xuICAgICAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLldpZGdldDpcbiAgICAgICAgICAgICAgICBpZiAoIWNhcmQuc3RhdGUud2lkZ2V0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJyZW1vdmVkIGNhcmQgZnJvbSByaWdodCBwYW5lbCBiZWNhdXNlIG9mIG1pc3Npbmcgd2lkZ2V0SWQgaW4gY2FyZCBzdGF0ZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhY2FyZC5zdGF0ZS53aWRnZXRJZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFZlcmlmaWNhdGlvblJlZGlyZWN0KGNhcmQ6IElSaWdodFBhbmVsQ2FyZCk6IElSaWdodFBhbmVsQ2FyZCB7XG4gICAgICAgIGlmIChjYXJkLnBoYXNlID09PSBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJJbmZvICYmIGNhcmQuc3RhdGUpIHtcbiAgICAgICAgICAgIC8vIFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm8gLT4gbmVlZHMgdG8gYmUgY2hhbmdlZCB0byBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbCBpZiB0aGVyZSBpcyBhIHBlbmRpbmcgdmVyaWZpY2F0aW9uIHJlcXVlc3RcbiAgICAgICAgICAgIGNvbnN0IHsgbWVtYmVyIH0gPSBjYXJkLnN0YXRlO1xuICAgICAgICAgICAgY29uc3QgcGVuZGluZ1JlcXVlc3QgPSBwZW5kaW5nVmVyaWZpY2F0aW9uUmVxdWVzdEZvclVzZXIobWVtYmVyKTtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvblJlcXVlc3Q6IHBlbmRpbmdSZXF1ZXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1BoYXNlVmFsaWQodGFyZ2V0UGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMsIGlzVmlld2luZ1Jvb206IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFSaWdodFBhbmVsUGhhc2VzW3RhcmdldFBoYXNlXSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFRyaWVkIHRvIHN3aXRjaCByaWdodCBwYW5lbCB0byB1bmtub3duIHBoYXNlOiAke3RhcmdldFBoYXNlfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNWaWV3aW5nUm9vbSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgICAgYFRyaWVkIHRvIHN3aXRjaCByaWdodCBwYW5lbCB0byBhIHJvb20gcGhhc2U6ICR7dGFyZ2V0UGhhc2V9LCBgICtcbiAgICAgICAgICAgICAgICBgYnV0IHdlIGFyZSBjdXJyZW50bHkgbm90IHZpZXdpbmcgYSByb29tYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblZlcmlmaWNhdGlvblJlcXVlc3RVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50Q2FyZD8uc3RhdGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgeyBtZW1iZXIgfSA9IHRoaXMuY3VycmVudENhcmQuc3RhdGU7XG4gICAgICAgIGlmICghbWVtYmVyKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHBlbmRpbmdSZXF1ZXN0ID0gcGVuZGluZ1ZlcmlmaWNhdGlvblJlcXVlc3RGb3JVc2VyKG1lbWJlcik7XG4gICAgICAgIGlmIChwZW5kaW5nUmVxdWVzdCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5zdGF0ZS52ZXJpZmljYXRpb25SZXF1ZXN0ID0gcGVuZGluZ1JlcXVlc3Q7XG4gICAgICAgICAgICB0aGlzLmVtaXRBbmRVcGRhdGVTZXR0aW5ncygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaGFuZGxlVmlld2VkUm9vbUNoYW5nZShvbGRSb29tSWQ6IE9wdGlvbmFsPHN0cmluZz4sIG5ld1Jvb21JZDogT3B0aW9uYWw8c3RyaW5nPikge1xuICAgICAgICBpZiAoIXRoaXMubXhDbGllbnQpIHJldHVybjsgLy8gbm90IHJlYWR5LCBvblJlYWR5IHdpbGwgaGFuZGxlIHRoZSBmaXJzdCByb29tXG4gICAgICAgIHRoaXMudmlld2VkUm9vbUlkID0gbmV3Um9vbUlkO1xuICAgICAgICAvLyBsb2FkIHZhbHVlcyBmcm9tIGJ5Um9vbUNhY2hlIHdpdGggdGhlIHZpZXdlZFJvb21JZC5cbiAgICAgICAgdGhpcy5sb2FkQ2FjaGVGcm9tU2V0dGluZ3MoKTtcblxuICAgICAgICAvLyB3aGVuIHdlJ3JlIHN3aXRjaGluZyB0byBhIHJvb20sIGNsZWFyIG91dCBhbnkgc3RhbGUgTWVtYmVySW5mbyBjYXJkc1xuICAgICAgICAvLyBpbiBvcmRlciB0byBmaXggaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMjE0ODdcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudENhcmQ/LnBoYXNlICE9PSBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbCkge1xuICAgICAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLmJ5Um9vbVt0aGlzLnZpZXdlZFJvb21JZF07XG4gICAgICAgICAgICBpZiAocGFuZWw/Lmhpc3RvcnkpIHtcbiAgICAgICAgICAgICAgICBwYW5lbC5oaXN0b3J5ID0gcGFuZWwuaGlzdG9yeS5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgIChjYXJkKSA9PiBjYXJkLnBoYXNlICE9IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm8gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQucGhhc2UgIT0gUmlnaHRQYW5lbFBoYXNlcy5Sb29tM3BpZE1lbWJlckluZm8sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSByaWdodCBwYW5lbCBzdGF5cyBvcGVuIG1vZGUgaXMgdXNlZCwgYW5kIHRoZSBwYW5lbCB3YXMgZWl0aGVyXG4gICAgICAgIC8vIGNsb3NlZCBvciBuZXZlciBzaG93biBmb3IgdGhhdCByb29tLCB0aGVuIGZvcmNlIGl0IG9wZW4gYW5kIGRpc3BsYXlcbiAgICAgICAgLy8gdGhlIHJvb20gbWVtYmVyIGxpc3QuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3JpZ2h0X3BhbmVsX2RlZmF1bHRfb3BlblwiKSAmJlxuICAgICAgICAgICAgIXRoaXMuYnlSb29tW3RoaXMudmlld2VkUm9vbUlkXT8uaXNPcGVuXG4gICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgaGlzdG9yeSA9IFt7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJMaXN0IH1dO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMudmlld2VkUm9vbUlkICYmIHRoaXMubXhDbGllbnQ/LmdldFJvb20odGhpcy52aWV3ZWRSb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFyb29tPy5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICAgICAgaGlzdG9yeS51bnNoaWZ0KHsgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbVN1bW1hcnkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJ5Um9vbVt0aGlzLnZpZXdlZFJvb21JZF0gPSB7XG4gICAgICAgICAgICAgICAgaXNPcGVuOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpc3RvcnksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdEFuZFVwZGF0ZVNldHRpbmdzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgaW5zdGFuY2UoKTogUmlnaHRQYW5lbFN0b3JlIHtcbiAgICAgICAgaWYgKCF0aGlzLmludGVybmFsSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxJbnN0YW5jZSA9IG5ldyBSaWdodFBhbmVsU3RvcmUoKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxJbnN0YW5jZS5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsSW5zdGFuY2U7XG4gICAgfVxufVxuXG53aW5kb3cubXhSaWdodFBhbmVsU3RvcmUgPSBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2U7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU9BOztBQUVBOztBQXBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBd0JBO0FBQ0E7QUFDQTtBQUNBO0FB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