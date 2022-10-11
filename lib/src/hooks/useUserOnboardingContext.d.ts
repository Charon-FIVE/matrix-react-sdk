export interface UserOnboardingContext {
    hasAvatar: boolean;
    hasDevices: boolean;
    hasDmRooms: boolean;
    hasNotificationsEnabled: boolean;
}
export declare function useUserOnboardingContext(): UserOnboardingContext | null;
