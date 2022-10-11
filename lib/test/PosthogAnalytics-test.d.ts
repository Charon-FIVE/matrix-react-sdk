import { IPosthogEvent } from '../src/PosthogAnalytics';
export interface ITestEvent extends IPosthogEvent {
    eventName: "JestTestEvents";
    foo: string;
}
