import React from 'react';
interface IProps {
    closeSettingsFn(success: boolean): void;
}
interface IState {
    disablingReadReceiptsSupported: boolean;
    autocompleteDelay: string;
    readMarkerInViewThresholdMs: string;
    readMarkerOutOfViewThresholdMs: string;
}
export default class PreferencesUserSettingsTab extends React.Component<IProps, IState> {
    private static ROOM_LIST_SETTINGS;
    private static SPACES_SETTINGS;
    private static KEYBINDINGS_SETTINGS;
    private static PRESENCE_SETTINGS;
    private static COMPOSER_SETTINGS;
    private static TIME_SETTINGS;
    private static CODE_BLOCKS_SETTINGS;
    private static IMAGES_AND_VIDEOS_SETTINGS;
    private static TIMELINE_SETTINGS;
    private static GENERAL_SETTINGS;
    constructor(props: any);
    componentDidMount(): Promise<void>;
    private onAutocompleteDelayChange;
    private onReadMarkerInViewThresholdMs;
    private onReadMarkerOutOfViewThresholdMs;
    private renderGroup;
    private onKeyboardShortcutsClicked;
    render(): JSX.Element;
}
export {};
