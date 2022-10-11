"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _effects = require("../../../effects");

var _UIStore = _interopRequireWildcard(require("../../../stores/UIStore"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const EffectsOverlay = _ref => {
  let {
    roomWidth
  } = _ref;
  const canvasRef = (0, _react.useRef)(null);
  const effectsRef = (0, _react.useRef)(new Map());

  const lazyLoadEffectModule = async name => {
    if (!name) return null;
    let effect = effectsRef.current[name] || null;

    if (effect === null) {
      const options = _effects.CHAT_EFFECTS.find(e => e.command === name)?.options;

      try {
        const {
          default: Effect
        } = await Promise.resolve(`../../../effects/${name}`).then(s => _interopRequireWildcard(require(s)));
        effect = new Effect(options);
        effectsRef.current[name] = effect;
      } catch (err) {
        _logger.logger.warn(`Unable to load effect module at '../../../effects/${name}.`, err);
      }
    }

    return effect;
  };

  (0, _react.useEffect)(() => {
    const resize = () => {
      if (canvasRef.current && canvasRef.current?.height !== _UIStore.default.instance.windowHeight) {
        canvasRef.current.height = _UIStore.default.instance.windowHeight;
      }
    };

    const onAction = payload => {
      const actionPrefix = 'effects.';

      if (payload.action.indexOf(actionPrefix) === 0) {
        const effect = payload.action.slice(actionPrefix.length);
        lazyLoadEffectModule(effect).then(module => module?.start(canvasRef.current));
      }
    };

    const dispatcherRef = _dispatcher.default.register(onAction);

    const canvas = canvasRef.current;
    canvas.height = _UIStore.default.instance.windowHeight;

    _UIStore.default.instance.on(_UIStore.UI_EVENTS.Resize, resize);

    return () => {
      _dispatcher.default.unregister(dispatcherRef);

      _UIStore.default.instance.off(_UIStore.UI_EVENTS.Resize, resize); // eslint-disable-next-line react-hooks/exhaustive-deps


      const currentEffects = effectsRef.current; // this is not a react node ref, warning can be safely ignored

      for (const effect in currentEffects) {
        const effectModule = currentEffects[effect];

        if (effectModule && effectModule.isRunning) {
          effectModule.stop();
        }
      }
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement("canvas", {
    ref: canvasRef,
    width: roomWidth,
    style: {
      display: 'block',
      zIndex: 999999,
      pointerEvents: 'none',
      position: 'fixed',
      top: 0,
      right: 0
    }
  });
};

var _default = EffectsOverlay;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFZmZlY3RzT3ZlcmxheSIsInJvb21XaWR0aCIsImNhbnZhc1JlZiIsInVzZVJlZiIsImVmZmVjdHNSZWYiLCJNYXAiLCJsYXp5TG9hZEVmZmVjdE1vZHVsZSIsIm5hbWUiLCJlZmZlY3QiLCJjdXJyZW50Iiwib3B0aW9ucyIsIkNIQVRfRUZGRUNUUyIsImZpbmQiLCJlIiwiY29tbWFuZCIsImRlZmF1bHQiLCJFZmZlY3QiLCJlcnIiLCJsb2dnZXIiLCJ3YXJuIiwidXNlRWZmZWN0IiwicmVzaXplIiwiaGVpZ2h0IiwiVUlTdG9yZSIsImluc3RhbmNlIiwid2luZG93SGVpZ2h0Iiwib25BY3Rpb24iLCJwYXlsb2FkIiwiYWN0aW9uUHJlZml4IiwiYWN0aW9uIiwiaW5kZXhPZiIsInNsaWNlIiwibGVuZ3RoIiwidGhlbiIsIm1vZHVsZSIsInN0YXJ0IiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwiY2FudmFzIiwib24iLCJVSV9FVkVOVFMiLCJSZXNpemUiLCJ1bnJlZ2lzdGVyIiwib2ZmIiwiY3VycmVudEVmZmVjdHMiLCJlZmZlY3RNb2R1bGUiLCJpc1J1bm5pbmciLCJzdG9wIiwiZGlzcGxheSIsInpJbmRleCIsInBvaW50ZXJFdmVudHMiLCJwb3NpdGlvbiIsInRvcCIsInJpZ2h0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRWZmZWN0c092ZXJsYXkudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gQ29weXJpZ2h0IDIwMjAgTnVyamluIEphZmFyXG4gQ29weXJpZ2h0IDIwMjAgTm9yZGVjayBJVCArIENvbnN1bHRpbmcgR21iSC5cblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IEZ1bmN0aW9uQ29tcG9uZW50LCB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IElDYW52YXNFZmZlY3QgZnJvbSAnLi4vLi4vLi4vZWZmZWN0cy9JQ2FudmFzRWZmZWN0JztcbmltcG9ydCB7IENIQVRfRUZGRUNUUyB9IGZyb20gJy4uLy4uLy4uL2VmZmVjdHMnO1xuaW1wb3J0IFVJU3RvcmUsIHsgVUlfRVZFTlRTIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9VSVN0b3JlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21XaWR0aDogbnVtYmVyO1xufVxuXG5jb25zdCBFZmZlY3RzT3ZlcmxheTogRnVuY3Rpb25Db21wb25lbnQ8SVByb3BzPiA9ICh7IHJvb21XaWR0aCB9KSA9PiB7XG4gICAgY29uc3QgY2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50PihudWxsKTtcbiAgICBjb25zdCBlZmZlY3RzUmVmID0gdXNlUmVmPE1hcDxzdHJpbmcsIElDYW52YXNFZmZlY3Q+PihuZXcgTWFwPHN0cmluZywgSUNhbnZhc0VmZmVjdD4oKSk7XG5cbiAgICBjb25zdCBsYXp5TG9hZEVmZmVjdE1vZHVsZSA9IGFzeW5jIChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPElDYW52YXNFZmZlY3Q+ID0+IHtcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IGVmZmVjdDogSUNhbnZhc0VmZmVjdCB8IG51bGwgPSBlZmZlY3RzUmVmLmN1cnJlbnRbbmFtZV0gfHwgbnVsbDtcbiAgICAgICAgaWYgKGVmZmVjdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IENIQVRfRUZGRUNUUy5maW5kKChlKSA9PiBlLmNvbW1hbmQgPT09IG5hbWUpPy5vcHRpb25zO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IEVmZmVjdCB9ID0gYXdhaXQgaW1wb3J0KGAuLi8uLi8uLi9lZmZlY3RzLyR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICBlZmZlY3QgPSBuZXcgRWZmZWN0KG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGVmZmVjdHNSZWYuY3VycmVudFtuYW1lXSA9IGVmZmVjdDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGBVbmFibGUgdG8gbG9hZCBlZmZlY3QgbW9kdWxlIGF0ICcuLi8uLi8uLi9lZmZlY3RzLyR7bmFtZX0uYCwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWZmZWN0O1xuICAgIH07XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCByZXNpemUgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2FudmFzUmVmLmN1cnJlbnQgJiYgY2FudmFzUmVmLmN1cnJlbnQ/LmhlaWdodCAhPT0gVUlTdG9yZS5pbnN0YW5jZS53aW5kb3dIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBjYW52YXNSZWYuY3VycmVudC5oZWlnaHQgPSBVSVN0b3JlLmluc3RhbmNlLndpbmRvd0hlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb25BY3Rpb24gPSAocGF5bG9hZDogeyBhY3Rpb246IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25QcmVmaXggPSAnZWZmZWN0cy4nO1xuICAgICAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uLmluZGV4T2YoYWN0aW9uUHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVmZmVjdCA9IHBheWxvYWQuYWN0aW9uLnNsaWNlKGFjdGlvblByZWZpeC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxhenlMb2FkRWZmZWN0TW9kdWxlKGVmZmVjdCkudGhlbigobW9kdWxlKSA9PiBtb2R1bGU/LnN0YXJ0KGNhbnZhc1JlZi5jdXJyZW50KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIob25BY3Rpb24pO1xuICAgICAgICBjb25zdCBjYW52YXMgPSBjYW52YXNSZWYuY3VycmVudDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IFVJU3RvcmUuaW5zdGFuY2Uud2luZG93SGVpZ2h0O1xuICAgICAgICBVSVN0b3JlLmluc3RhbmNlLm9uKFVJX0VWRU5UUy5SZXNpemUsIHJlc2l6ZSk7XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGRpcy51bnJlZ2lzdGVyKGRpc3BhdGNoZXJSZWYpO1xuICAgICAgICAgICAgVUlTdG9yZS5pbnN0YW5jZS5vZmYoVUlfRVZFTlRTLlJlc2l6ZSwgcmVzaXplKTtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFZmZlY3RzID0gZWZmZWN0c1JlZi5jdXJyZW50OyAvLyB0aGlzIGlzIG5vdCBhIHJlYWN0IG5vZGUgcmVmLCB3YXJuaW5nIGNhbiBiZSBzYWZlbHkgaWdub3JlZFxuICAgICAgICAgICAgZm9yIChjb25zdCBlZmZlY3QgaW4gY3VycmVudEVmZmVjdHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlZmZlY3RNb2R1bGU6IElDYW52YXNFZmZlY3QgPSBjdXJyZW50RWZmZWN0c1tlZmZlY3RdO1xuICAgICAgICAgICAgICAgIGlmIChlZmZlY3RNb2R1bGUgJiYgZWZmZWN0TW9kdWxlLmlzUnVubmluZykge1xuICAgICAgICAgICAgICAgICAgICBlZmZlY3RNb2R1bGUuc3RvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LCBbXSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Y2FudmFzXG4gICAgICAgICAgICByZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgICAgIHdpZHRoPXtyb29tV2lkdGh9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICAgICAgICAgICAgekluZGV4OiA5OTk5OTksXG4gICAgICAgICAgICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEVmZmVjdHNPdmVybGF5O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7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