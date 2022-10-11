/// <reference types="react" />
import { UseCase } from "../../../settings/enums/UseCase";
interface Props {
    justRegistered?: boolean;
}
export declare function showUserOnboardingPage(useCase: UseCase): boolean;
export declare function UserOnboardingPage({ justRegistered }: Props): JSX.Element;
export {};
