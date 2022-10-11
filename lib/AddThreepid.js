"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _Modal = _interopRequireDefault(require("./Modal"));

var _languageHandler = require("./languageHandler");

var _IdentityAuthClient = _interopRequireDefault(require("./IdentityAuthClient"));

var _InteractiveAuthEntryComponents = require("./components/views/auth/InteractiveAuthEntryComponents");

var _InteractiveAuthDialog = _interopRequireDefault(require("./components/views/dialogs/InteractiveAuthDialog"));

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
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
function getIdServerDomain() {
  return _MatrixClientPeg.MatrixClientPeg.get().idBaseUrl.split("://")[1];
}
/**
 * Allows a user to add a third party identifier to their homeserver and,
 * optionally, the identity servers.
 *
 * This involves getting an email token from the identity server to "prove" that
 * the client owns the given email address, which is then passed to the
 * add threepid API on the homeserver.
 *
 * Diagrams of the intended API flows here are available at:
 *
 * https://gist.github.com/jryans/839a09bf0c5a70e2f36ed990d50ed928
 */


class AddThreepid {
  constructor() {
    (0, _defineProperty2.default)(this, "sessionId", void 0);
    (0, _defineProperty2.default)(this, "submitUrl", void 0);
    (0, _defineProperty2.default)(this, "clientSecret", void 0);
    (0, _defineProperty2.default)(this, "bind", void 0);
    (0, _defineProperty2.default)(this, "makeAddThreepidOnlyRequest", auth => {
      return _MatrixClientPeg.MatrixClientPeg.get().addThreePidOnly({
        sid: this.sessionId,
        client_secret: this.clientSecret,
        auth
      });
    });
    this.clientSecret = _MatrixClientPeg.MatrixClientPeg.get().generateClientSecret();
  }
  /**
   * Attempt to add an email threepid to the homeserver.
   * This will trigger a side-effect of sending an email to the provided email address.
   * @param {string} emailAddress The email address to add
   * @return {Promise} Resolves when the email has been sent. Then call checkEmailLinkClicked().
   */


  addEmailAddress(emailAddress) {
    return _MatrixClientPeg.MatrixClientPeg.get().requestAdd3pidEmailToken(emailAddress, this.clientSecret, 1).then(res => {
      this.sessionId = res.sid;
      return res;
    }, function (err) {
      if (err.errcode === 'M_THREEPID_IN_USE') {
        err.message = (0, _languageHandler._t)('This email address is already in use');
      } else if (err.httpStatus) {
        err.message = err.message + ` (Status ${err.httpStatus})`;
      }

      throw err;
    });
  }
  /**
   * Attempt to bind an email threepid on the identity server via the homeserver.
   * This will trigger a side-effect of sending an email to the provided email address.
   * @param {string} emailAddress The email address to add
   * @return {Promise} Resolves when the email has been sent. Then call checkEmailLinkClicked().
   */


  async bindEmailAddress(emailAddress) {
    this.bind = true;

    if (await _MatrixClientPeg.MatrixClientPeg.get().doesServerSupportSeparateAddAndBind()) {
      // For separate bind, request a token directly from the IS.
      const authClient = new _IdentityAuthClient.default();
      const identityAccessToken = await authClient.getAccessToken();
      return _MatrixClientPeg.MatrixClientPeg.get().requestEmailToken(emailAddress, this.clientSecret, 1, undefined, undefined, identityAccessToken).then(res => {
        this.sessionId = res.sid;
        return res;
      }, function (err) {
        if (err.errcode === 'M_THREEPID_IN_USE') {
          err.message = (0, _languageHandler._t)('This email address is already in use');
        } else if (err.httpStatus) {
          err.message = err.message + ` (Status ${err.httpStatus})`;
        }

        throw err;
      });
    } else {
      // For tangled bind, request a token via the HS.
      return this.addEmailAddress(emailAddress);
    }
  }
  /**
   * Attempt to add a MSISDN threepid to the homeserver.
   * This will trigger a side-effect of sending an SMS to the provided phone number.
   * @param {string} phoneCountry The ISO 2 letter code of the country to resolve phoneNumber in
   * @param {string} phoneNumber The national or international formatted phone number to add
   * @return {Promise} Resolves when the text message has been sent. Then call haveMsisdnToken().
   */


  addMsisdn(phoneCountry, phoneNumber) {
    return _MatrixClientPeg.MatrixClientPeg.get().requestAdd3pidMsisdnToken(phoneCountry, phoneNumber, this.clientSecret, 1).then(res => {
      this.sessionId = res.sid;
      this.submitUrl = res.submit_url;
      return res;
    }, function (err) {
      if (err.errcode === 'M_THREEPID_IN_USE') {
        err.message = (0, _languageHandler._t)('This phone number is already in use');
      } else if (err.httpStatus) {
        err.message = err.message + ` (Status ${err.httpStatus})`;
      }

      throw err;
    });
  }
  /**
   * Attempt to bind a MSISDN threepid on the identity server via the homeserver.
   * This will trigger a side-effect of sending an SMS to the provided phone number.
   * @param {string} phoneCountry The ISO 2 letter code of the country to resolve phoneNumber in
   * @param {string} phoneNumber The national or international formatted phone number to add
   * @return {Promise} Resolves when the text message has been sent. Then call haveMsisdnToken().
   */


  async bindMsisdn(phoneCountry, phoneNumber) {
    this.bind = true;

    if (await _MatrixClientPeg.MatrixClientPeg.get().doesServerSupportSeparateAddAndBind()) {
      // For separate bind, request a token directly from the IS.
      const authClient = new _IdentityAuthClient.default();
      const identityAccessToken = await authClient.getAccessToken();
      return _MatrixClientPeg.MatrixClientPeg.get().requestMsisdnToken(phoneCountry, phoneNumber, this.clientSecret, 1, undefined, undefined, identityAccessToken).then(res => {
        this.sessionId = res.sid;
        return res;
      }, function (err) {
        if (err.errcode === 'M_THREEPID_IN_USE') {
          err.message = (0, _languageHandler._t)('This phone number is already in use');
        } else if (err.httpStatus) {
          err.message = err.message + ` (Status ${err.httpStatus})`;
        }

        throw err;
      });
    } else {
      // For tangled bind, request a token via the HS.
      return this.addMsisdn(phoneCountry, phoneNumber);
    }
  }
  /**
   * Checks if the email link has been clicked by attempting to add the threepid
   * @return {Promise} Resolves if the email address was added. Rejects with an object
   * with a "message" property which contains a human-readable message detailing why
   * the request failed.
   */


  async checkEmailLinkClicked() {
    try {
      if (await _MatrixClientPeg.MatrixClientPeg.get().doesServerSupportSeparateAddAndBind()) {
        if (this.bind) {
          const authClient = new _IdentityAuthClient.default();
          const identityAccessToken = await authClient.getAccessToken();
          await _MatrixClientPeg.MatrixClientPeg.get().bindThreePid({
            sid: this.sessionId,
            client_secret: this.clientSecret,
            id_server: getIdServerDomain(),
            id_access_token: identityAccessToken
          });
        } else {
          try {
            await this.makeAddThreepidOnlyRequest(); // The spec has always required this to use UI auth but synapse briefly
            // implemented it without, so this may just succeed and that's OK.

            return;
          } catch (e) {
            if (e.httpStatus !== 401 || !e.data || !e.data.flows) {
              // doesn't look like an interactive-auth failure
              throw e;
            }

            const dialogAesthetics = {
              [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_PREAUTH]: {
                title: (0, _languageHandler._t)("Use Single Sign On to continue"),
                body: (0, _languageHandler._t)("Confirm adding this email address by using " + "Single Sign On to prove your identity."),
                continueText: (0, _languageHandler._t)("Single Sign On"),
                continueKind: "primary"
              },
              [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_POSTAUTH]: {
                title: (0, _languageHandler._t)("Confirm adding email"),
                body: (0, _languageHandler._t)("Click the button below to confirm adding this email address."),
                continueText: (0, _languageHandler._t)("Confirm"),
                continueKind: "primary"
              }
            };

            const {
              finished
            } = _Modal.default.createDialog(_InteractiveAuthDialog.default, {
              title: (0, _languageHandler._t)("Add Email Address"),
              matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
              authData: e.data,
              makeRequest: this.makeAddThreepidOnlyRequest,
              aestheticsForStagePhases: {
                [_InteractiveAuthEntryComponents.SSOAuthEntry.LOGIN_TYPE]: dialogAesthetics,
                [_InteractiveAuthEntryComponents.SSOAuthEntry.UNSTABLE_LOGIN_TYPE]: dialogAesthetics
              }
            });

            return finished;
          }
        }
      } else {
        await _MatrixClientPeg.MatrixClientPeg.get().addThreePid({
          sid: this.sessionId,
          client_secret: this.clientSecret,
          id_server: getIdServerDomain()
        }, this.bind);
      }
    } catch (err) {
      if (err.httpStatus === 401) {
        err.message = (0, _languageHandler._t)('Failed to verify email address: make sure you clicked the link in the email');
      } else if (err.httpStatus) {
        err.message += ` (Status ${err.httpStatus})`;
      }

      throw err;
    }
  }
  /**
   * @param {{type: string, session?: string}} auth UI auth object
   * @return {Promise<Object>} Response from /3pid/add call (in current spec, an empty object)
   */


  /**
   * Takes a phone number verification code as entered by the user and validates
   * it with the identity server, then if successful, adds the phone number.
   * @param {string} msisdnToken phone number verification code as entered by the user
   * @return {Promise} Resolves if the phone number was added. Rejects with an object
   * with a "message" property which contains a human-readable message detailing why
   * the request failed.
   */
  async haveMsisdnToken(msisdnToken) {
    const authClient = new _IdentityAuthClient.default();
    const supportsSeparateAddAndBind = await _MatrixClientPeg.MatrixClientPeg.get().doesServerSupportSeparateAddAndBind();
    let result;

    if (this.submitUrl) {
      result = await _MatrixClientPeg.MatrixClientPeg.get().submitMsisdnTokenOtherUrl(this.submitUrl, this.sessionId, this.clientSecret, msisdnToken);
    } else if (this.bind || !supportsSeparateAddAndBind) {
      result = await _MatrixClientPeg.MatrixClientPeg.get().submitMsisdnToken(this.sessionId, this.clientSecret, msisdnToken, await authClient.getAccessToken());
    } else {
      throw new Error("The add / bind with MSISDN flow is misconfigured");
    }

    if (result.errcode) {
      throw result;
    }

    if (supportsSeparateAddAndBind) {
      if (this.bind) {
        await _MatrixClientPeg.MatrixClientPeg.get().bindThreePid({
          sid: this.sessionId,
          client_secret: this.clientSecret,
          id_server: getIdServerDomain(),
          id_access_token: await authClient.getAccessToken()
        });
      } else {
        try {
          await this.makeAddThreepidOnlyRequest(); // The spec has always required this to use UI auth but synapse briefly
          // implemented it without, so this may just succeed and that's OK.

          return;
        } catch (e) {
          if (e.httpStatus !== 401 || !e.data || !e.data.flows) {
            // doesn't look like an interactive-auth failure
            throw e;
          }

          const dialogAesthetics = {
            [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_PREAUTH]: {
              title: (0, _languageHandler._t)("Use Single Sign On to continue"),
              body: (0, _languageHandler._t)("Confirm adding this phone number by using " + "Single Sign On to prove your identity."),
              continueText: (0, _languageHandler._t)("Single Sign On"),
              continueKind: "primary"
            },
            [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_POSTAUTH]: {
              title: (0, _languageHandler._t)("Confirm adding phone number"),
              body: (0, _languageHandler._t)("Click the button below to confirm adding this phone number."),
              continueText: (0, _languageHandler._t)("Confirm"),
              continueKind: "primary"
            }
          };

          const {
            finished
          } = _Modal.default.createDialog(_InteractiveAuthDialog.default, {
            title: (0, _languageHandler._t)("Add Phone Number"),
            matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
            authData: e.data,
            makeRequest: this.makeAddThreepidOnlyRequest,
            aestheticsForStagePhases: {
              [_InteractiveAuthEntryComponents.SSOAuthEntry.LOGIN_TYPE]: dialogAesthetics,
              [_InteractiveAuthEntryComponents.SSOAuthEntry.UNSTABLE_LOGIN_TYPE]: dialogAesthetics
            }
          });

          return finished;
        }
      }
    } else {
      await _MatrixClientPeg.MatrixClientPeg.get().addThreePid({
        sid: this.sessionId,
        client_secret: this.clientSecret,
        id_server: getIdServerDomain()
      }, this.bind);
    }
  }

}

exports.default = AddThreepid;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRJZFNlcnZlckRvbWFpbiIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImlkQmFzZVVybCIsInNwbGl0IiwiQWRkVGhyZWVwaWQiLCJjb25zdHJ1Y3RvciIsImF1dGgiLCJhZGRUaHJlZVBpZE9ubHkiLCJzaWQiLCJzZXNzaW9uSWQiLCJjbGllbnRfc2VjcmV0IiwiY2xpZW50U2VjcmV0IiwiZ2VuZXJhdGVDbGllbnRTZWNyZXQiLCJhZGRFbWFpbEFkZHJlc3MiLCJlbWFpbEFkZHJlc3MiLCJyZXF1ZXN0QWRkM3BpZEVtYWlsVG9rZW4iLCJ0aGVuIiwicmVzIiwiZXJyIiwiZXJyY29kZSIsIm1lc3NhZ2UiLCJfdCIsImh0dHBTdGF0dXMiLCJiaW5kRW1haWxBZGRyZXNzIiwiYmluZCIsImRvZXNTZXJ2ZXJTdXBwb3J0U2VwYXJhdGVBZGRBbmRCaW5kIiwiYXV0aENsaWVudCIsIklkZW50aXR5QXV0aENsaWVudCIsImlkZW50aXR5QWNjZXNzVG9rZW4iLCJnZXRBY2Nlc3NUb2tlbiIsInJlcXVlc3RFbWFpbFRva2VuIiwidW5kZWZpbmVkIiwiYWRkTXNpc2RuIiwicGhvbmVDb3VudHJ5IiwicGhvbmVOdW1iZXIiLCJyZXF1ZXN0QWRkM3BpZE1zaXNkblRva2VuIiwic3VibWl0VXJsIiwic3VibWl0X3VybCIsImJpbmRNc2lzZG4iLCJyZXF1ZXN0TXNpc2RuVG9rZW4iLCJjaGVja0VtYWlsTGlua0NsaWNrZWQiLCJiaW5kVGhyZWVQaWQiLCJpZF9zZXJ2ZXIiLCJpZF9hY2Nlc3NfdG9rZW4iLCJtYWtlQWRkVGhyZWVwaWRPbmx5UmVxdWVzdCIsImUiLCJkYXRhIiwiZmxvd3MiLCJkaWFsb2dBZXN0aGV0aWNzIiwiU1NPQXV0aEVudHJ5IiwiUEhBU0VfUFJFQVVUSCIsInRpdGxlIiwiYm9keSIsImNvbnRpbnVlVGV4dCIsImNvbnRpbnVlS2luZCIsIlBIQVNFX1BPU1RBVVRIIiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkludGVyYWN0aXZlQXV0aERpYWxvZyIsIm1hdHJpeENsaWVudCIsImF1dGhEYXRhIiwibWFrZVJlcXVlc3QiLCJhZXN0aGV0aWNzRm9yU3RhZ2VQaGFzZXMiLCJMT0dJTl9UWVBFIiwiVU5TVEFCTEVfTE9HSU5fVFlQRSIsImFkZFRocmVlUGlkIiwiaGF2ZU1zaXNkblRva2VuIiwibXNpc2RuVG9rZW4iLCJzdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZCIsInJlc3VsdCIsInN1Ym1pdE1zaXNkblRva2VuT3RoZXJVcmwiLCJzdWJtaXRNc2lzZG5Ub2tlbiIsIkVycm9yIl0sInNvdXJjZXMiOlsiLi4vc3JjL0FkZFRocmVlcGlkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgSVJlcXVlc3RNc2lzZG5Ub2tlblJlc3BvbnNlLCBJUmVxdWVzdFRva2VuUmVzcG9uc2UgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbWF0cml4XCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IElkZW50aXR5QXV0aENsaWVudCBmcm9tICcuL0lkZW50aXR5QXV0aENsaWVudCc7XG5pbXBvcnQgeyBTU09BdXRoRW50cnkgfSBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2F1dGgvSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzXCI7XG5pbXBvcnQgSW50ZXJhY3RpdmVBdXRoRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9JbnRlcmFjdGl2ZUF1dGhEaWFsb2dcIjtcblxuZnVuY3Rpb24gZ2V0SWRTZXJ2ZXJEb21haW4oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmlkQmFzZVVybC5zcGxpdChcIjovL1wiKVsxXTtcbn1cblxuLyoqXG4gKiBBbGxvd3MgYSB1c2VyIHRvIGFkZCBhIHRoaXJkIHBhcnR5IGlkZW50aWZpZXIgdG8gdGhlaXIgaG9tZXNlcnZlciBhbmQsXG4gKiBvcHRpb25hbGx5LCB0aGUgaWRlbnRpdHkgc2VydmVycy5cbiAqXG4gKiBUaGlzIGludm9sdmVzIGdldHRpbmcgYW4gZW1haWwgdG9rZW4gZnJvbSB0aGUgaWRlbnRpdHkgc2VydmVyIHRvIFwicHJvdmVcIiB0aGF0XG4gKiB0aGUgY2xpZW50IG93bnMgdGhlIGdpdmVuIGVtYWlsIGFkZHJlc3MsIHdoaWNoIGlzIHRoZW4gcGFzc2VkIHRvIHRoZVxuICogYWRkIHRocmVlcGlkIEFQSSBvbiB0aGUgaG9tZXNlcnZlci5cbiAqXG4gKiBEaWFncmFtcyBvZiB0aGUgaW50ZW5kZWQgQVBJIGZsb3dzIGhlcmUgYXJlIGF2YWlsYWJsZSBhdDpcbiAqXG4gKiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9qcnlhbnMvODM5YTA5YmYwYzVhNzBlMmYzNmVkOTkwZDUwZWQ5MjhcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWRkVGhyZWVwaWQge1xuICAgIHByaXZhdGUgc2Vzc2lvbklkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBzdWJtaXRVcmw6IHN0cmluZztcbiAgICBwcml2YXRlIGNsaWVudFNlY3JldDogc3RyaW5nO1xuICAgIHByaXZhdGUgYmluZDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNsaWVudFNlY3JldCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZW5lcmF0ZUNsaWVudFNlY3JldCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGVtcHQgdG8gYWRkIGFuIGVtYWlsIHRocmVlcGlkIHRvIHRoZSBob21lc2VydmVyLlxuICAgICAqIFRoaXMgd2lsbCB0cmlnZ2VyIGEgc2lkZS1lZmZlY3Qgb2Ygc2VuZGluZyBhbiBlbWFpbCB0byB0aGUgcHJvdmlkZWQgZW1haWwgYWRkcmVzcy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZW1haWxBZGRyZXNzIFRoZSBlbWFpbCBhZGRyZXNzIHRvIGFkZFxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIGVtYWlsIGhhcyBiZWVuIHNlbnQuIFRoZW4gY2FsbCBjaGVja0VtYWlsTGlua0NsaWNrZWQoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkRW1haWxBZGRyZXNzKGVtYWlsQWRkcmVzczogc3RyaW5nKTogUHJvbWlzZTxJUmVxdWVzdFRva2VuUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZXF1ZXN0QWRkM3BpZEVtYWlsVG9rZW4oZW1haWxBZGRyZXNzLCB0aGlzLmNsaWVudFNlY3JldCwgMSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb25JZCA9IHJlcy5zaWQ7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gJ01fVEhSRUVQSURfSU5fVVNFJykge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gX3QoJ1RoaXMgZW1haWwgYWRkcmVzcyBpcyBhbHJlYWR5IGluIHVzZScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIuaHR0cFN0YXR1cykge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gZXJyLm1lc3NhZ2UgKyBgIChTdGF0dXMgJHtlcnIuaHR0cFN0YXR1c30pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0ZW1wdCB0byBiaW5kIGFuIGVtYWlsIHRocmVlcGlkIG9uIHRoZSBpZGVudGl0eSBzZXJ2ZXIgdmlhIHRoZSBob21lc2VydmVyLlxuICAgICAqIFRoaXMgd2lsbCB0cmlnZ2VyIGEgc2lkZS1lZmZlY3Qgb2Ygc2VuZGluZyBhbiBlbWFpbCB0byB0aGUgcHJvdmlkZWQgZW1haWwgYWRkcmVzcy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZW1haWxBZGRyZXNzIFRoZSBlbWFpbCBhZGRyZXNzIHRvIGFkZFxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIGVtYWlsIGhhcyBiZWVuIHNlbnQuIFRoZW4gY2FsbCBjaGVja0VtYWlsTGlua0NsaWNrZWQoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgYmluZEVtYWlsQWRkcmVzcyhlbWFpbEFkZHJlc3M6IHN0cmluZyk6IFByb21pc2U8SVJlcXVlc3RUb2tlblJlc3BvbnNlPiB7XG4gICAgICAgIHRoaXMuYmluZCA9IHRydWU7XG4gICAgICAgIGlmIChhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZG9lc1NlcnZlclN1cHBvcnRTZXBhcmF0ZUFkZEFuZEJpbmQoKSkge1xuICAgICAgICAgICAgLy8gRm9yIHNlcGFyYXRlIGJpbmQsIHJlcXVlc3QgYSB0b2tlbiBkaXJlY3RseSBmcm9tIHRoZSBJUy5cbiAgICAgICAgICAgIGNvbnN0IGF1dGhDbGllbnQgPSBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KCk7XG4gICAgICAgICAgICBjb25zdCBpZGVudGl0eUFjY2Vzc1Rva2VuID0gYXdhaXQgYXV0aENsaWVudC5nZXRBY2Nlc3NUb2tlbigpO1xuICAgICAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZXF1ZXN0RW1haWxUb2tlbihcbiAgICAgICAgICAgICAgICBlbWFpbEFkZHJlc3MsIHRoaXMuY2xpZW50U2VjcmV0LCAxLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBpZGVudGl0eUFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlc3Npb25JZCA9IHJlcy5zaWQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gJ01fVEhSRUVQSURfSU5fVVNFJykge1xuICAgICAgICAgICAgICAgICAgICBlcnIubWVzc2FnZSA9IF90KCdUaGlzIGVtYWlsIGFkZHJlc3MgaXMgYWxyZWFkeSBpbiB1c2UnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5odHRwU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gZXJyLm1lc3NhZ2UgKyBgIChTdGF0dXMgJHtlcnIuaHR0cFN0YXR1c30pYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBGb3IgdGFuZ2xlZCBiaW5kLCByZXF1ZXN0IGEgdG9rZW4gdmlhIHRoZSBIUy5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZEVtYWlsQWRkcmVzcyhlbWFpbEFkZHJlc3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0ZW1wdCB0byBhZGQgYSBNU0lTRE4gdGhyZWVwaWQgdG8gdGhlIGhvbWVzZXJ2ZXIuXG4gICAgICogVGhpcyB3aWxsIHRyaWdnZXIgYSBzaWRlLWVmZmVjdCBvZiBzZW5kaW5nIGFuIFNNUyB0byB0aGUgcHJvdmlkZWQgcGhvbmUgbnVtYmVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwaG9uZUNvdW50cnkgVGhlIElTTyAyIGxldHRlciBjb2RlIG9mIHRoZSBjb3VudHJ5IHRvIHJlc29sdmUgcGhvbmVOdW1iZXIgaW5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGhvbmVOdW1iZXIgVGhlIG5hdGlvbmFsIG9yIGludGVybmF0aW9uYWwgZm9ybWF0dGVkIHBob25lIG51bWJlciB0byBhZGRcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHRoZSB0ZXh0IG1lc3NhZ2UgaGFzIGJlZW4gc2VudC4gVGhlbiBjYWxsIGhhdmVNc2lzZG5Ub2tlbigpLlxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRNc2lzZG4ocGhvbmVDb3VudHJ5OiBzdHJpbmcsIHBob25lTnVtYmVyOiBzdHJpbmcpOiBQcm9taXNlPElSZXF1ZXN0TXNpc2RuVG9rZW5SZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlcXVlc3RBZGQzcGlkTXNpc2RuVG9rZW4oXG4gICAgICAgICAgICBwaG9uZUNvdW50cnksIHBob25lTnVtYmVyLCB0aGlzLmNsaWVudFNlY3JldCwgMSxcbiAgICAgICAgKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbklkID0gcmVzLnNpZDtcbiAgICAgICAgICAgIHRoaXMuc3VibWl0VXJsID0gcmVzLnN1Ym1pdF91cmw7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gJ01fVEhSRUVQSURfSU5fVVNFJykge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gX3QoJ1RoaXMgcGhvbmUgbnVtYmVyIGlzIGFscmVhZHkgaW4gdXNlJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5odHRwU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBlcnIubWVzc2FnZSArIGAgKFN0YXR1cyAke2Vyci5odHRwU3RhdHVzfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRlbXB0IHRvIGJpbmQgYSBNU0lTRE4gdGhyZWVwaWQgb24gdGhlIGlkZW50aXR5IHNlcnZlciB2aWEgdGhlIGhvbWVzZXJ2ZXIuXG4gICAgICogVGhpcyB3aWxsIHRyaWdnZXIgYSBzaWRlLWVmZmVjdCBvZiBzZW5kaW5nIGFuIFNNUyB0byB0aGUgcHJvdmlkZWQgcGhvbmUgbnVtYmVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwaG9uZUNvdW50cnkgVGhlIElTTyAyIGxldHRlciBjb2RlIG9mIHRoZSBjb3VudHJ5IHRvIHJlc29sdmUgcGhvbmVOdW1iZXIgaW5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGhvbmVOdW1iZXIgVGhlIG5hdGlvbmFsIG9yIGludGVybmF0aW9uYWwgZm9ybWF0dGVkIHBob25lIG51bWJlciB0byBhZGRcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHRoZSB0ZXh0IG1lc3NhZ2UgaGFzIGJlZW4gc2VudC4gVGhlbiBjYWxsIGhhdmVNc2lzZG5Ub2tlbigpLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBiaW5kTXNpc2RuKHBob25lQ291bnRyeTogc3RyaW5nLCBwaG9uZU51bWJlcjogc3RyaW5nKTogUHJvbWlzZTxJUmVxdWVzdE1zaXNkblRva2VuUmVzcG9uc2U+IHtcbiAgICAgICAgdGhpcy5iaW5kID0gdHJ1ZTtcbiAgICAgICAgaWYgKGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCgpKSB7XG4gICAgICAgICAgICAvLyBGb3Igc2VwYXJhdGUgYmluZCwgcmVxdWVzdCBhIHRva2VuIGRpcmVjdGx5IGZyb20gdGhlIElTLlxuICAgICAgICAgICAgY29uc3QgYXV0aENsaWVudCA9IG5ldyBJZGVudGl0eUF1dGhDbGllbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IGlkZW50aXR5QWNjZXNzVG9rZW4gPSBhd2FpdCBhdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKCk7XG4gICAgICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlcXVlc3RNc2lzZG5Ub2tlbihcbiAgICAgICAgICAgICAgICBwaG9uZUNvdW50cnksIHBob25lTnVtYmVyLCB0aGlzLmNsaWVudFNlY3JldCwgMSxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgaWRlbnRpdHlBY2Nlc3NUb2tlbixcbiAgICAgICAgICAgICkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXNzaW9uSWQgPSByZXMuc2lkO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgPT09ICdNX1RIUkVFUElEX0lOX1VTRScpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBfdCgnVGhpcyBwaG9uZSBudW1iZXIgaXMgYWxyZWFkeSBpbiB1c2UnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5odHRwU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gZXJyLm1lc3NhZ2UgKyBgIChTdGF0dXMgJHtlcnIuaHR0cFN0YXR1c30pYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBGb3IgdGFuZ2xlZCBiaW5kLCByZXF1ZXN0IGEgdG9rZW4gdmlhIHRoZSBIUy5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZE1zaXNkbihwaG9uZUNvdW50cnksIHBob25lTnVtYmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZW1haWwgbGluayBoYXMgYmVlbiBjbGlja2VkIGJ5IGF0dGVtcHRpbmcgdG8gYWRkIHRoZSB0aHJlZXBpZFxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIGlmIHRoZSBlbWFpbCBhZGRyZXNzIHdhcyBhZGRlZC4gUmVqZWN0cyB3aXRoIGFuIG9iamVjdFxuICAgICAqIHdpdGggYSBcIm1lc3NhZ2VcIiBwcm9wZXJ0eSB3aGljaCBjb250YWlucyBhIGh1bWFuLXJlYWRhYmxlIG1lc3NhZ2UgZGV0YWlsaW5nIHdoeVxuICAgICAqIHRoZSByZXF1ZXN0IGZhaWxlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgY2hlY2tFbWFpbExpbmtDbGlja2VkKCk6IFByb21pc2U8YW55W10+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZG9lc1NlcnZlclN1cHBvcnRTZXBhcmF0ZUFkZEFuZEJpbmQoKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXV0aENsaWVudCA9IG5ldyBJZGVudGl0eUF1dGhDbGllbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWRlbnRpdHlBY2Nlc3NUb2tlbiA9IGF3YWl0IGF1dGhDbGllbnQuZ2V0QWNjZXNzVG9rZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmJpbmRUaHJlZVBpZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaWQ6IHRoaXMuc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50X3NlY3JldDogdGhpcy5jbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZF9zZXJ2ZXI6IGdldElkU2VydmVyRG9tYWluKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBpZF9hY2Nlc3NfdG9rZW46IGlkZW50aXR5QWNjZXNzVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1ha2VBZGRUaHJlZXBpZE9ubHlSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzcGVjIGhhcyBhbHdheXMgcmVxdWlyZWQgdGhpcyB0byB1c2UgVUkgYXV0aCBidXQgc3luYXBzZSBicmllZmx5XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbXBsZW1lbnRlZCBpdCB3aXRob3V0LCBzbyB0aGlzIG1heSBqdXN0IHN1Y2NlZWQgYW5kIHRoYXQncyBPSy5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUuaHR0cFN0YXR1cyAhPT0gNDAxIHx8ICFlLmRhdGEgfHwgIWUuZGF0YS5mbG93cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRvZXNuJ3QgbG9vayBsaWtlIGFuIGludGVyYWN0aXZlLWF1dGggZmFpbHVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpYWxvZ0Flc3RoZXRpY3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5QSEFTRV9QUkVBVVRIXToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVc2UgU2luZ2xlIFNpZ24gT24gdG8gY29udGludWVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IF90KFwiQ29uZmlybSBhZGRpbmcgdGhpcyBlbWFpbCBhZGRyZXNzIGJ5IHVzaW5nIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU2luZ2xlIFNpZ24gT24gdG8gcHJvdmUgeW91ciBpZGVudGl0eS5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlVGV4dDogX3QoXCJTaW5nbGUgU2lnbiBPblwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcInByaW1hcnlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEhdOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkNvbmZpcm0gYWRkaW5nIGVtYWlsXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBfdChcIkNsaWNrIHRoZSBidXR0b24gYmVsb3cgdG8gY29uZmlybSBhZGRpbmcgdGhpcyBlbWFpbCBhZGRyZXNzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIkNvbmZpcm1cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlS2luZDogXCJwcmltYXJ5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2coSW50ZXJhY3RpdmVBdXRoRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQWRkIEVtYWlsIEFkZHJlc3NcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnRQZWcuZ2V0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0aERhdGE6IGUuZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWtlUmVxdWVzdDogdGhpcy5tYWtlQWRkVGhyZWVwaWRPbmx5UmVxdWVzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZXN0aGV0aWNzRm9yU3RhZ2VQaGFzZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5MT0dJTl9UWVBFXTogZGlhbG9nQWVzdGhldGljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5VTlNUQUJMRV9MT0dJTl9UWVBFXTogZGlhbG9nQWVzdGhldGljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmluaXNoZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5hZGRUaHJlZVBpZCh7XG4gICAgICAgICAgICAgICAgICAgIHNpZDogdGhpcy5zZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IHRoaXMuY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgICAgICBpZF9zZXJ2ZXI6IGdldElkU2VydmVyRG9tYWluKCksXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5iaW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyLmh0dHBTdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gX3QoJ0ZhaWxlZCB0byB2ZXJpZnkgZW1haWwgYWRkcmVzczogbWFrZSBzdXJlIHlvdSBjbGlja2VkIHRoZSBsaW5rIGluIHRoZSBlbWFpbCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIuaHR0cFN0YXR1cykge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlICs9IGAgKFN0YXR1cyAke2Vyci5odHRwU3RhdHVzfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHt7dHlwZTogc3RyaW5nLCBzZXNzaW9uPzogc3RyaW5nfX0gYXV0aCBVSSBhdXRoIG9iamVjdFxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0Pn0gUmVzcG9uc2UgZnJvbSAvM3BpZC9hZGQgY2FsbCAoaW4gY3VycmVudCBzcGVjLCBhbiBlbXB0eSBvYmplY3QpXG4gICAgICovXG4gICAgcHJpdmF0ZSBtYWtlQWRkVGhyZWVwaWRPbmx5UmVxdWVzdCA9IChhdXRoPzoge3R5cGU6IHN0cmluZywgc2Vzc2lvbj86IHN0cmluZ30pOiBQcm9taXNlPHt9PiA9PiB7XG4gICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuYWRkVGhyZWVQaWRPbmx5KHtcbiAgICAgICAgICAgIHNpZDogdGhpcy5zZXNzaW9uSWQsXG4gICAgICAgICAgICBjbGllbnRfc2VjcmV0OiB0aGlzLmNsaWVudFNlY3JldCxcbiAgICAgICAgICAgIGF1dGgsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUYWtlcyBhIHBob25lIG51bWJlciB2ZXJpZmljYXRpb24gY29kZSBhcyBlbnRlcmVkIGJ5IHRoZSB1c2VyIGFuZCB2YWxpZGF0ZXNcbiAgICAgKiBpdCB3aXRoIHRoZSBpZGVudGl0eSBzZXJ2ZXIsIHRoZW4gaWYgc3VjY2Vzc2Z1bCwgYWRkcyB0aGUgcGhvbmUgbnVtYmVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtc2lzZG5Ub2tlbiBwaG9uZSBudW1iZXIgdmVyaWZpY2F0aW9uIGNvZGUgYXMgZW50ZXJlZCBieSB0aGUgdXNlclxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIGlmIHRoZSBwaG9uZSBudW1iZXIgd2FzIGFkZGVkLiBSZWplY3RzIHdpdGggYW4gb2JqZWN0XG4gICAgICogd2l0aCBhIFwibWVzc2FnZVwiIHByb3BlcnR5IHdoaWNoIGNvbnRhaW5zIGEgaHVtYW4tcmVhZGFibGUgbWVzc2FnZSBkZXRhaWxpbmcgd2h5XG4gICAgICogdGhlIHJlcXVlc3QgZmFpbGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBoYXZlTXNpc2RuVG9rZW4obXNpc2RuVG9rZW46IHN0cmluZyk6IFByb21pc2U8YW55W10+IHtcbiAgICAgICAgY29uc3QgYXV0aENsaWVudCA9IG5ldyBJZGVudGl0eUF1dGhDbGllbnQoKTtcbiAgICAgICAgY29uc3Qgc3VwcG9ydHNTZXBhcmF0ZUFkZEFuZEJpbmQgPVxuICAgICAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmRvZXNTZXJ2ZXJTdXBwb3J0U2VwYXJhdGVBZGRBbmRCaW5kKCk7XG5cbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgaWYgKHRoaXMuc3VibWl0VXJsKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3VibWl0TXNpc2RuVG9rZW5PdGhlclVybChcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1pdFVybCxcbiAgICAgICAgICAgICAgICB0aGlzLnNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICBtc2lzZG5Ub2tlbixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5iaW5kIHx8ICFzdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnN1Ym1pdE1zaXNkblRva2VuKFxuICAgICAgICAgICAgICAgIHRoaXMuc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgIG1zaXNkblRva2VuLFxuICAgICAgICAgICAgICAgIGF3YWl0IGF1dGhDbGllbnQuZ2V0QWNjZXNzVG9rZW4oKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYWRkIC8gYmluZCB3aXRoIE1TSVNETiBmbG93IGlzIG1pc2NvbmZpZ3VyZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc3VsdC5lcnJjb2RlKSB7XG4gICAgICAgICAgICB0aHJvdyByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3VwcG9ydHNTZXBhcmF0ZUFkZEFuZEJpbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJpbmQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuYmluZFRocmVlUGlkKHtcbiAgICAgICAgICAgICAgICAgICAgc2lkOiB0aGlzLnNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X3NlY3JldDogdGhpcy5jbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgICAgIGlkX3NlcnZlcjogZ2V0SWRTZXJ2ZXJEb21haW4oKSxcbiAgICAgICAgICAgICAgICAgICAgaWRfYWNjZXNzX3Rva2VuOiBhd2FpdCBhdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWFrZUFkZFRocmVlcGlkT25seVJlcXVlc3QoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgc3BlYyBoYXMgYWx3YXlzIHJlcXVpcmVkIHRoaXMgdG8gdXNlIFVJIGF1dGggYnV0IHN5bmFwc2UgYnJpZWZseVxuICAgICAgICAgICAgICAgICAgICAvLyBpbXBsZW1lbnRlZCBpdCB3aXRob3V0LCBzbyB0aGlzIG1heSBqdXN0IHN1Y2NlZWQgYW5kIHRoYXQncyBPSy5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuaHR0cFN0YXR1cyAhPT0gNDAxIHx8ICFlLmRhdGEgfHwgIWUuZGF0YS5mbG93cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG9lc24ndCBsb29rIGxpa2UgYW4gaW50ZXJhY3RpdmUtYXV0aCBmYWlsdXJlXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlhbG9nQWVzdGhldGljcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUFJFQVVUSF06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVc2UgU2luZ2xlIFNpZ24gT24gdG8gY29udGludWVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogX3QoXCJDb25maXJtIGFkZGluZyB0aGlzIHBob25lIG51bWJlciBieSB1c2luZyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU2luZ2xlIFNpZ24gT24gdG8gcHJvdmUgeW91ciBpZGVudGl0eS5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIlNpbmdsZSBTaWduIE9uXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlS2luZDogXCJwcmltYXJ5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5QSEFTRV9QT1NUQVVUSF06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJDb25maXJtIGFkZGluZyBwaG9uZSBudW1iZXJcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogX3QoXCJDbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIGNvbmZpcm0gYWRkaW5nIHRoaXMgcGhvbmUgbnVtYmVyLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVRleHQ6IF90KFwiQ29uZmlybVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZUtpbmQ6IFwicHJpbWFyeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKEludGVyYWN0aXZlQXV0aERpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQWRkIFBob25lIE51bWJlclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50UGVnLmdldCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aERhdGE6IGUuZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ha2VSZXF1ZXN0OiB0aGlzLm1ha2VBZGRUaHJlZXBpZE9ubHlSZXF1ZXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWVzdGhldGljc0ZvclN0YWdlUGhhc2VzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5MT0dJTl9UWVBFXTogZGlhbG9nQWVzdGhldGljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbU1NPQXV0aEVudHJ5LlVOU1RBQkxFX0xPR0lOX1RZUEVdOiBkaWFsb2dBZXN0aGV0aWNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaW5pc2hlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuYWRkVGhyZWVQaWQoe1xuICAgICAgICAgICAgICAgIHNpZDogdGhpcy5zZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgY2xpZW50X3NlY3JldDogdGhpcy5jbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgaWRfc2VydmVyOiBnZXRJZFNlcnZlckRvbWFpbigpLFxuICAgICAgICAg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