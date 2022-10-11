import React from 'react';
interface IProps {
    ts: number;
    onDatePicked?: (dateString: string) => void;
}
declare const JumpToDatePicker: React.FC<IProps>;
export default JumpToDatePicker;
