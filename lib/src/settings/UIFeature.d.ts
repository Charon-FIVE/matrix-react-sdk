export declare enum UIFeature {
    AdvancedEncryption = "UIFeature.advancedEncryption",
    URLPreviews = "UIFeature.urlPreviews",
    Widgets = "UIFeature.widgets",
    Voip = "UIFeature.voip",
    Feedback = "UIFeature.feedback",
    Registration = "UIFeature.registration",
    PasswordReset = "UIFeature.passwordReset",
    Deactivate = "UIFeature.deactivate",
    ShareQRCode = "UIFeature.shareQrCode",
    ShareSocial = "UIFeature.shareSocial",
    IdentityServer = "UIFeature.identityServer",
    ThirdPartyID = "UIFeature.thirdPartyId",
    AdvancedSettings = "UIFeature.advancedSettings",
    RoomHistorySettings = "UIFeature.roomHistorySettings",
    TimelineEnableRelativeDates = "UIFeature.timelineEnableRelativeDates"
}
export declare enum UIComponent {
    /**
     * Components that lead to a user being invited.
     */
    InviteUsers = "UIComponent.sendInvites",
    /**
     * Components that lead to a room being created that aren't already
     * guarded by some other condition (ie: "only if you can edit this
     * space" is *not* guarded by this component, but "start DM" is).
     */
    CreateRooms = "UIComponent.roomCreation",
    /**
     * Components that lead to a Space being created that aren't already
     * guarded by some other condition (ie: "only if you can add subspaces"
     * is *not* guarded by this component, but "create new space" is).
     */
    CreateSpaces = "UIComponent.spaceCreation",
    /**
     * Components that lead to the public room directory.
     */
    ExploreRooms = "UIComponent.exploreRooms",
    /**
     * Components that lead to the user being able to easily add widgets
     * and integrations to the room, such as from the room information card.
     */
    AddIntegrations = "UIComponent.addIntegrations"
}
