import SettingController from "./SettingController";
import { SettingLevel } from "../SettingLevel";
export default class ThreadBetaController extends SettingController {
    beforeChange(level: SettingLevel, roomId: string, newValue: any): Promise<boolean>;
    onChange(level: SettingLevel, roomId: string, newValue: any): void;
}
