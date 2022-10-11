import React, { KeyboardEventHandler } from "react";
import { IValidateOpts } from "./Field";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
interface IProps {
    domain?: string;
    value: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    roomId?: string;
    onKeyDown?: KeyboardEventHandler;
    onChange?(value: string): void;
}
interface IState {
    isValid: boolean;
}
export default class RoomAliasField extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    private fieldRef;
    constructor(props: any, context: any);
    private asFullAlias;
    private get domainProps();
    render(): JSX.Element;
    private onChange;
    private onValidate;
    private validationRules;
    get isValid(): boolean;
    validate(options: IValidateOpts): Promise<boolean>;
    focus(): void;
}
export {};
