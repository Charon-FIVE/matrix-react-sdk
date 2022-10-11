"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StopGapWidget = exports.ElementWidget = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrixWidgetApi = require("matrix-widget-api");

var _events = require("events");

var _event = require("matrix-js-sdk/src/models/event");

var _logger = require("matrix-js-sdk/src/logger");

var _client = require("matrix-js-sdk/src/client");

var _languageHandler = require("../../languageHandler");

var _StopGapWidgetDriver = require("./StopGapWidgetDriver");

var _WidgetMessagingStore = require("./WidgetMessagingStore");

var _RoomViewStore = require("../RoomViewStore");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _OwnProfileStore = require("../OwnProfileStore");

var _WidgetUtils = _interopRequireDefault(require("../../utils/WidgetUtils"));

var _IntegrationManagers = require("../../integrations/IntegrationManagers");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _WidgetType = require("../../widgets/WidgetType");

var _ActiveWidgetStore = _interopRequireDefault(require("../ActiveWidgetStore"));

var _objects = require("../../utils/objects");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _actions = require("../../dispatcher/actions");

var _ElementWidgetActions = require("./ElementWidgetActions");

var _ModalWidgetStore = require("../ModalWidgetStore");

var _ThemeWatcher = _interopRequireDefault(require("../../settings/watchers/ThemeWatcher"));

var _theme = require("../../theme");

var _ElementWidgetCapabilities = require("./ElementWidgetCapabilities");

var _identifiers = require("../../identifiers");

var _WidgetVariables = require("../../customisations/WidgetVariables");

var _arrays = require("../../utils/arrays");

var _Modal = _interopRequireDefault(require("../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("../../components/views/dialogs/ErrorDialog"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// TODO: Don't use this because it's wrong
class ElementWidget extends _matrixWidgetApi.Widget {
  constructor(rawDefinition) {
    super(rawDefinition);
    this.rawDefinition = rawDefinition;
  }

  get templateUrl() {
    if (_WidgetType.WidgetType.JITSI.matches(this.type)) {
      return _WidgetUtils.default.getLocalJitsiWrapperUrl({
        forLocalRender: true,
        auth: super.rawData?.auth // this.rawData can call templateUrl, do this to prevent looping

      });
    }

    return super.templateUrl;
  }

  get popoutTemplateUrl() {
    if (_WidgetType.WidgetType.JITSI.matches(this.type)) {
      return _WidgetUtils.default.getLocalJitsiWrapperUrl({
        forLocalRender: false,
        // The only important difference between this and templateUrl()
        auth: super.rawData?.auth
      });
    }

    return this.templateUrl; // use this instead of super to ensure we get appropriate templating
  }

  get rawData() {
    let conferenceId = super.rawData['conferenceId'];

    if (conferenceId === undefined) {
      // we'll need to parse the conference ID out of the URL for v1 Jitsi widgets
      const parsedUrl = new URL(super.templateUrl); // use super to get the raw widget URL

      conferenceId = parsedUrl.searchParams.get("confId");
    }

    let domain = super.rawData['domain'];

    if (domain === undefined) {
      // v1 widgets default to meet.element.io regardless of user settings
      domain = "meet.element.io";
    }

    let theme = new _ThemeWatcher.default().getEffectiveTheme();

    if (theme.startsWith("custom-")) {
      const customTheme = (0, _theme.getCustomTheme)(theme.slice(7)); // Jitsi only understands light/dark

      theme = customTheme.is_dark ? "dark" : "light";
    } // only allow light/dark through, defaulting to dark as that was previously the only state
    // accounts for legacy-light/legacy-dark themes too


    if (theme.includes("light")) {
      theme = "light";
    } else {
      theme = "dark";
    }

    return _objectSpread(_objectSpread({}, super.rawData), {}, {
      theme,
      conferenceId,
      domain
    });
  }

  getCompleteUrl(params) {
    let asPopout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return (0, _matrixWidgetApi.runTemplate)(asPopout ? this.popoutTemplateUrl : this.templateUrl, _objectSpread(_objectSpread({}, this.rawDefinition), {}, {
      data: this.rawData
    }), params);
  }

}

exports.ElementWidget = ElementWidget;

class StopGapWidget extends _events.EventEmitter {
  // room ID to event ID
  constructor(appTileProps) {
    super();
    this.appTileProps = appTileProps;
    (0, _defineProperty2.default)(this, "client", void 0);
    (0, _defineProperty2.default)(this, "messaging", void 0);
    (0, _defineProperty2.default)(this, "mockWidget", void 0);
    (0, _defineProperty2.default)(this, "scalarToken", void 0);
    (0, _defineProperty2.default)(this, "roomId", void 0);
    (0, _defineProperty2.default)(this, "kind", void 0);
    (0, _defineProperty2.default)(this, "readUpToMap", {});
    (0, _defineProperty2.default)(this, "onOpenModal", async ev => {
      ev.preventDefault();

      if (_ModalWidgetStore.ModalWidgetStore.instance.canOpenModalWidget()) {
        _ModalWidgetStore.ModalWidgetStore.instance.openModalWidget(ev.detail.data, this.mockWidget, this.roomId);

        this.messaging.transport.reply(ev.detail, {}); // ack
      } else {
        this.messaging.transport.reply(ev.detail, {
          error: {
            message: "Unable to open modal at this time"
          }
        });
      }
    });
    (0, _defineProperty2.default)(this, "onEvent", ev => {
      this.client.decryptEventIfNeeded(ev);
      if (ev.isBeingDecrypted() || ev.isDecryptionFailure()) return;
      this.feedEvent(ev);
    });
    (0, _defineProperty2.default)(this, "onEventDecrypted", ev => {
      if (ev.isDecryptionFailure()) return;
      this.feedEvent(ev);
    });
    (0, _defineProperty2.default)(this, "onToDeviceEvent", async ev => {
      await this.client.decryptEventIfNeeded(ev);
      if (ev.isDecryptionFailure()) return;
      await this.messaging.feedToDevice(ev.getEffectiveEvent(), ev.isEncrypted());
    });
    this.client = _MatrixClientPeg.MatrixClientPeg.get();
    let app = appTileProps.app; // Backwards compatibility: not all old widgets have a creatorUserId

    if (!app.creatorUserId) {
      app = (0, _objects.objectShallowClone)(app); // clone to prevent accidental mutation

      app.creatorUserId = this.client.getUserId();
    }

    this.mockWidget = new ElementWidget(app);
    this.roomId = appTileProps.room?.roomId;
    this.kind = appTileProps.userWidget ? _matrixWidgetApi.WidgetKind.Account : _matrixWidgetApi.WidgetKind.Room; // probably
  }

  get eventListenerRoomId() {
    // When widgets are listening to events, we need to make sure they're only
    // receiving events for the right room. In particular, room widgets get locked
    // to the room they were added in while account widgets listen to the currently
    // active room.
    if (this.roomId) return this.roomId;
    return _RoomViewStore.RoomViewStore.instance.getRoomId();
  }

  get widgetApi() {
    return this.messaging;
  }
  /**
   * The URL to use in the iframe
   */


  get embedUrl() {
    return this.runUrlTemplate({
      asPopout: false
    });
  }
  /**
   * The URL to use in the popout
   */


  get popoutUrl() {
    return this.runUrlTemplate({
      asPopout: true
    });
  }

  runUrlTemplate() {
    let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      asPopout: false
    };
    const fromCustomisation = _WidgetVariables.WidgetVariableCustomisations?.provideVariables?.() ?? {};
    const defaults = {
      widgetRoomId: this.roomId,
      currentUserId: this.client.getUserId(),
      userDisplayName: _OwnProfileStore.OwnProfileStore.instance.displayName,
      userHttpAvatarUrl: _OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl(),
      clientId: _identifiers.ELEMENT_CLIENT_ID,
      clientTheme: _SettingsStore.default.getValue("theme"),
      clientLanguage: (0, _languageHandler.getUserLanguage)()
    };
    const templated = this.mockWidget.getCompleteUrl(Object.assign(defaults, fromCustomisation), opts?.asPopout);
    const parsed = new URL(templated); // Add in some legacy support sprinkles (for non-popout widgets)
    // TODO: Replace these with proper widget params
    // See https://github.com/matrix-org/matrix-doc/pull/1958/files#r405714833

    if (!opts?.asPopout) {
      parsed.searchParams.set('widgetId', this.mockWidget.id);
      parsed.searchParams.set('parentUrl', window.location.href.split('#', 2)[0]); // Give the widget a scalar token if we're supposed to (more legacy)
      // TODO: Stop doing this

      if (this.scalarToken) {
        parsed.searchParams.set('scalar_token', this.scalarToken);
      }
    } // Replace the encoded dollar signs back to dollar signs. They have no special meaning
    // in HTTP, but URL parsers encode them anyways.


    return parsed.toString().replace(/%24/g, '$');
  }

  get isManagedByManager() {
    return !!this.scalarToken;
  }

  get started() {
    return !!this.messaging;
  }

  /**
   * This starts the messaging for the widget if it is not in the state `started` yet.
   * @param iframe the iframe the widget should use
   */
  startMessaging(iframe) {
    if (this.started) return;
    const allowedCapabilities = this.appTileProps.whitelistCapabilities || [];
    const driver = new _StopGapWidgetDriver.StopGapWidgetDriver(allowedCapabilities, this.mockWidget, this.kind, this.roomId);
    this.messaging = new _matrixWidgetApi.ClientWidgetApi(this.mockWidget, iframe, driver);
    this.messaging.on("preparing", () => this.emit("preparing"));
    this.messaging.on("ready", () => this.emit("ready"));
    this.messaging.on("capabilitiesNotified", () => this.emit("capabilitiesNotified"));
    this.messaging.on(`action:${_matrixWidgetApi.WidgetApiFromWidgetAction.OpenModalWidget}`, this.onOpenModal);

    _WidgetMessagingStore.WidgetMessagingStore.instance.storeMessaging(this.mockWidget, this.roomId, this.messaging); // Always attach a handler for ViewRoom, but permission check it internally


    this.messaging.on(`action:${_ElementWidgetActions.ElementWidgetActions.ViewRoom}`, ev => {
      ev.preventDefault(); // stop the widget API from auto-rejecting this
      // Check up front if this is even a valid request

      const targetRoomId = (ev.detail.data || {}).room_id;

      if (!targetRoomId) {
        return this.messaging.transport.reply(ev.detail, {
          error: {
            message: "Room ID not supplied."
          }
        });
      } // Check the widget's permission


      if (!this.messaging.hasCapability(_ElementWidgetCapabilities.ElementWidgetCapabilities.CanChangeViewedRoom)) {
        return this.messaging.transport.reply(ev.detail, {
          error: {
            message: "This widget does not have permission for this action (denied)."
          }
        });
      } // at this point we can change rooms, so do that


      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: targetRoomId,
        metricsTrigger: "Widget"
      }); // acknowledge so the widget doesn't freak out


      this.messaging.transport.reply(ev.detail, {});
    }); // Populate the map of "read up to" events for this widget with the current event in every room.
    // This is a bit inefficient, but should be okay. We do this for all rooms in case the widget
    // requests timeline capabilities in other rooms down the road. It's just easier to manage here.

    for (const room of this.client.getRooms()) {
      // Timelines are most recent last
      const events = room.getLiveTimeline()?.getEvents() || [];
      const roomEvent = events[events.length - 1];
      if (!roomEvent) continue; // force later code to think the room is fresh

      this.readUpToMap[room.roomId] = roomEvent.getId();
    } // Attach listeners for feeding events - the underlying widget classes handle permissions for us


    this.client.on(_client.ClientEvent.Event, this.onEvent);
    this.client.on(_event.MatrixEventEvent.Decrypted, this.onEventDecrypted);
    this.client.on(_client.ClientEvent.ToDeviceEvent, this.onToDeviceEvent);
    this.messaging.on(`action:${_matrixWidgetApi.WidgetApiFromWidgetAction.UpdateAlwaysOnScreen}`, ev => {
      if (this.messaging.hasCapability(_matrixWidgetApi.MatrixCapabilities.AlwaysOnScreen)) {
        _ActiveWidgetStore.default.instance.setWidgetPersistence(this.mockWidget.id, this.roomId, ev.detail.data.value);

        ev.preventDefault();
        this.messaging.transport.reply(ev.detail, {}); // ack
      }
    }); // TODO: Replace this event listener with appropriate driver functionality once the API
    // establishes a sane way to send events back and forth.

    this.messaging.on(`action:${_matrixWidgetApi.WidgetApiFromWidgetAction.SendSticker}`, ev => {
      if (this.messaging.hasCapability(_matrixWidgetApi.MatrixCapabilities.StickerSending)) {
        // Acknowledge first
        ev.preventDefault();
        this.messaging.transport.reply(ev.detail, {}); // Send the sticker

        _dispatcher.default.dispatch({
          action: 'm.sticker',
          data: ev.detail.data,
          widgetId: this.mockWidget.id
        });
      }
    });

    if (_WidgetType.WidgetType.STICKERPICKER.matches(this.mockWidget.type)) {
      this.messaging.on(`action:${_ElementWidgetActions.ElementWidgetActions.OpenIntegrationManager}`, ev => {
        // Acknowledge first
        ev.preventDefault();
        this.messaging.transport.reply(ev.detail, {}); // First close the stickerpicker

        _dispatcher.default.dispatch({
          action: "stickerpicker_close"
        }); // Now open the integration manager
        // TODO: Spec this interaction.


        const data = ev.detail.data;
        const integType = data?.integType;
        const integId = data?.integId; // noinspection JSIgnoredPromiseFromCall

        _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().open(this.client.getRoom(_RoomViewStore.RoomViewStore.instance.getRoomId()), `type_${integType}`, integId);
      });
    }

    if (_WidgetType.WidgetType.JITSI.matches(this.mockWidget.type)) {
      this.messaging.on(`action:${_ElementWidgetActions.ElementWidgetActions.HangupCall}`, ev => {
        ev.preventDefault();

        if (ev.detail.data?.errorMessage) {
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)("Connection lost"),
            description: (0, _languageHandler._t)("You were disconnected from the call. (Error: %(message)s)", {
              message: ev.detail.data.errorMessage
            })
          });
        }

        this.messaging.transport.reply(ev.detail, {});
      });
    }
  }

  async prepare() {
    // Ensure the variables are ready for us to be rendered before continuing
    await (_WidgetVariables.WidgetVariableCustomisations?.isReady?.() ?? Promise.resolve());
    if (this.scalarToken) return;

    const existingMessaging = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessaging(this.mockWidget, this.roomId);

    if (existingMessaging) this.messaging = existingMessaging;

    try {
      if (_WidgetUtils.default.isScalarUrl(this.mockWidget.templateUrl)) {
        const managers = _IntegrationManagers.IntegrationManagers.sharedInstance();

        if (managers.hasManager()) {
          // TODO: Pick the right manager for the widget
          const defaultManager = managers.getPrimaryManager();

          if (_WidgetUtils.default.isScalarUrl(defaultManager.apiUrl)) {
            const scalar = defaultManager.getScalarClient();
            this.scalarToken = await scalar.getScalarToken();
          }
        }
      }
    } catch (e) {
      // All errors are non-fatal
      _logger.logger.error("Error preparing widget communications: ", e);
    }
  }
  /**
   * Stops the widget messaging for if it is started. Skips stopping if it is an active
   * widget.
   * @param opts
   */


  stopMessaging() {
    let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      forceDestroy: false
    };

    if (!opts?.forceDestroy && _ActiveWidgetStore.default.instance.getWidgetPersistence(this.mockWidget.id, this.roomId)) {
      _logger.logger.log("Skipping destroy - persistent widget");

      return;
    }

    if (!this.started) return;

    _WidgetMessagingStore.WidgetMessagingStore.instance.stopMessaging(this.mockWidget, this.roomId);

    this.messaging = null;
    this.client.off(_client.ClientEvent.Event, this.onEvent);
    this.client.off(_event.MatrixEventEvent.Decrypted, this.onEventDecrypted);
    this.client.off(_client.ClientEvent.ToDeviceEvent, this.onToDeviceEvent);
  }

  feedEvent(ev) {
    if (!this.messaging) return; // Check to see if this event would be before or after our "read up to" marker. If it's
    // before, or we can't decide, then we assume the widget will have already seen the event.
    // If the event is after, or we don't have a marker for the room, then we'll send it through.
    //
    // This approach of "read up to" prevents widgets receiving decryption spam from startup or
    // receiving out-of-order events from backfill and such.

    const upToEventId = this.readUpToMap[ev.getRoomId()];

    if (upToEventId) {
      // Small optimization for exact match (prevent search)
      if (upToEventId === ev.getId()) {
        return;
      }

      let isBeforeMark = true; // Timelines are most recent last, so reverse the order and limit ourselves to 100 events
      // to avoid overusing the CPU.

      const timeline = this.client.getRoom(ev.getRoomId()).getLiveTimeline();
      const events = (0, _arrays.arrayFastClone)(timeline.getEvents()).reverse().slice(0, 100);

      for (const timelineEvent of events) {
        if (timelineEvent.getId() === upToEventId) {
          break;
        } else if (timelineEvent.getId() === ev.getId()) {
          isBeforeMark = false;
          break;
        }
      }

      if (isBeforeMark) {
        // Ignore the event: it is before our interest.
        return;
      }
    }

    this.readUpToMap[ev.getRoomId()] = ev.getId();
    const raw = ev.getEffectiveEvent();
    this.messaging.feedEvent(raw, this.eventListenerRoomId).catch(e => {
      _logger.logger.error("Error sending event to widget: ", e);
    });
  }

}

exports.StopGapWidget = StopGapWidget;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbGVtZW50V2lkZ2V0IiwiV2lkZ2V0IiwiY29uc3RydWN0b3IiLCJyYXdEZWZpbml0aW9uIiwidGVtcGxhdGVVcmwiLCJXaWRnZXRUeXBlIiwiSklUU0kiLCJtYXRjaGVzIiwidHlwZSIsIldpZGdldFV0aWxzIiwiZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwiLCJmb3JMb2NhbFJlbmRlciIsImF1dGgiLCJyYXdEYXRhIiwicG9wb3V0VGVtcGxhdGVVcmwiLCJjb25mZXJlbmNlSWQiLCJ1bmRlZmluZWQiLCJwYXJzZWRVcmwiLCJVUkwiLCJzZWFyY2hQYXJhbXMiLCJnZXQiLCJkb21haW4iLCJ0aGVtZSIsIlRoZW1lV2F0Y2hlciIsImdldEVmZmVjdGl2ZVRoZW1lIiwic3RhcnRzV2l0aCIsImN1c3RvbVRoZW1lIiwiZ2V0Q3VzdG9tVGhlbWUiLCJzbGljZSIsImlzX2RhcmsiLCJpbmNsdWRlcyIsImdldENvbXBsZXRlVXJsIiwicGFyYW1zIiwiYXNQb3BvdXQiLCJydW5UZW1wbGF0ZSIsImRhdGEiLCJTdG9wR2FwV2lkZ2V0IiwiRXZlbnRFbWl0dGVyIiwiYXBwVGlsZVByb3BzIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsIk1vZGFsV2lkZ2V0U3RvcmUiLCJpbnN0YW5jZSIsImNhbk9wZW5Nb2RhbFdpZGdldCIsIm9wZW5Nb2RhbFdpZGdldCIsImRldGFpbCIsIm1vY2tXaWRnZXQiLCJyb29tSWQiLCJtZXNzYWdpbmciLCJ0cmFuc3BvcnQiLCJyZXBseSIsImVycm9yIiwibWVzc2FnZSIsImNsaWVudCIsImRlY3J5cHRFdmVudElmTmVlZGVkIiwiaXNCZWluZ0RlY3J5cHRlZCIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJmZWVkRXZlbnQiLCJmZWVkVG9EZXZpY2UiLCJnZXRFZmZlY3RpdmVFdmVudCIsImlzRW5jcnlwdGVkIiwiTWF0cml4Q2xpZW50UGVnIiwiYXBwIiwiY3JlYXRvclVzZXJJZCIsIm9iamVjdFNoYWxsb3dDbG9uZSIsImdldFVzZXJJZCIsInJvb20iLCJraW5kIiwidXNlcldpZGdldCIsIldpZGdldEtpbmQiLCJBY2NvdW50IiwiUm9vbSIsImV2ZW50TGlzdGVuZXJSb29tSWQiLCJSb29tVmlld1N0b3JlIiwiZ2V0Um9vbUlkIiwid2lkZ2V0QXBpIiwiZW1iZWRVcmwiLCJydW5VcmxUZW1wbGF0ZSIsInBvcG91dFVybCIsIm9wdHMiLCJmcm9tQ3VzdG9taXNhdGlvbiIsIldpZGdldFZhcmlhYmxlQ3VzdG9taXNhdGlvbnMiLCJwcm92aWRlVmFyaWFibGVzIiwiZGVmYXVsdHMiLCJ3aWRnZXRSb29tSWQiLCJjdXJyZW50VXNlcklkIiwidXNlckRpc3BsYXlOYW1lIiwiT3duUHJvZmlsZVN0b3JlIiwiZGlzcGxheU5hbWUiLCJ1c2VySHR0cEF2YXRhclVybCIsImdldEh0dHBBdmF0YXJVcmwiLCJjbGllbnRJZCIsIkVMRU1FTlRfQ0xJRU5UX0lEIiwiY2xpZW50VGhlbWUiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJjbGllbnRMYW5ndWFnZSIsImdldFVzZXJMYW5ndWFnZSIsInRlbXBsYXRlZCIsIk9iamVjdCIsImFzc2lnbiIsInBhcnNlZCIsInNldCIsImlkIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwic3BsaXQiLCJzY2FsYXJUb2tlbiIsInRvU3RyaW5nIiwicmVwbGFjZSIsImlzTWFuYWdlZEJ5TWFuYWdlciIsInN0YXJ0ZWQiLCJzdGFydE1lc3NhZ2luZyIsImlmcmFtZSIsImFsbG93ZWRDYXBhYmlsaXRpZXMiLCJ3aGl0ZWxpc3RDYXBhYmlsaXRpZXMiLCJkcml2ZXIiLCJTdG9wR2FwV2lkZ2V0RHJpdmVyIiwiQ2xpZW50V2lkZ2V0QXBpIiwib24iLCJlbWl0IiwiV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbiIsIk9wZW5Nb2RhbFdpZGdldCIsIm9uT3Blbk1vZGFsIiwiV2lkZ2V0TWVzc2FnaW5nU3RvcmUiLCJzdG9yZU1lc3NhZ2luZyIsIkVsZW1lbnRXaWRnZXRBY3Rpb25zIiwiVmlld1Jvb20iLCJ0YXJnZXRSb29tSWQiLCJyb29tX2lkIiwiaGFzQ2FwYWJpbGl0eSIsIkVsZW1lbnRXaWRnZXRDYXBhYmlsaXRpZXMiLCJDYW5DaGFuZ2VWaWV3ZWRSb29tIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIm1ldHJpY3NUcmlnZ2VyIiwiZ2V0Um9vbXMiLCJldmVudHMiLCJnZXRMaXZlVGltZWxpbmUiLCJnZXRFdmVudHMiLCJyb29tRXZlbnQiLCJsZW5ndGgiLCJyZWFkVXBUb01hcCIsImdldElkIiwiQ2xpZW50RXZlbnQiLCJFdmVudCIsIm9uRXZlbnQiLCJNYXRyaXhFdmVudEV2ZW50IiwiRGVjcnlwdGVkIiwib25FdmVudERlY3J5cHRlZCIsIlRvRGV2aWNlRXZlbnQiLCJvblRvRGV2aWNlRXZlbnQiLCJVcGRhdGVBbHdheXNPblNjcmVlbiIsIk1hdHJpeENhcGFiaWxpdGllcyIsIkFsd2F5c09uU2NyZWVuIiwiQWN0aXZlV2lkZ2V0U3RvcmUiLCJzZXRXaWRnZXRQZXJzaXN0ZW5jZSIsInZhbHVlIiwiU2VuZFN0aWNrZXIiLCJTdGlja2VyU2VuZGluZyIsIndpZGdldElkIiwiU1RJQ0tFUlBJQ0tFUiIsIk9wZW5JbnRlZ3JhdGlvbk1hbmFnZXIiLCJpbnRlZ1R5cGUiLCJpbnRlZ0lkIiwiSW50ZWdyYXRpb25NYW5hZ2VycyIsInNoYXJlZEluc3RhbmNlIiwiZ2V0UHJpbWFyeU1hbmFnZXIiLCJvcGVuIiwiZ2V0Um9vbSIsIkhhbmd1cENhbGwiLCJlcnJvck1lc3NhZ2UiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJfdCIsImRlc2NyaXB0aW9uIiwicHJlcGFyZSIsImlzUmVhZHkiLCJQcm9taXNlIiwicmVzb2x2ZSIsImV4aXN0aW5nTWVzc2FnaW5nIiwiZ2V0TWVzc2FnaW5nIiwiaXNTY2FsYXJVcmwiLCJtYW5hZ2VycyIsImhhc01hbmFnZXIiLCJkZWZhdWx0TWFuYWdlciIsImFwaVVybCIsInNjYWxhciIsImdldFNjYWxhckNsaWVudCIsImdldFNjYWxhclRva2VuIiwiZSIsImxvZ2dlciIsInN0b3BNZXNzYWdpbmciLCJmb3JjZURlc3Ryb3kiLCJnZXRXaWRnZXRQZXJzaXN0ZW5jZSIsImxvZyIsIm9mZiIsInVwVG9FdmVudElkIiwiaXNCZWZvcmVNYXJrIiwidGltZWxpbmUiLCJhcnJheUZhc3RDbG9uZSIsInJldmVyc2UiLCJ0aW1lbGluZUV2ZW50IiwicmF3IiwiY2F0Y2giXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc3RvcmVzL3dpZGdldHMvU3RvcEdhcFdpZGdldC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMjAgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQge1xuICAgIENsaWVudFdpZGdldEFwaSxcbiAgICBJTW9kYWxXaWRnZXRPcGVuUmVxdWVzdCxcbiAgICBJU3RpY2tlckFjdGlvblJlcXVlc3QsXG4gICAgSVN0aWNreUFjdGlvblJlcXVlc3QsXG4gICAgSVRlbXBsYXRlUGFyYW1zLFxuICAgIElXaWRnZXQsXG4gICAgSVdpZGdldEFwaUVycm9yUmVzcG9uc2VEYXRhLFxuICAgIElXaWRnZXRBcGlSZXF1ZXN0LFxuICAgIElXaWRnZXRBcGlSZXF1ZXN0RW1wdHlEYXRhLFxuICAgIElXaWRnZXREYXRhLFxuICAgIE1hdHJpeENhcGFiaWxpdGllcyxcbiAgICBydW5UZW1wbGF0ZSxcbiAgICBXaWRnZXQsXG4gICAgV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbixcbiAgICBXaWRnZXRLaW5kLFxufSBmcm9tIFwibWF0cml4LXdpZGdldC1hcGlcIjtcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50LCBNYXRyaXhFdmVudEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgQ2xpZW50RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgU3RvcEdhcFdpZGdldERyaXZlciB9IGZyb20gXCIuL1N0b3BHYXBXaWRnZXREcml2ZXJcIjtcbmltcG9ydCB7IFdpZGdldE1lc3NhZ2luZ1N0b3JlIH0gZnJvbSBcIi4vV2lkZ2V0TWVzc2FnaW5nU3RvcmVcIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi4vUm9vbVZpZXdTdG9yZVwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgT3duUHJvZmlsZVN0b3JlIH0gZnJvbSBcIi4uL093blByb2ZpbGVTdG9yZVwiO1xuaW1wb3J0IFdpZGdldFV0aWxzIGZyb20gJy4uLy4uL3V0aWxzL1dpZGdldFV0aWxzJztcbmltcG9ydCB7IEludGVncmF0aW9uTWFuYWdlcnMgfSBmcm9tIFwiLi4vLi4vaW50ZWdyYXRpb25zL0ludGVncmF0aW9uTWFuYWdlcnNcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBXaWRnZXRUeXBlIH0gZnJvbSBcIi4uLy4uL3dpZGdldHMvV2lkZ2V0VHlwZVwiO1xuaW1wb3J0IEFjdGl2ZVdpZGdldFN0b3JlIGZyb20gXCIuLi9BY3RpdmVXaWRnZXRTdG9yZVwiO1xuaW1wb3J0IHsgb2JqZWN0U2hhbGxvd0Nsb25lIH0gZnJvbSBcIi4uLy4uL3V0aWxzL29iamVjdHNcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBFbGVtZW50V2lkZ2V0QWN0aW9ucywgSUhhbmd1cENhbGxBcGlSZXF1ZXN0LCBJVmlld1Jvb21BcGlSZXF1ZXN0IH0gZnJvbSBcIi4vRWxlbWVudFdpZGdldEFjdGlvbnNcIjtcbmltcG9ydCB7IE1vZGFsV2lkZ2V0U3RvcmUgfSBmcm9tIFwiLi4vTW9kYWxXaWRnZXRTdG9yZVwiO1xuaW1wb3J0IFRoZW1lV2F0Y2hlciBmcm9tIFwiLi4vLi4vc2V0dGluZ3Mvd2F0Y2hlcnMvVGhlbWVXYXRjaGVyXCI7XG5pbXBvcnQgeyBnZXRDdXN0b21UaGVtZSB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgRWxlbWVudFdpZGdldENhcGFiaWxpdGllcyB9IGZyb20gXCIuL0VsZW1lbnRXaWRnZXRDYXBhYmlsaXRpZXNcIjtcbmltcG9ydCB7IEVMRU1FTlRfQ0xJRU5UX0lEIH0gZnJvbSBcIi4uLy4uL2lkZW50aWZpZXJzXCI7XG5pbXBvcnQgeyBnZXRVc2VyTGFuZ3VhZ2UgfSBmcm9tIFwiLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBXaWRnZXRWYXJpYWJsZUN1c3RvbWlzYXRpb25zIH0gZnJvbSBcIi4uLy4uL2N1c3RvbWlzYXRpb25zL1dpZGdldFZhcmlhYmxlc1wiO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5cbi8vIFRPRE86IERlc3Ryb3kgYWxsIG9mIHRoaXMgY29kZVxuXG5pbnRlcmZhY2UgSUFwcFRpbGVQcm9wcyB7XG4gICAgLy8gTm90ZTogdGhlc2UgYXJlIG9ubHkgdGhlIHByb3BzIHdlIGNhcmUgYWJvdXRcbiAgICBhcHA6IElXaWRnZXQ7XG4gICAgcm9vbT86IFJvb207IC8vIHdpdGhvdXQgYSByb29tIGl0IGlzIGEgdXNlciB3aWRnZXRcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICBjcmVhdG9yVXNlcklkOiBzdHJpbmc7XG4gICAgd2FpdEZvcklmcmFtZUxvYWQ6IGJvb2xlYW47XG4gICAgd2hpdGVsaXN0Q2FwYWJpbGl0aWVzPzogc3RyaW5nW107XG4gICAgdXNlcldpZGdldDogYm9vbGVhbjtcbn1cblxuLy8gVE9ETzogRG9uJ3QgdXNlIHRoaXMgYmVjYXVzZSBpdCdzIHdyb25nXG5leHBvcnQgY2xhc3MgRWxlbWVudFdpZGdldCBleHRlbmRzIFdpZGdldCB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByYXdEZWZpbml0aW9uOiBJV2lkZ2V0KSB7XG4gICAgICAgIHN1cGVyKHJhd0RlZmluaXRpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdGVtcGxhdGVVcmwoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh0aGlzLnR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gV2lkZ2V0VXRpbHMuZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwoe1xuICAgICAgICAgICAgICAgIGZvckxvY2FsUmVuZGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGF1dGg6IHN1cGVyLnJhd0RhdGE/LmF1dGggYXMgc3RyaW5nLCAvLyB0aGlzLnJhd0RhdGEgY2FuIGNhbGwgdGVtcGxhdGVVcmwsIGRvIHRoaXMgdG8gcHJldmVudCBsb29waW5nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIudGVtcGxhdGVVcmw7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBwb3BvdXRUZW1wbGF0ZVVybCgpOiBzdHJpbmcge1xuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBXaWRnZXRVdGlscy5nZXRMb2NhbEppdHNpV3JhcHBlclVybCh7XG4gICAgICAgICAgICAgICAgZm9yTG9jYWxSZW5kZXI6IGZhbHNlLCAvLyBUaGUgb25seSBpbXBvcnRhbnQgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgYW5kIHRlbXBsYXRlVXJsKClcbiAgICAgICAgICAgICAgICBhdXRoOiBzdXBlci5yYXdEYXRhPy5hdXRoIGFzIHN0cmluZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlVXJsOyAvLyB1c2UgdGhpcyBpbnN0ZWFkIG9mIHN1cGVyIHRvIGVuc3VyZSB3ZSBnZXQgYXBwcm9wcmlhdGUgdGVtcGxhdGluZ1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcmF3RGF0YSgpOiBJV2lkZ2V0RGF0YSB7XG4gICAgICAgIGxldCBjb25mZXJlbmNlSWQgPSBzdXBlci5yYXdEYXRhWydjb25mZXJlbmNlSWQnXTtcbiAgICAgICAgaWYgKGNvbmZlcmVuY2VJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyB3ZSdsbCBuZWVkIHRvIHBhcnNlIHRoZSBjb25mZXJlbmNlIElEIG91dCBvZiB0aGUgVVJMIGZvciB2MSBKaXRzaSB3aWRnZXRzXG4gICAgICAgICAgICBjb25zdCBwYXJzZWRVcmwgPSBuZXcgVVJMKHN1cGVyLnRlbXBsYXRlVXJsKTsgLy8gdXNlIHN1cGVyIHRvIGdldCB0aGUgcmF3IHdpZGdldCBVUkxcbiAgICAgICAgICAgIGNvbmZlcmVuY2VJZCA9IHBhcnNlZFVybC5zZWFyY2hQYXJhbXMuZ2V0KFwiY29uZklkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkb21haW4gPSBzdXBlci5yYXdEYXRhWydkb21haW4nXTtcbiAgICAgICAgaWYgKGRvbWFpbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyB2MSB3aWRnZXRzIGRlZmF1bHQgdG8gbWVldC5lbGVtZW50LmlvIHJlZ2FyZGxlc3Mgb2YgdXNlciBzZXR0aW5nc1xuICAgICAgICAgICAgZG9tYWluID0gXCJtZWV0LmVsZW1lbnQuaW9cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0aGVtZSA9IG5ldyBUaGVtZVdhdGNoZXIoKS5nZXRFZmZlY3RpdmVUaGVtZSgpO1xuICAgICAgICBpZiAodGhlbWUuc3RhcnRzV2l0aChcImN1c3RvbS1cIikpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVRoZW1lID0gZ2V0Q3VzdG9tVGhlbWUodGhlbWUuc2xpY2UoNykpO1xuICAgICAgICAgICAgLy8gSml0c2kgb25seSB1bmRlcnN0YW5kcyBsaWdodC9kYXJrXG4gICAgICAgICAgICB0aGVtZSA9IGN1c3RvbVRoZW1lLmlzX2RhcmsgPyBcImRhcmtcIiA6IFwibGlnaHRcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9ubHkgYWxsb3cgbGlnaHQvZGFyayB0aHJvdWdoLCBkZWZhdWx0aW5nIHRvIGRhcmsgYXMgdGhhdCB3YXMgcHJldmlvdXNseSB0aGUgb25seSBzdGF0ZVxuICAgICAgICAvLyBhY2NvdW50cyBmb3IgbGVnYWN5LWxpZ2h0L2xlZ2FjeS1kYXJrIHRoZW1lcyB0b29cbiAgICAgICAgaWYgKHRoZW1lLmluY2x1ZGVzKFwibGlnaHRcIikpIHtcbiAgICAgICAgICAgIHRoZW1lID0gXCJsaWdodFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhlbWUgPSBcImRhcmtcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5zdXBlci5yYXdEYXRhLFxuICAgICAgICAgICAgdGhlbWUsXG4gICAgICAgICAgICBjb25mZXJlbmNlSWQsXG4gICAgICAgICAgICBkb21haW4sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbXBsZXRlVXJsKHBhcmFtczogSVRlbXBsYXRlUGFyYW1zLCBhc1BvcG91dCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHJ1blRlbXBsYXRlKGFzUG9wb3V0ID8gdGhpcy5wb3BvdXRUZW1wbGF0ZVVybCA6IHRoaXMudGVtcGxhdGVVcmwsIHtcbiAgICAgICAgICAgIC4uLnRoaXMucmF3RGVmaW5pdGlvbixcbiAgICAgICAgICAgIGRhdGE6IHRoaXMucmF3RGF0YSxcbiAgICAgICAgfSwgcGFyYW1zKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdG9wR2FwV2lkZ2V0IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBwcml2YXRlIGNsaWVudDogTWF0cml4Q2xpZW50O1xuICAgIHByaXZhdGUgbWVzc2FnaW5nOiBDbGllbnRXaWRnZXRBcGk7XG4gICAgcHJpdmF0ZSBtb2NrV2lkZ2V0OiBFbGVtZW50V2lkZ2V0O1xuICAgIHByaXZhdGUgc2NhbGFyVG9rZW46IHN0cmluZztcbiAgICBwcml2YXRlIHJvb21JZD86IHN0cmluZztcbiAgICBwcml2YXRlIGtpbmQ6IFdpZGdldEtpbmQ7XG4gICAgcHJpdmF0ZSByZWFkVXBUb01hcDogeyBbcm9vbUlkOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9OyAvLyByb29tIElEIHRvIGV2ZW50IElEXG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcFRpbGVQcm9wczogSUFwcFRpbGVQcm9wcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBsZXQgYXBwID0gYXBwVGlsZVByb3BzLmFwcDtcbiAgICAgICAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHk6IG5vdCBhbGwgb2xkIHdpZGdldHMgaGF2ZSBhIGNyZWF0b3JVc2VySWRcbiAgICAgICAgaWYgKCFhcHAuY3JlYXRvclVzZXJJZCkge1xuICAgICAgICAgICAgYXBwID0gb2JqZWN0U2hhbGxvd0Nsb25lKGFwcCk7IC8vIGNsb25lIHRvIHByZXZlbnQgYWNjaWRlbnRhbCBtdXRhdGlvblxuICAgICAgICAgICAgYXBwLmNyZWF0b3JVc2VySWQgPSB0aGlzLmNsaWVudC5nZXRVc2VySWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubW9ja1dpZGdldCA9IG5ldyBFbGVtZW50V2lkZ2V0KGFwcCk7XG4gICAgICAgIHRoaXMucm9vbUlkID0gYXBwVGlsZVByb3BzLnJvb20/LnJvb21JZDtcbiAgICAgICAgdGhpcy5raW5kID0gYXBwVGlsZVByb3BzLnVzZXJXaWRnZXQgPyBXaWRnZXRLaW5kLkFjY291bnQgOiBXaWRnZXRLaW5kLlJvb207IC8vIHByb2JhYmx5XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgZXZlbnRMaXN0ZW5lclJvb21JZCgpOiBzdHJpbmcge1xuICAgICAgICAvLyBXaGVuIHdpZGdldHMgYXJlIGxpc3RlbmluZyB0byBldmVudHMsIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoZXkncmUgb25seVxuICAgICAgICAvLyByZWNlaXZpbmcgZXZlbnRzIGZvciB0aGUgcmlnaHQgcm9vbS4gSW4gcGFydGljdWxhciwgcm9vbSB3aWRnZXRzIGdldCBsb2NrZWRcbiAgICAgICAgLy8gdG8gdGhlIHJvb20gdGhleSB3ZXJlIGFkZGVkIGluIHdoaWxlIGFjY291bnQgd2lkZ2V0cyBsaXN0ZW4gdG8gdGhlIGN1cnJlbnRseVxuICAgICAgICAvLyBhY3RpdmUgcm9vbS5cblxuICAgICAgICBpZiAodGhpcy5yb29tSWQpIHJldHVybiB0aGlzLnJvb21JZDtcblxuICAgICAgICByZXR1cm4gUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHdpZGdldEFwaSgpOiBDbGllbnRXaWRnZXRBcGkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdpbmc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIFVSTCB0byB1c2UgaW4gdGhlIGlmcmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZW1iZWRVcmwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVuVXJsVGVtcGxhdGUoeyBhc1BvcG91dDogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIFVSTCB0byB1c2UgaW4gdGhlIHBvcG91dFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcG9wb3V0VXJsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1blVybFRlbXBsYXRlKHsgYXNQb3BvdXQ6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBydW5VcmxUZW1wbGF0ZShvcHRzID0geyBhc1BvcG91dDogZmFsc2UgfSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGZyb21DdXN0b21pc2F0aW9uID0gV2lkZ2V0VmFyaWFibGVDdXN0b21pc2F0aW9ucz8ucHJvdmlkZVZhcmlhYmxlcz8uKCkgPz8ge307XG4gICAgICAgIGNvbnN0IGRlZmF1bHRzOiBJVGVtcGxhdGVQYXJhbXMgPSB7XG4gICAgICAgICAgICB3aWRnZXRSb29tSWQ6IHRoaXMucm9vbUlkLFxuICAgICAgICAgICAgY3VycmVudFVzZXJJZDogdGhpcy5jbGllbnQuZ2V0VXNlcklkKCksXG4gICAgICAgICAgICB1c2VyRGlzcGxheU5hbWU6IE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIHVzZXJIdHRwQXZhdGFyVXJsOiBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZ2V0SHR0cEF2YXRhclVybCgpLFxuICAgICAgICAgICAgY2xpZW50SWQ6IEVMRU1FTlRfQ0xJRU5UX0lELFxuICAgICAgICAgICAgY2xpZW50VGhlbWU6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJ0aGVtZVwiKSxcbiAgICAgICAgICAgIGNsaWVudExhbmd1YWdlOiBnZXRVc2VyTGFuZ3VhZ2UoKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVkID0gdGhpcy5tb2NrV2lkZ2V0LmdldENvbXBsZXRlVXJsKE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIGZyb21DdXN0b21pc2F0aW9uKSwgb3B0cz8uYXNQb3BvdXQpO1xuXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodGVtcGxhdGVkKTtcblxuICAgICAgICAvLyBBZGQgaW4gc29tZSBsZWdhY3kgc3VwcG9ydCBzcHJpbmtsZXMgKGZvciBub24tcG9wb3V0IHdpZGdldHMpXG4gICAgICAgIC8vIFRPRE86IFJlcGxhY2UgdGhlc2Ugd2l0aCBwcm9wZXIgd2lkZ2V0IHBhcmFtc1xuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvbWF0cml4LWRvYy9wdWxsLzE5NTgvZmlsZXMjcjQwNTcxNDgzM1xuICAgICAgICBpZiAoIW9wdHM/LmFzUG9wb3V0KSB7XG4gICAgICAgICAgICBwYXJzZWQuc2VhcmNoUGFyYW1zLnNldCgnd2lkZ2V0SWQnLCB0aGlzLm1vY2tXaWRnZXQuaWQpO1xuICAgICAgICAgICAgcGFyc2VkLnNlYXJjaFBhcmFtcy5zZXQoJ3BhcmVudFVybCcsIHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJywgMilbMF0pO1xuXG4gICAgICAgICAgICAvLyBHaXZlIHRoZSB3aWRnZXQgYSBzY2FsYXIgdG9rZW4gaWYgd2UncmUgc3VwcG9zZWQgdG8gKG1vcmUgbGVnYWN5KVxuICAgICAgICAgICAgLy8gVE9ETzogU3RvcCBkb2luZyB0aGlzXG4gICAgICAgICAgICBpZiAodGhpcy5zY2FsYXJUb2tlbikge1xuICAgICAgICAgICAgICAgIHBhcnNlZC5zZWFyY2hQYXJhbXMuc2V0KCdzY2FsYXJfdG9rZW4nLCB0aGlzLnNjYWxhclRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIGVuY29kZWQgZG9sbGFyIHNpZ25zIGJhY2sgdG8gZG9sbGFyIHNpZ25zLiBUaGV5IGhhdmUgbm8gc3BlY2lhbCBtZWFuaW5nXG4gICAgICAgIC8vIGluIEhUVFAsIGJ1dCBVUkwgcGFyc2VycyBlbmNvZGUgdGhlbSBhbnl3YXlzLlxuICAgICAgICByZXR1cm4gcGFyc2VkLnRvU3RyaW5nKCkucmVwbGFjZSgvJTI0L2csICckJyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpc01hbmFnZWRCeU1hbmFnZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuc2NhbGFyVG9rZW47XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzdGFydGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLm1lc3NhZ2luZztcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uT3Blbk1vZGFsID0gYXN5bmMgKGV2OiBDdXN0b21FdmVudDxJTW9kYWxXaWRnZXRPcGVuUmVxdWVzdD4pID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKE1vZGFsV2lkZ2V0U3RvcmUuaW5zdGFuY2UuY2FuT3Blbk1vZGFsV2lkZ2V0KCkpIHtcbiAgICAgICAgICAgIE1vZGFsV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub3Blbk1vZGFsV2lkZ2V0KGV2LmRldGFpbC5kYXRhLCB0aGlzLm1vY2tXaWRnZXQsIHRoaXMucm9vbUlkKTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnaW5nLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIHt9KTsgLy8gYWNrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2luZy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJVbmFibGUgdG8gb3BlbiBtb2RhbCBhdCB0aGlzIHRpbWVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoaXMgc3RhcnRzIHRoZSBtZXNzYWdpbmcgZm9yIHRoZSB3aWRnZXQgaWYgaXQgaXMgbm90IGluIHRoZSBzdGF0ZSBgc3RhcnRlZGAgeWV0LlxuICAgICAqIEBwYXJhbSBpZnJhbWUgdGhlIGlmcmFtZSB0aGUgd2lkZ2V0IHNob3VsZCB1c2VcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhcnRNZXNzYWdpbmcoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IGFueSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXJ0ZWQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhbGxvd2VkQ2FwYWJpbGl0aWVzID0gdGhpcy5hcHBUaWxlUHJvcHMud2hpdGVsaXN0Q2FwYWJpbGl0aWVzIHx8IFtdO1xuICAgICAgICBjb25zdCBkcml2ZXIgPSBuZXcgU3RvcEdhcFdpZGdldERyaXZlcihhbGxvd2VkQ2FwYWJpbGl0aWVzLCB0aGlzLm1vY2tXaWRnZXQsIHRoaXMua2luZCwgdGhpcy5yb29tSWQpO1xuXG4gICAgICAgIHRoaXMubWVzc2FnaW5nID0gbmV3IENsaWVudFdpZGdldEFwaSh0aGlzLm1vY2tXaWRnZXQsIGlmcmFtZSwgZHJpdmVyKTtcbiAgICAgICAgdGhpcy5tZXNzYWdpbmcub24oXCJwcmVwYXJpbmdcIiwgKCkgPT4gdGhpcy5lbWl0KFwicHJlcGFyaW5nXCIpKTtcbiAgICAgICAgdGhpcy5tZXNzYWdpbmcub24oXCJyZWFkeVwiLCAoKSA9PiB0aGlzLmVtaXQoXCJyZWFkeVwiKSk7XG4gICAgICAgIHRoaXMubWVzc2FnaW5nLm9uKFwiY2FwYWJpbGl0aWVzTm90aWZpZWRcIiwgKCkgPT4gdGhpcy5lbWl0KFwiY2FwYWJpbGl0aWVzTm90aWZpZWRcIikpO1xuICAgICAgICB0aGlzLm1lc3NhZ2luZy5vbihgYWN0aW9uOiR7V2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5PcGVuTW9kYWxXaWRnZXR9YCwgdGhpcy5vbk9wZW5Nb2RhbCk7XG4gICAgICAgIFdpZGdldE1lc3NhZ2luZ1N0b3JlLmluc3RhbmNlLnN0b3JlTWVzc2FnaW5nKHRoaXMubW9ja1dpZGdldCwgdGhpcy5yb29tSWQsIHRoaXMubWVzc2FnaW5nKTtcblxuICAgICAgICAvLyBBbHdheXMgYXR0YWNoIGEgaGFuZGxlciBmb3IgVmlld1Jvb20sIGJ1dCBwZXJtaXNzaW9uIGNoZWNrIGl0IGludGVybmFsbHlcbiAgICAgICAgdGhpcy5tZXNzYWdpbmcub24oYGFjdGlvbjoke0VsZW1lbnRXaWRnZXRBY3Rpb25zLlZpZXdSb29tfWAsIChldjogQ3VzdG9tRXZlbnQ8SVZpZXdSb29tQXBpUmVxdWVzdD4pID0+IHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7IC8vIHN0b3AgdGhlIHdpZGdldCBBUEkgZnJvbSBhdXRvLXJlamVjdGluZyB0aGlzXG5cbiAgICAgICAgICAgIC8vIENoZWNrIHVwIGZyb250IGlmIHRoaXMgaXMgZXZlbiBhIHZhbGlkIHJlcXVlc3RcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFJvb21JZCA9IChldi5kZXRhaWwuZGF0YSB8fCB7fSkucm9vbV9pZDtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0Um9vbUlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnaW5nLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIDxJV2lkZ2V0QXBpRXJyb3JSZXNwb25zZURhdGE+e1xuICAgICAgICAgICAgICAgICAgICBlcnJvcjogeyBtZXNzYWdlOiBcIlJvb20gSUQgbm90IHN1cHBsaWVkLlwiIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHRoZSB3aWRnZXQncyBwZXJtaXNzaW9uXG4gICAgICAgICAgICBpZiAoIXRoaXMubWVzc2FnaW5nLmhhc0NhcGFiaWxpdHkoRWxlbWVudFdpZGdldENhcGFiaWxpdGllcy5DYW5DaGFuZ2VWaWV3ZWRSb29tKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2luZy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCA8SVdpZGdldEFwaUVycm9yUmVzcG9uc2VEYXRhPntcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHsgbWVzc2FnZTogXCJUaGlzIHdpZGdldCBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb24gZm9yIHRoaXMgYWN0aW9uIChkZW5pZWQpLlwiIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGF0IHRoaXMgcG9pbnQgd2UgY2FuIGNoYW5nZSByb29tcywgc28gZG8gdGhhdFxuICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogdGFyZ2V0Um9vbUlkLFxuICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIldpZGdldFwiLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFja25vd2xlZGdlIHNvIHRoZSB3aWRnZXQgZG9lc24ndCBmcmVhayBvdXRcbiAgICAgICAgICAgIHRoaXMubWVzc2FnaW5nLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIDxJV2lkZ2V0QXBpUmVxdWVzdEVtcHR5RGF0YT57fSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFBvcHVsYXRlIHRoZSBtYXAgb2YgXCJyZWFkIHVwIHRvXCIgZXZlbnRzIGZvciB0aGlzIHdpZGdldCB3aXRoIHRoZSBjdXJyZW50IGV2ZW50IGluIGV2ZXJ5IHJvb20uXG4gICAgICAgIC8vIFRoaXMgaXMgYSBiaXQgaW5lZmZpY2llbnQsIGJ1dCBzaG91bGQgYmUgb2theS4gV2UgZG8gdGhpcyBmb3IgYWxsIHJvb21zIGluIGNhc2UgdGhlIHdpZGdldFxuICAgICAgICAvLyByZXF1ZXN0cyB0aW1lbGluZSBjYXBhYmlsaXRpZXMgaW4gb3RoZXIgcm9vbXMgZG93biB0aGUgcm9hZC4gSXQncyBqdXN0IGVhc2llciB0byBtYW5hZ2UgaGVyZS5cbiAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHRoaXMuY2xpZW50LmdldFJvb21zKCkpIHtcbiAgICAgICAgICAgIC8vIFRpbWVsaW5lcyBhcmUgbW9zdCByZWNlbnQgbGFzdFxuICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gcm9vbS5nZXRMaXZlVGltZWxpbmUoKT8uZ2V0RXZlbnRzKCkgfHwgW107XG4gICAgICAgICAgICBjb25zdCByb29tRXZlbnQgPSBldmVudHNbZXZlbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKCFyb29tRXZlbnQpIGNvbnRpbnVlOyAvLyBmb3JjZSBsYXRlciBjb2RlIHRvIHRoaW5rIHRoZSByb29tIGlzIGZyZXNoXG4gICAgICAgICAgICB0aGlzLnJlYWRVcFRvTWFwW3Jvb20ucm9vbUlkXSA9IHJvb21FdmVudC5nZXRJZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXR0YWNoIGxpc3RlbmVycyBmb3IgZmVlZGluZyBldmVudHMgLSB0aGUgdW5kZXJseWluZyB3aWRnZXQgY2xhc3NlcyBoYW5kbGUgcGVybWlzc2lvbnMgZm9yIHVzXG4gICAgICAgIHRoaXMuY2xpZW50Lm9uKENsaWVudEV2ZW50LkV2ZW50LCB0aGlzLm9uRXZlbnQpO1xuICAgICAgICB0aGlzLmNsaWVudC5vbihNYXRyaXhFdmVudEV2ZW50LkRlY3J5cHRlZCwgdGhpcy5vbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgdGhpcy5jbGllbnQub24oQ2xpZW50RXZlbnQuVG9EZXZpY2VFdmVudCwgdGhpcy5vblRvRGV2aWNlRXZlbnQpO1xuXG4gICAgICAgIHRoaXMubWVzc2FnaW5nLm9uKGBhY3Rpb246JHtXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLlVwZGF0ZUFsd2F5c09uU2NyZWVufWAsXG4gICAgICAgICAgICAoZXY6IEN1c3RvbUV2ZW50PElTdGlja3lBY3Rpb25SZXF1ZXN0PikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1lc3NhZ2luZy5oYXNDYXBhYmlsaXR5KE1hdHJpeENhcGFiaWxpdGllcy5BbHdheXNPblNjcmVlbikpIHtcbiAgICAgICAgICAgICAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2Uuc2V0V2lkZ2V0UGVyc2lzdGVuY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vY2tXaWRnZXQuaWQsIHRoaXMucm9vbUlkLCBldi5kZXRhaWwuZGF0YS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdpbmcudHJhbnNwb3J0LnJlcGx5KGV2LmRldGFpbCwgPElXaWRnZXRBcGlSZXF1ZXN0RW1wdHlEYXRhPnt9KTsgLy8gYWNrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBUT0RPOiBSZXBsYWNlIHRoaXMgZXZlbnQgbGlzdGVuZXIgd2l0aCBhcHByb3ByaWF0ZSBkcml2ZXIgZnVuY3Rpb25hbGl0eSBvbmNlIHRoZSBBUElcbiAgICAgICAgLy8gZXN0YWJsaXNoZXMgYSBzYW5lIHdheSB0byBzZW5kIGV2ZW50cyBiYWNrIGFuZCBmb3J0aC5cbiAgICAgICAgdGhpcy5tZXNzYWdpbmcub24oYGFjdGlvbjoke1dpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uU2VuZFN0aWNrZXJ9YCxcbiAgICAgICAgICAgIChldjogQ3VzdG9tRXZlbnQ8SVN0aWNrZXJBY3Rpb25SZXF1ZXN0PikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1lc3NhZ2luZy5oYXNDYXBhYmlsaXR5KE1hdHJpeENhcGFiaWxpdGllcy5TdGlja2VyU2VuZGluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWNrbm93bGVkZ2UgZmlyc3RcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdpbmcudHJhbnNwb3J0LnJlcGx5KGV2LmRldGFpbCwgPElXaWRnZXRBcGlSZXF1ZXN0RW1wdHlEYXRhPnt9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTZW5kIHRoZSBzdGlja2VyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ20uc3RpY2tlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBldi5kZXRhaWwuZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldElkOiB0aGlzLm1vY2tXaWRnZXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKFdpZGdldFR5cGUuU1RJQ0tFUlBJQ0tFUi5tYXRjaGVzKHRoaXMubW9ja1dpZGdldC50eXBlKSkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdpbmcub24oYGFjdGlvbjoke0VsZW1lbnRXaWRnZXRBY3Rpb25zLk9wZW5JbnRlZ3JhdGlvbk1hbmFnZXJ9YCxcbiAgICAgICAgICAgICAgICAoZXY6IEN1c3RvbUV2ZW50PElXaWRnZXRBcGlSZXF1ZXN0PikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBBY2tub3dsZWRnZSBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2luZy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCA8SVdpZGdldEFwaVJlcXVlc3RFbXB0eURhdGE+e30pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0IGNsb3NlIHRoZSBzdGlja2VycGlja2VyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiBcInN0aWNrZXJwaWNrZXJfY2xvc2VcIiB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBOb3cgb3BlbiB0aGUgaW50ZWdyYXRpb24gbWFuYWdlclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBTcGVjIHRoaXMgaW50ZXJhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBldi5kZXRhaWwuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW50ZWdUeXBlID0gZGF0YT8uaW50ZWdUeXBlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnRlZ0lkID0gPHN0cmluZz5kYXRhPy5pbnRlZ0lkO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0lnbm9yZWRQcm9taXNlRnJvbUNhbGxcbiAgICAgICAgICAgICAgICAgICAgSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLmdldFByaW1hcnlNYW5hZ2VyKCkub3BlbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50LmdldFJvb20oUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBgdHlwZV8ke2ludGVnVHlwZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZWdJZCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXModGhpcy5tb2NrV2lkZ2V0LnR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2luZy5vbihgYWN0aW9uOiR7RWxlbWVudFdpZGdldEFjdGlvbnMuSGFuZ3VwQ2FsbH1gLFxuICAgICAgICAgICAgICAgIChldjogQ3VzdG9tRXZlbnQ8SUhhbmd1cENhbGxBcGlSZXF1ZXN0PikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXYuZGV0YWlsLmRhdGE/LmVycm9yTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQ29ubmVjdGlvbiBsb3N0XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIllvdSB3ZXJlIGRpc2Nvbm5lY3RlZCBmcm9tIHRoZSBjYWxsLiAoRXJyb3I6ICUobWVzc2FnZSlzKVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGV2LmRldGFpbC5kYXRhLmVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnaW5nLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIDxJV2lkZ2V0QXBpUmVxdWVzdEVtcHR5RGF0YT57fSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcHJlcGFyZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8gRW5zdXJlIHRoZSB2YXJpYWJsZXMgYXJlIHJlYWR5IGZvciB1cyB0byBiZSByZW5kZXJlZCBiZWZvcmUgY29udGludWluZ1xuICAgICAgICBhd2FpdCAoV2lkZ2V0VmFyaWFibGVDdXN0b21pc2F0aW9ucz8uaXNSZWFkeT8uKCkgPz8gUHJvbWlzZS5yZXNvbHZlKCkpO1xuXG4gICAgICAgIGlmICh0aGlzLnNjYWxhclRva2VuKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTWVzc2FnaW5nID0gV2lkZ2V0TWVzc2FnaW5nU3RvcmUuaW5zdGFuY2UuZ2V0TWVzc2FnaW5nKHRoaXMubW9ja1dpZGdldCwgdGhpcy5yb29tSWQpO1xuICAgICAgICBpZiAoZXhpc3RpbmdNZXNzYWdpbmcpIHRoaXMubWVzc2FnaW5nID0gZXhpc3RpbmdNZXNzYWdpbmc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoV2lkZ2V0VXRpbHMuaXNTY2FsYXJVcmwodGhpcy5tb2NrV2lkZ2V0LnRlbXBsYXRlVXJsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hbmFnZXJzID0gSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgICAgIGlmIChtYW5hZ2Vycy5oYXNNYW5hZ2VyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUGljayB0aGUgcmlnaHQgbWFuYWdlciBmb3IgdGhlIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0TWFuYWdlciA9IG1hbmFnZXJzLmdldFByaW1hcnlNYW5hZ2VyKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChXaWRnZXRVdGlscy5pc1NjYWxhclVybChkZWZhdWx0TWFuYWdlci5hcGlVcmwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzY2FsYXIgPSBkZWZhdWx0TWFuYWdlci5nZXRTY2FsYXJDbGllbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NhbGFyVG9rZW4gPSBhd2FpdCBzY2FsYXIuZ2V0U2NhbGFyVG9rZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gQWxsIGVycm9ycyBhcmUgbm9uLWZhdGFsXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciBwcmVwYXJpbmcgd2lkZ2V0IGNvbW11bmljYXRpb25zOiBcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyB0aGUgd2lkZ2V0IG1lc3NhZ2luZyBmb3IgaWYgaXQgaXMgc3RhcnRlZC4gU2tpcHMgc3RvcHBpbmcgaWYgaXQgaXMgYW4gYWN0aXZlXG4gICAgICogd2lkZ2V0LlxuICAgICAqIEBwYXJhbSBvcHRzXG4gICAgICovXG4gICAgcHVibGljIHN0b3BNZXNzYWdpbmcob3B0cyA9IHsgZm9yY2VEZXN0cm95OiBmYWxzZSB9KSB7XG4gICAgICAgIGlmICghb3B0cz8uZm9yY2VEZXN0cm95ICYmIEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLmdldFdpZGdldFBlcnNpc3RlbmNlKHRoaXMubW9ja1dpZGdldC5pZCwgdGhpcy5yb29tSWQpKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiU2tpcHBpbmcgZGVzdHJveSAtIHBlcnNpc3RlbnQgd2lkZ2V0XCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5zdGFydGVkKSByZXR1cm47XG4gICAgICAgIFdpZGdldE1lc3NhZ2luZ1N0b3JlLmluc3RhbmNlLnN0b3BNZXNzYWdpbmcodGhpcy5tb2NrV2lkZ2V0LCB0aGlzLnJvb21JZCk7XG4gICAgICAgIHRoaXMubWVzc2FnaW5nID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNsaWVudC5vZmYoQ2xpZW50RXZlbnQuRXZlbnQsIHRoaXMub25FdmVudCk7XG4gICAgICAgIHRoaXMuY2xpZW50Lm9mZihNYXRyaXhFdmVudEV2ZW50LkRlY3J5cHRlZCwgdGhpcy5vbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgdGhpcy5jbGllbnQub2ZmKENsaWVudEV2ZW50LlRvRGV2aWNlRXZlbnQsIHRoaXMub25Ub0RldmljZUV2ZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRXZlbnQgPSAoZXY6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuY2xpZW50LmRlY3J5cHRFdmVudElmTmVlZGVkKGV2KTtcbiAgICAgICAgaWYgKGV2LmlzQmVpbmdEZWNyeXB0ZWQoKSB8fCBldi5pc0RlY3J5cHRpb25GYWlsdXJlKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5mZWVkRXZlbnQoZXYpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRXZlbnREZWNyeXB0ZWQgPSAoZXY6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldi5pc0RlY3J5cHRpb25GYWlsdXJlKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5mZWVkRXZlbnQoZXYpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVG9EZXZpY2VFdmVudCA9IGFzeW5jIChldjogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5jbGllbnQuZGVjcnlwdEV2ZW50SWZOZWVkZWQoZXYpO1xuICAgICAgICBpZiAoZXYuaXNEZWNyeXB0aW9uRmFpbHVyZSgpKSByZXR1cm47XG4gICAgICAgIGF3YWl0IHRoaXMubWVzc2FnaW5nLmZlZWRUb0RldmljZShldi5nZXRFZmZlY3RpdmVFdmVudCgpLCBldi5pc0VuY3J5cHRlZCgpKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBmZWVkRXZlbnQoZXY6IE1hdHJpeEV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5tZXNzYWdpbmcpIHJldHVybjtcblxuICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhpcyBldmVudCB3b3VsZCBiZSBiZWZvcmUgb3IgYWZ0ZXIgb3VyIFwicmVhZCB1cCB0b1wiIG1hcmtlci4gSWYgaXQnc1xuICAgICAgICAvLyBiZWZvcmUsIG9yIHdlIGNhbid0IGRlY2lkZSwgdGhlbiB3ZSBhc3N1bWUgdGhlIHdpZGdldCB3aWxsIGhhdmUgYWxyZWFkeSBzZWVuIHRoZSBldmVudC5cbiAgICAgICAgLy8gSWYgdGhlIGV2ZW50IGlzIGFmdGVyLCBvciB3ZSBkb24ndCBoYXZlIGEgbWFya2VyIGZvciB0aGUgcm9vbSwgdGhlbiB3ZSdsbCBzZW5kIGl0IHRocm91Z2guXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoaXMgYXBwcm9hY2ggb2YgXCJyZWFkIHVwIHRvXCIgcHJldmVudHMgd2lkZ2V0cyByZWNlaXZpbmcgZGVjcnlwdGlvbiBzcGFtIGZyb20gc3RhcnR1cCBvclxuICAgICAgICAvLyByZWNlaXZpbmcgb3V0LW9mLW9yZGVyIGV2ZW50cyBmcm9tIGJhY2tmaWxsIGFuZCBzdWNoLlxuICAgICAgICBjb25zdCB1cFRvRXZlbnRJZCA9IHRoaXMucmVhZFVwVG9NYXBbZXYuZ2V0Um9vbUlkKCldO1xuICAgICAgICBpZiAodXBUb0V2ZW50SWQpIHtcbiAgICAgICAgICAgIC8vIFNtYWxsIG9wdGltaXphdGlvbiBmb3IgZXhhY3QgbWF0Y2ggKHByZXZlbnQgc2VhcmNoKVxuICAgICAgICAgICAgaWYgKHVwVG9FdmVudElkID09PSBldi5nZXRJZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgaXNCZWZvcmVNYXJrID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gVGltZWxpbmVzIGFyZSBtb3N0IHJlY2VudCBsYXN0LCBzbyByZXZlcnNlIHRoZSBvcmRlciBhbmQgbGltaXQgb3Vyc2VsdmVzIHRvIDEwMCBldmVudHNcbiAgICAgICAgICAgIC8vIHRvIGF2b2lkIG92ZXJ1c2luZyB0aGUgQ1BVLlxuICAgICAgICAgICAgY29uc3QgdGltZWxpbmUgPSB0aGlzLmNsaWVudC5nZXRSb29tKGV2LmdldFJvb21JZCgpKS5nZXRMaXZlVGltZWxpbmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IGFycmF5RmFzdENsb25lKHRpbWVsaW5lLmdldEV2ZW50cygpKS5yZXZlcnNlKCkuc2xpY2UoMCwgMTAwKTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCB0aW1lbGluZUV2ZW50IG9mIGV2ZW50cykge1xuICAgICAgICAgICAgICAgIGlmICh0aW1lbGluZUV2ZW50LmdldElkKCkgPT09IHVwVG9FdmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGltZWxpbmVFdmVudC5nZXRJZCgpID09PSBldi5nZXRJZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzQmVmb3JlTWFyayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0JlZm9yZU1hcmspIHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgdGhlIGV2ZW50OiBpdCBpcyBiZWZvcmUgb3VyIGludGVyZXN0LlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVhZFVwVG9NYXBbZXYuZ2V0Um9vbUlkKCldID0gZXYuZ2V0SWQoKTtcblxuICAgICAgICBjb25zdCByYXcgPSBldi5nZXRFZmZlY3RpdmVFdmVudCgpO1xuICAgICAgICB0aGlzLm1lc3NhZ2luZy5mZWVkRXZlbnQocmF3LCB0aGlzLmV2ZW50TGlzdGVuZXJSb29tSWQpLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3Igc2VuZGluZyBldmVudCB0byB3aWRnZXQ6IFwiLCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7OztBQWVBO0FBQ08sTUFBTUEsYUFBTixTQUE0QkMsdUJBQTVCLENBQW1DO0VBQ3RDQyxXQUFXLENBQVNDLGFBQVQsRUFBaUM7SUFDeEMsTUFBTUEsYUFBTjtJQUR3QyxLQUF4QkEsYUFBd0IsR0FBeEJBLGFBQXdCO0VBRTNDOztFQUVxQixJQUFYQyxXQUFXLEdBQVc7SUFDN0IsSUFBSUMsc0JBQUEsQ0FBV0MsS0FBWCxDQUFpQkMsT0FBakIsQ0FBeUIsS0FBS0MsSUFBOUIs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