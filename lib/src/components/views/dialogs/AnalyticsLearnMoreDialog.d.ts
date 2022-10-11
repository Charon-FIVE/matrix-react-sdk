import React from "react";
export declare enum ButtonClicked {
    Primary = 0,
    Cancel = 1
}
interface IProps {
    onFinished?(buttonClicked?: ButtonClicked): void;
    analyticsOwner: string;
    privacyPolicyUrl?: string;
    primaryButton?: string;
    cancelButton?: string;
    hasCancel?: boolean;
}
export declare const AnalyticsLearnMoreDialog: React.FC<IProps>;
export declare const showDialog: (props: Omit<IProps, "cookiePolicyUrl" | "analyticsOwner">) => void;
export {};
