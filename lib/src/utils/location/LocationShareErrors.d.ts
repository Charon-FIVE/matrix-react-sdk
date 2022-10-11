export declare enum LocationShareError {
    MapStyleUrlNotConfigured = "MapStyleUrlNotConfigured",
    MapStyleUrlNotReachable = "MapStyleUrlNotReachable",
    Default = "Default"
}
export declare const getLocationShareErrorMessage: (errorType?: LocationShareError) => string;
