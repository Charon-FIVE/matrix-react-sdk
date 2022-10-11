import { Room } from "matrix-js-sdk/src/models/room";
import { TopicState } from "matrix-js-sdk/src/content-helpers";
import { Optional } from "matrix-events-sdk";
export declare const getTopic: (room: Room) => Optional<TopicState>;
export declare function useTopic(room: Room): TopicState;
