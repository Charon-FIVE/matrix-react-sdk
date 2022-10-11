import { FunctionComponent, Key, PropsWithChildren, ReactNode } from "react";
import { ButtonEvent } from "../views/elements/AccessibleButton";
export declare type GenericDropdownMenuOption<T> = {
    key: T;
    label: ReactNode;
    description?: ReactNode;
    adornment?: ReactNode;
};
export declare type GenericDropdownMenuGroup<T> = GenericDropdownMenuOption<T> & {
    options: GenericDropdownMenuOption<T>[];
};
export declare type GenericDropdownMenuItem<T> = GenericDropdownMenuGroup<T> | GenericDropdownMenuOption<T>;
export declare function GenericDropdownMenuOption<T extends Key>({ label, description, onClick, isSelected, adornment, }: GenericDropdownMenuOption<T> & {
    onClick: (ev: ButtonEvent) => void;
    isSelected: boolean;
}): JSX.Element;
export declare function GenericDropdownMenuGroup<T extends Key>({ label, description, adornment, children, }: PropsWithChildren<GenericDropdownMenuOption<T>>): JSX.Element;
declare type WithKeyFunction<T> = T extends Key ? {
    toKey?: (key: T) => Key;
} : {
    toKey: (key: T) => Key;
};
declare type IProps<T> = WithKeyFunction<T> & {
    value: T;
    options: (readonly GenericDropdownMenuOption<T>[] | readonly GenericDropdownMenuGroup<T>[]);
    onChange: (option: T) => void;
    selectedLabel: (option: GenericDropdownMenuItem<T> | null | undefined) => ReactNode;
    onOpen?: (ev: ButtonEvent) => void;
    onClose?: (ev: ButtonEvent) => void;
    className?: string;
    AdditionalOptions?: FunctionComponent<{
        menuDisplayed: boolean;
        closeMenu: () => void;
        openMenu: () => void;
    }>;
};
export declare function GenericDropdownMenu<T>({ value, onChange, options, selectedLabel, onOpen, onClose, toKey, className, AdditionalOptions }: IProps<T>): JSX.Element;
export {};
