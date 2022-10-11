import { MatrixClient } from "matrix-js-sdk/src/client";
import { IMatrixClientCreds } from "./MatrixClientPeg";
interface ILoginOptions {
    defaultDeviceDisplayName?: string;
}
interface IPasswordFlow {
    type: "m.login.password";
}
export declare enum IdentityProviderBrand {
    Gitlab = "gitlab",
    Github = "github",
    Apple = "apple",
    Google = "google",
    Facebook = "facebook",
    Twitter = "twitter"
}
export interface IIdentityProvider {
    id: string;
    name: string;
    icon?: string;
    brand?: IdentityProviderBrand | string;
}
export interface ISSOFlow {
    type: "m.login.sso" | "m.login.cas";
    identity_providers?: IIdentityProvider[];
}
export declare type LoginFlow = ISSOFlow | IPasswordFlow;
interface ILoginParams {
    identifier?: object;
    password?: string;
    token?: string;
    device_id?: string;
    initial_device_display_name?: string;
}
export default class Login {
    private hsUrl;
    private isUrl;
    private fallbackHsUrl;
    private flows;
    private defaultDeviceDisplayName;
    private tempClient;
    constructor(hsUrl: string, isUrl: string, fallbackHsUrl?: string, opts?: ILoginOptions);
    getHomeserverUrl(): string;
    getIdentityServerUrl(): string;
    setHomeserverUrl(hsUrl: string): void;
    setIdentityServerUrl(isUrl: string): void;
    /**
     * Get a temporary MatrixClient, which can be used for login or register
     * requests.
     * @returns {MatrixClient}
     */
    createTemporaryClient(): MatrixClient;
    getFlows(): Promise<Array<LoginFlow>>;
    loginViaPassword(username: string, phoneCountry: string, phoneNumber: string, password: string): Promise<IMatrixClientCreds>;
}
/**
 * Send a login request to the given server, and format the response
 * as a MatrixClientCreds
 *
 * @param {string} hsUrl   the base url of the Homeserver used to log in.
 * @param {string} isUrl   the base url of the default identity server
 * @param {string} loginType the type of login to do
 * @param {ILoginParams} loginParams the parameters for the login
 *
 * @returns {MatrixClientCreds}
 */
export declare function sendLoginRequest(hsUrl: string, isUrl: string, loginType: string, loginParams: ILoginParams): Promise<IMatrixClientCreds>;
export {};
