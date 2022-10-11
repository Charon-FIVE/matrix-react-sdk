"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _utils = require("matrix-js-sdk/src/utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Simple search matcher that matches any results with the query string anywhere
 * in the search string. Returns matches in the order the query string appears
 * in the search key, earliest first, then in the order the search key appears
 * in the provided array of keys, then in the order the items appeared in the
 * source array.
 *
 * @param {Object[]} objects Initial list of objects. Equivalent to calling
 *     setObjects() after construction
 * @param {Object} options Options object
 * @param {string[]} options.keys List of keys to use as indexes on the objects
 * @param {function[]} options.funcs List of functions that when called with the
 *     object as an arg will return a string to use as an index
 */
class QueryMatcher {
  constructor(objects) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      keys: []
    };
    (0, _defineProperty2.default)(this, "_options", void 0);
    (0, _defineProperty2.default)(this, "_items", void 0);
    this._options = options;
    this.setObjects(objects); // By default, we remove any non-alphanumeric characters ([^A-Za-z0-9_]) from the
    // query and the value being queried before matching

    if (this._options.shouldMatchWordsOnly === undefined) {
      this._options.shouldMatchWordsOnly = true;
    }
  }

  setObjects(objects) {
    this._items = new Map();

    for (const object of objects) {
      // Need to use unsafe coerce here because the objects can have any
      // type for their values. We assume that those values who's keys have
      // been specified will be string. Also, we cannot infer all the
      // types of the keys of the objects at compile.
      const keyValues = (0, _lodash.at)(object, this._options.keys);

      if (this._options.funcs) {
        for (const f of this._options.funcs) {
          const v = f(object);

          if (Array.isArray(v)) {
            keyValues.push(...v);
          } else {
            keyValues.push(v);
          }
        }
      }

      for (const [index, keyValue] of Object.entries(keyValues)) {
        if (!keyValue) continue; // skip falsy keyValues

        const key = this.processQuery(keyValue);

        if (!this._items.has(key)) {
          this._items.set(key, []);
        }

        this._items.get(key).push({
          keyWeight: Number(index),
          object
        });
      }
    }
  }

  match(query) {
    let limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
    query = this.processQuery(query);

    if (this._options.shouldMatchWordsOnly) {
      query = query.replace(/[^\w]/g, '');
    }

    if (query.length === 0) {
      return [];
    }

    const matches = []; // Iterate through the map & check each key.
    // ES6 Map iteration order is defined to be insertion order, so results
    // here will come out in the order they were put in.

    for (const [key, candidates] of this._items.entries()) {
      let resultKey = key;

      if (this._options.shouldMatchWordsOnly) {
        resultKey = resultKey.replace(/[^\w]/g, '');
      }

      const index = resultKey.indexOf(query);

      if (index !== -1) {
        matches.push(...candidates.map(candidate => _objectSpread({
          index
        }, candidate)));
      }
    } // Sort matches by where the query appeared in the search key, then by
    // where the matched key appeared in the provided array of keys.


    matches.sort((a, b) => {
      if (a.index < b.index) {
        return -1;
      } else if (a.index === b.index) {
        if (a.keyWeight < b.keyWeight) {
          return -1;
        } else if (a.keyWeight === b.keyWeight) {
          return 0;
        }
      }

      return 1;
    }); // Now map the keys to the result objects. Also remove any duplicates.

    const dedupped = (0, _lodash.uniq)(matches.map(match => match.object));
    const maxLength = limit === -1 ? dedupped.length : limit;
    return dedupped.slice(0, maxLength);
  }

  processQuery(query) {
    if (this._options.fuzzy !== false) {
      // lower case both the input and the output for consistency
      return (0, _utils.removeHiddenChars)(query.toLowerCase()).toLowerCase();
    }

    return query.toLowerCase();
  }

}

exports.default = QueryMatcher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRdWVyeU1hdGNoZXIiLCJjb25zdHJ1Y3RvciIsIm9iamVjdHMiLCJvcHRpb25zIiwia2V5cyIsIl9vcHRpb25zIiwic2V0T2JqZWN0cyIsInNob3VsZE1hdGNoV29yZHNPbmx5IiwidW5kZWZpbmVkIiwiX2l0ZW1zIiwiTWFwIiwib2JqZWN0Iiwia2V5VmFsdWVzIiwiYXQiLCJmdW5jcyIsImYiLCJ2IiwiQXJyYXkiLCJpc0FycmF5IiwicHVzaCIsImluZGV4Iiwia2V5VmFsdWUiLCJPYmplY3QiLCJlbnRyaWVzIiwia2V5IiwicHJvY2Vzc1F1ZXJ5IiwiaGFzIiwic2V0IiwiZ2V0Iiwia2V5V2VpZ2h0IiwiTnVtYmVyIiwibWF0Y2giLCJxdWVyeSIsImxpbWl0IiwicmVwbGFjZSIsImxlbmd0aCIsIm1hdGNoZXMiLCJjYW5kaWRhdGVzIiwicmVzdWx0S2V5IiwiaW5kZXhPZiIsIm1hcCIsImNhbmRpZGF0ZSIsInNvcnQiLCJhIiwiYiIsImRlZHVwcGVkIiwidW5pcSIsIm1heExlbmd0aCIsInNsaWNlIiwiZnV6enkiLCJyZW1vdmVIaWRkZW5DaGFycyIsInRvTG93ZXJDYXNlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F1dG9jb21wbGV0ZS9RdWVyeU1hdGNoZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IEF2aXJhbCBEYXNndXB0YVxuQ29weXJpZ2h0IDIwMTggTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGF0LCB1bmlxIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHJlbW92ZUhpZGRlbkNoYXJzIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5cbmltcG9ydCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gJy4uL2NvbnRleHRzL1Jvb21Db250ZXh0JztcbmltcG9ydCB7IExlYXZlcyB9IGZyb20gXCIuLi9AdHlwZXMvY29tbW9uXCI7XG5cbmludGVyZmFjZSBJT3B0aW9uczxUIGV4dGVuZHMge30+IHtcbiAgICBrZXlzOiBBcnJheTxMZWF2ZXM8VD4+O1xuICAgIGZ1bmNzPzogQXJyYXk8KG86IFQpID0+IHN0cmluZyB8IHN0cmluZ1tdPjtcbiAgICBzaG91bGRNYXRjaFdvcmRzT25seT86IGJvb2xlYW47XG4gICAgLy8gd2hldGhlciB0byBhcHBseSB1bmhvbW9nbHlwaCBhbmQgc3RyaXAgZGlhY3JpdGljcyB0byBmdXp6IHVwIHRoZSBzZWFyY2guIERlZmF1bHRzIHRvIHRydWVcbiAgICBmdXp6eT86IGJvb2xlYW47XG4gICAgY29udGV4dD86IFRpbWVsaW5lUmVuZGVyaW5nVHlwZTtcbn1cblxuLyoqXG4gKiBTaW1wbGUgc2VhcmNoIG1hdGNoZXIgdGhhdCBtYXRjaGVzIGFueSByZXN1bHRzIHdpdGggdGhlIHF1ZXJ5IHN0cmluZyBhbnl3aGVyZVxuICogaW4gdGhlIHNlYXJjaCBzdHJpbmcuIFJldHVybnMgbWF0Y2hlcyBpbiB0aGUgb3JkZXIgdGhlIHF1ZXJ5IHN0cmluZyBhcHBlYXJzXG4gKiBpbiB0aGUgc2VhcmNoIGtleSwgZWFybGllc3QgZmlyc3QsIHRoZW4gaW4gdGhlIG9yZGVyIHRoZSBzZWFyY2gga2V5IGFwcGVhcnNcbiAqIGluIHRoZSBwcm92aWRlZCBhcnJheSBvZiBrZXlzLCB0aGVuIGluIHRoZSBvcmRlciB0aGUgaXRlbXMgYXBwZWFyZWQgaW4gdGhlXG4gKiBzb3VyY2UgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtPYmplY3RbXX0gb2JqZWN0cyBJbml0aWFsIGxpc3Qgb2Ygb2JqZWN0cy4gRXF1aXZhbGVudCB0byBjYWxsaW5nXG4gKiAgICAgc2V0T2JqZWN0cygpIGFmdGVyIGNvbnN0cnVjdGlvblxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nW119IG9wdGlvbnMua2V5cyBMaXN0IG9mIGtleXMgdG8gdXNlIGFzIGluZGV4ZXMgb24gdGhlIG9iamVjdHNcbiAqIEBwYXJhbSB7ZnVuY3Rpb25bXX0gb3B0aW9ucy5mdW5jcyBMaXN0IG9mIGZ1bmN0aW9ucyB0aGF0IHdoZW4gY2FsbGVkIHdpdGggdGhlXG4gKiAgICAgb2JqZWN0IGFzIGFuIGFyZyB3aWxsIHJldHVybiBhIHN0cmluZyB0byB1c2UgYXMgYW4gaW5kZXhcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVlcnlNYXRjaGVyPFQgZXh0ZW5kcyBPYmplY3Q+IHtcbiAgICBwcml2YXRlIF9vcHRpb25zOiBJT3B0aW9uczxUPjtcbiAgICBwcml2YXRlIF9pdGVtczogTWFwPHN0cmluZywge29iamVjdDogVCwga2V5V2VpZ2h0OiBudW1iZXJ9W10+O1xuXG4gICAgY29uc3RydWN0b3Iob2JqZWN0czogVFtdLCBvcHRpb25zOiBJT3B0aW9uczxUPiA9IHsga2V5czogW10gfSkge1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLnNldE9iamVjdHMob2JqZWN0cyk7XG5cbiAgICAgICAgLy8gQnkgZGVmYXVsdCwgd2UgcmVtb3ZlIGFueSBub24tYWxwaGFudW1lcmljIGNoYXJhY3RlcnMgKFteQS1aYS16MC05X10pIGZyb20gdGhlXG4gICAgICAgIC8vIHF1ZXJ5IGFuZCB0aGUgdmFsdWUgYmVpbmcgcXVlcmllZCBiZWZvcmUgbWF0Y2hpbmdcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuc2hvdWxkTWF0Y2hXb3Jkc09ubHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucy5zaG91bGRNYXRjaFdvcmRzT25seSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRPYmplY3RzKG9iamVjdHM6IFRbXSkge1xuICAgICAgICB0aGlzLl9pdGVtcyA9IG5ldyBNYXAoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBvYmplY3RzKSB7XG4gICAgICAgICAgICAvLyBOZWVkIHRvIHVzZSB1bnNhZmUgY29lcmNlIGhlcmUgYmVjYXVzZSB0aGUgb2JqZWN0cyBjYW4gaGF2ZSBhbnlcbiAgICAgICAgICAgIC8vIHR5cGUgZm9yIHRoZWlyIHZhbHVlcy4gV2UgYXNzdW1lIHRoYXQgdGhvc2UgdmFsdWVzIHdobydzIGtleXMgaGF2ZVxuICAgICAgICAgICAgLy8gYmVlbiBzcGVjaWZpZWQgd2lsbCBiZSBzdHJpbmcuIEFsc28sIHdlIGNhbm5vdCBpbmZlciBhbGwgdGhlXG4gICAgICAgICAgICAvLyB0eXBlcyBvZiB0aGUga2V5cyBvZiB0aGUgb2JqZWN0cyBhdCBjb21waWxlLlxuICAgICAgICAgICAgY29uc3Qga2V5VmFsdWVzID0gYXQ8c3RyaW5nPig8YW55Pm9iamVjdCwgdGhpcy5fb3B0aW9ucy5rZXlzKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZnVuY3MpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGYgb2YgdGhpcy5fb3B0aW9ucy5mdW5jcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2ID0gZihvYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5VmFsdWVzLnB1c2goLi4udik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlWYWx1ZXMucHVzaCh2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChjb25zdCBbaW5kZXgsIGtleVZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhrZXlWYWx1ZXMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFrZXlWYWx1ZSkgY29udGludWU7IC8vIHNraXAgZmFsc3kga2V5VmFsdWVzXG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5wcm9jZXNzUXVlcnkoa2V5VmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5faXRlbXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXRlbXMuc2V0KGtleSwgW10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9pdGVtcy5nZXQoa2V5KS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5V2VpZ2h0OiBOdW1iZXIoaW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICBvYmplY3QsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtYXRjaChxdWVyeTogc3RyaW5nLCBsaW1pdCA9IC0xKTogVFtdIHtcbiAgICAgICAgcXVlcnkgPSB0aGlzLnByb2Nlc3NRdWVyeShxdWVyeSk7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLnNob3VsZE1hdGNoV29yZHNPbmx5KSB7XG4gICAgICAgICAgICBxdWVyeSA9IHF1ZXJ5LnJlcGxhY2UoL1teXFx3XS9nLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBbXTtcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBtYXAgJiBjaGVjayBlYWNoIGtleS5cbiAgICAgICAgLy8gRVM2IE1hcCBpdGVyYXRpb24gb3JkZXIgaXMgZGVmaW5lZCB0byBiZSBpbnNlcnRpb24gb3JkZXIsIHNvIHJlc3VsdHNcbiAgICAgICAgLy8gaGVyZSB3aWxsIGNvbWUgb3V0IGluIHRoZSBvcmRlciB0aGV5IHdlcmUgcHV0IGluLlxuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGNhbmRpZGF0ZXNdIG9mIHRoaXMuX2l0ZW1zLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdEtleSA9IGtleTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9vcHRpb25zLnNob3VsZE1hdGNoV29yZHNPbmx5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0S2V5ID0gcmVzdWx0S2V5LnJlcGxhY2UoL1teXFx3XS9nLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHJlc3VsdEtleS5pbmRleE9mKHF1ZXJ5KTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC4uLmNhbmRpZGF0ZXMubWFwKChjYW5kaWRhdGUpID0+ICh7IGluZGV4LCAuLi5jYW5kaWRhdGUgfSkpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTb3J0IG1hdGNoZXMgYnkgd2hlcmUgdGhlIHF1ZXJ5IGFwcGVhcmVkIGluIHRoZSBzZWFyY2gga2V5LCB0aGVuIGJ5XG4gICAgICAgIC8vIHdoZXJlIHRoZSBtYXRjaGVkIGtleSBhcHBlYXJlZCBpbiB0aGUgcHJvdmlkZWQgYXJyYXkgb2Yga2V5cy5cbiAgICAgICAgbWF0Y2hlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBpZiAoYS5pbmRleCA8IGIuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGEuaW5kZXggPT09IGIuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpZiAoYS5rZXlXZWlnaHQgPCBiLmtleVdlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhLmtleVdlaWdodCA9PT0gYi5rZXlXZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm93IG1hcCB0aGUga2V5cyB0byB0aGUgcmVzdWx0IG9iamVjdHMuIEFsc28gcmVtb3ZlIGFueSBkdXBsaWNhdGVzLlxuICAgICAgICBjb25zdCBkZWR1cHBlZCA9IHVuaXEobWF0Y2hlcy5tYXAoKG1hdGNoKSA9PiBtYXRjaC5vYmplY3QpKTtcbiAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gbGltaXQgPT09IC0xID8gZGVkdXBwZWQubGVuZ3RoIDogbGltaXQ7XG5cbiAgICAgICAgcmV0dXJuIGRlZHVwcGVkLnNsaWNlKDAsIG1heExlbmd0aCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzUXVlcnkocXVlcnk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmZ1enp5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8gbG93ZXIgY2FzZSBib3RoIHRoZSBpbnB1dCBhbmQgdGhlIG91dHB1dCBmb3IgY29uc2lzdGVuY3lcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVIaWRkZW5DaGFycyhxdWVyeS50b0xvd2VyQ2FzZSgpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7Ozs7OztBQWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxZQUFOLENBQXFDO0VBSWhEQyxXQUFXLENBQUNDLE9BQUQsRUFBb0Q7SUFBQSxJQUFyQ0MsT0FBcUMsdUVBQWQ7TUFBRUMsSUFBSSxFQUFFO0lBQVIsQ0FBYztJQUFBO0lBQUE7SUFDM0QsS0FBS0MsUUFBTCxHQUFnQkYsT0FBaEI7SUFFQSxLQUFLRyxVQUFMLENBQWdCSixPQUFoQixFQUgyRCxDQUszRDtJQUNBOztJQUNBLElBQUksS0FBS0csUUFBTCxDQUFjRSxvQkFBZCxLQUF1Q0MsU0FBM0MsRUFBc0Q7TUFDbEQsS0FBS0gsUUFBTCxDQUFjRSxvQkFBZCxHQUFxQyxJQUFyQztJQUNIO0VBQ0o7O0VBRURELFVBQVUsQ0FBQ0osT0FBRCxFQUFlO0lBQ3JCLEtBQUtPLE1BQUwsR0FBYyxJQUFJQyxHQUFKLEVBQWQ7O0lBRUEsS0FBSyxNQUFNQyxNQUFYLElBQXFCVCxPQUFyQixFQUE4QjtNQUMxQjtNQUNBO01BQ0E7TUFDQTtNQUNBLE1BQU1VLFNBQVMsR0FBRyxJQUFBQyxVQUFBLEVBQWdCRixNQUFoQixFQUF3QixLQUFLTixRQUFMLENBQWNELElBQXRDLENBQWxCOztNQUVBLElBQUksS0FBS0MsUUFBTCxDQUFjUyxLQUFsQixFQUF5QjtRQUNyQixLQUFLLE1BQU1DLENBQVgsSUFBZ0IsS0FBS1YsUUFBTCxDQUFjUyxLQUE5QixFQUFxQztVQUNqQyxNQUFNRSxDQUFDLEdBQUdELENBQUMsQ0FBQ0osTUFBRCxDQUFYOztVQUNBLElBQUlNLEtBQUssQ0FBQ0MsT0FBTixDQUFjRixDQUFkLENBQUosRUFBc0I7WUFDbEJKLFNBQVMsQ0FBQ08sSUFBVixDQUFlLEdBQUdILENBQWxCO1VBQ0gsQ0FGRCxNQUVPO1lBQ0hKLFNBQVMsQ0FBQ08sSUFBVixDQUFlSCxDQUFmO1VBQ0g7UUFDSjtNQUNKOztNQUVELEtBQUssTUFBTSxDQUFDSSxLQUFELEVBQVFDLFFBQVIsQ0FBWCxJQUFnQ0MsTUFBTSxDQUFDQyxPQUFQLENBQWVYLFNBQWYsQ0FBaEMsRUFBMkQ7UUFDdkQsSUFBSSxDQUFDUyxRQUFMLEVBQWUsU0FEd0MsQ0FDOUI7O1FBQ3pCLE1BQU1HLEdBQUcsR0FBRyxLQUFLQyxZQUFMLENBQWtCSixRQUFsQixDQUFaOztRQUNBLElBQUksQ0FBQyxLQUFLWixNQUFMLENBQVlpQixHQUFaLENBQWdCRixHQUFoQixDQUFMLEVBQTJCO1VBQ3ZCLEtBQUtmLE1BQUwsQ0FBWWtCLEdBQVosQ0FBZ0JILEdBQWhCLEVBQXFCLEVBQXJCO1FBQ0g7O1FBQ0QsS0FBS2YsTUFBTCxDQUFZbUIsR0FBWixDQUFnQkosR0FBaEIsRUFBcUJMLElBQXJCLENBQTBCO1VBQ3RCVSxTQUFTLEVBQUVDLE1BQU0sQ0FBQ1YsS0FBRCxDQURLO1VBRXRCVDtRQUZzQixDQUExQjtNQUlIO0lBQ0o7RUFDSjs7RUFFRG9CLEtBQUssQ0FBQ0MsS0FBRCxFQUFpQztJQUFBLElBQWpCQyxLQUFpQix1RUFBVCxDQUFDLENBQVE7SUFDbENELEtBQUssR0FBRyxLQUFLUCxZQUFMLENBQWtCTyxLQUFsQixDQUFSOztJQUNBLElBQUksS0FBSzNCLFFBQUwsQ0FBY0Usb0JBQWxCLEVBQXdDO01BQ3BDeUIsS0FBSyxHQUFHQSxLQUFLLENBQUNFLE9BQU4sQ0FBYyxRQUFkLEVBQXdCLEVBQXhCLENBQVI7SUFDSDs7SUFDRCxJQUFJRixLQUFLLENBQUNHLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7TUFDcEIsT0FBTyxFQUFQO0lBQ0g7O0lBQ0QsTUFBTUMsT0FBTyxHQUFHLEVBQWhCLENBUmtDLENBU2xDO0lBQ0E7SUFDQTs7SUFDQSxLQUFLLE1BQU0sQ0FBQ1osR0FBRCxFQUFNYSxVQUFOLENBQVgsSUFBZ0MsS0FBSzVCLE1BQUwsQ0FBWWMsT0FBWixFQUFoQyxFQUF1RDtNQUNuRCxJQUFJZSxTQUFTLEdBQUdkLEdBQWhCOztNQUNBLElBQUksS0FBS25CLFFBQUwsQ0FBY0Usb0JBQWxCLEVBQXdDO1FBQ3BDK0IsU0FBUyxHQUFHQSxTQUFTLENBQUNKLE9BQVYsQ0FBa0IsUUFBbEIsRUFBNEIsRUFBNUIsQ0FBWjtNQUNIOztNQUNELE1BQU1kLEtBQUssR0FBR2tCLFNBQVMsQ0FBQ0MsT0FBVixDQUFrQlAsS0FBbEIsQ0FBZDs7TUFDQSxJQUFJWixLQUFLLEtBQUssQ0FBQyxDQUFmLEVBQWtCO1FBQ2RnQixPQUFPLENBQUNqQixJQUFSLENBQ0ksR0FBR2tCLFVBQVUsQ0FBQ0csR0FBWCxDQUFnQkMsU0FBRDtVQUFrQnJCO1FBQWxCLEdBQTRCcUIsU0FBNUIsQ0FBZixDQURQO01BR0g7SUFDSixDQXZCaUMsQ0F5QmxDO0lBQ0E7OztJQUNBTCxPQUFPLENBQUNNLElBQVIsQ0FBYSxDQUFDQyxDQUFELEVBQUlDLENBQUosS0FBVTtNQUNuQixJQUFJRCxDQUFDLENBQUN2QixLQUFGLEdBQVV3QixDQUFDLENBQUN4QixLQUFoQixFQUF1QjtRQUNuQixPQUFPLENBQUMsQ0FBUjtNQUNILENBRkQsTUFFTyxJQUFJdUIsQ0FBQyxDQUFDdkIsS0FBRixLQUFZd0IsQ0FBQyxDQUFDeEIsS0FBbEIsRUFBeUI7UUFDNUIsSUFBSXVCLENBQUMsQ0FBQ2QsU0FBRixHQUFjZSxDQUFDLENBQUNmLFNBQXBCLEVBQStCO1VBQzNCLE9BQU8sQ0FBQyxDQUFSO1FBQ0gsQ0FGRCxNQUVPLElBQUljLENBQUMsQ0FBQ2QsU0FBRixLQUFnQmUsQ0FBQyxDQUFDZixTQUF0QixFQUFpQztVQUNwQyxPQUFPLENBQVA7UUFDSDtNQUNKOztNQUVELE9BQU8sQ0FBUDtJQUNILENBWkQsRUEzQmtDLENBeUNsQzs7SUFDQSxNQUFNZ0IsUUFBUSxHQUFHLElBQUFDLFlBQUEsRUFBS1YsT0FBTyxDQUFDSSxHQUFSLENBQWFULEtBQUQsSUFBV0EsS0FBSyxDQUFDcEIsTUFBN0IsQ0FBTCxDQUFqQjtJQUNBLE1BQU1vQyxTQUFTLEdBQUdkLEtBQUssS0FBSyxDQUFDLENBQVgsR0FBZVksUUFBUSxDQUFDVixNQUF4QixHQUFpQ0YsS0FBbkQ7SUFFQSxPQUFPWSxRQUFRLENBQUNHLEtBQVQsQ0FBZSxDQUFmLEVBQWtCRCxTQUFsQixDQUFQO0VBQ0g7O0VBRU90QixZQUFZLENBQUNPLEtBQUQsRUFBd0I7SUFDeEMsSUFBSSxLQUFLM0IsUUFBTCxDQUFjNEMsS0FBZCxLQUF3QixLQUE1QixFQUFtQztNQUMvQjtNQUNBLE9BQU8sSUFBQUMsd0JBQUEsRUFBa0JsQixLQUFLLENBQUNtQixXQUFOLEVBQWxCLEVBQXVDQSxXQUF2QyxFQUFQO0lBQ0g7O0lBQ0QsT0FBT25CLEtBQUssQ0FBQ21CLFdBQU4sRUFBUDtFQUNIOztBQXpHK0MifQ==