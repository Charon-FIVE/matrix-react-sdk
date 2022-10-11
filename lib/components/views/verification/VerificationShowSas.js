"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _EncryptionInfo = require("../right_panel/EncryptionInfo");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _FontManager = require("../../../utils/FontManager");

/*
Copyright 2019 Vector Creations Ltd

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
function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

class VerificationShowSas extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onMatchClick", () => {
      this.setState({
        pending: true
      });
      this.props.onDone();
    });
    (0, _defineProperty2.default)(this, "onDontMatchClick", () => {
      this.setState({
        cancelling: true
      });
      this.props.onCancel();
    });
    this.state = {
      pending: false
    };
  }

  componentWillMount() {
    // As this component is also used before login (during complete security),
    // also make sure we have a working emoji font to display the SAS emojis here.
    // This is also done from LoggedInView.
    (0, _FontManager.fixupColorFonts)();
  }

  render() {
    let sasDisplay;
    let sasCaption;

    if (this.props.sas.emoji) {
      const emojiBlocks = this.props.sas.emoji.map((emoji, i) => /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas_block",
        key: i
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas_emoji"
      }, emoji[0]), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas_label"
      }, (0, _languageHandler._t)(capFirst(emoji[1])))));
      sasDisplay = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas"
      }, emojiBlocks.slice(0, 4), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas_break"
      }), emojiBlocks.slice(4));
      sasCaption = this.props.isSelf ? (0, _languageHandler._t)("Confirm the emoji below are displayed on both devices, in the same order:") : (0, _languageHandler._t)("Verify this user by confirming the following emoji appear on their screen.");
    } else if (this.props.sas.decimal) {
      const numberBlocks = this.props.sas.decimal.map((num, i) => /*#__PURE__*/_react.default.createElement("span", {
        key: i
      }, num));
      sasDisplay = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_decimalSas"
      }, numberBlocks);
      sasCaption = this.props.isSelf ? (0, _languageHandler._t)("Verify this device by confirming the following number appears on its screen.") : (0, _languageHandler._t)("Verify this user by confirming the following number appears on their screen.");
    } else {
      return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Unable to find a supported verification method."), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.props.onCancel
      }, (0, _languageHandler._t)('Cancel')));
    }

    let confirm;

    if (this.state.pending && this.props.isSelf) {
      let text; // device shouldn't be null in this situation but it can be, eg. if the device is
      // logged out during verification

      if (this.props.device) {
        text = (0, _languageHandler._t)("Waiting for you to verify on your other device, %(deviceName)s (%(deviceId)s)…", {
          deviceName: this.props.device ? this.props.device.getDisplayName() : '',
          deviceId: this.props.device ? this.props.device.deviceId : ''
        });
      } else {
        text = (0, _languageHandler._t)("Waiting for you to verify on your other device…");
      }

      confirm = /*#__PURE__*/_react.default.createElement("p", null, text);
    } else if (this.state.pending || this.state.cancelling) {
      let text;

      if (this.state.pending) {
        const {
          displayName
        } = this.props;
        text = (0, _languageHandler._t)("Waiting for %(displayName)s to verify…", {
          displayName
        });
      } else {
        text = (0, _languageHandler._t)("Cancelling…");
      }

      confirm = /*#__PURE__*/_react.default.createElement(_EncryptionInfo.PendingActionSpinner, {
        text: text
      });
    } else {
      confirm = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_buttonRow"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onDontMatchClick,
        kind: "danger"
      }, (0, _languageHandler._t)("They don't match")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onMatchClick,
        kind: "primary"
      }, (0, _languageHandler._t)("They match")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_VerificationShowSas"
    }, /*#__PURE__*/_react.default.createElement("p", null, sasCaption), sasDisplay, /*#__PURE__*/_react.default.createElement("p", null, this.props.isSelf ? "" : (0, _languageHandler._t)("To be secure, do this in person or use a trusted way to communicate.")), confirm);
  }

} // List of Emoji strings from the js-sdk, for i18n


exports.default = VerificationShowSas;
(0, _languageHandler._td)("Dog");
(0, _languageHandler._td)("Cat");
(0, _languageHandler._td)("Lion");
(0, _languageHandler._td)("Horse");
(0, _languageHandler._td)("Unicorn");
(0, _languageHandler._td)("Pig");
(0, _languageHandler._td)("Elephant");
(0, _languageHandler._td)("Rabbit");
(0, _languageHandler._td)("Panda");
(0, _languageHandler._td)("Rooster");
(0, _languageHandler._td)("Penguin");
(0, _languageHandler._td)("Turtle");
(0, _languageHandler._td)("Fish");
(0, _languageHandler._td)("Octopus");
(0, _languageHandler._td)("Butterfly");
(0, _languageHandler._td)("Flower");
(0, _languageHandler._td)("Tree");
(0, _languageHandler._td)("Cactus");
(0, _languageHandler._td)("Mushroom");
(0, _languageHandler._td)("Globe");
(0, _languageHandler._td)("Moon");
(0, _languageHandler._td)("Cloud");
(0, _languageHandler._td)("Fire");
(0, _languageHandler._td)("Banana");
(0, _languageHandler._td)("Apple");
(0, _languageHandler._td)("Strawberry");
(0, _languageHandler._td)("Corn");
(0, _languageHandler._td)("Pizza");
(0, _languageHandler._td)("Cake");
(0, _languageHandler._td)("Heart");
(0, _languageHandler._td)("Smiley");
(0, _languageHandler._td)("Robot");
(0, _languageHandler._td)("Hat");
(0, _languageHandler._td)("Glasses");
(0, _languageHandler._td)("Spanner");
(0, _languageHandler._td)("Santa");
(0, _languageHandler._td)("Thumbs up");
(0, _languageHandler._td)("Umbrella");
(0, _languageHandler._td)("Hourglass");
(0, _languageHandler._td)("Clock");
(0, _languageHandler._td)("Gift");
(0, _languageHandler._td)("Light bulb");
(0, _languageHandler._td)("Book");
(0, _languageHandler._td)("Pencil");
(0, _languageHandler._td)("Paperclip");
(0, _languageHandler._td)("Scissors");
(0, _languageHandler._td)("Lock");
(0, _languageHandler._td)("Key");
(0, _languageHandler._td)("Hammer");
(0, _languageHandler._td)("Telephone");
(0, _languageHandler._td)("Flag");
(0, _languageHandler._td)("Train");
(0, _languageHandler._td)("Bicycle");
(0, _languageHandler._td)("Aeroplane");
(0, _languageHandler._td)("Rocket");
(0, _languageHandler._td)("Trophy");
(0, _languageHandler._td)("Ball");
(0, _languageHandler._td)("Guitar");
(0, _languageHandler._td)("Trumpet");
(0, _languageHandler._td)("Bell");
(0, _languageHandler._td)("Anchor");
(0, _languageHandler._td)("Headphones");
(0, _languageHandler._td)("Folder");
(0, _languageHandler._td)("Pin");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYXBGaXJzdCIsInMiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiVmVyaWZpY2F0aW9uU2hvd1NhcyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwicGVuZGluZyIsIm9uRG9uZSIsImNhbmNlbGxpbmciLCJvbkNhbmNlbCIsInN0YXRlIiwiY29tcG9uZW50V2lsbE1vdW50IiwiZml4dXBDb2xvckZvbnRzIiwicmVuZGVyIiwic2FzRGlzcGxheSIsInNhc0NhcHRpb24iLCJzYXMiLCJlbW9qaSIsImVtb2ppQmxvY2tzIiwibWFwIiwiaSIsIl90IiwiaXNTZWxmIiwiZGVjaW1hbCIsIm51bWJlckJsb2NrcyIsIm51bSIsImNvbmZpcm0iLCJ0ZXh0IiwiZGV2aWNlIiwiZGV2aWNlTmFtZSIsImdldERpc3BsYXlOYW1lIiwiZGV2aWNlSWQiLCJkaXNwbGF5TmFtZSIsIm9uRG9udE1hdGNoQ2xpY2siLCJvbk1hdGNoQ2xpY2siLCJfdGQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy92ZXJpZmljYXRpb24vVmVyaWZpY2F0aW9uU2hvd1Nhcy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IElHZW5lcmF0ZWRTYXMgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL3ZlcmlmaWNhdGlvbi9TQVNcIjtcbmltcG9ydCB7IERldmljZUluZm8gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvL2NyeXB0by9kZXZpY2VpbmZvXCI7XG5cbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgUGVuZGluZ0FjdGlvblNwaW5uZXIgfSBmcm9tIFwiLi4vcmlnaHRfcGFuZWwvRW5jcnlwdGlvbkluZm9cIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgeyBmaXh1cENvbG9yRm9udHMgfSBmcm9tICcuLi8uLi8uLi91dGlscy9Gb250TWFuYWdlcic7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHBlbmRpbmc/OiBib29sZWFuO1xuICAgIGRpc3BsYXlOYW1lPzogc3RyaW5nOyAvLyByZXF1aXJlZCBpZiBwZW5kaW5nIGlzIHRydWVcbiAgICBkZXZpY2U/OiBEZXZpY2VJbmZvO1xuICAgIG9uRG9uZTogKCkgPT4gdm9pZDtcbiAgICBvbkNhbmNlbDogKCkgPT4gdm9pZDtcbiAgICBzYXM6IElHZW5lcmF0ZWRTYXM7XG4gICAgaXNTZWxmPzogYm9vbGVhbjtcbiAgICBpbkRpYWxvZz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhpcyBjb21wb25lbnQgaXMgYmVpbmcgc2hvd24gaW4gYSBkaWFsb2cgYW5kIHRvIHVzZSBEaWFsb2dCdXR0b25zXG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHBlbmRpbmc6IGJvb2xlYW47XG4gICAgY2FuY2VsbGluZz86IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIGNhcEZpcnN0KHMpIHtcbiAgICByZXR1cm4gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlcmlmaWNhdGlvblNob3dTYXMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGVuZGluZzogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgLy8gQXMgdGhpcyBjb21wb25lbnQgaXMgYWxzbyB1c2VkIGJlZm9yZSBsb2dpbiAoZHVyaW5nIGNvbXBsZXRlIHNlY3VyaXR5KSxcbiAgICAgICAgLy8gYWxzbyBtYWtlIHN1cmUgd2UgaGF2ZSBhIHdvcmtpbmcgZW1vamkgZm9udCB0byBkaXNwbGF5IHRoZSBTQVMgZW1vamlzIGhlcmUuXG4gICAgICAgIC8vIFRoaXMgaXMgYWxzbyBkb25lIGZyb20gTG9nZ2VkSW5WaWV3LlxuICAgICAgICBmaXh1cENvbG9yRm9udHMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTWF0Y2hDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBlbmRpbmc6IHRydWUgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25Eb25lKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Eb250TWF0Y2hDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNhbmNlbGxpbmc6IHRydWUgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgc2FzRGlzcGxheTtcbiAgICAgICAgbGV0IHNhc0NhcHRpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNhcy5lbW9qaSkge1xuICAgICAgICAgICAgY29uc3QgZW1vamlCbG9ja3MgPSB0aGlzLnByb3BzLnNhcy5lbW9qaS5tYXAoXG4gICAgICAgICAgICAgICAgKGVtb2ppLCBpKSA9PiA8ZGl2IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblNob3dTYXNfZW1vamlTYXNfYmxvY2tcIiBrZXk9e2l9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblNob3dTYXNfZW1vamlTYXNfZW1vamlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZW1vamlbMF0gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9WZXJpZmljYXRpb25TaG93U2FzX2Vtb2ppU2FzX2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KGNhcEZpcnN0KGVtb2ppWzFdKSkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgc2FzRGlzcGxheSA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19lbW9qaVNhc1wiPlxuICAgICAgICAgICAgICAgIHsgZW1vamlCbG9ja3Muc2xpY2UoMCwgNCkgfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19lbW9qaVNhc19icmVha1wiIC8+XG4gICAgICAgICAgICAgICAgeyBlbW9qaUJsb2Nrcy5zbGljZSg0KSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICBzYXNDYXB0aW9uID0gdGhpcy5wcm9wcy5pc1NlbGYgP1xuICAgICAgICAgICAgICAgIF90KFxuICAgICAgICAgICAgICAgICAgICBcIkNvbmZpcm0gdGhlIGVtb2ppIGJlbG93IGFyZSBkaXNwbGF5ZWQgb24gYm90aCBkZXZpY2VzLCBpbiB0aGUgc2FtZSBvcmRlcjpcIixcbiAgICAgICAgICAgICAgICApOlxuICAgICAgICAgICAgICAgIF90KFxuICAgICAgICAgICAgICAgICAgICBcIlZlcmlmeSB0aGlzIHVzZXIgYnkgY29uZmlybWluZyB0aGUgZm9sbG93aW5nIGVtb2ppIGFwcGVhciBvbiB0aGVpciBzY3JlZW4uXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNhcy5kZWNpbWFsKSB7XG4gICAgICAgICAgICBjb25zdCBudW1iZXJCbG9ja3MgPSB0aGlzLnByb3BzLnNhcy5kZWNpbWFsLm1hcCgobnVtLCBpKSA9PiA8c3BhbiBrZXk9e2l9PlxuICAgICAgICAgICAgICAgIHsgbnVtIH1cbiAgICAgICAgICAgIDwvc3Bhbj4pO1xuICAgICAgICAgICAgc2FzRGlzcGxheSA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19kZWNpbWFsU2FzXCI+XG4gICAgICAgICAgICAgICAgeyBudW1iZXJCbG9ja3MgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgc2FzQ2FwdGlvbiA9IHRoaXMucHJvcHMuaXNTZWxmID9cbiAgICAgICAgICAgICAgICBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJWZXJpZnkgdGhpcyBkZXZpY2UgYnkgY29uZmlybWluZyB0aGUgZm9sbG93aW5nIG51bWJlciBhcHBlYXJzIG9uIGl0cyBzY3JlZW4uXCIsXG4gICAgICAgICAgICAgICAgKTpcbiAgICAgICAgICAgICAgICBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJWZXJpZnkgdGhpcyB1c2VyIGJ5IGNvbmZpcm1pbmcgdGhlIGZvbGxvd2luZyBudW1iZXIgYXBwZWFycyBvbiB0aGVpciBzY3JlZW4uXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJVbmFibGUgdG8gZmluZCBhIHN1cHBvcnRlZCB2ZXJpZmljYXRpb24gbWV0aG9kLlwiKSB9XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2FuY2VsfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnQ2FuY2VsJykgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb25maXJtO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nICYmIHRoaXMucHJvcHMuaXNTZWxmKSB7XG4gICAgICAgICAgICBsZXQgdGV4dDtcbiAgICAgICAgICAgIC8vIGRldmljZSBzaG91bGRuJ3QgYmUgbnVsbCBpbiB0aGlzIHNpdHVhdGlvbiBidXQgaXQgY2FuIGJlLCBlZy4gaWYgdGhlIGRldmljZSBpc1xuICAgICAgICAgICAgLy8gbG9nZ2VkIG91dCBkdXJpbmcgdmVyaWZpY2F0aW9uXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kZXZpY2UpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJXYWl0aW5nIGZvciB5b3UgdG8gdmVyaWZ5IG9uIHlvdXIgb3RoZXIgZGV2aWNlLCAlKGRldmljZU5hbWUpcyAoJShkZXZpY2VJZClzKeKAplwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldmljZU5hbWU6IHRoaXMucHJvcHMuZGV2aWNlID8gdGhpcy5wcm9wcy5kZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VJZDogdGhpcy5wcm9wcy5kZXZpY2UgPyB0aGlzLnByb3BzLmRldmljZS5kZXZpY2VJZCA6ICcnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJXYWl0aW5nIGZvciB5b3UgdG8gdmVyaWZ5IG9uIHlvdXIgb3RoZXIgZGV2aWNl4oCmXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uZmlybSA9IDxwPnsgdGV4dCB9PC9wPjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnBlbmRpbmcgfHwgdGhpcy5zdGF0ZS5jYW5jZWxsaW5nKSB7XG4gICAgICAgICAgICBsZXQgdGV4dDtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRpc3BsYXlOYW1lIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIldhaXRpbmcgZm9yICUoZGlzcGxheU5hbWUpcyB0byB2ZXJpZnnigKZcIiwgeyBkaXNwbGF5TmFtZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiQ2FuY2VsbGluZ+KAplwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbmZpcm0gPSA8UGVuZGluZ0FjdGlvblNwaW5uZXIgdGV4dD17dGV4dH0gLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maXJtID0gPGRpdiBjbGFzc05hbWU9XCJteF9WZXJpZmljYXRpb25TaG93U2FzX2J1dHRvblJvd1wiPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25Eb250TWF0Y2hDbGlja30ga2luZD1cImRhbmdlclwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVGhleSBkb24ndCBtYXRjaFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25NYXRjaENsaWNrfSBraW5kPVwicHJpbWFyeVwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVGhleSBtYXRjaFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc1wiPlxuICAgICAgICAgICAgPHA+eyBzYXNDYXB0aW9uIH08L3A+XG4gICAgICAgICAgICB7IHNhc0Rpc3BsYXkgfVxuICAgICAgICAgICAgPHA+eyB0aGlzLnByb3BzLmlzU2VsZiA/XG4gICAgICAgICAgICAgICAgXCJcIjpcbiAgICAgICAgICAgICAgICBfdChcIlRvIGJlIHNlY3VyZSwgZG8gdGhpcyBpbiBwZXJzb24gb3IgdXNlIGEgdHJ1c3RlZCB3YXkgdG8gY29tbXVuaWNhdGUuXCIpIH08L3A+XG4gICAgICAgICAgICB7IGNvbmZpcm0gfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG4vLyBMaXN0IG9mIEVtb2ppIHN0cmluZ3MgZnJvbSB0aGUganMtc2RrLCBmb3IgaTE4blxuX3RkKFwiRG9nXCIpO1xuX3RkKFwiQ2F0XCIpO1xuX3RkKFwiTGlvblwiKTtcbl90ZChcIkhvcnNlXCIpO1xuX3RkKFwiVW5pY29yblwiKTtcbl90ZChcIlBpZ1wiKTtcbl90ZChcIkVsZXBoYW50XCIpO1xuX3RkKFwiUmFiYml0XCIpO1xuX3RkKFwiUGFuZGFcIik7XG5fdGQoXCJSb29zdGVyXCIpO1xuX3RkKFwiUGVuZ3VpblwiKTtcbl90ZChcIlR1cnRsZVwiKTtcbl90ZChcIkZpc2hcIik7XG5fdGQoXCJPY3RvcHVzXCIpO1xuX3RkKFwiQnV0dGVyZmx5XCIpO1xuX3RkKFwiRmxvd2VyXCIpO1xuX3RkKFwiVHJlZVwiKTtcbl90ZChcIkNhY3R1c1wiKTtcbl90ZChcIk11c2hyb29tXCIpO1xuX3RkKFwiR2xvYmVcIik7XG5fdGQoXCJNb29uXCIpO1xuX3RkKFwiQ2xvdWRcIik7XG5fdGQoXCJGaXJlXCIpO1xuX3RkKFwiQmFuYW5hXCIpO1xuX3RkKFwiQXBwbGVcIik7XG5fdGQoXCJTdHJhd2JlcnJ5XCIpO1xuX3RkKFwiQ29yblwiKTtcbl90ZChcIlBpenphXCIpO1xuX3RkKFwiQ2FrZVwiKTtcbl90ZChcIkhlYXJ0XCIpO1xuX3RkKFwiU21pbGV5XCIpO1xuX3RkKFwiUm9ib3RcIik7XG5fdGQoXCJIYXRcIik7XG5fdGQoXCJHbGFzc2VzXCIpO1xuX3RkKFwiU3Bhbm5lclwiKTtcbl90ZChcIlNhbnRhXCIpO1xuX3RkKFwiVGh1bWJzIHVwXCIpO1xuX3RkKFwiVW1icmVsbGFcIik7XG5fdGQoXCJIb3VyZ2xhc3NcIik7XG5fdGQoXCJDbG9ja1wiKTtcbl90ZChcIkdpZnRcIik7XG5fdGQoXCJMaWdodCBidWxiXCIpO1xuX3RkKFwiQm9va1wiKTtcbl90ZChcIlBlbmNpbFwiKTtcbl90ZChcIlBhcGVyY2xpcFwiKTtcbl90ZChcIlNjaXNzb3JzXCIpO1xuX3RkKFwiTG9ja1wiKTtcbl90ZChcIktleVwiKTtcbl90ZChcIkhhbW1lclwiKTtcbl90ZChcIlRlbGVwaG9uZVwiKTtcbl90ZChcIkZsYWdcIik7XG5fdGQoXCJUcmFpblwiKTtcbl90ZChcIkJpY3ljbGVcIik7XG5fdGQoXCJBZXJvcGxhbmVcIik7XG5fdGQoXCJSb2NrZXRcIik7XG5fdGQoXCJUcm9waHlcIik7XG5fdGQoXCJCYWxsXCIpO1xuX3RkKFwiR3VpdGFyXCIpO1xuX3RkKFwiVHJ1bXBldFwiKTtcbl90ZChcIkJlbGxcIik7XG5fdGQoXCJBbmNob3JcIik7XG5fdGQoXCJIZWFkcGhvbmVzXCIpO1xuX3RkKFwiRm9sZGVyXCIpO1xuX3RkKFwiUGluXCIpO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBMkJBLFNBQVNBLFFBQVQsQ0FBa0JDLENBQWxCLEVBQXFCO0VBQ2pCLE9BQU9BLENBQUMsQ0FBQ0MsTUFBRixDQUFTLENBQVQsRUFBWUMsV0FBWixLQUE0QkYsQ0FBQyxDQUFDRyxLQUFGLENBQVEsQ0FBUixDQUFuQztBQUNIOztBQUVjLE1BQU1DLG1CQUFOLFNBQWtDQyxjQUFBLENBQU1DLFNBQXhDLENBQWtFO0VBQzdFQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1QixvREFlSixNQUFZO01BQy9CLEtBQUtDLFFBQUwsQ0FBYztRQUFFQyxPQUFPLEVBQUU7TUFBWCxDQUFkO01BQ0EsS0FBS0YsS0FBTCxDQUFXRyxNQUFYO0lBQ0gsQ0FsQjBCO0lBQUEsd0RBb0JBLE1BQVk7TUFDbkMsS0FBS0YsUUFBTCxDQUFjO1FBQUVHLFVBQVUsRUFBRTtNQUFkLENBQWQ7TUFDQSxLQUFLSixLQUFMLENBQVdLLFFBQVg7SUFDSCxDQXZCMEI7SUFHdkIsS0FBS0MsS0FBTCxHQUFhO01BQ1RKLE9BQU8sRUFBRTtJQURBLENBQWI7RUFHSDs7RUFFTUssa0JBQWtCLEdBQVM7SUFDOUI7SUFDQTtJQUNBO0lBQ0EsSUFBQUMsNEJBQUE7RUFDSDs7RUFZREMsTUFBTSxHQUFHO0lBQ0wsSUFBSUMsVUFBSjtJQUNBLElBQUlDLFVBQUo7O0lBQ0EsSUFBSSxLQUFLWCxLQUFMLENBQVdZLEdBQVgsQ0FBZUMsS0FBbkIsRUFBMEI7TUFDdEIsTUFBTUMsV0FBVyxHQUFHLEtBQUtkLEtBQUwsQ0FB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b0JBQUEsRUFBSSxTQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxTQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxTQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxXQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxVQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxZQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxLQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxTQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxTQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxXQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxVQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxXQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxZQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxXQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxVQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxLQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxXQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxPQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxTQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxXQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxTQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxNQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxZQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxRQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxLQUFKIn0=