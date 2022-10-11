/// <reference types="react" />
import { KeyBindingAction } from "./accessibility/KeyboardShortcuts";
/**
 * Represent a key combination.
 *
 * The combo is evaluated strictly, i.e. the KeyboardEvent must match exactly what is specified in the KeyCombo.
 */
export declare type KeyCombo = {
    key?: string;
    /** On PC: ctrl is pressed; on Mac: meta is pressed */
    ctrlOrCmdKey?: boolean;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
};
export declare type KeyBinding = {
    action: KeyBindingAction;
    keyCombo: KeyCombo;
};
/**
 * Helper method to check if a KeyboardEvent matches a KeyCombo
 *
 * Note, this method is only exported for testing.
 */
export declare function isKeyComboMatch(ev: KeyboardEvent | React.KeyboardEvent, combo: KeyCombo, onMac: boolean): boolean;
export declare type KeyBindingGetter = () => KeyBinding[];
export interface IKeyBindingsProvider {
    [key: string]: KeyBindingGetter;
}
export declare class KeyBindingsManager {
    /**
     * List of key bindings providers.
     *
     * Key bindings from the first provider(s) in the list will have precedence over key bindings from later providers.
     *
     * To overwrite the default key bindings add a new providers before the default provider, e.g. a provider for
     * customized key bindings.
     */
    bindingsProviders: IKeyBindingsProvider[];
    /**
     * Finds a matching KeyAction for a given KeyboardEvent
     */
    private getAction;
    getMessageComposerAction(ev: KeyboardEvent | React.KeyboardEvent): KeyBindingAction | undefined;
    getAutocompleteAction(ev: KeyboardEvent | React.KeyboardEvent): KeyBindingAction | undefined;
    getRoomListAction(ev: KeyboardEvent | React.KeyboardEvent): KeyBindingAction | undefined;
    getRoomAction(ev: KeyboardEvent | React.KeyboardEvent): KeyBindingAction | undefined;
    getNavigationAction(ev: KeyboardEvent | React.KeyboardEvent): KeyBindingAction | undefined;
    getAccessibilityAction(ev: KeyboardEvent | React.KeyboardEvent): KeyBindingAction | undefined;
    getCallAction(ev: KeyboardEvent | React.KeyboardEvent): KeyBindingAction | undefined;
    getLabsAction(ev: KeyboardEvent | React.KeyboardEvent): KeyBindingAction | undefined;
}
export declare function getKeyBindingsManager(): KeyBindingsManager;
