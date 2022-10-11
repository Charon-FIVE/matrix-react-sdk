"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProxiedModuleApi = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var Matrix = _interopRequireWildcard(require("matrix-js-sdk/src/matrix"));

var _Modal = _interopRequireDefault(require("../Modal"));

var _languageHandler = require("../languageHandler");

var _ModuleUiDialog = require("../components/views/dialogs/ModuleUiDialog");

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _PlatformPeg = _interopRequireDefault(require("../PlatformPeg"));

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _navigator = require("../utils/permalinks/navigator");

var _Permalinks = require("../utils/permalinks/Permalinks");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _RoomAliasCache = require("../RoomAliasCache");

var _actions = require("../dispatcher/actions");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Glue between the `ModuleApi` interface and the react-sdk. Anticipates one instance
 * to be assigned to a single module.
 */
class ProxiedModuleApi {
  constructor() {
    (0, _defineProperty2.default)(this, "cachedTranslations", void 0);
  }

  /**
   * All custom translations used by the associated module.
   */
  get translations() {
    return this.cachedTranslations;
  }
  /**
   * @override
   */


  registerTranslations(translations) {
    this.cachedTranslations = translations;
  }
  /**
   * @override
   */


  translateString(s, variables) {
    return (0, _languageHandler._t)(s, variables);
  }
  /**
   * @override
   */


  openDialog(title, body) {
    return new Promise(resolve => {
      _Modal.default.createDialog(_ModuleUiDialog.ModuleUiDialog, {
        title: title,
        contentFactory: body,
        contentProps: {
          moduleApi: this
        }
      }, "mx_CompoundDialog").finished.then(_ref => {
        let [didOkOrSubmit, model] = _ref;
        resolve({
          didOkOrSubmit,
          model
        });
      });
    });
  }
  /**
   * @override
   */


  async registerSimpleAccount(username, password, displayName) {
    const hsUrl = _SdkConfig.default.get("validated_server_config").hsUrl;

    const client = Matrix.createClient({
      baseUrl: hsUrl
    });

    const deviceName = _SdkConfig.default.get("default_device_display_name") || _PlatformPeg.default.get().getDefaultDeviceDisplayName();

    const req = {
      username,
      password,
      initial_device_display_name: deviceName,
      auth: undefined,
      inhibit_login: false
    };
    const creds = await client.registerRequest(req).catch(resp => client.registerRequest(_objectSpread(_objectSpread({}, req), {}, {
      auth: {
        session: resp.data.session,
        type: "m.login.dummy"
      }
    })));

    if (displayName) {
      const profileClient = Matrix.createClient({
        baseUrl: hsUrl,
        userId: creds.user_id,
        deviceId: creds.device_id,
        accessToken: creds.access_token
      });
      await profileClient.setDisplayName(displayName);
    }

    return {
      homeserverUrl: hsUrl,
      userId: creds.user_id,
      deviceId: creds.device_id,
      accessToken: creds.access_token
    };
  }
  /**
   * @override
   */


  async overwriteAccountAuth(accountInfo) {
    _dispatcher.default.dispatch({
      action: _actions.Action.OverwriteLogin,
      credentials: _objectSpread(_objectSpread({}, accountInfo), {}, {
        guest: false
      })
    }, true); // require to be sync to match inherited interface behaviour

  }
  /**
   * @override
   */


  async navigatePermalink(uri, andJoin) {
    (0, _navigator.navigateToPermalink)(uri);
    const parts = (0, _Permalinks.parsePermalink)(uri);

    if (parts.roomIdOrAlias && andJoin) {
      let roomId = parts.roomIdOrAlias;
      let servers = parts.viaServers;

      if (roomId.startsWith("#")) {
        roomId = (0, _RoomAliasCache.getCachedRoomIDForAlias)(parts.roomIdOrAlias);

        if (!roomId) {
          // alias resolution failed
          const result = await _MatrixClientPeg.MatrixClientPeg.get().getRoomIdForAlias(parts.roomIdOrAlias);
          roomId = result.room_id;
          if (!servers) servers = result.servers; // use provided servers first, if available
        }
      }

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: roomId,
        via_servers: servers
      });

      if (andJoin) {
        _dispatcher.default.dispatch({
          action: _actions.Action.JoinRoom
        });
      }
    }
  }
  /**
   * @override
   */


  getConfigValue(namespace, key) {
    // Force cast to `any` because the namespace won't be known to the SdkConfig types
    const maybeObj = _SdkConfig.default.get(namespace);

    if (!maybeObj || !(typeof maybeObj === "object")) return undefined;
    return maybeObj[key];
  }

}

exports.ProxiedModuleApi = ProxiedModuleApi;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm94aWVkTW9kdWxlQXBpIiwidHJhbnNsYXRpb25zIiwiY2FjaGVkVHJhbnNsYXRpb25zIiwicmVnaXN0ZXJUcmFuc2xhdGlvbnMiLCJ0cmFuc2xhdGVTdHJpbmciLCJzIiwidmFyaWFibGVzIiwiX3QiLCJvcGVuRGlhbG9nIiwidGl0bGUiLCJib2R5IiwiUHJvbWlzZSIsInJlc29sdmUiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIk1vZHVsZVVpRGlhbG9nIiwiY29udGVudEZhY3RvcnkiLCJjb250ZW50UHJvcHMiLCJtb2R1bGVBcGkiLCJmaW5pc2hlZCIsInRoZW4iLCJkaWRPa09yU3VibWl0IiwibW9kZWwiLCJyZWdpc3RlclNpbXBsZUFjY291bnQiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwiZGlzcGxheU5hbWUiLCJoc1VybCIsIlNka0NvbmZpZyIsImdldCIsImNsaWVudCIsIk1hdHJpeCIsImNyZWF0ZUNsaWVudCIsImJhc2VVcmwiLCJkZXZpY2VOYW1lIiwiUGxhdGZvcm1QZWciLCJnZXREZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUiLCJyZXEiLCJpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWUiLCJhdXRoIiwidW5kZWZpbmVkIiwiaW5oaWJpdF9sb2dpbiIsImNyZWRzIiwicmVnaXN0ZXJSZXF1ZXN0IiwiY2F0Y2giLCJyZXNwIiwic2Vzc2lvbiIsImRhdGEiLCJ0eXBlIiwicHJvZmlsZUNsaWVudCIsInVzZXJJZCIsInVzZXJfaWQiLCJkZXZpY2VJZCIsImRldmljZV9pZCIsImFjY2Vzc1Rva2VuIiwiYWNjZXNzX3Rva2VuIiwic2V0RGlzcGxheU5hbWUiLCJob21lc2VydmVyVXJsIiwib3ZlcndyaXRlQWNjb3VudEF1dGgiLCJhY2NvdW50SW5mbyIsImRpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIk92ZXJ3cml0ZUxvZ2luIiwiY3JlZGVudGlhbHMiLCJndWVzdCIsIm5hdmlnYXRlUGVybWFsaW5rIiwidXJpIiwiYW5kSm9pbiIsIm5hdmlnYXRlVG9QZXJtYWxpbmsiLCJwYXJ0cyIsInBhcnNlUGVybWFsaW5rIiwicm9vbUlkT3JBbGlhcyIsInJvb21JZCIsInNlcnZlcnMiLCJ2aWFTZXJ2ZXJzIiwic3RhcnRzV2l0aCIsImdldENhY2hlZFJvb21JREZvckFsaWFzIiwicmVzdWx0IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Um9vbUlkRm9yQWxpYXMiLCJyb29tX2lkIiwiVmlld1Jvb20iLCJ2aWFfc2VydmVycyIsIkpvaW5Sb29tIiwiZ2V0Q29uZmlnVmFsdWUiLCJuYW1lc3BhY2UiLCJrZXkiLCJtYXliZU9iaiJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL1Byb3hpZWRNb2R1bGVBcGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTW9kdWxlQXBpIH0gZnJvbSBcIkBtYXRyaXgtb3JnL3JlYWN0LXNkay1tb2R1bGUtYXBpL2xpYi9Nb2R1bGVBcGlcIjtcbmltcG9ydCB7IFRyYW5zbGF0aW9uU3RyaW5nc09iamVjdCB9IGZyb20gXCJAbWF0cml4LW9yZy9yZWFjdC1zZGstbW9kdWxlLWFwaS9saWIvdHlwZXMvdHJhbnNsYXRpb25zXCI7XG5pbXBvcnQgeyBPcHRpb25hbCB9IGZyb20gXCJtYXRyaXgtZXZlbnRzLXNka1wiO1xuaW1wb3J0IHsgRGlhbG9nUHJvcHMgfSBmcm9tIFwiQG1hdHJpeC1vcmcvcmVhY3Qtc2RrLW1vZHVsZS1hcGkvbGliL2NvbXBvbmVudHMvRGlhbG9nQ29udGVudFwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQWNjb3VudEF1dGhJbmZvIH0gZnJvbSBcIkBtYXRyaXgtb3JnL3JlYWN0LXNkay1tb2R1bGUtYXBpL2xpYi90eXBlcy9BY2NvdW50QXV0aEluZm9cIjtcbmltcG9ydCB7IFBsYWluU3Vic3RpdHV0aW9uIH0gZnJvbSBcIkBtYXRyaXgtb3JnL3JlYWN0LXNkay1tb2R1bGUtYXBpL2xpYi90eXBlcy90cmFuc2xhdGlvbnNcIjtcbmltcG9ydCAqIGFzIE1hdHJpeCBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbWF0cml4XCI7XG5cbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vTW9kYWxcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgTW9kdWxlVWlEaWFsb2cgfSBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL01vZHVsZVVpRGlhbG9nXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi9TZGtDb25maWdcIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi4vUGxhdGZvcm1QZWdcIjtcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IG5hdmlnYXRlVG9QZXJtYWxpbmsgfSBmcm9tIFwiLi4vdXRpbHMvcGVybWFsaW5rcy9uYXZpZ2F0b3JcIjtcbmltcG9ydCB7IHBhcnNlUGVybWFsaW5rIH0gZnJvbSBcIi4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgZ2V0Q2FjaGVkUm9vbUlERm9yQWxpYXMgfSBmcm9tIFwiLi4vUm9vbUFsaWFzQ2FjaGVcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IE92ZXJ3cml0ZUxvZ2luUGF5bG9hZCB9IGZyb20gXCIuLi9kaXNwYXRjaGVyL3BheWxvYWRzL092ZXJ3cml0ZUxvZ2luUGF5bG9hZFwiO1xuXG4vKipcbiAqIEdsdWUgYmV0d2VlbiB0aGUgYE1vZHVsZUFwaWAgaW50ZXJmYWNlIGFuZCB0aGUgcmVhY3Qtc2RrLiBBbnRpY2lwYXRlcyBvbmUgaW5zdGFuY2VcbiAqIHRvIGJlIGFzc2lnbmVkIHRvIGEgc2luZ2xlIG1vZHVsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3hpZWRNb2R1bGVBcGkgaW1wbGVtZW50cyBNb2R1bGVBcGkge1xuICAgIHByaXZhdGUgY2FjaGVkVHJhbnNsYXRpb25zOiBPcHRpb25hbDxUcmFuc2xhdGlvblN0cmluZ3NPYmplY3Q+O1xuXG4gICAgLyoqXG4gICAgICogQWxsIGN1c3RvbSB0cmFuc2xhdGlvbnMgdXNlZCBieSB0aGUgYXNzb2NpYXRlZCBtb2R1bGUuXG4gICAgICovXG4gICAgcHVibGljIGdldCB0cmFuc2xhdGlvbnMoKTogT3B0aW9uYWw8VHJhbnNsYXRpb25TdHJpbmdzT2JqZWN0PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFRyYW5zbGF0aW9ucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJUcmFuc2xhdGlvbnModHJhbnNsYXRpb25zOiBUcmFuc2xhdGlvblN0cmluZ3NPYmplY3QpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jYWNoZWRUcmFuc2xhdGlvbnMgPSB0cmFuc2xhdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgcHVibGljIHRyYW5zbGF0ZVN0cmluZyhzOiBzdHJpbmcsIHZhcmlhYmxlcz86IFJlY29yZDxzdHJpbmcsIFBsYWluU3Vic3RpdHV0aW9uPik6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBfdChzLCB2YXJpYWJsZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHB1YmxpYyBvcGVuRGlhbG9nPFxuICAgICAgICBNIGV4dGVuZHMgb2JqZWN0LFxuICAgICAgICBQIGV4dGVuZHMgRGlhbG9nUHJvcHMgPSBEaWFsb2dQcm9wcyxcbiAgICAgICAgQyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCA9IFJlYWN0LkNvbXBvbmVudCxcbiAgICA+KFxuICAgICAgICB0aXRsZTogc3RyaW5nLFxuICAgICAgICBib2R5OiAocHJvcHM6IFAsIHJlZjogUmVhY3QuUmVmT2JqZWN0PEM+KSA9PiBSZWFjdC5SZWFjdE5vZGUsXG4gICAgKTogUHJvbWlzZTx7IGRpZE9rT3JTdWJtaXQ6IGJvb2xlYW4sIG1vZGVsOiBNIH0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHsgZGlkT2tPclN1Ym1pdDogYm9vbGVhbiwgbW9kZWw6IE0gfT4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhNb2R1bGVVaURpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgICAgICBjb250ZW50RmFjdG9yeTogYm9keSxcbiAgICAgICAgICAgICAgICBjb250ZW50UHJvcHM6IDxEaWFsb2dQcm9wcz57XG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUFwaTogdGhpcyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSwgXCJteF9Db21wb3VuZERpYWxvZ1wiKS5maW5pc2hlZC50aGVuKChbZGlkT2tPclN1Ym1pdCwgbW9kZWxdKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IGRpZE9rT3JTdWJtaXQsIG1vZGVsIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyByZWdpc3RlclNpbXBsZUFjY291bnQoXG4gICAgICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgICAgIGRpc3BsYXlOYW1lPzogc3RyaW5nLFxuICAgICk6IFByb21pc2U8QWNjb3VudEF1dGhJbmZvPiB7XG4gICAgICAgIGNvbnN0IGhzVXJsID0gU2RrQ29uZmlnLmdldChcInZhbGlkYXRlZF9zZXJ2ZXJfY29uZmlnXCIpLmhzVXJsO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXguY3JlYXRlQ2xpZW50KHsgYmFzZVVybDogaHNVcmwgfSk7XG4gICAgICAgIGNvbnN0IGRldmljZU5hbWUgPSBTZGtDb25maWcuZ2V0KFwiZGVmYXVsdF9kZXZpY2VfZGlzcGxheV9uYW1lXCIpXG4gICAgICAgICAgICB8fCBQbGF0Zm9ybVBlZy5nZXQoKS5nZXREZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUoKTtcbiAgICAgICAgY29uc3QgcmVxID0ge1xuICAgICAgICAgICAgdXNlcm5hbWUsXG4gICAgICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgICAgIGluaXRpYWxfZGV2aWNlX2Rpc3BsYXlfbmFtZTogZGV2aWNlTmFtZSxcbiAgICAgICAgICAgIGF1dGg6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGluaGliaXRfbG9naW46IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjcmVkcyA9IGF3YWl0IChjbGllbnQucmVnaXN0ZXJSZXF1ZXN0KHJlcSkuY2F0Y2gocmVzcCA9PiBjbGllbnQucmVnaXN0ZXJSZXF1ZXN0KHtcbiAgICAgICAgICAgIC4uLnJlcSxcbiAgICAgICAgICAgIGF1dGg6IHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uOiByZXNwLmRhdGEuc2Vzc2lvbixcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm0ubG9naW4uZHVtbXlcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKSk7XG5cbiAgICAgICAgaWYgKGRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9maWxlQ2xpZW50ID0gTWF0cml4LmNyZWF0ZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgYmFzZVVybDogaHNVcmwsXG4gICAgICAgICAgICAgICAgdXNlcklkOiBjcmVkcy51c2VyX2lkLFxuICAgICAgICAgICAgICAgIGRldmljZUlkOiBjcmVkcy5kZXZpY2VfaWQsXG4gICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IGNyZWRzLmFjY2Vzc190b2tlbixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXdhaXQgcHJvZmlsZUNsaWVudC5zZXREaXNwbGF5TmFtZShkaXNwbGF5TmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaG9tZXNlcnZlclVybDogaHNVcmwsXG4gICAgICAgICAgICB1c2VySWQ6IGNyZWRzLnVzZXJfaWQsXG4gICAgICAgICAgICBkZXZpY2VJZDogY3JlZHMuZGV2aWNlX2lkLFxuICAgICAgICAgICAgYWNjZXNzVG9rZW46IGNyZWRzLmFjY2Vzc190b2tlbixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgb3ZlcndyaXRlQWNjb3VudEF1dGgoYWNjb3VudEluZm86IEFjY291bnRBdXRoSW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBkaXNwYXRjaGVyLmRpc3BhdGNoPE92ZXJ3cml0ZUxvZ2luUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uT3ZlcndyaXRlTG9naW4sXG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgIC4uLmFjY291bnRJbmZvLFxuICAgICAgICAgICAgICAgIGd1ZXN0OiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sIHRydWUpOyAvLyByZXF1aXJlIHRvIGJlIHN5bmMgdG8gbWF0Y2ggaW5oZXJpdGVkIGludGVyZmFjZSBiZWhhdmlvdXJcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgbmF2aWdhdGVQZXJtYWxpbmsodXJpOiBzdHJpbmcsIGFuZEpvaW4/OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIG5hdmlnYXRlVG9QZXJtYWxpbmsodXJpKTtcblxuICAgICAgICBjb25zdCBwYXJ0cyA9IHBhcnNlUGVybWFsaW5rKHVyaSk7XG4gICAgICAgIGlmIChwYXJ0cy5yb29tSWRPckFsaWFzICYmIGFuZEpvaW4pIHtcbiAgICAgICAgICAgIGxldCByb29tSWQgPSBwYXJ0cy5yb29tSWRPckFsaWFzO1xuICAgICAgICAgICAgbGV0IHNlcnZlcnMgPSBwYXJ0cy52aWFTZXJ2ZXJzO1xuICAgICAgICAgICAgaWYgKHJvb21JZC5zdGFydHNXaXRoKFwiI1wiKSkge1xuICAgICAgICAgICAgICAgIHJvb21JZCA9IGdldENhY2hlZFJvb21JREZvckFsaWFzKHBhcnRzLnJvb21JZE9yQWxpYXMpO1xuICAgICAgICAgICAgICAgIGlmICghcm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFsaWFzIHJlc29sdXRpb24gZmFpbGVkXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tSWRGb3JBbGlhcyhwYXJ0cy5yb29tSWRPckFsaWFzKTtcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkID0gcmVzdWx0LnJvb21faWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VydmVycykgc2VydmVycyA9IHJlc3VsdC5zZXJ2ZXJzOyAvLyB1c2UgcHJvdmlkZWQgc2VydmVycyBmaXJzdCwgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgIHZpYV9zZXJ2ZXJzOiBzZXJ2ZXJzLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChhbmRKb2luKSB7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkpvaW5Sb29tLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgcHVibGljIGdldENvbmZpZ1ZhbHVlPFQ+KG5hbWVzcGFjZTogc3RyaW5nLCBrZXk6IHN0cmluZyk6IFQge1xuICAgICAgICAvLyBGb3JjZSBjYXN0IHRvIGBhbnlgIGJlY2F1c2UgdGhlIG5hbWVzcGFjZSB3b24ndCBiZSBrbm93biB0byB0aGUgU2RrQ29uZmlnIHR5cGVzXG4gICAgICAgIGNvbnN0IG1heWJlT2JqID0gU2RrQ29uZmlnLmdldChuYW1lc3BhY2UgYXMgYW55KTtcbiAgICAgICAgaWYgKCFtYXliZU9iaiB8fCAhKHR5cGVvZiBtYXliZU9iaiA9PT0gXCJvYmplY3RcIikpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBtYXliZU9ialtrZXldO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUF1QkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLGdCQUFOLENBQTRDO0VBQUE7SUFBQTtFQUFBOztFQUcvQztBQUNKO0FBQ0E7RUFDMkIsSUFBWkMsWUFBWSxHQUF1QztJQUMxRCxPQUFPLEtBQUtDLGtCQUFaO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7OztFQUNXQyxvQkFBb0IsQ0FBQ0YsWUFBRCxFQUErQztJQUN0RSxLQUFLQyxrQkFBTCxHQUEwQkQsWUFBMUI7RUFDSDtFQUVEO0FBQ0o7QUFDQTs7O0VBQ1dHLGVBQWUsQ0FBQ0MsQ0FBRCxFQUFZQyxTQUFaLEVBQW1FO0lBQ3JGLE9BQU8sSUFBQUMsbUJBQUEsRUFBR0YsQ0FBSCxFQUFNQyxTQUFOLENBQVA7RUFDSDtFQUVEO0FBQ0o7QUFDQTs7O0VBQ1dFLFVBQVUsQ0FLYkMsS0FMYSxFQU1iQyxJQU5hLEVBT2dDO0lBQzdDLE9BQU8sSUFBSUMsT0FBSixDQUFtREMsT0FBRCxJQUFhO01BQ2xFQyxjQUFBLENBQU1DLFlBQU4sQ0FBbUJDLDhCQUFuQixFQUFtQztRQUMvQk4sS0FBSyxFQUFFQSxLQUR3QjtRQUUvQk8sY0FBYyxFQUFFTixJQUZlO1FBRy9CTyxZQUFZLEVBQWU7VUFDdkJDLFNBQVMsRUFBRTtRQURZO01BSEksQ0FBbkMsRUFNRyxtQkFOSCxFQU13QkMsUUFOeEIsQ0FNaUNDLElBTmpDLENBTXNDLFFBQTRCO1FBQUEsSUFBM0IsQ0FBQ0MsYUFBRCxFQUFnQkMsS0FBaEIsQ0FBMkI7UUFDOURWLE9BQU8sQ0FBQztVQUFF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