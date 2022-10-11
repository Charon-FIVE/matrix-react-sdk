"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _EventIndexPeg = _interopRequireDefault(require("../../../indexing/EventIndexPeg"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _SeshatResetDialog = _interopRequireDefault(require("../dialogs/SeshatResetDialog"));

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class EventIndexPanel extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "updateCurrentRoom", async room => {
      const eventIndex = _EventIndexPeg.default.get();

      let stats;

      try {
        stats = await eventIndex.getStats();
      } catch {
        // This call may fail if sporadically, not a huge issue as we will
        // try later again and probably succeed.
        return;
      }

      this.setState({
        eventIndexSize: stats.size,
        roomCount: stats.roomCount
      });
    });
    (0, _defineProperty2.default)(this, "onManage", async () => {
      _Modal.default.createDialogAsync( // @ts-ignore: TS doesn't seem to like the type of this now that it
      // has also been converted to TS as well, but I can't figure out why...
      Promise.resolve().then(() => _interopRequireWildcard(require('../../../async-components/views/dialogs/eventindex/ManageEventIndexDialog'))), {
        onFinished: () => {}
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "onEnable", async () => {
      this.setState({
        enabling: true
      });
      await _EventIndexPeg.default.initEventIndex();
      await _EventIndexPeg.default.get().addInitialCheckpoints();

      _EventIndexPeg.default.get().startCrawler();

      await _SettingsStore.default.setValue('enableEventIndexing', null, _SettingLevel.SettingLevel.DEVICE, true);
      await this.updateState();
    });
    (0, _defineProperty2.default)(this, "confirmEventStoreReset", () => {
      const {
        close
      } = _Modal.default.createDialog(_SeshatResetDialog.default, {
        onFinished: async success => {
          if (success) {
            await _SettingsStore.default.setValue('enableEventIndexing', null, _SettingLevel.SettingLevel.DEVICE, false);
            await _EventIndexPeg.default.deleteEventIndex();
            await this.onEnable();
            close();
          }
        }
      });
    });
    this.state = {
      enabling: false,
      eventIndexSize: 0,
      roomCount: 0,
      eventIndexingEnabled: _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, 'enableEventIndexing')
    };
  }

  componentWillUnmount() {
    const eventIndex = _EventIndexPeg.default.get();

    if (eventIndex !== null) {
      eventIndex.removeListener("changedCheckpoint", this.updateCurrentRoom);
    }
  }

  componentDidMount() {
    this.updateState();
  }

  async updateState() {
    const eventIndex = _EventIndexPeg.default.get();

    const eventIndexingEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, 'enableEventIndexing');

    const enabling = false;
    let eventIndexSize = 0;
    let roomCount = 0;

    if (eventIndex !== null) {
      eventIndex.on("changedCheckpoint", this.updateCurrentRoom);

      try {
        const stats = await eventIndex.getStats();
        eventIndexSize = stats.size;
        roomCount = stats.roomCount;
      } catch {// This call may fail if sporadically, not a huge issue as we
        // will try later again in the updateCurrentRoom call and
        // probably succeed.
      }
    }

    this.setState({
      enabling,
      eventIndexSize,
      roomCount,
      eventIndexingEnabled
    });
  }

  render() {
    let eventIndexingSettings = null;

    const brand = _SdkConfig.default.get().brand;

    if (_EventIndexPeg.default.get() !== null) {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Securely cache encrypted messages locally for them " + "to appear in search results, using %(size)s to store messages from %(rooms)s rooms.", {
        size: (0, _FormattingUtils.formatBytes)(this.state.eventIndexSize, 0),
        // This drives the singular / plural string
        // selection for "room" / "rooms" only.
        count: this.state.roomCount,
        rooms: (0, _FormattingUtils.formatCountLong)(this.state.roomCount)
      })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.onManage
      }, (0, _languageHandler._t)("Manage"))));
    } else if (!this.state.eventIndexingEnabled && _EventIndexPeg.default.supportIsInstalled()) {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Securely cache encrypted messages locally for them to " + "appear in search results.")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        disabled: this.state.enabling,
        onClick: this.onEnable
      }, (0, _languageHandler._t)("Enable")), this.state.enabling ? /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null) : /*#__PURE__*/_react.default.createElement("div", null)));
    } else if (_EventIndexPeg.default.platformHasSupport() && !_EventIndexPeg.default.supportIsInstalled()) {
      const nativeLink = "https://github.com/vector-im/element-desktop/blob/develop/" + "docs/native-node-modules.md#" + "adding-seshat-for-search-in-e2e-encrypted-rooms";
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("%(brand)s is missing some components required for securely " + "caching encrypted messages locally. If you'd like to " + "experiment with this feature, build a custom %(brand)s Desktop " + "with <nativeLink>search components added</nativeLink>.", {
        brand
      }, {
        nativeLink: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: nativeLink,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    } else if (!_EventIndexPeg.default.platformHasSupport()) {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("%(brand)s can't securely cache encrypted messages locally " + "while running in a web browser. Use <desktopLink>%(brand)s Desktop</desktopLink> " + "for encrypted messages to appear in search results.", {
        brand
      }, {
        desktopLink: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "https://element.io/get-started",
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    } else {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, /*#__PURE__*/_react.default.createElement("p", null, this.state.enabling ? /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null) : (0, _languageHandler._t)("Message search initialisation failed")), _EventIndexPeg.default.error && /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("code", null, _EventIndexPeg.default.error.message), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "delete",
        kind: "danger",
        onClick: this.confirmEventStoreReset
      }, (0, _languageHandler._t)("Reset")))));
    }

    return eventIndexingSettings;
  }

}

exports.default = EventIndexPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFdmVudEluZGV4UGFuZWwiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJyb29tIiwiZXZlbnRJbmRleCIsIkV2ZW50SW5kZXhQZWciLCJnZXQiLCJzdGF0cyIsImdldFN0YXRzIiwic2V0U3RhdGUiLCJldmVudEluZGV4U2l6ZSIsInNpemUiLCJyb29tQ291bnQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZ0FzeW5jIiwib25GaW5pc2hlZCIsImVuYWJsaW5nIiwiaW5pdEV2ZW50SW5kZXgiLCJhZGRJbml0aWFsQ2hlY2twb2ludHMiLCJzdGFydENyYXdsZXIiLCJTZXR0aW5nc1N0b3JlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJ1cGRhdGVTdGF0ZSIsImNsb3NlIiwiY3JlYXRlRGlhbG9nIiwiU2VzaGF0UmVzZXREaWFsb2ciLCJzdWNjZXNzIiwiZGVsZXRlRXZlbnRJbmRleCIsIm9uRW5hYmxlIiwic3RhdGUiLCJldmVudEluZGV4aW5nRW5hYmxlZCIsImdldFZhbHVlQXQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwidXBkYXRlQ3VycmVudFJvb20iLCJjb21wb25lbnREaWRNb3VudCIsIm9uIiwicmVuZGVyIiwiZXZlbnRJbmRleGluZ1NldHRpbmdzIiwiYnJhbmQiLCJTZGtDb25maWciLCJfdCIsImZvcm1hdEJ5dGVzIiwiY291bnQiLCJyb29tcyIsImZvcm1hdENvdW50TG9uZyIsIm9uTWFuYWdlIiwic3VwcG9ydElzSW5zdGFsbGVkIiwicGxhdGZvcm1IYXNTdXBwb3J0IiwibmF0aXZlTGluayIsInN1YiIsImRlc2t0b3BMaW5rIiwiZXJyb3IiLCJtZXNzYWdlIiwiY29uZmlybUV2ZW50U3RvcmVSZXNldCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0V2ZW50SW5kZXhQYW5lbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IGZvcm1hdEJ5dGVzLCBmb3JtYXRDb3VudExvbmcgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRm9ybWF0dGluZ1V0aWxzXCI7XG5pbXBvcnQgRXZlbnRJbmRleFBlZyBmcm9tIFwiLi4vLi4vLi4vaW5kZXhpbmcvRXZlbnRJbmRleFBlZ1wiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFNlc2hhdFJlc2V0RGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvU2VzaGF0UmVzZXREaWFsb2cnO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSAnLi4vZWxlbWVudHMvSW5saW5lU3Bpbm5lcic7XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGVuYWJsaW5nOiBib29sZWFuO1xuICAgIGV2ZW50SW5kZXhTaXplOiBudW1iZXI7XG4gICAgcm9vbUNvdW50OiBudW1iZXI7XG4gICAgZXZlbnRJbmRleGluZ0VuYWJsZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50SW5kZXhQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx7fSwgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBlbmFibGluZzogZmFsc2UsXG4gICAgICAgICAgICBldmVudEluZGV4U2l6ZTogMCxcbiAgICAgICAgICAgIHJvb21Db3VudDogMCxcbiAgICAgICAgICAgIGV2ZW50SW5kZXhpbmdFbmFibGVkOlxuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuREVWSUNFLCAnZW5hYmxlRXZlbnRJbmRleGluZycpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHVwZGF0ZUN1cnJlbnRSb29tID0gYXN5bmMgKHJvb20pID0+IHtcbiAgICAgICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG4gICAgICAgIGxldCBzdGF0cztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3RhdHMgPSBhd2FpdCBldmVudEluZGV4LmdldFN0YXRzKCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gVGhpcyBjYWxsIG1heSBmYWlsIGlmIHNwb3JhZGljYWxseSwgbm90IGEgaHVnZSBpc3N1ZSBhcyB3ZSB3aWxsXG4gICAgICAgICAgICAvLyB0cnkgbGF0ZXIgYWdhaW4gYW5kIHByb2JhYmx5IHN1Y2NlZWQuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXhTaXplOiBzdGF0cy5zaXplLFxuICAgICAgICAgICAgcm9vbUNvdW50OiBzdGF0cy5yb29tQ291bnQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50SW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXgucmVtb3ZlTGlzdGVuZXIoXCJjaGFuZ2VkQ2hlY2twb2ludFwiLCB0aGlzLnVwZGF0ZUN1cnJlbnRSb29tKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlU3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50SW5kZXggPSBFdmVudEluZGV4UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBldmVudEluZGV4aW5nRW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuREVWSUNFLCAnZW5hYmxlRXZlbnRJbmRleGluZycpO1xuICAgICAgICBjb25zdCBlbmFibGluZyA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBldmVudEluZGV4U2l6ZSA9IDA7XG4gICAgICAgIGxldCByb29tQ291bnQgPSAwO1xuXG4gICAgICAgIGlmIChldmVudEluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBldmVudEluZGV4Lm9uKFwiY2hhbmdlZENoZWNrcG9pbnRcIiwgdGhpcy51cGRhdGVDdXJyZW50Um9vbSk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBldmVudEluZGV4LmdldFN0YXRzKCk7XG4gICAgICAgICAgICAgICAgZXZlbnRJbmRleFNpemUgPSBzdGF0cy5zaXplO1xuICAgICAgICAgICAgICAgIHJvb21Db3VudCA9IHN0YXRzLnJvb21Db3VudDtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgY2FsbCBtYXkgZmFpbCBpZiBzcG9yYWRpY2FsbHksIG5vdCBhIGh1Z2UgaXNzdWUgYXMgd2VcbiAgICAgICAgICAgICAgICAvLyB3aWxsIHRyeSBsYXRlciBhZ2FpbiBpbiB0aGUgdXBkYXRlQ3VycmVudFJvb20gY2FsbCBhbmRcbiAgICAgICAgICAgICAgICAvLyBwcm9iYWJseSBzdWNjZWVkLlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlbmFibGluZyxcbiAgICAgICAgICAgIGV2ZW50SW5kZXhTaXplLFxuICAgICAgICAgICAgcm9vbUNvdW50LFxuICAgICAgICAgICAgZXZlbnRJbmRleGluZ0VuYWJsZWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25NYW5hZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZ0FzeW5jKFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogVFMgZG9lc24ndCBzZWVtIHRvIGxpa2UgdGhlIHR5cGUgb2YgdGhpcyBub3cgdGhhdCBpdFxuICAgICAgICAgICAgLy8gaGFzIGFsc28gYmVlbiBjb252ZXJ0ZWQgdG8gVFMgYXMgd2VsbCwgYnV0IEkgY2FuJ3QgZmlndXJlIG91dCB3aHkuLi5cbiAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL2V2ZW50aW5kZXgvTWFuYWdlRXZlbnRJbmRleERpYWxvZycpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6ICgpID0+IHt9LFxuICAgICAgICAgICAgfSwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVuYWJsZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlbmFibGluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgRXZlbnRJbmRleFBlZy5pbml0RXZlbnRJbmRleCgpO1xuICAgICAgICBhd2FpdCBFdmVudEluZGV4UGVnLmdldCgpLmFkZEluaXRpYWxDaGVja3BvaW50cygpO1xuICAgICAgICBFdmVudEluZGV4UGVnLmdldCgpLnN0YXJ0Q3Jhd2xlcigpO1xuICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKCdlbmFibGVFdmVudEluZGV4aW5nJywgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgdHJ1ZSk7XG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjb25maXJtRXZlbnRTdG9yZVJlc2V0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB7IGNsb3NlIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2coU2VzaGF0UmVzZXREaWFsb2csIHtcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IGFzeW5jIChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZSgnZW5hYmxlRXZlbnRJbmRleGluZycsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgRXZlbnRJbmRleFBlZy5kZWxldGVFdmVudEluZGV4KCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMub25FbmFibGUoKTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZXZlbnRJbmRleGluZ1NldHRpbmdzID0gbnVsbDtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG5cbiAgICAgICAgaWYgKEV2ZW50SW5kZXhQZWcuZ2V0KCkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXhpbmdTZXR0aW5ncyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlNlY3VyZWx5IGNhY2hlIGVuY3J5cHRlZCBtZXNzYWdlcyBsb2NhbGx5IGZvciB0aGVtIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG8gYXBwZWFyIGluIHNlYXJjaCByZXN1bHRzLCB1c2luZyAlKHNpemUpcyB0byBzdG9yZSBtZXNzYWdlcyBmcm9tICUocm9vbXMpcyByb29tcy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBmb3JtYXRCeXRlcyh0aGlzLnN0YXRlLmV2ZW50SW5kZXhTaXplLCAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGRyaXZlcyB0aGUgc2luZ3VsYXIgLyBwbHVyYWwgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VsZWN0aW9uIGZvciBcInJvb21cIiAvIFwicm9vbXNcIiBvbmx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiB0aGlzLnN0YXRlLnJvb21Db3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tczogZm9ybWF0Q291bnRMb25nKHRoaXMuc3RhdGUucm9vbUNvdW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICkgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLm9uTWFuYWdlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiTWFuYWdlXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXRlLmV2ZW50SW5kZXhpbmdFbmFibGVkICYmIEV2ZW50SW5kZXhQZWcuc3VwcG9ydElzSW5zdGFsbGVkKCkpIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXhpbmdTZXR0aW5ncyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlNlY3VyZWx5IGNhY2hlIGVuY3J5cHRlZCBtZXNzYWdlcyBsb2NhbGx5IGZvciB0aGVtIHRvIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXBwZWFyIGluIHNlYXJjaCByZXN1bHRzLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmVuYWJsaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FbmFibGV9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkVuYWJsZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZW5hYmxpbmcgPyA8SW5saW5lU3Bpbm5lciAvPiA6IDxkaXYgLz4gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoRXZlbnRJbmRleFBlZy5wbGF0Zm9ybUhhc1N1cHBvcnQoKSAmJiAhRXZlbnRJbmRleFBlZy5zdXBwb3J0SXNJbnN0YWxsZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgbmF0aXZlTGluayA9IChcbiAgICAgICAgICAgICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC1kZXNrdG9wL2Jsb2IvZGV2ZWxvcC9cIiArXG4gICAgICAgICAgICAgICAgXCJkb2NzL25hdGl2ZS1ub2RlLW1vZHVsZXMubWQjXCIgK1xuICAgICAgICAgICAgICAgIFwiYWRkaW5nLXNlc2hhdC1mb3Itc2VhcmNoLWluLWUyZS1lbmNyeXB0ZWQtcm9vbXNcIlxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZXZlbnRJbmRleGluZ1NldHRpbmdzID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCIlKGJyYW5kKXMgaXMgbWlzc2luZyBzb21lIGNvbXBvbmVudHMgcmVxdWlyZWQgZm9yIHNlY3VyZWx5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJjYWNoaW5nIGVuY3J5cHRlZCBtZXNzYWdlcyBsb2NhbGx5LiBJZiB5b3UnZCBsaWtlIHRvIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJleHBlcmltZW50IHdpdGggdGhpcyBmZWF0dXJlLCBidWlsZCBhIGN1c3RvbSAlKGJyYW5kKXMgRGVza3RvcCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwid2l0aCA8bmF0aXZlTGluaz5zZWFyY2ggY29tcG9uZW50cyBhZGRlZDwvbmF0aXZlTGluaz4uXCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYXRpdmVMaW5rOiBzdWIgPT4gPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXtuYXRpdmVMaW5rfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICA+eyBzdWIgfTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKSB9PC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKCFFdmVudEluZGV4UGVnLnBsYXRmb3JtSGFzU3VwcG9ydCgpKSB7XG4gICAgICAgICAgICBldmVudEluZGV4aW5nU2V0dGluZ3MgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIiUoYnJhbmQpcyBjYW4ndCBzZWN1cmVseSBjYWNoZSBlbmNyeXB0ZWQgbWVzc2FnZXMgbG9jYWxseSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwid2hpbGUgcnVubmluZyBpbiBhIHdlYiBicm93c2VyLiBVc2UgPGRlc2t0b3BMaW5rPiUoYnJhbmQpcyBEZXNrdG9wPC9kZXNrdG9wTGluaz4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImZvciBlbmNyeXB0ZWQgbWVzc2FnZXMgdG8gYXBwZWFyIGluIHNlYXJjaCByZXN1bHRzLlwiLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuZCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVza3RvcExpbms6IHN1YiA9PiA8YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9XCJodHRwczovL2VsZW1lbnQuaW8vZ2V0LXN0YXJ0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICA+eyBzdWIgfTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKSB9PC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnRJbmRleGluZ1NldHRpbmdzID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVuYWJsaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyA8SW5saW5lU3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJNZXNzYWdlIHNlYXJjaCBpbml0aWFsaXNhdGlvbiBmYWlsZWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICB7IEV2ZW50SW5kZXhQZWcuZXJyb3IgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRldGFpbHM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN1bW1hcnk+eyBfdChcIkFkdmFuY2VkXCIpIH08L3N1bW1hcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgRXZlbnRJbmRleFBlZy5lcnJvci5tZXNzYWdlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtleT1cImRlbGV0ZVwiIGtpbmQ9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLmNvbmZpcm1FdmVudFN0b3JlUmVzZXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlJlc2V0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGV0YWlscz5cbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV2ZW50SW5kZXhpbmdTZXR0aW5ncztcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFTZSxNQUFNQSxlQUFOLFNBQThCQyxjQUFBLENBQU1DLFNBQXBDLENBQTBEO0VBQ3JFQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZSx5REFZQyxNQUFPQyxJQUFQLElBQWdCO01BQ2hDLE1BQU1DLFVBQVUsR0FBR0Msc0JBQUEsQ0FBY0MsR0FBZCxFQUFuQjs7TUFDQSxJQUFJQyxLQUFKOztNQUVBLElBQUk7UUFDQUEsS0FBSyxHQUFHLE1BQU1ILFVBQVUsQ0FBQ0ksUUFBWCxFQUFkO01BQ0gsQ0FGRCxDQUVFLE1BQU07UUFDSjtRQUNBO1FBQ0E7TUFDSDs7TUFFRCxLQUFLQyxRQUFMLENBQWM7UUFDVkMsY0FBYyxFQUFFSCxLQUFLLENBQUNJLElBRFo7UUFFVkMsU0FBUyxFQUFFTCxLQUFLLENBQUNLO01BRlAsQ0FBZDtJQUlILENBNUJrQjtJQUFBLGdEQXdFQSxZQUFZO01BQzNCQyxjQUFBLENBQU1DLGlCQUFOLEVBQ0k7TUFDQTtNQUZKLDZEQUdXLDJFQUhYLEtBSUk7UUFDSUMsVUFBVSxFQUFFLE1BQU0sQ0FBRTtNQUR4QixDQUpKLEVBTU8sSUFOUDtNQU1hO01BQWlCLEtBTjlC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