"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _DateUtils = require("../../../DateUtils");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _RoomTile = require("../rooms/RoomTile");

var _ContextMenu = require("../../structures/ContextMenu");

var _IconizedContextMenu = _interopRequireWildcard(require("../context_menus/IconizedContextMenu"));

var _JumpToDatePicker = _interopRequireDefault(require("./JumpToDatePicker"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2018 Michael Telatynski <7t3chguy@gmail.com>
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
function getDaysArray() {
  return [(0, _languageHandler._t)('Sunday'), (0, _languageHandler._t)('Monday'), (0, _languageHandler._t)('Tuesday'), (0, _languageHandler._t)('Wednesday'), (0, _languageHandler._t)('Thursday'), (0, _languageHandler._t)('Friday'), (0, _languageHandler._t)('Saturday')];
}

class DateSeparator extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "settingWatcherRef", null);
    (0, _defineProperty2.default)(this, "onContextMenuOpenClick", e => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target;
      this.setState({
        contextMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenuCloseClick", () => {
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "closeMenu", () => {
      this.setState({
        contextMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "pickDate", async inputTimestamp => {
      const unixTimestamp = new Date(inputTimestamp).getTime();

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        const roomId = this.props.roomId;
        const {
          event_id: eventId,
          origin_server_ts: originServerTs
        } = await cli.timestampToEvent(roomId, unixTimestamp, _eventTimeline.Direction.Forward);

        _logger.logger.log(`/timestamp_to_event: ` + `found ${eventId} (${originServerTs}) for timestamp=${unixTimestamp} (looking forward)`);

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          event_id: eventId,
          highlighted: true,
          room_id: roomId,
          metricsTrigger: undefined // room doesn't change

        });
      } catch (e) {
        const code = e.errcode || e.statusCode; // only show the dialog if failing for something other than a network error
        // (e.g. no errcode or statusCode) as in that case the redactions end up in the
        // detached queue and we show the room status bar to allow retry

        if (typeof code !== "undefined") {
          // display error message stating you couldn't delete this.
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)('Error'),
            description: (0, _languageHandler._t)('Unable to find event at that date. (%(code)s)', {
              code
            })
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "onLastWeekClicked", () => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      this.pickDate(date);
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onLastMonthClicked", () => {
      const date = new Date(); // Month numbers are 0 - 11 and `setMonth` handles the negative rollover

      date.setMonth(date.getMonth() - 1, 1);
      this.pickDate(date);
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onTheBeginningClicked", () => {
      const date = new Date(0);
      this.pickDate(date);
      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onDatePicked", dateString => {
      this.pickDate(dateString);
      this.closeMenu();
    });
    this.state = {
      jumpToDateEnabled: _SettingsStore.default.getValue("feature_jump_to_date")
    }; // We're using a watcher so the date headers in the timeline are updated
    // when the lab setting is toggled.

    this.settingWatcherRef = _SettingsStore.default.watchSetting("feature_jump_to_date", null, (settingName, roomId, level, newValAtLevel, newVal) => {
      this.setState({
        jumpToDateEnabled: newVal
      });
    });
  }

  componentWillUnmount() {
    _SettingsStore.default.unwatchSetting(this.settingWatcherRef);
  }

  getLabel() {
    const date = new Date(this.props.ts);
    const disableRelativeTimestamps = !_SettingsStore.default.getValue(_UIFeature.UIFeature.TimelineEnableRelativeDates); // During the time the archive is being viewed, a specific day might not make sense, so we return the full date

    if (this.props.forExport || disableRelativeTimestamps) return (0, _DateUtils.formatFullDateNoTime)(date);
    const today = new Date();
    const yesterday = new Date();
    const days = getDaysArray();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return (0, _languageHandler._t)('Today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return (0, _languageHandler._t)('Yesterday');
    } else if (today.getTime() - date.getTime() < 6 * 24 * 60 * 60 * 1000) {
      return days[date.getDay()];
    } else {
      return (0, _DateUtils.formatFullDateNoTime)(date);
    }
  }

  renderJumpToDateMenu() {
    let contextMenu;

    if (this.state.contextMenuPosition) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, (0, _RoomTile.contextMenuBelow)(this.state.contextMenuPosition), {
        onFinished: this.onContextMenuCloseClick
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        first: true
      }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("Last week"),
        onClick: this.onLastWeekClicked
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("Last month"),
        onClick: this.onLastMonthClicked
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("The beginning of the room"),
        onClick: this.onTheBeginningClicked
      })), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, /*#__PURE__*/_react.default.createElement(_JumpToDatePicker.default, {
        ts: this.props.ts,
        onDatePicked: this.onDatePicked
      })));
    }

    return /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
      className: "mx_DateSeparator_jumpToDateMenu",
      onClick: this.onContextMenuOpenClick,
      isExpanded: !!this.state.contextMenuPosition,
      title: (0, _languageHandler._t)("Jump to date")
    }, /*#__PURE__*/_react.default.createElement("h2", {
      "aria-hidden": "true"
    }, this.getLabel()), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DateSeparator_chevron"
    }), contextMenu);
  }

  render() {
    const label = this.getLabel();
    let dateHeaderContent;

    if (this.state.jumpToDateEnabled) {
      dateHeaderContent = this.renderJumpToDateMenu();
    } else {
      dateHeaderContent = /*#__PURE__*/_react.default.createElement("h2", {
        "aria-hidden": "true"
      }, label);
    } // ARIA treats <hr/>s as separators, here we abuse them slightly so manually treat this entire thing as one
    // tab-index=-1 to allow it to be focusable but do not add tab stop for it, primarily for screen readers


    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DateSeparator",
      role: "separator",
      tabIndex: -1,
      "aria-label": label
    }, /*#__PURE__*/_react.default.createElement("hr", {
      role: "none"
    }), dateHeaderContent, /*#__PURE__*/_react.default.createElement("hr", {
      role: "none"
    }));
  }

}

exports.default = DateSeparator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXREYXlzQXJyYXkiLCJfdCIsIkRhdGVTZXBhcmF0b3IiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwidGFyZ2V0Iiwic2V0U3RhdGUiLCJjb250ZXh0TWVudVBvc2l0aW9uIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2xvc2VNZW51IiwiaW5wdXRUaW1lc3RhbXAiLCJ1bml4VGltZXN0YW1wIiwiRGF0ZSIsImdldFRpbWUiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyb29tSWQiLCJldmVudF9pZCIsImV2ZW50SWQiLCJvcmlnaW5fc2VydmVyX3RzIiwib3JpZ2luU2VydmVyVHMiLCJ0aW1lc3RhbXBUb0V2ZW50IiwiRGlyZWN0aW9uIiwiRm9yd2FyZCIsImxvZ2dlciIsImxvZyIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1Jvb20iLCJoaWdobGlnaHRlZCIsInJvb21faWQiLCJtZXRyaWNzVHJpZ2dlciIsInVuZGVmaW5lZCIsImNvZGUiLCJlcnJjb2RlIiwic3RhdHVzQ29kZSIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiZGF0ZSIsInNldERhdGUiLCJnZXREYXRlIiwicGlja0RhdGUiLCJzZXRNb250aCIsImdldE1vbnRoIiwiZGF0ZVN0cmluZyIsInN0YXRlIiwianVtcFRvRGF0ZUVuYWJsZWQiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJzZXR0aW5nV2F0Y2hlclJlZiIsIndhdGNoU2V0dGluZyIsInNldHRpbmdOYW1lIiwibGV2ZWwiLCJuZXdWYWxBdExldmVsIiwibmV3VmFsIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bndhdGNoU2V0dGluZyIsImdldExhYmVsIiwidHMiLCJkaXNhYmxlUmVsYXRpdmVUaW1lc3RhbXBzIiwiVUlGZWF0dXJlIiwiVGltZWxpbmVFbmFibGVSZWxhdGl2ZURhdGVzIiwiZm9yRXhwb3J0IiwiZm9ybWF0RnVsbERhdGVOb1RpbWUiLCJ0b2RheSIsInllc3RlcmRheSIsImRheXMiLCJ0b0RhdGVTdHJpbmciLCJnZXREYXkiLCJyZW5kZXJKdW1wVG9EYXRlTWVudSIsImNvbnRleHRNZW51IiwiY29udGV4dE1lbnVCZWxvdyIsIm9uQ29udGV4dE1lbnVDbG9zZUNsaWNrIiwib25MYXN0V2Vla0NsaWNrZWQiLCJvbkxhc3RNb250aENsaWNrZWQiLCJvblRoZUJlZ2lubmluZ0NsaWNrZWQiLCJvbkRhdGVQaWNrZWQiLCJvbkNvbnRleHRNZW51T3BlbkNsaWNrIiwicmVuZGVyIiwibGFiZWwiLCJkYXRlSGVhZGVyQ29udGVudCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL0RhdGVTZXBhcmF0b3IudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDE1IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEaXJlY3Rpb24gfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQtdGltZWxpbmUnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBmb3JtYXRGdWxsRGF0ZU5vVGltZSB9IGZyb20gJy4uLy4uLy4uL0RhdGVVdGlscyc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gJy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IHsgVUlGZWF0dXJlIH0gZnJvbSAnLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSAnLi4vZGlhbG9ncy9FcnJvckRpYWxvZyc7XG5pbXBvcnQgeyBjb250ZXh0TWVudUJlbG93IH0gZnJvbSAnLi4vcm9vbXMvUm9vbVRpbGUnO1xuaW1wb3J0IHsgQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uIH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCBJY29uaXplZENvbnRleHRNZW51LCB7XG4gICAgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbixcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCxcbn0gZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IEp1bXBUb0RhdGVQaWNrZXIgZnJvbSAnLi9KdW1wVG9EYXRlUGlja2VyJztcbmltcG9ydCB7IFZpZXdSb29tUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuXG5mdW5jdGlvbiBnZXREYXlzQXJyYXkoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBbXG4gICAgICAgIF90KCdTdW5kYXknKSxcbiAgICAgICAgX3QoJ01vbmRheScpLFxuICAgICAgICBfdCgnVHVlc2RheScpLFxuICAgICAgICBfdCgnV2VkbmVzZGF5JyksXG4gICAgICAgIF90KCdUaHVyc2RheScpLFxuICAgICAgICBfdCgnRnJpZGF5JyksXG4gICAgICAgIF90KCdTYXR1cmRheScpLFxuICAgIF07XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xuICAgIHRzOiBudW1iZXI7XG4gICAgZm9yRXhwb3J0PzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgY29udGV4dE1lbnVQb3NpdGlvbj86IERPTVJlY3Q7XG4gICAganVtcFRvRGF0ZUVuYWJsZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGVTZXBhcmF0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHNldHRpbmdXYXRjaGVyUmVmID0gbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGp1bXBUb0RhdGVFbmFibGVkOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9qdW1wX3RvX2RhdGVcIiksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gV2UncmUgdXNpbmcgYSB3YXRjaGVyIHNvIHRoZSBkYXRlIGhlYWRlcnMgaW4gdGhlIHRpbWVsaW5lIGFyZSB1cGRhdGVkXG4gICAgICAgIC8vIHdoZW4gdGhlIGxhYiBzZXR0aW5nIGlzIHRvZ2dsZWQuXG4gICAgICAgIHRoaXMuc2V0dGluZ1dhdGNoZXJSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcbiAgICAgICAgICAgIFwiZmVhdHVyZV9qdW1wX3RvX2RhdGVcIixcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAoc2V0dGluZ05hbWUsIHJvb21JZCwgbGV2ZWwsIG5ld1ZhbEF0TGV2ZWwsIG5ld1ZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBqdW1wVG9EYXRlRW5hYmxlZDogbmV3VmFsIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnNldHRpbmdXYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnVPcGVuQ2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29udGV4dE1lbnVQb3NpdGlvbjogdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnVDbG9zZUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNsb3NlTWVudSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRMYWJlbCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodGhpcy5wcm9wcy50cyk7XG4gICAgICAgIGNvbnN0IGRpc2FibGVSZWxhdGl2ZVRpbWVzdGFtcHMgPSAhU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuVGltZWxpbmVFbmFibGVSZWxhdGl2ZURhdGVzKTtcblxuICAgICAgICAvLyBEdXJpbmcgdGhlIHRpbWUgdGhlIGFyY2hpdmUgaXMgYmVpbmcgdmlld2VkLCBhIHNwZWNpZmljIGRheSBtaWdodCBub3QgbWFrZSBzZW5zZSwgc28gd2UgcmV0dXJuIHRoZSBmdWxsIGRhdGVcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9yRXhwb3J0IHx8IGRpc2FibGVSZWxhdGl2ZVRpbWVzdGFtcHMpIHJldHVybiBmb3JtYXRGdWxsRGF0ZU5vVGltZShkYXRlKTtcblxuICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IHllc3RlcmRheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IGRheXMgPSBnZXREYXlzQXJyYXkoKTtcbiAgICAgICAgeWVzdGVyZGF5LnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpIC0gMSk7XG5cbiAgICAgICAgaWYgKGRhdGUudG9EYXRlU3RyaW5nKCkgPT09IHRvZGF5LnRvRGF0ZVN0cmluZygpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJ1RvZGF5Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0ZS50b0RhdGVTdHJpbmcoKSA9PT0geWVzdGVyZGF5LnRvRGF0ZVN0cmluZygpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJ1llc3RlcmRheScpO1xuICAgICAgICB9IGVsc2UgaWYgKHRvZGF5LmdldFRpbWUoKSAtIGRhdGUuZ2V0VGltZSgpIDwgNiAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgIHJldHVybiBkYXlzW2RhdGUuZ2V0RGF5KCldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdEZ1bGxEYXRlTm9UaW1lKGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwaWNrRGF0ZSA9IGFzeW5jIChpbnB1dFRpbWVzdGFtcCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCB1bml4VGltZXN0YW1wID0gbmV3IERhdGUoaW5wdXRUaW1lc3RhbXApLmdldFRpbWUoKTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnByb3BzLnJvb21JZDtcbiAgICAgICAgICAgIGNvbnN0IHsgZXZlbnRfaWQ6IGV2ZW50SWQsIG9yaWdpbl9zZXJ2ZXJfdHM6IG9yaWdpblNlcnZlclRzIH0gPSBhd2FpdCBjbGkudGltZXN0YW1wVG9FdmVudChcbiAgICAgICAgICAgICAgICByb29tSWQsXG4gICAgICAgICAgICAgICAgdW5peFRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICBEaXJlY3Rpb24uRm9yd2FyZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgIGAvdGltZXN0YW1wX3RvX2V2ZW50OiBgICtcbiAgICAgICAgICAgICAgICBgZm91bmQgJHtldmVudElkfSAoJHtvcmlnaW5TZXJ2ZXJUc30pIGZvciB0aW1lc3RhbXA9JHt1bml4VGltZXN0YW1wfSAobG9va2luZyBmb3J3YXJkKWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgZXZlbnRfaWQ6IGV2ZW50SWQsXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zdCBjb2RlID0gZS5lcnJjb2RlIHx8IGUuc3RhdHVzQ29kZTtcbiAgICAgICAgICAgIC8vIG9ubHkgc2hvdyB0aGUgZGlhbG9nIGlmIGZhaWxpbmcgZm9yIHNvbWV0aGluZyBvdGhlciB0aGFuIGEgbmV0d29yayBlcnJvclxuICAgICAgICAgICAgLy8gKGUuZy4gbm8gZXJyY29kZSBvciBzdGF0dXNDb2RlKSBhcyBpbiB0aGF0IGNhc2UgdGhlIHJlZGFjdGlvbnMgZW5kIHVwIGluIHRoZVxuICAgICAgICAgICAgLy8gZGV0YWNoZWQgcXVldWUgYW5kIHdlIHNob3cgdGhlIHJvb20gc3RhdHVzIGJhciB0byBhbGxvdyByZXRyeVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb2RlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgLy8gZGlzcGxheSBlcnJvciBtZXNzYWdlIHN0YXRpbmcgeW91IGNvdWxkbid0IGRlbGV0ZSB0aGlzLlxuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yJyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnVW5hYmxlIHRvIGZpbmQgZXZlbnQgYXQgdGhhdCBkYXRlLiAoJShjb2RlKXMpJywgeyBjb2RlIH0pLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25MYXN0V2Vla0NsaWNrZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSA3KTtcbiAgICAgICAgdGhpcy5waWNrRGF0ZShkYXRlKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkxhc3RNb250aENsaWNrZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAvLyBNb250aCBudW1iZXJzIGFyZSAwIC0gMTEgYW5kIGBzZXRNb250aGAgaGFuZGxlcyB0aGUgbmVnYXRpdmUgcm9sbG92ZXJcbiAgICAgICAgZGF0ZS5zZXRNb250aChkYXRlLmdldE1vbnRoKCkgLSAxLCAxKTtcbiAgICAgICAgdGhpcy5waWNrRGF0ZShkYXRlKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblRoZUJlZ2lubmluZ0NsaWNrZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgICAgICAgdGhpcy5waWNrRGF0ZShkYXRlKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRhdGVQaWNrZWQgPSAoZGF0ZVN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnBpY2tEYXRlKGRhdGVTdHJpbmcpO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckp1bXBUb0RhdGVNZW51KCk6IFJlYWN0LlJlYWN0RWxlbWVudCB7XG4gICAgICAgIGxldCBjb250ZXh0TWVudTogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51ID0gPEljb25pemVkQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICB7Li4uY29udGV4dE1lbnVCZWxvdyh0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24pfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25Db250ZXh0TWVudUNsb3NlQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IGZpcnN0PlxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTGFzdCB3ZWVrXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkxhc3RXZWVrQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkxhc3QgbW9udGhcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uTGFzdE1vbnRoQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlRoZSBiZWdpbm5pbmcgb2YgdGhlIHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uVGhlQmVnaW5uaW5nQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuXG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgICAgICA8SnVtcFRvRGF0ZVBpY2tlciB0cz17dGhpcy5wcm9wcy50c30gb25EYXRlUGlja2VkPXt0aGlzLm9uRGF0ZVBpY2tlZH0gLz5cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRGF0ZVNlcGFyYXRvcl9qdW1wVG9EYXRlTWVudVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNvbnRleHRNZW51T3BlbkNsaWNrfVxuICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9eyEhdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9ufVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkp1bXAgdG8gZGF0ZVwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8aDIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+eyB0aGlzLmdldExhYmVsKCkgfTwvaDI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EYXRlU2VwYXJhdG9yX2NoZXZyb25cIiAvPlxuICAgICAgICAgICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgICAgICAgICAgPC9Db250ZXh0TWVudVRvb2x0aXBCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0TGFiZWwoKTtcblxuICAgICAgICBsZXQgZGF0ZUhlYWRlckNvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmp1bXBUb0RhdGVFbmFibGVkKSB7XG4gICAgICAgICAgICBkYXRlSGVhZGVyQ29udGVudCA9IHRoaXMucmVuZGVySnVtcFRvRGF0ZU1lbnUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGVIZWFkZXJDb250ZW50ID0gPGgyIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPnsgbGFiZWwgfTwvaDI+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQVJJQSB0cmVhdHMgPGhyLz5zIGFzIHNlcGFyYXRvcnMsIGhlcmUgd2UgYWJ1c2UgdGhlbSBzbGlnaHRseSBzbyBtYW51YWxseSB0cmVhdCB0aGlzIGVudGlyZSB0aGluZyBhcyBvbmVcbiAgICAgICAgLy8gdGFiLWluZGV4PS0xIHRvIGFsbG93IGl0IHRvIGJlIGZvY3VzYWJsZSBidXQgZG8gbm90IGFkZCB0YWIgc3RvcCBmb3IgaXQsIHByaW1hcmlseSBmb3Igc2NyZWVuIHJlYWRlcnNcbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfRGF0ZVNlcGFyYXRvclwiIHJvbGU9XCJzZXBhcmF0b3JcIiB0YWJJbmRleD17LTF9IGFyaWEtbGFiZWw9e2xhYmVsfT5cbiAgICAgICAgICAgIDxociByb2xlPVwibm9uZVwiIC8+XG4gICAgICAgICAgICB7IGRhdGVIZWFkZXJDb250ZW50IH1cbiAgICAgICAgICAgIDxociByb2xlPVwibm9uZVwiIC8+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FB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