"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withValidation;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

/*
Copyright 2019 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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

/* eslint-disable @typescript-eslint/no-invalid-this */

/**
 * Creates a validation function from a set of rules describing what to validate.
 * Generic T is the "this" type passed to the rule methods
 *
 * @param {Function} description
 *     Function that returns a string summary of the kind of value that will
 *     meet the validation rules. Shown at the top of the validation feedback.
 * @param {Boolean} hideDescriptionIfValid
 *     If true, don't show the description if the validation passes validation.
 * @param {Function} deriveData
 *     Optional function that returns a Promise to an object of generic type D.
 *     The result of this Promise is passed to rule methods `skip`, `test`, `valid`, and `invalid`.
 *     Useful for doing calculations per-value update once rather than in each of the above rule methods.
 * @param {Object} rules
 *     An array of rules describing how to check to input value. Each rule in an object
 *     and may have the following properties:
 *     - `key`: A unique ID for the rule. Required.
 *     - `skip`: A function used to determine whether the rule should even be evaluated.
 *     - `test`: A function used to determine the rule's current validity. Required.
 *     - `valid`: Function returning text to show when the rule is valid. Only shown if set.
 *     - `invalid`: Function returning text to show when the rule is invalid. Only shown if set.
 *     - `final`: A Boolean if true states that this rule will only be considered if all rules before it returned valid.
 * @returns {Function}
 *     A validation function that takes in the current input value and returns
 *     the overall validity and a feedback UI that can be rendered for more detail.
 */
function withValidation(_ref) {
  let {
    description,
    hideDescriptionIfValid,
    deriveData,
    rules
  } = _ref;
  return async function onValidate(_ref2) {
    let {
      value,
      focused,
      allowEmpty = true
    } = _ref2;

    if (!value && allowEmpty) {
      return {
        valid: null,
        feedback: null
      };
    }

    const data = {
      value,
      allowEmpty
    };
    const derivedData = deriveData ? await deriveData.call(this, data) : undefined;
    const results = [];
    let valid = true;

    if (rules && rules.length) {
      for (const rule of rules) {
        if (!rule.key || !rule.test) {
          continue;
        }

        if (!valid && rule.final) {
          continue;
        }

        if (rule.skip?.call(this, data, derivedData)) {
          continue;
        } // We're setting `this` to whichever component holds the validation
        // function. That allows rules to access the state of the component.


        const ruleValid = await rule.test.call(this, data, derivedData);
        valid = valid && ruleValid;

        if (ruleValid && rule.valid) {
          // If the rule's result is valid and has text to show for
          // the valid state, show it.
          const text = rule.valid.call(this, derivedData);

          if (!text) {
            continue;
          }

          results.push({
            key: rule.key,
            valid: true,
            text
          });
        } else if (!ruleValid && rule.invalid) {
          // If the rule's result is invalid and has text to show for
          // the invalid state, show it.
          const text = rule.invalid.call(this, derivedData);

          if (!text) {
            continue;
          }

          results.push({
            key: rule.key,
            valid: false,
            text
          });
        }
      }
    } // Hide feedback when not focused


    if (!focused) {
      return {
        valid,
        feedback: null
      };
    }

    let details;

    if (results && results.length) {
      details = /*#__PURE__*/_react.default.createElement("ul", {
        className: "mx_Validation_details"
      }, results.map(result => {
        const classes = (0, _classnames.default)({
          "mx_Validation_detail": true,
          "mx_Validation_valid": result.valid,
          "mx_Validation_invalid": !result.valid
        });
        return /*#__PURE__*/_react.default.createElement("li", {
          key: result.key,
          className: classes
        }, result.text);
      }));
    }

    let summary;

    if (description && (details || !hideDescriptionIfValid)) {
      // We're setting `this` to whichever component holds the validation
      // function. That allows rules to access the state of the component.
      const content = description.call(this, derivedData, results);
      summary = content ? /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Validation_description"
      }, content) : undefined;
    }

    let feedback;

    if (summary || details) {
      feedback = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Validation"
      }, summary, details);
    }

    return {
      valid,
      feedback
    };
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3aXRoVmFsaWRhdGlvbiIsImRlc2NyaXB0aW9uIiwiaGlkZURlc2NyaXB0aW9uSWZWYWxpZCIsImRlcml2ZURhdGEiLCJydWxlcyIsIm9uVmFsaWRhdGUiLCJ2YWx1ZSIsImZvY3VzZWQiLCJhbGxvd0VtcHR5IiwidmFsaWQiLCJmZWVkYmFjayIsImRhdGEiLCJkZXJpdmVkRGF0YSIsImNhbGwiLCJ1bmRlZmluZWQiLCJyZXN1bHRzIiwibGVuZ3RoIiwicnVsZSIsImtleSIsInRlc3QiLCJmaW5hbCIsInNraXAiLCJydWxlVmFsaWQiLCJ0ZXh0IiwicHVzaCIsImludmFsaWQiLCJkZXRhaWxzIiwibWFwIiwicmVzdWx0IiwiY2xhc3NlcyIsImNsYXNzTmFtZXMiLCJzdW1tYXJ5IiwiY29udGVudCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1ZhbGlkYXRpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8taW52YWxpZC10aGlzICovXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG50eXBlIERhdGEgPSBQaWNrPElGaWVsZFN0YXRlLCBcInZhbHVlXCIgfCBcImFsbG93RW1wdHlcIj47XG5cbmludGVyZmFjZSBJUmVzdWx0IHtcbiAgICBrZXk6IHN0cmluZztcbiAgICB2YWxpZDogYm9vbGVhbjtcbiAgICB0ZXh0OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJUnVsZTxULCBEID0gdm9pZD4ge1xuICAgIGtleTogc3RyaW5nO1xuICAgIGZpbmFsPzogYm9vbGVhbjtcbiAgICBza2lwPyh0aGlzOiBULCBkYXRhOiBEYXRhLCBkZXJpdmVkRGF0YTogRCk6IGJvb2xlYW47XG4gICAgdGVzdCh0aGlzOiBULCBkYXRhOiBEYXRhLCBkZXJpdmVkRGF0YTogRCk6IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+O1xuICAgIHZhbGlkPyh0aGlzOiBULCBkZXJpdmVkRGF0YTogRCk6IHN0cmluZztcbiAgICBpbnZhbGlkPyh0aGlzOiBULCBkZXJpdmVkRGF0YTogRCk6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElBcmdzPFQsIEQgPSB2b2lkPiB7XG4gICAgcnVsZXM6IElSdWxlPFQsIEQ+W107XG4gICAgZGVzY3JpcHRpb24/KHRoaXM6IFQsIGRlcml2ZWREYXRhOiBELCByZXN1bHRzOiBJUmVzdWx0W10pOiBSZWFjdC5SZWFjdENoaWxkO1xuICAgIGhpZGVEZXNjcmlwdGlvbklmVmFsaWQ/OiBib29sZWFuO1xuICAgIGRlcml2ZURhdGE/KGRhdGE6IERhdGEpOiBQcm9taXNlPEQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElGaWVsZFN0YXRlIHtcbiAgICB2YWx1ZTogc3RyaW5nO1xuICAgIGZvY3VzZWQ6IGJvb2xlYW47XG4gICAgYWxsb3dFbXB0eTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgdmFsaWQ/OiBib29sZWFuO1xuICAgIGZlZWRiYWNrPzogUmVhY3QuUmVhY3RDaGlsZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdmFsaWRhdGlvbiBmdW5jdGlvbiBmcm9tIGEgc2V0IG9mIHJ1bGVzIGRlc2NyaWJpbmcgd2hhdCB0byB2YWxpZGF0ZS5cbiAqIEdlbmVyaWMgVCBpcyB0aGUgXCJ0aGlzXCIgdHlwZSBwYXNzZWQgdG8gdGhlIHJ1bGUgbWV0aG9kc1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRlc2NyaXB0aW9uXG4gKiAgICAgRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RyaW5nIHN1bW1hcnkgb2YgdGhlIGtpbmQgb2YgdmFsdWUgdGhhdCB3aWxsXG4gKiAgICAgbWVldCB0aGUgdmFsaWRhdGlvbiBydWxlcy4gU2hvd24gYXQgdGhlIHRvcCBvZiB0aGUgdmFsaWRhdGlvbiBmZWVkYmFjay5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaGlkZURlc2NyaXB0aW9uSWZWYWxpZFxuICogICAgIElmIHRydWUsIGRvbid0IHNob3cgdGhlIGRlc2NyaXB0aW9uIGlmIHRoZSB2YWxpZGF0aW9uIHBhc3NlcyB2YWxpZGF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZGVyaXZlRGF0YVxuICogICAgIE9wdGlvbmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgdG8gYW4gb2JqZWN0IG9mIGdlbmVyaWMgdHlwZSBELlxuICogICAgIFRoZSByZXN1bHQgb2YgdGhpcyBQcm9taXNlIGlzIHBhc3NlZCB0byBydWxlIG1ldGhvZHMgYHNraXBgLCBgdGVzdGAsIGB2YWxpZGAsIGFuZCBgaW52YWxpZGAuXG4gKiAgICAgVXNlZnVsIGZvciBkb2luZyBjYWxjdWxhdGlvbnMgcGVyLXZhbHVlIHVwZGF0ZSBvbmNlIHJhdGhlciB0aGFuIGluIGVhY2ggb2YgdGhlIGFib3ZlIHJ1bGUgbWV0aG9kcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBydWxlc1xuICogICAgIEFuIGFycmF5IG9mIHJ1bGVzIGRlc2NyaWJpbmcgaG93IHRvIGNoZWNrIHRvIGlucHV0IHZhbHVlLiBFYWNoIHJ1bGUgaW4gYW4gb2JqZWN0XG4gKiAgICAgYW5kIG1heSBoYXZlIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqICAgICAtIGBrZXlgOiBBIHVuaXF1ZSBJRCBmb3IgdGhlIHJ1bGUuIFJlcXVpcmVkLlxuICogICAgIC0gYHNraXBgOiBBIGZ1bmN0aW9uIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIHJ1bGUgc2hvdWxkIGV2ZW4gYmUgZXZhbHVhdGVkLlxuICogICAgIC0gYHRlc3RgOiBBIGZ1bmN0aW9uIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBydWxlJ3MgY3VycmVudCB2YWxpZGl0eS4gUmVxdWlyZWQuXG4gKiAgICAgLSBgdmFsaWRgOiBGdW5jdGlvbiByZXR1cm5pbmcgdGV4dCB0byBzaG93IHdoZW4gdGhlIHJ1bGUgaXMgdmFsaWQuIE9ubHkgc2hvd24gaWYgc2V0LlxuICogICAgIC0gYGludmFsaWRgOiBGdW5jdGlvbiByZXR1cm5pbmcgdGV4dCB0byBzaG93IHdoZW4gdGhlIHJ1bGUgaXMgaW52YWxpZC4gT25seSBzaG93biBpZiBzZXQuXG4gKiAgICAgLSBgZmluYWxgOiBBIEJvb2xlYW4gaWYgdHJ1ZSBzdGF0ZXMgdGhhdCB0aGlzIHJ1bGUgd2lsbCBvbmx5IGJlIGNvbnNpZGVyZWQgaWYgYWxsIHJ1bGVzIGJlZm9yZSBpdCByZXR1cm5lZCB2YWxpZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqICAgICBBIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhhdCB0YWtlcyBpbiB0aGUgY3VycmVudCBpbnB1dCB2YWx1ZSBhbmQgcmV0dXJuc1xuICogICAgIHRoZSBvdmVyYWxsIHZhbGlkaXR5IGFuZCBhIGZlZWRiYWNrIFVJIHRoYXQgY2FuIGJlIHJlbmRlcmVkIGZvciBtb3JlIGRldGFpbC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd2l0aFZhbGlkYXRpb248VCA9IHVuZGVmaW5lZCwgRCA9IHZvaWQ+KHtcbiAgICBkZXNjcmlwdGlvbiwgaGlkZURlc2NyaXB0aW9uSWZWYWxpZCwgZGVyaXZlRGF0YSwgcnVsZXMsXG59OiBJQXJnczxULCBEPikge1xuICAgIHJldHVybiBhc3luYyBmdW5jdGlvbiBvblZhbGlkYXRlKHsgdmFsdWUsIGZvY3VzZWQsIGFsbG93RW1wdHkgPSB0cnVlIH06IElGaWVsZFN0YXRlKTogUHJvbWlzZTxJVmFsaWRhdGlvblJlc3VsdD4ge1xuICAgICAgICBpZiAoIXZhbHVlICYmIGFsbG93RW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsaWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgZmVlZGJhY2s6IG51bGwsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IHsgdmFsdWUsIGFsbG93RW1wdHkgfTtcbiAgICAgICAgY29uc3QgZGVyaXZlZERhdGE6IEQgfCB1bmRlZmluZWQgPSBkZXJpdmVEYXRhID8gYXdhaXQgZGVyaXZlRGF0YS5jYWxsKHRoaXMsIGRhdGEpIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IElSZXN1bHRbXSA9IFtdO1xuICAgICAgICBsZXQgdmFsaWQgPSB0cnVlO1xuICAgICAgICBpZiAocnVsZXMgJiYgcnVsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgcnVsZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJ1bGUua2V5IHx8ICFydWxlLnRlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZCAmJiBydWxlLmZpbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChydWxlLnNraXA/LmNhbGwodGhpcywgZGF0YSwgZGVyaXZlZERhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIHNldHRpbmcgYHRoaXNgIHRvIHdoaWNoZXZlciBjb21wb25lbnQgaG9sZHMgdGhlIHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbi4gVGhhdCBhbGxvd3MgcnVsZXMgdG8gYWNjZXNzIHRoZSBzdGF0ZSBvZiB0aGUgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bGVWYWxpZDogYm9vbGVhbiA9IGF3YWl0IHJ1bGUudGVzdC5jYWxsKHRoaXMsIGRhdGEsIGRlcml2ZWREYXRhKTtcbiAgICAgICAgICAgICAgICB2YWxpZCA9IHZhbGlkICYmIHJ1bGVWYWxpZDtcbiAgICAgICAgICAgICAgICBpZiAocnVsZVZhbGlkICYmIHJ1bGUudmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJ1bGUncyByZXN1bHQgaXMgdmFsaWQgYW5kIGhhcyB0ZXh0IHRvIHNob3cgZm9yXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSB2YWxpZCBzdGF0ZSwgc2hvdyBpdC5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHJ1bGUudmFsaWQuY2FsbCh0aGlzLCBkZXJpdmVkRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogcnVsZS5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXJ1bGVWYWxpZCAmJiBydWxlLmludmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJ1bGUncyByZXN1bHQgaXMgaW52YWxpZCBhbmQgaGFzIHRleHQgdG8gc2hvdyBmb3JcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGludmFsaWQgc3RhdGUsIHNob3cgaXQuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBydWxlLmludmFsaWQuY2FsbCh0aGlzLCBkZXJpdmVkRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogcnVsZS5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIaWRlIGZlZWRiYWNrIHdoZW4gbm90IGZvY3VzZWRcbiAgICAgICAgaWYgKCFmb2N1c2VkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZhbGlkLFxuICAgICAgICAgICAgICAgIGZlZWRiYWNrOiBudWxsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZXRhaWxzO1xuICAgICAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgZGV0YWlscyA9IDx1bCBjbGFzc05hbWU9XCJteF9WYWxpZGF0aW9uX2RldGFpbHNcIj5cbiAgICAgICAgICAgICAgICB7IHJlc3VsdHMubWFwKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibXhfVmFsaWRhdGlvbl9kZXRhaWxcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibXhfVmFsaWRhdGlvbl92YWxpZFwiOiByZXN1bHQudmFsaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm14X1ZhbGlkYXRpb25faW52YWxpZFwiOiAhcmVzdWx0LnZhbGlkLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxsaSBrZXk9e3Jlc3VsdC5rZXl9IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdC50ZXh0IH1cbiAgICAgICAgICAgICAgICAgICAgPC9saT47XG4gICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgPC91bD47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3VtbWFyeTtcbiAgICAgICAgaWYgKGRlc2NyaXB0aW9uICYmIChkZXRhaWxzIHx8ICFoaWRlRGVzY3JpcHRpb25JZlZhbGlkKSkge1xuICAgICAgICAgICAgLy8gV2UncmUgc2V0dGluZyBgdGhpc2AgdG8gd2hpY2hldmVyIGNvbXBvbmVudCBob2xkcyB0aGUgdmFsaWRhdGlvblxuICAgICAgICAgICAgLy8gZnVuY3Rpb24uIFRoYXQgYWxsb3dzIHJ1bGVzIHRvIGFjY2VzcyB0aGUgc3RhdGUgb2YgdGhlIGNvbXBvbmVudC5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkZXNjcmlwdGlvbi5jYWxsKHRoaXMsIGRlcml2ZWREYXRhLCByZXN1bHRzKTtcbiAgICAgICAgICAgIHN1bW1hcnkgPSBjb250ZW50ID8gPGRpdiBjbGFzc05hbWU9XCJteF9WYWxpZGF0aW9uX2Rlc2NyaXB0aW9uXCI+eyBjb250ZW50IH08L2Rpdj4gOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZmVlZGJhY2s7XG4gICAgICAgIGlmIChzdW1tYXJ5IHx8IGRldGFpbHMpIHtcbiAgICAgICAgICAgIGZlZWRiYWNrID0gPGRpdiBjbGFzc05hbWU9XCJteF9WYWxpZGF0aW9uXCI+XG4gICAgICAgICAgICAgICAgeyBzdW1tYXJ5IH1cbiAgICAgICAgICAgICAgICB7IGRldGFpbHMgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbGlkLFxuICAgICAgICAgICAgZmVlZGJhY2ssXG4gICAgICAgIH07XG4gICAgfTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUF1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNlLFNBQVNBLGNBQVQsT0FFQztFQUFBLElBRmdEO0lBQzVEQyxXQUQ0RDtJQUMvQ0Msc0JBRCtDO0lBQ3ZCQyxVQUR1QjtJQUNYQztFQURXLENBRWhEO0VBQ1osT0FBTyxlQUFlQyxVQUFmLFFBQTBHO0lBQUEsSUFBaEY7TUFBRUMsS0FBRjtNQUFTQyxPQUFUO01BQWtCQyxVQUFVLEdBQUc7SUFBL0IsQ0FBZ0Y7O0lBQzdHLElBQUksQ0FBQ0YsS0FBRCxJQUFVRSxVQUFkLEVBQTBCO01BQ3RCLE9BQU87UUFDSEMsS0FBSyxFQUFFLElBREo7UUFFSEMsUUFBUSxFQUFFO01BRlAsQ0FBUDtJQUlIOztJQUVELE1BQU1DLElBQUksR0FBRztNQUFFTCxLQUFGO01BQVNFO0lBQVQsQ0FBYjtJQUNBLE1BQU1JLFdBQTBCLEdBQUdULFVBQVUsR0FBRyxNQUFNQSxVQUFVLENBQUNVLElBQVgsQ0FBZ0IsSUFBaEIsRUFBc0JGLElBQXRCLENBQVQsR0FBdUNHLFNBQXBGO0lBRUEsTUFBTUMsT0FBa0IsR0FBRyxFQUEzQjtJQUNBLElBQUlOLEtBQUssR0FBRyxJQUFaOztJQUNBLElBQUlMLEtBQUssSUFBSUEsS0FBSyxDQUFDWSxNQUFuQixFQUEyQjtNQUN2QixLQUFLLE1BQU1DLElBQVgsSUFBbUJiLEtBQW5CLEVBQTBCO1FBQ3RCLElBQUksQ0FBQ2EsSUFBSSxDQUFDQyxHQUFOLElBQWEsQ0FBQ0QsSUFBSSxDQUFDRSxJQUF2QixFQUE2QjtVQUN6QjtRQUNIOztRQUVELElBQUksQ0FBQ1YsS0FBRCxJQUFVUSxJQUFJLENBQUNHLEtBQW5CLEVBQTBCO1VBQ3RCO1FBQ0g7O1FBRUQsSUFBSUgsSUFBSSxDQUFDSSxJQUFMLEVBQVdSLElBQVgsQ0FBZ0IsSUFBaEIsRUFBc0JGLElBQXRCLEVBQTRCQyxXQUE1QixDQUFKLEVBQThDO1VBQzFDO1FBQ0gsQ0FYcUIsQ0FhdEI7UUFDQTs7O1FBQ0EsTUFBTVUsU0FBa0IsR0FBRyxNQUFNTCxJQUFJLENBQUNFLElBQUwsQ0FBVU4sSUFBVixDQUFlLElBQWYsRUFBcUJGLElBQXJCLEVBQTJCQyxXQUEzQixDQUFqQztRQUNBSCxLQUFLLEdBQUdBLEtBQUssSUFBSWEsU0FBakI7O1FBQ0EsSUFBSUEsU0FBUyxJQUFJTCxJQUFJLENBQUNSLEtBQXRCLEVBQTZCO1VBQ3pCO1VBQ0E7VUFDQSxNQUFNYyxJQUFJLEdBQUdOLElBQUksQ0FBQ1IsS0FBTCxDQUFXSSxJQUFYLENBQWdCLElBQWhCLEVBQXNCRCxXQUF0QixDQUFiOztVQUNBLElBQUksQ0FBQ1csSUFBTCxFQUFXO1lBQ1A7VUFDSDs7VUFDRFIsT0FBTyxDQUFDUyxJQUFSLENBQWE7WUFDVE4sR0FBRyxFQUFFRCxJQUFJLENBQUNDLEdBREQ7WUFFVFQsS0FBSyxFQUFFLElBRkU7WUFHVGM7VUFIUyxDQUFiO1FBS0gsQ0FaRCxNQVlPLElBQUksQ0FBQ0QsU0FBRCxJQUFjTCxJQUFJLENBQUNRLE9BQXZCLEVBQWdDO1VBQ25DO1VBQ0E7VUFDQSxNQUFNRixJQUFJLEdBQUdOLElBQUksQ0FBQ1EsT0FBTCxDQUFhWixJQUFiLENBQWtCLElBQWxCLEVBQXdCRCxXQUF4QixDQUFiOztVQUNBLElBQUksQ0FBQ1csSUFBTCxFQUFXO1lBQ1A7VUFDSDs7VUFDRFIsT0FBTyxDQUFDUyxJQUFSLENBQWE7WUFDVE4sR0FBRyxFQUFFRCxJQUFJLENBQUNDLEdBREQ7WUFFVFQsS0FBSyxFQUFFLEtBRkU7WUFHVGM7VUFIUyxDQUFiO1FBS0g7TUFDSjtJQUNKLENBekQ0RyxDQTJEN0c7OztJQUNBLElBQUksQ0FBQ2hCLE9BQUwsRUFBYztNQUNWLE9BQU87UUFDSEUsS0FERztRQUVIQyxRQUFRLEVBQUU7TUFGUCxDQUFQO0lBSUg7O0lBRUQsSUFBSWdCLE9BQUo7O0lBQ0EsSUFBSVgsT0FBTyxJQUFJQSxPQUFPLENBQUNDLE1BQXZCLEVBQStCO01BQzNCVSxPQUFPLGdCQUFHO1FBQUksU0FBUyxFQUFDO01BQWQsR0FDSlgsT0FBTyxDQUFDWSxHQUFSLENBQVlDLE1BQU0sSUFBSTtRQUNwQixNQUFNQyxPQUFPLEdBQUcsSUFBQUMsbUJBQUEsRUFBVztVQUN2Qix3QkFBd0IsSUFERDtVQUV2Qix1QkFBdUJGLE1BQU0sQ0FBQ25CLEtBRlA7VUFHdkIseUJBQXlCLENBQUNtQixNQUFNLENBQUNuQjtRQUhWLENBQVgsQ0FBaEI7UUFLQSxvQkFBTztVQUFJLEdBQUcsRUFBRW1CLE1BQU0sQ0FBQ1YsR0FBaEI7VUFBcUIsU0FBUyxFQUFFVztRQUFoQyxHQUNERCxNQUFNLENBQUNMLElBRE4sQ0FBUDtNQUdILENBVEMsQ0FESSxDQUFWO0lBWUg7O0lBRUQsSUFBSVEsT0FBSjs7SUFDQSxJQUFJOUIsV0FBVyxLQUFLeUIsT0FBTyxJQUFJLENBQUN4QixzQkFBakIsQ0FBZixFQUF5RDtNQUNyRDtNQUNBO01BQ0EsTUFBTThCLE9BQU8sR0FBRy9CLFdBQVcsQ0FBQ1ksSUFBWixDQUFpQixJQUFqQixFQUF1QkQsV0FBdkIsRUFBb0NHLE9BQXBDLENBQWhCO01BQ0FnQixPQUFPLEdBQUdDLE9BQU8sZ0JBQUc7UUFBSyxTQUFTLEVBQUM7TUFBZixHQUE2Q0EsT0FBN0MsQ0FBSCxHQUFrRWxCLFNBQW5GO0lBQ0g7O0lBRUQsSUFBSUosUUFBSjs7SUFDQSxJQUFJcUIsT0FBTyxJQUFJTCxPQUFmLEVBQXdCO01BQ3BCaEIsUUFBUSxnQkFBRztRQUFLLFNBQVMsRUFBQztNQUFmLEdBQ0xxQixPQURLLEVBRUxMLE9BRkssQ0FBWDtJQUlIOztJQUVELE9BQU87TUFDSGpCLEtBREc7TUFFSEM7SUFGRyxDQUFQO0VBSUgsQ0F2R0Q7QUF3R0gifQ==