import { RuntimeModule } from "@matrix-org/react-sdk-module-api/lib/RuntimeModule";
import { ModuleApi } from "@matrix-org/react-sdk-module-api/lib/ModuleApi";
export declare class MockModule extends RuntimeModule {
    get apiInstance(): ModuleApi;
    constructor(moduleApi: ModuleApi);
}
export declare function registerMockModule(): MockModule;
