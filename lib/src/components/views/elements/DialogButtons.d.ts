import React from "react";
interface IProps {
    primaryButton: React.ReactNode;
    cancelButton?: React.ReactNode;
    primaryIsSubmit?: boolean;
    onPrimaryButtonClick?: (ev: React.MouseEvent) => (void | Promise<void>);
    hasCancel?: boolean;
    cancelButtonClass?: string;
    onCancel?: (...args: any[]) => void;
    focus?: boolean;
    disabled?: boolean;
    primaryDisabled?: boolean;
    additive?: React.ReactNode;
    primaryButtonClass?: string;
}
/**
 * Basic container for buttons in modal dialogs.
 */
export default class DialogButtons extends React.Component<IProps> {
    static defaultProps: Partial<IProps>;
    private onCancelClick;
    render(): JSX.Element;
}
export {};
