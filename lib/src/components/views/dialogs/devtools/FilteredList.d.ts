import React from "react";
interface IProps {
    children: React.ReactElement[];
    query: string;
    onChange(value: string): void;
}
declare const FilteredList: ({ children, query, onChange }: IProps) => JSX.Element;
export default FilteredList;
