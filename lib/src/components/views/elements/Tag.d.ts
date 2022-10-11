/// <reference types="react" />
interface IProps {
    icon?: () => JSX.Element;
    label: string;
    onDeleteClick?: () => void;
    disabled?: boolean;
}
export declare const Tag: ({ icon, label, onDeleteClick, disabled, }: IProps) => JSX.Element;
export {};
