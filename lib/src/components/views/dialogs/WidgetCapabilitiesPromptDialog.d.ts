import React from 'react';
import { Capability, Widget, WidgetKind } from "matrix-widget-api";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    requestedCapabilities: Set<Capability>;
    widget: Widget;
    widgetKind: WidgetKind;
}
interface IBooleanStates {
    [capability: Capability]: boolean;
}
interface IState {
    booleanStates: IBooleanStates;
    rememberSelection: boolean;
}
export default class WidgetCapabilitiesPromptDialog extends React.PureComponent<IProps, IState> {
    private eventPermissionsMap;
    constructor(props: IProps);
    private onToggle;
    private onRememberSelectionChange;
    private onSubmit;
    private onReject;
    private closeAndTryRemember;
    render(): JSX.Element;
}
export {};
