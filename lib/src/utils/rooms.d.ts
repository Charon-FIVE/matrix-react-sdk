import { IInstance, IProtocol, IPublicRoomsChunkRoom, MatrixClient } from "matrix-js-sdk/src/client";
import { ViewRoom as ViewRoomEvent } from "@matrix-org/analytics-events/types/typescript/ViewRoom";
import { Protocols } from "./DirectoryUtils";
export declare function privateShouldBeEncrypted(): boolean;
interface IShowRoomOpts {
    roomAlias?: string;
    autoJoin?: boolean;
    shouldPeek?: boolean;
    roomServer?: string;
    metricsTrigger: ViewRoomEvent["trigger"];
}
export declare const showRoom: (client: MatrixClient, room: IPublicRoomsChunkRoom | null, { roomAlias, autoJoin, shouldPeek, roomServer, }: IShowRoomOpts) => void;
interface IJoinRoomByAliasOpts {
    instanceId?: string;
    roomServer?: string;
    protocols: Protocols;
    metricsTrigger: ViewRoomEvent["trigger"];
}
export declare function joinRoomByAlias(cli: MatrixClient, alias: string, { instanceId, roomServer, protocols, metricsTrigger, }: IJoinRoomByAliasOpts): void;
export declare function getFieldsForThirdPartyLocation(userInput: string, protocol: IProtocol, instance: IInstance): {
    searchFields?: string[];
} | null;
export {};
