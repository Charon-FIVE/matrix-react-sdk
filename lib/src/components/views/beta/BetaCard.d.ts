/// <reference types="react" />
interface IProps {
    title?: string;
    featureId: string;
}
interface IBetaPillProps {
    onClick?: () => void;
    tooltipTitle?: string;
    tooltipCaption?: string;
}
export declare const BetaPill: ({ onClick, tooltipTitle, tooltipCaption, }: IBetaPillProps) => JSX.Element;
declare const BetaCard: ({ title: titleOverride, featureId }: IProps) => JSX.Element;
export default BetaCard;
