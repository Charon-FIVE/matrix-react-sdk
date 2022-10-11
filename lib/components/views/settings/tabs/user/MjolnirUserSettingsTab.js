"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _Mjolnir = require("../../../../../mjolnir/Mjolnir");

var _BanList = require("../../../../../mjolnir/BanList");

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _ErrorDialog = _interopRequireDefault(require("../../../dialogs/ErrorDialog"));

var _QuestionDialog = _interopRequireDefault(require("../../../dialogs/QuestionDialog"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _Field = _interopRequireDefault(require("../../../elements/Field"));

/*
Copyright 2019-2021 The Matrix.org Foundation C.I.C.

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
class MjolnirUserSettingsTab extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onPersonalRuleChanged", e => {
      this.setState({
        newPersonalRule: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onNewListChanged", e => {
      this.setState({
        newList: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onAddPersonalRule", async e => {
      e.preventDefault();
      e.stopPropagation();
      let kind = _BanList.RULE_SERVER;

      if (this.state.newPersonalRule.startsWith("@")) {
        kind = _BanList.RULE_USER;
      }

      this.setState({
        busy: true
      });

      try {
        const list = await _Mjolnir.Mjolnir.sharedInstance().getOrCreatePersonalList();
        await list.banEntity(kind, this.state.newPersonalRule, (0, _languageHandler._t)("Ignored/Blocked"));
        this.setState({
          newPersonalRule: ""
        }); // this will also cause the new rule to be rendered
      } catch (e) {
        _logger.logger.error(e);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('Error adding ignored user/server'),
          description: (0, _languageHandler._t)('Something went wrong. Please try again or view your console for hints.')
        });
      } finally {
        this.setState({
          busy: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "onSubscribeList", async e => {
      e.preventDefault();
      e.stopPropagation();
      this.setState({
        busy: true
      });

      try {
        const room = await _MatrixClientPeg.MatrixClientPeg.get().joinRoom(this.state.newList);
        await _Mjolnir.Mjolnir.sharedInstance().subscribeToList(room.roomId);
        this.setState({
          newList: ""
        }); // this will also cause the new rule to be rendered
      } catch (e) {
        _logger.logger.error(e);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('Error subscribing to list'),
          description: (0, _languageHandler._t)('Please verify the room ID or address and try again.')
        });
      } finally {
        this.setState({
          busy: false
        });
      }
    });
    this.state = {
      busy: false,
      newPersonalRule: "",
      newList: ""
    };
  }

  async removePersonalRule(rule) {
    this.setState({
      busy: true
    });

    try {
      const list = _Mjolnir.Mjolnir.sharedInstance().getPersonalList();

      await list.unbanEntity(rule.kind, rule.entity);
    } catch (e) {
      _logger.logger.error(e);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Error removing ignored user/server'),
        description: (0, _languageHandler._t)('Something went wrong. Please try again or view your console for hints.')
      });
    } finally {
      this.setState({
        busy: false
      });
    }
  }

  async unsubscribeFromList(list) {
    this.setState({
      busy: true
    });

    try {
      await _Mjolnir.Mjolnir.sharedInstance().unsubscribeFromList(list.roomId);
      await _MatrixClientPeg.MatrixClientPeg.get().leave(list.roomId);
    } catch (e) {
      _logger.logger.error(e);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Error unsubscribing from list'),
        description: (0, _languageHandler._t)('Please try again or view your console for hints.')
      });
    } finally {
      this.setState({
        busy: false
      });
    }
  }

  viewListRules(list) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(list.roomId);

    const name = room ? room.name : list.roomId;

    const renderRules = rules => {
      if (rules.length === 0) return /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)("None"));
      const tiles = [];

      for (const rule of rules) {
        tiles.push( /*#__PURE__*/_react.default.createElement("li", {
          key: rule.kind + rule.entity
        }, /*#__PURE__*/_react.default.createElement("code", null, rule.entity)));
      }

      return /*#__PURE__*/_react.default.createElement("ul", null, tiles);
    };

    _Modal.default.createDialog(_QuestionDialog.default, {
      title: (0, _languageHandler._t)("Ban list rules - %(roomName)s", {
        roomName: name
      }),
      description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Server rules")), renderRules(list.serverRules), /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("User rules")), renderRules(list.userRules)),
      button: (0, _languageHandler._t)("Close"),
      hasCancelButton: false
    });
  }

  renderPersonalBanListRules() {
    const list = _Mjolnir.Mjolnir.sharedInstance().getPersonalList();

    const rules = list ? [...list.userRules, ...list.serverRules] : [];
    if (!list || rules.length <= 0) return /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)("You have not ignored anyone."));
    const tiles = [];

    for (const rule of rules) {
      tiles.push( /*#__PURE__*/_react.default.createElement("li", {
        key: rule.entity,
        className: "mx_MjolnirUserSettingsTab_listItem"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "danger_sm",
        onClick: () => this.removePersonalRule(rule),
        disabled: this.state.busy
      }, (0, _languageHandler._t)("Remove")), "\xA0", /*#__PURE__*/_react.default.createElement("code", null, rule.entity)));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are currently ignoring:")), /*#__PURE__*/_react.default.createElement("ul", null, tiles));
  }

  renderSubscribedBanLists() {
    const personalList = _Mjolnir.Mjolnir.sharedInstance().getPersonalList();

    const lists = _Mjolnir.Mjolnir.sharedInstance().lists.filter(b => {
      return personalList ? personalList.roomId !== b.roomId : true;
    });

    if (!lists || lists.length <= 0) return /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)("You are not subscribed to any lists"));
    const tiles = [];

    for (const list of lists) {
      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(list.roomId);

      const name = room ? /*#__PURE__*/_react.default.createElement("span", null, room.name, " (", /*#__PURE__*/_react.default.createElement("code", null, list.roomId), ")") : /*#__PURE__*/_react.default.createElement("code", null, "list.roomId");
      tiles.push( /*#__PURE__*/_react.default.createElement("li", {
        key: list.roomId,
        className: "mx_MjolnirUserSettingsTab_listItem"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "danger_sm",
        onClick: () => this.unsubscribeFromList(list),
        disabled: this.state.busy
      }, (0, _languageHandler._t)("Unsubscribe")), "\xA0", /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary_sm",
        onClick: () => this.viewListRules(list),
        disabled: this.state.busy
      }, (0, _languageHandler._t)("View rules")), "\xA0", name));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are currently subscribed to:")), /*#__PURE__*/_react.default.createElement("ul", null, tiles));
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_MjolnirUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Ignored users")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "warning"
    }, (0, _languageHandler._t)("⚠ These settings are meant for advanced users.")), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Add users and servers you want to ignore here. Use asterisks " + "to have %(brand)s match any characters. For example, <code>@bot:*</code> " + "would ignore all users that have the name 'bot' on any server.", {
      brand
    }, {
      code: s => /*#__PURE__*/_react.default.createElement("code", null, s)
    }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Ignoring people is done through ban lists which contain rules for " + "who to ban. Subscribing to a ban list means the users/servers blocked by " + "that list will be hidden from you."))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Personal ban list")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)("Your personal ban list holds all the users/servers you personally don't " + "want to see messages from. After ignoring your first user/server, a new room " + "will show up in your room list named 'My Ban List' - stay in this room to keep " + "the ban list in effect.")), /*#__PURE__*/_react.default.createElement("div", null, this.renderPersonalBanListRules()), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onAddPersonalRule,
      autoComplete: "off"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      label: (0, _languageHandler._t)("Server or user ID to ignore"),
      placeholder: (0, _languageHandler._t)("eg: @bot:* or example.org"),
      value: this.state.newPersonalRule,
      onChange: this.onPersonalRuleChanged
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      type: "submit",
      kind: "primary",
      onClick: this.onAddPersonalRule,
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Ignore"))))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Subscribed lists")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "warning"
    }, (0, _languageHandler._t)("Subscribing to a ban list will cause you to join it!")), "\xA0", /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("If this isn't what you want, please use a different tool to ignore users."))), /*#__PURE__*/_react.default.createElement("div", null, this.renderSubscribedBanLists()), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubscribeList,
      autoComplete: "off"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      label: (0, _languageHandler._t)("Room ID or address of ban list"),
      value: this.state.newList,
      onChange: this.onNewListChanged
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      type: "submit",
      kind: "primary",
      onClick: this.onSubscribeList,
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Subscribe"))))));
  }

}

exports.default = MjolnirUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNam9sbmlyVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZSIsInNldFN0YXRlIiwibmV3UGVyc29uYWxSdWxlIiwidGFyZ2V0IiwidmFsdWUiLCJuZXdMaXN0IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJraW5kIiwiUlVMRV9TRVJWRVIiLCJzdGF0ZSIsInN0YXJ0c1dpdGgiLCJSVUxFX1VTRVIiLCJidXN5IiwibGlzdCIsIk1qb2xuaXIiLCJzaGFyZWRJbnN0YW5jZSIsImdldE9yQ3JlYXRlUGVyc29uYWxMaXN0IiwiYmFuRW50aXR5IiwiX3QiLCJsb2dnZXIiLCJlcnJvciIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwicm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImpvaW5Sb29tIiwic3Vic2NyaWJlVG9MaXN0Iiwicm9vbUlkIiwicmVtb3ZlUGVyc29uYWxSdWxlIiwicnVsZSIsImdldFBlcnNvbmFsTGlzdCIsInVuYmFuRW50aXR5IiwiZW50aXR5IiwidW5zdWJzY3JpYmVGcm9tTGlzdCIsImxlYXZlIiwidmlld0xpc3RSdWxlcyIsImdldFJvb20iLCJuYW1lIiwicmVuZGVyUnVsZXMiLCJydWxlcyIsImxlbmd0aCIsInRpbGVzIiwicHVzaCIsIlF1ZXN0aW9uRGlhbG9nIiwicm9vbU5hbWUiLCJzZXJ2ZXJSdWxlcyIsInVzZXJSdWxlcyIsImJ1dHRvbiIsImhhc0NhbmNlbEJ1dHRvbiIsInJlbmRlclBlcnNvbmFsQmFuTGlzdFJ1bGVzIiwicmVuZGVyU3Vic2NyaWJlZEJhbkxpc3RzIiwicGVyc29uYWxMaXN0IiwibGlzdHMiLCJmaWx0ZXIiLCJiIiwicmVuZGVyIiwiYnJhbmQiLCJTZGtDb25maWciLCJjb2RlIiwicyIsIm9uQWRkUGVyc29uYWxSdWxlIiwib25QZXJzb25hbFJ1bGVDaGFuZ2VkIiwib25TdWJzY3JpYmVMaXN0Iiwib25OZXdMaXN0Q2hhbmdlZCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9Nam9sbmlyVXNlclNldHRpbmdzVGFiLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTktMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBNam9sbmlyIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL21qb2xuaXIvTWpvbG5pclwiO1xuaW1wb3J0IHsgTGlzdFJ1bGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbWpvbG5pci9MaXN0UnVsZVwiO1xuaW1wb3J0IHsgQmFuTGlzdCwgUlVMRV9TRVJWRVIsIFJVTEVfVVNFUiB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9tam9sbmlyL0Jhbkxpc3RcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vLi4vLi4vZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuLi8uLi8uLi9kaWFsb2dzL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9GaWVsZFwiO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBidXN5OiBib29sZWFuO1xuICAgIG5ld1BlcnNvbmFsUnVsZTogc3RyaW5nO1xuICAgIG5ld0xpc3Q6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWpvbG5pclVzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx7fSwgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIG5ld1BlcnNvbmFsUnVsZTogXCJcIixcbiAgICAgICAgICAgIG5ld0xpc3Q6IFwiXCIsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblBlcnNvbmFsUnVsZUNoYW5nZWQgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbmV3UGVyc29uYWxSdWxlOiBlLnRhcmdldC52YWx1ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk5ld0xpc3RDaGFuZ2VkID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG5ld0xpc3Q6IGUudGFyZ2V0LnZhbHVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWRkUGVyc29uYWxSdWxlID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGxldCBraW5kID0gUlVMRV9TRVJWRVI7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm5ld1BlcnNvbmFsUnVsZS5zdGFydHNXaXRoKFwiQFwiKSkge1xuICAgICAgICAgICAga2luZCA9IFJVTEVfVVNFUjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGF3YWl0IE1qb2xuaXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRPckNyZWF0ZVBlcnNvbmFsTGlzdCgpO1xuICAgICAgICAgICAgYXdhaXQgbGlzdC5iYW5FbnRpdHkoa2luZCwgdGhpcy5zdGF0ZS5uZXdQZXJzb25hbFJ1bGUsIF90KFwiSWdub3JlZC9CbG9ja2VkXCIpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBuZXdQZXJzb25hbFJ1bGU6IFwiXCIgfSk7IC8vIHRoaXMgd2lsbCBhbHNvIGNhdXNlIHRoZSBuZXcgcnVsZSB0byBiZSByZW5kZXJlZFxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG5cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3IgYWRkaW5nIGlnbm9yZWQgdXNlci9zZXJ2ZXInKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluIG9yIHZpZXcgeW91ciBjb25zb2xlIGZvciBoaW50cy4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJ1c3k6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TdWJzY3JpYmVMaXN0ID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5qb2luUm9vbSh0aGlzLnN0YXRlLm5ld0xpc3QpO1xuICAgICAgICAgICAgYXdhaXQgTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLnN1YnNjcmliZVRvTGlzdChyb29tLnJvb21JZCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbmV3TGlzdDogXCJcIiB9KTsgLy8gdGhpcyB3aWxsIGFsc28gY2F1c2UgdGhlIG5ldyBydWxlIHRvIGJlIHJlbmRlcmVkXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcblxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvciBzdWJzY3JpYmluZyB0byBsaXN0JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdQbGVhc2UgdmVyaWZ5IHRoZSByb29tIElEIG9yIGFkZHJlc3MgYW5kIHRyeSBhZ2Fpbi4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJ1c3k6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgcmVtb3ZlUGVyc29uYWxSdWxlKHJ1bGU6IExpc3RSdWxlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IE1qb2xuaXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRQZXJzb25hbExpc3QoKTtcbiAgICAgICAgICAgIGF3YWl0IGxpc3QudW5iYW5FbnRpdHkocnVsZS5raW5kLCBydWxlLmVudGl0eSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcblxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvciByZW1vdmluZyBpZ25vcmVkIHVzZXIvc2VydmVyJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2FpbiBvciB2aWV3IHlvdXIgY29uc29sZSBmb3IgaGludHMuJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdW5zdWJzY3JpYmVGcm9tTGlzdChsaXN0OiBCYW5MaXN0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLnVuc3Vic2NyaWJlRnJvbUxpc3QobGlzdC5yb29tSWQpO1xuICAgICAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmxlYXZlKGxpc3Qucm9vbUlkKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIHVuc3Vic2NyaWJpbmcgZnJvbSBsaXN0JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdQbGVhc2UgdHJ5IGFnYWluIG9yIHZpZXcgeW91ciBjb25zb2xlIGZvciBoaW50cy4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJ1c3k6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3TGlzdFJ1bGVzKGxpc3Q6IEJhbkxpc3QpIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKGxpc3Qucm9vbUlkKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHJvb20gPyByb29tLm5hbWUgOiBsaXN0LnJvb21JZDtcblxuICAgICAgICBjb25zdCByZW5kZXJSdWxlcyA9IChydWxlczogTGlzdFJ1bGVbXSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDxpPnsgX3QoXCJOb25lXCIpIH08L2k+O1xuXG4gICAgICAgICAgICBjb25zdCB0aWxlcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIHJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCg8bGkga2V5PXtydWxlLmtpbmQgKyBydWxlLmVudGl0eX0+PGNvZGU+eyBydWxlLmVudGl0eSB9PC9jb2RlPjwvbGk+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiA8dWw+eyB0aWxlcyB9PC91bD47XG4gICAgICAgIH07XG5cbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJCYW4gbGlzdCBydWxlcyAtICUocm9vbU5hbWUpc1wiLCB7IHJvb21OYW1lOiBuYW1lIH0pLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDM+eyBfdChcIlNlcnZlciBydWxlc1wiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgeyByZW5kZXJSdWxlcyhsaXN0LnNlcnZlclJ1bGVzKSB9XG4gICAgICAgICAgICAgICAgICAgIDxoMz57IF90KFwiVXNlciBydWxlc1wiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgeyByZW5kZXJSdWxlcyhsaXN0LnVzZXJSdWxlcykgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDbG9zZVwiKSxcbiAgICAgICAgICAgIGhhc0NhbmNlbEJ1dHRvbjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGVyc29uYWxCYW5MaXN0UnVsZXMoKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkuZ2V0UGVyc29uYWxMaXN0KCk7XG4gICAgICAgIGNvbnN0IHJ1bGVzID0gbGlzdCA/IFsuLi5saXN0LnVzZXJSdWxlcywgLi4ubGlzdC5zZXJ2ZXJSdWxlc10gOiBbXTtcbiAgICAgICAgaWYgKCFsaXN0IHx8IHJ1bGVzLmxlbmd0aCA8PSAwKSByZXR1cm4gPGk+eyBfdChcIllvdSBoYXZlIG5vdCBpZ25vcmVkIGFueW9uZS5cIikgfTwvaT47XG5cbiAgICAgICAgY29uc3QgdGlsZXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIHJ1bGVzKSB7XG4gICAgICAgICAgICB0aWxlcy5wdXNoKFxuICAgICAgICAgICAgICAgIDxsaSBrZXk9e3J1bGUuZW50aXR5fSBjbGFzc05hbWU9XCJteF9Nam9sbmlyVXNlclNldHRpbmdzVGFiX2xpc3RJdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwiZGFuZ2VyX3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucmVtb3ZlUGVyc29uYWxSdWxlKHJ1bGUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlJlbW92ZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4mbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgPGNvZGU+eyBydWxlLmVudGl0eSB9PC9jb2RlPlxuICAgICAgICAgICAgICAgIDwvbGk+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJZb3UgYXJlIGN1cnJlbnRseSBpZ25vcmluZzpcIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8dWw+eyB0aWxlcyB9PC91bD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyU3Vic2NyaWJlZEJhbkxpc3RzKCkge1xuICAgICAgICBjb25zdCBwZXJzb25hbExpc3QgPSBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkuZ2V0UGVyc29uYWxMaXN0KCk7XG4gICAgICAgIGNvbnN0IGxpc3RzID0gTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLmxpc3RzLmZpbHRlcihiID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwZXJzb25hbExpc3Q/IHBlcnNvbmFsTGlzdC5yb29tSWQgIT09IGIucm9vbUlkIDogdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghbGlzdHMgfHwgbGlzdHMubGVuZ3RoIDw9IDApIHJldHVybiA8aT57IF90KFwiWW91IGFyZSBub3Qgc3Vic2NyaWJlZCB0byBhbnkgbGlzdHNcIikgfTwvaT47XG5cbiAgICAgICAgY29uc3QgdGlsZXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBsaXN0IG9mIGxpc3RzKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20obGlzdC5yb29tSWQpO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHJvb20gPyA8c3Bhbj57IHJvb20ubmFtZSB9ICg8Y29kZT57IGxpc3Qucm9vbUlkIH08L2NvZGU+KTwvc3Bhbj4gOiA8Y29kZT5saXN0LnJvb21JZDwvY29kZT47XG4gICAgICAgICAgICB0aWxlcy5wdXNoKFxuICAgICAgICAgICAgICAgIDxsaSBrZXk9e2xpc3Qucm9vbUlkfSBjbGFzc05hbWU9XCJteF9Nam9sbmlyVXNlclNldHRpbmdzVGFiX2xpc3RJdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwiZGFuZ2VyX3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMudW5zdWJzY3JpYmVGcm9tTGlzdChsaXN0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJVbnN1YnNjcmliZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4mbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMudmlld0xpc3RSdWxlcyhsaXN0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJWaWV3IHJ1bGVzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWUgfVxuICAgICAgICAgICAgICAgIDwvbGk+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJZb3UgYXJlIGN1cnJlbnRseSBzdWJzY3JpYmVkIHRvOlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgIDx1bD57IHRpbGVzIH08L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYiBteF9Nam9sbmlyVXNlclNldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+eyBfdChcIklnbm9yZWQgdXNlcnNcIikgfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSd3YXJuaW5nJz57IF90KFwi4pqgIFRoZXNlIHNldHRpbmdzIGFyZSBtZWFudCBmb3IgYWR2YW5jZWQgdXNlcnMuXCIpIH08L3NwYW4+PGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBZGQgdXNlcnMgYW5kIHNlcnZlcnMgeW91IHdhbnQgdG8gaWdub3JlIGhlcmUuIFVzZSBhc3Rlcmlza3MgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG8gaGF2ZSAlKGJyYW5kKXMgbWF0Y2ggYW55IGNoYXJhY3RlcnMuIEZvciBleGFtcGxlLCA8Y29kZT5AYm90Oio8L2NvZGU+IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndvdWxkIGlnbm9yZSBhbGwgdXNlcnMgdGhhdCBoYXZlIHRoZSBuYW1lICdib3QnIG9uIGFueSBzZXJ2ZXIuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LCB7IGNvZGU6IChzKSA9PiA8Y29kZT57IHMgfTwvY29kZT4gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICkgfTxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWdub3JpbmcgcGVvcGxlIGlzIGRvbmUgdGhyb3VnaCBiYW4gbGlzdHMgd2hpY2ggY29udGFpbiBydWxlcyBmb3IgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2hvIHRvIGJhbi4gU3Vic2NyaWJpbmcgdG8gYSBiYW4gbGlzdCBtZWFucyB0aGUgdXNlcnMvc2VydmVycyBibG9ja2VkIGJ5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRoYXQgbGlzdCB3aWxsIGJlIGhpZGRlbiBmcm9tIHlvdS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPnsgX3QoXCJQZXJzb25hbCBiYW4gbGlzdFwiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIllvdXIgcGVyc29uYWwgYmFuIGxpc3QgaG9sZHMgYWxsIHRoZSB1c2Vycy9zZXJ2ZXJzIHlvdSBwZXJzb25hbGx5IGRvbid0IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndhbnQgdG8gc2VlIG1lc3NhZ2VzIGZyb20uIEFmdGVyIGlnbm9yaW5nIHlvdXIgZmlyc3QgdXNlci9zZXJ2ZXIsIGEgbmV3IHJvb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lsbCBzaG93IHVwIGluIHlvdXIgcm9vbSBsaXN0IG5hbWVkICdNeSBCYW4gTGlzdCcgLSBzdGF5IGluIHRoaXMgcm9vbSB0byBrZWVwIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRoZSBiYW4gbGlzdCBpbiBlZmZlY3QuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyUGVyc29uYWxCYW5MaXN0UnVsZXMoKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25BZGRQZXJzb25hbFJ1bGV9IGF1dG9Db21wbGV0ZT1cIm9mZlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlNlcnZlciBvciB1c2VyIElEIHRvIGlnbm9yZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiZWc6IEBib3Q6KiBvciBleGFtcGxlLm9yZ1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3UGVyc29uYWxSdWxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBlcnNvbmFsUnVsZUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQWRkUGVyc29uYWxSdWxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIklnbm9yZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPnsgX3QoXCJTdWJzY3JpYmVkIGxpc3RzXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J3dhcm5pbmcnPnsgX3QoXCJTdWJzY3JpYmluZyB0byBhIGJhbiBsaXN0IHdpbGwgY2F1c2UgeW91IHRvIGpvaW4gaXQhXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJZiB0aGlzIGlzbid0IHdoYXQgeW91IHdhbnQsIHBsZWFzZSB1c2UgYSBkaWZmZXJlbnQgdG9vbCB0byBpZ25vcmUgdXNlcnMuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlclN1YnNjcmliZWRCYW5MaXN0cygpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1YnNjcmliZUxpc3R9IGF1dG9Db21wbGV0ZT1cIm9mZlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlJvb20gSUQgb3IgYWRkcmVzcyBvZiBiYW4gbGlzdFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3TGlzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25OZXdMaXN0Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TdWJzY3JpYmVMaXN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlN1YnNjcmliZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXVCZSxNQUFNQSxzQkFBTixTQUFxQ0MsY0FBQSxDQUFNQyxTQUEzQyxDQUFpRTtFQUM1RUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsNkRBVWNDLENBQUQsSUFBTztNQUNuQyxLQUFLQyxRQUFMLENBQWM7UUFBRUMsZUFBZSxFQUFFRixDQUFDLENBQUNHLE1BQUYsQ0FBU0M7TUFBNUIsQ0FBZDtJQUNILENBWmtCO0lBQUEsd0RBY1NKLENBQUQsSUFBTztNQUM5QixLQUFLQyxRQUFMLENBQWM7UUFBRUksT0FBTyxFQUFFTCxDQUFDLENBQUNHLE1BQUYsQ0FBU0M7TUFBcEIsQ0FBZDtJQUNILENBaEJrQjtJQUFBLHlEQWtCUyxNQUFPSixDQUFQLElBQWE7TUFDckNBLENBQUMsQ0FBQ00sY0FBRjtNQUNBTixDQUFDLENBQUNPLGVBQUY7TUFFQSxJQUFJQyxJQUFJLEdBQUdDLG9CQUFYOztNQUNBLElBQUksS0FBS0MsS0FBTCxDQUFXUixlQUFYLENBQTJCUyxVQUEz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