import { MatrixClient } from "matrix-js-sdk/src/client";
import { IEventRelation } from "matrix-js-sdk/src/models/event";
export declare enum LocationShareType {
    Own = "Own",
    Pin = "Pin",
    Live = "Live"
}
export declare type LocationShareProps = {
    timeout?: number;
    uri?: string;
    timestamp?: number;
};
export declare type ShareLocationFn = (props: LocationShareProps) => Promise<void>;
export declare const shareLiveLocation: (client: MatrixClient, roomId: string, displayName: string, openMenu: () => void) => ShareLocationFn;
export declare const shareLocation: (client: MatrixClient, roomId: string, shareType: LocationShareType, relation: IEventRelation | undefined, openMenu: () => void) => ShareLocationFn;
