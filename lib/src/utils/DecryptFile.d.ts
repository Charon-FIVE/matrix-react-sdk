import { IEncryptedFile, IMediaEventInfo } from "../customisations/models/IMediaEventContent";
/**
 * Decrypt a file attached to a matrix event.
 * @param {IEncryptedFile} file The encrypted file information taken from the matrix event.
 *   This passed to [link]{@link https://github.com/matrix-org/matrix-encrypt-attachment}
 *   as the encryption info object, so will also have the those keys in addition to
 *   the keys below.
 * @param {IMediaEventInfo} info The info parameter taken from the matrix event.
 * @returns {Promise<Blob>} Resolves to a Blob of the file.
 */
export declare function decryptFile(file: IEncryptedFile, info?: IMediaEventInfo): Promise<Blob>;
