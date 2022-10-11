"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../languageHandler");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
const FileDropTarget = _ref => {
  let {
    parent,
    onFileDrop
  } = _ref;
  const [state, setState] = (0, _react.useState)({
    dragging: false,
    counter: 0
  });
  (0, _react.useEffect)(() => {
    if (!parent || parent.ondrop) return;

    const onDragEnter = ev => {
      ev.stopPropagation();
      ev.preventDefault();
      setState(state => ({
        // We always increment the counter no matter the types, because dragging is
        // still happening. If we didn't, the drag counter would get out of sync.
        counter: state.counter + 1,
        // See:
        // https://docs.w3cub.com/dom/datatransfer/types
        // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
        dragging: ev.dataTransfer.types.includes("Files") || ev.dataTransfer.types.includes("application/x-moz-file") ? true : state.dragging
      }));
    };

    const onDragLeave = ev => {
      ev.stopPropagation();
      ev.preventDefault();
      setState(state => ({
        counter: state.counter - 1,
        dragging: state.counter <= 1 ? false : state.dragging
      }));
    };

    const onDragOver = ev => {
      ev.stopPropagation();
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "none"; // See:
      // https://docs.w3cub.com/dom/datatransfer/types
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file

      if (ev.dataTransfer.types.includes("Files") || ev.dataTransfer.types.includes("application/x-moz-file")) {
        ev.dataTransfer.dropEffect = "copy";
      }
    };

    const onDrop = ev => {
      ev.stopPropagation();
      ev.preventDefault();
      onFileDrop(ev.dataTransfer);
      setState(state => ({
        dragging: false,
        counter: state.counter - 1
      }));
    };

    parent.addEventListener("drop", onDrop);
    parent.addEventListener("dragover", onDragOver);
    parent.addEventListener("dragenter", onDragEnter);
    parent.addEventListener("dragleave", onDragLeave);
    return () => {
      // disconnect the D&D event listeners from the room view. This
      // is really just for hygiene - we're going to be
      // deleted anyway, so it doesn't matter if the event listeners
      // don't get cleaned up.
      parent.removeEventListener("drop", onDrop);
      parent.removeEventListener("dragover", onDragOver);
      parent.removeEventListener("dragenter", onDragEnter);
      parent.removeEventListener("dragleave", onDragLeave);
    };
  }, [parent, onFileDrop]);

  if (state.dragging) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_FileDropTarget"
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../res/img/upload-big.svg").default,
      className: "mx_FileDropTarget_image",
      alt: ""
    }), (0, _languageHandler._t)("Drop file here to upload"));
  }

  return null;
};

var _default = FileDropTarget;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWxlRHJvcFRhcmdldCIsInBhcmVudCIsIm9uRmlsZURyb3AiLCJzdGF0ZSIsInNldFN0YXRlIiwidXNlU3RhdGUiLCJkcmFnZ2luZyIsImNvdW50ZXIiLCJ1c2VFZmZlY3QiLCJvbmRyb3AiLCJvbkRyYWdFbnRlciIsImV2Iiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJkYXRhVHJhbnNmZXIiLCJ0eXBlcyIsImluY2x1ZGVzIiwib25EcmFnTGVhdmUiLCJvbkRyYWdPdmVyIiwiZHJvcEVmZmVjdCIsIm9uRHJvcCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVxdWlyZSIsImRlZmF1bHQiLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvRmlsZURyb3BUYXJnZXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBwYXJlbnQ6IEhUTUxFbGVtZW50O1xuICAgIG9uRmlsZURyb3AoZGF0YVRyYW5zZmVyOiBEYXRhVHJhbnNmZXIpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBkcmFnZ2luZzogYm9vbGVhbjtcbiAgICBjb3VudGVyOiBudW1iZXI7XG59XG5cbmNvbnN0IEZpbGVEcm9wVGFyZ2V0OiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgcGFyZW50LCBvbkZpbGVEcm9wIH0pID0+IHtcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlPElTdGF0ZT4oe1xuICAgICAgICBkcmFnZ2luZzogZmFsc2UsXG4gICAgICAgIGNvdW50ZXI6IDAsXG4gICAgfSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoIXBhcmVudCB8fCBwYXJlbnQub25kcm9wKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgb25EcmFnRW50ZXIgPSAoZXY6IERyYWdFdmVudCkgPT4ge1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBzZXRTdGF0ZShzdGF0ZSA9PiAoe1xuICAgICAgICAgICAgICAgIC8vIFdlIGFsd2F5cyBpbmNyZW1lbnQgdGhlIGNvdW50ZXIgbm8gbWF0dGVyIHRoZSB0eXBlcywgYmVjYXVzZSBkcmFnZ2luZyBpc1xuICAgICAgICAgICAgICAgIC8vIHN0aWxsIGhhcHBlbmluZy4gSWYgd2UgZGlkbid0LCB0aGUgZHJhZyBjb3VudGVyIHdvdWxkIGdldCBvdXQgb2Ygc3luYy5cbiAgICAgICAgICAgICAgICBjb3VudGVyOiBzdGF0ZS5jb3VudGVyICsgMSxcbiAgICAgICAgICAgICAgICAvLyBTZWU6XG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9kb2NzLnczY3ViLmNvbS9kb20vZGF0YXRyYW5zZmVyL3R5cGVzXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxfRHJhZ19hbmRfRHJvcF9BUEkvUmVjb21tZW5kZWRfZHJhZ190eXBlcyNmaWxlXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IChcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLnR5cGVzLmluY2x1ZGVzKFwiRmlsZXNcIikgfHxcbiAgICAgICAgICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLnR5cGVzLmluY2x1ZGVzKFwiYXBwbGljYXRpb24veC1tb3otZmlsZVwiKVxuICAgICAgICAgICAgICAgICkgPyB0cnVlIDogc3RhdGUuZHJhZ2dpbmcsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgb25EcmFnTGVhdmUgPSAoZXY6IERyYWdFdmVudCkgPT4ge1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBzZXRTdGF0ZShzdGF0ZSA9PiAoe1xuICAgICAgICAgICAgICAgIGNvdW50ZXI6IHN0YXRlLmNvdW50ZXIgLSAxLFxuICAgICAgICAgICAgICAgIGRyYWdnaW5nOiBzdGF0ZS5jb3VudGVyIDw9IDEgPyBmYWxzZSA6IHN0YXRlLmRyYWdnaW5nLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG9uRHJhZ092ZXIgPSAoZXY6IERyYWdFdmVudCkgPT4ge1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBldi5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibm9uZVwiO1xuXG4gICAgICAgICAgICAvLyBTZWU6XG4gICAgICAgICAgICAvLyBodHRwczovL2RvY3MudzNjdWIuY29tL2RvbS9kYXRhdHJhbnNmZXIvdHlwZXNcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IVE1MX0RyYWdfYW5kX0Ryb3BfQVBJL1JlY29tbWVuZGVkX2RyYWdfdHlwZXMjZmlsZVxuICAgICAgICAgICAgaWYgKGV2LmRhdGFUcmFuc2Zlci50eXBlcy5pbmNsdWRlcyhcIkZpbGVzXCIpIHx8IGV2LmRhdGFUcmFuc2Zlci50eXBlcy5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL3gtbW96LWZpbGVcIikpIHtcbiAgICAgICAgICAgICAgICBldi5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwiY29weVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG9uRHJvcCA9IChldjogRHJhZ0V2ZW50KSA9PiB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBvbkZpbGVEcm9wKGV2LmRhdGFUcmFuc2Zlcik7XG5cbiAgICAgICAgICAgIHNldFN0YXRlKHN0YXRlID0+ICh7XG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvdW50ZXI6IHN0YXRlLmNvdW50ZXIgLSAxLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBvbkRyb3ApO1xuICAgICAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIG9uRHJhZ092ZXIpO1xuICAgICAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCBvbkRyYWdFbnRlcik7XG4gICAgICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIG9uRHJhZ0xlYXZlKTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgLy8gZGlzY29ubmVjdCB0aGUgRCZEIGV2ZW50IGxpc3RlbmVycyBmcm9tIHRoZSByb29tIHZpZXcuIFRoaXNcbiAgICAgICAgICAgIC8vIGlzIHJlYWxseSBqdXN0IGZvciBoeWdpZW5lIC0gd2UncmUgZ29pbmcgdG8gYmVcbiAgICAgICAgICAgIC8vIGRlbGV0ZWQgYW55d2F5LCBzbyBpdCBkb2Vzbid0IG1hdHRlciBpZiB0aGUgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgICAgICAvLyBkb24ndCBnZXQgY2xlYW5lZCB1cC5cbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBvbkRyb3ApO1xuICAgICAgICAgICAgcGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBvbkRyYWdPdmVyKTtcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIG9uRHJhZ0VudGVyKTtcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIG9uRHJhZ0xlYXZlKTtcbiAgICAgICAgfTtcbiAgICB9LCBbcGFyZW50LCBvbkZpbGVEcm9wXSk7XG5cbiAgICBpZiAoc3RhdGUuZHJhZ2dpbmcpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfRmlsZURyb3BUYXJnZXRcIj5cbiAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy91cGxvYWQtYmlnLnN2Z1wiKS5kZWZhdWx0fSBjbGFzc05hbWU9XCJteF9GaWxlRHJvcFRhcmdldF9pbWFnZVwiIGFsdD1cIlwiIC8+XG4gICAgICAgICAgICB7IF90KFwiRHJvcCBmaWxlIGhlcmUgdG8gdXBsb2FkXCIpIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRmlsZURyb3BUYXJnZXQ7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFnQkE7O0FBRUE7Ozs7OztBQWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFnQkEsTUFBTUEsY0FBZ0MsR0FBRyxRQUE0QjtFQUFBLElBQTNCO0lBQUVDLE1BQUY7SUFBVUM7RUFBVixDQUEyQjtFQUNqRSxNQUFNLENBQUNDLEtBQUQsRUFBUUMsUUFBUixJQUFvQixJQUFBQyxlQUFBLEVBQWlCO0lBQ3ZDQyxRQUFRLEVBQUUsS0FENkI7SUFFdkNDLE9BQU8sRUFBRTtFQUY4QixDQUFqQixDQUExQjtFQUtBLElBQUFDLGdCQUFBLEVBQVUsTUFBTTtJQUNaLElBQUksQ0FBQ1AsTUFBRCxJQUFXQSxNQUFNLENBQUNRLE1BQXRCLEVBQThCOztJQUU5QixNQUFNQyxXQUFXLEdBQUlDLEVBQUQsSUFBbUI7TUFDbkNBLEVBQUUsQ0FBQ0MsZUFBSDtNQUNBRCxFQUFFLENBQUNFLGNBQUg7TUFFQVQsUUFBUSxDQUFDRCxLQUFLLEtBQUs7UUFDZjtRQUNBO1FBQ0FJLE9BQU8sRUFBRUosS0FBSyxDQUFDSSxPQUFOLEdBQWdCLENBSFY7UUFJZjtRQUNBO1FBQ0E7UUFDQUQsUUFBUSxFQUNKSyxFQUFFLENBQUNHLFlBQUgsQ0FBZ0JDLEtBQWhCLENBQXNCQyxRQUF0QixDQUErQixPQUEvQixLQUNBTCxFQUFFLENBQUNHLFlBQUgsQ0FB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