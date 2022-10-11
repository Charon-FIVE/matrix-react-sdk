import { ComponentProps } from 'react';
import { MenuItem } from "../../structures/ContextMenu";
interface ICollapsibleButtonProps extends ComponentProps<typeof MenuItem> {
    title: string;
    iconClassName: string;
}
export declare const CollapsibleButton: ({ title, children, className, iconClassName, ...props }: ICollapsibleButtonProps) => JSX.Element;
export {};
