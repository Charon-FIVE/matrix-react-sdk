"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PERMITTED_URL_SCHEMES = void 0;
exports.bodyToHtml = bodyToHtml;
exports.checkBlockNode = checkBlockNode;
exports.getHtmlText = getHtmlText;
exports.isUrlPermitted = isUrlPermitted;
exports.linkifyAndSanitizeHtml = linkifyAndSanitizeHtml;
exports.linkifyElement = linkifyElement;
exports.linkifyString = linkifyString;
exports.sanitizedHtmlNode = sanitizedHtmlNode;
exports.topicToHtml = topicToHtml;
exports.unicodeToShortcode = unicodeToShortcode;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _classnames = _interopRequireDefault(require("classnames"));

var _emojibaseRegex = _interopRequireDefault(require("emojibase-regex"));

var _lodash = require("lodash");

var _katex = _interopRequireDefault(require("katex"));

var _htmlEntities = require("html-entities");

var _linkifyMatrix = require("./linkify-matrix");

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _Permalinks = require("./utils/permalinks/Permalinks");

var _emoji = require("./emoji");

var _Media = require("./customisations/Media");

var _Reply = require("./utils/Reply");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// Anything outside the basic multilingual plane will be a surrogate pair
const SURROGATE_PAIR_PATTERN = /([\ud800-\udbff])([\udc00-\udfff])/; // And there a bunch more symbol characters that emojibase has within the
// BMP, so this includes the ranges from 'letterlike symbols' to
// 'miscellaneous symbols and arrows' which should catch all of them
// (with plenty of false positives, but that's OK)

const SYMBOL_PATTERN = /([\u2100-\u2bff])/; // Regex pattern for Zero-Width joiner unicode characters

const ZWJ_REGEX = /[\u200D\u2003]/g; // Regex pattern for whitespace characters

const WHITESPACE_REGEX = /\s/g;
const BIGEMOJI_REGEX = new RegExp(`^(${_emojibaseRegex.default.source})+$`, 'i');
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const PERMITTED_URL_SCHEMES = ["bitcoin", "ftp", "geo", "http", "https", "im", "irc", "ircs", "magnet", "mailto", "matrix", "mms", "news", "nntp", "openpgp4fpr", "sip", "sftp", "sms", "smsto", "ssh", "tel", "urn", "webcal", "wtai", "xmpp"];
exports.PERMITTED_URL_SCHEMES = PERMITTED_URL_SCHEMES;
const MEDIA_API_MXC_REGEX = /\/_matrix\/media\/r0\/(?:download|thumbnail)\/(.+?)\/(.+?)(?:[?/]|$)/;
/*
 * Return true if the given string contains emoji
 * Uses a much, much simpler regex than emojibase's so will give false
 * positives, but useful for fast-path testing strings to see if they
 * need emojification.
 */

function mightContainEmoji(str) {
  return SURROGATE_PAIR_PATTERN.test(str) || SYMBOL_PATTERN.test(str);
}
/**
 * Returns the shortcode for an emoji character.
 *
 * @param {String} char The emoji character
 * @return {String} The shortcode (such as :thumbup:)
 */


function unicodeToShortcode(char) {
  const shortcodes = (0, _emoji.getEmojiFromUnicode)(char)?.shortcodes;
  return shortcodes?.length ? `:${shortcodes[0]}:` : '';
}
/*
 * Given an untrusted HTML string, return a React node with an sanitized version
 * of that HTML.
 */


function sanitizedHtmlNode(insaneHtml) {
  const saneHtml = (0, _sanitizeHtml.default)(insaneHtml, sanitizeHtmlParams);
  return /*#__PURE__*/_react.default.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: saneHtml
    },
    dir: "auto"
  });
}

function getHtmlText(insaneHtml) {
  return (0, _sanitizeHtml.default)(insaneHtml, {
    allowedTags: [],
    allowedAttributes: {},
    selfClosing: [],
    allowedSchemes: [],
    disallowedTagsMode: 'discard'
  });
}
/**
 * Tests if a URL from an untrusted source may be safely put into the DOM
 * The biggest threat here is javascript: URIs.
 * Note that the HTML sanitiser library has its own internal logic for
 * doing this, to which we pass the same list of schemes. This is used in
 * other places we need to sanitise URLs.
 * @return true if permitted, otherwise false
 */


function isUrlPermitted(inputUrl) {
  try {
    // URL parser protocol includes the trailing colon
    return PERMITTED_URL_SCHEMES.includes(new URL(inputUrl).protocol.slice(0, -1));
  } catch (e) {
    return false;
  }
}

const transformTags = {
  // custom to matrix
  // add blank targets to all hyperlinks except vector URLs
  'a': function (tagName, attribs) {
    if (attribs.href) {
      attribs.target = '_blank'; // by default

      const transformed = (0, _Permalinks.tryTransformPermalinkToLocalHref)(attribs.href); // only used to check if it is a link that can be handled locally

      if (transformed !== attribs.href || // it could be converted so handle locally symbols e.g. @user:server.tdl, matrix: and matrix.to
      attribs.href.match(_linkifyMatrix.ELEMENT_URL_PATTERN) // for https links to Element domains
      ) {
        delete attribs.target;
      }
    } else {
      // Delete the href attrib if it is falsy
      delete attribs.href;
    }

    attribs.rel = 'noreferrer noopener'; // https://mathiasbynens.github.io/rel-noopener/

    return {
      tagName,
      attribs
    };
  },
  'img': function (tagName, attribs) {
    let src = attribs.src; // Strip out imgs that aren't `mxc` here instead of using allowedSchemesByTag
    // because transformTags is used _before_ we filter by allowedSchemesByTag and
    // we don't want to allow images with `https?` `src`s.
    // We also drop inline images (as if they were not present at all) when the "show
    // images" preference is disabled. Future work might expose some UI to reveal them
    // like standalone image events have.

    if (!src || !_SettingsStore.default.getValue("showImages")) {
      return {
        tagName,
        attribs: {}
      };
    }

    if (!src.startsWith("mxc://")) {
      const match = MEDIA_API_MXC_REGEX.exec(src);

      if (match) {
        src = `mxc://${match[1]}/${match[2]}`;
      }
    }

    if (!src.startsWith("mxc://")) {
      return {
        tagName,
        attribs: {}
      };
    }

    const requestedWidth = Number(attribs.width);
    const requestedHeight = Number(attribs.height);
    const width = Math.min(requestedWidth || 800, 800);
    const height = Math.min(requestedHeight || 600, 600); // specify width/height as max values instead of absolute ones to allow object-fit to do its thing
    // we only allow our own styles for this tag so overwrite the attribute

    attribs.style = `max-width: ${width}px; max-height: ${height}px;`;

    if (requestedWidth) {
      attribs.style += "width: 100%;";
    }

    if (requestedHeight) {
      attribs.style += "height: 100%;";
    }

    attribs.src = (0, _Media.mediaFromMxc)(src).getThumbnailOfSourceHttp(width, height);
    return {
      tagName,
      attribs
    };
  },
  'code': function (tagName, attribs) {
    if (typeof attribs.class !== 'undefined') {
      // Filter out all classes other than ones starting with language- for syntax highlighting.
      const classes = attribs.class.split(/\s/).filter(function (cl) {
        return cl.startsWith('language-') && !cl.startsWith('language-_');
      });
      attribs.class = classes.join(' ');
    }

    return {
      tagName,
      attribs
    };
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '*': function (tagName, attribs) {
    // Delete any style previously assigned, style is an allowedTag for font, span & img,
    // because attributes are stripped after transforming.
    // For img this is trusted as it is generated wholly within the img transformation method.
    if (tagName !== "img") {
      delete attribs.style;
    } // Sanitise and transform data-mx-color and data-mx-bg-color to their CSS
    // equivalents


    const customCSSMapper = {
      'data-mx-color': 'color',
      'data-mx-bg-color': 'background-color' // $customAttributeKey: $cssAttributeKey

    };
    let style = "";
    Object.keys(customCSSMapper).forEach(customAttributeKey => {
      const cssAttributeKey = customCSSMapper[customAttributeKey];
      const customAttributeValue = attribs[customAttributeKey];

      if (customAttributeValue && typeof customAttributeValue === 'string' && COLOR_REGEX.test(customAttributeValue)) {
        style += cssAttributeKey + ":" + customAttributeValue + ";";
        delete attribs[customAttributeKey];
      }
    });

    if (style) {
      attribs.style = style + (attribs.style || "");
    }

    return {
      tagName,
      attribs
    };
  }
};
const sanitizeHtmlParams = {
  allowedTags: ['font', // custom to matrix for IRC-style font coloring
  'del', // for markdown
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'sup', 'sub', 'nl', 'li', 'b', 'i', 'u', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img', 'details', 'summary'],
  allowedAttributes: {
    // attribute sanitization happens after transformations, so we have to accept `style` for font, span & img
    // but strip during the transformation.
    // custom ones first:
    font: ['color', 'data-mx-bg-color', 'data-mx-color', 'style'],
    // custom to matrix
    span: ['data-mx-maths', 'data-mx-bg-color', 'data-mx-color', 'data-mx-spoiler', 'style'],
    // custom to matrix
    div: ['data-mx-maths'],
    a: ['href', 'name', 'target', 'rel'],
    // remote target: custom to matrix
    // img tags also accept width/height, we just map those to max-width & max-height during transformation
    img: ['src', 'alt', 'title', 'style'],
    ol: ['start'],
    code: ['class'] // We don't actually allow all classes, we filter them in transformTags

  },
  // Lots of these won't come up by default because we don't allow them
  selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
  // URL schemes we permit
  allowedSchemes: PERMITTED_URL_SCHEMES,
  allowProtocolRelative: false,
  transformTags,
  // 50 levels deep "should be enough for anyone"
  nestingLimit: 50
}; // this is the same as the above except with less rewriting

const composerSanitizeHtmlParams = _objectSpread(_objectSpread({}, sanitizeHtmlParams), {}, {
  transformTags: {
    'code': transformTags['code'],
    '*': transformTags['*']
  }
}); // reduced set of allowed tags to avoid turning topics into Myspace


const topicSanitizeHtmlParams = _objectSpread(_objectSpread({}, sanitizeHtmlParams), {}, {
  allowedTags: ['font', // custom to matrix for IRC-style font coloring
  'del', // for markdown
  'a', 'sup', 'sub', 'b', 'i', 'u', 'strong', 'em', 'strike', 'br', 'div', 'span']
});

class BaseHighlighter {
  constructor(highlightClass, highlightLink) {
    this.highlightClass = highlightClass;
    this.highlightLink = highlightLink;
  }
  /**
   * apply the highlights to a section of text
   *
   * @param {string} safeSnippet The snippet of text to apply the highlights
   *     to.
   * @param {string[]} safeHighlights A list of substrings to highlight,
   *     sorted by descending length.
   *
   * returns a list of results (strings for HtmlHighligher, react nodes for
   * TextHighlighter).
   */


  applyHighlights(safeSnippet, safeHighlights) {
    let lastOffset = 0;
    let offset;
    let nodes = [];
    const safeHighlight = safeHighlights[0];

    while ((offset = safeSnippet.toLowerCase().indexOf(safeHighlight.toLowerCase(), lastOffset)) >= 0) {
      // handle preamble
      if (offset > lastOffset) {
        const subSnippet = safeSnippet.substring(lastOffset, offset);
        nodes = nodes.concat(this.applySubHighlights(subSnippet, safeHighlights));
      } // do highlight. use the original string rather than safeHighlight
      // to preserve the original casing.


      const endOffset = offset + safeHighlight.length;
      nodes.push(this.processSnippet(safeSnippet.substring(offset, endOffset), true));
      lastOffset = endOffset;
    } // handle postamble


    if (lastOffset !== safeSnippet.length) {
      const subSnippet = safeSnippet.substring(lastOffset, undefined);
      nodes = nodes.concat(this.applySubHighlights(subSnippet, safeHighlights));
    }

    return nodes;
  }

  applySubHighlights(safeSnippet, safeHighlights) {
    if (safeHighlights[1]) {
      // recurse into this range to check for the next set of highlight matches
      return this.applyHighlights(safeSnippet, safeHighlights.slice(1));
    } else {
      // no more highlights to be found, just return the unhighlighted string
      return [this.processSnippet(safeSnippet, false)];
    }
  }

}

class HtmlHighlighter extends BaseHighlighter {
  /* highlight the given snippet if required
   *
   * snippet: content of the span; must have been sanitised
   * highlight: true to highlight as a search match
   *
   * returns an HTML string
   */
  processSnippet(snippet, highlight) {
    if (!highlight) {
      // nothing required here
      return snippet;
    }

    let span = `<span class="${this.highlightClass}">${snippet}</span>`;

    if (this.highlightLink) {
      span = `<a href="${encodeURI(this.highlightLink)}">${span}</a>`;
    }

    return span;
  }

}

const emojiToHtmlSpan = emoji => `<span class='mx_Emoji' title='${unicodeToShortcode(emoji)}'>${emoji}</span>`;

const emojiToJsxSpan = (emoji, key) => /*#__PURE__*/_react.default.createElement("span", {
  key: key,
  className: "mx_Emoji",
  title: unicodeToShortcode(emoji)
}, emoji);
/**
 * Wraps emojis in <span> to style them separately from the rest of message. Consecutive emojis (and modifiers) are wrapped
 * in the same <span>.
 * @param {string} message the text to format
 * @param {boolean} isHtmlMessage whether the message contains HTML
 * @returns if isHtmlMessage is true, returns an array of strings, otherwise return an array of React Elements for emojis
 * and plain text for everything else
 */


function formatEmojis(message, isHtmlMessage) {
  const emojiToSpan = isHtmlMessage ? emojiToHtmlSpan : emojiToJsxSpan;
  const result = [];
  let text = '';
  let key = 0; // We use lodash's grapheme splitter to avoid breaking apart compound emojis

  for (const char of (0, _lodash.split)(message, '')) {
    if (_emojibaseRegex.default.test(char)) {
      if (text) {
        result.push(text);
        text = '';
      }

      result.push(emojiToSpan(char, key));
      key++;
    } else {
      text += char;
    }
  }

  if (text) {
    result.push(text);
  }

  return result;
}
/* turn a matrix event body into html
 *
 * content: 'content' of the MatrixEvent
 *
 * highlights: optional list of words to highlight, ordered by longest word first
 *
 * opts.highlightLink: optional href to add to highlighted words
 * opts.disableBigEmoji: optional argument to disable the big emoji class.
 * opts.stripReplyFallback: optional argument specifying the event is a reply and so fallback needs removing
 * opts.returnString: return an HTML string rather than JSX elements
 * opts.forComposerQuote: optional param to lessen the url rewriting done by sanitization, for quoting into composer
 * opts.ref: React ref to attach to any React components returned (not compatible with opts.returnString)
 */


function bodyToHtml(content, highlights) {
  let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const isFormattedBody = content.format === "org.matrix.custom.html" && content.formatted_body;
  let bodyHasEmoji = false;
  let isHtmlMessage = false;
  let sanitizeParams = sanitizeHtmlParams;

  if (opts.forComposerQuote) {
    sanitizeParams = composerSanitizeHtmlParams;
  }

  let strippedBody;
  let safeBody; // safe, sanitised HTML, preferred over `strippedBody` which is fully plaintext

  try {
    // sanitizeHtml can hang if an unclosed HTML tag is thrown at it
    // A search for `<foo` will make the browser crash an alternative would be to escape HTML special characters
    // but that would bring no additional benefit as the highlighter does not work with those special chars
    const safeHighlights = highlights?.filter(highlight => !highlight.includes("<")).map(highlight => (0, _sanitizeHtml.default)(highlight, sanitizeParams));
    let formattedBody = typeof content.formatted_body === 'string' ? content.formatted_body : null;
    const plainBody = typeof content.body === 'string' ? content.body : "";
    if (opts.stripReplyFallback && formattedBody) formattedBody = (0, _Reply.stripHTMLReply)(formattedBody);
    strippedBody = opts.stripReplyFallback ? (0, _Reply.stripPlainReply)(plainBody) : plainBody;
    bodyHasEmoji = mightContainEmoji(isFormattedBody ? formattedBody : plainBody);
    const highlighter = safeHighlights?.length ? new HtmlHighlighter("mx_EventTile_searchHighlight", opts.highlightLink) : null;

    if (isFormattedBody) {
      if (highlighter) {
        // XXX: We sanitize the HTML whilst also highlighting its text nodes, to avoid accidentally trying
        // to highlight HTML tags themselves. However, this does mean that we don't highlight textnodes which
        // are interrupted by HTML tags (not that we did before) - e.g. foo<span/>bar won't get highlighted
        // by an attempt to search for 'foobar'.  Then again, the search query probably wouldn't work either
        // XXX: hacky bodge to temporarily apply a textFilter to the sanitizeParams structure.
        sanitizeParams.textFilter = function (safeText) {
          return highlighter.applyHighlights(safeText, safeHighlights).join('');
        };
      }

      safeBody = (0, _sanitizeHtml.default)(formattedBody, sanitizeParams);

      const phtml = _cheerio.default.load(safeBody, {
        // @ts-ignore: The `_useHtmlParser2` internal option is the
        // simplest way to both parse and render using `htmlparser2`.
        _useHtmlParser2: true,
        decodeEntities: false
      });

      const isPlainText = phtml.html() === phtml.root().text();
      isHtmlMessage = isFormattedBody && !isPlainText;

      if (isHtmlMessage && _SettingsStore.default.getValue("feature_latex_maths")) {
        // @ts-ignore - The types for `replaceWith` wrongly expect
        // Cheerio instance to be returned.
        phtml('div, span[data-mx-maths!=""]').replaceWith(function (i, e) {
          return _katex.default.renderToString(_htmlEntities.AllHtmlEntities.decode(phtml(e).attr('data-mx-maths')), {
            throwOnError: false,
            // @ts-ignore - `e` can be an Element, not just a Node
            displayMode: e.name == 'div',
            output: "htmlAndMathml"
          });
        });
        safeBody = phtml.html();
      }

      if (bodyHasEmoji) {
        safeBody = formatEmojis(safeBody, true).join('');
      }
    } else if (highlighter) {
      safeBody = highlighter.applyHighlights(plainBody, safeHighlights).join('');
    }
  } finally {
    delete sanitizeParams.textFilter;
  }

  const contentBody = safeBody ?? strippedBody;

  if (opts.returnString) {
    return contentBody;
  }

  let emojiBody = false;

  if (!opts.disableBigEmoji && bodyHasEmoji) {
    let contentBodyTrimmed = contentBody !== undefined ? contentBody.trim() : ''; // Ignore spaces in body text. Emojis with spaces in between should
    // still be counted as purely emoji messages.

    contentBodyTrimmed = contentBodyTrimmed.replace(WHITESPACE_REGEX, ''); // Remove zero width joiner characters from emoji messages. This ensures
    // that emojis that are made up of multiple unicode characters are still
    // presented as large.

    contentBodyTrimmed = contentBodyTrimmed.replace(ZWJ_REGEX, '');
    const match = BIGEMOJI_REGEX.exec(contentBodyTrimmed);
    emojiBody = match && match[0] && match[0].length === contentBodyTrimmed.length && ( // Prevent user pills expanding for users with only emoji in
    // their username. Permalinks (links in pills) can be any URL
    // now, so we just check for an HTTP-looking thing.
    strippedBody === safeBody || // replies have the html fallbacks, account for that here
    content.formatted_body === undefined || !content.formatted_body.includes("http:") && !content.formatted_body.includes("https:"));
  }

  const className = (0, _classnames.default)({
    'mx_EventTile_body': true,
    'mx_EventTile_bigEmoji': emojiBody,
    'markdown-body': isHtmlMessage && !emojiBody
  });
  let emojiBodyElements;

  if (!safeBody && bodyHasEmoji) {
    emojiBodyElements = formatEmojis(strippedBody, false);
  }

  return safeBody ? /*#__PURE__*/_react.default.createElement("span", {
    key: "body",
    ref: opts.ref,
    className: className,
    dangerouslySetInnerHTML: {
      __html: safeBody
    },
    dir: "auto"
  }) : /*#__PURE__*/_react.default.createElement("span", {
    key: "body",
    ref: opts.ref,
    className: className,
    dir: "auto"
  }, emojiBodyElements || strippedBody);
}
/**
 * Turn a room topic into html
 * @param topic plain text topic
 * @param htmlTopic optional html topic
 * @param ref React ref to attach to any React components returned
 * @param allowExtendedHtml whether to allow extended HTML tags such as headings and lists
 * @return The HTML-ified node.
 */


function topicToHtml(topic, htmlTopic, ref) {
  let allowExtendedHtml = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (!_SettingsStore.default.getValue("feature_html_topic")) {
    htmlTopic = null;
  }

  let isFormattedTopic = !!htmlTopic;
  let topicHasEmoji = false;
  let safeTopic = "";

  try {
    topicHasEmoji = mightContainEmoji(isFormattedTopic ? htmlTopic : topic);

    if (isFormattedTopic) {
      safeTopic = (0, _sanitizeHtml.default)(htmlTopic, allowExtendedHtml ? sanitizeHtmlParams : topicSanitizeHtmlParams);

      if (topicHasEmoji) {
        safeTopic = formatEmojis(safeTopic, true).join('');
      }
    }
  } catch {
    isFormattedTopic = false; // Fall back to plain-text topic
  }

  let emojiBodyElements;

  if (!isFormattedTopic && topicHasEmoji) {
    emojiBodyElements = formatEmojis(topic, false);
  }

  return isFormattedTopic ? /*#__PURE__*/_react.default.createElement("span", {
    ref: ref,
    dangerouslySetInnerHTML: {
      __html: safeTopic
    },
    dir: "auto"
  }) : /*#__PURE__*/_react.default.createElement("span", {
    ref: ref,
    dir: "auto"
  }, emojiBodyElements || topic);
}
/**
 * Linkifies the given string. This is a wrapper around 'linkifyjs/string'.
 *
 * @param {string} str string to linkify
 * @param {object} [options] Options for linkifyString. Default: linkifyMatrixOptions
 * @returns {string} Linkified string
 */


function linkifyString(str) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _linkifyMatrix.options;
  return (0, _linkifyMatrix._linkifyString)(str, options);
}
/**
 * Linkifies the given DOM element. This is a wrapper around 'linkifyjs/element'.
 *
 * @param {object} element DOM element to linkify
 * @param {object} [options] Options for linkifyElement. Default: linkifyMatrixOptions
 * @returns {object}
 */


function linkifyElement(element) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _linkifyMatrix.options;
  return (0, _linkifyMatrix._linkifyElement)(element, options);
}
/**
 * Linkify the given string and sanitize the HTML afterwards.
 *
 * @param {string} dirtyHtml The HTML string to sanitize and linkify
 * @param {object} [options] Options for linkifyString. Default: linkifyMatrixOptions
 * @returns {string}
 */


function linkifyAndSanitizeHtml(dirtyHtml) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _linkifyMatrix.options;
  return (0, _sanitizeHtml.default)(linkifyString(dirtyHtml, options), sanitizeHtmlParams);
}
/**
 * Returns if a node is a block element or not.
 * Only takes html nodes into account that are allowed in matrix messages.
 *
 * @param {Node} node
 * @returns {bool}
 */


function checkBlockNode(node) {
  switch (node.nodeName) {
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
    case "PRE":
    case "BLOCKQUOTE":
    case "P":
    case "UL":
    case "OL":
    case "LI":
    case "HR":
    case "TABLE":
    case "THEAD":
    case "TBODY":
    case "TR":
    case "TH":
    case "TD":
      return true;

    case "DIV":
      // don't treat math nodes as block nodes for deserializing
      return !node.hasAttribute("data-mx-maths");

    default:
      return false;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTVVJST0dBVEVfUEFJUl9QQVRURVJOIiwiU1lNQk9MX1BBVFRFUk4iLCJaV0pfUkVHRVgiLCJXSElURVNQQUNFX1JFR0VYIiwiQklHRU1PSklfUkVHRVgiLCJSZWdFeHAiLCJFTU9KSUJBU0VfUkVHRVgiLCJzb3VyY2UiLCJDT0xPUl9SRUdFWCIsIlBFUk1JVFRFRF9VUkxfU0NIRU1FUyIsIk1FRElBX0FQSV9NWENfUkVHRVgiLCJtaWdodENvbnRhaW5FbW9qaSIsInN0ciIsInRlc3QiLCJ1bmljb2RlVG9TaG9ydGNvZGUiLCJjaGFyIiwic2hvcnRjb2RlcyIsImdldEVtb2ppRnJvbVVuaWNvZGUiLCJsZW5ndGgiLCJzYW5pdGl6ZWRIdG1sTm9kZSIsImluc2FuZUh0bWwiLCJzYW5lSHRtbCIsInNhbml0aXplSHRtbCIsInNhbml0aXplSHRtbFBhcmFtcyIsIl9faHRtbCIsImdldEh0bWxUZXh0IiwiYWxsb3dlZFRhZ3MiLCJhbGxvd2VkQXR0cmlidXRlcyIsInNlbGZDbG9zaW5nIiwiYWxsb3dlZFNjaGVtZXMiLCJkaXNhbGxvd2VkVGFnc01vZGUiLCJpc1VybFBlcm1pdHRlZCIsImlucHV0VXJsIiwiaW5jbHVkZXMiLCJVUkwiLCJwcm90b2NvbCIsInNsaWNlIiwiZSIsInRyYW5zZm9ybVRhZ3MiLCJ0YWdOYW1lIiwiYXR0cmlicyIsImhyZWYiLCJ0YXJnZXQiLCJ0cmFuc2Zvcm1lZCIsInRyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmIiwibWF0Y2giLCJFTEVNRU5UX1VSTF9QQVRURVJOIiwicmVsIiwic3JjIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic3RhcnRzV2l0aCIsImV4ZWMiLCJyZXF1ZXN0ZWRXaWR0aCIsIk51bWJlciIsIndpZHRoIiwicmVxdWVzdGVkSGVpZ2h0IiwiaGVpZ2h0IiwiTWF0aCIsIm1pbiIsInN0eWxlIiwibWVkaWFGcm9tTXhjIiwiZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwIiwiY2xhc3MiLCJjbGFzc2VzIiwic3BsaXQiLCJmaWx0ZXIiLCJjbCIsImpvaW4iLCJjdXN0b21DU1NNYXBwZXIiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImN1c3RvbUF0dHJpYnV0ZUtleSIsImNzc0F0dHJpYnV0ZUtleSIsImN1c3RvbUF0dHJpYnV0ZVZhbHVlIiwiZm9udCIsInNwYW4iLCJkaXYiLCJhIiwiaW1nIiwib2wiLCJjb2RlIiwiYWxsb3dQcm90b2NvbFJlbGF0aXZlIiwibmVzdGluZ0xpbWl0IiwiY29tcG9zZXJTYW5pdGl6ZUh0bWxQYXJhbXMiLCJ0b3BpY1Nhbml0aXplSHRtbFBhcmFtcyIsIkJhc2VIaWdobGlnaHRlciIsImNvbnN0cnVjdG9yIiwiaGlnaGxpZ2h0Q2xhc3MiLCJoaWdobGlnaHRMaW5rIiwiYXBwbHlIaWdobGlnaHRzIiwic2FmZVNuaXBwZXQiLCJzYWZlSGlnaGxpZ2h0cyIsImxhc3RPZmZzZXQiLCJvZmZzZXQiLCJub2RlcyIsInNhZmVIaWdobGlnaHQiLCJ0b0xvd2VyQ2FzZSIsImluZGV4T2YiLCJzdWJTbmlwcGV0Iiwic3Vic3RyaW5nIiwiY29uY2F0IiwiYXBwbHlTdWJIaWdobGlnaHRzIiwiZW5kT2Zmc2V0IiwicHVzaCIsInByb2Nlc3NTbmlwcGV0IiwidW5kZWZpbmVkIiwiSHRtbEhpZ2hsaWdodGVyIiwic25pcHBldCIsImhpZ2hsaWdodCIsImVuY29kZVVSSSIsImVtb2ppVG9IdG1sU3BhbiIsImVtb2ppIiwiZW1vamlUb0pzeFNwYW4iLCJrZXkiLCJmb3JtYXRFbW9qaXMiLCJtZXNzYWdlIiwiaXNIdG1sTWVzc2FnZSIsImVtb2ppVG9TcGFuIiwicmVzdWx0IiwidGV4dCIsImJvZHlUb0h0bWwiLCJjb250ZW50IiwiaGlnaGxpZ2h0cyIsIm9wdHMiLCJpc0Zvcm1hdHRlZEJvZHkiLCJmb3JtYXQiLCJmb3JtYXR0ZWRfYm9keSIsImJvZHlIYXNFbW9qaSIsInNhbml0aXplUGFyYW1zIiwiZm9yQ29tcG9zZXJRdW90ZSIsInN0cmlwcGVkQm9keSIsInNhZmVCb2R5IiwibWFwIiwiZm9ybWF0dGVkQm9keSIsInBsYWluQm9keSIsImJvZHkiLCJzdHJpcFJlcGx5RmFsbGJhY2siLCJzdHJpcEhUTUxSZXBseSIsInN0cmlwUGxhaW5SZXBseSIsImhpZ2hsaWdodGVyIiwidGV4dEZpbHRlciIsInNhZmVUZXh0IiwicGh0bWwiLCJjaGVlcmlvIiwibG9hZCIsIl91c2VIdG1sUGFyc2VyMiIsImRlY29kZUVudGl0aWVzIiwiaXNQbGFpblRleHQiLCJodG1sIiwicm9vdCIsInJlcGxhY2VXaXRoIiwiaSIsImthdGV4IiwicmVuZGVyVG9TdHJpbmciLCJBbGxIdG1sRW50aXRpZXMiLCJkZWNvZGUiLCJhdHRyIiwidGhyb3dPbkVycm9yIiwiZGlzcGxheU1vZGUiLCJuYW1lIiwib3V0cHV0IiwiY29udGVudEJvZHkiLCJyZXR1cm5TdHJpbmciLCJlbW9qaUJvZHkiLCJkaXNhYmxlQmlnRW1vamkiLCJjb250ZW50Qm9keVRyaW1tZWQiLCJ0cmltIiwicmVwbGFjZSIsImNsYXNzTmFtZSIsImNsYXNzTmFtZXMiLCJlbW9qaUJvZHlFbGVtZW50cyIsInJlZiIsInRvcGljVG9IdG1sIiwidG9waWMiLCJodG1sVG9waWMiLCJhbGxvd0V4dGVuZGVkSHRtbCIsImlzRm9ybWF0dGVkVG9waWMiLCJ0b3BpY0hhc0Vtb2ppIiwic2FmZVRvcGljIiwibGlua2lmeVN0cmluZyIsIm9wdGlvbnMiLCJsaW5raWZ5TWF0cml4T3B0aW9ucyIsIl9saW5raWZ5U3RyaW5nIiwibGlua2lmeUVsZW1lbnQiLCJlbGVtZW50IiwiX2xpbmtpZnlFbGVtZW50IiwibGlua2lmeUFuZFNhbml0aXplSHRtbCIsImRpcnR5SHRtbCIsImNoZWNrQmxvY2tOb2RlIiwibm9kZSIsIm5vZGVOYW1lIiwiaGFzQXR0cmlidXRlIl0sInNvdXJjZXMiOlsiLi4vc3JjL0h0bWxVdGlscy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc2FuaXRpemVIdG1sIGZyb20gJ3Nhbml0aXplLWh0bWwnO1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbyc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBFTU9KSUJBU0VfUkVHRVggZnJvbSAnZW1vamliYXNlLXJlZ2V4JztcbmltcG9ydCB7IHNwbGl0IH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBrYXRleCBmcm9tICdrYXRleCc7XG5pbXBvcnQgeyBBbGxIdG1sRW50aXRpZXMgfSBmcm9tICdodG1sLWVudGl0aWVzJztcbmltcG9ydCB7IElDb250ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCB7IE9wdGlvbmFsIH0gZnJvbSAnbWF0cml4LWV2ZW50cy1zZGsnO1xuXG5pbXBvcnQge1xuICAgIF9saW5raWZ5RWxlbWVudCxcbiAgICBfbGlua2lmeVN0cmluZyxcbiAgICBFTEVNRU5UX1VSTF9QQVRURVJOLFxuICAgIG9wdGlvbnMgYXMgbGlua2lmeU1hdHJpeE9wdGlvbnMsXG59IGZyb20gJy4vbGlua2lmeS1tYXRyaXgnO1xuaW1wb3J0IHsgSUV4dGVuZGVkU2FuaXRpemVPcHRpb25zIH0gZnJvbSAnLi9AdHlwZXMvc2FuaXRpemUtaHRtbCc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IHsgdHJ5VHJhbnNmb3JtUGVybWFsaW5rVG9Mb2NhbEhyZWYgfSBmcm9tIFwiLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7IGdldEVtb2ppRnJvbVVuaWNvZGUgfSBmcm9tIFwiLi9lbW9qaVwiO1xuaW1wb3J0IHsgbWVkaWFGcm9tTXhjIH0gZnJvbSBcIi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCB7IHN0cmlwSFRNTFJlcGx5LCBzdHJpcFBsYWluUmVwbHkgfSBmcm9tICcuL3V0aWxzL1JlcGx5JztcblxuLy8gQW55dGhpbmcgb3V0c2lkZSB0aGUgYmFzaWMgbXVsdGlsaW5ndWFsIHBsYW5lIHdpbGwgYmUgYSBzdXJyb2dhdGUgcGFpclxuY29uc3QgU1VSUk9HQVRFX1BBSVJfUEFUVEVSTiA9IC8oW1xcdWQ4MDAtXFx1ZGJmZl0pKFtcXHVkYzAwLVxcdWRmZmZdKS87XG4vLyBBbmQgdGhlcmUgYSBidW5jaCBtb3JlIHN5bWJvbCBjaGFyYWN0ZXJzIHRoYXQgZW1vamliYXNlIGhhcyB3aXRoaW4gdGhlXG4vLyBCTVAsIHNvIHRoaXMgaW5jbHVkZXMgdGhlIHJhbmdlcyBmcm9tICdsZXR0ZXJsaWtlIHN5bWJvbHMnIHRvXG4vLyAnbWlzY2VsbGFuZW91cyBzeW1ib2xzIGFuZCBhcnJvd3MnIHdoaWNoIHNob3VsZCBjYXRjaCBhbGwgb2YgdGhlbVxuLy8gKHdpdGggcGxlbnR5IG9mIGZhbHNlIHBvc2l0aXZlcywgYnV0IHRoYXQncyBPSylcbmNvbnN0IFNZTUJPTF9QQVRURVJOID0gLyhbXFx1MjEwMC1cXHUyYmZmXSkvO1xuXG4vLyBSZWdleCBwYXR0ZXJuIGZvciBaZXJvLVdpZHRoIGpvaW5lciB1bmljb2RlIGNoYXJhY3RlcnNcbmNvbnN0IFpXSl9SRUdFWCA9IC9bXFx1MjAwRFxcdTIwMDNdL2c7XG5cbi8vIFJlZ2V4IHBhdHRlcm4gZm9yIHdoaXRlc3BhY2UgY2hhcmFjdGVyc1xuY29uc3QgV0hJVEVTUEFDRV9SRUdFWCA9IC9cXHMvZztcblxuY29uc3QgQklHRU1PSklfUkVHRVggPSBuZXcgUmVnRXhwKGBeKCR7RU1PSklCQVNFX1JFR0VYLnNvdXJjZX0pKyRgLCAnaScpO1xuXG5jb25zdCBDT0xPUl9SRUdFWCA9IC9eI1swLTlhLWZBLUZdezZ9JC87XG5cbmV4cG9ydCBjb25zdCBQRVJNSVRURURfVVJMX1NDSEVNRVMgPSBbXG4gICAgXCJiaXRjb2luXCIsXG4gICAgXCJmdHBcIixcbiAgICBcImdlb1wiLFxuICAgIFwiaHR0cFwiLFxuICAgIFwiaHR0cHNcIixcbiAgICBcImltXCIsXG4gICAgXCJpcmNcIixcbiAgICBcImlyY3NcIixcbiAgICBcIm1hZ25ldFwiLFxuICAgIFwibWFpbHRvXCIsXG4gICAgXCJtYXRyaXhcIixcbiAgICBcIm1tc1wiLFxuICAgIFwibmV3c1wiLFxuICAgIFwibm50cFwiLFxuICAgIFwib3BlbnBncDRmcHJcIixcbiAgICBcInNpcFwiLFxuICAgIFwic2Z0cFwiLFxuICAgIFwic21zXCIsXG4gICAgXCJzbXN0b1wiLFxuICAgIFwic3NoXCIsXG4gICAgXCJ0ZWxcIixcbiAgICBcInVyblwiLFxuICAgIFwid2ViY2FsXCIsXG4gICAgXCJ3dGFpXCIsXG4gICAgXCJ4bXBwXCIsXG5dO1xuXG5jb25zdCBNRURJQV9BUElfTVhDX1JFR0VYID0gL1xcL19tYXRyaXhcXC9tZWRpYVxcL3IwXFwvKD86ZG93bmxvYWR8dGh1bWJuYWlsKVxcLyguKz8pXFwvKC4rPykoPzpbPy9dfCQpLztcblxuLypcbiAqIFJldHVybiB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgY29udGFpbnMgZW1vamlcbiAqIFVzZXMgYSBtdWNoLCBtdWNoIHNpbXBsZXIgcmVnZXggdGhhbiBlbW9qaWJhc2UncyBzbyB3aWxsIGdpdmUgZmFsc2VcbiAqIHBvc2l0aXZlcywgYnV0IHVzZWZ1bCBmb3IgZmFzdC1wYXRoIHRlc3Rpbmcgc3RyaW5ncyB0byBzZWUgaWYgdGhleVxuICogbmVlZCBlbW9qaWZpY2F0aW9uLlxuICovXG5mdW5jdGlvbiBtaWdodENvbnRhaW5FbW9qaShzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBTVVJST0dBVEVfUEFJUl9QQVRURVJOLnRlc3Qoc3RyKSB8fCBTWU1CT0xfUEFUVEVSTi50ZXN0KHN0cik7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2hvcnRjb2RlIGZvciBhbiBlbW9qaSBjaGFyYWN0ZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGNoYXIgVGhlIGVtb2ppIGNoYXJhY3RlclxuICogQHJldHVybiB7U3RyaW5nfSBUaGUgc2hvcnRjb2RlIChzdWNoIGFzIDp0aHVtYnVwOilcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaWNvZGVUb1Nob3J0Y29kZShjaGFyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNob3J0Y29kZXMgPSBnZXRFbW9qaUZyb21Vbmljb2RlKGNoYXIpPy5zaG9ydGNvZGVzO1xuICAgIHJldHVybiBzaG9ydGNvZGVzPy5sZW5ndGggPyBgOiR7c2hvcnRjb2Rlc1swXX06YCA6ICcnO1xufVxuXG4vKlxuICogR2l2ZW4gYW4gdW50cnVzdGVkIEhUTUwgc3RyaW5nLCByZXR1cm4gYSBSZWFjdCBub2RlIHdpdGggYW4gc2FuaXRpemVkIHZlcnNpb25cbiAqIG9mIHRoYXQgSFRNTC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplZEh0bWxOb2RlKGluc2FuZUh0bWw6IHN0cmluZyk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3Qgc2FuZUh0bWwgPSBzYW5pdGl6ZUh0bWwoaW5zYW5lSHRtbCwgc2FuaXRpemVIdG1sUGFyYW1zKTtcblxuICAgIHJldHVybiA8ZGl2IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogc2FuZUh0bWwgfX0gZGlyPVwiYXV0b1wiIC8+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SHRtbFRleHQoaW5zYW5lSHRtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc2FuaXRpemVIdG1sKGluc2FuZUh0bWwsIHtcbiAgICAgICAgYWxsb3dlZFRhZ3M6IFtdLFxuICAgICAgICBhbGxvd2VkQXR0cmlidXRlczoge30sXG4gICAgICAgIHNlbGZDbG9zaW5nOiBbXSxcbiAgICAgICAgYWxsb3dlZFNjaGVtZXM6IFtdLFxuICAgICAgICBkaXNhbGxvd2VkVGFnc01vZGU6ICdkaXNjYXJkJyxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBUZXN0cyBpZiBhIFVSTCBmcm9tIGFuIHVudHJ1c3RlZCBzb3VyY2UgbWF5IGJlIHNhZmVseSBwdXQgaW50byB0aGUgRE9NXG4gKiBUaGUgYmlnZ2VzdCB0aHJlYXQgaGVyZSBpcyBqYXZhc2NyaXB0OiBVUklzLlxuICogTm90ZSB0aGF0IHRoZSBIVE1MIHNhbml0aXNlciBsaWJyYXJ5IGhhcyBpdHMgb3duIGludGVybmFsIGxvZ2ljIGZvclxuICogZG9pbmcgdGhpcywgdG8gd2hpY2ggd2UgcGFzcyB0aGUgc2FtZSBsaXN0IG9mIHNjaGVtZXMuIFRoaXMgaXMgdXNlZCBpblxuICogb3RoZXIgcGxhY2VzIHdlIG5lZWQgdG8gc2FuaXRpc2UgVVJMcy5cbiAqIEByZXR1cm4gdHJ1ZSBpZiBwZXJtaXR0ZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNVcmxQZXJtaXR0ZWQoaW5wdXRVcmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIFVSTCBwYXJzZXIgcHJvdG9jb2wgaW5jbHVkZXMgdGhlIHRyYWlsaW5nIGNvbG9uXG4gICAgICAgIHJldHVybiBQRVJNSVRURURfVVJMX1NDSEVNRVMuaW5jbHVkZXMobmV3IFVSTChpbnB1dFVybCkucHJvdG9jb2wuc2xpY2UoMCwgLTEpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmNvbnN0IHRyYW5zZm9ybVRhZ3M6IElFeHRlbmRlZFNhbml0aXplT3B0aW9uc1tcInRyYW5zZm9ybVRhZ3NcIl0gPSB7IC8vIGN1c3RvbSB0byBtYXRyaXhcbiAgICAvLyBhZGQgYmxhbmsgdGFyZ2V0cyB0byBhbGwgaHlwZXJsaW5rcyBleGNlcHQgdmVjdG9yIFVSTHNcbiAgICAnYSc6IGZ1bmN0aW9uKHRhZ05hbWU6IHN0cmluZywgYXR0cmliczogc2FuaXRpemVIdG1sLkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKGF0dHJpYnMuaHJlZikge1xuICAgICAgICAgICAgYXR0cmlicy50YXJnZXQgPSAnX2JsYW5rJzsgLy8gYnkgZGVmYXVsdFxuXG4gICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZCA9IHRyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmKGF0dHJpYnMuaHJlZik7IC8vIG9ubHkgdXNlZCB0byBjaGVjayBpZiBpdCBpcyBhIGxpbmsgdGhhdCBjYW4gYmUgaGFuZGxlZCBsb2NhbGx5XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWQgIT09IGF0dHJpYnMuaHJlZiB8fCAvLyBpdCBjb3VsZCBiZSBjb252ZXJ0ZWQgc28gaGFuZGxlIGxvY2FsbHkgc3ltYm9scyBlLmcuIEB1c2VyOnNlcnZlci50ZGwsIG1hdHJpeDogYW5kIG1hdHJpeC50b1xuICAgICAgICAgICAgICAgIGF0dHJpYnMuaHJlZi5tYXRjaChFTEVNRU5UX1VSTF9QQVRURVJOKSAvLyBmb3IgaHR0cHMgbGlua3MgdG8gRWxlbWVudCBkb21haW5zXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlicy50YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBEZWxldGUgdGhlIGhyZWYgYXR0cmliIGlmIGl0IGlzIGZhbHN5XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlicy5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0cmlicy5yZWwgPSAnbm9yZWZlcnJlciBub29wZW5lcic7IC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5naXRodWIuaW8vcmVsLW5vb3BlbmVyL1xuICAgICAgICByZXR1cm4geyB0YWdOYW1lLCBhdHRyaWJzIH07XG4gICAgfSxcbiAgICAnaW1nJzogZnVuY3Rpb24odGFnTmFtZTogc3RyaW5nLCBhdHRyaWJzOiBzYW5pdGl6ZUh0bWwuQXR0cmlidXRlcykge1xuICAgICAgICBsZXQgc3JjID0gYXR0cmlicy5zcmM7XG4gICAgICAgIC8vIFN0cmlwIG91dCBpbWdzIHRoYXQgYXJlbid0IGBteGNgIGhlcmUgaW5zdGVhZCBvZiB1c2luZyBhbGxvd2VkU2NoZW1lc0J5VGFnXG4gICAgICAgIC8vIGJlY2F1c2UgdHJhbnNmb3JtVGFncyBpcyB1c2VkIF9iZWZvcmVfIHdlIGZpbHRlciBieSBhbGxvd2VkU2NoZW1lc0J5VGFnIGFuZFxuICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGFsbG93IGltYWdlcyB3aXRoIGBodHRwcz9gIGBzcmNgcy5cbiAgICAgICAgLy8gV2UgYWxzbyBkcm9wIGlubGluZSBpbWFnZXMgKGFzIGlmIHRoZXkgd2VyZSBub3QgcHJlc2VudCBhdCBhbGwpIHdoZW4gdGhlIFwic2hvd1xuICAgICAgICAvLyBpbWFnZXNcIiBwcmVmZXJlbmNlIGlzIGRpc2FibGVkLiBGdXR1cmUgd29yayBtaWdodCBleHBvc2Ugc29tZSBVSSB0byByZXZlYWwgdGhlbVxuICAgICAgICAvLyBsaWtlIHN0YW5kYWxvbmUgaW1hZ2UgZXZlbnRzIGhhdmUuXG4gICAgICAgIGlmICghc3JjIHx8ICFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd0ltYWdlc1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdGFnTmFtZSwgYXR0cmliczoge30gfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3JjLnN0YXJ0c1dpdGgoXCJteGM6Ly9cIikpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gTUVESUFfQVBJX01YQ19SRUdFWC5leGVjKHNyYyk7XG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBgbXhjOi8vJHttYXRjaFsxXX0vJHttYXRjaFsyXX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzcmMuc3RhcnRzV2l0aChcIm14YzovL1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdGFnTmFtZSwgYXR0cmliczoge30gfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcXVlc3RlZFdpZHRoID0gTnVtYmVyKGF0dHJpYnMud2lkdGgpO1xuICAgICAgICBjb25zdCByZXF1ZXN0ZWRIZWlnaHQgPSBOdW1iZXIoYXR0cmlicy5oZWlnaHQpO1xuICAgICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWluKHJlcXVlc3RlZFdpZHRoIHx8IDgwMCwgODAwKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5taW4ocmVxdWVzdGVkSGVpZ2h0IHx8IDYwMCwgNjAwKTtcbiAgICAgICAgLy8gc3BlY2lmeSB3aWR0aC9oZWlnaHQgYXMgbWF4IHZhbHVlcyBpbnN0ZWFkIG9mIGFic29sdXRlIG9uZXMgdG8gYWxsb3cgb2JqZWN0LWZpdCB0byBkbyBpdHMgdGhpbmdcbiAgICAgICAgLy8gd2Ugb25seSBhbGxvdyBvdXIgb3duIHN0eWxlcyBmb3IgdGhpcyB0YWcgc28gb3ZlcndyaXRlIHRoZSBhdHRyaWJ1dGVcbiAgICAgICAgYXR0cmlicy5zdHlsZSA9IGBtYXgtd2lkdGg6ICR7d2lkdGh9cHg7IG1heC1oZWlnaHQ6ICR7aGVpZ2h0fXB4O2A7XG4gICAgICAgIGlmIChyZXF1ZXN0ZWRXaWR0aCkge1xuICAgICAgICAgICAgYXR0cmlicy5zdHlsZSArPSBcIndpZHRoOiAxMDAlO1wiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXF1ZXN0ZWRIZWlnaHQpIHtcbiAgICAgICAgICAgIGF0dHJpYnMuc3R5bGUgKz0gXCJoZWlnaHQ6IDEwMCU7XCI7XG4gICAgICAgIH1cblxuICAgICAgICBhdHRyaWJzLnNyYyA9IG1lZGlhRnJvbU14YyhzcmMpLmdldFRodW1ibmFpbE9mU291cmNlSHR0cCh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIHsgdGFnTmFtZSwgYXR0cmlicyB9O1xuICAgIH0sXG4gICAgJ2NvZGUnOiBmdW5jdGlvbih0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnM6IHNhbml0aXplSHRtbC5BdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXR0cmlicy5jbGFzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgYWxsIGNsYXNzZXMgb3RoZXIgdGhhbiBvbmVzIHN0YXJ0aW5nIHdpdGggbGFuZ3VhZ2UtIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nLlxuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGF0dHJpYnMuY2xhc3Muc3BsaXQoL1xccy8pLmZpbHRlcihmdW5jdGlvbihjbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbC5zdGFydHNXaXRoKCdsYW5ndWFnZS0nKSAmJiAhY2wuc3RhcnRzV2l0aCgnbGFuZ3VhZ2UtXycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhdHRyaWJzLmNsYXNzID0gY2xhc3Nlcy5qb2luKCcgJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdGFnTmFtZSwgYXR0cmlicyB9O1xuICAgIH0sXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuICAgICcqJzogZnVuY3Rpb24odGFnTmFtZTogc3RyaW5nLCBhdHRyaWJzOiBzYW5pdGl6ZUh0bWwuQXR0cmlidXRlcykge1xuICAgICAgICAvLyBEZWxldGUgYW55IHN0eWxlIHByZXZpb3VzbHkgYXNzaWduZWQsIHN0eWxlIGlzIGFuIGFsbG93ZWRUYWcgZm9yIGZvbnQsIHNwYW4gJiBpbWcsXG4gICAgICAgIC8vIGJlY2F1c2UgYXR0cmlidXRlcyBhcmUgc3RyaXBwZWQgYWZ0ZXIgdHJhbnNmb3JtaW5nLlxuICAgICAgICAvLyBGb3IgaW1nIHRoaXMgaXMgdHJ1c3RlZCBhcyBpdCBpcyBnZW5lcmF0ZWQgd2hvbGx5IHdpdGhpbiB0aGUgaW1nIHRyYW5zZm9ybWF0aW9uIG1ldGhvZC5cbiAgICAgICAgaWYgKHRhZ05hbWUgIT09IFwiaW1nXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJzLnN0eWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2FuaXRpc2UgYW5kIHRyYW5zZm9ybSBkYXRhLW14LWNvbG9yIGFuZCBkYXRhLW14LWJnLWNvbG9yIHRvIHRoZWlyIENTU1xuICAgICAgICAvLyBlcXVpdmFsZW50c1xuICAgICAgICBjb25zdCBjdXN0b21DU1NNYXBwZXIgPSB7XG4gICAgICAgICAgICAnZGF0YS1teC1jb2xvcic6ICdjb2xvcicsXG4gICAgICAgICAgICAnZGF0YS1teC1iZy1jb2xvcic6ICdiYWNrZ3JvdW5kLWNvbG9yJyxcbiAgICAgICAgICAgIC8vICRjdXN0b21BdHRyaWJ1dGVLZXk6ICRjc3NBdHRyaWJ1dGVLZXlcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgc3R5bGUgPSBcIlwiO1xuICAgICAgICBPYmplY3Qua2V5cyhjdXN0b21DU1NNYXBwZXIpLmZvckVhY2goKGN1c3RvbUF0dHJpYnV0ZUtleSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3NzQXR0cmlidXRlS2V5ID0gY3VzdG9tQ1NTTWFwcGVyW2N1c3RvbUF0dHJpYnV0ZUtleV07XG4gICAgICAgICAgICBjb25zdCBjdXN0b21BdHRyaWJ1dGVWYWx1ZSA9IGF0dHJpYnNbY3VzdG9tQXR0cmlidXRlS2V5XTtcbiAgICAgICAgICAgIGlmIChjdXN0b21BdHRyaWJ1dGVWYWx1ZSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiBjdXN0b21BdHRyaWJ1dGVWYWx1ZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICBDT0xPUl9SRUdFWC50ZXN0KGN1c3RvbUF0dHJpYnV0ZVZhbHVlKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3R5bGUgKz0gY3NzQXR0cmlidXRlS2V5ICsgXCI6XCIgKyBjdXN0b21BdHRyaWJ1dGVWYWx1ZSArIFwiO1wiO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJzW2N1c3RvbUF0dHJpYnV0ZUtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzdHlsZSkge1xuICAgICAgICAgICAgYXR0cmlicy5zdHlsZSA9IHN0eWxlICsgKGF0dHJpYnMuc3R5bGUgfHwgXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyB0YWdOYW1lLCBhdHRyaWJzIH07XG4gICAgfSxcbn07XG5cbmNvbnN0IHNhbml0aXplSHRtbFBhcmFtczogSUV4dGVuZGVkU2FuaXRpemVPcHRpb25zID0ge1xuICAgIGFsbG93ZWRUYWdzOiBbXG4gICAgICAgICdmb250JywgLy8gY3VzdG9tIHRvIG1hdHJpeCBmb3IgSVJDLXN0eWxlIGZvbnQgY29sb3JpbmdcbiAgICAgICAgJ2RlbCcsIC8vIGZvciBtYXJrZG93blxuICAgICAgICAnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnLCAnYmxvY2txdW90ZScsICdwJywgJ2EnLCAndWwnLCAnb2wnLCAnc3VwJywgJ3N1YicsXG4gICAgICAgICdubCcsICdsaScsICdiJywgJ2knLCAndScsICdzdHJvbmcnLCAnZW0nLCAnc3RyaWtlJywgJ2NvZGUnLCAnaHInLCAnYnInLCAnZGl2JyxcbiAgICAgICAgJ3RhYmxlJywgJ3RoZWFkJywgJ2NhcHRpb24nLCAndGJvZHknLCAndHInLCAndGgnLCAndGQnLCAncHJlJywgJ3NwYW4nLCAnaW1nJyxcbiAgICAgICAgJ2RldGFpbHMnLCAnc3VtbWFyeScsXG4gICAgXSxcbiAgICBhbGxvd2VkQXR0cmlidXRlczoge1xuICAgICAgICAvLyBhdHRyaWJ1dGUgc2FuaXRpemF0aW9uIGhhcHBlbnMgYWZ0ZXIgdHJhbnNmb3JtYXRpb25zLCBzbyB3ZSBoYXZlIHRvIGFjY2VwdCBgc3R5bGVgIGZvciBmb250LCBzcGFuICYgaW1nXG4gICAgICAgIC8vIGJ1dCBzdHJpcCBkdXJpbmcgdGhlIHRyYW5zZm9ybWF0aW9uLlxuICAgICAgICAvLyBjdXN0b20gb25lcyBmaXJzdDpcbiAgICAgICAgZm9udDogWydjb2xvcicsICdkYXRhLW14LWJnLWNvbG9yJywgJ2RhdGEtbXgtY29sb3InLCAnc3R5bGUnXSwgLy8gY3VzdG9tIHRvIG1hdHJpeFxuICAgICAgICBzcGFuOiBbJ2RhdGEtbXgtbWF0aHMnLCAnZGF0YS1teC1iZy1jb2xvcicsICdkYXRhLW14LWNvbG9yJywgJ2RhdGEtbXgtc3BvaWxlcicsICdzdHlsZSddLCAvLyBjdXN0b20gdG8gbWF0cml4XG4gICAgICAgIGRpdjogWydkYXRhLW14LW1hdGhzJ10sXG4gICAgICAgIGE6IFsnaHJlZicsICduYW1lJywgJ3RhcmdldCcsICdyZWwnXSwgLy8gcmVtb3RlIHRhcmdldDogY3VzdG9tIHRvIG1hdHJpeFxuICAgICAgICAvLyBpbWcgdGFncyBhbHNvIGFjY2VwdCB3aWR0aC9oZWlnaHQsIHdlIGp1c3QgbWFwIHRob3NlIHRvIG1heC13aWR0aCAmIG1heC1oZWlnaHQgZHVyaW5nIHRyYW5zZm9ybWF0aW9uXG4gICAgICAgIGltZzogWydzcmMnLCAnYWx0JywgJ3RpdGxlJywgJ3N0eWxlJ10sXG4gICAgICAgIG9sOiBbJ3N0YXJ0J10sXG4gICAgICAgIGNvZGU6IFsnY2xhc3MnXSwgLy8gV2UgZG9uJ3QgYWN0dWFsbHkgYWxsb3cgYWxsIGNsYXNzZXMsIHdlIGZpbHRlciB0aGVtIGluIHRyYW5zZm9ybVRhZ3NcbiAgICB9LFxuICAgIC8vIExvdHMgb2YgdGhlc2Ugd29uJ3QgY29tZSB1cCBieSBkZWZhdWx0IGJlY2F1c2Ugd2UgZG9uJ3QgYWxsb3cgdGhlbVxuICAgIHNlbGZDbG9zaW5nOiBbJ2ltZycsICdicicsICdocicsICdhcmVhJywgJ2Jhc2UnLCAnYmFzZWZvbnQnLCAnaW5wdXQnLCAnbGluaycsICdtZXRhJ10sXG4gICAgLy8gVVJMIHNjaGVtZXMgd2UgcGVybWl0XG4gICAgYWxsb3dlZFNjaGVtZXM6IFBFUk1JVFRFRF9VUkxfU0NIRU1FUyxcbiAgICBhbGxvd1Byb3RvY29sUmVsYXRpdmU6IGZhbHNlLFxuICAgIHRyYW5zZm9ybVRhZ3MsXG4gICAgLy8gNTAgbGV2ZWxzIGRlZXAgXCJzaG91bGQgYmUgZW5vdWdoIGZvciBhbnlvbmVcIlxuICAgIG5lc3RpbmdMaW1pdDogNTAsXG59O1xuXG4vLyB0aGlzIGlzIHRoZSBzYW1lIGFzIHRoZSBhYm92ZSBleGNlcHQgd2l0aCBsZXNzIHJld3JpdGluZ1xuY29uc3QgY29tcG9zZXJTYW5pdGl6ZUh0bWxQYXJhbXM6IElFeHRlbmRlZFNhbml0aXplT3B0aW9ucyA9IHtcbiAgICAuLi5zYW5pdGl6ZUh0bWxQYXJhbXMsXG4gICAgdHJhbnNmb3JtVGFnczoge1xuICAgICAgICAnY29kZSc6IHRyYW5zZm9ybVRhZ3NbJ2NvZGUnXSxcbiAgICAgICAgJyonOiB0cmFuc2Zvcm1UYWdzWycqJ10sXG4gICAgfSxcbn07XG5cbi8vIHJlZHVjZWQgc2V0IG9mIGFsbG93ZWQgdGFncyB0byBhdm9pZCB0dXJuaW5nIHRvcGljcyBpbnRvIE15c3BhY2VcbmNvbnN0IHRvcGljU2FuaXRpemVIdG1sUGFyYW1zOiBJRXh0ZW5kZWRTYW5pdGl6ZU9wdGlvbnMgPSB7XG4gICAgLi4uc2FuaXRpemVIdG1sUGFyYW1zLFxuICAgIGFsbG93ZWRUYWdzOiBbXG4gICAgICAgICdmb250JywgLy8gY3VzdG9tIHRvIG1hdHJpeCBmb3IgSVJDLXN0eWxlIGZvbnQgY29sb3JpbmdcbiAgICAgICAgJ2RlbCcsIC8vIGZvciBtYXJrZG93blxuICAgICAgICAnYScsICdzdXAnLCAnc3ViJyxcbiAgICAgICAgJ2InLCAnaScsICd1JywgJ3N0cm9uZycsICdlbScsICdzdHJpa2UnLCAnYnInLCAnZGl2JyxcbiAgICAgICAgJ3NwYW4nLFxuICAgIF0sXG59O1xuXG5hYnN0cmFjdCBjbGFzcyBCYXNlSGlnaGxpZ2h0ZXI8VCBleHRlbmRzIFJlYWN0LlJlYWN0Tm9kZT4ge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBoaWdobGlnaHRDbGFzczogc3RyaW5nLCBwdWJsaWMgaGlnaGxpZ2h0TGluazogc3RyaW5nKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogYXBwbHkgdGhlIGhpZ2hsaWdodHMgdG8gYSBzZWN0aW9uIG9mIHRleHRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzYWZlU25pcHBldCBUaGUgc25pcHBldCBvZiB0ZXh0IHRvIGFwcGx5IHRoZSBoaWdobGlnaHRzXG4gICAgICogICAgIHRvLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHNhZmVIaWdobGlnaHRzIEEgbGlzdCBvZiBzdWJzdHJpbmdzIHRvIGhpZ2hsaWdodCxcbiAgICAgKiAgICAgc29ydGVkIGJ5IGRlc2NlbmRpbmcgbGVuZ3RoLlxuICAgICAqXG4gICAgICogcmV0dXJucyBhIGxpc3Qgb2YgcmVzdWx0cyAoc3RyaW5ncyBmb3IgSHRtbEhpZ2hsaWdoZXIsIHJlYWN0IG5vZGVzIGZvclxuICAgICAqIFRleHRIaWdobGlnaHRlcikuXG4gICAgICovXG4gICAgcHVibGljIGFwcGx5SGlnaGxpZ2h0cyhzYWZlU25pcHBldDogc3RyaW5nLCBzYWZlSGlnaGxpZ2h0czogc3RyaW5nW10pOiBUW10ge1xuICAgICAgICBsZXQgbGFzdE9mZnNldCA9IDA7XG4gICAgICAgIGxldCBvZmZzZXQ7XG4gICAgICAgIGxldCBub2RlczogVFtdID0gW107XG5cbiAgICAgICAgY29uc3Qgc2FmZUhpZ2hsaWdodCA9IHNhZmVIaWdobGlnaHRzWzBdO1xuICAgICAgICB3aGlsZSAoKG9mZnNldCA9IHNhZmVTbmlwcGV0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzYWZlSGlnaGxpZ2h0LnRvTG93ZXJDYXNlKCksIGxhc3RPZmZzZXQpKSA+PSAwKSB7XG4gICAgICAgICAgICAvLyBoYW5kbGUgcHJlYW1ibGVcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiBsYXN0T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViU25pcHBldCA9IHNhZmVTbmlwcGV0LnN1YnN0cmluZyhsYXN0T2Zmc2V0LCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIG5vZGVzID0gbm9kZXMuY29uY2F0KHRoaXMuYXBwbHlTdWJIaWdobGlnaHRzKHN1YlNuaXBwZXQsIHNhZmVIaWdobGlnaHRzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIGhpZ2hsaWdodC4gdXNlIHRoZSBvcmlnaW5hbCBzdHJpbmcgcmF0aGVyIHRoYW4gc2FmZUhpZ2hsaWdodFxuICAgICAgICAgICAgLy8gdG8gcHJlc2VydmUgdGhlIG9yaWdpbmFsIGNhc2luZy5cbiAgICAgICAgICAgIGNvbnN0IGVuZE9mZnNldCA9IG9mZnNldCArIHNhZmVIaWdobGlnaHQubGVuZ3RoO1xuICAgICAgICAgICAgbm9kZXMucHVzaCh0aGlzLnByb2Nlc3NTbmlwcGV0KHNhZmVTbmlwcGV0LnN1YnN0cmluZyhvZmZzZXQsIGVuZE9mZnNldCksIHRydWUpKTtcblxuICAgICAgICAgICAgbGFzdE9mZnNldCA9IGVuZE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhhbmRsZSBwb3N0YW1ibGVcbiAgICAgICAgaWYgKGxhc3RPZmZzZXQgIT09IHNhZmVTbmlwcGV0Lmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3ViU25pcHBldCA9IHNhZmVTbmlwcGV0LnN1YnN0cmluZyhsYXN0T2Zmc2V0LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgbm9kZXMgPSBub2Rlcy5jb25jYXQodGhpcy5hcHBseVN1YkhpZ2hsaWdodHMoc3ViU25pcHBldCwgc2FmZUhpZ2hsaWdodHMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseVN1YkhpZ2hsaWdodHMoc2FmZVNuaXBwZXQ6IHN0cmluZywgc2FmZUhpZ2hsaWdodHM6IHN0cmluZ1tdKTogVFtdIHtcbiAgICAgICAgaWYgKHNhZmVIaWdobGlnaHRzWzFdKSB7XG4gICAgICAgICAgICAvLyByZWN1cnNlIGludG8gdGhpcyByYW5nZSB0byBjaGVjayBmb3IgdGhlIG5leHQgc2V0IG9mIGhpZ2hsaWdodCBtYXRjaGVzXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBseUhpZ2hsaWdodHMoc2FmZVNuaXBwZXQsIHNhZmVIaWdobGlnaHRzLnNsaWNlKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5vIG1vcmUgaGlnaGxpZ2h0cyB0byBiZSBmb3VuZCwganVzdCByZXR1cm4gdGhlIHVuaGlnaGxpZ2h0ZWQgc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gW3RoaXMucHJvY2Vzc1NuaXBwZXQoc2FmZVNuaXBwZXQsIGZhbHNlKV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcHJvY2Vzc1NuaXBwZXQoc25pcHBldDogc3RyaW5nLCBoaWdobGlnaHQ6IGJvb2xlYW4pOiBUO1xufVxuXG5jbGFzcyBIdG1sSGlnaGxpZ2h0ZXIgZXh0ZW5kcyBCYXNlSGlnaGxpZ2h0ZXI8c3RyaW5nPiB7XG4gICAgLyogaGlnaGxpZ2h0IHRoZSBnaXZlbiBzbmlwcGV0IGlmIHJlcXVpcmVkXG4gICAgICpcbiAgICAgKiBzbmlwcGV0OiBjb250ZW50IG9mIHRoZSBzcGFuOyBtdXN0IGhhdmUgYmVlbiBzYW5pdGlzZWRcbiAgICAgKiBoaWdobGlnaHQ6IHRydWUgdG8gaGlnaGxpZ2h0IGFzIGEgc2VhcmNoIG1hdGNoXG4gICAgICpcbiAgICAgKiByZXR1cm5zIGFuIEhUTUwgc3RyaW5nXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHByb2Nlc3NTbmlwcGV0KHNuaXBwZXQ6IHN0cmluZywgaGlnaGxpZ2h0OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCFoaWdobGlnaHQpIHtcbiAgICAgICAgICAgIC8vIG5vdGhpbmcgcmVxdWlyZWQgaGVyZVxuICAgICAgICAgICAgcmV0dXJuIHNuaXBwZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3BhbiA9IGA8c3BhbiBjbGFzcz1cIiR7dGhpcy5oaWdobGlnaHRDbGFzc31cIj4ke3NuaXBwZXR9PC9zcGFuPmA7XG5cbiAgICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0TGluaykge1xuICAgICAgICAgICAgc3BhbiA9IGA8YSBocmVmPVwiJHtlbmNvZGVVUkkodGhpcy5oaWdobGlnaHRMaW5rKX1cIj4ke3NwYW59PC9hPmA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNwYW47XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSU9wdHMge1xuICAgIGhpZ2hsaWdodExpbms/OiBzdHJpbmc7XG4gICAgZGlzYWJsZUJpZ0Vtb2ppPzogYm9vbGVhbjtcbiAgICBzdHJpcFJlcGx5RmFsbGJhY2s/OiBib29sZWFuO1xuICAgIHJldHVyblN0cmluZz86IGJvb2xlYW47XG4gICAgZm9yQ29tcG9zZXJRdW90ZT86IGJvb2xlYW47XG4gICAgcmVmPzogUmVhY3QuUmVmPEhUTUxTcGFuRWxlbWVudD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdHNSZXR1cm5Ob2RlIGV4dGVuZHMgSU9wdHMge1xuICAgIHJldHVyblN0cmluZzogZmFsc2UgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdHNSZXR1cm5TdHJpbmcgZXh0ZW5kcyBJT3B0cyB7XG4gICAgcmV0dXJuU3RyaW5nOiB0cnVlO1xufVxuXG5jb25zdCBlbW9qaVRvSHRtbFNwYW4gPSAoZW1vamk6IHN0cmluZykgPT5cbiAgICBgPHNwYW4gY2xhc3M9J214X0Vtb2ppJyB0aXRsZT0nJHt1bmljb2RlVG9TaG9ydGNvZGUoZW1vamkpfSc+JHtlbW9qaX08L3NwYW4+YDtcbmNvbnN0IGVtb2ppVG9Kc3hTcGFuID0gKGVtb2ppOiBzdHJpbmcsIGtleTogbnVtYmVyKSA9PlxuICAgIDxzcGFuIGtleT17a2V5fSBjbGFzc05hbWU9J214X0Vtb2ppJyB0aXRsZT17dW5pY29kZVRvU2hvcnRjb2RlKGVtb2ppKX0+eyBlbW9qaSB9PC9zcGFuPjtcblxuLyoqXG4gKiBXcmFwcyBlbW9qaXMgaW4gPHNwYW4+IHRvIHN0eWxlIHRoZW0gc2VwYXJhdGVseSBmcm9tIHRoZSByZXN0IG9mIG1lc3NhZ2UuIENvbnNlY3V0aXZlIGVtb2ppcyAoYW5kIG1vZGlmaWVycykgYXJlIHdyYXBwZWRcbiAqIGluIHRoZSBzYW1lIDxzcGFuPi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIHRoZSB0ZXh0IHRvIGZvcm1hdFxuICogQHBhcmFtIHtib29sZWFufSBpc0h0bWxNZXNzYWdlIHdoZXRoZXIgdGhlIG1lc3NhZ2UgY29udGFpbnMgSFRNTFxuICogQHJldHVybnMgaWYgaXNIdG1sTWVzc2FnZSBpcyB0cnVlLCByZXR1cm5zIGFuIGFycmF5IG9mIHN0cmluZ3MsIG90aGVyd2lzZSByZXR1cm4gYW4gYXJyYXkgb2YgUmVhY3QgRWxlbWVudHMgZm9yIGVtb2ppc1xuICogYW5kIHBsYWluIHRleHQgZm9yIGV2ZXJ5dGhpbmcgZWxzZVxuICovXG5mdW5jdGlvbiBmb3JtYXRFbW9qaXMobWVzc2FnZTogc3RyaW5nLCBpc0h0bWxNZXNzYWdlOiBib29sZWFuKTogKEpTWC5FbGVtZW50IHwgc3RyaW5nKVtdIHtcbiAgICBjb25zdCBlbW9qaVRvU3BhbiA9IGlzSHRtbE1lc3NhZ2UgPyBlbW9qaVRvSHRtbFNwYW4gOiBlbW9qaVRvSnN4U3BhbjtcbiAgICBjb25zdCByZXN1bHQ6IChKU1guRWxlbWVudCB8IHN0cmluZylbXSA9IFtdO1xuICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgbGV0IGtleSA9IDA7XG5cbiAgICAvLyBXZSB1c2UgbG9kYXNoJ3MgZ3JhcGhlbWUgc3BsaXR0ZXIgdG8gYXZvaWQgYnJlYWtpbmcgYXBhcnQgY29tcG91bmQgZW1vamlzXG4gICAgZm9yIChjb25zdCBjaGFyIG9mIHNwbGl0KG1lc3NhZ2UsICcnKSkge1xuICAgICAgICBpZiAoRU1PSklCQVNFX1JFR0VYLnRlc3QoY2hhcikpIHtcbiAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godGV4dCk7XG4gICAgICAgICAgICAgICAgdGV4dCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnB1c2goZW1vamlUb1NwYW4oY2hhciwga2V5KSk7XG4gICAgICAgICAgICBrZXkrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHQgKz0gY2hhcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGV4dCkge1xuICAgICAgICByZXN1bHQucHVzaCh0ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyogdHVybiBhIG1hdHJpeCBldmVudCBib2R5IGludG8gaHRtbFxuICpcbiAqIGNvbnRlbnQ6ICdjb250ZW50JyBvZiB0aGUgTWF0cml4RXZlbnRcbiAqXG4gKiBoaWdobGlnaHRzOiBvcHRpb25hbCBsaXN0IG9mIHdvcmRzIHRvIGhpZ2hsaWdodCwgb3JkZXJlZCBieSBsb25nZXN0IHdvcmQgZmlyc3RcbiAqXG4gKiBvcHRzLmhpZ2hsaWdodExpbms6IG9wdGlvbmFsIGhyZWYgdG8gYWRkIHRvIGhpZ2hsaWdodGVkIHdvcmRzXG4gKiBvcHRzLmRpc2FibGVCaWdFbW9qaTogb3B0aW9uYWwgYXJndW1lbnQgdG8gZGlzYWJsZSB0aGUgYmlnIGVtb2ppIGNsYXNzLlxuICogb3B0cy5zdHJpcFJlcGx5RmFsbGJhY2s6IG9wdGlvbmFsIGFyZ3VtZW50IHNwZWNpZnlpbmcgdGhlIGV2ZW50IGlzIGEgcmVwbHkgYW5kIHNvIGZhbGxiYWNrIG5lZWRzIHJlbW92aW5nXG4gKiBvcHRzLnJldHVyblN0cmluZzogcmV0dXJuIGFuIEhUTUwgc3RyaW5nIHJhdGhlciB0aGFuIEpTWCBlbGVtZW50c1xuICogb3B0cy5mb3JDb21wb3NlclF1b3RlOiBvcHRpb25hbCBwYXJhbSB0byBsZXNzZW4gdGhlIHVybCByZXdyaXRpbmcgZG9uZSBieSBzYW5pdGl6YXRpb24sIGZvciBxdW90aW5nIGludG8gY29tcG9zZXJcbiAqIG9wdHMucmVmOiBSZWFjdCByZWYgdG8gYXR0YWNoIHRvIGFueSBSZWFjdCBjb21wb25lbnRzIHJldHVybmVkIChub3QgY29tcGF0aWJsZSB3aXRoIG9wdHMucmV0dXJuU3RyaW5nKVxuICovXG5leHBvcnQgZnVuY3Rpb24gYm9keVRvSHRtbChjb250ZW50OiBJQ29udGVudCwgaGlnaGxpZ2h0czogT3B0aW9uYWw8c3RyaW5nW10+LCBvcHRzOiBJT3B0c1JldHVyblN0cmluZyk6IHN0cmluZztcbmV4cG9ydCBmdW5jdGlvbiBib2R5VG9IdG1sKGNvbnRlbnQ6IElDb250ZW50LCBoaWdobGlnaHRzOiBPcHRpb25hbDxzdHJpbmdbXT4sIG9wdHM6IElPcHRzUmV0dXJuTm9kZSk6IFJlYWN0Tm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBib2R5VG9IdG1sKGNvbnRlbnQ6IElDb250ZW50LCBoaWdobGlnaHRzOiBPcHRpb25hbDxzdHJpbmdbXT4sIG9wdHM6IElPcHRzID0ge30pIHtcbiAgICBjb25zdCBpc0Zvcm1hdHRlZEJvZHkgPSBjb250ZW50LmZvcm1hdCA9PT0gXCJvcmcubWF0cml4LmN1c3RvbS5odG1sXCIgJiYgY29udGVudC5mb3JtYXR0ZWRfYm9keTtcbiAgICBsZXQgYm9keUhhc0Vtb2ppID0gZmFsc2U7XG4gICAgbGV0IGlzSHRtbE1lc3NhZ2UgPSBmYWxzZTtcblxuICAgIGxldCBzYW5pdGl6ZVBhcmFtcyA9IHNhbml0aXplSHRtbFBhcmFtcztcbiAgICBpZiAob3B0cy5mb3JDb21wb3NlclF1b3RlKSB7XG4gICAgICAgIHNhbml0aXplUGFyYW1zID0gY29tcG9zZXJTYW5pdGl6ZUh0bWxQYXJhbXM7XG4gICAgfVxuXG4gICAgbGV0IHN0cmlwcGVkQm9keTogc3RyaW5nO1xuICAgIGxldCBzYWZlQm9keTogc3RyaW5nOyAvLyBzYWZlLCBzYW5pdGlzZWQgSFRNTCwgcHJlZmVycmVkIG92ZXIgYHN0cmlwcGVkQm9keWAgd2hpY2ggaXMgZnVsbHkgcGxhaW50ZXh0XG5cbiAgICB0cnkge1xuICAgICAgICAvLyBzYW5pdGl6ZUh0bWwgY2FuIGhhbmcgaWYgYW4gdW5jbG9zZWQgSFRNTCB0YWcgaXMgdGhyb3duIGF0IGl0XG4gICAgICAgIC8vIEEgc2VhcmNoIGZvciBgPGZvb2Agd2lsbCBtYWtlIHRoZSBicm93c2VyIGNyYXNoIGFuIGFsdGVybmF0aXZlIHdvdWxkIGJlIHRvIGVzY2FwZSBIVE1MIHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgICAgICAvLyBidXQgdGhhdCB3b3VsZCBicmluZyBubyBhZGRpdGlvbmFsIGJlbmVmaXQgYXMgdGhlIGhpZ2hsaWdodGVyIGRvZXMgbm90IHdvcmsgd2l0aCB0aG9zZSBzcGVjaWFsIGNoYXJzXG4gICAgICAgIGNvbnN0IHNhZmVIaWdobGlnaHRzID0gaGlnaGxpZ2h0c1xuICAgICAgICAgICAgPy5maWx0ZXIoKGhpZ2hsaWdodDogc3RyaW5nKTogYm9vbGVhbiA9PiAhaGlnaGxpZ2h0LmluY2x1ZGVzKFwiPFwiKSlcbiAgICAgICAgICAgIC5tYXAoKGhpZ2hsaWdodDogc3RyaW5nKTogc3RyaW5nID0+IHNhbml0aXplSHRtbChoaWdobGlnaHQsIHNhbml0aXplUGFyYW1zKSk7XG5cbiAgICAgICAgbGV0IGZvcm1hdHRlZEJvZHkgPSB0eXBlb2YgY29udGVudC5mb3JtYXR0ZWRfYm9keSA9PT0gJ3N0cmluZycgPyBjb250ZW50LmZvcm1hdHRlZF9ib2R5IDogbnVsbDtcbiAgICAgICAgY29uc3QgcGxhaW5Cb2R5ID0gdHlwZW9mIGNvbnRlbnQuYm9keSA9PT0gJ3N0cmluZycgPyBjb250ZW50LmJvZHkgOiBcIlwiO1xuXG4gICAgICAgIGlmIChvcHRzLnN0cmlwUmVwbHlGYWxsYmFjayAmJiBmb3JtYXR0ZWRCb2R5KSBmb3JtYXR0ZWRCb2R5ID0gc3RyaXBIVE1MUmVwbHkoZm9ybWF0dGVkQm9keSk7XG4gICAgICAgIHN0cmlwcGVkQm9keSA9IG9wdHMuc3RyaXBSZXBseUZhbGxiYWNrID8gc3RyaXBQbGFpblJlcGx5KHBsYWluQm9keSkgOiBwbGFpbkJvZHk7XG4gICAgICAgIGJvZHlIYXNFbW9qaSA9IG1pZ2h0Q29udGFpbkVtb2ppKGlzRm9ybWF0dGVkQm9keSA/IGZvcm1hdHRlZEJvZHkgOiBwbGFpbkJvZHkpO1xuXG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVyID0gc2FmZUhpZ2hsaWdodHM/Lmxlbmd0aFxuICAgICAgICAgICAgPyBuZXcgSHRtbEhpZ2hsaWdodGVyKFwibXhfRXZlbnRUaWxlX3NlYXJjaEhpZ2hsaWdodFwiLCBvcHRzLmhpZ2hsaWdodExpbmspXG4gICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgaWYgKGlzRm9ybWF0dGVkQm9keSkge1xuICAgICAgICAgICAgaWYgKGhpZ2hsaWdodGVyKSB7XG4gICAgICAgICAgICAgICAgLy8gWFhYOiBXZSBzYW5pdGl6ZSB0aGUgSFRNTCB3aGlsc3QgYWxzbyBoaWdobGlnaHRpbmcgaXRzIHRleHQgbm9kZXMsIHRvIGF2b2lkIGFjY2lkZW50YWxseSB0cnlpbmdcbiAgICAgICAgICAgICAgICAvLyB0byBoaWdobGlnaHQgSFRNTCB0YWdzIHRoZW1zZWx2ZXMuIEhvd2V2ZXIsIHRoaXMgZG9lcyBtZWFuIHRoYXQgd2UgZG9uJ3QgaGlnaGxpZ2h0IHRleHRub2RlcyB3aGljaFxuICAgICAgICAgICAgICAgIC8vIGFyZSBpbnRlcnJ1cHRlZCBieSBIVE1MIHRhZ3MgKG5vdCB0aGF0IHdlIGRpZCBiZWZvcmUpIC0gZS5nLiBmb288c3Bhbi8+YmFyIHdvbid0IGdldCBoaWdobGlnaHRlZFxuICAgICAgICAgICAgICAgIC8vIGJ5IGFuIGF0dGVtcHQgdG8gc2VhcmNoIGZvciAnZm9vYmFyJy4gIFRoZW4gYWdhaW4sIHRoZSBzZWFyY2ggcXVlcnkgcHJvYmFibHkgd291bGRuJ3Qgd29yayBlaXRoZXJcbiAgICAgICAgICAgICAgICAvLyBYWFg6IGhhY2t5IGJvZGdlIHRvIHRlbXBvcmFyaWx5IGFwcGx5IGEgdGV4dEZpbHRlciB0byB0aGUgc2FuaXRpemVQYXJhbXMgc3RydWN0dXJlLlxuICAgICAgICAgICAgICAgIHNhbml0aXplUGFyYW1zLnRleHRGaWx0ZXIgPSBmdW5jdGlvbihzYWZlVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGlnaGxpZ2h0ZXIuYXBwbHlIaWdobGlnaHRzKHNhZmVUZXh0LCBzYWZlSGlnaGxpZ2h0cykuam9pbignJyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2FmZUJvZHkgPSBzYW5pdGl6ZUh0bWwoZm9ybWF0dGVkQm9keSwgc2FuaXRpemVQYXJhbXMpO1xuICAgICAgICAgICAgY29uc3QgcGh0bWwgPSBjaGVlcmlvLmxvYWQoc2FmZUJvZHksIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlOiBUaGUgYF91c2VIdG1sUGFyc2VyMmAgaW50ZXJuYWwgb3B0aW9uIGlzIHRoZVxuICAgICAgICAgICAgICAgIC8vIHNpbXBsZXN0IHdheSB0byBib3RoIHBhcnNlIGFuZCByZW5kZXIgdXNpbmcgYGh0bWxwYXJzZXIyYC5cbiAgICAgICAgICAgICAgICBfdXNlSHRtbFBhcnNlcjI6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVjb2RlRW50aXRpZXM6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBpc1BsYWluVGV4dCA9IHBodG1sLmh0bWwoKSA9PT0gcGh0bWwucm9vdCgpLnRleHQoKTtcbiAgICAgICAgICAgIGlzSHRtbE1lc3NhZ2UgPSBpc0Zvcm1hdHRlZEJvZHkgJiYgIWlzUGxhaW5UZXh0O1xuXG4gICAgICAgICAgICBpZiAoaXNIdG1sTWVzc2FnZSAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9sYXRleF9tYXRoc1wiKSkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBUaGUgdHlwZXMgZm9yIGByZXBsYWNlV2l0aGAgd3JvbmdseSBleHBlY3RcbiAgICAgICAgICAgICAgICAvLyBDaGVlcmlvIGluc3RhbmNlIHRvIGJlIHJldHVybmVkLlxuICAgICAgICAgICAgICAgIHBodG1sKCdkaXYsIHNwYW5bZGF0YS1teC1tYXRocyE9XCJcIl0nKS5yZXBsYWNlV2l0aChmdW5jdGlvbihpLCBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrYXRleC5yZW5kZXJUb1N0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgIEFsbEh0bWxFbnRpdGllcy5kZWNvZGUocGh0bWwoZSkuYXR0cignZGF0YS1teC1tYXRocycpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvd09uRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBgZWAgY2FuIGJlIGFuIEVsZW1lbnQsIG5vdCBqdXN0IGEgTm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNb2RlOiBlLm5hbWUgPT0gJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBcImh0bWxBbmRNYXRobWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNhZmVCb2R5ID0gcGh0bWwuaHRtbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJvZHlIYXNFbW9qaSkge1xuICAgICAgICAgICAgICAgIHNhZmVCb2R5ID0gZm9ybWF0RW1vamlzKHNhZmVCb2R5LCB0cnVlKS5qb2luKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChoaWdobGlnaHRlcikge1xuICAgICAgICAgICAgc2FmZUJvZHkgPSBoaWdobGlnaHRlci5hcHBseUhpZ2hsaWdodHMocGxhaW5Cb2R5LCBzYWZlSGlnaGxpZ2h0cykuam9pbignJyk7XG4gICAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBkZWxldGUgc2FuaXRpemVQYXJhbXMudGV4dEZpbHRlcjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50Qm9keSA9IHNhZmVCb2R5ID8/IHN0cmlwcGVkQm9keTtcbiAgICBpZiAob3B0cy5yZXR1cm5TdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnRCb2R5O1xuICAgIH1cblxuICAgIGxldCBlbW9qaUJvZHkgPSBmYWxzZTtcbiAgICBpZiAoIW9wdHMuZGlzYWJsZUJpZ0Vtb2ppICYmIGJvZHlIYXNFbW9qaSkge1xuICAgICAgICBsZXQgY29udGVudEJvZHlUcmltbWVkID0gY29udGVudEJvZHkgIT09IHVuZGVmaW5lZCA/IGNvbnRlbnRCb2R5LnRyaW0oKSA6ICcnO1xuXG4gICAgICAgIC8vIElnbm9yZSBzcGFjZXMgaW4gYm9keSB0ZXh0LiBFbW9qaXMgd2l0aCBzcGFjZXMgaW4gYmV0d2VlbiBzaG91bGRcbiAgICAgICAgLy8gc3RpbGwgYmUgY291bnRlZCBhcyBwdXJlbHkgZW1vamkgbWVzc2FnZXMuXG4gICAgICAgIGNvbnRlbnRCb2R5VHJpbW1lZCA9IGNvbnRlbnRCb2R5VHJpbW1lZC5yZXBsYWNlKFdISVRFU1BBQ0VfUkVHRVgsICcnKTtcblxuICAgICAgICAvLyBSZW1vdmUgemVybyB3aWR0aCBqb2luZXIgY2hhcmFjdGVycyBmcm9tIGVtb2ppIG1lc3NhZ2VzLiBUaGlzIGVuc3VyZXNcbiAgICAgICAgLy8gdGhhdCBlbW9qaXMgdGhhdCBhcmUgbWFkZSB1cCBvZiBtdWx0aXBsZSB1bmljb2RlIGNoYXJhY3RlcnMgYXJlIHN0aWxsXG4gICAgICAgIC8vIHByZXNlbnRlZCBhcyBsYXJnZS5cbiAgICAgICAgY29udGVudEJvZHlUcmltbWVkID0gY29udGVudEJvZHlUcmltbWVkLnJlcGxhY2UoWldKX1JFR0VYLCAnJyk7XG5cbiAgICAgICAgY29uc3QgbWF0Y2ggPSBCSUdFTU9KSV9SRUdFWC5leGVjKGNvbnRlbnRCb2R5VHJpbW1lZCk7XG4gICAgICAgIGVtb2ppQm9keSA9IG1hdGNoICYmIG1hdGNoWzBdICYmIG1hdGNoWzBdLmxlbmd0aCA9PT0gY29udGVudEJvZHlUcmltbWVkLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICAvLyBQcmV2ZW50IHVzZXIgcGlsbHMgZXhwYW5kaW5nIGZvciB1c2VycyB3aXRoIG9ubHkgZW1vamkgaW5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlaXIgdXNlcm5hbWUuIFBlcm1hbGlua3MgKGxpbmtzIGluIHBpbGxzKSBjYW4gYmUgYW55IFVSTFxuICAgICAgICAgICAgICAgICAgICAvLyBub3csIHNvIHdlIGp1c3QgY2hlY2sgZm9yIGFuIEhUVFAtbG9va2luZyB0aGluZy5cbiAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaXBwZWRCb2R5ID09PSBzYWZlQm9keSB8fCAvLyByZXBsaWVzIGhhdmUgdGhlIGh0bWwgZmFsbGJhY2tzLCBhY2NvdW50IGZvciB0aGF0IGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuZm9ybWF0dGVkX2JvZHkgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKCFjb250ZW50LmZvcm1hdHRlZF9ib2R5LmluY2x1ZGVzKFwiaHR0cDpcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFjb250ZW50LmZvcm1hdHRlZF9ib2R5LmluY2x1ZGVzKFwiaHR0cHM6XCIpKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAnbXhfRXZlbnRUaWxlX2JvZHknOiB0cnVlLFxuICAgICAgICAnbXhfRXZlbnRUaWxlX2JpZ0Vtb2ppJzogZW1vamlCb2R5LFxuICAgICAgICAnbWFya2Rvd24tYm9keSc6IGlzSHRtbE1lc3NhZ2UgJiYgIWVtb2ppQm9keSxcbiAgICB9KTtcblxuICAgIGxldCBlbW9qaUJvZHlFbGVtZW50czogSlNYLkVsZW1lbnRbXTtcbiAgICBpZiAoIXNhZmVCb2R5ICYmIGJvZHlIYXNFbW9qaSkge1xuICAgICAgICBlbW9qaUJvZHlFbGVtZW50cyA9IGZvcm1hdEVtb2ppcyhzdHJpcHBlZEJvZHksIGZhbHNlKSBhcyBKU1guRWxlbWVudFtdO1xuICAgIH1cblxuICAgIHJldHVybiBzYWZlQm9keSA/XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgICBrZXk9XCJib2R5XCJcbiAgICAgICAgICAgIHJlZj17b3B0cy5yZWZ9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogc2FmZUJvZHkgfX1cbiAgICAgICAgICAgIGRpcj1cImF1dG9cIlxuICAgICAgICAvPiA6IDxzcGFuIGtleT1cImJvZHlcIiByZWY9e29wdHMucmVmfSBjbGFzc05hbWU9e2NsYXNzTmFtZX0gZGlyPVwiYXV0b1wiPlxuICAgICAgICAgICAgeyBlbW9qaUJvZHlFbGVtZW50cyB8fCBzdHJpcHBlZEJvZHkgfVxuICAgICAgICA8L3NwYW4+O1xufVxuXG4vKipcbiAqIFR1cm4gYSByb29tIHRvcGljIGludG8gaHRtbFxuICogQHBhcmFtIHRvcGljIHBsYWluIHRleHQgdG9waWNcbiAqIEBwYXJhbSBodG1sVG9waWMgb3B0aW9uYWwgaHRtbCB0b3BpY1xuICogQHBhcmFtIHJlZiBSZWFjdCByZWYgdG8gYXR0YWNoIHRvIGFueSBSZWFjdCBjb21wb25lbnRzIHJldHVybmVkXG4gKiBAcGFyYW0gYWxsb3dFeHRlbmRlZEh0bWwgd2hldGhlciB0byBhbGxvdyBleHRlbmRlZCBIVE1MIHRhZ3Mgc3VjaCBhcyBoZWFkaW5ncyBhbmQgbGlzdHNcbiAqIEByZXR1cm4gVGhlIEhUTUwtaWZpZWQgbm9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvcGljVG9IdG1sKFxuICAgIHRvcGljOiBzdHJpbmcsXG4gICAgaHRtbFRvcGljPzogc3RyaW5nLFxuICAgIHJlZj86IFJlYWN0LlJlZjxIVE1MU3BhbkVsZW1lbnQ+LFxuICAgIGFsbG93RXh0ZW5kZWRIdG1sID0gZmFsc2UsXG4pOiBSZWFjdE5vZGUge1xuICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfaHRtbF90b3BpY1wiKSkge1xuICAgICAgICBodG1sVG9waWMgPSBudWxsO1xuICAgIH1cblxuICAgIGxldCBpc0Zvcm1hdHRlZFRvcGljID0gISFodG1sVG9waWM7XG4gICAgbGV0IHRvcGljSGFzRW1vamkgPSBmYWxzZTtcbiAgICBsZXQgc2FmZVRvcGljID0gXCJcIjtcblxuICAgIHRyeSB7XG4gICAgICAgIHRvcGljSGFzRW1vamkgPSBtaWdodENvbnRhaW5FbW9qaShpc0Zvcm1hdHRlZFRvcGljID8gaHRtbFRvcGljIDogdG9waWMpO1xuXG4gICAgICAgIGlmIChpc0Zvcm1hdHRlZFRvcGljKSB7XG4gICAgICAgICAgICBzYWZlVG9waWMgPSBzYW5pdGl6ZUh0bWwoaHRtbFRvcGljLCBhbGxvd0V4dGVuZGVkSHRtbCA/IHNhbml0aXplSHRtbFBhcmFtcyA6IHRvcGljU2FuaXRpemVIdG1sUGFyYW1zKTtcbiAgICAgICAgICAgIGlmICh0b3BpY0hhc0Vtb2ppKSB7XG4gICAgICAgICAgICAgICAgc2FmZVRvcGljID0gZm9ybWF0RW1vamlzKHNhZmVUb3BpYywgdHJ1ZSkuam9pbignJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgICAgaXNGb3JtYXR0ZWRUb3BpYyA9IGZhbHNlOyAvLyBGYWxsIGJhY2sgdG8gcGxhaW4tdGV4dCB0b3BpY1xuICAgIH1cblxuICAgIGxldCBlbW9qaUJvZHlFbGVtZW50czogUmV0dXJuVHlwZTx0eXBlb2YgZm9ybWF0RW1vamlzPjtcbiAgICBpZiAoIWlzRm9ybWF0dGVkVG9waWMgJiYgdG9waWNIYXNFbW9qaSkge1xuICAgICAgICBlbW9qaUJvZHlFbGVtZW50cyA9IGZvcm1hdEVtb2ppcyh0b3BpYywgZmFsc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0Zvcm1hdHRlZFRvcGljXG4gICAgICAgID8gPHNwYW5cbiAgICAgICAgICAgIHJlZj17cmVmfVxuICAgICAgICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiBzYWZlVG9waWMgfX1cbiAgICAgICAgICAgIGRpcj1cImF1dG9cIlxuICAgICAgICAvPlxuICAgICAgICA6IDxzcGFuIHJlZj17cmVmfSBkaXI9XCJhdXRvXCI+XG4gICAgICAgICAgICB7IGVtb2ppQm9keUVsZW1lbnRzIHx8IHRvcGljIH1cbiAgICAgICAgPC9zcGFuPjtcbn1cblxuLyoqXG4gKiBMaW5raWZpZXMgdGhlIGdpdmVuIHN0cmluZy4gVGhpcyBpcyBhIHdyYXBwZXIgYXJvdW5kICdsaW5raWZ5anMvc3RyaW5nJy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIHN0cmluZyB0byBsaW5raWZ5XG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgZm9yIGxpbmtpZnlTdHJpbmcuIERlZmF1bHQ6IGxpbmtpZnlNYXRyaXhPcHRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBMaW5raWZpZWQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5raWZ5U3RyaW5nKHN0cjogc3RyaW5nLCBvcHRpb25zID0gbGlua2lmeU1hdHJpeE9wdGlvbnMpOiBzdHJpbmcge1xuICAgIHJldHVybiBfbGlua2lmeVN0cmluZyhzdHIsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIExpbmtpZmllcyB0aGUgZ2l2ZW4gRE9NIGVsZW1lbnQuIFRoaXMgaXMgYSB3cmFwcGVyIGFyb3VuZCAnbGlua2lmeWpzL2VsZW1lbnQnLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBlbGVtZW50IERPTSBlbGVtZW50IHRvIGxpbmtpZnlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyBmb3IgbGlua2lmeUVsZW1lbnQuIERlZmF1bHQ6IGxpbmtpZnlNYXRyaXhPcHRpb25zXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlua2lmeUVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQsIG9wdGlvbnMgPSBsaW5raWZ5TWF0cml4T3B0aW9ucyk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gX2xpbmtpZnlFbGVtZW50KGVsZW1lbnQsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIExpbmtpZnkgdGhlIGdpdmVuIHN0cmluZyBhbmQgc2FuaXRpemUgdGhlIEhUTUwgYWZ0ZXJ3YXJkcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlydHlIdG1sIFRoZSBIVE1MIHN0cmluZyB0byBzYW5pdGl6ZSBhbmQgbGlua2lmeVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIGZvciBsaW5raWZ5U3RyaW5nLiBEZWZhdWx0OiBsaW5raWZ5TWF0cml4T3B0aW9uc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmtpZnlBbmRTYW5pdGl6ZUh0bWwoZGlydHlIdG1sOiBzdHJpbmcsIG9wdGlvbnMgPSBsaW5raWZ5TWF0cml4T3B0aW9ucyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHNhbml0aXplSHRtbChsaW5raWZ5U3RyaW5nKGRpcnR5SHRtbCwgb3B0aW9ucyksIHNhbml0aXplSHRtbFBhcmFtcyk7XG59XG5cbi8qKlxuICogUmV0dXJucyBpZiBhIG5vZGUgaXMgYSBibG9jayBlbGVtZW50IG9yIG5vdC5cbiAqIE9ubHkgdGFrZXMgaHRtbCBub2RlcyBpbnRvIGFjY291bnQgdGhhdCBhcmUgYWxsb3dlZCBpbiBtYXRyaXggbWVzc2FnZXMuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJucyB7Ym9vbH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQmxvY2tOb2RlKG5vZGU6IE5vZGUpOiBib29sZWFuIHtcbiAgICBzd2l0Y2ggKG5vZGUubm9kZU5hbWUpIHtcbiAgICAgICAgY2FzZSBcIkgxXCI6XG4gICAgICAgIGNhc2UgXCJIMlwiOlxuICAgICAgICBjYXNlIFwiSDNcIjpcbiAgICAgICAgY2FzZSBcIkg0XCI6XG4gICAgICAgIGNhc2UgXCJINVwiOlxuICAgICAgICBjYXNlIFwiSDZcIjpcbiAgICAgICAgY2FzZSBcIlBSRVwiOlxuICAgICAgICBjYXNlIFwiQkxPQ0tRVU9URVwiOlxuICAgICAgICBjYXNlIFwiUFwiOlxuICAgICAgICBjYXNlIFwiVUxcIjpcbiAgICAgICAgY2FzZSBcIk9MXCI6XG4gICAgICAgIGNhc2UgXCJMSVwiOlxuICAgICAgICBjYXNlIFwiSFJcIjpcbiAgICAgICAgY2FzZSBcIlRBQkxFXCI6XG4gICAgICAgIGNhc2UgXCJUSEVBRFwiOlxuICAgICAgICBjYXNlIFwiVEJPRFlcIjpcbiAgICAgICAgY2FzZSBcIlRSXCI6XG4gICAgICAgIGNhc2UgXCJUSFwiOlxuICAgICAgICBjYXNlIFwiVERcIjpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlIFwiRElWXCI6XG4gICAgICAgICAgICAvLyBkb24ndCB0cmVhdCBtYXRoIG5vZGVzIGFzIGJsb2NrIG5vZGVzIGZvciBkZXNlcmlhbGl6aW5nXG4gICAgICAgICAgICByZXR1cm4gIShub2RlIGFzIEhUTUxFbGVtZW50KS5oYXNBdHRyaWJ1dGUoXCJkYXRhLW14LW1hdGhzXCIpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUlBOztBQU9BOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQTtBQUNBLE1BQU1BLHNCQUFzQixHQUFHLG9DQUEvQixDLENBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsTUFBTUMsY0FBYyxHQUFHLG1CQUF2QixDLENBRUE7O0FBQ0EsTUFBTUMsU0FBUyxHQUFHLGlCQUFsQixDLENBRUE7O0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsS0FBekI7QUFFQSxNQUFNQyxjQUFjLEdBQUcsSUFBSUMsTUFBSixDQUFZLEtBQUlDLHVCQUFBLENBQWdCQyxNQUFPLEtBQXZDLEVBQTZDLEdBQTdDLENBQXZCO0FBRUEsTUFBTUMsV0FBVyxHQUFHLG1CQUFwQjtBQUVPLE1BQU1DLHFCQUFxQixHQUFHLENBQ2pDLFNBRGlDLEVBRWpDLEtBRmlDLEVBR2pDLEtBSGlDLEVBSWpDLE1BSmlDLEVBS2pDLE9BTGlDLEVBTWpDLElBTmlDLEVBT2pDLEtBUGlDLEVBUWpDLE1BUmlDLEVBU2pDLFFBVGlDLEVBVWpDLFFBVmlDLEVBV2pDLFFBWGlDLEVBWWpDLEtBWmlDLEVB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