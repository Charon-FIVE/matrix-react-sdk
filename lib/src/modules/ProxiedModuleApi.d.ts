import { ModuleApi } from "@matrix-org/react-sdk-module-api/lib/ModuleApi";
import { TranslationStringsObject } from "@matrix-org/react-sdk-module-api/lib/types/translations";
import { Optional } from "matrix-events-sdk";
import { DialogProps } from "@matrix-org/react-sdk-module-api/lib/components/DialogContent";
import React from "react";
import { AccountAuthInfo } from "@matrix-org/react-sdk-module-api/lib/types/AccountAuthInfo";
import { PlainSubstitution } from "@matrix-org/react-sdk-module-api/lib/types/translations";
/**
 * Glue between the `ModuleApi` interface and the react-sdk. Anticipates one instance
 * to be assigned to a single module.
 */
export declare class ProxiedModuleApi implements ModuleApi {
    private cachedTranslations;
    /**
     * All custom translations used by the associated module.
     */
    get translations(): Optional<TranslationStringsObject>;
    /**
     * @override
     */
    registerTranslations(translations: TranslationStringsObject): void;
    /**
     * @override
     */
    translateString(s: string, variables?: Record<string, PlainSubstitution>): string;
    /**
     * @override
     */
    openDialog<M extends object, P extends DialogProps = DialogProps, C extends React.Component = React.Component>(title: string, body: (props: P, ref: React.RefObject<C>) => React.ReactNode): Promise<{
        didOkOrSubmit: boolean;
        model: M;
    }>;
    /**
     * @override
     */
    registerSimpleAccount(username: string, password: string, displayName?: string): Promise<AccountAuthInfo>;
    /**
     * @override
     */
    overwriteAccountAuth(accountInfo: AccountAuthInfo): Promise<void>;
    /**
     * @override
     */
    navigatePermalink(uri: string, andJoin?: boolean): Promise<void>;
    /**
     * @override
     */
    getConfigValue<T>(namespace: string, key: string): T;
}
