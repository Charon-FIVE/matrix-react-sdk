"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SlashCommands = require("../../../SlashCommands");

var _InfoDialog = _interopRequireDefault(require("./InfoDialog"));

/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
const SlashCommandHelpDialog = _ref => {
  let {
    onFinished
  } = _ref;
  const categories = {};

  _SlashCommands.Commands.forEach(cmd => {
    if (!cmd.isEnabled()) return;

    if (!categories[cmd.category]) {
      categories[cmd.category] = [];
    }

    categories[cmd.category].push(cmd);
  });

  const body = Object.values(_SlashCommands.CommandCategories).filter(c => categories[c]).map(category => {
    const rows = [/*#__PURE__*/_react.default.createElement("tr", {
      key: "_category_" + category,
      className: "mx_SlashCommandHelpDialog_headerRow"
    }, /*#__PURE__*/_react.default.createElement("td", {
      colSpan: 3
    }, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)(category))))];
    categories[category].forEach(cmd => {
      rows.push( /*#__PURE__*/_react.default.createElement("tr", {
        key: cmd.command
      }, /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("strong", null, cmd.getCommand())), /*#__PURE__*/_react.default.createElement("td", null, cmd.args), /*#__PURE__*/_react.default.createElement("td", null, cmd.description)));
    });
    return rows;
  });
  return /*#__PURE__*/_react.default.createElement(_InfoDialog.default, {
    className: "mx_SlashCommandHelpDialog",
    title: (0, _languageHandler._t)("Command Help"),
    description: /*#__PURE__*/_react.default.createElement("table", null, /*#__PURE__*/_react.default.createElement("tbody", null, body)),
    hasCloseButton: true,
    onFinished: onFinished
  });
};

var _default = SlashCommandHelpDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTbGFzaENvbW1hbmRIZWxwRGlhbG9nIiwib25GaW5pc2hlZCIsImNhdGVnb3JpZXMiLCJDb21tYW5kcyIsImZvckVhY2giLCJjbWQiLCJpc0VuYWJsZWQiLCJjYXRlZ29yeSIsInB1c2giLCJib2R5IiwiT2JqZWN0IiwidmFsdWVzIiwiQ29tbWFuZENhdGVnb3JpZXMiLCJmaWx0ZXIiLCJjIiwibWFwIiwicm93cyIsIl90IiwiY29tbWFuZCIsImdldENvbW1hbmQiLCJhcmdzIiwiZGVzY3JpcHRpb24iXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1NsYXNoQ29tbWFuZEhlbHBEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IENvbW1hbmRDYXRlZ29yaWVzLCBDb21tYW5kcyB9IGZyb20gXCIuLi8uLi8uLi9TbGFzaENvbW1hbmRzXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCBJbmZvRGlhbG9nIGZyb20gXCIuL0luZm9EaWFsb2dcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7fVxuXG5jb25zdCBTbGFzaENvbW1hbmRIZWxwRGlhbG9nOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgb25GaW5pc2hlZCB9KSA9PiB7XG4gICAgY29uc3QgY2F0ZWdvcmllcyA9IHt9O1xuICAgIENvbW1hbmRzLmZvckVhY2goY21kID0+IHtcbiAgICAgICAgaWYgKCFjbWQuaXNFbmFibGVkKCkpIHJldHVybjtcbiAgICAgICAgaWYgKCFjYXRlZ29yaWVzW2NtZC5jYXRlZ29yeV0pIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbY21kLmNhdGVnb3J5XSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGNhdGVnb3JpZXNbY21kLmNhdGVnb3J5XS5wdXNoKGNtZCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBib2R5ID0gT2JqZWN0LnZhbHVlcyhDb21tYW5kQ2F0ZWdvcmllcykuZmlsdGVyKGMgPT4gY2F0ZWdvcmllc1tjXSkubWFwKChjYXRlZ29yeSkgPT4ge1xuICAgICAgICBjb25zdCByb3dzID0gW1xuICAgICAgICAgICAgPHRyIGtleT17XCJfY2F0ZWdvcnlfXCIgKyBjYXRlZ29yeX0gY2xhc3NOYW1lPVwibXhfU2xhc2hDb21tYW5kSGVscERpYWxvZ19oZWFkZXJSb3dcIj5cbiAgICAgICAgICAgICAgICA8dGQgY29sU3Bhbj17M30+XG4gICAgICAgICAgICAgICAgICAgIDxoMj57IF90KGNhdGVnb3J5KSB9PC9oMj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj4sXG4gICAgICAgIF07XG5cbiAgICAgICAgY2F0ZWdvcmllc1tjYXRlZ29yeV0uZm9yRWFjaChjbWQgPT4ge1xuICAgICAgICAgICAgcm93cy5wdXNoKDx0ciBrZXk9e2NtZC5jb21tYW5kfT5cbiAgICAgICAgICAgICAgICA8dGQ+PHN0cm9uZz57IGNtZC5nZXRDb21tYW5kKCkgfTwvc3Ryb25nPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPnsgY21kLmFyZ3MgfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPnsgY21kLmRlc2NyaXB0aW9uIH08L3RkPlxuICAgICAgICAgICAgPC90cj4pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcm93cztcbiAgICB9KTtcblxuICAgIHJldHVybiA8SW5mb0RpYWxvZ1xuICAgICAgICBjbGFzc05hbWU9XCJteF9TbGFzaENvbW1hbmRIZWxwRGlhbG9nXCJcbiAgICAgICAgdGl0bGU9e190KFwiQ29tbWFuZCBIZWxwXCIpfVxuICAgICAgICBkZXNjcmlwdGlvbj17PHRhYmxlPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgIHsgYm9keSB9XG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPn1cbiAgICAgICAgaGFzQ2xvc2VCdXR0b249e3RydWV9XG4gICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9IC8+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2xhc2hDb21tYW5kSGVscERpYWxvZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUVBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFXQSxNQUFNQSxzQkFBd0MsR0FBRyxRQUFvQjtFQUFBLElBQW5CO0lBQUVDO0VBQUYsQ0FBbUI7RUFDakUsTUFBTUMsVUFBVSxHQUFHLEVBQW5COztFQUNBQyx1QkFBQSxDQUFTQyxPQUFULENBQWlCQyxHQUFHLElBQUk7SUFDcEIsSUFBSSxDQUFDQSxHQUFHLENBQUNDLFNBQUosRUFBTCxFQUFzQjs7SUFDdEIsSUFBSSxDQUFDSixVQUFVLENBQUNHLEdBQUcsQ0FBQ0UsUUFBTCxDQUFmLEVBQStCO01BQzNCTCxVQUFVLENBQUNHLEdBQUcsQ0FBQ0UsUUFBTCxDQUFWLEdBQTJCLEVBQTNCO0lBQ0g7O0lBQ0RMLFVBQVUsQ0FBQ0csR0FBRyxDQUFDRSxRQUFMLENBQVYsQ0FBeUJDLElBQXpCLENBQThCSCxHQUE5QjtFQUNILENBTkQ7O0VBUUEsTUFBTUksSUFBSSxHQUFHQyxNQUFNLENBQUNDLE1BQVAsQ0FBY0MsZ0NBQWQsRUFBaUNDLE1BQWpDLENBQXdDQyxDQUFDLElBQUlaLFVBQVUsQ0FBQ1ksQ0FBRCxDQUF2RCxFQUE0REMsR0FBNUQsQ0FBaUVSLFFBQUQsSUFBYztJQUN2RixNQUFNUyxJQUFJLEdBQUcsY0FDVDtNQUFJLEdBQUcsRUFBRSxlQUFlVCxRQUF4QjtNQUFrQyxTQUFTLEVBQUM7SUFBNUMsZ0JBQ0k7TUFBSSxPQUFPLEVBQUU7SUFBYixnQkFDSSx5Q0FBTSxJQUFBVSxtQkFBQSxFQUFHVixRQUFILENBQU4sQ0FESixDQURKLENBRFMsQ0FBYjtJQVFBTCxVQUFVLENBQUNLLFFBQUQsQ0FBVixDQUFxQkgsT0FBckIsQ0FBNkJDLEdBQUcsSUFBSTtNQUNoQ1csSUFBSSxDQUFDUixJQUFMLGVBQVU7UUFBSSxHQUFHLEVBQUVILEdBQUcsQ0FBQ2E7TUFBYixnQkFDTixzREFBSSw2Q0FBVWIsR0FBRyxDQUFDYyxVQUFKLEVBQVYsQ0FBSixDQURNLGVBRU4seUNBQU1kLEdBQUcsQ0FBQ2UsSUFBVixDQUZNLGVBR04seUNBQU1mLEdBQUcsQ0FBQ2dCLFdBQVYsQ0FITSxDQUFWO0lBS0gsQ0FORDtJQVFBLE9BQU9MLElBQVA7RUFDSCxDQWxCWSxDQUFiO0VBb0JBLG9CQUFPLDZCQUFDLG1CQUFEO0lBQ0gsU0FBUyxFQUFDLDJCQURQO0lBRUgsS0FBSyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsY0FBSCxDQUZKO0lBR0gsV0FBVyxlQUFFLHlEQUNULDRDQUNNUixJQUROLENBRFMsQ0FIVjtJQVFILGNBQWMsRUFBRSxJQVJiO0lBU0gsVUFBVSxFQUFFUjtFQVRULEVBQVA7QUFVSCxDQXhDRDs7ZUEwQ2VELHNCIn0=