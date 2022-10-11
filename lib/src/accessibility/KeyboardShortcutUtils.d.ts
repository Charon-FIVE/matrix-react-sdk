import { KeyCombo } from "../KeyBindingsManager";
import { IKeyboardShortcuts } from "./KeyboardShortcuts";
/**
 * This function gets keyboard shortcuts that can be consumed by the KeyBindingDefaults.
 */
export declare const getKeyboardShortcuts: () => IKeyboardShortcuts;
/**
 * Gets keyboard shortcuts that should be presented to the user in the UI.
 */
export declare const getKeyboardShortcutsForUI: () => IKeyboardShortcuts;
export declare const getKeyboardShortcutValue: (name: string) => KeyCombo;
export declare const getKeyboardShortcutDisplayName: (name: string) => string | null;
