import React from 'react';
interface IProps {
    roomId: string;
    closeSettingsFn(): void;
}
interface IRecommendedVersion {
    version: string;
    needsUpgrade: boolean;
    urgent: boolean;
}
interface IState {
    upgradeRecommendation?: IRecommendedVersion;
    oldRoomId?: string;
    oldEventId?: string;
    upgraded?: boolean;
}
export default class AdvancedRoomSettingsTab extends React.Component<IProps, IState> {
    constructor(props: any, context: any);
    private upgradeRoom;
    private onOldRoomClicked;
    render(): JSX.Element;
}
export {};
