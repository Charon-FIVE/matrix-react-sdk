import { PropsWithChildren, ReactNode } from "react";
interface Props {
    title: ReactNode;
    icon?: ReactNode;
    serverPicker: ReactNode;
}
export declare function AuthHeaderDisplay({ title, icon, serverPicker, children }: PropsWithChildren<Props>): JSX.Element;
export {};
