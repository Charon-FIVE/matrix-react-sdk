import React from 'react';
import MatrixClientContext from "../../../../../contexts/MatrixClientContext";
interface IProps {
    roomId: string;
    closeSettingsFn(): void;
}
interface IState {
    currentSound: string;
    uploadedFile: File;
}
export default class NotificationsSettingsTab extends React.Component<IProps, IState> {
    private readonly roomProps;
    private soundUpload;
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    constructor(props: IProps, context: React.ContextType<typeof MatrixClientContext>);
    UNSAFE_componentWillMount(): void;
    private triggerUploader;
    private onSoundUploadChanged;
    private onClickSaveSound;
    private saveSound;
    private clearSound;
    private onRoomNotificationChange;
    private onOpenSettingsClick;
    render(): JSX.Element;
}
export {};
