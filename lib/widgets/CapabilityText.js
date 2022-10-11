"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CapabilityText = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrixWidgetApi = require("matrix-widget-api");

var _event = require("matrix-js-sdk/src/@types/event");

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../languageHandler");

var _ElementWidgetCapabilities = require("../stores/widgets/ElementWidgetCapabilities");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _TextWithTooltip = _interopRequireDefault(require("../components/views/elements/TextWithTooltip"));

/*
Copyright 2020 - 2021 The Matrix.org Foundation C.I.C.

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
// eslint-disable-line @typescript-eslint/naming-convention
const GENERIC_WIDGET_KIND = "generic";

class CapabilityText {
  static bylineFor(eventCap) {
    if (eventCap.kind === _matrixWidgetApi.EventKind.State) {
      return !eventCap.keyStr ? (0, _languageHandler._t)("with an empty state key") : (0, _languageHandler._t)("with state key %(stateKey)s", {
        stateKey: eventCap.keyStr
      });
    }

    return null; // room messages are handled specially
  }

  static for(capability, kind) {
    // TODO: Support MSC3819 (to-device capabilities)
    // First see if we have a super simple line of text to provide back
    if (CapabilityText.simpleCaps[capability]) {
      const textForKind = CapabilityText.simpleCaps[capability];
      if (textForKind[kind]) return {
        primary: (0, _languageHandler._t)(textForKind[kind])
      };
      if (textForKind[GENERIC_WIDGET_KIND]) return {
        primary: (0, _languageHandler._t)(textForKind[GENERIC_WIDGET_KIND])
      }; // ... we'll fall through to the generic capability processing at the end of this
      // function if we fail to generate a string for the capability.
    } // Try to handle timeline capabilities. The text here implies that the caller has sorted
    // the timeline caps to the end for UI purposes.


    if ((0, _matrixWidgetApi.isTimelineCapability)(capability)) {
      if ((0, _matrixWidgetApi.isTimelineCapabilityFor)(capability, _matrixWidgetApi.Symbols.AnyRoom)) {
        return {
          primary: (0, _languageHandler._t)("The above, but in any room you are joined or invited to as well")
        };
      } else {
        const roomId = (0, _matrixWidgetApi.getTimelineRoomIDFromCapability)(capability);

        const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

        return {
          primary: (0, _languageHandler._t)("The above, but in <Room /> as well", {}, {
            Room: () => {
              if (room) {
                return /*#__PURE__*/_react.default.createElement(_TextWithTooltip.default, {
                  tooltip: room.getCanonicalAlias() ?? roomId
                }, /*#__PURE__*/_react.default.createElement("b", null, room.name));
              } else {
                return /*#__PURE__*/_react.default.createElement("b", null, /*#__PURE__*/_react.default.createElement("code", null, roomId));
              }
            }
          })
        };
      }
    } // We didn't have a super simple line of text, so try processing the capability as the
    // more complex event send/receive permission type.


    const [eventCap] = _matrixWidgetApi.WidgetEventCapability.findEventCapabilities([capability]);

    if (eventCap) {
      // Special case room messages so they show up a bit cleaner to the user. Result is
      // effectively "Send images" instead of "Send messages... of type images" if we were
      // to handle the msgtype nuances in this function.
      if (eventCap.kind === _matrixWidgetApi.EventKind.Event && eventCap.eventType === _event.EventType.RoomMessage) {
        return CapabilityText.forRoomMessageCap(eventCap, kind);
      } // See if we have a static line of text to provide for the given event type and
      // direction. The hope is that we do for common event types for friendlier copy.


      const evSendRecv = eventCap.kind === _matrixWidgetApi.EventKind.State ? CapabilityText.stateSendRecvCaps : CapabilityText.nonStateSendRecvCaps;

      if (evSendRecv[eventCap.eventType]) {
        const textForKind = evSendRecv[eventCap.eventType];
        const textForDirection = textForKind[kind] || textForKind[GENERIC_WIDGET_KIND];

        if (textForDirection && textForDirection[eventCap.direction]) {
          return {
            primary: (0, _languageHandler._t)(textForDirection[eventCap.direction]) // no byline because we would have already represented the event properly

          };
        }
      } // We don't have anything simple, so just return a generic string for the event cap


      if (kind === _matrixWidgetApi.WidgetKind.Room) {
        if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
          return {
            primary: (0, _languageHandler._t)("Send <b>%(eventType)s</b> events as you in this room", {
              eventType: eventCap.eventType
            }, {
              b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
            }),
            byline: CapabilityText.bylineFor(eventCap)
          };
        } else {
          return {
            primary: (0, _languageHandler._t)("See <b>%(eventType)s</b> events posted to this room", {
              eventType: eventCap.eventType
            }, {
              b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
            }),
            byline: CapabilityText.bylineFor(eventCap)
          };
        }
      } else {
        // assume generic
        if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
          return {
            primary: (0, _languageHandler._t)("Send <b>%(eventType)s</b> events as you in your active room", {
              eventType: eventCap.eventType
            }, {
              b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
            }),
            byline: CapabilityText.bylineFor(eventCap)
          };
        } else {
          return {
            primary: (0, _languageHandler._t)("See <b>%(eventType)s</b> events posted to your active room", {
              eventType: eventCap.eventType
            }, {
              b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
            }),
            byline: CapabilityText.bylineFor(eventCap)
          };
        }
      }
    } // We don't have enough context to render this capability specially, so we'll present it as-is


    return {
      primary: (0, _languageHandler._t)("The <b>%(capability)s</b> capability", {
        capability
      }, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      })
    };
  }

  static forRoomMessageCap(eventCap, kind) {
    // First handle the case of "all messages" to make the switch later on a bit clearer
    if (!eventCap.keyStr) {
      if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
        return {
          primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send messages as you in this room") : (0, _languageHandler._t)("Send messages as you in your active room")
        };
      } else {
        return {
          primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See messages posted to this room") : (0, _languageHandler._t)("See messages posted to your active room")
        };
      }
    } // Now handle all the message types we care about. There are more message types available, however
    // they are not as common so we don't bother rendering them. They'll fall into the generic case.


    switch (eventCap.keyStr) {
      case _event.MsgType.Text:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send text messages as you in this room") : (0, _languageHandler._t)("Send text messages as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See text messages posted to this room") : (0, _languageHandler._t)("See text messages posted to your active room")
            };
          }
        }

      case _event.MsgType.Emote:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send emotes as you in this room") : (0, _languageHandler._t)("Send emotes as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See emotes posted to this room") : (0, _languageHandler._t)("See emotes posted to your active room")
            };
          }
        }

      case _event.MsgType.Image:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send images as you in this room") : (0, _languageHandler._t)("Send images as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See images posted to this room") : (0, _languageHandler._t)("See images posted to your active room")
            };
          }
        }

      case _event.MsgType.Video:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send videos as you in this room") : (0, _languageHandler._t)("Send videos as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See videos posted to this room") : (0, _languageHandler._t)("See videos posted to your active room")
            };
          }
        }

      case _event.MsgType.File:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send general files as you in this room") : (0, _languageHandler._t)("Send general files as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See general files posted to this room") : (0, _languageHandler._t)("See general files posted to your active room")
            };
          }
        }

      default:
        {
          let primary;

          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            if (kind === _matrixWidgetApi.WidgetKind.Room) {
              primary = (0, _languageHandler._t)("Send <b>%(msgtype)s</b> messages as you in this room", {
                msgtype: eventCap.keyStr
              }, {
                b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
              });
            } else {
              primary = (0, _languageHandler._t)("Send <b>%(msgtype)s</b> messages as you in your active room", {
                msgtype: eventCap.keyStr
              }, {
                b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
              });
            }
          } else {
            if (kind === _matrixWidgetApi.WidgetKind.Room) {
              primary = (0, _languageHandler._t)("See <b>%(msgtype)s</b> messages posted to this room", {
                msgtype: eventCap.keyStr
              }, {
                b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
              });
            } else {
              primary = (0, _languageHandler._t)("See <b>%(msgtype)s</b> messages posted to your active room", {
                msgtype: eventCap.keyStr
              }, {
                b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
              });
            }
          }

          return {
            primary
          };
        }
    }
  }

}

exports.CapabilityText = CapabilityText;
(0, _defineProperty2.default)(CapabilityText, "simpleCaps", {
  [_matrixWidgetApi.MatrixCapabilities.AlwaysOnScreen]: {
    [_matrixWidgetApi.WidgetKind.Room]: (0, _languageHandler._td)("Remain on your screen when viewing another room, when running"),
    [GENERIC_WIDGET_KIND]: (0, _languageHandler._td)("Remain on your screen while running")
  },
  [_matrixWidgetApi.MatrixCapabilities.StickerSending]: {
    [_matrixWidgetApi.WidgetKind.Room]: (0, _languageHandler._td)("Send stickers into this room"),
    [GENERIC_WIDGET_KIND]: (0, _languageHandler._td)("Send stickers into your active room")
  },
  [_ElementWidgetCapabilities.ElementWidgetCapabilities.CanChangeViewedRoom]: {
    [GENERIC_WIDGET_KIND]: (0, _languageHandler._td)("Change which room you're viewing")
  },
  [_matrixWidgetApi.MatrixCapabilities.MSC2931Navigate]: {
    [GENERIC_WIDGET_KIND]: (0, _languageHandler._td)("Change which room, message, or user you're viewing")
  }
});
(0, _defineProperty2.default)(CapabilityText, "stateSendRecvCaps", {
  [_event.EventType.RoomTopic]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the topic of this room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the topic changes in this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the topic of your active room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the topic changes in your active room")
    }
  },
  [_event.EventType.RoomName]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the name of this room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the name changes in this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the name of your active room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the name changes in your active room")
    }
  },
  [_event.EventType.RoomAvatar]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the avatar of this room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the avatar changes in this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the avatar of your active room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the avatar changes in your active room")
    }
  },
  [_event.EventType.RoomMember]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Remove, ban, or invite people to this room, and make you leave"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when people join, leave, or are invited to this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Remove, ban, or invite people to your active room, and make you leave"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when people join, leave, or are invited to your active room")
    }
  }
});
(0, _defineProperty2.default)(CapabilityText, "nonStateSendRecvCaps", {
  [_event.EventType.Sticker]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Send stickers to this room as you"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when a sticker is posted in this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Send stickers to your active room as you"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when anyone posts a sticker to your active room")
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHRU5FUklDX1dJREdFVF9LSU5EIiwiQ2FwYWJpbGl0eVRleHQiLCJieWxpbmVGb3IiLCJldmVudENhcCIsImtpbmQiLCJFdmVudEtpbmQiLCJTdGF0ZSIsImtleVN0ciIsIl90Iiwic3RhdGVLZXkiLCJmb3IiLCJjYXBhYmlsaXR5Iiwic2ltcGxlQ2FwcyIsInRleHRGb3JLaW5kIiwicHJpbWFyeSIsImlzVGltZWxpbmVDYXBhYmlsaXR5IiwiaXNUaW1lbGluZUNhcGFiaWxpdHlGb3IiLCJTeW1ib2xzIiwiQW55Um9vbSIsInJvb21JZCIsImdldFRpbWVsaW5lUm9vbUlERnJvbUNhcGFiaWxpdHkiLCJyb29tIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0Um9vbSIsIlJvb20iLCJnZXRDYW5vbmljYWxBbGlhcyIsIm5hbWUiLCJXaWRnZXRFdmVudENhcGFiaWxpdHkiLCJmaW5kRXZlbnRDYXBhYmlsaXRpZXMiLCJFdmVudCIsImV2ZW50VHlwZSIsIkV2ZW50VHlwZSIsIlJvb21NZXNzYWdlIiwiZm9yUm9vbU1lc3NhZ2VDYXAiLCJldlNlbmRSZWN2Iiwic3RhdGVTZW5kUmVjdkNhcHMiLCJub25TdGF0ZVNlbmRSZWN2Q2FwcyIsInRleHRGb3JEaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJXaWRnZXRLaW5kIiwiRXZlbnREaXJlY3Rpb24iLCJTZW5kIiwiYiIsInN1YiIsImJ5bGluZSIsIk1zZ1R5cGUiLCJUZXh0IiwiRW1vdGUiLCJJbWFnZSIsIlZpZGVvIiwiRmlsZSIsIm1zZ3R5cGUiLCJNYXRyaXhDYXBhYmlsaXRpZXMiLCJBbHdheXNPblNjcmVlbiIsIl90ZCIsIlN0aWNrZXJTZW5kaW5nIiwiRWxlbWVudFdpZGdldENhcGFiaWxpdGllcyIsIkNhbkNoYW5nZVZpZXdlZFJvb20iLCJNU0MyOTMxTmF2aWdhdGUiLCJSb29tVG9waWMiLCJSZWNlaXZlIiwiUm9vbU5hbWUiLCJSb29tQXZhdGFyIiwiUm9vbU1lbWJlciIsIlN0aWNrZXIiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvd2lkZ2V0cy9DYXBhYmlsaXR5VGV4dC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7XG4gICAgQ2FwYWJpbGl0eSxcbiAgICBFdmVudERpcmVjdGlvbixcbiAgICBFdmVudEtpbmQsXG4gICAgZ2V0VGltZWxpbmVSb29tSURGcm9tQ2FwYWJpbGl0eSxcbiAgICBpc1RpbWVsaW5lQ2FwYWJpbGl0eSxcbiAgICBpc1RpbWVsaW5lQ2FwYWJpbGl0eUZvcixcbiAgICBNYXRyaXhDYXBhYmlsaXRpZXMsIFN5bWJvbHMsXG4gICAgV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LFxuICAgIFdpZGdldEtpbmQsXG59IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlLCBNc2dUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBfdCwgX3RkLCBUcmFuc2xhdGVkU3RyaW5nIH0gZnJvbSBcIi4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgRWxlbWVudFdpZGdldENhcGFiaWxpdGllcyB9IGZyb20gXCIuLi9zdG9yZXMvd2lkZ2V0cy9FbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgVGV4dFdpdGhUb29sdGlwIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1RleHRXaXRoVG9vbHRpcFwiO1xuXG50eXBlIEdFTkVSSUNfV0lER0VUX0tJTkQgPSBcImdlbmVyaWNcIjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbmNvbnN0IEdFTkVSSUNfV0lER0VUX0tJTkQ6IEdFTkVSSUNfV0lER0VUX0tJTkQgPSBcImdlbmVyaWNcIjtcblxuaW50ZXJmYWNlIElTZW5kUmVjdlN0YXRpY0NhcFRleHQge1xuICAgIC8vIEB0cy1pZ25vcmUgLSBUUyB3YW50cyB0aGUga2V5IHRvIGJlIGEgc3RyaW5nLCBidXQgd2Uga25vdyBiZXR0ZXJcbiAgICBbZXZlbnRUeXBlOiBFdmVudFR5cGVdOiB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBUUyB3YW50cyB0aGUga2V5IHRvIGJlIGEgc3RyaW5nLCBidXQgd2Uga25vdyBiZXR0ZXJcbiAgICAgICAgW3dpZGdldEtpbmQ6IFdpZGdldEtpbmQgfCBHRU5FUklDX1dJREdFVF9LSU5EXToge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIHRoZSBrZXkgdG8gYmUgYSBzdHJpbmcsIGJ1dCB3ZSBrbm93IGJldHRlclxuICAgICAgICAgICAgW2RpcmVjdGlvbjogRXZlbnREaXJlY3Rpb25dOiBzdHJpbmc7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuaW50ZXJmYWNlIElTdGF0aWNDYXBUZXh0IHtcbiAgICAvLyBAdHMtaWdub3JlIC0gVFMgd2FudHMgdGhlIGtleSB0byBiZSBhIHN0cmluZywgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgW2NhcGFiaWxpdHk6IENhcGFiaWxpdHldOiB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSBUUyB3YW50cyB0aGUga2V5IHRvIGJlIGEgc3RyaW5nLCBidXQgd2Uga25vdyBiZXR0ZXJcbiAgICAgICAgW3dpZGdldEtpbmQ6IFdpZGdldEtpbmQgfCBHRU5FUklDX1dJREdFVF9LSU5EXTogc3RyaW5nO1xuICAgIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHJhbnNsYXRlZENhcGFiaWxpdHlUZXh0IHtcbiAgICBwcmltYXJ5OiBUcmFuc2xhdGVkU3RyaW5nO1xuICAgIGJ5bGluZT86IFRyYW5zbGF0ZWRTdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBDYXBhYmlsaXR5VGV4dCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgc2ltcGxlQ2FwczogSVN0YXRpY0NhcFRleHQgPSB7XG4gICAgICAgIFtNYXRyaXhDYXBhYmlsaXRpZXMuQWx3YXlzT25TY3JlZW5dOiB7XG4gICAgICAgICAgICBbV2lkZ2V0S2luZC5Sb29tXTogX3RkKFwiUmVtYWluIG9uIHlvdXIgc2NyZWVuIHdoZW4gdmlld2luZyBhbm90aGVyIHJvb20sIHdoZW4gcnVubmluZ1wiKSxcbiAgICAgICAgICAgIFtHRU5FUklDX1dJREdFVF9LSU5EXTogX3RkKFwiUmVtYWluIG9uIHlvdXIgc2NyZWVuIHdoaWxlIHJ1bm5pbmdcIiksXG4gICAgICAgIH0sXG4gICAgICAgIFtNYXRyaXhDYXBhYmlsaXRpZXMuU3RpY2tlclNlbmRpbmddOiB7XG4gICAgICAgICAgICBbV2lkZ2V0S2luZC5Sb29tXTogX3RkKFwiU2VuZCBzdGlja2VycyBpbnRvIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgICAgIFtHRU5FUklDX1dJREdFVF9LSU5EXTogX3RkKFwiU2VuZCBzdGlja2VycyBpbnRvIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgIH0sXG4gICAgICAgIFtFbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzLkNhbkNoYW5nZVZpZXdlZFJvb21dOiB7XG4gICAgICAgICAgICBbR0VORVJJQ19XSURHRVRfS0lORF06IF90ZChcIkNoYW5nZSB3aGljaCByb29tIHlvdSdyZSB2aWV3aW5nXCIpLFxuICAgICAgICB9LFxuICAgICAgICBbTWF0cml4Q2FwYWJpbGl0aWVzLk1TQzI5MzFOYXZpZ2F0ZV06IHtcbiAgICAgICAgICAgIFtHRU5FUklDX1dJREdFVF9LSU5EXTogX3RkKFwiQ2hhbmdlIHdoaWNoIHJvb20sIG1lc3NhZ2UsIG9yIHVzZXIgeW91J3JlIHZpZXdpbmdcIiksXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHByaXZhdGUgc3RhdGljIHN0YXRlU2VuZFJlY3ZDYXBzOiBJU2VuZFJlY3ZTdGF0aWNDYXBUZXh0ID0ge1xuICAgICAgICBbRXZlbnRUeXBlLlJvb21Ub3BpY106IHtcbiAgICAgICAgICAgIFtXaWRnZXRLaW5kLlJvb21dOiB7XG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlNlbmRdOiBfdGQoXCJDaGFuZ2UgdGhlIHRvcGljIG9mIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uUmVjZWl2ZV06IF90ZChcIlNlZSB3aGVuIHRoZSB0b3BpYyBjaGFuZ2VzIGluIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbR0VORVJJQ19XSURHRVRfS0lORF06IHtcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uU2VuZF06IF90ZChcIkNoYW5nZSB0aGUgdG9waWMgb2YgeW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uUmVjZWl2ZV06IF90ZChcIlNlZSB3aGVuIHRoZSB0b3BpYyBjaGFuZ2VzIGluIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBbRXZlbnRUeXBlLlJvb21OYW1lXToge1xuICAgICAgICAgICAgW1dpZGdldEtpbmQuUm9vbV06IHtcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uU2VuZF06IF90ZChcIkNoYW5nZSB0aGUgbmFtZSBvZiB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlJlY2VpdmVdOiBfdGQoXCJTZWUgd2hlbiB0aGUgbmFtZSBjaGFuZ2VzIGluIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbR0VORVJJQ19XSURHRVRfS0lORF06IHtcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uU2VuZF06IF90ZChcIkNoYW5nZSB0aGUgbmFtZSBvZiB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5SZWNlaXZlXTogX3RkKFwiU2VlIHdoZW4gdGhlIG5hbWUgY2hhbmdlcyBpbiB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgW0V2ZW50VHlwZS5Sb29tQXZhdGFyXToge1xuICAgICAgICAgICAgW1dpZGdldEtpbmQuUm9vbV06IHtcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uU2VuZF06IF90ZChcIkNoYW5nZSB0aGUgYXZhdGFyIG9mIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uUmVjZWl2ZV06IF90ZChcIlNlZSB3aGVuIHRoZSBhdmF0YXIgY2hhbmdlcyBpbiB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW0dFTkVSSUNfV0lER0VUX0tJTkRdOiB7XG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlNlbmRdOiBfdGQoXCJDaGFuZ2UgdGhlIGF2YXRhciBvZiB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5SZWNlaXZlXTogX3RkKFwiU2VlIHdoZW4gdGhlIGF2YXRhciBjaGFuZ2VzIGluIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBbRXZlbnRUeXBlLlJvb21NZW1iZXJdOiB7XG4gICAgICAgICAgICBbV2lkZ2V0S2luZC5Sb29tXToge1xuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5TZW5kXTogX3RkKFwiUmVtb3ZlLCBiYW4sIG9yIGludml0ZSBwZW9wbGUgdG8gdGhpcyByb29tLCBhbmQgbWFrZSB5b3UgbGVhdmVcIiksXG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlJlY2VpdmVdOiBfdGQoXCJTZWUgd2hlbiBwZW9wbGUgam9pbiwgbGVhdmUsIG9yIGFyZSBpbnZpdGVkIHRvIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbR0VORVJJQ19XSURHRVRfS0lORF06IHtcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uU2VuZF06IF90ZChcIlJlbW92ZSwgYmFuLCBvciBpbnZpdGUgcGVvcGxlIHRvIHlvdXIgYWN0aXZlIHJvb20sIGFuZCBtYWtlIHlvdSBsZWF2ZVwiKSxcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uUmVjZWl2ZV06IF90ZChcIlNlZSB3aGVuIHBlb3BsZSBqb2luLCBsZWF2ZSwgb3IgYXJlIGludml0ZWQgdG8geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHByaXZhdGUgc3RhdGljIG5vblN0YXRlU2VuZFJlY3ZDYXBzOiBJU2VuZFJlY3ZTdGF0aWNDYXBUZXh0ID0ge1xuICAgICAgICBbRXZlbnRUeXBlLlN0aWNrZXJdOiB7XG4gICAgICAgICAgICBbV2lkZ2V0S2luZC5Sb29tXToge1xuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5TZW5kXTogX3RkKFwiU2VuZCBzdGlja2VycyB0byB0aGlzIHJvb20gYXMgeW91XCIpLFxuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5SZWNlaXZlXTogX3RkKFwiU2VlIHdoZW4gYSBzdGlja2VyIGlzIHBvc3RlZCBpbiB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW0dFTkVSSUNfV0lER0VUX0tJTkRdOiB7XG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlNlbmRdOiBfdGQoXCJTZW5kIHN0aWNrZXJzIHRvIHlvdXIgYWN0aXZlIHJvb20gYXMgeW91XCIpLFxuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5SZWNlaXZlXTogX3RkKFwiU2VlIHdoZW4gYW55b25lIHBvc3RzIGEgc3RpY2tlciB0byB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYnlsaW5lRm9yKGV2ZW50Q2FwOiBXaWRnZXRFdmVudENhcGFiaWxpdHkpOiBUcmFuc2xhdGVkU3RyaW5nIHtcbiAgICAgICAgaWYgKGV2ZW50Q2FwLmtpbmQgPT09IEV2ZW50S2luZC5TdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuICFldmVudENhcC5rZXlTdHJcbiAgICAgICAgICAgICAgICA/IF90KFwid2l0aCBhbiBlbXB0eSBzdGF0ZSBrZXlcIilcbiAgICAgICAgICAgICAgICA6IF90KFwid2l0aCBzdGF0ZSBrZXkgJShzdGF0ZUtleSlzXCIsIHsgc3RhdGVLZXk6IGV2ZW50Q2FwLmtleVN0ciB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDsgLy8gcm9vbSBtZXNzYWdlcyBhcmUgaGFuZGxlZCBzcGVjaWFsbHlcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGZvcihjYXBhYmlsaXR5OiBDYXBhYmlsaXR5LCBraW5kOiBXaWRnZXRLaW5kKTogVHJhbnNsYXRlZENhcGFiaWxpdHlUZXh0IHtcbiAgICAgICAgLy8gVE9ETzogU3VwcG9ydCBNU0MzODE5ICh0by1kZXZpY2UgY2FwYWJpbGl0aWVzKVxuXG4gICAgICAgIC8vIEZpcnN0IHNlZSBpZiB3ZSBoYXZlIGEgc3VwZXIgc2ltcGxlIGxpbmUgb2YgdGV4dCB0byBwcm92aWRlIGJhY2tcbiAgICAgICAgaWYgKENhcGFiaWxpdHlUZXh0LnNpbXBsZUNhcHNbY2FwYWJpbGl0eV0pIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHRGb3JLaW5kID0gQ2FwYWJpbGl0eVRleHQuc2ltcGxlQ2Fwc1tjYXBhYmlsaXR5XTtcbiAgICAgICAgICAgIGlmICh0ZXh0Rm9yS2luZFtraW5kXSkgcmV0dXJuIHsgcHJpbWFyeTogX3QodGV4dEZvcktpbmRba2luZF0pIH07XG4gICAgICAgICAgICBpZiAodGV4dEZvcktpbmRbR0VORVJJQ19XSURHRVRfS0lORF0pIHJldHVybiB7IHByaW1hcnk6IF90KHRleHRGb3JLaW5kW0dFTkVSSUNfV0lER0VUX0tJTkRdKSB9O1xuXG4gICAgICAgICAgICAvLyAuLi4gd2UnbGwgZmFsbCB0aHJvdWdoIHRvIHRoZSBnZW5lcmljIGNhcGFiaWxpdHkgcHJvY2Vzc2luZyBhdCB0aGUgZW5kIG9mIHRoaXNcbiAgICAgICAgICAgIC8vIGZ1bmN0aW9uIGlmIHdlIGZhaWwgdG8gZ2VuZXJhdGUgYSBzdHJpbmcgZm9yIHRoZSBjYXBhYmlsaXR5LlxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJ5IHRvIGhhbmRsZSB0aW1lbGluZSBjYXBhYmlsaXRpZXMuIFRoZSB0ZXh0IGhlcmUgaW1wbGllcyB0aGF0IHRoZSBjYWxsZXIgaGFzIHNvcnRlZFxuICAgICAgICAvLyB0aGUgdGltZWxpbmUgY2FwcyB0byB0aGUgZW5kIGZvciBVSSBwdXJwb3Nlcy5cbiAgICAgICAgaWYgKGlzVGltZWxpbmVDYXBhYmlsaXR5KGNhcGFiaWxpdHkpKSB7XG4gICAgICAgICAgICBpZiAoaXNUaW1lbGluZUNhcGFiaWxpdHlGb3IoY2FwYWJpbGl0eSwgU3ltYm9scy5BbnlSb29tKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHByaW1hcnk6IF90KFwiVGhlIGFib3ZlLCBidXQgaW4gYW55IHJvb20geW91IGFyZSBqb2luZWQgb3IgaW52aXRlZCB0byBhcyB3ZWxsXCIpIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGdldFRpbWVsaW5lUm9vbUlERnJvbUNhcGFiaWxpdHkoY2FwYWJpbGl0eSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogX3QoXCJUaGUgYWJvdmUsIGJ1dCBpbiA8Um9vbSAvPiBhcyB3ZWxsXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBSb29tOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxUZXh0V2l0aFRvb2x0aXAgdG9vbHRpcD17cm9vbS5nZXRDYW5vbmljYWxBbGlhcygpID8/IHJvb21JZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Yj57IHJvb20ubmFtZSB9PC9iPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RleHRXaXRoVG9vbHRpcD47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxiPjxjb2RlPnsgcm9vbUlkIH08L2NvZGU+PC9iPjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgZGlkbid0IGhhdmUgYSBzdXBlciBzaW1wbGUgbGluZSBvZiB0ZXh0LCBzbyB0cnkgcHJvY2Vzc2luZyB0aGUgY2FwYWJpbGl0eSBhcyB0aGVcbiAgICAgICAgLy8gbW9yZSBjb21wbGV4IGV2ZW50IHNlbmQvcmVjZWl2ZSBwZXJtaXNzaW9uIHR5cGUuXG4gICAgICAgIGNvbnN0IFtldmVudENhcF0gPSBXaWRnZXRFdmVudENhcGFiaWxpdHkuZmluZEV2ZW50Q2FwYWJpbGl0aWVzKFtjYXBhYmlsaXR5XSk7XG4gICAgICAgIGlmIChldmVudENhcCkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlIHJvb20gbWVzc2FnZXMgc28gdGhleSBzaG93IHVwIGEgYml0IGNsZWFuZXIgdG8gdGhlIHVzZXIuIFJlc3VsdCBpc1xuICAgICAgICAgICAgLy8gZWZmZWN0aXZlbHkgXCJTZW5kIGltYWdlc1wiIGluc3RlYWQgb2YgXCJTZW5kIG1lc3NhZ2VzLi4uIG9mIHR5cGUgaW1hZ2VzXCIgaWYgd2Ugd2VyZVxuICAgICAgICAgICAgLy8gdG8gaGFuZGxlIHRoZSBtc2d0eXBlIG51YW5jZXMgaW4gdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmIChldmVudENhcC5raW5kID09PSBFdmVudEtpbmQuRXZlbnQgJiYgZXZlbnRDYXAuZXZlbnRUeXBlID09PSBFdmVudFR5cGUuUm9vbU1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ2FwYWJpbGl0eVRleHQuZm9yUm9vbU1lc3NhZ2VDYXAoZXZlbnRDYXAsIGtpbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZWUgaWYgd2UgaGF2ZSBhIHN0YXRpYyBsaW5lIG9mIHRleHQgdG8gcHJvdmlkZSBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgYW5kXG4gICAgICAgICAgICAvLyBkaXJlY3Rpb24uIFRoZSBob3BlIGlzIHRoYXQgd2UgZG8gZm9yIGNvbW1vbiBldmVudCB0eXBlcyBmb3IgZnJpZW5kbGllciBjb3B5LlxuICAgICAgICAgICAgY29uc3QgZXZTZW5kUmVjdiA9IGV2ZW50Q2FwLmtpbmQgPT09IEV2ZW50S2luZC5TdGF0ZVxuICAgICAgICAgICAgICAgID8gQ2FwYWJpbGl0eVRleHQuc3RhdGVTZW5kUmVjdkNhcHNcbiAgICAgICAgICAgICAgICA6IENhcGFiaWxpdHlUZXh0Lm5vblN0YXRlU2VuZFJlY3ZDYXBzO1xuICAgICAgICAgICAgaWYgKGV2U2VuZFJlY3ZbZXZlbnRDYXAuZXZlbnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRGb3JLaW5kID0gZXZTZW5kUmVjdltldmVudENhcC5ldmVudFR5cGVdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRGb3JEaXJlY3Rpb24gPSB0ZXh0Rm9yS2luZFtraW5kXSB8fCB0ZXh0Rm9yS2luZFtHRU5FUklDX1dJREdFVF9LSU5EXTtcbiAgICAgICAgICAgICAgICBpZiAodGV4dEZvckRpcmVjdGlvbiAmJiB0ZXh0Rm9yRGlyZWN0aW9uW2V2ZW50Q2FwLmRpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IF90KHRleHRGb3JEaXJlY3Rpb25bZXZlbnRDYXAuZGlyZWN0aW9uXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBubyBieWxpbmUgYmVjYXVzZSB3ZSB3b3VsZCBoYXZlIGFscmVhZHkgcmVwcmVzZW50ZWQgdGhlIGV2ZW50IHByb3Blcmx5XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXZSBkb24ndCBoYXZlIGFueXRoaW5nIHNpbXBsZSwgc28ganVzdCByZXR1cm4gYSBnZW5lcmljIHN0cmluZyBmb3IgdGhlIGV2ZW50IGNhcFxuICAgICAgICAgICAgaWYgKGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbSkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IF90KFwiU2VuZCA8Yj4lKGV2ZW50VHlwZSlzPC9iPiBldmVudHMgYXMgeW91IGluIHRoaXMgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBldmVudENhcC5ldmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPnsgc3ViIH08L2I+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBieWxpbmU6IENhcGFiaWxpdHlUZXh0LmJ5bGluZUZvcihldmVudENhcCksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IF90KFwiU2VlIDxiPiUoZXZlbnRUeXBlKXM8L2I+IGV2ZW50cyBwb3N0ZWQgdG8gdGhpcyByb29tXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6IGV2ZW50Q2FwLmV2ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiOiBzdWIgPT4gPGI+eyBzdWIgfTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5bGluZTogQ2FwYWJpbGl0eVRleHQuYnlsaW5lRm9yKGV2ZW50Q2FwKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBhc3N1bWUgZ2VuZXJpY1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IF90KFwiU2VuZCA8Yj4lKGV2ZW50VHlwZSlzPC9iPiBldmVudHMgYXMgeW91IGluIHlvdXIgYWN0aXZlIHJvb21cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogZXZlbnRDYXAuZXZlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnlsaW5lOiBDYXBhYmlsaXR5VGV4dC5ieWxpbmVGb3IoZXZlbnRDYXApLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBfdChcIlNlZSA8Yj4lKGV2ZW50VHlwZSlzPC9iPiBldmVudHMgcG9zdGVkIHRvIHlvdXIgYWN0aXZlIHJvb21cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogZXZlbnRDYXAuZXZlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnlsaW5lOiBDYXBhYmlsaXR5VGV4dC5ieWxpbmVGb3IoZXZlbnRDYXApLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIGRvbid0IGhhdmUgZW5vdWdoIGNvbnRleHQgdG8gcmVuZGVyIHRoaXMgY2FwYWJpbGl0eSBzcGVjaWFsbHksIHNvIHdlJ2xsIHByZXNlbnQgaXQgYXMtaXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByaW1hcnk6IF90KFwiVGhlIDxiPiUoY2FwYWJpbGl0eSlzPC9iPiBjYXBhYmlsaXR5XCIsIHsgY2FwYWJpbGl0eSB9LCB7XG4gICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPnsgc3ViIH08L2I+LFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZm9yUm9vbU1lc3NhZ2VDYXAoZXZlbnRDYXA6IFdpZGdldEV2ZW50Q2FwYWJpbGl0eSwga2luZDogV2lkZ2V0S2luZCk6IFRyYW5zbGF0ZWRDYXBhYmlsaXR5VGV4dCB7XG4gICAgICAgIC8vIEZpcnN0IGhhbmRsZSB0aGUgY2FzZSBvZiBcImFsbCBtZXNzYWdlc1wiIHRvIG1ha2UgdGhlIHN3aXRjaCBsYXRlciBvbiBhIGJpdCBjbGVhcmVyXG4gICAgICAgIGlmICghZXZlbnRDYXAua2V5U3RyKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRDYXAuZGlyZWN0aW9uID09PSBFdmVudERpcmVjdGlvbi5TZW5kKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiU2VuZCBtZXNzYWdlcyBhcyB5b3UgaW4gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2VuZCBtZXNzYWdlcyBhcyB5b3UgaW4geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBraW5kID09PSBXaWRnZXRLaW5kLlJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZWUgbWVzc2FnZXMgcG9zdGVkIHRvIHRoaXMgcm9vbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlZSBtZXNzYWdlcyBwb3N0ZWQgdG8geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IGhhbmRsZSBhbGwgdGhlIG1lc3NhZ2UgdHlwZXMgd2UgY2FyZSBhYm91dC4gVGhlcmUgYXJlIG1vcmUgbWVzc2FnZSB0eXBlcyBhdmFpbGFibGUsIGhvd2V2ZXJcbiAgICAgICAgLy8gdGhleSBhcmUgbm90IGFzIGNvbW1vbiBzbyB3ZSBkb24ndCBib3RoZXIgcmVuZGVyaW5nIHRoZW0uIFRoZXknbGwgZmFsbCBpbnRvIHRoZSBnZW5lcmljIGNhc2UuXG4gICAgICAgIHN3aXRjaCAoZXZlbnRDYXAua2V5U3RyKSB7XG4gICAgICAgICAgICBjYXNlIE1zZ1R5cGUuVGV4dDoge1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZW5kIHRleHQgbWVzc2FnZXMgYXMgeW91IGluIHRoaXMgcm9vbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJTZW5kIHRleHQgbWVzc2FnZXMgYXMgeW91IGluIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZWUgdGV4dCBtZXNzYWdlcyBwb3N0ZWQgdG8gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlZSB0ZXh0IG1lc3NhZ2VzIHBvc3RlZCB0byB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTXNnVHlwZS5FbW90ZToge1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZW5kIGVtb3RlcyBhcyB5b3UgaW4gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlbmQgZW1vdGVzIGFzIHlvdSBpbiB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBraW5kID09PSBXaWRnZXRLaW5kLlJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiU2VlIGVtb3RlcyBwb3N0ZWQgdG8gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlZSBlbW90ZXMgcG9zdGVkIHRvIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNc2dUeXBlLkltYWdlOiB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Q2FwLmRpcmVjdGlvbiA9PT0gRXZlbnREaXJlY3Rpb24uU2VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNlbmQgaW1hZ2VzIGFzIHlvdSBpbiB0aGlzIHJvb21cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2VuZCBpbWFnZXMgYXMgeW91IGluIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZWUgaW1hZ2VzIHBvc3RlZCB0byB0aGlzIHJvb21cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2VlIGltYWdlcyBwb3N0ZWQgdG8geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1zZ1R5cGUuVmlkZW86IHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRDYXAuZGlyZWN0aW9uID09PSBFdmVudERpcmVjdGlvbi5TZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBraW5kID09PSBXaWRnZXRLaW5kLlJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiU2VuZCB2aWRlb3MgYXMgeW91IGluIHRoaXMgcm9vbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJTZW5kIHZpZGVvcyBhcyB5b3UgaW4geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNlZSB2aWRlb3MgcG9zdGVkIHRvIHRoaXMgcm9vbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJTZWUgdmlkZW9zIHBvc3RlZCB0byB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTXNnVHlwZS5GaWxlOiB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Q2FwLmRpcmVjdGlvbiA9PT0gRXZlbnREaXJlY3Rpb24uU2VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNlbmQgZ2VuZXJhbCBmaWxlcyBhcyB5b3UgaW4gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlbmQgZ2VuZXJhbCBmaWxlcyBhcyB5b3UgaW4geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNlZSBnZW5lcmFsIGZpbGVzIHBvc3RlZCB0byB0aGlzIHJvb21cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2VlIGdlbmVyYWwgZmlsZXMgcG9zdGVkIHRvIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGxldCBwcmltYXJ5OiBUcmFuc2xhdGVkU3RyaW5nO1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeSA9IF90KFwiU2VuZCA8Yj4lKG1zZ3R5cGUpczwvYj4gbWVzc2FnZXMgYXMgeW91IGluIHRoaXMgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNndHlwZTogZXZlbnRDYXAua2V5U3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeSA9IF90KFwiU2VuZCA8Yj4lKG1zZ3R5cGUpczwvYj4gbWVzc2FnZXMgYXMgeW91IGluIHlvdXIgYWN0aXZlIHJvb21cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZ3R5cGU6IGV2ZW50Q2FwLmtleVN0cixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiOiBzdWIgPT4gPGI+eyBzdWIgfTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChraW5kID09PSBXaWRnZXRLaW5kLlJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnkgPSBfdChcIlNlZSA8Yj4lKG1zZ3R5cGUpczwvYj4gbWVzc2FnZXMgcG9zdGVkIHRvIHRoaXMgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNndHlwZTogZXZlbnRDYXAua2V5U3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeSA9IF90KFwiU2VlIDxiPiUobXNndHlwZSlzPC9iPiBtZXNzYWdlcyBwb3N0ZWQgdG8geW91ciBhY3RpdmUgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNndHlwZTogZXZlbnRDYXAua2V5U3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHByaW1hcnkgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBV0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXFCc0M7QUFDdEMsTUFBTUEsbUJBQXdDLEdBQUcsU0FBakQ7O0FBMEJPLE1BQU1DLGNBQU4sQ0FBcUI7RUEwRUEsT0FBVEMsU0FBUyxDQUFDQyxRQUFELEVBQW9EO0lBQ3hFLElBQUlBLFFBQVEsQ0FBQ0MsSUFBVCxLQUFrQkMsMEJBQUEsQ0FBVUMsS0FBaEMsRUFBdUM7TUFDbkMsT0FBTyxDQUFDSCxRQUFRLENBQUNJLE1BQVYsR0FDRCxJQUFBQyxtQkFBQSxFQUFHLHlCQUFILENBREMsR0FFRCxJQUFBQSxtQkFBQSxFQUFHLDZCQUFILEVBQWtDO1FBQUVDLFFBQVEsRUFBRU4sUUFBUSxDQUFDSTtNQUFyQixDQUFsQyxDQUZOO0lBR0g7O0lBQ0QsT0FBTyxJQUFQLENBTndF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