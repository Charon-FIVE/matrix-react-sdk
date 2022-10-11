"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LegacyCallInviteEventPreview = void 0;

var _utils = require("./utils");

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
class LegacyCallInviteEventPreview {
  getTextFor(event, tagId) {
    if ((0, _utils.shouldPrefixMessagesIn)(event.getRoomId(), tagId)) {
      if ((0, _utils.isSelf)(event)) {
        return (0, _languageHandler._t)("You started a call");
      } else {
        return (0, _languageHandler._t)("%(senderName)s started a call", {
          senderName: (0, _utils.getSenderName)(event)
        });
      }
    } else {
      if ((0, _utils.isSelf)(event)) {
        return (0, _languageHandler._t)("Waiting for answer");
      } else {
        return (0, _languageHandler._t)("%(senderName)s is calling", {
          senderName: (0, _utils.getSenderName)(event)
        });
      }
    }
  }

}

exports.LegacyCallInviteEventPreview = LegacyCallInviteEventPreview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMZWdhY3lDYWxsSW52aXRlRXZlbnRQcmV2aWV3IiwiZ2V0VGV4dEZvciIsImV2ZW50IiwidGFnSWQiLCJzaG91bGRQcmVmaXhNZXNzYWdlc0luIiwiZ2V0Um9vbUlkIiwiaXNTZWxmIiwiX3QiLCJzZW5kZXJOYW1lIiwiZ2V0U2VuZGVyTmFtZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L3ByZXZpZXdzL0xlZ2FjeUNhbGxJbnZpdGVFdmVudFByZXZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCB7IElQcmV2aWV3IH0gZnJvbSBcIi4vSVByZXZpZXdcIjtcbmltcG9ydCB7IFRhZ0lEIH0gZnJvbSBcIi4uL21vZGVsc1wiO1xuaW1wb3J0IHsgZ2V0U2VuZGVyTmFtZSwgaXNTZWxmLCBzaG91bGRQcmVmaXhNZXNzYWdlc0luIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5leHBvcnQgY2xhc3MgTGVnYWN5Q2FsbEludml0ZUV2ZW50UHJldmlldyBpbXBsZW1lbnRzIElQcmV2aWV3IHtcbiAgICBwdWJsaWMgZ2V0VGV4dEZvcihldmVudDogTWF0cml4RXZlbnQsIHRhZ0lkPzogVGFnSUQpOiBzdHJpbmcge1xuICAgICAgICBpZiAoc2hvdWxkUHJlZml4TWVzc2FnZXNJbihldmVudC5nZXRSb29tSWQoKSwgdGFnSWQpKSB7XG4gICAgICAgICAgICBpZiAoaXNTZWxmKGV2ZW50KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIllvdSBzdGFydGVkIGEgY2FsbFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXMgc3RhcnRlZCBhIGNhbGxcIiwgeyBzZW5kZXJOYW1lOiBnZXRTZW5kZXJOYW1lKGV2ZW50KSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc1NlbGYoZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiV2FpdGluZyBmb3IgYW5zd2VyXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoXCIlKHNlbmRlck5hbWUpcyBpcyBjYWxsaW5nXCIsIHsgc2VuZGVyTmFtZTogZ2V0U2VuZGVyTmFtZShldmVudCkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFvQkE7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNPLE1BQU1BLDRCQUFOLENBQXVEO0VBQ25EQyxVQUFVLENBQUNDLEtBQUQsRUFBcUJDLEtBQXJCLEVBQTRDO0lBQ3pELElBQUksSUFBQUMsNkJBQUEsRUFBdUJGLEtBQUssQ0FBQ0csU0FBTixFQUF2QixFQUEwQ0YsS0FBMUMsQ0FBSixFQUFzRDtNQUNsRCxJQUFJLElBQUFHLGFBQUEsRUFBT0osS0FBUCxDQUFKLEVBQW1CO1FBQ2YsT0FBTyxJQUFBSyxtQkFBQSxFQUFHLG9CQUFILENBQVA7TUFDSCxDQUZELE1BRU87UUFDSCxPQUFPLElBQUFBLG1CQUFBLEVBQUcsK0JBQUgsRUFBb0M7VUFBRUMsVUFBVSxFQUFFLElBQUFDLG9CQUFBLEVBQWNQLEtBQWQ7UUFBZCxDQUFwQyxDQUFQO01BQ0g7SUFDSixDQU5ELE1BTU87TUFDSCxJQUFJLElBQUFJLGFBQUEsRUFBT0osS0FBUCxDQUFKLEVBQW1CO1FBQ2YsT0FBTyxJQUFBSyxtQkFBQSxFQUFHLG9CQUFILENBQVA7TUFDSCxDQUZELE1BRU87UUFDSCxPQUFPLElBQUFBLG1CQUFBLEVBQUcsMkJBQUgsRUFBZ0M7VUFBRUMsVUFBVSxFQUFFLElBQUFDLG9CQUFBLEVBQWNQLEtBQWQ7UUFBZCxDQUFoQyxDQUFQO01BQ0g7SUFDSjtFQUNKOztBQWZ5RCJ9