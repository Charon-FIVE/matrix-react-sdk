import { ReactNode } from "react";
import { MatrixError } from "matrix-js-sdk/src/http-api";
import { Tags, TranslatedString } from '../languageHandler';
/**
 * Produce a translated error message for a
 * M_RESOURCE_LIMIT_EXCEEDED error
 *
 * @param {string} limitType The limit_type from the error
 * @param {string} adminContact The admin_contact from the error
 * @param {Object} strings Translatable string for different
 *     limit_type. Must include at least the empty string key
 *     which is the default. Strings may include an 'a' tag
 *     for the admin contact link.
 * @param {Object} extraTranslations Extra translation substitution functions
 *     for any tags in the strings apart from 'a'
 * @returns {*} Translated string or react component
 */
export declare function messageForResourceLimitError(limitType: string, adminContact: string, strings: Record<string, string>, extraTranslations?: Tags): TranslatedString;
export declare function messageForSyncError(err: MatrixError): ReactNode;
