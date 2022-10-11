"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _languageHandler = require("./languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 - 2022 The Matrix.org Foundation C.I.C.

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
 * Allows a user to reset their password on a homeserver.
 *
 * This involves getting an email token from the identity server to "prove" that
 * the client owns the given email address, which is then passed to the password
 * API on the homeserver in question with the new password.
 */
class PasswordReset {
  /**
   * Configure the endpoints for password resetting.
   * @param {string} homeserverUrl The URL to the HS which has the account to reset.
   * @param {string} identityUrl The URL to the IS which has linked the email -> mxid mapping.
   */
  constructor(homeserverUrl, identityUrl) {
    (0, _defineProperty2.default)(this, "client", void 0);
    (0, _defineProperty2.default)(this, "clientSecret", void 0);
    (0, _defineProperty2.default)(this, "password", void 0);
    (0, _defineProperty2.default)(this, "sessionId", void 0);
    (0, _defineProperty2.default)(this, "logoutDevices", void 0);
    this.client = (0, _matrix.createClient)({
      baseUrl: homeserverUrl,
      idBaseUrl: identityUrl
    });
    this.clientSecret = this.client.generateClientSecret();
  }
  /**
   * Attempt to reset the user's password. This will trigger a side-effect of
   * sending an email to the provided email address.
   * @param {string} emailAddress The email address
   * @param {string} newPassword The new password for the account.
   * @param {boolean} logoutDevices Should all devices be signed out after the reset? Defaults to `true`.
   * @return {Promise} Resolves when the email has been sent. Then call checkEmailLinkClicked().
   */


  resetPassword(emailAddress, newPassword) {
    let logoutDevices = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    this.password = newPassword;
    this.logoutDevices = logoutDevices;
    return this.client.requestPasswordEmailToken(emailAddress, this.clientSecret, 1).then(res => {
      this.sessionId = res.sid;
      return res;
    }, function (err) {
      if (err.errcode === 'M_THREEPID_NOT_FOUND') {
        err.message = (0, _languageHandler._t)('This email address was not found');
      } else if (err.httpStatus) {
        err.message = err.message + ` (Status ${err.httpStatus})`;
      }

      throw err;
    });
  }
  /**
   * Checks if the email link has been clicked by attempting to change the password
   * for the mxid linked to the email.
   * @return {Promise} Resolves if the password was reset. Rejects with an object
   * with a "message" property which contains a human-readable message detailing why
   * the reset failed, e.g. "There is no mapped matrix user ID for the given email address".
   */


  async checkEmailLinkClicked() {
    const creds = {
      sid: this.sessionId,
      client_secret: this.clientSecret
    };

    try {
      await this.client.setPassword({
        // Note: Though this sounds like a login type for identity servers only, it
        // has a dual purpose of being used for homeservers too.
        type: "m.login.email.identity",
        // TODO: Remove `threepid_creds` once servers support proper UIA
        // See https://github.com/matrix-org/synapse/issues/5665
        // See https://github.com/matrix-org/matrix-doc/issues/2220
        threepid_creds: creds,
        threepidCreds: creds
      }, this.password, this.logoutDevices);
    } catch (err) {
      if (err.httpStatus === 401) {
        err.message = (0, _languageHandler._t)('Failed to verify email address: make sure you clicked the link in the email');
      } else if (err.httpStatus === 404) {
        err.message = (0, _languageHandler._t)('Your email address does not appear to be associated with a Matrix ID on this Homeserver.');
      } else if (err.httpStatus) {
        err.message += ` (Status ${err.httpStatus})`;
      }

      throw err;
    }
  }

}

exports.default = PasswordReset;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXNzd29yZFJlc2V0IiwiY29uc3RydWN0b3IiLCJob21lc2VydmVyVXJsIiwiaWRlbnRpdHlVcmwiLCJjbGllbnQiLCJjcmVhdGVDbGllbnQiLCJiYXNlVXJsIiwiaWRCYXNlVXJsIiwiY2xpZW50U2VjcmV0IiwiZ2VuZXJhdGVDbGllbnRTZWNyZXQiLCJyZXNldFBhc3N3b3JkIiwiZW1haWxBZGRyZXNzIiwibmV3UGFzc3dvcmQiLCJsb2dvdXREZXZpY2VzIiwicGFzc3dvcmQiLCJyZXF1ZXN0UGFzc3dvcmRFbWFpbFRva2VuIiwidGhlbiIsInJlcyIsInNlc3Npb25JZCIsInNpZCIsImVyciIsImVycmNvZGUiLCJtZXNzYWdlIiwiX3QiLCJodHRwU3RhdHVzIiwiY2hlY2tFbWFpbExpbmtDbGlja2VkIiwiY3JlZHMiLCJjbGllbnRfc2VjcmV0Iiwic2V0UGFzc3dvcmQiLCJ0eXBlIiwidGhyZWVwaWRfY3JlZHMiLCJ0aHJlZXBpZENyZWRzIl0sInNvdXJjZXMiOlsiLi4vc3JjL1Bhc3N3b3JkUmVzZXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQsIElSZXF1ZXN0VG9rZW5SZXNwb25zZSwgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5cbi8qKlxuICogQWxsb3dzIGEgdXNlciB0byByZXNldCB0aGVpciBwYXNzd29yZCBvbiBhIGhvbWVzZXJ2ZXIuXG4gKlxuICogVGhpcyBpbnZvbHZlcyBnZXR0aW5nIGFuIGVtYWlsIHRva2VuIGZyb20gdGhlIGlkZW50aXR5IHNlcnZlciB0byBcInByb3ZlXCIgdGhhdFxuICogdGhlIGNsaWVudCBvd25zIHRoZSBnaXZlbiBlbWFpbCBhZGRyZXNzLCB3aGljaCBpcyB0aGVuIHBhc3NlZCB0byB0aGUgcGFzc3dvcmRcbiAqIEFQSSBvbiB0aGUgaG9tZXNlcnZlciBpbiBxdWVzdGlvbiB3aXRoIHRoZSBuZXcgcGFzc3dvcmQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhc3N3b3JkUmVzZXQge1xuICAgIHByaXZhdGUgY2xpZW50OiBNYXRyaXhDbGllbnQ7XG4gICAgcHJpdmF0ZSBjbGllbnRTZWNyZXQ6IHN0cmluZztcbiAgICBwcml2YXRlIHBhc3N3b3JkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBzZXNzaW9uSWQ6IHN0cmluZztcbiAgICBwcml2YXRlIGxvZ291dERldmljZXM6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgdGhlIGVuZHBvaW50cyBmb3IgcGFzc3dvcmQgcmVzZXR0aW5nLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBob21lc2VydmVyVXJsIFRoZSBVUkwgdG8gdGhlIEhTIHdoaWNoIGhhcyB0aGUgYWNjb3VudCB0byByZXNldC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWRlbnRpdHlVcmwgVGhlIFVSTCB0byB0aGUgSVMgd2hpY2ggaGFzIGxpbmtlZCB0aGUgZW1haWwgLT4gbXhpZCBtYXBwaW5nLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGhvbWVzZXJ2ZXJVcmw6IHN0cmluZywgaWRlbnRpdHlVcmw6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNsaWVudCA9IGNyZWF0ZUNsaWVudCh7XG4gICAgICAgICAgICBiYXNlVXJsOiBob21lc2VydmVyVXJsLFxuICAgICAgICAgICAgaWRCYXNlVXJsOiBpZGVudGl0eVVybCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xpZW50U2VjcmV0ID0gdGhpcy5jbGllbnQuZ2VuZXJhdGVDbGllbnRTZWNyZXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRlbXB0IHRvIHJlc2V0IHRoZSB1c2VyJ3MgcGFzc3dvcmQuIFRoaXMgd2lsbCB0cmlnZ2VyIGEgc2lkZS1lZmZlY3Qgb2ZcbiAgICAgKiBzZW5kaW5nIGFuIGVtYWlsIHRvIHRoZSBwcm92aWRlZCBlbWFpbCBhZGRyZXNzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbWFpbEFkZHJlc3MgVGhlIGVtYWlsIGFkZHJlc3NcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3UGFzc3dvcmQgVGhlIG5ldyBwYXNzd29yZCBmb3IgdGhlIGFjY291bnQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBsb2dvdXREZXZpY2VzIFNob3VsZCBhbGwgZGV2aWNlcyBiZSBzaWduZWQgb3V0IGFmdGVyIHRoZSByZXNldD8gRGVmYXVsdHMgdG8gYHRydWVgLlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIGVtYWlsIGhhcyBiZWVuIHNlbnQuIFRoZW4gY2FsbCBjaGVja0VtYWlsTGlua0NsaWNrZWQoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVzZXRQYXNzd29yZChcbiAgICAgICAgZW1haWxBZGRyZXNzOiBzdHJpbmcsXG4gICAgICAgIG5ld1Bhc3N3b3JkOiBzdHJpbmcsXG4gICAgICAgIGxvZ291dERldmljZXMgPSB0cnVlLFxuICAgICk6IFByb21pc2U8SVJlcXVlc3RUb2tlblJlc3BvbnNlPiB7XG4gICAgICAgIHRoaXMucGFzc3dvcmQgPSBuZXdQYXNzd29yZDtcbiAgICAgICAgdGhpcy5sb2dvdXREZXZpY2VzID0gbG9nb3V0RGV2aWNlcztcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpZW50LnJlcXVlc3RQYXNzd29yZEVtYWlsVG9rZW4oZW1haWxBZGRyZXNzLCB0aGlzLmNsaWVudFNlY3JldCwgMSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb25JZCA9IHJlcy5zaWQ7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gJ01fVEhSRUVQSURfTk9UX0ZPVU5EJykge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gX3QoJ1RoaXMgZW1haWwgYWRkcmVzcyB3YXMgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5odHRwU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBlcnIubWVzc2FnZSArIGAgKFN0YXR1cyAke2Vyci5odHRwU3RhdHVzfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGVtYWlsIGxpbmsgaGFzIGJlZW4gY2xpY2tlZCBieSBhdHRlbXB0aW5nIHRvIGNoYW5nZSB0aGUgcGFzc3dvcmRcbiAgICAgKiBmb3IgdGhlIG14aWQgbGlua2VkIHRvIHRoZSBlbWFpbC5cbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyBpZiB0aGUgcGFzc3dvcmQgd2FzIHJlc2V0LiBSZWplY3RzIHdpdGggYW4gb2JqZWN0XG4gICAgICogd2l0aCBhIFwibWVzc2FnZVwiIHByb3BlcnR5IHdoaWNoIGNvbnRhaW5zIGEgaHVtYW4tcmVhZGFibGUgbWVzc2FnZSBkZXRhaWxpbmcgd2h5XG4gICAgICogdGhlIHJlc2V0IGZhaWxlZCwgZS5nLiBcIlRoZXJlIGlzIG5vIG1hcHBlZCBtYXRyaXggdXNlciBJRCBmb3IgdGhlIGdpdmVuIGVtYWlsIGFkZHJlc3NcIi5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgY2hlY2tFbWFpbExpbmtDbGlja2VkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjcmVkcyA9IHtcbiAgICAgICAgICAgIHNpZDogdGhpcy5zZXNzaW9uSWQsXG4gICAgICAgICAgICBjbGllbnRfc2VjcmV0OiB0aGlzLmNsaWVudFNlY3JldCxcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbGllbnQuc2V0UGFzc3dvcmQoe1xuICAgICAgICAgICAgICAgIC8vIE5vdGU6IFRob3VnaCB0aGlzIHNvdW5kcyBsaWtlIGEgbG9naW4gdHlwZSBmb3IgaWRlbnRpdHkgc2VydmVycyBvbmx5LCBpdFxuICAgICAgICAgICAgICAgIC8vIGhhcyBhIGR1YWwgcHVycG9zZSBvZiBiZWluZyB1c2VkIGZvciBob21lc2VydmVycyB0b28uXG4gICAgICAgICAgICAgICAgdHlwZTogXCJtLmxvZ2luLmVtYWlsLmlkZW50aXR5XCIsXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGB0aHJlZXBpZF9jcmVkc2Agb25jZSBzZXJ2ZXJzIHN1cHBvcnQgcHJvcGVyIFVJQVxuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy81NjY1XG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvaXNzdWVzLzIyMjBcbiAgICAgICAgICAgICAgICB0aHJlZXBpZF9jcmVkczogY3JlZHMsXG4gICAgICAgICAgICAgICAgdGhyZWVwaWRDcmVkczogY3JlZHMsXG4gICAgICAgICAgICB9LCB0aGlzLnBhc3N3b3JkLCB0aGlzLmxvZ291dERldmljZXMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuaHR0cFN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBfdCgnRmFpbGVkIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzOiBtYWtlIHN1cmUgeW91IGNsaWNrZWQgdGhlIGxpbmsgaW4gdGhlIGVtYWlsJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5odHRwU3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICBlcnIubWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgICAgIF90KCdZb3VyIGVtYWlsIGFkZHJlc3MgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCBhIE1hdHJpeCBJRCBvbiB0aGlzIEhvbWVzZXJ2ZXIuJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5odHRwU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgKz0gYCAoU3RhdHVzICR7ZXJyLmh0dHBTdGF0dXN9KWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBbkJBO0FBQ0E7QUFDQTtB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