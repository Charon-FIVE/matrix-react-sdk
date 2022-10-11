"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.containsEmote = containsEmote;
exports.htmlSerializeFromMdIfNeeded = htmlSerializeFromMdIfNeeded;
exports.htmlSerializeIfNeeded = htmlSerializeIfNeeded;
exports.mdSerialize = mdSerialize;
exports.startsWith = startsWith;
exports.stripEmoteCommand = stripEmoteCommand;
exports.stripPrefix = stripPrefix;
exports.textSerialize = textSerialize;
exports.unescapeMessage = unescapeMessage;

var _htmlEntities = require("html-entities");

var _cheerio = _interopRequireDefault(require("cheerio"));

var _escapeHtml = _interopRequireDefault(require("escape-html"));

var _Markdown = _interopRequireDefault(require("../Markdown"));

var _Permalinks = require("../utils/permalinks/Permalinks");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _parts = require("./parts");

/*
Copyright 2019 New Vector Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
function mdSerialize(model) {
  return model.parts.reduce((html, part) => {
    switch (part.type) {
      case _parts.Type.Newline:
        return html + "\n";

      case _parts.Type.Plain:
      case _parts.Type.Emoji:
      case _parts.Type.Command:
      case _parts.Type.PillCandidate:
      case _parts.Type.AtRoomPill:
        return html + part.text;

      case _parts.Type.RoomPill:
        // Here we use the resourceId for compatibility with non-rich text clients
        // See https://github.com/vector-im/element-web/issues/16660
        return html + `[${part.resourceId.replace(/[[\\\]]/g, c => "\\" + c)}](${(0, _Permalinks.makeGenericPermalink)(part.resourceId)})`;

      case _parts.Type.UserPill:
        return html + `[${part.text.replace(/[[\\\]]/g, c => "\\" + c)}](${(0, _Permalinks.makeGenericPermalink)(part.resourceId)})`;
    }
  }, "");
}

function htmlSerializeIfNeeded(model) {
  let {
    forceHTML = false,
    useMarkdown = true
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!useMarkdown) {
    return (0, _escapeHtml.default)(textSerialize(model)).replace(/\n/g, '<br/>');
  }

  const md = mdSerialize(model);
  return htmlSerializeFromMdIfNeeded(md, {
    forceHTML
  });
}

function htmlSerializeFromMdIfNeeded(md) {
  let {
    forceHTML = false
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // copy of raw input to remove unwanted math later
  const orig = md;

  if (_SettingsStore.default.getValue("feature_latex_maths")) {
    const patternNames = ['tex', 'latex'];
    const patternTypes = ['display', 'inline'];
    const patternDefaults = {
      "tex": {
        // detect math with tex delimiters, inline: $...$, display $$...$$
        // preferably use negative lookbehinds, not supported in all major browsers:
        // const displayPattern = "^(?<!\\\\)\\$\\$(?![ \\t])(([^$]|\\\\\\$)+?)\\$\\$$";
        // const inlinePattern = "(?:^|\\s)(?<!\\\\)\\$(?!\\s)(([^$]|\\\\\\$)+?)(?<!\\\\|\\s)\\$";
        // conditions for display math detection $$...$$:
        // - pattern starts and ends on a new line
        // - left delimiter ($$) is not escaped by backslash
        "display": "(^)\\$\\$(([^$]|\\\\\\$)+?)\\$\\$$",
        // conditions for inline math detection $...$:
        // - pattern starts at beginning of line, follows whitespace character or punctuation
        // - pattern is on a single line
        // - left and right delimiters ($) are not escaped by backslashes
        // - left delimiter is not followed by whitespace character
        // - right delimiter is not prefixed with whitespace character
        "inline": "(^|\\s|[.,!?:;])(?!\\\\)\\$(?!\\s)(([^$\\n]|\\\\\\$)*([^\\\\\\s\\$]|\\\\\\$)(?:\\\\\\$)?)\\$"
      },
      "latex": {
        // detect math with latex delimiters, inline: \(...\), display \[...\]
        // conditions for display math detection \[...\]:
        // - pattern starts and ends on a new line
        // - pattern is not empty
        "display": "(^)\\\\\\[(?!\\\\\\])(.*?)\\\\\\]$",
        // conditions for inline math detection \(...\):
        // - pattern starts at beginning of line or is not prefixed with backslash
        // - pattern is not empty
        "inline": "(^|[^\\\\])\\\\\\((?!\\\\\\))(.*?)\\\\\\)"
      }
    };
    patternNames.forEach(function (patternName) {
      patternTypes.forEach(function (patternType) {
        // get the regex replace pattern from config or use the default
        const pattern = (((_SdkConfig.default.get("latex_maths_delims") || {})[patternType] || {})["pattern"] || {})[patternName] || patternDefaults[patternName][patternType];
        md = md.replace(RegExp(pattern, "gms"), function (m, p1, p2) {
          const p2e = _htmlEntities.AllHtmlEntities.encode(p2);

          switch (patternType) {
            case "display":
              return `${p1}<div data-mx-maths="${p2e}">\n\n</div>\n\n`;

            case "inline":
              return `${p1}<span data-mx-maths="${p2e}"></span>`;
          }
        });
      });
    }); // make sure div tags always start on a new line, otherwise it will confuse
    // the markdown parser

    md = md.replace(/(.)<div/g, function (m, p1) {
      return `${p1}\n<div`;
    });
  }

  const parser = new _Markdown.default(md);

  if (!parser.isPlainText() || forceHTML) {
    // feed Markdown output to HTML parser
    const phtml = _cheerio.default.load(parser.toHTML(), {
      // @ts-ignore: The `_useHtmlParser2` internal option is the
      // simplest way to both parse and render using `htmlparser2`.
      _useHtmlParser2: true,
      decodeEntities: false
    });

    if (_SettingsStore.default.getValue("feature_latex_maths")) {
      // original Markdown without LaTeX replacements
      const parserOrig = new _Markdown.default(orig);

      const phtmlOrig = _cheerio.default.load(parserOrig.toHTML(), {
        // @ts-ignore: The `_useHtmlParser2` internal option is the
        // simplest way to both parse and render using `htmlparser2`.
        _useHtmlParser2: true,
        decodeEntities: false
      }); // since maths delimiters are handled before Markdown,
      // code blocks could contain mangled content.
      // replace code blocks with original content


      phtmlOrig('code').each(function (i) {
        phtml('code').eq(i).text(phtmlOrig('code').eq(i).text());
      }); // add fallback output for latex math, which should not be interpreted as markdown

      phtml('div, span').each(function (i, e) {
        const tex = phtml(e).attr('data-mx-maths');

        if (tex) {
          phtml(e).html(`<code>${tex}</code>`);
        }
      });
    }

    return phtml.html();
  } // ensure removal of escape backslashes in non-Markdown messages


  if (md.indexOf("\\") > -1) {
    return parser.toPlaintext();
  }
}

function textSerialize(model) {
  return model.parts.reduce((text, part) => {
    switch (part.type) {
      case _parts.Type.Newline:
        return text + "\n";

      case _parts.Type.Plain:
      case _parts.Type.Emoji:
      case _parts.Type.Command:
      case _parts.Type.PillCandidate:
      case _parts.Type.AtRoomPill:
        return text + part.text;

      case _parts.Type.RoomPill:
        // Here we use the resourceId for compatibility with non-rich text clients
        // See https://github.com/vector-im/element-web/issues/16660
        return text + `${part.resourceId}`;

      case _parts.Type.UserPill:
        return text + `${part.text}`;
    }
  }, "");
}

function containsEmote(model) {
  const hasCommand = startsWith(model, "/me ", false);
  const hasArgument = model.parts[0]?.text?.length > 4 || model.parts.length > 1;
  return hasCommand && hasArgument;
}

function startsWith(model, prefix) {
  let caseSensitive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  const firstPart = model.parts[0]; // part type will be "plain" while editing,
  // and "command" while composing a message.

  let text = firstPart?.text || '';

  if (!caseSensitive) {
    prefix = prefix.toLowerCase();
    text = text.toLowerCase();
  }

  return firstPart && (firstPart.type === _parts.Type.Plain || firstPart.type === _parts.Type.Command) && text.startsWith(prefix);
}

function stripEmoteCommand(model) {
  // trim "/me "
  return stripPrefix(model, "/me ");
}

function stripPrefix(model, prefix) {
  model = model.clone();
  model.removeText({
    index: 0,
    offset: 0
  }, prefix.length);
  return model;
}

function unescapeMessage(model) {
  const {
    parts
  } = model;

  if (parts.length) {
    const firstPart = parts[0]; // only unescape \/ to / at start of editor

    if (firstPart.type === _parts.Type.Plain && firstPart.text.startsWith("\\/")) {
      model = model.clone();
      model.removeText({
        index: 0,
        offset: 0
      }, 1);
    }
  }

  return model;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZFNlcmlhbGl6ZSIsIm1vZGVsIiwicGFydHMiLCJyZWR1Y2UiLCJodG1sIiwicGFydCIsInR5cGUiLCJUeXBlIiwiTmV3bGluZSIsIlBsYWluIiwiRW1vamkiLCJDb21tYW5kIiwiUGlsbENhbmRpZGF0ZSIsIkF0Um9vbVBpbGwiLCJ0ZXh0IiwiUm9vbVBpbGwiLCJyZXNvdXJjZUlkIiwicmVwbGFjZSIsImMiLCJtYWtlR2VuZXJpY1Blcm1hbGluayIsIlVzZXJQaWxsIiwiaHRtbFNlcmlhbGl6ZUlmTmVlZGVkIiwiZm9yY2VIVE1MIiwidXNlTWFya2Rvd24iLCJlc2NhcGVIdG1sIiwidGV4dFNlcmlhbGl6ZSIsIm1kIiwiaHRtbFNlcmlhbGl6ZUZyb21NZElmTmVlZGVkIiwib3JpZyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsInBhdHRlcm5OYW1lcyIsInBhdHRlcm5UeXBlcyIsInBhdHRlcm5EZWZhdWx0cyIsImZvckVhY2giLCJwYXR0ZXJuTmFtZSIsInBhdHRlcm5UeXBlIiwicGF0dGVybiIsIlNka0NvbmZpZyIsImdldCIsIlJlZ0V4cCIsIm0iLCJwMSIsInAyIiwicDJlIiwiQWxsSHRtbEVudGl0aWVzIiwiZW5jb2RlIiwicGFyc2VyIiwiTWFya2Rvd24iLCJpc1BsYWluVGV4dCIsInBodG1sIiwiY2hlZXJpbyIsImxvYWQiLCJ0b0hUTUwiLCJfdXNlSHRtbFBhcnNlcjIiLCJkZWNvZGVFbnRpdGllcyIsInBhcnNlck9yaWciLCJwaHRtbE9yaWciLCJlYWNoIiwiaSIsImVxIiwiZSIsInRleCIsImF0dHIiLCJpbmRleE9mIiwidG9QbGFpbnRleHQiLCJjb250YWluc0Vtb3RlIiwiaGFzQ29tbWFuZCIsInN0YXJ0c1dpdGgiLCJoYXNBcmd1bWVudCIsImxlbmd0aCIsInByZWZpeCIsImNhc2VTZW5zaXRpdmUiLCJmaXJzdFBhcnQiLCJ0b0xvd2VyQ2FzZSIsInN0cmlwRW1vdGVDb21tYW5kIiwic3RyaXBQcmVmaXgiLCJjbG9uZSIsInJlbW92ZVRleHQiLCJpbmRleCIsIm9mZnNldCIsInVuZXNjYXBlTWVzc2FnZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3Ivc2VyaWFsaXplLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBBbGxIdG1sRW50aXRpZXMgfSBmcm9tICdodG1sLWVudGl0aWVzJztcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nO1xuaW1wb3J0IGVzY2FwZUh0bWwgZnJvbSBcImVzY2FwZS1odG1sXCI7XG5cbmltcG9ydCBNYXJrZG93biBmcm9tICcuLi9NYXJrZG93bic7XG5pbXBvcnQgeyBtYWtlR2VuZXJpY1Blcm1hbGluayB9IGZyb20gXCIuLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCBFZGl0b3JNb2RlbCBmcm9tIFwiLi9tb2RlbFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZSc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgeyBUeXBlIH0gZnJvbSAnLi9wYXJ0cyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtZFNlcmlhbGl6ZShtb2RlbDogRWRpdG9yTW9kZWwpOiBzdHJpbmcge1xuICAgIHJldHVybiBtb2RlbC5wYXJ0cy5yZWR1Y2UoKGh0bWwsIHBhcnQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXJ0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5OZXdsaW5lOlxuICAgICAgICAgICAgICAgIHJldHVybiBodG1sICsgXCJcXG5cIjtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5QbGFpbjpcbiAgICAgICAgICAgIGNhc2UgVHlwZS5FbW9qaTpcbiAgICAgICAgICAgIGNhc2UgVHlwZS5Db21tYW5kOlxuICAgICAgICAgICAgY2FzZSBUeXBlLlBpbGxDYW5kaWRhdGU6XG4gICAgICAgICAgICBjYXNlIFR5cGUuQXRSb29tUGlsbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbCArIHBhcnQudGV4dDtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5Sb29tUGlsbDpcbiAgICAgICAgICAgICAgICAvLyBIZXJlIHdlIHVzZSB0aGUgcmVzb3VyY2VJZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1yaWNoIHRleHQgY2xpZW50c1xuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNjY2MFxuICAgICAgICAgICAgICAgIHJldHVybiBodG1sICtcbiAgICAgICAgICAgICAgICAgICAgYFske3BhcnQucmVzb3VyY2VJZC5yZXBsYWNlKC9bW1xcXFxcXF1dL2csIGMgPT4gXCJcXFxcXCIgKyBjKX1dKCR7bWFrZUdlbmVyaWNQZXJtYWxpbmsocGFydC5yZXNvdXJjZUlkKX0pYDtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5Vc2VyUGlsbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbCArXG4gICAgICAgICAgICAgICAgICAgIGBbJHtwYXJ0LnRleHQucmVwbGFjZSgvW1tcXFxcXFxdXS9nLCBjID0+IFwiXFxcXFwiICsgYyl9XSgke21ha2VHZW5lcmljUGVybWFsaW5rKHBhcnQucmVzb3VyY2VJZCl9KWA7XG4gICAgICAgIH1cbiAgICB9LCBcIlwiKTtcbn1cblxuaW50ZXJmYWNlIElTZXJpYWxpemVPcHRzIHtcbiAgICBmb3JjZUhUTUw/OiBib29sZWFuO1xuICAgIHVzZU1hcmtkb3duPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh0bWxTZXJpYWxpemVJZk5lZWRlZChcbiAgICBtb2RlbDogRWRpdG9yTW9kZWwsXG4gICAgeyBmb3JjZUhUTUwgPSBmYWxzZSwgdXNlTWFya2Rvd24gPSB0cnVlIH06IElTZXJpYWxpemVPcHRzID0ge30sXG4pOiBzdHJpbmcge1xuICAgIGlmICghdXNlTWFya2Rvd24pIHtcbiAgICAgICAgcmV0dXJuIGVzY2FwZUh0bWwodGV4dFNlcmlhbGl6ZShtb2RlbCkpLnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZCA9IG1kU2VyaWFsaXplKG1vZGVsKTtcbiAgICByZXR1cm4gaHRtbFNlcmlhbGl6ZUZyb21NZElmTmVlZGVkKG1kLCB7IGZvcmNlSFRNTCB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh0bWxTZXJpYWxpemVGcm9tTWRJZk5lZWRlZChtZDogc3RyaW5nLCB7IGZvcmNlSFRNTCA9IGZhbHNlIH0gPSB7fSk6IHN0cmluZyB7XG4gICAgLy8gY29weSBvZiByYXcgaW5wdXQgdG8gcmVtb3ZlIHVud2FudGVkIG1hdGggbGF0ZXJcbiAgICBjb25zdCBvcmlnID0gbWQ7XG5cbiAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfbGF0ZXhfbWF0aHNcIikpIHtcbiAgICAgICAgY29uc3QgcGF0dGVybk5hbWVzID0gWyd0ZXgnLCAnbGF0ZXgnXTtcbiAgICAgICAgY29uc3QgcGF0dGVyblR5cGVzID0gWydkaXNwbGF5JywgJ2lubGluZSddO1xuICAgICAgICBjb25zdCBwYXR0ZXJuRGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBcInRleFwiOiB7XG4gICAgICAgICAgICAgICAgLy8gZGV0ZWN0IG1hdGggd2l0aCB0ZXggZGVsaW1pdGVycywgaW5saW5lOiAkLi4uJCwgZGlzcGxheSAkJC4uLiQkXG4gICAgICAgICAgICAgICAgLy8gcHJlZmVyYWJseSB1c2UgbmVnYXRpdmUgbG9va2JlaGluZHMsIG5vdCBzdXBwb3J0ZWQgaW4gYWxsIG1ham9yIGJyb3dzZXJzOlxuICAgICAgICAgICAgICAgIC8vIGNvbnN0IGRpc3BsYXlQYXR0ZXJuID0gXCJeKD88IVxcXFxcXFxcKVxcXFwkXFxcXCQoPyFbIFxcXFx0XSkoKFteJF18XFxcXFxcXFxcXFxcJCkrPylcXFxcJFxcXFwkJFwiO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IGlubGluZVBhdHRlcm4gPSBcIig/Ol58XFxcXHMpKD88IVxcXFxcXFxcKVxcXFwkKD8hXFxcXHMpKChbXiRdfFxcXFxcXFxcXFxcXCQpKz8pKD88IVxcXFxcXFxcfFxcXFxzKVxcXFwkXCI7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25kaXRpb25zIGZvciBkaXNwbGF5IG1hdGggZGV0ZWN0aW9uICQkLi4uJCQ6XG4gICAgICAgICAgICAgICAgLy8gLSBwYXR0ZXJuIHN0YXJ0cyBhbmQgZW5kcyBvbiBhIG5ldyBsaW5lXG4gICAgICAgICAgICAgICAgLy8gLSBsZWZ0IGRlbGltaXRlciAoJCQpIGlzIG5vdCBlc2NhcGVkIGJ5IGJhY2tzbGFzaFxuICAgICAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcIiheKVxcXFwkXFxcXCQoKFteJF18XFxcXFxcXFxcXFxcJCkrPylcXFxcJFxcXFwkJFwiLFxuXG4gICAgICAgICAgICAgICAgLy8gY29uZGl0aW9ucyBmb3IgaW5saW5lIG1hdGggZGV0ZWN0aW9uICQuLi4kOlxuICAgICAgICAgICAgICAgIC8vIC0gcGF0dGVybiBzdGFydHMgYXQgYmVnaW5uaW5nIG9mIGxpbmUsIGZvbGxvd3Mgd2hpdGVzcGFjZSBjaGFyYWN0ZXIgb3IgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICAvLyAtIHBhdHRlcm4gaXMgb24gYSBzaW5nbGUgbGluZVxuICAgICAgICAgICAgICAgIC8vIC0gbGVmdCBhbmQgcmlnaHQgZGVsaW1pdGVycyAoJCkgYXJlIG5vdCBlc2NhcGVkIGJ5IGJhY2tzbGFzaGVzXG4gICAgICAgICAgICAgICAgLy8gLSBsZWZ0IGRlbGltaXRlciBpcyBub3QgZm9sbG93ZWQgYnkgd2hpdGVzcGFjZSBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAvLyAtIHJpZ2h0IGRlbGltaXRlciBpcyBub3QgcHJlZml4ZWQgd2l0aCB3aGl0ZXNwYWNlIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIFwiaW5saW5lXCI6XG4gICAgICAgICAgICAgICAgICAgIFwiKF58XFxcXHN8Wy4sIT86O10pKD8hXFxcXFxcXFwpXFxcXCQoPyFcXFxccykoKFteJFxcXFxuXXxcXFxcXFxcXFxcXFwkKSooW15cXFxcXFxcXFxcXFxzXFxcXCRdfFxcXFxcXFxcXFxcXCQpKD86XFxcXFxcXFxcXFxcJCk/KVxcXFwkXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJsYXRleFwiOiB7XG4gICAgICAgICAgICAgICAgLy8gZGV0ZWN0IG1hdGggd2l0aCBsYXRleCBkZWxpbWl0ZXJzLCBpbmxpbmU6IFxcKC4uLlxcKSwgZGlzcGxheSBcXFsuLi5cXF1cblxuICAgICAgICAgICAgICAgIC8vIGNvbmRpdGlvbnMgZm9yIGRpc3BsYXkgbWF0aCBkZXRlY3Rpb24gXFxbLi4uXFxdOlxuICAgICAgICAgICAgICAgIC8vIC0gcGF0dGVybiBzdGFydHMgYW5kIGVuZHMgb24gYSBuZXcgbGluZVxuICAgICAgICAgICAgICAgIC8vIC0gcGF0dGVybiBpcyBub3QgZW1wdHlcbiAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogXCIoXilcXFxcXFxcXFxcXFxbKD8hXFxcXFxcXFxcXFxcXSkoLio/KVxcXFxcXFxcXFxcXF0kXCIsXG5cbiAgICAgICAgICAgICAgICAvLyBjb25kaXRpb25zIGZvciBpbmxpbmUgbWF0aCBkZXRlY3Rpb24gXFwoLi4uXFwpOlxuICAgICAgICAgICAgICAgIC8vIC0gcGF0dGVybiBzdGFydHMgYXQgYmVnaW5uaW5nIG9mIGxpbmUgb3IgaXMgbm90IHByZWZpeGVkIHdpdGggYmFja3NsYXNoXG4gICAgICAgICAgICAgICAgLy8gLSBwYXR0ZXJuIGlzIG5vdCBlbXB0eVxuICAgICAgICAgICAgICAgIFwiaW5saW5lXCI6IFwiKF58W15cXFxcXFxcXF0pXFxcXFxcXFxcXFxcKCg/IVxcXFxcXFxcXFxcXCkpKC4qPylcXFxcXFxcXFxcXFwpXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHBhdHRlcm5OYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKHBhdHRlcm5OYW1lKSB7XG4gICAgICAgICAgICBwYXR0ZXJuVHlwZXMuZm9yRWFjaChmdW5jdGlvbihwYXR0ZXJuVHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgcmVnZXggcmVwbGFjZSBwYXR0ZXJuIGZyb20gY29uZmlnIG9yIHVzZSB0aGUgZGVmYXVsdFxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPSAoKChTZGtDb25maWcuZ2V0KFwibGF0ZXhfbWF0aHNfZGVsaW1zXCIpIHx8XG4gICAgICAgICAgICAgICAgICAgIHt9KVtwYXR0ZXJuVHlwZV0gfHwge30pW1wicGF0dGVyblwiXSB8fCB7fSlbcGF0dGVybk5hbWVdIHx8XG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm5EZWZhdWx0c1twYXR0ZXJuTmFtZV1bcGF0dGVyblR5cGVdO1xuXG4gICAgICAgICAgICAgICAgbWQgPSBtZC5yZXBsYWNlKFJlZ0V4cChwYXR0ZXJuLCBcImdtc1wiKSwgZnVuY3Rpb24obSwgcDEsIHAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHAyZSA9IEFsbEh0bWxFbnRpdGllcy5lbmNvZGUocDIpO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHBhdHRlcm5UeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGlzcGxheVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwMX08ZGl2IGRhdGEtbXgtbWF0aHM9XCIke3AyZX1cIj5cXG5cXG48L2Rpdj5cXG5cXG5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImlubGluZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtwMX08c3BhbiBkYXRhLW14LW1hdGhzPVwiJHtwMmV9XCI+PC9zcGFuPmA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgZGl2IHRhZ3MgYWx3YXlzIHN0YXJ0IG9uIGEgbmV3IGxpbmUsIG90aGVyd2lzZSBpdCB3aWxsIGNvbmZ1c2VcbiAgICAgICAgLy8gdGhlIG1hcmtkb3duIHBhcnNlclxuICAgICAgICBtZCA9IG1kLnJlcGxhY2UoLyguKTxkaXYvZywgZnVuY3Rpb24obSwgcDEpIHsgcmV0dXJuIGAke3AxfVxcbjxkaXZgOyB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgTWFya2Rvd24obWQpO1xuICAgIGlmICghcGFyc2VyLmlzUGxhaW5UZXh0KCkgfHwgZm9yY2VIVE1MKSB7XG4gICAgICAgIC8vIGZlZWQgTWFya2Rvd24gb3V0cHV0IHRvIEhUTUwgcGFyc2VyXG4gICAgICAgIGNvbnN0IHBodG1sID0gY2hlZXJpby5sb2FkKHBhcnNlci50b0hUTUwoKSwge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogVGhlIGBfdXNlSHRtbFBhcnNlcjJgIGludGVybmFsIG9wdGlvbiBpcyB0aGVcbiAgICAgICAgICAgIC8vIHNpbXBsZXN0IHdheSB0byBib3RoIHBhcnNlIGFuZCByZW5kZXIgdXNpbmcgYGh0bWxwYXJzZXIyYC5cbiAgICAgICAgICAgIF91c2VIdG1sUGFyc2VyMjogdHJ1ZSxcbiAgICAgICAgICAgIGRlY29kZUVudGl0aWVzOiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2xhdGV4X21hdGhzXCIpKSB7XG4gICAgICAgICAgICAvLyBvcmlnaW5hbCBNYXJrZG93biB3aXRob3V0IExhVGVYIHJlcGxhY2VtZW50c1xuICAgICAgICAgICAgY29uc3QgcGFyc2VyT3JpZyA9IG5ldyBNYXJrZG93bihvcmlnKTtcbiAgICAgICAgICAgIGNvbnN0IHBodG1sT3JpZyA9IGNoZWVyaW8ubG9hZChwYXJzZXJPcmlnLnRvSFRNTCgpLCB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogVGhlIGBfdXNlSHRtbFBhcnNlcjJgIGludGVybmFsIG9wdGlvbiBpcyB0aGVcbiAgICAgICAgICAgICAgICAvLyBzaW1wbGVzdCB3YXkgdG8gYm90aCBwYXJzZSBhbmQgcmVuZGVyIHVzaW5nIGBodG1scGFyc2VyMmAuXG4gICAgICAgICAgICAgICAgX3VzZUh0bWxQYXJzZXIyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlY29kZUVudGl0aWVzOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBzaW5jZSBtYXRocyBkZWxpbWl0ZXJzIGFyZSBoYW5kbGVkIGJlZm9yZSBNYXJrZG93bixcbiAgICAgICAgICAgIC8vIGNvZGUgYmxvY2tzIGNvdWxkIGNvbnRhaW4gbWFuZ2xlZCBjb250ZW50LlxuICAgICAgICAgICAgLy8gcmVwbGFjZSBjb2RlIGJsb2NrcyB3aXRoIG9yaWdpbmFsIGNvbnRlbnRcbiAgICAgICAgICAgIHBodG1sT3JpZygnY29kZScpLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgICAgIHBodG1sKCdjb2RlJykuZXEoaSkudGV4dChwaHRtbE9yaWcoJ2NvZGUnKS5lcShpKS50ZXh0KCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFkZCBmYWxsYmFjayBvdXRwdXQgZm9yIGxhdGV4IG1hdGgsIHdoaWNoIHNob3VsZCBub3QgYmUgaW50ZXJwcmV0ZWQgYXMgbWFya2Rvd25cbiAgICAgICAgICAgIHBodG1sKCdkaXYsIHNwYW4nKS5lYWNoKGZ1bmN0aW9uKGksIGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXggPSBwaHRtbChlKS5hdHRyKCdkYXRhLW14LW1hdGhzJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRleCkge1xuICAgICAgICAgICAgICAgICAgICBwaHRtbChlKS5odG1sKGA8Y29kZT4ke3RleH08L2NvZGU+YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBodG1sLmh0bWwoKTtcbiAgICB9XG4gICAgLy8gZW5zdXJlIHJlbW92YWwgb2YgZXNjYXBlIGJhY2tzbGFzaGVzIGluIG5vbi1NYXJrZG93biBtZXNzYWdlc1xuICAgIGlmIChtZC5pbmRleE9mKFwiXFxcXFwiKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBwYXJzZXIudG9QbGFpbnRleHQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0U2VyaWFsaXplKG1vZGVsOiBFZGl0b3JNb2RlbCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG1vZGVsLnBhcnRzLnJlZHVjZSgodGV4dCwgcGFydCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBhcnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBUeXBlLk5ld2xpbmU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgKyBcIlxcblwiO1xuICAgICAgICAgICAgY2FzZSBUeXBlLlBsYWluOlxuICAgICAgICAgICAgY2FzZSBUeXBlLkVtb2ppOlxuICAgICAgICAgICAgY2FzZSBUeXBlLkNvbW1hbmQ6XG4gICAgICAgICAgICBjYXNlIFR5cGUuUGlsbENhbmRpZGF0ZTpcbiAgICAgICAgICAgIGNhc2UgVHlwZS5BdFJvb21QaWxsOlxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0ICsgcGFydC50ZXh0O1xuICAgICAgICAgICAgY2FzZSBUeXBlLlJvb21QaWxsOlxuICAgICAgICAgICAgICAgIC8vIEhlcmUgd2UgdXNlIHRoZSByZXNvdXJjZUlkIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLXJpY2ggdGV4dCBjbGllbnRzXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE2NjYwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgKyBgJHtwYXJ0LnJlc291cmNlSWR9YDtcbiAgICAgICAgICAgIGNhc2UgVHlwZS5Vc2VyUGlsbDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dCArIGAke3BhcnQudGV4dH1gO1xuICAgICAgICB9XG4gICAgfSwgXCJcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc0Vtb3RlKG1vZGVsOiBFZGl0b3JNb2RlbCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGhhc0NvbW1hbmQgPSBzdGFydHNXaXRoKG1vZGVsLCBcIi9tZSBcIiwgZmFsc2UpO1xuICAgIGNvbnN0IGhhc0FyZ3VtZW50ID0gbW9kZWwucGFydHNbMF0/LnRleHQ/Lmxlbmd0aCA+IDQgfHwgbW9kZWwucGFydHMubGVuZ3RoID4gMTtcbiAgICByZXR1cm4gaGFzQ29tbWFuZCAmJiBoYXNBcmd1bWVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0c1dpdGgobW9kZWw6IEVkaXRvck1vZGVsLCBwcmVmaXg6IHN0cmluZywgY2FzZVNlbnNpdGl2ZSA9IHRydWUpOiBib29sZWFuIHtcbiAgICBjb25zdCBmaXJzdFBhcnQgPSBtb2RlbC5wYXJ0c1swXTtcbiAgICAvLyBwYXJ0IHR5cGUgd2lsbCBiZSBcInBsYWluXCIgd2hpbGUgZWRpdGluZyxcbiAgICAvLyBhbmQgXCJjb21tYW5kXCIgd2hpbGUgY29tcG9zaW5nIGEgbWVzc2FnZS5cbiAgICBsZXQgdGV4dCA9IGZpcnN0UGFydD8udGV4dCB8fCAnJztcbiAgICBpZiAoIWNhc2VTZW5zaXRpdmUpIHtcbiAgICAgICAgcHJlZml4ID0gcHJlZml4LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpcnN0UGFydCAmJiAoZmlyc3RQYXJ0LnR5cGUgPT09IFR5cGUuUGxhaW4gfHwgZmlyc3RQYXJ0LnR5cGUgPT09IFR5cGUuQ29tbWFuZCkgJiYgdGV4dC5zdGFydHNXaXRoKHByZWZpeCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEVtb3RlQ29tbWFuZChtb2RlbDogRWRpdG9yTW9kZWwpOiBFZGl0b3JNb2RlbCB7XG4gICAgLy8gdHJpbSBcIi9tZSBcIlxuICAgIHJldHVybiBzdHJpcFByZWZpeChtb2RlbCwgXCIvbWUgXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBQcmVmaXgobW9kZWw6IEVkaXRvck1vZGVsLCBwcmVmaXg6IHN0cmluZyk6IEVkaXRvck1vZGVsIHtcbiAgICBtb2RlbCA9IG1vZGVsLmNsb25lKCk7XG4gICAgbW9kZWwucmVtb3ZlVGV4dCh7IGluZGV4OiAwLCBvZmZzZXQ6IDAgfSwgcHJlZml4Lmxlbmd0aCk7XG4gICAgcmV0dXJuIG1vZGVsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGVNZXNzYWdlKG1vZGVsOiBFZGl0b3JNb2RlbCk6IEVkaXRvck1vZGVsIHtcbiAgICBjb25zdCB7IHBhcnRzIH0gPSBtb2RlbDtcbiAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UGFydCA9IHBhcnRzWzBdO1xuICAgICAgICAvLyBvbmx5IHVuZXNjYXBlIFxcLyB0byAvIGF0IHN0YXJ0IG9mIGVkaXRvclxuICAgICAgICBpZiAoZmlyc3RQYXJ0LnR5cGUgPT09IFR5cGUuUGxhaW4gJiYgZmlyc3RQYXJ0LnRleHQuc3RhcnRzV2l0aChcIlxcXFwvXCIpKSB7XG4gICAgICAgICAgICBtb2RlbCA9IG1vZGVsLmNsb25lKCk7XG4gICAgICAgICAgICBtb2RlbC5yZW1vdmVUZXh0KHsgaW5kZXg6IDAsIG9mZnNldDogMCB9LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbW9kZWw7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFPLFNBQVNBLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQWlEO0VBQ3BELE9BQU9BLEtBQUssQ0FBQ0MsS0FBTixDQUFZQyxNQUFaLENBQW1CLENBQUNDLElBQUQsRUFBT0MsSUFBUCxLQUFnQjtJQUN0QyxRQUFRQSxJQUFJLENBQUNDLElBQWI7TUFDSSxLQUFLQyxXQUFBLENBQUtDLE9BQVY7UUFDSSxPQUFPSixJQUFJLEdBQUcsSUFBZDs7TUFDSixLQUFLRyxXQUFBLENBQUtFLEtBQVY7TUFDQSxLQUFLRixXQUFBLENBQUtHLEtBQVY7TUFDQSxLQUFLSCxXQUFBLENBQUtJLE9BQVY7TUFDQSxLQUFLSixXQUFBLENBQUtLLGFBQVY7TUFDQSxL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