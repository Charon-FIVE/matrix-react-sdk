"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addReplyToMessageContent = addReplyToMessageContent;
exports.getNestedReplyText = getNestedReplyText;
exports.getParentEventId = getParentEventId;
exports.makeReplyMixIn = makeReplyMixIn;
exports.shouldDisplayReply = shouldDisplayReply;
exports.stripHTMLReply = stripHTMLReply;
exports.stripPlainReply = stripPlainReply;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));

var _escapeHtml = _interopRequireDefault(require("escape-html"));

var _thread = require("matrix-js-sdk/src/models/thread");

var _event = require("matrix-js-sdk/src/@types/event");

var _beacon = require("matrix-js-sdk/src/@types/beacon");

var _HtmlUtils = require("../HtmlUtils");

var _Permalinks = require("./permalinks/Permalinks");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _location = require("./location");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function getParentEventId(ev) {
  if (!ev || ev.isRedacted()) return;

  if (ev.replyEventId) {
    return ev.replyEventId;
  }
} // Part of Replies fallback support


function stripPlainReply(body) {
  // Removes lines beginning with `> ` until you reach one that doesn't.
  const lines = body.split('\n');

  while (lines.length && lines[0].startsWith('> ')) lines.shift(); // Reply fallback has a blank line after it, so remove it to prevent leading newline


  if (lines[0] === '') lines.shift();
  return lines.join('\n');
} // Part of Replies fallback support


function stripHTMLReply(html) {
  // Sanitize the original HTML for inclusion in <mx-reply>.  We allow
  // any HTML, since the original sender could use special tags that we
  // don't recognize, but want to pass along to any recipients who do
  // recognize them -- recipients should be sanitizing before displaying
  // anyways.  However, we sanitize to 1) remove any mx-reply, so that we
  // don't generate a nested mx-reply, and 2) make sure that the HTML is
  // properly formatted (e.g. tags are closed where necessary)
  return (0, _sanitizeHtml.default)(html, {
    allowedTags: false,
    // false means allow everything
    allowedAttributes: false,
    // we somehow can't allow all schemes, so we allow all that we
    // know of and mxc (for img tags)
    allowedSchemes: [..._HtmlUtils.PERMITTED_URL_SCHEMES, 'mxc'],
    exclusiveFilter: frame => frame.tag === "mx-reply"
  });
} // Part of Replies fallback support


function getNestedReplyText(ev, permalinkCreator) {
  if (!ev) return null;
  let {
    body,
    formatted_body: html,
    msgtype
  } = ev.getContent();

  if (getParentEventId(ev)) {
    if (body) body = stripPlainReply(body);
  }

  if (!body) body = ""; // Always ensure we have a body, for reasons.

  if (html) {
    // sanitize the HTML before we put it in an <mx-reply>
    html = stripHTMLReply(html);
  } else {
    // Escape the body to use as HTML below.
    // We also run a nl2br over the result to fix the fallback representation. We do this
    // after converting the text to safe HTML to avoid user-provided BR's from being converted.
    html = (0, _escapeHtml.default)(body).replace(/\n/g, '<br/>');
  } // dev note: do not rely on `body` being safe for HTML usage below.


  const evLink = permalinkCreator.forEvent(ev.getId());
  const userLink = (0, _Permalinks.makeUserPermalink)(ev.getSender());
  const mxid = ev.getSender();

  if (_beacon.M_BEACON_INFO.matches(ev.getType())) {
    const aTheir = (0, _location.isSelfLocation)(ev.getContent()) ? "their" : "a";
    return {
      html: `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>shared ${aTheir} live location.</blockquote></mx-reply>`,
      body: `> <${mxid}> shared ${aTheir} live location.\n\n`
    };
  } // This fallback contains text that is explicitly EN.


  switch (msgtype) {
    case _event.MsgType.Text:
    case _event.MsgType.Notice:
      {
        html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>${html}</blockquote></mx-reply>`;
        const lines = body.trim().split('\n');

        if (lines.length > 0) {
          lines[0] = `<${mxid}> ${lines[0]}`;
          body = lines.map(line => `> ${line}`).join('\n') + '\n\n';
        }

        break;
      }

    case _event.MsgType.Image:
      html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>sent an image.</blockquote></mx-reply>`;
      body = `> <${mxid}> sent an image.\n\n`;
      break;

    case _event.MsgType.Video:
      html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>sent a video.</blockquote></mx-reply>`;
      body = `> <${mxid}> sent a video.\n\n`;
      break;

    case _event.MsgType.Audio:
      html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>sent an audio file.</blockquote></mx-reply>`;
      body = `> <${mxid}> sent an audio file.\n\n`;
      break;

    case _event.MsgType.File:
      html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>sent a file.</blockquote></mx-reply>`;
      body = `> <${mxid}> sent a file.\n\n`;
      break;

    case _event.MsgType.Location:
      {
        const aTheir = (0, _location.isSelfLocation)(ev.getContent()) ? "their" : "a";
        html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>shared ${aTheir} location.</blockquote></mx-reply>`;
        body = `> <${mxid}> shared ${aTheir} location.\n\n`;
        break;
      }

    case _event.MsgType.Emote:
      {
        html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> * ` + `<a href="${userLink}">${mxid}</a><br>${html}</blockquote></mx-reply>`;
        const lines = body.trim().split('\n');

        if (lines.length > 0) {
          lines[0] = `* <${mxid}> ${lines[0]}`;
          body = lines.map(line => `> ${line}`).join('\n') + '\n\n';
        }

        break;
      }

    default:
      return null;
  }

  return {
    body,
    html
  };
}

function makeReplyMixIn(ev) {
  if (!ev) return {};
  const mixin = {
    'm.in_reply_to': {
      'event_id': ev.getId()
    }
  };

  if (ev.threadRootId) {
    if (_SettingsStore.default.getValue("feature_thread")) {
      mixin.is_falling_back = false;
    } else {
      // Clients that do not offer a threading UI should behave as follows when replying, for best interaction
      // with those that do. They should set the m.in_reply_to part as usual, and then add on
      // "rel_type": "m.thread" and "event_id": "$thread_root", copying $thread_root from the replied-to event.
      const relation = ev.getRelation();
      mixin.rel_type = relation.rel_type;
      mixin.event_id = relation.event_id;
    }
  }

  return mixin;
}

function shouldDisplayReply(event) {
  if (event.isRedacted()) {
    return false;
  }

  const inReplyTo = event.getWireContent()?.["m.relates_to"]?.["m.in_reply_to"];

  if (!inReplyTo) {
    return false;
  }

  const relation = event.getRelation();

  if (_SettingsStore.default.getValue("feature_thread") && relation?.rel_type === _thread.THREAD_RELATION_TYPE.name && relation?.is_falling_back) {
    return false;
  }

  return !!inReplyTo.event_id;
}

function addReplyToMessageContent(content, replyToEvent) {
  let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    includeLegacyFallback: true
  };
  content["m.relates_to"] = _objectSpread(_objectSpread({}, content["m.relates_to"] || {}), makeReplyMixIn(replyToEvent));

  if (opts.includeLegacyFallback) {
    // Part of Replies fallback support - prepend the text we're sending with the text we're replying to
    const nestedReply = getNestedReplyText(replyToEvent, opts.permalinkCreator);

    if (nestedReply) {
      if (content.formatted_body) {
        content.formatted_body = nestedReply.html + content.formatted_body;
      }

      content.body = nestedReply.body + content.body;
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRQYXJlbnRFdmVudElkIiwiZXYiLCJpc1JlZGFjdGVkIiwicmVwbHlFdmVudElkIiwic3RyaXBQbGFpblJlcGx5IiwiYm9keSIsImxpbmVzIiwic3BsaXQiLCJsZW5ndGgiLCJzdGFydHNXaXRoIiwic2hpZnQiLCJqb2luIiwic3RyaXBIVE1MUmVwbHkiLCJodG1sIiwic2FuaXRpemVIdG1sIiwiYWxsb3dlZFRhZ3MiLCJhbGxvd2VkQXR0cmlidXRlcyIsImFsbG93ZWRTY2hlbWVzIiwiUEVSTUlUVEVEX1VSTF9TQ0hFTUVTIiwiZXhjbHVzaXZlRmlsdGVyIiwiZnJhbWUiLCJ0YWciLCJnZXROZXN0ZWRSZXBseVRleHQiLCJwZXJtYWxpbmtDcmVhdG9yIiwiZm9ybWF0dGVkX2JvZHkiLCJtc2d0eXBlIiwiZ2V0Q29udGVudCIsImVzY2FwZUh0bWwiLCJyZXBsYWNlIiwiZXZMaW5rIiwiZm9yRXZlbnQiLCJnZXRJZCIsInVzZXJMaW5rIiwibWFrZVVzZXJQZXJtYWxpbmsiLCJnZXRTZW5kZXIiLCJteGlkIiwiTV9CRUFDT05fSU5GTyIsIm1hdGNoZXMiLCJnZXRUeXBlIiwiYVRoZWlyIiwiaXNTZWxmTG9jYXRpb24iLCJNc2dUeXBlIiwiVGV4dCIsIk5vdGljZSIsInRyaW0iLCJtYXAiLCJsaW5lIiwiSW1hZ2UiLCJWaWRlbyIsIkF1ZGlvIiwiRmlsZSIsIkxvY2F0aW9uIiwiRW1vdGUiLCJtYWtlUmVwbHlNaXhJbiIsIm1peGluIiwidGhyZWFkUm9vdElkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiaXNfZmFsbGluZ19iYWNrIiwicmVsYXRpb24iLCJnZXRSZWxhdGlvbiIsInJlbF90eXBlIiwiZXZlbnRfaWQiLCJzaG91bGREaXNwbGF5UmVwbHkiLCJldmVudCIsImluUmVwbHlUbyIsImdldFdpcmVDb250ZW50IiwiVEhSRUFEX1JFTEFUSU9OX1RZUEUiLCJuYW1lIiwiYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50IiwiY29udGVudCIsInJlcGx5VG9FdmVudCIsIm9wdHMiLCJpbmNsdWRlTGVnYWN5RmFsbGJhY2siLCJuZXN0ZWRSZXBseSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9SZXBseS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgxaBpbW9uIEJyYW5kbmVyIDxzaW1vbi5icmEuYWdAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IElDb250ZW50LCBJRXZlbnRSZWxhdGlvbiwgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgc2FuaXRpemVIdG1sIGZyb20gXCJzYW5pdGl6ZS1odG1sXCI7XG5pbXBvcnQgZXNjYXBlSHRtbCBmcm9tIFwiZXNjYXBlLWh0bWxcIjtcbmltcG9ydCB7IFRIUkVBRF9SRUxBVElPTl9UWVBFIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy90aHJlYWRcIjtcbmltcG9ydCB7IE1zZ1R5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBNX0JFQUNPTl9JTkZPIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9iZWFjb25cIjtcblxuaW1wb3J0IHsgUEVSTUlUVEVEX1VSTF9TQ0hFTUVTIH0gZnJvbSBcIi4uL0h0bWxVdGlsc1wiO1xuaW1wb3J0IHsgbWFrZVVzZXJQZXJtYWxpbmssIFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSBcIi4vcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgaXNTZWxmTG9jYXRpb24gfSBmcm9tIFwiLi9sb2NhdGlvblwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyZW50RXZlbnRJZChldj86IE1hdHJpeEV2ZW50KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoIWV2IHx8IGV2LmlzUmVkYWN0ZWQoKSkgcmV0dXJuO1xuICAgIGlmIChldi5yZXBseUV2ZW50SWQpIHtcbiAgICAgICAgcmV0dXJuIGV2LnJlcGx5RXZlbnRJZDtcbiAgICB9XG59XG5cbi8vIFBhcnQgb2YgUmVwbGllcyBmYWxsYmFjayBzdXBwb3J0XG5leHBvcnQgZnVuY3Rpb24gc3RyaXBQbGFpblJlcGx5KGJvZHk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gUmVtb3ZlcyBsaW5lcyBiZWdpbm5pbmcgd2l0aCBgPiBgIHVudGlsIHlvdSByZWFjaCBvbmUgdGhhdCBkb2Vzbid0LlxuICAgIGNvbnN0IGxpbmVzID0gYm9keS5zcGxpdCgnXFxuJyk7XG4gICAgd2hpbGUgKGxpbmVzLmxlbmd0aCAmJiBsaW5lc1swXS5zdGFydHNXaXRoKCc+ICcpKSBsaW5lcy5zaGlmdCgpO1xuICAgIC8vIFJlcGx5IGZhbGxiYWNrIGhhcyBhIGJsYW5rIGxpbmUgYWZ0ZXIgaXQsIHNvIHJlbW92ZSBpdCB0byBwcmV2ZW50IGxlYWRpbmcgbmV3bGluZVxuICAgIGlmIChsaW5lc1swXSA9PT0gJycpIGxpbmVzLnNoaWZ0KCk7XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydFxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwSFRNTFJlcGx5KGh0bWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gU2FuaXRpemUgdGhlIG9yaWdpbmFsIEhUTUwgZm9yIGluY2x1c2lvbiBpbiA8bXgtcmVwbHk+LiAgV2UgYWxsb3dcbiAgICAvLyBhbnkgSFRNTCwgc2luY2UgdGhlIG9yaWdpbmFsIHNlbmRlciBjb3VsZCB1c2Ugc3BlY2lhbCB0YWdzIHRoYXQgd2VcbiAgICAvLyBkb24ndCByZWNvZ25pemUsIGJ1dCB3YW50IHRvIHBhc3MgYWxvbmcgdG8gYW55IHJlY2lwaWVudHMgd2hvIGRvXG4gICAgLy8gcmVjb2duaXplIHRoZW0gLS0gcmVjaXBpZW50cyBzaG91bGQgYmUgc2FuaXRpemluZyBiZWZvcmUgZGlzcGxheWluZ1xuICAgIC8vIGFueXdheXMuICBIb3dldmVyLCB3ZSBzYW5pdGl6ZSB0byAxKSByZW1vdmUgYW55IG14LXJlcGx5LCBzbyB0aGF0IHdlXG4gICAgLy8gZG9uJ3QgZ2VuZXJhdGUgYSBuZXN0ZWQgbXgtcmVwbHksIGFuZCAyKSBtYWtlIHN1cmUgdGhhdCB0aGUgSFRNTCBpc1xuICAgIC8vIHByb3Blcmx5IGZvcm1hdHRlZCAoZS5nLiB0YWdzIGFyZSBjbG9zZWQgd2hlcmUgbmVjZXNzYXJ5KVxuICAgIHJldHVybiBzYW5pdGl6ZUh0bWwoXG4gICAgICAgIGh0bWwsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGFsbG93ZWRUYWdzOiBmYWxzZSwgLy8gZmFsc2UgbWVhbnMgYWxsb3cgZXZlcnl0aGluZ1xuICAgICAgICAgICAgYWxsb3dlZEF0dHJpYnV0ZXM6IGZhbHNlLFxuICAgICAgICAgICAgLy8gd2Ugc29tZWhvdyBjYW4ndCBhbGxvdyBhbGwgc2NoZW1lcywgc28gd2UgYWxsb3cgYWxsIHRoYXQgd2VcbiAgICAgICAgICAgIC8vIGtub3cgb2YgYW5kIG14YyAoZm9yIGltZyB0YWdzKVxuICAgICAgICAgICAgYWxsb3dlZFNjaGVtZXM6IFsuLi5QRVJNSVRURURfVVJMX1NDSEVNRVMsICdteGMnXSxcbiAgICAgICAgICAgIGV4Y2x1c2l2ZUZpbHRlcjogKGZyYW1lKSA9PiBmcmFtZS50YWcgPT09IFwibXgtcmVwbHlcIixcbiAgICAgICAgfSxcbiAgICApO1xufVxuXG4vLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydFxuZXhwb3J0IGZ1bmN0aW9uIGdldE5lc3RlZFJlcGx5VGV4dChcbiAgICBldjogTWF0cml4RXZlbnQsXG4gICAgcGVybWFsaW5rQ3JlYXRvcjogUm9vbVBlcm1hbGlua0NyZWF0b3IsXG4pOiB7IGJvZHk6IHN0cmluZywgaHRtbDogc3RyaW5nIH0gfCBudWxsIHtcbiAgICBpZiAoIWV2KSByZXR1cm4gbnVsbDtcblxuICAgIGxldCB7IGJvZHksIGZvcm1hdHRlZF9ib2R5OiBodG1sLCBtc2d0eXBlIH0gPSBldi5nZXRDb250ZW50KCk7XG4gICAgaWYgKGdldFBhcmVudEV2ZW50SWQoZXYpKSB7XG4gICAgICAgIGlmIChib2R5KSBib2R5ID0gc3RyaXBQbGFpblJlcGx5KGJvZHkpO1xuICAgIH1cblxuICAgIGlmICghYm9keSkgYm9keSA9IFwiXCI7IC8vIEFsd2F5cyBlbnN1cmUgd2UgaGF2ZSBhIGJvZHksIGZvciByZWFzb25zLlxuXG4gICAgaWYgKGh0bWwpIHtcbiAgICAgICAgLy8gc2FuaXRpemUgdGhlIEhUTUwgYmVmb3JlIHdlIHB1dCBpdCBpbiBhbiA8bXgtcmVwbHk+XG4gICAgICAgIGh0bWwgPSBzdHJpcEhUTUxSZXBseShodG1sKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBFc2NhcGUgdGhlIGJvZHkgdG8gdXNlIGFzIEhUTUwgYmVsb3cuXG4gICAgICAgIC8vIFdlIGFsc28gcnVuIGEgbmwyYnIgb3ZlciB0aGUgcmVzdWx0IHRvIGZpeCB0aGUgZmFsbGJhY2sgcmVwcmVzZW50YXRpb24uIFdlIGRvIHRoaXNcbiAgICAgICAgLy8gYWZ0ZXIgY29udmVydGluZyB0aGUgdGV4dCB0byBzYWZlIEhUTUwgdG8gYXZvaWQgdXNlci1wcm92aWRlZCBCUidzIGZyb20gYmVpbmcgY29udmVydGVkLlxuICAgICAgICBodG1sID0gZXNjYXBlSHRtbChib2R5KS5yZXBsYWNlKC9cXG4vZywgJzxici8+Jyk7XG4gICAgfVxuXG4gICAgLy8gZGV2IG5vdGU6IGRvIG5vdCByZWx5IG9uIGBib2R5YCBiZWluZyBzYWZlIGZvciBIVE1MIHVzYWdlIGJlbG93LlxuXG4gICAgY29uc3QgZXZMaW5rID0gcGVybWFsaW5rQ3JlYXRvci5mb3JFdmVudChldi5nZXRJZCgpKTtcbiAgICBjb25zdCB1c2VyTGluayA9IG1ha2VVc2VyUGVybWFsaW5rKGV2LmdldFNlbmRlcigpKTtcbiAgICBjb25zdCBteGlkID0gZXYuZ2V0U2VuZGVyKCk7XG5cbiAgICBpZiAoTV9CRUFDT05fSU5GTy5tYXRjaGVzKGV2LmdldFR5cGUoKSkpIHtcbiAgICAgICAgY29uc3QgYVRoZWlyID0gaXNTZWxmTG9jYXRpb24oZXYuZ2V0Q29udGVudCgpKSA/IFwidGhlaXJcIiA6IFwiYVwiO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaHRtbDogYDxteC1yZXBseT48YmxvY2txdW90ZT48YSBocmVmPVwiJHtldkxpbmt9XCI+SW4gcmVwbHkgdG88L2E+IDxhIGhyZWY9XCIke3VzZXJMaW5rfVwiPiR7bXhpZH08L2E+YFxuICAgICAgICAgICAgKyBgPGJyPnNoYXJlZCAke2FUaGVpcn0gbGl2ZSBsb2NhdGlvbi48L2Jsb2NrcXVvdGU+PC9teC1yZXBseT5gLFxuICAgICAgICAgICAgYm9keTogYD4gPCR7bXhpZH0+IHNoYXJlZCAke2FUaGVpcn0gbGl2ZSBsb2NhdGlvbi5cXG5cXG5gLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRoaXMgZmFsbGJhY2sgY29udGFpbnMgdGV4dCB0aGF0IGlzIGV4cGxpY2l0bHkgRU4uXG4gICAgc3dpdGNoIChtc2d0eXBlKSB7XG4gICAgICAgIGNhc2UgTXNnVHlwZS5UZXh0OlxuICAgICAgICBjYXNlIE1zZ1R5cGUuTm90aWNlOiB7XG4gICAgICAgICAgICBodG1sID0gYDxteC1yZXBseT48YmxvY2txdW90ZT48YSBocmVmPVwiJHtldkxpbmt9XCI+SW4gcmVwbHkgdG88L2E+IDxhIGhyZWY9XCIke3VzZXJMaW5rfVwiPiR7bXhpZH08L2E+YFxuICAgICAgICAgICAgICAgICsgYDxicj4ke2h0bWx9PC9ibG9ja3F1b3RlPjwvbXgtcmVwbHk+YDtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gYm9keS50cmltKCkuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsaW5lc1swXSA9IGA8JHtteGlkfT4gJHtsaW5lc1swXX1gO1xuICAgICAgICAgICAgICAgIGJvZHkgPSBsaW5lcy5tYXAoKGxpbmUpID0+IGA+ICR7bGluZX1gKS5qb2luKCdcXG4nKSArICdcXG5cXG4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBNc2dUeXBlLkltYWdlOlxuICAgICAgICAgICAgaHRtbCA9IGA8bXgtcmVwbHk+PGJsb2NrcXVvdGU+PGEgaHJlZj1cIiR7ZXZMaW5rfVwiPkluIHJlcGx5IHRvPC9hPiA8YSBocmVmPVwiJHt1c2VyTGlua31cIj4ke214aWR9PC9hPmBcbiAgICAgICAgICAgICAgICArIGA8YnI+c2VudCBhbiBpbWFnZS48L2Jsb2NrcXVvdGU+PC9teC1yZXBseT5gO1xuICAgICAgICAgICAgYm9keSA9IGA+IDwke214aWR9PiBzZW50IGFuIGltYWdlLlxcblxcbmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNc2dUeXBlLlZpZGVvOlxuICAgICAgICAgICAgaHRtbCA9IGA8bXgtcmVwbHk+PGJsb2NrcXVvdGU+PGEgaHJlZj1cIiR7ZXZMaW5rfVwiPkluIHJlcGx5IHRvPC9hPiA8YSBocmVmPVwiJHt1c2VyTGlua31cIj4ke214aWR9PC9hPmBcbiAgICAgICAgICAgICAgICArIGA8YnI+c2VudCBhIHZpZGVvLjwvYmxvY2txdW90ZT48L214LXJlcGx5PmA7XG4gICAgICAgICAgICBib2R5ID0gYD4gPCR7bXhpZH0+IHNlbnQgYSB2aWRlby5cXG5cXG5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTXNnVHlwZS5BdWRpbzpcbiAgICAgICAgICAgIGh0bWwgPSBgPG14LXJlcGx5PjxibG9ja3F1b3RlPjxhIGhyZWY9XCIke2V2TGlua31cIj5JbiByZXBseSB0bzwvYT4gPGEgaHJlZj1cIiR7dXNlckxpbmt9XCI+JHtteGlkfTwvYT5gXG4gICAgICAgICAgICAgICAgKyBgPGJyPnNlbnQgYW4gYXVkaW8gZmlsZS48L2Jsb2NrcXVvdGU+PC9teC1yZXBseT5gO1xuICAgICAgICAgICAgYm9keSA9IGA+IDwke214aWR9PiBzZW50IGFuIGF1ZGlvIGZpbGUuXFxuXFxuYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1zZ1R5cGUuRmlsZTpcbiAgICAgICAgICAgIGh0bWwgPSBgPG14LXJlcGx5PjxibG9ja3F1b3RlPjxhIGhyZWY9XCIke2V2TGlua31cIj5JbiByZXBseSB0bzwvYT4gPGEgaHJlZj1cIiR7dXNlckxpbmt9XCI+JHtteGlkfTwvYT5gXG4gICAgICAgICAgICAgICAgKyBgPGJyPnNlbnQgYSBmaWxlLjwvYmxvY2txdW90ZT48L214LXJlcGx5PmA7XG4gICAgICAgICAgICBib2R5ID0gYD4gPCR7bXhpZH0+IHNlbnQgYSBmaWxlLlxcblxcbmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNc2dUeXBlLkxvY2F0aW9uOiB7XG4gICAgICAgICAgICBjb25zdCBhVGhlaXIgPSBpc1NlbGZMb2NhdGlvbihldi5nZXRDb250ZW50KCkpID8gXCJ0aGVpclwiIDogXCJhXCI7XG4gICAgICAgICAgICBodG1sID0gYDxteC1yZXBseT48YmxvY2txdW90ZT48YSBocmVmPVwiJHtldkxpbmt9XCI+SW4gcmVwbHkgdG88L2E+IDxhIGhyZWY9XCIke3VzZXJMaW5rfVwiPiR7bXhpZH08L2E+YFxuICAgICAgICAgICAgKyBgPGJyPnNoYXJlZCAke2FUaGVpcn0gbG9jYXRpb24uPC9ibG9ja3F1b3RlPjwvbXgtcmVwbHk+YDtcbiAgICAgICAgICAgIGJvZHkgPSBgPiA8JHtteGlkfT4gc2hhcmVkICR7YVRoZWlyfSBsb2NhdGlvbi5cXG5cXG5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBNc2dUeXBlLkVtb3RlOiB7XG4gICAgICAgICAgICBodG1sID0gYDxteC1yZXBseT48YmxvY2txdW90ZT48YSBocmVmPVwiJHtldkxpbmt9XCI+SW4gcmVwbHkgdG88L2E+ICogYFxuICAgICAgICAgICAgICAgICsgYDxhIGhyZWY9XCIke3VzZXJMaW5rfVwiPiR7bXhpZH08L2E+PGJyPiR7aHRtbH08L2Jsb2NrcXVvdGU+PC9teC1yZXBseT5gO1xuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBib2R5LnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICBpZiAobGluZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxpbmVzWzBdID0gYCogPCR7bXhpZH0+ICR7bGluZXNbMF19YDtcbiAgICAgICAgICAgICAgICBib2R5ID0gbGluZXMubWFwKChsaW5lKSA9PiBgPiAke2xpbmV9YCkuam9pbignXFxuJykgKyAnXFxuXFxuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4geyBib2R5LCBodG1sIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUmVwbHlNaXhJbihldj86IE1hdHJpeEV2ZW50KTogSUV2ZW50UmVsYXRpb24ge1xuICAgIGlmICghZXYpIHJldHVybiB7fTtcblxuICAgIGNvbnN0IG1peGluOiBJRXZlbnRSZWxhdGlvbiA9IHtcbiAgICAgICAgJ20uaW5fcmVwbHlfdG8nOiB7XG4gICAgICAgICAgICAnZXZlbnRfaWQnOiBldi5nZXRJZCgpLFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBpZiAoZXYudGhyZWFkUm9vdElkKSB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIikpIHtcbiAgICAgICAgICAgIG1peGluLmlzX2ZhbGxpbmdfYmFjayA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQ2xpZW50cyB0aGF0IGRvIG5vdCBvZmZlciBhIHRocmVhZGluZyBVSSBzaG91bGQgYmVoYXZlIGFzIGZvbGxvd3Mgd2hlbiByZXBseWluZywgZm9yIGJlc3QgaW50ZXJhY3Rpb25cbiAgICAgICAgICAgIC8vIHdpdGggdGhvc2UgdGhhdCBkby4gVGhleSBzaG91bGQgc2V0IHRoZSBtLmluX3JlcGx5X3RvIHBhcnQgYXMgdXN1YWwsIGFuZCB0aGVuIGFkZCBvblxuICAgICAgICAgICAgLy8gXCJyZWxfdHlwZVwiOiBcIm0udGhyZWFkXCIgYW5kIFwiZXZlbnRfaWRcIjogXCIkdGhyZWFkX3Jvb3RcIiwgY29weWluZyAkdGhyZWFkX3Jvb3QgZnJvbSB0aGUgcmVwbGllZC10byBldmVudC5cbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gZXYuZ2V0UmVsYXRpb24oKTtcbiAgICAgICAgICAgIG1peGluLnJlbF90eXBlID0gcmVsYXRpb24ucmVsX3R5cGU7XG4gICAgICAgICAgICBtaXhpbi5ldmVudF9pZCA9IHJlbGF0aW9uLmV2ZW50X2lkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1peGluO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkRGlzcGxheVJlcGx5KGV2ZW50OiBNYXRyaXhFdmVudCk6IGJvb2xlYW4ge1xuICAgIGlmIChldmVudC5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGluUmVwbHlUbyA9IGV2ZW50LmdldFdpcmVDb250ZW50KCk/LltcIm0ucmVsYXRlc190b1wiXT8uW1wibS5pbl9yZXBseV90b1wiXTtcbiAgICBpZiAoIWluUmVwbHlUbykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXRpb24gPSBldmVudC5nZXRSZWxhdGlvbigpO1xuICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIikgJiZcbiAgICAgICAgcmVsYXRpb24/LnJlbF90eXBlID09PSBUSFJFQURfUkVMQVRJT05fVFlQRS5uYW1lICYmXG4gICAgICAgIHJlbGF0aW9uPy5pc19mYWxsaW5nX2JhY2tcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiAhIWluUmVwbHlUby5ldmVudF9pZDtcbn1cblxuaW50ZXJmYWNlIElBZGRSZXBseU9wdHMge1xuICAgIHBlcm1hbGlua0NyZWF0b3I/OiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbiAgICBpbmNsdWRlTGVnYWN5RmFsbGJhY2s/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50KFxuICAgIGNvbnRlbnQ6IElDb250ZW50LFxuICAgIHJlcGx5VG9FdmVudDogTWF0cml4RXZlbnQsXG4gICAgb3B0czogSUFkZFJlcGx5T3B0cyA9IHtcbiAgICAgICAgaW5jbHVkZUxlZ2FjeUZhbGxiYWNrOiB0cnVlLFxuICAgIH0sXG4pOiB2b2lkIHtcbiAgICBjb250ZW50W1wibS5yZWxhdGVzX3RvXCJdID0ge1xuICAgICAgICAuLi4oY29udGVudFtcIm0ucmVsYXRlc190b1wiXSB8fCB7fSksXG4gICAgICAgIC4uLm1ha2VSZXBseU1peEluKHJlcGx5VG9FdmVudCksXG4gICAgfTtcblxuICAgIGlmIChvcHRzLmluY2x1ZGVMZWdhY3lGYWxsYmFjaykge1xuICAgICAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydCAtIHByZXBlbmQgdGhlIHRleHQgd2UncmUgc2VuZGluZyB3aXRoIHRoZSB0ZXh0IHdlJ3JlIHJlcGx5aW5nIHRvXG4gICAgICAgIGNvbnN0IG5lc3RlZFJlcGx5ID0gZ2V0TmVzdGVkUmVwbHlUZXh0KHJlcGx5VG9FdmVudCwgb3B0cy5wZXJtYWxpbmtDcmVhdG9yKTtcbiAgICAgICAgaWYgKG5lc3RlZFJlcGx5KSB7XG4gICAgICAgICAgICBpZiAoY29udGVudC5mb3JtYXR0ZWRfYm9keSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQuZm9ybWF0dGVkX2JvZHkgPSBuZXN0ZWRSZXBseS5odG1sICsgY29udGVudC5mb3JtYXR0ZWRfYm9keTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRlbnQuYm9keSA9IG5lc3RlZFJlcGx5LmJvZHkgKyBjb250ZW50LmJvZHk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFTyxTQUFTQSxnQkFBVCxDQUEwQkMsRUFBMUIsRUFBZ0U7RUFDbkUsSUFBSSxDQUFDQSxFQUFELElBQU9BLEVBQUUsQ0FBQ0MsVUFBSCxFQUFYLEVBQTRCOztFQUM1QixJQUFJRCxFQUFFLENBQUNFLFlBQVAsRUFBcUI7SUFD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