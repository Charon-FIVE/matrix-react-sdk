import React, { ReactNode, KeyboardEvent, Ref } from 'react';
import { ButtonEvent } from "../elements/AccessibleButton";
interface IProps {
    header?: ReactNode;
    footer?: ReactNode;
    className?: string;
    withoutScrollContainer?: boolean;
    closeLabel?: string;
    onClose?(ev: ButtonEvent): void;
    onBack?(ev: ButtonEvent): void;
    onKeyDown?(ev: KeyboardEvent): void;
    cardState?: any;
    ref?: Ref<HTMLDivElement>;
}
interface IGroupProps {
    className?: string;
    title: string;
}
export declare const Group: React.FC<IGroupProps>;
declare const BaseCard: React.FC<IProps>;
export default BaseCard;
