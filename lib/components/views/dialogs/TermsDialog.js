"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _react = _interopRequireDefault(require("react"));

var _serviceTypes = require("matrix-js-sdk/src/service-types");

var _languageHandler = require("../../../languageHandler");

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

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
class TermsCheckbox extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onChange", ev => {
      this.props.onChange(this.props.url, ev.currentTarget.checked);
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("input", {
      type: "checkbox",
      onChange: this.onChange,
      checked: this.props.checked
    });
  }

}

class TermsDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onNextClick", () => {
      this.props.onFinished(true, Object.keys(this.state.agreedUrls).filter(url => this.state.agreedUrls[url]));
    });
    (0, _defineProperty2.default)(this, "onTermsCheckboxChange", (url, checked) => {
      this.setState({
        agreedUrls: Object.assign({}, this.state.agreedUrls, {
          [url]: checked
        })
      });
    });
    this.state = {
      // url -> boolean
      agreedUrls: {}
    };

    for (const url of props.agreedUrls) {
      this.state.agreedUrls[url] = true;
    }
  }

  nameForServiceType(serviceType, host) {
    switch (serviceType) {
      case _serviceTypes.SERVICE_TYPES.IS:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Identity server"), /*#__PURE__*/_react.default.createElement("br", null), "(", host, ")");

      case _serviceTypes.SERVICE_TYPES.IM:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Integration manager"), /*#__PURE__*/_react.default.createElement("br", null), "(", host, ")");
    }
  }

  summaryForServiceType(serviceType) {
    switch (serviceType) {
      case _serviceTypes.SERVICE_TYPES.IS:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Find others by phone or email"), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Be found by phone or email"));

      case _serviceTypes.SERVICE_TYPES.IM:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Use bots, bridges, widgets and sticker packs"));
    }
  }

  render() {
    const rows = [];

    for (const policiesAndService of this.props.policiesAndServicePairs) {
      const parsedBaseUrl = _url.default.parse(policiesAndService.service.baseUrl);

      const policyValues = Object.values(policiesAndService.policies);

      for (let i = 0; i < policyValues.length; ++i) {
        const termDoc = policyValues[i];
        const termsLang = (0, _languageHandler.pickBestLanguage)(Object.keys(termDoc).filter(k => k !== 'version'));
        let serviceName;
        let summary;

        if (i === 0) {
          serviceName = this.nameForServiceType(policiesAndService.service.serviceType, parsedBaseUrl.host);
          summary = this.summaryForServiceType(policiesAndService.service.serviceType);
        }

        rows.push( /*#__PURE__*/_react.default.createElement("tr", {
          key: termDoc[termsLang].url
        }, /*#__PURE__*/_react.default.createElement("td", {
          className: "mx_TermsDialog_service"
        }, serviceName), /*#__PURE__*/_react.default.createElement("td", {
          className: "mx_TermsDialog_summary"
        }, summary), /*#__PURE__*/_react.default.createElement("td", null, termDoc[termsLang].name, /*#__PURE__*/_react.default.createElement("a", {
          rel: "noreferrer noopener",
          target: "_blank",
          href: termDoc[termsLang].url
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_TermsDialog_link"
        }))), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement(TermsCheckbox, {
          url: termDoc[termsLang].url,
          onChange: this.onTermsCheckboxChange,
          checked: Boolean(this.state.agreedUrls[termDoc[termsLang].url])
        }))));
      }
    } // if all the documents for at least one service have been checked, we can enable
    // the submit button


    let enableSubmit = false;

    for (const policiesAndService of this.props.policiesAndServicePairs) {
      let docsAgreedForService = 0;

      for (const terms of Object.values(policiesAndService.policies)) {
        let docAgreed = false;

        for (const lang of Object.keys(terms)) {
          if (lang === 'version') continue;

          if (this.state.agreedUrls[terms[lang].url]) {
            docAgreed = true;
            break;
          }
        }

        if (docAgreed) {
          ++docsAgreedForService;
        }
      }

      if (docsAgreedForService === Object.keys(policiesAndService.policies).length) {
        enableSubmit = true;
        break;
      }
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      fixedWidth: false,
      onFinished: this.onCancelClick,
      title: (0, _languageHandler._t)("Terms of Service"),
      contentId: "mx_Dialog_content",
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("To continue you need to accept the terms of this service.")), /*#__PURE__*/_react.default.createElement("table", {
      className: "mx_TermsDialog_termsTable"
    }, /*#__PURE__*/_react.default.createElement("tbody", null, /*#__PURE__*/_react.default.createElement("tr", {
      className: "mx_TermsDialog_termsTableHeader"
    }, /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Service")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Summary")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Document")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Accept"))), rows))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Next'),
      hasCancel: true,
      onCancel: this.onCancelClick,
      onPrimaryButtonClick: this.onNextClick,
      primaryDisabled: !enableSubmit
    }));
  }

}

exports.default = TermsDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXJtc0NoZWNrYm94IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiZXYiLCJwcm9wcyIsIm9uQ2hhbmdlIiwidXJsIiwiY3VycmVudFRhcmdldCIsImNoZWNrZWQiLCJyZW5kZXIiLCJUZXJtc0RpYWxvZyIsImNvbnN0cnVjdG9yIiwib25GaW5pc2hlZCIsIk9iamVjdCIsImtleXMiLCJzdGF0ZSIsImFncmVlZFVybHMiLCJmaWx0ZXIiLCJzZXRTdGF0ZSIsImFzc2lnbiIsIm5hbWVGb3JTZXJ2aWNlVHlwZSIsInNlcnZpY2VUeXBlIiwiaG9zdCIsIlNFUlZJQ0VfVFlQRVMiLCJJUyIsIl90IiwiSU0iLCJzdW1tYXJ5Rm9yU2VydmljZVR5cGUiLCJyb3dzIiwicG9saWNpZXNBbmRTZXJ2aWNlIiwicG9saWNpZXNBbmRTZXJ2aWNlUGFpcnMiLCJwYXJzZWRCYXNlVXJsIiwicGFyc2UiLCJzZXJ2aWNlIiwiYmFzZVVybCIsInBvbGljeVZhbHVlcyIsInZhbHVlcyIsInBvbGljaWVzIiwiaSIsImxlbmd0aCIsInRlcm1Eb2MiLCJ0ZXJtc0xhbmciLCJwaWNrQmVzdExhbmd1YWdlIiwiayIsInNlcnZpY2VOYW1lIiwic3VtbWFyeSIsInB1c2giLCJuYW1lIiwib25UZXJtc0NoZWNrYm94Q2hhbmdlIiwiQm9vbGVhbiIsImVuYWJsZVN1Ym1pdCIsImRvY3NBZ3JlZWRGb3JTZXJ2aWNlIiwidGVybXMiLCJkb2NBZ3JlZWQiLCJsYW5nIiwib25DYW5jZWxDbGljayIsIm9uTmV4dENsaWNrIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9UZXJtc0RpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFNFUlZJQ0VfVFlQRVMgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvc2VydmljZS10eXBlc1wiO1xuXG5pbXBvcnQgeyBfdCwgcGlja0Jlc3RMYW5ndWFnZSB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuXG5pbnRlcmZhY2UgSVRlcm1zQ2hlY2tib3hQcm9wcyB7XG4gICAgb25DaGFuZ2U6ICh1cmw6IHN0cmluZywgY2hlY2tlZDogYm9vbGVhbikgPT4gdm9pZDtcbiAgICB1cmw6IHN0cmluZztcbiAgICBjaGVja2VkOiBib29sZWFuO1xufVxuXG5jbGFzcyBUZXJtc0NoZWNrYm94IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJVGVybXNDaGVja2JveFByb3BzPiB7XG4gICAgcHJpdmF0ZSBvbkNoYW5nZSA9IChldjogUmVhY3QuRm9ybUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy51cmwsIGV2LmN1cnJlbnRUYXJnZXQuY2hlY2tlZCk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmNoZWNrZWR9XG4gICAgICAgIC8+O1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElUZXJtc0RpYWxvZ1Byb3BzIHtcbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBbU2VydmljZSwgcG9saWNpZXNdIHBhaXJzLCB3aGVyZSBwb2xpY2llcyBpcyB0aGUgcmVzcG9uc2UgZnJvbSB0aGVcbiAgICAgKiAvdGVybXMgZW5kcG9pbnQgZm9yIHRoYXQgc2VydmljZVxuICAgICAqL1xuICAgIHBvbGljaWVzQW5kU2VydmljZVBhaXJzOiBhbnlbXTtcblxuICAgIC8qKlxuICAgICAqIHVybHMgdGhhdCB0aGUgdXNlciBoYXMgYWxyZWFkeSBhZ3JlZWQgdG9cbiAgICAgKi9cbiAgICBhZ3JlZWRVcmxzPzogc3RyaW5nW107XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2l0aDpcbiAgICAgKiAgICAgKiBzdWNjZXNzIHtib29sfSBUcnVlIGlmIHRoZSB1c2VyIGFjY2VwdGVkIGFueSBkb3VtZW50cywgZmFsc2UgaWYgY2FuY2VsbGVkXG4gICAgICogICAgICogYWdyZWVkVXJscyB7c3RyaW5nW119IExpc3Qgb2YgYWdyZWVkIFVSTHNcbiAgICAgKi9cbiAgICBvbkZpbmlzaGVkOiAoc3VjY2VzczogYm9vbGVhbiwgYWdyZWVkVXJscz86IHN0cmluZ1tdKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBhZ3JlZWRVcmxzOiBhbnk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcm1zRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJVGVybXNEaWFsb2dQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gdXJsIC0+IGJvb2xlYW5cbiAgICAgICAgICAgIGFncmVlZFVybHM6IHt9LFxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IHVybCBvZiBwcm9wcy5hZ3JlZWRVcmxzKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmFncmVlZFVybHNbdXJsXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2FuY2VsQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25OZXh0Q2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlLCBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLmFncmVlZFVybHMpLmZpbHRlcigodXJsKSA9PiB0aGlzLnN0YXRlLmFncmVlZFVybHNbdXJsXSkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG5hbWVGb3JTZXJ2aWNlVHlwZShzZXJ2aWNlVHlwZTogU0VSVklDRV9UWVBFUywgaG9zdDogc3RyaW5nKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBzd2l0Y2ggKHNlcnZpY2VUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNFUlZJQ0VfVFlQRVMuSVM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXY+eyBfdChcIklkZW50aXR5IHNlcnZlclwiKSB9PGJyIC8+KHsgaG9zdCB9KTwvZGl2PjtcbiAgICAgICAgICAgIGNhc2UgU0VSVklDRV9UWVBFUy5JTTpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdj57IF90KFwiSW50ZWdyYXRpb24gbWFuYWdlclwiKSB9PGJyIC8+KHsgaG9zdCB9KTwvZGl2PjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3VtbWFyeUZvclNlcnZpY2VUeXBlKHNlcnZpY2VUeXBlOiBTRVJWSUNFX1RZUEVTKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBzd2l0Y2ggKHNlcnZpY2VUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNFUlZJQ0VfVFlQRVMuSVM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJGaW5kIG90aGVycyBieSBwaG9uZSBvciBlbWFpbFwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQmUgZm91bmQgYnkgcGhvbmUgb3IgZW1haWxcIikgfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIGNhc2UgU0VSVklDRV9UWVBFUy5JTTpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlVzZSBib3RzLCBicmlkZ2VzLCB3aWRnZXRzIGFuZCBzdGlja2VyIHBhY2tzXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVGVybXNDaGVja2JveENoYW5nZSA9ICh1cmw6IHN0cmluZywgY2hlY2tlZDogYm9vbGVhbikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFncmVlZFVybHM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuYWdyZWVkVXJscywgeyBbdXJsXTogY2hlY2tlZCB9KSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwb2xpY2llc0FuZFNlcnZpY2Ugb2YgdGhpcy5wcm9wcy5wb2xpY2llc0FuZFNlcnZpY2VQYWlycykge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkQmFzZVVybCA9IHVybC5wYXJzZShwb2xpY2llc0FuZFNlcnZpY2Uuc2VydmljZS5iYXNlVXJsKTtcblxuICAgICAgICAgICAgY29uc3QgcG9saWN5VmFsdWVzID0gT2JqZWN0LnZhbHVlcyhwb2xpY2llc0FuZFNlcnZpY2UucG9saWNpZXMpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2xpY3lWYWx1ZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXJtRG9jID0gcG9saWN5VmFsdWVzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1zTGFuZyA9IHBpY2tCZXN0TGFuZ3VhZ2UoT2JqZWN0LmtleXModGVybURvYykuZmlsdGVyKChrKSA9PiBrICE9PSAndmVyc2lvbicpKTtcbiAgICAgICAgICAgICAgICBsZXQgc2VydmljZU5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IHN1bW1hcnk7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZU5hbWUgPSB0aGlzLm5hbWVGb3JTZXJ2aWNlVHlwZShwb2xpY2llc0FuZFNlcnZpY2Uuc2VydmljZS5zZXJ2aWNlVHlwZSwgcGFyc2VkQmFzZVVybC5ob3N0KTtcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeSA9IHRoaXMuc3VtbWFyeUZvclNlcnZpY2VUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9saWNpZXNBbmRTZXJ2aWNlLnNlcnZpY2Uuc2VydmljZVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKDx0ciBrZXk9e3Rlcm1Eb2NbdGVybXNMYW5nXS51cmx9PlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwibXhfVGVybXNEaWFsb2dfc2VydmljZVwiPnsgc2VydmljZU5hbWUgfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJteF9UZXJtc0RpYWxvZ19zdW1tYXJ5XCI+eyBzdW1tYXJ5IH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRlcm1Eb2NbdGVybXNMYW5nXS5uYW1lIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPXt0ZXJtRG9jW3Rlcm1zTGFuZ10udXJsfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9UZXJtc0RpYWxvZ19saW5rXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPjxUZXJtc0NoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw9e3Rlcm1Eb2NbdGVybXNMYW5nXS51cmx9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblRlcm1zQ2hlY2tib3hDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtCb29sZWFuKHRoaXMuc3RhdGUuYWdyZWVkVXJsc1t0ZXJtRG9jW3Rlcm1zTGFuZ10udXJsXSl9XG4gICAgICAgICAgICAgICAgICAgIC8+PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBhbGwgdGhlIGRvY3VtZW50cyBmb3IgYXQgbGVhc3Qgb25lIHNlcnZpY2UgaGF2ZSBiZWVuIGNoZWNrZWQsIHdlIGNhbiBlbmFibGVcbiAgICAgICAgLy8gdGhlIHN1Ym1pdCBidXR0b25cbiAgICAgICAgbGV0IGVuYWJsZVN1Ym1pdCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IHBvbGljaWVzQW5kU2VydmljZSBvZiB0aGlzLnByb3BzLnBvbGljaWVzQW5kU2VydmljZVBhaXJzKSB7XG4gICAgICAgICAgICBsZXQgZG9jc0FncmVlZEZvclNlcnZpY2UgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0ZXJtcyBvZiBPYmplY3QudmFsdWVzKHBvbGljaWVzQW5kU2VydmljZS5wb2xpY2llcykpIHtcbiAgICAgICAgICAgICAgICBsZXQgZG9jQWdyZWVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBsYW5nIG9mIE9iamVjdC5rZXlzKHRlcm1zKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFuZyA9PT0gJ3ZlcnNpb24nKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWdyZWVkVXJsc1t0ZXJtc1tsYW5nXS51cmxdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2NBZ3JlZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRvY0FncmVlZCkge1xuICAgICAgICAgICAgICAgICAgICArK2RvY3NBZ3JlZWRGb3JTZXJ2aWNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2NzQWdyZWVkRm9yU2VydmljZSA9PT0gT2JqZWN0LmtleXMocG9saWNpZXNBbmRTZXJ2aWNlLnBvbGljaWVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBlbmFibGVTdWJtaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgZml4ZWRXaWR0aD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlRlcm1zIG9mIFNlcnZpY2VcIil9XG4gICAgICAgICAgICAgICAgY29udGVudElkPSdteF9EaWFsb2dfY29udGVudCdcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIlRvIGNvbnRpbnVlIHlvdSBuZWVkIHRvIGFjY2VwdCB0aGUgdGVybXMgb2YgdGhpcyBzZXJ2aWNlLlwiKSB9PC9wPlxuXG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJteF9UZXJtc0RpYWxvZ190ZXJtc1RhYmxlXCI+PHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIm14X1Rlcm1zRGlhbG9nX3Rlcm1zVGFibGVIZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+eyBfdChcIlNlcnZpY2VcIikgfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPnsgX3QoXCJTdW1tYXJ5XCIpIH08L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD57IF90KFwiRG9jdW1lbnRcIikgfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPnsgX3QoXCJBY2NlcHRcIikgfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyByb3dzIH1cbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT48L3RhYmxlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ05leHQnKX1cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbk5leHRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXshZW5hYmxlU3VibWl0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUF0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZ0JBLE1BQU1BLGFBQU4sU0FBNEJDLGNBQUEsQ0FBTUMsYUFBbEMsQ0FBcUU7RUFBQTtJQUFBO0lBQUEsZ0RBQzdDQyxFQUFELElBQWlEO01BQ2hFLEtBQUtDLEtBQUwsQ0FBV0MsUUFBWCxDQUFvQixLQUFLRCxLQUFMLENBQVdFLEdBQS9CLEVBQW9DSCxFQUFFLENBQUNJLGFBQUgsQ0FBaUJDLE9BQXJEO0lBQ0gsQ0FIZ0U7RUFBQTs7RUFLakVDLE1BQU0sR0FBRztJQUNMLG9CQUFPO01BQU8sSUFBSSxFQUFDLFVBQVo7TUFDSCxRQUFRLEVBQUUsS0FBS0osUUFEWjtNQUVILE9BQU8sRUFBRSxLQUFLRCxLQUFMLENBQVdJO0lB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