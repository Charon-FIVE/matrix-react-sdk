"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _client = require("matrix-js-sdk/src/client");

var AvatarLogic = _interopRequireWildcard(require("../../../Avatar"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _units = require("../../../utils/units");

var _languageHandler = require("../../../languageHandler");

const _excluded = ["name", "idName", "title", "url", "urls", "width", "height", "resizeMethod", "defaultToInitialLetter", "onClick", "inputRef", "className"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const calculateUrls = (url, urls, lowBandwidth) => {
  // work out the full set of urls to try to load. This is formed like so:
  // imageUrls: [ props.url, ...props.urls ]
  let _urls = [];

  if (!lowBandwidth) {
    _urls = urls || [];

    if (url) {
      // copy urls and put url first
      _urls = [url, ..._urls];
    }
  } // deduplicate URLs


  return Array.from(new Set(_urls));
};

const useImageUrl = _ref => {
  let {
    url,
    urls
  } = _ref;
  // Since this is a hot code path and the settings store can be slow, we
  // use the cached lowBandwidth value from the room context if it exists
  const roomContext = (0, _react.useContext)(_RoomContext.default);
  const lowBandwidth = roomContext ? roomContext.lowBandwidth : _SettingsStore.default.getValue("lowBandwidth");
  const [imageUrls, setUrls] = (0, _react.useState)(calculateUrls(url, urls, lowBandwidth));
  const [urlsIndex, setIndex] = (0, _react.useState)(0);
  const onError = (0, _react.useCallback)(() => {
    setIndex(i => i + 1); // try the next one
  }, []);
  (0, _react.useEffect)(() => {
    setUrls(calculateUrls(url, urls, lowBandwidth));
    setIndex(0);
  }, [url, JSON.stringify(urls)]); // eslint-disable-line react-hooks/exhaustive-deps

  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const onClientSync = (0, _react.useCallback)((syncState, prevState) => {
    // Consider the client reconnected if there is no error with syncing.
    // This means the state could be RECONNECTING, SYNCING, PREPARED or CATCHUP.
    const reconnected = syncState !== "ERROR" && prevState !== syncState;

    if (reconnected) {
      setIndex(0);
    }
  }, []);
  (0, _useEventEmitter.useTypedEventEmitter)(cli, _client.ClientEvent.Sync, onClientSync);
  const imageUrl = imageUrls[urlsIndex];
  return [imageUrl, onError];
};

const BaseAvatar = props => {
  const {
    name,
    idName,
    title,
    url,
    urls,
    width = 40,
    height = 40,
    resizeMethod = "crop",
    // eslint-disable-line @typescript-eslint/no-unused-vars
    defaultToInitialLetter = true,
    onClick,
    inputRef,
    className
  } = props,
        otherProps = (0, _objectWithoutProperties2.default)(props, _excluded);
  const [imageUrl, onError] = useImageUrl({
    url,
    urls
  });

  if (!imageUrl && defaultToInitialLetter) {
    const initialLetter = AvatarLogic.getInitialLetter(name);

    const textNode = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_BaseAvatar_initial",
      "aria-hidden": "true",
      style: {
        fontSize: (0, _units.toPx)(width * 0.65),
        width: (0, _units.toPx)(width),
        lineHeight: (0, _units.toPx)(height)
      }
    }, initialLetter);

    const imgNode = /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_BaseAvatar_image",
      src: AvatarLogic.defaultAvatarUrlForString(idName || name),
      alt: "",
      title: title,
      onError: onError,
      style: {
        width: (0, _units.toPx)(width),
        height: (0, _units.toPx)(height)
      },
      "aria-hidden": "true"
    });

    if (onClick) {
      return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({
        "aria-label": (0, _languageHandler._t)("Avatar"),
        "aria-live": "off"
      }, otherProps, {
        element: "span",
        className: (0, _classnames.default)("mx_BaseAvatar", className),
        onClick: onClick,
        inputRef: inputRef
      }), textNode, imgNode);
    } else {
      return /*#__PURE__*/_react.default.createElement("span", (0, _extends2.default)({
        className: (0, _classnames.default)("mx_BaseAvatar", className),
        ref: inputRef
      }, otherProps, {
        role: "presentation"
      }), textNode, imgNode);
    }
  }

  if (onClick) {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({
      className: (0, _classnames.default)("mx_BaseAvatar mx_BaseAvatar_image", className),
      element: "img",
      src: imageUrl,
      onClick: onClick,
      onError: onError,
      style: {
        width: (0, _units.toPx)(width),
        height: (0, _units.toPx)(height)
      },
      title: title,
      alt: (0, _languageHandler._t)("Avatar"),
      inputRef: inputRef
    }, otherProps));
  } else {
    return /*#__PURE__*/_react.default.createElement("img", (0, _extends2.default)({
      className: (0, _classnames.default)("mx_BaseAvatar mx_BaseAvatar_image", className),
      src: imageUrl,
      onError: onError,
      style: {
        width: (0, _units.toPx)(width),
        height: (0, _units.toPx)(height)
      },
      title: title,
      alt: "",
      ref: inputRef
    }, otherProps));
  }
};

var _default = BaseAvatar;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYWxjdWxhdGVVcmxzIiwidXJsIiwidXJscyIsImxvd0JhbmR3aWR0aCIsIl91cmxzIiwiQXJyYXkiLCJmcm9tIiwiU2V0IiwidXNlSW1hZ2VVcmwiLCJyb29tQ29udGV4dCIsInVzZUNvbnRleHQiLCJSb29tQ29udGV4dCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImltYWdlVXJscyIsInNldFVybHMiLCJ1c2VTdGF0ZSIsInVybHNJbmRleCIsInNldEluZGV4Iiwib25FcnJvciIsInVzZUNhbGxiYWNrIiwiaSIsInVzZUVmZmVjdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJjbGkiLCJNYXRyaXhDbGllbnRDb250ZXh0Iiwib25DbGllbnRTeW5jIiwic3luY1N0YXRlIiwicHJldlN0YXRlIiwicmVjb25uZWN0ZWQiLCJ1c2VUeXBlZEV2ZW50RW1pdHRlciIsIkNsaWVudEV2ZW50IiwiU3luYyIsImltYWdlVXJsIiwiQmFzZUF2YXRhciIsInByb3BzIiwibmFtZSIsImlkTmFtZSIsInRpdGxlIiwid2lkdGgiLCJoZWlnaHQiLCJyZXNpemVNZXRob2QiLCJkZWZhdWx0VG9Jbml0aWFsTGV0dGVyIiwib25DbGljayIsImlucHV0UmVmIiwiY2xhc3NOYW1lIiwib3RoZXJQcm9wcyIsImluaXRpYWxMZXR0ZXIiLCJBdmF0YXJMb2dpYyIsImdldEluaXRpYWxMZXR0ZXIiLCJ0ZXh0Tm9kZSIsImZvbnRTaXplIiwidG9QeCIsImxpbmVIZWlnaHQiLCJpbWdOb2RlIiwiZGVmYXVsdEF2YXRhclVybEZvclN0cmluZyIsIl90IiwiY2xhc3NOYW1lcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F2YXRhcnMvQmFzZUF2YXRhci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDYWxsYmFjaywgdXNlQ29udGV4dCwgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgUmVzaXplTWV0aG9kIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3BhcnRpYWxzJztcbmltcG9ydCB7IENsaWVudEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuXG5pbXBvcnQgKiBhcyBBdmF0YXJMb2dpYyBmcm9tICcuLi8uLi8uLi9BdmF0YXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IFJvb21Db250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IHVzZVR5cGVkRXZlbnRFbWl0dGVyIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlclwiO1xuaW1wb3J0IHsgdG9QeCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy91bml0c1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBuYW1lOiBzdHJpbmc7IC8vIFRoZSBuYW1lIChmaXJzdCBpbml0aWFsIHVzZWQgYXMgZGVmYXVsdClcbiAgICBpZE5hbWU/OiBzdHJpbmc7IC8vIElEIGZvciBnZW5lcmF0aW5nIGhhc2ggY29sb3Vyc1xuICAgIHRpdGxlPzogc3RyaW5nOyAvLyBvbkhvdmVyIHRpdGxlIHRleHRcbiAgICB1cmw/OiBzdHJpbmc7IC8vIGhpZ2hlc3QgcHJpb3JpdHkgb2YgdGhlbSBhbGwsIHNob3J0Y3V0IHRvIHNldCBpbiB1cmxzWzBdXG4gICAgdXJscz86IHN0cmluZ1tdOyAvLyBbaGlnaGVzdF9wcmlvcml0eSwgLi4uICwgbG93ZXN0X3ByaW9yaXR5XVxuICAgIHdpZHRoPzogbnVtYmVyO1xuICAgIGhlaWdodD86IG51bWJlcjtcbiAgICAvLyBYWFg6IHJlc2l6ZU1ldGhvZCBub3QgYWN0dWFsbHkgdXNlZC5cbiAgICByZXNpemVNZXRob2Q/OiBSZXNpemVNZXRob2Q7XG4gICAgZGVmYXVsdFRvSW5pdGlhbExldHRlcj86IGJvb2xlYW47IC8vIHRydWUgdG8gYWRkIGRlZmF1bHQgdXJsXG4gICAgb25DbGljaz86IFJlYWN0Lk1vdXNlRXZlbnRIYW5kbGVyO1xuICAgIGlucHV0UmVmPzogUmVhY3QuUmVmT2JqZWN0PEhUTUxJbWFnZUVsZW1lbnQgJiBIVE1MU3BhbkVsZW1lbnQ+O1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICB0YWJJbmRleD86IG51bWJlcjtcbn1cblxuY29uc3QgY2FsY3VsYXRlVXJscyA9ICh1cmwsIHVybHMsIGxvd0JhbmR3aWR0aCkgPT4ge1xuICAgIC8vIHdvcmsgb3V0IHRoZSBmdWxsIHNldCBvZiB1cmxzIHRvIHRyeSB0byBsb2FkLiBUaGlzIGlzIGZvcm1lZCBsaWtlIHNvOlxuICAgIC8vIGltYWdlVXJsczogWyBwcm9wcy51cmwsIC4uLnByb3BzLnVybHMgXVxuXG4gICAgbGV0IF91cmxzID0gW107XG4gICAgaWYgKCFsb3dCYW5kd2lkdGgpIHtcbiAgICAgICAgX3VybHMgPSB1cmxzIHx8IFtdO1xuXG4gICAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgICAgIC8vIGNvcHkgdXJscyBhbmQgcHV0IHVybCBmaXJzdFxuICAgICAgICAgICAgX3VybHMgPSBbdXJsLCAuLi5fdXJsc107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkZWR1cGxpY2F0ZSBVUkxzXG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChfdXJscykpO1xufTtcblxuY29uc3QgdXNlSW1hZ2VVcmwgPSAoeyB1cmwsIHVybHMgfSk6IFtzdHJpbmcsICgpID0+IHZvaWRdID0+IHtcbiAgICAvLyBTaW5jZSB0aGlzIGlzIGEgaG90IGNvZGUgcGF0aCBhbmQgdGhlIHNldHRpbmdzIHN0b3JlIGNhbiBiZSBzbG93LCB3ZVxuICAgIC8vIHVzZSB0aGUgY2FjaGVkIGxvd0JhbmR3aWR0aCB2YWx1ZSBmcm9tIHRoZSByb29tIGNvbnRleHQgaWYgaXQgZXhpc3RzXG4gICAgY29uc3Qgcm9vbUNvbnRleHQgPSB1c2VDb250ZXh0KFJvb21Db250ZXh0KTtcbiAgICBjb25zdCBsb3dCYW5kd2lkdGggPSByb29tQ29udGV4dCA/XG4gICAgICAgIHJvb21Db250ZXh0Lmxvd0JhbmR3aWR0aCA6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsb3dCYW5kd2lkdGhcIik7XG5cbiAgICBjb25zdCBbaW1hZ2VVcmxzLCBzZXRVcmxzXSA9IHVzZVN0YXRlPHN0cmluZ1tdPihjYWxjdWxhdGVVcmxzKHVybCwgdXJscywgbG93QmFuZHdpZHRoKSk7XG4gICAgY29uc3QgW3VybHNJbmRleCwgc2V0SW5kZXhdID0gdXNlU3RhdGU8bnVtYmVyPigwKTtcblxuICAgIGNvbnN0IG9uRXJyb3IgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldEluZGV4KGkgPT4gaSArIDEpOyAvLyB0cnkgdGhlIG5leHQgb25lXG4gICAgfSwgW10pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0VXJscyhjYWxjdWxhdGVVcmxzKHVybCwgdXJscywgbG93QmFuZHdpZHRoKSk7XG4gICAgICAgIHNldEluZGV4KDApO1xuICAgIH0sIFt1cmwsIEpTT04uc3RyaW5naWZ5KHVybHMpXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IG9uQ2xpZW50U3luYyA9IHVzZUNhbGxiYWNrKChzeW5jU3RhdGUsIHByZXZTdGF0ZSkgPT4ge1xuICAgICAgICAvLyBDb25zaWRlciB0aGUgY2xpZW50IHJlY29ubmVjdGVkIGlmIHRoZXJlIGlzIG5vIGVycm9yIHdpdGggc3luY2luZy5cbiAgICAgICAgLy8gVGhpcyBtZWFucyB0aGUgc3RhdGUgY291bGQgYmUgUkVDT05ORUNUSU5HLCBTWU5DSU5HLCBQUkVQQVJFRCBvciBDQVRDSFVQLlxuICAgICAgICBjb25zdCByZWNvbm5lY3RlZCA9IHN5bmNTdGF0ZSAhPT0gXCJFUlJPUlwiICYmIHByZXZTdGF0ZSAhPT0gc3luY1N0YXRlO1xuICAgICAgICBpZiAocmVjb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIHNldEluZGV4KDApO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIHVzZVR5cGVkRXZlbnRFbWl0dGVyKGNsaSwgQ2xpZW50RXZlbnQuU3luYywgb25DbGllbnRTeW5jKTtcblxuICAgIGNvbnN0IGltYWdlVXJsID0gaW1hZ2VVcmxzW3VybHNJbmRleF07XG4gICAgcmV0dXJuIFtpbWFnZVVybCwgb25FcnJvcl07XG59O1xuXG5jb25zdCBCYXNlQXZhdGFyID0gKHByb3BzOiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIGlkTmFtZSxcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIHVybCxcbiAgICAgICAgdXJscyxcbiAgICAgICAgd2lkdGggPSA0MCxcbiAgICAgICAgaGVpZ2h0ID0gNDAsXG4gICAgICAgIHJlc2l6ZU1ldGhvZCA9IFwiY3JvcFwiLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICBkZWZhdWx0VG9Jbml0aWFsTGV0dGVyID0gdHJ1ZSxcbiAgICAgICAgb25DbGljayxcbiAgICAgICAgaW5wdXRSZWYsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgLi4ub3RoZXJQcm9wc1xuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IFtpbWFnZVVybCwgb25FcnJvcl0gPSB1c2VJbWFnZVVybCh7IHVybCwgdXJscyB9KTtcblxuICAgIGlmICghaW1hZ2VVcmwgJiYgZGVmYXVsdFRvSW5pdGlhbExldHRlcikge1xuICAgICAgICBjb25zdCBpbml0aWFsTGV0dGVyID0gQXZhdGFyTG9naWMuZ2V0SW5pdGlhbExldHRlcihuYW1lKTtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSAoXG4gICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0Jhc2VBdmF0YXJfaW5pdGlhbFwiXG4gICAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogdG9QeCh3aWR0aCAqIDAuNjUpLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdG9QeCh3aWR0aCksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IHRvUHgoaGVpZ2h0KSxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgaW5pdGlhbExldHRlciB9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGltZ05vZGUgPSAoXG4gICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQmFzZUF2YXRhcl9pbWFnZVwiXG4gICAgICAgICAgICAgICAgc3JjPXtBdmF0YXJMb2dpYy5kZWZhdWx0QXZhdGFyVXJsRm9yU3RyaW5nKGlkTmFtZSB8fCBuYW1lKX1cbiAgICAgICAgICAgICAgICBhbHQ9XCJcIlxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgICAgICBvbkVycm9yPXtvbkVycm9yfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0b1B4KHdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0b1B4KGhlaWdodCksXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChvbkNsaWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiQXZhdGFyXCIpfVxuICAgICAgICAgICAgICAgICAgICBhcmlhLWxpdmU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICB7Li4ub3RoZXJQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInNwYW5cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9CYXNlQXZhdGFyXCIsIGNsYXNzTmFtZSl9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgdGV4dE5vZGUgfVxuICAgICAgICAgICAgICAgICAgICB7IGltZ05vZGUgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0Jhc2VBdmF0YXJcIiwgY2xhc3NOYW1lKX1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgICAgICAgICAgey4uLm90aGVyUHJvcHN9XG4gICAgICAgICAgICAgICAgICAgIHJvbGU9XCJwcmVzZW50YXRpb25cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0ZXh0Tm9kZSB9XG4gICAgICAgICAgICAgICAgICAgIHsgaW1nTm9kZSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvbkNsaWNrKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0Jhc2VBdmF0YXIgbXhfQmFzZUF2YXRhcl9pbWFnZVwiLCBjbGFzc05hbWUpfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQ9J2ltZydcbiAgICAgICAgICAgICAgICBzcmM9e2ltYWdlVXJsfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICAgICAgb25FcnJvcj17b25FcnJvcn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdG9QeCh3aWR0aCksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdG9QeChoZWlnaHQpLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgICAgIGFsdD17X3QoXCJBdmF0YXJcIil9XG4gICAgICAgICAgICAgICAgaW5wdXRSZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgICAgIHsuLi5vdGhlclByb3BzfSAvPlxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfQmFzZUF2YXRhciBteF9CYXNlQXZhdGFyX2ltYWdlXCIsIGNsYXNzTmFtZSl9XG4gICAgICAgICAgICAgICAgc3JjPXtpbWFnZVVybH1cbiAgICAgICAgICAgICAgICBvbkVycm9yPXtvbkVycm9yfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0b1B4KHdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0b1B4KGhlaWdodCksXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICAgICAgYWx0PVwiXCJcbiAgICAgICAgICAgICAgICByZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgICAgIHsuLi5vdGhlclByb3BzfSAvPlxuICAgICAgICApO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VBdmF0YXI7XG5leHBvcnQgdHlwZSBCYXNlQXZhdGFyVHlwZSA9IFJlYWN0LkZDPElQcm9wcz47XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBbUJBLE1BQU1BLGFBQWEsR0FBRyxDQUFDQyxHQUFELEVBQU1DLElBQU4sRUFBWUMsWUFBWixLQUE2QjtFQUMvQztFQUNBO0VBRUEsSUFBSUMsS0FBSyxHQUFHLEVBQVo7O0VBQ0EsSUFBSSxDQUFDRCxZQUFMLEVBQW1CO0lBQ2ZDLEtBQUssR0FBR0YsSUFBSSxJQUFJLEVBQWhCOztJQUVBLElBQUlELEdBQUosRUFBUztNQUNMO01BQ0FHLEtBQUssR0FBRyxDQUFDSCxHQUFELEVBQU0sR0FBR0csS0FBVCxDQUFSO0lBQ0g7RUFDSixDQVo4QyxDQWMvQzs7O0VBQ0EsT0FBT0MsS0FBSyxDQUFDQyxJQUFOLENBQVcsSUFBSUMsR0FBSixDQUFRSCxLQUFSLENBQVgsQ0FBUDtBQUNILENBaEJEOztBQWtCQSxNQUFNSSxXQUFXLEdBQUcsUUFBeUM7RUFBQSxJQUF4QztJQUFFUCxHQUFGO0lBQU9DO0VBQVAsQ0FBd0M7RUFDekQ7RUFDQTtFQUNBLE1BQU1PLFdBQVcsR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyxvQkFBWCxDQUFwQjtFQUNBLE1BQU1SLFlBQVksR0FBR00sV0FBVyxHQUM1QkEsV0FBVyxDQUFDTixZQURnQixHQUNEUyxzQkFBQSxDQUFjQyxRQUFkLENBQXVCLGNBQXZCLENBRC9C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