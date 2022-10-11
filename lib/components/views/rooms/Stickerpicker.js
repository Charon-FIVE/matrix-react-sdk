"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _room = require("matrix-js-sdk/src/models/room");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _AppTile = _interopRequireDefault(require("../elements/AppTile"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _PersistedElement = _interopRequireDefault(require("../elements/PersistedElement"));

var _IntegrationManagers = require("../../../integrations/IntegrationManagers");

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _WidgetType = require("../../../widgets/WidgetType");

var _WidgetMessagingStore = require("../../../stores/widgets/WidgetMessagingStore");

var _GenericElementContextMenu = _interopRequireDefault(require("../context_menus/GenericElementContextMenu"));

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

var _AsyncStore = require("../../../stores/AsyncStore");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2018 New Vector Ltd

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
// This should be below the dialog level (4000), but above the rest of the UI (1000-2000).
// We sit in a context menu, so this should be given to the context menu.
const STICKERPICKER_Z_INDEX = 3500; // Key to store the widget's AppTile under in PersistedElement

const PERSISTED_ELEMENT_KEY = "stickerPicker";

class Stickerpicker extends _react.default.PureComponent {
  // This is loaded by _acquireScalarClient on an as-needed basis.
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "prevSentVisibility", void 0);
    (0, _defineProperty2.default)(this, "popoverWidth", 300);
    (0, _defineProperty2.default)(this, "popoverHeight", 300);
    (0, _defineProperty2.default)(this, "scalarClient", null);
    (0, _defineProperty2.default)(this, "removeStickerpickerWidgets", async () => {
      const scalarClient = await this.acquireScalarClient();

      _logger.logger.log('Removing Stickerpicker widgets');

      if (this.state.widgetId) {
        if (scalarClient) {
          scalarClient.disableWidgetAssets(_WidgetType.WidgetType.STICKERPICKER, this.state.widgetId).then(() => {
            _logger.logger.log('Assets disabled');
          }).catch(() => {
            _logger.logger.error('Failed to disable assets');
          });
        } else {
          _logger.logger.error("Cannot disable assets: no scalar client");
        }
      } else {
        _logger.logger.warn('No widget ID specified, not disabling assets');
      }

      this.props.setStickerPickerOpen(false);

      _WidgetUtils.default.removeStickerpickerWidgets().then(() => {
        this.forceUpdate();
      }).catch(e => {
        _logger.logger.error('Failed to remove sticker picker widget', e);
      });
    });
    (0, _defineProperty2.default)(this, "updateWidget", () => {
      const stickerpickerWidget = _WidgetUtils.default.getStickerpickerWidgets()[0];

      if (!stickerpickerWidget) {
        Stickerpicker.currentWidget = null;
        this.setState({
          stickerpickerWidget: null,
          widgetId: null
        });
        return;
      }

      const currentWidget = Stickerpicker.currentWidget;
      let currentUrl = null;

      if (currentWidget && currentWidget.content && currentWidget.content.url) {
        currentUrl = currentWidget.content.url;
      }

      let newUrl = null;

      if (stickerpickerWidget && stickerpickerWidget.content && stickerpickerWidget.content.url) {
        newUrl = stickerpickerWidget.content.url;
      }

      if (newUrl !== currentUrl) {
        // Destroy the existing frame so a new one can be created
        _PersistedElement.default.destroyElement(PERSISTED_ELEMENT_KEY);
      }

      Stickerpicker.currentWidget = stickerpickerWidget;
      this.setState({
        stickerpickerWidget,
        widgetId: stickerpickerWidget ? stickerpickerWidget.id : null
      });
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case "user_widget_updated":
          this.forceUpdate();
          break;

        case "stickerpicker_close":
          this.props.setStickerPickerOpen(false);
          break;

        case "show_left_panel":
        case "hide_left_panel":
          this.props.setStickerPickerOpen(false);
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onRightPanelStoreUpdate", () => {
      this.props.setStickerPickerOpen(false);
    });
    (0, _defineProperty2.default)(this, "onResize", () => {
      if (this.props.isStickerPickerOpen) {
        this.props.setStickerPickerOpen(false);
      }
    });
    (0, _defineProperty2.default)(this, "onFinished", () => {
      if (this.props.isStickerPickerOpen) {
        this.props.setStickerPickerOpen(false);
      }
    });
    (0, _defineProperty2.default)(this, "launchManageIntegrations", () => {
      // noinspection JSIgnoredPromiseFromCall
      _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().open(this.props.room, `type_${_WidgetType.WidgetType.STICKERPICKER.preferred}`, this.state.widgetId);
    });
    this.state = {
      imError: null,
      stickerpickerWidget: null,
      widgetId: null
    };
  }

  acquireScalarClient() {
    if (this.scalarClient) return Promise.resolve(this.scalarClient); // TODO: Pick the right manager for the widget

    if (_IntegrationManagers.IntegrationManagers.sharedInstance().hasManager()) {
      this.scalarClient = _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().getScalarClient();
      return this.scalarClient.connect().then(() => {
        this.forceUpdate();
        return this.scalarClient;
      }).catch(e => {
        this.imError((0, _languageHandler._td)("Failed to connect to integration manager"), e);
      });
    } else {
      _IntegrationManagers.IntegrationManagers.sharedInstance().openNoManagerDialog();
    }
  }

  componentDidMount() {
    // Close the sticker picker when the window resizes
    window.addEventListener('resize', this.onResize);
    this.dispatcherRef = _dispatcher.default.register(this.onAction); // Track updates to widget state in account data

    _MatrixClientPeg.MatrixClientPeg.get().on(_room.RoomEvent.AccountData, this.updateWidget);

    _RightPanelStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.onRightPanelStoreUpdate); // Initialise widget state from current account data


    this.updateWidget();
  }

  componentWillUnmount() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client) client.removeListener(_room.RoomEvent.AccountData, this.updateWidget);

    _RightPanelStore.default.instance.off(_AsyncStore.UPDATE_EVENT, this.onRightPanelStoreUpdate);

    window.removeEventListener('resize', this.onResize);

    if (this.dispatcherRef) {
      _dispatcher.default.unregister(this.dispatcherRef);
    }
  }

  componentDidUpdate() {
    this.sendVisibilityToWidget(this.props.isStickerPickerOpen);
  }

  imError(errorMsg, e) {
    _logger.logger.error(errorMsg, e);

    this.setState({
      imError: (0, _languageHandler._t)(errorMsg)
    });
    this.props.setStickerPickerOpen(false);
  }

  defaultStickerpickerContent() {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.launchManageIntegrations,
      className: "mx_Stickers_contentPlaceholder"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You don't currently have any stickerpacks enabled")), /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_Stickers_addLink"
    }, (0, _languageHandler._t)("Add some now")), /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/stickerpack-placeholder.png"),
      alt: ""
    }));
  }

  errorStickerpickerContent() {
    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        textAlign: "center"
      },
      className: "error"
    }, /*#__PURE__*/_react.default.createElement("p", null, " ", this.state.imError, " "));
  }

  sendVisibilityToWidget(visible) {
    if (!this.state.stickerpickerWidget) return;

    const messaging = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessagingForUid(_WidgetUtils.default.calcWidgetUid(this.state.stickerpickerWidget.id, null));

    if (messaging && visible !== this.prevSentVisibility) {
      messaging.updateVisibility(visible).catch(err => {
        _logger.logger.error("Error updating widget visibility: ", err);
      });
      this.prevSentVisibility = visible;
    }
  }

  getStickerpickerContent() {
    // Handle integration manager errors
    if (this.state.imError) {
      return this.errorStickerpickerContent();
    } // Stickers
    // TODO - Add support for Stickerpickers from multiple app stores.
    // Render content from multiple stickerpack sources, each within their
    // own iframe, within the stickerpicker UI element.


    const stickerpickerWidget = this.state.stickerpickerWidget;
    let stickersContent; // Use a separate ReactDOM tree to render the AppTile separately so that it persists and does
    // not unmount when we (a) close the sticker picker (b) switch rooms. It's properties are still
    // updated.
    // Load stickerpack content

    if (stickerpickerWidget && stickerpickerWidget.content && stickerpickerWidget.content.url) {
      // Set default name
      stickerpickerWidget.content.name = stickerpickerWidget.content.name || (0, _languageHandler._t)("Stickerpack"); // FIXME: could this use the same code as other apps?

      const stickerApp = {
        id: stickerpickerWidget.id,
        url: stickerpickerWidget.content.url,
        name: stickerpickerWidget.content.name,
        type: stickerpickerWidget.content.type,
        data: stickerpickerWidget.content.data,
        roomId: stickerpickerWidget.content.roomId,
        eventId: stickerpickerWidget.content.eventId,
        avatar_url: stickerpickerWidget.content.avatar_url,
        creatorUserId: stickerpickerWidget.content.creatorUserId
      };
      stickersContent = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Stickers_content_container"
      }, /*#__PURE__*/_react.default.createElement("div", {
        id: "stickersContent",
        className: "mx_Stickers_content",
        style: {
          border: 'none',
          height: this.popoverHeight,
          width: this.popoverWidth
        }
      }, /*#__PURE__*/_react.default.createElement(_PersistedElement.default, {
        persistKey: PERSISTED_ELEMENT_KEY,
        zIndex: STICKERPICKER_Z_INDEX
      }, /*#__PURE__*/_react.default.createElement(_AppTile.default, {
        app: stickerApp,
        room: this.props.room,
        threadId: this.props.threadId,
        fullWidth: true,
        userId: _MatrixClientPeg.MatrixClientPeg.get().credentials.userId,
        creatorUserId: stickerpickerWidget.sender || _MatrixClientPeg.MatrixClientPeg.get().credentials.userId,
        waitForIframeLoad: true,
        showMenubar: true,
        onEditClick: this.launchManageIntegrations,
        onDeleteClick: this.removeStickerpickerWidgets,
        showTitle: false,
        showPopout: false,
        handleMinimisePointerEvents: true,
        userWidget: true,
        showLayoutButtons: false
      }))));
    } else {
      // Default content to show if stickerpicker widget not added
      stickersContent = this.defaultStickerpickerContent();
    }

    return stickersContent;
  }
  /**
   * Called when the window is resized
   */


  render() {
    if (!this.props.isStickerPickerOpen) return null;
    return /*#__PURE__*/_react.default.createElement(_ContextMenu.default, (0, _extends2.default)({
      chevronFace: _ContextMenu.ChevronFace.Bottom,
      menuWidth: this.popoverWidth,
      menuHeight: this.popoverHeight,
      onFinished: this.onFinished,
      menuPaddingTop: 0,
      menuPaddingLeft: 0,
      menuPaddingRight: 0,
      zIndex: STICKERPICKER_Z_INDEX
    }, this.props.menuPosition), /*#__PURE__*/_react.default.createElement(_GenericElementContextMenu.default, {
      element: this.getStickerpickerContent(),
      onResize: this.onFinished
    }));
  }

}

exports.default = Stickerpicker;
(0, _defineProperty2.default)(Stickerpicker, "defaultProps", {
  threadId: null
});
(0, _defineProperty2.default)(Stickerpicker, "currentWidget", void 0);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTVElDS0VSUElDS0VSX1pfSU5ERVgiLCJQRVJTSVNURURfRUxFTUVOVF9LRVkiLCJTdGlja2VycGlja2VyIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNjYWxhckNsaWVudCIsImFjcXVpcmVTY2FsYXJDbGllbnQiLCJsb2dnZXIiLCJsb2ciLCJzdGF0ZSIsIndpZGdldElkIiwiZGlzYWJsZVdpZGdldEFzc2V0cyIsIldpZGdldFR5cGUiLCJTVElDS0VSUElDS0VSIiwidGhlbiIsImNhdGNoIiwiZXJyb3IiLCJ3YXJuIiwic2V0U3RpY2tlclBpY2tlck9wZW4iLCJXaWRnZXRVdGlscyIsInJlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzIiwiZm9yY2VVcGRhdGUiLCJlIiwic3RpY2tlcnBpY2tlcldpZGdldCIsImdldFN0aWNrZXJwaWNrZXJXaWRnZXRzIiwiY3VycmVudFdpZGdldCIsInNldFN0YXRlIiwiY3VycmVudFVybCIsImNvbnRlbnQiLCJ1cmwiLCJuZXdVcmwiLCJQZXJzaXN0ZWRFbGVtZW50IiwiZGVzdHJveUVsZW1lbnQiLCJpZCIsInBheWxvYWQiLCJhY3Rpb24iLCJpc1N0aWNrZXJQaWNrZXJPcGVuIiwiSW50ZWdyYXRpb25NYW5hZ2VycyIsInNoYXJlZEluc3RhbmNlIiwiZ2V0UHJpbWFyeU1hbmFnZXIiLCJvcGVuIiwicm9vbSIsInByZWZlcnJlZCIsImltRXJyb3IiLCJQcm9taXNlIiwicmVzb2x2ZSIsImhhc01hbmFnZXIiLCJnZXRTY2FsYXJDbGllbnQiLCJjb25uZWN0IiwiX3RkIiwib3Blbk5vTWFuYWdlckRpYWxvZyIsImNvbXBvbmVudERpZE1vdW50Iiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uUmVzaXplIiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJvbiIsIlJvb21FdmVudCIsIkFjY291bnREYXRhIiwidXBkYXRlV2lkZ2V0IiwiUmlnaHRQYW5lbFN0b3JlIiwiaW5zdGFuY2UiLCJVUERBVEVfRVZFTlQiLCJvblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY2xpZW50IiwicmVtb3ZlTGlzdGVuZXIiLCJvZmYiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidW5yZWdpc3RlciIsImNvbXBvbmVudERpZFVwZGF0ZSIsInNlbmRWaXNpYmlsaXR5VG9XaWRnZXQiLCJlcnJvck1zZyIsIl90IiwiZGVmYXVsdFN0aWNrZXJwaWNrZXJDb250ZW50IiwibGF1bmNoTWFuYWdlSW50ZWdyYXRpb25zIiwicmVxdWlyZSIsImVycm9yU3RpY2tlcnBpY2tlckNvbnRlbnQiLCJ0ZXh0QWxpZ24iLCJ2aXNpYmxlIiwibWVzc2FnaW5nIiwiV2lkZ2V0TWVzc2FnaW5nU3RvcmUiLCJnZXRNZXNzYWdpbmdGb3JVaWQiLCJjYWxjV2lkZ2V0VWlkIiwicHJldlNlbnRWaXNpYmlsaXR5IiwidXBkYXRlVmlzaWJpbGl0eSIsImVyciIsImdldFN0aWNrZXJwaWNrZXJDb250ZW50Iiwic3RpY2tlcnNDb250ZW50IiwibmFtZSIsInN0aWNrZXJBcHAiLCJ0eXBlIiwiZGF0YSIsInJvb21JZCIsImV2ZW50SWQiLCJhdmF0YXJfdXJsIiwiY3JlYXRvclVzZXJJZCIsImJvcmRlciIsImhlaWdodCIsInBvcG92ZXJIZWlnaHQiLCJ3aWR0aCIsInBvcG92ZXJXaWR0aCIsInRocmVhZElkIiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJzZW5kZXIiLCJyZW5kZXIiLCJDaGV2cm9uRmFjZSIsIkJvdHRvbSIsIm9uRmluaXNoZWQiLCJtZW51UG9zaXRpb24iXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9TdGlja2VycGlja2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUm9vbSwgUm9vbUV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBcHBUaWxlIGZyb20gJy4uL2VsZW1lbnRzL0FwcFRpbGUnO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IFdpZGdldFV0aWxzLCB7IElXaWRnZXRFdmVudCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL1dpZGdldFV0aWxzJztcbmltcG9ydCBQZXJzaXN0ZWRFbGVtZW50IGZyb20gXCIuLi9lbGVtZW50cy9QZXJzaXN0ZWRFbGVtZW50XCI7XG5pbXBvcnQgeyBJbnRlZ3JhdGlvbk1hbmFnZXJzIH0gZnJvbSBcIi4uLy4uLy4uL2ludGVncmF0aW9ucy9JbnRlZ3JhdGlvbk1hbmFnZXJzXCI7XG5pbXBvcnQgQ29udGV4dE1lbnUsIHsgQ2hldnJvbkZhY2UgfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IHsgV2lkZ2V0VHlwZSB9IGZyb20gXCIuLi8uLi8uLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7IFdpZGdldE1lc3NhZ2luZ1N0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy93aWRnZXRzL1dpZGdldE1lc3NhZ2luZ1N0b3JlXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcyc7XG5pbXBvcnQgU2NhbGFyQXV0aENsaWVudCBmcm9tICcuLi8uLi8uLi9TY2FsYXJBdXRoQ2xpZW50JztcbmltcG9ydCBHZW5lcmljRWxlbWVudENvbnRleHRNZW51IGZyb20gXCIuLi9jb250ZXh0X21lbnVzL0dlbmVyaWNFbGVtZW50Q29udGV4dE1lbnVcIjtcbmltcG9ydCB7IElBcHAgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1dpZGdldFN0b3JlXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmUnO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmUnO1xuXG4vLyBUaGlzIHNob3VsZCBiZSBiZWxvdyB0aGUgZGlhbG9nIGxldmVsICg0MDAwKSwgYnV0IGFib3ZlIHRoZSByZXN0IG9mIHRoZSBVSSAoMTAwMC0yMDAwKS5cbi8vIFdlIHNpdCBpbiBhIGNvbnRleHQgbWVudSwgc28gdGhpcyBzaG91bGQgYmUgZ2l2ZW4gdG8gdGhlIGNvbnRleHQgbWVudS5cbmNvbnN0IFNUSUNLRVJQSUNLRVJfWl9JTkRFWCA9IDM1MDA7XG5cbi8vIEtleSB0byBzdG9yZSB0aGUgd2lkZ2V0J3MgQXBwVGlsZSB1bmRlciBpbiBQZXJzaXN0ZWRFbGVtZW50XG5jb25zdCBQRVJTSVNURURfRUxFTUVOVF9LRVkgPSBcInN0aWNrZXJQaWNrZXJcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbiAgICB0aHJlYWRJZD86IHN0cmluZyB8IG51bGw7XG4gICAgaXNTdGlja2VyUGlja2VyT3BlbjogYm9vbGVhbjtcbiAgICBtZW51UG9zaXRpb24/OiBhbnk7XG4gICAgc2V0U3RpY2tlclBpY2tlck9wZW46IChpc1N0aWNrZXJQaWNrZXJPcGVuOiBib29sZWFuKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBpbUVycm9yOiBzdHJpbmc7XG4gICAgc3RpY2tlcnBpY2tlcldpZGdldDogSVdpZGdldEV2ZW50O1xuICAgIHdpZGdldElkOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0aWNrZXJwaWNrZXIgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgdGhyZWFkSWQ6IG51bGwsXG4gICAgfTtcblxuICAgIHN0YXRpYyBjdXJyZW50V2lkZ2V0O1xuXG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG5cbiAgICBwcml2YXRlIHByZXZTZW50VmlzaWJpbGl0eTogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgcG9wb3ZlcldpZHRoID0gMzAwO1xuICAgIHByaXZhdGUgcG9wb3ZlckhlaWdodCA9IDMwMDtcbiAgICAvLyBUaGlzIGlzIGxvYWRlZCBieSBfYWNxdWlyZVNjYWxhckNsaWVudCBvbiBhbiBhcy1uZWVkZWQgYmFzaXMuXG4gICAgcHJpdmF0ZSBzY2FsYXJDbGllbnQ6IFNjYWxhckF1dGhDbGllbnQgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpbUVycm9yOiBudWxsLFxuICAgICAgICAgICAgc3RpY2tlcnBpY2tlcldpZGdldDogbnVsbCxcbiAgICAgICAgICAgIHdpZGdldElkOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYWNxdWlyZVNjYWxhckNsaWVudCgpOiBQcm9taXNlPHZvaWQgfCBTY2FsYXJBdXRoQ2xpZW50PiB7XG4gICAgICAgIGlmICh0aGlzLnNjYWxhckNsaWVudCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnNjYWxhckNsaWVudCk7XG4gICAgICAgIC8vIFRPRE86IFBpY2sgdGhlIHJpZ2h0IG1hbmFnZXIgZm9yIHRoZSB3aWRnZXRcbiAgICAgICAgaWYgKEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKS5oYXNNYW5hZ2VyKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2NhbGFyQ2xpZW50ID0gSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLmdldFByaW1hcnlNYW5hZ2VyKCkuZ2V0U2NhbGFyQ2xpZW50KCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zY2FsYXJDbGllbnQuY29ubmVjdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zY2FsYXJDbGllbnQ7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1FcnJvcihfdGQoXCJGYWlsZWQgdG8gY29ubmVjdCB0byBpbnRlZ3JhdGlvbiBtYW5hZ2VyXCIpLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLm9wZW5Ob01hbmFnZXJEaWFsb2coKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlU3RpY2tlcnBpY2tlcldpZGdldHMgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGNvbnN0IHNjYWxhckNsaWVudCA9IGF3YWl0IHRoaXMuYWNxdWlyZVNjYWxhckNsaWVudCgpO1xuICAgICAgICBsb2dnZXIubG9nKCdSZW1vdmluZyBTdGlja2VycGlja2VyIHdpZGdldHMnKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUud2lkZ2V0SWQpIHtcbiAgICAgICAgICAgIGlmIChzY2FsYXJDbGllbnQpIHtcbiAgICAgICAgICAgICAgICBzY2FsYXJDbGllbnQuZGlzYWJsZVdpZGdldEFzc2V0cyhXaWRnZXRUeXBlLlNUSUNLRVJQSUNLRVIsIHRoaXMuc3RhdGUud2lkZ2V0SWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIubG9nKCdBc3NldHMgZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIGRpc2FibGUgYXNzZXRzJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNhbm5vdCBkaXNhYmxlIGFzc2V0czogbm8gc2NhbGFyIGNsaWVudFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKCdObyB3aWRnZXQgSUQgc3BlY2lmaWVkLCBub3QgZGlzYWJsaW5nIGFzc2V0cycpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9wcy5zZXRTdGlja2VyUGlja2VyT3BlbihmYWxzZSk7XG4gICAgICAgIFdpZGdldFV0aWxzLnJlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byByZW1vdmUgc3RpY2tlciBwaWNrZXIgd2lkZ2V0JywgZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIC8vIENsb3NlIHRoZSBzdGlja2VyIHBpY2tlciB3aGVuIHRoZSB3aW5kb3cgcmVzaXplc1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZSk7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuXG4gICAgICAgIC8vIFRyYWNrIHVwZGF0ZXMgdG8gd2lkZ2V0IHN0YXRlIGluIGFjY291bnQgZGF0YVxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oUm9vbUV2ZW50LkFjY291bnREYXRhLCB0aGlzLnVwZGF0ZVdpZGdldCk7XG5cbiAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSk7XG4gICAgICAgIC8vIEluaXRpYWxpc2Ugd2lkZ2V0IHN0YXRlIGZyb20gY3VycmVudCBhY2NvdW50IGRhdGFcbiAgICAgICAgdGhpcy51cGRhdGVXaWRnZXQoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaWVudCkgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5BY2NvdW50RGF0YSwgdGhpcy51cGRhdGVXaWRnZXQpO1xuICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlclJlZikge1xuICAgICAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2VuZFZpc2liaWxpdHlUb1dpZGdldCh0aGlzLnByb3BzLmlzU3RpY2tlclBpY2tlck9wZW4pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW1FcnJvcihlcnJvck1zZzogc3RyaW5nLCBlOiBFcnJvcik6IHZvaWQge1xuICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNc2csIGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGltRXJyb3I6IF90KGVycm9yTXNnKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvcHMuc2V0U3RpY2tlclBpY2tlck9wZW4oZmFsc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlV2lkZ2V0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBzdGlja2VycGlja2VyV2lkZ2V0ID0gV2lkZ2V0VXRpbHMuZ2V0U3RpY2tlcnBpY2tlcldpZGdldHMoKVswXTtcbiAgICAgICAgaWYgKCFzdGlja2VycGlja2VyV2lkZ2V0KSB7XG4gICAgICAgICAgICBTdGlja2VycGlja2VyLmN1cnJlbnRXaWRnZXQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN0aWNrZXJwaWNrZXJXaWRnZXQ6IG51bGwsIHdpZGdldElkOiBudWxsIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3VycmVudFdpZGdldCA9IFN0aWNrZXJwaWNrZXIuY3VycmVudFdpZGdldDtcbiAgICAgICAgbGV0IGN1cnJlbnRVcmwgPSBudWxsO1xuICAgICAgICBpZiAoY3VycmVudFdpZGdldCAmJiBjdXJyZW50V2lkZ2V0LmNvbnRlbnQgJiYgY3VycmVudFdpZGdldC5jb250ZW50LnVybCkge1xuICAgICAgICAgICAgY3VycmVudFVybCA9IGN1cnJlbnRXaWRnZXQuY29udGVudC51cmw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3VXJsID0gbnVsbDtcbiAgICAgICAgaWYgKHN0aWNrZXJwaWNrZXJXaWRnZXQgJiYgc3RpY2tlcnBpY2tlcldpZGdldC5jb250ZW50ICYmIHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC51cmwpIHtcbiAgICAgICAgICAgIG5ld1VybCA9IHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC51cmw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3VXJsICE9PSBjdXJyZW50VXJsKSB7XG4gICAgICAgICAgICAvLyBEZXN0cm95IHRoZSBleGlzdGluZyBmcmFtZSBzbyBhIG5ldyBvbmUgY2FuIGJlIGNyZWF0ZWRcbiAgICAgICAgICAgIFBlcnNpc3RlZEVsZW1lbnQuZGVzdHJveUVsZW1lbnQoUEVSU0lTVEVEX0VMRU1FTlRfS0VZKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFN0aWNrZXJwaWNrZXIuY3VycmVudFdpZGdldCA9IHN0aWNrZXJwaWNrZXJXaWRnZXQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc3RpY2tlcnBpY2tlcldpZGdldCxcbiAgICAgICAgICAgIHdpZGdldElkOiBzdGlja2VycGlja2VyV2lkZ2V0ID8gc3RpY2tlcnBpY2tlcldpZGdldC5pZCA6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpOiB2b2lkID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBcInVzZXJfd2lkZ2V0X3VwZGF0ZWRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwic3RpY2tlcnBpY2tlcl9jbG9zZVwiOlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2V0U3RpY2tlclBpY2tlck9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInNob3dfbGVmdF9wYW5lbFwiOlxuICAgICAgICAgICAgY2FzZSBcImhpZGVfbGVmdF9wYW5lbFwiOlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2V0U3RpY2tlclBpY2tlck9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SaWdodFBhbmVsU3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMuc2V0U3RpY2tlclBpY2tlck9wZW4oZmFsc2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGRlZmF1bHRTdGlja2VycGlja2VyQ29udGVudCgpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLmxhdW5jaE1hbmFnZUludGVncmF0aW9uc31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X1N0aWNrZXJzX2NvbnRlbnRQbGFjZWhvbGRlcic+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIllvdSBkb24ndCBjdXJyZW50bHkgaGF2ZSBhbnkgc3RpY2tlcnBhY2tzIGVuYWJsZWRcIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9J214X1N0aWNrZXJzX2FkZExpbmsnPnsgX3QoXCJBZGQgc29tZSBub3dcIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvc3RpY2tlcnBhY2stcGxhY2Vob2xkZXIucG5nXCIpfSBhbHQ9XCJcIiAvPlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXJyb3JTdGlja2VycGlja2VyQ29udGVudCgpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogXCJjZW50ZXJcIiB9fSBjbGFzc05hbWU9XCJlcnJvclwiPlxuICAgICAgICAgICAgICAgIDxwPiB7IHRoaXMuc3RhdGUuaW1FcnJvciB9IDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZFZpc2liaWxpdHlUb1dpZGdldCh2aXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zdGlja2VycGlja2VyV2lkZ2V0KSByZXR1cm47XG4gICAgICAgIGNvbnN0IG1lc3NhZ2luZyA9IFdpZGdldE1lc3NhZ2luZ1N0b3JlLmluc3RhbmNlLmdldE1lc3NhZ2luZ0ZvclVpZChcbiAgICAgICAgICAgIFdpZGdldFV0aWxzLmNhbGNXaWRnZXRVaWQodGhpcy5zdGF0ZS5zdGlja2VycGlja2VyV2lkZ2V0LmlkLCBudWxsKSxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKG1lc3NhZ2luZyAmJiB2aXNpYmxlICE9PSB0aGlzLnByZXZTZW50VmlzaWJpbGl0eSkge1xuICAgICAgICAgICAgbWVzc2FnaW5nLnVwZGF0ZVZpc2liaWxpdHkodmlzaWJsZSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciB1cGRhdGluZyB3aWRnZXQgdmlzaWJpbGl0eTogXCIsIGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucHJldlNlbnRWaXNpYmlsaXR5ID0gdmlzaWJsZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTdGlja2VycGlja2VyQ29udGVudCgpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnRlZ3JhdGlvbiBtYW5hZ2VyIGVycm9yc1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pbUVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvclN0aWNrZXJwaWNrZXJDb250ZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGlja2Vyc1xuICAgICAgICAvLyBUT0RPIC0gQWRkIHN1cHBvcnQgZm9yIFN0aWNrZXJwaWNrZXJzIGZyb20gbXVsdGlwbGUgYXBwIHN0b3Jlcy5cbiAgICAgICAgLy8gUmVuZGVyIGNvbnRlbnQgZnJvbSBtdWx0aXBsZSBzdGlja2VycGFjayBzb3VyY2VzLCBlYWNoIHdpdGhpbiB0aGVpclxuICAgICAgICAvLyBvd24gaWZyYW1lLCB3aXRoaW4gdGhlIHN0aWNrZXJwaWNrZXIgVUkgZWxlbWVudC5cbiAgICAgICAgY29uc3Qgc3RpY2tlcnBpY2tlcldpZGdldCA9IHRoaXMuc3RhdGUuc3RpY2tlcnBpY2tlcldpZGdldDtcbiAgICAgICAgbGV0IHN0aWNrZXJzQ29udGVudDtcblxuICAgICAgICAvLyBVc2UgYSBzZXBhcmF0ZSBSZWFjdERPTSB0cmVlIHRvIHJlbmRlciB0aGUgQXBwVGlsZSBzZXBhcmF0ZWx5IHNvIHRoYXQgaXQgcGVyc2lzdHMgYW5kIGRvZXNcbiAgICAgICAgLy8gbm90IHVubW91bnQgd2hlbiB3ZSAoYSkgY2xvc2UgdGhlIHN0aWNrZXIgcGlja2VyIChiKSBzd2l0Y2ggcm9vbXMuIEl0J3MgcHJvcGVydGllcyBhcmUgc3RpbGxcbiAgICAgICAgLy8gdXBkYXRlZC5cblxuICAgICAgICAvLyBMb2FkIHN0aWNrZXJwYWNrIGNvbnRlbnRcbiAgICAgICAgaWYgKHN0aWNrZXJwaWNrZXJXaWRnZXQgJiYgc3RpY2tlcnBpY2tlcldpZGdldC5jb250ZW50ICYmIHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC51cmwpIHtcbiAgICAgICAgICAgIC8vIFNldCBkZWZhdWx0IG5hbWVcbiAgICAgICAgICAgIHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC5uYW1lID0gc3RpY2tlcnBpY2tlcldpZGdldC5jb250ZW50Lm5hbWUgfHwgX3QoXCJTdGlja2VycGFja1wiKTtcblxuICAgICAgICAgICAgLy8gRklYTUU6IGNvdWxkIHRoaXMgdXNlIHRoZSBzYW1lIGNvZGUgYXMgb3RoZXIgYXBwcz9cbiAgICAgICAgICAgIGNvbnN0IHN0aWNrZXJBcHA6IElBcHAgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHN0aWNrZXJwaWNrZXJXaWRnZXQuaWQsXG4gICAgICAgICAgICAgICAgdXJsOiBzdGlja2VycGlja2VyV2lkZ2V0LmNvbnRlbnQudXJsLFxuICAgICAgICAgICAgICAgIG5hbWU6IHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC5uYW1lLFxuICAgICAgICAgICAgICAgIHR5cGU6IHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC50eXBlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC5kYXRhLFxuICAgICAgICAgICAgICAgIHJvb21JZDogc3RpY2tlcnBpY2tlcldpZGdldC5jb250ZW50LnJvb21JZCxcbiAgICAgICAgICAgICAgICBldmVudElkOiBzdGlja2VycGlja2VyV2lkZ2V0LmNvbnRlbnQuZXZlbnRJZCxcbiAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBzdGlja2VycGlja2VyV2lkZ2V0LmNvbnRlbnQuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICBjcmVhdG9yVXNlcklkOiBzdGlja2VycGlja2VyV2lkZ2V0LmNvbnRlbnQuY3JlYXRvclVzZXJJZCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0aWNrZXJzQ29udGVudCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU3RpY2tlcnNfY29udGVudF9jb250YWluZXInPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBpZD0nc3RpY2tlcnNDb250ZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9TdGlja2Vyc19jb250ZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMucG9wb3ZlckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5wb3BvdmVyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8UGVyc2lzdGVkRWxlbWVudCBwZXJzaXN0S2V5PXtQRVJTSVNURURfRUxFTUVOVF9LRVl9IHpJbmRleD17U1RJQ0tFUlBJQ0tFUl9aX0lOREVYfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QXBwVGlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHA9e3N0aWNrZXJBcHB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyZWFkSWQ9e3RoaXMucHJvcHMudGhyZWFkSWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkPXtNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9yVXNlcklkPXtzdGlja2VycGlja2VyV2lkZ2V0LnNlbmRlciB8fCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0Rm9ySWZyYW1lTG9hZD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lbnViYXI9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdENsaWNrPXt0aGlzLmxhdW5jaE1hbmFnZUludGVncmF0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDbGljaz17dGhpcy5yZW1vdmVTdGlja2VycGlja2VyV2lkZ2V0c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1RpdGxlPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1BvcG91dD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcldpZGdldD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0xheW91dEJ1dHRvbnM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1BlcnNpc3RlZEVsZW1lbnQ+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERlZmF1bHQgY29udGVudCB0byBzaG93IGlmIHN0aWNrZXJwaWNrZXIgd2lkZ2V0IG5vdCBhZGRlZFxuICAgICAgICAgICAgc3RpY2tlcnNDb250ZW50ID0gdGhpcy5kZWZhdWx0U3RpY2tlcnBpY2tlckNvbnRlbnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RpY2tlcnNDb250ZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIHRoZSB3aW5kb3cgaXMgcmVzaXplZFxuICAgICAqL1xuICAgIHByaXZhdGUgb25SZXNpemUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzU3RpY2tlclBpY2tlck9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc2V0U3RpY2tlclBpY2tlck9wZW4oZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzdGlja2VycyBwaWNrZXIgd2FzIGhpZGRlblxuICAgICAqL1xuICAgIHByaXZhdGUgb25GaW5pc2hlZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNTdGlja2VyUGlja2VyT3Blbikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5zZXRTdGlja2VyUGlja2VyT3BlbihmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTGF1bmNoIHRoZSBpbnRlZ3JhdGlvbiBtYW5hZ2VyIG9uIHRoZSBzdGlja2VycyBpbnRlZ3JhdGlvbiBwYWdlXG4gICAgICovXG4gICAgcHJpdmF0ZSBsYXVuY2hNYW5hZ2VJbnRlZ3JhdGlvbnMgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0lnbm9yZWRQcm9taXNlRnJvbUNhbGxcbiAgICAgICAgSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLmdldFByaW1hcnlNYW5hZ2VyKCkub3BlbihcbiAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbSxcbiAgICAgICAgICAgIGB0eXBlXyR7V2lkZ2V0VHlwZS5TVElDS0VSUElDS0VSLnByZWZlcnJlZH1gLFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS53aWRnZXRJZCxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5pc1N0aWNrZXJQaWNrZXJPcGVuKSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gPENvbnRleHRNZW51XG4gICAgICAgICAgICBjaGV2cm9uRmFjZT17Q2hldnJvbkZhY2UuQm90dG9tfVxuICAgICAgICAgICAgbWVudVdpZHRoPXt0aGlzLnBvcG92ZXJXaWR0aH1cbiAgICAgICAgICAgIG1lbnVIZWlnaHQ9e3RoaXMucG9wb3ZlckhlaWdodH1cbiAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25GaW5pc2hlZH1cbiAgICAgICAgICAgIG1lbnVQYWRkaW5nVG9wPXswfVxuICAgICAgICAgICAgbWVudVBhZGRpbmdMZWZ0PXswfVxuICAgICAgICAgICAgbWVudVBhZGRpbmdSaWdodD17MH1cbiAgICAgICAgICAgIHpJbmRleD17U1RJQ0tFUlBJQ0tFUl9aX0lOREVYfVxuICAgICAgICAgICAgey4uLnRoaXMucHJvcHMubWVudVBvc2l0aW9ufVxuICAgICAgICA+XG4gICAgICAgICAgICA8R2VuZXJpY0VsZW1lbnRDb250ZXh0TWVudSBlbGVtZW50PXt0aGlzLmdldFN0aWNrZXJwaWNrZXJDb250ZW50KCl9IG9uUmVzaXplPXt0aGlz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