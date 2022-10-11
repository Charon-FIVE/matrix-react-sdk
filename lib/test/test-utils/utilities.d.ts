/// <reference types="react" />
import { ReactWrapper } from "enzyme";
import EventEmitter from "events";
import { ActionPayload } from "../../src/dispatcher/payloads";
import { DispatcherAction } from "../../src/dispatcher/actions";
export declare const emitPromise: (e: EventEmitter, k: string | symbol) => Promise<unknown>;
export declare function untilDispatch(waitForAction: DispatcherAction): Promise<ActionPayload>;
export declare const findByAttr: (attr: string) => (component: ReactWrapper, value: string) => ReactWrapper<import("enzyme").HTMLAttributes, any, import("react").Component<{}, {}, any>>;
export declare const findByTestId: (component: ReactWrapper, value: string) => ReactWrapper<import("enzyme").HTMLAttributes, any, import("react").Component<{}, {}, any>>;
export declare const findById: (component: ReactWrapper, value: string) => ReactWrapper<import("enzyme").HTMLAttributes, any, import("react").Component<{}, {}, any>>;
export declare const findByAriaLabel: (component: ReactWrapper, value: string) => ReactWrapper<import("enzyme").HTMLAttributes, any, import("react").Component<{}, {}, any>>;
export declare const findByTagAndTestId: (component: ReactWrapper, value: string, tag: string) => ReactWrapper<import("enzyme").HTMLAttributes, any, import("react").Component<{}, {}, any>>;
export declare const flushPromises: () => Promise<unknown>;
export declare const flushPromisesWithFakeTimers: () => Promise<void>;
/**
 * Call fn before calling componentDidUpdate on a react component instance, inst.
 * @param {React.Component} inst an instance of a React component.
 * @param {number} updates Number of updates to wait for. (Defaults to 1.)
 * @returns {Promise} promise that resolves when componentDidUpdate is called on
 *                    given component instance.
 */
export declare function waitForUpdate(inst: React.Component, updates?: number): Promise<void>;
/**
 * Advance jests fake timers and Date.now mock by ms
 * Useful for testing code using timeouts or intervals
 * that also checks timestamps
 */
export declare const advanceDateAndTime: (ms: number) => void;
