"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _NamespacedValue = require("matrix-js-sdk/src/NamespacedValue");

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd

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
const BUSY_PRESENCE_NAME = new _NamespacedValue.UnstableValue("busy", "org.matrix.msc3026.busy");

class PresenceLabel extends _react.default.Component {
  // Return duration as a string using appropriate time units
  // XXX: This would be better handled using a culture-aware library, but we don't use one yet.
  getDuration(time) {
    if (!time) return;
    const t = Math.round(time / 1000);
    const s = t % 60;
    const m = Math.round(t / 60) % 60;
    const h = Math.round(t / (60 * 60)) % 24;
    const d = Math.round(t / (60 * 60 * 24));

    if (t < 60) {
      if (t < 0) {
        return (0, _languageHandler._t)("%(duration)ss", {
          duration: 0
        });
      }

      return (0, _languageHandler._t)("%(duration)ss", {
        duration: s
      });
    }

    if (t < 60 * 60) {
      return (0, _languageHandler._t)("%(duration)sm", {
        duration: m
      });
    }

    if (t < 24 * 60 * 60) {
      return (0, _languageHandler._t)("%(duration)sh", {
        duration: h
      });
    }

    return (0, _languageHandler._t)("%(duration)sd", {
      duration: d
    });
  }

  getPrettyPresence(presence, activeAgo, currentlyActive) {
    // for busy presence, we ignore the 'currentlyActive' flag: they're busy whether
    // they're active or not. It can be set while the user is active in which case
    // the 'active ago' ends up being 0.
    if (BUSY_PRESENCE_NAME.matches(presence)) return (0, _languageHandler._t)("Busy");

    if (!currentlyActive && activeAgo !== undefined && activeAgo > 0) {
      const duration = this.getDuration(activeAgo);
      if (presence === "online") return (0, _languageHandler._t)("Online for %(duration)s", {
        duration: duration
      });
      if (presence === "unavailable") return (0, _languageHandler._t)("Idle for %(duration)s", {
        duration: duration
      }); // XXX: is this actually right?

      if (presence === "offline") return (0, _languageHandler._t)("Offline for %(duration)s", {
        duration: duration
      });
      return (0, _languageHandler._t)("Unknown for %(duration)s", {
        duration: duration
      });
    } else {
      if (presence === "online") return (0, _languageHandler._t)("Online");
      if (presence === "unavailable") return (0, _languageHandler._t)("Idle"); // XXX: is this actually right?

      if (presence === "offline") return (0, _languageHandler._t)("Offline");
      return (0, _languageHandler._t)("Unknown");
    }
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PresenceLabel"
    }, this.getPrettyPresence(this.props.presenceState, this.props.activeAgo, this.props.currentlyActive));
  }

}

exports.default = PresenceLabel;
(0, _defineProperty2.default)(PresenceLabel, "defaultProps", {
  activeAgo: -1,
  presenceState: null
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCVVNZX1BSRVNFTkNFX05BTUUiLCJVbnN0YWJsZVZhbHVlIiwiUHJlc2VuY2VMYWJlbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZ2V0RHVyYXRpb24iLCJ0aW1lIiwidCIsIk1hdGgiLCJyb3VuZCIsInMiLCJtIiwiaCIsImQiLCJfdCIsImR1cmF0aW9uIiwiZ2V0UHJldHR5UHJlc2VuY2UiLCJwcmVzZW5jZSIsImFjdGl2ZUFnbyIsImN1cnJlbnRseUFjdGl2ZSIsIm1hdGNoZXMiLCJ1bmRlZmluZWQiLCJyZW5kZXIiLCJwcm9wcyIsInByZXNlbmNlU3RhdGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9QcmVzZW5jZUxhYmVsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgVW5zdGFibGVWYWx1ZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9OYW1lc3BhY2VkVmFsdWVcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuXG5jb25zdCBCVVNZX1BSRVNFTkNFX05BTUUgPSBuZXcgVW5zdGFibGVWYWx1ZShcImJ1c3lcIiwgXCJvcmcubWF0cml4Lm1zYzMwMjYuYnVzeVwiKTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBhZ28gdGhpcyB1c2VyIHdhcyBsYXN0IGFjdGl2ZS5cbiAgICAvLyB6ZXJvID0gdW5rbm93blxuICAgIGFjdGl2ZUFnbz86IG51bWJlcjtcbiAgICAvLyBpZiB0cnVlLCBhY3RpdmVBZ28gaXMgYW4gYXBwcm94aW1hdGlvbiBhbmQgXCJOb3dcIiBzaG91bGRcbiAgICAvLyBiZSBzaG93biBpbnN0ZWFkXG4gICAgY3VycmVudGx5QWN0aXZlPzogYm9vbGVhbjtcbiAgICAvLyBvZmZsaW5lLCBvbmxpbmUsIGV0Y1xuICAgIHByZXNlbmNlU3RhdGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByZXNlbmNlTGFiZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgYWN0aXZlQWdvOiAtMSxcbiAgICAgICAgcHJlc2VuY2VTdGF0ZTogbnVsbCxcbiAgICB9O1xuXG4gICAgLy8gUmV0dXJuIGR1cmF0aW9uIGFzIGEgc3RyaW5nIHVzaW5nIGFwcHJvcHJpYXRlIHRpbWUgdW5pdHNcbiAgICAvLyBYWFg6IFRoaXMgd291bGQgYmUgYmV0dGVyIGhhbmRsZWQgdXNpbmcgYSBjdWx0dXJlLWF3YXJlIGxpYnJhcnksIGJ1dCB3ZSBkb24ndCB1c2Ugb25lIHlldC5cbiAgICBwcml2YXRlIGdldER1cmF0aW9uKHRpbWU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGltZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB0ID0gTWF0aC5yb3VuZCh0aW1lIC8gMTAwMCk7XG4gICAgICAgIGNvbnN0IHMgPSB0ICUgNjA7XG4gICAgICAgIGNvbnN0IG0gPSBNYXRoLnJvdW5kKHQgLyA2MCkgJSA2MDtcbiAgICAgICAgY29uc3QgaCA9IE1hdGgucm91bmQodCAvICg2MCAqIDYwKSkgJSAyNDtcbiAgICAgICAgY29uc3QgZCA9IE1hdGgucm91bmQodCAvICg2MCAqIDYwICogMjQpKTtcbiAgICAgICAgaWYgKHQgPCA2MCkge1xuICAgICAgICAgICAgaWYgKHQgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiJShkdXJhdGlvbilzc1wiLCB7IGR1cmF0aW9uOiAwIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShkdXJhdGlvbilzc1wiLCB7IGR1cmF0aW9uOiBzIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0IDwgNjAgKiA2MCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShkdXJhdGlvbilzbVwiLCB7IGR1cmF0aW9uOiBtIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0IDwgMjQgKiA2MCAqIDYwKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIlKGR1cmF0aW9uKXNoXCIsIHsgZHVyYXRpb246IGggfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90KFwiJShkdXJhdGlvbilzZFwiLCB7IGR1cmF0aW9uOiBkIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UHJldHR5UHJlc2VuY2UocHJlc2VuY2U6IHN0cmluZywgYWN0aXZlQWdvOiBudW1iZXIsIGN1cnJlbnRseUFjdGl2ZTogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgICAgIC8vIGZvciBidXN5IHByZXNlbmNlLCB3ZSBpZ25vcmUgdGhlICdjdXJyZW50bHlBY3RpdmUnIGZsYWc6IHRoZXkncmUgYnVzeSB3aGV0aGVyXG4gICAgICAgIC8vIHRoZXkncmUgYWN0aXZlIG9yIG5vdC4gSXQgY2FuIGJlIHNldCB3aGlsZSB0aGUgdXNlciBpcyBhY3RpdmUgaW4gd2hpY2ggY2FzZVxuICAgICAgICAvLyB0aGUgJ2FjdGl2ZSBhZ28nIGVuZHMgdXAgYmVpbmcgMC5cbiAgICAgICAgaWYgKEJVU1lfUFJFU0VOQ0VfTkFNRS5tYXRjaGVzKHByZXNlbmNlKSkgcmV0dXJuIF90KFwiQnVzeVwiKTtcblxuICAgICAgICBpZiAoIWN1cnJlbnRseUFjdGl2ZSAmJiBhY3RpdmVBZ28gIT09IHVuZGVmaW5lZCAmJiBhY3RpdmVBZ28gPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuZ2V0RHVyYXRpb24oYWN0aXZlQWdvKTtcbiAgICAgICAgICAgIGlmIChwcmVzZW5jZSA9PT0gXCJvbmxpbmVcIikgcmV0dXJuIF90KFwiT25saW5lIGZvciAlKGR1cmF0aW9uKXNcIiwgeyBkdXJhdGlvbjogZHVyYXRpb24gfSk7XG4gICAgICAgICAgICBpZiAocHJlc2VuY2UgPT09IFwidW5hdmFpbGFibGVcIikgcmV0dXJuIF90KFwiSWRsZSBmb3IgJShkdXJhdGlvbilzXCIsIHsgZHVyYXRpb246IGR1cmF0aW9uIH0pOyAvLyBYWFg6IGlzIHRoaXMgYWN0dWFsbHkgcmlnaHQ/XG4gICAgICAgICAgICBpZiAocHJlc2VuY2UgPT09IFwib2ZmbGluZVwiKSByZXR1cm4gX3QoXCJPZmZsaW5lIGZvciAlKGR1cmF0aW9uKXNcIiwgeyBkdXJhdGlvbjogZHVyYXRpb24gfSk7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJVbmtub3duIGZvciAlKGR1cmF0aW9uKXNcIiwgeyBkdXJhdGlvbjogZHVyYXRpb24gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJlc2VuY2UgPT09IFwib25saW5lXCIpIHJldHVybiBfdChcIk9ubGluZVwiKTtcbiAgICAgICAgICAgIGlmIChwcmVzZW5jZSA9PT0gXCJ1bmF2YWlsYWJsZVwiKSByZXR1cm4gX3QoXCJJZGxlXCIpOyAvLyBYWFg6IGlzIHRoaXMgYWN0dWFsbHkgcmlnaHQ/XG4gICAgICAgICAgICBpZiAocHJlc2VuY2UgPT09IFwib2ZmbGluZVwiKSByZXR1cm4gX3QoXCJPZmZsaW5lXCIpO1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiVW5rbm93blwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUHJlc2VuY2VMYWJlbFwiPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5nZXRQcmV0dHlQcmVzZW5jZSh0aGlzLnByb3BzLnByZXNlbmNlU3RhdGUsIHRoaXMucHJvcHMuYWN0aXZlQWdvLCB0aGlzLnByb3BzLmN1cnJlbnRseUFjdGl2ZSkgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT0EsTUFBTUEsa0JBQWtCLEdBQUcsSUFBSUMsOEJBQUosQ0FBa0IsTUFBbEIsRUFBMEIseUJBQTFCLENBQTNCOztBQWFlLE1BQU1DLGFBQU4sU0FBNEJDLGNBQUEsQ0FBTUMsU0FBbEMsQ0FBb0Q7RUFNL0Q7RUFDQTtFQUNRQyxXQUFXLENBQUNDLElBQUQsRUFBdUI7SUFDdEMsSUFBSSxDQUFDQSxJQUFMLEVBQVc7SUFDWCxNQUFNQyxDQUFDLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXSCxJQUFJLEdBQUcsSUFBbEIsQ0FBVjtJQUNBLE1BQU1JLENBQUMsR0FBR0gsQ0FBQyxHQUFHLEVBQWQ7SUFDQSxNQUFNSSxDQUFDLEdBQUdILElBQUksQ0FBQ0MsS0FBTCxDQUFXRixDQUFDLEdBQUcsRUFBZixJQUFxQixFQUEvQjtJQUNBLE1BQU1LLENBQUMsR0FBR0osSUFBSSxDQUFDQyxLQUFMLENBQVdGLENBQUMsSUFBSSxLQUFLLEVBQVQsQ0FBWixJQUE0QixFQUF0QztJQUNBLE1BQU1NLENBQUMsR0FBR0wsSUFBSSxDQUFDQyxLQUFMLENBQVdGLENBQUMsSUFBSSxLQUFLLEVBQUwsR0FBVSxFQUFkLENBQVosQ0FBVjs7SUFDQSxJQUFJQSxDQUFDLEdBQUcsRUFBUixFQUFZO01BQ1IsSUFBSUEsQ0FBQyxHQUFHLENBQVIsRUFBVztRQUNQLE9BQU8sSUFBQU8sbUJBQUEsRUFBRyxlQUFILEVBQW9CO1VBQUVDLFFBQVEsRUFBRTtRQUFaLENBQXBCLENBQVA7TUFDSDs7TUFDRCxPQUFPLElBQUFELG1CQUFBLEVBQUcsZUFBSCxFQUFvQjtRQUFFQyxRQUFRLEVBQUVMO01BQVosQ0FBcEIsQ0FBUDtJQUNIOztJQUNELElBQUlILENBQUMsR0FBRyxLQUFLLEVBQWIsRUFBaUI7TUFDYixPQUFPLElBQUFPLG1CQUFBLEVBQUcsZUFBSCxFQUFvQjtRQUFFQyxRQUFRLEVBQUVKO01BQVosQ0FBcEIsQ0FBUDtJQUNIOztJQUNELElBQUlKLENBQUMsR0FBRyxLQUFLLEVBQUwsR0FBVSxFQUFsQixFQUFzQjtNQUNsQixPQUFPLElBQUFPLG1CQUFBLEVBQUcsZUFBSCxFQUFvQjtRQUFFQyxRQUFRLEVBQUVIO01BQVosQ0FBcEIsQ0FBUDtJQUNIOztJQUNELE9BQU8sSUFBQUUsbUJBQUEsRUFBRyxlQUFILEVBQW9CO01BQUVDLFFBQVEsRUFBRUY7SUFBWixDQUFwQixDQUFQO0VBQ0g7O0VBRU9HLGlCQUFpQixDQUFDQyxRQUFELEVBQW1CQyxTQUFuQixFQUFzQ0MsZUFBdEMsRUFBd0U7SUFDN0Y7SUFDQTtJQUNBO0lBQ0EsSUFBSW5CLGtCQUFrQixDQUFDb0IsT0FBbkIsQ0FBMkJILFFBQTNCLENBQUosRUFBMEMsT0FBTyxJQUFBSCxtQkFBQSxFQUFHLE1BQUgsQ0FBUDs7SUFFMUMsSUFBSSxDQUFDSyxlQUFELElBQW9CRCxTQUFTLEtBQUtHLFNBQWxDLElBQStDSCxTQUFTLEdBQUcsQ0FBL0QsRUFBa0U7TUFDOUQsTUFBTUgsUUFBUSxHQUFHLEtBQUtWLFdBQUwsQ0FBaUJhLFNBQWpCLENBQWpCO01BQ0EsSUFBSUQsUUFBUSxLQUFLLFFBQWpCLEVBQTJCLE9BQU8sSUFBQUgsbUJBQUEsRUFBRyx5QkFBSCxFQUE4QjtRQUFFQyxRQUFRLEVBQUVBO01BQVosQ0FBOUIsQ0FBUDtNQUMzQixJQUFJRSxRQUFRLEtBQUssYUFBakIsRUFBZ0MsT0FBTyxJQUFBSCxtQkFBQSxFQUFHLHVCQUFILEVBQTRCO1FBQUVDLFFBQVEsRUFBRUE7TUFBWixDQUE1QixDQUFQLENBSDhCLENBRzhCOztNQUM1RixJQUFJRSxRQUFRLEtBQUssU0FBakIsRUFBNEIsT0FBTyxJQUFBSCxtQkFBQSxFQUFHLDBCQUFILEVBQStCO1FBQUVDLFFBQVEsRUFBRUE7TUFBWixDQUEvQixDQUFQO01BQzVCLE9BQU8sSUFBQUQsbUJBQUEsRUFBRywwQkFBSCxFQUErQjtRQUFFQyxRQUFRLEVBQUVBO01BQVosQ0FBL0IsQ0FBUDtJQUNILENBTkQsTUFNTztNQUNILElBQUlFLFFBQVEsS0FBSyxRQUFqQixFQUEyQixPQUFPLElBQUFILG1CQUFBLEVBQUcsUUFBSCxDQUFQO01BQzNCLElBQUlHLFFBQVEsS0FBSyxhQUFqQixFQUFnQyxPQUFPLElBQUFILG1CQUFBLEVBQUcsTUFBSCxDQUFQLENBRjdCLENBRWdEOztNQUNuRCxJQUFJRyxRQUFRLEtBQUssU0FBakIsRUFBNEIsT0FBTyxJQUFBSCxtQkFBQSxFQUFHLFNBQUgsQ0FBUDtNQUM1QixPQUFPLElBQUFBLG1CQUFBLEVBQUcsU0FBSCxDQUFQO0lBQ0g7RUFDSjs7RUFFRFEsTUFBTSxHQUFHO0lBQ0wsb0JBQ0k7TUFBSyxTQUFTLEVBQUM7SUFBZixHQUNNLEtBQUtOLGlCQUFMLENBQXVCLEtBQUtPLEtBQUwsQ0FBV0MsYUFBbEMsRUFBaUQsS0FBS0QsS0FBTCxDQUFXTCxTQUE1RCxFQUF1RSxLQUFLSyxLQUFMLENBQVdKLGVBQWxGLENBRE4sQ0FESjtFQUtIOztBQXhEOEQ7Ozs4QkFBOUNqQixhLGtCQUNLO0VBQ2xCZ0IsU0FBUyxFQUFFLENBQUMsQ0FETTtFQUVsQk0sYUFBYSxFQUFFO0FBRkcsQyJ9