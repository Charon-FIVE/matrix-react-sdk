/// <reference types="react" />
import { UseCase } from "../../../settings/enums/UseCase";
interface Props {
    onFinished: (useCase: UseCase) => void;
}
export declare function UseCaseSelection({ onFinished }: Props): JSX.Element;
export {};
