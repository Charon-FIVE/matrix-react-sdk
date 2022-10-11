"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _lodash = require("lodash");

var _emoticon = _interopRequireDefault(require("emojibase-regex/emoticon"));

var _languageHandler = require("../languageHandler");

var _AutocompleteProvider = _interopRequireDefault(require("./AutocompleteProvider"));

var _QueryMatcher = _interopRequireDefault(require("./QueryMatcher"));

var _Components = require("./Components");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _emoji = require("../emoji");

var recent = _interopRequireWildcard(require("../emojipicker/recent"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2016 Aviral Dasgupta
Copyright 2017 Vector Creations Ltd
Copyright 2017, 2018 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.
Copyright 2022 Ryan Browne <code@commonlawfeature.com>

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
const LIMIT = 20; // Match for ascii-style ";-)" emoticons or ":wink:" shortcodes provided by emojibase
// anchored to only match from the start of parts otherwise it'll show emoji suggestions whilst typing matrix IDs

const EMOJI_REGEX = new RegExp('(' + _emoticon.default.source + '|(?:^|\\s):[+-\\w]*:?)$', 'g');

const SORTED_EMOJI = _emoji.EMOJI.sort((a, b) => {
  if (a.group === b.group) {
    return a.order - b.order;
  }

  return a.group - b.group;
}).map((emoji, index) => ({
  emoji,
  // Include the index so that we can preserve the original order
  _orderBy: index
}));

function score(query, space) {
  const index = space.indexOf(query);

  if (index === -1) {
    return Infinity;
  } else {
    return index;
  }
}

function colonsTrimmed(str) {
  // Trim off leading and potentially trailing `:` to correctly match the emoji data as they exist in emojibase.
  // Notes: The regex is pinned to the start and end of the string so that we can use the lazy-capturing `*?` matcher.
  // It needs to be lazy so that the trailing `:` is not captured in the replacement group, if it exists.
  return str.replace(/^:(.*?):?$/, "$1");
}

class EmojiProvider extends _AutocompleteProvider.default {
  constructor(room, renderingType) {
    super({
      commandRegex: EMOJI_REGEX,
      renderingType
    });
    (0, _defineProperty2.default)(this, "matcher", void 0);
    (0, _defineProperty2.default)(this, "nameMatcher", void 0);
    (0, _defineProperty2.default)(this, "recentlyUsed", void 0);
    this.matcher = new _QueryMatcher.default(SORTED_EMOJI, {
      keys: [],
      funcs: [o => o.emoji.shortcodes.map(s => `:${s}:`)],
      // For matching against ascii equivalents
      shouldMatchWordsOnly: false
    });
    this.nameMatcher = new _QueryMatcher.default(SORTED_EMOJI, {
      keys: ['emoji.label'],
      // For removing punctuation
      shouldMatchWordsOnly: true
    });
    this.recentlyUsed = Array.from(new Set(recent.get().map(_emoji.getEmojiFromUnicode).filter(Boolean)));
  }

  async getCompletions(query, selection, force) {
    let limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;

    if (!_SettingsStore.default.getValue("MessageComposerInput.suggestEmoji")) {
      return []; // don't give any suggestions if the user doesn't want them
    }

    let completions = [];
    const {
      command,
      range
    } = this.getCurrentCommand(query, selection);

    if (command && command[0].length > 2) {
      const matchedString = command[0];
      completions = this.matcher.match(matchedString, limit); // Do second match with shouldMatchWordsOnly in order to match against 'name'

      completions = completions.concat(this.nameMatcher.match(matchedString));
      let sorters = []; // make sure that emoticons come first

      sorters.push(c => score(matchedString, c.emoji.emoticon || "")); // then sort by score (Infinity if matchedString not in shortcode)

      sorters.push(c => score(matchedString, c.emoji.shortcodes[0])); // then sort by max score of all shortcodes, trim off the `:`

      const trimmedMatch = colonsTrimmed(matchedString);
      sorters.push(c => Math.min(...c.emoji.shortcodes.map(s => score(trimmedMatch, s)))); // If the matchedString is not empty, sort by length of shortcode. Example:
      //  matchedString = ":bookmark"
      //  completions = [":bookmark:", ":bookmark_tabs:", ...]

      if (matchedString.length > 1) {
        sorters.push(c => c.emoji.shortcodes[0].length);
      } // Finally, sort by original ordering


      sorters.push(c => c._orderBy);
      completions = (0, _lodash.sortBy)((0, _lodash.uniq)(completions), sorters);
      completions = completions.slice(0, LIMIT); // Do a second sort to place emoji matching with frequently used one on top

      sorters = [];
      this.recentlyUsed.forEach(emoji => {
        sorters.push(c => score(emoji.shortcodes[0], c.emoji.shortcodes[0]));
      });
      completions = (0, _lodash.sortBy)((0, _lodash.uniq)(completions), sorters);
      completions = completions.map(c => ({
        completion: c.emoji.unicode,
        component: /*#__PURE__*/_react.default.createElement(_Components.PillCompletion, {
          title: `:${c.emoji.shortcodes[0]}:`,
          "aria-label": c.emoji.unicode
        }, /*#__PURE__*/_react.default.createElement("span", null, c.emoji.unicode)),
        range
      }));
    }

    return completions;
  }

  getName() {
    return '😃 ' + (0, _languageHandler._t)('Emoji');
  }

  renderCompletions(completions) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Autocomplete_Completion_container_pill",
      role: "presentation",
      "aria-label": (0, _languageHandler._t)("Emoji Autocomplete")
    }, completions);
  }

}

exports.default = EmojiProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMSU1JVCIsIkVNT0pJX1JFR0VYIiwiUmVnRXhwIiwiRU1PVElDT05fUkVHRVgiLCJzb3VyY2UiLCJTT1JURURfRU1PSkkiLCJFTU9KSSIsInNvcnQiLCJhIiwiYiIsImdyb3VwIiwib3JkZXIiLCJtYXAiLCJlbW9qaSIsImluZGV4IiwiX29yZGVyQnkiLCJzY29yZSIsInF1ZXJ5Iiwic3BhY2UiLCJpbmRleE9mIiwiSW5maW5pdHkiLCJjb2xvbnNUcmltbWVkIiwic3RyIiwicmVwbGFjZSIsIkVtb2ppUHJvdmlkZXIiLCJBdXRvY29tcGxldGVQcm92aWRlciIsImNvbnN0cnVjdG9yIiwicm9vbSIsInJlbmRlcmluZ1R5cGUiLCJjb21tYW5kUmVnZXgiLCJtYXRjaGVyIiwiUXVlcnlNYXRjaGVyIiwia2V5cyIsImZ1bmNzIiwibyIsInNob3J0Y29kZXMiLCJzIiwic2hvdWxkTWF0Y2hXb3Jkc09ubHkiLCJuYW1lTWF0Y2hlciIsInJlY2VudGx5VXNlZCIsIkFycmF5IiwiZnJvbSIsIlNldCIsInJlY2VudCIsImdldCIsImdldEVtb2ppRnJvbVVuaWNvZGUiLCJmaWx0ZXIiLCJCb29sZWFuIiwiZ2V0Q29tcGxldGlvbnMiLCJzZWxlY3Rpb24iLCJmb3JjZSIsImxpbWl0IiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiY29tcGxldGlvbnMiLCJjb21tYW5kIiwicmFuZ2UiLCJnZXRDdXJyZW50Q29tbWFuZCIsImxlbmd0aCIsIm1hdGNoZWRTdHJpbmciLCJtYXRjaCIsImNvbmNhdCIsInNvcnRlcnMiLCJwdXNoIiwiYyIsImVtb3RpY29uIiwidHJpbW1lZE1hdGNoIiwiTWF0aCIsIm1pbiIsInNvcnRCeSIsInVuaXEiLCJzbGljZSIsImZvckVhY2giLCJjb21wbGV0aW9uIiwidW5pY29kZSIsImNvbXBvbmVudCIsImdldE5hbWUiLCJfdCIsInJlbmRlckNvbXBsZXRpb25zIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F1dG9jb21wbGV0ZS9FbW9qaVByb3ZpZGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgQXZpcmFsIERhc2d1cHRhXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5Db3B5cmlnaHQgMjAyMiBSeWFuIEJyb3duZSA8Y29kZUBjb21tb25sYXdmZWF0dXJlLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdW5pcSwgc29ydEJ5IH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBFTU9USUNPTl9SRUdFWCBmcm9tICdlbW9qaWJhc2UtcmVnZXgvZW1vdGljb24nO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tJztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEF1dG9jb21wbGV0ZVByb3ZpZGVyIGZyb20gJy4vQXV0b2NvbXBsZXRlUHJvdmlkZXInO1xuaW1wb3J0IFF1ZXJ5TWF0Y2hlciBmcm9tICcuL1F1ZXJ5TWF0Y2hlcic7XG5pbXBvcnQgeyBQaWxsQ29tcGxldGlvbiB9IGZyb20gJy4vQ29tcG9uZW50cyc7XG5pbXBvcnQgeyBJQ29tcGxldGlvbiwgSVNlbGVjdGlvblJhbmdlIH0gZnJvbSAnLi9BdXRvY29tcGxldGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBFTU9KSSwgSUVtb2ppLCBnZXRFbW9qaUZyb21Vbmljb2RlIH0gZnJvbSAnLi4vZW1vamknO1xuaW1wb3J0IHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSAnLi4vY29udGV4dHMvUm9vbUNvbnRleHQnO1xuaW1wb3J0ICogYXMgcmVjZW50IGZyb20gJy4uL2Vtb2ppcGlja2VyL3JlY2VudCc7XG5cbmNvbnN0IExJTUlUID0gMjA7XG5cbi8vIE1hdGNoIGZvciBhc2NpaS1zdHlsZSBcIjstKVwiIGVtb3RpY29ucyBvciBcIjp3aW5rOlwiIHNob3J0Y29kZXMgcHJvdmlkZWQgYnkgZW1vamliYXNlXG4vLyBhbmNob3JlZCB0byBvbmx5IG1hdGNoIGZyb20gdGhlIHN0YXJ0IG9mIHBhcnRzIG90aGVyd2lzZSBpdCdsbCBzaG93IGVtb2ppIHN1Z2dlc3Rpb25zIHdoaWxzdCB0eXBpbmcgbWF0cml4IElEc1xuY29uc3QgRU1PSklfUkVHRVggPSBuZXcgUmVnRXhwKCcoJyArIEVNT1RJQ09OX1JFR0VYLnNvdXJjZSArICd8KD86XnxcXFxccyk6WystXFxcXHddKjo/KSQnLCAnZycpO1xuXG5pbnRlcmZhY2UgSVNvcnRlZEVtb2ppIHtcbiAgICBlbW9qaTogSUVtb2ppO1xuICAgIF9vcmRlckJ5OiBudW1iZXI7XG59XG5cbmNvbnN0IFNPUlRFRF9FTU9KSTogSVNvcnRlZEVtb2ppW10gPSBFTU9KSS5zb3J0KChhLCBiKSA9PiB7XG4gICAgaWYgKGEuZ3JvdXAgPT09IGIuZ3JvdXApIHtcbiAgICAgICAgcmV0dXJuIGEub3JkZXIgLSBiLm9yZGVyO1xuICAgIH1cbiAgICByZXR1cm4gYS5ncm91cCAtIGIuZ3JvdXA7XG59KS5tYXAoKGVtb2ppLCBpbmRleCkgPT4gKHtcbiAgICBlbW9qaSxcbiAgICAvLyBJbmNsdWRlIHRoZSBpbmRleCBzbyB0aGF0IHdlIGNhbiBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgb3JkZXJcbiAgICBfb3JkZXJCeTogaW5kZXgsXG59KSk7XG5cbmZ1bmN0aW9uIHNjb3JlKHF1ZXJ5LCBzcGFjZSkge1xuICAgIGNvbnN0IGluZGV4ID0gc3BhY2UuaW5kZXhPZihxdWVyeSk7XG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY29sb25zVHJpbW1lZChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gVHJpbSBvZmYgbGVhZGluZyBhbmQgcG90ZW50aWFsbHkgdHJhaWxpbmcgYDpgIHRvIGNvcnJlY3RseSBtYXRjaCB0aGUgZW1vamkgZGF0YSBhcyB0aGV5IGV4aXN0IGluIGVtb2ppYmFzZS5cbiAgICAvLyBOb3RlczogVGhlIHJlZ2V4IGlzIHBpbm5lZCB0byB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgc3RyaW5nIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGUgbGF6eS1jYXB0dXJpbmcgYCo/YCBtYXRjaGVyLlxuICAgIC8vIEl0IG5lZWRzIHRvIGJlIGxhenkgc28gdGhhdCB0aGUgdHJhaWxpbmcgYDpgIGlzIG5vdCBjYXB0dXJlZCBpbiB0aGUgcmVwbGFjZW1lbnQgZ3JvdXAsIGlmIGl0IGV4aXN0cy5cbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL146KC4qPyk6PyQvLCBcIiQxXCIpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbW9qaVByb3ZpZGVyIGV4dGVuZHMgQXV0b2NvbXBsZXRlUHJvdmlkZXIge1xuICAgIG1hdGNoZXI6IFF1ZXJ5TWF0Y2hlcjxJU29ydGVkRW1vamk+O1xuICAgIG5hbWVNYXRjaGVyOiBRdWVyeU1hdGNoZXI8SVNvcnRlZEVtb2ppPjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlY2VudGx5VXNlZDogSUVtb2ppW107XG5cbiAgICBjb25zdHJ1Y3Rvcihyb29tOiBSb29tLCByZW5kZXJpbmdUeXBlPzogVGltZWxpbmVSZW5kZXJpbmdUeXBlKSB7XG4gICAgICAgIHN1cGVyKHsgY29tbWFuZFJlZ2V4OiBFTU9KSV9SRUdFWCwgcmVuZGVyaW5nVHlwZSB9KTtcbiAgICAgICAgdGhpcy5tYXRjaGVyID0gbmV3IFF1ZXJ5TWF0Y2hlcjxJU29ydGVkRW1vamk+KFNPUlRFRF9FTU9KSSwge1xuICAgICAgICAgICAga2V5czogW10sXG4gICAgICAgICAgICBmdW5jczogW28gPT4gby5lbW9qaS5zaG9ydGNvZGVzLm1hcChzID0+IGA6JHtzfTpgKV0sXG4gICAgICAgICAgICAvLyBGb3IgbWF0Y2hpbmcgYWdhaW5zdCBhc2NpaSBlcXVpdmFsZW50c1xuICAgICAgICAgICAgc2hvdWxkTWF0Y2hXb3Jkc09ubHk6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5uYW1lTWF0Y2hlciA9IG5ldyBRdWVyeU1hdGNoZXIoU09SVEVEX0VNT0pJLCB7XG4gICAgICAgICAgICBrZXlzOiBbJ2Vtb2ppLmxhYmVsJ10sXG4gICAgICAgICAgICAvLyBGb3IgcmVtb3ZpbmcgcHVuY3R1YXRpb25cbiAgICAgICAgICAgIHNob3VsZE1hdGNoV29yZHNPbmx5OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlY2VudGx5VXNlZCA9IEFycmF5LmZyb20obmV3IFNldChyZWNlbnQuZ2V0KCkubWFwKGdldEVtb2ppRnJvbVVuaWNvZGUpLmZpbHRlcihCb29sZWFuKSkpO1xuICAgIH1cblxuICAgIGFzeW5jIGdldENvbXBsZXRpb25zKFxuICAgICAgICBxdWVyeTogc3RyaW5nLFxuICAgICAgICBzZWxlY3Rpb246IElTZWxlY3Rpb25SYW5nZSxcbiAgICAgICAgZm9yY2U/OiBib29sZWFuLFxuICAgICAgICBsaW1pdCA9IC0xLFxuICAgICk6IFByb21pc2U8SUNvbXBsZXRpb25bXT4ge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zdWdnZXN0RW1vamlcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTsgLy8gZG9uJ3QgZ2l2ZSBhbnkgc3VnZ2VzdGlvbnMgaWYgdGhlIHVzZXIgZG9lc24ndCB3YW50IHRoZW1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb21wbGV0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCB7IGNvbW1hbmQsIHJhbmdlIH0gPSB0aGlzLmdldEN1cnJlbnRDb21tYW5kKHF1ZXJ5LCBzZWxlY3Rpb24pO1xuXG4gICAgICAgIGlmIChjb21tYW5kICYmIGNvbW1hbmRbMF0ubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlZFN0cmluZyA9IGNvbW1hbmRbMF07XG4gICAgICAgICAgICBjb21wbGV0aW9ucyA9IHRoaXMubWF0Y2hlci5tYXRjaChtYXRjaGVkU3RyaW5nLCBsaW1pdCk7XG5cbiAgICAgICAgICAgIC8vIERvIHNlY29uZCBtYXRjaCB3aXRoIHNob3VsZE1hdGNoV29yZHNPbmx5IGluIG9yZGVyIHRvIG1hdGNoIGFnYWluc3QgJ25hbWUnXG4gICAgICAgICAgICBjb21wbGV0aW9ucyA9IGNvbXBsZXRpb25zLmNvbmNhdCh0aGlzLm5hbWVNYXRjaGVyLm1hdGNoKG1hdGNoZWRTdHJpbmcpKTtcblxuICAgICAgICAgICAgbGV0IHNvcnRlcnMgPSBbXTtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IGVtb3RpY29ucyBjb21lIGZpcnN0XG4gICAgICAgICAgICBzb3J0ZXJzLnB1c2goYyA9PiBzY29yZShtYXRjaGVkU3RyaW5nLCBjLmVtb2ppLmVtb3RpY29uIHx8IFwiXCIpKTtcblxuICAgICAgICAgICAgLy8gdGhlbiBzb3J0IGJ5IHNjb3JlIChJbmZpbml0eSBpZiBtYXRjaGVkU3RyaW5nIG5vdCBpbiBzaG9ydGNvZGUpXG4gICAgICAgICAgICBzb3J0ZXJzLnB1c2goYyA9PiBzY29yZShtYXRjaGVkU3RyaW5nLCBjLmVtb2ppLnNob3J0Y29kZXNbMF0pKTtcbiAgICAgICAgICAgIC8vIHRoZW4gc29ydCBieSBtYXggc2NvcmUgb2YgYWxsIHNob3J0Y29kZXMsIHRyaW0gb2ZmIHRoZSBgOmBcbiAgICAgICAgICAgIGNvbnN0IHRyaW1tZWRNYXRjaCA9IGNvbG9uc1RyaW1tZWQobWF0Y2hlZFN0cmluZyk7XG4gICAgICAgICAgICBzb3J0ZXJzLnB1c2goYyA9PiBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAuLi5jLmVtb2ppLnNob3J0Y29kZXMubWFwKHMgPT4gc2NvcmUodHJpbW1lZE1hdGNoLCBzKSksXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIC8vIElmIHRoZSBtYXRjaGVkU3RyaW5nIGlzIG5vdCBlbXB0eSwgc29ydCBieSBsZW5ndGggb2Ygc2hvcnRjb2RlLiBFeGFtcGxlOlxuICAgICAgICAgICAgLy8gIG1hdGNoZWRTdHJpbmcgPSBcIjpib29rbWFya1wiXG4gICAgICAgICAgICAvLyAgY29tcGxldGlvbnMgPSBbXCI6Ym9va21hcms6XCIsIFwiOmJvb2ttYXJrX3RhYnM6XCIsIC4uLl1cbiAgICAgICAgICAgIGlmIChtYXRjaGVkU3RyaW5nLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBzb3J0ZXJzLnB1c2goYyA9PiBjLmVtb2ppLnNob3J0Y29kZXNbMF0ubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZpbmFsbHksIHNvcnQgYnkgb3JpZ2luYWwgb3JkZXJpbmdcbiAgICAgICAgICAgIHNvcnRlcnMucHVzaChjID0+IGMuX29yZGVyQnkpO1xuICAgICAgICAgICAgY29tcGxldGlvbnMgPSBzb3J0QnkodW5pcShjb21wbGV0aW9ucyksIHNvcnRlcnMpO1xuXG4gICAgICAgICAgICBjb21wbGV0aW9ucyA9IGNvbXBsZXRpb25zLnNsaWNlKDAsIExJTUlUKTtcblxuICAgICAgICAgICAgLy8gRG8gYSBzZWNvbmQgc29ydCB0byBwbGFjZSBlbW9qaSBtYXRjaGluZyB3aXRoIGZyZXF1ZW50bHkgdXNlZCBvbmUgb24gdG9wXG4gICAgICAgICAgICBzb3J0ZXJzID0gW107XG4gICAgICAgICAgICB0aGlzLnJlY2VudGx5VXNlZC5mb3JFYWNoKGVtb2ppID0+IHtcbiAgICAgICAgICAgICAgICBzb3J0ZXJzLnB1c2goYyA9PiBzY29yZShlbW9qaS5zaG9ydGNvZGVzWzBdLCBjLmVtb2ppLnNob3J0Y29kZXNbMF0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29tcGxldGlvbnMgPSBzb3J0QnkodW5pcShjb21wbGV0aW9ucyksIHNvcnRlcnMpO1xuXG4gICAgICAgICAgICBjb21wbGV0aW9ucyA9IGNvbXBsZXRpb25zLm1hcChjID0+ICh7XG4gICAgICAgICAgICAgICAgY29tcGxldGlvbjogYy5lbW9qaS51bmljb2RlLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogKFxuICAgICAgICAgICAgICAgICAgICA8UGlsbENvbXBsZXRpb24gdGl0bGU9e2A6JHtjLmVtb2ppLnNob3J0Y29kZXNbMF19OmB9IGFyaWEtbGFiZWw9e2MuZW1vamkudW5pY29kZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57IGMuZW1vamkudW5pY29kZSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L1BpbGxDb21wbGV0aW9uPlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXRpb25zO1xuICAgIH1cblxuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiAn8J+YgyAnICsgX3QoJ0Vtb2ppJyk7XG4gICAgfVxuXG4gICAgcmVuZGVyQ29tcGxldGlvbnMoY29tcGxldGlvbnM6IFJlYWN0LlJlYWN0Tm9kZVtdKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BdXRvY29tcGxldGVfQ29tcGxldGlvbl9jb250YWluZXJfcGlsbFwiXG4gICAgICAgICAgICAgICAgcm9sZT1cInByZXNlbnRhdGlvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJFbW9qaSBBdXRvY29tcGxldGVcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBjb21wbGV0aW9ucyB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOzs7Ozs7QUFqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkEsTUFBTUEsS0FBSyxHQUFHLEVBQWQsQyxDQUVBO0FBQ0E7O0FBQ0EsTUFBTUMsV0FBVyxHQUFHLElBQUlDLE1BQUosQ0FBVyxNQUFNQyxpQkFBQSxDQUFlQyxNQUFyQixHQUE4Qix5QkFBekMsRUFBb0UsR0FBcEUsQ0FBcEI7O0FBT0EsTUFBTUMsWUFB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