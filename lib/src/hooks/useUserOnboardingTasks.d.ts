import { ButtonEvent } from "../components/views/elements/AccessibleButton";
import { UseCase } from "../settings/enums/UseCase";
import { UserOnboardingContext } from "./useUserOnboardingContext";
export interface UserOnboardingTask {
    id: string;
    title: string | (() => string);
    description: string | (() => string);
    relevant?: UseCase[];
    action?: {
        label: string;
        onClick?: (ev?: ButtonEvent) => void;
        href?: string;
        hideOnComplete?: boolean;
    };
}
export declare function useUserOnboardingTasks(context: UserOnboardingContext): [UserOnboardingTask[], UserOnboardingTask[]];
