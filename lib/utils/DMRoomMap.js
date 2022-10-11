"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _client = require("matrix-js-sdk/src/client");

var _logger = require("matrix-js-sdk/src/logger");

var _event = require("matrix-js-sdk/src/@types/event");

var _MatrixClientPeg = require("../MatrixClientPeg");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Class that takes a Matrix Client and flips the m.direct map
 * so the operation of mapping a room ID to which user it's a DM
 * with can be performed efficiently.
 *
 * With 'start', this can also keep itself up to date over time.
 */
class DMRoomMap {
  // TODO: convert these to maps
  constructor(matrixClient) {
    this.matrixClient = matrixClient;
    (0, _defineProperty2.default)(this, "roomToUser", null);
    (0, _defineProperty2.default)(this, "userToRooms", null);
    (0, _defineProperty2.default)(this, "hasSentOutPatchDirectAccountDataPatch", void 0);
    (0, _defineProperty2.default)(this, "mDirectEvent", void 0);
    (0, _defineProperty2.default)(this, "onAccountData", ev => {
      if (ev.getType() == _event.EventType.Direct) {
        this.mDirectEvent = _objectSpread({}, ev.getContent()); // copy as we will mutate

        this.userToRooms = null;
        this.roomToUser = null;
      }
    });
    // see onAccountData
    this.hasSentOutPatchDirectAccountDataPatch = false;
    const mDirectEvent = matrixClient.getAccountData(_event.EventType.Direct)?.getContent() ?? {};
    this.mDirectEvent = _objectSpread({}, mDirectEvent); // copy as we will mutate
  }
  /**
   * Makes and returns a new shared instance that can then be accessed
   * with shared(). This returned instance is not automatically started.
   */


  static makeShared() {
    DMRoomMap.sharedInstance = new DMRoomMap(_MatrixClientPeg.MatrixClientPeg.get());
    return DMRoomMap.sharedInstance;
  }
  /**
   * Set the shared instance to the instance supplied
   * Used by tests
   * @param inst the new shared instance
   */


  static setShared(inst) {
    DMRoomMap.sharedInstance = inst;
  }
  /**
   * Returns a shared instance of the class
   * that uses the singleton matrix client
   * The shared instance must be started before use.
   */


  static shared() {
    return DMRoomMap.sharedInstance;
  }

  start() {
    this.populateRoomToUser();
    this.matrixClient.on(_client.ClientEvent.AccountData, this.onAccountData);
  }

  stop() {
    this.matrixClient.removeListener(_client.ClientEvent.AccountData, this.onAccountData);
  }

  /**
   * some client bug somewhere is causing some DMs to be marked
   * with ourself, not the other user. Fix it by guessing the other user and
   * modifying userToRooms
   */
  patchUpSelfDMs(userToRooms) {
    const myUserId = this.matrixClient.getUserId();
    const selfRoomIds = userToRooms[myUserId];

    if (selfRoomIds) {
      // any self-chats that should not be self-chats?
      const guessedUserIdsThatChanged = selfRoomIds.map(roomId => {
        const room = this.matrixClient.getRoom(roomId);

        if (room) {
          const userId = room.guessDMUserId();

          if (userId && userId !== myUserId) {
            return {
              userId,
              roomId
            };
          }
        }
      }).filter(ids => !!ids); //filter out
      // these are actually all legit self-chats
      // bail out

      if (!guessedUserIdsThatChanged.length) {
        return false;
      }

      userToRooms[myUserId] = selfRoomIds.filter(roomId => {
        return !guessedUserIdsThatChanged.some(ids => ids.roomId === roomId);
      });
      guessedUserIdsThatChanged.forEach(_ref => {
        let {
          userId,
          roomId
        } = _ref;
        const roomIds = userToRooms[userId];

        if (!roomIds) {
          userToRooms[userId] = [roomId];
        } else {
          roomIds.push(roomId);
          userToRooms[userId] = (0, _lodash.uniq)(roomIds);
        }
      });
      return true;
    }
  }

  getDMRoomsForUserId(userId) {
    // Here, we return the empty list if there are no rooms,
    // since the number of conversations you have with this user is zero.
    return this.getUserToRooms()[userId] || [];
  }
  /**
   * Gets the DM room which the given IDs share, if any.
   * @param {string[]} ids The identifiers (user IDs and email addresses) to look for.
   * @returns {Room} The DM room which all IDs given share, or falsy if no common room.
   */


  getDMRoomForIdentifiers(ids) {
    // TODO: [Canonical DMs] Handle lookups for email addresses.
    // For now we'll pretend we only get user IDs and end up returning nothing for email addresses
    let commonRooms = this.getDMRoomsForUserId(ids[0]);

    for (let i = 1; i < ids.length; i++) {
      const userRooms = this.getDMRoomsForUserId(ids[i]);
      commonRooms = commonRooms.filter(r => userRooms.includes(r));
    }

    const joinedRooms = commonRooms.map(r => _MatrixClientPeg.MatrixClientPeg.get().getRoom(r)).filter(r => r && r.getMyMembership() === 'join');
    return joinedRooms[0];
  }

  getUserIdForRoomId(roomId) {
    if (this.roomToUser == null) {
      // we lazily populate roomToUser so you can use
      // this class just to call getDMRoomsForUserId
      // which doesn't do very much, but is a fairly
      // convenient wrapper and there's no point
      // iterating through the map if getUserIdForRoomId()
      // is never called.
      this.populateRoomToUser();
    } // Here, we return undefined if the room is not in the map:
    // the room ID you gave is not a DM room for any user.


    if (this.roomToUser[roomId] === undefined) {
      // no entry? if the room is an invite, look for the is_direct hint.
      const room = this.matrixClient.getRoom(roomId);

      if (room) {
        return room.getDMInviter();
      }
    }

    return this.roomToUser[roomId];
  }

  getUniqueRoomsWithIndividuals() {
    if (!this.roomToUser) return {}; // No rooms means no map.

    return Object.keys(this.roomToUser).map(r => ({
      userId: this.getUserIdForRoomId(r),
      room: this.matrixClient.getRoom(r)
    })).filter(r => r.userId && r.room && r.room.getInvitedAndJoinedMemberCount() === 2).reduce((obj, r) => (obj[r.userId] = r.room) && obj, {});
  }

  getUserToRooms() {
    if (!this.userToRooms) {
      const userToRooms = this.mDirectEvent;
      const myUserId = this.matrixClient.getUserId();
      const selfDMs = userToRooms[myUserId];

      if (selfDMs?.length) {
        const neededPatching = this.patchUpSelfDMs(userToRooms); // to avoid multiple devices fighting to correct
        // the account data, only try to send the corrected
        // version once.

        _logger.logger.warn(`Invalid m.direct account data detected ` + `(self-chats that shouldn't be), patching it up.`);

        if (neededPatching && !this.hasSentOutPatchDirectAccountDataPatch) {
          this.hasSentOutPatchDirectAccountDataPatch = true;
          this.matrixClient.setAccountData(_event.EventType.Direct, userToRooms);
        }
      }

      this.userToRooms = userToRooms;
    }

    return this.userToRooms;
  }

  populateRoomToUser() {
    this.roomToUser = {};

    for (const user of Object.keys(this.getUserToRooms())) {
      for (const roomId of this.userToRooms[user]) {
        this.roomToUser[roomId] = user;
      }
    }
  }

}

exports.default = DMRoomMap;
(0, _defineProperty2.default)(DMRoomMap, "sharedInstance", void 0);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJETVJvb21NYXAiLCJjb25zdHJ1Y3RvciIsIm1hdHJpeENsaWVudCIsImV2IiwiZ2V0VHlwZSIsIkV2ZW50VHlwZSIsIkRpcmVjdCIsIm1EaXJlY3RFdmVudCIsImdldENvbnRlbnQiLCJ1c2VyVG9Sb29tcyIsInJvb21Ub1VzZXIiLCJoYXNTZW50T3V0UGF0Y2hEaXJlY3RBY2NvdW50RGF0YVBhdGNoIiwiZ2V0QWNjb3VudERhdGEiLCJtYWtlU2hhcmVkIiwic2hhcmVkSW5zdGFuY2UiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJzZXRTaGFyZWQiLCJpbnN0Iiwic2hhcmVkIiwic3RhcnQiLCJwb3B1bGF0ZVJvb21Ub1VzZXIiLCJvbiIsIkNsaWVudEV2ZW50IiwiQWNjb3VudERhdGEiLCJvbkFjY291bnREYXRhIiwic3RvcCIsInJlbW92ZUxpc3RlbmVyIiwicGF0Y2hVcFNlbGZETXMiLCJteVVzZXJJZCIsImdldFVzZXJJZCIsInNlbGZSb29tSWRzIiwiZ3Vlc3NlZFVzZXJJZHNUaGF0Q2hhbmdlZCIsIm1hcCIsInJvb21JZCIsInJvb20iLCJnZXRSb29tIiwidXNlcklkIiwiZ3Vlc3NETVVzZXJJZCIsImZpbHRlciIsImlkcyIsImxlbmd0aCIsInNvbWUiLCJmb3JFYWNoIiwicm9vbUlkcyIsInB1c2giLCJ1bmlxIiwiZ2V0RE1Sb29tc0ZvclVzZXJJZCIsImdldFVzZXJUb1Jvb21zIiwiZ2V0RE1Sb29tRm9ySWRlbnRpZmllcnMiLCJjb21tb25Sb29tcyIsImkiLCJ1c2VyUm9vbXMiLCJyIiwiaW5jbHVkZXMiLCJqb2luZWRSb29tcyIsImdldE15TWVtYmVyc2hpcCIsImdldFVzZXJJZEZvclJvb21JZCIsInVuZGVmaW5lZCIsImdldERNSW52aXRlciIsImdldFVuaXF1ZVJvb21zV2l0aEluZGl2aWR1YWxzIiwiT2JqZWN0Iiwia2V5cyIsImdldEludml0ZWRBbmRKb2luZWRNZW1iZXJDb3VudCIsInJlZHVjZSIsIm9iaiIsInNlbGZETXMiLCJuZWVkZWRQYXRjaGluZyIsImxvZ2dlciIsIndhcm4iLCJzZXRBY2NvdW50RGF0YSIsInVzZXIiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvRE1Sb29tTWFwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiwgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IHVuaXEgfSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBDbGllbnRFdmVudCwgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBPcHRpb25hbCB9IGZyb20gXCJtYXRyaXgtZXZlbnRzLXNka1wiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgdGFrZXMgYSBNYXRyaXggQ2xpZW50IGFuZCBmbGlwcyB0aGUgbS5kaXJlY3QgbWFwXG4gKiBzbyB0aGUgb3BlcmF0aW9uIG9mIG1hcHBpbmcgYSByb29tIElEIHRvIHdoaWNoIHVzZXIgaXQncyBhIERNXG4gKiB3aXRoIGNhbiBiZSBwZXJmb3JtZWQgZWZmaWNpZW50bHkuXG4gKlxuICogV2l0aCAnc3RhcnQnLCB0aGlzIGNhbiBhbHNvIGtlZXAgaXRzZWxmIHVwIHRvIGRhdGUgb3ZlciB0aW1lLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBETVJvb21NYXAge1xuICAgIHByaXZhdGUgc3RhdGljIHNoYXJlZEluc3RhbmNlOiBETVJvb21NYXA7XG5cbiAgICAvLyBUT0RPOiBjb252ZXJ0IHRoZXNlIHRvIG1hcHNcbiAgICBwcml2YXRlIHJvb21Ub1VzZXI6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0gbnVsbDtcbiAgICBwcml2YXRlIHVzZXJUb1Jvb21zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nW119ID0gbnVsbDtcbiAgICBwcml2YXRlIGhhc1NlbnRPdXRQYXRjaERpcmVjdEFjY291bnREYXRhUGF0Y2g6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBtRGlyZWN0RXZlbnQ6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50KSB7XG4gICAgICAgIC8vIHNlZSBvbkFjY291bnREYXRhXG4gICAgICAgIHRoaXMuaGFzU2VudE91dFBhdGNoRGlyZWN0QWNjb3VudERhdGFQYXRjaCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IG1EaXJlY3RFdmVudCA9IG1hdHJpeENsaWVudC5nZXRBY2NvdW50RGF0YShFdmVudFR5cGUuRGlyZWN0KT8uZ2V0Q29udGVudCgpID8/IHt9O1xuICAgICAgICB0aGlzLm1EaXJlY3RFdmVudCA9IHsgLi4ubURpcmVjdEV2ZW50IH07IC8vIGNvcHkgYXMgd2Ugd2lsbCBtdXRhdGVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhbmQgcmV0dXJucyBhIG5ldyBzaGFyZWQgaW5zdGFuY2UgdGhhdCBjYW4gdGhlbiBiZSBhY2Nlc3NlZFxuICAgICAqIHdpdGggc2hhcmVkKCkuIFRoaXMgcmV0dXJuZWQgaW5zdGFuY2UgaXMgbm90IGF1dG9tYXRpY2FsbHkgc3RhcnRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1ha2VTaGFyZWQoKTogRE1Sb29tTWFwIHtcbiAgICAgICAgRE1Sb29tTWFwLnNoYXJlZEluc3RhbmNlID0gbmV3IERNUm9vbU1hcChNYXRyaXhDbGllbnRQZWcuZ2V0KCkpO1xuICAgICAgICByZXR1cm4gRE1Sb29tTWFwLnNoYXJlZEluc3RhbmNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgc2hhcmVkIGluc3RhbmNlIHRvIHRoZSBpbnN0YW5jZSBzdXBwbGllZFxuICAgICAqIFVzZWQgYnkgdGVzdHNcbiAgICAgKiBAcGFyYW0gaW5zdCB0aGUgbmV3IHNoYXJlZCBpbnN0YW5jZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc2V0U2hhcmVkKGluc3Q6IERNUm9vbU1hcCkge1xuICAgICAgICBETVJvb21NYXAuc2hhcmVkSW5zdGFuY2UgPSBpbnN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzaGFyZWQgaW5zdGFuY2Ugb2YgdGhlIGNsYXNzXG4gICAgICogdGhhdCB1c2VzIHRoZSBzaW5nbGV0b24gbWF0cml4IGNsaWVudFxuICAgICAqIFRoZSBzaGFyZWQgaW5zdGFuY2UgbXVzdCBiZSBzdGFydGVkIGJlZm9yZSB1c2UuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzaGFyZWQoKTogRE1Sb29tTWFwIHtcbiAgICAgICAgcmV0dXJuIERNUm9vbU1hcC5zaGFyZWRJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMucG9wdWxhdGVSb29tVG9Vc2VyKCk7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50Lm9uKENsaWVudEV2ZW50LkFjY291bnREYXRhLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKCkge1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihDbGllbnRFdmVudC5BY2NvdW50RGF0YSwgdGhpcy5vbkFjY291bnREYXRhKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWNjb3VudERhdGEgPSAoZXY6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT0gRXZlbnRUeXBlLkRpcmVjdCkge1xuICAgICAgICAgICAgdGhpcy5tRGlyZWN0RXZlbnQgPSB7IC4uLmV2LmdldENvbnRlbnQoKSB9OyAvLyBjb3B5IGFzIHdlIHdpbGwgbXV0YXRlXG4gICAgICAgICAgICB0aGlzLnVzZXJUb1Jvb21zID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucm9vbVRvVXNlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogc29tZSBjbGllbnQgYnVnIHNvbWV3aGVyZSBpcyBjYXVzaW5nIHNvbWUgRE1zIHRvIGJlIG1hcmtlZFxuICAgICAqIHdpdGggb3Vyc2VsZiwgbm90IHRoZSBvdGhlciB1c2VyLiBGaXggaXQgYnkgZ3Vlc3NpbmcgdGhlIG90aGVyIHVzZXIgYW5kXG4gICAgICogbW9kaWZ5aW5nIHVzZXJUb1Jvb21zXG4gICAgICovXG4gICAgcHJpdmF0ZSBwYXRjaFVwU2VsZkRNcyh1c2VyVG9Sb29tczogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+KSB7XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgICAgIGNvbnN0IHNlbGZSb29tSWRzID0gdXNlclRvUm9vbXNbbXlVc2VySWRdO1xuICAgICAgICBpZiAoc2VsZlJvb21JZHMpIHtcbiAgICAgICAgICAgIC8vIGFueSBzZWxmLWNoYXRzIHRoYXQgc2hvdWxkIG5vdCBiZSBzZWxmLWNoYXRzP1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3NlZFVzZXJJZHNUaGF0Q2hhbmdlZCA9IHNlbGZSb29tSWRzLm1hcCgocm9vbUlkKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSByb29tLmd1ZXNzRE1Vc2VySWQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXJJZCAmJiB1c2VySWQgIT09IG15VXNlcklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB1c2VySWQsIHJvb21JZCB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuZmlsdGVyKChpZHMpID0+ICEhaWRzKTsgLy9maWx0ZXIgb3V0XG4gICAgICAgICAgICAvLyB0aGVzZSBhcmUgYWN0dWFsbHkgYWxsIGxlZ2l0IHNlbGYtY2hhdHNcbiAgICAgICAgICAgIC8vIGJhaWwgb3V0XG4gICAgICAgICAgICBpZiAoIWd1ZXNzZWRVc2VySWRzVGhhdENoYW5nZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlclRvUm9vbXNbbXlVc2VySWRdID0gc2VsZlJvb21JZHMuZmlsdGVyKChyb29tSWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIWd1ZXNzZWRVc2VySWRzVGhhdENoYW5nZWRcbiAgICAgICAgICAgICAgICAgICAgLnNvbWUoKGlkcykgPT4gaWRzLnJvb21JZCA9PT0gcm9vbUlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ3Vlc3NlZFVzZXJJZHNUaGF0Q2hhbmdlZC5mb3JFYWNoKCh7IHVzZXJJZCwgcm9vbUlkIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tSWRzID0gdXNlclRvUm9vbXNbdXNlcklkXTtcbiAgICAgICAgICAgICAgICBpZiAoIXJvb21JZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlclRvUm9vbXNbdXNlcklkXSA9IFtyb29tSWRdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZHMucHVzaChyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICB1c2VyVG9Sb29tc1t1c2VySWRdID0gdW5pcShyb29tSWRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldERNUm9vbXNGb3JVc2VySWQodXNlcklkOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgIC8vIEhlcmUsIHdlIHJldHVybiB0aGUgZW1wdHkgbGlzdCBpZiB0aGVyZSBhcmUgbm8gcm9vbXMsXG4gICAgICAgIC8vIHNpbmNlIHRoZSBudW1iZXIgb2YgY29udmVyc2F0aW9ucyB5b3UgaGF2ZSB3aXRoIHRoaXMgdXNlciBpcyB6ZXJvLlxuICAgICAgICByZXR1cm4gdGhpcy5nZXRVc2VyVG9Sb29tcygpW3VzZXJJZF0gfHwgW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgRE0gcm9vbSB3aGljaCB0aGUgZ2l2ZW4gSURzIHNoYXJlLCBpZiBhbnkuXG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gaWRzIFRoZSBpZGVudGlmaWVycyAodXNlciBJRHMgYW5kIGVtYWlsIGFkZHJlc3NlcykgdG8gbG9vayBmb3IuXG4gICAgICogQHJldHVybnMge1Jvb219IFRoZSBETSByb29tIHdoaWNoIGFsbCBJRHMgZ2l2ZW4gc2hhcmUsIG9yIGZhbHN5IGlmIG5vIGNvbW1vbiByb29tLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRETVJvb21Gb3JJZGVudGlmaWVycyhpZHM6IHN0cmluZ1tdKTogUm9vbSB7XG4gICAgICAgIC8vIFRPRE86IFtDYW5vbmljYWwgRE1zXSBIYW5kbGUgbG9va3VwcyBmb3IgZW1haWwgYWRkcmVzc2VzLlxuICAgICAgICAvLyBGb3Igbm93IHdlJ2xsIHByZXRlbmQgd2Ugb25seSBnZXQgdXNlciBJRHMgYW5kIGVuZCB1cCByZXR1cm5pbmcgbm90aGluZyBmb3IgZW1haWwgYWRkcmVzc2VzXG5cbiAgICAgICAgbGV0IGNvbW1vblJvb21zID0gdGhpcy5nZXRETVJvb21zRm9yVXNlcklkKGlkc1swXSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VyUm9vbXMgPSB0aGlzLmdldERNUm9vbXNGb3JVc2VySWQoaWRzW2ldKTtcbiAgICAgICAgICAgIGNvbW1vblJvb21zID0gY29tbW9uUm9vbXMuZmlsdGVyKHIgPT4gdXNlclJvb21zLmluY2x1ZGVzKHIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGpvaW5lZFJvb21zID0gY29tbW9uUm9vbXMubWFwKHIgPT4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocikpXG4gICAgICAgICAgICAuZmlsdGVyKHIgPT4gciAmJiByLmdldE15TWVtYmVyc2hpcCgpID09PSAnam9pbicpO1xuXG4gICAgICAgIHJldHVybiBqb2luZWRSb29tc1swXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VXNlcklkRm9yUm9vbUlkKHJvb21JZDogc3RyaW5nKTogT3B0aW9uYWw8c3RyaW5nPiB7XG4gICAgICAgIGlmICh0aGlzLnJvb21Ub1VzZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gd2UgbGF6aWx5IHBvcHVsYXRlIHJvb21Ub1VzZXIgc28geW91IGNhbiB1c2VcbiAgICAgICAgICAgIC8vIHRoaXMgY2xhc3MganVzdCB0byBjYWxsIGdldERNUm9vbXNGb3JVc2VySWRcbiAgICAgICAgICAgIC8vIHdoaWNoIGRvZXNuJ3QgZG8gdmVyeSBtdWNoLCBidXQgaXMgYSBmYWlybHlcbiAgICAgICAgICAgIC8vIGNvbnZlbmllbnQgd3JhcHBlciBhbmQgdGhlcmUncyBubyBwb2ludFxuICAgICAgICAgICAgLy8gaXRlcmF0aW5nIHRocm91Z2ggdGhlIG1hcCBpZiBnZXRVc2VySWRGb3JSb29tSWQoKVxuICAgICAgICAgICAgLy8gaXMgbmV2ZXIgY2FsbGVkLlxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZVJvb21Ub1VzZXIoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIZXJlLCB3ZSByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZSByb29tIGlzIG5vdCBpbiB0aGUgbWFwOlxuICAgICAgICAvLyB0aGUgcm9vbSBJRCB5b3UgZ2F2ZSBpcyBub3QgYSBETSByb29tIGZvciBhbnkgdXNlci5cbiAgICAgICAgaWYgKHRoaXMucm9vbVRvVXNlcltyb29tSWRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIG5vIGVudHJ5PyBpZiB0aGUgcm9vbSBpcyBhbiBpbnZpdGUsIGxvb2sgZm9yIHRoZSBpc19kaXJlY3QgaGludC5cbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByb29tLmdldERNSW52aXRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnJvb21Ub1VzZXJbcm9vbUlkXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VW5pcXVlUm9vbXNXaXRoSW5kaXZpZHVhbHMoKToge1t1c2VySWQ6IHN0cmluZ106IFJvb219IHtcbiAgICAgICAgaWYgKCF0aGlzLnJvb21Ub1VzZXIpIHJldHVybiB7fTsgLy8gTm8gcm9vbXMgbWVhbnMgbm8gbWFwLlxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5yb29tVG9Vc2VyKVxuICAgICAgICAgICAgLm1hcChyID0+ICh7IHVzZXJJZDogdGhpcy5nZXRVc2VySWRGb3JSb29tSWQociksIHJvb206IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocikgfSkpXG4gICAgICAgICAgICAuZmlsdGVyKHIgPT4gci51c2VySWQgJiYgci5yb29tICYmIHIucm9vbS5nZXRJbnZpdGVkQW5kSm9pbmVkTWVtYmVyQ291bnQoKSA9PT0gMilcbiAgICAgICAgICAgIC5yZWR1Y2UoKG9iaiwgcikgPT4gKG9ialtyLnVzZXJJZF0gPSByLnJvb20pICYmIG9iaiwge30pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VXNlclRvUm9vbXMoKToge1trZXk6IHN0cmluZ106IHN0cmluZ1tdfSB7XG4gICAgICAgIGlmICghdGhpcy51c2VyVG9Sb29tcykge1xuICAgICAgICAgICAgY29uc3QgdXNlclRvUm9vbXMgPSB0aGlzLm1EaXJlY3RFdmVudDtcbiAgICAgICAgICAgIGNvbnN0IG15VXNlcklkID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICBjb25zdCBzZWxmRE1zID0gdXNlclRvUm9vbXNbbXlVc2VySWRdO1xuICAgICAgICAgICAgaWYgKHNlbGZETXM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5lZWRlZFBhdGNoaW5nID0gdGhpcy5wYXRjaFVwU2VsZkRNcyh1c2VyVG9Sb29tcyk7XG4gICAgICAgICAgICAgICAgLy8gdG8gYXZvaWQgbXVsdGlwbGUgZGV2aWNlcyBmaWdodGluZyB0byBjb3JyZWN0XG4gICAgICAgICAgICAgICAgLy8gdGhlIGFjY291bnQgZGF0YSwgb25seSB0cnkgdG8gc2VuZCB0aGUgY29ycmVjdGVkXG4gICAgICAgICAgICAgICAgLy8gdmVyc2lvbiBvbmNlLlxuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGBJbnZhbGlkIG0uZGlyZWN0IGFjY291bnQgZGF0YSBkZXRlY3RlZCBgICtcbiAgICAgICAgICAgICAgICAgICAgYChzZWxmLWNoYXRzIHRoYXQgc2hvdWxkbid0IGJlKSwgcGF0Y2hpbmcgaXQgdXAuYCk7XG4gICAgICAgICAgICAgICAgaWYgKG5lZWRlZFBhdGNoaW5nICYmICF0aGlzLmhhc1NlbnRPdXRQYXRjaERpcmVjdEFjY291bnREYXRhUGF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNTZW50T3V0UGF0Y2hEaXJlY3RBY2NvdW50RGF0YVBhdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQuc2V0QWNjb3VudERhdGEoRXZlbnRUeXBlLkRpcmVjdCwgdXNlclRvUm9vbXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXNlclRvUm9vbXMgPSB1c2VyVG9Sb29tcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy51c2VyVG9Sb29tcztcbiAgICB9XG5cbiAgICBwcml2YXRlIHBvcHVsYXRlUm9vbVRvVXNlcigpIHtcbiAgICAgICAgdGhpcy5yb29tVG9Vc2VyID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdXNlciBvZiBPYmplY3Qua2V5cyh0aGlzLmdldFVzZXJUb1Jvb21zKCkpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJvb21JZCBvZiB0aGlzLnVzZXJUb1Jvb21zW3VzZXJdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tVG9Vc2VyW3Jvb21JZF0gPSB1c2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFJQTs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxTQUFOLENBQWdCO0VBRzNCO0VBTUFDLFdBQVcsQ0FBa0JDLFlBQWxCLEVBQThDO0lBQUEsS0FBNUJBLFlBQTRCLEdBQTVCQSxZQUE0QjtJQUFBLGtEQUxYLElBS1c7SUFBQSxtREFKUixJQUlRO0lBQUE7SUFBQTtJQUFBLHFEQTRDaENDLEVBQUQsSUFBcUI7TUFDekMsSUFBSUEsRUFBRSxDQUFDQyxPQUFILE1BQWdCQyxnQkFBQSxDQUFVQyxNQUE5QixFQUFzQztRQUNsQyxLQUFLQyxZQUFMLHFCQUF5QkosRUFBRSxDQUFDSyxVQUFILEVBQXpCLEVBRGtDLENBQ1U7O1FBQzVDLEtBQUtDLFdBQUwsR0FBbUIsSUFBbkI7UUFDQSxLQUFLQyxVQUFMLEdBQWtCLElBQWxCO01BQ0g7SUFDSixDQWxEd0Q7SUFDckQ7SUFDQSxLQUFLQyxxQ0FBTCxHQUE2QyxLQUE3QztJQUVBLE1BQU1KLFlBQVksR0FBR0wsWUFBWSxDQUFDVSxjQUFiLENBQTRCUCxnQkFBQSxDQUFVQyxNQUF0QyxHQUErQ0UsVUFBL0MsTUFBK0QsRUFBcEY7SUFDQSxLQUFLRCxZQUFMLHFCQUF5QkEsWUFBekIsRUFMcUQsQ0FLWjtFQUM1QztFQUVEO0FBQ0o7QUFDQTtBQUNBOzs7RUFDNEIsT0FBVk0sVUFBVSxHQUFjO0lBQ2xDYixTQUFTLENBQUNjLGNBQVYsR0FBMkIsSUFBSWQsU0FBSixDQUFjZSxnQ0FBQSxDQUFnQkMsR0FB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