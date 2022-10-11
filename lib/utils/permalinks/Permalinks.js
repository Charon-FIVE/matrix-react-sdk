"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateRoomVia = exports.RoomPermalinkCreator = void 0;
exports.getPrimaryPermalinkEntity = getPrimaryPermalinkEntity;
exports.isPermalinkHost = isPermalinkHost;
exports.makeGenericPermalink = makeGenericPermalink;
exports.makeGroupPermalink = makeGroupPermalink;
exports.makeRoomPermalink = makeRoomPermalink;
exports.makeUserPermalink = makeUserPermalink;
exports.parsePermalink = parsePermalink;
exports.tryTransformEntityToPermalink = tryTransformEntityToPermalink;
exports.tryTransformPermalinkToLocalHref = tryTransformPermalinkToLocalHref;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _isIp = _interopRequireDefault(require("is-ip"));

var utils = _interopRequireWildcard(require("matrix-js-sdk/src/utils"));

var _logger = require("matrix-js-sdk/src/logger");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _event = require("matrix-js-sdk/src/@types/event");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _MatrixToPermalinkConstructor = _interopRequireWildcard(require("./MatrixToPermalinkConstructor"));

var _ElementPermalinkConstructor = _interopRequireDefault(require("./ElementPermalinkConstructor"));

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _linkifyMatrix = require("../../linkify-matrix");

var _MatrixSchemePermalinkConstructor = _interopRequireDefault(require("./MatrixSchemePermalinkConstructor"));

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
// The maximum number of servers to pick when working out which servers
// to add to permalinks. The servers are appended as ?via=example.org
const MAX_SERVER_CANDIDATES = 3;
const ANY_REGEX = /.*/; // Permalinks can have servers appended to them so that the user
// receiving them can have a fighting chance at joining the room.
// These servers are called "candidates" at this point because
// it is unclear whether they are going to be useful to actually
// join in the future.
//
// We pick 3 servers based on the following criteria:
//
//   Server 1: The highest power level user in the room, provided
//   they are at least PL 50. We don't calculate "what is a moderator"
//   here because it is less relevant for the vast majority of rooms.
//   We also want to ensure that we get an admin or high-ranking mod
//   as they are less likely to leave the room. If no user happens
//   to meet this criteria, we'll pick the most popular server in the
//   room.
//
//   Server 2: The next most popular server in the room (in user
//   distribution). This cannot be the same as Server 1. If no other
//   servers are available then we'll only return Server 1.
//
//   Server 3: The next most popular server by user distribution. This
//   has the same rules as Server 2, with the added exception that it
//   must be unique from Server 1 and 2.
// Rationale for popular servers: It's hard to get rid of people when
// they keep flocking in from a particular server. Sure, the server could
// be ACL'd in the future or for some reason be evicted from the room
// however an event like that is unlikely the larger the room gets. If
// the server is ACL'd at the time of generating the link however, we
// shouldn't pick them. We also don't pick IP addresses.
// Note: we don't pick the server the room was created on because the
// homeserver should already be using that server as a last ditch attempt
// and there's less of a guarantee that the server is a resident server.
// Instead, we actively figure out which servers are likely to be residents
// in the future and try to use those.
// Note: Users receiving permalinks that happen to have all 3 potential
// servers fail them (in terms of joining) are somewhat expected to hunt
// down the person who gave them the link to ask for a participating server.
// The receiving user can then manually append the known-good server to
// the list and magically have the link work.

class RoomPermalinkCreator {
  // We support being given a roomId as a fallback in the event the `room` object
  // doesn't exist or is not healthy for us to rely on. For example, loading a
  // permalink to a room which the MatrixClient doesn't know about.
  // Some of the tests done by this class are relatively expensive, so normally
  // throttled to not happen on every update. Pass false as the shouldThrottle
  // param to disable this behaviour, eg. for tests.
  constructor(room) {
    let roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let shouldThrottle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    (0, _defineProperty2.default)(this, "room", void 0);
    (0, _defineProperty2.default)(this, "roomId", void 0);
    (0, _defineProperty2.default)(this, "highestPlUserId", void 0);
    (0, _defineProperty2.default)(this, "populationMap", void 0);
    (0, _defineProperty2.default)(this, "bannedHostsRegexps", void 0);
    (0, _defineProperty2.default)(this, "allowedHostsRegexps", void 0);
    (0, _defineProperty2.default)(this, "_serverCandidates", void 0);
    (0, _defineProperty2.default)(this, "started", void 0);
    (0, _defineProperty2.default)(this, "onRoomStateUpdate", () => {
      this.fullUpdate();
    });
    (0, _defineProperty2.default)(this, "updateServerCandidates", () => {
      const candidates = new Set();

      if (this.highestPlUserId) {
        candidates.add(getServerName(this.highestPlUserId));
      }

      const serversByPopulation = Object.keys(this.populationMap).sort((a, b) => this.populationMap[b] - this.populationMap[a]);

      for (let i = 0; i < serversByPopulation.length && candidates.size < MAX_SERVER_CANDIDATES; i++) {
        const server = serversByPopulation[i];

        if (!candidates.has(server) && !isHostnameIpAddress(server) && !isHostInRegex(server, this.bannedHostsRegexps) && isHostInRegex(server, this.allowedHostsRegexps)) {
          candidates.add(server);
        }
      }

      this._serverCandidates = [...candidates];
    });
    this.room = room;
    this.roomId = room ? room.roomId : roomId;
    this.highestPlUserId = null;
    this.populationMap = null;
    this.bannedHostsRegexps = null;
    this.allowedHostsRegexps = null;
    this._serverCandidates = null;
    this.started = false;

    if (!this.roomId) {
      throw new Error("Failed to resolve a roomId for the permalink creator to use");
    }
  }

  load() {
    if (!this.room || !this.room.currentState) {
      // Under rare and unknown circumstances it is possible to have a room with no
      // currentState, at least potentially at the early stages of joining a room.
      // To avoid breaking everything, we'll just warn rather than throw as well as
      // not bother updating the various aspects of the share link.
      _logger.logger.warn("Tried to load a permalink creator with no room state");

      return;
    }

    this.fullUpdate();
  }

  start() {
    this.load();
    this.room.currentState.on(_roomState.RoomStateEvent.Update, this.onRoomStateUpdate);
    this.started = true;
  }

  stop() {
    this.room.currentState.removeListener(_roomState.RoomStateEvent.Update, this.onRoomStateUpdate);
    this.started = false;
  }

  get serverCandidates() {
    return this._serverCandidates;
  }

  isStarted() {
    return this.started;
  }

  forEvent(eventId) {
    return getPermalinkConstructor().forEvent(this.roomId, eventId, this._serverCandidates);
  }

  forShareableRoom() {
    if (this.room) {
      // Prefer to use canonical alias for permalink if possible
      const alias = this.room.getCanonicalAlias();

      if (alias) {
        return getPermalinkConstructor().forRoom(alias);
      }
    }

    return getPermalinkConstructor().forRoom(this.roomId, this._serverCandidates);
  }

  forRoom() {
    return getPermalinkConstructor().forRoom(this.roomId, this._serverCandidates);
  }

  fullUpdate() {
    // This updates the internal state of this object from the room state. It's broken
    // down into separate functions, previously because we did some of these as incremental
    // updates, but they were on member events which can be very numerous, so the incremental
    // updates ended up being much slower than a full update. We now have the batch state update
    // event, so we just update in full, but on each batch of updates.
    this.updateAllowedServers();
    this.updateHighestPlUser();
    this.updatePopulationMap();
    this.updateServerCandidates();
  }

  updateHighestPlUser() {
    const plEvent = this.room.currentState.getStateEvents("m.room.power_levels", "");

    if (plEvent) {
      const content = plEvent.getContent();

      if (content) {
        const users = content.users;

        if (users) {
          const entries = Object.entries(users);
          const allowedEntries = entries.filter(_ref => {
            let [userId] = _ref;
            const member = this.room.getMember(userId);

            if (!member || member.membership !== "join") {
              return false;
            }

            const serverName = getServerName(userId);
            return !isHostnameIpAddress(serverName) && !isHostInRegex(serverName, this.bannedHostsRegexps) && isHostInRegex(serverName, this.allowedHostsRegexps);
          });
          const maxEntry = allowedEntries.reduce((max, entry) => {
            return entry[1] > max[1] ? entry : max;
          }, [null, 0]);
          const [userId, powerLevel] = maxEntry; // object wasn't empty, and max entry wasn't a demotion from the default

          if (userId !== null && powerLevel >= 50) {
            this.highestPlUserId = userId;
            return;
          }
        }
      }
    }

    this.highestPlUserId = null;
  }

  updateAllowedServers() {
    const bannedHostsRegexps = [];
    let allowedHostsRegexps = [ANY_REGEX]; // default allow everyone

    if (this.room.currentState) {
      const aclEvent = this.room.currentState.getStateEvents(_event.EventType.RoomServerAcl, "");

      if (aclEvent && aclEvent.getContent()) {
        const getRegex = hostname => new RegExp("^" + utils.globToRegexp(hostname, false) + "$");

        const denied = aclEvent.getContent().deny || [];
        denied.forEach(h => bannedHostsRegexps.push(getRegex(h)));
        const allowed = aclEvent.getContent().allow || [];
        allowedHostsRegexps = []; // we don't want to use the default rule here

        allowed.forEach(h => allowedHostsRegexps.push(getRegex(h)));
      }
    }

    this.bannedHostsRegexps = bannedHostsRegexps;
    this.allowedHostsRegexps = allowedHostsRegexps;
  }

  updatePopulationMap() {
    const populationMap = {};

    for (const member of this.room.getJoinedMembers()) {
      const serverName = getServerName(member.userId);

      if (!populationMap[serverName]) {
        populationMap[serverName] = 0;
      }

      populationMap[serverName]++;
    }

    this.populationMap = populationMap;
  }

}

exports.RoomPermalinkCreator = RoomPermalinkCreator;

function makeGenericPermalink(entityId) {
  return getPermalinkConstructor().forEntity(entityId);
}

function makeUserPermalink(userId) {
  return getPermalinkConstructor().forUser(userId);
}

function makeRoomPermalink(roomId) {
  if (!roomId) {
    throw new Error("can't permalink a falsy roomId");
  } // If the roomId isn't actually a room ID, don't try to list the servers.
  // Aliases are already routable, and don't need extra information.


  if (roomId[0] !== '!') return getPermalinkConstructor().forRoom(roomId, []);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const room = client.getRoom(roomId);

  if (!room) {
    return getPermalinkConstructor().forRoom(roomId, []);
  }

  const permalinkCreator = new RoomPermalinkCreator(room);
  permalinkCreator.load();
  return permalinkCreator.forShareableRoom();
}

function makeGroupPermalink(groupId) {
  return getPermalinkConstructor().forGroup(groupId);
}

function isPermalinkHost(host) {
  // Always check if the permalink is a spec permalink (callers are likely to call
  // parsePermalink after this function).
  if (new _MatrixToPermalinkConstructor.default().isPermalinkHost(host)) return true;
  return getPermalinkConstructor().isPermalinkHost(host);
}
/**
 * Transforms an entity (permalink, room alias, user ID, etc) into a local URL
 * if possible. If it is already a permalink (matrix.to) it gets returned
 * unchanged.
 * @param {string} entity The entity to transform.
 * @returns {string|null} The transformed permalink or null if unable.
 */


function tryTransformEntityToPermalink(entity) {
  if (!entity) return null; // Check to see if it is a bare entity for starters

  if (entity[0] === '#' || entity[0] === '!') return makeRoomPermalink(entity);
  if (entity[0] === '@') return makeUserPermalink(entity);
  if (entity[0] === '+') return makeGroupPermalink(entity);

  if (entity.slice(0, 7) === "matrix:") {
    try {
      const permalinkParts = parsePermalink(entity);

      if (permalinkParts) {
        if (permalinkParts.roomIdOrAlias) {
          const eventIdPart = permalinkParts.eventId ? `/${permalinkParts.eventId}` : '';
          let pl = _MatrixToPermalinkConstructor.baseUrl + `/#/${permalinkParts.roomIdOrAlias}${eventIdPart}`;

          if (permalinkParts.viaServers.length > 0) {
            pl += new _MatrixToPermalinkConstructor.default().encodeServerCandidates(permalinkParts.viaServers);
          }

          return pl;
        } else if (permalinkParts.groupId) {
          return _MatrixToPermalinkConstructor.baseUrl + `/#/${permalinkParts.groupId}`;
        } else if (permalinkParts.userId) {
          return _MatrixToPermalinkConstructor.baseUrl + `/#/${permalinkParts.userId}`;
        }
      }
    } catch {}
  }

  return entity;
}
/**
 * Transforms a permalink (or possible permalink) into a local URL if possible. If
 * the given permalink is found to not be a permalink, it'll be returned unaltered.
 * @param {string} permalink The permalink to try and transform.
 * @returns {string} The transformed permalink or original URL if unable.
 */


function tryTransformPermalinkToLocalHref(permalink) {
  if (!permalink.startsWith("http:") && !permalink.startsWith("https:") && !permalink.startsWith("matrix:") && !permalink.startsWith("vector:") // Element Desktop
  ) {
    return permalink;
  }

  try {
    const m = decodeURIComponent(permalink).match(_linkifyMatrix.ELEMENT_URL_PATTERN);

    if (m) {
      return m[1];
    }
  } catch (e) {
    // Not a valid URI
    return permalink;
  } // A bit of a hack to convert permalinks of unknown origin to Element links


  try {
    const permalinkParts = parsePermalink(permalink);

    if (permalinkParts) {
      if (permalinkParts.roomIdOrAlias) {
        const eventIdPart = permalinkParts.eventId ? `/${permalinkParts.eventId}` : '';
        permalink = `#/room/${permalinkParts.roomIdOrAlias}${eventIdPart}`;

        if (permalinkParts.viaServers.length > 0) {
          permalink += new _MatrixToPermalinkConstructor.default().encodeServerCandidates(permalinkParts.viaServers);
        }
      } else if (permalinkParts.userId) {
        permalink = `#/user/${permalinkParts.userId}`;
      } else if (permalinkParts.groupId) {
        permalink = `#/group/${permalinkParts.groupId}`;
      } // else not a valid permalink for our purposes - do not handle

    }
  } catch (e) {// Not an href we need to care about
  }

  return permalink;
}

function getPrimaryPermalinkEntity(permalink) {
  try {
    let permalinkParts = parsePermalink(permalink); // If not a permalink, try the vector patterns.

    if (!permalinkParts) {
      const m = permalink.match(_linkifyMatrix.ELEMENT_URL_PATTERN);

      if (m) {
        // A bit of a hack, but it gets the job done
        const handler = new _ElementPermalinkConstructor.default("http://localhost");
        const entityInfo = m[1].split('#').slice(1).join('#');
        permalinkParts = handler.parsePermalink(`http://localhost/#${entityInfo}`);
      }
    }

    if (!permalinkParts) return null; // not processable

    if (permalinkParts.userId) return permalinkParts.userId;
    if (permalinkParts.roomIdOrAlias) return permalinkParts.roomIdOrAlias;
    if (permalinkParts.groupId) return permalinkParts.groupId;
  } catch (e) {// no entity - not a permalink
  }

  return null;
}

function getPermalinkConstructor() {
  const elementPrefix = _SdkConfig.default.get("permalink_prefix");

  if (elementPrefix && elementPrefix !== _MatrixToPermalinkConstructor.baseUrl) {
    return new _ElementPermalinkConstructor.default(elementPrefix);
  }

  return new _MatrixToPermalinkConstructor.default();
}

function parsePermalink(fullUrl) {
  try {
    const elementPrefix = _SdkConfig.default.get("permalink_prefix");

    if (decodeURIComponent(fullUrl).startsWith(_MatrixToPermalinkConstructor.baseUrl)) {
      return new _MatrixToPermalinkConstructor.default().parsePermalink(decodeURIComponent(fullUrl));
    } else if (fullUrl.startsWith("matrix:")) {
      return new _MatrixSchemePermalinkConstructor.default().parsePermalink(fullUrl);
    } else if (elementPrefix && fullUrl.startsWith(elementPrefix)) {
      return new _ElementPermalinkConstructor.default(elementPrefix).parsePermalink(fullUrl);
    }
  } catch (e) {
    _logger.logger.error("Failed to parse permalink", e);
  }

  return null; // not a permalink we can handle
}

function getServerName(userId) {
  return userId.split(":").splice(1).join(":");
}

function getHostnameFromMatrixDomain(domain) {
  if (!domain) return null;
  return new URL(`https://${domain}`).hostname;
}

function isHostInRegex(hostname, regexps) {
  hostname = getHostnameFromMatrixDomain(hostname);
  if (!hostname) return true; // assumed

  if (regexps.length > 0 && !regexps[0].test) throw new Error(regexps[0].toString());
  return regexps.some(h => h.test(hostname));
}

function isHostnameIpAddress(hostname) {
  hostname = getHostnameFromMatrixDomain(hostname);
  if (!hostname) return false; // is-ip doesn't want IPv6 addresses surrounded by brackets, so
  // take them off.

  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.substring(1, hostname.length - 1);
  }

  return (0, _isIp.default)(hostname);
}

const calculateRoomVia = room => {
  const permalinkCreator = new RoomPermalinkCreator(room);
  permalinkCreator.load();
  return permalinkCreator.serverCandidates;
};

exports.calculateRoomVia = calculateRoomVia;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfU0VSVkVSX0NBTkRJREFURVMiLCJBTllfUkVHRVgiLCJSb29tUGVybWFsaW5rQ3JlYXRvciIsImNvbnN0cnVjdG9yIiwicm9vbSIsInJvb21JZCIsInNob3VsZFRocm90dGxlIiwiZnVsbFVwZGF0ZSIsImNhbmRpZGF0ZXMiLCJTZXQiLCJoaWdoZXN0UGxVc2VySWQiLCJhZGQiLCJnZXRTZXJ2ZXJOYW1lIiwic2VydmVyc0J5UG9wdWxhdGlvbiIsIk9iamVjdCIsImtleXMiLCJwb3B1bGF0aW9uTWFwIiwic29ydCIsImEiLCJiIiwiaSIsImxlbmd0aCIsInNpemUiLCJzZXJ2ZXIiLCJoYXMiLCJpc0hvc3RuYW1lSXBBZGRyZXNzIiwiaXNIb3N0SW5SZWdleCIsImJhbm5lZEhvc3RzUmVnZXhwcyIsImFsbG93ZWRIb3N0c1JlZ2V4cHMiLCJfc2VydmVyQ2FuZGlkYXRlcyIsInN0YXJ0ZWQiLCJFcnJvciIsImxvYWQiLCJjdXJyZW50U3RhdGUiLCJsb2dnZXIiLCJ3YXJuIiwic3RhcnQiLCJvbiIsIlJvb21TdGF0ZUV2ZW50IiwiVXBkYXRlIiwib25Sb29tU3RhdGVVcGRhdGUiLCJzdG9wIiwicmVtb3ZlTGlzdGVuZXIiLCJzZXJ2ZXJDYW5kaWRhdGVzIiwiaXNTdGFydGVkIiwiZm9yRXZlbnQiLCJldmVudElkIiwiZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IiLCJmb3JTaGFyZWFibGVSb29tIiwiYWxpYXMiLCJnZXRDYW5vbmljYWxBbGlhcyIsImZvclJvb20iLCJ1cGRhdGVBbGxvd2VkU2VydmVycyIsInVwZGF0ZUhpZ2hlc3RQbFVzZXIiLCJ1cGRhdGVQb3B1bGF0aW9uTWFwIiwidXBkYXRlU2VydmVyQ2FuZGlkYXRlcyIsInBsRXZlbnQiLCJnZXRTdGF0ZUV2ZW50cyIsImNvbnRlbnQiLCJnZXRDb250ZW50IiwidXNlcnMiLCJlbnRyaWVzIiwiYWxsb3dlZEVudHJpZXMiLCJmaWx0ZXIiLCJ1c2VySWQiLCJtZW1iZXIiLCJnZXRNZW1iZXIiLCJtZW1iZXJzaGlwIiwic2VydmVyTmFtZSIsIm1heEVudHJ5IiwicmVkdWNlIiwibWF4IiwiZW50cnkiLCJwb3dlckxldmVsIiwiYWNsRXZlbnQiLCJFdmVudFR5cGUiLCJSb29tU2VydmVyQWNsIiwiZ2V0UmVnZXgiLCJob3N0bmFtZSIsIlJlZ0V4cCIsInV0aWxzIiwiZ2xvYlRvUmVnZXhwIiwiZGVuaWVkIiwiZGVueSIsImZvckVhY2giLCJoIiwicHVzaCIsImFsbG93ZWQiLCJhbGxvdyIsImdldEpvaW5lZE1lbWJlcnMiLCJtYWtlR2VuZXJpY1Blcm1hbGluayIsImVudGl0eUlkIiwiZm9yRW50aXR5IiwibWFrZVVzZXJQZXJtYWxpbmsiLCJmb3JVc2VyIiwibWFrZVJvb21QZXJtYWxpbmsiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwicGVybWFsaW5rQ3JlYXRvciIsIm1ha2VHcm91cFBlcm1hbGluayIsImdyb3VwSWQiLCJmb3JHcm91cCIsImlzUGVybWFsaW5rSG9zdCIsImhvc3QiLCJNYXRyaXhUb1Blcm1hbGlua0NvbnN0cnVjdG9yIiwidHJ5VHJhbnNmb3JtRW50aXR5VG9QZXJtYWxpbmsiLCJlbnRpdHkiLCJzbGljZSIsInBlcm1hbGlua1BhcnRzIiwicGFyc2VQZXJtYWxpbmsiLCJyb29tSWRPckFsaWFzIiwiZXZlbnRJZFBhcnQiLCJwbCIsIm1hdHJpeHRvQmFzZVVybCIsInZpYVNlcnZlcnMiLCJlbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzIiwidHJ5VHJhbnNmb3JtUGVybWFsaW5rVG9Mb2NhbEhyZWYiLCJwZXJtYWxpbmsiLCJzdGFydHNXaXRoIiwibSIsImRlY29kZVVSSUNvbXBvbmVudCIsIm1hdGNoIiwiRUxFTUVOVF9VUkxfUEFUVEVSTiIsImUiLCJnZXRQcmltYXJ5UGVybWFsaW5rRW50aXR5IiwiaGFuZGxlciIsIkVsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3RvciIsImVudGl0eUluZm8iLCJzcGxpdCIsImpvaW4iLCJlbGVtZW50UHJlZml4IiwiU2RrQ29uZmlnIiwiZnVsbFVybCIsIk1hdHJpeFNjaGVtZVBlcm1hbGlua0NvbnN0cnVjdG9yIiwiZXJyb3IiLCJzcGxpY2UiLCJnZXRIb3N0bmFtZUZyb21NYXRyaXhEb21haW4iLCJkb21haW4iLCJVUkwiLCJyZWdleHBzIiwidGVzdCIsInRvU3RyaW5nIiwic29tZSIsImVuZHNXaXRoIiwic3Vic3RyaW5nIiwiaXNJcCIsImNhbGN1bGF0ZVJvb21WaWEiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBpc0lwIGZyb20gXCJpcy1pcFwiO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBSb29tU3RhdGVFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1zdGF0ZVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgTWF0cml4VG9QZXJtYWxpbmtDb25zdHJ1Y3RvciwgeyBiYXNlVXJsIGFzIG1hdHJpeHRvQmFzZVVybCB9IGZyb20gXCIuL01hdHJpeFRvUGVybWFsaW5rQ29uc3RydWN0b3JcIjtcbmltcG9ydCBQZXJtYWxpbmtDb25zdHJ1Y3RvciwgeyBQZXJtYWxpbmtQYXJ0cyB9IGZyb20gXCIuL1Blcm1hbGlua0NvbnN0cnVjdG9yXCI7XG5pbXBvcnQgRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yIGZyb20gXCIuL0VsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3RvclwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBFTEVNRU5UX1VSTF9QQVRURVJOIH0gZnJvbSBcIi4uLy4uL2xpbmtpZnktbWF0cml4XCI7XG5pbXBvcnQgTWF0cml4U2NoZW1lUGVybWFsaW5rQ29uc3RydWN0b3IgZnJvbSBcIi4vTWF0cml4U2NoZW1lUGVybWFsaW5rQ29uc3RydWN0b3JcIjtcblxuLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIHNlcnZlcnMgdG8gcGljayB3aGVuIHdvcmtpbmcgb3V0IHdoaWNoIHNlcnZlcnNcbi8vIHRvIGFkZCB0byBwZXJtYWxpbmtzLiBUaGUgc2VydmVycyBhcmUgYXBwZW5kZWQgYXMgP3ZpYT1leGFtcGxlLm9yZ1xuY29uc3QgTUFYX1NFUlZFUl9DQU5ESURBVEVTID0gMztcblxuY29uc3QgQU5ZX1JFR0VYID0gLy4qLztcblxuLy8gUGVybWFsaW5rcyBjYW4gaGF2ZSBzZXJ2ZXJzIGFwcGVuZGVkIHRvIHRoZW0gc28gdGhhdCB0aGUgdXNlclxuLy8gcmVjZWl2aW5nIHRoZW0gY2FuIGhhdmUgYSBmaWdodGluZyBjaGFuY2UgYXQgam9pbmluZyB0aGUgcm9vbS5cbi8vIFRoZXNlIHNlcnZlcnMgYXJlIGNhbGxlZCBcImNhbmRpZGF0ZXNcIiBhdCB0aGlzIHBvaW50IGJlY2F1c2Vcbi8vIGl0IGlzIHVuY2xlYXIgd2hldGhlciB0aGV5IGFyZSBnb2luZyB0byBiZSB1c2VmdWwgdG8gYWN0dWFsbHlcbi8vIGpvaW4gaW4gdGhlIGZ1dHVyZS5cbi8vXG4vLyBXZSBwaWNrIDMgc2VydmVycyBiYXNlZCBvbiB0aGUgZm9sbG93aW5nIGNyaXRlcmlhOlxuLy9cbi8vICAgU2VydmVyIDE6IFRoZSBoaWdoZXN0IHBvd2VyIGxldmVsIHVzZXIgaW4gdGhlIHJvb20sIHByb3ZpZGVkXG4vLyAgIHRoZXkgYXJlIGF0IGxlYXN0IFBMIDUwLiBXZSBkb24ndCBjYWxjdWxhdGUgXCJ3aGF0IGlzIGEgbW9kZXJhdG9yXCJcbi8vICAgaGVyZSBiZWNhdXNlIGl0IGlzIGxlc3MgcmVsZXZhbnQgZm9yIHRoZSB2YXN0IG1ham9yaXR5IG9mIHJvb21zLlxuLy8gICBXZSBhbHNvIHdhbnQgdG8gZW5zdXJlIHRoYXQgd2UgZ2V0IGFuIGFkbWluIG9yIGhpZ2gtcmFua2luZyBtb2Rcbi8vICAgYXMgdGhleSBhcmUgbGVzcyBsaWtlbHkgdG8gbGVhdmUgdGhlIHJvb20uIElmIG5vIHVzZXIgaGFwcGVuc1xuLy8gICB0byBtZWV0IHRoaXMgY3JpdGVyaWEsIHdlJ2xsIHBpY2sgdGhlIG1vc3QgcG9wdWxhciBzZXJ2ZXIgaW4gdGhlXG4vLyAgIHJvb20uXG4vL1xuLy8gICBTZXJ2ZXIgMjogVGhlIG5leHQgbW9zdCBwb3B1bGFyIHNlcnZlciBpbiB0aGUgcm9vbSAoaW4gdXNlclxuLy8gICBkaXN0cmlidXRpb24pLiBUaGlzIGNhbm5vdCBiZSB0aGUgc2FtZSBhcyBTZXJ2ZXIgMS4gSWYgbm8gb3RoZXJcbi8vICAgc2VydmVycyBhcmUgYXZhaWxhYmxlIHRoZW4gd2UnbGwgb25seSByZXR1cm4gU2VydmVyIDEuXG4vL1xuLy8gICBTZXJ2ZXIgMzogVGhlIG5leHQgbW9zdCBwb3B1bGFyIHNlcnZlciBieSB1c2VyIGRpc3RyaWJ1dGlvbi4gVGhpc1xuLy8gICBoYXMgdGhlIHNhbWUgcnVsZXMgYXMgU2VydmVyIDIsIHdpdGggdGhlIGFkZGVkIGV4Y2VwdGlvbiB0aGF0IGl0XG4vLyAgIG11c3QgYmUgdW5pcXVlIGZyb20gU2VydmVyIDEgYW5kIDIuXG5cbi8vIFJhdGlvbmFsZSBmb3IgcG9wdWxhciBzZXJ2ZXJzOiBJdCdzIGhhcmQgdG8gZ2V0IHJpZCBvZiBwZW9wbGUgd2hlblxuLy8gdGhleSBrZWVwIGZsb2NraW5nIGluIGZyb20gYSBwYXJ0aWN1bGFyIHNlcnZlci4gU3VyZSwgdGhlIHNlcnZlciBjb3VsZFxuLy8gYmUgQUNMJ2QgaW4gdGhlIGZ1dHVyZSBvciBmb3Igc29tZSByZWFzb24gYmUgZXZpY3RlZCBmcm9tIHRoZSByb29tXG4vLyBob3dldmVyIGFuIGV2ZW50IGxpa2UgdGhhdCBpcyB1bmxpa2VseSB0aGUgbGFyZ2VyIHRoZSByb29tIGdldHMuIElmXG4vLyB0aGUgc2VydmVyIGlzIEFDTCdkIGF0IHRoZSB0aW1lIG9mIGdlbmVyYXRpbmcgdGhlIGxpbmsgaG93ZXZlciwgd2Vcbi8vIHNob3VsZG4ndCBwaWNrIHRoZW0uIFdlIGFsc28gZG9uJ3QgcGljayBJUCBhZGRyZXNzZXMuXG5cbi8vIE5vdGU6IHdlIGRvbid0IHBpY2sgdGhlIHNlcnZlciB0aGUgcm9vbSB3YXMgY3JlYXRlZCBvbiBiZWNhdXNlIHRoZVxuLy8gaG9tZXNlcnZlciBzaG91bGQgYWxyZWFkeSBiZSB1c2luZyB0aGF0IHNlcnZlciBhcyBhIGxhc3QgZGl0Y2ggYXR0ZW1wdFxuLy8gYW5kIHRoZXJlJ3MgbGVzcyBvZiBhIGd1YXJhbnRlZSB0aGF0IHRoZSBzZXJ2ZXIgaXMgYSByZXNpZGVudCBzZXJ2ZXIuXG4vLyBJbnN0ZWFkLCB3ZSBhY3RpdmVseSBmaWd1cmUgb3V0IHdoaWNoIHNlcnZlcnMgYXJlIGxpa2VseSB0byBiZSByZXNpZGVudHNcbi8vIGluIHRoZSBmdXR1cmUgYW5kIHRyeSB0byB1c2UgdGhvc2UuXG5cbi8vIE5vdGU6IFVzZXJzIHJlY2VpdmluZyBwZXJtYWxpbmtzIHRoYXQgaGFwcGVuIHRvIGhhdmUgYWxsIDMgcG90ZW50aWFsXG4vLyBzZXJ2ZXJzIGZhaWwgdGhlbSAoaW4gdGVybXMgb2Ygam9pbmluZykgYXJlIHNvbWV3aGF0IGV4cGVjdGVkIHRvIGh1bnRcbi8vIGRvd24gdGhlIHBlcnNvbiB3aG8gZ2F2ZSB0aGVtIHRoZSBsaW5rIHRvIGFzayBmb3IgYSBwYXJ0aWNpcGF0aW5nIHNlcnZlci5cbi8vIFRoZSByZWNlaXZpbmcgdXNlciBjYW4gdGhlbiBtYW51YWxseSBhcHBlbmQgdGhlIGtub3duLWdvb2Qgc2VydmVyIHRvXG4vLyB0aGUgbGlzdCBhbmQgbWFnaWNhbGx5IGhhdmUgdGhlIGxpbmsgd29yay5cblxuZXhwb3J0IGNsYXNzIFJvb21QZXJtYWxpbmtDcmVhdG9yIHtcbiAgICBwcml2YXRlIHJvb206IFJvb207XG4gICAgcHJpdmF0ZSByb29tSWQ6IHN0cmluZztcbiAgICBwcml2YXRlIGhpZ2hlc3RQbFVzZXJJZDogc3RyaW5nO1xuICAgIHByaXZhdGUgcG9wdWxhdGlvbk1hcDogeyBbc2VydmVyTmFtZTogc3RyaW5nXTogbnVtYmVyIH07XG4gICAgcHJpdmF0ZSBiYW5uZWRIb3N0c1JlZ2V4cHM6IFJlZ0V4cFtdO1xuICAgIHByaXZhdGUgYWxsb3dlZEhvc3RzUmVnZXhwczogUmVnRXhwW107XG4gICAgcHJpdmF0ZSBfc2VydmVyQ2FuZGlkYXRlczogc3RyaW5nW107XG4gICAgcHJpdmF0ZSBzdGFydGVkOiBib29sZWFuO1xuXG4gICAgLy8gV2Ugc3VwcG9ydCBiZWluZyBnaXZlbiBhIHJvb21JZCBhcyBhIGZhbGxiYWNrIGluIHRoZSBldmVudCB0aGUgYHJvb21gIG9iamVjdFxuICAgIC8vIGRvZXNuJ3QgZXhpc3Qgb3IgaXMgbm90IGhlYWx0aHkgZm9yIHVzIHRvIHJlbHkgb24uIEZvciBleGFtcGxlLCBsb2FkaW5nIGFcbiAgICAvLyBwZXJtYWxpbmsgdG8gYSByb29tIHdoaWNoIHRoZSBNYXRyaXhDbGllbnQgZG9lc24ndCBrbm93IGFib3V0LlxuICAgIC8vIFNvbWUgb2YgdGhlIHRlc3RzIGRvbmUgYnkgdGhpcyBjbGFzcyBhcmUgcmVsYXRpdmVseSBleHBlbnNpdmUsIHNvIG5vcm1hbGx5XG4gICAgLy8gdGhyb3R0bGVkIHRvIG5vdCBoYXBwZW4gb24gZXZlcnkgdXBkYXRlLiBQYXNzIGZhbHNlIGFzIHRoZSBzaG91bGRUaHJvdHRsZVxuICAgIC8vIHBhcmFtIHRvIGRpc2FibGUgdGhpcyBiZWhhdmlvdXIsIGVnLiBmb3IgdGVzdHMuXG4gICAgY29uc3RydWN0b3Iocm9vbTogUm9vbSwgcm9vbUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbCwgc2hvdWxkVGhyb3R0bGUgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMucm9vbSA9IHJvb207XG4gICAgICAgIHRoaXMucm9vbUlkID0gcm9vbSA/IHJvb20ucm9vbUlkIDogcm9vbUlkO1xuICAgICAgICB0aGlzLmhpZ2hlc3RQbFVzZXJJZCA9IG51bGw7XG4gICAgICAgIHRoaXMucG9wdWxhdGlvbk1hcCA9IG51bGw7XG4gICAgICAgIHRoaXMuYmFubmVkSG9zdHNSZWdleHBzID0gbnVsbDtcbiAgICAgICAgdGhpcy5hbGxvd2VkSG9zdHNSZWdleHBzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc2VydmVyQ2FuZGlkYXRlcyA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghdGhpcy5yb29tSWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byByZXNvbHZlIGEgcm9vbUlkIGZvciB0aGUgcGVybWFsaW5rIGNyZWF0b3IgdG8gdXNlXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWQoKSB7XG4gICAgICAgIGlmICghdGhpcy5yb29tIHx8ICF0aGlzLnJvb20uY3VycmVudFN0YXRlKSB7XG4gICAgICAgICAgICAvLyBVbmRlciByYXJlIGFuZCB1bmtub3duIGNpcmN1bXN0YW5jZXMgaXQgaXMgcG9zc2libGUgdG8gaGF2ZSBhIHJvb20gd2l0aCBub1xuICAgICAgICAgICAgLy8gY3VycmVudFN0YXRlLCBhdCBsZWFzdCBwb3RlbnRpYWxseSBhdCB0aGUgZWFybHkgc3RhZ2VzIG9mIGpvaW5pbmcgYSByb29tLlxuICAgICAgICAgICAgLy8gVG8gYXZvaWQgYnJlYWtpbmcgZXZlcnl0aGluZywgd2UnbGwganVzdCB3YXJuIHJhdGhlciB0aGFuIHRocm93IGFzIHdlbGwgYXNcbiAgICAgICAgICAgIC8vIG5vdCBib3RoZXIgdXBkYXRpbmcgdGhlIHZhcmlvdXMgYXNwZWN0cyBvZiB0aGUgc2hhcmUgbGluay5cbiAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiVHJpZWQgdG8gbG9hZCBhIHBlcm1hbGluayBjcmVhdG9yIHdpdGggbm8gcm9vbSBzdGF0ZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZ1bGxVcGRhdGUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB0aGlzLnJvb20uY3VycmVudFN0YXRlLm9uKFJvb21TdGF0ZUV2ZW50LlVwZGF0ZSwgdGhpcy5vblJvb21TdGF0ZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3AoKSB7XG4gICAgICAgIHRoaXMucm9vbS5jdXJyZW50U3RhdGUucmVtb3ZlTGlzdGVuZXIoUm9vbVN0YXRlRXZlbnQuVXBkYXRlLCB0aGlzLm9uUm9vbVN0YXRlVXBkYXRlKTtcbiAgICAgICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzZXJ2ZXJDYW5kaWRhdGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VydmVyQ2FuZGlkYXRlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNTdGFydGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydGVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBmb3JFdmVudChldmVudElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5mb3JFdmVudCh0aGlzLnJvb21JZCwgZXZlbnRJZCwgdGhpcy5fc2VydmVyQ2FuZGlkYXRlcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGZvclNoYXJlYWJsZVJvb20oKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMucm9vbSkge1xuICAgICAgICAgICAgLy8gUHJlZmVyIHRvIHVzZSBjYW5vbmljYWwgYWxpYXMgZm9yIHBlcm1hbGluayBpZiBwb3NzaWJsZVxuICAgICAgICAgICAgY29uc3QgYWxpYXMgPSB0aGlzLnJvb20uZ2V0Q2Fub25pY2FsQWxpYXMoKTtcbiAgICAgICAgICAgIGlmIChhbGlhcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmZvclJvb20oYWxpYXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmZvclJvb20odGhpcy5yb29tSWQsIHRoaXMuX3NlcnZlckNhbmRpZGF0ZXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBmb3JSb29tKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmZvclJvb20odGhpcy5yb29tSWQsIHRoaXMuX3NlcnZlckNhbmRpZGF0ZXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZnVsbFVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGZ1bGxVcGRhdGUoKSB7XG4gICAgICAgIC8vIFRoaXMgdXBkYXRlcyB0aGUgaW50ZXJuYWwgc3RhdGUgb2YgdGhpcyBvYmplY3QgZnJvbSB0aGUgcm9vbSBzdGF0ZS4gSXQncyBicm9rZW5cbiAgICAgICAgLy8gZG93biBpbnRvIHNlcGFyYXRlIGZ1bmN0aW9ucywgcHJldmlvdXNseSBiZWNhdXNlIHdlIGRpZCBzb21lIG9mIHRoZXNlIGFzIGluY3JlbWVudGFsXG4gICAgICAgIC8vIHVwZGF0ZXMsIGJ1dCB0aGV5IHdlcmUgb24gbWVtYmVyIGV2ZW50cyB3aGljaCBjYW4gYmUgdmVyeSBudW1lcm91cywgc28gdGhlIGluY3JlbWVudGFsXG4gICAgICAgIC8vIHVwZGF0ZXMgZW5kZWQgdXAgYmVpbmcgbXVjaCBzbG93ZXIgdGhhbiBhIGZ1bGwgdXBkYXRlLiBXZSBub3cgaGF2ZSB0aGUgYmF0Y2ggc3RhdGUgdXBkYXRlXG4gICAgICAgIC8vIGV2ZW50LCBzbyB3ZSBqdXN0IHVwZGF0ZSBpbiBmdWxsLCBidXQgb24gZWFjaCBiYXRjaCBvZiB1cGRhdGVzLlxuICAgICAgICB0aGlzLnVwZGF0ZUFsbG93ZWRTZXJ2ZXJzKCk7XG4gICAgICAgIHRoaXMudXBkYXRlSGlnaGVzdFBsVXNlcigpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBvcHVsYXRpb25NYXAoKTtcbiAgICAgICAgdGhpcy51cGRhdGVTZXJ2ZXJDYW5kaWRhdGVzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVIaWdoZXN0UGxVc2VyKCkge1xuICAgICAgICBjb25zdCBwbEV2ZW50ID0gdGhpcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgXCJcIik7XG4gICAgICAgIGlmIChwbEV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcGxFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJzID0gY29udGVudC51c2VycztcbiAgICAgICAgICAgICAgICBpZiAodXNlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHVzZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWxsb3dlZEVudHJpZXMgPSBlbnRyaWVzLmZpbHRlcigoW3VzZXJJZF0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHRoaXMucm9vbS5nZXRNZW1iZXIodXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyIHx8IG1lbWJlci5tZW1iZXJzaGlwICE9PSBcImpvaW5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZlck5hbWUgPSBnZXRTZXJ2ZXJOYW1lKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWlzSG9zdG5hbWVJcEFkZHJlc3Moc2VydmVyTmFtZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaXNIb3N0SW5SZWdleChzZXJ2ZXJOYW1lLCB0aGlzLmJhbm5lZEhvc3RzUmVnZXhwcykgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0hvc3RJblJlZ2V4KHNlcnZlck5hbWUsIHRoaXMuYWxsb3dlZEhvc3RzUmVnZXhwcyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXhFbnRyeSA9IGFsbG93ZWRFbnRyaWVzLnJlZHVjZSgobWF4LCBlbnRyeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChlbnRyeVsxXSA+IG1heFsxXSkgPyBlbnRyeSA6IG1heDtcbiAgICAgICAgICAgICAgICAgICAgfSwgW251bGwsIDBdKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3VzZXJJZCwgcG93ZXJMZXZlbF0gPSBtYXhFbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqZWN0IHdhc24ndCBlbXB0eSwgYW5kIG1heCBlbnRyeSB3YXNuJ3QgYSBkZW1vdGlvbiBmcm9tIHRoZSBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VySWQgIT09IG51bGwgJiYgcG93ZXJMZXZlbCA+PSA1MCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdoZXN0UGxVc2VySWQgPSB1c2VySWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWdoZXN0UGxVc2VySWQgPSBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlQWxsb3dlZFNlcnZlcnMoKSB7XG4gICAgICAgIGNvbnN0IGJhbm5lZEhvc3RzUmVnZXhwcyA9IFtdO1xuICAgICAgICBsZXQgYWxsb3dlZEhvc3RzUmVnZXhwcyA9IFtBTllfUkVHRVhdOyAvLyBkZWZhdWx0IGFsbG93IGV2ZXJ5b25lXG4gICAgICAgIGlmICh0aGlzLnJvb20uY3VycmVudFN0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBhY2xFdmVudCA9IHRoaXMucm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21TZXJ2ZXJBY2wsIFwiXCIpO1xuICAgICAgICAgICAgaWYgKGFjbEV2ZW50ICYmIGFjbEV2ZW50LmdldENvbnRlbnQoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdldFJlZ2V4ID0gKGhvc3RuYW1lKSA9PiBuZXcgUmVnRXhwKFwiXlwiICsgdXRpbHMuZ2xvYlRvUmVnZXhwKGhvc3RuYW1lLCBmYWxzZSkgKyBcIiRcIik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkZW5pZWQgPSBhY2xFdmVudC5nZXRDb250ZW50KCkuZGVueSB8fCBbXTtcbiAgICAgICAgICAgICAgICBkZW5pZWQuZm9yRWFjaChoID0+IGJhbm5lZEhvc3RzUmVnZXhwcy5wdXNoKGdldFJlZ2V4KGgpKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhbGxvd2VkID0gYWNsRXZlbnQuZ2V0Q29udGVudCgpLmFsbG93IHx8IFtdO1xuICAgICAgICAgICAgICAgIGFsbG93ZWRIb3N0c1JlZ2V4cHMgPSBbXTsgLy8gd2UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgcnVsZSBoZXJlXG4gICAgICAgICAgICAgICAgYWxsb3dlZC5mb3JFYWNoKGggPT4gYWxsb3dlZEhvc3RzUmVnZXhwcy5wdXNoKGdldFJlZ2V4KGgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iYW5uZWRIb3N0c1JlZ2V4cHMgPSBiYW5uZWRIb3N0c1JlZ2V4cHM7XG4gICAgICAgIHRoaXMuYWxsb3dlZEhvc3RzUmVnZXhwcyA9IGFsbG93ZWRIb3N0c1JlZ2V4cHM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVQb3B1bGF0aW9uTWFwKCkge1xuICAgICAgICBjb25zdCBwb3B1bGF0aW9uTWFwOiB7IFtzZXJ2ZXI6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIHRoaXMucm9vbS5nZXRKb2luZWRNZW1iZXJzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlck5hbWUgPSBnZXRTZXJ2ZXJOYW1lKG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgaWYgKCFwb3B1bGF0aW9uTWFwW3NlcnZlck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgcG9wdWxhdGlvbk1hcFtzZXJ2ZXJOYW1lXSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3B1bGF0aW9uTWFwW3NlcnZlck5hbWVdKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uTWFwID0gcG9wdWxhdGlvbk1hcDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVNlcnZlckNhbmRpZGF0ZXMgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgaWYgKHRoaXMuaGlnaGVzdFBsVXNlcklkKSB7XG4gICAgICAgICAgICBjYW5kaWRhdGVzLmFkZChnZXRTZXJ2ZXJOYW1lKHRoaXMuaGlnaGVzdFBsVXNlcklkKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXJ2ZXJzQnlQb3B1bGF0aW9uID0gT2JqZWN0LmtleXModGhpcy5wb3B1bGF0aW9uTWFwKVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IHRoaXMucG9wdWxhdGlvbk1hcFtiXSAtIHRoaXMucG9wdWxhdGlvbk1hcFthXSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXJ2ZXJzQnlQb3B1bGF0aW9uLmxlbmd0aCAmJiBjYW5kaWRhdGVzLnNpemUgPCBNQVhfU0VSVkVSX0NBTkRJREFURVM7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgc2VydmVyID0gc2VydmVyc0J5UG9wdWxhdGlvbltpXTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAhY2FuZGlkYXRlcy5oYXMoc2VydmVyKSAmJlxuICAgICAgICAgICAgICAgICFpc0hvc3RuYW1lSXBBZGRyZXNzKHNlcnZlcikgJiZcbiAgICAgICAgICAgICAgICAhaXNIb3N0SW5SZWdleChzZXJ2ZXIsIHRoaXMuYmFubmVkSG9zdHNSZWdleHBzKSAmJlxuICAgICAgICAgICAgICAgIGlzSG9zdEluUmVnZXgoc2VydmVyLCB0aGlzLmFsbG93ZWRIb3N0c1JlZ2V4cHMpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjYW5kaWRhdGVzLmFkZChzZXJ2ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2VydmVyQ2FuZGlkYXRlcyA9IFsuLi5jYW5kaWRhdGVzXTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUdlbmVyaWNQZXJtYWxpbmsoZW50aXR5SWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yRW50aXR5KGVudGl0eUlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VVc2VyUGVybWFsaW5rKHVzZXJJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5mb3JVc2VyKHVzZXJJZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUm9vbVBlcm1hbGluayhyb29tSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FuJ3QgcGVybWFsaW5rIGEgZmFsc3kgcm9vbUlkXCIpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSByb29tSWQgaXNuJ3QgYWN0dWFsbHkgYSByb29tIElELCBkb24ndCB0cnkgdG8gbGlzdCB0aGUgc2VydmVycy5cbiAgICAvLyBBbGlhc2VzIGFyZSBhbHJlYWR5IHJvdXRhYmxlLCBhbmQgZG9uJ3QgbmVlZCBleHRyYSBpbmZvcm1hdGlvbi5cbiAgICBpZiAocm9vbUlkWzBdICE9PSAnIScpIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmZvclJvb20ocm9vbUlkLCBbXSk7XG5cbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgaWYgKCFyb29tKSB7XG4gICAgICAgIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmZvclJvb20ocm9vbUlkLCBbXSk7XG4gICAgfVxuICAgIGNvbnN0IHBlcm1hbGlua0NyZWF0b3IgPSBuZXcgUm9vbVBlcm1hbGlua0NyZWF0b3Iocm9vbSk7XG4gICAgcGVybWFsaW5rQ3JlYXRvci5sb2FkKCk7XG4gICAgcmV0dXJuIHBlcm1hbGlua0NyZWF0b3IuZm9yU2hhcmVhYmxlUm9vbSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUdyb3VwUGVybWFsaW5rKGdyb3VwSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yR3JvdXAoZ3JvdXBJZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Blcm1hbGlua0hvc3QoaG9zdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gQWx3YXlzIGNoZWNrIGlmIHRoZSBwZXJtYWxpbmsgaXMgYSBzcGVjIHBlcm1hbGluayAoY2FsbGVycyBhcmUgbGlrZWx5IHRvIGNhbGxcbiAgICAvLyBwYXJzZVBlcm1hbGluayBhZnRlciB0aGlzIGZ1bmN0aW9uKS5cbiAgICBpZiAobmV3IE1hdHJpeFRvUGVybWFsaW5rQ29uc3RydWN0b3IoKS5pc1Blcm1hbGlua0hvc3QoaG9zdCkpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmlzUGVybWFsaW5rSG9zdChob3N0KTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGFuIGVudGl0eSAocGVybWFsaW5rLCByb29tIGFsaWFzLCB1c2VyIElELCBldGMpIGludG8gYSBsb2NhbCBVUkxcbiAqIGlmIHBvc3NpYmxlLiBJZiBpdCBpcyBhbHJlYWR5IGEgcGVybWFsaW5rIChtYXRyaXgudG8pIGl0IGdldHMgcmV0dXJuZWRcbiAqIHVuY2hhbmdlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRpdHkgVGhlIGVudGl0eSB0byB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IFRoZSB0cmFuc2Zvcm1lZCBwZXJtYWxpbmsgb3IgbnVsbCBpZiB1bmFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlUcmFuc2Zvcm1FbnRpdHlUb1Blcm1hbGluayhlbnRpdHk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCFlbnRpdHkpIHJldHVybiBudWxsO1xuXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIGl0IGlzIGEgYmFyZSBlbnRpdHkgZm9yIHN0YXJ0ZXJzXG4gICAgaWYgKGVudGl0eVswXSA9PT0gJyMnIHx8IGVudGl0eVswXSA9PT0gJyEnKSByZXR1cm4gbWFrZVJvb21QZXJtYWxpbmsoZW50aXR5KTtcbiAgICBpZiAoZW50aXR5WzBdID09PSAnQCcpIHJldHVybiBtYWtlVXNlclBlcm1hbGluayhlbnRpdHkpO1xuICAgIGlmIChlbnRpdHlbMF0gPT09ICcrJykgcmV0dXJuIG1ha2VHcm91cFBlcm1hbGluayhlbnRpdHkpO1xuXG4gICAgaWYgKGVudGl0eS5zbGljZSgwLCA3KSA9PT0gXCJtYXRyaXg6XCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBlcm1hbGlua1BhcnRzID0gcGFyc2VQZXJtYWxpbmsoZW50aXR5KTtcbiAgICAgICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cy5yb29tSWRPckFsaWFzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50SWRQYXJ0ID0gcGVybWFsaW5rUGFydHMuZXZlbnRJZCA/IGAvJHtwZXJtYWxpbmtQYXJ0cy5ldmVudElkfWAgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBsID0gbWF0cml4dG9CYXNlVXJsICsgYC8jLyR7cGVybWFsaW5rUGFydHMucm9vbUlkT3JBbGlhc30ke2V2ZW50SWRQYXJ0fWA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cy52aWFTZXJ2ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsICs9IG5ldyBNYXRyaXhUb1Blcm1hbGlua0NvbnN0cnVjdG9yKCkuZW5jb2RlU2VydmVyQ2FuZGlkYXRlcyhwZXJtYWxpbmtQYXJ0cy52aWFTZXJ2ZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJtYWxpbmtQYXJ0cy5ncm91cElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRyaXh0b0Jhc2VVcmwgKyBgLyMvJHtwZXJtYWxpbmtQYXJ0cy5ncm91cElkfWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJtYWxpbmtQYXJ0cy51c2VySWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdHJpeHRvQmFzZVVybCArIGAvIy8ke3Blcm1hbGlua1BhcnRzLnVzZXJJZH1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7fVxuICAgIH1cblxuICAgIHJldHVybiBlbnRpdHk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIHBlcm1hbGluayAob3IgcG9zc2libGUgcGVybWFsaW5rKSBpbnRvIGEgbG9jYWwgVVJMIGlmIHBvc3NpYmxlLiBJZlxuICogdGhlIGdpdmVuIHBlcm1hbGluayBpcyBmb3VuZCB0byBub3QgYmUgYSBwZXJtYWxpbmssIGl0J2xsIGJlIHJldHVybmVkIHVuYWx0ZXJlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwZXJtYWxpbmsgVGhlIHBlcm1hbGluayB0byB0cnkgYW5kIHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSB0cmFuc2Zvcm1lZCBwZXJtYWxpbmsgb3Igb3JpZ2luYWwgVVJMIGlmIHVuYWJsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmKHBlcm1hbGluazogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIXBlcm1hbGluay5zdGFydHNXaXRoKFwiaHR0cDpcIikgJiZcbiAgICAgICAgIXBlcm1hbGluay5zdGFydHNXaXRoKFwiaHR0cHM6XCIpICYmXG4gICAgICAgICFwZXJtYWxpbmsuc3RhcnRzV2l0aChcIm1hdHJpeDpcIikgJiZcbiAgICAgICAgIXBlcm1hbGluay5zdGFydHNXaXRoKFwidmVjdG9yOlwiKSAvLyBFbGVtZW50IERlc2t0b3BcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIHBlcm1hbGluaztcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBtID0gZGVjb2RlVVJJQ29tcG9uZW50KHBlcm1hbGluaykubWF0Y2goRUxFTUVOVF9VUkxfUEFUVEVSTik7XG4gICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gbVsxXTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gTm90IGEgdmFsaWQgVVJJXG4gICAgICAgIHJldHVybiBwZXJtYWxpbms7XG4gICAgfVxuXG4gICAgLy8gQSBiaXQgb2YgYSBoYWNrIHRvIGNvbnZlcnQgcGVybWFsaW5rcyBvZiB1bmtub3duIG9yaWdpbiB0byBFbGVtZW50IGxpbmtzXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGVybWFsaW5rUGFydHMgPSBwYXJzZVBlcm1hbGluayhwZXJtYWxpbmspO1xuICAgICAgICBpZiAocGVybWFsaW5rUGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cy5yb29tSWRPckFsaWFzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRJZFBhcnQgPSBwZXJtYWxpbmtQYXJ0cy5ldmVudElkID8gYC8ke3Blcm1hbGlua1BhcnRzLmV2ZW50SWR9YCA6ICcnO1xuICAgICAgICAgICAgICAgIHBlcm1hbGluayA9IGAjL3Jvb20vJHtwZXJtYWxpbmtQYXJ0cy5yb29tSWRPckFsaWFzfSR7ZXZlbnRJZFBhcnR9YDtcbiAgICAgICAgICAgICAgICBpZiAocGVybWFsaW5rUGFydHMudmlhU2VydmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlcm1hbGluayArPSBuZXcgTWF0cml4VG9QZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmVuY29kZVNlcnZlckNhbmRpZGF0ZXMocGVybWFsaW5rUGFydHMudmlhU2VydmVycyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJtYWxpbmtQYXJ0cy51c2VySWQpIHtcbiAgICAgICAgICAgICAgICBwZXJtYWxpbmsgPSBgIy91c2VyLyR7cGVybWFsaW5rUGFydHMudXNlcklkfWA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBlcm1hbGlua1BhcnRzLmdyb3VwSWQpIHtcbiAgICAgICAgICAgICAgICBwZXJtYWxpbmsgPSBgIy9ncm91cC8ke3Blcm1hbGlua1BhcnRzLmdyb3VwSWR9YDtcbiAgICAgICAgICAgIH0gLy8gZWxzZSBub3QgYSB2YWxpZCBwZXJtYWxpbmsgZm9yIG91ciBwdXJwb3NlcyAtIGRvIG5vdCBoYW5kbGVcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gTm90IGFuIGhyZWYgd2UgbmVlZCB0byBjYXJlIGFib3V0XG4gICAgfVxuXG4gICAgcmV0dXJuIHBlcm1hbGluaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW1hcnlQZXJtYWxpbmtFbnRpdHkocGVybWFsaW5rOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBwZXJtYWxpbmtQYXJ0cyA9IHBhcnNlUGVybWFsaW5rKHBlcm1hbGluayk7XG5cbiAgICAgICAgLy8gSWYgbm90IGEgcGVybWFsaW5rLCB0cnkgdGhlIHZlY3RvciBwYXR0ZXJucy5cbiAgICAgICAgaWYgKCFwZXJtYWxpbmtQYXJ0cykge1xuICAgICAgICAgICAgY29uc3QgbSA9IHBlcm1hbGluay5tYXRjaChFTEVNRU5UX1VSTF9QQVRURVJOKTtcbiAgICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICAgICAgLy8gQSBiaXQgb2YgYSBoYWNrLCBidXQgaXQgZ2V0cyB0aGUgam9iIGRvbmVcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gbmV3IEVsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3RvcihcImh0dHA6Ly9sb2NhbGhvc3RcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgZW50aXR5SW5mbyA9IG1bMV0uc3BsaXQoJyMnKS5zbGljZSgxKS5qb2luKCcjJyk7XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rUGFydHMgPSBoYW5kbGVyLnBhcnNlUGVybWFsaW5rKGBodHRwOi8vbG9jYWxob3N0LyMke2VudGl0eUluZm99YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBlcm1hbGlua1BhcnRzKSByZXR1cm4gbnVsbDsgLy8gbm90IHByb2Nlc3NhYmxlXG4gICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cy51c2VySWQpIHJldHVybiBwZXJtYWxpbmtQYXJ0cy51c2VySWQ7XG4gICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cy5yb29tSWRPckFsaWFzKSByZXR1cm4gcGVybWFsaW5rUGFydHMucm9vbUlkT3JBbGlhcztcbiAgICAgICAgaWYgKHBlcm1hbGlua1BhcnRzLmdyb3VwSWQpIHJldHVybiBwZXJtYWxpbmtQYXJ0cy5ncm91cElkO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gbm8gZW50aXR5IC0gbm90IGEgcGVybWFsaW5rXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCk6IFBlcm1hbGlua0NvbnN0cnVjdG9yIHtcbiAgICBjb25zdCBlbGVtZW50UHJlZml4ID0gU2RrQ29uZmlnLmdldChcInBlcm1hbGlua19wcmVmaXhcIik7XG4gICAgaWYgKGVsZW1lbnRQcmVmaXggJiYgZWxlbWVudFByZWZpeCAhPT0gbWF0cml4dG9CYXNlVXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yKGVsZW1lbnRQcmVmaXgpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTWF0cml4VG9QZXJtYWxpbmtDb25zdHJ1Y3RvcigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQZXJtYWxpbmsoZnVsbFVybDogc3RyaW5nKTogUGVybWFsaW5rUGFydHMge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRQcmVmaXggPSBTZGtDb25maWcuZ2V0KFwicGVybWFsaW5rX3ByZWZpeFwiKTtcbiAgICAgICAgaWYgKGRlY29kZVVSSUNvbXBvbmVudChmdWxsVXJsKS5zdGFydHNXaXRoKG1hdHJpeHRvQmFzZVVybCkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0cml4VG9QZXJtYWxpbmtDb25zdHJ1Y3RvcigpLnBhcnNlUGVybWFsaW5rKGRlY29kZVVSSUNvbXBvbmVudChmdWxsVXJsKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZnVsbFVybC5zdGFydHNXaXRoKFwibWF0cml4OlwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXhTY2hlbWVQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLnBhcnNlUGVybWFsaW5rKGZ1bGxVcmwpO1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnRQcmVmaXggJiYgZnVsbFVybC5zdGFydHNXaXRoKGVsZW1lbnRQcmVmaXgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3RvcihlbGVtZW50UHJlZml4KS5wYXJzZVBlcm1hbGluayhmdWxsVXJsKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIHBlcm1hbGlua1wiLCBlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDsgLy8gbm90IGEgcGVybWFsaW5rIHdlIGNhbiBoYW5kbGVcbn1cblxuZnVuY3Rpb24gZ2V0U2VydmVyTmFtZSh1c2VySWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHVzZXJJZC5zcGxpdChcIjpcIikuc3BsaWNlKDEpLmpvaW4oXCI6XCIpO1xufVxuXG5mdW5jdGlvbiBnZXRIb3N0bmFtZUZyb21NYXRyaXhEb21haW4oZG9tYWluOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghZG9tYWluKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gbmV3IFVSTChgaHR0cHM6Ly8ke2RvbWFpbn1gKS5ob3N0bmFtZTtcbn1cblxuZnVuY3Rpb24gaXNIb3N0SW5SZWdleChob3N0bmFtZTogc3RyaW5nLCByZWdleHBzOiBSZWdFeHBbXSk6IGJvb2xlYW4ge1xuICAgIGhvc3RuYW1lID0gZ2V0SG9zdG5hbWVGcm9tTWF0cml4RG9tYWluKGhvc3RuYW1lKTtcbiAgICBpZiAoIWhvc3RuYW1lKSByZXR1cm4gdHJ1ZTsgLy8gYXNzdW1lZFxuICAgIGlmIChyZWdleHBzLmxlbmd0aCA+IDAgJiYgIXJlZ2V4cHNbMF0udGVzdCkgdGhyb3cgbmV3IEVycm9yKHJlZ2V4cHNbMF0udG9TdHJpbmcoKSk7XG5cbiAgICByZXR1cm4gcmVnZXhwcy5zb21lKGggPT4gaC50ZXN0KGhvc3RuYW1lKSk7XG59XG5cbmZ1bmN0aW9uIGlzSG9zdG5hbWVJcEFkZHJlc3MoaG9zdG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGhvc3RuYW1lID0gZ2V0SG9zdG5hbWVGcm9tTWF0cml4RG9tYWluKGhvc3RuYW1lKTtcbiAgICBpZiAoIWhvc3RuYW1lKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBpcy1pcCBkb2Vzbid0IHdhbnQgSVB2NiBhZGRyZXNzZXMgc3Vycm91bmRlZCBieSBicmFja2V0cywgc29cbiAgICAvLyB0YWtlIHRoZW0gb2ZmLlxuICAgIGlmIChob3N0bmFtZS5zdGFydHNXaXRoKFwiW1wiKSAmJiBob3N0bmFtZS5lbmRzV2l0aChcIl1cIikpIHtcbiAgICAgICAgaG9zdG5hbWUgPSBob3N0bmFtZS5zdWJzdHJpbmcoMSwgaG9zdG5hbWUubGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlzSXAoaG9zdG5hbWUpO1xufVxuXG5leHBvcnQgY29uc3QgY2FsY3VsYXRlUm9vbVZpYSA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgY29uc3QgcGVybWFsaW5rQ3JlYXRvciA9IG5ldyBSb29tUGVybWFsaW5rQ3JlYXRvcihyb29tKTtcbiAgICBwZXJtYWxpbmtDcmVhdG9yLmxvYWQoKTtcbiAgICByZXR1cm4gcGVybWFsaW5rQ3JlYXRvci5zZXJ2ZXJDYW5kaWRhdGVzO1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkE7QUFDQTtBQUNBLE1BQU1BLHFCQUFxQixHQUFHLENBQTlCO0FBRUEsTUFBTUMsU0FBUyxHQUFHLElBQWxCLEMsQ0FFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVB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