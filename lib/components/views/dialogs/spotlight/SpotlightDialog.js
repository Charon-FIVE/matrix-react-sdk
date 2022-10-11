"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useWebSearchMetrics = exports.default = exports.Filter = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _classnames = _interopRequireDefault(require("classnames"));

var _lodash = require("lodash");

var _matrix = require("matrix-js-sdk/src/matrix");

var _utils = require("matrix-js-sdk/src/utils");

var _react = _interopRequireWildcard(require("react"));

var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));

var _KeyboardShortcuts = require("../../../../accessibility/KeyboardShortcuts");

var _RovingTabIndex = require("../../../../accessibility/RovingTabIndex");

var _Media = require("../../../../customisations/Media");

var _actions = require("../../../../dispatcher/actions");

var _dispatcher = _interopRequireDefault(require("../../../../dispatcher/dispatcher"));

var _useDebouncedCallback = require("../../../../hooks/spotlight/useDebouncedCallback");

var _useRecentSearches = require("../../../../hooks/spotlight/useRecentSearches");

var _useProfileInfo = require("../../../../hooks/useProfileInfo");

var _usePublicRoomDirectory = require("../../../../hooks/usePublicRoomDirectory");

var _useSettings = require("../../../../hooks/useSettings");

var _useSpaceResults = require("../../../../hooks/useSpaceResults");

var _useUserDirectory = require("../../../../hooks/useUserDirectory");

var _KeyBindingsManager = require("../../../../KeyBindingsManager");

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _PosthogAnalytics = require("../../../../PosthogAnalytics");

var _RoomAliasCache = require("../../../../RoomAliasCache");

var _RoomInvite = require("../../../../RoomInvite");

var _SdkConfig = _interopRequireDefault(require("../../../../SdkConfig"));

var _SettingLevel = require("../../../../settings/SettingLevel");

var _SettingsStore = _interopRequireDefault(require("../../../../settings/SettingsStore"));

var _BreadcrumbsStore = require("../../../../stores/BreadcrumbsStore");

var _RoomNotificationStateStore = require("../../../../stores/notifications/RoomNotificationStateStore");

var _RecentAlgorithm = require("../../../../stores/room-list/algorithms/tag-sorting/RecentAlgorithm");

var _RoomViewStore = require("../../../../stores/RoomViewStore");

var _spaces = require("../../../../stores/spaces");

var _SpaceStore = _interopRequireDefault(require("../../../../stores/spaces/SpaceStore"));

var _directMessages = require("../../../../utils/direct-messages");

var _DMRoomMap = _interopRequireDefault(require("../../../../utils/DMRoomMap"));

var _Permalinks = require("../../../../utils/permalinks/Permalinks");

var _SortMembers = require("../../../../utils/SortMembers");

var _strings = require("../../../../utils/strings");

var _BaseAvatar = _interopRequireDefault(require("../../avatars/BaseAvatar"));

var _DecoratedRoomAvatar = _interopRequireDefault(require("../../avatars/DecoratedRoomAvatar"));

var _SearchResultAvatar = require("../../avatars/SearchResultAvatar");

var _NetworkDropdown = require("../../directory/NetworkDropdown");

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var _LabelledCheckbox = _interopRequireDefault(require("../../elements/LabelledCheckbox"));

var _Spinner = _interopRequireDefault(require("../../elements/Spinner"));

var _NotificationBadge = _interopRequireDefault(require("../../rooms/NotificationBadge"));

var _BaseDialog = _interopRequireDefault(require("../BaseDialog"));

var _FeedbackDialog = _interopRequireDefault(require("../FeedbackDialog"));

var _Option = require("./Option");

var _PublicRoomResultDetails = require("./PublicRoomResultDetails");

var _RoomResultContextMenus = require("./RoomResultContextMenus");

var _RoomContextDetails = require("../../rooms/RoomContextDetails");

var _TooltipOption = require("./TooltipOption");

var _isLocalRoom = require("../../../../utils/localRoom/isLocalRoom");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021-2022 The Matrix.org Foundation C.I.C.

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
const MAX_RECENT_SEARCHES = 10;
const SECTION_LIMIT = 50; // only show 50 results per section for performance reasons

const AVATAR_SIZE = 24;

function refIsForRecentlyViewed(ref) {
  return ref.current?.id?.startsWith("mx_SpotlightDialog_button_recentlyViewed_") === true;
}

function getRoomTypes(showRooms, showSpaces) {
  const roomTypes = new Set();
  if (showRooms) roomTypes.add(null);
  if (showSpaces) roomTypes.add(_matrix.RoomType.Space);
  return roomTypes;
}

var Section;

(function (Section) {
  Section[Section["People"] = 0] = "People";
  Section[Section["Rooms"] = 1] = "Rooms";
  Section[Section["Spaces"] = 2] = "Spaces";
  Section[Section["Suggestions"] = 3] = "Suggestions";
  Section[Section["PublicRooms"] = 4] = "PublicRooms";
})(Section || (Section = {}));

let Filter;
exports.Filter = Filter;

(function (Filter) {
  Filter[Filter["People"] = 0] = "People";
  Filter[Filter["PublicRooms"] = 1] = "PublicRooms";
})(Filter || (exports.Filter = Filter = {}));

function filterToLabel(filter) {
  switch (filter) {
    case Filter.People:
      return (0, _languageHandler._t)("People");

    case Filter.PublicRooms:
      return (0, _languageHandler._t)("Public rooms");
  }
}

const isRoomResult = result => !!result?.room;

const isPublicRoomResult = result => !!result?.publicRoom;

const isMemberResult = result => !!result?.member;

const toPublicRoomResult = publicRoom => ({
  publicRoom,
  section: Section.PublicRooms,
  filter: [Filter.PublicRooms],
  query: [publicRoom.room_id.toLowerCase(), publicRoom.canonical_alias?.toLowerCase(), publicRoom.name?.toLowerCase(), (0, _sanitizeHtml.default)(publicRoom.topic?.toLowerCase() ?? "", {
    allowedTags: []
  }), ...(publicRoom.aliases?.map(it => it.toLowerCase()) || [])].filter(Boolean)
});

const toRoomResult = room => {
  const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

  const otherUserId = _DMRoomMap.default.shared().getUserIdForRoomId(room.roomId);

  if (otherUserId) {
    const otherMembers = room.getMembers().filter(it => it.userId !== myUserId);
    const query = [...otherMembers.map(it => it.name.toLowerCase()), ...otherMembers.map(it => it.userId.toLowerCase())].filter(Boolean);
    return {
      room,
      section: Section.People,
      filter: [Filter.People],
      query
    };
  } else if (room.isSpaceRoom()) {
    return {
      room,
      section: Section.Spaces,
      filter: []
    };
  } else {
    return {
      room,
      section: Section.Rooms,
      filter: []
    };
  }
};

const toMemberResult = member => ({
  member,
  section: Section.Suggestions,
  filter: [Filter.People],
  query: [member.userId.toLowerCase(), member.name.toLowerCase()].filter(Boolean)
});

const recentAlgorithm = new _RecentAlgorithm.RecentAlgorithm();

const useWebSearchMetrics = (numResults, queryLength, viaSpotlight) => {
  (0, _react.useEffect)(() => {
    if (!queryLength) return; // send metrics after a 1s debounce

    const timeoutId = setTimeout(() => {
      _PosthogAnalytics.PosthogAnalytics.instance.trackEvent({
        eventName: "WebSearch",
        viaSpotlight,
        numResults,
        queryLength
      });
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [numResults, queryLength, viaSpotlight]);
};

exports.useWebSearchMetrics = useWebSearchMetrics;

const findVisibleRooms = cli => {
  return cli.getVisibleRooms().filter(room => {
    // Do not show local rooms
    if ((0, _isLocalRoom.isLocalRoom)(room)) return false; // TODO we may want to put invites in their own list

    return room.getMyMembership() === "join" || room.getMyMembership() == "invite";
  });
};

const findVisibleRoomMembers = function (cli) {
  let filterDMs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return Object.values(findVisibleRooms(cli).filter(room => !filterDMs || !_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId)).reduce((members, room) => {
    for (const member of room.getJoinedMembers()) {
      members[member.userId] = member;
    }

    return members;
  }, {})).filter(it => it.userId !== cli.getUserId());
};

const roomAriaUnreadLabel = (room, notification) => {
  if (notification.hasMentions) {
    return (0, _languageHandler._t)("%(count)s unread messages including mentions.", {
      count: notification.count
    });
  } else if (notification.hasUnreadCount) {
    return (0, _languageHandler._t)("%(count)s unread messages.", {
      count: notification.count
    });
  } else if (notification.isUnread) {
    return (0, _languageHandler._t)("Unread messages.");
  } else {
    return undefined;
  }
};

const SpotlightDialog = _ref => {
  let {
    initialText = "",
    initialFilter = null,
    onFinished
  } = _ref;
  const inputRef = (0, _react.useRef)();
  const scrollContainerRef = (0, _react.useRef)();

  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  const rovingContext = (0, _react.useContext)(_RovingTabIndex.RovingTabIndexContext);
  const [query, _setQuery] = (0, _react.useState)(initialText);
  const [recentSearches, clearRecentSearches] = (0, _useRecentSearches.useRecentSearches)();
  const [filter, setFilterInternal] = (0, _react.useState)(initialFilter);
  const setFilter = (0, _react.useCallback)(filter => {
    setFilterInternal(filter);
    inputRef.current?.focus();
    scrollContainerRef.current?.scrollTo?.({
      top: 0
    });
  }, []);
  const memberComparator = (0, _react.useMemo)(() => {
    const activityScores = (0, _SortMembers.buildActivityScores)(cli);
    const memberScores = (0, _SortMembers.buildMemberScores)(cli);
    return (0, _SortMembers.compareMembers)(activityScores, memberScores);
  }, [cli]);
  const ownInviteLink = (0, _Permalinks.makeUserPermalink)(cli.getUserId());
  const [inviteLinkCopied, setInviteLinkCopied] = (0, _react.useState)(false);
  const trimmedQuery = (0, _react.useMemo)(() => query.trim(), [query]);
  const exploringPublicSpacesEnabled = (0, _useSettings.useFeatureEnabled)("feature_exploring_public_spaces");
  const {
    loading: publicRoomsLoading,
    publicRooms,
    protocols,
    config,
    setConfig,
    search: searchPublicRooms
  } = (0, _usePublicRoomDirectory.usePublicRoomDirectory)();
  const [showRooms, setShowRooms] = (0, _react.useState)(true);
  const [showSpaces, setShowSpaces] = (0, _react.useState)(false);
  const {
    loading: peopleLoading,
    users,
    search: searchPeople
  } = (0, _useUserDirectory.useUserDirectory)();
  const {
    loading: profileLoading,
    profile,
    search: searchProfileInfo
  } = (0, _useProfileInfo.useProfileInfo)();
  const searchParams = (0, _react.useMemo)(() => [{
    query: trimmedQuery,
    roomTypes: getRoomTypes(showRooms, showSpaces),
    limit: SECTION_LIMIT
  }], [trimmedQuery, showRooms, showSpaces]);
  (0, _useDebouncedCallback.useDebouncedCallback)(filter === Filter.PublicRooms, searchPublicRooms, searchParams);
  (0, _useDebouncedCallback.useDebouncedCallback)(filter === Filter.People, searchPeople, searchParams);
  (0, _useDebouncedCallback.useDebouncedCallback)(filter === Filter.People, searchProfileInfo, searchParams);
  const possibleResults = (0, _react.useMemo)(() => {
    const roomResults = findVisibleRooms(cli).map(toRoomResult); // If we already have a DM with the user we're looking for, we will
    // show that DM instead of the user themselves

    const alreadyAddedUserIds = roomResults.reduce((userIds, result) => {
      const userId = _DMRoomMap.default.shared().getUserIdForRoomId(result.room.roomId);

      if (!userId) return userIds;
      if (result.room.getJoinedMemberCount() > 2) return userIds;
      userIds.add(userId);
      return userIds;
    }, new Set());
    const userResults = [];

    for (const user of [...findVisibleRoomMembers(cli), ...users]) {
      // Make sure we don't have any user more than once
      if (alreadyAddedUserIds.has(user.userId)) continue;
      alreadyAddedUserIds.add(user.userId);
      userResults.push(toMemberResult(user));
    }

    return [..._SpaceStore.default.instance.enabledMetaSpaces.map(spaceKey => ({
      section: Section.Spaces,
      filter: [],
      avatar: /*#__PURE__*/_react.default.createElement("div", {
        className: (0, _classnames.default)("mx_SpotlightDialog_metaspaceResult", `mx_SpotlightDialog_metaspaceResult_${spaceKey}`)
      }),
      name: (0, _spaces.getMetaSpaceName)(spaceKey, _SpaceStore.default.instance.allRoomsInHome),

      onClick() {
        _SpaceStore.default.instance.setActiveSpace(spaceKey);
      }

    })), ...roomResults, ...userResults, ...(profile && !alreadyAddedUserIds.has(profile.user_id) ? [new _directMessages.DirectoryMember(profile)] : []).map(toMemberResult), ...publicRooms.map(toPublicRoomResult)].filter(result => filter === null || result.filter.includes(filter));
  }, [cli, users, profile, publicRooms, filter]);
  const results = (0, _react.useMemo)(() => {
    const results = {
      [Section.People]: [],
      [Section.Rooms]: [],
      [Section.Spaces]: [],
      [Section.Suggestions]: [],
      [Section.PublicRooms]: []
    }; // Group results in their respective sections

    if (trimmedQuery) {
      const lcQuery = trimmedQuery.toLowerCase();
      const normalizedQuery = (0, _utils.normalize)(trimmedQuery);
      possibleResults.forEach(entry => {
        if (isRoomResult(entry)) {
          if (!entry.room.normalizedName?.includes(normalizedQuery) && !entry.room.getCanonicalAlias()?.toLowerCase().includes(lcQuery) && !entry.query?.some(q => q.includes(lcQuery))) return; // bail, does not match query
        } else if (isMemberResult(entry)) {
          if (!entry.query?.some(q => q.includes(lcQuery))) return; // bail, does not match query
        } else if (isPublicRoomResult(entry)) {
          if (!entry.query?.some(q => q.includes(lcQuery))) return; // bail, does not match query
        } else {
          if (!entry.name.toLowerCase().includes(lcQuery) && !entry.query?.some(q => q.includes(lcQuery))) return; // bail, does not match query
        }

        results[entry.section].push(entry);
      });
    } else if (filter === Filter.PublicRooms) {
      // return all results for public rooms if no query is given
      possibleResults.forEach(entry => {
        if (isPublicRoomResult(entry)) {
          results[entry.section].push(entry);
        }
      });
    } else if (filter === Filter.People) {
      // return all results for people if no query is given
      possibleResults.forEach(entry => {
        if (isMemberResult(entry)) {
          results[entry.section].push(entry);
        }
      });
    } // Sort results by most recent activity


    const myUserId = cli.getUserId();

    for (const resultArray of Object.values(results)) {
      resultArray.sort((a, b) => {
        if (isRoomResult(a) || isRoomResult(b)) {
          // Room results should appear at the top of the list
          if (!isRoomResult(b)) return -1;
          if (!isRoomResult(a)) return -1;
          return recentAlgorithm.getLastTs(b.room, myUserId) - recentAlgorithm.getLastTs(a.room, myUserId);
        } else if (isMemberResult(a) || isMemberResult(b)) {
          // Member results should appear just after room results
          if (!isMemberResult(b)) return -1;
          if (!isMemberResult(a)) return -1;
          return memberComparator(a.member, b.member);
        }
      });
    }

    return results;
  }, [trimmedQuery, filter, cli, possibleResults, memberComparator]);
  const numResults = (0, _lodash.sum)(Object.values(results).map(it => it.length));
  useWebSearchMetrics(numResults, query.length, true);
  const activeSpace = _SpaceStore.default.instance.activeSpaceRoom;
  const [spaceResults, spaceResultsLoading] = (0, _useSpaceResults.useSpaceResults)(activeSpace, query);

  const setQuery = e => {
    const newQuery = e.currentTarget.value;

    _setQuery(newQuery);
  };

  (0, _react.useEffect)(() => {
    setImmediate(() => {
      let ref;

      if (rovingContext.state.refs) {
        ref = rovingContext.state.refs[0];
      }

      rovingContext.dispatch({
        type: _RovingTabIndex.Type.SetFocus,
        payload: {
          ref
        }
      });
      ref?.current?.scrollIntoView?.({
        block: "nearest"
      });
    }); // we intentionally ignore changes to the rovingContext for the purpose of this hook
    // we only want to reset the focus whenever the results or filters change
    // eslint-disable-next-line
  }, [results, filter]);

  const viewRoom = function (room) {
    let persist = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let viaKeyboard = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (persist) {
      const recents = new Set(_SettingsStore.default.getValue("SpotlightSearch.recentSearches", null).reverse()); // remove & add the room to put it at the end

      recents.delete(room.roomId);
      recents.add(room.roomId);

      _SettingsStore.default.setValue("SpotlightSearch.recentSearches", null, _SettingLevel.SettingLevel.ACCOUNT, Array.from(recents).reverse().slice(0, MAX_RECENT_SEARCHES));
    }

    _dispatcher.default.dispatch({
      action: _actions.Action.ViewRoom,
      metricsTrigger: "WebUnifiedSearch",
      metricsViaKeyboard: viaKeyboard,
      room_id: room.roomId,
      room_alias: room.roomAlias,
      auto_join: room.autoJoin,
      should_peek: room.shouldPeek
    });

    onFinished();
  };

  let otherSearchesSection;

  if (trimmedQuery || filter !== Filter.PublicRooms) {
    otherSearchesSection = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SpotlightDialog_section mx_SpotlightDialog_otherSearches",
      role: "group",
      "aria-labelledby": "mx_SpotlightDialog_section_otherSearches"
    }, /*#__PURE__*/_react.default.createElement("h4", {
      id: "mx_SpotlightDialog_section_otherSearches"
    }, trimmedQuery ? (0, _languageHandler._t)('Use "%(query)s" to search', {
      query
    }) : (0, _languageHandler._t)("Search for")), /*#__PURE__*/_react.default.createElement("div", null, filter !== Filter.PublicRooms && /*#__PURE__*/_react.default.createElement(_Option.Option, {
      id: "mx_SpotlightDialog_button_explorePublicRooms",
      className: "mx_SpotlightDialog_explorePublicRooms",
      onClick: () => setFilter(Filter.PublicRooms)
    }, filterToLabel(Filter.PublicRooms)), filter !== Filter.People && /*#__PURE__*/_react.default.createElement(_Option.Option, {
      id: "mx_SpotlightDialog_button_startChat",
      className: "mx_SpotlightDialog_startChat",
      onClick: () => setFilter(Filter.People)
    }, filterToLabel(Filter.People))));
  }

  let content;

  if (trimmedQuery || filter !== null) {
    const resultMapper = result => {
      if (isRoomResult(result)) {
        const notification = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(result.room);

        const unreadLabel = roomAriaUnreadLabel(result.room, notification);
        const ariaProperties = {
          "aria-label": unreadLabel ? `${result.room.name} ${unreadLabel}` : result.room.name,
          "aria-describedby": `mx_SpotlightDialog_button_result_${result.room.roomId}_details`
        };
        return /*#__PURE__*/_react.default.createElement(_Option.Option, (0, _extends2.default)({
          id: `mx_SpotlightDialog_button_result_${result.room.roomId}`,
          key: `${Section[result.section]}-${result.room.roomId}`,
          onClick: ev => {
            viewRoom({
              roomId: result.room.roomId
            }, true, ev?.type !== "click");
          },
          endAdornment: /*#__PURE__*/_react.default.createElement(_RoomResultContextMenus.RoomResultContextMenus, {
            room: result.room
          })
        }, ariaProperties), /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
          room: result.room,
          avatarSize: AVATAR_SIZE,
          tooltipProps: {
            tabIndex: -1
          }
        }), result.room.name, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
          notification: notification
        }), /*#__PURE__*/_react.default.createElement(_RoomContextDetails.RoomContextDetails, {
          id: `mx_SpotlightDialog_button_result_${result.room.roomId}_details`,
          className: "mx_SpotlightDialog_result_details",
          room: result.room
        }));
      }

      if (isMemberResult(result)) {
        return /*#__PURE__*/_react.default.createElement(_Option.Option, {
          id: `mx_SpotlightDialog_button_result_${result.member.userId}`,
          key: `${Section[result.section]}-${result.member.userId}`,
          onClick: () => {
            (0, _directMessages.startDmOnFirstMessage)(cli, [result.member]);
            onFinished();
          },
          "aria-label": result.member instanceof _matrix.RoomMember ? result.member.rawDisplayName : result.member.name,
          "aria-describedby": `mx_SpotlightDialog_button_result_${result.member.userId}_details`
        }, /*#__PURE__*/_react.default.createElement(_SearchResultAvatar.SearchResultAvatar, {
          user: result.member,
          size: AVATAR_SIZE
        }), result.member instanceof _matrix.RoomMember ? result.member.rawDisplayName : result.member.name, /*#__PURE__*/_react.default.createElement("div", {
          id: `mx_SpotlightDialog_button_result_${result.member.userId}_details`,
          className: "mx_SpotlightDialog_result_details"
        }, result.member.userId));
      }

      if (isPublicRoomResult(result)) {
        const clientRoom = cli.getRoom(result.publicRoom.room_id); // Element Web currently does not allow guests to join rooms, so we
        // instead show them view buttons for all rooms. If the room is not
        // world readable, a modal will appear asking you to register first. If
        // it is readable, the preview appears as normal.

        const showViewButton = clientRoom?.getMyMembership() === "join" || result.publicRoom.world_readable || cli.isGuest();

        const listener = ev => {
          const {
            publicRoom
          } = result;
          viewRoom({
            roomAlias: publicRoom.canonical_alias || publicRoom.aliases?.[0],
            roomId: publicRoom.room_id,
            autoJoin: !result.publicRoom.world_readable && !cli.isGuest(),
            shouldPeek: result.publicRoom.world_readable || cli.isGuest()
          }, true, ev.type !== "click");
        };

        return /*#__PURE__*/_react.default.createElement(_Option.Option, {
          id: `mx_SpotlightDialog_button_result_${result.publicRoom.room_id}`,
          className: "mx_SpotlightDialog_result_multiline",
          key: `${Section[result.section]}-${result.publicRoom.room_id}`,
          onClick: listener,
          endAdornment: /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: showViewButton ? "primary_outline" : "primary",
            onClick: listener,
            tabIndex: -1
          }, showViewButton ? (0, _languageHandler._t)("View") : (0, _languageHandler._t)("Join")),
          "aria-labelledby": `mx_SpotlightDialog_button_result_${result.publicRoom.room_id}_name`,
          "aria-describedby": `mx_SpotlightDialog_button_result_${result.publicRoom.room_id}_alias`,
          "aria-details": `mx_SpotlightDialog_button_result_${result.publicRoom.room_id}_details`
        }, /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
          className: "mx_SearchResultAvatar",
          url: result?.publicRoom?.avatar_url ? (0, _Media.mediaFromMxc)(result?.publicRoom?.avatar_url).getSquareThumbnailHttp(AVATAR_SIZE) : null,
          name: result.publicRoom.name,
          idName: result.publicRoom.room_id,
          width: AVATAR_SIZE,
          height: AVATAR_SIZE
        }), /*#__PURE__*/_react.default.createElement(_PublicRoomResultDetails.PublicRoomResultDetails, {
          room: result.publicRoom,
          labelId: `mx_SpotlightDialog_button_result_${result.publicRoom.room_id}_name`,
          descriptionId: `mx_SpotlightDialog_button_result_${result.publicRoom.room_id}_alias`,
          detailsId: `mx_SpotlightDialog_button_result_${result.publicRoom.room_id}_details`
        }));
      } // IResult case


      return /*#__PURE__*/_react.default.createElement(_Option.Option, {
        id: `mx_SpotlightDialog_button_result_${result.name}`,
        key: `${Section[result.section]}-${result.name}`,
        onClick: result.onClick
      }, result.avatar, result.name, result.description);
    };

    let peopleSection;

    if (results[Section.People].length) {
      peopleSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_results",
        role: "group",
        "aria-labelledby": "mx_SpotlightDialog_section_people"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        id: "mx_SpotlightDialog_section_people"
      }, (0, _languageHandler._t)("Recent Conversations")), /*#__PURE__*/_react.default.createElement("div", null, results[Section.People].slice(0, SECTION_LIMIT).map(resultMapper)));
    }

    let suggestionsSection;

    if (results[Section.Suggestions].length && filter === Filter.People) {
      suggestionsSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_results",
        role: "group",
        "aria-labelledby": "mx_SpotlightDialog_section_suggestions"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        id: "mx_SpotlightDialog_section_suggestions"
      }, (0, _languageHandler._t)("Suggestions")), /*#__PURE__*/_react.default.createElement("div", null, results[Section.Suggestions].slice(0, SECTION_LIMIT).map(resultMapper)));
    }

    let roomsSection;

    if (results[Section.Rooms].length) {
      roomsSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_results",
        role: "group",
        "aria-labelledby": "mx_SpotlightDialog_section_rooms"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        id: "mx_SpotlightDialog_section_rooms"
      }, (0, _languageHandler._t)("Rooms")), /*#__PURE__*/_react.default.createElement("div", null, results[Section.Rooms].slice(0, SECTION_LIMIT).map(resultMapper)));
    }

    let spacesSection;

    if (results[Section.Spaces].length) {
      spacesSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_results",
        role: "group",
        "aria-labelledby": "mx_SpotlightDialog_section_spaces"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        id: "mx_SpotlightDialog_section_spaces"
      }, (0, _languageHandler._t)("Spaces you're in")), /*#__PURE__*/_react.default.createElement("div", null, results[Section.Spaces].slice(0, SECTION_LIMIT).map(resultMapper)));
    }

    let publicRoomsSection;

    if (filter === Filter.PublicRooms) {
      publicRoomsSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_results",
        role: "group",
        "aria-labelledby": "mx_SpotlightDialog_section_publicRooms"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_sectionHeader"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        id: "mx_SpotlightDialog_section_publicRooms"
      }, (0, _languageHandler._t)("Suggestions")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_options"
      }, exploringPublicSpacesEnabled && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_LabelledCheckbox.default, {
        label: (0, _languageHandler._t)("Show rooms"),
        value: showRooms,
        onChange: setShowRooms
      }), /*#__PURE__*/_react.default.createElement(_LabelledCheckbox.default, {
        label: (0, _languageHandler._t)("Show spaces"),
        value: showSpaces,
        onChange: setShowSpaces
      })), /*#__PURE__*/_react.default.createElement(_NetworkDropdown.NetworkDropdown, {
        protocols: protocols,
        config: config ?? null,
        setConfig: setConfig
      }))), /*#__PURE__*/_react.default.createElement("div", null, " ", showRooms || showSpaces ? results[Section.PublicRooms].slice(0, SECTION_LIMIT).map(resultMapper) : /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_otherSearches_messageSearchText"
      }, (0, _languageHandler._t)("You cannot search for rooms that are neither a room nor a space")), " "));
    }

    let spaceRoomsSection;

    if (spaceResults.length && activeSpace && filter === null) {
      spaceRoomsSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_results",
        role: "group",
        "aria-labelledby": "mx_SpotlightDialog_section_spaceRooms"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        id: "mx_SpotlightDialog_section_spaceRooms"
      }, (0, _languageHandler._t)("Other rooms in %(spaceName)s", {
        spaceName: activeSpace.name
      })), /*#__PURE__*/_react.default.createElement("div", null, spaceResults.slice(0, SECTION_LIMIT).map(room => /*#__PURE__*/_react.default.createElement(_Option.Option, {
        id: `mx_SpotlightDialog_button_result_${room.room_id}`,
        key: room.room_id,
        onClick: ev => {
          viewRoom({
            roomId: room.room_id
          }, true, ev?.type !== "click");
        }
      }, /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
        name: room.name,
        idName: room.room_id,
        url: room.avatar_url ? (0, _Media.mediaFromMxc)(room.avatar_url).getSquareThumbnailHttp(AVATAR_SIZE) : null,
        width: AVATAR_SIZE,
        height: AVATAR_SIZE
      }), room.name || room.canonical_alias, room.name && room.canonical_alias && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_result_details"
      }, room.canonical_alias))), spaceResultsLoading && /*#__PURE__*/_react.default.createElement(_Spinner.default, null)));
    }

    let joinRoomSection;

    if (trimmedQuery.startsWith("#") && trimmedQuery.includes(":") && (!(0, _RoomAliasCache.getCachedRoomIDForAlias)(trimmedQuery) || !cli.getRoom((0, _RoomAliasCache.getCachedRoomIDForAlias)(trimmedQuery)))) {
      joinRoomSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_otherSearches",
        role: "group"
      }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Option.Option, {
        id: "mx_SpotlightDialog_button_joinRoomAlias",
        className: "mx_SpotlightDialog_joinRoomAlias",
        onClick: ev => {
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoom,
            room_alias: trimmedQuery,
            auto_join: true,
            metricsTrigger: "WebUnifiedSearch",
            metricsViaKeyboard: ev?.type !== "click"
          });

          onFinished();
        }
      }, (0, _languageHandler._t)("Join %(roomAddress)s", {
        roomAddress: trimmedQuery
      }))));
    }

    let hiddenResultsSection;

    if (filter === Filter.People) {
      hiddenResultsSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_hiddenResults",
        role: "group"
      }, /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)('Some results may be hidden for privacy')), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_otherSearches_messageSearchText"
      }, (0, _languageHandler._t)("If you can't see who you're looking for, send them your invite link.")), /*#__PURE__*/_react.default.createElement(_TooltipOption.TooltipOption, {
        id: "mx_SpotlightDialog_button_inviteLink",
        className: "mx_SpotlightDialog_inviteLink",
        onClick: () => {
          setInviteLinkCopied(true);
          (0, _strings.copyPlaintext)(ownInviteLink);
        },
        onHideTooltip: () => setInviteLinkCopied(false),
        title: inviteLinkCopied ? (0, _languageHandler._t)("Copied!") : (0, _languageHandler._t)("Copy")
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_AccessibleButton mx_AccessibleButton_hasKind mx_AccessibleButton_kind_primary_outline"
      }, (0, _languageHandler._t)("Copy invite link"))));
    } else if (trimmedQuery && filter === Filter.PublicRooms) {
      hiddenResultsSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_hiddenResults",
        role: "group"
      }, /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)('Some results may be hidden')), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_otherSearches_messageSearchText"
      }, (0, _languageHandler._t)("If you can't find the room you're looking for, " + "ask for an invite or create a new room.")), /*#__PURE__*/_react.default.createElement(_Option.Option, {
        id: "mx_SpotlightDialog_button_createNewRoom",
        className: "mx_SpotlightDialog_createRoom",
        onClick: () => _dispatcher.default.dispatch({
          action: 'view_create_room',
          public: true,
          defaultName: (0, _lodash.capitalize)(trimmedQuery)
        })
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_AccessibleButton mx_AccessibleButton_hasKind mx_AccessibleButton_kind_primary_outline"
      }, (0, _languageHandler._t)("Create new room"))));
    }

    let groupChatSection;

    if (filter === Filter.People) {
      groupChatSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_otherSearches",
        role: "group",
        "aria-labelledby": "mx_SpotlightDialog_section_groupChat"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        id: "mx_SpotlightDialog_section_groupChat"
      }, (0, _languageHandler._t)('Other options')), /*#__PURE__*/_react.default.createElement(_Option.Option, {
        id: "mx_SpotlightDialog_button_startGroupChat",
        className: "mx_SpotlightDialog_startGroupChat",
        onClick: () => (0, _RoomInvite.showStartChatInviteDialog)(trimmedQuery)
      }, (0, _languageHandler._t)("Start a group chat")));
    }

    let messageSearchSection;

    if (filter === null) {
      messageSearchSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_otherSearches",
        role: "group",
        "aria-labelledby": "mx_SpotlightDialog_section_messageSearch"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        id: "mx_SpotlightDialog_section_messageSearch"
      }, (0, _languageHandler._t)("Other searches")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_otherSearches_messageSearchText"
      }, (0, _languageHandler._t)("To search messages, look for this icon at the top of a room <icon/>", {}, {
        icon: () => /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SpotlightDialog_otherSearches_messageSearchIcon"
        })
      })));
    }

    content = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, peopleSection, suggestionsSection, roomsSection, spacesSection, spaceRoomsSection, publicRoomsSection, joinRoomSection, hiddenResultsSection, otherSearchesSection, groupChatSection, messageSearchSection);
  } else {
    let recentSearchesSection;

    if (recentSearches.length) {
      recentSearchesSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpotlightDialog_section mx_SpotlightDialog_recentSearches",
        role: "group" // Firefox sometimes makes this element focusable due to overflow,
        // so force it out of tab order by default.
        ,
        tabIndex: -1,
        "aria-labelledby": "mx_SpotlightDialog_section_recentSearches"
      }, /*#__PURE__*/_react.default.createElement("h4", null, /*#__PURE__*/_react.default.createElement("span", {
        id: "mx_SpotlightDialog_section_recentSearches"
      }, (0, _languageHandler._t)("Recent searches")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: clearRecentSearches
      }, (0, _languageHandler._t)("Clear"))), /*#__PURE__*/_react.default.createElement("div", null, recentSearches.map(room => {
        const notification = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(room);

        const unreadLabel = roomAriaUnreadLabel(room, notification);
        const ariaProperties = {
          "aria-label": unreadLabel ? `${room.name} ${unreadLabel}` : room.name,
          "aria-describedby": `mx_SpotlightDialog_button_recentSearch_${room.roomId}_details`
        };
        return /*#__PURE__*/_react.default.createElement(_Option.Option, (0, _extends2.default)({
          id: `mx_SpotlightDialog_button_recentSearch_${room.roomId}`,
          key: room.roomId,
          onClick: ev => {
            viewRoom({
              roomId: room.roomId
            }, true, ev?.type !== "click");
          },
          endAdornment: /*#__PURE__*/_react.default.createElement(_RoomResultContextMenus.RoomResultContextMenus, {
            room: room
          })
        }, ariaProperties), /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
          room: room,
          avatarSize: AVATAR_SIZE,
          tooltipProps: {
            tabIndex: -1
          }
        }), room.name, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
          notification: notification
        }), /*#__PURE__*/_react.default.createElement(_RoomContextDetails.RoomContextDetails, {
          id: `mx_SpotlightDialog_button_recentSearch_${room.roomId}_details`,
          className: "mx_SpotlightDialog_result_details",
          room: room
        }));
      })));
    }

    content = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SpotlightDialog_section mx_SpotlightDialog_recentlyViewed",
      role: "group",
      "aria-labelledby": "mx_SpotlightDialog_section_recentlyViewed"
    }, /*#__PURE__*/_react.default.createElement("h4", {
      id: "mx_SpotlightDialog_section_recentlyViewed"
    }, (0, _languageHandler._t)("Recently viewed")), /*#__PURE__*/_react.default.createElement("div", null, _BreadcrumbsStore.BreadcrumbsStore.instance.rooms.filter(r => r.roomId !== _RoomViewStore.RoomViewStore.instance.getRoomId()).map(room => /*#__PURE__*/_react.default.createElement(_TooltipOption.TooltipOption, {
      id: `mx_SpotlightDialog_button_recentlyViewed_${room.roomId}`,
      title: room.name,
      key: room.roomId,
      onClick: ev => {
        viewRoom({
          roomId: room.roomId
        }, false, ev.type !== "click");
      }
    }, /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
      room: room,
      avatarSize: 32,
      tooltipProps: {
        tabIndex: -1
      }
    }), room.name)))), recentSearchesSection, otherSearchesSection);
  }

  const onDialogKeyDown = ev => {
    const navigationAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getNavigationAction(ev);

    switch (navigationAction) {
      case _KeyboardShortcuts.KeyBindingAction.FilterRooms:
        ev.stopPropagation();
        ev.preventDefault();
        onFinished();
        break;
    }

    let ref;
    const accessibilityAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

    switch (accessibilityAction) {
      case _KeyboardShortcuts.KeyBindingAction.Escape:
        ev.stopPropagation();
        ev.preventDefault();
        onFinished();
        break;

      case _KeyboardShortcuts.KeyBindingAction.ArrowUp:
      case _KeyboardShortcuts.KeyBindingAction.ArrowDown:
        ev.stopPropagation();
        ev.preventDefault();

        if (rovingContext.state.refs.length > 0) {
          let refs = rovingContext.state.refs;

          if (!query && !filter !== null) {
            // If the current selection is not in the recently viewed row then only include the
            // first recently viewed so that is the target when the user is switching into recently viewed.
            const keptRecentlyViewedRef = refIsForRecentlyViewed(rovingContext.state.activeRef) ? rovingContext.state.activeRef : refs.find(refIsForRecentlyViewed); // exclude all other recently viewed items from the list so up/down arrows skip them

            refs = refs.filter(ref => ref === keptRecentlyViewedRef || !refIsForRecentlyViewed(ref));
          }

          const idx = refs.indexOf(rovingContext.state.activeRef);
          ref = (0, _RovingTabIndex.findSiblingElement)(refs, idx + (accessibilityAction === _KeyboardShortcuts.KeyBindingAction.ArrowUp ? -1 : 1));
        }

        break;

      case _KeyboardShortcuts.KeyBindingAction.ArrowLeft:
      case _KeyboardShortcuts.KeyBindingAction.ArrowRight:
        // only handle these keys when we are in the recently viewed row of options
        if (!query && !filter !== null && rovingContext.state.refs.length > 0 && refIsForRecentlyViewed(rovingContext.state.activeRef)) {
          // we only intercept left/right arrows when the field is empty, and they'd do nothing anyway
          ev.stopPropagation();
          ev.preventDefault();
          const refs = rovingContext.state.refs.filter(refIsForRecentlyViewed);
          const idx = refs.indexOf(rovingContext.state.activeRef);
          ref = (0, _RovingTabIndex.findSiblingElement)(refs, idx + (accessibilityAction === _KeyboardShortcuts.KeyBindingAction.ArrowLeft ? -1 : 1));
        }

        break;
    }

    if (ref) {
      rovingContext.dispatch({
        type: _RovingTabIndex.Type.SetFocus,
        payload: {
          ref
        }
      });
      ref.current?.scrollIntoView({
        block: "nearest"
      });
    }
  };

  const onKeyDown = ev => {
    const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

    switch (action) {
      case _KeyboardShortcuts.KeyBindingAction.Backspace:
        if (!query && filter !== null) {
          ev.stopPropagation();
          ev.preventDefault();
          setFilter(null);
        }

        break;

      case _KeyboardShortcuts.KeyBindingAction.Enter:
        ev.stopPropagation();
        ev.preventDefault();
        rovingContext.state.activeRef?.current?.click();
        break;
    }
  };

  const openFeedback = _SdkConfig.default.get().bug_report_endpoint_url ? () => {
    _Modal.default.createDialog(_FeedbackDialog.default, {
      feature: "spotlight"
    });
  } : null;
  const activeDescendant = rovingContext.state.activeRef?.current?.id;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    id: "mx_SpotlightDialog_keyboardPrompt"
  }, (0, _languageHandler._t)("Use <arrows/> to scroll", {}, {
    arrows: () => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("kbd", null, "\u2193"), /*#__PURE__*/_react.default.createElement("kbd", null, "\u2191"), !filter !== null && !query && /*#__PURE__*/_react.default.createElement("kbd", null, "\u2190"), !filter !== null && !query && /*#__PURE__*/_react.default.createElement("kbd", null, "\u2192"))
  })), /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    className: "mx_SpotlightDialog",
    onFinished: onFinished,
    hasCancel: false,
    onKeyDown: onDialogKeyDown,
    screenName: "UnifiedSearch",
    "aria-label": (0, _languageHandler._t)("Search Dialog")
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpotlightDialog_searchBox mx_textinput"
  }, filter !== null && /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)("mx_SpotlightDialog_filter", {
      "mx_SpotlightDialog_filterPeople": filter === Filter.People,
      "mx_SpotlightDialog_filterPublicRooms": filter === Filter.PublicRooms
    })
  }, /*#__PURE__*/_react.default.createElement("span", null, filterToLabel(filter)), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    tabIndex: -1,
    alt: (0, _languageHandler._t)("Remove search filter for %(filter)s", {
      filter: filterToLabel(filter)
    }),
    className: "mx_SpotlightDialog_filter--close",
    onClick: () => setFilter(null)
  })), /*#__PURE__*/_react.default.createElement("input", {
    ref: inputRef,
    autoFocus: true,
    type: "text",
    autoComplete: "off",
    placeholder: (0, _languageHandler._t)("Search"),
    value: query,
    onChange: setQuery,
    onKeyDown: onKeyDown,
    "aria-owns": "mx_SpotlightDialog_content",
    "aria-activedescendant": activeDescendant,
    "aria-label": (0, _languageHandler._t)("Search"),
    "aria-describedby": "mx_SpotlightDialog_keyboardPrompt"
  }), (publicRoomsLoading || peopleLoading || profileLoading) && /*#__PURE__*/_react.default.createElement(_Spinner.default, {
    w: 24,
    h: 24
  })), /*#__PURE__*/_react.default.createElement("div", {
    ref: scrollContainerRef,
    id: "mx_SpotlightDialog_content",
    role: "listbox",
    "aria-activedescendant": activeDescendant,
    "aria-describedby": "mx_SpotlightDialog_keyboardPrompt"
  }, content), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpotlightDialog_footer"
  }, openFeedback && (0, _languageHandler._t)("Results not as expected? Please <a>give feedback</a>.", {}, {
    a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link_inline",
      onClick: openFeedback
    }, sub)
  }), openFeedback && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "primary_outline",
    onClick: openFeedback
  }, (0, _languageHandler._t)("Feedback")))));
};

const RovingSpotlightDialog = props => {
  return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexProvider, null, () => /*#__PURE__*/_react.default.createElement(SpotlightDialog, props));
};

var _default = RovingSpotlightDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfUkVDRU5UX1NFQVJDSEVTIiwiU0VDVElPTl9MSU1JVCIsIkFWQVRBUl9TSVpFIiwicmVmSXNGb3JSZWNlbnRseVZpZXdlZCIsInJlZiIsImN1cnJlbnQiLCJpZCIsInN0YXJ0c1dpdGgiLCJnZXRSb29tVHlwZXMiLCJzaG93Um9vbXMiLCJzaG93U3BhY2VzIiwicm9vbVR5cGVzIiwiU2V0IiwiYWRkIiwiUm9vbVR5cGUiLCJTcGFjZSIsIlNlY3Rpb24iLCJGaWx0ZXIiLCJmaWx0ZXJUb0xhYmVsIiwiZmlsdGVyIiwiUGVvcGxlIiwiX3QiLCJQdWJsaWNSb29tcyIsImlzUm9vbVJlc3VsdCIsInJlc3VsdCIsInJvb20iLCJpc1B1YmxpY1Jvb21SZXN1bHQiLCJwdWJsaWNSb29tIiwiaXNNZW1iZXJSZXN1bHQiLCJtZW1iZXIiLCJ0b1B1YmxpY1Jvb21SZXN1bHQiLCJzZWN0aW9uIiwicXVlcnkiLCJyb29tX2lkIiwidG9Mb3dlckNhc2UiLCJjYW5vbmljYWxfYWxpYXMiLCJuYW1lIiwic2FuaXRpemVIdG1sIiwidG9waWMiLCJhbGxvd2VkVGFncyIsImFsaWFzZXMiLCJtYXAiLCJpdCIsIkJvb2xlYW4iLCJ0b1Jvb21SZXN1bHQiLCJteVVzZXJJZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFVzZXJJZCIsIm90aGVyVXNlcklkIiwiRE1Sb29tTWFwIiwic2hhcmVkIiwiZ2V0VXNlcklkRm9yUm9vbUlkIiwicm9vbUlkIiwib3RoZXJNZW1iZXJzIiwiZ2V0TWVtYmVycyIsInVzZXJJZCIsImlzU3BhY2VSb29tIiwiU3BhY2VzIiwiUm9vbXMiLCJ0b01lbWJlclJlc3VsdCIsIlN1Z2dlc3Rpb25zIiwicmVjZW50QWxnb3JpdGhtIiwiUmVjZW50QWxnb3JpdGhtIiwidXNlV2ViU2VhcmNoTWV0cmljcyIsIm51bVJlc3VsdHMiLCJxdWVyeUxlbmd0aCIsInZpYVNwb3RsaWdodCIsInVzZUVmZmVjdCIsInRpbWVvdXRJZCIsInNldFRpbWVvdXQiLCJQb3N0aG9nQW5hbHl0aWNzIiwiaW5zdGFuY2UiLCJ0cmFja0V2ZW50IiwiZXZlbnROYW1lIiwiY2xlYXJUaW1lb3V0IiwiZmluZFZpc2libGVSb29tcyIsImNsaSIsImdldFZpc2libGVSb29tcyIsImlzTG9jYWxSb29tIiwiZ2V0TXlNZW1iZXJzaGlwIiwiZmluZFZpc2libGVSb29tTWVtYmVycyIsImZpbHRlckRNcyIsIk9iamVjdCIsInZhbHVlcyIsInJlZHVjZSIsIm1lbWJlcnMiLCJnZXRKb2luZWRNZW1iZXJzIiwicm9vbUFyaWFVbnJlYWRMYWJlbCIsIm5vdGlmaWNhdGlvbiIsImhhc01lbnRpb25zIiwiY291bnQiLCJoYXNVbnJlYWRDb3VudCIsImlzVW5yZWFkIiwidW5kZWZpbmVkIiwiU3BvdGxpZ2h0RGlhbG9nIiwiaW5pdGlhbFRleHQiLCJpbml0aWFsRmlsdGVyIiwib25GaW5pc2hlZCIsImlucHV0UmVmIiwidXNlUmVmIiwic2Nyb2xsQ29udGFpbmVyUmVmIiwicm92aW5nQ29udGV4dCIsInVzZUNvbnRleHQiLCJSb3ZpbmdUYWJJbmRleENvbnRleHQiLCJfc2V0UXVlcnkiLCJ1c2VTdGF0ZSIsInJlY2VudFNlYXJjaGVzIiwiY2xlYXJSZWNlbnRTZWFyY2hlcyIsInVzZVJlY2VudFNlYXJjaGVzIiwic2V0RmlsdGVySW50ZXJuYWwiLCJzZXRGaWx0ZXIiLCJ1c2VDYWxsYmFjayIsImZvY3VzIiwic2Nyb2xsVG8iLCJ0b3AiLCJtZW1iZXJDb21wYXJhdG9yIiwidXNlTWVtbyIsImFjdGl2aXR5U2NvcmVzIiwiYnVpbGRBY3Rpdml0eVNjb3JlcyIsIm1lbWJlclNjb3JlcyIsImJ1aWxkTWVtYmVyU2NvcmVzIiwiY29tcGFyZU1lbWJlcnMiLCJvd25JbnZpdGVMaW5rIiwibWFrZVVzZXJQZXJtYWxpbmsiLCJpbnZpdGVMaW5rQ29waWVkIiwic2V0SW52aXRlTGlua0NvcGllZCIsInRyaW1tZWRRdWVyeSIsInRyaW0iLCJleHBsb3JpbmdQdWJsaWNTcGFjZXNFbmFibGVkIiwidXNlRmVhdHVyZUVuYWJsZWQiLCJsb2FkaW5nIiwicHVibGljUm9vbXNMb2FkaW5nIiwicHVibGljUm9vbXMiLCJwcm90b2NvbHMiLCJjb25maWciLCJzZXRDb25maWciLCJzZWFyY2giLCJzZWFyY2hQdWJsaWNSb29tcyIsInVzZVB1YmxpY1Jvb21EaXJlY3RvcnkiLCJzZXRTaG93Um9vbXMiLCJzZXRTaG93U3BhY2VzIiwicGVvcGxlTG9hZGluZyIsInVzZXJzIiwic2VhcmNoUGVvcGxlIiwidXNlVXNlckRpcmVjdG9yeSIsInByb2ZpbGVMb2FkaW5nIiwicHJvZmlsZSIsInNlYXJjaFByb2ZpbGVJbmZvIiwidXNlUHJvZmlsZUluZm8iLCJzZWFyY2hQYXJhbXMiLCJsaW1pdCIsInVzZURlYm91bmNlZENhbGxiYWNrIiwicG9zc2libGVSZXN1bHRzIiwicm9vbVJlc3VsdHMiLCJhbHJlYWR5QWRkZWRVc2VySWRzIiwidXNlcklkcyIsImdldEpvaW5lZE1lbWJlckNvdW50IiwidXNlclJlc3VsdHMiLCJ1c2VyIiwiaGFzIiwicHVzaCIsIlNwYWNlU3RvcmUiLCJlbmFibGVkTWV0YVNwYWNlcyIsInNwYWNlS2V5IiwiYXZhdGFyIiwiY2xhc3NOYW1lcyIsImdldE1ldGFTcGFjZU5hbWUiLCJhbGxSb29tc0luSG9tZSIsIm9uQ2xpY2siLCJzZXRBY3RpdmVTcGFjZSIsInVzZXJfaWQiLCJEaXJlY3RvcnlNZW1iZXIiLCJpbmNsdWRlcyIsInJlc3VsdHMiLCJsY1F1ZXJ5Iiwibm9ybWFsaXplZFF1ZXJ5Iiwibm9ybWFsaXplIiwiZm9yRWFjaCIsImVudHJ5Iiwibm9ybWFsaXplZE5hbWUiLCJnZXRDYW5vbmljYWxBbGlhcyIsInNvbWUiLCJxIiwicmVzdWx0QXJyYXkiLCJzb3J0IiwiYSIsImIiLCJnZXRMYXN0VHMiLCJzdW0iLCJsZW5ndGgiLCJhY3RpdmVTcGFjZSIsImFjdGl2ZVNwYWNlUm9vbSIsInNwYWNlUmVzdWx0cyIsInNwYWNlUmVzdWx0c0xvYWRpbmciLCJ1c2VTcGFjZVJlc3VsdHMiLCJzZXRRdWVyeSIsImUiLCJuZXdRdWVyeSIsImN1cnJlbnRUYXJnZXQiLCJ2YWx1ZSIsInNldEltbWVkaWF0ZSIsInN0YXRlIiwicmVmcyIsImRpc3BhdGNoIiwidHlwZSIsIlR5cGUiLCJTZXRGb2N1cyIsInBheWxvYWQiLCJzY3JvbGxJbnRvVmlldyIsImJsb2NrIiwidmlld1Jvb20iLCJwZXJzaXN0IiwidmlhS2V5Ym9hcmQiLCJyZWNlbnRzIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwicmV2ZXJzZSIsImRlbGV0ZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiQUNDT1VOVCIsIkFycmF5IiwiZnJvbSIsInNsaWNlIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3Um9vbSIsIm1ldHJpY3NUcmlnZ2VyIiwibWV0cmljc1ZpYUtleWJvYXJkIiwicm9vbV9hbGlhcyIsInJvb21BbGlhcyIsImF1dG9fam9pbiIsImF1dG9Kb2luIiwic2hvdWxkX3BlZWsiLCJzaG91bGRQZWVrIiwib3RoZXJTZWFyY2hlc1NlY3Rpb24iLCJjb250ZW50IiwicmVzdWx0TWFwcGVyIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJnZXRSb29tU3RhdGUiLCJ1bnJlYWRMYWJlbCIsImFyaWFQcm9wZXJ0aWVzIiwiZXYiLCJ0YWJJbmRleCIsInN0YXJ0RG1PbkZpcnN0TWVzc2FnZSIsIlJvb21NZW1iZXIiLCJyYXdEaXNwbGF5TmFtZSIsImNsaWVudFJvb20iLCJnZXRSb29tIiwic2hvd1ZpZXdCdXR0b24iLCJ3b3JsZF9yZWFkYWJsZSIsImlzR3Vlc3QiLCJsaXN0ZW5lciIsImF2YXRhcl91cmwiLCJtZWRpYUZyb21NeGMiLCJnZXRTcXVhcmVUaHVtYm5haWxIdHRwIiwiZGVzY3JpcHRpb24iLCJwZW9wbGVTZWN0aW9uIiwic3VnZ2VzdGlvbnNTZWN0aW9uIiwicm9vbXNTZWN0aW9uIiwic3BhY2VzU2VjdGlvbiIsInB1YmxpY1Jvb21zU2VjdGlvbiIsInNwYWNlUm9vbXNTZWN0aW9uIiwic3BhY2VOYW1lIiwiam9pblJvb21TZWN0aW9uIiwiZ2V0Q2FjaGVkUm9vbUlERm9yQWxpYXMiLCJyb29tQWRkcmVzcyIsImhpZGRlblJlc3VsdHNTZWN0aW9uIiwiY29weVBsYWludGV4dCIsInB1YmxpYyIsImRlZmF1bHROYW1lIiwiY2FwaXRhbGl6ZSIsImdyb3VwQ2hhdFNlY3Rpb24iLCJzaG93U3RhcnRDaGF0SW52aXRlRGlhbG9nIiwibWVzc2FnZVNlYXJjaFNlY3Rpb24iLCJpY29uIiwicmVjZW50U2VhcmNoZXNTZWN0aW9uIiwiQnJlYWRjcnVtYnNTdG9yZSIsInJvb21zIiwiciIsIlJvb21WaWV3U3RvcmUiLCJnZXRSb29tSWQiLCJvbkRpYWxvZ0tleURvd24iLCJuYXZpZ2F0aW9uQWN0aW9uIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0TmF2aWdhdGlvbkFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJGaWx0ZXJSb29tcyIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiYWNjZXNzaWJpbGl0eUFjdGlvbiIsImdldEFjY2Vzc2liaWxpdHlBY3Rpb24iLCJFc2NhcGUiLCJBcnJvd1VwIiwiQXJyb3dEb3duIiwia2VwdFJlY2VudGx5Vmlld2VkUmVmIiwiYWN0aXZlUmVmIiwiZmluZCIsImlkeCIsImluZGV4T2YiLCJmaW5kU2libGluZ0VsZW1lbnQiLCJBcnJvd0xlZnQiLCJBcnJvd1JpZ2h0Iiwib25LZXlEb3duIiwiQmFja3NwYWNlIiwiRW50ZXIiLCJjbGljayIsIm9wZW5GZWVkYmFjayIsIlNka0NvbmZpZyIsImJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJGZWVkYmFja0RpYWxvZyIsImZlYXR1cmUiLCJhY3RpdmVEZXNjZW5kYW50IiwiYXJyb3dzIiwic3ViIiwiUm92aW5nU3BvdGxpZ2h0RGlhbG9nIiwicHJvcHMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3Nwb3RsaWdodC9TcG90bGlnaHREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMS0yMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgV2ViU2VhcmNoIGFzIFdlYlNlYXJjaEV2ZW50IH0gZnJvbSBcIkBtYXRyaXgtb3JnL2FuYWx5dGljcy1ldmVudHMvdHlwZXMvdHlwZXNjcmlwdC9XZWJTZWFyY2hcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgeyBjYXBpdGFsaXplLCBzdW0gfSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBJSGllcmFyY2h5Um9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvc3BhY2VzXCI7XG5pbXBvcnQgeyBJUHVibGljUm9vbXNDaHVua1Jvb20sIE1hdHJpeENsaWVudCwgUm9vbU1lbWJlciwgUm9vbVR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbWF0cml4XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvdXRpbHNcIjtcbmltcG9ydCBSZWFjdCwge1xuICAgIENoYW5nZUV2ZW50LFxuICAgIEtleWJvYXJkRXZlbnQsXG4gICAgUmVmT2JqZWN0LFxuICAgIHVzZUNhbGxiYWNrLFxuICAgIHVzZUNvbnRleHQsXG4gICAgdXNlRWZmZWN0LFxuICAgIHVzZU1lbW8sXG4gICAgdXNlUmVmLFxuICAgIHVzZVN0YXRlLFxufSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBzYW5pdGl6ZUh0bWwgZnJvbSBcInNhbml0aXplLWh0bWxcIjtcblxuaW1wb3J0IHsgS2V5QmluZGluZ0FjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5pbXBvcnQgeyBSZWYgfSBmcm9tIFwiLi4vLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9yb3ZpbmcvdHlwZXNcIjtcbmltcG9ydCB7XG4gICAgZmluZFNpYmxpbmdFbGVtZW50LFxuICAgIFJvdmluZ1RhYkluZGV4Q29udGV4dCxcbiAgICBSb3ZpbmdUYWJJbmRleFByb3ZpZGVyLFxuICAgIFR5cGUsXG59IGZyb20gXCIuLi8uLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L1JvdmluZ1RhYkluZGV4XCI7XG5pbXBvcnQgeyBtZWRpYUZyb21NeGMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCB7IHVzZURlYm91bmNlZENhbGxiYWNrIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2hvb2tzL3Nwb3RsaWdodC91c2VEZWJvdW5jZWRDYWxsYmFja1wiO1xuaW1wb3J0IHsgdXNlUmVjZW50U2VhcmNoZXMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vaG9va3Mvc3BvdGxpZ2h0L3VzZVJlY2VudFNlYXJjaGVzXCI7XG5pbXBvcnQgeyB1c2VQcm9maWxlSW5mbyB9IGZyb20gXCIuLi8uLi8uLi8uLi9ob29rcy91c2VQcm9maWxlSW5mb1wiO1xuaW1wb3J0IHsgdXNlUHVibGljUm9vbURpcmVjdG9yeSB9IGZyb20gXCIuLi8uLi8uLi8uLi9ob29rcy91c2VQdWJsaWNSb29tRGlyZWN0b3J5XCI7XG5pbXBvcnQgeyB1c2VGZWF0dXJlRW5hYmxlZCB9IGZyb20gXCIuLi8uLi8uLi8uLi9ob29rcy91c2VTZXR0aW5nc1wiO1xuaW1wb3J0IHsgdXNlU3BhY2VSZXN1bHRzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2hvb2tzL3VzZVNwYWNlUmVzdWx0c1wiO1xuaW1wb3J0IHsgdXNlVXNlckRpcmVjdG9yeSB9IGZyb20gXCIuLi8uLi8uLi8uLi9ob29rcy91c2VVc2VyRGlyZWN0b3J5XCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7IFBvc3Rob2dBbmFseXRpY3MgfSBmcm9tIFwiLi4vLi4vLi4vLi4vUG9zdGhvZ0FuYWx5dGljc1wiO1xuaW1wb3J0IHsgZ2V0Q2FjaGVkUm9vbUlERm9yQWxpYXMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vUm9vbUFsaWFzQ2FjaGVcIjtcbmltcG9ydCB7IHNob3dTdGFydENoYXRJbnZpdGVEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vLi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgQnJlYWRjcnVtYnNTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9zdG9yZXMvQnJlYWRjcnVtYnNTdG9yZVwiO1xuaW1wb3J0IHsgUm9vbU5vdGlmaWNhdGlvblN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1Jvb21Ob3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IHsgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmVcIjtcbmltcG9ydCB7IFJlY2VudEFsZ29yaXRobSB9IGZyb20gXCIuLi8uLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvdGFnLXNvcnRpbmcvUmVjZW50QWxnb3JpdGhtXCI7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3N0b3Jlcy9Sb29tVmlld1N0b3JlXCI7XG5pbXBvcnQgeyBnZXRNZXRhU3BhY2VOYW1lIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3N0b3Jlcy9zcGFjZXNcIjtcbmltcG9ydCBTcGFjZVN0b3JlIGZyb20gXCIuLi8uLi8uLi8uLi9zdG9yZXMvc3BhY2VzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCB7IERpcmVjdG9yeU1lbWJlciwgTWVtYmVyLCBzdGFydERtT25GaXJzdE1lc3NhZ2UgfSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvZGlyZWN0LW1lc3NhZ2VzXCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuLi8uLi8uLi8uLi91dGlscy9ETVJvb21NYXBcIjtcbmltcG9ydCB7IG1ha2VVc2VyUGVybWFsaW5rIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHsgYnVpbGRBY3Rpdml0eVNjb3JlcywgYnVpbGRNZW1iZXJTY29yZXMsIGNvbXBhcmVNZW1iZXJzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3V0aWxzL1NvcnRNZW1iZXJzXCI7XG5pbXBvcnQgeyBjb3B5UGxhaW50ZXh0IH0gZnJvbSBcIi4uLy4uLy4uLy4uL3V0aWxzL3N0cmluZ3NcIjtcbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gXCIuLi8uLi9hdmF0YXJzL0Jhc2VBdmF0YXJcIjtcbmltcG9ydCBEZWNvcmF0ZWRSb29tQXZhdGFyIGZyb20gXCIuLi8uLi9hdmF0YXJzL0RlY29yYXRlZFJvb21BdmF0YXJcIjtcbmltcG9ydCB7IFNlYXJjaFJlc3VsdEF2YXRhciB9IGZyb20gXCIuLi8uLi9hdmF0YXJzL1NlYXJjaFJlc3VsdEF2YXRhclwiO1xuaW1wb3J0IHsgTmV0d29ya0Ryb3Bkb3duIH0gZnJvbSBcIi4uLy4uL2RpcmVjdG9yeS9OZXR3b3JrRHJvcGRvd25cIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgTGFiZWxsZWRDaGVja2JveCBmcm9tIFwiLi4vLi4vZWxlbWVudHMvTGFiZWxsZWRDaGVja2JveFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCBOb3RpZmljYXRpb25CYWRnZSBmcm9tIFwiLi4vLi4vcm9vbXMvTm90aWZpY2F0aW9uQmFkZ2VcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRmVlZGJhY2tEaWFsb2cgZnJvbSBcIi4uL0ZlZWRiYWNrRGlhbG9nXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tIFwiLi9PcHRpb25cIjtcbmltcG9ydCB7IFB1YmxpY1Jvb21SZXN1bHREZXRhaWxzIH0gZnJvbSBcIi4vUHVibGljUm9vbVJlc3VsdERldGFpbHNcIjtcbmltcG9ydCB7IFJvb21SZXN1bHRDb250ZXh0TWVudXMgfSBmcm9tIFwiLi9Sb29tUmVzdWx0Q29udGV4dE1lbnVzXCI7XG5pbXBvcnQgeyBSb29tQ29udGV4dERldGFpbHMgfSBmcm9tIFwiLi4vLi4vcm9vbXMvUm9vbUNvbnRleHREZXRhaWxzXCI7XG5pbXBvcnQgeyBUb29sdGlwT3B0aW9uIH0gZnJvbSBcIi4vVG9vbHRpcE9wdGlvblwiO1xuaW1wb3J0IHsgaXNMb2NhbFJvb20gfSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvbG9jYWxSb29tL2lzTG9jYWxSb29tXCI7XG5cbmNvbnN0IE1BWF9SRUNFTlRfU0VBUkNIRVMgPSAxMDtcbmNvbnN0IFNFQ1RJT05fTElNSVQgPSA1MDsgLy8gb25seSBzaG93IDUwIHJlc3VsdHMgcGVyIHNlY3Rpb24gZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnNcbmNvbnN0IEFWQVRBUl9TSVpFID0gMjQ7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIGluaXRpYWxUZXh0Pzogc3RyaW5nO1xuICAgIGluaXRpYWxGaWx0ZXI/OiBGaWx0ZXI7XG59XG5cbmZ1bmN0aW9uIHJlZklzRm9yUmVjZW50bHlWaWV3ZWQocmVmOiBSZWZPYmplY3Q8SFRNTEVsZW1lbnQ+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJlZi5jdXJyZW50Py5pZD8uc3RhcnRzV2l0aChcIm14X1Nwb3RsaWdodERpYWxvZ19idXR0b25fcmVjZW50bHlWaWV3ZWRfXCIpID09PSB0cnVlO1xufVxuXG5mdW5jdGlvbiBnZXRSb29tVHlwZXMoc2hvd1Jvb21zOiBib29sZWFuLCBzaG93U3BhY2VzOiBib29sZWFuKTogU2V0PFJvb21UeXBlIHwgbnVsbD4ge1xuICAgIGNvbnN0IHJvb21UeXBlcyA9IG5ldyBTZXQ8Um9vbVR5cGUgfCBudWxsPigpO1xuXG4gICAgaWYgKHNob3dSb29tcykgcm9vbVR5cGVzLmFkZChudWxsKTtcbiAgICBpZiAoc2hvd1NwYWNlcykgcm9vbVR5cGVzLmFkZChSb29tVHlwZS5TcGFjZSk7XG5cbiAgICByZXR1cm4gcm9vbVR5cGVzO1xufVxuXG5lbnVtIFNlY3Rpb24ge1xuICAgIFBlb3BsZSxcbiAgICBSb29tcyxcbiAgICBTcGFjZXMsXG4gICAgU3VnZ2VzdGlvbnMsXG4gICAgUHVibGljUm9vbXMsXG59XG5cbmV4cG9ydCBlbnVtIEZpbHRlciB7XG4gICAgUGVvcGxlLFxuICAgIFB1YmxpY1Jvb21zLFxufVxuXG5mdW5jdGlvbiBmaWx0ZXJUb0xhYmVsKGZpbHRlcjogRmlsdGVyKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKGZpbHRlcikge1xuICAgICAgICBjYXNlIEZpbHRlci5QZW9wbGU6IHJldHVybiBfdChcIlBlb3BsZVwiKTtcbiAgICAgICAgY2FzZSBGaWx0ZXIuUHVibGljUm9vbXM6IHJldHVybiBfdChcIlB1YmxpYyByb29tc1wiKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJQmFzZVJlc3VsdCB7XG4gICAgc2VjdGlvbjogU2VjdGlvbjtcbiAgICBmaWx0ZXI6IEZpbHRlcltdO1xuICAgIHF1ZXJ5Pzogc3RyaW5nW107IC8vIGV4dHJhIGZpZWxkcyB0byBxdWVyeSBtYXRjaCwgc3RvcmVkIGFzIGxvd2VyY2FzZVxufVxuXG5pbnRlcmZhY2UgSVB1YmxpY1Jvb21SZXN1bHQgZXh0ZW5kcyBJQmFzZVJlc3VsdCB7XG4gICAgcHVibGljUm9vbTogSVB1YmxpY1Jvb21zQ2h1bmtSb29tO1xufVxuXG5pbnRlcmZhY2UgSVJvb21SZXN1bHQgZXh0ZW5kcyBJQmFzZVJlc3VsdCB7XG4gICAgcm9vbTogUm9vbTtcbn1cblxuaW50ZXJmYWNlIElNZW1iZXJSZXN1bHQgZXh0ZW5kcyBJQmFzZVJlc3VsdCB7XG4gICAgbWVtYmVyOiBNZW1iZXIgfCBSb29tTWVtYmVyO1xufVxuXG5pbnRlcmZhY2UgSVJlc3VsdCBleHRlbmRzIElCYXNlUmVzdWx0IHtcbiAgICBhdmF0YXI6IEpTWC5FbGVtZW50O1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgICBvbkNsaWNrPygpOiB2b2lkO1xufVxuXG50eXBlIFJlc3VsdCA9IElSb29tUmVzdWx0IHwgSVB1YmxpY1Jvb21SZXN1bHQgfCBJTWVtYmVyUmVzdWx0IHwgSVJlc3VsdDtcblxuY29uc3QgaXNSb29tUmVzdWx0ID0gKHJlc3VsdDogYW55KTogcmVzdWx0IGlzIElSb29tUmVzdWx0ID0+ICEhcmVzdWx0Py5yb29tO1xuY29uc3QgaXNQdWJsaWNSb29tUmVzdWx0ID0gKHJlc3VsdDogYW55KTogcmVzdWx0IGlzIElQdWJsaWNSb29tUmVzdWx0ID0+ICEhcmVzdWx0Py5wdWJsaWNSb29tO1xuY29uc3QgaXNNZW1iZXJSZXN1bHQgPSAocmVzdWx0OiBhbnkpOiByZXN1bHQgaXMgSU1lbWJlclJlc3VsdCA9PiAhIXJlc3VsdD8ubWVtYmVyO1xuXG5jb25zdCB0b1B1YmxpY1Jvb21SZXN1bHQgPSAocHVibGljUm9vbTogSVB1YmxpY1Jvb21zQ2h1bmtSb29tKTogSVB1YmxpY1Jvb21SZXN1bHQgPT4gKHtcbiAgICBwdWJsaWNSb29tLFxuICAgIHNlY3Rpb246IFNlY3Rpb24uUHVibGljUm9vbXMsXG4gICAgZmlsdGVyOiBbRmlsdGVyLlB1YmxpY1Jvb21zXSxcbiAgICBxdWVyeTogW1xuICAgICAgICBwdWJsaWNSb29tLnJvb21faWQudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgcHVibGljUm9vbS5jYW5vbmljYWxfYWxpYXM/LnRvTG93ZXJDYXNlKCksXG4gICAgICAgIHB1YmxpY1Jvb20ubmFtZT8udG9Mb3dlckNhc2UoKSxcbiAgICAgICAgc2FuaXRpemVIdG1sKHB1YmxpY1Jvb20udG9waWM/LnRvTG93ZXJDYXNlKCkgPz8gXCJcIiwgeyBhbGxvd2VkVGFnczogW10gfSksXG4gICAgICAgIC4uLihwdWJsaWNSb29tLmFsaWFzZXM/Lm1hcChpdCA9PiBpdC50b0xvd2VyQ2FzZSgpKSB8fCBbXSksXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXG59KTtcblxuY29uc3QgdG9Sb29tUmVzdWx0ID0gKHJvb206IFJvb20pOiBJUm9vbVJlc3VsdCA9PiB7XG4gICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgY29uc3Qgb3RoZXJVc2VySWQgPSBETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHJvb20ucm9vbUlkKTtcblxuICAgIGlmIChvdGhlclVzZXJJZCkge1xuICAgICAgICBjb25zdCBvdGhlck1lbWJlcnMgPSByb29tLmdldE1lbWJlcnMoKS5maWx0ZXIoaXQgPT4gaXQudXNlcklkICE9PSBteVVzZXJJZCk7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gW1xuICAgICAgICAgICAgLi4ub3RoZXJNZW1iZXJzLm1hcChpdCA9PiBpdC5uYW1lLnRvTG93ZXJDYXNlKCkpLFxuICAgICAgICAgICAgLi4ub3RoZXJNZW1iZXJzLm1hcChpdCA9PiBpdC51c2VySWQudG9Mb3dlckNhc2UoKSksXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcm9vbSxcbiAgICAgICAgICAgIHNlY3Rpb246IFNlY3Rpb24uUGVvcGxlLFxuICAgICAgICAgICAgZmlsdGVyOiBbRmlsdGVyLlBlb3BsZV0sXG4gICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcm9vbSxcbiAgICAgICAgICAgIHNlY3Rpb246IFNlY3Rpb24uU3BhY2VzLFxuICAgICAgICAgICAgZmlsdGVyOiBbXSxcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcm9vbSxcbiAgICAgICAgICAgIHNlY3Rpb246IFNlY3Rpb24uUm9vbXMsXG4gICAgICAgICAgICBmaWx0ZXI6IFtdLFxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbmNvbnN0IHRvTWVtYmVyUmVzdWx0ID0gKG1lbWJlcjogTWVtYmVyIHwgUm9vbU1lbWJlcik6IElNZW1iZXJSZXN1bHQgPT4gKHtcbiAgICBtZW1iZXIsXG4gICAgc2VjdGlvbjogU2VjdGlvbi5TdWdnZXN0aW9ucyxcbiAgICBmaWx0ZXI6IFtGaWx0ZXIuUGVvcGxlXSxcbiAgICBxdWVyeTogW1xuICAgICAgICBtZW1iZXIudXNlcklkLnRvTG93ZXJDYXNlKCksXG4gICAgICAgIG1lbWJlci5uYW1lLnRvTG93ZXJDYXNlKCksXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXG59KTtcblxuY29uc3QgcmVjZW50QWxnb3JpdGhtID0gbmV3IFJlY2VudEFsZ29yaXRobSgpO1xuXG5leHBvcnQgY29uc3QgdXNlV2ViU2VhcmNoTWV0cmljcyA9IChudW1SZXN1bHRzOiBudW1iZXIsIHF1ZXJ5TGVuZ3RoOiBudW1iZXIsIHZpYVNwb3RsaWdodDogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghcXVlcnlMZW5ndGgpIHJldHVybjtcblxuICAgICAgICAvLyBzZW5kIG1ldHJpY3MgYWZ0ZXIgYSAxcyBkZWJvdW5jZVxuICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIFBvc3Rob2dBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tFdmVudDxXZWJTZWFyY2hFdmVudD4oe1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogXCJXZWJTZWFyY2hcIixcbiAgICAgICAgICAgICAgICB2aWFTcG90bGlnaHQsXG4gICAgICAgICAgICAgICAgbnVtUmVzdWx0cyxcbiAgICAgICAgICAgICAgICBxdWVyeUxlbmd0aCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIH07XG4gICAgfSwgW251bVJlc3VsdHMsIHF1ZXJ5TGVuZ3RoLCB2aWFTcG90bGlnaHRdKTtcbn07XG5cbmNvbnN0IGZpbmRWaXNpYmxlUm9vbXMgPSAoY2xpOiBNYXRyaXhDbGllbnQpID0+IHtcbiAgICByZXR1cm4gY2xpLmdldFZpc2libGVSb29tcygpLmZpbHRlcihyb29tID0+IHtcbiAgICAgICAgLy8gRG8gbm90IHNob3cgbG9jYWwgcm9vbXNcbiAgICAgICAgaWYgKGlzTG9jYWxSb29tKHJvb20pKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gVE9ETyB3ZSBtYXkgd2FudCB0byBwdXQgaW52aXRlcyBpbiB0aGVpciBvd24gbGlzdFxuICAgICAgICByZXR1cm4gcm9vbS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCIgfHwgcm9vbS5nZXRNeU1lbWJlcnNoaXAoKSA9PSBcImludml0ZVwiO1xuICAgIH0pO1xufTtcblxuY29uc3QgZmluZFZpc2libGVSb29tTWVtYmVycyA9IChjbGk6IE1hdHJpeENsaWVudCwgZmlsdGVyRE1zID0gdHJ1ZSkgPT4ge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKFxuICAgICAgICBmaW5kVmlzaWJsZVJvb21zKGNsaSlcbiAgICAgICAgICAgIC5maWx0ZXIocm9vbSA9PiAhZmlsdGVyRE1zIHx8ICFETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHJvb20ucm9vbUlkKSlcbiAgICAgICAgICAgIC5yZWR1Y2UoKG1lbWJlcnMsIHJvb20pID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiByb29tLmdldEpvaW5lZE1lbWJlcnMoKSkge1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW21lbWJlci51c2VySWRdID0gbWVtYmVyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWVtYmVycztcbiAgICAgICAgICAgIH0sIHt9IGFzIFJlY29yZDxzdHJpbmcsIFJvb21NZW1iZXI+KSxcbiAgICApLmZpbHRlcihpdCA9PiBpdC51c2VySWQgIT09IGNsaS5nZXRVc2VySWQoKSk7XG59O1xuXG5jb25zdCByb29tQXJpYVVucmVhZExhYmVsID0gKHJvb206IFJvb20sIG5vdGlmaWNhdGlvbjogUm9vbU5vdGlmaWNhdGlvblN0YXRlKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgICBpZiAobm90aWZpY2F0aW9uLmhhc01lbnRpb25zKSB7XG4gICAgICAgIHJldHVybiBfdChcIiUoY291bnQpcyB1bnJlYWQgbWVzc2FnZXMgaW5jbHVkaW5nIG1lbnRpb25zLlwiLCB7XG4gICAgICAgICAgICBjb3VudDogbm90aWZpY2F0aW9uLmNvdW50LFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKG5vdGlmaWNhdGlvbi5oYXNVbnJlYWRDb3VudCkge1xuICAgICAgICByZXR1cm4gX3QoXCIlKGNvdW50KXMgdW5yZWFkIG1lc3NhZ2VzLlwiLCB7XG4gICAgICAgICAgICBjb3VudDogbm90aWZpY2F0aW9uLmNvdW50LFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKG5vdGlmaWNhdGlvbi5pc1VucmVhZCkge1xuICAgICAgICByZXR1cm4gX3QoXCJVbnJlYWQgbWVzc2FnZXMuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufTtcblxuaW50ZXJmYWNlIElEaXJlY3RvcnlPcHRzIHtcbiAgICBsaW1pdDogbnVtYmVyO1xuICAgIHF1ZXJ5OiBzdHJpbmc7XG59XG5cbmNvbnN0IFNwb3RsaWdodERpYWxvZzogUmVhY3QuRkM8SVByb3BzPiA9ICh7IGluaXRpYWxUZXh0ID0gXCJcIiwgaW5pdGlhbEZpbHRlciA9IG51bGwsIG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGNvbnN0IGlucHV0UmVmID0gdXNlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG4gICAgY29uc3Qgc2Nyb2xsQ29udGFpbmVyUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBjb25zdCByb3ZpbmdDb250ZXh0ID0gdXNlQ29udGV4dChSb3ZpbmdUYWJJbmRleENvbnRleHQpO1xuICAgIGNvbnN0IFtxdWVyeSwgX3NldFF1ZXJ5XSA9IHVzZVN0YXRlKGluaXRpYWxUZXh0KTtcbiAgICBjb25zdCBbcmVjZW50U2VhcmNoZXMsIGNsZWFyUmVjZW50U2VhcmNoZXNdID0gdXNlUmVjZW50U2VhcmNoZXMoKTtcbiAgICBjb25zdCBbZmlsdGVyLCBzZXRGaWx0ZXJJbnRlcm5hbF0gPSB1c2VTdGF0ZTxGaWx0ZXIgfCBudWxsPihpbml0aWFsRmlsdGVyKTtcbiAgICBjb25zdCBzZXRGaWx0ZXIgPSB1c2VDYWxsYmFjayhcbiAgICAgICAgKGZpbHRlcjogRmlsdGVyIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgc2V0RmlsdGVySW50ZXJuYWwoZmlsdGVyKTtcbiAgICAgICAgICAgIGlucHV0UmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgICAgICAgICBzY3JvbGxDb250YWluZXJSZWYuY3VycmVudD8uc2Nyb2xsVG8/Lih7IHRvcDogMCB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgW10sXG4gICAgKTtcbiAgICBjb25zdCBtZW1iZXJDb21wYXJhdG9yID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2aXR5U2NvcmVzID0gYnVpbGRBY3Rpdml0eVNjb3JlcyhjbGkpO1xuICAgICAgICBjb25zdCBtZW1iZXJTY29yZXMgPSBidWlsZE1lbWJlclNjb3JlcyhjbGkpO1xuICAgICAgICByZXR1cm4gY29tcGFyZU1lbWJlcnMoYWN0aXZpdHlTY29yZXMsIG1lbWJlclNjb3Jlcyk7XG4gICAgfSwgW2NsaV0pO1xuXG4gICAgY29uc3Qgb3duSW52aXRlTGluayA9IG1ha2VVc2VyUGVybWFsaW5rKGNsaS5nZXRVc2VySWQoKSk7XG4gICAgY29uc3QgW2ludml0ZUxpbmtDb3BpZWQsIHNldEludml0ZUxpbmtDb3BpZWRdID0gdXNlU3RhdGU8Ym9vbGVhbj4oZmFsc2UpO1xuICAgIGNvbnN0IHRyaW1tZWRRdWVyeSA9IHVzZU1lbW8oKCkgPT4gcXVlcnkudHJpbSgpLCBbcXVlcnldKTtcblxuICAgIGNvbnN0IGV4cGxvcmluZ1B1YmxpY1NwYWNlc0VuYWJsZWQgPSB1c2VGZWF0dXJlRW5hYmxlZChcImZlYXR1cmVfZXhwbG9yaW5nX3B1YmxpY19zcGFjZXNcIik7XG5cbiAgICBjb25zdCB7IGxvYWRpbmc6IHB1YmxpY1Jvb21zTG9hZGluZywgcHVibGljUm9vbXMsIHByb3RvY29scywgY29uZmlnLCBzZXRDb25maWcsIHNlYXJjaDogc2VhcmNoUHVibGljUm9vbXMgfSA9XG4gICAgICAgIHVzZVB1YmxpY1Jvb21EaXJlY3RvcnkoKTtcbiAgICBjb25zdCBbc2hvd1Jvb21zLCBzZXRTaG93Um9vbXNdID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW3Nob3dTcGFjZXMsIHNldFNob3dTcGFjZXNdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHsgbG9hZGluZzogcGVvcGxlTG9hZGluZywgdXNlcnMsIHNlYXJjaDogc2VhcmNoUGVvcGxlIH0gPSB1c2VVc2VyRGlyZWN0b3J5KCk7XG4gICAgY29uc3QgeyBsb2FkaW5nOiBwcm9maWxlTG9hZGluZywgcHJvZmlsZSwgc2VhcmNoOiBzZWFyY2hQcm9maWxlSW5mbyB9ID0gdXNlUHJvZmlsZUluZm8oKTtcbiAgICBjb25zdCBzZWFyY2hQYXJhbXM6IFtJRGlyZWN0b3J5T3B0c10gPSB1c2VNZW1vKCgpID0+IChbe1xuICAgICAgICBxdWVyeTogdHJpbW1lZFF1ZXJ5LFxuICAgICAgICByb29tVHlwZXM6IGdldFJvb21UeXBlcyhzaG93Um9vbXMsIHNob3dTcGFjZXMpLFxuICAgICAgICBsaW1pdDogU0VDVElPTl9MSU1JVCxcbiAgICB9XSksIFt0cmltbWVkUXVlcnksIHNob3dSb29tcywgc2hvd1NwYWNlc10pO1xuICAgIHVzZURlYm91bmNlZENhbGxiYWNrKFxuICAgICAgICBmaWx0ZXIgPT09IEZpbHRlci5QdWJsaWNSb29tcyxcbiAgICAgICAgc2VhcmNoUHVibGljUm9vbXMsXG4gICAgICAgIHNlYXJjaFBhcmFtcyxcbiAgICApO1xuICAgIHVzZURlYm91bmNlZENhbGxiYWNrKFxuICAgICAgICBmaWx0ZXIgPT09IEZpbHRlci5QZW9wbGUsXG4gICAgICAgIHNlYXJjaFBlb3BsZSxcbiAgICAgICAgc2VhcmNoUGFyYW1zLFxuICAgICk7XG4gICAgdXNlRGVib3VuY2VkQ2FsbGJhY2soXG4gICAgICAgIGZpbHRlciA9PT0gRmlsdGVyLlBlb3BsZSxcbiAgICAgICAgc2VhcmNoUHJvZmlsZUluZm8sXG4gICAgICAgIHNlYXJjaFBhcmFtcyxcbiAgICApO1xuICAgIGNvbnN0IHBvc3NpYmxlUmVzdWx0cyA9IHVzZU1lbW88UmVzdWx0W10+KFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb29tUmVzdWx0cyA9IGZpbmRWaXNpYmxlUm9vbXMoY2xpKS5tYXAodG9Sb29tUmVzdWx0KTtcbiAgICAgICAgICAgIC8vIElmIHdlIGFscmVhZHkgaGF2ZSBhIERNIHdpdGggdGhlIHVzZXIgd2UncmUgbG9va2luZyBmb3IsIHdlIHdpbGxcbiAgICAgICAgICAgIC8vIHNob3cgdGhhdCBETSBpbnN0ZWFkIG9mIHRoZSB1c2VyIHRoZW1zZWx2ZXNcbiAgICAgICAgICAgIGNvbnN0IGFscmVhZHlBZGRlZFVzZXJJZHMgPSByb29tUmVzdWx0cy5yZWR1Y2UoKHVzZXJJZHMsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocmVzdWx0LnJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJJZCkgcmV0dXJuIHVzZXJJZHM7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5yb29tLmdldEpvaW5lZE1lbWJlckNvdW50KCkgPiAyKSByZXR1cm4gdXNlcklkcztcbiAgICAgICAgICAgICAgICB1c2VySWRzLmFkZCh1c2VySWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB1c2VySWRzO1xuICAgICAgICAgICAgfSwgbmV3IFNldDxzdHJpbmc+KCkpO1xuICAgICAgICAgICAgY29uc3QgdXNlclJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXNlciBvZiBbLi4uZmluZFZpc2libGVSb29tTWVtYmVycyhjbGkpLCAuLi51c2Vyc10pIHtcbiAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgaGF2ZSBhbnkgdXNlciBtb3JlIHRoYW4gb25jZVxuICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5QWRkZWRVc2VySWRzLmhhcyh1c2VyLnVzZXJJZCkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGFscmVhZHlBZGRlZFVzZXJJZHMuYWRkKHVzZXIudXNlcklkKTtcblxuICAgICAgICAgICAgICAgIHVzZXJSZXN1bHRzLnB1c2godG9NZW1iZXJSZXN1bHQodXNlcikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIC4uLlNwYWNlU3RvcmUuaW5zdGFuY2UuZW5hYmxlZE1ldGFTcGFjZXMubWFwKHNwYWNlS2V5ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIHNlY3Rpb246IFNlY3Rpb24uU3BhY2VzLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXI6IFtdLFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXI6IDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJteF9TcG90bGlnaHREaWFsb2dfbWV0YXNwYWNlUmVzdWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBgbXhfU3BvdGxpZ2h0RGlhbG9nX21ldGFzcGFjZVJlc3VsdF8ke3NwYWNlS2V5fWAsXG4gICAgICAgICAgICAgICAgICAgICl9IC8+LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBnZXRNZXRhU3BhY2VOYW1lKHNwYWNlS2V5LCBTcGFjZVN0b3JlLmluc3RhbmNlLmFsbFJvb21zSW5Ib21lKSxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2Uuc2V0QWN0aXZlU3BhY2Uoc3BhY2VLZXkpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAuLi5yb29tUmVzdWx0cyxcbiAgICAgICAgICAgICAgICAuLi51c2VyUmVzdWx0cyxcbiAgICAgICAgICAgICAgICAuLi4ocHJvZmlsZSAmJiAhYWxyZWFkeUFkZGVkVXNlcklkcy5oYXMocHJvZmlsZS51c2VyX2lkKVxuICAgICAgICAgICAgICAgICAgICA/IFtuZXcgRGlyZWN0b3J5TWVtYmVyKHByb2ZpbGUpXVxuICAgICAgICAgICAgICAgICAgICA6IFtdKS5tYXAodG9NZW1iZXJSZXN1bHQpLFxuICAgICAgICAgICAgICAgIC4uLnB1YmxpY1Jvb21zLm1hcCh0b1B1YmxpY1Jvb21SZXN1bHQpLFxuICAgICAgICAgICAgXS5maWx0ZXIocmVzdWx0ID0+IGZpbHRlciA9PT0gbnVsbCB8fCByZXN1bHQuZmlsdGVyLmluY2x1ZGVzKGZpbHRlcikpO1xuICAgICAgICB9LFxuICAgICAgICBbY2xpLCB1c2VycywgcHJvZmlsZSwgcHVibGljUm9vbXMsIGZpbHRlcl0sXG4gICAgKTtcblxuICAgIGNvbnN0IHJlc3VsdHMgPSB1c2VNZW1vPFJlY29yZDxTZWN0aW9uLCBSZXN1bHRbXT4+KCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogUmVjb3JkPFNlY3Rpb24sIFJlc3VsdFtdPiA9IHtcbiAgICAgICAgICAgIFtTZWN0aW9uLlBlb3BsZV06IFtdLFxuICAgICAgICAgICAgW1NlY3Rpb24uUm9vbXNdOiBbXSxcbiAgICAgICAgICAgIFtTZWN0aW9uLlNwYWNlc106IFtdLFxuICAgICAgICAgICAgW1NlY3Rpb24uU3VnZ2VzdGlvbnNdOiBbXSxcbiAgICAgICAgICAgIFtTZWN0aW9uLlB1YmxpY1Jvb21zXTogW10sXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gR3JvdXAgcmVzdWx0cyBpbiB0aGVpciByZXNwZWN0aXZlIHNlY3Rpb25zXG4gICAgICAgIGlmICh0cmltbWVkUXVlcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxjUXVlcnkgPSB0cmltbWVkUXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRRdWVyeSA9IG5vcm1hbGl6ZSh0cmltbWVkUXVlcnkpO1xuXG4gICAgICAgICAgICBwb3NzaWJsZVJlc3VsdHMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzUm9vbVJlc3VsdChlbnRyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbnRyeS5yb29tLm5vcm1hbGl6ZWROYW1lPy5pbmNsdWRlcyhub3JtYWxpemVkUXVlcnkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhZW50cnkucm9vbS5nZXRDYW5vbmljYWxBbGlhcygpPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxjUXVlcnkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhZW50cnkucXVlcnk/LnNvbWUocSA9PiBxLmluY2x1ZGVzKGxjUXVlcnkpKVxuICAgICAgICAgICAgICAgICAgICApIHJldHVybjsgLy8gYmFpbCwgZG9lcyBub3QgbWF0Y2ggcXVlcnlcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzTWVtYmVyUmVzdWx0KGVudHJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVudHJ5LnF1ZXJ5Py5zb21lKHEgPT4gcS5pbmNsdWRlcyhsY1F1ZXJ5KSkpIHJldHVybjsgLy8gYmFpbCwgZG9lcyBub3QgbWF0Y2ggcXVlcnlcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzUHVibGljUm9vbVJlc3VsdChlbnRyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbnRyeS5xdWVyeT8uc29tZShxID0+IHEuaW5jbHVkZXMobGNRdWVyeSkpKSByZXR1cm47IC8vIGJhaWwsIGRvZXMgbm90IG1hdGNoIHF1ZXJ5XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbnRyeS5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobGNRdWVyeSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFlbnRyeS5xdWVyeT8uc29tZShxID0+IHEuaW5jbHVkZXMobGNRdWVyeSkpXG4gICAgICAgICAgICAgICAgICAgICkgcmV0dXJuOyAvLyBiYWlsLCBkb2VzIG5vdCBtYXRjaCBxdWVyeVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdHNbZW50cnkuc2VjdGlvbl0ucHVzaChlbnRyeSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChmaWx0ZXIgPT09IEZpbHRlci5QdWJsaWNSb29tcykge1xuICAgICAgICAgICAgLy8gcmV0dXJuIGFsbCByZXN1bHRzIGZvciBwdWJsaWMgcm9vbXMgaWYgbm8gcXVlcnkgaXMgZ2l2ZW5cbiAgICAgICAgICAgIHBvc3NpYmxlUmVzdWx0cy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXNQdWJsaWNSb29tUmVzdWx0KGVudHJ5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2VudHJ5LnNlY3Rpb25dLnB1c2goZW50cnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGZpbHRlciA9PT0gRmlsdGVyLlBlb3BsZSkge1xuICAgICAgICAgICAgLy8gcmV0dXJuIGFsbCByZXN1bHRzIGZvciBwZW9wbGUgaWYgbm8gcXVlcnkgaXMgZ2l2ZW5cbiAgICAgICAgICAgIHBvc3NpYmxlUmVzdWx0cy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXNNZW1iZXJSZXN1bHQoZW50cnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbZW50cnkuc2VjdGlvbl0ucHVzaChlbnRyeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTb3J0IHJlc3VsdHMgYnkgbW9zdCByZWNlbnQgYWN0aXZpdHlcblxuICAgICAgICBjb25zdCBteVVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcbiAgICAgICAgZm9yIChjb25zdCByZXN1bHRBcnJheSBvZiBPYmplY3QudmFsdWVzKHJlc3VsdHMpKSB7XG4gICAgICAgICAgICByZXN1bHRBcnJheS5zb3J0KChhOiBSZXN1bHQsIGI6IFJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc1Jvb21SZXN1bHQoYSkgfHwgaXNSb29tUmVzdWx0KGIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJvb20gcmVzdWx0cyBzaG91bGQgYXBwZWFyIGF0IHRoZSB0b3Agb2YgdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1Jvb21SZXN1bHQoYikpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1Jvb21SZXN1bHQoYSkpIHJldHVybiAtMTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjZW50QWxnb3JpdGhtLmdldExhc3RUcyhiLnJvb20sIG15VXNlcklkKSAtIHJlY2VudEFsZ29yaXRobS5nZXRMYXN0VHMoYS5yb29tLCBteVVzZXJJZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc01lbWJlclJlc3VsdChhKSB8fCBpc01lbWJlclJlc3VsdChiKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBNZW1iZXIgcmVzdWx0cyBzaG91bGQgYXBwZWFyIGp1c3QgYWZ0ZXIgcm9vbSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNNZW1iZXJSZXN1bHQoYikpIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc01lbWJlclJlc3VsdChhKSkgcmV0dXJuIC0xO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1iZXJDb21wYXJhdG9yKGEubWVtYmVyLCBiLm1lbWJlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LCBbdHJpbW1lZFF1ZXJ5LCBmaWx0ZXIsIGNsaSwgcG9zc2libGVSZXN1bHRzLCBtZW1iZXJDb21wYXJhdG9yXSk7XG5cbiAgICBjb25zdCBudW1SZXN1bHRzID0gc3VtKE9iamVjdC52YWx1ZXMocmVzdWx0cykubWFwKGl0ID0+IGl0Lmxlbmd0aCkpO1xuICAgIHVzZVdlYlNlYXJjaE1ldHJpY3MobnVtUmVzdWx0cywgcXVlcnkubGVuZ3RoLCB0cnVlKTtcblxuICAgIGNvbnN0IGFjdGl2ZVNwYWNlID0gU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZVJvb207XG4gICAgY29uc3QgW3NwYWNlUmVzdWx0cywgc3BhY2VSZXN1bHRzTG9hZGluZ10gPSB1c2VTcGFjZVJlc3VsdHMoYWN0aXZlU3BhY2UsIHF1ZXJ5KTtcblxuICAgIGNvbnN0IHNldFF1ZXJ5ID0gKGU6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1F1ZXJ5ID0gZS5jdXJyZW50VGFyZ2V0LnZhbHVlO1xuICAgICAgICBfc2V0UXVlcnkobmV3UXVlcnkpO1xuICAgIH07XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICAgIGxldCByZWY6IFJlZjtcbiAgICAgICAgICAgIGlmIChyb3ZpbmdDb250ZXh0LnN0YXRlLnJlZnMpIHtcbiAgICAgICAgICAgICAgICByZWYgPSByb3ZpbmdDb250ZXh0LnN0YXRlLnJlZnNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByb3ZpbmdDb250ZXh0LmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBUeXBlLlNldEZvY3VzLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgcmVmIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlZj8uY3VycmVudD8uc2Nyb2xsSW50b1ZpZXc/Lih7XG4gICAgICAgICAgICAgICAgYmxvY2s6IFwibmVhcmVzdFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyB3ZSBpbnRlbnRpb25hbGx5IGlnbm9yZSBjaGFuZ2VzIHRvIHRoZSByb3ZpbmdDb250ZXh0IGZvciB0aGUgcHVycG9zZSBvZiB0aGlzIGhvb2tcbiAgICAgICAgLy8gd2Ugb25seSB3YW50IHRvIHJlc2V0IHRoZSBmb2N1cyB3aGVuZXZlciB0aGUgcmVzdWx0cyBvciBmaWx0ZXJzIGNoYW5nZVxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICB9LCBbcmVzdWx0cywgZmlsdGVyXSk7XG5cbiAgICBjb25zdCB2aWV3Um9vbSA9IChcbiAgICAgICAgcm9vbTogeyByb29tSWQ6IHN0cmluZywgcm9vbUFsaWFzPzogc3RyaW5nLCBhdXRvSm9pbj86IGJvb2xlYW4sIHNob3VsZFBlZWs/OiBib29sZWFufSxcbiAgICAgICAgcGVyc2lzdCA9IGZhbHNlLFxuICAgICAgICB2aWFLZXlib2FyZCA9IGZhbHNlLFxuICAgICkgPT4ge1xuICAgICAgICBpZiAocGVyc2lzdCkge1xuICAgICAgICAgICAgY29uc3QgcmVjZW50cyA9IG5ldyBTZXQoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlNwb3RsaWdodFNlYXJjaC5yZWNlbnRTZWFyY2hlc1wiLCBudWxsKS5yZXZlcnNlKCkpO1xuICAgICAgICAgICAgLy8gcmVtb3ZlICYgYWRkIHRoZSByb29tIHRvIHB1dCBpdCBhdCB0aGUgZW5kXG4gICAgICAgICAgICByZWNlbnRzLmRlbGV0ZShyb29tLnJvb21JZCk7XG4gICAgICAgICAgICByZWNlbnRzLmFkZChyb29tLnJvb21JZCk7XG5cbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXG4gICAgICAgICAgICAgICAgXCJTcG90bGlnaHRTZWFyY2gucmVjZW50U2VhcmNoZXNcIixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFNldHRpbmdMZXZlbC5BQ0NPVU5ULFxuICAgICAgICAgICAgICAgIEFycmF5LmZyb20ocmVjZW50cykucmV2ZXJzZSgpLnNsaWNlKDAsIE1BWF9SRUNFTlRfU0VBUkNIRVMpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJXZWJVbmlmaWVkU2VhcmNoXCIsXG4gICAgICAgICAgICBtZXRyaWNzVmlhS2V5Ym9hcmQ6IHZpYUtleWJvYXJkLFxuICAgICAgICAgICAgcm9vbV9pZDogcm9vbS5yb29tSWQsXG4gICAgICAgICAgICByb29tX2FsaWFzOiByb29tLnJvb21BbGlhcyxcbiAgICAgICAgICAgIGF1dG9fam9pbjogcm9vbS5hdXRvSm9pbixcbiAgICAgICAgICAgIHNob3VsZF9wZWVrOiByb29tLnNob3VsZFBlZWssXG4gICAgICAgIH0pO1xuICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIGxldCBvdGhlclNlYXJjaGVzU2VjdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKHRyaW1tZWRRdWVyeSB8fCBmaWx0ZXIgIT09IEZpbHRlci5QdWJsaWNSb29tcykge1xuICAgICAgICBvdGhlclNlYXJjaGVzU2VjdGlvbiA9IChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbiBteF9TcG90bGlnaHREaWFsb2dfb3RoZXJTZWFyY2hlc1wiXG4gICAgICAgICAgICAgICAgcm9sZT1cImdyb3VwXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbl9vdGhlclNlYXJjaGVzXCI+XG4gICAgICAgICAgICAgICAgPGg0IGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb25fb3RoZXJTZWFyY2hlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7IHRyaW1tZWRRdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfdCgnVXNlIFwiJShxdWVyeSlzXCIgdG8gc2VhcmNoJywgeyBxdWVyeSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlYXJjaCBmb3JcIikgfVxuICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgeyAoZmlsdGVyICE9PSBGaWx0ZXIuUHVibGljUm9vbXMpICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cIm14X1Nwb3RsaWdodERpYWxvZ19idXR0b25fZXhwbG9yZVB1YmxpY1Jvb21zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfZXhwbG9yZVB1YmxpY1Jvb21zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaWx0ZXIoRmlsdGVyLlB1YmxpY1Jvb21zKX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGZpbHRlclRvTGFiZWwoRmlsdGVyLlB1YmxpY1Jvb21zKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L09wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIHsgKGZpbHRlciAhPT0gRmlsdGVyLlBlb3BsZSkgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPE9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9zdGFydENoYXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19zdGFydENoYXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpbHRlcihGaWx0ZXIuUGVvcGxlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGZpbHRlclRvTGFiZWwoRmlsdGVyLlBlb3BsZSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9PcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGNvbnRlbnQ6IEpTWC5FbGVtZW50O1xuICAgIGlmICh0cmltbWVkUXVlcnkgfHwgZmlsdGVyICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdE1hcHBlciA9IChyZXN1bHQ6IFJlc3VsdCk6IEpTWC5FbGVtZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChpc1Jvb21SZXN1bHQocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldFJvb21TdGF0ZShyZXN1bHQucm9vbSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdW5yZWFkTGFiZWwgPSByb29tQXJpYVVucmVhZExhYmVsKHJlc3VsdC5yb29tLCBub3RpZmljYXRpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyaWFQcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgICAgICAgICBcImFyaWEtbGFiZWxcIjogdW5yZWFkTGFiZWwgPyBgJHtyZXN1bHQucm9vbS5uYW1lfSAke3VucmVhZExhYmVsfWAgOiByZXN1bHQucm9vbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBcImFyaWEtZGVzY3JpYmVkYnlcIjogYG14X1Nwb3RsaWdodERpYWxvZ19idXR0b25fcmVzdWx0XyR7cmVzdWx0LnJvb20ucm9vbUlkfV9kZXRhaWxzYCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPXtgbXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9yZXN1bHRfJHtyZXN1bHQucm9vbS5yb29tSWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17YCR7U2VjdGlvbltyZXN1bHQuc2VjdGlvbl19LSR7cmVzdWx0LnJvb20ucm9vbUlkfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3Um9vbSh7IHJvb21JZDogcmVzdWx0LnJvb20ucm9vbUlkIH0sIHRydWUsIGV2Py50eXBlICE9PSBcImNsaWNrXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZEFkb3JubWVudD17PFJvb21SZXN1bHRDb250ZXh0TWVudXMgcm9vbT17cmVzdWx0LnJvb219IC8+fVxuICAgICAgICAgICAgICAgICAgICAgICAgey4uLmFyaWFQcm9wZXJ0aWVzfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RGVjb3JhdGVkUm9vbUF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3Jlc3VsdC5yb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclNpemU9e0FWQVRBUl9TSVpFfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXBQcm9wcz17eyB0YWJJbmRleDogLTEgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdC5yb29tLm5hbWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPE5vdGlmaWNhdGlvbkJhZGdlIG5vdGlmaWNhdGlvbj17bm90aWZpY2F0aW9ufSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21Db250ZXh0RGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPXtgbXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9yZXN1bHRfJHtyZXN1bHQucm9vbS5yb29tSWR9X2RldGFpbHNgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19yZXN1bHRfZGV0YWlsc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17cmVzdWx0LnJvb219XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L09wdGlvbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzTWVtYmVyUmVzdWx0KHJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD17YG14X1Nwb3RsaWdodERpYWxvZ19idXR0b25fcmVzdWx0XyR7cmVzdWx0Lm1lbWJlci51c2VySWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17YCR7U2VjdGlvbltyZXN1bHQuc2VjdGlvbl19LSR7cmVzdWx0Lm1lbWJlci51c2VySWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydERtT25GaXJzdE1lc3NhZ2UoY2xpLCBbcmVzdWx0Lm1lbWJlcl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtyZXN1bHQubWVtYmVyIGluc3RhbmNlb2YgUm9vbU1lbWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gcmVzdWx0Lm1lbWJlci5yYXdEaXNwbGF5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcmVzdWx0Lm1lbWJlci5uYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1kZXNjcmliZWRieT17YG14X1Nwb3RsaWdodERpYWxvZ19idXR0b25fcmVzdWx0XyR7cmVzdWx0Lm1lbWJlci51c2VySWR9X2RldGFpbHNgfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2VhcmNoUmVzdWx0QXZhdGFyIHVzZXI9e3Jlc3VsdC5tZW1iZXJ9IHNpemU9e0FWQVRBUl9TSVpFfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZXN1bHQubWVtYmVyIGluc3RhbmNlb2YgUm9vbU1lbWJlciA/IHJlc3VsdC5tZW1iZXIucmF3RGlzcGxheU5hbWUgOiByZXN1bHQubWVtYmVyLm5hbWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPXtgbXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9yZXN1bHRfJHtyZXN1bHQubWVtYmVyLnVzZXJJZH1fZGV0YWlsc2B9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3Jlc3VsdF9kZXRhaWxzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdC5tZW1iZXIudXNlcklkIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L09wdGlvbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzUHVibGljUm9vbVJlc3VsdChyZXN1bHQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpZW50Um9vbSA9IGNsaS5nZXRSb29tKHJlc3VsdC5wdWJsaWNSb29tLnJvb21faWQpO1xuICAgICAgICAgICAgICAgIC8vIEVsZW1lbnQgV2ViIGN1cnJlbnRseSBkb2VzIG5vdCBhbGxvdyBndWVzdHMgdG8gam9pbiByb29tcywgc28gd2VcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIHNob3cgdGhlbSB2aWV3IGJ1dHRvbnMgZm9yIGFsbCByb29tcy4gSWYgdGhlIHJvb20gaXMgbm90XG4gICAgICAgICAgICAgICAgLy8gd29ybGQgcmVhZGFibGUsIGEgbW9kYWwgd2lsbCBhcHBlYXIgYXNraW5nIHlvdSB0byByZWdpc3RlciBmaXJzdC4gSWZcbiAgICAgICAgICAgICAgICAvLyBpdCBpcyByZWFkYWJsZSwgdGhlIHByZXZpZXcgYXBwZWFycyBhcyBub3JtYWwuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hvd1ZpZXdCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFJvb20/LmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIiB8fFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVibGljUm9vbS53b3JsZF9yZWFkYWJsZSB8fFxuICAgICAgICAgICAgICAgICAgICBjbGkuaXNHdWVzdCgpXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVyID0gKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgcHVibGljUm9vbSB9ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB2aWV3Um9vbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tQWxpYXM6IHB1YmxpY1Jvb20uY2Fub25pY2FsX2FsaWFzIHx8IHB1YmxpY1Jvb20uYWxpYXNlcz8uWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiBwdWJsaWNSb29tLnJvb21faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvSm9pbjogIXJlc3VsdC5wdWJsaWNSb29tLndvcmxkX3JlYWRhYmxlICYmICFjbGkuaXNHdWVzdCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkUGVlazogcmVzdWx0LnB1YmxpY1Jvb20ud29ybGRfcmVhZGFibGUgfHwgY2xpLmlzR3Vlc3QoKSxcbiAgICAgICAgICAgICAgICAgICAgfSwgdHJ1ZSwgZXYudHlwZSAhPT0gXCJjbGlja1wiKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPXtgbXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9yZXN1bHRfJHtyZXN1bHQucHVibGljUm9vbS5yb29tX2lkfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfcmVzdWx0X211bHRpbGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2Ake1NlY3Rpb25bcmVzdWx0LnNlY3Rpb25dfS0ke3Jlc3VsdC5wdWJsaWNSb29tLnJvb21faWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2xpc3RlbmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kQWRvcm5tZW50PXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPXtzaG93Vmlld0J1dHRvbiA/IFwicHJpbWFyeV9vdXRsaW5lXCIgOiBcInByaW1hcnlcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17bGlzdGVuZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXstMX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc2hvd1ZpZXdCdXR0b24gPyBfdChcIlZpZXdcIikgOiBfdChcIkpvaW5cIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj59XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsbGVkYnk9e2BteF9TcG90bGlnaHREaWFsb2dfYnV0dG9uX3Jlc3VsdF8ke3Jlc3VsdC5wdWJsaWNSb29tLnJvb21faWR9X25hbWVgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1kZXNjcmliZWRieT17YG14X1Nwb3RsaWdodERpYWxvZ19idXR0b25fcmVzdWx0XyR7cmVzdWx0LnB1YmxpY1Jvb20ucm9vbV9pZH1fYWxpYXNgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1kZXRhaWxzPXtgbXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9yZXN1bHRfJHtyZXN1bHQucHVibGljUm9vbS5yb29tX2lkfV9kZXRhaWxzYH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TZWFyY2hSZXN1bHRBdmF0YXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybD17cmVzdWx0Py5wdWJsaWNSb29tPy5hdmF0YXJfdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gbWVkaWFGcm9tTXhjKHJlc3VsdD8ucHVibGljUm9vbT8uYXZhdGFyX3VybCkuZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cChBVkFUQVJfU0laRSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9e3Jlc3VsdC5wdWJsaWNSb29tLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWROYW1lPXtyZXN1bHQucHVibGljUm9vbS5yb29tX2lkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXtBVkFUQVJfU0laRX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9e0FWQVRBUl9TSVpFfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxQdWJsaWNSb29tUmVzdWx0RGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3Jlc3VsdC5wdWJsaWNSb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsSWQ9e2BteF9TcG90bGlnaHREaWFsb2dfYnV0dG9uX3Jlc3VsdF8ke3Jlc3VsdC5wdWJsaWNSb29tLnJvb21faWR9X25hbWVgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uSWQ9e2BteF9TcG90bGlnaHREaWFsb2dfYnV0dG9uX3Jlc3VsdF8ke3Jlc3VsdC5wdWJsaWNSb29tLnJvb21faWR9X2FsaWFzYH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzSWQ9e2BteF9TcG90bGlnaHREaWFsb2dfYnV0dG9uX3Jlc3VsdF8ke3Jlc3VsdC5wdWJsaWNSb29tLnJvb21faWR9X2RldGFpbHNgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9PcHRpb24+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSVJlc3VsdCBjYXNlXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWQ9e2BteF9TcG90bGlnaHREaWFsb2dfYnV0dG9uX3Jlc3VsdF8ke3Jlc3VsdC5uYW1lfWB9XG4gICAgICAgICAgICAgICAgICAgIGtleT17YCR7U2VjdGlvbltyZXN1bHQuc2VjdGlvbl19LSR7cmVzdWx0Lm5hbWV9YH1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17cmVzdWx0Lm9uQ2xpY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdC5hdmF0YXIgfVxuICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdC5uYW1lIH1cbiAgICAgICAgICAgICAgICAgICAgeyByZXN1bHQuZGVzY3JpcHRpb24gfVxuICAgICAgICAgICAgICAgIDwvT3B0aW9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcGVvcGxlU2VjdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChyZXN1bHRzW1NlY3Rpb24uUGVvcGxlXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBlb3BsZVNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbiBteF9TcG90bGlnaHREaWFsb2dfcmVzdWx0c1wiXG4gICAgICAgICAgICAgICAgICAgIHJvbGU9XCJncm91cFwiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uX3Blb3BsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8aDQgaWQ9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbl9wZW9wbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJSZWNlbnQgQ29udmVyc2F0aW9uc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdHNbU2VjdGlvbi5QZW9wbGVdLnNsaWNlKDAsIFNFQ1RJT05fTElNSVQpLm1hcChyZXN1bHRNYXBwZXIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN1Z2dlc3Rpb25zU2VjdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChyZXN1bHRzW1NlY3Rpb24uU3VnZ2VzdGlvbnNdLmxlbmd0aCAmJiBmaWx0ZXIgPT09IEZpbHRlci5QZW9wbGUpIHtcbiAgICAgICAgICAgIHN1Z2dlc3Rpb25zU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uIG14X1Nwb3RsaWdodERpYWxvZ19yZXN1bHRzXCJcbiAgICAgICAgICAgICAgICAgICAgcm9sZT1cImdyb3VwXCJcbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb25fc3VnZ2VzdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGg0IGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb25fc3VnZ2VzdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTdWdnZXN0aW9uc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdHNbU2VjdGlvbi5TdWdnZXN0aW9uc10uc2xpY2UoMCwgU0VDVElPTl9MSU1JVCkubWFwKHJlc3VsdE1hcHBlcikgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcm9vbXNTZWN0aW9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHJlc3VsdHNbU2VjdGlvbi5Sb29tc10ubGVuZ3RoKSB7XG4gICAgICAgICAgICByb29tc1NlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbiBteF9TcG90bGlnaHREaWFsb2dfcmVzdWx0c1wiXG4gICAgICAgICAgICAgICAgICAgIHJvbGU9XCJncm91cFwiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uX3Jvb21zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoNCBpZD1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uX3Jvb21zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiUm9vbXNcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L2g0PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyByZXN1bHRzW1NlY3Rpb24uUm9vbXNdLnNsaWNlKDAsIFNFQ1RJT05fTElNSVQpLm1hcChyZXN1bHRNYXBwZXIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNwYWNlc1NlY3Rpb246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAocmVzdWx0c1tTZWN0aW9uLlNwYWNlc10ubGVuZ3RoKSB7XG4gICAgICAgICAgICBzcGFjZXNTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb24gbXhfU3BvdGxpZ2h0RGlhbG9nX3Jlc3VsdHNcIlxuICAgICAgICAgICAgICAgICAgICByb2xlPVwiZ3JvdXBcIlxuICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbl9zcGFjZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGg0IGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb25fc3BhY2VzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiU3BhY2VzIHlvdSdyZSBpblwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdHNbU2VjdGlvbi5TcGFjZXNdLnNsaWNlKDAsIFNFQ1RJT05fTElNSVQpLm1hcChyZXN1bHRNYXBwZXIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHB1YmxpY1Jvb21zU2VjdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChmaWx0ZXIgPT09IEZpbHRlci5QdWJsaWNSb29tcykge1xuICAgICAgICAgICAgcHVibGljUm9vbXNTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb24gbXhfU3BvdGxpZ2h0RGlhbG9nX3Jlc3VsdHNcIlxuICAgICAgICAgICAgICAgICAgICByb2xlPVwiZ3JvdXBcIlxuICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbl9wdWJsaWNSb29tc1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uSGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDQgaWQ9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbl9wdWJsaWNSb29tc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTdWdnZXN0aW9uc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfb3B0aW9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZXhwbG9yaW5nUHVibGljU3BhY2VzRW5hYmxlZCAmJiA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWxsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2hvdyByb29tc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtzaG93Um9vbXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0U2hvd1Jvb21zfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWxsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2hvdyBzcGFjZXNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17c2hvd1NwYWNlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTaG93U3BhY2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvPiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPE5ldHdvcmtEcm9wZG93blxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm90b2NvbHM9e3Byb3RvY29sc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnPXtjb25maWcgPz8gbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29uZmlnPXtzZXRDb25maWd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj4geyAoc2hvd1Jvb21zIHx8IHNob3dTcGFjZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdHNbU2VjdGlvbi5QdWJsaWNSb29tc10uc2xpY2UoMCwgU0VDVElPTl9MSU1JVCkubWFwKHJlc3VsdE1hcHBlcilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogPGRpdiBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfb3RoZXJTZWFyY2hlc19tZXNzYWdlU2VhcmNoVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJZb3UgY2Fubm90IHNlYXJjaCBmb3Igcm9vbXMgdGhhdCBhcmUgbmVpdGhlciBhIHJvb20gbm9yIGEgc3BhY2VcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIH0gPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNwYWNlUm9vbXNTZWN0aW9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHNwYWNlUmVzdWx0cy5sZW5ndGggJiYgYWN0aXZlU3BhY2UgJiYgZmlsdGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICBzcGFjZVJvb21zU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uIG14X1Nwb3RsaWdodERpYWxvZ19yZXN1bHRzXCJcbiAgICAgICAgICAgICAgICAgICAgcm9sZT1cImdyb3VwXCJcbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb25fc3BhY2VSb29tc1wiPlxuICAgICAgICAgICAgICAgICAgICA8aDQgaWQ9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbl9zcGFjZVJvb21zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiT3RoZXIgcm9vbXMgaW4gJShzcGFjZU5hbWUpc1wiLCB7IHNwYWNlTmFtZTogYWN0aXZlU3BhY2UubmFtZSB9KSB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNwYWNlUmVzdWx0cy5zbGljZSgwLCBTRUNUSU9OX0xJTUlUKS5tYXAoKHJvb206IElIaWVyYXJjaHlSb29tKTogSlNYLkVsZW1lbnQgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9e2BteF9TcG90bGlnaHREaWFsb2dfYnV0dG9uX3Jlc3VsdF8ke3Jvb20ucm9vbV9pZH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3Jvb20ucm9vbV9pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3Um9vbSh7IHJvb21JZDogcm9vbS5yb29tX2lkIH0sIHRydWUsIGV2Py50eXBlICE9PSBcImNsaWNrXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJhc2VBdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9e3Jvb20ubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkTmFtZT17cm9vbS5yb29tX2lkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsPXtyb29tLmF2YXRhcl91cmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG1lZGlhRnJvbU14Yyhyb29tLmF2YXRhcl91cmwpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoQVZBVEFSX1NJWkUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17QVZBVEFSX1NJWkV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9e0FWQVRBUl9TSVpFfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJvb20ubmFtZSB8fCByb29tLmNhbm9uaWNhbF9hbGlhcyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcm9vbS5uYW1lICYmIHJvb20uY2Fub25pY2FsX2FsaWFzICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3Jlc3VsdF9kZXRhaWxzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByb29tLmNhbm9uaWNhbF9hbGlhcyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9PcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICApKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNwYWNlUmVzdWx0c0xvYWRpbmcgJiYgPFNwaW5uZXIgLz4gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgam9pblJvb21TZWN0aW9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRyaW1tZWRRdWVyeS5zdGFydHNXaXRoKFwiI1wiKSAmJlxuICAgICAgICAgICAgdHJpbW1lZFF1ZXJ5LmluY2x1ZGVzKFwiOlwiKSAmJlxuICAgICAgICAgICAgKCFnZXRDYWNoZWRSb29tSURGb3JBbGlhcyh0cmltbWVkUXVlcnkpIHx8ICFjbGkuZ2V0Um9vbShnZXRDYWNoZWRSb29tSURGb3JBbGlhcyh0cmltbWVkUXVlcnkpKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBqb2luUm9vbVNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbiBteF9TcG90bGlnaHREaWFsb2dfb3RoZXJTZWFyY2hlc1wiIHJvbGU9XCJncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPE9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9qb2luUm9vbUFsaWFzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfam9pblJvb21BbGlhc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tX2FsaWFzOiB0cmltbWVkUXVlcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvX2pvaW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJXZWJVbmlmaWVkU2VhcmNoXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVmlhS2V5Ym9hcmQ6IGV2Py50eXBlICE9PSBcImNsaWNrXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiSm9pbiAlKHJvb21BZGRyZXNzKXNcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tQWRkcmVzczogdHJpbW1lZFF1ZXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvT3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaGlkZGVuUmVzdWx0c1NlY3Rpb246IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoZmlsdGVyID09PSBGaWx0ZXIuUGVvcGxlKSB7XG4gICAgICAgICAgICBoaWRkZW5SZXN1bHRzU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uIG14X1Nwb3RsaWdodERpYWxvZ19oaWRkZW5SZXN1bHRzXCIgcm9sZT1cImdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoND57IF90KCdTb21lIHJlc3VsdHMgbWF5IGJlIGhpZGRlbiBmb3IgcHJpdmFjeScpIH08L2g0PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19vdGhlclNlYXJjaGVzX21lc3NhZ2VTZWFyY2hUZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiSWYgeW91IGNhbid0IHNlZSB3aG8geW91J3JlIGxvb2tpbmcgZm9yLCBzZW5kIHRoZW0geW91ciBpbnZpdGUgbGluay5cIikgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPFRvb2x0aXBPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9pbnZpdGVMaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19pbnZpdGVMaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHsgc2V0SW52aXRlTGlua0NvcGllZCh0cnVlKTsgY29weVBsYWludGV4dChvd25JbnZpdGVMaW5rKTsgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSGlkZVRvb2x0aXA9eygpID0+IHNldEludml0ZUxpbmtDb3BpZWQoZmFsc2UpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2ludml0ZUxpbmtDb3BpZWQgPyBfdChcIkNvcGllZCFcIikgOiBfdChcIkNvcHlcIil9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0FjY2Vzc2libGVCdXR0b24gbXhfQWNjZXNzaWJsZUJ1dHRvbl9oYXNLaW5kIG14X0FjY2Vzc2libGVCdXR0b25fa2luZF9wcmltYXJ5X291dGxpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ29weSBpbnZpdGUgbGlua1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvVG9vbHRpcE9wdGlvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodHJpbW1lZFF1ZXJ5ICYmIGZpbHRlciA9PT0gRmlsdGVyLlB1YmxpY1Jvb21zKSB7XG4gICAgICAgICAgICBoaWRkZW5SZXN1bHRzU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uIG14X1Nwb3RsaWdodERpYWxvZ19oaWRkZW5SZXN1bHRzXCIgcm9sZT1cImdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoND57IF90KCdTb21lIHJlc3VsdHMgbWF5IGJlIGhpZGRlbicpIH08L2g0PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19vdGhlclNlYXJjaGVzX21lc3NhZ2VTZWFyY2hUZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiSWYgeW91IGNhbid0IGZpbmQgdGhlIHJvb20geW91J3JlIGxvb2tpbmcgZm9yLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFzayBmb3IgYW4gaW52aXRlIG9yIGNyZWF0ZSBhIG5ldyByb29tLlwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD1cIm14X1Nwb3RsaWdodERpYWxvZ19idXR0b25fY3JlYXRlTmV3Um9vbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfY3JlYXRlUm9vbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19jcmVhdGVfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHROYW1lOiBjYXBpdGFsaXplKHRyaW1tZWRRdWVyeSksXG4gICAgICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQWNjZXNzaWJsZUJ1dHRvbiBteF9BY2Nlc3NpYmxlQnV0dG9uX2hhc0tpbmQgbXhfQWNjZXNzaWJsZUJ1dHRvbl9raW5kX3ByaW1hcnlfb3V0bGluZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDcmVhdGUgbmV3IHJvb21cIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L09wdGlvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZ3JvdXBDaGF0U2VjdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChmaWx0ZXIgPT09IEZpbHRlci5QZW9wbGUpIHtcbiAgICAgICAgICAgIGdyb3VwQ2hhdFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbiBteF9TcG90bGlnaHREaWFsb2dfb3RoZXJTZWFyY2hlc1wiXG4gICAgICAgICAgICAgICAgICAgIHJvbGU9XCJncm91cFwiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uX2dyb3VwQ2hhdFwiPlxuICAgICAgICAgICAgICAgICAgICA8aDQgaWQ9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbl9ncm91cENoYXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ090aGVyIG9wdGlvbnMnKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9zdGFydEdyb3VwQ2hhdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfc3RhcnRHcm91cENoYXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2hvd1N0YXJ0Q2hhdEludml0ZURpYWxvZyh0cmltbWVkUXVlcnkpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiU3RhcnQgYSBncm91cCBjaGF0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9PcHRpb24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1lc3NhZ2VTZWFyY2hTZWN0aW9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKGZpbHRlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbWVzc2FnZVNlYXJjaFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbiBteF9TcG90bGlnaHREaWFsb2dfb3RoZXJTZWFyY2hlc1wiXG4gICAgICAgICAgICAgICAgICAgIHJvbGU9XCJncm91cFwiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uX21lc3NhZ2VTZWFyY2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPGg0IGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb25fbWVzc2FnZVNlYXJjaFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIk90aGVyIHNlYXJjaGVzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9oND5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcG90bGlnaHREaWFsb2dfb3RoZXJTZWFyY2hlc19tZXNzYWdlU2VhcmNoVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRvIHNlYXJjaCBtZXNzYWdlcywgbG9vayBmb3IgdGhpcyBpY29uIGF0IHRoZSB0b3Agb2YgYSByb29tIDxpY29uLz5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGljb246ICgpID0+IDxkaXYgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX290aGVyU2VhcmNoZXNfbWVzc2FnZVNlYXJjaEljb25cIiAvPiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRlbnQgPSA8PlxuICAgICAgICAgICAgeyBwZW9wbGVTZWN0aW9uIH1cbiAgICAgICAgICAgIHsgc3VnZ2VzdGlvbnNTZWN0aW9uIH1cbiAgICAgICAgICAgIHsgcm9vbXNTZWN0aW9uIH1cbiAgICAgICAgICAgIHsgc3BhY2VzU2VjdGlvbiB9XG4gICAgICAgICAgICB7IHNwYWNlUm9vbXNTZWN0aW9uIH1cbiAgICAgICAgICAgIHsgcHVibGljUm9vbXNTZWN0aW9uIH1cbiAgICAgICAgICAgIHsgam9pblJvb21TZWN0aW9uIH1cbiAgICAgICAgICAgIHsgaGlkZGVuUmVzdWx0c1NlY3Rpb24gfVxuICAgICAgICAgICAgeyBvdGhlclNlYXJjaGVzU2VjdGlvbiB9XG4gICAgICAgICAgICB7IGdyb3VwQ2hhdFNlY3Rpb24gfVxuICAgICAgICAgICAgeyBtZXNzYWdlU2VhcmNoU2VjdGlvbiB9XG4gICAgICAgIDwvPjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcmVjZW50U2VhcmNoZXNTZWN0aW9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHJlY2VudFNlYXJjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVjZW50U2VhcmNoZXNTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb24gbXhfU3BvdGxpZ2h0RGlhbG9nX3JlY2VudFNlYXJjaGVzXCJcbiAgICAgICAgICAgICAgICAgICAgcm9sZT1cImdyb3VwXCJcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCBzb21ldGltZXMgbWFrZXMgdGhpcyBlbGVtZW50IGZvY3VzYWJsZSBkdWUgdG8gb3ZlcmZsb3csXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvIGZvcmNlIGl0IG91dCBvZiB0YWIgb3JkZXIgYnkgZGVmYXVsdC5cbiAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsbGVkYnk9XCJteF9TcG90bGlnaHREaWFsb2dfc2VjdGlvbl9yZWNlbnRTZWFyY2hlc1wiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8aDQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uX3JlY2VudFNlYXJjaGVzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlJlY2VudCBzZWFyY2hlc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua1wiIG9uQ2xpY2s9e2NsZWFyUmVjZW50U2VhcmNoZXN9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDbGVhclwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlY2VudFNlYXJjaGVzLm1hcChyb29tID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZS5pbnN0YW5jZS5nZXRSb29tU3RhdGUocm9vbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5yZWFkTGFiZWwgPSByb29tQXJpYVVucmVhZExhYmVsKHJvb20sIG5vdGlmaWNhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJpYVByb3BlcnRpZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXJpYS1sYWJlbFwiOiB1bnJlYWRMYWJlbCA/IGAke3Jvb20ubmFtZX0gJHt1bnJlYWRMYWJlbH1gIDogcm9vbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFyaWEtZGVzY3JpYmVkYnlcIjogYG14X1Nwb3RsaWdodERpYWxvZ19idXR0b25fcmVjZW50U2VhcmNoXyR7cm9vbS5yb29tSWR9X2RldGFpbHNgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPE9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9e2BteF9TcG90bGlnaHREaWFsb2dfYnV0dG9uX3JlY2VudFNlYXJjaF8ke3Jvb20ucm9vbUlkfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3Jvb20ucm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld1Jvb20oeyByb29tSWQ6IHJvb20ucm9vbUlkIH0sIHRydWUsIGV2Py50eXBlICE9PSBcImNsaWNrXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZEFkb3JubWVudD17PFJvb21SZXN1bHRDb250ZXh0TWVudXMgcm9vbT17cm9vbX0gLz59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Li4uYXJpYVByb3BlcnRpZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxEZWNvcmF0ZWRSb29tQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJTaXplPXtBVkFUQVJfU0laRX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwUHJvcHM9e3sgdGFiSW5kZXg6IC0xIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByb29tLm5hbWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPE5vdGlmaWNhdGlvbkJhZGdlIG5vdGlmaWNhdGlvbj17bm90aWZpY2F0aW9ufSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21Db250ZXh0RGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPXtgbXhfU3BvdGxpZ2h0RGlhbG9nX2J1dHRvbl9yZWNlbnRTZWFyY2hfJHtyb29tLnJvb21JZH1fZGV0YWlsc2B9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3Jlc3VsdF9kZXRhaWxzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9PcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGVudCA9IDw+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb24gbXhfU3BvdGxpZ2h0RGlhbG9nX3JlY2VudGx5Vmlld2VkXCJcbiAgICAgICAgICAgICAgICByb2xlPVwiZ3JvdXBcIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWN0aW9uX3JlY2VudGx5Vmlld2VkXCI+XG4gICAgICAgICAgICAgICAgPGg0IGlkPVwibXhfU3BvdGxpZ2h0RGlhbG9nX3NlY3Rpb25fcmVjZW50bHlWaWV3ZWRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlJlY2VudGx5IHZpZXdlZFwiKSB9XG4gICAgICAgICAgICAgICAgPC9oND5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2Uucm9vbXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIociA9PiByLnJvb21JZCAhPT0gUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAocm9vbSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRvb2x0aXBPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9e2BteF9TcG90bGlnaHREaWFsb2dfYnV0dG9uX3JlY2VudGx5Vmlld2VkXyR7cm9vbS5yb29tSWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3Jvb20ubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtyb29tLnJvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3Um9vbSh7IHJvb21JZDogcm9vbS5yb29tSWQgfSwgZmFsc2UsIGV2LnR5cGUgIT09IFwiY2xpY2tcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RGVjb3JhdGVkUm9vbUF2YXRhciByb29tPXtyb29tfSBhdmF0YXJTaXplPXszMn0gdG9vbHRpcFByb3BzPXt7IHRhYkluZGV4OiAtMSB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJvb20ubmFtZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Ub29sdGlwT3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsgcmVjZW50U2VhcmNoZXNTZWN0aW9uIH1cbiAgICAgICAgICAgIHsgb3RoZXJTZWFyY2hlc1NlY3Rpb24gfVxuICAgICAgICA8Lz47XG4gICAgfVxuXG4gICAgY29uc3Qgb25EaWFsb2dLZXlEb3duID0gKGV2OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IG5hdmlnYXRpb25BY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXROYXZpZ2F0aW9uQWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChuYXZpZ2F0aW9uQWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRmlsdGVyUm9vbXM6XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVmOiBSZWZPYmplY3Q8SFRNTEVsZW1lbnQ+O1xuICAgICAgICBjb25zdCBhY2Nlc3NpYmlsaXR5QWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihldik7XG4gICAgICAgIHN3aXRjaCAoYWNjZXNzaWJpbGl0eUFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVzY2FwZTpcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5BcnJvd1VwOlxuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkFycm93RG93bjpcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJvdmluZ0NvbnRleHQuc3RhdGUucmVmcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZWZzID0gcm92aW5nQ29udGV4dC5zdGF0ZS5yZWZzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXF1ZXJ5ICYmICFmaWx0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyBub3QgaW4gdGhlIHJlY2VudGx5IHZpZXdlZCByb3cgdGhlbiBvbmx5IGluY2x1ZGUgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCByZWNlbnRseSB2aWV3ZWQgc28gdGhhdCBpcyB0aGUgdGFyZ2V0IHdoZW4gdGhlIHVzZXIgaXMgc3dpdGNoaW5nIGludG8gcmVjZW50bHkgdmlld2VkLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2VwdFJlY2VudGx5Vmlld2VkUmVmID0gcmVmSXNGb3JSZWNlbnRseVZpZXdlZChyb3ZpbmdDb250ZXh0LnN0YXRlLmFjdGl2ZVJlZilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHJvdmluZ0NvbnRleHQuc3RhdGUuYWN0aXZlUmVmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiByZWZzLmZpbmQocmVmSXNGb3JSZWNlbnRseVZpZXdlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleGNsdWRlIGFsbCBvdGhlciByZWNlbnRseSB2aWV3ZWQgaXRlbXMgZnJvbSB0aGUgbGlzdCBzbyB1cC9kb3duIGFycm93cyBza2lwIHRoZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnMgPSByZWZzLmZpbHRlcihyZWYgPT4gcmVmID09PSBrZXB0UmVjZW50bHlWaWV3ZWRSZWYgfHwgIXJlZklzRm9yUmVjZW50bHlWaWV3ZWQocmVmKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSByZWZzLmluZGV4T2Yocm92aW5nQ29udGV4dC5zdGF0ZS5hY3RpdmVSZWYpO1xuICAgICAgICAgICAgICAgICAgICByZWYgPSBmaW5kU2libGluZ0VsZW1lbnQocmVmcywgaWR4ICsgKGFjY2Vzc2liaWxpdHlBY3Rpb24gPT09IEtleUJpbmRpbmdBY3Rpb24uQXJyb3dVcCA/IC0xIDogMSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkFycm93TGVmdDpcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5BcnJvd1JpZ2h0OlxuICAgICAgICAgICAgICAgIC8vIG9ubHkgaGFuZGxlIHRoZXNlIGtleXMgd2hlbiB3ZSBhcmUgaW4gdGhlIHJlY2VudGx5IHZpZXdlZCByb3cgb2Ygb3B0aW9uc1xuICAgICAgICAgICAgICAgIGlmICghcXVlcnkgJiYgIWZpbHRlciAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICByb3ZpbmdDb250ZXh0LnN0YXRlLnJlZnMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICByZWZJc0ZvclJlY2VudGx5Vmlld2VkKHJvdmluZ0NvbnRleHQuc3RhdGUuYWN0aXZlUmVmKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBvbmx5IGludGVyY2VwdCBsZWZ0L3JpZ2h0IGFycm93cyB3aGVuIHRoZSBmaWVsZCBpcyBlbXB0eSwgYW5kIHRoZXknZCBkbyBub3RoaW5nIGFueXdheVxuICAgICAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWZzID0gcm92aW5nQ29udGV4dC5zdGF0ZS5yZWZzLmZpbHRlcihyZWZJc0ZvclJlY2VudGx5Vmlld2VkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gcmVmcy5pbmRleE9mKHJvdmluZ0NvbnRleHQuc3RhdGUuYWN0aXZlUmVmKTtcbiAgICAgICAgICAgICAgICAgICAgcmVmID0gZmluZFNpYmxpbmdFbGVtZW50KHJlZnMsIGlkeCArIChhY2Nlc3NpYmlsaXR5QWN0aW9uID09PSBLZXlCaW5kaW5nQWN0aW9uLkFycm93TGVmdCA/IC0xIDogMSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWYpIHtcbiAgICAgICAgICAgIHJvdmluZ0NvbnRleHQuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFR5cGUuU2V0Rm9jdXMsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyByZWYgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVmLmN1cnJlbnQ/LnNjcm9sbEludG9WaWV3KHtcbiAgICAgICAgICAgICAgICBibG9jazogXCJuZWFyZXN0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbktleURvd24gPSAoZXY6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihldik7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5CYWNrc3BhY2U6XG4gICAgICAgICAgICAgICAgaWYgKCFxdWVyeSAmJiBmaWx0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIHNldEZpbHRlcihudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRW50ZXI6XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICByb3ZpbmdDb250ZXh0LnN0YXRlLmFjdGl2ZVJlZj8uY3VycmVudD8uY2xpY2soKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvcGVuRmVlZGJhY2sgPSBTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmwgPyAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhGZWVkYmFja0RpYWxvZywge1xuICAgICAgICAgICAgZmVhdHVyZTogXCJzcG90bGlnaHRcIixcbiAgICAgICAgfSk7XG4gICAgfSA6IG51bGw7XG5cbiAgICBjb25zdCBhY3RpdmVEZXNjZW5kYW50ID0gcm92aW5nQ29udGV4dC5zdGF0ZS5hY3RpdmVSZWY/LmN1cnJlbnQ/LmlkO1xuXG4gICAgcmV0dXJuIDw+XG4gICAgICAgIDxkaXYgaWQ9XCJteF9TcG90bGlnaHREaWFsb2dfa2V5Ym9hcmRQcm9tcHRcIj5cbiAgICAgICAgICAgIHsgX3QoXCJVc2UgPGFycm93cy8+IHRvIHNjcm9sbFwiLCB7fSwge1xuICAgICAgICAgICAgICAgIGFycm93czogKCkgPT4gPD5cbiAgICAgICAgICAgICAgICAgICAgPGtiZD7ihpM8L2tiZD5cbiAgICAgICAgICAgICAgICAgICAgPGtiZD7ihpE8L2tiZD5cbiAgICAgICAgICAgICAgICAgICAgeyAhZmlsdGVyICE9PSBudWxsICYmICFxdWVyeSAmJiA8a2JkPuKGkDwva2JkPiB9XG4gICAgICAgICAgICAgICAgICAgIHsgIWZpbHRlciAhPT0gbnVsbCAmJiAhcXVlcnkgJiYgPGtiZD7ihpI8L2tiZD4gfVxuICAgICAgICAgICAgICAgIDwvPixcbiAgICAgICAgICAgIH0pIH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ1wiXG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgIG9uS2V5RG93bj17b25EaWFsb2dLZXlEb3dufVxuICAgICAgICAgICAgc2NyZWVuTmFtZT1cIlVuaWZpZWRTZWFyY2hcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJTZWFyY2ggRGlhbG9nXCIpfVxuICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Nwb3RsaWdodERpYWxvZ19zZWFyY2hCb3ggbXhfdGV4dGlucHV0XCI+XG4gICAgICAgICAgICAgICAgeyBmaWx0ZXIgIT09IG51bGwgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1Nwb3RsaWdodERpYWxvZ19maWx0ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJteF9TcG90bGlnaHREaWFsb2dfZmlsdGVyUGVvcGxlXCI6IGZpbHRlciA9PT0gRmlsdGVyLlBlb3BsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibXhfU3BvdGxpZ2h0RGlhbG9nX2ZpbHRlclB1YmxpY1Jvb21zXCI6IGZpbHRlciA9PT0gRmlsdGVyLlB1YmxpY1Jvb21zLFxuICAgICAgICAgICAgICAgICAgICB9KX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57IGZpbHRlclRvTGFiZWwoZmlsdGVyKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJJbmRleD17LTF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtfdChcIlJlbW92ZSBzZWFyY2ggZmlsdGVyIGZvciAlKGZpbHRlcilzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyOiBmaWx0ZXJUb0xhYmVsKGZpbHRlciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX2ZpbHRlci0tY2xvc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEZpbHRlcihudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICByZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJTZWFyY2hcIil9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtxdWVyeX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldFF1ZXJ5fVxuICAgICAgICAgICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgYXJpYS1vd25zPVwibXhfU3BvdGxpZ2h0RGlhbG9nX2NvbnRlbnRcIlxuICAgICAgICAgICAgICAgICAgICBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQ9e2FjdGl2ZURlc2NlbmRhbnR9XG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiU2VhcmNoXCIpfVxuICAgICAgICAgICAgICAgICAgICBhcmlhLWRlc2NyaWJlZGJ5PVwibXhfU3BvdGxpZ2h0RGlhbG9nX2tleWJvYXJkUHJvbXB0XCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHsgKHB1YmxpY1Jvb21zTG9hZGluZyB8fCBwZW9wbGVMb2FkaW5nIHx8IHByb2ZpbGVMb2FkaW5nKSAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIHc9ezI0fSBoPXsyNH0gLz5cbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgcmVmPXtzY3JvbGxDb250YWluZXJSZWZ9XG4gICAgICAgICAgICAgICAgaWQ9XCJteF9TcG90bGlnaHREaWFsb2dfY29udGVudFwiXG4gICAgICAgICAgICAgICAgcm9sZT1cImxpc3Rib3hcIlxuICAgICAgICAgICAgICAgIGFyaWEtYWN0aXZlZGVzY2VuZGFudD17YWN0aXZlRGVzY2VuZGFudH1cbiAgICAgICAgICAgICAgICBhcmlhLWRlc2NyaWJlZGJ5PVwibXhfU3BvdGxpZ2h0RGlhbG9nX2tleWJvYXJkUHJvbXB0XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BvdGxpZ2h0RGlhbG9nX2Zvb3RlclwiPlxuICAgICAgICAgICAgICAgIHsgb3BlbkZlZWRiYWNrICYmIF90KFwiUmVzdWx0cyBub3QgYXMgZXhwZWN0ZWQ/IFBsZWFzZSA8YT5naXZlIGZlZWRiYWNrPC9hPi5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rX2lubGluZVwiIG9uQ2xpY2s9e29wZW5GZWVkYmFja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgIHsgb3BlbkZlZWRiYWNrICYmIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X291dGxpbmVcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvcGVuRmVlZGJhY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiRmVlZGJhY2tcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICA8Lz47XG59O1xuXG5jb25zdCBSb3ZpbmdTcG90bGlnaHREaWFsb2c6IFJlYWN0LkZDPElQcm9wcz4gPSAocHJvcHMpID0+IHtcbiAgICByZXR1cm4gPFJvdmluZ1RhYkluZGV4UHJvdmlkZXI+XG4gICAgICAgIHsgKCkgPT4gPFNwb3RsaWdodERpYWxvZyB7Li4ucHJvcHN9IC8+IH1cbiAgICA8L1JvdmluZ1RhYkluZGV4UHJvdmlkZXI+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUm92aW5nU3BvdGxpZ2h0RGlhbG9nO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFXQTs7QUFFQTs7QUFFQTs7QUFNQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWlGQSxNQUFNQSxtQkFBbUIsR0FBRyxFQUE1QjtBQUNBLE1BQU1DLGFBQWEsR0FBRyxFQUF0QixDLENBQTBCOztBQUMxQixNQUFNQyxXQUFXLEdBQUcsRUFBcEI7O0FBT0EsU0FBU0Msc0JBQVQsQ0FBZ0NDLEdBQWhDLEVBQXNFO0VBQ2xFLE9BQU9BLEdBQUcsQ0FBQ0MsT0FBSixFQUFhQyxFQUFiLEVBQWlCQyxVQUFqQixDQUE0QiwyQ0FBNUIsTUFBNkUsSUFBcEY7QUFDSDs7QUFFRCxTQUFTQyxZQUFULENBQXNCQyxTQUF0QixFQUEwQ0MsVUFBMUMsRUFBcUY7RUFDakYsTUFBTUMsU0FBUyxHQUFHLElBQUlDLEdBQUosRUFBbEI7RUFFQSxJQUFJSCxTQUFKLEVBQWVFLFNBQVMsQ0FBQ0UsR0FBVixDQUFjLElBQWQ7RUFDZixJQUFJSCxV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