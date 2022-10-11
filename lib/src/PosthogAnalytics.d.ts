import { PostHog } from 'posthog-js';
import { MatrixClient } from "matrix-js-sdk/src/client";
import { UserProperties } from "@matrix-org/analytics-events/types/typescript/UserProperties";
import { Signup } from '@matrix-org/analytics-events/types/typescript/Signup';
export interface IPosthogEvent {
    eventName: string;
    "$set"?: void;
    "$set_once"?: void;
}
export interface IPostHogEventOptions {
    timestamp?: Date;
}
export declare enum Anonymity {
    Disabled = 0,
    Anonymous = 1,
    Pseudonymous = 2
}
export declare function getRedactedCurrentLocation(origin: string, hash: string, pathname: string): string;
export declare class PosthogAnalytics {
    private readonly posthog;
    private anonymity;
    private readonly enabled;
    private static _instance;
    private platformSuperProperties;
    private static ANALYTICS_EVENT_TYPE;
    private propertiesForNextEvent;
    private userPropertyCache;
    private authenticationType;
    static get instance(): PosthogAnalytics;
    constructor(posthog: PostHog);
    private lastScreen;
    private sanitizeProperties;
    private registerSuperProperties;
    private static getPlatformProperties;
    private capture;
    isEnabled(): boolean;
    setAnonymity(anonymity: Anonymity): void;
    private static getRandomAnalyticsId;
    identifyUser(client: MatrixClient, analyticsIdGenerator: () => string): Promise<void>;
    getAnonymity(): Anonymity;
    logout(): void;
    trackEvent<E extends IPosthogEvent>({ eventName, ...properties }: E, options?: IPostHogEventOptions): void;
    setProperty<K extends keyof UserProperties>(key: K, value: UserProperties[K]): void;
    setPropertyOnce<K extends keyof UserProperties>(key: K, value: UserProperties[K]): void;
    updatePlatformSuperProperties(): Promise<void>;
    updateAnonymityFromSettings(pseudonymousOptIn: boolean): Promise<void>;
    startListeningToSettingsChanges(): void;
    setAuthenticationType(authenticationType: Signup["authenticationType"]): void;
    private trackNewUserEvent;
}
