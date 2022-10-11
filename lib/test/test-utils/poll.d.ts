import { MatrixEvent } from "matrix-js-sdk/src/matrix";
import { POLL_ANSWER } from "matrix-events-sdk";
export declare const makePollStartEvent: (question: string, sender: string, answers?: POLL_ANSWER[]) => MatrixEvent;
