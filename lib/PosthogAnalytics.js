"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PosthogAnalytics = exports.Anonymity = void 0;
exports.getRedactedCurrentLocation = getRedactedCurrentLocation;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _posthogJs = _interopRequireDefault(require("posthog-js"));

var _logger = require("matrix-js-sdk/src/logger");

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

const _excluded = ["eventName"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

let Anonymity;
exports.Anonymity = Anonymity;

(function (Anonymity) {
  Anonymity[Anonymity["Disabled"] = 0] = "Disabled";
  Anonymity[Anonymity["Anonymous"] = 1] = "Anonymous";
  Anonymity[Anonymity["Pseudonymous"] = 2] = "Pseudonymous";
})(Anonymity || (exports.Anonymity = Anonymity = {}));

const whitelistedScreens = new Set(["register", "login", "forgot_password", "soft_logout", "new", "settings", "welcome", "home", "start", "directory", "start_sso", "start_cas", "complete_security", "post_registration", "room", "user"]);

function getRedactedCurrentLocation(origin, hash, pathname) {
  // Redact PII from the current location.
  // For known screens, assumes a URL structure of /<screen name>/might/be/pii
  if (origin.startsWith('file://')) {
    pathname = "/<redacted_file_scheme_url>/";
  }

  let hashStr;

  if (hash == "") {
    hashStr = "";
  } else {
    let [beforeFirstSlash, screen] = hash.split("/");

    if (!whitelistedScreens.has(screen)) {
      screen = "<redacted_screen_name>";
    }

    hashStr = `${beforeFirstSlash}/${screen}/<redacted>`;
  }

  return origin + pathname + hashStr;
}

class PosthogAnalytics {
  /* Wrapper for Posthog analytics.
   * 3 modes of anonymity are supported, governed by this.anonymity
   * - Anonymity.Disabled means *no data* is passed to posthog
   * - Anonymity.Anonymous means no identifier is passed to posthog
   * - Anonymity.Pseudonymous means an analytics ID stored in account_data and shared between devices
   *   is passed to posthog.
   *
   * To update anonymity, call updateAnonymityFromSettings() or you can set it directly via setAnonymity().
   *
   * To pass an event to Posthog:
   *
   * 1. Declare a type for the event, extending IAnonymousEvent or IPseudonymousEvent.
   * 2. Call the appropriate track*() method. Pseudonymous events will be dropped when anonymity is
   *    Anonymous or Disabled; Anonymous events will be dropped when anonymity is Disabled.
   */
  // set true during the constructor if posthog config is present, otherwise false
  static get instance() {
    if (!this._instance) {
      this._instance = new PosthogAnalytics(_posthogJs.default);
    }

    return this._instance;
  }

  constructor(posthog) {
    this.posthog = posthog;
    (0, _defineProperty2.default)(this, "anonymity", Anonymity.Disabled);
    (0, _defineProperty2.default)(this, "enabled", false);
    (0, _defineProperty2.default)(this, "platformSuperProperties", {});
    (0, _defineProperty2.default)(this, "propertiesForNextEvent", {});
    (0, _defineProperty2.default)(this, "userPropertyCache", {});
    (0, _defineProperty2.default)(this, "authenticationType", "Other");
    (0, _defineProperty2.default)(this, "lastScreen", "Loading");
    (0, _defineProperty2.default)(this, "sanitizeProperties", (properties, eventName) => {
      // Callback from posthog to sanitize properties before sending them to the server.
      //
      // Here we sanitize posthog's built in properties which leak PII e.g. url reporting.
      // See utils.js _.info.properties in posthog-js.
      if (eventName === "$pageview") {
        this.lastScreen = properties["$current_url"];
      } // We inject a screen identifier in $current_url as per https://posthog.com/tutorials/spa


      properties["$current_url"] = this.lastScreen;

      if (this.anonymity == Anonymity.Anonymous) {
        // drop referrer information for anonymous users
        properties['$referrer'] = null;
        properties['$referring_domain'] = null;
        properties['$initial_referrer'] = null;
        properties['$initial_referring_domain'] = null; // drop device ID, which is a UUID persisted in local storage

        properties['$device_id'] = null;
      }

      return properties;
    });

    const posthogConfig = _SdkConfig.default.getObject("posthog");

    if (posthogConfig) {
      this.posthog.init(posthogConfig.get("project_api_key"), {
        api_host: posthogConfig.get("api_host"),
        autocapture: false,
        mask_all_text: true,
        mask_all_element_attributes: true,
        // This only triggers on page load, which for our SPA isn't particularly useful.
        // Plus, the .capture call originating from somewhere in posthog makes it hard
        // to redact URLs, which requires async code.
        //
        // To raise this manually, just call .capture("$pageview") or posthog.capture_pageview.
        capture_pageview: false,
        sanitize_properties: this.sanitizeProperties,
        respect_dnt: true,
        advanced_disable_decide: true
      });
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  } // we persist the last `$screen_name` and send it for all events until it is replaced


  registerSuperProperties(properties) {
    if (this.enabled) {
      this.posthog.register(properties);
    }
  }

  static async getPlatformProperties() {
    const platform = _PlatformPeg.default.get();

    let appVersion;

    try {
      appVersion = await platform.getAppVersion();
    } catch (e) {
      // this happens if no version is set i.e. in dev
      appVersion = "unknown";
    }

    return {
      appVersion,
      appPlatform: platform.getHumanReadableName()
    };
  } // eslint-disable-nextline no-unused-varsx


  capture(eventName, properties, options) {
    if (!this.enabled) {
      return;
    }

    const {
      origin,
      hash,
      pathname
    } = window.location;
    properties["redactedCurrentUrl"] = getRedactedCurrentLocation(origin, hash, pathname);
    this.posthog.capture(eventName, _objectSpread(_objectSpread({}, this.propertiesForNextEvent), properties) // TODO: Uncomment below once https://github.com/PostHog/posthog-js/pull/391
    // gets merged

    /* options as any, */
    // No proper type definition in the posthog library
    );
    this.propertiesForNextEvent = {};
  }

  isEnabled() {
    return this.enabled;
  }

  setAnonymity(anonymity) {
    // Update this.anonymity.
    // This is public for testing purposes, typically you want to call updateAnonymityFromSettings
    // to ensure this value is in step with the user's settings.
    if (this.enabled && (anonymity == Anonymity.Disabled || anonymity == Anonymity.Anonymous)) {
      // when transitioning to Disabled or Anonymous ensure we clear out any prior state
      // set in posthog e.g. distinct ID
      this.posthog.reset(); // Restore any previously set platform super properties

      this.registerSuperProperties(this.platformSuperProperties);
    }

    this.anonymity = anonymity;
  }

  static getRandomAnalyticsId() {
    return [...crypto.getRandomValues(new Uint8Array(16))].map(c => c.toString(16)).join('');
  }

  async identifyUser(client, analyticsIdGenerator) {
    if (this.anonymity == Anonymity.Pseudonymous) {
      // Check the user's account_data for an analytics ID to use. Storing the ID in account_data allows
      // different devices to send the same ID.
      try {
        const accountData = await client.getAccountDataFromServer(PosthogAnalytics.ANALYTICS_EVENT_TYPE);
        let analyticsID = accountData?.id;

        if (!analyticsID) {
          // Couldn't retrieve an analytics ID from user settings, so create one and set it on the server.
          // Note there's a race condition here - if two devices do these steps at the same time, last write
          // wins, and the first writer will send tracking with an ID that doesn't match the one on the server
          // until the next time account data is refreshed and this function is called (most likely on next
          // page load). This will happen pretty infrequently, so we can tolerate the possibility.
          analyticsID = analyticsIdGenerator();
          await client.setAccountData(PosthogAnalytics.ANALYTICS_EVENT_TYPE, Object.assign({
            id: analyticsID
          }, accountData));
        }

        this.posthog.identify(analyticsID);
      } catch (e) {
        // The above could fail due to network requests, but not essential to starting the application,
        // so swallow it.
        _logger.logger.log("Unable to identify user for tracking" + e.toString());
      }
    }
  }

  getAnonymity() {
    return this.anonymity;
  }

  logout() {
    if (this.enabled) {
      this.posthog.reset();
    }

    this.setAnonymity(Anonymity.Disabled);
  }

  trackEvent(_ref, options) {
    let {
      eventName
    } = _ref,
        properties = (0, _objectWithoutProperties2.default)(_ref, _excluded);
    if (this.anonymity == Anonymity.Disabled || this.anonymity == Anonymity.Anonymous) return;
    this.capture(eventName, properties, options);
  }

  setProperty(key, value) {
    if (this.userPropertyCache[key] === value) return; // nothing to do

    this.userPropertyCache[key] = value;

    if (!this.propertiesForNextEvent["$set"]) {
      this.propertiesForNextEvent["$set"] = {};
    }

    this.propertiesForNextEvent["$set"][key] = value;
  }

  setPropertyOnce(key, value) {
    if (this.userPropertyCache[key]) return; // nothing to do

    this.userPropertyCache[key] = value;

    if (!this.propertiesForNextEvent["$set_once"]) {
      this.propertiesForNextEvent["$set_once"] = {};
    }

    this.propertiesForNextEvent["$set_once"][key] = value;
  }

  async updatePlatformSuperProperties() {
    // Update super properties in posthog with our platform (app version, platform).
    // These properties will be subsequently passed in every event.
    //
    // This only needs to be done once per page lifetime. Note that getPlatformProperties
    // is async and can involve a network request if we are running in a browser.
    this.platformSuperProperties = await PosthogAnalytics.getPlatformProperties();
    this.registerSuperProperties(this.platformSuperProperties);
  }

  async updateAnonymityFromSettings(pseudonymousOptIn) {
    // Update this.anonymity based on the user's analytics opt-in settings
    const anonymity = pseudonymousOptIn ? Anonymity.Pseudonymous : Anonymity.Disabled;
    this.setAnonymity(anonymity);

    if (anonymity === Anonymity.Pseudonymous) {
      await this.identifyUser(_MatrixClientPeg.MatrixClientPeg.get(), PosthogAnalytics.getRandomAnalyticsId);

      if (_MatrixClientPeg.MatrixClientPeg.currentUserIsJustRegistered()) {
        this.trackNewUserEvent();
      }
    }

    if (anonymity !== Anonymity.Disabled) {
      await PosthogAnalytics.instance.updatePlatformSuperProperties();
    }
  }

  startListeningToSettingsChanges() {
    // Listen to account data changes from sync so we can observe changes to relevant flags and update.
    // This is called -
    //  * On page load, when the account data is first received by sync
    //  * On login
    //  * When another device changes account data
    //  * When the user changes their preferences on this device
    // Note that for new accounts, pseudonymousAnalyticsOptIn won't be set, so updateAnonymityFromSettings
    // won't be called (i.e. this.anonymity will be left as the default, until the setting changes)
    _SettingsStore.default.watchSetting("pseudonymousAnalyticsOptIn", null, (originalSettingName, changedInRoomId, atLevel, newValueAtLevel, newValue) => {
      this.updateAnonymityFromSettings(!!newValue);
    });
  }

  setAuthenticationType(authenticationType) {
    this.authenticationType = authenticationType;
  }

  trackNewUserEvent() {
    // This is the only event that could have occured before analytics opt-in
    // that we want to accumulate before the user has given consent
    // All other scenarios should not track a user before they have given
    // explicit consent that they are ok with their analytics data being collected
    const options = {};
    const registrationTime = parseInt(window.localStorage.getItem("mx_registration_time"), 10);

    if (!isNaN(registrationTime)) {
      options.timestamp = new Date(registrationTime);
    }

    return this.trackEvent({
      eventName: "Signup",
      authenticationType: this.authenticationType
    }, options);
  }

}

exports.PosthogAnalytics = PosthogAnalytics;
(0, _defineProperty2.default)(PosthogAnalytics, "_instance", null);
(0, _defineProperty2.default)(PosthogAnalytics, "ANALYTICS_EVENT_TYPE", "im.vector.analytics");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbm9ueW1pdHkiLCJ3aGl0ZWxpc3RlZFNjcmVlbnMiLCJTZXQiLCJnZXRSZWRhY3RlZEN1cnJlbnRMb2NhdGlvbiIsIm9yaWdpbiIsImhhc2giLCJwYXRobmFtZSIsInN0YXJ0c1dpdGgiLCJoYXNoU3RyIiwiYmVmb3JlRmlyc3RTbGFzaCIsInNjcmVlbiIsInNwbGl0IiwiaGFzIiwiUG9zdGhvZ0FuYWx5dGljcyIsImluc3RhbmNlIiwiX2luc3RhbmNlIiwicG9zdGhvZyIsImNvbnN0cnVjdG9yIiwiRGlzYWJsZWQiLCJwcm9wZXJ0aWVzIiwiZXZlbnROYW1lIiwibGFzdFNjcmVlbiIsImFub255bWl0eSIsIkFub255bW91cyIsInBvc3Rob2dDb25maWciLCJTZGtDb25maWciLCJnZXRPYmplY3QiLCJpbml0IiwiZ2V0IiwiYXBpX2hvc3QiLCJhdXRvY2FwdHVyZSIsIm1hc2tfYWxsX3RleHQiLCJtYXNrX2FsbF9lbGVtZW50X2F0dHJpYnV0ZXMiLCJjYXB0dXJlX3BhZ2V2aWV3Iiwic2FuaXRpemVfcHJvcGVydGllcyIsInNhbml0aXplUHJvcGVydGllcyIsInJlc3BlY3RfZG50IiwiYWR2YW5jZWRfZGlzYWJsZV9kZWNpZGUiLCJlbmFibGVkIiwicmVnaXN0ZXJTdXBlclByb3BlcnRpZXMiLCJyZWdpc3RlciIsImdldFBsYXRmb3JtUHJvcGVydGllcyIsInBsYXRmb3JtIiwiUGxhdGZvcm1QZWciLCJhcHBWZXJzaW9uIiwiZ2V0QXBwVmVyc2lvbiIsImUiLCJhcHBQbGF0Zm9ybSIsImdldEh1bWFuUmVhZGFibGVOYW1lIiwiY2FwdHVyZSIsIm9wdGlvbnMiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInByb3BlcnRpZXNGb3JOZXh0RXZlbnQiLCJpc0VuYWJsZWQiLCJzZXRBbm9ueW1pdHkiLCJyZXNldCIsInBsYXRmb3JtU3VwZXJQcm9wZXJ0aWVzIiwiZ2V0UmFuZG9tQW5hbHl0aWNzSWQiLCJjcnlwdG8iLCJnZXRSYW5kb21WYWx1ZXMiLCJVaW50OEFycmF5IiwibWFwIiwiYyIsInRvU3RyaW5nIiwiam9pbiIsImlkZW50aWZ5VXNlciIsImNsaWVudCIsImFuYWx5dGljc0lkR2VuZXJhdG9yIiwiUHNldWRvbnltb3VzIiwiYWNjb3VudERhdGEiLCJnZXRBY2NvdW50RGF0YUZyb21TZXJ2ZXIiLCJBTkFMWVRJQ1NfRVZFTlRfVFlQRSIsImFuYWx5dGljc0lEIiwiaWQiLCJzZXRBY2NvdW50RGF0YSIsIk9iamVjdCIsImFzc2lnbiIsImlkZW50aWZ5IiwibG9nZ2VyIiwibG9nIiwiZ2V0QW5vbnltaXR5IiwibG9nb3V0IiwidHJhY2tFdmVudCIsInNldFByb3BlcnR5Iiwia2V5IiwidmFsdWUiLCJ1c2VyUHJvcGVydHlDYWNoZSIsInNldFByb3BlcnR5T25jZSIsInVwZGF0ZVBsYXRmb3JtU3VwZXJQcm9wZXJ0aWVzIiwidXBkYXRlQW5vbnltaXR5RnJvbVNldHRpbmdzIiwicHNldWRvbnltb3VzT3B0SW4iLCJNYXRyaXhDbGllbnRQZWciLCJjdXJyZW50VXNlcklzSnVzdFJlZ2lzdGVyZWQiLCJ0cmFja05ld1VzZXJFdmVudCIsInN0YXJ0TGlzdGVuaW5nVG9TZXR0aW5nc0NoYW5nZXMiLCJTZXR0aW5nc1N0b3JlIiwid2F0Y2hTZXR0aW5nIiwib3JpZ2luYWxTZXR0aW5nTmFtZSIsImNoYW5nZWRJblJvb21JZCIsImF0TGV2ZWwiLCJuZXdWYWx1ZUF0TGV2ZWwiLCJuZXdWYWx1ZSIsInNldEF1dGhlbnRpY2F0aW9uVHlwZSIsImF1dGhlbnRpY2F0aW9uVHlwZSIsInJlZ2lzdHJhdGlvblRpbWUiLCJwYXJzZUludCIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJpc05hTiIsInRpbWVzdGFtcCIsIkRhdGUiXSwic291cmNlcyI6WyIuLi9zcmMvUG9zdGhvZ0FuYWx5dGljcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgcG9zdGhvZywgeyBQb3N0SG9nIH0gZnJvbSAncG9zdGhvZy1qcyc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBVc2VyUHJvcGVydGllcyB9IGZyb20gXCJAbWF0cml4LW9yZy9hbmFseXRpY3MtZXZlbnRzL3R5cGVzL3R5cGVzY3JpcHQvVXNlclByb3BlcnRpZXNcIjtcbmltcG9ydCB7IFNpZ251cCB9IGZyb20gJ0BtYXRyaXgtb3JnL2FuYWx5dGljcy1ldmVudHMvdHlwZXMvdHlwZXNjcmlwdC9TaWdudXAnO1xuXG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSAnLi9QbGF0Zm9ybVBlZyc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4vU2RrQ29uZmlnJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgU2NyZWVuTmFtZSB9IGZyb20gXCIuL1Bvc3Rob2dUcmFja2Vyc1wiO1xuXG4vKiBQb3N0aG9nIGFuYWx5dGljcyB0cmFja2luZy5cbiAqXG4gKiBBbm9ueW1pdHkgYmVoYXZpb3VyIGlzIGFzIGZvbGxvd3M6XG4gKlxuICogLSBJZiBQb3N0aG9nIGlzbid0IGNvbmZpZ3VyZWQgaW4gYGNvbmZpZy5qc29uYCwgZXZlbnRzIGFyZSBub3Qgc2VudC5cbiAqIC0gSWYgW0RvIE5vdCBUcmFja10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05hdmlnYXRvci9kb05vdFRyYWNrKSBpc1xuICogICBlbmFibGVkLCBldmVudHMgYXJlIG5vdCBzZW50ICh0aGlzIGRldGVjdGlvbiBpcyBidWlsdCBpbnRvIHBvc3Rob2cgYW5kIHR1cm5lZCBvbiB2aWEgdGhlXG4gKiAgIGByZXNwZWN0X2RudGAgZmxhZyBiZWluZyBwYXNzZWQgdG8gYHBvc3Rob2cuaW5pdGApLlxuICogLSBJZiB0aGUgYGZlYXR1cmVfcHNldWRvbnltb3VzX2FuYWx5dGljc19vcHRfaW5gIGxhYnMgZmxhZyBpcyBgdHJ1ZWAsIHRyYWNrIHBzZXVkb25vbW91c2x5IGJ5IG1haW50YWluaW5nXG4gKiAgIGEgcmFuZG9taXNlZCBhbmFseXRpY3MgSUQgaW4gYWNjb3VudF9kYXRhIGZvciB0aGF0IHVzZXIgKHNoYXJlZCBiZXR3ZWVuIGRldmljZXMpIGFuZCBzZW5kaW5nIGl0IHRvIHBvc3Rob2cgdG9cbiAgICAgaWRlbnRpZnkgdGhlIHVzZXIuXG4gKiAtIE90aGVyd2lzZSwgaWYgdGhlIGV4aXN0aW5nIGBhbmFseXRpY3NPcHRJbmAgZmxhZyBpcyBgdHJ1ZWAsIHRyYWNrIGFub255bW91c2x5LCBpLmUuIGRvIG5vdCBpZGVudGlmeSB0aGUgdXNlclxuICAgICB1c2luZyBhbnkgaWRlbnRpZmllciB0aGF0IHdvdWxkIGJlIGNvbnNpc3RlbnQgYWNyb3NzIGRldmljZXMuXG4gKiAtIElmIGJvdGggZmxhZ3MgYXJlIGZhbHNlIG9yIG5vdCBzZXQsIGV2ZW50cyBhcmUgbm90IHNlbnQuXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBJUG9zdGhvZ0V2ZW50IHtcbiAgICAvLyBUaGUgZXZlbnQgbmFtZSB0aGF0IHdpbGwgYmUgdXNlZCBieSBQb3N0SG9nLiBFdmVudCBuYW1lcyBzaG91bGQgdXNlIGNhbWVsQ2FzZS5cbiAgICBldmVudE5hbWU6IHN0cmluZztcblxuICAgIC8vIGRvIG5vdCBhbGxvdyB0aGVzZSB0byBiZSBzZW50IG1hbnVhbGx5LCB3ZSBlbnF1ZXVlIHRoZW0gYWxsIGZvciBjYWNoaW5nIHB1cnBvc2VzXG4gICAgXCIkc2V0XCI/OiB2b2lkO1xuICAgIFwiJHNldF9vbmNlXCI/OiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQb3N0SG9nRXZlbnRPcHRpb25zIHtcbiAgICB0aW1lc3RhbXA/OiBEYXRlO1xufVxuXG5leHBvcnQgZW51bSBBbm9ueW1pdHkge1xuICAgIERpc2FibGVkLFxuICAgIEFub255bW91cyxcbiAgICBQc2V1ZG9ueW1vdXNcbn1cblxuY29uc3Qgd2hpdGVsaXN0ZWRTY3JlZW5zID0gbmV3IFNldChbXG4gICAgXCJyZWdpc3RlclwiLCBcImxvZ2luXCIsIFwiZm9yZ290X3Bhc3N3b3JkXCIsIFwic29mdF9sb2dvdXRcIiwgXCJuZXdcIiwgXCJzZXR0aW5nc1wiLCBcIndlbGNvbWVcIiwgXCJob21lXCIsIFwic3RhcnRcIiwgXCJkaXJlY3RvcnlcIixcbiAgICBcInN0YXJ0X3Nzb1wiLCBcInN0YXJ0X2Nhc1wiLCBcImNvbXBsZXRlX3NlY3VyaXR5XCIsIFwicG9zdF9yZWdpc3RyYXRpb25cIiwgXCJyb29tXCIsIFwidXNlclwiLFxuXSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZWRhY3RlZEN1cnJlbnRMb2NhdGlvbihcbiAgICBvcmlnaW46IHN0cmluZyxcbiAgICBoYXNoOiBzdHJpbmcsXG4gICAgcGF0aG5hbWU6IHN0cmluZyxcbik6IHN0cmluZyB7XG4gICAgLy8gUmVkYWN0IFBJSSBmcm9tIHRoZSBjdXJyZW50IGxvY2F0aW9uLlxuICAgIC8vIEZvciBrbm93biBzY3JlZW5zLCBhc3N1bWVzIGEgVVJMIHN0cnVjdHVyZSBvZiAvPHNjcmVlbiBuYW1lPi9taWdodC9iZS9waWlcbiAgICBpZiAob3JpZ2luLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8nKSkge1xuICAgICAgICBwYXRobmFtZSA9IFwiLzxyZWRhY3RlZF9maWxlX3NjaGVtZV91cmw+L1wiO1xuICAgIH1cblxuICAgIGxldCBoYXNoU3RyO1xuICAgIGlmIChoYXNoID09IFwiXCIpIHtcbiAgICAgICAgaGFzaFN0ciA9IFwiXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IFtiZWZvcmVGaXJzdFNsYXNoLCBzY3JlZW5dID0gaGFzaC5zcGxpdChcIi9cIik7XG5cbiAgICAgICAgaWYgKCF3aGl0ZWxpc3RlZFNjcmVlbnMuaGFzKHNjcmVlbikpIHtcbiAgICAgICAgICAgIHNjcmVlbiA9IFwiPHJlZGFjdGVkX3NjcmVlbl9uYW1lPlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzaFN0ciA9IGAke2JlZm9yZUZpcnN0U2xhc2h9LyR7c2NyZWVufS88cmVkYWN0ZWQ+YDtcbiAgICB9XG4gICAgcmV0dXJuIG9yaWdpbiArIHBhdGhuYW1lICsgaGFzaFN0cjtcbn1cblxuaW50ZXJmYWNlIFBsYXRmb3JtUHJvcGVydGllcyB7XG4gICAgYXBwVmVyc2lvbjogc3RyaW5nO1xuICAgIGFwcFBsYXRmb3JtOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBQb3N0aG9nQW5hbHl0aWNzIHtcbiAgICAvKiBXcmFwcGVyIGZvciBQb3N0aG9nIGFuYWx5dGljcy5cbiAgICAgKiAzIG1vZGVzIG9mIGFub255bWl0eSBhcmUgc3VwcG9ydGVkLCBnb3Zlcm5lZCBieSB0aGlzLmFub255bWl0eVxuICAgICAqIC0gQW5vbnltaXR5LkRpc2FibGVkIG1lYW5zICpubyBkYXRhKiBpcyBwYXNzZWQgdG8gcG9zdGhvZ1xuICAgICAqIC0gQW5vbnltaXR5LkFub255bW91cyBtZWFucyBubyBpZGVudGlmaWVyIGlzIHBhc3NlZCB0byBwb3N0aG9nXG4gICAgICogLSBBbm9ueW1pdHkuUHNldWRvbnltb3VzIG1lYW5zIGFuIGFuYWx5dGljcyBJRCBzdG9yZWQgaW4gYWNjb3VudF9kYXRhIGFuZCBzaGFyZWQgYmV0d2VlbiBkZXZpY2VzXG4gICAgICogICBpcyBwYXNzZWQgdG8gcG9zdGhvZy5cbiAgICAgKlxuICAgICAqIFRvIHVwZGF0ZSBhbm9ueW1pdHksIGNhbGwgdXBkYXRlQW5vbnltaXR5RnJvbVNldHRpbmdzKCkgb3IgeW91IGNhbiBzZXQgaXQgZGlyZWN0bHkgdmlhIHNldEFub255bWl0eSgpLlxuICAgICAqXG4gICAgICogVG8gcGFzcyBhbiBldmVudCB0byBQb3N0aG9nOlxuICAgICAqXG4gICAgICogMS4gRGVjbGFyZSBhIHR5cGUgZm9yIHRoZSBldmVudCwgZXh0ZW5kaW5nIElBbm9ueW1vdXNFdmVudCBvciBJUHNldWRvbnltb3VzRXZlbnQuXG4gICAgICogMi4gQ2FsbCB0aGUgYXBwcm9wcmlhdGUgdHJhY2sqKCkgbWV0aG9kLiBQc2V1ZG9ueW1vdXMgZXZlbnRzIHdpbGwgYmUgZHJvcHBlZCB3aGVuIGFub255bWl0eSBpc1xuICAgICAqICAgIEFub255bW91cyBvciBEaXNhYmxlZDsgQW5vbnltb3VzIGV2ZW50cyB3aWxsIGJlIGRyb3BwZWQgd2hlbiBhbm9ueW1pdHkgaXMgRGlzYWJsZWQuXG4gICAgICovXG5cbiAgICBwcml2YXRlIGFub255bWl0eSA9IEFub255bWl0eS5EaXNhYmxlZDtcbiAgICAvLyBzZXQgdHJ1ZSBkdXJpbmcgdGhlIGNvbnN0cnVjdG9yIGlmIHBvc3Rob2cgY29uZmlnIGlzIHByZXNlbnQsIG90aGVyd2lzZSBmYWxzZVxuICAgIHByaXZhdGUgcmVhZG9ubHkgZW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZSA9IG51bGw7XG4gICAgcHJpdmF0ZSBwbGF0Zm9ybVN1cGVyUHJvcGVydGllcyA9IHt9O1xuICAgIHByaXZhdGUgc3RhdGljIEFOQUxZVElDU19FVkVOVF9UWVBFID0gXCJpbS52ZWN0b3IuYW5hbHl0aWNzXCI7XG4gICAgcHJpdmF0ZSBwcm9wZXJ0aWVzRm9yTmV4dEV2ZW50OiBQYXJ0aWFsPFJlY29yZDxcIiRzZXRcIiB8IFwiJHNldF9vbmNlXCIsIFVzZXJQcm9wZXJ0aWVzPj4gPSB7fTtcbiAgICBwcml2YXRlIHVzZXJQcm9wZXJ0eUNhY2hlOiBVc2VyUHJvcGVydGllcyA9IHt9O1xuICAgIHByaXZhdGUgYXV0aGVudGljYXRpb25UeXBlOiBTaWdudXBbXCJhdXRoZW50aWNhdGlvblR5cGVcIl0gPSBcIk90aGVyXCI7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBpbnN0YW5jZSgpOiBQb3N0aG9nQW5hbHl0aWNzIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5faW5zdGFuY2UgPSBuZXcgUG9zdGhvZ0FuYWx5dGljcyhwb3N0aG9nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBwb3N0aG9nOiBQb3N0SG9nKSB7XG4gICAgICAgIGNvbnN0IHBvc3Rob2dDb25maWcgPSBTZGtDb25maWcuZ2V0T2JqZWN0KFwicG9zdGhvZ1wiKTtcbiAgICAgICAgaWYgKHBvc3Rob2dDb25maWcpIHtcbiAgICAgICAgICAgIHRoaXMucG9zdGhvZy5pbml0KHBvc3Rob2dDb25maWcuZ2V0KFwicHJvamVjdF9hcGlfa2V5XCIpLCB7XG4gICAgICAgICAgICAgICAgYXBpX2hvc3Q6IHBvc3Rob2dDb25maWcuZ2V0KFwiYXBpX2hvc3RcIiksXG4gICAgICAgICAgICAgICAgYXV0b2NhcHR1cmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1hc2tfYWxsX3RleHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbWFza19hbGxfZWxlbWVudF9hdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIC8vIFRoaXMgb25seSB0cmlnZ2VycyBvbiBwYWdlIGxvYWQsIHdoaWNoIGZvciBvdXIgU1BBIGlzbid0IHBhcnRpY3VsYXJseSB1c2VmdWwuXG4gICAgICAgICAgICAgICAgLy8gUGx1cywgdGhlIC5jYXB0dXJlIGNhbGwgb3JpZ2luYXRpbmcgZnJvbSBzb21ld2hlcmUgaW4gcG9zdGhvZyBtYWtlcyBpdCBoYXJkXG4gICAgICAgICAgICAgICAgLy8gdG8gcmVkYWN0IFVSTHMsIHdoaWNoIHJlcXVpcmVzIGFzeW5jIGNvZGUuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBUbyByYWlzZSB0aGlzIG1hbnVhbGx5LCBqdXN0IGNhbGwgLmNhcHR1cmUoXCIkcGFnZXZpZXdcIikgb3IgcG9zdGhvZy5jYXB0dXJlX3BhZ2V2aWV3LlxuICAgICAgICAgICAgICAgIGNhcHR1cmVfcGFnZXZpZXc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNhbml0aXplX3Byb3BlcnRpZXM6IHRoaXMuc2FuaXRpemVQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIHJlc3BlY3RfZG50OiB0cnVlLFxuICAgICAgICAgICAgICAgIGFkdmFuY2VkX2Rpc2FibGVfZGVjaWRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSBwZXJzaXN0IHRoZSBsYXN0IGAkc2NyZWVuX25hbWVgIGFuZCBzZW5kIGl0IGZvciBhbGwgZXZlbnRzIHVudGlsIGl0IGlzIHJlcGxhY2VkXG4gICAgcHJpdmF0ZSBsYXN0U2NyZWVuOiBTY3JlZW5OYW1lID0gXCJMb2FkaW5nXCI7XG5cbiAgICBwcml2YXRlIHNhbml0aXplUHJvcGVydGllcyA9IChwcm9wZXJ0aWVzOiBwb3N0aG9nLlByb3BlcnRpZXMsIGV2ZW50TmFtZTogc3RyaW5nKTogcG9zdGhvZy5Qcm9wZXJ0aWVzID0+IHtcbiAgICAgICAgLy8gQ2FsbGJhY2sgZnJvbSBwb3N0aG9nIHRvIHNhbml0aXplIHByb3BlcnRpZXMgYmVmb3JlIHNlbmRpbmcgdGhlbSB0byB0aGUgc2VydmVyLlxuICAgICAgICAvL1xuICAgICAgICAvLyBIZXJlIHdlIHNhbml0aXplIHBvc3Rob2cncyBidWlsdCBpbiBwcm9wZXJ0aWVzIHdoaWNoIGxlYWsgUElJIGUuZy4gdXJsIHJlcG9ydGluZy5cbiAgICAgICAgLy8gU2VlIHV0aWxzLmpzIF8uaW5mby5wcm9wZXJ0aWVzIGluIHBvc3Rob2ctanMuXG5cbiAgICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gXCIkcGFnZXZpZXdcIikge1xuICAgICAgICAgICAgdGhpcy5sYXN0U2NyZWVuID0gcHJvcGVydGllc1tcIiRjdXJyZW50X3VybFwiXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBpbmplY3QgYSBzY3JlZW4gaWRlbnRpZmllciBpbiAkY3VycmVudF91cmwgYXMgcGVyIGh0dHBzOi8vcG9zdGhvZy5jb20vdHV0b3JpYWxzL3NwYVxuICAgICAgICBwcm9wZXJ0aWVzW1wiJGN1cnJlbnRfdXJsXCJdID0gdGhpcy5sYXN0U2NyZWVuO1xuXG4gICAgICAgIGlmICh0aGlzLmFub255bWl0eSA9PSBBbm9ueW1pdHkuQW5vbnltb3VzKSB7XG4gICAgICAgICAgICAvLyBkcm9wIHJlZmVycmVyIGluZm9ybWF0aW9uIGZvciBhbm9ueW1vdXMgdXNlcnNcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJyRyZWZlcnJlciddID0gbnVsbDtcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJyRyZWZlcnJpbmdfZG9tYWluJ10gPSBudWxsO1xuICAgICAgICAgICAgcHJvcGVydGllc1snJGluaXRpYWxfcmVmZXJyZXInXSA9IG51bGw7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzWyckaW5pdGlhbF9yZWZlcnJpbmdfZG9tYWluJ10gPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBkcm9wIGRldmljZSBJRCwgd2hpY2ggaXMgYSBVVUlEIHBlcnNpc3RlZCBpbiBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWyckZGV2aWNlX2lkJ10gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVnaXN0ZXJTdXBlclByb3BlcnRpZXMocHJvcGVydGllczogcG9zdGhvZy5Qcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHRoaXMucG9zdGhvZy5yZWdpc3Rlcihwcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGdldFBsYXRmb3JtUHJvcGVydGllcygpOiBQcm9taXNlPFBsYXRmb3JtUHJvcGVydGllcz4ge1xuICAgICAgICBjb25zdCBwbGF0Zm9ybSA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgICAgICBsZXQgYXBwVmVyc2lvbjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFwcFZlcnNpb24gPSBhd2FpdCBwbGF0Zm9ybS5nZXRBcHBWZXJzaW9uKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgaGFwcGVucyBpZiBubyB2ZXJzaW9uIGlzIHNldCBpLmUuIGluIGRldlxuICAgICAgICAgICAgYXBwVmVyc2lvbiA9IFwidW5rbm93blwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFwcFZlcnNpb24sXG4gICAgICAgICAgICBhcHBQbGF0Zm9ybTogcGxhdGZvcm0uZ2V0SHVtYW5SZWFkYWJsZU5hbWUoKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0bGluZSBuby11bnVzZWQtdmFyc3hcbiAgICBwcml2YXRlIGNhcHR1cmUoZXZlbnROYW1lOiBzdHJpbmcsIHByb3BlcnRpZXM6IHBvc3Rob2cuUHJvcGVydGllcywgb3B0aW9ucz86IElQb3N0SG9nRXZlbnRPcHRpb25zKSB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBvcmlnaW4sIGhhc2gsIHBhdGhuYW1lIH0gPSB3aW5kb3cubG9jYXRpb247XG4gICAgICAgIHByb3BlcnRpZXNbXCJyZWRhY3RlZEN1cnJlbnRVcmxcIl0gPSBnZXRSZWRhY3RlZEN1cnJlbnRMb2NhdGlvbihvcmlnaW4sIGhhc2gsIHBhdGhuYW1lKTtcbiAgICAgICAgdGhpcy5wb3N0aG9nLmNhcHR1cmUoXG4gICAgICAgICAgICBldmVudE5hbWUsXG4gICAgICAgICAgICB7IC4uLnRoaXMucHJvcGVydGllc0Zvck5leHRFdmVudCwgLi4ucHJvcGVydGllcyB9LFxuICAgICAgICAgICAgLy8gVE9ETzogVW5jb21tZW50IGJlbG93IG9uY2UgaHR0cHM6Ly9naXRodWIuY29tL1Bvc3RIb2cvcG9zdGhvZy1qcy9wdWxsLzM5MVxuICAgICAgICAgICAgLy8gZ2V0cyBtZXJnZWRcbiAgICAgICAgICAgIC8qIG9wdGlvbnMgYXMgYW55LCAqLyAvLyBObyBwcm9wZXIgdHlwZSBkZWZpbml0aW9uIGluIHRoZSBwb3N0aG9nIGxpYnJhcnlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzRm9yTmV4dEV2ZW50ID0ge307XG4gICAgfVxuXG4gICAgcHVibGljIGlzRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5hYmxlZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0QW5vbnltaXR5KGFub255bWl0eTogQW5vbnltaXR5KTogdm9pZCB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGlzLmFub255bWl0eS5cbiAgICAgICAgLy8gVGhpcyBpcyBwdWJsaWMgZm9yIHRlc3RpbmcgcHVycG9zZXMsIHR5cGljYWxseSB5b3Ugd2FudCB0byBjYWxsIHVwZGF0ZUFub255bWl0eUZyb21TZXR0aW5nc1xuICAgICAgICAvLyB0byBlbnN1cmUgdGhpcyB2YWx1ZSBpcyBpbiBzdGVwIHdpdGggdGhlIHVzZXIncyBzZXR0aW5ncy5cbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlZCAmJiAoYW5vbnltaXR5ID09IEFub255bWl0eS5EaXNhYmxlZCB8fCBhbm9ueW1pdHkgPT0gQW5vbnltaXR5LkFub255bW91cykpIHtcbiAgICAgICAgICAgIC8vIHdoZW4gdHJhbnNpdGlvbmluZyB0byBEaXNhYmxlZCBvciBBbm9ueW1vdXMgZW5zdXJlIHdlIGNsZWFyIG91dCBhbnkgcHJpb3Igc3RhdGVcbiAgICAgICAgICAgIC8vIHNldCBpbiBwb3N0aG9nIGUuZy4gZGlzdGluY3QgSURcbiAgICAgICAgICAgIHRoaXMucG9zdGhvZy5yZXNldCgpO1xuICAgICAgICAgICAgLy8gUmVzdG9yZSBhbnkgcHJldmlvdXNseSBzZXQgcGxhdGZvcm0gc3VwZXIgcHJvcGVydGllc1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlclN1cGVyUHJvcGVydGllcyh0aGlzLnBsYXRmb3JtU3VwZXJQcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFub255bWl0eSA9IGFub255bWl0eTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRSYW5kb21BbmFseXRpY3NJZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gWy4uLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMTYpKV0ubWFwKChjKSA9PiBjLnRvU3RyaW5nKDE2KSkuam9pbignJyk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGlkZW50aWZ5VXNlcihjbGllbnQ6IE1hdHJpeENsaWVudCwgYW5hbHl0aWNzSWRHZW5lcmF0b3I6ICgpID0+IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAodGhpcy5hbm9ueW1pdHkgPT0gQW5vbnltaXR5LlBzZXVkb255bW91cykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIHVzZXIncyBhY2NvdW50X2RhdGEgZm9yIGFuIGFuYWx5dGljcyBJRCB0byB1c2UuIFN0b3JpbmcgdGhlIElEIGluIGFjY291bnRfZGF0YSBhbGxvd3NcbiAgICAgICAgICAgIC8vIGRpZmZlcmVudCBkZXZpY2VzIHRvIHNlbmQgdGhlIHNhbWUgSUQuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjY291bnREYXRhID0gYXdhaXQgY2xpZW50LmdldEFjY291bnREYXRhRnJvbVNlcnZlcihQb3N0aG9nQW5hbHl0aWNzLkFOQUxZVElDU19FVkVOVF9UWVBFKTtcbiAgICAgICAgICAgICAgICBsZXQgYW5hbHl0aWNzSUQgPSBhY2NvdW50RGF0YT8uaWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFhbmFseXRpY3NJRCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb3VsZG4ndCByZXRyaWV2ZSBhbiBhbmFseXRpY3MgSUQgZnJvbSB1c2VyIHNldHRpbmdzLCBzbyBjcmVhdGUgb25lIGFuZCBzZXQgaXQgb24gdGhlIHNlcnZlci5cbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSB0aGVyZSdzIGEgcmFjZSBjb25kaXRpb24gaGVyZSAtIGlmIHR3byBkZXZpY2VzIGRvIHRoZXNlIHN0ZXBzIGF0IHRoZSBzYW1lIHRpbWUsIGxhc3Qgd3JpdGVcbiAgICAgICAgICAgICAgICAgICAgLy8gd2lucywgYW5kIHRoZSBmaXJzdCB3cml0ZXIgd2lsbCBzZW5kIHRyYWNraW5nIHdpdGggYW4gSUQgdGhhdCBkb2Vzbid0IG1hdGNoIHRoZSBvbmUgb24gdGhlIHNlcnZlclxuICAgICAgICAgICAgICAgICAgICAvLyB1bnRpbCB0aGUgbmV4dCB0aW1lIGFjY291bnQgZGF0YSBpcyByZWZyZXNoZWQgYW5kIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIChtb3N0IGxpa2VseSBvbiBuZXh0XG4gICAgICAgICAgICAgICAgICAgIC8vIHBhZ2UgbG9hZCkuIFRoaXMgd2lsbCBoYXBwZW4gcHJldHR5IGluZnJlcXVlbnRseSwgc28gd2UgY2FuIHRvbGVyYXRlIHRoZSBwb3NzaWJpbGl0eS5cbiAgICAgICAgICAgICAgICAgICAgYW5hbHl0aWNzSUQgPSBhbmFseXRpY3NJZEdlbmVyYXRvcigpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQuc2V0QWNjb3VudERhdGEoUG9zdGhvZ0FuYWx5dGljcy5BTkFMWVRJQ1NfRVZFTlRfVFlQRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oeyBpZDogYW5hbHl0aWNzSUQgfSwgYWNjb3VudERhdGEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5wb3N0aG9nLmlkZW50aWZ5KGFuYWx5dGljc0lEKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgYWJvdmUgY291bGQgZmFpbCBkdWUgdG8gbmV0d29yayByZXF1ZXN0cywgYnV0IG5vdCBlc3NlbnRpYWwgdG8gc3RhcnRpbmcgdGhlIGFwcGxpY2F0aW9uLFxuICAgICAgICAgICAgICAgIC8vIHNvIHN3YWxsb3cgaXQuXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIlVuYWJsZSB0byBpZGVudGlmeSB1c2VyIGZvciB0cmFja2luZ1wiICsgZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRBbm9ueW1pdHkoKTogQW5vbnltaXR5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5vbnltaXR5O1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2dvdXQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHRoaXMucG9zdGhvZy5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0QW5vbnltaXR5KEFub255bWl0eS5EaXNhYmxlZCk7XG4gICAgfVxuXG4gICAgcHVibGljIHRyYWNrRXZlbnQ8RSBleHRlbmRzIElQb3N0aG9nRXZlbnQ+KFxuICAgICAgICB7IGV2ZW50TmFtZSwgLi4ucHJvcGVydGllcyB9OiBFLFxuICAgICAgICBvcHRpb25zPzogSVBvc3RIb2dFdmVudE9wdGlvbnMsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmFub255bWl0eSA9PSBBbm9ueW1pdHkuRGlzYWJsZWQgfHwgdGhpcy5hbm9ueW1pdHkgPT0gQW5vbnltaXR5LkFub255bW91cykgcmV0dXJuO1xuICAgICAgICB0aGlzLmNhcHR1cmUoZXZlbnROYW1lLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UHJvcGVydHk8SyBleHRlbmRzIGtleW9mIFVzZXJQcm9wZXJ0aWVzPihrZXk6IEssIHZhbHVlOiBVc2VyUHJvcGVydGllc1tLXSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy51c2VyUHJvcGVydHlDYWNoZVtrZXldID09PSB2YWx1ZSkgcmV0dXJuOyAvLyBub3RoaW5nIHRvIGRvXG4gICAgICAgIHRoaXMudXNlclByb3BlcnR5Q2FjaGVba2V5XSA9IHZhbHVlO1xuXG4gICAgICAgIGlmICghdGhpcy5wcm9wZXJ0aWVzRm9yTmV4dEV2ZW50W1wiJHNldFwiXSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0aWVzRm9yTmV4dEV2ZW50W1wiJHNldFwiXSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcGVydGllc0Zvck5leHRFdmVudFtcIiRzZXRcIl1ba2V5XSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eU9uY2U8SyBleHRlbmRzIGtleW9mIFVzZXJQcm9wZXJ0aWVzPihrZXk6IEssIHZhbHVlOiBVc2VyUHJvcGVydGllc1tLXSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy51c2VyUHJvcGVydHlDYWNoZVtrZXldKSByZXR1cm47IC8vIG5vdGhpbmcgdG8gZG9cbiAgICAgICAgdGhpcy51c2VyUHJvcGVydHlDYWNoZVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BlcnRpZXNGb3JOZXh0RXZlbnRbXCIkc2V0X29uY2VcIl0pIHtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydGllc0Zvck5leHRFdmVudFtcIiRzZXRfb25jZVwiXSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcGVydGllc0Zvck5leHRFdmVudFtcIiRzZXRfb25jZVwiXVtrZXldID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHVwZGF0ZVBsYXRmb3JtU3VwZXJQcm9wZXJ0aWVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBVcGRhdGUgc3VwZXIgcHJvcGVydGllcyBpbiBwb3N0aG9nIHdpdGggb3VyIHBsYXRmb3JtIChhcHAgdmVyc2lvbiwgcGxhdGZvcm0pLlxuICAgICAgICAvLyBUaGVzZSBwcm9wZXJ0aWVzIHdpbGwgYmUgc3Vic2VxdWVudGx5IHBhc3NlZCBpbiBldmVyeSBldmVudC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhpcyBvbmx5IG5lZWRzIHRvIGJlIGRvbmUgb25jZSBwZXIgcGFnZSBsaWZldGltZS4gTm90ZSB0aGF0IGdldFBsYXRmb3JtUHJvcGVydGllc1xuICAgICAgICAvLyBpcyBhc3luYyBhbmQgY2FuIGludm9sdmUgYSBuZXR3b3JrIHJlcXVlc3QgaWYgd2UgYXJlIHJ1bm5pbmcgaW4gYSBicm93c2VyLlxuICAgICAgICB0aGlzLnBsYXRmb3JtU3VwZXJQcm9wZXJ0aWVzID0gYXdhaXQgUG9zdGhvZ0FuYWx5dGljcy5nZXRQbGF0Zm9ybVByb3BlcnRpZXMoKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlclN1cGVyUHJvcGVydGllcyh0aGlzLnBsYXRmb3JtU3VwZXJQcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlQW5vbnltaXR5RnJvbVNldHRpbmdzKHBzZXVkb255bW91c09wdEluOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGlzLmFub255bWl0eSBiYXNlZCBvbiB0aGUgdXNlcidzIGFuYWx5dGljcyBvcHQtaW4gc2V0dGluZ3NcbiAgICAgICAgY29uc3QgYW5vbnltaXR5ID0gcHNldWRvbnltb3VzT3B0SW4gPyBBbm9ueW1pdHkuUHNldWRvbnltb3VzIDogQW5vbnltaXR5LkRpc2FibGVkO1xuICAgICAgICB0aGlzLnNldEFub255bWl0eShhbm9ueW1pdHkpO1xuICAgICAgICBpZiAoYW5vbnltaXR5ID09PSBBbm9ueW1pdHkuUHNldWRvbnltb3VzKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmlkZW50aWZ5VXNlcihNYXRyaXhDbGllbnRQZWcuZ2V0KCksIFBvc3Rob2dBbmFseXRpY3MuZ2V0UmFuZG9tQW5hbHl0aWNzSWQpO1xuICAgICAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5jdXJyZW50VXNlcklzSnVzdFJlZ2lzdGVyZWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhY2tOZXdVc2VyRXZlbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhbm9ueW1pdHkgIT09IEFub255bWl0eS5EaXNhYmxlZCkge1xuICAgICAgICAgICAgYXdhaXQgUG9zdGhvZ0FuYWx5dGljcy5pbnN0YW5jZS51cGRhdGVQbGF0Zm9ybVN1cGVyUHJvcGVydGllcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0TGlzdGVuaW5nVG9TZXR0aW5nc0NoYW5nZXMoKTogdm9pZCB7XG4gICAgICAgIC8vIExpc3RlbiB0byBhY2NvdW50IGRhdGEgY2hhbmdlcyBmcm9tIHN5bmMgc28gd2UgY2FuIG9ic2VydmUgY2hhbmdlcyB0byByZWxldmFudCBmbGFncyBhbmQgdXBkYXRlLlxuICAgICAgICAvLyBUaGlzIGlzIGNhbGxlZCAtXG4gICAgICAgIC8vICAqIE9uIHBhZ2UgbG9hZCwgd2hlbiB0aGUgYWNjb3VudCBkYXRhIGlzIGZpcnN0IHJlY2VpdmVkIGJ5IHN5bmNcbiAgICAgICAgLy8gICogT24gbG9naW5cbiAgICAgICAgLy8gICogV2hlbiBhbm90aGVyIGRldmljZSBjaGFuZ2VzIGFjY291bnQgZGF0YVxuICAgICAgICAvLyAgKiBXaGVuIHRoZSB1c2VyIGNoYW5nZXMgdGhlaXIgcHJlZmVyZW5jZXMgb24gdGhpcyBkZXZpY2VcbiAgICAgICAgLy8gTm90ZSB0aGF0IGZvciBuZXcgYWNjb3VudHMsIHBzZXVkb255bW91c0FuYWx5dGljc09wdEluIHdvbid0IGJlIHNldCwgc28gdXBkYXRlQW5vbnltaXR5RnJvbVNldHRpbmdzXG4gICAgICAgIC8vIHdvbid0IGJlIGNhbGxlZCAoaS5lLiB0aGlzLmFub255bWl0eSB3aWxsIGJlIGxlZnQgYXMgdGhlIGRlZmF1bHQsIHVudGlsIHRoZSBzZXR0aW5nIGNoYW5nZXMpXG4gICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwicHNldWRvbnltb3VzQW5hbHl0aWNzT3B0SW5cIiwgbnVsbCxcbiAgICAgICAgICAgIChvcmlnaW5hbFNldHRpbmdOYW1lLCBjaGFuZ2VkSW5Sb29tSWQsIGF0TGV2ZWwsIG5ld1ZhbHVlQXRMZXZlbCwgbmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUFub255bWl0eUZyb21TZXR0aW5ncyghIW5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRBdXRoZW50aWNhdGlvblR5cGUoYXV0aGVudGljYXRpb25UeXBlOiBTaWdudXBbXCJhdXRoZW50aWNhdGlvblR5cGVcIl0pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hdXRoZW50aWNhdGlvblR5cGUgPSBhdXRoZW50aWNhdGlvblR5cGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0cmFja05ld1VzZXJFdmVudCgpOiB2b2lkIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgb25seSBldmVudCB0aGF0IGNvdWxkIGhhdmUgb2NjdXJlZCBiZWZvcmUgYW5hbHl0aWNzIG9wdC1pblxuICAgICAgICAvLyB0aGF0IHdlIHdhbnQgdG8gYWNjdW11bGF0ZSBiZWZvcmUgdGhlIHVzZXIgaGFzIGdpdmVuIGNvbnNlbnRcbiAgICAgICAgLy8gQWxsIG90aGVyIHNjZW5hcmlvcyBzaG91bGQgbm90IHRyYWNrIGEgdXNlciBiZWZvcmUgdGhleSBoYXZlIGdpdmVuXG4gICAgICAgIC8vIGV4cGxpY2l0IGNvbnNlbnQgdGhhdCB0aGV5IGFyZSBvayB3aXRoIHRoZWlyIGFuYWx5dGljcyBkYXRhIGJlaW5nIGNvbGxlY3RlZFxuICAgICAgICBjb25zdCBvcHRpb25zOiBJUG9zdEhvZ0V2ZW50T3B0aW9ucyA9IHt9O1xuICAgICAgICBjb25zdCByZWdpc3RyYXRpb25UaW1lID0gcGFyc2VJbnQod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfcmVnaXN0cmF0aW9uX3RpbWVcIiksIDEwKTtcbiAgICAgICAgaWYgKCFpc05hTihyZWdpc3RyYXRpb25UaW1lKSkge1xuICAgICAgICAgICAgb3B0aW9ucy50aW1lc3RhbXAgPSBuZXcgRGF0ZShyZWdpc3RyYXRpb25UaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnRyYWNrRXZlbnQ8U2lnbnVwPih7XG4gICAgICAgICAgICBldmVudE5hbWU6IFwiU2lnbnVwXCIsXG4gICAgICAgICAgICBhdXRoZW50aWNhdGlvblR5cGU6IHRoaXMuYXV0aGVudGljYXRpb25UeXBlLFxuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUlBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztJQWdDWUEsUzs7O1dBQUFBLFM7RUFBQUEsUyxDQUFBQSxTO0VBQUFBLFMsQ0FBQUEsUztFQUFBQSxTLENBQUFBLFM7R0FBQUEsUyx5QkFBQUEsUzs7QUFNWixNQUFNQyxrQkFBa0IsR0FBRyxJQUFJQyxHQUFKLENBQVEsQ0FDL0IsVUFEK0IsRUFDbkIsT0FEbUIsRUFDVixpQkFEVSxFQUNTLGFBRFQsRUFDd0IsS0FEeEIsRUFDK0IsVUFEL0IsRUFDMkMsU0FEM0MsRUFDc0QsTUFEdEQsRUFDOEQsT0FEOUQsRUFDdUUsV0FEdkUsRUFFL0IsV0FGK0IsRUFFbEIsV0FGa0IsRUFFTCxtQkFGSyxFQUVnQixtQkFGaEIsRUFFcUMsTUFGckMsRUFFNkMsTUFGN0MsQ0FBUixDQUEzQjs7QUFLTyxTQUFTQywwQkFBVCxDQUNIQyxNQURHLEVBRUhDLElBRkcsRUFHSEMsUUFIRyxFQUlHO0VBQ047RUFDQTtFQUNBLElBQUlGLE1BQU0sQ0FBQ0csVUFBUCxDQUFrQixTQUFsQixDQUFKLEVBQWtDO0lBQzlCRCxRQUFRLEdBQUcsOEJBQVg7RUFDSDs7RUFFRCxJQUFJRSxPQUFKOztFQUNBLElBQUlILElBQUksSUFBSSxFQUFaLEVBQWdCO0lBQ1pHLE9BQU8sR0FBRyxFQUFWO0VBQ0gsQ0FGRCxNQUVPO0lBQ0gsSUFBSSxDQUFDQyxnQkFBRCxFQUFtQkMsTUFBbkIsSUFBNkJMLElBQUksQ0FBQ00sS0FBTCxDQUFXLEdBQVgsQ0FBakM7O0lBRUEsSUFBSSxDQUFDVixrQkFBa0IsQ0FBQ1csR0FBbkIsQ0FBdUJGLE1BQXZCLENBQUwsRUFBcUM7TUFDakNBLE1BQU0sR0FBRyx3QkFBVDtJQUNIOztJQUVERixPQUFPLEdB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