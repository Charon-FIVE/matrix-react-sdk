/// <reference types="react" />
export default function useHover(ignoreHover?: (ev: React.MouseEvent) => boolean): [boolean, {
    onMouseOver: () => void;
    onMouseLeave: () => void;
    onMouseMove: (ev: React.MouseEvent) => void;
}];
