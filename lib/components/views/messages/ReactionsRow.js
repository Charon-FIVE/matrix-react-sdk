"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/models/event");

var _relations = require("matrix-js-sdk/src/models/relations");

var _languageHandler = require("../../../languageHandler");

var _EventUtils = require("../../../utils/EventUtils");

var _ContextMenuTooltipButton = require("../../../accessibility/context_menu/ContextMenuTooltipButton");

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _ReactionPicker = _interopRequireDefault(require("../emojipicker/ReactionPicker"));

var _ReactionsRowButton = _interopRequireDefault(require("./ReactionsRowButton"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
// The maximum number of reactions to initially show on a message.
const MAX_ITEMS_WHEN_LIMITED = 8;

const ReactButton = _ref => {
  let {
    mxEvent,
    reactions
  } = _ref;
  const [menuDisplayed, button, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  let contextMenu;

  if (menuDisplayed) {
    const buttonRect = button.current.getBoundingClientRect();
    contextMenu = /*#__PURE__*/_react.default.createElement(_ContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.aboveLeftOf)(buttonRect), {
      onFinished: closeMenu,
      managed: false
    }), /*#__PURE__*/_react.default.createElement(_ReactionPicker.default, {
      mxEvent: mxEvent,
      reactions: reactions,
      onFinished: closeMenu
    }));
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenuTooltipButton.ContextMenuTooltipButton, {
    className: (0, _classnames.default)("mx_ReactionsRow_addReactionButton", {
      mx_ReactionsRow_addReactionButton_active: menuDisplayed
    }),
    title: (0, _languageHandler._t)("Add reaction"),
    onClick: openMenu,
    onContextMenu: e => {
      e.preventDefault();
      openMenu();
    },
    isExpanded: menuDisplayed,
    inputRef: button
  }), contextMenu);
};

class ReactionsRow extends _react.default.PureComponent {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onDecrypted", () => {
      // Decryption changes whether the event is actionable
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onReactionsChange", () => {
      // TODO: Call `onHeightChanged` as needed
      this.setState({
        myReactions: this.getMyReactions()
      }); // Using `forceUpdate` for the moment, since we know the overall set of reactions
      // has changed (this is triggered by events for that purpose only) and
      // `PureComponent`s shallow state / props compare would otherwise filter this out.

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onShowAllClick", () => {
      this.setState({
        showAll: true
      });
    });
    this.context = context;
    this.state = {
      myReactions: this.getMyReactions(),
      showAll: false
    };
  }

  componentDidMount() {
    const {
      mxEvent,
      reactions
    } = this.props;

    if (mxEvent.isBeingDecrypted() || mxEvent.shouldAttemptDecryption()) {
      mxEvent.once(_event.MatrixEventEvent.Decrypted, this.onDecrypted);
    }

    if (reactions) {
      reactions.on(_relations.RelationsEvent.Add, this.onReactionsChange);
      reactions.on(_relations.RelationsEvent.Remove, this.onReactionsChange);
      reactions.on(_relations.RelationsEvent.Redaction, this.onReactionsChange);
    }
  }

  componentWillUnmount() {
    const {
      mxEvent,
      reactions
    } = this.props;
    mxEvent.off(_event.MatrixEventEvent.Decrypted, this.onDecrypted);

    if (reactions) {
      reactions.off(_relations.RelationsEvent.Add, this.onReactionsChange);
      reactions.off(_relations.RelationsEvent.Remove, this.onReactionsChange);
      reactions.off(_relations.RelationsEvent.Redaction, this.onReactionsChange);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.reactions !== this.props.reactions) {
      this.props.reactions.on(_relations.RelationsEvent.Add, this.onReactionsChange);
      this.props.reactions.on(_relations.RelationsEvent.Remove, this.onReactionsChange);
      this.props.reactions.on(_relations.RelationsEvent.Redaction, this.onReactionsChange);
      this.onReactionsChange();
    }
  }

  getMyReactions() {
    const reactions = this.props.reactions;

    if (!reactions) {
      return null;
    }

    const userId = this.context.room.client.getUserId();
    const myReactions = reactions.getAnnotationsBySender()[userId];

    if (!myReactions) {
      return null;
    }

    return [...myReactions.values()];
  }

  render() {
    const {
      mxEvent,
      reactions
    } = this.props;
    const {
      myReactions,
      showAll
    } = this.state;

    if (!reactions || !(0, _EventUtils.isContentActionable)(mxEvent)) {
      return null;
    }

    let items = reactions.getSortedAnnotationsByKey().map(_ref2 => {
      let [content, events] = _ref2;
      const count = events.size;

      if (!count) {
        return null;
      }

      const myReactionEvent = myReactions && myReactions.find(mxEvent => {
        if (mxEvent.isRedacted()) {
          return false;
        }

        return mxEvent.getRelation().key === content;
      });
      return /*#__PURE__*/_react.default.createElement(_ReactionsRowButton.default, {
        key: content,
        content: content,
        count: count,
        mxEvent: mxEvent,
        reactionEvents: events,
        myReactionEvent: myReactionEvent,
        disabled: !this.context.canReact || myReactionEvent && !myReactionEvent.isRedacted() && !this.context.canSelfRedact
      });
    }).filter(item => !!item);
    if (!items.length) return null; // Show the first MAX_ITEMS if there are MAX_ITEMS + 1 or more items.
    // The "+ 1" ensure that the "show all" reveals something that takes up
    // more space than the button itself.

    let showAllButton;

    if (items.length > MAX_ITEMS_WHEN_LIMITED + 1 && !showAll) {
      items = items.slice(0, MAX_ITEMS_WHEN_LIMITED);
      showAllButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        className: "mx_ReactionsRow_showAll",
        onClick: this.onShowAllClick
      }, (0, _languageHandler._t)("Show all"));
    }

    let addReactionButton;

    if (this.context.canReact) {
      addReactionButton = /*#__PURE__*/_react.default.createElement(ReactButton, {
        mxEvent: mxEvent,
        reactions: reactions
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ReactionsRow",
      role: "toolbar",
      "aria-label": (0, _languageHandler._t)("Reactions")
    }, items, showAllButton, addReactionButton);
  }

}

exports.default = ReactionsRow;
(0, _defineProperty2.default)(ReactionsRow, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfSVRFTVNfV0hFTl9MSU1JVEVEIiwiUmVhY3RCdXR0b24iLCJteEV2ZW50IiwicmVhY3Rpb25zIiwibWVudURpc3BsYXllZCIsImJ1dHRvbiIsIm9wZW5NZW51IiwiY2xvc2VNZW51IiwidXNlQ29udGV4dE1lbnUiLCJjb250ZXh0TWVudSIsImJ1dHRvblJlY3QiLCJjdXJyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiYWJvdmVMZWZ0T2YiLCJjbGFzc05hbWVzIiwibXhfUmVhY3Rpb25zUm93X2FkZFJlYWN0aW9uQnV0dG9uX2FjdGl2ZSIsIl90IiwiZSIsInByZXZlbnREZWZhdWx0IiwiUmVhY3Rpb25zUm93IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJmb3JjZVVwZGF0ZSIsInNldFN0YXRlIiwibXlSZWFjdGlvbnMiLCJnZXRNeVJlYWN0aW9ucyIsInNob3dBbGwiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiaXNCZWluZ0RlY3J5cHRlZCIsInNob3VsZEF0dGVtcHREZWNyeXB0aW9uIiwib25jZSIsIk1hdHJpeEV2ZW50RXZlbnQiLCJEZWNyeXB0ZWQiLCJvbkRlY3J5cHRlZCIsIm9uIiwiUmVsYXRpb25zRXZlbnQiLCJBZGQiLCJvblJlYWN0aW9uc0NoYW5nZSIsIlJlbW92ZSIsIlJlZGFjdGlvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwidXNlcklkIiwicm9vbSIsImNsaWVudCIsImdldFVzZXJJZCIsImdldEFubm90YXRpb25zQnlTZW5kZXIiLCJ2YWx1ZXMiLCJyZW5kZXIiLCJpc0NvbnRlbnRBY3Rpb25hYmxlIiwiaXRlbXMiLCJnZXRTb3J0ZWRBbm5vdGF0aW9uc0J5S2V5IiwibWFwIiwiY29udGVudCIsImV2ZW50cyIsImNvdW50Iiwic2l6ZSIsIm15UmVhY3Rpb25FdmVudCIsImZpbmQiLCJpc1JlZGFjdGVkIiwiZ2V0UmVsYXRpb24iLCJrZXkiLCJjYW5SZWFjdCIsImNhblNlbGZSZWRhY3QiLCJmaWx0ZXIiLCJpdGVtIiwibGVuZ3RoIiwic2hvd0FsbEJ1dHRvbiIsInNsaWNlIiwib25TaG93QWxsQ2xpY2siLCJhZGRSZWFjdGlvbkJ1dHRvbiIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvUmVhY3Rpb25zUm93LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQsIE1hdHJpeEV2ZW50RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSZWxhdGlvbnMsIFJlbGF0aW9uc0V2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yZWxhdGlvbnNcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgaXNDb250ZW50QWN0aW9uYWJsZSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0V2ZW50VXRpbHMnO1xuaW1wb3J0IHsgQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L0NvbnRleHRNZW51VG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IENvbnRleHRNZW51LCB7IGFib3ZlTGVmdE9mLCB1c2VDb250ZXh0TWVudSB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgUmVhY3Rpb25QaWNrZXIgZnJvbSBcIi4uL2Vtb2ppcGlja2VyL1JlYWN0aW9uUGlja2VyXCI7XG5pbXBvcnQgUmVhY3Rpb25zUm93QnV0dG9uIGZyb20gXCIuL1JlYWN0aW9uc1Jvd0J1dHRvblwiO1xuaW1wb3J0IFJvb21Db250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcblxuLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIHJlYWN0aW9ucyB0byBpbml0aWFsbHkgc2hvdyBvbiBhIG1lc3NhZ2UuXG5jb25zdCBNQVhfSVRFTVNfV0hFTl9MSU1JVEVEID0gODtcblxuY29uc3QgUmVhY3RCdXR0b24gPSAoeyBteEV2ZW50LCByZWFjdGlvbnMgfTogSVByb3BzKSA9PiB7XG4gICAgY29uc3QgW21lbnVEaXNwbGF5ZWQsIGJ1dHRvbiwgb3Blbk1lbnUsIGNsb3NlTWVudV0gPSB1c2VDb250ZXh0TWVudSgpO1xuXG4gICAgbGV0IGNvbnRleHRNZW51O1xuICAgIGlmIChtZW51RGlzcGxheWVkKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvblJlY3QgPSBidXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29udGV4dE1lbnUgPSA8Q29udGV4dE1lbnUgey4uLmFib3ZlTGVmdE9mKGJ1dHRvblJlY3QpfSBvbkZpbmlzaGVkPXtjbG9zZU1lbnV9IG1hbmFnZWQ9e2ZhbHNlfT5cbiAgICAgICAgICAgIDxSZWFjdGlvblBpY2tlciBteEV2ZW50PXtteEV2ZW50fSByZWFjdGlvbnM9e3JlYWN0aW9uc30gb25GaW5pc2hlZD17Y2xvc2VNZW51fSAvPlxuICAgICAgICA8L0NvbnRleHRNZW51PjtcbiAgICB9XG5cbiAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9SZWFjdGlvbnNSb3dfYWRkUmVhY3Rpb25CdXR0b25cIiwge1xuICAgICAgICAgICAgICAgIG14X1JlYWN0aW9uc1Jvd19hZGRSZWFjdGlvbkJ1dHRvbl9hY3RpdmU6IG1lbnVEaXNwbGF5ZWQsXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIHRpdGxlPXtfdChcIkFkZCByZWFjdGlvblwiKX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29wZW5NZW51fVxuICAgICAgICAgICAgb25Db250ZXh0TWVudT17ZSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIG9wZW5NZW51KCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgaXNFeHBhbmRlZD17bWVudURpc3BsYXllZH1cbiAgICAgICAgICAgIGlucHV0UmVmPXtidXR0b259XG4gICAgICAgIC8+XG5cbiAgICAgICAgeyBjb250ZXh0TWVudSB9XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG59O1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyBUaGUgZXZlbnQgd2UncmUgZGlzcGxheWluZyByZWFjdGlvbnMgZm9yXG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgLy8gVGhlIFJlbGF0aW9ucyBtb2RlbCBmcm9tIHRoZSBKUyBTREsgZm9yIHJlYWN0aW9ucyB0byBgbXhFdmVudGBcbiAgICByZWFjdGlvbnM/OiBSZWxhdGlvbnM7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIG15UmVhY3Rpb25zOiBNYXRyaXhFdmVudFtdO1xuICAgIHNob3dBbGw6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWN0aW9uc1JvdyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBSb29tQ29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzLCBjb250ZXh0OiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgUm9vbUNvbnRleHQ+KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbXlSZWFjdGlvbnM6IHRoaXMuZ2V0TXlSZWFjdGlvbnMoKSxcbiAgICAgICAgICAgIHNob3dBbGw6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCB7IG14RXZlbnQsIHJlYWN0aW9ucyB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBpZiAobXhFdmVudC5pc0JlaW5nRGVjcnlwdGVkKCkgfHwgbXhFdmVudC5zaG91bGRBdHRlbXB0RGVjcnlwdGlvbigpKSB7XG4gICAgICAgICAgICBteEV2ZW50Lm9uY2UoTWF0cml4RXZlbnRFdmVudC5EZWNyeXB0ZWQsIHRoaXMub25EZWNyeXB0ZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlYWN0aW9ucykge1xuICAgICAgICAgICAgcmVhY3Rpb25zLm9uKFJlbGF0aW9uc0V2ZW50LkFkZCwgdGhpcy5vblJlYWN0aW9uc0NoYW5nZSk7XG4gICAgICAgICAgICByZWFjdGlvbnMub24oUmVsYXRpb25zRXZlbnQuUmVtb3ZlLCB0aGlzLm9uUmVhY3Rpb25zQ2hhbmdlKTtcbiAgICAgICAgICAgIHJlYWN0aW9ucy5vbihSZWxhdGlvbnNFdmVudC5SZWRhY3Rpb24sIHRoaXMub25SZWFjdGlvbnNDaGFuZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHsgbXhFdmVudCwgcmVhY3Rpb25zIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIG14RXZlbnQub2ZmKE1hdHJpeEV2ZW50RXZlbnQuRGVjcnlwdGVkLCB0aGlzLm9uRGVjcnlwdGVkKTtcblxuICAgICAgICBpZiAocmVhY3Rpb25zKSB7XG4gICAgICAgICAgICByZWFjdGlvbnMub2ZmKFJlbGF0aW9uc0V2ZW50LkFkZCwgdGhpcy5vblJlYWN0aW9uc0NoYW5nZSk7XG4gICAgICAgICAgICByZWFjdGlvbnMub2ZmKFJlbGF0aW9uc0V2ZW50LlJlbW92ZSwgdGhpcy5vblJlYWN0aW9uc0NoYW5nZSk7XG4gICAgICAgICAgICByZWFjdGlvbnMub2ZmKFJlbGF0aW9uc0V2ZW50LlJlZGFjdGlvbiwgdGhpcy5vblJlYWN0aW9uc0NoYW5nZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgaWYgKHByZXZQcm9wcy5yZWFjdGlvbnMgIT09IHRoaXMucHJvcHMucmVhY3Rpb25zKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnJlYWN0aW9ucy5vbihSZWxhdGlvbnNFdmVudC5BZGQsIHRoaXMub25SZWFjdGlvbnNDaGFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yZWFjdGlvbnMub24oUmVsYXRpb25zRXZlbnQuUmVtb3ZlLCB0aGlzLm9uUmVhY3Rpb25zQ2hhbmdlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucmVhY3Rpb25zLm9uKFJlbGF0aW9uc0V2ZW50LlJlZGFjdGlvbiwgdGhpcy5vblJlYWN0aW9uc0NoYW5nZSk7XG4gICAgICAgICAgICB0aGlzLm9uUmVhY3Rpb25zQ2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGVjcnlwdGVkID0gKCkgPT4ge1xuICAgICAgICAvLyBEZWNyeXB0aW9uIGNoYW5nZXMgd2hldGhlciB0aGUgZXZlbnQgaXMgYWN0aW9uYWJsZVxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWFjdGlvbnNDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIC8vIFRPRE86IENhbGwgYG9uSGVpZ2h0Q2hhbmdlZGAgYXMgbmVlZGVkXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbXlSZWFjdGlvbnM6IHRoaXMuZ2V0TXlSZWFjdGlvbnMoKSxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFVzaW5nIGBmb3JjZVVwZGF0ZWAgZm9yIHRoZSBtb21lbnQsIHNpbmNlIHdlIGtub3cgdGhlIG92ZXJhbGwgc2V0IG9mIHJlYWN0aW9uc1xuICAgICAgICAvLyBoYXMgY2hhbmdlZCAodGhpcyBpcyB0cmlnZ2VyZWQgYnkgZXZlbnRzIGZvciB0aGF0IHB1cnBvc2Ugb25seSkgYW5kXG4gICAgICAgIC8vIGBQdXJlQ29tcG9uZW50YHMgc2hhbGxvdyBzdGF0ZSAvIHByb3BzIGNvbXBhcmUgd291bGQgb3RoZXJ3aXNlIGZpbHRlciB0aGlzIG91dC5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldE15UmVhY3Rpb25zKCkge1xuICAgICAgICBjb25zdCByZWFjdGlvbnMgPSB0aGlzLnByb3BzLnJlYWN0aW9ucztcbiAgICAgICAgaWYgKCFyZWFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuY29udGV4dC5yb29tLmNsaWVudC5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgbXlSZWFjdGlvbnMgPSByZWFjdGlvbnMuZ2V0QW5ub3RhdGlvbnNCeVNlbmRlcigpW3VzZXJJZF07XG4gICAgICAgIGlmICghbXlSZWFjdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbLi4ubXlSZWFjdGlvbnMudmFsdWVzKCldO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TaG93QWxsQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd0FsbDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyBteEV2ZW50LCByZWFjdGlvbnMgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHsgbXlSZWFjdGlvbnMsIHNob3dBbGwgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgaWYgKCFyZWFjdGlvbnMgfHwgIWlzQ29udGVudEFjdGlvbmFibGUobXhFdmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGl0ZW1zID0gcmVhY3Rpb25zLmdldFNvcnRlZEFubm90YXRpb25zQnlLZXkoKS5tYXAoKFtjb250ZW50LCBldmVudHNdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb3VudCA9IGV2ZW50cy5zaXplO1xuICAgICAgICAgICAgaWYgKCFjb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbXlSZWFjdGlvbkV2ZW50ID0gbXlSZWFjdGlvbnMgJiYgbXlSZWFjdGlvbnMuZmluZChteEV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobXhFdmVudC5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbXhFdmVudC5nZXRSZWxhdGlvbigpLmtleSA9PT0gY29udGVudDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIDxSZWFjdGlvbnNSb3dCdXR0b25cbiAgICAgICAgICAgICAgICBrZXk9e2NvbnRlbnR9XG4gICAgICAgICAgICAgICAgY29udGVudD17Y29udGVudH1cbiAgICAgICAgICAgICAgICBjb3VudD17Y291bnR9XG4gICAgICAgICAgICAgICAgbXhFdmVudD17bXhFdmVudH1cbiAgICAgICAgICAgICAgICByZWFjdGlvbkV2ZW50cz17ZXZlbnRzfVxuICAgICAgICAgICAgICAgIG15UmVhY3Rpb25FdmVudD17bXlSZWFjdGlvbkV2ZW50fVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuY29udGV4dC5jYW5SZWFjdCB8fFxuICAgICAgICAgICAgICAgICAgICAobXlSZWFjdGlvbkV2ZW50ICYmICFteVJlYWN0aW9uRXZlbnQuaXNSZWRhY3RlZCgpICYmICF0aGlzLmNvbnRleHQuY2FuU2VsZlJlZGFjdClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSkuZmlsdGVyKGl0ZW0gPT4gISFpdGVtKTtcblxuICAgICAgICBpZiAoIWl0ZW1zLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8gU2hvdyB0aGUgZmlyc3QgTUFYX0lURU1TIGlmIHRoZXJlIGFyZSBNQVhfSVRFTVMgKyAxIG9yIG1vcmUgaXRlbXMuXG4gICAgICAgIC8vIFRoZSBcIisgMVwiIGVuc3VyZSB0aGF0IHRoZSBcInNob3cgYWxsXCIgcmV2ZWFscyBzb21ldGhpbmcgdGhhdCB0YWtlcyB1cFxuICAgICAgICAvLyBtb3JlIHNwYWNlIHRoYW4gdGhlIGJ1dHRvbiBpdHNlbGYuXG4gICAgICAgIGxldCBzaG93QWxsQnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKChpdGVtcy5sZW5ndGggPiBNQVhfSVRFTVNfV0hFTl9MSU1JVEVEICsgMSkgJiYgIXNob3dBbGwpIHtcbiAgICAgICAgICAgIGl0ZW1zID0gaXRlbXMuc2xpY2UoMCwgTUFYX0lURU1TX1dIRU5fTElNSVRFRCk7XG4gICAgICAgICAgICBzaG93QWxsQnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBraW5kPVwibGlua19pbmxpbmVcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1JlYWN0aW9uc1Jvd19zaG93QWxsXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2hvd0FsbENsaWNrfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJTaG93IGFsbFwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFkZFJlYWN0aW9uQnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dC5jYW5SZWFjdCkge1xuICAgICAgICAgICAgYWRkUmVhY3Rpb25CdXR0b24gPSA8UmVhY3RCdXR0b24gbXhFdmVudD17bXhFdmVudH0gcmVhY3Rpb25zPXtyZWFjdGlvbnN9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1JlYWN0aW9uc1Jvd1wiXG4gICAgICAgICAgICByb2xlPVwidG9vbGJhclwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIlJlYWN0aW9uc1wiKX1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBpdGVtcyB9XG4gICAgICAgICAgICB7IHNob3dBbGxCdXR0b24gfVxuICAgICAgICAgICAgeyBhZGRSZWFjdGlvbkJ1dHRvbiB9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFnQkE7QUFDQSxNQUFNQSxzQkFBc0IsR0FBRyxDQUEvQjs7QUFFQSxNQUFNQyxXQUFXLEdBQUcsUUFBb0M7RUFBQSxJQUFuQztJQUFFQyxPQUFGO0lBQVdDO0VBQVgsQ0FBbUM7RUFDcEQsTUFBTSxDQUFDQyxhQUFELEVBQWdCQyxNQUFoQixFQUF3QkMsUUFBeEIsRUFBa0NDLFNBQWxDLElBQStDLElBQUFDLDJCQUFBLEdBQXJEO0VBRUEsSUFBSUMsV0FBSjs7RUFDQSxJQUFJTCxhQUFKLEVBQW1CO0lBQ2YsTUFBTU0sVUFBVSxHQUFHTCxNQUFNLENBQUNNLE9BQVAsQ0FBZUMscUJBQWYsRUFBbkI7SUFDQUgsV0FBVyxnQkFBRyw2QkFBQyxvQkFBRCw2QkFBaUIsSUFBQUksd0JBQUEsRUFBWUgsVUFBWixDQUFqQjtNQUEwQyxVQUFVLEVBQUVILFNBQXREO01BQWlFLE9BQU8sRUFBRTtJQUExRSxpQkFDViw2QkFBQyx1QkFBRDtNQUFn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