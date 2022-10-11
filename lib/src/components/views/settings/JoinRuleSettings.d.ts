import { ReactNode } from "react";
import { JoinRule } from "matrix-js-sdk/src/@types/partials";
import { Room } from "matrix-js-sdk/src/models/room";
interface IProps {
    room: Room;
    promptUpgrade?: boolean;
    closeSettingsFn(): void;
    onError(error: Error): void;
    beforeChange?(joinRule: JoinRule): Promise<boolean>;
    aliasWarning?: ReactNode;
}
declare const JoinRuleSettings: ({ room, promptUpgrade, aliasWarning, onError, beforeChange, closeSettingsFn }: IProps) => JSX.Element;
export default JoinRuleSettings;
