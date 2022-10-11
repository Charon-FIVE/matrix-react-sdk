"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _languageHandler = require("../../languageHandler");

var _RoomList = _interopRequireDefault(require("../views/rooms/RoomList"));

var _LegacyCallHandler = _interopRequireDefault(require("../../LegacyCallHandler"));

var _RoomSublist = require("../views/rooms/RoomSublist");

var _actions = require("../../dispatcher/actions");

var _RoomSearch = _interopRequireDefault(require("./RoomSearch"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../views/elements/AccessibleTooltipButton"));

var _SpaceStore = _interopRequireDefault(require("../../stores/spaces/SpaceStore"));

var _spaces = require("../../stores/spaces");

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _UIStore = _interopRequireDefault(require("../../stores/UIStore"));

var _RoomListHeader = _interopRequireDefault(require("../views/rooms/RoomListHeader"));

var _RecentlyViewedButton = _interopRequireDefault(require("../views/rooms/RecentlyViewedButton"));

var _BreadcrumbsStore = require("../../stores/BreadcrumbsStore");

var _RoomListStore = _interopRequireWildcard(require("../../stores/room-list/RoomListStore"));

var _AsyncStore = require("../../stores/AsyncStore");

var _IndicatorScrollbar = _interopRequireDefault(require("./IndicatorScrollbar"));

var _RoomBreadcrumbs = _interopRequireDefault(require("../views/rooms/RoomBreadcrumbs"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

var _UIComponents = require("../../customisations/helpers/UIComponents");

var _UIFeature = require("../../settings/UIFeature");

var _PosthogTrackers = _interopRequireDefault(require("../../PosthogTrackers"));

var _PageTypes = _interopRequireDefault(require("../../PageTypes"));

var _UserOnboardingButton = require("../views/user-onboarding/UserOnboardingButton");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
var BreadcrumbsMode;

(function (BreadcrumbsMode) {
  BreadcrumbsMode[BreadcrumbsMode["Disabled"] = 0] = "Disabled";
  BreadcrumbsMode[BreadcrumbsMode["Legacy"] = 1] = "Legacy";
  BreadcrumbsMode[BreadcrumbsMode["Labs"] = 2] = "Labs";
})(BreadcrumbsMode || (BreadcrumbsMode = {}));

class LeftPanel extends React.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "listContainerRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "roomListRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "focusedElement", null);
    (0, _defineProperty2.default)(this, "isDoingStickyHeaders", false);
    (0, _defineProperty2.default)(this, "updateActiveSpace", activeSpace => {
      this.setState({
        activeSpace
      });
    });
    (0, _defineProperty2.default)(this, "onDialPad", () => {
      _dispatcher.default.fire(_actions.Action.OpenDialPad);
    });
    (0, _defineProperty2.default)(this, "onExplore", ev => {
      _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);

      _PosthogTrackers.default.trackInteraction("WebLeftPanelExploreRoomsButton", ev);
    });
    (0, _defineProperty2.default)(this, "refreshStickyHeaders", () => {
      if (!this.listContainerRef.current) return; // ignore: no headers to sticky

      this.handleStickyHeaders(this.listContainerRef.current);
    });
    (0, _defineProperty2.default)(this, "onBreadcrumbsUpdate", () => {
      const newVal = LeftPanel.breadcrumbsMode;

      if (newVal !== this.state.showBreadcrumbs) {
        this.setState({
          showBreadcrumbs: newVal
        }); // Update the sticky headers too as the breadcrumbs will be popping in or out.

        if (!this.listContainerRef.current) return; // ignore: no headers to sticky

        this.handleStickyHeaders(this.listContainerRef.current);
      }
    });
    (0, _defineProperty2.default)(this, "onScroll", ev => {
      const list = ev.target;
      this.handleStickyHeaders(list);
    });
    (0, _defineProperty2.default)(this, "onFocus", ev => {
      this.focusedElement = ev.target;
    });
    (0, _defineProperty2.default)(this, "onBlur", () => {
      this.focusedElement = null;
    });
    (0, _defineProperty2.default)(this, "onKeyDown", (ev, state) => {
      if (!this.focusedElement) return;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomListAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.NextRoom:
          if (!state) {
            ev.stopPropagation();
            ev.preventDefault();
            this.roomListRef.current?.focus();
          }

          break;
      }
    });
    this.state = {
      activeSpace: _SpaceStore.default.instance.activeSpace,
      showBreadcrumbs: LeftPanel.breadcrumbsMode
    };

    _BreadcrumbsStore.BreadcrumbsStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _SpaceStore.default.instance.on(_spaces.UPDATE_SELECTED_SPACE, this.updateActiveSpace);
  }

  static get breadcrumbsMode() {
    if (!_BreadcrumbsStore.BreadcrumbsStore.instance.visible) return BreadcrumbsMode.Disabled;
    return _SettingsStore.default.getValue("feature_breadcrumbs_v2") ? BreadcrumbsMode.Labs : BreadcrumbsMode.Legacy;
  }

  componentDidMount() {
    _UIStore.default.instance.trackElementDimensions("ListContainer", this.listContainerRef.current);

    _UIStore.default.instance.on("ListContainer", this.refreshStickyHeaders); // Using the passive option to not block the main thread
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners


    this.listContainerRef.current?.addEventListener("scroll", this.onScroll, {
      passive: true
    });
  }

  componentWillUnmount() {
    _BreadcrumbsStore.BreadcrumbsStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _RoomListStore.default.instance.off(_RoomListStore.LISTS_UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _SpaceStore.default.instance.off(_spaces.UPDATE_SELECTED_SPACE, this.updateActiveSpace);

    _UIStore.default.instance.stopTrackingElementDimensions("ListContainer");

    _UIStore.default.instance.removeListener("ListContainer", this.refreshStickyHeaders);

    this.listContainerRef.current?.removeEventListener("scroll", this.onScroll);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.activeSpace !== this.state.activeSpace) {
      this.refreshStickyHeaders();
    }
  }

  handleStickyHeaders(list) {
    if (this.isDoingStickyHeaders) return;
    this.isDoingStickyHeaders = true;
    window.requestAnimationFrame(() => {
      this.doStickyHeaders(list);
      this.isDoingStickyHeaders = false;
    });
  }

  doStickyHeaders(list) {
    const topEdge = list.scrollTop;
    const bottomEdge = list.offsetHeight + list.scrollTop;
    const sublists = list.querySelectorAll(".mx_RoomSublist:not(.mx_RoomSublist_hidden)"); // We track which styles we want on a target before making the changes to avoid
    // excessive layout updates.

    const targetStyles = new Map();
    let lastTopHeader;
    let firstBottomHeader;

    for (const sublist of sublists) {
      const header = sublist.querySelector(".mx_RoomSublist_stickable");
      header.style.removeProperty("display"); // always clear display:none first
      // When an element is <=40% off screen, make it take over

      const offScreenFactor = 0.4;
      const isOffTop = sublist.offsetTop + offScreenFactor * _RoomSublist.HEADER_HEIGHT <= topEdge;
      const isOffBottom = sublist.offsetTop + offScreenFactor * _RoomSublist.HEADER_HEIGHT >= bottomEdge;

      if (isOffTop || sublist === sublists[0]) {
        targetStyles.set(header, {
          stickyTop: true
        });

        if (lastTopHeader) {
          lastTopHeader.style.display = "none";
          targetStyles.set(lastTopHeader, {
            makeInvisible: true
          });
        }

        lastTopHeader = header;
      } else if (isOffBottom && !firstBottomHeader) {
        targetStyles.set(header, {
          stickyBottom: true
        });
        firstBottomHeader = header;
      } else {
        targetStyles.set(header, {}); // nothing == clear
      }
    } // Run over the style changes and make them reality. We check to see if we're about to
    // cause a no-op update, as adding/removing properties that are/aren't there cause
    // layout updates.


    for (const header of targetStyles.keys()) {
      const style = targetStyles.get(header);

      if (style.makeInvisible) {
        // we will have already removed the 'display: none', so add it back.
        header.style.display = "none";
        continue; // nothing else to do, even if sticky somehow
      }

      if (style.stickyTop) {
        if (!header.classList.contains("mx_RoomSublist_headerContainer_stickyTop")) {
          header.classList.add("mx_RoomSublist_headerContainer_stickyTop");
        }

        const newTop = `${list.parentElement.offsetTop}px`;

        if (header.style.top !== newTop) {
          header.style.top = newTop;
        }
      } else {
        if (header.classList.contains("mx_RoomSublist_headerContainer_stickyTop")) {
          header.classList.remove("mx_RoomSublist_headerContainer_stickyTop");
        }

        if (header.style.top) {
          header.style.removeProperty('top');
        }
      }

      if (style.stickyBottom) {
        if (!header.classList.contains("mx_RoomSublist_headerContainer_stickyBottom")) {
          header.classList.add("mx_RoomSublist_headerContainer_stickyBottom");
        }

        const offset = _UIStore.default.instance.windowHeight - (list.parentElement.offsetTop + list.parentElement.offsetHeight);
        const newBottom = `${offset}px`;

        if (header.style.bottom !== newBottom) {
          header.style.bottom = newBottom;
        }
      } else {
        if (header.classList.contains("mx_RoomSublist_headerContainer_stickyBottom")) {
          header.classList.remove("mx_RoomSublist_headerContainer_stickyBottom");
        }

        if (header.style.bottom) {
          header.style.removeProperty('bottom');
        }
      }

      if (style.stickyTop || style.stickyBottom) {
        if (!header.classList.contains("mx_RoomSublist_headerContainer_sticky")) {
          header.classList.add("mx_RoomSublist_headerContainer_sticky");
        }

        const listDimensions = _UIStore.default.instance.getElementDimensions("ListContainer");

        if (listDimensions) {
          const headerRightMargin = 15; // calculated from margins and widths to align with non-sticky tiles

          const headerStickyWidth = listDimensions.width - headerRightMargin;
          const newWidth = `${headerStickyWidth}px`;

          if (header.style.width !== newWidth) {
            header.style.width = newWidth;
          }
        }
      } else if (!style.stickyTop && !style.stickyBottom) {
        if (header.classList.contains("mx_RoomSublist_headerContainer_sticky")) {
          header.classList.remove("mx_RoomSublist_headerContainer_sticky");
        }

        if (header.style.width) {
          header.style.removeProperty('width');
        }
      }
    } // add appropriate sticky classes to wrapper so it has
    // the necessary top/bottom padding to put the sticky header in


    const listWrapper = list.parentElement; // .mx_LeftPanel_roomListWrapper

    if (lastTopHeader) {
      listWrapper.classList.add("mx_LeftPanel_roomListWrapper_stickyTop");
    } else {
      listWrapper.classList.remove("mx_LeftPanel_roomListWrapper_stickyTop");
    }

    if (firstBottomHeader) {
      listWrapper.classList.add("mx_LeftPanel_roomListWrapper_stickyBottom");
    } else {
      listWrapper.classList.remove("mx_LeftPanel_roomListWrapper_stickyBottom");
    }
  }

  renderBreadcrumbs() {
    if (this.state.showBreadcrumbs === BreadcrumbsMode.Legacy && !this.props.isMinimized) {
      return /*#__PURE__*/React.createElement(_IndicatorScrollbar.default, {
        className: "mx_LeftPanel_breadcrumbsContainer mx_AutoHideScrollbar",
        verticalScrollsHorizontally: true
      }, /*#__PURE__*/React.createElement(_RoomBreadcrumbs.default, null));
    }
  }

  renderSearchDialExplore() {
    let dialPadButton = null; // If we have dialer support, show a button to bring up the dial pad
    // to start a new call

    if (_LegacyCallHandler.default.instance.getSupportsPstnProtocol()) {
      dialPadButton = /*#__PURE__*/React.createElement(_AccessibleTooltipButton.default, {
        className: (0, _classnames.default)("mx_LeftPanel_dialPadButton", {}),
        onClick: this.onDialPad,
        title: (0, _languageHandler._t)("Open dial pad")
      });
    }

    let rightButton;

    if (this.state.showBreadcrumbs === BreadcrumbsMode.Labs) {
      rightButton = /*#__PURE__*/React.createElement(_RecentlyViewedButton.default, null);
    } else if (this.state.activeSpace === _spaces.MetaSpace.Home && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.ExploreRooms)) {
      rightButton = /*#__PURE__*/React.createElement(_AccessibleTooltipButton.default, {
        className: "mx_LeftPanel_exploreButton",
        onClick: this.onExplore,
        title: (0, _languageHandler._t)("Explore rooms")
      });
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "mx_LeftPanel_filterContainer",
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onKeyDown: this.onKeyDown
    }, /*#__PURE__*/React.createElement(_RoomSearch.default, {
      isMinimized: this.props.isMinimized
    }), dialPadButton, rightButton);
  }

  render() {
    const roomList = /*#__PURE__*/React.createElement(_RoomList.default, {
      onKeyDown: this.onKeyDown,
      resizeNotifier: this.props.resizeNotifier,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      isMinimized: this.props.isMinimized,
      activeSpace: this.state.activeSpace,
      onResize: this.refreshStickyHeaders,
      onListCollapse: this.refreshStickyHeaders,
      ref: this.roomListRef
    });
    const containerClasses = (0, _classnames.default)({
      "mx_LeftPanel": true,
      "mx_LeftPanel_minimized": this.props.isMinimized
    });
    const roomListClasses = (0, _classnames.default)("mx_LeftPanel_actualRoomListContainer", "mx_AutoHideScrollbar");
    return /*#__PURE__*/React.createElement("div", {
      className: containerClasses
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_LeftPanel_roomListContainer"
    }, this.renderSearchDialExplore(), this.renderBreadcrumbs(), !this.props.isMinimized && /*#__PURE__*/React.createElement(_RoomListHeader.default, {
      onVisibilityChange: this.refreshStickyHeaders
    }), /*#__PURE__*/React.createElement(_UserOnboardingButton.UserOnboardingButton, {
      selected: this.props.pageType === _PageTypes.default.HomePage,
      minimized: this.props.isMinimized
    }), /*#__PURE__*/React.createElement("div", {
      className: "mx_LeftPanel_roomListWrapper"
    }, /*#__PURE__*/React.createElement("div", {
      className: roomListClasses,
      ref: this.listContainerRef // Firefox sometimes makes this element focusable due to
      // overflow:scroll;, so force it out of tab order.
      ,
      tabIndex: -1
    }, roomList))));
  }

}

exports.default = LeftPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCcmVhZGNydW1ic01vZGUiLCJMZWZ0UGFuZWwiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJhY3RpdmVTcGFjZSIsInNldFN0YXRlIiwiZGlzIiwiZmlyZSIsIkFjdGlvbiIsIk9wZW5EaWFsUGFkIiwiZXYiLCJWaWV3Um9vbURpcmVjdG9yeSIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrSW50ZXJhY3Rpb24iLCJsaXN0Q29udGFpbmVyUmVmIiwiY3VycmVudCIsImhhbmRsZVN0aWNreUhlYWRlcnMiLCJuZXdWYWwiLCJicmVhZGNydW1ic01vZGUiLCJzdGF0ZSIsInNob3dCcmVhZGNydW1icyIsImxpc3QiLCJ0YXJnZXQiLCJmb2N1c2VkRWxlbWVudCIsImFjdGlvbiIsImdldEtleUJpbmRpbmdzTWFuYWdlciIsImdldFJvb21MaXN0QWN0aW9uIiwiS2V5QmluZGluZ0FjdGlvbiIsIk5leHRSb29tIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJyb29tTGlzdFJlZiIsImZvY3VzIiwiU3BhY2VTdG9yZSIsImluc3RhbmNlIiwiQnJlYWRjcnVtYnNTdG9yZSIsIm9uIiwiVVBEQVRFX0VWRU5UIiwib25CcmVhZGNydW1ic1VwZGF0ZSIsIlJvb21MaXN0U3RvcmUiLCJMSVNUU19VUERBVEVfRVZFTlQiLCJVUERBVEVfU0VMRUNURURfU1BBQ0UiLCJ1cGRhdGVBY3RpdmVTcGFjZSIsInZpc2libGUiLCJEaXNhYmxlZCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIkxhYnMiLCJMZWdhY3kiLCJjb21wb25lbnREaWRNb3VudCIsIlVJU3RvcmUiLCJ0cmFja0VsZW1lbnREaW1lbnNpb25zIiwicmVmcmVzaFN0aWNreUhlYWRlcnMiLCJhZGRFdmVudExpc3RlbmVyIiwib25TY3JvbGwiLCJwYXNzaXZlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJvZmYiLCJzdG9wVHJhY2tpbmdFbGVtZW50RGltZW5zaW9ucyIsInJlbW92ZUxpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInByZXZTdGF0ZSIsImlzRG9pbmdTdGlja3lIZWFkZXJzIiwid2luZG93IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiZG9TdGlja3lIZWFkZXJzIiwidG9wRWRnZSIsInNjcm9sbFRvcCIsImJvdHRvbUVkZ2UiLCJvZmZzZXRIZWlnaHQiLCJzdWJsaXN0cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJ0YXJnZXRTdHlsZXMiLCJNYXAiLCJsYXN0VG9wSGVhZGVyIiwiZmlyc3RCb3R0b21IZWFkZXIiLCJzdWJsaXN0IiwiaGVhZGVyIiwicXVlcnlTZWxlY3RvciIsInN0eWxlIiwicmVtb3ZlUHJvcGVydHkiLCJvZmZTY3JlZW5GYWN0b3IiLCJpc09mZlRvcCIsIm9mZnNldFRvcCIsIkhFQURFUl9IRUlHSFQiLCJpc09mZkJvdHRvbSIsInNldCIsInN0aWNreVRvcCIsImRpc3BsYXkiLCJtYWtlSW52aXNpYmxlIiwic3RpY2t5Qm90dG9tIiwia2V5cyIsImdldCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiYWRkIiwibmV3VG9wIiwicGFyZW50RWxlbWVudCIsInRvcCIsInJlbW92ZSIsIm9mZnNldCIsIndpbmRvd0hlaWdodCIsIm5ld0JvdHRvbSIsImJvdHRvbSIsImxpc3REaW1lbnNpb25zIiwiZ2V0RWxlbWVudERpbWVuc2lvbnMiLCJoZWFkZXJSaWdodE1hcmdpbiIsImhlYWRlclN0aWNreVdpZHRoIiwid2lkdGgiLCJuZXdXaWR0aCIsImxpc3RXcmFwcGVyIiwicmVuZGVyQnJlYWRjcnVtYnMiLCJpc01pbmltaXplZCIsInJlbmRlclNlYXJjaERpYWxFeHBsb3JlIiwiZGlhbFBhZEJ1dHRvbiIsIkxlZ2FjeUNhbGxIYW5kbGVyIiwiZ2V0U3VwcG9ydHNQc3RuUHJvdG9jb2wiLCJjbGFzc05hbWVzIiwib25EaWFsUGFkIiwiX3QiLCJyaWdodEJ1dHRvbiIsIk1ldGFTcGFjZSIsIkhvbWUiLCJzaG91bGRTaG93Q29tcG9uZW50IiwiVUlDb21wb25lbnQiLCJFeHBsb3JlUm9vbXMiLCJvbkV4cGxvcmUiLCJvbkZvY3VzIiwib25CbHVyIiwib25LZXlEb3duIiwicmVuZGVyIiwicm9vbUxpc3QiLCJyZXNpemVOb3RpZmllciIsImNvbnRhaW5lckNsYXNzZXMiLCJyb29tTGlzdENsYXNzZXMiLCJwYWdlVHlwZSIsIlBhZ2VUeXBlIiwiSG9tZVBhZ2UiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL0xlZnRQYW5lbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBjcmVhdGVSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUm9vbUxpc3QgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21MaXN0XCI7XG5pbXBvcnQgTGVnYWN5Q2FsbEhhbmRsZXIgZnJvbSBcIi4uLy4uL0xlZ2FjeUNhbGxIYW5kbGVyXCI7XG5pbXBvcnQgeyBIRUFERVJfSEVJR0hUIH0gZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21TdWJsaXN0XCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgUm9vbVNlYXJjaCBmcm9tIFwiLi9Sb29tU2VhcmNoXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL3NwYWNlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQgeyBNZXRhU3BhY2UsIFNwYWNlS2V5LCBVUERBVEVfU0VMRUNURURfU1BBQ0UgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL3NwYWNlc1wiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuaW1wb3J0IFVJU3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9VSVN0b3JlXCI7XG5pbXBvcnQgeyBJU3RhdGUgYXMgSVJvdmluZ1RhYkluZGV4U3RhdGUgfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9Sb3ZpbmdUYWJJbmRleFwiO1xuaW1wb3J0IFJvb21MaXN0SGVhZGVyIGZyb20gXCIuLi92aWV3cy9yb29tcy9Sb29tTGlzdEhlYWRlclwiO1xuaW1wb3J0IFJlY2VudGx5Vmlld2VkQnV0dG9uIGZyb20gXCIuLi92aWV3cy9yb29tcy9SZWNlbnRseVZpZXdlZEJ1dHRvblwiO1xuaW1wb3J0IHsgQnJlYWRjcnVtYnNTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvQnJlYWRjcnVtYnNTdG9yZVwiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUsIHsgTElTVFNfVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgSW5kaWNhdG9yU2Nyb2xsYmFyIGZyb20gXCIuL0luZGljYXRvclNjcm9sbGJhclwiO1xuaW1wb3J0IFJvb21CcmVhZGNydW1icyBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUm9vbUJyZWFkY3J1bWJzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgS2V5QmluZGluZ0FjdGlvbiB9IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5pbXBvcnQgeyBzaG91bGRTaG93Q29tcG9uZW50IH0gZnJvbSBcIi4uLy4uL2N1c3RvbWlzYXRpb25zL2hlbHBlcnMvVUlDb21wb25lbnRzXCI7XG5pbXBvcnQgeyBVSUNvbXBvbmVudCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uLy4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuaW1wb3J0IFBhZ2VUeXBlIGZyb20gXCIuLi8uLi9QYWdlVHlwZXNcIjtcbmltcG9ydCB7IFVzZXJPbmJvYXJkaW5nQnV0dG9uIH0gZnJvbSBcIi4uL3ZpZXdzL3VzZXItb25ib2FyZGluZy9Vc2VyT25ib2FyZGluZ0J1dHRvblwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbiAgICBwYWdlVHlwZTogUGFnZVR5cGU7XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xufVxuXG5lbnVtIEJyZWFkY3J1bWJzTW9kZSB7XG4gICAgRGlzYWJsZWQsXG4gICAgTGVnYWN5LFxuICAgIExhYnMsXG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHNob3dCcmVhZGNydW1iczogQnJlYWRjcnVtYnNNb2RlO1xuICAgIGFjdGl2ZVNwYWNlOiBTcGFjZUtleTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVmdFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBsaXN0Q29udGFpbmVyUmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgcm9vbUxpc3RSZWYgPSBjcmVhdGVSZWY8Um9vbUxpc3Q+KCk7XG4gICAgcHJpdmF0ZSBmb2N1c2VkRWxlbWVudCA9IG51bGw7XG4gICAgcHJpdmF0ZSBpc0RvaW5nU3RpY2t5SGVhZGVycyA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGFjdGl2ZVNwYWNlOiBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlLFxuICAgICAgICAgICAgc2hvd0JyZWFkY3J1bWJzOiBMZWZ0UGFuZWwuYnJlYWRjcnVtYnNNb2RlLFxuICAgICAgICB9O1xuXG4gICAgICAgIEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uQnJlYWRjcnVtYnNVcGRhdGUpO1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9uKExJU1RTX1VQREFURV9FVkVOVCwgdGhpcy5vbkJyZWFkY3J1bWJzVXBkYXRlKTtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfU0VMRUNURURfU1BBQ0UsIHRoaXMudXBkYXRlQWN0aXZlU3BhY2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldCBicmVhZGNydW1ic01vZGUoKTogQnJlYWRjcnVtYnNNb2RlIHtcbiAgICAgICAgaWYgKCFCcmVhZGNydW1ic1N0b3JlLmluc3RhbmNlLnZpc2libGUpIHJldHVybiBCcmVhZGNydW1ic01vZGUuRGlzYWJsZWQ7XG4gICAgICAgIHJldHVybiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9icmVhZGNydW1ic192MlwiKSA/IEJyZWFkY3J1bWJzTW9kZS5MYWJzIDogQnJlYWRjcnVtYnNNb2RlLkxlZ2FjeTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIFVJU3RvcmUuaW5zdGFuY2UudHJhY2tFbGVtZW50RGltZW5zaW9ucyhcIkxpc3RDb250YWluZXJcIiwgdGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpO1xuICAgICAgICBVSVN0b3JlLmluc3RhbmNlLm9uKFwiTGlzdENvbnRhaW5lclwiLCB0aGlzLnJlZnJlc2hTdGlja3lIZWFkZXJzKTtcbiAgICAgICAgLy8gVXNpbmcgdGhlIHBhc3NpdmUgb3B0aW9uIHRvIG5vdCBibG9jayB0aGUgbWFpbiB0aHJlYWRcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0V2ZW50VGFyZ2V0L2FkZEV2ZW50TGlzdGVuZXIjaW1wcm92aW5nX3Njcm9sbGluZ19wZXJmb3JtYW5jZV93aXRoX3Bhc3NpdmVfbGlzdGVuZXJzXG4gICAgICAgIHRoaXMubGlzdENvbnRhaW5lclJlZi5jdXJyZW50Py5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMub25TY3JvbGwsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vbkJyZWFkY3J1bWJzVXBkYXRlKTtcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vZmYoTElTVFNfVVBEQVRFX0VWRU5ULCB0aGlzLm9uQnJlYWRjcnVtYnNVcGRhdGUpO1xuICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLm9mZihVUERBVEVfU0VMRUNURURfU1BBQ0UsIHRoaXMudXBkYXRlQWN0aXZlU3BhY2UpO1xuICAgICAgICBVSVN0b3JlLmluc3RhbmNlLnN0b3BUcmFja2luZ0VsZW1lbnREaW1lbnNpb25zKFwiTGlzdENvbnRhaW5lclwiKTtcbiAgICAgICAgVUlTdG9yZS5pbnN0YW5jZS5yZW1vdmVMaXN0ZW5lcihcIkxpc3RDb250YWluZXJcIiwgdGhpcy5yZWZyZXNoU3RpY2t5SGVhZGVycyk7XG4gICAgICAgIHRoaXMubGlzdENvbnRhaW5lclJlZi5jdXJyZW50Py5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMub25TY3JvbGwpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBJUHJvcHMsIHByZXZTdGF0ZTogSVN0YXRlKTogdm9pZCB7XG4gICAgICAgIGlmIChwcmV2U3RhdGUuYWN0aXZlU3BhY2UgIT09IHRoaXMuc3RhdGUuYWN0aXZlU3BhY2UpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaFN0aWNreUhlYWRlcnMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlQWN0aXZlU3BhY2UgPSAoYWN0aXZlU3BhY2U6IFNwYWNlS2V5KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBhY3RpdmVTcGFjZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRpYWxQYWQgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5PcGVuRGlhbFBhZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FeHBsb3JlID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uVmlld1Jvb21EaXJlY3RvcnkpO1xuICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYkxlZnRQYW5lbEV4cGxvcmVSb29tc0J1dHRvblwiLCBldik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVmcmVzaFN0aWNreUhlYWRlcnMgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpIHJldHVybjsgLy8gaWdub3JlOiBubyBoZWFkZXJzIHRvIHN0aWNreVxuICAgICAgICB0aGlzLmhhbmRsZVN0aWNreUhlYWRlcnModGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQnJlYWRjcnVtYnNVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbCA9IExlZnRQYW5lbC5icmVhZGNydW1ic01vZGU7XG4gICAgICAgIGlmIChuZXdWYWwgIT09IHRoaXMuc3RhdGUuc2hvd0JyZWFkY3J1bWJzKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd0JyZWFkY3J1bWJzOiBuZXdWYWwgfSk7XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgc3RpY2t5IGhlYWRlcnMgdG9vIGFzIHRoZSBicmVhZGNydW1icyB3aWxsIGJlIHBvcHBpbmcgaW4gb3Igb3V0LlxuICAgICAgICAgICAgaWYgKCF0aGlzLmxpc3RDb250YWluZXJSZWYuY3VycmVudCkgcmV0dXJuOyAvLyBpZ25vcmU6IG5vIGhlYWRlcnMgdG8gc3RpY2t5XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVN0aWNreUhlYWRlcnModGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgaGFuZGxlU3RpY2t5SGVhZGVycyhsaXN0OiBIVE1MRGl2RWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5pc0RvaW5nU3RpY2t5SGVhZGVycykgcmV0dXJuO1xuICAgICAgICB0aGlzLmlzRG9pbmdTdGlja3lIZWFkZXJzID0gdHJ1ZTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRvU3RpY2t5SGVhZGVycyhsaXN0KTtcbiAgICAgICAgICAgIHRoaXMuaXNEb2luZ1N0aWNreUhlYWRlcnMgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkb1N0aWNreUhlYWRlcnMobGlzdDogSFRNTERpdkVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgdG9wRWRnZSA9IGxpc3Quc2Nyb2xsVG9wO1xuICAgICAgICBjb25zdCBib3R0b21FZGdlID0gbGlzdC5vZmZzZXRIZWlnaHQgKyBsaXN0LnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3Qgc3VibGlzdHMgPSBsaXN0LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTERpdkVsZW1lbnQ+KFwiLm14X1Jvb21TdWJsaXN0Om5vdCgubXhfUm9vbVN1Ymxpc3RfaGlkZGVuKVwiKTtcblxuICAgICAgICAvLyBXZSB0cmFjayB3aGljaCBzdHlsZXMgd2Ugd2FudCBvbiBhIHRhcmdldCBiZWZvcmUgbWFraW5nIHRoZSBjaGFuZ2VzIHRvIGF2b2lkXG4gICAgICAgIC8vIGV4Y2Vzc2l2ZSBsYXlvdXQgdXBkYXRlcy5cbiAgICAgICAgY29uc3QgdGFyZ2V0U3R5bGVzID0gbmV3IE1hcDxIVE1MRGl2RWxlbWVudCwge1xuICAgICAgICAgICAgc3RpY2t5VG9wPzogYm9vbGVhbjtcbiAgICAgICAgICAgIHN0aWNreUJvdHRvbT86IGJvb2xlYW47XG4gICAgICAgICAgICBtYWtlSW52aXNpYmxlPzogYm9vbGVhbjtcbiAgICAgICAgfT4oKTtcblxuICAgICAgICBsZXQgbGFzdFRvcEhlYWRlcjtcbiAgICAgICAgbGV0IGZpcnN0Qm90dG9tSGVhZGVyO1xuICAgICAgICBmb3IgKGNvbnN0IHN1Ymxpc3Qgb2Ygc3VibGlzdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IHN1Ymxpc3QucXVlcnlTZWxlY3RvcjxIVE1MRGl2RWxlbWVudD4oXCIubXhfUm9vbVN1Ymxpc3Rfc3RpY2thYmxlXCIpO1xuICAgICAgICAgICAgaGVhZGVyLnN0eWxlLnJlbW92ZVByb3BlcnR5KFwiZGlzcGxheVwiKTsgLy8gYWx3YXlzIGNsZWFyIGRpc3BsYXk6bm9uZSBmaXJzdFxuXG4gICAgICAgICAgICAvLyBXaGVuIGFuIGVsZW1lbnQgaXMgPD00MCUgb2ZmIHNjcmVlbiwgbWFrZSBpdCB0YWtlIG92ZXJcbiAgICAgICAgICAgIGNvbnN0IG9mZlNjcmVlbkZhY3RvciA9IDAuNDtcbiAgICAgICAgICAgIGNvbnN0IGlzT2ZmVG9wID0gKHN1Ymxpc3Qub2Zmc2V0VG9wICsgKG9mZlNjcmVlbkZhY3RvciAqIEhFQURFUl9IRUlHSFQpKSA8PSB0b3BFZGdlO1xuICAgICAgICAgICAgY29uc3QgaXNPZmZCb3R0b20gPSAoc3VibGlzdC5vZmZzZXRUb3AgKyAob2ZmU2NyZWVuRmFjdG9yICogSEVBREVSX0hFSUdIVCkpID49IGJvdHRvbUVkZ2U7XG5cbiAgICAgICAgICAgIGlmIChpc09mZlRvcCB8fCBzdWJsaXN0ID09PSBzdWJsaXN0c1swXSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFN0eWxlcy5zZXQoaGVhZGVyLCB7IHN0aWNreVRvcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRvcEhlYWRlcikge1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9wSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U3R5bGVzLnNldChsYXN0VG9wSGVhZGVyLCB7IG1ha2VJbnZpc2libGU6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxhc3RUb3BIZWFkZXIgPSBoZWFkZXI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzT2ZmQm90dG9tICYmICFmaXJzdEJvdHRvbUhlYWRlcikge1xuICAgICAgICAgICAgICAgIHRhcmdldFN0eWxlcy5zZXQoaGVhZGVyLCB7IHN0aWNreUJvdHRvbTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBmaXJzdEJvdHRvbUhlYWRlciA9IGhlYWRlcjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U3R5bGVzLnNldChoZWFkZXIsIHt9KTsgLy8gbm90aGluZyA9PSBjbGVhclxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUnVuIG92ZXIgdGhlIHN0eWxlIGNoYW5nZXMgYW5kIG1ha2UgdGhlbSByZWFsaXR5LiBXZSBjaGVjayB0byBzZWUgaWYgd2UncmUgYWJvdXQgdG9cbiAgICAgICAgLy8gY2F1c2UgYSBuby1vcCB1cGRhdGUsIGFzIGFkZGluZy9yZW1vdmluZyBwcm9wZXJ0aWVzIHRoYXQgYXJlL2FyZW4ndCB0aGVyZSBjYXVzZVxuICAgICAgICAvLyBsYXlvdXQgdXBkYXRlcy5cbiAgICAgICAgZm9yIChjb25zdCBoZWFkZXIgb2YgdGFyZ2V0U3R5bGVzLmtleXMoKSkge1xuICAgICAgICAgICAgY29uc3Qgc3R5bGUgPSB0YXJnZXRTdHlsZXMuZ2V0KGhlYWRlcik7XG5cbiAgICAgICAgICAgIGlmIChzdHlsZS5tYWtlSW52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgLy8gd2Ugd2lsbCBoYXZlIGFscmVhZHkgcmVtb3ZlZCB0aGUgJ2Rpc3BsYXk6IG5vbmUnLCBzbyBhZGQgaXQgYmFjay5cbiAgICAgICAgICAgICAgICBoZWFkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBub3RoaW5nIGVsc2UgdG8gZG8sIGV2ZW4gaWYgc3RpY2t5IHNvbWVob3dcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0eWxlLnN0aWNreVRvcCkge1xuICAgICAgICAgICAgICAgIGlmICghaGVhZGVyLmNsYXNzTGlzdC5jb250YWlucyhcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lUb3BcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5VG9wXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RvcCA9IGAke2xpc3QucGFyZW50RWxlbWVudC5vZmZzZXRUb3B9cHhgO1xuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIuc3R5bGUudG9wICE9PSBuZXdUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLnN0eWxlLnRvcCA9IG5ld1RvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVRvcFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZShcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lUb3BcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIuc3R5bGUudG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgndG9wJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3R5bGUuc3RpY2t5Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoZWFkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreUJvdHRvbVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LmFkZChcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lCb3R0b21cIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gVUlTdG9yZS5pbnN0YW5jZS53aW5kb3dIZWlnaHQgLVxuICAgICAgICAgICAgICAgICAgICAobGlzdC5wYXJlbnRFbGVtZW50Lm9mZnNldFRvcCArIGxpc3QucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0JvdHRvbSA9IGAke29mZnNldH1weGA7XG4gICAgICAgICAgICAgICAgaWYgKGhlYWRlci5zdHlsZS5ib3R0b20gIT09IG5ld0JvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuc3R5bGUuYm90dG9tID0gbmV3Qm90dG9tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGhlYWRlci5jbGFzc0xpc3QuY29udGFpbnMoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5Qm90dG9tXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreUJvdHRvbVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGhlYWRlci5zdHlsZS5ib3R0b20pIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdib3R0b20nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdHlsZS5zdGlja3lUb3AgfHwgc3R5bGUuc3RpY2t5Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoZWFkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LmFkZChcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdERpbWVuc2lvbnMgPSBVSVN0b3JlLmluc3RhbmNlLmdldEVsZW1lbnREaW1lbnNpb25zKFwiTGlzdENvbnRhaW5lclwiKTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdERpbWVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyUmlnaHRNYXJnaW4gPSAxNTsgLy8gY2FsY3VsYXRlZCBmcm9tIG1hcmdpbnMgYW5kIHdpZHRocyB0byBhbGlnbiB3aXRoIG5vbi1zdGlja3kgdGlsZXNcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyU3RpY2t5V2lkdGggPSBsaXN0RGltZW5zaW9ucy53aWR0aCAtIGhlYWRlclJpZ2h0TWFyZ2luO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdXaWR0aCA9IGAke2hlYWRlclN0aWNreVdpZHRofXB4YDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhlYWRlci5zdHlsZS53aWR0aCAhPT0gbmV3V2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlci5zdHlsZS53aWR0aCA9IG5ld1dpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghc3R5bGUuc3RpY2t5VG9wICYmICFzdHlsZS5zdGlja3lCb3R0b20pIHtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLmNsYXNzTGlzdC5jb250YWlucyhcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5XCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIuc3R5bGUud2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLnN0eWxlLnJlbW92ZVByb3BlcnR5KCd3aWR0aCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBhcHByb3ByaWF0ZSBzdGlja3kgY2xhc3NlcyB0byB3cmFwcGVyIHNvIGl0IGhhc1xuICAgICAgICAvLyB0aGUgbmVjZXNzYXJ5IHRvcC9ib3R0b20gcGFkZGluZyB0byBwdXQgdGhlIHN0aWNreSBoZWFkZXIgaW5cbiAgICAgICAgY29uc3QgbGlzdFdyYXBwZXIgPSBsaXN0LnBhcmVudEVsZW1lbnQ7IC8vIC5teF9MZWZ0UGFuZWxfcm9vbUxpc3RXcmFwcGVyXG4gICAgICAgIGlmIChsYXN0VG9wSGVhZGVyKSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QuYWRkKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lUb3BcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lUb3BcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpcnN0Qm90dG9tSGVhZGVyKSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QuYWRkKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lCb3R0b21cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lCb3R0b21cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2Nyb2xsID0gKGV2OiBFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBsaXN0ID0gZXYudGFyZ2V0IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICB0aGlzLmhhbmRsZVN0aWNreUhlYWRlcnMobGlzdCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Gb2N1cyA9IChldjogUmVhY3QuRm9jdXNFdmVudCkgPT4ge1xuICAgICAgICB0aGlzLmZvY3VzZWRFbGVtZW50ID0gZXYudGFyZ2V0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQmx1ciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5mb2N1c2VkRWxlbWVudCA9IG51bGw7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50LCBzdGF0ZT86IElSb3ZpbmdUYWJJbmRleFN0YXRlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5mb2N1c2VkRWxlbWVudCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldFJvb21MaXN0QWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5OZXh0Um9vbTpcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb21MaXN0UmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyQnJlYWRjcnVtYnMoKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd0JyZWFkY3J1bWJzID09PSBCcmVhZGNydW1ic01vZGUuTGVnYWN5ICYmICF0aGlzLnByb3BzLmlzTWluaW1pemVkKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxJbmRpY2F0b3JTY3JvbGxiYXJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTGVmdFBhbmVsX2JyZWFkY3J1bWJzQ29udGFpbmVyIG14X0F1dG9IaWRlU2Nyb2xsYmFyXCJcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxTY3JvbGxzSG9yaXpvbnRhbGx5PXt0cnVlfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFJvb21CcmVhZGNydW1icyAvPlxuICAgICAgICAgICAgICAgIDwvSW5kaWNhdG9yU2Nyb2xsYmFyPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyU2VhcmNoRGlhbEV4cGxvcmUoKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAgICAgbGV0IGRpYWxQYWRCdXR0b24gPSBudWxsO1xuXG4gICAgICAgIC8vIElmIHdlIGhhdmUgZGlhbGVyIHN1cHBvcnQsIHNob3cgYSBidXR0b24gdG8gYnJpbmcgdXAgdGhlIGRpYWwgcGFkXG4gICAgICAgIC8vIHRvIHN0YXJ0IGEgbmV3IGNhbGxcbiAgICAgICAgaWYgKExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLmdldFN1cHBvcnRzUHN0blByb3RvY29sKCkpIHtcbiAgICAgICAgICAgIGRpYWxQYWRCdXR0b24gPVxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9MZWZ0UGFuZWxfZGlhbFBhZEJ1dHRvblwiLCB7fSl9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25EaWFsUGFkfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJPcGVuIGRpYWwgcGFkXCIpfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJpZ2h0QnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd0JyZWFkY3J1bWJzID09PSBCcmVhZGNydW1ic01vZGUuTGFicykge1xuICAgICAgICAgICAgcmlnaHRCdXR0b24gPSA8UmVjZW50bHlWaWV3ZWRCdXR0b24gLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5hY3RpdmVTcGFjZSA9PT0gTWV0YVNwYWNlLkhvbWUgJiYgc2hvdWxkU2hvd0NvbXBvbmVudChVSUNvbXBvbmVudC5FeHBsb3JlUm9vbXMpKSB7XG4gICAgICAgICAgICByaWdodEJ1dHRvbiA9IDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xlZnRQYW5lbF9leHBsb3JlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRXhwbG9yZX1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJFeHBsb3JlIHJvb21zXCIpfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xlZnRQYW5lbF9maWx0ZXJDb250YWluZXJcIlxuICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25CbHVyfVxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFJvb21TZWFyY2ggaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWR9IC8+XG5cbiAgICAgICAgICAgICAgICB7IGRpYWxQYWRCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgcmlnaHRCdXR0b24gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICBjb25zdCByb29tTGlzdCA9IDxSb29tTGlzdFxuICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgb25Gb2N1cz17dGhpcy5vbkZvY3VzfVxuICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uQmx1cn1cbiAgICAgICAgICAgIGlzTWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgYWN0aXZlU3BhY2U9e3RoaXMuc3RhdGUuYWN0aXZlU3BhY2V9XG4gICAgICAgICAgICBvblJlc2l6ZT17dGhpcy5yZWZyZXNoU3RpY2t5SGVhZGVyc31cbiAgICAgICAgICAgIG9uTGlzdENvbGxhcHNlPXt0aGlzLnJlZnJlc2hTdGlja3lIZWFkZXJzfVxuICAgICAgICAgICAgcmVmPXt0aGlzLnJvb21MaXN0UmVmfVxuICAgICAgICAvPjtcblxuICAgICAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBcIm14X0xlZnRQYW5lbFwiOiB0cnVlLFxuICAgICAgICAgICAgXCJteF9MZWZ0UGFuZWxfbWluaW1pemVkXCI6IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJvb21MaXN0Q2xhc3NlcyA9IGNsYXNzTmFtZXMoXG4gICAgICAgICAgICBcIm14X0xlZnRQYW5lbF9hY3R1YWxSb29tTGlzdENvbnRhaW5lclwiLFxuICAgICAgICAgICAgXCJteF9BdXRvSGlkZVNjcm9sbGJhclwiLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y29udGFpbmVyQ2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfcm9vbUxpc3RDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlclNlYXJjaERpYWxFeHBsb3JlKCkgfVxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQnJlYWRjcnVtYnMoKSB9XG4gICAgICAgICAgICAgICAgICAgIHsgIXRoaXMucHJvcHMuaXNNaW5pbWl6ZWQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21MaXN0SGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WaXNpYmlsaXR5Q2hhbmdlPXt0aGlzLnJlZnJlc2hTdGlja3lIZWFkZXJzfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDxVc2VyT25ib2FyZGluZ0J1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3RoaXMucHJvcHMucGFnZVR5cGUgPT09IFBhZ2VUeXBlLkhvbWVQYWdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZnRQYW5lbF9yb29tTGlzdFdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3Jvb21MaXN0Q2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMubGlzdENvbnRhaW5lclJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94IHNvbWV0aW1lcyBtYWtlcyB0aGlzIGVsZW1lbnQgZm9jdXNhYmxlIGR1ZSB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG92ZXJmbG93OnNjcm9sbDssIHNvIGZvcmNlIGl0IG91dCBvZiB0YWIgb3JkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcm9vbUxpc3QgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7O0FBaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQTBDS0EsZTs7V0FBQUEsZTtFQUFBQSxlLENBQUFBLGU7RUFBQUEsZSxDQUFBQSxlO0VBQUFBLGUsQ0FBQUEsZTtHQUFBQSxlLEtBQUFBLGU7O0FBV1UsTUFBTUMsU0FBTixTQUF3QkMsS0FBSyxDQUFDQyxTQUE5QixDQUF3RDtFQU1uRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIscUVBTEEsSUFBQUMsZUFBQSxHQUtBO0lBQUEsZ0VBSkwsSUFBQUEsZUFBQSxHQUlLO0lBQUEsc0RBSEYsSUFHRTtJQUFBLDREQUZJLEtBRUo7SUFBQSx5REF5Q0VDLFdBQUQsSUFBMkI7TUFDbkQsS0FBS0MsUUFBTCxDQUFjO1FBQUVEO01BQUYsQ0FBZDtJQUNILENBM0MwQjtJQUFBLGlEQTZDUCxNQUFNO01BQ3RCRSxtQkFBQSxDQUFJQyxJQUFKLENBQVNDLGVBQUEsQ0FBT0MsV0FBaEI7SUFDSCxDQS9DMEI7SUFBQSxpREFpRE5DLEVBQUQsSUFBcUI7TUFDckNKLG1CQUFBLENBQUlDLElBQUosQ0FBU0MsZUFBQSxDQUFPRyxpQkFBaEI7O01BQ0FDLHdCQUFBLENBQWdCQyxnQkFBaEIsQ0FBaUMsZ0NBQWpDLEVBQW1FSCxFQUFuRTtJQUNILENBcEQwQjtJQUFBLDREQXNESSxNQUFNO01BQ2pDLElBQUksQ0FBQyxLQUFLSSxnQkFBTCxDQUFzQkMsT0FBM0IsRUFBb0MsT0FESCxDQUNXOztNQUM1QyxLQUFLQyxtQkFBTCxDQUF5QixLQUFLRixnQkFBTCxDQUFzQkMsT0FBL0M7SUFDSCxDQXpEMEI7SUFBQSwyREEyREcsTUFBTTtNQUNoQyxNQUFNRSxNQUFNLEdBQUduQixTQUFTLENBQUNvQixlQUF6Qjs7TUFDQSxJQUFJRCxNQUFNLEtBQUssS0FBS0UsS0FBTCxDQUFXQyxlQUExQixFQUEyQztRQUN2QyxLQUFLZixRQUFMLENBQWM7VUFBRWUsZUFBZSxFQUFFSDtRQUFuQixDQUFkLEVBRHVDLENBR3ZDOztRQUNBLElBQUksQ0FBQyxLQUFLSCxnQkFBTCxDQUFzQkMsT0FBM0IsRUFBb0MsT0FKRyxDQUlLOztRQUM1QyxLQUFLQyxtQkFBTCxDQUF5QixLQUFLRixnQkFBTCxDQUFzQkMsT0FBL0M7TUFDSDtJQUNKLENBcEUwQjtJQUFBLGdEQWdOUEwsRUFBRCxJQUFlO01BQzlCLE1BQU1XLElBQUksR0FBR1gsRUFBRSxDQUFDWSxNQUFoQjtNQUNBLEtBQUtOLG1CQUFMLENBQXlCSyxJQUF6QjtJQUNILENBbk4wQjtJQUFBLCtDQXFOUlgsRUFBRCxJQUEwQjtNQUN4QyxLQUFLYSxjQUFMLEdBQXNCYixFQUFFLENBQUNZLE1BQXpCO0lBQ0gsQ0F2TjBCO0lBQUEsOENBeU5WLE1BQU07TUFDbkIsS0FBS0MsY0FBTCxHQUFzQixJQUF0QjtJQUNILENBM04wQjtJQUFBLGlEQTZOUCxDQUFDYixFQUFELEVBQTBCUyxLQUExQixLQUEyRDtNQUMzRSxJQUFJLENBQUMsS0FBS0ksY0FBVixFQUEwQjtNQUUxQixNQUFNQyxNQUFNLEdBQUcsSUFBQUMseUNBQUEsSUFBd0JDLGlCQUF4QixDQUEwQ2hCLEVBQTFDLENBQWY7O01BQ0EsUUFBUWMsTUFBUjtRQUNJLEtBQUtHLG1DQUFBLENBQWlCQyxRQUF0QjtVQUNJLElBQUksQ0FBQ1QsS0FBTCxFQUFZO1lBQ1JULEVBQUUsQ0FBQ21CLGVBQUg7WUFDQW5CLEVBQUUsQ0FBQ29CLGNBQUg7WUFDQSxLQUFLQyxXQUFMLENBQWlCaEIsT0FBakIsRUFBMEJpQixLQUExQjtVQUNIOztVQUNEO01BUFI7SUFTSCxDQTFPMEI7SUFHdkIsS0FBS2IsS0FBTCxHQUFhO01BQ1RmLFdBQVcsRUFBRTZCLG1CQUFBLENBQVdDLFFBQVgsQ0FBb0I5QixXQUR4QjtNQUVUZ0IsZUFBZSxFQUFFdEIsU0FBUyxDQUFDb0I7SUFGbEIsQ0FBYjs7SUFLQWlCLGtDQUFBLENBQWlCRCxRQUFqQixDQUEwQkUsRUFBMUIsQ0FBNkJDLHdCQUE3QixFQUEyQyxLQUFLQyxtQkFBaEQ7O0lBQ0FDLHNCQUFBLENBQWNMLFFBQWQsQ0FBdUJFLEVBQXZCLENBQTBCSSxpQ0FBMUIsRUFBOEMsS0FBS0YsbUJBQW5EOztJQUNBTCxtQkFBQSxDQUFXQyxRQUFYLENBQW9CRSxFQUFwQixDQUF1QkssNkJBQXZCLEVBQThDLEtBQUtDLGlCQUFuRDtFQUNIOztFQUVpQyxXQUFmeEIsZUFBZSxHQUFvQjtJQUNsRCxJQUFJLENBQUNpQixrQ0FBQSxDQUFpQkQsUUFBakIsQ0FBMEJTLE9BQS9CLEVBQXdDLE9BQU85QyxlQUFlLENBQUMrQyxRQUF2QjtJQUN4QyxPQUFPQyxzQkFBQSxDQUFjQyxRQUFkLENBQXVCLHdCQUF2QixJQUFtRGpELGVBQWUsQ0FBQ2tELElBQW5FLEdBQTBFbEQsZUFBZSxDQUFDbUQsTUFBakc7RUFDSDs7RUFFTUMsaUJBQWlCLEdBQUc7SUFDdkJDLGdCQUFBLENBQVFoQixRQUFSLENBQWlCaUIsc0JBQWpCLENBQXdDLGVBQXhDLEVBQXlELEtBQUtyQyxnQkFBTCxDQUFzQkMsT0FBL0U7O0lBQ0FtQyxnQkFBQSxDQUFRaEIsUUFBUixDQUFpQkUsRUFBakIsQ0FBb0IsZUFBcEIsRUFBcUMsS0FBS2dCLG9CQUExQyxFQUZ1QixDQUd2QjtJQUNBOzs7SUFDQSxLQUFLdEMsZ0JBQUwsQ0FBc0JDLE9BQXRCLEVBQStCc0MsZ0JBQS9CLENBQWdELFFBQWhELEVBQTBELEtBQUtDLFFBQS9ELEVBQXlFO01BQUVDLE9BQU8sRUFBRTtJQUFYLENBQXpFO0VBQ0g7O0VBRU1DLG9CQUFvQixHQUFHO0lBQzFCckIsa0NBQUEsQ0FBaUJELFFBQWpCLENBQTBCdUIsR0FBMUIsQ0FBOEJwQix3QkFBOUIsRUFBNEMsS0FBS0MsbUJBQWpEOztJQUNBQyxzQkFBQSxDQUFjTCxRQUFkLENBQXVCdUIsR0FBdkIsQ0FBMkJqQixpQ0FBM0IsRUFBK0MsS0FBS0YsbUJBQXBEOztJQUNBTCxtQkFBQSxDQUFXQyxRQUFYLENBQW9CdUIsR0FBcEIsQ0FBd0JoQiw2QkFBeEIsRUFBK0MsS0FBS0MsaUJBQXBEOztJQUNBUSxnQkFBQSxDQUFRaEIsUUFBUixDQUFpQndCLDZCQUFqQixDQUErQyxlQUEvQzs7SUFDQVIsZ0JBQUEsQ0FBUWhCLFFBQVIsQ0FBaUJ5QixjQUFqQixDQUFnQyxlQUFoQyxFQUFpRCxLQUFLUCxvQkFBdEQ7O0lBQ0EsS0FBS3RDLGdCQUFMLENBQXNCQyxPQUF0QixFQUErQjZDLG1CQUEvQixDQUFtRCxRQUFuRCxFQUE2RCxLQUFLTixRQUFsRTtFQUNIOztFQUVNTyxrQkFBa0IsQ0FBQ0MsU0FBRCxFQUFvQkMsU0FBcEIsRUFBNkM7SUFDbEUsSUFBSUEsU0FBUyxDQUFDM0QsV0FBVixLQUEwQixLQUFLZSxLQUFMLENBQVdmLFdBQXpDLEVBQXNEO01BQ2xELEtBQUtnRCxvQkFBTDtJQUNIO0VBQ0o7O0VBK0JPcEMsbUJBQW1CLENBQUNLLElBQUQsRUFBdUI7SUFDOUMsSUFBSSxLQUFLMkMsb0JBQVQsRUFBK0I7SUFDL0IsS0FBS0Esb0JBQUwsR0FBNEIsSUFBNUI7SUFDQUMsTUFBTSxDQUFDQyxxQkFBUCxDQUE2QixNQUFNO01BQy9CLEtBQUtDLGVBQUwsQ0FBcUI5QyxJQUFyQjtNQUNBLEtBQUsyQyxvQkFBTCxHQUE0QixLQUE1QjtJQUNILENBSEQ7RUFJSDs7RUFFT0csZUFBZSxDQUFDOUMsSUFBRCxFQUF1QjtJQUMxQyxNQUFNK0MsT0FBTyxHQUFHL0MsSUFBSSxDQUFDZ0QsU0FBckI7SUFDQSxNQUFNQyxVQUFVLEdBQUdqRCxJQUFJLENBQUNrRCxZQUFMLEdBQW9CbEQsSUFBSSxDQUFDZ0QsU0FBNUM7SUFDQSxNQUFNRyxRQUFRLEdBQUduRCxJQUFJLENBQUNvRCxnQkFBTCxDQUFzQyw2Q0FBdEMsQ0FBakIsQ0FIMEMsQ0FLMUM7SUFDQTs7SUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSUMsR0FBSixFQUFyQjtJQU1BLElBQUlDLGFBQUo7SUFDQSxJQUFJQyxpQkFBSjs7SUFDQSxLQUFLLE1BQU1DLE9BQVgsSUFBc0JOLFFBQXRCLEVBQWdDO01BQzVCLE1BQU1PLE1BQU0sR0FBR0QsT0FBTyxDQUFDRSxhQUFSLENBQXNDLDJCQUF0QyxDQUFmO01BQ0FELE1BQU0sQ0FBQ0UsS0FBUCxDQUFhQyxjQUFiLENBQTRCLFNBQTVCLEVBRjRCLENBRVk7TUFFeEM7O01BQ0EsTUFBTUMsZUFBZSxHQUFHLEdBQXhCO01BQ0EsTUFBTUMsUUFBUSxHQUFJTixPQUFPLENBQUNPLFNBQVIsR0FBcUJGLGVBQWUsR0FBR0csMEJBQXhDLElBQTJEbEIsT0FBNUU7TUFDQSxNQUFNbUIsV0FBVyxHQUFJVCxPQUFPLENBQUNPLFNBQVIsR0FBcUJGLGVBQWUsR0FBR0csMEJBQXhDLElBQTJEaEIsVUFBL0U7O01BRUEsSUFBSWMsUUFBUSxJQUFJTixPQUFPLEtBQUtOLFFBQVEsQ0FBQyxDQUFELENBQXBDLEVBQXlDO1FBQ3JDRSxZQUFZLENBQUNjLEdBQWIsQ0FBaUJULE1BQWpCLEVBQXlCO1VBQUVVLFNBQVMsRUFBRTtRQUFiLENBQXpCOztRQUNBLElBQUliLGFBQUosRUFBbUI7VUFDZkEsYUFBYSxDQUFDSyxLQUFkLENBQW9CUyxPQUFwQixHQUE4QixNQUE5QjtVQUNBaEIsWUFBWSxDQUFDYyxHQUFiLENBQWlCWixhQUFqQixFQUFnQztZQUFFZSxhQUFhLEVBQUU7VUFBakIsQ0FBaEM7UUFDSDs7UUFDRGYsYUFBYSxHQUFHRyxNQUFoQjtNQUNILENBUEQsTUFPTyxJQUFJUSxXQUFXLElBQUksQ0FBQ1YsaUJBQXBCLEVBQXVDO1FBQzFDSCxZQUFZLENBQUNjLEdBQWIsQ0FBaUJULE1BQWpCLEVBQXlCO1VBQUVhLFlBQVksRUFBRTtRQUFoQixDQUF6QjtRQUNBZixpQkFBaUIsR0FBR0UsTUFBcEI7TUFDSCxDQUhNLE1BR0E7UUFDSEwsWUFBWSxDQUFDYyxHQUFiLENBQWlCVCxNQUFqQixFQUF5QixFQUF6QixFQURHLENBQzJCO01BQ2pDO0lBQ0osQ0FyQ3lDLENBdUMxQztJQUNBO0lBQ0E7OztJQUNBLEtBQUssTUFBTUEsTUFBWCxJQUFxQkwsWUFBWSxDQUFDbUIsSUFBYixFQUFyQixFQUEwQztNQUN0QyxNQUFNWixLQUFLLEdBQUdQLFlBQVksQ0FBQ29CLEdBQWIsQ0FBaUJmLE1BQWpCLENBQWQ7O01BRUEsSUFBSUUsS0FBSyxDQUFDVSxhQUFWLEVBQXlCO1FBQ3JCO1FBQ0FaLE1BQU0sQ0FBQ0UsS0FBUCxDQUFhUyxPQUFiLEdBQXVCLE1BQXZCO1FBQ0EsU0FIcUIsQ0FHWDtNQUNiOztNQUVELElBQUlULEtBQUssQ0FBQ1EsU0FBVixFQUFxQjtRQUNqQixJQUFJLENBQUNWLE1BQU0sQ0FBQ2dCLFNBQVAsQ0FBaUJDLFFBQWpCLENBQTBCLDBDQUExQixDQUFMLEVBQTRFO1VBQ3hFakIsTUFBTSxDQUFDZ0IsU0FBUCxDQUFpQkUsR0FBakIsQ0FBcUIsMENBQXJCO1FBQ0g7O1FBRUQsTUFBTUMsTUFBTSxHQUFJLEdBQUU3RSxJQUFJLENBQUM4RSxhQUFMLENBQW1CZCxTQUFVLElBQS9DOztRQUNBLElBQUlOLE1BQU0sQ0FBQ0UsS0FBUCxDQUFhbUIsR0FBYixLQUFxQkYsTUFBekIsRUFBaUM7VUFDN0JuQixNQUFNLENBQUNFLEtBQVAsQ0FBYW1CLEdBQWIsR0FBbUJGLE1BQW5CO1FBQ0g7TUFDSixDQVRELE1BU087UUFDSCxJQUFJbkIsTUFBTSxDQUFDZ0IsU0FBUCxDQUFpQkMsUUFBakIsQ0FBMEIsMENBQTFCLENBQUosRUFBMkU7VUFDdkVqQixNQUFNLENBQUNnQixTQUFQLENBQWlCTSxNQUFqQixDQUF3QiwwQ0FBeEI7UUFDSDs7UUFDRCxJQUFJdEIsTUFBTSxDQUFDRSxLQUFQLENBQWFtQixHQUFqQixFQUFzQjtVQUNsQnJCLE1BQU0sQ0FBQ0UsS0FBUCxDQUFhQyxjQUFiLENBQTRCLEtBQTVCO1FBQ0g7TUFDSjs7TUFFRCxJQUFJRCxLQUFLLENBQUNXLFlBQVYsRUFBd0I7UUFDcEIsSUFBSSxDQUFDYixNQUFNLENBQUNnQixTQUFQLENBQWlCQyxRQUFqQixDQUEwQiw2Q0FBMUIsQ0FBTCxFQUErRTtVQUMzRWpCLE1BQU0sQ0FBQ2dCLFNBQVAsQ0FBaUJFLEdBQWpCLENBQXFCLDZDQUFyQjtRQUNIOztRQUVELE1BQU1LLE1BQU0sR0FBR3BELGdCQUFBLENBQVFoQixRQUFSLENBQWlCcUUsWUFBakIsSUFDVmxGLElBQUksQ0FBQzhFLGFBQUwsQ0FBbUJkLFNBQW5CLEdBQStCaEUsSUFBSSxDQUFDOEUsYUFBTCxDQUFtQjVCLFlBRHhDLENBQWY7UUFFQSxNQUFNaUMsU0FBUyxHQUFJLEdBQUVGLE1BQU8sSUFBNUI7O1FBQ0EsSUFBSXZCLE1BQU0sQ0FBQ0UsS0FBUCxDQUFhd0IsTUFBYixLQUF3QkQsU0FBNUIsRUFBdUM7VUFDbkN6QixNQUFNLENBQUNFLEtBQVAsQ0FBYXdCLE1BQWIsR0FBc0JELFNBQXRCO1FBQ0g7TUFDSixDQVhELE1BV087UUFDSCxJQUFJekIsTUFBTSxDQUFDZ0IsU0FBUCxDQUFpQkMsUUFBakIsQ0FBMEIsNkNBQTFCLENBQUosRUFBOEU7VUFDMUVqQixNQUFNLENBQUNnQixTQUFQLENBQWlCTSxNQUFqQixDQUF3Qiw2Q0FBeEI7UUFDSDs7UUFDRCxJQUFJdEIsTUFBTSxDQUFDRSxLQUFQLENBQWF3QixNQUFqQixFQUF5QjtVQUNyQjFCLE1BQU0sQ0FBQ0UsS0FBUCxDQUFhQyxjQUFiLENBQTRCLFFBQTVCO1FBQ0g7TUFDSjs7TUFFRCxJQUFJRCxLQUFLLENBQUNRLFNBQU4sSUFBbUJSLEtBQUssQ0FBQ1csWUFBN0IsRUFBMkM7UUFDdkMsSUFBSSxDQUFDYixNQUFNLENBQUNnQixTQUFQLENBQWlCQyxRQUFqQixDQUEwQix1Q0FBMUIsQ0FBTCxFQUF5RTtVQUNyRWpCLE1BQU0sQ0FBQ2dCLFNBQVAsQ0FBaUJFLEdBQWpCLENBQXFCLHVDQUFyQjtRQUNIOztRQUVELE1BQU1TLGNBQWMsR0FBR3hELGdCQUFBLENBQVFoQixRQUFSLENBQWlCeUUsb0JBQWpCLENBQXNDLGVBQXRDLENBQXZCOztRQUNBLElBQUlELGNBQUosRUFBb0I7VUFDaEIsTUFBTUUsaUJBQWlCLEdBQUcsRUFBMUIsQ0FEZ0IsQ0FDYzs7VUFDOUIsTUFBTUMsaUJBQWlCLEdBQUdILGNBQWMsQ0FBQ0ksS0FBZixHQUF1QkYsaUJBQWpEO1VBQ0EsTUFBTUcsUUFBUSxHQUFJLEdBQUVGLGlCQUFrQixJQUF0Qzs7VUFDQSxJQUFJOUIsTUFBTSxDQUFDRSxLQUFQLENBQWE2QixLQUFiLEtBQXVCQyxRQUEzQixFQUFxQztZQUNqQ2hDLE1BQU0sQ0FBQ0UsS0FBUCxDQUFhNkIsS0FBYixHQUFxQkMsUUFBckI7VUFDSDtRQUNKO01BQ0osQ0FkRCxNQWNPLElBQUksQ0FBQzlCLEtBQUssQ0FBQ1EsU0FBUCxJQUFvQixDQUFDUixLQUFLLENBQUNXLFlBQS9CLEVBQTZDO1FBQ2hELElBQUliLE1BQU0sQ0FBQ2dCLFNBQVAsQ0FBaUJDLFFBQWpCLENBQTBCLHVDQUExQixDQUFKLEVBQXdFO1VBQ3BFakIsTUFBTSxDQUFDZ0IsU0FBUCxDQUFpQk0sTUFBakIsQ0FBd0IsdUNBQXhCO1FBQ0g7O1FBRUQsSUFBSXRCLE1BQU0sQ0FBQ0UsS0FBUCxDQUFhNkIsS0FBakIsRUFBd0I7VUFDcEIvQixNQUFNLENBQUNFLEtBQVAsQ0FBYUMsY0FBYixDQUE0QixPQUE1QjtRQUNIO01BQ0o7SUFDSixDQWhIeUMsQ0FrSDFDO0lBQ0E7OztJQUNBLE1BQU04QixXQUFXLEdBQUczRixJQUFJLENBQUM4RSxhQUF6QixDQXBIMEMsQ0FvSEY7O0lBQ3hDLElBQUl2QixhQUFKLEVBQW1CO01BQ2ZvQyxXQUFXLENBQUNqQixTQUFaLENBQXNCRSxHQUF0QixDQUEwQix3Q0FBMUI7SUFDSCxDQUZELE1BRU87TUFDSGUsV0FBVyxDQUFDakIsU0FBWixDQUFzQk0sTUFBdEIsQ0FBNkIsd0NBQTdCO0lBQ0g7O0lBQ0QsSUFBSXhCLGlCQUFKLEVBQXVCO01BQ25CbUMsV0FBVyxDQUFDakIsU0FBWixDQUFzQkUsR0FBdEIsQ0FBMEIsMkNBQTFCO0lBQ0gsQ0FGRCxNQUVPO01BQ0hlLFdBQVcsQ0FBQ2pCLFNBQVosQ0FBc0JNLE1BQXRCLENBQTZCLDJDQUE3QjtJQUNIO0VBQ0o7O0VBOEJPWSxpQkFBaUIsR0FBb0I7SUFDekMsSUFBSSxLQUFLOUYsS0FBTCxDQUFXQyxlQUFYLEtBQStCdkIsZUFBZSxDQUFDbUQsTUFBL0MsSUFBeUQsQ0FBQyxLQUFLOUMsS0FBTCxDQUFXZ0gsV0FBekUsRUFBc0Y7TUFDbEYsb0JBQ0ksb0JBQUMsMkJBQUQ7UUFDSSxTQUFTLEVBQUMsd0RBRGQ7UUFFSSwyQkFBMkIsRUFBRTtNQUZqQyxnQkFJSSxvQkFBQyx3QkFBRCxPQUpKLENBREo7SUFRSDtFQUNKOztFQUVPQyx1QkFBdUIsR0FBb0I7SUFDL0MsSUFBSUMsYUFBYSxHQUFHLElBQXBCLENBRCtDLENBRy9DO0lBQ0E7O0lBQ0EsSUFBSUMsMEJBQUEsQ0FBa0JuRixRQUFsQixDQUEyQm9GLHVCQUEzQixFQUFKLEVBQTBEO01BQ3RERixhQUFhLGdCQUNULG9CQUFDLGdDQUFEO1FBQ0ksU0FBUyxFQUFFLElBQUFHLG1CQUFBLEVBQVcsNEJBQVgsRUFBeUMsRUFBekMsQ0FEZjtRQUVJLE9BQU8sRUFBRSxLQUFLQyxTQUZsQjtRQUdJLEtBQUssRUFBRSxJQUFBQyxtQkFBQSxFQUFHLGVBQUg7TUFIWCxFQURKO0lBTUg7O0lBRUQsSUFBSUMsV0FBSjs7SUFDQSxJQUFJLEtBQUt2RyxLQUFMLENBQVdDLGVBQVgsS0FBK0J2QixlQUFlLENBQUNrRCxJQUFuRCxFQUF5RDtNQUNyRDJFLFdBQVcsZ0JBQUcsb0JBQUMsNkJBQUQsT0FBZDtJQUNILENBRkQsTUFFTyxJQUFJLEtBQUt2RyxLQUFMLENBQVdmLFdBQVgsS0FBMkJ1SCxpQkFBQSxDQUFVQyxJQUFyQyxJQUE2QyxJQUFBQyxpQ0FBQSxFQUFvQkMsc0JBQUEsQ0FBWUMsWUFBaEMsQ0FBakQsRUFBZ0c7TUFDbkdMLFdBQVcsZ0JBQUcsb0JBQUMsZ0NBQUQ7UUFDVixTQUFTLEVBQUMsNEJBREE7UUFFVixPQUFPLEVBQUUsS0FBS00sU0FGSjtRQUdWLEtBQUssRUFBRSxJQUFBUCxtQkFBQSxFQUFHLGVBQUg7TUFIRyxFQUFkO0lBS0g7O0lBRUQsb0JBQ0k7TUFDSSxTQUFTLEVBQUMsOEJBRGQ7TUFFSSxPQUFPLEVBQUUsS0FBS1EsT0FGbEI7TUFHSSxNQUFNLEVBQUUsS0FBS0MsTUFIakI7TUFJSSxTQUFTLEVBQUUsS0FBS0M7SUFKcEIsZ0JBTUksb0JBQUMsbUJBQUQ7TUFBWSxXQUFXLEVBQUUsS0FBS2pJLEtBQUwsQ0FBV2dIO0lBQXBDLEVBTkosRUFRTUUsYUFSTixFQVNNTSxXQVROLENBREo7RUFhSDs7RUFFTVUsTUFBTSxHQUFvQjtJQUM3QixNQUFNQyxRQUFRLGdCQUFHLG9CQUFDLGlCQUFEO01BQ2IsU0FBUyxFQUFFLEtBQUtGLFNBREg7TUFFYixjQUFjLEVBQUUsS0FBS2pJLEtBQUwsQ0FBV29JLGNBRmQ7TUFHYixPQUFPLEVBQUUsS0FBS0wsT0FIRDtNQUliLE1BQU0sRUFBRSxLQUFLQyxNQUpBO01BS2IsV0FBVyxFQUFFLEtBQUtoSSxLQUFMLENBQVdnSCxXQUxYO01BTWIsV0FBVyxFQUFFLEtBQUsvRixLQUFMLENBQVdmLFdBTlg7TUFPYixRQUFRLEVBQUUsS0FBS2dELG9CQVBGO01BUWIsY0FBYyxFQUFFLEtBQUtBLG9CQVJSO01BU2IsR0FBRyxFQUFFLEtBQUtyQjtJQVRHLEVBQWpCO0lBWUEsTUFBTXdHLGdCQUFnQixHQUFHLElBQUFoQixtQkFBQSxFQUFXO01BQ2hDLGdCQUFnQixJQURnQjtNQUVoQywwQkFBMEIsS0FBS3JILEtBQUwsQ0FBV2dIO0lBRkwsQ0FBWCxDQUF6QjtJQUtBLE1BQU1zQixlQUFlLEdBQUcsSUFBQWpCLG1CQUFBLEVBQ3BCLHNDQURvQixFQUVwQixzQkFGb0IsQ0FBeEI7SUFLQSxvQkFDSTtNQUFLLFNBQVMsRUFBRWdCO0lBQWhCLGdCQUNJO01BQUssU0FBUyxFQUFDO0lBQWYsR0FDTSxLQUFLcEIsdUJBQUwsRUFETixFQUVNLEtBQUtGLGlCQUFMLEVBRk4sRUFHTSxDQUFDLEtBQUsvRyxLQUFMLENBQVdnSCxXQUFaLGlCQUNFLG9CQUFDLHVCQUFEO01BQ0ksa0JBQWtCLEVBQUUsS0FBSzlEO0lBRDdCLEVBSlIsZUFRSSxvQkFBQywwQ0FBRDtNQUNJLFFBQVEsRUFBRSxLQUFLbEQsS0FBTCxDQUFXdUksUUFBWCxLQUF3QkMsa0JBQUEsQ0FBU0MsUUFEL0M7TUFFSSxTQUFTLEVBQUUsS0FBS3pJLEtBQUwsQ0FBV2dIO0lBRjFCLEVBUkosZUFZSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJO01BQ0ksU0FBUyxFQUFFc0IsZUFEZjtNQUVJLEdBQUcsRUFBRSxLQUFLMUgsZ0JBRmQsQ0FHSTtNQUNBO01BSko7TUFLSSxRQUFRLEVBQUUsQ0FBQztJQUxmLEdBT011SCxRQVBOLENBREosQ0FaSixDQURKLENBREo7RUE0Qkg7O0FBMVZrRSJ9