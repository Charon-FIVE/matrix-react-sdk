import { ChangeEvent } from 'react';
import { MetaSpace } from "../../../../../stores/spaces";
declare type InteractionName = "WebSettingsSidebarTabSpacesCheckbox" | "WebQuickSettingsPinToSidebarCheckbox";
export declare const onMetaSpaceChangeFactory: (metaSpace: MetaSpace, interactionName: InteractionName) => (e: ChangeEvent<HTMLInputElement>) => void;
declare const SidebarUserSettingsTab: () => JSX.Element;
export default SidebarUserSettingsTab;
