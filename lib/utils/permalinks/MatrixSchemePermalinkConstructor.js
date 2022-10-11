"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _PermalinkConstructor = _interopRequireWildcard(require("./PermalinkConstructor"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
 * Generates matrix: scheme permalinks
 */
class MatrixSchemePermalinkConstructor extends _PermalinkConstructor.default {
  constructor() {
    super();
  }

  encodeEntity(entity) {
    if (entity[0] === "!") {
      return `roomid/${entity.slice(1)}`;
    } else if (entity[0] === "#") {
      return `r/${entity.slice(1)}`;
    } else if (entity[0] === "@") {
      return `u/${entity.slice(1)}`;
    } else if (entity[0] === "$") {
      return `e/${entity.slice(1)}`;
    }

    throw new Error("Cannot encode entity: " + entity);
  }

  forEvent(roomId, eventId, serverCandidates) {
    return `matrix:${this.encodeEntity(roomId)}` + `/${this.encodeEntity(eventId)}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forRoom(roomIdOrAlias, serverCandidates) {
    return `matrix:${this.encodeEntity(roomIdOrAlias)}${this.encodeServerCandidates(serverCandidates)}`;
  }

  forUser(userId) {
    return `matrix:${this.encodeEntity(userId)}`;
  }

  forGroup(groupId) {
    throw new Error("Deliberately not implemented");
  }

  forEntity(entityId) {
    return `matrix:${this.encodeEntity(entityId)}`;
  }

  isPermalinkHost(testHost) {
    // TODO: Change API signature to accept the URL for checking
    return testHost === "";
  }

  encodeServerCandidates(candidates) {
    if (!candidates || candidates.length === 0) return '';
    return `?via=${candidates.map(c => encodeURIComponent(c)).join("&via=")}`;
  }

  parsePermalink(fullUrl) {
    if (!fullUrl || !fullUrl.startsWith("matrix:")) {
      throw new Error("Does not appear to be a permalink");
    }

    const parts = fullUrl.substring("matrix:".length).split('/');
    const identifier = parts[0];
    const entityNoSigil = parts[1];

    if (identifier === 'u') {
      // Probably a user, no further parsing needed.
      return _PermalinkConstructor.PermalinkParts.forUser(`@${entityNoSigil}`);
    } else if (identifier === 'r' || identifier === 'roomid') {
      const sigil = identifier === 'r' ? '#' : '!';

      if (parts.length === 2) {
        // room without event permalink
        const [roomId, query = ""] = entityNoSigil.split("?");
        const via = query.split(/&?via=/g).filter(p => !!p);
        return _PermalinkConstructor.PermalinkParts.forRoom(`${sigil}${roomId}`, via);
      }

      if (parts[2] === 'e') {
        // event permalink
        const eventIdAndQuery = parts.length > 3 ? parts.slice(3).join('/') : "";
        const [eventId, query = ""] = eventIdAndQuery.split("?");
        const via = query.split(/&?via=/g).filter(p => !!p);
        return _PermalinkConstructor.PermalinkParts.forEvent(`${sigil}${entityNoSigil}`, `$${eventId}`, via);
      }

      throw new Error("Faulty room permalink");
    } else {
      throw new Error("Unknown entity type in permalink");
    }
  }

}

exports.default = MatrixSchemePermalinkConstructor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXhTY2hlbWVQZXJtYWxpbmtDb25zdHJ1Y3RvciIsIlBlcm1hbGlua0NvbnN0cnVjdG9yIiwiY29uc3RydWN0b3IiLCJlbmNvZGVFbnRpdHkiLCJlbnRpdHkiLCJzbGljZSIsIkVycm9yIiwiZm9yRXZlbnQiLCJyb29tSWQiLCJldmVudElkIiwic2VydmVyQ2FuZGlkYXRlcyIsImVuY29kZVNlcnZlckNhbmRpZGF0ZXMiLCJmb3JSb29tIiwicm9vbUlkT3JBbGlhcyIsImZvclVzZXIiLCJ1c2VySWQiLCJmb3JHcm91cCIsImdyb3VwSWQiLCJmb3JFbnRpdHkiLCJlbnRpdHlJZCIsImlzUGVybWFsaW5rSG9zdCIsInRlc3RIb3N0IiwiY2FuZGlkYXRlcyIsImxlbmd0aCIsIm1hcCIsImMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJqb2luIiwicGFyc2VQZXJtYWxpbmsiLCJmdWxsVXJsIiwic3RhcnRzV2l0aCIsInBhcnRzIiwic3Vic3RyaW5nIiwic3BsaXQiLCJpZGVudGlmaWVyIiwiZW50aXR5Tm9TaWdpbCIsIlBlcm1hbGlua1BhcnRzIiwic2lnaWwiLCJxdWVyeSIsInZpYSIsImZpbHRlciIsInAiLCJldmVudElkQW5kUXVlcnkiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvcGVybWFsaW5rcy9NYXRyaXhTY2hlbWVQZXJtYWxpbmtDb25zdHJ1Y3Rvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUGVybWFsaW5rQ29uc3RydWN0b3IsIHsgUGVybWFsaW5rUGFydHMgfSBmcm9tIFwiLi9QZXJtYWxpbmtDb25zdHJ1Y3RvclwiO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBtYXRyaXg6IHNjaGVtZSBwZXJtYWxpbmtzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hdHJpeFNjaGVtZVBlcm1hbGlua0NvbnN0cnVjdG9yIGV4dGVuZHMgUGVybWFsaW5rQ29uc3RydWN0b3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW5jb2RlRW50aXR5KGVudGl0eTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKGVudGl0eVswXSA9PT0gXCIhXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBgcm9vbWlkLyR7ZW50aXR5LnNsaWNlKDEpfWA7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50aXR5WzBdID09PSBcIiNcIikge1xuICAgICAgICAgICAgcmV0dXJuIGByLyR7ZW50aXR5LnNsaWNlKDEpfWA7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50aXR5WzBdID09PSBcIkBcIikge1xuICAgICAgICAgICAgcmV0dXJuIGB1LyR7ZW50aXR5LnNsaWNlKDEpfWA7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50aXR5WzBdID09PSBcIiRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGBlLyR7ZW50aXR5LnNsaWNlKDEpfWA7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZW5jb2RlIGVudGl0eTogXCIgKyBlbnRpdHkpO1xuICAgIH1cblxuICAgIGZvckV2ZW50KHJvb21JZDogc3RyaW5nLCBldmVudElkOiBzdHJpbmcsIHNlcnZlckNhbmRpZGF0ZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBtYXRyaXg6JHt0aGlzLmVuY29kZUVudGl0eShyb29tSWQpfWAgK1xuICAgICAgICAgICAgYC8ke3RoaXMuZW5jb2RlRW50aXR5KGV2ZW50SWQpfSR7dGhpcy5lbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKHNlcnZlckNhbmRpZGF0ZXMpfWA7XG4gICAgfVxuXG4gICAgZm9yUm9vbShyb29tSWRPckFsaWFzOiBzdHJpbmcsIHNlcnZlckNhbmRpZGF0ZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBtYXRyaXg6JHt0aGlzLmVuY29kZUVudGl0eShyb29tSWRPckFsaWFzKX0ke3RoaXMuZW5jb2RlU2VydmVyQ2FuZGlkYXRlcyhzZXJ2ZXJDYW5kaWRhdGVzKX1gO1xuICAgIH1cblxuICAgIGZvclVzZXIodXNlcklkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYG1hdHJpeDoke3RoaXMuZW5jb2RlRW50aXR5KHVzZXJJZCl9YDtcbiAgICB9XG5cbiAgICBmb3JHcm91cChncm91cElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEZWxpYmVyYXRlbHkgbm90IGltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIGZvckVudGl0eShlbnRpdHlJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBtYXRyaXg6JHt0aGlzLmVuY29kZUVudGl0eShlbnRpdHlJZCl9YDtcbiAgICB9XG5cbiAgICBpc1Blcm1hbGlua0hvc3QodGVzdEhvc3Q6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBUT0RPOiBDaGFuZ2UgQVBJIHNpZ25hdHVyZSB0byBhY2NlcHQgdGhlIFVSTCBmb3IgY2hlY2tpbmdcbiAgICAgICAgcmV0dXJuIHRlc3RIb3N0ID09PSBcIlwiO1xuICAgIH1cblxuICAgIGVuY29kZVNlcnZlckNhbmRpZGF0ZXMoY2FuZGlkYXRlczogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKCFjYW5kaWRhdGVzIHx8IGNhbmRpZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gJyc7XG4gICAgICAgIHJldHVybiBgP3ZpYT0ke2NhbmRpZGF0ZXMubWFwKGMgPT4gZW5jb2RlVVJJQ29tcG9uZW50KGMpKS5qb2luKFwiJnZpYT1cIil9YDtcbiAgICB9XG5cbiAgICBwYXJzZVBlcm1hbGluayhmdWxsVXJsOiBzdHJpbmcpOiBQZXJtYWxpbmtQYXJ0cyB7XG4gICAgICAgIGlmICghZnVsbFVybCB8fCAhZnVsbFVybC5zdGFydHNXaXRoKFwibWF0cml4OlwiKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRG9lcyBub3QgYXBwZWFyIHRvIGJlIGEgcGVybWFsaW5rXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHMgPSBmdWxsVXJsLnN1YnN0cmluZyhcIm1hdHJpeDpcIi5sZW5ndGgpLnNwbGl0KCcvJyk7XG5cbiAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IHBhcnRzWzBdO1xuICAgICAgICBjb25zdCBlbnRpdHlOb1NpZ2lsID0gcGFydHNbMV07XG4gICAgICAgIGlmIChpZGVudGlmaWVyID09PSAndScpIHtcbiAgICAgICAgICAgIC8vIFByb2JhYmx5IGEgdXNlciwgbm8gZnVydGhlciBwYXJzaW5nIG5lZWRlZC5cbiAgICAgICAgICAgIHJldHVybiBQZXJtYWxpbmtQYXJ0cy5mb3JVc2VyKGBAJHtlbnRpdHlOb1NpZ2lsfWApO1xuICAgICAgICB9IGVsc2UgaWYgKGlkZW50aWZpZXIgPT09ICdyJyB8fCBpZGVudGlmaWVyID09PSAncm9vbWlkJykge1xuICAgICAgICAgICAgY29uc3Qgc2lnaWwgPSBpZGVudGlmaWVyID09PSAncicgPyAnIycgOiAnISc7XG5cbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHsgLy8gcm9vbSB3aXRob3V0IGV2ZW50IHBlcm1hbGlua1xuICAgICAgICAgICAgICAgIGNvbnN0IFtyb29tSWQsIHF1ZXJ5ID0gXCJcIl0gPSBlbnRpdHlOb1NpZ2lsLnNwbGl0KFwiP1wiKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2aWEgPSBxdWVyeS5zcGxpdCgvJj92aWE9L2cpLmZpbHRlcihwID0+ICEhcCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBlcm1hbGlua1BhcnRzLmZvclJvb20oYCR7c2lnaWx9JHtyb29tSWR9YCwgdmlhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBhcnRzWzJdID09PSAnZScpIHsgLy8gZXZlbnQgcGVybWFsaW5rXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRJZEFuZFF1ZXJ5ID0gcGFydHMubGVuZ3RoID4gMyA/IHBhcnRzLnNsaWNlKDMpLmpvaW4oJy8nKSA6IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc3QgW2V2ZW50SWQsIHF1ZXJ5ID0gXCJcIl0gPSBldmVudElkQW5kUXVlcnkuc3BsaXQoXCI/XCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZpYSA9IHF1ZXJ5LnNwbGl0KC8mP3ZpYT0vZykuZmlsdGVyKHAgPT4gISFwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUGVybWFsaW5rUGFydHMuZm9yRXZlbnQoYCR7c2lnaWx9JHtlbnRpdHlOb1NpZ2lsfWAsIGAkJHtldmVudElkfWAsIHZpYSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhdWx0eSByb29tIHBlcm1hbGlua1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gZW50aXR5IHR5cGUgaW4gcGVybWFsaW5rXCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBZ0JBOzs7Ozs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLGdDQUFOLFNBQStDQyw2QkFBL0MsQ0FBb0U7RUFDL0VDLFdBQVcsR0FBRztJQUNWO0VBQ0g7O0VBRU9DLFlBQVksQ0FBQ0MsTUFBRCxFQUF5QjtJQUN6QyxJQUFJQSxNQUFNLENBQUMsQ0FBRCxDQUFOLEtBQWMsR0FBbEIsRUFBdUI7TUFDbkIsT0FBUSxVQUFTQSxNQUFNLENBQUNDLEtBQVAsQ0FBYSxDQUFiLENBQWdCLEVBQWpDO0lBQ0gsQ0FGRCxNQUVPLElBQUlELE1BQU0sQ0FBQyxDQUFELENBQU4sS0FBYyxHQUFsQixFQUF1QjtNQUMxQixPQUFRLEtBQUlBLE1BQU0sQ0FBQ0MsS0FBUCxDQUFhLENBQWIsQ0FBZ0IsRUFBNUI7SUFDSCxDQUZNLE1BRUEsSUFBSUQsTUFBTSxDQUFDLENBQUQsQ0FBTixLQUFjLEdBQWxCLEVBQXVCO01BQzFCLE9BQVEsS0FBSUEsTUFBTSxDQUFDQyxLQUFQLENBQWEsQ0FBYixDQUFnQixFQUE1QjtJQUNILENBRk0sTUFFQSxJQUFJRCxNQUFNLENBQUMsQ0FBRCxDQUFOLEtBQWMsR0FBbEIsRUFBdUI7TUFDMUIsT0FBUSxLQUFJQSxNQUFNLENBQUNDLEtBQVAsQ0FBYSxDQUFiLENBQWdCLEVBQTVCO0lBQ0g7O0lBRUQsTUFBTSxJQUFJQyxLQUFKLENBQVUsMkJBQTJCRixNQUFyQyxDQUFOO0VBQ0g7O0VBRURHLFFBQVEsQ0FBQ0Ms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