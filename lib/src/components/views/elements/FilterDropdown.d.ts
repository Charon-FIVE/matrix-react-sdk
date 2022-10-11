import React from 'react';
import { DropdownProps } from './Dropdown';
export declare type FilterDropdownOption<FilterKeysType extends string> = {
    id: FilterKeysType;
    label: string;
    description?: string;
};
declare type FilterDropdownProps<FilterKeysType extends string> = Omit<DropdownProps, 'children'> & {
    value: FilterKeysType;
    options: FilterDropdownOption<FilterKeysType>[];
    selectedLabel?: string;
};
/**
 * Dropdown styled for list filtering
 */
export declare const FilterDropdown: <FilterKeysType extends string = string>({ value, options, selectedLabel, className, ...restProps }: FilterDropdownProps<FilterKeysType>) => React.ReactElement<FilterDropdownProps<FilterKeysType>, string | React.JSXElementConstructor<any>>;
export {};
