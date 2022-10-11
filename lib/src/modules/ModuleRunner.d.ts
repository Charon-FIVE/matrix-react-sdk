import { TranslationStringsObject } from "@matrix-org/react-sdk-module-api/lib/types/translations";
import { AnyLifecycle } from "@matrix-org/react-sdk-module-api/lib/lifecycles/types";
import { ModuleFactory } from "./ModuleFactory";
import "./ModuleComponents";
/**
 * Handles and coordinates the operation of modules.
 */
export declare class ModuleRunner {
    static readonly instance: ModuleRunner;
    private modules;
    private constructor();
    /**
     * Resets the runner, clearing all known modules.
     *
     * Intended for test usage only.
     */
    reset(): void;
    /**
     * All custom translations from all registered modules.
     */
    get allTranslations(): TranslationStringsObject;
    /**
     * Registers a factory which creates a module for later loading. The factory
     * will be called immediately.
     * @param factory The module factory.
     */
    registerModule(factory: ModuleFactory): void;
    /**
     * Invokes a lifecycle event, notifying registered modules.
     * @param lifecycleEvent The lifecycle event.
     * @param args The arguments for the lifecycle event.
     */
    invoke(lifecycleEvent: AnyLifecycle, ...args: any[]): void;
}
