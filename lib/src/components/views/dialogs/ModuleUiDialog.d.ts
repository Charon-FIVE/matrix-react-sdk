import React from "react";
import { DialogContent, DialogProps } from "@matrix-org/react-sdk-module-api/lib/components/DialogContent";
import ScrollableBaseModal, { IScrollableBaseState } from "./ScrollableBaseModal";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    contentFactory: (props: DialogProps, ref: React.Ref<DialogContent>) => React.ReactNode;
    contentProps: DialogProps;
    title: string;
}
interface IState extends IScrollableBaseState {
}
export declare class ModuleUiDialog extends ScrollableBaseModal<IProps, IState> {
    private contentRef;
    constructor(props: IProps);
    protected submit(): Promise<void>;
    protected cancel(): void;
    protected renderContent(): React.ReactNode;
}
export {};
