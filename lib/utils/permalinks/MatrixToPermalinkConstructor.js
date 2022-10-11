"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.host = exports.default = exports.baseUrl = void 0;

var _PermalinkConstructor = _interopRequireWildcard(require("./PermalinkConstructor"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

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
const host = "matrix.to";
exports.host = host;
const baseUrl = `https://${host}`;
/**
 * Generates matrix.to permalinks
 */

exports.baseUrl = baseUrl;

class MatrixToPermalinkConstructor extends _PermalinkConstructor.default {
  constructor() {
    super();
  }

  forEvent(roomId, eventId, serverCandidates) {
    return `${baseUrl}/#/${roomId}/${eventId}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forRoom(roomIdOrAlias, serverCandidates) {
    return `${baseUrl}/#/${roomIdOrAlias}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forUser(userId) {
    return `${baseUrl}/#/${userId}`;
  }

  forGroup(groupId) {
    return `${baseUrl}/#/${groupId}`;
  }

  forEntity(entityId) {
    return `${baseUrl}/#/${entityId}`;
  }

  isPermalinkHost(testHost) {
    return testHost === host;
  }

  encodeServerCandidates(candidates) {
    if (!candidates || candidates.length === 0) return '';
    return `?via=${candidates.map(c => encodeURIComponent(c)).join("&via=")}`;
  } // Heavily inspired by/borrowed from the matrix-bot-sdk (with permission):
  // https://github.com/turt2live/matrix-js-bot-sdk/blob/7c4665c9a25c2c8e0fe4e509f2616505b5b66a1c/src/Permalinks.ts#L33-L61


  parsePermalink(fullUrl) {
    if (!fullUrl || !fullUrl.startsWith(baseUrl)) {
      throw new Error("Does not appear to be a permalink");
    }

    const parts = fullUrl.substring(`${baseUrl}/#/`.length).split("/");
    const entity = parts[0];

    if (entity[0] === '@') {
      // Probably a user, no further parsing needed.
      return _PermalinkConstructor.PermalinkParts.forUser(entity);
    } else if (entity[0] === '#' || entity[0] === '!') {
      if (parts.length === 1) {
        // room without event permalink
        const [roomId, query = ""] = entity.split("?");
        const via = query.split(/&?via=/g).filter(p => !!p);
        return _PermalinkConstructor.PermalinkParts.forRoom(roomId, via);
      } // rejoin the rest because v3 events can have slashes (annoyingly)


      const eventIdAndQuery = parts.length > 1 ? parts.slice(1).join('/') : "";
      const [eventId, query = ""] = eventIdAndQuery.split("?");
      const via = query.split(/&?via=/g).filter(p => !!p);
      return _PermalinkConstructor.PermalinkParts.forEvent(entity, eventId, via);
    } else if (entity[0] === '+') {
      return _PermalinkConstructor.PermalinkParts.forGroup(entity);
    } else {
      throw new Error("Unknown entity type in permalink");
    }
  }

}

exports.default = MatrixToPermalinkConstructor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJob3N0IiwiYmFzZVVybCIsIk1hdHJpeFRvUGVybWFsaW5rQ29uc3RydWN0b3IiLCJQZXJtYWxpbmtDb25zdHJ1Y3RvciIsImNvbnN0cnVjdG9yIiwiZm9yRXZlbnQiLCJyb29tSWQiLCJldmVudElkIiwic2VydmVyQ2FuZGlkYXRlcyIsImVuY29kZVNlcnZlckNhbmRpZGF0ZXMiLCJmb3JSb29tIiwicm9vbUlkT3JBbGlhcyIsImZvclVzZXIiLCJ1c2VySWQiLCJmb3JHcm91cCIsImdyb3VwSWQiLCJmb3JFbnRpdHkiLCJlbnRpdHlJZCIsImlzUGVybWFsaW5rSG9zdCIsInRlc3RIb3N0IiwiY2FuZGlkYXRlcyIsImxlbmd0aCIsIm1hcCIsImMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJqb2luIiwicGFyc2VQZXJtYWxpbmsiLCJmdWxsVXJsIiwic3RhcnRzV2l0aCIsIkVycm9yIiwicGFydHMiLCJzdWJzdHJpbmciLCJzcGxpdCIsImVudGl0eSIsIlBlcm1hbGlua1BhcnRzIiwicXVlcnkiLCJ2aWEiLCJmaWx0ZXIiLCJwIiwiZXZlbnRJZEFuZFF1ZXJ5Iiwic2xpY2UiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvcGVybWFsaW5rcy9NYXRyaXhUb1Blcm1hbGlua0NvbnN0cnVjdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBQZXJtYWxpbmtDb25zdHJ1Y3RvciwgeyBQZXJtYWxpbmtQYXJ0cyB9IGZyb20gXCIuL1Blcm1hbGlua0NvbnN0cnVjdG9yXCI7XG5cbmV4cG9ydCBjb25zdCBob3N0ID0gXCJtYXRyaXgudG9cIjtcbmV4cG9ydCBjb25zdCBiYXNlVXJsID0gYGh0dHBzOi8vJHtob3N0fWA7XG5cbi8qKlxuICogR2VuZXJhdGVzIG1hdHJpeC50byBwZXJtYWxpbmtzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hdHJpeFRvUGVybWFsaW5rQ29uc3RydWN0b3IgZXh0ZW5kcyBQZXJtYWxpbmtDb25zdHJ1Y3RvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgZm9yRXZlbnQocm9vbUlkOiBzdHJpbmcsIGV2ZW50SWQ6IHN0cmluZywgc2VydmVyQ2FuZGlkYXRlczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7YmFzZVVybH0vIy8ke3Jvb21JZH0vJHtldmVudElkfSR7dGhpcy5lbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKHNlcnZlckNhbmRpZGF0ZXMpfWA7XG4gICAgfVxuXG4gICAgZm9yUm9vbShyb29tSWRPckFsaWFzOiBzdHJpbmcsIHNlcnZlckNhbmRpZGF0ZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmx9LyMvJHtyb29tSWRPckFsaWFzfSR7dGhpcy5lbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKHNlcnZlckNhbmRpZGF0ZXMpfWA7XG4gICAgfVxuXG4gICAgZm9yVXNlcih1c2VySWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHtiYXNlVXJsfS8jLyR7dXNlcklkfWA7XG4gICAgfVxuXG4gICAgZm9yR3JvdXAoZ3JvdXBJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke2Jhc2VVcmx9LyMvJHtncm91cElkfWA7XG4gICAgfVxuXG4gICAgZm9yRW50aXR5KGVudGl0eUlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7YmFzZVVybH0vIy8ke2VudGl0eUlkfWA7XG4gICAgfVxuXG4gICAgaXNQZXJtYWxpbmtIb3N0KHRlc3RIb3N0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRlc3RIb3N0ID09PSBob3N0O1xuICAgIH1cblxuICAgIGVuY29kZVNlcnZlckNhbmRpZGF0ZXMoY2FuZGlkYXRlczogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKCFjYW5kaWRhdGVzIHx8IGNhbmRpZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gJyc7XG4gICAgICAgIHJldHVybiBgP3ZpYT0ke2NhbmRpZGF0ZXMubWFwKGMgPT4gZW5jb2RlVVJJQ29tcG9uZW50KGMpKS5qb2luKFwiJnZpYT1cIil9YDtcbiAgICB9XG5cbiAgICAvLyBIZWF2aWx5IGluc3BpcmVkIGJ5L2JvcnJvd2VkIGZyb20gdGhlIG1hdHJpeC1ib3Qtc2RrICh3aXRoIHBlcm1pc3Npb24pOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90dXJ0MmxpdmUvbWF0cml4LWpzLWJvdC1zZGsvYmxvYi83YzQ2NjVjOWEyNWMyYzhlMGZlNGU1MDlmMjYxNjUwNWI1YjY2YTFjL3NyYy9QZXJtYWxpbmtzLnRzI0wzMy1MNjFcbiAgICBwYXJzZVBlcm1hbGluayhmdWxsVXJsOiBzdHJpbmcpOiBQZXJtYWxpbmtQYXJ0cyB7XG4gICAgICAgIGlmICghZnVsbFVybCB8fCAhZnVsbFVybC5zdGFydHNXaXRoKGJhc2VVcmwpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBwZXJtYWxpbmtcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0cyA9IGZ1bGxVcmwuc3Vic3RyaW5nKGAke2Jhc2VVcmx9LyMvYC5sZW5ndGgpLnNwbGl0KFwiL1wiKTtcblxuICAgICAgICBjb25zdCBlbnRpdHkgPSBwYXJ0c1swXTtcbiAgICAgICAgaWYgKGVudGl0eVswXSA9PT0gJ0AnKSB7XG4gICAgICAgICAgICAvLyBQcm9iYWJseSBhIHVzZXIsIG5vIGZ1cnRoZXIgcGFyc2luZyBuZWVkZWQuXG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yVXNlcihlbnRpdHkpO1xuICAgICAgICB9IGVsc2UgaWYgKGVudGl0eVswXSA9PT0gJyMnIHx8IGVudGl0eVswXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7IC8vIHJvb20gd2l0aG91dCBldmVudCBwZXJtYWxpbmtcbiAgICAgICAgICAgICAgICBjb25zdCBbcm9vbUlkLCBxdWVyeT1cIlwiXSA9IGVudGl0eS5zcGxpdChcIj9cIik7XG4gICAgICAgICAgICAgICAgY29uc3QgdmlhID0gcXVlcnkuc3BsaXQoLyY/dmlhPS9nKS5maWx0ZXIocCA9PiAhIXApO1xuICAgICAgICAgICAgICAgIHJldHVybiBQZXJtYWxpbmtQYXJ0cy5mb3JSb29tKHJvb21JZCwgdmlhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcmVqb2luIHRoZSByZXN0IGJlY2F1c2UgdjMgZXZlbnRzIGNhbiBoYXZlIHNsYXNoZXMgKGFubm95aW5nbHkpXG4gICAgICAgICAgICBjb25zdCBldmVudElkQW5kUXVlcnkgPSBwYXJ0cy5sZW5ndGggPiAxID8gcGFydHMuc2xpY2UoMSkuam9pbignLycpIDogXCJcIjtcbiAgICAgICAgICAgIGNvbnN0IFtldmVudElkLCBxdWVyeT1cIlwiXSA9IGV2ZW50SWRBbmRRdWVyeS5zcGxpdChcIj9cIik7XG4gICAgICAgICAgICBjb25zdCB2aWEgPSBxdWVyeS5zcGxpdCgvJj92aWE9L2cpLmZpbHRlcihwID0+ICEhcCk7XG5cbiAgICAgICAgICAgIHJldHVybiBQZXJtYWxpbmtQYXJ0cy5mb3JFdmVudChlbnRpdHksIGV2ZW50SWQsIHZpYSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50aXR5WzBdID09PSAnKycpIHtcbiAgICAgICAgICAgIHJldHVybiBQZXJtYWxpbmtQYXJ0cy5mb3JHcm91cChlbnRpdHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBlbnRpdHkgdHlwZSBpbiBwZXJtYWxpbmtcIik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFnQkE7Ozs7OztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJTyxNQUFNQSxJQUFJLEdBQUcsV0FBYjs7QUFDQSxNQUFNQyxPQUFPLEdBQUksV0FBVUQsSUFBSyxFQUFoQztBQUVQO0FBQ0E7QUFDQTs7OztBQUNlLE1BQU1FLDRCQUFOLFNBQTJDQyw2QkFBM0MsQ0FBZ0U7RUFDM0VDLFdBQVcsR0FBRztJQUNWO0VBQ0g7O0VBRURDLFFBQVEsQ0FBQ0MsTUFBRCxFQUFpQkMsT0FBakIsRUFBa0NDLGdCQUFsQyxFQUFzRTtJQUMxRSxPQUFRLEdBQUVQLE9BQVEsTUFBS0ssTUFBTyxJQUFHQyxPQUFRLEdBQUUsS0FBS0Usc0JBQUwsQ0FBNEJELGdCQUE1QixDQUE4QyxFQUF6RjtFQUNI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