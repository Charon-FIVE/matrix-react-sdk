"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomTranslationOptions = void 0;
exports._t = _t;
exports._tDom = _tDom;
exports._td = _td;
exports.getAllLanguagesFromJson = getAllLanguagesFromJson;
exports.getCurrentLanguage = getCurrentLanguage;
exports.getLanguageFromBrowser = getLanguageFromBrowser;
exports.getLanguagesFromBrowser = getLanguagesFromBrowser;
exports.getNormalizedLanguageKeys = getNormalizedLanguageKeys;
exports.getUserLanguage = getUserLanguage;
exports.newTranslatableError = newTranslatableError;
exports.normalizeLanguageKey = normalizeLanguageKey;
exports.pickBestLanguage = pickBestLanguage;
exports.registerCustomTranslations = registerCustomTranslations;
exports.replaceByRegexes = replaceByRegexes;
exports.sanitizeForTranslation = sanitizeForTranslation;
exports.setLanguage = setLanguage;
exports.setMissingEntryGenerator = setMissingEntryGenerator;
exports.substitute = substitute;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _browserRequest = _interopRequireDefault(require("browser-request"));

var _counterpart = _interopRequireDefault(require("counterpart"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _SettingLevel = require("./settings/SettingLevel");

var _promise = require("./utils/promise");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _ModuleRunner = require("./modules/ModuleRunner");

var _languages = _interopRequireDefault(require("$webapp/i18n/languages.json"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const i18nFolder = 'i18n/'; // Control whether to also return original, untranslated strings
// Useful for debugging and testing

const ANNOTATE_STRINGS = false; // We use english strings as keys, some of which contain full stops

_counterpart.default.setSeparator('|'); // see `translateWithFallback` for an explanation of fallback handling


const FALLBACK_LOCALE = 'en';

_counterpart.default.setFallbackLocale(FALLBACK_LOCALE);

/**
 * Helper function to create an error which has an English message
 * with a translatedMessage property for use by the consumer.
 * @param {string} message Message to translate.
 * @param {object} variables Variable substitutions, e.g { foo: 'bar' }
 * @returns {Error} The constructed error.
 */
function newTranslatableError(message, variables) {
  const error = new Error(message);
  error.translatedMessage = _t(message, variables);
  return error;
}

function getUserLanguage() {
  const language = _SettingsStore.default.getValue("language", null,
  /*excludeDefault:*/
  true);

  if (language) {
    return language;
  } else {
    return normalizeLanguageKey(getLanguageFromBrowser());
  }
} // Function which only purpose is to mark that a string is translatable
// Does not actually do anything. It's helpful for automatic extraction of translatable strings


function _td(s) {
  // eslint-disable-line @typescript-eslint/naming-convention
  return s;
}
/**
 * to improve screen reader experience translations that are not in the main page language
 * eg a translation that fell back to english from another language
 * should be wrapped with an appropriate `lang='en'` attribute
 * counterpart's `translate` doesn't expose a way to determine if the resulting translation
 * is in the target locale or a fallback locale
 * for this reason, force fallbackLocale === locale in the first call to translate
 * and fallback 'manually' so we can mark fallback strings appropriately
 * */


const translateWithFallback = (text, options) => {
  const translated = _counterpart.default.translate(text, _objectSpread(_objectSpread({}, options), {}, {
    fallbackLocale: _counterpart.default.getLocale()
  }));

  if (!translated || translated.startsWith("missing translation:")) {
    const fallbackTranslated = _counterpart.default.translate(text, _objectSpread(_objectSpread({}, options), {}, {
      locale: FALLBACK_LOCALE
    }));

    if ((!fallbackTranslated || fallbackTranslated.startsWith("missing translation:")) && process.env.NODE_ENV !== "development") {
      // Even the translation via FALLBACK_LOCALE failed; this can happen if
      //
      // 1. The string isn't in the translations dictionary, usually because you're in develop
      // and haven't run yarn i18n
      // 2. Loading the translation resources over the network failed, which can happen due to
      // to network or if the client tried to load a translation that's been removed from the
      // server.
      //
      // At this point, its the lesser evil to show the untranslated text, which
      // will be in English, so the user can still make out *something*, rather than an opaque
      // "missing translation" error.
      //
      // Don't do this in develop so people remember to run yarn i18n.
      return {
        translated: text,
        isFallback: true
      };
    }

    return {
      translated: fallbackTranslated,
      isFallback: true
    };
  }

  return {
    translated
  };
}; // Wrapper for counterpart's translation function so that it handles nulls and undefineds properly
// Takes the same arguments as counterpart.translate()


function safeCounterpartTranslate(text, variables) {
  // Don't do substitutions in counterpart. We handle it ourselves so we can replace with React components
  // However, still pass the variables to counterpart so that it can choose the correct plural if count is given
  // It is enough to pass the count variable, but in the future counterpart might make use of other information too
  const options = _objectSpread(_objectSpread({}, variables), {}, {
    interpolate: false
  }); // Horrible hack to avoid https://github.com/vector-im/element-web/issues/4191
  // The interpolation library that counterpart uses does not support undefined/null
  // values and instead will throw an error. This is a problem since everywhere else
  // in JS land passing undefined/null will simply stringify instead, and when converting
  // valid ES6 template strings to i18n strings it's extremely easy to pass undefined/null
  // if there are no existing null guards. To avoid this making the app completely inoperable,
  // we'll check all the values for undefined/null and stringify them here.


  if (options && typeof options === 'object') {
    Object.keys(options).forEach(k => {
      if (options[k] === undefined) {
        _logger.logger.warn("safeCounterpartTranslate called with undefined interpolation name: " + k);

        options[k] = 'undefined';
      }

      if (options[k] === null) {
        _logger.logger.warn("safeCounterpartTranslate called with null interpolation name: " + k);

        options[k] = 'null';
      }
    });
  }

  return translateWithFallback(text, options);
}

// For development/testing purposes it is useful to also output the original string
// Don't do that for release versions
const annotateStrings = (result, translationKey) => {
  if (!ANNOTATE_STRINGS) {
    return result;
  }

  if (typeof result === 'string') {
    return `@@${translationKey}##${result}@@`;
  } else {
    return /*#__PURE__*/_react.default.createElement("span", {
      className: "translated-string",
      "data-orig-string": translationKey
    }, result);
  }
};
/*
 * Translates text and optionally also replaces XML-ish elements in the text with e.g. React components
 * @param {string} text The untranslated text, e.g "click <a>here</a> now to %(foo)s".
 * @param {object} variables Variable substitutions, e.g { foo: 'bar' }
 * @param {object} tags Tag substitutions e.g. { 'a': (sub) => <a>{sub}</a> }
 *
 * In both variables and tags, the values to substitute with can be either simple strings, React components,
 * or functions that return the value to use in the substitution (e.g. return a React component). In case of
 * a tag replacement, the function receives as the argument the text inside the element corresponding to the tag.
 *
 * Use tag substitutions if you need to translate text between tags (e.g. "<a>Click here!</a>"), otherwise
 * you will end up with literal "<a>" in your output, rather than HTML. Note that you can also use variable
 * substitution to insert React components, but you can't use it to translate text between tags.
 *
 * @return a React <span> component if any non-strings were used in substitutions, otherwise a string
 */
// eslint-next-line @typescript-eslint/naming-convention


function _t(text, variables, tags) {
  // The translation returns text so there's no XSS vector here (no unsafe HTML, no code execution)
  const {
    translated
  } = safeCounterpartTranslate(text, variables);
  const substituted = substitute(translated, variables, tags);
  return annotateStrings(substituted, text);
}
/*
 * Wraps normal _t function and adds atttribution for translations that used a fallback locale
 * Wraps translations that fell back from active locale to fallback locale with a `<span lang=<fallback locale>>`
 * @param {string} text The untranslated text, e.g "click <a>here</a> now to %(foo)s".
 * @param {object} variables Variable substitutions, e.g { foo: 'bar' }
 * @param {object} tags Tag substitutions e.g. { 'a': (sub) => <a>{sub}</a> }
 *
 * @return a React <span> component if any non-strings were used in substitutions
 * or translation used a fallback locale, otherwise a string
 */
// eslint-next-line @typescript-eslint/naming-convention


function _tDom(text, variables, tags) {
  // The translation returns text so there's no XSS vector here (no unsafe HTML, no code execution)
  const {
    translated,
    isFallback
  } = safeCounterpartTranslate(text, variables);
  const substituted = substitute(translated, variables, tags); // wrap en fallback translation with lang attribute for screen readers

  const result = isFallback ? /*#__PURE__*/_react.default.createElement("span", {
    lang: "en"
  }, substituted) : substituted;
  return annotateStrings(result, text);
}
/**
 * Sanitizes unsafe text for the sanitizer, ensuring references to variables will not be considered
 * replaceable by the translation functions.
 * @param {string} text The text to sanitize.
 * @returns {string} The sanitized text.
 */


function sanitizeForTranslation(text) {
  // Add a non-breaking space so the regex doesn't trigger when translating.
  return text.replace(/%\(([^)]*)\)/g, '%\xa0($1)');
}
/*
 * Similar to _t(), except only does substitutions, and no translation
 * @param {string} text The text, e.g "click <a>here</a> now to %(foo)s".
 * @param {object} variables Variable substitutions, e.g { foo: 'bar' }
 * @param {object} tags Tag substitutions e.g. { 'a': (sub) => <a>{sub}</a> }
 *
 * The values to substitute with can be either simple strings, or functions that return the value to use in
 * the substitution (e.g. return a React component). In case of a tag replacement, the function receives as
 * the argument the text inside the element corresponding to the tag.
 *
 * @return a React <span> component if any non-strings were used in substitutions, otherwise a string
 */


function substitute(text, variables, tags) {
  let result = text;

  if (variables !== undefined) {
    const regexpMapping = {};

    for (const variable in variables) {
      regexpMapping[`%\\(${variable}\\)s`] = variables[variable];
    }

    result = replaceByRegexes(result, regexpMapping);
  }

  if (tags !== undefined) {
    const regexpMapping = {};

    for (const tag in tags) {
      regexpMapping[`(<${tag}>(.*?)<\\/${tag}>|<${tag}>|<${tag}\\s*\\/>)`] = tags[tag];
    }

    result = replaceByRegexes(result, regexpMapping);
  }

  return result;
}
/*
 * Replace parts of a text using regular expressions
 * @param {string} text The text on which to perform substitutions
 * @param {object} mapping A mapping from regular expressions in string form to replacement string or a
 * function which will receive as the argument the capture groups defined in the regexp. E.g.
 * { 'Hello (.?) World': (sub) => sub.toUpperCase() }
 *
 * @return a React <span> component if any non-strings were used in substitutions, otherwise a string
 */


function replaceByRegexes(text, mapping) {
  // We initially store our output as an array of strings and objects (e.g. React components).
  // This will then be converted to a string or a <span> at the end
  const output = [text]; // If we insert any components we need to wrap the output in a span. React doesn't like just an array of components.

  let shouldWrapInSpan = false;

  for (const regexpString in mapping) {
    // TODO: Cache regexps
    const regexp = new RegExp(regexpString, "g"); // Loop over what output we have so far and perform replacements
    // We look for matches: if we find one, we get three parts: everything before the match, the replaced part,
    // and everything after the match. Insert all three into the output. We need to do this because we can insert objects.
    // Otherwise there would be no need for the splitting and we could do simple replacement.

    let matchFoundSomewhere = false; // If we don't find a match anywhere we want to log it

    for (let outputIndex = 0; outputIndex < output.length; outputIndex++) {
      const inputText = output[outputIndex];

      if (typeof inputText !== 'string') {
        // We might have inserted objects earlier, don't try to replace them
        continue;
      } // process every match in the string
      // starting with the first


      let match = regexp.exec(inputText);
      if (!match) continue;
      matchFoundSomewhere = true; // The textual part before the first match

      const head = inputText.slice(0, match.index);
      const parts = []; // keep track of prevMatch

      let prevMatch;

      while (match) {
        // store prevMatch
        prevMatch = match;
        const capturedGroups = match.slice(2);
        let replaced; // If substitution is a function, call it

        if (mapping[regexpString] instanceof Function) {
          replaced = mapping[regexpString](...capturedGroups);
        } else {
          replaced = mapping[regexpString];
        }

        if (typeof replaced === 'object') {
          shouldWrapInSpan = true;
        } // Here we also need to check that it actually is a string before comparing against one
        // The head and tail are always strings


        if (typeof replaced !== 'string' || replaced !== '') {
          parts.push(replaced);
        } // try the next match


        match = regexp.exec(inputText); // add the text between prevMatch and this one
        // or the end of the string if prevMatch is the last match

        let tail;

        if (match) {
          const startIndex = prevMatch.index + prevMatch[0].length;
          tail = inputText.slice(startIndex, match.index);
        } else {
          tail = inputText.slice(prevMatch.index + prevMatch[0].length);
        }

        if (tail) {
          parts.push(tail);
        }
      } // Insert in reverse order as splice does insert-before and this way we get the final order correct
      // remove the old element at the same time


      output.splice(outputIndex, 1, ...parts);

      if (head !== '') {
        // Don't push empty nodes, they are of no use
        output.splice(outputIndex, 0, head);
      }
    }

    if (!matchFoundSomewhere) {
      // The current regexp did not match anything in the input
      // Missing matches is entirely possible because you might choose to show some variables only in the case
      // of e.g. plurals. It's still a bit suspicious, and could be due to an error, so log it.
      // However, not showing count is so common that it's not worth logging. And other commonly unused variables
      // here, if there are any.
      if (regexpString !== '%\\(count\\)s') {
        _logger.logger.log(`Could not find ${regexp} in ${text}`);
      }
    }
  }

  if (shouldWrapInSpan) {
    return /*#__PURE__*/_react.default.createElement('span', null, ...output);
  } else {
    return output.join('');
  }
} // Allow overriding the text displayed when no translation exists
// Currently only used in unit tests to avoid having to load
// the translations in element-web


function setMissingEntryGenerator(f) {
  _counterpart.default.setMissingEntryGenerator(f);
}

function setLanguage(preferredLangs) {
  if (!Array.isArray(preferredLangs)) {
    preferredLangs = [preferredLangs];
  }

  const plaf = _PlatformPeg.default.get();

  if (plaf) {
    plaf.setLanguage(preferredLangs);
  }

  let langToUse;
  let availLangs;
  return getLangsJson().then(result => {
    availLangs = result;

    for (let i = 0; i < preferredLangs.length; ++i) {
      if (availLangs.hasOwnProperty(preferredLangs[i])) {
        langToUse = preferredLangs[i];
        break;
      }
    }

    if (!langToUse) {
      // Fallback to en_EN if none is found
      langToUse = 'en';

      _logger.logger.error("Unable to find an appropriate language");
    }

    return getLanguageRetry(i18nFolder + availLangs[langToUse].fileName);
  }).then(async langData => {
    _counterpart.default.registerTranslations(langToUse, langData);

    await registerCustomTranslations();

    _counterpart.default.setLocale(langToUse);

    await _SettingsStore.default.setValue("language", null, _SettingLevel.SettingLevel.DEVICE, langToUse); // Adds a lot of noise to test runs, so disable logging there.

    if (process.env.NODE_ENV !== "test") {
      _logger.logger.log("set language to " + langToUse);
    } // Set 'en' as fallback language:


    if (langToUse !== "en") {
      return getLanguageRetry(i18nFolder + availLangs['en'].fileName);
    }
  }).then(async langData => {
    if (langData) _counterpart.default.registerTranslations('en', langData);
    await registerCustomTranslations();
  });
}

function getAllLanguagesFromJson() {
  return getLangsJson().then(langsObject => {
    const langs = [];

    for (const langKey in langsObject) {
      if (langsObject.hasOwnProperty(langKey)) {
        langs.push({
          'value': langKey,
          'label': langsObject[langKey].label
        });
      }
    }

    return langs;
  });
}

function getLanguagesFromBrowser() {
  if (navigator.languages && navigator.languages.length) return navigator.languages;
  if (navigator.language) return [navigator.language];
  return [navigator.userLanguage || "en"];
}

function getLanguageFromBrowser() {
  return getLanguagesFromBrowser()[0];
}
/**
 * Turns a language string, normalises it,
 * (see normalizeLanguageKey) into an array of language strings
 * with fallback to generic languages
 * (eg. 'pt-BR' => ['pt-br', 'pt'])
 *
 * @param {string} language The input language string
 * @return {string[]} List of normalised languages
 */


function getNormalizedLanguageKeys(language) {
  const languageKeys = [];
  const normalizedLanguage = normalizeLanguageKey(language);
  const languageParts = normalizedLanguage.split('-');

  if (languageParts.length === 2 && languageParts[0] === languageParts[1]) {
    languageKeys.push(languageParts[0]);
  } else {
    languageKeys.push(normalizedLanguage);

    if (languageParts.length === 2) {
      languageKeys.push(languageParts[0]);
    }
  }

  return languageKeys;
}
/**
 * Returns a language string with underscores replaced with
 * hyphens, and lowercased.
 *
 * @param {string} language The language string to be normalized
 * @returns {string} The normalized language string
 */


function normalizeLanguageKey(language) {
  return language.toLowerCase().replace("_", "-");
}

function getCurrentLanguage() {
  return _counterpart.default.getLocale();
}
/**
 * Given a list of language codes, pick the most appropriate one
 * given the current language (ie. getCurrentLanguage())
 * English is assumed to be a reasonable default.
 *
 * @param {string[]} langs List of language codes to pick from
 * @returns {string} The most appropriate language code from langs
 */


function pickBestLanguage(langs) {
  const currentLang = getCurrentLanguage();
  const normalisedLangs = langs.map(normalizeLanguageKey);
  {
    // Best is an exact match
    const currentLangIndex = normalisedLangs.indexOf(currentLang);
    if (currentLangIndex > -1) return langs[currentLangIndex];
  }
  {
    // Failing that, a different dialect of the same language
    const closeLangIndex = normalisedLangs.findIndex(l => l.slice(0, 2) === currentLang.slice(0, 2));
    if (closeLangIndex > -1) return langs[closeLangIndex];
  }
  {
    // Neither of those? Try an english variant.
    const enIndex = normalisedLangs.findIndex(l => l.startsWith('en'));
    if (enIndex > -1) return langs[enIndex];
  } // if nothing else, use the first

  return langs[0];
}

function getLangsJson() {
  return new Promise((resolve, reject) => {
    let url;

    if (typeof _languages.default === 'string') {
      // in Jest this 'url' isn't a URL, so just fall through
      url = _languages.default;
    } else {
      url = i18nFolder + 'languages.json';
    }

    (0, _browserRequest.default)({
      method: "GET",
      url
    }, (err, response, body) => {
      if (err) {
        reject(err);
        return;
      }

      if (response.status < 200 || response.status >= 300) {
        reject(new Error(`Failed to load ${url}, got ${response.status}`));
        return;
      }

      resolve(JSON.parse(body));
    });
  });
}

async function getLanguageRetry(langPath) {
  let num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
  return (0, _promise.retry)(() => getLanguage(langPath), num, e => {
    _logger.logger.log("Failed to load i18n", langPath);

    _logger.logger.error(e);

    return true; // always retry
  });
}

function getLanguage(langPath) {
  return new Promise((resolve, reject) => {
    (0, _browserRequest.default)({
      method: "GET",
      url: langPath
    }, (err, response, body) => {
      if (err) {
        reject(err);
        return;
      }

      if (response.status < 200 || response.status >= 300) {
        reject(new Error(`Failed to load ${langPath}, got ${response.status}`));
        return;
      }

      resolve(JSON.parse(body));
    });
  });
}

let cachedCustomTranslations = null;
let cachedCustomTranslationsExpire = 0; // zero to trigger expiration right away
// This awkward class exists so the test runner can get at the function. It is
// not intended for practical or realistic usage.

class CustomTranslationOptions {
  constructor() {// static access for tests only
  }

}

exports.CustomTranslationOptions = CustomTranslationOptions;
(0, _defineProperty2.default)(CustomTranslationOptions, "lookupFn", void 0);

function doRegisterTranslations(customTranslations) {
  // We convert the operator-friendly version into something counterpart can
  // consume.
  const langs = {};

  for (const [str, translations] of Object.entries(customTranslations)) {
    for (const [lang, newStr] of Object.entries(translations)) {
      if (!langs[lang]) langs[lang] = {};
      langs[lang][str] = newStr;
    }
  } // Finally, tell counterpart about our translations


  for (const [lang, translations] of Object.entries(langs)) {
    _counterpart.default.registerTranslations(lang, translations);
  }
}
/**
 * Any custom modules with translations to load are parsed first, followed by an
 * optionally defined translations file in the config. If no customization is made,
 * or the file can't be parsed, no action will be taken.
 *
 * This function should be called *after* registering other translations data to
 * ensure it overrides strings properly.
 */


async function registerCustomTranslations() {
  const moduleTranslations = _ModuleRunner.ModuleRunner.instance.allTranslations;
  doRegisterTranslations(moduleTranslations);

  const lookupUrl = _SdkConfig.default.get().custom_translations_url;

  if (!lookupUrl) return; // easy - nothing to do

  try {
    let json;

    if (Date.now() >= cachedCustomTranslationsExpire) {
      json = CustomTranslationOptions.lookupFn ? CustomTranslationOptions.lookupFn(lookupUrl) : await (await fetch(lookupUrl)).json();
      cachedCustomTranslations = json; // Set expiration to the future, but not too far. Just trying to avoid
      // repeated, successive, calls to the server rather than anything long-term.

      cachedCustomTranslationsExpire = Date.now() + 5 * 60 * 1000;
    } else {
      json = cachedCustomTranslations;
    } // If the (potentially cached) json is invalid, don't use it.


    if (!json) return; // Finally, register it.

    doRegisterTranslations(json);
  } catch (e) {
    // We consume all exceptions because it's considered non-fatal for custom
    // translations to break. Most failures will be during initial development
    // of the json file and not (hopefully) at runtime.
    _logger.logger.warn("Ignoring error while registering custom translations: ", e); // Like above: trigger a cache of the json to avoid successive calls.


    cachedCustomTranslationsExpire = Date.now() + 5 * 60 * 1000;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpMThuRm9sZGVyIiwiQU5OT1RBVEVfU1RSSU5HUyIsImNvdW50ZXJwYXJ0Iiwic2V0U2VwYXJhdG9yIiwiRkFMTEJBQ0tfTE9DQUxFIiwic2V0RmFsbGJhY2tMb2NhbGUiLCJuZXdUcmFuc2xhdGFibGVFcnJvciIsIm1lc3NhZ2UiLCJ2YXJpYWJsZXMiLCJlcnJvciIsIkVycm9yIiwidHJhbnNsYXRlZE1lc3NhZ2UiLCJfdCIsImdldFVzZXJMYW5ndWFnZSIsImxhbmd1YWdlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwibm9ybWFsaXplTGFuZ3VhZ2VLZXkiLCJnZXRMYW5ndWFnZUZyb21Ccm93c2VyIiwiX3RkIiwicyIsInRyYW5zbGF0ZVdpdGhGYWxsYmFjayIsInRleHQiLCJvcHRpb25zIiwidHJhbnNsYXRlZCIsInRyYW5zbGF0ZSIsImZhbGxiYWNrTG9jYWxlIiwiZ2V0TG9jYWxlIiwic3RhcnRzV2l0aCIsImZhbGxiYWNrVHJhbnNsYXRlZCIsImxvY2FsZSIsInByb2Nlc3MiLCJlbnYiLCJOT0RFX0VOViIsImlzRmFsbGJhY2siLCJzYWZlQ291bnRlcnBhcnRUcmFuc2xhdGUiLCJpbnRlcnBvbGF0ZSIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiayIsInVuZGVmaW5lZCIsImxvZ2dlciIsIndhcm4iLCJhbm5vdGF0ZVN0cmluZ3MiLCJyZXN1bHQiLCJ0cmFuc2xhdGlvbktleSIsInRhZ3MiLCJzdWJzdGl0dXRlZCIsInN1YnN0aXR1dGUiLCJfdERvbSIsInNhbml0aXplRm9yVHJhbnNsYXRpb24iLCJyZXBsYWNlIiwicmVnZXhwTWFwcGluZyIsInZhcmlhYmxlIiwicmVwbGFjZUJ5UmVnZXhlcyIsInRhZyIsIm1hcHBpbmciLCJvdXRwdXQiLCJzaG91bGRXcmFwSW5TcGFuIiwicmVnZXhwU3RyaW5nIiwicmVnZXhwIiwiUmVnRXhwIiwibWF0Y2hGb3VuZFNvbWV3aGVyZSIsIm91dHB1dEluZGV4IiwibGVuZ3RoIiwiaW5wdXRUZXh0IiwibWF0Y2giLCJleGVjIiwiaGVhZCIsInNsaWNlIiwiaW5kZXgiLCJwYXJ0cyIsInByZXZNYXRjaCIsImNhcHR1cmVkR3JvdXBzIiwicmVwbGFjZWQiLCJGdW5jdGlvbiIsInB1c2giLCJ0YWlsIiwic3RhcnRJbmRleCIsInNwbGljZSIsImxvZyIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsImpvaW4iLCJzZXRNaXNzaW5nRW50cnlHZW5lcmF0b3IiLCJmIiwic2V0TGFuZ3VhZ2UiLCJwcmVmZXJyZWRMYW5ncyIsIkFycmF5IiwiaXNBcnJheSIsInBsYWYiLCJQbGF0Zm9ybVBlZyIsImdldCIsImxhbmdUb1VzZSIsImF2YWlsTGFuZ3MiLCJnZXRMYW5nc0pzb24iLCJ0aGVuIiwiaSIsImhhc093blByb3BlcnR5IiwiZ2V0TGFuZ3VhZ2VSZXRyeSIsImZpbGVOYW1lIiwibGFuZ0RhdGEiLCJyZWdpc3RlclRyYW5zbGF0aW9ucyIsInJlZ2lzdGVyQ3VzdG9tVHJhbnNsYXRpb25zIiwic2V0TG9jYWxlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJnZXRBbGxMYW5ndWFnZXNGcm9tSnNvbiIsImxhbmdzT2JqZWN0IiwibGFuZ3MiLCJsYW5nS2V5IiwibGFiZWwiLCJnZXRMYW5ndWFnZXNGcm9tQnJvd3NlciIsIm5hdmlnYXRvciIsImxhbmd1YWdlcyIsInVzZXJMYW5ndWFnZSIsImdldE5vcm1hbGl6ZWRMYW5ndWFnZUtleXMiLCJsYW5ndWFnZUtleXMiLCJub3JtYWxpemVkTGFuZ3VhZ2UiLCJsYW5ndWFnZVBhcnRzIiwic3BsaXQiLCJ0b0xvd2VyQ2FzZSIsImdldEN1cnJlbnRMYW5ndWFnZSIsInBpY2tCZXN0TGFuZ3VhZ2UiLCJjdXJyZW50TGFuZyIsIm5vcm1hbGlzZWRMYW5ncyIsIm1hcCIsImN1cnJlbnRMYW5nSW5kZXgiLCJpbmRleE9mIiwiY2xvc2VMYW5nSW5kZXgiLCJmaW5kSW5kZXgiLCJsIiwiZW5JbmRleCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidXJsIiwid2VicGFja0xhbmdKc29uVXJsIiwicmVxdWVzdCIsIm1ldGhvZCIsImVyciIsInJlc3BvbnNlIiwiYm9keSIsInN0YXR1cyIsIkpTT04iLCJwYXJzZSIsImxhbmdQYXRoIiwibnVtIiwicmV0cnkiLCJnZXRMYW5ndWFnZSIsImUiLCJjYWNoZWRDdXN0b21UcmFuc2xhdGlvbnMiLCJjYWNoZWRDdXN0b21UcmFuc2xhdGlvbnNFeHBpcmUiLCJDdXN0b21UcmFuc2xhdGlvbk9wdGlvbnMiLCJjb25zdHJ1Y3RvciIsImRvUmVnaXN0ZXJUcmFuc2xhdGlvbnMiLCJjdXN0b21UcmFuc2xhdGlvbnMiLCJzdHIiLCJ0cmFuc2xhdGlvbnMiLCJlbnRyaWVzIiwibGFuZyIsIm5ld1N0ciIsIm1vZHVsZVRyYW5zbGF0aW9ucyIsIk1vZHVsZVJ1bm5lciIsImluc3RhbmNlIiwiYWxsVHJhbnNsYXRpb25zIiwibG9va3VwVXJsIiwiU2RrQ29uZmlnIiwiY3VzdG9tX3RyYW5zbGF0aW9uc191cmwiLCJqc29uIiwiRGF0ZSIsIm5vdyIsImxvb2t1cEZuIiwiZmV0Y2giXSwic291cmNlcyI6WyIuLi9zcmMvbGFuZ3VhZ2VIYW5kbGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTVRSTm9yZCBhbmQgQ29vcGVyYXRpdmUgRUlUQVxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGQuXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDE5IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCByZXF1ZXN0IGZyb20gJ2Jyb3dzZXItcmVxdWVzdCc7XG5pbXBvcnQgY291bnRlcnBhcnQgZnJvbSAnY291bnRlcnBhcnQnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IE9wdGlvbmFsIH0gZnJvbSBcIm1hdHJpeC1ldmVudHMtc2RrXCI7XG5cbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi9QbGF0Zm9ybVBlZ1wiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgeyByZXRyeSB9IGZyb20gXCIuL3V0aWxzL3Byb21pc2VcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBNb2R1bGVSdW5uZXIgfSBmcm9tIFwiLi9tb2R1bGVzL01vZHVsZVJ1bm5lclwiO1xuXG4vLyBAdHMtaWdub3JlIC0gJHdlYmFwcCBpcyBhIHdlYnBhY2sgcmVzb2x2ZSBhbGlhcyBwb2ludGluZyB0byB0aGUgb3V0cHV0IGRpcmVjdG9yeSwgc2VlIHdlYnBhY2sgY29uZmlnXG5pbXBvcnQgd2VicGFja0xhbmdKc29uVXJsIGZyb20gXCIkd2ViYXBwL2kxOG4vbGFuZ3VhZ2VzLmpzb25cIjtcblxuY29uc3QgaTE4bkZvbGRlciA9ICdpMThuLyc7XG5cbi8vIENvbnRyb2wgd2hldGhlciB0byBhbHNvIHJldHVybiBvcmlnaW5hbCwgdW50cmFuc2xhdGVkIHN0cmluZ3Ncbi8vIFVzZWZ1bCBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nXG5jb25zdCBBTk5PVEFURV9TVFJJTkdTID0gZmFsc2U7XG5cbi8vIFdlIHVzZSBlbmdsaXNoIHN0cmluZ3MgYXMga2V5cywgc29tZSBvZiB3aGljaCBjb250YWluIGZ1bGwgc3RvcHNcbmNvdW50ZXJwYXJ0LnNldFNlcGFyYXRvcignfCcpO1xuXG4vLyBzZWUgYHRyYW5zbGF0ZVdpdGhGYWxsYmFja2AgZm9yIGFuIGV4cGxhbmF0aW9uIG9mIGZhbGxiYWNrIGhhbmRsaW5nXG5jb25zdCBGQUxMQkFDS19MT0NBTEUgPSAnZW4nO1xuY291bnRlcnBhcnQuc2V0RmFsbGJhY2tMb2NhbGUoRkFMTEJBQ0tfTE9DQUxFKTtcblxuZXhwb3J0IGludGVyZmFjZSBJVHJhbnNsYXRhYmxlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgdHJhbnNsYXRlZE1lc3NhZ2U6IHN0cmluZztcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGVycm9yIHdoaWNoIGhhcyBhbiBFbmdsaXNoIG1lc3NhZ2VcbiAqIHdpdGggYSB0cmFuc2xhdGVkTWVzc2FnZSBwcm9wZXJ0eSBmb3IgdXNlIGJ5IHRoZSBjb25zdW1lci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIE1lc3NhZ2UgdG8gdHJhbnNsYXRlLlxuICogQHBhcmFtIHtvYmplY3R9IHZhcmlhYmxlcyBWYXJpYWJsZSBzdWJzdGl0dXRpb25zLCBlLmcgeyBmb286ICdiYXInIH1cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNvbnN0cnVjdGVkIGVycm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3VHJhbnNsYXRhYmxlRXJyb3IobWVzc2FnZTogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogSVRyYW5zbGF0YWJsZUVycm9yIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKSBhcyBJVHJhbnNsYXRhYmxlRXJyb3I7XG4gICAgZXJyb3IudHJhbnNsYXRlZE1lc3NhZ2UgPSBfdChtZXNzYWdlLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBlcnJvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJMYW5ndWFnZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxhbmd1YWdlID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxhbmd1YWdlXCIsIG51bGwsIC8qZXhjbHVkZURlZmF1bHQ6Ki90cnVlKTtcbiAgICBpZiAobGFuZ3VhZ2UpIHtcbiAgICAgICAgcmV0dXJuIGxhbmd1YWdlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBub3JtYWxpemVMYW5ndWFnZUtleShnZXRMYW5ndWFnZUZyb21Ccm93c2VyKCkpO1xuICAgIH1cbn1cblxuLy8gRnVuY3Rpb24gd2hpY2ggb25seSBwdXJwb3NlIGlzIHRvIG1hcmsgdGhhdCBhIHN0cmluZyBpcyB0cmFuc2xhdGFibGVcbi8vIERvZXMgbm90IGFjdHVhbGx5IGRvIGFueXRoaW5nLiBJdCdzIGhlbHBmdWwgZm9yIGF1dG9tYXRpYyBleHRyYWN0aW9uIG9mIHRyYW5zbGF0YWJsZSBzdHJpbmdzXG5leHBvcnQgZnVuY3Rpb24gX3RkKHM6IHN0cmluZyk6IHN0cmluZyB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG4gICAgcmV0dXJuIHM7XG59XG5cbi8qKlxuICogdG8gaW1wcm92ZSBzY3JlZW4gcmVhZGVyIGV4cGVyaWVuY2UgdHJhbnNsYXRpb25zIHRoYXQgYXJlIG5vdCBpbiB0aGUgbWFpbiBwYWdlIGxhbmd1YWdlXG4gKiBlZyBhIHRyYW5zbGF0aW9uIHRoYXQgZmVsbCBiYWNrIHRvIGVuZ2xpc2ggZnJvbSBhbm90aGVyIGxhbmd1YWdlXG4gKiBzaG91bGQgYmUgd3JhcHBlZCB3aXRoIGFuIGFwcHJvcHJpYXRlIGBsYW5nPSdlbidgIGF0dHJpYnV0ZVxuICogY291bnRlcnBhcnQncyBgdHJhbnNsYXRlYCBkb2Vzbid0IGV4cG9zZSBhIHdheSB0byBkZXRlcm1pbmUgaWYgdGhlIHJlc3VsdGluZyB0cmFuc2xhdGlvblxuICogaXMgaW4gdGhlIHRhcmdldCBsb2NhbGUgb3IgYSBmYWxsYmFjayBsb2NhbGVcbiAqIGZvciB0aGlzIHJlYXNvbiwgZm9yY2UgZmFsbGJhY2tMb2NhbGUgPT09IGxvY2FsZSBpbiB0aGUgZmlyc3QgY2FsbCB0byB0cmFuc2xhdGVcbiAqIGFuZCBmYWxsYmFjayAnbWFudWFsbHknIHNvIHdlIGNhbiBtYXJrIGZhbGxiYWNrIHN0cmluZ3MgYXBwcm9wcmlhdGVseVxuICogKi9cbmNvbnN0IHRyYW5zbGF0ZVdpdGhGYWxsYmFjayA9ICh0ZXh0OiBzdHJpbmcsIG9wdGlvbnM/OiBvYmplY3QpOiB7IHRyYW5zbGF0ZWQ/OiBzdHJpbmcsIGlzRmFsbGJhY2s/OiBib29sZWFuIH0gPT4ge1xuICAgIGNvbnN0IHRyYW5zbGF0ZWQgPSBjb3VudGVycGFydC50cmFuc2xhdGUodGV4dCwgeyAuLi5vcHRpb25zLCBmYWxsYmFja0xvY2FsZTogY291bnRlcnBhcnQuZ2V0TG9jYWxlKCkgfSk7XG4gICAgaWYgKCF0cmFuc2xhdGVkIHx8IHRyYW5zbGF0ZWQuc3RhcnRzV2l0aChcIm1pc3NpbmcgdHJhbnNsYXRpb246XCIpKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrVHJhbnNsYXRlZCA9IGNvdW50ZXJwYXJ0LnRyYW5zbGF0ZSh0ZXh0LCB7IC4uLm9wdGlvbnMsIGxvY2FsZTogRkFMTEJBQ0tfTE9DQUxFIH0pO1xuICAgICAgICBpZiAoKCFmYWxsYmFja1RyYW5zbGF0ZWQgfHwgZmFsbGJhY2tUcmFuc2xhdGVkLnN0YXJ0c1dpdGgoXCJtaXNzaW5nIHRyYW5zbGF0aW9uOlwiKSlcbiAgICAgICAgICAgICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcImRldmVsb3BtZW50XCIpIHtcbiAgICAgICAgICAgIC8vIEV2ZW4gdGhlIHRyYW5zbGF0aW9uIHZpYSBGQUxMQkFDS19MT0NBTEUgZmFpbGVkOyB0aGlzIGNhbiBoYXBwZW4gaWZcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAxLiBUaGUgc3RyaW5nIGlzbid0IGluIHRoZSB0cmFuc2xhdGlvbnMgZGljdGlvbmFyeSwgdXN1YWxseSBiZWNhdXNlIHlvdSdyZSBpbiBkZXZlbG9wXG4gICAgICAgICAgICAvLyBhbmQgaGF2ZW4ndCBydW4geWFybiBpMThuXG4gICAgICAgICAgICAvLyAyLiBMb2FkaW5nIHRoZSB0cmFuc2xhdGlvbiByZXNvdXJjZXMgb3ZlciB0aGUgbmV0d29yayBmYWlsZWQsIHdoaWNoIGNhbiBoYXBwZW4gZHVlIHRvXG4gICAgICAgICAgICAvLyB0byBuZXR3b3JrIG9yIGlmIHRoZSBjbGllbnQgdHJpZWQgdG8gbG9hZCBhIHRyYW5zbGF0aW9uIHRoYXQncyBiZWVuIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgICAgICAgIC8vIHNlcnZlci5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCBpdHMgdGhlIGxlc3NlciBldmlsIHRvIHNob3cgdGhlIHVudHJhbnNsYXRlZCB0ZXh0LCB3aGljaFxuICAgICAgICAgICAgLy8gd2lsbCBiZSBpbiBFbmdsaXNoLCBzbyB0aGUgdXNlciBjYW4gc3RpbGwgbWFrZSBvdXQgKnNvbWV0aGluZyosIHJhdGhlciB0aGFuIGFuIG9wYXF1ZVxuICAgICAgICAgICAgLy8gXCJtaXNzaW5nIHRyYW5zbGF0aW9uXCIgZXJyb3IuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gRG9uJ3QgZG8gdGhpcyBpbiBkZXZlbG9wIHNvIHBlb3BsZSByZW1lbWJlciB0byBydW4geWFybiBpMThuLlxuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNsYXRlZDogdGV4dCwgaXNGYWxsYmFjazogdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHRyYW5zbGF0ZWQ6IGZhbGxiYWNrVHJhbnNsYXRlZCwgaXNGYWxsYmFjazogdHJ1ZSB9O1xuICAgIH1cbiAgICByZXR1cm4geyB0cmFuc2xhdGVkIH07XG59O1xuXG4vLyBXcmFwcGVyIGZvciBjb3VudGVycGFydCdzIHRyYW5zbGF0aW9uIGZ1bmN0aW9uIHNvIHRoYXQgaXQgaGFuZGxlcyBudWxscyBhbmQgdW5kZWZpbmVkcyBwcm9wZXJseVxuLy8gVGFrZXMgdGhlIHNhbWUgYXJndW1lbnRzIGFzIGNvdW50ZXJwYXJ0LnRyYW5zbGF0ZSgpXG5mdW5jdGlvbiBzYWZlQ291bnRlcnBhcnRUcmFuc2xhdGUodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM/OiBvYmplY3QpIHtcbiAgICAvLyBEb24ndCBkbyBzdWJzdGl0dXRpb25zIGluIGNvdW50ZXJwYXJ0LiBXZSBoYW5kbGUgaXQgb3Vyc2VsdmVzIHNvIHdlIGNhbiByZXBsYWNlIHdpdGggUmVhY3QgY29tcG9uZW50c1xuICAgIC8vIEhvd2V2ZXIsIHN0aWxsIHBhc3MgdGhlIHZhcmlhYmxlcyB0byBjb3VudGVycGFydCBzbyB0aGF0IGl0IGNhbiBjaG9vc2UgdGhlIGNvcnJlY3QgcGx1cmFsIGlmIGNvdW50IGlzIGdpdmVuXG4gICAgLy8gSXQgaXMgZW5vdWdoIHRvIHBhc3MgdGhlIGNvdW50IHZhcmlhYmxlLCBidXQgaW4gdGhlIGZ1dHVyZSBjb3VudGVycGFydCBtaWdodCBtYWtlIHVzZSBvZiBvdGhlciBpbmZvcm1hdGlvbiB0b29cbiAgICBjb25zdCBvcHRpb25zID0geyAuLi52YXJpYWJsZXMsIGludGVycG9sYXRlOiBmYWxzZSB9O1xuXG4gICAgLy8gSG9ycmlibGUgaGFjayB0byBhdm9pZCBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy80MTkxXG4gICAgLy8gVGhlIGludGVycG9sYXRpb24gbGlicmFyeSB0aGF0IGNvdW50ZXJwYXJ0IHVzZXMgZG9lcyBub3Qgc3VwcG9ydCB1bmRlZmluZWQvbnVsbFxuICAgIC8vIHZhbHVlcyBhbmQgaW5zdGVhZCB3aWxsIHRocm93IGFuIGVycm9yLiBUaGlzIGlzIGEgcHJvYmxlbSBzaW5jZSBldmVyeXdoZXJlIGVsc2VcbiAgICAvLyBpbiBKUyBsYW5kIHBhc3NpbmcgdW5kZWZpbmVkL251bGwgd2lsbCBzaW1wbHkgc3RyaW5naWZ5IGluc3RlYWQsIGFuZCB3aGVuIGNvbnZlcnRpbmdcbiAgICAvLyB2YWxpZCBFUzYgdGVtcGxhdGUgc3RyaW5ncyB0byBpMThuIHN0cmluZ3MgaXQncyBleHRyZW1lbHkgZWFzeSB0byBwYXNzIHVuZGVmaW5lZC9udWxsXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIGV4aXN0aW5nIG51bGwgZ3VhcmRzLiBUbyBhdm9pZCB0aGlzIG1ha2luZyB0aGUgYXBwIGNvbXBsZXRlbHkgaW5vcGVyYWJsZSxcbiAgICAvLyB3ZSdsbCBjaGVjayBhbGwgdGhlIHZhbHVlcyBmb3IgdW5kZWZpbmVkL251bGwgYW5kIHN0cmluZ2lmeSB0aGVtIGhlcmUuXG4gICAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goKGspID0+IHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zW2tdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihcInNhZmVDb3VudGVycGFydFRyYW5zbGF0ZSBjYWxsZWQgd2l0aCB1bmRlZmluZWQgaW50ZXJwb2xhdGlvbiBuYW1lOiBcIiArIGspO1xuICAgICAgICAgICAgICAgIG9wdGlvbnNba10gPSAndW5kZWZpbmVkJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb25zW2tdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJzYWZlQ291bnRlcnBhcnRUcmFuc2xhdGUgY2FsbGVkIHdpdGggbnVsbCBpbnRlcnBvbGF0aW9uIG5hbWU6IFwiICsgayk7XG4gICAgICAgICAgICAgICAgb3B0aW9uc1trXSA9ICdudWxsJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cmFuc2xhdGVXaXRoRmFsbGJhY2sodGV4dCwgb3B0aW9ucyk7XG59XG5cbnR5cGUgU3Vic3RpdHV0aW9uVmFsdWUgPSBudW1iZXIgfCBzdHJpbmcgfCBSZWFjdC5SZWFjdE5vZGUgfCAoKHN1Yjogc3RyaW5nKSA9PiBSZWFjdC5SZWFjdE5vZGUpO1xuXG5leHBvcnQgaW50ZXJmYWNlIElWYXJpYWJsZXMge1xuICAgIGNvdW50PzogbnVtYmVyO1xuICAgIFtrZXk6IHN0cmluZ106IFN1YnN0aXR1dGlvblZhbHVlO1xufVxuXG5leHBvcnQgdHlwZSBUYWdzID0gUmVjb3JkPHN0cmluZywgU3Vic3RpdHV0aW9uVmFsdWU+O1xuXG5leHBvcnQgdHlwZSBUcmFuc2xhdGVkU3RyaW5nID0gc3RyaW5nIHwgUmVhY3QuUmVhY3ROb2RlO1xuXG4vLyBGb3IgZGV2ZWxvcG1lbnQvdGVzdGluZyBwdXJwb3NlcyBpdCBpcyB1c2VmdWwgdG8gYWxzbyBvdXRwdXQgdGhlIG9yaWdpbmFsIHN0cmluZ1xuLy8gRG9uJ3QgZG8gdGhhdCBmb3IgcmVsZWFzZSB2ZXJzaW9uc1xuY29uc3QgYW5ub3RhdGVTdHJpbmdzID0gKHJlc3VsdDogVHJhbnNsYXRlZFN0cmluZywgdHJhbnNsYXRpb25LZXk6IHN0cmluZyk6IFRyYW5zbGF0ZWRTdHJpbmcgPT4ge1xuICAgIGlmICghQU5OT1RBVEVfU1RSSU5HUykge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gYEBAJHt0cmFuc2xhdGlvbktleX0jIyR7cmVzdWx0fUBAYDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPSd0cmFuc2xhdGVkLXN0cmluZycgZGF0YS1vcmlnLXN0cmluZz17dHJhbnNsYXRpb25LZXl9PnsgcmVzdWx0IH08L3NwYW4+O1xuICAgIH1cbn07XG5cbi8qXG4gKiBUcmFuc2xhdGVzIHRleHQgYW5kIG9wdGlvbmFsbHkgYWxzbyByZXBsYWNlcyBYTUwtaXNoIGVsZW1lbnRzIGluIHRoZSB0ZXh0IHdpdGggZS5nLiBSZWFjdCBjb21wb25lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBUaGUgdW50cmFuc2xhdGVkIHRleHQsIGUuZyBcImNsaWNrIDxhPmhlcmU8L2E+IG5vdyB0byAlKGZvbylzXCIuXG4gKiBAcGFyYW0ge29iamVjdH0gdmFyaWFibGVzIFZhcmlhYmxlIHN1YnN0aXR1dGlvbnMsIGUuZyB7IGZvbzogJ2JhcicgfVxuICogQHBhcmFtIHtvYmplY3R9IHRhZ3MgVGFnIHN1YnN0aXR1dGlvbnMgZS5nLiB7ICdhJzogKHN1YikgPT4gPGE+e3N1Yn08L2E+IH1cbiAqXG4gKiBJbiBib3RoIHZhcmlhYmxlcyBhbmQgdGFncywgdGhlIHZhbHVlcyB0byBzdWJzdGl0dXRlIHdpdGggY2FuIGJlIGVpdGhlciBzaW1wbGUgc3RyaW5ncywgUmVhY3QgY29tcG9uZW50cyxcbiAqIG9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiB0aGUgdmFsdWUgdG8gdXNlIGluIHRoZSBzdWJzdGl0dXRpb24gKGUuZy4gcmV0dXJuIGEgUmVhY3QgY29tcG9uZW50KS4gSW4gY2FzZSBvZlxuICogYSB0YWcgcmVwbGFjZW1lbnQsIHRoZSBmdW5jdGlvbiByZWNlaXZlcyBhcyB0aGUgYXJndW1lbnQgdGhlIHRleHQgaW5zaWRlIHRoZSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHRhZy5cbiAqXG4gKiBVc2UgdGFnIHN1YnN0aXR1dGlvbnMgaWYgeW91IG5lZWQgdG8gdHJhbnNsYXRlIHRleHQgYmV0d2VlbiB0YWdzIChlLmcuIFwiPGE+Q2xpY2sgaGVyZSE8L2E+XCIpLCBvdGhlcndpc2VcbiAqIHlvdSB3aWxsIGVuZCB1cCB3aXRoIGxpdGVyYWwgXCI8YT5cIiBpbiB5b3VyIG91dHB1dCwgcmF0aGVyIHRoYW4gSFRNTC4gTm90ZSB0aGF0IHlvdSBjYW4gYWxzbyB1c2UgdmFyaWFibGVcbiAqIHN1YnN0aXR1dGlvbiB0byBpbnNlcnQgUmVhY3QgY29tcG9uZW50cywgYnV0IHlvdSBjYW4ndCB1c2UgaXQgdG8gdHJhbnNsYXRlIHRleHQgYmV0d2VlbiB0YWdzLlxuICpcbiAqIEByZXR1cm4gYSBSZWFjdCA8c3Bhbj4gY29tcG9uZW50IGlmIGFueSBub24tc3RyaW5ncyB3ZXJlIHVzZWQgaW4gc3Vic3RpdHV0aW9ucywgb3RoZXJ3aXNlIGEgc3RyaW5nXG4gKi9cbi8vIGVzbGludC1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5leHBvcnQgZnVuY3Rpb24gX3QodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5nO1xuZXhwb3J0IGZ1bmN0aW9uIF90KHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCB0YWdzOiBUYWdzKTogUmVhY3QuUmVhY3ROb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIF90KHRleHQ6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcywgdGFncz86IFRhZ3MpOiBUcmFuc2xhdGVkU3RyaW5nIHtcbiAgICAvLyBUaGUgdHJhbnNsYXRpb24gcmV0dXJucyB0ZXh0IHNvIHRoZXJlJ3Mgbm8gWFNTIHZlY3RvciBoZXJlIChubyB1bnNhZmUgSFRNTCwgbm8gY29kZSBleGVjdXRpb24pXG4gICAgY29uc3QgeyB0cmFuc2xhdGVkIH0gPSBzYWZlQ291bnRlcnBhcnRUcmFuc2xhdGUodGV4dCwgdmFyaWFibGVzKTtcbiAgICBjb25zdCBzdWJzdGl0dXRlZCA9IHN1YnN0aXR1dGUodHJhbnNsYXRlZCwgdmFyaWFibGVzLCB0YWdzKTtcblxuICAgIHJldHVybiBhbm5vdGF0ZVN0cmluZ3Moc3Vic3RpdHV0ZWQsIHRleHQpO1xufVxuXG4vKlxuICogV3JhcHMgbm9ybWFsIF90IGZ1bmN0aW9uIGFuZCBhZGRzIGF0dHRyaWJ1dGlvbiBmb3IgdHJhbnNsYXRpb25zIHRoYXQgdXNlZCBhIGZhbGxiYWNrIGxvY2FsZVxuICogV3JhcHMgdHJhbnNsYXRpb25zIHRoYXQgZmVsbCBiYWNrIGZyb20gYWN0aXZlIGxvY2FsZSB0byBmYWxsYmFjayBsb2NhbGUgd2l0aCBhIGA8c3BhbiBsYW5nPTxmYWxsYmFjayBsb2NhbGU+PmBcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSB1bnRyYW5zbGF0ZWQgdGV4dCwgZS5nIFwiY2xpY2sgPGE+aGVyZTwvYT4gbm93IHRvICUoZm9vKXNcIi5cbiAqIEBwYXJhbSB7b2JqZWN0fSB2YXJpYWJsZXMgVmFyaWFibGUgc3Vic3RpdHV0aW9ucywgZS5nIHsgZm9vOiAnYmFyJyB9XG4gKiBAcGFyYW0ge29iamVjdH0gdGFncyBUYWcgc3Vic3RpdHV0aW9ucyBlLmcuIHsgJ2EnOiAoc3ViKSA9PiA8YT57c3VifTwvYT4gfVxuICpcbiAqIEByZXR1cm4gYSBSZWFjdCA8c3Bhbj4gY29tcG9uZW50IGlmIGFueSBub24tc3RyaW5ncyB3ZXJlIHVzZWQgaW4gc3Vic3RpdHV0aW9uc1xuICogb3IgdHJhbnNsYXRpb24gdXNlZCBhIGZhbGxiYWNrIGxvY2FsZSwgb3RoZXJ3aXNlIGEgc3RyaW5nXG4gKi9cbi8vIGVzbGludC1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5leHBvcnQgZnVuY3Rpb24gX3REb20odGV4dDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogVHJhbnNsYXRlZFN0cmluZztcbmV4cG9ydCBmdW5jdGlvbiBfdERvbSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcywgdGFnczogVGFncyk6IFJlYWN0LlJlYWN0Tm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBfdERvbSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlcz86IElWYXJpYWJsZXMsIHRhZ3M/OiBUYWdzKTogVHJhbnNsYXRlZFN0cmluZyB7XG4gICAgLy8gVGhlIHRyYW5zbGF0aW9uIHJldHVybnMgdGV4dCBzbyB0aGVyZSdzIG5vIFhTUyB2ZWN0b3IgaGVyZSAobm8gdW5zYWZlIEhUTUwsIG5vIGNvZGUgZXhlY3V0aW9uKVxuICAgIGNvbnN0IHsgdHJhbnNsYXRlZCwgaXNGYWxsYmFjayB9ID0gc2FmZUNvdW50ZXJwYXJ0VHJhbnNsYXRlKHRleHQsIHZhcmlhYmxlcyk7XG4gICAgY29uc3Qgc3Vic3RpdHV0ZWQgPSBzdWJzdGl0dXRlKHRyYW5zbGF0ZWQsIHZhcmlhYmxlcywgdGFncyk7XG5cbiAgICAvLyB3cmFwIGVuIGZhbGxiYWNrIHRyYW5zbGF0aW9uIHdpdGggbGFuZyBhdHRyaWJ1dGUgZm9yIHNjcmVlbiByZWFkZXJzXG4gICAgY29uc3QgcmVzdWx0ID0gaXNGYWxsYmFjayA/IDxzcGFuIGxhbmc9J2VuJz57IHN1YnN0aXR1dGVkIH08L3NwYW4+IDogc3Vic3RpdHV0ZWQ7XG5cbiAgICByZXR1cm4gYW5ub3RhdGVTdHJpbmdzKHJlc3VsdCwgdGV4dCk7XG59XG5cbi8qKlxuICogU2FuaXRpemVzIHVuc2FmZSB0ZXh0IGZvciB0aGUgc2FuaXRpemVyLCBlbnN1cmluZyByZWZlcmVuY2VzIHRvIHZhcmlhYmxlcyB3aWxsIG5vdCBiZSBjb25zaWRlcmVkXG4gKiByZXBsYWNlYWJsZSBieSB0aGUgdHJhbnNsYXRpb24gZnVuY3Rpb25zLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgVGhlIHRleHQgdG8gc2FuaXRpemUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc2FuaXRpemVkIHRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUZvclRyYW5zbGF0aW9uKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gQWRkIGEgbm9uLWJyZWFraW5nIHNwYWNlIHNvIHRoZSByZWdleCBkb2Vzbid0IHRyaWdnZXIgd2hlbiB0cmFuc2xhdGluZy5cbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8lXFwoKFteKV0qKVxcKS9nLCAnJVxceGEwKCQxKScpO1xufVxuXG4vKlxuICogU2ltaWxhciB0byBfdCgpLCBleGNlcHQgb25seSBkb2VzIHN1YnN0aXR1dGlvbnMsIGFuZCBubyB0cmFuc2xhdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgVGhlIHRleHQsIGUuZyBcImNsaWNrIDxhPmhlcmU8L2E+IG5vdyB0byAlKGZvbylzXCIuXG4gKiBAcGFyYW0ge29iamVjdH0gdmFyaWFibGVzIFZhcmlhYmxlIHN1YnN0aXR1dGlvbnMsIGUuZyB7IGZvbzogJ2JhcicgfVxuICogQHBhcmFtIHtvYmplY3R9IHRhZ3MgVGFnIHN1YnN0aXR1dGlvbnMgZS5nLiB7ICdhJzogKHN1YikgPT4gPGE+e3N1Yn08L2E+IH1cbiAqXG4gKiBUaGUgdmFsdWVzIHRvIHN1YnN0aXR1dGUgd2l0aCBjYW4gYmUgZWl0aGVyIHNpbXBsZSBzdHJpbmdzLCBvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gdGhlIHZhbHVlIHRvIHVzZSBpblxuICogdGhlIHN1YnN0aXR1dGlvbiAoZS5nLiByZXR1cm4gYSBSZWFjdCBjb21wb25lbnQpLiBJbiBjYXNlIG9mIGEgdGFnIHJlcGxhY2VtZW50LCB0aGUgZnVuY3Rpb24gcmVjZWl2ZXMgYXNcbiAqIHRoZSBhcmd1bWVudCB0aGUgdGV4dCBpbnNpZGUgdGhlIGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgdGFnLlxuICpcbiAqIEByZXR1cm4gYSBSZWFjdCA8c3Bhbj4gY29tcG9uZW50IGlmIGFueSBub24tc3RyaW5ncyB3ZXJlIHVzZWQgaW4gc3Vic3RpdHV0aW9ucywgb3RoZXJ3aXNlIGEgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJzdGl0dXRlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcyk6IHN0cmluZztcbmV4cG9ydCBmdW5jdGlvbiBzdWJzdGl0dXRlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzLCB0YWdzOiBUYWdzKTogc3RyaW5nO1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnN0aXR1dGUodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzLCB0YWdzPzogVGFncyk6IHN0cmluZyB8IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgbGV0IHJlc3VsdDogUmVhY3QuUmVhY3ROb2RlIHwgc3RyaW5nID0gdGV4dDtcblxuICAgIGlmICh2YXJpYWJsZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCByZWdleHBNYXBwaW5nOiBJVmFyaWFibGVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdmFyaWFibGUgaW4gdmFyaWFibGVzKSB7XG4gICAgICAgICAgICByZWdleHBNYXBwaW5nW2AlXFxcXCgke3ZhcmlhYmxlfVxcXFwpc2BdID0gdmFyaWFibGVzW3ZhcmlhYmxlXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSByZXBsYWNlQnlSZWdleGVzKHJlc3VsdCBhcyBzdHJpbmcsIHJlZ2V4cE1hcHBpbmcpO1xuICAgIH1cblxuICAgIGlmICh0YWdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgcmVnZXhwTWFwcGluZzogVGFncyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHRhZyBpbiB0YWdzKSB7XG4gICAgICAgICAgICByZWdleHBNYXBwaW5nW2AoPCR7dGFnfT4oLio/KTxcXFxcLyR7dGFnfT58PCR7dGFnfT58PCR7dGFnfVxcXFxzKlxcXFwvPilgXSA9IHRhZ3NbdGFnXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSByZXBsYWNlQnlSZWdleGVzKHJlc3VsdCBhcyBzdHJpbmcsIHJlZ2V4cE1hcHBpbmcpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qXG4gKiBSZXBsYWNlIHBhcnRzIG9mIGEgdGV4dCB1c2luZyByZWd1bGFyIGV4cHJlc3Npb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBUaGUgdGV4dCBvbiB3aGljaCB0byBwZXJmb3JtIHN1YnN0aXR1dGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBtYXBwaW5nIEEgbWFwcGluZyBmcm9tIHJlZ3VsYXIgZXhwcmVzc2lvbnMgaW4gc3RyaW5nIGZvcm0gdG8gcmVwbGFjZW1lbnQgc3RyaW5nIG9yIGFcbiAqIGZ1bmN0aW9uIHdoaWNoIHdpbGwgcmVjZWl2ZSBhcyB0aGUgYXJndW1lbnQgdGhlIGNhcHR1cmUgZ3JvdXBzIGRlZmluZWQgaW4gdGhlIHJlZ2V4cC4gRS5nLlxuICogeyAnSGVsbG8gKC4/KSBXb3JsZCc6IChzdWIpID0+IHN1Yi50b1VwcGVyQ2FzZSgpIH1cbiAqXG4gKiBAcmV0dXJuIGEgUmVhY3QgPHNwYW4+IGNvbXBvbmVudCBpZiBhbnkgbm9uLXN0cmluZ3Mgd2VyZSB1c2VkIGluIHN1YnN0aXR1dGlvbnMsIG90aGVyd2lzZSBhIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZUJ5UmVnZXhlcyh0ZXh0OiBzdHJpbmcsIG1hcHBpbmc6IElWYXJpYWJsZXMpOiBzdHJpbmc7XG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZUJ5UmVnZXhlcyh0ZXh0OiBzdHJpbmcsIG1hcHBpbmc6IFRhZ3MpOiBSZWFjdC5SZWFjdE5vZGU7XG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZUJ5UmVnZXhlcyh0ZXh0OiBzdHJpbmcsIG1hcHBpbmc6IElWYXJpYWJsZXMgfCBUYWdzKTogc3RyaW5nIHwgUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAvLyBXZSBpbml0aWFsbHkgc3RvcmUgb3VyIG91dHB1dCBhcyBhbiBhcnJheSBvZiBzdHJpbmdzIGFuZCBvYmplY3RzIChlLmcuIFJlYWN0IGNvbXBvbmVudHMpLlxuICAgIC8vIFRoaXMgd2lsbCB0aGVuIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZyBvciBhIDxzcGFuPiBhdCB0aGUgZW5kXG4gICAgY29uc3Qgb3V0cHV0ID0gW3RleHRdO1xuXG4gICAgLy8gSWYgd2UgaW5zZXJ0IGFueSBjb21wb25lbnRzIHdlIG5lZWQgdG8gd3JhcCB0aGUgb3V0cHV0IGluIGEgc3Bhbi4gUmVhY3QgZG9lc24ndCBsaWtlIGp1c3QgYW4gYXJyYXkgb2YgY29tcG9uZW50cy5cbiAgICBsZXQgc2hvdWxkV3JhcEluU3BhbiA9IGZhbHNlO1xuXG4gICAgZm9yIChjb25zdCByZWdleHBTdHJpbmcgaW4gbWFwcGluZykge1xuICAgICAgICAvLyBUT0RPOiBDYWNoZSByZWdleHBzXG4gICAgICAgIGNvbnN0IHJlZ2V4cCA9IG5ldyBSZWdFeHAocmVnZXhwU3RyaW5nLCBcImdcIik7XG5cbiAgICAgICAgLy8gTG9vcCBvdmVyIHdoYXQgb3V0cHV0IHdlIGhhdmUgc28gZmFyIGFuZCBwZXJmb3JtIHJlcGxhY2VtZW50c1xuICAgICAgICAvLyBXZSBsb29rIGZvciBtYXRjaGVzOiBpZiB3ZSBmaW5kIG9uZSwgd2UgZ2V0IHRocmVlIHBhcnRzOiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgbWF0Y2gsIHRoZSByZXBsYWNlZCBwYXJ0LFxuICAgICAgICAvLyBhbmQgZXZlcnl0aGluZyBhZnRlciB0aGUgbWF0Y2guIEluc2VydCBhbGwgdGhyZWUgaW50byB0aGUgb3V0cHV0LiBXZSBuZWVkIHRvIGRvIHRoaXMgYmVjYXVzZSB3ZSBjYW4gaW5zZXJ0IG9iamVjdHMuXG4gICAgICAgIC8vIE90aGVyd2lzZSB0aGVyZSB3b3VsZCBiZSBubyBuZWVkIGZvciB0aGUgc3BsaXR0aW5nIGFuZCB3ZSBjb3VsZCBkbyBzaW1wbGUgcmVwbGFjZW1lbnQuXG4gICAgICAgIGxldCBtYXRjaEZvdW5kU29tZXdoZXJlID0gZmFsc2U7IC8vIElmIHdlIGRvbid0IGZpbmQgYSBtYXRjaCBhbnl3aGVyZSB3ZSB3YW50IHRvIGxvZyBpdFxuICAgICAgICBmb3IgKGxldCBvdXRwdXRJbmRleCA9IDA7IG91dHB1dEluZGV4IDwgb3V0cHV0Lmxlbmd0aDsgb3V0cHV0SW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgaW5wdXRUZXh0ID0gb3V0cHV0W291dHB1dEluZGV4XTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXRUZXh0ICE9PSAnc3RyaW5nJykgeyAvLyBXZSBtaWdodCBoYXZlIGluc2VydGVkIG9iamVjdHMgZWFybGllciwgZG9uJ3QgdHJ5IHRvIHJlcGxhY2UgdGhlbVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwcm9jZXNzIGV2ZXJ5IG1hdGNoIGluIHRoZSBzdHJpbmdcbiAgICAgICAgICAgIC8vIHN0YXJ0aW5nIHdpdGggdGhlIGZpcnN0XG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSByZWdleHAuZXhlYyhpbnB1dFRleHQpO1xuXG4gICAgICAgICAgICBpZiAoIW1hdGNoKSBjb250aW51ZTtcbiAgICAgICAgICAgIG1hdGNoRm91bmRTb21ld2hlcmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBUaGUgdGV4dHVhbCBwYXJ0IGJlZm9yZSB0aGUgZmlyc3QgbWF0Y2hcbiAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBpbnB1dFRleHQuc2xpY2UoMCwgbWF0Y2guaW5kZXgpO1xuXG4gICAgICAgICAgICBjb25zdCBwYXJ0cyA9IFtdO1xuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiBwcmV2TWF0Y2hcbiAgICAgICAgICAgIGxldCBwcmV2TWF0Y2g7XG4gICAgICAgICAgICB3aGlsZSAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAvLyBzdG9yZSBwcmV2TWF0Y2hcbiAgICAgICAgICAgICAgICBwcmV2TWF0Y2ggPSBtYXRjaDtcbiAgICAgICAgICAgICAgICBjb25zdCBjYXB0dXJlZEdyb3VwcyA9IG1hdGNoLnNsaWNlKDIpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHJlcGxhY2VkO1xuICAgICAgICAgICAgICAgIC8vIElmIHN1YnN0aXR1dGlvbiBpcyBhIGZ1bmN0aW9uLCBjYWxsIGl0XG4gICAgICAgICAgICAgICAgaWYgKG1hcHBpbmdbcmVnZXhwU3RyaW5nXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VkID0gKChtYXBwaW5nIGFzIFRhZ3MpW3JlZ2V4cFN0cmluZ10gYXMgRnVuY3Rpb24pKC4uLmNhcHR1cmVkR3JvdXBzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXBsYWNlZCA9IG1hcHBpbmdbcmVnZXhwU3RyaW5nXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VkID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBzaG91bGRXcmFwSW5TcGFuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBIZXJlIHdlIGFsc28gbmVlZCB0byBjaGVjayB0aGF0IGl0IGFjdHVhbGx5IGlzIGEgc3RyaW5nIGJlZm9yZSBjb21wYXJpbmcgYWdhaW5zdCBvbmVcbiAgICAgICAgICAgICAgICAvLyBUaGUgaGVhZCBhbmQgdGFpbCBhcmUgYWx3YXlzIHN0cmluZ3NcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VkICE9PSAnc3RyaW5nJyB8fCByZXBsYWNlZCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydHMucHVzaChyZXBsYWNlZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdHJ5IHRoZSBuZXh0IG1hdGNoXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSByZWdleHAuZXhlYyhpbnB1dFRleHQpO1xuXG4gICAgICAgICAgICAgICAgLy8gYWRkIHRoZSB0ZXh0IGJldHdlZW4gcHJldk1hdGNoIGFuZCB0aGlzIG9uZVxuICAgICAgICAgICAgICAgIC8vIG9yIHRoZSBlbmQgb2YgdGhlIHN0cmluZyBpZiBwcmV2TWF0Y2ggaXMgdGhlIGxhc3QgbWF0Y2hcbiAgICAgICAgICAgICAgICBsZXQgdGFpbDtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRJbmRleCA9IHByZXZNYXRjaC5pbmRleCArIHByZXZNYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHRhaWwgPSBpbnB1dFRleHQuc2xpY2Uoc3RhcnRJbmRleCwgbWF0Y2guaW5kZXgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhaWwgPSBpbnB1dFRleHQuc2xpY2UocHJldk1hdGNoLmluZGV4ICsgcHJldk1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0YWlsKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRzLnB1c2godGFpbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbnNlcnQgaW4gcmV2ZXJzZSBvcmRlciBhcyBzcGxpY2UgZG9lcyBpbnNlcnQtYmVmb3JlIGFuZCB0aGlzIHdheSB3ZSBnZXQgdGhlIGZpbmFsIG9yZGVyIGNvcnJlY3RcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgb2xkIGVsZW1lbnQgYXQgdGhlIHNhbWUgdGltZVxuICAgICAgICAgICAgb3V0cHV0LnNwbGljZShvdXRwdXRJbmRleCwgMSwgLi4ucGFydHMpO1xuXG4gICAgICAgICAgICBpZiAoaGVhZCAhPT0gJycpIHsgLy8gRG9uJ3QgcHVzaCBlbXB0eSBub2RlcywgdGhleSBhcmUgb2Ygbm8gdXNlXG4gICAgICAgICAgICAgICAgb3V0cHV0LnNwbGljZShvdXRwdXRJbmRleCwgMCwgaGVhZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtYXRjaEZvdW5kU29tZXdoZXJlKSB7IC8vIFRoZSBjdXJyZW50IHJlZ2V4cCBkaWQgbm90IG1hdGNoIGFueXRoaW5nIGluIHRoZSBpbnB1dFxuICAgICAgICAgICAgLy8gTWlzc2luZyBtYXRjaGVzIGlzIGVudGlyZWx5IHBvc3NpYmxlIGJlY2F1c2UgeW91IG1pZ2h0IGNob29zZSB0byBzaG93IHNvbWUgdmFyaWFibGVzIG9ubHkgaW4gdGhlIGNhc2VcbiAgICAgICAgICAgIC8vIG9mIGUuZy4gcGx1cmFscy4gSXQncyBzdGlsbCBhIGJpdCBzdXNwaWNpb3VzLCBhbmQgY291bGQgYmUgZHVlIHRvIGFuIGVycm9yLCBzbyBsb2cgaXQuXG4gICAgICAgICAgICAvLyBIb3dldmVyLCBub3Qgc2hvd2luZyBjb3VudCBpcyBzbyBjb21tb24gdGhhdCBpdCdzIG5vdCB3b3J0aCBsb2dnaW5nLiBBbmQgb3RoZXIgY29tbW9ubHkgdW51c2VkIHZhcmlhYmxlc1xuICAgICAgICAgICAgLy8gaGVyZSwgaWYgdGhlcmUgYXJlIGFueS5cbiAgICAgICAgICAgIGlmIChyZWdleHBTdHJpbmcgIT09ICclXFxcXChjb3VudFxcXFwpcycpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKGBDb3VsZCBub3QgZmluZCAke3JlZ2V4cH0gaW4gJHt0ZXh0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNob3VsZFdyYXBJblNwYW4pIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCBudWxsLCAuLi5vdXRwdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvdXRwdXQuam9pbignJyk7XG4gICAgfVxufVxuXG4vLyBBbGxvdyBvdmVycmlkaW5nIHRoZSB0ZXh0IGRpc3BsYXllZCB3aGVuIG5vIHRyYW5zbGF0aW9uIGV4aXN0c1xuLy8gQ3VycmVudGx5IG9ubHkgdXNlZCBpbiB1bml0IHRlc3RzIHRvIGF2b2lkIGhhdmluZyB0byBsb2FkXG4vLyB0aGUgdHJhbnNsYXRpb25zIGluIGVsZW1lbnQtd2ViXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlzc2luZ0VudHJ5R2VuZXJhdG9yKGY6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgY291bnRlcnBhcnQuc2V0TWlzc2luZ0VudHJ5R2VuZXJhdG9yKGYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TGFuZ3VhZ2UocHJlZmVycmVkTGFuZ3M6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByZWZlcnJlZExhbmdzKSkge1xuICAgICAgICBwcmVmZXJyZWRMYW5ncyA9IFtwcmVmZXJyZWRMYW5nc107XG4gICAgfVxuXG4gICAgY29uc3QgcGxhZiA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgIGlmIChwbGFmKSB7XG4gICAgICAgIHBsYWYuc2V0TGFuZ3VhZ2UocHJlZmVycmVkTGFuZ3MpO1xuICAgIH1cblxuICAgIGxldCBsYW5nVG9Vc2U7XG4gICAgbGV0IGF2YWlsTGFuZ3M7XG4gICAgcmV0dXJuIGdldExhbmdzSnNvbigpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICBhdmFpbExhbmdzID0gcmVzdWx0O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZmVycmVkTGFuZ3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChhdmFpbExhbmdzLmhhc093blByb3BlcnR5KHByZWZlcnJlZExhbmdzW2ldKSkge1xuICAgICAgICAgICAgICAgIGxhbmdUb1VzZSA9IHByZWZlcnJlZExhbmdzW2ldO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghbGFuZ1RvVXNlKSB7XG4gICAgICAgICAgICAvLyBGYWxsYmFjayB0byBlbl9FTiBpZiBub25lIGlzIGZvdW5kXG4gICAgICAgICAgICBsYW5nVG9Vc2UgPSAnZW4nO1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiVW5hYmxlIHRvIGZpbmQgYW4gYXBwcm9wcmlhdGUgbGFuZ3VhZ2VcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2V0TGFuZ3VhZ2VSZXRyeShpMThuRm9sZGVyICsgYXZhaWxMYW5nc1tsYW5nVG9Vc2VdLmZpbGVOYW1lKTtcbiAgICB9KS50aGVuKGFzeW5jIChsYW5nRGF0YSkgPT4ge1xuICAgICAgICBjb3VudGVycGFydC5yZWdpc3RlclRyYW5zbGF0aW9ucyhsYW5nVG9Vc2UsIGxhbmdEYXRhKTtcbiAgICAgICAgYXdhaXQgcmVnaXN0ZXJDdXN0b21UcmFuc2xhdGlvbnMoKTtcbiAgICAgICAgY291bnRlcnBhcnQuc2V0TG9jYWxlKGxhbmdUb1VzZSk7XG4gICAgICAgIGF3YWl0IFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJsYW5ndWFnZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBsYW5nVG9Vc2UpO1xuICAgICAgICAvLyBBZGRzIGEgbG90IG9mIG5vaXNlIHRvIHRlc3QgcnVucywgc28gZGlzYWJsZSBsb2dnaW5nIHRoZXJlLlxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwidGVzdFwiKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwic2V0IGxhbmd1YWdlIHRvIFwiICsgbGFuZ1RvVXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCAnZW4nIGFzIGZhbGxiYWNrIGxhbmd1YWdlOlxuICAgICAgICBpZiAobGFuZ1RvVXNlICE9PSBcImVuXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRMYW5ndWFnZVJldHJ5KGkxOG5Gb2xkZXIgKyBhdmFpbExhbmdzWydlbiddLmZpbGVOYW1lKTtcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oYXN5bmMgKGxhbmdEYXRhKSA9PiB7XG4gICAgICAgIGlmIChsYW5nRGF0YSkgY291bnRlcnBhcnQucmVnaXN0ZXJUcmFuc2xhdGlvbnMoJ2VuJywgbGFuZ0RhdGEpO1xuICAgICAgICBhd2FpdCByZWdpc3RlckN1c3RvbVRyYW5zbGF0aW9ucygpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsTGFuZ3VhZ2VzRnJvbUpzb24oKSB7XG4gICAgcmV0dXJuIGdldExhbmdzSnNvbigpLnRoZW4oKGxhbmdzT2JqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGxhbmdzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgbGFuZ0tleSBpbiBsYW5nc09iamVjdCkge1xuICAgICAgICAgICAgaWYgKGxhbmdzT2JqZWN0Lmhhc093blByb3BlcnR5KGxhbmdLZXkpKSB7XG4gICAgICAgICAgICAgICAgbGFuZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IGxhbmdLZXksXG4gICAgICAgICAgICAgICAgICAgICdsYWJlbCc6IGxhbmdzT2JqZWN0W2xhbmdLZXldLmxhYmVsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYW5ncztcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExhbmd1YWdlc0Zyb21Ccm93c2VyKCkge1xuICAgIGlmIChuYXZpZ2F0b3IubGFuZ3VhZ2VzICYmIG5hdmlnYXRvci5sYW5ndWFnZXMubGVuZ3RoKSByZXR1cm4gbmF2aWdhdG9yLmxhbmd1YWdlcztcbiAgICBpZiAobmF2aWdhdG9yLmxhbmd1YWdlKSByZXR1cm4gW25hdmlnYXRvci5sYW5ndWFnZV07XG4gICAgcmV0dXJuIFtuYXZpZ2F0b3IudXNlckxhbmd1YWdlIHx8IFwiZW5cIl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYW5ndWFnZUZyb21Ccm93c2VyKCkge1xuICAgIHJldHVybiBnZXRMYW5ndWFnZXNGcm9tQnJvd3NlcigpWzBdO1xufVxuXG4vKipcbiAqIFR1cm5zIGEgbGFuZ3VhZ2Ugc3RyaW5nLCBub3JtYWxpc2VzIGl0LFxuICogKHNlZSBub3JtYWxpemVMYW5ndWFnZUtleSkgaW50byBhbiBhcnJheSBvZiBsYW5ndWFnZSBzdHJpbmdzXG4gKiB3aXRoIGZhbGxiYWNrIHRvIGdlbmVyaWMgbGFuZ3VhZ2VzXG4gKiAoZWcuICdwdC1CUicgPT4gWydwdC1icicsICdwdCddKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYW5ndWFnZSBUaGUgaW5wdXQgbGFuZ3VhZ2Ugc3RyaW5nXG4gKiBAcmV0dXJuIHtzdHJpbmdbXX0gTGlzdCBvZiBub3JtYWxpc2VkIGxhbmd1YWdlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9ybWFsaXplZExhbmd1YWdlS2V5cyhsYW5ndWFnZTogc3RyaW5nKSB7XG4gICAgY29uc3QgbGFuZ3VhZ2VLZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRMYW5ndWFnZSA9IG5vcm1hbGl6ZUxhbmd1YWdlS2V5KGxhbmd1YWdlKTtcbiAgICBjb25zdCBsYW5ndWFnZVBhcnRzID0gbm9ybWFsaXplZExhbmd1YWdlLnNwbGl0KCctJyk7XG4gICAgaWYgKGxhbmd1YWdlUGFydHMubGVuZ3RoID09PSAyICYmIGxhbmd1YWdlUGFydHNbMF0gPT09IGxhbmd1YWdlUGFydHNbMV0pIHtcbiAgICAgICAgbGFuZ3VhZ2VLZXlzLnB1c2gobGFuZ3VhZ2VQYXJ0c1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGFuZ3VhZ2VLZXlzLnB1c2gobm9ybWFsaXplZExhbmd1YWdlKTtcbiAgICAgICAgaWYgKGxhbmd1YWdlUGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBsYW5ndWFnZUtleXMucHVzaChsYW5ndWFnZVBhcnRzWzBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGFuZ3VhZ2VLZXlzO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBsYW5ndWFnZSBzdHJpbmcgd2l0aCB1bmRlcnNjb3JlcyByZXBsYWNlZCB3aXRoXG4gKiBoeXBoZW5zLCBhbmQgbG93ZXJjYXNlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbGFuZ3VhZ2UgVGhlIGxhbmd1YWdlIHN0cmluZyB0byBiZSBub3JtYWxpemVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgbm9ybWFsaXplZCBsYW5ndWFnZSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUxhbmd1YWdlS2V5KGxhbmd1YWdlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbGFuZ3VhZ2UudG9Mb3dlckNhc2UoKS5yZXBsYWNlKFwiX1wiLCBcIi1cIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50TGFuZ3VhZ2UoKSB7XG4gICAgcmV0dXJuIGNvdW50ZXJwYXJ0LmdldExvY2FsZSgpO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgbGlzdCBvZiBsYW5ndWFnZSBjb2RlcywgcGljayB0aGUgbW9zdCBhcHByb3ByaWF0ZSBvbmVcbiAqIGdpdmVuIHRoZSBjdXJyZW50IGxhbmd1YWdlIChpZS4gZ2V0Q3VycmVudExhbmd1YWdlKCkpXG4gKiBFbmdsaXNoIGlzIGFzc3VtZWQgdG8gYmUgYSByZWFzb25hYmxlIGRlZmF1bHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmdbXX0gbGFuZ3MgTGlzdCBvZiBsYW5ndWFnZSBjb2RlcyB0byBwaWNrIGZyb21cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBtb3N0IGFwcHJvcHJpYXRlIGxhbmd1YWdlIGNvZGUgZnJvbSBsYW5nc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGlja0Jlc3RMYW5ndWFnZShsYW5nczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIGNvbnN0IGN1cnJlbnRMYW5nID0gZ2V0Q3VycmVudExhbmd1YWdlKCk7XG4gICAgY29uc3Qgbm9ybWFsaXNlZExhbmdzID0gbGFuZ3MubWFwKG5vcm1hbGl6ZUxhbmd1YWdlS2V5KTtcblxuICAgIHtcbiAgICAgICAgLy8gQmVzdCBpcyBhbiBleGFjdCBtYXRjaFxuICAgICAgICBjb25zdCBjdXJyZW50TGFuZ0luZGV4ID0gbm9ybWFsaXNlZExhbmdzLmluZGV4T2YoY3VycmVudExhbmcpO1xuICAgICAgICBpZiAoY3VycmVudExhbmdJbmRleCA+IC0xKSByZXR1cm4gbGFuZ3NbY3VycmVudExhbmdJbmRleF07XG4gICAgfVxuXG4gICAge1xuICAgICAgICAvLyBGYWlsaW5nIHRoYXQsIGEgZGlmZmVyZW50IGRpYWxlY3Qgb2YgdGhlIHNhbWUgbGFuZ3VhZ2VcbiAgICAgICAgY29uc3QgY2xvc2VMYW5nSW5kZXggPSBub3JtYWxpc2VkTGFuZ3MuZmluZEluZGV4KChsKSA9PiBsLnNsaWNlKDAsIDIpID09PSBjdXJyZW50TGFuZy5zbGljZSgwLCAyKSk7XG4gICAgICAgIGlmIChjbG9zZUxhbmdJbmRleCA+IC0xKSByZXR1cm4gbGFuZ3NbY2xvc2VMYW5nSW5kZXhdO1xuICAgIH1cblxuICAgIHtcbiAgICAgICAgLy8gTmVpdGhlciBvZiB0aG9zZT8gVHJ5IGFuIGVuZ2xpc2ggdmFyaWFudC5cbiAgICAgICAgY29uc3QgZW5JbmRleCA9IG5vcm1hbGlzZWRMYW5ncy5maW5kSW5kZXgoKGwpID0+IGwuc3RhcnRzV2l0aCgnZW4nKSk7XG4gICAgICAgIGlmIChlbkluZGV4ID4gLTEpIHJldHVybiBsYW5nc1tlbkluZGV4XTtcbiAgICB9XG5cbiAgICAvLyBpZiBub3RoaW5nIGVsc2UsIHVzZSB0aGUgZmlyc3RcbiAgICByZXR1cm4gbGFuZ3NbMF07XG59XG5cbmZ1bmN0aW9uIGdldExhbmdzSnNvbigpOiBQcm9taXNlPG9iamVjdD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCB1cmw7XG4gICAgICAgIGlmICh0eXBlb2Yod2VicGFja0xhbmdKc29uVXJsKSA9PT0gJ3N0cmluZycpIHsgLy8gaW4gSmVzdCB0aGlzICd1cmwnIGlzbid0IGEgVVJMLCBzbyBqdXN0IGZhbGwgdGhyb3VnaFxuICAgICAgICAgICAgdXJsID0gd2VicGFja0xhbmdKc29uVXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsID0gaTE4bkZvbGRlciArICdsYW5ndWFnZXMuanNvbic7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdChcbiAgICAgICAgICAgIHsgbWV0aG9kOiBcIkdFVFwiLCB1cmwgfSxcbiAgICAgICAgICAgIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgJHt1cmx9LCBnb3QgJHtyZXNwb25zZS5zdGF0dXN9YCkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShib2R5KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH0pO1xufVxuXG5pbnRlcmZhY2UgSUNvdW50ZXJwYXJ0VHJhbnNsYXRpb24ge1xuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IHtcbiAgICAgICAgW3BsdXJhbGlzYXRpb246IHN0cmluZ106IHN0cmluZztcbiAgICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRMYW5ndWFnZVJldHJ5KGxhbmdQYXRoOiBzdHJpbmcsIG51bSA9IDMpOiBQcm9taXNlPElDb3VudGVycGFydFRyYW5zbGF0aW9uPiB7XG4gICAgcmV0dXJuIHJldHJ5KCgpID0+IGdldExhbmd1YWdlKGxhbmdQYXRoKSwgbnVtLCBlID0+IHtcbiAgICAgICAgbG9nZ2VyLmxvZyhcIkZhaWxlZCB0byBsb2FkIGkxOG5cIiwgbGFuZ1BhdGgpO1xuICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBhbHdheXMgcmV0cnlcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UobGFuZ1BhdGg6IHN0cmluZyk6IFByb21pc2U8SUNvdW50ZXJwYXJ0VHJhbnNsYXRpb24+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZXF1ZXN0KFxuICAgICAgICAgICAgeyBtZXRob2Q6IFwiR0VUXCIsIHVybDogbGFuZ1BhdGggfSxcbiAgICAgICAgICAgIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgJHtsYW5nUGF0aH0sIGdvdCAke3Jlc3BvbnNlLnN0YXR1c31gKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKGJvZHkpKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUN1c3RvbVRyYW5zbGF0aW9ucyB7XG4gICAgLy8gRm9ybWF0IGlzIGEgbWFwIG9mIGVuZ2xpc2ggc3RyaW5nIHRvIGxhbmd1YWdlIHRvIG92ZXJyaWRlXG4gICAgW3N0cjogc3RyaW5nXToge1xuICAgICAgICBbbGFuZzogc3RyaW5nXTogc3RyaW5nO1xuICAgIH07XG59XG5cbmxldCBjYWNoZWRDdXN0b21UcmFuc2xhdGlvbnM6IE9wdGlvbmFsPElDdXN0b21UcmFuc2xhdGlvbnM+ID0gbnVsbDtcbmxldCBjYWNoZWRDdXN0b21UcmFuc2xhdGlvbnNFeHBpcmUgPSAwOyAvLyB6ZXJvIHRvIHRyaWdnZXIgZXhwaXJhdGlvbiByaWdodCBhd2F5XG5cbi8vIFRoaXMgYXdrd2FyZCBjbGFzcyBleGlzdHMgc28gdGhlIHRlc3QgcnVubmVyIGNhbiBnZXQgYXQgdGhlIGZ1bmN0aW9uLiBJdCBpc1xuLy8gbm90IGludGVuZGVkIGZvciBwcmFjdGljYWwgb3IgcmVhbGlzdGljIHVzYWdlLlxuZXhwb3J0IGNsYXNzIEN1c3RvbVRyYW5zbGF0aW9uT3B0aW9ucyB7XG4gICAgcHVibGljIHN0YXRpYyBsb29rdXBGbjogKHVybDogc3RyaW5nKSA9PiBJQ3VzdG9tVHJhbnNsYXRpb25zO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gc3RhdGljIGFjY2VzcyBmb3IgdGVzdHMgb25seVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZG9SZWdpc3RlclRyYW5zbGF0aW9ucyhjdXN0b21UcmFuc2xhdGlvbnM6IElDdXN0b21UcmFuc2xhdGlvbnMpIHtcbiAgICAvLyBXZSBjb252ZXJ0IHRoZSBvcGVyYXRvci1mcmllbmRseSB2ZXJzaW9uIGludG8gc29tZXRoaW5nIGNvdW50ZXJwYXJ0IGNhblxuICAgIC8vIGNvbnN1bWUuXG4gICAgY29uc3QgbGFuZ3M6IHtcbiAgICAgICAgLy8gc2FtZSBzdHJ1Y3R1cmUsIGp1c3QgZmxpcHBlZCBrZXkgb3JkZXJcbiAgICAgICAgW2xhbmc6IHN0cmluZ106IHtcbiAgICAgICAgICAgIFtzdHI6IHN0cmluZ106IHN0cmluZztcbiAgICAgICAgfTtcbiAgICB9ID0ge307XG4gICAgZm9yIChjb25zdCBbc3RyLCB0cmFuc2xhdGlvbnNdIG9mIE9iamVjdC5lbnRyaWVzKGN1c3RvbVRyYW5zbGF0aW9ucykpIHtcbiAgICAgICAgZm9yIChjb25zdCBbbGFuZywgbmV3U3RyXSBvZiBPYmplY3QuZW50cmllcyh0cmFuc2xhdGlvbnMpKSB7XG4gICAgICAgICAgICBpZiAoIWxhbmdzW2xhbmddKSBsYW5nc1tsYW5nXSA9IHt9O1xuICAgICAgICAgICAgbGFuZ3NbbGFuZ11bc3RyXSA9IG5ld1N0cjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZpbmFsbHksIHRlbGwgY291bnRlcnBhcnQgYWJvdXQgb3VyIHRyYW5zbGF0aW9uc1xuICAgIGZvciAoY29uc3QgW2xhbmcsIHRyYW5zbGF0aW9uc10gb2YgT2JqZWN0LmVudHJpZXMobGFuZ3MpKSB7XG4gICAgICAgIGNvdW50ZXJwYXJ0LnJlZ2lzdGVyVHJhbnNsYXRpb25zKGxhbmcsIHRyYW5zbGF0aW9ucyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEFueSBjdXN0b20gbW9kdWxlcyB3aXRoIHRyYW5zbGF0aW9ucyB0byBsb2FkIGFyZSBwYXJzZWQgZmlyc3QsIGZvbGxvd2VkIGJ5IGFuXG4gKiBvcHRpb25hbGx5IGRlZmluZWQgdHJhbnNsYXRpb25zIGZpbGUgaW4gdGhlIGNvbmZpZy4gSWYgbm8gY3VzdG9taXphdGlvbiBpcyBtYWRlLFxuICogb3IgdGhlIGZpbGUgY2FuJ3QgYmUgcGFyc2VkLCBubyBhY3Rpb24gd2lsbCBiZSB0YWtlbi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSBjYWxsZWQgKmFmdGVyKiByZWdpc3RlcmluZyBvdGhlciB0cmFuc2xhdGlvbnMgZGF0YSB0b1xuICogZW5zdXJlIGl0IG92ZXJyaWRlcyBzdHJpbmdzIHByb3Blcmx5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXJDdXN0b21UcmFuc2xhdGlvbnMoKSB7XG4gICAgY29uc3QgbW9kdWxlVHJhbnNsYXRpb25zID0gTW9kdWxlUnVubmVyLmluc3RhbmNlLmFsbFRyYW5zbGF0aW9ucztcbiAgICBkb1JlZ2lzdGVyVHJhbnNsYXRpb25zKG1vZHVsZVRyYW5zbGF0aW9ucyk7XG5cbiAgICBjb25zdCBsb29rdXBVcmwgPSBTZGtDb25maWcuZ2V0KCkuY3VzdG9tX3RyYW5zbGF0aW9uc191cmw7XG4gICAgaWYgKCFsb29rdXBVcmwpIHJldHVybjsgLy8gZWFzeSAtIG5vdGhpbmcgdG8gZG9cblxuICAgIHRyeSB7XG4gICAgICAgIGxldCBqc29uOiBJQ3VzdG9tVHJhbnNsYXRpb25zO1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSA+PSBjYWNoZWRDdXN0b21UcmFuc2xhdGlvbnNFeHBpcmUpIHtcbiAgICAgICAgICAgIGpzb24gPSBDdXN0b21UcmFuc2xhdGlvbk9wdGlvbnMubG9va3VwRm5cbiAgICAgICAgICAgICAgICA/IEN1c3RvbVRyYW5zbGF0aW9uT3B0aW9ucy5sb29rdXBGbihsb29rdXBVcmwpXG4gICAgICAgICAgICAgICAgOiAoYXdhaXQgKGF3YWl0IGZldGNoKGxvb2t1cFVybCkpLmpzb24oKSBhcyBJQ3VzdG9tVHJhbnNsYXRpb25zKTtcbiAgICAgICAgICAgIGNhY2hlZEN1c3RvbVRyYW5zbGF0aW9ucyA9IGpzb247XG5cbiAgICAgICAgICAgIC8vIFNldCBleHBpcmF0aW9uIHRvIHRoZSBmdXR1cmUsIGJ1dCBub3QgdG9vIGZhci4gSnVzdCB0cnlpbmcgdG8gYXZvaWRcbiAgICAgICAgICAgIC8vIHJlcGVhdGVkLCBzdWNjZXNzaXZlLCBjYWxscyB0byB0aGUgc2VydmVyIHJhdGhlciB0aGFuIGFueXRoaW5nIGxvbmctdGVybS5cbiAgICAgICAgICAgIGNhY2hlZEN1c3RvbVRyYW5zbGF0aW9uc0V4cGlyZSA9IERhdGUubm93KCkgKyAoNSAqIDYwICogMTAwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqc29uID0gY2FjaGVkQ3VzdG9tVHJhbnNsYXRpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIChwb3RlbnRpYWxseSBjYWNoZWQpIGpzb24gaXMgaW52YWxpZCwgZG9uJ3QgdXNlIGl0LlxuICAgICAgICBpZiAoIWpzb24pIHJldHVybjtcblxuICAgICAgICAvLyBGaW5hbGx5LCByZWdpc3RlciBpdC5cbiAgICAgICAgZG9SZWdpc3RlclRyYW5zbGF0aW9ucyhqc29uKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFdlIGNvbnN1bWUgYWxsIGV4Y2VwdGlvbnMgYmVjYXVzZSBpdCdzIGNvbnNpZGVyZWQgbm9uLWZhdGFsIGZvciBjdXN0b21cbiAgICAgICAgLy8gdHJhbnNsYXRpb25zIHRvIGJyZWFrLiBNb3N0IGZhaWx1cmVzIHdpbGwgYmUgZHVyaW5nIGluaXRpYWwgZGV2ZWxvcG1lbnRcbiAgICAgICAgLy8gb2YgdGhlIGpzb24gZmlsZSBhbmQgbm90IChob3BlZnVsbHkpIGF0IHJ1bnRpbWUuXG4gICAgICAgIGxvZ2dlci53YXJuKFwiSWdub3JpbmcgZXJyb3Igd2hpbGUgcmVnaXN0ZXJpbmcgY3VzdG9tIHRyYW5zbGF0aW9uczogXCIsIGUpO1xuXG4gICAgICAgIC8vIExpa2UgYWJvdmU6IHRyaWdnZXIgYSBjYWNoZSBvZiB0aGUganNvbiB0byBhdm9pZCBzdWNjZXNzaXZlIGNhbGxzLlxuICAgICAgICBjYWNoZWRDdXN0b21UcmFuc2xhdGlvbnNFeHBpcmUgPSBEYXRlLm5vdygpICsgKDUgKiA2MCAqIDEwMDApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7Ozs7OztBQUVBLE1BQU1BLFVBQVUsR0FBRyxPQUFuQixDLENBRUE7QUFDQTs7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxLQUF6QixDLENBRUE7O0FBQ0FDLG9CQUFBLENBQVlDLFlBQVosQ0FBeUIsR0FBekIsRSxDQUVBOzs7QUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBeEI7O0FB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