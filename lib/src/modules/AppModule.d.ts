import { RuntimeModule } from "@matrix-org/react-sdk-module-api/lib/RuntimeModule";
import { ModuleFactory } from "./ModuleFactory";
import { ProxiedModuleApi } from "./ProxiedModuleApi";
/**
 * Wraps a module factory into a usable module. Acts as a simple container
 * for the constructs needed to operate a module.
 */
export declare class AppModule {
    /**
     * The module instance.
     */
    readonly module: RuntimeModule;
    /**
     * The API instance used by the module.
     */
    readonly api: ProxiedModuleApi;
    /**
     * Converts a factory into an AppModule. The factory will be called
     * immediately.
     * @param factory The module factory.
     */
    constructor(factory: ModuleFactory);
}
