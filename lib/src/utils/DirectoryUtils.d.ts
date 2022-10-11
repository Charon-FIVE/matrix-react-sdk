import { IInstance, IProtocol } from "matrix-js-sdk/src/client";
export declare const ALL_ROOMS = "ALL_ROOMS";
export declare type Protocols = Record<string, IProtocol>;
export declare function instanceForInstanceId(protocols: Protocols, instanceId: string | null | undefined): IInstance | null;
export declare function protocolNameForInstanceId(protocols: Protocols, instanceId: string | null | undefined): string | null;
