"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _browserRequest = _interopRequireDefault(require("browser-request"));

var _serviceTypes = require("matrix-js-sdk/src/service-types");

var _logger = require("matrix-js-sdk/src/logger");

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _Terms = require("./Terms");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

/*
Copyright 2016, 2019, 2021 The Matrix.org Foundation C.I.C.

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
// The version of the integration manager API we're intending to work with
const imApiVersion = "1.1"; // TODO: Generify the name of this class and all components within - it's not just for Scalar.

class ScalarAuthClient {
  constructor(apiUrl, uiUrl) {
    this.apiUrl = apiUrl;
    this.uiUrl = uiUrl;
    (0, _defineProperty2.default)(this, "scalarToken", void 0);
    (0, _defineProperty2.default)(this, "termsInteractionCallback", void 0);
    (0, _defineProperty2.default)(this, "isDefaultManager", void 0);
    this.scalarToken = null; // `undefined` to allow `startTermsFlow` to fallback to a default
    // callback if this is unset.

    this.termsInteractionCallback = undefined; // We try and store the token on a per-manager basis, but need a fallback
    // for the default manager.

    const configApiUrl = _SdkConfig.default.get("integrations_rest_url");

    const configUiUrl = _SdkConfig.default.get("integrations_ui_url");

    this.isDefaultManager = apiUrl === configApiUrl && configUiUrl === uiUrl;
  }

  writeTokenToStore() {
    window.localStorage.setItem("mx_scalar_token_at_" + this.apiUrl, this.scalarToken);

    if (this.isDefaultManager) {
      // We remove the old token from storage to migrate upwards. This is safe
      // to do because even if the user switches to /app when this is on /develop
      // they'll at worst register for a new token.
      window.localStorage.removeItem("mx_scalar_token"); // no-op when not present
    }
  }

  readTokenFromStore() {
    let token = window.localStorage.getItem("mx_scalar_token_at_" + this.apiUrl);

    if (!token && this.isDefaultManager) {
      token = window.localStorage.getItem("mx_scalar_token");
    }

    return token;
  }

  readToken() {
    if (this.scalarToken) return this.scalarToken;
    return this.readTokenFromStore();
  }

  setTermsInteractionCallback(callback) {
    this.termsInteractionCallback = callback;
  }

  connect() {
    return this.getScalarToken().then(tok => {
      this.scalarToken = tok;
    });
  }

  hasCredentials() {
    return this.scalarToken != null; // undef or null
  } // Returns a promise that resolves to a scalar_token string


  getScalarToken() {
    const token = this.readToken();

    if (!token) {
      return this.registerForToken();
    } else {
      return this.checkToken(token).catch(e => {
        if (e instanceof _Terms.TermsNotSignedError) {
          // retrying won't help this
          throw e;
        }

        return this.registerForToken();
      });
    }
  }

  getAccountName(token) {
    const url = this.apiUrl + "/account";
    return new Promise(function (resolve, reject) {
      (0, _browserRequest.default)({
        method: "GET",
        uri: url,
        qs: {
          scalar_token: token,
          v: imApiVersion
        },
        json: true
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (body && body.errcode === 'M_TERMS_NOT_SIGNED') {
          reject(new _Terms.TermsNotSignedError());
        } else if (response.statusCode / 100 !== 2) {
          reject(body);
        } else if (!body || !body.user_id) {
          reject(new Error("Missing user_id in response"));
        } else {
          resolve(body.user_id);
        }
      });
    });
  }

  checkToken(token) {
    return this.getAccountName(token).then(userId => {
      const me = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

      if (userId !== me) {
        throw new Error("Scalar token is owned by someone else: " + me);
      }

      return token;
    }).catch(e => {
      if (e instanceof _Terms.TermsNotSignedError) {
        _logger.logger.log("Integration manager requires new terms to be agreed to"); // The terms endpoints are new and so live on standard _matrix prefixes,
        // but IM rest urls are currently configured with paths, so remove the
        // path from the base URL before passing it to the js-sdk
        // We continue to use the full URL for the calls done by
        // matrix-react-sdk, but the standard terms API called
        // by the js-sdk lives on the standard _matrix path. This means we
        // don't support running IMs on a non-root path, but it's the only
        // realistic way of transitioning to _matrix paths since configs in
        // the wild contain bits of the API path.
        // Once we've fully transitioned to _matrix URLs, we can give people
        // a grace period to update their configs, then use the rest url as
        // a regular base url.


        const parsedImRestUrl = _url.default.parse(this.apiUrl);

        parsedImRestUrl.path = '';
        parsedImRestUrl.pathname = '';
        return (0, _Terms.startTermsFlow)([new _Terms.Service(_serviceTypes.SERVICE_TYPES.IM, _url.default.format(parsedImRestUrl), token)], this.termsInteractionCallback).then(() => {
          return token;
        });
      } else {
        throw e;
      }
    });
  }

  registerForToken() {
    // Get openid bearer token from the HS as the first part of our dance
    return _MatrixClientPeg.MatrixClientPeg.get().getOpenIdToken().then(tokenObject => {
      // Now we can send that to scalar and exchange it for a scalar token
      return this.exchangeForScalarToken(tokenObject);
    }).then(token => {
      // Validate it (this mostly checks to see if the IM needs us to agree to some terms)
      return this.checkToken(token);
    }).then(token => {
      this.scalarToken = token;
      this.writeTokenToStore();
      return token;
    });
  }

  exchangeForScalarToken(openidTokenObject) {
    const scalarRestUrl = this.apiUrl;
    return new Promise(function (resolve, reject) {
      (0, _browserRequest.default)({
        method: 'POST',
        uri: scalarRestUrl + '/register',
        qs: {
          v: imApiVersion
        },
        body: openidTokenObject,
        json: true
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode / 100 !== 2) {
          reject(new Error(`Scalar request failed: ${response.statusCode}`));
        } else if (!body || !body.scalar_token) {
          reject(new Error("Missing scalar_token in response"));
        } else {
          resolve(body.scalar_token);
        }
      });
    });
  }

  getScalarPageTitle(url) {
    let scalarPageLookupUrl = this.apiUrl + '/widgets/title_lookup';
    scalarPageLookupUrl = this.getStarterLink(scalarPageLookupUrl);
    scalarPageLookupUrl += '&curl=' + encodeURIComponent(url);
    return new Promise(function (resolve, reject) {
      (0, _browserRequest.default)({
        method: 'GET',
        uri: scalarPageLookupUrl,
        json: true
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode / 100 !== 2) {
          reject(new Error(`Scalar request failed: ${response.statusCode}`));
        } else if (!body) {
          reject(new Error("Missing page title in response"));
        } else {
          let title = "";

          if (body.page_title_cache_item && body.page_title_cache_item.cached_title) {
            title = body.page_title_cache_item.cached_title;
          }

          resolve(title);
        }
      });
    });
  }
  /**
   * Mark all assets associated with the specified widget as "disabled" in the
   * integration manager database.
   * This can be useful to temporarily prevent purchased assets from being displayed.
   * @param  {WidgetType} widgetType The Widget Type to disable assets for
   * @param  {string} widgetId   The widget ID to disable assets for
   * @return {Promise}           Resolves on completion
   */


  disableWidgetAssets(widgetType, widgetId) {
    let url = this.apiUrl + '/widgets/set_assets_state';
    url = this.getStarterLink(url);
    return new Promise((resolve, reject) => {
      (0, _browserRequest.default)({
        method: 'GET',
        // XXX: Actions shouldn't be GET requests
        uri: url,
        json: true,
        qs: {
          'widget_type': widgetType.preferred,
          'widget_id': widgetId,
          'state': 'disable'
        }
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode / 100 !== 2) {
          reject(new Error(`Scalar request failed: ${response.statusCode}`));
        } else if (!body) {
          reject(new Error("Failed to set widget assets state"));
        } else {
          resolve();
        }
      });
    });
  }

  getScalarInterfaceUrlForRoom(room, screen, id) {
    const roomId = room.roomId;
    const roomName = room.name;
    let url = this.uiUrl;
    url += "?scalar_token=" + encodeURIComponent(this.scalarToken);
    url += "&room_id=" + encodeURIComponent(roomId);
    url += "&room_name=" + encodeURIComponent(roomName);
    url += "&theme=" + encodeURIComponent(_SettingsStore.default.getValue("theme"));

    if (id) {
      url += '&integ_id=' + encodeURIComponent(id);
    }

    if (screen) {
      url += '&screen=' + encodeURIComponent(screen);
    }

    return url;
  }

  getStarterLink(starterLinkUrl) {
    return starterLinkUrl + "?scalar_token=" + encodeURIComponent(this.scalarToken);
  }

}

exports.default = ScalarAuthClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbUFwaVZlcnNpb24iLCJTY2FsYXJBdXRoQ2xpZW50IiwiY29uc3RydWN0b3IiLCJhcGlVcmwiLCJ1aVVybCIsInNjYWxhclRva2VuIiwidGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrIiwidW5kZWZpbmVkIiwiY29uZmlnQXBpVXJsIiwiU2RrQ29uZmlnIiwiZ2V0IiwiY29uZmlnVWlVcmwiLCJpc0RlZmF1bHRNYW5hZ2VyIiwid3JpdGVUb2tlblRvU3RvcmUiLCJ3aW5kb3ciLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwicmVtb3ZlSXRlbSIsInJlYWRUb2tlbkZyb21TdG9yZSIsInRva2VuIiwiZ2V0SXRlbSIsInJlYWRUb2tlbiIsInNldFRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjayIsImNhbGxiYWNrIiwiY29ubmVjdCIsImdldFNjYWxhclRva2VuIiwidGhlbiIsInRvayIsImhhc0NyZWRlbnRpYWxzIiwicmVnaXN0ZXJGb3JUb2tlbiIsImNoZWNrVG9rZW4iLCJjYXRjaCIsImUiLCJUZXJtc05vdFNpZ25lZEVycm9yIiwiZ2V0QWNjb3VudE5hbWUiLCJ1cmwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInJlcXVlc3QiLCJtZXRob2QiLCJ1cmkiLCJxcyIsInNjYWxhcl90b2tlbiIsInYiLCJqc29uIiwiZXJyIiwicmVzcG9uc2UiLCJib2R5IiwiZXJyY29kZSIsInN0YXR1c0NvZGUiLCJ1c2VyX2lkIiwiRXJyb3IiLCJ1c2VySWQiLCJtZSIsIk1hdHJpeENsaWVudFBlZyIsImdldFVzZXJJZCIsImxvZ2dlciIsImxvZyIsInBhcnNlZEltUmVzdFVybCIsInBhcnNlIiwicGF0aCIsInBhdGhuYW1lIiwic3RhcnRUZXJtc0Zsb3ciLCJTZXJ2aWNlIiwiU0VSVklDRV9UWVBFUyIsIklNIiwiZm9ybWF0IiwiZ2V0T3BlbklkVG9rZW4iLCJ0b2tlbk9iamVjdCIsImV4Y2hhbmdlRm9yU2NhbGFyVG9rZW4iLCJvcGVuaWRUb2tlbk9iamVjdCIsInNjYWxhclJlc3RVcmwiLCJnZXRTY2FsYXJQYWdlVGl0bGUiLCJzY2FsYXJQYWdlTG9va3VwVXJsIiwiZ2V0U3RhcnRlckxpbmsiLCJlbmNvZGVVUklDb21wb25lbnQiLCJ0aXRsZSIsInBhZ2VfdGl0bGVfY2FjaGVfaXRlbSIsImNhY2hlZF90aXRsZSIsImRpc2FibGVXaWRnZXRBc3NldHMiLCJ3aWRnZXRUeXBlIiwid2lkZ2V0SWQiLCJwcmVmZXJyZWQiLCJnZXRTY2FsYXJJbnRlcmZhY2VVcmxGb3JSb29tIiwicm9vbSIsInNjcmVlbiIsImlkIiwicm9vbUlkIiwicm9vbU5hbWUiLCJuYW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic3RhcnRlckxpbmtVcmwiXSwic291cmNlcyI6WyIuLi9zcmMvU2NhbGFyQXV0aENsaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYsIDIwMTksIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tIFwiYnJvd3Nlci1yZXF1ZXN0XCI7XG5pbXBvcnQgeyBTRVJWSUNFX1RZUEVTIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3NlcnZpY2UtdHlwZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgU2VydmljZSwgc3RhcnRUZXJtc0Zsb3csIFRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjaywgVGVybXNOb3RTaWduZWRFcnJvciB9IGZyb20gJy4vVGVybXMnO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHsgV2lkZ2V0VHlwZSB9IGZyb20gXCIuL3dpZGdldHMvV2lkZ2V0VHlwZVwiO1xuXG4vLyBUaGUgdmVyc2lvbiBvZiB0aGUgaW50ZWdyYXRpb24gbWFuYWdlciBBUEkgd2UncmUgaW50ZW5kaW5nIHRvIHdvcmsgd2l0aFxuY29uc3QgaW1BcGlWZXJzaW9uID0gXCIxLjFcIjtcblxuLy8gVE9ETzogR2VuZXJpZnkgdGhlIG5hbWUgb2YgdGhpcyBjbGFzcyBhbmQgYWxsIGNvbXBvbmVudHMgd2l0aGluIC0gaXQncyBub3QganVzdCBmb3IgU2NhbGFyLlxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2FsYXJBdXRoQ2xpZW50IHtcbiAgICBwcml2YXRlIHNjYWxhclRva2VuOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSB0ZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2s6IFRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjaztcbiAgICBwcml2YXRlIGlzRGVmYXVsdE1hbmFnZXI6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwaVVybDogc3RyaW5nLCBwcml2YXRlIHVpVXJsOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zY2FsYXJUb2tlbiA9IG51bGw7XG4gICAgICAgIC8vIGB1bmRlZmluZWRgIHRvIGFsbG93IGBzdGFydFRlcm1zRmxvd2AgdG8gZmFsbGJhY2sgdG8gYSBkZWZhdWx0XG4gICAgICAgIC8vIGNhbGxiYWNrIGlmIHRoaXMgaXMgdW5zZXQuXG4gICAgICAgIHRoaXMudGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIFdlIHRyeSBhbmQgc3RvcmUgdGhlIHRva2VuIG9uIGEgcGVyLW1hbmFnZXIgYmFzaXMsIGJ1dCBuZWVkIGEgZmFsbGJhY2tcbiAgICAgICAgLy8gZm9yIHRoZSBkZWZhdWx0IG1hbmFnZXIuXG4gICAgICAgIGNvbnN0IGNvbmZpZ0FwaVVybCA9IFNka0NvbmZpZy5nZXQoXCJpbnRlZ3JhdGlvbnNfcmVzdF91cmxcIik7XG4gICAgICAgIGNvbnN0IGNvbmZpZ1VpVXJsID0gU2RrQ29uZmlnLmdldChcImludGVncmF0aW9uc191aV91cmxcIik7XG4gICAgICAgIHRoaXMuaXNEZWZhdWx0TWFuYWdlciA9IGFwaVVybCA9PT0gY29uZmlnQXBpVXJsICYmIGNvbmZpZ1VpVXJsID09PSB1aVVybDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHdyaXRlVG9rZW5Ub1N0b3JlKCkge1xuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9zY2FsYXJfdG9rZW5fYXRfXCIgKyB0aGlzLmFwaVVybCwgdGhpcy5zY2FsYXJUb2tlbik7XG4gICAgICAgIGlmICh0aGlzLmlzRGVmYXVsdE1hbmFnZXIpIHtcbiAgICAgICAgICAgIC8vIFdlIHJlbW92ZSB0aGUgb2xkIHRva2VuIGZyb20gc3RvcmFnZSB0byBtaWdyYXRlIHVwd2FyZHMuIFRoaXMgaXMgc2FmZVxuICAgICAgICAgICAgLy8gdG8gZG8gYmVjYXVzZSBldmVuIGlmIHRoZSB1c2VyIHN3aXRjaGVzIHRvIC9hcHAgd2hlbiB0aGlzIGlzIG9uIC9kZXZlbG9wXG4gICAgICAgICAgICAvLyB0aGV5J2xsIGF0IHdvcnN0IHJlZ2lzdGVyIGZvciBhIG5ldyB0b2tlbi5cbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X3NjYWxhcl90b2tlblwiKTsgLy8gbm8tb3Agd2hlbiBub3QgcHJlc2VudFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWFkVG9rZW5Gcm9tU3RvcmUoKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHRva2VuID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfc2NhbGFyX3Rva2VuX2F0X1wiICsgdGhpcy5hcGlVcmwpO1xuICAgICAgICBpZiAoIXRva2VuICYmIHRoaXMuaXNEZWZhdWx0TWFuYWdlcikge1xuICAgICAgICAgICAgdG9rZW4gPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9zY2FsYXJfdG9rZW5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVhZFRva2VuKCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLnNjYWxhclRva2VuKSByZXR1cm4gdGhpcy5zY2FsYXJUb2tlbjtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZFRva2VuRnJvbVN0b3JlKCk7XG4gICAgfVxuXG4gICAgc2V0VGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMudGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2NhbGFyVG9rZW4oKS50aGVuKCh0b2spID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NhbGFyVG9rZW4gPSB0b2s7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhc0NyZWRlbnRpYWxzKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zY2FsYXJUb2tlbiAhPSBudWxsOyAvLyB1bmRlZiBvciBudWxsXG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHNjYWxhcl90b2tlbiBzdHJpbmdcbiAgICBnZXRTY2FsYXJUb2tlbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRoaXMucmVhZFRva2VuKCk7XG5cbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJGb3JUb2tlbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tUb2tlbih0b2tlbikuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFRlcm1zTm90U2lnbmVkRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0cnlpbmcgd29uJ3QgaGVscCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyRm9yVG9rZW4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRBY2NvdW50TmFtZSh0b2tlbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgdXJsID0gdGhpcy5hcGlVcmwgKyBcIi9hY2NvdW50XCI7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgcmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICAgICAgICAgIHVyaTogdXJsLFxuICAgICAgICAgICAgICAgIHFzOiB7IHNjYWxhcl90b2tlbjogdG9rZW4sIHY6IGltQXBpVmVyc2lvbiB9LFxuICAgICAgICAgICAgICAgIGpzb246IHRydWUsXG4gICAgICAgICAgICB9LCAoZXJyLCByZXNwb25zZSwgYm9keSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChib2R5ICYmIGJvZHkuZXJyY29kZSA9PT0gJ01fVEVSTVNfTk9UX1NJR05FRCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBUZXJtc05vdFNpZ25lZEVycm9yKCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAvIDEwMCAhPT0gMikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoYm9keSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghYm9keSB8fCAhYm9keS51c2VyX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJNaXNzaW5nIHVzZXJfaWQgaW4gcmVzcG9uc2VcIikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYm9keS51c2VyX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja1Rva2VuKHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBY2NvdW50TmFtZSh0b2tlbikudGhlbih1c2VySWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWUgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICBpZiAodXNlcklkICE9PSBtZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjYWxhciB0b2tlbiBpcyBvd25lZCBieSBzb21lb25lIGVsc2U6IFwiICsgbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBUZXJtc05vdFNpZ25lZEVycm9yKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkludGVncmF0aW9uIG1hbmFnZXIgcmVxdWlyZXMgbmV3IHRlcm1zIHRvIGJlIGFncmVlZCB0b1wiKTtcbiAgICAgICAgICAgICAgICAvLyBUaGUgdGVybXMgZW5kcG9pbnRzIGFyZSBuZXcgYW5kIHNvIGxpdmUgb24gc3RhbmRhcmQgX21hdHJpeCBwcmVmaXhlcyxcbiAgICAgICAgICAgICAgICAvLyBidXQgSU0gcmVzdCB1cmxzIGFyZSBjdXJyZW50bHkgY29uZmlndXJlZCB3aXRoIHBhdGhzLCBzbyByZW1vdmUgdGhlXG4gICAgICAgICAgICAgICAgLy8gcGF0aCBmcm9tIHRoZSBiYXNlIFVSTCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGUganMtc2RrXG5cbiAgICAgICAgICAgICAgICAvLyBXZSBjb250aW51ZSB0byB1c2UgdGhlIGZ1bGwgVVJMIGZvciB0aGUgY2FsbHMgZG9uZSBieVxuICAgICAgICAgICAgICAgIC8vIG1hdHJpeC1yZWFjdC1zZGssIGJ1dCB0aGUgc3RhbmRhcmQgdGVybXMgQVBJIGNhbGxlZFxuICAgICAgICAgICAgICAgIC8vIGJ5IHRoZSBqcy1zZGsgbGl2ZXMgb24gdGhlIHN0YW5kYXJkIF9tYXRyaXggcGF0aC4gVGhpcyBtZWFucyB3ZVxuICAgICAgICAgICAgICAgIC8vIGRvbid0IHN1cHBvcnQgcnVubmluZyBJTXMgb24gYSBub24tcm9vdCBwYXRoLCBidXQgaXQncyB0aGUgb25seVxuICAgICAgICAgICAgICAgIC8vIHJlYWxpc3RpYyB3YXkgb2YgdHJhbnNpdGlvbmluZyB0byBfbWF0cml4IHBhdGhzIHNpbmNlIGNvbmZpZ3MgaW5cbiAgICAgICAgICAgICAgICAvLyB0aGUgd2lsZCBjb250YWluIGJpdHMgb2YgdGhlIEFQSSBwYXRoLlxuXG4gICAgICAgICAgICAgICAgLy8gT25jZSB3ZSd2ZSBmdWxseSB0cmFuc2l0aW9uZWQgdG8gX21hdHJpeCBVUkxzLCB3ZSBjYW4gZ2l2ZSBwZW9wbGVcbiAgICAgICAgICAgICAgICAvLyBhIGdyYWNlIHBlcmlvZCB0byB1cGRhdGUgdGhlaXIgY29uZmlncywgdGhlbiB1c2UgdGhlIHJlc3QgdXJsIGFzXG4gICAgICAgICAgICAgICAgLy8gYSByZWd1bGFyIGJhc2UgdXJsLlxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEltUmVzdFVybCA9IHVybC5wYXJzZSh0aGlzLmFwaVVybCk7XG4gICAgICAgICAgICAgICAgcGFyc2VkSW1SZXN0VXJsLnBhdGggPSAnJztcbiAgICAgICAgICAgICAgICBwYXJzZWRJbVJlc3RVcmwucGF0aG5hbWUgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhcnRUZXJtc0Zsb3coW25ldyBTZXJ2aWNlKFxuICAgICAgICAgICAgICAgICAgICBTRVJWSUNFX1RZUEVTLklNLFxuICAgICAgICAgICAgICAgICAgICB1cmwuZm9ybWF0KHBhcnNlZEltUmVzdFVybCksXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLFxuICAgICAgICAgICAgICAgICldLCB0aGlzLnRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjaykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGb3JUb2tlbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICAvLyBHZXQgb3BlbmlkIGJlYXJlciB0b2tlbiBmcm9tIHRoZSBIUyBhcyB0aGUgZmlyc3QgcGFydCBvZiBvdXIgZGFuY2VcbiAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRPcGVuSWRUb2tlbigpLnRoZW4oKHRva2VuT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBOb3cgd2UgY2FuIHNlbmQgdGhhdCB0byBzY2FsYXIgYW5kIGV4Y2hhbmdlIGl0IGZvciBhIHNjYWxhciB0b2tlblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhjaGFuZ2VGb3JTY2FsYXJUb2tlbih0b2tlbk9iamVjdCk7XG4gICAgICAgIH0pLnRoZW4oKHRva2VuKSA9PiB7XG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSBpdCAodGhpcyBtb3N0bHkgY2hlY2tzIHRvIHNlZSBpZiB0aGUgSU0gbmVlZHMgdXMgdG8gYWdyZWUgdG8gc29tZSB0ZXJtcylcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrVG9rZW4odG9rZW4pO1xuICAgICAgICB9KS50aGVuKCh0b2tlbikgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY2FsYXJUb2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgdGhpcy53cml0ZVRva2VuVG9TdG9yZSgpO1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBleGNoYW5nZUZvclNjYWxhclRva2VuKG9wZW5pZFRva2VuT2JqZWN0OiBhbnkpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzY2FsYXJSZXN0VXJsID0gdGhpcy5hcGlVcmw7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgcmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgdXJpOiBzY2FsYXJSZXN0VXJsICsgJy9yZWdpc3RlcicsXG4gICAgICAgICAgICAgICAgcXM6IHsgdjogaW1BcGlWZXJzaW9uIH0sXG4gICAgICAgICAgICAgICAgYm9keTogb3BlbmlkVG9rZW5PYmplY3QsXG4gICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgICAgIH0sIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgLyAxMDAgIT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2NhbGFyIHJlcXVlc3QgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWJvZHkgfHwgIWJvZHkuc2NhbGFyX3Rva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJNaXNzaW5nIHNjYWxhcl90b2tlbiBpbiByZXNwb25zZVwiKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShib2R5LnNjYWxhcl90b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYWxhclBhZ2VUaXRsZSh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGxldCBzY2FsYXJQYWdlTG9va3VwVXJsID0gdGhpcy5hcGlVcmwgKyAnL3dpZGdldHMvdGl0bGVfbG9va3VwJztcbiAgICAgICAgc2NhbGFyUGFnZUxvb2t1cFVybCA9IHRoaXMuZ2V0U3RhcnRlckxpbmsoc2NhbGFyUGFnZUxvb2t1cFVybCk7XG4gICAgICAgIHNjYWxhclBhZ2VMb29rdXBVcmwgKz0gJyZjdXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQodXJsKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICByZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIHVyaTogc2NhbGFyUGFnZUxvb2t1cFVybCxcbiAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxuICAgICAgICAgICAgfSwgKGVyciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAvIDEwMCAhPT0gMikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBTY2FsYXIgcmVxdWVzdCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX1gKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiTWlzc2luZyBwYWdlIHRpdGxlIGluIHJlc3BvbnNlXCIpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGl0bGUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYm9keS5wYWdlX3RpdGxlX2NhY2hlX2l0ZW0gJiYgYm9keS5wYWdlX3RpdGxlX2NhY2hlX2l0ZW0uY2FjaGVkX3RpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IGJvZHkucGFnZV90aXRsZV9jYWNoZV9pdGVtLmNhY2hlZF90aXRsZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRpdGxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFyayBhbGwgYXNzZXRzIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIHdpZGdldCBhcyBcImRpc2FibGVkXCIgaW4gdGhlXG4gICAgICogaW50ZWdyYXRpb24gbWFuYWdlciBkYXRhYmFzZS5cbiAgICAgKiBUaGlzIGNhbiBiZSB1c2VmdWwgdG8gdGVtcG9yYXJpbHkgcHJldmVudCBwdXJjaGFzZWQgYXNzZXRzIGZyb20gYmVpbmcgZGlzcGxheWVkLlxuICAgICAqIEBwYXJhbSAge1dpZGdldFR5cGV9IHdpZGdldFR5cGUgVGhlIFdpZGdldCBUeXBlIHRvIGRpc2FibGUgYXNzZXRzIGZvclxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gd2lkZ2V0SWQgICBUaGUgd2lkZ2V0IElEIHRvIGRpc2FibGUgYXNzZXRzIGZvclxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9ICAgICAgICAgICBSZXNvbHZlcyBvbiBjb21wbGV0aW9uXG4gICAgICovXG4gICAgZGlzYWJsZVdpZGdldEFzc2V0cyh3aWRnZXRUeXBlOiBXaWRnZXRUeXBlLCB3aWRnZXRJZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLmFwaVVybCArICcvd2lkZ2V0cy9zZXRfYXNzZXRzX3N0YXRlJztcbiAgICAgICAgdXJsID0gdGhpcy5nZXRTdGFydGVyTGluayh1cmwpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJywgLy8gWFhYOiBBY3Rpb25zIHNob3VsZG4ndCBiZSBHRVQgcmVxdWVzdHNcbiAgICAgICAgICAgICAgICB1cmk6IHVybCxcbiAgICAgICAgICAgICAgICBqc29uOiB0cnVlLFxuICAgICAgICAgICAgICAgIHFzOiB7XG4gICAgICAgICAgICAgICAgICAgICd3aWRnZXRfdHlwZSc6IHdpZGdldFR5cGUucHJlZmVycmVkLFxuICAgICAgICAgICAgICAgICAgICAnd2lkZ2V0X2lkJzogd2lkZ2V0SWQsXG4gICAgICAgICAgICAgICAgICAgICdzdGF0ZSc6ICdkaXNhYmxlJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSwgKGVyciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAvIDEwMCAhPT0gMikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBTY2FsYXIgcmVxdWVzdCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzQ29kZX1gKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiRmFpbGVkIHRvIHNldCB3aWRnZXQgYXNzZXRzIHN0YXRlXCIpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFNjYWxhckludGVyZmFjZVVybEZvclJvb20ocm9vbTogUm9vbSwgc2NyZWVuOiBzdHJpbmcsIGlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCByb29tSWQgPSByb29tLnJvb21JZDtcbiAgICAgICAgY29uc3Qgcm9vbU5hbWUgPSByb29tLm5hbWU7XG4gICAgICAgIGxldCB1cmwgPSB0aGlzLnVpVXJsO1xuICAgICAgICB1cmwgKz0gXCI/c2NhbGFyX3Rva2VuPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuc2NhbGFyVG9rZW4pO1xuICAgICAgICB1cmwgKz0gXCImcm9vbV9pZD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChyb29tSWQpO1xuICAgICAgICB1cmwgKz0gXCImcm9vbV9uYW1lPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHJvb21OYW1lKTtcbiAgICAgICAgdXJsICs9IFwiJnRoZW1lPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJ0aGVtZVwiKSk7XG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgdXJsICs9ICcmaW50ZWdfaWQ9JyArIGVuY29kZVVSSUNvbXBvbmVudChpZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjcmVlbikge1xuICAgICAgICAgICAgdXJsICs9ICcmc2NyZWVuPScgKyBlbmNvZGVVUklDb21wb25lbnQoc2NyZWVuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cblxuICAgIGdldFN0YXJ0ZXJMaW5rKHN0YXJ0ZXJMaW5rVXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gc3RhcnRlckxpbmtVcmwgKyBcIj9zY2FsYXJfdG9rZW49XCIgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5zY2FsYXJUb2tlbik7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY0E7QUFDQSxNQUFNQSxZQUFZLEdB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