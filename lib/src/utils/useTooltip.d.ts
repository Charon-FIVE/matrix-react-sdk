import { ComponentProps } from "react";
import Tooltip from "../components/views/elements/Tooltip";
interface TooltipEvents {
    showTooltip: () => void;
    hideTooltip: () => void;
}
export declare function useTooltip(props: ComponentProps<typeof Tooltip>): [TooltipEvents, JSX.Element | null];
export {};
