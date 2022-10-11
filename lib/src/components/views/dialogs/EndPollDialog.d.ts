import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { Relations } from "matrix-js-sdk/src/models/relations";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    matrixClient: MatrixClient;
    event: MatrixEvent;
    onFinished: (success: boolean) => void;
    getRelationsForEvent?: (eventId: string, relationType: string, eventType: string) => Relations;
}
export default class EndPollDialog extends React.Component<IProps> {
    private onFinished;
    render(): JSX.Element;
}
export {};
