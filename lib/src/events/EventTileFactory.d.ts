import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Optional } from "matrix-events-sdk";
import { MatrixClient } from "matrix-js-sdk/src/client";
import EditorStateTransfer from "../utils/EditorStateTransfer";
import { RoomPermalinkCreator } from "../utils/permalinks/Permalinks";
import LegacyCallEventGrouper from "../components/structures/LegacyCallEventGrouper";
import { GetRelationsForEvent } from "../components/views/rooms/EventTile";
import { TimelineRenderingType } from "../contexts/RoomContext";
export interface EventTileTypeProps {
    ref?: React.RefObject<any>;
    mxEvent: MatrixEvent;
    highlights?: string[];
    highlightLink?: string;
    showUrlPreview?: boolean;
    onHeightChanged: () => void;
    forExport?: boolean;
    getRelationsForEvent?: GetRelationsForEvent;
    editState?: EditorStateTransfer;
    replacingEventId?: string;
    permalinkCreator: RoomPermalinkCreator;
    callEventGrouper?: LegacyCallEventGrouper;
    isSeeingThroughMessageHiddenForModeration?: boolean;
    timestamp?: JSX.Element;
    maxImageHeight?: number;
    overrideBodyTypes?: Record<string, typeof React.Component>;
    overrideEventTypes?: Record<string, typeof React.Component>;
}
declare type FactoryProps = Omit<EventTileTypeProps, "ref">;
declare type Factory<X = FactoryProps> = (ref: Optional<React.RefObject<any>>, props: X) => JSX.Element;
export declare const JitsiEventFactory: Factory;
export declare const JSONEventFactory: Factory;
/**
 * Find an event tile factory for the given conditions.
 * @param mxEvent The event.
 * @param cli The matrix client to reference when needed.
 * @param showHiddenEvents Whether hidden events should be shown.
 * @param asHiddenEv When true, treat the event as always hidden.
 * @returns The factory, or falsy if not possible.
 */
export declare function pickFactory(mxEvent: MatrixEvent, cli: MatrixClient, showHiddenEvents: boolean, asHiddenEv?: boolean): Optional<Factory>;
/**
 * Render an event as a tile
 * @param renderType The render type. Used to inform properties given to the eventual component.
 * @param props The properties to provide to the eventual component.
 * @param showHiddenEvents Whether hidden events should be shown.
 * @param cli Optional client instance to use, otherwise the default MatrixClientPeg will be used.
 * @returns The tile as JSX, or falsy if unable to render.
 */
export declare function renderTile(renderType: TimelineRenderingType, props: EventTileTypeProps, showHiddenEvents: boolean, cli?: MatrixClient): Optional<JSX.Element>;
/**
 * A version of renderTile() specifically for replies.
 * @param props The properties to specify on the eventual object.
 * @param showHiddenEvents Whether hidden events should be shown.
 * @param cli Optional client instance to use, otherwise the default MatrixClientPeg will be used.
 * @returns The tile as JSX, or falsy if unable to render.
 */
export declare function renderReplyTile(props: EventTileTypeProps, showHiddenEvents: boolean, cli?: MatrixClient): Optional<JSX.Element>;
export declare function isMessageEvent(ev: MatrixEvent): boolean;
export declare function haveRendererForEvent(mxEvent: MatrixEvent, showHiddenEvents: boolean): boolean;
export {};
