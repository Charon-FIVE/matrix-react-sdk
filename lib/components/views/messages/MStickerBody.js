"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MImageBody = _interopRequireDefault(require("./MImageBody"));

var _imageMedia = require("../../../utils/image-media");

var _Tooltip = _interopRequireDefault(require("../elements/Tooltip"));

/*
Copyright 2018 New Vector Ltd

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
class MStickerBody extends _MImageBody.default {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onClick", ev => {
      ev.preventDefault();

      if (!this.state.showImage) {
        this.showImage();
      }
    });
  }

  // MStickerBody doesn't need a wrapping `<a href=...>`, but it does need extra padding
  // which is added by mx_MStickerBody_wrapper
  wrapImage(contentUrl, children) {
    let onClick = null;

    if (!this.state.showImage) {
      onClick = this.onClick;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MStickerBody_wrapper",
      onClick: onClick
    }, " ", children, " ");
  } // Placeholder to show in place of the sticker image if img onLoad hasn't fired yet.


  getPlaceholder(width, height) {
    if (this.props.mxEvent.getContent().info?.[_imageMedia.BLURHASH_FIELD]) return super.getPlaceholder(width, height);
    return /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_MStickerBody_placeholder",
      src: require("../../../../res/img/icons-show-stickers.svg").default,
      width: "80",
      height: "80",
      onMouseEnter: this.onImageEnter,
      onMouseLeave: this.onImageLeave
    });
  } // Tooltip to show on mouse over


  getTooltip() {
    const content = this.props.mxEvent && this.props.mxEvent.getContent();
    if (!content || !content.body || !content.info || !content.info.w) return null;
    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        left: content.info.w + 'px'
      },
      className: "mx_MStickerBody_tooltip"
    }, /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
      label: content.body
    }));
  } // Don't show "Download this_file.png ..."


  getFileBody() {
    return null;
  }

  getBanner(content) {
    return null; // we don't need a banner, we have a tooltip
  }

}

exports.default = MStickerBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNU3RpY2tlckJvZHkiLCJNSW1hZ2VCb2R5IiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0YXRlIiwic2hvd0ltYWdlIiwid3JhcEltYWdlIiwiY29udGVudFVybCIsImNoaWxkcmVuIiwib25DbGljayIsImdldFBsYWNlaG9sZGVyIiwid2lkdGgiLCJoZWlnaHQiLCJwcm9wcyIsIm14RXZlbnQiLCJnZXRDb250ZW50IiwiaW5mbyIsIkJMVVJIQVNIX0ZJRUxEIiwicmVxdWlyZSIsImRlZmF1bHQiLCJvbkltYWdlRW50ZXIiLCJvbkltYWdlTGVhdmUiLCJnZXRUb29sdGlwIiwiY29udGVudCIsImJvZHkiLCJ3IiwibGVmdCIsImdldEZpbGVCb2R5IiwiZ2V0QmFubmVyIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvTVN0aWNrZXJCb2R5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgTUltYWdlQm9keSBmcm9tICcuL01JbWFnZUJvZHknO1xuaW1wb3J0IHsgQkxVUkhBU0hfRklFTEQgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvaW1hZ2UtbWVkaWFcIjtcbmltcG9ydCBUb29sdGlwIGZyb20gXCIuLi9lbGVtZW50cy9Ub29sdGlwXCI7XG5pbXBvcnQgeyBJTWVkaWFFdmVudENvbnRlbnQgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvbW9kZWxzL0lNZWRpYUV2ZW50Q29udGVudFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNU3RpY2tlckJvZHkgZXh0ZW5kcyBNSW1hZ2VCb2R5IHtcbiAgICAvLyBNb3N0bHkgZW1wdHkgdG8gcHJldmVudCBkZWZhdWx0IGJlaGF2aW91ciBvZiBNSW1hZ2VCb2R5XG4gICAgcHJvdGVjdGVkIG9uQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSkge1xuICAgICAgICAgICAgdGhpcy5zaG93SW1hZ2UoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBNU3RpY2tlckJvZHkgZG9lc24ndCBuZWVkIGEgd3JhcHBpbmcgYDxhIGhyZWY9Li4uPmAsIGJ1dCBpdCBkb2VzIG5lZWQgZXh0cmEgcGFkZGluZ1xuICAgIC8vIHdoaWNoIGlzIGFkZGVkIGJ5IG14X01TdGlja2VyQm9keV93cmFwcGVyXG4gICAgcHJvdGVjdGVkIHdyYXBJbWFnZShjb250ZW50VXJsOiBzdHJpbmcsIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGUpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBvbkNsaWNrID0gbnVsbDtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSkge1xuICAgICAgICAgICAgb25DbGljayA9IHRoaXMub25DbGljaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9NU3RpY2tlckJvZHlfd3JhcHBlclwiIG9uQ2xpY2s9e29uQ2xpY2t9PiB7IGNoaWxkcmVuIH0gPC9kaXY+O1xuICAgIH1cblxuICAgIC8vIFBsYWNlaG9sZGVyIHRvIHNob3cgaW4gcGxhY2Ugb2YgdGhlIHN0aWNrZXIgaW1hZ2UgaWYgaW1nIG9uTG9hZCBoYXNuJ3QgZmlyZWQgeWV0LlxuICAgIHByb3RlY3RlZCBnZXRQbGFjZWhvbGRlcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkuaW5mbz8uW0JMVVJIQVNIX0ZJRUxEXSkgcmV0dXJuIHN1cGVyLmdldFBsYWNlaG9sZGVyKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01TdGlja2VyQm9keV9wbGFjZWhvbGRlclwiXG4gICAgICAgICAgICAgICAgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9pY29ucy1zaG93LXN0aWNrZXJzLnN2Z1wiKS5kZWZhdWx0fVxuICAgICAgICAgICAgICAgIHdpZHRoPVwiODBcIlxuICAgICAgICAgICAgICAgIGhlaWdodD1cIjgwXCJcbiAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMub25JbWFnZUVudGVyfVxuICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbkltYWdlTGVhdmV9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIFRvb2x0aXAgdG8gc2hvdyBvbiBtb3VzZSBvdmVyXG4gICAgcHJvdGVjdGVkIGdldFRvb2x0aXAoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50ICYmIHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCk7XG5cbiAgICAgICAgaWYgKCFjb250ZW50IHx8ICFjb250ZW50LmJvZHkgfHwgIWNvbnRlbnQuaW5mbyB8fCAhY29udGVudC5pbmZvLncpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiA8ZGl2IHN0eWxlPXt7IGxlZnQ6IGNvbnRlbnQuaW5mby53ICsgJ3B4JyB9fSBjbGFzc05hbWU9XCJteF9NU3RpY2tlckJvZHlfdG9vbHRpcFwiPlxuICAgICAgICAgICAgPFRvb2x0aXAgbGFiZWw9e2NvbnRlbnQuYm9keX0gLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIC8vIERvbid0IHNob3cgXCJEb3dubG9hZCB0aGlzX2ZpbGUucG5nIC4uLlwiXG4gICAgcHJvdGVjdGVkIGdldEZpbGVCb2R5KCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0QmFubmVyKGNvbnRlbnQ6IElNZWRpYUV2ZW50Q29udGVudCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIHdlIGRvbid0IG5lZWQgYSBiYW5uZXIsIHdlIGhhdmUgYSB0b29sdGlwXG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU2UsTUFBTUEsWUFBTixTQUEyQkMsbUJBQTNCLENBQXNDO0VBQUE7SUFBQTtJQUFBLCtDQUU1QkMsRUFBRCxJQUEwQjtNQUMxQ0EsRUFBRSxDQUFDQyxjQUFIOztNQUNBLElBQUksQ0FBQyxLQUFLQyxLQUFMLENBQVdDLFNBQWhCLEVBQTJCO1FBQ3ZCLEtBQUtBLFNBQUw7TUFDSDtJQUNKLENBUGdEO0VBQUE7O0VBU2pEO0VBQ0E7RUFDVUMsU0FBUyxDQUFDQyxVQUFELEVBQXFCQyxRQUFyQixFQUE2RDtJQUM1RSxJQUFJQyxPQUFPLEdBQUcsSUFBZDs7SUFDQSxJQUFJLENBQUMsS0FBS0wsS0FBTCxDQUFXQyxTQUFoQixFQUEyQjtNQUN2QkksT0FBTyxHQUFHLEtBQUtBLE9BQWY7SUFDSDs7SUFDRCxvQkFBTztNQUFLLFNBQVMsRUFBQyx5QkFBZjtNQUF5QyxPQUFPLEVBQUVBO0lBQWxELFFBQThERCxRQUE5RCxNQUFQO0VBQ0gsQ0FqQmdELENBbUJqRDs7O0VBQ1VFLGNBQWMsQ0FBQ0MsS0FBRCxFQUFnQkMsTUFBaEIsRUFBNkM7SUFDakUsSUFBSSxLQUFLQyxLQUFMLENBQVdDLE9BQVgsQ0FBbUJDLFVBQW5CLEdBQWdDQyxJQUFoQyxHQUF1Q0MsMEJBQXZDLENBQUosRUFBNEQsT0FBTyxNQUFNUCxjQUFOLENBQXFCQyxLQUFyQixFQUE0QkMsTUFBNUIsQ0FBUDtJQUM1RCxvQkFDSTtNQUNJLFNBQVMsRUFBQyw2QkFEZDtNQUVJLEdBQUcsRUFBRU0sT0FBTyxDQUFDLDZDQUFELENBQVAsQ0FBdURDLE9BRmhFO01BR0ksS0FBSyxFQUFDLElBSFY7TUFJSSxNQUFNLEVBQUMsSUFKWDtNQUtJLFlBQVksRUFBRSxLQUFLQyxZQUx2QjtNQU1JLFlBQVksRUFBRSxLQUFLQztJQU52QixFQURKO0VBVUgsQ0FoQ2dELENBa0NqRDs7O0VBQ1VDLFVBQVUsR0FBZ0I7SUFDaEMsTUFBTUMsT0FBTyxHQUFHLEtBQUtWLEtBQUwsQ0FBV0MsT0FBWCxJQUFzQixLQUFLRCxLQUFMLENBQVdDLE9BQVgsQ0FBbUJDLFVBQW5CLEVBQXRDO0lBRUEsSUFBSSxDQUFDUSxPQUFELElBQVksQ0FBQ0EsT0FBTyxDQUFDQyxJQUFyQixJQUE2QixDQUFDRCxPQUFPLENBQUNQLElBQXRDLElBQThDLENBQUNPLE9BQU8sQ0FBQ1AsSUFBUixDQUFhUyxDQUFoRSxFQUFtRSxPQUFPLElBQVA7SUFFbkUsb0JBQU87TUFBSyxLQUFLLEVBQUU7UUFBRUMsSUFBSSxFQUFFSCxPQUFPLENBQUNQLElBQVIsQ0FBYVMsQ0FBYixHQUFpQjtNQUF6QixDQUFaO01BQTZDLFNBQVMsRUFBQztJQUF2RCxnQkFDSCw2QkFBQyxnQkFBRDtNQUFTLEtBQUssRUFBRUYsT0FBTyxDQUFDQztJQUF4QixFQURHLENBQVA7RUFHSCxDQTNDZ0QsQ0E2Q2pEOzs7RUFDVUcsV0FBVyxHQUFHO0lBQ3BCLE9BQU8sSUFBUDtFQUNIOztFQUVTQyxTQUFTLENBQUNMLE9BQUQsRUFBMkM7SUFDMUQsT0FBTyxJQUFQLENBRDBELENBQzdDO0VBQ2hCOztBQXBEZ0QifQ==