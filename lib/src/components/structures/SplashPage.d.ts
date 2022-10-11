import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
    className?: string;
    children?: ReactNode;
}
export default function SplashPage({ children, className, ...other }: Props): JSX.Element;
export {};
