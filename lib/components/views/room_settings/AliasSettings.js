"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _EditableItemList = _interopRequireDefault(require("../elements/EditableItemList"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _RoomPublishSetting = _interopRequireDefault(require("./RoomPublishSetting"));

var _RoomAliasField = _interopRequireDefault(require("../elements/RoomAliasField"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _SettingsFieldset = _interopRequireDefault(require("../settings/SettingsFieldset"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
class EditableAliasesList extends _EditableItemList.default {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "aliasField", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onAliasAdded", async ev => {
      ev.preventDefault();
      await this.aliasField.current.validate({
        allowEmpty: false
      });

      if (this.aliasField.current.isValid) {
        if (this.props.onItemAdded) this.props.onItemAdded(this.props.newItem);
        return;
      }

      this.aliasField.current.focus();
      this.aliasField.current.validate({
        allowEmpty: false,
        focused: true
      });
    });
  }

  renderNewItemField() {
    const onChange = alias => this.onNewItemChanged({
      target: {
        value: alias
      }
    });

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onAliasAdded,
      autoComplete: "off",
      noValidate: true,
      className: "mx_EditableItemList_newItem"
    }, /*#__PURE__*/_react.default.createElement(_RoomAliasField.default, {
      ref: this.aliasField,
      onChange: onChange,
      value: this.props.newItem || "",
      domain: this.props.domain,
      roomId: this.props.roomId
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onAliasAdded,
      kind: "primary"
    }, (0, _languageHandler._t)("Add")));
  }

}

class AliasSettings extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onNewAliasChanged", value => {
      this.setState({
        newAlias: value
      });
    });
    (0, _defineProperty2.default)(this, "onLocalAliasAdded", alias => {
      if (!alias || alias.length === 0) return; // ignore attempts to create blank aliases

      const localDomain = this.context.getDomain();
      if (!alias.includes(':')) alias += ':' + localDomain;
      this.context.createAlias(alias, this.props.roomId).then(() => {
        this.setState({
          localAliases: this.state.localAliases.concat(alias),
          newAlias: null
        });

        if (!this.state.canonicalAlias) {
          this.changeCanonicalAlias(alias);
        }
      }).catch(err => {
        _logger.logger.error(err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error creating address"),
          description: (0, _languageHandler._t)("There was an error creating that address. It may not be allowed by the server " + "or a temporary failure occurred.")
        });
      });
    });
    (0, _defineProperty2.default)(this, "onLocalAliasDeleted", index => {
      const alias = this.state.localAliases[index]; // TODO: In future, we should probably be making sure that the alias actually belongs
      // to this room. See https://github.com/vector-im/element-web/issues/7353

      this.context.deleteAlias(alias).then(() => {
        const localAliases = this.state.localAliases.filter(a => a !== alias);
        this.setState({
          localAliases
        });

        if (this.state.canonicalAlias === alias) {
          this.changeCanonicalAlias(null);
        }
      }).catch(err => {
        _logger.logger.error(err);

        let description;

        if (err.errcode === "M_FORBIDDEN") {
          description = (0, _languageHandler._t)("You don't have permission to delete the address.");
        } else {
          description = (0, _languageHandler._t)("There was an error removing that address. It may no longer exist or a temporary " + "error occurred.");
        }

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error removing address"),
          description
        });
      });
    });
    (0, _defineProperty2.default)(this, "onLocalAliasesToggled", event => {
      // expanded
      if (event.target.open) {
        // if local aliases haven't been preloaded yet at component mount
        if (!this.props.canSetCanonicalAlias && this.state.localAliases.length === 0) {
          this.loadLocalAliases();
        }
      }

      this.setState({
        detailsOpen: event.currentTarget.open
      });
    });
    (0, _defineProperty2.default)(this, "onCanonicalAliasChange", event => {
      this.changeCanonicalAlias(event.target.value);
    });
    (0, _defineProperty2.default)(this, "onNewAltAliasChanged", value => {
      this.setState({
        newAltAlias: value
      });
    });
    (0, _defineProperty2.default)(this, "onAltAliasAdded", alias => {
      const altAliases = this.state.altAliases.slice();

      if (!altAliases.some(a => a.trim() === alias.trim())) {
        altAliases.push(alias.trim());
        this.changeAltAliases(altAliases);
        this.setState({
          newAltAlias: ""
        });
      }
    });
    (0, _defineProperty2.default)(this, "onAltAliasDeleted", index => {
      const altAliases = this.state.altAliases.slice();
      altAliases.splice(index, 1);
      this.changeAltAliases(altAliases);
    });
    const state = {
      altAliases: [],
      // [ #alias:domain.tld, ... ]
      localAliases: [],
      // [ #alias:my-hs.tld, ... ]
      canonicalAlias: null,
      // #canonical:domain.tld
      updatingCanonicalAlias: false,
      localAliasesLoading: false,
      detailsOpen: false
    };

    if (props.canonicalAliasEvent) {
      const content = props.canonicalAliasEvent.getContent();
      const altAliases = content.alt_aliases;

      if (Array.isArray(altAliases)) {
        state.altAliases = altAliases.slice();
      }

      state.canonicalAlias = content.alias;
    }

    this.state = state;
  }

  componentDidMount() {
    if (this.props.canSetCanonicalAlias) {
      // load local aliases for providing recommendations
      // for the canonical alias and alt_aliases
      this.loadLocalAliases();
    }
  }

  async loadLocalAliases() {
    this.setState({
      localAliasesLoading: true
    });

    try {
      const mxClient = this.context;
      let localAliases = [];
      const response = await mxClient.getLocalAliases(this.props.roomId);

      if (Array.isArray(response?.aliases)) {
        localAliases = response.aliases;
      }

      this.setState({
        localAliases
      });

      if (localAliases.length === 0) {
        this.setState({
          detailsOpen: true
        });
      }
    } finally {
      this.setState({
        localAliasesLoading: false
      });
    }
  }

  changeCanonicalAlias(alias) {
    if (!this.props.canSetCanonicalAlias) return;
    const oldAlias = this.state.canonicalAlias;
    this.setState({
      canonicalAlias: alias,
      updatingCanonicalAlias: true
    });
    const eventContent = {
      alt_aliases: this.state.altAliases
    };
    if (alias) eventContent["alias"] = alias;
    this.context.sendStateEvent(this.props.roomId, "m.room.canonical_alias", eventContent, "").catch(err => {
      _logger.logger.error(err);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Error updating main address"),
        description: (0, _languageHandler._t)("There was an error updating the room's main address. It may not be allowed by the server " + "or a temporary failure occurred.")
      });

      this.setState({
        canonicalAlias: oldAlias
      });
    }).finally(() => {
      this.setState({
        updatingCanonicalAlias: false
      });
    });
  }

  changeAltAliases(altAliases) {
    if (!this.props.canSetCanonicalAlias) return;
    this.setState({
      updatingCanonicalAlias: true
    });
    const eventContent = {};

    if (this.state.canonicalAlias) {
      eventContent["alias"] = this.state.canonicalAlias;
    }

    if (altAliases) {
      eventContent["alt_aliases"] = altAliases;
    }

    this.context.sendStateEvent(this.props.roomId, "m.room.canonical_alias", eventContent, "").then(() => {
      this.setState({
        altAliases
      });
    }).catch(err => {
      // TODO: Add error handling based upon server validation
      _logger.logger.error(err);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Error updating main address"),
        description: (0, _languageHandler._t)("There was an error updating the room's alternative addresses. " + "It may not be allowed by the server or a temporary failure occurred.")
      });
    }).finally(() => {
      this.setState({
        updatingCanonicalAlias: false
      });
    });
  }

  getAliases() {
    return this.state.altAliases.concat(this.getLocalNonAltAliases());
  }

  getLocalNonAltAliases() {
    const {
      altAliases
    } = this.state;
    return this.state.localAliases.filter(alias => !altAliases.includes(alias));
  }

  render() {
    const mxClient = this.context;
    const localDomain = mxClient.getDomain();
    const isSpaceRoom = mxClient.getRoom(this.props.roomId)?.isSpaceRoom();
    let found = false;
    const canonicalValue = this.state.canonicalAlias || "";

    const canonicalAliasSection = /*#__PURE__*/_react.default.createElement(_Field.default, {
      onChange: this.onCanonicalAliasChange,
      value: canonicalValue,
      disabled: this.state.updatingCanonicalAlias || !this.props.canSetCanonicalAlias,
      element: "select",
      id: "canonicalAlias",
      label: (0, _languageHandler._t)('Main address')
    }, /*#__PURE__*/_react.default.createElement("option", {
      value: "",
      key: "unset"
    }, (0, _languageHandler._t)('not specified')), this.getAliases().map((alias, i) => {
      if (alias === this.state.canonicalAlias) found = true;
      return /*#__PURE__*/_react.default.createElement("option", {
        value: alias,
        key: i
      }, alias);
    }), found || !this.state.canonicalAlias ? '' : /*#__PURE__*/_react.default.createElement("option", {
      value: this.state.canonicalAlias,
      key: "arbitrary"
    }, this.state.canonicalAlias));

    let localAliasesList;

    if (this.state.localAliasesLoading) {
      localAliasesList = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      localAliasesList = /*#__PURE__*/_react.default.createElement(EditableAliasesList, {
        id: "roomAliases",
        items: this.state.localAliases,
        newItem: this.state.newAlias,
        onNewItemChanged: this.onNewAliasChanged,
        canRemove: this.props.canSetAliases,
        canEdit: this.props.canSetAliases,
        onItemAdded: this.onLocalAliasAdded,
        onItemRemoved: this.onLocalAliasDeleted,
        noItemsLabel: isSpaceRoom ? (0, _languageHandler._t)("This space has no local addresses") : (0, _languageHandler._t)("This room has no local addresses"),
        placeholder: (0, _languageHandler._t)('Local address'),
        domain: localDomain
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AliasSettings"
    }, /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
      "data-test-id": "published-address-fieldset",
      legend: (0, _languageHandler._t)("Published Addresses"),
      description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, isSpaceRoom ? (0, _languageHandler._t)("Published addresses can be used by anyone on any server to join your space.") : (0, _languageHandler._t)("Published addresses can be used by anyone on any server to join your room."), "\xA0", (0, _languageHandler._t)("To publish an address, it needs to be set as a local address first."))
    }, canonicalAliasSection, this.props.hidePublishSetting ? null : /*#__PURE__*/_react.default.createElement(_RoomPublishSetting.default, {
      roomId: this.props.roomId,
      canSetCanonicalAlias: this.props.canSetCanonicalAlias
    }), /*#__PURE__*/_react.default.createElement("datalist", {
      id: "mx_AliasSettings_altRecommendations"
    }, this.getLocalNonAltAliases().map(alias => {
      return /*#__PURE__*/_react.default.createElement("option", {
        value: alias,
        key: alias
      });
    }), ";"), /*#__PURE__*/_react.default.createElement(EditableAliasesList, {
      id: "roomAltAliases",
      items: this.state.altAliases,
      newItem: this.state.newAltAlias,
      onNewItemChanged: this.onNewAltAliasChanged,
      canRemove: this.props.canSetCanonicalAlias,
      canEdit: this.props.canSetCanonicalAlias,
      onItemAdded: this.onAltAliasAdded,
      onItemRemoved: this.onAltAliasDeleted,
      suggestionsListId: "mx_AliasSettings_altRecommendations",
      itemsLabel: (0, _languageHandler._t)('Other published addresses:'),
      noItemsLabel: (0, _languageHandler._t)('No other published addresses yet, add one below'),
      placeholder: (0, _languageHandler._t)('New published address (e.g. #alias:server)'),
      roomId: this.props.roomId
    })), /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
      "data-test-id": "local-address-fieldset",
      legend: (0, _languageHandler._t)("Local Addresses"),
      description: isSpaceRoom ? (0, _languageHandler._t)("Set addresses for this space so users can find this space " + "through your homeserver (%(localDomain)s)", {
        localDomain
      }) : (0, _languageHandler._t)("Set addresses for this room so users can find this room " + "through your homeserver (%(localDomain)s)", {
        localDomain
      })
    }, /*#__PURE__*/_react.default.createElement("details", {
      onToggle: this.onLocalAliasesToggled,
      open: this.state.detailsOpen
    }, /*#__PURE__*/_react.default.createElement("summary", null, this.state.detailsOpen ? (0, _languageHandler._t)('Show less') : (0, _languageHandler._t)("Show more")), localAliasesList)));
  }

}

exports.default = AliasSettings;
(0, _defineProperty2.default)(AliasSettings, "contextType", _MatrixClientContext.default);
(0, _defineProperty2.default)(AliasSettings, "defaultProps", {
  canSetAliases: false,
  canSetCanonicalAlias: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFZGl0YWJsZUFsaWFzZXNMaXN0IiwiRWRpdGFibGVJdGVtTGlzdCIsImNyZWF0ZVJlZiIsImV2IiwicHJldmVudERlZmF1bHQiLCJhbGlhc0ZpZWxkIiwiY3VycmVudCIsInZhbGlkYXRlIiwiYWxsb3dFbXB0eSIsImlzVmFsaWQiLCJwcm9wcyIsIm9uSXRlbUFkZGVkIiwibmV3SXRlbSIsImZvY3VzIiwiZm9jdXNlZCIsInJlbmRlck5ld0l0ZW1GaWVsZCIsIm9uQ2hhbmdlIiwiYWxpYXMiLCJvbk5ld0l0ZW1DaGFuZ2VkIiwidGFyZ2V0IiwidmFsdWUiLCJvbkFsaWFzQWRkZWQiLCJkb21haW4iLCJyb29tSWQiLCJfdCIsIkFsaWFzU2V0dGluZ3MiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiY29udGV4dCIsInNldFN0YXRlIiwibmV3QWxpYXMiLCJsZW5ndGgiLCJsb2NhbERvbWFpbiIsImdldERvbWFpbiIsImluY2x1ZGVzIiwiY3JlYXRlQWxpYXMiLCJ0aGVuIiwibG9jYWxBbGlhc2VzIiwic3RhdGUiLCJjb25jYXQiLCJjYW5vbmljYWxBbGlhcyIsImNoYW5nZUNhbm9uaWNhbEFsaWFzIiwiY2F0Y2giLCJlcnIiLCJsb2dnZXIiLCJlcnJvciIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiaW5kZXgiLCJkZWxldGVBbGlhcyIsImZpbHRlciIsImEiLCJlcnJjb2RlIiwiZXZlbnQiLCJvcGVuIiwiY2FuU2V0Q2Fub25pY2FsQWxpYXMiLCJsb2FkTG9jYWxBbGlhc2VzIiwiZGV0YWlsc09wZW4iLCJjdXJyZW50VGFyZ2V0IiwibmV3QWx0QWxpYXMiLCJhbHRBbGlhc2VzIiwic2xpY2UiLCJzb21lIiwidHJpbSIsInB1c2giLCJjaGFuZ2VBbHRBbGlhc2VzIiwic3BsaWNlIiwidXBkYXRpbmdDYW5vbmljYWxBbGlhcyIsImxvY2FsQWxpYXNlc0xvYWRpbmciLCJjYW5vbmljYWxBbGlhc0V2ZW50IiwiY29udGVudCIsImdldENvbnRlbnQiLCJhbHRfYWxpYXNlcyIsIkFycmF5IiwiaXNBcnJheSIsImNvbXBvbmVudERpZE1vdW50IiwibXhDbGllbnQiLCJyZXNwb25zZSIsImdldExvY2FsQWxpYXNlcyIsImFsaWFzZXMiLCJvbGRBbGlhcyIsImV2ZW50Q29udGVudCIsInNlbmRTdGF0ZUV2ZW50IiwiZmluYWxseSIsImdldEFsaWFzZXMiLCJnZXRMb2NhbE5vbkFsdEFsaWFzZXMiLCJyZW5kZXIiLCJpc1NwYWNlUm9vbSIsImdldFJvb20iLCJmb3VuZCIsImNhbm9uaWNhbFZhbHVlIiwiY2Fub25pY2FsQWxpYXNTZWN0aW9uIiwib25DYW5vbmljYWxBbGlhc0NoYW5nZSIsIm1hcCIsImkiLCJsb2NhbEFsaWFzZXNMaXN0Iiwib25OZXdBbGlhc0NoYW5nZWQiLCJjYW5TZXRBbGlhc2VzIiwib25Mb2NhbEFsaWFzQWRkZWQiLCJvbkxvY2FsQWxpYXNEZWxldGVkIiwiaGlkZVB1Ymxpc2hTZXR0aW5nIiwib25OZXdBbHRBbGlhc0NoYW5nZWQiLCJvbkFsdEFsaWFzQWRkZWQiLCJvbkFsdEFsaWFzRGVsZXRlZCIsIm9uTG9jYWxBbGlhc2VzVG9nZ2xlZCIsIk1hdHJpeENsaWVudENvbnRleHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tX3NldHRpbmdzL0FsaWFzU2V0dGluZ3MudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiAtIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ2hhbmdlRXZlbnQsIENvbnRleHRUeXBlLCBjcmVhdGVSZWYsIFN5bnRoZXRpY0V2ZW50IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IEVkaXRhYmxlSXRlbUxpc3QgZnJvbSBcIi4uL2VsZW1lbnRzL0VkaXRhYmxlSXRlbUxpc3RcIjtcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgUm9vbVB1Ymxpc2hTZXR0aW5nIGZyb20gXCIuL1Jvb21QdWJsaXNoU2V0dGluZ1wiO1xuaW1wb3J0IFJvb21BbGlhc0ZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9Sb29tQWxpYXNGaWVsZFwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBTZXR0aW5nc0ZpZWxkc2V0IGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5nc0ZpZWxkc2V0XCI7XG5cbmludGVyZmFjZSBJRWRpdGFibGVBbGlhc2VzTGlzdFByb3BzIHtcbiAgICByb29tSWQ/OiBzdHJpbmc7XG4gICAgZG9tYWluPzogc3RyaW5nO1xufVxuXG5jbGFzcyBFZGl0YWJsZUFsaWFzZXNMaXN0IGV4dGVuZHMgRWRpdGFibGVJdGVtTGlzdDxJRWRpdGFibGVBbGlhc2VzTGlzdFByb3BzPiB7XG4gICAgcHJpdmF0ZSBhbGlhc0ZpZWxkID0gY3JlYXRlUmVmPFJvb21BbGlhc0ZpZWxkPigpO1xuXG4gICAgcHJpdmF0ZSBvbkFsaWFzQWRkZWQgPSBhc3luYyAoZXY6IFN5bnRoZXRpY0V2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGF3YWl0IHRoaXMuYWxpYXNGaWVsZC5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWxpYXNGaWVsZC5jdXJyZW50LmlzVmFsaWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uSXRlbUFkZGVkKSB0aGlzLnByb3BzLm9uSXRlbUFkZGVkKHRoaXMucHJvcHMubmV3SXRlbSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFsaWFzRmllbGQuY3VycmVudC5mb2N1cygpO1xuICAgICAgICB0aGlzLmFsaWFzRmllbGQuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlLCBmb2N1c2VkOiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICBwcm90ZWN0ZWQgcmVuZGVyTmV3SXRlbUZpZWxkKCkge1xuICAgICAgICBjb25zdCBvbkNoYW5nZSA9IChhbGlhczogc3RyaW5nKSA9PiB0aGlzLm9uTmV3SXRlbUNoYW5nZWQoeyB0YXJnZXQ6IHsgdmFsdWU6IGFsaWFzIH0gfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Zm9ybVxuICAgICAgICAgICAgICAgIG9uU3VibWl0PXt0aGlzLm9uQWxpYXNBZGRlZH1cbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgIG5vVmFsaWRhdGU9e3RydWV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtTGlzdF9uZXdJdGVtXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Um9vbUFsaWFzRmllbGRcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmFsaWFzRmllbGR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMubmV3SXRlbSB8fCBcIlwifVxuICAgICAgICAgICAgICAgICAgICBkb21haW49e3RoaXMucHJvcHMuZG9tYWlufVxuICAgICAgICAgICAgICAgICAgICByb29tSWQ9e3RoaXMucHJvcHMucm9vbUlkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vbkFsaWFzQWRkZWR9IGtpbmQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBZGRcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xuICAgIGNhblNldENhbm9uaWNhbEFsaWFzOiBib29sZWFuO1xuICAgIGNhblNldEFsaWFzZXM6IGJvb2xlYW47XG4gICAgY2Fub25pY2FsQWxpYXNFdmVudD86IE1hdHJpeEV2ZW50O1xuICAgIGhpZGVQdWJsaXNoU2V0dGluZz86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGFsdEFsaWFzZXM6IHN0cmluZ1tdO1xuICAgIGxvY2FsQWxpYXNlczogc3RyaW5nW107XG4gICAgY2Fub25pY2FsQWxpYXM/OiBzdHJpbmc7XG4gICAgdXBkYXRpbmdDYW5vbmljYWxBbGlhczogYm9vbGVhbjtcbiAgICBsb2NhbEFsaWFzZXNMb2FkaW5nOiBib29sZWFuO1xuICAgIGRldGFpbHNPcGVuOiBib29sZWFuO1xuICAgIG5ld0FsaWFzPzogc3RyaW5nO1xuICAgIG5ld0FsdEFsaWFzPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbGlhc1NldHRpbmdzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHVibGljIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG4gICAgY29udGV4dDogQ29udGV4dFR5cGU8dHlwZW9mIE1hdHJpeENsaWVudENvbnRleHQ+O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgY2FuU2V0QWxpYXNlczogZmFsc2UsXG4gICAgICAgIGNhblNldENhbm9uaWNhbEFsaWFzOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQ6IENvbnRleHRUeXBlPHR5cGVvZiBNYXRyaXhDbGllbnRDb250ZXh0Pikge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSB7XG4gICAgICAgICAgICBhbHRBbGlhc2VzOiBbXSwgLy8gWyAjYWxpYXM6ZG9tYWluLnRsZCwgLi4uIF1cbiAgICAgICAgICAgIGxvY2FsQWxpYXNlczogW10sIC8vIFsgI2FsaWFzOm15LWhzLnRsZCwgLi4uIF1cbiAgICAgICAgICAgIGNhbm9uaWNhbEFsaWFzOiBudWxsLCAvLyAjY2Fub25pY2FsOmRvbWFpbi50bGRcbiAgICAgICAgICAgIHVwZGF0aW5nQ2Fub25pY2FsQWxpYXM6IGZhbHNlLFxuICAgICAgICAgICAgbG9jYWxBbGlhc2VzTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBkZXRhaWxzT3BlbjogZmFsc2UsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHByb3BzLmNhbm9uaWNhbEFsaWFzRXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBwcm9wcy5jYW5vbmljYWxBbGlhc0V2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IGFsdEFsaWFzZXMgPSBjb250ZW50LmFsdF9hbGlhc2VzO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYWx0QWxpYXNlcykpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5hbHRBbGlhc2VzID0gYWx0QWxpYXNlcy5zbGljZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGUuY2Fub25pY2FsQWxpYXMgPSBjb250ZW50LmFsaWFzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jYW5TZXRDYW5vbmljYWxBbGlhcykge1xuICAgICAgICAgICAgLy8gbG9hZCBsb2NhbCBhbGlhc2VzIGZvciBwcm92aWRpbmcgcmVjb21tZW5kYXRpb25zXG4gICAgICAgICAgICAvLyBmb3IgdGhlIGNhbm9uaWNhbCBhbGlhcyBhbmQgYWx0X2FsaWFzZXNcbiAgICAgICAgICAgIHRoaXMubG9hZExvY2FsQWxpYXNlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkTG9jYWxBbGlhc2VzKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9jYWxBbGlhc2VzTG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG14Q2xpZW50ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgICAgICAgICBsZXQgbG9jYWxBbGlhc2VzID0gW107XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG14Q2xpZW50LmdldExvY2FsQWxpYXNlcyh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXNwb25zZT8uYWxpYXNlcykpIHtcbiAgICAgICAgICAgICAgICBsb2NhbEFsaWFzZXMgPSByZXNwb25zZS5hbGlhc2VzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvY2FsQWxpYXNlcyB9KTtcblxuICAgICAgICAgICAgaWYgKGxvY2FsQWxpYXNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGV0YWlsc09wZW46IHRydWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9jYWxBbGlhc2VzTG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZUNhbm9uaWNhbEFsaWFzKGFsaWFzOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmNhblNldENhbm9uaWNhbEFsaWFzKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgb2xkQWxpYXMgPSB0aGlzLnN0YXRlLmNhbm9uaWNhbEFsaWFzO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNhbm9uaWNhbEFsaWFzOiBhbGlhcyxcbiAgICAgICAgICAgIHVwZGF0aW5nQ2Fub25pY2FsQWxpYXM6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50Q29udGVudCA9IHtcbiAgICAgICAgICAgIGFsdF9hbGlhc2VzOiB0aGlzLnN0YXRlLmFsdEFsaWFzZXMsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGFsaWFzKSBldmVudENvbnRlbnRbXCJhbGlhc1wiXSA9IGFsaWFzO1xuXG4gICAgICAgIHRoaXMuY29udGV4dC5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLnJvb21JZCwgXCJtLnJvb20uY2Fub25pY2FsX2FsaWFzXCIsXG4gICAgICAgICAgICBldmVudENvbnRlbnQsIFwiXCIpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRXJyb3IgdXBkYXRpbmcgbWFpbiBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBkYXRpbmcgdGhlIHJvb20ncyBtYWluIGFkZHJlc3MuIEl0IG1heSBub3QgYmUgYWxsb3dlZCBieSB0aGUgc2VydmVyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJvciBhIHRlbXBvcmFyeSBmYWlsdXJlIG9jY3VycmVkLlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjYW5vbmljYWxBbGlhczogb2xkQWxpYXMgfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVwZGF0aW5nQ2Fub25pY2FsQWxpYXM6IGZhbHNlIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYW5nZUFsdEFsaWFzZXMoYWx0QWxpYXNlczogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmNhblNldENhbm9uaWNhbEFsaWFzKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1cGRhdGluZ0Nhbm9uaWNhbEFsaWFzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBldmVudENvbnRlbnQgPSB7fTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jYW5vbmljYWxBbGlhcykge1xuICAgICAgICAgICAgZXZlbnRDb250ZW50W1wiYWxpYXNcIl0gPSB0aGlzLnN0YXRlLmNhbm9uaWNhbEFsaWFzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbHRBbGlhc2VzKSB7XG4gICAgICAgICAgICBldmVudENvbnRlbnRbXCJhbHRfYWxpYXNlc1wiXSA9IGFsdEFsaWFzZXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbnRleHQuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLmNhbm9uaWNhbF9hbGlhc1wiLCBldmVudENvbnRlbnQsIFwiXCIpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFsdEFsaWFzZXMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBBZGQgZXJyb3IgaGFuZGxpbmcgYmFzZWQgdXBvbiBzZXJ2ZXIgdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvciB1cGRhdGluZyBtYWluIGFkZHJlc3NcIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhlcmUgd2FzIGFuIGVycm9yIHVwZGF0aW5nIHRoZSByb29tJ3MgYWx0ZXJuYXRpdmUgYWRkcmVzc2VzLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiSXQgbWF5IG5vdCBiZSBhbGxvd2VkIGJ5IHRoZSBzZXJ2ZXIgb3IgYSB0ZW1wb3JhcnkgZmFpbHVyZSBvY2N1cnJlZC5cIixcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1cGRhdGluZ0Nhbm9uaWNhbEFsaWFzOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25OZXdBbGlhc0NoYW5nZWQgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbmV3QWxpYXM6IHZhbHVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTG9jYWxBbGlhc0FkZGVkID0gKGFsaWFzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKCFhbGlhcyB8fCBhbGlhcy5sZW5ndGggPT09IDApIHJldHVybjsgLy8gaWdub3JlIGF0dGVtcHRzIHRvIGNyZWF0ZSBibGFuayBhbGlhc2VzXG5cbiAgICAgICAgY29uc3QgbG9jYWxEb21haW4gPSB0aGlzLmNvbnRleHQuZ2V0RG9tYWluKCk7XG4gICAgICAgIGlmICghYWxpYXMuaW5jbHVkZXMoJzonKSkgYWxpYXMgKz0gJzonICsgbG9jYWxEb21haW47XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmNyZWF0ZUFsaWFzKGFsaWFzLCB0aGlzLnByb3BzLnJvb21JZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2NhbEFsaWFzZXM6IHRoaXMuc3RhdGUubG9jYWxBbGlhc2VzLmNvbmNhdChhbGlhcyksXG4gICAgICAgICAgICAgICAgbmV3QWxpYXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5jYW5vbmljYWxBbGlhcykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2Fub25pY2FsQWxpYXMoYWxpYXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yIGNyZWF0aW5nIGFkZHJlc3NcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoZXJlIHdhcyBhbiBlcnJvciBjcmVhdGluZyB0aGF0IGFkZHJlc3MuIEl0IG1heSBub3QgYmUgYWxsb3dlZCBieSB0aGUgc2VydmVyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJvciBhIHRlbXBvcmFyeSBmYWlsdXJlIG9jY3VycmVkLlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Mb2NhbEFsaWFzRGVsZXRlZCA9IChpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5zdGF0ZS5sb2NhbEFsaWFzZXNbaW5kZXhdO1xuICAgICAgICAvLyBUT0RPOiBJbiBmdXR1cmUsIHdlIHNob3VsZCBwcm9iYWJseSBiZSBtYWtpbmcgc3VyZSB0aGF0IHRoZSBhbGlhcyBhY3R1YWxseSBiZWxvbmdzXG4gICAgICAgIC8vIHRvIHRoaXMgcm9vbS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzczNTNcbiAgICAgICAgdGhpcy5jb250ZXh0LmRlbGV0ZUFsaWFzKGFsaWFzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsQWxpYXNlcyA9IHRoaXMuc3RhdGUubG9jYWxBbGlhc2VzLmZpbHRlcihhID0+IGEgIT09IGFsaWFzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2NhbEFsaWFzZXMgfSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmNhbm9uaWNhbEFsaWFzID09PSBhbGlhcykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2Fub25pY2FsQWxpYXMobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgbGV0IGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlID09PSBcIk1fRk9SQklEREVOXCIpIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiWW91IGRvbid0IGhhdmUgcGVybWlzc2lvbiB0byBkZWxldGUgdGhlIGFkZHJlc3MuXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoZXJlIHdhcyBhbiBlcnJvciByZW1vdmluZyB0aGF0IGFkZHJlc3MuIEl0IG1heSBubyBsb25nZXIgZXhpc3Qgb3IgYSB0ZW1wb3JhcnkgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImVycm9yIG9jY3VycmVkLlwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvciByZW1vdmluZyBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTG9jYWxBbGlhc2VzVG9nZ2xlZCA9IChldmVudDogQ2hhbmdlRXZlbnQ8SFRNTERldGFpbHNFbGVtZW50PikgPT4ge1xuICAgICAgICAvLyBleHBhbmRlZFxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0Lm9wZW4pIHtcbiAgICAgICAgICAgIC8vIGlmIGxvY2FsIGFsaWFzZXMgaGF2ZW4ndCBiZWVuIHByZWxvYWRlZCB5ZXQgYXQgY29tcG9uZW50IG1vdW50XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuY2FuU2V0Q2Fub25pY2FsQWxpYXMgJiYgdGhpcy5zdGF0ZS5sb2NhbEFsaWFzZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkTG9jYWxBbGlhc2VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRldGFpbHNPcGVuOiBldmVudC5jdXJyZW50VGFyZ2V0Lm9wZW4gfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DYW5vbmljYWxBbGlhc0NoYW5nZSA9IChldmVudDogQ2hhbmdlRXZlbnQ8SFRNTFNlbGVjdEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIHRoaXMuY2hhbmdlQ2Fub25pY2FsQWxpYXMoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk5ld0FsdEFsaWFzQ2hhbmdlZCA9ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBuZXdBbHRBbGlhczogdmFsdWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BbHRBbGlhc0FkZGVkID0gKGFsaWFzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgYWx0QWxpYXNlcyA9IHRoaXMuc3RhdGUuYWx0QWxpYXNlcy5zbGljZSgpO1xuICAgICAgICBpZiAoIWFsdEFsaWFzZXMuc29tZShhID0+IGEudHJpbSgpID09PSBhbGlhcy50cmltKCkpKSB7XG4gICAgICAgICAgICBhbHRBbGlhc2VzLnB1c2goYWxpYXMudHJpbSgpKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQWx0QWxpYXNlcyhhbHRBbGlhc2VzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBuZXdBbHRBbGlhczogXCJcIiB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWx0QWxpYXNEZWxldGVkID0gKGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgYWx0QWxpYXNlcyA9IHRoaXMuc3RhdGUuYWx0QWxpYXNlcy5zbGljZSgpO1xuICAgICAgICBhbHRBbGlhc2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuY2hhbmdlQWx0QWxpYXNlcyhhbHRBbGlhc2VzKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRBbGlhc2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5hbHRBbGlhc2VzLmNvbmNhdCh0aGlzLmdldExvY2FsTm9uQWx0QWxpYXNlcygpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldExvY2FsTm9uQWx0QWxpYXNlcygpIHtcbiAgICAgICAgY29uc3QgeyBhbHRBbGlhc2VzIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5sb2NhbEFsaWFzZXMuZmlsdGVyKGFsaWFzID0+ICFhbHRBbGlhc2VzLmluY2x1ZGVzKGFsaWFzKSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBteENsaWVudCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY29uc3QgbG9jYWxEb21haW4gPSBteENsaWVudC5nZXREb21haW4oKTtcbiAgICAgICAgY29uc3QgaXNTcGFjZVJvb20gPSBteENsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKT8uaXNTcGFjZVJvb20oKTtcblxuICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgY2Fub25pY2FsVmFsdWUgPSB0aGlzLnN0YXRlLmNhbm9uaWNhbEFsaWFzIHx8IFwiXCI7XG4gICAgICAgIGNvbnN0IGNhbm9uaWNhbEFsaWFzU2VjdGlvbiA9IChcbiAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2Fub25pY2FsQWxpYXNDaGFuZ2V9XG4gICAgICAgICAgICAgICAgdmFsdWU9e2Nhbm9uaWNhbFZhbHVlfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnVwZGF0aW5nQ2Fub25pY2FsQWxpYXMgfHwgIXRoaXMucHJvcHMuY2FuU2V0Q2Fub25pY2FsQWxpYXN9XG4gICAgICAgICAgICAgICAgZWxlbWVudD0nc2VsZWN0J1xuICAgICAgICAgICAgICAgIGlkPSdjYW5vbmljYWxBbGlhcydcbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ01haW4gYWRkcmVzcycpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIiBrZXk9XCJ1bnNldFwiPnsgX3QoJ25vdCBzcGVjaWZpZWQnKSB9PC9vcHRpb24+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEFsaWFzZXMoKS5tYXAoKGFsaWFzLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxpYXMgPT09IHRoaXMuc3RhdGUuY2Fub25pY2FsQWxpYXMpIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT17YWxpYXN9IGtleT17aX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYWxpYXMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBmb3VuZCB8fCAhdGhpcy5zdGF0ZS5jYW5vbmljYWxBbGlhcyA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9e3RoaXMuc3RhdGUuY2Fub25pY2FsQWxpYXN9IGtleT0nYXJiaXRyYXJ5Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuY2Fub25pY2FsQWxpYXMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9GaWVsZD5cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgbG9jYWxBbGlhc2VzTGlzdDogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmxvY2FsQWxpYXNlc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIGxvY2FsQWxpYXNlc0xpc3QgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvY2FsQWxpYXNlc0xpc3QgPSAoPEVkaXRhYmxlQWxpYXNlc0xpc3RcbiAgICAgICAgICAgICAgICBpZD1cInJvb21BbGlhc2VzXCJcbiAgICAgICAgICAgICAgICBpdGVtcz17dGhpcy5zdGF0ZS5sb2NhbEFsaWFzZXN9XG4gICAgICAgICAgICAgICAgbmV3SXRlbT17dGhpcy5zdGF0ZS5uZXdBbGlhc31cbiAgICAgICAgICAgICAgICBvbk5ld0l0ZW1DaGFuZ2VkPXt0aGlzLm9uTmV3QWxpYXNDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIGNhblJlbW92ZT17dGhpcy5wcm9wcy5jYW5TZXRBbGlhc2VzfVxuICAgICAgICAgICAgICAgIGNhbkVkaXQ9e3RoaXMucHJvcHMuY2FuU2V0QWxpYXNlc31cbiAgICAgICAgICAgICAgICBvbkl0ZW1BZGRlZD17dGhpcy5vbkxvY2FsQWxpYXNBZGRlZH1cbiAgICAgICAgICAgICAgICBvbkl0ZW1SZW1vdmVkPXt0aGlzLm9uTG9jYWxBbGlhc0RlbGV0ZWR9XG4gICAgICAgICAgICAgICAgbm9JdGVtc0xhYmVsPXtpc1NwYWNlUm9vbVxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiVGhpcyBzcGFjZSBoYXMgbm8gbG9jYWwgYWRkcmVzc2VzXCIpXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCJUaGlzIHJvb20gaGFzIG5vIGxvY2FsIGFkZHJlc3Nlc1wiKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoJ0xvY2FsIGFkZHJlc3MnKX1cbiAgICAgICAgICAgICAgICBkb21haW49e2xvY2FsRG9tYWlufVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9BbGlhc1NldHRpbmdzJz5cbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGaWVsZHNldFxuICAgICAgICAgICAgICAgICAgICBkYXRhLXRlc3QtaWQ9J3B1Ymxpc2hlZC1hZGRyZXNzLWZpZWxkc2V0J1xuICAgICAgICAgICAgICAgICAgICBsZWdlbmQ9e190KFwiUHVibGlzaGVkIEFkZHJlc3Nlc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb249ezw+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlzU3BhY2VSb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlB1Ymxpc2hlZCBhZGRyZXNzZXMgY2FuIGJlIHVzZWQgYnkgYW55b25lIG9uIGFueSBzZXJ2ZXIgdG8gam9pbiB5b3VyIHNwYWNlLlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJQdWJsaXNoZWQgYWRkcmVzc2VzIGNhbiBiZSB1c2VkIGJ5IGFueW9uZSBvbiBhbnkgc2VydmVyIHRvIGpvaW4geW91ciByb29tLlwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJUbyBwdWJsaXNoIGFuIGFkZHJlc3MsIGl0IG5lZWRzIHRvIGJlIHNldCBhcyBhIGxvY2FsIGFkZHJlc3MgZmlyc3QuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC8+fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyAvKlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+eyBfdChcIlB1Ymxpc2hlZCBBZGRyZXNzZXNcIikgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgeyBpc1NwYWNlUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlB1Ymxpc2hlZCBhZGRyZXNzZXMgY2FuIGJlIHVzZWQgYnkgYW55b25lIG9uIGFueSBzZXJ2ZXIgdG8gam9pbiB5b3VyIHNwYWNlLlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlB1Ymxpc2hlZCBhZGRyZXNzZXMgY2FuIGJlIHVzZWQgYnkgYW55b25lIG9uIGFueSBzZXJ2ZXIgdG8gam9pbiB5b3VyIHJvb20uXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJUbyBwdWJsaXNoIGFuIGFkZHJlc3MsIGl0IG5lZWRzIHRvIGJlIHNldCBhcyBhIGxvY2FsIGFkZHJlc3MgZmlyc3QuXCIpIH1cbiAgICAgICAgICAgICAgICA8L3A+ICovIH1cbiAgICAgICAgICAgICAgICAgICAgeyBjYW5vbmljYWxBbGlhc1NlY3Rpb24gfVxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuaGlkZVB1Ymxpc2hTZXR0aW5nXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIDogPFJvb21QdWJsaXNoU2V0dGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21JZD17dGhpcy5wcm9wcy5yb29tSWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuU2V0Q2Fub25pY2FsQWxpYXM9e3RoaXMucHJvcHMuY2FuU2V0Q2Fub25pY2FsQWxpYXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPiB9XG4gICAgICAgICAgICAgICAgICAgIDxkYXRhbGlzdCBpZD1cIm14X0FsaWFzU2V0dGluZ3NfYWx0UmVjb21tZW5kYXRpb25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuZ2V0TG9jYWxOb25BbHRBbGlhc2VzKCkubWFwKGFsaWFzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPG9wdGlvbiB2YWx1ZT17YWxpYXN9IGtleT17YWxpYXN9IC8+O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkgfTtcbiAgICAgICAgICAgICAgICAgICAgPC9kYXRhbGlzdD5cbiAgICAgICAgICAgICAgICAgICAgPEVkaXRhYmxlQWxpYXNlc0xpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwicm9vbUFsdEFsaWFzZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM9e3RoaXMuc3RhdGUuYWx0QWxpYXNlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW09e3RoaXMuc3RhdGUubmV3QWx0QWxpYXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk5ld0l0ZW1DaGFuZ2VkPXt0aGlzLm9uTmV3QWx0QWxpYXNDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuUmVtb3ZlPXt0aGlzLnByb3BzLmNhblNldENhbm9uaWNhbEFsaWFzfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuRWRpdD17dGhpcy5wcm9wcy5jYW5TZXRDYW5vbmljYWxBbGlhc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSXRlbUFkZGVkPXt0aGlzLm9uQWx0QWxpYXNBZGRlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSXRlbVJlbW92ZWQ9e3RoaXMub25BbHRBbGlhc0RlbGV0ZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWdnZXN0aW9uc0xpc3RJZD1cIm14X0FsaWFzU2V0dGluZ3NfYWx0UmVjb21tZW5kYXRpb25zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zTGFiZWw9e190KCdPdGhlciBwdWJsaXNoZWQgYWRkcmVzc2VzOicpfVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9JdGVtc0xhYmVsPXtfdCgnTm8gb3RoZXIgcHVibGlzaGVkIGFkZHJlc3NlcyB5ZXQsIGFkZCBvbmUgYmVsb3cnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdCgnTmV3IHB1Ymxpc2hlZCBhZGRyZXNzIChlLmcuICNhbGlhczpzZXJ2ZXIpJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tSWQ9e3RoaXMucHJvcHMucm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvU2V0dGluZ3NGaWVsZHNldD5cbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGaWVsZHNldFxuICAgICAgICAgICAgICAgICAgICBkYXRhLXRlc3QtaWQ9J2xvY2FsLWFkZHJlc3MtZmllbGRzZXQnXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZD17X3QoXCJMb2NhbCBBZGRyZXNzZXNcIil9XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtpc1NwYWNlUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNldCBhZGRyZXNzZXMgZm9yIHRoaXMgc3BhY2Ugc28gdXNlcnMgY2FuIGZpbmQgdGhpcyBzcGFjZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aHJvdWdoIHlvdXIgaG9tZXNlcnZlciAoJShsb2NhbERvbWFpbilzKVwiLCB7IGxvY2FsRG9tYWluIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2V0IGFkZHJlc3NlcyBmb3IgdGhpcyByb29tIHNvIHVzZXJzIGNhbiBmaW5kIHRoaXMgcm9vbSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRocm91Z2ggeW91ciBob21lc2VydmVyICglKGxvY2FsRG9tYWluKXMpXCIsIHsgbG9jYWxEb21haW4gfSl9PlxuICAgICAgICAgICAgICAgICAgICA8ZGV0YWlscyBvblRvZ2dsZT17dGhpcy5vbkxvY2FsQWxpYXNlc1RvZ2dsZWR9IG9wZW49e3RoaXMuc3RhdGUuZGV0YWlsc09wZW59PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN1bW1hcnk+eyB0aGlzLnN0YXRlLmRldGFpbHNPcGVuID8gX3QoJ1Nob3cgbGVzcycpIDogX3QoXCJTaG93IG1vcmVcIikgfTwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbG9jYWxBbGlhc2VzTGlzdCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGV0YWlscz5cbiAgICAgICAgICAgICAgICA8L1NldHRpbmdzRmllbGRzZXQ+XG5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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