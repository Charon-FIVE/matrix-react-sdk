"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalWidgetStore = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _logger = require("matrix-js-sdk/src/logger");

var _AsyncStoreWithClient = require("./AsyncStoreWithClient");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../Modal"));

var _ModalWidgetDialog = _interopRequireDefault(require("../components/views/dialogs/ModalWidgetDialog"));

var _WidgetMessagingStore = require("./widgets/WidgetMessagingStore");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class ModalWidgetStore extends _AsyncStoreWithClient.AsyncStoreWithClient {
  constructor() {
    super(_dispatcher.default, {});
    (0, _defineProperty2.default)(this, "modalInstance", null);
    (0, _defineProperty2.default)(this, "openSourceWidgetId", null);
    (0, _defineProperty2.default)(this, "openSourceWidgetRoomId", null);
    (0, _defineProperty2.default)(this, "canOpenModalWidget", () => {
      return !this.modalInstance;
    });
    (0, _defineProperty2.default)(this, "openModalWidget", (requestData, sourceWidget, widgetRoomId) => {
      if (this.modalInstance) return;
      this.openSourceWidgetId = sourceWidget.id;
      this.openSourceWidgetRoomId = widgetRoomId;
      this.modalInstance = _Modal.default.createDialog(_ModalWidgetDialog.default, {
        widgetDefinition: _objectSpread({}, requestData),
        widgetRoomId,
        sourceWidgetId: sourceWidget.id,
        onFinished: (success, data) => {
          if (!success) {
            this.closeModalWidget(sourceWidget, widgetRoomId, {
              "m.exited": true
            });
          } else {
            this.closeModalWidget(sourceWidget, widgetRoomId, data);
          }

          this.openSourceWidgetId = null;
          this.openSourceWidgetRoomId = null;
          this.modalInstance = null;
        }
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "closeModalWidget", (sourceWidget, widgetRoomId, data) => {
      if (!this.modalInstance) return;

      if (this.openSourceWidgetId === sourceWidget.id && this.openSourceWidgetRoomId === widgetRoomId) {
        this.openSourceWidgetId = null;
        this.openSourceWidgetRoomId = null;
        this.modalInstance.close();
        this.modalInstance = null;

        const sourceMessaging = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessaging(sourceWidget, widgetRoomId);

        if (!sourceMessaging) {
          _logger.logger.error("No source widget messaging for modal widget");

          return;
        }

        sourceMessaging.notifyModalWidgetClose(data);
      }
    });
  }

  static get instance() {
    return ModalWidgetStore.internalInstance;
  }

  async onAction(payload) {// nothing
  }

}

exports.ModalWidgetStore = ModalWidgetStore;
(0, _defineProperty2.default)(ModalWidgetStore, "internalInstance", (() => {
  const instance = new ModalWidgetStore();
  instance.start();
  return instance;
})());
window.mxModalWidgetStore = ModalWidgetStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb2RhbFdpZGdldFN0b3JlIiwiQXN5bmNTdG9yZVdpdGhDbGllbnQiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHREaXNwYXRjaGVyIiwibW9kYWxJbnN0YW5jZSIsInJlcXVlc3REYXRhIiwic291cmNlV2lkZ2V0Iiwid2lkZ2V0Um9vbUlkIiwib3BlblNvdXJjZVdpZGdldElkIiwiaWQiLCJvcGVuU291cmNlV2lkZ2V0Um9vbUlkIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJNb2RhbFdpZGdldERpYWxvZyIsIndpZGdldERlZmluaXRpb24iLCJzb3VyY2VXaWRnZXRJZCIsIm9uRmluaXNoZWQiLCJzdWNjZXNzIiwiZGF0YSIsImNsb3NlTW9kYWxXaWRnZXQiLCJjbG9zZSIsInNvdXJjZU1lc3NhZ2luZyIsIldpZGdldE1lc3NhZ2luZ1N0b3JlIiwiaW5zdGFuY2UiLCJnZXRNZXNzYWdpbmciLCJsb2dnZXIiLCJlcnJvciIsIm5vdGlmeU1vZGFsV2lkZ2V0Q2xvc2UiLCJpbnRlcm5hbEluc3RhbmNlIiwib25BY3Rpb24iLCJwYXlsb2FkIiwic3RhcnQiLCJ3aW5kb3ciLCJteE1vZGFsV2lkZ2V0U3RvcmUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RvcmVzL01vZGFsV2lkZ2V0U3RvcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgSU1vZGFsV2lkZ2V0T3BlblJlcXVlc3REYXRhLCBJTW9kYWxXaWRnZXRSZXR1cm5EYXRhLCBXaWRnZXQgfSBmcm9tIFwibWF0cml4LXdpZGdldC1hcGlcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgQXN5bmNTdG9yZVdpdGhDbGllbnQgfSBmcm9tIFwiLi9Bc3luY1N0b3JlV2l0aENsaWVudFwiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IE1vZGFsLCB7IElIYW5kbGUsIElNb2RhbCB9IGZyb20gXCIuLi9Nb2RhbFwiO1xuaW1wb3J0IE1vZGFsV2lkZ2V0RGlhbG9nIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTW9kYWxXaWRnZXREaWFsb2dcIjtcbmltcG9ydCB7IFdpZGdldE1lc3NhZ2luZ1N0b3JlIH0gZnJvbSBcIi4vd2lkZ2V0cy9XaWRnZXRNZXNzYWdpbmdTdG9yZVwiO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBtb2RhbD86IElNb2RhbDxhbnk+O1xuICAgIG9wZW5lZEZyb21JZD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIE1vZGFsV2lkZ2V0U3RvcmUgZXh0ZW5kcyBBc3luY1N0b3JlV2l0aENsaWVudDxJU3RhdGU+IHtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBpbnRlcm5hbEluc3RhbmNlID0gKCgpID0+IHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgTW9kYWxXaWRnZXRTdG9yZSgpO1xuICAgICAgICBpbnN0YW5jZS5zdGFydCgpO1xuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfSkoKTtcbiAgICBwcml2YXRlIG1vZGFsSW5zdGFuY2U6IElIYW5kbGU8dm9pZFtdPiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgb3BlblNvdXJjZVdpZGdldElkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIG9wZW5Tb3VyY2VXaWRnZXRSb29tSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoZGVmYXVsdERpc3BhdGNoZXIsIHt9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBpbnN0YW5jZSgpOiBNb2RhbFdpZGdldFN0b3JlIHtcbiAgICAgICAgcmV0dXJuIE1vZGFsV2lkZ2V0U3RvcmUuaW50ZXJuYWxJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25BY3Rpb24ocGF5bG9hZDogQWN0aW9uUGF5bG9hZCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIC8vIG5vdGhpbmdcbiAgICB9XG5cbiAgICBwdWJsaWMgY2FuT3Blbk1vZGFsV2lkZ2V0ID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMubW9kYWxJbnN0YW5jZTtcbiAgICB9O1xuXG4gICAgcHVibGljIG9wZW5Nb2RhbFdpZGdldCA9IChcbiAgICAgICAgcmVxdWVzdERhdGE6IElNb2RhbFdpZGdldE9wZW5SZXF1ZXN0RGF0YSxcbiAgICAgICAgc291cmNlV2lkZ2V0OiBXaWRnZXQsXG4gICAgICAgIHdpZGdldFJvb21JZD86IHN0cmluZyxcbiAgICApID0+IHtcbiAgICAgICAgaWYgKHRoaXMubW9kYWxJbnN0YW5jZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLm9wZW5Tb3VyY2VXaWRnZXRJZCA9IHNvdXJjZVdpZGdldC5pZDtcbiAgICAgICAgdGhpcy5vcGVuU291cmNlV2lkZ2V0Um9vbUlkID0gd2lkZ2V0Um9vbUlkO1xuICAgICAgICB0aGlzLm1vZGFsSW5zdGFuY2UgPSBNb2RhbC5jcmVhdGVEaWFsb2coTW9kYWxXaWRnZXREaWFsb2csIHtcbiAgICAgICAgICAgIHdpZGdldERlZmluaXRpb246IHsgLi4ucmVxdWVzdERhdGEgfSxcbiAgICAgICAgICAgIHdpZGdldFJvb21JZCxcbiAgICAgICAgICAgIHNvdXJjZVdpZGdldElkOiBzb3VyY2VXaWRnZXQuaWQsXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAoc3VjY2VzczogYm9vbGVhbiwgZGF0YT86IElNb2RhbFdpZGdldFJldHVybkRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1vZGFsV2lkZ2V0KHNvdXJjZVdpZGdldCwgd2lkZ2V0Um9vbUlkLCB7IFwibS5leGl0ZWRcIjogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTW9kYWxXaWRnZXQoc291cmNlV2lkZ2V0LCB3aWRnZXRSb29tSWQsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMub3BlblNvdXJjZVdpZGdldElkID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5Tb3VyY2VXaWRnZXRSb29tSWQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kYWxJbnN0YW5jZSA9IG51bGw7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGNsb3NlTW9kYWxXaWRnZXQgPSAoXG4gICAgICAgIHNvdXJjZVdpZGdldDogV2lkZ2V0LFxuICAgICAgICB3aWRnZXRSb29tSWQ/OiBzdHJpbmcsXG4gICAgICAgIGRhdGE/OiBJTW9kYWxXaWRnZXRSZXR1cm5EYXRhLFxuICAgICkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubW9kYWxJbnN0YW5jZSkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5vcGVuU291cmNlV2lkZ2V0SWQgPT09IHNvdXJjZVdpZGdldC5pZCAmJiB0aGlzLm9wZW5Tb3VyY2VXaWRnZXRSb29tSWQgPT09IHdpZGdldFJvb21JZCkge1xuICAgICAgICAgICAgdGhpcy5vcGVuU291cmNlV2lkZ2V0SWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5vcGVuU291cmNlV2lkZ2V0Um9vbUlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5tb2RhbEluc3RhbmNlID0gbnVsbDtcblxuICAgICAgICAgICAgY29uc3Qgc291cmNlTWVzc2FnaW5nID0gV2lkZ2V0TWVzc2FnaW5nU3RvcmUuaW5zdGFuY2UuZ2V0TWVzc2FnaW5nKHNvdXJjZVdpZGdldCwgd2lkZ2V0Um9vbUlkKTtcbiAgICAgICAgICAgIGlmICghc291cmNlTWVzc2FnaW5nKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiTm8gc291cmNlIHdpZGdldCBtZXNzYWdpbmcgZm9yIG1vZGFsIHdpZGdldFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VyY2VNZXNzYWdpbmcubm90aWZ5TW9kYWxXaWRnZXRDbG9zZShkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbndpbmRvdy5teE1vZGFsV2lkZ2V0U3RvcmUgPSBNb2RhbFdpZGdldFN0b3JlLmluc3RhbmNlO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7O0FBT08sTUFBTUEsZ0JBQU4sU0FBK0JDLDBDQUEvQixDQUE0RDtFQVV2REMsV0FBVyxHQUFHO0lBQ2xCLE1BQU1DLG1CQUFOLEVBQXlCLEVBQXpCO0lBRGtCLHFEQUowQixJQUkxQjtJQUFBLDBEQUhzQixJQUd0QjtJQUFBLDhEQUYwQixJQUUxQjtJQUFBLDBEQVlNLE1BQU07TUFDOUIsT0FBTyxDQUFDLEtBQUtDLGFBQWI7SUFDSCxDQWRxQjtJQUFBLHVEQWdCRyxDQUNyQkMsV0FEcUIsRUFFckJDLFlBRnFCLEVBR3JCQyxZQUhxQixLQUlwQjtNQUNELElBQUksS0FBS0gsYUFBVCxFQUF3QjtNQUN4QixLQUFLSSxrQkFBTCxHQUEwQkYsWUFBWSxDQUFDRyxFQUF2QztNQUNBLEtBQUtDLHNCQUFMLEdBQThCSCxZQUE5QjtNQUNBLEtBQUtILGFBQUwsR0FBcUJPLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsMEJBQW5CLEVBQXNDO1FBQ3ZEQyxnQkFBZ0Isb0JBQU9ULFdBQVAsQ0FEdUM7UUFFdkRFLFlBRnVEO1FBR3ZEUSxjQUFjLEVBQUVULFlBQVksQ0FBQ0csRUFIMEI7UUFJdkRPLFVBQVUsRUFBRSxDQUFDQyxPQUFELEVBQW1CQyxJQUFuQixLQUFxRDtVQUM3RCxJQUFJLENBQUNELE9BQUwsRUFBYztZQUNWLEtBQUtFLGdCQUFMLENBQXNCYixZQUF0QixFQUFvQ0MsWUFBcEMsRUFBa0Q7Y0FBRSxZQUFZO1lBQWQsQ0FBbEQ7VUFDSCxDQUZELE1BRU87WUFDSCxLQUFLWSxnQkFBTCxDQUFzQmIsWUFBdEIsRUFBb0NDLFlBQXBDLEVBQWtEVyxJQUFsRDtVQUNIOztVQUVELEtBQUtWLGtCQUFMLEdBQTBCLElBQTFCO1VBQ0EsS0FBS0Usc0JBQUwsR0FBOEIsSUFBOUI7VUFDQSxLQUFLTixhQUFMLEdBQXFCLElBQXJCO1FBQ0g7TUFkc0QsQ0FBdEMsRUFlbEIsSUFma0I7TUFlWjtNQUFpQixLQWZMO01BZVk7TUFBZSxJQWYzQixDQUFyQjtJQWdCSCxDQXhDcUI7SUFBQSx3REEwQ0ksQ0FDdEJFLFlBRHNCLEVBRXRCQyxZQUZzQixFQUd0QlcsSUFIc0IsS0FJckI7TUFDRCxJQUFJLENBQUMsS0FBS2QsYUFBVixFQUF5Qjs7TUFDekIsSUFBSSxLQUFLSSxrQkFBTCxLQUE0QkYsWUFBWSxDQUFDRyxFQUF6QyxJQUErQyxLQUFLQyxzQkFBTCxLQUFnQ0gsWUFBbkYsRUFBaUc7UUFDN0YsS0FBS0Msa0JBQUwsR0FBMEIsSUFBMUI7UUFDQSxLQUFLRSxzQkFBTCxHQUE4QixJQUE5QjtRQUNBLEtBQUtOLGFBQUwsQ0FBbUJnQixLQUFuQjtRQUNBLEtBQUtoQixhQUFMLEdBQXFCLElBQXJCOztRQUVBLE1BQU1pQixlQUFlLEdBQUdDLDBDQUFBLENBQXFCQyxRQUFyQixDQUE4QkMsWUFBOUIsQ0FBMkNsQixZQUEzQyxFQUF5REMsWUFBekQsQ0FBeEI7O1FBQ0EsSUFBSSxDQUFDYyxlQUFMLEVBQXNCO1VBQ2xCSSxjQUFBLENBQU9DLEtBQVAsQ0FBYSw2Q0FBYjs7VUFDQTtRQUNIOztRQUNETCxlQUFlLENBQUNNLHNCQUFoQixDQUF1Q1QsSUFBdkM7TUFDSDtJQUNKLENBN0RxQjtFQUVyQjs7RUFFeUIsV0FBUkssUUFBUSxHQUFxQjtJQUMzQyxPQUFPdkIsZ0JBQWdCLENBQUM0QixnQkFBeEI7RUFDSDs7RUFFdUIsTUFBUkMsUUFBUSxDQUFDQyxPQUFELEVBQXVDLENBQzNEO0VBQ0g7O0FBcEI4RDs7OzhCQUF0RDlCLGdCLHNCQUNrQyxDQUFDLE1BQU07RUFDOUMsTUFBTXVCLFFBQVEsR0FBRyxJQUFJdkIsZ0JBQUosRUFBakI7RUFDQXVCLFFBQVEsQ0FBQ1EsS0FBVDtFQUNBLE9BQU9SLFFBQVA7QUFDSCxDQUowQyxHO0FBeUUvQ1MsTUFBTSxDQUFDQyxrQkFBUCxHQUE0QmpDLGdCQUFnQixDQUFDdUIsUUFBN0MifQ==