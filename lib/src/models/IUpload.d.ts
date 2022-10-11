import { IEventRelation } from "matrix-js-sdk/src/matrix";
import { IAbortablePromise } from "matrix-js-sdk/src/@types/partials";
export interface IUpload {
    fileName: string;
    roomId: string;
    relation?: IEventRelation;
    total: number;
    loaded: number;
    promise: IAbortablePromise<any>;
    canceled?: boolean;
}
