"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getDisplayAliasForRoom = getDisplayAliasForRoom;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _partials = require("matrix-js-sdk/src/@types/partials");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _languageHandler = require("../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _DirectoryUtils = require("../../utils/DirectoryUtils");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _NetworkDropdown = require("../views/directory/NetworkDropdown");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _ErrorDialog = _interopRequireDefault(require("../views/dialogs/ErrorDialog"));

var _QuestionDialog = _interopRequireDefault(require("../views/dialogs/QuestionDialog"));

var _BaseDialog = _interopRequireDefault(require("../views/dialogs/BaseDialog"));

var _DirectorySearchBox = _interopRequireDefault(require("../views/elements/DirectorySearchBox"));

var _ScrollPanel = _interopRequireDefault(require("./ScrollPanel"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _Rooms = require("../../Rooms");

var _PosthogTrackers = _interopRequireDefault(require("../../PosthogTrackers"));

var _PublicRoomTile = require("../views/rooms/PublicRoomTile");

var _rooms = require("../../utils/rooms");

var _error = require("../../utils/error");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const LAST_SERVER_KEY = "mx_last_room_directory_server";
const LAST_INSTANCE_KEY = "mx_last_room_directory_instance";

class RoomDirectory extends _react.default.Component {
  constructor(props) {
    var _this;

    super(props);
    _this = this;
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "nextBatch", null);
    (0, _defineProperty2.default)(this, "filterTimeout", void 0);
    (0, _defineProperty2.default)(this, "protocols", void 0);
    (0, _defineProperty2.default)(this, "refreshRoomList", () => {
      this.nextBatch = null;
      this.setState({
        publicRooms: [],
        loading: true
      });
      this.getMoreRooms();
    });
    (0, _defineProperty2.default)(this, "removeFromDirectory", room => {
      const alias = getDisplayAliasForRoom(room);
      const name = room.name || alias || (0, _languageHandler._t)('Unnamed room');
      let desc;

      if (alias) {
        desc = (0, _languageHandler._t)('Delete the room address %(alias)s and remove %(name)s from the directory?', {
          alias,
          name
        });
      } else {
        desc = (0, _languageHandler._t)('Remove %(name)s from the directory?', {
          name: name
        });
      }

      _Modal.default.createDialog(_QuestionDialog.default, {
        title: (0, _languageHandler._t)('Remove from Directory'),
        description: desc,
        onFinished: shouldDelete => {
          if (!shouldDelete) return;

          const modal = _Modal.default.createDialog(_Spinner.default);

          let step = (0, _languageHandler._t)('remove %(name)s from the directory.', {
            name: name
          });

          _MatrixClientPeg.MatrixClientPeg.get().setRoomDirectoryVisibility(room.room_id, _partials.Visibility.Private).then(() => {
            if (!alias) return;
            step = (0, _languageHandler._t)('delete the address.');
            return _MatrixClientPeg.MatrixClientPeg.get().deleteAlias(alias);
          }).then(() => {
            modal.close();
            this.refreshRoomList();
          }, err => {
            modal.close();
            this.refreshRoomList();

            _logger.logger.error("Failed to " + step + ": " + err);

            _Modal.default.createDialog(_ErrorDialog.default, {
              title: (0, _languageHandler._t)('Error'),
              description: err && err.message ? err.message : (0, _languageHandler._t)('The server may be unavailable or overloaded')
            });
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "onOptionChange", serverConfig => {
      // clear next batch so we don't try to load more rooms
      this.nextBatch = null;
      this.setState({
        // Clear the public rooms out here otherwise we needlessly
        // spend time filtering lots of rooms when we're about to
        // to clear the list anyway.
        publicRooms: [],
        serverConfig,
        error: null
      }, this.refreshRoomList); // We also refresh the room list each time even though this
      // filtering is client-side. It hopefully won't be client side
      // for very long, and we may have fetched a thousand rooms to
      // find the five gitter ones, at which point we do not want
      // to render all those rooms when switching back to 'all networks'.
      // Easiest to just blow away the state & re-fetch.
      // We have to be careful here so that we don't set instanceId = "undefined"

      localStorage.setItem(LAST_SERVER_KEY, serverConfig.roomServer);

      if (serverConfig.instanceId) {
        localStorage.setItem(LAST_INSTANCE_KEY, serverConfig.instanceId);
      } else {
        localStorage.removeItem(LAST_INSTANCE_KEY);
      }
    });
    (0, _defineProperty2.default)(this, "onFillRequest", backwards => {
      if (backwards || !this.nextBatch) return Promise.resolve(false);
      return this.getMoreRooms();
    });
    (0, _defineProperty2.default)(this, "onFilterChange", alias => {
      this.setState({
        filterString: alias?.trim() || ""
      }); // don't send the request for a little bit,
      // no point hammering the server with a
      // request for every keystroke, let the
      // user finish typing.

      if (this.filterTimeout) {
        clearTimeout(this.filterTimeout);
      }

      this.filterTimeout = setTimeout(() => {
        this.filterTimeout = null;
        this.refreshRoomList();
      }, 700);
    });
    (0, _defineProperty2.default)(this, "onFilterClear", () => {
      // update immediately
      this.setState({
        filterString: ""
      }, this.refreshRoomList);

      if (this.filterTimeout) {
        clearTimeout(this.filterTimeout);
      }
    });
    (0, _defineProperty2.default)(this, "onJoinFromSearchClick", alias => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        (0, _rooms.joinRoomByAlias)(cli, alias, {
          instanceId: this.state.serverConfig?.instanceId,
          roomServer: this.state.serverConfig?.roomServer,
          protocols: this.protocols,
          metricsTrigger: "RoomDirectory"
        });
      } catch (e) {
        if (e instanceof _error.GenericError) {
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: e.message,
            description: e.description
          });
        } else {
          throw e;
        }
      }
    });
    (0, _defineProperty2.default)(this, "onCreateRoomClick", ev => {
      this.onFinished();

      _dispatcher.default.dispatch({
        action: 'view_create_room',
        public: true,
        defaultName: this.state.filterString.trim()
      });

      _PosthogTrackers.default.trackInteraction("WebRoomDirectoryCreateRoomButton", ev);
    });
    (0, _defineProperty2.default)(this, "onRoomClick", function (room, roomAlias) {
      let autoJoin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      let shouldPeek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      _this.onFinished();

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      (0, _rooms.showRoom)(cli, room, {
        roomAlias,
        autoJoin,
        shouldPeek,
        roomServer: _this.state.serverConfig?.roomServer,
        metricsTrigger: "RoomDirectory"
      });
    });
    (0, _defineProperty2.default)(this, "onFinished", () => {
      this.props.onFinished(false);
    });
    let protocolsLoading = true;

    if (!_MatrixClientPeg.MatrixClientPeg.get()) {
      // We may not have a client yet when invoked from welcome page
      protocolsLoading = false;
    } else {
      _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyProtocols().then(response => {
        this.protocols = response;

        const myHomeserver = _MatrixClientPeg.MatrixClientPeg.getHomeserverName();

        const lsRoomServer = localStorage.getItem(LAST_SERVER_KEY) ?? undefined;
        const lsInstanceId = localStorage.getItem(LAST_INSTANCE_KEY) ?? undefined;
        let roomServer = myHomeserver;

        if (_SdkConfig.default.getObject("room_directory")?.get("servers")?.includes(lsRoomServer) || _SettingsStore.default.getValue("room_directory_servers")?.includes(lsRoomServer)) {
          roomServer = lsRoomServer;
        }

        let instanceId = undefined;

        if (roomServer === myHomeserver && (lsInstanceId === _DirectoryUtils.ALL_ROOMS || Object.values(this.protocols).some(p => p.instances.some(i => i.instance_id === lsInstanceId)))) {
          instanceId = lsInstanceId;
        } // Refresh the room list only if validation failed and we had to change these


        if (this.state.serverConfig?.instanceId !== instanceId || this.state.serverConfig?.roomServer !== roomServer) {
          this.setState({
            protocolsLoading: false,
            serverConfig: roomServer ? {
              instanceId,
              roomServer
            } : null
          });
          this.refreshRoomList();
          return;
        }

        this.setState({
          protocolsLoading: false
        });
      }, err => {
        _logger.logger.warn(`error loading third party protocols: ${err}`);

        this.setState({
          protocolsLoading: false
        });

        if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
          // Guests currently aren't allowed to use this API, so
          // ignore this as otherwise this error is literally the
          // thing you see when loading the client!
          return;
        }

        const brand = _SdkConfig.default.get().brand;

        this.setState({
          error: (0, _languageHandler._t)('%(brand)s failed to get the protocol list from the homeserver. ' + 'The homeserver may be too old to support third party networks.', {
            brand
          })
        });
      });
    }

    let _serverConfig = null;
    const roomServer = localStorage.getItem(LAST_SERVER_KEY);

    if (roomServer) {
      _serverConfig = {
        roomServer,
        instanceId: localStorage.getItem(LAST_INSTANCE_KEY) ?? undefined
      };
    }

    this.state = {
      publicRooms: [],
      loading: true,
      error: null,
      serverConfig: _serverConfig,
      filterString: this.props.initialText || "",
      protocolsLoading
    };
  }

  componentDidMount() {
    this.refreshRoomList();
  }

  componentWillUnmount() {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.unmounted = true;
  }

  getMoreRooms() {
    if (!_MatrixClientPeg.MatrixClientPeg.get()) return Promise.resolve(false);
    this.setState({
      loading: true
    });
    const filterString = this.state.filterString;
    const roomServer = this.state.serverConfig?.roomServer; // remember the next batch token when we sent the request
    // too. If it's changed, appending to the list will corrupt it.

    const nextBatch = this.nextBatch;
    const opts = {
      limit: 20
    };

    if (roomServer != _MatrixClientPeg.MatrixClientPeg.getHomeserverName()) {
      opts.server = roomServer;
    }

    if (this.state.serverConfig?.instanceId === _DirectoryUtils.ALL_ROOMS) {
      opts.include_all_networks = true;
    } else if (this.state.serverConfig?.instanceId) {
      opts.third_party_instance_id = this.state.serverConfig?.instanceId;
    }

    if (this.nextBatch) opts.since = this.nextBatch;
    if (filterString) opts.filter = {
      generic_search_term: filterString
    };
    return _MatrixClientPeg.MatrixClientPeg.get().publicRooms(opts).then(data => {
      if (filterString != this.state.filterString || roomServer != this.state.serverConfig?.roomServer || nextBatch != this.nextBatch) {
        // if the filter or server has changed since this request was sent,
        // throw away the result (don't even clear the busy flag
        // since we must still have a request in flight)
        return false;
      }

      if (this.unmounted) {
        // if we've been unmounted, we don't care either.
        return false;
      }

      this.nextBatch = data.next_batch ?? null;
      this.setState(s => _objectSpread(_objectSpread({}, s), {}, {
        publicRooms: [...s.publicRooms, ...(data.chunk || [])],
        loading: false
      }));
      return Boolean(data.next_batch);
    }, err => {
      if (filterString != this.state.filterString || roomServer != this.state.serverConfig?.roomServer || nextBatch != this.nextBatch) {
        // as above: we don't care about errors for old requests either
        return false;
      }

      if (this.unmounted) {
        // if we've been unmounted, we don't care either.
        return false;
      }

      _logger.logger.error("Failed to get publicRooms: %s", JSON.stringify(err));

      const brand = _SdkConfig.default.get().brand;

      this.setState({
        loading: false,
        error: (0, _languageHandler._t)('%(brand)s failed to get the public room list.', {
          brand
        }) + (err && err.message) ? err.message : (0, _languageHandler._t)('The homeserver may be unavailable or overloaded.')
      });
      return false;
    });
  }
  /**
   * A limited interface for removing rooms from the directory.
   * Will set the room to not be publicly visible and delete the
   * default alias. In the long term, it would be better to allow
   * HS admins to do this through the RoomSettings interface, but
   * this needs SPEC-417.
   */


  stringLooksLikeId(s, fieldType) {
    let pat = /^#[^\s]+:[^\s]/;

    if (fieldType && fieldType.regexp) {
      pat = new RegExp(fieldType.regexp);
    }

    return pat.test(s);
  }

  render() {
    let content;

    if (this.state.error) {
      content = this.state.error;
    } else if (this.state.protocolsLoading) {
      content = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      const cells = (this.state.publicRooms || []).map(room => /*#__PURE__*/_react.default.createElement(_PublicRoomTile.PublicRoomTile, {
        key: room.room_id,
        room: room,
        showRoom: this.onRoomClick,
        removeFromDirectory: this.removeFromDirectory
      })); // we still show the scrollpanel, at least for now, because
      // otherwise we don't fetch more because we don't get a fill
      // request from the scrollpanel because there isn't one

      let spinner;

      if (this.state.loading) {
        spinner = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
      }

      const createNewButton = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("hr", null), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.onCreateRoomClick,
        className: "mx_RoomDirectory_newRoom"
      }, (0, _languageHandler._t)("Create new room")));

      let scrollPanelContent;
      let footer;

      if (cells.length === 0 && !this.state.loading) {
        footer = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h5", null, (0, _languageHandler._t)('No results for "%(query)s"', {
          query: this.state.filterString.trim()
        })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Try different words or check for typos. " + "Some results may not be visible as they're private and you need an invite to join them.")), createNewButton);
      } else {
        scrollPanelContent = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomDirectory_table"
        }, cells);

        if (!this.state.loading && !this.nextBatch) {
          footer = createNewButton;
        }
      }

      content = /*#__PURE__*/_react.default.createElement(_ScrollPanel.default, {
        className: "mx_RoomDirectory_tableWrapper",
        onFillRequest: this.onFillRequest,
        stickyBottom: false,
        startAtBottom: false
      }, scrollPanelContent, spinner, footer && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomDirectory_footer"
      }, footer));
    }

    let listHeader;

    if (!this.state.protocolsLoading) {
      const protocolName = (0, _DirectoryUtils.protocolNameForInstanceId)(this.protocols, this.state.serverConfig?.instanceId);
      let instanceExpectedFieldType;

      if (protocolName && this.protocols && this.protocols[protocolName] && this.protocols[protocolName].location_fields.length > 0 && this.protocols[protocolName].field_types) {
        const lastField = this.protocols[protocolName].location_fields.slice(-1)[0];
        instanceExpectedFieldType = this.protocols[protocolName].field_types[lastField];
      }

      let placeholder = (0, _languageHandler._t)('Find a room…');

      if (!this.state.serverConfig?.instanceId || this.state.serverConfig?.instanceId === _DirectoryUtils.ALL_ROOMS) {
        placeholder = (0, _languageHandler._t)("Find a room… (e.g. %(exampleRoom)s)", {
          exampleRoom: "#example:" + this.state.serverConfig?.roomServer
        });
      } else if (instanceExpectedFieldType) {
        placeholder = instanceExpectedFieldType.placeholder;
      }

      let showJoinButton = this.stringLooksLikeId(this.state.filterString, instanceExpectedFieldType);

      if (protocolName) {
        const instance = (0, _DirectoryUtils.instanceForInstanceId)(this.protocols, this.state.serverConfig?.instanceId);

        if (!instance || (0, _rooms.getFieldsForThirdPartyLocation)(this.state.filterString, this.protocols[protocolName], instance) === null) {
          showJoinButton = false;
        }
      }

      listHeader = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomDirectory_listheader"
      }, /*#__PURE__*/_react.default.createElement(_DirectorySearchBox.default, {
        className: "mx_RoomDirectory_searchbox",
        onChange: this.onFilterChange,
        onClear: this.onFilterClear,
        onJoinClick: this.onJoinFromSearchClick,
        placeholder: placeholder,
        showJoinButton: showJoinButton,
        initialText: this.props.initialText
      }), /*#__PURE__*/_react.default.createElement(_NetworkDropdown.NetworkDropdown, {
        protocols: this.protocols,
        config: this.state.serverConfig,
        setConfig: this.onOptionChange
      }));
    }

    const explanation = (0, _languageHandler._t)("If you can't find the room you're looking for, ask for an invite or <a>create a new room</a>.", {}, {
      a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: this.onCreateRoomClick
      }, sub)
    });
    const title = (0, _languageHandler._t)("Explore rooms");
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_RoomDirectory_dialog",
      hasCancel: true,
      onFinished: this.onFinished,
      title: title,
      screenName: "RoomDirectory"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomDirectory"
    }, explanation, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomDirectory_list"
    }, listHeader, content)));
  }

} // Similar to matrix-react-sdk's MatrixTools.getDisplayAliasForRoom
// but works with the objects we get from the public room list


exports.default = RoomDirectory;

function getDisplayAliasForRoom(room) {
  return (0, _Rooms.getDisplayAliasForAliasSet)(room.canonical_alias, room.aliases);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMQVNUX1NFUlZFUl9LRVkiLCJMQVNUX0lOU1RBTkNFX0tFWSIsIlJvb21EaXJlY3RvcnkiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJuZXh0QmF0Y2giLCJzZXRTdGF0ZSIsInB1YmxpY1Jvb21zIiwibG9hZGluZyIsImdldE1vcmVSb29tcyIsInJvb20iLCJhbGlhcyIsImdldERpc3BsYXlBbGlhc0ZvclJvb20iLCJuYW1lIiwiX3QiLCJkZXNjIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJvbkZpbmlzaGVkIiwic2hvdWxkRGVsZXRlIiwibW9kYWwiLCJTcGlubmVyIiwic3RlcCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInNldFJvb21EaXJlY3RvcnlWaXNpYmlsaXR5Iiwicm9vbV9pZCIsIlZpc2liaWxpdHkiLCJQcml2YXRlIiwidGhlbiIsImRlbGV0ZUFsaWFzIiwiY2xvc2UiLCJyZWZyZXNoUm9vbUxpc3QiLCJlcnIiLCJsb2dnZXIiLCJlcnJvciIsIkVycm9yRGlhbG9nIiwibWVzc2FnZSIsInNlcnZlckNvbmZpZyIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJyb29tU2VydmVyIiwiaW5zdGFuY2VJZCIsInJlbW92ZUl0ZW0iLCJiYWNrd2FyZHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZpbHRlclN0cmluZyIsInRyaW0iLCJmaWx0ZXJUaW1lb3V0IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImNsaSIsImpvaW5Sb29tQnlBbGlhcyIsInN0YXRlIiwicHJvdG9jb2xzIiwibWV0cmljc1RyaWdnZXIiLCJlIiwiR2VuZXJpY0Vycm9yIiwiZXYiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInB1YmxpYyIsImRlZmF1bHROYW1lIiwiUG9zdGhvZ1RyYWNrZXJzIiwidHJhY2tJbnRlcmFjdGlvbiIsInJvb21BbGlhcyIsImF1dG9Kb2luIiwic2hvdWxkUGVlayIsInNob3dSb29tIiwicHJvdG9jb2xzTG9hZGluZyIsImdldFRoaXJkcGFydHlQcm90b2NvbHMiLCJyZXNwb25zZSIsIm15SG9tZXNlcnZlciIsImdldEhvbWVzZXJ2ZXJOYW1lIiwibHNSb29tU2VydmVyIiwiZ2V0SXRlbSIsInVuZGVmaW5lZCIsImxzSW5zdGFuY2VJZCIsIlNka0NvbmZpZyIsImdldE9iamVjdCIsImluY2x1ZGVzIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiQUxMX1JPT01TIiwiT2JqZWN0IiwidmFsdWVzIiwic29tZSIsInAiLCJpbnN0YW5jZXMiLCJpIiwiaW5zdGFuY2VfaWQiLCJ3YXJuIiwiaXNHdWVzdCIsImJyYW5kIiwiaW5pdGlhbFRleHQiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5tb3VudGVkIiwib3B0cyIsImxpbWl0Iiwic2VydmVyIiwiaW5jbHVkZV9hbGxfbmV0d29ya3MiLCJ0aGlyZF9wYXJ0eV9pbnN0YW5jZV9pZCIsInNpbmNlIiwiZmlsdGVyIiwiZ2VuZXJpY19zZWFyY2hfdGVybSIsImRhdGEiLCJuZXh0X2JhdGNoIiwicyIsImNodW5rIiwiQm9vbGVhbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJzdHJpbmdMb29rc0xpa2VJZCIsImZpZWxkVHlwZSIsInBhdCIsInJlZ2V4cCIsIlJlZ0V4cCIsInRlc3QiLCJyZW5kZXIiLCJjb250ZW50IiwiY2VsbHMiLCJtYXAiLCJvblJvb21DbGljayIsInJlbW92ZUZyb21EaXJlY3RvcnkiLCJzcGlubmVyIiwiY3JlYXRlTmV3QnV0dG9uIiwib25DcmVhdGVSb29tQ2xpY2siLCJzY3JvbGxQYW5lbENvbnRlbnQiLCJmb290ZXIiLCJsZW5ndGgiLCJxdWVyeSIsIm9uRmlsbFJlcXVlc3QiLCJsaXN0SGVhZGVyIiwicHJvdG9jb2xOYW1lIiwicHJvdG9jb2xOYW1lRm9ySW5zdGFuY2VJZCIsImluc3RhbmNlRXhwZWN0ZWRGaWVsZFR5cGUiLCJsb2NhdGlvbl9maWVsZHMiLCJmaWVsZF90eXBlcyIsImxhc3RGaWVsZCIsInNsaWNlIiwicGxhY2Vob2xkZXIiLCJleGFtcGxlUm9vbSIsInNob3dKb2luQnV0dG9uIiwiaW5zdGFuY2UiLCJpbnN0YW5jZUZvckluc3RhbmNlSWQiLCJnZXRGaWVsZHNGb3JUaGlyZFBhcnR5TG9jYXRpb24iLCJvbkZpbHRlckNoYW5nZSIsIm9uRmlsdGVyQ2xlYXIiLCJvbkpvaW5Gcm9tU2VhcmNoQ2xpY2siLCJvbk9wdGlvbkNoYW5nZSIsImV4cGxhbmF0aW9uIiwiYSIsInN1YiIsImdldERpc3BsYXlBbGlhc0ZvckFsaWFzU2V0IiwiY2Fub25pY2FsX2FsaWFzIiwiYWxpYXNlcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUm9vbURpcmVjdG9yeS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYsIDIwMTksIDIwMjAsIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJRmllbGRUeXBlLCBJUHVibGljUm9vbXNDaHVua1Jvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBWaXNpYmlsaXR5IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFsc1wiO1xuaW1wb3J0IHsgSVJvb21EaXJlY3RvcnlPcHRpb25zIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9yZXF1ZXN0c1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB7IGluc3RhbmNlRm9ySW5zdGFuY2VJZCwgcHJvdG9jb2xOYW1lRm9ySW5zdGFuY2VJZCwgQUxMX1JPT01TLCBQcm90b2NvbHMgfSBmcm9tICcuLi8uLi91dGlscy9EaXJlY3RvcnlVdGlscyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4uL3ZpZXdzL2RpYWxvZ3MvSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgeyBJUHVibGljUm9vbURpcmVjdG9yeUNvbmZpZywgTmV0d29ya0Ryb3Bkb3duIH0gZnJvbSBcIi4uL3ZpZXdzL2RpcmVjdG9yeS9OZXR3b3JrRHJvcGRvd25cIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uLCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRGlyZWN0b3J5U2VhcmNoQm94IGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9EaXJlY3RvcnlTZWFyY2hCb3hcIjtcbmltcG9ydCBTY3JvbGxQYW5lbCBmcm9tIFwiLi9TY3JvbGxQYW5lbFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCB7IGdldERpc3BsYXlBbGlhc0ZvckFsaWFzU2V0IH0gZnJvbSBcIi4uLy4uL1Jvb21zXCI7XG5pbXBvcnQgUG9zdGhvZ1RyYWNrZXJzIGZyb20gXCIuLi8uLi9Qb3N0aG9nVHJhY2tlcnNcIjtcbmltcG9ydCB7IFB1YmxpY1Jvb21UaWxlIH0gZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1B1YmxpY1Jvb21UaWxlXCI7XG5pbXBvcnQgeyBnZXRGaWVsZHNGb3JUaGlyZFBhcnR5TG9jYXRpb24sIGpvaW5Sb29tQnlBbGlhcywgc2hvd1Jvb20gfSBmcm9tIFwiLi4vLi4vdXRpbHMvcm9vbXNcIjtcbmltcG9ydCB7IEdlbmVyaWNFcnJvciB9IGZyb20gXCIuLi8uLi91dGlscy9lcnJvclwiO1xuXG5jb25zdCBMQVNUX1NFUlZFUl9LRVkgPSBcIm14X2xhc3Rfcm9vbV9kaXJlY3Rvcnlfc2VydmVyXCI7XG5jb25zdCBMQVNUX0lOU1RBTkNFX0tFWSA9IFwibXhfbGFzdF9yb29tX2RpcmVjdG9yeV9pbnN0YW5jZVwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBpbml0aWFsVGV4dD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgcHVibGljUm9vbXM6IElQdWJsaWNSb29tc0NodW5rUm9vbVtdO1xuICAgIGxvYWRpbmc6IGJvb2xlYW47XG4gICAgcHJvdG9jb2xzTG9hZGluZzogYm9vbGVhbjtcbiAgICBlcnJvcj86IHN0cmluZyB8IG51bGw7XG4gICAgc2VydmVyQ29uZmlnOiBJUHVibGljUm9vbURpcmVjdG9yeUNvbmZpZyB8IG51bGw7XG4gICAgZmlsdGVyU3RyaW5nOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21EaXJlY3RvcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHVubW91bnRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgbmV4dEJhdGNoOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGZpbHRlclRpbWVvdXQ6IG51bWJlciB8IG51bGw7XG4gICAgcHJpdmF0ZSBwcm90b2NvbHM6IFByb3RvY29scztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBsZXQgcHJvdG9jb2xzTG9hZGluZyA9IHRydWU7XG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgICAgICAvLyBXZSBtYXkgbm90IGhhdmUgYSBjbGllbnQgeWV0IHdoZW4gaW52b2tlZCBmcm9tIHdlbGNvbWUgcGFnZVxuICAgICAgICAgICAgcHJvdG9jb2xzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFRoaXJkcGFydHlQcm90b2NvbHMoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvdG9jb2xzID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgY29uc3QgbXlIb21lc2VydmVyID0gTWF0cml4Q2xpZW50UGVnLmdldEhvbWVzZXJ2ZXJOYW1lKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbHNSb29tU2VydmVyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oTEFTVF9TRVJWRVJfS0VZKSA/PyB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgY29uc3QgbHNJbnN0YW5jZUlkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oTEFTVF9JTlNUQU5DRV9LRVkpID8/IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIGxldCByb29tU2VydmVyOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBteUhvbWVzZXJ2ZXI7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBTZGtDb25maWcuZ2V0T2JqZWN0KFwicm9vbV9kaXJlY3RvcnlcIik/LmdldChcInNlcnZlcnNcIik/LmluY2x1ZGVzKGxzUm9vbVNlcnZlcikgfHxcbiAgICAgICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInJvb21fZGlyZWN0b3J5X3NlcnZlcnNcIik/LmluY2x1ZGVzKGxzUm9vbVNlcnZlcilcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbVNlcnZlciA9IGxzUm9vbVNlcnZlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgaW5zdGFuY2VJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChyb29tU2VydmVyID09PSBteUhvbWVzZXJ2ZXIgJiYgKFxuICAgICAgICAgICAgICAgICAgICBsc0luc3RhbmNlSWQgPT09IEFMTF9ST09NUyB8fFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMucHJvdG9jb2xzKS5zb21lKHAgPT4gcC5pbnN0YW5jZXMuc29tZShpID0+IGkuaW5zdGFuY2VfaWQgPT09IGxzSW5zdGFuY2VJZCkpXG4gICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkID0gbHNJbnN0YW5jZUlkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlZnJlc2ggdGhlIHJvb20gbGlzdCBvbmx5IGlmIHZhbGlkYXRpb24gZmFpbGVkIGFuZCB3ZSBoYWQgdG8gY2hhbmdlIHRoZXNlXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5pbnN0YW5jZUlkICE9PSBpbnN0YW5jZUlkIHx8XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5yb29tU2VydmVyICE9PSByb29tU2VydmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xzTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJDb25maWc6IHJvb21TZXJ2ZXIgPyB7IGluc3RhbmNlSWQsIHJvb21TZXJ2ZXIgfSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hSb29tTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcm90b2NvbHNMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgZXJyb3IgbG9hZGluZyB0aGlyZCBwYXJ0eSBwcm90b2NvbHM6ICR7ZXJyfWApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcm90b2NvbHNMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBHdWVzdHMgY3VycmVudGx5IGFyZW4ndCBhbGxvd2VkIHRvIHVzZSB0aGlzIEFQSSwgc29cbiAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlIHRoaXMgYXMgb3RoZXJ3aXNlIHRoaXMgZXJyb3IgaXMgbGl0ZXJhbGx5IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyB0aGluZyB5b3Ugc2VlIHdoZW4gbG9hZGluZyB0aGUgY2xpZW50IVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBlcnJvcjogX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAnJShicmFuZClzIGZhaWxlZCB0byBnZXQgdGhlIHByb3RvY29sIGxpc3QgZnJvbSB0aGUgaG9tZXNlcnZlci4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGhlIGhvbWVzZXJ2ZXIgbWF5IGJlIHRvbyBvbGQgdG8gc3VwcG9ydCB0aGlyZCBwYXJ0eSBuZXR3b3Jrcy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VydmVyQ29uZmlnOiBJUHVibGljUm9vbURpcmVjdG9yeUNvbmZpZyB8IG51bGwgPSBudWxsO1xuICAgICAgICBjb25zdCByb29tU2VydmVyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oTEFTVF9TRVJWRVJfS0VZKTtcbiAgICAgICAgaWYgKHJvb21TZXJ2ZXIpIHtcbiAgICAgICAgICAgIHNlcnZlckNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICByb29tU2VydmVyLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlSWQ6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKExBU1RfSU5TVEFOQ0VfS0VZKSA/PyB1bmRlZmluZWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHB1YmxpY1Jvb21zOiBbXSxcbiAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHNlcnZlckNvbmZpZyxcbiAgICAgICAgICAgIGZpbHRlclN0cmluZzogdGhpcy5wcm9wcy5pbml0aWFsVGV4dCB8fCBcIlwiLFxuICAgICAgICAgICAgcHJvdG9jb2xzTG9hZGluZyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5yZWZyZXNoUm9vbUxpc3QoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyVGltZW91dCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZmlsdGVyVGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVmcmVzaFJvb21MaXN0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLm5leHRCYXRjaCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHVibGljUm9vbXM6IFtdLFxuICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZ2V0TW9yZVJvb21zKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0TW9yZVJvb21zKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBmaWx0ZXJTdHJpbmcgPSB0aGlzLnN0YXRlLmZpbHRlclN0cmluZztcbiAgICAgICAgY29uc3Qgcm9vbVNlcnZlciA9IHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5yb29tU2VydmVyO1xuICAgICAgICAvLyByZW1lbWJlciB0aGUgbmV4dCBiYXRjaCB0b2tlbiB3aGVuIHdlIHNlbnQgdGhlIHJlcXVlc3RcbiAgICAgICAgLy8gdG9vLiBJZiBpdCdzIGNoYW5nZWQsIGFwcGVuZGluZyB0byB0aGUgbGlzdCB3aWxsIGNvcnJ1cHQgaXQuXG4gICAgICAgIGNvbnN0IG5leHRCYXRjaCA9IHRoaXMubmV4dEJhdGNoO1xuICAgICAgICBjb25zdCBvcHRzOiBJUm9vbURpcmVjdG9yeU9wdGlvbnMgPSB7IGxpbWl0OiAyMCB9O1xuICAgICAgICBpZiAocm9vbVNlcnZlciAhPSBNYXRyaXhDbGllbnRQZWcuZ2V0SG9tZXNlcnZlck5hbWUoKSkge1xuICAgICAgICAgICAgb3B0cy5zZXJ2ZXIgPSByb29tU2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlcnZlckNvbmZpZz8uaW5zdGFuY2VJZCA9PT0gQUxMX1JPT01TKSB7XG4gICAgICAgICAgICBvcHRzLmluY2x1ZGVfYWxsX25ldHdvcmtzID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnNlcnZlckNvbmZpZz8uaW5zdGFuY2VJZCkge1xuICAgICAgICAgICAgb3B0cy50aGlyZF9wYXJ0eV9pbnN0YW5jZV9pZCA9IHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5pbnN0YW5jZUlkIGFzIHN0cmluZztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5uZXh0QmF0Y2gpIG9wdHMuc2luY2UgPSB0aGlzLm5leHRCYXRjaDtcbiAgICAgICAgaWYgKGZpbHRlclN0cmluZykgb3B0cy5maWx0ZXIgPSB7IGdlbmVyaWNfc2VhcmNoX3Rlcm06IGZpbHRlclN0cmluZyB9O1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLnB1YmxpY1Jvb21zKG9wdHMpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBmaWx0ZXJTdHJpbmcgIT0gdGhpcy5zdGF0ZS5maWx0ZXJTdHJpbmcgfHxcbiAgICAgICAgICAgICAgICByb29tU2VydmVyICE9IHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5yb29tU2VydmVyIHx8XG4gICAgICAgICAgICAgICAgbmV4dEJhdGNoICE9IHRoaXMubmV4dEJhdGNoKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGZpbHRlciBvciBzZXJ2ZXIgaGFzIGNoYW5nZWQgc2luY2UgdGhpcyByZXF1ZXN0IHdhcyBzZW50LFxuICAgICAgICAgICAgICAgIC8vIHRocm93IGF3YXkgdGhlIHJlc3VsdCAoZG9uJ3QgZXZlbiBjbGVhciB0aGUgYnVzeSBmbGFnXG4gICAgICAgICAgICAgICAgLy8gc2luY2Ugd2UgbXVzdCBzdGlsbCBoYXZlIGEgcmVxdWVzdCBpbiBmbGlnaHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSd2ZSBiZWVuIHVubW91bnRlZCwgd2UgZG9uJ3QgY2FyZSBlaXRoZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm5leHRCYXRjaCA9IGRhdGEubmV4dF9iYXRjaCA/PyBudWxsO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSgocykgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5zLFxuICAgICAgICAgICAgICAgIHB1YmxpY1Jvb21zOiBbLi4ucy5wdWJsaWNSb29tcywgLi4uKGRhdGEuY2h1bmsgfHwgW10pXSxcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHJldHVybiBCb29sZWFuKGRhdGEubmV4dF9iYXRjaCk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBmaWx0ZXJTdHJpbmcgIT0gdGhpcy5zdGF0ZS5maWx0ZXJTdHJpbmcgfHxcbiAgICAgICAgICAgICAgICByb29tU2VydmVyICE9IHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5yb29tU2VydmVyIHx8XG4gICAgICAgICAgICAgICAgbmV4dEJhdGNoICE9IHRoaXMubmV4dEJhdGNoKSB7XG4gICAgICAgICAgICAgICAgLy8gYXMgYWJvdmU6IHdlIGRvbid0IGNhcmUgYWJvdXQgZXJyb3JzIGZvciBvbGQgcmVxdWVzdHMgZWl0aGVyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSd2ZSBiZWVuIHVubW91bnRlZCwgd2UgZG9uJ3QgY2FyZSBlaXRoZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gZ2V0IHB1YmxpY1Jvb21zOiAlc1wiLCBKU09OLnN0cmluZ2lmeShlcnIpKTtcbiAgICAgICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IChcbiAgICAgICAgICAgICAgICAgICAgX3QoJyUoYnJhbmQpcyBmYWlsZWQgdG8gZ2V0IHRoZSBwdWJsaWMgcm9vbSBsaXN0LicsIHsgYnJhbmQgfSkgK1xuICAgICAgICAgICAgICAgICAgICAoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoJ1RoZSBob21lc2VydmVyIG1heSBiZSB1bmF2YWlsYWJsZSBvciBvdmVybG9hZGVkLicpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIGxpbWl0ZWQgaW50ZXJmYWNlIGZvciByZW1vdmluZyByb29tcyBmcm9tIHRoZSBkaXJlY3RvcnkuXG4gICAgICogV2lsbCBzZXQgdGhlIHJvb20gdG8gbm90IGJlIHB1YmxpY2x5IHZpc2libGUgYW5kIGRlbGV0ZSB0aGVcbiAgICAgKiBkZWZhdWx0IGFsaWFzLiBJbiB0aGUgbG9uZyB0ZXJtLCBpdCB3b3VsZCBiZSBiZXR0ZXIgdG8gYWxsb3dcbiAgICAgKiBIUyBhZG1pbnMgdG8gZG8gdGhpcyB0aHJvdWdoIHRoZSBSb29tU2V0dGluZ3MgaW50ZXJmYWNlLCBidXRcbiAgICAgKiB0aGlzIG5lZWRzIFNQRUMtNDE3LlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVtb3ZlRnJvbURpcmVjdG9yeSA9IChyb29tOiBJUHVibGljUm9vbXNDaHVua1Jvb20pID0+IHtcbiAgICAgICAgY29uc3QgYWxpYXMgPSBnZXREaXNwbGF5QWxpYXNGb3JSb29tKHJvb20pO1xuICAgICAgICBjb25zdCBuYW1lID0gcm9vbS5uYW1lIHx8IGFsaWFzIHx8IF90KCdVbm5hbWVkIHJvb20nKTtcblxuICAgICAgICBsZXQgZGVzYztcbiAgICAgICAgaWYgKGFsaWFzKSB7XG4gICAgICAgICAgICBkZXNjID0gX3QoJ0RlbGV0ZSB0aGUgcm9vbSBhZGRyZXNzICUoYWxpYXMpcyBhbmQgcmVtb3ZlICUobmFtZSlzIGZyb20gdGhlIGRpcmVjdG9yeT8nLCB7IGFsaWFzLCBuYW1lIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVzYyA9IF90KCdSZW1vdmUgJShuYW1lKXMgZnJvbSB0aGUgZGlyZWN0b3J5PycsIHsgbmFtZTogbmFtZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KCdSZW1vdmUgZnJvbSBEaXJlY3RvcnknKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKHNob3VsZERlbGV0ZTogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc2hvdWxkRGVsZXRlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBjb25zdCBtb2RhbCA9IE1vZGFsLmNyZWF0ZURpYWxvZyhTcGlubmVyKTtcbiAgICAgICAgICAgICAgICBsZXQgc3RlcCA9IF90KCdyZW1vdmUgJShuYW1lKXMgZnJvbSB0aGUgZGlyZWN0b3J5LicsIHsgbmFtZTogbmFtZSB9KTtcblxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRSb29tRGlyZWN0b3J5VmlzaWJpbGl0eShyb29tLnJvb21faWQsIFZpc2liaWxpdHkuUHJpdmF0ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYWxpYXMpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgc3RlcCA9IF90KCdkZWxldGUgdGhlIGFkZHJlc3MuJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlQWxpYXMoYWxpYXMpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hSb29tTGlzdCgpO1xuICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUm9vbUxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIFwiICsgc3RlcCArIFwiOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IChlcnIgJiYgZXJyLm1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBlcnIubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoJ1RoZSBzZXJ2ZXIgbWF5IGJlIHVuYXZhaWxhYmxlIG9yIG92ZXJsb2FkZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk9wdGlvbkNoYW5nZSA9IChzZXJ2ZXJDb25maWc6IElQdWJsaWNSb29tRGlyZWN0b3J5Q29uZmlnKSA9PiB7XG4gICAgICAgIC8vIGNsZWFyIG5leHQgYmF0Y2ggc28gd2UgZG9uJ3QgdHJ5IHRvIGxvYWQgbW9yZSByb29tc1xuICAgICAgICB0aGlzLm5leHRCYXRjaCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIHB1YmxpYyByb29tcyBvdXQgaGVyZSBvdGhlcndpc2Ugd2UgbmVlZGxlc3NseVxuICAgICAgICAgICAgLy8gc3BlbmQgdGltZSBmaWx0ZXJpbmcgbG90cyBvZiByb29tcyB3aGVuIHdlJ3JlIGFib3V0IHRvXG4gICAgICAgICAgICAvLyB0byBjbGVhciB0aGUgbGlzdCBhbnl3YXkuXG4gICAgICAgICAgICBwdWJsaWNSb29tczogW10sXG4gICAgICAgICAgICBzZXJ2ZXJDb25maWcsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgfSwgdGhpcy5yZWZyZXNoUm9vbUxpc3QpO1xuICAgICAgICAvLyBXZSBhbHNvIHJlZnJlc2ggdGhlIHJvb20gbGlzdCBlYWNoIHRpbWUgZXZlbiB0aG91Z2ggdGhpc1xuICAgICAgICAvLyBmaWx0ZXJpbmcgaXMgY2xpZW50LXNpZGUuIEl0IGhvcGVmdWxseSB3b24ndCBiZSBjbGllbnQgc2lkZVxuICAgICAgICAvLyBmb3IgdmVyeSBsb25nLCBhbmQgd2UgbWF5IGhhdmUgZmV0Y2hlZCBhIHRob3VzYW5kIHJvb21zIHRvXG4gICAgICAgIC8vIGZpbmQgdGhlIGZpdmUgZ2l0dGVyIG9uZXMsIGF0IHdoaWNoIHBvaW50IHdlIGRvIG5vdCB3YW50XG4gICAgICAgIC8vIHRvIHJlbmRlciBhbGwgdGhvc2Ugcm9vbXMgd2hlbiBzd2l0Y2hpbmcgYmFjayB0byAnYWxsIG5ldHdvcmtzJy5cbiAgICAgICAgLy8gRWFzaWVzdCB0byBqdXN0IGJsb3cgYXdheSB0aGUgc3RhdGUgJiByZS1mZXRjaC5cblxuICAgICAgICAvLyBXZSBoYXZlIHRvIGJlIGNhcmVmdWwgaGVyZSBzbyB0aGF0IHdlIGRvbid0IHNldCBpbnN0YW5jZUlkID0gXCJ1bmRlZmluZWRcIlxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShMQVNUX1NFUlZFUl9LRVksIHNlcnZlckNvbmZpZy5yb29tU2VydmVyKTtcbiAgICAgICAgaWYgKHNlcnZlckNvbmZpZy5pbnN0YW5jZUlkKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShMQVNUX0lOU1RBTkNFX0tFWSwgc2VydmVyQ29uZmlnLmluc3RhbmNlSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTEFTVF9JTlNUQU5DRV9LRVkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25GaWxsUmVxdWVzdCA9IChiYWNrd2FyZHM6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgaWYgKGJhY2t3YXJkcyB8fCAhdGhpcy5uZXh0QmF0Y2gpIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldE1vcmVSb29tcygpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRmlsdGVyQ2hhbmdlID0gKGFsaWFzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBmaWx0ZXJTdHJpbmc6IGFsaWFzPy50cmltKCkgfHwgXCJcIixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZG9uJ3Qgc2VuZCB0aGUgcmVxdWVzdCBmb3IgYSBsaXR0bGUgYml0LFxuICAgICAgICAvLyBubyBwb2ludCBoYW1tZXJpbmcgdGhlIHNlcnZlciB3aXRoIGFcbiAgICAgICAgLy8gcmVxdWVzdCBmb3IgZXZlcnkga2V5c3Ryb2tlLCBsZXQgdGhlXG4gICAgICAgIC8vIHVzZXIgZmluaXNoIHR5cGluZy5cbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyVGltZW91dCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZmlsdGVyVGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maWx0ZXJUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZpbHRlclRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoUm9vbUxpc3QoKTtcbiAgICAgICAgfSwgNzAwKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZpbHRlckNsZWFyID0gKCkgPT4ge1xuICAgICAgICAvLyB1cGRhdGUgaW1tZWRpYXRlbHlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBmaWx0ZXJTdHJpbmc6IFwiXCIsXG4gICAgICAgIH0sIHRoaXMucmVmcmVzaFJvb21MaXN0KTtcblxuICAgICAgICBpZiAodGhpcy5maWx0ZXJUaW1lb3V0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5maWx0ZXJUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSm9pbkZyb21TZWFyY2hDbGljayA9IChhbGlhczogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGpvaW5Sb29tQnlBbGlhcyhjbGksIGFsaWFzLCB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogdGhpcy5zdGF0ZS5zZXJ2ZXJDb25maWc/Lmluc3RhbmNlSWQsXG4gICAgICAgICAgICAgICAgcm9vbVNlcnZlcjogdGhpcy5zdGF0ZS5zZXJ2ZXJDb25maWc/LnJvb21TZXJ2ZXIsXG4gICAgICAgICAgICAgICAgcHJvdG9jb2xzOiB0aGlzLnByb3RvY29scyxcbiAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJSb29tRGlyZWN0b3J5XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHZW5lcmljRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNyZWF0ZVJvb21DbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X2NyZWF0ZV9yb29tJyxcbiAgICAgICAgICAgIHB1YmxpYzogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHROYW1lOiB0aGlzLnN0YXRlLmZpbHRlclN0cmluZy50cmltKCksXG4gICAgICAgIH0pO1xuICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21EaXJlY3RvcnlDcmVhdGVSb29tQnV0dG9uXCIsIGV2KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21DbGljayA9IChyb29tOiBJUHVibGljUm9vbXNDaHVua1Jvb20sIHJvb21BbGlhcz86IHN0cmluZywgYXV0b0pvaW4gPSBmYWxzZSwgc2hvdWxkUGVlayA9IGZhbHNlKSA9PiB7XG4gICAgICAgIHRoaXMub25GaW5pc2hlZCgpO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHNob3dSb29tKGNsaSwgcm9vbSwge1xuICAgICAgICAgICAgcm9vbUFsaWFzLFxuICAgICAgICAgICAgYXV0b0pvaW4sXG4gICAgICAgICAgICBzaG91bGRQZWVrLFxuICAgICAgICAgICAgcm9vbVNlcnZlcjogdGhpcy5zdGF0ZS5zZXJ2ZXJDb25maWc/LnJvb21TZXJ2ZXIsXG4gICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJSb29tRGlyZWN0b3J5XCIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHN0cmluZ0xvb2tzTGlrZUlkKHM6IHN0cmluZywgZmllbGRUeXBlOiBJRmllbGRUeXBlKSB7XG4gICAgICAgIGxldCBwYXQgPSAvXiNbXlxcc10rOlteXFxzXS87XG4gICAgICAgIGlmIChmaWVsZFR5cGUgJiYgZmllbGRUeXBlLnJlZ2V4cCkge1xuICAgICAgICAgICAgcGF0ID0gbmV3IFJlZ0V4cChmaWVsZFR5cGUucmVnZXhwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXQudGVzdChzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRmluaXNoZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgY29udGVudCA9IHRoaXMuc3RhdGUuZXJyb3I7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5wcm90b2NvbHNMb2FkaW5nKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPFNwaW5uZXIgLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjZWxscyA9ICh0aGlzLnN0YXRlLnB1YmxpY1Jvb21zIHx8IFtdKVxuICAgICAgICAgICAgICAgIC5tYXAocm9vbSA9PlxuICAgICAgICAgICAgICAgICAgICA8UHVibGljUm9vbVRpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17cm9vbS5yb29tX2lkfVxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dSb29tPXt0aGlzLm9uUm9vbUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRnJvbURpcmVjdG9yeT17dGhpcy5yZW1vdmVGcm9tRGlyZWN0b3J5fVxuICAgICAgICAgICAgICAgICAgICAvPixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gd2Ugc3RpbGwgc2hvdyB0aGUgc2Nyb2xscGFuZWwsIGF0IGxlYXN0IGZvciBub3csIGJlY2F1c2VcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSB3ZSBkb24ndCBmZXRjaCBtb3JlIGJlY2F1c2Ugd2UgZG9uJ3QgZ2V0IGEgZmlsbFxuICAgICAgICAgICAgLy8gcmVxdWVzdCBmcm9tIHRoZSBzY3JvbGxwYW5lbCBiZWNhdXNlIHRoZXJlIGlzbid0IG9uZVxuXG4gICAgICAgICAgICBsZXQgc3Bpbm5lcjtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICBzcGlubmVyID0gPFNwaW5uZXIgLz47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU5ld0J1dHRvbiA9IDw+XG4gICAgICAgICAgICAgICAgPGhyIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLm9uQ3JlYXRlUm9vbUNsaWNrfSBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X25ld1Jvb21cIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNyZWF0ZSBuZXcgcm9vbVwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC8+O1xuXG4gICAgICAgICAgICBsZXQgc2Nyb2xsUGFuZWxDb250ZW50O1xuICAgICAgICAgICAgbGV0IGZvb3RlcjtcbiAgICAgICAgICAgIGlmIChjZWxscy5sZW5ndGggPT09IDAgJiYgIXRoaXMuc3RhdGUubG9hZGluZykge1xuICAgICAgICAgICAgICAgIGZvb3RlciA9IDw+XG4gICAgICAgICAgICAgICAgICAgIDxoNT57IF90KCdObyByZXN1bHRzIGZvciBcIiUocXVlcnkpc1wiJywgeyBxdWVyeTogdGhpcy5zdGF0ZS5maWx0ZXJTdHJpbmcudHJpbSgpIH0pIH08L2g1PlxuICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJUcnkgZGlmZmVyZW50IHdvcmRzIG9yIGNoZWNrIGZvciB0eXBvcy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU29tZSByZXN1bHRzIG1heSBub3QgYmUgdmlzaWJsZSBhcyB0aGV5J3JlIHByaXZhdGUgYW5kIHlvdSBuZWVkIGFuIGludml0ZSB0byBqb2luIHRoZW0uXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICB7IGNyZWF0ZU5ld0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxQYW5lbENvbnRlbnQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3RvcnlfdGFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBjZWxscyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5sb2FkaW5nICYmICF0aGlzLm5leHRCYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBmb290ZXIgPSBjcmVhdGVOZXdCdXR0b247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGVudCA9IDxTY3JvbGxQYW5lbFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3RvcnlfdGFibGVXcmFwcGVyXCJcbiAgICAgICAgICAgICAgICBvbkZpbGxSZXF1ZXN0PXt0aGlzLm9uRmlsbFJlcXVlc3R9XG4gICAgICAgICAgICAgICAgc3RpY2t5Qm90dG9tPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBzdGFydEF0Qm90dG9tPXtmYWxzZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IHNjcm9sbFBhbmVsQ29udGVudCB9XG4gICAgICAgICAgICAgICAgeyBzcGlubmVyIH1cbiAgICAgICAgICAgICAgICB7IGZvb3RlciAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3RvcnlfZm9vdGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgZm9vdGVyIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgPC9TY3JvbGxQYW5lbD47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbGlzdEhlYWRlcjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnByb3RvY29sc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvY29sTmFtZSA9IHByb3RvY29sTmFtZUZvckluc3RhbmNlSWQodGhpcy5wcm90b2NvbHMsIHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5pbnN0YW5jZUlkKTtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZUV4cGVjdGVkRmllbGRUeXBlO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHByb3RvY29sTmFtZSAmJlxuICAgICAgICAgICAgICAgIHRoaXMucHJvdG9jb2xzICYmXG4gICAgICAgICAgICAgICAgdGhpcy5wcm90b2NvbHNbcHJvdG9jb2xOYW1lXSAmJlxuICAgICAgICAgICAgICAgIHRoaXMucHJvdG9jb2xzW3Byb3RvY29sTmFtZV0ubG9jYXRpb25fZmllbGRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICB0aGlzLnByb3RvY29sc1twcm90b2NvbE5hbWVdLmZpZWxkX3R5cGVzXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0RmllbGQgPSB0aGlzLnByb3RvY29sc1twcm90b2NvbE5hbWVdLmxvY2F0aW9uX2ZpZWxkcy5zbGljZSgtMSlbMF07XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VFeHBlY3RlZEZpZWxkVHlwZSA9IHRoaXMucHJvdG9jb2xzW3Byb3RvY29sTmFtZV0uZmllbGRfdHlwZXNbbGFzdEZpZWxkXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHBsYWNlaG9sZGVyID0gX3QoJ0ZpbmQgYSByb29t4oCmJyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5pbnN0YW5jZUlkIHx8IHRoaXMuc3RhdGUuc2VydmVyQ29uZmlnPy5pbnN0YW5jZUlkID09PSBBTExfUk9PTVMpIHtcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IF90KFwiRmluZCBhIHJvb23igKYgKGUuZy4gJShleGFtcGxlUm9vbSlzKVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGV4YW1wbGVSb29tOiBcIiNleGFtcGxlOlwiICsgdGhpcy5zdGF0ZS5zZXJ2ZXJDb25maWc/LnJvb21TZXJ2ZXIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluc3RhbmNlRXhwZWN0ZWRGaWVsZFR5cGUpIHtcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IGluc3RhbmNlRXhwZWN0ZWRGaWVsZFR5cGUucGxhY2Vob2xkZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzaG93Sm9pbkJ1dHRvbiA9IHRoaXMuc3RyaW5nTG9va3NMaWtlSWQodGhpcy5zdGF0ZS5maWx0ZXJTdHJpbmcsIGluc3RhbmNlRXhwZWN0ZWRGaWVsZFR5cGUpO1xuICAgICAgICAgICAgaWYgKHByb3RvY29sTmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gaW5zdGFuY2VGb3JJbnN0YW5jZUlkKHRoaXMucHJvdG9jb2xzLCB0aGlzLnN0YXRlLnNlcnZlckNvbmZpZz8uaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnN0YW5jZSB8fCBnZXRGaWVsZHNGb3JUaGlyZFBhcnR5TG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZmlsdGVyU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3RvY29sc1twcm90b2NvbE5hbWVdLFxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgICAgICAgICApID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dKb2luQnV0dG9uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaXN0SGVhZGVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X2xpc3RoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8RGlyZWN0b3J5U2VhcmNoQm94XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3Rvcnlfc2VhcmNoYm94XCJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25GaWx0ZXJDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xlYXI9e3RoaXMub25GaWx0ZXJDbGVhcn1cbiAgICAgICAgICAgICAgICAgICAgb25Kb2luQ2xpY2s9e3RoaXMub25Kb2luRnJvbVNlYXJjaENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17cGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgIHNob3dKb2luQnV0dG9uPXtzaG93Sm9pbkJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFRleHQ9e3RoaXMucHJvcHMuaW5pdGlhbFRleHR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8TmV0d29ya0Ryb3Bkb3duXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29scz17dGhpcy5wcm90b2NvbHN9XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZz17dGhpcy5zdGF0ZS5zZXJ2ZXJDb25maWd9XG4gICAgICAgICAgICAgICAgICAgIHNldENvbmZpZz17dGhpcy5vbk9wdGlvbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4cGxhbmF0aW9uID1cbiAgICAgICAgICAgIF90KFwiSWYgeW91IGNhbid0IGZpbmQgdGhlIHJvb20geW91J3JlIGxvb2tpbmcgZm9yLCBhc2sgZm9yIGFuIGludml0ZSBvciA8YT5jcmVhdGUgYSBuZXcgcm9vbTwvYT4uXCIsIHt9LFxuICAgICAgICAgICAgICAgIHsgYTogc3ViID0+IChcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtfaW5saW5lXCIgb25DbGljaz17dGhpcy5vbkNyZWF0ZVJvb21DbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICApIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHRpdGxlID0gX3QoXCJFeHBsb3JlIHJvb21zXCIpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X2RpYWxvZ1wiXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICAgICAgc2NyZWVuTmFtZT1cIlJvb21EaXJlY3RvcnlcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeVwiPlxuICAgICAgICAgICAgICAgICAgICB7IGV4cGxhbmF0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X2xpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbGlzdEhlYWRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbi8vIFNpbWlsYXIgdG8gbWF0cml4LXJlYWN0LXNkaydzIE1hdHJpeFRvb2xzLmdldERpc3BsYXlBbGlhc0ZvclJvb21cbi8vIGJ1dCB3b3JrcyB3aXRoIHRoZSBvYmplY3RzIHdlIGdldCBmcm9tIHRoZSBwdWJsaWMgcm9vbSBsaXN0XG5leHBvcnQgZnVuY3Rpb24gZ2V0RGlzcGxheUFsaWFzRm9yUm9vbShyb29tOiBJUHVibGljUm9vbXNDaHVua1Jvb20pIHtcbiAgICByZXR1cm4gZ2V0RGlzcGxheUFsaWFzRm9yQWxpYXNTZXQocm9vbS5jYW5vbmljYWxfYWxpYXMsIHJvb20uYWxpYXNlcyk7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsZUFBZSxHQUFHLCtCQUF4QjtBQUNBLE1BQU1DLGlCQUFpQixHQUFHLGlDQUExQjs7QUFlZSxNQUFNQyxhQUFOLFNBQTRCQyxjQUFBLENBQU1DLFNBQWxDLENBQTREO0VBTXZFQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUFBOztJQUNmLE1BQU1B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