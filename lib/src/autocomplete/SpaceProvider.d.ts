import React from "react";
import RoomProvider from "./RoomProvider";
export default class SpaceProvider extends RoomProvider {
    protected getRooms(): import("matrix-js-sdk/src").Room[];
    getName(): string;
    renderCompletions(completions: React.ReactNode[]): React.ReactNode;
}
