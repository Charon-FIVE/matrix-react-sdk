import React from "react";
export declare const preventDefaultWrapper: <T extends React.BaseSyntheticEvent<object, any, any> = React.BaseSyntheticEvent<object, any, any>>(callback: () => void) => (e?: T) => void;
