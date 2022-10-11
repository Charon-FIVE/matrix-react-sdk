"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _VerificationRequest = require("matrix-js-sdk/src/crypto/verification/request/VerificationRequest");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _KeyVerificationStateObserver = require("../../../utils/KeyVerificationStateObserver");

var _RightPanelStorePhases = require("../../../stores/right-panel/RightPanelStorePhases");

var _EventTileBubble = _interopRequireDefault(require("./EventTileBubble"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
class MKeyVerificationRequest extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "openRequest", () => {
      const {
        verificationRequest
      } = this.props.mxEvent;

      const member = _MatrixClientPeg.MatrixClientPeg.get().getUser(verificationRequest.otherUserId);

      _RightPanelStore.default.instance.setCards([{
        phase: _RightPanelStorePhases.RightPanelPhases.RoomSummary
      }, {
        phase: _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo,
        state: {
          member
        }
      }, {
        phase: _RightPanelStorePhases.RightPanelPhases.EncryptionPanel,
        state: {
          verificationRequest,
          member
        }
      }]);
    });
    (0, _defineProperty2.default)(this, "onRequestChanged", () => {
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onAcceptClicked", async () => {
      const request = this.props.mxEvent.verificationRequest;

      if (request) {
        try {
          this.openRequest();
          await request.accept();
        } catch (err) {
          _logger.logger.error(err.message);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onRejectClicked", async () => {
      const request = this.props.mxEvent.verificationRequest;

      if (request) {
        try {
          await request.cancel();
        } catch (err) {
          _logger.logger.error(err.message);
        }
      }
    });
  }

  componentDidMount() {
    const request = this.props.mxEvent.verificationRequest;

    if (request) {
      request.on(_VerificationRequest.VerificationRequestEvent.Change, this.onRequestChanged);
    }
  }

  componentWillUnmount() {
    const request = this.props.mxEvent.verificationRequest;

    if (request) {
      request.off(_VerificationRequest.VerificationRequestEvent.Change, this.onRequestChanged);
    }
  }

  acceptedLabel(userId) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const myUserId = client.getUserId();

    if (userId === myUserId) {
      return (0, _languageHandler._t)("You accepted");
    } else {
      return (0, _languageHandler._t)("%(name)s accepted", {
        name: (0, _KeyVerificationStateObserver.getNameForEventRoom)(userId, this.props.mxEvent.getRoomId())
      });
    }
  }

  cancelledLabel(userId) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const myUserId = client.getUserId();
    const {
      cancellationCode
    } = this.props.mxEvent.verificationRequest;
    const declined = cancellationCode === "m.user";

    if (userId === myUserId) {
      if (declined) {
        return (0, _languageHandler._t)("You declined");
      } else {
        return (0, _languageHandler._t)("You cancelled");
      }
    } else {
      if (declined) {
        return (0, _languageHandler._t)("%(name)s declined", {
          name: (0, _KeyVerificationStateObserver.getNameForEventRoom)(userId, this.props.mxEvent.getRoomId())
        });
      } else {
        return (0, _languageHandler._t)("%(name)s cancelled", {
          name: (0, _KeyVerificationStateObserver.getNameForEventRoom)(userId, this.props.mxEvent.getRoomId())
        });
      }
    }
  }

  render() {
    const {
      mxEvent
    } = this.props;
    const request = mxEvent.verificationRequest;

    if (!request || request.invalid) {
      return null;
    }

    let title;
    let subtitle;
    let stateNode;

    if (!request.canAccept) {
      let stateLabel;
      const accepted = request.ready || request.started || request.done;

      if (accepted) {
        stateLabel = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: this.openRequest
        }, this.acceptedLabel(request.receivingUserId));
      } else if (request.cancelled) {
        stateLabel = this.cancelledLabel(request.cancellingUserId);
      } else if (request.accepting) {
        stateLabel = (0, _languageHandler._t)("Accepting …");
      } else if (request.declining) {
        stateLabel = (0, _languageHandler._t)("Declining …");
      }

      stateNode = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_cryptoEvent_state"
      }, stateLabel);
    }

    if (!request.initiatedByMe) {
      const name = (0, _KeyVerificationStateObserver.getNameForEventRoom)(request.requestingUserId, mxEvent.getRoomId());
      title = (0, _languageHandler._t)("%(name)s wants to verify", {
        name
      });
      subtitle = (0, _KeyVerificationStateObserver.userLabelForEventRoom)(request.requestingUserId, mxEvent.getRoomId());

      if (request.canAccept) {
        stateNode = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_cryptoEvent_buttons"
        }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "danger",
          onClick: this.onRejectClicked
        }, (0, _languageHandler._t)("Decline")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "primary",
          onClick: this.onAcceptClicked
        }, (0, _languageHandler._t)("Accept")));
      }
    } else {
      // request sent by us
      title = (0, _languageHandler._t)("You sent a verification request");
      subtitle = (0, _KeyVerificationStateObserver.userLabelForEventRoom)(request.receivingUserId, mxEvent.getRoomId());
    }

    if (title) {
      return /*#__PURE__*/_react.default.createElement(_EventTileBubble.default, {
        className: "mx_cryptoEvent mx_cryptoEvent_icon",
        title: title,
        subtitle: subtitle,
        timestamp: this.props.timestamp
      }, stateNode);
    }

    return null;
  }

}

exports.default = MKeyVerificationRequest;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNS2V5VmVyaWZpY2F0aW9uUmVxdWVzdCIsIlJlYWN0IiwiQ29tcG9uZW50IiwidmVyaWZpY2F0aW9uUmVxdWVzdCIsInByb3BzIiwibXhFdmVudCIsIm1lbWJlciIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFVzZXIiLCJvdGhlclVzZXJJZCIsIlJpZ2h0UGFuZWxTdG9yZSIsImluc3RhbmNlIiwic2V0Q2FyZHMiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJSb29tU3VtbWFyeSIsIlJvb21NZW1iZXJJbmZvIiwic3RhdGUiLCJFbmNyeXB0aW9uUGFuZWwiLCJmb3JjZVVwZGF0ZSIsInJlcXVlc3QiLCJvcGVuUmVxdWVzdCIsImFjY2VwdCIsImVyciIsImxvZ2dlciIsImVycm9yIiwibWVzc2FnZSIsImNhbmNlbCIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJWZXJpZmljYXRpb25SZXF1ZXN0RXZlbnQiLCJDaGFuZ2UiLCJvblJlcXVlc3RDaGFuZ2VkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJvZmYiLCJhY2NlcHRlZExhYmVsIiwidXNlcklkIiwiY2xpZW50IiwibXlVc2VySWQiLCJnZXRVc2VySWQiLCJfdCIsIm5hbWUiLCJnZXROYW1lRm9yRXZlbnRSb29tIiwiZ2V0Um9vbUlkIiwiY2FuY2VsbGVkTGFiZWwiLCJjYW5jZWxsYXRpb25Db2RlIiwiZGVjbGluZWQiLCJyZW5kZXIiLCJpbnZhbGlkIiwidGl0bGUiLCJzdWJ0aXRsZSIsInN0YXRlTm9kZSIsImNhbkFjY2VwdCIsInN0YXRlTGFiZWwiLCJhY2NlcHRlZCIsInJlYWR5Iiwic3RhcnRlZCIsImRvbmUiLCJyZWNlaXZpbmdVc2VySWQiLCJjYW5jZWxsZWQiLCJjYW5jZWxsaW5nVXNlcklkIiwiYWNjZXB0aW5nIiwiZGVjbGluaW5nIiwiaW5pdGlhdGVkQnlNZSIsInJlcXVlc3RpbmdVc2VySWQiLCJ1c2VyTGFiZWxGb3JFdmVudFJvb20iLCJvblJlamVjdENsaWNrZWQiLCJvbkFjY2VwdENsaWNrZWQiLCJ0aW1lc3RhbXAiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9tZXNzYWdlcy9NS2V5VmVyaWZpY2F0aW9uUmVxdWVzdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IFZlcmlmaWNhdGlvblJlcXVlc3RFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vdmVyaWZpY2F0aW9uL3JlcXVlc3QvVmVyaWZpY2F0aW9uUmVxdWVzdFwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZ2V0TmFtZUZvckV2ZW50Um9vbSwgdXNlckxhYmVsRm9yRXZlbnRSb29tIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvS2V5VmVyaWZpY2F0aW9uU3RhdGVPYnNlcnZlcic7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVBoYXNlcyc7XG5pbXBvcnQgRXZlbnRUaWxlQnViYmxlIGZyb20gXCIuL0V2ZW50VGlsZUJ1YmJsZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmUnO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBteEV2ZW50OiBNYXRyaXhFdmVudDtcbiAgICB0aW1lc3RhbXA/OiBKU1guRWxlbWVudDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUtleVZlcmlmaWNhdGlvblJlcXVlc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5wcm9wcy5teEV2ZW50LnZlcmlmaWNhdGlvblJlcXVlc3Q7XG4gICAgICAgIGlmIChyZXF1ZXN0KSB7XG4gICAgICAgICAgICByZXF1ZXN0Lm9uKFZlcmlmaWNhdGlvblJlcXVlc3RFdmVudC5DaGFuZ2UsIHRoaXMub25SZXF1ZXN0Q2hhbmdlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLnByb3BzLm14RXZlbnQudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIHJlcXVlc3Qub2ZmKFZlcmlmaWNhdGlvblJlcXVlc3RFdmVudC5DaGFuZ2UsIHRoaXMub25SZXF1ZXN0Q2hhbmdlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9wZW5SZXF1ZXN0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB7IHZlcmlmaWNhdGlvblJlcXVlc3QgfSA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXIodmVyaWZpY2F0aW9uUmVxdWVzdC5vdGhlclVzZXJJZCk7XG4gICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5zZXRDYXJkcyhbXG4gICAgICAgICAgICB7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlJvb21TdW1tYXJ5IH0sXG4gICAgICAgICAgICB7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJJbmZvLCBzdGF0ZTogeyBtZW1iZXIgfSB9LFxuICAgICAgICAgICAgeyBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWwsIHN0YXRlOiB7IHZlcmlmaWNhdGlvblJlcXVlc3QsIG1lbWJlciB9IH0sXG4gICAgICAgIF0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVxdWVzdENoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjY2VwdENsaWNrZWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLnByb3BzLm14RXZlbnQudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHJlcXVlc3QuYWNjZXB0KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWplY3RDbGlja2VkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5wcm9wcy5teEV2ZW50LnZlcmlmaWNhdGlvblJlcXVlc3Q7XG4gICAgICAgIGlmIChyZXF1ZXN0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHJlcXVlc3QuY2FuY2VsKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYWNjZXB0ZWRMYWJlbCh1c2VySWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gY2xpZW50LmdldFVzZXJJZCgpO1xuICAgICAgICBpZiAodXNlcklkID09PSBteVVzZXJJZCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiWW91IGFjY2VwdGVkXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShuYW1lKXMgYWNjZXB0ZWRcIiwgeyBuYW1lOiBnZXROYW1lRm9yRXZlbnRSb29tKHVzZXJJZCwgdGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2FuY2VsbGVkTGFiZWwodXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBteVVzZXJJZCA9IGNsaWVudC5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgeyBjYW5jZWxsYXRpb25Db2RlIH0gPSB0aGlzLnByb3BzLm14RXZlbnQudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgY29uc3QgZGVjbGluZWQgPSBjYW5jZWxsYXRpb25Db2RlID09PSBcIm0udXNlclwiO1xuICAgICAgICBpZiAodXNlcklkID09PSBteVVzZXJJZCkge1xuICAgICAgICAgICAgaWYgKGRlY2xpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiWW91IGRlY2xpbmVkXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoXCJZb3UgY2FuY2VsbGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRlY2xpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiJShuYW1lKXMgZGVjbGluZWRcIiwgeyBuYW1lOiBnZXROYW1lRm9yRXZlbnRSb29tKHVzZXJJZCwgdGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiJShuYW1lKXMgY2FuY2VsbGVkXCIsIHsgbmFtZTogZ2V0TmFtZUZvckV2ZW50Um9vbSh1c2VySWQsIHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IG14RXZlbnQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBteEV2ZW50LnZlcmlmaWNhdGlvblJlcXVlc3Q7XG5cbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QuaW52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCBzdWJ0aXRsZTtcbiAgICAgICAgbGV0IHN0YXRlTm9kZTtcblxuICAgICAgICBpZiAoIXJlcXVlc3QuY2FuQWNjZXB0KSB7XG4gICAgICAgICAgICBsZXQgc3RhdGVMYWJlbDtcbiAgICAgICAgICAgIGNvbnN0IGFjY2VwdGVkID0gcmVxdWVzdC5yZWFkeSB8fCByZXF1ZXN0LnN0YXJ0ZWQgfHwgcmVxdWVzdC5kb25lO1xuICAgICAgICAgICAgaWYgKGFjY2VwdGVkKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVMYWJlbCA9ICg8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9wZW5SZXF1ZXN0fT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmFjY2VwdGVkTGFiZWwocmVxdWVzdC5yZWNlaXZpbmdVc2VySWQpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZUxhYmVsID0gdGhpcy5jYW5jZWxsZWRMYWJlbChyZXF1ZXN0LmNhbmNlbGxpbmdVc2VySWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjY2VwdGluZykge1xuICAgICAgICAgICAgICAgIHN0YXRlTGFiZWwgPSBfdChcIkFjY2VwdGluZyDigKZcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3QuZGVjbGluaW5nKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVMYWJlbCA9IF90KFwiRGVjbGluaW5nIOKAplwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRlTm9kZSA9ICg8ZGl2IGNsYXNzTmFtZT1cIm14X2NyeXB0b0V2ZW50X3N0YXRlXCI+eyBzdGF0ZUxhYmVsIH08L2Rpdj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXF1ZXN0LmluaXRpYXRlZEJ5TWUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBnZXROYW1lRm9yRXZlbnRSb29tKHJlcXVlc3QucmVxdWVzdGluZ1VzZXJJZCwgbXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiJShuYW1lKXMgd2FudHMgdG8gdmVyaWZ5XCIsIHsgbmFtZSB9KTtcbiAgICAgICAgICAgIHN1YnRpdGxlID0gdXNlckxhYmVsRm9yRXZlbnRSb29tKHJlcXVlc3QucmVxdWVzdGluZ1VzZXJJZCwgbXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5jYW5BY2NlcHQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZU5vZGUgPSAoPGRpdiBjbGFzc05hbWU9XCJteF9jcnlwdG9FdmVudF9idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLm9uUmVqZWN0Q2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiRGVjbGluZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLm9uQWNjZXB0Q2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQWNjZXB0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2Pik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIHJlcXVlc3Qgc2VudCBieSB1c1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSBzZW50IGEgdmVyaWZpY2F0aW9uIHJlcXVlc3RcIik7XG4gICAgICAgICAgICBzdWJ0aXRsZSA9IHVzZXJMYWJlbEZvckV2ZW50Um9vbShyZXF1ZXN0LnJlY2VpdmluZ1VzZXJJZCwgbXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgIHJldHVybiA8RXZlbnRUaWxlQnViYmxlXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfY3J5cHRvRXZlbnQgbXhfY3J5cHRvRXZlbnRfaWNvblwiXG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgICAgIHN1YnRpdGxlPXtzdWJ0aXRsZX1cbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA9e3RoaXMucHJvcHMudGltZXN0YW1wfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgc3RhdGVOb2RlIH1cbiAgICAgICAgICAgIDwvRXZlbnRUaWxlQnViYmxlPjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvQmUsTUFBTUEsdUJBQU4sU0FBc0NDLGNBQUEsQ0FBTUMsU0FBNUMsQ0FBOEQ7RUFBQTtJQUFBO0lBQUEsbURBZW5ELE1BQU07TUFDeEIsTUFBTTtRQUFFQztNQUFGLElBQTBCLEtBQUtDLEtBQUws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