import { IntegrationManagerInstance } from "./IntegrationManagerInstance";
export declare class IntegrationManagers {
    private static instance;
    private managers;
    private client;
    private primaryManager;
    static sharedInstance(): IntegrationManagers;
    constructor();
    startWatching(): void;
    stopWatching(): void;
    private compileManagers;
    private setupConfiguredManager;
    private setupHomeserverManagers;
    private setupAccountManagers;
    private onAccountData;
    hasManager(): boolean;
    getOrderedManagers(): IntegrationManagerInstance[];
    getPrimaryManager(): IntegrationManagerInstance;
    openNoManagerDialog(): void;
    showDisabledDialog(): void;
    overwriteManagerOnAccount(manager: IntegrationManagerInstance): Promise<void>;
    /**
     * Attempts to discover an integration manager using only its name. This will not validate that
     * the integration manager is functional - that is the caller's responsibility.
     * @param {string} domainName The domain name to look up.
     * @returns {Promise<IntegrationManagerInstance>} Resolves to an integration manager instance,
     * or null if none was found.
     */
    tryDiscoverManager(domainName: string): Promise<IntegrationManagerInstance>;
}
