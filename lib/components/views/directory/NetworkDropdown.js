"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetworkDropdown = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _react = _interopRequireWildcard(require("react"));

var _MenuItemRadio = require("../../../accessibility/context_menu/MenuItemRadio");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _GenericDropdownMenu = require("../../structures/GenericDropdownMenu");

var _TextInputDialog = _interopRequireDefault(require("../dialogs/TextInputDialog"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const SETTING_NAME = "room_directory_servers";
const validServer = (0, _Validation.default)({
  deriveData: async _ref => {
    let {
      value
    } = _ref;

    try {
      // check if we can successfully load this server's room directory
      await _MatrixClientPeg.MatrixClientPeg.get().publicRooms({
        limit: 1,
        server: value
      });
      return {};
    } catch (error) {
      return {
        error
      };
    }
  },
  rules: [{
    key: "required",
    test: async _ref2 => {
      let {
        value
      } = _ref2;
      return !!value;
    },
    invalid: () => (0, _languageHandler._t)("Enter a server name")
  }, {
    key: "available",
    final: true,
    test: async (_, _ref3) => {
      let {
        error
      } = _ref3;
      return !error;
    },
    valid: () => (0, _languageHandler._t)("Looks good"),
    invalid: _ref4 => {
      let {
        error
      } = _ref4;
      return error?.errcode === "M_FORBIDDEN" ? (0, _languageHandler._t)("You are not allowed to view this server's rooms list") : (0, _languageHandler._t)("Can't find this server or its room list");
    }
  }]
});

function useSettingsValueWithSetter(settingName, level) {
  let roomId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  let excludeDefault = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  const [value, setValue] = (0, _react.useState)(_SettingsStore.default.getValue(settingName, roomId ?? undefined, excludeDefault));
  const setter = (0, _react.useCallback)(async value => {
    setValue(value);

    _SettingsStore.default.setValue(settingName, roomId, level, value);
  }, [level, roomId, settingName]);
  (0, _react.useEffect)(() => {
    const ref = _SettingsStore.default.watchSetting(settingName, roomId, () => {
      setValue(_SettingsStore.default.getValue(settingName, roomId, excludeDefault));
    }); // clean-up


    return () => {
      _SettingsStore.default.unwatchSetting(ref);
    };
  }, [settingName, roomId, excludeDefault]);
  return [value, setter];
}

function removeAll(target) {
  for (var _len = arguments.length, toRemove = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    toRemove[_key - 1] = arguments[_key];
  }

  for (const value of toRemove) {
    target.delete(value);
  }
}

function useServers() {
  const [userDefinedServers, setUserDefinedServers] = useSettingsValueWithSetter(SETTING_NAME, _SettingLevel.SettingLevel.ACCOUNT);

  const homeServer = _MatrixClientPeg.MatrixClientPeg.getHomeserverName();

  const configServers = new Set(_SdkConfig.default.getObject("room_directory")?.get("servers") ?? []);
  removeAll(configServers, homeServer); // configured servers take preference over user-defined ones, if one occurs in both ignore the latter one.

  const removableServers = new Set(userDefinedServers);
  removeAll(removableServers, homeServer);
  removeAll(removableServers, ...configServers);
  return {
    allServers: [// we always show our connected HS, this takes precedence over it being configured or user-defined
    homeServer, ...Array.from(configServers).sort(), ...Array.from(removableServers).sort()],
    homeServer,
    userDefinedServers: Array.from(removableServers).sort(),
    setUserDefinedServers
  };
}

const NetworkDropdown = _ref5 => {
  let {
    protocols,
    config,
    setConfig
  } = _ref5;
  const {
    allServers,
    homeServer,
    userDefinedServers,
    setUserDefinedServers
  } = useServers();
  const options = allServers.map(roomServer => _objectSpread({
    key: {
      roomServer,
      instanceId: null
    },
    label: roomServer,
    description: roomServer === homeServer ? (0, _languageHandler._t)("Your server") : null,
    options: [{
      key: {
        roomServer,
        instanceId: undefined
      },
      label: (0, _languageHandler._t)("Matrix")
    }, ...(roomServer === homeServer && protocols ? Object.values(protocols).flatMap(protocol => protocol.instances).map(instance => ({
      key: {
        roomServer,
        instanceId: instance.instance_id
      },
      label: instance.desc
    })) : [])]
  }, userDefinedServers.includes(roomServer) ? {
    adornment: /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_NetworkDropdown_removeServer",
      alt: (0, _languageHandler._t)("Remove server “%(roomServer)s”", {
        roomServer
      }),
      onClick: () => setUserDefinedServers((0, _lodash.without)(userDefinedServers, roomServer))
    })
  } : {}));
  const addNewServer = (0, _react.useCallback)(_ref6 => {
    let {
      closeMenu
    } = _ref6;
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_GenericDropdownMenu_divider"
    }), /*#__PURE__*/_react.default.createElement(_MenuItemRadio.MenuItemRadio, {
      active: false,
      className: "mx_GenericDropdownMenu_Option mx_GenericDropdownMenu_Option--item",
      onClick: async () => {
        closeMenu();

        const {
          finished
        } = _Modal.default.createDialog(_TextInputDialog.default, {
          title: (0, _languageHandler._t)("Add a new server"),
          description: (0, _languageHandler._t)("Enter the name of a new server you want to explore."),
          button: (0, _languageHandler._t)("Add"),
          hasCancel: false,
          placeholder: (0, _languageHandler._t)("Server name"),
          validator: validServer,
          fixedWidth: false
        }, "mx_NetworkDropdown_dialog");

        const [ok, newServer] = await finished;
        if (!ok) return;

        if (!allServers.includes(newServer)) {
          setUserDefinedServers([...userDefinedServers, newServer]);
          setConfig({
            roomServer: newServer
          });
        }
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GenericDropdownMenu_Option--label"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_NetworkDropdown_addServer"
    }, (0, _languageHandler._t)("Add new server…")))));
  }, [allServers, setConfig, setUserDefinedServers, userDefinedServers]);
  return /*#__PURE__*/_react.default.createElement(_GenericDropdownMenu.GenericDropdownMenu, {
    className: "mx_NetworkDropdown_wrapper",
    value: config,
    toKey: config => config ? `${config.roomServer}-${config.instanceId}` : "null",
    options: options,
    onChange: option => setConfig(option),
    selectedLabel: option => option?.key ? (0, _languageHandler._t)("Show: %(instance)s rooms (%(server)s)", {
      server: option.key.roomServer,
      instance: option.key.instanceId ? option.label : "Matrix"
    }) : (0, _languageHandler._t)("Show: Matrix rooms"),
    AdditionalOptions: addNewServer
  });
};

exports.NetworkDropdown = NetworkDropdown;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTRVRUSU5HX05BTUUiLCJ2YWxpZFNlcnZlciIsIndpdGhWYWxpZGF0aW9uIiwiZGVyaXZlRGF0YSIsInZhbHVlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwicHVibGljUm9vbXMiLCJsaW1pdCIsInNlcnZlciIsImVycm9yIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiaW52YWxpZCIsIl90IiwiZmluYWwiLCJfIiwidmFsaWQiLCJlcnJjb2RlIiwidXNlU2V0dGluZ3NWYWx1ZVdpdGhTZXR0ZXIiLCJzZXR0aW5nTmFtZSIsImxldmVsIiwicm9vbUlkIiwiZXhjbHVkZURlZmF1bHQiLCJzZXRWYWx1ZSIsInVzZVN0YXRlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwidW5kZWZpbmVkIiwic2V0dGVyIiwidXNlQ2FsbGJhY2siLCJ1c2VFZmZlY3QiLCJyZWYiLCJ3YXRjaFNldHRpbmciLCJ1bndhdGNoU2V0dGluZyIsInJlbW92ZUFsbCIsInRhcmdldCIsInRvUmVtb3ZlIiwiZGVsZXRlIiwidXNlU2VydmVycyIsInVzZXJEZWZpbmVkU2VydmVycyIsInNldFVzZXJEZWZpbmVkU2VydmVycyIsIlNldHRpbmdMZXZlbCIsIkFDQ09VTlQiLCJob21lU2VydmVyIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJjb25maWdTZXJ2ZXJzIiwiU2V0IiwiU2RrQ29uZmlnIiwiZ2V0T2JqZWN0IiwicmVtb3ZhYmxlU2VydmVycyIsImFsbFNlcnZlcnMiLCJBcnJheSIsImZyb20iLCJzb3J0IiwiTmV0d29ya0Ryb3Bkb3duIiwicHJvdG9jb2xzIiwiY29uZmlnIiwic2V0Q29uZmlnIiwib3B0aW9ucyIsIm1hcCIsInJvb21TZXJ2ZXIiLCJpbnN0YW5jZUlkIiwibGFiZWwiLCJkZXNjcmlwdGlvbiIsIk9iamVjdCIsInZhbHVlcyIsImZsYXRNYXAiLCJwcm90b2NvbCIsImluc3RhbmNlcyIsImluc3RhbmNlIiwiaW5zdGFuY2VfaWQiLCJkZXNjIiwiaW5jbHVkZXMiLCJhZG9ybm1lbnQiLCJ3aXRob3V0IiwiYWRkTmV3U2VydmVyIiwiY2xvc2VNZW51IiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlRleHRJbnB1dERpYWxvZyIsInRpdGxlIiwiYnV0dG9uIiwiaGFzQ2FuY2VsIiwicGxhY2Vob2xkZXIiLCJ2YWxpZGF0b3IiLCJmaXhlZFdpZHRoIiwib2siLCJuZXdTZXJ2ZXIiLCJvcHRpb24iXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaXJlY3RvcnkvTmV0d29ya0Ryb3Bkb3duLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyB3aXRob3V0IH0gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IFJlYWN0LCB7IHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBNYXRyaXhFcnJvciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXhcIjtcblxuaW1wb3J0IHsgTWVudUl0ZW1SYWRpbyB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51SXRlbVJhZGlvXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFByb3RvY29scyB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9EaXJlY3RvcnlVdGlsc1wiO1xuaW1wb3J0IHsgR2VuZXJpY0Ryb3Bkb3duTWVudSwgR2VuZXJpY0Ryb3Bkb3duTWVudUl0ZW0gfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9HZW5lcmljRHJvcGRvd25NZW51XCI7XG5pbXBvcnQgVGV4dElucHV0RGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL1RleHRJbnB1dERpYWxvZ1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiBmcm9tIFwiLi4vZWxlbWVudHMvVmFsaWRhdGlvblwiO1xuXG5jb25zdCBTRVRUSU5HX05BTUUgPSBcInJvb21fZGlyZWN0b3J5X3NlcnZlcnNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJUHVibGljUm9vbURpcmVjdG9yeUNvbmZpZyB7XG4gICAgcm9vbVNlcnZlcjogc3RyaW5nO1xuICAgIGluc3RhbmNlSWQ/OiBzdHJpbmc7XG59XG5cbmNvbnN0IHZhbGlkU2VydmVyID0gd2l0aFZhbGlkYXRpb248dW5kZWZpbmVkLCB7IGVycm9yPzogTWF0cml4RXJyb3IgfT4oe1xuICAgIGRlcml2ZURhdGE6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHdlIGNhbiBzdWNjZXNzZnVsbHkgbG9hZCB0aGlzIHNlcnZlcidzIHJvb20gZGlyZWN0b3J5XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucHVibGljUm9vbXMoe1xuICAgICAgICAgICAgICAgIGxpbWl0OiAxLFxuICAgICAgICAgICAgICAgIHNlcnZlcjogdmFsdWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7IGVycm9yIH07XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgdGVzdDogYXN5bmMgKHsgdmFsdWUgfSkgPT4gISF2YWx1ZSxcbiAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgYSBzZXJ2ZXIgbmFtZVwiKSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAga2V5OiBcImF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgZmluYWw6IHRydWUsXG4gICAgICAgICAgICB0ZXN0OiBhc3luYyAoXywgeyBlcnJvciB9KSA9PiAhZXJyb3IsXG4gICAgICAgICAgICB2YWxpZDogKCkgPT4gX3QoXCJMb29rcyBnb29kXCIpLFxuICAgICAgICAgICAgaW52YWxpZDogKHsgZXJyb3IgfSkgPT4gZXJyb3I/LmVycmNvZGUgPT09IFwiTV9GT1JCSURERU5cIlxuICAgICAgICAgICAgICAgID8gX3QoXCJZb3UgYXJlIG5vdCBhbGxvd2VkIHRvIHZpZXcgdGhpcyBzZXJ2ZXIncyByb29tcyBsaXN0XCIpXG4gICAgICAgICAgICAgICAgOiBfdChcIkNhbid0IGZpbmQgdGhpcyBzZXJ2ZXIgb3IgaXRzIHJvb20gbGlzdFwiKSxcbiAgICAgICAgfSxcbiAgICBdLFxufSk7XG5cbmZ1bmN0aW9uIHVzZVNldHRpbmdzVmFsdWVXaXRoU2V0dGVyPFQ+KFxuICAgIHNldHRpbmdOYW1lOiBzdHJpbmcsXG4gICAgbGV2ZWw6IFNldHRpbmdMZXZlbCxcbiAgICByb29tSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsLFxuICAgIGV4Y2x1ZGVEZWZhdWx0ID0gZmFsc2UsXG4pOiBbVCwgKHZhbHVlOiBUKSA9PiBQcm9taXNlPHZvaWQ+XSB7XG4gICAgY29uc3QgW3ZhbHVlLCBzZXRWYWx1ZV0gPSB1c2VTdGF0ZShTZXR0aW5nc1N0b3JlLmdldFZhbHVlPFQ+KHNldHRpbmdOYW1lLCByb29tSWQgPz8gdW5kZWZpbmVkLCBleGNsdWRlRGVmYXVsdCkpO1xuICAgIGNvbnN0IHNldHRlciA9IHVzZUNhbGxiYWNrKFxuICAgICAgICBhc3luYyAodmFsdWU6IFQpID0+IHtcbiAgICAgICAgICAgIHNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoc2V0dGluZ05hbWUsIHJvb21JZCwgbGV2ZWwsIHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgW2xldmVsLCByb29tSWQsIHNldHRpbmdOYW1lXSxcbiAgICApO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoc2V0dGluZ05hbWUsIHJvb21JZCwgKCkgPT4ge1xuICAgICAgICAgICAgc2V0VmFsdWUoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZTxUPihzZXR0aW5nTmFtZSwgcm9vbUlkLCBleGNsdWRlRGVmYXVsdCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gY2xlYW4tdXBcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcocmVmKTtcbiAgICAgICAgfTtcbiAgICB9LCBbc2V0dGluZ05hbWUsIHJvb21JZCwgZXhjbHVkZURlZmF1bHRdKTtcblxuICAgIHJldHVybiBbdmFsdWUsIHNldHRlcl07XG59XG5cbmludGVyZmFjZSBTZXJ2ZXJMaXN0IHtcbiAgICBhbGxTZXJ2ZXJzOiBzdHJpbmdbXTtcbiAgICBob21lU2VydmVyOiBzdHJpbmc7XG4gICAgdXNlckRlZmluZWRTZXJ2ZXJzOiBzdHJpbmdbXTtcbiAgICBzZXRVc2VyRGVmaW5lZFNlcnZlcnM6IChzZXJ2ZXJzOiBzdHJpbmdbXSkgPT4gdm9pZDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQWxsPFQ+KHRhcmdldDogU2V0PFQ+LCAuLi50b1JlbW92ZTogVFtdKSB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB0b1JlbW92ZSkge1xuICAgICAgICB0YXJnZXQuZGVsZXRlKHZhbHVlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVzZVNlcnZlcnMoKTogU2VydmVyTGlzdCB7XG4gICAgY29uc3QgW3VzZXJEZWZpbmVkU2VydmVycywgc2V0VXNlckRlZmluZWRTZXJ2ZXJzXSA9IHVzZVNldHRpbmdzVmFsdWVXaXRoU2V0dGVyPHN0cmluZ1tdPihcbiAgICAgICAgU0VUVElOR19OQU1FLFxuICAgICAgICBTZXR0aW5nTGV2ZWwuQUNDT1VOVCxcbiAgICApO1xuXG4gICAgY29uc3QgaG9tZVNlcnZlciA9IE1hdHJpeENsaWVudFBlZy5nZXRIb21lc2VydmVyTmFtZSgpO1xuICAgIGNvbnN0IGNvbmZpZ1NlcnZlcnMgPSBuZXcgU2V0PHN0cmluZz4oXG4gICAgICAgIFNka0NvbmZpZy5nZXRPYmplY3QoXCJyb29tX2RpcmVjdG9yeVwiKT8uZ2V0KFwic2VydmVyc1wiKSA/PyBbXSxcbiAgICApO1xuICAgIHJlbW92ZUFsbChjb25maWdTZXJ2ZXJzLCBob21lU2VydmVyKTtcbiAgICAvLyBjb25maWd1cmVkIHNlcnZlcnMgdGFrZSBwcmVmZXJlbmNlIG92ZXIgdXNlci1kZWZpbmVkIG9uZXMsIGlmIG9uZSBvY2N1cnMgaW4gYm90aCBpZ25vcmUgdGhlIGxhdHRlciBvbmUuXG4gICAgY29uc3QgcmVtb3ZhYmxlU2VydmVycyA9IG5ldyBTZXQodXNlckRlZmluZWRTZXJ2ZXJzKTtcbiAgICByZW1vdmVBbGwocmVtb3ZhYmxlU2VydmVycywgaG9tZVNlcnZlcik7XG4gICAgcmVtb3ZlQWxsKHJlbW92YWJsZVNlcnZlcnMsIC4uLmNvbmZpZ1NlcnZlcnMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxsU2VydmVyczogW1xuICAgICAgICAgICAgLy8gd2UgYWx3YXlzIHNob3cgb3VyIGNvbm5lY3RlZCBIUywgdGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgaXQgYmVpbmcgY29uZmlndXJlZCBvciB1c2VyLWRlZmluZWRcbiAgICAgICAgICAgIGhvbWVTZXJ2ZXIsXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKGNvbmZpZ1NlcnZlcnMpLnNvcnQoKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20ocmVtb3ZhYmxlU2VydmVycykuc29ydCgpLFxuICAgICAgICBdLFxuICAgICAgICBob21lU2VydmVyLFxuICAgICAgICB1c2VyRGVmaW5lZFNlcnZlcnM6IEFycmF5LmZyb20ocmVtb3ZhYmxlU2VydmVycykuc29ydCgpLFxuICAgICAgICBzZXRVc2VyRGVmaW5lZFNlcnZlcnMsXG4gICAgfTtcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcHJvdG9jb2xzOiBQcm90b2NvbHMgfCBudWxsO1xuICAgIGNvbmZpZzogSVB1YmxpY1Jvb21EaXJlY3RvcnlDb25maWcgfCBudWxsO1xuICAgIHNldENvbmZpZzogKHZhbHVlOiBJUHVibGljUm9vbURpcmVjdG9yeUNvbmZpZyB8IG51bGwpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBOZXR3b3JrRHJvcGRvd24gPSAoeyBwcm90b2NvbHMsIGNvbmZpZywgc2V0Q29uZmlnIH06IElQcm9wcykgPT4ge1xuICAgIGNvbnN0IHsgYWxsU2VydmVycywgaG9tZVNlcnZlciwgdXNlckRlZmluZWRTZXJ2ZXJzLCBzZXRVc2VyRGVmaW5lZFNlcnZlcnMgfSA9IHVzZVNlcnZlcnMoKTtcblxuICAgIGNvbnN0IG9wdGlvbnM6IEdlbmVyaWNEcm9wZG93bk1lbnVJdGVtPElQdWJsaWNSb29tRGlyZWN0b3J5Q29uZmlnIHwgbnVsbD5bXSA9IGFsbFNlcnZlcnMubWFwKHJvb21TZXJ2ZXIgPT4gKHtcbiAgICAgICAga2V5OiB7IHJvb21TZXJ2ZXIsIGluc3RhbmNlSWQ6IG51bGwgfSxcbiAgICAgICAgbGFiZWw6IHJvb21TZXJ2ZXIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiByb29tU2VydmVyID09PSBob21lU2VydmVyID8gX3QoXCJZb3VyIHNlcnZlclwiKSA6IG51bGwsXG4gICAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IHsgcm9vbVNlcnZlciwgaW5zdGFuY2VJZDogdW5kZWZpbmVkIH0sXG4gICAgICAgICAgICAgICAgbGFiZWw6IF90KFwiTWF0cml4XCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC4uLihyb29tU2VydmVyID09PSBob21lU2VydmVyICYmIHByb3RvY29scyA/IE9iamVjdC52YWx1ZXMocHJvdG9jb2xzKVxuICAgICAgICAgICAgICAgIC5mbGF0TWFwKHByb3RvY29sID0+IHByb3RvY29sLmluc3RhbmNlcylcbiAgICAgICAgICAgICAgICAubWFwKGluc3RhbmNlID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogeyByb29tU2VydmVyLCBpbnN0YW5jZUlkOiBpbnN0YW5jZS5pbnN0YW5jZV9pZCB9LFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogaW5zdGFuY2UuZGVzYyxcbiAgICAgICAgICAgICAgICB9KSkgOiBbXSksXG4gICAgICAgIF0sXG4gICAgICAgIC4uLih1c2VyRGVmaW5lZFNlcnZlcnMuaW5jbHVkZXMocm9vbVNlcnZlcikgPyAoe1xuICAgICAgICAgICAgYWRvcm5tZW50OiAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTmV0d29ya0Ryb3Bkb3duX3JlbW92ZVNlcnZlclwiXG4gICAgICAgICAgICAgICAgICAgIGFsdD17X3QoXCJSZW1vdmUgc2VydmVyIOKAnCUocm9vbVNlcnZlcilz4oCdXCIsIHsgcm9vbVNlcnZlciB9KX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VXNlckRlZmluZWRTZXJ2ZXJzKHdpdGhvdXQodXNlckRlZmluZWRTZXJ2ZXJzLCByb29tU2VydmVyKSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICksXG4gICAgICAgIH0pIDoge30pLFxuICAgIH0pKTtcblxuICAgIGNvbnN0IGFkZE5ld1NlcnZlciA9IHVzZUNhbGxiYWNrKCh7IGNsb3NlTWVudSB9KSA9PiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9HZW5lcmljRHJvcGRvd25NZW51X2RpdmlkZXJcIiAvPlxuICAgICAgICAgICAgPE1lbnVJdGVtUmFkaW9cbiAgICAgICAgICAgICAgICBhY3RpdmU9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0dlbmVyaWNEcm9wZG93bk1lbnVfT3B0aW9uIG14X0dlbmVyaWNEcm9wZG93bk1lbnVfT3B0aW9uLS1pdGVtXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2coVGV4dElucHV0RGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJBZGQgYSBuZXcgc2VydmVyXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiRW50ZXIgdGhlIG5hbWUgb2YgYSBuZXcgc2VydmVyIHlvdSB3YW50IHRvIGV4cGxvcmUuXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiBfdChcIkFkZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogX3QoXCJTZXJ2ZXIgbmFtZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRvcjogdmFsaWRTZXJ2ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXhlZFdpZHRoOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgfSwgXCJteF9OZXR3b3JrRHJvcGRvd25fZGlhbG9nXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtvaywgbmV3U2VydmVyXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9rKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGxTZXJ2ZXJzLmluY2x1ZGVzKG5ld1NlcnZlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFVzZXJEZWZpbmVkU2VydmVycyhbLi4udXNlckRlZmluZWRTZXJ2ZXJzLCBuZXdTZXJ2ZXJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbmZpZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbVNlcnZlcjogbmV3U2VydmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR2VuZXJpY0Ryb3Bkb3duTWVudV9PcHRpb24tLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X05ldHdvcmtEcm9wZG93bl9hZGRTZXJ2ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBZGQgbmV3IHNlcnZlcuKAplwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvTWVudUl0ZW1SYWRpbz5cbiAgICAgICAgPC8+XG4gICAgKSwgW2FsbFNlcnZlcnMsIHNldENvbmZpZywgc2V0VXNlckRlZmluZWRTZXJ2ZXJzLCB1c2VyRGVmaW5lZFNlcnZlcnNdKTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxHZW5lcmljRHJvcGRvd25NZW51XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9OZXR3b3JrRHJvcGRvd25fd3JhcHBlclwiXG4gICAgICAgICAgICB2YWx1ZT17Y29uZmlnfVxuICAgICAgICAgICAgdG9LZXk9eyhjb25maWc6IElQdWJsaWNSb29tRGlyZWN0b3J5Q29uZmlnIHwgbnVsbCkgPT5cbiAgICAgICAgICAgICAgICBjb25maWcgPyBgJHtjb25maWcucm9vbVNlcnZlcn0tJHtjb25maWcuaW5zdGFuY2VJZH1gIDogXCJudWxsXCJ9XG4gICAgICAgICAgICBvcHRpb25zPXtvcHRpb25zfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhvcHRpb24pID0+IHNldENvbmZpZyhvcHRpb24pfVxuICAgICAgICAgICAgc2VsZWN0ZWRMYWJlbD17b3B0aW9uID0+IG9wdGlvbj8ua2V5ID8gX3QoXCJTaG93OiAlKGluc3RhbmNlKXMgcm9vbXMgKCUoc2VydmVyKXMpXCIsIHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXI6IG9wdGlvbi5rZXkucm9vbVNlcnZlcixcbiAgICAgICAgICAgICAgICBpbnN0YW5jZTogb3B0aW9uLmtleS5pbnN0YW5jZUlkID8gb3B0aW9uLmxhYmVsIDogXCJNYXRyaXhcIixcbiAgICAgICAgICAgIH0pIDogX3QoXCJTaG93OiBNYXRyaXggcm9vbXNcIil9XG4gICAgICAgICAgICBBZGRpdGlvbmFsT3B0aW9ucz17YWRkTmV3U2VydmVyfVxuICAgICAgICAvPlxuICAgICk7XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBLE1BQU1BLFlBQVksR0FBRyx3QkFBckI7QUFPQSxNQUFNQyxXQUFXLEdBQUcsSUFBQUMsbUJBQUEsRUFBbUQ7RUFDbkVDLFVBQVUsRUFBRSxjQUFxQjtJQUFBLElBQWQ7TUFBRUM7SUFBRixDQUFjOztJQUM3QixJQUFJO01BQ0E7TUFDQSxNQUFNQyxnQ0FBQSxDQUFnQkMsR0FBaEIsR0FBc0JDLFdBQXRCLENBQWtDO1FBQ3BDQyxLQUFLLEVBQUUsQ0FENkI7UUFFcENDLE1BQU0sRUFBRUw7TUFGNEIsQ0FBbEMsQ0FBTjtNQUlBLE9BQU8sRUFBUDtJQUNILENBUEQsQ0FPRSxPQUFPTSxLQUFQLEVBQWM7TUFDWixPQUFPO1FBQUVBO01BQUYsQ0FBUDtJQUNIO0VBQ0osQ0Faa0U7RUFhbkVDLEtBQUssRUFBRSxDQUNIO0lBQ0lDLEdBQUcsRUFBRSxVQURUO0lBRUlDLElBQUksRUFBRTtNQUFBLElBQU87UUFBRVQ7TUFBRixDQUFQO01BQUEsT0FBcUIsQ0FBQyxDQUFDQSxLQUF2QjtJQUFBLENBRlY7SUFHSVUsT0FBTyxFQUFFLE1BQU0sSUFBQUMsbUJB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