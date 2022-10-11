"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetLayoutStore = exports.WIDGET_LAYOUT_EVENT_TYPE = exports.MAX_PINNED = exports.Container = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _WidgetStore = _interopRequireDefault(require("../WidgetStore"));

var _WidgetType = require("../../widgets/WidgetType");

var _numbers = require("../../utils/numbers");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _ReadyWatchingStore = require("../ReadyWatchingStore");

var _SettingLevel = require("../../settings/SettingLevel");

var _arrays = require("../../utils/arrays");

var _AsyncStore = require("../AsyncStore");

var _strings = require("../../utils/strings");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const WIDGET_LAYOUT_EVENT_TYPE = "io.element.widgets.layout";
exports.WIDGET_LAYOUT_EVENT_TYPE = WIDGET_LAYOUT_EVENT_TYPE;
let Container;
exports.Container = Container;

(function (Container) {
  Container["Top"] = "top";
  Container["Right"] = "right";
  Container["Center"] = "center";
})(Container || (exports.Container = Container = {}));

// Dev note: "Pinned" widgets are ones in the top container.
const MAX_PINNED = 3; // These two are whole percentages and don't really mean anything. Later values will decide
// minimum, but these help determine proportions during our calculations here. In fact, these
// values should be *smaller* than the actual minimums imposed by later components.

exports.MAX_PINNED = MAX_PINNED;
const MIN_WIDGET_WIDTH_PCT = 10; // 10%

const MIN_WIDGET_HEIGHT_PCT = 2; // 2%

class WidgetLayoutStore extends _ReadyWatchingStore.ReadyWatchingStore {
  constructor() {
    super(_dispatcher.default);
    (0, _defineProperty2.default)(this, "byRoom", {});
    (0, _defineProperty2.default)(this, "pinnedRef", void 0);
    (0, _defineProperty2.default)(this, "layoutRef", void 0);
    (0, _defineProperty2.default)(this, "updateAllRooms", () => {
      this.byRoom = {};

      for (const room of this.matrixClient.getVisibleRooms()) {
        this.recalculateRoom(room);
      }
    });
    (0, _defineProperty2.default)(this, "updateFromWidgetStore", roomId => {
      if (roomId) {
        const room = this.matrixClient.getRoom(roomId);
        if (room) this.recalculateRoom(room);
      } else {
        this.updateAllRooms();
      }
    });
    (0, _defineProperty2.default)(this, "updateRoomFromState", ev => {
      if (ev.getType() !== WIDGET_LAYOUT_EVENT_TYPE) return;
      const room = this.matrixClient.getRoom(ev.getRoomId());
      if (room) this.recalculateRoom(room);
    });
    (0, _defineProperty2.default)(this, "updateFromSettings", (settingName, roomId) => {
      if (roomId) {
        const room = this.matrixClient.getRoom(roomId);
        if (room) this.recalculateRoom(room);
      } else {
        this.updateAllRooms();
      }
    });
  }

  static get instance() {
    if (!this.internalInstance) {
      this.internalInstance = new WidgetLayoutStore();
      this.internalInstance.start();
    }

    return this.internalInstance;
  }

  static emissionForRoom(room) {
    return `update_${room.roomId}`;
  }

  emitFor(room) {
    this.emit(WidgetLayoutStore.emissionForRoom(room));
  }

  async onReady() {
    this.updateAllRooms();
    this.matrixClient.on(_roomState.RoomStateEvent.Events, this.updateRoomFromState);
    this.pinnedRef = _SettingsStore.default.watchSetting("Widgets.pinned", null, this.updateFromSettings);
    this.layoutRef = _SettingsStore.default.watchSetting("Widgets.layout", null, this.updateFromSettings);

    _WidgetStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.updateFromWidgetStore);
  }

  async onNotReady() {
    this.byRoom = {};
    this.matrixClient?.off(_roomState.RoomStateEvent.Events, this.updateRoomFromState);

    _SettingsStore.default.unwatchSetting(this.pinnedRef);

    _SettingsStore.default.unwatchSetting(this.layoutRef);

    _WidgetStore.default.instance.off(_AsyncStore.UPDATE_EVENT, this.updateFromWidgetStore);
  }

  recalculateRoom(room) {
    const widgets = _WidgetStore.default.instance.getApps(room.roomId);

    if (!widgets?.length) {
      this.byRoom[room.roomId] = {};
      this.emitFor(room);
      return;
    }

    const beforeChanges = JSON.stringify(this.byRoom[room.roomId]);
    const layoutEv = room.currentState.getStateEvents(WIDGET_LAYOUT_EVENT_TYPE, "");

    const legacyPinned = _SettingsStore.default.getValue("Widgets.pinned", room.roomId);

    let userLayout = _SettingsStore.default.getValue("Widgets.layout", room.roomId);

    if (layoutEv && userLayout && userLayout.overrides !== layoutEv.getId()) {
      // For some other layout that we don't really care about. The user can reset this
      // by updating their personal layout.
      userLayout = null;
    }

    const roomLayout = layoutEv ? layoutEv.getContent() : null; // We filter for the center container first.
    // (An error is raised, if there are multiple widgets marked for the center container)
    // For the right and top container multiple widgets are allowed.

    const topWidgets = [];
    const rightWidgets = [];
    const centerWidgets = [];

    for (const widget of widgets) {
      const stateContainer = roomLayout?.widgets?.[widget.id]?.container;
      const manualContainer = userLayout?.widgets?.[widget.id]?.container;
      const isLegacyPinned = !!legacyPinned?.[widget.id];
      const defaultContainer = _WidgetType.WidgetType.JITSI.matches(widget.type) ? Container.Top : Container.Right;

      if (manualContainer ? manualContainer === Container.Center : stateContainer === Container.Center) {
        if (centerWidgets.length) {
          console.error("Tried to push a second widget into the center container");
        } else {
          centerWidgets.push(widget);
        } // The widget won't need to be put in any other container.


        continue;
      }

      let targetContainer = defaultContainer;

      if (!!manualContainer || !!stateContainer) {
        targetContainer = manualContainer ? manualContainer : stateContainer;
      } else if (isLegacyPinned && !stateContainer) {
        // Special legacy case
        targetContainer = Container.Top;
      }

      (targetContainer === Container.Top ? topWidgets : rightWidgets).push(widget);
    } // Trim to MAX_PINNED


    const runoff = topWidgets.slice(MAX_PINNED);
    rightWidgets.push(...runoff); // Order the widgets in the top container, putting autopinned Jitsi widgets first
    // unless they have a specific order in mind

    topWidgets.sort((a, b) => {
      const layoutA = roomLayout?.widgets?.[a.id];
      const layoutB = roomLayout?.widgets?.[b.id];
      const userLayoutA = userLayout?.widgets?.[a.id];
      const userLayoutB = userLayout?.widgets?.[b.id]; // Jitsi widgets are defaulted to be the leftmost widget whereas other widgets
      // default to the right side.

      const defaultA = _WidgetType.WidgetType.JITSI.matches(a.type) ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      const defaultB = _WidgetType.WidgetType.JITSI.matches(b.type) ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      const orderA = (0, _numbers.defaultNumber)(userLayoutA?.index, (0, _numbers.defaultNumber)(layoutA?.index, defaultA));
      const orderB = (0, _numbers.defaultNumber)(userLayoutB?.index, (0, _numbers.defaultNumber)(layoutB?.index, defaultB));

      if (orderA === orderB) {
        // We just need a tiebreak
        return (0, _strings.compare)(a.id, b.id);
      }

      return orderA - orderB;
    }); // Determine width distribution and height of the top container now (the only relevant one)

    const widths = [];
    let maxHeight = null; // null == default

    let doAutobalance = true;

    for (let i = 0; i < topWidgets.length; i++) {
      const widget = topWidgets[i];
      const widgetLayout = roomLayout?.widgets?.[widget.id];
      const userWidgetLayout = userLayout?.widgets?.[widget.id];

      if (Number.isFinite(userWidgetLayout?.width) || Number.isFinite(widgetLayout?.width)) {
        const val = userWidgetLayout?.width || widgetLayout?.width;
        const normalized = (0, _numbers.clamp)(val, MIN_WIDGET_WIDTH_PCT, 100);
        widths.push(normalized);
        doAutobalance = false; // a manual width was specified
      } else {
        widths.push(100); // we'll figure this out later
      }

      if (widgetLayout?.height || userWidgetLayout?.height) {
        const defRoomHeight = (0, _numbers.defaultNumber)(widgetLayout?.height, MIN_WIDGET_HEIGHT_PCT);
        const h = (0, _numbers.defaultNumber)(userWidgetLayout?.height, defRoomHeight);
        maxHeight = Math.max(maxHeight, (0, _numbers.clamp)(h, MIN_WIDGET_HEIGHT_PCT, 100));
      }
    }

    if (doAutobalance) {
      for (let i = 0; i < widths.length; i++) {
        widths[i] = 100 / widths.length;
      }
    } else {
      // If we're not autobalancing then it means that we're trying to make
      // sure that widgets make up exactly 100% of space (not over, not under)
      const difference = (0, _numbers.sum)(...widths) - 100; // positive = over, negative = under

      if (difference < 0) {
        // For a deficit we just fill everything in equally
        for (let i = 0; i < widths.length; i++) {
          widths[i] += Math.abs(difference) / widths.length;
        }
      } else if (difference > 0) {
        // When we're over, we try to scale all the widgets within range first.
        // We clamp values to try and keep ourselves sane and within range.
        for (let i = 0; i < widths.length; i++) {
          widths[i] = (0, _numbers.clamp)(widths[i] - difference / widths.length, MIN_WIDGET_WIDTH_PCT, 100);
        } // If we're still over, find the widgets which have more width than the minimum
        // and balance them out until we're at 100%. This should keep us as close as possible
        // to the intended distributions.
        //
        // Note: if we ever decide to set a minimum which is larger than 100%/MAX_WIDGETS then
        // we probably have other issues - this code assumes we don't do that.


        const toReclaim = (0, _numbers.sum)(...widths) - 100;

        if (toReclaim > 0) {
          const largeIndices = widths.map((v, i) => [i, v]).filter(p => p[1] > MIN_WIDGET_WIDTH_PCT).map(p => p[0]);

          for (const idx of largeIndices) {
            widths[idx] -= toReclaim / largeIndices.length;
          }
        }
      }
    } // Finally, fill in our cache and update


    this.byRoom[room.roomId] = {};

    if (topWidgets.length) {
      this.byRoom[room.roomId][Container.Top] = {
        ordered: topWidgets,
        distributions: widths,
        height: maxHeight
      };
    }

    if (rightWidgets.length) {
      this.byRoom[room.roomId][Container.Right] = {
        ordered: rightWidgets
      };
    }

    if (centerWidgets.length) {
      this.byRoom[room.roomId][Container.Center] = {
        ordered: centerWidgets
      };
    }

    const afterChanges = JSON.stringify(this.byRoom[room.roomId]);

    if (afterChanges !== beforeChanges) {
      this.emitFor(room);
    }
  }

  getContainerWidgets(room, container) {
    return this.byRoom[room?.roomId]?.[container]?.ordered || [];
  }

  isInContainer(room, widget, container) {
    return this.getContainerWidgets(room, container).some(w => w.id === widget.id);
  }

  canAddToContainer(room, container) {
    switch (container) {
      case Container.Top:
        return this.getContainerWidgets(room, container).length < MAX_PINNED;

      case Container.Right:
        return this.getContainerWidgets(room, container).length < MAX_PINNED;

      case Container.Center:
        return this.getContainerWidgets(room, container).length < 1;
    }
  }

  getResizerDistributions(room, container) {
    // yes, string.
    let distributions = this.byRoom[room.roomId]?.[container]?.distributions;
    if (!distributions || distributions.length < 2) return []; // The distributor actually expects to be fed N-1 sizes and expands the middle section
    // instead of the edges. Therefore, we need to return [0] when there's two widgets or
    // [0, 2] when there's three (skipping [1] because it's irrelevant).

    if (distributions.length === 2) distributions = [distributions[0]];
    if (distributions.length === 3) distributions = [distributions[0], distributions[2]];
    return distributions.map(d => `${d.toFixed(1)}%`); // actual percents - these are decoded later
  }

  setResizerDistributions(room, container, distributions) {
    if (container !== Container.Top) return; // ignore - not relevant

    const numbers = distributions.map(d => Number(Number(d.substring(0, d.length - 1)).toFixed(1)));
    const widgets = this.getContainerWidgets(room, container); // From getResizerDistributions, we need to fill in the middle size if applicable.

    const remaining = 100 - (0, _numbers.sum)(...numbers);
    if (numbers.length === 2) numbers.splice(1, 0, remaining);
    if (numbers.length === 1) numbers.push(remaining);
    const localLayout = {};
    widgets.forEach((w, i) => {
      localLayout[w.id] = {
        container: container,
        width: numbers[i],
        index: i,
        height: this.byRoom[room.roomId]?.[container]?.height || MIN_WIDGET_HEIGHT_PCT
      };
    });
    this.updateUserLayout(room, localLayout);
  }

  getContainerHeight(room, container) {
    return this.byRoom[room.roomId]?.[container]?.height; // let the default get returned if needed
  }

  setContainerHeight(room, container, height) {
    const widgets = this.getContainerWidgets(room, container);
    const widths = this.byRoom[room.roomId]?.[container]?.distributions;
    const localLayout = {};
    widgets.forEach((w, i) => {
      localLayout[w.id] = {
        container: container,
        width: widths[i],
        index: i,
        height: height
      };
    });
    this.updateUserLayout(room, localLayout);
  }

  moveWithinContainer(room, container, widget, delta) {
    const widgets = (0, _arrays.arrayFastClone)(this.getContainerWidgets(room, container));
    const currentIdx = widgets.findIndex(w => w.id === widget.id);
    if (currentIdx < 0) return; // no change needed

    widgets.splice(currentIdx, 1); // remove existing widget

    const newIdx = (0, _numbers.clamp)(currentIdx + delta, 0, widgets.length);
    widgets.splice(newIdx, 0, widget);
    const widths = this.byRoom[room.roomId]?.[container]?.distributions;
    const height = this.byRoom[room.roomId]?.[container]?.height;
    const localLayout = {};
    widgets.forEach((w, i) => {
      localLayout[w.id] = {
        container: container,
        width: widths[i],
        index: i,
        height: height
      };
    });
    this.updateUserLayout(room, localLayout);
  }

  moveToContainer(room, widget, toContainer) {
    const allWidgets = this.getAllWidgets(room);
    if (!allWidgets.some(_ref => {
      let [w] = _ref;
      return w.id === widget.id;
    })) return; // invalid
    // Prepare other containers (potentially move widgets to obey the following rules)

    const newLayout = {};

    switch (toContainer) {
      case Container.Right:
        // new "right" widget
        break;

      case Container.Center:
        // new "center" widget => all other widgets go into "right"
        for (const w of this.getContainerWidgets(room, Container.Top)) {
          newLayout[w.id] = {
            container: Container.Right
          };
        }

        for (const w of this.getContainerWidgets(room, Container.Center)) {
          newLayout[w.id] = {
            container: Container.Right
          };
        }

        break;

      case Container.Top:
        // new "top" widget => the center widget moves into "right"
        if (this.hasMaximisedWidget(room)) {
          const centerWidget = this.getContainerWidgets(room, Container.Center)[0];
          newLayout[centerWidget.id] = {
            container: Container.Right
          };
        }

        break;
    }

    newLayout[widget.id] = {
      container: toContainer
    }; // move widgets into requested containers.

    this.updateUserLayout(room, newLayout);
  }

  hasMaximisedWidget(room) {
    return this.getContainerWidgets(room, Container.Center).length > 0;
  }

  hasPinnedWidgets(room) {
    return this.getContainerWidgets(room, Container.Top).length > 0;
  }

  canCopyLayoutToRoom(room) {
    if (!this.matrixClient) return false; // not ready yet

    return room.currentState.maySendStateEvent(WIDGET_LAYOUT_EVENT_TYPE, this.matrixClient.getUserId());
  }

  copyLayoutToRoom(room) {
    const allWidgets = this.getAllWidgets(room);
    const evContent = {
      widgets: {}
    };

    for (const [widget, container] of allWidgets) {
      evContent.widgets[widget.id] = {
        container
      };

      if (container === Container.Top) {
        const containerWidgets = this.getContainerWidgets(room, container);
        const idx = containerWidgets.findIndex(w => w.id === widget.id);
        const widths = this.byRoom[room.roomId]?.[container]?.distributions;
        const height = this.byRoom[room.roomId]?.[container]?.height;
        evContent.widgets[widget.id] = _objectSpread(_objectSpread({}, evContent.widgets[widget.id]), {}, {
          height: height ? Math.round(height) : null,
          width: widths[idx] ? Math.round(widths[idx]) : null,
          index: idx
        });
      }
    }

    this.matrixClient.sendStateEvent(room.roomId, WIDGET_LAYOUT_EVENT_TYPE, evContent, "");
  }

  getAllWidgets(room) {
    const containers = this.byRoom[room.roomId];
    if (!containers) return [];
    const ret = [];

    for (const container of Object.keys(containers)) {
      const widgets = containers[container].ordered;

      for (const widget of widgets) {
        ret.push([widget, container]);
      }
    }

    return ret;
  }

  updateUserLayout(room, newLayout) {
    // Polyfill any missing widgets
    const allWidgets = this.getAllWidgets(room);

    for (const [widget, container] of allWidgets) {
      const containerWidgets = this.getContainerWidgets(room, container);
      const idx = containerWidgets.findIndex(w => w.id === widget.id);
      const widths = this.byRoom[room.roomId]?.[container]?.distributions;

      if (!newLayout[widget.id]) {
        newLayout[widget.id] = {
          container: container,
          index: idx,
          height: this.byRoom[room.roomId]?.[container]?.height,
          width: widths?.[idx]
        };
      }
    }

    const layoutEv = room.currentState.getStateEvents(WIDGET_LAYOUT_EVENT_TYPE, "");

    _SettingsStore.default.setValue("Widgets.layout", room.roomId, _SettingLevel.SettingLevel.ROOM_ACCOUNT, {
      overrides: layoutEv?.getId(),
      widgets: newLayout
    }).catch(() => this.recalculateRoom(room));

    this.recalculateRoom(room); // call to try local echo on changes (the catch above undoes any errors)
  }

}

exports.WidgetLayoutStore = WidgetLayoutStore;
(0, _defineProperty2.default)(WidgetLayoutStore, "internalInstance", void 0);
window.mxWidgetLayoutStore = WidgetLayoutStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEUiLCJDb250YWluZXIiLCJNQVhfUElOTkVEIiwiTUlOX1dJREdFVF9XSURUSF9QQ1QiLCJNSU5fV0lER0VUX0hFSUdIVF9QQ1QiLCJXaWRnZXRMYXlvdXRTdG9yZSIsIlJlYWR5V2F0Y2hpbmdTdG9yZSIsImNvbnN0cnVjdG9yIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJieVJvb20iLCJyb29tIiwibWF0cml4Q2xpZW50IiwiZ2V0VmlzaWJsZVJvb21zIiwicmVjYWxjdWxhdGVSb29tIiwicm9vbUlkIiwiZ2V0Um9vbSIsInVwZGF0ZUFsbFJvb21zIiwiZXYiLCJnZXRUeXBlIiwiZ2V0Um9vbUlkIiwic2V0dGluZ05hbWUiLCJpbnN0YW5jZSIsImludGVybmFsSW5zdGFuY2UiLCJzdGFydCIsImVtaXNzaW9uRm9yUm9vbSIsImVtaXRGb3IiLCJlbWl0Iiwib25SZWFkeSIsIm9uIiwiUm9vbVN0YXRlRXZlbnQiLCJFdmVudHMiLCJ1cGRhdGVSb29tRnJvbVN0YXRlIiwicGlubmVkUmVmIiwiU2V0dGluZ3NTdG9yZSIsIndhdGNoU2V0dGluZyIsInVwZGF0ZUZyb21TZXR0aW5ncyIsImxheW91dFJlZiIsIldpZGdldFN0b3JlIiwiVVBEQVRFX0VWRU5UIiwidXBkYXRlRnJvbVdpZGdldFN0b3JlIiwib25Ob3RSZWFkeSIsIm9mZiIsInVud2F0Y2hTZXR0aW5nIiwid2lkZ2V0cyIsImdldEFwcHMiLCJsZW5ndGgiLCJiZWZvcmVDaGFuZ2VzIiwiSlNPTiIsInN0cmluZ2lmeSIsImxheW91dEV2IiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJsZWdhY3lQaW5uZWQiLCJnZXRWYWx1ZSIsInVzZXJMYXlvdXQiLCJvdmVycmlkZXMiLCJnZXRJZCIsInJvb21MYXlvdXQiLCJnZXRDb250ZW50IiwidG9wV2lkZ2V0cyIsInJpZ2h0V2lkZ2V0cyIsImNlbnRlcldpZGdldHMiLCJ3aWRnZXQiLCJzdGF0ZUNvbnRhaW5lciIsImlkIiwiY29udGFpbmVyIiwibWFudWFsQ29udGFpbmVyIiwiaXNMZWdhY3lQaW5uZWQiLCJkZWZhdWx0Q29udGFpbmVyIiwiV2lkZ2V0VHlwZSIsIkpJVFNJIiwibWF0Y2hlcyIsInR5cGUiLCJUb3AiLCJSaWdodCIsIkNlbnRlciIsImNvbnNvbGUiLCJlcnJvciIsInB1c2giLCJ0YXJnZXRDb250YWluZXIiLCJydW5vZmYiLCJzbGljZSIsInNvcnQiLCJhIiwiYiIsImxheW91dEEiLCJsYXlvdXRCIiwidXNlckxheW91dEEiLCJ1c2VyTGF5b3V0QiIsImRlZmF1bHRBIiwiTnVtYmVyIiwiTUlOX1NBRkVfSU5URUdFUiIsIk1BWF9TQUZFX0lOVEVHRVIiLCJkZWZhdWx0QiIsIm9yZGVyQSIsImRlZmF1bHROdW1iZXIiLCJpbmRleCIsIm9yZGVyQiIsImNvbXBhcmUiLCJ3aWR0aHMiLCJtYXhIZWlnaHQiLCJkb0F1dG9iYWxhbmNlIiwiaSIsIndpZGdldExheW91dCIsInVzZXJXaWRnZXRMYXlvdXQiLCJpc0Zpbml0ZSIsIndpZHRoIiwidmFsIiwibm9ybWFsaXplZCIsImNsYW1wIiwiaGVpZ2h0IiwiZGVmUm9vbUhlaWdodCIsImgiLCJNYXRoIiwibWF4IiwiZGlmZmVyZW5jZSIsInN1bSIsImFicyIsInRvUmVjbGFpbSIsImxhcmdlSW5kaWNlcyIsIm1hcCIsInYiLCJmaWx0ZXIiLCJwIiwiaWR4Iiwib3JkZXJlZCIsImRpc3RyaWJ1dGlvbnMiLCJhZnRlckNoYW5nZXMiLCJnZXRDb250YWluZXJXaWRnZXRzIiwiaXNJbkNvbnRhaW5lciIsInNvbWUiLCJ3IiwiY2FuQWRkVG9Db250YWluZXIiLCJnZXRSZXNpemVyRGlzdHJpYnV0aW9ucyIsImQiLCJ0b0ZpeGVkIiwic2V0UmVzaXplckRpc3RyaWJ1dGlvbnMiLCJudW1iZXJzIiwic3Vic3RyaW5nIiwicmVtYWluaW5nIiwic3BsaWNlIiwibG9jYWxMYXlvdXQiLCJmb3JFYWNoIiwidXBkYXRlVXNlckxheW91dCIsImdldENvbnRhaW5lckhlaWdodCIsInNldENvbnRhaW5lckhlaWdodCIsIm1vdmVXaXRoaW5Db250YWluZXIiLCJkZWx0YSIsImFycmF5RmFzdENsb25lIiwiY3VycmVudElkeCIsImZpbmRJbmRleCIsIm5ld0lkeCIsIm1vdmVUb0NvbnRhaW5lciIsInRvQ29udGFpbmVyIiwiYWxsV2lkZ2V0cyIsImdldEFsbFdpZGdldHMiLCJuZXdMYXlvdXQiLCJoYXNNYXhpbWlzZWRXaWRnZXQiLCJjZW50ZXJXaWRnZXQiLCJoYXNQaW5uZWRXaWRnZXRzIiwiY2FuQ29weUxheW91dFRvUm9vbSIsIm1heVNlbmRTdGF0ZUV2ZW50IiwiZ2V0VXNlcklkIiwiY29weUxheW91dFRvUm9vbSIsImV2Q29udGVudCIsImNvbnRhaW5lcldpZGdldHMiLCJyb3VuZCIsInNlbmRTdGF0ZUV2ZW50IiwiY29udGFpbmVycyIsInJldCIsIk9iamVjdCIsImtleXMiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIlJPT01fQUNDT1VOVCIsImNhdGNoIiwid2luZG93IiwibXhXaWRnZXRMYXlvdXRTdG9yZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRMYXlvdXRTdG9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMjEgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IFJvb21TdGF0ZUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLXN0YXRlXCI7XG5pbXBvcnQgeyBPcHRpb25hbCB9IGZyb20gXCJtYXRyaXgtZXZlbnRzLXNka1wiO1xuXG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFdpZGdldFN0b3JlLCB7IElBcHAgfSBmcm9tIFwiLi4vV2lkZ2V0U3RvcmVcIjtcbmltcG9ydCB7IFdpZGdldFR5cGUgfSBmcm9tIFwiLi4vLi4vd2lkZ2V0cy9XaWRnZXRUeXBlXCI7XG5pbXBvcnQgeyBjbGFtcCwgZGVmYXVsdE51bWJlciwgc3VtIH0gZnJvbSBcIi4uLy4uL3V0aWxzL251bWJlcnNcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBSZWFkeVdhdGNoaW5nU3RvcmUgfSBmcm9tIFwiLi4vUmVhZHlXYXRjaGluZ1N0b3JlXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgeyBhcnJheUZhc3RDbG9uZSB9IGZyb20gXCIuLi8uLi91dGlscy9hcnJheXNcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3N0cmluZ3NcIjtcblxuZXhwb3J0IGNvbnN0IFdJREdFVF9MQVlPVVRfRVZFTlRfVFlQRSA9IFwiaW8uZWxlbWVudC53aWRnZXRzLmxheW91dFwiO1xuXG5leHBvcnQgZW51bSBDb250YWluZXIge1xuICAgIC8vIFwiVG9wXCIgaXMgdGhlIGFwcCBkcmF3ZXIsIGFuZCBjdXJyZW50bHkgdGhlIG9ubHkgc2Vuc2libGUgdmFsdWUuXG4gICAgVG9wID0gXCJ0b3BcIixcblxuICAgIC8vIFwiUmlnaHRcIiBpcyB0aGUgcmlnaHQgcGFuZWwsIGFuZCB0aGUgZGVmYXVsdCBmb3Igd2lkZ2V0cy4gU2V0dGluZ1xuICAgIC8vIHRoaXMgYXMgYSBjb250YWluZXIgb24gYSB3aWRnZXQgaXMgZXNzZW50aWFsbHkgbGlrZSBzYXlpbmcgXCJub1xuICAgIC8vIGNoYW5nZXMgbmVlZGVkXCIsIHRob3VnaCB0aGlzIG1heSBjaGFuZ2UgaW4gdGhlIGZ1dHVyZS5cbiAgICBSaWdodCA9IFwicmlnaHRcIixcblxuICAgIENlbnRlciA9IFwiY2VudGVyXCJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3RvcmVkTGF5b3V0IHtcbiAgICAvLyBXaGVyZSB0byBzdG9yZSB0aGUgd2lkZ2V0LiBSZXF1aXJlZC5cbiAgICBjb250YWluZXI6IENvbnRhaW5lcjtcblxuICAgIC8vIFRoZSBpbmRleCAob3JkZXIpIHRvIHBvc2l0aW9uIHRoZSB3aWRnZXRzIGluLiBPbmx5IGFwcGxpZXMgZm9yXG4gICAgLy8gb3JkZXJlZCBjb250YWluZXJzIChsaWtlIHRoZSB0b3AgY29udGFpbmVyKS4gU21hbGxlciBudW1iZXJzIGZpcnN0LFxuICAgIC8vIGFuZCBjb25mbGljdHMgcmVzb2x2ZWQgYnkgY29tcGFyaW5nIHdpZGdldCBJRHMuXG4gICAgaW5kZXg/OiBudW1iZXI7XG5cbiAgICAvLyBQZXJjZW50YWdlIChpbnRlZ2VyKSBmb3IgcmVsYXRpdmUgd2lkdGggb2YgdGhlIGNvbnRhaW5lciB0byBjb25zdW1lLlxuICAgIC8vIENsYW1wZWQgdG8gMC0xMDAgYW5kIG1heSBoYXZlIG1pbmltdW1zIGltcG9zZWQgdXBvbiBpdC4gT25seSBhcHBsaWVzXG4gICAgLy8gdG8gY29udGFpbmVycyB3aGljaCBzdXBwb3J0IGlubmVyIHJlc2l6aW5nIChjdXJyZW50bHkgb25seSB0aGUgdG9wXG4gICAgLy8gY29udGFpbmVyKS5cbiAgICB3aWR0aD86IG51bWJlcjtcblxuICAgIC8vIFBlcmNlbnRhZ2UgKGludGVnZXIpIGZvciByZWxhdGl2ZSBoZWlnaHQgb2YgdGhlIGNvbnRhaW5lci4gTm90ZSB0aGF0XG4gICAgLy8gdGhpcyBvbmx5IGFwcGxpZXMgdG8gdGhlIHRvcCBjb250YWluZXIgY3VycmVudGx5LCBhbmQgdGhhdCBjb250YWluZXJcbiAgICAvLyB3aWxsIHRha2UgdGhlIGhpZ2hlc3QgdmFsdWUgYW1vbmcgd2lkZ2V0cyBpbiB0aGUgY29udGFpbmVyLiBDbGFtcGVkXG4gICAgLy8gdG8gMC0xMDAgYW5kIG1heSBoYXZlIG1pbmltdW1zIGltcG9zZWQgb24gaXQuXG4gICAgaGVpZ2h0PzogbnVtYmVyO1xuXG4gICAgLy8gVE9ETzogW0RlZmVycmVkXSBNYXhpbWl6aW5nIChmdWxsc2NyZWVuKSB3aWRnZXRzIGJ5IGRlZmF1bHQuXG59XG5cbmludGVyZmFjZSBJV2lkZ2V0TGF5b3V0cyB7XG4gICAgW3dpZGdldElkOiBzdHJpbmddOiBJU3RvcmVkTGF5b3V0O1xufVxuXG5pbnRlcmZhY2UgSUxheW91dFN0YXRlRXZlbnQge1xuICAgIC8vIFRPRE86IFtEZWZlcnJlZF0gRm9yY2VkIGxheW91dCAoZml4ZWQgd2l0aCBubyBjaGFuZ2VzKVxuXG4gICAgLy8gVGhlIHdpZGdldCBsYXlvdXRzLlxuICAgIHdpZGdldHM6IElXaWRnZXRMYXlvdXRzO1xufVxuXG5pbnRlcmZhY2UgSUxheW91dFNldHRpbmdzIGV4dGVuZHMgSUxheW91dFN0YXRlRXZlbnQge1xuICAgIG92ZXJyaWRlcz86IHN0cmluZzsgLy8gZXZlbnQgSUQgZm9yIGxheW91dCBzdGF0ZSBldmVudCwgaWYgcHJlc2VudFxufVxuXG4vLyBEZXYgbm90ZTogXCJQaW5uZWRcIiB3aWRnZXRzIGFyZSBvbmVzIGluIHRoZSB0b3AgY29udGFpbmVyLlxuZXhwb3J0IGNvbnN0IE1BWF9QSU5ORUQgPSAzO1xuXG4vLyBUaGVzZSB0d28gYXJlIHdob2xlIHBlcmNlbnRhZ2VzIGFuZCBkb24ndCByZWFsbHkgbWVhbiBhbnl0aGluZy4gTGF0ZXIgdmFsdWVzIHdpbGwgZGVjaWRlXG4vLyBtaW5pbXVtLCBidXQgdGhlc2UgaGVscCBkZXRlcm1pbmUgcHJvcG9ydGlvbnMgZHVyaW5nIG91ciBjYWxjdWxhdGlvbnMgaGVyZS4gSW4gZmFjdCwgdGhlc2Vcbi8vIHZhbHVlcyBzaG91bGQgYmUgKnNtYWxsZXIqIHRoYW4gdGhlIGFjdHVhbCBtaW5pbXVtcyBpbXBvc2VkIGJ5IGxhdGVyIGNvbXBvbmVudHMuXG5jb25zdCBNSU5fV0lER0VUX1dJRFRIX1BDVCA9IDEwOyAvLyAxMCVcbmNvbnN0IE1JTl9XSURHRVRfSEVJR0hUX1BDVCA9IDI7IC8vIDIlXG5cbmV4cG9ydCBjbGFzcyBXaWRnZXRMYXlvdXRTdG9yZSBleHRlbmRzIFJlYWR5V2F0Y2hpbmdTdG9yZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50ZXJuYWxJbnN0YW5jZTogV2lkZ2V0TGF5b3V0U3RvcmU7XG5cbiAgICBwcml2YXRlIGJ5Um9vbToge1xuICAgICAgICBbcm9vbUlkOiBzdHJpbmddOiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gVFMgd2FudHMgYSBzdHJpbmcga2V5LCBidXQgd2Uga25vdyBiZXR0ZXJcbiAgICAgICAgICAgIFtjb250YWluZXI6IENvbnRhaW5lcl06IHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkOiBJQXBwW107XG4gICAgICAgICAgICAgICAgaGVpZ2h0PzogbnVtYmVyO1xuICAgICAgICAgICAgICAgIGRpc3RyaWJ1dGlvbnM/OiBudW1iZXJbXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfSA9IHt9O1xuXG4gICAgcHJpdmF0ZSBwaW5uZWRSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIGxheW91dFJlZjogc3RyaW5nO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoZGVmYXVsdERpc3BhdGNoZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGluc3RhbmNlKCk6IFdpZGdldExheW91dFN0b3JlIHtcbiAgICAgICAgaWYgKCF0aGlzLmludGVybmFsSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxJbnN0YW5jZSA9IG5ldyBXaWRnZXRMYXlvdXRTdG9yZSgpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbEluc3RhbmNlLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGVtaXNzaW9uRm9yUm9vbShyb29tOiBSb29tKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGB1cGRhdGVfJHtyb29tLnJvb21JZH1gO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW1pdEZvcihyb29tOiBSb29tKSB7XG4gICAgICAgIHRoaXMuZW1pdChXaWRnZXRMYXlvdXRTdG9yZS5lbWlzc2lvbkZvclJvb20ocm9vbSkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvblJlYWR5KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRoaXMudXBkYXRlQWxsUm9vbXMoKTtcblxuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5vbihSb29tU3RhdGVFdmVudC5FdmVudHMsIHRoaXMudXBkYXRlUm9vbUZyb21TdGF0ZSk7XG4gICAgICAgIHRoaXMucGlubmVkUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJXaWRnZXRzLnBpbm5lZFwiLCBudWxsLCB0aGlzLnVwZGF0ZUZyb21TZXR0aW5ncyk7XG4gICAgICAgIHRoaXMubGF5b3V0UmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJXaWRnZXRzLmxheW91dFwiLCBudWxsLCB0aGlzLnVwZGF0ZUZyb21TZXR0aW5ncyk7XG4gICAgICAgIFdpZGdldFN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy51cGRhdGVGcm9tV2lkZ2V0U3RvcmUpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbk5vdFJlYWR5KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRoaXMuYnlSb29tID0ge307XG5cbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQ/Lm9mZihSb29tU3RhdGVFdmVudC5FdmVudHMsIHRoaXMudXBkYXRlUm9vbUZyb21TdGF0ZSk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5waW5uZWRSZWYpO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMubGF5b3V0UmVmKTtcbiAgICAgICAgV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy51cGRhdGVGcm9tV2lkZ2V0U3RvcmUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlQWxsUm9vbXMgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuYnlSb29tID0ge307XG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiB0aGlzLm1hdHJpeENsaWVudC5nZXRWaXNpYmxlUm9vbXMoKSkge1xuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVJvb20ocm9vbSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVGcm9tV2lkZ2V0U3RvcmUgPSAocm9vbUlkPzogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChyb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAocm9vbSkgdGhpcy5yZWNhbGN1bGF0ZVJvb20ocm9vbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUFsbFJvb21zKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVSb29tRnJvbVN0YXRlID0gKGV2OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpICE9PSBXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEUpIHJldHVybjtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20oZXYuZ2V0Um9vbUlkKCkpO1xuICAgICAgICBpZiAocm9vbSkgdGhpcy5yZWNhbGN1bGF0ZVJvb20ocm9vbSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlRnJvbVNldHRpbmdzID0gKHNldHRpbmdOYW1lOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nIC8qIGFuZCBvdGhlciBzdHVmZiAqLykgPT4ge1xuICAgICAgICBpZiAocm9vbUlkKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKHJvb20pIHRoaXMucmVjYWxjdWxhdGVSb29tKHJvb20pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVBbGxSb29tcygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyByZWNhbGN1bGF0ZVJvb20ocm9vbTogUm9vbSkge1xuICAgICAgICBjb25zdCB3aWRnZXRzID0gV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZ2V0QXBwcyhyb29tLnJvb21JZCk7XG4gICAgICAgIGlmICghd2lkZ2V0cz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0gPSB7fTtcbiAgICAgICAgICAgIHRoaXMuZW1pdEZvcihyb29tKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJlZm9yZUNoYW5nZXMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0pO1xuXG4gICAgICAgIGNvbnN0IGxheW91dEV2ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFLCBcIlwiKTtcbiAgICAgICAgY29uc3QgbGVnYWN5UGlubmVkID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIldpZGdldHMucGlubmVkXCIsIHJvb20ucm9vbUlkKTtcbiAgICAgICAgbGV0IHVzZXJMYXlvdXQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlPElMYXlvdXRTZXR0aW5ncz4oXCJXaWRnZXRzLmxheW91dFwiLCByb29tLnJvb21JZCk7XG5cbiAgICAgICAgaWYgKGxheW91dEV2ICYmIHVzZXJMYXlvdXQgJiYgdXNlckxheW91dC5vdmVycmlkZXMgIT09IGxheW91dEV2LmdldElkKCkpIHtcbiAgICAgICAgICAgIC8vIEZvciBzb21lIG90aGVyIGxheW91dCB0aGF0IHdlIGRvbid0IHJlYWxseSBjYXJlIGFib3V0LiBUaGUgdXNlciBjYW4gcmVzZXQgdGhpc1xuICAgICAgICAgICAgLy8gYnkgdXBkYXRpbmcgdGhlaXIgcGVyc29uYWwgbGF5b3V0LlxuICAgICAgICAgICAgdXNlckxheW91dCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb29tTGF5b3V0OiBJTGF5b3V0U3RhdGVFdmVudCA9IGxheW91dEV2ID8gbGF5b3V0RXYuZ2V0Q29udGVudCgpIDogbnVsbDtcbiAgICAgICAgLy8gV2UgZmlsdGVyIGZvciB0aGUgY2VudGVyIGNvbnRhaW5lciBmaXJzdC5cbiAgICAgICAgLy8gKEFuIGVycm9yIGlzIHJhaXNlZCwgaWYgdGhlcmUgYXJlIG11bHRpcGxlIHdpZGdldHMgbWFya2VkIGZvciB0aGUgY2VudGVyIGNvbnRhaW5lcilcbiAgICAgICAgLy8gRm9yIHRoZSByaWdodCBhbmQgdG9wIGNvbnRhaW5lciBtdWx0aXBsZSB3aWRnZXRzIGFyZSBhbGxvd2VkLlxuICAgICAgICBjb25zdCB0b3BXaWRnZXRzOiBJQXBwW10gPSBbXTtcbiAgICAgICAgY29uc3QgcmlnaHRXaWRnZXRzOiBJQXBwW10gPSBbXTtcbiAgICAgICAgY29uc3QgY2VudGVyV2lkZ2V0czogSUFwcFtdID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgd2lkZ2V0IG9mIHdpZGdldHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlQ29udGFpbmVyID0gcm9vbUxheW91dD8ud2lkZ2V0cz8uW3dpZGdldC5pZF0/LmNvbnRhaW5lcjtcbiAgICAgICAgICAgIGNvbnN0IG1hbnVhbENvbnRhaW5lciA9IHVzZXJMYXlvdXQ/LndpZGdldHM/Llt3aWRnZXQuaWRdPy5jb250YWluZXI7XG4gICAgICAgICAgICBjb25zdCBpc0xlZ2FjeVBpbm5lZCA9ICEhbGVnYWN5UGlubmVkPy5bd2lkZ2V0LmlkXTtcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRDb250YWluZXIgPSBXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXMod2lkZ2V0LnR5cGUpID8gQ29udGFpbmVyLlRvcCA6IENvbnRhaW5lci5SaWdodDtcbiAgICAgICAgICAgIGlmICgobWFudWFsQ29udGFpbmVyKSA/IG1hbnVhbENvbnRhaW5lciA9PT0gQ29udGFpbmVyLkNlbnRlciA6IHN0YXRlQ29udGFpbmVyID09PSBDb250YWluZXIuQ2VudGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNlbnRlcldpZGdldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUcmllZCB0byBwdXNoIGEgc2Vjb25kIHdpZGdldCBpbnRvIHRoZSBjZW50ZXIgY29udGFpbmVyXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcldpZGdldHMucHVzaCh3aWRnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBUaGUgd2lkZ2V0IHdvbid0IG5lZWQgdG8gYmUgcHV0IGluIGFueSBvdGhlciBjb250YWluZXIuXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdGFyZ2V0Q29udGFpbmVyID0gZGVmYXVsdENvbnRhaW5lcjtcbiAgICAgICAgICAgIGlmICghIW1hbnVhbENvbnRhaW5lciB8fCAhIXN0YXRlQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Q29udGFpbmVyID0gKG1hbnVhbENvbnRhaW5lcikgPyBtYW51YWxDb250YWluZXIgOiBzdGF0ZUNvbnRhaW5lcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNMZWdhY3lQaW5uZWQgJiYgIXN0YXRlQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBsZWdhY3kgY2FzZVxuICAgICAgICAgICAgICAgIHRhcmdldENvbnRhaW5lciA9IENvbnRhaW5lci5Ub3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAodGFyZ2V0Q29udGFpbmVyID09PSBDb250YWluZXIuVG9wID8gdG9wV2lkZ2V0cyA6IHJpZ2h0V2lkZ2V0cykucHVzaCh3aWRnZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJpbSB0byBNQVhfUElOTkVEXG4gICAgICAgIGNvbnN0IHJ1bm9mZiA9IHRvcFdpZGdldHMuc2xpY2UoTUFYX1BJTk5FRCk7XG4gICAgICAgIHJpZ2h0V2lkZ2V0cy5wdXNoKC4uLnJ1bm9mZik7XG5cbiAgICAgICAgLy8gT3JkZXIgdGhlIHdpZGdldHMgaW4gdGhlIHRvcCBjb250YWluZXIsIHB1dHRpbmcgYXV0b3Bpbm5lZCBKaXRzaSB3aWRnZXRzIGZpcnN0XG4gICAgICAgIC8vIHVubGVzcyB0aGV5IGhhdmUgYSBzcGVjaWZpYyBvcmRlciBpbiBtaW5kXG4gICAgICAgIHRvcFdpZGdldHMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGF5b3V0QSA9IHJvb21MYXlvdXQ/LndpZGdldHM/LlthLmlkXTtcbiAgICAgICAgICAgIGNvbnN0IGxheW91dEIgPSByb29tTGF5b3V0Py53aWRnZXRzPy5bYi5pZF07XG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXJMYXlvdXRBID0gdXNlckxheW91dD8ud2lkZ2V0cz8uW2EuaWRdO1xuICAgICAgICAgICAgY29uc3QgdXNlckxheW91dEIgPSB1c2VyTGF5b3V0Py53aWRnZXRzPy5bYi5pZF07XG5cbiAgICAgICAgICAgIC8vIEppdHNpIHdpZGdldHMgYXJlIGRlZmF1bHRlZCB0byBiZSB0aGUgbGVmdG1vc3Qgd2lkZ2V0IHdoZXJlYXMgb3RoZXIgd2lkZ2V0c1xuICAgICAgICAgICAgLy8gZGVmYXVsdCB0byB0aGUgcmlnaHQgc2lkZS5cbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRBID0gV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKGEudHlwZSkgPyBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiA6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdEIgPSBXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXMoYi50eXBlKSA/IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSIDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG5cbiAgICAgICAgICAgIGNvbnN0IG9yZGVyQSA9IGRlZmF1bHROdW1iZXIodXNlckxheW91dEE/LmluZGV4LCBkZWZhdWx0TnVtYmVyKGxheW91dEE/LmluZGV4LCBkZWZhdWx0QSkpO1xuICAgICAgICAgICAgY29uc3Qgb3JkZXJCID0gZGVmYXVsdE51bWJlcih1c2VyTGF5b3V0Qj8uaW5kZXgsIGRlZmF1bHROdW1iZXIobGF5b3V0Qj8uaW5kZXgsIGRlZmF1bHRCKSk7XG5cbiAgICAgICAgICAgIGlmIChvcmRlckEgPT09IG9yZGVyQikge1xuICAgICAgICAgICAgICAgIC8vIFdlIGp1c3QgbmVlZCBhIHRpZWJyZWFrXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmUoYS5pZCwgYi5pZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcmRlckEgLSBvcmRlckI7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERldGVybWluZSB3aWR0aCBkaXN0cmlidXRpb24gYW5kIGhlaWdodCBvZiB0aGUgdG9wIGNvbnRhaW5lciBub3cgKHRoZSBvbmx5IHJlbGV2YW50IG9uZSlcbiAgICAgICAgY29uc3Qgd2lkdGhzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICBsZXQgbWF4SGVpZ2h0ID0gbnVsbDsgLy8gbnVsbCA9PSBkZWZhdWx0XG4gICAgICAgIGxldCBkb0F1dG9iYWxhbmNlID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3BXaWRnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB3aWRnZXQgPSB0b3BXaWRnZXRzW2ldO1xuICAgICAgICAgICAgY29uc3Qgd2lkZ2V0TGF5b3V0ID0gcm9vbUxheW91dD8ud2lkZ2V0cz8uW3dpZGdldC5pZF07XG4gICAgICAgICAgICBjb25zdCB1c2VyV2lkZ2V0TGF5b3V0ID0gdXNlckxheW91dD8ud2lkZ2V0cz8uW3dpZGdldC5pZF07XG5cbiAgICAgICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodXNlcldpZGdldExheW91dD8ud2lkdGgpIHx8IE51bWJlci5pc0Zpbml0ZSh3aWRnZXRMYXlvdXQ/LndpZHRoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbCA9IHVzZXJXaWRnZXRMYXlvdXQ/LndpZHRoIHx8IHdpZGdldExheW91dD8ud2lkdGg7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IGNsYW1wKHZhbCwgTUlOX1dJREdFVF9XSURUSF9QQ1QsIDEwMCk7XG4gICAgICAgICAgICAgICAgd2lkdGhzLnB1c2gobm9ybWFsaXplZCk7XG4gICAgICAgICAgICAgICAgZG9BdXRvYmFsYW5jZSA9IGZhbHNlOyAvLyBhIG1hbnVhbCB3aWR0aCB3YXMgc3BlY2lmaWVkXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpZHRocy5wdXNoKDEwMCk7IC8vIHdlJ2xsIGZpZ3VyZSB0aGlzIG91dCBsYXRlclxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAod2lkZ2V0TGF5b3V0Py5oZWlnaHQgfHwgdXNlcldpZGdldExheW91dD8uaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmUm9vbUhlaWdodCA9IGRlZmF1bHROdW1iZXIod2lkZ2V0TGF5b3V0Py5oZWlnaHQsIE1JTl9XSURHRVRfSEVJR0hUX1BDVCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaCA9IGRlZmF1bHROdW1iZXIodXNlcldpZGdldExheW91dD8uaGVpZ2h0LCBkZWZSb29tSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQgPSBNYXRoLm1heChtYXhIZWlnaHQsIGNsYW1wKGgsIE1JTl9XSURHRVRfSEVJR0hUX1BDVCwgMTAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRvQXV0b2JhbGFuY2UpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2lkdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgd2lkdGhzW2ldID0gMTAwIC8gd2lkdGhzLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHdlJ3JlIG5vdCBhdXRvYmFsYW5jaW5nIHRoZW4gaXQgbWVhbnMgdGhhdCB3ZSdyZSB0cnlpbmcgdG8gbWFrZVxuICAgICAgICAgICAgLy8gc3VyZSB0aGF0IHdpZGdldHMgbWFrZSB1cCBleGFjdGx5IDEwMCUgb2Ygc3BhY2UgKG5vdCBvdmVyLCBub3QgdW5kZXIpXG4gICAgICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gc3VtKC4uLndpZHRocykgLSAxMDA7IC8vIHBvc2l0aXZlID0gb3ZlciwgbmVnYXRpdmUgPSB1bmRlclxuICAgICAgICAgICAgaWYgKGRpZmZlcmVuY2UgPCAwKSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIGEgZGVmaWNpdCB3ZSBqdXN0IGZpbGwgZXZlcnl0aGluZyBpbiBlcXVhbGx5XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3aWR0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGhzW2ldICs9IE1hdGguYWJzKGRpZmZlcmVuY2UpIC8gd2lkdGhzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gV2hlbiB3ZSdyZSBvdmVyLCB3ZSB0cnkgdG8gc2NhbGUgYWxsIHRoZSB3aWRnZXRzIHdpdGhpbiByYW5nZSBmaXJzdC5cbiAgICAgICAgICAgICAgICAvLyBXZSBjbGFtcCB2YWx1ZXMgdG8gdHJ5IGFuZCBrZWVwIG91cnNlbHZlcyBzYW5lIGFuZCB3aXRoaW4gcmFuZ2UuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3aWR0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGhzW2ldID0gY2xhbXAod2lkdGhzW2ldIC0gKGRpZmZlcmVuY2UgLyB3aWR0aHMubGVuZ3RoKSwgTUlOX1dJREdFVF9XSURUSF9QQ1QsIDEwMCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgc3RpbGwgb3ZlciwgZmluZCB0aGUgd2lkZ2V0cyB3aGljaCBoYXZlIG1vcmUgd2lkdGggdGhhbiB0aGUgbWluaW11bVxuICAgICAgICAgICAgICAgIC8vIGFuZCBiYWxhbmNlIHRoZW0gb3V0IHVudGlsIHdlJ3JlIGF0IDEwMCUuIFRoaXMgc2hvdWxkIGtlZXAgdXMgYXMgY2xvc2UgYXMgcG9zc2libGVcbiAgICAgICAgICAgICAgICAvLyB0byB0aGUgaW50ZW5kZWQgZGlzdHJpYnV0aW9ucy5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIE5vdGU6IGlmIHdlIGV2ZXIgZGVjaWRlIHRvIHNldCBhIG1pbmltdW0gd2hpY2ggaXMgbGFyZ2VyIHRoYW4gMTAwJS9NQVhfV0lER0VUUyB0aGVuXG4gICAgICAgICAgICAgICAgLy8gd2UgcHJvYmFibHkgaGF2ZSBvdGhlciBpc3N1ZXMgLSB0aGlzIGNvZGUgYXNzdW1lcyB3ZSBkb24ndCBkbyB0aGF0LlxuICAgICAgICAgICAgICAgIGNvbnN0IHRvUmVjbGFpbSA9IHN1bSguLi53aWR0aHMpIC0gMTAwO1xuICAgICAgICAgICAgICAgIGlmICh0b1JlY2xhaW0gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhcmdlSW5kaWNlcyA9IHdpZHRoc1xuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgodiwgaSkgPT4gKFtpLCB2XSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKHAgPT4gcFsxXSA+IE1JTl9XSURHRVRfV0lEVEhfUENUKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChwID0+IHBbMF0pO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGlkeCBvZiBsYXJnZUluZGljZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoc1tpZHhdIC09IHRvUmVjbGFpbSAvIGxhcmdlSW5kaWNlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBmaWxsIGluIG91ciBjYWNoZSBhbmQgdXBkYXRlXG4gICAgICAgIHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXSA9IHt9O1xuICAgICAgICBpZiAodG9wV2lkZ2V0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXVtDb250YWluZXIuVG9wXSA9IHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkOiB0b3BXaWRnZXRzLFxuICAgICAgICAgICAgICAgIGRpc3RyaWJ1dGlvbnM6IHdpZHRocyxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IG1heEhlaWdodCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJpZ2h0V2lkZ2V0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXVtDb250YWluZXIuUmlnaHRdID0ge1xuICAgICAgICAgICAgICAgIG9yZGVyZWQ6IHJpZ2h0V2lkZ2V0cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNlbnRlcldpZGdldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF1bQ29udGFpbmVyLkNlbnRlcl0gPSB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZDogY2VudGVyV2lkZ2V0cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhZnRlckNoYW5nZXMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0pO1xuICAgICAgICBpZiAoYWZ0ZXJDaGFuZ2VzICE9PSBiZWZvcmVDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXRGb3Iocm9vbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tOiBPcHRpb25hbDxSb29tPiwgY29udGFpbmVyOiBDb250YWluZXIpOiBJQXBwW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5ieVJvb21bcm9vbT8ucm9vbUlkXT8uW2NvbnRhaW5lcl0/Lm9yZGVyZWQgfHwgW107XG4gICAgfVxuXG4gICAgcHVibGljIGlzSW5Db250YWluZXIocm9vbTogT3B0aW9uYWw8Um9vbT4sIHdpZGdldDogSUFwcCwgY29udGFpbmVyOiBDb250YWluZXIpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBjb250YWluZXIpLnNvbWUodyA9PiB3LmlkID09PSB3aWRnZXQuaWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5BZGRUb0NvbnRhaW5lcihyb29tOiBSb29tLCBjb250YWluZXI6IENvbnRhaW5lcik6IGJvb2xlYW4ge1xuICAgICAgICBzd2l0Y2ggKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY2FzZSBDb250YWluZXIuVG9wOiByZXR1cm4gdGhpcy5nZXRDb250YWluZXJXaWRnZXRzKHJvb20sIGNvbnRhaW5lcikubGVuZ3RoIDwgTUFYX1BJTk5FRDtcbiAgICAgICAgICAgIGNhc2UgQ29udGFpbmVyLlJpZ2h0OiByZXR1cm4gdGhpcy5nZXRDb250YWluZXJXaWRnZXRzKHJvb20sIGNvbnRhaW5lcikubGVuZ3RoIDwgTUFYX1BJTk5FRDtcbiAgICAgICAgICAgIGNhc2UgQ29udGFpbmVyLkNlbnRlcjogcmV0dXJuIHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBjb250YWluZXIpLmxlbmd0aCA8IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UmVzaXplckRpc3RyaWJ1dGlvbnMocm9vbTogUm9vbSwgY29udGFpbmVyOiBDb250YWluZXIpOiBzdHJpbmdbXSB7IC8vIHllcywgc3RyaW5nLlxuICAgICAgICBsZXQgZGlzdHJpYnV0aW9ucyA9IHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXT8uW2NvbnRhaW5lcl0/LmRpc3RyaWJ1dGlvbnM7XG4gICAgICAgIGlmICghZGlzdHJpYnV0aW9ucyB8fCBkaXN0cmlidXRpb25zLmxlbmd0aCA8IDIpIHJldHVybiBbXTtcblxuICAgICAgICAvLyBUaGUgZGlzdHJpYnV0b3IgYWN0dWFsbHkgZXhwZWN0cyB0byBiZSBmZWQgTi0xIHNpemVzIGFuZCBleHBhbmRzIHRoZSBtaWRkbGUgc2VjdGlvblxuICAgICAgICAvLyBpbnN0ZWFkIG9mIHRoZSBlZGdlcy4gVGhlcmVmb3JlLCB3ZSBuZWVkIHRvIHJldHVybiBbMF0gd2hlbiB0aGVyZSdzIHR3byB3aWRnZXRzIG9yXG4gICAgICAgIC8vIFswLCAyXSB3aGVuIHRoZXJlJ3MgdGhyZWUgKHNraXBwaW5nIFsxXSBiZWNhdXNlIGl0J3MgaXJyZWxldmFudCkuXG5cbiAgICAgICAgaWYgKGRpc3RyaWJ1dGlvbnMubGVuZ3RoID09PSAyKSBkaXN0cmlidXRpb25zID0gW2Rpc3RyaWJ1dGlvbnNbMF1dO1xuICAgICAgICBpZiAoZGlzdHJpYnV0aW9ucy5sZW5ndGggPT09IDMpIGRpc3RyaWJ1dGlvbnMgPSBbZGlzdHJpYnV0aW9uc1swXSwgZGlzdHJpYnV0aW9uc1syXV07XG4gICAgICAgIHJldHVybiBkaXN0cmlidXRpb25zLm1hcChkID0+IGAke2QudG9GaXhlZCgxKX0lYCk7IC8vIGFjdHVhbCBwZXJjZW50cyAtIHRoZXNlIGFyZSBkZWNvZGVkIGxhdGVyXG4gICAgfVxuXG4gICAgcHVibGljIHNldFJlc2l6ZXJEaXN0cmlidXRpb25zKHJvb206IFJvb20sIGNvbnRhaW5lcjogQ29udGFpbmVyLCBkaXN0cmlidXRpb25zOiBzdHJpbmdbXSkge1xuICAgICAgICBpZiAoY29udGFpbmVyICE9PSBDb250YWluZXIuVG9wKSByZXR1cm47IC8vIGlnbm9yZSAtIG5vdCByZWxldmFudFxuXG4gICAgICAgIGNvbnN0IG51bWJlcnMgPSBkaXN0cmlidXRpb25zLm1hcChkID0+IE51bWJlcihOdW1iZXIoZC5zdWJzdHJpbmcoMCwgZC5sZW5ndGggLSAxKSkudG9GaXhlZCgxKSkpO1xuICAgICAgICBjb25zdCB3aWRnZXRzID0gdGhpcy5nZXRDb250YWluZXJXaWRnZXRzKHJvb20sIGNvbnRhaW5lcik7XG5cbiAgICAgICAgLy8gRnJvbSBnZXRSZXNpemVyRGlzdHJpYnV0aW9ucywgd2UgbmVlZCB0byBmaWxsIGluIHRoZSBtaWRkbGUgc2l6ZSBpZiBhcHBsaWNhYmxlLlxuICAgICAgICBjb25zdCByZW1haW5pbmcgPSAxMDAgLSBzdW0oLi4ubnVtYmVycyk7XG4gICAgICAgIGlmIChudW1iZXJzLmxlbmd0aCA9PT0gMikgbnVtYmVycy5zcGxpY2UoMSwgMCwgcmVtYWluaW5nKTtcbiAgICAgICAgaWYgKG51bWJlcnMubGVuZ3RoID09PSAxKSBudW1iZXJzLnB1c2gocmVtYWluaW5nKTtcblxuICAgICAgICBjb25zdCBsb2NhbExheW91dCA9IHt9O1xuICAgICAgICB3aWRnZXRzLmZvckVhY2goKHcsIGkpID0+IHtcbiAgICAgICAgICAgIGxvY2FsTGF5b3V0W3cuaWRdID0ge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBudW1iZXJzW2ldLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uaGVpZ2h0IHx8IE1JTl9XSURHRVRfSEVJR0hUX1BDVCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZVVzZXJMYXlvdXQocm9vbSwgbG9jYWxMYXlvdXQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDb250YWluZXJIZWlnaHQocm9vbTogUm9vbSwgY29udGFpbmVyOiBDb250YWluZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uaGVpZ2h0OyAvLyBsZXQgdGhlIGRlZmF1bHQgZ2V0IHJldHVybmVkIGlmIG5lZWRlZFxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDb250YWluZXJIZWlnaHQocm9vbTogUm9vbSwgY29udGFpbmVyOiBDb250YWluZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSB0aGlzLmdldENvbnRhaW5lcldpZGdldHMocm9vbSwgY29udGFpbmVyKTtcbiAgICAgICAgY29uc3Qgd2lkdGhzID0gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uZGlzdHJpYnV0aW9ucztcbiAgICAgICAgY29uc3QgbG9jYWxMYXlvdXQgPSB7fTtcbiAgICAgICAgd2lkZ2V0cy5mb3JFYWNoKCh3LCBpKSA9PiB7XG4gICAgICAgICAgICBsb2NhbExheW91dFt3LmlkXSA9IHtcbiAgICAgICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGhzW2ldLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudXBkYXRlVXNlckxheW91dChyb29tLCBsb2NhbExheW91dCk7XG4gICAgfVxuXG4gICAgcHVibGljIG1vdmVXaXRoaW5Db250YWluZXIocm9vbTogUm9vbSwgY29udGFpbmVyOiBDb250YWluZXIsIHdpZGdldDogSUFwcCwgZGVsdGE6IG51bWJlcikge1xuICAgICAgICBjb25zdCB3aWRnZXRzID0gYXJyYXlGYXN0Q2xvbmUodGhpcy5nZXRDb250YWluZXJXaWRnZXRzKHJvb20sIGNvbnRhaW5lcikpO1xuICAgICAgICBjb25zdCBjdXJyZW50SWR4ID0gd2lkZ2V0cy5maW5kSW5kZXgodyA9PiB3LmlkID09PSB3aWRnZXQuaWQpO1xuICAgICAgICBpZiAoY3VycmVudElkeCA8IDApIHJldHVybjsgLy8gbm8gY2hhbmdlIG5lZWRlZFxuXG4gICAgICAgIHdpZGdldHMuc3BsaWNlKGN1cnJlbnRJZHgsIDEpOyAvLyByZW1vdmUgZXhpc3Rpbmcgd2lkZ2V0XG4gICAgICAgIGNvbnN0IG5ld0lkeCA9IGNsYW1wKGN1cnJlbnRJZHggKyBkZWx0YSwgMCwgd2lkZ2V0cy5sZW5ndGgpO1xuICAgICAgICB3aWRnZXRzLnNwbGljZShuZXdJZHgsIDAsIHdpZGdldCk7XG5cbiAgICAgICAgY29uc3Qgd2lkdGhzID0gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uZGlzdHJpYnV0aW9ucztcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uaGVpZ2h0O1xuICAgICAgICBjb25zdCBsb2NhbExheW91dCA9IHt9O1xuICAgICAgICB3aWRnZXRzLmZvckVhY2goKHcsIGkpID0+IHtcbiAgICAgICAgICAgIGxvY2FsTGF5b3V0W3cuaWRdID0ge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aHNbaV0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51cGRhdGVVc2VyTGF5b3V0KHJvb20sIGxvY2FsTGF5b3V0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbW92ZVRvQ29udGFpbmVyKHJvb206IFJvb20sIHdpZGdldDogSUFwcCwgdG9Db250YWluZXI6IENvbnRhaW5lcikge1xuICAgICAgICBjb25zdCBhbGxXaWRnZXRzID0gdGhpcy5nZXRBbGxXaWRnZXRzKHJvb20pO1xuICAgICAgICBpZiAoIWFsbFdpZGdldHMuc29tZSgoW3ddKSA9PiB3LmlkID09PSB3aWRnZXQuaWQpKSByZXR1cm47IC8vIGludmFsaWRcbiAgICAgICAgLy8gUHJlcGFyZSBvdGhlciBjb250YWluZXJzIChwb3RlbnRpYWxseSBtb3ZlIHdpZGdldHMgdG8gb2JleSB0aGUgZm9sbG93aW5nIHJ1bGVzKVxuICAgICAgICBjb25zdCBuZXdMYXlvdXQgPSB7fTtcbiAgICAgICAgc3dpdGNoICh0b0NvbnRhaW5lcikge1xuICAgICAgICAgICAgY2FzZSBDb250YWluZXIuUmlnaHQ6XG4gICAgICAgICAgICAgICAgLy8gbmV3IFwicmlnaHRcIiB3aWRnZXRcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ29udGFpbmVyLkNlbnRlcjpcbiAgICAgICAgICAgICAgICAvLyBuZXcgXCJjZW50ZXJcIiB3aWRnZXQgPT4gYWxsIG90aGVyIHdpZGdldHMgZ28gaW50byBcInJpZ2h0XCJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHcgb2YgdGhpcy5nZXRDb250YWluZXJXaWRnZXRzKHJvb20sIENvbnRhaW5lci5Ub3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0xheW91dFt3LmlkXSA9IHsgY29udGFpbmVyOiBDb250YWluZXIuUmlnaHQgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB3IG9mIHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBDb250YWluZXIuQ2VudGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdMYXlvdXRbdy5pZF0gPSB7IGNvbnRhaW5lcjogQ29udGFpbmVyLlJpZ2h0IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDb250YWluZXIuVG9wOlxuICAgICAgICAgICAgICAgIC8vIG5ldyBcInRvcFwiIHdpZGdldCA9PiB0aGUgY2VudGVyIHdpZGdldCBtb3ZlcyBpbnRvIFwicmlnaHRcIlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhhc01heGltaXNlZFdpZGdldChyb29tKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXJXaWRnZXQgPSB0aGlzLmdldENvbnRhaW5lcldpZGdldHMocm9vbSwgQ29udGFpbmVyLkNlbnRlcilbMF07XG4gICAgICAgICAgICAgICAgICAgIG5ld0xheW91dFtjZW50ZXJXaWRnZXQuaWRdID0geyBjb250YWluZXI6IENvbnRhaW5lci5SaWdodCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIG5ld0xheW91dFt3aWRnZXQuaWRdID0geyBjb250YWluZXI6IHRvQ29udGFpbmVyIH07XG5cbiAgICAgICAgLy8gbW92ZSB3aWRnZXRzIGludG8gcmVxdWVzdGVkIGNvbnRhaW5lcnMuXG4gICAgICAgIHRoaXMudXBkYXRlVXNlckxheW91dChyb29tLCBuZXdMYXlvdXQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXNNYXhpbWlzZWRXaWRnZXQocm9vbTogUm9vbSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb250YWluZXJXaWRnZXRzKHJvb20sIENvbnRhaW5lci5DZW50ZXIpLmxlbmd0aCA+IDA7XG4gICAgfVxuXG4gICAgcHVibGljIGhhc1Bpbm5lZFdpZGdldHMocm9vbTogUm9vbSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb250YWluZXJXaWRnZXRzKHJvb20sIENvbnRhaW5lci5Ub3ApLmxlbmd0aCA+IDA7XG4gICAgfVxuXG4gICAgcHVibGljIGNhbkNvcHlMYXlvdXRUb1Jvb20ocm9vbTogUm9vbSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMubWF0cml4Q2xpZW50KSByZXR1cm4gZmFsc2U7IC8vIG5vdCByZWFkeSB5ZXRcbiAgICAgICAgcmV0dXJuIHJvb20uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KFdJREdFVF9MQVlPVVRfRVZFTlRfVFlQRSwgdGhpcy5tYXRyaXhDbGllbnQuZ2V0VXNlcklkKCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb3B5TGF5b3V0VG9Sb29tKHJvb206IFJvb20pIHtcbiAgICAgICAgY29uc3QgYWxsV2lkZ2V0cyA9IHRoaXMuZ2V0QWxsV2lkZ2V0cyhyb29tKTtcbiAgICAgICAgY29uc3QgZXZDb250ZW50OiBJTGF5b3V0U3RhdGVFdmVudCA9IHsgd2lkZ2V0czoge30gfTtcbiAgICAgICAgZm9yIChjb25zdCBbd2lkZ2V0LCBjb250YWluZXJdIG9mIGFsbFdpZGdldHMpIHtcbiAgICAgICAgICAgIGV2Q29udGVudC53aWRnZXRzW3dpZGdldC5pZF0gPSB7IGNvbnRhaW5lciB9O1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lciA9PT0gQ29udGFpbmVyLlRvcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lcldpZGdldHMgPSB0aGlzLmdldENvbnRhaW5lcldpZGdldHMocm9vbSwgY29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBjb250YWluZXJXaWRnZXRzLmZpbmRJbmRleCh3ID0+IHcuaWQgPT09IHdpZGdldC5pZCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2lkdGhzID0gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uZGlzdHJpYnV0aW9ucztcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0/Lltjb250YWluZXJdPy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgZXZDb250ZW50LndpZGdldHNbd2lkZ2V0LmlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uZXZDb250ZW50LndpZGdldHNbd2lkZ2V0LmlkXSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQgPyBNYXRoLnJvdW5kKGhlaWdodCkgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGhzW2lkeF0gPyBNYXRoLnJvdW5kKHdpZHRoc1tpZHhdKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpZHgsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5zZW5kU3RhdGVFdmVudChyb29tLnJvb21JZCwgV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFLCBldkNvbnRlbnQsIFwiXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0QWxsV2lkZ2V0cyhyb29tOiBSb29tKTogW0lBcHAsIENvbnRhaW5lcl1bXSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lcnMgPSB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF07XG4gICAgICAgIGlmICghY29udGFpbmVycykgcmV0dXJuIFtdO1xuXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRhaW5lciBvZiBPYmplY3Qua2V5cyhjb250YWluZXJzKSkge1xuICAgICAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IGNvbnRhaW5lcnNbY29udGFpbmVyXS5vcmRlcmVkO1xuICAgICAgICAgICAgZm9yIChjb25zdCB3aWRnZXQgb2Ygd2lkZ2V0cykge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKFt3aWRnZXQsIGNvbnRhaW5lcl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVVc2VyTGF5b3V0KHJvb206IFJvb20sIG5ld0xheW91dDogSVdpZGdldExheW91dHMpIHtcbiAgICAgICAgLy8gUG9seWZpbGwgYW55IG1pc3Npbmcgd2lkZ2V0c1xuICAgICAgICBjb25zdCBhbGxXaWRnZXRzID0gdGhpcy5nZXRBbGxXaWRnZXRzKHJvb20pO1xuICAgICAgICBmb3IgKGNvbnN0IFt3aWRnZXQsIGNvbnRhaW5lcl0gb2YgYWxsV2lkZ2V0cykge1xuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyV2lkZ2V0cyA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBjb250YWluZXIpO1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gY29udGFpbmVyV2lkZ2V0cy5maW5kSW5kZXgodyA9PiB3LmlkID09PSB3aWRnZXQuaWQpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGhzID0gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uZGlzdHJpYnV0aW9ucztcbiAgICAgICAgICAgIGlmICghbmV3TGF5b3V0W3dpZGdldC5pZF0pIHtcbiAgICAgICAgICAgICAgICBuZXdMYXlvdXRbd2lkZ2V0LmlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpZHgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGhzPy5baWR4XSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGF5b3V0RXYgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEUsIFwiXCIpO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiV2lkZ2V0cy5sYXlvdXRcIiwgcm9vbS5yb29tSWQsIFNldHRpbmdMZXZlbC5ST09NX0FDQ09VTlQsIHtcbiAgICAgICAgICAgIG92ZXJyaWRlczogbGF5b3V0RXY/LmdldElkKCksXG4gICAgICAgICAgICB3aWRnZXRzOiBuZXdMYXlvdXQsXG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHRoaXMucmVjYWxjdWxhdGVSb29tKHJvb20pKTtcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVJvb20ocm9vbSk7IC8vIGNhbGwgdG8gdHJ5IGxvY2FsIGVjaG8gb24gY2hhbmdlcyAodGhlIGNhdGNoIGFib3ZlIHVuZG9lcyBhbnkgZXJyb3JzKVxuICAgIH1cbn1cblxud2luZG93Lm14V2lkZ2V0TGF5b3V0U3RvcmUgPSBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVPLE1BQU1BLHdCQUF3QixHQUFHLDJCQUFqQzs7SUFFS0MsUzs7O1dBQUFBLFM7RUFBQUEsUztFQUFBQSxTO0VBQUFBLFM7R0FBQUEsUyx5QkFBQUEsUzs7QUFtRFo7QUFDTyxNQUFNQyxVQUFVLEdBQUcsQ0FBbkIsQyxDQUVQO0FBQ0E7QUFDQTs7O0FBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsRUFBN0IsQyxDQUFpQzs7QUFDakMsTUFBTUMscUJBQXFCLEdBQUcsQ0FBOUIsQyxDQUFpQzs7QUFFMUIsTUFBTUMsaUJBQU4sU0FBZ0NDLHNDQUFoQyxDQUFtRDtFQWlCOUNDLFdBQVcsR0FBRztJQUNsQixNQUFNQyxtQkFBTjtJQURrQiw4Q0FMbEIsRUFLa0I7SUFBQTtJQUFBO0lBQUEsc0RBc0NHLE1BQU07TUFDM0IsS0FBS0MsTUFBTCxHQUFjLEVBQWQ7O01BQ0EsS0FBSyxNQUFNQyxJQUFYLElBQW1CLEtBQUtDLFlBQUwsQ0FBa0JDLGVBQWxCLEVBQW5CLEVBQXdEO1FBQ3BELEtBQUtDLGVBQUwsQ0FBcUJILElBQXJCO01BQ0g7SUFDSixDQTNDcUI7SUFBQSw2REE2Q1dJLE1BQUQsSUFBcUI7TUFDakQsSUFBSUEsTUFBSixFQUFZO1FBQ1IsTUFBTUosSUFBSSxHQUFHLEtBQUtDLFlBQUwsQ0FBa0JJLE9BQWxCLENBQTBCRCxNQUExQixDQUFiO1FBQ0EsSUFBSUos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