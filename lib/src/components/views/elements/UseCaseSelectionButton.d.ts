/// <reference types="react" />
import { UseCase } from "../../../settings/enums/UseCase";
interface Props {
    useCase: UseCase;
    selected: boolean;
    onClick: (useCase: UseCase) => void;
}
export declare function UseCaseSelectionButton({ useCase, onClick, selected }: Props): JSX.Element;
export {};
