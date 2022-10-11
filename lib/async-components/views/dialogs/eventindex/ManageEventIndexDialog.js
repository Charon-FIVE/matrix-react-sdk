"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../../SdkConfig"));

var _SettingsStore = _interopRequireDefault(require("../../../../settings/SettingsStore"));

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _FormattingUtils = require("../../../../utils/FormattingUtils");

var _EventIndexPeg = _interopRequireDefault(require("../../../../indexing/EventIndexPeg"));

var _SettingLevel = require("../../../../settings/SettingLevel");

var _Field = _interopRequireDefault(require("../../../../components/views/elements/Field"));

var _BaseDialog = _interopRequireDefault(require("../../../../components/views/dialogs/BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../../../../components/views/elements/DialogButtons"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
 * Allows the user to introspect the event index state and disable it.
 */
class ManageEventIndexDialog extends _react.default.Component {
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

      let currentRoom = null;
      if (room) currentRoom = room.name;
      const roomStats = eventIndex.crawlingRooms();
      const crawlingRoomsCount = roomStats.crawlingRooms.size;
      const roomCount = roomStats.totalRooms.size;
      this.setState({
        eventIndexSize: stats.size,
        eventCount: stats.eventCount,
        crawlingRoomsCount: crawlingRoomsCount,
        roomCount: roomCount,
        currentRoom: currentRoom
      });
    });
    (0, _defineProperty2.default)(this, "onDisable", async () => {
      const DisableEventIndexDialog = (await Promise.resolve().then(() => _interopRequireWildcard(require("./DisableEventIndexDialog")))).default;

      _Modal.default.createDialog(DisableEventIndexDialog, null, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "onCrawlerSleepTimeChange", e => {
      this.setState({
        crawlerSleepTime: e.target.value
      });

      _SettingsStore.default.setValue("crawlerSleepTime", null, _SettingLevel.SettingLevel.DEVICE, e.target.value);
    });
    this.state = {
      eventIndexSize: 0,
      eventCount: 0,
      crawlingRoomsCount: 0,
      roomCount: 0,
      currentRoom: null,
      crawlerSleepTime: _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, 'crawlerSleepTime')
    };
  }

  componentWillUnmount() {
    const eventIndex = _EventIndexPeg.default.get();

    if (eventIndex !== null) {
      eventIndex.removeListener("changedCheckpoint", this.updateCurrentRoom);
    }
  }

  async componentDidMount() {
    let eventIndexSize = 0;
    let crawlingRoomsCount = 0;
    let roomCount = 0;
    let eventCount = 0;
    let currentRoom = null;

    const eventIndex = _EventIndexPeg.default.get();

    if (eventIndex !== null) {
      eventIndex.on("changedCheckpoint", this.updateCurrentRoom);

      try {
        const stats = await eventIndex.getStats();
        eventIndexSize = stats.size;
        eventCount = stats.eventCount;
      } catch {// This call may fail if sporadically, not a huge issue as we
        // will try later again in the updateCurrentRoom call and
        // probably succeed.
      }

      const roomStats = eventIndex.crawlingRooms();
      crawlingRoomsCount = roomStats.crawlingRooms.size;
      roomCount = roomStats.totalRooms.size;
      const room = eventIndex.currentRoom();
      if (room) currentRoom = room.name;
    }

    this.setState({
      eventIndexSize,
      eventCount,
      crawlingRoomsCount,
      roomCount,
      currentRoom
    });
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    let crawlerState;

    if (this.state.currentRoom === null) {
      crawlerState = (0, _languageHandler._t)("Not currently indexing messages for any room.");
    } else {
      crawlerState = (0, _languageHandler._t)("Currently indexing: %(currentRoom)s", {
        currentRoom: this.state.currentRoom
      });
    }

    const doneRooms = Math.max(0, this.state.roomCount - this.state.crawlingRoomsCount);

    const eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("%(brand)s is securely caching encrypted messages locally for them " + "to appear in search results:", {
      brand
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, crawlerState, /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Space used:"), " ", (0, _FormattingUtils.formatBytes)(this.state.eventIndexSize, 0), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Indexed messages:"), " ", (0, _FormattingUtils.formatCountLong)(this.state.eventCount), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Indexed rooms:"), " ", (0, _languageHandler._t)("%(doneRooms)s out of %(totalRooms)s", {
      doneRooms: (0, _FormattingUtils.formatCountLong)(doneRooms),
      totalRooms: (0, _FormattingUtils.formatCountLong)(this.state.roomCount)
    }), " ", /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: (0, _languageHandler._t)('Message downloading sleep time(ms)'),
      type: "number",
      value: this.state.crawlerSleepTime.toString(),
      onChange: this.onCrawlerSleepTimeChange
    })));

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_ManageEventIndexDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Message search")
    }, eventIndexingSettings, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Done"),
      onPrimaryButtonClick: this.props.onFinished,
      primaryButtonClass: "primary",
      cancelButton: (0, _languageHandler._t)("Disable"),
      onCancel: this.onDisable,
      cancelButtonClass: "danger"
    }));
  }

}

exports.default = ManageEventIndexDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYW5hZ2VFdmVudEluZGV4RGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicm9vbSIsImV2ZW50SW5kZXgiLCJFdmVudEluZGV4UGVnIiwiZ2V0Iiwic3RhdHMiLCJnZXRTdGF0cyIsImN1cnJlbnRSb29tIiwibmFtZSIsInJvb21TdGF0cyIsImNyYXdsaW5nUm9vbXMiLCJjcmF3bGluZ1Jvb21zQ291bnQiLCJzaXplIiwicm9vbUNvdW50IiwidG90YWxSb29tcyIsInNldFN0YXRlIiwiZXZlbnRJbmRleFNpemUiLCJldmVudENvdW50IiwiRGlzYWJsZUV2ZW50SW5kZXhEaWFsb2ciLCJkZWZhdWx0IiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJlIiwiY3Jhd2xlclNsZWVwVGltZSIsInRhcmdldCIsInZhbHVlIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwic3RhdGUiLCJnZXRWYWx1ZUF0IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsInVwZGF0ZUN1cnJlbnRSb29tIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsInJlbmRlciIsImJyYW5kIiwiU2RrQ29uZmlnIiwiY3Jhd2xlclN0YXRlIiwiX3QiLCJkb25lUm9vbXMiLCJNYXRoIiwibWF4IiwiZXZlbnRJbmRleGluZ1NldHRpbmdzIiwiZm9ybWF0Qnl0ZXMiLCJmb3JtYXRDb3VudExvbmciLCJ0b1N0cmluZyIsIm9uQ3Jhd2xlclNsZWVwVGltZUNoYW5nZSIsIm9uRmluaXNoZWQiLCJvbkRpc2FibGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL2V2ZW50aW5kZXgvTWFuYWdlRXZlbnRJbmRleERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uLy4uLy4uLy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IGZvcm1hdEJ5dGVzLCBmb3JtYXRDb3VudExvbmcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvRm9ybWF0dGluZ1V0aWxzXCI7XG5pbXBvcnQgRXZlbnRJbmRleFBlZyBmcm9tIFwiLi4vLi4vLi4vLi4vaW5kZXhpbmcvRXZlbnRJbmRleFBlZ1wiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRmllbGQnO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0lEaWFsb2dQcm9wc1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHt9XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGV2ZW50SW5kZXhTaXplOiBudW1iZXI7XG4gICAgZXZlbnRDb3VudDogbnVtYmVyO1xuICAgIGNyYXdsaW5nUm9vbXNDb3VudDogbnVtYmVyO1xuICAgIHJvb21Db3VudDogbnVtYmVyO1xuICAgIGN1cnJlbnRSb29tOiBzdHJpbmc7XG4gICAgY3Jhd2xlclNsZWVwVGltZTogbnVtYmVyO1xufVxuXG4vKlxuICogQWxsb3dzIHRoZSB1c2VyIHRvIGludHJvc3BlY3QgdGhlIGV2ZW50IGluZGV4IHN0YXRlIGFuZCBkaXNhYmxlIGl0LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYW5hZ2VFdmVudEluZGV4RGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBldmVudEluZGV4U2l6ZTogMCxcbiAgICAgICAgICAgIGV2ZW50Q291bnQ6IDAsXG4gICAgICAgICAgICBjcmF3bGluZ1Jvb21zQ291bnQ6IDAsXG4gICAgICAgICAgICByb29tQ291bnQ6IDAsXG4gICAgICAgICAgICBjdXJyZW50Um9vbTogbnVsbCxcbiAgICAgICAgICAgIGNyYXdsZXJTbGVlcFRpbWU6XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFNldHRpbmdMZXZlbC5ERVZJQ0UsICdjcmF3bGVyU2xlZXBUaW1lJyksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdXBkYXRlQ3VycmVudFJvb20gPSBhc3luYyAocm9vbSkgPT4ge1xuICAgICAgICBjb25zdCBldmVudEluZGV4ID0gRXZlbnRJbmRleFBlZy5nZXQoKTtcbiAgICAgICAgbGV0IHN0YXRzO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdGF0cyA9IGF3YWl0IGV2ZW50SW5kZXguZ2V0U3RhdHMoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBUaGlzIGNhbGwgbWF5IGZhaWwgaWYgc3BvcmFkaWNhbGx5LCBub3QgYSBodWdlIGlzc3VlIGFzIHdlIHdpbGxcbiAgICAgICAgICAgIC8vIHRyeSBsYXRlciBhZ2FpbiBhbmQgcHJvYmFibHkgc3VjY2VlZC5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjdXJyZW50Um9vbSA9IG51bGw7XG5cbiAgICAgICAgaWYgKHJvb20pIGN1cnJlbnRSb29tID0gcm9vbS5uYW1lO1xuICAgICAgICBjb25zdCByb29tU3RhdHMgPSBldmVudEluZGV4LmNyYXdsaW5nUm9vbXMoKTtcbiAgICAgICAgY29uc3QgY3Jhd2xpbmdSb29tc0NvdW50ID0gcm9vbVN0YXRzLmNyYXdsaW5nUm9vbXMuc2l6ZTtcbiAgICAgICAgY29uc3Qgcm9vbUNvdW50ID0gcm9vbVN0YXRzLnRvdGFsUm9vbXMuc2l6ZTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXhTaXplOiBzdGF0cy5zaXplLFxuICAgICAgICAgICAgZXZlbnRDb3VudDogc3RhdHMuZXZlbnRDb3VudCxcbiAgICAgICAgICAgIGNyYXdsaW5nUm9vbXNDb3VudDogY3Jhd2xpbmdSb29tc0NvdW50LFxuICAgICAgICAgICAgcm9vbUNvdW50OiByb29tQ291bnQsXG4gICAgICAgICAgICBjdXJyZW50Um9vbTogY3VycmVudFJvb20sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50SW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXgucmVtb3ZlTGlzdGVuZXIoXCJjaGFuZ2VkQ2hlY2twb2ludFwiLCB0aGlzLnVwZGF0ZUN1cnJlbnRSb29tKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGNvbXBvbmVudERpZE1vdW50KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsZXQgZXZlbnRJbmRleFNpemUgPSAwO1xuICAgICAgICBsZXQgY3Jhd2xpbmdSb29tc0NvdW50ID0gMDtcbiAgICAgICAgbGV0IHJvb21Db3VudCA9IDA7XG4gICAgICAgIGxldCBldmVudENvdW50ID0gMDtcbiAgICAgICAgbGV0IGN1cnJlbnRSb29tID0gbnVsbDtcblxuICAgICAgICBjb25zdCBldmVudEluZGV4ID0gRXZlbnRJbmRleFBlZy5nZXQoKTtcblxuICAgICAgICBpZiAoZXZlbnRJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZXZlbnRJbmRleC5vbihcImNoYW5nZWRDaGVja3BvaW50XCIsIHRoaXMudXBkYXRlQ3VycmVudFJvb20pO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZXZlbnRJbmRleC5nZXRTdGF0cygpO1xuICAgICAgICAgICAgICAgIGV2ZW50SW5kZXhTaXplID0gc3RhdHMuc2l6ZTtcbiAgICAgICAgICAgICAgICBldmVudENvdW50ID0gc3RhdHMuZXZlbnRDb3VudDtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgY2FsbCBtYXkgZmFpbCBpZiBzcG9yYWRpY2FsbHksIG5vdCBhIGh1Z2UgaXNzdWUgYXMgd2VcbiAgICAgICAgICAgICAgICAvLyB3aWxsIHRyeSBsYXRlciBhZ2FpbiBpbiB0aGUgdXBkYXRlQ3VycmVudFJvb20gY2FsbCBhbmRcbiAgICAgICAgICAgICAgICAvLyBwcm9iYWJseSBzdWNjZWVkLlxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByb29tU3RhdHMgPSBldmVudEluZGV4LmNyYXdsaW5nUm9vbXMoKTtcbiAgICAgICAgICAgIGNyYXdsaW5nUm9vbXNDb3VudCA9IHJvb21TdGF0cy5jcmF3bGluZ1Jvb21zLnNpemU7XG4gICAgICAgICAgICByb29tQ291bnQgPSByb29tU3RhdHMudG90YWxSb29tcy5zaXplO1xuXG4gICAgICAgICAgICBjb25zdCByb29tID0gZXZlbnRJbmRleC5jdXJyZW50Um9vbSgpO1xuICAgICAgICAgICAgaWYgKHJvb20pIGN1cnJlbnRSb29tID0gcm9vbS5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBldmVudEluZGV4U2l6ZSxcbiAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICBjcmF3bGluZ1Jvb21zQ291bnQsXG4gICAgICAgICAgICByb29tQ291bnQsXG4gICAgICAgICAgICBjdXJyZW50Um9vbSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRpc2FibGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IERpc2FibGVFdmVudEluZGV4RGlhbG9nID0gKGF3YWl0IGltcG9ydChcIi4vRGlzYWJsZUV2ZW50SW5kZXhEaWFsb2dcIikpLmRlZmF1bHQ7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhEaXNhYmxlRXZlbnRJbmRleERpYWxvZywgbnVsbCwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DcmF3bGVyU2xlZXBUaW1lQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNyYXdsZXJTbGVlcFRpbWU6IGUudGFyZ2V0LnZhbHVlIH0pO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiY3Jhd2xlclNsZWVwVGltZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBlLnRhcmdldC52YWx1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG5cbiAgICAgICAgbGV0IGNyYXdsZXJTdGF0ZTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VycmVudFJvb20gPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNyYXdsZXJTdGF0ZSA9IF90KFwiTm90IGN1cnJlbnRseSBpbmRleGluZyBtZXNzYWdlcyBmb3IgYW55IHJvb20uXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3Jhd2xlclN0YXRlID0gKFxuICAgICAgICAgICAgICAgIF90KFwiQ3VycmVudGx5IGluZGV4aW5nOiAlKGN1cnJlbnRSb29tKXNcIiwgeyBjdXJyZW50Um9vbTogdGhpcy5zdGF0ZS5jdXJyZW50Um9vbSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRvbmVSb29tcyA9IE1hdGgubWF4KDAsICh0aGlzLnN0YXRlLnJvb21Db3VudCAtIHRoaXMuc3RhdGUuY3Jhd2xpbmdSb29tc0NvdW50KSk7XG5cbiAgICAgICAgY29uc3QgZXZlbnRJbmRleGluZ1NldHRpbmdzID0gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICBcIiUoYnJhbmQpcyBpcyBzZWN1cmVseSBjYWNoaW5nIGVuY3J5cHRlZCBtZXNzYWdlcyBsb2NhbGx5IGZvciB0aGVtIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ0byBhcHBlYXIgaW4gc2VhcmNoIHJlc3VsdHM6XCIsXG4gICAgICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7IGNyYXdsZXJTdGF0ZSB9PGJyIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTcGFjZSB1c2VkOlwiKSB9IHsgZm9ybWF0Qnl0ZXModGhpcy5zdGF0ZS5ldmVudEluZGV4U2l6ZSwgMCkgfTxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiSW5kZXhlZCBtZXNzYWdlczpcIikgfSB7IGZvcm1hdENvdW50TG9uZyh0aGlzLnN0YXRlLmV2ZW50Q291bnQpIH08YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkluZGV4ZWQgcm9vbXM6XCIpIH0geyBfdChcIiUoZG9uZVJvb21zKXMgb3V0IG9mICUodG90YWxSb29tcylzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmVSb29tczogZm9ybWF0Q291bnRMb25nKGRvbmVSb29tcyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFJvb21zOiBmb3JtYXRDb3VudExvbmcodGhpcy5zdGF0ZS5yb29tQ291bnQpLFxuICAgICAgICAgICAgICAgICAgICB9KSB9IDxiciAvPlxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnTWVzc2FnZSBkb3dubG9hZGluZyBzbGVlcCB0aW1lKG1zKScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT0nbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuY3Jhd2xlclNsZWVwVGltZS50b1N0cmluZygpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DcmF3bGVyU2xlZXBUaW1lQ2hhbmdlfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfTWFuYWdlRXZlbnRJbmRleERpYWxvZydcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiTWVzc2FnZSBzZWFyY2hcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBldmVudEluZGV4aW5nU2V0dGluZ3MgfVxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiRG9uZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbkNsYXNzPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbj17X3QoXCJEaXNhYmxlXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkRpc2FibGV9XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbkNsYXNzPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWNBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLHNCQUFOLFNBQXFDQyxjQUFBLENBQU1DLFNBQTNDLENBQXFFO0VBQ2hGQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZSx5REFjQyxNQUFPQyxJQUFQLElBQWdCO01BQ2hDLE1BQU1DLFVBQVUsR0FBR0Msc0JBQUEsQ0FBY0MsR0FBZCxFQUFuQjs7TUFDQSxJQUFJQyxLQUFKOztNQUVBLElBQUk7UUFDQUEsS0FBSyxHQUFHLE1BQU1ILFVBQVUsQ0FBQ0ksUUFBWCxFQUFkO01BQ0gsQ0FGRCxDQUVFLE1BQU07UUFDSjtRQUNBO1FBQ0E7TUFDSDs7TUFFRCxJQUFJQyxXQUFXLEdBQUcsSUFBbEI7TUFFQSxJQUFJTixJQUFKLEVBQVVNLFdBQVcsR0FBR04sSUFBSSxDQUFDTyxJQUFuQjtNQUNWLE1BQU1DLFNBQVMsR0FBR1AsVUFBVSxDQUFDUSxhQUFYLEVBQWxCO01BQ0EsTUFBTUMsa0JBQWtCLEdBQUdGLFNBQVMsQ0FBQ0MsYUFBVixDQUF3QkUsSUFBbkQ7TUFDQSxNQUFNQyxTQUFTLEdBQUdKLFNBQVMsQ0FBQ0ssVUFBVixDQUFxQkYsSUFBdkM7TUFFQSxLQUFLRyxRQUFMLENBQWM7UUFDVkMsY0FBYyxFQUFFWCxLQUFLLENBQUNPLElBRFo7UUFFVkssVUFBVSxFQUFFWixLQUFLLENBQUNZLFVBRlI7UUFHVk4sa0JBQWtCLEVBQUVBLGtCQUhWO1FBSVZFLFNBQVMsRUFBRUEsU0FKRDtRQUtWTixXQUFXLEVBQUVBO01BTEgsQ0FBZDtJQU9ILENBeENrQjtJQUFBLGlE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