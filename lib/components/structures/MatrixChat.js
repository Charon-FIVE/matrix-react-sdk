"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Views", {
  enumerable: true,
  get: function () {
    return _Views.default;
  }
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _sync = require("matrix-js-sdk/src/sync");

var _errors = require("matrix-js-sdk/src/errors");

var _utils = require("matrix-js-sdk/src/utils");

var _logger = require("matrix-js-sdk/src/logger");

var _lodash = require("lodash");

var _crypto = require("matrix-js-sdk/src/crypto");

require("focus-visible");

require("what-input");

var _PosthogTrackers = _interopRequireDefault(require("../../PosthogTrackers"));

var _DecryptionFailureTracker = require("../../DecryptionFailureTracker");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _PlatformPeg = _interopRequireDefault(require("../../PlatformPeg"));

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _Notifier = _interopRequireDefault(require("../../Notifier"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _RoomInvite = require("../../RoomInvite");

var Rooms = _interopRequireWildcard(require("../../Rooms"));

var Lifecycle = _interopRequireWildcard(require("../../Lifecycle"));

require("../../stores/LifecycleStore");

require("../../stores/AutoRageshakeStore");

var _PageTypes = _interopRequireDefault(require("../../PageTypes"));

var _createRoom = _interopRequireDefault(require("../../createRoom"));

var _languageHandler = require("../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _ThemeController = _interopRequireDefault(require("../../settings/controllers/ThemeController"));

var _Registration = require("../../Registration");

var _ErrorUtils = require("../../utils/ErrorUtils");

var _ResizeNotifier = _interopRequireDefault(require("../../utils/ResizeNotifier"));

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../utils/AutoDiscoveryUtils"));

var _DMRoomMap = _interopRequireDefault(require("../../utils/DMRoomMap"));

var _ThemeWatcher = _interopRequireDefault(require("../../settings/watchers/ThemeWatcher"));

var _FontWatcher = require("../../settings/watchers/FontWatcher");

var _RoomAliasCache = require("../../RoomAliasCache");

var _ToastStore = _interopRequireDefault(require("../../stores/ToastStore"));

var StorageManager = _interopRequireWildcard(require("../../utils/StorageManager"));

var _LoggedInView = _interopRequireDefault(require("./LoggedInView"));

var _actions = require("../../dispatcher/actions");

var _AnalyticsToast = require("../../toasts/AnalyticsToast");

var _DesktopNotificationsToast = require("../../toasts/DesktopNotificationsToast");

var _ErrorDialog = _interopRequireDefault(require("../views/dialogs/ErrorDialog"));

var _RoomNotificationStateStore = require("../../stores/notifications/RoomNotificationStateStore");

var _SettingLevel = require("../../settings/SettingLevel");

var _ThreepidInviteStore = _interopRequireDefault(require("../../stores/ThreepidInviteStore"));

var _UIFeature = require("../../settings/UIFeature");

var _DialPadModal = _interopRequireDefault(require("../views/voip/DialPadModal"));

var _MobileGuideToast = require("../../toasts/MobileGuideToast");

var _pages = require("../../utils/pages");

var _RoomListStore = _interopRequireDefault(require("../../stores/room-list/RoomListStore"));

var _models = require("../../stores/room-list/models");

var _Security = _interopRequireDefault(require("../../customisations/Security"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _QuestionDialog = _interopRequireDefault(require("../views/dialogs/QuestionDialog"));

var _UserSettingsDialog = _interopRequireDefault(require("../views/dialogs/UserSettingsDialog"));

var _CreateRoomDialog = _interopRequireDefault(require("../views/dialogs/CreateRoomDialog"));

var _RoomDirectory = _interopRequireDefault(require("./RoomDirectory"));

var _KeySignatureUploadFailedDialog = _interopRequireDefault(require("../views/dialogs/KeySignatureUploadFailedDialog"));

var _IncomingSasDialog = _interopRequireDefault(require("../views/dialogs/IncomingSasDialog"));

var _CompleteSecurity = _interopRequireDefault(require("./auth/CompleteSecurity"));

var _Welcome = _interopRequireDefault(require("../views/auth/Welcome"));

var _ForgotPassword = _interopRequireDefault(require("./auth/ForgotPassword"));

var _E2eSetup = _interopRequireDefault(require("./auth/E2eSetup"));

var _Registration2 = _interopRequireDefault(require("./auth/Registration"));

var _Login = _interopRequireDefault(require("./auth/Login"));

var _ErrorBoundary = _interopRequireDefault(require("../views/elements/ErrorBoundary"));

var _VerificationRequestToast = _interopRequireDefault(require("../views/toasts/VerificationRequestToast"));

var _performance = _interopRequireWildcard(require("../../performance"));

var _UIStore = _interopRequireWildcard(require("../../stores/UIStore"));

var _SoftLogout = _interopRequireDefault(require("./auth/SoftLogout"));

var _Permalinks = require("../../utils/permalinks/Permalinks");

var _strings = require("../../utils/strings");

var _PosthogAnalytics = require("../../PosthogAnalytics");

var _sentry = require("../../sentry");

var _LegacyCallHandler = _interopRequireDefault(require("../../LegacyCallHandler"));

var _space = require("../../utils/space");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _Views = _interopRequireDefault(require("../../Views"));

var _SnakedObject = require("../../utils/SnakedObject");

var _leaveBehaviour = require("../../utils/leave-behaviour");

var _CallStore = require("../../stores/CallStore");

var _RightPanelStorePhases = require("../../stores/right-panel/RightPanelStorePhases");

var _RightPanelStore = _interopRequireDefault(require("../../stores/right-panel/RightPanelStore"));

var _RoomContext = require("../../contexts/RoomContext");

var _UseCaseSelection = require("../views/elements/UseCaseSelection");

var _isLocalRoom = require("../../utils/localRoom/isLocalRoom");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const AUTH_SCREENS = ["register", "login", "forgot_password", "start_sso", "start_cas", "welcome"]; // Actions that are redirected through the onboarding process prior to being
// re-dispatched. NOTE: some actions are non-trivial and would require
// re-factoring to be included in this list in future.

const ONBOARDING_FLOW_STARTERS = [_actions.Action.ViewUserSettings, 'view_create_chat', 'view_create_room'];

class MatrixChat extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "firstSyncComplete", false);
    (0, _defineProperty2.default)(this, "firstSyncPromise", void 0);
    (0, _defineProperty2.default)(this, "screenAfterLogin", void 0);
    (0, _defineProperty2.default)(this, "tokenLogin", void 0);
    (0, _defineProperty2.default)(this, "accountPassword", void 0);
    (0, _defineProperty2.default)(this, "accountPasswordTimer", void 0);
    (0, _defineProperty2.default)(this, "focusComposer", void 0);
    (0, _defineProperty2.default)(this, "subTitleStatus", void 0);
    (0, _defineProperty2.default)(this, "prevWindowWidth", void 0);
    (0, _defineProperty2.default)(this, "loggedInView", void 0);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "themeWatcher", void 0);
    (0, _defineProperty2.default)(this, "fontWatcher", void 0);
    (0, _defineProperty2.default)(this, "onWindowResized", () => {
      // XXX: This is a very unreliable way to detect whether or not the the devtools are open
      this.warnInConsole();
    });
    (0, _defineProperty2.default)(this, "warnInConsole", (0, _lodash.throttle)(() => {
      const largeFontSize = "50px";
      const normalFontSize = "15px";
      const waitText = (0, _languageHandler._t)("Wait!");
      const scamText = (0, _languageHandler._t)("If someone told you to copy/paste something here, " + "there is a high likelihood you're being scammed!");
      const devText = (0, _languageHandler._t)("If you know what you're doing, Element is open-source, " + "be sure to check out our GitHub (https://github.com/vector-im/element-web/) " + "and contribute!");
      global.mx_rage_logger.bypassRageshake("log", `%c${waitText}\n%c${scamText}\n%c${devText}`, `font-size:${largeFontSize}; color:blue;`, `font-size:${normalFontSize}; color:red;`, `font-size:${normalFontSize};`);
    }, 1000));
    (0, _defineProperty2.default)(this, "onAction", payload => {
      // console.log(`MatrixClientPeg.onAction: ${payload.action}`);
      // Start the onboarding process for certain actions
      if (_MatrixClientPeg.MatrixClientPeg.get()?.isGuest() && ONBOARDING_FLOW_STARTERS.includes(payload.action)) {
        // This will cause `payload` to be dispatched later, once a
        // sync has reached the "prepared" state. Setting a matrix ID
        // will cause a full login and sync and finally the deferred
        // action will be dispatched.
        _dispatcher.default.dispatch({
          action: _actions.Action.DoAfterSyncPrepared,
          deferred_action: payload
        });

        _dispatcher.default.dispatch({
          action: 'require_registration'
        });

        return;
      }

      switch (payload.action) {
        case 'MatrixActions.accountData':
          // XXX: This is a collection of several hacks to solve a minor problem. We want to
          // update our local state when the identity server changes, but don't want to put that in
          // the js-sdk as we'd be then dictating how all consumers need to behave. However,
          // this component is already bloated and we probably don't want this tiny logic in
          // here, but there's no better place in the react-sdk for it. Additionally, we're
          // abusing the MatrixActionCreator stuff to avoid errors on dispatches.
          if (payload.event_type === 'm.identity_server') {
            const fullUrl = payload.event_content ? payload.event_content['base_url'] : null;

            if (!fullUrl) {
              _MatrixClientPeg.MatrixClientPeg.get().setIdentityServerUrl(null);

              localStorage.removeItem("mx_is_access_token");
              localStorage.removeItem("mx_is_url");
            } else {
              _MatrixClientPeg.MatrixClientPeg.get().setIdentityServerUrl(fullUrl);

              localStorage.removeItem("mx_is_access_token"); // clear token

              localStorage.setItem("mx_is_url", fullUrl); // XXX: Do we still need this?
            } // redispatch the change with a more specific action


            _dispatcher.default.dispatch({
              action: 'id_server_changed'
            });
          }

          break;

        case 'logout':
          _LegacyCallHandler.default.instance.hangupAllCalls();

          Promise.all([..._CallStore.CallStore.instance.activeCalls].map(call => call.disconnect())).finally(() => Lifecycle.logout());
          break;

        case 'require_registration':
          (0, _Registration.startAnyRegistrationFlow)(payload);
          break;

        case 'start_registration':
          if (Lifecycle.isSoftLogout()) {
            this.onSoftLogout();
            break;
          } // This starts the full registration flow


          if (payload.screenAfterLogin) {
            this.screenAfterLogin = payload.screenAfterLogin;
          }

          this.startRegistration(payload.params || {});
          break;

        case 'start_login':
          if (Lifecycle.isSoftLogout()) {
            this.onSoftLogout();
            break;
          }

          if (payload.screenAfterLogin) {
            this.screenAfterLogin = payload.screenAfterLogin;
          }

          this.viewLogin();
          break;

        case 'start_password_recovery':
          this.setStateForNewView({
            view: _Views.default.FORGOT_PASSWORD
          });
          this.notifyNewScreen('forgot_password');
          break;

        case 'start_chat':
          (0, _createRoom.default)({
            dmUserId: payload.user_id
          });
          break;

        case 'leave_room':
          this.leaveRoom(payload.room_id);
          break;

        case 'forget_room':
          this.forgetRoom(payload.room_id);
          break;

        case 'copy_room':
          this.copyRoom(payload.room_id);
          break;

        case 'reject_invite':
          _Modal.default.createDialog(_QuestionDialog.default, {
            title: (0, _languageHandler._t)('Reject invitation'),
            description: (0, _languageHandler._t)('Are you sure you want to reject the invitation?'),
            onFinished: confirm => {
              if (confirm) {
                // FIXME: controller shouldn't be loading a view :(
                const modal = _Modal.default.createDialog(_Spinner.default, null, 'mx_Dialog_spinner');

                _MatrixClientPeg.MatrixClientPeg.get().leave(payload.room_id).then(() => {
                  modal.close();

                  if (this.state.currentRoomId === payload.room_id) {
                    _dispatcher.default.dispatch({
                      action: _actions.Action.ViewHomePage
                    });
                  }
                }, err => {
                  modal.close();

                  _Modal.default.createDialog(_ErrorDialog.default, {
                    title: (0, _languageHandler._t)('Failed to reject invitation'),
                    description: err.toString()
                  });
                });
              }
            }
          });

          break;

        case 'view_user_info':
          this.viewUser(payload.userId, payload.subAction);
          break;

        case "MatrixActions.RoomState.events":
          {
            const event = payload.event;

            if (event.getType() === _matrix.EventType.RoomCanonicalAlias && event.getRoomId() === this.state.currentRoomId) {
              // re-view the current room so we can update alias/id in the URL properly
              this.viewRoom({
                action: _actions.Action.ViewRoom,
                room_id: this.state.currentRoomId,
                metricsTrigger: undefined // room doesn't change

              });
            }

            break;
          }

        case _actions.Action.ViewRoom:
          {
            // Takes either a room ID or room alias: if switching to a room the client is already
            // known to be in (eg. user clicks on a room in the recents panel), supply the ID
            // If the user is clicking on a room in the context of the alias being presented
            // to them, supply the room alias. If both are supplied, the room ID will be ignored.
            const promise = this.viewRoom(payload);

            if (payload.deferred_action) {
              promise.then(() => {
                _dispatcher.default.dispatch(payload.deferred_action);
              });
            }

            break;
          }

        case 'view_legacy_group':
          this.viewLegacyGroup(payload.groupId);
          break;

        case _actions.Action.ViewUserSettings:
          {
            const tabPayload = payload;

            _Modal.default.createDialog(_UserSettingsDialog.default, {
              initialTabId: tabPayload.initialTabId
            },
            /*className=*/
            null,
            /*isPriority=*/
            false,
            /*isStatic=*/
            true); // View the welcome or home page if we need something to look at


            this.viewSomethingBehindModal();
            break;
          }

        case 'view_create_room':
          this.createRoom(payload.public, payload.defaultName, payload.type); // View the welcome or home page if we need something to look at

          this.viewSomethingBehindModal();
          break;

        case _actions.Action.ViewRoomDirectory:
          {
            _Modal.default.createDialog(_RoomDirectory.default, {
              initialText: payload.initialText
            }, 'mx_RoomDirectory_dialogWrapper', false, true); // View the welcome or home page if we need something to look at


            this.viewSomethingBehindModal();
            break;
          }

        case 'view_welcome_page':
          this.viewWelcome();
          break;

        case _actions.Action.ViewHomePage:
          this.viewHome(payload.justRegistered);
          break;

        case _actions.Action.ViewStartChatOrReuse:
          this.chatCreateOrReuse(payload.user_id);
          break;

        case 'view_create_chat':
          (0, _RoomInvite.showStartChatInviteDialog)(payload.initialText || ""); // View the welcome or home page if we need something to look at

          this.viewSomethingBehindModal();
          break;

        case 'view_invite':
          {
            const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(payload.roomId);

            if (room?.isSpaceRoom()) {
              (0, _space.showSpaceInvite)(room);
            } else {
              (0, _RoomInvite.showRoomInviteDialog)(payload.roomId);
            }

            break;
          }

        case 'view_last_screen':
          // This function does what we want, despite the name. The idea is that it shows
          // the last room we were looking at or some reasonable default/guess. We don't
          // have to worry about email invites or similar being re-triggered because the
          // function will have cleared that state and not execute that path.
          this.showScreenAfterLogin();
          break;

        case 'hide_left_panel':
          this.setState({
            collapseLhs: true
          }, () => {
            this.state.resizeNotifier.notifyLeftHandleResized();
          });
          break;

        case 'show_left_panel':
          this.setState({
            collapseLhs: false
          }, () => {
            this.state.resizeNotifier.notifyLeftHandleResized();
          });
          break;

        case _actions.Action.OpenDialPad:
          _Modal.default.createDialog(_DialPadModal.default, {}, "mx_Dialog_dialPadWrapper");

          break;

        case _actions.Action.OnLoggedIn:
          if ( // Skip this handling for token login as that always calls onLoggedIn itself
          !this.tokenLogin && !Lifecycle.isSoftLogout() && this.state.view !== _Views.default.LOGIN && this.state.view !== _Views.default.REGISTER && this.state.view !== _Views.default.COMPLETE_SECURITY && this.state.view !== _Views.default.E2E_SETUP && this.state.view !== _Views.default.USE_CASE_SELECTION) {
            this.onLoggedIn();
          }

          break;

        case 'on_client_not_viable':
          this.onSoftLogout();
          break;

        case _actions.Action.OnLoggedOut:
          this.onLoggedOut();
          break;

        case 'will_start_client':
          this.setState({
            ready: false
          }, () => {
            // if the client is about to start, we are, by definition, not ready.
            // Set ready to false now, then it'll be set to true when the sync
            // listener we set below fires.
            this.onWillStartClient();
          });
          break;

        case 'client_started':
          this.onClientStarted();
          break;

        case 'send_event':
          this.onSendEvent(payload.room_id, payload.event);
          break;

        case 'aria_hide_main_app':
          this.setState({
            hideToSRUsers: true
          });
          break;

        case 'aria_unhide_main_app':
          this.setState({
            hideToSRUsers: false
          });
          break;

        case _actions.Action.PseudonymousAnalyticsAccept:
          (0, _AnalyticsToast.hideToast)();

          _SettingsStore.default.setValue("pseudonymousAnalyticsOptIn", null, _SettingLevel.SettingLevel.ACCOUNT, true);

          break;

        case _actions.Action.PseudonymousAnalyticsReject:
          (0, _AnalyticsToast.hideToast)();

          _SettingsStore.default.setValue("pseudonymousAnalyticsOptIn", null, _SettingLevel.SettingLevel.ACCOUNT, false);

          break;

        case _actions.Action.ShowThread:
          {
            const {
              rootEvent,
              initialEvent,
              highlighted,
              scrollIntoView,
              push
            } = payload;
            const threadViewCard = {
              phase: _RightPanelStorePhases.RightPanelPhases.ThreadView,
              state: {
                threadHeadEvent: rootEvent,
                initialEvent: initialEvent,
                isInitialEventHighlighted: highlighted,
                initialEventScrollIntoView: scrollIntoView
              }
            };

            if (push ?? false) {
              _RightPanelStore.default.instance.pushCard(threadViewCard);
            } else {
              _RightPanelStore.default.instance.setCards([{
                phase: _RightPanelStorePhases.RightPanelPhases.ThreadPanel
              }, threadViewCard]);
            } // Focus the composer


            _dispatcher.default.dispatch({
              action: _actions.Action.FocusSendMessageComposer,
              context: _RoomContext.TimelineRenderingType.Thread
            });

            break;
          }
      }
    });
    (0, _defineProperty2.default)(this, "handleResize", () => {
      const LHS_THRESHOLD = 1000;
      const width = _UIStore.default.instance.windowWidth;

      if (this.prevWindowWidth < LHS_THRESHOLD && width >= LHS_THRESHOLD) {
        _dispatcher.default.dispatch({
          action: 'show_left_panel'
        });
      }

      if (this.prevWindowWidth >= LHS_THRESHOLD && width < LHS_THRESHOLD) {
        _dispatcher.default.dispatch({
          action: 'hide_left_panel'
        });
      }

      this.prevWindowWidth = width;
      this.state.resizeNotifier.notifyWindowResized();
    });
    (0, _defineProperty2.default)(this, "onRegisterClick", () => {
      this.showScreen("register");
    });
    (0, _defineProperty2.default)(this, "onLoginClick", () => {
      this.showScreen("login");
    });
    (0, _defineProperty2.default)(this, "onForgotPasswordClick", () => {
      this.showScreen("forgot_password");
    });
    (0, _defineProperty2.default)(this, "onRegisterFlowComplete", (credentials, password) => {
      return this.onUserCompletedLoginFlow(credentials, password);
    });
    (0, _defineProperty2.default)(this, "onUpdateStatusIndicator", (notificationState, state) => {
      const numUnreadRooms = notificationState.numUnreadStates; // we know that states === rooms here

      if (_PlatformPeg.default.get()) {
        _PlatformPeg.default.get().setErrorStatus(state === _sync.SyncState.Error);

        _PlatformPeg.default.get().setNotificationCount(numUnreadRooms);
      }

      this.subTitleStatus = '';

      if (state === _sync.SyncState.Error) {
        this.subTitleStatus += `[${(0, _languageHandler._t)("Offline")}] `;
      }

      if (numUnreadRooms > 0) {
        this.subTitleStatus += `[${numUnreadRooms}]`;
      }

      this.setPageSubtitle();
    });
    (0, _defineProperty2.default)(this, "onServerConfigChange", serverConfig => {
      this.setState({
        serverConfig
      });
    });
    (0, _defineProperty2.default)(this, "makeRegistrationUrl", params => {
      if (this.props.startingFragmentQueryParams.referrer) {
        params.referrer = this.props.startingFragmentQueryParams.referrer;
      }

      return this.props.makeRegistrationUrl(params);
    });
    (0, _defineProperty2.default)(this, "onUserCompletedLoginFlow", async (credentials, password) => {
      this.accountPassword = password; // self-destruct the password after 5mins

      if (this.accountPasswordTimer !== null) clearTimeout(this.accountPasswordTimer);
      this.accountPasswordTimer = setTimeout(() => {
        this.accountPassword = null;
        this.accountPasswordTimer = null;
      }, 60 * 5 * 1000); // Create and start the client

      await Lifecycle.setLoggedIn(credentials);
      await this.postLoginSetup();

      _performance.default.instance.stop(_performance.PerformanceEntryNames.LOGIN);

      _performance.default.instance.stop(_performance.PerformanceEntryNames.REGISTER);
    });
    (0, _defineProperty2.default)(this, "onCompleteSecurityE2eSetupFinished", () => {
      this.onLoggedIn();
    });
    this.state = {
      view: _Views.default.LOADING,
      collapseLhs: false,
      hideToSRUsers: false,
      syncError: null,
      // If the current syncing status is ERROR, the error object, otherwise null.
      resizeNotifier: new _ResizeNotifier.default(),
      ready: false
    };
    this.loggedInView = /*#__PURE__*/(0, _react.createRef)();

    _SdkConfig.default.put(this.props.config); // Used by _viewRoom before getting state from sync


    this.firstSyncComplete = false;
    this.firstSyncPromise = (0, _utils.defer)();

    if (this.props.config.sync_timeline_limit) {
      _MatrixClientPeg.MatrixClientPeg.opts.initialSyncLimit = this.props.config.sync_timeline_limit;
    } // a thing to call showScreen with once login completes.  this is kept
    // outside this.state because updating it should never trigger a
    // rerender.


    this.screenAfterLogin = this.props.initialScreenAfterLogin;

    if (this.screenAfterLogin) {
      const params = this.screenAfterLogin.params || {};

      if (this.screenAfterLogin.screen.startsWith("room/") && params['signurl'] && params['email']) {
        // probably a threepid invite - try to store it
        const roomId = this.screenAfterLogin.screen.substring("room/".length);

        _ThreepidInviteStore.default.instance.storeInvite(roomId, params);
      }
    }

    this.prevWindowWidth = _UIStore.default.instance.windowWidth || 1000;

    _UIStore.default.instance.on(_UIStore.UI_EVENTS.Resize, this.handleResize); // For PersistentElement


    this.state.resizeNotifier.on("middlePanelResized", this.dispatchTimelineResize);

    _RoomNotificationStateStore.RoomNotificationStateStore.instance.on(_RoomNotificationStateStore.UPDATE_STATUS_INDICATOR, this.onUpdateStatusIndicator); // Force users to go through the soft logout page if they're soft logged out


    if (Lifecycle.isSoftLogout()) {
      // When the session loads it'll be detected as soft logged out and a dispatch
      // will be sent out to say that, triggering this MatrixChat to show the soft
      // logout page.
      Lifecycle.loadSession();
    }

    this.accountPassword = null;
    this.accountPasswordTimer = null;
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.themeWatcher = new _ThemeWatcher.default();
    this.fontWatcher = new _FontWatcher.FontWatcher();
    this.themeWatcher.start();
    this.fontWatcher.start();
    this.focusComposer = false; // object field used for tracking the status info appended to the title tag.
    // we don't do it as react state as i'm scared about triggering needless react refreshes.

    this.subTitleStatus = ''; // the first thing to do is to try the token params in the query-string
    // if the session isn't soft logged out (ie: is a clean session being logged in)

    if (!Lifecycle.isSoftLogout()) {
      Lifecycle.attemptTokenLogin(this.props.realQueryParams, this.props.defaultDeviceDisplayName, this.getFragmentAfterLogin()).then(async loggedIn => {
        if (this.props.realQueryParams?.loginToken) {
          // remove the loginToken from the URL regardless
          this.props.onTokenLoginCompleted();
        }

        if (loggedIn) {
          this.tokenLogin = true; // Create and start the client

          await Lifecycle.restoreFromLocalStorage({
            ignoreGuest: true
          });
          return this.postLoginSetup();
        } // if the user has followed a login or register link, don't reanimate
        // the old creds, but rather go straight to the relevant page


        const firstScreen = this.screenAfterLogin ? this.screenAfterLogin.screen : null;

        if (firstScreen === 'login' || firstScreen === 'register' || firstScreen === 'forgot_password') {
          this.showScreenAfterLogin();
          return;
        }

        return this.loadSession();
      });
    }

    (0, _sentry.initSentry)(_SdkConfig.default.get("sentry"));
  }

  async postLoginSetup() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const cryptoEnabled = cli.isCryptoEnabled();

    if (!cryptoEnabled) {
      this.onLoggedIn();
    }

    const promisesList = [this.firstSyncPromise.promise];

    if (cryptoEnabled) {
      // wait for the client to finish downloading cross-signing keys for us so we
      // know whether or not we have keys set up on this account
      promisesList.push(cli.downloadKeys([cli.getUserId()]));
    } // Now update the state to say we're waiting for the first sync to complete rather
    // than for the login to finish.


    this.setState({
      pendingInitialSync: true
    });
    await Promise.all(promisesList);

    if (!cryptoEnabled) {
      this.setState({
        pendingInitialSync: false
      });
      return;
    }

    const crossSigningIsSetUp = cli.getStoredCrossSigningForUser(cli.getUserId());

    if (crossSigningIsSetUp) {
      if (_Security.default.SHOW_ENCRYPTION_SETUP_UI === false) {
        this.onLoggedIn();
      } else {
        this.setStateForNewView({
          view: _Views.default.COMPLETE_SECURITY
        });
      }
    } else if (await cli.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing")) {
      this.setStateForNewView({
        view: _Views.default.E2E_SETUP
      });
    } else {
      this.onLoggedIn();
    }

    this.setState({
      pendingInitialSync: false
    });
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle stage
  // eslint-disable-next-line


  UNSAFE_componentWillUpdate(props, state) {
    if (this.shouldTrackPageChange(this.state, state)) {
      this.startPageChangeTimer();
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.onWindowResized);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.shouldTrackPageChange(prevState, this.state)) {
      const durationMs = this.stopPageChangeTimer();

      _PosthogTrackers.default.instance.trackPageChange(this.state.view, this.state.page_type, durationMs);
    }

    if (this.focusComposer) {
      _dispatcher.default.fire(_actions.Action.FocusSendMessageComposer);

      this.focusComposer = false;
    }
  }

  componentWillUnmount() {
    Lifecycle.stopMatrixClient();

    _dispatcher.default.unregister(this.dispatcherRef);

    this.themeWatcher.stop();
    this.fontWatcher.stop();

    _UIStore.default.destroy();

    this.state.resizeNotifier.removeListener("middlePanelResized", this.dispatchTimelineResize);
    window.removeEventListener("resize", this.onWindowResized);
    if (this.accountPasswordTimer !== null) clearTimeout(this.accountPasswordTimer);
  }

  getFallbackHsUrl() {
    if (this.props.serverConfig?.isDefault) {
      return this.props.config.fallback_hs_url;
    } else {
      return null;
    }
  }

  getServerProperties() {
    let props = this.state.serverConfig;
    if (!props) props = this.props.serverConfig; // for unit tests

    if (!props) props = _SdkConfig.default.get("validated_server_config");
    return {
      serverConfig: props
    };
  }

  loadSession() {
    // the extra Promise.resolve() ensures that synchronous exceptions hit the same codepath as
    // asynchronous ones.
    return Promise.resolve().then(() => {
      return Lifecycle.loadSession({
        fragmentQueryParams: this.props.startingFragmentQueryParams,
        enableGuest: this.props.enableGuest,
        guestHsUrl: this.getServerProperties().serverConfig.hsUrl,
        guestIsUrl: this.getServerProperties().serverConfig.isUrl,
        defaultDeviceDisplayName: this.props.defaultDeviceDisplayName
      });
    }).then(loadedSession => {
      if (!loadedSession) {
        // fall back to showing the welcome screen... unless we have a 3pid invite pending
        if (_ThreepidInviteStore.default.instance.pickBestInvite()) {
          _dispatcher.default.dispatch({
            action: 'start_registration'
          });
        } else {
          _dispatcher.default.dispatch({
            action: "view_welcome_page"
          });
        }
      }
    }); // Note we don't catch errors from this: we catch everything within
    // loadSession as there's logic there to ask the user if they want
    // to try logging out.
  }

  startPageChangeTimer() {
    _performance.default.instance.start(_performance.PerformanceEntryNames.PAGE_CHANGE);
  }

  stopPageChangeTimer() {
    const perfMonitor = _performance.default.instance;
    perfMonitor.stop(_performance.PerformanceEntryNames.PAGE_CHANGE);
    const entries = perfMonitor.getEntries({
      name: _performance.PerformanceEntryNames.PAGE_CHANGE
    });
    const measurement = entries.pop();
    return measurement ? measurement.duration : null;
  }

  shouldTrackPageChange(prevState, state) {
    return prevState.currentRoomId !== state.currentRoomId || prevState.view !== state.view || prevState.page_type !== state.page_type;
  }

  setStateForNewView(state) {
    if (state.view === undefined) {
      throw new Error("setStateForNewView with no view!");
    }

    const newState = {
      currentUserId: null,
      justRegistered: false
    };
    Object.assign(newState, state);
    this.setState(newState);
  }

  setPage(pageType) {
    this.setState({
      page_type: pageType
    });
  }

  async startRegistration(params) {
    const newState = {
      view: _Views.default.REGISTER
    }; // Only honour params if they are all present, otherwise we reset
    // HS and IS URLs when switching to registration.

    if (params.client_secret && params.session_id && params.hs_url && params.is_url && params.sid) {
      newState.serverConfig = await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(params.hs_url, params.is_url); // If the hs url matches then take the hs name we know locally as it is likely prettier

      const defaultConfig = _SdkConfig.default.get("validated_server_config");

      if (defaultConfig && defaultConfig.hsUrl === newState.serverConfig.hsUrl) {
        newState.serverConfig.hsName = defaultConfig.hsName;
        newState.serverConfig.hsNameIsDifferent = defaultConfig.hsNameIsDifferent;
        newState.serverConfig.isDefault = defaultConfig.isDefault;
        newState.serverConfig.isNameResolvable = defaultConfig.isNameResolvable;
      }

      newState.register_client_secret = params.client_secret;
      newState.register_session_id = params.session_id;
      newState.register_id_sid = params.sid;
    }

    this.setStateForNewView(newState);
    _ThemeController.default.isLogin = true;
    this.themeWatcher.recheck();
    this.notifyNewScreen('register');
  } // switch view to the given room


  async viewRoom(roomInfo) {
    this.focusComposer = true;

    if (roomInfo.room_alias) {
      _logger.logger.log(`Switching to room alias ${roomInfo.room_alias} at event ${roomInfo.event_id}`);
    } else {
      _logger.logger.log(`Switching to room id ${roomInfo.room_id} at event ${roomInfo.event_id}`);
    } // Wait for the first sync to complete so that if a room does have an alias,
    // it would have been retrieved.


    if (!this.firstSyncComplete) {
      if (!this.firstSyncPromise) {
        _logger.logger.warn('Cannot view a room before first sync. room_id:', roomInfo.room_id);

        return;
      }

      await this.firstSyncPromise.promise;
    }

    let presentedId = roomInfo.room_alias || roomInfo.room_id;

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomInfo.room_id);

    if (room) {
      // Not all timeline events are decrypted ahead of time anymore
      // Only the critical ones for a typical UI are
      // This will start the decryption process for all events when a
      // user views a room
      room.decryptAllEvents();
      const theAlias = Rooms.getDisplayAliasForRoom(room);

      if (theAlias) {
        presentedId = theAlias; // Store display alias of the presented room in cache to speed future
        // navigation.

        (0, _RoomAliasCache.storeRoomAliasInCache)(theAlias, room.roomId);
      } // Store this as the ID of the last room accessed. This is so that we can
      // persist which room is being stored across refreshes and browser quits.


      localStorage?.setItem('mx_last_room_id', room.roomId);
    } // If we are redirecting to a Room Alias and it is for the room we already showing then replace history item


    let replaceLast = presentedId[0] === "#" && roomInfo.room_id === this.state.currentRoomId;

    if ((0, _isLocalRoom.isLocalRoom)(this.state.currentRoomId)) {
      // Replace local room history items
      replaceLast = true;
    }

    if (roomInfo.room_id === this.state.currentRoomId) {
      // if we are re-viewing the same room then copy any state we already know
      roomInfo.threepid_invite = roomInfo.threepid_invite ?? this.state.threepidInvite;
      roomInfo.oob_data = roomInfo.oob_data ?? this.state.roomOobData;
      roomInfo.forceTimeline = roomInfo.forceTimeline ?? this.state.forceTimeline;
      roomInfo.justCreatedOpts = roomInfo.justCreatedOpts ?? this.state.roomJustCreatedOpts;
    }

    if (roomInfo.event_id && roomInfo.highlighted) {
      presentedId += "/" + roomInfo.event_id;
    }

    this.setState({
      view: _Views.default.LOGGED_IN,
      currentRoomId: roomInfo.room_id || null,
      page_type: _PageTypes.default.RoomView,
      threepidInvite: roomInfo.threepid_invite,
      roomOobData: roomInfo.oob_data,
      forceTimeline: roomInfo.forceTimeline,
      ready: true,
      roomJustCreatedOpts: roomInfo.justCreatedOpts
    }, () => {
      this.notifyNewScreen('room/' + presentedId, replaceLast);
    });
  }

  viewSomethingBehindModal() {
    if (this.state.view !== _Views.default.LOGGED_IN) {
      this.viewWelcome();
      return;
    }

    if (!this.state.currentRoomId && !this.state.currentUserId) {
      this.viewHome();
    }
  }

  viewWelcome() {
    if ((0, _pages.shouldUseLoginForWelcome)(_SdkConfig.default.get())) {
      return this.viewLogin();
    }

    this.setStateForNewView({
      view: _Views.default.WELCOME
    });
    this.notifyNewScreen('welcome');
    _ThemeController.default.isLogin = true;
    this.themeWatcher.recheck();
  }

  viewLogin(otherState) {
    this.setStateForNewView(_objectSpread({
      view: _Views.default.LOGIN
    }, otherState));
    this.notifyNewScreen('login');
    _ThemeController.default.isLogin = true;
    this.themeWatcher.recheck();
  }

  viewHome() {
    let justRegistered = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    // The home page requires the "logged in" view, so we'll set that.
    this.setStateForNewView({
      view: _Views.default.LOGGED_IN,
      justRegistered,
      currentRoomId: null
    });
    this.setPage(_PageTypes.default.HomePage);
    this.notifyNewScreen('home');
    _ThemeController.default.isLogin = false;
    this.themeWatcher.recheck();
  }

  viewUser(userId, subAction) {
    // Wait for the first sync so that `getRoom` gives us a room object if it's
    // in the sync response
    const waitForSync = this.firstSyncPromise ? this.firstSyncPromise.promise : Promise.resolve();
    waitForSync.then(() => {
      if (subAction === 'chat') {
        this.chatCreateOrReuse(userId);
        return;
      }

      this.notifyNewScreen('user/' + userId);
      this.setState({
        currentUserId: userId
      });
      this.setPage(_PageTypes.default.UserView);
    });
  }

  viewLegacyGroup(groupId) {
    this.setStateForNewView({
      view: _Views.default.LOGGED_IN,
      currentRoomId: null,
      currentGroupId: groupId
    });
    this.notifyNewScreen('group/' + groupId);
    this.setPage(_PageTypes.default.LegacyGroupView);
  }

  async createRoom() {
    let defaultPublic = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    let defaultName = arguments.length > 1 ? arguments[1] : undefined;
    let type = arguments.length > 2 ? arguments[2] : undefined;

    const modal = _Modal.default.createDialog(_CreateRoomDialog.default, {
      type,
      defaultPublic,
      defaultName
    });

    const [shouldCreate, opts] = await modal.finished;

    if (shouldCreate) {
      (0, _createRoom.default)(opts);
    }
  }

  chatCreateOrReuse(userId) {
    const snakedConfig = new _SnakedObject.SnakedObject(this.props.config); // Use a deferred action to reshow the dialog once the user has registered

    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
      // No point in making 2 DMs with welcome bot. This assumes view_set_mxid will
      // result in a new DM with the welcome user.
      if (userId !== snakedConfig.get("welcome_user_id")) {
        _dispatcher.default.dispatch({
          action: _actions.Action.DoAfterSyncPrepared,
          deferred_action: {
            action: _actions.Action.ViewStartChatOrReuse,
            user_id: userId
          }
        });
      }

      _dispatcher.default.dispatch({
        action: 'require_registration',
        // If the set_mxid dialog is cancelled, view /welcome because if the
        // browser was pointing at /user/@someone:domain?action=chat, the URL
        // needs to be reset so that they can revisit /user/.. // (and trigger
        // `_chatCreateOrReuse` again)
        go_welcome_on_cancel: true,
        screen_after: {
          screen: `user/${snakedConfig.get("welcome_user_id")}`,
          params: {
            action: 'chat'
          }
        }
      });

      return;
    } // TODO: Immutable DMs replaces this


    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const dmRoomMap = new _DMRoomMap.default(client);
    const dmRooms = dmRoomMap.getDMRoomsForUserId(userId);

    if (dmRooms.length > 0) {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: dmRooms[0],
        metricsTrigger: "MessageUser"
      });
    } else {
      _dispatcher.default.dispatch({
        action: 'start_chat',
        user_id: userId
      });
    }
  }

  leaveRoomWarnings(roomId) {
    const roomToLeave = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    const isSpace = roomToLeave?.isSpaceRoom(); // Show a warning if there are additional complications.

    const warnings = [];
    const memberCount = roomToLeave.currentState.getJoinedMemberCount();

    if (memberCount === 1) {
      warnings.push( /*#__PURE__*/_react.default.createElement("span", {
        className: "warning",
        key: "only_member_warning"
      }, ' '
      /* Whitespace, otherwise the sentences get smashed together */
      , (0, _languageHandler._t)("You are the only person here. " + "If you leave, no one will be able to join in the future, including you.")));
      return warnings;
    }

    const joinRules = roomToLeave.currentState.getStateEvents('m.room.join_rules', '');

    if (joinRules) {
      const rule = joinRules.getContent().join_rule;

      if (rule !== "public") {
        warnings.push( /*#__PURE__*/_react.default.createElement("span", {
          className: "warning",
          key: "non_public_warning"
        }, ' '
        /* Whitespace, otherwise the sentences get smashed together */
        , isSpace ? (0, _languageHandler._t)("This space is not public. You will not be able to rejoin without an invite.") : (0, _languageHandler._t)("This room is not public. You will not be able to rejoin without an invite.")));
      }
    }

    return warnings;
  }

  leaveRoom(roomId) {
    const roomToLeave = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    const warnings = this.leaveRoomWarnings(roomId);
    const isSpace = roomToLeave?.isSpaceRoom();

    _Modal.default.createDialog(_QuestionDialog.default, {
      title: isSpace ? (0, _languageHandler._t)("Leave space") : (0, _languageHandler._t)("Leave room"),
      description: /*#__PURE__*/_react.default.createElement("span", null, isSpace ? (0, _languageHandler._t)("Are you sure you want to leave the space '%(spaceName)s'?", {
        spaceName: roomToLeave.name
      }) : (0, _languageHandler._t)("Are you sure you want to leave the room '%(roomName)s'?", {
        roomName: roomToLeave.name
      }), warnings),
      button: (0, _languageHandler._t)("Leave"),
      onFinished: shouldLeave => {
        if (shouldLeave) {
          (0, _leaveBehaviour.leaveRoomBehaviour)(roomId);

          _dispatcher.default.dispatch({
            action: _actions.Action.AfterLeaveRoom,
            room_id: roomId
          });
        }
      }
    });
  }

  forgetRoom(roomId) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    _MatrixClientPeg.MatrixClientPeg.get().forget(roomId).then(() => {
      // Switch to home page if we're currently viewing the forgotten room
      if (this.state.currentRoomId === roomId) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewHomePage
        });
      } // We have to manually update the room list because the forgotten room will not
      // be notified to us, therefore the room list will have no other way of knowing
      // the room is forgotten.


      _RoomListStore.default.instance.manualRoomUpdate(room, _models.RoomUpdateCause.RoomRemoved);
    }).catch(err => {
      const errCode = err.errcode || (0, _languageHandler._td)("unknown error code");

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Failed to forget room %(errCode)s", {
          errCode
        }),
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    });
  }

  async copyRoom(roomId) {
    const roomLink = (0, _Permalinks.makeRoomPermalink)(roomId);
    const success = await (0, _strings.copyPlaintext)(roomLink);

    if (!success) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Unable to copy room link"),
        description: (0, _languageHandler._t)("Unable to copy a link to the room to the clipboard.")
      });
    }
  }
  /**
   * Starts a chat with the welcome user, if the user doesn't already have one
   * @returns {string} The room ID of the new room, or null if no room was created
   */


  async startWelcomeUserChat() {
    // We can end up with multiple tabs post-registration where the user
    // might then end up with a session and we don't want them all making
    // a chat with the welcome user: try to de-dupe.
    // We need to wait for the first sync to complete for this to
    // work though.
    let waitFor;

    if (!this.firstSyncComplete) {
      waitFor = this.firstSyncPromise.promise;
    } else {
      waitFor = Promise.resolve();
    }

    await waitFor;
    const snakedConfig = new _SnakedObject.SnakedObject(this.props.config);

    const welcomeUserRooms = _DMRoomMap.default.shared().getDMRoomsForUserId(snakedConfig.get("welcome_user_id"));

    if (welcomeUserRooms.length === 0) {
      const roomId = await (0, _createRoom.default)({
        dmUserId: snakedConfig.get("welcome_user_id"),
        // Only view the welcome user if we're NOT looking at a room
        andView: !this.state.currentRoomId,
        spinner: false // we're already showing one: we don't need another one

      }); // This is a bit of a hack, but since the deduplication relies
      // on m.direct being up to date, we need to force a sync
      // of the database, otherwise if the user goes to the other
      // tab before the next save happens (a few minutes), the
      // saved sync will be restored from the db and this code will
      // run without the update to m.direct, making another welcome
      // user room (it doesn't wait for new data from the server, just
      // the saved sync to be loaded).

      const saveWelcomeUser = ev => {
        if (ev.getType() === _matrix.EventType.Direct && ev.getContent()[snakedConfig.get("welcome_user_id")]) {
          _MatrixClientPeg.MatrixClientPeg.get().store.save(true);

          _MatrixClientPeg.MatrixClientPeg.get().removeListener(_matrix.ClientEvent.AccountData, saveWelcomeUser);
        }
      };

      _MatrixClientPeg.MatrixClientPeg.get().on(_matrix.ClientEvent.AccountData, saveWelcomeUser);

      return roomId;
    }

    return null;
  }
  /**
   * Called when a new logged in session has started
   */


  async onLoggedIn() {
    _ThemeController.default.isLogin = false;
    this.themeWatcher.recheck();
    StorageManager.tryPersistStorage();

    if (_MatrixClientPeg.MatrixClientPeg.currentUserIsJustRegistered() && _SettingsStore.default.getValue("FTUE.useCaseSelection") === null) {
      this.setStateForNewView({
        view: _Views.default.USE_CASE_SELECTION
      }); // Listen to changes in settings and hide the use case screen if appropriate - this is necessary because
      // account settings can still be changing at this point in app init (due to the initial sync being cached,
      // then subsequent syncs being received from the server)
      //
      // This seems unlikely for something that should happen directly after registration, but if a user does
      // their initial login on another device/browser than they registered on, we want to avoid asking this
      // question twice
      //
      // initPosthogAnalyticsToast pioneered this technique, we’re just reusing it here.

      _SettingsStore.default.watchSetting("FTUE.useCaseSelection", null, (originalSettingName, changedInRoomId, atLevel, newValueAtLevel, newValue) => {
        if (newValue !== null && this.state.view === _Views.default.USE_CASE_SELECTION) {
          this.onShowPostLoginScreen();
        }
      });
    } else {
      return this.onShowPostLoginScreen();
    }
  }

  async onShowPostLoginScreen(useCase) {
    if (useCase) {
      _PosthogAnalytics.PosthogAnalytics.instance.setProperty("ftueUseCaseSelection", useCase);

      _SettingsStore.default.setValue("FTUE.useCaseSelection", null, _SettingLevel.SettingLevel.ACCOUNT, useCase);
    }

    this.setStateForNewView({
      view: _Views.default.LOGGED_IN
    }); // If a specific screen is set to be shown after login, show that above
    // all else, as it probably means the user clicked on something already.

    if (this.screenAfterLogin && this.screenAfterLogin.screen) {
      this.showScreen(this.screenAfterLogin.screen, this.screenAfterLogin.params);
      this.screenAfterLogin = null;
    } else if (_MatrixClientPeg.MatrixClientPeg.currentUserIsJustRegistered()) {
      _MatrixClientPeg.MatrixClientPeg.setJustRegisteredUserId(null);

      const snakedConfig = new _SnakedObject.SnakedObject(this.props.config);

      if (snakedConfig.get("welcome_user_id") && (0, _languageHandler.getCurrentLanguage)().startsWith("en")) {
        const welcomeUserRoom = await this.startWelcomeUserChat();

        if (welcomeUserRoom === null) {
          // We didn't redirect to the welcome user room, so show
          // the homepage.
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewHomePage,
            justRegistered: true
          });
        }
      } else if (_ThreepidInviteStore.default.instance.pickBestInvite()) {
        // The user has a 3pid invite pending - show them that
        const threepidInvite = _ThreepidInviteStore.default.instance.pickBestInvite(); // HACK: This is a pretty brutal way of threading the invite back through
        // our systems, but it's the safest we have for now.


        const params = _ThreepidInviteStore.default.instance.translateToWireFormat(threepidInvite);

        this.showScreen(`room/${threepidInvite.roomId}`, params);
      } else {
        // The user has just logged in after registering,
        // so show the homepage.
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewHomePage,
          justRegistered: true
        });
      }
    } else {
      this.showScreenAfterLogin();
    }

    if (_SdkConfig.default.get("mobile_guide_toast")) {
      // The toast contains further logic to detect mobile platforms,
      // check if it has been dismissed before, etc.
      (0, _MobileGuideToast.showToast)();
    }
  }

  initPosthogAnalyticsToast() {
    // Show the analytics toast if necessary
    if (_SettingsStore.default.getValue("pseudonymousAnalyticsOptIn") === null) {
      (0, _AnalyticsToast.showToast)();
    } // Listen to changes in settings and show the toast if appropriate - this is necessary because account
    // settings can still be changing at this point in app init (due to the initial sync being cached, then
    // subsequent syncs being received from the server)


    _SettingsStore.default.watchSetting("pseudonymousAnalyticsOptIn", null, (originalSettingName, changedInRoomId, atLevel, newValueAtLevel, newValue) => {
      if (newValue === null) {
        (0, _AnalyticsToast.showToast)();
      } else {
        // It's possible for the value to change if a cached sync loads at page load, but then network
        // sync contains a new value of the flag with it set to false (e.g. another device set it since last
        // loading the page); so hide the toast.
        // (this flipping usually happens before first render so the user won't notice it; anyway flicker
        // on/off is probably better than showing the toast again when the user already dismissed it)
        (0, _AnalyticsToast.hideToast)();
      }
    });
  }

  showScreenAfterLogin() {
    // If screenAfterLogin is set, use that, then null it so that a second login will
    // result in view_home_page, _user_settings or _room_directory
    if (this.screenAfterLogin && this.screenAfterLogin.screen) {
      this.showScreen(this.screenAfterLogin.screen, this.screenAfterLogin.params);
      this.screenAfterLogin = null;
    } else if (localStorage && localStorage.getItem('mx_last_room_id')) {
      // Before defaulting to directory, show the last viewed room
      this.viewLastRoom();
    } else {
      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        _dispatcher.default.dispatch({
          action: 'view_welcome_page'
        });
      } else {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewHomePage
        });
      }
    }
  }

  viewLastRoom() {
    _dispatcher.default.dispatch({
      action: _actions.Action.ViewRoom,
      room_id: localStorage.getItem('mx_last_room_id'),
      metricsTrigger: undefined // other

    });
  }
  /**
   * Called when the session is logged out
   */


  onLoggedOut() {
    this.viewLogin({
      ready: false,
      collapseLhs: false,
      currentRoomId: null
    });
    this.subTitleStatus = '';
    this.setPageSubtitle();
  }
  /**
   * Called when the session is softly logged out
   */


  onSoftLogout() {
    this.notifyNewScreen('soft_logout');
    this.setStateForNewView({
      view: _Views.default.SOFT_LOGOUT,
      ready: false,
      collapseLhs: false,
      currentRoomId: null
    });
    this.subTitleStatus = '';
    this.setPageSubtitle();
  }
  /**
   * Called just before the matrix client is started
   * (useful for setting listeners)
   */


  onWillStartClient() {
    // reset the 'have completed first sync' flag,
    // since we're about to start the client and therefore about
    // to do the first sync
    this.firstSyncComplete = false;
    this.firstSyncPromise = (0, _utils.defer)();

    const cli = _MatrixClientPeg.MatrixClientPeg.get(); // Allow the JS SDK to reap timeline events. This reduces the amount of
    // memory consumed as the JS SDK stores multiple distinct copies of room
    // state (each of which can be 10s of MBs) for each DISJOINT timeline. This is
    // particularly noticeable when there are lots of 'limited' /sync responses
    // such as when laptops unsleep.
    // https://github.com/vector-im/element-web/issues/3307#issuecomment-282895568


    cli.setCanResetTimelineCallback(roomId => {
      _logger.logger.log("Request to reset timeline in room ", roomId, " viewing:", this.state.currentRoomId);

      if (roomId !== this.state.currentRoomId) {
        // It is safe to remove events from rooms we are not viewing.
        return true;
      } // We are viewing the room which we want to reset. It is only safe to do
      // this if we are not scrolled up in the view. To find out, delegate to
      // the timeline panel. If the timeline panel doesn't exist, then we assume
      // it is safe to reset the timeline.


      if (!this.loggedInView.current) {
        return true;
      }

      return this.loggedInView.current.canResetTimelineInRoom(roomId);
    });
    cli.on(_matrix.ClientEvent.Sync, (state, prevState, data) => {
      if (state === _sync.SyncState.Error || state === _sync.SyncState.Reconnecting) {
        if (data.error instanceof _errors.InvalidStoreError) {
          Lifecycle.handleInvalidStoreError(data.error);
        }

        this.setState({
          syncError: data.error || {}
        });
      } else if (this.state.syncError) {
        this.setState({
          syncError: null
        });
      }

      if (state === _sync.SyncState.Syncing && prevState === _sync.SyncState.Syncing) {
        return;
      }

      _logger.logger.info("MatrixClient sync state => %s", state);

      if (state !== _sync.SyncState.Prepared) {
        return;
      }

      this.firstSyncComplete = true;
      this.firstSyncPromise.resolve();

      if (_Notifier.default.shouldShowPrompt() && !_MatrixClientPeg.MatrixClientPeg.userRegisteredWithinLastHours(24)) {
        (0, _DesktopNotificationsToast.showToast)(false);
      }

      _dispatcher.default.fire(_actions.Action.FocusSendMessageComposer);

      this.setState({
        ready: true
      });
    });
    cli.on(_matrix.HttpApiEvent.SessionLoggedOut, function (errObj) {
      if (Lifecycle.isLoggingOut()) return; // A modal might have been open when we were logged out by the server

      _Modal.default.closeCurrentModal('Session.logged_out');

      if (errObj.httpStatus === 401 && errObj.data && errObj.data['soft_logout']) {
        _logger.logger.warn("Soft logout issued by server - avoiding data deletion");

        Lifecycle.softLogout();
        return;
      }

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Signed Out'),
        description: (0, _languageHandler._t)('For security, this session has been signed out. Please sign in again.')
      });

      _dispatcher.default.dispatch({
        action: 'logout'
      });
    });
    cli.on(_matrix.HttpApiEvent.NoConsent, function (message, consentUri) {
      _Modal.default.createDialog(_QuestionDialog.default, {
        title: (0, _languageHandler._t)('Terms and Conditions'),
        description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, " ", (0, _languageHandler._t)('To continue using the %(homeserverDomain)s homeserver ' + 'you must review and agree to our terms and conditions.', {
          homeserverDomain: cli.getDomain()
        }))),
        button: (0, _languageHandler._t)('Review terms and conditions'),
        cancelButton: (0, _languageHandler._t)('Dismiss'),
        onFinished: confirmed => {
          if (confirmed) {
            const wnd = window.open(consentUri, '_blank');
            wnd.opener = null;
          }
        }
      }, null, true);
    });
    const dft = _DecryptionFailureTracker.DecryptionFailureTracker.instance; // Shelved for later date when we have time to think about persisting history of
    // tracked events across sessions.
    // dft.loadTrackedEventHashMap();

    dft.start(); // When logging out, stop tracking failures and destroy state

    cli.on(_matrix.HttpApiEvent.SessionLoggedOut, () => dft.stop());
    cli.on(_matrix.MatrixEventEvent.Decrypted, (e, err) => dft.eventDecrypted(e, err));
    cli.on(_matrix.ClientEvent.Room, room => {
      if (_MatrixClientPeg.MatrixClientPeg.get().isCryptoEnabled()) {
        const blacklistEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.ROOM_DEVICE, "blacklistUnverifiedDevices", room.roomId,
        /*explicit=*/
        true);

        room.setBlacklistUnverifiedDevices(blacklistEnabled);
      }
    });
    cli.on(_crypto.CryptoEvent.Warning, type => {
      switch (type) {
        case 'CRYPTO_WARNING_OLD_VERSION_DETECTED':
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)('Old cryptography data detected'),
            description: (0, _languageHandler._t)("Data from an older version of %(brand)s has been detected. " + "This will have caused end-to-end cryptography to malfunction " + "in the older version. End-to-end encrypted messages exchanged " + "recently whilst using the older version may not be decryptable " + "in this version. This may also cause messages exchanged with this " + "version to fail. If you experience problems, log out and back in " + "again. To retain message history, export and re-import your keys.", {
              brand: _SdkConfig.default.get().brand
            })
          });

          break;
      }
    });
    cli.on(_crypto.CryptoEvent.KeyBackupFailed, async errcode => {
      let haveNewVersion;
      let newVersionInfo; // if key backup is still enabled, there must be a new backup in place

      if (_MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled()) {
        haveNewVersion = true;
      } else {
        // otherwise check the server to see if there's a new one
        try {
          newVersionInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
          if (newVersionInfo !== null) haveNewVersion = true;
        } catch (e) {
          _logger.logger.error("Saw key backup error but failed to check backup version!", e);

          return;
        }
      }

      if (haveNewVersion) {
        _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require('../../async-components/views/dialogs/security/NewRecoveryMethodDialog'))), {
          newVersionInfo
        });
      } else {
        _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require('../../async-components/views/dialogs/security/RecoveryMethodRemovedDialog'))));
      }
    });
    cli.on(_crypto.CryptoEvent.KeySignatureUploadFailure, (failures, source, continuation) => {
      _Modal.default.createDialog(_KeySignatureUploadFailedDialog.default, {
        failures,
        source,
        continuation
      });
    });
    cli.on(_crypto.CryptoEvent.VerificationRequest, request => {
      if (request.verifier) {
        _Modal.default.createDialog(_IncomingSasDialog.default, {
          verifier: request.verifier
        }, null,
        /* priority = */
        false,
        /* static = */
        true);
      } else if (request.pending) {
        _ToastStore.default.sharedInstance().addOrReplaceToast({
          key: 'verifreq_' + request.channel.transactionId,
          title: (0, _languageHandler._t)("Verification requested"),
          icon: "verification",
          props: {
            request
          },
          component: _VerificationRequestToast.default,
          priority: 90
        });
      }
    });
  }
  /**
   * Called shortly after the matrix client has started. Useful for
   * setting up anything that requires the client to be started.
   * @private
   */


  onClientStarted() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli.isCryptoEnabled()) {
      const blacklistEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, "blacklistUnverifiedDevices");

      cli.setGlobalBlacklistUnverifiedDevices(blacklistEnabled); // With cross-signing enabled, we send to unknown devices
      // without prompting. Any bad-device status the user should
      // be aware of will be signalled through the room shield
      // changing colour. More advanced behaviour will come once
      // we implement more settings.

      cli.setGlobalErrorOnUnknownDevices(false);
    } // Cannot be done in OnLoggedIn as at that point the AccountSettingsHandler doesn't yet have a client
    // Will be moved to a pre-login flow as well


    if (_PosthogAnalytics.PosthogAnalytics.instance.isEnabled() && _SettingsStore.default.isLevelSupported(_SettingLevel.SettingLevel.ACCOUNT)) {
      this.initPosthogAnalyticsToast();
    }
  }

  showScreen(screen, params) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const isLoggedOutOrGuest = !cli || cli.isGuest();

    if (!isLoggedOutOrGuest && AUTH_SCREENS.includes(screen)) {
      // user is logged in and landing on an auth page which will uproot their session, redirect them home instead
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewHomePage
      });

      return;
    }

    if (screen === 'register') {
      _dispatcher.default.dispatch({
        action: 'start_registration',
        params: params
      });

      _performance.default.instance.start(_performance.PerformanceEntryNames.REGISTER);
    } else if (screen === 'login') {
      _dispatcher.default.dispatch({
        action: 'start_login',
        params: params
      });

      _performance.default.instance.start(_performance.PerformanceEntryNames.LOGIN);
    } else if (screen === 'forgot_password') {
      _dispatcher.default.dispatch({
        action: 'start_password_recovery',
        params: params
      });
    } else if (screen === 'soft_logout') {
      if (cli.getUserId() && !Lifecycle.isSoftLogout()) {
        // Logged in - visit a room
        this.viewLastRoom();
      } else {
        // Ultimately triggers soft_logout if needed
        _dispatcher.default.dispatch({
          action: 'start_login',
          params: params
        });
      }
    } else if (screen === 'new') {
      _dispatcher.default.dispatch({
        action: 'view_create_room'
      });
    } else if (screen === 'dm') {
      _dispatcher.default.dispatch({
        action: 'view_create_chat'
      });
    } else if (screen === 'settings') {
      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    } else if (screen === 'welcome') {
      _dispatcher.default.dispatch({
        action: 'view_welcome_page'
      });
    } else if (screen === 'home') {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewHomePage
      });
    } else if (screen === 'start') {
      this.showScreen('home');

      _dispatcher.default.dispatch({
        action: 'require_registration'
      });
    } else if (screen === 'directory') {
      _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
    } else if (screen === "start_sso" || screen === "start_cas") {
      let cli = _MatrixClientPeg.MatrixClientPeg.get();

      if (!cli) {
        const {
          hsUrl,
          isUrl
        } = this.props.serverConfig;
        cli = (0, _matrix.createClient)({
          baseUrl: hsUrl,
          idBaseUrl: isUrl
        });
      }

      const type = screen === "start_sso" ? "sso" : "cas";

      _PlatformPeg.default.get().startSingleSignOn(cli, type, this.getFragmentAfterLogin());
    } else if (screen.indexOf('room/') === 0) {
      // Rooms can have the following formats:
      // #room_alias:domain or !opaque_id:domain
      const room = screen.substring(5);
      const domainOffset = room.indexOf(':') + 1; // 0 in case room does not contain a :

      let eventOffset = room.length; // room aliases can contain slashes only look for slash after domain

      if (room.substring(domainOffset).indexOf('/') > -1) {
        eventOffset = domainOffset + room.substring(domainOffset).indexOf('/');
      }

      const roomString = room.substring(0, eventOffset);
      let eventId = room.substring(eventOffset + 1); // empty string if no event id given
      // Previously we pulled the eventID from the segments in such a way
      // where if there was no eventId then we'd get undefined. However, we
      // now do a splice and join to handle v3 event IDs which results in
      // an empty string. To maintain our potential contract with the rest
      // of the app, we coerce the eventId to be undefined where applicable.

      if (!eventId) eventId = undefined; // TODO: Handle encoded room/event IDs: https://github.com/vector-im/element-web/issues/9149

      let threepidInvite; // if we landed here from a 3PID invite, persist it

      if (params.signurl && params.email) {
        threepidInvite = _ThreepidInviteStore.default.instance.storeInvite(roomString, params);
      } // otherwise check that this room doesn't already have a known invite


      if (!threepidInvite) {
        const invites = _ThreepidInviteStore.default.instance.getInvites();

        threepidInvite = invites.find(invite => invite.roomId === roomString);
      } // on our URLs there might be a ?via=matrix.org or similar to help
      // joins to the room succeed. We'll pass these through as an array
      // to other levels. If there's just one ?via= then params.via is a
      // single string. If someone does something like ?via=one.com&via=two.com
      // then params.via is an array of strings.


      let via = [];

      if (params.via) {
        if (typeof params.via === 'string') via = [params.via];else via = params.via;
      }

      const payload = {
        action: _actions.Action.ViewRoom,
        event_id: eventId,
        via_servers: via,
        // If an event ID is given in the URL hash, notify RoomViewStore to mark
        // it as highlighted, which will propagate to RoomView and highlight the
        // associated EventTile.
        highlighted: Boolean(eventId),
        threepid_invite: threepidInvite,
        // TODO: Replace oob_data with the threepidInvite (which has the same info).
        // This isn't done yet because it's threaded through so many more places.
        // See https://github.com/vector-im/element-web/issues/15157
        oob_data: {
          name: threepidInvite?.roomName,
          avatarUrl: threepidInvite?.roomAvatarUrl,
          inviterName: threepidInvite?.inviterName
        },
        room_alias: undefined,
        room_id: undefined,
        metricsTrigger: undefined // unknown or external trigger

      };

      if (roomString[0] === '#') {
        payload.room_alias = roomString;
      } else {
        payload.room_id = roomString;
      }

      _dispatcher.default.dispatch(payload);
    } else if (screen.indexOf('user/') === 0) {
      const userId = screen.substring(5);

      _dispatcher.default.dispatch({
        action: 'view_user_info',
        userId: userId,
        subAction: params.action
      });
    } else if (screen.indexOf('group/') === 0) {
      const groupId = screen.substring(6);

      _dispatcher.default.dispatch({
        action: 'view_legacy_group',
        groupId: groupId
      });
    } else {
      _logger.logger.info("Ignoring showScreen for '%s'", screen);
    }
  }

  notifyNewScreen(screen) {
    let replaceLast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (this.props.onNewScreen) {
      this.props.onNewScreen(screen, replaceLast);
    }

    this.setPageSubtitle();
  }

  onLogoutClick(event) {
    _dispatcher.default.dispatch({
      action: 'logout'
    });

    event.stopPropagation();
    event.preventDefault();
  }

  dispatchTimelineResize() {
    _dispatcher.default.dispatch({
      action: 'timeline_resize'
    });
  }

  // returns a promise which resolves to the new MatrixClient
  onRegistered(credentials) {
    return Lifecycle.setLoggedIn(credentials);
  }

  onSendEvent(roomId, event) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (!cli) return;
    cli.sendEvent(roomId, event.getType(), event.getContent()).then(() => {
      _dispatcher.default.dispatch({
        action: 'message_sent'
      });
    });
  }

  setPageSubtitle() {
    let subtitle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    if (this.state.currentRoomId) {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const room = client && client.getRoom(this.state.currentRoomId);

      if (room) {
        subtitle = `${this.subTitleStatus} | ${room.name} ${subtitle}`;
      }
    } else {
      subtitle = `${this.subTitleStatus} ${subtitle}`;
    }

    const title = `${_SdkConfig.default.get().brand} ${subtitle}`;

    if (document.title !== title) {
      document.title = title;
    }
  }

  getFragmentAfterLogin() {
    let fragmentAfterLogin = "";
    const initialScreenAfterLogin = this.props.initialScreenAfterLogin;

    if (initialScreenAfterLogin && // XXX: workaround for https://github.com/vector-im/element-web/issues/11643 causing a login-loop
    !["welcome", "login", "register", "start_sso", "start_cas"].includes(initialScreenAfterLogin.screen)) {
      fragmentAfterLogin = `/${initialScreenAfterLogin.screen}`;
    }

    return fragmentAfterLogin;
  }

  render() {
    const fragmentAfterLogin = this.getFragmentAfterLogin();
    let view = null;

    if (this.state.view === _Views.default.LOADING) {
      view = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MatrixChat_splash"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    } else if (this.state.view === _Views.default.COMPLETE_SECURITY) {
      view = /*#__PURE__*/_react.default.createElement(_CompleteSecurity.default, {
        onFinished: this.onCompleteSecurityE2eSetupFinished
      });
    } else if (this.state.view === _Views.default.E2E_SETUP) {
      view = /*#__PURE__*/_react.default.createElement(_E2eSetup.default, {
        onFinished: this.onCompleteSecurityE2eSetupFinished,
        accountPassword: this.accountPassword,
        tokenLogin: !!this.tokenLogin
      });
    } else if (this.state.view === _Views.default.LOGGED_IN) {
      // store errors stop the client syncing and require user intervention, so we'll
      // be showing a dialog. Don't show anything else.
      const isStoreError = this.state.syncError && this.state.syncError instanceof _errors.InvalidStoreError; // `ready` and `view==LOGGED_IN` may be set before `page_type` (because the
      // latter is set via the dispatcher). If we don't yet have a `page_type`,
      // keep showing the spinner for now.

      if (this.state.ready && this.state.page_type && !isStoreError) {
        /* for now, we stuff the entirety of our props and state into the LoggedInView.
         * we should go through and figure out what we actually need to pass down, as well
         * as using something like redux to avoid having a billion bits of state kicking around.
         */
        view = /*#__PURE__*/_react.default.createElement(_LoggedInView.default, (0, _extends2.default)({}, this.props, this.state, {
          ref: this.loggedInView,
          matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
          onRegistered: this.onRegistered,
          currentRoomId: this.state.currentRoomId
        }));
      } else {
        // we think we are logged in, but are still waiting for the /sync to complete
        let errorBox;

        if (this.state.syncError && !isStoreError) {
          errorBox = /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_MatrixChat_syncError"
          }, (0, _ErrorUtils.messageForSyncError)(this.state.syncError));
        }

        view = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MatrixChat_splash"
        }, errorBox, /*#__PURE__*/_react.default.createElement(_Spinner.default, null), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MatrixChat_splashButtons"
        }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onLogoutClick
        }, (0, _languageHandler._t)('Logout'))));
      }
    } else if (this.state.view === _Views.default.WELCOME) {
      view = /*#__PURE__*/_react.default.createElement(_Welcome.default, null);
    } else if (this.state.view === _Views.default.REGISTER && _SettingsStore.default.getValue(_UIFeature.UIFeature.Registration)) {
      const email = _ThreepidInviteStore.default.instance.pickBestInvite()?.toEmail;
      view = /*#__PURE__*/_react.default.createElement(_Registration2.default, (0, _extends2.default)({
        clientSecret: this.state.register_client_secret,
        sessionId: this.state.register_session_id,
        idSid: this.state.register_id_sid,
        email: email,
        brand: this.props.config.brand,
        makeRegistrationUrl: this.makeRegistrationUrl,
        onLoggedIn: this.onRegisterFlowComplete,
        onLoginClick: this.onLoginClick,
        onServerConfigChange: this.onServerConfigChange,
        defaultDeviceDisplayName: this.props.defaultDeviceDisplayName,
        fragmentAfterLogin: fragmentAfterLogin
      }, this.getServerProperties()));
    } else if (this.state.view === _Views.default.FORGOT_PASSWORD && _SettingsStore.default.getValue(_UIFeature.UIFeature.PasswordReset)) {
      view = /*#__PURE__*/_react.default.createElement(_ForgotPassword.default, (0, _extends2.default)({
        onComplete: this.onLoginClick,
        onLoginClick: this.onLoginClick,
        onServerConfigChange: this.onServerConfigChange
      }, this.getServerProperties()));
    } else if (this.state.view === _Views.default.LOGIN) {
      const showPasswordReset = _SettingsStore.default.getValue(_UIFeature.UIFeature.PasswordReset);

      view = /*#__PURE__*/_react.default.createElement(_Login.default, (0, _extends2.default)({
        isSyncing: this.state.pendingInitialSync,
        onLoggedIn: this.onUserCompletedLoginFlow,
        onRegisterClick: this.onRegisterClick,
        fallbackHsUrl: this.getFallbackHsUrl(),
        defaultDeviceDisplayName: this.props.defaultDeviceDisplayName,
        onForgotPasswordClick: showPasswordReset ? this.onForgotPasswordClick : undefined,
        onServerConfigChange: this.onServerConfigChange,
        fragmentAfterLogin: fragmentAfterLogin,
        defaultUsername: this.props.startingFragmentQueryParams.defaultUsername
      }, this.getServerProperties()));
    } else if (this.state.view === _Views.default.SOFT_LOGOUT) {
      view = /*#__PURE__*/_react.default.createElement(_SoftLogout.default, {
        realQueryParams: this.props.realQueryParams,
        onTokenLoginCompleted: this.props.onTokenLoginCompleted,
        fragmentAfterLogin: fragmentAfterLogin
      });
    } else if (this.state.view === _Views.default.USE_CASE_SELECTION) {
      view = /*#__PURE__*/_react.default.createElement(_UseCaseSelection.UseCaseSelection, {
        onFinished: useCase => this.onShowPostLoginScreen(useCase)
      });
    } else {
      _logger.logger.error(`Unknown view ${this.state.view}`);
    }

    return /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, view);
  }

}

exports.default = MatrixChat;
(0, _defineProperty2.default)(MatrixChat, "displayName", "MatrixChat");
(0, _defineProperty2.default)(MatrixChat, "defaultProps", {
  realQueryParams: {},
  startingFragmentQueryParams: {},
  config: {},
  onTokenLoginCompleted: () => {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBVVRIX1NDUkVFTlMiLCJPTkJPQVJESU5HX0ZMT1dfU1RBUlRFUlMiLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwiTWF0cml4Q2hhdCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJ3YXJuSW5Db25zb2xlIiwidGhyb3R0bGUiLCJsYXJnZUZvbnRTaXplIiwibm9ybWFsRm9udFNpemUiLCJ3YWl0VGV4dCIsIl90Iiwic2NhbVRleHQiLCJkZXZUZXh0IiwiZ2xvYmFsIiwibXhfcmFnZV9sb2dnZXIiLCJieXBhc3NSYWdlc2hha2UiLCJwYXlsb2FkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiaXNHdWVzdCIsImluY2x1ZGVzIiwiYWN0aW9uIiwiZGlzIiwiZGlzcGF0Y2giLCJEb0FmdGVyU3luY1ByZXBhcmVkIiwiZGVmZXJyZWRfYWN0aW9uIiwiZXZlbnRfdHlwZSIsImZ1bGxVcmwiLCJldmVudF9jb250ZW50Iiwic2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJsb2NhbFN0b3JhZ2UiLCJyZW1vdmVJdGVtIiwic2V0SXRlbSIsIkxlZ2FjeUNhbGxIYW5kbGVyIiwiaW5zdGFuY2UiLCJoYW5ndXBBbGxDYWxscyIsIlByb21pc2UiLCJhbGwiLCJDYWxsU3RvcmUiLCJhY3RpdmVDYWxscyIsIm1hcCIsImNhbGwiLCJkaXNjb25uZWN0IiwiZmluYWxseSIsIkxpZmVjeWNsZSIsImxvZ291dCIsInN0YXJ0QW55UmVnaXN0cmF0aW9uRmxvdyIsImlzU29mdExvZ291dCIsIm9uU29mdExvZ291dCIsInNjcmVlbkFmdGVyTG9naW4iLCJzdGFydFJlZ2lzdHJhdGlvbiIsInBhcmFtcyIsInZpZXdMb2dpbiIsInNldFN0YXRlRm9yTmV3VmlldyIsInZpZXciLCJWaWV3cyIsIkZPUkdPVF9QQVNTV09SRCIsIm5vdGlmeU5ld1NjcmVlbiIsImNyZWF0ZVJvb20iLCJkbVVzZXJJZCIsInVzZXJfaWQiLCJsZWF2ZVJvb20iLCJyb29tX2lkIiwiZm9yZ2V0Um9vbSIsImNvcHlSb29tIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJvbkZpbmlzaGVkIiwiY29uZmlybSIsIm1vZGFsIiwiU3Bpbm5lciIsImxlYXZlIiwidGhlbiIsImNsb3NlIiwic3RhdGUiLCJjdXJyZW50Um9vbUlkIiwiVmlld0hvbWVQYWdlIiwiZXJyIiwiRXJyb3JEaWFsb2ciLCJ0b1N0cmluZyIsInZpZXdVc2VyIiwidXNlcklkIiwic3ViQWN0aW9uIiwiZXZlbnQiLCJnZXRUeXBlIiwiRXZlbnRUeXBlIiwiUm9vbUNhbm9uaWNhbEFsaWFzIiwiZ2V0Um9vbUlkIiwidmlld1Jvb20iLCJWaWV3Um9vbSIsIm1ldHJpY3NUcmlnZ2VyIiwidW5kZWZpbmVkIiwicHJvbWlzZSIsInZpZXdMZWdhY3lHcm91cCIsImdyb3VwSWQiLCJ0YWJQYXlsb2FkIiwiVXNlclNldHRpbmdzRGlhbG9nIiwiaW5pdGlhbFRhYklkIiwidmlld1NvbWV0aGluZ0JlaGluZE1vZGFsIiwicHVibGljIiwiZGVmYXVsdE5hbWUiLCJ0eXBlIiwiVmlld1Jvb21EaXJlY3RvcnkiLCJSb29tRGlyZWN0b3J5IiwiaW5pdGlhbFRleHQiLCJ2aWV3V2VsY29tZSIsInZpZXdIb21lIiwianVzdFJlZ2lzdGVyZWQiLCJWaWV3U3RhcnRDaGF0T3JSZXVzZSIsImNoYXRDcmVhdGVPclJldXNlIiwic2hvd1N0YXJ0Q2hhdEludml0ZURpYWxvZyIsInJvb20iLCJnZXRSb29tIiwicm9vbUlkIiwiaXNTcGFjZVJvb20iLCJzaG93U3BhY2VJbnZpdGUiLCJzaG93Um9vbUludml0ZURpYWxvZyIsInNob3dTY3JlZW5BZnRlckxvZ2luIiwic2V0U3RhdGUiLCJjb2xsYXBzZUxocyIsInJlc2l6ZU5vdGlmaWVyIiwibm90aWZ5TGVmdEhhbmRsZVJlc2l6ZWQiLCJPcGVuRGlhbFBhZCIsIkRpYWxQYWRNb2RhbCIsIk9uTG9nZ2VkSW4iLCJ0b2tlbkxvZ2luIiwiTE9HSU4iLCJSRUdJU1RFUiIsIkNPTVBMRVRFX1NFQ1VSSVRZIiwiRTJFX1NFVFVQIiwiVVNFX0NBU0VfU0VMRUNUSU9OIiwib25Mb2dnZWRJbiIsIk9uTG9nZ2VkT3V0Iiwib25Mb2dnZWRPdXQiLCJyZWFkeSIsIm9uV2lsbFN0YXJ0Q2xpZW50Iiwib25DbGllbnRTdGFydGVkIiwib25TZW5kRXZlbnQiLCJoaWRlVG9TUlVzZXJzIiwiUHNldWRvbnltb3VzQW5hbHl0aWNzQWNjZXB0IiwiaGlkZUFuYWx5dGljc1RvYXN0IiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiQUNDT1VOVCIsIlBzZXVkb255bW91c0FuYWx5dGljc1JlamVjdCIsIlNob3dUaHJlYWQiLCJyb290RXZlbnQiLCJpbml0aWFsRXZlbnQiLCJoaWdobGlnaHRlZCIsInNjcm9sbEludG9WaWV3IiwicHVzaCIsInRocmVhZFZpZXdDYXJkIiwicGhhc2UiLCJSaWdodFBhbmVsUGhhc2VzIiwiVGhyZWFkVmlldyIsInRocmVhZEhlYWRFdmVudCIsImlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQiLCJpbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldyIsIlJpZ2h0UGFuZWxTdG9yZSIsInB1c2hDYXJkIiwic2V0Q2FyZHMiLCJUaHJlYWRQYW5lbCIsIkZvY3VzU2VuZE1lc3NhZ2VDb21wb3NlciIsImNvbnRleHQiLCJUaW1lbGluZVJlbmRlcmluZ1R5cGUiLCJUaHJlYWQiLCJMSFNfVEhSRVNIT0xEIiwid2lkdGgiLCJVSVN0b3JlIiwid2luZG93V2lkdGgiLCJwcmV2V2luZG93V2lkdGgiLCJub3RpZnlXaW5kb3dSZXNpemVkIiwic2hvd1NjcmVlbiIsImNyZWRlbnRpYWxzIiwicGFzc3dvcmQiLCJvblVzZXJDb21wbGV0ZWRMb2dpbkZsb3ciLCJub3RpZmljYXRpb25TdGF0ZSIsIm51bVVucmVhZFJvb21zIiwibnVtVW5yZWFkU3RhdGVzIiwiUGxhdGZvcm1QZWciLCJzZXRFcnJvclN0YXR1cyIsIlN5bmNTdGF0ZSIsIkVycm9yIiwic2V0Tm90aWZpY2F0aW9uQ291bnQiLCJzdWJUaXRsZVN0YXR1cyIsInNldFBhZ2VTdWJ0aXRsZSIsInNlcnZlckNvbmZpZyIsInN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcyIsInJlZmVycmVyIiwibWFrZVJlZ2lzdHJhdGlvblVybCIsImFjY291bnRQYXNzd29yZCIsImFjY291bnRQYXNzd29yZFRpbWVyIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsInNldExvZ2dlZEluIiwicG9zdExvZ2luU2V0dXAiLCJQZXJmb3JtYW5jZU1vbml0b3IiLCJzdG9wIiwiUGVyZm9ybWFuY2VFbnRyeU5hbWVzIiwiTE9BRElORyIsInN5bmNFcnJvciIsIlJlc2l6ZU5vdGlmaWVyIiwibG9nZ2VkSW5WaWV3IiwiY3JlYXRlUmVmIiwiU2RrQ29uZmlnIiwicHV0IiwiY29uZmlnIiwiZmlyc3RTeW5jQ29tcGxldGUiLCJmaXJzdFN5bmNQcm9taXNlIiwiZGVmZXIiLCJzeW5jX3RpbWVsaW5lX2xpbWl0Iiwib3B0cyIsImluaXRpYWxTeW5jTGltaXQiLCJpbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbiIsInNjcmVlbiIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJsZW5ndGgiLCJUaHJlZXBpZEludml0ZVN0b3JlIiwic3RvcmVJbnZpdGUiLCJvbiIsIlVJX0VWRU5UUyIsIlJlc2l6ZSIsImhhbmRsZVJlc2l6ZSIsImRpc3BhdGNoVGltZWxpbmVSZXNpemUiLCJSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSIsIlVQREFURV9TVEFUVVNfSU5ESUNBVE9SIiwib25VcGRhdGVTdGF0dXNJbmRpY2F0b3IiLCJsb2FkU2Vzc2lvbiIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwidGhlbWVXYXRjaGVyIiwiVGhlbWVXYXRjaGVyIiwiZm9udFdhdGNoZXIiLCJGb250V2F0Y2hlciIsInN0YXJ0IiwiZm9jdXNDb21wb3NlciIsImF0dGVtcHRUb2tlbkxvZ2luIiwicmVhbFF1ZXJ5UGFyYW1zIiwiZGVmYXVsdERldmljZURpc3BsYXlOYW1lIiwiZ2V0RnJhZ21lbnRBZnRlckxvZ2luIiwibG9nZ2VkSW4iLCJsb2dpblRva2VuIiwib25Ub2tlbkxvZ2luQ29tcGxldGVkIiwicmVzdG9yZUZyb21Mb2NhbFN0b3JhZ2UiLCJpZ25vcmVHdWVzdCIsImZpcnN0U2NyZWVuIiwiaW5pdFNlbnRyeSIsImNsaSIsImNyeXB0b0VuYWJsZWQiLCJpc0NyeXB0b0VuYWJsZWQiLCJwcm9taXNlc0xpc3QiLCJkb3dubG9hZEtleXMiLCJnZXRVc2VySWQiLCJwZW5kaW5nSW5pdGlhbFN5bmMiLCJjcm9zc1NpZ25pbmdJc1NldFVwIiwiZ2V0U3RvcmVkQ3Jvc3NTaWduaW5nRm9yVXNlciIsIlNlY3VyaXR5Q3VzdG9taXNhdGlvbnMiLCJTSE9XX0VOQ1JZUFRJT05fU0VUVVBfVUkiLCJkb2VzU2VydmVyU3VwcG9ydFVuc3RhYmxlRmVhdHVyZSIsIlVOU0FGRV9jb21wb25lbnRXaWxsVXBkYXRlIiwic2hvdWxkVHJhY2tQYWdlQ2hhbmdlIiwic3RhcnRQYWdlQ2hhbmdlVGltZXIiLCJjb21wb25lbnREaWRNb3VudCIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbldpbmRvd1Jlc2l6ZWQiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJwcmV2U3RhdGUiLCJkdXJhdGlvbk1zIiwic3RvcFBhZ2VDaGFuZ2VUaW1lciIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrUGFnZUNoYW5nZSIsInBhZ2VfdHlwZSIsImZpcmUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInN0b3BNYXRyaXhDbGllbnQiLCJ1bnJlZ2lzdGVyIiwiZGVzdHJveSIsInJlbW92ZUxpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImdldEZhbGxiYWNrSHNVcmwiLCJpc0RlZmF1bHQiLCJmYWxsYmFja19oc191cmwiLCJnZXRTZXJ2ZXJQcm9wZXJ0aWVzIiwicmVzb2x2ZSIsImZyYWdtZW50UXVlcnlQYXJhbXMiLCJlbmFibGVHdWVzdCIsImd1ZXN0SHNVcmwiLCJoc1VybCIsImd1ZXN0SXNVcmwiLCJpc1VybCIsImxvYWRlZFNlc3Npb24iLCJwaWNrQmVzdEludml0ZSIsIlBBR0VfQ0hBTkdFIiwicGVyZk1vbml0b3IiLCJlbnRyaWVzIiwiZ2V0RW50cmllcyIsIm5hbWUiLCJtZWFzdXJlbWVudCIsInBvcCIsImR1cmF0aW9uIiwibmV3U3RhdGUiLCJjdXJyZW50VXNlcklkIiwiT2JqZWN0IiwiYXNzaWduIiwic2V0UGFnZSIsInBhZ2VUeXBlIiwiY2xpZW50X3NlY3JldCIsInNlc3Npb25faWQiLCJoc191cmwiLCJpc191cmwiLCJzaWQiLCJBdXRvRGlzY292ZXJ5VXRpbHMiLCJ2YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzIiwiZGVmYXVsdENvbmZpZyIsImhzTmFtZSIsImhzTmFtZUlzRGlmZmVyZW50IiwiaXNOYW1lUmVzb2x2YWJsZSIsInJlZ2lzdGVyX2NsaWVudF9zZWNyZXQiLCJyZWdpc3Rlcl9zZXNzaW9uX2lkIiwicmVnaXN0ZXJfaWRfc2lkIiwiVGhlbWVDb250cm9sbGVyIiwiaXNMb2dpbiIsInJlY2hlY2siLCJyb29tSW5mbyIsInJvb21fYWxpYXMiLCJsb2dnZXIiLCJsb2ciLCJldmVudF9pZCIsIndhcm4iLCJwcmVzZW50ZWRJZCIsImRlY3J5cHRBbGxFdmVudHMiLCJ0aGVBbGlhcyIsIlJvb21zIiwiZ2V0RGlzcGxheUFsaWFzRm9yUm9vbSIsInN0b3JlUm9vbUFsaWFzSW5DYWNoZSIsInJlcGxhY2VMYXN0IiwiaXNMb2NhbFJvb20iLCJ0aHJlZXBpZF9pbnZpdGUiLCJ0aHJlZXBpZEludml0ZSIsIm9vYl9kYXRhIiwicm9vbU9vYkRhdGEiLCJmb3JjZVRpbWVsaW5lIiwianVzdENyZWF0ZWRPcHRzIiwicm9vbUp1c3RDcmVhdGVkT3B0cyIsIkxPR0dFRF9JTiIsIlBhZ2VUeXBlIiwiUm9vbVZpZXciLCJzaG91bGRVc2VMb2dpbkZvcldlbGNvbWUiLCJXRUxDT01FIiwib3RoZXJTdGF0ZSIsIkhvbWVQYWdlIiwid2FpdEZvclN5bmMiLCJVc2VyVmlldyIsImN1cnJlbnRHcm91cElkIiwiTGVnYWN5R3JvdXBWaWV3IiwiZGVmYXVsdFB1YmxpYyIsIkNyZWF0ZVJvb21EaWFsb2ciLCJzaG91bGRDcmVhdGUiLCJmaW5pc2hlZCIsInNuYWtlZENvbmZpZyIsIlNuYWtlZE9iamVjdCIsImdvX3dlbGNvbWVfb25fY2FuY2VsIiwic2NyZWVuX2FmdGVyIiwiY2xpZW50IiwiZG1Sb29tTWFwIiwiRE1Sb29tTWFwIiwiZG1Sb29tcyIsImdldERNUm9vbXNGb3JVc2VySWQiLCJsZWF2ZVJvb21XYXJuaW5ncyIsInJvb21Ub0xlYXZlIiwiaXNTcGFjZSIsIndhcm5pbmdzIiwibWVtYmVyQ291bnQiLCJjdXJyZW50U3RhdGUiLCJnZXRKb2luZWRNZW1iZXJDb3VudCIsImpvaW5SdWxlcyIsImdldFN0YXRlRXZlbnRzIiwicnVsZSIsImdldENvbnRlbnQiLCJqb2luX3J1bGUiLCJzcGFjZU5hbWUiLCJyb29tTmFtZSIsImJ1dHRvbiIsInNob3VsZExlYXZlIiwibGVhdmVSb29tQmVoYXZpb3VyIiwiQWZ0ZXJMZWF2ZVJvb20iLCJmb3JnZXQiLCJSb29tTGlzdFN0b3JlIiwibWFudWFsUm9vbVVwZGF0ZSIsIlJvb21VcGRhdGVDYXVzZSIsIlJvb21SZW1vdmVkIiwiY2F0Y2giLCJlcnJDb2RlIiwiZXJyY29kZSIsIl90ZCIsIm1lc3NhZ2UiLCJyb29tTGluayIsIm1ha2VSb29tUGVybWFsaW5rIiwic3VjY2VzcyIsImNvcHlQbGFpbnRleHQiLCJzdGFydFdlbGNvbWVVc2VyQ2hhdCIsIndhaXRGb3IiLCJ3ZWxjb21lVXNlclJvb21zIiwic2hhcmVkIiwiYW5kVmlldyIsInNwaW5uZXIiLCJzYXZlV2VsY29tZVVzZXIiLCJldiIsIkRpcmVjdCIsInN0b3JlIiwic2F2ZSIsIkNsaWVudEV2ZW50IiwiQWNjb3VudERhdGEiLCJTdG9yYWdlTWFuYWdlciIsInRyeVBlcnNpc3RTdG9yYWdlIiwiY3VycmVudFVzZXJJc0p1c3RSZWdpc3RlcmVkIiwiZ2V0VmFsdWUiLCJ3YXRjaFNldHRpbmciLCJvcmlnaW5hbFNldHRpbmdOYW1lIiwiY2hhbmdlZEluUm9vbUlkIiwiYXRMZXZlbCIsIm5ld1ZhbHVlQXRMZXZlbCIsIm5ld1ZhbHVlIiwib25TaG93UG9zdExvZ2luU2NyZWVuIiwidXNlQ2FzZSIsIlBvc3Rob2dBbmFseXRpY3MiLCJzZXRQcm9wZXJ0eSIsInNldEp1c3RSZWdpc3RlcmVkVXNlcklkIiwiZ2V0Q3VycmVudExhbmd1YWdlIiwid2VsY29tZVVzZXJSb29tIiwidHJhbnNsYXRlVG9XaXJlRm9ybWF0Iiwic2hvd01vYmlsZUd1aWRlVG9hc3QiLCJpbml0UG9zdGhvZ0FuYWx5dGljc1RvYXN0Iiwic2hvd0FuYWx5dGljc1RvYXN0IiwiZ2V0SXRlbSIsInZpZXdMYXN0Um9vbSIsIlNPRlRfTE9HT1VUIiwic2V0Q2FuUmVzZXRUaW1lbGluZUNhbGxiYWNrIiwiY3VycmVudCIsImNhblJlc2V0VGltZWxpbmVJblJvb20iLCJTeW5jIiwiZGF0YSIsIlJlY29ubmVjdGluZyIsImVycm9yIiwiSW52YWxpZFN0b3JlRXJyb3IiLCJoYW5kbGVJbnZhbGlkU3RvcmVFcnJvciIsIlN5bmNpbmciLCJpbmZvIiwiUHJlcGFyZWQiLCJOb3RpZmllciIsInNob3VsZFNob3dQcm9tcHQiLCJ1c2VyUmVnaXN0ZXJlZFdpdGhpbkxhc3RIb3VycyIsInNob3dOb3RpZmljYXRpb25zVG9hc3QiLCJIdHRwQXBpRXZlbnQiLCJTZXNzaW9uTG9nZ2VkT3V0IiwiZXJyT2JqIiwiaXNMb2dnaW5nT3V0IiwiY2xvc2VDdXJyZW50TW9kYWwiLCJodHRwU3RhdHVzIiwic29mdExvZ291dCIsIk5vQ29uc2VudCIsImNvbnNlbnRVcmkiLCJob21lc2VydmVyRG9tYWluIiwiZ2V0RG9tYWluIiwiY2FuY2VsQnV0dG9uIiwiY29uZmlybWVkIiwid25kIiwib3BlbiIsIm9wZW5lciIsImRmdCIsIkRlY3J5cHRpb25GYWlsdXJlVHJhY2tlciIsIk1hdHJpeEV2ZW50RXZlbnQiLCJEZWNyeXB0ZWQiLCJlIiwiZXZlbnREZWNyeXB0ZWQiLCJSb29tIiwiYmxhY2tsaXN0RW5hYmxlZCIsImdldFZhbHVlQXQiLCJST09NX0RFVklDRSIsInNldEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzIiwiQ3J5cHRvRXZlbnQiLCJXYXJuaW5nIiwiYnJhbmQiLCJLZXlCYWNrdXBGYWlsZWQiLCJoYXZlTmV3VmVyc2lvbiIsIm5ld1ZlcnNpb25JbmZvIiwiZ2V0S2V5QmFja3VwRW5hYmxlZCIsImdldEtleUJhY2t1cFZlcnNpb24iLCJjcmVhdGVEaWFsb2dBc3luYyIsIktleVNpZ25hdHVyZVVwbG9hZEZhaWx1cmUiLCJmYWlsdXJlcyIsInNvdXJjZSIsImNvbnRpbnVhdGlvbiIsIktleVNpZ25hdHVyZVVwbG9hZEZhaWxlZERpYWxvZyIsIlZlcmlmaWNhdGlvblJlcXVlc3QiLCJyZXF1ZXN0IiwidmVyaWZpZXIiLCJJbmNvbWluZ1Nhc0RpYWxvZyIsInBlbmRpbmciLCJUb2FzdFN0b3JlIiwic2hhcmVkSW5zdGFuY2UiLCJhZGRPclJlcGxhY2VUb2FzdCIsImtleSIsImNoYW5uZWwiLCJ0cmFuc2FjdGlvbklkIiwiaWNvbiIsImNvbXBvbmVudCIsIlZlcmlmaWNhdGlvblJlcXVlc3RUb2FzdCIsInByaW9yaXR5IiwiREVWSUNFIiwic2V0R2xvYmFsQmxhY2tsaXN0VW52ZXJpZmllZERldmljZXMiLCJzZXRHbG9iYWxFcnJvck9uVW5rbm93bkRldmljZXMiLCJpc0VuYWJsZWQiLCJpc0xldmVsU3VwcG9ydGVkIiwiaXNMb2dnZWRPdXRPckd1ZXN0IiwiY3JlYXRlQ2xpZW50IiwiYmFzZVVybCIsImlkQmFzZVVybCIsInN0YXJ0U2luZ2xlU2lnbk9uIiwiaW5kZXhPZiIsImRvbWFpbk9mZnNldCIsImV2ZW50T2Zmc2V0Iiwicm9vbVN0cmluZyIsImV2ZW50SWQiLCJzaWdudXJsIiwiZW1haWwiLCJpbnZpdGVzIiwiZ2V0SW52aXRlcyIsImZpbmQiLCJpbnZpdGUiLCJ2aWEiLCJ2aWFfc2VydmVycyIsIkJvb2xlYW4iLCJhdmF0YXJVcmwiLCJyb29tQXZhdGFyVXJsIiwiaW52aXRlck5hbWUiLCJvbk5ld1NjcmVlbiIsIm9uTG9nb3V0Q2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIm9uUmVnaXN0ZXJlZCIsInNlbmRFdmVudCIsInN1YnRpdGxlIiwiZG9jdW1lbnQiLCJmcmFnbWVudEFmdGVyTG9naW4iLCJyZW5kZXIiLCJvbkNvbXBsZXRlU2VjdXJpdHlFMmVTZXR1cEZpbmlzaGVkIiwiaXNTdG9yZUVycm9yIiwiZXJyb3JCb3giLCJtZXNzYWdlRm9yU3luY0Vycm9yIiwiVUlGZWF0dXJlIiwiUmVnaXN0cmF0aW9uIiwidG9FbWFpbCIsIm9uUmVnaXN0ZXJGbG93Q29tcGxldGUiLCJvbkxvZ2luQ2xpY2siLCJvblNlcnZlckNvbmZpZ0NoYW5nZSIsIlBhc3N3b3JkUmVzZXQiLCJzaG93UGFzc3dvcmRSZXNldCIsIm9uUmVnaXN0ZXJDbGljayIsIm9uRm9yZ290UGFzc3dvcmRDbGljayIsImRlZmF1bHRVc2VybmFtZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTWF0cml4Q2hhdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50VHlwZSwgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtcbiAgICBDbGllbnRFdmVudCxcbiAgICBjcmVhdGVDbGllbnQsXG4gICAgRXZlbnRUeXBlLFxuICAgIEh0dHBBcGlFdmVudCxcbiAgICBNYXRyaXhDbGllbnQsXG4gICAgTWF0cml4RXZlbnRFdmVudCxcbn0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcbmltcG9ydCB7IElTeW5jU3RhdGVEYXRhLCBTeW5jU3RhdGUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9zeW5jJztcbmltcG9ydCB7IE1hdHJpeEVycm9yIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvaHR0cC1hcGknO1xuaW1wb3J0IHsgSW52YWxpZFN0b3JlRXJyb3IgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvZXJyb3JzXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IGRlZmVyLCBJRGVmZXJyZWQsIFF1ZXJ5RGljdCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy91dGlsc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgdGhyb3R0bGUgfSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBDcnlwdG9FdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG9cIjtcbmltcG9ydCB7IFJvb21UeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgRGVjcnlwdGlvbkVycm9yIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2FsZ29yaXRobXMnO1xuXG4vLyBmb2N1cy12aXNpYmxlIGlzIGEgUG9seWZpbGwgZm9yIHRoZSA6Zm9jdXMtdmlzaWJsZSBDU1MgcHNldWRvLWF0dHJpYnV0ZSB1c2VkIGJ5IHZhcmlvdXMgY29tcG9uZW50c1xuaW1wb3J0ICdmb2N1cy12aXNpYmxlJztcbi8vIHdoYXQtaW5wdXQgaGVscHMgaW1wcm92ZSBrZXlib2FyZCBhY2Nlc3NpYmlsaXR5XG5pbXBvcnQgJ3doYXQtaW5wdXQnO1xuXG5pbXBvcnQgUG9zdGhvZ1RyYWNrZXJzIGZyb20gJy4uLy4uL1Bvc3Rob2dUcmFja2Vycyc7XG5pbXBvcnQgeyBEZWNyeXB0aW9uRmFpbHVyZVRyYWNrZXIgfSBmcm9tIFwiLi4vLi4vRGVjcnlwdGlvbkZhaWx1cmVUcmFja2VyXCI7XG5pbXBvcnQgeyBJTWF0cml4Q2xpZW50Q3JlZHMsIE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi4vLi4vUGxhdGZvcm1QZWdcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgTm90aWZpZXIgZnJvbSAnLi4vLi4vTm90aWZpZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IHsgc2hvd1Jvb21JbnZpdGVEaWFsb2csIHNob3dTdGFydENoYXRJbnZpdGVEaWFsb2cgfSBmcm9tICcuLi8uLi9Sb29tSW52aXRlJztcbmltcG9ydCAqIGFzIFJvb21zIGZyb20gJy4uLy4uL1Jvb21zJztcbmltcG9ydCAqIGFzIExpZmVjeWNsZSBmcm9tICcuLi8uLi9MaWZlY3ljbGUnO1xuLy8gTGlmZWN5Y2xlU3RvcmUgaXMgbm90IHVzZWQgYnV0IGRvZXMgbGlzdGVuIHRvIGFuZCBkaXNwYXRjaCBhY3Rpb25zXG5pbXBvcnQgJy4uLy4uL3N0b3Jlcy9MaWZlY3ljbGVTdG9yZSc7XG5pbXBvcnQgJy4uLy4uL3N0b3Jlcy9BdXRvUmFnZXNoYWtlU3RvcmUnO1xuaW1wb3J0IFBhZ2VUeXBlIGZyb20gJy4uLy4uL1BhZ2VUeXBlcyc7XG5pbXBvcnQgY3JlYXRlUm9vbSwgeyBJT3B0cyB9IGZyb20gXCIuLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQgeyBfdCwgX3RkLCBnZXRDdXJyZW50TGFuZ3VhZ2UgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBUaGVtZUNvbnRyb2xsZXIgZnJvbSBcIi4uLy4uL3NldHRpbmdzL2NvbnRyb2xsZXJzL1RoZW1lQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgc3RhcnRBbnlSZWdpc3RyYXRpb25GbG93IH0gZnJvbSBcIi4uLy4uL1JlZ2lzdHJhdGlvblwiO1xuaW1wb3J0IHsgbWVzc2FnZUZvclN5bmNFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL0Vycm9yVXRpbHMnO1xuaW1wb3J0IFJlc2l6ZU5vdGlmaWVyIGZyb20gXCIuLi8uLi91dGlscy9SZXNpemVOb3RpZmllclwiO1xuaW1wb3J0IEF1dG9EaXNjb3ZlcnlVdGlscyBmcm9tIFwiLi4vLi4vdXRpbHMvQXV0b0Rpc2NvdmVyeVV0aWxzXCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gJy4uLy4uL3V0aWxzL0RNUm9vbU1hcCc7XG5pbXBvcnQgVGhlbWVXYXRjaGVyIGZyb20gXCIuLi8uLi9zZXR0aW5ncy93YXRjaGVycy9UaGVtZVdhdGNoZXJcIjtcbmltcG9ydCB7IEZvbnRXYXRjaGVyIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3Mvd2F0Y2hlcnMvRm9udFdhdGNoZXInO1xuaW1wb3J0IHsgc3RvcmVSb29tQWxpYXNJbkNhY2hlIH0gZnJvbSAnLi4vLi4vUm9vbUFsaWFzQ2FjaGUnO1xuaW1wb3J0IFRvYXN0U3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9Ub2FzdFN0b3JlXCI7XG5pbXBvcnQgKiBhcyBTdG9yYWdlTWFuYWdlciBmcm9tIFwiLi4vLi4vdXRpbHMvU3RvcmFnZU1hbmFnZXJcIjtcbmltcG9ydCB7IFVzZUNhc2UgfSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvZW51bXMvVXNlQ2FzZVwiO1xuaW1wb3J0IHR5cGUgTG9nZ2VkSW5WaWV3VHlwZSBmcm9tIFwiLi9Mb2dnZWRJblZpZXdcIjtcbmltcG9ydCBMb2dnZWRJblZpZXcgZnJvbSAnLi9Mb2dnZWRJblZpZXcnO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHtcbiAgICBoaWRlVG9hc3QgYXMgaGlkZUFuYWx5dGljc1RvYXN0LFxuICAgIHNob3dUb2FzdCBhcyBzaG93QW5hbHl0aWNzVG9hc3QsXG59IGZyb20gXCIuLi8uLi90b2FzdHMvQW5hbHl0aWNzVG9hc3RcIjtcbmltcG9ydCB7IHNob3dUb2FzdCBhcyBzaG93Tm90aWZpY2F0aW9uc1RvYXN0IH0gZnJvbSBcIi4uLy4uL3RvYXN0cy9EZXNrdG9wTm90aWZpY2F0aW9uc1RvYXN0XCI7XG5pbXBvcnQgeyBPcGVuVG9UYWJQYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvT3BlblRvVGFiUGF5bG9hZFwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQge1xuICAgIFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLFxuICAgIFVQREFURV9TVEFUVVNfSU5ESUNBVE9SLFxufSBmcm9tIFwiLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmVcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBUaHJlZXBpZEludml0ZVN0b3JlLCB7IElUaHJlZXBpZEludml0ZSwgSVRocmVlcGlkSW52aXRlV2lyZUZvcm1hdCB9IGZyb20gXCIuLi8uLi9zdG9yZXMvVGhyZWVwaWRJbnZpdGVTdG9yZVwiO1xuaW1wb3J0IHsgVUlGZWF0dXJlIH0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IERpYWxQYWRNb2RhbCBmcm9tIFwiLi4vdmlld3Mvdm9pcC9EaWFsUGFkTW9kYWxcIjtcbmltcG9ydCB7IHNob3dUb2FzdCBhcyBzaG93TW9iaWxlR3VpZGVUb2FzdCB9IGZyb20gJy4uLy4uL3RvYXN0cy9Nb2JpbGVHdWlkZVRvYXN0JztcbmltcG9ydCB7IHNob3VsZFVzZUxvZ2luRm9yV2VsY29tZSB9IGZyb20gXCIuLi8uLi91dGlscy9wYWdlc1wiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHsgUm9vbVVwZGF0ZUNhdXNlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgU2VjdXJpdHlDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi4vLi4vY3VzdG9taXNhdGlvbnMvU2VjdXJpdHlcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4uL3ZpZXdzL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBVc2VyU2V0dGluZ3NEaWFsb2cgZnJvbSAnLi4vdmlld3MvZGlhbG9ncy9Vc2VyU2V0dGluZ3NEaWFsb2cnO1xuaW1wb3J0IENyZWF0ZVJvb21EaWFsb2cgZnJvbSAnLi4vdmlld3MvZGlhbG9ncy9DcmVhdGVSb29tRGlhbG9nJztcbmltcG9ydCBSb29tRGlyZWN0b3J5IGZyb20gJy4vUm9vbURpcmVjdG9yeSc7XG5pbXBvcnQgS2V5U2lnbmF0dXJlVXBsb2FkRmFpbGVkRGlhbG9nIGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0tleVNpZ25hdHVyZVVwbG9hZEZhaWxlZERpYWxvZ1wiO1xuaW1wb3J0IEluY29taW5nU2FzRGlhbG9nIGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0luY29taW5nU2FzRGlhbG9nXCI7XG5pbXBvcnQgQ29tcGxldGVTZWN1cml0eSBmcm9tIFwiLi9hdXRoL0NvbXBsZXRlU2VjdXJpdHlcIjtcbmltcG9ydCBXZWxjb21lIGZyb20gXCIuLi92aWV3cy9hdXRoL1dlbGNvbWVcIjtcbmltcG9ydCBGb3Jnb3RQYXNzd29yZCBmcm9tIFwiLi9hdXRoL0ZvcmdvdFBhc3N3b3JkXCI7XG5pbXBvcnQgRTJlU2V0dXAgZnJvbSBcIi4vYXV0aC9FMmVTZXR1cFwiO1xuaW1wb3J0IFJlZ2lzdHJhdGlvbiBmcm9tICcuL2F1dGgvUmVnaXN0cmF0aW9uJztcbmltcG9ydCBMb2dpbiBmcm9tIFwiLi9hdXRoL0xvZ2luXCI7XG5pbXBvcnQgRXJyb3JCb3VuZGFyeSBmcm9tICcuLi92aWV3cy9lbGVtZW50cy9FcnJvckJvdW5kYXJ5JztcbmltcG9ydCBWZXJpZmljYXRpb25SZXF1ZXN0VG9hc3QgZnJvbSAnLi4vdmlld3MvdG9hc3RzL1ZlcmlmaWNhdGlvblJlcXVlc3RUb2FzdCc7XG5pbXBvcnQgUGVyZm9ybWFuY2VNb25pdG9yLCB7IFBlcmZvcm1hbmNlRW50cnlOYW1lcyB9IGZyb20gXCIuLi8uLi9wZXJmb3JtYW5jZVwiO1xuaW1wb3J0IFVJU3RvcmUsIHsgVUlfRVZFTlRTIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9VSVN0b3JlXCI7XG5pbXBvcnQgU29mdExvZ291dCBmcm9tICcuL2F1dGgvU29mdExvZ291dCc7XG5pbXBvcnQgeyBtYWtlUm9vbVBlcm1hbGluayB9IGZyb20gXCIuLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7IGNvcHlQbGFpbnRleHQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc3RyaW5nc1wiO1xuaW1wb3J0IHsgUG9zdGhvZ0FuYWx5dGljcyB9IGZyb20gJy4uLy4uL1Bvc3Rob2dBbmFseXRpY3MnO1xuaW1wb3J0IHsgaW5pdFNlbnRyeSB9IGZyb20gXCIuLi8uLi9zZW50cnlcIjtcbmltcG9ydCBMZWdhY3lDYWxsSGFuZGxlciBmcm9tIFwiLi4vLi4vTGVnYWN5Q2FsbEhhbmRsZXJcIjtcbmltcG9ydCB7IHNob3dTcGFjZUludml0ZSB9IGZyb20gXCIuLi8uLi91dGlscy9zcGFjZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgU3VtbWFyaXplZE5vdGlmaWNhdGlvblN0YXRlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1N1bW1hcml6ZWROb3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IFZpZXdzIGZyb20gJy4uLy4uL1ZpZXdzJztcbmltcG9ydCB7IFZpZXdSb29tUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuaW1wb3J0IHsgVmlld0hvbWVQYWdlUGF5bG9hZCB9IGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld0hvbWVQYWdlUGF5bG9hZCc7XG5pbXBvcnQgeyBBZnRlckxlYXZlUm9vbVBheWxvYWQgfSBmcm9tICcuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL0FmdGVyTGVhdmVSb29tUGF5bG9hZCc7XG5pbXBvcnQgeyBEb0FmdGVyU3luY1ByZXBhcmVkUGF5bG9hZCB9IGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvRG9BZnRlclN5bmNQcmVwYXJlZFBheWxvYWQnO1xuaW1wb3J0IHsgVmlld1N0YXJ0Q2hhdE9yUmV1c2VQYXlsb2FkIH0gZnJvbSAnLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3U3RhcnRDaGF0T3JSZXVzZVBheWxvYWQnO1xuaW1wb3J0IHsgSUNvbmZpZ09wdGlvbnMgfSBmcm9tIFwiLi4vLi4vSUNvbmZpZ09wdGlvbnNcIjtcbmltcG9ydCB7IFNuYWtlZE9iamVjdCB9IGZyb20gXCIuLi8uLi91dGlscy9TbmFrZWRPYmplY3RcIjtcbmltcG9ydCB7IGxlYXZlUm9vbUJlaGF2aW91ciB9IGZyb20gXCIuLi8uLi91dGlscy9sZWF2ZS1iZWhhdmlvdXJcIjtcbmltcG9ydCB7IENhbGxTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvQ2FsbFN0b3JlXCI7XG5pbXBvcnQgeyBJUm9vbVN0YXRlRXZlbnRzQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9hY3Rpb25zL01hdHJpeEFjdGlvbkNyZWF0b3JzXCI7XG5pbXBvcnQgeyBTaG93VGhyZWFkUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1Nob3dUaHJlYWRQYXlsb2FkXCI7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcbmltcG9ydCBSaWdodFBhbmVsU3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVcIjtcbmltcG9ydCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gXCIuLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IHsgVXNlQ2FzZVNlbGVjdGlvbiB9IGZyb20gJy4uL3ZpZXdzL2VsZW1lbnRzL1VzZUNhc2VTZWxlY3Rpb24nO1xuaW1wb3J0IHsgVmFsaWRhdGVkU2VydmVyQ29uZmlnIH0gZnJvbSAnLi4vLi4vdXRpbHMvVmFsaWRhdGVkU2VydmVyQ29uZmlnJztcbmltcG9ydCB7IGlzTG9jYWxSb29tIH0gZnJvbSAnLi4vLi4vdXRpbHMvbG9jYWxSb29tL2lzTG9jYWxSb29tJztcblxuLy8gbGVnYWN5IGV4cG9ydFxuZXhwb3J0IHsgZGVmYXVsdCBhcyBWaWV3cyB9IGZyb20gXCIuLi8uLi9WaWV3c1wiO1xuXG5jb25zdCBBVVRIX1NDUkVFTlMgPSBbXCJyZWdpc3RlclwiLCBcImxvZ2luXCIsIFwiZm9yZ290X3Bhc3N3b3JkXCIsIFwic3RhcnRfc3NvXCIsIFwic3RhcnRfY2FzXCIsIFwid2VsY29tZVwiXTtcblxuLy8gQWN0aW9ucyB0aGF0IGFyZSByZWRpcmVjdGVkIHRocm91Z2ggdGhlIG9uYm9hcmRpbmcgcHJvY2VzcyBwcmlvciB0byBiZWluZ1xuLy8gcmUtZGlzcGF0Y2hlZC4gTk9URTogc29tZSBhY3Rpb25zIGFyZSBub24tdHJpdmlhbCBhbmQgd291bGQgcmVxdWlyZVxuLy8gcmUtZmFjdG9yaW5nIHRvIGJlIGluY2x1ZGVkIGluIHRoaXMgbGlzdCBpbiBmdXR1cmUuXG5jb25zdCBPTkJPQVJESU5HX0ZMT1dfU1RBUlRFUlMgPSBbXG4gICAgQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MsXG4gICAgJ3ZpZXdfY3JlYXRlX2NoYXQnLFxuICAgICd2aWV3X2NyZWF0ZV9yb29tJyxcbl07XG5cbmludGVyZmFjZSBJU2NyZWVuIHtcbiAgICBzY3JlZW46IHN0cmluZztcbiAgICBwYXJhbXM/OiBRdWVyeURpY3Q7XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGNvbmZpZzogSUNvbmZpZ09wdGlvbnM7XG4gICAgc2VydmVyQ29uZmlnPzogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIG9uTmV3U2NyZWVuOiAoc2NyZWVuOiBzdHJpbmcsIHJlcGxhY2VMYXN0OiBib29sZWFuKSA9PiB2b2lkO1xuICAgIGVuYWJsZUd1ZXN0PzogYm9vbGVhbjtcbiAgICAvLyB0aGUgcXVlcnlQYXJhbXMgZXh0cmFjdGVkIGZyb20gdGhlIFtyZWFsXSBxdWVyeS1zdHJpbmcgb2YgdGhlIFVSSVxuICAgIHJlYWxRdWVyeVBhcmFtcz86IFF1ZXJ5RGljdDtcbiAgICAvLyB0aGUgaW5pdGlhbCBxdWVyeVBhcmFtcyBleHRyYWN0ZWQgZnJvbSB0aGUgaGFzaC1mcmFnbWVudCBvZiB0aGUgVVJJXG4gICAgc3RhcnRpbmdGcmFnbWVudFF1ZXJ5UGFyYW1zPzogUXVlcnlEaWN0O1xuICAgIC8vIGNhbGxlZCB3aGVuIHdlIGhhdmUgY29tcGxldGVkIGEgdG9rZW4gbG9naW5cbiAgICBvblRva2VuTG9naW5Db21wbGV0ZWQ/OiAoKSA9PiB2b2lkO1xuICAgIC8vIFJlcHJlc2VudHMgdGhlIHNjcmVlbiB0byBkaXNwbGF5IGFzIGEgcmVzdWx0IG9mIHBhcnNpbmcgdGhlIGluaXRpYWwgd2luZG93LmxvY2F0aW9uXG4gICAgaW5pdGlhbFNjcmVlbkFmdGVyTG9naW4/OiBJU2NyZWVuO1xuICAgIC8vIGRpc3BsYXluYW1lLCBpZiBhbnksIHRvIHNldCBvbiB0aGUgZGV2aWNlIHdoZW4gbG9nZ2luZyBpbi9yZWdpc3RlcmluZy5cbiAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gICAgLy8gQSBmdW5jdGlvbiB0aGF0IG1ha2VzIGEgcmVnaXN0cmF0aW9uIFVSTFxuICAgIG1ha2VSZWdpc3RyYXRpb25Vcmw6IChwYXJhbXM6IFF1ZXJ5RGljdCkgPT4gc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICAvLyB0aGUgbWFzdGVyIHZpZXcgd2UgYXJlIHNob3dpbmcuXG4gICAgdmlldzogVmlld3M7XG4gICAgLy8gV2hhdCB0aGUgTG9nZ2VkSW5WaWV3IHdvdWxkIGJlIHNob3dpbmcgaWYgdmlzaWJsZVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBwYWdlX3R5cGU/OiBQYWdlVHlwZTtcbiAgICAvLyBUaGUgSUQgb2YgdGhlIHJvb20gd2UncmUgdmlld2luZy4gVGhpcyBpcyBlaXRoZXIgcG9wdWxhdGVkIGRpcmVjdGx5XG4gICAgLy8gaW4gdGhlIGNhc2Ugd2hlcmUgd2UgdmlldyBhIHJvb20gYnkgSUQgb3IgYnkgUm9vbVZpZXcgd2hlbiBpdCByZXNvbHZlc1xuICAgIC8vIHdoYXQgSUQgYW4gYWxpYXMgcG9pbnRzIGF0LlxuICAgIGN1cnJlbnRSb29tSWQ/OiBzdHJpbmc7XG4gICAgLy8gSWYgd2UncmUgdHJ5aW5nIHRvIGp1c3QgdmlldyBhIHVzZXIgSUQgKGkuZS4gL3VzZXIgVVJMKSwgdGhpcyBpcyBpdFxuICAgIGN1cnJlbnRVc2VySWQ/OiBzdHJpbmc7XG4gICAgLy8gR3JvdXAgSUQgZm9yIGxlZ2FjeSBcImNvbW11bml0aWVzIGRvbid0IGV4aXN0XCIgcGFnZVxuICAgIGN1cnJlbnRHcm91cElkPzogc3RyaW5nO1xuICAgIC8vIHRoaXMgaXMgcGVyc2lzdGVkIGFzIG14X2xoc19zaXplLCBsb2FkZWQgaW4gTG9nZ2VkSW5WaWV3XG4gICAgY29sbGFwc2VMaHM6IGJvb2xlYW47XG4gICAgLy8gUGFyYW1ldGVycyB1c2VkIGluIHRoZSByZWdpc3RyYXRpb24gZGFuY2Ugd2l0aCB0aGUgSVNcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgcmVnaXN0ZXJfY2xpZW50X3NlY3JldD86IHN0cmluZztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgcmVnaXN0ZXJfc2Vzc2lvbl9pZD86IHN0cmluZztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgcmVnaXN0ZXJfaWRfc2lkPzogc3RyaW5nO1xuICAgIC8vIFdoZW4gc2hvd2luZyBNb2RhbCBkaWFsb2dzIHdlIG5lZWQgdG8gc2V0IGFyaWEtaGlkZGVuIG9uIHRoZSByb290IGFwcCBlbGVtZW50XG4gICAgLy8gYW5kIGRpc2FibGUgaXQgd2hlbiB0aGVyZSBhcmUgbm8gZGlhbG9nc1xuICAgIGhpZGVUb1NSVXNlcnM6IGJvb2xlYW47XG4gICAgc3luY0Vycm9yPzogTWF0cml4RXJyb3I7XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIHNlcnZlckNvbmZpZz86IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICByZWFkeTogYm9vbGVhbjtcbiAgICB0aHJlZXBpZEludml0ZT86IElUaHJlZXBpZEludml0ZTtcbiAgICByb29tT29iRGF0YT86IG9iamVjdDtcbiAgICBwZW5kaW5nSW5pdGlhbFN5bmM/OiBib29sZWFuO1xuICAgIGp1c3RSZWdpc3RlcmVkPzogYm9vbGVhbjtcbiAgICByb29tSnVzdENyZWF0ZWRPcHRzPzogSU9wdHM7XG4gICAgZm9yY2VUaW1lbGluZT86IGJvb2xlYW47IC8vIHNlZSBwcm9wc1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXRyaXhDaGF0IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiTWF0cml4Q2hhdFwiO1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgcmVhbFF1ZXJ5UGFyYW1zOiB7fSxcbiAgICAgICAgc3RhcnRpbmdGcmFnbWVudFF1ZXJ5UGFyYW1zOiB7fSxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgICAgb25Ub2tlbkxvZ2luQ29tcGxldGVkOiAoKSA9PiB7fSxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBmaXJzdFN5bmNDb21wbGV0ZSA9IGZhbHNlO1xuICAgIHByaXZhdGUgZmlyc3RTeW5jUHJvbWlzZTogSURlZmVycmVkPHZvaWQ+O1xuXG4gICAgcHJpdmF0ZSBzY3JlZW5BZnRlckxvZ2luPzogSVNjcmVlbjtcbiAgICBwcml2YXRlIHRva2VuTG9naW4/OiBib29sZWFuO1xuICAgIHByaXZhdGUgYWNjb3VudFBhc3N3b3JkPzogc3RyaW5nO1xuICAgIHByaXZhdGUgYWNjb3VudFBhc3N3b3JkVGltZXI/OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBmb2N1c0NvbXBvc2VyOiBib29sZWFuO1xuICAgIHByaXZhdGUgc3ViVGl0bGVTdGF0dXM6IHN0cmluZztcbiAgICBwcml2YXRlIHByZXZXaW5kb3dXaWR0aDogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZWRJblZpZXc6IFJlYWN0LlJlZk9iamVjdDxMb2dnZWRJblZpZXdUeXBlPjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IHRoZW1lV2F0Y2hlcjogVGhlbWVXYXRjaGVyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZm9udFdhdGNoZXI6IEZvbnRXYXRjaGVyO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPQURJTkcsXG4gICAgICAgICAgICBjb2xsYXBzZUxoczogZmFsc2UsXG5cbiAgICAgICAgICAgIGhpZGVUb1NSVXNlcnM6IGZhbHNlLFxuXG4gICAgICAgICAgICBzeW5jRXJyb3I6IG51bGwsIC8vIElmIHRoZSBjdXJyZW50IHN5bmNpbmcgc3RhdHVzIGlzIEVSUk9SLCB0aGUgZXJyb3Igb2JqZWN0LCBvdGhlcndpc2UgbnVsbC5cbiAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyOiBuZXcgUmVzaXplTm90aWZpZXIoKSxcbiAgICAgICAgICAgIHJlYWR5OiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2dlZEluVmlldyA9IGNyZWF0ZVJlZigpO1xuXG4gICAgICAgIFNka0NvbmZpZy5wdXQodGhpcy5wcm9wcy5jb25maWcpO1xuXG4gICAgICAgIC8vIFVzZWQgYnkgX3ZpZXdSb29tIGJlZm9yZSBnZXR0aW5nIHN0YXRlIGZyb20gc3luY1xuICAgICAgICB0aGlzLmZpcnN0U3luY0NvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmlyc3RTeW5jUHJvbWlzZSA9IGRlZmVyKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY29uZmlnLnN5bmNfdGltZWxpbmVfbGltaXQpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5vcHRzLmluaXRpYWxTeW5jTGltaXQgPSB0aGlzLnByb3BzLmNvbmZpZy5zeW5jX3RpbWVsaW5lX2xpbWl0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYSB0aGluZyB0byBjYWxsIHNob3dTY3JlZW4gd2l0aCBvbmNlIGxvZ2luIGNvbXBsZXRlcy4gIHRoaXMgaXMga2VwdFxuICAgICAgICAvLyBvdXRzaWRlIHRoaXMuc3RhdGUgYmVjYXVzZSB1cGRhdGluZyBpdCBzaG91bGQgbmV2ZXIgdHJpZ2dlciBhXG4gICAgICAgIC8vIHJlcmVuZGVyLlxuICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4gPSB0aGlzLnByb3BzLmluaXRpYWxTY3JlZW5BZnRlckxvZ2luO1xuICAgICAgICBpZiAodGhpcy5zY3JlZW5BZnRlckxvZ2luKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLnNjcmVlbkFmdGVyTG9naW4ucGFyYW1zIHx8IHt9O1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW4uc3RhcnRzV2l0aChcInJvb20vXCIpICYmIHBhcmFtc1snc2lnbnVybCddICYmIHBhcmFtc1snZW1haWwnXSkge1xuICAgICAgICAgICAgICAgIC8vIHByb2JhYmx5IGEgdGhyZWVwaWQgaW52aXRlIC0gdHJ5IHRvIHN0b3JlIGl0XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5zY3JlZW5BZnRlckxvZ2luLnNjcmVlbi5zdWJzdHJpbmcoXCJyb29tL1wiLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgVGhyZWVwaWRJbnZpdGVTdG9yZS5pbnN0YW5jZS5zdG9yZUludml0ZShyb29tSWQsIHBhcmFtcyBhcyB1bmtub3duIGFzIElUaHJlZXBpZEludml0ZVdpcmVGb3JtYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcmV2V2luZG93V2lkdGggPSBVSVN0b3JlLmluc3RhbmNlLndpbmRvd1dpZHRoIHx8IDEwMDA7XG4gICAgICAgIFVJU3RvcmUuaW5zdGFuY2Uub24oVUlfRVZFTlRTLlJlc2l6ZSwgdGhpcy5oYW5kbGVSZXNpemUpO1xuXG4gICAgICAgIC8vIEZvciBQZXJzaXN0ZW50RWxlbWVudFxuICAgICAgICB0aGlzLnN0YXRlLnJlc2l6ZU5vdGlmaWVyLm9uKFwibWlkZGxlUGFuZWxSZXNpemVkXCIsIHRoaXMuZGlzcGF0Y2hUaW1lbGluZVJlc2l6ZSk7XG5cbiAgICAgICAgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX1NUQVRVU19JTkRJQ0FUT1IsIHRoaXMub25VcGRhdGVTdGF0dXNJbmRpY2F0b3IpO1xuXG4gICAgICAgIC8vIEZvcmNlIHVzZXJzIHRvIGdvIHRocm91Z2ggdGhlIHNvZnQgbG9nb3V0IHBhZ2UgaWYgdGhleSdyZSBzb2Z0IGxvZ2dlZCBvdXRcbiAgICAgICAgaWYgKExpZmVjeWNsZS5pc1NvZnRMb2dvdXQoKSkge1xuICAgICAgICAgICAgLy8gV2hlbiB0aGUgc2Vzc2lvbiBsb2FkcyBpdCdsbCBiZSBkZXRlY3RlZCBhcyBzb2Z0IGxvZ2dlZCBvdXQgYW5kIGEgZGlzcGF0Y2hcbiAgICAgICAgICAgIC8vIHdpbGwgYmUgc2VudCBvdXQgdG8gc2F5IHRoYXQsIHRyaWdnZXJpbmcgdGhpcyBNYXRyaXhDaGF0IHRvIHNob3cgdGhlIHNvZnRcbiAgICAgICAgICAgIC8vIGxvZ291dCBwYWdlLlxuICAgICAgICAgICAgTGlmZWN5Y2xlLmxvYWRTZXNzaW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZCA9IG51bGw7XG4gICAgICAgIHRoaXMuYWNjb3VudFBhc3N3b3JkVGltZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcblxuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlciA9IG5ldyBUaGVtZVdhdGNoZXIoKTtcbiAgICAgICAgdGhpcy5mb250V2F0Y2hlciA9IG5ldyBGb250V2F0Y2hlcigpO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5zdGFydCgpO1xuICAgICAgICB0aGlzLmZvbnRXYXRjaGVyLnN0YXJ0KCk7XG5cbiAgICAgICAgdGhpcy5mb2N1c0NvbXBvc2VyID0gZmFsc2U7XG5cbiAgICAgICAgLy8gb2JqZWN0IGZpZWxkIHVzZWQgZm9yIHRyYWNraW5nIHRoZSBzdGF0dXMgaW5mbyBhcHBlbmRlZCB0byB0aGUgdGl0bGUgdGFnLlxuICAgICAgICAvLyB3ZSBkb24ndCBkbyBpdCBhcyByZWFjdCBzdGF0ZSBhcyBpJ20gc2NhcmVkIGFib3V0IHRyaWdnZXJpbmcgbmVlZGxlc3MgcmVhY3QgcmVmcmVzaGVzLlxuICAgICAgICB0aGlzLnN1YlRpdGxlU3RhdHVzID0gJyc7XG5cbiAgICAgICAgLy8gdGhlIGZpcnN0IHRoaW5nIHRvIGRvIGlzIHRvIHRyeSB0aGUgdG9rZW4gcGFyYW1zIGluIHRoZSBxdWVyeS1zdHJpbmdcbiAgICAgICAgLy8gaWYgdGhlIHNlc3Npb24gaXNuJ3Qgc29mdCBsb2dnZWQgb3V0IChpZTogaXMgYSBjbGVhbiBzZXNzaW9uIGJlaW5nIGxvZ2dlZCBpbilcbiAgICAgICAgaWYgKCFMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgICAgIExpZmVjeWNsZS5hdHRlbXB0VG9rZW5Mb2dpbihcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJlYWxRdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICB0aGlzLmdldEZyYWdtZW50QWZ0ZXJMb2dpbigpLFxuICAgICAgICAgICAgKS50aGVuKGFzeW5jIChsb2dnZWRJbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnJlYWxRdWVyeVBhcmFtcz8ubG9naW5Ub2tlbikge1xuICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIGxvZ2luVG9rZW4gZnJvbSB0aGUgVVJMIHJlZ2FyZGxlc3NcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblRva2VuTG9naW5Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobG9nZ2VkSW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2tlbkxvZ2luID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYW5kIHN0YXJ0IHRoZSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgTGlmZWN5Y2xlLnJlc3RvcmVGcm9tTG9jYWxTdG9yYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlnbm9yZUd1ZXN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zdExvZ2luU2V0dXAoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBoYXMgZm9sbG93ZWQgYSBsb2dpbiBvciByZWdpc3RlciBsaW5rLCBkb24ndCByZWFuaW1hdGVcbiAgICAgICAgICAgICAgICAvLyB0aGUgb2xkIGNyZWRzLCBidXQgcmF0aGVyIGdvIHN0cmFpZ2h0IHRvIHRoZSByZWxldmFudCBwYWdlXG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RTY3JlZW4gPSB0aGlzLnNjcmVlbkFmdGVyTG9naW4gPyB0aGlzLnNjcmVlbkFmdGVyTG9naW4uc2NyZWVuIDogbnVsbDtcblxuICAgICAgICAgICAgICAgIGlmIChmaXJzdFNjcmVlbiA9PT0gJ2xvZ2luJyB8fFxuICAgICAgICAgICAgICAgICAgICBmaXJzdFNjcmVlbiA9PT0gJ3JlZ2lzdGVyJyB8fFxuICAgICAgICAgICAgICAgICAgICBmaXJzdFNjcmVlbiA9PT0gJ2ZvcmdvdF9wYXNzd29yZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuQWZ0ZXJMb2dpbigpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9hZFNlc3Npb24oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdFNlbnRyeShTZGtDb25maWcuZ2V0KFwic2VudHJ5XCIpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHBvc3RMb2dpblNldHVwKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGNyeXB0b0VuYWJsZWQgPSBjbGkuaXNDcnlwdG9FbmFibGVkKCk7XG4gICAgICAgIGlmICghY3J5cHRvRW5hYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5vbkxvZ2dlZEluKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9taXNlc0xpc3Q6IFByb21pc2U8YW55PltdID0gW3RoaXMuZmlyc3RTeW5jUHJvbWlzZS5wcm9taXNlXTtcbiAgICAgICAgaWYgKGNyeXB0b0VuYWJsZWQpIHtcbiAgICAgICAgICAgIC8vIHdhaXQgZm9yIHRoZSBjbGllbnQgdG8gZmluaXNoIGRvd25sb2FkaW5nIGNyb3NzLXNpZ25pbmcga2V5cyBmb3IgdXMgc28gd2VcbiAgICAgICAgICAgIC8vIGtub3cgd2hldGhlciBvciBub3Qgd2UgaGF2ZSBrZXlzIHNldCB1cCBvbiB0aGlzIGFjY291bnRcbiAgICAgICAgICAgIHByb21pc2VzTGlzdC5wdXNoKGNsaS5kb3dubG9hZEtleXMoW2NsaS5nZXRVc2VySWQoKV0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyB1cGRhdGUgdGhlIHN0YXRlIHRvIHNheSB3ZSdyZSB3YWl0aW5nIGZvciB0aGUgZmlyc3Qgc3luYyB0byBjb21wbGV0ZSByYXRoZXJcbiAgICAgICAgLy8gdGhhbiBmb3IgdGhlIGxvZ2luIHRvIGZpbmlzaC5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBlbmRpbmdJbml0aWFsU3luYzogdHJ1ZSB9KTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlc0xpc3QpO1xuXG4gICAgICAgIGlmICghY3J5cHRvRW5hYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBlbmRpbmdJbml0aWFsU3luYzogZmFsc2UgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjcm9zc1NpZ25pbmdJc1NldFVwID0gY2xpLmdldFN0b3JlZENyb3NzU2lnbmluZ0ZvclVzZXIoY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgaWYgKGNyb3NzU2lnbmluZ0lzU2V0VXApIHtcbiAgICAgICAgICAgIGlmIChTZWN1cml0eUN1c3RvbWlzYXRpb25zLlNIT1dfRU5DUllQVElPTl9TRVRVUF9VSSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTG9nZ2VkSW4oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZUZvck5ld1ZpZXcoeyB2aWV3OiBWaWV3cy5DT01QTEVURV9TRUNVUklUWSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChhd2FpdCBjbGkuZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUoXCJvcmcubWF0cml4LmUyZV9jcm9zc19zaWduaW5nXCIpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7IHZpZXc6IFZpZXdzLkUyRV9TRVRVUCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25Mb2dnZWRJbigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwZW5kaW5nSW5pdGlhbFN5bmM6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIHN0YWdlXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxVcGRhdGUocHJvcHMsIHN0YXRlKSB7XG4gICAgICAgIGlmICh0aGlzLnNob3VsZFRyYWNrUGFnZUNoYW5nZSh0aGlzLnN0YXRlLCBzdGF0ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRQYWdlQ2hhbmdlVGltZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5vbldpbmRvd1Jlc2l6ZWQpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5zaG91bGRUcmFja1BhZ2VDaGFuZ2UocHJldlN0YXRlLCB0aGlzLnN0YXRlKSkge1xuICAgICAgICAgICAgY29uc3QgZHVyYXRpb25NcyA9IHRoaXMuc3RvcFBhZ2VDaGFuZ2VUaW1lcigpO1xuICAgICAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLmluc3RhbmNlLnRyYWNrUGFnZUNoYW5nZSh0aGlzLnN0YXRlLnZpZXcsIHRoaXMuc3RhdGUucGFnZV90eXBlLCBkdXJhdGlvbk1zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5mb2N1c0NvbXBvc2VyKSB7XG4gICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNTZW5kTWVzc2FnZUNvbXBvc2VyKTtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNDb21wb3NlciA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIExpZmVjeWNsZS5zdG9wTWF0cml4Q2xpZW50KCk7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnN0b3AoKTtcbiAgICAgICAgdGhpcy5mb250V2F0Y2hlci5zdG9wKCk7XG4gICAgICAgIFVJU3RvcmUuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLnN0YXRlLnJlc2l6ZU5vdGlmaWVyLnJlbW92ZUxpc3RlbmVyKFwibWlkZGxlUGFuZWxSZXNpemVkXCIsIHRoaXMuZGlzcGF0Y2hUaW1lbGluZVJlc2l6ZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMub25XaW5kb3dSZXNpemVkKTtcblxuICAgICAgICBpZiAodGhpcy5hY2NvdW50UGFzc3dvcmRUaW1lciAhPT0gbnVsbCkgY2xlYXJUaW1lb3V0KHRoaXMuYWNjb3VudFBhc3N3b3JkVGltZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25XaW5kb3dSZXNpemVkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBYWFg6IFRoaXMgaXMgYSB2ZXJ5IHVucmVsaWFibGUgd2F5IHRvIGRldGVjdCB3aGV0aGVyIG9yIG5vdCB0aGUgdGhlIGRldnRvb2xzIGFyZSBvcGVuXG4gICAgICAgIHRoaXMud2FybkluQ29uc29sZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHdhcm5JbkNvbnNvbGUgPSB0aHJvdHRsZSgoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGxhcmdlRm9udFNpemUgPSBcIjUwcHhcIjtcbiAgICAgICAgY29uc3Qgbm9ybWFsRm9udFNpemUgPSBcIjE1cHhcIjtcblxuICAgICAgICBjb25zdCB3YWl0VGV4dCA9IF90KFwiV2FpdCFcIik7XG4gICAgICAgIGNvbnN0IHNjYW1UZXh0ID0gX3QoXG4gICAgICAgICAgICBcIklmIHNvbWVvbmUgdG9sZCB5b3UgdG8gY29weS9wYXN0ZSBzb21ldGhpbmcgaGVyZSwgXCIgK1xuICAgICAgICAgICAgXCJ0aGVyZSBpcyBhIGhpZ2ggbGlrZWxpaG9vZCB5b3UncmUgYmVpbmcgc2NhbW1lZCFcIixcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZGV2VGV4dCA9IF90KFxuICAgICAgICAgICAgXCJJZiB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZywgRWxlbWVudCBpcyBvcGVuLXNvdXJjZSwgXCIgK1xuICAgICAgICAgICAgXCJiZSBzdXJlIHRvIGNoZWNrIG91dCBvdXIgR2l0SHViIChodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViLykgXCIgK1xuICAgICAgICAgICAgXCJhbmQgY29udHJpYnV0ZSFcIixcbiAgICAgICAgKTtcblxuICAgICAgICBnbG9iYWwubXhfcmFnZV9sb2dnZXIuYnlwYXNzUmFnZXNoYWtlKFxuICAgICAgICAgICAgXCJsb2dcIixcbiAgICAgICAgICAgIGAlYyR7d2FpdFRleHR9XFxuJWMke3NjYW1UZXh0fVxcbiVjJHtkZXZUZXh0fWAsXG4gICAgICAgICAgICBgZm9udC1zaXplOiR7bGFyZ2VGb250U2l6ZX07IGNvbG9yOmJsdWU7YCxcbiAgICAgICAgICAgIGBmb250LXNpemU6JHtub3JtYWxGb250U2l6ZX07IGNvbG9yOnJlZDtgLFxuICAgICAgICAgICAgYGZvbnQtc2l6ZToke25vcm1hbEZvbnRTaXplfTtgLFxuICAgICAgICApO1xuICAgIH0sIDEwMDApO1xuXG4gICAgcHJpdmF0ZSBnZXRGYWxsYmFja0hzVXJsKCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNlcnZlckNvbmZpZz8uaXNEZWZhdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jb25maWcuZmFsbGJhY2tfaHNfdXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFNlcnZlclByb3BlcnRpZXMoKSB7XG4gICAgICAgIGxldCBwcm9wcyA9IHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnO1xuICAgICAgICBpZiAoIXByb3BzKSBwcm9wcyA9IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnOyAvLyBmb3IgdW5pdCB0ZXN0c1xuICAgICAgICBpZiAoIXByb3BzKSBwcm9wcyA9IFNka0NvbmZpZy5nZXQoXCJ2YWxpZGF0ZWRfc2VydmVyX2NvbmZpZ1wiKTtcbiAgICAgICAgcmV0dXJuIHsgc2VydmVyQ29uZmlnOiBwcm9wcyB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZFNlc3Npb24oKSB7XG4gICAgICAgIC8vIHRoZSBleHRyYSBQcm9taXNlLnJlc29sdmUoKSBlbnN1cmVzIHRoYXQgc3luY2hyb25vdXMgZXhjZXB0aW9ucyBoaXQgdGhlIHNhbWUgY29kZXBhdGggYXNcbiAgICAgICAgLy8gYXN5bmNocm9ub3VzIG9uZXMuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBMaWZlY3ljbGUubG9hZFNlc3Npb24oe1xuICAgICAgICAgICAgICAgIGZyYWdtZW50UXVlcnlQYXJhbXM6IHRoaXMucHJvcHMuc3RhcnRpbmdGcmFnbWVudFF1ZXJ5UGFyYW1zLFxuICAgICAgICAgICAgICAgIGVuYWJsZUd1ZXN0OiB0aGlzLnByb3BzLmVuYWJsZUd1ZXN0LFxuICAgICAgICAgICAgICAgIGd1ZXN0SHNVcmw6IHRoaXMuZ2V0U2VydmVyUHJvcGVydGllcygpLnNlcnZlckNvbmZpZy5oc1VybCxcbiAgICAgICAgICAgICAgICBndWVzdElzVXJsOiB0aGlzLmdldFNlcnZlclByb3BlcnRpZXMoKS5zZXJ2ZXJDb25maWcuaXNVcmwsXG4gICAgICAgICAgICAgICAgZGVmYXVsdERldmljZURpc3BsYXlOYW1lOiB0aGlzLnByb3BzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS50aGVuKChsb2FkZWRTZXNzaW9uKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWxvYWRlZFNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAvLyBmYWxsIGJhY2sgdG8gc2hvd2luZyB0aGUgd2VsY29tZSBzY3JlZW4uLi4gdW5sZXNzIHdlIGhhdmUgYSAzcGlkIGludml0ZSBwZW5kaW5nXG4gICAgICAgICAgICAgICAgaWYgKFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UucGlja0Jlc3RJbnZpdGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJ2aWV3X3dlbGNvbWVfcGFnZVwiIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIE5vdGUgd2UgZG9uJ3QgY2F0Y2ggZXJyb3JzIGZyb20gdGhpczogd2UgY2F0Y2ggZXZlcnl0aGluZyB3aXRoaW5cbiAgICAgICAgLy8gbG9hZFNlc3Npb24gYXMgdGhlcmUncyBsb2dpYyB0aGVyZSB0byBhc2sgdGhlIHVzZXIgaWYgdGhleSB3YW50XG4gICAgICAgIC8vIHRvIHRyeSBsb2dnaW5nIG91dC5cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXJ0UGFnZUNoYW5nZVRpbWVyKCkge1xuICAgICAgICBQZXJmb3JtYW5jZU1vbml0b3IuaW5zdGFuY2Uuc3RhcnQoUGVyZm9ybWFuY2VFbnRyeU5hbWVzLlBBR0VfQ0hBTkdFKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0b3BQYWdlQ2hhbmdlVGltZXIoKSB7XG4gICAgICAgIGNvbnN0IHBlcmZNb25pdG9yID0gUGVyZm9ybWFuY2VNb25pdG9yLmluc3RhbmNlO1xuXG4gICAgICAgIHBlcmZNb25pdG9yLnN0b3AoUGVyZm9ybWFuY2VFbnRyeU5hbWVzLlBBR0VfQ0hBTkdFKTtcblxuICAgICAgICBjb25zdCBlbnRyaWVzID0gcGVyZk1vbml0b3IuZ2V0RW50cmllcyh7XG4gICAgICAgICAgICBuYW1lOiBQZXJmb3JtYW5jZUVudHJ5TmFtZXMuUEFHRV9DSEFOR0UsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBtZWFzdXJlbWVudCA9IGVudHJpZXMucG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIG1lYXN1cmVtZW50XG4gICAgICAgICAgICA/IG1lYXN1cmVtZW50LmR1cmF0aW9uXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG91bGRUcmFja1BhZ2VDaGFuZ2UocHJldlN0YXRlOiBJU3RhdGUsIHN0YXRlOiBJU3RhdGUpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHByZXZTdGF0ZS5jdXJyZW50Um9vbUlkICE9PSBzdGF0ZS5jdXJyZW50Um9vbUlkIHx8XG4gICAgICAgICAgICBwcmV2U3RhdGUudmlldyAhPT0gc3RhdGUudmlldyB8fFxuICAgICAgICAgICAgcHJldlN0YXRlLnBhZ2VfdHlwZSAhPT0gc3RhdGUucGFnZV90eXBlO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0U3RhdGVGb3JOZXdWaWV3KHN0YXRlOiBQYXJ0aWFsPElTdGF0ZT4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHN0YXRlLnZpZXcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2V0U3RhdGVGb3JOZXdWaWV3IHdpdGggbm8gdmlldyFcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgICBjdXJyZW50VXNlcklkOiBudWxsLFxuICAgICAgICAgICAganVzdFJlZ2lzdGVyZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuYXNzaWduKG5ld1N0YXRlLCBzdGF0ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgTWF0cml4Q2xpZW50UGVnLm9uQWN0aW9uOiAke3BheWxvYWQuYWN0aW9ufWApO1xuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBvbmJvYXJkaW5nIHByb2Nlc3MgZm9yIGNlcnRhaW4gYWN0aW9uc1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpPy5pc0d1ZXN0KCkgJiYgT05CT0FSRElOR19GTE9XX1NUQVJURVJTLmluY2x1ZGVzKHBheWxvYWQuYWN0aW9uKSkge1xuICAgICAgICAgICAgLy8gVGhpcyB3aWxsIGNhdXNlIGBwYXlsb2FkYCB0byBiZSBkaXNwYXRjaGVkIGxhdGVyLCBvbmNlIGFcbiAgICAgICAgICAgIC8vIHN5bmMgaGFzIHJlYWNoZWQgdGhlIFwicHJlcGFyZWRcIiBzdGF0ZS4gU2V0dGluZyBhIG1hdHJpeCBJRFxuICAgICAgICAgICAgLy8gd2lsbCBjYXVzZSBhIGZ1bGwgbG9naW4gYW5kIHN5bmMgYW5kIGZpbmFsbHkgdGhlIGRlZmVycmVkXG4gICAgICAgICAgICAvLyBhY3Rpb24gd2lsbCBiZSBkaXNwYXRjaGVkLlxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Eb0FmdGVyU3luY1ByZXBhcmVkLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjogcGF5bG9hZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnTWF0cml4QWN0aW9ucy5hY2NvdW50RGF0YSc6XG4gICAgICAgICAgICAgICAgLy8gWFhYOiBUaGlzIGlzIGEgY29sbGVjdGlvbiBvZiBzZXZlcmFsIGhhY2tzIHRvIHNvbHZlIGEgbWlub3IgcHJvYmxlbS4gV2Ugd2FudCB0b1xuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBvdXIgbG9jYWwgc3RhdGUgd2hlbiB0aGUgaWRlbnRpdHkgc2VydmVyIGNoYW5nZXMsIGJ1dCBkb24ndCB3YW50IHRvIHB1dCB0aGF0IGluXG4gICAgICAgICAgICAgICAgLy8gdGhlIGpzLXNkayBhcyB3ZSdkIGJlIHRoZW4gZGljdGF0aW5nIGhvdyBhbGwgY29uc3VtZXJzIG5lZWQgdG8gYmVoYXZlLiBIb3dldmVyLFxuICAgICAgICAgICAgICAgIC8vIHRoaXMgY29tcG9uZW50IGlzIGFscmVhZHkgYmxvYXRlZCBhbmQgd2UgcHJvYmFibHkgZG9uJ3Qgd2FudCB0aGlzIHRpbnkgbG9naWMgaW5cbiAgICAgICAgICAgICAgICAvLyBoZXJlLCBidXQgdGhlcmUncyBubyBiZXR0ZXIgcGxhY2UgaW4gdGhlIHJlYWN0LXNkayBmb3IgaXQuIEFkZGl0aW9uYWxseSwgd2UncmVcbiAgICAgICAgICAgICAgICAvLyBhYnVzaW5nIHRoZSBNYXRyaXhBY3Rpb25DcmVhdG9yIHN0dWZmIHRvIGF2b2lkIGVycm9ycyBvbiBkaXNwYXRjaGVzLlxuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLmV2ZW50X3R5cGUgPT09ICdtLmlkZW50aXR5X3NlcnZlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnVsbFVybCA9IHBheWxvYWQuZXZlbnRfY29udGVudCA/IHBheWxvYWQuZXZlbnRfY29udGVudFsnYmFzZV91cmwnXSA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZnVsbFVybCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldElkZW50aXR5U2VydmVyVXJsKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJteF9pc19hY2Nlc3NfdG9rZW5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X2lzX3VybFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRJZGVudGl0eVNlcnZlclVybChmdWxsVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwibXhfaXNfYWNjZXNzX3Rva2VuXCIpOyAvLyBjbGVhciB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9pc191cmxcIiwgZnVsbFVybCk7IC8vIFhYWDogRG8gd2Ugc3RpbGwgbmVlZCB0aGlzP1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmVkaXNwYXRjaCB0aGUgY2hhbmdlIHdpdGggYSBtb3JlIHNwZWNpZmljIGFjdGlvblxuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdpZF9zZXJ2ZXJfY2hhbmdlZCcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbG9nb3V0JzpcbiAgICAgICAgICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5oYW5ndXBBbGxDYWxscygpO1xuICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKFsuLi5DYWxsU3RvcmUuaW5zdGFuY2UuYWN0aXZlQ2FsbHNdLm1hcChjYWxsID0+IGNhbGwuZGlzY29ubmVjdCgpKSlcbiAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4gTGlmZWN5Y2xlLmxvZ291dCgpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJzpcbiAgICAgICAgICAgICAgICBzdGFydEFueVJlZ2lzdHJhdGlvbkZsb3cocGF5bG9hZCBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RhcnRfcmVnaXN0cmF0aW9uJzpcbiAgICAgICAgICAgICAgICBpZiAoTGlmZWN5Y2xlLmlzU29mdExvZ291dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Tb2Z0TG9nb3V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBUaGlzIHN0YXJ0cyB0aGUgZnVsbCByZWdpc3RyYXRpb24gZmxvd1xuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLnNjcmVlbkFmdGVyTG9naW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luID0gcGF5bG9hZC5zY3JlZW5BZnRlckxvZ2luO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0UmVnaXN0cmF0aW9uKHBheWxvYWQucGFyYW1zIHx8IHt9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3N0YXJ0X2xvZ2luJzpcbiAgICAgICAgICAgICAgICBpZiAoTGlmZWN5Y2xlLmlzU29mdExvZ291dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Tb2Z0TG9nb3V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5zY3JlZW5BZnRlckxvZ2luKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbiA9IHBheWxvYWQuc2NyZWVuQWZ0ZXJMb2dpbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TG9naW4oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3N0YXJ0X3Bhc3N3b3JkX3JlY292ZXJ5JzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7XG4gICAgICAgICAgICAgICAgICAgIHZpZXc6IFZpZXdzLkZPUkdPVF9QQVNTV09SRCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeU5ld1NjcmVlbignZm9yZ290X3Bhc3N3b3JkJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdGFydF9jaGF0JzpcbiAgICAgICAgICAgICAgICBjcmVhdGVSb29tKHtcbiAgICAgICAgICAgICAgICAgICAgZG1Vc2VySWQ6IHBheWxvYWQudXNlcl9pZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xlYXZlX3Jvb20nOlxuICAgICAgICAgICAgICAgIHRoaXMubGVhdmVSb29tKHBheWxvYWQucm9vbV9pZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmb3JnZXRfcm9vbSc6XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JnZXRSb29tKHBheWxvYWQucm9vbV9pZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb3B5X3Jvb20nOlxuICAgICAgICAgICAgICAgIHRoaXMuY29weVJvb20ocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlamVjdF9pbnZpdGUnOlxuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1JlamVjdCBpbnZpdGF0aW9uJyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlamVjdCB0aGUgaW52aXRhdGlvbj8nKSxcbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZDogKGNvbmZpcm0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maXJtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IGNvbnRyb2xsZXIgc2hvdWxkbid0IGJlIGxvYWRpbmcgYSB2aWV3IDooXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kYWwgPSBNb2RhbC5jcmVhdGVEaWFsb2coU3Bpbm5lciwgbnVsbCwgJ214X0RpYWxvZ19zcGlubmVyJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubGVhdmUocGF5bG9hZC5yb29tX2lkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VycmVudFJvb21JZCA9PT0gcGF5bG9hZC5yb29tX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IEFjdGlvbi5WaWV3SG9tZVBhZ2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdGYWlsZWQgdG8gcmVqZWN0IGludml0YXRpb24nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnIudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2aWV3X3VzZXJfaW5mbyc6XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3VXNlcihwYXlsb2FkLnVzZXJJZCwgcGF5bG9hZC5zdWJBY3Rpb24pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIk1hdHJpeEFjdGlvbnMuUm9vbVN0YXRlLmV2ZW50c1wiOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSAocGF5bG9hZCBhcyBJUm9vbVN0YXRlRXZlbnRzQWN0aW9uUGF5bG9hZCkuZXZlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlJvb21DYW5vbmljYWxBbGlhcyAmJlxuICAgICAgICAgICAgICAgICAgICBldmVudC5nZXRSb29tSWQoKSA9PT0gdGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJlLXZpZXcgdGhlIGN1cnJlbnQgcm9vbSBzbyB3ZSBjYW4gdXBkYXRlIGFsaWFzL2lkIGluIHRoZSBVUkwgcHJvcGVybHlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3Um9vbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHRoaXMuc3RhdGUuY3VycmVudFJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uVmlld1Jvb206IHtcbiAgICAgICAgICAgICAgICAvLyBUYWtlcyBlaXRoZXIgYSByb29tIElEIG9yIHJvb20gYWxpYXM6IGlmIHN3aXRjaGluZyB0byBhIHJvb20gdGhlIGNsaWVudCBpcyBhbHJlYWR5XG4gICAgICAgICAgICAgICAgLy8ga25vd24gdG8gYmUgaW4gKGVnLiB1c2VyIGNsaWNrcyBvbiBhIHJvb20gaW4gdGhlIHJlY2VudHMgcGFuZWwpLCBzdXBwbHkgdGhlIElEXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgY2xpY2tpbmcgb24gYSByb29tIGluIHRoZSBjb250ZXh0IG9mIHRoZSBhbGlhcyBiZWluZyBwcmVzZW50ZWRcbiAgICAgICAgICAgICAgICAvLyB0byB0aGVtLCBzdXBwbHkgdGhlIHJvb20gYWxpYXMuIElmIGJvdGggYXJlIHN1cHBsaWVkLCB0aGUgcm9vbSBJRCB3aWxsIGJlIGlnbm9yZWQuXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMudmlld1Jvb20ocGF5bG9hZCBhcyBWaWV3Um9vbVBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLmRlZmVycmVkX2FjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHBheWxvYWQuZGVmZXJyZWRfYWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAndmlld19sZWdhY3lfZ3JvdXAnOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld0xlZ2FjeUdyb3VwKHBheWxvYWQuZ3JvdXBJZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5WaWV3VXNlclNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFiUGF5bG9hZCA9IHBheWxvYWQgYXMgT3BlblRvVGFiUGF5bG9hZDtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coVXNlclNldHRpbmdzRGlhbG9nLFxuICAgICAgICAgICAgICAgICAgICB7IGluaXRpYWxUYWJJZDogdGFiUGF5bG9hZC5pbml0aWFsVGFiSWQgfSxcbiAgICAgICAgICAgICAgICAgICAgLypjbGFzc05hbWU9Ki9udWxsLCAvKmlzUHJpb3JpdHk9Ki9mYWxzZSwgLyppc1N0YXRpYz0qL3RydWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gVmlldyB0aGUgd2VsY29tZSBvciBob21lIHBhZ2UgaWYgd2UgbmVlZCBzb21ldGhpbmcgdG8gbG9vayBhdFxuICAgICAgICAgICAgICAgIHRoaXMudmlld1NvbWV0aGluZ0JlaGluZE1vZGFsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICd2aWV3X2NyZWF0ZV9yb29tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb20ocGF5bG9hZC5wdWJsaWMsIHBheWxvYWQuZGVmYXVsdE5hbWUsIHBheWxvYWQudHlwZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBWaWV3IHRoZSB3ZWxjb21lIG9yIGhvbWUgcGFnZSBpZiB3ZSBuZWVkIHNvbWV0aGluZyB0byBsb29rIGF0XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3U29tZXRoaW5nQmVoaW5kTW9kYWwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlZpZXdSb29tRGlyZWN0b3J5OiB7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFJvb21EaXJlY3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFRleHQ6IHBheWxvYWQuaW5pdGlhbFRleHQsXG4gICAgICAgICAgICAgICAgfSwgJ214X1Jvb21EaXJlY3RvcnlfZGlhbG9nV3JhcHBlcicsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIC8vIFZpZXcgdGhlIHdlbGNvbWUgb3IgaG9tZSBwYWdlIGlmIHdlIG5lZWQgc29tZXRoaW5nIHRvIGxvb2sgYXRcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdTb21ldGhpbmdCZWhpbmRNb2RhbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAndmlld193ZWxjb21lX3BhZ2UnOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld1dlbGNvbWUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlZpZXdIb21lUGFnZTpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdIb21lKHBheWxvYWQuanVzdFJlZ2lzdGVyZWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpb24uVmlld1N0YXJ0Q2hhdE9yUmV1c2U6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGF0Q3JlYXRlT3JSZXVzZShwYXlsb2FkLnVzZXJfaWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld19jcmVhdGVfY2hhdCc6XG4gICAgICAgICAgICAgICAgc2hvd1N0YXJ0Q2hhdEludml0ZURpYWxvZyhwYXlsb2FkLmluaXRpYWxUZXh0IHx8IFwiXCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gVmlldyB0aGUgd2VsY29tZSBvciBob21lIHBhZ2UgaWYgd2UgbmVlZCBzb21ldGhpbmcgdG8gbG9vayBhdFxuICAgICAgICAgICAgICAgIHRoaXMudmlld1NvbWV0aGluZ0JlaGluZE1vZGFsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2aWV3X2ludml0ZSc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocGF5bG9hZC5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGlmIChyb29tPy5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dTcGFjZUludml0ZShyb29tKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaG93Um9vbUludml0ZURpYWxvZyhwYXlsb2FkLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAndmlld19sYXN0X3NjcmVlbic6XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBmdW5jdGlvbiBkb2VzIHdoYXQgd2Ugd2FudCwgZGVzcGl0ZSB0aGUgbmFtZS4gVGhlIGlkZWEgaXMgdGhhdCBpdCBzaG93c1xuICAgICAgICAgICAgICAgIC8vIHRoZSBsYXN0IHJvb20gd2Ugd2VyZSBsb29raW5nIGF0IG9yIHNvbWUgcmVhc29uYWJsZSBkZWZhdWx0L2d1ZXNzLiBXZSBkb24ndFxuICAgICAgICAgICAgICAgIC8vIGhhdmUgdG8gd29ycnkgYWJvdXQgZW1haWwgaW52aXRlcyBvciBzaW1pbGFyIGJlaW5nIHJlLXRyaWdnZXJlZCBiZWNhdXNlIHRoZVxuICAgICAgICAgICAgICAgIC8vIGZ1bmN0aW9uIHdpbGwgaGF2ZSBjbGVhcmVkIHRoYXQgc3RhdGUgYW5kIG5vdCBleGVjdXRlIHRoYXQgcGF0aC5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dTY3JlZW5BZnRlckxvZ2luKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdoaWRlX2xlZnRfcGFuZWwnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZUxoczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucmVzaXplTm90aWZpZXIubm90aWZ5TGVmdEhhbmRsZVJlc2l6ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Nob3dfbGVmdF9wYW5lbCc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlTGhzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucmVzaXplTm90aWZpZXIubm90aWZ5TGVmdEhhbmRsZVJlc2l6ZWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9wZW5EaWFsUGFkOlxuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhEaWFsUGFkTW9kYWwsIHt9LCBcIm14X0RpYWxvZ19kaWFsUGFkV3JhcHBlclwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9uTG9nZ2VkSW46XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAvLyBTa2lwIHRoaXMgaGFuZGxpbmcgZm9yIHRva2VuIGxvZ2luIGFzIHRoYXQgYWx3YXlzIGNhbGxzIG9uTG9nZ2VkSW4gaXRzZWxmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnRva2VuTG9naW4gJiZcbiAgICAgICAgICAgICAgICAgICAgIUxpZmVjeWNsZS5pc1NvZnRMb2dvdXQoKSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnZpZXcgIT09IFZpZXdzLkxPR0lOICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudmlldyAhPT0gVmlld3MuUkVHSVNURVIgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS52aWV3ICE9PSBWaWV3cy5DT01QTEVURV9TRUNVUklUWSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnZpZXcgIT09IFZpZXdzLkUyRV9TRVRVUCAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnZpZXcgIT09IFZpZXdzLlVTRV9DQVNFX1NFTEVDVElPTlxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTG9nZ2VkSW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvbl9jbGllbnRfbm90X3ZpYWJsZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vblNvZnRMb2dvdXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9uTG9nZ2VkT3V0OlxuICAgICAgICAgICAgICAgIHRoaXMub25Mb2dnZWRPdXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3dpbGxfc3RhcnRfY2xpZW50JzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVhZHk6IGZhbHNlIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIGNsaWVudCBpcyBhYm91dCB0byBzdGFydCwgd2UgYXJlLCBieSBkZWZpbml0aW9uLCBub3QgcmVhZHkuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCByZWFkeSB0byBmYWxzZSBub3csIHRoZW4gaXQnbGwgYmUgc2V0IHRvIHRydWUgd2hlbiB0aGUgc3luY1xuICAgICAgICAgICAgICAgICAgICAvLyBsaXN0ZW5lciB3ZSBzZXQgYmVsb3cgZmlyZXMuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25XaWxsU3RhcnRDbGllbnQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NsaWVudF9zdGFydGVkJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2xpZW50U3RhcnRlZCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2VuZF9ldmVudCc6XG4gICAgICAgICAgICAgICAgdGhpcy5vblNlbmRFdmVudChwYXlsb2FkLnJvb21faWQsIHBheWxvYWQuZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXJpYV9oaWRlX21haW5fYXBwJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaGlkZVRvU1JVc2VyczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FyaWFfdW5oaWRlX21haW5fYXBwJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaGlkZVRvU1JVc2VyczogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5Qc2V1ZG9ueW1vdXNBbmFseXRpY3NBY2NlcHQ6XG4gICAgICAgICAgICAgICAgaGlkZUFuYWx5dGljc1RvYXN0KCk7XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInBzZXVkb255bW91c0FuYWx5dGljc09wdEluXCIsIG51bGwsIFNldHRpbmdMZXZlbC5BQ0NPVU5ULCB0cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlBzZXVkb255bW91c0FuYWx5dGljc1JlamVjdDpcbiAgICAgICAgICAgICAgICBoaWRlQW5hbHl0aWNzVG9hc3QoKTtcbiAgICAgICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwicHNldWRvbnltb3VzQW5hbHl0aWNzT3B0SW5cIiwgbnVsbCwgU2V0dGluZ0xldmVsLkFDQ09VTlQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlNob3dUaHJlYWQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3RFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRlZCxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsSW50b1ZpZXcsXG4gICAgICAgICAgICAgICAgICAgIHB1c2gsXG4gICAgICAgICAgICAgICAgfSA9IHBheWxvYWQgYXMgU2hvd1RocmVhZFBheWxvYWQ7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0aHJlYWRWaWV3Q2FyZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuVGhyZWFkVmlldyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocmVhZEhlYWRFdmVudDogcm9vdEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEV2ZW50OiBpbml0aWFsRXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkOiBoaWdobGlnaHRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxFdmVudFNjcm9sbEludG9WaWV3OiBzY3JvbGxJbnRvVmlldyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChwdXNoID8/IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5wdXNoQ2FyZCh0aHJlYWRWaWV3Q2FyZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnNldENhcmRzKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuVGhyZWFkUGFuZWwgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocmVhZFZpZXdDYXJkLFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBGb2N1cyB0aGUgY29tcG9zZXJcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Gb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHNldFBhZ2UocGFnZVR5cGU6IFBhZ2VUeXBlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFnZV90eXBlOiBwYWdlVHlwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzdGFydFJlZ2lzdHJhdGlvbihwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlOiBQYXJ0aWFsPElTdGF0ZT4gPSB7XG4gICAgICAgICAgICB2aWV3OiBWaWV3cy5SRUdJU1RFUixcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBPbmx5IGhvbm91ciBwYXJhbXMgaWYgdGhleSBhcmUgYWxsIHByZXNlbnQsIG90aGVyd2lzZSB3ZSByZXNldFxuICAgICAgICAvLyBIUyBhbmQgSVMgVVJMcyB3aGVuIHN3aXRjaGluZyB0byByZWdpc3RyYXRpb24uXG4gICAgICAgIGlmIChwYXJhbXMuY2xpZW50X3NlY3JldCAmJlxuICAgICAgICAgICAgcGFyYW1zLnNlc3Npb25faWQgJiZcbiAgICAgICAgICAgIHBhcmFtcy5oc191cmwgJiZcbiAgICAgICAgICAgIHBhcmFtcy5pc191cmwgJiZcbiAgICAgICAgICAgIHBhcmFtcy5zaWRcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBuZXdTdGF0ZS5zZXJ2ZXJDb25maWcgPSBhd2FpdCBBdXRvRGlzY292ZXJ5VXRpbHMudmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyhcbiAgICAgICAgICAgICAgICBwYXJhbXMuaHNfdXJsLCBwYXJhbXMuaXNfdXJsLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIGhzIHVybCBtYXRjaGVzIHRoZW4gdGFrZSB0aGUgaHMgbmFtZSB3ZSBrbm93IGxvY2FsbHkgYXMgaXQgaXMgbGlrZWx5IHByZXR0aWVyXG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gU2RrQ29uZmlnLmdldChcInZhbGlkYXRlZF9zZXJ2ZXJfY29uZmlnXCIpO1xuICAgICAgICAgICAgaWYgKGRlZmF1bHRDb25maWcgJiYgZGVmYXVsdENvbmZpZy5oc1VybCA9PT0gbmV3U3RhdGUuc2VydmVyQ29uZmlnLmhzVXJsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhdGUuc2VydmVyQ29uZmlnLmhzTmFtZSA9IGRlZmF1bHRDb25maWcuaHNOYW1lO1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLnNlcnZlckNvbmZpZy5oc05hbWVJc0RpZmZlcmVudCA9IGRlZmF1bHRDb25maWcuaHNOYW1lSXNEaWZmZXJlbnQ7XG4gICAgICAgICAgICAgICAgbmV3U3RhdGUuc2VydmVyQ29uZmlnLmlzRGVmYXVsdCA9IGRlZmF1bHRDb25maWcuaXNEZWZhdWx0O1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLnNlcnZlckNvbmZpZy5pc05hbWVSZXNvbHZhYmxlID0gZGVmYXVsdENvbmZpZy5pc05hbWVSZXNvbHZhYmxlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZXdTdGF0ZS5yZWdpc3Rlcl9jbGllbnRfc2VjcmV0ID0gcGFyYW1zLmNsaWVudF9zZWNyZXQ7XG4gICAgICAgICAgICBuZXdTdGF0ZS5yZWdpc3Rlcl9zZXNzaW9uX2lkID0gcGFyYW1zLnNlc3Npb25faWQ7XG4gICAgICAgICAgICBuZXdTdGF0ZS5yZWdpc3Rlcl9pZF9zaWQgPSBwYXJhbXMuc2lkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZUZvck5ld1ZpZXcobmV3U3RhdGUpO1xuICAgICAgICBUaGVtZUNvbnRyb2xsZXIuaXNMb2dpbiA9IHRydWU7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnJlY2hlY2soKTtcbiAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3JlZ2lzdGVyJyk7XG4gICAgfVxuXG4gICAgLy8gc3dpdGNoIHZpZXcgdG8gdGhlIGdpdmVuIHJvb21cbiAgICBwcml2YXRlIGFzeW5jIHZpZXdSb29tKHJvb21JbmZvOiBWaWV3Um9vbVBheWxvYWQpIHtcbiAgICAgICAgdGhpcy5mb2N1c0NvbXBvc2VyID0gdHJ1ZTtcblxuICAgICAgICBpZiAocm9vbUluZm8ucm9vbV9hbGlhcykge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhgU3dpdGNoaW5nIHRvIHJvb20gYWxpYXMgJHtyb29tSW5mby5yb29tX2FsaWFzfSBhdCBldmVudCAke3Jvb21JbmZvLmV2ZW50X2lkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhgU3dpdGNoaW5nIHRvIHJvb20gaWQgJHtyb29tSW5mby5yb29tX2lkfSBhdCBldmVudCAke3Jvb21JbmZvLmV2ZW50X2lkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2FpdCBmb3IgdGhlIGZpcnN0IHN5bmMgdG8gY29tcGxldGUgc28gdGhhdCBpZiBhIHJvb20gZG9lcyBoYXZlIGFuIGFsaWFzLFxuICAgICAgICAvLyBpdCB3b3VsZCBoYXZlIGJlZW4gcmV0cmlldmVkLlxuICAgICAgICBpZiAoIXRoaXMuZmlyc3RTeW5jQ29tcGxldGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5maXJzdFN5bmNQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0Nhbm5vdCB2aWV3IGEgcm9vbSBiZWZvcmUgZmlyc3Qgc3luYy4gcm9vbV9pZDonLCByb29tSW5mby5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmZpcnN0U3luY1Byb21pc2UucHJvbWlzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcmVzZW50ZWRJZCA9IHJvb21JbmZvLnJvb21fYWxpYXMgfHwgcm9vbUluZm8ucm9vbV9pZDtcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JbmZvLnJvb21faWQpO1xuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgLy8gTm90IGFsbCB0aW1lbGluZSBldmVudHMgYXJlIGRlY3J5cHRlZCBhaGVhZCBvZiB0aW1lIGFueW1vcmVcbiAgICAgICAgICAgIC8vIE9ubHkgdGhlIGNyaXRpY2FsIG9uZXMgZm9yIGEgdHlwaWNhbCBVSSBhcmVcbiAgICAgICAgICAgIC8vIFRoaXMgd2lsbCBzdGFydCB0aGUgZGVjcnlwdGlvbiBwcm9jZXNzIGZvciBhbGwgZXZlbnRzIHdoZW4gYVxuICAgICAgICAgICAgLy8gdXNlciB2aWV3cyBhIHJvb21cbiAgICAgICAgICAgIHJvb20uZGVjcnlwdEFsbEV2ZW50cygpO1xuICAgICAgICAgICAgY29uc3QgdGhlQWxpYXMgPSBSb29tcy5nZXREaXNwbGF5QWxpYXNGb3JSb29tKHJvb20pO1xuICAgICAgICAgICAgaWYgKHRoZUFsaWFzKSB7XG4gICAgICAgICAgICAgICAgcHJlc2VudGVkSWQgPSB0aGVBbGlhcztcbiAgICAgICAgICAgICAgICAvLyBTdG9yZSBkaXNwbGF5IGFsaWFzIG9mIHRoZSBwcmVzZW50ZWQgcm9vbSBpbiBjYWNoZSB0byBzcGVlZCBmdXR1cmVcbiAgICAgICAgICAgICAgICAvLyBuYXZpZ2F0aW9uLlxuICAgICAgICAgICAgICAgIHN0b3JlUm9vbUFsaWFzSW5DYWNoZSh0aGVBbGlhcywgcm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdG9yZSB0aGlzIGFzIHRoZSBJRCBvZiB0aGUgbGFzdCByb29tIGFjY2Vzc2VkLiBUaGlzIGlzIHNvIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAvLyBwZXJzaXN0IHdoaWNoIHJvb20gaXMgYmVpbmcgc3RvcmVkIGFjcm9zcyByZWZyZXNoZXMgYW5kIGJyb3dzZXIgcXVpdHMuXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2U/LnNldEl0ZW0oJ214X2xhc3Rfcm9vbV9pZCcsIHJvb20ucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIGFyZSByZWRpcmVjdGluZyB0byBhIFJvb20gQWxpYXMgYW5kIGl0IGlzIGZvciB0aGUgcm9vbSB3ZSBhbHJlYWR5IHNob3dpbmcgdGhlbiByZXBsYWNlIGhpc3RvcnkgaXRlbVxuICAgICAgICBsZXQgcmVwbGFjZUxhc3QgPSBwcmVzZW50ZWRJZFswXSA9PT0gXCIjXCIgJiYgcm9vbUluZm8ucm9vbV9pZCA9PT0gdGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkO1xuXG4gICAgICAgIGlmIChpc0xvY2FsUm9vbSh0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWQpKSB7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIGxvY2FsIHJvb20gaGlzdG9yeSBpdGVtc1xuICAgICAgICAgICAgcmVwbGFjZUxhc3QgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvb21JbmZvLnJvb21faWQgPT09IHRoaXMuc3RhdGUuY3VycmVudFJvb21JZCkge1xuICAgICAgICAgICAgLy8gaWYgd2UgYXJlIHJlLXZpZXdpbmcgdGhlIHNhbWUgcm9vbSB0aGVuIGNvcHkgYW55IHN0YXRlIHdlIGFscmVhZHkga25vd1xuICAgICAgICAgICAgcm9vbUluZm8udGhyZWVwaWRfaW52aXRlID0gcm9vbUluZm8udGhyZWVwaWRfaW52aXRlID8/IHRoaXMuc3RhdGUudGhyZWVwaWRJbnZpdGU7XG4gICAgICAgICAgICByb29tSW5mby5vb2JfZGF0YSA9IHJvb21JbmZvLm9vYl9kYXRhID8/IHRoaXMuc3RhdGUucm9vbU9vYkRhdGE7XG4gICAgICAgICAgICByb29tSW5mby5mb3JjZVRpbWVsaW5lID0gcm9vbUluZm8uZm9yY2VUaW1lbGluZSA/PyB0aGlzLnN0YXRlLmZvcmNlVGltZWxpbmU7XG4gICAgICAgICAgICByb29tSW5mby5qdXN0Q3JlYXRlZE9wdHMgPSByb29tSW5mby5qdXN0Q3JlYXRlZE9wdHMgPz8gdGhpcy5zdGF0ZS5yb29tSnVzdENyZWF0ZWRPcHRzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvb21JbmZvLmV2ZW50X2lkICYmIHJvb21JbmZvLmhpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICBwcmVzZW50ZWRJZCArPSBcIi9cIiArIHJvb21JbmZvLmV2ZW50X2lkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmlldzogVmlld3MuTE9HR0VEX0lOLFxuICAgICAgICAgICAgY3VycmVudFJvb21JZDogcm9vbUluZm8ucm9vbV9pZCB8fCBudWxsLFxuICAgICAgICAgICAgcGFnZV90eXBlOiBQYWdlVHlwZS5Sb29tVmlldyxcbiAgICAgICAgICAgIHRocmVlcGlkSW52aXRlOiByb29tSW5mby50aHJlZXBpZF9pbnZpdGUsXG4gICAgICAgICAgICByb29tT29iRGF0YTogcm9vbUluZm8ub29iX2RhdGEsXG4gICAgICAgICAgICBmb3JjZVRpbWVsaW5lOiByb29tSW5mby5mb3JjZVRpbWVsaW5lLFxuICAgICAgICAgICAgcmVhZHk6IHRydWUsXG4gICAgICAgICAgICByb29tSnVzdENyZWF0ZWRPcHRzOiByb29tSW5mby5qdXN0Q3JlYXRlZE9wdHMsXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdyb29tLycgKyBwcmVzZW50ZWRJZCwgcmVwbGFjZUxhc3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpZXdTb21ldGhpbmdCZWhpbmRNb2RhbCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmlldyAhPT0gVmlld3MuTE9HR0VEX0lOKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdXZWxjb21lKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWQgJiYgIXRoaXMuc3RhdGUuY3VycmVudFVzZXJJZCkge1xuICAgICAgICAgICAgdGhpcy52aWV3SG9tZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3V2VsY29tZSgpIHtcbiAgICAgICAgaWYgKHNob3VsZFVzZUxvZ2luRm9yV2VsY29tZShTZGtDb25maWcuZ2V0KCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3TG9naW4oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7XG4gICAgICAgICAgICB2aWV3OiBWaWV3cy5XRUxDT01FLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3dlbGNvbWUnKTtcbiAgICAgICAgVGhlbWVDb250cm9sbGVyLmlzTG9naW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3TG9naW4ob3RoZXJTdGF0ZT86IGFueSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7XG4gICAgICAgICAgICB2aWV3OiBWaWV3cy5MT0dJTixcbiAgICAgICAgICAgIC4uLm90aGVyU3RhdGUsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5vdGlmeU5ld1NjcmVlbignbG9naW4nKTtcbiAgICAgICAgVGhlbWVDb250cm9sbGVyLmlzTG9naW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3SG9tZShqdXN0UmVnaXN0ZXJlZCA9IGZhbHNlKSB7XG4gICAgICAgIC8vIFRoZSBob21lIHBhZ2UgcmVxdWlyZXMgdGhlIFwibG9nZ2VkIGluXCIgdmlldywgc28gd2UnbGwgc2V0IHRoYXQuXG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KHtcbiAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPR0dFRF9JTixcbiAgICAgICAgICAgIGp1c3RSZWdpc3RlcmVkLFxuICAgICAgICAgICAgY3VycmVudFJvb21JZDogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0UGFnZShQYWdlVHlwZS5Ib21lUGFnZSk7XG4gICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdob21lJyk7XG4gICAgICAgIFRoZW1lQ29udHJvbGxlci5pc0xvZ2luID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnJlY2hlY2soKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpZXdVc2VyKHVzZXJJZDogc3RyaW5nLCBzdWJBY3Rpb246IHN0cmluZykge1xuICAgICAgICAvLyBXYWl0IGZvciB0aGUgZmlyc3Qgc3luYyBzbyB0aGF0IGBnZXRSb29tYCBnaXZlcyB1cyBhIHJvb20gb2JqZWN0IGlmIGl0J3NcbiAgICAgICAgLy8gaW4gdGhlIHN5bmMgcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgd2FpdEZvclN5bmMgPSB0aGlzLmZpcnN0U3luY1Byb21pc2UgP1xuICAgICAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2UgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgd2FpdEZvclN5bmMudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3ViQWN0aW9uID09PSAnY2hhdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXRDcmVhdGVPclJldXNlKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3VzZXIvJyArIHVzZXJJZCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY3VycmVudFVzZXJJZDogdXNlcklkIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRQYWdlKFBhZ2VUeXBlLlVzZXJWaWV3KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3TGVnYWN5R3JvdXAoZ3JvdXBJZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KHtcbiAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPR0dFRF9JTixcbiAgICAgICAgICAgIGN1cnJlbnRSb29tSWQ6IG51bGwsXG4gICAgICAgICAgICBjdXJyZW50R3JvdXBJZDogZ3JvdXBJZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdncm91cC8nICsgZ3JvdXBJZCk7XG4gICAgICAgIHRoaXMuc2V0UGFnZShQYWdlVHlwZS5MZWdhY3lHcm91cFZpZXcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlUm9vbShkZWZhdWx0UHVibGljID0gZmFsc2UsIGRlZmF1bHROYW1lPzogc3RyaW5nLCB0eXBlPzogUm9vbVR5cGUpIHtcbiAgICAgICAgY29uc3QgbW9kYWwgPSBNb2RhbC5jcmVhdGVEaWFsb2coQ3JlYXRlUm9vbURpYWxvZywge1xuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGRlZmF1bHRQdWJsaWMsXG4gICAgICAgICAgICBkZWZhdWx0TmFtZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgW3Nob3VsZENyZWF0ZSwgb3B0c10gPSBhd2FpdCBtb2RhbC5maW5pc2hlZDtcbiAgICAgICAgaWYgKHNob3VsZENyZWF0ZSkge1xuICAgICAgICAgICAgY3JlYXRlUm9vbShvcHRzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hhdENyZWF0ZU9yUmV1c2UodXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc25ha2VkQ29uZmlnID0gbmV3IFNuYWtlZE9iamVjdDxJQ29uZmlnT3B0aW9ucz4odGhpcy5wcm9wcy5jb25maWcpO1xuICAgICAgICAvLyBVc2UgYSBkZWZlcnJlZCBhY3Rpb24gdG8gcmVzaG93IHRoZSBkaWFsb2cgb25jZSB0aGUgdXNlciBoYXMgcmVnaXN0ZXJlZFxuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgLy8gTm8gcG9pbnQgaW4gbWFraW5nIDIgRE1zIHdpdGggd2VsY29tZSBib3QuIFRoaXMgYXNzdW1lcyB2aWV3X3NldF9teGlkIHdpbGxcbiAgICAgICAgICAgIC8vIHJlc3VsdCBpbiBhIG5ldyBETSB3aXRoIHRoZSB3ZWxjb21lIHVzZXIuXG4gICAgICAgICAgICBpZiAodXNlcklkICE9PSBzbmFrZWRDb25maWcuZ2V0KFwid2VsY29tZV91c2VyX2lkXCIpKSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPERvQWZ0ZXJTeW5jUHJlcGFyZWRQYXlsb2FkPFZpZXdTdGFydENoYXRPclJldXNlUGF5bG9hZD4+KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uRG9BZnRlclN5bmNQcmVwYXJlZCxcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRfYWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3U3RhcnRDaGF0T3JSZXVzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nLFxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzZXRfbXhpZCBkaWFsb2cgaXMgY2FuY2VsbGVkLCB2aWV3IC93ZWxjb21lIGJlY2F1c2UgaWYgdGhlXG4gICAgICAgICAgICAgICAgLy8gYnJvd3NlciB3YXMgcG9pbnRpbmcgYXQgL3VzZXIvQHNvbWVvbmU6ZG9tYWluP2FjdGlvbj1jaGF0LCB0aGUgVVJMXG4gICAgICAgICAgICAgICAgLy8gbmVlZHMgdG8gYmUgcmVzZXQgc28gdGhhdCB0aGV5IGNhbiByZXZpc2l0IC91c2VyLy4uIC8vIChhbmQgdHJpZ2dlclxuICAgICAgICAgICAgICAgIC8vIGBfY2hhdENyZWF0ZU9yUmV1c2VgIGFnYWluKVxuICAgICAgICAgICAgICAgIGdvX3dlbGNvbWVfb25fY2FuY2VsOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNjcmVlbl9hZnRlcjoge1xuICAgICAgICAgICAgICAgICAgICBzY3JlZW46IGB1c2VyLyR7c25ha2VkQ29uZmlnLmdldChcIndlbGNvbWVfdXNlcl9pZFwiKX1gLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHsgYWN0aW9uOiAnY2hhdCcgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBJbW11dGFibGUgRE1zIHJlcGxhY2VzIHRoaXNcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGRtUm9vbU1hcCA9IG5ldyBETVJvb21NYXAoY2xpZW50KTtcbiAgICAgICAgY29uc3QgZG1Sb29tcyA9IGRtUm9vbU1hcC5nZXRETVJvb21zRm9yVXNlcklkKHVzZXJJZCk7XG5cbiAgICAgICAgaWYgKGRtUm9vbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IGRtUm9vbXNbMF0sXG4gICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IFwiTWVzc2FnZVVzZXJcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdzdGFydF9jaGF0JyxcbiAgICAgICAgICAgICAgICB1c2VyX2lkOiB1c2VySWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbGVhdmVSb29tV2FybmluZ3Mocm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgcm9vbVRvTGVhdmUgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICBjb25zdCBpc1NwYWNlID0gcm9vbVRvTGVhdmU/LmlzU3BhY2VSb29tKCk7XG4gICAgICAgIC8vIFNob3cgYSB3YXJuaW5nIGlmIHRoZXJlIGFyZSBhZGRpdGlvbmFsIGNvbXBsaWNhdGlvbnMuXG4gICAgICAgIGNvbnN0IHdhcm5pbmdzID0gW107XG5cbiAgICAgICAgY29uc3QgbWVtYmVyQ291bnQgPSByb29tVG9MZWF2ZS5jdXJyZW50U3RhdGUuZ2V0Sm9pbmVkTWVtYmVyQ291bnQoKTtcbiAgICAgICAgaWYgKG1lbWJlckNvdW50ID09PSAxKSB7XG4gICAgICAgICAgICB3YXJuaW5ncy5wdXNoKChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3YXJuaW5nXCIga2V5PVwib25seV9tZW1iZXJfd2FybmluZ1wiPlxuICAgICAgICAgICAgICAgICAgICB7ICcgJy8qIFdoaXRlc3BhY2UsIG90aGVyd2lzZSB0aGUgc2VudGVuY2VzIGdldCBzbWFzaGVkIHRvZ2V0aGVyICovIH1cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdSBhcmUgdGhlIG9ubHkgcGVyc29uIGhlcmUuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiSWYgeW91IGxlYXZlLCBubyBvbmUgd2lsbCBiZSBhYmxlIHRvIGpvaW4gaW4gdGhlIGZ1dHVyZSwgaW5jbHVkaW5nIHlvdS5cIikgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICByZXR1cm4gd2FybmluZ3M7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBqb2luUnVsZXMgPSByb29tVG9MZWF2ZS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5qb2luX3J1bGVzJywgJycpO1xuICAgICAgICBpZiAoam9pblJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gam9pblJ1bGVzLmdldENvbnRlbnQoKS5qb2luX3J1bGU7XG4gICAgICAgICAgICBpZiAocnVsZSAhPT0gXCJwdWJsaWNcIikge1xuICAgICAgICAgICAgICAgIHdhcm5pbmdzLnB1c2goKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3YXJuaW5nXCIga2V5PVwibm9uX3B1YmxpY193YXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ICcgJy8qIFdoaXRlc3BhY2UsIG90aGVyd2lzZSB0aGUgc2VudGVuY2VzIGdldCBzbWFzaGVkIHRvZ2V0aGVyICovIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaXNTcGFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJUaGlzIHNwYWNlIGlzIG5vdCBwdWJsaWMuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIHJlam9pbiB3aXRob3V0IGFuIGludml0ZS5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiVGhpcyByb29tIGlzIG5vdCBwdWJsaWMuIFlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIHJlam9pbiB3aXRob3V0IGFuIGludml0ZS5cIikgfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdhcm5pbmdzO1xuICAgIH1cblxuICAgIHByaXZhdGUgbGVhdmVSb29tKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHJvb21Ub0xlYXZlID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgY29uc3Qgd2FybmluZ3MgPSB0aGlzLmxlYXZlUm9vbVdhcm5pbmdzKHJvb21JZCk7XG5cbiAgICAgICAgY29uc3QgaXNTcGFjZSA9IHJvb21Ub0xlYXZlPy5pc1NwYWNlUm9vbSgpO1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBpc1NwYWNlID8gX3QoXCJMZWF2ZSBzcGFjZVwiKSA6IF90KFwiTGVhdmUgcm9vbVwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoXG4gICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIHsgaXNTcGFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsZWF2ZSB0aGUgc3BhY2UgJyUoc3BhY2VOYW1lKXMnP1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3BhY2VOYW1lOiByb29tVG9MZWF2ZS5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGxlYXZlIHRoZSByb29tICclKHJvb21OYW1lKXMnP1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcm9vbU5hbWU6IHJvb21Ub0xlYXZlLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICB7IHdhcm5pbmdzIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIkxlYXZlXCIpLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKHNob3VsZExlYXZlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExlYXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlYXZlUm9vbUJlaGF2aW91cihyb29tSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxBZnRlckxlYXZlUm9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkFmdGVyTGVhdmVSb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZvcmdldFJvb20ocm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5mb3JnZXQocm9vbUlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFN3aXRjaCB0byBob21lIHBhZ2UgaWYgd2UncmUgY3VycmVudGx5IHZpZXdpbmcgdGhlIGZvcmdvdHRlbiByb29tXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkID09PSByb29tSWQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IEFjdGlvbi5WaWV3SG9tZVBhZ2UgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gbWFudWFsbHkgdXBkYXRlIHRoZSByb29tIGxpc3QgYmVjYXVzZSB0aGUgZm9yZ290dGVuIHJvb20gd2lsbCBub3RcbiAgICAgICAgICAgIC8vIGJlIG5vdGlmaWVkIHRvIHVzLCB0aGVyZWZvcmUgdGhlIHJvb20gbGlzdCB3aWxsIGhhdmUgbm8gb3RoZXIgd2F5IG9mIGtub3dpbmdcbiAgICAgICAgICAgIC8vIHRoZSByb29tIGlzIGZvcmdvdHRlbi5cbiAgICAgICAgICAgIFJvb21MaXN0U3RvcmUuaW5zdGFuY2UubWFudWFsUm9vbVVwZGF0ZShyb29tLCBSb29tVXBkYXRlQ2F1c2UuUm9vbVJlbW92ZWQpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlcnJDb2RlID0gZXJyLmVycmNvZGUgfHwgX3RkKFwidW5rbm93biBlcnJvciBjb2RlXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIGZvcmdldCByb29tICUoZXJyQ29kZSlzXCIsIHsgZXJyQ29kZSB9KSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY29weVJvb20ocm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgcm9vbUxpbmsgPSBtYWtlUm9vbVBlcm1hbGluayhyb29tSWQpO1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgY29weVBsYWludGV4dChyb29tTGluayk7XG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIGNvcHkgcm9vbSBsaW5rXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlVuYWJsZSB0byBjb3B5IGEgbGluayB0byB0aGUgcm9vbSB0byB0aGUgY2xpcGJvYXJkLlwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnRzIGEgY2hhdCB3aXRoIHRoZSB3ZWxjb21lIHVzZXIsIGlmIHRoZSB1c2VyIGRvZXNuJ3QgYWxyZWFkeSBoYXZlIG9uZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSByb29tIElEIG9mIHRoZSBuZXcgcm9vbSwgb3IgbnVsbCBpZiBubyByb29tIHdhcyBjcmVhdGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBzdGFydFdlbGNvbWVVc2VyQ2hhdCgpIHtcbiAgICAgICAgLy8gV2UgY2FuIGVuZCB1cCB3aXRoIG11bHRpcGxlIHRhYnMgcG9zdC1yZWdpc3RyYXRpb24gd2hlcmUgdGhlIHVzZXJcbiAgICAgICAgLy8gbWlnaHQgdGhlbiBlbmQgdXAgd2l0aCBhIHNlc3Npb24gYW5kIHdlIGRvbid0IHdhbnQgdGhlbSBhbGwgbWFraW5nXG4gICAgICAgIC8vIGEgY2hhdCB3aXRoIHRoZSB3ZWxjb21lIHVzZXI6IHRyeSB0byBkZS1kdXBlLlxuICAgICAgICAvLyBXZSBuZWVkIHRvIHdhaXQgZm9yIHRoZSBmaXJzdCBzeW5jIHRvIGNvbXBsZXRlIGZvciB0aGlzIHRvXG4gICAgICAgIC8vIHdvcmsgdGhvdWdoLlxuICAgICAgICBsZXQgd2FpdEZvcjtcbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0U3luY0NvbXBsZXRlKSB7XG4gICAgICAgICAgICB3YWl0Rm9yID0gdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YWl0Rm9yID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgd2FpdEZvcjtcblxuICAgICAgICBjb25zdCBzbmFrZWRDb25maWcgPSBuZXcgU25ha2VkT2JqZWN0PElDb25maWdPcHRpb25zPih0aGlzLnByb3BzLmNvbmZpZyk7XG4gICAgICAgIGNvbnN0IHdlbGNvbWVVc2VyUm9vbXMgPSBETVJvb21NYXAuc2hhcmVkKCkuZ2V0RE1Sb29tc0ZvclVzZXJJZChcbiAgICAgICAgICAgIHNuYWtlZENvbmZpZy5nZXQoXCJ3ZWxjb21lX3VzZXJfaWRcIiksXG4gICAgICAgICk7XG4gICAgICAgIGlmICh3ZWxjb21lVXNlclJvb21zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gYXdhaXQgY3JlYXRlUm9vbSh7XG4gICAgICAgICAgICAgICAgZG1Vc2VySWQ6IHNuYWtlZENvbmZpZy5nZXQoXCJ3ZWxjb21lX3VzZXJfaWRcIiksXG4gICAgICAgICAgICAgICAgLy8gT25seSB2aWV3IHRoZSB3ZWxjb21lIHVzZXIgaWYgd2UncmUgTk9UIGxvb2tpbmcgYXQgYSByb29tXG4gICAgICAgICAgICAgICAgYW5kVmlldzogIXRoaXMuc3RhdGUuY3VycmVudFJvb21JZCxcbiAgICAgICAgICAgICAgICBzcGlubmVyOiBmYWxzZSwgLy8gd2UncmUgYWxyZWFkeSBzaG93aW5nIG9uZTogd2UgZG9uJ3QgbmVlZCBhbm90aGVyIG9uZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgYml0IG9mIGEgaGFjaywgYnV0IHNpbmNlIHRoZSBkZWR1cGxpY2F0aW9uIHJlbGllc1xuICAgICAgICAgICAgLy8gb24gbS5kaXJlY3QgYmVpbmcgdXAgdG8gZGF0ZSwgd2UgbmVlZCB0byBmb3JjZSBhIHN5bmNcbiAgICAgICAgICAgIC8vIG9mIHRoZSBkYXRhYmFzZSwgb3RoZXJ3aXNlIGlmIHRoZSB1c2VyIGdvZXMgdG8gdGhlIG90aGVyXG4gICAgICAgICAgICAvLyB0YWIgYmVmb3JlIHRoZSBuZXh0IHNhdmUgaGFwcGVucyAoYSBmZXcgbWludXRlcyksIHRoZVxuICAgICAgICAgICAgLy8gc2F2ZWQgc3luYyB3aWxsIGJlIHJlc3RvcmVkIGZyb20gdGhlIGRiIGFuZCB0aGlzIGNvZGUgd2lsbFxuICAgICAgICAgICAgLy8gcnVuIHdpdGhvdXQgdGhlIHVwZGF0ZSB0byBtLmRpcmVjdCwgbWFraW5nIGFub3RoZXIgd2VsY29tZVxuICAgICAgICAgICAgLy8gdXNlciByb29tIChpdCBkb2Vzbid0IHdhaXQgZm9yIG5ldyBkYXRhIGZyb20gdGhlIHNlcnZlciwganVzdFxuICAgICAgICAgICAgLy8gdGhlIHNhdmVkIHN5bmMgdG8gYmUgbG9hZGVkKS5cbiAgICAgICAgICAgIGNvbnN0IHNhdmVXZWxjb21lVXNlciA9IChldjogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpID09PSBFdmVudFR5cGUuRGlyZWN0ICYmIGV2LmdldENvbnRlbnQoKVtzbmFrZWRDb25maWcuZ2V0KFwid2VsY29tZV91c2VyX2lkXCIpXSkge1xuICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcmUuc2F2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKENsaWVudEV2ZW50LkFjY291bnREYXRhLCBzYXZlV2VsY29tZVVzZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oQ2xpZW50RXZlbnQuQWNjb3VudERhdGEsIHNhdmVXZWxjb21lVXNlcik7XG5cbiAgICAgICAgICAgIHJldHVybiByb29tSWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gYSBuZXcgbG9nZ2VkIGluIHNlc3Npb24gaGFzIHN0YXJ0ZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIG9uTG9nZ2VkSW4oKSB7XG4gICAgICAgIFRoZW1lQ29udHJvbGxlci5pc0xvZ2luID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnJlY2hlY2soKTtcbiAgICAgICAgU3RvcmFnZU1hbmFnZXIudHJ5UGVyc2lzdFN0b3JhZ2UoKTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuY3VycmVudFVzZXJJc0p1c3RSZWdpc3RlcmVkKCkgJiZcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJGVFVFLnVzZUNhc2VTZWxlY3Rpb25cIikgPT09IG51bGxcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7IHZpZXc6IFZpZXdzLlVTRV9DQVNFX1NFTEVDVElPTiB9KTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuIHRvIGNoYW5nZXMgaW4gc2V0dGluZ3MgYW5kIGhpZGUgdGhlIHVzZSBjYXNlIHNjcmVlbiBpZiBhcHByb3ByaWF0ZSAtIHRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2VcbiAgICAgICAgICAgIC8vIGFjY291bnQgc2V0dGluZ3MgY2FuIHN0aWxsIGJlIGNoYW5naW5nIGF0IHRoaXMgcG9pbnQgaW4gYXBwIGluaXQgKGR1ZSB0byB0aGUgaW5pdGlhbCBzeW5jIGJlaW5nIGNhY2hlZCxcbiAgICAgICAgICAgIC8vIHRoZW4gc3Vic2VxdWVudCBzeW5jcyBiZWluZyByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXIpXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhpcyBzZWVtcyB1bmxpa2VseSBmb3Igc29tZXRoaW5nIHRoYXQgc2hvdWxkIGhhcHBlbiBkaXJlY3RseSBhZnRlciByZWdpc3RyYXRpb24sIGJ1dCBpZiBhIHVzZXIgZG9lc1xuICAgICAgICAgICAgLy8gdGhlaXIgaW5pdGlhbCBsb2dpbiBvbiBhbm90aGVyIGRldmljZS9icm93c2VyIHRoYW4gdGhleSByZWdpc3RlcmVkIG9uLCB3ZSB3YW50IHRvIGF2b2lkIGFza2luZyB0aGlzXG4gICAgICAgICAgICAvLyBxdWVzdGlvbiB0d2ljZVxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGluaXRQb3N0aG9nQW5hbHl0aWNzVG9hc3QgcGlvbmVlcmVkIHRoaXMgdGVjaG5pcXVlLCB3ZeKAmXJlIGp1c3QgcmV1c2luZyBpdCBoZXJlLlxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJGVFVFLnVzZUNhc2VTZWxlY3Rpb25cIiwgbnVsbCxcbiAgICAgICAgICAgICAgICAob3JpZ2luYWxTZXR0aW5nTmFtZSwgY2hhbmdlZEluUm9vbUlkLCBhdExldmVsLCBuZXdWYWx1ZUF0TGV2ZWwsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZSAhPT0gbnVsbCAmJiB0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLlVTRV9DQVNFX1NFTEVDVElPTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNob3dQb3N0TG9naW5TY3JlZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub25TaG93UG9zdExvZ2luU2NyZWVuKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIG9uU2hvd1Bvc3RMb2dpblNjcmVlbih1c2VDYXNlPzogVXNlQ2FzZSkge1xuICAgICAgICBpZiAodXNlQ2FzZSkge1xuICAgICAgICAgICAgUG9zdGhvZ0FuYWx5dGljcy5pbnN0YW5jZS5zZXRQcm9wZXJ0eShcImZ0dWVVc2VDYXNlU2VsZWN0aW9uXCIsIHVzZUNhc2UpO1xuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcIkZUVUUudXNlQ2FzZVNlbGVjdGlvblwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgdXNlQ2FzZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7IHZpZXc6IFZpZXdzLkxPR0dFRF9JTiB9KTtcbiAgICAgICAgLy8gSWYgYSBzcGVjaWZpYyBzY3JlZW4gaXMgc2V0IHRvIGJlIHNob3duIGFmdGVyIGxvZ2luLCBzaG93IHRoYXQgYWJvdmVcbiAgICAgICAgLy8gYWxsIGVsc2UsIGFzIGl0IHByb2JhYmx5IG1lYW5zIHRoZSB1c2VyIGNsaWNrZWQgb24gc29tZXRoaW5nIGFscmVhZHkuXG4gICAgICAgIGlmICh0aGlzLnNjcmVlbkFmdGVyTG9naW4gJiYgdGhpcy5zY3JlZW5BZnRlckxvZ2luLnNjcmVlbikge1xuICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuKFxuICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW4sXG4gICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luLnBhcmFtcyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4gPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKE1hdHJpeENsaWVudFBlZy5jdXJyZW50VXNlcklzSnVzdFJlZ2lzdGVyZWQoKSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLnNldEp1c3RSZWdpc3RlcmVkVXNlcklkKG51bGwpO1xuXG4gICAgICAgICAgICBjb25zdCBzbmFrZWRDb25maWcgPSBuZXcgU25ha2VkT2JqZWN0PElDb25maWdPcHRpb25zPih0aGlzLnByb3BzLmNvbmZpZyk7XG4gICAgICAgICAgICBpZiAoc25ha2VkQ29uZmlnLmdldChcIndlbGNvbWVfdXNlcl9pZFwiKSAmJiBnZXRDdXJyZW50TGFuZ3VhZ2UoKS5zdGFydHNXaXRoKFwiZW5cIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3ZWxjb21lVXNlclJvb20gPSBhd2FpdCB0aGlzLnN0YXJ0V2VsY29tZVVzZXJDaGF0KCk7XG4gICAgICAgICAgICAgICAgaWYgKHdlbGNvbWVVc2VyUm9vbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBkaWRuJ3QgcmVkaXJlY3QgdG8gdGhlIHdlbGNvbWUgdXNlciByb29tLCBzbyBzaG93XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBob21lcGFnZS5cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdIb21lUGFnZVBheWxvYWQ+KHsgYWN0aW9uOiBBY3Rpb24uVmlld0hvbWVQYWdlLCBqdXN0UmVnaXN0ZXJlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UucGlja0Jlc3RJbnZpdGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSB1c2VyIGhhcyBhIDNwaWQgaW52aXRlIHBlbmRpbmcgLSBzaG93IHRoZW0gdGhhdFxuICAgICAgICAgICAgICAgIGNvbnN0IHRocmVlcGlkSW52aXRlID0gVGhyZWVwaWRJbnZpdGVTdG9yZS5pbnN0YW5jZS5waWNrQmVzdEludml0ZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gSEFDSzogVGhpcyBpcyBhIHByZXR0eSBicnV0YWwgd2F5IG9mIHRocmVhZGluZyB0aGUgaW52aXRlIGJhY2sgdGhyb3VnaFxuICAgICAgICAgICAgICAgIC8vIG91ciBzeXN0ZW1zLCBidXQgaXQncyB0aGUgc2FmZXN0IHdlIGhhdmUgZm9yIG5vdy5cbiAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnRyYW5zbGF0ZVRvV2lyZUZvcm1hdCh0aHJlZXBpZEludml0ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuKGByb29tLyR7dGhyZWVwaWRJbnZpdGUucm9vbUlkfWAsIHBhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoZSB1c2VyIGhhcyBqdXN0IGxvZ2dlZCBpbiBhZnRlciByZWdpc3RlcmluZyxcbiAgICAgICAgICAgICAgICAvLyBzbyBzaG93IHRoZSBob21lcGFnZS5cbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld0hvbWVQYWdlUGF5bG9hZD4oeyBhY3Rpb246IEFjdGlvbi5WaWV3SG9tZVBhZ2UsIGp1c3RSZWdpc3RlcmVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuQWZ0ZXJMb2dpbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFNka0NvbmZpZy5nZXQoXCJtb2JpbGVfZ3VpZGVfdG9hc3RcIikpIHtcbiAgICAgICAgICAgIC8vIFRoZSB0b2FzdCBjb250YWlucyBmdXJ0aGVyIGxvZ2ljIHRvIGRldGVjdCBtb2JpbGUgcGxhdGZvcm1zLFxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgaXQgaGFzIGJlZW4gZGlzbWlzc2VkIGJlZm9yZSwgZXRjLlxuICAgICAgICAgICAgc2hvd01vYmlsZUd1aWRlVG9hc3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdFBvc3Rob2dBbmFseXRpY3NUb2FzdCgpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgYW5hbHl0aWNzIHRvYXN0IGlmIG5lY2Vzc2FyeVxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInBzZXVkb255bW91c0FuYWx5dGljc09wdEluXCIpID09PSBudWxsKSB7XG4gICAgICAgICAgICBzaG93QW5hbHl0aWNzVG9hc3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExpc3RlbiB0byBjaGFuZ2VzIGluIHNldHRpbmdzIGFuZCBzaG93IHRoZSB0b2FzdCBpZiBhcHByb3ByaWF0ZSAtIHRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYWNjb3VudFxuICAgICAgICAvLyBzZXR0aW5ncyBjYW4gc3RpbGwgYmUgY2hhbmdpbmcgYXQgdGhpcyBwb2ludCBpbiBhcHAgaW5pdCAoZHVlIHRvIHRoZSBpbml0aWFsIHN5bmMgYmVpbmcgY2FjaGVkLCB0aGVuXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgc3luY3MgYmVpbmcgcmVjZWl2ZWQgZnJvbSB0aGUgc2VydmVyKVxuICAgICAgICBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcInBzZXVkb255bW91c0FuYWx5dGljc09wdEluXCIsIG51bGwsXG4gICAgICAgICAgICAob3JpZ2luYWxTZXR0aW5nTmFtZSwgY2hhbmdlZEluUm9vbUlkLCBhdExldmVsLCBuZXdWYWx1ZUF0TGV2ZWwsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dBbmFseXRpY3NUb2FzdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEl0J3MgcG9zc2libGUgZm9yIHRoZSB2YWx1ZSB0byBjaGFuZ2UgaWYgYSBjYWNoZWQgc3luYyBsb2FkcyBhdCBwYWdlIGxvYWQsIGJ1dCB0aGVuIG5ldHdvcmtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3luYyBjb250YWlucyBhIG5ldyB2YWx1ZSBvZiB0aGUgZmxhZyB3aXRoIGl0IHNldCB0byBmYWxzZSAoZS5nLiBhbm90aGVyIGRldmljZSBzZXQgaXQgc2luY2UgbGFzdFxuICAgICAgICAgICAgICAgICAgICAvLyBsb2FkaW5nIHRoZSBwYWdlKTsgc28gaGlkZSB0aGUgdG9hc3QuXG4gICAgICAgICAgICAgICAgICAgIC8vICh0aGlzIGZsaXBwaW5nIHVzdWFsbHkgaGFwcGVucyBiZWZvcmUgZmlyc3QgcmVuZGVyIHNvIHRoZSB1c2VyIHdvbid0IG5vdGljZSBpdDsgYW55d2F5IGZsaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gb24vb2ZmIGlzIHByb2JhYmx5IGJldHRlciB0aGFuIHNob3dpbmcgdGhlIHRvYXN0IGFnYWluIHdoZW4gdGhlIHVzZXIgYWxyZWFkeSBkaXNtaXNzZWQgaXQpXG4gICAgICAgICAgICAgICAgICAgIGhpZGVBbmFseXRpY3NUb2FzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd1NjcmVlbkFmdGVyTG9naW4oKSB7XG4gICAgICAgIC8vIElmIHNjcmVlbkFmdGVyTG9naW4gaXMgc2V0LCB1c2UgdGhhdCwgdGhlbiBudWxsIGl0IHNvIHRoYXQgYSBzZWNvbmQgbG9naW4gd2lsbFxuICAgICAgICAvLyByZXN1bHQgaW4gdmlld19ob21lX3BhZ2UsIF91c2VyX3NldHRpbmdzIG9yIF9yb29tX2RpcmVjdG9yeVxuICAgICAgICBpZiAodGhpcy5zY3JlZW5BZnRlckxvZ2luICYmIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW4pIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NjcmVlbihcbiAgICAgICAgICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4uc2NyZWVuLFxuICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5wYXJhbXMsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChsb2NhbFN0b3JhZ2UgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ214X2xhc3Rfcm9vbV9pZCcpKSB7XG4gICAgICAgICAgICAvLyBCZWZvcmUgZGVmYXVsdGluZyB0byBkaXJlY3RvcnksIHNob3cgdGhlIGxhc3Qgdmlld2VkIHJvb21cbiAgICAgICAgICAgIHRoaXMudmlld0xhc3RSb29tKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3ZpZXdfd2VsY29tZV9wYWdlJyB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBBY3Rpb24uVmlld0hvbWVQYWdlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3TGFzdFJvb20oKSB7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgcm9vbV9pZDogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ214X2xhc3Rfcm9vbV9pZCcpLFxuICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IHVuZGVmaW5lZCwgLy8gb3RoZXJcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIHNlc3Npb24gaXMgbG9nZ2VkIG91dFxuICAgICAqL1xuICAgIHByaXZhdGUgb25Mb2dnZWRPdXQoKSB7XG4gICAgICAgIHRoaXMudmlld0xvZ2luKHtcbiAgICAgICAgICAgIHJlYWR5OiBmYWxzZSxcbiAgICAgICAgICAgIGNvbGxhcHNlTGhzOiBmYWxzZSxcbiAgICAgICAgICAgIGN1cnJlbnRSb29tSWQ6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN1YlRpdGxlU3RhdHVzID0gJyc7XG4gICAgICAgIHRoaXMuc2V0UGFnZVN1YnRpdGxlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIHNlc3Npb24gaXMgc29mdGx5IGxvZ2dlZCBvdXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uU29mdExvZ291dCgpIHtcbiAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3NvZnRfbG9nb3V0Jyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KHtcbiAgICAgICAgICAgIHZpZXc6IFZpZXdzLlNPRlRfTE9HT1VULFxuICAgICAgICAgICAgcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgY29sbGFwc2VMaHM6IGZhbHNlLFxuICAgICAgICAgICAgY3VycmVudFJvb21JZDogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3ViVGl0bGVTdGF0dXMgPSAnJztcbiAgICAgICAgdGhpcy5zZXRQYWdlU3VidGl0bGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQganVzdCBiZWZvcmUgdGhlIG1hdHJpeCBjbGllbnQgaXMgc3RhcnRlZFxuICAgICAqICh1c2VmdWwgZm9yIHNldHRpbmcgbGlzdGVuZXJzKVxuICAgICAqL1xuICAgIHByaXZhdGUgb25XaWxsU3RhcnRDbGllbnQoKSB7XG4gICAgICAgIC8vIHJlc2V0IHRoZSAnaGF2ZSBjb21wbGV0ZWQgZmlyc3Qgc3luYycgZmxhZyxcbiAgICAgICAgLy8gc2luY2Ugd2UncmUgYWJvdXQgdG8gc3RhcnQgdGhlIGNsaWVudCBhbmQgdGhlcmVmb3JlIGFib3V0XG4gICAgICAgIC8vIHRvIGRvIHRoZSBmaXJzdCBzeW5jXG4gICAgICAgIHRoaXMuZmlyc3RTeW5jQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlID0gZGVmZXIoKTtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIC8vIEFsbG93IHRoZSBKUyBTREsgdG8gcmVhcCB0aW1lbGluZSBldmVudHMuIFRoaXMgcmVkdWNlcyB0aGUgYW1vdW50IG9mXG4gICAgICAgIC8vIG1lbW9yeSBjb25zdW1lZCBhcyB0aGUgSlMgU0RLIHN0b3JlcyBtdWx0aXBsZSBkaXN0aW5jdCBjb3BpZXMgb2Ygcm9vbVxuICAgICAgICAvLyBzdGF0ZSAoZWFjaCBvZiB3aGljaCBjYW4gYmUgMTBzIG9mIE1CcykgZm9yIGVhY2ggRElTSk9JTlQgdGltZWxpbmUuIFRoaXMgaXNcbiAgICAgICAgLy8gcGFydGljdWxhcmx5IG5vdGljZWFibGUgd2hlbiB0aGVyZSBhcmUgbG90cyBvZiAnbGltaXRlZCcgL3N5bmMgcmVzcG9uc2VzXG4gICAgICAgIC8vIHN1Y2ggYXMgd2hlbiBsYXB0b3BzIHVuc2xlZXAuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzMzMDcjaXNzdWVjb21tZW50LTI4Mjg5NTU2OFxuICAgICAgICBjbGkuc2V0Q2FuUmVzZXRUaW1lbGluZUNhbGxiYWNrKChyb29tSWQpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJSZXF1ZXN0IHRvIHJlc2V0IHRpbWVsaW5lIGluIHJvb20gXCIsIHJvb21JZCwgXCIgdmlld2luZzpcIiwgdGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkKTtcbiAgICAgICAgICAgIGlmIChyb29tSWQgIT09IHRoaXMuc3RhdGUuY3VycmVudFJvb21JZCkge1xuICAgICAgICAgICAgICAgIC8vIEl0IGlzIHNhZmUgdG8gcmVtb3ZlIGV2ZW50cyBmcm9tIHJvb21zIHdlIGFyZSBub3Qgdmlld2luZy5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlIGFyZSB2aWV3aW5nIHRoZSByb29tIHdoaWNoIHdlIHdhbnQgdG8gcmVzZXQuIEl0IGlzIG9ubHkgc2FmZSB0byBkb1xuICAgICAgICAgICAgLy8gdGhpcyBpZiB3ZSBhcmUgbm90IHNjcm9sbGVkIHVwIGluIHRoZSB2aWV3LiBUbyBmaW5kIG91dCwgZGVsZWdhdGUgdG9cbiAgICAgICAgICAgIC8vIHRoZSB0aW1lbGluZSBwYW5lbC4gSWYgdGhlIHRpbWVsaW5lIHBhbmVsIGRvZXNuJ3QgZXhpc3QsIHRoZW4gd2UgYXNzdW1lXG4gICAgICAgICAgICAvLyBpdCBpcyBzYWZlIHRvIHJlc2V0IHRoZSB0aW1lbGluZS5cbiAgICAgICAgICAgIGlmICghdGhpcy5sb2dnZWRJblZpZXcuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9nZ2VkSW5WaWV3LmN1cnJlbnQuY2FuUmVzZXRUaW1lbGluZUluUm9vbShyb29tSWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjbGkub24oQ2xpZW50RXZlbnQuU3luYywgKHN0YXRlOiBTeW5jU3RhdGUsIHByZXZTdGF0ZT86IFN5bmNTdGF0ZSwgZGF0YT86IElTeW5jU3RhdGVEYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFN5bmNTdGF0ZS5FcnJvciB8fCBzdGF0ZSA9PT0gU3luY1N0YXRlLlJlY29ubmVjdGluZykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmVycm9yIGluc3RhbmNlb2YgSW52YWxpZFN0b3JlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgTGlmZWN5Y2xlLmhhbmRsZUludmFsaWRTdG9yZUVycm9yKGRhdGEuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc3luY0Vycm9yOiBkYXRhLmVycm9yIHx8IHt9IGFzIE1hdHJpeEVycm9yIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnN5bmNFcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzeW5jRXJyb3I6IG51bGwgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gU3luY1N0YXRlLlN5bmNpbmcgJiYgcHJldlN0YXRlID09PSBTeW5jU3RhdGUuU3luY2luZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwiTWF0cml4Q2xpZW50IHN5bmMgc3RhdGUgPT4gJXNcIiwgc3RhdGUpO1xuICAgICAgICAgICAgaWYgKHN0YXRlICE9PSBTeW5jU3RhdGUuUHJlcGFyZWQpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgIHRoaXMuZmlyc3RTeW5jQ29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICAgICAgaWYgKE5vdGlmaWVyLnNob3VsZFNob3dQcm9tcHQoKSAmJiAhTWF0cml4Q2xpZW50UGVnLnVzZXJSZWdpc3RlcmVkV2l0aGluTGFzdEhvdXJzKDI0KSkge1xuICAgICAgICAgICAgICAgIHNob3dOb3RpZmljYXRpb25zVG9hc3QoZmFsc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNTZW5kTWVzc2FnZUNvbXBvc2VyKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlYWR5OiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNsaS5vbihIdHRwQXBpRXZlbnQuU2Vzc2lvbkxvZ2dlZE91dCwgZnVuY3Rpb24oZXJyT2JqKSB7XG4gICAgICAgICAgICBpZiAoTGlmZWN5Y2xlLmlzTG9nZ2luZ091dCgpKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIEEgbW9kYWwgbWlnaHQgaGF2ZSBiZWVuIG9wZW4gd2hlbiB3ZSB3ZXJlIGxvZ2dlZCBvdXQgYnkgdGhlIHNlcnZlclxuICAgICAgICAgICAgTW9kYWwuY2xvc2VDdXJyZW50TW9kYWwoJ1Nlc3Npb24ubG9nZ2VkX291dCcpO1xuXG4gICAgICAgICAgICBpZiAoZXJyT2JqLmh0dHBTdGF0dXMgPT09IDQwMSAmJiBlcnJPYmouZGF0YSAmJiBlcnJPYmouZGF0YVsnc29mdF9sb2dvdXQnXSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiU29mdCBsb2dvdXQgaXNzdWVkIGJ5IHNlcnZlciAtIGF2b2lkaW5nIGRhdGEgZGVsZXRpb25cIik7XG4gICAgICAgICAgICAgICAgTGlmZWN5Y2xlLnNvZnRMb2dvdXQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnU2lnbmVkIE91dCcpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnRm9yIHNlY3VyaXR5LCB0aGlzIHNlc3Npb24gaGFzIGJlZW4gc2lnbmVkIG91dC4gUGxlYXNlIHNpZ24gaW4gYWdhaW4uJyksXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdsb2dvdXQnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjbGkub24oSHR0cEFwaUV2ZW50Lk5vQ29uc2VudCwgZnVuY3Rpb24obWVzc2FnZSwgY29uc2VudFVyaSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdUZXJtcyBhbmQgQ29uZGl0aW9ucycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cD4geyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICdUbyBjb250aW51ZSB1c2luZyB0aGUgJShob21lc2VydmVyRG9tYWluKXMgaG9tZXNlcnZlciAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICd5b3UgbXVzdCByZXZpZXcgYW5kIGFncmVlIHRvIG91ciB0ZXJtcyBhbmQgY29uZGl0aW9ucy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBob21lc2VydmVyRG9tYWluOiBjbGkuZ2V0RG9tYWluKCkgfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdCgnUmV2aWV3IHRlcm1zIGFuZCBjb25kaXRpb25zJyksXG4gICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uOiBfdCgnRGlzbWlzcycpLFxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IChjb25maXJtZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd25kID0gd2luZG93Lm9wZW4oY29uc2VudFVyaSwgJ19ibGFuaycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd25kLm9wZW5lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRmdCA9IERlY3J5cHRpb25GYWlsdXJlVHJhY2tlci5pbnN0YW5jZTtcblxuICAgICAgICAvLyBTaGVsdmVkIGZvciBsYXRlciBkYXRlIHdoZW4gd2UgaGF2ZSB0aW1lIHRvIHRoaW5rIGFib3V0IHBlcnNpc3RpbmcgaGlzdG9yeSBvZlxuICAgICAgICAvLyB0cmFja2VkIGV2ZW50cyBhY3Jvc3Mgc2Vzc2lvbnMuXG4gICAgICAgIC8vIGRmdC5sb2FkVHJhY2tlZEV2ZW50SGFzaE1hcCgpO1xuXG4gICAgICAgIGRmdC5zdGFydCgpO1xuXG4gICAgICAgIC8vIFdoZW4gbG9nZ2luZyBvdXQsIHN0b3AgdHJhY2tpbmcgZmFpbHVyZXMgYW5kIGRlc3Ryb3kgc3RhdGVcbiAgICAgICAgY2xpLm9uKEh0dHBBcGlFdmVudC5TZXNzaW9uTG9nZ2VkT3V0LCAoKSA9PiBkZnQuc3RvcCgpKTtcbiAgICAgICAgY2xpLm9uKE1hdHJpeEV2ZW50RXZlbnQuRGVjcnlwdGVkLCAoZSwgZXJyKSA9PiBkZnQuZXZlbnREZWNyeXB0ZWQoZSwgZXJyIGFzIERlY3J5cHRpb25FcnJvcikpO1xuXG4gICAgICAgIGNsaS5vbihDbGllbnRFdmVudC5Sb29tLCAocm9vbSkgPT4ge1xuICAgICAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0NyeXB0b0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsYWNrbGlzdEVuYWJsZWQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoXG4gICAgICAgICAgICAgICAgICAgIFNldHRpbmdMZXZlbC5ST09NX0RFVklDRSxcbiAgICAgICAgICAgICAgICAgICAgXCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiLFxuICAgICAgICAgICAgICAgICAgICByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgLypleHBsaWNpdD0qL3RydWUsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByb29tLnNldEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzKGJsYWNrbGlzdEVuYWJsZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2xpLm9uKENyeXB0b0V2ZW50Lldhcm5pbmcsICh0eXBlKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdDUllQVE9fV0FSTklOR19PTERfVkVSU0lPTl9ERVRFQ1RFRCc6XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdPbGQgY3J5cHRvZ3JhcGh5IGRhdGEgZGV0ZWN0ZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkRhdGEgZnJvbSBhbiBvbGRlciB2ZXJzaW9uIG9mICUoYnJhbmQpcyBoYXMgYmVlbiBkZXRlY3RlZC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyB3aWxsIGhhdmUgY2F1c2VkIGVuZC10by1lbmQgY3J5cHRvZ3JhcGh5IHRvIG1hbGZ1bmN0aW9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluIHRoZSBvbGRlciB2ZXJzaW9uLiBFbmQtdG8tZW5kIGVuY3J5cHRlZCBtZXNzYWdlcyBleGNoYW5nZWQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVjZW50bHkgd2hpbHN0IHVzaW5nIHRoZSBvbGRlciB2ZXJzaW9uIG1heSBub3QgYmUgZGVjcnlwdGFibGUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW4gdGhpcyB2ZXJzaW9uLiBUaGlzIG1heSBhbHNvIGNhdXNlIG1lc3NhZ2VzIGV4Y2hhbmdlZCB3aXRoIHRoaXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmVyc2lvbiB0byBmYWlsLiBJZiB5b3UgZXhwZXJpZW5jZSBwcm9ibGVtcywgbG9nIG91dCBhbmQgYmFjayBpbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhZ2Fpbi4gVG8gcmV0YWluIG1lc3NhZ2UgaGlzdG9yeSwgZXhwb3J0IGFuZCByZS1pbXBvcnQgeW91ciBrZXlzLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYnJhbmQ6IFNka0NvbmZpZy5nZXQoKS5icmFuZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2xpLm9uKENyeXB0b0V2ZW50LktleUJhY2t1cEZhaWxlZCwgYXN5bmMgKGVycmNvZGUpID0+IHtcbiAgICAgICAgICAgIGxldCBoYXZlTmV3VmVyc2lvbjtcbiAgICAgICAgICAgIGxldCBuZXdWZXJzaW9uSW5mbztcbiAgICAgICAgICAgIC8vIGlmIGtleSBiYWNrdXAgaXMgc3RpbGwgZW5hYmxlZCwgdGhlcmUgbXVzdCBiZSBhIG5ldyBiYWNrdXAgaW4gcGxhY2VcbiAgICAgICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgaGF2ZU5ld1ZlcnNpb24gPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgY2hlY2sgdGhlIHNlcnZlciB0byBzZWUgaWYgdGhlcmUncyBhIG5ldyBvbmVcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWZXJzaW9uSW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRLZXlCYWNrdXBWZXJzaW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWZXJzaW9uSW5mbyAhPT0gbnVsbCkgaGF2ZU5ld1ZlcnNpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiU2F3IGtleSBiYWNrdXAgZXJyb3IgYnV0IGZhaWxlZCB0byBjaGVjayBiYWNrdXAgdmVyc2lvbiFcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoYXZlTmV3VmVyc2lvbikge1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZ0FzeW5jKFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L05ld1JlY292ZXJ5TWV0aG9kRGlhbG9nJ1xuICAgICAgICAgICAgICAgICAgICApIGFzIHVua25vd24gYXMgUHJvbWlzZTxDb21wb25lbnRUeXBlPHt9Pj4sXG4gICAgICAgICAgICAgICAgICAgIHsgbmV3VmVyc2lvbkluZm8gfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2dBc3luYyhcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0KFxuICAgICAgICAgICAgICAgICAgICAgICAgJy4uLy4uL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9SZWNvdmVyeU1ldGhvZFJlbW92ZWREaWFsb2cnXG4gICAgICAgICAgICAgICAgICAgICkgYXMgdW5rbm93biBhcyBQcm9taXNlPENvbXBvbmVudFR5cGU8e30+PixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjbGkub24oQ3J5cHRvRXZlbnQuS2V5U2lnbmF0dXJlVXBsb2FkRmFpbHVyZSwgKGZhaWx1cmVzLCBzb3VyY2UsIGNvbnRpbnVhdGlvbikgPT4ge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFxuICAgICAgICAgICAgICAgIEtleVNpZ25hdHVyZVVwbG9hZEZhaWxlZERpYWxvZyxcbiAgICAgICAgICAgICAgICB7IGZhaWx1cmVzLCBzb3VyY2UsIGNvbnRpbnVhdGlvbiB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2xpLm9uKENyeXB0b0V2ZW50LlZlcmlmaWNhdGlvblJlcXVlc3QsIHJlcXVlc3QgPT4ge1xuICAgICAgICAgICAgaWYgKHJlcXVlc3QudmVyaWZpZXIpIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW5jb21pbmdTYXNEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdmVyaWZpZXI6IHJlcXVlc3QudmVyaWZpZXIsXG4gICAgICAgICAgICAgICAgfSwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3QucGVuZGluZykge1xuICAgICAgICAgICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5hZGRPclJlcGxhY2VUb2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3ZlcmlmcmVxXycgKyByZXF1ZXN0LmNoYW5uZWwudHJhbnNhY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVmVyaWZpY2F0aW9uIHJlcXVlc3RlZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJ2ZXJpZmljYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IHsgcmVxdWVzdCB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFZlcmlmaWNhdGlvblJlcXVlc3RUb2FzdCxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IDkwLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgc2hvcnRseSBhZnRlciB0aGUgbWF0cml4IGNsaWVudCBoYXMgc3RhcnRlZC4gVXNlZnVsIGZvclxuICAgICAqIHNldHRpbmcgdXAgYW55dGhpbmcgdGhhdCByZXF1aXJlcyB0aGUgY2xpZW50IHRvIGJlIHN0YXJ0ZWQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uQ2xpZW50U3RhcnRlZCgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIGlmIChjbGkuaXNDcnlwdG9FbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGJsYWNrbGlzdEVuYWJsZWQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoXG4gICAgICAgICAgICAgICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICAgICAgICAgICAgICBcImJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY2xpLnNldEdsb2JhbEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzKGJsYWNrbGlzdEVuYWJsZWQpO1xuXG4gICAgICAgICAgICAvLyBXaXRoIGNyb3NzLXNpZ25pbmcgZW5hYmxlZCwgd2Ugc2VuZCB0byB1bmtub3duIGRldmljZXNcbiAgICAgICAgICAgIC8vIHdpdGhvdXQgcHJvbXB0aW5nLiBBbnkgYmFkLWRldmljZSBzdGF0dXMgdGhlIHVzZXIgc2hvdWxkXG4gICAgICAgICAgICAvLyBiZSBhd2FyZSBvZiB3aWxsIGJlIHNpZ25hbGxlZCB0aHJvdWdoIHRoZSByb29tIHNoaWVsZFxuICAgICAgICAgICAgLy8gY2hhbmdpbmcgY29sb3VyLiBNb3JlIGFkdmFuY2VkIGJlaGF2aW91ciB3aWxsIGNvbWUgb25jZVxuICAgICAgICAgICAgLy8gd2UgaW1wbGVtZW50IG1vcmUgc2V0dGluZ3MuXG4gICAgICAgICAgICBjbGkuc2V0R2xvYmFsRXJyb3JPblVua25vd25EZXZpY2VzKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbm5vdCBiZSBkb25lIGluIE9uTG9nZ2VkSW4gYXMgYXQgdGhhdCBwb2ludCB0aGUgQWNjb3VudFNldHRpbmdzSGFuZGxlciBkb2Vzbid0IHlldCBoYXZlIGEgY2xpZW50XG4gICAgICAgIC8vIFdpbGwgYmUgbW92ZWQgdG8gYSBwcmUtbG9naW4gZmxvdyBhcyB3ZWxsXG4gICAgICAgIGlmIChQb3N0aG9nQW5hbHl0aWNzLmluc3RhbmNlLmlzRW5hYmxlZCgpICYmIFNldHRpbmdzU3RvcmUuaXNMZXZlbFN1cHBvcnRlZChTZXR0aW5nTGV2ZWwuQUNDT1VOVCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFBvc3Rob2dBbmFseXRpY3NUb2FzdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNob3dTY3JlZW4oc2NyZWVuOiBzdHJpbmcsIHBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgaXNMb2dnZWRPdXRPckd1ZXN0ID0gIWNsaSB8fCBjbGkuaXNHdWVzdCgpO1xuICAgICAgICBpZiAoIWlzTG9nZ2VkT3V0T3JHdWVzdCAmJiBBVVRIX1NDUkVFTlMuaW5jbHVkZXMoc2NyZWVuKSkge1xuICAgICAgICAgICAgLy8gdXNlciBpcyBsb2dnZWQgaW4gYW5kIGxhbmRpbmcgb24gYW4gYXV0aCBwYWdlIHdoaWNoIHdpbGwgdXByb290IHRoZWlyIHNlc3Npb24sIHJlZGlyZWN0IHRoZW0gaG9tZSBpbnN0ZWFkXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IEFjdGlvbi5WaWV3SG9tZVBhZ2UgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NyZWVuID09PSAncmVnaXN0ZXInKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3N0YXJ0X3JlZ2lzdHJhdGlvbicsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFBlcmZvcm1hbmNlTW9uaXRvci5pbnN0YW5jZS5zdGFydChQZXJmb3JtYW5jZUVudHJ5TmFtZXMuUkVHSVNURVIpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2xvZ2luJykge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdzdGFydF9sb2dpbicsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFBlcmZvcm1hbmNlTW9uaXRvci5pbnN0YW5jZS5zdGFydChQZXJmb3JtYW5jZUVudHJ5TmFtZXMuTE9HSU4pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2ZvcmdvdF9wYXNzd29yZCcpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnc3RhcnRfcGFzc3dvcmRfcmVjb3ZlcnknLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnc29mdF9sb2dvdXQnKSB7XG4gICAgICAgICAgICBpZiAoY2xpLmdldFVzZXJJZCgpICYmICFMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgICAgICAgICAvLyBMb2dnZWQgaW4gLSB2aXNpdCBhIHJvb21cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdMYXN0Um9vbSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBVbHRpbWF0ZWx5IHRyaWdnZXJzIHNvZnRfbG9nb3V0IGlmIG5lZWRlZFxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3N0YXJ0X2xvZ2luJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnbmV3Jykge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X2NyZWF0ZV9yb29tJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2RtJykge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X2NyZWF0ZV9jaGF0JyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ3NldHRpbmdzJykge1xuICAgICAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ3dlbGNvbWUnKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfd2VsY29tZV9wYWdlJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2hvbWUnKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdIb21lUGFnZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuKCdob21lJyk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2RpcmVjdG9yeScpIHtcbiAgICAgICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3Um9vbURpcmVjdG9yeSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSBcInN0YXJ0X3Nzb1wiIHx8IHNjcmVlbiA9PT0gXCJzdGFydF9jYXNcIikge1xuICAgICAgICAgICAgbGV0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGlmICghY2xpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBoc1VybCwgaXNVcmwgfSA9IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnO1xuICAgICAgICAgICAgICAgIGNsaSA9IGNyZWF0ZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6IGhzVXJsLFxuICAgICAgICAgICAgICAgICAgICBpZEJhc2VVcmw6IGlzVXJsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0eXBlID0gc2NyZWVuID09PSBcInN0YXJ0X3Nzb1wiID8gXCJzc29cIiA6IFwiY2FzXCI7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zdGFydFNpbmdsZVNpZ25PbihjbGksIHR5cGUsIHRoaXMuZ2V0RnJhZ21lbnRBZnRlckxvZ2luKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbi5pbmRleE9mKCdyb29tLycpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBSb29tcyBjYW4gaGF2ZSB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gICAgICAgICAgICAvLyAjcm9vbV9hbGlhczpkb21haW4gb3IgIW9wYXF1ZV9pZDpkb21haW5cbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBzY3JlZW4uc3Vic3RyaW5nKDUpO1xuICAgICAgICAgICAgY29uc3QgZG9tYWluT2Zmc2V0ID0gcm9vbS5pbmRleE9mKCc6JykgKyAxOyAvLyAwIGluIGNhc2Ugcm9vbSBkb2VzIG5vdCBjb250YWluIGEgOlxuICAgICAgICAgICAgbGV0IGV2ZW50T2Zmc2V0ID0gcm9vbS5sZW5ndGg7XG4gICAgICAgICAgICAvLyByb29tIGFsaWFzZXMgY2FuIGNvbnRhaW4gc2xhc2hlcyBvbmx5IGxvb2sgZm9yIHNsYXNoIGFmdGVyIGRvbWFpblxuICAgICAgICAgICAgaWYgKHJvb20uc3Vic3RyaW5nKGRvbWFpbk9mZnNldCkuaW5kZXhPZignLycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBldmVudE9mZnNldCA9IGRvbWFpbk9mZnNldCArIHJvb20uc3Vic3RyaW5nKGRvbWFpbk9mZnNldCkuaW5kZXhPZignLycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgcm9vbVN0cmluZyA9IHJvb20uc3Vic3RyaW5nKDAsIGV2ZW50T2Zmc2V0KTtcbiAgICAgICAgICAgIGxldCBldmVudElkID0gcm9vbS5zdWJzdHJpbmcoZXZlbnRPZmZzZXQgKyAxKTsgLy8gZW1wdHkgc3RyaW5nIGlmIG5vIGV2ZW50IGlkIGdpdmVuXG5cbiAgICAgICAgICAgIC8vIFByZXZpb3VzbHkgd2UgcHVsbGVkIHRoZSBldmVudElEIGZyb20gdGhlIHNlZ21lbnRzIGluIHN1Y2ggYSB3YXlcbiAgICAgICAgICAgIC8vIHdoZXJlIGlmIHRoZXJlIHdhcyBubyBldmVudElkIHRoZW4gd2UnZCBnZXQgdW5kZWZpbmVkLiBIb3dldmVyLCB3ZVxuICAgICAgICAgICAgLy8gbm93IGRvIGEgc3BsaWNlIGFuZCBqb2luIHRvIGhhbmRsZSB2MyBldmVudCBJRHMgd2hpY2ggcmVzdWx0cyBpblxuICAgICAgICAgICAgLy8gYW4gZW1wdHkgc3RyaW5nLiBUbyBtYWludGFpbiBvdXIgcG90ZW50aWFsIGNvbnRyYWN0IHdpdGggdGhlIHJlc3RcbiAgICAgICAgICAgIC8vIG9mIHRoZSBhcHAsIHdlIGNvZXJjZSB0aGUgZXZlbnRJZCB0byBiZSB1bmRlZmluZWQgd2hlcmUgYXBwbGljYWJsZS5cbiAgICAgICAgICAgIGlmICghZXZlbnRJZCkgZXZlbnRJZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgLy8gVE9ETzogSGFuZGxlIGVuY29kZWQgcm9vbS9ldmVudCBJRHM6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzkxNDlcblxuICAgICAgICAgICAgbGV0IHRocmVlcGlkSW52aXRlOiBJVGhyZWVwaWRJbnZpdGU7XG4gICAgICAgICAgICAvLyBpZiB3ZSBsYW5kZWQgaGVyZSBmcm9tIGEgM1BJRCBpbnZpdGUsIHBlcnNpc3QgaXRcbiAgICAgICAgICAgIGlmIChwYXJhbXMuc2lnbnVybCAmJiBwYXJhbXMuZW1haWwpIHtcbiAgICAgICAgICAgICAgICB0aHJlZXBpZEludml0ZSA9IFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgLnN0b3JlSW52aXRlKHJvb21TdHJpbmcsIHBhcmFtcyBhcyBJVGhyZWVwaWRJbnZpdGVXaXJlRm9ybWF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBjaGVjayB0aGF0IHRoaXMgcm9vbSBkb2Vzbid0IGFscmVhZHkgaGF2ZSBhIGtub3duIGludml0ZVxuICAgICAgICAgICAgaWYgKCF0aHJlZXBpZEludml0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZXMgPSBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLmdldEludml0ZXMoKTtcbiAgICAgICAgICAgICAgICB0aHJlZXBpZEludml0ZSA9IGludml0ZXMuZmluZChpbnZpdGUgPT4gaW52aXRlLnJvb21JZCA9PT0gcm9vbVN0cmluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG9uIG91ciBVUkxzIHRoZXJlIG1pZ2h0IGJlIGEgP3ZpYT1tYXRyaXgub3JnIG9yIHNpbWlsYXIgdG8gaGVscFxuICAgICAgICAgICAgLy8gam9pbnMgdG8gdGhlIHJvb20gc3VjY2VlZC4gV2UnbGwgcGFzcyB0aGVzZSB0aHJvdWdoIGFzIGFuIGFycmF5XG4gICAgICAgICAgICAvLyB0byBvdGhlciBsZXZlbHMuIElmIHRoZXJlJ3MganVzdCBvbmUgP3ZpYT0gdGhlbiBwYXJhbXMudmlhIGlzIGFcbiAgICAgICAgICAgIC8vIHNpbmdsZSBzdHJpbmcuIElmIHNvbWVvbmUgZG9lcyBzb21ldGhpbmcgbGlrZSA/dmlhPW9uZS5jb20mdmlhPXR3by5jb21cbiAgICAgICAgICAgIC8vIHRoZW4gcGFyYW1zLnZpYSBpcyBhbiBhcnJheSBvZiBzdHJpbmdzLlxuICAgICAgICAgICAgbGV0IHZpYSA9IFtdO1xuICAgICAgICAgICAgaWYgKHBhcmFtcy52aWEpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKHBhcmFtcy52aWEpID09PSAnc3RyaW5nJykgdmlhID0gW3BhcmFtcy52aWFdO1xuICAgICAgICAgICAgICAgIGVsc2UgdmlhID0gcGFyYW1zLnZpYTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcGF5bG9hZDogVmlld1Jvb21QYXlsb2FkID0ge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgIGV2ZW50X2lkOiBldmVudElkLFxuICAgICAgICAgICAgICAgIHZpYV9zZXJ2ZXJzOiB2aWEsXG4gICAgICAgICAgICAgICAgLy8gSWYgYW4gZXZlbnQgSUQgaXMgZ2l2ZW4gaW4gdGhlIFVSTCBoYXNoLCBub3RpZnkgUm9vbVZpZXdTdG9yZSB0byBtYXJrXG4gICAgICAgICAgICAgICAgLy8gaXQgYXMgaGlnaGxpZ2h0ZWQsIHdoaWNoIHdpbGwgcHJvcGFnYXRlIHRvIFJvb21WaWV3IGFuZCBoaWdobGlnaHQgdGhlXG4gICAgICAgICAgICAgICAgLy8gYXNzb2NpYXRlZCBFdmVudFRpbGUuXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IEJvb2xlYW4oZXZlbnRJZCksXG4gICAgICAgICAgICAgICAgdGhyZWVwaWRfaW52aXRlOiB0aHJlZXBpZEludml0ZSxcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZXBsYWNlIG9vYl9kYXRhIHdpdGggdGhlIHRocmVlcGlkSW52aXRlICh3aGljaCBoYXMgdGhlIHNhbWUgaW5mbykuXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpc24ndCBkb25lIHlldCBiZWNhdXNlIGl0J3MgdGhyZWFkZWQgdGhyb3VnaCBzbyBtYW55IG1vcmUgcGxhY2VzLlxuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNTE1N1xuICAgICAgICAgICAgICAgIG9vYl9kYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRocmVlcGlkSW52aXRlPy5yb29tTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyVXJsOiB0aHJlZXBpZEludml0ZT8ucm9vbUF2YXRhclVybCxcbiAgICAgICAgICAgICAgICAgICAgaW52aXRlck5hbWU6IHRocmVlcGlkSW52aXRlPy5pbnZpdGVyTmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJvb21fYWxpYXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByb29tX2lkOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IHVuZGVmaW5lZCwgLy8gdW5rbm93biBvciBleHRlcm5hbCB0cmlnZ2VyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHJvb21TdHJpbmdbMF0gPT09ICcjJykge1xuICAgICAgICAgICAgICAgIHBheWxvYWQucm9vbV9hbGlhcyA9IHJvb21TdHJpbmc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBheWxvYWQucm9vbV9pZCA9IHJvb21TdHJpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaChwYXlsb2FkKTtcbiAgICAgICAgfSBlbHNlIGlmIChzY3JlZW4uaW5kZXhPZigndXNlci8nKSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3QgdXNlcklkID0gc2NyZWVuLnN1YnN0cmluZyg1KTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld191c2VyX2luZm8nLFxuICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgICAgIHN1YkFjdGlvbjogcGFyYW1zLmFjdGlvbixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbi5pbmRleE9mKCdncm91cC8nKSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3QgZ3JvdXBJZCA9IHNjcmVlbi5zdWJzdHJpbmcoNik7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfbGVnYWN5X2dyb3VwJyxcbiAgICAgICAgICAgICAgICBncm91cElkOiBncm91cElkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhcIklnbm9yaW5nIHNob3dTY3JlZW4gZm9yICclcydcIiwgc2NyZWVuKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbm90aWZ5TmV3U2NyZWVuKHNjcmVlbjogc3RyaW5nLCByZXBsYWNlTGFzdCA9IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uTmV3U2NyZWVuKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uTmV3U2NyZWVuKHNjcmVlbiwgcmVwbGFjZUxhc3QpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0UGFnZVN1YnRpdGxlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkxvZ291dENsaWNrKGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxBbmNob3JFbGVtZW50LCBNb3VzZUV2ZW50Pikge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnbG9nb3V0JyxcbiAgICAgICAgfSk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlUmVzaXplID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBMSFNfVEhSRVNIT0xEID0gMTAwMDtcbiAgICAgICAgY29uc3Qgd2lkdGggPSBVSVN0b3JlLmluc3RhbmNlLndpbmRvd1dpZHRoO1xuXG4gICAgICAgIGlmICh0aGlzLnByZXZXaW5kb3dXaWR0aCA8IExIU19USFJFU0hPTEQgJiYgd2lkdGggPj0gTEhTX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnc2hvd19sZWZ0X3BhbmVsJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByZXZXaW5kb3dXaWR0aCA+PSBMSFNfVEhSRVNIT0xEICYmIHdpZHRoIDwgTEhTX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnaGlkZV9sZWZ0X3BhbmVsJyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJldldpbmRvd1dpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuc3RhdGUucmVzaXplTm90aWZpZXIubm90aWZ5V2luZG93UmVzaXplZCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGRpc3BhdGNoVGltZWxpbmVSZXNpemUoKSB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3RpbWVsaW5lX3Jlc2l6ZScgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlZ2lzdGVyQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd1NjcmVlbihcInJlZ2lzdGVyXCIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTG9naW5DbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93U2NyZWVuKFwibG9naW5cIik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Gb3Jnb3RQYXNzd29yZENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dTY3JlZW4oXCJmb3Jnb3RfcGFzc3dvcmRcIik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWdpc3RlckZsb3dDb21wbGV0ZSA9IChjcmVkZW50aWFsczogSU1hdHJpeENsaWVudENyZWRzLCBwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uVXNlckNvbXBsZXRlZExvZ2luRmxvdyhjcmVkZW50aWFscywgcGFzc3dvcmQpO1xuICAgIH07XG5cbiAgICAvLyByZXR1cm5zIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0aGUgbmV3IE1hdHJpeENsaWVudFxuICAgIHByaXZhdGUgb25SZWdpc3RlcmVkKGNyZWRlbnRpYWxzOiBJTWF0cml4Q2xpZW50Q3JlZHMpOiBQcm9taXNlPE1hdHJpeENsaWVudD4ge1xuICAgICAgICByZXR1cm4gTGlmZWN5Y2xlLnNldExvZ2dlZEluKGNyZWRlbnRpYWxzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2VuZEV2ZW50KHJvb21JZDogc3RyaW5nLCBldmVudDogTWF0cml4RXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoIWNsaSkgcmV0dXJuO1xuXG4gICAgICAgIGNsaS5zZW5kRXZlbnQocm9vbUlkLCBldmVudC5nZXRUeXBlKCksIGV2ZW50LmdldENvbnRlbnQoKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdtZXNzYWdlX3NlbnQnIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldFBhZ2VTdWJ0aXRsZShzdWJ0aXRsZSA9ICcnKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQgJiYgY2xpZW50LmdldFJvb20odGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkKTtcbiAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgc3VidGl0bGUgPSBgJHt0aGlzLnN1YlRpdGxlU3RhdHVzfSB8ICR7IHJvb20ubmFtZSB9ICR7c3VidGl0bGV9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1YnRpdGxlID0gYCR7dGhpcy5zdWJUaXRsZVN0YXR1c30gJHtzdWJ0aXRsZX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBgJHtTZGtDb25maWcuZ2V0KCkuYnJhbmR9ICR7c3VidGl0bGV9YDtcblxuICAgICAgICBpZiAoZG9jdW1lbnQudGl0bGUgIT09IHRpdGxlKSB7XG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblVwZGF0ZVN0YXR1c0luZGljYXRvciA9IChub3RpZmljYXRpb25TdGF0ZTogU3VtbWFyaXplZE5vdGlmaWNhdGlvblN0YXRlLCBzdGF0ZTogU3luY1N0YXRlKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IG51bVVucmVhZFJvb21zID0gbm90aWZpY2F0aW9uU3RhdGUubnVtVW5yZWFkU3RhdGVzOyAvLyB3ZSBrbm93IHRoYXQgc3RhdGVzID09PSByb29tcyBoZXJlXG5cbiAgICAgICAgaWYgKFBsYXRmb3JtUGVnLmdldCgpKSB7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zZXRFcnJvclN0YXR1cyhzdGF0ZSA9PT0gU3luY1N0YXRlLkVycm9yKTtcbiAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLnNldE5vdGlmaWNhdGlvbkNvdW50KG51bVVucmVhZFJvb21zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3ViVGl0bGVTdGF0dXMgPSAnJztcbiAgICAgICAgaWYgKHN0YXRlID09PSBTeW5jU3RhdGUuRXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuc3ViVGl0bGVTdGF0dXMgKz0gYFske190KFwiT2ZmbGluZVwiKX1dIGA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG51bVVucmVhZFJvb21zID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zdWJUaXRsZVN0YXR1cyArPSBgWyR7bnVtVW5yZWFkUm9vbXN9XWA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFBhZ2VTdWJ0aXRsZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2VydmVyQ29uZmlnQ2hhbmdlID0gKHNlcnZlckNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZXJ2ZXJDb25maWcgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgbWFrZVJlZ2lzdHJhdGlvblVybCA9IChwYXJhbXM6IFF1ZXJ5RGljdCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zdGFydGluZ0ZyYWdtZW50UXVlcnlQYXJhbXMucmVmZXJyZXIpIHtcbiAgICAgICAgICAgIHBhcmFtcy5yZWZlcnJlciA9IHRoaXMucHJvcHMuc3RhcnRpbmdGcmFnbWVudFF1ZXJ5UGFyYW1zLnJlZmVycmVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLm1ha2VSZWdpc3RyYXRpb25VcmwocGFyYW1zKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWZ0ZXIgcmVnaXN0cmF0aW9uIG9yIGxvZ2luLCB3ZSBydW4gdmFyaW91cyBwb3N0LWF1dGggc3RlcHMgYmVmb3JlIGVudGVyaW5nIHRoZSBhcHBcbiAgICAgKiBwcm9wZXIsIHN1Y2ggc2V0dGluZyB1cCBjcm9zcy1zaWduaW5nIG9yIHZlcmlmeWluZyB0aGUgbmV3IHNlc3Npb24uXG4gICAgICpcbiAgICAgKiBOb3RlOiBTU08gdXNlcnMgKGFuZCBhbnkgb3RoZXJzIHVzaW5nIHRva2VuIGxvZ2luKSBjdXJyZW50bHkgZG8gbm90IHBhc3MgdGhyb3VnaFxuICAgICAqIHRoaXMsIGFzIHRoZXkgaW5zdGVhZCBqdW1wIHN0cmFpZ2h0IGludG8gdGhlIGFwcCBhZnRlciBgYXR0ZW1wdFRva2VuTG9naW5gLlxuICAgICAqL1xuICAgIHByaXZhdGUgb25Vc2VyQ29tcGxldGVkTG9naW5GbG93ID0gYXN5bmMgKGNyZWRlbnRpYWxzOiBJTWF0cml4Q2xpZW50Q3JlZHMsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgdGhpcy5hY2NvdW50UGFzc3dvcmQgPSBwYXNzd29yZDtcbiAgICAgICAgLy8gc2VsZi1kZXN0cnVjdCB0aGUgcGFzc3dvcmQgYWZ0ZXIgNW1pbnNcbiAgICAgICAgaWYgKHRoaXMuYWNjb3VudFBhc3N3b3JkVGltZXIgIT09IG51bGwpIGNsZWFyVGltZW91dCh0aGlzLmFjY291bnRQYXNzd29yZFRpbWVyKTtcbiAgICAgICAgdGhpcy5hY2NvdW50UGFzc3dvcmRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hY2NvdW50UGFzc3dvcmQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5hY2NvdW50UGFzc3dvcmRUaW1lciA9IG51bGw7XG4gICAgICAgIH0sIDYwICogNSAqIDEwMDApO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgc3RhcnQgdGhlIGNsaWVudFxuICAgICAgICBhd2FpdCBMaWZlY3ljbGUuc2V0TG9nZ2VkSW4oY3JlZGVudGlhbHMpO1xuICAgICAgICBhd2FpdCB0aGlzLnBvc3RMb2dpblNldHVwKCk7XG5cbiAgICAgICAgUGVyZm9ybWFuY2VNb25pdG9yLmluc3RhbmNlLnN0b3AoUGVyZm9ybWFuY2VFbnRyeU5hbWVzLkxPR0lOKTtcbiAgICAgICAgUGVyZm9ybWFuY2VNb25pdG9yLmluc3RhbmNlLnN0b3AoUGVyZm9ybWFuY2VFbnRyeU5hbWVzLlJFR0lTVEVSKTtcbiAgICB9O1xuXG4gICAgLy8gY29tcGxldGUgc2VjdXJpdHkgLyBlMmUgc2V0dXAgaGFzIGZpbmlzaGVkXG4gICAgcHJpdmF0ZSBvbkNvbXBsZXRlU2VjdXJpdHlFMmVTZXR1cEZpbmlzaGVkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLm9uTG9nZ2VkSW4oKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRGcmFnbWVudEFmdGVyTG9naW4oKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGZyYWdtZW50QWZ0ZXJMb2dpbiA9IFwiXCI7XG4gICAgICAgIGNvbnN0IGluaXRpYWxTY3JlZW5BZnRlckxvZ2luID0gdGhpcy5wcm9wcy5pbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbjtcbiAgICAgICAgaWYgKGluaXRpYWxTY3JlZW5BZnRlckxvZ2luICYmXG4gICAgICAgICAgICAvLyBYWFg6IHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzExNjQzIGNhdXNpbmcgYSBsb2dpbi1sb29wXG4gICAgICAgICAgICAhW1wid2VsY29tZVwiLCBcImxvZ2luXCIsIFwicmVnaXN0ZXJcIiwgXCJzdGFydF9zc29cIiwgXCJzdGFydF9jYXNcIl0uaW5jbHVkZXMoaW5pdGlhbFNjcmVlbkFmdGVyTG9naW4uc2NyZWVuKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGZyYWdtZW50QWZ0ZXJMb2dpbiA9IGAvJHtpbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW59YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnJhZ21lbnRBZnRlckxvZ2luO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnRBZnRlckxvZ2luID0gdGhpcy5nZXRGcmFnbWVudEFmdGVyTG9naW4oKTtcbiAgICAgICAgbGV0IHZpZXcgPSBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkxPQURJTkcpIHtcbiAgICAgICAgICAgIHZpZXcgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NYXRyaXhDaGF0X3NwbGFzaFwiPlxuICAgICAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkNPTVBMRVRFX1NFQ1VSSVRZKSB7XG4gICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgIDxDb21wbGV0ZVNlY3VyaXR5XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25Db21wbGV0ZVNlY3VyaXR5RTJlU2V0dXBGaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkUyRV9TRVRVUCkge1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8RTJlU2V0dXBcbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNvbXBsZXRlU2VjdXJpdHlFMmVTZXR1cEZpbmlzaGVkfVxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50UGFzc3dvcmQ9e3RoaXMuYWNjb3VudFBhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICB0b2tlbkxvZ2luPXshIXRoaXMudG9rZW5Mb2dpbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkxPR0dFRF9JTikge1xuICAgICAgICAgICAgLy8gc3RvcmUgZXJyb3JzIHN0b3AgdGhlIGNsaWVudCBzeW5jaW5nIGFuZCByZXF1aXJlIHVzZXIgaW50ZXJ2ZW50aW9uLCBzbyB3ZSdsbFxuICAgICAgICAgICAgLy8gYmUgc2hvd2luZyBhIGRpYWxvZy4gRG9uJ3Qgc2hvdyBhbnl0aGluZyBlbHNlLlxuICAgICAgICAgICAgY29uc3QgaXNTdG9yZUVycm9yID0gdGhpcy5zdGF0ZS5zeW5jRXJyb3IgJiYgdGhpcy5zdGF0ZS5zeW5jRXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkU3RvcmVFcnJvcjtcblxuICAgICAgICAgICAgLy8gYHJlYWR5YCBhbmQgYHZpZXc9PUxPR0dFRF9JTmAgbWF5IGJlIHNldCBiZWZvcmUgYHBhZ2VfdHlwZWAgKGJlY2F1c2UgdGhlXG4gICAgICAgICAgICAvLyBsYXR0ZXIgaXMgc2V0IHZpYSB0aGUgZGlzcGF0Y2hlcikuIElmIHdlIGRvbid0IHlldCBoYXZlIGEgYHBhZ2VfdHlwZWAsXG4gICAgICAgICAgICAvLyBrZWVwIHNob3dpbmcgdGhlIHNwaW5uZXIgZm9yIG5vdy5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnJlYWR5ICYmIHRoaXMuc3RhdGUucGFnZV90eXBlICYmICFpc1N0b3JlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvKiBmb3Igbm93LCB3ZSBzdHVmZiB0aGUgZW50aXJldHkgb2Ygb3VyIHByb3BzIGFuZCBzdGF0ZSBpbnRvIHRoZSBMb2dnZWRJblZpZXcuXG4gICAgICAgICAgICAgICAgICogd2Ugc2hvdWxkIGdvIHRocm91Z2ggYW5kIGZpZ3VyZSBvdXQgd2hhdCB3ZSBhY3R1YWxseSBuZWVkIHRvIHBhc3MgZG93biwgYXMgd2VsbFxuICAgICAgICAgICAgICAgICAqIGFzIHVzaW5nIHNvbWV0aGluZyBsaWtlIHJlZHV4IHRvIGF2b2lkIGhhdmluZyBhIGJpbGxpb24gYml0cyBvZiBzdGF0ZSBraWNraW5nIGFyb3VuZC5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgICAgICA8TG9nZ2VkSW5WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi50aGlzLnN0YXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmxvZ2dlZEluVmlld31cbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudD17TWF0cml4Q2xpZW50UGVnLmdldCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25SZWdpc3RlcmVkPXt0aGlzLm9uUmVnaXN0ZXJlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRSb29tSWQ9e3RoaXMuc3RhdGUuY3VycmVudFJvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB3ZSB0aGluayB3ZSBhcmUgbG9nZ2VkIGluLCBidXQgYXJlIHN0aWxsIHdhaXRpbmcgZm9yIHRoZSAvc3luYyB0byBjb21wbGV0ZVxuICAgICAgICAgICAgICAgIGxldCBlcnJvckJveDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zeW5jRXJyb3IgJiYgIWlzU3RvcmVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckJveCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfTWF0cml4Q2hhdF9zeW5jRXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbWVzc2FnZUZvclN5bmNFcnJvcih0aGlzLnN0YXRlLnN5bmNFcnJvcikgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZpZXcgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWF0cml4Q2hhdF9zcGxhc2hcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZXJyb3JCb3ggfVxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWF0cml4Q2hhdF9zcGxhc2hCdXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0nbGlua19pbmxpbmUnIG9uQ2xpY2s9e3RoaXMub25Mb2dvdXRDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0xvZ291dCcpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLldFTENPTUUpIHtcbiAgICAgICAgICAgIHZpZXcgPSA8V2VsY29tZSAvPjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLlJFR0lTVEVSICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlJlZ2lzdHJhdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IGVtYWlsID0gVGhyZWVwaWRJbnZpdGVTdG9yZS5pbnN0YW5jZS5waWNrQmVzdEludml0ZSgpPy50b0VtYWlsO1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8UmVnaXN0cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFNlY3JldD17dGhpcy5zdGF0ZS5yZWdpc3Rlcl9jbGllbnRfc2VjcmV0fVxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQ9e3RoaXMuc3RhdGUucmVnaXN0ZXJfc2Vzc2lvbl9pZH1cbiAgICAgICAgICAgICAgICAgICAgaWRTaWQ9e3RoaXMuc3RhdGUucmVnaXN0ZXJfaWRfc2lkfVxuICAgICAgICAgICAgICAgICAgICBlbWFpbD17ZW1haWx9XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kPXt0aGlzLnByb3BzLmNvbmZpZy5icmFuZH1cbiAgICAgICAgICAgICAgICAgICAgbWFrZVJlZ2lzdHJhdGlvblVybD17dGhpcy5tYWtlUmVnaXN0cmF0aW9uVXJsfVxuICAgICAgICAgICAgICAgICAgICBvbkxvZ2dlZEluPXt0aGlzLm9uUmVnaXN0ZXJGbG93Q29tcGxldGV9XG4gICAgICAgICAgICAgICAgICAgIG9uTG9naW5DbGljaz17dGhpcy5vbkxvZ2luQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlPXt0aGlzLm9uU2VydmVyQ29uZmlnQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU9e3RoaXMucHJvcHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lfVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFmdGVyTG9naW49e2ZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VydmVyUHJvcGVydGllcygpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmlldyA9PT0gVmlld3MuRk9SR09UX1BBU1NXT1JEICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlBhc3N3b3JkUmVzZXQpKSB7XG4gICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgIDxGb3Jnb3RQYXNzd29yZFxuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlPXt0aGlzLm9uTG9naW5DbGlja31cbiAgICAgICAgICAgICAgICAgICAgb25Mb2dpbkNsaWNrPXt0aGlzLm9uTG9naW5DbGlja31cbiAgICAgICAgICAgICAgICAgICAgb25TZXJ2ZXJDb25maWdDaGFuZ2U9e3RoaXMub25TZXJ2ZXJDb25maWdDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHsuLi50aGlzLmdldFNlcnZlclByb3BlcnRpZXMoKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkxPR0lOKSB7XG4gICAgICAgICAgICBjb25zdCBzaG93UGFzc3dvcmRSZXNldCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlBhc3N3b3JkUmVzZXQpO1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8TG9naW5cbiAgICAgICAgICAgICAgICAgICAgaXNTeW5jaW5nPXt0aGlzLnN0YXRlLnBlbmRpbmdJbml0aWFsU3luY31cbiAgICAgICAgICAgICAgICAgICAgb25Mb2dnZWRJbj17dGhpcy5vblVzZXJDb21wbGV0ZWRMb2dpbkZsb3d9XG4gICAgICAgICAgICAgICAgICAgIG9uUmVnaXN0ZXJDbGljaz17dGhpcy5vblJlZ2lzdGVyQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrSHNVcmw9e3RoaXMuZ2V0RmFsbGJhY2tIc1VybCgpfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU9e3RoaXMucHJvcHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkZvcmdvdFBhc3N3b3JkQ2xpY2s9e3Nob3dQYXNzd29yZFJlc2V0ID8gdGhpcy5vbkZvcmdvdFBhc3N3b3JkQ2xpY2sgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlPXt0aGlzLm9uU2VydmVyQ29uZmlnQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFmdGVyTG9naW49e2ZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFVzZXJuYW1lPXt0aGlzLnByb3BzLnN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcy5kZWZhdWx0VXNlcm5hbWUgYXMgc3RyaW5nfVxuICAgICAgICAgICAgICAgICAgICB7Li4udGhpcy5nZXRTZXJ2ZXJQcm9wZXJ0aWVzKCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5TT0ZUX0xPR09VVCkge1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8U29mdExvZ291dFxuICAgICAgICAgICAgICAgICAgICByZWFsUXVlcnlQYXJhbXM9e3RoaXMucHJvcHMucmVhbFF1ZXJ5UGFyYW1zfVxuICAgICAgICAgICAgICAgICAgICBvblRva2VuTG9naW5Db21wbGV0ZWQ9e3RoaXMucHJvcHMub25Ub2tlbkxvZ2luQ29tcGxldGVkfVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFmdGVyTG9naW49e2ZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLlVTRV9DQVNFX1NFTEVDVElPTikge1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8VXNlQ2FzZVNlbGVjdGlvbiBvbkZpbmlzaGVkPXt1c2VDYXNlID0+IHRoaXMub25TaG93UG9zdExvZ2luU2NyZWVuKHVzZUNhc2UpfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgVW5rbm93biB2aWV3ICR7dGhpcy5zdGF0ZS52aWV3fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxFcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgeyB2aWV3IH1cbiAgICAgICAgPC9FcnJvckJvdW5kYXJ5PjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBUUE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBS0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBRUE7O0FBQ0E7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBT0E7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