import { IKeyBindingsProvider, KeyBinding } from "./KeyBindingsManager";
import { CategoryName } from "./accessibility/KeyboardShortcuts";
export declare const getBindingsByCategory: (category: CategoryName) => KeyBinding[];
export declare const defaultBindingsProvider: IKeyBindingsProvider;
