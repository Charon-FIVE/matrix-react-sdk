"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _VerificationRequest = require("matrix-js-sdk/src/crypto/verification/request/VerificationRequest");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _RightPanelStorePhases = require("../../../stores/right-panel/RightPanelStorePhases");

var _KeyVerificationStateObserver = require("../../../utils/KeyVerificationStateObserver");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _ToastStore = _interopRequireDefault(require("../../../stores/ToastStore"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _GenericToast = _interopRequireDefault(require("./GenericToast"));

var _actions = require("../../../dispatcher/actions");

var _VerificationRequestDialog = _interopRequireDefault(require("../dialogs/VerificationRequestDialog"));

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

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
class VerificationRequestToast extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "intervalHandle", void 0);
    (0, _defineProperty2.default)(this, "checkRequestIsPending", () => {
      const {
        request
      } = this.props;

      if (!request.canAccept) {
        _ToastStore.default.sharedInstance().dismissToast(this.props.toastKey);
      }
    });
    (0, _defineProperty2.default)(this, "cancel", () => {
      _ToastStore.default.sharedInstance().dismissToast(this.props.toastKey);

      try {
        this.props.request.cancel();
      } catch (err) {
        _logger.logger.error("Error while cancelling verification request", err);
      }
    });
    (0, _defineProperty2.default)(this, "accept", async () => {
      _ToastStore.default.sharedInstance().dismissToast(this.props.toastKey);

      const {
        request
      } = this.props; // no room id for to_device requests

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        if (request.channel.roomId) {
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoom,
            room_id: request.channel.roomId,
            should_peek: false,
            metricsTrigger: "VerificationRequest"
          });

          const member = cli.getUser(request.otherUserId);

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
              verificationRequest: request,
              member
            }
          }], undefined, request.channel.roomId);
        } else {
          _Modal.default.createDialog(_VerificationRequestDialog.default, {
            verificationRequest: request,
            onFinished: () => {
              request.cancel();
            }
          }, null,
          /* priority = */
          false,
          /* static = */
          true);
        }

        await request.accept();
      } catch (err) {
        _logger.logger.error(err.message);
      }
    });
    this.state = {
      counter: Math.ceil(props.request.timeout / 1000)
    };
  }

  async componentDidMount() {
    const {
      request
    } = this.props;

    if (request.timeout && request.timeout > 0) {
      this.intervalHandle = setInterval(() => {
        let {
          counter
        } = this.state;
        counter = Math.max(0, counter - 1);
        this.setState({
          counter
        });
      }, 1000);
    }

    request.on(_VerificationRequest.VerificationRequestEvent.Change, this.checkRequestIsPending); // We should probably have a separate class managing the active verification toasts,
    // rather than monitoring this in the toast component itself, since we'll get problems
    // like the toast not going away when the verification is cancelled unless it's the
    // one on the top (ie. the one that's mounted).
    // As a quick & dirty fix, check the toast is still relevant when it mounts (this prevents
    // a toast hanging around after logging in if you did a verification as part of login).

    this.checkRequestIsPending();

    if (request.isSelfVerification) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const device = await cli.getDevice(request.channel.deviceId);
      const ip = device.last_seen_ip;
      this.setState({
        device: cli.getStoredDevice(cli.getUserId(), request.channel.deviceId),
        ip
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalHandle);
    const {
      request
    } = this.props;
    request.off(_VerificationRequest.VerificationRequestEvent.Change, this.checkRequestIsPending);
  }

  render() {
    const {
      request
    } = this.props;
    let description;
    let detail;

    if (request.isSelfVerification) {
      if (this.state.device) {
        description = this.state.device.getDisplayName();
        detail = (0, _languageHandler._t)("%(deviceId)s from %(ip)s", {
          deviceId: this.state.device.deviceId,
          ip: this.state.ip
        });
      }
    } else {
      const userId = request.otherUserId;
      const roomId = request.channel.roomId;
      description = roomId ? (0, _KeyVerificationStateObserver.userLabelForEventRoom)(userId, roomId) : userId; // for legacy to_device verification requests

      if (description === userId) {
        const client = _MatrixClientPeg.MatrixClientPeg.get();

        const user = client.getUser(userId);

        if (user && user.displayName) {
          description = (0, _languageHandler._t)("%(name)s (%(userId)s)", {
            name: user.displayName,
            userId
          });
        }
      }
    }

    const declineLabel = this.state.counter === 0 ? (0, _languageHandler._t)("Decline") : (0, _languageHandler._t)("Decline (%(counter)s)", {
      counter: this.state.counter
    });
    return /*#__PURE__*/_react.default.createElement(_GenericToast.default, {
      description: description,
      detail: detail,
      acceptLabel: (0, _languageHandler._t)("Accept"),
      onAccept: this.accept,
      rejectLabel: declineLabel,
      onReject: this.cancel
    });
  }

}

exports.default = VerificationRequestToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZXJpZmljYXRpb25SZXF1ZXN0VG9hc3QiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicmVxdWVzdCIsImNhbkFjY2VwdCIsIlRvYXN0U3RvcmUiLCJzaGFyZWRJbnN0YW5jZSIsImRpc21pc3NUb2FzdCIsInRvYXN0S2V5IiwiY2FuY2VsIiwiZXJyIiwibG9nZ2VyIiwiZXJyb3IiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjaGFubmVsIiwicm9vbUlkIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3Um9vbSIsInJvb21faWQiLCJzaG91bGRfcGVlayIsIm1ldHJpY3NUcmlnZ2VyIiwibWVtYmVyIiwiZ2V0VXNlciIsIm90aGVyVXNlcklkIiwiUmlnaHRQYW5lbFN0b3JlIiwiaW5zdGFuY2UiLCJzZXRDYXJkcyIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIlJvb21TdW1tYXJ5IiwiUm9vbU1lbWJlckluZm8iLCJzdGF0ZSIsIkVuY3J5cHRpb25QYW5lbCIsInZlcmlmaWNhdGlvblJlcXVlc3QiLCJ1bmRlZmluZWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlZlcmlmaWNhdGlvblJlcXVlc3REaWFsb2ciLCJvbkZpbmlzaGVkIiwiYWNjZXB0IiwibWVzc2FnZSIsImNvdW50ZXIiLCJNYXRoIiwiY2VpbCIsInRpbWVvdXQiLCJjb21wb25lbnREaWRNb3VudCIsImludGVydmFsSGFuZGxlIiwic2V0SW50ZXJ2YWwiLCJtYXgiLCJzZXRTdGF0ZSIsIm9uIiwiVmVyaWZpY2F0aW9uUmVxdWVzdEV2ZW50IiwiQ2hhbmdlIiwiY2hlY2tSZXF1ZXN0SXNQZW5kaW5nIiwiaXNTZWxmVmVyaWZpY2F0aW9uIiwiZGV2aWNlIiwiZ2V0RGV2aWNlIiwiZGV2aWNlSWQiLCJpcCIsImxhc3Rfc2Vlbl9pcCIsImdldFN0b3JlZERldmljZSIsImdldFVzZXJJZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY2xlYXJJbnRlcnZhbCIsIm9mZiIsInJlbmRlciIsImRlc2NyaXB0aW9uIiwiZGV0YWlsIiwiZ2V0RGlzcGxheU5hbWUiLCJfdCIsInVzZXJJZCIsInVzZXJMYWJlbEZvckV2ZW50Um9vbSIsImNsaWVudCIsInVzZXIiLCJkaXNwbGF5TmFtZSIsIm5hbWUiLCJkZWNsaW5lTGFiZWwiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy90b2FzdHMvVmVyaWZpY2F0aW9uUmVxdWVzdFRvYXN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTktMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbmh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgICBWZXJpZmljYXRpb25SZXF1ZXN0LFxuICAgIFZlcmlmaWNhdGlvblJlcXVlc3RFdmVudCxcbn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vcmVxdWVzdC9WZXJpZmljYXRpb25SZXF1ZXN0XCI7XG5pbXBvcnQgeyBEZXZpY2VJbmZvIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9kZXZpY2VpbmZvXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVBoYXNlcyc7XG5pbXBvcnQgeyB1c2VyTGFiZWxGb3JFdmVudFJvb20gfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvS2V5VmVyaWZpY2F0aW9uU3RhdGVPYnNlcnZlclwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgVG9hc3RTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1RvYXN0U3RvcmVcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBHZW5lcmljVG9hc3QgZnJvbSBcIi4vR2VuZXJpY1RvYXN0XCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgVmVyaWZpY2F0aW9uUmVxdWVzdERpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9WZXJpZmljYXRpb25SZXF1ZXN0RGlhbG9nXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcmlnaHQtcGFuZWwvUmlnaHRQYW5lbFN0b3JlXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdG9hc3RLZXk6IHN0cmluZztcbiAgICByZXF1ZXN0OiBWZXJpZmljYXRpb25SZXF1ZXN0O1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBjb3VudGVyOiBudW1iZXI7XG4gICAgZGV2aWNlPzogRGV2aWNlSW5mbztcbiAgICBpcD86IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVyaWZpY2F0aW9uUmVxdWVzdFRvYXN0IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgaW50ZXJ2YWxIYW5kbGU6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgY291bnRlcjogTWF0aC5jZWlsKHByb3BzLnJlcXVlc3QudGltZW91dCAvIDEwMDApIH07XG4gICAgfVxuXG4gICAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHsgcmVxdWVzdCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKHJlcXVlc3QudGltZW91dCAmJiByZXF1ZXN0LnRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsSGFuZGxlID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB7IGNvdW50ZXIgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICAgICAgY291bnRlciA9IE1hdGgubWF4KDAsIGNvdW50ZXIgLSAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY291bnRlciB9KTtcbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3Qub24oVmVyaWZpY2F0aW9uUmVxdWVzdEV2ZW50LkNoYW5nZSwgdGhpcy5jaGVja1JlcXVlc3RJc1BlbmRpbmcpO1xuICAgICAgICAvLyBXZSBzaG91bGQgcHJvYmFibHkgaGF2ZSBhIHNlcGFyYXRlIGNsYXNzIG1hbmFnaW5nIHRoZSBhY3RpdmUgdmVyaWZpY2F0aW9uIHRvYXN0cyxcbiAgICAgICAgLy8gcmF0aGVyIHRoYW4gbW9uaXRvcmluZyB0aGlzIGluIHRoZSB0b2FzdCBjb21wb25lbnQgaXRzZWxmLCBzaW5jZSB3ZSdsbCBnZXQgcHJvYmxlbXNcbiAgICAgICAgLy8gbGlrZSB0aGUgdG9hc3Qgbm90IGdvaW5nIGF3YXkgd2hlbiB0aGUgdmVyaWZpY2F0aW9uIGlzIGNhbmNlbGxlZCB1bmxlc3MgaXQncyB0aGVcbiAgICAgICAgLy8gb25lIG9uIHRoZSB0b3AgKGllLiB0aGUgb25lIHRoYXQncyBtb3VudGVkKS5cbiAgICAgICAgLy8gQXMgYSBxdWljayAmIGRpcnR5IGZpeCwgY2hlY2sgdGhlIHRvYXN0IGlzIHN0aWxsIHJlbGV2YW50IHdoZW4gaXQgbW91bnRzICh0aGlzIHByZXZlbnRzXG4gICAgICAgIC8vIGEgdG9hc3QgaGFuZ2luZyBhcm91bmQgYWZ0ZXIgbG9nZ2luZyBpbiBpZiB5b3UgZGlkIGEgdmVyaWZpY2F0aW9uIGFzIHBhcnQgb2YgbG9naW4pLlxuICAgICAgICB0aGlzLmNoZWNrUmVxdWVzdElzUGVuZGluZygpO1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgY29uc3QgZGV2aWNlID0gYXdhaXQgY2xpLmdldERldmljZShyZXF1ZXN0LmNoYW5uZWwuZGV2aWNlSWQpO1xuICAgICAgICAgICAgY29uc3QgaXAgPSBkZXZpY2UubGFzdF9zZWVuX2lwO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZGV2aWNlOiBjbGkuZ2V0U3RvcmVkRGV2aWNlKGNsaS5nZXRVc2VySWQoKSwgcmVxdWVzdC5jaGFubmVsLmRldmljZUlkKSxcbiAgICAgICAgICAgICAgICBpcCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbEhhbmRsZSk7XG4gICAgICAgIGNvbnN0IHsgcmVxdWVzdCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgcmVxdWVzdC5vZmYoVmVyaWZpY2F0aW9uUmVxdWVzdEV2ZW50LkNoYW5nZSwgdGhpcy5jaGVja1JlcXVlc3RJc1BlbmRpbmcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tSZXF1ZXN0SXNQZW5kaW5nID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB7IHJlcXVlc3QgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmICghcmVxdWVzdC5jYW5BY2NlcHQpIHtcbiAgICAgICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5kaXNtaXNzVG9hc3QodGhpcy5wcm9wcy50b2FzdEtleSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY2FuY2VsID0gKCkgPT4ge1xuICAgICAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkuZGlzbWlzc1RvYXN0KHRoaXMucHJvcHMudG9hc3RLZXkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXF1ZXN0LmNhbmNlbCgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIHdoaWxlIGNhbmNlbGxpbmcgdmVyaWZpY2F0aW9uIHJlcXVlc3RcIiwgZXJyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhY2NlcHQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5kaXNtaXNzVG9hc3QodGhpcy5wcm9wcy50b2FzdEtleSk7XG4gICAgICAgIGNvbnN0IHsgcmVxdWVzdCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgLy8gbm8gcm9vbSBpZCBmb3IgdG9fZGV2aWNlIHJlcXVlc3RzXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LmNoYW5uZWwucm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogcmVxdWVzdC5jaGFubmVsLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkX3BlZWs6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJWZXJpZmljYXRpb25SZXF1ZXN0XCIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gY2xpLmdldFVzZXIocmVxdWVzdC5vdGhlclVzZXJJZCk7XG4gICAgICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnNldENhcmRzKFxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlJvb21TdW1tYXJ5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJJbmZvLCBzdGF0ZTogeyBtZW1iZXIgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWwsIHN0YXRlOiB7IHZlcmlmaWNhdGlvblJlcXVlc3Q6IHJlcXVlc3QsIG1lbWJlciB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5jaGFubmVsLnJvb21JZCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coVmVyaWZpY2F0aW9uUmVxdWVzdERpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25SZXF1ZXN0OiByZXF1ZXN0LFxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LmNhbmNlbCgpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgcmVxdWVzdC5hY2NlcHQoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyByZXF1ZXN0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBsZXQgZGVzY3JpcHRpb247XG4gICAgICAgIGxldCBkZXRhaWw7XG4gICAgICAgIGlmIChyZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGV2aWNlKSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSB0aGlzLnN0YXRlLmRldmljZS5nZXREaXNwbGF5TmFtZSgpO1xuICAgICAgICAgICAgICAgIGRldGFpbCA9IF90KFwiJShkZXZpY2VJZClzIGZyb20gJShpcClzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlSWQ6IHRoaXMuc3RhdGUuZGV2aWNlLmRldmljZUlkLFxuICAgICAgICAgICAgICAgICAgICBpcDogdGhpcy5zdGF0ZS5pcCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHJlcXVlc3Qub3RoZXJVc2VySWQ7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSByZXF1ZXN0LmNoYW5uZWwucm9vbUlkO1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSByb29tSWQgPyB1c2VyTGFiZWxGb3JFdmVudFJvb20odXNlcklkLCByb29tSWQpIDogdXNlcklkO1xuICAgICAgICAgICAgLy8gZm9yIGxlZ2FjeSB0b19kZXZpY2UgdmVyaWZpY2F0aW9uIHJlcXVlc3RzXG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24gPT09IHVzZXJJZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VyID0gY2xpZW50LmdldFVzZXIodXNlcklkKTtcbiAgICAgICAgICAgICAgICBpZiAodXNlciAmJiB1c2VyLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXCIlKG5hbWUpcyAoJSh1c2VySWQpcylcIiwgeyBuYW1lOiB1c2VyLmRpc3BsYXlOYW1lLCB1c2VySWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlY2xpbmVMYWJlbCA9IHRoaXMuc3RhdGUuY291bnRlciA9PT0gMCA/XG4gICAgICAgICAgICBfdChcIkRlY2xpbmVcIikgOlxuICAgICAgICAgICAgX3QoXCJEZWNsaW5lICglKGNvdW50ZXIpcylcIiwgeyBjb3VudGVyOiB0aGlzLnN0YXRlLmNvdW50ZXIgfSk7XG5cbiAgICAgICAgcmV0dXJuIDxHZW5lcmljVG9hc3RcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtkZXNjcmlwdGlvbn1cbiAgICAgICAgICAgIGRldGFpbD17ZGV0YWlsfVxuICAgICAgICAgICAgYWNjZXB0TGFiZWw9e190KFwiQWNjZXB0XCIpfVxuICAgICAgICAgICAgb25BY2NlcHQ9e3RoaXMuYWNjZXB0fVxuICAgICAgICAgICAgcmVqZWN0TGFiZWw9e2RlY2xpbmVMYWJlbH1cbiAgICAgICAgICAgIG9uUmVqZWN0PXt0aGlzLmNhbmNlbH1cbiAgICAgICAgLz47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFLQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0NlLE1BQU1BLHdCQUFOLFNBQXVDQyxjQUFBLENBQU1DLGFBQTdDLENBQTJFO0VBR3RGQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZTtJQUFBLDZEQXdDYSxNQUFNO01BQ2xDLE1BQU07UUFBRUM7TUFBRixJQUFjLEtBQUtELEtBQXpCOztNQUNBLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxTQUFiLEVBQXdCO1FBQ3BCQyxtQkFBQSxDQUFXQyxjQUFYLEdBQTRCQyxZQUE1QixDQUF5QyxLQUFLTCxLQUFMLENBQVdNLFFBQXBEO01BQ0g7SUFDSixDQTdDa0I7SUFBQSw4Q0ErQ1YsTUFBTTtNQUNYSCxtQkFBQSxDQUFXQyxjQUFYLEdBQTRCQyxZQUE1QixDQUF5QyxLQUFLTCxLQUFMLENBQVdNLFFB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