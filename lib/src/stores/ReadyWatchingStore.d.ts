/// <reference types="node" />
import { MatrixClient } from "matrix-js-sdk/src/client";
import { Dispatcher } from "flux";
import { EventEmitter } from "events";
import { ActionPayload } from "../dispatcher/payloads";
import { IDestroyable } from "../utils/IDestroyable";
export declare abstract class ReadyWatchingStore extends EventEmitter implements IDestroyable {
    protected readonly dispatcher: Dispatcher<ActionPayload>;
    protected matrixClient: MatrixClient;
    private dispatcherRef;
    constructor(dispatcher: Dispatcher<ActionPayload>);
    start(): Promise<void>;
    get mxClient(): MatrixClient;
    useUnitTestClient(cli: MatrixClient): void;
    destroy(): void;
    protected onReady(): Promise<void>;
    protected onNotReady(): Promise<void>;
    protected onDispatcherAction(payload: ActionPayload): void;
    private onAction;
}
