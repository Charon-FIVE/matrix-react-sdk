import React from "react";
import { KeyCombo } from "../../../KeyBindingsManager";
interface IKeyboardKeyProps {
    name: string;
    last?: boolean;
}
export declare const KeyboardKey: React.FC<IKeyboardKeyProps>;
interface IKeyboardShortcutProps {
    value: KeyCombo;
}
export declare const KeyboardShortcut: React.FC<IKeyboardShortcutProps>;
export {};
