"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Kind = exports.IntegrationManagerInstance = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _logger = require("matrix-js-sdk/src/logger");

var _ScalarAuthClient = _interopRequireDefault(require("../ScalarAuthClient"));

var _Terms = require("../Terms");

var _Modal = _interopRequireDefault(require("../Modal"));

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _IntegrationManager = _interopRequireDefault(require("../components/views/settings/IntegrationManager"));

var _IntegrationManagers = require("./IntegrationManagers");

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
let Kind;
exports.Kind = Kind;

(function (Kind) {
  Kind["Account"] = "account";
  Kind["Config"] = "config";
  Kind["Homeserver"] = "homeserver";
})(Kind || (exports.Kind = Kind = {}));

class IntegrationManagerInstance {
  // only applicable in some cases
  // Per the spec: UI URL is optional.
  constructor(kind, apiUrl) {
    let uiUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : apiUrl;
    let id = arguments.length > 3 ? arguments[3] : undefined;
    (0, _defineProperty2.default)(this, "apiUrl", void 0);
    (0, _defineProperty2.default)(this, "uiUrl", void 0);
    (0, _defineProperty2.default)(this, "kind", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    this.kind = kind;
    this.apiUrl = apiUrl;
    this.uiUrl = uiUrl;
    this.id = id;
  }

  get name() {
    const parsed = _url.default.parse(this.uiUrl);

    return parsed.host;
  }

  get trimmedApiUrl() {
    const parsed = _url.default.parse(this.apiUrl);

    parsed.pathname = '';
    parsed.path = '';
    return _url.default.format(parsed);
  }

  getScalarClient() {
    return new _ScalarAuthClient.default(this.apiUrl, this.uiUrl);
  }

  async open() {
    let room = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let screen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let integrationId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (!_SettingsStore.default.getValue("integrationProvisioning")) {
      return _IntegrationManagers.IntegrationManagers.sharedInstance().showDisabledDialog();
    }

    const dialog = _Modal.default.createDialog(_IntegrationManager.default, {
      loading: true
    }, 'mx_IntegrationManager');

    const client = this.getScalarClient();
    client.setTermsInteractionCallback((policyInfo, agreedUrls) => {
      // To avoid visual glitching of two modals stacking briefly, we customise the
      // terms dialog sizing when it will appear for the integration manager so that
      // it gets the same basic size as the integration manager's own modal.
      return (0, _Terms.dialogTermsInteractionCallback)(policyInfo, agreedUrls, 'mx_TermsDialog_forIntegrationManager');
    });
    const newProps = {};

    try {
      await client.connect();

      if (!client.hasCredentials()) {
        newProps["connected"] = false;
      } else {
        newProps["url"] = client.getScalarInterfaceUrlForRoom(room, screen, integrationId);
      }
    } catch (e) {
      if (e instanceof _Terms.TermsNotSignedError) {
        dialog.close();
        return;
      }

      _logger.logger.error(e);

      newProps["connected"] = false;
    } // Close the old dialog and open a new one


    dialog.close();

    _Modal.default.createDialog(_IntegrationManager.default, newProps, 'mx_IntegrationManager');
  }

}

exports.IntegrationManagerInstance = IntegrationManagerInstance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLaW5kIiwiSW50ZWdyYXRpb25NYW5hZ2VySW5zdGFuY2UiLCJjb25zdHJ1Y3RvciIsImtpbmQiLCJhcGlVcmwiLCJ1aVVybCIsImlkIiwibmFtZSIsInBhcnNlZCIsInVybCIsInBhcnNlIiwiaG9zdCIsInRyaW1tZWRBcGlVcmwiLCJwYXRobmFtZSIsInBhdGgiLCJmb3JtYXQiLCJnZXRTY2FsYXJDbGllbnQiLCJTY2FsYXJBdXRoQ2xpZW50Iiwib3BlbiIsInJvb20iLCJzY3JlZW4iLCJpbnRlZ3JhdGlvbklkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiSW50ZWdyYXRpb25NYW5hZ2VycyIsInNoYXJlZEluc3RhbmNlIiwic2hvd0Rpc2FibGVkRGlhbG9nIiwiZGlhbG9nIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJJbnRlZ3JhdGlvbk1hbmFnZXIiLCJsb2FkaW5nIiwiY2xpZW50Iiwic2V0VGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrIiwicG9saWN5SW5mbyIsImFncmVlZFVybHMiLCJkaWFsb2dUZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2siLCJuZXdQcm9wcyIsImNvbm5lY3QiLCJoYXNDcmVkZW50aWFscyIsImdldFNjYWxhckludGVyZmFjZVVybEZvclJvb20iLCJlIiwiVGVybXNOb3RTaWduZWRFcnJvciIsImNsb3NlIiwibG9nZ2VyIiwiZXJyb3IiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZWdyYXRpb25zL0ludGVncmF0aW9uTWFuYWdlckluc3RhbmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHR5cGUgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgU2NhbGFyQXV0aENsaWVudCBmcm9tIFwiLi4vU2NhbGFyQXV0aENsaWVudFwiO1xuaW1wb3J0IHsgZGlhbG9nVGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrLCBUZXJtc05vdFNpZ25lZEVycm9yIH0gZnJvbSBcIi4uL1Rlcm1zXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vTW9kYWwnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBJbnRlZ3JhdGlvbk1hbmFnZXIgZnJvbSBcIi4uL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvSW50ZWdyYXRpb25NYW5hZ2VyXCI7XG5pbXBvcnQgeyBJbnRlZ3JhdGlvbk1hbmFnZXJzIH0gZnJvbSBcIi4vSW50ZWdyYXRpb25NYW5hZ2Vyc1wiO1xuXG5leHBvcnQgZW51bSBLaW5kIHtcbiAgICBBY2NvdW50ID0gXCJhY2NvdW50XCIsXG4gICAgQ29uZmlnID0gXCJjb25maWdcIixcbiAgICBIb21lc2VydmVyID0gXCJob21lc2VydmVyXCIsXG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlZ3JhdGlvbk1hbmFnZXJJbnN0YW5jZSB7XG4gICAgcHVibGljIHJlYWRvbmx5IGFwaVVybDogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seSB1aVVybDogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seSBraW5kOiBzdHJpbmc7XG4gICAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmc7IC8vIG9ubHkgYXBwbGljYWJsZSBpbiBzb21lIGNhc2VzXG5cbiAgICAvLyBQZXIgdGhlIHNwZWM6IFVJIFVSTCBpcyBvcHRpb25hbC5cbiAgICBjb25zdHJ1Y3RvcihraW5kOiBzdHJpbmcsIGFwaVVybDogc3RyaW5nLCB1aVVybDogc3RyaW5nID0gYXBpVXJsLCBpZD86IHN0cmluZykge1xuICAgICAgICB0aGlzLmtpbmQgPSBraW5kO1xuICAgICAgICB0aGlzLmFwaVVybCA9IGFwaVVybDtcbiAgICAgICAgdGhpcy51aVVybCA9IHVpVXJsO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gdXJsLnBhcnNlKHRoaXMudWlVcmwpO1xuICAgICAgICByZXR1cm4gcGFyc2VkLmhvc3Q7XG4gICAgfVxuXG4gICAgZ2V0IHRyaW1tZWRBcGlVcmwoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gdXJsLnBhcnNlKHRoaXMuYXBpVXJsKTtcbiAgICAgICAgcGFyc2VkLnBhdGhuYW1lID0gJyc7XG4gICAgICAgIHBhcnNlZC5wYXRoID0gJyc7XG4gICAgICAgIHJldHVybiB1cmwuZm9ybWF0KHBhcnNlZCk7XG4gICAgfVxuXG4gICAgZ2V0U2NhbGFyQ2xpZW50KCk6IFNjYWxhckF1dGhDbGllbnQge1xuICAgICAgICByZXR1cm4gbmV3IFNjYWxhckF1dGhDbGllbnQodGhpcy5hcGlVcmwsIHRoaXMudWlVcmwpO1xuICAgIH1cblxuICAgIGFzeW5jIG9wZW4ocm9vbTogUm9vbSA9IG51bGwsIHNjcmVlbjogc3RyaW5nID0gbnVsbCwgaW50ZWdyYXRpb25JZDogc3RyaW5nID0gbnVsbCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJpbnRlZ3JhdGlvblByb3Zpc2lvbmluZ1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKS5zaG93RGlzYWJsZWREaWFsb2coKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IE1vZGFsLmNyZWF0ZURpYWxvZyhJbnRlZ3JhdGlvbk1hbmFnZXIsIHsgbG9hZGluZzogdHJ1ZSB9LCAnbXhfSW50ZWdyYXRpb25NYW5hZ2VyJyk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5nZXRTY2FsYXJDbGllbnQoKTtcbiAgICAgICAgY2xpZW50LnNldFRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjaygocG9saWN5SW5mbywgYWdyZWVkVXJscykgPT4ge1xuICAgICAgICAgICAgLy8gVG8gYXZvaWQgdmlzdWFsIGdsaXRjaGluZyBvZiB0d28gbW9kYWxzIHN0YWNraW5nIGJyaWVmbHksIHdlIGN1c3RvbWlzZSB0aGVcbiAgICAgICAgICAgIC8vIHRlcm1zIGRpYWxvZyBzaXppbmcgd2hlbiBpdCB3aWxsIGFwcGVhciBmb3IgdGhlIGludGVncmF0aW9uIG1hbmFnZXIgc28gdGhhdFxuICAgICAgICAgICAgLy8gaXQgZ2V0cyB0aGUgc2FtZSBiYXNpYyBzaXplIGFzIHRoZSBpbnRlZ3JhdGlvbiBtYW5hZ2VyJ3Mgb3duIG1vZGFsLlxuICAgICAgICAgICAgcmV0dXJuIGRpYWxvZ1Rlcm1zSW50ZXJhY3Rpb25DYWxsYmFjayhcbiAgICAgICAgICAgICAgICBwb2xpY3lJbmZvLCBhZ3JlZWRVcmxzLCAnbXhfVGVybXNEaWFsb2dfZm9ySW50ZWdyYXRpb25NYW5hZ2VyJyxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG5ld1Byb3BzID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQuY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKCFjbGllbnQuaGFzQ3JlZGVudGlhbHMoKSkge1xuICAgICAgICAgICAgICAgIG5ld1Byb3BzW1wiY29ubmVjdGVkXCJdID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1Byb3BzW1widXJsXCJdID0gY2xpZW50LmdldFNjYWxhckludGVyZmFjZVVybEZvclJvb20ocm9vbSwgc2NyZWVuLCBpbnRlZ3JhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBUZXJtc05vdFNpZ25lZEVycm9yKSB7XG4gICAgICAgICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICBuZXdQcm9wc1tcImNvbm5lY3RlZFwiXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xvc2UgdGhlIG9sZCBkaWFsb2cgYW5kIG9wZW4gYSBuZXcgb25lXG4gICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW50ZWdyYXRpb25NYW5hZ2VyLCBuZXdQcm9wcywgJ214X0ludGVncmF0aW9uTWFuYWdlcicpO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7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