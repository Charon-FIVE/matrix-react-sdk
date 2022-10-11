/// <reference types="react" />
import { Thread } from "matrix-js-sdk/src/models/thread";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
interface IProps {
    mxEvent: MatrixEvent;
    thread: Thread;
}
declare const ThreadSummary: ({ mxEvent, thread }: IProps) => JSX.Element;
interface IPreviewProps {
    thread: Thread;
    showDisplayname?: boolean;
}
export declare const ThreadMessagePreview: ({ thread, showDisplayname }: IPreviewProps) => JSX.Element;
export default ThreadSummary;
