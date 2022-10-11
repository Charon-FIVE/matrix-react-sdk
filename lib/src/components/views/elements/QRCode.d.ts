import * as React from "react";
import { QRCodeSegment, QRCodeRenderersOptions } from "qrcode";
interface IProps extends QRCodeRenderersOptions {
    data: string | QRCodeSegment[];
    className?: string;
}
declare const QRCode: React.FC<IProps>;
export default QRCode;
