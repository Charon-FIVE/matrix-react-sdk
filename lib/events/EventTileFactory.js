"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JitsiEventFactory = exports.JSONEventFactory = void 0;
exports.haveRendererForEvent = haveRendererForEvent;
exports.isMessageEvent = isMessageEvent;
exports.pickFactory = pickFactory;
exports.renderReplyTile = renderReplyTile;
exports.renderTile = renderTile;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _matrixEventsSdk = require("matrix-events-sdk");

var _RoomContext = require("../contexts/RoomContext");

var _MessageEvent = _interopRequireDefault(require("../components/views/messages/MessageEvent"));

var _MKeyVerificationConclusion = _interopRequireDefault(require("../components/views/messages/MKeyVerificationConclusion"));

var _LegacyCallEvent = _interopRequireDefault(require("../components/views/messages/LegacyCallEvent"));

var _TextualEvent = _interopRequireDefault(require("../components/views/messages/TextualEvent"));

var _EncryptionEvent = _interopRequireDefault(require("../components/views/messages/EncryptionEvent"));

var _RoomCreate = _interopRequireDefault(require("../components/views/messages/RoomCreate"));

var _RoomAvatarEvent = _interopRequireDefault(require("../components/views/messages/RoomAvatarEvent"));

var _WidgetLayoutStore = require("../stores/widgets/WidgetLayoutStore");

var _BanList = require("../mjolnir/BanList");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _MKeyVerificationRequest = _interopRequireDefault(require("../components/views/messages/MKeyVerificationRequest"));

var _WidgetType = require("../widgets/WidgetType");

var _MJitsiWidgetEvent = _interopRequireDefault(require("../components/views/messages/MJitsiWidgetEvent"));

var _TextForEvent = require("../TextForEvent");

var _EventUtils = require("../utils/EventUtils");

var _HiddenBody = _interopRequireDefault(require("../components/views/messages/HiddenBody"));

var _ViewSourceEvent = _interopRequireDefault(require("../components/views/messages/ViewSourceEvent"));

var _timeline = require("../utils/beacon/timeline");

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
const MessageEventFactory = (ref, props) => /*#__PURE__*/_react.default.createElement(_MessageEvent.default, (0, _extends2.default)({
  ref: ref
}, props));

const KeyVerificationConclFactory = (ref, props) => /*#__PURE__*/_react.default.createElement(_MKeyVerificationConclusion.default, (0, _extends2.default)({
  ref: ref
}, props));

const LegacyCallEventFactory = (ref, props) => /*#__PURE__*/_react.default.createElement(_LegacyCallEvent.default, (0, _extends2.default)({
  ref: ref
}, props));

const TextualEventFactory = (ref, props) => /*#__PURE__*/_react.default.createElement(_TextualEvent.default, (0, _extends2.default)({
  ref: ref
}, props));

const VerificationReqFactory = (ref, props) => /*#__PURE__*/_react.default.createElement(_MKeyVerificationRequest.default, (0, _extends2.default)({
  ref: ref
}, props));

const HiddenEventFactory = (ref, props) => /*#__PURE__*/_react.default.createElement(_HiddenBody.default, (0, _extends2.default)({
  ref: ref
}, props)); // These factories are exported for reference comparison against pickFactory()


const JitsiEventFactory = (ref, props) => /*#__PURE__*/_react.default.createElement(_MJitsiWidgetEvent.default, (0, _extends2.default)({
  ref: ref
}, props));

exports.JitsiEventFactory = JitsiEventFactory;

const JSONEventFactory = (ref, props) => /*#__PURE__*/_react.default.createElement(_ViewSourceEvent.default, (0, _extends2.default)({
  ref: ref
}, props));

exports.JSONEventFactory = JSONEventFactory;
const EVENT_TILE_TYPES = new Map([[_event.EventType.RoomMessage, MessageEventFactory], // note that verification requests are handled in pickFactory()
[_event.EventType.Sticker, MessageEventFactory], [_matrixEventsSdk.M_POLL_START.name, MessageEventFactory], [_matrixEventsSdk.M_POLL_START.altName, MessageEventFactory], [_event.EventType.KeyVerificationCancel, KeyVerificationConclFactory], [_event.EventType.KeyVerificationDone, KeyVerificationConclFactory], [_event.EventType.CallInvite, LegacyCallEventFactory] // note that this requires a special factory type
]);
const STATE_EVENT_TILE_TYPES = new Map([[_event.EventType.RoomEncryption, (ref, props) => /*#__PURE__*/_react.default.createElement(_EncryptionEvent.default, (0, _extends2.default)({
  ref: ref
}, props))], [_event.EventType.RoomCanonicalAlias, TextualEventFactory], [_event.EventType.RoomCreate, (ref, props) => /*#__PURE__*/_react.default.createElement(_RoomCreate.default, (0, _extends2.default)({
  ref: ref
}, props))], [_event.EventType.RoomMember, TextualEventFactory], [_event.EventType.RoomName, TextualEventFactory], [_event.EventType.RoomAvatar, (ref, props) => /*#__PURE__*/_react.default.createElement(_RoomAvatarEvent.default, (0, _extends2.default)({
  ref: ref
}, props))], [_event.EventType.RoomThirdPartyInvite, TextualEventFactory], [_event.EventType.RoomHistoryVisibility, TextualEventFactory], [_event.EventType.RoomTopic, TextualEventFactory], [_event.EventType.RoomPowerLevels, TextualEventFactory], [_event.EventType.RoomPinnedEvents, TextualEventFactory], [_event.EventType.RoomServerAcl, TextualEventFactory], // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
['im.vector.modular.widgets', TextualEventFactory], // note that Jitsi widgets are special in pickFactory()
[_WidgetLayoutStore.WIDGET_LAYOUT_EVENT_TYPE, TextualEventFactory], [_event.EventType.RoomTombstone, TextualEventFactory], [_event.EventType.RoomJoinRules, TextualEventFactory], [_event.EventType.RoomGuestAccess, TextualEventFactory]]); // Add all the Mjolnir stuff to the renderer too

for (const evType of _BanList.ALL_RULE_TYPES) {
  STATE_EVENT_TILE_TYPES.set(evType, TextualEventFactory);
} // These events should be recorded in the STATE_EVENT_TILE_TYPES


const SINGULAR_STATE_EVENTS = new Set([_event.EventType.RoomEncryption, _event.EventType.RoomCanonicalAlias, _event.EventType.RoomCreate, _event.EventType.RoomName, _event.EventType.RoomAvatar, _event.EventType.RoomHistoryVisibility, _event.EventType.RoomTopic, _event.EventType.RoomPowerLevels, _event.EventType.RoomPinnedEvents, _event.EventType.RoomServerAcl, _WidgetLayoutStore.WIDGET_LAYOUT_EVENT_TYPE, _event.EventType.RoomTombstone, _event.EventType.RoomJoinRules, _event.EventType.RoomGuestAccess]);
/**
 * Find an event tile factory for the given conditions.
 * @param mxEvent The event.
 * @param cli The matrix client to reference when needed.
 * @param showHiddenEvents Whether hidden events should be shown.
 * @param asHiddenEv When true, treat the event as always hidden.
 * @returns The factory, or falsy if not possible.
 */

function pickFactory(mxEvent, cli, showHiddenEvents, asHiddenEv) {
  const evType = mxEvent.getType(); // cache this to reduce call stack execution hits
  // Note: we avoid calling SettingsStore unless absolutely necessary - this code is on the critical path.

  if (asHiddenEv && showHiddenEvents) {
    return JSONEventFactory;
  }

  const noEventFactoryFactory = () => showHiddenEvents ? JSONEventFactory : undefined; // just don't render things that we shouldn't render
  // We run all the event type checks first as they might override the factory entirely.


  const moderationState = (0, _EventUtils.getMessageModerationState)(mxEvent, cli);

  if (moderationState === _EventUtils.MessageModerationState.HIDDEN_TO_CURRENT_USER) {
    return HiddenEventFactory;
  }

  if (evType === _event.EventType.RoomMessage) {
    // don't show verification requests we're not involved in,
    // not even when showing hidden events
    const content = mxEvent.getContent();

    if (content?.msgtype === _event.MsgType.KeyVerificationRequest) {
      const me = cli.getUserId();

      if (mxEvent.getSender() !== me && content['to'] !== me) {
        return noEventFactoryFactory(); // not for/from us
      } else {
        // override the factory
        return VerificationReqFactory;
      }
    }
  } else if (evType === _event.EventType.KeyVerificationDone) {
    // these events are sent by both parties during verification, but we only want to render one
    // tile once the verification concludes, so filter out the one from the other party.
    const me = cli.getUserId();

    if (mxEvent.getSender() !== me) {
      return noEventFactoryFactory();
    }
  }

  if (evType === _event.EventType.KeyVerificationCancel || evType === _event.EventType.KeyVerificationDone) {
    // sometimes MKeyVerificationConclusion declines to render. Jankily decline to render and
    // fall back to showing hidden events, if we're viewing hidden events
    // XXX: This is extremely a hack. Possibly these components should have an interface for
    // declining to render?
    if (!_MKeyVerificationConclusion.default.shouldRender(mxEvent, mxEvent.verificationRequest)) {
      return noEventFactoryFactory();
    }
  } // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)


  if (evType === "im.vector.modular.widgets") {
    let type = mxEvent.getContent()['type'];

    if (!type) {
      // deleted/invalid widget - try the past widget type
      type = mxEvent.getPrevContent()['type'];
    }

    if (_WidgetType.WidgetType.JITSI.matches(type)) {
      // override the factory
      return JitsiEventFactory;
    }
  } // Try and pick a state event factory, if we can.


  if (mxEvent.isState()) {
    if ((0, _timeline.shouldDisplayAsBeaconTile)(mxEvent)) {
      return MessageEventFactory;
    }

    if (SINGULAR_STATE_EVENTS.has(evType) && mxEvent.getStateKey() !== '') {
      return noEventFactoryFactory(); // improper event type to render
    }

    if (STATE_EVENT_TILE_TYPES.get(evType) === TextualEventFactory && !(0, _TextForEvent.hasText)(mxEvent, showHiddenEvents)) {
      return noEventFactoryFactory();
    }

    return STATE_EVENT_TILE_TYPES.get(evType) ?? noEventFactoryFactory();
  } // Blanket override for all events. The MessageEvent component handles redacted states for us.


  if (mxEvent.isRedacted()) {
    return MessageEventFactory;
  }

  if (mxEvent.isRelation(_event.RelationType.Replace)) {
    return noEventFactoryFactory();
  }

  return EVENT_TILE_TYPES.get(evType) ?? noEventFactoryFactory();
}
/**
 * Render an event as a tile
 * @param renderType The render type. Used to inform properties given to the eventual component.
 * @param props The properties to provide to the eventual component.
 * @param showHiddenEvents Whether hidden events should be shown.
 * @param cli Optional client instance to use, otherwise the default MatrixClientPeg will be used.
 * @returns The tile as JSX, or falsy if unable to render.
 */


function renderTile(renderType, props, showHiddenEvents, cli) {
  cli = cli ?? _MatrixClientPeg.MatrixClientPeg.get(); // because param defaults don't do the correct thing

  const factory = pickFactory(props.mxEvent, cli, showHiddenEvents);
  if (!factory) return undefined; // Note that we split off the ones we actually care about here just to be sure that we're
  // not going to accidentally send things we shouldn't from lazy callers. Eg: EventTile's
  // lazy calls of `renderTile(..., this.props)` will have a lot more than we actually care
  // about.

  const {
    ref,
    mxEvent,
    forExport,
    replacingEventId,
    editState,
    highlights,
    highlightLink,
    showUrlPreview,
    permalinkCreator,
    onHeightChanged,
    callEventGrouper,
    getRelationsForEvent,
    isSeeingThroughMessageHiddenForModeration,
    timestamp
  } = props;

  switch (renderType) {
    case _RoomContext.TimelineRenderingType.File:
    case _RoomContext.TimelineRenderingType.Notification:
    case _RoomContext.TimelineRenderingType.Thread:
      // We only want a subset of props, so we don't end up causing issues for downstream components.
      return factory(props.ref, {
        mxEvent,
        highlights,
        highlightLink,
        showUrlPreview,
        onHeightChanged,
        editState,
        replacingEventId,
        getRelationsForEvent,
        isSeeingThroughMessageHiddenForModeration,
        permalinkCreator
      });

    default:
      // NEARLY ALL THE OPTIONS!
      return factory(ref, {
        mxEvent,
        forExport,
        replacingEventId,
        editState,
        highlights,
        highlightLink,
        showUrlPreview,
        permalinkCreator,
        onHeightChanged,
        callEventGrouper,
        getRelationsForEvent,
        isSeeingThroughMessageHiddenForModeration,
        timestamp
      });
  }
}
/**
 * A version of renderTile() specifically for replies.
 * @param props The properties to specify on the eventual object.
 * @param showHiddenEvents Whether hidden events should be shown.
 * @param cli Optional client instance to use, otherwise the default MatrixClientPeg will be used.
 * @returns The tile as JSX, or falsy if unable to render.
 */


function renderReplyTile(props, showHiddenEvents, cli) {
  cli = cli ?? _MatrixClientPeg.MatrixClientPeg.get(); // because param defaults don't do the correct thing

  const factory = pickFactory(props.mxEvent, cli, showHiddenEvents);
  if (!factory) return undefined; // See renderTile() for why we split off so much

  const {
    ref,
    mxEvent,
    highlights,
    highlightLink,
    onHeightChanged,
    showUrlPreview,
    overrideBodyTypes,
    overrideEventTypes,
    replacingEventId,
    maxImageHeight,
    getRelationsForEvent,
    isSeeingThroughMessageHiddenForModeration,
    permalinkCreator
  } = props;
  return factory(ref, {
    mxEvent,
    highlights,
    highlightLink,
    onHeightChanged,
    showUrlPreview,
    overrideBodyTypes,
    overrideEventTypes,
    replacingEventId,
    maxImageHeight,
    getRelationsForEvent,
    isSeeingThroughMessageHiddenForModeration,
    permalinkCreator
  });
} // XXX: this'll eventually be dynamic based on the fields once we have extensible event types


const messageTypes = [_event.EventType.RoomMessage, _event.EventType.Sticker];

function isMessageEvent(ev) {
  return messageTypes.includes(ev.getType()) || _matrixEventsSdk.M_POLL_START.matches(ev.getType());
}

function haveRendererForEvent(mxEvent, showHiddenEvents) {
  // Only show "Message deleted" tile for plain message events, encrypted events,
  // and state events as they'll likely still contain enough keys to be relevant.
  if (mxEvent.isRedacted() && !mxEvent.isEncrypted() && !isMessageEvent(mxEvent) && !mxEvent.isState()) {
    return false;
  } // No tile for replacement events since they update the original tile


  if (mxEvent.isRelation(_event.RelationType.Replace)) return false;
  const handler = pickFactory(mxEvent, _MatrixClientPeg.MatrixClientPeg.get(), showHiddenEvents);
  if (!handler) return false;

  if (handler === TextualEventFactory) {
    return (0, _TextForEvent.hasText)(mxEvent, showHiddenEvents);
  } else if (handler === STATE_EVENT_TILE_TYPES.get(_event.EventType.RoomCreate)) {
    return Boolean(mxEvent.getContent()['predecessor']);
  } else if (handler === JSONEventFactory) {
    return false;
  } else {
    return true;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlRXZlbnRGYWN0b3J5IiwicmVmIiwicHJvcHMiLCJLZXlWZXJpZmljYXRpb25Db25jbEZhY3RvcnkiLCJMZWdhY3lDYWxsRXZlbnRGYWN0b3J5IiwiVGV4dHVhbEV2ZW50RmFjdG9yeSIsIlZlcmlmaWNhdGlvblJlcUZhY3RvcnkiLCJIaWRkZW5FdmVudEZhY3RvcnkiLCJKaXRzaUV2ZW50RmFjdG9yeSIsIkpTT05FdmVudEZhY3RvcnkiLCJFVkVOVF9USUxFX1RZUEVTIiwiTWFwIiwiRXZlbnRUeXBlIiwiUm9vbU1lc3NhZ2UiLCJTdGlja2VyIiwiTV9QT0xMX1NUQVJUIiwibmFtZSIsImFsdE5hbWUiLCJLZXlWZXJpZmljYXRpb25DYW5jZWwiLCJLZXlWZXJpZmljYXRpb25Eb25lIiwiQ2FsbEludml0ZSIsIlNUQVRFX0VWRU5UX1RJTEVfVFlQRVMiLCJSb29tRW5jcnlwdGlvbiIsIlJvb21DYW5vbmljYWxBbGlhcyIsIlJvb21DcmVhdGUiLCJSb29tTWVtYmVyIiwiUm9vbU5hbWUiLCJSb29tQXZhdGFyIiwiUm9vbVRoaXJkUGFydHlJbnZpdGUiLCJSb29tSGlzdG9yeVZpc2liaWxpdHkiLCJSb29tVG9waWMiLCJSb29tUG93ZXJMZXZlbHMiLCJSb29tUGlubmVkRXZlbnRzIiwiUm9vbVNlcnZlckFjbCIsIldJREdFVF9MQVlPVVRfRVZFTlRfVFlQRSIsIlJvb21Ub21ic3RvbmUiLCJSb29tSm9pblJ1bGVzIiwiUm9vbUd1ZXN0QWNjZXNzIiwiZXZUeXBlIiwiQUxMX1JVTEVfVFlQRVMiLCJzZXQiLCJTSU5HVUxBUl9TVEFURV9FVkVOVFMiLCJTZXQiLCJwaWNrRmFjdG9yeSIsIm14RXZlbnQiLCJjbGkiLCJzaG93SGlkZGVuRXZlbnRzIiwiYXNIaWRkZW5FdiIsImdldFR5cGUiLCJub0V2ZW50RmFjdG9yeUZhY3RvcnkiLCJ1bmRlZmluZWQiLCJtb2RlcmF0aW9uU3RhdGUiLCJnZXRNZXNzYWdlTW9kZXJhdGlvblN0YXRlIiwiTWVzc2FnZU1vZGVyYXRpb25TdGF0ZSIsIkhJRERFTl9UT19DVVJSRU5UX1VTRVIiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsIm1zZ3R5cGUiLCJNc2dUeXBlIiwiS2V5VmVyaWZpY2F0aW9uUmVxdWVzdCIsIm1lIiwiZ2V0VXNlcklkIiwiZ2V0U2VuZGVyIiwiTUtleVZlcmlmaWNhdGlvbkNvbmNsdXNpb24iLCJzaG91bGRSZW5kZXIiLCJ2ZXJpZmljYXRpb25SZXF1ZXN0IiwidHlwZSIsImdldFByZXZDb250ZW50IiwiV2lkZ2V0VHlwZSIsIkpJVFNJIiwibWF0Y2hlcyIsImlzU3RhdGUiLCJzaG91bGREaXNwbGF5QXNCZWFjb25UaWxlIiwiaGFzIiwiZ2V0U3RhdGVLZXkiLCJnZXQiLCJoYXNUZXh0IiwiaXNSZWRhY3RlZCIsImlzUmVsYXRpb24iLCJSZWxhdGlvblR5cGUiLCJSZXBsYWNlIiwicmVuZGVyVGlsZSIsInJlbmRlclR5cGUiLCJNYXRyaXhDbGllbnRQZWciLCJmYWN0b3J5IiwiZm9yRXhwb3J0IiwicmVwbGFjaW5nRXZlbnRJZCIsImVkaXRTdGF0ZSIsImhpZ2hsaWdodHMiLCJoaWdobGlnaHRMaW5rIiwic2hvd1VybFByZXZpZXciLCJwZXJtYWxpbmtDcmVhdG9yIiwib25IZWlnaHRDaGFuZ2VkIiwiY2FsbEV2ZW50R3JvdXBlciIsImdldFJlbGF0aW9uc0ZvckV2ZW50IiwiaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24iLCJ0aW1lc3RhbXAiLCJUaW1lbGluZVJlbmRlcmluZ1R5cGUiLCJGaWxlIiwiTm90aWZpY2F0aW9uIiwiVGhyZWFkIiwicmVuZGVyUmVwbHlUaWxlIiwib3ZlcnJpZGVCb2R5VHlwZXMiLCJvdmVycmlkZUV2ZW50VHlwZXMiLCJtYXhJbWFnZUhlaWdodCIsIm1lc3NhZ2VUeXBlcyIsImlzTWVzc2FnZUV2ZW50IiwiZXYiLCJpbmNsdWRlcyIsImhhdmVSZW5kZXJlckZvckV2ZW50IiwiaXNFbmNyeXB0ZWQiLCJoYW5kbGVyIiwiQm9vbGVhbiJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ldmVudHMvRXZlbnRUaWxlRmFjdG9yeS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBFdmVudFR5cGUsIE1zZ1R5cGUsIFJlbGF0aW9uVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IE1fUE9MTF9TVEFSVCwgT3B0aW9uYWwgfSBmcm9tIFwibWF0cml4LWV2ZW50cy1zZGtcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcblxuaW1wb3J0IEVkaXRvclN0YXRlVHJhbnNmZXIgZnJvbSBcIi4uL3V0aWxzL0VkaXRvclN0YXRlVHJhbnNmZXJcIjtcbmltcG9ydCB7IFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSBcIi4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IExlZ2FjeUNhbGxFdmVudEdyb3VwZXIgZnJvbSBcIi4uL2NvbXBvbmVudHMvc3RydWN0dXJlcy9MZWdhY3lDYWxsRXZlbnRHcm91cGVyXCI7XG5pbXBvcnQgeyBHZXRSZWxhdGlvbnNGb3JFdmVudCB9IGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0V2ZW50VGlsZVwiO1xuaW1wb3J0IHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSBcIi4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgTWVzc2FnZUV2ZW50IGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01lc3NhZ2VFdmVudFwiO1xuaW1wb3J0IE1LZXlWZXJpZmljYXRpb25Db25jbHVzaW9uIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01LZXlWZXJpZmljYXRpb25Db25jbHVzaW9uXCI7XG5pbXBvcnQgTGVnYWN5Q2FsbEV2ZW50IGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL0xlZ2FjeUNhbGxFdmVudFwiO1xuaW1wb3J0IFRleHR1YWxFdmVudCBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9UZXh0dWFsRXZlbnRcIjtcbmltcG9ydCBFbmNyeXB0aW9uRXZlbnQgZnJvbSBcIi4uL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvRW5jcnlwdGlvbkV2ZW50XCI7XG5pbXBvcnQgUm9vbUNyZWF0ZSBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9Sb29tQ3JlYXRlXCI7XG5pbXBvcnQgUm9vbUF2YXRhckV2ZW50IGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1Jvb21BdmF0YXJFdmVudFwiO1xuaW1wb3J0IHsgV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFIH0gZnJvbSBcIi4uL3N0b3Jlcy93aWRnZXRzL1dpZGdldExheW91dFN0b3JlXCI7XG5pbXBvcnQgeyBBTExfUlVMRV9UWVBFUyB9IGZyb20gXCIuLi9tam9sbmlyL0Jhbkxpc3RcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBNS2V5VmVyaWZpY2F0aW9uUmVxdWVzdCBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9NS2V5VmVyaWZpY2F0aW9uUmVxdWVzdFwiO1xuaW1wb3J0IHsgV2lkZ2V0VHlwZSB9IGZyb20gXCIuLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCBNSml0c2lXaWRnZXRFdmVudCBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9NSml0c2lXaWRnZXRFdmVudFwiO1xuaW1wb3J0IHsgaGFzVGV4dCB9IGZyb20gXCIuLi9UZXh0Rm9yRXZlbnRcIjtcbmltcG9ydCB7IGdldE1lc3NhZ2VNb2RlcmF0aW9uU3RhdGUsIE1lc3NhZ2VNb2RlcmF0aW9uU3RhdGUgfSBmcm9tIFwiLi4vdXRpbHMvRXZlbnRVdGlsc1wiO1xuaW1wb3J0IEhpZGRlbkJvZHkgZnJvbSBcIi4uL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvSGlkZGVuQm9keVwiO1xuaW1wb3J0IFZpZXdTb3VyY2VFdmVudCBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9WaWV3U291cmNlRXZlbnRcIjtcbmltcG9ydCB7IHNob3VsZERpc3BsYXlBc0JlYWNvblRpbGUgfSBmcm9tIFwiLi4vdXRpbHMvYmVhY29uL3RpbWVsaW5lXCI7XG5cbi8vIFN1YnNldCBvZiBFdmVudFRpbGUncyBJUHJvcHMgcGx1cyBzb21lIG1peGluc1xuZXhwb3J0IGludGVyZmFjZSBFdmVudFRpbGVUeXBlUHJvcHMge1xuICAgIHJlZj86IFJlYWN0LlJlZk9iamVjdDxhbnk+OyAvLyBgYW55YCBiZWNhdXNlIGl0J3MgZWZmZWN0aXZlbHkgaW1wb3NzaWJsZSB0byBjb252aW5jZSBUUyBvZiBhIHJlYXNvbmFibGUgdHlwZVxuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xuICAgIGhpZ2hsaWdodHM/OiBzdHJpbmdbXTtcbiAgICBoaWdobGlnaHRMaW5rPzogc3RyaW5nO1xuICAgIHNob3dVcmxQcmV2aWV3PzogYm9vbGVhbjtcbiAgICBvbkhlaWdodENoYW5nZWQ6ICgpID0+IHZvaWQ7XG4gICAgZm9yRXhwb3J0PzogYm9vbGVhbjtcbiAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD86IEdldFJlbGF0aW9uc0ZvckV2ZW50O1xuICAgIGVkaXRTdGF0ZT86IEVkaXRvclN0YXRlVHJhbnNmZXI7XG4gICAgcmVwbGFjaW5nRXZlbnRJZD86IHN0cmluZztcbiAgICBwZXJtYWxpbmtDcmVhdG9yOiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbiAgICBjYWxsRXZlbnRHcm91cGVyPzogTGVnYWN5Q2FsbEV2ZW50R3JvdXBlcjtcbiAgICBpc1NlZWluZ1Rocm91Z2hNZXNzYWdlSGlkZGVuRm9yTW9kZXJhdGlvbj86IGJvb2xlYW47XG4gICAgdGltZXN0YW1wPzogSlNYLkVsZW1lbnQ7XG4gICAgbWF4SW1hZ2VIZWlnaHQ/OiBudW1iZXI7IC8vIHBpeGVsc1xuICAgIG92ZXJyaWRlQm9keVR5cGVzPzogUmVjb3JkPHN0cmluZywgdHlwZW9mIFJlYWN0LkNvbXBvbmVudD47XG4gICAgb3ZlcnJpZGVFdmVudFR5cGVzPzogUmVjb3JkPHN0cmluZywgdHlwZW9mIFJlYWN0LkNvbXBvbmVudD47XG59XG5cbnR5cGUgRmFjdG9yeVByb3BzID0gT21pdDxFdmVudFRpbGVUeXBlUHJvcHMsIFwicmVmXCI+O1xudHlwZSBGYWN0b3J5PFggPSBGYWN0b3J5UHJvcHM+ID0gKHJlZjogT3B0aW9uYWw8UmVhY3QuUmVmT2JqZWN0PGFueT4+LCBwcm9wczogWCkgPT4gSlNYLkVsZW1lbnQ7XG5cbmNvbnN0IE1lc3NhZ2VFdmVudEZhY3Rvcnk6IEZhY3RvcnkgPSAocmVmLCBwcm9wcykgPT4gPE1lc3NhZ2VFdmVudCByZWY9e3JlZn0gey4uLnByb3BzfSAvPjtcbmNvbnN0IEtleVZlcmlmaWNhdGlvbkNvbmNsRmFjdG9yeTogRmFjdG9yeSA9IChyZWYsIHByb3BzKSA9PiA8TUtleVZlcmlmaWNhdGlvbkNvbmNsdXNpb24gcmVmPXtyZWZ9IHsuLi5wcm9wc30gLz47XG5jb25zdCBMZWdhY3lDYWxsRXZlbnRGYWN0b3J5OiBGYWN0b3J5PEZhY3RvcnlQcm9wcyAmIHsgY2FsbEV2ZW50R3JvdXBlcjogTGVnYWN5Q2FsbEV2ZW50R3JvdXBlciB9PiA9IChyZWYsIHByb3BzKSA9PiAoXG4gICAgPExlZ2FjeUNhbGxFdmVudCByZWY9e3JlZn0gey4uLnByb3BzfSAvPlxuKTtcbmNvbnN0IFRleHR1YWxFdmVudEZhY3Rvcnk6IEZhY3RvcnkgPSAocmVmLCBwcm9wcykgPT4gPFRleHR1YWxFdmVudCByZWY9e3JlZn0gey4uLnByb3BzfSAvPjtcbmNvbnN0IFZlcmlmaWNhdGlvblJlcUZhY3Rvcnk6IEZhY3RvcnkgPSAocmVmLCBwcm9wcykgPT4gPE1LZXlWZXJpZmljYXRpb25SZXF1ZXN0IHJlZj17cmVmfSB7Li4ucHJvcHN9IC8+O1xuY29uc3QgSGlkZGVuRXZlbnRGYWN0b3J5OiBGYWN0b3J5ID0gKHJlZiwgcHJvcHMpID0+IDxIaWRkZW5Cb2R5IHJlZj17cmVmfSB7Li4ucHJvcHN9IC8+O1xuXG4vLyBUaGVzZSBmYWN0b3JpZXMgYXJlIGV4cG9ydGVkIGZvciByZWZlcmVuY2UgY29tcGFyaXNvbiBhZ2FpbnN0IHBpY2tGYWN0b3J5KClcbmV4cG9ydCBjb25zdCBKaXRzaUV2ZW50RmFjdG9yeTogRmFjdG9yeSA9IChyZWYsIHByb3BzKSA9PiA8TUppdHNpV2lkZ2V0RXZlbnQgcmVmPXtyZWZ9IHsuLi5wcm9wc30gLz47XG5leHBvcnQgY29uc3QgSlNPTkV2ZW50RmFjdG9yeTogRmFjdG9yeSA9IChyZWYsIHByb3BzKSA9PiA8Vmlld1NvdXJjZUV2ZW50IHJlZj17cmVmfSB7Li4ucHJvcHN9IC8+O1xuXG5jb25zdCBFVkVOVF9USUxFX1RZUEVTID0gbmV3IE1hcDxzdHJpbmcsIEZhY3Rvcnk+KFtcbiAgICBbRXZlbnRUeXBlLlJvb21NZXNzYWdlLCBNZXNzYWdlRXZlbnRGYWN0b3J5XSwgLy8gbm90ZSB0aGF0IHZlcmlmaWNhdGlvbiByZXF1ZXN0cyBhcmUgaGFuZGxlZCBpbiBwaWNrRmFjdG9yeSgpXG4gICAgW0V2ZW50VHlwZS5TdGlja2VyLCBNZXNzYWdlRXZlbnRGYWN0b3J5XSxcbiAgICBbTV9QT0xMX1NUQVJULm5hbWUsIE1lc3NhZ2VFdmVudEZhY3RvcnldLFxuICAgIFtNX1BPTExfU1RBUlQuYWx0TmFtZSwgTWVzc2FnZUV2ZW50RmFjdG9yeV0sXG4gICAgW0V2ZW50VHlwZS5LZXlWZXJpZmljYXRpb25DYW5jZWwsIEtleVZlcmlmaWNhdGlvbkNvbmNsRmFjdG9yeV0sXG4gICAgW0V2ZW50VHlwZS5LZXlWZXJpZmljYXRpb25Eb25lLCBLZXlWZXJpZmljYXRpb25Db25jbEZhY3RvcnldLFxuICAgIFtFdmVudFR5cGUuQ2FsbEludml0ZSwgTGVnYWN5Q2FsbEV2ZW50RmFjdG9yeV0sIC8vIG5vdGUgdGhhdCB0aGlzIHJlcXVpcmVzIGEgc3BlY2lhbCBmYWN0b3J5IHR5cGVcbl0pO1xuXG5jb25zdCBTVEFURV9FVkVOVF9USUxFX1RZUEVTID0gbmV3IE1hcDxzdHJpbmcsIEZhY3Rvcnk+KFtcbiAgICBbRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uLCAocmVmLCBwcm9wcykgPT4gPEVuY3J5cHRpb25FdmVudCByZWY9e3JlZn0gey4uLnByb3BzfSAvPl0sXG4gICAgW0V2ZW50VHlwZS5Sb29tQ2Fub25pY2FsQWxpYXMsIFRleHR1YWxFdmVudEZhY3RvcnldLFxuICAgIFtFdmVudFR5cGUuUm9vbUNyZWF0ZSwgKHJlZiwgcHJvcHMpID0+IDxSb29tQ3JlYXRlIHJlZj17cmVmfSB7Li4ucHJvcHN9IC8+XSxcbiAgICBbRXZlbnRUeXBlLlJvb21NZW1iZXIsIFRleHR1YWxFdmVudEZhY3RvcnldLFxuICAgIFtFdmVudFR5cGUuUm9vbU5hbWUsIFRleHR1YWxFdmVudEZhY3RvcnldLFxuICAgIFtFdmVudFR5cGUuUm9vbUF2YXRhciwgKHJlZiwgcHJvcHMpID0+IDxSb29tQXZhdGFyRXZlbnQgcmVmPXtyZWZ9IHsuLi5wcm9wc30gLz5dLFxuICAgIFtFdmVudFR5cGUuUm9vbVRoaXJkUGFydHlJbnZpdGUsIFRleHR1YWxFdmVudEZhY3RvcnldLFxuICAgIFtFdmVudFR5cGUuUm9vbUhpc3RvcnlWaXNpYmlsaXR5LCBUZXh0dWFsRXZlbnRGYWN0b3J5XSxcbiAgICBbRXZlbnRUeXBlLlJvb21Ub3BpYywgVGV4dHVhbEV2ZW50RmFjdG9yeV0sXG4gICAgW0V2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHMsIFRleHR1YWxFdmVudEZhY3RvcnldLFxuICAgIFtFdmVudFR5cGUuUm9vbVBpbm5lZEV2ZW50cywgVGV4dHVhbEV2ZW50RmFjdG9yeV0sXG4gICAgW0V2ZW50VHlwZS5Sb29tU2VydmVyQWNsLCBUZXh0dWFsRXZlbnRGYWN0b3J5XSxcbiAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgWydpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzJywgVGV4dHVhbEV2ZW50RmFjdG9yeV0sIC8vIG5vdGUgdGhhdCBKaXRzaSB3aWRnZXRzIGFyZSBzcGVjaWFsIGluIHBpY2tGYWN0b3J5KClcbiAgICBbV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFLCBUZXh0dWFsRXZlbnRGYWN0b3J5XSxcbiAgICBbRXZlbnRUeXBlLlJvb21Ub21ic3RvbmUsIFRleHR1YWxFdmVudEZhY3RvcnldLFxuICAgIFtFdmVudFR5cGUuUm9vbUpvaW5SdWxlcywgVGV4dHVhbEV2ZW50RmFjdG9yeV0sXG4gICAgW0V2ZW50VHlwZS5Sb29tR3Vlc3RBY2Nlc3MsIFRleHR1YWxFdmVudEZhY3RvcnldLFxuXSk7XG5cbi8vIEFkZCBhbGwgdGhlIE1qb2xuaXIgc3R1ZmYgdG8gdGhlIHJlbmRlcmVyIHRvb1xuZm9yIChjb25zdCBldlR5cGUgb2YgQUxMX1JVTEVfVFlQRVMpIHtcbiAgICBTVEFURV9FVkVOVF9USUxFX1RZUEVTLnNldChldlR5cGUsIFRleHR1YWxFdmVudEZhY3RvcnkpO1xufVxuXG4vLyBUaGVzZSBldmVudHMgc2hvdWxkIGJlIHJlY29yZGVkIGluIHRoZSBTVEFURV9FVkVOVF9USUxFX1RZUEVTXG5jb25zdCBTSU5HVUxBUl9TVEFURV9FVkVOVFMgPSBuZXcgU2V0KFtcbiAgICBFdmVudFR5cGUuUm9vbUVuY3J5cHRpb24sXG4gICAgRXZlbnRUeXBlLlJvb21DYW5vbmljYWxBbGlhcyxcbiAgICBFdmVudFR5cGUuUm9vbUNyZWF0ZSxcbiAgICBFdmVudFR5cGUuUm9vbU5hbWUsXG4gICAgRXZlbnRUeXBlLlJvb21BdmF0YXIsXG4gICAgRXZlbnRUeXBlLlJvb21IaXN0b3J5VmlzaWJpbGl0eSxcbiAgICBFdmVudFR5cGUuUm9vbVRvcGljLFxuICAgIEV2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHMsXG4gICAgRXZlbnRUeXBlLlJvb21QaW5uZWRFdmVudHMsXG4gICAgRXZlbnRUeXBlLlJvb21TZXJ2ZXJBY2wsXG4gICAgV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFLFxuICAgIEV2ZW50VHlwZS5Sb29tVG9tYnN0b25lLFxuICAgIEV2ZW50VHlwZS5Sb29tSm9pblJ1bGVzLFxuICAgIEV2ZW50VHlwZS5Sb29tR3Vlc3RBY2Nlc3MsXG5dKTtcblxuLyoqXG4gKiBGaW5kIGFuIGV2ZW50IHRpbGUgZmFjdG9yeSBmb3IgdGhlIGdpdmVuIGNvbmRpdGlvbnMuXG4gKiBAcGFyYW0gbXhFdmVudCBUaGUgZXZlbnQuXG4gKiBAcGFyYW0gY2xpIFRoZSBtYXRyaXggY2xpZW50IHRvIHJlZmVyZW5jZSB3aGVuIG5lZWRlZC5cbiAqIEBwYXJhbSBzaG93SGlkZGVuRXZlbnRzIFdoZXRoZXIgaGlkZGVuIGV2ZW50cyBzaG91bGQgYmUgc2hvd24uXG4gKiBAcGFyYW0gYXNIaWRkZW5FdiBXaGVuIHRydWUsIHRyZWF0IHRoZSBldmVudCBhcyBhbHdheXMgaGlkZGVuLlxuICogQHJldHVybnMgVGhlIGZhY3RvcnksIG9yIGZhbHN5IGlmIG5vdCBwb3NzaWJsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpY2tGYWN0b3J5KFxuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgIGNsaTogTWF0cml4Q2xpZW50LFxuICAgIHNob3dIaWRkZW5FdmVudHM6IGJvb2xlYW4sXG4gICAgYXNIaWRkZW5Fdj86IGJvb2xlYW4sXG4pOiBPcHRpb25hbDxGYWN0b3J5PiB7XG4gICAgY29uc3QgZXZUeXBlID0gbXhFdmVudC5nZXRUeXBlKCk7IC8vIGNhY2hlIHRoaXMgdG8gcmVkdWNlIGNhbGwgc3RhY2sgZXhlY3V0aW9uIGhpdHNcblxuICAgIC8vIE5vdGU6IHdlIGF2b2lkIGNhbGxpbmcgU2V0dGluZ3NTdG9yZSB1bmxlc3MgYWJzb2x1dGVseSBuZWNlc3NhcnkgLSB0aGlzIGNvZGUgaXMgb24gdGhlIGNyaXRpY2FsIHBhdGguXG5cbiAgICBpZiAoYXNIaWRkZW5FdiAmJiBzaG93SGlkZGVuRXZlbnRzKSB7XG4gICAgICAgIHJldHVybiBKU09ORXZlbnRGYWN0b3J5O1xuICAgIH1cblxuICAgIGNvbnN0IG5vRXZlbnRGYWN0b3J5RmFjdG9yeTogKCgpID0+IE9wdGlvbmFsPEZhY3Rvcnk+KSA9ICgpID0+IHNob3dIaWRkZW5FdmVudHNcbiAgICAgICAgPyBKU09ORXZlbnRGYWN0b3J5XG4gICAgICAgIDogdW5kZWZpbmVkOyAvLyBqdXN0IGRvbid0IHJlbmRlciB0aGluZ3MgdGhhdCB3ZSBzaG91bGRuJ3QgcmVuZGVyXG5cbiAgICAvLyBXZSBydW4gYWxsIHRoZSBldmVudCB0eXBlIGNoZWNrcyBmaXJzdCBhcyB0aGV5IG1pZ2h0IG92ZXJyaWRlIHRoZSBmYWN0b3J5IGVudGlyZWx5LlxuXG4gICAgY29uc3QgbW9kZXJhdGlvblN0YXRlID0gZ2V0TWVzc2FnZU1vZGVyYXRpb25TdGF0ZShteEV2ZW50LCBjbGkpO1xuICAgIGlmIChtb2RlcmF0aW9uU3RhdGUgPT09IE1lc3NhZ2VNb2RlcmF0aW9uU3RhdGUuSElEREVOX1RPX0NVUlJFTlRfVVNFUikge1xuICAgICAgICByZXR1cm4gSGlkZGVuRXZlbnRGYWN0b3J5O1xuICAgIH1cblxuICAgIGlmIChldlR5cGUgPT09IEV2ZW50VHlwZS5Sb29tTWVzc2FnZSkge1xuICAgICAgICAvLyBkb24ndCBzaG93IHZlcmlmaWNhdGlvbiByZXF1ZXN0cyB3ZSdyZSBub3QgaW52b2x2ZWQgaW4sXG4gICAgICAgIC8vIG5vdCBldmVuIHdoZW4gc2hvd2luZyBoaWRkZW4gZXZlbnRzXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBteEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgaWYgKGNvbnRlbnQ/Lm1zZ3R5cGUgPT09IE1zZ1R5cGUuS2V5VmVyaWZpY2F0aW9uUmVxdWVzdCkge1xuICAgICAgICAgICAgY29uc3QgbWUgPSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICBpZiAobXhFdmVudC5nZXRTZW5kZXIoKSAhPT0gbWUgJiYgY29udGVudFsndG8nXSAhPT0gbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9FdmVudEZhY3RvcnlGYWN0b3J5KCk7IC8vIG5vdCBmb3IvZnJvbSB1c1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBvdmVycmlkZSB0aGUgZmFjdG9yeVxuICAgICAgICAgICAgICAgIHJldHVybiBWZXJpZmljYXRpb25SZXFGYWN0b3J5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChldlR5cGUgPT09IEV2ZW50VHlwZS5LZXlWZXJpZmljYXRpb25Eb25lKSB7XG4gICAgICAgIC8vIHRoZXNlIGV2ZW50cyBhcmUgc2VudCBieSBib3RoIHBhcnRpZXMgZHVyaW5nIHZlcmlmaWNhdGlvbiwgYnV0IHdlIG9ubHkgd2FudCB0byByZW5kZXIgb25lXG4gICAgICAgIC8vIHRpbGUgb25jZSB0aGUgdmVyaWZpY2F0aW9uIGNvbmNsdWRlcywgc28gZmlsdGVyIG91dCB0aGUgb25lIGZyb20gdGhlIG90aGVyIHBhcnR5LlxuICAgICAgICBjb25zdCBtZSA9IGNsaS5nZXRVc2VySWQoKTtcbiAgICAgICAgaWYgKG14RXZlbnQuZ2V0U2VuZGVyKCkgIT09IG1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9FdmVudEZhY3RvcnlGYWN0b3J5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXZUeXBlID09PSBFdmVudFR5cGUuS2V5VmVyaWZpY2F0aW9uQ2FuY2VsIHx8IGV2VHlwZSA9PT0gRXZlbnRUeXBlLktleVZlcmlmaWNhdGlvbkRvbmUpIHtcbiAgICAgICAgLy8gc29tZXRpbWVzIE1LZXlWZXJpZmljYXRpb25Db25jbHVzaW9uIGRlY2xpbmVzIHRvIHJlbmRlci4gSmFua2lseSBkZWNsaW5lIHRvIHJlbmRlciBhbmRcbiAgICAgICAgLy8gZmFsbCBiYWNrIHRvIHNob3dpbmcgaGlkZGVuIGV2ZW50cywgaWYgd2UncmUgdmlld2luZyBoaWRkZW4gZXZlbnRzXG4gICAgICAgIC8vIFhYWDogVGhpcyBpcyBleHRyZW1lbHkgYSBoYWNrLiBQb3NzaWJseSB0aGVzZSBjb21wb25lbnRzIHNob3VsZCBoYXZlIGFuIGludGVyZmFjZSBmb3JcbiAgICAgICAgLy8gZGVjbGluaW5nIHRvIHJlbmRlcj9cbiAgICAgICAgaWYgKCFNS2V5VmVyaWZpY2F0aW9uQ29uY2x1c2lvbi5zaG91bGRSZW5kZXIobXhFdmVudCwgbXhFdmVudC52ZXJpZmljYXRpb25SZXF1ZXN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vRXZlbnRGYWN0b3J5RmFjdG9yeSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgIGlmIChldlR5cGUgPT09IFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiKSB7XG4gICAgICAgIGxldCB0eXBlID0gbXhFdmVudC5nZXRDb250ZW50KClbJ3R5cGUnXTtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgICAvLyBkZWxldGVkL2ludmFsaWQgd2lkZ2V0IC0gdHJ5IHRoZSBwYXN0IHdpZGdldCB0eXBlXG4gICAgICAgICAgICB0eXBlID0gbXhFdmVudC5nZXRQcmV2Q29udGVudCgpWyd0eXBlJ107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHR5cGUpKSB7XG4gICAgICAgICAgICAvLyBvdmVycmlkZSB0aGUgZmFjdG9yeVxuICAgICAgICAgICAgcmV0dXJuIEppdHNpRXZlbnRGYWN0b3J5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVHJ5IGFuZCBwaWNrIGEgc3RhdGUgZXZlbnQgZmFjdG9yeSwgaWYgd2UgY2FuLlxuICAgIGlmIChteEV2ZW50LmlzU3RhdGUoKSkge1xuICAgICAgICBpZiAoc2hvdWxkRGlzcGxheUFzQmVhY29uVGlsZShteEV2ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VFdmVudEZhY3Rvcnk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoU0lOR1VMQVJfU1RBVEVfRVZFTlRTLmhhcyhldlR5cGUpICYmIG14RXZlbnQuZ2V0U3RhdGVLZXkoKSAhPT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBub0V2ZW50RmFjdG9yeUZhY3RvcnkoKTsgLy8gaW1wcm9wZXIgZXZlbnQgdHlwZSB0byByZW5kZXJcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTVEFURV9FVkVOVF9USUxFX1RZUEVTLmdldChldlR5cGUpID09PSBUZXh0dWFsRXZlbnRGYWN0b3J5ICYmICFoYXNUZXh0KG14RXZlbnQsIHNob3dIaWRkZW5FdmVudHMpKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9FdmVudEZhY3RvcnlGYWN0b3J5KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gU1RBVEVfRVZFTlRfVElMRV9UWVBFUy5nZXQoZXZUeXBlKSA/PyBub0V2ZW50RmFjdG9yeUZhY3RvcnkoKTtcbiAgICB9XG5cbiAgICAvLyBCbGFua2V0IG92ZXJyaWRlIGZvciBhbGwgZXZlbnRzLiBUaGUgTWVzc2FnZUV2ZW50IGNvbXBvbmVudCBoYW5kbGVzIHJlZGFjdGVkIHN0YXRlcyBmb3IgdXMuXG4gICAgaWYgKG14RXZlbnQuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgIHJldHVybiBNZXNzYWdlRXZlbnRGYWN0b3J5O1xuICAgIH1cblxuICAgIGlmIChteEV2ZW50LmlzUmVsYXRpb24oUmVsYXRpb25UeXBlLlJlcGxhY2UpKSB7XG4gICAgICAgIHJldHVybiBub0V2ZW50RmFjdG9yeUZhY3RvcnkoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gRVZFTlRfVElMRV9UWVBFUy5nZXQoZXZUeXBlKSA/PyBub0V2ZW50RmFjdG9yeUZhY3RvcnkoKTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgYW4gZXZlbnQgYXMgYSB0aWxlXG4gKiBAcGFyYW0gcmVuZGVyVHlwZSBUaGUgcmVuZGVyIHR5cGUuIFVzZWQgdG8gaW5mb3JtIHByb3BlcnRpZXMgZ2l2ZW4gdG8gdGhlIGV2ZW50dWFsIGNvbXBvbmVudC5cbiAqIEBwYXJhbSBwcm9wcyBUaGUgcHJvcGVydGllcyB0byBwcm92aWRlIHRvIHRoZSBldmVudHVhbCBjb21wb25lbnQuXG4gKiBAcGFyYW0gc2hvd0hpZGRlbkV2ZW50cyBXaGV0aGVyIGhpZGRlbiBldmVudHMgc2hvdWxkIGJlIHNob3duLlxuICogQHBhcmFtIGNsaSBPcHRpb25hbCBjbGllbnQgaW5zdGFuY2UgdG8gdXNlLCBvdGhlcndpc2UgdGhlIGRlZmF1bHQgTWF0cml4Q2xpZW50UGVnIHdpbGwgYmUgdXNlZC5cbiAqIEByZXR1cm5zIFRoZSB0aWxlIGFzIEpTWCwgb3IgZmFsc3kgaWYgdW5hYmxlIHRvIHJlbmRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclRpbGUoXG4gICAgcmVuZGVyVHlwZTogVGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuICAgIHByb3BzOiBFdmVudFRpbGVUeXBlUHJvcHMsXG4gICAgc2hvd0hpZGRlbkV2ZW50czogYm9vbGVhbixcbiAgICBjbGk/OiBNYXRyaXhDbGllbnQsXG4pOiBPcHRpb25hbDxKU1guRWxlbWVudD4ge1xuICAgIGNsaSA9IGNsaSA/PyBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7IC8vIGJlY2F1c2UgcGFyYW0gZGVmYXVsdHMgZG9uJ3QgZG8gdGhlIGNvcnJlY3QgdGhpbmdcblxuICAgIGNvbnN0IGZhY3RvcnkgPSBwaWNrRmFjdG9yeShwcm9wcy5teEV2ZW50LCBjbGksIHNob3dIaWRkZW5FdmVudHMpO1xuICAgIGlmICghZmFjdG9yeSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIC8vIE5vdGUgdGhhdCB3ZSBzcGxpdCBvZmYgdGhlIG9uZXMgd2UgYWN0dWFsbHkgY2FyZSBhYm91dCBoZXJlIGp1c3QgdG8gYmUgc3VyZSB0aGF0IHdlJ3JlXG4gICAgLy8gbm90IGdvaW5nIHRvIGFjY2lkZW50YWxseSBzZW5kIHRoaW5ncyB3ZSBzaG91bGRuJ3QgZnJvbSBsYXp5IGNhbGxlcnMuIEVnOiBFdmVudFRpbGUnc1xuICAgIC8vIGxhenkgY2FsbHMgb2YgYHJlbmRlclRpbGUoLi4uLCB0aGlzLnByb3BzKWAgd2lsbCBoYXZlIGEgbG90IG1vcmUgdGhhbiB3ZSBhY3R1YWxseSBjYXJlXG4gICAgLy8gYWJvdXQuXG4gICAgY29uc3Qge1xuICAgICAgICByZWYsXG4gICAgICAgIG14RXZlbnQsXG4gICAgICAgIGZvckV4cG9ydCxcbiAgICAgICAgcmVwbGFjaW5nRXZlbnRJZCxcbiAgICAgICAgZWRpdFN0YXRlLFxuICAgICAgICBoaWdobGlnaHRzLFxuICAgICAgICBoaWdobGlnaHRMaW5rLFxuICAgICAgICBzaG93VXJsUHJldmlldyxcbiAgICAgICAgcGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgb25IZWlnaHRDaGFuZ2VkLFxuICAgICAgICBjYWxsRXZlbnRHcm91cGVyLFxuICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudCxcbiAgICAgICAgaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24sXG4gICAgICAgIHRpbWVzdGFtcCxcbiAgICB9ID0gcHJvcHM7XG5cbiAgICBzd2l0Y2ggKHJlbmRlclR5cGUpIHtcbiAgICAgICAgY2FzZSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuRmlsZTpcbiAgICAgICAgY2FzZSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuTm90aWZpY2F0aW9uOlxuICAgICAgICBjYXNlIFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQ6XG4gICAgICAgICAgICAvLyBXZSBvbmx5IHdhbnQgYSBzdWJzZXQgb2YgcHJvcHMsIHNvIHdlIGRvbid0IGVuZCB1cCBjYXVzaW5nIGlzc3VlcyBmb3IgZG93bnN0cmVhbSBjb21wb25lbnRzLlxuICAgICAgICAgICAgcmV0dXJuIGZhY3RvcnkocHJvcHMucmVmLCB7XG4gICAgICAgICAgICAgICAgbXhFdmVudCxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRzLFxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodExpbmssXG4gICAgICAgICAgICAgICAgc2hvd1VybFByZXZpZXcsXG4gICAgICAgICAgICAgICAgb25IZWlnaHRDaGFuZ2VkLFxuICAgICAgICAgICAgICAgIGVkaXRTdGF0ZSxcbiAgICAgICAgICAgICAgICByZXBsYWNpbmdFdmVudElkLFxuICAgICAgICAgICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50LFxuICAgICAgICAgICAgICAgIGlzU2VlaW5nVGhyb3VnaE1lc3NhZ2VIaWRkZW5Gb3JNb2RlcmF0aW9uLFxuICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3IsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIE5FQVJMWSBBTEwgVEhFIE9QVElPTlMhXG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShyZWYsIHtcbiAgICAgICAgICAgICAgICBteEV2ZW50LFxuICAgICAgICAgICAgICAgIGZvckV4cG9ydCxcbiAgICAgICAgICAgICAgICByZXBsYWNpbmdFdmVudElkLFxuICAgICAgICAgICAgICAgIGVkaXRTdGF0ZSxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRzLFxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodExpbmssXG4gICAgICAgICAgICAgICAgc2hvd1VybFByZXZpZXcsXG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQsXG4gICAgICAgICAgICAgICAgY2FsbEV2ZW50R3JvdXBlcixcbiAgICAgICAgICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudCxcbiAgICAgICAgICAgICAgICBpc1NlZWluZ1Rocm91Z2hNZXNzYWdlSGlkZGVuRm9yTW9kZXJhdGlvbixcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXAsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogQSB2ZXJzaW9uIG9mIHJlbmRlclRpbGUoKSBzcGVjaWZpY2FsbHkgZm9yIHJlcGxpZXMuXG4gKiBAcGFyYW0gcHJvcHMgVGhlIHByb3BlcnRpZXMgdG8gc3BlY2lmeSBvbiB0aGUgZXZlbnR1YWwgb2JqZWN0LlxuICogQHBhcmFtIHNob3dIaWRkZW5FdmVudHMgV2hldGhlciBoaWRkZW4gZXZlbnRzIHNob3VsZCBiZSBzaG93bi5cbiAqIEBwYXJhbSBjbGkgT3B0aW9uYWwgY2xpZW50IGluc3RhbmNlIHRvIHVzZSwgb3RoZXJ3aXNlIHRoZSBkZWZhdWx0IE1hdHJpeENsaWVudFBlZyB3aWxsIGJlIHVzZWQuXG4gKiBAcmV0dXJucyBUaGUgdGlsZSBhcyBKU1gsIG9yIGZhbHN5IGlmIHVuYWJsZSB0byByZW5kZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJSZXBseVRpbGUoXG4gICAgcHJvcHM6IEV2ZW50VGlsZVR5cGVQcm9wcyxcbiAgICBzaG93SGlkZGVuRXZlbnRzOiBib29sZWFuLFxuICAgIGNsaT86IE1hdHJpeENsaWVudCxcbik6IE9wdGlvbmFsPEpTWC5FbGVtZW50PiB7XG4gICAgY2xpID0gY2xpID8/IE1hdHJpeENsaWVudFBlZy5nZXQoKTsgLy8gYmVjYXVzZSBwYXJhbSBkZWZhdWx0cyBkb24ndCBkbyB0aGUgY29ycmVjdCB0aGluZ1xuXG4gICAgY29uc3QgZmFjdG9yeSA9IHBpY2tGYWN0b3J5KHByb3BzLm14RXZlbnQsIGNsaSwgc2hvd0hpZGRlbkV2ZW50cyk7XG4gICAgaWYgKCFmYWN0b3J5KSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgLy8gU2VlIHJlbmRlclRpbGUoKSBmb3Igd2h5IHdlIHNwbGl0IG9mZiBzbyBtdWNoXG4gICAgY29uc3Qge1xuICAgICAgICByZWYsXG4gICAgICAgIG14RXZlbnQsXG4gICAgICAgIGhpZ2hsaWdodHMsXG4gICAgICAgIGhpZ2hsaWdodExpbmssXG4gICAgICAgIG9uSGVpZ2h0Q2hhbmdlZCxcbiAgICAgICAgc2hvd1VybFByZXZpZXcsXG4gICAgICAgIG92ZXJyaWRlQm9keVR5cGVzLFxuICAgICAgICBvdmVycmlkZUV2ZW50VHlwZXMsXG4gICAgICAgIHJlcGxhY2luZ0V2ZW50SWQsXG4gICAgICAgIG1heEltYWdlSGVpZ2h0LFxuICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudCxcbiAgICAgICAgaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24sXG4gICAgICAgIHBlcm1hbGlua0NyZWF0b3IsXG4gICAgfSA9IHByb3BzO1xuXG4gICAgcmV0dXJuIGZhY3RvcnkocmVmLCB7XG4gICAgICAgIG14RXZlbnQsXG4gICAgICAgIGhpZ2hsaWdodHMsXG4gICAgICAgIGhpZ2hsaWdodExpbmssXG4gICAgICAgIG9uSGVpZ2h0Q2hhbmdlZCxcbiAgICAgICAgc2hvd1VybFByZXZpZXcsXG4gICAgICAgIG92ZXJyaWRlQm9keVR5cGVzLFxuICAgICAgICBvdmVycmlkZUV2ZW50VHlwZXMsXG4gICAgICAgIHJlcGxhY2luZ0V2ZW50SWQsXG4gICAgICAgIG1heEltYWdlSGVpZ2h0LFxuICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudCxcbiAgICAgICAgaXNTZWVpbmdUaHJvdWdoTWVzc2FnZUhpZGRlbkZvck1vZGVyYXRpb24sXG4gICAgICAgIHBlcm1hbGlua0NyZWF0b3IsXG4gICAgfSk7XG59XG5cbi8vIFhYWDogdGhpcydsbCBldmVudHVhbGx5IGJlIGR5bmFtaWMgYmFzZWQgb24gdGhlIGZpZWxkcyBvbmNlIHdlIGhhdmUgZXh0ZW5zaWJsZSBldmVudCB0eXBlc1xuY29uc3QgbWVzc2FnZVR5cGVzID0gW0V2ZW50VHlwZS5Sb29tTWVzc2FnZSwgRXZlbnRUeXBlLlN0aWNrZXJdO1xuZXhwb3J0IGZ1bmN0aW9uIGlzTWVzc2FnZUV2ZW50KGV2OiBNYXRyaXhFdmVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAobWVzc2FnZVR5cGVzLmluY2x1ZGVzKGV2LmdldFR5cGUoKSBhcyBFdmVudFR5cGUpKSB8fCBNX1BPTExfU1RBUlQubWF0Y2hlcyhldi5nZXRUeXBlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGF2ZVJlbmRlcmVyRm9yRXZlbnQobXhFdmVudDogTWF0cml4RXZlbnQsIHNob3dIaWRkZW5FdmVudHM6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICAvLyBPbmx5IHNob3cgXCJNZXNzYWdlIGRlbGV0ZWRcIiB0aWxlIGZvciBwbGFpbiBtZXNzYWdlIGV2ZW50cywgZW5jcnlwdGVkIGV2ZW50cyxcbiAgICAvLyBhbmQgc3RhdGUgZXZlbnRzIGFzIHRoZXknbGwgbGlrZWx5IHN0aWxsIGNvbnRhaW4gZW5vdWdoIGtleXMgdG8gYmUgcmVsZXZhbnQuXG4gICAgaWYgKG14RXZlbnQuaXNSZWRhY3RlZCgpICYmICFteEV2ZW50LmlzRW5jcnlwdGVkKCkgJiYgIWlzTWVzc2FnZUV2ZW50KG14RXZlbnQpICYmICFteEV2ZW50LmlzU3RhdGUoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gTm8gdGlsZSBmb3IgcmVwbGFjZW1lbnQgZXZlbnRzIHNpbmNlIHRoZXkgdXBkYXRlIHRoZSBvcmlnaW5hbCB0aWxlXG4gICAgaWYgKG14RXZlbnQuaXNSZWxhdGlvbihSZWxhdGlvblR5cGUuUmVwbGFjZSkpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBwaWNrRmFjdG9yeShteEV2ZW50LCBNYXRyaXhDbGllbnRQZWcuZ2V0KCksIHNob3dIaWRkZW5FdmVudHMpO1xuICAgIGlmICghaGFuZGxlcikgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChoYW5kbGVyID09PSBUZXh0dWFsRXZlbnRGYWN0b3J5KSB7XG4gICAgICAgIHJldHVybiBoYXNUZXh0KG14RXZlbnQsIHNob3dIaWRkZW5FdmVudHMpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PT0gU1RBVEVfRVZFTlRfVElMRV9UWVBFUy5nZXQoRXZlbnRUeXBlLlJvb21DcmVhdGUpKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKG14RXZlbnQuZ2V0Q29udGVudCgpWydwcmVkZWNlc3NvciddKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT09IEpTT05FdmVudEZhY3RvcnkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAg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