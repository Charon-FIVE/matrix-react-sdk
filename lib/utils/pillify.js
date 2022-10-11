"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pillifyLinks = pillifyLinks;
exports.unmountPills = unmountPills;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _pushprocessor = require("matrix-js-sdk/src/pushprocessor");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _Pill = _interopRequireWildcard(require("../components/views/elements/Pill"));

var _Permalinks = require("./permalinks/Permalinks");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019, 2020, 2021 The Matrix.org Foundation C.I.C.

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

/**
 * Recurses depth-first through a DOM tree, converting matrix.to links
 * into pills based on the context of a given room.  Returns a list of
 * the resulting React nodes so they can be unmounted rather than leaking.
 *
 * @param {Element[]} nodes - a list of sibling DOM nodes to traverse to try
 *   to turn into pills.
 * @param {MatrixEvent} mxEvent - the matrix event which the DOM nodes are
 *   part of representing.
 * @param {Element[]} pills: an accumulator of the DOM nodes which contain
 *   React components which have been mounted as part of this.
 *   The initial caller should pass in an empty array to seed the accumulator.
 */
function pillifyLinks(nodes, mxEvent, pills) {
  const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(mxEvent.getRoomId());

  const shouldShowPillAvatar = _SettingsStore.default.getValue("Pill.shouldShowPillAvatar");

  let node = nodes[0];

  while (node) {
    let pillified = false;

    if (node.tagName === "PRE" || node.tagName === "CODE" || pills.includes(node)) {
      // Skip code blocks and existing pills
      node = node.nextSibling;
      continue;
    } else if (node.tagName === "A" && node.getAttribute("href")) {
      const href = node.getAttribute("href");
      const parts = (0, _Permalinks.parsePermalink)(href); // If the link is a (localised) matrix.to link, replace it with a pill
      // We don't want to pill event permalinks, so those are ignored.

      if (parts && !parts.eventId) {
        const pillContainer = document.createElement('span');

        const pill = /*#__PURE__*/_react.default.createElement(_Pill.default, {
          url: href,
          inMessage: true,
          room: room,
          shouldShowPillAvatar: shouldShowPillAvatar
        });

        _reactDom.default.render(pill, pillContainer);

        node.parentNode.replaceChild(pillContainer, node);
        pills.push(pillContainer); // Pills within pills aren't going to go well, so move on

        pillified = true; // update the current node with one that's now taken its place

        node = pillContainer;
      }
    } else if (node.nodeType === Node.TEXT_NODE && // as applying pills happens outside of react, make sure we're not doubly
    // applying @room pills here, as a rerender with the same content won't touch the DOM
    // to clear the pills from the last run of pillifyLinks
    !node.parentElement.classList.contains("mx_AtRoomPill")) {
      let currentTextNode = node;
      const roomNotifTextNodes = []; // Take a textNode and break it up to make all the instances of @room their
      // own textNode, adding those nodes to roomNotifTextNodes

      while (currentTextNode !== null) {
        const roomNotifPos = _Pill.default.roomNotifPos(currentTextNode.textContent);

        let nextTextNode = null;

        if (roomNotifPos > -1) {
          let roomTextNode = currentTextNode;
          if (roomNotifPos > 0) roomTextNode = roomTextNode.splitText(roomNotifPos);

          if (roomTextNode.textContent.length > _Pill.default.roomNotifLen()) {
            nextTextNode = roomTextNode.splitText(_Pill.default.roomNotifLen());
          }

          roomNotifTextNodes.push(roomTextNode);
        }

        currentTextNode = nextTextNode;
      }

      if (roomNotifTextNodes.length > 0) {
        const pushProcessor = new _pushprocessor.PushProcessor(_MatrixClientPeg.MatrixClientPeg.get());
        const atRoomRule = pushProcessor.getPushRuleById(".m.rule.roomnotif");

        if (atRoomRule && pushProcessor.ruleMatchesEvent(atRoomRule, mxEvent)) {
          // Now replace all those nodes with Pills
          for (const roomNotifTextNode of roomNotifTextNodes) {
            // Set the next node to be processed to the one after the node
            // we're adding now, since we've just inserted nodes into the structure
            // we're iterating over.
            // Note we've checked roomNotifTextNodes.length > 0 so we'll do this at least once
            node = roomNotifTextNode.nextSibling;
            const pillContainer = document.createElement('span');

            const pill = /*#__PURE__*/_react.default.createElement(_Pill.default, {
              type: _Pill.PillType.AtRoomMention,
              inMessage: true,
              room: room,
              shouldShowPillAvatar: shouldShowPillAvatar
            });

            _reactDom.default.render(pill, pillContainer);

            roomNotifTextNode.parentNode.replaceChild(pillContainer, roomNotifTextNode);
            pills.push(pillContainer);
          } // Nothing else to do for a text node (and we don't need to advance
          // the loop pointer because we did it above)


          continue;
        }
      }
    }

    if (node.childNodes && node.childNodes.length && !pillified) {
      pillifyLinks(node.childNodes, mxEvent, pills);
    }

    node = node.nextSibling;
  }
}
/**
 * Unmount all the pill containers from React created by pillifyLinks.
 *
 * It's critical to call this after pillifyLinks, otherwise
 * Pills will leak, leaking entire DOM trees via the event
 * emitter on BaseAvatar as per
 * https://github.com/vector-im/element-web/issues/12417
 *
 * @param {Element[]} pills - array of pill containers whose React
 *   components should be unmounted.
 */


function unmountPills(pills) {
  for (const pillContainer of pills) {
    _reactDom.default.unmountComponentAtNode(pillContainer);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaWxsaWZ5TGlua3MiLCJub2RlcyIsIm14RXZlbnQiLCJwaWxscyIsInJvb20iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwiZ2V0Um9vbUlkIiwic2hvdWxkU2hvd1BpbGxBdmF0YXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJub2RlIiwicGlsbGlmaWVkIiwidGFnTmFtZSIsImluY2x1ZGVzIiwibmV4dFNpYmxpbmciLCJnZXRBdHRyaWJ1dGUiLCJocmVmIiwicGFydHMiLCJwYXJzZVBlcm1hbGluayIsImV2ZW50SWQiLCJwaWxsQ29udGFpbmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwicGlsbCIsIlJlYWN0RE9NIiwicmVuZGVyIiwicGFyZW50Tm9kZSIsInJlcGxhY2VDaGlsZCIsInB1c2giLCJub2RlVHlwZSIsIk5vZGUiLCJURVhUX05PREUiLCJwYXJlbnRFbGVtZW50IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJjdXJyZW50VGV4dE5vZGUiLCJyb29tTm90aWZUZXh0Tm9kZXMiLCJyb29tTm90aWZQb3MiLCJQaWxsIiwidGV4dENvbnRlbnQiLCJuZXh0VGV4dE5vZGUiLCJyb29tVGV4dE5vZGUiLCJzcGxpdFRleHQiLCJsZW5ndGgiLCJyb29tTm90aWZMZW4iLCJwdXNoUHJvY2Vzc29yIiwiUHVzaFByb2Nlc3NvciIsImF0Um9vbVJ1bGUiLCJnZXRQdXNoUnVsZUJ5SWQiLCJydWxlTWF0Y2hlc0V2ZW50Iiwicm9vbU5vdGlmVGV4dE5vZGUiLCJQaWxsVHlwZSIsIkF0Um9vbU1lbnRpb24iLCJjaGlsZE5vZGVzIiwidW5tb3VudFBpbGxzIiwidW5tb3VudENvbXBvbmVudEF0Tm9kZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9waWxsaWZ5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAsIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCB7IFB1c2hQcm9jZXNzb3IgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9wdXNocHJvY2Vzc29yJztcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBQaWxsLCB7IFBpbGxUeXBlIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvUGlsbFwiO1xuaW1wb3J0IHsgcGFyc2VQZXJtYWxpbmsgfSBmcm9tIFwiLi9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcblxuLyoqXG4gKiBSZWN1cnNlcyBkZXB0aC1maXJzdCB0aHJvdWdoIGEgRE9NIHRyZWUsIGNvbnZlcnRpbmcgbWF0cml4LnRvIGxpbmtzXG4gKiBpbnRvIHBpbGxzIGJhc2VkIG9uIHRoZSBjb250ZXh0IG9mIGEgZ2l2ZW4gcm9vbS4gIFJldHVybnMgYSBsaXN0IG9mXG4gKiB0aGUgcmVzdWx0aW5nIFJlYWN0IG5vZGVzIHNvIHRoZXkgY2FuIGJlIHVubW91bnRlZCByYXRoZXIgdGhhbiBsZWFraW5nLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudFtdfSBub2RlcyAtIGEgbGlzdCBvZiBzaWJsaW5nIERPTSBub2RlcyB0byB0cmF2ZXJzZSB0byB0cnlcbiAqICAgdG8gdHVybiBpbnRvIHBpbGxzLlxuICogQHBhcmFtIHtNYXRyaXhFdmVudH0gbXhFdmVudCAtIHRoZSBtYXRyaXggZXZlbnQgd2hpY2ggdGhlIERPTSBub2RlcyBhcmVcbiAqICAgcGFydCBvZiByZXByZXNlbnRpbmcuXG4gKiBAcGFyYW0ge0VsZW1lbnRbXX0gcGlsbHM6IGFuIGFjY3VtdWxhdG9yIG9mIHRoZSBET00gbm9kZXMgd2hpY2ggY29udGFpblxuICogICBSZWFjdCBjb21wb25lbnRzIHdoaWNoIGhhdmUgYmVlbiBtb3VudGVkIGFzIHBhcnQgb2YgdGhpcy5cbiAqICAgVGhlIGluaXRpYWwgY2FsbGVyIHNob3VsZCBwYXNzIGluIGFuIGVtcHR5IGFycmF5IHRvIHNlZWQgdGhlIGFjY3VtdWxhdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGlsbGlmeUxpbmtzKG5vZGVzOiBBcnJheUxpa2U8RWxlbWVudD4sIG14RXZlbnQ6IE1hdHJpeEV2ZW50LCBwaWxsczogRWxlbWVudFtdKSB7XG4gICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKG14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgIGNvbnN0IHNob3VsZFNob3dQaWxsQXZhdGFyID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIik7XG4gICAgbGV0IG5vZGUgPSBub2Rlc1swXTtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBsZXQgcGlsbGlmaWVkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gXCJQUkVcIiB8fCBub2RlLnRhZ05hbWUgPT09IFwiQ09ERVwiIHx8IHBpbGxzLmluY2x1ZGVzKG5vZGUpKSB7XG4gICAgICAgICAgICAvLyBTa2lwIGNvZGUgYmxvY2tzIGFuZCBleGlzdGluZyBwaWxsc1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmcgYXMgRWxlbWVudDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUudGFnTmFtZSA9PT0gXCJBXCIgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBocmVmID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpO1xuICAgICAgICAgICAgY29uc3QgcGFydHMgPSBwYXJzZVBlcm1hbGluayhocmVmKTtcbiAgICAgICAgICAgIC8vIElmIHRoZSBsaW5rIGlzIGEgKGxvY2FsaXNlZCkgbWF0cml4LnRvIGxpbmssIHJlcGxhY2UgaXQgd2l0aCBhIHBpbGxcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gcGlsbCBldmVudCBwZXJtYWxpbmtzLCBzbyB0aG9zZSBhcmUgaWdub3JlZC5cbiAgICAgICAgICAgIGlmIChwYXJ0cyAmJiAhcGFydHMuZXZlbnRJZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBpbGxDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwaWxsID0gPFBpbGxcbiAgICAgICAgICAgICAgICAgICAgdXJsPXtocmVmfVxuICAgICAgICAgICAgICAgICAgICBpbk1lc3NhZ2U9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgICAgIHNob3VsZFNob3dQaWxsQXZhdGFyPXtzaG91bGRTaG93UGlsbEF2YXRhcn1cbiAgICAgICAgICAgICAgICAvPjtcblxuICAgICAgICAgICAgICAgIFJlYWN0RE9NLnJlbmRlcihwaWxsLCBwaWxsQ29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHBpbGxDb250YWluZXIsIG5vZGUpO1xuICAgICAgICAgICAgICAgIHBpbGxzLnB1c2gocGlsbENvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgLy8gUGlsbHMgd2l0aGluIHBpbGxzIGFyZW4ndCBnb2luZyB0byBnbyB3ZWxsLCBzbyBtb3ZlIG9uXG4gICAgICAgICAgICAgICAgcGlsbGlmaWVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgY3VycmVudCBub2RlIHdpdGggb25lIHRoYXQncyBub3cgdGFrZW4gaXRzIHBsYWNlXG4gICAgICAgICAgICAgICAgbm9kZSA9IHBpbGxDb250YWluZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSAmJlxuICAgICAgICAgICAgLy8gYXMgYXBwbHlpbmcgcGlsbHMgaGFwcGVucyBvdXRzaWRlIG9mIHJlYWN0LCBtYWtlIHN1cmUgd2UncmUgbm90IGRvdWJseVxuICAgICAgICAgICAgLy8gYXBwbHlpbmcgQHJvb20gcGlsbHMgaGVyZSwgYXMgYSByZXJlbmRlciB3aXRoIHRoZSBzYW1lIGNvbnRlbnQgd29uJ3QgdG91Y2ggdGhlIERPTVxuICAgICAgICAgICAgLy8gdG8gY2xlYXIgdGhlIHBpbGxzIGZyb20gdGhlIGxhc3QgcnVuIG9mIHBpbGxpZnlMaW5rc1xuICAgICAgICAgICAgIW5vZGUucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJteF9BdFJvb21QaWxsXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRUZXh0Tm9kZSA9IG5vZGUgYXMgTm9kZSBhcyBUZXh0O1xuICAgICAgICAgICAgY29uc3Qgcm9vbU5vdGlmVGV4dE5vZGVzID0gW107XG5cbiAgICAgICAgICAgIC8vIFRha2UgYSB0ZXh0Tm9kZSBhbmQgYnJlYWsgaXQgdXAgdG8gbWFrZSBhbGwgdGhlIGluc3RhbmNlcyBvZiBAcm9vbSB0aGVpclxuICAgICAgICAgICAgLy8gb3duIHRleHROb2RlLCBhZGRpbmcgdGhvc2Ugbm9kZXMgdG8gcm9vbU5vdGlmVGV4dE5vZGVzXG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudFRleHROb2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbU5vdGlmUG9zID0gUGlsbC5yb29tTm90aWZQb3MoY3VycmVudFRleHROb2RlLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFRleHROb2RlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAocm9vbU5vdGlmUG9zID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvb21UZXh0Tm9kZSA9IGN1cnJlbnRUZXh0Tm9kZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocm9vbU5vdGlmUG9zID4gMCkgcm9vbVRleHROb2RlID0gcm9vbVRleHROb2RlLnNwbGl0VGV4dChyb29tTm90aWZQb3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm9vbVRleHROb2RlLnRleHRDb250ZW50Lmxlbmd0aCA+IFBpbGwucm9vbU5vdGlmTGVuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUZXh0Tm9kZSA9IHJvb21UZXh0Tm9kZS5zcGxpdFRleHQoUGlsbC5yb29tTm90aWZMZW4oKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcm9vbU5vdGlmVGV4dE5vZGVzLnB1c2gocm9vbVRleHROb2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudFRleHROb2RlID0gbmV4dFRleHROb2RlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocm9vbU5vdGlmVGV4dE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwdXNoUHJvY2Vzc29yID0gbmV3IFB1c2hQcm9jZXNzb3IoTWF0cml4Q2xpZW50UGVnLmdldCgpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhdFJvb21SdWxlID0gcHVzaFByb2Nlc3Nvci5nZXRQdXNoUnVsZUJ5SWQoXCIubS5ydWxlLnJvb21ub3RpZlwiKTtcbiAgICAgICAgICAgICAgICBpZiAoYXRSb29tUnVsZSAmJiBwdXNoUHJvY2Vzc29yLnJ1bGVNYXRjaGVzRXZlbnQoYXRSb29tUnVsZSwgbXhFdmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm93IHJlcGxhY2UgYWxsIHRob3NlIG5vZGVzIHdpdGggUGlsbHNcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCByb29tTm90aWZUZXh0Tm9kZSBvZiByb29tTm90aWZUZXh0Tm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgbmV4dCBub2RlIHRvIGJlIHByb2Nlc3NlZCB0byB0aGUgb25lIGFmdGVyIHRoZSBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBhZGRpbmcgbm93LCBzaW5jZSB3ZSd2ZSBqdXN0IGluc2VydGVkIG5vZGVzIGludG8gdGhlIHN0cnVjdHVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgaXRlcmF0aW5nIG92ZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlIHdlJ3ZlIGNoZWNrZWQgcm9vbU5vdGlmVGV4dE5vZGVzLmxlbmd0aCA+IDAgc28gd2UnbGwgZG8gdGhpcyBhdCBsZWFzdCBvbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlID0gcm9vbU5vdGlmVGV4dE5vZGUubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBpbGxDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwaWxsID0gPFBpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPXtQaWxsVHlwZS5BdFJvb21NZW50aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluTWVzc2FnZT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFNob3dQaWxsQXZhdGFyPXtzaG91bGRTaG93UGlsbEF2YXRhcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdERPTS5yZW5kZXIocGlsbCwgcGlsbENvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tTm90aWZUZXh0Tm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwaWxsQ29udGFpbmVyLCByb29tTm90aWZUZXh0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaWxscy5wdXNoKHBpbGxDb250YWluZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGhpbmcgZWxzZSB0byBkbyBmb3IgYSB0ZXh0IG5vZGUgKGFuZCB3ZSBkb24ndCBuZWVkIHRvIGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGxvb3AgcG9pbnRlciBiZWNhdXNlIHdlIGRpZCBpdCBhYm92ZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGUuY2hpbGROb2RlcyAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoICYmICFwaWxsaWZpZWQpIHtcbiAgICAgICAgICAgIHBpbGxpZnlMaW5rcyhub2RlLmNoaWxkTm9kZXMgYXMgTm9kZUxpc3RPZjxFbGVtZW50PiwgbXhFdmVudCwgcGlsbHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmcgYXMgRWxlbWVudDtcbiAgICB9XG59XG5cbi8qKlxuICogVW5tb3VudCBhbGwgdGhlIHBpbGwgY29udGFpbmVycyBmcm9tIFJlYWN0IGNyZWF0ZWQgYnkgcGlsbGlmeUxpbmtzLlxuICpcbiAqIEl0J3MgY3JpdGljYWwgdG8gY2FsbCB0aGlzIGFmdGVyIHBpbGxpZnlMaW5rcywgb3RoZXJ3aXNlXG4gKiBQaWxscyB3aWxsIGxlYWssIGxlYWtpbmcgZW50aXJlIERPTSB0cmVlcyB2aWEgdGhlIGV2ZW50XG4gKiBlbWl0dGVyIG9uIEJhc2VBdmF0YXIgYXMgcGVyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMjQxN1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudFtdfSBwaWxscyAtIGFycmF5IG9mIHBpbGwgY29udGFpbmVycyB3aG9zZSBSZWFjdFxuICogICBjb21wb25lbnRzIHNob3VsZCBiZSB1bm1vdW50ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bm1vdW50UGlsbHMocGlsbHM6IEVsZW1lbnRbXSkge1xuICAgIGZvciAoY29uc3QgcGlsbENvbnRhaW5lciBvZiBwaWxscykge1xuICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHBpbGxDb250YWluZXIpO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6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