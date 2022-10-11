"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _matrixWidgetApi = require("matrix-widget-api");

var _room = require("matrix-js-sdk/src/models/room");

var _logger = require("matrix-js-sdk/src/logger");

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _languageHandler = require("../../../languageHandler");

var _AppPermission = _interopRequireDefault(require("./AppPermission"));

var _AppWarning = _interopRequireDefault(require("./AppWarning"));

var _Spinner = _interopRequireDefault(require("./Spinner"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _ActiveWidgetStore = _interopRequireDefault(require("../../../stores/ActiveWidgetStore"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _ContextMenu = require("../../structures/ContextMenu");

var _PersistedElement = _interopRequireWildcard(require("./PersistedElement"));

var _WidgetType = require("../../../widgets/WidgetType");

var _StopGapWidget = require("../../../stores/widgets/StopGapWidget");

var _WidgetContextMenu = _interopRequireDefault(require("../context_menus/WidgetContextMenu"));

var _WidgetAvatar = _interopRequireDefault(require("../avatars/WidgetAvatar"));

var _LegacyCallHandler = _interopRequireDefault(require("../../../LegacyCallHandler"));

var _WidgetLayoutStore = require("../../../stores/widgets/WidgetLayoutStore");

var _OwnProfileStore = require("../../../stores/OwnProfileStore");

var _AsyncStore = require("../../../stores/AsyncStore");

var _RoomViewStore = require("../../../stores/RoomViewStore");

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _actions = require("../../../dispatcher/actions");

var _ElementWidgetCapabilities = require("../../../stores/widgets/ElementWidgetCapabilities");

var _WidgetMessagingStore = require("../../../stores/widgets/WidgetMessagingStore");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class AppTile extends _react.default.Component {
  // ref to the iframe (callback style)
  constructor(_props) {
    super(_props); // Tiles in miniMode are floating, and therefore not docked

    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "contextMenuButton", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "iframe", void 0);
    (0, _defineProperty2.default)(this, "allowedWidgetsWatchRef", void 0);
    (0, _defineProperty2.default)(this, "persistKey", void 0);
    (0, _defineProperty2.default)(this, "sgWidget", void 0);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "unmounted", void 0);
    (0, _defineProperty2.default)(this, "watchUserReady", () => {
      if (_OwnProfileStore.OwnProfileStore.instance.isProfileInfoFetched) {
        return;
      }

      _OwnProfileStore.OwnProfileStore.instance.once(_AsyncStore.UPDATE_EVENT, this.onUserReady);
    });
    (0, _defineProperty2.default)(this, "onUserReady", () => {
      this.setState({
        isUserProfileReady: true
      });
    });
    (0, _defineProperty2.default)(this, "hasPermissionToLoad", props => {
      if (this.usingLocalWidget()) return true;
      if (!props.room) return true; // user widgets always have permissions

      const currentlyAllowedWidgets = _SettingsStore.default.getValue("allowedWidgets", props.room.roomId);

      if (currentlyAllowedWidgets[props.app.eventId] === undefined) {
        return props.userId === props.creatorUserId;
      }

      return !!currentlyAllowedWidgets[props.app.eventId];
    });
    (0, _defineProperty2.default)(this, "onMyMembership", (room, membership) => {
      if ((membership === "leave" || membership === "ban") && room.roomId === this.props.room?.roomId) {
        this.onUserLeftRoom();
      }
    });
    (0, _defineProperty2.default)(this, "onAllowedWidgetsChange", () => {
      const hasPermissionToLoad = this.hasPermissionToLoad(this.props);

      if (this.state.hasPermissionToLoad && !hasPermissionToLoad) {
        // Force the widget to be non-persistent (able to be deleted/forgotten)
        _ActiveWidgetStore.default.instance.destroyPersistentWidget(this.props.app.id, this.props.app.roomId);

        _PersistedElement.default.destroyElement(this.persistKey);

        this.sgWidget?.stopMessaging();
      }

      this.setState({
        hasPermissionToLoad
      });
    });
    (0, _defineProperty2.default)(this, "iframeRefChange", ref => {
      this.iframe = ref;
      if (this.unmounted) return;

      if (ref) {
        this.startMessaging();
      } else {
        this.resetWidget(this.props);
      }
    });
    (0, _defineProperty2.default)(this, "onWidgetPreparing", () => {
      this.setState({
        loading: false
      });
    });
    (0, _defineProperty2.default)(this, "onWidgetCapabilitiesNotified", () => {
      this.setState({
        requiresClient: this.sgWidget.widgetApi.hasCapability(_ElementWidgetCapabilities.ElementWidgetCapabilities.RequiresClient)
      });
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case 'm.sticker':
          if (payload.widgetId === this.props.app.id && this.sgWidget.widgetApi.hasCapability(_matrixWidgetApi.MatrixCapabilities.StickerSending)) {
            _dispatcher.default.dispatch({
              action: 'post_sticker_message',
              data: _objectSpread(_objectSpread({}, payload.data), {}, {
                threadId: this.props.threadId
              })
            });

            _dispatcher.default.dispatch({
              action: 'stickerpicker_close'
            });
          } else {
            _logger.logger.warn('Ignoring sticker message. Invalid capability');
          }

          break;

        case _actions.Action.AfterLeaveRoom:
          if (payload.room_id === this.props.room?.roomId) {
            // call this before we get it echoed down /sync, so it doesn't hang around as long and look jarring
            this.onUserLeftRoom();
          }

          break;
      }
    });
    (0, _defineProperty2.default)(this, "grantWidgetPermission", () => {
      const roomId = this.props.room?.roomId;

      _logger.logger.info("Granting permission for widget to load: " + this.props.app.eventId);

      const current = _SettingsStore.default.getValue("allowedWidgets", roomId);

      current[this.props.app.eventId] = true;

      const level = _SettingsStore.default.firstSupportedLevel("allowedWidgets");

      _SettingsStore.default.setValue("allowedWidgets", roomId, level, current).then(() => {
        this.setState({
          hasPermissionToLoad: true
        }); // Fetch a token for the integration manager, now that we're allowed to

        this.startWidget();
      }).catch(err => {
        _logger.logger.error(err); // We don't really need to do anything about this - the user will just hit the button again.

      });
    });
    (0, _defineProperty2.default)(this, "onPopoutWidgetClick", () => {
      // Ensure Jitsi conferences are closed on pop-out, to not confuse the user to join them
      // twice from the same computer, which Jitsi can have problems with (audio echo/gain-loop).
      if (_WidgetType.WidgetType.JITSI.matches(this.props.app.type)) {
        this.reload();
      } // Using Object.assign workaround as the following opens in a new window instead of a new tab.
      // window.open(this._getPopoutUrl(), '_blank', 'noopener=yes');


      Object.assign(document.createElement('a'), {
        target: '_blank',
        href: this.sgWidget.popoutUrl,
        rel: 'noreferrer noopener'
      }).click();
    });
    (0, _defineProperty2.default)(this, "onToggleMaximisedClick", () => {
      if (!this.props.room) return; // ignore action - it shouldn't even be visible

      const targetContainer = _WidgetLayoutStore.WidgetLayoutStore.instance.isInContainer(this.props.room, this.props.app, _WidgetLayoutStore.Container.Center) ? _WidgetLayoutStore.Container.Top : _WidgetLayoutStore.Container.Center;

      _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(this.props.room, this.props.app, targetContainer);
    });
    (0, _defineProperty2.default)(this, "onMinimiseClicked", () => {
      if (!this.props.room) return; // ignore action - it shouldn't even be visible

      _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(this.props.room, this.props.app, _WidgetLayoutStore.Container.Right);
    });
    (0, _defineProperty2.default)(this, "onContextMenuClick", () => {
      this.setState({
        menuDisplayed: true
      });
    });
    (0, _defineProperty2.default)(this, "closeContextMenu", () => {
      this.setState({
        menuDisplayed: false
      });
    });

    if (!this.props.miniMode) {
      _ActiveWidgetStore.default.instance.dockWidget(this.props.app.id, this.props.app.roomId);
    } // The key used for PersistedElement


    this.persistKey = (0, _PersistedElement.getPersistKey)(_WidgetUtils.default.getWidgetUid(this.props.app));

    try {
      this.sgWidget = new _StopGapWidget.StopGapWidget(this.props);
      this.setupSgListeners();
    } catch (e) {
      _logger.logger.log("Failed to construct widget", e);

      this.sgWidget = null;
    }

    this.state = this.getNewState(_props);
  }

  onUserLeftRoom() {
    const isActiveWidget = _ActiveWidgetStore.default.instance.getWidgetPersistence(this.props.app.id, this.props.app.roomId);

    if (isActiveWidget) {
      // We just left the room that the active widget was from.
      if (this.props.room && _RoomViewStore.RoomViewStore.instance.getRoomId() !== this.props.room.roomId) {
        // If we are not actively looking at the room then destroy this widget entirely.
        this.endWidgetActions();
      } else if (_WidgetType.WidgetType.JITSI.matches(this.props.app.type)) {
        // If this was a Jitsi then reload to end call.
        this.reload();
      } else {
        // Otherwise just cancel its persistence.
        _ActiveWidgetStore.default.instance.destroyPersistentWidget(this.props.app.id, this.props.app.roomId);
      }
    }
  }

  determineInitialRequiresClientState() {
    try {
      const mockWidget = new _StopGapWidget.ElementWidget(this.props.app);

      const widgetApi = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessaging(mockWidget, this.props.room.roomId);

      if (widgetApi) {
        // Load value from existing API to prevent resetting the requiresClient value on layout changes.
        return widgetApi.hasCapability(_ElementWidgetCapabilities.ElementWidgetCapabilities.RequiresClient);
      }
    } catch {// fallback to true
    } // requiresClient is initially set to true. This avoids the broken state of the popout
    // button being visible (for an instance) and then disappearing when the widget is loaded.
    // requiresClient <-> hide the popout button


    return true;
  }
  /**
   * Set initial component state when the App wUrl (widget URL) is being updated.
   * Component props *must* be passed (rather than relying on this.props).
   * @param  {Object} newProps The new properties of the component
   * @return {Object} Updated component state to be set with setState
   */


  getNewState(newProps) {
    return {
      initialising: true,
      // True while we are mangling the widget URL
      // True while the iframe content is loading
      loading: this.props.waitForIframeLoad && !_PersistedElement.default.isMounted(this.persistKey),
      // Assume that widget has permission to load if we are the user who
      // added it to the room, or if explicitly granted by the user
      hasPermissionToLoad: this.hasPermissionToLoad(newProps),
      isUserProfileReady: _OwnProfileStore.OwnProfileStore.instance.isProfileInfoFetched,
      error: null,
      menuDisplayed: false,
      widgetPageTitle: this.props.widgetPageTitle,
      requiresClient: this.determineInitialRequiresClientState()
    };
  }

  isMixedContent() {
    const parentContentProtocol = window.location.protocol;

    const u = _url.default.parse(this.props.app.url);

    const childContentProtocol = u.protocol;

    if (parentContentProtocol === 'https:' && childContentProtocol !== 'https:') {
      _logger.logger.warn("Refusing to load mixed-content app:", parentContentProtocol, childContentProtocol, window.location, this.props.app.url);

      return true;
    }

    return false;
  }

  componentDidMount() {
    // Only fetch IM token on mount if we're showing and have permission to load
    if (this.sgWidget && this.state.hasPermissionToLoad) {
      this.startWidget();
    }

    this.watchUserReady();

    if (this.props.room) {
      this.context.on(_room.RoomEvent.MyMembership, this.onMyMembership);
    }

    this.allowedWidgetsWatchRef = _SettingsStore.default.watchSetting("allowedWidgets", null, this.onAllowedWidgetsChange); // Widget action listeners

    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (!this.props.miniMode) {
      _ActiveWidgetStore.default.instance.undockWidget(this.props.app.id, this.props.app.roomId);
    } // Only tear down the widget if no other component is keeping it alive,
    // because we support moving widgets between containers, in which case
    // another component will keep it loaded throughout the transition


    if (!_ActiveWidgetStore.default.instance.isLive(this.props.app.id, this.props.app.roomId)) {
      this.endWidgetActions();
    } // Widget action listeners


    if (this.dispatcherRef) _dispatcher.default.unregister(this.dispatcherRef);

    if (this.props.room) {
      this.context.off(_room.RoomEvent.MyMembership, this.onMyMembership);
    }

    _SettingsStore.default.unwatchSetting(this.allowedWidgetsWatchRef);

    _OwnProfileStore.OwnProfileStore.instance.removeListener(_AsyncStore.UPDATE_EVENT, this.onUserReady);
  }

  setupSgListeners() {
    this.sgWidget.on("preparing", this.onWidgetPreparing); // emits when the capabilities have been set up or changed

    this.sgWidget.on("capabilitiesNotified", this.onWidgetCapabilitiesNotified);
  }

  stopSgListeners() {
    if (!this.sgWidget) return;
    this.sgWidget.off("preparing", this.onWidgetPreparing);
    this.sgWidget.off("capabilitiesNotified", this.onWidgetCapabilitiesNotified);
  }

  resetWidget(newProps) {
    this.sgWidget?.stopMessaging();
    this.stopSgListeners();

    try {
      this.sgWidget = new _StopGapWidget.StopGapWidget(newProps);
      this.setupSgListeners();
      this.startWidget();
    } catch (e) {
      _logger.logger.error("Failed to construct widget", e);

      this.sgWidget = null;
    }
  }

  startWidget() {
    this.sgWidget.prepare().then(() => {
      if (this.unmounted) return;
      this.setState({
        initialising: false
      });
    });
  }

  startMessaging() {
    try {
      this.sgWidget?.startMessaging(this.iframe);
    } catch (e) {
      _logger.logger.error("Failed to start widget", e);
    }
  }

  // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line @typescript-eslint/naming-convention
  UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line camelcase
    if (nextProps.app.url !== this.props.app.url) {
      this.getNewState(nextProps);

      if (this.state.hasPermissionToLoad) {
        this.resetWidget(nextProps);
      }
    }

    if (nextProps.widgetPageTitle !== this.props.widgetPageTitle) {
      this.setState({
        widgetPageTitle: nextProps.widgetPageTitle
      });
    }
  }
  /**
   * Ends all widget interaction, such as cancelling calls and disabling webcams.
   * @private
   * @returns {Promise<*>} Resolves when the widget is terminated, or timeout passed.
   */


  async endWidgetActions() {
    // widget migration dev note: async to maintain signature
    // HACK: This is a really dirty way to ensure that Jitsi cleans up
    // its hold on the webcam. Without this, the widget holds a media
    // stream open, even after death. See https://github.com/vector-im/element-web/issues/7351
    if (this.iframe) {
      // In practice we could just do `+= ''` to trick the browser
      // into thinking the URL changed, however I can foresee this
      // being optimized out by a browser. Instead, we'll just point
      // the iframe at a page that is reasonably safe to use in the
      // event the iframe doesn't wink away.
      // This is relative to where the Element instance is located.
      this.iframe.src = 'about:blank';
    }

    if (_WidgetType.WidgetType.JITSI.matches(this.props.app.type) && this.props.room) {
      _LegacyCallHandler.default.instance.hangupCallApp(this.props.room.roomId);
    } // Delete the widget from the persisted store for good measure.


    _PersistedElement.default.destroyElement(this.persistKey);

    _ActiveWidgetStore.default.instance.destroyPersistentWidget(this.props.app.id, this.props.app.roomId);

    this.sgWidget?.stopMessaging({
      forceDestroy: true
    });
  }

  formatAppTileName() {
    let appTileName = "No name";

    if (this.props.app.name && this.props.app.name.trim()) {
      appTileName = this.props.app.name.trim();
    }

    return appTileName;
  }
  /**
   * Whether we're using a local version of the widget rather than loading the
   * actual widget URL
   * @returns {bool} true If using a local version of the widget
   */


  usingLocalWidget() {
    return _WidgetType.WidgetType.JITSI.matches(this.props.app.type);
  }

  getTileTitle() {
    const name = this.formatAppTileName();

    const titleSpacer = /*#__PURE__*/_react.default.createElement("span", null, "\xA0-\xA0");

    let title = '';

    if (this.state.widgetPageTitle && this.state.widgetPageTitle !== this.formatAppTileName()) {
      title = this.state.widgetPageTitle;
    }

    return /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_WidgetAvatar.default, {
      app: this.props.app
    }), /*#__PURE__*/_react.default.createElement("b", null, name), /*#__PURE__*/_react.default.createElement("span", null, title ? titleSpacer : '', title));
  }

  reload() {
    this.endWidgetActions().then(() => {
      // reset messaging
      this.resetWidget(this.props);
      this.startMessaging();

      if (this.iframe) {
        // Reload iframe
        this.iframe.src = this.sgWidget.embedUrl;
      }
    });
  } // TODO replace with full screen interactions


  render() {
    let appTileBody; // Note that there is advice saying allow-scripts shouldn't be used with allow-same-origin
    // because that would allow the iframe to programmatically remove the sandbox attribute, but
    // this would only be for content hosted on the same origin as the element client: anything
    // hosted on the same origin as the client will get the same access as if you clicked
    // a link to it.

    const sandboxFlags = "allow-forms allow-popups allow-popups-to-escape-sandbox " + "allow-same-origin allow-scripts allow-presentation allow-downloads"; // Additional iframe feature permissions
    // (see - https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-permissions-in-cross-origin-iframes and https://wicg.github.io/feature-policy/)

    const iframeFeatures = "microphone; camera; encrypted-media; autoplay; display-capture; clipboard-write;";
    const appTileBodyClass = 'mx_AppTileBody' + (this.props.miniMode ? '_mini  ' : ' ');
    const appTileBodyStyles = {};

    if (this.props.pointerEvents) {
      appTileBodyStyles['pointerEvents'] = this.props.pointerEvents;
    }

    const loadingElement = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppLoading_spinner_fadeIn"
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      message: (0, _languageHandler._t)("Loading...")
    }));

    const widgetTitle = _WidgetUtils.default.getWidgetName(this.props.app);

    if (this.sgWidget === null) {
      appTileBody = /*#__PURE__*/_react.default.createElement("div", {
        className: appTileBodyClass,
        style: appTileBodyStyles
      }, /*#__PURE__*/_react.default.createElement(_AppWarning.default, {
        errorMsg: (0, _languageHandler._t)("Error loading Widget")
      }));
    } else if (!this.state.hasPermissionToLoad) {
      // only possible for room widgets, can assert this.props.room here
      const isEncrypted = this.context.isRoomEncrypted(this.props.room.roomId);
      appTileBody = /*#__PURE__*/_react.default.createElement("div", {
        className: appTileBodyClass,
        style: appTileBodyStyles
      }, /*#__PURE__*/_react.default.createElement(_AppPermission.default, {
        roomId: this.props.room.roomId,
        creatorUserId: this.props.creatorUserId,
        url: this.sgWidget.embedUrl,
        isRoomEncrypted: isEncrypted,
        onPermissionGranted: this.grantWidgetPermission
      }));
    } else if (this.state.initialising || !this.state.isUserProfileReady) {
      appTileBody = /*#__PURE__*/_react.default.createElement("div", {
        className: appTileBodyClass + (this.state.loading ? 'mx_AppLoading' : ''),
        style: appTileBodyStyles
      }, loadingElement);
    } else {
      if (this.isMixedContent()) {
        appTileBody = /*#__PURE__*/_react.default.createElement("div", {
          className: appTileBodyClass,
          style: appTileBodyStyles
        }, /*#__PURE__*/_react.default.createElement(_AppWarning.default, {
          errorMsg: (0, _languageHandler._t)("Error - Mixed content")
        }));
      } else {
        appTileBody = /*#__PURE__*/_react.default.createElement("div", {
          className: appTileBodyClass + (this.state.loading ? 'mx_AppLoading' : ''),
          style: appTileBodyStyles
        }, this.state.loading && loadingElement, /*#__PURE__*/_react.default.createElement("iframe", {
          title: widgetTitle,
          allow: iframeFeatures,
          ref: this.iframeRefChange,
          src: this.sgWidget.embedUrl,
          allowFullScreen: true,
          sandbox: sandboxFlags
        }));

        if (!this.props.userWidget) {
          // All room widgets can theoretically be allowed to remain on screen, so we
          // wrap them all in a PersistedElement from the get-go. If we wait, the iframe
          // will be re-mounted later, which means the widget has to start over, which is
          // bad.
          // Also wrap the PersistedElement in a div to fix the height, otherwise
          // AppTile's border is in the wrong place
          // For persisted apps in PiP we want the zIndex to be higher then for other persisted apps (100)
          // otherwise there are issues that the PiP view is drawn UNDER another widget (Persistent app) when dragged around.
          const zIndexAboveOtherPersistentElements = 101;
          appTileBody = /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_AppTile_persistedWrapper"
          }, /*#__PURE__*/_react.default.createElement(_PersistedElement.default, {
            zIndex: this.props.miniMode ? zIndexAboveOtherPersistentElements : 9,
            persistKey: this.persistKey,
            moveRef: this.props.movePersistedElement
          }, appTileBody));
        }
      }
    }

    let appTileClasses;

    if (this.props.miniMode) {
      appTileClasses = {
        mx_AppTile_mini: true
      };
    } else if (this.props.fullWidth) {
      appTileClasses = {
        mx_AppTileFullWidth: true
      };
    } else {
      appTileClasses = {
        mx_AppTile: true
      };
    }

    appTileClasses = (0, _classnames.default)(appTileClasses);
    let contextMenu;

    if (this.state.menuDisplayed) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_WidgetContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.aboveLeftOf)(this.contextMenuButton.current.getBoundingClientRect(), null), {
        app: this.props.app,
        onFinished: this.closeContextMenu,
        showUnpin: !this.props.userWidget,
        userWidget: this.props.userWidget,
        onEditClick: this.props.onEditClick,
        onDeleteClick: this.props.onDeleteClick
      }));
    }

    const layoutButtons = [];

    if (this.props.showLayoutButtons) {
      const isMaximised = _WidgetLayoutStore.WidgetLayoutStore.instance.isInContainer(this.props.room, this.props.app, _WidgetLayoutStore.Container.Center);

      const maximisedClasses = (0, _classnames.default)({
        "mx_AppTileMenuBar_iconButton": true,
        "mx_AppTileMenuBar_iconButton_collapse": isMaximised,
        "mx_AppTileMenuBar_iconButton_maximise": !isMaximised
      });
      layoutButtons.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "toggleMaximised",
        className: maximisedClasses,
        title: isMaximised ? (0, _languageHandler._t)("Un-maximise") : (0, _languageHandler._t)("Maximise"),
        onClick: this.onToggleMaximisedClick
      }));
      layoutButtons.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "minimise",
        className: "mx_AppTileMenuBar_iconButton mx_AppTileMenuBar_iconButton_minimise",
        title: (0, _languageHandler._t)("Minimise"),
        onClick: this.onMinimiseClicked
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: appTileClasses,
      id: this.props.app.id
    }, this.props.showMenubar && /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppTileMenuBar"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AppTileMenuBarTitle",
      style: {
        pointerEvents: this.props.handleMinimisePointerEvents ? 'all' : "none"
      }
    }, this.props.showTitle && this.getTileTitle()), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AppTileMenuBarWidgets"
    }, layoutButtons, this.props.showPopout && !this.state.requiresClient && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_AppTileMenuBar_iconButton mx_AppTileMenuBar_iconButton_popout",
      title: (0, _languageHandler._t)('Popout widget'),
      onClick: this.onPopoutWidgetClick
    }), /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
      className: "mx_AppTileMenuBar_iconButton mx_AppTileMenuBar_iconButton_menu",
      label: (0, _languageHandler._t)("Options"),
      isExpanded: this.state.menuDisplayed,
      inputRef: this.contextMenuButton,
      onClick: this.onContextMenuClick
    }))), appTileBody), contextMenu);
  }

}

exports.default = AppTile;
(0, _defineProperty2.default)(AppTile, "contextType", _MatrixClientContext.default);
(0, _defineProperty2.default)(AppTile, "defaultProps", {
  waitForIframeLoad: true,
  showMenubar: true,
  showTitle: true,
  showPopout: true,
  handleMinimisePointerEvents: false,
  userWidget: false,
  miniMode: false,
  threadId: null,
  showLayoutButtons: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcHBUaWxlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiT3duUHJvZmlsZVN0b3JlIiwiaW5zdGFuY2UiLCJpc1Byb2ZpbGVJbmZvRmV0Y2hlZCIsIm9uY2UiLCJVUERBVEVfRVZFTlQiLCJvblVzZXJSZWFkeSIsInNldFN0YXRlIiwiaXNVc2VyUHJvZmlsZVJlYWR5IiwidXNpbmdMb2NhbFdpZGdldCIsInJvb20iLCJjdXJyZW50bHlBbGxvd2VkV2lkZ2V0cyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsInJvb21JZCIsImFwcCIsImV2ZW50SWQiLCJ1bmRlZmluZWQiLCJ1c2VySWQiLCJjcmVhdG9yVXNlcklkIiwibWVtYmVyc2hpcCIsIm9uVXNlckxlZnRSb29tIiwiaGFzUGVybWlzc2lvblRvTG9hZCIsInN0YXRlIiwiQWN0aXZlV2lkZ2V0U3RvcmUiLCJkZXN0cm95UGVyc2lzdGVudFdpZGdldCIsImlkIiwiUGVyc2lzdGVkRWxlbWVudCIsImRlc3Ryb3lFbGVtZW50IiwicGVyc2lzdEtleSIsInNnV2lkZ2V0Iiwic3RvcE1lc3NhZ2luZyIsInJlZiIsImlmcmFtZSIsInVubW91bnRlZCIsInN0YXJ0TWVzc2FnaW5nIiwicmVzZXRXaWRnZXQiLCJsb2FkaW5nIiwicmVxdWlyZXNDbGllbnQiLCJ3aWRnZXRBcGkiLCJoYXNDYXBhYmlsaXR5IiwiRWxlbWVudFdpZGdldENhcGFiaWxpdGllcyIsIlJlcXVpcmVzQ2xpZW50IiwicGF5bG9hZCIsImFjdGlvbiIsIndpZGdldElkIiwiTWF0cml4Q2FwYWJpbGl0aWVzIiwiU3RpY2tlclNlbmRpbmciLCJkaXMiLCJkaXNwYXRjaCIsImRhdGEiLCJ0aHJlYWRJZCIsImxvZ2dlciIsIndhcm4iLCJBY3Rpb24iLCJBZnRlckxlYXZlUm9vbSIsInJvb21faWQiLCJpbmZvIiwiY3VycmVudCIsImxldmVsIiwiZmlyc3RTdXBwb3J0ZWRMZXZlbCIsInNldFZhbHVlIiwidGhlbiIsInN0YXJ0V2lkZ2V0IiwiY2F0Y2giLCJlcnIiLCJlcnJvciIsIldpZGdldFR5cGUiLCJKSVRTSSIsIm1hdGNoZXMiLCJ0eXBlIiwicmVsb2FkIiwiT2JqZWN0IiwiYXNzaWduIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidGFyZ2V0IiwiaHJlZiIsInBvcG91dFVybCIsInJlbCIsImNsaWNrIiwidGFyZ2V0Q29udGFpbmVyIiwiV2lkZ2V0TGF5b3V0U3RvcmUiLCJpc0luQ29udGFpbmVyIiwiQ29udGFpbmVyIiwiQ2VudGVyIiwiVG9wIiwibW92ZVRvQ29udGFpbmVyIiwiUmlnaHQiLCJtZW51RGlzcGxheWVkIiwibWluaU1vZGUiLCJkb2NrV2lkZ2V0IiwiZ2V0UGVyc2lzdEtleSIsIldpZGdldFV0aWxzIiwiZ2V0V2lkZ2V0VWlkIiwiU3RvcEdhcFdpZGdldCIsInNldHVwU2dMaXN0ZW5lcnMiLCJlIiwibG9nIiwiZ2V0TmV3U3RhdGUiLCJpc0FjdGl2ZVdpZGdldCIsImdldFdpZGdldFBlcnNpc3RlbmNlIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsImVuZFdpZGdldEFjdGlvbnMiLCJkZXRlcm1pbmVJbml0aWFsUmVxdWlyZXNDbGllbnRTdGF0ZSIsIm1vY2tXaWRnZXQiLCJFbGVtZW50V2lkZ2V0IiwiV2lkZ2V0TWVzc2FnaW5nU3RvcmUiLCJnZXRNZXNzYWdpbmciLCJuZXdQcm9wcyIsImluaXRpYWxpc2luZyIsIndhaXRGb3JJZnJhbWVMb2FkIiwiaXNNb3VudGVkIiwid2lkZ2V0UGFnZVRpdGxlIiwiaXNNaXhlZENvbnRlbnQiLCJwYXJlbnRDb250ZW50UHJvdG9jb2wiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInByb3RvY29sIiwidSIsInVybCIsInBhcnNlIiwiY2hpbGRDb250ZW50UHJvdG9jb2wiLCJjb21wb25lbnREaWRNb3VudCIsIndhdGNoVXNlclJlYWR5IiwiY29udGV4dCIsIm9uIiwiUm9vbUV2ZW50IiwiTXlNZW1iZXJzaGlwIiwib25NeU1lbWJlcnNoaXAiLCJhbGxvd2VkV2lkZ2V0c1dhdGNoUmVmIiwid2F0Y2hTZXR0aW5nIiwib25BbGxvd2VkV2lkZ2V0c0NoYW5nZSIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bmRvY2tXaWRnZXQiLCJpc0xpdmUiLCJ1bnJlZ2lzdGVyIiwib2ZmIiwidW53YXRjaFNldHRpbmciLCJyZW1vdmVMaXN0ZW5lciIsIm9uV2lkZ2V0UHJlcGFyaW5nIiwib25XaWRnZXRDYXBhYmlsaXRpZXNOb3RpZmllZCIsInN0b3BTZ0xpc3RlbmVycyIsInByZXBhcmUiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsInNyYyIsIkxlZ2FjeUNhbGxIYW5kbGVyIiwiaGFuZ3VwQ2FsbEFwcCIsImZvcmNlRGVzdHJveSIsImZvcm1hdEFwcFRpbGVOYW1lIiwiYXBwVGlsZU5hbWUiLCJuYW1lIiwidHJpbSIsImdldFRpbGVUaXRsZSIsInRpdGxlU3BhY2VyIiwidGl0bGUiLCJlbWJlZFVybCIsInJlbmRlciIsImFwcFRpbGVCb2R5Iiwic2FuZGJveEZsYWdzIiwiaWZyYW1lRmVhdHVyZXMiLCJhcHBUaWxlQm9keUNsYXNzIiwiYXBwVGlsZUJvZHlTdHlsZXMiLCJwb2ludGVyRXZlbnRzIiwibG9hZGluZ0VsZW1lbnQiLCJfdCIsIndpZGdldFRpdGxlIiwiZ2V0V2lkZ2V0TmFtZSIsImlzRW5jcnlwdGVkIiwiaXNSb29tRW5jcnlwdGVkIiwiZ3JhbnRXaWRnZXRQZXJtaXNzaW9uIiwiaWZyYW1lUmVmQ2hhbmdlIiwidXNlcldpZGdldCIsInpJbmRleEFib3ZlT3RoZXJQZXJzaXN0ZW50RWxlbWVudHMiLCJtb3ZlUGVyc2lzdGVkRWxlbWVudCIsImFwcFRpbGVDbGFzc2VzIiwibXhfQXBwVGlsZV9taW5pIiwiZnVsbFdpZHRoIiwibXhfQXBwVGlsZUZ1bGxXaWR0aCIsIm14X0FwcFRpbGUiLCJjbGFzc05hbWVzIiwiY29udGV4dE1lbnUiLCJhYm92ZUxlZnRPZiIsImNvbnRleHRNZW51QnV0dG9uIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2xvc2VDb250ZXh0TWVudSIsIm9uRWRpdENsaWNrIiwib25EZWxldGVDbGljayIsImxheW91dEJ1dHRvbnMiLCJzaG93TGF5b3V0QnV0dG9ucyIsImlzTWF4aW1pc2VkIiwibWF4aW1pc2VkQ2xhc3NlcyIsInB1c2giLCJvblRvZ2dsZU1heGltaXNlZENsaWNrIiwib25NaW5pbWlzZUNsaWNrZWQiLCJzaG93TWVudWJhciIsImhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50cyIsInNob3dUaXRsZSIsInNob3dQb3BvdXQiLCJvblBvcG91dFdpZGdldENsaWNrIiwib25Db250ZXh0TWVudUNsaWNrIiwiTWF0cml4Q2xpZW50Q29udGV4dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FwcFRpbGUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMjAgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IFJlYWN0LCB7IENvbnRleHRUeXBlLCBjcmVhdGVSZWYsIE11dGFibGVSZWZPYmplY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IE1hdHJpeENhcGFiaWxpdGllcyB9IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuaW1wb3J0IHsgUm9vbSwgUm9vbUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQXBwUGVybWlzc2lvbiBmcm9tICcuL0FwcFBlcm1pc3Npb24nO1xuaW1wb3J0IEFwcFdhcm5pbmcgZnJvbSAnLi9BcHBXYXJuaW5nJztcbmltcG9ydCBTcGlubmVyIGZyb20gJy4vU3Bpbm5lcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgQWN0aXZlV2lkZ2V0U3RvcmUgZnJvbSAnLi4vLi4vLi4vc3RvcmVzL0FjdGl2ZVdpZGdldFN0b3JlJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBhYm92ZUxlZnRPZiwgQ29udGV4dE1lbnVCdXR0b24gfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IFBlcnNpc3RlZEVsZW1lbnQsIHsgZ2V0UGVyc2lzdEtleSB9IGZyb20gXCIuL1BlcnNpc3RlZEVsZW1lbnRcIjtcbmltcG9ydCB7IFdpZGdldFR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vd2lkZ2V0cy9XaWRnZXRUeXBlXCI7XG5pbXBvcnQgeyBFbGVtZW50V2lkZ2V0LCBTdG9wR2FwV2lkZ2V0IH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy93aWRnZXRzL1N0b3BHYXBXaWRnZXRcIjtcbmltcG9ydCBXaWRnZXRDb250ZXh0TWVudSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9XaWRnZXRDb250ZXh0TWVudVwiO1xuaW1wb3J0IFdpZGdldEF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9XaWRnZXRBdmF0YXJcIjtcbmltcG9ydCBMZWdhY3lDYWxsSGFuZGxlciBmcm9tICcuLi8uLi8uLi9MZWdhY3lDYWxsSGFuZGxlcic7XG5pbXBvcnQgeyBJQXBwIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9XaWRnZXRTdG9yZVwiO1xuaW1wb3J0IHsgQ29udGFpbmVyLCBXaWRnZXRMYXlvdXRTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRMYXlvdXRTdG9yZVwiO1xuaW1wb3J0IHsgT3duUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL093blByb2ZpbGVTdG9yZSc7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvQXN5bmNTdG9yZSc7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmUnO1xuaW1wb3J0IFdpZGdldFV0aWxzIGZyb20gJy4uLy4uLy4uL3V0aWxzL1dpZGdldFV0aWxzJztcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgeyBFbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL3dpZGdldHMvRWxlbWVudFdpZGdldENhcGFiaWxpdGllcyc7XG5pbXBvcnQgeyBXaWRnZXRNZXNzYWdpbmdTdG9yZSB9IGZyb20gJy4uLy4uLy4uL3N0b3Jlcy93aWRnZXRzL1dpZGdldE1lc3NhZ2luZ1N0b3JlJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgYXBwOiBJQXBwO1xuICAgIC8vIElmIHJvb20gaXMgbm90IHNwZWNpZmllZCB0aGVuIGl0IGlzIGFuIGFjY291bnQgbGV2ZWwgd2lkZ2V0XG4gICAgLy8gd2hpY2ggYnlwYXNzZXMgcGVybWlzc2lvbiBwcm9tcHRzIGFzIGl0IHdhcyBhZGRlZCBleHBsaWNpdGx5IGJ5IHRoYXQgdXNlclxuICAgIHJvb20/OiBSb29tO1xuICAgIHRocmVhZElkPzogc3RyaW5nIHwgbnVsbDtcbiAgICAvLyBTcGVjaWZ5aW5nICdmdWxsV2lkdGgnIGFzIHRydWUgd2lsbCByZW5kZXIgdGhlIGFwcCB0aWxlIHRvIGZpbGwgdGhlIHdpZHRoIG9mIHRoZSBhcHAgZHJhd2VyIGNvbnRhaW5lci5cbiAgICAvLyBUaGlzIHNob3VsZCBiZSBzZXQgdG8gdHJ1ZSB3aGVuIHRoZXJlIGlzIG9ubHkgb25lIHdpZGdldCBpbiB0aGUgYXBwIGRyYXdlciwgb3RoZXJ3aXNlIGl0IHNob3VsZCBiZSBmYWxzZS5cbiAgICBmdWxsV2lkdGg/OiBib29sZWFuO1xuICAgIC8vIE9wdGlvbmFsLiBJZiBzZXQsIHJlbmRlcnMgYSBzbWFsbGVyIHZpZXcgb2YgdGhlIHdpZGdldFxuICAgIG1pbmlNb2RlPzogYm9vbGVhbjtcbiAgICAvLyBVc2VySWQgb2YgdGhlIGN1cnJlbnQgdXNlclxuICAgIHVzZXJJZDogc3RyaW5nO1xuICAgIC8vIFVzZXJJZCBvZiB0aGUgZW50aXR5IHRoYXQgYWRkZWQgLyBtb2RpZmllZCB0aGUgd2lkZ2V0XG4gICAgY3JlYXRvclVzZXJJZDogc3RyaW5nO1xuICAgIHdhaXRGb3JJZnJhbWVMb2FkOiBib29sZWFuO1xuICAgIHNob3dNZW51YmFyPzogYm9vbGVhbjtcbiAgICAvLyBPcHRpb25hbCBvbkVkaXRDbGlja0hhbmRsZXIgKG92ZXJyaWRlcyBkZWZhdWx0IGJlaGF2aW91cilcbiAgICBvbkVkaXRDbGljaz86ICgpID0+IHZvaWQ7XG4gICAgLy8gT3B0aW9uYWwgb25EZWxldGVDbGlja0hhbmRsZXIgKG92ZXJyaWRlcyBkZWZhdWx0IGJlaGF2aW91cilcbiAgICBvbkRlbGV0ZUNsaWNrPzogKCkgPT4gdm9pZDtcbiAgICAvLyBPcHRpb25hbGx5IGhpZGUgdGhlIHRpbGUgdGl0bGVcbiAgICBzaG93VGl0bGU/OiBib29sZWFuO1xuICAgIC8vIE9wdGlvbmFsbHkgaGFuZGxlIG1pbmltaXNlIGJ1dHRvbiBwb2ludGVyIGV2ZW50cyAoZGVmYXVsdCBmYWxzZSlcbiAgICBoYW5kbGVNaW5pbWlzZVBvaW50ZXJFdmVudHM/OiBib29sZWFuO1xuICAgIC8vIE9wdGlvbmFsbHkgaGlkZSB0aGUgcG9wb3V0IHdpZGdldCBpY29uXG4gICAgc2hvd1BvcG91dD86IGJvb2xlYW47XG4gICAgLy8gSXMgdGhpcyBhbiBpbnN0YW5jZSBvZiBhIHVzZXIgd2lkZ2V0XG4gICAgdXNlcldpZGdldDogYm9vbGVhbjtcbiAgICAvLyBzZXRzIHRoZSBwb2ludGVyLWV2ZW50cyBwcm9wZXJ0eSBvbiB0aGUgaWZyYW1lXG4gICAgcG9pbnRlckV2ZW50cz86IHN0cmluZztcbiAgICB3aWRnZXRQYWdlVGl0bGU/OiBzdHJpbmc7XG4gICAgc2hvd0xheW91dEJ1dHRvbnM/OiBib29sZWFuO1xuICAgIC8vIEhhbmRsZSB0byBtYW51YWxseSBub3RpZnkgdGhlIFBlcnNpc3RlZEVsZW1lbnQgdGhhdCBpdCBuZWVkcyB0byBtb3ZlXG4gICAgbW92ZVBlcnNpc3RlZEVsZW1lbnQ/OiBNdXRhYmxlUmVmT2JqZWN0PCgpID0+IHZvaWQ+O1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBpbml0aWFsaXNpbmc6IGJvb2xlYW47IC8vIFRydWUgd2hpbGUgd2UgYXJlIG1hbmdsaW5nIHRoZSB3aWRnZXQgVVJMXG4gICAgLy8gVHJ1ZSB3aGlsZSB0aGUgaWZyYW1lIGNvbnRlbnQgaXMgbG9hZGluZ1xuICAgIGxvYWRpbmc6IGJvb2xlYW47XG4gICAgLy8gQXNzdW1lIHRoYXQgd2lkZ2V0IGhhcyBwZXJtaXNzaW9uIHRvIGxvYWQgaWYgd2UgYXJlIHRoZSB1c2VyIHdob1xuICAgIC8vIGFkZGVkIGl0IHRvIHRoZSByb29tLCBvciBpZiBleHBsaWNpdGx5IGdyYW50ZWQgYnkgdGhlIHVzZXJcbiAgICBoYXNQZXJtaXNzaW9uVG9Mb2FkOiBib29sZWFuO1xuICAgIC8vIFdhaXQgZm9yIHVzZXIgcHJvZmlsZSBsb2FkIHRvIGRpc3BsYXkgY29ycmVjdCBuYW1lXG4gICAgaXNVc2VyUHJvZmlsZVJlYWR5OiBib29sZWFuO1xuICAgIGVycm9yOiBFcnJvcjtcbiAgICBtZW51RGlzcGxheWVkOiBib29sZWFuO1xuICAgIHdpZGdldFBhZ2VUaXRsZTogc3RyaW5nO1xuICAgIHJlcXVpcmVzQ2xpZW50OiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHBUaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHVibGljIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG4gICAgY29udGV4dDogQ29udGV4dFR5cGU8dHlwZW9mIE1hdHJpeENsaWVudENvbnRleHQ+O1xuXG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0UHJvcHM6IFBhcnRpYWw8SVByb3BzPiA9IHtcbiAgICAgICAgd2FpdEZvcklmcmFtZUxvYWQ6IHRydWUsXG4gICAgICAgIHNob3dNZW51YmFyOiB0cnVlLFxuICAgICAgICBzaG93VGl0bGU6IHRydWUsXG4gICAgICAgIHNob3dQb3BvdXQ6IHRydWUsXG4gICAgICAgIGhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50czogZmFsc2UsXG4gICAgICAgIHVzZXJXaWRnZXQ6IGZhbHNlLFxuICAgICAgICBtaW5pTW9kZTogZmFsc2UsXG4gICAgICAgIHRocmVhZElkOiBudWxsLFxuICAgICAgICBzaG93TGF5b3V0QnV0dG9uczogdHJ1ZSxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjb250ZXh0TWVudUJ1dHRvbiA9IGNyZWF0ZVJlZjxhbnk+KCk7XG4gICAgcHJpdmF0ZSBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50OyAvLyByZWYgdG8gdGhlIGlmcmFtZSAoY2FsbGJhY2sgc3R5bGUpXG4gICAgcHJpdmF0ZSBhbGxvd2VkV2lkZ2V0c1dhdGNoUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBwZXJzaXN0S2V5OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBzZ1dpZGdldDogU3RvcEdhcFdpZGdldDtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHVubW91bnRlZDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIC8vIFRpbGVzIGluIG1pbmlNb2RlIGFyZSBmbG9hdGluZywgYW5kIHRoZXJlZm9yZSBub3QgZG9ja2VkXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5taW5pTW9kZSkge1xuICAgICAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZG9ja1dpZGdldCh0aGlzLnByb3BzLmFwcC5pZCwgdGhpcy5wcm9wcy5hcHAucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBrZXkgdXNlZCBmb3IgUGVyc2lzdGVkRWxlbWVudFxuICAgICAgICB0aGlzLnBlcnNpc3RLZXkgPSBnZXRQZXJzaXN0S2V5KFdpZGdldFV0aWxzLmdldFdpZGdldFVpZCh0aGlzLnByb3BzLmFwcCkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5zZ1dpZGdldCA9IG5ldyBTdG9wR2FwV2lkZ2V0KHRoaXMucHJvcHMpO1xuICAgICAgICAgICAgdGhpcy5zZXR1cFNnTGlzdGVuZXJzKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJGYWlsZWQgdG8gY29uc3RydWN0IHdpZGdldFwiLCBlKTtcbiAgICAgICAgICAgIHRoaXMuc2dXaWRnZXQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuZ2V0TmV3U3RhdGUocHJvcHMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgd2F0Y2hVc2VyUmVhZHkgPSAoKSA9PiB7XG4gICAgICAgIGlmIChPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuaXNQcm9maWxlSW5mb0ZldGNoZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2Uub25jZShVUERBVEVfRVZFTlQsIHRoaXMub25Vc2VyUmVhZHkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlclJlYWR5ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaXNVc2VyUHJvZmlsZVJlYWR5OiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICAvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gbWFrZSB0aGUgaW1wYWN0IG9mIGNhbGxpbmcgU2V0dGluZ3NTdG9yZSBzbGlnaHRseSBsZXNzXG4gICAgcHJpdmF0ZSBoYXNQZXJtaXNzaW9uVG9Mb2FkID0gKHByb3BzOiBJUHJvcHMpOiBib29sZWFuID0+IHtcbiAgICAgICAgaWYgKHRoaXMudXNpbmdMb2NhbFdpZGdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKCFwcm9wcy5yb29tKSByZXR1cm4gdHJ1ZTsgLy8gdXNlciB3aWRnZXRzIGFsd2F5cyBoYXZlIHBlcm1pc3Npb25zXG5cbiAgICAgICAgY29uc3QgY3VycmVudGx5QWxsb3dlZFdpZGdldHMgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWxsb3dlZFdpZGdldHNcIiwgcHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICBpZiAoY3VycmVudGx5QWxsb3dlZFdpZGdldHNbcHJvcHMuYXBwLmV2ZW50SWRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wcy51c2VySWQgPT09IHByb3BzLmNyZWF0b3JVc2VySWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEhY3VycmVudGx5QWxsb3dlZFdpZGdldHNbcHJvcHMuYXBwLmV2ZW50SWRdO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlckxlZnRSb29tKCkge1xuICAgICAgICBjb25zdCBpc0FjdGl2ZVdpZGdldCA9IEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLmdldFdpZGdldFBlcnNpc3RlbmNlKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5hcHAuaWQsIHRoaXMucHJvcHMuYXBwLnJvb21JZCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGlzQWN0aXZlV2lkZ2V0KSB7XG4gICAgICAgICAgICAvLyBXZSBqdXN0IGxlZnQgdGhlIHJvb20gdGhhdCB0aGUgYWN0aXZlIHdpZGdldCB3YXMgZnJvbS5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnJvb20gJiYgUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKSAhPT0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIGFyZSBub3QgYWN0aXZlbHkgbG9va2luZyBhdCB0aGUgcm9vbSB0aGVuIGRlc3Ryb3kgdGhpcyB3aWRnZXQgZW50aXJlbHkuXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRXaWRnZXRBY3Rpb25zKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh0aGlzLnByb3BzLmFwcC50eXBlKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgd2FzIGEgSml0c2kgdGhlbiByZWxvYWQgdG8gZW5kIGNhbGwuXG4gICAgICAgICAgICAgICAgdGhpcy5yZWxvYWQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGp1c3QgY2FuY2VsIGl0cyBwZXJzaXN0ZW5jZS5cbiAgICAgICAgICAgICAgICBBY3RpdmVXaWRnZXRTdG9yZS5pbnN0YW5jZS5kZXN0cm95UGVyc2lzdGVudFdpZGdldCh0aGlzLnByb3BzLmFwcC5pZCwgdGhpcy5wcm9wcy5hcHAucm9vbUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25NeU1lbWJlcnNoaXAgPSAocm9vbTogUm9vbSwgbWVtYmVyc2hpcDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICgobWVtYmVyc2hpcCA9PT0gXCJsZWF2ZVwiIHx8IG1lbWJlcnNoaXAgPT09IFwiYmFuXCIpICYmIHJvb20ucm9vbUlkID09PSB0aGlzLnByb3BzLnJvb20/LnJvb21JZCkge1xuICAgICAgICAgICAgdGhpcy5vblVzZXJMZWZ0Um9vbSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgZGV0ZXJtaW5lSW5pdGlhbFJlcXVpcmVzQ2xpZW50U3RhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtb2NrV2lkZ2V0ID0gbmV3IEVsZW1lbnRXaWRnZXQodGhpcy5wcm9wcy5hcHApO1xuICAgICAgICAgICAgY29uc3Qgd2lkZ2V0QXBpID0gV2lkZ2V0TWVzc2FnaW5nU3RvcmUuaW5zdGFuY2UuZ2V0TWVzc2FnaW5nKG1vY2tXaWRnZXQsIHRoaXMucHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgaWYgKHdpZGdldEFwaSkge1xuICAgICAgICAgICAgICAgIC8vIExvYWQgdmFsdWUgZnJvbSBleGlzdGluZyBBUEkgdG8gcHJldmVudCByZXNldHRpbmcgdGhlIHJlcXVpcmVzQ2xpZW50IHZhbHVlIG9uIGxheW91dCBjaGFuZ2VzLlxuICAgICAgICAgICAgICAgIHJldHVybiB3aWRnZXRBcGkuaGFzQ2FwYWJpbGl0eShFbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzLlJlcXVpcmVzQ2xpZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBmYWxsYmFjayB0byB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXF1aXJlc0NsaWVudCBpcyBpbml0aWFsbHkgc2V0IHRvIHRydWUuIFRoaXMgYXZvaWRzIHRoZSBicm9rZW4gc3RhdGUgb2YgdGhlIHBvcG91dFxuICAgICAgICAvLyBidXR0b24gYmVpbmcgdmlzaWJsZSAoZm9yIGFuIGluc3RhbmNlKSBhbmQgdGhlbiBkaXNhcHBlYXJpbmcgd2hlbiB0aGUgd2lkZ2V0IGlzIGxvYWRlZC5cbiAgICAgICAgLy8gcmVxdWlyZXNDbGllbnQgPC0+IGhpZGUgdGhlIHBvcG91dCBidXR0b25cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IGluaXRpYWwgY29tcG9uZW50IHN0YXRlIHdoZW4gdGhlIEFwcCB3VXJsICh3aWRnZXQgVVJMKSBpcyBiZWluZyB1cGRhdGVkLlxuICAgICAqIENvbXBvbmVudCBwcm9wcyAqbXVzdCogYmUgcGFzc2VkIChyYXRoZXIgdGhhbiByZWx5aW5nIG9uIHRoaXMucHJvcHMpLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gbmV3UHJvcHMgVGhlIG5ldyBwcm9wZXJ0aWVzIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFVwZGF0ZWQgY29tcG9uZW50IHN0YXRlIHRvIGJlIHNldCB3aXRoIHNldFN0YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXROZXdTdGF0ZShuZXdQcm9wczogSVByb3BzKTogSVN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXRpYWxpc2luZzogdHJ1ZSwgLy8gVHJ1ZSB3aGlsZSB3ZSBhcmUgbWFuZ2xpbmcgdGhlIHdpZGdldCBVUkxcbiAgICAgICAgICAgIC8vIFRydWUgd2hpbGUgdGhlIGlmcmFtZSBjb250ZW50IGlzIGxvYWRpbmdcbiAgICAgICAgICAgIGxvYWRpbmc6IHRoaXMucHJvcHMud2FpdEZvcklmcmFtZUxvYWQgJiYgIVBlcnNpc3RlZEVsZW1lbnQuaXNNb3VudGVkKHRoaXMucGVyc2lzdEtleSksXG4gICAgICAgICAgICAvLyBBc3N1bWUgdGhhdCB3aWRnZXQgaGFzIHBlcm1pc3Npb24gdG8gbG9hZCBpZiB3ZSBhcmUgdGhlIHVzZXIgd2hvXG4gICAgICAgICAgICAvLyBhZGRlZCBpdCB0byB0aGUgcm9vbSwgb3IgaWYgZXhwbGljaXRseSBncmFudGVkIGJ5IHRoZSB1c2VyXG4gICAgICAgICAgICBoYXNQZXJtaXNzaW9uVG9Mb2FkOiB0aGlzLmhhc1Blcm1pc3Npb25Ub0xvYWQobmV3UHJvcHMpLFxuICAgICAgICAgICAgaXNVc2VyUHJvZmlsZVJlYWR5OiBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuaXNQcm9maWxlSW5mb0ZldGNoZWQsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIG1lbnVEaXNwbGF5ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgd2lkZ2V0UGFnZVRpdGxlOiB0aGlzLnByb3BzLndpZGdldFBhZ2VUaXRsZSxcbiAgICAgICAgICAgIHJlcXVpcmVzQ2xpZW50OiB0aGlzLmRldGVybWluZUluaXRpYWxSZXF1aXJlc0NsaWVudFN0YXRlKCksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFsbG93ZWRXaWRnZXRzQ2hhbmdlID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBoYXNQZXJtaXNzaW9uVG9Mb2FkID0gdGhpcy5oYXNQZXJtaXNzaW9uVG9Mb2FkKHRoaXMucHJvcHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmhhc1Blcm1pc3Npb25Ub0xvYWQgJiYgIWhhc1Blcm1pc3Npb25Ub0xvYWQpIHtcbiAgICAgICAgICAgIC8vIEZvcmNlIHRoZSB3aWRnZXQgdG8gYmUgbm9uLXBlcnNpc3RlbnQgKGFibGUgdG8gYmUgZGVsZXRlZC9mb3Jnb3R0ZW4pXG4gICAgICAgICAgICBBY3RpdmVXaWRnZXRTdG9yZS5pbnN0YW5jZS5kZXN0cm95UGVyc2lzdGVudFdpZGdldCh0aGlzLnByb3BzLmFwcC5pZCwgdGhpcy5wcm9wcy5hcHAucm9vbUlkKTtcbiAgICAgICAgICAgIFBlcnNpc3RlZEVsZW1lbnQuZGVzdHJveUVsZW1lbnQodGhpcy5wZXJzaXN0S2V5KTtcbiAgICAgICAgICAgIHRoaXMuc2dXaWRnZXQ/LnN0b3BNZXNzYWdpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBoYXNQZXJtaXNzaW9uVG9Mb2FkIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGlzTWl4ZWRDb250ZW50KCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBwYXJlbnRDb250ZW50UHJvdG9jb2wgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2w7XG4gICAgICAgIGNvbnN0IHUgPSB1cmwucGFyc2UodGhpcy5wcm9wcy5hcHAudXJsKTtcbiAgICAgICAgY29uc3QgY2hpbGRDb250ZW50UHJvdG9jb2wgPSB1LnByb3RvY29sO1xuICAgICAgICBpZiAocGFyZW50Q29udGVudFByb3RvY29sID09PSAnaHR0cHM6JyAmJiBjaGlsZENvbnRlbnRQcm90b2NvbCAhPT0gJ2h0dHBzOicpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiUmVmdXNpbmcgdG8gbG9hZCBtaXhlZC1jb250ZW50IGFwcDpcIixcbiAgICAgICAgICAgICAgICBwYXJlbnRDb250ZW50UHJvdG9jb2wsIGNoaWxkQ29udGVudFByb3RvY29sLCB3aW5kb3cubG9jYXRpb24sIHRoaXMucHJvcHMuYXBwLnVybCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICAvLyBPbmx5IGZldGNoIElNIHRva2VuIG9uIG1vdW50IGlmIHdlJ3JlIHNob3dpbmcgYW5kIGhhdmUgcGVybWlzc2lvbiB0byBsb2FkXG4gICAgICAgIGlmICh0aGlzLnNnV2lkZ2V0ICYmIHRoaXMuc3RhdGUuaGFzUGVybWlzc2lvblRvTG9hZCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydFdpZGdldCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud2F0Y2hVc2VyUmVhZHkoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQub24oUm9vbUV2ZW50Lk15TWVtYmVyc2hpcCwgdGhpcy5vbk15TWVtYmVyc2hpcCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFsbG93ZWRXaWRnZXRzV2F0Y2hSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcImFsbG93ZWRXaWRnZXRzXCIsIG51bGwsIHRoaXMub25BbGxvd2VkV2lkZ2V0c0NoYW5nZSk7XG4gICAgICAgIC8vIFdpZGdldCBhY3Rpb24gbGlzdGVuZXJzXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWluaU1vZGUpIHtcbiAgICAgICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLnVuZG9ja1dpZGdldCh0aGlzLnByb3BzLmFwcC5pZCwgdGhpcy5wcm9wcy5hcHAucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9ubHkgdGVhciBkb3duIHRoZSB3aWRnZXQgaWYgbm8gb3RoZXIgY29tcG9uZW50IGlzIGtlZXBpbmcgaXQgYWxpdmUsXG4gICAgICAgIC8vIGJlY2F1c2Ugd2Ugc3VwcG9ydCBtb3Zpbmcgd2lkZ2V0cyBiZXR3ZWVuIGNvbnRhaW5lcnMsIGluIHdoaWNoIGNhc2VcbiAgICAgICAgLy8gYW5vdGhlciBjb21wb25lbnQgd2lsbCBrZWVwIGl0IGxvYWRlZCB0aHJvdWdob3V0IHRoZSB0cmFuc2l0aW9uXG4gICAgICAgIGlmICghQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2UuaXNMaXZlKHRoaXMucHJvcHMuYXBwLmlkLCB0aGlzLnByb3BzLmFwcC5yb29tSWQpKSB7XG4gICAgICAgICAgICB0aGlzLmVuZFdpZGdldEFjdGlvbnMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdpZGdldCBhY3Rpb24gbGlzdGVuZXJzXG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXJSZWYpIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucm9vbSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0Lm9mZihSb29tRXZlbnQuTXlNZW1iZXJzaGlwLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5hbGxvd2VkV2lkZ2V0c1dhdGNoUmVmKTtcbiAgICAgICAgT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLnJlbW92ZUxpc3RlbmVyKFVQREFURV9FVkVOVCwgdGhpcy5vblVzZXJSZWFkeSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXR1cFNnTGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnNnV2lkZ2V0Lm9uKFwicHJlcGFyaW5nXCIsIHRoaXMub25XaWRnZXRQcmVwYXJpbmcpO1xuICAgICAgICAvLyBlbWl0cyB3aGVuIHRoZSBjYXBhYmlsaXRpZXMgaGF2ZSBiZWVuIHNldCB1cCBvciBjaGFuZ2VkXG4gICAgICAgIHRoaXMuc2dXaWRnZXQub24oXCJjYXBhYmlsaXRpZXNOb3RpZmllZFwiLCB0aGlzLm9uV2lkZ2V0Q2FwYWJpbGl0aWVzTm90aWZpZWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RvcFNnTGlzdGVuZXJzKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2dXaWRnZXQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZ1dpZGdldC5vZmYoXCJwcmVwYXJpbmdcIiwgdGhpcy5vbldpZGdldFByZXBhcmluZyk7XG4gICAgICAgIHRoaXMuc2dXaWRnZXQub2ZmKFwiY2FwYWJpbGl0aWVzTm90aWZpZWRcIiwgdGhpcy5vbldpZGdldENhcGFiaWxpdGllc05vdGlmaWVkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0V2lkZ2V0KG5ld1Byb3BzOiBJUHJvcHMpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZ1dpZGdldD8uc3RvcE1lc3NhZ2luZygpO1xuICAgICAgICB0aGlzLnN0b3BTZ0xpc3RlbmVycygpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnNnV2lkZ2V0ID0gbmV3IFN0b3BHYXBXaWRnZXQobmV3UHJvcHMpO1xuICAgICAgICAgICAgdGhpcy5zZXR1cFNnTGlzdGVuZXJzKCk7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0V2lkZ2V0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3Qgd2lkZ2V0XCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZ1dpZGdldCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXJ0V2lkZ2V0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNnV2lkZ2V0LnByZXBhcmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGluaXRpYWxpc2luZzogZmFsc2UgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnRNZXNzYWdpbmcoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnNnV2lkZ2V0Py5zdGFydE1lc3NhZ2luZyh0aGlzLmlmcmFtZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBzdGFydCB3aWRnZXRcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGlmcmFtZVJlZkNoYW5nZSA9IChyZWY6IEhUTUxJRnJhbWVFbGVtZW50KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuaWZyYW1lID0gcmVmO1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgaWYgKHJlZikge1xuICAgICAgICAgICAgdGhpcy5zdGFydE1lc3NhZ2luZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXNldFdpZGdldCh0aGlzLnByb3BzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICBwdWJsaWMgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBJUHJvcHMpOiB2b2lkIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgaWYgKG5leHRQcm9wcy5hcHAudXJsICE9PSB0aGlzLnByb3BzLmFwcC51cmwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0TmV3U3RhdGUobmV4dFByb3BzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmhhc1Blcm1pc3Npb25Ub0xvYWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0V2lkZ2V0KG5leHRQcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLndpZGdldFBhZ2VUaXRsZSAhPT0gdGhpcy5wcm9wcy53aWRnZXRQYWdlVGl0bGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHdpZGdldFBhZ2VUaXRsZTogbmV4dFByb3BzLndpZGdldFBhZ2VUaXRsZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5kcyBhbGwgd2lkZ2V0IGludGVyYWN0aW9uLCBzdWNoIGFzIGNhbmNlbGxpbmcgY2FsbHMgYW5kIGRpc2FibGluZyB3ZWJjYW1zLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Kj59IFJlc29sdmVzIHdoZW4gdGhlIHdpZGdldCBpcyB0ZXJtaW5hdGVkLCBvciB0aW1lb3V0IHBhc3NlZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGVuZFdpZGdldEFjdGlvbnMoKTogUHJvbWlzZTx2b2lkPiB7IC8vIHdpZGdldCBtaWdyYXRpb24gZGV2IG5vdGU6IGFzeW5jIHRvIG1haW50YWluIHNpZ25hdHVyZVxuICAgICAgICAvLyBIQUNLOiBUaGlzIGlzIGEgcmVhbGx5IGRpcnR5IHdheSB0byBlbnN1cmUgdGhhdCBKaXRzaSBjbGVhbnMgdXBcbiAgICAgICAgLy8gaXRzIGhvbGQgb24gdGhlIHdlYmNhbS4gV2l0aG91dCB0aGlzLCB0aGUgd2lkZ2V0IGhvbGRzIGEgbWVkaWFcbiAgICAgICAgLy8gc3RyZWFtIG9wZW4sIGV2ZW4gYWZ0ZXIgZGVhdGguIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy83MzUxXG4gICAgICAgIGlmICh0aGlzLmlmcmFtZSkge1xuICAgICAgICAgICAgLy8gSW4gcHJhY3RpY2Ugd2UgY291bGQganVzdCBkbyBgKz0gJydgIHRvIHRyaWNrIHRoZSBicm93c2VyXG4gICAgICAgICAgICAvLyBpbnRvIHRoaW5raW5nIHRoZSBVUkwgY2hhbmdlZCwgaG93ZXZlciBJIGNhbiBmb3Jlc2VlIHRoaXNcbiAgICAgICAgICAgIC8vIGJlaW5nIG9wdGltaXplZCBvdXQgYnkgYSBicm93c2VyLiBJbnN0ZWFkLCB3ZSdsbCBqdXN0IHBvaW50XG4gICAgICAgICAgICAvLyB0aGUgaWZyYW1lIGF0IGEgcGFnZSB0aGF0IGlzIHJlYXNvbmFibHkgc2FmZSB0byB1c2UgaW4gdGhlXG4gICAgICAgICAgICAvLyBldmVudCB0aGUgaWZyYW1lIGRvZXNuJ3Qgd2luayBhd2F5LlxuICAgICAgICAgICAgLy8gVGhpcyBpcyByZWxhdGl2ZSB0byB3aGVyZSB0aGUgRWxlbWVudCBpbnN0YW5jZSBpcyBsb2NhdGVkLlxuICAgICAgICAgICAgdGhpcy5pZnJhbWUuc3JjID0gJ2Fib3V0OmJsYW5rJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXModGhpcy5wcm9wcy5hcHAudHlwZSkgJiYgdGhpcy5wcm9wcy5yb29tKSB7XG4gICAgICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5oYW5ndXBDYWxsQXBwKHRoaXMucHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVsZXRlIHRoZSB3aWRnZXQgZnJvbSB0aGUgcGVyc2lzdGVkIHN0b3JlIGZvciBnb29kIG1lYXN1cmUuXG4gICAgICAgIFBlcnNpc3RlZEVsZW1lbnQuZGVzdHJveUVsZW1lbnQodGhpcy5wZXJzaXN0S2V5KTtcbiAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZGVzdHJveVBlcnNpc3RlbnRXaWRnZXQodGhpcy5wcm9wcy5hcHAuaWQsIHRoaXMucHJvcHMuYXBwLnJvb21JZCk7XG5cbiAgICAgICAgdGhpcy5zZ1dpZGdldD8uc3RvcE1lc3NhZ2luZyh7IGZvcmNlRGVzdHJveTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV2lkZ2V0UHJlcGFyaW5nID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25XaWRnZXRDYXBhYmlsaXRpZXNOb3RpZmllZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByZXF1aXJlc0NsaWVudDogdGhpcy5zZ1dpZGdldC53aWRnZXRBcGkuaGFzQ2FwYWJpbGl0eShFbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzLlJlcXVpcmVzQ2xpZW50KSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCk6IHZvaWQgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdtLnN0aWNrZXInOlxuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLndpZGdldElkID09PSB0aGlzLnByb3BzLmFwcC5pZCAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNnV2lkZ2V0LndpZGdldEFwaS5oYXNDYXBhYmlsaXR5KE1hdHJpeENhcGFiaWxpdGllcy5TdGlja2VyU2VuZGluZylcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3Bvc3Rfc3RpY2tlcl9tZXNzYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5wYXlsb2FkLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyZWFkSWQ6IHRoaXMucHJvcHMudGhyZWFkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnc3RpY2tlcnBpY2tlcl9jbG9zZScgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nIHN0aWNrZXIgbWVzc2FnZS4gSW52YWxpZCBjYXBhYmlsaXR5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5BZnRlckxlYXZlUm9vbTpcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5yb29tX2lkID09PSB0aGlzLnByb3BzLnJvb20/LnJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjYWxsIHRoaXMgYmVmb3JlIHdlIGdldCBpdCBlY2hvZWQgZG93biAvc3luYywgc28gaXQgZG9lc24ndCBoYW5nIGFyb3VuZCBhcyBsb25nIGFuZCBsb29rIGphcnJpbmdcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblVzZXJMZWZ0Um9vbSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdyYW50V2lkZ2V0UGVybWlzc2lvbiA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5yb29tPy5yb29tSWQ7XG4gICAgICAgIGxvZ2dlci5pbmZvKFwiR3JhbnRpbmcgcGVybWlzc2lvbiBmb3Igd2lkZ2V0IHRvIGxvYWQ6IFwiICsgdGhpcy5wcm9wcy5hcHAuZXZlbnRJZCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWxsb3dlZFdpZGdldHNcIiwgcm9vbUlkKTtcbiAgICAgICAgY3VycmVudFt0aGlzLnByb3BzLmFwcC5ldmVudElkXSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGxldmVsID0gU2V0dGluZ3NTdG9yZS5maXJzdFN1cHBvcnRlZExldmVsKFwiYWxsb3dlZFdpZGdldHNcIik7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJhbGxvd2VkV2lkZ2V0c1wiLCByb29tSWQsIGxldmVsLCBjdXJyZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBoYXNQZXJtaXNzaW9uVG9Mb2FkOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICAvLyBGZXRjaCBhIHRva2VuIGZvciB0aGUgaW50ZWdyYXRpb24gbWFuYWdlciwgbm93IHRoYXQgd2UncmUgYWxsb3dlZCB0b1xuICAgICAgICAgICAgdGhpcy5zdGFydFdpZGdldCgpO1xuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCByZWFsbHkgbmVlZCB0byBkbyBhbnl0aGluZyBhYm91dCB0aGlzIC0gdGhlIHVzZXIgd2lsbCBqdXN0IGhpdCB0aGUgYnV0dG9uIGFnYWluLlxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBmb3JtYXRBcHBUaWxlTmFtZSgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgYXBwVGlsZU5hbWUgPSBcIk5vIG5hbWVcIjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYXBwLm5hbWUgJiYgdGhpcy5wcm9wcy5hcHAubmFtZS50cmltKCkpIHtcbiAgICAgICAgICAgIGFwcFRpbGVOYW1lID0gdGhpcy5wcm9wcy5hcHAubmFtZS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFwcFRpbGVOYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgd2UncmUgdXNpbmcgYSBsb2NhbCB2ZXJzaW9uIG9mIHRoZSB3aWRnZXQgcmF0aGVyIHRoYW4gbG9hZGluZyB0aGVcbiAgICAgKiBhY3R1YWwgd2lkZ2V0IFVSTFxuICAgICAqIEByZXR1cm5zIHtib29sfSB0cnVlIElmIHVzaW5nIGEgbG9jYWwgdmVyc2lvbiBvZiB0aGUgd2lkZ2V0XG4gICAgICovXG4gICAgcHJpdmF0ZSB1c2luZ0xvY2FsV2lkZ2V0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHRoaXMucHJvcHMuYXBwLnR5cGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VGlsZVRpdGxlKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZm9ybWF0QXBwVGlsZU5hbWUoKTtcbiAgICAgICAgY29uc3QgdGl0bGVTcGFjZXIgPSA8c3Bhbj4mbmJzcDstJm5ic3A7PC9zcGFuPjtcbiAgICAgICAgbGV0IHRpdGxlID0gJyc7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLndpZGdldFBhZ2VUaXRsZSAmJiB0aGlzLnN0YXRlLndpZGdldFBhZ2VUaXRsZSAhPT0gdGhpcy5mb3JtYXRBcHBUaWxlTmFtZSgpKSB7XG4gICAgICAgICAgICB0aXRsZSA9IHRoaXMuc3RhdGUud2lkZ2V0UGFnZVRpdGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgIDxXaWRnZXRBdmF0YXIgYXBwPXt0aGlzLnByb3BzLmFwcH0gLz5cbiAgICAgICAgICAgICAgICA8Yj57IG5hbWUgfTwvYj5cbiAgICAgICAgICAgICAgICA8c3Bhbj57IHRpdGxlID8gdGl0bGVTcGFjZXIgOiAnJyB9eyB0aXRsZSB9PC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVsb2FkKCkge1xuICAgICAgICB0aGlzLmVuZFdpZGdldEFjdGlvbnMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIHJlc2V0IG1lc3NhZ2luZ1xuICAgICAgICAgICAgdGhpcy5yZXNldFdpZGdldCh0aGlzLnByb3BzKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRNZXNzYWdpbmcoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaWZyYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVsb2FkIGlmcmFtZVxuICAgICAgICAgICAgICAgIHRoaXMuaWZyYW1lLnNyYyA9IHRoaXMuc2dXaWRnZXQuZW1iZWRVcmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFRPRE8gcmVwbGFjZSB3aXRoIGZ1bGwgc2NyZWVuIGludGVyYWN0aW9uc1xuICAgIHByaXZhdGUgb25Qb3BvdXRXaWRnZXRDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgLy8gRW5zdXJlIEppdHNpIGNvbmZlcmVuY2VzIGFyZSBjbG9zZWQgb24gcG9wLW91dCwgdG8gbm90IGNvbmZ1c2UgdGhlIHVzZXIgdG8gam9pbiB0aGVtXG4gICAgICAgIC8vIHR3aWNlIGZyb20gdGhlIHNhbWUgY29tcHV0ZXIsIHdoaWNoIEppdHNpIGNhbiBoYXZlIHByb2JsZW1zIHdpdGggKGF1ZGlvIGVjaG8vZ2Fpbi1sb29wKS5cbiAgICAgICAgaWYgKFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh0aGlzLnByb3BzLmFwcC50eXBlKSkge1xuICAgICAgICAgICAgdGhpcy5yZWxvYWQoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBVc2luZyBPYmplY3QuYXNzaWduIHdvcmthcm91bmQgYXMgdGhlIGZvbGxvd2luZyBvcGVucyBpbiBhIG5ldyB3aW5kb3cgaW5zdGVhZCBvZiBhIG5ldyB0YWIuXG4gICAgICAgIC8vIHdpbmRvdy5vcGVuKHRoaXMuX2dldFBvcG91dFVybCgpLCAnX2JsYW5rJywgJ25vb3BlbmVyPXllcycpO1xuICAgICAgICBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKSxcbiAgICAgICAgICAgIHsgdGFyZ2V0OiAnX2JsYW5rJywgaHJlZjogdGhpcy5zZ1dpZGdldC5wb3BvdXRVcmwsIHJlbDogJ25vcmVmZXJyZXIgbm9vcGVuZXInIH0pLmNsaWNrKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ub2dnbGVNYXhpbWlzZWRDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnJvb20pIHJldHVybjsgLy8gaWdub3JlIGFjdGlvbiAtIGl0IHNob3VsZG4ndCBldmVuIGJlIHZpc2libGVcbiAgICAgICAgY29uc3QgdGFyZ2V0Q29udGFpbmVyID1cbiAgICAgICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmlzSW5Db250YWluZXIodGhpcy5wcm9wcy5yb29tLCB0aGlzLnByb3BzLmFwcCwgQ29udGFpbmVyLkNlbnRlcilcbiAgICAgICAgICAgICAgICA/IENvbnRhaW5lci5Ub3BcbiAgICAgICAgICAgICAgICA6IENvbnRhaW5lci5DZW50ZXI7XG4gICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm1vdmVUb0NvbnRhaW5lcih0aGlzLnByb3BzLnJvb20sIHRoaXMucHJvcHMuYXBwLCB0YXJnZXRDb250YWluZXIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTWluaW1pc2VDbGlja2VkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMucm9vbSkgcmV0dXJuOyAvLyBpZ25vcmUgYWN0aW9uIC0gaXQgc2hvdWxkbid0IGV2ZW4gYmUgdmlzaWJsZVxuICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5tb3ZlVG9Db250YWluZXIodGhpcy5wcm9wcy5yb29tLCB0aGlzLnByb3BzLmFwcCwgQ29udGFpbmVyLlJpZ2h0KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbnRleHRNZW51Q2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZW51RGlzcGxheWVkOiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNsb3NlQ29udGV4dE1lbnUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZW51RGlzcGxheWVkOiBmYWxzZSB9KTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBhcHBUaWxlQm9keTtcblxuICAgICAgICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgYWR2aWNlIHNheWluZyBhbGxvdy1zY3JpcHRzIHNob3VsZG4ndCBiZSB1c2VkIHdpdGggYWxsb3ctc2FtZS1vcmlnaW5cbiAgICAgICAgLy8gYmVjYXVzZSB0aGF0IHdvdWxkIGFsbG93IHRoZSBpZnJhbWUgdG8gcHJvZ3JhbW1hdGljYWxseSByZW1vdmUgdGhlIHNhbmRib3ggYXR0cmlidXRlLCBidXRcbiAgICAgICAgLy8gdGhpcyB3b3VsZCBvbmx5IGJlIGZvciBjb250ZW50IGhvc3RlZCBvbiB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGVsZW1lbnQgY2xpZW50OiBhbnl0aGluZ1xuICAgICAgICAvLyBob3N0ZWQgb24gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjbGllbnQgd2lsbCBnZXQgdGhlIHNhbWUgYWNjZXNzIGFzIGlmIHlvdSBjbGlja2VkXG4gICAgICAgIC8vIGEgbGluayB0byBpdC5cbiAgICAgICAgY29uc3Qgc2FuZGJveEZsYWdzID0gXCJhbGxvdy1mb3JtcyBhbGxvdy1wb3B1cHMgYWxsb3ctcG9wdXBzLXRvLWVzY2FwZS1zYW5kYm94IFwiICtcbiAgICAgICAgICAgIFwiYWxsb3ctc2FtZS1vcmlnaW4gYWxsb3ctc2NyaXB0cyBhbGxvdy1wcmVzZW50YXRpb24gYWxsb3ctZG93bmxvYWRzXCI7XG5cbiAgICAgICAgLy8gQWRkaXRpb25hbCBpZnJhbWUgZmVhdHVyZSBwZXJtaXNzaW9uc1xuICAgICAgICAvLyAoc2VlIC0gaHR0cHM6Ly9zaXRlcy5nb29nbGUuY29tL2EvY2hyb21pdW0ub3JnL2Rldi9Ib21lL2Nocm9taXVtLXNlY3VyaXR5L2RlcHJlY2F0aW5nLXBlcm1pc3Npb25zLWluLWNyb3NzLW9yaWdpbi1pZnJhbWVzIGFuZCBodHRwczovL3dpY2cuZ2l0aHViLmlvL2ZlYXR1cmUtcG9saWN5LylcbiAgICAgICAgY29uc3QgaWZyYW1lRmVhdHVyZXMgPSBcIm1pY3JvcGhvbmU7IGNhbWVyYTsgZW5jcnlwdGVkLW1lZGlhOyBhdXRvcGxheTsgZGlzcGxheS1jYXB0dXJlOyBjbGlwYm9hcmQtd3JpdGU7XCI7XG5cbiAgICAgICAgY29uc3QgYXBwVGlsZUJvZHlDbGFzcyA9ICdteF9BcHBUaWxlQm9keScgKyAodGhpcy5wcm9wcy5taW5pTW9kZSA/ICdfbWluaSAgJyA6ICcgJyk7XG4gICAgICAgIGNvbnN0IGFwcFRpbGVCb2R5U3R5bGVzID0ge307XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBvaW50ZXJFdmVudHMpIHtcbiAgICAgICAgICAgIGFwcFRpbGVCb2R5U3R5bGVzWydwb2ludGVyRXZlbnRzJ10gPSB0aGlzLnByb3BzLnBvaW50ZXJFdmVudHM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsb2FkaW5nRWxlbWVudCA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwTG9hZGluZ19zcGlubmVyX2ZhZGVJblwiPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIG1lc3NhZ2U9e190KFwiTG9hZGluZy4uLlwiKX0gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHdpZGdldFRpdGxlID0gV2lkZ2V0VXRpbHMuZ2V0V2lkZ2V0TmFtZSh0aGlzLnByb3BzLmFwcCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2dXaWRnZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGFwcFRpbGVCb2R5ID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXthcHBUaWxlQm9keUNsYXNzfSBzdHlsZT17YXBwVGlsZUJvZHlTdHlsZXN9PlxuICAgICAgICAgICAgICAgICAgICA8QXBwV2FybmluZyBlcnJvck1zZz17X3QoXCJFcnJvciBsb2FkaW5nIFdpZGdldFwiKX0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUuaGFzUGVybWlzc2lvblRvTG9hZCkge1xuICAgICAgICAgICAgLy8gb25seSBwb3NzaWJsZSBmb3Igcm9vbSB3aWRnZXRzLCBjYW4gYXNzZXJ0IHRoaXMucHJvcHMucm9vbSBoZXJlXG4gICAgICAgICAgICBjb25zdCBpc0VuY3J5cHRlZCA9IHRoaXMuY29udGV4dC5pc1Jvb21FbmNyeXB0ZWQodGhpcy5wcm9wcy5yb29tLnJvb21JZCk7XG4gICAgICAgICAgICBhcHBUaWxlQm9keSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YXBwVGlsZUJvZHlDbGFzc30gc3R5bGU9e2FwcFRpbGVCb2R5U3R5bGVzfT5cbiAgICAgICAgICAgICAgICAgICAgPEFwcFBlcm1pc3Npb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21JZD17dGhpcy5wcm9wcy5yb29tLnJvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0b3JVc2VySWQ9e3RoaXMucHJvcHMuY3JlYXRvclVzZXJJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVybD17dGhpcy5zZ1dpZGdldC5lbWJlZFVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUm9vbUVuY3J5cHRlZD17aXNFbmNyeXB0ZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblBlcm1pc3Npb25HcmFudGVkPXt0aGlzLmdyYW50V2lkZ2V0UGVybWlzc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5pbml0aWFsaXNpbmcgfHwgIXRoaXMuc3RhdGUuaXNVc2VyUHJvZmlsZVJlYWR5KSB7XG4gICAgICAgICAgICBhcHBUaWxlQm9keSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YXBwVGlsZUJvZHlDbGFzcyArICh0aGlzLnN0YXRlLmxvYWRpbmcgPyAnbXhfQXBwTG9hZGluZycgOiAnJyl9IHN0eWxlPXthcHBUaWxlQm9keVN0eWxlc30+XG4gICAgICAgICAgICAgICAgICAgIHsgbG9hZGluZ0VsZW1lbnQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTWl4ZWRDb250ZW50KCkpIHtcbiAgICAgICAgICAgICAgICBhcHBUaWxlQm9keSA9IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2FwcFRpbGVCb2R5Q2xhc3N9IHN0eWxlPXthcHBUaWxlQm9keVN0eWxlc30+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QXBwV2FybmluZyBlcnJvck1zZz17X3QoXCJFcnJvciAtIE1peGVkIGNvbnRlbnRcIil9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFwcFRpbGVCb2R5ID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YXBwVGlsZUJvZHlDbGFzcyArICh0aGlzLnN0YXRlLmxvYWRpbmcgPyAnbXhfQXBwTG9hZGluZycgOiAnJyl9IHN0eWxlPXthcHBUaWxlQm9keVN0eWxlc30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUubG9hZGluZyAmJiBsb2FkaW5nRWxlbWVudCB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8aWZyYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3dpZGdldFRpdGxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbG93PXtpZnJhbWVGZWF0dXJlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuaWZyYW1lUmVmQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17dGhpcy5zZ1dpZGdldC5lbWJlZFVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvd0Z1bGxTY3JlZW49e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FuZGJveD17c2FuZGJveEZsYWdzfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy51c2VyV2lkZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFsbCByb29tIHdpZGdldHMgY2FuIHRoZW9yZXRpY2FsbHkgYmUgYWxsb3dlZCB0byByZW1haW4gb24gc2NyZWVuLCBzbyB3ZVxuICAgICAgICAgICAgICAgICAgICAvLyB3cmFwIHRoZW0gYWxsIGluIGEgUGVyc2lzdGVkRWxlbWVudCBmcm9tIHRoZSBnZXQtZ28uIElmIHdlIHdhaXQsIHRoZSBpZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgLy8gd2lsbCBiZSByZS1tb3VudGVkIGxhdGVyLCB3aGljaCBtZWFucyB0aGUgd2lkZ2V0IGhhcyB0byBzdGFydCBvdmVyLCB3aGljaCBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBiYWQuXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyB3cmFwIHRoZSBQZXJzaXN0ZWRFbGVtZW50IGluIGEgZGl2IHRvIGZpeCB0aGUgaGVpZ2h0LCBvdGhlcndpc2VcbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwVGlsZSdzIGJvcmRlciBpcyBpbiB0aGUgd3JvbmcgcGxhY2VcblxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgcGVyc2lzdGVkIGFwcHMgaW4gUGlQIHdlIHdhbnQgdGhlIHpJbmRleCB0byBiZSBoaWdoZXIgdGhlbiBmb3Igb3RoZXIgcGVyc2lzdGVkIGFwcHMgKDEwMClcbiAgICAgICAgICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIHRoZXJlIGFyZSBpc3N1ZXMgdGhhdCB0aGUgUGlQIHZpZXcgaXMgZHJhd24gVU5ERVIgYW5vdGhlciB3aWRnZXQgKFBlcnNpc3RlbnQgYXBwKSB3aGVuIGRyYWdnZWQgYXJvdW5kLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCB6SW5kZXhBYm92ZU90aGVyUGVyc2lzdGVudEVsZW1lbnRzID0gMTAxO1xuXG4gICAgICAgICAgICAgICAgICAgIGFwcFRpbGVCb2R5ID0gPGRpdiBjbGFzc05hbWU9XCJteF9BcHBUaWxlX3BlcnNpc3RlZFdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxQZXJzaXN0ZWRFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgekluZGV4PXt0aGlzLnByb3BzLm1pbmlNb2RlID8gekluZGV4QWJvdmVPdGhlclBlcnNpc3RlbnRFbGVtZW50cyA6IDl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyc2lzdEtleT17dGhpcy5wZXJzaXN0S2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVSZWY9e3RoaXMucHJvcHMubW92ZVBlcnNpc3RlZEVsZW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBhcHBUaWxlQm9keSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1BlcnNpc3RlZEVsZW1lbnQ+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXBwVGlsZUNsYXNzZXM7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1pbmlNb2RlKSB7XG4gICAgICAgICAgICBhcHBUaWxlQ2xhc3NlcyA9IHsgbXhfQXBwVGlsZV9taW5pOiB0cnVlIH07XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5mdWxsV2lkdGgpIHtcbiAgICAgICAgICAgIGFwcFRpbGVDbGFzc2VzID0geyBteF9BcHBUaWxlRnVsbFdpZHRoOiB0cnVlIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBUaWxlQ2xhc3NlcyA9IHsgbXhfQXBwVGlsZTogdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGFwcFRpbGVDbGFzc2VzID0gY2xhc3NOYW1lcyhhcHBUaWxlQ2xhc3Nlcyk7XG5cbiAgICAgICAgbGV0IGNvbnRleHRNZW51O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tZW51RGlzcGxheWVkKSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudSA9IChcbiAgICAgICAgICAgICAgICA8V2lkZ2V0Q29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICAgICAgey4uLmFib3ZlTGVmdE9mKHRoaXMuY29udGV4dE1lbnVCdXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgbnVsbCl9XG4gICAgICAgICAgICAgICAgICAgIGFwcD17dGhpcy5wcm9wcy5hcHB9XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMuY2xvc2VDb250ZXh0TWVudX1cbiAgICAgICAgICAgICAgICAgICAgc2hvd1VucGluPXshdGhpcy5wcm9wcy51c2VyV2lkZ2V0fVxuICAgICAgICAgICAgICAgICAgICB1c2VyV2lkZ2V0PXt0aGlzLnByb3BzLnVzZXJXaWRnZXR9XG4gICAgICAgICAgICAgICAgICAgIG9uRWRpdENsaWNrPXt0aGlzLnByb3BzLm9uRWRpdENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUNsaWNrPXt0aGlzLnByb3BzLm9uRGVsZXRlQ2xpY2t9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsYXlvdXRCdXR0b25zOiBSZWFjdC5SZWFjdE5vZGVBcnJheSA9IFtdO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93TGF5b3V0QnV0dG9ucykge1xuICAgICAgICAgICAgY29uc3QgaXNNYXhpbWlzZWQgPSBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5cbiAgICAgICAgICAgICAgICBpc0luQ29udGFpbmVyKHRoaXMucHJvcHMucm9vbSwgdGhpcy5wcm9wcy5hcHAsIENvbnRhaW5lci5DZW50ZXIpO1xuICAgICAgICAgICAgY29uc3QgbWF4aW1pc2VkQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfQXBwVGlsZU1lbnVCYXJfaWNvbkJ1dHRvblwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibXhfQXBwVGlsZU1lbnVCYXJfaWNvbkJ1dHRvbl9jb2xsYXBzZVwiOiBpc01heGltaXNlZCxcbiAgICAgICAgICAgICAgICBcIm14X0FwcFRpbGVNZW51QmFyX2ljb25CdXR0b25fbWF4aW1pc2VcIjogIWlzTWF4aW1pc2VkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYXlvdXRCdXR0b25zLnB1c2goPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBrZXk9XCJ0b2dnbGVNYXhpbWlzZWRcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bWF4aW1pc2VkQ2xhc3Nlc31cbiAgICAgICAgICAgICAgICB0aXRsZT17XG4gICAgICAgICAgICAgICAgICAgIGlzTWF4aW1pc2VkID8gX3QoXCJVbi1tYXhpbWlzZVwiKSA6IF90KFwiTWF4aW1pc2VcIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblRvZ2dsZU1heGltaXNlZENsaWNrfVxuICAgICAgICAgICAgLz4pO1xuXG4gICAgICAgICAgICBsYXlvdXRCdXR0b25zLnB1c2goPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBrZXk9XCJtaW5pbWlzZVwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXBwVGlsZU1lbnVCYXJfaWNvbkJ1dHRvbiBteF9BcHBUaWxlTWVudUJhcl9pY29uQnV0dG9uX21pbmltaXNlXCJcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJNaW5pbWlzZVwiKX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uTWluaW1pc2VDbGlja2VkfVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXthcHBUaWxlQ2xhc3Nlc30gaWQ9e3RoaXMucHJvcHMuYXBwLmlkfT5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuc2hvd01lbnViYXIgJiZcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BcHBUaWxlTWVudUJhclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQXBwVGlsZU1lbnVCYXJUaXRsZVwiIHN0eWxlPXt7IHBvaW50ZXJFdmVudHM6ICh0aGlzLnByb3BzLmhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50cyA/ICdhbGwnIDogXCJub25lXCIpIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5zaG93VGl0bGUgJiYgdGhpcy5nZXRUaWxlVGl0bGUoKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BcHBUaWxlTWVudUJhcldpZGdldHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGxheW91dEJ1dHRvbnMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgKHRoaXMucHJvcHMuc2hvd1BvcG91dCAmJiAhdGhpcy5zdGF0ZS5yZXF1aXJlc0NsaWVudCkgJiYgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXBwVGlsZU1lbnVCYXJfaWNvbkJ1dHRvbiBteF9BcHBUaWxlTWVudUJhcl9pY29uQnV0dG9uX3BvcG91dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnUG9wb3V0IHdpZGdldCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUG9wb3V0V2lkZ2V0Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz4gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BcHBUaWxlTWVudUJhcl9pY29uQnV0dG9uIG14X0FwcFRpbGVNZW51QmFyX2ljb25CdXR0b25fbWVudVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9e3RoaXMuc3RhdGUubWVudURpc3BsYXllZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRSZWY9e3RoaXMuY29udGV4dE1lbnVCdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db250ZXh0TWVudUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgICAgICAgICAgeyBhcHBUaWxlQm9keSB9XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgeyBjb250ZXh0TWVudSB9XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQXNEZSxNQUFNQSxPQUFOLFNBQXNCQyxjQUFBLENBQU1DLFNBQTVCLENBQXNEO0VBaUI5QjtFQU9uQ0MsV0FBVyxDQUFDQyxNQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLE1BQU4sRUFEdUIsQ0FHdkI7O0lBSHVCO0lBQUEsc0VBUkMsSUFBQUMsZ0JBQUEsR0FRRDtJQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBLHNEQXFCRixNQUFNO01BQzNCLElBQUlDLGdDQUFBLENBQWdCQyxRQUFoQixDQUF5QkMsb0JBQTdCLEVBQW1EO1FBQy9DO01BQ0g7O01BQ0RGLGdDQUFBLENBQWdCQyxR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