import { MatrixClient } from "matrix-js-sdk/src/client";
import { IUploadOpts } from "matrix-js-sdk/src/@types/requests";
import { IAbortablePromise, IImageInfo } from "matrix-js-sdk/src/@types/partials";
import { IEventRelation, ISendEventResponse } from "matrix-js-sdk/src/matrix";
import { IEncryptedFile } from "./customisations/models/IMediaEventContent";
import { IUpload } from "./models/IUpload";
import { TimelineRenderingType } from "./contexts/RoomContext";
export declare class UploadCanceledError extends Error {
}
/**
 * Upload the file to the content repository.
 * If the room is encrypted then encrypt the file before uploading.
 *
 * @param {MatrixClient} matrixClient The matrix client to upload the file with.
 * @param {String} roomId The ID of the room being uploaded to.
 * @param {File} file The file to upload.
 * @param {Function?} progressHandler optional callback to be called when a chunk of
 *    data is uploaded.
 * @return {Promise} A promise that resolves with an object.
 *  If the file is unencrypted then the object will have a "url" key.
 *  If the file is encrypted then the object will have a "file" key.
 */
export declare function uploadFile(matrixClient: MatrixClient, roomId: string, file: File | Blob, progressHandler?: IUploadOpts["progressHandler"]): IAbortablePromise<{
    url?: string;
    file?: IEncryptedFile;
}>;
export default class ContentMessages {
    private inprogress;
    private mediaConfig;
    sendStickerContentToRoom(url: string, roomId: string, threadId: string | null, info: IImageInfo, text: string, matrixClient: MatrixClient): Promise<ISendEventResponse>;
    getUploadLimit(): number | null;
    sendContentListToRoom(files: File[], roomId: string, relation: IEventRelation | undefined, matrixClient: MatrixClient, context?: TimelineRenderingType): Promise<void>;
    getCurrentUploads(relation?: IEventRelation): IUpload[];
    cancelUpload(promise: IAbortablePromise<any>, matrixClient: MatrixClient): void;
    private sendContentToRoom;
    private isFileSizeAcceptable;
    private ensureMediaConfigFetched;
    static sharedInstance(): ContentMessages;
}
