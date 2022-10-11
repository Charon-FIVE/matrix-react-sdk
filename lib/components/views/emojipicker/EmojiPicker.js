"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EMOJI_HEIGHT = exports.EMOJIS_PER_ROW = exports.CATEGORY_HEADER_HEIGHT = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var recent = _interopRequireWildcard(require("../../../emojipicker/recent"));

var _emoji = require("../../../emoji");

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _Header = _interopRequireDefault(require("./Header"));

var _Search = _interopRequireDefault(require("./Search"));

var _Preview = _interopRequireDefault(require("./Preview"));

var _QuickReactions = _interopRequireDefault(require("./QuickReactions"));

var _Category = _interopRequireDefault(require("./Category"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const CATEGORY_HEADER_HEIGHT = 20;
exports.CATEGORY_HEADER_HEIGHT = CATEGORY_HEADER_HEIGHT;
const EMOJI_HEIGHT = 35;
exports.EMOJI_HEIGHT = EMOJI_HEIGHT;
const EMOJIS_PER_ROW = 8;
exports.EMOJIS_PER_ROW = EMOJIS_PER_ROW;
const ZERO_WIDTH_JOINER = "\u200D";

class EmojiPicker extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "recentlyUsed", void 0);
    (0, _defineProperty2.default)(this, "memoizedDataByCategory", void 0);
    (0, _defineProperty2.default)(this, "categories", void 0);
    (0, _defineProperty2.default)(this, "scrollRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onScroll", () => {
      const body = this.scrollRef.current?.containerRef.current;
      this.setState({
        scrollTop: body.scrollTop,
        viewportHeight: body.clientHeight
      });
      this.updateVisibility();
    });
    (0, _defineProperty2.default)(this, "updateVisibility", () => {
      const body = this.scrollRef.current?.containerRef.current;
      const rect = body.getBoundingClientRect();

      for (const cat of this.categories) {
        const elem = body.querySelector(`[data-category-id="${cat.id}"]`);

        if (!elem) {
          cat.visible = false;
          cat.ref.current.classList.remove("mx_EmojiPicker_anchor_visible");
          continue;
        }

        const elemRect = elem.getBoundingClientRect();
        const y = elemRect.y - rect.y;
        const yEnd = elemRect.y + elemRect.height - rect.y;
        cat.visible = y < rect.height && yEnd > 0; // We update this here instead of through React to avoid re-render on scroll.

        if (cat.visible) {
          cat.ref.current.classList.add("mx_EmojiPicker_anchor_visible");
          cat.ref.current.setAttribute("aria-selected", "true");
          cat.ref.current.setAttribute("tabindex", "0");
        } else {
          cat.ref.current.classList.remove("mx_EmojiPicker_anchor_visible");
          cat.ref.current.setAttribute("aria-selected", "false");
          cat.ref.current.setAttribute("tabindex", "-1");
        }
      }
    });
    (0, _defineProperty2.default)(this, "scrollToCategory", category => {
      this.scrollRef.current?.containerRef.current?.querySelector(`[data-category-id="${category}"]`).scrollIntoView();
    });
    (0, _defineProperty2.default)(this, "onChangeFilter", filter => {
      const lcFilter = filter.toLowerCase().trim(); // filter is case insensitive

      for (const cat of this.categories) {
        let emojis; // If the new filter string includes the old filter string, we don't have to re-filter the whole dataset.

        if (lcFilter.includes(this.state.filter)) {
          emojis = this.memoizedDataByCategory[cat.id];
        } else {
          emojis = cat.id === "recent" ? this.recentlyUsed : _emoji.DATA_BY_CATEGORY[cat.id];
        }

        emojis = emojis.filter(emoji => this.emojiMatchesFilter(emoji, lcFilter));
        this.memoizedDataByCategory[cat.id] = emojis;
        cat.enabled = emojis.length > 0; // The setState below doesn't re-render the header and we already have the refs for updateVisibility, so...

        cat.ref.current.disabled = !cat.enabled;
      }

      this.setState({
        filter
      }); // Header underlines need to be updated, but updating requires knowing
      // where the categories are, so we wait for a tick.

      setTimeout(this.updateVisibility, 0);
    });
    (0, _defineProperty2.default)(this, "emojiMatchesFilter", (emoji, filter) => {
      return emoji.label.toLowerCase().includes(filter) || (Array.isArray(emoji.emoticon) ? emoji.emoticon.some(x => x.includes(filter)) : emoji.emoticon?.includes(filter)) || emoji.shortcodes.some(x => x.toLowerCase().includes(filter)) || emoji.unicode.split(ZERO_WIDTH_JOINER).includes(filter);
    });
    (0, _defineProperty2.default)(this, "onEnterFilter", () => {
      const btn = this.scrollRef.current?.containerRef.current?.querySelector(".mx_EmojiPicker_item");

      if (btn) {
        btn.click();
      }
    });
    (0, _defineProperty2.default)(this, "onHoverEmoji", emoji => {
      this.setState({
        previewEmoji: emoji
      });
    });
    (0, _defineProperty2.default)(this, "onHoverEmojiEnd", emoji => {
      this.setState({
        previewEmoji: null
      });
    });
    (0, _defineProperty2.default)(this, "onClickEmoji", emoji => {
      if (this.props.onChoose(emoji.unicode) !== false) {
        recent.add(emoji.unicode);
      }
    });
    this.state = {
      filter: "",
      previewEmoji: null,
      scrollTop: 0,
      viewportHeight: 280
    }; // Convert recent emoji characters to emoji data, removing unknowns and duplicates

    this.recentlyUsed = Array.from(new Set(recent.get().map(_emoji.getEmojiFromUnicode).filter(Boolean)));
    this.memoizedDataByCategory = _objectSpread({
      recent: this.recentlyUsed
    }, _emoji.DATA_BY_CATEGORY);
    this.categories = [{
      id: "recent",
      name: (0, _languageHandler._t)("Frequently Used"),
      enabled: this.recentlyUsed.length > 0,
      visible: this.recentlyUsed.length > 0,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "people",
      name: (0, _languageHandler._t)("Smileys & People"),
      enabled: true,
      visible: true,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "nature",
      name: (0, _languageHandler._t)("Animals & Nature"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "foods",
      name: (0, _languageHandler._t)("Food & Drink"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "activity",
      name: (0, _languageHandler._t)("Activities"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "places",
      name: (0, _languageHandler._t)("Travel & Places"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "objects",
      name: (0, _languageHandler._t)("Objects"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "symbols",
      name: (0, _languageHandler._t)("Symbols"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "flags",
      name: (0, _languageHandler._t)("Flags"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }];
  }

  static categoryHeightForEmojiCount(count) {
    if (count === 0) {
      return 0;
    }

    return CATEGORY_HEADER_HEIGHT + Math.ceil(count / EMOJIS_PER_ROW) * EMOJI_HEIGHT;
  }

  render() {
    let heightBefore = 0;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmojiPicker",
      "data-testid": "mx_EmojiPicker"
    }, /*#__PURE__*/_react.default.createElement(_Header.default, {
      categories: this.categories,
      onAnchorClick: this.scrollToCategory
    }), /*#__PURE__*/_react.default.createElement(_Search.default, {
      query: this.state.filter,
      onChange: this.onChangeFilter,
      onEnter: this.onEnterFilter
    }), /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
      className: "mx_EmojiPicker_body",
      ref: this.scrollRef,
      onScroll: this.onScroll
    }, this.categories.map(category => {
      const emojis = this.memoizedDataByCategory[category.id];

      const categoryElement = /*#__PURE__*/_react.default.createElement(_Category.default, {
        key: category.id,
        id: category.id,
        name: category.name,
        heightBefore: heightBefore,
        viewportHeight: this.state.viewportHeight,
        scrollTop: this.state.scrollTop,
        emojis: emojis,
        onClick: this.onClickEmoji,
        onMouseEnter: this.onHoverEmoji,
        onMouseLeave: this.onHoverEmojiEnd,
        isEmojiDisabled: this.props.isEmojiDisabled,
        selectedEmojis: this.props.selectedEmojis
      });

      const height = EmojiPicker.categoryHeightForEmojiCount(emojis.length);
      heightBefore += height;
      return categoryElement;
    })), this.state.previewEmoji || !this.props.showQuickReactions ? /*#__PURE__*/_react.default.createElement(_Preview.default, {
      emoji: this.state.previewEmoji
    }) : /*#__PURE__*/_react.default.createElement(_QuickReactions.default, {
      onClick: this.onClickEmoji,
      selectedEmojis: this.props.selectedEmojis
    }));
  }

}

var _default = EmojiPicker;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDQVRFR09SWV9IRUFERVJfSEVJR0hUIiwiRU1PSklfSEVJR0hUIiwiRU1PSklTX1BFUl9ST1ciLCJaRVJPX1dJRFRIX0pPSU5FUiIsIkVtb2ppUGlja2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiYm9keSIsInNjcm9sbFJlZiIsImN1cnJlbnQiLCJjb250YWluZXJSZWYiLCJzZXRTdGF0ZSIsInNjcm9sbFRvcCIsInZpZXdwb3J0SGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwidXBkYXRlVmlzaWJpbGl0eSIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJjYXQiLCJjYXRlZ29yaWVzIiwiZWxlbSIsInF1ZXJ5U2VsZWN0b3IiLCJpZCIsInZpc2libGUiLCJyZWYiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJlbGVtUmVjdCIsInkiLCJ5RW5kIiwiaGVpZ2h0IiwiYWRkIiwic2V0QXR0cmlidXRlIiwiY2F0ZWdvcnkiLCJzY3JvbGxJbnRvVmlldyIsImZpbHRlciIsImxjRmlsdGVyIiwidG9Mb3dlckNhc2UiLCJ0cmltIiwiZW1vamlzIiwiaW5jbHVkZXMiLCJzdGF0ZSIsIm1lbW9pemVkRGF0YUJ5Q2F0ZWdvcnkiLCJyZWNlbnRseVVzZWQiLCJEQVRBX0JZX0NBVEVHT1JZIiwiZW1vamkiLCJlbW9qaU1hdGNoZXNGaWx0ZXIiLCJlbmFibGVkIiwibGVuZ3RoIiwiZGlzYWJsZWQiLCJzZXRUaW1lb3V0IiwibGFiZWwiLCJBcnJheSIsImlzQXJyYXkiLCJlbW90aWNvbiIsInNvbWUiLCJ4Iiwic2hvcnRjb2RlcyIsInVuaWNvZGUiLCJzcGxpdCIsImJ0biIsImNsaWNrIiwicHJldmlld0Vtb2ppIiwib25DaG9vc2UiLCJyZWNlbnQiLCJmcm9tIiwiU2V0IiwiZ2V0IiwibWFwIiwiZ2V0RW1vamlGcm9tVW5pY29kZSIsIkJvb2xlYW4iLCJuYW1lIiwiX3QiLCJjYXRlZ29yeUhlaWdodEZvckVtb2ppQ291bnQiLCJjb3VudCIsIk1hdGgiLCJjZWlsIiwicmVuZGVyIiwiaGVpZ2h0QmVmb3JlIiwic2Nyb2xsVG9DYXRlZ29yeSIsIm9uQ2hhbmdlRmlsdGVyIiwib25FbnRlckZpbHRlciIsIm9uU2Nyb2xsIiwiY2F0ZWdvcnlFbGVtZW50Iiwib25DbGlja0Vtb2ppIiwib25Ib3ZlckVtb2ppIiwib25Ib3ZlckVtb2ppRW5kIiwiaXNFbW9qaURpc2FibGVkIiwic2VsZWN0ZWRFbW9qaXMiLCJzaG93UXVpY2tSZWFjdGlvbnMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbW9qaXBpY2tlci9FbW9qaVBpY2tlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFR1bGlyIEFzb2thbiA8dHVsaXJAbWF1bml1bS5uZXQ+XG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIHJlY2VudCBmcm9tICcuLi8uLi8uLi9lbW9qaXBpY2tlci9yZWNlbnQnO1xuaW1wb3J0IHsgREFUQV9CWV9DQVRFR09SWSwgZ2V0RW1vamlGcm9tVW5pY29kZSwgSUVtb2ppIH0gZnJvbSBcIi4uLy4uLy4uL2Vtb2ppXCI7XG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQXV0b0hpZGVTY3JvbGxiYXJcIjtcbmltcG9ydCBIZWFkZXIgZnJvbSBcIi4vSGVhZGVyXCI7XG5pbXBvcnQgU2VhcmNoIGZyb20gXCIuL1NlYXJjaFwiO1xuaW1wb3J0IFByZXZpZXcgZnJvbSBcIi4vUHJldmlld1wiO1xuaW1wb3J0IFF1aWNrUmVhY3Rpb25zIGZyb20gXCIuL1F1aWNrUmVhY3Rpb25zXCI7XG5pbXBvcnQgQ2F0ZWdvcnksIHsgSUNhdGVnb3J5LCBDYXRlZ29yeUtleSB9IGZyb20gXCIuL0NhdGVnb3J5XCI7XG5cbmV4cG9ydCBjb25zdCBDQVRFR09SWV9IRUFERVJfSEVJR0hUID0gMjA7XG5leHBvcnQgY29uc3QgRU1PSklfSEVJR0hUID0gMzU7XG5leHBvcnQgY29uc3QgRU1PSklTX1BFUl9ST1cgPSA4O1xuXG5jb25zdCBaRVJPX1dJRFRIX0pPSU5FUiA9IFwiXFx1MjAwRFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBzZWxlY3RlZEVtb2ppcz86IFNldDxzdHJpbmc+O1xuICAgIHNob3dRdWlja1JlYWN0aW9ucz86IGJvb2xlYW47XG4gICAgb25DaG9vc2UodW5pY29kZTogc3RyaW5nKTogYm9vbGVhbjtcbiAgICBpc0Vtb2ppRGlzYWJsZWQ/OiAodW5pY29kZTogc3RyaW5nKSA9PiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBmaWx0ZXI6IHN0cmluZztcbiAgICBwcmV2aWV3RW1vamk/OiBJRW1vamk7XG4gICAgc2Nyb2xsVG9wOiBudW1iZXI7XG4gICAgLy8gaW5pdGlhbCBlc3RpbWF0aW9uIG9mIGhlaWdodCwgZGlhbG9nIGlzIGhhcmRjb2RlZCB0byA0NTBweCBoZWlnaHQuXG4gICAgLy8gc2hvdWxkIGJlIGVub3VnaCB0byBuZXZlciBoYXZlIGJsYW5rIHJvd3Mgb2YgZW1vamlzIGFzXG4gICAgLy8gMyByb3dzIG9mIG92ZXJmbG93IGFyZSBhbHNvIHJlbmRlcmVkLiBUaGUgYWN0dWFsIHZhbHVlIGlzIHVwZGF0ZWQgb24gc2Nyb2xsLlxuICAgIHZpZXdwb3J0SGVpZ2h0OiBudW1iZXI7XG59XG5cbmNsYXNzIEVtb2ppUGlja2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSByZWNlbnRseVVzZWQ6IElFbW9qaVtdO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbWVtb2l6ZWREYXRhQnlDYXRlZ29yeTogUmVjb3JkPENhdGVnb3J5S2V5LCBJRW1vamlbXT47XG4gICAgcHJpdmF0ZSByZWFkb25seSBjYXRlZ29yaWVzOiBJQ2F0ZWdvcnlbXTtcblxuICAgIHByaXZhdGUgc2Nyb2xsUmVmID0gUmVhY3QuY3JlYXRlUmVmPEF1dG9IaWRlU2Nyb2xsYmFyPFwiZGl2XCI+PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGZpbHRlcjogXCJcIixcbiAgICAgICAgICAgIHByZXZpZXdFbW9qaTogbnVsbCxcbiAgICAgICAgICAgIHNjcm9sbFRvcDogMCxcbiAgICAgICAgICAgIHZpZXdwb3J0SGVpZ2h0OiAyODAsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29udmVydCByZWNlbnQgZW1vamkgY2hhcmFjdGVycyB0byBlbW9qaSBkYXRhLCByZW1vdmluZyB1bmtub3ducyBhbmQgZHVwbGljYXRlc1xuICAgICAgICB0aGlzLnJlY2VudGx5VXNlZCA9IEFycmF5LmZyb20obmV3IFNldChyZWNlbnQuZ2V0KCkubWFwKGdldEVtb2ppRnJvbVVuaWNvZGUpLmZpbHRlcihCb29sZWFuKSkpO1xuICAgICAgICB0aGlzLm1lbW9pemVkRGF0YUJ5Q2F0ZWdvcnkgPSB7XG4gICAgICAgICAgICByZWNlbnQ6IHRoaXMucmVjZW50bHlVc2VkLFxuICAgICAgICAgICAgLi4uREFUQV9CWV9DQVRFR09SWSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNhdGVnb3JpZXMgPSBbe1xuICAgICAgICAgICAgaWQ6IFwicmVjZW50XCIsXG4gICAgICAgICAgICBuYW1lOiBfdChcIkZyZXF1ZW50bHkgVXNlZFwiKSxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRoaXMucmVjZW50bHlVc2VkLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICB2aXNpYmxlOiB0aGlzLnJlY2VudGx5VXNlZC5sZW5ndGggPiAwLFxuICAgICAgICAgICAgcmVmOiBSZWFjdC5jcmVhdGVSZWYoKSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IFwicGVvcGxlXCIsXG4gICAgICAgICAgICBuYW1lOiBfdChcIlNtaWxleXMgJiBQZW9wbGVcIiksXG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHJlZjogUmVhY3QuY3JlYXRlUmVmKCksXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiBcIm5hdHVyZVwiLFxuICAgICAgICAgICAgbmFtZTogX3QoXCJBbmltYWxzICYgTmF0dXJlXCIpLFxuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVmOiBSZWFjdC5jcmVhdGVSZWYoKSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IFwiZm9vZHNcIixcbiAgICAgICAgICAgIG5hbWU6IF90KFwiRm9vZCAmIERyaW5rXCIpLFxuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVmOiBSZWFjdC5jcmVhdGVSZWYoKSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IFwiYWN0aXZpdHlcIixcbiAgICAgICAgICAgIG5hbWU6IF90KFwiQWN0aXZpdGllc1wiKSxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZjogUmVhY3QuY3JlYXRlUmVmKCksXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiBcInBsYWNlc1wiLFxuICAgICAgICAgICAgbmFtZTogX3QoXCJUcmF2ZWwgJiBQbGFjZXNcIiksXG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICByZWY6IFJlYWN0LmNyZWF0ZVJlZigpLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogXCJvYmplY3RzXCIsXG4gICAgICAgICAgICBuYW1lOiBfdChcIk9iamVjdHNcIiksXG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICByZWY6IFJlYWN0LmNyZWF0ZVJlZigpLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogXCJzeW1ib2xzXCIsXG4gICAgICAgICAgICBuYW1lOiBfdChcIlN5bWJvbHNcIiksXG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICByZWY6IFJlYWN0LmNyZWF0ZVJlZigpLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogXCJmbGFnc1wiLFxuICAgICAgICAgICAgbmFtZTogX3QoXCJGbGFnc1wiKSxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZjogUmVhY3QuY3JlYXRlUmVmKCksXG4gICAgICAgIH1dO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TY3JvbGwgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLnNjcm9sbFJlZi5jdXJyZW50Py5jb250YWluZXJSZWYuY3VycmVudDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IGJvZHkuc2Nyb2xsVG9wLFxuICAgICAgICAgICAgdmlld3BvcnRIZWlnaHQ6IGJvZHkuY2xpZW50SGVpZ2h0LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5KCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlVmlzaWJpbGl0eSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgYm9keSA9IHRoaXMuc2Nyb2xsUmVmLmN1cnJlbnQ/LmNvbnRhaW5lclJlZi5jdXJyZW50O1xuICAgICAgICBjb25zdCByZWN0ID0gYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgZm9yIChjb25zdCBjYXQgb2YgdGhpcy5jYXRlZ29yaWVzKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtID0gYm9keS5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYXRlZ29yeS1pZD1cIiR7Y2F0LmlkfVwiXWApO1xuICAgICAgICAgICAgaWYgKCFlbGVtKSB7XG4gICAgICAgICAgICAgICAgY2F0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjYXQucmVmLmN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZShcIm14X0Vtb2ppUGlja2VyX2FuY2hvcl92aXNpYmxlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZWxlbVJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgeSA9IGVsZW1SZWN0LnkgLSByZWN0Lnk7XG4gICAgICAgICAgICBjb25zdCB5RW5kID0gZWxlbVJlY3QueSArIGVsZW1SZWN0LmhlaWdodCAtIHJlY3QueTtcbiAgICAgICAgICAgIGNhdC52aXNpYmxlID0geSA8IHJlY3QuaGVpZ2h0ICYmIHlFbmQgPiAwO1xuICAgICAgICAgICAgLy8gV2UgdXBkYXRlIHRoaXMgaGVyZSBpbnN0ZWFkIG9mIHRocm91Z2ggUmVhY3QgdG8gYXZvaWQgcmUtcmVuZGVyIG9uIHNjcm9sbC5cbiAgICAgICAgICAgIGlmIChjYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIGNhdC5yZWYuY3VycmVudC5jbGFzc0xpc3QuYWRkKFwibXhfRW1vamlQaWNrZXJfYW5jaG9yX3Zpc2libGVcIik7XG4gICAgICAgICAgICAgICAgY2F0LnJlZi5jdXJyZW50LnNldEF0dHJpYnV0ZShcImFyaWEtc2VsZWN0ZWRcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgICAgIGNhdC5yZWYuY3VycmVudC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIjBcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhdC5yZWYuY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKFwibXhfRW1vamlQaWNrZXJfYW5jaG9yX3Zpc2libGVcIik7XG4gICAgICAgICAgICAgICAgY2F0LnJlZi5jdXJyZW50LnNldEF0dHJpYnV0ZShcImFyaWEtc2VsZWN0ZWRcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgICAgICAgICBjYXQucmVmLmN1cnJlbnQuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHNjcm9sbFRvQ2F0ZWdvcnkgPSAoY2F0ZWdvcnk6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLnNjcm9sbFJlZi5jdXJyZW50Py5jb250YWluZXJSZWYuY3VycmVudFxuICAgICAgICAgICAgPy5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYXRlZ29yeS1pZD1cIiR7Y2F0ZWdvcnl9XCJdYCkuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZUZpbHRlciA9IChmaWx0ZXI6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBsY0ZpbHRlciA9IGZpbHRlci50b0xvd2VyQ2FzZSgpLnRyaW0oKTsgLy8gZmlsdGVyIGlzIGNhc2UgaW5zZW5zaXRpdmVcbiAgICAgICAgZm9yIChjb25zdCBjYXQgb2YgdGhpcy5jYXRlZ29yaWVzKSB7XG4gICAgICAgICAgICBsZXQgZW1vamlzO1xuICAgICAgICAgICAgLy8gSWYgdGhlIG5ldyBmaWx0ZXIgc3RyaW5nIGluY2x1ZGVzIHRoZSBvbGQgZmlsdGVyIHN0cmluZywgd2UgZG9uJ3QgaGF2ZSB0byByZS1maWx0ZXIgdGhlIHdob2xlIGRhdGFzZXQuXG4gICAgICAgICAgICBpZiAobGNGaWx0ZXIuaW5jbHVkZXModGhpcy5zdGF0ZS5maWx0ZXIpKSB7XG4gICAgICAgICAgICAgICAgZW1vamlzID0gdGhpcy5tZW1vaXplZERhdGFCeUNhdGVnb3J5W2NhdC5pZF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtb2ppcyA9IGNhdC5pZCA9PT0gXCJyZWNlbnRcIiA/IHRoaXMucmVjZW50bHlVc2VkIDogREFUQV9CWV9DQVRFR09SWVtjYXQuaWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW1vamlzID0gZW1vamlzLmZpbHRlcihlbW9qaSA9PiB0aGlzLmVtb2ppTWF0Y2hlc0ZpbHRlcihlbW9qaSwgbGNGaWx0ZXIpKTtcbiAgICAgICAgICAgIHRoaXMubWVtb2l6ZWREYXRhQnlDYXRlZ29yeVtjYXQuaWRdID0gZW1vamlzO1xuICAgICAgICAgICAgY2F0LmVuYWJsZWQgPSBlbW9qaXMubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIC8vIFRoZSBzZXRTdGF0ZSBiZWxvdyBkb2Vzbid0IHJlLXJlbmRlciB0aGUgaGVhZGVyIGFuZCB3ZSBhbHJlYWR5IGhhdmUgdGhlIHJlZnMgZm9yIHVwZGF0ZVZpc2liaWxpdHksIHNvLi4uXG4gICAgICAgICAgICBjYXQucmVmLmN1cnJlbnQuZGlzYWJsZWQgPSAhY2F0LmVuYWJsZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbHRlciB9KTtcbiAgICAgICAgLy8gSGVhZGVyIHVuZGVybGluZXMgbmVlZCB0byBiZSB1cGRhdGVkLCBidXQgdXBkYXRpbmcgcmVxdWlyZXMga25vd2luZ1xuICAgICAgICAvLyB3aGVyZSB0aGUgY2F0ZWdvcmllcyBhcmUsIHNvIHdlIHdhaXQgZm9yIGEgdGljay5cbiAgICAgICAgc2V0VGltZW91dCh0aGlzLnVwZGF0ZVZpc2liaWxpdHksIDApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGVtb2ppTWF0Y2hlc0ZpbHRlciA9IChlbW9qaTogSUVtb2ppLCBmaWx0ZXI6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgICAgICByZXR1cm4gZW1vamkubGFiZWwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXIpIHx8XG4gICAgICAgICAgICAoQXJyYXkuaXNBcnJheShlbW9qaS5lbW90aWNvbilcbiAgICAgICAgICAgICAgICA/IGVtb2ppLmVtb3RpY29uLnNvbWUoKHgpID0+IHguaW5jbHVkZXMoZmlsdGVyKSlcbiAgICAgICAgICAgICAgICA6IGVtb2ppLmVtb3RpY29uPy5pbmNsdWRlcyhmaWx0ZXIpXG4gICAgICAgICAgICApIHx8XG4gICAgICAgICAgICBlbW9qaS5zaG9ydGNvZGVzLnNvbWUoeCA9PiB4LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVyKSkgfHxcbiAgICAgICAgICAgIGVtb2ppLnVuaWNvZGUuc3BsaXQoWkVST19XSURUSF9KT0lORVIpLmluY2x1ZGVzKGZpbHRlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FbnRlckZpbHRlciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgYnRuID0gdGhpcy5zY3JvbGxSZWYuY3VycmVudD8uY29udGFpbmVyUmVmLmN1cnJlbnRcbiAgICAgICAgICAgID8ucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oXCIubXhfRW1vamlQaWNrZXJfaXRlbVwiKTtcbiAgICAgICAgaWYgKGJ0bikge1xuICAgICAgICAgICAgYnRuLmNsaWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkhvdmVyRW1vamkgPSAoZW1vamk6IElFbW9qaSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByZXZpZXdFbW9qaTogZW1vamksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSG92ZXJFbW9qaUVuZCA9IChlbW9qaTogSUVtb2ppKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJldmlld0Vtb2ppOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsaWNrRW1vamkgPSAoZW1vamk6IElFbW9qaSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNob29zZShlbW9qaS51bmljb2RlKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJlY2VudC5hZGQoZW1vamkudW5pY29kZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY2F0ZWdvcnlIZWlnaHRGb3JFbW9qaUNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQ0FURUdPUllfSEVBREVSX0hFSUdIVCArIChNYXRoLmNlaWwoY291bnQgLyBFTU9KSVNfUEVSX1JPVykgKiBFTU9KSV9IRUlHSFQpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGhlaWdodEJlZm9yZSA9IDA7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0Vtb2ppUGlja2VyXCIgZGF0YS10ZXN0aWQ9J214X0Vtb2ppUGlja2VyJz5cbiAgICAgICAgICAgICAgICA8SGVhZGVyIGNhdGVnb3JpZXM9e3RoaXMuY2F0ZWdvcmllc30gb25BbmNob3JDbGljaz17dGhpcy5zY3JvbGxUb0NhdGVnb3J5fSAvPlxuICAgICAgICAgICAgICAgIDxTZWFyY2ggcXVlcnk9e3RoaXMuc3RhdGUuZmlsdGVyfSBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZUZpbHRlcn0gb25FbnRlcj17dGhpcy5vbkVudGVyRmlsdGVyfSAvPlxuICAgICAgICAgICAgICAgIDxBdXRvSGlkZVNjcm9sbGJhclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FbW9qaVBpY2tlcl9ib2R5XCJcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnNjcm9sbFJlZn1cbiAgICAgICAgICAgICAgICAgICAgb25TY3JvbGw9e3RoaXMub25TY3JvbGx9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuY2F0ZWdvcmllcy5tYXAoY2F0ZWdvcnkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1vamlzID0gdGhpcy5tZW1vaXplZERhdGFCeUNhdGVnb3J5W2NhdGVnb3J5LmlkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdGVnb3J5RWxlbWVudCA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjYXRlZ29yeS5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9e2NhdGVnb3J5LmlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPXtjYXRlZ29yeS5uYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHRCZWZvcmU9e2hlaWdodEJlZm9yZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld3BvcnRIZWlnaHQ9e3RoaXMuc3RhdGUudmlld3BvcnRIZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcD17dGhpcy5zdGF0ZS5zY3JvbGxUb3B9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtb2ppcz17ZW1vamlzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2tFbW9qaX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLm9uSG92ZXJFbW9qaX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLm9uSG92ZXJFbW9qaUVuZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNFbW9qaURpc2FibGVkPXt0aGlzLnByb3BzLmlzRW1vamlEaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRFbW9qaXM9e3RoaXMucHJvcHMuc2VsZWN0ZWRFbW9qaXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBFbW9qaVBpY2tlci5jYXRlZ29yeUhlaWdodEZvckVtb2ppQ291bnQoZW1vamlzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHRCZWZvcmUgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhdGVnb3J5RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgIDwvQXV0b0hpZGVTY3JvbGxiYXI+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLnByZXZpZXdFbW9qaSB8fCAhdGhpcy5wcm9wcy5zaG93UXVpY2tSZWFjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgPyA8UHJldmlldyBlbW9qaT17dGhpcy5zdGF0ZS5wcmV2aWV3RW1vaml9IC8+XG4gICAgICAgICAgICAgICAgICAgIDogPFF1aWNrUmVhY3Rpb25zIG9uQ2xpY2s9e3RoaXMub25DbGlja0Vtb2ppfSBzZWxlY3RlZEVtb2ppcz17dGhpcy5wcm9wcy5zZWxlY3RlZEVtb2ppc30gLz4gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFbW9qaVBpY2tlcjtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFTyxNQUFNQSxzQkFBc0IsR0FBRyxFQUEvQjs7QUFDQSxNQUFNQyxZQUFZLEdBQUcsRUFBckI7O0FBQ0EsTUFBTUMsY0FBYyxHQUFHLENBQXZCOztBQUVQLE1BQU1DLGlCQUFpQixHQUFHLFFBQTFCOztBQW1CQSxNQUFNQyxXQUFOLFNBQTBCQyxjQUFBLENBQU1DLFNBQWhDLENBQTBEO0VBT3REQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1QjtJQUFBO0lBQUE7SUFBQSw4REFGUEgsY0FBQSxDQUFNSSxTQUFOLEVBRU87SUFBQSxnREEwRVIsTUFBTTtNQUNyQixNQUFNQyxJQUFJLEdBQUcsS0FBS0MsU0FBTCxDQUFlQyxPQUFmLEVBQXdCQyxZQUF4QixDQUFxQ0QsT0FBbEQ7TUFDQSxLQUFLRSxRQUFMLENBQWM7UUFDVkMsU0FBUyxFQUFFTCxJQUFJLENBQUNLLFNBRE47UUFFVkMsY0FBYyxFQUFFTixJQUFJLENBQUNPO01BRlgsQ0FBZDtNQUlBLEtBQUtDLGdCQUFMO0lBQ0gsQ0FqRjBCO0lBQUEsd0RBbUZBLE1BQU07TUFDN0IsTUFBTVIsSUFBSSxHQUFHLEtBQUtDLFNBQUwsQ0FBZUMsT0FBZixFQUF3QkMsWUFBeEIsQ0FBcUNELE9BQWxEO01BQ0EsTUFBTU8sSUFBSSxHQUFHVCxJQUFJLENBQUNVLHFCQUFMLEVBQWI7O01BQ0EsS0FBSyxNQUFNQyxHQUFYLElBQWtCLEtBQUtDLFVBQXZCLEVBQW1DO1FBQy9CLE1BQU1DLElBQUksR0FBR2IsSUFBSSxDQUFDYyxhQUFMLENBQW9CLHNCQUFxQkgsR0FBRyxDQUFDSSxFQUFHLElBQWhELENBQWI7O1FBQ0EsSUFBSSxDQUFDRixJQUFMLEVBQVc7VUFDUEYsR0FBRyxDQUFDSyxPQUFKLEdBQWMsS0FBZDtVQUNBTCxHQUFHLENBQUNNLEdBQUosQ0FBUWYsT0FBUixDQUFnQmdCLFNBQWhCLENBQTBCQyxNQUExQixDQUFpQywrQkFBakM7VUFDQTtRQUNIOztRQUNELE1BQU1DLFFBQVEsR0FBR1AsSUFBSSxDQUFDSCxxQkFBTCxFQUFqQjtRQUNBLE1BQU1XLENBQUMsR0FBR0QsUUFBUSxDQUFDQyxDQUFULEdBQWFaLElBQUksQ0FBQ1ksQ0FBNUI7UUFDQSxNQUFNQyxJQUFJLEdBQUdGLFFBQVEsQ0FBQ0MsQ0FBVCxHQUFhRCxRQUFRLENBQUNHLE1BQXRCLEdBQStCZCxJQUFJLENBQUNZLENBQWpEO1FBQ0FWLEdBQUcsQ0FBQ0ssT0FBSixHQUFjSyxDQUFDLEdBQUdaLElBQUksQ0FBQ2MsTUFBVCxJQUFtQkQsSUFBSSxHQUFHLENBQXhDLENBVitCLENBVy9COztRQUNBLElBQUlYLEdBQUcsQ0FBQ0ssT0FBUixFQUFpQjtVQUNiTCxHQUFHLENBQUNNLEdBQUosQ0FBUWYsT0FBUixDQUFnQmdCLFNBQWhCLENBQTBCTSxHQUExQixDQUE4QiwrQkFBOUI7VUFDQWIsR0FBRyxDQUFDTSxHQUFKLENBQVFmLE9BQVIsQ0FBZ0J1QixZQUFoQixDQUE2QixlQUE3QixFQUE4QyxNQUE5QztVQUNBZCxHQUFHLENBQUNNLEdBQUosQ0FBUWYsT0FBUixDQUFnQnVCLFlBQWhCLENBQTZCLFVBQTdCLEVBQXlDLEdBQXpDO1FBQ0gsQ0FKRCxNQUlPO1VBQ0hkLEdBQUcsQ0FBQ00sR0FBSixDQUFRZixPQUFSLENBQWdCZ0IsU0FBaEIsQ0FBMEJDLE1BQTFCLENBQWlDLCtCQUFqQztVQUNBUixHQUFHLENBQUNNLEdBQUosQ0FBUWYsT0FBUixDQUFnQnVCLFlBQWhCLENBQTZCLGVBQTdCLEVBQThDLE9BQTlDO1VBQ0FkLEdBQUcsQ0FBQ00sR0FBSixDQUFRZixPQUFSLENBQWdCdUIsWUFBaEIsQ0FBNkIsVUFBN0IsRUFBeUMsSUFBekM7UUFDSDtNQUNKO0lBQ0osQ0E1RzBCO0lBQUEsd0RBOEdDQyxRQUFELElBQXNCO01BQzdDLEtBQUt6QixTQUFMLENBQWVDLE9BQWYsRUFBd0JDLFlBQXhCLENBQXFDRCxPQUFyQyxFQUNNWSxhQUROLENBQ3FCLHNCQUFxQlksUUFBUyxJQURuRCxFQUN3REMsY0FEeEQ7SUFFSCxDQWpIMEI7SUFBQSxzREFtSERDLE1BQUQsSUFBb0I7TUFDekMsTUFBTUMsUUFBUSxHQUFHRCxNQUFNLENBQUNFLFdBQVAsR0FBcUJDLElBQXJCLEVBQWpCLENBRHlDLENBQ0s7O01BQzlDLEtBQUssTUFBTXBCLEdBQVgsSUFBa0IsS0FBS0MsVUFBdkIsRUFBbUM7UUFDL0IsSUFBSW9CLE1BQUosQ0FEK0IsQ0FFL0I7O1FBQ0EsSUFBSUgsUUFBUSxDQUFDSSxRQUFULENBQWtCLEtBQUtDLEtBQUwsQ0FBV04sTUFBN0IsQ0FBSixFQUEwQztVQUN0Q0ksTUFBTSxHQUFHLEtBQUtHLHNCQUFMLENBQTRCeEIsR0FBRyxDQUFDSSxFQUFoQyxDQUFUO1FBQ0gsQ0FGRCxNQUVPO1VBQ0hpQixNQUFNLEdBQUdyQixHQUFHLENBQUNJLEVBQUosS0FBVyxRQUFYLEdBQXNCLEtBQUtxQixZQUEzQixHQUEwQ0MsdUJBQUEsQ0FBaUIxQixHQUFHLENBQUNJLEVBQXJCLENBQW5EO1FBQ0g7O1FBQ0RpQixNQUFNLEdBQUdBLE1BQU0sQ0FBQ0osTUFBUCxDQUFjVSxLQUFLLElBQUksS0FBS0Msa0JBQUwsQ0FBd0JELEtBQXhCLEVBQStCVCxRQUEvQixDQUF2QixDQUFUO1FBQ0EsS0FBS00sc0JBQUwsQ0FBNEJ4QixHQUFHLENBQUNJLEVBQWhDLElBQXNDaUIsTUFBdEM7UUFDQXJCLEdBQUcsQ0FBQzZCLE9BQUosR0FBY1IsTUFBTSxDQUFDUyxNQUFQLEdBQWdCLENBQTlCLENBVitCLENBVy9COztRQUNBOUIsR0FBRyxDQUFDTSxHQUFKLENBQVFmLE9BQVIsQ0FBZ0J3QyxRQUFoQixHQUEyQixDQUFDL0IsR0FBRyxDQUFDNkIsT0FBaEM7TUFDSDs7TUFDRCxLQUFLcEMsUUFBTCxDQUFjO1FBQUV3QjtNQUFGLENBQWQsRUFoQnlDLENBaUJ6QztNQUNBOztNQUNBZSxVQUFVLENBQUMsS0FBS25DLGdCQUFOLEVBQXdCLENBQXhCLENBQVY7SUFDSCxDQXZJMEI7SUFBQSwwREF5SUUsQ0FBQzhCLEtBQUQsRUFBZ0JWLE1BQWhCLEtBQTRDO01BQ3JFLE9BQU9VLEtBQUssQ0FBQ00sS0FBTixDQUFZZCxXQUFaLEdBQTBCRyxRQUExQixDQUFtQ0wsTUFBbkMsTUFDRmlCLEtBQUssQ0FBQ0MsT0FBTixDQUFjUixLQUFLLENBQUNTLFFBQXBCLElBQ0tULEtBQUssQ0FBQ1MsUUFBTixDQUFlQyxJQUFmLENBQXFCQyxDQUFELElBQU9BLENBQUMsQ0FBQ2hCLFFBQUYsQ0FBV0wsTUFBWCxDQUEzQixDQURMLEdBRUtVLEtBQUssQ0FBQ1MsUUFBTixFQUFnQmQsUUFBaEIsQ0FBeUJMLE1BQXpCLENBSEgsS0FLSFUsS0FBSyxDQUFDWSxVQUFOLENBQWlCRixJQUFqQixDQUFzQkMsQ0FBQyxJQUFJQSxDQUFDLENBQUNuQixXQUFGLEdBQWdCRyxRQUFoQixDQUF5QkwsTUFBekIsQ0FBM0IsQ0FMRyxJQU1IVSxLQUFLLENBQUNhLE9BQU4sQ0FBY0MsS0FBZCxDQUFvQjNELGlCQUFwQixFQUF1Q3dDLFFBQXZDLENBQWdETCxNQUFoRCxDQU5KO0lBT0gsQ0FqSjBCO0lBQUEscURBbUpILE1BQU07TUFDMUIsTUFBTXlCLEdBQUcsR0FBRyxLQUFLcEQsU0FBTCxDQUFlQyxPQUFmLEVBQXdCQyxZQUF4QixDQUFxQ0QsT0FBckMsRUFDTlksYUFETSxDQUMyQixzQkFEM0IsQ0FBWjs7TUFFQSxJQUFJdUMsR0FBSixFQUFTO1FBQ0xBLEdBQUcsQ0FBQ0MsS0FBSjtNQUNIO0lBQ0osQ0F6SjBCO0lBQUEsb0RBMkpIaEIsS0FBRCxJQUFtQjtNQUN0QyxLQUFLbEMsUUFBTCxDQUFjO1FBQ1ZtRCxZQUFZLEVBQUVqQjtNQURKLENBQWQ7SUFHSCxDQS9KMEI7SUFBQSx1REFpS0FBLEtBQUQsSUFBbUI7TUFDekMsS0FBS2xDLFFBQUwsQ0FBYztRQUNWbUQsWUFBWSxFQUFFO01BREosQ0FBZDtJQUdILENBckswQjtJQUFBLG9EQXVLSGpCLEtBQUQsSUFBbUI7TUFDdEMsSUFBSSxLQUFLeEMsS0FBTCxDQUFXMEQsUUFBWCxDQUFvQmxCLEtBQUssQ0FBQ2EsT0FBMUIsTUFBdUMsS0FBM0MsRUFBa0Q7UUFDOUNNLE1BQU0sQ0FBQ2pDLEdBQVAsQ0FBV2MsS0FBSyxDQUFDYSxPQUFqQjtNQUNIO0lBQ0osQ0EzSzBCO0lBR3ZCLEtBQUtqQixLQUFMLEdBQWE7TUFDVE4sTUFBTSxFQUFFLEVBREM7TUFFVDJCLFlBQVksRUFBRSxJQUZMO01BR1RsRCxTQUFTLEVBQUUsQ0FIRjtNQUlUQyxjQUFjLEVBQUU7SUFKUCxDQUFiLENBSHVCLENBVXZCOztJQUNBLEtBQUs4QixZQUFMLEdBQW9CUyxLQUFLLENBQUNhLElBQU4sQ0FBVyxJQUFJQyxHQUFKLENBQVFGLE1BQU0sQ0FBQ0csR0FBUCxHQUFhQyxHQUFiLENBQWlCQywwQkFBakIsRUFBc0NsQyxNQUF0QyxDQUE2Q21DLE9BQTdDLENBQVIsQ0FBWCxDQUFwQjtJQUNBLEtBQUs1QixzQkFBTDtNQUNJc0IsTUFBTSxFQUFFLEtBQUtyQjtJQURqQixHQUVPQyx1QkFGUDtJQUtBLEtBQUt6QixVQUFMLEdBQWtCLENBQUM7TUFDZkcsRUFBRSxFQUFFLFFBRFc7TUFFZmlELElBQUksRUFBRSxJQUFBQyxtQkFBQSxFQUFHLGlCQUFILENBRlM7TUFHZnpCLE9BQU8sRUFBRSxLQUFLSixZQUFMLENBQWtCSyxNQUFsQixHQUEyQixDQUhyQjtNQUlmekIsT0FBTyxFQUFFLEtBQUtvQixZQUFMLENBQWtCSyxNQUFsQixHQUEyQixDQUpyQjtNQUtmeEIsR0FBRyxlQUFFdEIsY0FBQSxDQUFNSSxTQUFOO0lBTFUsQ0FBRCxFQU1mO01BQ0NnQixFQUFFLEVBQUUsUUFETDtNQUVDaUQsSUFBSSxFQUFFLElBQUFDLG1CQUFBLEVBQUcsa0JBQUgsQ0FGUDtNQUdDekIsT0FBTyxFQUFFLElBSFY7TUFJQ3hCLE9BQU8sRUFBRSxJQUpWO01BS0NDLEdBQUcsZUFBRXRCLGNBQUEsQ0FBTUksU0FBTjtJQUxOLENBTmUsRUFZZjtNQUNDZ0IsRUFBRSxFQUFFLFFBREw7TUFFQ2lELElBQUksRUFBRSxJQUFBQyxtQkFBQSxFQUFHLGtCQUFILENBRlA7TUFHQ3pCLE9BQU8sRUFBRSxJQUhWO01BSUN4QixPQUFPLEVBQUUsS0FKVjtNQUtDQyxHQUFHLGVBQUV0QixjQUFBLENBQU1JLFNBQU47SUFMTixDQVplLEVBa0JmO01BQ0NnQixFQUFFLEVBQUUsT0FETDtNQUVDaUQsSUFBSSxFQUFFLElBQUFDLG1CQUFBLEVBQUcsY0FBSCxDQUZQO01BR0N6QixPQUFPLEVBQUUsSUFIVjtNQUlDeEIsT0FBTyxFQUFFLEtBSlY7TUFLQ0MsR0FBRyxlQUFFdEIsY0FBQSxDQUFNSSxTQUFOO0lBTE4sQ0FsQmUsRUF3QmY7TUFDQ2dCLEVBQUUsRUFBRSxVQURMO01BRUNpRCxJQUFJLEVBQUUsSUFBQUMsbUJBQUEsRUFBRyxZQUFILENBRlA7TUFHQ3pCLE9BQU8sRUFBRSxJQUhWO01BSUN4QixPQUFPLEVBQUUsS0FKVjtNQUtDQyxHQUFHLGVBQUV0QixjQUFBLENBQU1JLFNBQU47SUFMTixDQXhCZSxFQThCZjtNQUNDZ0IsRUFBRSxFQUFFLFFBREw7TUFFQ2lELElBQUksRUFBRSxJQUFBQyxtQkFBQSxFQUFHLGlCQUFILENBRlA7TUFHQ3pCLE9BQU8sRUFBRSxJQUhWO01BSUN4QixPQUFPLEVBQUUsS0FKVjtNQUtDQyxHQUFHLGVBQUV0QixjQUFBLENBQU1JLFNBQU47SUFMTixDQTlCZSxFQW9DZjtNQUNDZ0IsRUFBRSxFQUFFLFNBREw7TUFFQ2lELElBQUksRUFBRSxJQUFBQyxtQkFBQSxFQUFHLFNBQUgsQ0FGUDtNQUdDekIsT0FBTyxFQUFFLElBSFY7TUFJQ3hCLE9BQU8sRUFBRSxLQUpWO01BS0NDLEdBQUcsZUFBRXRCLGNBQUEsQ0FBTUksU0FBTjtJQUxOLENBcENlLEVBMENmO01BQ0NnQixFQUFFLEVBQUUsU0FETDtNQUVDaUQsSUFBSSxFQUFFLElBQUFDLG1CQUFBLEVBQUcsU0FBSCxDQUZQO01BR0N6QixPQUFPLEVBQUUsSUFIVjtNQUlDeEIsT0FBTyxFQUFFLEtBSlY7TUFLQ0MsR0FBRyxlQUFFdEIsY0FBQSxDQUFNSSxTQUFOO0lBTE4sQ0ExQ2UsRUFnRGY7TUFDQ2dCLEVBQUUsRUFBRSxPQURMO01BRUNpRCxJQUFJLEVBQUUsSUFBQUMsbUJBQUEsRUFBRyxPQUFILENBRlA7TUFHQ3pCLE9BQU8sRUFBRSxJQUhWO01BSUN4QixPQUFPLEVBQUUsS0FKVjtNQUtDQyxHQUFHLGVBQUV0QixjQUFBLENBQU1JLFNBQU47SUFMTixDQWhEZSxDQUFsQjtFQXVESDs7RUFxR3lDLE9BQTNCbUUsMkJBQTJCLENBQUNDLEtBQUQsRUFBZ0I7SUFDdEQsSUFBSUEsS0FBSyxLQUFLLENBQWQsRUFBaUI7TUFDYixPQUFPLENBQVA7SUFDSDs7SUFDRCxPQUFPN0Usc0JBQXNCLEdBQUk4RSxJQUFJLENBQUNDLElBQUwsQ0FBVUYsS0FBSyxHQUFHM0UsY0FBbEIsSUFBb0NELFlBQXJFO0VBQ0g7O0VBRUQrRSxNQUFNLEdBQUc7SUFDTCxJQUFJQyxZQUFZLEdBQUcsQ0FBbkI7SUFDQSxvQkFDSTtNQUFLLFNBQVMsRUFBQyxnQkFBZjtNQUFnQyxlQUFZO0lBQTVDLGdCQUNJLDZCQUFDLGVBQUQ7TUFBUSxVQUFVLEVBQUUsS0FBSzNELFVBQXpCO01BQXFDLGFBQWEsRUFBRSxLQUFLNEQ7SUFBekQsRUFESixlQUVJLDZCQUFDLGVBQUQ7TUFBUSxLQUFLLEVBQUUsS0FBS3RDLEtBQUwsQ0FBV04sTUFBMUI7TUFBa0MsUUFBUSxFQUFFLEtBQUs2QyxjQUFqRDtNQUFpRSxPQUFPLEVBQUUsS0FBS0M7SUFBL0UsRUFGSixlQUdJLDZCQUFDLDBCQUFEO01BQ0ksU0FBUyxFQUFDLHFCQURkO01BRUksR0FBRyxFQUFFLEtBQUt6RSxTQUZkO01BR0ksUUFBUSxFQUFFLEtBQUswRTtJQUhuQixHQUtNLEtBQUsvRCxVQUFMLENBQWdCaUQsR0FBaEIsQ0FBb0JuQyxRQUFRLElBQUk7TUFDOUIsTUFBTU0sTUFBTSxHQUFHLEtBQUtHLHNCQUFMLENBQTRCVCxRQUFRLENBQUNYLEVBQXJDLENBQWY7O01BQ0EsTUFBTTZELGVBQWUsZ0JBQ2pCLDZCQUFDLGlCQUFEO1FBQ0ksR0FBRyxFQUFFbEQsUUFBUSxDQUFDWCxFQURsQjtRQUVJLEVBQUUsRUFBRVcsUUFBUSxDQUFDWCxFQUZqQjtRQUdJLElBQUksRUFBRVcsUUFBUSxDQUFDc0MsSUFIbkI7UUFJSSxZQUFZLEVBQUVPLFlBSmxCO1FBS0ksY0FBYyxFQUFFLEtBQUtyQyxLQUFMLENBQVc1QixjQUwvQjtRQU1JLFNBQVMsRUFBRSxLQUFLNEIsS0FBTCxDQUFXN0IsU0FOMUI7UUFPSSxNQUFNLEVBQUUyQixNQVBaO1FBUUksT0FBTyxFQUFFLEtBQUs2QyxZQVJsQjtRQVNJLFlBQVksRUFBRSxLQUFLQyxZQVR2QjtRQVVJLFlBQVksRUFBRSxLQUFLQyxlQVZ2QjtRQVdJLGVBQWUsRUFBRSxLQUFLakYsS0FBTCxDQUFXa0YsZUFYaEM7UUFZSSxjQUFjLEVBQUUsS0FBS2xGLEtBQUwsQ0FBV21GO01BWi9CLEVBREo7O01BZ0JBLE1BQU0xRCxNQUFNLEdBQUc3QixXQUFXLENBQUN3RSwyQkFBWixDQUF3Q2xDLE1BQU0sQ0FBQ1MsTUFBL0MsQ0FBZjtNQUNBOEIsWUFBWSxJQUFJaEQsTUFBaEI7TUFDQSxPQUFPcUQsZUFBUDtJQUNILENBckJDLENBTE4sQ0FISixFQStCTSxLQUFLMUMsS0FBTCxDQUFXcUIsWUFBWCxJQUEyQixDQUFDLEtBQUt6RCxLQUFMLENBQVdvRixrQkFBdkMsZ0JBQ0ksNkJBQUMsZ0JBQUQ7TUFBUyxLQUFLLEVBQUUsS0FBS2hELEtBQUwsQ0FBV3FCO0lBQTNCLEVBREosZ0JBRUksNkJBQUMsdUJBQUQ7TUFBZ0IsT0FBTyxFQUFFLEtBQUtzQixZQUE5QjtNQUE0QyxjQUFjLEVBQUUsS0FBSy9FLEtBQUwsQ0FBV21GO0lBQXZFLEVBakNWLENBREo7RUFxQ0g7O0FBbE9xRDs7ZUFxTzNDdkYsVyJ9