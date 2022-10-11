"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultSpacesRenderer = exports.defaultRoomsRenderer = exports.defaultDmsRenderer = exports.default = exports.SubspaceSelector = exports.Entry = exports.AddExistingToSpace = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _utils = require("matrix-js-sdk/src/utils");

var _event = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _Dropdown = _interopRequireDefault(require("../elements/Dropdown"));

var _SearchBox = _interopRequireDefault(require("../../structures/SearchBox"));

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _Rooms = require("../../../Rooms");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _RecentAlgorithm = require("../../../stores/room-list/algorithms/tag-sorting/RecentAlgorithm");

var _ProgressBar = _interopRequireDefault(require("../elements/ProgressBar"));

var _DecoratedRoomAvatar = _interopRequireDefault(require("../avatars/DecoratedRoomAvatar"));

var _QueryMatcher = _interopRequireDefault(require("../../../autocomplete/QueryMatcher"));

var _LazyRenderList = _interopRequireDefault(require("../elements/LazyRenderList"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
// These values match CSS
const ROW_HEIGHT = 32 + 12;
const HEADER_HEIGHT = 15;
const GROUP_MARGIN = 24;

const Entry = _ref => {
  let {
    room,
    checked,
    onChange
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("label", {
    className: "mx_AddExistingToSpace_entry"
  }, room?.isSpaceRoom() ? /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
    room: room,
    height: 32,
    width: 32
  }) : /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
    room: room,
    avatarSize: 32
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_AddExistingToSpace_entry_name"
  }, room.name), /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
    onChange: onChange ? e => onChange(e.target.checked) : null,
    checked: checked,
    disabled: !onChange
  }));
};

exports.Entry = Entry;

const getScrollState = function (_ref2, numItems) {
  let {
    scrollTop,
    height
  } = _ref2;
  let heightBefore = 0;

  for (var _len = arguments.length, prevGroupSizes = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    prevGroupSizes[_key - 2] = arguments[_key];
  }

  prevGroupSizes.forEach(size => {
    heightBefore += GROUP_MARGIN + HEADER_HEIGHT + size * ROW_HEIGHT;
  });
  const viewportTop = scrollTop;
  const viewportBottom = viewportTop + height;
  const listTop = heightBefore + HEADER_HEIGHT;
  const listBottom = listTop + numItems * ROW_HEIGHT;
  const top = Math.max(viewportTop, listTop);
  const bottom = Math.min(viewportBottom, listBottom); // the viewport height and scrollTop passed to the LazyRenderList
  // is capped at the intersection with the real viewport, so lists
  // out of view are passed height 0, so they won't render any items.

  return {
    scrollTop: Math.max(0, scrollTop - listTop),
    height: Math.max(0, bottom - top)
  };
};

const AddExistingToSpace = _ref3 => {
  let {
    space,
    footerPrompt,
    emptySelectionButton,
    filterPlaceholder,
    roomsRenderer,
    dmsRenderer,
    spacesRenderer,
    onFinished
  } = _ref3;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const visibleRooms = (0, _react.useMemo)(() => cli.getVisibleRooms().filter(r => r.getMyMembership() === "join"), [cli]);
  const scrollRef = (0, _react.useRef)();
  const [scrollState, setScrollState] = (0, _react.useState)({
    // these are estimates which update as soon as it mounts
    scrollTop: 0,
    height: 600
  });
  const [selectedToAdd, setSelectedToAdd] = (0, _react.useState)(new Set());
  const [progress, setProgress] = (0, _react.useState)(null);
  const [error, setError] = (0, _react.useState)(null);
  const [query, setQuery] = (0, _react.useState)("");
  const lcQuery = query.toLowerCase().trim();
  const existingSubspacesSet = (0, _react.useMemo)(() => new Set(_SpaceStore.default.instance.getChildSpaces(space.roomId)), [space]);
  const existingRoomsSet = (0, _react.useMemo)(() => new Set(_SpaceStore.default.instance.getChildRooms(space.roomId)), [space]);
  const [spaces, rooms, dms] = (0, _react.useMemo)(() => {
    let rooms = visibleRooms;

    if (lcQuery) {
      const matcher = new _QueryMatcher.default(visibleRooms, {
        keys: ["name"],
        funcs: [r => [r.getCanonicalAlias(), ...r.getAltAliases()].filter(Boolean)],
        shouldMatchWordsOnly: false
      });
      rooms = matcher.match(lcQuery);
    }

    const joinRule = space.getJoinRule();
    return (0, _RecentAlgorithm.sortRooms)(rooms).reduce((arr, room) => {
      if (room.isSpaceRoom()) {
        if (room !== space && !existingSubspacesSet.has(room)) {
          arr[0].push(room);
        }
      } else if (!existingRoomsSet.has(room)) {
        if (!_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId)) {
          arr[1].push(room);
        } else if (joinRule !== "public") {
          // Only show DMs for non-public spaces as they make very little sense in spaces other than "Just Me" ones.
          arr[2].push(room);
        }
      }

      return arr;
    }, [[], [], []]);
  }, [visibleRooms, space, lcQuery, existingRoomsSet, existingSubspacesSet]);

  const addRooms = async () => {
    setError(null);
    setProgress(0);
    let error;

    for (const room of selectedToAdd) {
      const via = (0, _Permalinks.calculateRoomVia)(room);

      try {
        await _SpaceStore.default.instance.addRoomToSpace(space, room.roomId, via).catch(async e => {
          if (e.errcode === "M_LIMIT_EXCEEDED") {
            await (0, _utils.sleep)(e.data.retry_after_ms);
            return _SpaceStore.default.instance.addRoomToSpace(space, room.roomId, via); // retry
          }

          throw e;
        });
        setProgress(i => i + 1);
      } catch (e) {
        _logger.logger.error("Failed to add rooms to space", e);

        setError(error = e);
        break;
      }
    }

    if (!error) {
      onFinished(true);
    }
  };

  const busy = progress !== null;
  let footer;

  if (error) {
    footer = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/element-icons/warning-badge.svg").default,
      height: "24",
      width: "24",
      alt: ""
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AddExistingToSpaceDialog_error"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AddExistingToSpaceDialog_errorHeading"
    }, (0, _languageHandler._t)("Not all selected were added")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AddExistingToSpaceDialog_errorCaption"
    }, (0, _languageHandler._t)("Try again"))), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_AddExistingToSpaceDialog_retryButton",
      onClick: addRooms
    }, (0, _languageHandler._t)("Retry")));
  } else if (busy) {
    footer = /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_ProgressBar.default, {
      value: progress,
      max: selectedToAdd.size
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AddExistingToSpaceDialog_progressText"
    }, (0, _languageHandler._t)("Adding rooms... (%(progress)s out of %(count)s)", {
      count: selectedToAdd.size,
      progress
    })));
  } else {
    let button = emptySelectionButton;

    if (!button || selectedToAdd.size > 0) {
      button = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        disabled: selectedToAdd.size < 1,
        onClick: addRooms
      }, (0, _languageHandler._t)("Add"));
    }

    footer = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", null, footerPrompt), button);
  }

  const onChange = !busy && !error ? (checked, room) => {
    if (checked) {
      selectedToAdd.add(room);
    } else {
      selectedToAdd.delete(room);
    }

    setSelectedToAdd(new Set(selectedToAdd));
  } : null; // only count spaces when alone as they're shown on a separate modal all on their own

  const numSpaces = spacesRenderer && !dmsRenderer && !roomsRenderer ? spaces.length : 0;
  const numRooms = roomsRenderer ? rooms.length : 0;
  const numDms = dmsRenderer ? dms.length : 0;
  let noResults = true;

  if (numSpaces > 0 || numRooms > 0 || numDms > 0) {
    noResults = false;
  }

  const onScroll = () => {
    const body = scrollRef.current?.containerRef.current;
    setScrollState({
      scrollTop: body.scrollTop,
      height: body.clientHeight
    });
  };

  const wrappedRef = body => {
    setScrollState({
      scrollTop: body.scrollTop,
      height: body.clientHeight
    });
  };

  const roomsScrollState = getScrollState(scrollState, numRooms);
  const spacesScrollState = getScrollState(scrollState, numSpaces, numRooms);
  const dmsScrollState = getScrollState(scrollState, numDms, numSpaces, numRooms);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AddExistingToSpace"
  }, /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
    className: "mx_textinput_icon mx_textinput_search",
    placeholder: filterPlaceholder,
    onSearch: setQuery,
    autoFocus: true
  }), /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
    className: "mx_AddExistingToSpace_content",
    onScroll: onScroll,
    wrappedRef: wrappedRef,
    ref: scrollRef
  }, rooms.length > 0 && roomsRenderer ? roomsRenderer(rooms, selectedToAdd, roomsScrollState, onChange) : undefined, spaces.length > 0 && spacesRenderer ? spacesRenderer(spaces, selectedToAdd, spacesScrollState, onChange) : null, dms.length > 0 && dmsRenderer ? dmsRenderer(dms, selectedToAdd, dmsScrollState, onChange) : null, noResults ? /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_AddExistingToSpace_noResults"
  }, (0, _languageHandler._t)("No results")) : undefined), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AddExistingToSpace_footer"
  }, footer));
};

exports.AddExistingToSpace = AddExistingToSpace;

const defaultRendererFactory = title => (rooms, selectedToAdd, _ref4, onChange) => {
  let {
    scrollTop,
    height
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_AddExistingToSpace_section"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)(title)), /*#__PURE__*/_react.default.createElement(_LazyRenderList.default, {
    itemHeight: ROW_HEIGHT,
    items: rooms,
    scrollTop: scrollTop,
    height: height,
    renderItem: room => /*#__PURE__*/_react.default.createElement(Entry, {
      key: room.roomId,
      room: room,
      checked: selectedToAdd.has(room),
      onChange: onChange ? checked => {
        onChange(checked, room);
      } : null
    })
  }));
};

const defaultRoomsRenderer = defaultRendererFactory((0, _languageHandler._td)("Rooms"));
exports.defaultRoomsRenderer = defaultRoomsRenderer;
const defaultSpacesRenderer = defaultRendererFactory((0, _languageHandler._td)("Spaces"));
exports.defaultSpacesRenderer = defaultSpacesRenderer;
const defaultDmsRenderer = defaultRendererFactory((0, _languageHandler._td)("Direct Messages"));
exports.defaultDmsRenderer = defaultDmsRenderer;

const SubspaceSelector = _ref5 => {
  let {
    title,
    space,
    value,
    onChange
  } = _ref5;
  const options = (0, _react.useMemo)(() => {
    return [space, ..._SpaceStore.default.instance.getChildSpaces(space.roomId).filter(space => {
      return space.currentState.maySendStateEvent(_event.EventType.SpaceChild, space.client.credentials.userId);
    })];
  }, [space]);
  let body;

  if (options.length > 1) {
    body = /*#__PURE__*/_react.default.createElement(_Dropdown.default, {
      id: "mx_SpaceSelectDropdown",
      className: "mx_SpaceSelectDropdown",
      onOptionChange: key => {
        onChange(options.find(space => space.roomId === key) || space);
      },
      value: value.roomId,
      label: (0, _languageHandler._t)("Space selection")
    }, options.map(space => {
      const classes = (0, _classnames.default)({
        mx_SubspaceSelector_dropdownOptionActive: space === value
      });
      return /*#__PURE__*/_react.default.createElement("div", {
        key: space.roomId,
        className: classes
      }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        room: space,
        width: 24,
        height: 24
      }), space.name || (0, _Rooms.getDisplayAliasForRoom)(space) || space.roomId);
    }));
  } else {
    body = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SubspaceSelector_onlySpace"
    }, space.name || (0, _Rooms.getDisplayAliasForRoom)(space) || space.roomId);
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SubspaceSelector"
  }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
    room: value,
    height: 40,
    width: 40
  }), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", null, title), body));
};

exports.SubspaceSelector = SubspaceSelector;

const AddExistingToSpaceDialog = _ref6 => {
  let {
    space,
    onCreateRoomClick,
    onAddSubspaceClick,
    onFinished
  } = _ref6;
  const [selectedSpace, setSelectedSpace] = (0, _react.useState)(space);
  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    title: /*#__PURE__*/_react.default.createElement(SubspaceSelector, {
      title: (0, _languageHandler._t)("Add existing rooms"),
      space: space,
      value: selectedSpace,
      onChange: setSelectedSpace
    }),
    className: "mx_AddExistingToSpaceDialog",
    contentId: "mx_AddExistingToSpace",
    onFinished: onFinished,
    fixedWidth: false
  }, /*#__PURE__*/_react.default.createElement(_MatrixClientContext.default.Provider, {
    value: space.client
  }, /*#__PURE__*/_react.default.createElement(AddExistingToSpace, {
    space: space,
    onFinished: onFinished,
    footerPrompt: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Want to add a new room instead?")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      onClick: ev => {
        onCreateRoomClick(ev);
        onFinished();
      }
    }, (0, _languageHandler._t)("Create a new room"))),
    filterPlaceholder: (0, _languageHandler._t)("Search for rooms"),
    roomsRenderer: defaultRoomsRenderer,
    spacesRenderer: () => /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AddExistingToSpace_section"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Spaces")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      onClick: () => {
        onAddSubspaceClick();
        onFinished();
      }
    }, (0, _languageHandler._t)("Adding spaces has moved."))),
    dmsRenderer: defaultDmsRenderer
  })));
};

var _default = AddExistingToSpaceDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJST1dfSEVJR0hUIiwiSEVBREVSX0hFSUdIVCIsIkdST1VQX01BUkdJTiIsIkVudHJ5Iiwicm9vbSIsImNoZWNrZWQiLCJvbkNoYW5nZSIsImlzU3BhY2VSb29tIiwibmFtZSIsImUiLCJ0YXJnZXQiLCJnZXRTY3JvbGxTdGF0ZSIsIm51bUl0ZW1zIiwic2Nyb2xsVG9wIiwiaGVpZ2h0IiwiaGVpZ2h0QmVmb3JlIiwicHJldkdyb3VwU2l6ZXMiLCJmb3JFYWNoIiwic2l6ZSIsInZpZXdwb3J0VG9wIiwidmlld3BvcnRCb3R0b20iLCJsaXN0VG9wIiwibGlzdEJvdHRvbSIsInRvcCIsIk1hdGgiLCJtYXgiLCJib3R0b20iLCJtaW4iLCJBZGRFeGlzdGluZ1RvU3BhY2UiLCJzcGFjZSIsImZvb3RlclByb21wdCIsImVtcHR5U2VsZWN0aW9uQnV0dG9uIiwiZmlsdGVyUGxhY2Vob2xkZXIiLCJyb29tc1JlbmRlcmVyIiwiZG1zUmVuZGVyZXIiLCJzcGFjZXNSZW5kZXJlciIsIm9uRmluaXNoZWQiLCJjbGkiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsInZpc2libGVSb29tcyIsInVzZU1lbW8iLCJnZXRWaXNpYmxlUm9vbXMiLCJmaWx0ZXIiLCJyIiwiZ2V0TXlNZW1iZXJzaGlwIiwic2Nyb2xsUmVmIiwidXNlUmVmIiwic2Nyb2xsU3RhdGUiLCJzZXRTY3JvbGxTdGF0ZSIsInVzZVN0YXRlIiwic2VsZWN0ZWRUb0FkZCIsInNldFNlbGVjdGVkVG9BZGQiLCJTZXQiLCJwcm9ncmVzcyIsInNldFByb2dyZXNzIiwiZXJyb3IiLCJzZXRFcnJvciIsInF1ZXJ5Iiwic2V0UXVlcnkiLCJsY1F1ZXJ5IiwidG9Mb3dlckNhc2UiLCJ0cmltIiwiZXhpc3RpbmdTdWJzcGFjZXNTZXQiLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJnZXRDaGlsZFNwYWNlcyIsInJvb21JZCIsImV4aXN0aW5nUm9vbXNTZXQiLCJnZXRDaGlsZFJvb21zIiwic3BhY2VzIiwicm9vbXMiLCJkbXMiLCJtYXRjaGVyIiwiUXVlcnlNYXRjaGVyIiwia2V5cyIsImZ1bmNzIiwiZ2V0Q2Fub25pY2FsQWxpYXMiLCJnZXRBbHRBbGlhc2VzIiwiQm9vbGVhbiIsInNob3VsZE1hdGNoV29yZHNPbmx5IiwibWF0Y2giLCJqb2luUnVsZSIsImdldEpvaW5SdWxlIiwic29ydFJvb21zIiwicmVkdWNlIiwiYXJyIiwiaGFzIiwicHVzaCIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsImFkZFJvb21zIiwidmlhIiwiY2FsY3VsYXRlUm9vbVZpYSIsImFkZFJvb21Ub1NwYWNlIiwiY2F0Y2giLCJlcnJjb2RlIiwic2xlZXAiLCJkYXRhIiwicmV0cnlfYWZ0ZXJfbXMiLCJpIiwibG9nZ2VyIiwiYnVzeSIsImZvb3RlciIsInJlcXVpcmUiLCJkZWZhdWx0IiwiX3QiLCJjb3VudCIsImJ1dHRvbiIsImFkZCIsImRlbGV0ZSIsIm51bVNwYWNlcyIsImxlbmd0aCIsIm51bVJvb21zIiwibnVtRG1zIiwibm9SZXN1bHRzIiwib25TY3JvbGwiLCJib2R5IiwiY3VycmVudCIsImNvbnRhaW5lclJlZiIsImNsaWVudEhlaWdodCIsIndyYXBwZWRSZWYiLCJyb29tc1Njcm9sbFN0YXRlIiwic3BhY2VzU2Nyb2xsU3RhdGUiLCJkbXNTY3JvbGxTdGF0ZSIsInVuZGVmaW5lZCIsImRlZmF1bHRSZW5kZXJlckZhY3RvcnkiLCJ0aXRsZSIsImRlZmF1bHRSb29tc1JlbmRlcmVyIiwiX3RkIiwiZGVmYXVsdFNwYWNlc1JlbmRlcmVyIiwiZGVmYXVsdERtc1JlbmRlcmVyIiwiU3Vic3BhY2VTZWxlY3RvciIsInZhbHVlIiwib3B0aW9ucyIsImN1cnJlbnRTdGF0ZSIsIm1heVNlbmRTdGF0ZUV2ZW50IiwiRXZlbnRUeXBlIiwiU3BhY2VDaGlsZCIsImNsaWVudCIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwia2V5IiwiZmluZCIsIm1hcCIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwibXhfU3Vic3BhY2VTZWxlY3Rvcl9kcm9wZG93bk9wdGlvbkFjdGl2ZSIsImdldERpc3BsYXlBbGlhc0ZvclJvb20iLCJBZGRFeGlzdGluZ1RvU3BhY2VEaWFsb2ciLCJvbkNyZWF0ZVJvb21DbGljayIsIm9uQWRkU3Vic3BhY2VDbGljayIsInNlbGVjdGVkU3BhY2UiLCJzZXRTZWxlY3RlZFNwYWNlIiwiZXYiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0FkZEV4aXN0aW5nVG9TcGFjZURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IFJlYWN0Tm9kZSwgdXNlQ29udGV4dCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IHNsZWVwIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IERyb3Bkb3duIGZyb20gXCIuLi9lbGVtZW50cy9Ecm9wZG93blwiO1xuaW1wb3J0IFNlYXJjaEJveCBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9TZWFyY2hCb3hcIjtcbmltcG9ydCBTcGFjZVN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvc3BhY2VzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCB7IGdldERpc3BsYXlBbGlhc0ZvclJvb20gfSBmcm9tIFwiLi4vLi4vLi4vUm9vbXNcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uLCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBBdXRvSGlkZVNjcm9sbGJhciBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9BdXRvSGlkZVNjcm9sbGJhclwiO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQgeyBjYWxjdWxhdGVSb29tVmlhIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IFN0eWxlZENoZWNrYm94IGZyb20gXCIuLi9lbGVtZW50cy9TdHlsZWRDaGVja2JveFwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IHNvcnRSb29tcyB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvdGFnLXNvcnRpbmcvUmVjZW50QWxnb3JpdGhtXCI7XG5pbXBvcnQgUHJvZ3Jlc3NCYXIgZnJvbSBcIi4uL2VsZW1lbnRzL1Byb2dyZXNzQmFyXCI7XG5pbXBvcnQgRGVjb3JhdGVkUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9EZWNvcmF0ZWRSb29tQXZhdGFyXCI7XG5pbXBvcnQgUXVlcnlNYXRjaGVyIGZyb20gXCIuLi8uLi8uLi9hdXRvY29tcGxldGUvUXVlcnlNYXRjaGVyXCI7XG5pbXBvcnQgTGF6eVJlbmRlckxpc3QgZnJvbSBcIi4uL2VsZW1lbnRzL0xhenlSZW5kZXJMaXN0XCI7XG5cbi8vIFRoZXNlIHZhbHVlcyBtYXRjaCBDU1NcbmNvbnN0IFJPV19IRUlHSFQgPSAzMiArIDEyO1xuY29uc3QgSEVBREVSX0hFSUdIVCA9IDE1O1xuY29uc3QgR1JPVVBfTUFSR0lOID0gMjQ7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNwYWNlOiBSb29tO1xuICAgIG9uQ3JlYXRlUm9vbUNsaWNrKGV2OiBCdXR0b25FdmVudCk6IHZvaWQ7XG4gICAgb25BZGRTdWJzcGFjZUNsaWNrKCk6IHZvaWQ7XG4gICAgb25GaW5pc2hlZChhZGRlZD86IGJvb2xlYW4pOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgRW50cnkgPSAoeyByb29tLCBjaGVja2VkLCBvbkNoYW5nZSB9KSA9PiB7XG4gICAgcmV0dXJuIDxsYWJlbCBjbGFzc05hbWU9XCJteF9BZGRFeGlzdGluZ1RvU3BhY2VfZW50cnlcIj5cbiAgICAgICAgeyByb29tPy5pc1NwYWNlUm9vbSgpXG4gICAgICAgICAgICA/IDxSb29tQXZhdGFyIHJvb209e3Jvb219IGhlaWdodD17MzJ9IHdpZHRoPXszMn0gLz5cbiAgICAgICAgICAgIDogPERlY29yYXRlZFJvb21BdmF0YXIgcm9vbT17cm9vbX0gYXZhdGFyU2l6ZT17MzJ9IC8+XG4gICAgICAgIH1cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQWRkRXhpc3RpbmdUb1NwYWNlX2VudHJ5X25hbWVcIj57IHJvb20ubmFtZSB9PC9zcGFuPlxuICAgICAgICA8U3R5bGVkQ2hlY2tib3hcbiAgICAgICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZSA/IChlKSA9PiBvbkNoYW5nZShlLnRhcmdldC5jaGVja2VkKSA6IG51bGx9XG4gICAgICAgICAgICBjaGVja2VkPXtjaGVja2VkfVxuICAgICAgICAgICAgZGlzYWJsZWQ9eyFvbkNoYW5nZX1cbiAgICAgICAgLz5cbiAgICA8L2xhYmVsPjtcbn07XG5cbnR5cGUgT25DaGFuZ2VGbiA9IChjaGVja2VkOiBib29sZWFuLCByb29tOiBSb29tKSA9PiB2b2lkO1xuXG50eXBlIFJlbmRlcmVyID0gKFxuICAgIHJvb21zOiBSb29tW10sXG4gICAgc2VsZWN0ZWRUb0FkZDogU2V0PFJvb20+LFxuICAgIHNjcm9sbFN0YXRlOiBJU2Nyb2xsU3RhdGUsXG4gICAgb25DaGFuZ2U6IHVuZGVmaW5lZCB8IE9uQ2hhbmdlRm4sXG4pID0+IFJlYWN0Tm9kZTtcblxuaW50ZXJmYWNlIElBZGRFeGlzdGluZ1RvU3BhY2VQcm9wcyB7XG4gICAgc3BhY2U6IFJvb207XG4gICAgZm9vdGVyUHJvbXB0PzogUmVhY3ROb2RlO1xuICAgIGZpbHRlclBsYWNlaG9sZGVyOiBzdHJpbmc7XG4gICAgZW1wdHlTZWxlY3Rpb25CdXR0b24/OiBSZWFjdE5vZGU7XG4gICAgb25GaW5pc2hlZChhZGRlZDogYm9vbGVhbik6IHZvaWQ7XG4gICAgcm9vbXNSZW5kZXJlcj86IFJlbmRlcmVyO1xuICAgIHNwYWNlc1JlbmRlcmVyPzogUmVuZGVyZXI7XG4gICAgZG1zUmVuZGVyZXI/OiBSZW5kZXJlcjtcbn1cblxuaW50ZXJmYWNlIElTY3JvbGxTdGF0ZSB7XG4gICAgc2Nyb2xsVG9wOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbmNvbnN0IGdldFNjcm9sbFN0YXRlID0gKFxuICAgIHsgc2Nyb2xsVG9wLCBoZWlnaHQgfTogSVNjcm9sbFN0YXRlLFxuICAgIG51bUl0ZW1zOiBudW1iZXIsXG4gICAgLi4ucHJldkdyb3VwU2l6ZXM6IG51bWJlcltdXG4pOiBJU2Nyb2xsU3RhdGUgPT4ge1xuICAgIGxldCBoZWlnaHRCZWZvcmUgPSAwO1xuICAgIHByZXZHcm91cFNpemVzLmZvckVhY2goc2l6ZSA9PiB7XG4gICAgICAgIGhlaWdodEJlZm9yZSArPSBHUk9VUF9NQVJHSU4gKyBIRUFERVJfSEVJR0hUICsgKHNpemUgKiBST1dfSEVJR0hUKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHZpZXdwb3J0VG9wID0gc2Nyb2xsVG9wO1xuICAgIGNvbnN0IHZpZXdwb3J0Qm90dG9tID0gdmlld3BvcnRUb3AgKyBoZWlnaHQ7XG4gICAgY29uc3QgbGlzdFRvcCA9IGhlaWdodEJlZm9yZSArIEhFQURFUl9IRUlHSFQ7XG4gICAgY29uc3QgbGlzdEJvdHRvbSA9IGxpc3RUb3AgKyAobnVtSXRlbXMgKiBST1dfSEVJR0hUKTtcbiAgICBjb25zdCB0b3AgPSBNYXRoLm1heCh2aWV3cG9ydFRvcCwgbGlzdFRvcCk7XG4gICAgY29uc3QgYm90dG9tID0gTWF0aC5taW4odmlld3BvcnRCb3R0b20sIGxpc3RCb3R0b20pO1xuICAgIC8vIHRoZSB2aWV3cG9ydCBoZWlnaHQgYW5kIHNjcm9sbFRvcCBwYXNzZWQgdG8gdGhlIExhenlSZW5kZXJMaXN0XG4gICAgLy8gaXMgY2FwcGVkIGF0IHRoZSBpbnRlcnNlY3Rpb24gd2l0aCB0aGUgcmVhbCB2aWV3cG9ydCwgc28gbGlzdHNcbiAgICAvLyBvdXQgb2YgdmlldyBhcmUgcGFzc2VkIGhlaWdodCAwLCBzbyB0aGV5IHdvbid0IHJlbmRlciBhbnkgaXRlbXMuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2Nyb2xsVG9wOiBNYXRoLm1heCgwLCBzY3JvbGxUb3AgLSBsaXN0VG9wKSxcbiAgICAgICAgaGVpZ2h0OiBNYXRoLm1heCgwLCBib3R0b20gLSB0b3ApLFxuICAgIH07XG59O1xuXG5leHBvcnQgY29uc3QgQWRkRXhpc3RpbmdUb1NwYWNlOiBSZWFjdC5GQzxJQWRkRXhpc3RpbmdUb1NwYWNlUHJvcHM+ID0gKHtcbiAgICBzcGFjZSxcbiAgICBmb290ZXJQcm9tcHQsXG4gICAgZW1wdHlTZWxlY3Rpb25CdXR0b24sXG4gICAgZmlsdGVyUGxhY2Vob2xkZXIsXG4gICAgcm9vbXNSZW5kZXJlcixcbiAgICBkbXNSZW5kZXJlcixcbiAgICBzcGFjZXNSZW5kZXJlcixcbiAgICBvbkZpbmlzaGVkLFxufSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgdmlzaWJsZVJvb21zID0gdXNlTWVtbygoKSA9PiBjbGkuZ2V0VmlzaWJsZVJvb21zKCkuZmlsdGVyKHIgPT4gci5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCIpLCBbY2xpXSk7XG5cbiAgICBjb25zdCBzY3JvbGxSZWYgPSB1c2VSZWY8QXV0b0hpZGVTY3JvbGxiYXI8XCJkaXZcIj4+KCk7XG4gICAgY29uc3QgW3Njcm9sbFN0YXRlLCBzZXRTY3JvbGxTdGF0ZV0gPSB1c2VTdGF0ZTxJU2Nyb2xsU3RhdGU+KHtcbiAgICAgICAgLy8gdGhlc2UgYXJlIGVzdGltYXRlcyB3aGljaCB1cGRhdGUgYXMgc29vbiBhcyBpdCBtb3VudHNcbiAgICAgICAgc2Nyb2xsVG9wOiAwLFxuICAgICAgICBoZWlnaHQ6IDYwMCxcbiAgICB9KTtcblxuICAgIGNvbnN0IFtzZWxlY3RlZFRvQWRkLCBzZXRTZWxlY3RlZFRvQWRkXSA9IHVzZVN0YXRlKG5ldyBTZXQ8Um9vbT4oKSk7XG4gICAgY29uc3QgW3Byb2dyZXNzLCBzZXRQcm9ncmVzc10gPSB1c2VTdGF0ZTxudW1iZXI+KG51bGwpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8RXJyb3I+KG51bGwpO1xuICAgIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgbGNRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXG4gICAgY29uc3QgZXhpc3RpbmdTdWJzcGFjZXNTZXQgPSB1c2VNZW1vKCgpID0+IG5ldyBTZXQoU3BhY2VTdG9yZS5pbnN0YW5jZS5nZXRDaGlsZFNwYWNlcyhzcGFjZS5yb29tSWQpKSwgW3NwYWNlXSk7XG4gICAgY29uc3QgZXhpc3RpbmdSb29tc1NldCA9IHVzZU1lbW8oKCkgPT4gbmV3IFNldChTcGFjZVN0b3JlLmluc3RhbmNlLmdldENoaWxkUm9vbXMoc3BhY2Uucm9vbUlkKSksIFtzcGFjZV0pO1xuXG4gICAgY29uc3QgW3NwYWNlcywgcm9vbXMsIGRtc10gPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IHJvb21zID0gdmlzaWJsZVJvb21zO1xuXG4gICAgICAgIGlmIChsY1F1ZXJ5KSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVyID0gbmV3IFF1ZXJ5TWF0Y2hlcjxSb29tPih2aXNpYmxlUm9vbXMsIHtcbiAgICAgICAgICAgICAgICBrZXlzOiBbXCJuYW1lXCJdLFxuICAgICAgICAgICAgICAgIGZ1bmNzOiBbciA9PiBbci5nZXRDYW5vbmljYWxBbGlhcygpLCAuLi5yLmdldEFsdEFsaWFzZXMoKV0uZmlsdGVyKEJvb2xlYW4pXSxcbiAgICAgICAgICAgICAgICBzaG91bGRNYXRjaFdvcmRzT25seTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcm9vbXMgPSBtYXRjaGVyLm1hdGNoKGxjUXVlcnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgam9pblJ1bGUgPSBzcGFjZS5nZXRKb2luUnVsZSgpO1xuICAgICAgICByZXR1cm4gc29ydFJvb21zKHJvb21zKS5yZWR1Y2UoKGFyciwgcm9vbSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgICAgIGlmIChyb29tICE9PSBzcGFjZSAmJiAhZXhpc3RpbmdTdWJzcGFjZXNTZXQuaGFzKHJvb20pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyclswXS5wdXNoKHJvb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWV4aXN0aW5nUm9vbXNTZXQuaGFzKHJvb20pKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHJvb20ucm9vbUlkKSkge1xuICAgICAgICAgICAgICAgICAgICBhcnJbMV0ucHVzaChyb29tKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGpvaW5SdWxlICE9PSBcInB1YmxpY1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgc2hvdyBETXMgZm9yIG5vbi1wdWJsaWMgc3BhY2VzIGFzIHRoZXkgbWFrZSB2ZXJ5IGxpdHRsZSBzZW5zZSBpbiBzcGFjZXMgb3RoZXIgdGhhbiBcIkp1c3QgTWVcIiBvbmVzLlxuICAgICAgICAgICAgICAgICAgICBhcnJbMl0ucHVzaChyb29tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9LCBbW10sIFtdLCBbXV0pO1xuICAgIH0sIFt2aXNpYmxlUm9vbXMsIHNwYWNlLCBsY1F1ZXJ5LCBleGlzdGluZ1Jvb21zU2V0LCBleGlzdGluZ1N1YnNwYWNlc1NldF0pO1xuXG4gICAgY29uc3QgYWRkUm9vbXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICBzZXRQcm9ncmVzcygwKTtcblxuICAgICAgICBsZXQgZXJyb3I7XG5cbiAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHNlbGVjdGVkVG9BZGQpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpYSA9IGNhbGN1bGF0ZVJvb21WaWEocm9vbSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IFNwYWNlU3RvcmUuaW5zdGFuY2UuYWRkUm9vbVRvU3BhY2Uoc3BhY2UsIHJvb20ucm9vbUlkLCB2aWEpLmNhdGNoKGFzeW5jIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5lcnJjb2RlID09PSBcIk1fTElNSVRfRVhDRUVERURcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoZS5kYXRhLnJldHJ5X2FmdGVyX21zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTcGFjZVN0b3JlLmluc3RhbmNlLmFkZFJvb21Ub1NwYWNlKHNwYWNlLCByb29tLnJvb21JZCwgdmlhKTsgLy8gcmV0cnlcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2V0UHJvZ3Jlc3MoaSA9PiBpICsgMSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGFkZCByb29tcyB0byBzcGFjZVwiLCBlKTtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcihlcnJvciA9IGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgb25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBidXN5ID0gcHJvZ3Jlc3MgIT09IG51bGw7XG5cbiAgICBsZXQgZm9vdGVyO1xuICAgIGlmIChlcnJvcikge1xuICAgICAgICBmb290ZXIgPSA8PlxuICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy93YXJuaW5nLWJhZGdlLnN2Z1wiKS5kZWZhdWx0fVxuICAgICAgICAgICAgICAgIGhlaWdodD1cIjI0XCJcbiAgICAgICAgICAgICAgICB3aWR0aD1cIjI0XCJcbiAgICAgICAgICAgICAgICBhbHQ9XCJcIlxuICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQWRkRXhpc3RpbmdUb1NwYWNlRGlhbG9nX2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BZGRFeGlzdGluZ1RvU3BhY2VEaWFsb2dfZXJyb3JIZWFkaW5nXCI+eyBfdChcIk5vdCBhbGwgc2VsZWN0ZWQgd2VyZSBhZGRlZFwiKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BZGRFeGlzdGluZ1RvU3BhY2VEaWFsb2dfZXJyb3JDYXB0aW9uXCI+eyBfdChcIlRyeSBhZ2FpblwiKSB9PC9kaXY+XG4gICAgICAgICAgICA8L3NwYW4+XG5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0FkZEV4aXN0aW5nVG9TcGFjZURpYWxvZ19yZXRyeUJ1dHRvblwiIG9uQ2xpY2s9e2FkZFJvb21zfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiUmV0cnlcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8Lz47XG4gICAgfSBlbHNlIGlmIChidXN5KSB7XG4gICAgICAgIGZvb3RlciA9IDxzcGFuPlxuICAgICAgICAgICAgPFByb2dyZXNzQmFyIHZhbHVlPXtwcm9ncmVzc30gbWF4PXtzZWxlY3RlZFRvQWRkLnNpemV9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZEV4aXN0aW5nVG9TcGFjZURpYWxvZ19wcm9ncmVzc1RleHRcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiQWRkaW5nIHJvb21zLi4uICglKHByb2dyZXNzKXMgb3V0IG9mICUoY291bnQpcylcIiwge1xuICAgICAgICAgICAgICAgICAgICBjb3VudDogc2VsZWN0ZWRUb0FkZC5zaXplLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zcGFuPjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgYnV0dG9uID0gZW1wdHlTZWxlY3Rpb25CdXR0b247XG4gICAgICAgIGlmICghYnV0dG9uIHx8IHNlbGVjdGVkVG9BZGQuc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIGJ1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgZGlzYWJsZWQ9e3NlbGVjdGVkVG9BZGQuc2l6ZSA8IDF9IG9uQ2xpY2s9e2FkZFJvb21zfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiQWRkXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICBmb290ZXIgPSA8PlxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgeyBmb290ZXJQcm9tcHQgfVxuICAgICAgICAgICAgPC9zcGFuPlxuXG4gICAgICAgICAgICB7IGJ1dHRvbiB9XG4gICAgICAgIDwvPjtcbiAgICB9XG5cbiAgICBjb25zdCBvbkNoYW5nZSA9ICFidXN5ICYmICFlcnJvciA/IChjaGVja2VkOiBib29sZWFuLCByb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmIChjaGVja2VkKSB7XG4gICAgICAgICAgICBzZWxlY3RlZFRvQWRkLmFkZChyb29tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdGVkVG9BZGQuZGVsZXRlKHJvb20pO1xuICAgICAgICB9XG4gICAgICAgIHNldFNlbGVjdGVkVG9BZGQobmV3IFNldChzZWxlY3RlZFRvQWRkKSk7XG4gICAgfSA6IG51bGw7XG5cbiAgICAvLyBvbmx5IGNvdW50IHNwYWNlcyB3aGVuIGFsb25lIGFzIHRoZXkncmUgc2hvd24gb24gYSBzZXBhcmF0ZSBtb2RhbCBhbGwgb24gdGhlaXIgb3duXG4gICAgY29uc3QgbnVtU3BhY2VzID0gKHNwYWNlc1JlbmRlcmVyICYmICFkbXNSZW5kZXJlciAmJiAhcm9vbXNSZW5kZXJlcikgPyBzcGFjZXMubGVuZ3RoIDogMDtcbiAgICBjb25zdCBudW1Sb29tcyA9IHJvb21zUmVuZGVyZXIgPyByb29tcy5sZW5ndGggOiAwO1xuICAgIGNvbnN0IG51bURtcyA9IGRtc1JlbmRlcmVyID8gZG1zLmxlbmd0aCA6IDA7XG5cbiAgICBsZXQgbm9SZXN1bHRzID0gdHJ1ZTtcbiAgICBpZiAobnVtU3BhY2VzID4gMCB8fCBudW1Sb29tcyA+IDAgfHwgbnVtRG1zID4gMCkge1xuICAgICAgICBub1Jlc3VsdHMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBvblNjcm9sbCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgYm9keSA9IHNjcm9sbFJlZi5jdXJyZW50Py5jb250YWluZXJSZWYuY3VycmVudDtcbiAgICAgICAgc2V0U2Nyb2xsU3RhdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiBib2R5LnNjcm9sbFRvcCxcbiAgICAgICAgICAgIGhlaWdodDogYm9keS5jbGllbnRIZWlnaHQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCB3cmFwcGVkUmVmID0gKGJvZHk6IEhUTUxEaXZFbGVtZW50KSA9PiB7XG4gICAgICAgIHNldFNjcm9sbFN0YXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogYm9keS5zY3JvbGxUb3AsXG4gICAgICAgICAgICBoZWlnaHQ6IGJvZHkuY2xpZW50SGVpZ2h0LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgcm9vbXNTY3JvbGxTdGF0ZSA9IGdldFNjcm9sbFN0YXRlKHNjcm9sbFN0YXRlLCBudW1Sb29tcyk7XG4gICAgY29uc3Qgc3BhY2VzU2Nyb2xsU3RhdGUgPSBnZXRTY3JvbGxTdGF0ZShzY3JvbGxTdGF0ZSwgbnVtU3BhY2VzLCBudW1Sb29tcyk7XG4gICAgY29uc3QgZG1zU2Nyb2xsU3RhdGUgPSBnZXRTY3JvbGxTdGF0ZShzY3JvbGxTdGF0ZSwgbnVtRG1zLCBudW1TcGFjZXMsIG51bVJvb21zKTtcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZEV4aXN0aW5nVG9TcGFjZVwiPlxuICAgICAgICA8U2VhcmNoQm94XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF90ZXh0aW5wdXRfaWNvbiBteF90ZXh0aW5wdXRfc2VhcmNoXCJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtmaWx0ZXJQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIG9uU2VhcmNoPXtzZXRRdWVyeX1cbiAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgLz5cbiAgICAgICAgPEF1dG9IaWRlU2Nyb2xsYmFyXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BZGRFeGlzdGluZ1RvU3BhY2VfY29udGVudFwiXG4gICAgICAgICAgICBvblNjcm9sbD17b25TY3JvbGx9XG4gICAgICAgICAgICB3cmFwcGVkUmVmPXt3cmFwcGVkUmVmfVxuICAgICAgICAgICAgcmVmPXtzY3JvbGxSZWZ9XG4gICAgICAgID5cbiAgICAgICAgICAgIHsgcm9vbXMubGVuZ3RoID4gMCAmJiByb29tc1JlbmRlcmVyID8gKFxuICAgICAgICAgICAgICAgIHJvb21zUmVuZGVyZXIocm9vbXMsIHNlbGVjdGVkVG9BZGQsIHJvb21zU2Nyb2xsU3RhdGUsIG9uQ2hhbmdlKVxuICAgICAgICAgICAgKSA6IHVuZGVmaW5lZCB9XG5cbiAgICAgICAgICAgIHsgc3BhY2VzLmxlbmd0aCA+IDAgJiYgc3BhY2VzUmVuZGVyZXIgPyAoXG4gICAgICAgICAgICAgICAgc3BhY2VzUmVuZGVyZXIoc3BhY2VzLCBzZWxlY3RlZFRvQWRkLCBzcGFjZXNTY3JvbGxTdGF0ZSwgb25DaGFuZ2UpXG4gICAgICAgICAgICApIDogbnVsbCB9XG5cbiAgICAgICAgICAgIHsgZG1zLmxlbmd0aCA+IDAgJiYgZG1zUmVuZGVyZXIgPyAoXG4gICAgICAgICAgICAgICAgZG1zUmVuZGVyZXIoZG1zLCBzZWxlY3RlZFRvQWRkLCBkbXNTY3JvbGxTdGF0ZSwgb25DaGFuZ2UpXG4gICAgICAgICAgICApIDogbnVsbCB9XG5cbiAgICAgICAgICAgIHsgbm9SZXN1bHRzID8gPHNwYW4gY2xhc3NOYW1lPVwibXhfQWRkRXhpc3RpbmdUb1NwYWNlX25vUmVzdWx0c1wiPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJObyByZXN1bHRzXCIpIH1cbiAgICAgICAgICAgIDwvc3Bhbj4gOiB1bmRlZmluZWQgfVxuICAgICAgICA8L0F1dG9IaWRlU2Nyb2xsYmFyPlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkRXhpc3RpbmdUb1NwYWNlX2Zvb3RlclwiPlxuICAgICAgICAgICAgeyBmb290ZXIgfVxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBkZWZhdWx0UmVuZGVyZXJGYWN0b3J5ID0gKHRpdGxlOiBzdHJpbmcpOiBSZW5kZXJlciA9PiAoXG4gICAgcm9vbXMsXG4gICAgc2VsZWN0ZWRUb0FkZCxcbiAgICB7IHNjcm9sbFRvcCwgaGVpZ2h0IH0sXG4gICAgb25DaGFuZ2UsXG4pID0+IChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZEV4aXN0aW5nVG9TcGFjZV9zZWN0aW9uXCI+XG4gICAgICAgIDxoMz57IF90KHRpdGxlKSB9PC9oMz5cbiAgICAgICAgPExhenlSZW5kZXJMaXN0XG4gICAgICAgICAgICBpdGVtSGVpZ2h0PXtST1dfSEVJR0hUfVxuICAgICAgICAgICAgaXRlbXM9e3Jvb21zfVxuICAgICAgICAgICAgc2Nyb2xsVG9wPXtzY3JvbGxUb3B9XG4gICAgICAgICAgICBoZWlnaHQ9e2hlaWdodH1cbiAgICAgICAgICAgIHJlbmRlckl0ZW09e3Jvb20gPT4gKFxuICAgICAgICAgICAgICAgIDxFbnRyeVxuICAgICAgICAgICAgICAgICAgICBrZXk9e3Jvb20ucm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZFRvQWRkLmhhcyhyb29tKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlID8gKGNoZWNrZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKGNoZWNrZWQsIHJvb20pO1xuICAgICAgICAgICAgICAgICAgICB9IDogbnVsbH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgLz5cbiAgICA8L2Rpdj5cbik7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0Um9vbXNSZW5kZXJlciA9IGRlZmF1bHRSZW5kZXJlckZhY3RvcnkoX3RkKFwiUm9vbXNcIikpO1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRTcGFjZXNSZW5kZXJlciA9IGRlZmF1bHRSZW5kZXJlckZhY3RvcnkoX3RkKFwiU3BhY2VzXCIpKTtcbmV4cG9ydCBjb25zdCBkZWZhdWx0RG1zUmVuZGVyZXIgPSBkZWZhdWx0UmVuZGVyZXJGYWN0b3J5KF90ZChcIkRpcmVjdCBNZXNzYWdlc1wiKSk7XG5cbmludGVyZmFjZSBJU3Vic3BhY2VTZWxlY3RvclByb3BzIHtcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIHNwYWNlOiBSb29tO1xuICAgIHZhbHVlOiBSb29tO1xuICAgIG9uQ2hhbmdlKHNwYWNlOiBSb29tKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IFN1YnNwYWNlU2VsZWN0b3IgPSAoeyB0aXRsZSwgc3BhY2UsIHZhbHVlLCBvbkNoYW5nZSB9OiBJU3Vic3BhY2VTZWxlY3RvclByb3BzKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICByZXR1cm4gW3NwYWNlLCAuLi5TcGFjZVN0b3JlLmluc3RhbmNlLmdldENoaWxkU3BhY2VzKHNwYWNlLnJvb21JZCkuZmlsdGVyKHNwYWNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzcGFjZS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlNwYWNlQ2hpbGQsIHNwYWNlLmNsaWVudC5jcmVkZW50aWFscy51c2VySWQpO1xuICAgICAgICB9KV07XG4gICAgfSwgW3NwYWNlXSk7XG5cbiAgICBsZXQgYm9keTtcbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGJvZHkgPSAoXG4gICAgICAgICAgICA8RHJvcGRvd25cbiAgICAgICAgICAgICAgICBpZD1cIm14X1NwYWNlU2VsZWN0RHJvcGRvd25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlU2VsZWN0RHJvcGRvd25cIlxuICAgICAgICAgICAgICAgIG9uT3B0aW9uQ2hhbmdlPXsoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2Uob3B0aW9ucy5maW5kKHNwYWNlID0+IHNwYWNlLnJvb21JZCA9PT0ga2V5KSB8fCBzcGFjZSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17dmFsdWUucm9vbUlkfVxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlNwYWNlIHNlbGVjdGlvblwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IG9wdGlvbnMubWFwKChzcGFjZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBteF9TdWJzcGFjZVNlbGVjdG9yX2Ryb3Bkb3duT3B0aW9uQWN0aXZlOiBzcGFjZSA9PT0gdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGRpdiBrZXk9e3NwYWNlLnJvb21JZH0gY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e3NwYWNlfSB3aWR0aD17MjR9IGhlaWdodD17MjR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNwYWNlLm5hbWUgfHwgZ2V0RGlzcGxheUFsaWFzRm9yUm9vbShzcGFjZSkgfHwgc3BhY2Uucm9vbUlkIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgIDwvRHJvcGRvd24+XG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYm9keSA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3Vic3BhY2VTZWxlY3Rvcl9vbmx5U3BhY2VcIj5cbiAgICAgICAgICAgICAgICB7IHNwYWNlLm5hbWUgfHwgZ2V0RGlzcGxheUFsaWFzRm9yUm9vbShzcGFjZSkgfHwgc3BhY2Uucm9vbUlkIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1N1YnNwYWNlU2VsZWN0b3JcIj5cbiAgICAgICAgPFJvb21BdmF0YXIgcm9vbT17dmFsdWV9IGhlaWdodD17NDB9IHdpZHRoPXs0MH0gLz5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMT57IHRpdGxlIH08L2gxPlxuICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+O1xufTtcblxuY29uc3QgQWRkRXhpc3RpbmdUb1NwYWNlRGlhbG9nOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgc3BhY2UsIG9uQ3JlYXRlUm9vbUNsaWNrLCBvbkFkZFN1YnNwYWNlQ2xpY2ssIG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGNvbnN0IFtzZWxlY3RlZFNwYWNlLCBzZXRTZWxlY3RlZFNwYWNlXSA9IHVzZVN0YXRlKHNwYWNlKTtcblxuICAgIHJldHVybiA8QmFzZURpYWxvZ1xuICAgICAgICB0aXRsZT17KFxuICAgICAgICAgICAgPFN1YnNwYWNlU2VsZWN0b3JcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJBZGQgZXhpc3Rpbmcgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgc3BhY2U9e3NwYWNlfVxuICAgICAgICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZFNwYWNlfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTZWxlY3RlZFNwYWNlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfQWRkRXhpc3RpbmdUb1NwYWNlRGlhbG9nXCJcbiAgICAgICAgY29udGVudElkPVwibXhfQWRkRXhpc3RpbmdUb1NwYWNlXCJcbiAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICAgICAgZml4ZWRXaWR0aD17ZmFsc2V9XG4gICAgPlxuICAgICAgICA8TWF0cml4Q2xpZW50Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17c3BhY2UuY2xpZW50fT5cbiAgICAgICAgICAgIDxBZGRFeGlzdGluZ1RvU3BhY2VcbiAgICAgICAgICAgICAgICBzcGFjZT17c3BhY2V9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICBmb290ZXJQcm9tcHQ9ezw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+eyBfdChcIldhbnQgdG8gYWRkIGEgbmV3IHJvb20gaW5zdGVhZD9cIikgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ3JlYXRlUm9vbUNsaWNrKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ3JlYXRlIGEgbmV3IHJvb21cIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC8+fVxuICAgICAgICAgICAgICAgIGZpbHRlclBsYWNlaG9sZGVyPXtfdChcIlNlYXJjaCBmb3Igcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgcm9vbXNSZW5kZXJlcj17ZGVmYXVsdFJvb21zUmVuZGVyZXJ9XG4gICAgICAgICAgICAgICAgc3BhY2VzUmVuZGVyZXI9eygpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BZGRFeGlzdGluZ1RvU3BhY2Vfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGgzPnsgX3QoXCJTcGFjZXNcIikgfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQWRkU3Vic3BhY2VDbGljaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQWRkaW5nIHNwYWNlcyBoYXMgbW92ZWQuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICBkbXNSZW5kZXJlcj17ZGVmYXVsdERtc1JlbmRlcmVyfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9NYXRyaXhDbGllbnRDb250ZXh0LlByb3ZpZGVyPlxuICAgIDwvQmFzZURpYWxvZz47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBZGRFeGlzdGluZ1RvU3BhY2VEaWFsb2c7XG5cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNEJBO0FBQ0EsTUFBTUEsVUFBVSxHQUFHLEtBQUssRUFBeEI7QUFDQSxNQUFNQyxhQUFhLEdBQUcsRUFBdEI7QUFDQSxNQUFNQyxZQUFZLEdBQUcsRUFBckI7O0FBU08sTUFBTUMsS0FBSyxHQUFHLFFBQWlDO0VBQUEsSUFBaEM7SUFBRUMsSUFBRjtJQUFRQyxPQUFSO0lBQWlCQztFQUFqQixDQUFnQztFQUNsRCxvQkFBTztJQUFPLFNBQVMsRUFBQztFQUFqQixHQUNERixJQUFJLEVBQUVHLFdBQU4sa0JBQ0ksNkJBQUMs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