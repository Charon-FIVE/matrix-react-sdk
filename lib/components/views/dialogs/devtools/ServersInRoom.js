"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _BaseTool = _interopRequireWildcard(require("./BaseTool"));

var _languageHandler = require("../../../../languageHandler");

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
const ServersInRoom = _ref => {
  let {
    onBack
  } = _ref;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const servers = (0, _react.useMemo)(() => {
    const servers = {};
    context.room.currentState.getStateEvents(_event.EventType.RoomMember).forEach(ev => {
      if (ev.getContent().membership !== "join") return; // only count joined users

      const server = ev.getSender().split(":")[1];
      servers[server] = (servers[server] ?? 0) + 1;
    });
    return servers;
  }, [context.room]);
  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack
  }, /*#__PURE__*/_react.default.createElement("table", null, /*#__PURE__*/_react.default.createElement("thead", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Server")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Number of users")))), /*#__PURE__*/_react.default.createElement("tbody", null, Object.entries(servers).map(_ref2 => {
    let [server, numUsers] = _ref2;
    return /*#__PURE__*/_react.default.createElement("tr", {
      key: server
    }, /*#__PURE__*/_react.default.createElement("td", null, server), /*#__PURE__*/_react.default.createElement("td", null, numUsers));
  }))));
};

var _default = ServersInRoom;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXJ2ZXJzSW5Sb29tIiwib25CYWNrIiwiY29udGV4dCIsInVzZUNvbnRleHQiLCJEZXZ0b29sc0NvbnRleHQiLCJzZXJ2ZXJzIiwidXNlTWVtbyIsInJvb20iLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsIkV2ZW50VHlwZSIsIlJvb21NZW1iZXIiLCJmb3JFYWNoIiwiZXYiLCJnZXRDb250ZW50IiwibWVtYmVyc2hpcCIsInNlcnZlciIsImdldFNlbmRlciIsInNwbGl0IiwiX3QiLCJPYmplY3QiLCJlbnRyaWVzIiwibWFwIiwibnVtVXNlcnMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL2RldnRvb2xzL1NlcnZlcnNJblJvb20udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ29udGV4dCwgdXNlTWVtbyB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuXG5pbXBvcnQgQmFzZVRvb2wsIHsgRGV2dG9vbHNDb250ZXh0LCBJRGV2dG9vbHNQcm9wcyB9IGZyb20gXCIuL0Jhc2VUb29sXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcblxuY29uc3QgU2VydmVyc0luUm9vbSA9ICh7IG9uQmFjayB9OiBJRGV2dG9vbHNQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KERldnRvb2xzQ29udGV4dCk7XG5cbiAgICBjb25zdCBzZXJ2ZXJzID0gdXNlTWVtbzxSZWNvcmQ8c3RyaW5nLCBudW1iZXI+PigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlcnZlcnM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICAgICAgY29udGV4dC5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbU1lbWJlcikuZm9yRWFjaChldiA9PiB7XG4gICAgICAgICAgICBpZiAoZXYuZ2V0Q29udGVudCgpLm1lbWJlcnNoaXAgIT09IFwiam9pblwiKSByZXR1cm47IC8vIG9ubHkgY291bnQgam9pbmVkIHVzZXJzXG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXIgPSBldi5nZXRTZW5kZXIoKS5zcGxpdChcIjpcIilbMV07XG4gICAgICAgICAgICBzZXJ2ZXJzW3NlcnZlcl0gPSAoc2VydmVyc1tzZXJ2ZXJdID8/IDApICsgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZXJ2ZXJzO1xuICAgIH0sIFtjb250ZXh0LnJvb21dKTtcblxuICAgIHJldHVybiA8QmFzZVRvb2wgb25CYWNrPXtvbkJhY2t9PlxuICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+eyBfdChcIlNlcnZlclwiKSB9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPnsgX3QoXCJOdW1iZXIgb2YgdXNlcnNcIikgfTwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgeyBPYmplY3QuZW50cmllcyhzZXJ2ZXJzKS5tYXAoKFtzZXJ2ZXIsIG51bVVzZXJzXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtzZXJ2ZXJ9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPnsgc2VydmVyIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPnsgbnVtVXNlcnMgfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSkgfVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgPC90YWJsZT5cbiAgICA8L0Jhc2VUb29sPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNlcnZlcnNJblJvb207XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7OztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRQSxNQUFNQSxhQUFhLEdBQUcsUUFBZ0M7RUFBQSxJQUEvQjtJQUFFQztFQUFGLENBQStCO0VBQ2xELE1BQU1DLE9BQU8sR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyx5QkFBWCxDQUFoQjtFQUVBLE1BQU1DLE9BQU8sR0FBRyxJQUFBQyxjQUFBLEVBQWdDLE1BQU07SUFDbEQsTUFBTUQsT0FBK0IsR0FBRyxFQUF4QztJQUNBSCxPQUFPLENBQUNLLElBQVIsQ0FBYUMsWUFBYixDQUEwQkMsY0FBMUIsQ0FBeUNDLGdCQUFBLENBQVVDLFVBQW5ELEVBQStEQyxPQUEvRCxDQUF1RUMsRUFBRSxJQUFJO01BQ3pFLElBQUlBLEVBQUUsQ0FBQ0MsVUFBSCxHQUFnQkMsVUFBaEIsS0FBK0IsTUFBbkMsRUFBMkMsT0FEOEIsQ0FDdEI7O01BQ25ELE1BQU1DLE1BQU0sR0FBR0gsRUFBRSxDQUFDSSxTQUFILEdBQWVDLEtBQWYsQ0FBcUIsR0FBckIsRUFBMEIsQ0FBMUIsQ0FBZjtNQUNBYixPQUFPLENBQUNXLE1BQUQsQ0FBUCxHQUFrQixDQUFDWCxPQUFPLENBQUNXLE1BQUQsQ0FBUCxJQUFtQixDQUFwQixJQUF5QixDQUEzQztJQUNILENBSkQ7SUFLQSxPQUFPWCxPQUFQO0VBQ0gsQ0FSZSxFQVFiLENBQUNILE9BQU8sQ0FBQ0ssSUFBVCxDQVJhLENBQWhCO0VBVUEsb0JBQU8sNkJBQUMsaUJBQUQ7SUFBVSxNQUFNLEVBQUVOO0VBQWxCLGdCQUNILHlEQUNJLHlEQUNJLHNEQUNJLHlDQUFNLElBQUFrQixtQkFBQSxFQUFHLFFBQUgsQ0FBTixDQURKLGVBRUkseUNBQU0sSUFBQUEsbUJBQUEsRUFBRyxpQkFBSCxDQUFOLENBRkosQ0FESixDQURKLGVBT0ksNENBQ01DLE1BQU0sQ0FBQ0MsT0FBUCxDQUFlaEIsT0FBZixFQUF3QmlCLEdBQXhCLENBQTRCO0lBQUEsSUFBQyxDQUFDTixNQUFELEVBQVNPLFFBQVQsQ0FBRDtJQUFBLG9CQUMxQjtNQUFJLEdBQUcsRUFBRVA7SUFBVCxnQkFDSSx5Q0FBTUEsTUFBTixDQURKLGVBRUkseUNBQU1PLFFBQU4sQ0FGSixDQUQwQjtFQUFBLENBQTVCLENBRE4sQ0FQSixDQURHLENBQVA7QUFrQkgsQ0EvQkQ7O2VBaUNldkIsYSJ9