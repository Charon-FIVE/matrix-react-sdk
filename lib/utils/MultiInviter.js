"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.InviteState = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _httpApi = require("matrix-js-sdk/src/http-api");

var _utils = require("matrix-js-sdk/src/utils");

var _logger = require("matrix-js-sdk/src/logger");

var _event = require("matrix-js-sdk/src/@types/event");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _UserAddress = require("../UserAddress");

var _languageHandler = require("../languageHandler");

var _Modal = _interopRequireDefault(require("../Modal"));

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _AskInviteAnywayDialog = _interopRequireDefault(require("../components/views/dialogs/AskInviteAnywayDialog"));

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
let InviteState;
exports.InviteState = InviteState;

(function (InviteState) {
  InviteState["Invited"] = "invited";
  InviteState["Error"] = "error";
})(InviteState || (exports.InviteState = InviteState = {}));

const UNKNOWN_PROFILE_ERRORS = ['M_NOT_FOUND', 'M_USER_NOT_FOUND', 'M_PROFILE_UNDISCLOSED', 'M_PROFILE_NOT_FOUND'];
const USER_ALREADY_JOINED = "IO.ELEMENT.ALREADY_JOINED";
const USER_ALREADY_INVITED = "IO.ELEMENT.ALREADY_INVITED";
/**
 * Invites multiple addresses to a room, handling rate limiting from the server
 */

class MultiInviter {
  // State of each address (invited or error)
  // { address: {errorText, errcode} }

  /**
   * @param {string} roomId The ID of the room to invite to
   * @param {function} progressCallback optional callback, fired after each invite.
   */
  constructor(roomId, progressCallback) {
    this.roomId = roomId;
    this.progressCallback = progressCallback;
    (0, _defineProperty2.default)(this, "matrixClient", void 0);
    (0, _defineProperty2.default)(this, "canceled", false);
    (0, _defineProperty2.default)(this, "addresses", []);
    (0, _defineProperty2.default)(this, "busy", false);
    (0, _defineProperty2.default)(this, "_fatal", false);
    (0, _defineProperty2.default)(this, "completionStates", {});
    (0, _defineProperty2.default)(this, "errors", {});
    (0, _defineProperty2.default)(this, "deferred", null);
    (0, _defineProperty2.default)(this, "reason", null);
    this.matrixClient = _MatrixClientPeg.MatrixClientPeg.get();
  }

  get fatal() {
    return this._fatal;
  }
  /**
   * Invite users to this room. This may only be called once per
   * instance of the class.
   *
   * @param {array} addresses Array of addresses to invite
   * @param {string} reason Reason for inviting (optional)
   * @param {boolean} sendSharedHistoryKeys whether to share e2ee keys with the invitees if applicable.
   * @returns {Promise} Resolved when all invitations in the queue are complete
   */


  invite(addresses, reason) {
    let sendSharedHistoryKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (this.addresses.length > 0) {
      throw new Error("Already inviting/invited");
    }

    this.addresses.push(...addresses);
    this.reason = reason;

    for (const addr of this.addresses) {
      if ((0, _UserAddress.getAddressType)(addr) === null) {
        this.completionStates[addr] = InviteState.Error;
        this.errors[addr] = {
          errcode: 'M_INVALID',
          errorText: (0, _languageHandler._t)('Unrecognised address')
        };
      }
    }

    this.deferred = (0, _utils.defer)();
    this.inviteMore(0);

    if (!sendSharedHistoryKeys || !this.roomId || !this.matrixClient.isRoomEncrypted(this.roomId)) {
      return this.deferred.promise;
    }

    const room = this.matrixClient.getRoom(this.roomId);
    const visibilityEvent = room?.currentState.getStateEvents(_event.EventType.RoomHistoryVisibility, "");
    const visibility = visibilityEvent?.getContent().history_visibility;

    if (visibility !== _partials.HistoryVisibility.WorldReadable && visibility !== _partials.HistoryVisibility.Shared) {
      return this.deferred.promise;
    }

    return this.deferred.promise.then(async states => {
      const invitedUsers = [];

      for (const [addr, state] of Object.entries(states)) {
        if (state === InviteState.Invited && (0, _UserAddress.getAddressType)(addr) === _UserAddress.AddressType.MatrixUserId) {
          invitedUsers.push(addr);
        }
      }

      _logger.logger.log("Sharing history with", invitedUsers);

      this.matrixClient.sendSharedHistoryKeys(this.roomId, invitedUsers); // do this in the background

      return states;
    });
  }
  /**
   * Stops inviting. Causes promises returned by invite() to be rejected.
   */


  cancel() {
    if (!this.busy) return;
    this.canceled = true;
    this.deferred.reject(new Error('canceled'));
  }

  getCompletionState(addr) {
    return this.completionStates[addr];
  }

  getErrorText(addr) {
    return this.errors[addr] ? this.errors[addr].errorText : null;
  }

  async inviteToRoom(roomId, addr) {
    let ignoreProfile = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const addrType = (0, _UserAddress.getAddressType)(addr);

    if (addrType === _UserAddress.AddressType.Email) {
      return this.matrixClient.inviteByEmail(roomId, addr);
    } else if (addrType === _UserAddress.AddressType.MatrixUserId) {
      const room = this.matrixClient.getRoom(roomId);
      if (!room) throw new Error("Room not found");
      const member = room.getMember(addr);

      if (member?.membership === "join") {
        throw new _httpApi.MatrixError({
          errcode: USER_ALREADY_JOINED,
          error: "Member already joined"
        });
      } else if (member?.membership === "invite") {
        throw new _httpApi.MatrixError({
          errcode: USER_ALREADY_INVITED,
          error: "Member already invited"
        });
      }

      if (!ignoreProfile && _SettingsStore.default.getValue("promptBeforeInviteUnknownUsers", this.roomId)) {
        try {
          await this.matrixClient.getProfileInfo(addr);
        } catch (err) {
          // The error handling during the invitation process covers any API.
          // Some errors must to me mapped from profile API errors to more specific ones to avoid collisions.
          switch (err.errcode) {
            case 'M_FORBIDDEN':
              throw new _httpApi.MatrixError({
                errcode: 'M_PROFILE_UNDISCLOSED'
              });

            case 'M_NOT_FOUND':
              throw new _httpApi.MatrixError({
                errcode: 'M_USER_NOT_FOUND'
              });

            default:
              throw err;
          }
        }
      }

      return this.matrixClient.invite(roomId, addr, undefined, this.reason);
    } else {
      throw new Error('Unsupported address');
    }
  }

  doInvite(address) {
    let ignoreProfile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return new Promise((resolve, reject) => {
      _logger.logger.log(`Inviting ${address}`);

      const doInvite = this.inviteToRoom(this.roomId, address, ignoreProfile);
      doInvite.then(() => {
        if (this.canceled) {
          return;
        }

        this.completionStates[address] = InviteState.Invited;
        delete this.errors[address];
        resolve();
        this.progressCallback?.();
      }).catch(err => {
        if (this.canceled) {
          return;
        }

        _logger.logger.error(err);

        const isSpace = this.roomId && this.matrixClient.getRoom(this.roomId)?.isSpaceRoom();
        let errorText;
        let fatal = false;

        switch (err.errcode) {
          case "M_FORBIDDEN":
            if (isSpace) {
              errorText = (0, _languageHandler._t)('You do not have permission to invite people to this space.');
            } else {
              errorText = (0, _languageHandler._t)('You do not have permission to invite people to this room.');
            }

            fatal = true;
            break;

          case USER_ALREADY_INVITED:
            if (isSpace) {
              errorText = (0, _languageHandler._t)("User is already invited to the space");
            } else {
              errorText = (0, _languageHandler._t)("User is already invited to the room");
            }

            break;

          case USER_ALREADY_JOINED:
            if (isSpace) {
              errorText = (0, _languageHandler._t)("User is already in the space");
            } else {
              errorText = (0, _languageHandler._t)("User is already in the room");
            }

            break;

          case "M_LIMIT_EXCEEDED":
            // we're being throttled so wait a bit & try again
            setTimeout(() => {
              this.doInvite(address, ignoreProfile).then(resolve, reject);
            }, 5000);
            return;

          case "M_NOT_FOUND":
          case "M_USER_NOT_FOUND":
            errorText = (0, _languageHandler._t)("User does not exist");
            break;

          case "M_PROFILE_UNDISCLOSED":
            errorText = (0, _languageHandler._t)("User may or may not exist");
            break;

          case "M_PROFILE_NOT_FOUND":
            if (!ignoreProfile) {
              // Invite without the profile check
              _logger.logger.warn(`User ${address} does not have a profile - inviting anyways automatically`);

              this.doInvite(address, true).then(resolve, reject);
              return;
            }

            break;

          case "M_BAD_STATE":
            errorText = (0, _languageHandler._t)("The user must be unbanned before they can be invited.");
            break;

          case "M_UNSUPPORTED_ROOM_VERSION":
            if (isSpace) {
              errorText = (0, _languageHandler._t)("The user's homeserver does not support the version of the space.");
            } else {
              errorText = (0, _languageHandler._t)("The user's homeserver does not support the version of the room.");
            }

            break;
        }

        if (!errorText) {
          errorText = (0, _languageHandler._t)('Unknown server error');
        }

        this.completionStates[address] = InviteState.Error;
        this.errors[address] = {
          errorText,
          errcode: err.errcode
        };
        this.busy = !fatal;
        this._fatal = fatal;

        if (fatal) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  inviteMore(nextIndex) {
    let ignoreProfile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (this.canceled) {
      return;
    }

    if (nextIndex === this.addresses.length) {
      this.busy = false;

      if (Object.keys(this.errors).length > 0) {
        // There were problems inviting some people - see if we can invite them
        // without caring if they exist or not.
        const unknownProfileUsers = Object.keys(this.errors).filter(a => UNKNOWN_PROFILE_ERRORS.includes(this.errors[a].errcode));

        if (unknownProfileUsers.length > 0) {
          const inviteUnknowns = () => {
            const promises = unknownProfileUsers.map(u => this.doInvite(u, true));
            Promise.all(promises).then(() => this.deferred.resolve(this.completionStates));
          };

          if (!_SettingsStore.default.getValue("promptBeforeInviteUnknownUsers", this.roomId)) {
            inviteUnknowns();
            return;
          }

          _logger.logger.log("Showing failed to invite dialog...");

          _Modal.default.createDialog(_AskInviteAnywayDialog.default, {
            unknownProfileUsers: unknownProfileUsers.map(u => ({
              userId: u,
              errorText: this.errors[u].errorText
            })),
            onInviteAnyways: () => inviteUnknowns(),
            onGiveUp: () => {
              // Fake all the completion states because we already warned the user
              for (const addr of unknownProfileUsers) {
                this.completionStates[addr] = InviteState.Invited;
              }

              this.deferred.resolve(this.completionStates);
            }
          });

          return;
        }
      }

      this.deferred.resolve(this.completionStates);
      return;
    }

    const addr = this.addresses[nextIndex]; // don't try to invite it if it's an invalid address
    // (it will already be marked as an error though,
    // so no need to do so again)

    if ((0, _UserAddress.getAddressType)(addr) === null) {
      this.inviteMore(nextIndex + 1);
      return;
    } // don't re-invite (there's no way in the UI to do this, but
    // for sanity's sake)


    if (this.completionStates[addr] === InviteState.Invited) {
      this.inviteMore(nextIndex + 1);
      return;
    }

    this.doInvite(addr, ignoreProfile).then(() => {
      this.inviteMore(nextIndex + 1, ignoreProfile);
    }).catch(() => this.deferred.resolve(this.completionStates));
  }

}

exports.default = MultiInviter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnZpdGVTdGF0ZSIsIlVOS05PV05fUFJPRklMRV9FUlJPUlMiLCJVU0VSX0FMUkVBRFlfSk9JTkVEIiwiVVNFUl9BTFJFQURZX0lOVklURUQiLCJNdWx0aUludml0ZXIiLCJjb25zdHJ1Y3RvciIsInJvb21JZCIsInByb2dyZXNzQ2FsbGJhY2siLCJtYXRyaXhDbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJmYXRhbCIsIl9mYXRhbCIsImludml0ZSIsImFkZHJlc3NlcyIsInJlYXNvbiIsInNlbmRTaGFyZWRIaXN0b3J5S2V5cyIsImxlbmd0aCIsIkVycm9yIiwicHVzaCIsImFkZHIiLCJnZXRBZGRyZXNzVHlwZSIsImNvbXBsZXRpb25TdGF0ZXMiLCJlcnJvcnMiLCJlcnJjb2RlIiwiZXJyb3JUZXh0IiwiX3QiLCJkZWZlcnJlZCIsImRlZmVyIiwiaW52aXRlTW9yZSIsImlzUm9vbUVuY3J5cHRlZCIsInByb21pc2UiLCJyb29tIiwiZ2V0Um9vbSIsInZpc2liaWxpdHlFdmVudCIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiRXZlbnRUeXBlIiwiUm9vbUhpc3RvcnlWaXNpYmlsaXR5IiwidmlzaWJpbGl0eSIsImdldENvbnRlbnQiLCJoaXN0b3J5X3Zpc2liaWxpdHkiLCJIaXN0b3J5VmlzaWJpbGl0eSIsIldvcmxkUmVhZGFibGUiLCJTaGFyZWQiLCJ0aGVuIiwic3RhdGVzIiwiaW52aXRlZFVzZXJzIiwic3RhdGUiLCJPYmplY3QiLCJlbnRyaWVzIiwiSW52aXRlZCIsIkFkZHJlc3NUeXBlIiwiTWF0cml4VXNlcklkIiwibG9nZ2VyIiwibG9nIiwiY2FuY2VsIiwiYnVzeSIsImNhbmNlbGVkIiwicmVqZWN0IiwiZ2V0Q29tcGxldGlvblN0YXRlIiwiZ2V0RXJyb3JUZXh0IiwiaW52aXRlVG9Sb29tIiwiaWdub3JlUHJvZmlsZSIsImFkZHJUeXBlIiwiRW1haWwiLCJpbnZpdGVCeUVtYWlsIiwibWVtYmVyIiwiZ2V0TWVtYmVyIiwibWVtYmVyc2hpcCIsIk1hdHJpeEVycm9yIiwiZXJyb3IiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJnZXRQcm9maWxlSW5mbyIsImVyciIsInVuZGVmaW5lZCIsImRvSW52aXRlIiwiYWRkcmVzcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiY2F0Y2giLCJpc1NwYWNlIiwiaXNTcGFjZVJvb20iLCJzZXRUaW1lb3V0Iiwid2FybiIsIm5leHRJbmRleCIsImtleXMiLCJ1bmtub3duUHJvZmlsZVVzZXJzIiwiZmlsdGVyIiwiYSIsImluY2x1ZGVzIiwiaW52aXRlVW5rbm93bnMiLCJwcm9taXNlcyIsIm1hcCIsInUiLCJhbGwiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkFza0ludml0ZUFueXdheURpYWxvZyIsInVzZXJJZCIsIm9uSW52aXRlQW55d2F5cyIsIm9uR2l2ZVVwIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL011bHRpSW52aXRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4RXJyb3IgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvaHR0cC1hcGlcIjtcbmltcG9ydCB7IGRlZmVyLCBJRGVmZXJyZWQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvdXRpbHNcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IEhpc3RvcnlWaXNpYmlsaXR5IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFsc1wiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgQWRkcmVzc1R5cGUsIGdldEFkZHJlc3NUeXBlIH0gZnJvbSAnLi4vVXNlckFkZHJlc3MnO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uL01vZGFsXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEFza0ludml0ZUFueXdheURpYWxvZyBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Fza0ludml0ZUFueXdheURpYWxvZ1wiO1xuXG5leHBvcnQgZW51bSBJbnZpdGVTdGF0ZSB7XG4gICAgSW52aXRlZCA9IFwiaW52aXRlZFwiLFxuICAgIEVycm9yID0gXCJlcnJvclwiLFxufVxuXG5pbnRlcmZhY2UgSUVycm9yIHtcbiAgICBlcnJvclRleHQ6IHN0cmluZztcbiAgICBlcnJjb2RlOiBzdHJpbmc7XG59XG5cbmNvbnN0IFVOS05PV05fUFJPRklMRV9FUlJPUlMgPSBbJ01fTk9UX0ZPVU5EJywgJ01fVVNFUl9OT1RfRk9VTkQnLCAnTV9QUk9GSUxFX1VORElTQ0xPU0VEJywgJ01fUFJPRklMRV9OT1RfRk9VTkQnXTtcblxuZXhwb3J0IHR5cGUgQ29tcGxldGlvblN0YXRlcyA9IFJlY29yZDxzdHJpbmcsIEludml0ZVN0YXRlPjtcblxuY29uc3QgVVNFUl9BTFJFQURZX0pPSU5FRCA9IFwiSU8uRUxFTUVOVC5BTFJFQURZX0pPSU5FRFwiO1xuY29uc3QgVVNFUl9BTFJFQURZX0lOVklURUQgPSBcIklPLkVMRU1FTlQuQUxSRUFEWV9JTlZJVEVEXCI7XG5cbi8qKlxuICogSW52aXRlcyBtdWx0aXBsZSBhZGRyZXNzZXMgdG8gYSByb29tLCBoYW5kbGluZyByYXRlIGxpbWl0aW5nIGZyb20gdGhlIHNlcnZlclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNdWx0aUludml0ZXIge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG5cbiAgICBwcml2YXRlIGNhbmNlbGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBhZGRyZXNzZXM6IHN0cmluZ1tdID0gW107XG4gICAgcHJpdmF0ZSBidXN5ID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZmF0YWwgPSBmYWxzZTtcbiAgICBwcml2YXRlIGNvbXBsZXRpb25TdGF0ZXM6IENvbXBsZXRpb25TdGF0ZXMgPSB7fTsgLy8gU3RhdGUgb2YgZWFjaCBhZGRyZXNzIChpbnZpdGVkIG9yIGVycm9yKVxuICAgIHByaXZhdGUgZXJyb3JzOiBSZWNvcmQ8c3RyaW5nLCBJRXJyb3I+ID0ge307IC8vIHsgYWRkcmVzczoge2Vycm9yVGV4dCwgZXJyY29kZX0gfVxuICAgIHByaXZhdGUgZGVmZXJyZWQ6IElEZWZlcnJlZDxDb21wbGV0aW9uU3RhdGVzPiA9IG51bGw7XG4gICAgcHJpdmF0ZSByZWFzb246IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vbUlkIFRoZSBJRCBvZiB0aGUgcm9vbSB0byBpbnZpdGUgdG9cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9ncmVzc0NhbGxiYWNrIG9wdGlvbmFsIGNhbGxiYWNrLCBmaXJlZCBhZnRlciBlYWNoIGludml0ZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvb21JZDogc3RyaW5nLCBwcml2YXRlIHJlYWRvbmx5IHByb2dyZXNzQ2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZmF0YWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mYXRhbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZpdGUgdXNlcnMgdG8gdGhpcyByb29tLiBUaGlzIG1heSBvbmx5IGJlIGNhbGxlZCBvbmNlIHBlclxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBjbGFzcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGFkZHJlc3NlcyBBcnJheSBvZiBhZGRyZXNzZXMgdG8gaW52aXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlYXNvbiBSZWFzb24gZm9yIGludml0aW5nIChvcHRpb25hbClcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNlbmRTaGFyZWRIaXN0b3J5S2V5cyB3aGV0aGVyIHRvIHNoYXJlIGUyZWUga2V5cyB3aXRoIHRoZSBpbnZpdGVlcyBpZiBhcHBsaWNhYmxlLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlZCB3aGVuIGFsbCBpbnZpdGF0aW9ucyBpbiB0aGUgcXVldWUgYXJlIGNvbXBsZXRlXG4gICAgICovXG4gICAgcHVibGljIGludml0ZShhZGRyZXNzZXMsIHJlYXNvbj86IHN0cmluZywgc2VuZFNoYXJlZEhpc3RvcnlLZXlzID0gZmFsc2UpOiBQcm9taXNlPENvbXBsZXRpb25TdGF0ZXM+IHtcbiAgICAgICAgaWYgKHRoaXMuYWRkcmVzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFscmVhZHkgaW52aXRpbmcvaW52aXRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZHJlc3Nlcy5wdXNoKC4uLmFkZHJlc3Nlcyk7XG4gICAgICAgIHRoaXMucmVhc29uID0gcmVhc29uO1xuXG4gICAgICAgIGZvciAoY29uc3QgYWRkciBvZiB0aGlzLmFkZHJlc3Nlcykge1xuICAgICAgICAgICAgaWYgKGdldEFkZHJlc3NUeXBlKGFkZHIpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wbGV0aW9uU3RhdGVzW2FkZHJdID0gSW52aXRlU3RhdGUuRXJyb3I7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnNbYWRkcl0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGVycmNvZGU6ICdNX0lOVkFMSUQnLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IF90KCdVbnJlY29nbmlzZWQgYWRkcmVzcycpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kZWZlcnJlZCA9IGRlZmVyPENvbXBsZXRpb25TdGF0ZXM+KCk7XG4gICAgICAgIHRoaXMuaW52aXRlTW9yZSgwKTtcblxuICAgICAgICBpZiAoIXNlbmRTaGFyZWRIaXN0b3J5S2V5cyB8fCAhdGhpcy5yb29tSWQgfHwgIXRoaXMubWF0cml4Q2xpZW50LmlzUm9vbUVuY3J5cHRlZCh0aGlzLnJvb21JZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbSh0aGlzLnJvb21JZCk7XG4gICAgICAgIGNvbnN0IHZpc2liaWxpdHlFdmVudCA9IHJvb20/LmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbUhpc3RvcnlWaXNpYmlsaXR5LCBcIlwiKTtcbiAgICAgICAgY29uc3QgdmlzaWJpbGl0eSA9IHZpc2liaWxpdHlFdmVudD8uZ2V0Q29udGVudCgpLmhpc3RvcnlfdmlzaWJpbGl0eTtcblxuICAgICAgICBpZiAodmlzaWJpbGl0eSAhPT0gSGlzdG9yeVZpc2liaWxpdHkuV29ybGRSZWFkYWJsZSAmJiB2aXNpYmlsaXR5ICE9PSBIaXN0b3J5VmlzaWJpbGl0eS5TaGFyZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5kZWZlcnJlZC5wcm9taXNlLnRoZW4oYXN5bmMgc3RhdGVzID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGludml0ZWRVc2VycyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBbYWRkciwgc3RhdGVdIG9mIE9iamVjdC5lbnRyaWVzKHN0YXRlcykpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IEludml0ZVN0YXRlLkludml0ZWQgJiYgZ2V0QWRkcmVzc1R5cGUoYWRkcikgPT09IEFkZHJlc3NUeXBlLk1hdHJpeFVzZXJJZCkge1xuICAgICAgICAgICAgICAgICAgICBpbnZpdGVkVXNlcnMucHVzaChhZGRyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJTaGFyaW5nIGhpc3Rvcnkgd2l0aFwiLCBpbnZpdGVkVXNlcnMpO1xuICAgICAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQuc2VuZFNoYXJlZEhpc3RvcnlLZXlzKHRoaXMucm9vbUlkLCBpbnZpdGVkVXNlcnMpOyAvLyBkbyB0aGlzIGluIHRoZSBiYWNrZ3JvdW5kXG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGludml0aW5nLiBDYXVzZXMgcHJvbWlzZXMgcmV0dXJuZWQgYnkgaW52aXRlKCkgdG8gYmUgcmVqZWN0ZWQuXG4gICAgICovXG4gICAgcHVibGljIGNhbmNlbCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmJ1c3kpIHJldHVybjtcblxuICAgICAgICB0aGlzLmNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKCdjYW5jZWxlZCcpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q29tcGxldGlvblN0YXRlKGFkZHI6IHN0cmluZyk6IEludml0ZVN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGlvblN0YXRlc1thZGRyXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RXJyb3JUZXh0KGFkZHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yc1thZGRyXSA/IHRoaXMuZXJyb3JzW2FkZHJdLmVycm9yVGV4dCA6IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBpbnZpdGVUb1Jvb20ocm9vbUlkOiBzdHJpbmcsIGFkZHI6IHN0cmluZywgaWdub3JlUHJvZmlsZSA9IGZhbHNlKTogUHJvbWlzZTx7fT4ge1xuICAgICAgICBjb25zdCBhZGRyVHlwZSA9IGdldEFkZHJlc3NUeXBlKGFkZHIpO1xuXG4gICAgICAgIGlmIChhZGRyVHlwZSA9PT0gQWRkcmVzc1R5cGUuRW1haWwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hdHJpeENsaWVudC5pbnZpdGVCeUVtYWlsKHJvb21JZCwgYWRkcik7XG4gICAgICAgIH0gZWxzZSBpZiAoYWRkclR5cGUgPT09IEFkZHJlc3NUeXBlLk1hdHJpeFVzZXJJZCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIGlmICghcm9vbSkgdGhyb3cgbmV3IEVycm9yKFwiUm9vbSBub3QgZm91bmRcIik7XG5cbiAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHJvb20uZ2V0TWVtYmVyKGFkZHIpO1xuICAgICAgICAgICAgaWYgKG1lbWJlcj8ubWVtYmVyc2hpcCA9PT0gXCJqb2luXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWF0cml4RXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICBlcnJjb2RlOiBVU0VSX0FMUkVBRFlfSk9JTkVELFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJNZW1iZXIgYWxyZWFkeSBqb2luZWRcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyPy5tZW1iZXJzaGlwID09PSBcImludml0ZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1hdHJpeEVycm9yKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyY29kZTogVVNFUl9BTFJFQURZX0lOVklURUQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBcIk1lbWJlciBhbHJlYWR5IGludml0ZWRcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFpZ25vcmVQcm9maWxlICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJwcm9tcHRCZWZvcmVJbnZpdGVVbmtub3duVXNlcnNcIiwgdGhpcy5yb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5tYXRyaXhDbGllbnQuZ2V0UHJvZmlsZUluZm8oYWRkcik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBlcnJvciBoYW5kbGluZyBkdXJpbmcgdGhlIGludml0YXRpb24gcHJvY2VzcyBjb3ZlcnMgYW55IEFQSS5cbiAgICAgICAgICAgICAgICAgICAgLy8gU29tZSBlcnJvcnMgbXVzdCB0byBtZSBtYXBwZWQgZnJvbSBwcm9maWxlIEFQSSBlcnJvcnMgdG8gbW9yZSBzcGVjaWZpYyBvbmVzIHRvIGF2b2lkIGNvbGxpc2lvbnMuXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZXJyLmVycmNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ01fRk9SQklEREVOJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWF0cml4RXJyb3IoeyBlcnJjb2RlOiAnTV9QUk9GSUxFX1VORElTQ0xPU0VEJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ01fTk9UX0ZPVU5EJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWF0cml4RXJyb3IoeyBlcnJjb2RlOiAnTV9VU0VSX05PVF9GT1VORCcgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF0cml4Q2xpZW50Lmludml0ZShyb29tSWQsIGFkZHIsIHVuZGVmaW5lZCwgdGhpcy5yZWFzb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBhZGRyZXNzJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRvSW52aXRlKGFkZHJlc3M6IHN0cmluZywgaWdub3JlUHJvZmlsZSA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKGBJbnZpdGluZyAke2FkZHJlc3N9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRvSW52aXRlID0gdGhpcy5pbnZpdGVUb1Jvb20odGhpcy5yb29tSWQsIGFkZHJlc3MsIGlnbm9yZVByb2ZpbGUpO1xuICAgICAgICAgICAgZG9JbnZpdGUudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FuY2VsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY29tcGxldGlvblN0YXRlc1thZGRyZXNzXSA9IEludml0ZVN0YXRlLkludml0ZWQ7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuZXJyb3JzW2FkZHJlc3NdO1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3NDYWxsYmFjaz8uKCk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FuY2VsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaXNTcGFjZSA9IHRoaXMucm9vbUlkICYmIHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20odGhpcy5yb29tSWQpPy5pc1NwYWNlUm9vbSgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVycm9yVGV4dDogc3RyaW5nO1xuICAgICAgICAgICAgICAgIGxldCBmYXRhbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXJyLmVycmNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1fRk9SQklEREVOXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KCdZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBpbnZpdGUgcGVvcGxlIHRvIHRoaXMgc3BhY2UuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KCdZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBpbnZpdGUgcGVvcGxlIHRvIHRoaXMgcm9vbS4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZhdGFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFVTRVJfQUxSRUFEWV9JTlZJVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQgPSBfdChcIlVzZXIgaXMgYWxyZWFkeSBpbnZpdGVkIHRvIHRoZSBzcGFjZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoXCJVc2VyIGlzIGFscmVhZHkgaW52aXRlZCB0byB0aGUgcm9vbVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFVTRVJfQUxSRUFEWV9KT0lORUQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KFwiVXNlciBpcyBhbHJlYWR5IGluIHRoZSBzcGFjZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoXCJVc2VyIGlzIGFscmVhZHkgaW4gdGhlIHJvb21cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1fTElNSVRfRVhDRUVERURcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGJlaW5nIHRocm90dGxlZCBzbyB3YWl0IGEgYml0ICYgdHJ5IGFnYWluXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRvSW52aXRlKGFkZHJlc3MsIGlnbm9yZVByb2ZpbGUpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTV9OT1RfRk9VTkRcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1fVVNFUl9OT1RfRk9VTkRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KFwiVXNlciBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTV9QUk9GSUxFX1VORElTQ0xPU0VEXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQgPSBfdChcIlVzZXIgbWF5IG9yIG1heSBub3QgZXhpc3RcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1fUFJPRklMRV9OT1RfRk9VTkRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaWdub3JlUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEludml0ZSB3aXRob3V0IHRoZSBwcm9maWxlIGNoZWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFVzZXIgJHthZGRyZXNzfSBkb2VzIG5vdCBoYXZlIGEgcHJvZmlsZSAtIGludml0aW5nIGFueXdheXMgYXV0b21hdGljYWxseWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG9JbnZpdGUoYWRkcmVzcywgdHJ1ZSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTV9CQURfU1RBVEVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KFwiVGhlIHVzZXIgbXVzdCBiZSB1bmJhbm5lZCBiZWZvcmUgdGhleSBjYW4gYmUgaW52aXRlZC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1fVU5TVVBQT1JURURfUk9PTV9WRVJTSU9OXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KFwiVGhlIHVzZXIncyBob21lc2VydmVyIGRvZXMgbm90IHN1cHBvcnQgdGhlIHZlcnNpb24gb2YgdGhlIHNwYWNlLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoXCJUaGUgdXNlcidzIGhvbWVzZXJ2ZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGUgdmVyc2lvbiBvZiB0aGUgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQgPSBfdCgnVW5rbm93biBzZXJ2ZXIgZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBsZXRpb25TdGF0ZXNbYWRkcmVzc10gPSBJbnZpdGVTdGF0ZS5FcnJvcjtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yc1thZGRyZXNzXSA9IHsgZXJyb3JUZXh0LCBlcnJjb2RlOiBlcnIuZXJyY29kZSB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5idXN5ID0gIWZhdGFsO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZhdGFsID0gZmF0YWw7XG5cbiAgICAgICAgICAgICAgICBpZiAoZmF0YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGludml0ZU1vcmUobmV4dEluZGV4OiBudW1iZXIsIGlnbm9yZVByb2ZpbGUgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jYW5jZWxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHRJbmRleCA9PT0gdGhpcy5hZGRyZXNzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmVycm9ycykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZXJlIHdlcmUgcHJvYmxlbXMgaW52aXRpbmcgc29tZSBwZW9wbGUgLSBzZWUgaWYgd2UgY2FuIGludml0ZSB0aGVtXG4gICAgICAgICAgICAgICAgLy8gd2l0aG91dCBjYXJpbmcgaWYgdGhleSBleGlzdCBvciBub3QuXG4gICAgICAgICAgICAgICAgY29uc3QgdW5rbm93blByb2ZpbGVVc2VycyA9IE9iamVjdC5rZXlzKHRoaXMuZXJyb3JzKVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGEgPT4gVU5LTk9XTl9QUk9GSUxFX0VSUk9SUy5pbmNsdWRlcyh0aGlzLmVycm9yc1thXS5lcnJjb2RlKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodW5rbm93blByb2ZpbGVVc2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZVVua25vd25zID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvbWlzZXMgPSB1bmtub3duUHJvZmlsZVVzZXJzLm1hcCh1ID0+IHRoaXMuZG9JbnZpdGUodSwgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCkgPT4gdGhpcy5kZWZlcnJlZC5yZXNvbHZlKHRoaXMuY29tcGxldGlvblN0YXRlcykpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInByb21wdEJlZm9yZUludml0ZVVua25vd25Vc2Vyc1wiLCB0aGlzLnJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludml0ZVVua25vd25zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiU2hvd2luZyBmYWlsZWQgdG8gaW52aXRlIGRpYWxvZy4uLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEFza0ludml0ZUFueXdheURpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5rbm93blByb2ZpbGVVc2VyczogdW5rbm93blByb2ZpbGVVc2Vycy5tYXAodSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMuZXJyb3JzW3VdLmVycm9yVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSW52aXRlQW55d2F5czogKCkgPT4gaW52aXRlVW5rbm93bnMoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uR2l2ZVVwOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFrZSBhbGwgdGhlIGNvbXBsZXRpb24gc3RhdGVzIGJlY2F1c2Ugd2UgYWxyZWFkeSB3YXJuZWQgdGhlIHVzZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFkZHIgb2YgdW5rbm93blByb2ZpbGVVc2Vycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBsZXRpb25TdGF0ZXNbYWRkcl0gPSBJbnZpdGVTdGF0ZS5JbnZpdGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVycmVkLnJlc29sdmUodGhpcy5jb21wbGV0aW9uU3RhdGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kZWZlcnJlZC5yZXNvbHZlKHRoaXMuY29tcGxldGlvblN0YXRlcyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhZGRyID0gdGhpcy5hZGRyZXNzZXNbbmV4dEluZGV4XTtcblxuICAgICAgICAvLyBkb24ndCB0cnkgdG8gaW52aXRlIGl0IGlmIGl0J3MgYW4gaW52YWxpZCBhZGRyZXNzXG4gICAgICAgIC8vIChpdCB3aWxsIGFscmVhZHkgYmUgbWFya2VkIGFzIGFuIGVycm9yIHRob3VnaCxcbiAgICAgICAgLy8gc28gbm8gbmVlZCB0byBkbyBzbyBhZ2FpbilcbiAgICAgICAgaWYgKGdldEFkZHJlc3NUeXBlKGFkZHIpID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmludml0ZU1vcmUobmV4dEluZGV4ICsgMSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkb24ndCByZS1pbnZpdGUgKHRoZXJlJ3Mgbm8gd2F5IGluIHRoZSBVSSB0byBkbyB0aGlzLCBidXRcbiAgICAgICAgLy8gZm9yIHNhbml0eSdzIHNha2UpXG4gICAgICAgIGlmICh0aGlzLmNvbXBsZXRpb25TdGF0ZXNbYWRkcl0gPT09IEludml0ZVN0YXRlLkludml0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaW52aXRlTW9yZShuZXh0SW5kZXggKyAxKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZG9JbnZpdGUoYWRkciwgaWdub3JlUHJvZmlsZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmludml0ZU1vcmUobmV4dEluZGV4ICsgMSwgaWdub3JlUHJvZmlsZSk7XG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHRoaXMuZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmNvbXBsZXRpb25TdGF0ZXMpKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFnQllBLFc7OztXQUFBQSxXO0VBQUFBLFc7RUFBQUEsVztHQUFBQSxXLDJCQUFBQSxXOztBQVVaLE1BQU1DLHNCQUFzQixHQUFHLENBQUMsYUFBRCxFQUFnQixrQkFBaEIsRUFBb0MsdUJBQXBDLEVBQTZELHFCQUE3RCxDQUEvQjtBQUlBLE1BQU1DLG1CQUFtQixHQUFHLDJCQUE1QjtBQUNBLE1BQU1DLG9CQUFvQixHQUFHLDRCQUE3QjtBQUVBO0FBQ0E7QUFDQTs7QUFDZSxNQUFNQyxZQUFOLENBQW1CO0VBT21CO0VBQ0o7O0VBSTdDO0FBQ0o7QUFDQTtBQUNBO0VBQ0lDLFdBQVcsQ0FBU0MsTUFBVCxFQUEwQ0MsZ0JBQTFDLEVBQXlFO0lBQUEsS0FBaEVELE1BQWdFLEdBQWhFQSxNQUFnRTtJQUFBLEtBQS9CQyxnQkFBK0IsR0FBL0JBLGdCQUErQjtJQUFBO0lBQUEsZ0RBYmpFLEtBYWlFO0lBQUEsaURBWnRELEVBWXNEO0lBQUEsNENBWHJFLEtBV3FFO0lBQUEsOENBVm5FLEtBVW1FO0lBQUEsd0RBVHZDLEVBU3VDO0lBQUEsOENBUjNDLEVBUTJDO0lBQUEsZ0RBUHBDLElBT29DO0lBQUEsOENBTjNELElBTTJEO0lBQ2hGLEtBQUtDLFlBQUwsR0FBb0JDLGdDQUFBLENBQWdCQyxHQUFoQixFQUFwQjtFQUNIOztFQUVlLElBQUxDLEtBQUssR0FBRztJQUNmLE9BQU8sS0FBS0MsTUFBWjtFQUNIO0VBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7RUFDV0MsTUFBTSxDQUFDQyxTQUFELEVBQVlDLE1BQVosRUFBdUY7SUFBQSxJQUExREMscUJBQTBELHVFQUFsQyxLQUFrQzs7SUFDaEcsSUFBSSxLQUFLRixTQUFMLENBQWVHLE1BQWYsR0FBd0IsQ0FBNUIsRUFBK0I7TUFDM0IsTUFBTSxJQUFJQyxLQUFKLENBQVUsMEJBQVYsQ0FBTjtJQUNIOztJQUNELEtBQUtKLFNBQUwsQ0FBZUssSUFBZixDQUFvQixHQUFHTCxTQUF2QjtJQUNBLEtBQUtDLE1BQUwsR0FBY0EsTUFBZDs7SUFFQSxLQUFLLE1BQU1LLElBQVgsSUFBbUIsS0FBS04sU0FBeEIsRUFBbUM7TUFDL0IsSUFBSSxJQUFBTywyQkFBQSxFQUFlRCxJQUFmLE1BQXlCLElBQTdCLEVBQW1DO1FBQy9CLEtBQUtFLGdCQUFMLENBQXNCRixJQUF0QixJQUE4QnBCLFdBQVcsQ0FBQ2tCLEtBQTFDO1FBQ0EsS0FBS0ssTUFBTCxDQUFZSCxJQUFaLElBQW9CO1VBQ2hCSSxPQUFPLEVBQUUsV0FETztVQUVoQkMsU0FBUyxFQUFFLElBQUFDLG1CQUFBLEVBQUcsc0JBQUg7UUFGSyxDQUFwQjtNQUlIO0lBQ0o7O0lBQ0QsS0FBS0MsUUFBTCxHQUFnQixJQUFBQyxZQUFBLEdBQWhCO0lBQ0EsS0FBS0MsVUFBTCxDQUFnQixDQUFoQjs7SUFFQSxJQUFJLENBQUNiLHFCQUFELElBQTBCLENBQUMsS0FBS1YsTUFBaEMsSUFBMEMsQ0FBQyxLQUFLRSxZQUFMLENBQWtCc0IsZUFBbEIsQ0FBa0MsS0FBS3hCLE1BQXZDLENBQS9DLEVBQStGO01BQzNGLE9BQU8sS0FBS3FCLFFBQUwsQ0FBY0ksT0FBckI7SUFDSDs7SUFFRCxNQUFNQyxJQUFJLEdBQUcsS0FBS3hCLFlBQUwsQ0FBa0J5QixPQUFsQixDQUEwQixLQUFLM0IsTUFBL0IsQ0FBYjtJQUNBLE1BQU00QixlQUFlLEdBQUdGLElBQUksRUFBRUcsWUFBTixDQUFtQkMsY0FBbkIsQ0FBa0NDLGdCQUFBLENBQVVDLHFCQUE1QyxFQUFtRSxFQUFuRSxDQUF4QjtJQUNBLE1BQU1DLFVBQVUsR0FBR0wsZUFBZSxFQUFFTSxVQUFqQixHQUE4QkMsa0JBQWpEOztJQUVBLElBQUlGLFVBQVUsS0FBS0csMkJBQUEsQ0FBa0JDLGFBQWpDLElBQWtESixVQUFVLEtBQUtHLDJCQUFBLENBQWtCRSxNQUF2RixFQUErRjtNQUMzRixPQUFPLEtBQUtqQixRQUFMLENBQWNJLE9BQXJCO0lBQ0g7O0lBRUQsT0FBTyxLQUFLSixRQUFMLENBQWNJLE9BQWQsQ0FBc0JjLElBQXRCLENBQTJCLE1BQU1DLE1BQU4sSUFBZ0I7TUFDOUMsTUFBTUMsWUFBWSxHQUFHLEVBQXJCOztNQUNBLEtBQUssTUFBTSxDQUFDM0IsSUFBRCxFQUFPNEIsS0FBUCxDQUFYLElBQTRCQyxNQUFNLENBQUNDLE9BQVAsQ0FBZUosTUFBZixDQUE1QixFQUFvRDtRQUNoRCxJQUFJRSxLQUFLLEtBQUtoRCxXQUFXLENBQUNtRCxPQUF0QixJQUFpQyxJQUFBOUIsMkJBQUEsRUFBZUQsSUFBZixNQUF5QmdDLHdCQUFBLENBQVlDLFlBQTFFLEVBQXdGO1VBQ3BGTixZQUFZLENBQUM1QixJQUFiLENBQWtCQyxJQUFsQjtRQUNIO01BQ0o7O01BRURrQyxjQUFBLENBQU9DLEdBQVAsQ0FBVyxzQkFBWCxFQUFtQ1IsWUFBbkM7O01BQ0EsS0FBS3ZDLFlBQUwsQ0FBa0JRLHFCQUFsQixDQUF3QyxLQUFLVixNQUE3QyxFQUFxRHlDLFlBQXJELEVBVDhDLENBU3NCOztNQUVwRSxPQUFPRCxNQUFQO0lBQ0gsQ0FaTSxDQUFQO0VBYUg7RUFFRDtBQUNKO0FBQ0E7OztFQUNXVSxNQUFNLEdBQVM7SUFDbEIsSUFBSSxDQUFDLEtBQUtDLElBQVYsRUFBZ0I7SUFFaEIsS0FBS0MsUUFBTCxHQUFnQixJQUFoQjtJQUNBLEtBQUsvQixRQUFMLENBQWNnQyxNQUFkLENBQXFCLElBQUl6QyxLQUFKLENBQVUsVUFBVixDQUFyQjtFQUNIOztFQUVNMEMsa0JBQWtCLENBQUN4QyxJQUFELEVBQTRCO0lBQ2pELE9BQU8sS0FBS0UsZ0JBQUwsQ0FBc0JGLElBQXRCLENBQVA7RUFDSDs7RUFFTXlDLFlBQVksQ0FBQ3pDLElBQUQsRUFBdUI7SUFDdEMsT0FBTyxLQUFLRyxNQUFMLENBQVlILElBQVosSUFBb0IsS0FBS0csTUFBTCxDQUFZSCxJQUFaLEVBQWtCSyxTQUF0QyxHQUFrRCxJQUF6RDtFQUNIOztFQUV5QixNQUFacUMsWUFBWSxDQUFDeEQsTUFBRCxFQUFpQmMsSUFBakIsRUFBbUU7SUFBQSxJQUFwQzJDLGFBQW9DLHVFQUFwQixLQUFvQjtJQUN6RixNQUFNQyxRQUFRLEdBQUcsSUFBQTNDLDJCQUFBLEVBQWVELElBQWYsQ0FBakI7O0lBRUEsSUFBSTRDLFFBQVEsS0FBS1osd0JBQUEsQ0FBWWEsS0FBN0IsRUFBb0M7TUFDaEMsT0FBTyxLQUFLekQsWUFBTCxDQUFrQjBELGFBQWxCLENBQWdDNUQsTUFBaEMsRUFBd0NjLElBQXhDLENBQVA7SUFDSCxDQUZELE1BRU8sSUFBSTRDLFFBQVEsS0FBS1osd0JBQUEsQ0FBWUMsWUFBN0IsRUFBMkM7TUFDOUMsTUFBTXJCLElBQUksR0FBRyxLQUFLeEIsWUFBTCxDQUFrQnlCLE9BQWxCLENBQTBCM0IsTUFBMUIsQ0FBYjtNQUNBLElBQUksQ0FBQzBCLElBQUwsRUFBVyxNQUFNLElBQUlkLEtBQUosQ0FBVSxnQkFBVixDQUFOO01BRVgsTUFBTWlELE1BQU0sR0FBR25DLElBQUksQ0FBQ29DLFNBQUwsQ0FBZWhELElBQWYsQ0FBZjs7TUFDQSxJQUFJK0MsTUFBTSxFQUFFRSxVQUFSLEtBQXVCLE1BQTNCLEVBQW1DO1FBQy9CLE1BQU0sSUFBSUMsb0JBQUosQ0FBZ0I7VUFDbEI5QyxPQUFPLEVBQUV0QixtQkFEUztVQUVsQnFFLEtBQUssRUFBRTtRQUZXLENBQWhCLENBQU47TUFJSCxDQUxELE1BS08sSUFBSUosTUFBTSxFQUFFRSxVQUFSLEtBQXVCLFFBQTNCLEVBQXFDO1FBQ3hDLE1BQU0sSUFBSUMsb0JBQUosQ0FBZ0I7VUFDbEI5QyxPQUFPLEVBQUVyQixvQkFEUztVQUVsQm9FLEtBQUssRUFBRTtRQUZXLENBQWhCLENBQU47TUFJSDs7TUFFRCxJQUFJLENBQUNSLGFBQUQsSUFBa0JTLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIsZ0NBQXZCLEVBQXlELEtBQUtuRSxNQUE5RCxDQUF0QixFQUE2RjtRQUN6RixJQUFJO1VBQ0EsTUFBTSxLQUFLRSxZQUFMLENBQWtCa0UsY0FBbEIsQ0FBaUN0RCxJQUFqQyxDQUFOO1FBQ0gsQ0FGRCxDQUVFLE9BQU91RCxHQUFQLEVBQVk7VUFDVjtVQUNBO1VBQ0EsUUFBUUEsR0FBRyxDQUFDbkQsT0FBWjtZQUNJLEtBQUssYUFBTDtjQUNJLE1BQU0sSUFBSThDLG9CQUFKLENBQWdCO2dCQUFFOUMsT0FBTyxFQUFFO2NBQVgsQ0FBaEIsQ0FBTjs7WUFDSixLQUFLLGFBQUw7Y0FDSSxNQUFNLElBQUk4QyxvQkFBSixDQUFnQjtnQkFBRTlDLE9BQU8sRUFBRTtjQUFYLENBQWhCLENBQU47O1lBQ0o7Y0FDSSxNQUFNbUQsR0FBTjtVQU5SO1FBUUg7TUFDSjs7TUFFRCxPQUFPLEtBQUtuRSxZQUFMLENBQWtCSyxNQUFsQixDQUF5QlAsTUFBekIsRUFBaUNjLElBQWpDLEVBQXVDd0QsU0FBdkMsRUFBa0QsS0FBSzdELE1BQXZELENBQVA7SUFDSCxDQW5DTSxNQW1DQTtNQUNILE1BQU0sSUFBSUcsS0FBSixDQUFVLHFCQUFWLENBQU47SUFDSDtFQUNKOztFQUVPMkQsUUFBUSxDQUFDQyxPQUFELEVBQXdEO0lBQUEsSUFBdENmLGFBQXNDLHVFQUF0QixLQUFzQjtJQUNwRSxPQUFPLElBQUlnQixPQUFKLENBQWtCLENBQUNDLE9BQUQsRUFBVXJCLE1BQVYsS0FBcUI7TUFDMUNMLGNBQUEsQ0FBT0MsR0FBUCxDQUFZLFlBQVd1QixPQUFRLEVBQS9COztNQUVBLE1BQU1ELFFBQVEsR0FBRyxLQUFLZixZQUFMLENBQWtCLEtBQUt4RCxNQUF2QixFQUErQndFLE9BQS9CLEVBQXdDZixhQUF4QyxDQUFqQjtNQUNBYyxRQUFRLENBQUNoQyxJQUFULENBQWMsTUFBTTtRQUNoQixJQUFJLEtBQUthLFFBQVQsRUFBbUI7VUFDZjtRQUNIOztRQUVELEtBQUtwQyxnQkFBTCxDQUFzQndELE9BQXRCLElBQWlDOUUsV0FBVyxDQUFDbUQsT0FBN0M7UUFDQSxPQUFPLEtBQUs1QixNQUFMLENBQVl1RCxPQUFaLENBQVA7UUFFQUUsT0FBTztRQUNQLEtBQUt6RSxnQkFBTDtNQUNILENBVkQsRUFVRzBFLEtBVkgsQ0FVVU4sR0FBRCxJQUFTO1FBQ2QsSUFBSSxLQUFLakIsUUFBVCxFQUFtQjtVQUNmO1FBQ0g7O1FBRURKLGNBQUEsQ0FBT2lCLEtBQVAsQ0FBYUksR0FBYjs7UUFFQSxNQUFNTyxPQUFPLEdBQUcsS0FBSzVFLE1BQUwsSUFBZSxLQUFLRSxZQUFMLENBQWtCeUIsT0FBbEIsQ0FBMEIsS0FBSzNCLE1BQS9CLEdBQXdDNkUsV0FBeEMsRUFBL0I7UUFFQSxJQUFJMUQsU0FBSjtRQUNBLElBQUlkLEtBQUssR0FBRyxLQUFaOztRQUNBLFFBQVFnRSxHQUFHLENBQUNuRCxPQUFaO1VBQ0ksS0FBSyxhQUFMO1lBQ0ksSUFBSTBELE9BQUosRUFBYTtjQUNUekQsU0FBUyxHQUFHLElBQUFDLG1CQUFBLEVBQUcsNERBQUgsQ0FBWjtZQUNILENBRkQsTUFFTztjQUNIRCxTQUFTLEdBQUcsSUFBQUMsbUJBQUEsRUFBRywyREFBSCxDQUFaO1lBQ0g7O1lBQ0RmLEtBQUssR0FBRyxJQUFSO1lBQ0E7O1VBQ0osS0FBS1Isb0JBQUw7WUFDSSxJQUFJK0UsT0FBSixFQUFhO2NBQ1R6RCxTQUFTLEdBQUcsSUFBQUMsbUJBQUEsRUFBRyxzQ0FBSCxDQUFaO1lBQ0gsQ0FGRCxNQUVPO2NBQ0hELFNBQVMsR0FBRyxJQUFBQyxtQkFBQSxFQUFHLHFDQUFILENBQVo7WUFDSDs7WUFDRDs7VUFDSixLQUFLeEIsbUJBQUw7WUFDSSxJQUFJZ0YsT0FBSixFQUFhO2NBQ1R6RCxTQUFTLEdBQUcsSUFBQUMsbUJBQUEsRUFBRyw4QkFBSCxDQUFaO1lBQ0gsQ0FGRCxNQUVPO2NBQ0hELFNBQVMsR0FBRyxJQUFBQyxtQkFBQSxFQUFHLDZCQUFILENBQVo7WUFDSDs7WUFDRDs7VUFDSixLQUFLLGtCQUFMO1lBQ0k7WUFDQTBELFVBQVUsQ0FBQyxNQUFNO2NBQ2IsS0FBS1AsUUFBTCxDQUFjQyxPQUFkLEVBQXVCZixhQUF2QixFQUFzQ2xCLElBQXRDLENBQTJDbUMsT0FBM0MsRUFBb0RyQixNQUFwRDtZQUNILENBRlMsRUFFUCxJQUZPLENBQVY7WUFHQTs7VUFDSixLQUFLLGFBQUw7VUFDQSxLQUFLLGtCQUFMO1lBQ0lsQyxTQUFTLEdBQUcsSUFBQUMsbUJBQUEsRUFBRyxxQkFBSCxDQUFaO1lBQ0E7O1VBQ0osS0FBSyx1QkFBTDtZQUNJRCxTQUFTLEdBQUcsSUFBQUMsbUJBQUEsRUFBRywyQkFBSCxDQUFaO1lBQ0E7O1VBQ0osS0FBSyxxQkFBTDtZQUNJLElBQUksQ0FBQ3FDLGFBQUwsRUFBb0I7Y0FDaEI7Y0FDQVQsY0FBQSxDQUFPK0IsSUFBUCxDQUFhLFFBQU9QLE9BQVEsMkRBQTVCOztjQUNBLEtBQUtELFFBQUwsQ0FBY0MsT0FBZCxFQUF1QixJQUF2QixFQUE2QmpDLElBQTdCLENBQWtDbUMsT0FBbEMsRUFBMkNyQixNQUEzQztjQUNBO1lBQ0g7O1lBQ0Q7O1VBQ0osS0FBSyxhQUFMO1lBQ0lsQyxTQUFTLEdBQUcsSUFBQUMsbUJBQUEsRUFBRyx1REFBSCxDQUFaO1lBQ0E7O1VBQ0osS0FBSyw0QkFBTDtZQUNJLElBQUl3RCxPQUFKLEVBQWE7Y0FDVHpELFNBQVMsR0FBRyxJQUFBQyxtQkFBQSxFQUFHLGtFQUFILENBQVo7WUFDSCxDQUZELE1BRU87Y0FDSEQsU0FBUyxHQUFHLElBQUFDLG1CQUFBLEVBQUcsaUVBQUgsQ0FBWjtZQUNIOztZQUNEO1FBckRSOztRQXdEQSxJQUFJLENBQUNELFNBQUwsRUFBZ0I7VUFDWkEsU0FBUyxHQUFHLElBQUFDLG1CQUFBLEVBQUcsc0JBQUgsQ0FBWjtRQUNIOztRQUVELEtBQUtKLGdCQUFMLENBQXNCd0QsT0FBdEIsSUFBaUM5RSxXQUFXLENBQUNrQixLQUE3QztRQUNBLEtBQUtLLE1BQUwsQ0FBWXVELE9BQVosSUFBdUI7VUFBRXJELFNBQUY7VUFBYUQsT0FBTyxFQUFFbUQsR0FBRyxDQUFDbkQ7UUFBMUIsQ0FBdkI7UUFFQSxLQUFLaUMsSUFBTCxHQUFZLENBQUM5QyxLQUFiO1FBQ0EsS0FBS0MsTUFBTCxHQUFjRCxLQUFkOztRQUVBLElBQUlBLEtBQUosRUFBVztVQUNQZ0QsTUFBTSxDQUFDZ0IsR0FBRCxDQUFOO1FBQ0gsQ0FGRCxNQUVPO1VBQ0hLLE9BQU87UUFDVjtNQUNKLENBNUZEO0lBNkZILENBakdNLENBQVA7RUFrR0g7O0VBRU9uRCxVQUFVLENBQUN5RCxTQUFELEVBQWlEO0lBQUEsSUFBN0J2QixhQUE2Qix1RUFBYixLQUFhOztJQUMvRCxJQUFJLEtBQUtMLFFBQVQsRUFBbUI7TUFDZjtJQUNIOztJQUVELElBQUk0QixTQUFTLEtBQUssS0FBS3hFLFNBQUwsQ0FBZUcsTUFBakMsRUFBeUM7TUFDckMsS0FBS3dDLElBQUwsR0FBWSxLQUFaOztNQUNBLElBQUlSLE1BQU0sQ0FBQ3NDLElBQVAsQ0FBWSxLQUFLaEUsTUFBakIsRUFBeUJOLE1BQXpCLEdBQWtDLENBQXRDLEVBQXlDO1FBQ3JDO1FBQ0E7UUFDQSxNQUFNdUUsbUJBQW1CLEdBQUd2QyxNQUFNLENBQUNzQyxJQUFQLENBQVksS0FBS2hFLE1BQWpCLEVBQ3ZCa0UsTUFEdUIsQ0FDaEJDLENBQUMsSUFBSXpGLHNCQUFzQixDQUFDMEYsUUFBdkIsQ0FBZ0MsS0FBS3BFLE1BQUwsQ0FBWW1FLENBQVosRUFBZWxFLE9BQS9DLENBRFcsQ0FBNUI7O1FBR0EsSUFBSWdFLG1CQUFtQixDQUFDdkUsTUFBcEIsR0FBNkIsQ0FBakMsRUFBb0M7VUFDaEMsTUFBTTJFLGNBQWMsR0FBRyxNQUFNO1lBQ3pCLE1BQU1DLFFBQVEsR0FBR0wsbUJBQW1CLENBQUNNLEdBQXBCLENBQXdCQyxDQUFDLElBQUksS0FBS2xCLFFBQUwsQ0FBY2tCLENBQWQsRUFBaUIsSUFBakIsQ0FBN0IsQ0FBakI7WUFDQWhCLE9BQU8sQ0FBQ2lCLEdBQVIsQ0FBWUgsUUFBWixFQUFzQmhELElBQXRCLENBQTJCLE1BQU0sS0FBS2xCLFFBQUwsQ0FBY3FELE9BQWQsQ0FBc0IsS0FBSzFELGdCQUEzQixDQUFqQztVQUNILENBSEQ7O1VBS0EsSUFBSSxDQUFDa0Qsc0JBQUEsQ0FBY0MsUUFBZCxDQUF1QixnQ0FBdkIsRUFBeUQsS0FBS25FLE1BQTlELENBQUwsRUFBNEU7WUFDeEVzRixjQUFjO1lBQ2Q7VUFDSDs7VUFFRHRDLGNBQUEsQ0FBT0MsR0FBUCxDQUFXLG9DQUFYOztVQUNBMEMsY0FBQSxDQUFNQyxZQUFOLENBQW1CQyw4QkFBbkIsRUFBMEM7WUFDdENYLG1CQUFtQixFQUFFQSxtQkFBbUIsQ0FBQ00sR0FBcEIsQ0FBd0JDLENBQUMsS0FBSztjQUMvQ0ssTUFBTSxFQUFFTCxDQUR1QztjQUUvQ3RFLFNBQVMsRUFBRSxLQUFLRixNQUFMLENBQVl3RSxDQUFaLEVBQWV0RTtZQUZxQixDQUFMLENBQXpCLENBRGlCO1lBS3RDNEUsZUFBZSxFQUFFLE1BQU1ULGNBQWMsRUFMQztZQU10Q1UsUUFBUSxFQUFFLE1BQU07Y0FDWjtjQUNBLEtBQUssTUFBTWxGLElBQVgsSUFBbUJvRSxtQkFBbkIsRUFBd0M7Z0JBQ3BDLEtBQUtsRSxnQkFBTCxDQUFzQkYsSUFBdEIsSUFBOEJwQixXQUFXLENBQUNtRCxPQUExQztjQUNIOztjQUNELEtBQUt4QixRQUFMLENBQWNxRCxPQUFkLENBQXNCLEtBQUsxRCxnQkFBM0I7WUFDSDtVQVpxQyxDQUExQzs7VUFjQTtRQUNIO01BQ0o7O01BQ0QsS0FBS0ssUUFBTCxDQUFjcUQsT0FBZCxDQUFzQixLQUFLMUQsZ0JBQTNCO01BQ0E7SUFDSDs7SUFFRCxNQUFNRixJQUFJLEdBQUcsS0FBS04sU0FBTCxDQUFld0UsU0FBZixDQUFiLENBOUMrRCxDQWdEL0Q7SUFDQTtJQUNBOztJQUNBLElBQUksSUFBQWpFLDJCQUFBLEVBQWVELElBQWYsTUFBeUIsSUFBN0IsRUFBbUM7TUFDL0IsS0FBS1MsVUFBTCxDQUFnQnlELFNBQVMsR0FBRyxDQUE1QjtNQUNBO0lBQ0gsQ0F0RDhELENBd0QvRDtJQUNBOzs7SUFDQSxJQUFJLEtBQUtoRSxnQkFBTCxDQUFzQkYsSUFBdEIsTUFBZ0NwQixXQUFXLENBQUNtRCxPQUFoRCxFQUF5RDtNQUNyRCxLQUFLdEIsVUFBTCxDQUFnQnlELFNBQVMsR0FBRyxDQUE1QjtNQUNBO0lBQ0g7O0lBRUQsS0FBS1QsUUFBTCxDQUFjekQsSUFBZCxFQUFvQjJDLGFBQXBCLEVBQW1DbEIsSUFBbkMsQ0FBd0MsTUFBTTtNQUMxQyxLQUFLaEIsVUFBTCxDQUFnQnlELFNBQVMsR0FBRyxDQUE1QixFQUErQnZCLGFBQS9CO0lBQ0gsQ0FGRCxFQUVHa0IsS0FGSCxDQUVTLE1BQU0sS0FBS3RELFFBQUwsQ0FBY3FELE9BQWQsQ0FBc0IsS0FBSzFELGdCQUEzQixDQUZmO0VBR0g7O0FBclQ2QiJ9