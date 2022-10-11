import React from 'react';
export interface ITranslatableError extends Error {
    translatedMessage: string;
}
/**
 * Helper function to create an error which has an English message
 * with a translatedMessage property for use by the consumer.
 * @param {string} message Message to translate.
 * @param {object} variables Variable substitutions, e.g { foo: 'bar' }
 * @returns {Error} The constructed error.
 */
export declare function newTranslatableError(message: string, variables?: IVariables): ITranslatableError;
export declare function getUserLanguage(): string;
export declare function _td(s: string): string;
declare type SubstitutionValue = number | string | React.ReactNode | ((sub: string) => React.ReactNode);
export interface IVariables {
    count?: number;
    [key: string]: SubstitutionValue;
}
export declare type Tags = Record<string, SubstitutionValue>;
export declare type TranslatedString = string | React.ReactNode;
export declare function _t(text: string, variables?: IVariables): string;
export declare function _t(text: string, variables: IVariables, tags: Tags): React.ReactNode;
export declare function _tDom(text: string, variables?: IVariables): TranslatedString;
export declare function _tDom(text: string, variables: IVariables, tags: Tags): React.ReactNode;
/**
 * Sanitizes unsafe text for the sanitizer, ensuring references to variables will not be considered
 * replaceable by the translation functions.
 * @param {string} text The text to sanitize.
 * @returns {string} The sanitized text.
 */
export declare function sanitizeForTranslation(text: string): string;
export declare function substitute(text: string, variables?: IVariables): string;
export declare function substitute(text: string, variables: IVariables, tags: Tags): string;
export declare function replaceByRegexes(text: string, mapping: IVariables): string;
export declare function replaceByRegexes(text: string, mapping: Tags): React.ReactNode;
export declare function setMissingEntryGenerator(f: (value: string) => void): void;
export declare function setLanguage(preferredLangs: string | string[]): Promise<void>;
export declare function getAllLanguagesFromJson(): Promise<any[]>;
export declare function getLanguagesFromBrowser(): readonly string[];
export declare function getLanguageFromBrowser(): string;
/**
 * Turns a language string, normalises it,
 * (see normalizeLanguageKey) into an array of language strings
 * with fallback to generic languages
 * (eg. 'pt-BR' => ['pt-br', 'pt'])
 *
 * @param {string} language The input language string
 * @return {string[]} List of normalised languages
 */
export declare function getNormalizedLanguageKeys(language: string): string[];
/**
 * Returns a language string with underscores replaced with
 * hyphens, and lowercased.
 *
 * @param {string} language The language string to be normalized
 * @returns {string} The normalized language string
 */
export declare function normalizeLanguageKey(language: string): string;
export declare function getCurrentLanguage(): string;
/**
 * Given a list of language codes, pick the most appropriate one
 * given the current language (ie. getCurrentLanguage())
 * English is assumed to be a reasonable default.
 *
 * @param {string[]} langs List of language codes to pick from
 * @returns {string} The most appropriate language code from langs
 */
export declare function pickBestLanguage(langs: string[]): string;
export interface ICustomTranslations {
    [str: string]: {
        [lang: string]: string;
    };
}
export declare class CustomTranslationOptions {
    static lookupFn: (url: string) => ICustomTranslations;
    private constructor();
}
/**
 * Any custom modules with translations to load are parsed first, followed by an
 * optionally defined translations file in the config. If no customization is made,
 * or the file can't be parsed, no action will be taken.
 *
 * This function should be called *after* registering other translations data to
 * ensure it overrides strings properly.
 */
export declare function registerCustomTranslations(): Promise<void>;
export {};
