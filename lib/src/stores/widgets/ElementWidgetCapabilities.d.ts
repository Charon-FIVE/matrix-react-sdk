export declare enum ElementWidgetCapabilities {
    /**
     * @deprecated Use MSC2931 instead.
     */
    CanChangeViewedRoom = "io.element.view_room",
    /**
     * Ask Element to not give the option to move the widget into a separate tab.
     * This replaces RequiresClient in MatrixCapabilities.
     */
    RequiresClient = "io.element.requires_client"
}
