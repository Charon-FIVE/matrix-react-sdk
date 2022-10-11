"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationUtils = void 0;

var _PushRules = require("matrix-js-sdk/src/@types/PushRules");

/*
Copyright 2016 - 2021 The Matrix.org Foundation C.I.C.

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
class NotificationUtils {
  // Encodes a dictionary of {
  //   "notify": true/false,
  //   "sound": string or undefined,
  //   "highlight: true/false,
  // }
  // to a list of push actions.
  static encodeActions(action) {
    const notify = action.notify;
    const sound = action.sound;
    const highlight = action.highlight;

    if (notify) {
      const actions = [_PushRules.PushRuleActionName.Notify];

      if (sound) {
        actions.push({
          "set_tweak": "sound",
          "value": sound
        });
      }

      if (highlight) {
        actions.push({
          "set_tweak": "highlight"
        });
      } else {
        actions.push({
          "set_tweak": "highlight",
          "value": false
        });
      }

      return actions;
    } else {
      return [_PushRules.PushRuleActionName.DontNotify];
    }
  } // Decode a list of actions to a dictionary of {
  //   "notify": true/false,
  //   "sound": string or undefined,
  //   "highlight: true/false,
  // }
  // If the actions couldn't be decoded then returns null.


  static decodeActions(actions) {
    let notify = false;
    let sound = null;
    let highlight = false;

    for (let i = 0; i < actions.length; ++i) {
      const action = actions[i];

      if (action === _PushRules.PushRuleActionName.Notify) {
        notify = true;
      } else if (action === _PushRules.PushRuleActionName.DontNotify) {
        notify = false;
      } else if (typeof action === "object") {
        if (action.set_tweak === "sound") {
          sound = action.value;
        } else if (action.set_tweak === "highlight") {
          highlight = action.value;
        } else {
          // We don't understand this kind of tweak, so give up.
          return null;
        }
      } else {
        // We don't understand this kind of action, so give up.
        return null;
      }
    }

    if (highlight === undefined) {
      // If a highlight tweak is missing a value then it defaults to true.
      highlight = true;
    }

    const result = {
      notify,
      highlight
    };

    if (sound !== null) {
      result.sound = sound;
    }

    return result;
  }

}

exports.NotificationUtils = NotificationUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb3RpZmljYXRpb25VdGlscyIsImVuY29kZUFjdGlvbnMiLCJhY3Rpb24iLCJub3RpZnkiLCJzb3VuZCIsImhpZ2hsaWdodCIsImFjdGlvbnMiLCJQdXNoUnVsZUFjdGlvbk5hbWUiLCJOb3RpZnkiLCJwdXNoIiwiRG9udE5vdGlmeSIsImRlY29kZUFjdGlvbnMiLCJpIiwibGVuZ3RoIiwic2V0X3R3ZWFrIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJyZXN1bHQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbm90aWZpY2F0aW9ucy9Ob3RpZmljYXRpb25VdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgUHVzaFJ1bGVBY3Rpb24sIFB1c2hSdWxlQWN0aW9uTmFtZSwgVHdlYWtIaWdobGlnaHQsIFR3ZWFrU291bmQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL1B1c2hSdWxlc1wiO1xuXG5pbnRlcmZhY2UgSUVuY29kZWRBY3Rpb25zIHtcbiAgICBub3RpZnk6IGJvb2xlYW47XG4gICAgc291bmQ/OiBzdHJpbmc7XG4gICAgaGlnaGxpZ2h0PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIE5vdGlmaWNhdGlvblV0aWxzIHtcbiAgICAvLyBFbmNvZGVzIGEgZGljdGlvbmFyeSBvZiB7XG4gICAgLy8gICBcIm5vdGlmeVwiOiB0cnVlL2ZhbHNlLFxuICAgIC8vICAgXCJzb3VuZFwiOiBzdHJpbmcgb3IgdW5kZWZpbmVkLFxuICAgIC8vICAgXCJoaWdobGlnaHQ6IHRydWUvZmFsc2UsXG4gICAgLy8gfVxuICAgIC8vIHRvIGEgbGlzdCBvZiBwdXNoIGFjdGlvbnMuXG4gICAgc3RhdGljIGVuY29kZUFjdGlvbnMoYWN0aW9uOiBJRW5jb2RlZEFjdGlvbnMpOiBQdXNoUnVsZUFjdGlvbltdIHtcbiAgICAgICAgY29uc3Qgbm90aWZ5ID0gYWN0aW9uLm5vdGlmeTtcbiAgICAgICAgY29uc3Qgc291bmQgPSBhY3Rpb24uc291bmQ7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodCA9IGFjdGlvbi5oaWdobGlnaHQ7XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbnM6IFB1c2hSdWxlQWN0aW9uW10gPSBbUHVzaFJ1bGVBY3Rpb25OYW1lLk5vdGlmeV07XG4gICAgICAgICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goeyBcInNldF90d2Vha1wiOiBcInNvdW5kXCIsIFwidmFsdWVcIjogc291bmQgfSBhcyBUd2Vha1NvdW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoaWdobGlnaHQpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goeyBcInNldF90d2Vha1wiOiBcImhpZ2hsaWdodFwiIH0gYXMgVHdlYWtIaWdobGlnaHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goeyBcInNldF90d2Vha1wiOiBcImhpZ2hsaWdodFwiLCBcInZhbHVlXCI6IGZhbHNlIH0gYXMgVHdlYWtIaWdobGlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW1B1c2hSdWxlQWN0aW9uTmFtZS5Eb250Tm90aWZ5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlY29kZSBhIGxpc3Qgb2YgYWN0aW9ucyB0byBhIGRpY3Rpb25hcnkgb2Yge1xuICAgIC8vICAgXCJub3RpZnlcIjogdHJ1ZS9mYWxzZSxcbiAgICAvLyAgIFwic291bmRcIjogc3RyaW5nIG9yIHVuZGVmaW5lZCxcbiAgICAvLyAgIFwiaGlnaGxpZ2h0OiB0cnVlL2ZhbHNlLFxuICAgIC8vIH1cbiAgICAvLyBJZiB0aGUgYWN0aW9ucyBjb3VsZG4ndCBiZSBkZWNvZGVkIHRoZW4gcmV0dXJucyBudWxsLlxuICAgIHN0YXRpYyBkZWNvZGVBY3Rpb25zKGFjdGlvbnM6IFB1c2hSdWxlQWN0aW9uW10pOiBJRW5jb2RlZEFjdGlvbnMge1xuICAgICAgICBsZXQgbm90aWZ5ID0gZmFsc2U7XG4gICAgICAgIGxldCBzb3VuZCA9IG51bGw7XG4gICAgICAgIGxldCBoaWdobGlnaHQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IGFjdGlvbnNbaV07XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSBQdXNoUnVsZUFjdGlvbk5hbWUuTm90aWZ5KSB7XG4gICAgICAgICAgICAgICAgbm90aWZ5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSBQdXNoUnVsZUFjdGlvbk5hbWUuRG9udE5vdGlmeSkge1xuICAgICAgICAgICAgICAgIG5vdGlmeSA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYWN0aW9uID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbi5zZXRfdHdlYWsgPT09IFwic291bmRcIikge1xuICAgICAgICAgICAgICAgICAgICBzb3VuZCA9IGFjdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi5zZXRfdHdlYWsgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0ID0gYWN0aW9uLnZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBraW5kIG9mIHR3ZWFrLCBzbyBnaXZlIHVwLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IHVuZGVyc3RhbmQgdGhpcyBraW5kIG9mIGFjdGlvbiwgc28gZ2l2ZSB1cC5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoaWdobGlnaHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gSWYgYSBoaWdobGlnaHQgdHdlYWsgaXMgbWlzc2luZyBhIHZhbHVlIHRoZW4gaXQgZGVmYXVsdHMgdG8gdHJ1ZS5cbiAgICAgICAgICAgIGhpZ2hsaWdodCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHQ6IElFbmNvZGVkQWN0aW9ucyA9IHsgbm90aWZ5LCBoaWdobGlnaHQgfTtcbiAgICAgICAgaWYgKHNvdW5kICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHQuc291bmQgPSBzb3VuZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWdCQTs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVU8sTUFBTUEsaUJBQU4sQ0FBd0I7RUFDM0I7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ29CLE9BQWJDLGFBQWEsQ0FBQ0MsTUFBRCxFQUE0QztJQUM1RCxNQUFNQyxNQUFNLEdBQUdELE1BQU0sQ0FBQ0MsTUFBdEI7SUFDQSxNQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0UsS0FBckI7SUFDQSxNQUFNQyxTQUFTLEdBQUdILE1BQU0sQ0FBQ0csU0FBekI7O0lBQ0EsSUFBSUYsTUFBSixFQUFZO01BQ1IsTUFBTUcsT0FBeUIsR0FBRyxDQUFDQyw2QkFBQSxDQUFtQkMsTUFBcEIsQ0FBbEM7O01BQ0EsSUFBSUosS0FBSixFQUFXO1FBQ1BFLE9BQU8sQ0FBQ0csSUFBUixDQUFhO1VBQUUsYUFBYSxPQUFmO1VBQXdCLFNBQVNMO1FBQWpDLENBQWI7TUFDSDs7TUFDRCxJQUFJQyxTQUFKLEVBQWU7UUFDWEMsT0FBTyxDQUFDRyxJQUFSLENBQWE7VUFBRSxhQUFhO1FBQWYsQ0FBYjtNQUNILENBRkQsTUFFTztRQUNISCxPQUFPLENBQUNHLElBQVIsQ0FBYTtVQUFFLGFBQWEsV0FBZjtVQUE0QixTQUFTO1FBQXJDLENBQWI7TUFDSDs7TUFDRCxPQUFPSCxPQUFQO0lBQ0gsQ0FYRCxNQVdPO01BQ0gsT0FBTyxDQUFDQyw2QkFBQSxDQUFtQkcsVUFBcEIsQ0FBUDtJQUNIO0VBQ0osQ0F6QjBCLENBMkIzQjtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7OztFQUNvQixPQUFiQyxhQUFhLENBQUNMLE9BQUQsRUFBNkM7SUFDN0QsSUFBSUgsTUFBTSxHQUFHLEtBQWI7SUFDQSxJQUFJQyxLQUFLLEdBQUcsSUFBWjtJQUNBLElBQUlDLFNBQVMsR0FBRyxLQUFoQjs7SUFFQSxLQUFLLElBQUlPLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdOLE9BQU8sQ0FBQ08sTUFBNUIsRUFBb0MsRUFBRUQsQ0FBdEMsRUFBeUM7TUFDckMsTUFBTVYsTUFBTSxHQUFHSSxPQUFPLENBQUNNLENBQUQsQ0FBdEI7O01BQ0EsSUFBSVYsTUFBTSxLQUFLSyw2QkFBQSxDQUFtQkMsTUFBbEMsRUFBMEM7UUFDdENMLE1BQU0sR0FBRyxJQUFUO01BQ0gsQ0FGRCxNQUVPLElBQUlELE1BQU0sS0FBS0ssNkJBQUEsQ0FBbUJHLFVBQWxDLEVBQThDO1FBQ2pEUCxNQUFNLEdBQUcsS0FBVDtNQUNILENBRk0sTUFFQSxJQUFJLE9BQU9ELE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7UUFDbkMsSUFBSUEsTUFBTSxDQUFDWSxTQUFQLEtBQXFCLE9BQXpCLEVBQWtDO1VBQzlCVixLQUFLLEdBQUdGLE1BQU0sQ0FBQ2EsS0FBZjtRQUNILENBRkQsTUFFTyxJQUFJYixNQUFNLENBQUNZLFNBQVAsS0FBcUIsV0FBekIsRUFBc0M7VUFDekNULFNBQVMsR0FBR0gsTUFBTSxDQUFDYSxLQUFuQjtRQUNILENBRk0sTUFFQTtVQUNIO1VBQ0EsT0FBTyxJQUFQO1FBQ0g7TUFDSixDQVRNLE1BU0E7UUFDSDtRQUNBLE9BQU8sSUFBUDtNQUNIO0lBQ0o7O0lBRUQsSUFBSVYsU0FBUyxLQUFLVyxTQUFsQixFQUE2QjtNQUN6QjtNQUNBWCxTQUFTLEdBQUcsSUFBWjtJQUNIOztJQUVELE1BQU1ZLE1BQXVCLEdBQUc7TUFBRWQsTUFBRjtNQUFVRTtJQUFWLENBQWhDOztJQUNBLElBQUlELEtBQUssS0FBSyxJQUFkLEVBQW9CO01BQ2hCYSxNQUFNLENBQUNiLEtBQVAsR0FBZUEsS0FBZjtJQUNIOztJQUNELE9BQU9hLE1BQVA7RUFDSDs7QUFyRTBCIn0=