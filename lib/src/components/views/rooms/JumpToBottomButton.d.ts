import React from "react";
interface IProps {
    numUnreadMessages?: number;
    highlight: boolean;
    onScrollToBottomClick: (e: React.MouseEvent) => void;
}
declare const JumpToBottomButton: React.FC<IProps>;
export default JumpToBottomButton;
