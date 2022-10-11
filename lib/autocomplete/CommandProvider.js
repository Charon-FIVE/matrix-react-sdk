"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../languageHandler");

var _AutocompleteProvider = _interopRequireDefault(require("./AutocompleteProvider"));

var _QueryMatcher = _interopRequireDefault(require("./QueryMatcher"));

var _Components = require("./Components");

var _SlashCommands = require("../SlashCommands");

/*
Copyright 2016 Aviral Dasgupta
Copyright 2017 Vector Creations Ltd
Copyright 2017 New Vector Ltd
Copyright 2018 Michael Telatynski <7t3chguy@gmail.com>

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
const COMMAND_RE = /(^\/\w*)(?: .*)?/g;

class CommandProvider extends _AutocompleteProvider.default {
  constructor(room, renderingType) {
    super({
      commandRegex: COMMAND_RE,
      renderingType
    });
    (0, _defineProperty2.default)(this, "matcher", void 0);
    this.matcher = new _QueryMatcher.default(_SlashCommands.Commands, {
      keys: ['command', 'args', 'description'],
      funcs: [_ref => {
        let {
          aliases
        } = _ref;
        return aliases.join(" ");
      }],
      // aliases
      context: renderingType
    });
  }

  async getCompletions(query, selection, force) {
    let limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;
    const {
      command,
      range
    } = this.getCurrentCommand(query, selection);
    if (!command) return [];
    let matches = []; // check if the full match differs from the first word (i.e. returns false if the command has args)

    if (command[0] !== command[1]) {
      // The input looks like a command with arguments, perform exact match
      const name = command[1].slice(1); // strip leading `/`

      if (_SlashCommands.CommandMap.has(name) && _SlashCommands.CommandMap.get(name).isEnabled()) {
        // some commands, namely `me` don't suit having the usage shown whilst typing their arguments
        if (_SlashCommands.CommandMap.get(name).hideCompletionAfterSpace) return [];
        matches = [_SlashCommands.CommandMap.get(name)];
      }
    } else {
      if (query === '/') {
        // If they have just entered `/` show everything
        // We exclude the limit on purpose to have a comprehensive list
        matches = _SlashCommands.Commands;
      } else {
        // otherwise fuzzy match against all of the fields
        matches = this.matcher.match(command[1], limit);
      }
    }

    return matches.filter(cmd => {
      const display = !cmd.renderingTypes || cmd.renderingTypes.includes(this.renderingType);
      return cmd.isEnabled() && display;
    }).map(result => {
      let completion = result.getCommand() + ' ';
      const usedAlias = result.aliases.find(alias => `/${alias}` === command[1]); // If the command (or an alias) is the same as the one they entered, we don't want to discard their arguments

      if (usedAlias || result.getCommand() === command[1]) {
        completion = command[0];
      }

      return {
        completion,
        type: "command",
        component: /*#__PURE__*/_react.default.createElement(_Components.TextualCompletion, {
          title: `/${usedAlias || result.command}`,
          subtitle: result.args,
          description: (0, _languageHandler._t)(result.description)
        }),
        range
      };
    });
  }

  getName() {
    return '*️⃣ ' + (0, _languageHandler._t)('Commands');
  }

  renderCompletions(completions) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Autocomplete_Completion_container_pill",
      role: "presentation",
      "aria-label": (0, _languageHandler._t)("Command Autocomplete")
    }, completions);
  }

}

exports.default = CommandProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDT01NQU5EX1JFIiwiQ29tbWFuZFByb3ZpZGVyIiwiQXV0b2NvbXBsZXRlUHJvdmlkZXIiLCJjb25zdHJ1Y3RvciIsInJvb20iLCJyZW5kZXJpbmdUeXBlIiwiY29tbWFuZFJlZ2V4IiwibWF0Y2hlciIsIlF1ZXJ5TWF0Y2hlciIsIkNvbW1hbmRzIiwia2V5cyIsImZ1bmNzIiwiYWxpYXNlcyIsImpvaW4iLCJjb250ZXh0IiwiZ2V0Q29tcGxldGlvbnMiLCJxdWVyeSIsInNlbGVjdGlvbiIsImZvcmNlIiwibGltaXQiLCJjb21tYW5kIiwicmFuZ2UiLCJnZXRDdXJyZW50Q29tbWFuZCIsIm1hdGNoZXMiLCJuYW1lIiwic2xpY2UiLCJDb21tYW5kTWFwIiwiaGFzIiwiZ2V0IiwiaXNFbmFibGVkIiwiaGlkZUNvbXBsZXRpb25BZnRlclNwYWNlIiwibWF0Y2giLCJmaWx0ZXIiLCJjbWQiLCJkaXNwbGF5IiwicmVuZGVyaW5nVHlwZXMiLCJpbmNsdWRlcyIsIm1hcCIsInJlc3VsdCIsImNvbXBsZXRpb24iLCJnZXRDb21tYW5kIiwidXNlZEFsaWFzIiwiZmluZCIsImFsaWFzIiwidHlwZSIsImNvbXBvbmVudCIsImFyZ3MiLCJfdCIsImRlc2NyaXB0aW9uIiwiZ2V0TmFtZSIsInJlbmRlckNvbXBsZXRpb25zIiwiY29tcGxldGlvbnMiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvYXV0b2NvbXBsZXRlL0NvbW1hbmRQcm92aWRlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IEF2aXJhbCBEYXNndXB0YVxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOCBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tJztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEF1dG9jb21wbGV0ZVByb3ZpZGVyIGZyb20gJy4vQXV0b2NvbXBsZXRlUHJvdmlkZXInO1xuaW1wb3J0IFF1ZXJ5TWF0Y2hlciBmcm9tICcuL1F1ZXJ5TWF0Y2hlcic7XG5pbXBvcnQgeyBUZXh0dWFsQ29tcGxldGlvbiB9IGZyb20gJy4vQ29tcG9uZW50cyc7XG5pbXBvcnQgeyBJQ29tcGxldGlvbiwgSVNlbGVjdGlvblJhbmdlIH0gZnJvbSBcIi4vQXV0b2NvbXBsZXRlclwiO1xuaW1wb3J0IHsgQ29tbWFuZCwgQ29tbWFuZHMsIENvbW1hbmRNYXAgfSBmcm9tICcuLi9TbGFzaENvbW1hbmRzJztcbmltcG9ydCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gJy4uL2NvbnRleHRzL1Jvb21Db250ZXh0JztcblxuY29uc3QgQ09NTUFORF9SRSA9IC8oXlxcL1xcdyopKD86IC4qKT8vZztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFByb3ZpZGVyIGV4dGVuZHMgQXV0b2NvbXBsZXRlUHJvdmlkZXIge1xuICAgIG1hdGNoZXI6IFF1ZXJ5TWF0Y2hlcjxDb21tYW5kPjtcblxuICAgIGNvbnN0cnVjdG9yKHJvb206IFJvb20sIHJlbmRlcmluZ1R5cGU/OiBUaW1lbGluZVJlbmRlcmluZ1R5cGUpIHtcbiAgICAgICAgc3VwZXIoeyBjb21tYW5kUmVnZXg6IENPTU1BTkRfUkUsIHJlbmRlcmluZ1R5cGUgfSk7XG4gICAgICAgIHRoaXMubWF0Y2hlciA9IG5ldyBRdWVyeU1hdGNoZXIoQ29tbWFuZHMsIHtcbiAgICAgICAgICAgIGtleXM6IFsnY29tbWFuZCcsICdhcmdzJywgJ2Rlc2NyaXB0aW9uJ10sXG4gICAgICAgICAgICBmdW5jczogWyh7IGFsaWFzZXMgfSkgPT4gYWxpYXNlcy5qb2luKFwiIFwiKV0sIC8vIGFsaWFzZXNcbiAgICAgICAgICAgIGNvbnRleHQ6IHJlbmRlcmluZ1R5cGUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGdldENvbXBsZXRpb25zKFxuICAgICAgICBxdWVyeTogc3RyaW5nLFxuICAgICAgICBzZWxlY3Rpb246IElTZWxlY3Rpb25SYW5nZSxcbiAgICAgICAgZm9yY2U/OiBib29sZWFuLFxuICAgICAgICBsaW1pdCA9IC0xLFxuICAgICk6IFByb21pc2U8SUNvbXBsZXRpb25bXT4ge1xuICAgICAgICBjb25zdCB7IGNvbW1hbmQsIHJhbmdlIH0gPSB0aGlzLmdldEN1cnJlbnRDb21tYW5kKHF1ZXJ5LCBzZWxlY3Rpb24pO1xuICAgICAgICBpZiAoIWNvbW1hbmQpIHJldHVybiBbXTtcblxuICAgICAgICBsZXQgbWF0Y2hlczogQ29tbWFuZFtdID0gW107XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBmdWxsIG1hdGNoIGRpZmZlcnMgZnJvbSB0aGUgZmlyc3Qgd29yZCAoaS5lLiByZXR1cm5zIGZhbHNlIGlmIHRoZSBjb21tYW5kIGhhcyBhcmdzKVxuICAgICAgICBpZiAoY29tbWFuZFswXSAhPT0gY29tbWFuZFsxXSkge1xuICAgICAgICAgICAgLy8gVGhlIGlucHV0IGxvb2tzIGxpa2UgYSBjb21tYW5kIHdpdGggYXJndW1lbnRzLCBwZXJmb3JtIGV4YWN0IG1hdGNoXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gY29tbWFuZFsxXS5zbGljZSgxKTsgLy8gc3RyaXAgbGVhZGluZyBgL2BcbiAgICAgICAgICAgIGlmIChDb21tYW5kTWFwLmhhcyhuYW1lKSAmJiBDb21tYW5kTWFwLmdldChuYW1lKS5pc0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgIC8vIHNvbWUgY29tbWFuZHMsIG5hbWVseSBgbWVgIGRvbid0IHN1aXQgaGF2aW5nIHRoZSB1c2FnZSBzaG93biB3aGlsc3QgdHlwaW5nIHRoZWlyIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgIGlmIChDb21tYW5kTWFwLmdldChuYW1lKS5oaWRlQ29tcGxldGlvbkFmdGVyU3BhY2UpIHJldHVybiBbXTtcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gW0NvbW1hbmRNYXAuZ2V0KG5hbWUpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChxdWVyeSA9PT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhleSBoYXZlIGp1c3QgZW50ZXJlZCBgL2Agc2hvdyBldmVyeXRoaW5nXG4gICAgICAgICAgICAgICAgLy8gV2UgZXhjbHVkZSB0aGUgbGltaXQgb24gcHVycG9zZSB0byBoYXZlIGEgY29tcHJlaGVuc2l2ZSBsaXN0XG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IENvbW1hbmRzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgZnV6enkgbWF0Y2ggYWdhaW5zdCBhbGwgb2YgdGhlIGZpZWxkc1xuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSB0aGlzLm1hdGNoZXIubWF0Y2goY29tbWFuZFsxXSwgbGltaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoZXMuZmlsdGVyKGNtZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5ID0gIWNtZC5yZW5kZXJpbmdUeXBlcyB8fCBjbWQucmVuZGVyaW5nVHlwZXMuaW5jbHVkZXModGhpcy5yZW5kZXJpbmdUeXBlKTtcbiAgICAgICAgICAgIHJldHVybiBjbWQuaXNFbmFibGVkKCkgJiYgZGlzcGxheTtcbiAgICAgICAgfSkubWFwKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGxldCBjb21wbGV0aW9uID0gcmVzdWx0LmdldENvbW1hbmQoKSArICcgJztcbiAgICAgICAgICAgIGNvbnN0IHVzZWRBbGlhcyA9IHJlc3VsdC5hbGlhc2VzLmZpbmQoYWxpYXMgPT4gYC8ke2FsaWFzfWAgPT09IGNvbW1hbmRbMV0pO1xuICAgICAgICAgICAgLy8gSWYgdGhlIGNvbW1hbmQgKG9yIGFuIGFsaWFzKSBpcyB0aGUgc2FtZSBhcyB0aGUgb25lIHRoZXkgZW50ZXJlZCwgd2UgZG9uJ3Qgd2FudCB0byBkaXNjYXJkIHRoZWlyIGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgKHVzZWRBbGlhcyB8fCByZXN1bHQuZ2V0Q29tbWFuZCgpID09PSBjb21tYW5kWzFdKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGlvbiA9IGNvbW1hbmRbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGlvbixcbiAgICAgICAgICAgICAgICB0eXBlOiBcImNvbW1hbmRcIixcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IDxUZXh0dWFsQ29tcGxldGlvblxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17YC8ke3VzZWRBbGlhcyB8fCByZXN1bHQuY29tbWFuZH1gfVxuICAgICAgICAgICAgICAgICAgICBzdWJ0aXRsZT17cmVzdWx0LmFyZ3N9XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtfdChyZXN1bHQuZGVzY3JpcHRpb24pfSAvPixcbiAgICAgICAgICAgICAgICByYW5nZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiAnKu+4j+KDoyAnICsgX3QoJ0NvbW1hbmRzJyk7XG4gICAgfVxuXG4gICAgcmVuZGVyQ29tcGxldGlvbnMoY29tcGxldGlvbnM6IFJlYWN0LlJlYWN0Tm9kZVtdKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BdXRvY29tcGxldGVfQ29tcGxldGlvbl9jb250YWluZXJfcGlsbFwiXG4gICAgICAgICAgICAgICAgcm9sZT1cInByZXNlbnRhdGlvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJDb21tYW5kIEF1dG9jb21wbGV0ZVwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNvbXBsZXRpb25zIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFtQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFBLE1BQU1BLFVBQVUsR0FBRyxtQkFBbkI7O0FBRWUsTUFBTUMsZUFBTixTQUE4QkMsNkJBQTlCLENBQW1EO0VBRzlEQyxXQUFXLENBQUNDLElBQUQsRUFBYUMsYUFBYixFQUFvRDtJQUMzRCxNQUFNO01BQUVDLFlBQVksRUFBRU4sVUFBaEI7TUFBNEJLO0lBQTVCLENBQU47SUFEMkQ7SUFFM0QsS0FBS0UsT0FBTCxHQUFlLElBQUlDLHFCQUFKLENBQWlCQyx1QkFBakIsRUFBMkI7TUFDdENDLElBQUksRUFBRSxDQUFDLFNBQUQsRUFBWSxNQUFaLEVBQW9CLGFBQXBCLENBRGdDO01BRXRDQyxLQUFLLEVBQUUsQ0FBQztRQUFBLElBQUM7VUFBRUM7UUFBRixDQUFEO1FBQUEsT0FBaUJBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLEdBQWIsQ0FBakI7TUFBQSxDQUFELENBRitCO01BRU87TUFDN0NDLE9BQU8sRUFBRVQ7SUFINkIsQ0FBM0IsQ0FBZjtFQUtIOztFQUVtQixNQUFkVSxjQUFjLENBQ2hCQyxLQURnQixFQUVoQkMsU0FGZ0IsRUFHaEJDLEtBSGdCLEVBS007SUFBQSxJQUR0QkMsS0FDc0IsdUVBRGQsQ0FBQyxDQUNhO0lBQ3RCLE1BQU07TUFBRUMsT0FBRjtNQUFXQztJQUFYLElBQXFCLEtBQUtDLGlCQUFMLENBQXVCTixLQUF2QixFQUE4QkMsU0FBOUIsQ0FBM0I7SUFDQSxJQUFJLENBQUNHLE9BQUwsRUFBYyxPQUFPLEVBQVA7SUFFZCxJQUFJRyxPQUFrQixHQUFHLEVBQXpCLENBSnNCLENBS3RCOztJQUNBLElBQUlILE9BQU8sQ0FBQyxDQUFELENBQVAsS0FBZUEsT0FBTyxDQUFDLENBQUQsQ0FBMUIsRUFBK0I7TUFDM0I7TUFDQSxNQUFNSSxJQUFJLEdBQUdKLE9BQU8sQ0FBQyxDQUFELENBQVAsQ0FBV0ssS0FBWCxDQUFpQixDQUFqQixDQUFiLENBRjJCLENBRU87O01BQ2xDLElBQUlDLHlCQUFBLENBQVdDLEdBQVgsQ0FBZUgsSUFBZixLQUF3QkUseUJBQUEsQ0FBV0UsR0FBWCxDQUFlSixJQUFmLEVBQXFCSyxTQUFyQixFQUE1QixFQUE4RDtRQUMxRDtRQUNBLElBQUlILHlCQUFBLENBQVdFLEdBQVgsQ0FBZUosSUFBZixFQUFxQk0sd0JBQXpCLEVBQW1ELE9BQU8sRUFBUDtRQUNuRFAsT0FBTyxHQUFHLENBQUNHLHlCQUFBLENBQVdFLEdBQVgsQ0FBZUosSUFBZixDQUFELENBQVY7TUFDSDtJQUNKLENBUkQsTUFRTztNQUNILElBQUlSLEtBQUssS0FBSyxHQUFkLEVBQW1CO1FBQ2Y7UUFDQTtRQUNBTyxPQUFPLEdBQUdkLHVCQUFWO01BQ0gsQ0FKRCxNQUlPO1FBQ0g7UUFDQWMsT0FBTyxHQUFHLEtBQUtoQixPQUFMLENBQWF3QixLQUFiLENBQW1CWCxPQUFPLENBQUMsQ0FBRCxDQUExQixFQUErQkQsS0FBL0IsQ0FBVjtNQUNIO0lBQ0o7O0lBRUQsT0FBT0ksT0FBTyxDQUFDUyxNQUFSLENBQWVDLEdBQUcsSUFBSTtNQUN6QixNQUFNQyxPQUFPLEdBQUcsQ0FBQ0QsR0FBRyxDQUFDRSxjQUFMLElBQXVCRixHQUFHLENBQUNFLGNBQUosQ0FBbUJDLFFBQW5CLENBQTRCLEtBQUsvQixhQUFqQyxDQUF2QztNQUNBLE9BQU80QixHQUFHLENBQUNKLFNBQUosTUFBbUJLLE9BQTFCO0lBQ0gsQ0FITSxFQUdKRyxHQUhJLENBR0NDLE1BQUQsSUFBWTtNQUNmLElBQUlDLFVBQVUsR0FBR0QsTUFBTSxDQUFDRSxVQUFQLEtBQXNCLEdBQXZDO01BQ0EsTUFBTUMsU0FBUyxHQUFHSCxNQUFNLENBQUMxQixPQUFQLENBQWU4QixJQUFmLENBQW9CQyxLQUFLLElBQUssSUFBR0EsS0FBTSxFQUFWLEtBQWdCdkIsT0FBTyxDQUFDLENBQUQsQ0FBcEQsQ0FBbEIsQ0FGZSxDQUdmOztNQUNBLElBQUlxQixTQUFTLElBQUlILE1BQU0sQ0FBQ0UsVUFBUCxPQUF3QnBCLE9BQU8sQ0FBQyxDQUFELENBQWhELEVBQXFEO1FBQ2pEbUIsVUFBVSxHQUFHbkIsT0FBTyxDQUFDLENBQUQsQ0FBcEI7TUFDSDs7TUFFRCxPQUFPO1FBQ0htQixVQURHO1FBRUhLLElBQUksRUFBRSxTQUZIO1FBR0hDLFNBQVMsZUFBRSw2QkFBQyw2QkFBRDtVQUNQLEtBQUssRUFBRyxJQUFHSixTQUFTLElBQUlILE1BQU0sQ0FBQ2xCLE9BQVEsRUFEaEM7VUFFUCxRQUFRLEVBQUVrQixNQUFNLENBQUNRLElBRlY7VUFHUCxXQUFXLEVBQUUsSUFBQUMsbUJBQUEsRUFBR1QsTUFBTSxDQUFDVSxXQUFWO1FBSE4sRUFIUjtRQU9IM0I7TUFQRyxDQUFQO0lBU0gsQ0FwQk0sQ0FBUDtFQXFCSDs7RUFFRDRCLE9BQU8sR0FBRztJQUNOLE9BQU8sU0FBUyxJQUFBRixtQkFBQSxFQUFHLFVBQUgsQ0FBaEI7RUFDSDs7RUFFREcsaUJBQWlCLENBQUNDLFdBQUQsRUFBa0Q7SUFDL0Qsb0JBQ0k7TUFDSSxTQUFTLEVBQUMsMkNBRGQ7TUFFSSxJQUFJLEVBQUMsY0FGVDtNQUdJLGNBQVksSUFBQUosbUJBQUEsRUFBRyxzQkFBSDtJQUhoQixHQUtNSSxXQUxOLENBREo7RUFTSDs7QUEvRTZEIn0=