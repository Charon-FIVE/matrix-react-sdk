"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _StyledRadioGroup = _interopRequireDefault(require("../elements/StyledRadioGroup"));

var _QueryMatcher = _interopRequireDefault(require("../../../autocomplete/QueryMatcher"));

var _SearchBox = _interopRequireDefault(require("../../structures/SearchBox"));

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _AddExistingToSpaceDialog = require("../dialogs/AddExistingToSpaceDialog");

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
var Target;

(function (Target) {
  Target["All"] = "All";
  Target["Specific"] = "Specific";
  Target["None"] = "None";
})(Target || (Target = {}));

const SpecificChildrenPicker = _ref => {
  let {
    filterPlaceholder,
    rooms,
    selected,
    onChange
  } = _ref;
  const [query, setQuery] = (0, _react.useState)("");
  const lcQuery = query.toLowerCase().trim();
  const filteredRooms = (0, _react.useMemo)(() => {
    if (!lcQuery) {
      return rooms;
    }

    const matcher = new _QueryMatcher.default(rooms, {
      keys: ["name"],
      funcs: [r => [r.getCanonicalAlias(), ...r.getAltAliases()].filter(Boolean)],
      shouldMatchWordsOnly: false
    });
    return matcher.match(lcQuery);
  }, [rooms, lcQuery]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceChildrenPicker"
  }, /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
    className: "mx_textinput_icon mx_textinput_search",
    placeholder: filterPlaceholder,
    onSearch: setQuery,
    autoFocus: true
  }), /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, null, filteredRooms.map(room => {
    return /*#__PURE__*/_react.default.createElement(_AddExistingToSpaceDialog.Entry, {
      key: room.roomId,
      room: room,
      checked: selected.has(room),
      onChange: checked => {
        onChange(checked, room);
      }
    });
  }), filteredRooms.length < 1 ? /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_SpaceChildrenPicker_noResults"
  }, (0, _languageHandler._t)("No results")) : undefined));
};

const SpaceChildrenPicker = _ref2 => {
  let {
    space,
    spaceChildren,
    selected,
    onChange,
    noneLabel,
    allLabel,
    specificLabel
  } = _ref2;
  const [state, setState] = (0, _react.useState)(noneLabel ? Target.None : Target.All);
  (0, _react.useEffect)(() => {
    if (state === Target.All) {
      onChange(spaceChildren);
    } else {
      onChange([]);
    }
  }, [onChange, state, spaceChildren]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceChildrenPicker"
  }, /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
    name: "roomsToLeave",
    value: state,
    onChange: setState,
    definitions: [{
      value: Target.None,
      label: noneLabel
    }, {
      value: Target.All,
      label: allLabel
    }, {
      value: Target.Specific,
      label: specificLabel
    }].filter(d => d.label)
  })), state === Target.Specific && /*#__PURE__*/_react.default.createElement(SpecificChildrenPicker, {
    filterPlaceholder: (0, _languageHandler._t)("Search %(spaceName)s", {
      spaceName: space.name
    }),
    rooms: spaceChildren,
    selected: selected,
    onChange: (isSelected, room) => {
      if (isSelected) {
        onChange([room, ...selected]);
      } else {
        onChange([...selected].filter(r => r !== room));
      }
    }
  }));
};

var _default = SpaceChildrenPicker;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYXJnZXQiLCJTcGVjaWZpY0NoaWxkcmVuUGlja2VyIiwiZmlsdGVyUGxhY2Vob2xkZXIiLCJyb29tcyIsInNlbGVjdGVkIiwib25DaGFuZ2UiLCJxdWVyeSIsInNldFF1ZXJ5IiwidXNlU3RhdGUiLCJsY1F1ZXJ5IiwidG9Mb3dlckNhc2UiLCJ0cmltIiwiZmlsdGVyZWRSb29tcyIsInVzZU1lbW8iLCJtYXRjaGVyIiwiUXVlcnlNYXRjaGVyIiwia2V5cyIsImZ1bmNzIiwiciIsImdldENhbm9uaWNhbEFsaWFzIiwiZ2V0QWx0QWxpYXNlcyIsImZpbHRlciIsIkJvb2xlYW4iLCJzaG91bGRNYXRjaFdvcmRzT25seSIsIm1hdGNoIiwibWFwIiwicm9vbSIsInJvb21JZCIsImhhcyIsImNoZWNrZWQiLCJsZW5ndGgiLCJfdCIsInVuZGVmaW5lZCIsIlNwYWNlQ2hpbGRyZW5QaWNrZXIiLCJzcGFjZSIsInNwYWNlQ2hpbGRyZW4iLCJub25lTGFiZWwiLCJhbGxMYWJlbCIsInNwZWNpZmljTGFiZWwiLCJzdGF0ZSIsInNldFN0YXRlIiwiTm9uZSIsIkFsbCIsInVzZUVmZmVjdCIsInZhbHVlIiwibGFiZWwiLCJTcGVjaWZpYyIsImQiLCJzcGFjZU5hbWUiLCJuYW1lIiwiaXNTZWxlY3RlZCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NwYWNlcy9TcGFjZUNoaWxkcmVuUGlja2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTdHlsZWRSYWRpb0dyb3VwIGZyb20gXCIuLi9lbGVtZW50cy9TdHlsZWRSYWRpb0dyb3VwXCI7XG5pbXBvcnQgUXVlcnlNYXRjaGVyIGZyb20gXCIuLi8uLi8uLi9hdXRvY29tcGxldGUvUXVlcnlNYXRjaGVyXCI7XG5pbXBvcnQgU2VhcmNoQm94IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1NlYXJjaEJveFwiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0F1dG9IaWRlU2Nyb2xsYmFyXCI7XG5pbXBvcnQgeyBFbnRyeSB9IGZyb20gXCIuLi9kaWFsb2dzL0FkZEV4aXN0aW5nVG9TcGFjZURpYWxvZ1wiO1xuXG5lbnVtIFRhcmdldCB7XG4gICAgQWxsID0gXCJBbGxcIixcbiAgICBTcGVjaWZpYyA9IFwiU3BlY2lmaWNcIixcbiAgICBOb25lID0gXCJOb25lXCIsXG59XG5cbmludGVyZmFjZSBJU3BlY2lmaWNDaGlsZHJlblBpY2tlclByb3BzIHtcbiAgICBmaWx0ZXJQbGFjZWhvbGRlcjogc3RyaW5nO1xuICAgIHJvb21zOiBSb29tW107XG4gICAgc2VsZWN0ZWQ6IFNldDxSb29tPjtcbiAgICBvbkNoYW5nZShzZWxlY3RlZDogYm9vbGVhbiwgcm9vbTogUm9vbSk6IHZvaWQ7XG59XG5cbmNvbnN0IFNwZWNpZmljQ2hpbGRyZW5QaWNrZXIgPSAoeyBmaWx0ZXJQbGFjZWhvbGRlciwgcm9vbXMsIHNlbGVjdGVkLCBvbkNoYW5nZSB9OiBJU3BlY2lmaWNDaGlsZHJlblBpY2tlclByb3BzKSA9PiB7XG4gICAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgICBjb25zdCBsY1F1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cbiAgICBjb25zdCBmaWx0ZXJlZFJvb21zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghbGNRdWVyeSkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb21zO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWF0Y2hlciA9IG5ldyBRdWVyeU1hdGNoZXI8Um9vbT4ocm9vbXMsIHtcbiAgICAgICAgICAgIGtleXM6IFtcIm5hbWVcIl0sXG4gICAgICAgICAgICBmdW5jczogW3IgPT4gW3IuZ2V0Q2Fub25pY2FsQWxpYXMoKSwgLi4uci5nZXRBbHRBbGlhc2VzKCldLmZpbHRlcihCb29sZWFuKV0sXG4gICAgICAgICAgICBzaG91bGRNYXRjaFdvcmRzT25seTogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtYXRjaGVyLm1hdGNoKGxjUXVlcnkpO1xuICAgIH0sIFtyb29tcywgbGNRdWVyeV0pO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VDaGlsZHJlblBpY2tlclwiPlxuICAgICAgICA8U2VhcmNoQm94XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF90ZXh0aW5wdXRfaWNvbiBteF90ZXh0aW5wdXRfc2VhcmNoXCJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtmaWx0ZXJQbGFjZWhvbGRlcn1cbiAgICAgICAgICAgIG9uU2VhcmNoPXtzZXRRdWVyeX1cbiAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgLz5cbiAgICAgICAgPEF1dG9IaWRlU2Nyb2xsYmFyPlxuICAgICAgICAgICAgeyBmaWx0ZXJlZFJvb21zLm1hcChyb29tID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPEVudHJ5XG4gICAgICAgICAgICAgICAgICAgIGtleT17cm9vbS5yb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkLmhhcyhyb29tKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhjaGVja2VkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZShjaGVja2VkLCByb29tKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgIHsgZmlsdGVyZWRSb29tcy5sZW5ndGggPCAxID8gPHNwYW4gY2xhc3NOYW1lPVwibXhfU3BhY2VDaGlsZHJlblBpY2tlcl9ub1Jlc3VsdHNcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiTm8gcmVzdWx0c1wiKSB9XG4gICAgICAgICAgICA8L3NwYW4+IDogdW5kZWZpbmVkIH1cbiAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICA8L2Rpdj47XG59O1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBzcGFjZTogUm9vbTtcbiAgICBzcGFjZUNoaWxkcmVuOiBSb29tW107XG4gICAgc2VsZWN0ZWQ6IFNldDxSb29tPjtcbiAgICBub25lTGFiZWw/OiBzdHJpbmc7XG4gICAgYWxsTGFiZWw6IHN0cmluZztcbiAgICBzcGVjaWZpY0xhYmVsOiBzdHJpbmc7XG4gICAgb25DaGFuZ2Uocm9vbXM6IFJvb21bXSk6IHZvaWQ7XG59XG5cbmNvbnN0IFNwYWNlQ2hpbGRyZW5QaWNrZXIgPSAoe1xuICAgIHNwYWNlLFxuICAgIHNwYWNlQ2hpbGRyZW4sXG4gICAgc2VsZWN0ZWQsXG4gICAgb25DaGFuZ2UsXG4gICAgbm9uZUxhYmVsLFxuICAgIGFsbExhYmVsLFxuICAgIHNwZWNpZmljTGFiZWwsXG59OiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlPHN0cmluZz4obm9uZUxhYmVsID8gVGFyZ2V0Lk5vbmUgOiBUYXJnZXQuQWxsKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gVGFyZ2V0LkFsbCkge1xuICAgICAgICAgICAgb25DaGFuZ2Uoc3BhY2VDaGlsZHJlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvbkNoYW5nZShbXSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2UsIHN0YXRlLCBzcGFjZUNoaWxkcmVuXSk7XG5cbiAgICByZXR1cm4gPD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUNoaWxkcmVuUGlja2VyXCI+XG4gICAgICAgICAgICA8U3R5bGVkUmFkaW9Hcm91cFxuICAgICAgICAgICAgICAgIG5hbWU9XCJyb29tc1RvTGVhdmVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtzdGF0ZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0U3RhdGV9XG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbnM9e1tcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFRhcmdldC5Ob25lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IG5vbmVMYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFRhcmdldC5BbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogYWxsTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBUYXJnZXQuU3BlY2lmaWMsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogc3BlY2lmaWNMYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLmZpbHRlcihkID0+IGQubGFiZWwpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgeyBzdGF0ZSA9PT0gVGFyZ2V0LlNwZWNpZmljICYmIChcbiAgICAgICAgICAgIDxTcGVjaWZpY0NoaWxkcmVuUGlja2VyXG4gICAgICAgICAgICAgICAgZmlsdGVyUGxhY2Vob2xkZXI9e190KFwiU2VhcmNoICUoc3BhY2VOYW1lKXNcIiwgeyBzcGFjZU5hbWU6IHNwYWNlLm5hbWUgfSl9XG4gICAgICAgICAgICAgICAgcm9vbXM9e3NwYWNlQ2hpbGRyZW59XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoaXNTZWxlY3RlZDogYm9vbGVhbiwgcm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UoW3Jvb20sIC4uLnNlbGVjdGVkXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZShbLi4uc2VsZWN0ZWRdLmZpbHRlcihyID0+IHIgIT09IHJvb20pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICApIH1cbiAgICA8Lz47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTcGFjZUNoaWxkcmVuUGlja2VyO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFZS0EsTTs7V0FBQUEsTTtFQUFBQSxNO0VBQUFBLE07RUFBQUEsTTtHQUFBQSxNLEtBQUFBLE07O0FBYUwsTUFBTUMsc0JBQXNCLEdBQUcsUUFBb0Y7RUFBQSxJQUFuRjtJQUFFQyxpQkFBRjtJQUFxQkMsS0FBckI7SUFBNEJDLFFBQTVCO0lBQXNDQztFQUF0QyxDQUFtRjtFQUMvRyxNQUFNLENBQUNDLEtBQUQsRUFBUUMsUUFBUixJQUFvQixJQUFBQyxlQUFBLEVBQVMsRUFBVCxDQUExQjtFQUNBLE1BQU1DLE9BQU8sR0FBR0gsS0FBSyxDQUFDSSxXQUFOLEdBQW9CQyxJQUFwQixFQUFoQjtFQUVBLE1BQU1DLGFBQWEsR0FBRyxJQUFBQyxjQUFBLEVBQVEsTUFBTTtJQUNoQyxJQUFJLENBQUNKLE9BQUwsRUFBYztNQUNWLE9BQU9OLEtBQVA7SUFDSDs7SUFFRCxNQUFNVyxPQUFPLEdBQUcsSUFBSUMscUJBQUosQ0FBdUJaLEtBQXZCLEVBQThCO01BQzFDYSxJQUFJLEVBQUUsQ0FBQyxNQUFELENBRG9DO01BRTFDQyxLQUFLLEVBQUUsQ0FBQ0MsQ0FBQyxJQUFJLENBQUNBLENBQUMsQ0FBQ0MsaUJBQUYsRUFBRCxFQUF3QixHQUFHRCxDQUFDLENBQUNFLGFBQUYsRUFBM0IsRUFBOENDLE1BQTlDLENBQXFEQyxPQUFyRCxDQUFOLENBRm1DO01BRzFDQyxvQkFBb0IsRUFBRTtJQUhvQixDQUE5QixDQUFoQjtJQU1BLE9BQU9ULE9BQU8sQ0FB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