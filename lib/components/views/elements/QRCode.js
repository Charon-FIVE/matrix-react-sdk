"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var React = _interopRequireWildcard(require("react"));

var _qrcode = require("qrcode");

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _Spinner = _interopRequireDefault(require("./Spinner"));

const _excluded = ["data", "className"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const defaultOptions = {
  errorCorrectionLevel: 'L' // we want it as trivial-looking as possible

};

const QRCode = _ref => {
  let {
    data,
    className
  } = _ref,
      options = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const [dataUri, setUri] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    (0, _qrcode.toDataURL)(data, _objectSpread(_objectSpread({}, defaultOptions), options)).then(uri => {
      if (cancelled) return;
      setUri(uri);
    });
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(data), options]); // eslint-disable-line react-hooks/exhaustive-deps

  return /*#__PURE__*/React.createElement("div", {
    className: (0, _classnames.default)("mx_QRCode", className)
  }, dataUri ? /*#__PURE__*/React.createElement("img", {
    src: dataUri,
    className: "mx_VerificationQRCode",
    alt: (0, _languageHandler._t)("QR Code")
  }) : /*#__PURE__*/React.createElement(_Spinner.default, null));
};

var _default = QRCode;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWZhdWx0T3B0aW9ucyIsImVycm9yQ29ycmVjdGlvbkxldmVsIiwiUVJDb2RlIiwiZGF0YSIsImNsYXNzTmFtZSIsIm9wdGlvbnMiLCJkYXRhVXJpIiwic2V0VXJpIiwiUmVhY3QiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsImNhbmNlbGxlZCIsInRvRGF0YVVSTCIsInRoZW4iLCJ1cmkiLCJKU09OIiwic3RyaW5naWZ5IiwiY2xhc3NOYW1lcyIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvUVJDb2RlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHRvRGF0YVVSTCwgUVJDb2RlU2VnbWVudCwgUVJDb2RlVG9EYXRhVVJMT3B0aW9ucywgUVJDb2RlUmVuZGVyZXJzT3B0aW9ucyB9IGZyb20gXCJxcmNvZGVcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4vU3Bpbm5lclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgUVJDb2RlUmVuZGVyZXJzT3B0aW9ucyB7XG4gICAgZGF0YTogc3RyaW5nIHwgUVJDb2RlU2VnbWVudFtdO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbn1cblxuY29uc3QgZGVmYXVsdE9wdGlvbnM6IFFSQ29kZVRvRGF0YVVSTE9wdGlvbnMgPSB7XG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw6ICdMJywgLy8gd2Ugd2FudCBpdCBhcyB0cml2aWFsLWxvb2tpbmcgYXMgcG9zc2libGVcbn07XG5cbmNvbnN0IFFSQ29kZTogUmVhY3QuRkM8SVByb3BzPiA9ICh7IGRhdGEsIGNsYXNzTmFtZSwgLi4ub3B0aW9ucyB9KSA9PiB7XG4gICAgY29uc3QgW2RhdGFVcmksIHNldFVyaV0gPSBSZWFjdC51c2VTdGF0ZTxzdHJpbmc+KG51bGwpO1xuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZTtcbiAgICAgICAgdG9EYXRhVVJMKGRhdGEsIHsgLi4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnMgfSkudGhlbih1cmkgPT4ge1xuICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0VXJpKHVyaSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9LCBbSlNPTi5zdHJpbmdpZnkoZGF0YSksIG9wdGlvbnNdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1FSQ29kZVwiLCBjbGFzc05hbWUpfT5cbiAgICAgICAgeyBkYXRhVXJpID8gPGltZyBzcmM9e2RhdGFVcml9IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblFSQ29kZVwiIGFsdD17X3QoXCJRUiBDb2RlXCIpfSAvPiA6IDxTcGlubmVyIC8+IH1cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBRUkNvZGU7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7OztBQU9BLE1BQU1BLGNBQXNDLEdBQUc7RUFDM0NDLG9CQUFvQixFQUFFLEdBRHFCLENBQ2hCOztBQURnQixDQUEvQzs7QUFJQSxNQUFNQyxNQUF3QixHQUFHLFFBQXFDO0VBQUEsSUFBcEM7SUFBRUMsSUFBRjtJQUFRQztFQUFSLENBQW9DO0VBQUEsSUFBZEMsT0FBYztFQUNsRSxNQUFNLENBQUNDLE9BQUQsRUFBVUMsTUFBVixJQUFvQkMsS0FBSyxDQUFDQyxRQUFOLENBQXVCLElBQXZCLENBQTFCO0VBQ0FELEtBQUssQ0FBQ0UsU0FBTixDQUFnQixNQUFNO0lBQ2xCLElBQUlDLFNBQVMsR0FBRyxLQUFoQjtJQUNBLElBQUFDLGlCQUFBLEVBQVVULElBQVYsa0NBQXFCSCxjQUFyQixHQUF3Q0ssT0FBeEMsR0FBbURRLElBQW5ELENBQXdEQyxHQUFHLElBQUk7TUFDM0QsSUFBSUgsU0FBSixFQUFlO01BQ2ZKLE1BQU0sQ0FBQ08sR0FBRCxDQUFOO0lBQ0gsQ0FIRDtJQUlBLE9BQU8sTUFBTTtNQUNUSCxTQUFTLEdBQUcsSUFBWjtJQUNILENBRkQ7RUFHSCxDQVRELEVBU0csQ0FBQ0ksSUFBSSxDQUFDQyxTQUFMLENBQWViLElBQWYsQ0FBRCxFQUF1QkUsT0FBdkIsQ0FUSCxFQUZrRSxDQVc3Qjs7RUFFckMsb0JBQU87SUFBSyxTQUFTLEVBQUUsSUFBQVksbUJBQUEsRUFBVyxXQUFYLEVBQXdCYixTQUF4QjtFQUFoQixHQUNERSxPQUFPLGdCQUFHO0lBQUssR0FBRyxFQUFFQSxPQUFWO0lBQW1CLFNBQVMsRUFBQyx1QkFBN0I7SUFBcUQsR0FBRyxFQUFFLElBQUFZLG1CQUFBLEVBQUcsU0FBSDtFQUExRCxFQUFILGdCQUFpRixvQkFBQyxnQkFBRCxPQUR2RixDQUFQO0FBR0gsQ0FoQkQ7O2VBa0JlaEIsTSJ9