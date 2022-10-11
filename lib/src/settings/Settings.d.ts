import { ReactNode } from "react";
import { SettingLevel } from "./SettingLevel";
import SettingController from "./controllers/SettingController";
export declare enum LabGroup {
    Messaging = 0,
    Profile = 1,
    Spaces = 2,
    Widgets = 3,
    Rooms = 4,
    Moderation = 5,
    Analytics = 6,
    MessagePreviews = 7,
    Themes = 8,
    Encryption = 9,
    Experimental = 10,
    Developer = 11
}
export declare const labGroupNames: Record<LabGroup, string>;
export declare type SettingValueType = boolean | number | string | number[] | string[] | Record<string, unknown>;
export interface IBaseSetting<T extends SettingValueType = SettingValueType> {
    isFeature?: false | undefined;
    displayName?: string | {
        [level: SettingLevel]: string;
    };
    description?: string | (() => ReactNode);
    supportedLevels?: SettingLevel[];
    default: T;
    controller?: SettingController;
    supportedLevelsAreOrdered?: boolean;
    invertedSettingName?: string;
    betaInfo?: {
        title: string;
        caption: () => ReactNode;
        faq?: (enabled: boolean) => ReactNode;
        image?: string;
        feedbackSubheading?: string;
        feedbackLabel?: string;
        extraSettings?: string[];
        requiresRefresh?: boolean;
    };
}
export interface IFeature extends Omit<IBaseSetting<boolean>, "isFeature"> {
    isFeature: true;
    labsGroup: LabGroup;
}
export declare type ISetting = IBaseSetting | IFeature;
export declare const SETTINGS: {
    [setting: string]: ISetting;
};
