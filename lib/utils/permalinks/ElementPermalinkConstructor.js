"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _PermalinkConstructor = _interopRequireWildcard(require("./PermalinkConstructor"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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

/**
 * Generates permalinks that self-reference the running webapp
 */
class ElementPermalinkConstructor extends _PermalinkConstructor.default {
  constructor(elementUrl) {
    super();
    (0, _defineProperty2.default)(this, "elementUrl", void 0);
    this.elementUrl = elementUrl;

    if (!this.elementUrl.startsWith("http:") && !this.elementUrl.startsWith("https:")) {
      throw new Error("Element prefix URL does not appear to be an HTTP(S) URL");
    }
  }

  forEvent(roomId, eventId, serverCandidates) {
    return `${this.elementUrl}/#/room/${roomId}/${eventId}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forRoom(roomIdOrAlias, serverCandidates) {
    return `${this.elementUrl}/#/room/${roomIdOrAlias}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forUser(userId) {
    return `${this.elementUrl}/#/user/${userId}`;
  }

  forGroup(groupId) {
    return `${this.elementUrl}/#/group/${groupId}`;
  }

  forEntity(entityId) {
    if (entityId[0] === '!' || entityId[0] === '#') {
      return this.forRoom(entityId);
    } else if (entityId[0] === '@') {
      return this.forUser(entityId);
    } else if (entityId[0] === '+') {
      return this.forGroup(entityId);
    } else throw new Error("Unrecognized entity");
  }

  isPermalinkHost(testHost) {
    const parsedUrl = new URL(this.elementUrl);
    return testHost === (parsedUrl.host || parsedUrl.hostname); // one of the hosts should match
  }

  encodeServerCandidates(candidates) {
    if (!candidates || candidates.length === 0) return '';
    return `?via=${candidates.map(c => encodeURIComponent(c)).join("&via=")}`;
  } // Heavily inspired by/borrowed from the matrix-bot-sdk (with permission):
  // https://github.com/turt2live/matrix-js-bot-sdk/blob/7c4665c9a25c2c8e0fe4e509f2616505b5b66a1c/src/Permalinks.ts#L33-L61
  // Adapted for Element's URL format


  parsePermalink(fullUrl) {
    if (!fullUrl || !fullUrl.startsWith(this.elementUrl)) {
      throw new Error("Does not appear to be a permalink");
    }

    const parts = fullUrl.substring(`${this.elementUrl}/#/`.length);
    return ElementPermalinkConstructor.parseAppRoute(parts);
  }
  /**
   * Parses an app route (`(user|room)/identifier`) to a Matrix entity
   * (room, user).
   * @param {string} route The app route
   * @returns {PermalinkParts}
   */


  static parseAppRoute(route) {
    const parts = route.split("/");

    if (parts.length < 2) {
      // we're expecting an entity and an ID of some kind at least
      throw new Error("URL is missing parts");
    } // Split optional query out of last part


    const [lastPartMaybeWithQuery] = parts.splice(-1, 1);
    const [lastPart, query = ""] = lastPartMaybeWithQuery.split("?");
    parts.push(lastPart);
    const entityType = parts[0];
    const entity = parts[1];

    if (entityType === 'user') {
      // Probably a user, no further parsing needed.
      return _PermalinkConstructor.PermalinkParts.forUser(entity);
    } else if (entityType === 'room') {
      // Rejoin the rest because v3 events can have slashes (annoyingly)
      const eventId = parts.length > 2 ? parts.slice(2).join('/') : "";
      const via = query.split(/&?via=/).filter(p => !!p);
      return _PermalinkConstructor.PermalinkParts.forEvent(entity, eventId, via);
    } else if (entityType === 'group') {
      return _PermalinkConstructor.PermalinkParts.forGroup(entity);
    } else {
      throw new Error("Unknown entity type in permalink");
    }
  }

}

exports.default = ElementPermalinkConstructor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IiLCJQZXJtYWxpbmtDb25zdHJ1Y3RvciIsImNvbnN0cnVjdG9yIiwiZWxlbWVudFVybCIsInN0YXJ0c1dpdGgiLCJFcnJvciIsImZvckV2ZW50Iiwicm9vbUlkIiwiZXZlbnRJZCIsInNlcnZlckNhbmRpZGF0ZXMiLCJlbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzIiwiZm9yUm9vbSIsInJvb21JZE9yQWxpYXMiLCJmb3JVc2VyIiwidXNlcklkIiwiZm9yR3JvdXAiLCJncm91cElkIiwiZm9yRW50aXR5IiwiZW50aXR5SWQiLCJpc1Blcm1hbGlua0hvc3QiLCJ0ZXN0SG9zdCIsInBhcnNlZFVybCIsIlVSTCIsImhvc3QiLCJob3N0bmFtZSIsImNhbmRpZGF0ZXMiLCJsZW5ndGgiLCJtYXAiLCJjIiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwiam9pbiIsInBhcnNlUGVybWFsaW5rIiwiZnVsbFVybCIsInBhcnRzIiwic3Vic3RyaW5nIiwicGFyc2VBcHBSb3V0ZSIsInJvdXRlIiwic3BsaXQiLCJsYXN0UGFydE1heWJlV2l0aFF1ZXJ5Iiwic3BsaWNlIiwibGFzdFBhcnQiLCJxdWVyeSIsInB1c2giLCJlbnRpdHlUeXBlIiwiZW50aXR5IiwiUGVybWFsaW5rUGFydHMiLCJzbGljZSIsInZpYSIsImZpbHRlciIsInAiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvcGVybWFsaW5rcy9FbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFBlcm1hbGlua0NvbnN0cnVjdG9yLCB7IFBlcm1hbGlua1BhcnRzIH0gZnJvbSBcIi4vUGVybWFsaW5rQ29uc3RydWN0b3JcIjtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgcGVybWFsaW5rcyB0aGF0IHNlbGYtcmVmZXJlbmNlIHRoZSBydW5uaW5nIHdlYmFwcFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IgZXh0ZW5kcyBQZXJtYWxpbmtDb25zdHJ1Y3RvciB7XG4gICAgcHJpdmF0ZSBlbGVtZW50VXJsOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50VXJsOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50VXJsID0gZWxlbWVudFVybDtcblxuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudFVybC5zdGFydHNXaXRoKFwiaHR0cDpcIikgJiYgIXRoaXMuZWxlbWVudFVybC5zdGFydHNXaXRoKFwiaHR0cHM6XCIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IHByZWZpeCBVUkwgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGFuIEhUVFAoUykgVVJMXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yRXZlbnQocm9vbUlkOiBzdHJpbmcsIGV2ZW50SWQ6IHN0cmluZywgc2VydmVyQ2FuZGlkYXRlczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5lbGVtZW50VXJsfS8jL3Jvb20vJHtyb29tSWR9LyR7ZXZlbnRJZH0ke3RoaXMuZW5jb2RlU2VydmVyQ2FuZGlkYXRlcyhzZXJ2ZXJDYW5kaWRhdGVzKX1gO1xuICAgIH1cblxuICAgIGZvclJvb20ocm9vbUlkT3JBbGlhczogc3RyaW5nLCBzZXJ2ZXJDYW5kaWRhdGVzPzogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5lbGVtZW50VXJsfS8jL3Jvb20vJHtyb29tSWRPckFsaWFzfSR7dGhpcy5lbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKHNlcnZlckNhbmRpZGF0ZXMpfWA7XG4gICAgfVxuXG4gICAgZm9yVXNlcih1c2VySWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmVsZW1lbnRVcmx9LyMvdXNlci8ke3VzZXJJZH1gO1xuICAgIH1cblxuICAgIGZvckdyb3VwKGdyb3VwSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLmVsZW1lbnRVcmx9LyMvZ3JvdXAvJHtncm91cElkfWA7XG4gICAgfVxuXG4gICAgZm9yRW50aXR5KGVudGl0eUlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBpZiAoZW50aXR5SWRbMF0gPT09ICchJyB8fCBlbnRpdHlJZFswXSA9PT0gJyMnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JSb29tKGVudGl0eUlkKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRpdHlJZFswXSA9PT0gJ0AnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JVc2VyKGVudGl0eUlkKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRpdHlJZFswXSA9PT0gJysnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JHcm91cChlbnRpdHlJZCk7XG4gICAgICAgIH0gZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJVbnJlY29nbml6ZWQgZW50aXR5XCIpO1xuICAgIH1cblxuICAgIGlzUGVybWFsaW5rSG9zdCh0ZXN0SG9zdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwodGhpcy5lbGVtZW50VXJsKTtcbiAgICAgICAgcmV0dXJuIHRlc3RIb3N0ID09PSAocGFyc2VkVXJsLmhvc3QgfHwgcGFyc2VkVXJsLmhvc3RuYW1lKTsgLy8gb25lIG9mIHRoZSBob3N0cyBzaG91bGQgbWF0Y2hcbiAgICB9XG5cbiAgICBlbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKGNhbmRpZGF0ZXM/OiBzdHJpbmdbXSkge1xuICAgICAgICBpZiAoIWNhbmRpZGF0ZXMgfHwgY2FuZGlkYXRlcy5sZW5ndGggPT09IDApIHJldHVybiAnJztcbiAgICAgICAgcmV0dXJuIGA/dmlhPSR7Y2FuZGlkYXRlcy5tYXAoYyA9PiBlbmNvZGVVUklDb21wb25lbnQoYykpLmpvaW4oXCImdmlhPVwiKX1gO1xuICAgIH1cblxuICAgIC8vIEhlYXZpbHkgaW5zcGlyZWQgYnkvYm9ycm93ZWQgZnJvbSB0aGUgbWF0cml4LWJvdC1zZGsgKHdpdGggcGVybWlzc2lvbik6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3R1cnQybGl2ZS9tYXRyaXgtanMtYm90LXNkay9ibG9iLzdjNDY2NWM5YTI1YzJjOGUwZmU0ZTUwOWYyNjE2NTA1YjViNjZhMWMvc3JjL1Blcm1hbGlua3MudHMjTDMzLUw2MVxuICAgIC8vIEFkYXB0ZWQgZm9yIEVsZW1lbnQncyBVUkwgZm9ybWF0XG4gICAgcGFyc2VQZXJtYWxpbmsoZnVsbFVybDogc3RyaW5nKTogUGVybWFsaW5rUGFydHMge1xuICAgICAgICBpZiAoIWZ1bGxVcmwgfHwgIWZ1bGxVcmwuc3RhcnRzV2l0aCh0aGlzLmVsZW1lbnRVcmwpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBwZXJtYWxpbmtcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0cyA9IGZ1bGxVcmwuc3Vic3RyaW5nKGAke3RoaXMuZWxlbWVudFVybH0vIy9gLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiBFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IucGFyc2VBcHBSb3V0ZShwYXJ0cyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFyc2VzIGFuIGFwcCByb3V0ZSAoYCh1c2VyfHJvb20pL2lkZW50aWZpZXJgKSB0byBhIE1hdHJpeCBlbnRpdHlcbiAgICAgKiAocm9vbSwgdXNlcikuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJvdXRlIFRoZSBhcHAgcm91dGVcbiAgICAgKiBAcmV0dXJucyB7UGVybWFsaW5rUGFydHN9XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlQXBwUm91dGUocm91dGU6IHN0cmluZyk6IFBlcm1hbGlua1BhcnRzIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSByb3V0ZS5zcGxpdChcIi9cIik7XG5cbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpIHsgLy8gd2UncmUgZXhwZWN0aW5nIGFuIGVudGl0eSBhbmQgYW4gSUQgb2Ygc29tZSBraW5kIGF0IGxlYXN0XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVUkwgaXMgbWlzc2luZyBwYXJ0c1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwbGl0IG9wdGlvbmFsIHF1ZXJ5IG91dCBvZiBsYXN0IHBhcnRcbiAgICAgICAgY29uc3QgW2xhc3RQYXJ0TWF5YmVXaXRoUXVlcnldID0gcGFydHMuc3BsaWNlKC0xLCAxKTtcbiAgICAgICAgY29uc3QgW2xhc3RQYXJ0LCBxdWVyeSA9IFwiXCJdID0gbGFzdFBhcnRNYXliZVdpdGhRdWVyeS5zcGxpdChcIj9cIik7XG4gICAgICAgIHBhcnRzLnB1c2gobGFzdFBhcnQpO1xuXG4gICAgICAgIGNvbnN0IGVudGl0eVR5cGUgPSBwYXJ0c1swXTtcbiAgICAgICAgY29uc3QgZW50aXR5ID0gcGFydHNbMV07XG4gICAgICAgIGlmIChlbnRpdHlUeXBlID09PSAndXNlcicpIHtcbiAgICAgICAgICAgIC8vIFByb2JhYmx5IGEgdXNlciwgbm8gZnVydGhlciBwYXJzaW5nIG5lZWRlZC5cbiAgICAgICAgICAgIHJldHVybiBQZXJtYWxpbmtQYXJ0cy5mb3JVc2VyKGVudGl0eSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50aXR5VHlwZSA9PT0gJ3Jvb20nKSB7XG4gICAgICAgICAgICAvLyBSZWpvaW4gdGhlIHJlc3QgYmVjYXVzZSB2MyBldmVudHMgY2FuIGhhdmUgc2xhc2hlcyAoYW5ub3lpbmdseSlcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SWQgPSBwYXJ0cy5sZW5ndGggPiAyID8gcGFydHMuc2xpY2UoMikuam9pbignLycpIDogXCJcIjtcbiAgICAgICAgICAgIGNvbnN0IHZpYSA9IHF1ZXJ5LnNwbGl0KC8mP3ZpYT0vKS5maWx0ZXIocCA9PiAhIXApO1xuICAgICAgICAgICAgcmV0dXJuIFBlcm1hbGlua1BhcnRzLmZvckV2ZW50KGVudGl0eSwgZXZlbnRJZCwgdmlhKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRpdHlUeXBlID09PSAnZ3JvdXAnKSB7XG4gICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yR3JvdXAoZW50aXR5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gZW50aXR5IHR5cGUgaW4gcGVybWFsaW5rXCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztB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