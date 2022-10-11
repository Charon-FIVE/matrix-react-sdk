/// <reference types="node" />
import { ListenerMap, TypedEventEmitter } from "matrix-js-sdk/src/models/typed-event-emitter";
import type { EventEmitter } from "events";
declare type Handler = (...args: any[]) => void;
export declare function useTypedEventEmitter<Events extends string, Arguments extends ListenerMap<Events>>(emitter: TypedEventEmitter<Events, Arguments>, eventName: Events, handler: Handler): void;
/**
 * Hook to wrap an EventEmitter on and off in hook lifecycle
 */
export declare function useEventEmitter(emitter: EventEmitter | undefined, eventName: string | symbol, handler: Handler): void;
declare type Mapper<T> = (...args: any[]) => T;
export declare function useTypedEventEmitterState<T, Events extends string, Arguments extends ListenerMap<Events>>(emitter: TypedEventEmitter<Events, Arguments>, eventName: Events, fn: Mapper<T>): T;
export declare function useEventEmitterState<T>(emitter: EventEmitter | undefined, eventName: string | symbol, fn: Mapper<T>): T;
export {};
