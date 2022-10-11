"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _useEventEmitter = require("../../../../hooks/useEventEmitter");

var _languageHandler = require("../../../../languageHandler");

var _BaseTool = _interopRequireWildcard(require("./BaseTool"));

var _WidgetStore = _interopRequireDefault(require("../../../../stores/WidgetStore"));

var _AsyncStore = require("../../../../stores/AsyncStore");

var _FilteredList = _interopRequireDefault(require("./FilteredList"));

var _RoomState = require("./RoomState");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 Michael Telatynski <7t3chguy@gmail.com>

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
const WidgetExplorer = _ref => {
  let {
    onBack
  } = _ref;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const [query, setQuery] = (0, _react.useState)("");
  const [widget, setWidget] = (0, _react.useState)(null);
  const widgets = (0, _useEventEmitter.useEventEmitterState)(_WidgetStore.default.instance, _AsyncStore.UPDATE_EVENT, () => {
    return _WidgetStore.default.instance.getApps(context.room.roomId);
  });

  if (widget && widgets.includes(widget)) {
    const onBack = () => {
      setWidget(null);
    };

    const allState = Array.from(Array.from(context.room.currentState.events.values()).map(e => {
      return e.values();
    })).reduce((p, c) => {
      p.push(...c);
      return p;
    }, []);
    const event = allState.find(ev => ev.getId() === widget.eventId);

    if (!event) {
      // "should never happen"
      return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
        onBack: onBack
      }, (0, _languageHandler._t)("There was an error finding this widget."));
    }

    return /*#__PURE__*/_react.default.createElement(_RoomState.StateEventEditor, {
      mxEvent: event,
      onBack: onBack
    });
  }

  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack
  }, /*#__PURE__*/_react.default.createElement(_FilteredList.default, {
    query: query,
    onChange: setQuery
  }, widgets.map(w => /*#__PURE__*/_react.default.createElement("button", {
    className: "mx_DevTools_button",
    key: w.url + w.eventId,
    onClick: () => setWidget(w)
  }, w.url))));
};

var _default = WidgetExplorer;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJXaWRnZXRFeHBsb3JlciIsIm9uQmFjayIsImNvbnRleHQiLCJ1c2VDb250ZXh0IiwiRGV2dG9vbHNDb250ZXh0IiwicXVlcnkiLCJzZXRRdWVyeSIsInVzZVN0YXRlIiwid2lkZ2V0Iiwic2V0V2lkZ2V0Iiwid2lkZ2V0cyIsInVzZUV2ZW50RW1pdHRlclN0YXRlIiwiV2lkZ2V0U3RvcmUiLCJpbnN0YW5jZSIsIlVQREFURV9FVkVOVCIsImdldEFwcHMiLCJyb29tIiwicm9vbUlkIiwiaW5jbHVkZXMiLCJhbGxTdGF0ZSIsIkFycmF5IiwiZnJvbSIsImN1cnJlbnRTdGF0ZSIsImV2ZW50cyIsInZhbHVlcyIsIm1hcCIsImUiLCJyZWR1Y2UiLCJwIiwiYyIsInB1c2giLCJldmVudCIsImZpbmQiLCJldiIsImdldElkIiwiZXZlbnRJZCIsIl90IiwidyIsInVybCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvZGV2dG9vbHMvV2lkZ2V0RXhwbG9yZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ29udGV4dCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuXG5pbXBvcnQgeyB1c2VFdmVudEVtaXR0ZXJTdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXJcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEJhc2VUb29sLCB7IERldnRvb2xzQ29udGV4dCwgSURldnRvb2xzUHJvcHMgfSBmcm9tIFwiLi9CYXNlVG9vbFwiO1xuaW1wb3J0IFdpZGdldFN0b3JlLCB7IElBcHAgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc3RvcmVzL1dpZGdldFN0b3JlXCI7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcbmltcG9ydCBGaWx0ZXJlZExpc3QgZnJvbSBcIi4vRmlsdGVyZWRMaXN0XCI7XG5pbXBvcnQgeyBTdGF0ZUV2ZW50RWRpdG9yIH0gZnJvbSBcIi4vUm9vbVN0YXRlXCI7XG5cbmNvbnN0IFdpZGdldEV4cGxvcmVyID0gKHsgb25CYWNrIH06IElEZXZ0b29sc1Byb3BzKSA9PiB7XG4gICAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoRGV2dG9vbHNDb250ZXh0KTtcbiAgICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKFwiXCIpO1xuICAgIGNvbnN0IFt3aWRnZXQsIHNldFdpZGdldF0gPSB1c2VTdGF0ZTxJQXBwPihudWxsKTtcblxuICAgIGNvbnN0IHdpZGdldHMgPSB1c2VFdmVudEVtaXR0ZXJTdGF0ZShXaWRnZXRTdG9yZS5pbnN0YW5jZSwgVVBEQVRFX0VWRU5ULCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBXaWRnZXRTdG9yZS5pbnN0YW5jZS5nZXRBcHBzKGNvbnRleHQucm9vbS5yb29tSWQpO1xuICAgIH0pO1xuXG4gICAgaWYgKHdpZGdldCAmJiB3aWRnZXRzLmluY2x1ZGVzKHdpZGdldCkpIHtcbiAgICAgICAgY29uc3Qgb25CYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgc2V0V2lkZ2V0KG51bGwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGFsbFN0YXRlID0gQXJyYXkuZnJvbShcbiAgICAgICAgICAgIEFycmF5LmZyb20oY29udGV4dC5yb29tLmN1cnJlbnRTdGF0ZS5ldmVudHMudmFsdWVzKCkpLm1hcCgoZTogTWFwPHN0cmluZywgTWF0cml4RXZlbnQ+KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUudmFsdWVzKCk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKS5yZWR1Y2UoKHAsIGMpID0+IHsgcC5wdXNoKC4uLmMpOyByZXR1cm4gcDsgfSwgW10pO1xuICAgICAgICBjb25zdCBldmVudCA9IGFsbFN0YXRlLmZpbmQoZXYgPT4gZXYuZ2V0SWQoKSA9PT0gd2lkZ2V0LmV2ZW50SWQpO1xuICAgICAgICBpZiAoIWV2ZW50KSB7IC8vIFwic2hvdWxkIG5ldmVyIGhhcHBlblwiXG4gICAgICAgICAgICByZXR1cm4gPEJhc2VUb29sIG9uQmFjaz17b25CYWNrfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiVGhlcmUgd2FzIGFuIGVycm9yIGZpbmRpbmcgdGhpcyB3aWRnZXQuXCIpIH1cbiAgICAgICAgICAgIDwvQmFzZVRvb2w+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxTdGF0ZUV2ZW50RWRpdG9yIG14RXZlbnQ9e2V2ZW50fSBvbkJhY2s9e29uQmFja30gLz47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxCYXNlVG9vbCBvbkJhY2s9e29uQmFja30+XG4gICAgICAgIDxGaWx0ZXJlZExpc3QgcXVlcnk9e3F1ZXJ5fSBvbkNoYW5nZT17c2V0UXVlcnl9PlxuICAgICAgICAgICAgeyB3aWRnZXRzLm1hcCh3ID0+IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX2J1dHRvblwiIGtleT17dy51cmwgKyB3LmV2ZW50SWR9IG9uQ2xpY2s9eygpID0+IHNldFdpZGdldCh3KX0+XG4gICAgICAgICAgICAgICAgICAgIHsgdy51cmwgfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSkgfVxuICAgICAgICA8L0ZpbHRlcmVkTGlzdD5cbiAgICA8L0Jhc2VUb29sPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldEV4cGxvcmVyO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFhQSxNQUFNQSxjQUFjLEdBQUcsUUFBZ0M7RUFBQSxJQUEvQjtJQUFFQztFQUFGLENBQStCO0VBQ25ELE1BQU1DLE9BQU8sR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyx5QkFBWCxDQUFoQjtFQUNBLE1BQU0sQ0FBQ0MsS0FBRCxFQUFRQyxRQUFSLElBQW9CLElBQUFDLGVBQUEsRUFBUyxFQUFULENBQTFCO0VBQ0EsTUFBTSxDQUFDQyxNQUFELEVBQVNDLFNBQVQsSUFBc0IsSUFBQUYsZUFBQSxFQUFlLElBQWYsQ0FBNUI7RUFFQSxNQUFNRyxPQUFPLEdBQUcsSUFBQUMscUNBQUEsRUFBcUJDLG9CQUFBLENBQVlDLFFBQWpDLEVBQTJDQyx3QkFBM0MsRUFBeUQsTUFBTTtJQUMzRSxPQUFPRixvQkFBQSxDQUFZQyxRQUFaLENBQXFCRSxPQUFyQixDQUE2QmIsT0FBTyxDQUFDYyxJQUFSLENBQWFDLE1BQTFDLENBQVA7RUFDSCxDQUZlLENBQWhCOztFQUlBLElBQUlULE1BQU0sSUFBSUUsT0FBTyxDQUFDUSxRQUFSLENBQWlCVixNQUFqQixDQUFkLEVBQXdDO0lBQ3BDLE1BQU1QLE1BQU0sR0FBRyxNQUFNO01BQ2pCUSxTQUFTLENBQUMsSUFBRCxDQUFUO0lBQ0gsQ0FGRDs7SUFJQSxNQUFNVSxRQUFRLEdBQUdDLEtBQUssQ0FBQ0MsSUFBTixDQUNiRCxLQUFLLENBQUNDLElBQU4sQ0FBV25CLE9BQU8sQ0FBQ2MsSUFBUixDQUFhTSxZQUFiLENBQTBCQyxNQUExQixDQUFpQ0MsTUFBakMsRUFBWCxFQUFzREMsR0FBdEQsQ0FBMkRDLENBQUQsSUFBaUM7TUFDdkYsT0FBT0EsQ0FBQyxDQUFDRixNQUFGLEVBQVA7SUFDSCxDQUZELENBRGEsRUFJZkcsTUFKZSxDQUlSLENBQUNDLENBQUQsRUFBSUMsQ0FBSixLQUFVO01BQUVELENBQUMsQ0FBQ0UsSUFBRixDQUFPLEdBQUdELENBQVY7TUFBYyxPQUFPRCxDQUFQO0lBQVcsQ0FKN0IsRUFJK0IsRUFKL0IsQ0FBakI7SUFLQSxNQUFNRyxLQUFLLEdBQUdaLFFBQVEsQ0FBQ2EsSUFBVCxDQUFjQyxFQUFFLElBQUlBLEVBQUUsQ0FBQ0MsS0FBSCxPQUFlMUIsTUFBTSxDQUFDMkIsT0FBMUMsQ0FBZDs7SUFDQSxJQUFJLENBQUNKLEtBQUwsRUFBWTtNQUFFO01BQ1Ysb0JBQU8sNkJBQUMsaUJBQUQ7UUFBVSxNQUFNLEVBQUU5QjtNQUFsQixHQUNELElBQUFtQyxtQkFBQSxFQUFHLHlDQUFILENBREMsQ0FBUDtJQUdIOztJQUVELG9CQUFPLDZCQUFDLDJCQUFEO01BQWtCLE9BQU8sRUFBRUwsS0FBM0I7TUFBa0MsTUFBTSxFQUFFOUI7SUFBMUMsRUFBUDtFQUNIOztFQUVELG9CQUFPLDZCQUFDLGlCQUFEO0lBQVUsTUFBTSxFQUFFQTtFQUFsQixnQkFDSCw2QkFBQyxxQkFBRDtJQUFjLEtBQUssRUFBRUksS0FBckI7SUFBNEIsUUFBUSxFQUFFQztFQUF0QyxHQUNNSSxPQUFPLENBQUNlLEdBQVIsQ0FBWVksQ0FBQyxpQkFDWDtJQUFRLFNBQVMsRUFBQyxvQkFBbEI7SUFBdUMsR0FBRyxFQUFFQSxDQUFDLENBQUNDLEdBQUYsR0FBUUQsQ0FBQyxDQUFDRixPQUF0RDtJQUErRCxPQUFPLEVBQUUsTUFBTTFCLFNBQVMsQ0FBQzRCLENBQUQ7RUFBdkYsR0FDTUEsQ0FBQyxDQUFDQyxHQURSLENBREYsQ0FETixDQURHLENBQVA7QUFTSCxDQXRDRDs7ZUF3Q2V0QyxjIn0=