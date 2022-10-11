"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../../languageHandler");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _TruncatedList = _interopRequireDefault(require("../../elements/TruncatedList"));

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
const INITIAL_LOAD_TILES = 20;
const LOAD_TILES_STEP_SIZE = 50;

const FilteredList = _ref => {
  let {
    children,
    query,
    onChange
  } = _ref;
  const [truncateAt, setTruncateAt] = (0, _react.useState)(INITIAL_LOAD_TILES);
  const [filteredChildren, setFilteredChildren] = (0, _react.useState)(children);
  (0, _react.useEffect)(() => {
    let filteredChildren = children;

    if (query) {
      const lcQuery = query.toLowerCase();
      filteredChildren = children.filter(child => child.key.toString().toLowerCase().includes(lcQuery));
    }

    setFilteredChildren(filteredChildren);
    setTruncateAt(INITIAL_LOAD_TILES);
  }, [children, query]);

  const getChildren = (start, end) => {
    return filteredChildren.slice(start, end);
  };

  const getChildCount = () => {
    return filteredChildren.length;
  };

  const createOverflowElement = (overflowCount, totalCount) => {
    const showMore = () => {
      setTruncateAt(num => num + LOAD_TILES_STEP_SIZE);
    };

    return /*#__PURE__*/_react.default.createElement("button", {
      className: "mx_DevTools_button",
      onClick: showMore
    }, (0, _languageHandler._t)("and %(count)s others...", {
      count: overflowCount
    }));
  };

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Field.default, {
    label: (0, _languageHandler._t)('Filter results'),
    autoFocus: true,
    size: 64,
    type: "text",
    autoComplete: "off",
    value: query,
    onChange: ev => onChange(ev.target.value),
    className: "mx_TextInputDialog_input mx_DevTools_RoomStateExplorer_query" // force re-render so that autoFocus is applied when this component is re-used
    ,
    key: children?.[0]?.key ?? ''
  }), filteredChildren.length < 1 ? (0, _languageHandler._t)("No results found") : /*#__PURE__*/_react.default.createElement(_TruncatedList.default, {
    getChildren: getChildren,
    getChildCount: getChildCount,
    truncateAt: truncateAt,
    createOverflowElement: createOverflowElement
  }));
};

var _default = FilteredList;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJTklUSUFMX0xPQURfVElMRVMiLCJMT0FEX1RJTEVTX1NURVBfU0laRSIsIkZpbHRlcmVkTGlzdCIsImNoaWxkcmVuIiwicXVlcnkiLCJvbkNoYW5nZSIsInRydW5jYXRlQXQiLCJzZXRUcnVuY2F0ZUF0IiwidXNlU3RhdGUiLCJmaWx0ZXJlZENoaWxkcmVuIiwic2V0RmlsdGVyZWRDaGlsZHJlbiIsInVzZUVmZmVjdCIsImxjUXVlcnkiLCJ0b0xvd2VyQ2FzZSIsImZpbHRlciIsImNoaWxkIiwia2V5IiwidG9TdHJpbmciLCJpbmNsdWRlcyIsImdldENoaWxkcmVuIiwic3RhcnQiLCJlbmQiLCJzbGljZSIsImdldENoaWxkQ291bnQiLCJsZW5ndGgiLCJjcmVhdGVPdmVyZmxvd0VsZW1lbnQiLCJvdmVyZmxvd0NvdW50IiwidG90YWxDb3VudCIsInNob3dNb3JlIiwibnVtIiwiX3QiLCJjb3VudCIsImV2IiwidGFyZ2V0IiwidmFsdWUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL2RldnRvb2xzL0ZpbHRlcmVkTGlzdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi8uLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IFRydW5jYXRlZExpc3QgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL1RydW5jYXRlZExpc3RcIjtcblxuY29uc3QgSU5JVElBTF9MT0FEX1RJTEVTID0gMjA7XG5jb25zdCBMT0FEX1RJTEVTX1NURVBfU0laRSA9IDUwO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBjaGlsZHJlbjogUmVhY3QuUmVhY3RFbGVtZW50W107XG4gICAgcXVlcnk6IHN0cmluZztcbiAgICBvbkNoYW5nZSh2YWx1ZTogc3RyaW5nKTogdm9pZDtcbn1cblxuY29uc3QgRmlsdGVyZWRMaXN0ID0gKHsgY2hpbGRyZW4sIHF1ZXJ5LCBvbkNoYW5nZSB9OiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBbdHJ1bmNhdGVBdCwgc2V0VHJ1bmNhdGVBdF0gPSB1c2VTdGF0ZTxudW1iZXI+KElOSVRJQUxfTE9BRF9USUxFUyk7XG4gICAgY29uc3QgW2ZpbHRlcmVkQ2hpbGRyZW4sIHNldEZpbHRlcmVkQ2hpbGRyZW5dID0gdXNlU3RhdGU8UmVhY3QuUmVhY3RFbGVtZW50W10+KGNoaWxkcmVuKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCBmaWx0ZXJlZENoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICAgICAgY29uc3QgbGNRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZENoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQua2V5LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsY1F1ZXJ5KSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0RmlsdGVyZWRDaGlsZHJlbihmaWx0ZXJlZENoaWxkcmVuKTtcbiAgICAgICAgc2V0VHJ1bmNhdGVBdChJTklUSUFMX0xPQURfVElMRVMpO1xuICAgIH0sIFtjaGlsZHJlbiwgcXVlcnldKTtcblxuICAgIGNvbnN0IGdldENoaWxkcmVuID0gKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogUmVhY3QuUmVhY3RFbGVtZW50W10gPT4ge1xuICAgICAgICByZXR1cm4gZmlsdGVyZWRDaGlsZHJlbi5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0Q2hpbGRDb3VudCA9ICgpOiBudW1iZXIgPT4ge1xuICAgICAgICByZXR1cm4gZmlsdGVyZWRDaGlsZHJlbi5sZW5ndGg7XG4gICAgfTtcblxuICAgIGNvbnN0IGNyZWF0ZU92ZXJmbG93RWxlbWVudCA9IChvdmVyZmxvd0NvdW50OiBudW1iZXIsIHRvdGFsQ291bnQ6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBzaG93TW9yZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHNldFRydW5jYXRlQXQobnVtID0+IG51bSArIExPQURfVElMRVNfU1RFUF9TSVpFKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gPGJ1dHRvbiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19idXR0b25cIiBvbkNsaWNrPXtzaG93TW9yZX0+XG4gICAgICAgICAgICB7IF90KFwiYW5kICUoY291bnQpcyBvdGhlcnMuLi5cIiwgeyBjb3VudDogb3ZlcmZsb3dDb3VudCB9KSB9XG4gICAgICAgIDwvYnV0dG9uPjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIDw+XG4gICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgbGFiZWw9e190KCdGaWx0ZXIgcmVzdWx0cycpfVxuICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgc2l6ZT17NjR9XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgdmFsdWU9e3F1ZXJ5fVxuICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IG9uQ2hhbmdlKGV2LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9UZXh0SW5wdXREaWFsb2dfaW5wdXQgbXhfRGV2VG9vbHNfUm9vbVN0YXRlRXhwbG9yZXJfcXVlcnlcIlxuICAgICAgICAgICAgLy8gZm9yY2UgcmUtcmVuZGVyIHNvIHRoYXQgYXV0b0ZvY3VzIGlzIGFwcGxpZWQgd2hlbiB0aGlzIGNvbXBvbmVudCBpcyByZS11c2VkXG4gICAgICAgICAgICBrZXk9e2NoaWxkcmVuPy5bMF0/LmtleSA/PyAnJ31cbiAgICAgICAgLz5cblxuICAgICAgICB7IGZpbHRlcmVkQ2hpbGRyZW4ubGVuZ3RoIDwgMVxuICAgICAgICAgICAgPyBfdChcIk5vIHJlc3VsdHMgZm91bmRcIilcbiAgICAgICAgICAgIDogPFRydW5jYXRlZExpc3RcbiAgICAgICAgICAgICAgICBnZXRDaGlsZHJlbj17Z2V0Q2hpbGRyZW59XG4gICAgICAgICAgICAgICAgZ2V0Q2hpbGRDb3VudD17Z2V0Q2hpbGRDb3VudH1cbiAgICAgICAgICAgICAgICB0cnVuY2F0ZUF0PXt0cnVuY2F0ZUF0fVxuICAgICAgICAgICAgICAgIGNyZWF0ZU92ZXJmbG93RWxlbWVudD17Y3JlYXRlT3ZlcmZsb3dFbGVtZW50fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgfVxuICAgIDwvPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcmVkTGlzdDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUUEsTUFBTUEsa0JBQWtCLEdBQUcsRUFBM0I7QUFDQSxNQUFNQyxvQkFBb0IsR0FBRyxFQUE3Qjs7QUFRQSxNQUFNQyxZQUFZLEdBQUcsUUFBMkM7RUFBQSxJQUExQztJQUFFQyxRQUFGO0lBQVlDLEtBQVo7SUFBbUJDO0VBQW5CLENBQTBDO0VBQzVELE1BQU0sQ0FBQ0MsVUFBRCxFQUFhQyxhQUFiLElBQThCLElBQUFDLGVBQUEsRUFBaUJSLGtCQUFqQixDQUFwQztFQUNBLE1BQU0sQ0FBQ1MsZ0JBQUQsRUFBbUJDLG1CQUFuQixJQUEwQyxJQUFBRixlQUFBLEVBQStCTCxRQUEvQixDQUFoRDtFQUVBLElBQUFRLGdCQUFBLEVBQVUsTUFBTTtJQUNaLElBQUlGLGdCQUFnQixHQUFHTixRQUF2Qjs7SUFDQSxJQUFJQyxLQUFKLEVBQVc7TUFDUCxNQUFNUSxPQUFPLEdBQUdSLEtBQUssQ0FBQ1MsV0FBTixFQUFoQjtNQUNBSixnQkFBZ0IsR0FBR04sUUFBUSxDQUFDVyxNQUFULENBQWlCQyxLQUFELElBQVdBLEtBQUssQ0FBQ0MsR0FBTixDQUFVQyxRQUFWLEdBQXFCSixXQUFyQixHQUFtQ0ssUUFBbkMsQ0FBNENOLE9BQTVDLENBQTNCLENBQW5CO0lBQ0g7O0lBQ0RGLG1CQUFtQixDQUFDRCxnQkFBRCxDQUFuQjtJQUNBRixhQUFhLENBQUNQLGtCQUFELENBQWI7RUFDSCxDQVJELEVBUUcsQ0FBQ0csUUFBRCxFQUFXQyxLQUFYLENBUkg7O0VBVUEsTUFBTWUsV0FBVyxHQUFHLENBQUNDLEtBQUQsRUFBZ0JDLEdBQWhCLEtBQXNEO0lBQ3RFLE9BQU9aLGdCQUFnQixDQUFDYSxLQUFqQixDQUF1QkYsS0FBdkIsRUFBOEJDLEdBQTlCLENBQVA7RUFDSCxDQUZEOztFQUlBLE1BQU1FLGFBQWEsR0FBRyxNQUFjO0lBQ2hDLE9BQU9kLGdCQUFnQixDQUFDZSxNQUF4QjtFQUNILENBRkQ7O0VBSUEsTUFBTUMscUJBQXFCLEdBQUcsQ0FBQ0MsYUFBRCxFQUF3QkMsVUFBeEIsS0FBK0M7SUFDekUsTUFBTUMsUUFBUSxHQUFHLE1BQU07TUFDbkJyQixhQUFhLENBQUNzQixHQUFHLElBQUlBLEdBQUcsR0FBRzVCLG9CQUFkLENBQWI7SUFDSCxDQUZEOztJQUlBLG9CQUFPO01BQVEsU0FBUyxFQUFDLG9CQUFsQjtNQUF1QyxPQUFPLEVBQUUyQjtJQUFoRCxHQUNELElBQUFFLG1CQUFBLEVBQUcseUJBQUgsRUFBOEI7TUFBRUMsS0FBSyxFQUFFTDtJQUFULENBQTlCLENBREMsQ0FBUDtFQUdILENBUkQ7O0VBVUEsb0JBQU8seUVBQ0gsNkJBQUMsY0FBRDtJQUNJLEtBQUssRUFBRSxJQUFBSSxtQkFBQSxFQUFHLGdCQUFILENBRFg7SUFFSSxTQUFTLEVBQUUsSUFGZjtJQUdJLElBQUksRUFBRSxFQUhWO0lBSUksSUFBSSxFQUFDLE1BSlQ7SUFLSSxZQUFZLEVBQUMsS0FMakI7SUFNSSxLQUFLLEVBQUUxQixLQU5YO0lBT0ksUUFBUSxFQUFFNEIsRUFBRSxJQUFJM0IsUUFBUSxDQUFDMkIsRUFBRSxDQUFDQyxNQUFILENBQVVDLEtBQVgsQ0FQNUI7SUFRSSxTQUFTLEVBQUMsOERBUmQsQ0FTSTtJQVRKO0lBVUksR0FBRyxFQUFFL0IsUUFBUSxHQUFHLENBQUgsQ0FBUixFQUFlYSxHQUFmLElBQXNCO0VBVi9CLEVBREcsRUFjRFAsZ0JBQWdCLENBQUNlLE1BQWpCLEdBQTBCLENBQTFCLEdBQ0ksSUFBQU0sbUJBQUEsRUFBRyxrQkFBSCxDQURKLGdCQUVJLDZCQUFDLHNCQUFEO0lBQ0UsV0FBVyxFQUFFWCxXQURmO0lBRUUsYUFBYSxFQUFFSSxhQUZqQjtJQUdFLFVBQVUsRUFBRWpCLFVBSGQ7SUFJRSxxQkFBcUIsRUFBRW1CO0VBSnpCLEVBaEJILENBQVA7QUF3QkgsQ0F4REQ7O2VBMERldkIsWSJ9