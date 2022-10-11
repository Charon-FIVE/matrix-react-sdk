"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var commonmark = _interopRequireWildcard(require("commonmark"));

var _lodash = require("lodash");

var _logger = require("matrix-js-sdk/src/logger");

var _linkifyMatrix = require("./linkify-matrix");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2016 OpenMarket Ltd
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const ALLOWED_HTML_TAGS = ['sub', 'sup', 'del', 'u']; // These types of node are definitely text

const TEXT_NODES = ['text', 'softbreak', 'linebreak', 'paragraph', 'document']; // As far as @types/commonmark is concerned, these are not public, so add them

function isAllowedHtmlTag(node) {
  if (node.literal != null && node.literal.match('^<((div|span) data-mx-maths="[^"]*"|/(div|span))>$') != null) {
    return true;
  } // Regex won't work for tags with attrs, but we only
  // allow <del> anyway.


  const matches = /^<\/?(.*)>$/.exec(node.literal);

  if (matches && matches.length == 2) {
    const tag = matches[1];
    return ALLOWED_HTML_TAGS.indexOf(tag) > -1;
  }

  return false;
}
/*
 * Returns true if the parse output containing the node
 * comprises multiple block level elements (ie. lines),
 * or false if it is only a single line.
 */


function isMultiLine(node) {
  let par = node;

  while (par.parent) {
    par = par.parent;
  }

  return par.firstChild != par.lastChild;
}

function getTextUntilEndOrLinebreak(node) {
  let currentNode = node;
  let text = '';

  while (currentNode !== null && currentNode.type !== 'softbreak' && currentNode.type !== 'linebreak') {
    const {
      literal,
      type
    } = currentNode;

    if (type === 'text' && literal) {
      let n = 0;
      let char = literal[n];

      while (char !== ' ' && char !== null && n <= literal.length) {
        if (char === ' ') {
          break;
        }

        if (char) {
          text += char;
        }

        n += 1;
        char = literal[n];
      }

      if (char === ' ') {
        break;
      }
    }

    currentNode = currentNode.next;
  }

  return text;
}

const formattingChangesByNodeType = {
  'emph': '_',
  'strong': '__'
};
/**
 * Class that wraps commonmark, adding the ability to see whether
 * a given message actually uses any markdown syntax or whether
 * it's plain text.
 */

class Markdown {
  constructor(input) {
    (0, _defineProperty2.default)(this, "input", void 0);
    (0, _defineProperty2.default)(this, "parsed", void 0);
    this.input = input;
    const parser = new commonmark.Parser();
    this.parsed = parser.parse(this.input);
    this.parsed = this.repairLinks(this.parsed);
  }
  /**
   * This method is modifying the parsed AST in such a way that links are always
   * properly linkified instead of sometimes being wrongly emphasised in case
   * if you were to write a link like the example below:
   * https://my_weird-link_domain.domain.com
   * ^ this link would be parsed to something like this:
   * <a href="https://my">https://my</a><b>weird-link</b><a href="https://domain.domain.com">domain.domain.com</a>
   * This method makes it so the link gets properly modified to a version where it is
   * not emphasised until it actually ends.
   * See: https://github.com/vector-im/element-web/issues/4674
   * @param parsed
   */


  repairLinks(parsed) {
    const walker = parsed.walker();
    let event = null;
    let text = '';
    let isInPara = false;
    let previousNode = null;
    let shouldUnlinkFormattingNode = false;

    while (event = walker.next()) {
      const {
        node
      } = event;

      if (node.type === 'paragraph') {
        if (event.entering) {
          isInPara = true;
        } else {
          isInPara = false;
        }
      }

      if (isInPara) {
        // Clear saved string when line ends
        if (node.type === 'softbreak' || node.type === 'linebreak' || // Also start calculating the text from the beginning on any spaces
        node.type === 'text' && node.literal === ' ') {
          text = '';
          continue;
        } // Break up text nodes on spaces, so that we don't shoot past them without resetting


        if (node.type === 'text') {
          const [thisPart, ...nextParts] = node.literal.split(/( )/);
          node.literal = thisPart;
          text += thisPart; // Add the remaining parts as siblings

          nextParts.reverse().forEach(part => {
            if (part) {
              const nextNode = new commonmark.Node('text');
              nextNode.literal = part;
              node.insertAfter(nextNode); // Make the iterator aware of the newly inserted node

              walker.resumeAt(nextNode, true);
            }
          });
        } // We should not do this if previous node was not a textnode, as we can't combine it then.


        if ((node.type === 'emph' || node.type === 'strong') && previousNode.type === 'text') {
          if (event.entering) {
            const foundLinks = _linkifyMatrix.linkify.find(text);

            for (const {
              value
            } of foundLinks) {
              if (node.firstChild.literal) {
                /**
                 * NOTE: This technically should unlink the emph node and create LINK nodes instead, adding all the next elements as siblings
                 * but this solution seems to work well and is hopefully slightly easier to understand too
                 */
                const format = formattingChangesByNodeType[node.type];
                const nonEmphasizedText = `${format}${node.firstChild.literal}${format}`;
                const f = getTextUntilEndOrLinebreak(node);
                const newText = value + nonEmphasizedText + f;

                const newLinks = _linkifyMatrix.linkify.find(newText); // Should always find only one link here, if it finds more it means that the algorithm is broken


                if (newLinks.length === 1) {
                  const emphasisTextNode = new commonmark.Node('text');
                  emphasisTextNode.literal = nonEmphasizedText;
                  previousNode.insertAfter(emphasisTextNode);
                  node.firstChild.literal = '';
                  event = node.walker().next(); // Remove `em` opening and closing nodes

                  node.unlink();
                  previousNode.insertAfter(event.node);
                  shouldUnlinkFormattingNode = true;
                } else {
                  _logger.logger.error("Markdown links escaping found too many links for following text: ", text);

                  _logger.logger.error("Markdown links escaping found too many links for modified text: ", newText);
                }
              }
            }
          } else {
            if (shouldUnlinkFormattingNode) {
              node.unlink();
              shouldUnlinkFormattingNode = false;
            }
          }
        }
      }

      previousNode = node;
    }

    return parsed;
  }

  isPlainText() {
    const walker = this.parsed.walker();
    let ev;

    while (ev = walker.next()) {
      const node = ev.node;

      if (TEXT_NODES.indexOf(node.type) > -1) {
        // definitely text
        continue;
      } else if (node.type == 'html_inline' || node.type == 'html_block') {
        // if it's an allowed html tag, we need to render it and therefore
        // we will need to use HTML. If it's not allowed, it's not HTML since
        // we'll just be treating it as text.
        if (isAllowedHtmlTag(node)) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  }

  toHTML() {
    let {
      externalLinks = false
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const renderer = new commonmark.HtmlRenderer({
      safe: false,
      // Set soft breaks to hard HTML breaks: commonmark
      // puts softbreaks in for multiple lines in a blockquote,
      // so if these are just newline characters then the
      // block quote ends up all on one line
      // (https://github.com/vector-im/element-web/issues/3154)
      softbreak: '<br />'
    }); // Trying to strip out the wrapping <p/> causes a lot more complication
    // than it's worth, i think.  For instance, this code will go and strip
    // out any <p/> tag (no matter where it is in the tree) which doesn't
    // contain \n's.
    // On the flip side, <p/>s are quite opionated and restricted on where
    // you can nest them.
    //
    // Let's try sending with <p/>s anyway for now, though.

    const realParagraph = renderer.paragraph;

    renderer.paragraph = function (node, entering) {
      // If there is only one top level node, just return the
      // bare text: it's a single line of text and so should be
      // 'inline', rather than unnecessarily wrapped in its own
      // p tag. If, however, we have multiple nodes, each gets
      // its own p tag to keep them as separate paragraphs.
      // However, if it's a blockquote, adds a p tag anyway
      // in order to avoid deviation to commonmark and unexpected
      // results when parsing the formatted HTML.
      if (node.parent.type === 'block_quote' || isMultiLine(node)) {
        realParagraph.call(this, node, entering);
      }
    };

    renderer.link = function (node, entering) {
      const attrs = this.attrs(node);

      if (entering) {
        attrs.push(['href', this.esc(node.destination)]);

        if (node.title) {
          attrs.push(['title', this.esc(node.title)]);
        } // Modified link behaviour to treat them all as external and
        // thus opening in a new tab.


        if (externalLinks) {
          attrs.push(['target', '_blank']);
          attrs.push(['rel', 'noreferrer noopener']);
        }

        this.tag('a', attrs);
      } else {
        this.tag('/a');
      }
    };

    renderer.html_inline = function (node) {
      if (isAllowedHtmlTag(node)) {
        this.lit(node.literal);
      } else {
        this.lit((0, _lodash.escape)(node.literal));
      }
    };

    renderer.html_block = function (node) {
      /*
      // as with `paragraph`, we only insert line breaks
      // if there are multiple lines in the markdown.
      const isMultiLine = is_multi_line(node);
      if (isMultiLine) this.cr();
      */
      renderer.html_inline(node);
      /*
      if (isMultiLine) this.cr();
      */
    };

    return renderer.render(this.parsed);
  }
  /*
   * Render the markdown message to plain text. That is, essentially
   * just remove any backslashes escaping what would otherwise be
   * markdown syntax
   * (to fix https://github.com/vector-im/element-web/issues/2870).
   *
   * N.B. this does **NOT** render arbitrary MD to plain text - only MD
   * which has no formatting.  Otherwise it emits HTML(!).
   */


  toPlaintext() {
    const renderer = new commonmark.HtmlRenderer({
      safe: false
    });

    renderer.paragraph = function (node, entering) {
      // as with toHTML, only append lines to paragraphs if there are
      // multiple paragraphs
      if (isMultiLine(node)) {
        if (!entering && node.next) {
          this.lit('\n\n');
        }
      }
    };

    renderer.html_block = function (node) {
      this.lit(node.literal);
      if (isMultiLine(node) && node.next) this.lit('\n\n');
    };

    return renderer.render(this.parsed);
  }

}

exports.default = Markdown;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBTExPV0VEX0hUTUxfVEFHUyIsIlRFWFRfTk9ERVMiLCJpc0FsbG93ZWRIdG1sVGFnIiwibm9kZSIsImxpdGVyYWwiLCJtYXRjaCIsIm1hdGNoZXMiLCJleGVjIiwibGVuZ3RoIiwidGFnIiwiaW5kZXhPZiIsImlzTXVsdGlMaW5lIiwicGFyIiwicGFyZW50IiwiZmlyc3RDaGlsZCIsImxhc3RDaGlsZCIsImdldFRleHRVbnRpbEVuZE9yTGluZWJyZWFrIiwiY3VycmVudE5vZGUiLCJ0ZXh0IiwidHlwZSIsIm4iLCJjaGFyIiwibmV4dCIsImZvcm1hdHRpbmdDaGFuZ2VzQnlOb2RlVHlwZSIsIk1hcmtkb3duIiwiY29uc3RydWN0b3IiLCJpbnB1dCIsInBhcnNlciIsImNvbW1vbm1hcmsiLCJQYXJzZXIiLCJwYXJzZWQiLCJwYXJzZSIsInJlcGFpckxpbmtzIiwid2Fsa2VyIiwiZXZlbnQiLCJpc0luUGFyYSIsInByZXZpb3VzTm9kZSIsInNob3VsZFVubGlua0Zvcm1hdHRpbmdOb2RlIiwiZW50ZXJpbmciLCJ0aGlzUGFydCIsIm5leHRQYXJ0cyIsInNwbGl0IiwicmV2ZXJzZSIsImZvckVhY2giLCJwYXJ0IiwibmV4dE5vZGUiLCJOb2RlIiwiaW5zZXJ0QWZ0ZXIiLCJyZXN1bWVBdCIsImZvdW5kTGlua3MiLCJsaW5raWZ5IiwiZmluZCIsInZhbHVlIiwiZm9ybWF0Iiwibm9uRW1waGFzaXplZFRleHQiLCJmIiwibmV3VGV4dCIsIm5ld0xpbmtzIiwiZW1waGFzaXNUZXh0Tm9kZSIsInVubGluayIsImxvZ2dlciIsImVycm9yIiwiaXNQbGFpblRleHQiLCJldiIsInRvSFRNTCIsImV4dGVybmFsTGlua3MiLCJyZW5kZXJlciIsIkh0bWxSZW5kZXJlciIsInNhZmUiLCJzb2Z0YnJlYWsiLCJyZWFsUGFyYWdyYXBoIiwicGFyYWdyYXBoIiwiY2FsbCIsImxpbmsiLCJhdHRycyIsInB1c2giLCJlc2MiLCJkZXN0aW5hdGlvbiIsInRpdGxlIiwiaHRtbF9pbmxpbmUiLCJsaXQiLCJlc2NhcGUiLCJodG1sX2Jsb2NrIiwicmVuZGVyIiwidG9QbGFpbnRleHQiXSwic291cmNlcyI6WyIuLi9zcmMvTWFya2Rvd24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIGNvbW1vbm1hcmsgZnJvbSAnY29tbW9ubWFyayc7XG5pbXBvcnQgeyBlc2NhcGUgfSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXInO1xuXG5pbXBvcnQgeyBsaW5raWZ5IH0gZnJvbSAnLi9saW5raWZ5LW1hdHJpeCc7XG5cbmNvbnN0IEFMTE9XRURfSFRNTF9UQUdTID0gWydzdWInLCAnc3VwJywgJ2RlbCcsICd1J107XG5cbi8vIFRoZXNlIHR5cGVzIG9mIG5vZGUgYXJlIGRlZmluaXRlbHkgdGV4dFxuY29uc3QgVEVYVF9OT0RFUyA9IFsndGV4dCcsICdzb2Z0YnJlYWsnLCAnbGluZWJyZWFrJywgJ3BhcmFncmFwaCcsICdkb2N1bWVudCddO1xuXG4vLyBBcyBmYXIgYXMgQHR5cGVzL2NvbW1vbm1hcmsgaXMgY29uY2VybmVkLCB0aGVzZSBhcmUgbm90IHB1YmxpYywgc28gYWRkIHRoZW1cbmludGVyZmFjZSBDb21tb25tYXJrSHRtbFJlbmRlcmVySW50ZXJuYWwgZXh0ZW5kcyBjb21tb25tYXJrLkh0bWxSZW5kZXJlciB7XG4gICAgcGFyYWdyYXBoOiAobm9kZTogY29tbW9ubWFyay5Ob2RlLCBlbnRlcmluZzogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBsaW5rOiAobm9kZTogY29tbW9ubWFyay5Ob2RlLCBlbnRlcmluZzogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBodG1sX2lubGluZTogKG5vZGU6IGNvbW1vbm1hcmsuTm9kZSkgPT4gdm9pZDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICBodG1sX2Jsb2NrOiAobm9kZTogY29tbW9ubWFyay5Ob2RlKSA9PiB2b2lkOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgIHRleHQ6IChub2RlOiBjb21tb25tYXJrLk5vZGUpID0+IHZvaWQ7XG4gICAgb3V0OiAodGV4dDogc3RyaW5nKSA9PiB2b2lkO1xuICAgIGVtcGg6IChub2RlOiBjb21tb25tYXJrLk5vZGUpID0+IHZvaWQ7XG59XG5cbmZ1bmN0aW9uIGlzQWxsb3dlZEh0bWxUYWcobm9kZTogY29tbW9ubWFyay5Ob2RlKTogYm9vbGVhbiB7XG4gICAgaWYgKG5vZGUubGl0ZXJhbCAhPSBudWxsICYmXG4gICAgICAgIG5vZGUubGl0ZXJhbC5tYXRjaCgnXjwoKGRpdnxzcGFuKSBkYXRhLW14LW1hdGhzPVwiW15cIl0qXCJ8LyhkaXZ8c3BhbikpPiQnKSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFJlZ2V4IHdvbid0IHdvcmsgZm9yIHRhZ3Mgd2l0aCBhdHRycywgYnV0IHdlIG9ubHlcbiAgICAvLyBhbGxvdyA8ZGVsPiBhbnl3YXkuXG4gICAgY29uc3QgbWF0Y2hlcyA9IC9ePFxcLz8oLiopPiQvLmV4ZWMobm9kZS5saXRlcmFsKTtcbiAgICBpZiAobWF0Y2hlcyAmJiBtYXRjaGVzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIGNvbnN0IHRhZyA9IG1hdGNoZXNbMV07XG4gICAgICAgIHJldHVybiBBTExPV0VEX0hUTUxfVEFHUy5pbmRleE9mKHRhZykgPiAtMTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHBhcnNlIG91dHB1dCBjb250YWluaW5nIHRoZSBub2RlXG4gKiBjb21wcmlzZXMgbXVsdGlwbGUgYmxvY2sgbGV2ZWwgZWxlbWVudHMgKGllLiBsaW5lcyksXG4gKiBvciBmYWxzZSBpZiBpdCBpcyBvbmx5IGEgc2luZ2xlIGxpbmUuXG4gKi9cbmZ1bmN0aW9uIGlzTXVsdGlMaW5lKG5vZGU6IGNvbW1vbm1hcmsuTm9kZSk6IGJvb2xlYW4ge1xuICAgIGxldCBwYXIgPSBub2RlO1xuICAgIHdoaWxlIChwYXIucGFyZW50KSB7XG4gICAgICAgIHBhciA9IHBhci5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBwYXIuZmlyc3RDaGlsZCAhPSBwYXIubGFzdENoaWxkO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0VW50aWxFbmRPckxpbmVicmVhayhub2RlOiBjb21tb25tYXJrLk5vZGUpIHtcbiAgICBsZXQgY3VycmVudE5vZGUgPSBub2RlO1xuICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgd2hpbGUgKGN1cnJlbnROb2RlICE9PSBudWxsICYmIGN1cnJlbnROb2RlLnR5cGUgIT09ICdzb2Z0YnJlYWsnICYmIGN1cnJlbnROb2RlLnR5cGUgIT09ICdsaW5lYnJlYWsnKSB7XG4gICAgICAgIGNvbnN0IHsgbGl0ZXJhbCwgdHlwZSB9ID0gY3VycmVudE5vZGU7XG4gICAgICAgIGlmICh0eXBlID09PSAndGV4dCcgJiYgbGl0ZXJhbCkge1xuICAgICAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICAgICAgbGV0IGNoYXIgPSBsaXRlcmFsW25dO1xuICAgICAgICAgICAgd2hpbGUgKGNoYXIgIT09ICcgJyAmJiBjaGFyICE9PSBudWxsICYmIG4gPD0gbGl0ZXJhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hhciA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hhcikge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG4gKz0gMTtcbiAgICAgICAgICAgICAgICBjaGFyID0gbGl0ZXJhbFtuXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFyID09PSAnICcpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLm5leHQ7XG4gICAgfVxuICAgIHJldHVybiB0ZXh0O1xufVxuXG5jb25zdCBmb3JtYXR0aW5nQ2hhbmdlc0J5Tm9kZVR5cGUgPSB7XG4gICAgJ2VtcGgnOiAnXycsXG4gICAgJ3N0cm9uZyc6ICdfXycsXG59O1xuXG4vKipcbiAqIENsYXNzIHRoYXQgd3JhcHMgY29tbW9ubWFyaywgYWRkaW5nIHRoZSBhYmlsaXR5IHRvIHNlZSB3aGV0aGVyXG4gKiBhIGdpdmVuIG1lc3NhZ2UgYWN0dWFsbHkgdXNlcyBhbnkgbWFya2Rvd24gc3ludGF4IG9yIHdoZXRoZXJcbiAqIGl0J3MgcGxhaW4gdGV4dC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFya2Rvd24ge1xuICAgIHByaXZhdGUgaW5wdXQ6IHN0cmluZztcbiAgICBwcml2YXRlIHBhcnNlZDogY29tbW9ubWFyay5Ob2RlO1xuXG4gICAgY29uc3RydWN0b3IoaW5wdXQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXQ7XG5cbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IGNvbW1vbm1hcmsuUGFyc2VyKCk7XG4gICAgICAgIHRoaXMucGFyc2VkID0gcGFyc2VyLnBhcnNlKHRoaXMuaW5wdXQpO1xuICAgICAgICB0aGlzLnBhcnNlZCA9IHRoaXMucmVwYWlyTGlua3ModGhpcy5wYXJzZWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIG1vZGlmeWluZyB0aGUgcGFyc2VkIEFTVCBpbiBzdWNoIGEgd2F5IHRoYXQgbGlua3MgYXJlIGFsd2F5c1xuICAgICAqIHByb3Blcmx5IGxpbmtpZmllZCBpbnN0ZWFkIG9mIHNvbWV0aW1lcyBiZWluZyB3cm9uZ2x5IGVtcGhhc2lzZWQgaW4gY2FzZVxuICAgICAqIGlmIHlvdSB3ZXJlIHRvIHdyaXRlIGEgbGluayBsaWtlIHRoZSBleGFtcGxlIGJlbG93OlxuICAgICAqIGh0dHBzOi8vbXlfd2VpcmQtbGlua19kb21haW4uZG9tYWluLmNvbVxuICAgICAqIF4gdGhpcyBsaW5rIHdvdWxkIGJlIHBhcnNlZCB0byBzb21ldGhpbmcgbGlrZSB0aGlzOlxuICAgICAqIDxhIGhyZWY9XCJodHRwczovL215XCI+aHR0cHM6Ly9teTwvYT48Yj53ZWlyZC1saW5rPC9iPjxhIGhyZWY9XCJodHRwczovL2RvbWFpbi5kb21haW4uY29tXCI+ZG9tYWluLmRvbWFpbi5jb208L2E+XG4gICAgICogVGhpcyBtZXRob2QgbWFrZXMgaXQgc28gdGhlIGxpbmsgZ2V0cyBwcm9wZXJseSBtb2RpZmllZCB0byBhIHZlcnNpb24gd2hlcmUgaXQgaXNcbiAgICAgKiBub3QgZW1waGFzaXNlZCB1bnRpbCBpdCBhY3R1YWxseSBlbmRzLlxuICAgICAqIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvNDY3NFxuICAgICAqIEBwYXJhbSBwYXJzZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlcGFpckxpbmtzKHBhcnNlZDogY29tbW9ubWFyay5Ob2RlKSB7XG4gICAgICAgIGNvbnN0IHdhbGtlciA9IHBhcnNlZC53YWxrZXIoKTtcbiAgICAgICAgbGV0IGV2ZW50OiBjb21tb25tYXJrLk5vZGVXYWxraW5nU3RlcCA9IG51bGw7XG4gICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgIGxldCBpc0luUGFyYSA9IGZhbHNlO1xuICAgICAgICBsZXQgcHJldmlvdXNOb2RlOiBjb21tb25tYXJrLk5vZGUgfCBudWxsID0gbnVsbDtcbiAgICAgICAgbGV0IHNob3VsZFVubGlua0Zvcm1hdHRpbmdOb2RlID0gZmFsc2U7XG4gICAgICAgIHdoaWxlICgoZXZlbnQgPSB3YWxrZXIubmV4dCgpKSkge1xuICAgICAgICAgICAgY29uc3QgeyBub2RlIH0gPSBldmVudDtcbiAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmVudGVyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzSW5QYXJhID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpc0luUGFyYSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0luUGFyYSkge1xuICAgICAgICAgICAgICAgIC8vIENsZWFyIHNhdmVkIHN0cmluZyB3aGVuIGxpbmUgZW5kc1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbm9kZS50eXBlID09PSAnc29mdGJyZWFrJyB8fFxuICAgICAgICAgICAgICAgICAgICBub2RlLnR5cGUgPT09ICdsaW5lYnJlYWsnIHx8XG4gICAgICAgICAgICAgICAgICAgIC8vIEFsc28gc3RhcnQgY2FsY3VsYXRpbmcgdGhlIHRleHQgZnJvbSB0aGUgYmVnaW5uaW5nIG9uIGFueSBzcGFjZXNcbiAgICAgICAgICAgICAgICAgICAgKG5vZGUudHlwZSA9PT0gJ3RleHQnICYmIG5vZGUubGl0ZXJhbCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEJyZWFrIHVwIHRleHQgbm9kZXMgb24gc3BhY2VzLCBzbyB0aGF0IHdlIGRvbid0IHNob290IHBhc3QgdGhlbSB3aXRob3V0IHJlc2V0dGluZ1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbdGhpc1BhcnQsIC4uLm5leHRQYXJ0c10gPSBub2RlLmxpdGVyYWwuc3BsaXQoLyggKS8pO1xuICAgICAgICAgICAgICAgICAgICBub2RlLmxpdGVyYWwgPSB0aGlzUGFydDtcbiAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0aGlzUGFydDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIHJlbWFpbmluZyBwYXJ0cyBhcyBzaWJsaW5nc1xuICAgICAgICAgICAgICAgICAgICBuZXh0UGFydHMucmV2ZXJzZSgpLmZvckVhY2gocGFydCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHROb2RlID0gbmV3IGNvbW1vbm1hcmsuTm9kZSgndGV4dCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHROb2RlLmxpdGVyYWwgPSBwYXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaW5zZXJ0QWZ0ZXIobmV4dE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2UgdGhlIGl0ZXJhdG9yIGF3YXJlIG9mIHRoZSBuZXdseSBpbnNlcnRlZCBub2RlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2Fsa2VyLnJlc3VtZUF0KG5leHROb2RlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIG5vdCBkbyB0aGlzIGlmIHByZXZpb3VzIG5vZGUgd2FzIG5vdCBhIHRleHRub2RlLCBhcyB3ZSBjYW4ndCBjb21iaW5lIGl0IHRoZW4uXG4gICAgICAgICAgICAgICAgaWYgKChub2RlLnR5cGUgPT09ICdlbXBoJyB8fCBub2RlLnR5cGUgPT09ICdzdHJvbmcnKSAmJiBwcmV2aW91c05vZGUudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5lbnRlcmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm91bmRMaW5rcyA9IGxpbmtpZnkuZmluZCh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgeyB2YWx1ZSB9IG9mIGZvdW5kTGlua3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5maXJzdENoaWxkLmxpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIE5PVEU6IFRoaXMgdGVjaG5pY2FsbHkgc2hvdWxkIHVubGluayB0aGUgZW1waCBub2RlIGFuZCBjcmVhdGUgTElOSyBub2RlcyBpbnN0ZWFkLCBhZGRpbmcgYWxsIHRoZSBuZXh0IGVsZW1lbnRzIGFzIHNpYmxpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGJ1dCB0aGlzIHNvbHV0aW9uIHNlZW1zIHRvIHdvcmsgd2VsbCBhbmQgaXMgaG9wZWZ1bGx5IHNsaWdodGx5IGVhc2llciB0byB1bmRlcnN0YW5kIHRvb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0ID0gZm9ybWF0dGluZ0NoYW5nZXNCeU5vZGVUeXBlW25vZGUudHlwZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vbkVtcGhhc2l6ZWRUZXh0ID0gYCR7Zm9ybWF0fSR7bm9kZS5maXJzdENoaWxkLmxpdGVyYWx9JHtmb3JtYXR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZiA9IGdldFRleHRVbnRpbEVuZE9yTGluZWJyZWFrKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdUZXh0ID0gdmFsdWUgKyBub25FbXBoYXNpemVkVGV4dCArIGY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0xpbmtzID0gbGlua2lmeS5maW5kKG5ld1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaG91bGQgYWx3YXlzIGZpbmQgb25seSBvbmUgbGluayBoZXJlLCBpZiBpdCBmaW5kcyBtb3JlIGl0IG1lYW5zIHRoYXQgdGhlIGFsZ29yaXRobSBpcyBicm9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0xpbmtzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1waGFzaXNUZXh0Tm9kZSA9IG5ldyBjb21tb25tYXJrLk5vZGUoJ3RleHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtcGhhc2lzVGV4dE5vZGUubGl0ZXJhbCA9IG5vbkVtcGhhc2l6ZWRUZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNOb2RlLmluc2VydEFmdGVyKGVtcGhhc2lzVGV4dE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5maXJzdENoaWxkLmxpdGVyYWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ID0gbm9kZS53YWxrZXIoKS5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgYGVtYCBvcGVuaW5nIGFuZCBjbG9zaW5nIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnVubGluaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNOb2RlLmluc2VydEFmdGVyKGV2ZW50Lm5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkVW5saW5rRm9ybWF0dGluZ05vZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTWFya2Rvd24gbGlua3MgZXNjYXBpbmcgZm91bmQgdG9vIG1hbnkgbGlua3MgZm9yIGZvbGxvd2luZyB0ZXh0OiBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk1hcmtkb3duIGxpbmtzIGVzY2FwaW5nIGZvdW5kIHRvbyBtYW55IGxpbmtzIGZvciBtb2RpZmllZCB0ZXh0OiBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaG91bGRVbmxpbmtGb3JtYXR0aW5nTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUudW5saW5rKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkVW5saW5rRm9ybWF0dGluZ05vZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZpb3VzTm9kZSA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICB9XG5cbiAgICBpc1BsYWluVGV4dCgpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3Qgd2Fsa2VyID0gdGhpcy5wYXJzZWQud2Fsa2VyKCk7XG5cbiAgICAgICAgbGV0IGV2O1xuICAgICAgICB3aGlsZSAoZXYgPSB3YWxrZXIubmV4dCgpKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gZXYubm9kZTtcbiAgICAgICAgICAgIGlmIChURVhUX05PREVTLmluZGV4T2Yobm9kZS50eXBlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gZGVmaW5pdGVseSB0ZXh0XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PSAnaHRtbF9pbmxpbmUnIHx8IG5vZGUudHlwZSA9PSAnaHRtbF9ibG9jaycpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBpdCdzIGFuIGFsbG93ZWQgaHRtbCB0YWcsIHdlIG5lZWQgdG8gcmVuZGVyIGl0IGFuZCB0aGVyZWZvcmVcbiAgICAgICAgICAgICAgICAvLyB3ZSB3aWxsIG5lZWQgdG8gdXNlIEhUTUwuIElmIGl0J3Mgbm90IGFsbG93ZWQsIGl0J3Mgbm90IEhUTUwgc2luY2VcbiAgICAgICAgICAgICAgICAvLyB3ZSdsbCBqdXN0IGJlIHRyZWF0aW5nIGl0IGFzIHRleHQuXG4gICAgICAgICAgICAgICAgaWYgKGlzQWxsb3dlZEh0bWxUYWcobm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRvSFRNTCh7IGV4dGVybmFsTGlua3MgPSBmYWxzZSB9ID0ge30pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCByZW5kZXJlciA9IG5ldyBjb21tb25tYXJrLkh0bWxSZW5kZXJlcih7XG4gICAgICAgICAgICBzYWZlOiBmYWxzZSxcblxuICAgICAgICAgICAgLy8gU2V0IHNvZnQgYnJlYWtzIHRvIGhhcmQgSFRNTCBicmVha3M6IGNvbW1vbm1hcmtcbiAgICAgICAgICAgIC8vIHB1dHMgc29mdGJyZWFrcyBpbiBmb3IgbXVsdGlwbGUgbGluZXMgaW4gYSBibG9ja3F1b3RlLFxuICAgICAgICAgICAgLy8gc28gaWYgdGhlc2UgYXJlIGp1c3QgbmV3bGluZSBjaGFyYWN0ZXJzIHRoZW4gdGhlXG4gICAgICAgICAgICAvLyBibG9jayBxdW90ZSBlbmRzIHVwIGFsbCBvbiBvbmUgbGluZVxuICAgICAgICAgICAgLy8gKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzMxNTQpXG4gICAgICAgICAgICBzb2Z0YnJlYWs6ICc8YnIgLz4nLFxuICAgICAgICB9KSBhcyBDb21tb25tYXJrSHRtbFJlbmRlcmVySW50ZXJuYWw7XG5cbiAgICAgICAgLy8gVHJ5aW5nIHRvIHN0cmlwIG91dCB0aGUgd3JhcHBpbmcgPHAvPiBjYXVzZXMgYSBsb3QgbW9yZSBjb21wbGljYXRpb25cbiAgICAgICAgLy8gdGhhbiBpdCdzIHdvcnRoLCBpIHRoaW5rLiAgRm9yIGluc3RhbmNlLCB0aGlzIGNvZGUgd2lsbCBnbyBhbmQgc3RyaXBcbiAgICAgICAgLy8gb3V0IGFueSA8cC8+IHRhZyAobm8gbWF0dGVyIHdoZXJlIGl0IGlzIGluIHRoZSB0cmVlKSB3aGljaCBkb2Vzbid0XG4gICAgICAgIC8vIGNvbnRhaW4gXFxuJ3MuXG4gICAgICAgIC8vIE9uIHRoZSBmbGlwIHNpZGUsIDxwLz5zIGFyZSBxdWl0ZSBvcGlvbmF0ZWQgYW5kIHJlc3RyaWN0ZWQgb24gd2hlcmVcbiAgICAgICAgLy8geW91IGNhbiBuZXN0IHRoZW0uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIExldCdzIHRyeSBzZW5kaW5nIHdpdGggPHAvPnMgYW55d2F5IGZvciBub3csIHRob3VnaC5cbiAgICAgICAgY29uc3QgcmVhbFBhcmFncmFwaCA9IHJlbmRlcmVyLnBhcmFncmFwaDtcbiAgICAgICAgcmVuZGVyZXIucGFyYWdyYXBoID0gZnVuY3Rpb24obm9kZTogY29tbW9ubWFyay5Ob2RlLCBlbnRlcmluZzogYm9vbGVhbikge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgb25seSBvbmUgdG9wIGxldmVsIG5vZGUsIGp1c3QgcmV0dXJuIHRoZVxuICAgICAgICAgICAgLy8gYmFyZSB0ZXh0OiBpdCdzIGEgc2luZ2xlIGxpbmUgb2YgdGV4dCBhbmQgc28gc2hvdWxkIGJlXG4gICAgICAgICAgICAvLyAnaW5saW5lJywgcmF0aGVyIHRoYW4gdW5uZWNlc3NhcmlseSB3cmFwcGVkIGluIGl0cyBvd25cbiAgICAgICAgICAgIC8vIHAgdGFnLiBJZiwgaG93ZXZlciwgd2UgaGF2ZSBtdWx0aXBsZSBub2RlcywgZWFjaCBnZXRzXG4gICAgICAgICAgICAvLyBpdHMgb3duIHAgdGFnIHRvIGtlZXAgdGhlbSBhcyBzZXBhcmF0ZSBwYXJhZ3JhcGhzLlxuICAgICAgICAgICAgLy8gSG93ZXZlciwgaWYgaXQncyBhIGJsb2NrcXVvdGUsIGFkZHMgYSBwIHRhZyBhbnl3YXlcbiAgICAgICAgICAgIC8vIGluIG9yZGVyIHRvIGF2b2lkIGRldmlhdGlvbiB0byBjb21tb25tYXJrIGFuZCB1bmV4cGVjdGVkXG4gICAgICAgICAgICAvLyByZXN1bHRzIHdoZW4gcGFyc2luZyB0aGUgZm9ybWF0dGVkIEhUTUwuXG4gICAgICAgICAgICBpZiAobm9kZS5wYXJlbnQudHlwZSA9PT0gJ2Jsb2NrX3F1b3RlJ3x8IGlzTXVsdGlMaW5lKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcmVhbFBhcmFncmFwaC5jYWxsKHRoaXMsIG5vZGUsIGVudGVyaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZW5kZXJlci5saW5rID0gZnVuY3Rpb24obm9kZSwgZW50ZXJpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycyhub2RlKTtcbiAgICAgICAgICAgIGlmIChlbnRlcmluZykge1xuICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWydocmVmJywgdGhpcy5lc2Mobm9kZS5kZXN0aW5hdGlvbildKTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS50aXRsZSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRycy5wdXNoKFsndGl0bGUnLCB0aGlzLmVzYyhub2RlLnRpdGxlKV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBNb2RpZmllZCBsaW5rIGJlaGF2aW91ciB0byB0cmVhdCB0aGVtIGFsbCBhcyBleHRlcm5hbCBhbmRcbiAgICAgICAgICAgICAgICAvLyB0aHVzIG9wZW5pbmcgaW4gYSBuZXcgdGFiLlxuICAgICAgICAgICAgICAgIGlmIChleHRlcm5hbExpbmtzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWyd0YXJnZXQnLCAnX2JsYW5rJ10pO1xuICAgICAgICAgICAgICAgICAgICBhdHRycy5wdXNoKFsncmVsJywgJ25vcmVmZXJyZXIgbm9vcGVuZXInXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudGFnKCdhJywgYXR0cnMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZygnL2EnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZW5kZXJlci5odG1sX2lubGluZSA9IGZ1bmN0aW9uKG5vZGU6IGNvbW1vbm1hcmsuTm9kZSkge1xuICAgICAgICAgICAgaWYgKGlzQWxsb3dlZEh0bWxUYWcobm9kZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpdChub2RlLmxpdGVyYWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpdChlc2NhcGUobm9kZS5saXRlcmFsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVuZGVyZXIuaHRtbF9ibG9jayA9IGZ1bmN0aW9uKG5vZGU6IGNvbW1vbm1hcmsuTm9kZSkge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIC8vIGFzIHdpdGggYHBhcmFncmFwaGAsIHdlIG9ubHkgaW5zZXJ0IGxpbmUgYnJlYWtzXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgbGluZXMgaW4gdGhlIG1hcmtkb3duLlxuICAgICAgICAgICAgY29uc3QgaXNNdWx0aUxpbmUgPSBpc19tdWx0aV9saW5lKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzTXVsdGlMaW5lKSB0aGlzLmNyKCk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmVuZGVyZXIuaHRtbF9pbmxpbmUobm9kZSk7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgaWYgKGlzTXVsdGlMaW5lKSB0aGlzLmNyKCk7XG4gICAgICAgICAgICAqL1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByZW5kZXJlci5yZW5kZXIodGhpcy5wYXJzZWQpO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogUmVuZGVyIHRoZSBtYXJrZG93biBtZXNzYWdlIHRvIHBsYWluIHRleHQuIFRoYXQgaXMsIGVzc2VudGlhbGx5XG4gICAgICoganVzdCByZW1vdmUgYW55IGJhY2tzbGFzaGVzIGVzY2FwaW5nIHdoYXQgd291bGQgb3RoZXJ3aXNlIGJlXG4gICAgICogbWFya2Rvd24gc3ludGF4XG4gICAgICogKHRvIGZpeCBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8yODcwKS5cbiAgICAgKlxuICAgICAqIE4uQi4gdGhpcyBkb2VzICoqTk9UKiogcmVuZGVyIGFyYml0cmFyeSBNRCB0byBwbGFpbiB0ZXh0IC0gb25seSBNRFxuICAgICAqIHdoaWNoIGhhcyBubyBmb3JtYXR0aW5nLiAgT3RoZXJ3aXNlIGl0IGVtaXRzIEhUTUwoISkuXG4gICAgICovXG4gICAgdG9QbGFpbnRleHQoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSBuZXcgY29tbW9ubWFyay5IdG1sUmVuZGVyZXIoeyBzYWZlOiBmYWxzZSB9KSBhcyBDb21tb25tYXJrSHRtbFJlbmRlcmVySW50ZXJuYWw7XG5cbiAgICAgICAgcmVuZGVyZXIucGFyYWdyYXBoID0gZnVuY3Rpb24obm9kZTogY29tbW9ubWFyay5Ob2RlLCBlbnRlcmluZzogYm9vbGVhbikge1xuICAgICAgICAgICAgLy8gYXMgd2l0aCB0b0hUTUwsIG9ubHkgYXBwZW5kIGxpbmVzIHRvIHBhcmFncmFwaHMgaWYgdGhlcmUgYXJlXG4gICAgICAgICAgICAvLyBtdWx0aXBsZSBwYXJhZ3JhcGhzXG4gICAgICAgICAgICBpZiAoaXNNdWx0aUxpbmUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVudGVyaW5nICYmIG5vZGUubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpdCgnXFxuXFxuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlbmRlcmVyLmh0bWxfYmxvY2sgPSBmdW5jdGlvbihub2RlOiBjb21tb25tYXJrLk5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubGl0KG5vZGUubGl0ZXJhbCk7XG4gICAgICAgICAgICBpZiAoaXNNdWx0aUxpbmUobm9kZSkgJiYgbm9kZS5uZXh0KSB0aGlzLmxpdCgnXFxuXFxuJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHJlbmRlcmVyLnJlbmRlcih0aGlzLnBhcnNlZCk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUUEsTUFBTUEsaUJBQWlCLEdBQUcsQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsR0FBdEIsQ0FBMUIsQyxDQUVBOztBQUNBLE1BQU1DLFVBQVUsR0FBRyxDQUFDLE1BQUQsRUFBUyxXQUFULEVBQXNCLFdBQXRCLEVBQW1DLFdBQW5DLEVBQWdELFVBQWhELENBQW5CLEMsQ0FFQTs7QUFX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