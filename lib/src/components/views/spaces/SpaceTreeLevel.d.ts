import React, { ComponentProps, ComponentType, InputHTMLAttributes, LegacyRef } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { SpaceKey } from "../../../stores/spaces";
import { ButtonEvent } from "../elements/AccessibleButton";
import { NotificationState } from "../../../stores/notifications/NotificationState";
import SpaceContextMenu from "../context_menus/SpaceContextMenu";
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
interface IButtonProps extends Omit<ComponentProps<typeof AccessibleTooltipButton>, "title" | "onClick"> {
    space?: Room;
    spaceKey?: SpaceKey;
    className?: string;
    selected?: boolean;
    label: string;
    contextMenuTooltip?: string;
    notificationState?: NotificationState;
    isNarrow?: boolean;
    avatarSize?: number;
    ContextMenuComponent?: ComponentType<ComponentProps<typeof SpaceContextMenu>>;
    onClick?(ev?: ButtonEvent): void;
}
export declare const SpaceButton: React.FC<IButtonProps>;
interface IItemProps extends InputHTMLAttributes<HTMLLIElement> {
    space: Room;
    activeSpaces: SpaceKey[];
    isNested?: boolean;
    isPanelCollapsed?: boolean;
    onExpand?: Function;
    parents?: Set<string>;
    innerRef?: LegacyRef<HTMLLIElement>;
    dragHandleProps?: DraggableProvidedDragHandleProps;
}
interface IItemState {
    name: string;
    collapsed: boolean;
    childSpaces: Room[];
}
export declare class SpaceItem extends React.PureComponent<IItemProps, IItemState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    private buttonRef;
    constructor(props: any);
    componentWillUnmount(): void;
    private onSpaceUpdate;
    private onRoomNameChange;
    private get childSpaces();
    private get isCollapsed();
    private toggleCollapse;
    private onKeyDown;
    render(): JSX.Element;
}
export {};
