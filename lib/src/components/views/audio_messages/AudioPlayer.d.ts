import { ReactNode } from "react";
import AudioPlayerBase from "./AudioPlayerBase";
export default class AudioPlayer extends AudioPlayerBase {
    protected renderFileSize(): string;
    protected renderComponent(): ReactNode;
}
