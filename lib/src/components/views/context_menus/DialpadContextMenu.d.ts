import * as React from "react";
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import { ButtonEvent } from "../elements/AccessibleButton";
import { IProps as IContextMenuProps } from '../../structures/ContextMenu';
interface IProps extends IContextMenuProps {
    call: MatrixCall;
}
interface IState {
    value: string;
}
export default class DialpadContextMenu extends React.Component<IProps, IState> {
    private numberEntryFieldRef;
    constructor(props: any);
    onDigitPress: (digit: string, ev: ButtonEvent) => void;
    onCancelClick: () => void;
    onKeyDown: (ev: any) => void;
    onChange: (ev: any) => void;
    render(): JSX.Element;
}
export {};
