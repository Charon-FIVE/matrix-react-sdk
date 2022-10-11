"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _Timer = _interopRequireDefault(require("../../utils/Timer"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015 - 2021 The Matrix.org Foundation C.I.C.

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
// The amount of extra scroll distance to allow prior to unfilling.
// See getExcessHeight.
const UNPAGINATION_PADDING = 6000; // The number of milliseconds to debounce calls to onUnfillRequest,
// to prevent many scroll events causing many unfilling requests.

const UNFILL_REQUEST_DEBOUNCE_MS = 200; // updateHeight makes the height a ceiled multiple of this so we don't have to update the height too often.
// It also allows the user to scroll past the pagination spinner a bit so they don't feel blocked so
// much while the content loads.

const PAGE_SIZE = 400;

const debuglog = function () {
  if (_SettingsStore.default.getValue("debug_scroll_panel")) {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _logger.logger.log.call(console, "ScrollPanel debuglog:", ...args);
  }
};

class ScrollPanel extends _react.default.Component {
  // Are we currently trying to backfill?
  // Is the current fill request caused by a props update?
  // Did another request to check the fill state arrive while we were trying to backfill?
  // Is that next fill request scheduled because of a props update?
  constructor(props, context) {
    var _this;

    super(props, context);
    _this = this;
    (0, _defineProperty2.default)(this, "pendingFillRequests", {
      b: null,
      f: null
    });
    (0, _defineProperty2.default)(this, "itemlist", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "scrollTimeout", void 0);
    (0, _defineProperty2.default)(this, "isFilling", void 0);
    (0, _defineProperty2.default)(this, "isFillingDueToPropsUpdate", false);
    (0, _defineProperty2.default)(this, "fillRequestWhileRunning", void 0);
    (0, _defineProperty2.default)(this, "pendingFillDueToPropsUpdate", void 0);
    (0, _defineProperty2.default)(this, "scrollState", void 0);
    (0, _defineProperty2.default)(this, "preventShrinkingState", void 0);
    (0, _defineProperty2.default)(this, "unfillDebouncer", void 0);
    (0, _defineProperty2.default)(this, "bottomGrowth", void 0);
    (0, _defineProperty2.default)(this, "minListHeight", void 0);
    (0, _defineProperty2.default)(this, "heightUpdateInProgress", void 0);
    (0, _defineProperty2.default)(this, "divScroll", void 0);
    (0, _defineProperty2.default)(this, "onScroll", ev => {
      // skip scroll events caused by resizing
      if (this.props.resizeNotifier && this.props.resizeNotifier.isResizing) return;
      debuglog("onScroll", this.getScrollNode().scrollTop);
      this.scrollTimeout.restart();
      this.saveScrollState();
      this.updatePreventShrinking();
      this.props.onScroll(ev);
      this.checkFillState();
    });
    (0, _defineProperty2.default)(this, "onResize", () => {
      debuglog("onResize");
      this.checkScroll(); // update preventShrinkingState if present

      if (this.preventShrinkingState) {
        this.preventShrinking();
      }
    });
    (0, _defineProperty2.default)(this, "checkScroll", function () {
      let isFromPropsUpdate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (_this.unmounted) {
        return;
      }

      _this.restoreSavedScrollState();

      _this.checkFillState(0, isFromPropsUpdate);
    });
    (0, _defineProperty2.default)(this, "isAtBottom", () => {
      const sn = this.getScrollNode(); // fractional values (both too big and too small)
      // for scrollTop happen on certain browsers/platforms
      // when scrolled all the way down. E.g. Chrome 72 on debian.
      //
      // We therefore leave a bit of wiggle-room and assume we're at the
      // bottom if the unscrolled area is less than one pixel high.
      //
      // non-standard DPI settings also seem to have effect here and can
      // actually lead to scrollTop+clientHeight being *larger* than
      // scrollHeight. (observed in element-desktop on Ubuntu 20.04)
      //

      return sn.scrollHeight - (sn.scrollTop + sn.clientHeight) <= 1;
    });
    (0, _defineProperty2.default)(this, "checkFillState", async function () {
      let depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let isFromPropsUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (_this.unmounted) {
        return;
      }

      const isFirstCall = depth === 0;

      const sn = _this.getScrollNode(); // if there is less than a screenful of messages above or below the
      // viewport, try to get some more messages.
      //
      // scrollTop is the number of pixels between the top of the content and
      //     the top of the viewport.
      //
      // scrollHeight is the total height of the content.
      //
      // clientHeight is the height of the viewport (excluding borders,
      // margins, and scrollbars).
      //
      //
      //   .---------.          -                 -
      //   |         |          |  scrollTop      |
      // .-+---------+-.    -   -                 |
      // | |         | |    |                     |
      // | |         | |    |  clientHeight       | scrollHeight
      // | |         | |    |                     |
      // `-+---------+-'    -                     |
      //   |         |                            |
      //   |         |                            |
      //   `---------'                            -
      //
      // as filling is async and recursive,
      // don't allow more than 1 chain of calls concurrently
      // do make a note when a new request comes in while already running one,
      // so we can trigger a new chain of calls once done.
      // However, we make an exception for when we're already filling due to a
      // props (or children) update, because very often the children include
      // spinners to say whether we're paginating or not, so this would cause
      // infinite paginating.


      if (isFirstCall) {
        if (_this.isFilling && !_this.isFillingDueToPropsUpdate) {
          debuglog("isFilling: not entering while request is ongoing, marking for a subsequent request");
          _this.fillRequestWhileRunning = true;
          _this.pendingFillDueToPropsUpdate = isFromPropsUpdate;
          return;
        }

        debuglog("isFilling: setting");
        _this.isFilling = true;
        _this.isFillingDueToPropsUpdate = isFromPropsUpdate;
      }

      const itemlist = _this.itemlist.current;
      const firstTile = itemlist && itemlist.firstElementChild;
      const contentTop = firstTile && firstTile.offsetTop;
      const fillPromises = []; // if scrollTop gets to 1 screen from the top of the first tile,
      // try backward filling

      if (!firstTile || sn.scrollTop - contentTop < sn.clientHeight) {
        // need to back-fill
        fillPromises.push(_this.maybeFill(depth, true));
      } // if scrollTop gets to 2 screens from the end (so 1 screen below viewport),
      // try forward filling


      if (sn.scrollHeight - sn.scrollTop < sn.clientHeight * 2) {
        // need to forward-fill
        fillPromises.push(_this.maybeFill(depth, false));
      }

      if (fillPromises.length) {
        try {
          await Promise.all(fillPromises);
        } catch (err) {
          _logger.logger.error(err);
        }
      }

      if (isFirstCall) {
        debuglog("isFilling: clearing");
        _this.isFilling = false;
        _this.isFillingDueToPropsUpdate = false;
      }

      if (_this.fillRequestWhileRunning) {
        const refillDueToPropsUpdate = _this.pendingFillDueToPropsUpdate;
        _this.fillRequestWhileRunning = false;
        _this.pendingFillDueToPropsUpdate = false;

        _this.checkFillState(0, refillDueToPropsUpdate);
      }
    });
    (0, _defineProperty2.default)(this, "getScrollState", () => this.scrollState);
    (0, _defineProperty2.default)(this, "resetScrollState", () => {
      this.scrollState = {
        stuckAtBottom: this.props.startAtBottom
      };
      this.bottomGrowth = 0;
      this.minListHeight = 0;
      this.scrollTimeout = new _Timer.default(100);
      this.heightUpdateInProgress = false;
    });
    (0, _defineProperty2.default)(this, "scrollToTop", () => {
      this.getScrollNode().scrollTop = 0;
      this.saveScrollState();
    });
    (0, _defineProperty2.default)(this, "scrollToBottom", () => {
      // the easiest way to make sure that the scroll state is correctly
      // saved is to do the scroll, then save the updated state. (Calculating
      // it ourselves is hard, and we can't rely on an onScroll callback
      // happening, since there may be no user-visible change here).
      const sn = this.getScrollNode();
      sn.scrollTop = sn.scrollHeight;
      this.saveScrollState();
    });
    (0, _defineProperty2.default)(this, "scrollRelative", mult => {
      const scrollNode = this.getScrollNode();
      const delta = mult * scrollNode.clientHeight * 0.9;
      scrollNode.scrollBy(0, delta);
      this.saveScrollState();
    });
    (0, _defineProperty2.default)(this, "handleScrollKey", ev => {
      const roomAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomAction(ev);

      switch (roomAction) {
        case _KeyboardShortcuts.KeyBindingAction.ScrollUp:
          this.scrollRelative(-1);
          break;

        case _KeyboardShortcuts.KeyBindingAction.ScrollDown:
          this.scrollRelative(1);
          break;

        case _KeyboardShortcuts.KeyBindingAction.JumpToFirstMessage:
          this.scrollToTop();
          break;

        case _KeyboardShortcuts.KeyBindingAction.JumpToLatestMessage:
          this.scrollToBottom();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "scrollToToken", (scrollToken, pixelOffset, offsetBase) => {
      pixelOffset = pixelOffset || 0;
      offsetBase = offsetBase || 0; // set the trackedScrollToken so we can get the node through getTrackedNode

      this.scrollState = {
        stuckAtBottom: false,
        trackedScrollToken: scrollToken
      };
      const trackedNode = this.getTrackedNode();
      const scrollNode = this.getScrollNode();

      if (trackedNode) {
        // set the scrollTop to the position we want.
        // note though, that this might not succeed if the combination of offsetBase and pixelOffset
        // would position the trackedNode towards the top of the viewport.
        // This because when setting the scrollTop only 10 or so events might be loaded,
        // not giving enough content below the trackedNode to scroll downwards
        // enough so it ends up in the top of the viewport.
        debuglog("scrollToken: setting scrollTop", {
          offsetBase,
          pixelOffset,
          offsetTop: trackedNode.offsetTop
        });
        scrollNode.scrollTop = trackedNode.offsetTop - scrollNode.clientHeight * offsetBase + pixelOffset;
        this.saveScrollState();
      }
    });
    (0, _defineProperty2.default)(this, "collectScroll", divScroll => {
      this.divScroll = divScroll;
    });
    (0, _defineProperty2.default)(this, "preventShrinking", () => {
      const messageList = this.itemlist.current;
      const tiles = messageList && messageList.children;

      if (!messageList) {
        return;
      }

      let lastTileNode;

      for (let i = tiles.length - 1; i >= 0; i--) {
        const node = tiles[i];

        if (node.dataset.scrollTokens) {
          lastTileNode = node;
          break;
        }
      }

      if (!lastTileNode) {
        return;
      }

      this.clearPreventShrinking();
      const offsetFromBottom = messageList.clientHeight - (lastTileNode.offsetTop + lastTileNode.clientHeight);
      this.preventShrinkingState = {
        offsetFromBottom: offsetFromBottom,
        offsetNode: lastTileNode
      };
      debuglog("prevent shrinking, last tile ", offsetFromBottom, "px from bottom");
    });
    (0, _defineProperty2.default)(this, "clearPreventShrinking", () => {
      const messageList = this.itemlist.current;
      const balanceElement = messageList && messageList.parentElement;
      if (balanceElement) balanceElement.style.paddingBottom = null;
      this.preventShrinkingState = null;
      debuglog("prevent shrinking cleared");
    });
    (0, _defineProperty2.default)(this, "updatePreventShrinking", () => {
      if (this.preventShrinkingState) {
        const sn = this.getScrollNode();
        const scrollState = this.scrollState;
        const messageList = this.itemlist.current;
        const {
          offsetNode,
          offsetFromBottom
        } = this.preventShrinkingState; // element used to set paddingBottom to balance the typing notifs disappearing

        const balanceElement = messageList.parentElement; // if the offsetNode got unmounted, clear

        let shouldClear = !offsetNode.parentElement; // also if 200px from bottom

        if (!shouldClear && !scrollState.stuckAtBottom) {
          const spaceBelowViewport = sn.scrollHeight - (sn.scrollTop + sn.clientHeight);
          shouldClear = spaceBelowViewport >= 200;
        } // try updating if not clearing


        if (!shouldClear) {
          const currentOffset = messageList.clientHeight - (offsetNode.offsetTop + offsetNode.clientHeight);
          const offsetDiff = offsetFromBottom - currentOffset;

          if (offsetDiff > 0) {
            balanceElement.style.paddingBottom = `${offsetDiff}px`;
            debuglog("update prevent shrinking ", offsetDiff, "px from bottom");
          } else if (offsetDiff < 0) {
            shouldClear = true;
          }
        }

        if (shouldClear) {
          this.clearPreventShrinking();
        }
      }
    });
    this.props.resizeNotifier?.on("middlePanelResizedNoisy", this.onResize);
    this.resetScrollState();
  }

  componentDidMount() {
    this.checkScroll();
  }

  componentDidUpdate() {
    // after adding event tiles, we may need to tweak the scroll (either to
    // keep at the bottom of the timeline, or to maintain the view after
    // adding events to the top).
    //
    // This will also re-check the fill state, in case the paginate was inadequate
    this.checkScroll(true);
    this.updatePreventShrinking();
  }

  componentWillUnmount() {
    // set a boolean to say we've been unmounted, which any pending
    // promises can use to throw away their results.
    //
    // (We could use isMounted(), but facebook have deprecated that.)
    this.unmounted = true;
    this.props.resizeNotifier?.removeListener("middlePanelResizedNoisy", this.onResize);
  }

  // returns the vertical height in the given direction that can be removed from
  // the content box (which has a height of scrollHeight, see checkFillState) without
  // pagination occuring.
  //
  // padding* = UNPAGINATION_PADDING
  //
  // ### Region determined as excess.
  //
  //   .---------.                        -              -
  //   |#########|                        |              |
  //   |#########|   -                    |  scrollTop   |
  //   |         |   | padding*           |              |
  //   |         |   |                    |              |
  // .-+---------+-. -  -                 |              |
  // : |         | :    |                 |              |
  // : |         | :    |  clientHeight   |              |
  // : |         | :    |                 |              |
  // .-+---------+-.    -                 -              |
  // | |         | |    |                                |
  // | |         | |    |  clientHeight                  | scrollHeight
  // | |         | |    |                                |
  // `-+---------+-'    -                                |
  // : |         | :    |                                |
  // : |         | :    |  clientHeight                  |
  // : |         | :    |                                |
  // `-+---------+-' -  -                                |
  //   |         |   | padding*                          |
  //   |         |   |                                   |
  //   |#########|   -                                   |
  //   |#########|                                       |
  //   `---------'                                       -
  getExcessHeight(backwards) {
    const sn = this.getScrollNode();
    const contentHeight = this.getMessagesHeight();
    const listHeight = this.getListHeight();
    const clippedHeight = contentHeight - listHeight;
    const unclippedScrollTop = sn.scrollTop + clippedHeight;

    if (backwards) {
      return unclippedScrollTop - sn.clientHeight - UNPAGINATION_PADDING;
    } else {
      return contentHeight - (unclippedScrollTop + 2 * sn.clientHeight) - UNPAGINATION_PADDING;
    }
  } // check the scroll state and send out backfill requests if necessary.


  // check if unfilling is possible and send an unfill request if necessary
  checkUnfillState(backwards) {
    let excessHeight = this.getExcessHeight(backwards);

    if (excessHeight <= 0) {
      return;
    }

    const origExcessHeight = excessHeight;
    const tiles = this.itemlist.current.children; // The scroll token of the first/last tile to be unpaginated

    let markerScrollToken = null; // Subtract heights of tiles to simulate the tiles being unpaginated until the
    // excess height is less than the height of the next tile to subtract. This
    // prevents excessHeight becoming negative, which could lead to future
    // pagination.
    //
    // If backwards is true, we unpaginate (remove) tiles from the back (top).

    let tile;

    for (let i = 0; i < tiles.length; i++) {
      tile = tiles[backwards ? i : tiles.length - 1 - i]; // Subtract height of tile as if it were unpaginated

      excessHeight -= tile.clientHeight; //If removing the tile would lead to future pagination, break before setting scroll token

      if (tile.clientHeight > excessHeight) {
        break;
      } // The tile may not have a scroll token, so guard it


      if (tile.dataset.scrollTokens) {
        markerScrollToken = tile.dataset.scrollTokens.split(',')[0];
      }
    }

    if (markerScrollToken) {
      // Use a debouncer to prevent multiple unfill calls in quick succession
      // This is to make the unfilling process less aggressive
      if (this.unfillDebouncer) {
        clearTimeout(this.unfillDebouncer);
      }

      this.unfillDebouncer = setTimeout(() => {
        this.unfillDebouncer = null;
        debuglog("unfilling now", backwards, origExcessHeight);
        this.props.onUnfillRequest(backwards, markerScrollToken);
      }, UNFILL_REQUEST_DEBOUNCE_MS);
    }
  } // check if there is already a pending fill request. If not, set one off.


  maybeFill(depth, backwards) {
    const dir = backwards ? 'b' : 'f';

    if (this.pendingFillRequests[dir]) {
      debuglog("Already a " + dir + " fill in progress - not starting another");
      return;
    }

    debuglog("starting " + dir + " fill"); // onFillRequest can end up calling us recursively (via onScroll
    // events) so make sure we set this before firing off the call.

    this.pendingFillRequests[dir] = true; // wait 1ms before paginating, because otherwise
    // this will block the scroll event handler for +700ms
    // if messages are already cached in memory,
    // This would cause jumping to happen on Chrome/macOS.

    return new Promise(resolve => setTimeout(resolve, 1)).then(() => {
      return this.props.onFillRequest(backwards);
    }).finally(() => {
      this.pendingFillRequests[dir] = false;
    }).then(hasMoreResults => {
      if (this.unmounted) {
        return;
      } // Unpaginate once filling is complete


      this.checkUnfillState(!backwards);
      debuglog("" + dir + " fill complete; hasMoreResults:" + hasMoreResults);

      if (hasMoreResults) {
        // further pagination requests have been disabled until now, so
        // it's time to check the fill state again in case the pagination
        // was insufficient.
        return this.checkFillState(depth + 1);
      }
    });
  }
  /* get the current scroll state. This returns an object with the following
   * properties:
   *
   * boolean stuckAtBottom: true if we are tracking the bottom of the
   *   scroll. false if we are tracking a particular child.
   *
   * string trackedScrollToken: undefined if stuckAtBottom is true; if it is
   *   false, the first token in data-scroll-tokens of the child which we are
   *   tracking.
   *
   * number bottomOffset: undefined if stuckAtBottom is true; if it is false,
   *   the number of pixels the bottom of the tracked child is above the
   *   bottom of the scroll panel.
   */


  saveScrollState() {
    if (this.props.stickyBottom && this.isAtBottom()) {
      this.scrollState = {
        stuckAtBottom: true
      };
      debuglog("saved stuckAtBottom state");
      return;
    }

    const scrollNode = this.getScrollNode();
    const viewportBottom = scrollNode.scrollHeight - (scrollNode.scrollTop + scrollNode.clientHeight);
    const itemlist = this.itemlist.current;
    const messages = itemlist.children;
    let node = null; // TODO: do a binary search here, as items are sorted by offsetTop
    // loop backwards, from bottom-most message (as that is the most common case)

    for (let i = messages.length - 1; i >= 0; --i) {
      if (!messages[i].dataset.scrollTokens) {
        continue;
      }

      node = messages[i]; // break at the first message (coming from the bottom)
      // that has it's offsetTop above the bottom of the viewport.

      if (this.topFromBottom(node) > viewportBottom) {
        // Use this node as the scrollToken
        break;
      }
    }

    if (!node) {
      debuglog("unable to save scroll state: found no children in the viewport");
      return;
    }

    const scrollToken = node.dataset.scrollTokens.split(',')[0];
    debuglog("saving anchored scroll state to message", node.innerText, scrollToken);
    const bottomOffset = this.topFromBottom(node);
    this.scrollState = {
      stuckAtBottom: false,
      trackedNode: node,
      trackedScrollToken: scrollToken,
      bottomOffset: bottomOffset,
      pixelOffset: bottomOffset - viewportBottom //needed for restoring the scroll position when coming back to the room

    };
  }

  async restoreSavedScrollState() {
    const scrollState = this.scrollState;

    if (scrollState.stuckAtBottom) {
      const sn = this.getScrollNode();

      if (sn.scrollTop !== sn.scrollHeight) {
        sn.scrollTop = sn.scrollHeight;
      }
    } else if (scrollState.trackedScrollToken) {
      const itemlist = this.itemlist.current;
      const trackedNode = this.getTrackedNode();

      if (trackedNode) {
        const newBottomOffset = this.topFromBottom(trackedNode);
        const bottomDiff = newBottomOffset - scrollState.bottomOffset;
        this.bottomGrowth += bottomDiff;
        scrollState.bottomOffset = newBottomOffset;
        const newHeight = `${this.getListHeight()}px`;

        if (itemlist.style.height !== newHeight) {
          itemlist.style.height = newHeight;
        }

        debuglog("balancing height because messages below viewport grew by", bottomDiff);
      }
    }

    if (!this.heightUpdateInProgress) {
      this.heightUpdateInProgress = true;

      try {
        await this.updateHeight();
      } finally {
        this.heightUpdateInProgress = false;
      }
    } else {
      debuglog("not updating height because request already in progress");
    }
  } // need a better name that also indicates this will change scrollTop? Rebalance height? Reveal content?


  async updateHeight() {
    // wait until user has stopped scrolling
    if (this.scrollTimeout.isRunning()) {
      debuglog("updateHeight waiting for scrolling to end ... ");
      await this.scrollTimeout.finished();
    } else {
      debuglog("updateHeight getting straight to business, no scrolling going on.");
    } // We might have unmounted since the timer finished, so abort if so.


    if (this.unmounted) {
      return;
    }

    const sn = this.getScrollNode();
    const itemlist = this.itemlist.current;
    const contentHeight = this.getMessagesHeight(); // Only round to the nearest page when we're basing the height off the content, not off the scrollNode height
    // otherwise it'll cause too much overscroll which makes it possible to entirely scroll content off-screen.

    if (contentHeight < sn.clientHeight) {
      this.minListHeight = sn.clientHeight;
    } else {
      this.minListHeight = Math.ceil(contentHeight / PAGE_SIZE) * PAGE_SIZE;
    }

    this.bottomGrowth = 0;
    const newHeight = `${this.getListHeight()}px`;
    const scrollState = this.scrollState;

    if (scrollState.stuckAtBottom) {
      if (itemlist.style.height !== newHeight) {
        itemlist.style.height = newHeight;
      }

      if (sn.scrollTop !== sn.scrollHeight) {
        sn.scrollTop = sn.scrollHeight;
      }

      debuglog("updateHeight to", newHeight);
    } else if (scrollState.trackedScrollToken) {
      const trackedNode = this.getTrackedNode(); // if the timeline has been reloaded
      // this can be called before scrollToBottom or whatever has been called
      // so don't do anything if the node has disappeared from
      // the currently filled piece of the timeline

      if (trackedNode) {
        const oldTop = trackedNode.offsetTop;

        if (itemlist.style.height !== newHeight) {
          itemlist.style.height = newHeight;
        }

        const newTop = trackedNode.offsetTop;
        const topDiff = newTop - oldTop; // important to scroll by a relative amount as
        // reading scrollTop and then setting it might
        // yield out of date values and cause a jump
        // when setting it

        sn.scrollBy(0, topDiff);
        debuglog("updateHeight to", {
          newHeight,
          topDiff
        });
      }
    }
  }

  getTrackedNode() {
    const scrollState = this.scrollState;
    const trackedNode = scrollState.trackedNode;

    if (!trackedNode?.parentElement) {
      let node;
      const messages = this.itemlist.current.children;
      const scrollToken = scrollState.trackedScrollToken;

      for (let i = messages.length - 1; i >= 0; --i) {
        const m = messages[i]; // 'data-scroll-tokens' is a DOMString of comma-separated scroll tokens
        // There might only be one scroll token

        if (m.dataset.scrollTokens?.split(',').includes(scrollToken)) {
          node = m;
          break;
        }
      }

      if (node) {
        debuglog("had to find tracked node again for " + scrollState.trackedScrollToken);
      }

      scrollState.trackedNode = node;
    }

    if (!scrollState.trackedNode) {
      debuglog("No node with ; '" + scrollState.trackedScrollToken + "'");
      return;
    }

    return scrollState.trackedNode;
  }

  getListHeight() {
    return this.bottomGrowth + this.minListHeight;
  }

  getMessagesHeight() {
    const itemlist = this.itemlist.current;
    const lastNode = itemlist.lastElementChild;
    const lastNodeBottom = lastNode ? lastNode.offsetTop + lastNode.clientHeight : 0;
    const firstNodeTop = itemlist.firstElementChild ? itemlist.firstElementChild.offsetTop : 0; // 18 is itemlist padding

    return lastNodeBottom - firstNodeTop + 18 * 2;
  }

  topFromBottom(node) {
    // current capped height - distance from top = distance from bottom of container to top of tracked element
    return this.itemlist.current.clientHeight - node.offsetTop;
  }
  /* get the DOM node which has the scrollTop property we care about for our
   * message panel.
   */


  getScrollNode() {
    if (this.unmounted) {
      // this shouldn't happen, but when it does, turn the NPE into
      // something more meaningful.
      throw new Error("ScrollPanel.getScrollNode called when unmounted");
    }

    if (!this.divScroll) {
      // Likewise, we should have the ref by this point, but if not
      // turn the NPE into something meaningful.
      throw new Error("ScrollPanel.getScrollNode called before AutoHideScrollbar ref collected");
    }

    return this.divScroll;
  }

  render() {
    // TODO: the classnames on the div and ol could do with being updated to
    // reflect the fact that we don't necessarily contain a list of messages.
    // it's not obvious why we have a separate div and ol anyway.
    // give the <ol> an explicit role=list because Safari+VoiceOver seems to think an ordered-list with
    // list-style-type: none; is no longer a list
    return /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
      wrappedRef: this.collectScroll,
      onScroll: this.onScroll,
      className: `mx_ScrollPanel ${this.props.className}`,
      style: this.props.style
    }, this.props.fixedChildren, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_messageListWrapper"
    }, /*#__PURE__*/_react.default.createElement("ol", {
      ref: this.itemlist,
      className: "mx_RoomView_MessageList",
      "aria-live": "polite"
    }, this.props.children)));
  }

}

exports.default = ScrollPanel;
(0, _defineProperty2.default)(ScrollPanel, "defaultProps", {
  stickyBottom: true,
  startAtBottom: true,
  onFillRequest: function (backwards) {
    return Promise.resolve(false);
  },
  onUnfillRequest: function (backwards, scrollToken) {},
  onScroll: function () {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVTlBBR0lOQVRJT05fUEFERElORyIsIlVORklMTF9SRVFVRVNUX0RFQk9VTkNFX01TIiwiUEFHRV9TSVpFIiwiZGVidWdsb2ciLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJhcmdzIiwibG9nZ2VyIiwibG9nIiwiY2FsbCIsImNvbnNvbGUiLCJTY3JvbGxQYW5lbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJiIiwiZiIsImNyZWF0ZVJlZiIsImV2IiwicmVzaXplTm90aWZpZXIiLCJpc1Jlc2l6aW5nIiwiZ2V0U2Nyb2xsTm9kZSIsInNjcm9sbFRvcCIsInNjcm9sbFRpbWVvdXQiLCJyZXN0YXJ0Iiwic2F2ZVNjcm9sbFN0YXRlIiwidXBkYXRlUHJldmVudFNocmlua2luZyIsIm9uU2Nyb2xsIiwiY2hlY2tGaWxsU3RhdGUiLCJjaGVja1Njcm9sbCIsInByZXZlbnRTaHJpbmtpbmdTdGF0ZSIsInByZXZlbnRTaHJpbmtpbmciLCJpc0Zyb21Qcm9wc1VwZGF0ZSIsInVubW91bnRlZCIsInJlc3RvcmVTYXZlZFNjcm9sbFN0YXRlIiwic24iLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJkZXB0aCIsImlzRmlyc3RDYWxsIiwiaXNGaWxsaW5nIiwiaXNGaWxsaW5nRHVlVG9Qcm9wc1VwZGF0ZSIsImZpbGxSZXF1ZXN0V2hpbGVSdW5uaW5nIiwicGVuZGluZ0ZpbGxEdWVUb1Byb3BzVXBkYXRlIiwiaXRlbWxpc3QiLCJjdXJyZW50IiwiZmlyc3RUaWxlIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJjb250ZW50VG9wIiwib2Zmc2V0VG9wIiwiZmlsbFByb21pc2VzIiwicHVzaCIsIm1heWJlRmlsbCIsImxlbmd0aCIsIlByb21pc2UiLCJhbGwiLCJlcnIiLCJlcnJvciIsInJlZmlsbER1ZVRvUHJvcHNVcGRhdGUiLCJzY3JvbGxTdGF0ZSIsInN0dWNrQXRCb3R0b20iLCJzdGFydEF0Qm90dG9tIiwiYm90dG9tR3Jvd3RoIiwibWluTGlzdEhlaWdodCIsIlRpbWVyIiwiaGVpZ2h0VXBkYXRlSW5Qcm9ncmVzcyIsIm11bHQiLCJzY3JvbGxOb2RlIiwiZGVsdGEiLCJzY3JvbGxCeSIsInJvb21BY3Rpb24iLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRSb29tQWN0aW9uIiwiS2V5QmluZGluZ0FjdGlvbiIsIlNjcm9sbFVwIiwic2Nyb2xsUmVsYXRpdmUiLCJTY3JvbGxEb3duIiwiSnVtcFRvRmlyc3RNZXNzYWdlIiwic2Nyb2xsVG9Ub3AiLCJKdW1wVG9MYXRlc3RNZXNzYWdlIiwic2Nyb2xsVG9Cb3R0b20iLCJzY3JvbGxUb2tlbiIsInBpeGVsT2Zmc2V0Iiwib2Zmc2V0QmFzZSIsInRyYWNrZWRTY3JvbGxUb2tlbiIsInRyYWNrZWROb2RlIiwiZ2V0VHJhY2tlZE5vZGUiLCJkaXZTY3JvbGwiLCJtZXNzYWdlTGlzdCIsInRpbGVzIiwiY2hpbGRyZW4iLCJsYXN0VGlsZU5vZGUiLCJpIiwibm9kZSIsImRhdGFzZXQiLCJzY3JvbGxUb2tlbnMiLCJjbGVhclByZXZlbnRTaHJpbmtpbmciLCJvZmZzZXRGcm9tQm90dG9tIiwib2Zmc2V0Tm9kZSIsImJhbGFuY2VFbGVtZW50IiwicGFyZW50RWxlbWVudCIsInN0eWxlIiwicGFkZGluZ0JvdHRvbSIsInNob3VsZENsZWFyIiwic3BhY2VCZWxvd1ZpZXdwb3J0IiwiY3VycmVudE9mZnNldCIsIm9mZnNldERpZmYiLCJvbiIsIm9uUmVzaXplIiwicmVzZXRTY3JvbGxTdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiY29tcG9uZW50RGlkVXBkYXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsImdldEV4Y2Vzc0hlaWdodCIsImJhY2t3YXJkcyIsImNvbnRlbnRIZWlnaHQiLCJnZXRNZXNzYWdlc0hlaWdodCIsImxpc3RIZWlnaHQiLCJnZXRMaXN0SGVpZ2h0IiwiY2xpcHBlZEhlaWdodCIsInVuY2xpcHBlZFNjcm9sbFRvcCIsImNoZWNrVW5maWxsU3RhdGUiLCJleGNlc3NIZWlnaHQiLCJvcmlnRXhjZXNzSGVpZ2h0IiwibWFya2VyU2Nyb2xsVG9rZW4iLCJ0aWxlIiwic3BsaXQiLCJ1bmZpbGxEZWJvdW5jZXIiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwib25VbmZpbGxSZXF1ZXN0IiwiZGlyIiwicGVuZGluZ0ZpbGxSZXF1ZXN0cyIsInJlc29sdmUiLCJ0aGVuIiwib25GaWxsUmVxdWVzdCIsImZpbmFsbHkiLCJoYXNNb3JlUmVzdWx0cyIsInN0aWNreUJvdHRvbSIsImlzQXRCb3R0b20iLCJ2aWV3cG9ydEJvdHRvbSIsIm1lc3NhZ2VzIiwidG9wRnJvbUJvdHRvbSIsImlubmVyVGV4dCIsImJvdHRvbU9mZnNldCIsIm5ld0JvdHRvbU9mZnNldCIsImJvdHRvbURpZmYiLCJuZXdIZWlnaHQiLCJoZWlnaHQiLCJ1cGRhdGVIZWlnaHQiLCJpc1J1bm5pbmciLCJmaW5pc2hlZCIsIk1hdGgiLCJjZWlsIiwib2xkVG9wIiwibmV3VG9wIiwidG9wRGlmZiIsIm0iLCJpbmNsdWRlcyIsImxhc3ROb2RlIiwibGFzdEVsZW1lbnRDaGlsZCIsImxhc3ROb2RlQm90dG9tIiwiZmlyc3ROb2RlVG9wIiwiRXJyb3IiLCJyZW5kZXIiLCJjb2xsZWN0U2Nyb2xsIiwiY2xhc3NOYW1lIiwiZml4ZWRDaGlsZHJlbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvU2Nyb2xsUGFuZWwudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSAtIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmLCBDU1NQcm9wZXJ0aWVzLCBSZWFjdE5vZGUsIEtleWJvYXJkRXZlbnQgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZSc7XG5pbXBvcnQgVGltZXIgZnJvbSAnLi4vLi4vdXRpbHMvVGltZXInO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gXCIuL0F1dG9IaWRlU2Nyb2xsYmFyXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcblxuLy8gVGhlIGFtb3VudCBvZiBleHRyYSBzY3JvbGwgZGlzdGFuY2UgdG8gYWxsb3cgcHJpb3IgdG8gdW5maWxsaW5nLlxuLy8gU2VlIGdldEV4Y2Vzc0hlaWdodC5cbmNvbnN0IFVOUEFHSU5BVElPTl9QQURESU5HID0gNjAwMDtcbi8vIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlYm91bmNlIGNhbGxzIHRvIG9uVW5maWxsUmVxdWVzdCxcbi8vIHRvIHByZXZlbnQgbWFueSBzY3JvbGwgZXZlbnRzIGNhdXNpbmcgbWFueSB1bmZpbGxpbmcgcmVxdWVzdHMuXG5jb25zdCBVTkZJTExfUkVRVUVTVF9ERUJPVU5DRV9NUyA9IDIwMDtcbi8vIHVwZGF0ZUhlaWdodCBtYWtlcyB0aGUgaGVpZ2h0IGEgY2VpbGVkIG11bHRpcGxlIG9mIHRoaXMgc28gd2UgZG9uJ3QgaGF2ZSB0byB1cGRhdGUgdGhlIGhlaWdodCB0b28gb2Z0ZW4uXG4vLyBJdCBhbHNvIGFsbG93cyB0aGUgdXNlciB0byBzY3JvbGwgcGFzdCB0aGUgcGFnaW5hdGlvbiBzcGlubmVyIGEgYml0IHNvIHRoZXkgZG9uJ3QgZmVlbCBibG9ja2VkIHNvXG4vLyBtdWNoIHdoaWxlIHRoZSBjb250ZW50IGxvYWRzLlxuY29uc3QgUEFHRV9TSVpFID0gNDAwO1xuXG5jb25zdCBkZWJ1Z2xvZyA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZGVidWdfc2Nyb2xsX3BhbmVsXCIpKSB7XG4gICAgICAgIGxvZ2dlci5sb2cuY2FsbChjb25zb2xlLCBcIlNjcm9sbFBhbmVsIGRlYnVnbG9nOlwiLCAuLi5hcmdzKTtcbiAgICB9XG59O1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvKiBzdGlja3lCb3R0b206IGlmIHNldCB0byB0cnVlLCB0aGVuIG9uY2UgdGhlIHVzZXIgaGl0cyB0aGUgYm90dG9tIG9mXG4gICAgICogdGhlIGxpc3QsIGFueSBuZXcgY2hpbGRyZW4gYWRkZWQgdG8gdGhlIGxpc3Qgd2lsbCBjYXVzZSB0aGUgbGlzdCB0b1xuICAgICAqIHNjcm9sbCBkb3duIHRvIHNob3cgdGhlIG5ldyBlbGVtZW50LCByYXRoZXIgdGhhbiBwcmVzZXJ2aW5nIHRoZVxuICAgICAqIGV4aXN0aW5nIHZpZXcuXG4gICAgICovXG4gICAgc3RpY2t5Qm90dG9tPzogYm9vbGVhbjtcblxuICAgIC8qIHN0YXJ0QXRCb3R0b206IGlmIHNldCB0byB0cnVlLCB0aGUgdmlldyBpcyBhc3N1bWVkIHRvIHN0YXJ0XG4gICAgICogc2Nyb2xsZWQgdG8gdGhlIGJvdHRvbS5cbiAgICAgKiBYWFg6IEl0J3MgbGlrZWx5IHRoaXMgaXMgdW5uZWNlc3NhcnkgYW5kIGNhbiBiZSBkZXJpdmVkIGZyb21cbiAgICAgKiBzdGlja3lCb3R0b20sIGJ1dCBJJ20gYWRkaW5nIGFuIGV4dHJhIHBhcmFtZXRlciB0byBlbnN1cmVcbiAgICAgKiBiZWhhdmlvdXIgc3RheXMgdGhlIHNhbWUgZm9yIG90aGVyIHVzZXMgb2YgU2Nyb2xsUGFuZWwuXG4gICAgICogSWYgc28sIGxldCdzIHJlbW92ZSB0aGlzIHBhcmFtZXRlciBkb3duIHRoZSBsaW5lLlxuICAgICAqL1xuICAgIHN0YXJ0QXRCb3R0b20/OiBib29sZWFuO1xuXG4gICAgLyogY2xhc3NOYW1lOiBjbGFzc25hbWVzIHRvIGFkZCB0byB0aGUgdG9wLWxldmVsIGRpdlxuICAgICAqL1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcblxuICAgIC8qIHN0eWxlOiBzdHlsZXMgdG8gYWRkIHRvIHRoZSB0b3AtbGV2ZWwgZGl2XG4gICAgICovXG4gICAgc3R5bGU/OiBDU1NQcm9wZXJ0aWVzO1xuXG4gICAgLyogcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyIHRvIGtub3cgd2hlbiBtaWRkbGUgY29sdW1uIGhhcyBjaGFuZ2VkIHNpemVcbiAgICAgKi9cbiAgICByZXNpemVOb3RpZmllcj86IFJlc2l6ZU5vdGlmaWVyO1xuXG4gICAgLyogZml4ZWRDaGlsZHJlbjogYWxsb3dzIGZvciBjaGlsZHJlbiB0byBiZSBwYXNzZWQgd2hpY2ggYXJlIHJlbmRlcmVkIG91dHNpZGVcbiAgICAgKiBvZiB0aGUgd3JhcHBlclxuICAgICAqL1xuICAgIGZpeGVkQ2hpbGRyZW4/OiBSZWFjdE5vZGU7XG5cbiAgICAvKiBvbkZpbGxSZXF1ZXN0KGJhY2t3YXJkcyk6IGEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIG9uIHNjcm9sbCB3aGVuXG4gICAgICogdGhlIHVzZXIgbmVhcnMgdGhlIHN0YXJ0IChiYWNrd2FyZHMgPSB0cnVlKSBvciBlbmQgKGJhY2t3YXJkcyA9XG4gICAgICogZmFsc2UpIG9mIHRoZSBsaXN0LlxuICAgICAqXG4gICAgICogVGhpcyBzaG91bGQgcmV0dXJuIGEgcHJvbWlzZTsgbm8gbW9yZSBjYWxscyB3aWxsIGJlIG1hZGUgdW50aWwgdGhlXG4gICAgICogcHJvbWlzZSBjb21wbGV0ZXMuXG4gICAgICpcbiAgICAgKiBUaGUgcHJvbWlzZSBzaG91bGQgcmVzb2x2ZSB0byB0cnVlIGlmIHRoZXJlIGlzIG1vcmUgZGF0YSB0byBiZVxuICAgICAqIHJldHJpZXZlZCBpbiB0aGlzIGRpcmVjdGlvbiAoaW4gd2hpY2ggY2FzZSBvbkZpbGxSZXF1ZXN0IG1heSBiZVxuICAgICAqIGNhbGxlZCBhZ2FpbiBpbW1lZGlhdGVseSksIG9yIGZhbHNlIGlmIHRoZXJlIGlzIG5vIG1vcmUgZGF0YSBpbiB0aGlzXG4gICAgICogZGlyZWN0aW9uIChhdCB0aGlzIHRpbWUpIC0gd2hpY2ggd2lsbCBzdG9wIHRoZSBwYWdpbmF0aW9uIGN5Y2xlIHVudGlsXG4gICAgICogdGhlIHVzZXIgc2Nyb2xscyBhZ2Fpbi5cbiAgICAgKi9cbiAgICBvbkZpbGxSZXF1ZXN0PyhiYWNrd2FyZHM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+O1xuXG4gICAgLyogb25VbmZpbGxSZXF1ZXN0KGJhY2t3YXJkcyk6IGEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIG9uIHNjcm9sbCB3aGVuXG4gICAgICogdGhlcmUgYXJlIGNoaWxkcmVuIGVsZW1lbnRzIHRoYXQgYXJlIGZhciBvdXQgb2YgdmlldyBhbmQgY291bGQgYmUgcmVtb3ZlZFxuICAgICAqIHdpdGhvdXQgY2F1c2luZyBwYWdpbmF0aW9uIHRvIG9jY3VyLlxuICAgICAqXG4gICAgICogVGhpcyBmdW5jdGlvbiBzaG91bGQgYWNjZXB0IGEgYm9vbGVhbiwgd2hpY2ggaXMgdHJ1ZSB0byBpbmRpY2F0ZSB0aGUgYmFjay90b3BcbiAgICAgKiBvZiB0aGUgcGFuZWwgYW5kIGZhbHNlIG90aGVyd2lzZSwgYW5kIGEgc2Nyb2xsIHRva2VuLCB3aGljaCByZWZlcnMgdG8gdGhlXG4gICAgICogZmlyc3QgZWxlbWVudCB0byByZW1vdmUgaWYgcmVtb3ZpbmcgZnJvbSB0aGUgZnJvbnQvYm90dG9tLCBhbmQgbGFzdCBlbGVtZW50XG4gICAgICogdG8gcmVtb3ZlIGlmIHJlbW92aW5nIGZyb20gdGhlIGJhY2svdG9wLlxuICAgICAqL1xuICAgIG9uVW5maWxsUmVxdWVzdD8oYmFja3dhcmRzOiBib29sZWFuLCBzY3JvbGxUb2tlbjogc3RyaW5nKTogdm9pZDtcblxuICAgIC8qIG9uU2Nyb2xsOiBhIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuZXZlciBhbnkgc2Nyb2xsIGhhcHBlbnMuXG4gICAgICovXG4gICAgb25TY3JvbGw/KGV2ZW50OiBFdmVudCk6IHZvaWQ7XG59XG5cbi8qIFRoaXMgY29tcG9uZW50IGltcGxlbWVudHMgYW4gaW50ZWxsaWdlbnQgc2Nyb2xsaW5nIGxpc3QuXG4gKlxuICogSXQgd3JhcHMgYSBsaXN0IG9mIDxsaT4gY2hpbGRyZW47IHdoZW4gaXRlbXMgYXJlIGFkZGVkIHRvIHRoZSBzdGFydCBvciBlbmRcbiAqIG9mIHRoZSBsaXN0LCB0aGUgc2Nyb2xsIHBvc2l0aW9uIGlzIHVwZGF0ZWQgc28gdGhhdCB0aGUgdXNlciBzdGlsbCBzZWVzIHRoZVxuICogc2FtZSBwb3NpdGlvbiBpbiB0aGUgbGlzdC5cbiAqXG4gKiBJdCBhbHNvIHByb3ZpZGVzIGEgaG9vayB3aGljaCBhbGxvd3MgcGFyZW50cyB0byBwcm92aWRlIG1vcmUgbGlzdCBlbGVtZW50c1xuICogd2hlbiB3ZSBnZXQgY2xvc2UgdG8gdGhlIHN0YXJ0IG9yIGVuZCBvZiB0aGUgbGlzdC5cbiAqXG4gKiBFYWNoIGNoaWxkIGVsZW1lbnQgc2hvdWxkIGhhdmUgYSAnZGF0YS1zY3JvbGwtdG9rZW5zJy4gVGhpcyBzdHJpbmcgb2ZcbiAqIGNvbW1hLXNlcGFyYXRlZCB0b2tlbnMgbWF5IGNvbnRhaW4gYSBzaW5nbGUgdG9rZW4gb3IgbWFueSwgd2hlcmUgbWFueSBpbmRpY2F0ZXNcbiAqIHRoYXQgdGhlIGVsZW1lbnQgY29udGFpbnMgZWxlbWVudHMgdGhhdCBoYXZlIHNjcm9sbCB0b2tlbnMgdGhlbXNlbHZlcy4gVGhlIGZpcnN0XG4gKiB0b2tlbiBpbiAnZGF0YS1zY3JvbGwtdG9rZW5zJyBpcyB1c2VkIHRvIHNlcmlhbGlzZSB0aGUgc2Nyb2xsIHN0YXRlLCBhbmQgcmV0dXJuZWRcbiAqIGFzIHRoZSAndHJhY2tlZFNjcm9sbFRva2VuJyBhdHRyaWJ1dGUgYnkgZ2V0U2Nyb2xsU3RhdGUoKS5cbiAqXG4gKiBJTVBPUlRBTlQ6IElORElWSURVQUwgVE9LRU5TIFdJVEhJTiAnZGF0YS1zY3JvbGwtdG9rZW5zJyBNVVNUIE5PVCBDT05UQUlOIENPTU1BUy5cbiAqXG4gKiBTb21lIG5vdGVzIGFib3V0IHRoZSBpbXBsZW1lbnRhdGlvbjpcbiAqXG4gKiBUaGUgc2F2ZWQgJ3Njcm9sbFN0YXRlJyBjYW4gZXhpc3QgaW4gb25lIG9mIHR3byBzdGF0ZXM6XG4gKlxuICogICAtIHN0dWNrQXRCb3R0b206ICh0aGUgZGVmYXVsdCwgYW5kIHJlc3RvcmVkIGJ5IHJlc2V0U2Nyb2xsU3RhdGUpOiB0aGVcbiAqICAgICB2aWV3cG9ydCBpcyBzY3JvbGxlZCBkb3duIGFzIGZhciBhcyBpdCBjYW4gYmUuIFdoZW4gdGhlIGNoaWxkcmVuIGFyZVxuICogICAgIHVwZGF0ZWQsIHRoZSBzY3JvbGwgcG9zaXRpb24gd2lsbCBiZSB1cGRhdGVkIHRvIGVuc3VyZSBpdCBpcyBzdGlsbCBhdFxuICogICAgIHRoZSBib3R0b20uXG4gKlxuICogICAtIGZpeGVkLCBpbiB3aGljaCB0aGUgdmlld3BvcnQgaXMgY29uY2VwdHVhbGx5IHRpZWQgYXQgYSBzcGVjaWZpYyBzY3JvbGxcbiAqICAgICBvZmZzZXQuICBXZSBkb24ndCBzYXZlIHRoZSBhYnNvbHV0ZSBzY3JvbGwgb2Zmc2V0LCBiZWNhdXNlIHRoYXQgd291bGQgYmVcbiAqICAgICBhZmZlY3RlZCBieSB3aW5kb3cgd2lkdGgsIHpvb20gbGV2ZWwsIGFtb3VudCBvZiBzY3JvbGxiYWNrLCBldGMuIEluc3RlYWRcbiAqICAgICB3ZSBzYXZlIGFuIGlkZW50aWZpZXIgZm9yIHRoZSBsYXN0IGZ1bGx5LXZpc2libGUgbWVzc2FnZSwgYW5kIHRoZSBudW1iZXJcbiAqICAgICBvZiBwaXhlbHMgdGhlIHdpbmRvdyB3YXMgc2Nyb2xsZWQgYmVsb3cgaXQgLSB3aGljaCBpcyBob3BlZnVsbHkgbmVhclxuICogICAgIGVub3VnaC5cbiAqXG4gKiBUaGUgJ3N0aWNreUJvdHRvbScgcHJvcGVydHkgY29udHJvbHMgdGhlIGJlaGF2aW91ciB3aGVuIHdlIHJlYWNoIHRoZSBib3R0b21cbiAqIG9mIHRoZSB3aW5kb3cgKGVpdGhlciB0aHJvdWdoIGEgdXNlci1pbml0aWF0ZWQgc2Nyb2xsLCBvciBieSBjYWxsaW5nXG4gKiBzY3JvbGxUb0JvdHRvbSkuIElmIHN0aWNreUJvdHRvbSBpcyBlbmFibGVkLCB0aGUgc2Nyb2xsU3RhdGUgd2lsbCBlbnRlclxuICogJ3N0dWNrQXRCb3R0b20nIHN0YXRlIC0gZW5zdXJpbmcgdGhhdCBuZXcgYWRkaXRpb25zIGNhdXNlIHRoZSB3aW5kb3cgdG9cbiAqIHNjcm9sbCBkb3duIGZ1cnRoZXIuIElmIHN0aWNreUJvdHRvbSBpcyBkaXNhYmxlZCwgd2UganVzdCBzYXZlIHRoZSBzY3JvbGxcbiAqIG9mZnNldCBhcyBub3JtYWwuXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBJU2Nyb2xsU3RhdGUge1xuICAgIHN0dWNrQXRCb3R0b206IGJvb2xlYW47XG4gICAgdHJhY2tlZE5vZGU/OiBIVE1MRWxlbWVudDtcbiAgICB0cmFja2VkU2Nyb2xsVG9rZW4/OiBzdHJpbmc7XG4gICAgYm90dG9tT2Zmc2V0PzogbnVtYmVyO1xuICAgIHBpeGVsT2Zmc2V0PzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgSVByZXZlbnRTaHJpbmtpbmdTdGF0ZSB7XG4gICAgb2Zmc2V0RnJvbUJvdHRvbTogbnVtYmVyO1xuICAgIG9mZnNldE5vZGU6IEhUTUxFbGVtZW50O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY3JvbGxQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBzdGlja3lCb3R0b206IHRydWUsXG4gICAgICAgIHN0YXJ0QXRCb3R0b206IHRydWUsXG4gICAgICAgIG9uRmlsbFJlcXVlc3Q6IGZ1bmN0aW9uKGJhY2t3YXJkczogYm9vbGVhbikgeyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgfSxcbiAgICAgICAgb25VbmZpbGxSZXF1ZXN0OiBmdW5jdGlvbihiYWNrd2FyZHM6IGJvb2xlYW4sIHNjcm9sbFRva2VuOiBzdHJpbmcpIHt9LFxuICAgICAgICBvblNjcm9sbDogZnVuY3Rpb24oKSB7fSxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nRmlsbFJlcXVlc3RzOiBSZWNvcmQ8XCJiXCIgfCBcImZcIiwgYm9vbGVhbj4gPSB7XG4gICAgICAgIGI6IG51bGwsXG4gICAgICAgIGY6IG51bGwsXG4gICAgfTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGl0ZW1saXN0ID0gY3JlYXRlUmVmPEhUTUxPTGlzdEVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSB1bm1vdW50ZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIHNjcm9sbFRpbWVvdXQ6IFRpbWVyO1xuICAgIC8vIEFyZSB3ZSBjdXJyZW50bHkgdHJ5aW5nIHRvIGJhY2tmaWxsP1xuICAgIHByaXZhdGUgaXNGaWxsaW5nOiBib29sZWFuO1xuICAgIC8vIElzIHRoZSBjdXJyZW50IGZpbGwgcmVxdWVzdCBjYXVzZWQgYnkgYSBwcm9wcyB1cGRhdGU/XG4gICAgcHJpdmF0ZSBpc0ZpbGxpbmdEdWVUb1Byb3BzVXBkYXRlID0gZmFsc2U7XG4gICAgLy8gRGlkIGFub3RoZXIgcmVxdWVzdCB0byBjaGVjayB0aGUgZmlsbCBzdGF0ZSBhcnJpdmUgd2hpbGUgd2Ugd2VyZSB0cnlpbmcgdG8gYmFja2ZpbGw/XG4gICAgcHJpdmF0ZSBmaWxsUmVxdWVzdFdoaWxlUnVubmluZzogYm9vbGVhbjtcbiAgICAvLyBJcyB0aGF0IG5leHQgZmlsbCByZXF1ZXN0IHNjaGVkdWxlZCBiZWNhdXNlIG9mIGEgcHJvcHMgdXBkYXRlP1xuICAgIHByaXZhdGUgcGVuZGluZ0ZpbGxEdWVUb1Byb3BzVXBkYXRlOiBib29sZWFuO1xuICAgIHByaXZhdGUgc2Nyb2xsU3RhdGU6IElTY3JvbGxTdGF0ZTtcbiAgICBwcml2YXRlIHByZXZlbnRTaHJpbmtpbmdTdGF0ZTogSVByZXZlbnRTaHJpbmtpbmdTdGF0ZTtcbiAgICBwcml2YXRlIHVuZmlsbERlYm91bmNlcjogbnVtYmVyO1xuICAgIHByaXZhdGUgYm90dG9tR3Jvd3RoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBtaW5MaXN0SGVpZ2h0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBoZWlnaHRVcGRhdGVJblByb2dyZXNzOiBib29sZWFuO1xuICAgIHByaXZhdGUgZGl2U2Nyb2xsOiBIVE1MRGl2RWxlbWVudDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyPy5vbihcIm1pZGRsZVBhbmVsUmVzaXplZE5vaXN5XCIsIHRoaXMub25SZXNpemUpO1xuXG4gICAgICAgIHRoaXMucmVzZXRTY3JvbGxTdGF0ZSgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmNoZWNrU2Nyb2xsKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAvLyBhZnRlciBhZGRpbmcgZXZlbnQgdGlsZXMsIHdlIG1heSBuZWVkIHRvIHR3ZWFrIHRoZSBzY3JvbGwgKGVpdGhlciB0b1xuICAgICAgICAvLyBrZWVwIGF0IHRoZSBib3R0b20gb2YgdGhlIHRpbWVsaW5lLCBvciB0byBtYWludGFpbiB0aGUgdmlldyBhZnRlclxuICAgICAgICAvLyBhZGRpbmcgZXZlbnRzIHRvIHRoZSB0b3ApLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGlzIHdpbGwgYWxzbyByZS1jaGVjayB0aGUgZmlsbCBzdGF0ZSwgaW4gY2FzZSB0aGUgcGFnaW5hdGUgd2FzIGluYWRlcXVhdGVcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbCh0cnVlKTtcbiAgICAgICAgdGhpcy51cGRhdGVQcmV2ZW50U2hyaW5raW5nKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIC8vIHNldCBhIGJvb2xlYW4gdG8gc2F5IHdlJ3ZlIGJlZW4gdW5tb3VudGVkLCB3aGljaCBhbnkgcGVuZGluZ1xuICAgICAgICAvLyBwcm9taXNlcyBjYW4gdXNlIHRvIHRocm93IGF3YXkgdGhlaXIgcmVzdWx0cy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gKFdlIGNvdWxkIHVzZSBpc01vdW50ZWQoKSwgYnV0IGZhY2Vib29rIGhhdmUgZGVwcmVjYXRlZCB0aGF0LilcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXI/LnJlbW92ZUxpc3RlbmVyKFwibWlkZGxlUGFuZWxSZXNpemVkTm9pc3lcIiwgdGhpcy5vblJlc2l6ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNjcm9sbCA9IGV2ID0+IHtcbiAgICAgICAgLy8gc2tpcCBzY3JvbGwgZXZlbnRzIGNhdXNlZCBieSByZXNpemluZ1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZXNpemVOb3RpZmllciAmJiB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLmlzUmVzaXppbmcpIHJldHVybjtcbiAgICAgICAgZGVidWdsb2coXCJvblNjcm9sbFwiLCB0aGlzLmdldFNjcm9sbE5vZGUoKS5zY3JvbGxUb3ApO1xuICAgICAgICB0aGlzLnNjcm9sbFRpbWVvdXQucmVzdGFydCgpO1xuICAgICAgICB0aGlzLnNhdmVTY3JvbGxTdGF0ZSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblNjcm9sbChldik7XG4gICAgICAgIHRoaXMuY2hlY2tGaWxsU3RhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgZGVidWdsb2coXCJvblJlc2l6ZVwiKTtcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbCgpO1xuICAgICAgICAvLyB1cGRhdGUgcHJldmVudFNocmlua2luZ1N0YXRlIGlmIHByZXNlbnRcbiAgICAgICAgaWYgKHRoaXMucHJldmVudFNocmlua2luZ1N0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBhZnRlciBhbiB1cGRhdGUgdG8gdGhlIGNvbnRlbnRzIG9mIHRoZSBwYW5lbCwgY2hlY2sgdGhhdCB0aGUgc2Nyb2xsIGlzXG4gICAgLy8gd2hlcmUgaXQgb3VnaHQgdG8gYmUsIGFuZCBzZXQgb2ZmIHBhZ2luYXRpb24gcmVxdWVzdHMgaWYgbmVjZXNzYXJ5LlxuICAgIHB1YmxpYyBjaGVja1Njcm9sbCA9IChpc0Zyb21Qcm9wc1VwZGF0ZSA9IGZhbHNlKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzdG9yZVNhdmVkU2Nyb2xsU3RhdGUoKTtcbiAgICAgICAgdGhpcy5jaGVja0ZpbGxTdGF0ZSgwLCBpc0Zyb21Qcm9wc1VwZGF0ZSk7XG4gICAgfTtcblxuICAgIC8vIHJldHVybiB0cnVlIGlmIHRoZSBjb250ZW50IGlzIGZ1bGx5IHNjcm9sbGVkIGRvd24gcmlnaHQgbm93OyBlbHNlIGZhbHNlLlxuICAgIC8vXG4gICAgLy8gbm90ZSB0aGF0IHRoaXMgaXMgaW5kZXBlbmRlbnQgb2YgdGhlICdzdHVja0F0Qm90dG9tJyBzdGF0ZSAtIGl0IGlzIHNpbXBseVxuICAgIC8vIGFib3V0IHdoZXRoZXIgdGhlIGNvbnRlbnQgaXMgc2Nyb2xsZWQgZG93biByaWdodCBub3csIGlycmVzcGVjdGl2ZSBvZlxuICAgIC8vIHdoZXRoZXIgaXQgd2lsbCBzdGF5IHRoYXQgd2F5IHdoZW4gdGhlIGNoaWxkcmVuIHVwZGF0ZS5cbiAgICBwdWJsaWMgaXNBdEJvdHRvbSA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc24gPSB0aGlzLmdldFNjcm9sbE5vZGUoKTtcbiAgICAgICAgLy8gZnJhY3Rpb25hbCB2YWx1ZXMgKGJvdGggdG9vIGJpZyBhbmQgdG9vIHNtYWxsKVxuICAgICAgICAvLyBmb3Igc2Nyb2xsVG9wIGhhcHBlbiBvbiBjZXJ0YWluIGJyb3dzZXJzL3BsYXRmb3Jtc1xuICAgICAgICAvLyB3aGVuIHNjcm9sbGVkIGFsbCB0aGUgd2F5IGRvd24uIEUuZy4gQ2hyb21lIDcyIG9uIGRlYmlhbi5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgdGhlcmVmb3JlIGxlYXZlIGEgYml0IG9mIHdpZ2dsZS1yb29tIGFuZCBhc3N1bWUgd2UncmUgYXQgdGhlXG4gICAgICAgIC8vIGJvdHRvbSBpZiB0aGUgdW5zY3JvbGxlZCBhcmVhIGlzIGxlc3MgdGhhbiBvbmUgcGl4ZWwgaGlnaC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gbm9uLXN0YW5kYXJkIERQSSBzZXR0aW5ncyBhbHNvIHNlZW0gdG8gaGF2ZSBlZmZlY3QgaGVyZSBhbmQgY2FuXG4gICAgICAgIC8vIGFjdHVhbGx5IGxlYWQgdG8gc2Nyb2xsVG9wK2NsaWVudEhlaWdodCBiZWluZyAqbGFyZ2VyKiB0aGFuXG4gICAgICAgIC8vIHNjcm9sbEhlaWdodC4gKG9ic2VydmVkIGluIGVsZW1lbnQtZGVza3RvcCBvbiBVYnVudHUgMjAuMDQpXG4gICAgICAgIC8vXG4gICAgICAgIHJldHVybiBzbi5zY3JvbGxIZWlnaHQgLSAoc24uc2Nyb2xsVG9wICsgc24uY2xpZW50SGVpZ2h0KSA8PSAxO1xuICAgIH07XG5cbiAgICAvLyByZXR1cm5zIHRoZSB2ZXJ0aWNhbCBoZWlnaHQgaW4gdGhlIGdpdmVuIGRpcmVjdGlvbiB0aGF0IGNhbiBiZSByZW1vdmVkIGZyb21cbiAgICAvLyB0aGUgY29udGVudCBib3ggKHdoaWNoIGhhcyBhIGhlaWdodCBvZiBzY3JvbGxIZWlnaHQsIHNlZSBjaGVja0ZpbGxTdGF0ZSkgd2l0aG91dFxuICAgIC8vIHBhZ2luYXRpb24gb2NjdXJpbmcuXG4gICAgLy9cbiAgICAvLyBwYWRkaW5nKiA9IFVOUEFHSU5BVElPTl9QQURESU5HXG4gICAgLy9cbiAgICAvLyAjIyMgUmVnaW9uIGRldGVybWluZWQgYXMgZXhjZXNzLlxuICAgIC8vXG4gICAgLy8gICAuLS0tLS0tLS0tLiAgICAgICAgICAgICAgICAgICAgICAgIC0gICAgICAgICAgICAgIC1cbiAgICAvLyAgIHwjIyMjIyMjIyN8ICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgfFxuICAgIC8vICAgfCMjIyMjIyMjI3wgICAtICAgICAgICAgICAgICAgICAgICB8ICBzY3JvbGxUb3AgICB8XG4gICAgLy8gICB8ICAgICAgICAgfCAgIHwgcGFkZGluZyogICAgICAgICAgIHwgICAgICAgICAgICAgIHxcbiAgICAvLyAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgfFxuICAgIC8vIC4tKy0tLS0tLS0tLSstLiAtICAtICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gICAgLy8gOiB8ICAgICAgICAgfCA6ICAgIHwgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgIHxcbiAgICAvLyA6IHwgICAgICAgICB8IDogICAgfCAgY2xpZW50SGVpZ2h0ICAgfCAgICAgICAgICAgICAgfFxuICAgIC8vIDogfCAgICAgICAgIHwgOiAgICB8ICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gICAgLy8gLi0rLS0tLS0tLS0tKy0uICAgIC0gICAgICAgICAgICAgICAgIC0gICAgICAgICAgICAgIHxcbiAgICAvLyB8IHwgICAgICAgICB8IHwgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vIHwgfCAgICAgICAgIHwgfCAgICB8ICBjbGllbnRIZWlnaHQgICAgICAgICAgICAgICAgICB8IHNjcm9sbEhlaWdodFxuICAgIC8vIHwgfCAgICAgICAgIHwgfCAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gYC0rLS0tLS0tLS0tKy0nICAgIC0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyA6IHwgICAgICAgICB8IDogICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vIDogfCAgICAgICAgIHwgOiAgICB8ICBjbGllbnRIZWlnaHQgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gOiB8ICAgICAgICAgfCA6ICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyBgLSstLS0tLS0tLS0rLScgLSAgLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vICAgfCAgICAgICAgIHwgICB8IHBhZGRpbmcqICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyAgIHwjIyMjIyMjIyN8ICAgLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vICAgfCMjIyMjIyMjI3wgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gICBgLS0tLS0tLS0tJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1cbiAgICBwcml2YXRlIGdldEV4Y2Vzc0hlaWdodChiYWNrd2FyZHM6IGJvb2xlYW4pOiBudW1iZXIge1xuICAgICAgICBjb25zdCBzbiA9IHRoaXMuZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICBjb25zdCBjb250ZW50SGVpZ2h0ID0gdGhpcy5nZXRNZXNzYWdlc0hlaWdodCgpO1xuICAgICAgICBjb25zdCBsaXN0SGVpZ2h0ID0gdGhpcy5nZXRMaXN0SGVpZ2h0KCk7XG4gICAgICAgIGNvbnN0IGNsaXBwZWRIZWlnaHQgPSBjb250ZW50SGVpZ2h0IC0gbGlzdEhlaWdodDtcbiAgICAgICAgY29uc3QgdW5jbGlwcGVkU2Nyb2xsVG9wID0gc24uc2Nyb2xsVG9wICsgY2xpcHBlZEhlaWdodDtcblxuICAgICAgICBpZiAoYmFja3dhcmRzKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5jbGlwcGVkU2Nyb2xsVG9wIC0gc24uY2xpZW50SGVpZ2h0IC0gVU5QQUdJTkFUSU9OX1BBRERJTkc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGVudEhlaWdodCAtICh1bmNsaXBwZWRTY3JvbGxUb3AgKyAyKnNuLmNsaWVudEhlaWdodCkgLSBVTlBBR0lOQVRJT05fUEFERElORztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoZWNrIHRoZSBzY3JvbGwgc3RhdGUgYW5kIHNlbmQgb3V0IGJhY2tmaWxsIHJlcXVlc3RzIGlmIG5lY2Vzc2FyeS5cbiAgICBwdWJsaWMgY2hlY2tGaWxsU3RhdGUgPSBhc3luYyAoZGVwdGggPSAwLCBpc0Zyb21Qcm9wc1VwZGF0ZSA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNGaXJzdENhbGwgPSBkZXB0aCA9PT0gMDtcbiAgICAgICAgY29uc3Qgc24gPSB0aGlzLmdldFNjcm9sbE5vZGUoKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBsZXNzIHRoYW4gYSBzY3JlZW5mdWwgb2YgbWVzc2FnZXMgYWJvdmUgb3IgYmVsb3cgdGhlXG4gICAgICAgIC8vIHZpZXdwb3J0LCB0cnkgdG8gZ2V0IHNvbWUgbW9yZSBtZXNzYWdlcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gc2Nyb2xsVG9wIGlzIHRoZSBudW1iZXIgb2YgcGl4ZWxzIGJldHdlZW4gdGhlIHRvcCBvZiB0aGUgY29udGVudCBhbmRcbiAgICAgICAgLy8gICAgIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBzY3JvbGxIZWlnaHQgaXMgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGUgY29udGVudC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gY2xpZW50SGVpZ2h0IGlzIHRoZSBoZWlnaHQgb2YgdGhlIHZpZXdwb3J0IChleGNsdWRpbmcgYm9yZGVycyxcbiAgICAgICAgLy8gbWFyZ2lucywgYW5kIHNjcm9sbGJhcnMpLlxuICAgICAgICAvL1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIC4tLS0tLS0tLS0uICAgICAgICAgIC0gICAgICAgICAgICAgICAgIC1cbiAgICAgICAgLy8gICB8ICAgICAgICAgfCAgICAgICAgICB8ICBzY3JvbGxUb3AgICAgICB8XG4gICAgICAgIC8vIC4tKy0tLS0tLS0tLSstLiAgICAtICAgLSAgICAgICAgICAgICAgICAgfFxuICAgICAgICAvLyB8IHwgICAgICAgICB8IHwgICAgfCAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgICAgLy8gfCB8ICAgICAgICAgfCB8ICAgIHwgIGNsaWVudEhlaWdodCAgICAgICB8IHNjcm9sbEhlaWdodFxuICAgICAgICAvLyB8IHwgICAgICAgICB8IHwgICAgfCAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgICAgLy8gYC0rLS0tLS0tLS0tKy0nICAgIC0gICAgICAgICAgICAgICAgICAgICB8XG4gICAgICAgIC8vICAgfCAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgICAvLyAgIHwgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgICAgLy8gICBgLS0tLS0tLS0tJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAtXG4gICAgICAgIC8vXG5cbiAgICAgICAgLy8gYXMgZmlsbGluZyBpcyBhc3luYyBhbmQgcmVjdXJzaXZlLFxuICAgICAgICAvLyBkb24ndCBhbGxvdyBtb3JlIHRoYW4gMSBjaGFpbiBvZiBjYWxscyBjb25jdXJyZW50bHlcbiAgICAgICAgLy8gZG8gbWFrZSBhIG5vdGUgd2hlbiBhIG5ldyByZXF1ZXN0IGNvbWVzIGluIHdoaWxlIGFscmVhZHkgcnVubmluZyBvbmUsXG4gICAgICAgIC8vIHNvIHdlIGNhbiB0cmlnZ2VyIGEgbmV3IGNoYWluIG9mIGNhbGxzIG9uY2UgZG9uZS5cbiAgICAgICAgLy8gSG93ZXZlciwgd2UgbWFrZSBhbiBleGNlcHRpb24gZm9yIHdoZW4gd2UncmUgYWxyZWFkeSBmaWxsaW5nIGR1ZSB0byBhXG4gICAgICAgIC8vIHByb3BzIChvciBjaGlsZHJlbikgdXBkYXRlLCBiZWNhdXNlIHZlcnkgb2Z0ZW4gdGhlIGNoaWxkcmVuIGluY2x1ZGVcbiAgICAgICAgLy8gc3Bpbm5lcnMgdG8gc2F5IHdoZXRoZXIgd2UncmUgcGFnaW5hdGluZyBvciBub3QsIHNvIHRoaXMgd291bGQgY2F1c2VcbiAgICAgICAgLy8gaW5maW5pdGUgcGFnaW5hdGluZy5cbiAgICAgICAgaWYgKGlzRmlyc3RDYWxsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0ZpbGxpbmcgJiYgIXRoaXMuaXNGaWxsaW5nRHVlVG9Qcm9wc1VwZGF0ZSkge1xuICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwiaXNGaWxsaW5nOiBub3QgZW50ZXJpbmcgd2hpbGUgcmVxdWVzdCBpcyBvbmdvaW5nLCBtYXJraW5nIGZvciBhIHN1YnNlcXVlbnQgcmVxdWVzdFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGxSZXF1ZXN0V2hpbGVSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmdGaWxsRHVlVG9Qcm9wc1VwZGF0ZSA9IGlzRnJvbVByb3BzVXBkYXRlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlYnVnbG9nKFwiaXNGaWxsaW5nOiBzZXR0aW5nXCIpO1xuICAgICAgICAgICAgdGhpcy5pc0ZpbGxpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc0ZpbGxpbmdEdWVUb1Byb3BzVXBkYXRlID0gaXNGcm9tUHJvcHNVcGRhdGU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtbGlzdCA9IHRoaXMuaXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgY29uc3QgZmlyc3RUaWxlID0gaXRlbWxpc3QgJiYgaXRlbWxpc3QuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUb3AgPSBmaXJzdFRpbGUgJiYgZmlyc3RUaWxlLm9mZnNldFRvcDtcbiAgICAgICAgY29uc3QgZmlsbFByb21pc2VzID0gW107XG5cbiAgICAgICAgLy8gaWYgc2Nyb2xsVG9wIGdldHMgdG8gMSBzY3JlZW4gZnJvbSB0aGUgdG9wIG9mIHRoZSBmaXJzdCB0aWxlLFxuICAgICAgICAvLyB0cnkgYmFja3dhcmQgZmlsbGluZ1xuICAgICAgICBpZiAoIWZpcnN0VGlsZSB8fCAoc24uc2Nyb2xsVG9wIC0gY29udGVudFRvcCkgPCBzbi5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gYmFjay1maWxsXG4gICAgICAgICAgICBmaWxsUHJvbWlzZXMucHVzaCh0aGlzLm1heWJlRmlsbChkZXB0aCwgdHJ1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHNjcm9sbFRvcCBnZXRzIHRvIDIgc2NyZWVucyBmcm9tIHRoZSBlbmQgKHNvIDEgc2NyZWVuIGJlbG93IHZpZXdwb3J0KSxcbiAgICAgICAgLy8gdHJ5IGZvcndhcmQgZmlsbGluZ1xuICAgICAgICBpZiAoKHNuLnNjcm9sbEhlaWdodCAtIHNuLnNjcm9sbFRvcCkgPCBzbi5jbGllbnRIZWlnaHQgKiAyKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGZvcndhcmQtZmlsbFxuICAgICAgICAgICAgZmlsbFByb21pc2VzLnB1c2godGhpcy5tYXliZUZpbGwoZGVwdGgsIGZhbHNlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsbFByb21pc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxsUHJvbWlzZXMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRmlyc3RDYWxsKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcImlzRmlsbGluZzogY2xlYXJpbmdcIik7XG4gICAgICAgICAgICB0aGlzLmlzRmlsbGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc0ZpbGxpbmdEdWVUb1Byb3BzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5maWxsUmVxdWVzdFdoaWxlUnVubmluZykge1xuICAgICAgICAgICAgY29uc3QgcmVmaWxsRHVlVG9Qcm9wc1VwZGF0ZSA9IHRoaXMucGVuZGluZ0ZpbGxEdWVUb1Byb3BzVXBkYXRlO1xuICAgICAgICAgICAgdGhpcy5maWxsUmVxdWVzdFdoaWxlUnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nRmlsbER1ZVRvUHJvcHNVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tGaWxsU3RhdGUoMCwgcmVmaWxsRHVlVG9Qcm9wc1VwZGF0ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gY2hlY2sgaWYgdW5maWxsaW5nIGlzIHBvc3NpYmxlIGFuZCBzZW5kIGFuIHVuZmlsbCByZXF1ZXN0IGlmIG5lY2Vzc2FyeVxuICAgIHByaXZhdGUgY2hlY2tVbmZpbGxTdGF0ZShiYWNrd2FyZHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgbGV0IGV4Y2Vzc0hlaWdodCA9IHRoaXMuZ2V0RXhjZXNzSGVpZ2h0KGJhY2t3YXJkcyk7XG4gICAgICAgIGlmIChleGNlc3NIZWlnaHQgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3JpZ0V4Y2Vzc0hlaWdodCA9IGV4Y2Vzc0hlaWdodDtcblxuICAgICAgICBjb25zdCB0aWxlcyA9IHRoaXMuaXRlbWxpc3QuY3VycmVudC5jaGlsZHJlbjtcblxuICAgICAgICAvLyBUaGUgc2Nyb2xsIHRva2VuIG9mIHRoZSBmaXJzdC9sYXN0IHRpbGUgdG8gYmUgdW5wYWdpbmF0ZWRcbiAgICAgICAgbGV0IG1hcmtlclNjcm9sbFRva2VuID0gbnVsbDtcblxuICAgICAgICAvLyBTdWJ0cmFjdCBoZWlnaHRzIG9mIHRpbGVzIHRvIHNpbXVsYXRlIHRoZSB0aWxlcyBiZWluZyB1bnBhZ2luYXRlZCB1bnRpbCB0aGVcbiAgICAgICAgLy8gZXhjZXNzIGhlaWdodCBpcyBsZXNzIHRoYW4gdGhlIGhlaWdodCBvZiB0aGUgbmV4dCB0aWxlIHRvIHN1YnRyYWN0LiBUaGlzXG4gICAgICAgIC8vIHByZXZlbnRzIGV4Y2Vzc0hlaWdodCBiZWNvbWluZyBuZWdhdGl2ZSwgd2hpY2ggY291bGQgbGVhZCB0byBmdXR1cmVcbiAgICAgICAgLy8gcGFnaW5hdGlvbi5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSWYgYmFja3dhcmRzIGlzIHRydWUsIHdlIHVucGFnaW5hdGUgKHJlbW92ZSkgdGlsZXMgZnJvbSB0aGUgYmFjayAodG9wKS5cbiAgICAgICAgbGV0IHRpbGU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRpbGUgPSB0aWxlc1tiYWNrd2FyZHMgPyBpIDogdGlsZXMubGVuZ3RoIC0gMSAtIGldO1xuICAgICAgICAgICAgLy8gU3VidHJhY3QgaGVpZ2h0IG9mIHRpbGUgYXMgaWYgaXQgd2VyZSB1bnBhZ2luYXRlZFxuICAgICAgICAgICAgZXhjZXNzSGVpZ2h0IC09IHRpbGUuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgLy9JZiByZW1vdmluZyB0aGUgdGlsZSB3b3VsZCBsZWFkIHRvIGZ1dHVyZSBwYWdpbmF0aW9uLCBicmVhayBiZWZvcmUgc2V0dGluZyBzY3JvbGwgdG9rZW5cbiAgICAgICAgICAgIGlmICh0aWxlLmNsaWVudEhlaWdodCA+IGV4Y2Vzc0hlaWdodCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhlIHRpbGUgbWF5IG5vdCBoYXZlIGEgc2Nyb2xsIHRva2VuLCBzbyBndWFyZCBpdFxuICAgICAgICAgICAgaWYgKHRpbGUuZGF0YXNldC5zY3JvbGxUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXJTY3JvbGxUb2tlbiA9IHRpbGUuZGF0YXNldC5zY3JvbGxUb2tlbnMuc3BsaXQoJywnKVswXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXJrZXJTY3JvbGxUb2tlbikge1xuICAgICAgICAgICAgLy8gVXNlIGEgZGVib3VuY2VyIHRvIHByZXZlbnQgbXVsdGlwbGUgdW5maWxsIGNhbGxzIGluIHF1aWNrIHN1Y2Nlc3Npb25cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgdG8gbWFrZSB0aGUgdW5maWxsaW5nIHByb2Nlc3MgbGVzcyBhZ2dyZXNzaXZlXG4gICAgICAgICAgICBpZiAodGhpcy51bmZpbGxEZWJvdW5jZXIpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy51bmZpbGxEZWJvdW5jZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51bmZpbGxEZWJvdW5jZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuZmlsbERlYm91bmNlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgZGVidWdsb2coXCJ1bmZpbGxpbmcgbm93XCIsIGJhY2t3YXJkcywgb3JpZ0V4Y2Vzc0hlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblVuZmlsbFJlcXVlc3QoYmFja3dhcmRzLCBtYXJrZXJTY3JvbGxUb2tlbik7XG4gICAgICAgICAgICB9LCBVTkZJTExfUkVRVUVTVF9ERUJPVU5DRV9NUyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjaGVjayBpZiB0aGVyZSBpcyBhbHJlYWR5IGEgcGVuZGluZyBmaWxsIHJlcXVlc3QuIElmIG5vdCwgc2V0IG9uZSBvZmYuXG4gICAgcHJpdmF0ZSBtYXliZUZpbGwoZGVwdGg6IG51bWJlciwgYmFja3dhcmRzOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGRpciA9IGJhY2t3YXJkcyA/ICdiJyA6ICdmJztcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ0ZpbGxSZXF1ZXN0c1tkaXJdKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIkFscmVhZHkgYSBcIitkaXIrXCIgZmlsbCBpbiBwcm9ncmVzcyAtIG5vdCBzdGFydGluZyBhbm90aGVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVidWdsb2coXCJzdGFydGluZyBcIitkaXIrXCIgZmlsbFwiKTtcblxuICAgICAgICAvLyBvbkZpbGxSZXF1ZXN0IGNhbiBlbmQgdXAgY2FsbGluZyB1cyByZWN1cnNpdmVseSAodmlhIG9uU2Nyb2xsXG4gICAgICAgIC8vIGV2ZW50cykgc28gbWFrZSBzdXJlIHdlIHNldCB0aGlzIGJlZm9yZSBmaXJpbmcgb2ZmIHRoZSBjYWxsLlxuICAgICAgICB0aGlzLnBlbmRpbmdGaWxsUmVxdWVzdHNbZGlyXSA9IHRydWU7XG5cbiAgICAgICAgLy8gd2FpdCAxbXMgYmVmb3JlIHBhZ2luYXRpbmcsIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgICAgIC8vIHRoaXMgd2lsbCBibG9jayB0aGUgc2Nyb2xsIGV2ZW50IGhhbmRsZXIgZm9yICs3MDBtc1xuICAgICAgICAvLyBpZiBtZXNzYWdlcyBhcmUgYWxyZWFkeSBjYWNoZWQgaW4gbWVtb3J5LFxuICAgICAgICAvLyBUaGlzIHdvdWxkIGNhdXNlIGp1bXBpbmcgdG8gaGFwcGVuIG9uIENocm9tZS9tYWNPUy5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkZpbGxSZXF1ZXN0KGJhY2t3YXJkcyk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nRmlsbFJlcXVlc3RzW2Rpcl0gPSBmYWxzZTtcbiAgICAgICAgfSkudGhlbigoaGFzTW9yZVJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVucGFnaW5hdGUgb25jZSBmaWxsaW5nIGlzIGNvbXBsZXRlXG4gICAgICAgICAgICB0aGlzLmNoZWNrVW5maWxsU3RhdGUoIWJhY2t3YXJkcyk7XG5cbiAgICAgICAgICAgIGRlYnVnbG9nKFwiXCIrZGlyK1wiIGZpbGwgY29tcGxldGU7IGhhc01vcmVSZXN1bHRzOlwiK2hhc01vcmVSZXN1bHRzKTtcbiAgICAgICAgICAgIGlmIChoYXNNb3JlUmVzdWx0cykge1xuICAgICAgICAgICAgICAgIC8vIGZ1cnRoZXIgcGFnaW5hdGlvbiByZXF1ZXN0cyBoYXZlIGJlZW4gZGlzYWJsZWQgdW50aWwgbm93LCBzb1xuICAgICAgICAgICAgICAgIC8vIGl0J3MgdGltZSB0byBjaGVjayB0aGUgZmlsbCBzdGF0ZSBhZ2FpbiBpbiBjYXNlIHRoZSBwYWdpbmF0aW9uXG4gICAgICAgICAgICAgICAgLy8gd2FzIGluc3VmZmljaWVudC5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0ZpbGxTdGF0ZShkZXB0aCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiBnZXQgdGhlIGN1cnJlbnQgc2Nyb2xsIHN0YXRlLiBUaGlzIHJldHVybnMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZ1xuICAgICAqIHByb3BlcnRpZXM6XG4gICAgICpcbiAgICAgKiBib29sZWFuIHN0dWNrQXRCb3R0b206IHRydWUgaWYgd2UgYXJlIHRyYWNraW5nIHRoZSBib3R0b20gb2YgdGhlXG4gICAgICogICBzY3JvbGwuIGZhbHNlIGlmIHdlIGFyZSB0cmFja2luZyBhIHBhcnRpY3VsYXIgY2hpbGQuXG4gICAgICpcbiAgICAgKiBzdHJpbmcgdHJhY2tlZFNjcm9sbFRva2VuOiB1bmRlZmluZWQgaWYgc3R1Y2tBdEJvdHRvbSBpcyB0cnVlOyBpZiBpdCBpc1xuICAgICAqICAgZmFsc2UsIHRoZSBmaXJzdCB0b2tlbiBpbiBkYXRhLXNjcm9sbC10b2tlbnMgb2YgdGhlIGNoaWxkIHdoaWNoIHdlIGFyZVxuICAgICAqICAgdHJhY2tpbmcuXG4gICAgICpcbiAgICAgKiBudW1iZXIgYm90dG9tT2Zmc2V0OiB1bmRlZmluZWQgaWYgc3R1Y2tBdEJvdHRvbSBpcyB0cnVlOyBpZiBpdCBpcyBmYWxzZSxcbiAgICAgKiAgIHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoZSBib3R0b20gb2YgdGhlIHRyYWNrZWQgY2hpbGQgaXMgYWJvdmUgdGhlXG4gICAgICogICBib3R0b20gb2YgdGhlIHNjcm9sbCBwYW5lbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2Nyb2xsU3RhdGUgPSAoKTogSVNjcm9sbFN0YXRlID0+IHRoaXMuc2Nyb2xsU3RhdGU7XG5cbiAgICAvKiByZXNldCB0aGUgc2F2ZWQgc2Nyb2xsIHN0YXRlLlxuICAgICAqXG4gICAgICogVGhpcyBpcyB1c2VmdWwgaWYgdGhlIGxpc3QgaXMgYmVpbmcgcmVwbGFjZWQsIGFuZCB5b3UgZG9uJ3Qgd2FudCB0b1xuICAgICAqIHByZXNlcnZlIHNjcm9sbCBldmVuIGlmIG5ldyBjaGlsZHJlbiBoYXBwZW4gdG8gaGF2ZSB0aGUgc2FtZSBzY3JvbGxcbiAgICAgKiB0b2tlbnMgYXMgb2xkIG9uZXMuXG4gICAgICpcbiAgICAgKiBUaGlzIHdpbGwgY2F1c2UgdGhlIHZpZXdwb3J0IHRvIGJlIHNjcm9sbGVkIGRvd24gdG8gdGhlIGJvdHRvbSBvbiB0aGVcbiAgICAgKiBuZXh0IHVwZGF0ZSBvZiB0aGUgY2hpbGQgbGlzdC4gVGhpcyBpcyBkaWZmZXJlbnQgdG8gc2Nyb2xsVG9Cb3R0b20oKSxcbiAgICAgKiB3aGljaCB3b3VsZCBzYXZlIHRoZSBjdXJyZW50IGJvdHRvbS1tb3N0IGNoaWxkIGFzIHRoZSBhY3RpdmUgb25lIChzbyBpc1xuICAgICAqIG5vIHVzZSBpZiBubyBjaGlsZHJlbiBleGlzdCB5ZXQsIG9yIGlmIHlvdSBhcmUgYWJvdXQgdG8gcmVwbGFjZSB0aGVcbiAgICAgKiBjaGlsZCBsaXN0LilcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVzZXRTY3JvbGxTdGF0ZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zY3JvbGxTdGF0ZSA9IHtcbiAgICAgICAgICAgIHN0dWNrQXRCb3R0b206IHRoaXMucHJvcHMuc3RhcnRBdEJvdHRvbSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5ib3R0b21Hcm93dGggPSAwO1xuICAgICAgICB0aGlzLm1pbkxpc3RIZWlnaHQgPSAwO1xuICAgICAgICB0aGlzLnNjcm9sbFRpbWVvdXQgPSBuZXcgVGltZXIoMTAwKTtcbiAgICAgICAgdGhpcy5oZWlnaHRVcGRhdGVJblByb2dyZXNzID0gZmFsc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIGp1bXAgdG8gdGhlIHRvcCBvZiB0aGUgY29udGVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2Nyb2xsVG9Ub3AgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuZ2V0U2Nyb2xsTm9kZSgpLnNjcm9sbFRvcCA9IDA7XG4gICAgICAgIHRoaXMuc2F2ZVNjcm9sbFN0YXRlKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIGp1bXAgdG8gdGhlIGJvdHRvbSBvZiB0aGUgY29udGVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2Nyb2xsVG9Cb3R0b20gPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIHRoZSBlYXNpZXN0IHdheSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgc2Nyb2xsIHN0YXRlIGlzIGNvcnJlY3RseVxuICAgICAgICAvLyBzYXZlZCBpcyB0byBkbyB0aGUgc2Nyb2xsLCB0aGVuIHNhdmUgdGhlIHVwZGF0ZWQgc3RhdGUuIChDYWxjdWxhdGluZ1xuICAgICAgICAvLyBpdCBvdXJzZWx2ZXMgaXMgaGFyZCwgYW5kIHdlIGNhbid0IHJlbHkgb24gYW4gb25TY3JvbGwgY2FsbGJhY2tcbiAgICAgICAgLy8gaGFwcGVuaW5nLCBzaW5jZSB0aGVyZSBtYXkgYmUgbm8gdXNlci12aXNpYmxlIGNoYW5nZSBoZXJlKS5cbiAgICAgICAgY29uc3Qgc24gPSB0aGlzLmdldFNjcm9sbE5vZGUoKTtcbiAgICAgICAgc24uc2Nyb2xsVG9wID0gc24uc2Nyb2xsSGVpZ2h0O1xuICAgICAgICB0aGlzLnNhdmVTY3JvbGxTdGF0ZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQYWdlIHVwL2Rvd24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbXVsdDogLTEgdG8gcGFnZSB1cCwgKzEgdG8gcGFnZSBkb3duXG4gICAgICovXG4gICAgcHVibGljIHNjcm9sbFJlbGF0aXZlID0gKG11bHQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBzY3JvbGxOb2RlID0gdGhpcy5nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgIGNvbnN0IGRlbHRhID0gbXVsdCAqIHNjcm9sbE5vZGUuY2xpZW50SGVpZ2h0ICogMC45O1xuICAgICAgICBzY3JvbGxOb2RlLnNjcm9sbEJ5KDAsIGRlbHRhKTtcbiAgICAgICAgdGhpcy5zYXZlU2Nyb2xsU3RhdGUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2Nyb2xsIHVwL2Rvd24gaW4gcmVzcG9uc2UgdG8gYSBzY3JvbGwga2V5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2IHRoZSBrZXlib2FyZCBldmVudFxuICAgICAqL1xuICAgIHB1YmxpYyBoYW5kbGVTY3JvbGxLZXkgPSAoZXY6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbUFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldFJvb21BY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKHJvb21BY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5TY3JvbGxVcDpcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFJlbGF0aXZlKC0xKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5TY3JvbGxEb3duOlxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsUmVsYXRpdmUoMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uSnVtcFRvRmlyc3RNZXNzYWdlOlxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9Ub3AoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5KdW1wVG9MYXRlc3RNZXNzYWdlOlxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBTY3JvbGwgdGhlIHBhbmVsIHRvIGJyaW5nIHRoZSBET00gbm9kZSB3aXRoIHRoZSBzY3JvbGwgdG9rZW5cbiAgICAgKiBgc2Nyb2xsVG9rZW5gIGludG8gdmlldy5cbiAgICAgKlxuICAgICAqIG9mZnNldEJhc2UgZ2l2ZXMgdGhlIHJlZmVyZW5jZSBwb2ludCBmb3IgdGhlIHBpeGVsT2Zmc2V0LiAwIG1lYW5zIHRoZVxuICAgICAqIHRvcCBvZiB0aGUgY29udGFpbmVyLCAxIG1lYW5zIHRoZSBib3R0b20sIGFuZCBmcmFjdGlvbmFsIHZhbHVlcyBtZWFuXG4gICAgICogc29tZXdoZXJlIGluIHRoZSBtaWRkbGUuIElmIG9taXR0ZWQsIGl0IGRlZmF1bHRzIHRvIDAuXG4gICAgICpcbiAgICAgKiBwaXhlbE9mZnNldCBnaXZlcyB0aGUgbnVtYmVyIG9mIHBpeGVscyAqYWJvdmUqIHRoZSBvZmZzZXRCYXNlIHRoYXQgdGhlXG4gICAgICogbm9kZSAoc3BlY2lmaWNhbGx5LCB0aGUgYm90dG9tIG9mIGl0KSB3aWxsIGJlIHBvc2l0aW9uZWQuIElmIG9taXR0ZWQsIGl0XG4gICAgICogZGVmYXVsdHMgdG8gMC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2Nyb2xsVG9Ub2tlbiA9IChzY3JvbGxUb2tlbjogc3RyaW5nLCBwaXhlbE9mZnNldDogbnVtYmVyLCBvZmZzZXRCYXNlOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICAgICAgcGl4ZWxPZmZzZXQgPSBwaXhlbE9mZnNldCB8fCAwO1xuICAgICAgICBvZmZzZXRCYXNlID0gb2Zmc2V0QmFzZSB8fCAwO1xuXG4gICAgICAgIC8vIHNldCB0aGUgdHJhY2tlZFNjcm9sbFRva2VuIHNvIHdlIGNhbiBnZXQgdGhlIG5vZGUgdGhyb3VnaCBnZXRUcmFja2VkTm9kZVxuICAgICAgICB0aGlzLnNjcm9sbFN0YXRlID0ge1xuICAgICAgICAgICAgc3R1Y2tBdEJvdHRvbTogZmFsc2UsXG4gICAgICAgICAgICB0cmFja2VkU2Nyb2xsVG9rZW46IHNjcm9sbFRva2VuLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0cmFja2VkTm9kZSA9IHRoaXMuZ2V0VHJhY2tlZE5vZGUoKTtcbiAgICAgICAgY29uc3Qgc2Nyb2xsTm9kZSA9IHRoaXMuZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICBpZiAodHJhY2tlZE5vZGUpIHtcbiAgICAgICAgICAgIC8vIHNldCB0aGUgc2Nyb2xsVG9wIHRvIHRoZSBwb3NpdGlvbiB3ZSB3YW50LlxuICAgICAgICAgICAgLy8gbm90ZSB0aG91Z2gsIHRoYXQgdGhpcyBtaWdodCBub3Qgc3VjY2VlZCBpZiB0aGUgY29tYmluYXRpb24gb2Ygb2Zmc2V0QmFzZSBhbmQgcGl4ZWxPZmZzZXRcbiAgICAgICAgICAgIC8vIHdvdWxkIHBvc2l0aW9uIHRoZSB0cmFja2VkTm9kZSB0b3dhcmRzIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgICAgLy8gVGhpcyBiZWNhdXNlIHdoZW4gc2V0dGluZyB0aGUgc2Nyb2xsVG9wIG9ubHkgMTAgb3Igc28gZXZlbnRzIG1pZ2h0IGJlIGxvYWRlZCxcbiAgICAgICAgICAgIC8vIG5vdCBnaXZpbmcgZW5vdWdoIGNvbnRlbnQgYmVsb3cgdGhlIHRyYWNrZWROb2RlIHRvIHNjcm9sbCBkb3dud2FyZHNcbiAgICAgICAgICAgIC8vIGVub3VnaCBzbyBpdCBlbmRzIHVwIGluIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgICAgZGVidWdsb2coXCJzY3JvbGxUb2tlbjogc2V0dGluZyBzY3JvbGxUb3BcIiwgeyBvZmZzZXRCYXNlLCBwaXhlbE9mZnNldCwgb2Zmc2V0VG9wOiB0cmFja2VkTm9kZS5vZmZzZXRUb3AgfSk7XG4gICAgICAgICAgICBzY3JvbGxOb2RlLnNjcm9sbFRvcCA9ICh0cmFja2VkTm9kZS5vZmZzZXRUb3AgLSAoc2Nyb2xsTm9kZS5jbGllbnRIZWlnaHQgKiBvZmZzZXRCYXNlKSkgKyBwaXhlbE9mZnNldDtcbiAgICAgICAgICAgIHRoaXMuc2F2ZVNjcm9sbFN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzYXZlU2Nyb2xsU3RhdGUoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnN0aWNreUJvdHRvbSAmJiB0aGlzLmlzQXRCb3R0b20oKSkge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxTdGF0ZSA9IHsgc3R1Y2tBdEJvdHRvbTogdHJ1ZSB9O1xuICAgICAgICAgICAgZGVidWdsb2coXCJzYXZlZCBzdHVja0F0Qm90dG9tIHN0YXRlXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2Nyb2xsTm9kZSA9IHRoaXMuZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICBjb25zdCB2aWV3cG9ydEJvdHRvbSA9IHNjcm9sbE5vZGUuc2Nyb2xsSGVpZ2h0IC0gKHNjcm9sbE5vZGUuc2Nyb2xsVG9wICsgc2Nyb2xsTm9kZS5jbGllbnRIZWlnaHQpO1xuXG4gICAgICAgIGNvbnN0IGl0ZW1saXN0ID0gdGhpcy5pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IGl0ZW1saXN0LmNoaWxkcmVuO1xuICAgICAgICBsZXQgbm9kZSA9IG51bGw7XG5cbiAgICAgICAgLy8gVE9ETzogZG8gYSBiaW5hcnkgc2VhcmNoIGhlcmUsIGFzIGl0ZW1zIGFyZSBzb3J0ZWQgYnkgb2Zmc2V0VG9wXG4gICAgICAgIC8vIGxvb3AgYmFja3dhcmRzLCBmcm9tIGJvdHRvbS1tb3N0IG1lc3NhZ2UgKGFzIHRoYXQgaXMgdGhlIG1vc3QgY29tbW9uIGNhc2UpXG4gICAgICAgIGZvciAobGV0IGkgPSBtZXNzYWdlcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgaWYgKCEobWVzc2FnZXNbaV0gYXMgSFRNTEVsZW1lbnQpLmRhdGFzZXQuc2Nyb2xsVG9rZW5zKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlID0gbWVzc2FnZXNbaV07XG4gICAgICAgICAgICAvLyBicmVhayBhdCB0aGUgZmlyc3QgbWVzc2FnZSAoY29taW5nIGZyb20gdGhlIGJvdHRvbSlcbiAgICAgICAgICAgIC8vIHRoYXQgaGFzIGl0J3Mgb2Zmc2V0VG9wIGFib3ZlIHRoZSBib3R0b20gb2YgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgICAgaWYgKHRoaXMudG9wRnJvbUJvdHRvbShub2RlKSA+IHZpZXdwb3J0Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgLy8gVXNlIHRoaXMgbm9kZSBhcyB0aGUgc2Nyb2xsVG9rZW5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgZGVidWdsb2coXCJ1bmFibGUgdG8gc2F2ZSBzY3JvbGwgc3RhdGU6IGZvdW5kIG5vIGNoaWxkcmVuIGluIHRoZSB2aWV3cG9ydFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzY3JvbGxUb2tlbiA9IG5vZGUuZGF0YXNldC5zY3JvbGxUb2tlbnMuc3BsaXQoJywnKVswXTtcbiAgICAgICAgZGVidWdsb2coXCJzYXZpbmcgYW5jaG9yZWQgc2Nyb2xsIHN0YXRlIHRvIG1lc3NhZ2VcIiwgbm9kZS5pbm5lclRleHQsIHNjcm9sbFRva2VuKTtcbiAgICAgICAgY29uc3QgYm90dG9tT2Zmc2V0ID0gdGhpcy50b3BGcm9tQm90dG9tKG5vZGUpO1xuICAgICAgICB0aGlzLnNjcm9sbFN0YXRlID0ge1xuICAgICAgICAgICAgc3R1Y2tBdEJvdHRvbTogZmFsc2UsXG4gICAgICAgICAgICB0cmFja2VkTm9kZTogbm9kZSxcbiAgICAgICAgICAgIHRyYWNrZWRTY3JvbGxUb2tlbjogc2Nyb2xsVG9rZW4sXG4gICAgICAgICAgICBib3R0b21PZmZzZXQ6IGJvdHRvbU9mZnNldCxcbiAgICAgICAgICAgIHBpeGVsT2Zmc2V0OiBib3R0b21PZmZzZXQgLSB2aWV3cG9ydEJvdHRvbSwgLy9uZWVkZWQgZm9yIHJlc3RvcmluZyB0aGUgc2Nyb2xsIHBvc2l0aW9uIHdoZW4gY29taW5nIGJhY2sgdG8gdGhlIHJvb21cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlc3RvcmVTYXZlZFNjcm9sbFN0YXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzY3JvbGxTdGF0ZSA9IHRoaXMuc2Nyb2xsU3RhdGU7XG5cbiAgICAgICAgaWYgKHNjcm9sbFN0YXRlLnN0dWNrQXRCb3R0b20pIHtcbiAgICAgICAgICAgIGNvbnN0IHNuID0gdGhpcy5nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgICAgICBpZiAoc24uc2Nyb2xsVG9wICE9PSBzbi5zY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBzbi5zY3JvbGxUb3AgPSBzbi5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsU3RhdGUudHJhY2tlZFNjcm9sbFRva2VuKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtbGlzdCA9IHRoaXMuaXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgICAgIGNvbnN0IHRyYWNrZWROb2RlID0gdGhpcy5nZXRUcmFja2VkTm9kZSgpO1xuICAgICAgICAgICAgaWYgKHRyYWNrZWROb2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Qm90dG9tT2Zmc2V0ID0gdGhpcy50b3BGcm9tQm90dG9tKHRyYWNrZWROb2RlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBib3R0b21EaWZmID0gbmV3Qm90dG9tT2Zmc2V0IC0gc2Nyb2xsU3RhdGUuYm90dG9tT2Zmc2V0O1xuICAgICAgICAgICAgICAgIHRoaXMuYm90dG9tR3Jvd3RoICs9IGJvdHRvbURpZmY7XG4gICAgICAgICAgICAgICAgc2Nyb2xsU3RhdGUuYm90dG9tT2Zmc2V0ID0gbmV3Qm90dG9tT2Zmc2V0O1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IGAke3RoaXMuZ2V0TGlzdEhlaWdodCgpfXB4YDtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbWxpc3Quc3R5bGUuaGVpZ2h0ICE9PSBuZXdIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbWxpc3Quc3R5bGUuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWJ1Z2xvZyhcImJhbGFuY2luZyBoZWlnaHQgYmVjYXVzZSBtZXNzYWdlcyBiZWxvdyB2aWV3cG9ydCBncmV3IGJ5XCIsIGJvdHRvbURpZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5oZWlnaHRVcGRhdGVJblByb2dyZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmhlaWdodFVwZGF0ZUluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZUhlaWdodCgpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodFVwZGF0ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwibm90IHVwZGF0aW5nIGhlaWdodCBiZWNhdXNlIHJlcXVlc3QgYWxyZWFkeSBpbiBwcm9ncmVzc1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIG5lZWQgYSBiZXR0ZXIgbmFtZSB0aGF0IGFsc28gaW5kaWNhdGVzIHRoaXMgd2lsbCBjaGFuZ2Ugc2Nyb2xsVG9wPyBSZWJhbGFuY2UgaGVpZ2h0PyBSZXZlYWwgY29udGVudD9cbiAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZUhlaWdodCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8gd2FpdCB1bnRpbCB1c2VyIGhhcyBzdG9wcGVkIHNjcm9sbGluZ1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxUaW1lb3V0LmlzUnVubmluZygpKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInVwZGF0ZUhlaWdodCB3YWl0aW5nIGZvciBzY3JvbGxpbmcgdG8gZW5kIC4uLiBcIik7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNjcm9sbFRpbWVvdXQuZmluaXNoZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwidXBkYXRlSGVpZ2h0IGdldHRpbmcgc3RyYWlnaHQgdG8gYnVzaW5lc3MsIG5vIHNjcm9sbGluZyBnb2luZyBvbi5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBtaWdodCBoYXZlIHVubW91bnRlZCBzaW5jZSB0aGUgdGltZXIgZmluaXNoZWQsIHNvIGFib3J0IGlmIHNvLlxuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNuID0gdGhpcy5nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgIGNvbnN0IGl0ZW1saXN0ID0gdGhpcy5pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICBjb25zdCBjb250ZW50SGVpZ2h0ID0gdGhpcy5nZXRNZXNzYWdlc0hlaWdodCgpO1xuICAgICAgICAvLyBPbmx5IHJvdW5kIHRvIHRoZSBuZWFyZXN0IHBhZ2Ugd2hlbiB3ZSdyZSBiYXNpbmcgdGhlIGhlaWdodCBvZmYgdGhlIGNvbnRlbnQsIG5vdCBvZmYgdGhlIHNjcm9sbE5vZGUgaGVpZ2h0XG4gICAgICAgIC8vIG90aGVyd2lzZSBpdCdsbCBjYXVzZSB0b28gbXVjaCBvdmVyc2Nyb2xsIHdoaWNoIG1ha2VzIGl0IHBvc3NpYmxlIHRvIGVudGlyZWx5IHNjcm9sbCBjb250ZW50IG9mZi1zY3JlZW4uXG4gICAgICAgIGlmIChjb250ZW50SGVpZ2h0IDwgc24uY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLm1pbkxpc3RIZWlnaHQgPSBzbi5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1pbkxpc3RIZWlnaHQgPSBNYXRoLmNlaWwoY29udGVudEhlaWdodCAvIFBBR0VfU0laRSkgKiBQQUdFX1NJWkU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ib3R0b21Hcm93dGggPSAwO1xuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSBgJHt0aGlzLmdldExpc3RIZWlnaHQoKX1weGA7XG5cbiAgICAgICAgY29uc3Qgc2Nyb2xsU3RhdGUgPSB0aGlzLnNjcm9sbFN0YXRlO1xuICAgICAgICBpZiAoc2Nyb2xsU3RhdGUuc3R1Y2tBdEJvdHRvbSkge1xuICAgICAgICAgICAgaWYgKGl0ZW1saXN0LnN0eWxlLmhlaWdodCAhPT0gbmV3SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgaXRlbWxpc3Quc3R5bGUuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNuLnNjcm9sbFRvcCAhPT0gc24uc2Nyb2xsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgc24uc2Nyb2xsVG9wID0gc24uc2Nyb2xsSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVidWdsb2coXCJ1cGRhdGVIZWlnaHQgdG9cIiwgbmV3SGVpZ2h0KTtcbiAgICAgICAgfSBlbHNlIGlmIChzY3JvbGxTdGF0ZS50cmFja2VkU2Nyb2xsVG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYWNrZWROb2RlID0gdGhpcy5nZXRUcmFja2VkTm9kZSgpO1xuICAgICAgICAgICAgLy8gaWYgdGhlIHRpbWVsaW5lIGhhcyBiZWVuIHJlbG9hZGVkXG4gICAgICAgICAgICAvLyB0aGlzIGNhbiBiZSBjYWxsZWQgYmVmb3JlIHNjcm9sbFRvQm90dG9tIG9yIHdoYXRldmVyIGhhcyBiZWVuIGNhbGxlZFxuICAgICAgICAgICAgLy8gc28gZG9uJ3QgZG8gYW55dGhpbmcgaWYgdGhlIG5vZGUgaGFzIGRpc2FwcGVhcmVkIGZyb21cbiAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50bHkgZmlsbGVkIHBpZWNlIG9mIHRoZSB0aW1lbGluZVxuICAgICAgICAgICAgaWYgKHRyYWNrZWROb2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVG9wID0gdHJhY2tlZE5vZGUub2Zmc2V0VG9wO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtbGlzdC5zdHlsZS5oZWlnaHQgIT09IG5ld0hlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtbGlzdC5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RvcCA9IHRyYWNrZWROb2RlLm9mZnNldFRvcDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3BEaWZmID0gbmV3VG9wIC0gb2xkVG9wO1xuICAgICAgICAgICAgICAgIC8vIGltcG9ydGFudCB0byBzY3JvbGwgYnkgYSByZWxhdGl2ZSBhbW91bnQgYXNcbiAgICAgICAgICAgICAgICAvLyByZWFkaW5nIHNjcm9sbFRvcCBhbmQgdGhlbiBzZXR0aW5nIGl0IG1pZ2h0XG4gICAgICAgICAgICAgICAgLy8geWllbGQgb3V0IG9mIGRhdGUgdmFsdWVzIGFuZCBjYXVzZSBhIGp1bXBcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHNldHRpbmcgaXRcbiAgICAgICAgICAgICAgICBzbi5zY3JvbGxCeSgwLCB0b3BEaWZmKTtcbiAgICAgICAgICAgICAgICBkZWJ1Z2xvZyhcInVwZGF0ZUhlaWdodCB0b1wiLCB7IG5ld0hlaWdodCwgdG9wRGlmZiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VHJhY2tlZE5vZGUoKTogSFRNTEVsZW1lbnQge1xuICAgICAgICBjb25zdCBzY3JvbGxTdGF0ZSA9IHRoaXMuc2Nyb2xsU3RhdGU7XG4gICAgICAgIGNvbnN0IHRyYWNrZWROb2RlID0gc2Nyb2xsU3RhdGUudHJhY2tlZE5vZGU7XG5cbiAgICAgICAgaWYgKCF0cmFja2VkTm9kZT8ucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgbGV0IG5vZGU6IEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZXMgPSB0aGlzLml0ZW1saXN0LmN1cnJlbnQuY2hpbGRyZW47XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxUb2tlbiA9IHNjcm9sbFN0YXRlLnRyYWNrZWRTY3JvbGxUb2tlbjtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1lc3NhZ2VzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbSA9IG1lc3NhZ2VzW2ldIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgICAgIC8vICdkYXRhLXNjcm9sbC10b2tlbnMnIGlzIGEgRE9NU3RyaW5nIG9mIGNvbW1hLXNlcGFyYXRlZCBzY3JvbGwgdG9rZW5zXG4gICAgICAgICAgICAgICAgLy8gVGhlcmUgbWlnaHQgb25seSBiZSBvbmUgc2Nyb2xsIHRva2VuXG4gICAgICAgICAgICAgICAgaWYgKG0uZGF0YXNldC5zY3JvbGxUb2tlbnM/LnNwbGl0KCcsJykuaW5jbHVkZXMoc2Nyb2xsVG9rZW4pKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBtO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwiaGFkIHRvIGZpbmQgdHJhY2tlZCBub2RlIGFnYWluIGZvciBcIiArIHNjcm9sbFN0YXRlLnRyYWNrZWRTY3JvbGxUb2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzY3JvbGxTdGF0ZS50cmFja2VkTm9kZSA9IG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNjcm9sbFN0YXRlLnRyYWNrZWROb2RlKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIk5vIG5vZGUgd2l0aCA7ICdcIitzY3JvbGxTdGF0ZS50cmFja2VkU2Nyb2xsVG9rZW4rXCInXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcm9sbFN0YXRlLnRyYWNrZWROb2RlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TGlzdEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5ib3R0b21Hcm93dGggKyB0aGlzLm1pbkxpc3RIZWlnaHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNZXNzYWdlc0hlaWdodCgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBpdGVtbGlzdCA9IHRoaXMuaXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgY29uc3QgbGFzdE5vZGUgPSBpdGVtbGlzdC5sYXN0RWxlbWVudENoaWxkIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBjb25zdCBsYXN0Tm9kZUJvdHRvbSA9IGxhc3ROb2RlID8gbGFzdE5vZGUub2Zmc2V0VG9wICsgbGFzdE5vZGUuY2xpZW50SGVpZ2h0IDogMDtcbiAgICAgICAgY29uc3QgZmlyc3ROb2RlVG9wID0gaXRlbWxpc3QuZmlyc3RFbGVtZW50Q2hpbGQgPyAoaXRlbWxpc3QuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQpLm9mZnNldFRvcCA6IDA7XG4gICAgICAgIC8vIDE4IGlzIGl0ZW1saXN0IHBhZGRpbmdcbiAgICAgICAgcmV0dXJuIGxhc3ROb2RlQm90dG9tIC0gZmlyc3ROb2RlVG9wICsgKDE4ICogMik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0b3BGcm9tQm90dG9tKG5vZGU6IEhUTUxFbGVtZW50KTogbnVtYmVyIHtcbiAgICAgICAgLy8gY3VycmVudCBjYXBwZWQgaGVpZ2h0IC0gZGlzdGFuY2UgZnJvbSB0b3AgPSBkaXN0YW5jZSBmcm9tIGJvdHRvbSBvZiBjb250YWluZXIgdG8gdG9wIG9mIHRyYWNrZWQgZWxlbWVudFxuICAgICAgICByZXR1cm4gdGhpcy5pdGVtbGlzdC5jdXJyZW50LmNsaWVudEhlaWdodCAtIG5vZGUub2Zmc2V0VG9wO1xuICAgIH1cblxuICAgIC8qIGdldCB0aGUgRE9NIG5vZGUgd2hpY2ggaGFzIHRoZSBzY3JvbGxUb3AgcHJvcGVydHkgd2UgY2FyZSBhYm91dCBmb3Igb3VyXG4gICAgICogbWVzc2FnZSBwYW5lbC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFNjcm9sbE5vZGUoKTogSFRNTERpdkVsZW1lbnQge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgc2hvdWxkbid0IGhhcHBlbiwgYnV0IHdoZW4gaXQgZG9lcywgdHVybiB0aGUgTlBFIGludG9cbiAgICAgICAgICAgIC8vIHNvbWV0aGluZyBtb3JlIG1lYW5pbmdmdWwuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY3JvbGxQYW5lbC5nZXRTY3JvbGxOb2RlIGNhbGxlZCB3aGVuIHVubW91bnRlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5kaXZTY3JvbGwpIHtcbiAgICAgICAgICAgIC8vIExpa2V3aXNlLCB3ZSBzaG91bGQgaGF2ZSB0aGUgcmVmIGJ5IHRoaXMgcG9pbnQsIGJ1dCBpZiBub3RcbiAgICAgICAgICAgIC8vIHR1cm4gdGhlIE5QRSBpbnRvIHNvbWV0aGluZyBtZWFuaW5nZnVsLlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2Nyb2xsUGFuZWwuZ2V0U2Nyb2xsTm9kZSBjYWxsZWQgYmVmb3JlIEF1dG9IaWRlU2Nyb2xsYmFyIHJlZiBjb2xsZWN0ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5kaXZTY3JvbGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb2xsZWN0U2Nyb2xsID0gKGRpdlNjcm9sbDogSFRNTERpdkVsZW1lbnQpID0+IHtcbiAgICAgICAgdGhpcy5kaXZTY3JvbGwgPSBkaXZTY3JvbGw7XG4gICAgfTtcblxuICAgIC8qKlxuICAgIE1hcmsgdGhlIGJvdHRvbSBvZmZzZXQgb2YgdGhlIGxhc3QgdGlsZSBzbyB3ZSBjYW4gYmFsYW5jZSBpdCBvdXQgd2hlblxuICAgIGFueXRoaW5nIGJlbG93IGl0IGNoYW5nZXMsIGJ5IGNhbGxpbmcgdXBkYXRlUHJldmVudFNocmlua2luZywgdG8ga2VlcFxuICAgIHRoZSBzYW1lIG1pbmltdW0gYm90dG9tIG9mZnNldCwgZWZmZWN0aXZlbHkgcHJldmVudGluZyB0aGUgdGltZWxpbmUgdG8gc2hyaW5rLlxuICAgICovXG4gICAgcHVibGljIHByZXZlbnRTaHJpbmtpbmcgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VMaXN0ID0gdGhpcy5pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICBjb25zdCB0aWxlcyA9IG1lc3NhZ2VMaXN0ICYmIG1lc3NhZ2VMaXN0LmNoaWxkcmVuO1xuICAgICAgICBpZiAoIW1lc3NhZ2VMaXN0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxhc3RUaWxlTm9kZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IHRpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGlsZXNbaV0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAobm9kZS5kYXRhc2V0LnNjcm9sbFRva2Vucykge1xuICAgICAgICAgICAgICAgIGxhc3RUaWxlTm9kZSA9IG5vZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFsYXN0VGlsZU5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyUHJldmVudFNocmlua2luZygpO1xuICAgICAgICBjb25zdCBvZmZzZXRGcm9tQm90dG9tID0gbWVzc2FnZUxpc3QuY2xpZW50SGVpZ2h0IC0gKGxhc3RUaWxlTm9kZS5vZmZzZXRUb3AgKyBsYXN0VGlsZU5vZGUuY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5wcmV2ZW50U2hyaW5raW5nU3RhdGUgPSB7XG4gICAgICAgICAgICBvZmZzZXRGcm9tQm90dG9tOiBvZmZzZXRGcm9tQm90dG9tLFxuICAgICAgICAgICAgb2Zmc2V0Tm9kZTogbGFzdFRpbGVOb2RlLFxuICAgICAgICB9O1xuICAgICAgICBkZWJ1Z2xvZyhcInByZXZlbnQgc2hyaW5raW5nLCBsYXN0IHRpbGUgXCIsIG9mZnNldEZyb21Cb3R0b20sIFwicHggZnJvbSBib3R0b21cIik7XG4gICAgfTtcblxuICAgIC8qKiBDbGVhciBzaHJpbmtpbmcgcHJldmVudGlvbi4gVXNlZCBpbnRlcm5hbGx5LCBhbmQgd2hlbiB0aGUgdGltZWxpbmUgaXMgcmVsb2FkZWQuICovXG4gICAgcHVibGljIGNsZWFyUHJldmVudFNocmlua2luZyA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZUxpc3QgPSB0aGlzLml0ZW1saXN0LmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IGJhbGFuY2VFbGVtZW50ID0gbWVzc2FnZUxpc3QgJiYgbWVzc2FnZUxpc3QucGFyZW50RWxlbWVudDtcbiAgICAgICAgaWYgKGJhbGFuY2VFbGVtZW50KSBiYWxhbmNlRWxlbWVudC5zdHlsZS5wYWRkaW5nQm90dG9tID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcmV2ZW50U2hyaW5raW5nU3RhdGUgPSBudWxsO1xuICAgICAgICBkZWJ1Z2xvZyhcInByZXZlbnQgc2hyaW5raW5nIGNsZWFyZWRcIik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgIHVwZGF0ZSB0aGUgY29udGFpbmVyIHBhZGRpbmcgdG8gYmFsYW5jZVxuICAgIHRoZSBib3R0b20gb2Zmc2V0IG9mIHRoZSBsYXN0IHRpbGUgc2luY2VcbiAgICBwcmV2ZW50U2hyaW5raW5nIHdhcyBjYWxsZWQuXG4gICAgQ2xlYXJzIHRoZSBwcmV2ZW50LXNocmlua2luZyBzdGF0ZSBvbmVzIHRoZSBvZmZzZXRcbiAgICBmcm9tIHRoZSBib3R0b20gb2YgdGhlIG1hcmtlZCB0aWxlIGdyb3dzIGxhcmdlciB0aGFuXG4gICAgd2hhdCBpdCB3YXMgd2hlbiBtYXJraW5nLlxuICAgICovXG4gICAgcHVibGljIHVwZGF0ZVByZXZlbnRTaHJpbmtpbmcgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByZXZlbnRTaHJpbmtpbmdTdGF0ZSkge1xuICAgICAgICAgICAgY29uc3Qgc24gPSB0aGlzLmdldFNjcm9sbE5vZGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFN0YXRlID0gdGhpcy5zY3JvbGxTdGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VMaXN0ID0gdGhpcy5pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICAgICAgY29uc3QgeyBvZmZzZXROb2RlLCBvZmZzZXRGcm9tQm90dG9tIH0gPSB0aGlzLnByZXZlbnRTaHJpbmtpbmdTdGF0ZTtcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgdXNlZCB0byBzZXQgcGFkZGluZ0JvdHRvbSB0byBiYWxhbmNlIHRoZSB0eXBpbmcgbm90aWZzIGRpc2FwcGVhcmluZ1xuICAgICAgICAgICAgY29uc3QgYmFsYW5jZUVsZW1lbnQgPSBtZXNzYWdlTGlzdC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgLy8gaWYgdGhlIG9mZnNldE5vZGUgZ290IHVubW91bnRlZCwgY2xlYXJcbiAgICAgICAgICAgIGxldCBzaG91bGRDbGVhciA9ICFvZmZzZXROb2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAvLyBhbHNvIGlmIDIwMHB4IGZyb20gYm90dG9tXG4gICAgICAgICAgICBpZiAoIXNob3VsZENsZWFyICYmICFzY3JvbGxTdGF0ZS5zdHVja0F0Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BhY2VCZWxvd1ZpZXdwb3J0ID0gc24uc2Nyb2xsSGVpZ2h0IC0gKHNuLnNjcm9sbFRvcCArIHNuLmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICAgICAgc2hvdWxkQ2xlYXIgPSBzcGFjZUJlbG93Vmlld3BvcnQgPj0gMjAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdHJ5IHVwZGF0aW5nIGlmIG5vdCBjbGVhcmluZ1xuICAgICAgICAgICAgaWYgKCFzaG91bGRDbGVhcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRPZmZzZXQgPSBtZXNzYWdlTGlzdC5jbGllbnRIZWlnaHQgLSAob2Zmc2V0Tm9kZS5vZmZzZXRUb3AgKyBvZmZzZXROb2RlLmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0RGlmZiA9IG9mZnNldEZyb21Cb3R0b20gLSBjdXJyZW50T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXREaWZmID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBiYWxhbmNlRWxlbWVudC5zdHlsZS5wYWRkaW5nQm90dG9tID0gYCR7b2Zmc2V0RGlmZn1weGA7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwidXBkYXRlIHByZXZlbnQgc2hyaW5raW5nIFwiLCBvZmZzZXREaWZmLCBcInB4IGZyb20gYm90dG9tXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0RGlmZiA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkQ2xlYXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaG91bGRDbGVhcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJQcmV2ZW50U2hyaW5raW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBUT0RPOiB0aGUgY2xhc3NuYW1lcyBvbiB0aGUgZGl2IGFuZCBvbCBjb3VsZCBkbyB3aXRoIGJlaW5nIHVwZGF0ZWQgdG9cbiAgICAgICAgLy8gcmVmbGVjdCB0aGUgZmFjdCB0aGF0IHdlIGRvbid0IG5lY2Vzc2FyaWx5IGNvbnRhaW4gYSBsaXN0IG9mIG1lc3NhZ2VzLlxuICAgICAgICAvLyBpdCdzIG5vdCBvYnZpb3VzIHdoeSB3ZSBoYXZlIGEgc2VwYXJhdGUgZGl2IGFuZCBvbCBhbnl3YXkuXG5cbiAgICAgICAgLy8gZ2l2ZSB0aGUgPG9sPiBhbiBleHBsaWNpdCByb2xlPWxpc3QgYmVjYXVzZSBTYWZhcmkrVm9pY2VPdmVyIHNlZW1zIHRvIHRoaW5rIGFuIG9yZGVyZWQtbGlzdCB3aXRoXG4gICAgICAgIC8vIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTsgaXMgbm8gbG9uZ2VyIGEgbGlzdFxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEF1dG9IaWRlU2Nyb2xsYmFyXG4gICAgICAgICAgICAgICAgd3JhcHBlZFJlZj17dGhpcy5jb2xsZWN0U2Nyb2xsfVxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uU2Nyb2xsfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YG14X1Njcm9sbFBhbmVsICR7dGhpcy5wcm9wcy5jbGFzc05hbWV9YH1cbiAgICAgICAgICAgICAgICBzdHlsZT17dGhpcy5wcm9wcy5zdHlsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZml4ZWRDaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld19tZXNzYWdlTGlzdFdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPG9sIHJlZj17dGhpcy5pdGVtbGlzdH0gY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfTWVzc2FnZUxpc3RcIiBhcmlhLWxpdmU9XCJwb2xpdGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0F1dG9IaWRlU2Nyb2xsYmFyPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7OztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZQTtBQUNBO0FBQ0EsTUFBTUEsb0JBQW9CLEdBQUcsSUFBN0IsQyxDQUNBO0FBQ0E7O0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsR0FBbkMsQyxDQUNBO0FBQ0E7QUFDQTs7QUFDQSxNQUFNQyxTQUFTLEdBQUcsR0FBbEI7O0FBRUEsTUFBTUMsUUFBUSxHQUFHLFlBQW9CO0VBQ2pDLElBQUlDLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIsb0JBQXZCLENBQUosRUFBa0Q7SUFB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